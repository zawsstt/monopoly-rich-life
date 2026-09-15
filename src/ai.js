/* ============================================================
 * AI 决策：购买 / 升级 / 监狱 / 道具 / 商店
 * ============================================================ */
'use strict';

const AI_RESERVE = 4500;   // 现金安全垫

function aiWantBuy(p, idx) {
  const t = BOARD[idx];
  if (p.money < t.price) return false;
  const rest = p.money - t.price;
  // 组团奖励：能凑成垄断或同色第二块时更积极
  let sameGroup = 0;
  if (t.group) BOARD.forEach((x, i) => { if (x.group === t.group && G.tiles[i].owner === p.idx) sameGroup++; });
  const reserve = sameGroup > 0 ? 3000 : AI_RESERVE;
  if (rest < reserve) return false;
  // 后期（钱多）更愿意囤地
  if (t.price >= 11000 && rest < t.price * 0.35 && sameGroup === 0) return false;
  return true;
}

function aiWantUpgrade(p, idx) {
  const t = BOARD[idx], st = G.tiles[idx];
  if (st.level >= CFG.MAX_LEVEL) return false;
  const cost = seasonCost(t.buildCost);
  if (p.money < cost) return false;
  const rest = p.money - cost;
  const mono = monopolized(idx, p.idx);
  // 1-3 级：薄安全垫即可开工（攒地优先改为量力升级）
  if (st.level < 3 && rest < 1200) return false;
  // 冲 4 级城堡：垄断地段放心冲，非垄断稍留家底兜底
  if (st.level >= 3 && !mono && rest < cost * 0.5) return false;
  if (st.level >= 3 && mono && rest < cost * 0.3) return false;
  return true;
}

/* 拍卖心理价位：市场价打折 + 垄断协同加成，且不突破现金安全垫 */
function aiAuctionMax(p, idx, market) {
  const t = BOARD[idx];
  let v = market * (0.72 + Math.random() * 0.18);
  if (t.group) {
    let same = 0;
    BOARD.forEach((x, i) => { if (x.group === t.group && G.tiles[i].owner === p.idx) same++; });
    if (same > 0) v *= 1.35;          // 凑垄断，志在必得
    else {
      // 差一块就能垄断时也很积极
      let groupSize = 0;
      BOARD.forEach((x, i) => { if (x.group === t.group && i !== idx) groupSize++; });
      if (same === groupSize - 1) v *= 1.2;
    }
  }
  return Math.min(Math.round(v), p.money - 1500);
}

/* ---------- 道具体系 2.0 共用探针（DESIGN_PROPS_V2.md §8：威胁检测 → 阈值 → 行动） ---------- */
function aiOpponents(p) { return alivePlayers().filter(q => q !== p); }
function aiOppHolds(p, k) { return aiOpponents(p).some(q => (q.props[k] || 0) > 0); }
function aiInvCount(q) { let n = 0; for (const k in q.props) n += (q.props[k] | 0); return n; }
/* 库存价值（可选排除某 key，如窃贼卡偷不到窃贼卡） */
function aiInvValue(q, skipKey) {
  let v = 0;
  for (const k in q.props) { if (k === skipKey || !PROPS[k]) continue; v += (q.props[k] | 0) * PROPS[k].price; }
  return v;
}
function aiHasLv(p, lv) { return BOARD.some((t, i) => t.type === 'prop' && G.tiles[i].owner === p.idx && G.tiles[i].level >= lv); }
function aiRushCap() { return (G.season && G.season.id === 'build') ? 4 : 3; }
function aiAhead(from, to) { return (to - from + BOARD.length) % BOARD.length; }

function aiShop(p) {
  const picks = [];
  const alive = alivePlayers();
  const avgCash = alive.reduce((s, q) => s + q.money, 0) / Math.max(1, alive.length);
  const build = !!(G.season && G.season.id === 'build');
  const myLv3 = aiHasLv(p, 3);
  /* 通用瘦身规则（反窃贼韧性）：库存 ≥4 件且无任何激活态 → 先用掉再买 */
  if (aiInvCount(p) >= 4 && !p.shield && !p.insurance && !p.bailiff && !p.piggy) return picks;

  /* wants 按优先级排列；条件化条目只在威胁真实存在时入列 */
  const wants = [];
  if (aiOppHolds(p, 'demo') && myLv3 && !p.insurance && !(p.props.insurance > 0)) wants.push('insurance');   // 对手持拆迁令 → 升至 dice 之前
  wants.push('dice', 'shield', 'block', 'sweeper', 'demo');                                                  // 清障车：常见档优先补货
  if (aiOppHolds(p, 'shield') && myLv3) wants.push('bailiff');                                                // 对手有护身符且自己有 lv3+ 地
  {
    /* 加急施工令：建设周必入；平时现金 > price + 2×seasonCost(最高自有地建筑费) 才入；没有可加层的自有地不买 */
    let maxCost = 0, canRush = false;
    const cap = aiRushCap();
    BOARD.forEach((t, i) => {
      if (t.type !== 'prop' || G.tiles[i].owner !== p.idx) return;
      if ((G.tiles[i].level || 0) < cap) canRush = true;
      maxCost = Math.max(maxCost, seasonCost(t.buildCost));
    });
    if (canRush && (build || p.money > PROPS.rush.price + 2 * maxCost)) wants.push('rush');
  }
  wants.push('equal');
  if (alive.length >= 3 && p.money > avgCash * 1.6 && !(p.props.equal > 0) && !p.piggy) wants.push('piggy');   // 首富才买，自己是均富方不买
  {
    /* 窃贼卡：全场道具总值中位数 > 6,000 时才买入 */
    const vals = alive.map(q => aiInvValue(q)).sort((a, b) => a - b);
    const m = vals.length >> 1;
    const med = vals.length ? (vals.length % 2 ? vals[m] : (vals[m - 1] + vals[m]) / 2) : 0;
    if (med > 6000) wants.push('thief');
  }
  /* 诬陷卡（用户追加）：存活 ≥3 且有对手净资产领先自己 → 备一张（用时押送领跑者） */
  if (alive.length >= 3 && aiOpponents(p).some(q => netWorth(q) > netWorth(p) * 1.15)) wants.push('frame');

  const reserveOf = k => k === 'dice' ? 1000 : (k === 'equal' ? 2000 : (k === 'sweeper' ? AI_RESERVE + 1000 : AI_RESERVE + 2000));
  for (const k of wants) {
    const P = PROPS[k];
    if (!P || (p.props[k] || 0) >= PROP_MAX) continue;
    if (p.money - P.price < reserveOf(k)) continue;
    // 均富卡：自己现金低于平均的 60% 才买
    if (k === 'equal' && p.money > avgCash * 0.6) continue;
    picks.push(k);
    if (picks.length >= 2) break;
  }
  return picks;
}

function aiChooseProps(p) {
  const acts = [];
  const use = (k, arg) => { if ((p.props[k] || 0) > 0) acts.push({ key: k, arg }); };
  const opps = aiOpponents(p);

  // 遥控骰子：前方 6 格内有高价无主地，或能踩自己的地升级（优先最高等级地块，滚雪球冲城堡）
  if ((p.props.dice || 0) > 0) {
    let bestUp = -1, bestLv = -1;
    for (let s = 1; s <= 6; s++) {
      const i2 = (p.pos + s) % BOARD.length;
      const t2 = BOARD[i2], st2 = G.tiles[i2];
      const goodBuy = st2.owner == null && (t2.type === 'prop' || t2.type === 'station' || t2.type === 'utility') && p.money > t2.price + 3000;
      if (goodBuy) { use('dice', s); bestUp = -2; break; }
      const goodUp = st2.owner === p.idx && t2.type === 'prop' && st2.level < CFG.MAX_LEVEL
        && (monopolized(i2, p.idx) || st2.level >= 2 || p.money > seasonCost(t2.buildCost) + 8000);
      if (goodUp && st2.level > bestLv) { bestLv = st2.level; bestUp = s; }
    }
    if (bestUp >= 1) use('dice', bestUp);
  }
  // 护身符：经过高危区（前方 6 格内存在 3 级以上他人建筑）时提前开
  if ((p.props.shield || 0) > 0 && !p.shield) {
    for (let s = 1; s <= 6; s++) {
      const i2 = (p.pos + s) % BOARD.length;
      const t2 = BOARD[i2], st2 = G.tiles[i2];
      if (st2.owner != null && st2.owner !== p.idx && t2.type === 'prop' && st2.level >= 3) { use('shield'); break; }
    }
  }
  // 保险单：自己存在 lv3+ 建筑且无保险激活、且场上任一对手库存有拆迁令 → 激活
  if ((p.props.insurance || 0) > 0 && !p.insurance && aiHasLv(p, 3) && aiOppHolds(p, 'demo')) use('insurance');
  // 强制收租令：自己 lv3+ 地块位于某护身符持有者（已激活或在库）前方 ≤10 格 → 激活；否则不激活（防浪费）
  if ((p.props.bailiff || 0) > 0 && !p.bailiff) {
    outer: for (const q of opps) {
      if (!q.shield && !(q.props.shield > 0)) continue;
      for (let s = 1; s <= 10; s++) {
        const i2 = (q.pos + s) % BOARD.length;
        if (BOARD[i2].type === 'prop' && G.tiles[i2].owner === p.idx && G.tiles[i2].level >= 3) { use('bailiff'); break outer; }
      }
    }
  }
  // 私房钱：自己现金 > 存活者均值 ×1.6、存活 ≥3 人、且有对手持有均富卡（威胁真实存在）→ 激活
  if ((p.props.piggy || 0) > 0 && !p.piggy) {
    const alive = alivePlayers();
    const avg = alive.reduce((s, q) => s + q.money, 0) / Math.max(1, alive.length);
    if (alive.length >= 3 && p.money > avg * 1.6 && aiOppHolds(p, 'equal')) use('piggy');
  }
  // 拆迁令：针对建筑等级最高的对手（只拆 3 级以上威胁，不骚扰发展中工地）
  if ((p.props.demo || 0) > 0) {
    let best = null;
    BOARD.forEach((t, i) => {
      if (t.type !== 'prop') return;
      const st = G.tiles[i];
      if (st.owner == null || st.owner === p.idx || st.level < 1) return;
      if (!best || st.level > G.tiles[best].level) best = i;
    });
    if (best != null && G.tiles[best].level >= 3) use('demo', best);
  }
  // 清障车：前方 ≤6 格的对手路障、且其后 2 格内是对手 lv3+ 地块 → 拆之；自己放错位（其后 6 格无自家 lv3+ 地）的路障也回收
  if ((p.props.sweeper || 0) > 0) {
    let target = null;
    for (const k in G.blocks) {
      const pos = +k, by = G.blocks[k];
      if (by === p.idx) {
        let guarded = false;
        for (let s = 1; s <= 6; s++) { const i2 = (pos + s) % BOARD.length; if (BOARD[i2].type === 'prop' && G.tiles[i2].owner === p.idx && G.tiles[i2].level >= 3) { guarded = true; break; } }
        if (!guarded) { target = pos; break; }
      } else {
        const d = aiAhead(p.pos, pos);
        if (d < 1 || d > 6) continue;
        for (let s = 1; s <= 2; s++) {
          const i2 = (pos + s) % BOARD.length, st2 = G.tiles[i2];
          if (BOARD[i2].type === 'prop' && st2.owner != null && st2.owner !== p.idx && st2.level >= 3) { target = pos; break; }
        }
        if (target != null) break;
      }
    }
    if (target != null) use('sweeper', target);
  }
  // 加急施工令：目标 = 自有最高等级且 < 上限的地块，优先垄断组与对手必经之路（后方 6 格内含对手位置）；建设周允许冲 lv4
  if ((p.props.rush || 0) > 0) {
    const cap = aiRushCap();
    let best = null, bestKey = -1;
    BOARD.forEach((t, i) => {
      if (t.type !== 'prop' || G.tiles[i].owner !== p.idx) return;
      const lv = G.tiles[i].level || 0;
      if (lv >= cap) return;
      let score = lv * 10;
      if (monopolized(i, p.idx)) score += 5;
      if (opps.some(q => { const d = aiAhead(q.pos, i); return d >= 1 && d <= 6; })) score += 3;
      if (score > bestKey) { bestKey = score; best = i; }
    });
    if (best != null) use('rush', best);
  }
  // 窃贼卡：目标 = 可偷库存价值最高的对手且总值 ≥ 8,000
  if ((p.props.thief || 0) > 0) {
    let best = null, bestV = 0;
    opps.forEach(q => { const v = aiInvValue(q, 'thief'); if (v > bestV) { bestV = v; best = q; } });
    if (best && bestV >= 8000) use('thief', best.idx);
  }
  // 诬陷卡（用户追加）：押送净资产领先自己 ≥15% 的最强对手（未在押），拖慢领跑者节奏
  if ((p.props.frame || 0) > 0) {
    const mine = netWorth(p);
    let best = null, bestW = -Infinity;
    opps.forEach(q => { if (q.inJail) return; const w = netWorth(q); if (w > bestW) { bestW = w; best = q; } });
    if (best && bestW > mine * 1.15) use('frame', best.idx);
  }
  // 路障：放在自己高租金街区前 1 格
  if ((p.props.block || 0) > 0 && Object.keys(G.blocks).length < 3) {
    let spot = null;
    BOARD.forEach((t, i) => {
      if (t.type !== 'prop' || G.tiles[i].owner !== p.idx || G.tiles[i].level < 3) return;
      const before = (i - 1 + BOARD.length) % BOARD.length;
      if (G.blocks[before] == null && BOARD[before].type !== 'start'
        && !G.players.some(q => q.alive && q.pos === before)) spot = before;
    });
    if (spot != null) use('block', spot);
  }
  // 均富卡：自己现金最少且差距大
  if ((p.props.equal || 0) > 0) {
    const alive = alivePlayers();
    if (alive.length >= 3) {
      const sorted = alive.slice().sort((a, b) => a.money - b.money);
      if (sorted[0] === p && sorted[0].money < sorted[sorted.length - 1].money * 0.4) use('equal');
    }
  }
  return acts;
}
