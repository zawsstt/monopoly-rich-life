/* ============================================================
 * 生涯称号系统：跨局累计数据 → 称号图鉴解锁 → 佩戴展示
 * 纯装饰，不影响对局数值。档案仅存本机 localStorage（df_career_v1），不上传。
 * 设计文档：D:\minimax\f1\TITLES_DESIGN.md
 * ============================================================ */
'use strict';

const CAREER = (() => {
  const KEY = 'df_career_v1';
  const VERSION = 1;

  const RARITY = {
    1: { name: '常见', color: '#c9d6cf' },
    2: { name: '精良', color: '#5fd38a' },
    3: { name: '稀有', color: '#5aa9ff' },
    4: { name: '史诗', color: '#c37bff' },
    5: { name: '传说', color: '#ffc63a' },
  };

  /* 生涯累计字段默认值（缺字段时补齐，兼容旧档案） */
  const DEFAULTS = {
    games: 0, wins: 0, streak: 0, bestStreak: 0, comebackWins: 0, fastestWin: 0,
    safeStreak: 0, freeStreak: 0,
    rentGot: 0, rentPaid: 0, bestMatchRent: 0, rentBest: 0,
    jailed: 0, served: 0, bail: 0, bailCardUsed: 0,
    bought: 0, upgrades: 0, lv4: 0, auctionWins: 0, monopolies: 0,
    passStart: 0, flights: 0, blocksSet: 0, blocksHit: 0, demos: 0, propsUsed: 0,
    cards: 0, potWon: 0, luckyHits: 0, sixes: 0,
    bankrupt: 0, resigned: 0, peakMoney: 0, bestWorth: 0,
    /* 道具体系 2.0 计数器（二期可挂称号：🚛 拆弹专家 sweeps≥10 / 🦝 江洋大盗 steals≥5）+ 致人入狱归因（净化心灵彩蛋） */
    sweeps: 0, steals: 0, insuredSave: 0, pierce: 0, piggySave: 0, rushes: 0, jailCaused: 0,
  };
  /* 单局统计（G.stats[seat]）里直接累加进生涯的字段（jailedBy 为按座位归因的对象，不在此累加） */
  const SUM_KEYS = ['rentGot', 'rentPaid', 'jailed', 'served', 'bail', 'bailCardUsed', 'bought', 'upgrades', 'lv4',
    'auctionWins', 'monopolies', 'passStart', 'flights', 'blocksSet', 'blocksHit', 'demos', 'propsUsed',
    'cards', 'potWon', 'luckyHits', 'sixes', 'bankrupt', 'resigned',
    'sweeps', 'steals', 'insuredSave', 'pierce', 'piggySave', 'rushes', 'jailCaused'];

  /* 阶梯轨道：tiers = [名称, 阈值, 描述]；rarities 与 tiers 等长，终阶一律传说 */
  const TRACKS = [
    { id: 'win', name: '征战', icon: '🏆', stat: 'wins', unit: '胜', rarities: [1, 2, 3, 4, 5], tiers: [
      ['初露锋芒', 1, '赢下人生第一局'], ['常胜将军', 5, '累计 5 场胜利'], ['富贵战神', 15, '累计 15 场胜利'],
      ['一代宗师', 40, '累计 40 场胜利'], ['万世财神', 100, '累计 100 场胜利']] },
    { id: 'rent', name: '收租', icon: '💰', stat: 'rentGot', money: true, rarities: [1, 2, 3, 4, 5], tiers: [
      ['包租新手', 30000, '累计收租 3 万'], ['街口地主', 150000, '累计收租 15 万'], ['城区房东', 500000, '累计收租 50 万'],
      ['地产大亨', 1500000, '累计收租 150 万'], ['四海财主', 5000000, '累计收租 500 万']] },
    { id: 'jail', name: '监狱风云', icon: '⛓️', stat: 'jailed', unit: '次', rarities: [1, 2, 3, 4, 5], tiers: [
      ['初进宫', 1, '第一次被关进监狱'], ['监狱常客', 5, '累计入狱 5 次'], ['牢中老炮', 15, '累计入狱 15 次'],
      ['铁窗诗人', 30, '累计入狱 30 次'], ['风云终身成就', 60, '累计入狱 60 次，监狱风云榜的传奇']] },
    { id: 'games', name: '资历', icon: '🎲', stat: 'games', unit: '局', rarities: [1, 2, 3, 4, 5], tiers: [
      ['初来乍到', 1, '完成第一局'], ['棋盘熟客', 10, '完成 10 局'], ['资深玩家', 30, '完成 30 局'],
      ['富贵老兵', 80, '完成 80 局'], ['传奇人生', 200, '完成 200 局']] },
    { id: 'buy', name: '置业', icon: '🏠', stat: 'bought', unit: '块', rarities: [1, 2, 3, 5], tiers: [
      ['首套房主', 5, '累计购地 5 块'], ['收地达人', 25, '累计购地 25 块'], ['圈地大王', 70, '累计购地 70 块'], ['半城之主', 180, '累计购地 180 块']] },
    { id: 'castle', name: '营造', icon: '🏰', stat: 'lv4', unit: '座', rarities: [1, 2, 3, 5], tiers: [
      ['城堡主人', 1, '第一座城堡落成'], ['摩天狂魔', 5, '累计落成 5 座城堡'], ['造城大师', 15, '累计落成 15 座城堡'], ['天际线缔造者', 40, '累计落成 40 座城堡']] },
    { id: 'pot', name: '机遇', icon: '🎰', stat: 'potWon', money: true, rarities: [1, 2, 3, 5], tiers: [
      ['小锦鲤', 10000, '累计捧走奖池 1 万'], ['公园财神', 50000, '累计捧走奖池 5 万'], ['奖池收割机', 150000, '累计捧走奖池 15 万'], ['天选锦鲤', 500000, '累计捧走奖池 50 万']] },
    { id: 'fly', name: '飞行', icon: '✈️', stat: 'flights', unit: '次', rarities: [1, 2, 3, 5], tiers: [
      ['首航乘客', 1, '第一次登上专机'], ['空中飞人', 4, '累计乘坐专机 4 次'], ['云端常客', 12, '累计乘坐专机 12 次'], ['私人机队', 30, '累计乘坐专机 30 次']] },
    { id: 'prop', name: '道具', icon: '🧰', stat: 'propsUsed', unit: '次', rarities: [1, 3, 5], tiers: [
      ['道具学徒', 5, '累计使用道具 5 次'], ['机关算尽', 30, '累计使用道具 30 次'], ['千术大师', 100, '累计使用道具 100 次']] },
  ];

  /* 净化心灵彩蛋三枚隐藏成就（DESIGN_PSA_EGG.md §7）：判定直接读诚信档案 localStorage.df_honor_v1（psa.js 维护），
   * 本模块不依赖 psa.js；缺档案 / 损坏 JSON 一律视为未达成 */
  function honorState() {
    try { const h = JSON.parse(localStorage.getItem('df_honor_v1') || 'null'); return (h && typeof h === 'object') ? h : {}; } catch (e) { return {}; }
  }
  const HIDDEN_HINT = '？？？（在对局中自会知晓）';

  /* 特殊成就：未解锁前只显示提示语；prog 可选，返回 [当前, 目标] 用于进度条；hidden=true 的隐藏款未解锁时连 hint 也不显示（uix.renderSpecial） */
  const SPECIALS = [
    { id: 'sp_comeback', name: '东山再起', icon: '🔥', rarity: 4, hint: '生涯破产过之后，再度夺冠', cond: s => s.comebackWins >= 1 },
    { id: 'sp_richnight', name: '一夜暴富', icon: '💸', rarity: 3, hint: '单局收租达到 10 万', cond: s => s.bestMatchRent >= 100000, prog: s => [s.bestMatchRent, 100000], money: true },
    { id: 'sp_onehit', name: '一击致富', icon: '💥', rarity: 4, hint: '单次收租达到 5 万', cond: s => s.rentBest >= 50000, prog: s => [s.rentBest, 50000], money: true },
    { id: 'sp_streak3', name: '三连庄', icon: '🀄', rarity: 3, hint: '连续 3 局夺冠', cond: s => s.bestStreak >= 3, prog: s => [s.bestStreak, 3] },
    { id: 'sp_streak5', name: '五连庄', icon: '🀄', rarity: 5, hint: '连续 5 局夺冠', cond: s => s.bestStreak >= 5, prog: s => [s.bestStreak, 5] },
    { id: 'sp_blitz', name: '闪电富豪', icon: '⚡', rarity: 5, hint: '15 回合内夺冠', cond: s => s.fastestWin > 0 && s.fastestWin <= 15 },
    { id: 'sp_unbroken', name: '不败金身', icon: '🛡️', rarity: 3, hint: '连续 10 局不破产', cond: s => s.safeStreak >= 10, prog: s => [s.safeStreak, 10] },
    { id: 'sp_lawful', name: '守法公民', icon: '😇', rarity: 5, hint: '连续 10 局不进监狱', cond: s => s.freeStreak >= 10, prog: s => [s.freeStreak, 10] },
    { id: 'sp_sixes', name: '六六大顺', icon: '🎲', rarity: 2, hint: '累计掷出 66 个 6 点', cond: s => s.sixes >= 66, prog: s => [s.sixes, 66] },
    { id: 'sp_escape', name: '越狱专家', icon: '🎫', rarity: 2, hint: '使用出狱许可证 5 次', cond: s => s.bailCardUsed >= 5, prog: s => [s.bailCardUsed, 5] },
    { id: 'sp_demo', name: '拆迁办主任', icon: '💣', rarity: 2, hint: '使用拆迁令 10 次', cond: s => s.demos >= 10, prog: s => [s.demos, 10] },
    { id: 'sp_mono', name: '垄断巨头', icon: '🏙️', rarity: 3, hint: '完成同色垄断 5 次', cond: s => s.monopolies >= 5, prog: s => [s.monopolies, 5] },
    { id: 'sp_auction', name: '拍卖场之王', icon: '🔨', rarity: 3, hint: '拍卖竞得 10 块地', cond: s => s.auctionWins >= 10, prog: s => [s.auctionWins, 10] },
    { id: 'sp_block', name: '路霸', icon: '🚧', rarity: 2, hint: '放置路障 20 次', cond: s => s.blocksSet >= 20, prog: s => [s.blocksSet, 20] },
    { id: 'sp_peak', name: '首富时刻', icon: '👑', rarity: 3, hint: '单局手握现金 30 万', cond: s => s.peakMoney >= 300000, prog: s => [s.peakMoney, 300000], money: true },
    { id: 'sp_laps', name: '起点常客', icon: '🚩', rarity: 1, hint: '累计经过起点 100 次', cond: s => s.passStart >= 100, prog: s => [s.passStart, 100] },
    /* —— 净化心灵彩蛋（隐藏款） —— */
    { id: 'sp_purify', name: '净化心灵', icon: '🕊️', rarity: 4, hidden: true, hint: HIDDEN_HINT, desc: '心灵净化者：同一局致三人入狱，被强制送去净化心灵', cond: () => (honorState().eggSeen | 0) >= 1 },
    { id: 'sp_dishonor', name: '失信人员', icon: '🚫', rarity: 1, hidden: true, hint: HIDDEN_HINT, desc: '净化心灵中途逃离页面，被记入诚信档案（勿效仿）', cond: () => (honorState().violated | 0) >= 1 },
    { id: 'sp_reformed', name: '改过自新', icon: '🌱', rarity: 5, hidden: true, hint: HIDDEN_HINT, desc: '净化心灵之后，整局再未致任何人入狱', cond: () => (honorState().reformed | 0) >= 1 },
  ];

  const CATALOG = [];
  TRACKS.forEach(tr => {
    tr.tiers.forEach((t, i) => {
      CATALOG.push({ id: tr.id + '_' + (i + 1), track: tr.id, tier: i + 1, name: t[0], need: t[1], desc: t[2],
        icon: tr.icon, rarity: tr.rarities[i], stat: tr.stat, money: !!tr.money, unit: tr.unit || '' });
    });
  });
  SPECIALS.forEach(s => { s.track = 'special'; CATALOG.push(s); });
  const BY_ID = {};
  CATALOG.forEach(t => { BY_ID[t.id] = t; });
  function byId(id) { return (id && BY_ID[id]) || null; }

  /* ---------- 档案持久化 ---------- */
  let cache = null;
  function load() {
    if (cache) return cache;
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { raw = null; }
    const p = Object.assign({}, DEFAULTS, (raw && typeof raw === 'object') ? raw : {});
    Object.keys(DEFAULTS).forEach(k => { if (typeof p[k] !== 'number' || !isFinite(p[k]) || p[k] < 0) p[k] = DEFAULTS[k]; });
    if (!p.titles || typeof p.titles !== 'object' || Array.isArray(p.titles)) p.titles = {};
    if (typeof p.equipped !== 'string' || !byId(p.equipped) || !p.titles[p.equipped]) p.equipped = null;
    p.pinned = !!p.pinned;
    p.lastToken = (typeof p.lastToken === 'string') ? p.lastToken : null;
    if (!p.created) p.created = Date.now();
    p.v = VERSION;
    cache = p;
    return p;
  }
  function save(p) {
    cache = p;
    try { localStorage.setItem(KEY, JSON.stringify(p)); } catch (e) { /* 存储满/禁用：本局不落盘，不影响对局 */ }
  }
  function reset() {
    cache = null;
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
  }

  /* ---------- 本机座位判定 ----------
   * 联机客机 = NET.mySeat；联机房主 / 单机 / 同屏 = 大厅点选角色所在座位（G.localIdx）；观战 = -1 */
  function localSeat() {
    try {
      if (typeof G === 'undefined' || !G.players || !G.players.length) return -1;
      const net = (typeof NET !== 'undefined') ? NET : null;
      if (net && net.active) {
        if (!net.isHost) return (net.mySeat >= 0 && G.players[net.mySeat]) ? net.mySeat : -1;
        if (G.localIdx >= 0 && G.players[G.localIdx]) return G.localIdx;
        return G.players.findIndex(p => !p.ai && !(typeof net.isRemoteSeat === 'function' && net.isRemoteSeat(p.idx)));
      }
      if (G.localIdx >= 0 && G.players[G.localIdx]) return G.localIdx;
      return G.players.findIndex(p => !p.ai);
    } catch (e) { return -1; }
  }

  /* ---------- 解锁评估 ---------- */
  function evaluate(p) {
    const out = [];
    CATALOG.forEach(t => {
      if (p.titles[t.id]) return;
      let ok = false;
      try { ok = t.cond ? !!t.cond(p) : ((p[t.stat] | 0) >= t.need); } catch (e) { ok = false; }
      if (ok) out.push(t);
    });
    return out;
  }
  function autoEquip(p, unlocked) {
    if (!unlocked.length || p.pinned) return;
    const cur = byId(p.equipped);
    const best = unlocked.slice().sort((a, b) => b.rarity - a.rarity)[0];
    if (!cur || best.rarity >= cur.rarity) p.equipped = best.id;
  }

  /* 一局结束：把本机座位的单局统计折叠进生涯档案，返回 { unlocked, won, seat, skipped } */
  function commit(ranking) {
    const out = { unlocked: [], won: false, seat: -1, skipped: null };
    try {
      if (typeof G === 'undefined' || !G.players || !G.players.length) { out.skipped = 'no-game'; return out; }
      if (G.demoMode) { out.skipped = 'demo'; return out; }
      if (G.matchAborted) { out.skipped = 'aborted'; return out; }
      const seat = localSeat();
      if (seat < 0 || !G.players[seat]) { out.skipped = 'no-local-seat'; return out; }
      const token = G.matchToken || ('g' + G.gameId);
      const p = load();
      if (p.lastToken && p.lastToken === token) { out.skipped = 'dup'; return out; }

      const me = G.players[seat];
      const st = (G.stats && G.stats[seat]) || {};
      const won = !!(ranking && ranking[0] && ranking[0].idx === seat && me.alive);
      const hadBankrupt = p.bankrupt > 0;

      p.games += 1;
      if (won) {
        p.wins += 1;
        p.streak += 1;
        p.bestStreak = Math.max(p.bestStreak, p.streak);
        if (hadBankrupt) p.comebackWins += 1;
        const r = G.round | 0;
        if (r > 0 && (!p.fastestWin || r < p.fastestWin)) p.fastestWin = r;
      } else {
        p.streak = 0;
      }
      SUM_KEYS.forEach(k => { p[k] += Math.max(0, st[k] | 0); });
      p.bestMatchRent = Math.max(p.bestMatchRent, st.rentGot | 0);
      p.rentBest = Math.max(p.rentBest, st.rentBest | 0);
      p.peakMoney = Math.max(p.peakMoney, st.peakMoney | 0, me.money | 0);
      const worth = (typeof netWorth === 'function') ? (netWorth(me) | 0) : (me.money | 0);
      p.bestWorth = Math.max(p.bestWorth, worth);
      p.safeStreak = (st.bankrupt | 0) ? 0 : p.safeStreak + 1;
      p.freeStreak = (st.jailed | 0) ? 0 : p.freeStreak + 1;
      p.lastToken = token;
      p.updated = Date.now();

      const unlocked = evaluate(p);
      const now = Date.now();
      unlocked.forEach(t => { p.titles[t.id] = now; });
      autoEquip(p, unlocked);
      save(p);
      out.unlocked = unlocked.slice().sort((a, b) => b.rarity - a.rarity);
      out.won = won; out.seat = seat;
      return out;
    } catch (e) {
      out.skipped = 'error: ' + (e && e.message);
      return out;
    }
  }

  /* ---------- 佩戴 ---------- */
  function equip(id, manual = true) {
    const p = load();
    if (id == null || id === '') { p.equipped = null; }
    else { if (!byId(id) || !p.titles[id]) return false; p.equipped = id; }
    if (manual) p.pinned = true;
    save(p);
    return true;
  }
  function equipped() { return byId(load().equipped); }
  function has(id) { return !!load().titles[id]; }
  function unlockedCount() { return Object.keys(load().titles).filter(id => BY_ID[id]).length; }

  /* ---------- 进度 ---------- */
  function progress(t, p) {
    p = p || load();
    if (!t) return null;
    if (t.cond) {
      if (!t.prog) return null;
      try { const r = t.prog(p); return { cur: Math.min(r[0] | 0, r[1]), need: r[1], pct: Math.min(100, Math.round((r[0] | 0) / r[1] * 100)) }; } catch (e) { return null; }
    }
    const cur = p[t.stat] | 0;
    return { cur: Math.min(cur, t.need), need: t.need, pct: Math.min(100, Math.round(cur / t.need * 100)) };
  }
  /* 轨道状态：已达阶数、下一阶与其进度 */
  function trackState(tr, p) {
    p = p || load();
    const tiers = CATALOG.filter(t => t.track === tr.id);
    const reached = tiers.filter(t => p.titles[t.id]).length;
    const next = tiers[reached] || null;
    return { tiers, reached, total: tiers.length, current: reached ? tiers[reached - 1] : null, next, prog: next ? progress(next, p) : null, value: p[tr.stat] | 0 };
  }

  /* ---------- 渲染助手 ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function fmtNum(n, money) {
    n = n | 0;
    if (n >= 10000) { const w = n / 10000; return (Math.abs(w - Math.round(w)) < 1e-9 ? String(Math.round(w)) : w.toFixed(1)) + '万'; }
    return money ? ('$' + n.toLocaleString('en-US')) : String(n);
  }

  /* ================= 称号 SVG 徽章体系 =================
   * 统一盾形牌位（双线描边 + 底部绶带）；9 条轨道各一主视觉母题，同系列严格复用同一母题，
   * 仅阶数（绶带上的金点数）与稀有度配色（外框/底色/绶带）变化；16 个特殊成就各有独特图形。
   * 全部为 viewBox 0 0 64 64 的纯字符串 SVG，16px 徽章与 64px 卡片两档均清晰。 */
  const PAL = { gold: '#f5c542', goldD: '#b8720c', goldL: '#ffe9a8', cream: '#f3e9cf', red: '#d9433a', redD: '#8f1f1a',
    ink: '#2a1d0e', steel: '#a9b8c8', steelD: '#55636f', green: '#5fd38a', blue: '#5aa9ff', sky: '#bfe4ff', wood: '#a3672c' };
  /* 稀有度：外框描边 / 底色（上→下）/ 绶带 / 光晕 */
  const RAR_STYLE = {
    1: { rim: '#c9d6cf', top: '#3d4a47', bot: '#171d1b', band: '#8d9a95', glow: 'rgba(201,214,207,.0)' },
    2: { rim: '#5fd38a', top: '#1f4d33', bot: '#0a2418', band: '#2f9a5c', glow: 'rgba(95,211,138,.0)' },
    3: { rim: '#5aa9ff', top: '#1c3b60', bot: '#0a192e', band: '#2f6fb8', glow: 'rgba(90,169,255,.0)' },
    4: { rim: '#c37bff', top: '#3c2260', bot: '#170b2c', band: '#8a4fd1', glow: 'rgba(195,123,255,.0)' },
    5: { rim: '#ffc63a', top: '#5c3f0b', bot: '#2b1b04', band: '#d9960f', glow: 'rgba(255,198,58,.55)' },
  };
  const SHIELD = 'M32 3.5 L57 11.5 V33 C57 47.5 45.5 57.5 32 62 C18.5 57.5 7 47.5 7 33 V11.5 Z';
  const SHIELD_IN = 'M32 8 L52.5 14.5 V33 C52.5 44.5 43 53 32 57 C21 53 11.5 44.5 11.5 33 V14.5 Z';

  /* 轨道母题（绘制于 64×64 坐标系，主体约落在 x 14–50 / y 12–44） */
  const MOTIF = {
    win: `<g>
      <path d="M17 33 C12 31 10 25 11 19 h4" fill="none" stroke="${PAL.green}" stroke-width="2" stroke-linecap="round"/>
      <path d="M47 33 C52 31 54 25 53 19 h-4" fill="none" stroke="${PAL.green}" stroke-width="2" stroke-linecap="round"/>
      <g fill="${PAL.green}"><path d="M13 22 l3 -1 -1 3z"/><path d="M12 27 l3 0 -1 3z"/><path d="M14 31 l3 1 -2 2z"/><path d="M51 22 l-3 -1 1 3z"/><path d="M52 27 l-3 0 1 3z"/><path d="M50 31 l-3 1 2 2z"/></g>
      <path d="M22 15 h20 v8 c0 7 -4.5 11 -10 11 c-5.5 0 -10 -4 -10 -11z" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.5"/>
      <path d="M22 18 h-4 c-2 0 -3 2 -2 4 c1 3 3 5 6 6" fill="none" stroke="${PAL.goldD}" stroke-width="1.6"/>
      <path d="M42 18 h4 c2 0 3 2 2 4 c-1 3 -3 5 -6 6" fill="none" stroke="${PAL.goldD}" stroke-width="1.6"/>
      <path d="M25 17.5 h4 v6" fill="none" stroke="#fff6d2" stroke-width="1.4" opacity=".8" stroke-linecap="round"/>
      <rect x="29" y="34" width="6" height="4" fill="${PAL.goldD}"/>
      <path d="M25 38 h14 l2 4 h-18z" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.2"/>
    </g>`,
    rent: `<g>
      <circle cx="26" cy="27" r="11" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.6"/>
      <circle cx="26" cy="27" r="8.2" fill="none" stroke="${PAL.goldD}" stroke-width="1"/>
      <rect x="22.5" y="23.5" width="7" height="7" fill="${PAL.goldD}"/>
      <rect x="23.7" y="24.7" width="4.6" height="4.6" fill="#1c1208"/>
      <circle cx="40" cy="33" r="9" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.6"/>
      <circle cx="40" cy="33" r="6.6" fill="none" stroke="${PAL.goldD}" stroke-width="1"/>
      <rect x="37.2" y="30.2" width="5.6" height="5.6" fill="${PAL.goldD}"/>
      <rect x="38.2" y="31.2" width="3.6" height="3.6" fill="#1c1208"/>
      <g transform="translate(40 14) rotate(38)">
        <circle cx="0" cy="0" r="4.2" fill="none" stroke="${PAL.cream}" stroke-width="2.2"/>
        <path d="M4 0 h12 v3 h-3 v-2 h-3 v2 h-2.5 v-2" fill="none" stroke="${PAL.cream}" stroke-width="2.2" stroke-linejoin="round"/>
      </g>
    </g>`,
    jail: `<g>
      <rect x="16" y="13" width="26" height="22" rx="2.5" fill="#3b4652" stroke="${PAL.steel}" stroke-width="1.6"/>
      <rect x="19" y="16" width="20" height="16" fill="#0d1319"/>
      <g stroke="${PAL.steel}" stroke-width="2.2" stroke-linecap="round"><line x1="24" y1="16" x2="24" y2="32"/><line x1="29" y1="16" x2="29" y2="32"/><line x1="34" y1="16" x2="34" y2="32"/></g>
      <line x1="19" y1="24" x2="39" y2="24" stroke="${PAL.steel}" stroke-width="1.6"/>
      <path d="M36 36 q3 3 5 5" fill="none" stroke="${PAL.steelD}" stroke-width="2" stroke-dasharray="2 2"/>
      <circle cx="43.5" cy="43.5" r="6" fill="#1c232b" stroke="${PAL.steel}" stroke-width="1.4"/>
      <path d="M38.5 41 h10 M38.8 45.5 h9.4" stroke="${PAL.steel}" stroke-width="1.6"/>
    </g>`,
    games: `<g>
      <path d="M32 12 L48 20 V37 L32 45 L16 37 V20 Z" fill="${PAL.cream}" stroke="#b9a983" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M32 12 L48 20 L32 28 L16 20 Z" fill="#fffaf0"/>
      <path d="M16 20 L32 28 V45 L16 37 Z" fill="#d9ccae"/>
      <path d="M48 20 L32 28 V45 L48 37 Z" fill="#c9bb9a"/>
      <g fill="${PAL.ink}"><circle cx="32" cy="20" r="2.2"/></g>
      <g fill="${PAL.red}"><circle cx="21" cy="28" r="1.8"/><circle cx="27" cy="31" r="1.8"/><circle cx="21" cy="36" r="1.8"/><circle cx="27" cy="39" r="1.8"/></g>
      <g fill="${PAL.ink}"><circle cx="37" cy="31" r="1.7"/><circle cx="43" cy="28" r="1.7"/><circle cx="40" cy="35" r="1.7"/><circle cx="37" cy="39" r="1.7"/><circle cx="43" cy="36" r="1.7"/></g>
    </g>`,
    buy: `<g>
      <g transform="translate(38 16) rotate(12)">
        <rect x="-7" y="0" width="16" height="20" rx="1.5" fill="${PAL.cream}" stroke="#b9a983" stroke-width="1.3"/>
        <g stroke="#b9a983" stroke-width="1.3" stroke-linecap="round"><line x1="-4" y1="5" x2="6" y2="5"/><line x1="-4" y1="9" x2="6" y2="9"/><line x1="-4" y1="13" x2="2" y2="13"/></g>
        <circle cx="4" cy="16" r="2.4" fill="${PAL.red}"/>
      </g>
      <path d="M14 30 L28 18 L42 30 v14 H14z" fill="#e8b46a" stroke="${PAL.goldD}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M11 31 L28 16 L45 31" fill="none" stroke="${PAL.red}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <rect x="24" y="33" width="8" height="11" fill="#7a4a1c"/>
      <rect x="16" y="32" width="6" height="6" fill="${PAL.sky}"/>
      <rect x="34" y="32" width="6" height="6" fill="${PAL.sky}"/>
    </g>`,
    castle: `<g>
      <path d="M42 12 h10 M42 12 v14 M52 12 v3" fill="none" stroke="${PAL.steelD}" stroke-width="2" stroke-linecap="round"/>
      <line x1="49" y1="12" x2="49" y2="22" stroke="${PAL.steelD}" stroke-width="1.2" stroke-dasharray="1.5 1.5"/>
      <rect x="47" y="22" width="4" height="3" fill="${PAL.gold}"/>
      <rect x="14" y="26" width="30" height="18" fill="#cfc4ad" stroke="#8f8468" stroke-width="1.4"/>
      <rect x="12" y="18" width="9" height="26" fill="#e4dac3" stroke="#8f8468" stroke-width="1.4"/>
      <rect x="37" y="18" width="9" height="26" fill="#e4dac3" stroke="#8f8468" stroke-width="1.4"/>
      <path d="M12 18 h2 v-3 h2 v3 h2 v-3 h2 v3 h1" fill="#e4dac3" stroke="#8f8468" stroke-width="1.2"/>
      <path d="M37 18 h2 v-3 h2 v3 h2 v-3 h2 v3 h1" fill="#e4dac3" stroke="#8f8468" stroke-width="1.2"/>
      <path d="M22 26 h3 v-3 h3 v3 h3 v-3 h3 v3 h2" fill="#cfc4ad" stroke="#8f8468" stroke-width="1.2"/>
      <path d="M25 44 v-8 a4 4 0 0 1 8 0 v8" fill="#5a3a1a"/>
      <rect x="15" y="22" width="3" height="4" fill="#5b6b7a"/><rect x="40" y="22" width="3" height="4" fill="#5b6b7a"/>
      <path d="M16.5 10 v8 M16.5 10 h6 l-2 2 2 2 h-6" fill="${PAL.red}" stroke="${PAL.red}" stroke-width="1.2"/>
    </g>`,
    pot: `<g>
      <path d="M40 22 c-3 -6 -12 -7 -14 -2 c-2 5 4 5 4 9 c0 5 -8 6 -9 12 c8 2 15 -2 17 -8 c1 -4 4 -4 6 -2" fill="none" stroke="${PAL.goldD}" stroke-width="1" opacity="0"/>
      <path d="M22 22 c0 -6 8 -9 14 -6 c3 2 3 6 2 9 c4 -2 7 -4 9 -8 c1 6 -2 11 -6 13 c2 3 6 5 8 5 c-3 4 -8 4 -11 2 c-3 3 -9 4 -13 1 c-4 -3 -5 -10 -3 -16z" fill="#f0623d" stroke="#b83a1d" stroke-width="1.3"/>
      <path d="M24 24 c1 -4 7 -6 11 -4" fill="none" stroke="#fff" stroke-width="2" opacity=".55" stroke-linecap="round"/>
      <path d="M28 30 c3 3 8 3 11 0" fill="none" stroke="#b83a1d" stroke-width="1.2" opacity=".8"/>
      <circle cx="26.5" cy="24.5" r="2.2" fill="#fff"/><circle cx="27" cy="24.8" r="1.1" fill="#1c1208"/>
      <path d="M31 21 c1 3 5 3 6 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>
      <path d="M20 44 c-4 -1 -6 -5 -5 -8 c1 -3 4 -4 7 -3 c-1 3 -1 6 -2 11z" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.3"/>
      <path d="M17 34 q3 -3 6 0" fill="none" stroke="${PAL.goldD}" stroke-width="1.2"/>
      <circle cx="20" cy="39" r="1.3" fill="${PAL.goldD}"/>
    </g>`,
    fly: `<g>
      <path d="M12 36 c6 -4 14 -6 22 -6" fill="none" stroke="${PAL.sky}" stroke-width="1.6" stroke-linecap="round" opacity=".7"/>
      <path d="M14 42 c5 -3 11 -4 17 -4" fill="none" stroke="${PAL.sky}" stroke-width="1.4" stroke-linecap="round" opacity=".5"/>
      <path d="M52 14 L18 30 L30 33 Z" fill="#fff" stroke="#9fb6c8" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M52 14 L30 33 L34 44 Z" fill="#dbe7f0" stroke="#9fb6c8" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M52 14 L30 33 L30 39 Z" fill="#b9cad8"/>
      <path d="M52 14 L30 33" fill="none" stroke="#9fb6c8" stroke-width="1.3"/>
    </g>`,
    prop: `<g>
      <rect x="18" y="14" width="22" height="16" rx="2" fill="#2b2b32" stroke="#101014" stroke-width="1.3"/>
      <path d="M12 31 h34 c1 0 2 1 2 2 s-1 2 -2 2 h-34 c-1 0 -2 -1 -2 -2 s1 -2 2 -2z" fill="#3a3a44" stroke="#101014" stroke-width="1.3"/>
      <rect x="18" y="26" width="22" height="4" fill="${PAL.red}"/>
      <path d="M22 15 h4 v11" fill="none" stroke="#fff" stroke-width="1.4" opacity=".28" stroke-linecap="round"/>
      <g transform="translate(43 44) rotate(-40)">
        <rect x="-11" y="-2" width="20" height="4" rx="1.5" fill="${PAL.steel}" stroke="${PAL.steelD}" stroke-width="1"/>
        <path d="M9 -5 a5 5 0 1 1 0 10 l-3 -2 v-6 z" fill="${PAL.steel}" stroke="${PAL.steelD}" stroke-width="1"/>
        <circle cx="10" cy="0" r="1.6" fill="#1c1208"/>
      </g>
    </g>`,
  };

  /* 特殊成就独特图形 */
  const SPECIAL_ART = {
    sp_comeback: `<g>
      <path d="M20 46 c-4 -6 -2 -14 4 -16 c-2 5 0 8 3 9 c-1 -6 3 -11 8 -12 c-1 4 1 7 4 8 c1 -5 5 -8 9 -8 c-2 5 0 9 3 11 c2 3 1 7 -2 9 c-8 5 -22 5 -29 -1z" fill="#ff7a2e" stroke="#c8351b" stroke-width="1.3"/>
      <path d="M25 44 c-2 -4 0 -8 3 -9 c-1 3 0 5 2 6 c0 -4 2 -7 5 -8 c0 3 1 5 3 6 c1 -3 3 -5 6 -5 c-1 3 0 6 2 7 c1 3 -1 5 -4 6 c-5 3 -13 2 -17 -3z" fill="#ffd166"/>
      <path d="M30 24 c-4 -3 -9 -3 -12 1 c4 0 7 2 9 5 M34 24 c4 -3 9 -3 12 1 c-4 0 -7 2 -9 5" fill="none" stroke="#ff9a3c" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M32 14 c-3 3 -3 8 0 12 c3 -4 3 -9 0 -12z" fill="#ffd166" stroke="#c8351b" stroke-width="1"/>
      <circle cx="32" cy="27" r="3" fill="#ff7a2e"/><circle cx="31.2" cy="26.4" r=".9" fill="#1c1208"/>
      <path d="M34.5 27 l3 1 -3 1z" fill="#ffd166"/>
    </g>`,
    sp_richnight: `<g>
      <g stroke="${PAL.goldD}" stroke-width="1.2" fill="${PAL.gold}">
        <path d="M14 42 l3 -6 h12 l3 6z"/><path d="M32 42 l3 -6 h12 l3 6z"/><path d="M23 35 l3 -6 h12 l3 6z"/>
      </g>
      <path d="M18 38 h9 M36 38 h9 M27 31 h9" stroke="#fff6d2" stroke-width="1" opacity=".7"/>
      <path d="M32 26 V12 M25 19 l7 -7 7 7" fill="none" stroke="${PAL.green}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M40 22 l2 -3 M44 26 l3 -2 M22 22 l-2 -3 M18 26 l-3 -2" stroke="${PAL.goldL}" stroke-width="1.4" stroke-linecap="round"/>
    </g>`,
    sp_onehit: `<g>
      <circle cx="36" cy="36" r="9" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.5"/>
      <circle cx="36" cy="36" r="6" fill="none" stroke="${PAL.goldD}" stroke-width="1"/>
      <rect x="33.5" y="33.5" width="5" height="5" fill="${PAL.goldD}"/>
      <path d="M12 12 L30 30" stroke="#ff7a2e" stroke-width="4" stroke-linecap="round"/>
      <path d="M12 12 L30 30" stroke="#ffd166" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M26 24 l6 -1 -2 5 5 0 -3 5" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
      <g stroke="#ffd166" stroke-width="1.6" stroke-linecap="round"><line x1="44" y1="24" x2="48" y2="20"/><line x1="46" y1="34" x2="51" y2="34"/><line x1="26" y1="46" x2="22" y2="50"/><line x1="36" y1="48" x2="36" y2="52"/></g>
    </g>`,
    sp_streak3: `<g>
      <rect x="20" y="12" width="24" height="34" rx="3" fill="#f7f2e6" stroke="#b9a983" stroke-width="1.4"/>
      <rect x="20" y="12" width="24" height="34" rx="3" fill="none" stroke="#fff" stroke-width="1" opacity=".6" transform="translate(-1 -1)"/>
      <g stroke="${PAL.red}" stroke-width="3.4" stroke-linecap="round"><line x1="26" y1="21" x2="38" y2="21"/><line x1="27" y1="29" x2="37" y2="29"/><line x1="25" y1="37" x2="39" y2="37"/></g>
      <path d="M44 14 l4 -4" stroke="#b9a983" stroke-width="1" opacity=".6"/>
    </g>`,
    sp_streak5: `<g>
      <rect x="20" y="12" width="24" height="34" rx="3" fill="#f7f2e6" stroke="#b9a983" stroke-width="1.4"/>
      <text x="32" y="38" text-anchor="middle" font-family="'KaiTi','STKaiti','楷体','Microsoft YaHei',serif" font-size="24" font-weight="700" fill="${PAL.red}">五</text>
      <g fill="${PAL.gold}"><path d="M14 20 l1.5 3 3 .5 -2.2 2 .6 3.2 -2.9 -1.6 -2.9 1.6 .6 -3.2 -2.2 -2 3 -.5z"/><path d="M50 20 l1.5 3 3 .5 -2.2 2 .6 3.2 -2.9 -1.6 -2.9 1.6 .6 -3.2 -2.2 -2 3 -.5z"/></g>
    </g>`,
    sp_blitz: `<g>
      <path d="M18 16 l4 -8 l4 6 l6 -6 l4 6 l4 -8 l4 8 v6 h-26z" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.3" stroke-linejoin="round"/>
      <g fill="${PAL.red}"><circle cx="22" cy="17" r="1.6"/><circle cx="32" cy="17" r="1.6"/><circle cx="42" cy="17" r="1.6"/></g>
      <path d="M35 24 L24 40 h8 l-3 12 l13 -19 h-8 l3 -9z" fill="#ffe14a" stroke="#d98a0c" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M33 27 l-6 10 h5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".7" stroke-linecap="round"/>
    </g>`,
    sp_unbroken: `<g>
      <path d="M32 11 L46 16 V29 C46 38 39 44 32 47 C25 44 18 38 18 29 V16 Z" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M32 15 L42.5 18.8 V29 C42.5 36 37 41 32 43.5 C27 41 21.5 36 21.5 29 V18.8 Z" fill="none" stroke="#fff6d2" stroke-width="1.2" opacity=".75"/>
      <path d="M32 21 l2.6 5.4 6 .8 -4.3 4.1 1 5.9 -5.3 -2.8 -5.3 2.8 1 -5.9 -4.3 -4.1 6 -.8z" fill="#fff6d2"/>
      <path d="M22 16 l20 26" stroke="#fff" stroke-width="3" opacity=".22"/>
    </g>`,
    sp_lawful: `<g>
      <ellipse cx="32" cy="14" rx="9" ry="3" fill="none" stroke="${PAL.gold}" stroke-width="2"/>
      <path d="M22 30 c2 -6 10 -9 16 -6 c4 2 5 7 3 11 c-3 5 -10 6 -14 3 l-6 6 l1 -8 c-2 -2 -1 -5 0 -6z" fill="#fff" stroke="#c9d6cf" stroke-width="1.3"/>
      <path d="M26 30 c4 -8 14 -10 20 -6 c-6 1 -10 5 -12 10" fill="#eef2f5" stroke="#c9d6cf" stroke-width="1.2"/>
      <circle cx="37.5" cy="26.5" r="1.1" fill="#1c1208"/>
      <path d="M40 27 l4 1 -4 1z" fill="${PAL.gold}"/>
      <path d="M14 24 c2 -3 4 -3 6 0 M44 22 c2 -3 4 -3 6 0" fill="none" stroke="${PAL.sky}" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>
    </g>`,
    sp_sixes: `<g>
      <g transform="translate(14 18) rotate(-8)">
        <rect x="0" y="0" width="20" height="20" rx="4" fill="${PAL.cream}" stroke="#b9a983" stroke-width="1.3"/>
        <g fill="${PAL.ink}"><circle cx="5.5" cy="5" r="2"/><circle cx="14.5" cy="5" r="2"/><circle cx="5.5" cy="10" r="2"/><circle cx="14.5" cy="10" r="2"/><circle cx="5.5" cy="15" r="2"/><circle cx="14.5" cy="15" r="2"/></g>
      </g>
      <g transform="translate(31 24) rotate(10)">
        <rect x="0" y="0" width="20" height="20" rx="4" fill="${PAL.cream}" stroke="#b9a983" stroke-width="1.3"/>
        <g fill="${PAL.red}"><circle cx="5.5" cy="5" r="2"/><circle cx="14.5" cy="5" r="2"/><circle cx="5.5" cy="10" r="2"/><circle cx="14.5" cy="10" r="2"/><circle cx="5.5" cy="15" r="2"/><circle cx="14.5" cy="15" r="2"/></g>
      </g>
    </g>`,
    sp_escape: `<g>
      <path d="M16 26 c-6 -2 -8 -8 -4 -12 c2 4 6 5 10 5 M48 26 c6 -2 8 -8 4 -12 c-2 4 -6 5 -10 5" fill="#fff" stroke="#c9d6cf" stroke-width="1.3"/>
      <g transform="translate(32 32) rotate(-12)">
        <path d="M-13 -8 h26 a3 3 0 0 0 0 6 v4 a3 3 0 0 0 0 6 h-26 a3 3 0 0 0 0 -6 v-4 a3 3 0 0 0 0 -6z" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.3"/>
        <line x1="-4" y1="-6" x2="-4" y2="6" stroke="${PAL.goldD}" stroke-width="1.2" stroke-dasharray="2 1.5"/>
        <g stroke="${PAL.goldD}" stroke-width="1.5" stroke-linecap="round"><line x1="0" y1="-3" x2="9" y2="-3"/><line x1="0" y1="0" x2="9" y2="0"/><line x1="0" y1="3" x2="6" y2="3"/></g>
      </g>
    </g>`,
    sp_demo: `<g>
      <path d="M14 46 h10 M19 46 V16 l20 -4" fill="none" stroke="${PAL.gold}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="39" y1="12" x2="41" y2="26" stroke="${PAL.steelD}" stroke-width="1.6" stroke-dasharray="2 1.6"/>
      <circle cx="42" cy="32" r="7" fill="#3a3a44" stroke="#101014" stroke-width="1.3"/>
      <path d="M38 29 a5 5 0 0 1 5 -2" fill="none" stroke="#fff" stroke-width="1.4" opacity=".35" stroke-linecap="round"/>
      <g fill="#c96b3a" stroke="#7a3d1c" stroke-width="1"><rect x="28" y="38" width="8" height="4"/><rect x="24" y="42" width="8" height="4"/><rect x="33" y="42" width="8" height="4"/><rect x="45" y="40" width="6" height="4" transform="rotate(20 48 42)"/></g>
      <g stroke="${PAL.goldL}" stroke-width="1.4" stroke-linecap="round"><line x1="49" y1="26" x2="52" y2="23"/><line x1="51" y1="32" x2="55" y2="32"/></g>
    </g>`,
    sp_mono: `<g>
      <circle cx="32" cy="30" r="17" fill="#1c2f42" stroke="${PAL.gold}" stroke-width="1.6"/>
      <g fill="#c9d6e6" stroke="#8fa3ba" stroke-width="1">
        <rect x="18" y="26" width="7" height="16"/><rect x="26" y="18" width="8" height="24"/><rect x="35" y="22" width="6" height="20"/><rect x="42" y="30" width="5" height="12"/>
      </g>
      <g fill="${PAL.gold}"><rect x="28" y="21" width="1.6" height="1.6"/><rect x="31" y="21" width="1.6" height="1.6"/><rect x="28" y="25" width="1.6" height="1.6"/><rect x="31" y="25" width="1.6" height="1.6"/><rect x="20" y="29" width="1.6" height="1.6"/><rect x="37" y="26" width="1.6" height="1.6"/><rect x="37" y="30" width="1.6" height="1.6"/><rect x="20" y="33" width="1.6" height="1.6"/></g>
      <path d="M26 18 h8 l-4 -5z" fill="${PAL.gold}"/>
      <path d="M15 30 h34" stroke="${PAL.gold}" stroke-width="1" opacity="0"/>
      <path d="M14 45 h36" stroke="${PAL.gold}" stroke-width="2" stroke-linecap="round"/>
    </g>`,
    sp_auction: `<g>
      <g transform="translate(30 26) rotate(-35)">
        <rect x="-4" y="-14" width="8" height="26" rx="2" fill="${PAL.wood}" stroke="#5a3410" stroke-width="1.3"/>
        <rect x="-11" y="-20" width="22" height="11" rx="2.5" fill="#c9843a" stroke="#5a3410" stroke-width="1.3"/>
        <path d="M-8 -17 h16" stroke="#fff" stroke-width="1.2" opacity=".35"/>
      </g>
      <path d="M22 46 h22 l-2 -5 h-18z" fill="${PAL.wood}" stroke="#5a3410" stroke-width="1.3"/>
      <path d="M26 41 h14" stroke="#fff" stroke-width="1" opacity=".3"/>
      <g stroke="${PAL.goldL}" stroke-width="1.5" stroke-linecap="round"><line x1="44" y1="30" x2="48" y2="27"/><line x1="46" y1="36" x2="50" y2="36"/></g>
    </g>`,
    sp_block: `<g>
      <rect x="12" y="20" width="40" height="12" rx="2" fill="#f5f0e2" stroke="#5a3410" stroke-width="1.3"/>
      <g fill="${PAL.red}"><path d="M16 20 h7 l-7 12 h-4 v-4z"/><path d="M30 20 h7 l-7 12 h-7z"/><path d="M44 20 h7 l-7 12 h-7z"/></g>
      <rect x="12" y="20" width="40" height="12" rx="2" fill="none" stroke="#5a3410" stroke-width="1.3"/>
      <g stroke="#5a3410" stroke-width="3" stroke-linecap="round"><line x1="18" y1="32" x2="16" y2="46"/><line x1="46" y1="32" x2="48" y2="46"/></g>
      <circle cx="52" cy="16" r="3" fill="#ffb02e"><animate attributeName="opacity" values="1;.3;1" dur="1.2s" repeatCount="indefinite"/></circle>
    </g>`,
    sp_peak: `<g>
      <path d="M16 20 l5 -8 l6 7 l5 -9 l5 9 l6 -7 l5 8 v5 h-32z" fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.3" stroke-linejoin="round"/>
      <g fill="${PAL.red}"><circle cx="21" cy="21" r="1.7"/><circle cx="32" cy="20" r="1.9"/><circle cx="43" cy="21" r="1.7"/></g>
      <g fill="${PAL.gold}" stroke="${PAL.goldD}" stroke-width="1.2">
        <ellipse cx="32" cy="44" rx="13" ry="3.6"/><ellipse cx="32" cy="39.5" rx="13" ry="3.6"/><ellipse cx="32" cy="35" rx="13" ry="3.6"/>
      </g>
      <path d="M23 34 h18" stroke="#fff6d2" stroke-width="1" opacity=".6"/>
    </g>`,
    sp_laps: `<g>
      <path d="M32 46 a15 15 0 1 1 13 -22" fill="none" stroke="${PAL.green}" stroke-width="3" stroke-linecap="round"/>
      <path d="M46 16 l1 9 -8 -3z" fill="${PAL.green}"/>
      <line x1="26" y1="14" x2="26" y2="40" stroke="#5a3410" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M27 15 h14 l-4 5 4 5 h-14z" fill="${PAL.red}" stroke="${PAL.redD}" stroke-width="1"/>
    </g>`,
    /* 净化心灵：警灯顶上停着一只白鸽 */
    sp_purify: `<g>
      <rect x="16" y="34" width="32" height="11" rx="3" fill="#2f6fd6" stroke="#173a75" stroke-width="1.3"/>
      <rect x="21" y="28" width="22" height="8" rx="2" fill="#dbe9ff" stroke="#173a75" stroke-width="1.1"/>
      <rect x="28" y="24" width="8" height="5" rx="1" fill="${PAL.red}"/><rect x="28" y="24" width="4" height="5" rx="1" fill="#3d7bff"/>
      <circle cx="22" cy="46" r="3" fill="#1c1208"/><circle cx="42" cy="46" r="3" fill="#1c1208"/>
      <path d="M30 20 c-4 -2 -8 -1 -10 2 c4 0 6 1 8 3 c-3 1 -3 4 0 5 c3 0 8 -2 10 -5 c3 1 6 0 7 -2 c-2 0 -4 -1 -5 -2 c1 -3 -2 -6 -5 -5 c-2 0 -4 2 -5 4z" fill="#fff" stroke="#c9d6cf" stroke-width="1"/>
      <path d="M35 16 c3 -3 7 -3 9 0 c-4 0 -6 2 -8 4z" fill="#eef2f5" stroke="#c9d6cf" stroke-width=".9"/>
      <circle cx="37.5" cy="18.5" r=".9" fill="#1c1208"/><path d="M40 19 l3 .8 -3 .8z" fill="${PAL.gold}"/>
    </g>`,
    /* 失信人员：断裂的信用印章 */
    sp_dishonor: `<g>
      <circle cx="32" cy="30" r="15" fill="#3a3f47" stroke="#1a1d22" stroke-width="1.4"/>
      <circle cx="32" cy="30" r="11" fill="none" stroke="#8d9a95" stroke-width="1.6" stroke-dasharray="6 3"/>
      <path d="M22 20 L42 40" stroke="${PAL.red}" stroke-width="4" stroke-linecap="round"/>
      <path d="M27 33 l3 -6 4 5 3 -7" fill="none" stroke="#c9d6cf" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" opacity=".55"/>
      <path d="M17 42 h30" stroke="#8d9a95" stroke-width="1.2" stroke-dasharray="2 2"/>
    </g>`,
    /* 改过自新：嫩芽从栅栏缝里长出 */
    sp_reformed: `<g>
      <g stroke="#6f7c8c" stroke-width="2.6" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="46"/><line x1="46" y1="20" x2="46" y2="46"/><line x1="18" y1="26" x2="46" y2="26"/><line x1="18" y1="40" x2="46" y2="40"/></g>
      <path d="M32 46 V30" stroke="#3f8f3a" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M32 36 c-6 -1 -9 -5 -9 -10 c5 0 9 3 9 10z" fill="${PAL.green}" stroke="#2f6b2b" stroke-width="1"/>
      <path d="M32 32 c6 -1 9 -5 9 -10 c-5 0 -9 3 -9 10z" fill="#8fe39f" stroke="#2f6b2b" stroke-width="1"/>
      <g fill="${PAL.goldL}"><circle cx="24" cy="16" r="1.4"/><circle cx="40" cy="14" r="1.2"/><circle cx="34" cy="12" r="1"/></g>
    </g>`,
  };

  /* 徽章上的阶数：绶带上的金点（亮 = 已达阶，暗 = 该轨道剩余阶） */
  function tierPips(tier, total, rs) {
    if (!tier) return '';
    const n = Math.max(tier, Math.min(5, total || tier));
    const gap = 5.4, x0 = 32 - (n - 1) * gap / 2;
    let s = '';
    for (let i = 0; i < n; i++) {
      const on = i < tier;
      s += `<circle cx="${(x0 + i * gap).toFixed(1)}" cy="49.5" r="${on ? 1.9 : 1.4}" fill="${on ? PAL.goldL : 'rgba(0,0,0,.45)'}" stroke="${on ? PAL.goldD : rs.rim}" stroke-width="${on ? .7 : .6}" opacity="${on ? 1 : .55}"/>`;
    }
    return s;
  }
  function trackTotal(t) {
    const tr = TRACKS.find(x => x.id === t.track);
    return tr ? tr.tiers.length : 0;
  }
  /* 生成称号 SVG 徽章。size：像素尺寸（默认 64）；opts.plain=true 时不含外层尺寸属性（交给 CSS） */
  function titleSVG(t, size, opts = {}) {
    if (!t) return '';
    const r = (t.rarity >= 1 && t.rarity <= 5) ? t.rarity : 1;
    const rs = RAR_STYLE[r];
    const uid = 'tb' + r;
    const art = t.track === 'special' ? (SPECIAL_ART[t.id] || '') : (MOTIF[t.track] || '');
    const isLeg = r === 5;
    const rays = isLeg ? `<g opacity=".55" fill="${PAL.goldL}">${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M32 2 l1.6 6 h-3.2z" transform="rotate(${a} 32 32)"/>`).join('')}</g>` : '';
    const sz = size || 64;
    const dim = opts.plain ? '' : ` width="${sz}" height="${sz}"`;
    return `<svg class="tsvg-badge r${r}${t.track === 'special' ? ' sp' : ''}" viewBox="0 0 64 64"${dim} aria-hidden="true">` +
      `<defs><linearGradient id="${uid}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rs.top}"/><stop offset="1" stop-color="${rs.bot}"/></linearGradient>` +
      `<linearGradient id="${uid}-band" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${rs.band}"/><stop offset=".5" stop-color="${rs.rim}"/><stop offset="1" stop-color="${rs.band}"/></linearGradient>` +
      `<linearGradient id="${uid}-gloss" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>` +
      rays +
      `<path d="${SHIELD}" fill="url(#${uid}-bg)" stroke="${rs.rim}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="${SHIELD_IN}" fill="none" stroke="${PAL.goldL}" stroke-width=".9" opacity=".45" stroke-linejoin="round"/>` +
      `<path d="M32 3.5 L57 11.5 V26 Q32 34 7 26 V11.5 Z" fill="url(#${uid}-gloss)"/>` +
      art +
      (t.track !== 'special' ? `<path d="M14 45 h36 l2.5 4.5 h-41z" fill="url(#${uid}-band)" stroke="${rs.bot}" stroke-width=".8"/>${tierPips(t.tier, trackTotal(t), rs)}` : '') +
      `</svg>`;
  }
  function badgeHTML(t, opts = {}) {
    if (!t) return '';
    const tip = esc(t.desc || t.hint || '');
    return `<span class="tbadge r${t.rarity}${opts.small ? ' sm' : ''}" title="${tip}">${titleSVG(t, opts.small ? 16 : 20)}<em>${esc(t.name)}</em></span>`;
  }
  function equippedBadge(opts) { return badgeHTML(equipped(), opts); }
  function badgeForSeat(idx, opts) { return (idx >= 0 && idx === localSeat()) ? equippedBadge(opts) : ''; }

  return {
    RARITY, commit, evaluate: () => evaluate(load()), profile: load, reload: () => { cache = null; return load(); },
    equip, equipped, has, unlockedCount, progress, trackState, localSeat,
    tracks: () => TRACKS, specials: () => SPECIALS, catalog: () => CATALOG, byId,
    badgeHTML, equippedBadge, badgeForSeat, esc, fmtNum, titleSVG,
    __reset: reset,
  };
})();
