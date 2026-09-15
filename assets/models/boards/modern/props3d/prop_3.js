/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/props3d/prop_3.js  格 3「烟袋斜街」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/prop_3.png 四象限（左上1990s / 右上2000s / 左下2010s / 右下2020s，
 * 同机位同角度——同一条街 40 年的生长史）。
 * 注册：window.Props3DModern[3](level 1..4) → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.6×2.6；底面 y=0；正面 +z；每级 mesh ≤55；Canvas 纹理 ≤256px；
 *       源码零 Math.random（mulberry32 种子流）；动画 ≤2 项/模型（暖窗呼吸/灯头闪烁）。
 *
 * 年代特征（对照参考图逐象限）：
 *   lv1 1990s 老街坊：青石板街面、灰瓦坡顶连排铺面、红柱木门板柜台、檐下红灯笼、
 *        门前货摊杂料、电线杆木抱柱，二层木栏杆
 *   lv2 2000s 个体户：红布雨棚×2、黄字红底竖幌、屋顶空调外机、漆色翻新的门脸
 *        横匾、货摊加密、灯笼保留
 *   lv3 2010s 整治改造：左号屋顶加玻璃阳光房（钢肋分格）、统一深色底白字招牌、
 *        门前花箱成列、路灯替换木电杆、立面抹灰翻新
 *   lv4 2020s 精品街区：二层屋顶露台（木平台+玻璃栏板+钢廊架）、黑框通高玻璃幕墙
 *        暖光内景、极简黑字招牌、屋面天窗、双路灯、绿植点缀
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils），
 * 静态件全部合并成每材质 1 mesh；坡屋顶用自建棱柱几何（UV 按尺寸烘焙）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[boards/modern/prop_3] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

window.Props3DModern = window.Props3DModern || {};

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

/* ================= 1. Canvas 程序纹理（≤256px；多层：基色 → 分缝 → 噪点/风化 → 高光/苔痕；懒建单例） ================= */
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
/* 通用层：确定性噪点斑 */
function speckle(g, w, h, rnd, n, dark, light, mw, mh) {
  for (var i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? dark : light;
    g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1 + ((rnd() * mw) | 0), 1 + ((rnd() * mh) | 0));
  }
}
function gray(v) { v = Math.max(0, Math.min(255, v | 0)); return 'rgb(' + v + ',' + v + ',' + v + ')'; }
/* 灰砖墙：8 皮错缝 + 砖面色差/斑 + 灰缝凹影/受光边 + 泛碱 + 檐下烟熏 + 根部苔痕 */
function texBrick() {
  return cvTex('ybrick', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#6e6a60'; g.fillRect(0, 0, w, h);
    var bh = 32, bw = 64, r, c, i;
    for (r = 0; r < 8; r++) {
      var off = (r % 2) * (bw / 2);
      for (c = -1; c < 5; c++) {
        var x = c * bw + off, y = r * bh, v = 0.88 + rnd() * 0.24;
        g.fillStyle = 'rgb(' + Math.round(146 * v) + ',' + Math.round(144 * v) + ',' + Math.round(136 * v) + ')';
        g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
        g.fillStyle = 'rgba(255,250,240,0.16)'; g.fillRect(x + 2, y + 2, bw - 4, 2); g.fillRect(x + 2, y + 2, 2, bh - 4);
        g.fillStyle = 'rgba(30,28,24,0.28)'; g.fillRect(x + 2, y + bh - 4, bw - 4, 2); g.fillRect(x + bw - 4, y + 2, 2, bh - 4);
        if (rnd() < 0.18) { g.fillStyle = 'rgba(40,36,30,0.18)'; g.fillRect(x + 8 + ((rnd() * 30) | 0), y + 6, 10 + ((rnd() * 18) | 0), 6 + ((rnd() * 12) | 0)); }
      }
    }
    speckle(g, w, h, rnd, 120, 'rgba(60,56,48,0.16)', 'rgba(200,196,184,0.14)', 20, 10);
    for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(222,218,206,0.22)'; g.fillRect((rnd() * w) | 0, (rnd() * h * 0.5) | 0, 6 + ((rnd() * 10) | 0), 24 + ((rnd() * 46) | 0)); }
    for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(40,40,44,0.14)'; g.fillRect((rnd() * w) | 0, 0, 20 + ((rnd() * 40) | 0), 26); }
    g.fillStyle = 'rgba(70,90,50,0.16)'; g.fillRect(0, h - 22, w, 22);
  });
}
/* 灰砖粗糙度图（线性）：灰缝更糙、砖面略光 */
function texBrickRough() {
  return cvTex('ybrickR', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = gray(255); g.fillRect(0, 0, w, h);
    var r, c;
    for (r = 0; r < 8; r++) { var off = (r % 2) * 16; for (c = -1; c < 5; c++) { g.fillStyle = gray(200 + rnd() * 34); g.fillRect(c * 32 + off + 1, r * 16 + 1, 30, 14); } }
    speckle(g, w, h, rnd, 50, gray(180), gray(245), 6, 3);
  }, true);
}
/* 灰陶瓦屋面：瓦行 + 单瓦色差 + 瓦脊受光弧 + 竖向搭接暗缝 + 行口高光 + 地衣/苔斑 + 破瓦亮片 */
function texTile() {
  return cvTex('ytile', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#5e646a'; g.fillRect(0, 0, w, h);
    var y, x, row = 0, i;
    for (y = 0; y < h; y += 24, row++) {
      var off = (row % 2) * 16;
      for (x = -16; x < w; x += 32) {
        var v = 0.9 + rnd() * 0.2;
        g.fillStyle = 'rgb(' + Math.round(126 * v) + ',' + Math.round(132 * v) + ',' + Math.round(138 * v) + ')';
        g.fillRect(x + off + 2, y + 5, 28, 19);
        g.fillStyle = 'rgba(210,216,222,0.3)'; g.fillRect(x + off + 6, y + 6, 20, 3);
        g.fillStyle = 'rgba(28,32,36,0.55)'; g.fillRect(x + off, y, 3, 24);
      }
      g.fillStyle = '#3f454b'; g.fillRect(0, y, w, 4);
      g.fillStyle = 'rgba(170,178,184,0.25)'; g.fillRect(0, y + 5, w, 1);
    }
    speckle(g, w, h, rnd, 70, 'rgba(24,28,32,0.2)', 'rgba(140,150,158,0.16)', 18, 8);
    for (i = 0; i < 10; i++) {
      g.fillStyle = i % 3 ? 'rgba(120,130,70,0.28)' : 'rgba(150,140,60,0.22)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 3 + ((rnd() * 9) | 0), 3 + ((rnd() * 6) | 0));
    }
    g.fillStyle = 'rgba(205,210,214,0.35)'; g.fillRect(96 + ((rnd() * 64) | 0), 48 + ((rnd() * 96) | 0), 24, 8);
  });
}
/* 青石板：大板色差 + 倒角受光/阴影边 + 深缝 + 水渍 + 碎斑；配套粗糙度图 */
function texPave() {
  return cvTex('ypave', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#8f8a7e'; g.fillRect(0, 0, w, h);
    var r, c, s = 64;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.86 + rnd() * 0.26, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(200 * v) + ',' + Math.round(194 * v) + ',' + Math.round(180 * v) + ')';
      g.fillRect(x + 3, y + 3, s - 6, s - 6);
      g.fillStyle = 'rgba(255,252,244,0.22)'; g.fillRect(x + 3, y + 3, s - 6, 2); g.fillRect(x + 3, y + 3, 2, s - 6);
      g.fillStyle = 'rgba(40,38,34,0.25)'; g.fillRect(x + 3, y + s - 5, s - 6, 2); g.fillRect(x + s - 5, y + 3, 2, s - 6);
      if (rnd() < 0.3) { g.fillStyle = 'rgba(70,66,60,0.14)'; g.fillRect(x + 8 + ((rnd() * 20) | 0), y + 8 + ((rnd() * 20) | 0), 14 + ((rnd() * 24) | 0), 8 + ((rnd() * 16) | 0)); }
    }
    speckle(g, w, h, rnd, 140, 'rgba(110,106,96,0.18)', 'rgba(232,228,216,0.18)', 12, 6);
  });
}
function texPaveRough() {
  return cvTex('ypaveR', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = gray(255); g.fillRect(0, 0, w, h);
    var r, c;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) { g.fillStyle = gray(196 + rnd() * 36); g.fillRect(c * 32 + 2, r * 32 + 2, 28, 28); }
    speckle(g, w, h, rnd, 60, gray(170), gray(240), 6, 3);
  }, true);
}
/* 木板：板色差 + 板缝/受光边 + 微弯木纹 + 木节 + 钉头 */
function texPlank() {
  return cvTex('yplank', 256, 256, function (g, w, h, rnd) {
    var x, k;
    for (x = 0; x < w; x += 42) {
      var v = 0.9 + rnd() * 0.2;
      g.fillStyle = 'rgb(' + Math.round(104 * v) + ',' + Math.round(84 * v) + ',' + Math.round(58 * v) + ')';
      g.fillRect(x, 0, 42, h);
      g.fillStyle = 'rgba(28,20,10,0.85)'; g.fillRect(x, 0, 2, h);
      g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(x + 2, 0, 2, h);
      g.strokeStyle = 'rgba(60,44,26,0.35)'; g.lineWidth = 1;
      for (k = 0; k < 4; k++) {
        var gx = x + 8 + k * 9 + ((rnd() * 4) | 0);
        g.beginPath(); g.moveTo(gx, 0);
        for (var yy = 32; yy <= h; yy += 32) g.lineTo(gx + Math.sin((yy / 32 + k) * 1.7) * 2.5, yy);
        g.stroke();
      }
      if (rnd() < 0.5) {
        var kx = x + 10 + ((rnd() * 20) | 0), ky = (rnd() * h) | 0;
        g.fillStyle = 'rgba(52,36,20,0.75)'; g.fillRect(kx, ky, 8, 5);
        g.fillStyle = 'rgba(30,20,10,0.8)'; g.fillRect(kx + 3, ky + 2, 2, 2);
      }
      g.fillStyle = 'rgba(200,200,205,0.55)'; g.fillRect(x + 20, 10, 2, 2); g.fillRect(x + 20, h - 12, 2, 2);
    }
  });
}
/* 白灰墙面：斑驳 + 发丝裂纹 + 雨痕 + 根部溅污 + 掉灰露砖 */
function texPlaster() {
  return cvTex('yplaster', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#e8e2d2'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 120, 'rgba(198,192,176,0.4)', 'rgba(246,242,232,0.5)', 26, 18);
    g.strokeStyle = 'rgba(120,112,98,0.5)'; g.lineWidth = 1;
    var i, k;
    for (i = 0; i < 4; i++) {
      var cx = (rnd() * w) | 0, cy = (rnd() * h) | 0;
      g.beginPath(); g.moveTo(cx, cy);
      for (k = 0; k < 5; k++) { cx += ((rnd() * 16 - 8) | 0); cy += 6 + ((rnd() * 14) | 0); g.lineTo(cx, cy); }
      g.stroke();
    }
    for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(150,146,132,0.18)'; g.fillRect((rnd() * w) | 0, 0, 3 + ((rnd() * 5) | 0), 40 + ((rnd() * 90) | 0)); }
    g.fillStyle = 'rgba(140,136,122,0.32)'; g.fillRect(0, h - 28, w, 28);
    g.fillStyle = 'rgba(120,112,100,0.5)';
    var bx = (rnd() * (w - 40)) | 0;
    for (var rr = 0; rr < 3; rr++) for (var cc = 0; cc < 2; cc++) g.fillRect(bx + cc * 18 + (rr % 2) * 9, h - 26 + rr * 8, 16, 6);
  });
}
/* 幕墙玻璃：竖向天空反射渐变带 + 楼板暗线 + 高光条（配 tint 与低 rough/高 metal） */
function texGlass() {
  return cvTex('yglass', 128, 128, function (g, w, h) {
    for (var x = 0; x < w; x++) {
      var t = x / w, v = 0.72 + 0.22 * Math.sin(t * 6.283 * 1.5 + 0.6) + 0.06 * Math.sin(t * 40);
      g.fillStyle = 'rgb(' + Math.round(150 * v) + ',' + Math.round(178 * v) + ',' + Math.round(190 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    for (var y = 0; y < h; y += 32) { g.fillStyle = 'rgba(40,52,60,0.2)'; g.fillRect(0, y, w, 2); }
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(18, 0, 6, h); g.fillRect(84, 0, 3, h);
  });
}
/* 金属机壳：拉丝 + 碎斑 + 铆钉 + 底部锈痕；配套粗糙度图 */
function texMetal() {
  return cvTex('ymetal', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#b4babe'; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 2) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(70,76,80,0.14)'; g.fillRect(0, y, w, 1); }
    speckle(g, w, h, rnd, 30, 'rgba(60,66,70,0.3)', 'rgba(240,244,246,0.4)', 3, 2);
    g.fillStyle = 'rgba(70,76,80,0.6)';
    for (var i = 0; i < 4; i++) g.fillRect(12 + i * 32, 12, 3, 3);
    g.fillStyle = 'rgba(120,90,50,0.22)'; g.fillRect(0, h - 10, w, 10);
  });
}
function texMetalRough() {
  return cvTex('ymetalR', 64, 64, function (g, w, h, rnd) {
    g.fillStyle = gray(110); g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 2) { g.fillStyle = gray(90 + rnd() * 60); g.fillRect(0, y, w, 1); }
    g.fillStyle = gray(200); g.fillRect(0, h - 5, w, 5);
  }, true);
}
/* 空调百叶散热面 */
function texLouver() {
  return cvTex('ylouver', 64, 64, function (g, w, h) {
    g.fillStyle = '#6e757b'; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 6) {
      g.fillStyle = '#2c3237'; g.fillRect(0, y, w, 3);
      g.fillStyle = 'rgba(220,226,230,0.35)'; g.fillRect(0, y + 3, w, 1);
    }
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
  });
}
/* 混凝土：骨料斑 + 模板缝 + 根部污带 */
function texConc() {
  return cvTex('yconc', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#b3ada0'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 160, 'rgba(90,86,78,0.22)', 'rgba(236,232,222,0.24)', 3, 2);
    g.fillStyle = 'rgba(80,76,70,0.28)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    g.fillStyle = 'rgba(60,58,54,0.16)'; g.fillRect(0, h - 12, w, 12);
  });
}
/* 织物（雨棚）：经纬网 + 横向高光（浅底，由材质 color 染色） */
function texWeave() {
  return cvTex('yweave', 64, 64, function (g, w, h) {
    g.fillStyle = '#e0e0e0'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < w; i += 4) { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
    for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, i * 11 + 3, w, 2); }
  });
}
/* 树冠叶斑：三层明暗叶簇 */
function texLeaf() {
  return cvTex('yleaf', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#7f9c5e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) {
      var v = rnd();
      g.fillStyle = v < 0.5 ? 'rgba(46,78,34,0.42)' : v < 0.8 ? 'rgba(150,186,100,0.5)' : 'rgba(200,216,140,0.35)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 4 + ((rnd() * 12) | 0), 3 + ((rnd() * 8) | 0));
    }
  });
}
/* 店内暖光陈列（暖光面 map + emissiveMap）：层板 + 陈列物 + 顶灯 */
function texInterior() {
  return cvTex('yinterior', 128, 64, function (g, w, h, rnd) {
    g.fillStyle = '#f2d9a8'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(90,60,30,0.45)'; for (var y = 12; y < h; y += 16) g.fillRect(6, y, w - 12, 3);
    for (var i = 0; i < 18; i++) { g.fillStyle = i % 3 ? 'rgba(120,80,40,0.5)' : 'rgba(60,90,120,0.45)'; g.fillRect(8 + ((rnd() * (w - 20)) | 0), 6 + (i % 3) * 16, 5 + ((rnd() * 6) | 0), 7); }
    g.fillStyle = 'rgba(255,250,230,0.9)'; g.fillRect(20, 2, 10, 3); g.fillRect(70, 2, 10, 3); g.fillRect(105, 2, 8, 3);
  });
}
/* 红漆柱：漆面高光带 + 背光暗带 + 漆皮剥落露木 + 柱根污渍 */
function texLacquer() {
  return cvTex('ylacq', 64, 128, function (g, w, h, rnd) {
    g.fillStyle = '#7a3a2c'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,200,180,0.22)'; g.fillRect(14, 0, 6, h);
    g.fillStyle = 'rgba(40,16,10,0.35)'; g.fillRect(44, 0, 8, h);
    for (var i = 0; i < 10; i++) { g.fillStyle = 'rgba(120,96,70,0.7)'; g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 2 + ((rnd() * 4) | 0), 3 + ((rnd() * 8) | 0)); }
    g.fillStyle = 'rgba(30,14,8,0.4)'; g.fillRect(0, h - 10, w, 10);
  });
}
/* 灯笼材质（每实例新建 + 呼吸） */
function lanternMat(g, phase) {
  var m = M('#ff5a3a', { rough: 0.55, emissive: '#ff7a30', ei: 0.5 });
  g.userData.anim.push(function (t) { m.emissiveIntensity = 0.42 + 0.22 * Math.sin(t * 2.1 + phase); });
  return m;
}
/* ================= 2. 材质（静态件模块级单例；发光件每实例新建） ================= */
function M(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0)
  });
  if (o.map) m.map = o.map;
  if (o.roughMap) m.roughnessMap = o.roughMap;
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.tr !== undefined) { m.transparent = true; m.opacity = o.tr; }
  if (o.ds) m.side = THREE.DoubleSide;
  return m;
}
/* 暖光内景材质（每实例新建，供呼吸动画） */
function glowMat(ei) {
  return new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: texInterior(), emissive: C('#ffb668'), emissiveMap: texInterior(),
    emissiveIntensity: ei, roughness: 0.55
  });
}
var MATS = null;
function mats() {
  if (MATS) return MATS;
  MATS = {
    pave:     M('#ffffff', { map: texPave(), rough: 1, roughMap: texPaveRough() }),
    conc:     M('#ffffff', { map: texConc(), rough: 0.9 }),
    brick:    M('#ffffff', { map: texBrick(), rough: 1, roughMap: texBrickRough(), ds: true }),
    plaster:  M('#ffffff', { map: texPlaster(), rough: 0.88, ds: true }),
    roof:     M('#ffffff', { map: texTile(), rough: 0.78, ds: true }),
    roofDk:   M('#b4b8bc', { map: texTile(), rough: 0.84, ds: true }),
    wood:     M('#ffffff', { map: texPlank(), rough: 0.72 }),
    woodDk:   M('#8a7c68', { map: texPlank(), rough: 0.8 }),
    glass:    M('#ffffff', { map: texGlass(), rough: 0.05, metal: 0.85, tr: 0.55 }),
    glassDk:  M('#5a6a70', { map: texGlass(), rough: 0.1, metal: 0.8, tr: 0.72 }),
    metal:    M('#ffffff', { map: texMetal(), rough: 1, roughMap: texMetalRough(), metal: 0.7 }),
    acFront:  M('#ffffff', { map: texLouver(), rough: 0.6, metal: 0.45 }),
    frame:    M('#2e3338', { rough: 0.5, metal: 0.5 }),
    green:    M('#ffffff', { map: texLeaf(), rough: 0.95 }),
    green2:   M('#a9b894', { map: texLeaf(), rough: 0.95 }),
    trunk:    M('#8c7050', { map: texPlank(), rough: 0.9 }),
    red:      M('#c04332', { map: texWeave(), rough: 0.8 }),
    cream:    M('#e6ddc8', { rough: 0.9 }),
    dark:     M('#22262b', { rough: 0.65, metal: 0.2 }),
    lampGlow: M('#fff1c8', { rough: 0.5, emissive: '#ffd27a', ei: 0.9 }),
    column:   M('#ffffff', { map: texLacquer(), rough: 0.55 }),
    orange:   M('#c87f36', { rough: 0.8 }),
    lantern:  M('#ff5a3a', { rough: 0.55, emissive: '#ff7a30', ei: 0.5 })
  };
  return MATS;
}

var SC = { brick: 2.2, tile: 2.6, pave: 0.9, plank: 2.8, plaster: 1.2, conc: 1.0 };

/* ================= 3. 按材质分桶合并（手写，r147 无 BufferGeometryUtils） ================= */
function Bag() { this.b = {}; this.oz = 0; }
Bag.prototype.put = function (key, geo, m) {
  var g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (m) g.applyMatrix4(m);
  if (this.oz) {                       /* 建筑排：整体前移 + 以台基顶 y=0.05 为基准纵向放大 */
    g.translate(0, -0.05, this.oz); g.scale(1, SY, 1); g.translate(0, 0.05, 0);
  }
  (this.b[key] || (this.b[key] = [])).push(g);
};
Bag.prototype.build = function (group, over) {
  var Ms = mats(), n = 0;
  for (var k in this.b) {
    var geos = this.b[k], mat = (over && over[k]) || Ms[k]; if (!geos.length || !mat) continue;
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

/* ---------- 变换 & 图元 ---------- */
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
Bag.prototype.box = function (key, w, h, d, x, y, z, rx, ry, rz, sc) {
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, sc !== undefined ? sc : SC.brick);
  this.put(key, g, m4(x, y, z, rx, ry, rz));
};
Bag.prototype.cyl = function (key, rt, rb, h, x, y, z, rx, ry, rz, seg, order) {
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 10), m4(x, y, z, rx, ry, rz, 1, 1, 1, order));
};
Bag.prototype.cone = function (key, r, h, x, y, z, rx, ry, rz, seg) {
  this.put(key, new THREE.ConeGeometry(r, h, seg || 10), m4(x, y, z, rx, ry, rz));
};
Bag.prototype.sph = function (key, r, x, y, z, ws, hs) {
  this.put(key, new THREE.SphereGeometry(r, ws || 12, hs || 9), m4(x, y, z));
};
Bag.prototype.plane = function (key, w, h, x, y, z, rx, ry, rz) {
  this.put(key, new THREE.PlaneGeometry(w, h), m4(x, y, z, rx, ry, rz));
};
/* 双坡棱柱（屋脊沿 x；ry=PI/2 时屋脊沿 z）；UV：u 沿屋脊、v 沿坡长 */
var _prism = {};
function prismGeo(w, d, h, sc) {
  var key = w + '_' + d + '_' + h + '_' + sc;
  if (_prism[key]) return _prism[key];
  var hw = w / 2, hd = d / 2, sl = Math.sqrt(hd * hd + h * h);
  var A = [-hw, 0, -hd], B = [hw, 0, -hd], Cc = [hw, 0, hd], D = [-hw, 0, hd], E = [-hw, h, 0], F = [hw, h, 0];
  var pos = [], nor = [], uv = [];
  function tri(a, b, c, ua, va, ub, vb, uc, vc) {
    var e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    var n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]];
    var l = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1;
    n[0] /= l; n[1] /= l; n[2] /= l;
    [a, b, c].forEach(function (p, i) {
      pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]);
      uv.push(i === 0 ? ua : i === 1 ? ub : uc, i === 0 ? va : i === 1 ? vb : vc);
    });
  }
  function quad(a, b, c, d2, su, sv) {
    tri(a, b, c, 0, 0, su, 0, su, sv);
    tri(a, c, d2, 0, 0, su, sv, 0, sv);
  }
  quad(D, Cc, F, E, w * sc, sl * sc);
  quad(B, A, E, F, w * sc, sl * sc);
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  _prism[key] = g; return g;
}
Bag.prototype.prism = function (key, w, d, h, x, y, z, ry, sc) {
  this.put(key, prismGeo(w, d, h, sc !== undefined ? sc : SC.tile), m4(x, y, z, 0, ry || 0, 0));
};
/* 山墙封板三角（双面绕向） */
var _triG = {};
function triGeo(d, h) {
  var key = d + '_' + h;
  if (_triG[key]) return _triG[key];
  var hd = d / 2;
  var pos = [0, 0, -hd, 0, 0, hd, 0, h, 0, 0, 0, hd, 0, 0, -hd, 0, h, 0];
  var uv = [0, 0, d, 0, d / 2, h];
  var nrm = [1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0];
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv.concat(uv), 2));
  _triG[key] = g; return g;
}
Bag.prototype.tri = function (key, d, h, x, y, z, ry) {
  this.put(key, triGeo(d, h), m4(x, y, z, 0, ry || 0, 0));
};

/* ================= 4. 文字招牌（Canvas 字纹理，独立 mesh，≤256px） ================= */
function signMesh(text, w, h, o) {
  o = o || {};
  var wide = o.vertical ? 64 : 256, high = o.vertical ? 256 : 64;
  var cv = document.createElement('canvas'); cv.width = wide; cv.height = high;
  var g = cv.getContext('2d');
  g.fillStyle = o.bg || (o.red ? '#a3271e' : '#1d2126'); g.fillRect(0, 0, wide, high);
  for (var si = 0; si < 24; si++) { g.fillStyle = si % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.18)'; g.fillRect((si * 37) % wide, (si * 53) % high, 3 + (si % 4), 2); }
  if (o.frame !== false) {
    g.strokeStyle = o.frameColor || (o.red ? '#e8c545' : '#c8b490'); g.lineWidth = o.vertical ? 5 : 6;
    g.strokeRect(4, 4, wide - 8, high - 8);
  }
  g.fillStyle = o.fg || (o.red ? '#ffd24a' : '#f2e9d8');
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (o.vertical) {
    var n = text.length, step = (high - 40) / n, fs = Math.min(step * 0.9, wide * 0.62);
    g.font = 'bold ' + Math.round(fs) + 'px "Microsoft YaHei","PingFang SC",sans-serif';
    for (var i = 0; i < n; i++) g.fillText(text[i], wide / 2, 22 + step * (i + 0.5));
  } else {
    g.font = 'bold ' + Math.round(high * 0.52) + 'px "Microsoft YaHei","PingFang SC",sans-serif';
    g.fillText(text, wide / 2, high / 2 + 2);
  }
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  var m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.1 });
  if (o.neon) { m.emissive = C(o.neonColor || '#ffdf9e'); m.emissiveIntensity = 0.8; }
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.castShadow = true;
  mesh.userData.signMat = m;
  return mesh;
}

/* ================= 5. 预制构件（各年代共用 → 同一条街的生长） ================= */
/* 建筑排整体前移量（门脸贴近街面，街道比例对齐参考图）+ 纵向体量放大 */
var OZ = 0.18, SY = 1.15;
function BY(y) { return 0.05 + (y - 0.05) * SY; }
function buildPlinth(bag) {
  bag.box('pave', 2.5, 0.05, 1.56, 0, 0.025, 0.03, 0, 0, 0, SC.pave);
  bag.box('conc', 2.5, 0.03, 0.07, 0, 0.055, 0.775);
  bag.box('conc', 0.07, 0.03, 1.49, -1.235, 0.055, 0.03);
  bag.box('conc', 0.07, 0.03, 1.49, 1.235, 0.055, 0.03);
}
/* 台基（商铺 stone base） */
function shopBase(bag, x, z, w, d, h) {
  bag.box('conc', w, h, d, x, 0.05 + h / 2, z, 0, 0, 0, SC.conc);
}
/* 硬山坡顶 */
function tileGable(bag, x, wallTop, z, w, d, rise, ry, dk) {
  bag.prism(dk ? 'roofDk' : 'roof', w, d, rise, x, wallTop, z, ry || 0);
  bag.box('roofDk', (ry ? d : w) + 0.05, 0.032, 0.075, x, wallTop + rise + 0.012, z, 0, ry || 0, 0, SC.tile);
}
/* 红柱（檐廊） */
function colRed(bag, x, y, z, h) {
  bag.cyl('column', 0.026, 0.03, h, x, y + h / 2, z, 0, 0, 0, 10);
  bag.box('woodDk', 0.075, 0.035, 0.075, x, y + h + 0.017, z);
}
/* 板门 / 柜台 */
function plankDoor(bag, x, y, z, w, h) {
  bag.box('wood', w, h, 0.035, x, y + h / 2, z, 0, 0, 0, SC.plank);
  bag.box('woodDk', w + 0.05, 0.03, 0.05, x, y + h + 0.015, z);
}
function counter(bag, x, z, w) {
  bag.box('wood', w, 0.09, 0.16, x, 0.2, z, 0, 0, 0, SC.plank);
  bag.box('woodDk', w, 0.014, 0.18, x, 0.25, z);
}
/* 木格窗 / 玻璃窗 / 黑框幕墙带 */
function glassWin(bag, x, y, z, w, h, ry, dk) {
  var fk = dk ? 'dark' : 'woodDk', gk = dk ? 'glassDk' : 'glass';
  bag.box(gk, ry ? 0.02 : w, h, ry ? w : 0.02, x, y, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.035 : w + 0.03, 0.035, ry ? w + 0.03 : 0.035, x, y + h / 2, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.035 : w + 0.03, 0.035, ry ? w + 0.03 : 0.035, x, y - h / 2, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.035 : 0.035, h, ry ? 0.035 : 0.035, x + (ry ? 0 : w / 2), y, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.035 : 0.035, h, ry ? 0.035 : 0.035, x - (ry ? 0 : w / 2), y, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.028 : 0.028, h, ry ? 0.028 : 0.028, x, y, z, 0, ry || 0, 0);
}
/* 空调外机 */
function acUnit(bag, x, y, z, ry, pipeLen) {
  ry = ry || 0;
  var cr = Math.cos(ry), sr = Math.sin(ry);
  function W(lx, lz) { return [x + lx * cr + lz * sr, z - lx * sr + lz * cr]; }
  bag.box('metal', 0.2, 0.13, 0.09, x, y, z, 0, ry, 0, 6);
  var f = W(-0.045, 0.05);
  bag.cyl('frame', 0.046, 0.046, 0.01, f[0], y, f[1], PI / 2, ry, 0, 16, 'YXZ');    /* 风扇格栅盘（贴前脸） */
  bag.cyl('metal', 0.012, 0.012, 0.016, f[0], y, f[1], PI / 2, ry, 0, 8, 'YXZ');     /* 风扇轴毂 */
  var l = W(0.052, 0.05);
  bag.box('acFront', 0.085, 0.11, 0.008, l[0], y, l[1], 0, ry, 0, 10);               /* 百叶散热面 */
  var b1 = W(-0.06, -0.03), b2 = W(0.06, -0.03);
  bag.box('frame', 0.02, 0.15, 0.02, b1[0], y - 0.02, b1[1], 0, ry, 0);               /* 支架 */
  bag.box('frame', 0.02, 0.15, 0.02, b2[0], y - 0.02, b2[1], 0, ry, 0);
  if (pipeLen) {
    var p = W(-0.11, 0);
    bag.cyl('metal', 0.008, 0.008, pipeLen, p[0], y - pipeLen / 2 + 0.02, p[1], 0, 0, 0, 6);
  }
}
/* 布雨棚 */
function awning(bag, key, x, y, z, w, depth, ang) {
  bag.box(key, w, 0.014, depth, x, y, z + depth * 0.42, ang, 0, 0);
  bag.cyl('dark', 0.016, 0.016, w, x, y - 0.008, z + depth * 0.82, 0, 0, PI / 2, 8);
}
/* 红灯笼 */
function lantern(bag, x, y, z, s) {
  s = s || 1;
  bag.sph('lantern', 0.055 * s, x, y - 0.05 * s, z, 10, 8);
  bag.cyl('metal', 0.022 * s, 0.03 * s, 0.016 * s, x, y + 0.006 * s, z, 0, 0, 0, 8);
  bag.cyl('metal', 0.018 * s, 0.024 * s, 0.014 * s, x, y - 0.1 * s, z, 0, 0, 0, 8);
  bag.cyl('lantern', 0.004 * s, 0.004 * s, 0.05 * s, x, y - 0.13 * s, z, 0, 0, 0, 6);
}
/* 货摊（1990s-2000s 街景签名件：条箱+果筐） */
function stall(bag, x, z) {
  crate(bag, x, z, 1);
  crate(bag, x + 0.16, z + 0.03, 0.8);
  bag.sph('orange', 0.032, x + 0.02, 0.17, z, 8, 6);
  bag.sph('orange', 0.03, x + 0.06, 0.165, z + 0.02, 8, 6);
  bag.sph('green2', 0.028, x - 0.03, 0.165, z - 0.01, 8, 6);
}
function crate(bag, x, z, s) {
  s = s || 1;
  bag.box('wood', 0.14 * s, 0.1 * s, 0.11 * s, x, 0.05 + 0.05 * s, z, 0, 0.3 * (s - 1), 0, SC.plank);
}
/* 花箱 */
function planterBox(bag, x, z, alongX) {
  bag.box('wood', alongX ? 0.3 : 0.14, 0.09, alongX ? 0.14 : 0.3, x, 0.095, z, 0, 0, 0, SC.plank);
  bag.sph('green', 0.05, x + (alongX ? -0.08 : 0), 0.16, z + (alongX ? 0 : -0.08), 8, 6);
  bag.sph('green2', 0.045, x + (alongX ? 0.08 : 0), 0.155, z + (alongX ? 0 : 0.08), 8, 6);
}
/* 树 / 灌 */
function tree(bag, x, z, s) {
  bag.cyl('trunk', 0.028 * s, 0.04 * s, 0.4 * s, x, 0.05 + 0.2 * s, z, 0, 0, 0, 8);
  bag.sph('green', 0.2 * s, x, 0.05 + 0.48 * s, z, 12, 9);
  bag.sph('green2', 0.14 * s, x + 0.12 * s, 0.05 + 0.4 * s, z + 0.05 * s, 10, 8);
}
function shrub(bag, x, z, s) {
  bag.sph('green2', s, x, 0.05 + s * 0.7, z, 10, 8);
}
/* 路灯（双头） */
function lampPost(bag, x, z) {
  bag.cyl('frame', 0.016, 0.022, 0.66, x, 0.05 + 0.33, z, 0, 0, 0, 8);
  bag.cyl('frame', 0.014, 0.014, 0.2, x + 0.09, 0.7, z, 0, 0, PI / 2, 8);
  bag.cyl('frame', 0.014, 0.014, 0.2, x - 0.09, 0.7, z, 0, 0, PI / 2, 8);
  bag.sph('lampGlow', 0.032, x + 0.18, 0.7, z, 8, 6);
  bag.sph('lampGlow', 0.032, x - 0.18, 0.7, z, 8, 6);
}
/* 木电线杆（1990s 签名件：杆+横担+瓷瓶） */
function poleLine(bag, x, z) {
  bag.cyl('woodDk', 0.02, 0.026, 0.85, x, 0.05 + 0.425, z, 0, 0, 0, 8);
  bag.box('woodDk', 0.3, 0.025, 0.025, x, 0.82, z);
  bag.sph('cream', 0.012, x - 0.1, 0.845, z, 6, 5);
  bag.sph('cream', 0.012, x + 0.1, 0.845, z, 6, 5);
  bag.box('dark', 0.4, 0.006, 0.006, x - 0.22, 0.79, z + 0.02);
}
/* 玻璃阳光房（屋面） */
function sunroom(bag, x, y, z, w, d, rise) {
  bag.prism('glass', w, d, rise, x, y, z, 0, 0.5);
  bag.box('frame', w + 0.03, 0.02, 0.05, x, y + rise + 0.008, z);
  var n = 3, i;
  for (i = 0; i <= n; i++) {
    bag.box('frame', 0.02, rise * 0.92, rise * 0.9, x - w / 2 + (w * i) / n, y + rise * 0.42, z);
  }
}
/* 天窗（平嵌屋面） */
function skylight(bag, x, y, z, w, d) {
  bag.box('frame', w + 0.04, 0.02, d + 0.04, x, y, z);
  bag.box('glass', w, 0.025, d, x, y + 0.015, z);
}
/* 玻璃栏板 */
function glassRail(bag, x, y, z, len, alongX) {
  bag.box('glass', alongX ? len : 0.015, 0.13, alongX ? 0.015 : len, x, y + 0.065, z);
  bag.box('frame', alongX ? len : 0.02, 0.018, alongX ? 0.02 : len, x, y + 0.14, z);
  var n = Math.max(2, Math.round(len / 0.3)), i;
  for (i = 0; i <= n; i++) {
    var t = -0.5 + i / n;
    bag.box('frame', 0.018, 0.14, 0.018, x + (alongX ? len * t : 0), y + 0.07, z + (alongX ? 0 : len * t));
  }
}
/* 钢廊架 */
function pergola(bag, x, y, z, w, d, h) {
  var i;
  [[-w / 2 + 0.03, -d / 2 + 0.03], [w / 2 - 0.03, -d / 2 + 0.03], [-w / 2 + 0.03, d / 2 - 0.03], [w / 2 - 0.03, d / 2 - 0.03]].forEach(function (c) {
    bag.box('frame', 0.032, h, 0.032, x + c[0], y + h / 2, z + c[1]);
  });
  bag.box('frame', w, 0.028, 0.045, x, y + h, z - d / 2 + 0.03);
  bag.box('frame', w, 0.028, 0.045, x, y + h, z + d / 2 - 0.03);
  for (i = 0; i <= 4; i++) {
    bag.box('wood', 0.045, 0.018, d, x - w / 2 + (w * i) / 4, y + h + 0.02, z, 0, 0, 0, SC.plank);
  }
}

/* ================= 6. 四个年代（同一条街生长） =================
 * 固定语汇：2.5×1.9 青石板沙盘 + 西号(单层,-0.72,-0.5) + 东号(两层,0.42,-0.5)
 *           + 前街(z 0.2..0.9) + 门脸朝 +z
 */

/* ---- lv1 1990s 老街坊 ---- */
function stage1() {
  var g = new THREE.Group(); g.name = 'prop3m_lv1';
  var bag = new Bag();
  buildPlinth(bag);
  bag.oz = OZ;
  /* 西号：石基 + 灰砖墙 + 红柱门脸 + 板门柜台 + 灰瓦坡顶 */
  shopBase(bag, -0.72, -0.5, 1.0, 0.64, 0.1);
  bag.box('brick', 0.92, 0.3, 0.58, -0.72, 0.25, -0.5, 0, 0, 0, SC.brick);
  bag.tri('brick', 0.58, 0.15, -0.72 - 0.51, 0.4, -0.5, 0);
  bag.tri('brick', 0.58, 0.15, -0.72 + 0.51, 0.4, -0.5, 0);
  tileGable(bag, -0.72, 0.4, -0.5, 1.02, 0.78, 0.2, 0, true);
  colRed(bag, -1.12, 0.15, -0.21, 0.25);
  colRed(bag, -0.76, 0.15, -0.21, 0.25);
  colRed(bag, -0.4, 0.15, -0.21, 0.25);
  bag.box('column', 0.76, 0.05, 0.05, -0.76, 0.42, -0.21);
  plankDoor(bag, -0.96, 0.15, -0.2, 0.24, 0.26);
  counter(bag, -0.56, -0.2, 0.3);
  bag.box('woodDk', 0.7, 0.1, 0.025, -0.76, 0.33, -0.195);   /* 招牌枋 */
  /* 东号：两层（F1 门脸 + F2 木栏挑廊） */
  shopBase(bag, 0.42, -0.5, 1.36, 0.64, 0.1);
  bag.box('brick', 1.3, 0.3, 0.58, 0.42, 0.25, -0.5, 0, 0, 0, SC.brick);
  bag.box('plaster', 1.22, 0.26, 0.5, 0.42, 0.57, -0.53, 0, 0, 0, SC.plaster);
  bag.tri('plaster', 0.5, 0.13, 0.42 - 0.66, 0.7, -0.5, 0);
  bag.tri('plaster', 0.5, 0.13, 0.42 + 0.66, 0.7, -0.5, 0);
  tileGable(bag, 0.42, 0.7, -0.5, 1.32, 0.68, 0.2, 0, false);
  plankDoor(bag, 0.1, 0.15, -0.2, 0.24, 0.26);
  counter(bag, 0.48, -0.2, 0.34);
  glassWin(bag, 0.78, 0.28, -0.2, 0.28, 0.18, 0);
  glassWin(bag, 0.42, 0.57, -0.27, 0.26, 0.18, 0);
  glassWin(bag, 0.72, 0.57, -0.27, 0.26, 0.18, 0);
  bag.box('wood', 0.9, 0.03, 0.12, 0.42, 0.45, -0.19, 0, 0, 0, SC.plank);  /* 挑廊板 */
  [[0.06], [0.26], [0.46], [0.66], [0.86]].forEach(function (rx) {
    bag.box('woodDk', 0.025, 0.12, 0.025, rx[0] + 0.06, 0.52, -0.14);
  });
  bag.box('woodDk', 0.94, 0.03, 0.03, 0.48, 0.585, -0.14);
  bag.oz = 0;
  /* 街面：货摊 + 杂料 + 电线杆 + 檐下灯笼 */
  stall(bag, -0.3, 0.35);
  stall(bag, 0.6, 0.42);
  crate(bag, -0.05, 0.6, 0.8);
  poleLine(bag, 1.08, 0.55);
  lantern(bag, -1.14, 0.42, -0.16 + OZ, 0.9);
  lantern(bag, -0.32, 0.42, -0.16 + OZ, 0.9);
  shrub(bag, -1.05, 0.75, 0.06);
  var glowM = glowMat(0.26);
  var gp = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.16), glowM);
  gp.position.set(0.78, BY(0.28), -0.19 + OZ); g.add(gp);
  g.userData.anim = [function (t) { glowM.emissiveIntensity = 0.18 + 0.12 * Math.sin(t * 1.3); }];
  bag.build(g, { lantern: lanternMat(g, 0.7) });
  g.userData.propId = 3; g.userData.level = 1;
  return g;
}

/* ---- lv2 2000s 个体户 ---- */
function stage2() {
  var g = new THREE.Group(); g.name = 'prop3m_lv2';
  var bag = new Bag();
  buildPlinth(bag);
  bag.oz = OZ;
  /* 西号：门脸漆新（red 檐下横匾）+ 红雨棚 */
  shopBase(bag, -0.72, -0.5, 1.0, 0.64, 0.1);
  bag.box('brick', 0.92, 0.3, 0.58, -0.72, 0.25, -0.5, 0, 0, 0, SC.brick);
  bag.tri('brick', 0.58, 0.15, -1.23, 0.4, -0.5, 0);
  bag.tri('brick', 0.58, 0.15, -0.21, 0.4, -0.5, 0);
  tileGable(bag, -0.72, 0.4, -0.5, 1.02, 0.78, 0.2, 0, false);
  bag.box('woodDk', 0.8, 0.06, 0.03, -0.72, 0.385, -0.195);
  glassWin(bag, -0.9, 0.27, -0.2, 0.32, 0.2, 0);
  plankDoor(bag, -0.55, 0.15, -0.2, 0.24, 0.26);
  counter(bag, -0.72, -0.19, 0.24);
  awning(bag, 'red', -0.9, 0.42, -0.185, 0.44, 0.2, 0.3);
  acUnit(bag, -1.0, 0.47, -0.55, PI / 2, 0);
  /* 东号：F2 灰砖化 + 屋顶双空调 + 二层红栏 */
  shopBase(bag, 0.42, -0.5, 1.36, 0.64, 0.1);
  bag.box('brick', 1.3, 0.3, 0.58, 0.42, 0.25, -0.5, 0, 0, 0, SC.brick);
  bag.box('brick', 1.22, 0.26, 0.5, 0.42, 0.57, -0.53, 0, 0, 0, SC.brick);
  bag.tri('brick', 0.5, 0.13, -0.24, 0.7, -0.5, 0);
  bag.tri('brick', 0.5, 0.13, 1.08, 0.7, -0.5, 0);
  tileGable(bag, 0.42, 0.7, -0.5, 1.32, 0.68, 0.2, 0, false);
  glassWin(bag, 0.12, 0.27, -0.2, 0.3, 0.2, 0);
  plankDoor(bag, 0.42, 0.15, -0.2, 0.24, 0.26);
  counter(bag, 0.66, -0.19, 0.3);
  glassWin(bag, 0.2, 0.57, -0.27, 0.26, 0.18, 0);
  glassWin(bag, 0.52, 0.57, -0.27, 0.26, 0.18, 0);
  acUnit(bag, 0.3, 0.79, -0.5, 0, 0);
  acUnit(bag, 0.88, 0.79, -0.55, PI / 2, 0);
  bag.box('wood', 0.9, 0.03, 0.12, 0.42, 0.45, -0.19, 0, 0, 0, SC.plank);
  [[0.06], [0.26], [0.46], [0.66], [0.86]].forEach(function (rx) {
    bag.box('column', 0.022, 0.12, 0.022, rx[0] + 0.06, 0.52, -0.14);
  });
  bag.box('column', 0.94, 0.03, 0.03, 0.48, 0.585, -0.14);
  bag.oz = 0;
  /* 街面：货摊加密 + 电线杆 + 灯笼 */
  stall(bag, -0.32, 0.38);
  stall(bag, 0.58, 0.44);
  crate(bag, -0.06, 0.62, 0.8);
  crate(bag, 0.86, 0.3, 0.7);
  poleLine(bag, 1.08, 0.55);
  /* 檐下灯笼 ×2 + 门脸横匾 + 竖幌 ×2 */
  lantern(bag, -1.14, 0.42, -0.16 + OZ, 0.9);
  lantern(bag, -0.32, 0.42, -0.16 + OZ, 0.9);
  var s0 = signMesh('烟袋斜街', 0.66, 0.085, { red: true });
  s0.position.set(0.42, BY(0.385), -0.175 + OZ); g.add(s0);
  var s1 = signMesh('烟袋', 0.075, 0.26, { vertical: true, red: true });
  s1.position.set(-1.16, BY(0.26), -0.17 + OZ); s1.rotation.y = -0.18; g.add(s1);
  var s2 = signMesh('布鞋', 0.075, 0.26, { vertical: true, red: true });
  s2.position.set(1.05, BY(0.26), -0.17 + OZ); s2.rotation.y = 0.18; g.add(s2);
  var glowM = glowMat(0.3);
  var gp = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.18), glowM);
  gp.position.set(0.12, BY(0.27), -0.19 + OZ); g.add(gp);
  g.userData.anim = [function (t) { glowM.emissiveIntensity = 0.22 + 0.13 * Math.sin(t * 1.5); }];
  bag.build(g, { lantern: lanternMat(g, 2.3) });
  g.userData.propId = 3; g.userData.level = 2;
  return g;
}

/* ---- lv3 2010s 整治改造 ---- */
function stage3() {
  var g = new THREE.Group(); g.name = 'prop3m_lv3';
  var bag = new Bag();
  buildPlinth(bag);
  bag.oz = OZ;
  /* 西号：抹灰翻新 + 玻璃阳光房 + 统一招牌 */
  shopBase(bag, -0.72, -0.5, 1.0, 0.64, 0.1);
  bag.box('brick', 0.92, 0.18, 0.58, -0.72, 0.19, -0.5, 0, 0, 0, SC.brick);
  bag.box('plaster', 0.92, 0.14, 0.03, -0.72, 0.35, -0.195, 0, 0, 0, SC.plaster);
  bag.tri('plaster', 0.58, 0.15, -1.23, 0.4, -0.5, 0);
  bag.tri('plaster', 0.58, 0.15, -0.21, 0.4, -0.5, 0);
  tileGable(bag, -0.72, 0.4, -0.5, 1.02, 0.78, 0.2, 0, false);
  sunroom(bag, -0.72, 0.6, -0.52, 0.6, 0.42, 0.16);
  glassWin(bag, -0.92, 0.27, -0.2, 0.34, 0.22, 0);
  plankDoor(bag, -0.55, 0.15, -0.2, 0.24, 0.26);
  counter(bag, -0.72, -0.19, 0.24);
  acUnit(bag, -1.02, 0.47, -0.6, PI / 2, 0.24);
  /* 东号 */
  shopBase(bag, 0.42, -0.5, 1.36, 0.64, 0.1);
  bag.box('brick', 1.3, 0.18, 0.58, 0.42, 0.19, -0.5, 0, 0, 0, SC.brick);
  bag.box('plaster', 1.3, 0.14, 0.03, 0.42, 0.35, -0.195, 0, 0, 0, SC.plaster);
  bag.box('brick', 1.22, 0.26, 0.5, 0.42, 0.57, -0.53, 0, 0, 0, SC.brick);
  bag.tri('brick', 0.5, 0.13, -0.24, 0.7, -0.5, 0);
  bag.tri('brick', 0.5, 0.13, 1.08, 0.7, -0.5, 0);
  tileGable(bag, 0.42, 0.7, -0.5, 1.32, 0.68, 0.2, 0, false);
  glassWin(bag, 0.14, 0.27, -0.2, 0.34, 0.22, 0);
  plankDoor(bag, 0.5, 0.15, -0.2, 0.24, 0.26);
  glassWin(bag, 0.82, 0.27, -0.2, 0.26, 0.18, 0);
  glassWin(bag, 0.2, 0.57, -0.27, 0.26, 0.18, 0);
  glassWin(bag, 0.52, 0.57, -0.27, 0.26, 0.18, 0);
  acUnit(bag, 0.88, 0.79, -0.55, PI / 2, 0);
  skylight(bag, 0.42, 0.905, -0.5, 0.5, 0.3);
  bag.oz = 0;
  /* 街面：花箱成列 + 路灯替换电杆 */
  planterBox(bag, -1.02, 0.4, false);
  planterBox(bag, -1.02, 0.72, false);
  planterBox(bag, 0.0, 0.45, false);
  planterBox(bag, 1.06, 0.42, false);
  planterBox(bag, 1.06, 0.74, false);
  tree(bag, -0.35, 0.7, 0.6);
  lampPost(bag, 0.62, 0.72);
  /* 统一深色招牌 ×2 + 竖挂 */
  var s1 = signMesh('烟袋斜街', 0.62, 0.095);
  s1.position.set(-0.72, BY(0.42), -0.175 + OZ); g.add(s1);
  var s2 = signMesh('老北京布鞋', 0.72, 0.095);
  s2.position.set(0.42, BY(0.42), -0.175 + OZ); g.add(s2);
  var s3 = signMesh('茶', 0.07, 0.22, { vertical: true });
  s3.position.set(1.045, BY(0.26), -0.16 + OZ); s3.rotation.y = PI / 2; g.add(s3);
  var glowM = glowMat(0.32);
  var gp1 = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.2), glowM); gp1.position.set(-0.92, BY(0.27), -0.19 + OZ); g.add(gp1);
  var gp2 = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.2), glowM); gp2.position.set(0.14, BY(0.27), -0.19 + OZ); g.add(gp2);
  g.userData.anim = [function (t) { glowM.emissiveIntensity = 0.26 + 0.12 * Math.sin(t * 1.6); }];
  bag.build(g);
  g.userData.propId = 3; g.userData.level = 3;
  return g;
}

/* ---- lv4 2020s 精品街区 ---- */
function stage4() {
  var g = new THREE.Group(); g.name = 'prop3m_lv4';
  var bag = new Bag();
  buildPlinth(bag);
  bag.oz = OZ;
  /* 西号：黑框幕墙门脸 + 屋面天窗 + 太阳房保留 */
  shopBase(bag, -0.72, -0.5, 1.0, 0.64, 0.1);
  bag.box('brick', 0.92, 0.16, 0.58, -0.72, 0.18, -0.5, 0, 0, 0, SC.brick);
  bag.box('plaster', 0.92, 0.12, 0.03, -0.72, 0.34, -0.195, 0, 0, 0, SC.plaster);
  bag.tri('plaster', 0.58, 0.15, -1.23, 0.4, -0.5, 0);
  bag.tri('plaster', 0.58, 0.15, -0.21, 0.4, -0.5, 0);
  tileGable(bag, -0.72, 0.4, -0.5, 1.02, 0.78, 0.2, 0, false);
  sunroom(bag, -0.72, 0.6, -0.52, 0.6, 0.42, 0.16);
  skylight(bag, -0.72, 0.605, -0.28, 0.3, 0.2);
  bag.box('glassDk', 0.74, 0.3, 0.03, -0.72, 0.2, -0.18);
  var i;
  for (i = 0; i <= 3; i++) {
    bag.box('dark', 0.03, 0.32, 0.045, -1.06 + i * 0.247, 0.2, -0.175);
  }
  bag.box('dark', 0.8, 0.03, 0.05, -0.72, 0.365, -0.175);
  /* 东号：黑框幕墙 + 屋顶露台（木平台+玻璃栏板+钢廊架） */
  shopBase(bag, 0.42, -0.5, 1.36, 0.64, 0.1);
  bag.box('brick', 1.3, 0.16, 0.58, 0.42, 0.18, -0.5, 0, 0, 0, SC.brick);
  bag.box('plaster', 1.3, 0.12, 0.03, 0.42, 0.34, -0.195, 0, 0, 0, SC.plaster);
  bag.box('brick', 1.24, 0.26, 0.5, 0.42, 0.57, -0.53, 0, 0, 0, SC.brick);
  bag.tri('brick', 0.5, 0.13, -0.24, 0.7, -0.5, 0);
  bag.tri('brick', 0.5, 0.13, 1.08, 0.7, -0.5, 0);
  tileGable(bag, 0.42, 0.7, -0.5, 1.32, 0.68, 0.2, 0, false);
  bag.box('glassDk', 1.14, 0.3, 0.03, 0.42, 0.2, -0.18);
  for (i = 0; i <= 5; i++) {
    bag.box('dark', 0.03, 0.32, 0.045, -0.12 + i * 0.272, 0.2, -0.175);
  }
  bag.box('dark', 1.2, 0.03, 0.05, 0.42, 0.365, -0.175);
  bag.box('wood', 1.28, 0.03, 0.54, 0.42, 0.715, -0.52, 0, 0, 0, SC.plank);
  glassRail(bag, 0.42, 0.73, -0.26, 1.24, true);
  pergola(bag, 0.42, 0.73, -0.68, 1.2, 0.44, 0.3);
  skylight(bag, -0.15, 0.91, -0.5, 0.3, 0.24);
  bag.oz = 0;
  /* 街面：双路灯 + 花箱 + 绿树 */
  lampPost(bag, -0.85, 0.72);
  lampPost(bag, 0.75, 0.75);
  planterBox(bag, -0.1, 0.5, false);
  planterBox(bag, 0.18, 0.55, false);
  tree(bag, -0.4, 0.72, 0.7);
  tree(bag, 1.05, 0.4, 0.62);
  shrub(bag, 1.1, 0.78, 0.07);
  /* 极简黑字招牌 + 小字号 */
  var s1 = signMesh('烟袋斜街', 0.66, 0.09, { bg: '#101317', frame: false, fg: '#e8e2d2' });
  s1.position.set(-0.72, BY(0.415), -0.175 + OZ); g.add(s1);
  var s2 = signMesh('YANDAI CAFE', 0.7, 0.085, { bg: '#101317', frame: false, fg: '#e8e2d2' });
  s2.position.set(0.42, BY(0.415), -0.175 + OZ); g.add(s2);
  var s3 = signMesh('咖啡', 0.07, 0.2, { vertical: true, bg: '#101317', frameColor: '#555b60' });
  s3.position.set(1.06, BY(0.26), -0.16 + OZ); s3.rotation.y = PI / 2; g.add(s3);
  /* 暖光内景 + 幕墙内呼吸（两项动画封顶） */
  var glowM = glowMat(0.34);
  var gp1 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.26), glowM); gp1.position.set(-0.72, BY(0.2), -0.165 + OZ); g.add(gp1);
  var gp2 = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.26), glowM); gp2.position.set(0.42, BY(0.2), -0.165 + OZ); g.add(gp2);
  g.userData.anim = [
    function (t) { glowM.emissiveIntensity = 0.28 + 0.1 * Math.sin(t * 1.7); },
    function (t) { glowM.emissiveIntensity += 0.02 * Math.sin(t * 9.2 + Math.sin(t * 2.3)); }
  ];
  bag.build(g);
  g.userData.propId = 3; g.userData.level = 4;
  return g;
}

/* ================= 7. 出口 ================= */
window.Props3DModern[3] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0));
  if (lv === 1) return stage1();
  if (lv === 2) return stage2();
  if (lv === 3) return stage3();
  return stage4();
};

})();
