/* ============================================================
 * NET —— 多人联机（Supabase Realtime 信令 + WebRTC P2P · 房主权威）
 * 拓扑：房主运行完整游戏引擎；客人镜像渲染 + 发送操作
 * 信令：自家 Supabase 项目（supa-rtc.js，Broadcast 频道 room:CODE）
 * 数据：WebRTC DataChannel（reliable/ordered），与原 PeerJS 方案等价
 * ============================================================ */
'use strict';

const NET = (() => {
  let peer = null;              // 兼容旧引用的空壳（PeerJS 已移除）
  let isHost = false;
  let active = false;
  let roomCode = '';
  let mySeat = -1;              // 客人自己的座位
  const conns = new Map();      // seat -> 连接适配对象（房主用）
  const seats = new Map();      // 对端信令id -> seat（房主用）
  let hostConn = null;          // 客人用
  let myName = '玩家';
  const handlers = {};          // user_* 用户回调（NET.on 注册）
  let GH = null;                // 客人内置处理器表
  const seatTokens = new Map(); // token -> seat（房主：重连凭证）
  const disconnected = new Set(); // 房主：断线宽限中的座位
  const dropTimers = new Map();   // 房主：seat -> 宽限到期定时器（到期交 AI）
  const GRACE_MS = 90000;         // 断线宽限 90s（与房主端提示文案一致）
  const pendingBySeat = new Map(); // seat -> [{reqId,payload}]（断线期间的待决请求）
  let chatLog = [];             // 房主：聊天历史（最近 50 条）
  let hbTimer = null;
  let pendingAsks = new Map();  // reqId -> resolve（客人侧等待主机的决策请求）
  let askSeq = 1;
  let syncTimer = null;

  /* ---------- WebRTC 连接适配（原 PeerJS DataConnection 形状） ---------- */
  const peers = new Map();      // 对端信令id -> { pc, dc, conn, pendingIce }（双端共用）
  function makeConn(peerId, dc, pc) {
    const conn = {
      peer: peerId, open: false,
      send(s) { try { if (dc.readyState === 'open') dc.send(s); } catch (e) { /* */ } },
      close() { try { dc.close(); } catch (e) { /* */ } try { pc.close(); } catch (e) { /* */ } },
      ondata: null, onclose: null,
    };
    dc.onopen = () => { conn.open = true; };
    dc.onmessage = ev => { if (conn.ondata) conn.ondata(ev.data); };
    dc.onclose = () => { conn.open = false; if (conn.onclose) conn.onclose(); };
    dc.onerror = () => { /* onclose 随后必到，不重复触发 */ };
    return conn;
  }
  function dropPeer(peerId) {
    const st = peers.get(peerId);
    if (!st) return;
    peers.delete(peerId);
    try { st.pc.close(); } catch (e) { /* */ }
  }
  async function applyIce(st, cand) {
    try { if (st.pc.remoteDescription) await st.pc.addIceCandidate(cand); else (st.pendingIce = st.pendingIce || []).push(cand); } catch (e) { /* */ }
  }
  async function flushIce(st) {
    const q = st.pendingIce || []; st.pendingIce = [];
    for (const c of q) { try { await st.pc.addIceCandidate(c); } catch (e) { /* */ } }
  }

  function stage(t) { try { window.__netStage = t; } catch (e) { /* */ } }

  /* 房主视角：对局是否进行中（G 由 game.js 提供；net.js 单独加载时安全退化） */
  function inGame() {
    try { return typeof G !== 'undefined' && !!G && G.started && !G.over; } catch (e) { return false; }
  }

  /* ---------- 房主 ---------- */
  function host(onReady, onFail) {
    isHost = true; active = true;
    const nc = window.__netCfg || {};
    SUPA_RTC.hostRoom(nc.theme || window.__boardTheme || 'classic', nc.maxRounds || 0, nc.startMoney || 30000, code => {
      roomCode = code;
      onReady(code);
    }, e => { stage('host-fail:' + (e && e.message)); onFail && onFail(String(e && e.message || e)); });
    SUPA_RTC.on('sig', (m, from) => { hostSignal(m, from); });
  }

  /* 房主侧信令处理：hello → 建连；answer/ice → 补全 */
  function hostSignal(m, from) {
    if (m.t === 'hello') {
      /* 同一信令 id 的旧连接（重连）先作废 */
      if (peers.has(from)) dropPeer(from);
      const pc = SUPA_RTC.makePeer();
      const st = { pc, dc: null, conn: null, pendingIce: [] };
      peers.set(from, st);
      const dc = pc.createDataChannel('g', { ordered: true });
      st.dc = dc;
      st.conn = makeConn(from, dc, pc);
      pc.onicecandidate = e => { if (e.candidate) SUPA_RTC.send({ to: from, t: 'ice', cand: e.candidate }); };
      dc.onopen = () => onGuestConnection(st.conn);
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          if (st.conn && st.conn.onclose) st.conn.onclose();
          dropPeer(from);
        }
      };
      pc.createOffer().then(offer => pc.setLocalDescription(offer)).then(() => {
        SUPA_RTC.send({ to: from, t: 'offer', sdp: pc.localDescription });
      }).catch(e => { stage('offer-fail'); dropPeer(from); });
      return;
    }
    const st = peers.get(from);
    if (!st) return;
    if (m.t === 'answer') {
      st.pc.setRemoteDescription(m.sdp).then(() => flushIce(st)).catch(() => { /* */ });
    } else if (m.t === 'ice') {
      applyIce(st, m.cand);
    }
  }

  /* 客人 DataChannel 打开 → 喂入原「peer.on('connection')」处理流程 */
  function onGuestConnection(conn) {
    conn.ondata = raw => {
      let m; try { m = JSON.parse(raw); } catch (e) { return; }
      m.seat = seats.get(conn.peer);
      if (m.t === 'hello') {
        let seat = -1, token = null, rejoin = false, charId = null;
        /* 令牌重连只在对局进行中生效（座位仍属于该玩家）；大厅阶段令牌作废，按新客人重新入座，
         * 避免旧令牌把「已离开又回来的人」塞回一个大厅列表里不存在的座位（开局时会被当成 AI） */
        if (m.token && seatTokens.has(m.token)) {
          if (inGame()) {
            seat = seatTokens.get(m.token);
            token = m.token;
            rejoin = true;
            disconnected.delete(seat);
            if (dropTimers.has(seat)) { clearTimeout(dropTimers.get(seat)); dropTimers.delete(seat); }
            const old = conns.get(seat);
            if (old && old !== conn) { try { seats.delete(old.peer); old.close(); } catch (e) { /* */ } }
            conns.set(seat, conn);
            seats.set(conn.peer, seat);
          } else {
            seatTokens.delete(m.token);
          }
        }
        if (seat < 0) {
          const info = handlers.user_hello ? (handlers.user_hello(m, conn) || {}) : {};
          seat = (typeof info === 'object') ? info.seat : info;
          charId = (typeof info === 'object') ? info.charId : null;
          if (typeof seat !== 'number' || seat < 0 || seat > 3) seat = -1;   // 满员/非法座位硬拒：绝不让幽灵座位进房
          if (seat >= 0) {
            conns.set(seat, conn);
            seats.set(conn.peer, seat);
            /* 同座位旧令牌作废，只保留最新一枚 */
            for (const [tk, s] of seatTokens) { if (s === seat) seatTokens.delete(tk); }
            token = 'tk' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            seatTokens.set(token, seat);
          }
        }
        if (seat >= 0) {
          send(conn, { t: 'welcome', seat, token, rejoin, charId, chatLog: chatLog.slice(-40) });
          if (rejoin) {
            const h = handlers.user_rejoin;
            if (h) h(seat);
            /* 重连者往往是刷新过的空白页：先下发完整开局快照重建棋盘，再补发断线期间挂起的决策 */
            send(conn, { t: 'start', cfg: { maxRounds: G.maxRounds, theme: window.__boardTheme || 'classic' }, snap: snapshot(), rejoin: true });
            const pend = pendingBySeat.get(seat);
            if (pend) { for (const pm of pend) send(conn, pm); }
          }
        }
        return;
      }
      if (m.t === 'reply') { resolveAsk(m.reqId, m.v); return; }
      if (m.t === 'chat') {
        chatLog.push(m);
        if (chatLog.length > 50) chatLog.shift();
        const h = handlers.user_chat;
        if (h) h(m);
        relay(m);
        return;
      }
      const h = handlers['user_' + m.t];
      if (h) h(m);
    };
    conn.onclose = () => {
      const seat = seats.get(conn.peer);
      seats.delete(conn.peer);
      if (seat == null) return;
      if (conns.get(seat) !== conn) return;   /* 该座位已被同一玩家的新连接接管（重连），旧连接关闭不作数 */
      conns.delete(seat);
      if (inGame() && G.players[seat] && G.players[seat].alive && !G.players[seat].ai) {
        /* 对局中的人类座位：进入断线宽限（不立刻交给 AI），决策请求挂起等其重连；
         * 宽限到期仍未回来 → 交 AI 接管并立即放行所有挂起决策（否则整桌卡等 120s 超时） */
        disconnected.add(seat);
        const h = handlers.user_drop;
        if (h) h(seat);
        if (dropTimers.has(seat)) clearTimeout(dropTimers.get(seat));
        dropTimers.set(seat, setTimeout(() => {
          dropTimers.delete(seat);
          if (!disconnected.has(seat)) return;
          disconnected.delete(seat);
          const pend = pendingBySeat.get(seat) || [];
          pendingBySeat.delete(seat);
          pend.forEach(pm => resolveAsk(pm.reqId, null));
          const hl = handlers.user_leave;
          if (hl) hl(seat);
        }, GRACE_MS));
      } else {
        const hl = handlers.user_leave;
        if (hl) hl(seat);
      }
    };
  }

  /* ---------- 客人 ---------- */
  function join(code, name, charId, onReady, onFail, onLobby, onStage) {
    isHost = false; active = true;
    roomCode = String(code || '').toUpperCase().trim();
    myName = name;
    let attempt = 0;
    let failTimer = 0;
    const tryOnce = () => {
      attempt++;
      stage('create#' + attempt);
      if (onStage) try { onStage(attempt); } catch (e) { /* */ }
      GH = guestHandlers();
      /* 房间表入座 + 信令频道 join */
      SUPA_RTC.joinRoom(roomCode, name, charId, seat => {
        stage('room-joined#' + attempt);
        SUPA_RTC.on('sig', (m, from) => guestSignal(m, from, onReady, onFail));
        clearTimeout(failTimer);
        /* 递增超时 10s/16s/28s/28s：弱网（移动 NAT/VPN）与慢 ICE 下短超时会误杀即将建立的连接 */
        failTimer = setTimeout(() => {
          stage('conn-timeout#' + attempt);
          if (attempt < 4) { SUPA_RTC.close(); setTimeout(tryOnce, 600); }
          else onFail && onFail('timeout');
        }, attempt === 1 ? 10000 : attempt === 2 ? 16000 : 28000);
        /* 广播 hello：房主收到后定向回 offer */
        SUPA_RTC.send({ t: 'hello', name, charId, token: (typeof window !== 'undefined' && window.__mpToken) || null });
      }, e => {
        stage('join-fail#' + attempt + ':' + (e && e.message));
        const msg = String(e && e.message || e);
        if (attempt < 3 && msg !== 'room-full-or-missing') { setTimeout(tryOnce, 1000); }
        else onFail && onFail(msg === 'room-full-or-missing' ? 'no-room' : msg);
      });
    };
    tryOnce();
  }

  /* 客人侧信令处理：offer → 应答；ice → 补全 */
  function guestSignal(m, hostId, onReady, onFail) {
    if (m.t === 'offer') {
      /* 重连场景：旧连接先作废 */
      if (peers.has(hostId)) dropPeer(hostId);
      const pc = SUPA_RTC.makePeer();
      const st = { pc, dc: null, conn: null, pendingIce: [] };
      peers.set(hostId, st);
      pc.onicecandidate = e => { if (e.candidate) SUPA_RTC.send({ to: hostId, t: 'ice', cand: e.candidate }); };
      pc.ondatachannel = ev => {
        st.dc = ev.channel;
        st.conn = makeConn(hostId, st.dc, pc);
        hostConn = st.conn;
        st.conn.ondata = raw => {
          let msg; try { msg = JSON.parse(raw); } catch (e) { return; }
          try { window.__mpLastMsg = Date.now(); } catch (e2) { /* */ }
          if (msg.t === 'welcome') {
            mySeat = msg.seat;
            try { window.__mpToken = msg.token || window.__mpToken || null; } catch (e2) { /* */ }
            onReady(msg);
            return;
          }
          if (msg.t === 'ask') { handleAsk(msg); return; }
          const gh = GH && GH[msg.t];
          if (gh) { gh(msg); return; }
          const h = handlers['user_' + msg.t];
          if (h) h(msg);
        };
        st.conn.onclose = () => { stage('conn-close'); handlers.user_kicked && handlers.user_kicked({}); };
      };
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed') { stage('ice-failed'); dropPeer(hostId); }
      };
      pc.setRemoteDescription(m.sdp)
        .then(() => pc.createAnswer())
        .then(ans => pc.setLocalDescription(ans))
        .then(() => {
          stage('answered');
          SUPA_RTC.send({ to: hostId, t: 'answer', sdp: pc.localDescription });
          return flushIce(st);
        })
        .catch(e => { stage('answer-fail'); onFail && onFail('conn'); });
      return;
    }
    const st = peers.get(hostId);
    if (!st) return;
    if (m.t === 'ice') applyIce(st, m.cand);
  }

  /* ---------- 收发 ---------- */
  function send(conn, m) { try { conn.send(JSON.stringify(m)); } catch (e) { /* 忽略 */ } }
  function toSeat(seat, m) { const c = conns.get(seat); if (c) send(c, m); }
  function broadcast(m) { for (const [, c] of conns) send(c, m); }
  function toHost(m) { if (hostConn) send(hostConn, m); }
  function relay(m) { for (const [, c] of conns) send(c, m); }

  /* ---------- 房主：镜像 ui 调用到客人 ---------- */
  /* updatePlayers 不进 MIRROR_FNS：每次 moneyFloat 都触发它，双通道（即时 ui 广播 + 节流 sync）
   * 会把客人端消息量放大数倍——面板状态统一走下方节流全量 sync */
  const MIRROR_FNS = ['log', 'toast', 'news', 'splash', 'moneyFloat', 'floatAt', 'flashTile',
    'setActive', 'setPhase', 'updateHUD', 'renderBlocks', 'rideStart', 'rideEnd', 'propFanfare'];
  let mirrorOrig = null;   // 原始引用表：destroy 时还原，避免包装层跨局残留
  function installMirror() {
    if (ui.__netMirror === true) return;   /* 房主「再来一局」会再次开局：防止二次包裹造成每条消息双发 */
    ui.__netMirror = true;
    mirrorOrig = {};
    MIRROR_FNS.forEach(fn => {
      const orig = ui[fn];
      mirrorOrig[fn] = orig;
      ui[fn] = function (...args) {
        const r = orig.apply(ui, args);
        broadcast({ t: 'ui', fn, args: serializeArgs(fn, args) });
        return r;
      };
    });
    // 格子状态
    const origUpdateTile = ui.updateTile;
    mirrorOrig.updateTile = origUpdateTile;
    ui.updateTile = function (i) {
      origUpdateTile.call(ui, i);
      broadcast({ t: 'tile', idx: i, owner: G.tiles[i].owner, level: G.tiles[i].level });
    };
    // 棋子逐格移动
    const origMove = ui.moveToken;
    mirrorOrig.moveToken = origMove;
    ui.moveToken = async function (p, animate, opts) {
      broadcast({ t: 'step', idx: p.idx, pos: p.pos, animate: !!animate });
      return origMove.call(ui, p, animate, opts);
    };
    // 骰子
    const origDice = ui.rollDice;
    mirrorOrig.rollDice = origDice;
    ui.rollDice = async function (value) {
      broadcast({ t: 'dice', value });
      return origDice.call(ui, value);
    };
    // 卡牌过场（客人本地播放；客人自己的卡可确认）
    const origCard = ui.showCard;
    mirrorOrig.showCard = origCard;
    ui.showCard = function (card, kind, player) {
      broadcast({ t: 'ui', fn: 'showCard', args: [card, kind, player.idx] });
      return origCard.call(ui, card, kind, player);
    };
    // 全量状态同步（节流）
    const origUpdPlayers = ui.updatePlayers;
    mirrorOrig.updatePlayers = origUpdPlayers;
    ui.updatePlayers = function () {
      origUpdPlayers.call(ui);
      if (!syncTimer) syncTimer = setTimeout(() => { syncTimer = null; sendSync(); }, 120);
    };
  }
  function uninstallMirror() {
    if (!mirrorOrig || !ui.__netMirror) return;
    for (const fn in mirrorOrig) ui[fn] = mirrorOrig[fn];
    ui.__netMirror = false;
    mirrorOrig = null;
    if (syncTimer) { clearTimeout(syncTimer); syncTimer = null; }
  }

  function serializeArgs(fn, args) {
    // showCard 的 player / moneyFloat 的 player / propFanfare 的 player 统一降维为 idx，客人侧由 idx 还原
    if (fn === 'showCard') return args.slice(0, 2);
    if (fn === 'propFanfare') return [args[0].idx, args[1]];
    if (fn === 'moneyFloat') return [args[0] && args[0].idx != null ? args[0].idx : args[0], args[1]];   /* 此前整对象直传，客人 G.players[obj] 取空 → 飘字从不显示 */
    return args;
  }

  function snapshot() {
    return {
      players: G.players.map(p => ({
        idx: p.idx, charId: p.charId, name: p.name || null, ai: p.ai,
        money: p.money, pos: p.pos, alive: p.alive, inJail: p.inJail,
        jailTurns: p.jailTurns, skipNext: p.skipNext, detained: !!p.detained, shield: p.shield,
        insurance: !!p.insurance, bailiff: !!p.bailiff, piggy: !!p.piggy,   /* 道具体系 2.0 状态槽：客人面板徽章需同步（公开信息） */
        forcedDice: p.forcedDice, bailCards: p.bailCards, props: p.props,
      })),
      tiles: G.tiles.map(t => ({ owner: t.owner, level: t.level })),
      cur: G.cur, round: G.round, maxRounds: G.maxRounds, pot: G.pot,
      luckyTile: G.luckyTile, blocks: G.blocks, season: G.season,
    };
  }
  function sendSync() { broadcast({ t: 'sync', snap: snapshot() }); }

  /* ---------- 房主：向客人座位发起决策 ---------- */
  function isRemoteSeat(idx) {
    if (!active || !isHost) return false;
    if (conns.has(idx)) return true;
    return disconnected.has(idx);
  }
  function isDisconnected(idx) { return disconnected.has(idx); }
  function isRemoteSeatOnline(idx) { return conns.has(idx); }
  function askSeat(seat, payload) {
    return new Promise(res => {
      const reqId = 'h' + (askSeq++);
      pendingAsks.set(reqId, res);
      const msg = Object.assign({ t: 'ask', reqId }, payload);
      if (conns.has(seat)) {
        toSeat(seat, msg);
      } else {
        // 断线宽限：挂起，重连时重发
        if (!pendingBySeat.has(seat)) pendingBySeat.set(seat, []);
        pendingBySeat.get(seat).push(msg);
        const h = handlers.user_waiting;
        if (h) h(seat);
      }
      setTimeout(() => {
        if (pendingAsks.has(reqId)) {
          pendingAsks.delete(reqId);
          const arr = pendingBySeat.get(seat);
          if (arr) pendingBySeat.set(seat, arr.filter(x => x.reqId !== reqId));
          res(null);
        }
      }, 120000);
    });
  }
  function resolveAsk(reqId, v) {
    const r = pendingAsks.get(reqId);
    if (r) {
      pendingAsks.delete(reqId);
      for (const [, arr] of pendingBySeat) {
        const k = arr.findIndex(x => x.reqId === reqId);
        if (k >= 0) { arr.splice(k, 1); break; }
      }
      r(v);
      return true;
    }
    return false;
  }

  /* ---------- 客人：处理主机的决策请求 ---------- */
  function handleAsk(m) {
    const p = G.players[mySeat] || { charId: 'boss', name: myName };
    const fake = Object.assign({}, p, { ai: false });
    let pr = null;
    if (m.kind === 'choice') pr = ui.choice(m.payload);
    else if (m.kind === 'auction') pr = ui.auctionPrompt(fake, m.payload);
    else if (m.kind === 'sell') pr = ui.sellModal(fake, m.need, m.list);
    else if (m.kind === 'shop') pr = ui.shopModal(fake, key => { toHost({ t: 'reply', reqId: m.reqId, v: { type: 'buy', key } }); return Promise.resolve(true); });
    else if (m.kind === 'number') pr = ui.numberPicker ? ui._numberPicker() : Promise.resolve(null);
    else if (m.kind === 'custody') pr = (window.PSA && PSA.remoteCustody) ? PSA.remoteCustody().then(() => null) : Promise.resolve(null);   // 联机净化心灵：客人本地锁屏
    if (!pr) { toHost({ t: 'reply', reqId: m.reqId, v: null }); return; }
    pr.then(v => {
      if (m.kind === 'shop') { toHost({ t: 'reply', reqId: m.reqId, v: { type: 'close' } }); return; }
      toHost({ t: 'reply', reqId: m.reqId, v });
    });
  }

  /* ---------- 客人：应用主机消息 ---------- */
  function applySnapshot(snap) {
    snap.players.forEach(sp => {
      const p = G.players[sp.idx];
      if (!p) return;
      Object.assign(p, sp);
    });
    snap.tiles.forEach((t, i) => { if (G.tiles[i]) { G.tiles[i].owner = t.owner; G.tiles[i].level = t.level; } });
    G.cur = snap.cur; G.round = snap.round; G.maxRounds = snap.maxRounds;
    G.pot = snap.pot; G.luckyTile = snap.luckyTile; G.blocks = snap.blocks || {};
    G.season = snap.season;
  }
  function applyUi(fn, args) {
    switch (fn) {
      case 'log': case 'toast': case 'news': case 'splash': case 'floatAt':
      case 'setActive': case 'setPhase': case 'updateHUD': case 'updatePlayers':
      case 'renderBlocks': case 'rideStart': case 'rideEnd': case 'flashTile':
        ui[fn].apply(ui, args); break;
      case 'moneyFloat': {
        const p = G.players[args[0]];
        if (p) ui.moneyFloat(p, args[1]);
        break;
      }
      case 'tileFx': ui.tileFx(args[0], args[1]); break;
      case 'propFanfare': {
        const fp = G.players[args[0]];
        if (fp) ui.propFanfare(fp, args[1]);
        break;
      }
      case 'showCard': {
        const [card, kind, idx] = args;
        const p = G.players[idx] || { ai: true, charId: 'boss' };
        ui.showCard(card, kind, { ai: idx !== mySeat, charId: p.charId, name: p.name });
        break;
      }
    }
  }

  /* ---------- 客人侧消息注册 ---------- */
  function guestHandlers() {
    return {
      start: m => {
        const h = handlers.user_start;
        if (h) h(m);
      },
      sync: m => {
        applySnapshot(m.snap);
        ui.updatePlayers(); ui.updateHUD(); ui.updateTileAll(); ui.renderBlocks();
        G.players.forEach(p => { if (p.alive) ui.moveToken(p, false); });
      },
      tile: m => { if (G.tiles[m.idx]) { G.tiles[m.idx].owner = m.owner; G.tiles[m.idx].level = m.level; } ui.updateTile(m.idx); },
      step: m => {
        const p = G.players[m.idx];
        if (!p) return;
        p.pos = m.pos;
        ui.moveToken(p, m.animate);
      },
      dice: m => { ui.rollDice(m.value); },
      ui: m => applyUi(m.fn, m.args),
      chat: m => { const h = handlers.user_chat; if (h) h(m); },
      over: m => { const h = handlers.user_over; if (h) h(m); },
      kicked: (m) => { const h = handlers.user_kicked; if (h) h(m); },
    };
  }

  /* ---------- 聊天 ---------- */
  function sendChat(text) {
    if (isHost) {
      const m = { t: 'chat', from: '房主', seat: 0, text };
      chatLog.push(m);
      if (chatLog.length > 50) chatLog.shift();
      const h = handlers.user_chat;
      if (h) h(m);
      relay(m);
    }
    else toHost({ t: 'chat', from: myName, seat: mySeat, text });
  }

  function startHeartbeat() {
    if (hbTimer) return;
    hbTimer = setInterval(() => { if (active && isHost) broadcast({ t: 'hb' }); }, 4000);
  }

  function destroy() {
    try { uninstallMirror(); } catch (e) { /* */ }
    try { if (typeof SUPA_RTC !== 'undefined') SUPA_RTC.close(); } catch (e) { /* */ }
    peers.forEach(st => { try { st.pc.close(); } catch (e) { /* */ } });
    peers.clear();
    peer = null; active = false; isHost = false;
    conns.clear(); seats.clear(); hostConn = null; mySeat = -1;
    /* 房主重建房间 / 回菜单：清掉上局的重连凭证与宽限状态，避免旧令牌串入新房间 */
    seatTokens.clear(); disconnected.clear();
    dropTimers.forEach(t => clearTimeout(t)); dropTimers.clear();
    pendingBySeat.clear();
    if (hbTimer) { clearInterval(hbTimer); hbTimer = null; }
  }

  return {
    host, join, destroy, startHeartbeat,
    toSeat, broadcast, toHost, sendChat,
    installMirror, sendSync, snapshot, isRemoteSeat, askSeat, resolveAsk,
    guestHandlers,
    on(t, fn) { handlers['user_' + t] = fn; },
    get active() { return active; },
    get isHost() { return isHost; },
    get mySeat() { return mySeat; },
    get code() { return roomCode; },
    get guestCount() { return conns.size; },
    guestInfo() {
      const out = [];
      for (const [seat, c] of conns) out.push({ seat, id: c.peer });
      return out;
    },
  };
})();
