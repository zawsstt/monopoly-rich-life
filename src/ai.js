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

function aiShop(p) {
  const picks = [];
  const wants = ['dice', 'shield', 'block', 'demo', 'equal'];
  for (const k of wants) {
    const P = PROPS[k];
    if ((p.props[k] || 0) >= PROP_MAX) continue;
    if (p.money - P.price < (k === 'dice' ? 1000 : (k === 'equal' ? 2000 : AI_RESERVE + 2000))) continue;
    // 均富卡：自己现金低于平均的 60% 才买
    if (k === 'equal') {
      const alive = alivePlayers();
      const avg = alive.reduce((s, q) => s + q.money, 0) / alive.length;
      if (p.money > avg * 0.6) continue;
    }
    picks.push(k);
    if (picks.length >= 2) break;
  }
  return picks;
}

function aiChooseProps(p) {
  const acts = [];
  const use = (k, arg) => { if ((p.props[k] || 0) > 0) acts.push({ key: k, arg }); };

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
