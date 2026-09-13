/* ============================================================
 * 入口：开始界面 / 开局 / 重开
 * ============================================================ */
'use strict';

const main = (() => {
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));

  let selectedChar = CHARACTERS[0].id;
  let aiCount = 3;
  let lastConfig = null;

  function buildCharCards() {
    const wrap = $('#char-grid');
    wrap.innerHTML = '';
    CHARACTERS.forEach((c, i) => {
      const el = document.createElement('div');
      el.className = 'char-card';
      el.style.setProperty('--pc', c.color);
      el.dataset.id = c.id;
      el.innerHTML = `
        <div class="cc-full"><img src="${c.tokenImg}" alt="${c.name}"></div>
        <div class="cc-name">${c.name}</div>
        <div class="cc-title">${c.title}</div>
        <div class="cc-desc">${c.desc}</div>`;
      el.addEventListener('click', () => {
        SFX.click();
        selectedChar = c.id;
        $$('.char-card').forEach(x => x.classList.toggle('sel', x.dataset.id === selectedChar));
      });
      wrap.appendChild(el);
    });
    // 索引挪位：让前 4 个角色分别对应棋子更分散的起手位
    $$('.char-card')[0].classList.add('sel');
  }

  function bindStart() {
    $$('#opt-ai button').forEach(b => b.addEventListener('click', () => {
      aiCount = +b.dataset.n;
      $$('#opt-ai button').forEach(x => x.classList.toggle('on', x === b));
      SFX.click();
    }));
    $('#btn-start').addEventListener('click', () => {
      SFX.unlock();
      startMatch({
        aiCount,
        startMoney: +$('#opt-money').value,
        maxRounds: +$('#opt-rounds').value,
      });
    });
    $('#btn-watch').addEventListener('click', () => {
      SFX.unlock();
      startMatch({ aiCount: 4, startMoney: +$('#opt-money').value, maxRounds: +$('#opt-rounds').value, spectate: true });
    });
  }

  function pickChars(cfg) {
    // 玩家选中的角色排第一位（人类），其余按顺序补足 AI
    const rest = CHARACTERS.map(c => c.id).filter(id => id !== selectedChar);
    // 打乱 AI 阵容让每局不同
    for (let i = rest.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [rest[i], rest[j]] = [rest[j], rest[i]]; }
    if (cfg.spectate) {
      const nPlayers = Math.max(2, Math.min(4, cfg.aiCount + 1));
      const four = [selectedChar, ...rest].slice(0, nPlayers);
      for (let i = four.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [four[i], four[j]] = [four[j], four[i]]; }
      return { chars: four, humanChar: '\u0000none' };
    }
    return { chars: [selectedChar, ...rest.slice(0, cfg.aiCount)], humanChar: selectedChar };
  }

  function startMatch(cfg) {
    const nameEl = document.getElementById('opt-name');
    if (nameEl) {
      const v = nameEl.value.trim();
      if (v) { cfg.nickname = v; try { localStorage.setItem('df_nickname', v); } catch (e) {} }
      else { try { cfg.nickname = localStorage.getItem('df_nickname') || ''; } catch (e) { cfg.nickname = ''; } }
    }

    lastConfig = cfg;
    const { chars, humanChar } = pickChars(cfg);
    $('#start-screen').classList.add('hidden');
    $('#game-screen').classList.remove('hidden');
    G.speed = 1;
    $('#btn-speed').textContent = '1×';
    newGame(chars, humanChar, { startMoney: cfg.startMoney, maxRounds: cfg.maxRounds, nickname: cfg.nickname || '', allMax: cfg.allMax });
    BGM.setMode('game');
    if (cfg.spectate) ui.toast('👀 观战模式：四位 AI 正在对决', '👀');
  }

  function restart() {
    // 同配置再来一局
    G.gameId++;            // 作废所有进行中的异步流程
    G.over = true;
    ui.abortTransient();   // 清理残留过场/等待
    $('#modal-root').innerHTML = '';
    $('#toasts').innerHTML = '';
    setTimeout(() => {
      G.over = false;
      if (lastConfig) startMatch(lastConfig);
    }, 60);
  }

  function backToMenu() {
    G.gameId++;
    G.over = true;
    G.started = false;
    ui.abortTransient();          // 解除掷骰等待 / 点选 / 残留过场
    $('#modal-root').innerHTML = '';
    $('#toasts').innerHTML = '';
    $('#game-screen').classList.add('hidden');
    $('#start-screen').classList.remove('hidden');
    BGM.setMode('menu');
  }

  /* 主菜单 -> 结算面板的返回按钮 */
  function hookGameOver() {
    const orig = ui.showGameOver;
    ui.showGameOver = async (ranking, humanWon) => {
      const r = await orig(ranking, humanWon);
      if (r === 'menu') backToMenu();
      else restart();
    };
  }

  /* 调试参数：?auto=1&rounds=6&money=9000&players=2 直接开局，便于自动化测试 */
  function debugAutostart() {
    const q = new URLSearchParams(location.search);
    if (q.get('auto') !== '1') return;
    window.__auto = 'fired';
    const n = Math.max(2, Math.min(4, +q.get('players') || 4));
    const cfg = {
      aiCount: n - 1,
      startMoney: +q.get('money') || 9000,
      maxRounds: q.get('rounds') != null ? +q.get('rounds') : 6,
      allMax: q.get('allmax') === '1',
      spectate: q.get('watch') === '1',
    };
    if (q.get('speed')) G.speed = Math.max(1, Math.min(2.4, +q.get('speed') || 1));
    selectedChar = q.get('char') || CHARACTERS[0].id;
    setTimeout(() => {
      window.__auto = 'starting';
      try { startMatch(cfg); window.__auto = 'started'; }
      catch (e) { window.__auto = 'err'; window.__autoErr = String(e && e.stack || e); }
      if (q.get('auction') != null && window.__forceAuction) {
        setTimeout(() => { window.__forceAuction(+q.get('auction')); }, 2500);
      }
    }, 300);
  }


  /* ================= 联机对战（PeerJS P2P · 房主权威） ================= */
  const netState = { guests: [], hostRegistered: false, guestRegistered: false };

  function closeLobby() {
    $('#net-lobby').classList.add('hidden');
    if (NET.active) { NET.destroy(); }
  }
  function renderGuests() {
    const box = $('#net-guests');
    if (!netState.guests.length) { box.innerHTML = '<div class="net-hint">等待玩家加入…</div>'; return; }
    box.innerHTML = netState.guests.map(g => {
      const c = CHARACTERS.find(x => x.id === g.charId);
      return `<div class="net-guest"><span>${c.emoji}</span><b>${g.name}</b><span class="dim">已加入（${g.seat + 1} 号位）</span></div>`;
    }).join('');
  }
  function mySide(m) {
    if (NET.isHost) return m.seat === 0;
    return m.from === (window.__myName || '') && m.seat === NET.mySeat;
  }
  function appendChat(m, opts = {}) {
    const feed = $('#chat-feed');
    if (!feed) return;
    const own = opts.own != null ? opts.own : mySide(m);
    const sticker = /^[\u{1F000}-\u{1FAFF}\u{2190}-\u{27BF}\u{FE0F}]+$/u.test(m.text);
    const d = document.createElement('div');
    d.className = 'chat-line ' + (own ? 'own' : 'other');
    if (m.seat >= 0) {
      const p = G.players[m.seat];
      if (p) d.style.setProperty('--pc', playerColor(p));
    }
    d.innerHTML = `<span class="cb">${sticker ? `<span class="sticker">${m.text}</span>` : m.text}</span><b>${m.from}</b>`;
    feed.appendChild(d);
    while (feed.children.length > 60) feed.firstChild.remove();
    feed.scrollTop = feed.scrollHeight;
    if (sticker) stickerPop(m.text, m.from);
  }
  function stickerPop(text, from) {
    const host3d = document.getElementById('board-center');
    if (!host3d) return;
    const d = document.createElement('div');
    d.className = 'sticker-pop';
    d.innerHTML = `<span>${text}</span><i>${from}</i>`;
    host3d.appendChild(d);
    SFX.click();
    setTimeout(() => d.remove(), 1600);
  }
  function chatVisible(v) { $('#chat-panel').classList.toggle('hidden', !v); }

  function registerHostHandlers() {
    if (netState.hostRegistered) return;
    netState.hostRegistered = true;
    NET.on('drop', seat => {
      if (G.started && G.players[seat] && G.players[seat].alive && !G.players[seat].ai) {
        ui.toast(`⚠️ ${pname(G.players[seat])} 连接断开，90 秒内重连可续玩，期间行动将等待`, '⚠️');
      } else if (NET.active) {
        const g = netState.guests.find(x => x.seat === seat);
        if (g) ui.toast(`⚠️ ${g.name} 连接断开，等待重连…`, '⚠️');
      }
    });
    NET.on('waiting', seat => {
      if (G.players[seat]) ui.toast(`⏳ 等待 ${pname(G.players[seat])} 重连响应…`, '⏳');
    });
    NET.on('rejoin', seat => {
      if (G.players[seat]) {
        ui.toast(`✅ ${pname(G.players[seat])} 已重连，对局继续`, '✅');
        NET.broadcast({ t: 'chat', from: '系统', seat: -1, text: `${pname(G.players[seat])} 重新连接成功` });
        appendChat({ from: '系统', text: `${pname(G.players[seat])} 重新连接成功` });
      }
      NET.sendSync();
    });
    NET.on('hello', (m, conn) => {
      const seat = netState.guests.length + 1;
      if (seat > 3) { conn.send(JSON.stringify({ t: 'welcome', seat: -1 })); return seat; }
      const taken = new Set([selectedChar, ...netState.guests.map(g => g.charId)]);
      let cid = (m.charId && !taken.has(m.charId)) ? m.charId : CHARACTERS.find(c => !taken.has(c.id)).id;
      netState.guests.push({ seat, name: m.name || ('玩家' + (seat + 1)), charId: cid });
      renderGuests();
      return { seat, charId: cid };
    });
    NET.on('leave', seat => {
      const g = netState.guests.find(x => x.seat === seat);
      netState.guests = netState.guests.filter(x => x.seat !== seat);
      renderGuests();
      if (G.started && G.players[seat] && G.players[seat].alive) {
        G.players[seat].ai = true;
        G.players[seat].name = null;
        ui.toast(`🌐 ${pname(G.players[seat])} 离开，改由 AI 接管`, '🌐');
        ui.updatePlayers();
      }
    });
    NET.on('chat', appendChat);
    NET.on('roll', m => {
      if (G.started && !G.over && G.players[G.cur] && G.players[G.cur].idx === m.seat) ui.tryFireRoll();
    });
    NET.on('prop', m => {
      const seat = m.seat;
      if (!G.started || G.over || !G.players[G.cur] || G.players[G.cur].idx !== seat) return;
      const p = G.players[seat];
      const gid = G.gameId;
      if (m.key === 'dice') {
        NET.askSeat(seat, { kind: 'number' }).then(v => {
          if (v != null && G.gameId === gid) useProp(gid, p, 'dice', v);
        });
      } else if (m.key === 'shield' || m.key === 'equal') {
        useProp(gid, p, m.key);
      } else {
        ui.toast('该道具需要当面操作，联机版暂不支持', '🚫');
      }
    });
  }
  function showReconnect(text) {
    let ov = document.getElementById('reconnect');
    if (!ov) {
      ov = document.createElement('div');
      ov.id = 'reconnect';
      document.body.appendChild(ov);
    }
    ov.innerHTML = `<div class="rc-box"><div class="rc-spin"></div><div class="rc-t">⚠️ 连接中断</div><div class="rc-s">${text}</div></div>`;
    ov.classList.add('show');
  }
  function hideReconnect() {
    const ov = document.getElementById('reconnect');
    if (ov) ov.remove();
  }
  function guestReconnectLoop() {
    const raw = sessionStorage.getItem('df_mp');
    if (!raw) { showReconnect('会话丢失，请返回主菜单重新加入'); return; }
    const ses = JSON.parse(raw);
    let attempts = 0;
    const tryOnce = () => {
      attempts++;
      showReconnect(`正在重连 ${ses.code}（第 ${attempts} 次尝试）…`);
      registerGuestHandlers();
      NET.join(ses.code, ses.name, null, welcome => {
        if (welcome.seat >= 0) {
          try { sessionStorage.setItem('df_mp', JSON.stringify({ code: ses.code, name: ses.name, seat: welcome.seat, token: welcome.token || ses.token })); } catch (e) { /* */ }
          hideReconnect();
          NET.sendChat('我重新连接上了！');
        } else {
          showReconnect('房间状态异常，请返回主菜单');
        }
      }, () => {
        if (attempts < 8) setTimeout(tryOnce, 2500);
        else showReconnect('多次重连失败：请检查网络后刷新页面重试');
      }, null, st => showReconnect(`正在重连 ${ses.code}（第 ${attempts} 次尝试）…`));
    };
    tryOnce();
  }
  function registerGuestHandlers() {
    if (netState.guestRegistered) return;
    netState.guestRegistered = true;
    NET.on('start', m => guestStart(m));
    NET.on('chat', m => appendChat(m));
    NET.on('hb', () => { window.__mpLastMsg = Date.now(); });
    setInterval(() => {
      if (!NET.active || NET.isHost) return;
      if (Date.now() - (window.__mpLastMsg || 0) > 15000 && G.started && !G.over) {
        window.__mpLastMsg = Date.now();
        showReconnect('网络不稳定，正在尝试恢复连接…');
      }
    }, 3000);
    NET.on('kicked', () => {
      ui.toast('与房主的连接已断开', '🔌');
      window.__netGuest = false;
      hideReconnect();
      guestReconnectLoop();
    });
    NET.on('kicked', () => {
      ui.toast('与房主的连接已断开', '🔌');
      window.__netGuest = false;
      main.backToMenu();
    });
  }
  function guestStart(m) {
    try {
      const ses = JSON.parse(sessionStorage.getItem('df_mp') || 'null');
      if (ses && ses.name) window.__myName = ses.name;
    } catch (e) { /* */ }
    const snap = m.snap;
    G.maxRounds = m.cfg.maxRounds;
    G.players = snap.players.map(sp => Object.assign({ idx: sp.idx }, sp));
    G.tiles = snap.tiles.map(t => ({ owner: t.owner, level: t.level }));
    G.cur = snap.cur; G.round = snap.round; G.pot = snap.pot;
    G.luckyTile = snap.luckyTile; G.blocks = snap.blocks || {}; G.season = snap.season;
    G.started = true; G.over = false; G.speed = 1;
    $('#btn-speed').textContent = '1×';
    $('#start-screen').classList.add('hidden');
    $('#game-screen').classList.remove('hidden');
    chatVisible(true);
    ui.initGameScene();
    SFX.unlock(); BGM.setMode('game');
    ui.toast('🌐 联机对局开始！轮到谁由房主同步', '🌐');
    // 客人的掷骰与道具全部转为操作发往房主
    $('#btn-roll').addEventListener('click', () => { NET.toHost({ t: 'roll' }); });
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault(); e.stopImmediatePropagation();
        NET.toHost({ t: 'roll' });
      }
    }, true);
    wireChatInput();
  }
  function launchNetMatch() {
    const guests = netState.guests.slice(0, 3);
    if (!guests.length) {
      $('.net-hint', $('#net-host-box')).textContent = '还没有玩家加入，请先分享房间码';
      return;
    }
    const chars = [selectedChar];
    const seatsCfg = [{ idx: 0, ai: false, name: null }];
    guests.forEach((g, k) => {
      chars.push(g.charId);
      seatsCfg.push({ idx: k + 1, ai: false, name: g.name });
    });
    const total = Math.min(4, Math.max(1 + guests.length, 1 + aiCount));
    const pool = CHARACTERS.map(c => c.id).filter(id => !chars.includes(id));
    while (chars.length < total && pool.length) {
      chars.push(pool.shift());
      seatsCfg.push({ idx: chars.length - 1, ai: true, name: null });
    }
    lastConfig = { net: true, seats: seatsCfg, chars, startMoney: +$('#opt-money').value, maxRounds: +$('#opt-rounds').value };
    $('#net-lobby').classList.add('hidden');
    $('#start-screen').classList.add('hidden');
    $('#game-screen').classList.remove('hidden');
    chatVisible(true);
    G.speed = 1; $('#btn-speed').textContent = '1×';
    newGame(chars, selectedChar, {
      startMoney: lastConfig.startMoney,
      maxRounds: lastConfig.maxRounds,
      seats: seatsCfg,
    });
    NET.installMirror();
    NET.sendSync();
    NET.broadcast({ t: 'start', cfg: { maxRounds: lastConfig.maxRounds }, snap: NET.snapshot() });
    NET.broadcast({ t: 'chat', from: '系统', seat: -1, text: '对局开始！祝各位发财！' });
    window.__seatCheck = p => !NET.isRemoteSeat(p.idx);
    BGM.setMode('game');
    appendChat({ from: '系统', text: '对局开始！祝各位发财！' });
    wireChatInput();
  }
  function wireChatInput() {
    const feed = $('#chat-emoji');
    if (feed.childElementCount) return;
    ['👍', '😂', '😭', '🎉', '😱', '🔨', '💰', '🙏'].forEach(em => {
      const b = document.createElement('button');
      b.textContent = em;
      b.onclick = () => NET.sendChat(em);
      feed.appendChild(b);
    });
    $('#chat-send').onclick = () => {
      const inp = $('#chat-input');
      const v = inp.value.trim();
      if (v) { NET.sendChat(v); inp.value = ''; }
    };
    $('#chat-input').addEventListener('keydown', e => {
      if (e.key === 'Enter') { const v = $('#chat-input').value.trim(); if (v) { NET.sendChat(v); $('#chat-input').value = ''; } }
    });
  }
  function netLobbyInit() {
    $('#btn-net').addEventListener('click', () => {
      $('#net-lobby').classList.remove('hidden');
      $('#net-chooser').classList.remove('hidden');
      $('#net-host-box').classList.add('hidden');
      $('#net-join-box').classList.add('hidden');
    });
    $('#net-close').addEventListener('click', closeLobby);
    $('#net-cancel').addEventListener('click', closeLobby);
    $('#net-join-cancel').addEventListener('click', closeLobby);
    $('#net-create').addEventListener('click', () => {
      SFX.unlock();
      $('#net-chooser').classList.add('hidden');
      $('#net-host-box').classList.remove('hidden');
      $('#net-code').textContent = '·····';
      netState.guests = [];
      registerHostHandlers();
      NET.host(code => {
        $('#net-code').textContent = code;
        NET.startHeartbeat();
      }, errType => {
        $('#net-code').textContent = '失败';
        $('#net-hint') && 0;
        $('.net-hint', $('#net-host-box')).textContent = '联机服务连接失败（' + errType + '），请检查网络后重试';
      });
    });
    $('#net-launch').addEventListener('click', () => {
      if (!NET.active || !NET.isHost) return;
      launchNetMatch();
    });
    $('#net-join-open').addEventListener('click', () => {
      $('#net-chooser').classList.add('hidden');
      $('#net-join-box').classList.remove('hidden');
      $('#net-waiting').textContent = '加入后将自动分配角色';
    });
    $('#net-join-btn').addEventListener('click', () => {
      const code = $('#net-join-code').value.trim().toUpperCase();
      const name = $('#net-join-name').value.trim() || '客人';
      if (code.length < 4) { $('#net-waiting').textContent = '请输入 5 位房间码'; return; }
      SFX.unlock();
      $('#net-waiting').textContent = '连接中…';
      registerGuestHandlers();
      window.__myName = name;
      NET.join(code, name, null, welcome => {
        if (welcome.seat < 0) { $('#net-waiting').textContent = '房间已满（最多 3 位客人）'; return; }
        window.__netGuest = true;
        try { sessionStorage.setItem('df_mp', JSON.stringify({ code, name, seat: welcome.seat, token: welcome.token || null })); } catch (e) { /* */ }
        const c = CHARACTERS.find(x => x.id === welcome.charId);
        if (welcome.chatLog && welcome.chatLog.length) {
          welcome.chatLog.forEach(cm => appendChat(cm));
        }
        if (welcome.rejoin) {
          $('#net-waiting').innerHTML = '✅ 重连成功，正在恢复对局…';
          $('#net-lobby').classList.add('hidden');
          if (!(G.started && G.players.length)) {
            setTimeout(() => { $('#net-lobby').classList.remove('hidden'); $('#net-waiting').innerHTML = '⚠️ 房主对局状态异常，请让房主重新分享或重建房间'; }, 800);
          }
          return;
        }
        const c2 = c;
        $('#net-waiting').innerHTML = `✅ 已加入！你的角色：<b style="color:${c2.color}">${c2.emoji} ${c2.name}</b>，等待房主开始…`;
      }, errType => {
        $('#net-waiting').textContent = '加入失败：' + errType + '（确认房间码与房主在线）';
      }, null, stage => {
        $('#net-waiting').textContent = '连接中…（第 ' + stage + ' 次尝试）';
      });
    });
  }

  function init() {
    try {
      buildCharCards();
      bindStart();
      ui.bindChrome();
      hookGameOver();
      SFX.loadSamples();
      window.__initStage = 'before-auto';
      netLobbyInit();
      try {
        const ne = document.getElementById('opt-name');
        if (ne) ne.value = localStorage.getItem('df_nickname') || '';
      } catch (e) {}
      const rb = document.getElementById('btn-records');
      if (rb) rb.addEventListener('click', () => ui.showLeaderboard());
            debugAutostart();
      window.__initStage = 'done';
    } catch (e) {
      window.__initErr = String(e && e.stack || e);
      throw e;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
  return { restart, startMatch, backToMenu };
})();
