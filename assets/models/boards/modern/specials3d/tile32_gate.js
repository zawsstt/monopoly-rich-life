/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/specials3d/tile32_gate.js  格 32「拘留所」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/special_32.png（2020s 单象限，写实航拍 3/4 视角现代执法机构）：
 *   主楼      ：暖米石材五层政务楼（左右翼对称 4 列大窗，每窗实体白窗台/窗楣 + 贴图白框
 *               + 转角/翼间通高壁柱）+ 中央凸出入口体系（双层高白柱门廊 + 门廊顶露台栏板
 *               + 自露台直抵蓝带的深色幕墙玻璃 4 分格 + 顶部一层高石材升高段嵌大警徽）
 *               + 顶部通长警用深蓝标识带（一层楼高、绕主楼/凸体/附楼四周）+ 加厚白檐口
 *               + 低女儿墙 + 深灰平屋顶（楼梯间 + 空调机组 ×3 + 通风帽 ×4 + 避雷针）
 *               + 右侧贴合退后的三层附楼（3 列竖窄窗 + 蓝带 + 机组/风机/通风帽）
 *   大门围墙  ：浅色石材围墙（连续压顶 + 四周均匀方壁柱 ×26）+ 前左段石基黑竖杆铁栅栏
 *               （石柱分段）+ 主大门（双门柱 + 柱顶红蓝警示灯 + 黑色双扇铁栅门尖顶竖杆）
 *               + 右门柱旁单位牌匾 + 门内门岗亭 + 院内左前角门房（平顶 + 深窗带白窗台 + 门棚）
 *   院内      ：浅灰石材大板地坪（大分缝）+ 白色车位线两格 + 警车 ×2（白色 SUV + 蓝腰线
 *               + 深窗带 + 车顶横向红蓝警灯条 + 圆轮胎）+ 中央椭圆绿岛（草坪 + 白缘石环
 *               + 修剪黄杨球 ×10 + 小乔木 ×2 + 旗杆红旗）+ 台阶前广场 + 斜向大门步道 + 让行线
 *               + 门前宽台阶 ×3 + 两侧无障碍坡道 + 楼前对称绿化床（白缘石 + 绿篱 + 球排）
 *   围墙外    ：浅灰人行道 + 路缘石 + 两侧墙外绿篱；围墙内侧绿篱带 + 沿墙四簇层叠乔木 ×8
 *
 * 注册：window.Special3DModern[32]() → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.7×2.7（实测 2.68×2.69，高 1.23）；底面 y=0；正面 +z（主楼/大门朝 +z）；
 *       draw call ≤60（实测 31）；三角 ≤28k（实测 21.2k）；Canvas 纹理 ≤256px；
 *       源码零 Math.random（mulberry32 种子流）；
 *       动画 2 项：旗杆红旗摆动 / 大门柱顶警示灯红蓝脉冲（≤2 项封顶，幅度克制）。
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils，骨架对齐已验收
 *       范例 tile5_station.js / tile22_shop.js）——静态件全部合并为每材质 1 个 mesh
 *       （27 材质桶 + 警徽/旗面/警示灯 ×2 独立小件 = 31 draw call）；
 *       立面 = Canvas 贴图面片（白框/玻璃反光/层间线，UV 按世界尺寸烘焙）+ 逐窗实体窗台/窗楣
 *       （Bag.facade 与 facRow 行高数学同步，180 窗自动对位）；中央幕墙用深色内衬 + 专用
 *       深色玻璃 + 实体竖梃/横档；绿岛椭圆用圆柱/圆环非均匀缩放；警车为世界系直做（头朝 -z）。
 *
 * R1（前任初版 blockout→structure→form，未做渲染对照）：四层主楼 + 深沥青院 + 伸缩门。
 * R1→R2（差距 12 条）：①主楼加高至五层且左右翼对称 ②蓝带 0.08→0.11 上移至顶层窗之上
 *   ③中央入口体系重做（双层门廊 + 露台 + 玻璃凸窗 + penthouse 警徽）④院场深沥青→浅灰大板
 *   ⑤伸缩门→黑铁艺双扇栅栏门 + 石柱分段栅栏 ⑥围墙加高、壁柱扩至四周 ⑦警车放大改 SUV
 *   ⑧绿岛椭圆化 + 缘石环 + 球 ×6 + 树 ×2 ⑨树冠四簇层叠 ⑩门外路面衔接 ⑪屋顶设备增补
 *   ⑫立面重排（左右翼 4 列/侧 6/后 10/附楼，五层带底层加高窗）。
 * R2→R3（差距 12 条）：①凸窗加深色内衬 ②penthouse 加高前移、警徽贴脸 ③警车 ×1.15、车位收窄
 *   ④附楼 0.58→0.66 ⑤窗玻璃提亮加宽 ⑥绿岛球 6→10 ⑦门房放大 ⑧门外步道收进 ⑨栅栏杆低于柱顶
 *   ⑩层间线加宽 ⑪院场调灰 ⑫台阶加宽、柱加粗。
 * R3→R4（差距 10 条）：①斜步道旋转盒出界→收窄 + 大门口直段 ②女儿墙 0.062→0.04 ③penthouse
 *   加深灰顶 + 设备 + 避雷针 ④院场分缝密度 1.7→1.1 ⑤窗洞右/下阴影（凹陷感）⑥顶行上移
 *   ⑦楼前绿化床白缘石 + 球排 ⑧右门柱单位牌匾 ⑨围墙外改人行道 + 墙外绿篱 ⑩后立面整幅 10 列。
 * R4→R5（差距 10 条）：①逐窗实体窗台/窗楣（Bag.facade，180 窗）②底层/二层空白带重排
 *   ③后墙绿篱/树穿主楼→删除、左后角短段 ④附楼贴合主楼 ⑤台阶前广场 0.62→0.80 ⑥檐口加厚
 *   ⑦蓝带加深 #1a3266 ⑧窗玻璃略深 ⑨门柱压顶 0.13 ⑩附楼东面专用 3 行贴图。
 * R5→R6（差距 10 条）：①幕墙玻璃自露台直抵蓝带 + 专用深色玻璃 ②旗杆 1.42→1.02 ③门岗亭
 *   ④屋面分格降对比 ⑤台阶两侧坡道 + 边石 ⑥沙盘路缘石 ×4 ⑦立面石材调暖 #d5cebc ⑧窗楣减薄
 *   ⑨附楼 2 列→3 列竖窄窗 ⑩门柱球饰与警示灯同位→去球饰、灯落压顶座。
 * R6→R7（差距 10 条）：①penthouse 0.20→0.16（≈一层）②旗杆左移绿岛左焦点（正视不压警徽）
 *   ③去浅色环路（参考环路同院场色）④警灯改横向左红右蓝长条 ⑤窗台 0.012→0.010 ⑥门内让行线
 *   ⑦附楼加机组 + 通风帽 ⑧警示灯座放大 ⑨坡道/绿化床避让复核 ⑩绿岛球位重排。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[boards/modern/specials3d/tile32_gate] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

window.Special3DModern = window.Special3DModern || {};

var PI = Math.PI;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }

/* ================= 0. 确定性伪随机（mulberry32，全文件零 Math.random） ================= */
function RNG(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================= 1. Canvas 程序纹理（≤256px；懒建单例） ================= */
var _tex = {};
function cvTex(key, w, h, draw, linear) {
  if (_tex[key]) return _tex[key];
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h, RNG(key.length * 1013 + w * 7 + h * 31));
  var t = new THREE.CanvasTexture(cv);
  t.encoding = linear ? THREE.LinearEncoding : THREE.sRGBEncoding;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  _tex[key] = t; return t;
}
function speckle(g, w, h, rnd, n, dark, light, mw, mh) {
  for (var i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? dark : light;
    g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1 + ((rnd() * mw) | 0), 1 + ((rnd() * mh) | 0));
  }
}
/* 围墙/勒脚石材：浅米色砌块 + 错缝 + 受光/阴影边 + 污渍 */
function texWallStone() {
  return cvTex('s32wall', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#cfc8b4'; g.fillRect(0, 0, w, h);
    var r, c, BH = 32, BW = 44;
    for (r = 0; r < 4; r++) {
      var off = (r % 2) * (BW / 2);
      for (c = -1; c < 4; c++) {
        var v = 0.92 + rnd() * 0.14, x = c * BW + off, y = r * BH;
        g.fillStyle = 'rgb(' + Math.round(212 * v) + ',' + Math.round(204 * v) + ',' + Math.round(184 * v) + ')';
        g.fillRect(x + 2, y + 2, BW - 4, BH - 4);
        g.fillStyle = 'rgba(255,252,240,0.32)'; g.fillRect(x + 2, y + 2, BW - 4, 2); g.fillRect(x + 2, y + 2, 2, BH - 4);
        g.fillStyle = 'rgba(96,88,70,0.26)'; g.fillRect(x + 2, y + BH - 5, BW - 4, 2); g.fillRect(x + BW - 5, y + 2, 2, BH - 4);
        if (rnd() < 0.2) { g.fillStyle = 'rgba(130,122,102,0.2)'; g.fillRect(x + 6 + ((rnd() * 24) | 0), y + 6 + ((rnd() * 16) | 0), 10 + ((rnd() * 12) | 0), 5 + ((rnd() * 8) | 0)); }
      }
    }
    speckle(g, w, h, rnd, 90, 'rgba(120,112,94,0.16)', 'rgba(246,242,230,0.18)', 6, 3);
    g.fillStyle = 'rgba(90,84,68,0.2)'; g.fillRect(0, h - 10, w, 10);
  });
}
/* 主楼石材墙面：暖米白 + 竖向板缝 + 色斑 + 根部污带 */
function texConc() {
  return cvTex('s32conc', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#d5cebc'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 100, 'rgba(150,144,128,0.18)', 'rgba(250,246,236,0.24)', 4, 3);
    g.fillStyle = 'rgba(104,98,82,0.16)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(140,134,118,0.12)'; g.fillRect((rnd() * w) | 0, 0, 2 + ((rnd() * 3) | 0), 30 + ((rnd() * 60) | 0)); }
    g.fillStyle = 'rgba(96,90,74,0.14)'; g.fillRect(0, h - 12, w, 12);
  });
}
/* 立面开窗贴图：cols 列 × rows 行（底层窗加高），白框/白窗台/玻璃反光/层间线/竖壁柱缝
 * —— 行高数学与 winRows() 共享，实体窗台/窗楣据此对位 */
function facRow(r, rows, h) {
  var topZone = h - 80, band = topZone / (rows - 1);
  if (r === 0) return { yb: h - 50, hb: 42 };
  return { yb: 10 + (rows - 1 - r) * band, hb: band - 15 };
}
function texFacade(key, cols, rows, groundTall) {
  return cvTex(key, 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#d5cebc'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 70, 'rgba(150,144,128,0.14)', 'rgba(250,246,236,0.18)', 5, 3);
    var cw = w / cols, i, r;
    /* 竖向壁柱缝 */
    for (i = 0; i <= cols; i++) {
      g.fillStyle = 'rgba(255,250,238,0.55)'; g.fillRect(i * cw - 2, 0, 2, h);
      g.fillStyle = 'rgba(104,98,82,0.22)'; g.fillRect(i * cw + 1, 0, 1, h);
    }
    for (r = 0; r < rows; r++) {
      var fr = facRow(r, rows, h), yb = fr.yb, hb = fr.hb;
      g.fillStyle = 'rgba(255,250,238,0.7)'; g.fillRect(0, yb - 6, w, 4);    /* 层间线 */
      g.fillStyle = 'rgba(104,98,82,0.22)'; g.fillRect(0, yb + hb + 3, w, 2);
      for (i = 0; i < cols; i++) {
        var x = i * cw + cw * 0.15, ww = cw * 0.70;
        g.fillStyle = 'rgba(70,64,52,0.42)'; g.fillRect(x - 1, yb - 1, ww + 6, hb + 6); /* 窗洞右/下阴影（凹陷感） */
        g.fillStyle = '#f6f2e6'; g.fillRect(x - 3, yb - 3, ww + 6, hb + 6);  /* 白窗框 */
        g.fillStyle = 'rgba(40,36,30,0.5)'; g.fillRect(x, yb, ww, 2); g.fillRect(x, yb, 2, hb); /* 框内上/左投影 */
        var gr = g.createLinearGradient(x, yb, x + ww, yb + hb);             /* 玻璃反光（中灰蓝） */
        gr.addColorStop(0, '#7f93a5'); gr.addColorStop(0.5, '#4e6071'); gr.addColorStop(1, '#3a4956');
        g.fillStyle = gr; g.fillRect(x, yb, ww, hb);
        g.fillStyle = 'rgba(214,230,240,0.5)'; g.fillRect(x + 2, yb + 2, ww * 0.22, hb - 4);
        g.fillStyle = 'rgba(20,30,40,0.4)'; g.fillRect(x + ww * 0.5, yb, 1.5, hb);   /* 中梃 */
        g.fillStyle = '#f8f4ea'; g.fillRect(x - 4, yb + hb + 4, ww + 8, 4);  /* 白窗台 */
        g.fillStyle = 'rgba(70,64,52,0.35)'; g.fillRect(x - 4, yb + hb + 8, ww + 8, 2);
      }
    }
    g.fillStyle = 'rgba(96,90,74,0.16)'; g.fillRect(0, h - 6, w, 6);         /* 根部污带 */
  });
}
/* 院场浅灰石材大板：分缝 + 色差斑 + 轮胎浅痕 */
function texYard() {
  return cvTex('s32yard', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#a3a29d'; g.fillRect(0, 0, w, h);
    var r, c, s = 64;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.94 + rnd() * 0.1, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(166 * v) + ',' + Math.round(165 * v) + ',' + Math.round(160 * v) + ')';
      g.fillRect(x + 2, y + 2, s - 4, s - 4);
      g.fillStyle = 'rgba(255,254,250,0.18)'; g.fillRect(x + 2, y + 2, s - 4, 2);
      g.fillStyle = 'rgba(80,78,72,0.24)'; g.fillRect(x + 2, y + s - 4, s - 4, 2); g.fillRect(x + s - 4, y + 2, 2, s - 4);
    }
    speckle(g, w, h, rnd, 120, 'rgba(110,108,102,0.18)', 'rgba(226,224,218,0.2)', 6, 4);
    g.fillStyle = 'rgba(140,138,132,0.14)';
    g.fillRect(46, 0, 7, h); g.fillRect(150, 0, 5, h);
  });
}
/* 混凝土步道：浅灰大板 + 分缝 */
function texWalk() {
  return cvTex('s32walk', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#bdbab0'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 90, 'rgba(110,108,100,0.2)', 'rgba(238,236,228,0.2)', 6, 3);
    g.fillStyle = 'rgba(88,86,80,0.28)';
    for (var i = 0; i < 4; i++) { g.fillRect(i * 32, 0, 2, h); g.fillRect(0, i * 32, w, 2); }
  });
}
/* 深灰屋顶：卷材大分格（低对比）+ 色差补丁 */
function texRoof() {
  return cvTex('s32roof', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#6e7072'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 90, 'rgba(50,52,56,0.3)', 'rgba(150,152,156,0.2)', 6, 4);
    g.fillStyle = 'rgba(48,50,54,0.16)';
    for (var i = 0; i < 2; i++) { g.fillRect(i * 64, 0, 2, h); g.fillRect(0, i * 64, w, 2); }
    if (rnd() < 0.9) { g.fillStyle = 'rgba(60,62,66,0.3)'; g.fillRect(30 + ((rnd() * 40) | 0), 20 + ((rnd() * 40) | 0), 24 + ((rnd() * 20) | 0), 14 + ((rnd() * 14) | 0)); }
  });
}
/* 树冠叶斑（三层明暗叶簇） */
function texLeaf() {
  return cvTex('s32leaf', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#7f9c5e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) {
      var v = rnd();
      g.fillStyle = v < 0.5 ? 'rgba(46,78,34,0.42)' : v < 0.8 ? 'rgba(150,186,100,0.5)' : 'rgba(200,216,140,0.35)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 4 + ((rnd() * 12) | 0), 3 + ((rnd() * 8) | 0));
    }
  });
}
/* 玻璃（凸窗/门斗/车窗）：蓝灰反光 + 竖梃分格 */
function texGlass() {
  return cvTex('s32glass', 128, 128, function (g, w, h) {
    var x;
    for (x = 0; x < w; x++) {
      var t = x / w, v = 0.85 + 0.15 * Math.sin(t * 6.283 * 1.2 + 0.6) + 0.04 * Math.sin(t * 30);
      g.fillStyle = 'rgb(' + Math.round(130 * v) + ',' + Math.round(152 * v) + ',' + Math.round(172 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    g.strokeStyle = 'rgba(232,240,246,0.55)'; g.lineWidth = 2;
    for (x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(18, 0, 6, h); g.fillRect(84, 0, 3, h);
  });
}

/* ================= 2. 材质（静态件模块级单例；发光/旗面每实例新建） ================= */
function M(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0)
  });
  if (o.map) m.map = o.map;
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.tr !== undefined) { m.transparent = true; m.opacity = o.tr; }
  if (o.ds) m.side = THREE.DoubleSide;
  return m;
}
var MATS = null;
function mats() {
  if (MATS) return MATS;
  MATS = {
    yard:    M('#ffffff', { map: texYard(), rough: 0.94 }),                            /* 院内浅灰石材大板 */
    walk:    M('#ffffff', { map: texWalk(), rough: 0.94 }),                            /* 步道/围墙外人行道 */
    stone:   M('#ffffff', { map: texWallStone(), rough: 0.9, ds: true }),              /* 围墙/勒脚石材 */
    conc:    M('#ffffff', { map: texConc(), rough: 0.88, ds: true }),                  /* 主楼墙面 */
    facF4:   M('#ffffff', { map: texFacade('s32facF4', 4, 5, true), rough: 0.8, ds: true }),   /* 左右翼 4 列 ×5 行 */
    facS6:   M('#ffffff', { map: texFacade('s32facS6', 6, 5, true), rough: 0.8, ds: true }),   /* 侧立面 6 列 */
    facB10:  M('#ffffff', { map: texFacade('s32facB10', 10, 5, true), rough: 0.8, ds: true }), /* 后立面 10 列 */
    facW3:   M('#ffffff', { map: texFacade('s32facW3', 3, 3, true), rough: 0.8, ds: true }),   /* 附楼 3 列竖窄窗 ×3 行 */
    facW6:   M('#ffffff', { map: texFacade('s32facW6', 6, 3, true), rough: 0.8, ds: true }),   /* 附楼东面 6 列 ×3 行 */
    band:    M('#1a3266', { rough: 0.5, metal: 0.12 }),                                /* 警用深蓝标识带 */
    trim:    M('#f0ebdf', { rough: 0.62 }),                                            /* 白色檐口/窗台线/缘石 */
    roofD:   M('#ffffff', { map: texRoof(), rough: 0.95 }),
    steel:   M('#8a9096', { rough: 0.45, metal: 0.7 }),
    silver:  M('#c8cdd2', { rough: 0.3, metal: 0.85 }),
    dark:    M('#2c3034', { rough: 0.6, metal: 0.2 }),
    curb:    M('#8e8c86', { rough: 0.9 }),                                             /* 路缘石 */
    glass:   M('#ffffff', { map: texGlass(), rough: 0.12, metal: 0.55, tr: 0.72 }),
    glassD:  M('#7d8fa3', { map: texGlass(), rough: 0.15, metal: 0.5, tr: 0.86 }),     /* 中央幕墙深色玻璃 */
    carW:    M('#f2f3f0', { rough: 0.35, metal: 0.15 }),
    carB:    M('#2a4f8e', { rough: 0.4, metal: 0.2 }),
    lampB:   M('#2e62c4', { rough: 0.3, emissive: '#3a76e0', ei: 0.5 }),               /* 警灯蓝（静态） */
    lampR:   M('#c03028', { rough: 0.3, emissive: '#e04038', ei: 0.5 }),               /* 警灯红（静态） */
    leaf:    M('#ffffff', { map: texLeaf(), rough: 0.95 }),
    leaf2:   M('#a9b894', { map: texLeaf(), rough: 0.95 }),
    hedge:   M('#5d7a3f', { rough: 1 }),
    lawn:    M('#6f8f4a', { rough: 0.96 }),
    trunk:   M('#8c7050', { rough: 0.9 })
  };
  return MATS;
}

/* ================= 3. 按材质分桶合并（r147 无 BufferGeometryUtils，手写） ================= */
function Bag() { this.b = {}; }
Bag.prototype.put = function (key, geo, m) {
  var g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (m) g.applyMatrix4(m);
  (this.b[key] || (this.b[key] = [])).push(g);
};
Bag.prototype.build = function (group) {
  var Ms = mats(), n = 0;
  for (var k in this.b) {
    var geos = this.b[k], mat = Ms[k]; if (!geos.length || !mat) continue;
    var pos = [], nor = [], uv = [];
    for (var i = 0; i < geos.length; i++) {
      var g = geos[i];
      var p = g.attributes.position.array, nr = g.attributes.normal.array;
      var u = g.attributes.uv ? g.attributes.uv.array : null;
      for (var j = 0; j < p.length; j++) pos.push(p[j]);
      for (j = 0; j < nr.length; j++) nor.push(nr[j]);
      if (u) for (j = 0; j < u.length; j++) uv.push(u[j]);
      else for (j = 0; j < p.length / 3 * 2; j++) uv.push(0);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    var mesh = new THREE.Mesh(geo, mat);
    mesh.name = k;
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh); n++;
  }
  return n;
};

/* ---------- 变换 & 图元（UV 按实际尺寸烘焙，保证合并后贴图密度一致） ---------- */
var _e = new THREE.Euler(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _sv = new THREE.Vector3();
function m4(x, y, z, rx, ry, rz, sx, sy, sz, order) {
  _e.set(rx || 0, ry || 0, rz || 0, order || 'XYZ'); _q.setFromEuler(_e);
  _p.set(x || 0, y || 0, z || 0);
  _sv.set(sx === undefined ? 1 : sx, sy === undefined ? 1 : sy, sz === undefined ? 1 : sz);
  return new THREE.Matrix4().compose(_p, _q, _sv);
}
function boxUV(g, w, h, d, sc) {
  var uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (var f = 0; f < 6; f++) for (var v = 0; v < 4; v++) {
    var i = f * 4 + v;
    uv.setXY(i, uv.getX(i) * dims[f][0] * sc, uv.getY(i) * dims[f][1] * sc);
  }
}
var SC = { stone: 1.4, conc: 1.5, fac: 1.0, yard: 1.1, walk: 2.2, roof: 1.4 };
Bag.prototype.box = function (key, w, h, d, x, y, z, rx, ry, rz, sc) {
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, sc !== undefined ? sc : SC.conc);
  this.put(key, g, m4(x, y, z, rx, ry, rz));
};
Bag.prototype.cyl = function (key, rt, rb, h, x, y, z, rx, ry, rz, seg) {
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 12), m4(x, y, z, rx, ry, rz));
};
Bag.prototype.sph = function (key, r, x, y, z, ws, hs) {
  this.put(key, new THREE.SphereGeometry(r, ws || 12, hs || 9), m4(x, y, z));
};
/* 立面贴图面片（UV 按世界尺寸烘焙） */
Bag.prototype.plane = function (key, w, h, x, y, z, rx, ry, sc) {
  var g = new THREE.PlaneGeometry(w, h);
  var uv = g.attributes.uv, i;
  for (i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w * (sc || SC.fac), uv.getY(i) * h * (sc || SC.fac));
  this.put(key, g, m4(x, y, z, rx, ry));
};
/* 立面 = 贴图面片 + 逐窗实体白窗台/窗楣（行高与 facRow 同步；ry ∈ {0, π, ±π/2}） */
Bag.prototype.facade = function (key, cols, rows, w, hgt, x, y, z, ry) {
  this.plane(key, w, hgt, x, y, z, 0, ry);
  var y1 = y + hgt / 2, cw = w / cols, ww = cw * 0.70, i, r;
  var side = (ry === PI / 2 || ry === -PI / 2);
  var nx = ry === PI / 2 ? 1 : ry === -PI / 2 ? -1 : 0, nz = ry === 0 ? 1 : ry === PI ? -1 : 0;
  for (r = 0; r < rows; r++) {
    var fr = facRow(r, rows, 256);
    var yBot = y1 - (fr.yb + fr.hb) / 256 * hgt, yTop = y1 - fr.yb / 256 * hgt;
    for (i = 0; i < cols; i++) {
      var u = -w / 2 + cw * (i + 0.5);
      var wx = side ? x + nx * 0.009 : x + u, wz = side ? z + u : z + nz * 0.009;
      if (side) {
        this.box('trim', 0.024, 0.010, ww + 0.02, wx, yBot - 0.004, wz);            /* 窗台 */
        this.box('trim', 0.016, 0.006, ww + 0.02, wx - nx * 0.004, yTop + 0.005, wz); /* 窗楣 */
      } else {
        this.box('trim', ww + 0.02, 0.010, 0.024, wx, yBot - 0.004, wz);
        this.box('trim', ww + 0.02, 0.006, 0.016, wx, yTop + 0.005, wz - nz * 0.004);
      }
    }
  }
};

/* ================= 4. 独立小件（Canvas，每实例新建） ================= */
/* 警徽（红底金环五星 + 两侧麦穗弧 + 底盾） */
function emblemMesh(r) {
  var cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
  var g = cv.getContext('2d');
  g.fillStyle = '#a02520'; g.beginPath(); g.arc(64, 60, 44, 0, PI * 2); g.fill();
  g.strokeStyle = '#d8b23a'; g.lineWidth = 6; g.beginPath(); g.arc(64, 60, 44, 0, PI * 2); g.stroke();
  g.fillStyle = '#e8c250';                                                          /* 五星 */
  g.beginPath();
  for (var i = 0; i < 5; i++) {
    var a = -PI / 2 + i * PI * 2 / 5, a2 = a + PI / 5;
    g.lineTo(64 + 26 * Math.cos(a), 60 + 26 * Math.sin(a));
    g.lineTo(64 + 10 * Math.cos(a2), 60 + 10 * Math.sin(a2));
  }
  g.closePath(); g.fill();
  g.strokeStyle = '#d8b23a'; g.lineWidth = 7;                                       /* 两侧麦穗弧 */
  g.beginPath(); g.arc(64, 74, 50, PI * 0.62, PI * 0.95); g.stroke();
  g.beginPath(); g.arc(64, 74, 50, PI * 0.05, PI * 0.38); g.stroke();
  g.fillStyle = '#e8c250'; g.fillRect(44, 104, 40, 10);                             /* 底盾牌 */
  g.fillRect(50, 112, 28, 6);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  var m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.15, emissive: C('#6a5018'), emissiveIntensity: 0.18 });
  var mesh = new THREE.Mesh(new THREE.CircleGeometry(r, 24), m);
  mesh.castShadow = true;
  return mesh;
}
/* 红旗（金色五星；pivot 在旗杆边） */
function flagMesh(w, h) {
  var cv = document.createElement('canvas'); cv.width = 128; cv.height = 86;
  var g = cv.getContext('2d');
  g.fillStyle = '#d3221c'; g.fillRect(0, 0, 128, 86);
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 0, 128, 10);
  g.fillStyle = '#f4d03c';
  g.beginPath();                                                                    /* 大星 */
  for (var i = 0; i < 5; i++) {
    var a = -PI / 2 + i * PI * 2 / 5, a2 = a + PI / 5;
    g.lineTo(22 + 13 * Math.cos(a), 24 + 13 * Math.sin(a));
    g.lineTo(22 + 5 * Math.cos(a2), 24 + 5 * Math.sin(a2));
  }
  g.closePath(); g.fill();
  var k, cx = [46, 54, 60, 54], cy = [8, 17, 28, 38];
  for (k = 0; k < 4; k++) {                                                         /* 四小星 */
    g.beginPath();
    for (i = 0; i < 5; i++) {
      var b = -PI / 2 + i * PI * 2 / 5, b2 = b + PI / 5;
      g.lineTo(cx[k] + 5 * Math.cos(b), cy[k] + 5 * Math.sin(b));
      g.lineTo(cx[k] + 2 * Math.cos(b2), cy[k] + 2 * Math.sin(b2));
    }
    g.closePath(); g.fill();
  }
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  var m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7, side: THREE.DoubleSide });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.castShadow = true;
  return mesh;
}

/* ================= 5. 预制构件 ================= */
/* 四簇层叠圆冠乔木（干 + 主冠 + 两侧偏冠 + 顶冠） */
function tree(bag, x, z, s) {
  bag.cyl('trunk', 0.014 * s, 0.022 * s, 0.30 * s, x, 0.05 + 0.15 * s, z, 0, 0, 0, 10);
  bag.sph('leaf', 0.135 * s, x, 0.05 + 0.36 * s, z, 12, 9);
  bag.sph('leaf2', 0.10 * s, x + 0.10 * s, 0.05 + 0.30 * s, z + 0.05 * s, 11, 8);
  bag.sph('leaf', 0.09 * s, x - 0.09 * s, 0.05 + 0.31 * s, z - 0.05 * s, 11, 8);
  bag.sph('leaf2', 0.075 * s, x + 0.02 * s, 0.05 + 0.46 * s, z - 0.03 * s, 10, 8);
}
/* 灌木球 */
function shrub(bag, x, z, s) {
  bag.sph('hedge', s, x, 0.05 + s * 0.7, z, 10, 8);
}
/* 庭院灯（钢杆 + 悬挑 + 灯头） */
function lampPost(bag, x, z, dir) {
  bag.cyl('steel', 0.008, 0.011, 0.34, x, 0.05 + 0.17, z, 0, 0, 0, 8);
  bag.box('steel', 0.09 * dir, 0.012, 0.012, x + 0.045 * dir, 0.385, z);
  bag.box('trim', 0.04, 0.016, 0.028, x + 0.085 * dir, 0.372, z);
}
/* 白色 SUV 警车（车头朝 -z；蓝腰线 + 深窗带 + 车顶长条红蓝警灯 + 圆轮胎；s=整体缩放） */
function policeCar(bag, x, z, s) {
  s = s || 1;
  var y0 = 0.05;
  function B(key, w, h, d, dx, dy, dz) { bag.box(key, w * s, h * s, d * s, x + dx * s, y0 + dy * s, z + dz * s); }
  B('dark', 0.095, 0.02, 0.23, 0, 0.023, 0);                                        /* 底盘 */
  B('carW', 0.098, 0.052, 0.24, 0, 0.059, 0);                                       /* 主车身 */
  B('carB', 0.10, 0.009, 0.242, 0, 0.038, 0);                                       /* 蓝腰线 */
  B('carW', 0.092, 0.038, 0.145, 0, 0.104, 0.012);                                  /* SUV 车厢 */
  B('glass', 0.094, 0.024, 0.136, 0, 0.097, 0.012);                                 /* 深色窗带 */
  B('dark', 0.078, 0.006, 0.032, 0, 0.125, 0.0);                                    /* 警灯条底座（横向） */
  B('lampR', 0.036, 0.012, 0.028, -0.019, 0.134, 0.0);                              /* 警灯条：左红 */
  B('lampB', 0.036, 0.012, 0.028, 0.019, 0.134, 0.0);                               /* 警灯条：右蓝 */
  B('dark', 0.05, 0.016, 0.012, 0, 0.046, -0.123);                                  /* 前格栅 */
  B('dark', 0.05, 0.012, 0.012, 0, 0.102, -0.12);                                   /* 前挡风上沿 */
  B('carB', 0.07, 0.012, 0.01, 0, 0.058, 0.122);                                    /* 尾部蓝条 */
  var i;
  for (i = 0; i < 4; i++) {
    bag.cyl('dark', 0.024 * s, 0.024 * s, 0.015 * s, x + (i % 2 ? 0.044 : -0.044) * s, y0 + 0.014 * s, z + (i < 2 ? 0.074 : -0.074) * s, 0, 0, PI / 2, 12);
  }
}
/* 空调机组（机壳 + 风扇盘 + 支架） */
function acUnit(bag, x, y, z) {
  bag.box('steel', 0.09, 0.05, 0.05, x, y, z);
  bag.cyl('dark', 0.017, 0.017, 0.012, x + 0.028, y, z, 0, PI / 2, 0, 12);
  bag.box('dark', 0.012, 0.03, 0.04, x - 0.05, y - 0.02, z);
}

/* ================= 6. 工厂 ================= */
window.Special3DModern[32] = function () {
  var g = new THREE.Group();
  g.name = 'special32m_detention';
  var bag = new Bag();
  var i, sx, k;

  /* —— 主楼几何常量（五层，左右翼对称） —— */
  var MX0 = -0.93, MX1 = 0.93;          /* 主楼 x 范围（宽 1.86） */
  var MZ0 = -1.24, MZ1 = -0.09;         /* 主楼 z 范围（进深 1.15，前脸 -0.09） */
  var MCX = (MX0 + MX1) / 2, MCZ = (MZ0 + MZ1) / 2;
  var MH = 0.84;                        /* 主楼檐口高 */
  var BAND0 = 0.665, BAND1 = 0.775;     /* 警用蓝带下/上沿（一层楼高） */
  var WX0 = 0.93, WX1 = 1.22;           /* 右侧附楼 x 范围（贴主楼东墙，三层，退后） */
  var WZ0 = -1.18, WZ1 = -0.50;         /* 附楼 z 范围 */
  var WH = 0.66;                        /* 附楼檐口高 */
  var GY = 0.05;                        /* 沙盘面标高 */
  var FY0 = 0.115, FY1 = BAND0;         /* 立面贴图带 y 范围 */
  var FYC = (FY0 + FY1) / 2, FYH = FY1 - FY0;

  /* ========== 6.1 沙盘基座：围墙外浅灰人行道铺装（底面 y=0）+ 路缘石 ×4 + 墙外绿篱带 ×2 ========== */
  bag.box('walk', 2.68, 0.05, 2.68, 0, 0.025, 0, 0, 0, 0, 1.6);
  bag.box('curb', 2.68, 0.01, 0.02, 0, GY + 0.005, 1.33);
  bag.box('curb', 2.68, 0.01, 0.02, 0, GY + 0.005, -1.33);
  bag.box('curb', 0.02, 0.01, 2.64, 1.33, GY + 0.005, 0);
  bag.box('curb', 0.02, 0.01, 2.64, -1.33, GY + 0.005, 0);
  bag.box('hedge', 0.035, 0.04, 2.20, -1.302, GY + 0.02, -0.1);
  bag.box('hedge', 0.035, 0.04, 2.20, 1.302, GY + 0.02, -0.1);

  /* ========== 6.2 院内浅灰石材大板地坪 + 步道 + 车位线 ========== */
  bag.box('yard', 2.46, 0.006, 2.46, 0, GY + 0.003, -0.03, 0, 0, 0, SC.yard);
  bag.box('walk', 0.80, 0.006, 0.60, 0, GY + 0.005, 0.22, 0, 0, 0, SC.walk);         /* 台阶前广场 */
  bag.box('walk', 0.50, 0.006, 0.75, -0.155, GY + 0.005, 0.84, 0, -0.428, 0, SC.walk); /* 斜向大门步道 */
  bag.box('walk', 0.52, 0.006, 0.16, -0.31, GY + 0.005, 1.19, 0, 0, 0, SC.walk);     /* 大门口直段 */
  bag.box('trim', 0.50, 0.003, 0.02, -0.31, GY + 0.009, 1.10);                       /* 门内停车让行线 */
  bag.box('walk', 0.52, 0.007, 0.08, -0.31, GY + 0.0055, 1.295, 0, 0, 0, SC.walk);   /* 门外路面衔接 */
  bag.box('walk', 0.34, 0.006, 0.10, -1.16, GY + 0.005, 0.72, 0, 0, 0, SC.walk);     /* 门房前步道 */
  /* 车位白色划线（右前区，两格） */
  for (i = 0; i < 3; i++) bag.box('trim', 0.012, 0.004, 0.56, 0.52 + i * 0.27, GY + 0.0075, 0.575);
  bag.box('trim', 0.56, 0.004, 0.012, 0.79, GY + 0.0075, 0.295);
  bag.box('trim', 0.56, 0.004, 0.012, 0.79, GY + 0.0075, 0.855);

  /* ========== 6.3 中央椭圆绿岛：草坪 + 白缘石环 + 黄杨球环列 + 小乔木 ×2（旗杆偏左焦点） ========== */
  var IX = -0.25, IZ = 0.45;
  bag.put('lawn', new THREE.CylinderGeometry(0.40, 0.42, 0.018, 28), m4(IX, GY + 0.016, IZ, 0, 0, 0, 1, 1, 0.75)); /* 椭圆草坪 */
  bag.put('trim', new THREE.TorusGeometry(0.405, 0.016, 8, 28), m4(IX, GY + 0.014, IZ, -PI / 2, 0, 0, 1, 0.75, 1)); /* 缘石环 */
  shrub(bag, IX - 0.24, IZ - 0.06, 0.038); shrub(bag, IX + 0.24, IZ - 0.06, 0.040);
  shrub(bag, IX - 0.15, IZ - 0.15, 0.032); shrub(bag, IX + 0.15, IZ - 0.15, 0.034);
  shrub(bag, IX - 0.30, IZ + 0.06, 0.034); shrub(bag, IX + 0.30, IZ + 0.06, 0.036);
  shrub(bag, IX - 0.20, IZ + 0.16, 0.038); shrub(bag, IX + 0.20, IZ + 0.16, 0.036);
  shrub(bag, IX - 0.02, IZ - 0.18, 0.030); shrub(bag, IX + 0.08, IZ + 0.00, 0.030);
  tree(bag, IX + 0.22, IZ + 0.10, 0.52); tree(bag, IX - 0.22, IZ + 0.10, 0.52);

  /* ========== 6.4 石材围墙（压顶 + 四周壁柱）+ 前左黑栅栏 + 主大门 + 门房 ========== */
  var WY0 = GY, WY1 = GY + 0.185, WT = 0.05, WL = 1.28;                              /* 墙底/顶/厚/半跨 */
  function wallRun(x0, z0, x1, z1) {                                                 /* 直墙段（含压顶） */
    var cxm = (x0 + x1) / 2, czm = (z0 + z1) / 2;
    var w = Math.abs(x1 - x0) || WT, d = Math.abs(z1 - z0) || WT;
    bag.box('stone', w, WY1 - WY0 - 0.02, d, cxm, (WY0 + WY1 - 0.02) / 2, czm, 0, 0, 0, SC.stone);
    bag.box('trim', w + 0.02, 0.022, d + 0.02, cxm, WY1 - 0.011, czm);
  }
  function pier(x, z, h) {                                                           /* 方壁柱 */
    bag.box('stone', 0.075, h || 0.215, 0.075, x, GY + (h || 0.215) / 2, z, 0, 0, 0, SC.stone);
    bag.box('trim', 0.095, 0.02, 0.095, x, GY + (h || 0.215) + 0.01, z);
  }
  /* 后墙 + 左右墙（实心 + 均匀壁柱） */
  wallRun(-WL, -WL, WL, -WL);
  wallRun(-WL, -WL, -WL, WL);
  wallRun(WL, -WL, WL, WL);
  for (i = 0; i < 7; i++) pier(-1.12 + i * 0.373, -WL);                              /* 后墙壁柱 ×7 */
  for (i = 0; i < 6; i++) { pier(-WL, -1.06 + i * 0.40); pier(WL, -1.06 + i * 0.40); } /* 侧墙壁柱 ×6×2 */
  /* 前墙：右段实墙 + 壁柱 */
  wallRun(-0.02, WL, WL, WL);
  for (i = 0; i < 4; i++) pier(0.30 + i * 0.32, WL);
  /* 前墙左段：石基黑竖杆铁栅栏（石柱分段，杆顶低于柱压顶） */
  bag.box('stone', 0.64, 0.055, WT, -0.95, GY + 0.0275, WL, 0, 0, 0, SC.stone);      /* 石基 */
  bag.box('dark', 0.64, 0.014, 0.016, -0.95, GY + 0.212, WL);                        /* 顶横杆 */
  for (i = 0; i < 17; i++) bag.box('dark', 0.011, 0.14, 0.012, -1.25 + i * 0.04, GY + 0.142, WL); /* 黑竖杆 */
  for (i = 0; i < 3; i++) {                                                          /* 石柱 ×3（端柱/中柱/门柱） */
    pier(-1.26 + i * 0.32, WL, 0.25);
  }
  /* 大门双门柱（压顶 + 柱顶警示灯座；灯为独立发光件） */
  var GPX = [-0.60, -0.02];
  for (i = 0; i < 2; i++) {
    bag.box('stone', 0.11, 0.34, 0.11, GPX[i], GY + 0.17, WL, 0, 0, 0, SC.stone);
    bag.box('trim', 0.13, 0.026, 0.13, GPX[i], GY + 0.353, WL);
    bag.box('dark', 0.03, 0.01, 0.03, GPX[i], GY + 0.371, WL);
  }
  /* 门岗亭（大门右侧院内：白盒 + 深窗带 + 压顶 + 小门） */
  bag.box('conc', 0.18, 0.16, 0.18, 0.17, GY + 0.08, 1.12, 0, 0, 0, SC.conc);
  bag.box('trim', 0.20, 0.016, 0.20, 0.17, GY + 0.168, 1.12);
  bag.box('dark', 0.12, 0.05, 0.012, 0.17, GY + 0.105, 1.216);                      /* 前窗带（朝大门） */
  bag.box('dark', 0.012, 0.05, 0.12, 0.084, GY + 0.105, 1.12);                      /* 侧窗带（朝门口） */
  bag.box('dark', 0.05, 0.09, 0.012, 0.19, GY + 0.095, 1.024);                      /* 后门 */
  /* 黑色双扇铁栅门（尖顶竖杆 + 底/中/顶横杆） */
  function gateLeaf(x0, w) {
    var cx = x0 + w / 2;
    bag.box('dark', w, 0.014, 0.016, cx, GY + 0.068, WL - 0.004);                    /* 底横杆 */
    bag.box('dark', w, 0.016, 0.016, cx, GY + 0.228, WL - 0.004);                    /* 顶横杆 */
    bag.box('dark', w, 0.012, 0.014, cx, GY + 0.148, WL - 0.004);                    /* 中横杆 */
    var n = 7;
    for (i = 0; i <= n; i++) {
      var bx = x0 + (i === 0 ? 0.008 : i === n ? w - 0.008 : (i * w / n));
      var tall = (i === 0 || i === n);
      bag.box('dark', tall ? 0.016 : 0.010, tall ? 0.175 : 0.16, 0.013, bx, GY + 0.148, WL - 0.004);
      bag.sph('dark', tall ? 0.009 : 0.0065, bx, GY + (tall ? 0.243 : 0.236), WL - 0.004, 8, 6);
    }
  }
  gateLeaf(-0.585, 0.285);
  gateLeaf(-0.30, 0.285);
  bag.box('steel', 0.60, 0.008, 0.03, -0.30, GY + 0.004, WL - 0.004);                /* 地面导轨 */
  /* 单位牌匾（右门柱旁前墙：白竖牌 + 蓝字条） */
  bag.box('trim', 0.05, 0.17, 0.008, 0.075, GY + 0.16, WL + 0.03);
  bag.box('band', 0.024, 0.13, 0.004, 0.075, GY + 0.16, WL + 0.036);
  /* 门房（院内左前角：单层石材平顶 + 深窗带白窗台 + 门 + 门棚） */
  bag.box('conc', 0.40, 0.22, 0.30, -1.00, GY + 0.11, 0.90, 0, 0, 0, SC.conc);
  bag.box('trim', 0.435, 0.026, 0.335, -1.00, GY + 0.233, 0.90);
  bag.box('dark', 0.26, 0.068, 0.012, -1.00, GY + 0.145, 0.744);                     /* 前窗带 */
  bag.box('trim', 0.29, 0.012, 0.016, -1.00, GY + 0.105, 0.742);                     /* 白窗台 */
  bag.box('trim', 0.28, 0.012, 0.014, -1.00, GY + 0.185, 0.742);                     /* 窗顶线 */
  bag.box('dark', 0.012, 0.068, 0.22, -0.795, GY + 0.145, 0.90);                     /* 侧窗带 */
  bag.box('dark', 0.08, 0.135, 0.012, -1.15, GY + 0.12, 0.796);                      /* 门 */
  bag.box('trim', 0.12, 0.014, 0.09, -1.15, GY + 0.20, 0.79);                        /* 门棚 */
  bag.box('trim', 0.09, 0.02, 0.09, -1.00, GY + 0.256, 0.90);                        /* 屋顶小烟囱 */

  /* ========== 6.5 主楼：勒脚 + 墙体 + 五层立面膜 + 蓝带 + 檐口 + 女儿墙 + 屋顶设备 ========== */
  bag.box('stone', MX1 - MX0 + 0.08, 0.065, MZ1 - MZ0 + 0.08, MCX, GY + 0.0325, MCZ, 0, 0, 0, SC.stone); /* 勒脚 */
  bag.box('conc', MX1 - MX0, MH - GY - 0.05, MZ1 - MZ0, MCX, (GY + 0.05 + MH) / 2, MCZ, 0, 0, 0, SC.conc); /* 墙体 */
  /* 立面（贴图 + 逐窗实体窗台/窗楣，±0.006 出挑）：左右翼 4 列 / 侧 6 列 / 后 10 列 */
  bag.facade('facF4', 4, 5, 0.57, FYH, -0.645, FYC, MZ1 + 0.006, 0);                /* 左翼 */
  bag.facade('facF4', 4, 5, 0.57, FYH, 0.645, FYC, MZ1 + 0.006, 0);                 /* 右翼 */
  bag.facade('facB10', 10, 5, MX1 - MX0 - 0.02, FYH, MCX, FYC, MZ0 - 0.006, PI);    /* 后立面整幅 10 列 */
  bag.facade('facS6', 6, 5, MZ1 - MZ0 - 0.02, FYH, MX0 - 0.006, FYC, MCZ, -PI / 2); /* 西墙 */
  bag.facade('facS6', 6, 5, MZ1 - MZ0 - 0.02, FYH, MX1 + 0.006, FYC, MCZ, PI / 2);  /* 东墙 */
  /* 转角/翼间壁柱（前脸 4 根通高 + 侧墙转角） */
  var px = [MX0 + 0.008, -0.36, 0.36, MX1 - 0.008];
  for (i = 0; i < 4; i++) bag.box('trim', 0.05, MH - GY - 0.05, 0.018, px[i], (GY + 0.05 + MH) / 2, MZ1 + 0.008);
  for (sx = -1; sx <= 1; sx += 2) {
    bag.box('trim', 0.018, MH - GY - 0.05, 0.05, sx < 0 ? MX0 + 0.008 : MX1 - 0.008, (GY + 0.05 + MH) / 2, MZ0 + 0.05);
    bag.box('trim', 0.05, MH - GY - 0.05, 0.018, sx < 0 ? MX0 - 0.008 : MX1 + 0.008, (GY + 0.05 + MH) / 2, MZ0 + 0.05);
  }
  /* 警用深蓝标识带（一层楼高，绕主楼四周出挑 0.014） */
  bag.box('band', MX1 - MX0 + 0.028, BAND1 - BAND0, 0.028, MCX, (BAND0 + BAND1) / 2, MZ1 + 0.006);
  bag.box('band', MX1 - MX0 + 0.028, BAND1 - BAND0, 0.028, MCX, (BAND0 + BAND1) / 2, MZ0 - 0.006);
  bag.box('band', 0.028, BAND1 - BAND0, MZ1 - MZ0 + 0.028, MX0 - 0.008, (BAND0 + BAND1) / 2, MCZ);
  bag.box('band', 0.028, BAND1 - BAND0, MZ1 - MZ0 + 0.028, MX1 + 0.008, (BAND0 + BAND1) / 2, MCZ);
  /* 白色檐口（加厚出挑）+ 低女儿墙（四周）+ 压顶 */
  bag.box('trim', MX1 - MX0 + 0.06, 0.03, MZ1 - MZ0 + 0.06, MCX, MH - 0.015, MCZ);
  var py = MH + 0.028;
  bag.box('conc', MX1 - MX0 + 0.02, 0.04, 0.025, MCX, py + 0.02, MZ1 - 0.004, 0, 0, 0, SC.conc);
  bag.box('conc', MX1 - MX0 + 0.02, 0.04, 0.025, MCX, py + 0.02, MZ0 + 0.004, 0, 0, 0, SC.conc);
  bag.box('conc', 0.025, 0.04, MZ1 - MZ0 + 0.02, MX0 + 0.004, py + 0.02, MCZ, 0, 0, 0, SC.conc);
  bag.box('conc', 0.025, 0.04, MZ1 - MZ0 + 0.02, MX1 - 0.004, py + 0.02, MCZ, 0, 0, 0, SC.conc);
  bag.box('trim', MX1 - MX0 + 0.05, 0.016, 0.032, MCX, py + 0.048, MZ1 - 0.004);
  bag.box('trim', MX1 - MX0 + 0.05, 0.016, 0.032, MCX, py + 0.048, MZ0 + 0.004);
  bag.box('trim', 0.032, 0.016, MZ1 - MZ0 + 0.05, MX0 + 0.004, py + 0.048, MCZ);
  bag.box('trim', 0.032, 0.016, MZ1 - MZ0 + 0.05, MX1 - 0.004, py + 0.048, MCZ);
  /* 屋面板（深灰）+ 屋顶设备：楼梯间 + 空调 ×3 + 通风帽 ×4 */
  bag.box('roofD', MX1 - MX0 - 0.06, 0.014, MZ1 - MZ0 - 0.06, MCX, MH + 0.007, MCZ, 0, 0, 0, SC.roof);
  bag.box('conc', 0.32, 0.16, 0.22, -0.45, MH + 0.087, -0.98, 0, 0, 0, SC.conc);     /* 楼梯间 */
  bag.box('trim', 0.35, 0.02, 0.25, -0.45, MH + 0.177, -0.98);
  bag.box('dark', 0.08, 0.06, 0.012, -0.45, MH + 0.055, -0.865);                     /* 楼梯间门 */
  acUnit(bag, 0.30, MH + 0.035, -1.00);
  acUnit(bag, 0.58, MH + 0.035, -0.62);
  acUnit(bag, -0.05, MH + 0.035, -0.60);
  for (i = 0; i < 4; i++) {
    bag.cyl('steel', 0.02, 0.024, 0.035, -0.75 + i * 0.5, MH + 0.028, -0.32 - (i % 2) * 0.34, 0, 0, 0, 12);
    bag.cyl('trim', 0.014, 0.014, 0.012, -0.75 + i * 0.5, MH + 0.052, -0.32 - (i % 2) * 0.34, 0, 0, 0, 12);
  }

  /* ========== 6.6 中央凸出入口体系：双层门廊 + 露台 + 通高玻璃凸窗 + penthouse 警徽 ========== */
  var CB0 = -0.36, CB1 = 0.36;                                                       /* 中央体块 x 范围 */
  bag.box('conc', CB1 - CB0, FY1 - GY - 0.05, 0.10, 0, (GY + 0.05 + FY1) / 2, MZ1 + 0.05, 0, 0, 0, SC.conc); /* 石盒（前脸 z 0.01） */
  /* 通高玻璃凸窗（自门廊露台起直抵蓝带：深色内衬 + 4 分格深色幕墙玻璃 + 竖梃 ×5 + 横档 ×4） */
  bag.box('dark', 0.56, 0.32, 0.012, 0, 0.50, MZ1 + 0.094);                          /* 内衬 */
  bag.plane('glassD', 0.56, 0.32, 0, 0.50, MZ1 + 0.103, 0, 0);
  for (i = 0; i < 5; i++) bag.box('trim', 0.014, 0.32, 0.014, -0.28 + i * 0.14, 0.50, MZ1 + 0.108);
  bag.box('trim', 0.58, 0.02, 0.016, 0, 0.655, MZ1 + 0.106);                         /* 顶横档（抵蓝带） */
  bag.box('trim', 0.58, 0.012, 0.014, 0, 0.56, MZ1 + 0.106);                         /* 中横档 ×2 */
  bag.box('trim', 0.58, 0.012, 0.014, 0, 0.465, MZ1 + 0.106);
  bag.box('trim', 0.60, 0.018, 0.018, 0, 0.385, MZ1 + 0.107);                        /* 底横档（露台面上） */
  bag.box('band', CB1 - CB0 + 0.02, BAND1 - BAND0, 0.026, 0, (BAND0 + BAND1) / 2, MZ1 + 0.098); /* 蓝带续过凸体 */
  bag.box('trim', CB1 - CB0 + 0.03, 0.024, 0.10, 0, MH - 0.012, MZ1 + 0.05);         /* 凸体檐口 */
  /* 双层高门廊：白柱 ×4 + 顶板 + 露台栏板 */
  var PXx = [-0.28, -0.093, 0.093, 0.28];
  for (i = 0; i < 4; i++) bag.box('trim', 0.052, 0.235, 0.052, PXx[i], GY + 0.1725, MZ1 + 0.14);
  bag.box('trim', 0.80, 0.035, 0.24, 0, GY + 0.3075, MZ1 + 0.075);                   /* 门廊顶板 */
  bag.box('trim', 0.80, 0.05, 0.016, 0, GY + 0.35, MZ1 + 0.185);                     /* 露台前栏板 */
  bag.box('trim', 0.016, 0.05, 0.20, -0.392, GY + 0.35, MZ1 + 0.09);                 /* 露台侧栏板 ×2 */
  bag.box('trim', 0.016, 0.05, 0.20, 0.392, GY + 0.35, MZ1 + 0.09);
  /* 宽台阶 ×3（与门廊同宽）+ 两侧无障碍坡道条石 */
  for (i = 0; i < 3; i++) {
    bag.box('walk', 0.92 - i * 0.05, 0.03, 0.075, 0, GY + 0.065 - i * 0.026, MZ1 + 0.175 + i * 0.08, 0, 0, 0, SC.walk);
  }
  for (sx = -1; sx <= 1; sx += 2) {
    bag.box('walk', 0.10, 0.016, 0.30, sx * 0.53, GY + 0.045, MZ1 + 0.26, 0.24, 0, 0, SC.walk);   /* 坡道 */
    bag.box('trim', 0.012, 0.03, 0.30, sx * 0.585, GY + 0.055, MZ1 + 0.26, 0.24, 0, 0);          /* 坡道边石 */
  }
  /* 玻璃门斗（深色玻璃 + 白框 + 中门扇） */
  bag.box('glass', 0.46, 0.21, 0.02, 0, GY + 0.165, MZ1 + 0.062, 0, 0, 0, 1.2);
  bag.box('trim', 0.50, 0.03, 0.024, 0, GY + 0.285, MZ1 + 0.062);
  bag.box('trim', 0.50, 0.02, 0.024, 0, GY + 0.062, MZ1 + 0.062);
  bag.box('trim', 0.02, 0.21, 0.024, 0, GY + 0.165, MZ1 + 0.063);
  /* penthouse 石材升高段（约一层高，前移凸出女儿墙）+ 深灰顶面 + 小设备 + 大警徽贴脸 */
  bag.box('conc', 0.74, 0.16, 0.42, 0, MH + 0.062 + 0.08, MZ1 - 0.17, 0, 0, 0, SC.conc);
  bag.box('trim', 0.77, 0.02, 0.45, 0, MH + 0.232, MZ1 - 0.17);
  bag.box('roofD', 0.70, 0.008, 0.38, 0, MH + 0.246, MZ1 - 0.17, 0, 0, 0, SC.roof);
  bag.box('steel', 0.07, 0.04, 0.07, 0.22, MH + 0.27, MZ1 - 0.28);
  bag.cyl('steel', 0.003, 0.003, 0.14, -0.30, MH + 0.32, MZ1 - 0.30, 0, 0, 0, 8);   /* 避雷针 */
  var emb = emblemMesh(0.062);
  emb.position.set(0, MH + 0.142, MZ1 - 0.17 + 0.216); g.add(emb);

  /* ========== 6.7 右侧三层附楼（蓝带高度对齐参考的连续感 + 竖窗 + 平顶 + 设备） ========== */
  bag.box('stone', WX1 - WX0 + 0.04, 0.06, WZ1 - WZ0 + 0.04, (WX0 + WX1) / 2, GY + 0.03, (WZ0 + WZ1) / 2, 0, 0, 0, SC.stone);
  bag.box('conc', WX1 - WX0, WH - GY - 0.05, WZ1 - WZ0, (WX0 + WX1) / 2, (GY + 0.05 + WH) / 2, (WZ0 + WZ1) / 2, 0, 0, 0, SC.conc);
  bag.facade('facW3', 3, 3, 0.27, 0.40, (WX0 + WX1) / 2, 0.315, WZ1 + 0.006, 0);     /* 附楼前脸 3 列竖窄窗 */
  bag.facade('facW3', 3, 3, 0.27, 0.40, (WX0 + WX1) / 2, 0.315, WZ0 - 0.006, PI);
  bag.facade('facW6', 6, 3, WZ1 - WZ0 - 0.02, 0.40, WX1 + 0.006, 0.315, (WZ0 + WZ1) / 2, PI / 2);
  var WB0 = WH - 0.115, WB1 = WH - 0.04;                                             /* 附楼蓝带 */
  bag.box('band', WX1 - WX0 + 0.02, WB1 - WB0, 0.024, (WX0 + WX1) / 2, (WB0 + WB1) / 2, WZ1 + 0.004);
  bag.box('band', WX1 - WX0 + 0.02, WB1 - WB0, 0.024, (WX0 + WX1) / 2, (WB0 + WB1) / 2, WZ0 - 0.004);
  bag.box('band', 0.024, WB1 - WB0, WZ1 - WZ0 + 0.02, WX1 + 0.004, (WB0 + WB1) / 2, (WZ0 + WZ1) / 2);
  bag.box('trim', WX1 - WX0 + 0.03, 0.02, WZ1 - WZ0 + 0.03, (WX0 + WX1) / 2, WH + 0.008, (WZ0 + WZ1) / 2);
  bag.box('roofD', WX1 - WX0 - 0.03, 0.012, WZ1 - WZ0 - 0.03, (WX0 + WX1) / 2, WH + 0.004, (WZ0 + WZ1) / 2, 0, 0, 0, SC.roof);
  acUnit(bag, 1.095, WH + 0.03, -0.72);
  acUnit(bag, 1.04, WH + 0.03, -0.60);
  bag.box('steel', 0.06, 0.04, 0.06, 1.095, WH + 0.026, -0.98);                      /* 附楼风机 */
  bag.cyl('steel', 0.018, 0.022, 0.03, 1.13, WH + 0.024, -1.10, 0, 0, 0, 12);        /* 附楼通风帽 */
  bag.cyl('trim', 0.013, 0.013, 0.01, 1.13, WH + 0.044, -1.10, 0, 0, 0, 12);

  /* ========== 6.8 旗杆（银杆 + 球顶 + 旗面独立件；高≈主楼檐口 1.2 倍）+ 庭院灯 + 绿化 ========== */
  var FX = IX - 0.08, FZ = IZ + 0.02, FH = 1.02;
  bag.cyl('silver', 0.007, 0.010, FH, FX, GY + FH / 2, FZ, 0, 0, 0, 10);
  bag.sph('silver', 0.013, FX, GY + FH + 0.011, FZ, 10, 8);
  bag.cyl('stone', 0.045, 0.058, 0.06, FX, GY + 0.03, FZ, 0, 0, 0, 12);              /* 旗杆底座 */
  var flag = flagMesh(0.18, 0.115);
  flag.position.set(FX + 0.091, GY + FH - 0.09, FZ); g.add(flag);
  lampPost(bag, 0.36, 1.00, -1);                                                     /* 庭院灯 ×2 */
  lampPost(bag, -0.92, 0.24, 1);
  /* 围墙内侧绿篱带（前左/前右/右侧前段/左侧中段/左后角；主楼后墙贴围墙无绿篱） */
  bag.box('hedge', 0.56, 0.05, 0.06, -0.94, GY + 0.025, 1.16);
  bag.box('hedge', 0.20, 0.05, 0.06, -0.08, GY + 0.025, 1.16);
  bag.box('hedge', 0.92, 0.05, 0.06, 0.76, GY + 0.025, 1.16);
  bag.box('hedge', 0.06, 0.05, 1.00, 1.20, GY + 0.025, 0.62);
  bag.box('hedge', 0.06, 0.05, 1.50, -1.20, GY + 0.025, -0.40);
  bag.box('hedge', 0.24, 0.05, 0.06, -1.10, GY + 0.025, -1.20);
  /* 楼前两侧绿化床（白缘石 + 绿篱 + 修剪球排；避开台阶/坡道 x ±0.58） */
  bag.box('trim', 0.38, 0.012, 0.16, -0.78, GY + 0.006, 0.04);
  bag.box('trim', 0.38, 0.012, 0.16, 0.78, GY + 0.006, 0.04);
  bag.box('hedge', 0.36, 0.045, 0.13, -0.78, GY + 0.0285, 0.04);
  bag.box('hedge', 0.36, 0.045, 0.13, 0.78, GY + 0.0285, 0.04);
  shrub(bag, -0.92, 0.04, 0.034); shrub(bag, -0.83, 0.05, 0.036); shrub(bag, -0.73, 0.04, 0.034); shrub(bag, -0.64, 0.05, 0.032);
  shrub(bag, 0.64, 0.05, 0.032); shrub(bag, 0.73, 0.04, 0.034); shrub(bag, 0.83, 0.05, 0.036); shrub(bag, 0.92, 0.04, 0.034);
  shrub(bag, -0.94, 0.98, 0.036); shrub(bag, 1.10, 1.00, 0.034);
  shrub(bag, 1.16, 0.10, 0.036); shrub(bag, -1.14, -0.98, 0.038);
  /* 沿墙四簇层叠乔木 ×8（冠收在沙盘内；主楼后墙无空间不种树） */
  tree(bag, -1.14, 0.58, 0.60); tree(bag, -1.16, 0.05, 0.58); tree(bag, -1.14, -0.58, 0.62);
  tree(bag, -1.08, -1.08, 0.56); tree(bag, 1.10, -0.26, 0.56); tree(bag, 1.12, 0.72, 0.56);
  tree(bag, 1.14, 1.12, 0.52); tree(bag, 0.90, 1.10, 0.50);

  /* ========== 6.9 警车 ×2（车位内，车头朝 -z 朝主楼，放大 1.15） ========== */
  policeCar(bag, 0.655, 0.575, 1.15);
  policeCar(bag, 0.925, 0.575, 1.15);

  /* ========== 6.10 合并落地 ========== */
  var dc = bag.build(g);

  /* ========== 6.11 动画 ≤2 项：旗面摆动 / 门柱警示灯脉冲 ========== */
  var warnMat = new THREE.MeshStandardMaterial({ color: C('#d03530'), emissive: C('#ff4538'), emissiveIntensity: 0.55, roughness: 0.35 });
  var warn1 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 9), warnMat);
  warn1.position.set(GPX[0], GY + 0.383, WL); g.add(warn1);
  var warnMat2 = new THREE.MeshStandardMaterial({ color: C('#2852b8'), emissive: C('#3a76e0'), emissiveIntensity: 0.2, roughness: 0.35 });
  var warn2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 12, 9), warnMat2);
  warn2.position.set(GPX[1], GY + 0.383, WL); g.add(warn2);

  g.userData.anim = [
    function (t) {                                                                    /* 1) 红旗摆动（幅度克制） */
      flag.rotation.y = 0.16 * Math.sin(t * 2.1);
      flag.rotation.z = 0.05 * Math.sin(t * 2.8 + 0.6);
    },
    function (t) {                                                                    /* 2) 警示灯红蓝交替脉冲（≤0.25+基线） */
      var p = Math.sin(t * 3.2);
      warnMat.emissiveIntensity = 0.55 + 0.22 * Math.max(0, p);
      warnMat2.emissiveIntensity = 0.55 + 0.22 * Math.max(0, -p);
    }
  ];
  g.userData.specialId = 32;
  g.userData.parts = { flag: flag, warnMat: warnMat, warnMat2: warnMat2, emblem: emb, drawCalls: dc };
  return g;
};

})();
