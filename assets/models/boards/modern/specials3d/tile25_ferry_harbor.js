/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/specials3d/tile25_ferry_harbor.js  格 25「轮渡码头」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/special_25.png（2020s 单象限，写实航拍 3/4 视角现代轮渡码头）：
 *   石砌堤岸  ：花岗岩砌块堤岸平台（错缝砌块 + 勾缝 + 底部水线藻痕），台面浅色混凝土铺装
 *               + 前沿黄色安全线 + 系船柱 ×5 + 岸壁爬梯 + 钢管栏杆三段 + 灌木绿化带/小乔木
 *   候船楼    ：通高蓝绿玻璃幕墙（7 分格竖梃 + 三道横档 + 中央三樘门）+ 浅拱银白金属屋面
 *               （直立锁边细缝 + 白色檐口/脊帽 + 端部弧肋）+ 白柱列 + 轻薄入口雨棚
 *               +「轮渡码头」站名牌 + 左端玻璃指挥塔（加宽玻璃驾驶室 + 雷达桅杆 + 信标）
 *               + 右端低层附属楼（竖条窗 + 平顶女儿墙 + 空调机组）
 *   栈桥/浮码头：蓝灰钢桁架引桥（上下弦杆 + 交叉斜腹杆 + 扶手）下接混凝土浮码头
 *               （面板黄黑警示条 + 两长边黑轮胎护舷 ×10 + 白色栏杆 + 橙色救生圈 ×2
 *               + 系船柱 + 灯杆 + 黄角柱）
 *   渡轮      ：停靠右舷白色双甲板渡轮（青绿水平带 + 白身 + 深色双层窗带 + 前倾球鼻艏
 *               + 雷达桅/横杆 + 舷侧救生圈 ×2 + 艏部栏杆 + 尾平台 + 带缆）
 *   码头吊    ：右岸蓝色格构码头吊（塔柱 + 驾驶室 + 上仰吊臂 + 拉索 + 吊钩滑轮 + 配重）
 *
 * 注册：window.Special3DModern[25]() → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.7×2.7（实测 2.68×2.68，高 ≈1.49）；底面 y=0；正面 +z（候船楼/广场朝 +z，
 *       水域向 −z）；draw call ≤60；三角 ≤28k；Canvas 纹理 ≤256px；
 *       源码零 Math.random（mulberry32 种子流）；
 *       动画 2 项：渡轮随波轻晃 + 水面波光呼吸（≤2 项封顶，幅度克制）。
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils，对齐已验收范例
 *       tile5_station.js / tile15_hsr_station.js）——静态件全部合并为每材质 1 个 mesh
 *       （23 材质桶 + 渡轮组 7 桶 + 站名牌/候船厅内景 ≈ 32 draw call）；
 *       浅拱屋面用开口圆柱段（轴沿 x：rotateZ(π/2)+rotateX(π/2)，θ 限浅拱角域，
 *       UV 按弧长/长度烘焙）；渡轮球鼻艏用缩放球体；桁架/吊索用两点定位杆件（四元数对齐）；
 *       文件结构对齐 boards/modern/specials3d/tile15_hsr_station.js。
 *
 * 本轮 R1→R2 变更摘要（对照参考图差距清单逐条清偿）：
 *   ①幕墙玻璃提青绿、透明度 0.55→0.45，核心体前脸加深色内衬板，内景暖光缩窄居中（玻璃反射层次）
 *   ②前檐白柱 6→7 根改细柱贴幕墙 ③站名牌 0.44→0.56 加大、雨棚 1.30→1.42 ④指挥塔细高化
 *   （0.20²×0.778 + 斜撑 + 驾驶室深色窗带 + 桅杆升至 1.545）⑤码头吊紧凑化（臂 0.40 上仰 0.55rad
 *   + 双拉索）⑥渡轮窗带加深加宽、甲板室加高、桅杆加高、加舷侧走条/艉栏杆 ⑦引桥弦腹杆加粗
 *   专用蓝灰 'gang' 材质 + 落点过渡钢板 ⑧屋面矢高 0.16→0.135（更扁）⑨入口加两级宽台阶。
 * R2→R3（对照 r2 渲染再校）：
 *   ⑩幕墙竖梃 0.014→0.018（强分格立面）⑪屋面加天窗盒 ×2 + 风帽 ×2（随拱面切线斜置）
 *   ⑫堤岸四角加护角石 ⑬附属楼加门棚/壁灯 ⑭渡轮前甲板加绞车/舱口盖/尾空调箱、整船放大 1.06。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[boards/modern/specials3d/tile25_ferry_harbor] THREE 未定义，请先加载 three.min.js (r147)');
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
/* 水面：深青绿底 + 弧形涟漪高光 + 波影（同时用作 emissiveMap 呼吸） */
function texWater() {
  return cvTex('s25water', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#1d5f6b'; g.fillRect(0, 0, w, h);
    var i, pts = [[20, 26], [72, 18], [102, 58], [40, 74], [90, 102], [14, 108], [60, 50]];
    for (i = 0; i < pts.length; i++) {
      g.strokeStyle = 'rgba(150,214,214,0.34)'; g.lineWidth = 2;
      g.beginPath(); g.arc(pts[i][0], pts[i][1], 12 + (i % 3) * 6, PI * 1.05, PI * 1.85); g.stroke();
      g.strokeStyle = 'rgba(12,54,62,0.34)';
      g.beginPath(); g.arc(pts[i][0] + 3, pts[i][1] + 4, 13 + (i % 3) * 6, PI * 1.08, PI * 1.82); g.stroke();
    }
    speckle(g, w, h, rnd, 70, 'rgba(10,40,48,0.25)', 'rgba(170,224,222,0.16)', 5, 3);
  });
}
/* 花岗岩堤岸：错缝砌块 + 勾缝 + 受光/阴影边 + 底部水线污带与藻痕 */
function texStone() {
  return cvTex('s25stone', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#57503f'; g.fillRect(0, 0, w, h);
    var r, c, BH = 32, BW = 42;
    for (r = 0; r < 4; r++) {
      var off = (r % 2) * (BW / 2);
      for (c = -1; c < 4; c++) {
        var v = 0.88 + rnd() * 0.24, x = c * BW + off, y = r * BH;
        g.fillStyle = 'rgb(' + Math.round(146 * v) + ',' + Math.round(136 * v) + ',' + Math.round(120 * v) + ')';
        g.fillRect(x + 2, y + 2, BW - 4, BH - 4);
        g.fillStyle = 'rgba(238,232,216,0.28)'; g.fillRect(x + 2, y + 2, BW - 4, 2); g.fillRect(x + 2, y + 2, 2, BH - 4);
        g.fillStyle = 'rgba(52,46,36,0.32)'; g.fillRect(x + 2, y + BH - 5, BW - 4, 2); g.fillRect(x + BW - 5, y + 2, 2, BH - 4);
        if (rnd() < 0.22) { g.fillStyle = 'rgba(96,88,70,0.28)'; g.fillRect(x + 6 + ((rnd() * 20) | 0), y + 6 + ((rnd() * 14) | 0), 10 + ((rnd() * 12) | 0), 6 + ((rnd() * 8) | 0)); }
      }
    }
    speckle(g, w, h, rnd, 110, 'rgba(70,62,48,0.2)', 'rgba(214,206,188,0.16)', 6, 3);
    g.fillStyle = 'rgba(74,96,66,0.32)'; g.fillRect(0, h - 14, w, 14);
    g.fillStyle = 'rgba(30,28,22,0.4)'; g.fillRect(0, h - 5, w, 5);
  });
}
/* 台面铺装：浅暖灰大板 + 十字分缝 + 倒角受光/阴影边 + 色差斑 */
function texPave() {
  return cvTex('s25pave', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#b6b2a6'; g.fillRect(0, 0, w, h);
    var r, c, s = 32;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.92 + rnd() * 0.16, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(206 * v) + ',' + Math.round(202 * v) + ',' + Math.round(190 * v) + ')';
      g.fillRect(x + 2, y + 2, s - 4, s - 4);
      g.fillStyle = 'rgba(255,253,246,0.3)'; g.fillRect(x + 2, y + 2, s - 4, 2); g.fillRect(x + 2, y + 2, 2, s - 4);
      g.fillStyle = 'rgba(88,84,74,0.22)'; g.fillRect(x + 2, y + s - 4, s - 4, 2); g.fillRect(x + s - 4, y + 2, 2, s - 4);
    }
    speckle(g, w, h, rnd, 90, 'rgba(110,106,96,0.16)', 'rgba(242,240,232,0.18)', 8, 4);
  });
}
/* 浮码场面板：混凝土 + 纵向板缝 + 两长边黄黑警示条（u 沿 x 宽向） */
function texDeck() {
  return cvTex('s25deck', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#b2aea2'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(78,74,66,0.3)'; g.fillRect(i * 16, 0, 2, h); g.fillStyle = 'rgba(240,238,230,0.2)'; g.fillRect(i * 16 + 2, 0, 1, h); }
    speckle(g, w, h, rnd, 90, 'rgba(84,80,72,0.24)', 'rgba(232,230,222,0.2)', 6, 3);
    for (i = 0; i < w; i += 16) {                            /* 两侧黄黑斜纹警示带 */
      var x0 = i, x1 = i + 16;
      g.fillStyle = '#d8b73a'; g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h);
      g.fillStyle = '#26262a';
      g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 8, 0); g.lineTo(x0 - 2 + 8, h); g.lineTo(x0 - 2, h); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(w - x0, 0); g.lineTo(w - x0 - 8, 0); g.lineTo(w - x0 - 8 + 2, h); g.lineTo(w - x0 + 2, h); g.closePath(); g.fill();
    }
    g.fillStyle = 'rgba(20,20,24,0.4)'; g.fillRect(10, 0, 2, h); g.fillRect(w - 12, 0, 2, h);
  });
}
/* 金属屋面：银白直立锁边板（细缝双线 + 板面亮色差 + 淡横向咬口） */
function texVault() {
  return cvTex('s25vault', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#ced4da'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 16; i++) {
      var x = i * 16, v = 0.96 + rnd() * 0.1;
      g.fillStyle = 'rgb(' + Math.round(216 * v) + ',' + Math.round(222 * v) + ',' + Math.round(228 * v) + ')';
      g.fillRect(x + 2, 0, 14, h);
      g.fillStyle = 'rgba(250,252,255,0.65)'; g.fillRect(x + 4, 0, 2, h);
      g.fillStyle = 'rgba(132,142,152,0.32)'; g.fillRect(x, 0, 1, h);
      g.fillStyle = 'rgba(164,174,184,0.25)'; g.fillRect(x + 15, 0, 1, h);
    }
    g.fillStyle = 'rgba(140,150,160,0.12)';
    for (i = 0; i < 8; i++) g.fillRect(0, i * 32 + 30, w, 2);
    speckle(g, w, h, rnd, 60, 'rgba(140,150,160,0.12)', 'rgba(252,253,255,0.24)', 6, 3);
  });
}
/* 幕墙玻璃：明亮青绿天空反射竖向渐变 + 细竖梃 + 淡横档 + 斜高光带 */
function texGlass() {
  return cvTex('s25glass', 128, 128, function (g, w, h) {
    var x;
    for (x = 0; x < w; x++) {
      var t = x / w, v = 0.84 + 0.18 * Math.sin(t * 6.283 * 1.4 + 0.5) + 0.04 * Math.sin(t * 36);
      g.fillStyle = 'rgb(' + Math.round(116 * v) + ',' + Math.round(168 * v) + ',' + Math.round(172 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    g.fillStyle = 'rgba(36,58,62,0.2)';
    for (var y = 0; y < h; y += 26) g.fillRect(0, y, w, 2);
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(16, 0, 8, h); g.fillRect(80, 0, 3, h);
    g.strokeStyle = 'rgba(230,240,240,0.55)'; g.lineWidth = 2;
    for (x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  });
}
/* 浅色混凝土/铝板墙：板缝 + 色斑 + 竖向雨水痕 + 根部污带 */
function texConc() {
  return cvTex('s25conc', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#d6d3ca'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 110, 'rgba(150,148,140,0.2)', 'rgba(246,244,238,0.24)', 4, 3);
    g.fillStyle = 'rgba(96,96,92,0.2)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(140,140,134,0.15)'; g.fillRect((rnd() * w) | 0, 0, 2 + ((rnd() * 3) | 0), 30 + ((rnd() * 60) | 0)); }
    g.fillStyle = 'rgba(100,98,92,0.16)'; g.fillRect(0, h - 12, w, 12);
  });
}
/* 附属楼竖条窗带：白墙 + 窄竖向玻璃条 + 窗台影 + 横向层间梁 */
function texWin() {
  return cvTex('s25win', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#e8e6de'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 50, 'rgba(176,174,164,0.2)', 'rgba(250,248,242,0.2)', 8, 5);
    var i;
    for (i = 0; i < 4; i++) {
      var x = i * 32;
      g.fillStyle = '#46626a'; g.fillRect(x + 11, 8, 11, 106);
      g.fillStyle = 'rgba(205,230,232,0.6)'; g.fillRect(x + 12, 10, 3, 102);
      g.fillStyle = 'rgba(26,44,50,0.55)'; g.fillRect(x + 19, 8, 3, 106);
      g.fillStyle = 'rgba(244,242,234,0.95)'; g.fillRect(x + 9, 114, 15, 3);
      g.fillStyle = 'rgba(70,70,66,0.3)'; g.fillRect(x + 9, 117, 15, 2);
    }
    g.fillStyle = 'rgba(100,102,100,0.25)';
    for (i = 0; i < 3; i++) g.fillRect(0, 8 + i * 38, w, 2);
  });
}
/* 树冠叶斑（三层明暗叶簇） */
function texLeaf() {
  return cvTex('s25leaf', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#7f9c5e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) {
      var v = rnd();
      g.fillStyle = v < 0.5 ? 'rgba(46,78,34,0.42)' : v < 0.8 ? 'rgba(150,186,100,0.5)' : 'rgba(200,216,140,0.35)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 4 + ((rnd() * 12) | 0), 3 + ((rnd() * 8) | 0));
    }
  });
}
/* 候船厅内景（map + emissiveMap）：暖光地面/立柱/旅客/吊顶灯带 */
function texHall() {
  return cvTex('s25hall', 256, 128, function (g, w, h, rnd) {
    g.fillStyle = '#f7dfae'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(214,166,96,0.5)'; g.fillRect(0, 86, w, 42);
    var i;
    for (i = 0; i < 7; i++) {
      var x = 14 + i * 36 + ((rnd() * 6) | 0);
      g.fillStyle = 'rgba(130,100,58,0.5)'; g.fillRect(x, 14, 7, 76);
      g.fillStyle = 'rgba(255,244,208,0.55)'; g.fillRect(x + 1, 14, 2, 76);
    }
    for (i = 0; i < 22; i++) {
      g.fillStyle = i % 3 ? 'rgba(96,64,32,0.5)' : 'rgba(54,86,118,0.45)';
      g.fillRect(8 + ((rnd() * (w - 20)) | 0), 90 + ((rnd() * 26) | 0), 4 + ((rnd() * 4) | 0), 6 + ((rnd() * 5) | 0));
    }
    g.fillStyle = 'rgba(255,250,232,0.95)';
    for (i = 0; i < 8; i++) g.fillRect(10 + i * 31, 4, 18, 4);
    g.fillStyle = 'rgba(255,218,156,0.55)'; g.fillRect(0, 0, w, 10);
  });
}

/* ================= 2. 材质（静态件模块级单例；发光/水面每实例新建） ================= */
function M(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0)
  });
  if (o.map) m.map = o.map;
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.emissiveMap) m.emissiveMap = o.emissiveMap;
  if (o.tr !== undefined) { m.transparent = true; m.opacity = o.tr; }
  if (o.ds) m.side = THREE.DoubleSide;
  return m;
}
var MATS = null;
function mats() {
  if (MATS) return MATS;
  MATS = {
    water:   M('#ffffff', { map: texWater(), emissive: '#9fe8e0', emissiveMap: texWater(), ei: 0.12, rough: 0.24, metal: 0.05 }),
    quay:    M('#ffffff', { map: texStone(), rough: 0.92 }),
    pave:    M('#ffffff', { map: texPave(), rough: 0.95 }),
    deck:    M('#ffffff', { map: texDeck(), rough: 0.9 }),
    vault:   M('#ffffff', { map: texVault(), rough: 0.48, metal: 0.28, ds: true }),
    glass:   M('#ffffff', { map: texGlass(), rough: 0.08, metal: 0.6, tr: 0.45 }),
    gang:    M('#5b7186', { rough: 0.5, metal: 0.55 }),
    conc:    M('#ffffff', { map: texConc(), rough: 0.9, ds: true }),
    winWall: M('#ffffff', { map: texWin(), rough: 0.8, ds: true }),
    white:   M('#ecebe4', { rough: 0.6 }),
    twhite:  M('#f3f5f6', { rough: 0.3, metal: 0.1 }),
    teal:    M('#1e6b62', { rough: 0.5 }),
    steel:   M('#7e8890', { rough: 0.45, metal: 0.7 }),
    dark:    M('#282d31', { rough: 0.6, metal: 0.2 }),
    rail:    M('#b5bdc3', { rough: 0.3, metal: 0.85 }),
    tire:    M('#242424', { rough: 0.95 }),
    orange:  M('#dd5f24', { rough: 0.55 }),
    yellow:  M('#d9b93a', { rough: 0.5, metal: 0.1 }),
    cblue:   M('#2e5f9c', { rough: 0.45, metal: 0.35 }),
    green:   M('#ffffff', { map: texLeaf(), rough: 0.95 }),
    green2:  M('#a9b894', { map: texLeaf(), rough: 0.95 }),
    hedge:   M('#5d7a3f', { rough: 1 }),
    trunk:   M('#8c7050', { rough: 0.9 }),
    beacon:  M('#c23330', { rough: 0.4, emissive: '#ff4438', ei: 0.7 })
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
var SC = { pave: 0.8, conc: 1.3, win: 1.6, vault: 1.0, glass: 1.2, deck: 3.0, quay: 3.7 };
Bag.prototype.box = function (key, w, h, d, x, y, z, rx, ry, rz, sc) {
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, sc !== undefined ? sc : SC.conc);
  this.put(key, g, m4(x, y, z, rx, ry, rz));
};
Bag.prototype.cyl = function (key, rt, rb, h, x, y, z, rx, ry, rz, seg) {
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 12), m4(x, y, z, rx, ry, rz));
};
Bag.prototype.sph = function (key, r, x, y, z, sx, sy, sz) {
  var g = new THREE.SphereGeometry(r, 16, 12);
  if (sx !== undefined) g.scale(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz);
  this.put(key, g, m4(x, y, z));
};
Bag.prototype.torus = function (key, r, tube, x, y, z, rx, ry, rz, seg, arc) {
  this.put(key, new THREE.TorusGeometry(r, tube, 6, seg || 24, arc !== undefined ? arc : PI * 2), m4(x, y, z, rx, ry, rz));
};
/* 两点定位杆件（桁架腹杆/拉索/吊缆/缆绳）：截面 th 的方杆 */
Bag.prototype.bar = function (key, th, x0, y0, z0, x1, y1, z1) {
  var dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0), L = dir.length(); dir.normalize();
  var g = new THREE.BoxGeometry(th, th, L);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir));
  this.put(key, g, m4((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
};
/* 浅拱屋面：开口圆柱段（θ 限顶拱角域），轴沿 x（rotateZ+rotateX）；UV 按弧长/长度烘焙 */
function vaultGeoX(R, len, PHI, sc) {
  var g = new THREE.CylinderGeometry(R, R, len, 30, 1, true, PI - PHI, PHI * 2);
  g.rotateZ(PI / 2); g.rotateX(PI / 2);
  var uv = g.attributes.uv, arc = R * PHI * 2, i;
  for (i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * arc * sc, uv.getY(i) * len * sc);
  return g;
}
Bag.prototype.vaultX = function (key, R, len, PHI, x, y, z, sc) {
  this.put(key, vaultGeoX(R, len, PHI, sc !== undefined ? sc : SC.vault), m4(x, y, z));
};
/* 端部弧肋：圆环弧（rotateZ 后 rotateY 转到 y-z 平面，轴沿 x） */
function archRibGeo(R, tube, PHI) {
  var g = new THREE.TorusGeometry(R, tube, 6, 30, PHI * 2);
  g.rotateZ(PI / 2 - PHI); g.rotateY(PI / 2);
  return g;
}
Bag.prototype.archRib = function (key, R, tube, PHI, x, y, z) {
  this.put(key, archRibGeo(R, tube, PHI), m4(x, y, z));
};

/* ================= 4. 站名牌（Canvas 纹理，独立小 mesh） ================= */
function signMesh(text, w, h) {
  var cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  var g = cv.getContext('2d');
  g.fillStyle = '#16324e'; g.fillRect(0, 0, 256, 64);
  for (var si = 0; si < 20; si++) { g.fillStyle = si % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.16)'; g.fillRect((si * 41) % 256, (si * 29) % 64, 3 + (si % 4), 2); }
  g.strokeStyle = '#c8d2da'; g.lineWidth = 5; g.strokeRect(4, 4, 248, 56);
  g.fillStyle = '#f2f6f8'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 38px "Microsoft YaHei","PingFang SC",sans-serif';
  g.fillText(text, 128, 34);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  var m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.1, emissive: C('#8aa8bd'), emissiveIntensity: 0.25 });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.castShadow = true;
  return mesh;
}

/* ================= 5. 预制构件 ================= */
/* 灌木（双层球冠） */
function shrub(bag, x, y, z, s) {
  bag.sph('hedge', s, x, y + s * 0.7, z);
  bag.sph('green2', s * 0.62, x + s * 0.42, y + s * 0.5, z + s * 0.2);
}
/* 小乔木（干 + 双球冠） */
function tree(bag, x, y, z, s) {
  bag.cyl('trunk', 0.02 * s, 0.028 * s, 0.26 * s, x, y + 0.13 * s, z, 0, 0, 0, 12);
  bag.sph('green', 0.15 * s, x, y + 0.32 * s, z);
  bag.sph('green2', 0.105 * s, x + 0.07 * s, y + 0.24 * s, z + 0.04 * s);
}
/* 系船柱（柱身 + 顶帽） */
function bollard(bag, x, y, z, s) {
  s = s || 1;
  bag.cyl('dark', 0.016 * s, 0.02 * s, 0.055 * s, x, y + 0.0275 * s, z, 0, 0, 0, 12);
  bag.cyl('dark', 0.023 * s, 0.02 * s, 0.012 * s, x, y + 0.061 * s, z, 0, 0, 0, 12);
}
/* 轮胎护舷（竖挂环面，法线朝 x） */
function tireFender(bag, x, y, z) {
  bag.torus('tire', 0.042, 0.016, x, y, z, 0, PI / 2, 0, 20);
}
/* 救生圈（竖挂环面 + 4 段白色反光带并入 dark 由贴色差体现，省面只加环） */
function lifeBuoy(bag, x, y, z, ry) {
  bag.torus('orange', 0.03, 0.01, x, y, z, 0, ry === undefined ? PI / 2 : ry, 0, 20);
  bag.torus('white', 0.03, 0.012, x, y, z, 0, ry === undefined ? PI / 2 : ry, 0, 20, 0.5);
}
/* 空调机组（机壳 + 风扇盘） */
function acUnit(bag, x, y, z) {
  bag.box('steel', 0.09, 0.05, 0.05, x, y, z);
  bag.cyl('dark', 0.017, 0.017, 0.012, x + 0.028, y, z, 0, PI / 2, 0, 12);
  bag.box('dark', 0.012, 0.03, 0.04, x - 0.05, y - 0.02, z);
}
/* 庭院灯（钢杆 + 悬挑 + 灯头；dir=灯臂朝向） */
function lampPost(bag, x, y, z, dir) {
  bag.cyl('steel', 0.008, 0.011, 0.34, x, y + 0.17, z, 0, 0, 0, 12);
  bag.box('steel', 0.1 * dir, 0.014, 0.014, x + 0.05 * dir, y + 0.335, z);
  bag.box('white', 0.045, 0.018, 0.03, x + 0.095 * dir, y + 0.322, z);
}

/* ================= 6. 工厂 ================= */
window.Special3DModern[25] = function () {
  var g = new THREE.Group();
  g.name = 'special25m_ferry_harbor';
  var bag = new Bag();          /* 岸上静态件 */
  var bagF = new Bag();         /* 渡轮（独立组，随波动画） */
  var i, sx, k;

  var DECK = 0.302;             /* 堤岸台面标高 */

  /* —— 候船楼几何常量：浅拱 R/矢高/轴心/檐口（轴沿 x） —— */
  var BX = -0.10;                       /* 楼轴线 x */
  var R = 0.99343, RISE = 0.135;        /* 拱半径 / 矢高（半跨 0.50，矢跨比 0.135/0.50 扁弧） */
  var YE = 0.82;                        /* 檐口高（幕墙顶） */
  var YC = YE - (R - RISE);             /* 拱心 y ≈ -0.0384 */
  var PHI = Math.acos((R - RISE) / R);  /* 半弧角 ≈0.5264rad */
  var AZ = 0.76, ALEN = 1.80;           /* 屋面轴心 z / 长度（x −1.00..0.80） */
  var TOP = YC + R;                     /* 屋面顶 ≈0.98 */

  /* ========== 6.1 水面 + 石砌堤岸平台 ========== */
  bag.box('water', 2.68, 0.045, 2.68, 0, 0.0225, 0, 0, 0, 0, 1.0);
  bag.box('quay', 2.60, 0.27, 1.52, 0, 0.155, 0.54, 0, 0, 0, SC.quay);       /* 堤岸 z −0.22..1.30 */
  bag.box('pave', 2.60, 0.012, 1.52, 0, 0.296, 0.54, 0, 0, 0, SC.pave);      /* 台面 */
  var qcx = [-1.275, 1.275], qcz = [-0.205, 1.285];                          /* 转角护角石 ×4 */
  for (i = 0; i < 2; i++) for (k = 0; k < 2; k++) {
    bag.box('conc', 0.06, 0.28, 0.06, qcx[i], 0.15, qcz[k], 0, 0, 0, SC.quay);
  }
  bag.box('yellow', 2.56, 0.004, 0.028, 0, DECK + 0.002, 1.262);             /* 前沿黄色安全线 */
  bag.box('conc', 0.34, 0.004, 1.42, BX, DECK + 0.002, 0.47, 0, 0, 0, SC.pave); /* 入口轴线步道 */

  /* ========== 6.2 候船楼：台基/勒脚 + 核心体 + 通高幕墙 + 浅拱屋面 ========== */
  bag.box('dark', 1.66, 0.03, 0.90, BX, 0.317, 0.755);                       /* 勒脚 */
  bag.box('conc', 1.60, 0.49, 0.79, BX, 0.575, 0.75, 0, 0, 0, SC.conc);      /* 核心体 y0.33..0.82, z0.355..1.145 */
  bag.box('dark', 1.58, 0.47, 0.012, BX, 0.575, 1.155);                      /* 幕墙深色内衬（玻璃反射基底） */
  /* 通高玻璃幕墙（前 +z）：7 大分格 + 钢竖梃 ×8 / 横档 ×3，中央三樘玻璃门 */
  var bayW = 0.2286, x0 = BX - 0.80;
  for (i = 0; i < 7; i++) {
    var xc2 = x0 + bayW / 2 + i * bayW;
    bag.box('glass', bayW - 0.017, 0.49, 0.02, xc2, 0.575, 1.178, 0, 0, 0, SC.glass);
    if (i >= 2 && i <= 4) bag.box('dark', 0.19, 0.398, 0.008, xc2, 0.501, 1.174);  /* 入口门扇 */
  }
  for (i = 0; i <= 7; i++) bag.box('steel', 0.018, 0.50, 0.018, x0 + i * bayW, 0.58, 1.18);
  var ty = [0.44, 0.58, 0.72];
  for (i = 0; i < 3; i++) bag.box('steel', 1.62, 0.012, 0.018, BX, ty[i], 1.18);
  bag.box('white', 0.62, 0.05, 0.02, BX, 0.775, 1.182);                      /* 门头横楣 */
  /* 两侧山墙玻璃 + 竖梃 ×2 / 侧 + 背墙横窗带 */
  for (sx = -1; sx <= 1; sx += 2) {
    var gxs = sx < 0 ? -0.905 : 0.705;
    bag.box('glass', 0.02, 0.49, 0.80, gxs, 0.575, 0.755, 0, 0, 0, SC.glass);
    for (i = 0; i < 2; i++) bag.box('steel', 0.014, 0.49, 0.014, gxs + sx * 0.011, 0.575, 0.50 + i * 0.28);
  }
  bag.box('winWall', 1.56, 0.30, 0.012, BX, 0.575, 0.349, 0, 0, 0, SC.win);
  /* 浅拱银白金属屋面（轴沿 x）+ 檐口白边 + 脊帽 + 端部弧肋 */
  bag.vaultX('vault', R, ALEN, PHI, BX, YC, AZ);
  bag.box('white', 0.022, 0.02, ALEN, BX - 0.50 * 0.9986, YE + 0.005, AZ - 0.4986);
  bag.box('white', 0.022, 0.02, ALEN, BX + 0.50 * 0.9986, YE + 0.005, AZ - 0.4986);
  bag.box('white', ALEN, 0.018, 0.04, BX, TOP + 0.006, AZ);                  /* 脊帽 */
  bag.archRib('white', R + 0.004, 0.012, PHI, BX - 0.895, YC, AZ);
  bag.archRib('white', R + 0.004, 0.012, PHI, BX + 0.895, YC, AZ);
  /* 屋面设备：天窗盒 ×2 + 风帽 ×2（随拱面切线斜置） */
  var skz = [-0.15, 0.15], skx2 = [-0.45, 0.25];
  for (i = 0; i < 2; i++) {
    var s1 = YC + Math.sqrt(R * R - skz[i] * skz[i]), tl1 = Math.asin(skz[i] / R);
    bag.box('glass', 0.10, 0.024, 0.50, BX + skx2[i], s1 + 0.010, AZ + skz[i], tl1, 0, 0, SC.glass);
    bag.box('white', 0.11, 0.014, 0.52, BX + skx2[i], s1 + 0.026, AZ + skz[i], tl1, 0, 0);
  }
  for (i = 0; i < 2; i++) {
    var s2 = YC + Math.sqrt(R * R - 0.30 * 0.30), tl2 = Math.asin(0.30 / R);
    bag.cyl('steel', 0.03, 0.032, 0.022, BX + (i ? 0.52 : -0.20), s2 + 0.012, AZ + 0.30, tl2, 0, 0, 12);
    bag.cyl('white', 0.02, 0.02, 0.014, BX + (i ? 0.52 : -0.20), s2 + 0.030, AZ + 0.30, tl2, 0, 0, 12);
  }
  /* 前檐白柱列 ×7（细柱贴幕墙承檐出挑） */
  for (i = 0; i < 7; i++) bag.cyl('white', 0.009, 0.009, 0.50, -0.70 + i * 0.20, DECK + 0.25, 1.192, 0, 0, 0, 12);
  /* 入口台阶 ×2 + 雨棚（轻薄白板 + 白檐口 + 钢柱列 ×4）+ 站名牌 */
  bag.box('conc', 1.20, 0.02, 0.08, BX, DECK + 0.01, 1.16, 0, 0, 0, SC.pave);
  bag.box('conc', 1.20, 0.01, 0.05, BX, DECK + 0.005, 1.225, 0, 0, 0, SC.pave);
  bag.box('white', 1.42, 0.018, 0.14, BX, 0.70, 1.24);
  bag.box('white', 1.42, 0.05, 0.012, BX, 0.67, 1.305);
  bag.box('steel', 1.42, 0.01, 0.012, BX, 0.642, 1.305);
  for (i = 0; i < 4; i++) bag.cyl('white', 0.011, 0.011, 0.398, -0.615 + i * 0.41, DECK + 0.199, 1.27, 0, 0, 0, 12);
  var sign = signMesh('轮渡码头', 0.56, 0.08);
  sign.position.set(BX, 0.67, 1.316); g.add(sign);

  /* ========== 6.3 左端玻璃指挥塔（细高塔身 + 加宽驾驶室窗带 + 雷达桅杆 + 信标） ========== */
  var TWX = -0.74, TWZ = 0.52;
  bag.box('glass', 0.20, 0.778, 0.20, TWX, DECK + 0.389, TWZ, 0, 0, 0, SC.glass);
  var tq = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
  for (i = 0; i < 4; i++) bag.box('steel', 0.012, 0.778, 0.012, TWX + tq[i][0] * 0.10, DECK + 0.389, TWZ + tq[i][1] * 0.10);
  bag.bar('steel', 0.008, TWX - 0.10, DECK + 0.10, TWZ - 0.10, TWX + 0.10, DECK + 0.55, TWZ + 0.10);
  bag.bar('steel', 0.008, TWX + 0.10, DECK + 0.10, TWZ + 0.10, TWX - 0.10, DECK + 0.55, TWZ - 0.10);
  bag.box('glass', 0.26, 0.13, 0.26, TWX, 1.145, TWZ, 0, 0, 0, SC.glass);
  bag.box('dark', 0.264, 0.045, 0.264, TWX, 1.16, TWZ);                      /* 驾驶室深色窗带 */
  bag.box('white', 0.30, 0.016, 0.30, TWX, 1.218, TWZ);
  bag.box('steel', 0.32, 0.008, 0.32, TWX, 1.229, TWZ);
  bag.cyl('steel', 0.005, 0.005, 0.30, TWX, 1.378, TWZ, 0, 0, 0, 12);
  bag.bar('steel', 0.008, TWX - 0.05, 1.46, TWZ, TWX + 0.05, 1.46, TWZ);
  bag.bar('steel', 0.008, TWX, 1.42, TWZ - 0.05, TWX, 1.42, TWZ + 0.05);
  bag.sph('beacon', 0.012, TWX, 1.545, TWZ);

  /* ========== 6.4 右端低层附属楼（竖条窗 + 平顶女儿墙 + 屋顶设备） ========== */
  bag.box('conc', 0.34, 0.30, 0.60, 0.89, DECK + 0.15, 0.60, 0, 0, 0, SC.conc);
  bag.box('winWall', 0.30, 0.18, 0.012, 0.89, DECK + 0.15, 0.906, 0, 0, 0, SC.win);
  bag.box('dark', 0.012, 0.16, 0.09, 0.714, DECK + 0.08, 0.60);
  bag.box('vault', 0.38, 0.016, 0.64, 0.89, DECK + 0.308, 0.60, 0, 0, 0, SC.vault);
  bag.box('conc', 0.38, 0.026, 0.014, 0.89, DECK + 0.322, 0.913);
  bag.box('conc', 0.38, 0.026, 0.014, 0.89, DECK + 0.322, 0.287);
  bag.box('conc', 0.014, 0.026, 0.64, 0.713, DECK + 0.322, 0.60);
  bag.box('conc', 0.014, 0.026, 0.64, 1.067, DECK + 0.322, 0.60);
  acUnit(bag, 0.80, DECK + 0.34, 0.46);
  bag.box('white', 0.12, 0.008, 0.16, 0.655, DECK + 0.24, 0.60);             /* 附属楼门棚 */
  bag.bar('steel', 0.006, 0.72, DECK + 0.24, 0.53, 0.60, DECK + 0.24, 0.53);
  bag.bar('steel', 0.006, 0.72, DECK + 0.24, 0.67, 0.60, DECK + 0.24, 0.67);
  bag.box('dark', 0.012, 0.05, 0.05, 0.712, DECK + 0.28, 0.52);              /* 门旁壁灯 */

  /* ========== 6.5 堤岸细节：栏杆 + 系船柱 + 爬梯 + 灯具 + 绿化 ========== */
  /* 钢管栏杆（前沿两段 + 两侧 + 后沿两段；立柱 h0.095 + 双横杆） */
  function railRun(xa, za, xb, zb, n) {
    var j;
    for (j = 0; j <= n; j++) {
      var t = j / n, px = xa + (xb - xa) * t, pz = za + (zb - za) * t;
      bag.cyl('rail', 0.006, 0.006, 0.095, px, DECK + 0.0475, pz, 0, 0, 0, 12);
    }
    var L = Math.sqrt((xb - xa) * (xb - xa) + (zb - za) * (zb - za));
    var ry = -Math.atan2(zb - za, xb - xa);
    bag.box('rail', L, 0.012, 0.012, (xa + xb) / 2, DECK + 0.09, (za + zb) / 2, 0, ry, 0);
    bag.box('rail', L, 0.010, 0.010, (xa + xb) / 2, DECK + 0.052, (za + zb) / 2, 0, ry, 0);
  }
  railRun(-1.26, 1.285, -0.78, 1.285, 2);
  railRun(0.58, 1.285, 1.26, 1.285, 2);
  railRun(-1.285, -0.16, -1.285, 1.28, 4);
  railRun(1.285, 0.28, 1.285, 1.28, 3);
  railRun(-1.28, -0.205, -0.55, -0.205, 2);
  railRun(0.55, -0.205, 1.28, -0.205, 2);
  /* 前沿系船柱 ×5 + 后沿 ×2 */
  bollard(bag, -1.15, DECK, 1.24); bollard(bag, -0.88, DECK, 1.24);
  bollard(bag, 0.70, DECK, 1.24); bollard(bag, 0.98, DECK, 1.24); bollard(bag, 1.22, DECK, 1.24);
  bollard(bag, -0.75, DECK, -0.16); bollard(bag, 0.75, DECK, -0.16);
  /* 岸壁爬梯（双轨 + 5 踏步） */
  bag.box('steel', 0.016, 0.26, 0.014, -0.50, 0.17, 1.307);
  bag.box('steel', 0.016, 0.26, 0.014, -0.34, 0.17, 1.307);
  for (i = 0; i < 5; i++) bag.box('steel', 0.16, 0.012, 0.012, -0.42, 0.07 + i * 0.05, 1.308);
  /* 堤岸灯 ×2 */
  lampPost(bag, -1.18, DECK, 0.95, 1);
  lampPost(bag, 1.22, DECK, 0.28, -1);
  /* 绿化：左右绿化带 + 后沿灌木 + 小乔木 ×2 */
  bag.box('hedge', 0.09, 0.018, 0.62, -1.13, DECK + 0.009, 0.50);
  bag.box('white', 0.11, 0.012, 0.014, -1.13, DECK + 0.012, 0.20);
  bag.box('white', 0.11, 0.012, 0.014, -1.13, DECK + 0.012, 0.81);
  shrub(bag, -1.13, DECK, 0.34, 0.045); shrub(bag, -1.13, DECK, 0.52, 0.038); shrub(bag, -1.13, DECK, 0.70, 0.042);
  bag.box('hedge', 0.09, 0.018, 0.42, 1.14, DECK + 0.009, 0.62);
  shrub(bag, 1.14, DECK, 0.50, 0.04); shrub(bag, 1.14, DECK, 0.72, 0.036);
  shrub(bag, -0.72, DECK, 0.02, 0.042); shrub(bag, -0.25, DECK, 0.0, 0.036); shrub(bag, 0.55, DECK, 0.03, 0.04);
  tree(bag, -1.10, DECK, 1.08, 0.6);
  tree(bag, 1.17, DECK, 0.90, 0.55);

  /* ========== 6.6 蓝色码头吊（塔柱 + 驾驶室 + 上仰吊臂 + 拉索 + 吊钩 + 配重） ========== */
  var CRX = 1.04, CRZ = 0.00;
  bag.box('dark', 0.18, 0.02, 0.18, CRX, DECK + 0.01, CRZ);
  bag.box('cblue', 0.055, 0.62, 0.055, CRX, DECK + 0.33, CRZ);
  for (i = 0; i < 4; i++) bag.box('cblue', 0.014, 0.62, 0.014, CRX + tq[i][0] * 0.038, DECK + 0.33, CRZ + tq[i][1] * 0.038);
  for (i = 0; i < 2; i++) {
    bag.box('cblue', 0.09, 0.012, 0.012, CRX, DECK + 0.23 + i * 0.2, CRZ);
    bag.box('cblue', 0.012, 0.012, 0.09, CRX, DECK + 0.23 + i * 0.2, CRZ);
  }
  bag.bar('cblue', 0.01, CRX - 0.038, DECK + 0.13, CRZ - 0.038, CRX + 0.038, DECK + 0.33, CRZ + 0.038);
  bag.bar('cblue', 0.01, CRX + 0.038, DECK + 0.13, CRZ + 0.038, CRX - 0.038, DECK + 0.53, CRZ - 0.038);
  bag.box('cblue', 0.10, 0.08, 0.10, CRX, DECK + 0.68, CRZ);                 /* 驾驶室 */
  bag.box('dark', 0.104, 0.035, 0.104, CRX, DECK + 0.70, CRZ);
  bag.cyl('cblue', 0.02, 0.02, 0.09, CRX, DECK + 0.76, CRZ, 0, 0, 0, 12);    /* 塔头 */
  bag.box('cblue', 0.035, 0.03, 0.40, CRX, 1.06, -0.19, 0.55, 0, 0);         /* 上仰吊臂 */
  bag.bar('dark', 0.006, CRX, 1.135, CRZ, CRX, 1.115, -0.14);                /* 双拉索 */
  bag.bar('dark', 0.006, CRX, 1.135, CRZ, CRX, 1.16, -0.32);
  bag.bar('dark', 0.006, CRX, 1.165, -0.361, CRX, 0.97, -0.361);             /* 吊缆 */
  bag.torus('dark', 0.014, 0.005, CRX, 0.955, -0.361, PI / 2, 0, 0, 16);     /* 吊钩滑轮 */
  bag.box('dark', 0.04, 0.03, 0.05, CRX, 0.935, -0.361);
  bag.box('cblue', 0.03, 0.02, 0.16, CRX, 1.03, 0.10, -0.15, 0, 0);          /* 配重臂 */
  bag.box('dark', 0.05, 0.06, 0.05, CRX, 1.00, 0.175);

  /* ========== 6.7 钢桁架引桥（堤岸 → 浮码头） ========== */
  var PHIR = Math.atan2(0.16, 0.32), LR = Math.sqrt(0.32 * 0.32 + 0.16 * 0.16) + 0.02;
  var CMY = 0.22, CMZ = -0.38;
  var nx = 0, ny = Math.cos(PHIR), nz = Math.sin(PHIR);                      /* 桥面法向（局部 +y） */
  var dxu = 0, dyu = -Math.sin(PHIR), dzu = -Math.cos(PHIR);                 /* 沿坡向下 */
  bag.box('gang', 0.24, 0.016, LR, 0, CMY, CMZ, -PHIR, 0, 0);
  for (sx = -1; sx <= 1; sx += 2) {
    bag.box('gang', 0.016, 0.016, LR, sx * 0.10, CMY + ny * 0.038, CMZ + nz * 0.038, -PHIR, 0, 0);
    bag.box('gang', 0.016, 0.016, LR, sx * 0.10, CMY - ny * 0.034, CMZ - nz * 0.034, -PHIR, 0, 0);
    bag.box('rail', 0.008, 0.008, LR, sx * 0.105, CMY + ny * 0.066, CMZ + nz * 0.066, -PHIR, 0, 0);
    for (i = 0; i < 4; i++) {                                                /* 交叉斜腹杆 */
      var t0 = -0.135 + i * 0.09;
      var b0x = sx * 0.10, b0y = CMY - ny * 0.034 + dyu * t0, b0z = CMZ - nz * 0.034 + dzu * t0;
      var t1 = t0 + 0.09;
      var up = (i % 2 === 0);
      var e0y = up ? b0y : CMY + ny * 0.038 + dyu * t0, e0z = up ? b0z : CMZ + nz * 0.038 + dzu * t0;
      var e1y = up ? CMY + ny * 0.038 + dyu * t1 : CMY - ny * 0.034 + dyu * t1;
      var e1z = up ? CMZ + nz * 0.038 + dzu * t1 : CMZ - nz * 0.034 + dzu * t1;
      bag.bar('gang', 0.012, b0x, e0y, e0z, b0x, e1y, e1z);
    }
  }
  bag.box('steel', 0.24, 0.01, 0.10, 0, 0.135, -0.565);                      /* 落点过渡钢板 */

  /* ========== 6.8 浮码头（混凝土浮箱 + 警示面板 + 轮胎护舷 + 栏杆 + 附属） ========== */
  bag.box('conc', 0.84, 0.09, 0.76, 0, 0.065, -0.92, 0, 0, 0, SC.conc);      /* 浮箱 z −0.54..−1.30 */
  bag.box('deck', 0.88, 0.02, 0.80, 0, 0.12, -0.92, 0, 0, 0, SC.deck);       /* 面板 top0.13 */
  var PON = 0.13;
  for (sx = -1; sx <= 1; sx += 2) {
    for (i = 0; i < 5; i++) tireFender(bag, sx * 0.435, 0.075, -0.62 - i * 0.15);
    for (i = 0; i < 5; i++) bag.cyl('rail', 0.005, 0.005, 0.075, sx * 0.415, PON + 0.0375, -0.60 - i * 0.16, 0, 0, 0, 12);
    bag.box('rail', 0.012, 0.012, 0.68, sx * 0.415, PON + 0.068, -0.92);
    bag.box('rail', 0.010, 0.010, 0.68, sx * 0.415, PON + 0.036, -0.92);
  }
  for (i = 0; i < 4; i++) {                                                  /* 黄角柱 ×4 */
    bag.cyl('yellow', 0.008, 0.008, 0.09, (i % 2 ? 0.40 : -0.40), PON + 0.045, (i < 2 ? -0.56 : -1.28), 0, 0, 0, 12);
  }
  lifeBuoy(bag, 0.415, PON + 0.055, -0.70);
  lifeBuoy(bag, -0.415, PON + 0.055, -1.10);
  bollard(bag, 0.25, PON, -1.18); bollard(bag, -0.25, PON, -1.18);
  bag.cyl('steel', 0.008, 0.011, 0.30, 0, PON + 0.15, -1.26, 0, 0, 0, 12);   /* 码头灯杆 */
  bag.box('steel', 0.09, 0.014, 0.014, 0.045, PON + 0.295, -1.26);
  bag.box('white', 0.045, 0.018, 0.03, 0.09, PON + 0.282, -1.26);

  /* ========== 6.9 白色渡轮（独立组：随波轻晃；球鼻艏 + 双甲板 + 雷达桅） ========== */
  var ferry = new THREE.Group();
  ferry.name = 'ferry';
  ferry.position.set(0.63, 0, -0.86);
  ferry.scale.set(1.06, 1.06, 1.06);
  g.add(ferry);
  /* 船体 */
  bagF.box('twhite', 0.30, 0.105, 0.74, 0, 0.095, 0, 0, 0, 0, SC.conc);      /* 主船体 */
  bagF.sph('twhite', 0.15, 0, 0.095, 0.37, 1, 0.36, 1.15);                   /* 前倾球鼻艏 */
  bagF.box('twhite', 0.20, 0.01, 0.06, 0, 0.142, -0.43);                     /* 尾平台 */
  bagF.box('teal', 0.305, 0.018, 0.74, 0, 0.062, 0);                         /* 青绿水平带 */
  bagF.sph('teal', 0.15, 0, 0.062, 0.37, 1, 0.10, 1.15);
  bagF.box('dark', 0.30, 0.02, 0.74, 0, 0.046, 0);                           /* 防污底漆 */
  bagF.box('white', 0.31, 0.012, 0.74, 0, 0.126, 0);                         /* 白色护舷条 */
  bagF.box('twhite', 0.312, 0.008, 0.72, 0, 0.112, 0);                       /* 舷侧走条 */
  /* 艉部栏杆（4 柱 + 双横杆） */
  bagF.cyl('rail', 0.004, 0.004, 0.032, -0.08, 0.1635, -0.40, 0, 0, 0, 12);
  bagF.cyl('rail', 0.004, 0.004, 0.032, 0.08, 0.1635, -0.40, 0, 0, 0, 12);
  bagF.cyl('rail', 0.004, 0.004, 0.032, -0.08, 0.1635, -0.32, 0, 0, 0, 12);
  bagF.cyl('rail', 0.004, 0.004, 0.032, 0.08, 0.1635, -0.32, 0, 0, 0, 12);
  bagF.bar('rail', 0.006, -0.08, 0.178, -0.32, -0.08, 0.178, -0.41);
  bagF.bar('rail', 0.006, 0.08, 0.178, -0.32, 0.08, 0.178, -0.41);
  bagF.bar('rail', 0.006, -0.08, 0.178, -0.41, 0.08, 0.178, -0.41);
  /* 主甲板室 + 窗带 + 前挡风 */
  bagF.box('twhite', 0.24, 0.105, 0.56, 0, 0.20, -0.02, 0, 0, 0, SC.conc);
  bagF.box('dark', 0.245, 0.038, 0.52, 0, 0.215, -0.02);
  bagF.box('dark', 0.20, 0.05, 0.012, 0, 0.215, 0.262, -0.3, 0, 0);
  bagF.box('twhite', 0.015, 0.032, 0.30, -0.1125, 0.2685, -0.02);            /* 甲板室翼墙 */
  bagF.box('twhite', 0.015, 0.032, 0.30, 0.1125, 0.2685, -0.02);
  /* 驾驶甲板 + 窗带 + 前窗 */
  bagF.box('twhite', 0.20, 0.075, 0.32, 0, 0.29, -0.10, 0, 0, 0, SC.conc);
  bagF.box('dark', 0.205, 0.030, 0.28, 0, 0.30, -0.10);
  bagF.box('dark', 0.19, 0.032, 0.012, 0, 0.302, 0.062);
  bagF.box('twhite', 0.22, 0.012, 0.34, 0, 0.3335, -0.10);                   /* 顶盖 */
  bagF.box('dark', 0.03, 0.05, 0.03, 0.06, 0.3525, -0.24);                   /* 排气筒 */
  /* 雷达桅 + 横杆 + 雷达球 + 航行灯 */
  bagF.cyl('steel', 0.005, 0.005, 0.16, 0, 0.4135, -0.16, 0, 0, 0, 12);
  bagF.bar('steel', 0.008, -0.05, 0.4535, -0.16, 0.05, 0.4535, -0.16);
  bagF.sph('dark', 0.02, 0, 0.418, -0.155, 1, 0.55, 1);
  bagF.sph('white', 0.01, 0, 0.502, -0.16);
  /* 舷侧救生圈 ×2（外板 + 内板） */
  lifeBuoy(bagF, 0.153, 0.185, 0.15);
  lifeBuoy(bagF, 0.153, 0.185, -0.15);
  /* 艏部栏杆（4 柱 + V 形扶手） */
  bagF.cyl('rail', 0.004, 0.004, 0.032, -0.06, 0.1635, 0.28, 0, 0, 0, 12);
  bagF.cyl('rail', 0.004, 0.004, 0.032, 0.06, 0.1635, 0.28, 0, 0, 0, 12);
  bagF.cyl('rail', 0.004, 0.004, 0.032, -0.10, 0.1635, 0.42, 0, 0, 0, 12);
  bagF.cyl('rail', 0.004, 0.004, 0.032, 0.10, 0.1635, 0.42, 0, 0, 0, 12);
  bagF.bar('rail', 0.006, -0.06, 0.178, 0.28, -0.10, 0.178, 0.44);
  bagF.bar('rail', 0.006, 0.06, 0.178, 0.28, 0.10, 0.178, 0.44);
  bagF.bar('rail', 0.006, -0.10, 0.178, 0.44, 0.10, 0.178, 0.44);
  /* 前甲板设备：绞车 + 舱口盖 + 尾甲板空调箱 */
  bagF.box('dark', 0.05, 0.024, 0.07, 0, 0.1595, 0.18);
  bagF.box('twhite', 0.11, 0.008, 0.16, 0, 0.1515, 0.02);
  bagF.box('steel', 0.06, 0.03, 0.05, -0.07, 0.1625, -0.30);
  /* 系缆：艏 → 堤岸系船柱；艉 → 浮码头系船柱 */
  bag.bar('dark', 0.006, 0.63, 0.08, -0.34, 0.75, DECK + 0.06, -0.16);
  bag.bar('dark', 0.006, 0.63, 0.08, -1.27, 0.88, PON + 0.05, -1.18);
  bagF.build(ferry);

  /* ========== 6.10 合并落地 ========== */
  bag.build(g);

  /* ========== 6.11 发光件（每实例新建）+ 动画 ≤2 项 ========== */
  var glowMat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: texHall(), emissive: C('#ffbe72'), emissiveMap: texHall(),
    emissiveIntensity: 0.45, roughness: 0.6
  });
  var hallGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.30, 0.36), glowMat);
  hallGlow.position.set(BX, 0.55, 1.164); g.add(hallGlow);                   /* 候船厅内景（幕墙之后居中） */

  g.userData.anim = [
    function (t) {                                                            /* 1) 渡轮随波轻晃 */
      ferry.position.y = 0.008 * Math.sin(t * 1.15);
      ferry.rotation.z = 0.016 * Math.sin(t * 0.85 + 0.4);
      ferry.rotation.x = 0.010 * Math.sin(t * 1.05 + 1.2);
    },
    function (t) {                                                            /* 2) 水面波光呼吸（≤0.25） */
      var w = mats().water;
      w.emissiveIntensity = 0.12 + 0.09 * Math.sin(t * 1.7 + 0.3);
    }
  ];
  g.userData.specialId = 25;
  g.userData.parts = { ferry: ferry, waterMat: mats().water, glowMat: glowMat, sign: sign };
  return g;
};

})();
