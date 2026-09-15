/* ============================================================
 * 大富翁 · 富贵人生 —— 静态游戏数据
 * 棋盘 40 格 / 机会卡 / 命运卡 / 道具 / 角色
 * ============================================================
 * 【多棋盘架构注记（规划，未实现）】未来主题棋盘（如「江湖」「星际」）按命名空间隔离资产：
 *   - 数据：BOARD/GROUPS/CHANCE_CARDS/DESTINY_CARDS/JAIL_CASES 打包为 BOARDS[themeId]，当前 40 格为 BOARDS.classic；
 *   - 3D 模型：assets/models/<theme>/{props3d,specials3d,chars3d}/，index.html 清单按主题分段懒加载；
 *   - 2D 图：assets/img/<theme>/…，CHARACTERS 头像/棋子路径同样加主题前缀；
 *   - 道具 PROPS 与 CFG 为主题无关的通用层，主题只能通过 overrides（价格/文案）微调，不新增 key；
 *   - 引擎（game.js）只读 BOARD/JAIL_POS 等别名，切换主题 = 换绑别名 + 重建 tiles，不改回合流。
 * ============================================================ */
'use strict';

/* ---------- 全局参数 ---------- */
const CFG = {
  START_MONEY: 30000,   // 默认初始资金
  SALARY: 10000,        // 经过起点工资
  JAIL_BAIL: 2000,      // 保释金
  JAIL_MAX: 2,          // 最多关押回合数（之后自动保释）
  MAX_LEVEL: 4,         // 建筑最高等级
  RENT_MULT: [0.12, 0.5, 1.35, 2.3, 5.5],   // 租金 = 价格 × 系数[等级]
  STATION_RENT: [2500, 4000, 7000, 11000],
  UTILITY_RENT: [1200, 3000],   // 公用事业租金 = 骰点 × [持有 1 家, 持有 2 家]（地契文案与 rentOf 共用，防止文案漂移）
  LUCKY_REWARD: 5000,   // 幸运格奖励
  AUCTION_START: 0.5,   // 拍卖起拍价 = 市值一半（银行保底回收价）
  AUCTION_STEP: 0.05,   // 每次加价 = 市值比例
};

/* ---------- 角色 ----------
 * 素材：Kenney Toon Characters 1（CC0）
 * avatarImg=面板头像  tokenImg=棋盘待机  poseHit=被捕姿势  poseCheer=胜利姿势 */
/* 入狱案由池：踩拘留所/超速罚单未指定案由时随机抽取（12 种，多样性） */
const JAIL_CASES = [
  { icon: '🏎️', text: '涉嫌非法飙车 · 押送监狱服刑' },
  { icon: '🍺', text: '酒后驾车 · 罚款并拘留' },
  { icon: '🧾', text: '做假账偷税漏税 · 依法拘留' },
  { icon: '🥊', text: '聚众斗殴 · 治安拘留' },
  { icon: '🚦', text: '闯红灯逃逸 · 全城通缉中' },
  { icon: '🍢', text: '无证占道摆摊 · 请去喝茶' },
  { icon: '🎤', text: '半夜K歌扰民 · 邻里联名举报' },
  { icon: '🅿️', text: '违章停车堵大门 · 车主集体报案' },
  { icon: '🏰', text: '私闯他人豪宅 · 被保安当场按住' },
  { icon: '💸', text: '非法集资跑路 · 半路被截获' },
  { icon: '🦖', text: '遛恐龙不拴绳 · 惊吓路人被拘留' },
  { icon: '🎨', text: '涂鸦地铁车厢 · 被监控拍个正着' },
];

const CHARACTERS = [
  { id:'boss',   name:'富老板',  emoji:'🤵', color:'#f0a818', dark:'#b97e00',
    avatarImg:'assets/img/face3_boss.png?v=40', tokenImg:'assets/img/full3_boss.png?v=40',
    poseHit:'assets/img/pose_boss_hit.png', poseCheer:'assets/img/pose_boss_cheer.png',
    title:'地产大亨', desc:'白手起家，出手阔绰，信奉“地产行则百业兴”。' },
  { id:'qian',   name:'钱掌柜',  emoji:'👩‍💼', color:'#b45cf2', dark:'#8a2fc9',
    avatarImg:'assets/img/face3_qian.png?v=40', tokenImg:'assets/img/full3_qian.png?v=40',
    poseHit:'assets/img/pose_qian_hit.png', poseCheer:'assets/img/pose_qian_cheer.png',
    title:'商界女强人', desc:'精打细算，账算得比谁都快，从不做亏本买卖。' },
  { id:'tang',   name:'糖糖',    emoji:'👧', color:'#ff5964', dark:'#d02f3a',
    avatarImg:'assets/img/face3_tang.png?v=40', tokenImg:'assets/img/full3_tang.png?v=40',
    poseHit:'assets/img/pose_tang_hit.png', poseCheer:'assets/img/pose_tang_cheer.png',
    title:'元气少女', desc:'运气爆棚，走到哪都有好事发生。' },
  { id:'tu',     name:'土老财',  emoji:'👴', color:'#2ecc71', dark:'#1d9e50',
    avatarImg:'assets/img/face3_tu.png?v=40', tokenImg:'assets/img/full3_tu.png?v=40',
    poseHit:'assets/img/pose_tu_hit.png', poseCheer:'assets/img/pose_tu_cheer.png',
    title:'囤地狂魔', desc:'穿背带裤的乡下地主，就爱一寸一寸囤地。' },
  { id:'ren',    name:'丧彪',    emoji:'🧟', color:'#3d7bff', dark:'#2456c9',
    avatarImg:'assets/img/face3_ren.png?v=40', tokenImg:'assets/img/full3_ren.png?v=40',
    poseHit:'assets/img/pose_ren_hit.png', poseCheer:'assets/img/pose_ren_cheer.png',
    title:'神秘怪人', desc:'来无影去无踪，走路慢吞吞，但出手从不缺席。' },
  { id:'doudou', name:'豆豆',    emoji:'🤖', color:'#22d3d3', dark:'#0e9e9e',
    avatarImg:'assets/img/face3_doudou.png?v=40', tokenImg:'assets/img/full3_doudou.png?v=40',
    poseHit:'assets/img/pose_doudou_hit.png', poseCheer:'assets/img/pose_doudou_cheer.png',
    title:'AI 投资人', desc:'算力惊人的机器人，从不情绪化，也从不迟到。' },
];

/* ---------- 地产颜色分组 ---------- */
const GROUPS = {
  g1: { name:'胡同小筑', color:'#a9704a' },
  g2: { name:'沪上风华', color:'#5bb8d4' },
  g3: { name:'岭南骑楼', color:'#ee7bab' },
  g4: { name:'天府之国', color:'#f08c3d' },
  g5: { name:'江南烟雨', color:'#e35d5d' },
  g6: { name:'三秦大地', color:'#eec33c' },
  g7: { name:'东方之珠', color:'#35b58b' },
  g8: { name:'宝岛风情', color:'#5a8ff0' },
};

/* ---------- 棋盘 40 格（13×9 宽幅环形：上下各 11 格 + 左右各 7 格 + 四角） ----------
 * type: start/prop/station/utility/chance/destiny/tax/shop/park/jail/gotojail
 * 拐角：0 起点(右下) / 12 监狱(左下) / 20 中央公园(左上) / 32 拘留所(右上) */
const BOARD = [
  { type:'start',    name:'起点',      icon:'🚩' },                       // 0 右下角
  { type:'prop',     name:'南锣鼓巷',  group:'g1', price:4000 },          // 1
  { type:'chance',   name:'机会',      icon:'❓' },                       // 2
  { type:'prop',     name:'烟袋斜街',  group:'g1', price:4000 },          // 3
  { type:'tax',      name:'所得税',    icon:'🧾', taxKind:'income' },     // 4
  { type:'station',  name:'中央车站',  price:6000, icoImg:'ico_train' },  // 5
  { type:'prop',     name:'武康路',    group:'g2', price:5500 },          // 6
  { type:'destiny',  name:'命运',      icon:'📰️' },                      // 7
  { type:'prop',     name:'田子坊',    group:'g2', price:5500 },          // 8
  { type:'prop',     name:'城隍庙',    group:'g2', price:6000 },          // 9
  { type:'prop',     name:'上下九',    group:'g3', price:7000 },          // 10
  { type:'utility',  name:'电力公司',  price:7500, icon:'⚡' },           // 11
  { type:'jail',     name:'监狱',      icon:'⛓️' },                       // 12 左下角
  { type:'prop',     name:'北京路',    group:'g3', price:7000 },          // 13
  { type:'prop',     name:'沙面大街',  group:'g3', price:7500 },          // 14
  { type:'station',  name:'高铁虹桥站', price:6000, icoImg:'ico_train' }, // 15
  { type:'prop',     name:'宽窄巷子',  group:'g4', price:8500 },          // 16
  { type:'chance',   name:'机会',      icon:'❓' },                       // 17
  { type:'prop',     name:'锦里古街',  group:'g4', price:8500 },          // 18
  { type:'prop',     name:'春熙路',    group:'g4', price:9000 },          // 19
  { type:'park',     name:'中央公园',  icon:'⛲' },                       // 20 左上角
  { type:'prop',     name:'平江路',    group:'g5', price:9500 },          // 21
  { type:'shop',     name:'道具商店',  icon:'🛒' },                       // 22
  { type:'prop',     name:'山塘街',    group:'g5', price:9500 },          // 23
  { type:'prop',     name:'断桥烟雨',  group:'g5', price:10000 },         // 24
  { type:'station',  name:'轮渡码头',  price:6000, icoImg:'ico_boat' },   // 25
  { type:'prop',     name:'回民街',    group:'g6', price:11000 },         // 26
  { type:'destiny',  name:'命运',      icon:'📰️' },                      // 27
  { type:'prop',     name:'书院门',    group:'g6', price:11000 },         // 28
  { type:'utility',  name:'自来水厂',  price:7500, icon:'💧' },           // 29
  { type:'prop',     name:'大唐不夜城', group:'g6', price:12000 },        // 30
  { type:'tax',      name:'奢侈税',    icon:'💎', taxKind:'luxury' },     // 31
  { type:'gotojail', name:'拘留所',    icon:'🚔' },                       // 32 右上角
  { type:'prop',     name:'铜锣湾',    group:'g7', price:12500 },         // 33
  { type:'prop',     name:'尖沙咀',    group:'g7', price:12500 },         // 34
  { type:'chance',   name:'机会',      icon:'❓' },                       // 35
  { type:'prop',     name:'兰桂坊',    group:'g7', price:13000 },         // 36
  { type:'station',  name:'国际机场',  price:6000, icoImg:'ico_plane' },  // 37
  { type:'prop',     name:'士林夜市',  group:'g8', price:13500 },         // 38
  { type:'prop',     name:'垦丁大街',  group:'g8', price:14000 },         // 39
];
const JAIL_POS = 12;

/* 13 列 × 9 行 环形布局 → 网格位置（1 基）：2D CSS grid 与 3D 世界坐标共用
 * 0 右下角 → 1..11 底行 → 12 左下角 → 13..19 左列 → 20 左上角 → 21..31 顶行 → 32 右上角 → 33..39 右列 */
function GRID_POS(i) {
  if (i === 0) return { r: 9, c: 13, side: 'corner' };
  if (i < 12) return { r: 9, c: 13 - i, side: 'bottom' };
  if (i === 12) return { r: 9, c: 1, side: 'corner' };
  if (i < 20) return { r: 21 - i, c: 1, side: 'left' };
  if (i === 20) return { r: 1, c: 1, side: 'corner' };
  if (i < 32) return { r: 1, c: i - 19, side: 'top' };
  if (i === 32) return { r: 1, c: 13, side: 'corner' };
  return { r: i - 31, c: 13, side: 'right' };
}

/* 建筑成本 = 价格 40%（取整到百），供引擎与地契展示使用 */
BOARD.forEach(t => { if (t.type === 'prop') t.buildCost = Math.round(t.price * 0.4 / 100) * 100; });

const LEVEL_NAMES = ['空地', '小屋', '洋房', '大厦', '城堡'];

/* ---------- 机会卡 ----------
 * cut: 全屏过场主题 —— fx: pulse/rise/fall/shake/drive/back
 *      bg: gold/red/green/blue/sky/gray/warm/purple/news，rain: 粒子雨 emoji */
const CHANCE_CARDS = [
  { icon:'🧧', title:'新春红包',   desc:'长辈塞了个红包，+ $3,000',                 money:+3000, cut:{ fx:'fall', bg:'red',  rain:'🧧' } },
  { icon:'🎰', title:'福彩中奖',   desc:'随手买的彩票中了大奖，+ $8,000',           money:+8000, cut:{ fx:'pulse', bg:'gold', rain:'🪙' } },
  { icon:'📈', title:'股票大涨',   desc:'持仓股票连拉涨停，+ $5,000',               money:+5000, cut:{ fx:'rise', bg:'green' } },
  { icon:'🪙', title:'天降横财',   desc:'路边捡到一只钱包（已上交一半），+ $2,000', money:+2000, cut:{ fx:'fall', bg:'gold', rain:'🪙' } },
  { icon:'🏠', title:'税务退税',   desc:'去年多缴的税退回来了，+ $3,500',           money:+3500, cut:{ fx:'pulse', bg:'blue' } },
  { icon:'💊', title:'感冒就医',   desc:'重感冒进了医院，- $2,500',                 money:-2500, toPot:true, cut:{ fx:'shake', bg:'blue' } },
  { icon:'📱', title:'手机摔碎',   desc:'刚买的旗舰机屏幕碎了，- $2,000',           money:-2000, toPot:true, cut:{ fx:'shake', bg:'gray' } },
  { icon:'🍜', title:'请客吃饭',   desc:'老同学聚会你抢着买单，- $3,000',           money:-3000, toPot:true, cut:{ fx:'pulse', bg:'warm' } },
  { icon:'🚀', title:'专机送你',   desc:'豪华专机直达起点领工资！',                 moveTo:0, fly:true, cut:{ fx:'drive', bg:'sky', sprite:'✈️', rain:'☁️' } },
  { icon:'🔙', title:'走错路了',   desc:'导航失灵，后退 3 格',                      moveRel:-3, cut:{ fx:'back', bg:'gray', sprite:'🔙' } },
  { icon:'🚕', title:'前往车站',   desc:'出差在即，火速赶到最近的车站',             nearest:'station', cut:{ fx:'drive', bg:'sky', sprite:'🚕' } },
  { icon:'✈️', title:'环游世界',   desc:'免费航班直达 垦丁大街',                    moveTo:39, fly:true, cut:{ fx:'drive', bg:'sky', sprite:'✈️', rain:'☁️' } },
  { icon:'🚔', title:'超速罚单',   desc:'飙车被逮个正着，直接收监！',               gotoJail:true, jailReason:'🏎️ 涉嫌非法飙车 · 押送监狱服刑', cut:{ fx:'shake', bg:'red', sprite:'🚔' } },
  { icon:'🍺', title:'酒后挪车',   desc:'酒后挪车也是酒驾，直接收监！',             gotoJail:true, jailReason:'酒后驾车 · 罚款并拘留', cut:{ fx:'shake', bg:'red', sprite:'🍺' } },
  { icon:'🎫', title:'出狱许可证', desc:'获得一张出狱许可证，收好以备不时之需',     bailCard:true, cut:{ fx:'pulse', bg:'gold', sprite:'🎫' } },
  { icon:'🎂', title:'生日快乐',   desc:'今天你生日，每位玩家送你 $1,000',          eachFrom:1000, cut:{ fx:'pulse', bg:'red', rain:'🎉' } },
  { icon:'🎁', title:'乔迁之喜',   desc:'你乔迁新居发红包，给每位玩家 $1,000',      eachTo:1000, cut:{ fx:'pulse', bg:'warm', rain:'🎊' } },
  { icon:'🎈', title:'热气球观光', desc:'乘热气球飘到轮渡码头',      moveTo:25, fly:true, cut:{ fx:'drive', bg:'sky', sprite:'🎈', rain:'☁️' } },
  { icon:'💼', title:'跳槽升职',   desc:'新东家开价更高，+ $6,000',   money:+6000, cut:{ fx:'rise', bg:'gold', rain:'🪙' } },
  { icon:'🎓', title:'夜校充电',   desc:'学费 $1,500，还送一张出狱许可证', money:-1500, bailCard:true, cut:{ fx:'pulse', bg:'blue' } },
  { icon:'🚴', title:'共享单车',   desc:'骑行兜风，前进 2 格',        moveRel:2, cut:{ fx:'drive', bg:'sky', sprite:'🚴' } },
  { icon:'🛵', title:'外卖冲单',   desc:'跑单王奖励，+ $2,500',       money:+2500, cut:{ fx:'fall', bg:'gold', rain:'🪙' } },
  { icon:'🎸', title:'演唱会门票', desc:'内场票真贵，- $4,000',       money:-4000, toPot:true, cut:{ fx:'shake', bg:'purple' } },
  { icon:'🐕', title:'宠物咖啡屋', desc:'萌宠引流，每位玩家给你 $800', eachFrom:800, cut:{ fx:'pulse', bg:'warm', rain:'🎊' } },
  { icon:'🏦', title:'理财到期',   desc:'稳健理财兑付，+ $4,500',     money:+4500, cut:{ fx:'rise', bg:'gold' } },
  { icon:'🎡', title:'游乐园年卡', desc:'快乐是要花钱的，- $2,000',   money:-2000, toPot:true, cut:{ fx:'fall', bg:'purple', rain:'🎊' } },
  { icon:'📸', title:'网红打卡',   desc:'探店视频爆火，前进到中央公园', moveTo:20, cut:{ fx:'drive', bg:'sky', sprite:'📸' } },
  { icon:'🧧', title:'开工红包',   desc:'老板豪气，+ $3,600',         money:+3600, cut:{ fx:'fall', bg:'red', rain:'🧧' } },
];

/* ---------- 命运卡（新闻/事件，多为全局） ---------- */
const DESTINY_CARDS = [
  { icon:'📰', title:'经济繁荣',   desc:'市场火热，全体玩家 + $2,000',              global:+2000, cut:{ fx:'rise', bg:'gold' } },
  { icon:'📉', title:'金融危机',   desc:'黑天鹅来袭，全体玩家 - $1,500',            global:-1500, toPot:true, cut:{ fx:'fall', bg:'red' } },
  { icon:'💰', title:'央行降息',   desc:'放水救市，全体玩家 + $3,000',              global:+3000, cut:{ fx:'fall', bg:'gold', rain:'💰' } },
  { icon:'🐂', title:'牛市来了',   desc:'地产股飙升，持有房产最多者 + $5,000',      mostBuilds:+5000, cut:{ fx:'drive', bg:'green', sprite:'🐂' } },
  { icon:'🐻', title:'熊市做空',   desc:'地产股崩盘，持有房产最多者 - $5,000',      mostBuilds:-5000, toPot:true, cut:{ fx:'fall', bg:'blue', sprite:'🐻' } },
  { icon:'🔍', title:'税务稽查',   desc:'资产最高者被稽查，缴纳 10% 现金',          richestPays:0.1, cut:{ fx:'shake', bg:'news', sprite:'🔍' } },
  { icon:'🎁', title:'慈善抽奖',   desc:'善有善报，资产最低者获得 $4,000',          poorestGets:4000, cut:{ fx:'pulse', bg:'purple', rain:'🎊' } },
  { icon:'🏗️', title:'市政施工',   desc:'规划调整，随机一名玩家的随机建筑被拆除一层', randomDemolish:true, cut:{ fx:'shake', bg:'warm', sprite:'🏗️', rain:'💨' } },
  { icon:'🚧', title:'交通管制',   desc:'前方封路，你原地休息一回合',               skip:1, cut:{ fx:'pulse', bg:'gray', sprite:'🚧' } },
  { icon:'🧾', title:'做假账被查', desc:'偷税漏税锒铛入狱，全场围观',               gotoJail:true, jailReason:'偷税漏税 · 依法拘留', cut:{ fx:'shake', bg:'news', sprite:'🧾' } },
  { icon:'🥊', title:'斗殴滋事',   desc:'谈判破裂大打出手，警察带走了你',           gotoJail:true, jailReason:'聚众斗殴 · 治安拘留', cut:{ fx:'shake', bg:'gray', sprite:'🥊' } },
  { icon:'🏆', title:'彩票开奖',   desc:'幸运儿竟是你！独得全部奖池',               potWin:true, cut:{ fx:'pulse', bg:'gold', rain:'🎉' } },
  { icon:'🎬', title:'剧组取景',   desc:'你家上电视了，+ $7,000',     money:+7000, cut:{ fx:'rise', bg:'gold', rain:'🪙' } },
  { icon:'🌧️', title:'梅雨季',    desc:'出行不便，全体玩家 - $1,000', global:-1000, toPot:true, cut:{ fx:'fall', bg:'gray', rain:'💧' } },
  { icon:'🛍️', title:'购物狂欢节', desc:'剁手一时爽，- $3,500',       money:-3500, toPot:true, cut:{ fx:'fall', bg:'red', rain:'🛍️' } },
  { icon:'🎮', title:'电竞夺冠',   desc:'战队分你奖金，+ $5,000',     money:+5000, cut:{ fx:'pulse', bg:'purple', rain:'🎉' } },
  { icon:'🏮', title:'元宵灯会',   desc:'逛灯会人人有礼，每位玩家给你 $1,200', eachFrom:1200, cut:{ fx:'pulse', bg:'red', rain:'🧧' } },
  { icon:'🎰', title:'幸运转盘',   desc:'转到多少算多少（$1,000 ~ $9,000）', randomMoney:[1000, 9000], cut:{ fx:'pulse', bg:'gold', rain:'🪙' } },
  { icon:'🐠', title:'开渔节丰收', desc:'头鱼拍卖所得，+ $3,600',     money:+3600, cut:{ fx:'rise', bg:'blue' } },
  { icon:'🧯', title:'有惊无险',   desc:'虚惊一场，安慰奖 + $500',    money:+500, cut:{ fx:'pulse', bg:'gray' } },
];

/* ---------- 道具（道具体系 2.0，见 DESIGN_PROPS_V2.md §3） ----------
 * rarity: 1 常见 / 2 精良 / 3 稀有 / 4 史诗（与生涯称号五档配色同源）
 * counter: 商店「克制提示」文案；顺序即商店/芯片展示顺序
 * 一次性状态槽（复用护身符 p.shield 模式）：insurance→p.insurance / bailiff→p.bailiff / piggy→p.piggy
 * 主动目标型：block/demo/sweeper/rush 选格；thief/frame 选对手玩家 */
const PROPS = {
  block:     { name:'路障',       icon:'🚧', price:3000,  rarity:1, desc:'放在任意格子上，路过的玩家被迫停下', counter:'被克制：清障车 · 遥控骰子可绕开' },
  dice:      { name:'遥控骰子',   icon:'🔮', price:4000,  rarity:2, desc:'指定你下一次掷出的点数（1-6）', counter:'软克制：路障（锁小点数绕开）' },
  shield:    { name:'护身符',     icon:'🧿', price:4000,  rarity:2, desc:'免除下一次应付的租金', counter:'被克制：强制收租令' },
  demo:      { name:'拆迁令',     icon:'💣', price:6000,  rarity:3, desc:'拆除目标建筑的一层', counter:'被克制：保险单 · 加急施工令可回补' },
  equal:     { name:'均富卡',     icon:'⚖️', price:15000, rarity:4, desc:'全场玩家现金平均分配，天下大同（持私房钱者不参与）', counter:'被克制：私房钱' },
  sweeper:   { name:'清障车',     icon:'🚛', price:2500,  rarity:1, desc:'拆除场上任意 1 个路障（含自己放错的），路障直接消失', counter:'克制：路障' },
  insurance: { name:'保险单',     icon:'📋', price:3500,  rarity:2, desc:'一次性：你名下建筑下次被拆迁令/市政施工拆除时层数不减', counter:'克制：拆迁令' },
  bailiff:   { name:'强制收租令', icon:'📢', price:3500,  rarity:2, desc:'一次性：你下次收到租金时，租客的护身符失效仍须付租', counter:'克制：护身符' },
  piggy:     { name:'私房钱',     icon:'🐷', price:8000,  rarity:3, desc:'一次性：均富卡结算时你保留原现金，不参与均摊', counter:'克制：均富卡' },
  thief:     { name:'窃贼卡',     icon:'🦝', price:5000,  rarity:3, desc:'指定一名对手，随机偷走其库存 1 件道具（偷不到窃贼卡）', counter:'克制：一切囤货（对策：早用、少囤）' },
  rush:      { name:'加急施工令', icon:'🏗️', price:6000,  rarity:3, desc:'自有地块 +1 层（普通周最高 3 级，建设周可冲 4 级）', counter:'对冲：拆迁令' },
  frame:     { name:'诬陷卡',     icon:'🕵️', price:6000,  rarity:3, desc:'选定一名对手，令其被警车立即押送入狱', counter:'致人入狱：入狱归因记在使用者头上' },
};
const PROP_MAX = 2;   // 每种道具最多持有数量（购买上限；窃贼赃物不受此限）

/* ---------- 工具 ---------- */
function fmt(n) { return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US'); }
function groupOf(tile) { return tile.group ? GROUPS[tile.group] : null; }
function pname(p) { return (p && p.name) ? p.name : charOf(p).name; }
function monopolized(idx, ownerIdx) {
  const g = BOARD[idx].group; if (!g) return false;
  for (let i = 0; i < BOARD.length; i++) {
    if (i !== idx && BOARD[i].group === g && G.tiles[i].owner !== ownerIdx) return false;
  }
  return true;
}
function stationCount(ownerIdx) {
  let n = 0;
  BOARD.forEach((t, i) => { if (t.type === 'station' && G.tiles[i].owner === ownerIdx) n++; });
  return n;
}
function utilityCount(ownerIdx) {
  let n = 0;
  BOARD.forEach((t, i) => { if (t.type === 'utility' && G.tiles[i].owner === ownerIdx) n++; });
  return n;
}
/* 地租：地产租金（垄断加倍仅作用于空地） */
function rentOf(idx, ownerIdx, level) {
  const t = BOARD[idx];
  if (t.type === 'station') return CFG.STATION_RENT[Math.max(0, stationCount(ownerIdx) - 1)];
  if (t.type === 'utility') return G.lastRoll * (utilityCount(ownerIdx) === 2 ? CFG.UTILITY_RENT[1] : CFG.UTILITY_RENT[0]);
  let r = t.price * CFG.RENT_MULT[level];
  if (level === 0 && monopolized(idx, ownerIdx)) r *= 2;
  return Math.round(r);
}
function landValue(idx) {
  const st = G.tiles[idx], t = BOARD[idx];
  if (st.owner == null) return 0;
  if (t.type === 'prop') return t.price + (st.level || 0) * t.buildCost;
  return t.price;
}
