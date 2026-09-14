/* ============================================================
 * NET —— 多人联机（PeerJS P2P · 房主权威）
 * 拓扑：房主运行完整游戏引擎；客人镜像渲染 + 发送操作
 * 信令：PeerJS 免费云（WebRTC DataChannel，GitHub Pages 静态托管可用）
 * ============================================================ */
'use strict';

const NET = (() => {
  const PREFIX = 'dfmon-v1-';
  let peer = null;              // 本端 Peer
  let isHost = false;
  let active = false;
  let roomCode = '';
  let mySeat = -1;              // 客人自己的座位
  const conns = new Map();      // seat -> DataConnection（房主用）
  const seats = new Map();      // connId -> seat（房主用）
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

  function stage(t) { try { window.__netStage = t; } catch (e) { /* */ } }

  function code5() {
    const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 5; i++) s += A[Math.floor(Math.random() * A.length)];
    return s;
  }

  function emit(msg) { const h = handlers['user_' + msg.t]; if (h) h(msg); }

  /* 房主视角：对局是否进行中（G 由 game.js 提供；net.js 单独加载时安全退化） */
  function inGame() {
    try { return typeof G !== 'undefined' && !!G && G.started && !G.over; } catch (e) { return false; }
  }

  /* ---------- 房主 ---------- */
  function host(onReady, onFail) {
    isHost = true; active = true;
    roomCode = code5();
    peer = new Peer(PREFIX + roomCode);
    peer.on('open', () => onReady(roomCode));
    peer.on('error', e => { if (!peer.open) onFail && onFail(e.type); });
    peer.on('connection', conn => {
      conn.on('data', raw => {
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
              send(conn, { t: 'start', cfg: { maxRounds: G.maxRounds }, snap: snapshot(), rejoin: true });
              const pend = pendingBySeat.get(seat);
              if (pend) { for (const pm of pend) send(conn, pm); }
            }
          }
          return;        }
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
      });
      conn.on('close', () => {
        const seat = seats.get(conn.peer);
        seats.delete(conn.peer);
        if (seat == null) return;
        if (conns.get(seat) !== conn) return;   /* 该座位已被同一玩家的新连接接管（重连），旧连接关闭不作数 */
        conns.delete(seat);
        if (inGame() && G.players[seat] && G.players[seat].alive && !G.players[seat].ai) {
          /* 对局中的人类座位：进入断线宽限（不立刻交给 AI），决策请求挂起等其重连；
           * 宽限到期仍未回来 → 交 AI 接管并立即放行所有挂起决策（否则整桌卡等 120s 超时）。
           * 注：原版 handlers.leave 键名与 NET.on 写入的 user_leave 不一致，离席/断线逻辑从未生效 */
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
      });
    });
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
      if (peer) { try { peer.destroy(); } catch (e) { /* */ } peer = null; }
      peer = new Peer();
      let opened = false;
      peer.on('open', () => {
        opened = true;
        stage('peer-open#' + attempt);
        GH = guestHandlers();
        hostConn = peer.connect(PREFIX + roomCode, { reliable: true });
        clearTimeout(failTimer);
        failTimer = setTimeout(() => {
          stage('conn-timeout#' + attempt);
          if (attempt < 3) tryOnce();
          else onFail && onFail('timeout');
        }, 8000);
        hostConn.on('open', () => {
          stage('conn-open#' + attempt);
          clearTimeout(failTimer);
          send(hostConn, { t: 'hello', name, charId, token: (typeof window !== 'undefined' && window.__mpToken) || null });
        });
        hostConn.on('data', raw => {
          let m; try { m = JSON.parse(raw); } catch (e) { return; }
          try { window.__mpLastMsg = Date.now(); } catch (e2) { /* */ }
          if (m.t === 'welcome') {
            mySeat = m.seat;
            try { window.__mpToken = m.token || window.__mpToken || null; } catch (e2) { /* */ }
            onReady(m);
            return;
          }
          if (m.t === 'ask') { handleAsk(m); return; }
          const gh = GH && GH[m.t];
          if (gh) { gh(m); return; }
          const h = handlers['user_' + m.t];
          if (h) h(m);
        });
        hostConn.on('close', () => { stage('conn-close'); handlers.user_kicked && handlers.user_kicked({}); });
        hostConn.on('error', e => {
          stage('conn-err#' + attempt + ':' + (e.type || e));
          clearTimeout(failTimer);
          if (attempt < 3) tryOnce();
          else onFail && onFail('conn');
        });
      });
      peer.on('disconnected', () => stage('signal-lost#' + attempt));
      peer.on('error', e => {
        stage('peer-err#' + attempt + ':' + (e.type || e));
        if (!opened) {
          clearTimeout(failTimer);
          if (attempt < 3) setTimeout(tryOnce, 1000);
          else onFail && onFail(e.type || 'peer-error');
        }
      });
    };
    tryOnce();
  }

  /* ---------- 收发 ---------- */
  function send(conn, m) { try { conn.send(JSON.stringify(m)); } catch (e) { /* 忽略 */ } }
  function toSeat(seat, m) { const c = conns.get(seat); if (c) send(c, m); }
  function broadcast(m) { for (const [, c] of conns) send(c, m); }
  function toHost(m) { if (hostConn) send(hostConn, m); }
  function relay(m) { for (const [, c] of conns) send(c, m); }

  /* ---------- 房主：镜像 ui 调用到客人 ---------- */
  const MIRROR_FNS = ['log', 'toast', 'news', 'splash', 'moneyFloat', 'floatAt', 'flashTile',
    'setActive', 'setPhase', 'updateHUD', 'updatePlayers', 'renderBlocks', 'rideStart', 'rideEnd', 'propFanfare'];
  function installMirror() {
    if (ui.__netMirror === true) return;   /* 房主「再来一局」会再次开局：防止二次包裹造成每条消息双发 */
    ui.__netMirror = true;
    MIRROR_FNS.forEach(fn => {
      const orig = ui[fn];
      ui[fn] = function (...args) {
        const r = orig.apply(ui, args);
        broadcast({ t: 'ui', fn, args: serializeArgs(fn, args) });
        return r;
      };
    });
    // 格子状态
    const origUpdateTile = ui.updateTile;
    ui.updateTile = function (i) {
      origUpdateTile.call(ui, i);
      broadcast({ t: 'tile', idx: i, owner: G.tiles[i].owner, level: G.tiles[i].level });
    };
    // 棋子逐格移动
    const origMove = ui.moveToken;
    ui.moveToken = async function (p, animate, opts) {
      broadcast({ t: 'step', idx: p.idx, pos: p.pos, animate: !!animate });
      return origMove.call(ui, p, animate, opts);
    };
    // 骰子
    const origDice = ui.rollDice;
    ui.rollDice = async function (value) {
      broadcast({ t: 'dice', value });
      return origDice.call(ui, value);
    };
    // 卡牌过场（客人本地播放；客人自己的卡可确认）
    const origCard = ui.showCard;
    ui.showCard = function (card, kind, player) {
      broadcast({ t: 'ui', fn: 'showCard', args: [card, kind, player.idx] });
      return origCard.call(ui, card, kind, player);
    };
    // 全量状态同步（节流）
    const origUpdPlayers = ui.updatePlayers;
    ui.updatePlayers = function () {
      origUpdPlayers.call(ui);
      if (!syncTimer) syncTimer = setTimeout(() => { syncTimer = null; sendSync(); }, 120);
    };
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
        jailTurns: p.jailTurns, skipNext: p.skipNext, shield: p.shield,
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
      kicked: () => { const h = handlers.user_kicked; if (h) h(m); },
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
    try { if (peer) peer.destroy(); } catch (e) { /* */ }
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
