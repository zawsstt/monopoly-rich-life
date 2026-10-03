/* ============================================================
 * SUPA-RTC —— 联机信令层（Supabase Realtime Broadcast + WebRTC）
 * ------------------------------------------------------------
 * 为什么：原方案 PeerJS 免费云信令（0.peerjs.com）在国内不稳、限流、
 * 无法自管。本层把「信令」搬进自家 Supabase 项目（WebSocket），
 * 「数据」仍走 WebRTC DataChannel P2P 直连（net.js 房主权威逻辑不变）。
 *
 * 拓扑：同一房间码 = 同一 Realtime topic（room:CODE）。
 *  - 房主：rpc mp_room_create 领码 → 监听 sig 广播
 *  - 客人：rpc mp_room_join 领座位 → 广播 hello → 房主定向回 offer
 *  - offer / answer / ice 全部经 sig 广播（带 to 字段定向，非目标端丢弃）
 *  - DataChannel 建立后信令静默；断线重连重新走一遍握手
 *
 * 依赖：window.SB（index.html [SB] 引导段）；无第三方库。
 * ============================================================ */
'use strict';

const SUPA_RTC = (() => {
  const ICE = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun.cloudflare.com:3478' },
  ];
  let ws = null;            // Phoenix WebSocket
  let wsReady = false;
  let topic = '';
  let myId = '';            // 本端信令 id（client_id 截断）
  let refSeq = 1;
  let hbTimer = 0;
  let onSig = null;         // (msg, from) => void：业务层回调（net.js 注册）
  let roomTimer = 0;        // mp_heartbeat 定时
  let curCode = '';
  let amHost = false;
  let playing = false;

  /* ---------- Phoenix WebSocket ---------- */
  function wsConnect(code, cb) {
    wsClose();
    topic = 'room:' + code;
    curCode = code;
    myId = SB.clientId();
    let opened = false;
    try {
      ws = new WebSocket(SB.url.replace(/^http/, 'ws') + '/realtime/v1/websocket?apikey=' + SB.key + '&vsn=1.0.0');
    } catch (e) { cb && cb(e); return; }
    const failTimer = setTimeout(() => { if (!opened) { try { ws.close(); } catch (e) { /* */ } cb && cb(new Error('ws-timeout')); } }, 10000);
    ws.onopen = () => {
      opened = true; clearTimeout(failTimer);
      ws.send(JSON.stringify({
        topic, event: 'phx_join', ref: String(refSeq++),
        payload: {
          access_token: SB.key,
          config: { broadcast: { self: false, ack: false }, presence: { key: myId }, private: false },
        },
      }));
      hbTimer = setInterval(() => {
        try { ws.send(JSON.stringify({ topic: 'phoenix', event: 'heartbeat', payload: {}, ref: String(refSeq++) })); } catch (e) { /* */ }
      }, 25000);
      cb && cb(null);
    };
    ws.onmessage = ev => {
      let d; try { d = JSON.parse(ev.data); } catch (e) { return; }
      /* broadcast 到达的两种形态都兼容：event=sig 或 event=broadcast&&payload.event=sig */
      let sig = null;
      if (d.event === 'sig' && d.payload) sig = d.payload;
      else if (d.event === 'broadcast' && d.payload && d.payload.event === 'sig') sig = d.payload.payload;
      if (sig && onSig && sig.from !== myId && (!sig.to || sig.to === myId)) {
        try { onSig(sig, sig.from); } catch (e) { /* */ }
      }
    };
    ws.onclose = () => {
      opened = false; clearTimeout(failTimer);
      stopRoomHeartbeat();
      if (hbTimer) { clearInterval(hbTimer); hbTimer = 0; }
      const h = handlers.disconnect; if (h) h();
    };
    ws.onerror = () => { if (!opened) { clearTimeout(failTimer); cb && cb(new Error('ws-error')); } };
  }
  function wsClose() {
    if (hbTimer) { clearInterval(hbTimer); hbTimer = 0; }
    stopRoomHeartbeat();
    if (ws) { const w = ws; ws = null; w.onclose = w.onmessage = w.onerror = null; try { w.close(); } catch (e) { /* */ } }
    wsReady = false; topic = '';
  }
  function bcast(msg) {
    if (!ws || ws.readyState !== 1) return false;
    try {
      ws.send(JSON.stringify({ topic, event: 'broadcast', ref: String(refSeq++),
        payload: { type: 'broadcast', event: 'sig', payload: Object.assign({ from: myId }, msg) } }));
      return true;
    } catch (e) { return false; }
  }

  /* ---------- 房间表心跳 ---------- */
  function startRoomHeartbeat() {
    stopRoomHeartbeat();
    roomTimer = setInterval(() => {
      SB.rpc('mp_heartbeat', { p_code: curCode, p_client: SB.clientId(), p_playing: amHost ? playing || null : null })
        .catch(() => { /* 断网容忍 */ });
    }, 20000);
  }
  function stopRoomHeartbeat() { if (roomTimer) { clearInterval(roomTimer); roomTimer = 0; } }

  /* ---------- WebRTC 端 ---------- */
  /* makePeer() → RTCPeerConnection；channel 由调用方创建或由 ondatachannel 接收 */
  function makePeer() {
    const pc = new RTCPeerConnection({ iceServers: ICE, iceCandidatePoolSize: 2 });
    return pc;
  }

  /* ---------- 对外 API ---------- */
  const handlers = {};   // disconnect / 等（NET 层桥接）
  return {
    /* 房主：创建房间（rpc + ws join），cb(code) / errcb(e) */
    hostRoom(theme, maxRounds, startMoney, cb, errcb) {
      amHost = true; playing = false;
      SB.rpc('mp_room_create', { p_host: SB.clientId(), p_theme: theme, p_max_rounds: maxRounds, p_start_money: startMoney })
        .then(code => {
          wsConnect(code, e => {
            if (e) { errcb && errcb(e); return; }
            startRoomHeartbeat();
            cb && cb(code);
          });
        })
        .catch(e => errcb && errcb(e));
    },
    /* 客人：加入房间（rpc 校验 + ws join），cb({seat}) / errcb */
    joinRoom(code, nickname, charId, cb, errcb) {
      amHost = false;
      SB.rpc('mp_room_join', { p_code: code, p_client: SB.clientId(), p_nickname: nickname, p_char_id: charId })
        .then(seat => {
          if (seat == null || seat < 0) { errcb && errcb(new Error('room-full-or-missing')); return; }
          wsConnect(code, e => {
            if (e) { errcb && errcb(e); return; }
            startRoomHeartbeat();
            cb && cb(seat);
          });
        })
        .catch(e => errcb && errcb(e));
    },
    setPlaying(v) { playing = !!v; },
    send: bcast,
    makePeer,
    get myId() { return myId; },
    get code() { return curCode; },
    on(t, fn) { if (t === 'sig') onSig = fn; else handlers[t] = fn; },
    close() {
      if (curCode && amHost) { try { SB.rpc('mp_room_close', { p_code: curCode, p_host: SB.clientId() }).catch(() => {}); } catch (e) { /* */ } }
      amHost = false; playing = false;
      wsClose();
      onSig = null;
    },
  };
})();
