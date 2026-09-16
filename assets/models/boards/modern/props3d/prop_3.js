/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/props3d/prop_3.js  格 3「烟袋斜街」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/prop_3.png 四象限（左上1990s / 右上2000s / 左下2010s / 右下2020s，
 * 同机位同角度——同一条街 40 年的生长史）。
 * 注册：window.Props3DModern[3](level 1..4) → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.6×2.6；底面 y=0；正面 +z；每级 mesh ≤55（按材质合并后 ~30）；
 *       Canvas 纹理 ≤256px；源码零 Math.random（mulberry32 种子流）；动画 ≤2 项/模型。
 *
 * 体量还原（对照参考图：一条 6-7 开间连排铺面 + 多重坡顶屋冠 + 厚条石台基）：
 *   西端角楼(两层重檐,全街制高点) + 中段两间单层铺面(脊高递减) + 东主楼(两层带披屋)
 *   + 东端铺面(2010s 止) → 2020s 拆建为黑框玻璃精品店 + 屋顶露台。
 * 年代特征：
 *   lv1 1990s 老街坊：青砖墙灰瓦坡顶、红柱木板门脸柜台、檐下红灯笼、门前货摊杂料、
 *        木电线杆、屋面烟囱/披屋
 *   lv2 2000s 个体户：红布雨棚、红底金字招牌+竖幌、屋顶空调外机+水箱、摊棚红布篷
 *   lv3 2010s 整治改造：角楼顶玻璃阳光房(钢肋分格)、统一深色底白字招牌、主楼屋面天窗、
 *        路灯替换木电杆、花箱成列、行道树
 *   lv4 2020s 精品街区：东端拆建黑框通高玻璃精品店+屋顶露台(木平台玻璃栏板钢廊架)、
 *        中段通高 shopfront 暖光内景、外摆座、串灯、绿植柱、双路灯、极简黑字招牌
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils）；
 * 坡顶自建棱柱几何(UV 按尺寸烘焙)；重檐=双棱柱交叉；圆柱 ≥12 段、球 ≥16×12。
 * 本轮变更：R1 结构重构——2 体量 → 6 开间连排 + 披屋 + 条石台基 + 屋冠加密；
 *           R2 材质/细节清偿（逐条见 R1 差距清单：瓦色压暗/砖石分缝/铺装缝/绿植层次等）。
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

/* ================= 1. Canvas 程序纹理（≤256px；基色 → 分缝 → 噪点/风化 → 高光/污痕） ================= */
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
function gray(v) { v = Math.max(0, Math.min(255, v | 0)); return 'rgb(' + v + ',' + v + ',' + v + ')'; }
/* 花岗岩条石台基：大块料石错缝 + 石面色差 + 倒角受光/阴影 + 斑点 + 根部水渍 */
function texStone() {
  return cvTex('ystone', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#7a7468'; g.fillRect(0, 0, w, h);
    var bh = 64, bw = 86, r, c, i;
    for (r = 0; r < 4; r++) {
      var off = (r % 2) * (bw / 2);
      for (c = -1; c < 4; c++) {
        var x = c * bw + off, y = r * bh, v = 0.86 + rnd() * 0.26;
        g.fillStyle = 'rgb(' + Math.round(158 * v) + ',' + Math.round(152 * v) + ',' + Math.round(140 * v) + ')';
        g.fillRect(x + 3, y + 3, bw - 6, bh - 6);
        g.fillStyle = 'rgba(255,252,240,0.2)'; g.fillRect(x + 3, y + 3, bw - 6, 3); g.fillRect(x + 3, y + 3, 3, bh - 6);
        g.fillStyle = 'rgba(28,26,22,0.32)'; g.fillRect(x + 3, y + bh - 6, bw - 6, 3); g.fillRect(x + bw - 6, y + 3, 3, bh - 6);
        if (rnd() < 0.5) { g.fillStyle = 'rgba(90,88,80,0.25)'; g.fillRect(x + 10 + ((rnd() * 50) | 0), y + 10 + ((rnd() * 30) | 0), 16 + ((rnd() * 24) | 0), 8 + ((rnd() * 16) | 0)); }
      }
    }
    speckle(g, w, h, rnd, 200, 'rgba(56,54,48,0.2)', 'rgba(226,222,210,0.22)', 4, 3);
    for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(48,50,46,0.18)'; g.fillRect((rnd() * w) | 0, h - 14 - ((rnd() * 20) | 0), 24 + ((rnd() * 50) | 0), 14); }
  });
}
/* 青砖墙：8 皮错缝 + 砖面色差 + 灰缝凹影/受光边 + 泛碱 + 檐下烟熏 + 根部苔痕 */
function texBrick() {
  return cvTex('ybrick', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#6e6a60'; g.fillRect(0, 0, w, h);
    var bh = 32, bw = 64, r, c, i;
    for (r = 0; r < 8; r++) {
      var off = (r % 2) * (bw / 2);
      for (c = -1; c < 5; c++) {
        var x = c * bw + off, y = r * bh, v = 0.86 + rnd() * 0.26;
        g.fillStyle = 'rgb(' + Math.round(140 * v) + ',' + Math.round(137 * v) + ',' + Math.round(128 * v) + ')';
        g.fillRect(x + 2, y + 2, bw - 4, bh - 4);
        g.fillStyle = 'rgba(255,250,240,0.16)'; g.fillRect(x + 2, y + 2, bw - 4, 2); g.fillRect(x + 2, y + 2, 2, bh - 4);
        g.fillStyle = 'rgba(30,28,24,0.3)'; g.fillRect(x + 2, y + bh - 4, bw - 4, 2); g.fillRect(x + bw - 4, y + 2, 2, bh - 4);
        if (rnd() < 0.18) { g.fillStyle = 'rgba(40,36,30,0.18)'; g.fillRect(x + 8 + ((rnd() * 30) | 0), y + 6, 10 + ((rnd() * 18) | 0), 6 + ((rnd() * 12) | 0)); }
      }
    }
    speckle(g, w, h, rnd, 120, 'rgba(60,56,48,0.16)', 'rgba(200,196,184,0.14)', 20, 10);
    for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(222,218,206,0.22)'; g.fillRect((rnd() * w) | 0, (rnd() * h * 0.5) | 0, 6 + ((rnd() * 10) | 0), 24 + ((rnd() * 46) | 0)); }
    for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(40,40,44,0.14)'; g.fillRect((rnd() * w) | 0, 0, 20 + ((rnd() * 40) | 0), 26); }
    g.fillStyle = 'rgba(70,90,50,0.16)'; g.fillRect(0, h - 22, w, 22);
  });
}
function texBrickRough() {
  return cvTex('ybrickR', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = gray(255); g.fillRect(0, 0, w, h);
    var r, c;
    for (r = 0; r < 8; r++) { var off = (r % 2) * 16; for (c = -1; c < 5; c++) { g.fillStyle = gray(200 + rnd() * 34); g.fillRect(c * 32 + off + 1, r * 16 + 1, 30, 14); } }
    speckle(g, w, h, rnd, 50, gray(180), gray(245), 6, 3);
  }, true);
}
/* 灰陶瓦屋面（压暗对齐参考）：瓦行 + 单瓦色差 + 瓦脊受光弧 + 竖向搭接暗缝 + 行口高光 + 地衣 */
function texTile() {
  return cvTex('ytile', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#43484d'; g.fillRect(0, 0, w, h);
    var y, x, row = 0, i;
    for (y = 0; y < h; y += 24, row++) {
      var off = (row % 2) * 16;
      for (x = -16; x < w; x += 32) {
        var v = 0.88 + rnd() * 0.24;
        g.fillStyle = 'rgb(' + Math.round(112 * v) + ',' + Math.round(118 * v) + ',' + Math.round(124 * v) + ')';
        g.fillRect(x + off + 2, y + 5, 28, 19);
        g.fillStyle = 'rgba(196,204,210,0.32)'; g.fillRect(x + off + 6, y + 6, 20, 3);
        g.fillStyle = 'rgba(16,20,24,0.6)'; g.fillRect(x + off, y, 3, 24);
      }
      g.fillStyle = '#2e343a'; g.fillRect(0, y, w, 4);
      g.fillStyle = 'rgba(160,170,176,0.28)'; g.fillRect(0, y + 5, w, 1);
    }
    speckle(g, w, h, rnd, 70, 'rgba(14,18,22,0.24)', 'rgba(130,140,148,0.18)', 18, 8);
    for (i = 0; i < 10; i++) {
      g.fillStyle = i % 3 ? 'rgba(110,120,66,0.3)' : 'rgba(140,130,56,0.24)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 3 + ((rnd() * 9) | 0), 3 + ((rnd() * 6) | 0));
    }
    g.fillStyle = 'rgba(190,196,200,0.32)'; g.fillRect(96 + ((rnd() * 64) | 0), 48 + ((rnd() * 96) | 0), 24, 8);
  });
}
/* 青石板路面（暖灰压暗 + 细缝密铺）：大板色差 + 倒角边 + 深缝 + 水渍 + 碎斑 */
function texPave() {
  return cvTex('ypave', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#45423a'; g.fillRect(0, 0, w, h);
    var r, c, s = 64;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.84 + rnd() * 0.28, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(130 * v) + ',' + Math.round(125 * v) + ',' + Math.round(113 * v) + ')';
      g.fillRect(x + 3, y + 3, s - 6, s - 6);
      g.fillStyle = 'rgba(255,252,244,0.2)'; g.fillRect(x + 3, y + 3, s - 6, 2); g.fillRect(x + 3, y + 3, 2, s - 6);
      g.fillStyle = 'rgba(30,28,24,0.35)'; g.fillRect(x + 3, y + s - 5, s - 6, 2); g.fillRect(x + s - 5, y + 3, 2, s - 6);
      if (rnd() < 0.35) { g.fillStyle = 'rgba(60,58,52,0.18)'; g.fillRect(x + 8 + ((rnd() * 20) | 0), y + 8 + ((rnd() * 20) | 0), 14 + ((rnd() * 24) | 0), 8 + ((rnd() * 16) | 0)); }
    }
    speckle(g, w, h, rnd, 140, 'rgba(80,76,68,0.2)', 'rgba(206,202,188,0.2)', 12, 6);
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
    g.fillStyle = '#d9d2bf'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 120, 'rgba(190,183,166,0.4)', 'rgba(240,235,222,0.5)', 26, 18);
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
/* 幕墙玻璃（明亮版，供阳光房/天窗）：竖向浅色反射带 + 细楼板线 + 高光条 */
function texGlass() {
  return cvTex('yglass', 128, 128, function (g, w, h) {
    for (var x = 0; x < w; x++) {
      var t = x / w, v = 0.82 + 0.16 * Math.sin(t * 6.283 * 1.5 + 0.6) + 0.04 * Math.sin(t * 40);
      g.fillStyle = 'rgb(' + Math.round(182 * v) + ',' + Math.round(204 * v) + ',' + Math.round(214 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    for (var y = 0; y < h; y += 32) { g.fillStyle = 'rgba(90,110,120,0.14)'; g.fillRect(0, y, w, 2); }
    g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(18, 0, 6, h); g.fillRect(84, 0, 3, h);
  });
}
/* 金属机壳：拉丝 + 碎斑 + 铆钉 + 底部锈痕 */
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
    g.fillStyle = '#a8a294'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 160, 'rgba(90,86,78,0.22)', 'rgba(236,232,222,0.24)', 3, 2);
    g.fillStyle = 'rgba(80,76,70,0.28)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    g.fillStyle = 'rgba(60,58,54,0.16)'; g.fillRect(0, h - 12, w, 12);
  });
}
/* 织物（雨棚）：经纬网 + 横向高光 */
function texWeave() {
  return cvTex('yweave', 64, 64, function (g, w, h) {
    g.fillStyle = '#e0e0e0'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < w; i += 4) { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
    for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, i * 11 + 3, w, 2); }
  });
}
/* 树冠叶斑：三层明暗叶簇（深底） */
function texLeaf() {
  return cvTex('yleaf', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#5f7c46'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 110; i++) {
      var v = rnd();
      g.fillStyle = v < 0.45 ? 'rgba(38,66,28,0.45)' : v < 0.8 ? 'rgba(140,176,94,0.5)' : 'rgba(196,212,134,0.38)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 4 + ((rnd() * 12) | 0), 3 + ((rnd() * 8) | 0));
    }
  });
}
/* 店内暖光陈列（map + emissiveMap）：层板 + 陈列物 + 顶灯 */
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
    stone:    M('#ffffff', { map: texStone(), rough: 0.92 }),
    pave:     M('#ffffff', { map: texPave(), rough: 1, roughMap: texPaveRough() }),
    conc:     M('#ffffff', { map: texConc(), rough: 0.9 }),
    brick:    M('#ffffff', { map: texBrick(), rough: 1, roughMap: texBrickRough(), ds: true }),
    plaster:  M('#ffffff', { map: texPlaster(), rough: 0.88, ds: true }),
    roof:     M('#d6d2c6', { map: texTile(), rough: 0.78, ds: true }),
    roofDk:   M('#a29c92', { map: texTile(), rough: 0.84, ds: true }),
    wood:     M('#ffffff', { map: texPlank(), rough: 0.72 }),
    woodDk:   M('#847258', { map: texPlank(), rough: 0.8 }),
    glass:    M('#ffffff', { map: texGlass(), rough: 0.12, metal: 0.3, tr: 0.42 }),
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

var SC = { brick: 2.2, tile: 2.6, pave: 2.2, plank: 2.8, plaster: 1.2, conc: 1.0, stone: 1.5 };

/* ================= 3. 按材质分桶合并（手写，r147 无 BufferGeometryUtils） ================= */
function Bag() { this.b = {}; }
Bag.prototype.put = function (key, geo, m) {
  var g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (m) g.applyMatrix4(m);
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
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 12), m4(x, y, z, rx, ry, rz, 1, 1, 1, order));
};
Bag.prototype.sph = function (key, r, x, y, z, ws, hs) {
  this.put(key, new THREE.SphereGeometry(r, ws || 16, hs || 12), m4(x, y, z));
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

/* ================= 5. 布局常量 & 预制构件（各年代共用 → 同一条街的生长） =================
 * 台基石板沙盘 2.5×2.0（z -0.98..+1.02，顶 y=0.10）；
 * 连排铺面沿 x：西端角楼(-1.23..-0.66) + 中段 W2(-0.64..-0.27) W3(-0.25..0.10)
 *               + 东主楼(0.12..0.74) + 东端铺面(0.76..1.14)；
 * 门脸朝 +z（角楼/主楼脸 z=-0.30，中段 z=-0.33）；街面 z -0.25..+0.95。
 */
var B = 0.10;   /* 台基顶 = 建筑室内地坪 */

/* 条石台基 + 石板铺面 + 路缘 */
function buildPlinth(bag) {
  bag.box('stone', 2.5, 0.08, 2.0, 0, 0.04, 0.02, 0, 0, 0, SC.stone);
  bag.box('pave', 2.42, 0.02, 1.92, 0, 0.09, 0.02, 0, 0, 0, SC.pave);
  bag.box('conc', 2.42, 0.022, 0.06, 0, 0.111, 0.97);
  bag.box('conc', 0.06, 0.022, 1.86, -1.14, 0.111, 0.02);
  bag.box('conc', 0.06, 0.022, 1.86, 1.14, 0.111, 0.02);
  bag.box('conc', 2.42, 0.022, 0.06, 0, 0.111, -0.95);
}
/* 硬山坡顶 + 正脊 + 檐口封板 */
function tileGable(bag, x, wallTop, z, w, d, rise, ry, dk) {
  bag.prism(dk ? 'roofDk' : 'roof', w, d, rise, x, wallTop, z, ry || 0);
  bag.box('roofDk', (ry ? d : w) + 0.05, 0.034, 0.078, x, wallTop + rise + 0.012, z, 0, ry || 0, 0, SC.tile);
  bag.box('roofDk', (ry ? d : w) + 0.04, 0.03, 0.02, x, wallTop + 0.008, z + (ry ? 0 : d / 2), 0, ry || 0, 0, SC.tile);
  bag.box('roofDk', (ry ? d : w) + 0.04, 0.03, 0.02, x, wallTop + 0.008, z - (ry ? 0 : d / 2), 0, ry || 0, 0, SC.tile);
}
/* 重檐腰檐（双棱柱交叉 → 四坡檐箍） */
function skirtRoof(bag, x, y, z, w, d, rise) {
  bag.prism('roof', w, d, rise, x, y, z, 0);
  bag.prism('roof', d - 0.07, w - 0.07, rise * 0.82, x, y + 0.004, z, PI / 2);
}
/* 歇山翘角（屋面端头起翘小板） */
function eaveFlip(bag, x, y, z, side) {
  bag.box('roofDk', 0.07, 0.016, 0.1, x, y, z, -0.18, 0, side * -0.5, SC.tile);
}
/* 红柱（檐廊）+ 柱础 */
function colRed(bag, x, y, z, h) {
  bag.cyl('column', 0.026, 0.03, h, x, y + h / 2, z);
  bag.cyl('stone', 0.038, 0.042, 0.024, x, y + 0.012, z, 0, 0, 0, 12);
  bag.box('woodDk', 0.075, 0.035, 0.075, x, y + h + 0.017, z);
}
/* 板门（含门槛石；mk 可换门板材质）/ 柜台 */
function plankDoor(bag, x, y, z, w, h, mk) {
  bag.box('stone', w + 0.08, 0.022, 0.1, x, y + 0.011, z + 0.02, 0, 0, 0, SC.stone);
  bag.box(mk || 'wood', w, h, 0.035, x, y + h / 2, z, 0, 0, 0, SC.plank);
  bag.box(mk === 'column' ? 'column' : 'woodDk', w + 0.05, 0.03, 0.05, x, y + h + 0.015, z);
}
function counter(bag, x, z, w) {
  bag.box('wood', w, 0.1, 0.17, x, B + 0.05, z, 0, 0, 0, SC.plank);
  bag.box('woodDk', w + 0.02, 0.014, 0.19, x, B + 0.108, z);
}
/* 木格窗 / 玻璃窗（框 + 台 + 竖棂；fk 可换框材） */
function glassWin(bag, x, y, z, w, h, ry, dk, fk) {
  fk = fk || (dk ? 'dark' : 'woodDk');
  var gk = dk ? 'glassDk' : 'glass';
  bag.box(gk, ry ? 0.02 : w, h, ry ? w : 0.02, x, y, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.035 : w + 0.03, 0.035, ry ? w + 0.03 : 0.035, x, y + h / 2, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.035 : w + 0.03, 0.035, ry ? w + 0.03 : 0.035, x, y - h / 2, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.035 : 0.035, h, ry ? 0.035 : 0.035, x + (ry ? 0 : w / 2), y, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.035 : 0.035, h, ry ? 0.035 : 0.035, x - (ry ? 0 : w / 2), y, z, 0, ry || 0, 0);
  bag.box(fk, ry ? 0.028 : 0.028, h, ry ? 0.028 : 0.028, x, y, z, 0, ry || 0, 0);
  if (!ry) bag.box('stone', w + 0.07, 0.018, 0.07, x, y - h / 2 - 0.024, z + 0.012, 0, 0, 0, SC.stone);
}
/* 通高 shopfront 玻璃（黑框幕墙门脸：玻璃 + 竖框 + 上下横档） */
function shopglass(bag, cx, w, y, z, h) {
  bag.box('glassDk', w, h, 0.03, cx, y, z);
  var n = Math.max(2, Math.round(w / 0.14)), i;
  for (i = 0; i <= n; i++) bag.box('dark', 0.026, h + 0.03, 0.046, cx - w / 2 + (w * i) / n, y, z);
  bag.box('dark', w + 0.04, 0.03, 0.05, cx, y + h / 2, z);
  bag.box('dark', w + 0.04, 0.03, 0.05, cx, y - h / 2, z);
}
/* 空调外机（格栅盘 + 轴毂 + 百叶 + 支架 + 滴水管） */
function acUnit(bag, x, y, z, ry, pipeLen) {
  ry = ry || 0;
  var cr = Math.cos(ry), sr = Math.sin(ry);
  function W(lx, lz) { return [x + lx * cr + lz * sr, z - lx * sr + lz * cr]; }
  bag.box('metal', 0.2, 0.13, 0.09, x, y, z, 0, ry, 0, 6);
  var f = W(-0.045, 0.05);
  bag.cyl('frame', 0.046, 0.046, 0.01, f[0], y, f[1], PI / 2, ry, 0, 16, 'YXZ');
  bag.cyl('metal', 0.012, 0.012, 0.016, f[0], y, f[1], PI / 2, ry, 0, 12, 'YXZ');
  var l = W(0.052, 0.05);
  bag.box('acFront', 0.085, 0.11, 0.008, l[0], y, l[1], 0, ry, 0, 10);
  var b1 = W(-0.06, -0.03), b2 = W(0.06, -0.03);
  bag.box('frame', 0.02, 0.15, 0.02, b1[0], y - 0.02, b1[1], 0, ry, 0);
  bag.box('frame', 0.02, 0.15, 0.02, b2[0], y - 0.02, b2[1], 0, ry, 0);
  if (pipeLen) {
    var p = W(-0.11, 0);
    bag.cyl('metal', 0.008, 0.008, pipeLen, p[0], y - pipeLen / 2 + 0.02, p[1], 0, 0, 0, 12);
  }
}
/* 布雨棚 */
function awning(bag, key, x, y, z, w, depth, ang) {
  bag.box(key, w, 0.014, depth, x, y, z + depth * 0.42, ang, 0, 0);
  bag.cyl('dark', 0.016, 0.016, w, x, y - 0.008, z + depth * 0.82, 0, 0, PI / 2, 12);
}
/* 红灯笼（穗 + 灯口 + 挂钩座） */
function lantern(bag, x, y, z, s) {
  s = s || 1;
  bag.cyl('dark', 0.006 * s, 0.006 * s, 0.035 * s, x, y + 0.016 * s, z, 0, 0, 0, 12);
  bag.sph('lantern', 0.055 * s, x, y - 0.045 * s, z);
  bag.cyl('metal', 0.022 * s, 0.03 * s, 0.016 * s, x, y + 0.004 * s, z, 0, 0, 0, 12);
  bag.cyl('metal', 0.018 * s, 0.024 * s, 0.014 * s, x, y - 0.095 * s, z, 0, 0, 0, 12);
  bag.cyl('lantern', 0.004 * s, 0.004 * s, 0.05 * s, x, y - 0.125 * s, z, 0, 0, 0, 12);
}
/* 货摊（折叠桌 + 布篷 + 果品） */
function stall(bag, x, z, canopy) {
  bag.box('wood', 0.36, 0.018, 0.26, x, B + 0.2, z, 0, 0, 0, SC.plank);
  bag.box('woodDk', 0.36, 0.18, 0.024, x, B + 0.1, z - 0.115);
  bag.box('woodDk', 0.36, 0.18, 0.024, x, B + 0.1, z + 0.115);
  bag.box('woodDk', 0.04, 0.16, 0.2, x - 0.16, B + 0.1, z);
  bag.box('woodDk', 0.04, 0.16, 0.2, x + 0.16, B + 0.1, z);
  bag.sph('orange', 0.03, x - 0.08, B + 0.245, z - 0.04);
  bag.sph('orange', 0.028, x - 0.04, B + 0.243, z - 0.02);
  bag.sph('green2', 0.027, x + 0.05, B + 0.242, z + 0.03);
  bag.box('cream', 0.04, 0.035, 0.04, x + 0.09, B + 0.238, z - 0.05);
  bag.box('wood', 0.16, 0.09, 0.12, x + 0.26, B + 0.05, z + 0.05, 0, 0.25, 0, SC.plank);
  if (canopy) {
    bag.cyl('woodDk', 0.012, 0.012, 0.5, x - 0.16, B + 0.25, z - 0.1, 0, 0, 0, 12);
    bag.cyl('woodDk', 0.012, 0.012, 0.5, x + 0.16, B + 0.25, z - 0.1, 0, 0, 0, 12);
    bag.box('red', 0.44, 0.01, 0.3, x, B + 0.53, z + 0.02, 0.22, 0, 0);
  }
}
function crate(bag, x, z, s) {
  s = s || 1;
  bag.box('wood', 0.14 * s, 0.1 * s, 0.11 * s, x, B + 0.05 * s, z, 0, 0.3 * (s - 1), 0, SC.plank);
}
/* 门前杂料堆（箩筐 + 果筐 + 叠筐） */
function goodsPile(bag, x, z) {
  bag.cyl('woodDk', 0.09, 0.075, 0.12, x, B + 0.06, z, 0, 0, 0, 12);
  bag.sph('orange', 0.032, x, B + 0.145, z);
  bag.sph('green2', 0.028, x + 0.05, B + 0.13, z + 0.03);
  crate(bag, x + 0.18, z + 0.06, 0.85);
  crate(bag, x - 0.05, z + 0.2, 0.7);
}
/* 花箱 */
function planterBox(bag, x, z, alongX) {
  bag.box('wood', alongX ? 0.3 : 0.14, 0.1, alongX ? 0.14 : 0.3, x, B + 0.05, z, 0, 0, 0, SC.plank);
  bag.sph('green', 0.05, x + (alongX ? -0.08 : 0), B + 0.13, z + (alongX ? 0 : -0.08));
  bag.sph('green2', 0.045, x + (alongX ? 0.08 : 0), B + 0.125, z + (alongX ? 0 : 0.08));
}
/* 行道树（干 + 主冠 + 三团侧冠，贴干自然形） */
function tree(bag, x, z, s) {
  bag.cyl('trunk', 0.024 * s, 0.038 * s, 0.4 * s, x, B + 0.2 * s, z, 0, 0, 0, 12);
  bag.sph('green', 0.23 * s, x, B + 0.5 * s, z);
  bag.sph('green2', 0.15 * s, x + 0.14 * s, B + 0.4 * s, z + 0.05 * s);
  bag.sph('green2', 0.13 * s, x - 0.13 * s, B + 0.44 * s, z - 0.04 * s);
  bag.sph('green', 0.12 * s, x + 0.02 * s, B + 0.66 * s, z - 0.02 * s);
}
/* 绿植柱（2020s 通高盆栽） */
function greenCol(bag, x, z, s) {
  bag.cyl('dark', 0.05 * s, 0.062 * s, 0.16 * s, x, B + 0.08 * s, z, 0, 0, 0, 12);
  bag.cyl('trunk', 0.009, 0.011, 0.42 * s, x, B + 0.3 * s, z, 0, 0, 0, 12);
  bag.sph('green', 0.06 * s, x, B + 0.24 * s, z);
  bag.sph('green2', 0.055 * s, x, B + 0.36 * s, z);
  bag.sph('green', 0.05 * s, x, B + 0.47 * s, z);
}
function shrub(bag, x, z, s) {
  bag.sph('green2', s, x, B + s * 0.7, z);
}
/* 路灯（细杆单臂 + 灯罩） */
function lampPost(bag, x, z, dir) {
  dir = dir || 1;
  bag.cyl('dark', 0.013, 0.018, 0.8, x, B + 0.4, z, 0, 0, 0, 12);
  bag.cyl('frame', 0.03, 0.036, 0.02, x, B + 0.012, z, 0, 0, 0, 12);
  bag.cyl('dark', 0.01, 0.01, 0.17, x + dir * 0.08, B + 0.79, z, 0, 0, PI / 2, 12);
  bag.cyl('dark', 0.024, 0.03, 0.03, x + dir * 0.16, B + 0.77, z, 0, 0, 0, 12);
  bag.sph('lampGlow', 0.026, x + dir * 0.16, B + 0.745, z);
}
/* 木电线杆（1990s 签名件：杆 + 横担 + 瓷瓶 + 线） */
function poleLine(bag, x, z) {
  bag.cyl('woodDk', 0.02, 0.028, 0.85, x, B + 0.425, z, 0, 0, 0, 12);
  bag.box('woodDk', 0.3, 0.025, 0.025, x, 0.87, z);
  bag.sph('cream', 0.013, x - 0.1, 0.897, z);
  bag.sph('cream', 0.013, x + 0.1, 0.897, z);
  bag.box('dark', 0.42, 0.006, 0.006, x - 0.23, 0.84, z + 0.02);
}
/* 玻璃阳光房（角楼屋面：基座 + 玻璃体 + 钢肋 + 顶圈） */
function sunroom(bag, x, y, z, w, d, h) {
  bag.box('conc', w + 0.07, 0.1, d + 0.07, x, y - 0.05, z, 0, 0, 0, SC.conc);
  bag.box('glass', w, h, d, x, y + h / 2, z);
  var n = 3, i;
  for (i = 0; i <= n; i++) {
    bag.box('frame', 0.014, h, 0.012, x - w / 2 + (w * i) / n, y + h / 2, z + d / 2);
    bag.box('frame', 0.014, h, 0.012, x - w / 2 + (w * i) / n, y + h / 2, z - d / 2);
  }
  bag.box('frame', 0.012, h, 0.012, x - w / 2, y + h / 2, z);
  bag.box('frame', 0.012, h, 0.012, x + w / 2, y + h / 2, z);
  bag.box('frame', w + 0.04, 0.02, d + 0.04, x, y + h + 0.006, z);
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
  var n = Math.max(2, Math.round(len / 0.28)), i;
  for (i = 0; i <= n; i++) {
    var t = -0.5 + i / n;
    bag.box('frame', 0.018, 0.145, 0.018, x + (alongX ? len * t : 0), y + 0.07, z + (alongX ? 0 : len * t));
  }
}
/* 钢廊架 */
function pergola(bag, x, y, z, w, d, h) {
  var i;
  [[-w / 2 + 0.03, -d / 2 + 0.03], [w / 2 - 0.03, -d / 2 + 0.03], [-w / 2 + 0.03, d / 2 - 0.03], [w / 2 - 0.03, d / 2 - 0.03]].forEach(function (c) {
    bag.box('frame', 0.03, h, 0.03, x + c[0], y + h / 2, z + c[1]);
  });
  bag.box('frame', w, 0.026, 0.042, x, y + h, z - d / 2 + 0.03);
  bag.box('frame', w, 0.026, 0.042, x, y + h, z + d / 2 - 0.03);
  for (i = 0; i <= 4; i++) {
    bag.box('wood', 0.042, 0.016, d, x - w / 2 + (w * i) / 4, y + h + 0.018, z, 0, 0, 0, SC.plank);
  }
}
/* 屋顶水箱 */
function tank(bag, x, y, z) {
  bag.cyl('metal', 0.05, 0.05, 0.1, x, y, z, 0, 0, 0, 12);
  bag.cyl('metal', 0.054, 0.054, 0.012, x, y + 0.055, z, 0, 0, 0, 12);
  bag.box('frame', 0.12, 0.02, 0.1, x, y - 0.06, z);
}
/* 外摆座（小圆桌 + 双椅） */
function seatSet(bag, x, z) {
  bag.cyl('dark', 0.014, 0.018, 0.2, x, B + 0.1, z, 0, 0, 0, 12);
  bag.cyl('woodDk', 0.06, 0.06, 0.018, x, B + 0.21, z, 0, 0, 0, 12);
  [[-0.13, 0], [0.13, 0.06]].forEach(function (c, i) {
    var cx = x + c[0], cz = z + c[1];
    bag.box('woodDk', 0.09, 0.014, 0.09, cx, B + 0.13, cz, 0, i * 0.3, 0, SC.plank);
    bag.box('woodDk', 0.09, 0.11, 0.014, cx, B + 0.19, cz + (i ? -0.04 : 0.04), i * 0.3, 0, 0, SC.plank);
    bag.box('dark', 0.07, 0.12, 0.07, cx, B + 0.06, cz);
  });
}
/* 檐下串灯（6 灯 + 垂弧） */
function stringLights(bag, x0, x1, y, z) {
  var n = 6, i;
  bag.cyl('dark', 0.004, 0.004, x1 - x0, (x0 + x1) / 2, y, z, 0, 0, PI / 2, 12);
  for (i = 0; i < n; i++) {
    var x = x0 + (x1 - x0) * (i + 0.5) / n;
    var drop = 0.02 + 0.03 * Math.sin((i + 0.5) / n * PI);
    bag.cyl('dark', 0.003, 0.003, 0.03, x, y - 0.015 - drop, z, 0, 0, 0, 12);
    bag.sph('lampGlow', 0.014, x, y - 0.045 - drop, z);
  }
}

/* ================= 6. 连排铺面骨架（四代共用 → 同一条街的生长） =================
 * o.w1col  西端角楼红柱门脸（1990s-2000s）
 * o.w2red  W2 红漆门脸翻新（2000s）
 * o.awn    红布雨棚（2000s）
 * o.e1f2   东主楼二层饰面 'plaster' | 'brick'
 * o.e1glass / o.w2glass / o.w3glass  黑框通高玻璃门脸（2020s）
 * o.e2new  东端拆建精品店 + 屋顶露台（2020s）
 */
function rowBuild(bag, o) {
  /* ---- 西端角楼（两层重檐，全街制高点 0.92+） ---- */
  bag.box('conc', 0.61, 0.035, 0.7, -0.945, B + 0.0175, -0.63, 0, 0, 0, SC.conc);   /* 勒脚 */
  bag.box('brick', 0.57, 0.34, 0.66, -0.945, B + 0.17, -0.63, 0, 0, 0, SC.brick);
  if (o.w1col) {
    colRed(bag, -1.19, B + 0.035, -0.272, 0.28);
    colRed(bag, -0.945, B + 0.035, -0.272, 0.28);
    colRed(bag, -0.7, B + 0.035, -0.272, 0.28);
    bag.box('woodDk', 0.55, 0.045, 0.05, -0.945, 0.435, -0.272);                    /* 檐枋 */
    plankDoor(bag, -1.09, B + 0.035, -0.283, 0.22, 0.24);
    counter(bag, -0.8, -0.25, 0.26);
    glassWin(bag, -0.71, 0.245, -0.283, 0.14, 0.15, 0);
  }
  skirtRoof(bag, -0.945, 0.455, -0.63, 0.62, 0.7, 0.075);
  bag.box(o.w1f2 || 'plaster', 0.52, 0.2, 0.6, -0.945, 0.54, -0.65, 0, 0, 0, SC.plaster);
  glassWin(bag, -1.05, 0.555, -0.345, 0.19, 0.13, 0);
  glassWin(bag, -0.84, 0.555, -0.345, 0.19, 0.13, 0);
  bag.box('wood', 0.5, 0.018, 0.11, -0.945, 0.472, -0.315, 0, 0, 0, SC.plank);      /* 二层木挑廊 */
  [[-1.14], [-1.06], [-0.98], [-0.9], [-0.82], [-0.75]].forEach(function (rx) {
    bag.box('woodDk', 0.018, 0.09, 0.018, rx[0], 0.525, -0.272);
  });
  bag.box('woodDk', 0.52, 0.02, 0.024, -0.945, 0.575, -0.272);
  tileGable(bag, -0.945, 0.64, -0.6, 0.59, 0.72, 0.28, 0);                          /* 前出檐 0.06 */
  bag.tri('brick', 0.72, 0.28, -1.235, 0.64, -0.6);
  bag.tri('brick', 0.72, 0.28, -0.655, 0.64, -0.6);
  eaveFlip(bag, -1.235, 0.655, -0.25, 1);
  eaveFlip(bag, -0.655, 0.655, -0.25, -1);
  eaveFlip(bag, -1.235, 0.655, -0.95, 1);
  eaveFlip(bag, -0.655, 0.655, -0.95, -1);
  /* ---- 中段 W2（单层，脊 0.56） ---- */
  bag.box('brick', 0.37, 0.3, 0.6, -0.455, B + 0.15, -0.63, 0, 0, 0, SC.brick);
  bag.box(o.w2red ? 'column' : 'woodDk', 0.39, 0.05, 0.035, -0.455, 0.415, -0.315);
  if (o.w2red) {
    plankDoor(bag, -0.53, B, -0.313, 0.22, 0.24, 'column');
    glassWin(bag, -0.34, 0.235, -0.313, 0.17, 0.16, 0, false, 'column');
    bag.box('column', 0.045, 0.3, 0.045, -0.635, 0.25, -0.31);
    bag.box('column', 0.045, 0.3, 0.045, -0.275, 0.25, -0.31);
  } else if (o.w2glass) {
    shopglass(bag, -0.455, 0.33, 0.25, -0.313, 0.26);
  } else {
    plankDoor(bag, -0.53, B, -0.313, 0.22, 0.24);
    glassWin(bag, -0.34, 0.235, -0.313, 0.17, 0.16, 0);
  }
  tileGable(bag, -0.455, 0.4, -0.61, 0.39, 0.66, 0.16, 0, o.w3dk);                 /* 前出檐，屋面色变 */
  bag.tri('brick', 0.66, 0.16, -0.64, 0.4, -0.61);
  bag.tri('brick', 0.66, 0.16, -0.27, 0.4, -0.61);
  /* ---- 中段 W3（单层，脊 0.53 递减） ---- */
  bag.box('brick', 0.35, 0.28, 0.58, -0.075, B + 0.14, -0.63, 0, 0, 0, SC.brick);
  bag.box('woodDk', 0.37, 0.045, 0.035, -0.075, 0.395, -0.325);
  if (o.w3glass) {
    shopglass(bag, -0.075, 0.31, 0.24, -0.323, 0.24);
  } else {
    glassWin(bag, -0.17, 0.225, -0.323, 0.17, 0.15, 0);
    plankDoor(bag, -0.02, B, -0.323, 0.2, 0.23);
  }
  tileGable(bag, -0.075, 0.38, -0.62, 0.37, 0.64, 0.15, 0, true);
  bag.tri('brick', 0.64, 0.15, -0.26, 0.38, -0.62);
  bag.tri('brick', 0.64, 0.15, 0.11, 0.38, -0.62);
  /* ---- 东主楼（两层，脊 0.94） + 披屋 ---- */
  bag.box('brick', 0.62, 0.36, 0.66, 0.43, B + 0.18, -0.63, 0, 0, 0, SC.brick);
  if (o.e1glass) {
    shopglass(bag, 0.43, 0.58, 0.25, -0.283, 0.3);
  } else {
    plankDoor(bag, 0.24, B, -0.283, 0.22, 0.25);
    glassWin(bag, 0.55, 0.245, -0.283, 0.24, 0.18, 0);
    counter(bag, 0.4, -0.25, 0.26);
  }
  bag.box('woodDk', 0.64, 0.05, 0.035, 0.43, 0.475, -0.285);
  bag.box('woodDk', 0.62, 0.025, 0.62, 0.43, 0.4625, -0.64);                        /* 楼层板带 */
  bag.box(o.e1f2, 0.58, 0.24, 0.58, 0.43, 0.58, -0.64, 0, 0, 0, o.e1f2 === 'plaster' ? SC.plaster : SC.brick);
  if (o.e1glassF2) {
    glassWin(bag, 0.28, 0.58, -0.345, 0.2, 0.15, 0, false, 'dark');
    glassWin(bag, 0.58, 0.58, -0.345, 0.2, 0.15, 0, false, 'dark');
  } else {
    glassWin(bag, 0.25, 0.58, -0.345, 0.17, 0.14, 0);
    glassWin(bag, 0.43, 0.58, -0.345, 0.17, 0.14, 0);
    glassWin(bag, 0.61, 0.58, -0.345, 0.17, 0.14, 0);
  }
  bag.box('wood', 0.56, 0.018, 0.1, 0.43, 0.4525, -0.3, 0, 0, 0, SC.plank);         /* 二层木挑廊 */
  [[0.2], [0.29], [0.38], [0.47], [0.56], [0.65]].forEach(function (rx) {
    bag.box('woodDk', 0.018, 0.085, 0.018, rx[0], 0.502, -0.262);
  });
  bag.box('woodDk', 0.58, 0.02, 0.024, 0.43, 0.549, -0.262);
  tileGable(bag, 0.43, 0.7, -0.6, 0.64, 0.72, 0.24, 0);                             /* 前出檐 0.06 */
  bag.tri('brick', 0.72, 0.24, 0.12, 0.7, -0.6);
  bag.tri('brick', 0.72, 0.24, 0.74, 0.7, -0.6);
  bag.box('brick', 0.07, 0.18, 0.07, 0.62, 0.86, -0.78, 0, 0, 0, SC.brick);         /* 烟囱 */
  bag.box('conc', 0.095, 0.02, 0.095, 0.62, 0.96, -0.78, 0, 0, 0, SC.conc);
  bag.cyl('woodDk', 0.025, 0.025, 0.28, 0.2, B + 0.14, -0.94, 0, 0, 0, 12);         /* 披屋 */
  bag.cyl('woodDk', 0.025, 0.025, 0.28, 0.66, B + 0.14, -0.94, 0, 0, 0, 12);
  bag.box('wood', 0.56, 0.016, 0.21, 0.43, 0.415, -0.88, -0.2, 0, 0, SC.plank);
  /* 柜台陈列（小盒罐/包袱，省三角预算） */
  bag.box('woodDk', 0.035, 0.045, 0.035, -0.86, 0.237, -0.25);
  bag.box('red', 0.05, 0.03, 0.04, -0.75, 0.23, -0.24, 0, 0.4, 0);
  bag.box('cream', 0.03, 0.04, 0.03, 0.36, 0.235, -0.25);
  /* ---- 东端铺面（单层，脊 0.56；2020s 拆建） ---- */
  if (!o.e2new) {
    bag.box('brick', 0.38, 0.3, 0.58, 0.95, B + 0.15, -0.63, 0, 0, 0, SC.brick);
    bag.box('woodDk', 0.4, 0.045, 0.035, 0.95, 0.415, -0.325);
    plankDoor(bag, 0.88, B, -0.323, 0.2, 0.23);
    glassWin(bag, 1.05, 0.225, -0.323, 0.16, 0.15, 0);
    tileGable(bag, 0.95, 0.4, -0.61, 0.4, 0.64, 0.16, 0);
    bag.tri('brick', 0.64, 0.16, 0.76, 0.4, -0.61);
    bag.tri('brick', 0.64, 0.16, 1.14, 0.4, -0.61);
  }
}

/* ================= 7. 四个年代（同一条街生长） ================= */

/* ---- lv1 1990s 老街坊 ---- */
function stage1() {
  var g = new THREE.Group(); g.name = 'prop3m_lv1';
  var bag = new Bag();
  g.userData.anim = [];
  buildPlinth(bag);
  rowBuild(bag, { w1col: true, e1f2: 'plaster' });
  /* 门框红对联（1990s 签名细节） */
  bag.box('column', 0.024, 0.2, 0.012, -1.215, 0.245, -0.281);
  bag.box('column', 0.024, 0.2, 0.012, -0.965, 0.245, -0.281);
  /* 街面：货摊 + 杂料 + 木电杆 + 檐下灯笼 */
  stall(bag, -0.35, 0.32, false);
  stall(bag, 0.55, 0.42, false);
  goodsPile(bag, -1.0, 0.45);
  goodsPile(bag, 0.16, 0.52);
  crate(bag, 0.88, 0.3, 0.7);
  poleLine(bag, 1.08, 0.62);
  lantern(bag, -1.16, 0.45, -0.262, 1.15);
  lantern(bag, -0.73, 0.45, -0.262, 1.15);
  shrub(bag, -1.16, 0.72, 0.06);
  /* 1990s 木底金字门匾 */
  var pa1 = signMesh('烟袋斜街', 0.46, 0.07, { bg: '#3d2c1e', fg: '#e8c545', frameColor: '#8a6a3c' });
  pa1.position.set(-0.945, 0.435, -0.243); g.add(pa1);
  var pa2 = signMesh('布鞋', 0.28, 0.065, { bg: '#3d2c1e', fg: '#e8c545', frameColor: '#8a6a3c' });
  pa2.position.set(-0.455, 0.415, -0.294); g.add(pa2);
  var glowM = glowMat(0.26);
  var gp = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.14), glowM);
  gp.position.set(0.55, 0.245, -0.269); g.add(gp);
  g.userData.anim.push(function (t) { glowM.emissiveIntensity = 0.18 + 0.12 * Math.sin(t * 1.3); });
  bag.build(g, { lantern: lanternMat(g, 0.7) });
  g.userData.propId = 3; g.userData.level = 1;
  return g;
}

/* ---- lv2 2000s 个体户 ---- */
function stage2() {
  var g = new THREE.Group(); g.name = 'prop3m_lv2';
  var bag = new Bag();
  g.userData.anim = [];
  buildPlinth(bag);
  rowBuild(bag, { w1col: true, w2red: true, e1f2: 'plaster' });
  /* 红布雨棚 + 屋顶空调 + 水箱 + 摊篷 */
  awning(bag, 'red', -0.34, 0.38, -0.3, 0.28, 0.18, 0.32);
  awning(bag, 'red', -0.17, 0.36, -0.31, 0.3, 0.18, 0.32);
  acUnit(bag, 0.3, 0.92, -0.72, 0, 0);
  acUnit(bag, -0.85, 0.85, -0.8, 0, 0);
  acUnit(bag, 1.16, 0.32, -0.5, PI / 2, 0.2);
  tank(bag, 0.58, 0.93, -0.7);
  stall(bag, -0.35, 0.32, true);
  stall(bag, 0.55, 0.42, false);
  goodsPile(bag, -1.0, 0.45);
  goodsPile(bag, 0.16, 0.52);
  crate(bag, 0.88, 0.3, 0.7);
  poleLine(bag, 1.08, 0.62);
  lantern(bag, -1.16, 0.45, -0.262, 1.15);
  lantern(bag, -0.945, 0.45, -0.262, 1.1);
  lantern(bag, -0.73, 0.45, -0.262, 1.15);
  /* 招牌：红底金字横匾 + 竖幌 */
  var s0 = signMesh('烟袋斜街', 0.5, 0.08, { red: true });
  s0.position.set(-0.945, 0.455, -0.243); g.add(s0);
  var s1 = signMesh('布鞋', 0.3, 0.07, { red: true });
  s1.position.set(-0.455, 0.44, -0.294); g.add(s1);
  var s2 = signMesh('烟袋', 0.07, 0.24, { vertical: true, red: true });
  s2.position.set(-1.2, 0.27, -0.24); s2.rotation.y = -0.2; g.add(s2);
  var s3 = signMesh('茶馆', 0.07, 0.24, { vertical: true, red: true });
  s3.position.set(1.13, 0.27, -0.3); s3.rotation.y = 0.2; g.add(s3);
  var glowM = glowMat(0.3);
  var gp = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.14), glowM);
  gp.position.set(0.55, 0.245, -0.269); g.add(gp);
  g.userData.anim.push(function (t) { glowM.emissiveIntensity = 0.22 + 0.13 * Math.sin(t * 1.5); });
  bag.build(g, { lantern: lanternMat(g, 2.3) });
  g.userData.propId = 3; g.userData.level = 2;
  return g;
}

/* ---- lv3 2010s 整治改造 ---- */
function stage3() {
  var g = new THREE.Group(); g.name = 'prop3m_lv3';
  var bag = new Bag();
  g.userData.anim = [];
  buildPlinth(bag);
  rowBuild(bag, { w1col: true, e1f2: 'plaster' });
  /* 角楼屋顶玻璃阳光房 + 主楼屋面天窗 + 保留空调 */
  sunroom(bag, -0.945, 0.9, -0.63, 0.3, 0.2, 0.15);
  skylight(bag, 0.3, 0.86, -0.74, 0.26, 0.18);
  acUnit(bag, 0.62, 0.92, -0.72, 0, 0);
  acUnit(bag, 1.16, 0.32, -0.5, PI / 2, 0.2);
  tank(bag, 0.58, 0.93, -0.7);
  /* 街面：花箱成列 + 行道树 + 路灯替换木电杆 */
  planterBox(bag, -1.06, 0.32, true);
  planterBox(bag, 0.12, 0.34, false);
  planterBox(bag, 1.08, 0.34, false);
  planterBox(bag, 0.68, 0.62, false);
  tree(bag, -0.42, 0.72, 0.62);
  lampPost(bag, 0.62, 0.74, 1);
  lantern(bag, -1.16, 0.45, -0.262, 1.15);
  lantern(bag, -0.945, 0.45, -0.262, 1.1);
  lantern(bag, -0.73, 0.45, -0.262, 1.15);
  /* 统一深色底白字招牌 */
  var s1 = signMesh('烟袋斜街', 0.5, 0.075);
  s1.position.set(-0.945, 0.452, -0.243); g.add(s1);
  var s2 = signMesh('老北京布鞋', 0.6, 0.075);
  s2.position.set(-0.265, 0.435, -0.3); g.add(s2);
  var s3 = signMesh('茶', 0.06, 0.2, { vertical: true });
  s3.position.set(1.12, 0.26, -0.3); g.add(s3);
  var glowM = glowMat(0.32);
  var gp1 = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.13), glowM); gp1.position.set(-0.34, 0.235, -0.293); g.add(gp1);
  var gp2 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.14), glowM); gp2.position.set(0.55, 0.245, -0.269); g.add(gp2);
  g.userData.anim.push(function (t) { glowM.emissiveIntensity = 0.26 + 0.12 * Math.sin(t * 1.6); });
  bag.build(g, { lantern: lanternMat(g, 1.2) });
  g.userData.propId = 3; g.userData.level = 3;
  return g;
}

/* ---- lv4 2020s 精品街区 ---- */
function stage4() {
  var g = new THREE.Group(); g.name = 'prop3m_lv4';
  var bag = new Bag();
  g.userData.anim = [];
  buildPlinth(bag);
  rowBuild(bag, { w1col: true, w2glass: true, w3glass: true, e1glass: true, e1f2: 'brick', e1glassF2: true, e2new: true });
  /* 东端精品店：黑框通高玻璃（含侧壁） + 屋顶露台（木平台 + 玻璃栏板 + 钢廊架） */
  bag.box('brick', 0.46, 0.36, 0.1, 0.99, 0.29, -0.89, 0, 0, 0, SC.brick);
  bag.box('glassDk', 0.03, 0.36, 0.56, 0.765, 0.29, -0.63, 0, 0, 0, SC.brick);
  bag.box('glassDk', 0.03, 0.36, 0.56, 1.215, 0.29, -0.63, 0, 0, 0, SC.brick);
  [[0.765, -0.36], [0.765, -0.9], [1.215, -0.36], [1.215, -0.9]].forEach(function (c) {
    bag.box('dark', 0.05, 0.72, 0.05, c[0], 0.46, c[1]);
  });
  bag.box('glassDk', 0.44, 0.36, 0.05, 0.99, 0.29, -0.315);
  [[0.8], [0.92], [1.06], [1.18]].forEach(function (rx) {
    bag.box('dark', 0.026, 0.38, 0.046, rx[0], 0.29, -0.315);
  });
  bag.box('dark', 0.48, 0.035, 0.06, 0.99, 0.12, -0.315);
  bag.box('dark', 0.48, 0.04, 0.64, 0.99, 0.5, -0.63);                              /* 楼板 */
  bag.box('brick', 0.46, 0.24, 0.1, 0.99, 0.64, -0.89, 0, 0, 0, SC.brick);
  bag.box('glassDk', 0.03, 0.24, 0.56, 0.765, 0.64, -0.63, 0, 0, 0, SC.brick);
  bag.box('glassDk', 0.03, 0.24, 0.56, 1.215, 0.64, -0.63, 0, 0, 0, SC.brick);
  bag.box('glassDk', 0.44, 0.24, 0.05, 0.99, 0.64, -0.315);
  [[0.8], [0.92], [1.06], [1.18]].forEach(function (rx) {
    bag.box('dark', 0.026, 0.26, 0.042, rx[0], 0.64, -0.315);
  });
  bag.box('dark', 0.48, 0.03, 0.05, 0.99, 0.795, -0.315);                           /* 女儿墙压顶 */
  bag.box('dark', 0.48, 0.03, 0.05, 0.99, 0.795, -0.945);
  bag.box('dark', 0.05, 0.03, 0.66, 0.765, 0.795, -0.63);
  bag.box('dark', 0.05, 0.03, 0.66, 1.215, 0.795, -0.63);
  bag.box('wood', 0.42, 0.025, 0.58, 0.99, 0.7875, -0.63, 0, 0, 0, SC.plank);       /* 露台木平台 */
  glassRail(bag, 0.99, 0.8, -0.295, 0.44, true);
  glassRail(bag, 1.2, 0.8, -0.62, 0.58, false);
  pergola(bag, 1.06, 0.8, -0.5, 0.34, 0.3, 0.26);
  bag.cyl('dark', 0.035, 0.042, 0.1, 0.86, 0.85, -0.42, 0, 0, 0, 12);               /* 露台盆栽 */
  bag.sph('green', 0.05, 0.86, 0.93, -0.42);
  bag.cyl('dark', 0.035, 0.042, 0.1, 1.12, 0.85, -0.84, 0, 0, 0, 12);
  bag.sph('green2', 0.05, 1.12, 0.93, -0.84);
  acUnit(bag, 0.85, 0.88, -0.82, PI, 0);
  acUnit(bag, 0.62, 0.92, -0.72, 0, 0);
  skylight(bag, 0.3, 0.86, -0.74, 0.26, 0.18);
  sunroom(bag, -0.945, 0.9, -0.63, 0.3, 0.2, 0.15);
  /* 街面：双路灯 + 绿植柱 + 行道树 + 花箱 + 外摆 + 串灯 */
  lampPost(bag, -0.8, 0.68, 1);
  lampPost(bag, 0.62, 0.74, -1);
  greenCol(bag, -1.12, 0.34, 1);
  greenCol(bag, 1.14, 0.42, 0.9);
  tree(bag, -0.42, 0.7, 0.64);
  planterBox(bag, -0.62, 0.4, false);
  planterBox(bag, 0.24, 0.38, false);
  seatSet(bag, -0.3, 0.62);
  stringLights(bag, -0.62, 0.08, 0.4, -0.29);
  lantern(bag, -1.16, 0.45, -0.262, 1.15);
  lantern(bag, -0.73, 0.45, -0.262, 1.15);
  /* 极简黑字招牌 */
  var s1 = signMesh('烟袋斜街', 0.46, 0.06, { bg: '#101317', frame: false, fg: '#e8e2d2' });
  s1.position.set(-0.945, 0.452, -0.243); g.add(s1);
  var s2 = signMesh('YANDAI CAFE', 0.6, 0.06, { bg: '#101317', frame: false, fg: '#e8e2d2' });
  s2.position.set(-0.265, 0.44, -0.288); g.add(s2);
  var s3 = signMesh('咖啡', 0.05, 0.18, { vertical: true, bg: '#101317', frameColor: '#555b60' });
  s3.position.set(0.79, 0.27, -0.288); g.add(s3);
  /* 暖光内景（玻璃门脸后） */
  var glowM = glowMat(0.34);
  var gp1 = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.22), glowM); gp1.position.set(-0.455, 0.25, -0.294); g.add(gp1);
  var gp2 = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 0.2), glowM); gp2.position.set(-0.075, 0.24, -0.304); g.add(gp2);
  var gp3 = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.26), glowM); gp3.position.set(0.43, 0.25, -0.264); g.add(gp3);
  var gp4 = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), glowM); gp4.position.set(0.99, 0.29, -0.286); g.add(gp4);
  g.userData.anim.push(function (t) { glowM.emissiveIntensity = 0.28 + 0.1 * Math.sin(t * 1.7); });
  bag.build(g, { lantern: lanternMat(g, 3.1) });
  g.userData.propId = 3; g.userData.level = 4;
  return g;
}

/* ================= 8. 出口 ================= */
window.Props3DModern[3] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0));
  if (lv === 1) return stage1();
  if (lv === 2) return stage2();
  if (lv === 3) return stage3();
  return stage4();
};

})();
