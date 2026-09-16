/* ============================================================
 * 游戏引擎：状态机 + 回合流 + 经济系统
 * ============================================================ */
'use strict';

const G = {
  gameId: 0,
  players: [],          // {idx, charId, ai, money, pos, alive, inJail, jailTurns, skipNext, shield, insurance, bailiff, piggy, forcedDice, bailCards, props:{}}
  tiles: [],            // [{owner, level}]
  cur: -1,
  round: 1,
  maxRounds: 30,
  pot: 0,               // 中央公园奖池
  blocks: {},           // idx -> playerIdx
  luckyTile: -1,        // 本回合幸运格（踩中奖励）
  lastRoll: 1,
  season: null,          // 本期全局事件
  milestones: {},        // 里程碑成就
  speed: 1,
  over: false,
  started: false,
  watchAfterOut: false,  // 人类全部出局后选择「继续观战」
  chanceDeck: [],
  destinyDeck: [],
};

/* ---------- 小工具 ---------- */
function sleep(ms) { return new Promise(r => setTimeout(r, ms / G.speed)); }
function rnd(n) { return Math.floor(Math.random() * n); }
function alivePlayers() { return G.players.filter(p => p.alive); }
function cur() { return G.players[G.cur]; }
function isHumanTurn() { const p = cur(); return p && !p.ai; }
function shuffleArr(a) { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function netWorth(p) {
  let v = p.money;
  BOARD.forEach((t, i) => { if (G.tiles[i].owner === p.idx) v += landValue(i); });
  for (const k in p.props) v += (p.props[k] || 0) * Math.round(PROPS[k].price / 2);
  return v;
}
function totalLevels(p) {
  let n = 0;
  BOARD.forEach((t, i) => { if (t.type === 'prop' && G.tiles[i].owner === p.idx) n += G.tiles[i].level; });
  return n;
}
function aliveByWorth() { return alivePlayers().slice().sort((a, b) => netWorth(b) - netWorth(a)); }

/* ---------- 全局事件季节（玩法粘性钩子） ---------- */
const SEASONS = [
  { id:'build',  name:'建设周', icon:'🏗️', desc:'本期建筑升级费用 4 折' },
  { id:'rent',   name:'收租季', icon:'💰', desc:'本期所有租金 +30%' },
  { id:'salary', name:'财神日', icon:'🧧', desc:'本期经过起点工资翻倍' },
];
function seasonCost(base) {
  return Math.round(base * (G.season && G.season.id === 'build' ? 0.4 : 1) / 100) * 100;
}
function seasonRent(base) {
  return Math.round(base * (G.season && G.season.id === 'rent' ? 1.3 : 1));
}
function seasonSalary() {
  return CFG.SALARY * (G.season && G.season.id === 'salary' ? 2 : 1);
}
function pickSeason() {
  G.season = SEASONS[rnd(SEASONS.length)];
  ui.updateHUD();
  ui.toast(`${G.season.icon} 本期事件：${G.season.name} — ${G.season.desc}`, G.season.icon);
  ui.news(`${G.season.icon} 本期事件：${G.season.name}，${G.season.desc}！`);
}
function milestone(key, text) {
  if (G.milestones[key]) return;
  G.milestones[key] = true;
  SFX.win();
  ui.toast(`🏆 里程碑：${text}`, '🏆');
  ui.news(`🏆 里程碑达成：${text}`);
  ui.log(`🏆 里程碑：${text}`, 'good');
}

/* ---------- 开局 ---------- */
function newGame(charIds, humanCharId, opts) {
  /* 失信惩戒注入（净化心灵彩蛋 · DESIGN_PSA_EGG.md §5.2）：上局在管控视频期间逃离页面 → df_honor_v1.dishonored
   * 本局开局一次性消费：初始资金 −20%（向下取整到百）+ 本机人类座位挂「失信人员」角标；psa.js 未加载时零影响 */
  const psaHonor = (window.PSA && PSA.honorConsume) ? PSA.honorConsume() : null;
  const startMoney = (psaHonor && psaHonor.penalty) ? Math.floor((opts.startMoney | 0) * 0.8 / 100) * 100 : opts.startMoney;
  G.gameId++;
  G.players = charIds.map((cid, i) => ({
    idx: i, charId: cid, ai: cid !== humanCharId, name: null,
    money: startMoney, pos: 0, alive: true,
    inJail: false, jailTurns: 0, skipNext: 0, shield: false,
    insurance: false, bailiff: false, piggy: false,   // 道具体系 2.0 一次性状态槽（复用 shield 模式）
    forcedDice: null, bailCards: 0, props: {},
    custody: false, honorTag: null,                   // 净化心灵管控态 / 失信人员角标（psa.js 驱动）
  }));
  /* 自定义名号：人类玩家使用大厅输入的昵称 */
  if (opts.nickname) {
    const h = G.players.find(p => !p.ai);
    if (h) h.name = opts.nickname;
  }
  if (opts.seats) {
    opts.seats.forEach(seat => {
      const p = G.players[seat.idx];
      if (!p) return;
      p.ai = !!seat.ai;
      p.name = seat.name || null;
    });
  }
  if (psaHonor && psaHonor.penalty) {
    /* 只罚本机人类座位（同屏多人 = 同一页面共担；联机远程座位不挂本机档案的标记） */
    G.players.forEach(p => {
      const remote = (typeof NET !== 'undefined' && NET && NET.active && typeof NET.isRemoteSeat === 'function' && NET.isRemoteSeat(p.idx));
      if (!p.ai && !remote) p.honorTag = psaHonor.tag || '失信人员';
    });
  }
  G.tiles = BOARD.map(() => ({ owner: null, level: 0 }));
/* 满级展示模式（?allmax=1）：22 地产全部拉到 lv4 城堡，玩家现金充足防破产打断 */
  if (opts.allMax) {
    G.players.forEach(p => { p.money = 999999; });
    let ownerCycle = 0;
    BOARD.forEach((t, i) => {
      if (t.type === 'prop') { G.tiles[i].owner = ownerCycle % G.players.length; G.tiles[i].level = 4; ownerCycle++; }
    });
  }
  G.cur = -1;
  G.round = 1;
  G.maxRounds = opts.maxRounds;
  G.pot = 0; G._stopCause = null;
  G.blocks = {};
  G.luckyTile = -1;
  G.lastRoll = 1;
  G.season = null;
  G.milestones = {};
  G.stats = G.players.map(() => ({ rentPaid: 0, rentGot: 0, jailed: 0, bought: 0,
    rentBest: 0, served: 0, bail: 0, bailCardUsed: 0, upgrades: 0, lv4: 0, auctionWins: 0, monopolies: 0,
    passStart: 0, flights: 0, blocksSet: 0, blocksHit: 0, demos: 0, propsUsed: 0, cards: 0, potWon: 0,
    luckyHits: 0, sixes: 0, bankrupt: 0, resigned: 0, peakMoney: startMoney | 0,
    /* 道具体系 2.0 计数器（DESIGN_PROPS_V2.md §8）+ 入狱归因（净化心灵彩蛋预留，DESIGN_PSA_EGG.md §2） */
    sweeps: 0, steals: 0, insuredSave: 0, pierce: 0, piggySave: 0, rushes: 0,
    jailCaused: 0, jailedBy: {}, psa: 0 }));   // psa：本局是否已触发净化心灵（一局一次落锁）
  /* 生涯档案：本机座位 = 大厅点选角色；展示局(allMax)不计入；matchToken 防同一局重复计入 */
  G.localIdx = G.players.findIndex(p => p.charId === humanCharId);
  G.demoMode = !!opts.allMax;
  G.matchAborted = false;
  G.matchToken = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  G.over = false;
  G.started = true;
  G.watchAfterOut = false;
  G.chanceDeck = shuffleArr(CHANCE_CARDS.map((_, i) => i));
  G.destinyDeck = shuffleArr(DESTINY_CARDS.map((_, i) => i));
  ui.initGameScene();
  pickLuckyTile();
  pickSeason();
  if (psaHonor && psaHonor.penalty) ui.toast('🚫 失信记录：上局逃避净化视频，本局初始资金 −20%', '🚫');   // 开局公示，避免被当成 bug
  runGame();
}

/* ---------- 主循环 ---------- */
async function runGame() {
  const gid = G.gameId;
  let faults = 0;
  while (G.started && !G.over) {
    if (gid !== G.gameId) return;
    try {
      await playTurn(gid);
      if (gid !== G.gameId) return;
      if (G.over) break;
      await advanceTurn(gid);
      if (gid !== G.gameId) return;
      faults = 0;
    } catch (e) {
      /* 回合管线兜底：单回合异常不冻结整局——记录、提示、跳到下一位；连续 3 次异常则结算止损 */
      if (gid !== G.gameId) return;
      console.error('[runGame] 回合异常', e);
      faults++;
      try { ui.abortTransient(); } catch (e2) { /* */ }
      try { ui.toast(`⚠️ 回合处理出错，已跳过（${faults}/3）`, '⚠️'); ui.log('⚠️ 回合处理出错：' + String(e && e.message || e), 'bad'); } catch (e3) { /* */ }
      if (faults >= 3) { try { await endGame(); } catch (e4) { G.over = true; } return; }
      const prev = G.cur;
      let next = prev;
      for (let k = 0; k < G.players.length; k++) { next = (next + 1) % G.players.length; if (G.players[next] && G.players[next].alive) break; }
      G.cur = next;
    }
  }
}

async function advanceTurn(gid) {
  if (alivePlayers().length <= 1) { await endGame(); return; }
  /* 人类全部出局（破产/认输）而 AI 仍在厮杀：默认立即结算，不把玩家钉在几十回合的纯 AI 对局里干等
   * （观战模式全员 AI，不触发；选择「继续观战」后本局不再询问） */
  if (!G.watchAfterOut && G.players.some(p => !p.ai) && !G.players.some(p => !p.ai && p.alive)) {
    const watch = await ui.choice({
      title: '💀 你已出局',
      html: '<p>本局已没有你操控的玩家。可以直接查看结算，或留下来观战 AI 决出最后赢家。</p>',
      choices: [{ v: false, label: '查看结算', kind: 'primary' }, { v: true, label: '继续观战', kind: 'ghost' }],
    });
    if (gid !== G.gameId) return;
    if (!watch) { await endGame(); return; }
    G.watchAfterOut = true;
  }
  const prev = G.cur;
  let next = prev;
  for (let k = 0; k < G.players.length; k++) {
    next = (next + 1) % G.players.length;
    if (G.players[next].alive) break;
  }
  if (next <= prev) {
    G.round++;
    ui.updateHUD();
    pickLuckyTile();
    pickSeason();
    if (G.maxRounds > 0 && G.round > G.maxRounds) { await endGame(); return; }
  }
  G.cur = next;
}

/* ---------- 幸运格：每回合随机一块地，踩中得奖励 ---------- */
function pickLuckyTile() {
  if (G.over) return;
  const cands = [];
  BOARD.forEach((t, i) => { if (t.type === 'prop') cands.push(i); });
  const prev = G.luckyTile;
  let pick = cands[rnd(cands.length)];
  if (cands.length > 1 && pick === prev) pick = cands[(cands.indexOf(pick) + 1 + rnd(cands.length - 1)) % cands.length];
  G.luckyTile = pick;
  if (prev >= 0) ui.updateTile(prev);
  ui.updateTile(pick);
  ui.toast(`✨ 幸运格降临：${BOARD[pick].name}（踩中 +${fmt(CFG.LUCKY_REWARD)}）`, '✨');
  ui.news(`✨ 本回合幸运格：${BOARD[pick].name}，踩中即得 ${fmt(CFG.LUCKY_REWARD)}！`);
}

/* ---------- 单个回合 ---------- */
async function playTurn(gid) {
  if (G.cur < 0) G.cur = 0;
  const player = cur();

  ui.setActive(player.idx);
  ui.updatePlayers();
  ui.log(`<b style="color:${playerColor(player)}">${pname(player)}</b> 的回合`, 'turn');

  // —— 净化心灵管控（DESIGN_PSA_EGG.md §4.4）：不同于 skipNext 的计数跳过，解除由视频播完 / 倒计时 / 看门狗驱动 ——
  if (window.PSA && PSA.shouldSkip && PSA.shouldSkip(player.idx)) {
    ui.toast(`🧘 ${pname(player)} 净化心灵中…回合跳过`, '🧘');
    ui.log(`${pname(player)} 净化心灵中，回合跳过`, 'bad');
    await sleep(700);
    return;
  }

  // —— 跳过回合（交通管制） ——
  if (player.skipNext > 0) {
    player.skipNext--;
    ui.toast(`⛔ ${pname(player)} 原地休息一回合`, '🚧');
    ui.log(`${pname(player)} 原地休息一回合`, 'bad');
    await sleep(700);
    return;
  }

  // —— 监狱流程 ——
  if (player.inJail) {
    player.jailTurns++;
    if (player.jailTurns > CFG.JAIL_MAX) {
      player.inJail = false; player.jailTurns = 0;
      if (G.stats) G.stats[player.idx].served++;
      ui.setTokenHidden(player.idx, false);   // 刑满释放：角色重新出现
      ui.toast(`⏱️ ${pname(player)} 刑满释放`, '⛓️');
      ui.log(`${pname(player)} 刑满释放，重获自由`, 'info');
      await sleep(500);
    } else {
      let freed = false;
      if (player.bailCards > 0) {
        const use = await decide(player, () => true, {
          title:'🎫 使用出狱许可证？',
          html:`<p>你手中有 <b>出狱许可证</b>，立即出狱并掷骰。</p>`,
          choices:[{v:true,label:'使用，马上出狱',kind:'primary'},{v:false,label:'继续蹲着',kind:'ghost'}],
        });
        if (gid !== G.gameId) return;
        if (use) { player.bailCards--; freed = true; ui.toast(`🎫 ${pname(player)} 使用出狱许可证`, '🎫'); if (G.stats) G.stats[player.idx].bailCardUsed++; }
      }
      if (!freed) {
        const pay = await decide(player, () => player.money >= 8000, {
          title:'⛓️ 身陷囹圄',
          html:`<p>${pname(player)} 正在服刑（第 ${player.jailTurns}/${CFG.JAIL_MAX} 回合）。<br>缴纳保释金 <b>${fmt(CFG.JAIL_BAIL)}</b> 可立即出狱掷骰，否则本回合跳过。</p>`,
          choices:[{v:true,label:`交保释金 ${fmt(CFG.JAIL_BAIL)}`,kind:'primary'},{v:false,label:'继续蹲一回合',kind:'ghost'}],
        });
        if (gid !== G.gameId) return;
        if (pay) {
          await charge(player, CFG.JAIL_BAIL, null, { toPot:true });
          if (gid !== G.gameId) return;
          freed = player.alive;
          if (freed && G.stats) G.stats[player.idx].bail++;
        }
      }
      if (freed) {
        player.inJail = false; player.jailTurns = 0;
        ui.setTokenHidden(player.idx, false);   // 出狱动画：角色重新出现（保释金 / 出狱许可证 / 路障等既有出狱逻辑）
        ui.log(`${pname(player)} 交了保释金，大步走出监狱`, 'info');
      } else {
        ui.log(`${pname(player)} 在监狱里蹲了一回合`, 'bad');
        await sleep(600);
        return;
      }
    }
  }

  // —— 道具阶段（掷骰前） ——
  ui.setPhase('preroll', player);
  if (player.ai) {
    await aiPreRoll(gid, player);
    if (gid !== G.gameId) return;
  }

  // —— 掷骰 ——
  let value;
  if (isHumanTurn()) {
    value = await ui.waitRoll();
    if (value === -1 || !player.alive) return;   // 等待期间出局
  } else {
    await sleep(650);
    value = 1 + rnd(6);
  }
  if (gid !== G.gameId) return;
  if (player.forcedDice != null) { value = player.forcedDice; player.forcedDice = null; ui.log(`🔮 遥控骰子生效，点数锁定为 ${value}`, 'info'); }
  ui.setPhase('rolling', player);
  await ui.rollDice(value);
  if (gid !== G.gameId) return;
  G.lastRoll = value;
  if (G.stats && value === 6) G.stats[player.idx].sixes++;
  ui.log(`<b style="color:${playerColor(player)}">${pname(player)}</b> 掷出 <b>${value}</b> 点`, 'dice');

  // —— 移动 ——
  await moveSteps(gid, player, value);
  if (gid !== G.gameId) return;

  // —— 落格结算 ——
  await resolveTile(gid, player, 0);
}

async function aiPreRoll(gid, player) {
  // AI 道具决策
  const acts = aiChooseProps(player);
  for (const act of acts) {
    if (gid !== G.gameId || G.over) return;
    await applyPropUse(gid, player, act.key, act.arg, true);
    await sleep(500);
  }
}

/* ---------- 移动 ---------- */
async function moveSteps(gid, player, steps, { silentStart = false } = {}) {
  for (let s = 0; s < steps; s++) {
    if (gid !== G.gameId) return;
    const from = player.pos;
    player.pos = (player.pos + 1) % BOARD.length;
    if (player.pos === 0) {
      gainMoney(player, seasonSalary(), { label:'工资' }); if (G.stats) G.stats[player.idx].passStart++;
      ui.log(`${pname(player)} 经过起点，领取工资 <b>${fmt(seasonSalary())}</b>`, 'good');
    }
    await ui.moveToken(player, true);
    if (gid !== G.gameId) return;
    // 路障：被迫停下
    if (G.blocks[player.pos] != null && player.pos !== 0) {
      const by = G.blocks[player.pos];
      delete G.blocks[player.pos];
      G._stopCause = by;   /* 路障逼停归因：若此格是拘留所，入狱记在放置者头上（净化心灵触发计数） */
      if (G.stats) G.stats[player.idx].blocksHit++;
      ui.updateTile(player.pos);
      ui.renderBlocks();   // 路障即时消除
      const byName = G.players[by] ? pname(G.players[by]) : '???';
      ui.toast(`🚧 ${pname(player)} 被 ${byName} 的路障拦下！`, '🚧');
      ui.log(`${pname(player)} 撞上 ${byName} 布下的路障，被迫停下`, 'bad');
      SFX.bad();
      await sleep(650);
      break;
    }
  }
  ui.updatePlayers();
}

async function moveDirect(gid, player, target, { collectSalary = true, fx = null } = {}) {
  // 沿前进方向走到 target；fx='plane' 时由专机载着绕棋盘飞行
  // 飞行途中不展示人物，只有交通工具（专机）；落地后恢复
  if (fx) { ui.setTokenHidden(player.idx, true); ui.rideStart(player, fx); if (fx === 'plane' && G.stats) G.stats[player.idx].flights++; }
  let guard = 0;
  while (player.pos !== target && guard++ < BOARD.length) {
    if (gid !== G.gameId) { ui.rideEnd(player); ui.setTokenHidden(player.idx, false); return; }
    player.pos = (player.pos + 1) % BOARD.length;
    if (player.pos === 0 && collectSalary) {
      gainMoney(player, seasonSalary(), { label:'工资' }); if (G.stats) G.stats[player.idx].passStart++;
      ui.log(`${pname(player)} 经过起点，领取工资 <b>${fmt(seasonSalary())}</b>`, 'good');
    }
    await ui.moveToken(player, true, { fast: !!fx });
    if (gid !== G.gameId) { ui.rideEnd(player); ui.setTokenHidden(player.idx, false); return; }
  }
  if (fx) { await sleep(320); ui.rideEnd(player); ui.setTokenHidden(player.idx, false); }
  ui.updatePlayers();
}

async function sendToJail(gid, player, { escort = true, cutscene = true, reason = null, causer = null } = {}) {
  /* 未指定案由 → 从入狱案由池随机（12 种，多样性） */
  if (!reason && typeof JAIL_CASES !== 'undefined' && JAIL_CASES.length) {
    const cs = JAIL_CASES[Math.floor(Math.random() * JAIL_CASES.length)];
    reason = cs.icon + ' ' + cs.text;
  }
  // 全屏逮捕过场 → 警车押送绕棋盘到监狱
  if (cutscene && !G.over) {
    await ui.arrestCutscene(player, reason);
    if (gid !== G.gameId) return;
  }
  if (escort && player.pos !== JAIL_POS) {
    ui.setTokenHidden(player.idx, true);   // 押送途中只展示警车（头顶「收押中」提示语），人物隐藏
    ui.rideStart(player, 'police');
    ui.news(`🚨 警车出动！${pname(player)} 被当场逮捕，押送入狱！`);
    let guard = 0;
    while (player.pos !== JAIL_POS && guard++ < BOARD.length) {
      if (gid !== G.gameId) { ui.rideEnd(player); break; }
      player.pos = (player.pos + 1) % BOARD.length;
      await ui.moveToken(player, true, { fast: true });
    }
    await sleep(400);
    ui.rideEnd(player);                    // 送达监狱：车辆消失，人物保持隐藏（下面入狱）
  } else {
    player.pos = JAIL_POS;
    ui.moveToken(player, false);
  }
  player.inJail = true;
  player.jailTurns = 0;
  ui.setTokenHidden(player.idx, true);     // 入狱服刑：该格不显示角色 token，出狱时恢复
  if (G.stats) {
    G.stats[player.idx].jailed++;
    /* 入狱归因（诬陷卡等「致人入狱」手段）：受害者记 jailedBy[causer]，使用者记 jailCaused
     * —— 净化心灵彩蛋（DESIGN_PSA_EGG.md）按 jailCaused ≥3 触发，causer===player.idx（自伤）不计 */
    if (causer != null && causer !== player.idx && G.stats[causer]) {
      G.stats[causer].jailCaused++;
      const jb = G.stats[player.idx].jailedBy || (G.stats[player.idx].jailedBy = {});
      jb[causer] = (jb[causer] || 0) + 1;
    }
  }
  ui.updateTile(JAIL_POS);
  SFX.jail();
  ui.toast(`⛓️ ${pname(player)} 被关进了监狱！`, '⛓️');
  ui.log(`${pname(player)} 进了监狱`, 'bad');
  /* 净化心灵彩蛋：归因计数就位后的单点触发判定（阈值 3 / 同局一次，判定与演出全在 psa.js）
   * 这里 await 的只是过场 + 押送演出（避免与本次逮捕过场叠画），视频管控在 psa.js 内异步进行，不阻塞引擎 */
  if (window.PSA && PSA.notifyJailCaused && causer != null) {
    try { await PSA.notifyJailCaused(gid, causer); } catch (e) { /* 彩蛋演出失败不影响对局 */ }
  }
}

/* ---------- 拍卖系统（仅用于破产变卖） ----------
 * 债务人挂牌拍卖名下产业（含建筑），所有对手轮流出价，价高者得。
 * 起拍价 = 市值一半（即银行保底回收价），每次加价一个阶梯；
 * 无人接盘或无人有能力接盘时，由银行按半价保底回收。 */
async function runAuction(gid, idx, { seller } = {}) {
  const t = BOARD[idx], st = G.tiles[idx];
  const level = st.level || 0;
  const market = t.type === 'prop' ? t.price + level * t.buildCost : t.price;
  const bankPrice = Math.round(market / 2 / 100) * 100;   // 银行半价保底
  const minStep = Math.max(200, Math.round(market * CFG.AUCTION_STEP / 100) * 100);
  let curBid = bankPrice;
  let leader = null;
  const order = G.players.filter(p => p.alive && p.idx !== seller.idx);
  const canAffordAny = order.some(p => p.money >= bankPrice);

  // 没有任何人有能力接盘 → 直接银行保底回收
  if (order.length === 0 || !canAffordAny) {
    bankBuyout(seller, idx, bankPrice);
    return null;
  }

  SFX.gavel();
  ui.toast(`🔨 ${t.name} 挂牌拍卖！底价 ${fmt(bankPrice)}（银行半价保底）${level ? `（含${LEVEL_NAMES[level]}建筑）` : ''}`, '🔨');
  ui.log(`🔨 <b>${t.name}</b> 挂牌拍卖：市值 ${fmt(market)}，底价 ${fmt(bankPrice)}（低于此价银行直接回收），每次加价 ${fmt(minStep)}`, 'build');
  ui.news(`🔨 ${t.name} 挂牌拍卖中，底价 ${fmt(bankPrice)}！`);
  ui.auctionOpen({ idx, market, bankPrice, minStep, level, seller: seller.idx });   // 打开拍卖大厅

  let pos = 0;
  if (seller) {
    const at = order.findIndex(p => p.idx === (seller.idx + 1) % G.players.length);
    pos = at >= 0 ? at : 0;
  }
  let idle = 0;
  const active = new Set(order.map(p => p.idx));
  /* 大厅入口询问：每位本地人类依次选择参与或旁观（同屏多人逐个问；联机客人仍走各自终端的询问） */
  const localHumans = order.filter(p => !p.ai && !(NET.active && NET.isRemoteSeat(p.idx)));
  for (const humanP of localHumans) {
    if (humanP.money < bankPrice) continue;
    const jr = await ui.auctionJoinAsk({ idx, bankPrice, who: localHumans.length > 1 ? pname(humanP) : null });
    if (gid !== G.gameId) return null;
    if (jr === 'watch') {
      active.delete(humanP.idx); idle++;
      ui.auctionPass(humanP, '旁观不参与');
    }
  }
  /* 石头剪刀布：≥2 人参与时决定率先出价权与出价顺序 */
  const rpsList = order.filter(p => active.has(p.idx));
  if (rpsList.length >= 2) {
    const winIdx = await ui.auctionRps(rpsList);
    if (gid !== G.gameId) return null;
    if (winIdx != null) {
      const at = order.findIndex(p => p.idx === winIdx);
      if (at >= 0) pos = at;   /* 出价顺序从猜拳胜者开始 */
    }
  }
  while (true) {
    if (gid !== G.gameId) return null;
    if (active.size === 0) break;
    if (leader && active.size === 1 && active.has(leader.idx)) break;   // 只剩领先者
    if (idle >= active.size) break;                                     // 一整轮无人加价
    const p = order[pos % order.length]; pos++;
    if (!active.has(p.idx)) continue;
    ui.auctionTurn(p);
    const need = leader ? curBid + minStep : curBid;
    let bid = null;
    if (p.money < need) {
      active.delete(p.idx); idle++;
      ui.auctionPass(p, '现金不足');
      ui.log(`　${pname(p)} 退出竞拍（现金不足）`, 'info');
      continue;
    }
    if (p.ai) {
      await sleep(650 + rnd(500));
      if (gid !== G.gameId) return null;
      const maxBid = aiAuctionMax(p, idx, market);
      if (maxBid >= need) bid = need;
    } else if (NET.active && NET.isRemoteSeat(p.idx)) {
      const r = await NET.askSeat(p.idx, { kind: 'auction', payload: { idx, price: curBid, step: minStep, leader, need } });
      if (gid !== G.gameId) return null;
      if (r === 'bid') bid = need;
    } else {
      const r = await ui.auctionPrompt(p, { idx, price: curBid, step: minStep, leader, need });
      if (gid !== G.gameId) return null;
      if (r === 'bid') bid = need;
    }
    if (bid != null) {
      leader = p; curBid = bid; idle = 0;
      ui.auctionBid(p, bid);
      SFX.cash();
      ui.log(`　<b style="color:${playerColor(p)}">${pname(p)}</b> 出价 <b>${fmt(bid)}</b>`, 'buy');
    } else {
      active.delete(p.idx);
      idle++;
      ui.auctionPass(p);
      if (p.ai) ui.log(`　${pname(p)} 放弃竞拍`, 'info');
    }
  }

  await sleep(450);
  if (leader) {
    ui.auctionGavel({ winner: leader.idx, price: curBid });
    leader.money -= curBid;
    seller.money += curBid;
    ui.moneyFloat(seller, +curBid);
    st.owner = leader.idx;
    ui.updateTile(idx);
    ui.tileFx(idx, 'won');
    ui.updatePlayers();
    SFX.gavel(); SFX.buy();
    ui.floatAt(idx, `🔨 ${fmt(curBid)}`, playerColor(leader));
    ui.toast(`🔨 落槌！${pname(leader)} 以 ${fmt(curBid)} 竞得 ${t.name}`, '🔨');
    ui.log(`🔨 落槌：<b style="color:${playerColor(leader)}">${pname(leader)}</b> 以 <b>${fmt(curBid)}</b> 竞得 <b>${t.name}</b>（拍卖款归 ${pname(seller)} 偿债）`, 'buy');
    ui.news(`🔨 拍卖成交：${pname(leader)} 以 ${fmt(curBid)} 拍得 ${t.name}！`);
    milestone('auction', `${pname(leader)} 首次拍卖竞得 ${t.name}`);
    if (G.stats) { G.stats[leader.idx].bought++; G.stats[leader.idx].auctionWins++; if (monopolized(idx, leader.idx)) G.stats[leader.idx].monopolies++; }
    return { winner: leader, price: curBid };
  }
  // 无人应价 → 银行保底半价回收
  ui.auctionGavel({ bank: true, price: bankPrice });
  bankBuyout(seller, idx, bankPrice);
  return null;
}

/* 银行半价回收：产权回归银行，回笼资金归债务人 */
function bankBuyout(seller, idx, price) {
  const t = BOARD[idx];
  G.tiles[idx].owner = null;
  G.tiles[idx].level = 0;
  seller.money += price;
  ui.moneyFloat(seller, +price);
  ui.updateTile(idx);
  ui.updatePlayers();
  SFX.pay();
  ui.toast(`🏦 无人接盘，${t.name} 由银行半价 ${fmt(price)} 回收`, '🏦');
  ui.log(`🏦 无人接盘，<b>${t.name}</b> 由银行以半价 <b>${fmt(price)}</b> 保底回收`, 'pay');
  ui.news(`🏦 ${t.name} 无人接盘，银行半价回收（${fmt(price)} 归 ${pname(seller)}）`);
}

/* ---------- 落格结算 ---------- */
async function resolveTile(gid, player, depth) {
  if (gid !== G.gameId || !player.alive || G.over) return;
  if (depth > 3) return;
  const idx = player.pos;
  const t = BOARD[idx];
  const st = G.tiles[idx];
  ui.flashTile(idx);
  ui.updatePlayers();
  await sleep(300);

  // —— 幸运格奖励 ——
  if (idx === G.luckyTile) {
    G.luckyTile = -1;
    ui.updateTile(idx);
    gainMoney(player, CFG.LUCKY_REWARD, { label:'幸运格' }); if (G.stats) G.stats[player.idx].luckyHits++;
    SFX.win();
    ui.toast(`⭐ ${pname(player)} 踩中幸运格，获得 ${fmt(CFG.LUCKY_REWARD)}！`, '⭐');
    ui.log(`⭐ ${pname(player)} 踩中幸运格 ${t.name}，+${fmt(CFG.LUCKY_REWARD)}`, 'good');
    ui.news(`⭐ ${pname(player)} 踩中幸运格 ${t.name}，抱走 ${fmt(CFG.LUCKY_REWARD)} 奖励！`);
    await sleep(500);
  }

  switch (t.type) {
    case 'start':
      ui.toast(`🚩 精神饱满！新的一圈开始`, '🚩');
      break;

    case 'prop':
    case 'station':
    case 'utility': {
      const price = t.price || 0;
      if (st.owner == null) {
        // —— 无主：购买决策（放弃/买不起均不拍卖，地块保持无主） ——
        const afford = player.money >= price;
        let buy = false;
        if (afford) {
          buy = await decide(player, () => aiWantBuy(player, idx), {
            title: `🏷️ 购买 ${t.name}`,
            html: ui.deedHTML(idx) + (ui.cashFlowHTML ? ui.cashFlowHTML(player, price, '购买') : ''),
            choices: [
              { v:true, label:`买下 ${fmt(price)}`, kind:'primary' },
              { v:false, label:'放弃', kind:'ghost' },
            ],
          });
          if (gid !== G.gameId) return;
        } else {
          ui.log(`${pname(player)} 看上了 ${t.name}，可惜现金不足`, 'info');
          await sleep(500);
          break;
        }
        if (buy) {
          await charge(player, price, null);
          if (gid !== G.gameId || !player.alive) return;
          st.owner = player.idx;
          ui.updateTile(idx);
          ui.tileFx(idx, 'buy');
          if (G.stats) G.stats[player.idx].bought++;
          milestone('firstbuy', `${pname(player)} 第一次购地置业`);
          if (monopolized(idx, player.idx)) { milestone('monopoly', `${pname(player)} 完成同色垄断`); if (G.stats) G.stats[player.idx].monopolies++; }
          ui.updatePlayers();
          SFX.buy();
          ui.toast(`🏷️ ${pname(player)} 买下了 ${t.name}`, deedBadge(t));
          ui.log(`<b style="color:${playerColor(player)}">${pname(player)}</b> 以 ${fmt(price)} 购入 <b>${t.name}</b>`, 'buy');
        } else {
          ui.log(`${pname(player)} 放弃购买 ${t.name}`, 'info');
        }
      } else if (st.owner === player.idx) {
        // —— 自己的地：升级 ——
        if (t.type === 'prop' && st.level < CFG.MAX_LEVEL) {
          const cost = seasonCost(t.buildCost);
          const want = await decide(player, () => aiWantUpgrade(player, idx), {
            title:'🏗️ 升级建筑',
            html: ui.deedHTML(idx) + `<p style="margin-top:10px">当前：<b>${LEVEL_NAMES[st.level]}</b> → 升级到 <b>${LEVEL_NAMES[st.level + 1]}</b>，花费 <b>${fmt(cost)}</b>。</p>`,
            choices: [
              { v:true, label:`升级 ${fmt(cost)}`, kind:'primary' },
              { v:false, label:'不用了', kind:'ghost' },
            ],
          });
          if (gid !== G.gameId) return;
          if (want && player.money >= cost) {
            await charge(player, cost, null);
            if (gid !== G.gameId || !player.alive) return;
            st.level++;
            if (G.stats) { G.stats[player.idx].upgrades++; if (st.level >= CFG.MAX_LEVEL) G.stats[player.idx].lv4++; }
            ui.updateTile(idx);
            ui.tileFx(idx, 'up');
            ui.fireworkAtTile(idx);
            if (st.level >= CFG.MAX_LEVEL) milestone('castle', `${pname(player)} 的 ${t.name} 城堡落成`);
            ui.updatePlayers();
            SFX.build();
            ui.floatAt(idx, `${LEVEL_NAMES[st.level]}!`, playerColor(player));
            ui.log(`<b style="color:${playerColor(player)}">${pname(player)}</b> 将 ${t.name} 升级到 <b>${LEVEL_NAMES[st.level]}</b>`, 'build');
          }
        }
      } else {
        // —— 别人的地：交租（地主在押期间免租；在押优先级最高，收租令/护身符均不消耗） ——
        const owner = G.players[st.owner];
        if (owner.inJail) {
          ui.toast(`⛓️ 地主 ${pname(owner)} 正在服刑，${t.name} 本轮免租！`, '⛓️');
          ui.log(`⛓️ ${pname(owner)} 在押，${t.name} 本轮免收租金`, 'info');
          await sleep(650);
          break;
        }
        const rent = seasonRent(rentOf(idx, st.owner, st.level));
        if (player.shield) {
          if (owner.bailiff) {
            /* 强制收租令击穿护身符：租客仍须付租，双方状态同消（DESIGN_PROPS_V2.md §3 bailiff） */
            owner.bailiff = false;
            player.shield = false;
            if (G.stats) G.stats[owner.idx].pierce++;
            ui.updatePlayers();
            ui.floatAt(idx, '📢 击穿护身符', '#ffb347');
            SFX.bad();
            ui.toast(`📢 ${pname(owner)} 的强制收租令击穿了 ${pname(player)} 的护身符，照付不误！`, '📢');
            ui.log(`📢 强制收租令生效：${pname(player)} 的护身符失效，仍须支付 ${t.name} 租金`, 'bad');
            await sleep(700);
          } else {
            player.shield = false;
            ui.updatePlayers();
            ui.toast(`🧿 护身符发光，${pname(player)} 免除了 ${fmt(rent)} 租金！`, '🧿');
            ui.log(`🧿 护身符生效，${pname(player)} 免付租金`, 'good');
            await sleep(700);
            break;
          }
        }
        ui.toast(`💸 踩到 ${pname(owner)} 的 ${t.name}，租金 ${fmt(rent)}`, '💸');
        await sleep(300);
        const rentOk = await charge(player, rent, owner);
        if (gid !== G.gameId) return;
        if (rentOk) ui.tileFx(idx, 'rent');
        /* 收租令是「下一次收到租金时消耗」：租客没有护身符也照样消耗（押错时机的代价） */
        if (owner.bailiff) {
          owner.bailiff = false;
          ui.updatePlayers();
          ui.log(`📢 ${pname(owner)} 的强制收租令已随本次收租消耗`, 'info');
        }
      }
      break;
    }

    case 'chance':
    case 'destiny': {
      SFX.card();
      const isChance = t.type === 'chance';
      const deck = isChance ? G.chanceDeck : G.destinyDeck;
      const pool = isChance ? CHANCE_CARDS : DESTINY_CARDS;
      if (deck.length === 0) deck.push(...shuffleArr(pool.map((_, i) => i)));
      const card = pool[deck.shift()];
      if (G.stats) G.stats[player.idx].cards++;
      const ok = await ui.showCard(card, isChance ? 'chance' : 'destiny', player);
      if (gid !== G.gameId) return;
      await applyCard(gid, player, card, depth);
      break;
    }

    case 'tax': {
      const amount = t.taxKind === 'income'
        ? Math.min(12000, Math.max(2000, Math.round(player.money * 0.1 / 100) * 100))
        : Math.round(netWorth(player) * 0.03 / 100) * 100;
      ui.toast(`🧾 ${t.name}：上缴 ${fmt(amount)}`, '🧾');
      await charge(player, amount, null, { toPot:true });
      break;
    }

    case 'park': {
      if (G.pot > 0) {
        const win = G.pot;
        G.pot = 0;
        ui.updateHUD();
        gainMoney(player, win, { label:'奖池' }); if (G.stats) G.stats[player.idx].potWon += win;
        ui.toast(`⛲ 恭喜！${pname(player)} 独得中央公园奖池 ${fmt(win)}！`, '⛲');
        ui.log(`⛲ ${pname(player)} 落在中央公园，捧走奖池 <b>${fmt(win)}</b>`, 'good');
        ui.news(`⛲ ${pname(player)} 在中央公园捧走奖池 ${fmt(win)}！`);
        SFX.win();
      } else {
        ui.toast(`⛲ 在公园的长椅上小憩一会儿…`, '⛲');
        ui.log(`${pname(player)} 在中央公园休息`, 'info');
      }
      break;
    }

    case 'shop': {
      if (player.ai) {
        const picks = aiShop(player);
        for (const k of picks) {
          if (gid !== G.gameId) return;
          await buyProp(player, k, true);
        }
        if (picks.length === 0) ui.log(`${pname(player)} 逛了逛道具店，啥也没买`, 'info');
      } else if (NET.active && NET.isRemoteSeat(player.idx)) {
        while (true) {
          if (gid !== G.gameId) return;
          const r = await NET.askSeat(player.idx, { kind: 'shop', payload: {} });
          if (!r || r.type !== 'buy') break;
          await buyProp(player, r.key, false);
        }
      } else {
        await ui.shopModal(player, async (key) => { const ok = await buyProp(player, key, false); return ok; });
      }
      break;
    }

    case 'gotojail':
      ui.log(`${pname(player)} 踩中拘留所，被警察带走`, 'bad');
      await sleep(300);
      await sendToJail(gid, player, { causer: (G._stopCause != null && G._stopCause !== player.idx) ? G._stopCause : null });
      G._stopCause = null;
      await sleep(500);
      break;

    case 'jail':
      ui.toast(`⛓️ 探监中…记住free的感觉`, '⛓️');
      ui.log(`${pname(player)} 只是来探监的`, 'info');
      break;
  }
  ui.updatePlayers();
  ui.updateHUD();
}

/* ---------- 卡片效果 ---------- */
async function applyCard(gid, player, card, depth) {
  if (gid !== G.gameId) return;
  if (card.money != null) {
    if (card.money >= 0) gainMoney(player, card.money, { label: card.title });
    else await charge(player, -card.money, null, { toPot: !!card.toPot });
    if (gid !== G.gameId) return;
  }
  /* 幸运转盘：[min,max] 内随机整百金额（此前 data.js 声明了 randomMoney 但引擎从未处理 → 死卡，玩家看完过场一无所得） */
  if (Array.isArray(card.randomMoney) && card.randomMoney.length === 2) {
    const lo = Math.min(card.randomMoney[0], card.randomMoney[1]), hi = Math.max(card.randomMoney[0], card.randomMoney[1]);
    const amt = Math.round((lo + Math.random() * (hi - lo)) / 100) * 100;
    gainMoney(player, amt, { label: card.title });
    ui.toast(`🎰 转盘停在 ${fmt(amt)}！`, '🎰');
    ui.log(`🎰 ${pname(player)} 的幸运转盘转到 <b>${fmt(amt)}</b>`, 'good');
  }
  if (card.global != null) {
    ui.news(`📰 快讯 · ${card.title}：${card.desc}`);
    for (const q of alivePlayers()) {
      if (card.global >= 0) gainMoney(q, card.global, { label: card.title });
      else await charge(q, -card.global, null, { toPot: !!card.toPot });
      if (gid !== G.gameId) return;
    }
  }
  if (card.mostBuilds != null) {
    const target = alivePlayers().slice().sort((a, b) => totalLevels(b) - totalLevels(a))[0];
    if (target && totalLevels(target) > 0) {
      if (card.mostBuilds >= 0) gainMoney(target, card.mostBuilds, { label: card.title });
      else await charge(target, -card.mostBuilds, null, { toPot: !!card.toPot });
    }
  }
  if (card.richestPays != null) {
    const target = aliveByWorth()[0];
    if (target) {
      const amt = Math.round(target.money * card.richestPays / 100) * 100;
      ui.log(`🔍 ${pname(target)} 被税务稽查，缴纳 ${fmt(amt)}`, 'bad');
      await charge(target, amt, null, { toPot:true });
    }
  }
  if (card.poorestGets != null) {
    const arr = aliveByWorth();
    const target = arr[arr.length - 1];
    if (target) { gainMoney(target, card.poorestGets, { label: card.title }); ui.log(`🎁 ${pname(target)} 获得慈善资助`, 'good'); }
  }
  if (card.randomDemolish) {
    const cands = alivePlayers().filter(q => totalLevels(q) > 0);
    if (cands.length) {
      const q = cands[rnd(cands.length)];
      const owned = BOARD.map((t, i) => ({ t, i })).filter(x => x.t.type === 'prop' && G.tiles[x.i].owner === q.idx && G.tiles[x.i].level > 0);
      const pick = owned[rnd(owned.length)];
      if (q.insurance) {
        /* 保险单：市政施工也在承保范围（DESIGN_PROPS_V2.md §3 insurance），层数不减、状态消耗 */
        q.insurance = false;
        if (G.stats) G.stats[q.idx].insuredSave++;
        ui.updatePlayers();
        ui.floatAt(pick.i, '📋 已投保', '#7ad0ff');
        SFX.card();
        ui.toast(`📋 市政施工盯上了 ${pname(q)} 的 ${pick.t.name}，保险单生效，建筑毫发无损！`, '📋');
        ui.log(`📋 保险单生效：${pname(q)} 的 ${pick.t.name} 免于市政施工拆除`, 'good');
      } else {
        G.tiles[pick.i].level--;
        ui.updateTile(pick.i);
        ui.tileFx(pick.i, 'down');
        SFX.boom();
        ui.floatAt(pick.i, '-1层', '#ff6b6b');
        ui.toast(`🏗️ ${pname(q)} 的 ${pick.t.name} 被拆掉一层`, '🏗️');
        ui.log(`🏗️ 市政施工：${pname(q)} 的 ${pick.t.name} 被拆除一层`, 'bad');
      }
    } else {
      ui.log(`🏗️ 市政施工：可惜全城还没有建筑`, 'info');
    }
    await sleep(600);
  }
  if (card.skip) { player.skipNext += card.skip; ui.toast(`🚧 ${pname(player)} 下回合暂停行动`, '🚧'); }
  if (card.potWin && G.pot > 0) {
    const win = G.pot; G.pot = 0; ui.updateHUD();
    gainMoney(player, win, { label:'奖池' }); if (G.stats) G.stats[player.idx].potWon += win;
    ui.log(`🏆 ${pname(player)} 独得奖池 <b>${fmt(win)}</b>`, 'good');
  }
  if (card.gotoJail) { await sendToJail(gid, player, { reason: card.jailReason || null }); await sleep(400); }
  if (card.bailCard) { player.bailCards++; ui.toast(`🎫 ${pname(player)} 获得出狱许可证`, '🎫'); ui.updatePlayers(); }
  if (card.eachFrom != null) {
    for (const q of alivePlayers()) {
      if (q === player || !q.alive) continue;
      const amt = Math.min(q.money, card.eachFrom);
      q.money -= amt; player.money += amt;
      ui.moneyFloat(q, -amt); ui.moneyFloat(player, +amt);
    }
    SFX.cash();
    ui.log(`🎂 大家给 ${pname(player)} 送了生日红包`, 'good');
    ui.updatePlayers();
  }
  if (card.eachTo != null) {
    const amt = Math.min(player.money, card.eachTo * (alivePlayers().length - 1));
    const per = alivePlayers().length > 1 ? Math.floor(amt / (alivePlayers().length - 1)) : 0;
    player.money -= per * (alivePlayers().length - 1);
    ui.moneyFloat(player, -per * (alivePlayers().length - 1));
    for (const q of alivePlayers()) {
      if (q === player || !q.alive) continue;
      q.money += per; ui.moneyFloat(q, +per);
    }
    SFX.pay();
    ui.log(`🎁 ${pname(player)} 给大家发了红包`, 'info');
    ui.updatePlayers();
  }
  // 移动类
  if (card.moveTo != null) {
    await sleep(300);
    if (card.fly) { ui.toast(`✈️ ${pname(player)} 登上专机！`, '✈️'); }
    await moveDirect(gid, player, card.moveTo, { fx: card.fly ? 'plane' : null });
    if (gid !== G.gameId) return;
    await resolveTile(gid, player, depth + 1);
  } else if (card.moveRel != null) {
    const steps = Math.abs(card.moveRel);
    if (card.moveRel > 0) {
      /* 正数 = 前进（共享单车「前进 2 格」此前无视符号一律后退）；沿用普通行走：经过起点领工资、撞路障停下 */
      await moveSteps(gid, player, steps);
      if (gid !== G.gameId) return;
    } else {
      for (let s = 0; s < steps; s++) {
        if (gid !== G.gameId) return;
        player.pos = (player.pos - 1 + BOARD.length) % BOARD.length;
        await ui.moveToken(player, true);
      }
    }
    await resolveTile(gid, player, depth + 1);
  } else if (card.nearest) {
    let target = player.pos;
    for (let k = 1; k <= BOARD.length; k++) {
      const i2 = (player.pos + k) % BOARD.length;
      if (BOARD[i2].type === card.nearest) { target = i2; break; }
    }
    await sleep(300);
    await moveDirect(gid, player, target);
    if (gid !== G.gameId) return;
    await resolveTile(gid, player, depth + 1);
  }
}

/* ---------- 金钱流 / 破产 ---------- */
function gainMoney(p, amt, { label = '' } = {}) {
  p.money += amt;
  if (G.stats && G.stats[p.idx] && p.money > G.stats[p.idx].peakMoney) G.stats[p.idx].peakMoney = p.money;
  ui.moneyFloat(p, amt);
  ui.updatePlayers();
  if (amt > 0) SFX.cash();
}

/* 向 p 收款 amount；creditor 为收款玩家（null=银行/奖池）。
 * 返回是否足额支付（可能触发变卖与破产）。 */
async function charge(p, amount, creditor, { toPot = false } = {}) {
  if (amount <= 0) return true;
  if (p.money < amount) {
    const covered = await liquidate(p, amount);
    if (!covered) {
      // 破产
      const remain = p.money;
      p.money = 0;
      if (creditor) creditor.money += remain;
      if (toPot && !creditor) G.pot += remain;
      releaseAssets(p);
      p.alive = false;
      if (G.stats) G.stats[p.idx].bankrupt = 1;
      ui.removeToken(p);
      ui.cancelRollFor(p);
      ui.updatePlayers();
      ui.updateTileAll();
      SFX.lose();
      ui.toast(`💀 ${pname(p)} 破产出局！`, '💀');
      ui.news(`💥 突发！${pname(p)} 资不抵债，宣布破产出局！`);
      ui.log(`💀 <b style="color:${playerColor(p)}">${pname(p)}</b> 资不抵债，破产出局！`, 'bad');
      await sleep(1000);
      return false;
    }
  }
  p.money -= amount;
  ui.moneyFloat(p, -amount);
  if (creditor) {
    creditor.money += amount;
    ui.moneyFloat(creditor, +amount);
    SFX.cash();
    if (G.stats) {
      G.stats[p.idx].rentPaid += amount;
      G.stats[creditor.idx].rentGot += amount;
      if (amount > G.stats[creditor.idx].rentBest) G.stats[creditor.idx].rentBest = amount;
      if (creditor.money > G.stats[creditor.idx].peakMoney) G.stats[creditor.idx].peakMoney = creditor.money;
    }
  }
  if (toPot && !creditor) {
    G.pot += amount;
    ui.updateHUD();
    SFX.pay();
  }
  if (!creditor && !toPot) SFX.pay();
  ui.updatePlayers();
  return true;
}

/* 变卖资产凑钱；土地一律先挂牌公开拍卖（底价=银行半价，保底不吃亏），
 * 建筑层级则直接半价拆除变现。返回是否凑够。AI 自动决策，人类走清算面板。 */
async function liquidate(p, need) {
  const gid = G.gameId;
  if (p.ai) {
    const items = liquidationList(p);
    for (const it of items) {
      if (p.money >= need) break;
      if (gid !== G.gameId) return false;
      if (it.kind === 'land') {
        const t = BOARD[it.idx];
        ui.toast(`🔨 ${pname(p)} 被迫拍卖 ${t.name} 还债！`, '🔨');
        const res = await runAuction(gid, it.idx, { seller: p });
        if (gid !== G.gameId) return false;
        if (res || G.tiles[it.idx].owner === null) { ui.updatePlayers(); continue; }   // 拍卖成交或银行回收
      }
      doSell(p, it.idx, it.kind);
      ui.updateTile(it.idx);
      ui.updatePlayers();
      ui.log(`${pname(p)} 变卖 ${BOARD[it.idx].name}${it.kind === 'level' ? '的建筑' : ''}，回笼 ${fmt(it.refund)}`, 'bad');
      SFX.pay();
      await sleep(420);
    }
    return p.money >= need;
  }
  // 人类：清算面板循环（变卖 / 拍卖 / 放弃）；联机客人走决策转发
  while (p.money < need) {
    if (gid !== G.gameId) return false;
    const list = liquidationList(p);
    if (list.length === 0) return false;
    let r;
    if (NET.active && NET.isRemoteSeat(p.idx)) {
      r = await NET.askSeat(p.idx, { kind: 'sell', need, list });
    } else {
      r = await ui.sellModal(p, need, list);
    }
    if (gid !== G.gameId) return false;
    /* 联机客人 120s 无应答（askSeat 超时 → null）视同认命：此前 r.type 会直接 TypeError 卡死整局 */
    if (!r || r === 'giveup') return false;
    if (r.type === 'sell') {
      const it = r.item;
      if (!it || G.tiles[it.idx].owner !== p.idx) continue;   /* 客人上报的条目已失效则重新出清单 */
      doSell(p, it.idx, it.kind);
      ui.updateTile(it.idx);
      ui.updatePlayers();
      SFX.pay();
      ui.log(`你变卖 ${BOARD[it.idx].name}${it.kind === 'level' ? '的建筑' : ''}，回笼 ${fmt(it.refund)}`, 'bad');
    } else if (r.type === 'auction') {
      const it = r.item;
      if (!it || G.tiles[it.idx].owner !== p.idx) continue;
      ui.toast(`🔨 你的 ${BOARD[it.idx].name} 上拍！底价为银行半价，价高者得`, '🔨');
      await runAuction(gid, it.idx, { seller: p });
      if (gid !== G.gameId) return false;
    }
  }
  return true;
}

function liquidationList(p) {
  const out = [];
  BOARD.forEach((t, i) => {
    const st = G.tiles[i];
    if (st.owner !== p.idx) return;
    if (t.type === 'prop' && st.level > 0) {
      out.push({ idx: i, kind: 'level', label: `${t.name} 拆除一层(${LEVEL_NAMES[st.level]})`, refund: Math.round(t.buildCost / 2) });
    }
  });
  BOARD.forEach((t, i) => {
    const st = G.tiles[i];
    if (st.owner !== p.idx) return;
    if (t.type === 'prop' || t.type === 'station' || t.type === 'utility') {
      const refund = Math.round(t.price / 2) + (t.type === 'prop' ? G.tiles[i].level * Math.round(t.buildCost / 2) : 0);
      out.push({ idx: i, kind: 'land', label: `卖出 ${t.name}${t.type === 'prop' ? '（含建筑）' : ''}`, refund });
    }
  });
  return out;
}
function doSell(p, idx, kind) {
  const t = BOARD[idx], st = G.tiles[idx];
  if (kind === 'level' && st.level > 0) {
    st.level--;
    p.money += Math.round(t.buildCost / 2);
  } else if (kind === 'land') {
    p.money += Math.round(t.price / 2) + (t.type === 'prop' ? st.level * Math.round(t.buildCost / 2) : 0);
    st.owner = null; st.level = 0;
  }
}
function releaseAssets(p) {
  BOARD.forEach((t, i) => {
    if (G.tiles[i].owner === p.idx) { G.tiles[i].owner = null; G.tiles[i].level = 0; }
  });
  for (const k in G.blocks) { if (G.blocks[k] === p.idx) delete G.blocks[k]; }
  /* 出局卫生：一次性状态槽一并清空（护身符/保险单/收租令/私房钱），避免徽章残留 */
  p.shield = false; p.insurance = false; p.bailiff = false; p.piggy = false;
  BOARD.forEach((_, i) => ui.updateTile(i));
  ui.renderBlocks();
}

/* ---------- 道具 ---------- */
async function useProp(gid, player, key, arg) {
  await applyPropUse(gid, player, key, arg, false);
}
async function applyPropUse(gid, player, key, arg, byAI) {
  const P = PROPS[key];
  if (!P || (player.props[key] || 0) <= 0) return;
  ui.propFanfare(player, key);
  player.props[key]--;
  ui.updatePlayers();
  if (G.stats) { G.stats[player.idx].propsUsed++; if (key === 'block') G.stats[player.idx].blocksSet++; }
  const who = `<b style="color:${playerColor(player)}">${pname(player)}</b>`;

  switch (key) {
    case 'dice':
      player.forcedDice = arg;
      ui.toast(`🔮 ${pname(player)} 锁定了点数 ${arg}`, '🔮');
      ui.log(`${who} 使用遥控骰子（点数 ${arg}）`, 'info');
      SFX.click();
      break;
    case 'block':
      G.blocks[arg] = player.idx;
      ui.updateTile(arg);
      ui.renderBlocks();
      ui.toast(`🚧 ${pname(player)} 在 ${BOARD[arg].name} 放下路障`, '🚧');
      ui.log(`${who} 在 ${BOARD[arg].name} 放置路障`, 'info');
      SFX.build();
      break;
    case 'shield':
      player.shield = true;
      ui.toast(`🧿 ${pname(player)} 获得护身符庇佑`, '🧿');
      ui.log(`${who} 启用护身符（免下一次租金）`, 'good');
      SFX.card();
      break;
    case 'demo': {
      const st = G.tiles[arg];
      if (st.level > 0) {
        const owner = st.owner != null ? G.players[st.owner] : null;
        if (owner && owner.insurance) {
          /* 保险单硬反制拆迁令：层数不减、状态消耗（守方单次交换小赚） */
          owner.insurance = false;
          if (G.stats) G.stats[owner.idx].insuredSave++;
          ui.updatePlayers();
          ui.floatAt(arg, '📋 已投保', '#7ad0ff');
          SFX.card();
          ui.toast(`📋 ${pname(player)} 的拆迁令被 ${pname(owner)} 的保险单挡下！`, '📋');
          ui.log(`${who} 使用拆迁令，但 ${pname(owner)} 的 ${BOARD[arg].name} 已投保，毫发无损`, 'good');
        } else {
          st.level--;
          if (G.stats) G.stats[player.idx].demos++;
          ui.updateTile(arg);
          ui.tileFx(arg, 'down');
          SFX.boom();
          ui.floatAt(arg, '-1层', '#ff6b6b');
          const victim = G.players[st.owner];
          ui.toast(`💣 ${pname(player)} 拆了 ${pname(victim)} 的 ${BOARD[arg].name} 一层楼！`, '💣');
          ui.log(`${who} 使用拆迁令，${pname(victim)} 的 ${BOARD[arg].name} -1层`, 'bad');
        }
      }
      break;
    }
    case 'equal': {
      /* 私房钱豁免：持有 piggy 状态者「不参与均摊也不被均摊」，均摊基数与结果都不含他（状态消耗） */
      const alive = alivePlayers();
      const exempt = alive.filter(q => q.piggy);
      const pool = alive.filter(q => !q.piggy);
      exempt.forEach(q => {
        q.piggy = false;
        if (G.stats) G.stats[q.idx].piggySave++;
        ui.toast(`🐷 ${pname(q)} 掏出私房钱，现金原封不动！`, '🐷');
        ui.log(`🐷 私房钱生效，${pname(q)} 不参与均富卡均摊`, 'good');
      });
      if (pool.length) {
        const total = pool.reduce((s, q) => s + q.money, 0);
        const avg = Math.floor(total / pool.length);
        pool.forEach(q => { const d = avg - q.money; q.money = avg; ui.moneyFloat(q, d); });
        ui.toast(`⚖️ 天下大同！参与均摊者现金平均为 ${fmt(avg)}${exempt.length ? '（豁免者除外）' : ''}`, '⚖️');
        ui.log(`${who} 使用均富卡，${exempt.length ? `${exempt.length} 人豁免，其余` : '全场现金'}平均分配`, 'good');
      } else {
        ui.toast(`⚖️ 均富卡落空：其余玩家全部持有私房钱`, '⚖️');
        ui.log(`${who} 使用均富卡，但无人参与均摊`, 'info');
      }
      ui.updatePlayers();
      SFX.cash();
      await sleep(800);
      break;
    }
    case 'sweeper': {
      if (G.blocks[arg] == null) break;   // 目标路障已消失（点选后到执行前被撞毁）：道具照常消耗
      const by = G.blocks[arg];
      delete G.blocks[arg];
      if (G.stats) G.stats[player.idx].sweeps++;
      ui.updateTile(arg);
      ui.renderBlocks();
      SFX.build();
      ui.floatAt(arg, '🚛 清障', '#8fd3ff');
      const byName = G.players[by] ? pname(G.players[by]) : '???';
      ui.toast(`🚛 ${pname(player)} 的清障车铲掉了 ${BOARD[arg].name} 的路障（${byName} 所放）`, '🚛');
      ui.log(`${who} 使用清障车，移除 ${BOARD[arg].name} 的路障`, 'info');
      break;
    }
    case 'insurance':
      player.insurance = true;
      ui.toast(`📋 ${pname(player)} 为名下建筑投了保险（下次被拆免损）`, '📋');
      ui.log(`${who} 启用保险单（挡下一次拆迁令/市政施工）`, 'good');
      SFX.card();
      break;
    case 'bailiff':
      player.bailiff = true;
      ui.toast(`📢 ${pname(player)} 签发了强制收租令（下次收租击穿护身符）`, '📢');
      ui.log(`${who} 启用强制收租令（下次收租，租客护身符失效）`, 'good');
      SFX.card();
      break;
    case 'piggy':
      player.piggy = true;
      ui.toast(`🐷 ${pname(player)} 藏好了私房钱（均富卡均摊时保留原现金）`, '🐷');
      ui.log(`${who} 启用私房钱（均富卡豁免一次）`, 'good');
      SFX.card();
      break;
    case 'thief': {
      /* 窃贼卡：随机偷取对手库存 1 件（按件数等概率）；不可偷窃贼卡本身；赃物不受 PROP_MAX 限制。
       * 随机只在房主侧发生（联机客人只上报受害者意图），见 DESIGN_PROPS_V2.md §6.3 */
      const victim = G.players[arg];
      const pool = [];
      if (victim && victim.alive && victim !== player) {
        for (const k in victim.props) {
          if (k === 'thief') continue;
          for (let n = (victim.props[k] | 0); n > 0; n--) pool.push(k);
        }
      }
      if (!pool.length) { ui.toast(`🦝 ${victim ? pname(victim) : '目标'}身上没有可偷的道具`, '🦝'); break; }
      const stolenKey = pool[rnd(pool.length)];
      victim.props[stolenKey]--;
      if (victim.props[stolenKey] <= 0) delete victim.props[stolenKey];
      player.props[stolenKey] = (player.props[stolenKey] || 0) + 1;
      if (G.stats) G.stats[player.idx].steals++;
      ui.updatePlayers();
      SFX.cash(); SFX.bad();
      const SP = PROPS[stolenKey];
      ui.toast(`🦝 ${pname(player)} 的窃贼从 ${pname(victim)} 处偷走了 ${SP.icon} ${SP.name}！`, '🦝');
      ui.log(`${who} 使用窃贼卡，偷走 ${pname(victim)} 的 ${SP.name}`, 'bad');
      break;
    }
    case 'rush': {
      const st = G.tiles[arg];
      const cap = (G.season && G.season.id === 'build') ? 4 : 3;   // 普通周上限 3 级，建设周可冲 4 级
      if (BOARD[arg].type !== 'prop' || st.owner !== player.idx || (st.level || 0) >= cap) break;
      st.level = (st.level || 0) + 1;
      if (G.stats) G.stats[player.idx].rushes++;
      ui.updateTile(arg);
      ui.tileFx(arg, 'up');
      SFX.build();
      ui.floatAt(arg, `${LEVEL_NAMES[st.level]}!`, playerColor(player));
      ui.toast(`🏗️ ${pname(player)} 加急施工，${BOARD[arg].name} 升到 ${LEVEL_NAMES[st.level]}${st.level >= 4 ? '（建设周冲顶）' : ''}！`, '🏗️');
      ui.log(`${who} 使用加急施工令，${BOARD[arg].name} +1 层（${LEVEL_NAMES[st.level]}）`, 'build');
      break;
    }
    case 'frame': {
      /* 诬陷卡：选定一名对手 → 走 sendToJail 正常入狱（含逮捕过场/警车押送），
       * 因果归因记在使用者头上（G.stats[使用者].jailCaused / 受害者.jailedBy） */
      const victim = G.players[arg];
      if (!victim || !victim.alive || victim === player || victim.inJail) break;
      ui.toast(`🕵️ ${pname(player)} 暗中举报了 ${pname(victim)}！`, '🕵️');
      ui.log(`${who} 使用诬陷卡，${pname(victim)} 遭匿名举报`, 'bad');
      await sendToJail(gid, victim, { causer: player.idx, reason: '🕵️ 被匿名举报 · 涉嫌重大经济犯罪，押送监狱服刑' });
      break;
    }
  }
}

async function buyProp(p, key, byAI) {
  const P = PROPS[key];
  if (!P || p.money < P.price) return false;
  if ((p.props[key] || 0) >= PROP_MAX) return false;
  await charge(p, P.price, null);
  p.props[key] = (p.props[key] || 0) + 1;
  ui.updatePlayers();
  SFX.buy();
  if (!byAI) ui.log(`你购买了 <b>${P.name}</b>`, 'buy');
  else ui.log(`<b style="color:${playerColor(p)}">${pname(p)}</b> 购买了 ${P.name}`, 'info');
  return true;
}

/* ---------- 结算 ---------- */
async function endGame() {
  G.over = true;
  ui.setPhase('over', null);
  const ranking = G.players.slice().sort((a, b) => {
    if (a.alive !== b.alive) return a.alive ? -1 : 1;
    return netWorth(b) - netWorth(a);
  });
  /* 「夺冠」以本机人类为准：同屏多人任一本地玩家夺冠即庆祝；联机客人夺冠时房主不放彩带 */
  const champ = ranking[0];
  const humanWon = !!champ && !champ.ai && !(NET.active && NET.isRemoteSeat(champ.idx));
  ui.log(`🏁 游戏结束！冠军：${pname(ranking[0])}`, 'turn');
  if (humanWon) SFX.win(); else SFX.lose();
  /* 联机：把最终名次广播给客人（此前客人永远看不到结算画面，对局在他们那里「无声消失」） */
  if (NET.active && NET.isHost && typeof NET.broadcast === 'function') {
    NET.broadcast({ t: 'over', order: ranking.map(p => p.idx), worth: ranking.map(p => netWorth(p)), stats: G.stats, token: G.matchToken });
  }
  await ui.showGameOver(ranking, humanWon);
}

/* ---------- 认输离场 ----------
 * 输定了的玩家不必陪跑几十回合：本机人类可在「别人的回合」或「自己回合的掷骰前」认输
 * （决策弹窗中途不允许，避免购地/清算流程里状态被抽走）。按破产处理：资产归还银行、现金清零、排名垫底。
 * 场上再无人类 → 作废进行中的 AI 回合并立即结算；仍有其他人类（同屏/联机）→ 对局继续。 */
function canResign(p) {
  if (!G.started || G.over || !p || !p.alive || p.ai) return false;
  if (NET.active && NET.isRemoteSeat(p.idx)) return false;   // 联机客人认输需经房主权威，暂不开放
  if (G.players[G.cur] !== p) return true;
  return typeof ui.rollPending === 'function' ? !!ui.rollPending() : false;
}
async function resign(p) {
  if (!canResign(p)) return false;
  const wasMyTurn = G.players[G.cur] === p;
  const lastHuman = !G.players.some(q => !q.ai && q.alive && q !== p);
  p.alive = false;
  p.money = 0;
  if (G.stats) G.stats[p.idx].resigned = 1;
  releaseAssets(p);
  ui.removeToken(p);
  if (lastHuman) { G.gameId++; ui.abortTransient(); }   // 作废所有进行中的异步流程（含自己挂起的掷骰等待）
  ui.updatePlayers();
  ui.updateTileAll();
  SFX.lose();
  ui.toast(`🏳️ ${pname(p)} 认输离场`, '🏳️');
  ui.news(`🏳️ ${pname(p)} 宣布认输，退出本局！`);
  ui.log(`🏳️ <b style="color:${playerColor(p)}">${pname(p)}</b> 认输离场`, 'bad');
  if (lastHuman) { endGame(); return true; }   // endGame 内部 await 结算弹窗直到玩家点按钮，这里不阻塞调用方
  if (wasMyTurn) ui.cancelRollFor(p);   // 释放掷骰等待 → playTurn 返回 → advanceTurn 轮到下一位
  return true;
}

/* ---------- 人类/AI 决策包装 ---------- */
async function decide(p, aiFn, uiOpts) {
  if (NET.active && NET.isRemoteSeat(p.idx)) {
    return NET.askSeat(p.idx, { kind: 'choice', payload: uiOpts });
  }
  if (p.ai) { await sleep(750 + rnd(500)); return !!aiFn(); }
  SFX.hover();
  return ui.choice(uiOpts);
}

function charOf(p) { return CHARACTERS.find(c => c.id === p.charId); }
function playerColor(p) { return charOf(p).color; }
function deedBadge(t) {
  if (t.type === 'station') return '🚉';
  if (t.type === 'utility') return '💡';
  return '🏠';
}

/* 调试钩子：?auction=格号 强制开拍（配合 main.js debugAutostart） */
window.__forceAuction = function (idx) {
  if (G.started && !G.over && G.players[1]) {
    return runAuction(G.gameId, Math.max(0, Math.min(39, idx | 0)), { seller: G.players[1] });
  }
};
