/* ============================================================
 * 界面层（2D 宽幅棋盘版）：棋盘 / 棋子 / CSS 3D 骰子 / 弹窗 / 动画 / 面板
 * ============================================================ */
'use strict';

const ui = (() => {
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const gridPos = GRID_POS;

  const RECTS = [];            // 每格中心坐标（相对棋盘）
  const tokenEls = new Map();  // playerIdx -> element
  let picking = null;          // {filter, resolve}
  let rollResolver = null;
  let diceRot = { x: 0, y: 0 };
  let modalOpen = 0;
  let confettiTimer = null;
  let shopOpen = null;         // 当前打开的道具商店弹窗 { m, resClose, refresh }（同一时刻最多一个）

  /* ================= 界面补充样式（head 注入，不依赖 index.html 改动） ================= */
  let _uixStyleDone = false;
  function uixStyle() {
    if (_uixStyleDone) return;
    _uixStyleDone = true;
    try {
      const st = document.createElement('style');
      st.id = 'uix-style';
      st.textContent = `
/* 羁押隐藏人物：棋子位置保留（transform 驱动 + 警车跟随），只藏角色本体 */
.token.custody .token-inner::before, .token.custody .token-inner img { visibility: hidden !important; }
/* 警车头顶「XX 收押中」提示语（跟随车辆） */
.token .ride-tag { position: absolute; left: 50%; top: -19px; transform: translateX(-50%);
  white-space: nowrap; font: 800 11px/1 "Microsoft YaHei", sans-serif; letter-spacing: 1px;
  color: #ffd76a; background: linear-gradient(180deg, rgba(12,30,20,.94), rgba(6,20,12,.94));
  border: 1px solid rgba(240,180,41,.55); padding: 4px 9px; border-radius: 999px;
  box-shadow: 0 3px 10px rgba(0,0,0,.45); }
/* 购买类弹窗的现金流水行：当前现金 → 购买后余额 */
.m-cash.cash-flow { font-size: 14.5px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  padding: 9px 12px; border-radius: 10px; background: rgba(0,0,0,.22); border: 1px solid rgba(255,255,255,.08); }
.cash-flow .cf-arrow { color: #7d9a86; font-weight: 900; }
.cash-flow .cf-ok { color: #3ddc84; }
.cash-flow .cf-bad { color: #ff6b6b; }
.cash-flow .cf-warn { color: #ff6b6b; font-weight: 800; font-size: 12px; }
/* 玩家面板：净资产（回合上限模式的胜负线）+ 领跑者皇冠 */
.pc-worth { margin-left: auto; font-size: 11px; color: #9fc4a8; white-space: nowrap; letter-spacing: .3px; }
.pc-worth.lead { color: #ffd76a; font-weight: 800; }
/* 认输按钮（重开菜单内） */
.btn.btn-resign { background: rgba(255,107,107,.12); color: #ffb3b3; border: 1px solid rgba(255,107,107,.4); }
.btn.btn-resign[disabled] { opacity: .45; cursor: not-allowed; }
/* 道具体系 2.0：芯片/商店条目按稀有度描边（常见白/精良绿/稀有蓝/史诗紫，与称号五档同色） */
.pchip[data-rarity="1"] { box-shadow: inset 0 0 0 1px rgba(201,214,207,.55); }
.pchip[data-rarity="2"] { box-shadow: inset 0 0 0 1px rgba(95,211,138,.75); }
.pchip[data-rarity="3"] { box-shadow: inset 0 0 0 1px rgba(90,169,255,.8); }
.pchip[data-rarity="4"] { box-shadow: inset 0 0 0 1px rgba(195,123,255,.85); }
.shop-item[data-rarity="2"] .si-info > b { color: #5fd38a; }
.shop-item[data-rarity="3"] .si-info > b { color: #5aa9ff; }
.shop-item[data-rarity="4"] .si-info > b { color: #c37bff; }
.shop-item .si-counter { display: block; font-size: 11px; color: #ffd76a; opacity: .85; margin-top: 2px; }
/* 选人弹窗（窃贼卡/诬陷卡）候选行 */
.pp-row { display: flex; align-items: center; gap: 8px; }
.pp-row img { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; }
.pp-inv { font-size: 12px; opacity: .85; }
`;
      document.head.appendChild(st);
    } catch (e) { /* 无 head 环境（桩测试）忽略 */ }
  }

  /* 购买/交易类弹窗的现金流水行：X=当前现金，Y=支付后余额（不足时红色警示） */
  function cashFlowHTML(p, cost, actionLabel) {
    const after = p.money - cost;
    const short = after < 0;
    return `<div class="m-cash cash-flow">当前现金 <b>${fmt(p.money)}</b>` +
      `<span class="cf-arrow">→</span> <span>${actionLabel || '交易'}后剩</span>` +
      `<b class="${short ? 'cf-bad' : 'cf-ok'}">${fmt(after)}</b>` +
      (short ? '<span class="cf-warn">现金不足！</span>' : '') + `</div>`;
  }

  /* ================= 棋盘构建 ================= */
  function bandSide(side) { return { bottom: 'top', left: 'right', top: 'bottom', right: 'left' }[side]; }


  /* ================= SVG 图标集（高保真矢量，替代 emoji） ================= */
  const ICONS = {
    station: '<svg class="tsvg" viewBox="0 0 48 48"><rect x="12" y="8" width="24" height="26" rx="5" fill="#4a6b8a"/><rect x="16" y="13" width="16" height="9" rx="2" fill="#cfe6f5"/><circle cx="24" cy="30" r="3.4" fill="#ffe9a8"/><rect x="9" y="35" width="30" height="4" rx="2" fill="#7a5230"/><circle cx="16" cy="41" r="3" fill="#2b2f36"/><circle cx="32" cy="41" r="3" fill="#2b2f36"/></svg>',
    power: '<svg class="tsvg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="#f5c542"/><path d="M27 8 L16 27 h7 l-3 13 12-19 h-7 z" fill="#2b2f36"/></svg>',
    water: '<svg class="tsvg" viewBox="0 0 48 48"><path d="M24 5 C24 5 10 22 10 30 a14 14 0 0 0 28 0 C38 22 24 5 24 5z" fill="#4fa8e8"/><path d="M17 30 a7 7 0 0 0 7 7" stroke="#d9f1ff" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
    jail: '<svg class="tsvg" viewBox="0 0 48 48"><rect x="8" y="8" width="32" height="32" rx="4" fill="#8a949e"/><rect x="13" y="13" width="22" height="22" rx="2" fill="#5c6570"/><g stroke="#cfd6dd" stroke-width="2.6"><line x1="18" y1="13" x2="18" y2="35"/><line x1="24" y1="13" x2="24" y2="35"/><line x1="30" y1="13" x2="30" y2="35"/></g></svg>',
    gotojail: '<svg class="tsvg" viewBox="0 0 48 48"><path d="M24 4 L42 11 V24 C42 34 34 41 24 44 C14 41 6 34 6 24 V11 Z" fill="#3d6fb8"/><circle cx="24" cy="20" r="6" fill="#ffd76a"/><path d="M24 26 v10 M17 31 h14" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/></svg>',
    park: '<svg class="tsvg" viewBox="0 0 48 48"><ellipse cx="24" cy="20" rx="15" ry="10" fill="#54b8e8" opacity=".9"/><path d="M20 20 c1-4 7-4 8 0" stroke="#e8f6ff" stroke-width="2.4" fill="none" stroke-linecap="round"/><rect x="21" y="28" width="6" height="9" fill="#9aa7b0"/><ellipse cx="11" cy="34" rx="5" ry="7" fill="#2f9e57"/><ellipse cx="37" cy="34" rx="5" ry="7" fill="#2f9e57"/></svg>',
    shop: '<svg class="tsvg" viewBox="0 0 48 48"><rect x="9" y="20" width="30" height="20" rx="2" fill="#e8d9b0"/><path d="M7 12 h34 l-3 9 H10 z" fill="#ff5964"/><path d="M14 12 l-1 9 M22 12 v9 M30 12 l1 9" stroke="#fff" stroke-width="2.6"/><rect x="20" y="28" width="8" height="12" fill="#7a5230"/></svg>',
    tax: '<svg class="tsvg" viewBox="0 0 48 48"><path d="M12 4 h18 l8 8 v32 H12 z" fill="#f2ede0"/><path d="M30 4 v8 h8" fill="#c9bfa5"/><g stroke="#e5484d" stroke-width="3" stroke-linecap="round"><line x1="17" y1="20" x2="31" y2="34"/><line x1="31" y1="20" x2="17" y2="34"/></g></svg>',
    taxgem: '<svg class="tsvg" viewBox="0 0 48 48"><path d="M14 8 h20 l8 12 -18 22 L6 20z" fill="#4fa8e8"/><path d="M14 8 l10 12 L34 8 M6 20 h36 M24 20 v22" stroke="#bfe4ff" stroke-width="2" fill="none"/></svg>',
    chance: '<svg class="tsvg" viewBox="0 0 48 48"><circle cx="24" cy="24" r="19" fill="#35b58b"/><text x="24" y="33" text-anchor="middle" font-size="26" font-weight="900" fill="#fff" font-family="sans-serif">?</text></svg>',
    destiny: '<svg class="tsvg" viewBox="0 0 48 48"><path d="M12 6 h24 v30 l-6 6 h-24 v-30 z" fill="#efe6cf"/><path d="M30 6 v6 h6" fill="#d8cba6"/><g stroke="#7a6a4f" stroke-width="2.6" stroke-linecap="round"><line x1="17" y1="16" x2="31" y2="16"/><line x1="17" y1="23" x2="31" y2="23"/><line x1="17" y1="30" x2="27" y2="30"/></g><circle cx="35" cy="36" r="9" fill="#a86ac9"/><path d="M31 36 l3 3 5-6" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round"/></svg>',
    start: '<svg class="tsvg" viewBox="0 0 48 48"><path d="M14 6 v38" stroke="#8a5a2e" stroke-width="4" stroke-linecap="round"/><path d="M17 8 h20 l-5 7 5 7 H17z" fill="#ff5964"/></svg>',
  };
  function iconFor(t) {
    if (t.type === 'station') return ICONS.station;
    if (t.type === 'utility') return t.name === '电力公司' ? ICONS.power : ICONS.water;
    if (t.type === 'jail') return ICONS.jail;
    if (t.type === 'gotojail') return ICONS.gotojail;
    if (t.type === 'park') return ICONS.park;
    if (t.type === 'shop') return ICONS.shop;
    if (t.type === 'tax') return t.taxKind === 'income' ? ICONS.tax : ICONS.taxgem;
    if (t.type === 'chance') return ICONS.chance;
    if (t.type === 'destiny') return ICONS.destiny;
    if (t.type === 'start') return ICONS.start;
    return null;
  }

  function tileHTML(t, i) {
    const pos = gridPos(i);
    if (t.type === 'prop') {
      const g = GROUPS[t.group];
      return `<div class="band band-${bandSide(pos.side)}" style="background:${g.color}"></div>
              <div class="bld"></div>
              <div class="tname">${t.name}</div>
              <div class="tprice">${fmt(t.price)}</div>`;
    }
    if (t.type === 'station' || t.type === 'utility') {
      const ico = iconFor(t) || `<span class="tico-emoji">${t.icon}</span>`;
      return `${ico}<div class="tname">${t.name}</div><div class="tprice">${fmt(t.price)}</div>`;
    }
    const ic = iconFor(t);
    if (ic) {
      return pos.side === 'corner'
        ? `<span class="corner-svg">${ic}</span><div class="tname">${t.name}</div>`
        : ic + `<div class="tname">${t.name}</div>`;
    }
    const cls = pos.side === 'corner' ? 'corner-ico' : 'tico-emoji';
    return `<span class="${cls}">${t.icon}</span><div class="tname">${t.name}</div>`;
  }

  function buildBoard() {
    const board = $('#board');
    $$('.tile', board).forEach(e => e.remove());
    BOARD.forEach((t, i) => {
      const pos = gridPos(i);
      const el = document.createElement('div');
      el.className = `tile side-${pos.side} t-${t.type}`;
      el.style.gridRow = pos.r;
      el.style.gridColumn = pos.c;
      el.dataset.idx = i;
      el.innerHTML = tileHTML(t, i);
      el.addEventListener('click', () => onTileClick(i));
      el.addEventListener('mouseenter', (e) => {
        try { showDeedHover(i, el); } catch (err) { window.__errs && window.__errs.push('hover: ' + err.message); }
        try { SFX.tick(); } catch (err) { /* 无声环境忽略 */ }
      });
      el.addEventListener('mouseleave', () => hideDeedHover());
      board.appendChild(el);
    });
    measure();
  }

  /* —— 悬停迷你地契卡（商业级悬停反馈） —— */
  let deedHoverEl = null;
  function showDeedHover(i, tileEl) {
    if (picking || modalOpen > 0) return;
    const t = BOARD[i], st = G.tiles[i];
    if (!deedHoverEl) {
      deedHoverEl = document.createElement('div');
      deedHoverEl.className = 'deed-hover';
      document.body.appendChild(deedHoverEl);
    }
    const g = t.group ? GROUPS[t.group] : null;
    const bandColor = g ? g.color : (t.type === 'station' ? '#7a5230' : t.type === 'utility' ? '#4fa8e8' : '#8a8f98');
    let mid = '';
    if (t.type === 'prop') {
      mid = `<div class="dh-rent">当前租金 <b>${fmt(rentOf(i, st.owner != null ? st.owner : i, st.level))}</b>${st.level ? ' · ' + LEVEL_NAMES[st.level] : '空地'}</div>`;
    } else if (t.type === 'station' || t.type === 'utility') {
      mid = `<div class="dh-rent">购价 <b>${fmt(t.price)}</b></div>`;
    }
    const ownerLine = st.owner != null
      ? `<div class="dh-owner" style="color:${playerColor(G.players[st.owner])}">${pname(G.players[st.owner])} 的产业</div>`
      : (t.type === 'prop' || t.type === 'station' || t.type === 'utility'
        ? `<div class="dh-owner dim">无主之地</div>`
        : `<div class="dh-owner dim">${(tileDesc(t) || '').split(String.fromCharCode(12290))[0]}${String.fromCharCode(12290)}</div>`);
    deedHoverEl.innerHTML = `
      <div class="dh-band" style="background:${bandColor}">${g ? g.name : t.name}</div>
      <div class="dh-name">${t.name}</div>
      ${ownerLine}${mid}`;
    deedHoverEl.classList.add('show');
    const r = tileEl.getBoundingClientRect();
    const w = deedHoverEl.offsetWidth || 180;
    let x = r.left + r.width / 2 - w / 2;
    const stageW = (window.__stage && window.__stage.w) || innerWidth;
    x = Math.max(8, Math.min(stageW - w - 8, x));
    const pos = gridPos(i);
    const y = (pos.side === 'top' || pos.side === 'right') ? r.bottom + 8 : r.top - deedHoverEl.offsetHeight - 8;
    deedHoverEl.style.left = x + 'px';
    deedHoverEl.style.top = Math.max(8, y) + 'px';
  }
  function hideDeedHover() {
    if (deedHoverEl) deedHoverEl.classList.remove('show');
  }

  /* —— 升级烟花：彩色火花 + 金环扩散 —— */
  function fireworkAt(x, y) {
    const colors = ['#ffd76a', '#ff6b6b', '#7ce8a6', '#9fd8ff', '#e79bff'];
    for (let k = 0; k < 26; k++) {
      const sp = document.createElement('div');
      sp.className = 'fw-spark';
      sp.style.left = x + 'px';
      sp.style.top = y + 'px';
      sp.style.background = colors[k % colors.length];
      document.body.appendChild(sp);
      const ang = (k / 26) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 42 + Math.random() * 74;
      sp.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(ang) * dist}px), calc(-50% + ${Math.sin(ang) * dist}px)) scale(.35)`, opacity: 0 },
      ], { duration: 720 + Math.random() * 480, easing: 'cubic-bezier(.1,.8,.3,1)' }).onfinish = () => sp.remove();
    }
    const ring = document.createElement('div');
    ring.className = 'fw-ring';
    ring.style.left = x + 'px';
    ring.style.top = y + 'px';
    document.body.appendChild(ring);
    ring.animate([
      { transform: 'translate(-50%,-50%) scale(.15)', opacity: .95 },
      { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 },
    ], { duration: 680, easing: 'ease-out' }).onfinish = () => ring.remove();
  }
  function fireworkAtTile(idx) {
    const r = RECTS[idx];
    if (!r) return;
    fireworkAt(r.x + r.w / 2 + (window.scrollX || 0), r.y + r.h / 2 + (window.scrollY || 0));
  }

  /* —— 道具使用全局横幅（全场可见） —— */
  function propFanfare(player, key) {
    const P = PROPS[key];
    if (!P) return;
    const root = document.getElementById('board-center');
    if (!root) return;
    const d = document.createElement('div');
    d.className = 'prop-fanfare';
    d.innerHTML = `<span class="pf-ico">${P.icon}</span><span class="pf-txt"><b style="color:${playerColor(player)}">${pname(player)}</b> 使用了 <b>${P.name}</b></span>`;
    root.appendChild(d);
    requestAnimationFrame(() => d.classList.add('show'));
    SFX.card();
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 420); }, 2100);
  }

  /* —— 金币迸溅粒子 —— */
  function burstCoins(x, y, n = 9, good = true) {
    for (let k = 0; k < n; k++) {
      const d = document.createElement('div');
      d.className = 'coin-burst';
      d.textContent = good ? '🪙' : '💸';
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      document.body.appendChild(d);
      const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.4;
      const dist = 46 + Math.random() * 56;
      const dx = Math.cos(ang) * dist;
      const dy = Math.sin(ang) * dist;
      d.animate([
        { transform: 'translate(-50%,-50%) scale(.5)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${0.9 + Math.random() * 0.5})`, opacity: 0 },
      ], { duration: 620 + Math.random() * 320, easing: 'cubic-bezier(.2,.7,.4,1)' })
        .onfinish = () => d.remove();
    }
  }

  function measure() {
    const board = $('#board');
    const br = board.getBoundingClientRect();
    $$('.tile', board).forEach(el => {
      const r = el.getBoundingClientRect();
      RECTS[+el.dataset.idx] = { x: r.left - br.left + r.width / 2, y: r.top - br.top + r.height / 2, w: r.width, h: r.height };
    });
    layoutTokens(false);
  }

  /* ================= 棋子 ================= */
  function tokenOffset(list, k) {
    const n = list.length;
    if (n === 1) return { x: 0, y: 0 };
    const ang = (k / n) * Math.PI * 2 - Math.PI / 2;
    const rad = Math.min(15, 6 + n * 2.4);
    return { x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * 0.8 };
  }

  function placeToken(p, animate) {
    const el = tokenEls.get(p.idx);
    if (!el || !RECTS[p.pos]) return;
    const same = G.players.filter(q => q.alive && q.pos === p.pos);
    const k = same.indexOf(p);
    const off = tokenOffset(same, k);
    const { x, y } = RECTS[p.pos];
    if (!animate) el.style.transition = 'none';
    el.style.transform = `translate(${x + off.x}px, ${y + off.y}px)`;
    el.style.zIndex = 100 + (k % 4);
    if (!animate) requestAnimationFrame(() => { el.style.transition = ''; });
  }

  function layoutTokens(animate = false) {
    G.players.forEach(p => { if (p.alive) placeToken(p, animate); });
  }

  async function moveToken(p, animate) {
    const el = tokenEls.get(p.idx);
    placeToken(p, animate);
    if (animate && el) {
      if (!el.classList.contains('riding')) {
        const inner = el.firstElementChild;
        inner.classList.remove('hop'); void inner.offsetWidth; inner.classList.add('hop');
        SFX.hop();
      }
      await sleep(250);
    }
  }

  function buildTokens() {
    const layer = $('#tokens');
    layer.innerHTML = '';
    tokenEls.clear();
    G.players.forEach(p => {
      const c = charOf(p);
      const el = document.createElement('div');
      el.className = 'token';
      el.style.setProperty('--pc', c.color);
      el.innerHTML = `<div class="token-inner"><img src="${c.tokenImg}" alt="${c.name}" draggable="false"></div>`;
      layer.appendChild(el);
      tokenEls.set(p.idx, el);
      placeToken(p, false);
    });
  }

  function removeToken(p) {
    const el = tokenEls.get(p.idx);
    if (el) { el.classList.add('dead'); setTimeout(() => el.remove(), 900); tokenEls.delete(p.idx); }
  }

  /* ================= 格子状态刷新 ================= */
  function updateTile(i) {
    const t = BOARD[i], st = G.tiles[i];
    const el = $(`.tile[data-idx="${i}"]`);
    if (!el) return;
    el.classList.toggle('lucky', i === G.luckyTile);
    const bld = $('.bld', el);
    if (bld) bld.innerHTML = '';
    el.classList.remove('owned');
    el.style.removeProperty('--oc');
    if (st.owner != null) {
      const c = CHARACTERS.find(x => x.id === G.players[st.owner].charId);
      el.classList.add('owned');
      el.style.setProperty('--oc', c.color);
      if (bld && t.type === 'prop' && st.level > 0) {
        bld.innerHTML = `<img src="assets/img/b_${c.id}_${st.level}.png" alt=""><span class="lv">${st.level >= CFG.MAX_LEVEL ? 'MAX' : 'Lv' + st.level}</span>`;
      }
    }
  }
  function updateTileAll() { BOARD.forEach((_, i) => updateTile(i)); renderBlocks(); }

  function renderBlocks() {
    if (document.body.classList.contains('v3d-on')) return;   // 3D 模式路障由 view3d.rebuildBlocks 负责
    const layer = $('#blocks');
    if (!layer) return;
    layer.innerHTML = '';
    for (const k in G.blocks) {
      const idx = +k;
      const d = document.createElement('img');
      d.src = 'assets/img/block.png';
      d.className = 'blockchip';
      d.style.transform = `translate(${RECTS[idx].x}px, ${RECTS[idx].y}px)`;
      d.title = '路障';
      layer.appendChild(d);
    }
  }

  function flashTile(i) {
    const el = $(`.tile[data-idx="${i}"]`);
    if (!el) return;
    el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
  }

  /* —— 格子级特效：购地/竞得横幅 / 建筑弹出 / 拆除抖动 —— */
  const FX_DUR = { buy: 1000, won: 1000, up: 900, down: 900 };
  function tileFx(idx, kind) {
    const el = $(`.tile[data-idx="${idx}"]`);
    if (!el) return;
    const cls = kind === 'won' ? 'fx-buy' : 'fx-' + kind;
    el.classList.remove('fx-buy', 'fx-up', 'fx-down');
    void el.offsetWidth;
    if (kind === 'firework') { fireworkAtTile(idx); return; }
    if (kind === 'buy' || kind === 'won') {
      const ribbon = document.createElement('div');
      ribbon.className = 'buy-ribbon';
      ribbon.textContent = kind === 'won' ? '🔨 竞得' : '已购入';
      el.appendChild(ribbon);
      setTimeout(() => ribbon.remove(), 1100);
      SFX.click();
      if (RECTS[idx]) burstCoins(RECTS[idx].x + RECTS[idx].w / 2 + (window.scrollX || 0), RECTS[idx].y + RECTS[idx].h / 2 + (window.scrollY || 0));
    }
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), FX_DUR[kind] || 900);
  }

  /* ================= 顶栏 / 中央区 ================= */
  function updateHUD() {
    $('#hud-round').textContent = G.maxRounds > 0
      ? `第 ${Math.min(G.round, G.maxRounds)} / ${G.maxRounds} 回合`
      : `第 ${G.round} 回合 · 不限`;
    $('#pot-value').textContent = fmt(G.pot);
    const chip = $('#hud-season');
    if (chip) {
      chip.innerHTML = G.season ? `${G.season.icon} ${G.season.name}` : '';
      chip.style.display = G.season ? '' : 'none';
    }
  }

  function setActive(idx) {
    $$('#players .pcard').forEach(el => el.classList.toggle('active', +el.dataset.idx === idx));
    const p = G.players[idx];
    $('#center-status').innerHTML = `<span style="color:${playerColor(p)}">${pname(p)}</span> 的回合`;
  }

  function setPhase(phase, player) {
    const btn = $('#btn-roll');
    const status = $('#center-status');
    if (phase === 'preroll') {
      const human = !!(player && !player.ai);
      /* 联机：不是本机掌控的人类座位（房主看客人 / 客人看别人）→ 按钮只作「等待 XX 掷骰」提示、不可点。
       * 此前房主端按钮在客人回合可点 → 房主能替客人掷骰；客人端在所有人类回合都亮着。 */
      let remote = false;
      if (human && NET.active) remote = NET.isHost ? NET.isRemoteSeat(player.idx) : (player.idx !== NET.mySeat);
      btn.classList.toggle('show', human);
      btn.disabled = remote;
      btn.classList.toggle('waiting-remote', remote);
      btn.querySelector('span').textContent = remote ? `等待 ${pname(player)} 掷骰…` : '掷 骰 子';
      if (human && !remote) {
        status.innerHTML = `<span style="color:${playerColor(player)}">${pname(player)}</span>，轮到你了！可先用道具`;
        splash(`<img class="sp-ava" src="${charOf(player).avatarImg}" alt=""> 轮到 <span style="color:${playerColor(player)}">${pname(player)}</span> 出手！`);
      } else if (human) {
        status.innerHTML = `等待 <span style="color:${playerColor(player)}">${pname(player)}</span> 掷骰<span class="dots"><i>.</i><i>.</i><i>.</i></span>`;
      } else {
        status.innerHTML = `<span style="color:${playerColor(player)}">${pname(player)}</span> 思考中<span class="dots"><i>.</i><i>.</i><i>.</i></span>`;
      }
    } else if (phase === 'rolling') {
      btn.classList.remove('show', 'waiting-remote');
      if (player) status.innerHTML = `<span style="color:${playerColor(player)}">${pname(player)}</span> 行动中<span class="dots"><i>.</i><i>.</i><i>.</i></span>`;
    } else {
      btn.classList.remove('show', 'waiting-remote');
    }
    refreshPropChips();
  }

  /* ================= 玩家面板 ================= */
  function buildPlayersPanel() {
    const wrap = $('#players');
    wrap.innerHTML = '';
    G.players.forEach(p => {
      const c = charOf(p);
      const el = document.createElement('div');
      /* 身份角标：AI / 你 / 其他人类（联机客人、同屏玩家）显示其名号，不再人人都是「你」；
       * 同屏多人没有唯一的「我」——「▼ 你」飘带不显示（角标 玩家1/玩家2 已足够区分） */
      const hotseat = !NET.active && G.players.filter(q => !q.ai).length > 1;
      const isMe = NET.active
        ? (NET.isHost ? p.idx === 0 : p.idx === NET.mySeat)
        : (!p.ai && !hotseat);
      const tag = p.ai ? '<i class="pc-ai">AI</i>'
        : hotseat ? `<i class="pc-you">${p.name || ('玩家' + (p.idx + 1))}</i>`
        : (isMe ? '<i class="pc-you">你</i>' : `<i class="pc-you">${p.name || '玩家'}</i>`);
      el.className = 'pcard' + (p.alive ? '' : ' dead') + (isMe ? ' me' : '');
      el.dataset.idx = p.idx;
      el.style.setProperty('--pc', c.color);
      el.innerHTML = `
        <div class="pc-top">
          <div class="pc-avatar"><img src="${c.avatarImg}" alt="${c.name}" draggable="false"></div>
          <div class="pc-info">
            <div class="pc-name">${c.name}${tag}</div>
            <div class="pc-cash" data-cash>${fmt(p.money)}</div>
          </div>
          <div class="pc-badges"></div>
        </div>
        <div class="pc-props"></div>
        <div class="pc-lands"><span class="pc-lands-count" data-lands>0</span> 处产业<span class="pc-dots" data-dots></span>
          <span class="pc-worth" data-worth title="净资产 = 现金 + 地产市值（含建筑）+ 道具半价；回合上限模式按此排名">资产 $0</span></div>`;
      wrap.appendChild(el);
    });
    updatePlayers();
  }

    const lastMoney = {};
  function tweenCash(el, from, to) {
    const t0 = performance.now(), dur = 520;
    el.classList.add(to > from ? 'cash-up' : 'cash-down');
    setTimeout(() => el.classList.remove('cash-up', 'cash-down'), 900);
    (function step(now) {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      const bound = Math.max(Math.abs(from), Math.abs(to));
      const v = from + (to - from) * e;
      el.textContent = fmt(Math.round(Math.max(-bound, Math.min(bound, v))));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function updatePlayers() {
    /* 净资产领跑者（存活者中最高）：回合上限模式的真实胜负线，此前面板只显示现金 + 产业数，领先者不可见 */
    let leadIdx = -1, leadWorth = -Infinity;
    if (typeof netWorth === 'function') {
      G.players.forEach(p => { if (p.alive) { const w = netWorth(p); if (w > leadWorth) { leadWorth = w; leadIdx = p.idx; } } });
    }
    G.players.forEach(p => {
      const el = $(`.pcard[data-idx="${p.idx}"]`);
      if (!el) return;
      const worthEl = $('[data-worth]', el);
      if (worthEl && typeof netWorth === 'function') {
        const isLead = p.alive && p.idx === leadIdx && alivePlayers().length > 1;
        worthEl.textContent = (isLead ? '👑 ' : '') + '资产 ' + fmt(netWorth(p));
        worthEl.classList.toggle('lead', isLead);
      }
      const cashEl = $('[data-cash]', el);
      if (lastMoney[p.idx] !== undefined && lastMoney[p.idx] !== p.money && !p._skipTween) {
        tweenCash(cashEl, lastMoney[p.idx], p.money);
      } else {
        cashEl.textContent = fmt(p.money);
      }
      lastMoney[p.idx] = p.money;
      $('[data-cash]', el).classList.toggle('poor', p.money < 3000);
      $('[data-lands]', el).textContent = BOARD.filter((t, i) => G.tiles[i].owner === p.idx).length;
      const dots = BOARD.map((t, i) => ({ t, i })).filter(x => x.t.type === 'prop' && G.tiles[x.i].owner === p.idx)
        .map(x => `<i style="background:${GROUPS[x.t.group].color}" title="${x.t.name}"></i>`).join('');
      $('[data-dots]', el).innerHTML = dots;
      const badges = [];
      if (!p.alive) badges.push('<span class="bd bd-dead">💀 破产</span>');
      else {
        if (p.inJail) badges.push('<span class="bd bd-jail" title="羁押中：无法行动，交保释金 / 用出狱许可证 / 蹲满回合可出狱">⛓ 羁押中</span>');
        if (p.custody) badges.push('<span class="bd bd-jail bd-psa" title="净化心灵管控中：回合自动跳过，视频/倒计时结束后归队">🧘 净化中</span>');
        if (p.honorTag) badges.push(`<span class="bd bd-dishonor" title="诚信档案：上局逃避净化视频，本局初始资金 −20%">🚫 ${p.honorTag}</span>`);
        if (p.shield) badges.push('<span class="bd bd-glow" title="护身符生效：下一次应付租金免付">🧿</span>');
        if (p.insurance) badges.push('<span class="bd bd-glow" title="保险单生效：名下建筑下一次被拆迁令/市政施工拆除时层数不减">📋</span>');
        if (p.bailiff) badges.push('<span class="bd bd-glow" title="强制收租令待发：下一次收到租金时，租客的护身符失效仍须付租">📢</span>');
        if (p.piggy) badges.push('<span class="bd bd-glow" title="私房钱在库：均富卡结算时保留原现金，不参与均摊">🐷</span>');
        if (p.forcedDice != null) badges.push('<span class="bd" title="遥控骰子已设定">🔮</span>');
        if (p.bailCards > 0) badges.push(`<span class="bd" title="出狱许可证×${p.bailCards}">🎫${p.bailCards}</span>`);
      }
      el.classList.toggle('dead', !p.alive);
      $('.pc-badges', el).innerHTML = badges.join('');
      /* 棋子显隐跟随羁押 / 净化管控状态（出狱 / 联机 sync 快照后自动恢复；押送中 riding 状态由 rideStart/rideEnd 自管） */
      const tok = tokenEls.get(p.idx);
      if (tok && p.alive && !tok.classList.contains('riding')) {
        tok.classList.toggle('custody', !!p.inJail || !!p.custody);
      }
      const pr = $('.pc-props', el);
      if (!p.alive) { pr.innerHTML = ''; return; }
      const chips = Object.keys(PROPS).map(k => {
        const n = p.props[k] || 0;
        if (n <= 0) return '';
        /* 联机客人端只能点自己座位的道具（此前所有人类座位的道具在客人端都亮着，点了也被房主丢弃，纯误导） */
        const mineOnGuest = !window.__netGuest || (NET.active && p.idx === NET.mySeat);
        let usable = !p.ai && p.alive && phaseAllowsProps() && isMyPreRoll(p) && mineOnGuest
          && (!window.__seatCheck || window.__seatCheck(p));
        /* 目标型道具：场上没有合法目标时预置灰（清障车无路障 / 施工令无可加层地 / 窃贼卡无库存对手 / 诬陷卡无可押对手；路障/拆迁令顺带补齐） */
        if (usable && !propHasTarget(k, p)) usable = false;
        const title = `${PROPS[k].name}：${PROPS[k].desc}${PROPS[k].counter ? '（' + PROPS[k].counter + '）' : ''}`;
        return `<button class="pchip" data-prop="${k}" data-rarity="${PROPS[k].rarity || 1}" ${usable ? '' : 'disabled'} title="${title}">${PROPS[k].icon}<b>${n}</b></button>`;
      }).join('');
      pr.innerHTML = chips || '<span class="pc-noprop">暂无道具 · 踩「道具商店」可购买</span>';
    });
    if (shopOpen && shopOpen.refresh) { try { shopOpen.refresh(); } catch (e) { /* ignore */ } }
  }

  function phaseAllowsProps() { return $('#btn-roll').classList.contains('show'); }
  function isMyPreRoll(p) { return G.players[G.cur] === p; }
  function refreshPropChips() { updatePlayers(); }

  /* 需要选格的道具的合法目标判定（本地点选 / 房主校验客人上报的格号 共用同一套规则） */
  function propTargetFilter(key, p) {
    if (key === 'block') return i => G.blocks[i] == null && BOARD[i].type !== 'start' && BOARD[i].type !== 'jail'
      && !G.players.some(q => q && q.alive && q.pos === i);   /* 有人站立的格不放（审计 P0：路障压角色） */
    if (key === 'demo') return i => {
      const st = G.tiles[i];
      return BOARD[i].type === 'prop' && st.owner != null && st.owner !== p.idx && st.level > 0;
    };
    if (key === 'sweeper') return i => G.blocks[i] != null;   /* 场上任意路障（含自己放错位的） */
    if (key === 'rush') {
      const cap = (G.season && G.season.id === 'build') ? 4 : 3;   /* 普通周上限 3 级，建设周可冲 4 级 */
      return i => BOARD[i].type === 'prop' && G.tiles[i].owner === p.idx && (G.tiles[i].level || 0) < cap;
    }
    return null;
  }
  /* 需要选对手玩家的道具（窃贼卡/诬陷卡）的合法目标判定：t 为目标座位号；本地候选列表 / 房主复核共用 */
  function propPlayerFilter(key, p, t) {
    const q = G.players[t];
    if (!q || !q.alive || q === p || q.idx === p.idx) return false;
    if (key === 'thief') return Object.keys(q.props || {}).some(k => k !== 'thief' && (q.props[k] | 0) > 0);   /* 只偷得到非窃贼卡的库存 */
    if (key === 'frame') return !q.inJail;   /* 已在押者不可再押 */
    return false;
  }
  function propNeedsPlayer(key) { return key === 'thief' || key === 'frame'; }
  /* 芯片预置灰用：该道具当前是否存在至少一个合法目标（无目标需求的道具恒为 true） */
  function propHasTarget(key, p) {
    if (propNeedsPlayer(key)) return G.players.some(q => propPlayerFilter(key, p, q.idx));
    const f = propTargetFilter(key, p);
    if (!f) return true;
    for (let i = 0; i < BOARD.length; i++) if (f(i)) return true;
    return false;
  }
  /* 选人弹窗：候选行显示对手头像 + 库存图标（公开信息）；返回座位号或 null */
  function pickPlayer(key, p) {
    const P = PROPS[key] || {};
    const cands = G.players.filter(q => propPlayerFilter(key, p, q.idx));
    if (!cands.length) return Promise.resolve(null);
    const inv = q => Object.keys(q.props || {}).filter(k => (q.props[k] | 0) > 0)
      .map(k => `${PROPS[k].icon}×${q.props[k]}`).join(' ') || '空';
    const choices = cands.map(q => ({
      v: q.idx, kind: 'ghost',
      label: `<span class="pp-row"><img src="${charOf(q).avatarImg}" alt=""><b style="color:${playerColor(q)}">${pname(q)}</b>` +
        (key === 'thief' ? `<span class="pp-inv">${inv(q)}</span>` : `<span class="pp-inv">${fmt(q.money)}</span>`) + '</span>',
    }));
    choices.push({ v: null, label: '取消', kind: 'ghost' });
    return choice({
      title: `${P.icon || ''} ${P.name || '选择目标'}`,
      html: `<p>${key === 'thief' ? '选择要下手的对手（随机偷走其库存 1 件，偷不到窃贼卡）' : '选择要诬陷的对手（立即被警车押送入狱）'}</p>`,
      choices,
    });
  }

  /* 道具点击（事件委托） */
  document.addEventListener('click', async (e) => {
    const chip = e.target.closest('.pchip');
    if (!chip || chip.disabled) return;
    const idx = +chip.closest('.pcard').dataset.idx;
    const p = G.players[idx];
    const key = chip.dataset.prop;
    SFX.click();
    const PICK_HINT = { block: '🚧 选择放置路障的格子', demo: '💣 选择要拆除的对手建筑', sweeper: '🚛 选择要拆除的路障', rush: '🏗️ 选择要加急施工的自有地块' };
    if (window.__netGuest) {
      /* 联机客人：选格/选人类道具先在本地点选目标，再把目标上报房主校验执行（随机结果只在房主侧产生） */
      const f = propTargetFilter(key, p);
      if (f) {
        const t = await pickTile(f, PICK_HINT[key]);
        if (t == null) return;
        NET.toHost({ t: 'prop', key, idx: p.idx, arg: t });
      } else if (propNeedsPlayer(key)) {
        const t = await pickPlayer(key, p);
        if (t == null) return;
        NET.toHost({ t: 'prop', key, idx: p.idx, arg: t });
      } else {
        NET.toHost({ t: 'prop', key, idx: p.idx });
      }
      return;
    }
    const gid = G.gameId;
    if (key === 'dice') {
      const v = await numberPicker();
      if (v == null || gid !== G.gameId) return;
      await useProp(gid, p, 'dice', v);
    } else if (propTargetFilter(key, p)) {
      const t = await pickTile(propTargetFilter(key, p), PICK_HINT[key]);
      if (t == null || gid !== G.gameId) return;
      await useProp(gid, p, key, t);
    } else if (propNeedsPlayer(key)) {
      const t = await pickPlayer(key, p);
      if (t == null || gid !== G.gameId) return;
      await useProp(gid, p, key, t);
    } else {
      await useProp(gid, p, key);
    }
    ui.updatePlayers();
  });

  /* ================= CSS 3D 骰子 ================= */
  /* 展示倾角：正对相机的立方体只剩一张平面（跟随视角里像一张白纸），固定叠一个俯视 + 侧转，
   * 让顶面和一个侧面始终露出来读出立体；点数面对齐由后面的 rotateX/rotateY 负责，二者相互独立 */
  const DICE_TILT = 'rotateX(-22deg) rotateY(28deg) ';
  function buildDice() {
    const d = $('#dice3d');
    d.innerHTML = '';
    for (let n = 1; n <= 6; n++) {
      const f = document.createElement('div');
      f.className = `df df${n}`;
      f.style.backgroundImage = `url(assets/img/dice${n}.png)`;
      d.appendChild(f);
    }
    d.parentElement.classList.remove('rolling');
    d.style.transform = DICE_TILT + 'rotateX(0deg) rotateY(0deg)';
  }

  const FACE_ROT = { 1: [0, 0], 2: [0, -90], 3: [0, -180], 4: [0, -270], 5: [-90, 0], 6: [90, 0] };

  async function rollDice(value) {
    const wrap = $('#dice-wrap');
    const d = $('#dice3d');
    wrap.classList.add('rolling');
    SFX.dice();
    // 一次到位：预计算目标面 + 整圈增量，单段缓动，落定不再补转
    // 过渡时长随速度缩放（与 sleep 同步），保证 await 结束时 CSS 旋转已定格
    const [fx, fy] = FACE_ROT[value];
    const spinX = 360 * (2 + rnd(2));
    const spinY = 360 * (3 + rnd(2));
    diceRot.x = Math.ceil(diceRot.x / 360) * 360 + spinX + fx;
    diceRot.y = Math.ceil(diceRot.y / 360) * 360 + spinY + fy;
    const cssMs = Math.max(120, 1050 / Math.max(0.1, G.speed || 1));
    d.style.transition = `transform ${cssMs}ms cubic-bezier(.22,.68,.16,1)`;
    d.style.transform = DICE_TILT + `rotateX(${diceRot.x}deg) rotateY(${diceRot.y}deg)`;
    await sleep(1080);
    wrap.classList.remove('rolling');
    // 结果停留 ≥0.9s/spd：骰子定格在点数面上，让玩家看清后再让角色移动
    // （v3d 模式下桥接取两边 Promise 最长者，停留节奏一致）
    await sleep(900);
  }

  function waitRoll() {
    return new Promise(res => { rollResolver = res; });
  }
  /* 是否正在等待人类掷骰（game.js canResign 用：只有这个窗口 + 别人的回合允许认输） */
  function rollPending() { return !!rollResolver; }
  function cancelRollFor(p) {
    if (rollResolver && G.players[G.cur] === p) {
      const r = rollResolver; rollResolver = null;
      $('#btn-roll').classList.remove('show');
      r(-1);
    }
  }
  function tryFireRoll() {
    if (rollResolver && !$('#btn-roll').disabled && $('#btn-roll').classList.contains('show')) {
      const r = rollResolver; rollResolver = null;
      $('#btn-roll').disabled = true;
      SFX.click();
      r(1 + rnd(6));
    }
  }
  /* 房主代远程座位掷骰（客人发来 roll 指令）：不受本机按钮 disabled 状态限制，但只在轮到该座位且正等待掷骰时生效 */
  function fireRemoteRoll(seat) {
    if (!rollResolver || !G.players[G.cur] || G.players[G.cur].idx !== seat) return false;
    const r = rollResolver; rollResolver = null;
    const btn = $('#btn-roll');
    btn.disabled = true; btn.classList.remove('show', 'waiting-remote');
    SFX.click();
    r(1 + rnd(6));
    return true;
  }

  /* ================= 飘字 / 提示 ================= */
  function moneyFloat(p, delta) {
    const el = tokenEls.get(p.idx);
    if (!el || delta === 0) { updatePlayers(); return; }
    const m = el.getBoundingClientRect();
    floatText(m.left + m.width / 2, m.top - 6, (delta > 0 ? '+' : '-') + '$' + Math.abs(delta).toLocaleString('en-US'), delta > 0 ? '#3ddc84' : '#ff6b6b');
    updatePlayers();
  }

  function floatAt(idx, text, color) {
    const r = RECTS[idx];
    if (!r) return;
    const br = $('#board').getBoundingClientRect();
    floatText(br.left + r.x, br.top + r.y - 14, text, color || '#ffd166');
  }

  function floatText(x, y, text, color) {
    const d = document.createElement('div');
    d.className = 'float-txt';
    d.textContent = text;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.color = color;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1300);
  }

  function toast(text, icon = '💬') {
    const root = $('#toasts');
    if (!root) return;
    const d = document.createElement('div');
    d.className = 'toast';
    d.innerHTML = `<span class="t-ico">${icon}</span><span class="t-txt">${text}</span>`;
    root.appendChild(d);
    while (root.children.length > 3) root.firstChild.remove();
    setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 350); }, 2300);
  }

  /* ================= 全局播报条（HUD 下方；队列轮播，超长文案自动横向滚动） =================
   * game.js 的 pickSeason / 里程碑 / 拍卖 / 破产等全局事件经 ui.news() 进入队列，逐条淡入停留淡出；
   * 队列排空后最后一条常驻（本期事件因此整回合可见）。toast 保持原样不受影响。 */
  const NT = { q: [], busy: false, timer: null, seq: 0 };
  const NT_MAX_Q = 6;
  function ntRoot() { return document.getElementById('news-ticker'); }
  function ntRenderQueue() {
    const q = document.getElementById('nt-q');
    if (!q) return;
    q.innerHTML = NT.q.map(() => '<i class="on"></i>').join('');
  }
  function ntShow(text) {
    const bar = ntRoot();
    if (!bar) return;
    const view = bar.querySelector('.nt-view');
    const old = bar.querySelector('.nt-msg');
    const mySeq = ++NT.seq;
    const swap = () => {
      if (mySeq !== NT.seq) return;
      const n = document.createElement('span');
      n.className = 'nt-msg'; n.id = 'nt-msg';
      n.innerHTML = text;
      if (old && old.parentNode) old.replaceWith(n); else if (view) view.appendChild(n);
      bar.classList.remove('idle');
      bar.classList.add('flash');
      setTimeout(() => bar.classList.remove('flash'), 650);
      /* 超出可视宽度：横向匀速滚动到尾部再停留 */
      let hold = 4200;
      try {
        const over = n.scrollWidth - (view ? view.clientWidth : 0);
        if (view && over > 8) {
          const dur = Math.max(2800, over * 26);
          n.style.setProperty('--nt-dx', (-over - 10) + 'px');
          n.style.setProperty('--nt-dur', dur + 'ms');
          n.classList.add('scroll');
          hold = dur + 2400;
        }
      } catch (e) { /* 无布局环境 */ }
      clearTimeout(NT.timer);
      NT.timer = setTimeout(ntNext, hold);
    };
    if (old && !bar.classList.contains('idle')) {
      old.classList.add('out');
      setTimeout(swap, 240);
    } else swap();
  }
  function ntNext() {
    if (!NT.q.length) { NT.busy = false; ntRenderQueue(); return; }
    NT.busy = true;
    const text = NT.q.shift();
    ntRenderQueue();
    ntShow(text);
  }
  function ntReset() {
    NT.q.length = 0; NT.busy = false; NT.seq++;
    clearTimeout(NT.timer); NT.timer = null;
    const bar = ntRoot();
    if (!bar) return;
    bar.classList.add('idle'); bar.classList.remove('flash');
    const view = bar.querySelector('.nt-view');
    if (view) view.innerHTML = '<span class="nt-msg" id="nt-msg">富贵人生 · 掷骰买地，坐地收租</span>';
    ntRenderQueue();
  }
  function news(text) {
    if (!ntRoot()) return;
    NT.q.push(String(text == null ? '' : text));
    while (NT.q.length > NT_MAX_Q) NT.q.shift();
    ntRenderQueue();
    if (!NT.busy) ntNext();
  }

  function splash(html) {
    const root = $('#splash');
    if (!root) return;
    root.innerHTML = `<div class="sp">${html}</div>`;
    clearTimeout(splash._t);
    splash._t = setTimeout(() => { root.innerHTML = ''; }, 950);
  }

  const LOG_ICON = { turn: '🎯', dice: '🎲', buy: '🏷️', build: '🏗️', bad: '💔', good: '✨', info: '・', pay: '💸' };
  function log(html, kind = 'info') {
    const feed = $('#log-feed');
    const d = document.createElement('div');
    d.className = 'logline lk-' + kind;
    d.innerHTML = `<span class="li">${LOG_ICON[kind] || '・'}</span><span>${html}</span>`;
    feed.appendChild(d);
    while (feed.children.length > 80) feed.firstChild.remove();
    feed.scrollTop = feed.scrollHeight;
  }

  /* ================= 弹窗系统 ================= */
  /* 排行榜样式 */
  if (!document.getElementById('lb-style')) {
    const st = document.createElement('style'); st.id = 'lb-style';
    st.textContent = '.lb-tabs{display:flex;gap:8px;margin:10px 0}.lb-tab{flex:1;padding:9px 6px;border-radius:9px;border:1px solid rgba(240,180,41,.3);'
      + 'background:rgba(255,255,255,.05);color:#cfe0d2;font:700 13px "Microsoft YaHei",sans-serif;cursor:pointer}'
      + '.lb-tab.on{background:linear-gradient(180deg,#ffd76a,#f0a429);color:#3a2600;border-color:transparent}'
      + '.lb-body{min-width:400px}'
      + '.lb-row{display:grid;grid-template-columns:28px 1fr 64px 84px;align-items:center;gap:10px;padding:8px 12px;border-radius:9px;margin-bottom:6px;background:rgba(255,255,255,.045)}'
      + '.lb-row.lb-head{background:rgba(240,180,41,.14);color:#ffe9a8;font-weight:800;font-size:12px;letter-spacing:1px}'
      + '.lb-row .lb-rk{font-weight:900;text-align:center;font-size:14px}.lb-row .lb-name{font-weight:800;color:#eef7ee;min-width:0}'
      + '.lb-row .lb-char{color:#8aa891;font-size:12px}.lb-row .lb-val{font-weight:900;color:#ffd76a;text-align:right;font-variant-numeric:tabular-nums}'
      + '.lb-rk.top1{color:#ffd76a}.lb-rk.top2{color:#cfd8e3}.lb-rk.top3{color:#e8a56b}';
    document.head.appendChild(st);
  }
  function buildModal(inner, cls = '') {
    const root = $('#modal-root');
    const wrap = document.createElement('div');
    wrap.className = 'modal-mask ' + cls;
    wrap.innerHTML = `<div class="modal">${inner}</div>`;
    root.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('show'));
    modalOpen++;
    return {
      el: wrap,
      close() { modalOpen--; wrap.classList.remove('show'); setTimeout(() => wrap.remove(), 240); },
    };
  }

  function choice({ title, html, choices }) {
    return new Promise(res => {
      const m = buildModal(`
        <div class="m-title">${title}</div>
        <div class="m-body">${html}</div>
        <div class="m-actions"></div>`);
      const act = $('.m-actions', m.el);
      choices.forEach(c => {
        const b = document.createElement('button');
        b.className = 'btn btn-' + (c.kind || 'ghost');
        b.innerHTML = c.label;
        b.onclick = () => { SFX.click(); m.close(); res(c.v); };
        act.appendChild(b);
      });
    });
  }

  /* 抽卡全屏过场（26 卡主题） */
  function showCard(card, kind, player) {
    return new Promise(res => {
      /* 自动收起：AI 的卡；以及房主端看到的「联机客人」的卡——客人在自己屏幕确认，房主不该替他按确认才放行整桌
       * （此前 player.ai=false 的远程座位让房主必须逐张点掉客人的卡，否则回合流卡住） */
      const remoteHuman = !player.ai && NET.active && NET.isHost && player.idx != null && NET.isRemoteSeat(player.idx);
      const isAI = player.ai || remoteHuman;
      const cut = card.cut || { fx: 'pulse', bg: 'gold' };
      const label = kind === 'chance' ? '机 会 卡' : '命 运 快 报';
      let rain = '';
      if (cut.rain) {
        let spans = '';
        for (let i = 0; i < 15; i++) {
          const left = (Math.random() * 96).toFixed(1);
          const delay = (Math.random() * 1.8).toFixed(2);
          const dur = (2 + Math.random() * 1.8).toFixed(2);
          const size = (20 + Math.random() * 34).toFixed(0);
          spans += `<span style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;font-size:${size}px">${cut.rain}</span>`;
        }
        rain = `<div class="cs-rain">${spans}</div>`;
      }
      const arrow = cut.fx === 'rise' ? '<span class="cs-arrow up">▲</span>'
                  : cut.fx === 'fall' ? '<span class="cs-arrow down">▼</span>' : '';
      const root = document.createElement('div');
      root.id = 'cutscene';
      root.className = 'cs-card cs-bg-' + (cut.bg || 'gold');
      root.innerHTML = `
        ${rain}
        <div class="cs-inner">
          <div class="cs-label">${label}</div>
          <div class="cs-big fx-${cut.fx || 'pulse'}">${arrow}<span class="cs-emoji">${cut.sprite || card.icon}</span></div>
          <div class="cs-ctitle">${card.title}</div>
          <div class="cs-cdesc">${card.desc}</div>
          <div class="cs-player">→ <b style="color:${playerColor(player)}">${pname(player)}</b>${kind === 'chance' ? '' : ' · 全场新闻'}</div>
          <button class="btn btn-primary" id="cs-ok">确 认</button>
        </div>`;
      document.body.appendChild(root);
      requestAnimationFrame(() => root.classList.add('show'));
      SFX.card();
      let done = false;
      const onKey = (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault(); e.stopPropagation();
          SFX.click(); finish();
        }
      };
      const finish = () => {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', onKey, true);
        root.classList.remove('show');
        setTimeout(() => root.remove(), 320);
        res();
      };
      $('#cs-ok', root).onclick = (e) => { e.stopPropagation(); SFX.click(); finish(); };
      root.onclick = (e) => { if (e.target === root) { SFX.click(); finish(); } };
      document.addEventListener('keydown', onKey, true);
      if (isAI) setTimeout(finish, 2700 / Math.max(1, G.speed * 0.8));
      setTimeout(() => {
        if (card.money > 0 || card.global > 0 || card.potWin || card.mostBuilds > 0) SFX.win();
        else if (card.money < 0 || card.global < 0 || card.mostBuilds < 0) SFX.pay();
      }, 480);
    });
  }

  /* 逮捕全屏过场 */
  const POLICE_SVG = `
  <svg viewBox="0 0 230 120" class="police-car">
    <g class="pc-bounce">
      <g class="lightbar">
        <rect class="lb lb-red"   x="96" y="8"  width="18" height="12" rx="3"/>
        <rect class="lb lb-blue"  x="116" y="8" width="18" height="12" rx="3"/>
        <rect x="92" y="18" width="46" height="5" rx="2" fill="#2c3540"/>
      </g>
      <path d="M18 78 C20 60 34 52 62 50 L88 34 C96 28 108 26 130 26 L156 28 C176 30 190 40 200 52 C212 54 218 60 218 70 L218 84 C218 90 214 94 208 94 L28 94 C22 94 18 90 18 84 Z"
            fill="#f2f5f7" stroke="#c3ccd4" stroke-width="3"/>
      <path d="M96 34 C102 30 112 30 126 30 L126 48 L90 48 Z" fill="#39536b"/>
      <path d="M134 30 C150 30 164 34 176 46 L138 46 L134 30 Z" fill="#39536b"/>
      <rect x="20" y="56" width="196" height="14" fill="#27415e"/>
      <text x="118" y="67" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" letter-spacing="4">POLICE</text>
      <rect x="212" y="60" width="8" height="8" rx="2" fill="#ffe9a8"/>
      <rect x="18" y="60" width="6" height="8" rx="2" fill="#ff8d8d"/>
      <g class="wheel">
        <circle cx="66" cy="94" r="16" fill="#22282e"/>
        <circle cx="66" cy="94" r="8" fill="#8a949e"/>
      </g>
      <g class="wheel">
        <circle cx="172" cy="94" r="16" fill="#22282e"/>
        <circle cx="172" cy="94" r="8" fill="#8a949e"/>
      </g>
    </g>
  </svg>`;

  function arrestCutscene(player, reason) {
    return new Promise(res => {
      const c = charOf(player);
      const root = document.createElement('div');
      root.id = 'cutscene';
      root.innerHTML = `
        <div class="cs-strobe strobe-r"></div>
        <div class="cs-strobe strobe-b"></div>
        <div class="cs-inner">
          ${POLICE_SVG}
          <div class="cs-line">
            <img class="cs-pose" src="${c.poseHit || c.avatarImg}" alt="" draggable="false">
            <div class="cs-texts">
              <div class="cs-title">现 场 逮 捕 ！</div>
              <div class="cs-name" style="color:${c.color}">${c.name}</div>
              <div class="cs-sub">🚨 ${reason || "涉嫌非法飙车 · 押送监狱服刑"}</div>
            </div>
          </div>
          <div class="cs-skip">点击任意处或按空格跳过</div>
        </div>`;
      document.body.appendChild(root);
      requestAnimationFrame(() => root.classList.add('show'));
      SFX.siren();
      let done = false;
      const onKey = (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault(); e.stopPropagation();
          finish();
        }
      };
      const finish = () => {
        if (done) return;
        done = true;
        document.removeEventListener('keydown', onKey, true);
        document.removeEventListener('click', finish, true);
        root.classList.remove('show');
        setTimeout(() => root.remove(), 350);
        res();
      };
      setTimeout(finish, 2600 / Math.max(1, G.speed * 0.8));
      document.addEventListener('click', finish, true);
      document.addEventListener('keydown', onKey, true);
    });
  }

  /* —— 骑乘特效：专机 / 警车（SVG 警车跟随） —— */
  function rideStart(p, kind) {
    const el = tokenEls.get(p.idx);
    if (!el) return;
    const inner = el.firstElementChild;
    const d = document.createElement('div');
    if (kind === 'police') {
      d.className = 'ride ride-police';
      d.innerHTML = POLICE_SVG + `<div class="ride-tag">${pname(p)} 收押中</div>`;
      el.classList.add('custody');   // 押送途中不展示人物，只剩警车 + 头顶提示语
    } else {
      d.className = 'ride ride-plane';
      d.textContent = '✈️';
      el.classList.add('custody');   // 专机飞行同样只展示交通工具（rideEnd 恢复）
    }
    inner.appendChild(d);
    el.classList.add('riding');
    if (kind === 'plane') SFX.whoosh(); else SFX.siren();
  }
  function rideEnd(p) {
    const el = tokenEls.get(p.idx);
    if (!el) return;
    const d = el.querySelector('.ride');
    const wasPolice = !!(d && d.classList.contains('ride-police'));
    if (d) d.remove();
    el.classList.remove('riding');
    /* 警车送达监狱：人物保持隐藏（入狱），由 setTokenHidden / updatePlayers 恢复；
     * 专机落地：人物立即恢复可见 */
    if (!wasPolice) el.classList.remove('custody');
  }

  /* token 显隐（羁押入狱 / 出狱 / 押送期间）—— game.js 显式驱动，bridge 同步 3D 层 */
  function setTokenHidden(idx, hidden) {
    const el = tokenEls.get(idx);
    if (!el) return;
    el.classList.toggle('custody', !!hidden);
  }

  /* 数字选择（遥控骰子） */
  function numberPicker() {
    return new Promise(res => {
      const m = buildModal(`
        <div class="m-title">🔮 遥控骰子</div>
        <div class="m-body">选择下一次掷出的点数：</div>
        <div class="dice-pick"></div>
        <div class="m-actions center"><button class="btn btn-ghost" id="np-cancel">取消</button></div>`, 'nomax');
      const row = $('.dice-pick', m.el);
      for (let n = 1; n <= 6; n++) {
        const b = document.createElement('button');
        b.className = 'dp-btn';
        b.innerHTML = `<img src="assets/img/dice${n}.png" alt="${n}">`;
        b.onclick = () => { m.close(); res(n); };
        row.appendChild(b);
      }
      $('#np-cancel', m.el).onclick = () => { m.close(); res(null); };
    });
  }

  /* 格子点选模式（路障/拆迁令/清障车/施工令）；pickHook 通知 3D 层高亮可选格（2D 格子在 v3d 模式下不可见）
   * hint：#pickbar 提示语按道具定制（"选择要拆除的路障"/"选择要加急的地块"），结束点选时恢复默认文案 */
  let pickHook = null;
  let pickDefaultHint = null;
  function setPickHint(text) {
    const sp = $('#pickbar span');
    if (!sp) return;
    if (pickDefaultHint == null) pickDefaultHint = sp.textContent || '';
    sp.textContent = text || pickDefaultHint;
  }
  function pickTile(filter, hint) {
    return new Promise(res => {
      picking = { filter, resolve: res };
      const valid = [];
      $$('.tile').forEach(el => {
        const i = +el.dataset.idx;
        if (filter(i)) { el.classList.add('pickable'); valid.push(i); }
      });
      if (!valid.length) { for (let i = 0; i < BOARD.length; i++) if (filter(i)) valid.push(i); }   /* 无 DOM 格子（桩环境）时直接按规则枚举 */
      try { if (hint) setPickHint(hint); } catch (e) { /* 桩环境无 span 忽略 */ }
      $('#pickbar').classList.add('show');
      try { if (pickHook) pickHook(valid); } catch (e) { /* 3D 高亮失败不影响点选 */ }
    });
  }
  function endPick(val) {
    if (!picking) return;
    const { resolve } = picking;
    picking = null;
    $$('.tile').forEach(el => el.classList.remove('pickable'));
    $('#pickbar').classList.remove('show');
    try { if (pickDefaultHint != null) setPickHint(null); } catch (e) { /* ignore */ }
    try { if (pickHook) pickHook(null); } catch (e) { /* ignore */ }
    resolve(val);
  }
  function onTileClick(i) {
    if (picking) {
      if (picking.filter(i)) { SFX.click(); endPick(i); }
      else toast('这个格子不能选', '🚫');
      return;
    }
    if (modalOpen > 0) return;
    showDeed(i);
  }

  /* 地契卡 */
  function deedRows(idx) {
    const t = BOARD[idx];
    if (t.type === 'prop') {
      const rows = LEVEL_NAMES.map((ln, lv) => {
        const rent = lv === 0
          ? `${fmt(t.price * CFG.RENT_MULT[0])} <i class="dim">(垄断双倍)</i>`
          : fmt(t.price * CFG.RENT_MULT[lv]);
        return `<tr><td>${ln}</td><td>${rent}</td></tr>`;
      }).join('');
      return `<table class="deed-rent"><tr><th>等级</th><th>租金</th></tr>${rows}</table>`;
    }
    if (t.type === 'station') {
      return `<table class="deed-rent"><tr><th>拥有车站</th><th>租金</th></tr>${CFG.STATION_RENT.map((r, i) => `<tr><td>${i + 1} 座</td><td>${fmt(r)}</td></tr>`).join('')}</table>`;
    }
    if (t.type === 'utility') {
      /* 与 data.js rentOf 共用 CFG.UTILITY_RENT：此前写死 ×$4,000/×$10,000，数值调配（×1,200/×3,000）后地契文案已失真 3 倍 */
      const UR = CFG.UTILITY_RENT || [1200, 3000];
      return `<table class="deed-rent"><tr><th>拥有公司</th><th>租金</th></tr><tr><td>1 家</td><td>骰子点数 × ${fmt(UR[0])}</td></tr><tr><td>2 家</td><td>骰子点数 × ${fmt(UR[1])}</td></tr></table>`;
    }
    return '';
  }

  function deedHTML(idx) {
    const t = BOARD[idx];
    const g = GROUPS[t.group];
    const st = G.tiles[idx];
    const ownerName = st.owner != null ? `<span style="color:${playerColor(G.players[st.owner])}">${pname(G.players[st.owner])} 的产业${t.type === 'prop' ? ' · ' + LEVEL_NAMES[st.level] : ''}</span>` : '<span class="dim">无主之地</span>';
    const band = g ? `<div class="deed-band" style="background:${g.color}">${g.name}</div>` : `<div class="deed-band" style="background:#7a5230">${{ station: '交通枢纽', utility: '公共事业' }[t.type] || '特别格'}</div>`;
    const head = t.type === 'prop' || t.type === 'station' || t.type === 'utility'
      ? `${band}<div class="deed-name">${t.name}</div><div class="deed-owner">${ownerName}</div>${deedRows(idx)}<div class="deed-price">购价 <b>${fmt(t.price)}</b>${t.type === 'prop' ? ` · 建筑费 <b>${fmt(t.buildCost)}</b>/层` : ''}</div>`
      : `<div class="deed-name big">${t.icon || ''} ${t.name}</div><div class="deed-desc">${tileDesc(t)}</div>`;
    return head;
  }

  function tileDesc(t) {
    switch (t.type) {
      case 'start': return `每次经过领取工资 ${fmt(CFG.SALARY)}。`;
      case 'jail': return '探视时间，进来的都是客人（除了蹲着的那位）。';
      case 'park': return '中央公园：落到这里抱走全部奖池！税收与罚款都会汇入奖池。';
      case 'gotojail': return '直接入狱，不得领取工资。可交保释金 $2,000 或用出狱许可证脱身。';
      case 'chance': return '机会：抽一张机会卡，好坏参半。';
      case 'destiny': return '命运：一张新闻卡，往往牵动全场。';
      case 'tax': return t.taxKind === 'income' ? '所得税：缴纳现金的 10%（$2,000 起）进入奖池。' : '奢侈税：按总资产的 3% 缴纳，进入奖池。';
      case 'shop': return '道具商店：购买遥控骰子、路障、护身符、清障车、保险单、窃贼卡等 12 种道具。';
    }
    return '';
  }

  function showDeed(i) {
    SFX.hover();
    const m = buildModal(`
      <div class="deed">${deedHTML(i)}</div>
      <div class="m-actions center"><button class="btn btn-ghost">关闭</button></div>`, 'nomax');
    $('.m-actions .btn', m.el).onclick = () => m.close();
    m.el.addEventListener('click', (e) => { if (e.target === m.el) m.close(); });
  }

  /* 道具商店
   * 同一时刻最多一个商店弹窗：联机客人每买一件，房主会再发一次 shop 询问 → 此前客人端每次都新开一层弹窗叠在旧弹窗上，
   * 且旧弹窗上显示的现金/持有数是询问时的快照（客人传来的是 G.players 的拷贝）。现在：新询问接管旧弹窗（旧 Promise 安全
   * resolve，其 close 回执在房主侧对应的请求早已完成、被忽略），现金/持有数从 G.players 实时读取并随 updatePlayers 刷新。 */
  function shopModal(p, buyFn) {
    return new Promise(resClose => {
      if (shopOpen) { const prev = shopOpen; shopOpen = null; try { prev.m.close(); } catch (e) { /* ignore */ } prev.resClose(); }
      const live = () => (G.players && p && p.idx != null && G.players[p.idx] && G.players[p.idx].charId === p.charId) ? G.players[p.idx] : p;
      const canBuy = (lp, k) => lp.money >= PROPS[k].price && ((lp.props && lp.props[k]) || 0) < PROP_MAX;
      const render = () => {
        const lp = live();
        const items = Object.keys(PROPS).map(k => {
          const P = PROPS[k];
          const owned = (lp.props && lp.props[k]) || 0;
          return `<div class="shop-item" data-rarity="${P.rarity || 1}">
            <span class="si-ico">${P.icon}</span>
            <div class="si-info"><b>${P.name}</b><small>${P.desc}</small>${P.counter ? `<small class="si-counter">🛡️ ${P.counter}</small>` : ''}</div>
            <div class="si-own" data-own="${k}">持有 ${owned}/${PROP_MAX}</div>
            <button class="btn btn-mini btn-primary" data-buy="${k}" ${canBuy(lp, k) ? '' : 'disabled'}>${fmt(P.price)}</button>
          </div>`;
        }).join('');
        return `<div class="m-title">🛒 道具商店</div>
          <div class="m-cash">你的现金：<b data-shop-cash>${fmt(lp.money)}</b></div>
          <div class="shop-list">${items}</div>
          <div class="m-actions center"><button class="btn btn-ghost" id="shop-close">离开商店</button></div>`;
      };
      const m = buildModal(render(), 'shop');
      const me = { m, resClose, refresh: null };
      shopOpen = me;
      const close = () => { if (shopOpen === me) shopOpen = null; m.close(); resClose(); };
      const bind = () => {
        $$('[data-buy]', m.el).forEach(b => b.onclick = async () => {
          b.disabled = true;
          const ok = await buyFn(b.dataset.buy);
          if (shopOpen !== me) return;                       // 期间已被新询问接管 / 关闭
          if (ok) { $('.modal', m.el).innerHTML = render(); bind(); }
          else b.disabled = false;
        });
        $('#shop-close', m.el).onclick = close;
      };
      /* 轻量刷新：只改文本与 disabled，不重建 DOM（updatePlayers 调用极频繁，重建会让正要点击的按钮从鼠标下消失） */
      me.refresh = () => {
        if (shopOpen !== me || !m.el) return;
        const lp = live();
        const c = $('[data-shop-cash]', m.el); if (c) c.textContent = fmt(lp.money);
        $$('[data-buy]', m.el).forEach(b => { b.disabled = !canBuy(lp, b.dataset.buy); });
        $$('[data-own]', m.el).forEach(d => { d.textContent = `持有 ${(lp.props && lp.props[d.dataset.own]) || 0}/${PROP_MAX}`; });
      };
      bind();
    });
  }

  /* 拍卖叫价面板 */
  /* ================= 拍卖大厅（全屏舞台：大屏 + 主持人落槌 + 举牌竞价） =================
   * AH.closeT：落槌后的延时关厅定时器——只关「自己那一届」的厅（close 前比对 AH.el 引用），
   * 防止连拍时第一场落槌的 1.9s 延时 close 把第二场新开的大厅关掉（AH.el 被置 null 后
   * auctionPrompt 回退旧弹窗 / auctionTurn·Bid 全部 no-op / joinAsk 悬空的连串 bug）。
   * AH.askAbort：厅被关闭时，未决的 joinAsk / 举牌询问要安全 resolve（'watch'/'quit'），
   * 避免 game.js 的 await 永久悬空卡死回合流。 */
  const AH = { el: null, feed: null, screen: null, seats: new Map(), hammerT: null, closeT: null, askAbort: null };

  function ahStyle() {
    if (document.getElementById('ah-style')) return;
    const st = document.createElement('style');
    st.id = 'ah-style';
    st.textContent = `
#auction-hall{position:fixed;inset:0;z-index:900;display:flex;align-items:center;justify-content:center;
  background:
    repeating-conic-gradient(rgba(255,255,255,.012) 0% 25%,transparent 0% 50%) 0 0/6px 6px,
    radial-gradient(120% 90% at 50% 0%,#164a33 0%,#0a2418 58%,#051209 100%);
  animation:ahIn .45s ease}
@keyframes ahIn{from{opacity:0}to{opacity:1}}
.ah-wrap{position:relative;width:min(1060px,94vw);max-height:94vh;display:flex;flex-direction:column;gap:12px;padding:18px 22px 20px;border-radius:18px;
  background:
    radial-gradient(120% 60% at 50% 0%,rgba(255,215,106,.08),transparent 55%),
    linear-gradient(180deg,rgba(18,50,36,.96),rgba(8,26,18,.98));
  box-shadow:inset 0 0 0 1px rgba(255,215,106,.34),inset 0 0 0 3px rgba(0,0,0,.22),inset 0 0 0 4px rgba(255,215,106,.1),0 30px 80px rgba(0,0,0,.6)}
.ah-wrap::before{content:'◆';position:absolute;left:50%;top:5px;transform:translateX(-50%);font-size:7px;color:rgba(255,215,106,.75);line-height:1}
.ah-head{display:flex;align-items:center;gap:12px;color:#ffe9a8;padding-bottom:10px;border-bottom:1px solid rgba(255,215,106,.16)}
.ah-head b{font-size:20px;letter-spacing:3px;font-weight:900;display:inline-flex;align-items:center;gap:8px}
.ah-head b::before{content:'';width:4px;height:18px;border-radius:2px;background:linear-gradient(180deg,#ffd76a,#f0a818);box-shadow:0 0 8px rgba(255,215,106,.5)}
.ah-head small{color:#9fc4a8;font-size:13px;letter-spacing:1px}
.ah-step{margin-left:auto;font-size:12px;color:#9fb59c;background:rgba(0,0,0,.3);padding:5px 12px;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(255,215,106,.22)}
.ah-step b{color:#ffd76a;font-size:13px}
.ah-stage{position:relative;display:flex;align-items:stretch;gap:14px}
.ah-screen{flex:1;border-radius:14px;padding:16px 22px 14px;position:relative;overflow:hidden;
  background:
    radial-gradient(80% 90% at 50% 100%,rgba(255,215,106,.07),transparent 60%),
    linear-gradient(160deg,#0f2d20 0%,#08201a 70%);
  box-shadow:inset 0 0 0 1px rgba(255,215,106,.45),inset 0 0 0 3px rgba(0,0,0,.3),inset 0 0 0 4px rgba(255,215,106,.12),inset 0 0 50px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.45)}
.ah-screen::after{content:'';position:absolute;inset:0;pointer-events:none;
  background:repeating-linear-gradient(0deg,rgba(255,255,255,.02) 0 2px,transparent 2px 4px)}
.ahs-tag{display:inline-flex;align-items:center;gap:6px;font:800 11.5px/1 "Microsoft YaHei",sans-serif;letter-spacing:3px;color:#fff5ea;
  background:linear-gradient(180deg,#d9433a,#a8231f);padding:5px 12px 5px 10px;border-radius:999px;margin-bottom:10px;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.16),0 2px 6px rgba(0,0,0,.4)}
.ahs-tag::before{content:'';width:6px;height:6px;border-radius:50%;background:#fff;box-shadow:0 0 6px #fff;animation:ahDot 1.2s ease-in-out infinite}
@keyframes ahDot{50%{opacity:.35;transform:scale(.75)}}
.ahs-lot{display:flex;align-items:center;gap:20px;flex-wrap:wrap}
.ahs-name{font-size:30px;font-weight:900;color:#fff2cf;letter-spacing:2px;text-shadow:0 2px 8px rgba(0,0,0,.5)}
.ahs-owner{font-size:13px;font-weight:600;color:#9fc4a8;display:block;margin-top:4px;letter-spacing:1px}
/* 当前价金镜 */
.ahs-price{margin-left:auto;text-align:center;padding:9px 24px 8px;border-radius:14px;
  background:radial-gradient(circle at 50% 20%,rgba(255,215,106,.2),rgba(0,0,0,.45) 75%);
  box-shadow:inset 0 0 0 2px #d9960f,inset 0 0 0 4px rgba(0,0,0,.45),inset 0 0 0 5px rgba(255,215,106,.45),0 0 26px rgba(255,198,58,.22),0 8px 20px rgba(0,0,0,.45)}
.ahs-price b{display:block;font-size:34px;color:#ffd76a;text-shadow:0 0 18px rgba(255,180,41,.5),0 2px 0 #6b4210;font-variant-numeric:tabular-nums;line-height:1.15}
.ahs-price small{color:#b9a56a;font-size:11px;letter-spacing:2px}
.ahs-leader{font-size:14px;font-weight:800;color:#9fe0b2;min-width:120px;text-align:right}
.ahs-meta{width:100%;color:#7d9a86;font-size:12px;letter-spacing:.5px;margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,215,106,.16)}
.ah-host{width:130px;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;padding:10px 0;border-radius:14px;
  background:linear-gradient(180deg,rgba(255,255,255,.04),rgba(0,0,0,.22));box-shadow:inset 0 0 0 1px rgba(255,215,106,.18)}
.ah-host-fig{font-size:52px;line-height:1;filter:drop-shadow(0 6px 10px rgba(0,0,0,.5))}
.ah-host-name{font-size:11px;color:#9fc4a8;letter-spacing:3px;padding-left:3px}
.ah-hammer{font-size:34px;transform-origin:80% 80%;transform:rotate(-18deg);transition:transform .12s ease-in;filter:drop-shadow(0 4px 6px rgba(0,0,0,.5))}
.ah-hammer.slam{animation:ahSlam .55s ease-in}
@keyframes ahSlam{0%{transform:rotate(-18deg)}55%{transform:rotate(38deg) translateY(10px) scale(1.12)}72%{transform:rotate(30deg)}100%{transform:rotate(-18deg)}}
.ah-stage.shake{animation:ahShake .4s ease}
.ah-stage.shake .ahs-price{box-shadow:inset 0 0 0 2px #ffe08a,inset 0 0 0 4px rgba(0,0,0,.45),inset 0 0 0 5px rgba(255,215,106,.7),0 0 44px rgba(255,198,58,.55),0 8px 20px rgba(0,0,0,.45)}
@keyframes ahShake{0%,100%{transform:translate(0,0)}25%{transform:translate(-4px,2px)}55%{transform:translate(4px,-2px)}80%{transform:translate(-2px,1px)}}
.ah-floor{display:flex;gap:14px;min-height:230px}
.ah-seats{flex:1.55;display:grid;grid-template-columns:repeat(auto-fit,minmax(128px,1fr));gap:10px;align-content:start}
.ah-seat{position:relative;display:flex;flex-direction:column;align-items:center;gap:5px;padding:12px 8px 10px;border-radius:12px;
  background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(0,0,0,.22));box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);
  transition:opacity .3s,transform .25s,box-shadow .3s}
.ah-seat img{width:50px;height:50px;border-radius:13px;object-fit:contain;object-position:bottom;
  background:linear-gradient(165deg,color-mix(in srgb,var(--pc,#f0b429) 42%,#0a1a12),color-mix(in srgb,var(--pc,#f0b429) 16%,#06120c));
  box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.22),0 0 0 2px color-mix(in srgb,var(--pc,#f0b429) 55%,transparent),0 4px 10px rgba(0,0,0,.45)}
.ah-seat .n{font-size:13px;font-weight:800;color:#eef7ee}
.ah-seat .m{font-size:12px;color:#8ff0b4;font-weight:700;font-variant-numeric:tabular-nums}
.ah-seat .st{font-size:11.5px;color:#7d9a86;min-height:16px}
.ah-seat .paddle{font-size:22px;opacity:.28;transform:rotate(-30deg) translateY(4px);transition:all .22s ease;filter:drop-shadow(0 2px 3px rgba(0,0,0,.5))}
.ah-seat.turn{box-shadow:inset 0 0 0 1px rgba(255,215,106,.9),0 0 22px rgba(240,180,41,.28);transform:translateY(-2px);animation:ahTurn 1.4s ease-in-out infinite}
@keyframes ahTurn{50%{box-shadow:inset 0 0 0 1px rgba(255,232,160,1),0 0 30px rgba(240,180,41,.45)}}
.ah-seat.turn .st{color:#ffd76a;font-weight:800}
.ah-seat.raise .paddle{opacity:1;transform:rotate(0) translateY(-8px) scale(1.18)}
.ah-seat.lead{box-shadow:inset 0 0 0 1px rgba(95,211,138,.8);background:linear-gradient(180deg,rgba(95,211,138,.12),rgba(0,0,0,.22))}
.ah-seat.lead .st{color:#8ff0b4;font-weight:800}
.ah-seat.lead::before{content:'领先';position:absolute;left:8px;top:8px;font:800 10px/1 "Microsoft YaHei",sans-serif;letter-spacing:1px;color:#0a1f14;
  background:linear-gradient(180deg,#8ff0b4,#3ddc84);padding:3px 7px;border-radius:6px;box-shadow:0 1px 0 #1d9e50,0 2px 6px rgba(0,0,0,.4)}
.ah-seat.out{opacity:.38;filter:grayscale(.9)}
.ah-seat.won{box-shadow:inset 0 0 0 1.5px #ffd76a,0 0 0 2px rgba(255,215,106,.35),0 0 30px rgba(255,198,58,.45);background:linear-gradient(180deg,rgba(255,215,106,.18),rgba(0,0,0,.22));transform:translateY(-3px);animation:none}
.ah-seat.won .st{color:#ffe08a;font-weight:900}
.ah-seat.won::before{content:'竞得';background:linear-gradient(180deg,#ffe08a,#f0a818);color:#4a2f04;box-shadow:0 1px 0 #8a5a12,0 2px 6px rgba(0,0,0,.4)}
.ah-seat .bubble{position:absolute;top:-8px;right:-4px;background:linear-gradient(180deg,#ffe9a8,#f0b429);color:#3a2600;
  font:900 12.5px/1 "Microsoft YaHei",sans-serif;padding:6px 10px;border-radius:999px;box-shadow:0 2px 0 #8a5a12,0 4px 12px rgba(0,0,0,.4);
  animation:ahPop .3s ease}
@keyframes ahPop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
.ah-side{flex:1;display:flex;flex-direction:column;gap:10px;min-width:250px}
.ah-feed{flex:1;overflow-y:auto;border-radius:12px;padding:8px 12px 10px;background:rgba(0,0,0,.3);
  box-shadow:inset 0 0 0 1px rgba(255,215,106,.16),inset 0 2px 8px rgba(0,0,0,.4);
  font-size:12.5px;color:#b9d4bf;line-height:1.9;max-height:170px;scrollbar-width:thin;scrollbar-color:#2c5a45 transparent}
.ah-feed::-webkit-scrollbar{width:6px}.ah-feed::-webkit-scrollbar-thumb{background:#2c5a45;border-radius:3px}
.ah-feed::before{content:'竞 价 记 录';display:block;font-size:10.5px;letter-spacing:3px;color:#9fb59c;font-weight:800;border-bottom:1px dashed rgba(255,215,106,.16);margin-bottom:4px;padding-bottom:2px}
.ah-feed b{color:#ffe9a8}
.ah-actions{display:flex;flex-direction:column;gap:8px}
.ah-turn{font-size:14px;font-weight:800;color:#ffd76a;letter-spacing:1px;min-height:20px}
.ah-btn{padding:12px 14px;border:none;border-radius:11px;cursor:pointer;font:800 15px "Microsoft YaHei",sans-serif;letter-spacing:1px;transition:transform .12s,box-shadow .12s,filter .12s}
.ah-btn.bid{background:linear-gradient(180deg,#fff0bd 0%,#ffd76a 26%,#f0a818 62%,#d98a0c 100%);color:#4a2f04;
  box-shadow:0 4px 0 #8a5a12,0 9px 20px rgba(240,168,24,.35),inset 0 1px 0 rgba(255,255,255,.85);text-shadow:0 1px 0 rgba(255,255,255,.5)}
.ah-btn.bid:hover{filter:brightness(1.06);transform:translateY(-1px)}
.ah-btn.bid:active{transform:translateY(2px);box-shadow:0 2px 0 #8a5a12,inset 0 1px 0 rgba(255,255,255,.85)}
.ah-btn.quit{background:linear-gradient(180deg,rgba(22,52,37,.94),rgba(9,26,18,.96));color:#e6dfc6;
  box-shadow:inset 0 0 0 1px rgba(255,215,106,.34),0 3px 0 rgba(0,0,0,.38)}
.ah-btn.quit:hover{color:#ffe9a8;box-shadow:inset 0 0 0 1px rgba(255,215,106,.75),0 3px 0 rgba(0,0,0,.38)}
.ah-btn[disabled]{opacity:.4;cursor:not-allowed;filter:grayscale(.5);transform:none}
#ah-rps{display:flex;align-items:center;gap:6px;flex-wrap:wrap;font-size:13px}
.ah-closing{animation:ahOut .5s ease forwards}
@keyframes ahOut{to{opacity:0;transform:scale(.97)}}
@media (max-width:760px){.ah-floor{flex-direction:column}.ah-side{min-width:0}.ahs-name{font-size:22px}.ahs-price b{font-size:26px}}
`;
    document.head.appendChild(st);
  }

  function ahCharOf(p) {
    return CHARACTERS.find(x => x.id === p.charId) || { avatarImg: '', name: p.name || '玩家', color: '#f0b429' };
  }

  function auctionOpen({ idx, market, bankPrice, minStep, level, seller }) {
    try { ahStyle(); } catch (e) { /* ignore */ }
    auctionClose(true);   // 开新厅前拆掉旧厅（并清掉旧厅的延时 close 定时器 / 悬空询问）
    const t = BOARD[idx];
    const el = document.createElement('div');
    el.id = 'auction-hall';
    const seatsHtml = alivePlayers().map(p => {
      const c = ahCharOf(p);
      return `<div class="ah-seat" data-seat="${p.idx}" style="--pc:${c.color}">
        <img src="${c.avatarImg}" alt="">
        <span class="n">${pname(p)}${p.ai ? ' <small style="color:#7d9a86">AI</small>' : ''}</span>
        <span class="m">${fmt(p.money)}</span>
        <span class="st">入席</span>
        <span class="paddle">🔨</span>
      </div>`;
    }).join('');
    el.innerHTML = `
      <div class="ah-wrap">
        <div class="ah-head"><b>🔨 富贵拍卖行</b><small>${t.name} · 竞价进行中</small>
          <span class="ah-step">加价阶梯 <b>${fmt(minStep)}</b></span></div>
        <div class="ah-stage">
          <div class="ah-screen">
            <span class="ahs-tag">LOT ${String(idx).padStart(2, '0')} · 拍卖标的</span>
            <div class="ahs-lot">
              <div><div class="ahs-name">${t.name}</div>
                <span class="ahs-owner">${seller != null ? `${pname(G.players[seller])} 的产业` : '无主资产'}${level ? ` · 含${LEVEL_NAMES[level] || '建筑'}` : ''} · 市值 ${fmt(market)}</span></div>
              <div class="ahs-price"><b id="ahs-price">${fmt(bankPrice)}</b><small>当前最高价</small></div>
              <div class="ahs-leader" id="ahs-leader">等待首拍…</div>
            </div>
            <div class="ahs-meta">拍品编号 LOT-${String(idx).padStart(2, '0')} · 底价 = 银行半价保底 · 低于底价由银行直接回收 · 竞得款项归 ${seller != null ? pname(G.players[seller]) : '银行'} 所有</div>
          </div>
          <div class="ah-host"><div class="ah-host-fig">🎩</div><div class="ah-host-name">主持人</div><div class="ah-hammer" id="ah-hammer">🔨</div></div>
        </div>
        <div class="ah-floor">
          <div class="ah-seats">${seatsHtml}</div>
          <div class="ah-side">
            <div class="ah-feed" id="ah-feed"><div>📢 ${t.name} 挂牌拍卖，底价 <b>${fmt(bankPrice)}</b>（银行半价保底）</div></div>
            <div class="ah-actions">
              <div class="ah-turn" id="ah-turn">竞价进行中…</div>
              <button class="ah-btn bid" id="ah-bid" disabled>🔨 举牌出价</button>
              <button class="ah-btn quit" id="ah-quit" disabled>放下牌子 · 退出竞拍</button>
            </div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
    AH.el = el;
    AH.feed = $('#ah-feed', el);
    AH.screen = { price: $('#ahs-price', el), leader: $('#ahs-leader', el), stage: $('.ah-stage', el) };
    AH.seats.clear();
    $$('.ah-seat', el).forEach(s => AH.seats.set(+s.dataset.seat, s));
    if (typeof G !== 'undefined' && G) {
      alivePlayers().forEach(p => {
        const seat = AH.seats.get(p.idx);
        const m = $('.m', seat);
        if (m) m.textContent = fmt(p.money);
      });
    }
  }

  function ahFeed(html) {
    if (!AH.feed) return;
    const d = document.createElement('div');
    d.innerHTML = html;
    AH.feed.appendChild(d);
    AH.feed.scrollTop = AH.feed.scrollHeight;
  }

  function auctionTurn(p) {
    if (!AH.el) return;
    AH.seats.forEach(s => s.classList.remove('turn'));
    const seat = AH.seats.get(p.idx);
    if (seat) { seat.classList.add('turn'); const st = $('.st', seat); if (st) st.textContent = '考虑中…'; }
    const isMe = !p.ai && (!NET.active || !NET.isRemoteSeat(p.idx));
    if (isMe) { const t = $('#ah-turn', AH.el); if (t) t.textContent = `轮到你举牌了！`; }
  }

  function auctionScreen(price, leader) {
    if (!AH.screen) return;
    AH.screen.price.textContent = fmt(price);
    AH.screen.leader.innerHTML = leader != null
      ? `<span style="color:${playerColor(G.players[leader])}">${pname(G.players[leader])}</span> 领先`
      : '等待首拍…';
  }

  function auctionBid(p, amount) {
    if (!AH.el) return;
    auctionScreen(amount, p.idx);
    AH.seats.forEach(s => s.classList.remove('lead'));   /* 领先标记只挂在当前最高出价者身上 */
    const seat = AH.seats.get(p.idx);
    if (seat) {
      seat.classList.remove('turn');
      seat.classList.add('raise', 'lead');
      const st = $('.st', seat); if (st) st.textContent = '领先';
      const m = $('.m', seat); if (m) m.textContent = fmt(p.money);
      const old = $('.bubble', seat); if (old) old.remove();
      const b = document.createElement('span');
      b.className = 'bubble';
      b.textContent = fmt(amount);
      seat.appendChild(b);
      setTimeout(() => b.remove(), 2200);
    }
    ahFeed(`🔨 <b style="color:${playerColor(p)}">${pname(p)}</b> 举牌出价 <b>${fmt(amount)}</b>`);
    if (typeof SFX !== 'undefined' && SFX.cash) SFX.cash();
  }

  function auctionPass(p, reason) {
    if (!AH.el) return;
    const seat = AH.seats.get(p.idx);
    if (seat) {
      seat.classList.remove('turn', 'raise', 'lead');
      seat.classList.add('out');
      const st = $('.st', seat); if (st) st.textContent = reason || '退出竞拍';
      const pd = $('.paddle', seat); if (pd) pd.style.opacity = '.12';
    }
    ahFeed(`🚪 <span style="color:#8aa891">${pname(p)} ${reason || '退出竞拍'}</span>`);
  }

  /* 石头剪刀布：决定率先出价权与出价顺序（多轮淘汰直到唯一胜者）。返回胜者 idx。 */
  function auctionRps(participants) {
    return new Promise(res => {
      if (!AH.el || !participants || participants.length < 2) { res(participants && participants[0] ? participants[0].idx : null); return; }
      let pool = participants.slice();
      const throwsI = {};
      const EMO = { rock: '\u270a', scissors: '\u270c\ufe0f', paper: '\u270b' };
      const NAME = { rock: '石头', scissors: '剪刀', paper: '布' };
      const BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
      const human = participants.find(p => !p.ai && !(NET.active && NET.isRemoteSeat(p.idx)));
      const done = w => { AH.rpsAbort = null; res(w); };
      AH.rpsAbort = () => done(pool && pool[0] ? pool[0].idx : null);
      const turn = $('#ah-turn', AH.el), act = $('.ah-actions', AH.el);
      function setTurn(t) { if (turn) turn.textContent = t; }
      function seatShow(p, txt) { const st = $('.st', AH.seats.get(p.idx)); if (st) st.textContent = txt; }
      function paddlePop(p) { const pd = $('.paddle', AH.seats.get(p.idx)); if (pd) { pd.classList.add('raise'); setTimeout(() => pd.classList.remove('raise'), 450); } }
      function askButtons() {
        if (!act || !human) { setTimeout(() => resolveRound(null), 900); return; }
        if (act.querySelector('#ah-rps')) act.querySelector('#ah-rps').remove();
        act.insertAdjacentHTML('afterbegin', '<div id="ah-rps"><b style="color:#ffd76a">你的出招：</b> '
          + '<button class="ah-btn bid" style="display:inline-block;padding:8px 12px;margin-right:6px" data-r="rock">\u270a 石头</button>'
          + '<button class="ah-btn bid" style="display:inline-block;padding:8px 12px;margin-right:6px" data-r="scissors">\u270c\ufe0f 剪刀</button>'
          + '<button class="ah-btn bid" style="display:inline-block;padding:8px 12px" data-r="paper">\u270b 布</button></div>');
        const row = act.querySelector('#ah-rps');
        row.querySelectorAll('button').forEach(b => b.onclick = () => { const r = b.dataset.r; row.remove(); resolveRound(r); });
      }
      function resolveRound(humanPick) {
        pool.forEach(p => { throwsI[p.idx] = (p === human && humanPick) ? humanPick : ['rock', 'scissors', 'paper'][Math.floor(Math.random() * 3)]; });
        pool.forEach(p => { seatShow(p, EMO[throwsI[p.idx]] + ' ' + NAME[throwsI[p.idx]]); paddlePop(p); });
        if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
        setTimeout(() => {
          const types = [...new Set(pool.map(p => throwsI[p.idx]))];
          let winners = pool;
          if (types.length === 2) {
            const wt = BEATS[types[0]] === types[1] ? types[0] : types[1];
            winners = pool.filter(p => throwsI[p.idx] === wt);
          }
          if (winners.length === 1) {
            const w = winners[0];
            seatShow(w, '🎉 猜拳胜者');
            setTurn('🎉 ' + pname(w) + ' 猜拳获胜，率先出价！');
            ahFeed('\u270a\u270c\ufe0f\u270b 猜拳胜者：<b>' + pname(w) + '</b> 率先出价');
            setTimeout(() => done(w.idx), 1100);
          } else {
            pool = winners;                                   /* 平局/三足鼎立 → 胜者圈重掷 */
            setTurn(types.length === 2 ? '平局！胜者圈再猜一轮…' : '三家齐出，不分胜负！再来…');
            setTimeout(round, 850);
          }
        }, 850);
      }
      function round() {
        pool.forEach(p => seatShow(p, '\u2753 出招中…'));
        setTurn('\u270a\u270c\ufe0f\u270b 石头剪刀布，决定率先出价权！');
        askButtons();
      }
      round();
    });
  }

  /* 大厅入口询问：是否参与竞拍（game.js 开厅后第一时间调用） */
  function auctionJoinAsk({ idx, bankPrice, who }) {
    return new Promise(res => {
      if (!AH.el) { res('join'); return; }
      /* 厅被关闭（连拍开新厅 / 重开游戏）时安全 resolve，不让 game.js 悬空 */
      const finish = v => { if (AH.askAbort === abort) AH.askAbort = null; res(v); };
      const abort = () => finish('watch');
      AH.askAbort = abort;
      const t = $('#ah-turn', AH.el);
      const bid = $('#ah-bid', AH.el);
      const quit = $('#ah-quit', AH.el);
      if (t) t.textContent = who ? `📣 ${who}：是否参与竞拍？` : '📣 拍卖开始，是否参与竞拍？';
      if (bid) {
        bid.disabled = false;
        bid.textContent = '🔨 参与竞拍';
        bid.onclick = () => {
          bid.disabled = true; quit.disabled = true;
          if (typeof SFX !== 'undefined' && SFX.click) SFX.click();
          finish('join');
        };
      }
      if (quit) {
        quit.disabled = false;
        quit.textContent = '👀 旁观不参与';
        quit.onclick = () => {
          bid.disabled = true; quit.disabled = true;
          finish('watch');
        };
      }
    });
  }

  /* 大厅内的人类举牌控制台（game.js 的 auctionPrompt 路由到这里） */
  function auctionHallAsk(p, { need, leader, price }) {
    return new Promise(res => {
      /* 厅被关闭时安全 resolve 为放弃，不让回合流卡死 */
      const finish = v => { if (AH.askAbort === abort) AH.askAbort = null; res(v); };
      const abort = () => finish('quit');
      AH.askAbort = abort;
      const bid = $('#ah-bid', AH.el);
      const quit = $('#ah-quit', AH.el);
      const turn = $('#ah-turn', AH.el);
      const seat = AH.seats.get(p.idx);
      if (turn) turn.textContent = `🎯 轮到你举牌！当前 ${fmt(price)}${leader ? ` · ${pname(leader)} 领先` : ''}`;
      if (bid) {
        bid.disabled = false;
        bid.textContent = `🔨 举牌出价 ${fmt(need)}`;
        bid.onclick = () => {
          bid.disabled = true; quit.disabled = true;
          if (seat) seat.classList.add('raise');
          finish('bid');
        };
      }
      if (quit) {
        quit.disabled = false;
        quit.onclick = () => {
          bid.disabled = true; quit.disabled = true;
          finish('quit');
        };
      }
    });
  }

  function auctionClose(silent) {
    /* 先清延时关厅定时器 + 安全 resolve 悬空询问（不依赖 AH.el 是否还在） */
    if (AH.closeT) { clearTimeout(AH.closeT); AH.closeT = null; }
    if (AH.askAbort) { const f = AH.askAbort; AH.askAbort = null; try { f(); } catch (e) { /* ignore */ } }
    if (!AH.el) return;
    const el = AH.el;
    try { if (AH.rpsAbort) AH.rpsAbort(); } catch (e) { /* ignore */ }
    AH.rpsAbort = null;
    AH.el = null; AH.feed = null; AH.screen = null; AH.seats.clear();
    if (silent === true) { el.remove(); return; }
    el.classList.add('ah-closing');
    setTimeout(() => el.remove(), 520);
  }

  function auctionGavel({ winner, price, bank }) {
    if (!AH.el) return;
    const hall = AH.el;   // 记住自己这一届的厅
    const ham = $('#ah-hammer', AH.el);
    const stage = $('.ah-stage', AH.el);
    const turn = $('#ah-turn', AH.el);
    const bid = $('#ah-bid', AH.el);
    const quit = $('#ah-quit', AH.el);
    if (bid) bid.disabled = true;
    if (quit) quit.disabled = true;
    if (turn) turn.textContent = bank ? '无人应价，银行保底回收…' : '落槌成交！';
    if (ham) ham.classList.add('slam');
    if (stage) setTimeout(() => stage.classList.add('shake'), 260);
    if (typeof SFX !== 'undefined' && SFX.gavel) setTimeout(() => SFX.gavel(), 240);
    ahFeed(bank
      ? `🏦 一锤定音：无人应价，银行以 <b>${fmt(price)}</b> 保底回收`
      : `🎉 一锤定音：<b>${pname(G.players[winner])}</b> 以 <b>${fmt(price)}</b> 竞得拍品！`);
    if (winner != null) {
      const seat = AH.seats.get(winner);
      if (seat) { seat.classList.remove('turn'); seat.classList.add('won'); const st = $('.st', seat); if (st) st.textContent = '🎉 竞得！'; }
    }
    /* 大厅停留片刻让玩家看到落槌，再淡出。
     * 定时器只关闭「自己这一届」的厅：连拍时新厅可能已开（AH.el !== hall），
     * 旧定时器到期必须自动作废，且 auctionOpen 会先 clearTimeout 兜底。 */
    if (AH.closeT) clearTimeout(AH.closeT);
    AH.closeT = setTimeout(() => {
      AH.closeT = null;
      if (AH.el === hall) auctionClose();
    }, 1900);
  }

  function auctionPrompt(p, { idx, price, step, leader, need }) {
    /* 拍卖大厅开着 → 大厅内举牌；否则退回传统弹窗（联机客人侧） */
    if (AH.el) return auctionHallAsk(p, { need, leader, price });
    return new Promise(res => {
      const t = BOARD[idx];
      const m = buildModal(`
        <div class="m-title">🔨 拍卖 · ${t.name}</div>
        <div class="deed mini">${deedHTML(idx)}</div>
        <div class="auc-state">
          <div class="auc-row">当前最高价 <b>${fmt(price)}</b> ${leader
            ? `· <span style="color:${playerColor(leader)}">${pname(leader)}</span> 领先`
            : '· <span class="dim">等待首拍</span>'}</div>
          <div class="auc-row">加价阶梯 <b>${fmt(step)}</b> · 你的现金 <b>${fmt(p.money)}</b></div>
        </div>
        <div class="m-actions center">
          <button class="btn btn-primary" id="auc-bid">💵 出价 ${fmt(need)}</button>
          <button class="btn btn-ghost" id="auc-quit">🚪 退出竞拍</button>
        </div>`, 'nomax');
      $('#auc-bid', m.el).onclick = () => { SFX.click(); m.close(); res('bid'); };
      $('#auc-quit', m.el).onclick = () => { SFX.click(); m.close(); res('quit'); };
    });
  }

  /* 破产清算面板 */
  function sellModal(p, need, list) {
    return new Promise(res => {
      const render = () => {
        const rows = list.map((it, k) => {
          const st = G.tiles[it.idx];
          if (it.kind === 'level' && st.level === 0) return '';
          if (it.kind === 'land' && st.owner !== p.idx) return '';
          const t = BOARD[it.idx];
          const market = t.type === 'prop' ? t.price + st.level * t.buildCost : t.price;
          const auctionable = it.kind === 'land' &&
            alivePlayers().some(q => q.idx !== p.idx && q.money >= market * CFG.AUCTION_START);
          return `<div class="sell-item">
              <div class="si-main"><span>${it.label}</span><small>市值约 ${fmt(market)} · 半价变现 ${fmt(it.refund)}</small></div>
              <b>+${fmt(it.refund)}</b>
              <span class="si-btns">
                ${auctionable ? `<button class="btn btn-mini btn-warn" data-auction="${k}">🔨 拍卖</button>` : ''}
                <button class="btn btn-mini btn-ghost2" data-sell="${k}">变卖</button>
              </span>
            </div>`;
        }).join('') || '<div class="dim" style="padding:10px">已经没有可变卖的资产了…</div>';
        return `<div class="m-title">💀 债务危机！</div>
          <div class="m-cash warn">需要支付 <b>${fmt(need)}</b>，当前现金 <b>${fmt(p.money)}</b></div>
          <div class="sell-tip">💡 提示：<b>拍卖</b>由所有对手竞价，底价就是银行半价、稳赚不亏；无人接盘时银行会自动半价回收。</div>
          <div class="sell-list">${rows}</div>
          <div class="m-actions center"><button class="btn btn-danger" id="giveup">认命破产…</button></div>`;
      };
      const m = buildModal(render(), 'shop');
      const bind = () => {
        $$('[data-sell]', m.el).forEach(b => b.onclick = () => {
          m.close();
          res({ type: 'sell', item: list[+b.dataset.sell] });
        });
        $$('[data-auction]', m.el).forEach(b => b.onclick = () => {
          m.close();
          res({ type: 'auction', item: list[+b.dataset.auction] });
        });
        $('#giveup', m.el).onclick = () => { m.close(); res('giveup'); };
      };
      bind();
    });
  }

  /* 结算画面 */
  /* ================= 本机排行榜（胜场/收租/监狱风云 Top10） ================= */
  function loadRecords() {
    try { return JSON.parse(localStorage.getItem('df_records_v1') || '[]'); } catch (e) { return []; }
  }
  function saveRecords(rs) {
    try { localStorage.setItem('df_records_v1', JSON.stringify(rs.slice(0, 200))); } catch (e) { /* ignore */ }
  }
  function recordMatchResults(ranking) {
    try {
      const rs = loadRecords();
      ranking.forEach((p, i) => {
        /* 只记录真人（本机 / 同屏 / 联机座位）：此前 AI 也入榜，3 个 AI 每局灌 3 条记录，胜场榜被「AI 富老板」霸榜 */
        if (p.ai) return;
        const c = charOf(p);
        const name = p.name || c.name;
        const st = (G.stats && G.stats[p.idx]) || { rentGot: 0, jailed: 0 };
        const worth = netWorth(p);
        let rec = rs.find(x => x.name === name && x.charId === p.charId);
        if (!rec) { rec = { name, charId: p.charId, wins: 0, games: 0, rentGot: 0, jail: 0, bestNet: 0 }; rs.push(rec); }
        rec.games += 1;
        if (i === 0) rec.wins += 1;
        rec.rentGot += (st.rentGot || 0);
        rec.jail += (st.jailed || 0);
        rec.bestNet = Math.max(rec.bestNet || 0, worth);
        rec.last = Date.now();
        if (typeof CAREER !== 'undefined' && p.idx === CAREER.localSeat()) { const eq = CAREER.equipped(); rec.title = eq ? eq.id : ''; }
      });
      saveRecords(rs);
    } catch (e) { /* 排行榜失败不影响对局结算 */ }
  }
  function showLeaderboard() {
    const rs = loadRecords();
    const TABS = [['wins', '🏆 胜场榜', r => r.wins], ['rent', '💰 收租榜', r => r.rentGot], ['jail', '⛓️ 监狱风云榜', r => r.jail]];
    const m = buildModal(`
      <div class="m-title big">🏆 富贵排行榜（本机战绩）</div>
      <div class="lb-tabs">${TABS.map((t, i) => `<button class="lb-tab ${i === 0 ? 'on' : ''}" data-t="${t[0]}">${t[1]}</button>`).join('')}</div>
      <div class="lb-body" id="lb-body"></div>
      <div class="m-actions center"><button class="btn btn-ghost" id="lb-close">关闭</button></div>`, 'nomax');
    const body = $('#lb-body', m.el);
    function render(key, label, val) {
      const top = rs.slice().sort((a, b) => val(b) - val(a)).slice(0, 10);
      const show = v => key === 'rent' ? fmt(v) : String(v | 0);   /* 胜场 / 入狱次数不是金额 */
      body.innerHTML = top.length ? ('<div class="lb-row lb-head"><span>#</span><span>名号</span><span>角色</span><span style="text-align:right">' + label + '</span></div>' +
        top.map((r, i) => `<div class="lb-row"><span class="lb-rk ${i < 3 ? 'top' + (i + 1) : ''}">${i + 1}</span>` +
        `<span class="lb-name">${r.name}${(typeof CAREER !== 'undefined' && r.title && CAREER.byId(r.title)) ? CAREER.badgeHTML(CAREER.byId(r.title), { small: true }) : ''}</span><span class="lb-char">${(CHARACTERS.find(c => c.id === r.charId) || {}).name || ''}</span>` +
        `<span class="lb-val">${show(val(r))}</span></div>`).join('')) : '<div class="dim" style="padding:16px;text-align:center">还没有战绩，先赢一局！</div>';
    }
    m.el.querySelectorAll('.lb-tab').forEach(b => b.onclick = () => {
      m.el.querySelectorAll('.lb-tab').forEach(x => x.classList.remove('on')); b.classList.add('on');
      const t = TABS.find(t => t[0] === b.dataset.t); render(t[0], t[1], t[2]);
    });
    render('wins', '胜场', r => r.wins);
    $('#lb-close', m.el).onclick = () => m.close();
  }

  /* ================= 生涯称号（跨局档案，见 career.js / TITLES_DESIGN.md） ================= */
  function careerUnlockHTML(list) {
    if (!list || !list.length || typeof CAREER === 'undefined') return '';
    /* 一次解锁很多时：稀有度最高的 4 个做大卡，其余收成一行小徽章，结算页不至于被撑爆 */
    const MAX_CARDS = 4;
    const cards = list.slice(0, MAX_CARDS).map((t, i) => {
      const r = CAREER.RARITY[t.rarity] || CAREER.RARITY[1];
      return `<div class="cr-unlock-card r${t.rarity}" style="animation-delay:${120 + i * 70}ms"><span class="cr-unlock-icon">${CAREER.titleSVG(t, 46)}</span><span class="cr-unlock-name">${CAREER.esc(t.name)}</span><span class="cr-unlock-desc">${CAREER.esc(t.desc || t.hint || '')}</span><span class="cr-unlock-rar" style="color:${r.color}">${r.name}</span></div>`;
    }).join('');
    const rest = list.length > MAX_CARDS ? `<div class="cr-unlock-more">还解锁了 ${list.slice(MAX_CARDS).map(t => CAREER.badgeHTML(t, { small: true })).join('')}</div>` : '';
    return `<div class="cr-unlock"><div class="cr-unlock-title">🎖️ 新称号解锁</div><div class="cr-unlock-list">${cards}</div>${rest}<div class="cr-unlock-tip">可在主菜单「🎖️ 生涯称号」中查看进度与更换佩戴</div></div>`;
  }
  function refreshCareerBadge() {
    if (typeof CAREER === 'undefined') return;
    const el = document.getElementById('career-badge');
    if (el) el.innerHTML = CAREER.equippedBadge({ small: true });
    const btn = document.getElementById('btn-career');
    if (btn) btn.textContent = `🎖️ 生涯称号 ${CAREER.unlockedCount()}/${CAREER.catalog().length}`;
  }
  function showCareer() {
    if (typeof CAREER === 'undefined') return;
    const p = CAREER.profile();
    let nick = '';
    try { nick = localStorage.getItem('df_nickname') || ''; } catch (e) { /* ignore */ }
    nick = CAREER.esc(nick || '本机玩家');
    const winRate = p.games ? Math.round(p.wins / p.games * 100) + '%' : '—';
    const total = CAREER.catalog().length;
    const m = buildModal(`
      <div class="m-title big">🎖️ 生涯称号</div>
      <div class="cr-head">
        <div class="cr-who"><div class="cr-who-badge none" id="cr-who-badge">❔</div><div><div class="cr-nick">${nick}</div><div class="cr-eq" id="cr-eq"></div></div></div>
        <div class="cr-stats">
          <div class="cr-stat"><b>${p.games}</b><span>局数</span></div>
          <div class="cr-stat"><b>${p.wins}</b><span>胜场</span></div>
          <div class="cr-stat"><b>${winRate}</b><span>胜率</span></div>
          <div class="cr-stat"><b>${CAREER.fmtNum(p.rentGot, true)}</b><span>累计收租</span></div>
          <div class="cr-stat"><b>${p.jailed}</b><span>入狱</span></div>
          <div class="cr-stat"><b>${CAREER.unlockedCount()}<small style="font-size:11px;color:#9fb59c">/${total}</small></b><span>称号</span></div>
        </div>
      </div>
      <div class="lb-tabs cr-tabs"><button class="lb-tab on" data-t="tracks">阶梯称号</button><button class="lb-tab" data-t="special">特殊成就</button><button class="lb-tab" data-t="stats">生涯数据</button></div>
      <div class="cr-body" id="cr-body"></div>
      <div class="m-actions center"><button class="btn btn-ghost" id="cr-unequip">卸下称号</button><button class="btn btn-ghost" id="cr-close">关闭</button></div>`, 'nomax cr-modal');
    const body = $('#cr-body', m.el);
    let tab = 'tracks';
    const chip = (t) => {
      const got = CAREER.has(t.id), eq = p.equipped === t.id;
      const ico = got ? CAREER.titleSVG(t, 18) : '<span class="lk">🔒</span>';
      return `<span class="cr-chip r${t.rarity} ${got ? 'got' : 'lock'}${eq ? ' eq' : ''}" data-id="${t.id}" title="${CAREER.esc(t.desc || t.hint || '')}">${ico}${CAREER.esc(t.name)}${got ? '' : ` <i>${CAREER.fmtNum(t.need, t.money)}${t.unit || ''}</i>`}</span>`;
    };
    const renderTracks = () => CAREER.tracks().map(tr => {
      const stt = CAREER.trackState(tr, p);
      const icoT = stt.current || stt.tiers[0];
      const ico = `<div class="cr-track-ico${stt.current ? '' : ' lock'}">${CAREER.titleSVG(icoT, 64)}</div>`;
      const head = stt.current ? CAREER.badgeHTML(stt.current, { small: true }) : '<span class="dim">尚未解锁</span>';
      const nextTxt = stt.next ? `下一阶「<b>${CAREER.esc(stt.next.name)}</b>」 ${CAREER.fmtNum(stt.prog.cur, tr.money)} / ${CAREER.fmtNum(stt.prog.need, tr.money)}${tr.unit || ''}` : '✨ 本轨道已登顶';
      const pct = stt.next ? stt.prog.pct : 100;
      return `<div class="cr-track">${ico}<div class="cr-track-head"><span class="cr-track-name">${tr.icon} ${tr.name} <span class="dim">${stt.reached}/${stt.total}</span></span>${head}</div>
        <div><div class="cr-track-prog">${nextTxt}</div><div class="cr-bar"><i style="width:${pct}%"></i></div></div>
        <div class="cr-tiers">${stt.tiers.map(chip).join('')}</div></div>`;
    }).join('');
    const renderSpecial = () => `<div class="cr-grid">${CAREER.specials().map(t => {
      const got = CAREER.has(t.id), eq = p.equipped === t.id, g = got ? null : CAREER.progress(t, p);
      /* 隐藏款（净化心灵三枚）：未解锁时连 hint 与进度条也不显示，只留「？？？（在对局中自会知晓）」 */
      const secret = !got && !!t.hidden;
      const r = CAREER.RARITY[t.rarity];
      return `<div class="cr-card r${t.rarity} ${got ? 'got' : 'lock'}${eq ? ' eq' : ''}${secret ? ' secret' : ''}" data-id="${t.id}">
        <span class="ic">${got ? CAREER.titleSVG(t, 54) : '❔'}</span><span class="nm">${got ? CAREER.esc(t.name) : '？？？'}</span>
        <span class="hint">${secret ? '？？？（在对局中自会知晓）' : CAREER.esc(t.hint)}</span>
        ${(g && !secret) ? `<div class="cr-bar"><i style="width:${g.pct}%"></i></div><span class="hint">${CAREER.fmtNum(g.cur, t.money)} / ${CAREER.fmtNum(g.need, t.money)}</span>` : ''}
        <span class="cr-rar r${t.rarity}">${r.name}</span></div>`;
    }).join('')}</div>`;
    const STAT_ROWS = [['完成局数', 'games'], ['胜场', 'wins'], ['最长连胜', 'bestStreak'], ['最快夺冠（回合）', 'fastestWin'],
      ['累计收租', 'rentGot', true], ['累计缴租', 'rentPaid', true], ['单局最高收租', 'bestMatchRent', true], ['单次最高收租', 'rentBest', true],
      ['单局现金峰值', 'peakMoney', true], ['单局资产峰值', 'bestWorth', true], ['入狱次数', 'jailed'], ['刑满释放', 'served'],
      ['交保释金', 'bail'], ['使用出狱许可证', 'bailCardUsed'], ['购地', 'bought'], ['建筑升级', 'upgrades'], ['城堡落成', 'lv4'],
      ['拍卖竞得', 'auctionWins'], ['同色垄断', 'monopolies'], ['经过起点', 'passStart'], ['乘坐专机', 'flights'], ['放置路障', 'blocksSet'],
      ['撞上路障', 'blocksHit'], ['拆迁令', 'demos'], ['使用道具', 'propsUsed'], ['抽卡', 'cards'], ['奖池所得', 'potWon', true],
      ['踩中幸运格', 'luckyHits'], ['掷出 6 点', 'sixes'], ['破产', 'bankrupt'], ['认输', 'resigned']];
    const renderStats = () => `<div class="cr-stattable">${STAT_ROWS.map(r => {
      const v = p[r[1]] | 0;
      const txt = (r[1] === 'fastestWin' && !v) ? '—' : (r[2] ? CAREER.fmtNum(v, true) : String(v));
      return `<div><span>${r[0]}</span><span>${txt}</span></div>`;
    }).join('')}</div>`;
    const render = () => {
      body.innerHTML = tab === 'tracks' ? renderTracks() : tab === 'special' ? renderSpecial() : renderStats();
      const eqT = CAREER.equipped();
      const who = $('#cr-who-badge', m.el);
      if (who) { who.innerHTML = eqT ? CAREER.titleSVG(eqT, 56) : '❔'; who.classList.toggle('none', !eqT); }
      $('#cr-eq', m.el).innerHTML = eqT
        ? `佩戴中：<b>${CAREER.esc(eqT.name)}</b> · <span style="color:${(CAREER.RARITY[eqT.rarity] || {}).color || '#fff'}">${(CAREER.RARITY[eqT.rarity] || {}).name || ''}</span><br><span class="dim">${CAREER.esc(eqT.desc || eqT.hint || '')}</span>`
        : '尚未佩戴称号<br><span class="dim">点击已解锁的称号即可佩戴</span>';
      body.querySelectorAll('.got[data-id]').forEach(el => el.onclick = () => {
        const id = el.dataset.id;
        CAREER.equip(p.equipped === id ? null : id);
        render(); refreshCareerBadge();
        if (SFX.click) SFX.click();
      });
    };
    m.el.querySelectorAll('.cr-tabs .lb-tab').forEach(b => b.onclick = () => {
      m.el.querySelectorAll('.cr-tabs .lb-tab').forEach(x => x.classList.remove('on')); b.classList.add('on');
      tab = b.dataset.t; render();
    });
    $('#cr-unequip', m.el).onclick = () => { CAREER.equip(null); render(); refreshCareerBadge(); };
    $('#cr-close', m.el).onclick = () => m.close();
    render();
  }

  function showGameOver(ranking, humanWon) {
    /* 净化心灵收尾：改过自新判定并写入诚信档案 —— 必须先于 CAREER.commit（sp_reformed 等成就直接读 df_honor_v1） */
    let psaEnd = null;
    try { if (window.PSA && PSA.onMatchEnd) psaEnd = PSA.onMatchEnd(ranking); } catch (e) { psaEnd = null; }
    /* 生涯档案先折叠（新称号立刻体现在排行榜快照与本页徽章上），再记排行榜；两者任何失败都不影响结算 */
    let career = { unlocked: [] };
    try { if (typeof CAREER !== 'undefined') career = CAREER.commit(ranking) || career; } catch (e) { /* ignore */ }
    recordMatchResults(ranking);
    try { refreshCareerBadge(); } catch (e) { /* ignore */ }
    return new Promise(res => {
      const medals = ['🥇', '🥈', '🥉', '🏅'];
      const rows = ranking.map((p, i) => {
        const c = charOf(p);
        const face = i === 0 && c.poseCheer ? c.poseCheer : c.avatarImg;
        const st = (G.stats && G.stats[p.idx]) || { rentGot: 0, rentPaid: 0, jailed: 0 };
        const who = p.ai ? '' : (p.name ? `（${p.name}）` : '（你）');
        const reformed = !!(psaEnd && psaEnd.reformed && psaEnd.reformed.indexOf(p.idx) >= 0);
        const psaTags = (reformed ? '<span class="bd bd-reform" title="净化心灵后整局再未致人入狱">🌱 改过自新</span>' : '')
          + (p.honorTag ? `<span class="bd bd-dishonor" title="本局带入的失信标记（初始资金 −20%）">🚫 ${p.honorTag}</span>` : '');
        return `<div class="rank-row ${i === 0 ? 'champ' : ''}">
          <span class="rk-medal">${medals[i] || '🏅'}</span>
          <span class="rk-ava ${i === 0 ? 'rk-cheer' : ''}" style="--pc:${c.color}"><img src="${face}" alt="" draggable="false"></span>
          <span class="rk-main"><span class="rk-name">${c.name}${who}${(typeof CAREER !== 'undefined') ? CAREER.badgeForSeat(p.idx, { small: true }) : ''}${psaTags}</span>
            <span class="rk-sub">收租 ${fmt(st.rentGot)} · 缴租 ${fmt(st.rentPaid)} · 入狱 ${st.jailed} 次</span></span>
          <span class="rk-worth">${fmt(netWorth(p))}${p.alive ? '' : ' · 破产'}</span>
        </div>`;
      }).join('');
      const unlockHTML = careerUnlockHTML(career.unlocked);
      const m = buildModal(`
        <div class="m-title big">${humanWon ? '🎉 恭喜夺冠！' : '🏁 游戏结束'}</div>
        <div class="rank-list">${rows}</div>${unlockHTML}
        <div class="m-actions center">
          <button class="btn btn-primary" id="go-again">再来一局</button>
          <button class="btn btn-ghost" id="go-menu">返回主菜单</button>
        </div>`, 'nomax noblock');
      if (humanWon || career.unlocked.length) confetti();
      if (psaEnd && psaEnd.reformed && psaEnd.reformed.length) toast('🌱 改过自新：净化心灵后再未致人入狱', '🌱');
      if (career.unlocked.length === 1) toast(`🎖️ 称号解锁：${career.unlocked[0].icon} ${career.unlocked[0].name}`, '🎖️');
      else if (career.unlocked.length > 1) toast(`🎖️ 一举解锁 ${career.unlocked.length} 个新称号！`, '🎖️');
      $('#go-again', m.el).onclick = () => { m.close(); res('again'); };
      $('#go-menu', m.el).onclick = () => { m.close(); res('menu'); };
    });
  }

  function confetti() {
    const cv = $('#confetti');
    const ctx = cv.getContext('2d');
    /* 舞台尺寸（强制横屏旋转后与视口宽高互换；main.js 维护 __stage） */
    const st = window.__stage || { w: innerWidth, h: innerHeight };
    cv.width = st.w || innerWidth; cv.height = st.h || innerHeight;
    cv.style.display = 'block';
    const colors = ['#f0a818', '#ff5964', '#2ecc71', '#3d7bff', '#b45cf2', '#22d3d3', '#ffd166'];
    const parts = Array.from({ length: 160 }, () => ({
      x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.5,
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
      vy: 2 + Math.random() * 3, vx: -1.5 + Math.random() * 3,
      rot: Math.random() * Math.PI, vr: -0.12 + Math.random() * 0.24,
      c: colors[rnd(colors.length)],
    }));
    let frames = 0;
    cancelAnimationFrame(confettiTimer);
    (function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y > cv.height + 20) { p.y = -20; p.x = Math.random() * cv.width; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      if (++frames < 420) confettiTimer = requestAnimationFrame(tick);
      else { ctx.clearRect(0, 0, cv.width, cv.height); cv.style.display = 'none'; }
    })();
  }

  /* 玩家死亡/返回主菜单等场景下，清理所有瞬态等待 */
  function abortTransient() {
    /* 净化心灵影院遮罩 + 管控态一并拆除（回菜单/重开后不残留锁屏；不计逃避） */
    try { if (window.PSA && PSA.abort) PSA.abort(); } catch (e) { /* */ }
    if (rollResolver) {
      const r = rollResolver; rollResolver = null;
      $('#btn-roll').classList.remove('show');
      r(-1);
    }
    if (picking) endPick(null);
    document.querySelectorAll('#cutscene').forEach(e => e.remove());
    const to = $('#toasts'); if (to) to.innerHTML = '';
    ntReset();            // 播报条队列清空（新局/回菜单不残留上局事件）
    auctionClose(true);   // 重开/回菜单时随手拆掉拍卖大厅
    /* 残留弹窗一并拆除并归零计数：main.restart/backToMenu 直接清空 #modal-root 时不会走 close()，
     * modalOpen 会永久 >0 → 新一局里点格子/悬停地契全部失效（对抗性审查 #R1） */
    const mr = $('#modal-root'); if (mr) mr.innerHTML = '';
    modalOpen = 0;
    hideDeedHover();
  }

  /* 游戏速度（1 / 1.6 / 2.4）持久化：重开、再来一局、联机开局都沿用玩家上次的选择 */
  const SPEED_STEPS = [1, 1.6, 2.4];
  function speedLabel(sp) { return sp === 1 ? '1×' : (sp === 1.6 ? '2×' : '3×'); }
  function applySpeed(sp, { persist = true } = {}) {
    sp = SPEED_STEPS.indexOf(sp) >= 0 ? sp : 1;
    G.speed = sp;
    const b = $('#btn-speed'); if (b) b.textContent = speedLabel(sp);
    if (persist) { try { localStorage.setItem('df_speed', String(sp)); } catch (e) { /* ignore */ } }
    return sp;
  }
  function loadSpeed() {
    try { const v = parseFloat(localStorage.getItem('df_speed')); return SPEED_STEPS.indexOf(v) >= 0 ? v : 1; } catch (e) { return 1; }
  }

  /* ================= 移动端 HUD（纯表现层：玩家面板抽屉开关 / 触控按压态；不触碰对局逻辑） =================
   * ≤1099px 时 #side 由 CSS 变为右侧抽屉（style.css 移动端段），这里只负责：
   *   - 往顶栏注入 👥 开关（#side-toggle，≥1100px 由 CSS 隐藏）
   *   - body.side-open 类切换：点开关 / 点抽屉外部 / Esc
   *   - .t-press 按压态（委托 pointerdown），与 :active 等价，兜底 iOS 上 :active 偶发不触发 */
  let _mobileHudDone = false;
  function isSideOpen() {
    return !!(document.body && document.body.classList && document.body.classList.contains('side-open'));
  }
  function setSideOpen(v) {
    if (!document.body || !document.body.classList) return;
    document.body.classList.toggle('side-open', !!v);
    const t = document.getElementById('side-toggle');
    if (t && t.setAttribute) t.setAttribute('aria-expanded', v ? 'true' : 'false');
  }
  function mountMobileHud() {
    if (_mobileHudDone) return;
    _mobileHudDone = true;
    try {
      const bar = document.querySelector('#topbar .tb-actions');
      if (bar && !document.getElementById('side-toggle')) {
        const b = document.createElement('button');
        b.id = 'side-toggle'; b.className = 'tb-btn side-toggle'; b.type = 'button';
        b.title = '玩家面板 / 战报'; b.setAttribute('aria-label', '玩家面板'); b.setAttribute('aria-expanded', 'false');
        b.textContent = '👥';
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          setSideOpen(!isSideOpen());
          try { SFX.click(); } catch (err) { /* 无声环境 */ }
        });
        bar.appendChild(b);
      }
      /* 点抽屉外部 / Esc 关闭（≥1100px 抽屉不存在，body.side-open 无副作用） */
      document.addEventListener('click', (e) => {
        if (!isSideOpen()) return;
        const t = e.target;
        if (t && t.closest && (t.closest('#side') || t.closest('#side-toggle'))) return;
        setSideOpen(false);
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isSideOpen()) setSideOpen(false); });
      /* 触控按压态 */
      const PRESS = '.btn, .tb-btn, .pchip, .seg button, .dp-btn, .lb-tab, .v3d-cam-btn';
      document.addEventListener('pointerdown', (e) => {
        const t = e.target && e.target.closest ? e.target.closest(PRESS) : null;
        if (t && !t.disabled && t.classList) t.classList.add('t-press');
      }, { passive: true });
      const clearPress = () => {
        const list = document.querySelectorAll ? document.querySelectorAll('.t-press') : [];
        for (let i = 0; i < list.length; i++) list[i].classList.remove('t-press');
      };
      document.addEventListener('pointerup', clearPress, { passive: true });
      document.addEventListener('pointercancel', clearPress, { passive: true });
      if (window.addEventListener) window.addEventListener('blur', clearPress);
    } catch (e) { /* 桩环境 / 无 DOM 忽略 */ }
  }

  /* ================= 对局场景初始化 ================= */
  function initGameScene() {
    uixStyle();
    ntReset();
    buildBoard();
    buildDice();
    buildTokens();
    buildPlayersPanel();
    mountMobileHud();
    setSideOpen(false);   /* 新一局默认收起抽屉（上局可能开着回了主菜单） */
    renderBlocks();
    updateTileAll();
    updateHUD();
    $('#log-feed').innerHTML = '';
    log('目标：让对手全部破产，或在回合结束时成为首富！', 'turn');
    log('点击「掷骰子」或按空格键开始', 'dice');
    requestAnimationFrame(() => { measure(); layoutTokens(false); });
  }

  /* 全局按钮 */
  function bindChrome() {
    let lastTick = 0;
    document.addEventListener('mouseover', (e) => {
      if (!e.target.closest) return;
      if (e.target.closest('.btn, .tb-btn, .pchip, .dp-btn')) {
        const now = performance.now();
        if (now - lastTick > 90) { lastTick = now; SFX.tick(); }
      }
    });
    $('#btn-roll').addEventListener('click', tryFireRoll);
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !e.repeat) {
        const t = e.target;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;   /* 聊天框/昵称框里打空格不掷骰 */
        if (document.querySelector('#auction-hall:not(.ah-closing),.modal-mask.show,#cutscene.show,#reconnect.show')) return;   /* 可见覆盖层期间空格交给覆盖层 */
        e.preventDefault(); tryFireRoll();
      }
      if (e.code === 'Escape' && !e.repeat) {
        /* 自救键：清除隐藏残骸覆盖层（正常流程本就会移除，这里防任何路径的残留卡死键位门控） */
        document.querySelectorAll('#cutscene:not(.show),#reconnect:not(.show),#auction-hall.ah-closing').forEach(function (el) { el.remove(); });
      }
    });
    const syncAudioBtns = () => {
      $('#btn-sound').textContent = SFX.isEnabled() ? '🔊' : '🔇';
      const bb = $('#btn-bgm'); if (bb) { bb.textContent = BGM.isEnabled() ? '🎵' : '🎵'; bb.style.opacity = BGM.isEnabled() ? 1 : 0.42; }
    };
    $('#btn-sound').addEventListener('click', () => {
      SFX.setEnabled(!SFX.isEnabled());
      syncAudioBtns();
      toast(SFX.isEnabled() ? '系统音效已开启（骰子/事件等）' : '系统音效已关闭', SFX.isEnabled() ? '🔊' : '🔇');
    });
    if ($('#btn-bgm')) $('#btn-bgm').addEventListener('click', () => {
      BGM.setEnabled(!BGM.isEnabled());
      syncAudioBtns();
      toast(BGM.isEnabled() ? '游戏音乐已开启' : '游戏音乐已关闭', BGM.isEnabled() ? '🎵' : '🚫');
    });
    syncAudioBtns();
    $('#btn-speed').addEventListener('click', () => {
      const sp = G.speed >= 2.4 ? 1 : (G.speed >= 1.6 ? 2.4 : 1.6);
      applySpeed(sp);
      SFX.click();
    });
    $('#btn-rules').addEventListener('click', () => {
      const m = buildModal(`
        <div class="m-title">📖 玩法说明</div>
        <div class="m-body rules">
          <p><b>🌦️ 季节事件</b>：每回合随机一种全局氛围——🏗️建设周（升级 4 折）、💰收租季（租金+30%）、🧧财神日（工资翻倍），顶栏实时显示，博弈节奏常变常新。</p>
          <p><b>🎯 胜利条件</b>：让其他玩家全部破产；或选择回合上限时，在回合数耗尽时总资产（现金+地产）排名第一。可选「不限回合」，一直角逐到场上只剩最后赢家。</p>
          <p><b>🎲 行动</b>：轮到你时点击「掷骰子」（或按空格）。经过起点领工资 ${fmt(CFG.SALARY)}。事件过场可按空格键快速跳过。</p>
          <p><b>⭐ 幸运格</b>：每回合随机一块地变为幸运金格，踩中立刻 +${fmt(CFG.LUCKY_REWARD)}，先到先得。</p>
          <p><b>🏠 地产</b>：踩到无主地可购买；踩到自己的地可花钱升级（空地→小屋→洋房→大厦→城堡），等级越高租金越贵；集齐同色全部地产，空地租金翻倍。踩到别人的地要交租金（护身符可免一次）。</p>
          <p><b>🔨 拍卖（还债专用）</b>：濒临破产变卖资产时，土地可以挂牌公开拍卖——所有对手轮流出价，底价就是银行半价、稳赚不亏，价高者得，拍卖款直接用于还债；无人接盘或无人有能力接盘时，银行会自动按半价保底回收。放弃购买不会触发拍卖。</p>
          <p><b>🚉 车站/公共事业</b>：持有的车站越多、公司越多，租金越高（公共事业租金按骰子点数计算）。</p>
          <p><b>🧾 税与奖池</b>：所得税、奢侈税与各类罚金进入中央公园「奖池」；踩到中央公园的人独得奖池。</p>
          <p><b>🛒 道具</b>：踩「道具商店」购买。你的回合掷骰前可点击头像旁的道具使用：遥控骰子（指定点数）、路障（拦截路人）、护身符（免租一次）、拆迁令（拆对手一层楼）、均富卡（全场现金平均）。</p>
          <p><b>⛓️ 监狱</b>：踩拘留所或抽中入狱卡会被警车押送入狱，可交 $2,000 保释、用出狱许可证，或蹲满 2 回合自动释放。<b>玩家在押期间，其他人经过他的地产一律免租</b>——蹲监狱的代价。</p>
          <p><b>💀 破产</b>：付不起钱时先尝试拍卖资产，仍然不够（或选择认命）即破产出局。输定了不想陪跑？顶栏「🔄 重开」菜单里可以 <b>🏳️ 认输</b>（自己回合的掷骰前或别人的回合），按破产结算并立即看结果。</p>
        </div>
        <div class="m-actions center"><button class="btn btn-primary">明白了</button></div>`, 'nomax');
      $('.m-actions .btn', m.el).onclick = () => m.close();
    });
    $('#btn-restart').addEventListener('click', () => {
      /* 认输候选：本机人类座位（房主排除远程座位）。唯一本机人类 → 任何时候（非自己决策弹窗中）；
       * 同屏多人 → 只有轮到自己且正等待掷骰的那位可以认输 */
      const locals = (G.players || []).filter(p => p.alive && !p.ai && !(NET.active && NET.isRemoteSeat(p.idx)));
      let cand = null;
      if (typeof canResign === 'function' && !window.__netGuest) {
        if (locals.length === 1 && canResign(locals[0])) cand = locals[0];
        else if (locals.length > 1) { const c = G.players[G.cur]; if (c && locals.includes(c) && canResign(c)) cand = c; }
      }
      const guest = !!window.__netGuest;
      const m = buildModal(`
        <div class="m-title">🔄 ${guest ? '对局菜单' : '重新开始？'}</div>
        <div class="m-body">${guest ? '联机对局由房主控制重开；你可以返回主菜单离开房间。' : '当前对局进度将丢失。'}</div>
        <div class="m-actions center">
          ${guest ? '' : '<button class="btn btn-primary" id="rs-yes">重新开始</button>'}
          ${(!guest && locals.length && !G.over) ? `<button class="btn btn-resign" id="rs-resign" ${cand ? '' : 'disabled'} title="${cand ? `${pname(cand)} 认输离场，按破产结算` : '请在自己回合的掷骰前（或别人的回合）认输'}">🏳️ 认输${cand && locals.length > 1 ? `（${pname(cand)}）` : ''}</button>` : ''}
          <button class="btn btn-ghost" id="rs-menu">🏠 返回主菜单</button>
          <button class="btn btn-ghost" id="rs-no">继续游戏</button>
        </div>`, 'nomax');
      const yes = $('#rs-yes', m.el); if (yes) yes.onclick = () => { m.close(); main.restart(); };
      const rs = $('#rs-resign', m.el);
      if (rs) rs.onclick = async () => {
        if (!cand) return;
        m.close();
        const sure = await choice({ title: '🏳️ 确认认输？', html: `<p><b>${pname(cand)}</b> 将按破产处理：资产归还银行、排名垫底。</p>`,
          choices: [{ v: true, label: '认输离场', kind: 'danger' }, { v: false, label: '再想想', kind: 'ghost' }] });
        if (sure && typeof resign === 'function') {
          const done = await resign(cand);
          if (!done) toast('现在不能认输：请在自己回合的掷骰前，或别人的回合再试', '🚫');
        }
      };
      $('#rs-menu', m.el).onclick = () => { m.close(); main.backToMenu(); };
      $('#rs-no', m.el).onclick = () => m.close();
    });
    $('#btn-menu').addEventListener('click', () => {
      const m = buildModal(`
        <div class="m-title">🏠 返回主菜单？</div>
        <div class="m-body">当前对局进度将丢失，确定要离开吗？</div>
        <div class="m-actions center">
          <button class="btn btn-danger" id="bm-yes">返回主菜单</button>
          <button class="btn btn-ghost" id="bm-no">继续游戏</button>
        </div>`, 'nomax');
      $('#bm-yes', m.el).onclick = () => { m.close(); main.backToMenu(); };
      $('#bm-no', m.el).onclick = () => m.close();
    });
    window.addEventListener('resize', () => { measure(); renderBlocks(); });
    $('#btn-cancel-pick').addEventListener('click', () => endPick(null));
  }

  return {
    initGameScene, moveToken, removeToken, updateTile, updateTileAll,
    updatePlayers, updateHUD, setActive, setPhase, rollDice, waitRoll, tryFireRoll,
    moneyFloat, floatAt, toast, news, log, choice, showCard, shopModal, sellModal,
    showGameOver, bindChrome, measure, renderBlocks, confetti, flashTile, deedHTML,
    rideStart, rideEnd, splash, auctionPrompt, cancelRollFor, tileFx, fireworkAtTile, propFanfare, arrestCutscene, abortTransient,
    showLeaderboard, showCareer, refreshCareerBadge,
    auctionOpen, auctionTurn, auctionBid, auctionPass, auctionGavel, auctionClose, auctionJoinAsk, auctionRps,
    setTokenHidden, cashFlowHTML,
    applySpeed, loadSpeed, propTargetFilter, propPlayerFilter, propHasTarget, fireRemoteRoll, rollPending,
    pickTile, endPick,
    set onPick(fn) { pickHook = typeof fn === 'function' ? fn : null; },
    _numberPicker: numberPicker, numberPicker,
    get modalOpenCount() { return modalOpen; },
    get auctionHallOpen() { return !!AH.el; },
  };
})();
