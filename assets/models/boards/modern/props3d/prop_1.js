/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/props3d/prop_1.js  格 1「南锣鼓巷」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/prop_1.png 四象限（左上1990s / 右上2000s / 左下2010s / 右下2020s，
 * 同机位同角度——北京胡同院落同一块地 40 年的生长史）。相机 45° 自 (+x,+y,+z)：
 * +z=临街正面（下左沿）、+x=临街侧面（下右沿），两面临街与参考一致。
 *
 * 注册：window.Props3DModern[1](level 1..4) → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.6×2.6；底面 y=0；正面 +z；每级 mesh ≤55（按材质合并：材质桶 ≤29 + glow 1 + 招牌 ≤3）；
 *       Canvas 纹理 ≤256px；源码零 Math.random（mulberry32 种子流）；动画 ≤2 项（暖窗呼吸/霓虹）。
 * 高度带（组冒烟）：lv1 [0.55,1.2] lv2 [0.6,1.25] lv3 [0.7,1.35] lv4 [0.85,1.4]。
 *
 * 固定语汇（8 体量院落骨架，对照参考逐象限）：
 *   正房 A(0.1,-0.68 西)＋双耳房 B/Cc＋东西厢 D/E＋倒座 F/H＋门楼 G（更高、独立瓦顶），
 *   院心槐树逐级长大；两面临街人行道（+z/+x）+ 路缘石 + 铺装。
 *
 * 年代特征：
 *   lv1 1990s 居民大院：全灰砖瓦、朱红棂格纸窗、红门门墩台阶、影壁、晾衣绳/水缸/煤堆/石凳、
 *        老式水泥路灯、电线杆+电线、烟囱、院树
 *   lv2 2000s 临街首商：白瓷砖面玻璃橱窗+条纹/红布雨棚、横匾招牌+竖挂幌子、空调外机、
 *        太阳能热水器、卫星锅、天窗、现代路灯、行道树+树坑、条凳/垃圾桶/花箱
 *   lv3 2010s 文创改造：倒座西整块玻璃坡顶（分格）、倒座东加二层（暖窗）、整排玻璃门脸、
 *        金属雨棚、藤蔓、花箱列、外摆咖啡座、挡车柱
 *   lv4 2020s 全新运营：正房平屋顶露台（木平台+玻璃栏板+廊架藤蔓+伞座桌椅+楼梯间）、
 *        东北角钢结构玻璃大厅（分格幕墙+玻璃两坡顶）、西厢屋顶太阳能板阵、
 *        黑框通高幕墙+暖光内景、门楼匾额+霓虹字号、外摆伞座
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils）；
 *   屋面自建棱柱 + 正脊/吻/垂脊/檐口封板（椽头纹理）/滴水线/檐下椽子；硬山山墙随坡；
 *   树冠为 16×12 球体确定性形变（sin 域函数抖动，接缝无裂）；文字招牌独立 Canvas mesh；
 *   暖光内景经 'glow' 桶合并为每级 1 mesh（override 材质供呼吸动画）。
 * 本轮精修（65→90 分三轮）：
 *   R1 结构：重排 8 体量布局贴合参考（正房+双耳房+东西厢+倒座×2+独立门楼）；屋面全套脊线/檐口；
 *      朱红棂格窗/红门/门墩/台阶/影壁；两面临街铺装+路缘；逐年代街道家具与屋面设备；
 *      树冠形变；玻璃大厅/屋顶露台/太阳能板阵。
 *   R2 材质细节：玻璃 metalness 0.85→0.3（无环境贴图下不再反射成黑盒，暖光内景可见）；
 *      玻璃大厅 +x 面误置实心板改为横梃；瓦纹 12 垄/贴加粗提亮；砖色压深；叶斑增强；
 *      檐下椽子（可见檐面）；屋面苔斑；卫星锅加支架；自行车架/公用电话/灯串/菜单牌/井盖；
 *      lv4 院树前移露出露台。
 *   R3 收尾：次要体量旧瓦分色 roofDk；院角自建库房（lv1/lv2，lv3 改造拆除）；耳房烟囱；
 *      lv2 门楼灯笼；椽尾收进檐口。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[boards/modern/prop_1] THREE 未定义，请先加载 three.min.js (r147)');
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
function gray(v) { v = Math.max(0, Math.min(255, v | 0)); return 'rgb(' + v + ',' + v + ',' + v + ')'; }
function rgbv(r, g, b, v) { return 'rgb(' + Math.round(r * v) + ',' + Math.round(g * v) + ',' + Math.round(b * v) + ')'; }

/* 灰砖墙：12 皮错缝 + 砖面色差/斑 + 浅灰缝 + 泛碱 + 檐下烟熏 + 根部苔痕 */
function texBrick() {
  return cvTex('mbrick', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#96938b'; g.fillRect(0, 0, w, h);
    var bh = h / 12, bw = w / 6, r, c, i;
    for (r = 0; r < 12; r++) {
      var off = (r % 2) * (bw / 2), y = r * bh;
      for (c = -1; c < 7; c++) {
        var x = c * bw + off, v = 0.86 + rnd() * 0.26;
        g.fillStyle = rgbv(110, 109, 104, v);
        g.fillRect(x + 1.5, y + 1.5, bw - 3, bh - 3);
        g.fillStyle = 'rgba(255,252,246,0.13)'; g.fillRect(x + 1.5, y + 1.5, bw - 3, 1.5);
        g.fillStyle = 'rgba(16,16,16,0.32)'; g.fillRect(x + 1.5, y + bh - 3, bw - 3, 1.5);
        if (rnd() < 0.22) { g.fillStyle = 'rgba(40,36,32,0.18)'; g.fillRect(x + 4 + ((rnd() * 18) | 0), y + 4, 8 + ((rnd() * 14) | 0), 5 + ((rnd() * 8) | 0)); }
      }
    }
    speckle(g, w, h, rnd, 140, 'rgba(60,56,50,0.14)', 'rgba(215,212,204,0.14)', 14, 6);
    for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(225,222,212,0.2)'; g.fillRect((rnd() * w) | 0, (rnd() * h * 0.5) | 0, 5 + ((rnd() * 8) | 0), 20 + ((rnd() * 40) | 0)); }
    g.fillStyle = 'rgba(30,32,36,0.14)'; g.fillRect(0, 0, w, 14);
    g.fillStyle = 'rgba(70,88,52,0.18)'; g.fillRect(0, h - 18, w, 18);
  });
}
function texBrickRough() {
  return cvTex('mbrickR', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = gray(255); g.fillRect(0, 0, w, h);
    var r, c;
    for (r = 0; r < 12; r++) { var off = (r % 2) * 16; for (c = -1; c < 5; c++) { g.fillStyle = gray(205 + rnd() * 30); g.fillRect(c * 32 + off + 1, r * 16 + 1, 30, 14); } }
    speckle(g, w, h, rnd, 50, gray(180), gray(245), 6, 3);
  }, true);
}
/* 灰陶瓦屋面：筒瓦垄（受光弧+暗槽）竖向顺坡 + 横向搭接 + 地衣/破瓦亮片；12 垄/贴 */
function texTile() {
  return cvTex('mtile', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#4e545a'; g.fillRect(0, 0, w, h);
    var cw = 21.33, x, y, i, col;
    for (col = 0; col < 12; col++) {
      x = col * cw;
      var v = 0.9 + rnd() * 0.2;
      g.fillStyle = rgbv(112, 118, 124, v); g.fillRect(x + 2, 0, cw - 4, h);              /* 板瓦凹槽 */
      g.fillStyle = 'rgba(0,0,0,0.22)'; g.fillRect(x + 2, 0, 3, h);                          /* 槽内阴影 */
      g.fillStyle = rgbv(178, 184, 190, v); g.fillRect(x + cw - 8, 0, 7, h);                /* 筒瓦垄受光 */
      g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(x + cw - 7, 0, 2.5, h);            /* 垄顶高光 */
      g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(x + cw - 1.5, 0, 1.5, h);                 /* 垄根投影 */
    }
    for (y = 0; y < h; y += 21.33) {                                                          /* 搭接口 */
      g.fillStyle = 'rgba(18,22,26,0.42)'; g.fillRect(0, y, w, 2.5);
      g.fillStyle = 'rgba(215,220,226,0.2)'; g.fillRect(0, y + 2.5, w, 1);
    }
    speckle(g, w, h, rnd, 50, 'rgba(24,28,32,0.18)', 'rgba(176,184,192,0.12)', 8, 4);
    for (i = 0; i < 12; i++) {
      g.fillStyle = i % 3 ? 'rgba(118,128,68,0.28)' : 'rgba(158,148,78,0.2)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 3 + ((rnd() * 8) | 0), 3 + ((rnd() * 5) | 0));
    }
    g.fillStyle = 'rgba(214,218,222,0.3)'; g.fillRect(96 + ((rnd() * 64) | 0), 48 + ((rnd() * 96) | 0), 18, 6);
  });
}
/* 院心青砖十字缝地 + 苔斑 */
function texCourt() {
  return cvTex('mcourt', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#5d6166'; g.fillRect(0, 0, w, h);
    var s = 32, r, c;
    for (r = 0; r < 8; r++) for (c = 0; c < 8; c++) {
      var x = c * s, y = r * s, v = 0.86 + rnd() * 0.26, horiz = (r + c) % 2 === 0;
      g.fillStyle = rgbv(126, 130, 134, v);
      if (horiz) { g.fillRect(x + 2, y + 2, s - 4, s / 2 - 3); g.fillRect(x + 2, y + s / 2 + 1, s - 4, s / 2 - 3); }
      else { g.fillRect(x + 2, y + 2, s / 2 - 3, s - 4); g.fillRect(x + s / 2 + 1, y + 2, s / 2 - 3, s - 4); }
      if (rnd() < 0.25) { g.fillStyle = 'rgba(88,108,66,0.25)'; g.fillRect(x + 2, y + 2, 6 + ((rnd() * 14) | 0), 4 + ((rnd() * 8) | 0)); }
    }
    speckle(g, w, h, rnd, 120, 'rgba(40,42,46,0.16)', 'rgba(192,198,202,0.14)', 8, 4);
  });
}
/* 人行道青石板 6×6 */
function texPave() {
  return cvTex('mpave', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#7e7b74'; g.fillRect(0, 0, w, h);
    var s = w / 6, r, c;
    for (r = 0; r < 6; r++) for (c = 0; c < 6; c++) {
      var v = 0.88 + rnd() * 0.22, x = c * s, y = r * s;
      g.fillStyle = rgbv(186, 182, 172, v);
      g.fillRect(x + 2, y + 2, s - 4, s - 4);
      g.fillStyle = 'rgba(255,252,244,0.2)'; g.fillRect(x + 2, y + 2, s - 4, 1.5); g.fillRect(x + 2, y + 2, 1.5, s - 4);
      g.fillStyle = 'rgba(40,38,34,0.28)'; g.fillRect(x + 2, y + s - 3.5, s - 4, 1.5); g.fillRect(x + s - 3.5, y + 2, 1.5, s - 4);
      if (rnd() < 0.3) { g.fillStyle = 'rgba(70,66,60,0.13)'; g.fillRect(x + 6 + ((rnd() * 14) | 0), y + 6 + ((rnd() * 14) | 0), 10 + ((rnd() * 16) | 0), 6 + ((rnd() * 12) | 0)); }
    }
    speckle(g, w, h, rnd, 160, 'rgba(110,106,96,0.16)', 'rgba(236,232,222,0.16)', 8, 4);
  });
}
function texPaveRough() {
  return cvTex('mpaveR', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = gray(255); g.fillRect(0, 0, w, h);
    var r, c;
    for (r = 0; r < 6; r++) for (c = 0; c < 6; c++) { g.fillStyle = gray(198 + rnd() * 34); g.fillRect(c * 21 + 1, r * 21 + 1, 19, 19); }
    speckle(g, w, h, rnd, 60, gray(170), gray(240), 6, 3);
  }, true);
}
/* 白灰墙面（2000s 瓷砖感） */
function texPlaster() {
  return cvTex('mplaster', 256, 256, function (g, w, h, rnd) {
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
  });
}
/* 幕墙玻璃 */
function texGlass() {
  return cvTex('mglass', 128, 128, function (g, w, h) {
    for (var x = 0; x < w; x++) {
      var t = x / w, v = 0.72 + 0.22 * Math.sin(t * 6.283 * 1.5 + 0.6) + 0.06 * Math.sin(t * 40);
      g.fillStyle = 'rgb(' + Math.round(150 * v) + ',' + Math.round(178 * v) + ',' + Math.round(190 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    for (var y = 0; y < h; y += 32) { g.fillStyle = 'rgba(40,52,60,0.2)'; g.fillRect(0, y, w, 2); }
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(18, 0, 6, h); g.fillRect(84, 0, 3, h);
  });
}
function texMetal() {
  return cvTex('mmetal', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#b4babe'; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 2) { g.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(70,76,80,0.14)'; g.fillRect(0, y, w, 1); }
    speckle(g, w, h, rnd, 30, 'rgba(60,66,70,0.3)', 'rgba(240,244,246,0.4)', 3, 2);
    g.fillStyle = 'rgba(120,90,50,0.22)'; g.fillRect(0, h - 10, w, 10);
  });
}
function texMetalRough() {
  return cvTex('mmetalR', 64, 64, function (g, w, h, rnd) {
    g.fillStyle = gray(110); g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 2) { g.fillStyle = gray(90 + rnd() * 60); g.fillRect(0, y, w, 1); }
    g.fillStyle = gray(200); g.fillRect(0, h - 5, w, 5);
  }, true);
}
function texLouver() {
  return cvTex('mlouver', 64, 64, function (g, w, h) {
    g.fillStyle = '#6e757b'; g.fillRect(0, 0, w, h);
    for (var y = 0; y < h; y += 6) {
      g.fillStyle = '#2c3237'; g.fillRect(0, y, w, 3);
      g.fillStyle = 'rgba(220,226,230,0.35)'; g.fillRect(0, y + 3, w, 1);
    }
    g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, 0, 3, h); g.fillRect(w - 3, 0, 3, h);
  });
}
function texConc() {
  return cvTex('mconc', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#b3ada0'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 160, 'rgba(90,86,78,0.22)', 'rgba(236,232,222,0.24)', 3, 2);
    g.fillStyle = 'rgba(80,76,70,0.28)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    g.fillStyle = 'rgba(60,58,54,0.16)'; g.fillRect(0, h - 12, w, 12);
  });
}
function texWeave() {
  return cvTex('mweave', 64, 64, function (g, w, h) {
    g.fillStyle = '#e0e0e0'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < w; i += 4) { g.fillStyle = 'rgba(0,0,0,0.16)'; g.fillRect(i, 0, 1, h); g.fillRect(0, i, w, 1); }
    for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(0, i * 11 + 3, w, 2); }
  });
}
/* 条纹雨棚布（2000s 条纹棚，白底蓝条，材质 color 染色） */
function texStripe() {
  return cvTex('mstripe', 64, 64, function (g, w, h) {
    g.fillStyle = '#f2f2ee'; g.fillRect(0, 0, w, h);
    for (var x = 0; x < w; x += 16) { g.fillStyle = '#4a6c96'; g.fillRect(x, 0, 8, h); }
    for (var i = 0; i < h; i += 3) { g.fillStyle = 'rgba(0,0,0,0.07)'; g.fillRect(0, i, w, 1); }
  });
}
/* 太阳能板（深蓝 + 银格） */
function texSolar() {
  return cvTex('msolar', 64, 64, function (g, w, h) {
    g.fillStyle = '#1b2742'; g.fillRect(0, 0, w, h);
    for (var x = 0; x < w; x += 16) { g.fillStyle = '#9fb0c8'; g.fillRect(x, 0, 1.5, h); g.fillRect(0, x, w, 1.5); }
    g.fillStyle = 'rgba(120,160,220,0.2)'; g.fillRect(0, 0, w, 18);
  });
}
/* 木板 */
function texPlank() {
  return cvTex('mplank', 256, 256, function (g, w, h, rnd) {
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
/* 檐口椽头（圆椽头 + 封板暗底） */
function texEave() {
  return cvTex('meave', 64, 16, function (g, w, h) {
    g.fillStyle = '#463d33'; g.fillRect(0, 0, w, h);
    for (var x = 0; x < w; x += 8) {
      g.fillStyle = '#8b7a62'; g.fillRect(x + 1.5, 3, 5, 10);
      g.fillStyle = '#a89778'; g.fillRect(x + 2, 3, 3.5, 3);
      g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(x + 2, 11, 4.5, 2);
    }
  });
}
/* 树冠叶斑（三层明暗叶簇 + 枝隙暗斑，增强簇感） */
function texLeaf() {
  return cvTex('mleaf', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#7a985a'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 130; i++) {
      var v = rnd();
      g.fillStyle = v < 0.42 ? 'rgba(38,66,28,0.55)' : v < 0.72 ? 'rgba(146,184,96,0.55)' : v < 0.9 ? 'rgba(206,222,146,0.42)' : 'rgba(24,40,18,0.6)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 4 + ((rnd() * 12) | 0), 3 + ((rnd() * 8) | 0));
    }
  });
}
/* 店内暖光陈列 */
function texInterior() {
  return cvTex('minterior', 128, 64, function (g, w, h, rnd) {
    g.fillStyle = '#f2d9a8'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(90,60,30,0.45)'; for (var y = 12; y < h; y += 16) g.fillRect(6, y, w - 12, 3);
    for (var i = 0; i < 18; i++) { g.fillStyle = i % 3 ? 'rgba(120,80,40,0.5)' : 'rgba(60,90,120,0.45)'; g.fillRect(8 + ((rnd() * (w - 20)) | 0), 6 + (i % 3) * 16, 5 + ((rnd() * 6) | 0), 7); }
    g.fillStyle = 'rgba(255,250,230,0.9)'; g.fillRect(20, 2, 10, 3); g.fillRect(70, 2, 10, 3); g.fillRect(105, 2, 8, 3);
  });
}

/* ================= 2. 材质 ================= */
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
    pave:     M('#ffffff', { map: texPave(), rough: 1, roughMap: texPaveRough() }),
    court:    M('#ffffff', { map: texCourt(), rough: 0.95 }),
    conc:     M('#ffffff', { map: texConc(), rough: 0.9 }),
    stone:    M('#8c8880', { map: texConc(), rough: 0.95 }),
    brick:    M('#ffffff', { map: texBrick(), rough: 1, roughMap: texBrickRough(), ds: true }),
    plaster:  M('#ffffff', { map: texPlaster(), rough: 0.88, ds: true }),
    roof:     M('#ffffff', { map: texTile(), rough: 0.8, ds: true }),
    roofDk:   M('#b9bec4', { map: texTile(), rough: 0.84, ds: true }),
    ridge:    M('#40444a', { rough: 0.85 }),
    eave:     M('#ffffff', { map: texEave(), rough: 0.8 }),
    wood:     M('#ffffff', { map: texPlank(), rough: 0.72 }),
    woodDk:   M('#6b5a48', { map: texPlank(), rough: 0.8 }),
    woodRed:  M('#a63d2c', { map: texPlank(), rough: 0.7 }),
    cream:    M('#efe7d2', { rough: 0.9 }),
    glass:    M('#ffffff', { map: texGlass(), rough: 0.08, metal: 0.3, tr: 0.45 }),
    glassDk:  M('#8fa2aa', { map: texGlass(), rough: 0.12, metal: 0.4, tr: 0.58 }),
    metal:    M('#ffffff', { map: texMetal(), rough: 1, roughMap: texMetalRough(), metal: 0.7 }),
    acFront:  M('#ffffff', { map: texLouver(), rough: 0.6, metal: 0.45 }),
    frame:    M('#2e3338', { rough: 0.5, metal: 0.5 }),
    green:    M('#ffffff', { map: texLeaf(), rough: 0.95 }),
    green2:   M('#a9b894', { map: texLeaf(), rough: 0.95 }),
    trunk:    M('#8c7050', { map: texPlank(), rough: 0.9 }),
    red:      M('#c04332', { map: texWeave(), rough: 0.8 }),
    blue:     M('#ffffff', { map: texStripe(), rough: 0.8 }),
    dark:     M('#22262b', { rough: 0.65, metal: 0.2 }),
    lampGlow: M('#fff1c8', { rough: 0.5, emissive: '#ffd27a', ei: 0.9 }),
    solar:    M('#ffffff', { map: texSolar(), rough: 0.3, metal: 0.5 }),
    white:    M('#f2efe8', { rough: 0.85 })
  };
  return MATS;
}

var SC = { brick: 3.0, tile: 2.0, pave: 0.9, court: 2.0, plank: 2.8, plaster: 1.2, conc: 1.0 };

/* ================= 3. 按材质分桶合并 ================= */
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
/* 局部(lx,lz) 绕 y 转 ry 后的世界偏移 */
function L(x, z, ry, lx, lz) {
  var c = Math.cos(ry || 0), s = Math.sin(ry || 0);
  return [x + lx * c + lz * s, z - lx * s + lz * c];
}
function boxUV(g, w, h, d, su, sv) {
  sv = sv === undefined ? su : sv;
  var uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (var f = 0; f < 6; f++) for (var v = 0; v < 4; v++) {
    var i = f * 4 + v;
    uv.setXY(i, uv.getX(i) * dims[f][0] * su, uv.getY(i) * dims[f][1] * sv);
  }
}
Bag.prototype.boxO = function (key, w, h, d, x, y, z, rx, ry, rz, order, su, sv) {
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, su !== undefined ? su : SC.brick, sv);
  this.put(key, g, m4(x, y, z, rx, ry, rz, 1, 1, 1, order || 'XYZ'));
};
Bag.prototype.box = function (key, w, h, d, x, y, z, rx, ry, rz, sc) {
  this.boxO(key, w, h, d, x, y, z, rx, ry, rz, 'XYZ', sc !== undefined ? sc : SC.brick);
};
Bag.prototype.cyl = function (key, rt, rb, h, x, y, z, rx, ry, rz, seg, order) {
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 12), m4(x, y, z, rx, ry, rz, 1, 1, 1, order));
};
Bag.prototype.cone = function (key, r, h, x, y, z, rx, ry, rz, seg) {
  this.put(key, new THREE.ConeGeometry(r, h, seg || 12), m4(x, y, z, rx, ry, rz));
};
Bag.prototype.plane = function (key, w, h, x, y, z, rx, ry, rz) {
  this.put(key, new THREE.PlaneGeometry(w, h), m4(x, y, z, rx, ry, rz));
};
/* 双坡棱柱（脊沿 x；UV：u 沿脊 w、v 沿坡长） */
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
/* 山墙封板三角（双面，x=const 平面） */
var _triG = {};
function triGeo(d, h, sc) {
  var key = d + '_' + h + '_' + sc;
  if (_triG[key]) return _triG[key];
  var hd = d / 2, pos = [0, 0, -hd, 0, 0, hd, 0, h, 0, 0, 0, hd, 0, 0, -hd, 0, h, 0],
      uv = [0, 0, d * sc, 0, d / 2 * sc, h * sc],
      nrm = [1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0];
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv.concat(uv), 2));
  _triG[key] = g; return g;
}
Bag.prototype.tri = function (key, d, h, x, y, z, ry, sc) {
  this.put(key, triGeo(d, h, sc || SC.brick), m4(x, y, z, 0, ry || 0, 0));
};
/* 树冠：16×12 球体确定性形变（sin 域函数 → 接缝/极点无裂） */
var _canopy = {};
function canopyGeo(r, seed) {
  var key = r.toFixed(3) + '_' + seed;
  if (_canopy[key]) return _canopy[key];
  var g = new THREE.SphereGeometry(r, 16, 12), p = g.attributes.position, i;
  var s1 = (seed % 7) * 1.7, s2 = (seed % 11) * 0.9, s3 = (seed % 13) * 2.3;
  for (i = 0; i < p.count; i++) {
    var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    var f = 1 + 0.10 * Math.sin(3.2 * x / r + s1) * Math.cos(2.6 * y / r + s2) + 0.07 * Math.sin(4.1 * z / r + s3) * Math.cos(2.2 * x / r - s2);
    var yy = y < -r * 0.45 ? -r * 0.45 + (y + r * 0.45) * 0.55 : y;
    p.setXYZ(i, x * f, yy * f, z * f);
  }
  g.computeVertexNormals();
  _canopy[key] = g; return g;
}

/* ================= 4. 文字招牌 ================= */
function signMesh(text, w, h, o) {
  o = o || {};
  var wide = o.vertical ? 64 : 256, high = o.vertical ? 256 : 64;
  var cv = document.createElement('canvas'); cv.width = wide; cv.height = high;
  var g = cv.getContext('2d');
  g.fillStyle = o.bg || '#1d2126'; g.fillRect(0, 0, wide, high);
  for (var si = 0; si < 24; si++) { g.fillStyle = si % 2 ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.18)'; g.fillRect((si * 37) % wide, (si * 53) % high, 3 + (si % 4), 2); }
  if (o.frame !== false) {
    g.strokeStyle = o.frameColor || '#c8b490'; g.lineWidth = o.vertical ? 5 : 6;
    g.strokeRect(4, 4, wide - 8, high - 8);
  }
  g.fillStyle = o.fg || '#f2e9d8';
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
  if (o.ds) m.side = THREE.DoubleSide;
  if (o.neon) { m.emissive = C(o.neonColor || '#ffdf9e'); m.emissiveIntensity = 0.8; }
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.castShadow = true;
  mesh.userData.signMat = m;
  return mesh;
}

/* ================= 5. 建筑与构件预制 ================= */
/* 建筑体量：sx×sz 占地 / h 檐口 / rise 脊高 / ridge 'x'|'z'；返回檐口 y */
var LAY = {
  A:  { cx: -0.20, cz: -0.94, sx: 1.30, sz: 0.52, h: 0.44, rise: 0.22, ridge: 'x' },  /* 正房 */
  B:  { cx: -1.06, cz: -0.93, sx: 0.34, sz: 0.54, h: 0.30, rise: 0.13, ridge: 'z' },  /* 西耳房 */
  Cc: { cx: 0.73,  cz: -0.93, sx: 0.48, sz: 0.54, h: 0.32, rise: 0.15, ridge: 'z' },  /* 东耳房 */
  D:  { cx: -1.01, cz: -0.10, sx: 0.44, sz: 0.96, h: 0.36, rise: 0.17, ridge: 'z' },  /* 西厢 */
  E:  { cx: 0.74,  cz: -0.10, sx: 0.46, sz: 0.96, h: 0.36, rise: 0.17, ridge: 'z' },  /* 东厢 */
  F:  { cx: -0.78, cz: 0.71,  sx: 0.90, sz: 0.50, h: 0.36, rise: 0.17, ridge: 'x' },  /* 倒座西 */
  G:  { cx: -0.11, cz: 0.705, sx: 0.40, sz: 0.53, h: 0.50, rise: 0.20, ridge: 'x' },  /* 门楼 */
  H:  { cx: 0.54,  cz: 0.71,  sx: 0.86, sz: 0.50, h: 0.36, rise: 0.17, ridge: 'x' }   /* 倒座东 */
};
var H2 = { cx: 0.54, cz: 0.71, sx: 0.86, sz: 0.50, h: 0.28, rise: 0.17, ridge: 'x' };   /* 倒座东二层(lv3+) */

function bldg(bag, B, wallKey, roofKey, o) {
  o = o || {};
  var y0 = o.y0 !== undefined ? o.y0 : 0.05;
  var alongX = B.ridge === 'x';
  var wW = alongX ? B.sx : B.sz, dW = alongX ? B.sz : B.sx;
  var he = B.rise * 0.12 / (dW + 0.12);
  var bh = o.flat ? B.h : B.h + he;
  bag.box(wallKey, B.sx, bh, B.sz, B.cx, y0 + bh / 2, B.cz, 0, 0, 0, SC.brick);
  if (!o.noBase) bag.box('stone', B.sx + 0.02, 0.07, B.sz + 0.02, B.cx, y0 + 0.035, B.cz, 0, 0, 0, SC.conc);
  if (roofKey && !o.flat) roofGable(bag, B.cx, y0 + B.h, B.cz, wW, dW, B.rise, alongX ? 0 : PI / 2, { key: roofKey, gable: wallKey, he: he, rafters: o.rafters });
  return y0 + B.h;
}
/* 硬山瓦顶：瓦面棱柱 + 正脊吻 + 垂脊×4 + 檐口封板(椽头) + 滴水线 + 随坡山墙；玻璃顶出分格肋 */
function roofGable(bag, x, top, z, wW, dW, rise, ry, o) {
  o = o || {}; ry = ry || 0;
  var key = o.key || 'roof', w = wW + 0.04, d = dW + (o.over !== undefined ? o.over : 0.12), hd = d / 2, sl = Math.sqrt(hd * hd + rise * rise), a = Math.atan2(rise, hd);
  var he = o.he !== undefined ? o.he : rise * (d - dW) / d;
  var isGlass = key === 'glass';
  bag.prism(key, w, d, rise, x, top, z, ry, isGlass ? 0.6 : SC.tile);
  var rk = isGlass ? 'frame' : 'ridge';
  function P(lx, ly, lz, bw, bh, bd, rx, k, su, sv) {
    var p = L(x, z, ry, lx, lz);
    bag.boxO(k, bw, bh, bd, p[0], top + ly, p[1], rx || 0, ry, 0, 'YXZ', su, sv);
  }
  P(0, rise + 0.014, 0, w + 0.03, 0.04, 0.07, 0, rk);
  if (!isGlass) {
    P(-(w / 2 - 0.02), rise + 0.05, 0, 0.05, 0.052, 0.08, 0, rk);
    P(w / 2 - 0.02, rise + 0.05, 0, 0.05, 0.052, 0.08, 0, rk);
  }
  var sx, sz;
  for (sx = -1; sx <= 1; sx += 2) for (sz = -1; sz <= 1; sz += 2)
    P(sx * (w / 2 - 0.012), rise / 2 + 0.012, sz * hd / 2, 0.03, 0.026, sl - 0.02, sz * a, rk);
  for (sz = -1; sz <= 1; sz += 2) {
    if (isGlass) {
      P(0, -0.006, sz * (hd - 0.014), w, 0.03, 0.026, 0, 'frame');
      var n = Math.max(2, Math.round(w / 0.17)), i;
      for (i = 0; i <= n; i++)
        P((i / n - 0.5) * (w - 0.04), rise / 2 + 0.006, sz * hd / 2, 0.02, 0.018, sl, sz * a, 'frame');
    } else {
      P(0, -0.008, sz * (hd - 0.014), w, 0.032, 0.026, 0, 'eave', 3.6, 1 / 0.032);
      P(0, 0.014, sz * (hd - 0.01), w + 0.01, 0.02, 0.02, 0, 'ridge');
      if (!o.noBeam) P(0, -0.03, sz * (dW / 2 + 0.012), wW, 0.028, 0.024, 0, 'woodDk', SC.plank);
      /* 檐下椽子（仅可见檐面）：沿脊每 0.08 一根，顺坡倾斜，出檐 0.06 */
      if (o.rafters && o.rafters.indexOf(sz) >= 0) {
        var nr = Math.max(3, Math.round(wW / 0.08)), ri;
        for (ri = 0; ri < nr; ri++)
          P((ri + 0.5) / nr * (wW - 0.04) - (wW - 0.04) / 2, -0.04, sz * (dW / 2 + 0.02), 0.018, 0.018, 0.08, sz * a, 'woodDk', SC.plank);
      }
    }
  }
  if (o.gable) {
    var gk = o.gable, gh = Math.max(0.02, rise - he);
    for (sx = -1; sx <= 1; sx += 2) {
      var p = L(x, z, ry, sx * (wW / 2 + 0.004), 0);
      bag.tri(gk, dW, gh, p[0], top + he, p[1], ry, SC.brick);
    }
  }
}
/* 坡面定位：lx 沿脊偏移 / side ±1 / t 0脊→1檐 */
function slopePt(B, lx, side, t, y0) {
  var top = (y0 || 0.05) + B.h, alongX = B.ridge === 'x';
  var dW = alongX ? B.sz : B.sx, hd = (dW + 0.12) / 2;
  var y = top + B.rise * (1 - t), off = side * hd * t;
  return alongX ? [B.cx + lx, y, B.cz + off] : [B.cx + off, y, B.cz + lx];
}
function slopeAng(B) {
  var alongX = B.ridge === 'x', dW = alongX ? B.sz : B.sx;
  return Math.atan2(B.rise, (dW + 0.12) / 2);
}
function chimney(bag, B, lx, side, t) {
  var p = slopePt(B, lx, side, t);
  bag.box('brick', 0.07, 0.14, 0.07, p[0], p[1] + 0.05, p[2], 0, B.ridge === 'x' ? 0 : PI / 2, 0, SC.brick);
  bag.box('stone', 0.09, 0.02, 0.09, p[0], p[1] + 0.125, p[2], 0, 0, 0, SC.conc);
}
function skylight(bag, B, lx, side, t) {
  var p = slopePt(B, lx, side, t), rx = slopeAng(B) * side, ry = B.ridge === 'x' ? 0 : PI / 2;
  bag.boxO('frame', 0.17, 0.016, 0.15, p[0], p[1] + 0.016, p[2], rx, ry, 0, 'YXZ', 6);
  bag.boxO('glass', 0.15, 0.012, 0.13, p[0], p[1] + 0.028, p[2], rx, ry, 0, 'YXZ', 6);
}
function solarRow(bag, B, side, lx0, lx1, t0, t1, n) {
  var a = slopeAng(B) * side, alongX = B.ridge === 'x';
  var sl = Math.sqrt(Math.pow((B.ridge === 'x' ? B.sz : B.sx) / 2 + 0.06, 2) + B.rise * B.rise);
  var pw = (lx1 - lx0) / n - 0.012, ph = (t1 - t0) * sl - 0.012;
  for (var i = 0; i < n; i++) {
    var lx = lx0 + (i + 0.5) * (lx1 - lx0) / n, p = slopePt(B, lx, side, (t0 + t1) / 2);
    bag.boxO('solar', pw, 0.012, ph, p[0], p[1] + 0.024, p[2], a, alongX ? 0 : PI / 2, 0, 'YXZ', 6);
  }
}
function solarHeater(bag, B, side, lx, t) {
  var p = slopePt(B, lx, side, t), a = slopeAng(B) * side + 0.25 * side, alongX = B.ridge === 'x';
  bag.boxO('solar', 0.26, 0.012, 0.2, p[0], p[1] + 0.05, p[2], a, alongX ? 0 : PI / 2, 0, 'YXZ', 4);
  var q = slopePt(B, lx, side, Math.max(0.08, t - 0.28));
  if (alongX) bag.cyl('metal', 0.035, 0.035, 0.26, q[0], q[1] + 0.075, q[2], 0, 0, PI / 2, 12);
  else bag.cyl('metal', 0.035, 0.035, 0.26, q[0], q[1] + 0.075, q[2], PI / 2, 0, 0, 12, 'YXZ');
  bag.boxO('frame', 0.016, 0.12, 0.016, p[0], p[1] - 0.02, p[2], 0, alongX ? 0 : PI / 2, 0, 'YXZ');
}
function dish(bag, B, lx, side, t) {
  var p = slopePt(B, lx, side, t);
  bag.box('frame', 0.018, 0.14, 0.018, p[0], p[1] + 0.05, p[2], 0, 0, 0);
  bag.box('frame', 0.05, 0.012, 0.012, p[0] + 0.02, p[1] + 0.115, p[2] + 0.01, 0, 0.5, 0);
  bag.cyl('white', 0.045, 0.045, 0.008, p[0] + 0.035, p[1] + 0.125, p[2] + 0.025, -0.9, 0.5, 0, 12, 'YXZ');
}
/* 屋面苔斑（薄片贴坡） */
function mossPatch(bag, B, lx, side, t, w, d) {
  var p = slopePt(B, lx, side, t), rx = slopeAng(B) * side, ry = B.ridge === 'x' ? 0 : PI / 2;
  bag.boxO('green2', w, 0.006, d, p[0], p[1] + 0.006, p[2], rx, ry, 0, 'YXZ', 4);
}
/* 井盖 */
function manhole(bag, x, z) {
  bag.cyl('dark', 0.055, 0.055, 0.006, x, 0.053, z, 0, 0, 0, 12);
}
/* 自行车停放架（2000s） */
function bikeRack(bag, x, z, ry) {
  ry = ry || 0;
  for (var i = 0; i < 3; i++) {
    var p = L(x, z, ry, (i - 1) * 0.07, 0);
    bag.boxO('metal', 0.016, 0.1, 0.05, p[0], 0.1, p[1], 0, ry, 0, 'XYZ', 6);
    bag.boxO('metal', 0.016, 0.016, 0.06, p[0], 0.155, p[1], 0, ry, 0, 'XYZ', 6);
  }
  var q = L(x, z, ry, 0, 0);
  bag.boxO('metal', 0.18, 0.012, 0.012, q[0], 0.06, q[1], 0, ry, 0, 'XYZ', 6);
}
/* 公用电话亭（2000s 挂墙式） */
function phoneBooth(bag, x, y, z, ry) {
  ry = ry || 0;
  var p = L(x, z, ry, 0, 0.05), q = L(x, z, ry, 0, 0.09);
  bag.boxO('frame', 0.12, 0.3, 0.1, p[0], y, p[1], 0, ry, 0);
  bag.boxO('blue', 0.11, 0.05, 0.02, q[0], y + 0.11, q[1], 0, ry, 0, 'XYZ', 3);
  bag.boxO('glass', 0.1, 0.16, 0.012, q[0], y - 0.03, q[1], 0, ry, 0);
}
/* 院内挂灯串（两杆一线 + 灯泡） */
function stringLights(bag, x0, z0, x1, z1, y) {
  bag.cyl('frame', 0.008, 0.01, y - 0.05, x0, 0.05 + (y - 0.05) / 2, z0, 0, 0, 0, 8);
  bag.cyl('frame', 0.008, 0.01, y - 0.05, x1, 0.05 + (y - 0.05) / 2, z1, 0, 0, 0, 8);
  wire(bag, x0, y, z0, x1, y, z1);
  for (var i = 1; i < 7; i++) {
    var t = i / 7, sag = Math.sin(t * PI) * 0.03;
    bag.box('lampGlow', 0.014, 0.018, 0.014, x0 + (x1 - x0) * t, y - sag - 0.014, z0 + (z1 - z0) * t);
  }
}
/* 门前立式菜单牌（A 字架） */
function menuBoard(bag, x, z, ry) {
  ry = ry || 0;
  var p = L(x, z, ry, 0, 0.006);
  bag.boxO('dark', 0.1, 0.16, 0.012, x, 0.13, z, 0.2, ry, 0, 'YXZ');
  bag.boxO('cream', 0.08, 0.1, 0.006, p[0], 0.14, p[1], 0.2, ry, 0, 'YXZ');
}
/* 朱红棂格窗（1990s：木框 + 纸芯 + 棂条） */
function latticeWin(bag, x, y, z, w, h, ry, o) {
  o = o || {}; ry = ry || 0;
  var fk = o.frame || 'woodRed';
  function P(lx, ly, lz, bw, bh, bd, k) { var p = L(x, z, ry, lx, lz); bag.box(k, bw, bh, bd, p[0], y + ly, p[1], 0, ry, 0, SC.plank); }
  P(0, 0, 0.004, w, h, 0.02, o.pane || 'cream');
  P(0, h / 2 + 0.012, 0.012, w + 0.05, 0.025, 0.035, fk);
  P(0, -h / 2 - 0.012, 0.012, w + 0.05, 0.025, 0.035, fk);
  P(-w / 2 - 0.012, 0, 0.012, 0.025, h, 0.035, fk);
  P(w / 2 + 0.012, 0, 0.012, 0.025, h, 0.035, fk);
  P(-w / 6, 0, 0.014, 0.012, h, 0.03, fk);
  P(w / 6, 0, 0.014, 0.012, h, 0.03, fk);
  P(0, h / 4, 0.014, w, 0.012, 0.03, fk);
  P(0, -h / 4, 0.014, w, 0.012, 0.03, fk);
  if (o.sill) P(0, -h / 2 - 0.032, 0.018, w + 0.08, 0.02, 0.06, 'stone');
}
/* 现代铝窗（玻璃 + 深框 + 暖光芯） */
function modWin(bag, x, y, z, w, h, ry, o) {
  o = o || {}; ry = ry || 0;
  var fk = o.frame || 'frame';
  function P(lx, ly, lz, bw, bh, bd, k) { var p = L(x, z, ry, lx, lz); bag.box(k, bw, bh, bd, p[0], y + ly, p[1], 0, ry, 0); }
  P(0, 0, 0.006, w, h, 0.014, o.glass || 'glass');
  P(0, 0, 0.003, w - 0.02, h - 0.02, 0.004, 'glow');
  P(0, h / 2 + 0.01, 0.012, w + 0.04, 0.022, 0.035, fk);
  P(0, -h / 2 - 0.01, 0.012, w + 0.04, 0.022, 0.035, fk);
  P(-w / 2 - 0.01, 0, 0.012, 0.022, h, 0.035, fk);
  P(w / 2 + 0.01, 0, 0.012, 0.022, h, 0.035, fk);
  P(0, 0, 0.014, 0.014, h, 0.03, fk);
  P(0, -h / 2 - 0.032, 0.016, w + 0.07, 0.018, 0.055, 'stone');
}
/* 朱红木门（双扇 + 门框 + 门楣 + 门槛；门墩/台阶/门簪可选） */
function redDoor(bag, x, y0, z, w, h, ry, o) {
  o = o || {}; ry = ry || 0;
  var lk = o.leaf || 'woodRed';
  function P(lx, ly, lz, bw, bh, bd, k, sc) { var p = L(x, z, ry, lx, lz); bag.box(k, bw, bh, bd, p[0], y0 + ly, p[1], 0, ry, 0, sc); }
  P(-w / 4, h / 2 + 0.02, 0.01, w / 2 - 0.007, h, 0.022, lk, SC.plank);
  P(w / 4, h / 2 + 0.02, 0.01, w / 2 - 0.007, h, 0.022, lk, SC.plank);
  P(-w / 2 - 0.016, h / 2 + 0.02, 0.012, 0.032, h + 0.04, 0.04, 'woodDk');
  P(w / 2 + 0.016, h / 2 + 0.02, 0.012, 0.032, h + 0.04, 0.04, 'woodDk');
  P(0, h + 0.048, 0.012, w + 0.07, 0.035, 0.045, 'woodDk');
  P(0, 0.012, 0.022, w + 0.07, 0.024, 0.06, 'stone');
  if (o.knockers) { P(-w / 4, h * 0.52, 0.024, 0.016, 0.016, 0.01, 'metal'); P(w / 4, h * 0.52, 0.024, 0.016, 0.016, 0.01, 'metal'); }
  if (o.drums) { P(-w / 2 - 0.075, 0.055, 0.05, 0.07, 0.11, 0.09, 'stone'); P(w / 2 + 0.075, 0.055, 0.05, 0.07, 0.11, 0.09, 'stone'); }
  if (o.steps) { P(0, 0.013, 0.1, w + 0.22, 0.026, 0.14, 'stone'); P(0, 0.007, 0.2, w + 0.32, 0.014, 0.06, 'stone'); }
}
/* 店面（玻璃 + 框 + 暖光内景；door=门扇竖框位置 lx） */
function storefront(bag, x, y0, z, w, h, ry, o) {
  o = o || {}; ry = ry || 0;
  var fk = o.frame || 'frame', gk = o.glass || 'glass';
  function P(lx, ly, lz, bw, bh, bd, k) { var p = L(x, z, ry, lx, lz); bag.box(k, bw, bh, bd, p[0], y0 + ly, p[1], 0, ry, 0); }
  P(0, h / 2, 0.008, w, h, 0.016, gk);
  P(0, h / 2, 0.003, w - 0.02, h - 0.02, 0.004, 'glow');
  P(0, h + 0.015, 0.014, w + 0.04, 0.03, 0.04, fk);
  P(0, 0.012, 0.014, w + 0.04, 0.024, 0.04, fk);
  P(-w / 2 - 0.01, h / 2, 0.014, 0.024, h + 0.02, 0.04, fk);
  P(w / 2 + 0.01, h / 2, 0.014, 0.024, h + 0.02, 0.04, fk);
  var n = o.mull || 2, i;
  for (i = 1; i < n; i++) P((i / n - 0.5) * w, h / 2, 0.016, 0.018, h, 0.036, fk);
  if (o.door !== undefined) {
    P(o.door, h * 0.42, 0.02, 0.02, h * 0.84, 0.032, fk);
    P(o.door + 0.035, h * 0.46, 0.028, 0.03, 0.012, 0.012, 'metal');
  }
}
/* 布雨棚（斜置箱体 + 垂幔 + 前杆 + 斜撑） */
function awning(bag, key, x, y, z, w, depth, ry) {
  ry = ry || 0; var ang = 0.38, ca = Math.cos(ang), sa = Math.sin(ang);
  var c = L(x, z, ry, 0, depth * 0.5 * ca);
  bag.boxO(key, w, 0.014, depth, c[0], y - depth * 0.5 * sa, c[1], ang, ry, 0, 'YXZ', 3);
  var f = L(x, z, ry, 0, depth * ca);
  bag.boxO(key, w, 0.045, 0.012, f[0], y - depth * sa - 0.022, f[1], 0, ry, 0, 'YXZ', 3);
  bag.boxO('frame', w + 0.02, 0.014, 0.014, f[0], y - depth * sa, f[1], 0, ry, 0, 'YXZ');
  var s;
  for (s = -1; s <= 1; s += 2) {
    var m = L(x, z, ry, s * (w / 2 - 0.03), depth * 0.5 * ca);
    bag.boxO('frame', 0.012, 0.012, depth * 1.02, m[0], y - depth * 0.5 * sa, m[1], ang, ry, 0, 'YXZ');
  }
}
/* 空调外机（壳 + 风扇盘 + 轴毂 + 百叶面 + 支架 ×2 + 冷媒管） */
function acUnit(bag, x, y, z, ry, pipeLen) {
  ry = ry || 0;
  var cr = Math.cos(ry), sr = Math.sin(ry);
  function W(lx, lz) { return [x + lx * cr + lz * sr, z - lx * sr + lz * cr]; }
  bag.box('metal', 0.2, 0.13, 0.09, x, y, z, 0, ry, 0, 6);
  var f = W(-0.045, 0.05);
  bag.cyl('frame', 0.046, 0.046, 0.01, f[0], y, f[1], PI / 2, ry, 0, 16, 'YXZ');
  bag.cyl('metal', 0.012, 0.012, 0.016, f[0], y, f[1], PI / 2, ry, 0, 8, 'YXZ');
  var l = W(0.052, 0.05);
  bag.box('acFront', 0.085, 0.11, 0.008, l[0], y, l[1], 0, ry, 0, 10);
  var b1 = W(-0.06, -0.03), b2 = W(0.06, -0.03);
  bag.box('frame', 0.02, 0.15, 0.02, b1[0], y - 0.02, b1[1], 0, ry, 0);
  bag.box('frame', 0.02, 0.15, 0.02, b2[0], y - 0.02, b2[1], 0, ry, 0);
  if (pipeLen) {
    var p = W(-0.11, 0);
    bag.cyl('metal', 0.008, 0.008, pipeLen, p[0], y - pipeLen / 2 + 0.02, p[1], 0, 0, 0, 8);
  }
}
/* 院槐 / 行道树（干 + 侧枝 + n 簇形变树冠；lift 抬高树干（行道树）；flip 镜像簇偏移（右侧街树向内） */
var CLUSTERS = [
  [0.00, 0.66, 0.00, 0.29],
  [0.19, 0.56, 0.10, 0.20],
  [-0.18, 0.60, -0.09, 0.19],
  [0.03, 0.80, -0.04, 0.17],
  [-0.05, 0.50, 0.19, 0.16]
];
function tree(bag, x, z, s, seed, n, lift, flip) {
  n = n || 5; lift = lift || 0;
  bag.cyl('trunk', 0.03 * s, 0.05 * s, 0.5 * s + lift, x, 0.05 + (0.5 * s + lift) / 2, z, 0, 0, 0, 12);
  bag.cyl('trunk', 0.015 * s, 0.022 * s, 0.26 * s, x + 0.08 * s * (flip ? -1 : 1), 0.05 + 0.52 * s + lift, z + 0.03 * s, 0, 0, flip ? 0.6 : -0.6, 8);
  for (var i = 0; i < n; i++) {
    var c = CLUSTERS[i];
    var ox = flip ? -Math.abs(c[0]) : c[0];   /* flip：x 偏移全部压向内侧（右侧街树） */
    bag.put(i % 2 ? 'green2' : 'green', canopyGeo(c[3] * s, seed * 10 + i), m4(x + ox * s, 0.05 + c[1] * s + lift, z + c[2] * s));
  }
}
function shrubAt(bag, key, x, y, z, r, seed, sx, sz) {
  bag.put(key, canopyGeo(r, seed), m4(x, y, z, 0, 0, 0, sx || 1, 0.75, sz || 1));
}
/* 树坑算子 */
function treePit(bag, x, z) {
  bag.box('dark', 0.17, 0.008, 0.17, x, 0.054, z, 0, 0, 0, SC.conc);
}
/* 路灯（modern: 细杆弯臂 / 1990s: 水泥杆单臂） */
function lampPost(bag, x, z, ry, modern) {
  ry = ry || 0;
  function P(lx, ly, lz, bw, bh, bd, k) { var p = L(x, z, ry, lx, lz); bag.box(k, bw, bh, bd, p[0], ly, p[1], 0, ry, 0); }
  if (modern) {
    bag.cyl('frame', 0.013, 0.019, 0.7, x, 0.05 + 0.35, z, 0, 0, 0, 12);
    bag.cyl('frame', 0.024, 0.028, 0.02, x, 0.062, z, 0, 0, 0, 12);
    P(0.06, 0.74, 0, 0.14, 0.02, 0.02, 'frame');
    P(0.13, 0.715, 0, 0.1, 0.028, 0.06, 'dark');
    P(0.13, 0.698, 0, 0.075, 0.008, 0.045, 'lampGlow');
  } else {
    bag.cyl('conc', 0.015, 0.023, 0.82, x, 0.05 + 0.41, z, 0, 0, 0, 12);
    P(0.08, 0.85, 0, 0.18, 0.018, 0.018, 'metal');
    P(0.17, 0.832, 0, 0.09, 0.028, 0.05, 'metal');
    P(0.17, 0.815, 0, 0.06, 0.007, 0.035, 'lampGlow');
  }
}
/* 电线杆 + 瓷瓶 + 电线（1990s 胡同天际线） */
function utilityPole(bag, x, z) {
  bag.cyl('conc', 0.014, 0.021, 0.92, x, 0.05 + 0.46, z, 0, 0, 0, 12);
  bag.box('woodDk', 0.3, 0.02, 0.02, x, 0.92, z, 0, 0, 0, SC.plank);
  bag.box('woodDk', 0.24, 0.02, 0.02, x, 0.84, z, 0, 0, 0, SC.plank);
  bag.box('cream', 0.018, 0.03, 0.018, x - 0.12, 0.945, z);
  bag.box('cream', 0.018, 0.03, 0.018, x + 0.12, 0.945, z);
  bag.box('cream', 0.018, 0.03, 0.018, x - 0.09, 0.865, z);
  bag.box('cream', 0.018, 0.03, 0.018, x + 0.09, 0.865, z);
}
function wire(bag, x0, y0, z0, x1, y1, z1) {
  var dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  if (len < 0.01) return;
  var ry = Math.atan2(dx, dz), rx = -Math.asin(dy / len);
  bag.boxO('dark', 0.005, 0.005, len, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, rx, ry, 0, 'YXZ');
}
/* 挡车柱 */
function bollard(bag, x, z) {
  bag.cyl('dark', 0.013, 0.015, 0.16, x, 0.13, z, 0, 0, 0, 12);
  bag.cyl('lampGlow', 0.015, 0.015, 0.02, x, 0.215, z, 0, 0, 0, 12);
}
/* 花箱（木箱 + 灌木；y0 可置于露台） */
function planter(bag, x, z, w, ry, seed, y0) {
  ry = ry || 0; y0 = y0 || 0.05;
  bag.boxO('woodDk', w, 0.09, 0.15, x, y0 + 0.045, z, 0, ry, 0, 'XYZ', SC.plank);
  bag.boxO('wood', w - 0.015, 0.06, 0.125, x, y0 + 0.06, z, 0, ry, 0, 'XYZ', SC.plank);
  var p = L(x, z, ry, -w * 0.22, 0), q = L(x, z, ry, w * 0.24, 0.01);
  shrubAt(bag, 'green', p[0], y0 + 0.135, p[1], 0.055, seed, 1.4, 1);
  shrubAt(bag, 'green2', q[0], y0 + 0.125, q[1], 0.048, seed + 3, 1.3, 1);
}
/* 条凳 / 垃圾桶 / 石凳 */
function bench(bag, x, z, ry) {
  ry = ry || 0;
  var p = L(x, z, ry, 0, 0);
  bag.box('wood', 0.4, 0.026, 0.13, p[0], 0.215, p[1], 0, ry, 0, SC.plank);
  bag.box('frame', 0.03, 0.14, 0.11, p[0] - 0.15 * Math.cos(ry), 0.14, p[1] + 0.15 * Math.sin(ry), 0, ry, 0);
  bag.box('frame', 0.03, 0.14, 0.11, p[0] + 0.15 * Math.cos(ry), 0.14, p[1] - 0.15 * Math.sin(ry), 0, ry, 0);
}
function stool(bag, x, z) {
  bag.cyl('stone', 0.055, 0.065, 0.09, x, 0.095, z, 0, 0, 0, 12);
}
function trashBin(bag, x, z) {
  bag.cyl('metal', 0.03, 0.026, 0.11, x, 0.105, z, 0, 0, 0, 12);
  bag.cyl('dark', 0.032, 0.032, 0.015, x, 0.166, z, 0, 0, 0, 12);
}
/* 外摆咖啡桌（金属圆桌 + 双凳；y0 地面高，可置露台） */
function cafeTable(bag, x, z, y0) {
  var dy = (y0 || 0.05) - 0.05;
  bag.cyl('metal', 0.085, 0.085, 0.014, x, 0.335 + dy, z, 0, 0, 0, 12);
  bag.cyl('frame', 0.011, 0.011, 0.27, x, 0.19 + dy, z, 0, 0, 0, 8);
  bag.cyl('frame', 0.05, 0.05, 0.01, x, 0.055 + dy, z, 0, 0, 0, 12);
  bag.cyl('woodDk', 0.05, 0.05, 0.012, x + 0.15, 0.2 + dy, z + 0.05, 0, 0, 0, 12);
  bag.cyl('frame', 0.009, 0.009, 0.14, x + 0.15, 0.12 + dy, z + 0.05, 0, 0, 0, 8);
  bag.cyl('woodDk', 0.05, 0.05, 0.012, x - 0.14, 0.2 + dy, z - 0.06, 0, 0, 0, 12);
  bag.cyl('frame', 0.009, 0.009, 0.14, x - 0.14, 0.12 + dy, z - 0.06, 0, 0, 0, 8);
}
/* 遮阳伞 */
function umbrella(bag, x, y, z, s) {
  s = s || 1;
  bag.cyl('frame', 0.011, 0.011, 0.36 * s, x, y + 0.18 * s, z, 0, 0, 0, 8);
  bag.cone('white', 0.21 * s, 0.09 * s, x, y + 0.39 * s, z, 0, 0, 0, 12);
  bag.cyl('dark', 0.05, 0.055, 0.02, x, y + 0.01, z, 0, 0, 0, 12);
}
/* 玻璃栏板（沿局部 x，ry 旋转） */
function glassRail(bag, x, y, z, len, ry) {
  ry = ry || 0;
  bag.boxO('glass', len, 0.13, 0.015, x, y + 0.065, z, 0, ry, 0);
  bag.boxO('frame', len, 0.016, 0.02, x, y + 0.145, z, 0, ry, 0);
  bag.boxO('frame', len, 0.014, 0.024, x, y + 0.008, z, 0, ry, 0);
  var n = Math.max(2, Math.round(len / 0.3)), i;
  for (i = 0; i <= n; i++) {
    var q = L(x, z, ry, (i / n - 0.5) * len, 0);
    bag.box('frame', 0.018, 0.15, 0.018, q[0], y + 0.075, q[1], 0, 0, 0);
  }
}
/* 木廊架 + 顶部藤蔓 */
function pergola(bag, x, y, z, w, d, h, seed) {
  var i;
  [[-w / 2 + 0.03, -d / 2 + 0.03], [w / 2 - 0.03, -d / 2 + 0.03], [-w / 2 + 0.03, d / 2 - 0.03], [w / 2 - 0.03, d / 2 - 0.03]].forEach(function (c) {
    bag.box('woodDk', 0.032, h, 0.032, x + c[0], y + h / 2, z + c[1]);
  });
  bag.box('woodDk', w, 0.028, 0.05, x, y + h, z - d / 2 + 0.03);
  bag.box('woodDk', w, 0.028, 0.05, x, y + h, z + d / 2 - 0.03);
  for (i = 0; i <= 4; i++) bag.box('wood', 0.04, 0.02, d - 0.02, x - w / 2 + (w * i) / 4, y + h + 0.022, z, 0, 0, 0, SC.plank);
  shrubAt(bag, 'green', x - w * 0.2, y + h + 0.05, z, 0.09, seed, 1.2, 0.7);
  shrubAt(bag, 'green2', x + w * 0.22, y + h + 0.045, z, 0.08, seed + 2, 1.1, 0.7);
}
/* 藤蔓墙挂（贴墙面，法向为局部 +z） */
function ivy(bag, x, y0, z, w, h, ry, seed) {
  ry = ry || 0;
  var p = L(x, z, ry, 0, 0.012), q = L(x, z, ry, 0, 0.035);
  bag.boxO('green2', w, h, 0.02, p[0], y0 + h / 2, p[1], 0, ry, 0, 'XYZ', SC.plank);
  shrubAt(bag, 'green', q[0], y0 + h + 0.03, q[1], 0.07, seed, 1.3, 1);
}
/* 晾衣绳（两杆一线两衣） */
function clothesline(bag, x0, x1, z) {
  bag.cyl('woodDk', 0.013, 0.017, 0.5, x0, 0.3, z, 0, 0, 0, 8);
  bag.cyl('woodDk', 0.013, 0.017, 0.5, x1, 0.3, z, 0, 0, 0, 8);
  bag.box('dark', x1 - x0, 0.008, 0.008, (x0 + x1) / 2, 0.52, z);
  bag.plane('cream', 0.13, 0.11, x0 + (x1 - x0) * 0.35, 0.455, z, 0, 0, 0);
  bag.plane('blue', 0.11, 0.1, x0 + (x1 - x0) * 0.68, 0.46, z, 0, 0, 0);
}
/* 影壁 */
function screenWall(bag, x, z) {
  bag.box('brick', 0.44, 0.3, 0.06, x, 0.05 + 0.18, z, 0, 0, 0, SC.brick);
  bag.box('stone', 0.48, 0.05, 0.1, x, 0.075, z, 0, 0, 0, SC.conc);
  bag.prism('roof', 0.5, 0.14, 0.05, x, 0.38, z, 0);
  bag.box('ridge', 0.52, 0.024, 0.05, x, 0.435, z);
  bag.box('cream', 0.2, 0.16, 0.012, x, 0.24, z + 0.032, 0, 0, 0, SC.brick);
}
/* 院角小库房（1990s-2000s 自建棚房，lv3 改造时拆除） */
function shed(bag, x, z) {
  bag.box('brick', 0.4, 0.24, 0.28, x, 0.05 + 0.12, z, 0, 0, 0, SC.brick);
  bag.prism('roofDk', 0.44, 0.34, 0.08, x, 0.29, z, 0);
  bag.box('ridge', 0.46, 0.022, 0.04, x, 0.378, z);
  bag.boxO('eave', 0.44, 0.024, 0.02, x, 0.284, z + 0.16, 0, 0, 0, 'XYZ', 3.6, 1 / 0.024);
  bag.box('woodDk', 0.14, 0.18, 0.02, x + 0.08, 0.14, z + 0.145, 0, 0, 0, SC.plank);
  bag.box('cream', 0.1, 0.08, 0.016, x - 0.1, 0.2, z + 0.145, 0, 0, 0, SC.plank);
  bag.box('woodRed', 0.12, 0.012, 0.024, x - 0.1, 0.245, z + 0.148, 0, 0, 0, SC.plank);
  bag.box('woodRed', 0.12, 0.012, 0.024, x - 0.1, 0.155, z + 0.148, 0, 0, 0, SC.plank);
}
/* 木条箱 / 煤垛 / 砖堆 */
function crate(bag, x, z, s) {
  s = s || 1;
  bag.box('wood', 0.14 * s, 0.1 * s, 0.11 * s, x, 0.05 + 0.05 * s, z, 0, 0.2 * (s - 1), 0, SC.plank);
}
function coalPile(bag, x, z) {
  var i;
  for (i = 0; i < 8; i++) {
    var row = Math.floor(i / 3), col = i % 3;
    bag.box('dark', 0.055, 0.04, 0.055, x + (col - 1) * 0.06 + row * 0.015, 0.05 + 0.02 + row * 0.042, z + ((i % 2) - 0.5) * 0.02, 0, (i * 0.7) % PI, 0);
  }
}
function brickPile(bag, x, z) {
  for (var i = 0; i < 5; i++) {
    bag.box('brick', 0.11, 0.036, 0.055, x + ((i % 2) * 0.02), 0.05 + 0.018 + Math.floor(i / 2) * 0.036, z + ((i % 3) - 1) * 0.03, 0, (i * 0.7) % PI, 0, SC.brick);
  }
}
/* 钢结构玻璃大厅（lv4 东北：基座 + 暖光内景体 + 吊灯 + 分格幕墙 + 玻璃两坡顶） */
function glassHall(bag, B) {
  var top = 0.11 + B.h, alongX = B.ridge === 'x';
  var wW = alongX ? B.sx : B.sz, dW = alongX ? B.sz : B.sx;
  bag.box('conc', B.sx + 0.03, 0.06, B.sz + 0.03, B.cx, 0.08, B.cz, 0, 0, 0, SC.conc);
  bag.box('glow', B.sx - 0.05, B.h - 0.06, B.sz - 0.05, B.cx, top - B.h / 2 - 0.01, B.cz);
  var i, n, x, z;
  for (i = 0; i < 3; i++) {                                                     /* 吊灯串 */
    z = B.cz + (i - 1) * B.sz * 0.3;
    bag.box('dark', 0.006, 0.08, 0.006, B.cx, top + 0.06, z);
    bag.box('lampGlow', 0.05, 0.02, 0.05, B.cx, top + 0.015, z);
  }
  bag.box('glass', B.sx, B.h, B.sz, B.cx, top - B.h / 2, B.cz);
  n = Math.round(B.sx / 0.12);
  for (i = 0; i <= n; i++) {
    x = B.cx + (i / n - 0.5) * B.sx;
    bag.box('frame', 0.02, B.h, 0.02, x, top - B.h / 2, B.cz + B.sz / 2 + 0.008);
  }
  n = Math.round(B.sz / 0.12);
  for (i = 0; i <= n; i++) {
    z = B.cz + (i / n - 0.5) * B.sz;
    bag.box('frame', 0.02, B.h, 0.02, B.cx + B.sx / 2 + 0.008, top - B.h / 2, z);
    bag.box('frame', 0.02, B.h, 0.02, B.cx - B.sx / 2 - 0.008, top - B.h / 2, z);
  }
  bag.box('frame', B.sx + 0.03, 0.02, 0.024, B.cx, top - B.h / 2 + 0.01, B.cz + B.sz / 2 + 0.008);
  bag.box('frame', B.sx + 0.03, 0.02, 0.024, B.cx, top - 0.01, B.cz + B.sz / 2 + 0.008);
  bag.box('frame', 0.024, 0.02, B.sz + 0.03, B.cx + B.sx / 2 + 0.008, top - B.h / 2 + 0.01, B.cz);
  bag.box('frame', 0.024, 0.02, B.sz + 0.03, B.cx + B.sx / 2 + 0.008, top - 0.01, B.cz);
  roofGable(bag, B.cx, top, B.cz, wW, dW, B.rise, alongX ? 0 : PI / 2, { key: 'glass', over: 0.06 });
}
/* 灯笼（静态） */
function lantern(bag, x, y, z, s) {
  s = s || 1;
  bag.put('red', canopyGeo(0.045 * s, 77), m4(x, y - 0.05 * s, z, 0, 0, 0, 1, 0.85, 1));
  bag.cyl('metal', 0.02 * s, 0.028 * s, 0.014 * s, x, y + 0.005 * s, z, 0, 0, 0, 8);
  bag.cyl('red', 0.004 * s, 0.004 * s, 0.05 * s, x, y - 0.12 * s, z, 0, 0, 0, 6);
}

/* ================= 6. 四个年代 ================= */

/* ---- lv1 1990s 居民大院 ---- */
function stage1() {
  var g = new THREE.Group(); g.name = 'prop1m_lv1';
  var bag = new Bag(), Y = LAY;
  basePlinth(bag);
  bldg(bag, Y.A, 'brick', 'roof', { rafters: [1] });
  bldg(bag, Y.B, 'brick', 'roofDk'); bldg(bag, Y.Cc, 'brick', 'roofDk');
  bldg(bag, Y.D, 'brick', 'roof'); bldg(bag, Y.E, 'brick', 'roof', { rafters: [1] });
  bldg(bag, Y.F, 'brick', 'roof', { rafters: [1] }); bldg(bag, Y.G, 'brick', 'roof', { rafters: [1] }); bldg(bag, Y.H, 'brick', 'roof', { rafters: [1] });
  chimney(bag, Y.B, 0.1, 1, 0.5);
  var zA = Y.A.cz + Y.A.sz / 2, xD = Y.D.cx + Y.D.sx / 2, xE = Y.E.cx + Y.E.sx / 2;
  var zS = Y.F.cz + Y.F.sz / 2, zG = Y.G.cz + Y.G.sz / 2;
  /* 正房南立面：朱红门 + 棂格窗 */
  redDoor(bag, Y.A.cx, 0.05, zA, 0.26, 0.34, 0, { steps: true });
  latticeWin(bag, Y.A.cx - 0.40, 0.29, zA, 0.24, 0.2, 0, { sill: true });
  latticeWin(bag, Y.A.cx + 0.40, 0.29, zA, 0.24, 0.2, 0, { sill: true });
  latticeWin(bag, Y.A.cx - 0.61, 0.29, zA, 0.1, 0.16, 0);
  latticeWin(bag, Y.A.cx + 0.61, 0.29, zA, 0.1, 0.16, 0);
  /* 西厢院内立面 */
  redDoor(bag, xD, 0.05, Y.D.cz, 0.2, 0.3, PI / 2);
  latticeWin(bag, xD, 0.27, Y.D.cz - 0.3, 0.2, 0.17, PI / 2, { sill: true });
  latticeWin(bag, xD, 0.27, Y.D.cz + 0.3, 0.2, 0.17, PI / 2, { sill: true });
  /* 东厢/东耳房临街面（+x） */
  latticeWin(bag, xE, 0.3, Y.E.cz - 0.28, 0.16, 0.13, PI / 2);
  latticeWin(bag, xE, 0.3, Y.E.cz + 0.28, 0.16, 0.13, PI / 2);
  redDoor(bag, xE, 0.05, Y.E.cz, 0.16, 0.28, PI / 2, { leaf: 'woodDk' });
  latticeWin(bag, xE, 0.28, Y.Cc.cz, 0.14, 0.12, PI / 2);
  /* 倒座西/东 临街面 */
  latticeWin(bag, Y.F.cx - 0.26, 0.28, zS, 0.2, 0.16, 0);
  latticeWin(bag, Y.F.cx + 0.26, 0.28, zS, 0.2, 0.16, 0);
  redDoor(bag, Y.F.cx, 0.05, zS, 0.18, 0.28, 0, { leaf: 'woodDk' });
  latticeWin(bag, Y.H.cx - 0.26, 0.28, zS, 0.2, 0.16, 0);
  latticeWin(bag, Y.H.cx + 0.26, 0.28, zS, 0.2, 0.16, 0);
  redDoor(bag, Y.H.cx, 0.05, zS, 0.18, 0.28, 0, { leaf: 'woodDk' });
  /* 门楼：朱红大门 + 门墩 + 台阶 + 门簪 + 灯笼 */
  redDoor(bag, Y.G.cx, 0.05, zG, 0.26, 0.38, 0, { drums: true, steps: true, knockers: true });
  bag.box('woodDk', 0.34, 0.03, 0.05, Y.G.cx, 0.505, zG + 0.02);
  lantern(bag, Y.G.cx - 0.24, 0.48, zG + 0.06, 1);
  lantern(bag, Y.G.cx + 0.24, 0.48, zG + 0.06, 1);
  screenWall(bag, Y.G.cx, 0.3);
  /* 院内：槐树 + 库房棚 + 晾衣绳 + 水缸 + 煤堆 + 砖堆 + 石凳 */
  tree(bag, -0.18, -0.16, 0.98, 11, 5);
  shed(bag, -0.6, 0.3);
  clothesline(bag, -0.34, 0.16, 0.06);
  bag.cyl('conc', 0.075, 0.06, 0.14, 0.34, 0.12, -0.42, 0, 0, 0, 12);
  bag.cyl('woodDk', 0.08, 0.08, 0.012, 0.34, 0.196, -0.42, 0, 0, 0, 12);
  coalPile(bag, 0.42, 0.2);
  brickPile(bag, 0.3, -0.26);
  stool(bag, 0.16, -0.5); stool(bag, -0.56, -0.5);
  crate(bag, 0.28, 0.3, 1); crate(bag, 0.3, 0.28, 0.7);
  /* 屋顶：烟囱 ×2 */
  chimney(bag, Y.A, 0.38, 1, 0.55);
  chimney(bag, Y.F, -0.2, 1, 0.6);
  /* 临街：老路灯 + 电线杆 + 电线 + 杂物箱 + 井盖 */
  lampPost(bag, 0.3, 1.1, -PI / 2, false);
  utilityPole(bag, -0.62, 1.12);
  wire(bag, -0.74, 0.945, 1.12, 1.24, 0.9, 1.12);
  wire(bag, -0.5, 0.945, 1.12, 1.24, 0.91, 1.15);
  wire(bag, -0.71, 0.865, 1.12, -1.24, 0.84, 1.12);
  crate(bag, -1.05, 1.08, 1); crate(bag, -1.08, 1.1, 0.7);
  manhole(bag, 0.7, 1.16);
  shrubAt(bag, 'green2', 0.4, 0.13, 0.36, 0.07, 46, 1, 1);
  /* 暖窗（正房东窗） */
  var glowM = glowMat(0.28);
  var pA = L(Y.A.cx + 0.40, zA, 0, 0, 0);
  bag.box('glow', 0.22, 0.18, 0.004, pA[0], 0.29, pA[1] + 0.017);
  g.userData.anim = [function (t) { glowM.emissiveIntensity = 0.2 + 0.13 * Math.sin(t * 1.4); }];
  bag.build(g, { glow: glowM });
  g.userData.propId = 1; g.userData.level = 1;
  return g;
}

/* ---- lv2 2000s 临街首商 ---- */
function stage2() {
  var g = new THREE.Group(); g.name = 'prop1m_lv2';
  var bag = new Bag(), Y = LAY;
  basePlinth(bag);
  bldg(bag, Y.A, 'brick', 'roof', { rafters: [1] });
  bldg(bag, Y.B, 'brick', 'roofDk'); bldg(bag, Y.Cc, 'brick', 'roofDk');
  bldg(bag, Y.D, 'brick', 'roof'); bldg(bag, Y.E, 'brick', 'roof', { rafters: [1] });
  bldg(bag, Y.F, 'plaster', 'roof', { rafters: [1] });
  bldg(bag, Y.G, 'brick', 'roof', { rafters: [1] }); bldg(bag, Y.H, 'brick', 'roof', { rafters: [1] });
  chimney(bag, Y.B, 0.1, 1, 0.5);
  mossPatch(bag, Y.A, 0.1, 1, 0.7, 0.16, 0.08);
  mossPatch(bag, Y.H, -0.25, 1, 0.75, 0.12, 0.07);
  mossPatch(bag, Y.D, 0.3, 1, 0.8, 0.07, 0.1);
  var zA = Y.A.cz + Y.A.sz / 2, xD = Y.D.cx + Y.D.sx / 2, xE = Y.E.cx + Y.E.sx / 2;
  var zS = Y.F.cz + Y.F.sz / 2, zG = Y.G.cz + Y.G.sz / 2;
  /* 正房：门 + 铝窗混棂窗 + 壁挂空调 */
  redDoor(bag, Y.A.cx, 0.05, zA, 0.26, 0.34, 0, { steps: true });
  latticeWin(bag, Y.A.cx - 0.40, 0.29, zA, 0.24, 0.2, 0, { sill: true });
  modWin(bag, Y.A.cx + 0.40, 0.29, zA, 0.24, 0.2, 0);
  latticeWin(bag, Y.A.cx - 0.61, 0.29, zA, 0.1, 0.16, 0);
  acUnit(bag, Y.A.cx + 0.63, 0.38, zA + 0.048, 0, 0.2);
  /* 西厢院内 */
  redDoor(bag, xD, 0.05, Y.D.cz, 0.2, 0.3, PI / 2);
  latticeWin(bag, xD, 0.27, Y.D.cz - 0.3, 0.2, 0.17, PI / 2, { sill: true });
  modWin(bag, xD, 0.27, Y.D.cz + 0.3, 0.2, 0.17, PI / 2);
  /* 东厢临街 → 两间小铺 */
  storefront(bag, xE, 0.12, Y.E.cz - 0.25, 0.36, 0.22, PI / 2, { frame: 'woodDk', door: 0.1 });
  storefront(bag, xE, 0.12, Y.E.cz + 0.25, 0.36, 0.22, PI / 2, { frame: 'woodDk', door: -0.1 });
  awning(bag, 'red', xE, 0.375, Y.E.cz + 0.25, 0.4, 0.15, PI / 2);
  acUnit(bag, xE + 0.048, 0.32, Y.Cc.cz - 0.1, PI / 2, 0.15);
  latticeWin(bag, xE, 0.28, Y.Cc.cz + 0.14, 0.12, 0.12, PI / 2);
  /* 倒座西 → 副食百货（白瓷砖面 + 橱窗 + 条纹雨棚） */
  storefront(bag, Y.F.cx - 0.05, 0.12, zS, 0.64, 0.22, 0, { frame: 'woodDk', mull: 3, door: 0.22 });
  awning(bag, 'blue', Y.F.cx - 0.05, 0.375, zS, 0.7, 0.17, 0);
  /* 门楼 */
  redDoor(bag, Y.G.cx, 0.05, zG, 0.26, 0.38, 0, { drums: true, steps: true, knockers: true });
  bag.box('woodDk', 0.34, 0.03, 0.05, Y.G.cx, 0.505, zG + 0.02);
  lantern(bag, Y.G.cx - 0.24, 0.48, zG + 0.06, 1);
  lantern(bag, Y.G.cx + 0.24, 0.48, zG + 0.06, 1);
  screenWall(bag, Y.G.cx, 0.3);
  /* 倒座东 → 烟酒茶（东端挂公用电话） */
  storefront(bag, Y.H.cx, 0.12, zS, 0.56, 0.22, 0, { frame: 'woodDk', mull: 2, door: -0.2 });
  awning(bag, 'red', Y.H.cx + 0.12, 0.375, zS, 0.4, 0.15, 0);
  /* 屋顶设备：烟囱 + 太阳能热水器 + 卫星锅 + 天窗 */
  chimney(bag, Y.A, 0.38, 1, 0.55);
  solarHeater(bag, Y.E, 1, 0.05, 0.45);
  dish(bag, Y.H, 0.2, 1, 0.5);
  skylight(bag, Y.A, -0.32, 1, 0.5);
  /* 院内：槐树 + 库房棚 + 晾衣绳 + 石凳 + 盆栽 */
  tree(bag, -0.18, -0.16, 1.05, 11, 5);
  shed(bag, -0.6, 0.3);
  clothesline(bag, -0.34, 0.16, 0.06);
  stool(bag, 0.16, -0.5); stool(bag, -0.56, -0.5);
  shrubAt(bag, 'green2', 0.34, 0.16, -0.42, 0.07, 44, 1, 1);
  shrubAt(bag, 'green', 0.3, 0.13, 0.36, 0.06, 45, 1, 1);
  /* 临街：现代路灯 ×2 + 行道树 ×2 + 树坑 + 条凳 + 垃圾桶 + 花箱 */
  lampPost(bag, 0.3, 1.12, -PI / 2, true);
  lampPost(bag, 1.12, -0.35, 0, true);
  treePit(bag, -1.0, 1.08); tree(bag, -1.0, 1.08, 0.62, 21, 3, 0.15);
  treePit(bag, 1.08, 0.15); tree(bag, 1.08, 0.15, 0.62, 31, 3, 0.15, true);
  bench(bag, 0.62, 1.12, 0);
  trashBin(bag, 0.9, 1.13);
  planter(bag, -0.45, 1.13, 0.3, 0, 41);
  bikeRack(bag, -0.15, 1.16, 0);
  phoneBooth(bag, 0.88, 0.3, zS, 0);
  manhole(bag, 1.16, 0.7);
  /* 招牌 ×2 + 竖幌 */
  var sg = signMesh('副食百货', 0.5, 0.08, { bg: '#b8332a', fg: '#fff3d0', frameColor: '#f2d27a' });
  sg.position.set(Y.F.cx - 0.05, 0.405, zS + 0.075); g.add(sg);
  var sg2 = signMesh('烟酒茶', 0.42, 0.08, { bg: '#1d3f78', fg: '#ffffff', frameColor: '#d8e4f5' });
  sg2.position.set(Y.H.cx, 0.405, zS + 0.075); g.add(sg2);
  var sg3 = signMesh('理发', 0.06, 0.18, { vertical: true, bg: '#f4f4f4', fg: '#c0392b', frameColor: '#c0392b', ds: true });
  sg3.position.set(xE + 0.075, 0.3, Y.E.cz - 0.02); g.add(sg3);
  bag.box('frame', 0.09, 0.016, 0.016, xE + 0.04, 0.4, Y.E.cz - 0.02);
  /* 暖光内景（storefront/modWin 自带 glow 盒） */
  var glowM = glowMat(0.3);
  g.userData.anim = [function (t) { glowM.emissiveIntensity = 0.24 + 0.13 * Math.sin(t * 1.5); }];
  bag.build(g, { glow: glowM });
  g.userData.propId = 1; g.userData.level = 2;
  return g;
}

/* ---- lv3 2010s 文创改造 ---- */
function stage3() {
  var g = new THREE.Group(); g.name = 'prop1m_lv3';
  var bag = new Bag(), Y = LAY;
  basePlinth(bag);
  bldg(bag, Y.A, 'brick', 'roof', { rafters: [1] });
  bldg(bag, Y.B, 'brick', 'roofDk'); bldg(bag, Y.Cc, 'brick', 'roofDk');
  bldg(bag, Y.D, 'brick', 'roof'); bldg(bag, Y.E, 'brick', 'roof', { rafters: [1] });
  bldg(bag, Y.F, 'plaster', 'glass');                                   /* 玻璃坡顶 */
  bldg(bag, Y.G, 'brick', 'roof', { rafters: [1] });
  chimney(bag, Y.B, 0.1, 1, 0.5);
  bldg(bag, Y.H, 'brick', null, { flat: true });                        /* 加二层 */
  bag.box('stone', Y.H.sx + 0.03, 0.03, Y.H.sz + 0.03, Y.H.cx, 0.415, Y.H.cz, 0, 0, 0, SC.conc);
  bldg(bag, H2, 'plaster', 'roof', { y0: 0.43, noBase: true, rafters: [1] });
  mossPatch(bag, Y.A, 0.1, 1, 0.7, 0.16, 0.08);
  mossPatch(bag, Y.E, 0.2, 1, 0.75, 0.08, 0.12);
  mossPatch(bag, Y.B, -0.1, 1, 0.6, 0.06, 0.1);
  var zA = Y.A.cz + Y.A.sz / 2, xD = Y.D.cx + Y.D.sx / 2, xE = Y.E.cx + Y.E.sx / 2;
  var zS = Y.F.cz + Y.F.sz / 2, zG = Y.G.cz + Y.G.sz / 2;
  /* 正房：玻璃推拉门 + 棂窗 + 空调 + 天窗 ×2 */
  storefront(bag, Y.A.cx, 0.12, zA, 0.5, 0.28, 0, { mull: 3, glass: 'glassDk' });
  latticeWin(bag, Y.A.cx - 0.5, 0.29, zA, 0.14, 0.18, 0);
  modWin(bag, Y.A.cx + 0.5, 0.29, zA, 0.14, 0.18, 0);
  acUnit(bag, Y.A.cx - 0.63, 0.38, zA + 0.048, 0, 0.2);
  skylight(bag, Y.A, -0.32, 1, 0.5);
  skylight(bag, Y.A, 0.3, 1, 0.6);
  chimney(bag, Y.A, 0.38, 1, 0.55);
  /* 西厢院内：玻璃门 + 太阳能热水器（+x 坡） */
  storefront(bag, xD, 0.12, Y.D.cz, 0.3, 0.26, PI / 2, { mull: 2, glass: 'glassDk' });
  latticeWin(bag, xD, 0.28, Y.D.cz - 0.32, 0.16, 0.15, PI / 2);
  latticeWin(bag, xD, 0.28, Y.D.cz + 0.32, 0.16, 0.15, PI / 2);
  solarHeater(bag, Y.D, 1, 0.05, 0.4);
  skylight(bag, Y.D, -0.25, 1, 0.55);
  /* 东厢临街：整排玻璃门脸 ×2 + 金属雨棚 + 屋顶空调 */
  storefront(bag, xE, 0.12, Y.E.cz - 0.25, 0.38, 0.26, PI / 2, { door: 0.12, mull: 2 });
  storefront(bag, xE, 0.12, Y.E.cz + 0.25, 0.38, 0.26, PI / 2, { door: -0.12, mull: 2 });
  bag.boxO('frame', 0.8, 0.014, 0.16, xE + 0.08, 0.41, Y.E.cz, 0, PI / 2, 0, 'YXZ');
  bag.boxO('glass', 0.76, 0.01, 0.14, xE + 0.078, 0.402, Y.E.cz, 0.14, PI / 2, 0, 'YXZ');
  acUnit(bag, xE + 0.048, 0.34, Y.E.cz - 0.35, PI / 2, 0.15);
  latticeWin(bag, xE, 0.3, Y.Cc.cz, 0.13, 0.12, PI / 2);
  /* 倒座西 → 文创工社：通高玻璃 + 藤蔓 */
  storefront(bag, Y.F.cx, 0.12, zS, 0.78, 0.26, 0, { mull: 4, door: 0.3 });
  ivy(bag, Y.F.cx - 0.38, 0.14, zS - 0.005, 0.14, 0.3, 0, 51);
  ivy(bag, Y.F.cx + 0.4, 0.14, zS - 0.005, 0.12, 0.26, 0, 52);
  /* 门楼：红门 + 匾额 */
  redDoor(bag, Y.G.cx, 0.05, zG, 0.26, 0.38, 0, { drums: true, steps: true, knockers: true });
  bag.box('woodDk', 0.34, 0.03, 0.05, Y.G.cx, 0.505, zG + 0.02);
  screenWall(bag, Y.G.cx, 0.3);
  /* 倒座东 → COFFEE：玻璃门脸 + 深色雨棚 + 二层暖窗 ×3 */
  storefront(bag, Y.H.cx, 0.12, zS, 0.7, 0.26, 0, { mull: 3, door: -0.25 });
  awning(bag, 'dark', Y.H.cx + 0.05, 0.4, zS, 0.5, 0.14, 0);
  modWin(bag, Y.H.cx - 0.26, 0.585, zS, 0.16, 0.16, 0);
  modWin(bag, Y.H.cx, 0.585, zS, 0.16, 0.16, 0);
  modWin(bag, Y.H.cx + 0.26, 0.585, zS, 0.16, 0.16, 0);
  /* 院内：老槐 + 咖啡座 ×2 + 花箱 + 灯串 */
  tree(bag, -0.18, -0.16, 1.08, 11, 5);
  cafeTable(bag, 0.2, 0.1);
  cafeTable(bag, -0.5, 0.24);
  planter(bag, 0.02, -0.42, 0.3, 0, 61);
  stool(bag, -0.56, -0.5);
  stringLights(bag, -0.7, 0.36, 0.42, 0.38, 0.42);
  menuBoard(bag, -0.38, 1.03, 0);
  manhole(bag, 1.16, 0.7);
  /* 临街：行道树 ×3 + 路灯 ×2 + 花箱 ×3 + 外摆伞座 + 挡车柱 ×3 */
  treePit(bag, -1.0, 1.08); tree(bag, -1.0, 1.08, 0.64, 21, 3, 0.17);
  treePit(bag, 0.32, 1.08); tree(bag, 0.32, 1.08, 0.6, 22, 3, 0.16);
  treePit(bag, 1.08, -0.5); tree(bag, 1.08, -0.5, 0.62, 31, 3, 0.16, true);
  lampPost(bag, -0.4, 1.12, -PI / 2, true);
  lampPost(bag, 1.12, 0.35, 0, true);
  umbrella(bag, -0.64, 0.05, 1.14, 0.72);
  cafeTable(bag, -0.64, 1.14);
  planter(bag, 0.64, 1.15, 0.3, 0, 62);
  planter(bag, 1.13, 0.85, 0.3, PI / 2, 63);
  planter(bag, 1.13, -0.15, 0.3, PI / 2, 64);
  bollard(bag, -0.2, 1.2); bollard(bag, 0.0, 1.2); bollard(bag, 1.2, 0.62);
  trashBin(bag, 1.2, 1.2);
  /* 招牌 ×2 */
  var sg1 = signMesh('文创工社', 0.46, 0.09, { bg: '#22262b', fg: '#f2e9d8', frameColor: '#c8b490' });
  sg1.position.set(Y.F.cx, 0.415, zS + 0.075); g.add(sg1);
  var sg2 = signMesh('COFFEE', 0.09, 0.22, { vertical: true, bg: '#101317', fg: '#ffd9a0', frameColor: '#8a6d3b', ds: true });
  sg2.position.set(Y.H.cx + 0.44, 0.3, zS + 0.07); sg2.rotation.y = PI / 2; g.add(sg2);
  bag.box('frame', 0.016, 0.016, 0.1, Y.H.cx + 0.44, 0.418, zS + 0.05);
  /* 暖光（storefront/modWin 自带 glow 盒） */
  var glowM = glowMat(0.32);
  g.userData.anim = [function (t) { glowM.emissiveIntensity = 0.26 + 0.12 * Math.sin(t * 1.6); }];
  bag.build(g, { glow: glowM });
  g.userData.propId = 1; g.userData.level = 3;
  return g;
}

/* ---- lv4 2020s 全新运营 ---- */
function stage4() {
  var g = new THREE.Group(); g.name = 'prop1m_lv4';
  var bag = new Bag(), Y = LAY;
  basePlinth(bag);
  /* 正房 → 平屋顶露台（混凝土板 + 木平台 + 三面玻璃栏板 + 楼梯间 + 廊架藤蔓 + 伞座 + 花箱） */
  bldg(bag, Y.A, 'brick', null, { flat: true });
  bag.box('conc', Y.A.sx + 0.06, 0.045, Y.A.sz + 0.1, Y.A.cx, 0.475, Y.A.cz, 0, 0, 0, SC.conc);
  bag.box('wood', Y.A.sx - 0.02, 0.022, Y.A.sz - 0.02, Y.A.cx, 0.508, Y.A.cz, 0, 0, 0, SC.plank);
  glassRail(bag, Y.A.cx, 0.52, Y.A.cz + Y.A.sz / 2 - 0.02, Y.A.sx - 0.06, 0);
  glassRail(bag, Y.A.cx - Y.A.sx / 2 + 0.02, 0.52, Y.A.cz, Y.A.sz - 0.06, PI / 2);
  glassRail(bag, Y.A.cx + Y.A.sx / 2 - 0.02, 0.52, Y.A.cz, Y.A.sz - 0.06, PI / 2);
  bag.box('brick', 0.24, 0.2, 0.24, Y.A.cx + Y.A.sx / 2 - 0.14, 0.62, Y.A.cz - Y.A.sz / 2 + 0.14, 0, 0, 0, SC.brick);
  bag.box('stone', 0.26, 0.024, 0.26, Y.A.cx + Y.A.sx / 2 - 0.14, 0.732, Y.A.cz - Y.A.sz / 2 + 0.14, 0, 0, 0, SC.conc);
  pergola(bag, Y.A.cx - 0.36, 0.52, Y.A.cz, 0.5, 0.42, 0.26, 71);
  umbrella(bag, Y.A.cx + 0.18, 0.52, Y.A.cz + 0.04, 0.85);
  cafeTable(bag, Y.A.cx + 0.18, Y.A.cz + 0.04, 0.52);
  planter(bag, Y.A.cx - 0.02, Y.A.cz - Y.A.sz / 2 + 0.1, 0.34, 0, 72, 0.52);
  shrubAt(bag, 'green', Y.A.cx - Y.A.sx / 2 + 0.1, 0.6, Y.A.cz + Y.A.sz / 2 - 0.12, 0.08, 73, 1, 1);
  /* 西耳房瓦顶 / 西厢瓦顶 + 太阳能板阵 / 东耳房并入玻璃大厅 */
  bldg(bag, Y.B, 'brick', 'roofDk');
  chimney(bag, Y.B, 0.1, 1, 0.5);
  bldg(bag, Y.D, 'brick', 'roof', { rafters: [1] });
  solarRow(bag, Y.D, 1, -0.4, 0.4, 0.2, 0.55, 5);
  solarRow(bag, Y.D, 1, -0.4, 0.4, 0.6, 0.95, 5);
  glassHall(bag, { cx: 0.73, cz: -0.77, sx: 0.48, sz: 0.86, h: 0.46, rise: 0.22, ridge: 'z' });
  /* 东厢（缩短）+ 倒座 */
  var E4 = { cx: 0.74, cz: 0.04, sx: 0.46, sz: 0.68, h: 0.36, rise: 0.17, ridge: 'z' };
  bldg(bag, E4, 'brick', 'roof', { rafters: [1] });
  bldg(bag, Y.F, 'plaster', 'glass');
  bldg(bag, Y.G, 'brick', 'roof', { rafters: [1] });
  bldg(bag, Y.H, 'brick', null, { flat: true });
  bag.box('stone', Y.H.sx + 0.03, 0.03, Y.H.sz + 0.03, Y.H.cx, 0.415, Y.H.cz, 0, 0, 0, SC.conc);
  bldg(bag, H2, 'plaster', 'roof', { y0: 0.43, noBase: true, rafters: [1] });
  mossPatch(bag, Y.B, -0.1, 1, 0.6, 0.06, 0.1);
  mossPatch(bag, E4, 0.1, 1, 0.7, 0.08, 0.1);
  mossPatch(bag, Y.G, 0.05, 1, 0.65, 0.1, 0.07);
  var zA = Y.A.cz + Y.A.sz / 2, xD = Y.D.cx + Y.D.sx / 2, xE = E4.cx + E4.sx / 2;
  var zS = Y.F.cz + Y.F.sz / 2, zG = Y.G.cz + Y.G.sz / 2;
  /* 正房南立面 → 通高黑框幕墙 ×2 */
  storefront(bag, Y.A.cx - 0.3, 0.12, zA, 0.56, 0.3, 0, { mull: 2, glass: 'glassDk' });
  storefront(bag, Y.A.cx + 0.32, 0.12, zA, 0.5, 0.3, 0, { mull: 2, glass: 'glassDk', door: 0.12 });
  acUnit(bag, Y.A.cx - 0.68, 0.42, zA + 0.048, 0, 0.2);
  /* 西厢院内立面：玻璃门 + 棂窗 */
  storefront(bag, xD, 0.12, Y.D.cz, 0.3, 0.26, PI / 2, { mull: 2, glass: 'glassDk' });
  latticeWin(bag, xD, 0.28, Y.D.cz - 0.32, 0.16, 0.15, PI / 2);
  latticeWin(bag, xD, 0.28, Y.D.cz + 0.32, 0.16, 0.15, PI / 2);
  /* 东厢临街：极简黑框门脸 */
  storefront(bag, xE, 0.12, E4.cz, 0.4, 0.26, PI / 2, { mull: 2, door: 0.1 });
  /* 倒座西 → 咖啡（玻璃顶延续）+ 外摆 */
  storefront(bag, Y.F.cx, 0.12, zS, 0.78, 0.26, 0, { mull: 4, door: 0.3 });
  ivy(bag, Y.F.cx - 0.38, 0.14, zS - 0.005, 0.16, 0.32, 0, 51);
  ivy(bag, Y.F.cx + 0.4, 0.14, zS - 0.005, 0.13, 0.28, 0, 52);
  /* 门楼：黑框玻璃门 + 匾额 + 灯笼 */
  storefront(bag, Y.G.cx, 0.12, zG, 0.3, 0.3, 0, { mull: 2, glass: 'glassDk', door: 0 });
  screenWall(bag, Y.G.cx, 0.3);
  lantern(bag, Y.G.cx - 0.22, 0.48, zG + 0.05, 0.9);
  lantern(bag, Y.G.cx + 0.22, 0.48, zG + 0.05, 0.9);
  /* 倒座东：黑框门脸 + 二层暖窗 */
  storefront(bag, Y.H.cx, 0.12, zS, 0.7, 0.26, 0, { mull: 3, door: -0.25 });
  awning(bag, 'dark', Y.H.cx + 0.05, 0.4, zS, 0.5, 0.14, 0);
  modWin(bag, Y.H.cx - 0.26, 0.585, zS, 0.16, 0.16, 0);
  modWin(bag, Y.H.cx, 0.585, zS, 0.16, 0.16, 0);
  modWin(bag, Y.H.cx + 0.26, 0.585, zS, 0.16, 0.16, 0);
  /* 院内：老槐（前移露出屋顶露台）+ 外摆 + 灯串 */
  tree(bag, -0.3, -0.02, 1.1, 11, 5);
  cafeTable(bag, 0.24, 0.14);
  cafeTable(bag, 0.22, -0.4);
  planter(bag, -0.66, -0.5, 0.3, 0, 81);
  stringLights(bag, -0.72, 0.36, 0.44, 0.38, 0.44);
  menuBoard(bag, -0.38, 1.03, 0);
  manhole(bag, 1.16, 0.7);
  /* 临街：行道树 ×3 + 路灯 ×2 + 花箱 ×4 + 挡车柱 ×3 + 外摆伞座 ×2 */
  treePit(bag, -1.0, 1.08); tree(bag, -1.0, 1.08, 0.64, 21, 3, 0.18);
  treePit(bag, 0.32, 1.08); tree(bag, 0.32, 1.08, 0.6, 22, 3, 0.17);
  treePit(bag, 1.08, -0.5); tree(bag, 1.08, -0.5, 0.62, 31, 3, 0.17, true);
  lampPost(bag, -0.25, 1.12, -PI / 2, true);
  lampPost(bag, 1.12, 0.35, 0, true);
  umbrella(bag, -0.64, 0.05, 1.14, 0.72);
  cafeTable(bag, -0.64, 1.14);
  umbrella(bag, 1.0, 0.05, 1.14, 0.72);
  cafeTable(bag, 1.0, 1.14);
  planter(bag, 0.62, 1.15, 0.3, 0, 82);
  planter(bag, 1.13, 0.85, 0.3, PI / 2, 84);
  planter(bag, 1.13, -0.15, 0.3, PI / 2, 85);
  bollard(bag, -0.2, 1.2); bollard(bag, 0.0, 1.2); bollard(bag, 1.2, 0.55);
  trashBin(bag, 1.2, 1.2);
  /* 匾额 + 霓虹字号 */
  var sg1 = signMesh('南锣鼓巷', 0.3, 0.07, { bg: '#3a2a1c', fg: '#e8d39a', frameColor: '#c9a961' });
  sg1.position.set(Y.G.cx, 0.478, zG + 0.046); g.add(sg1);
  var neon = signMesh('NLG·COFFEE', 0.4, 0.075, { bg: '#101317', frame: false, fg: '#ffd9a0', neon: true, neonColor: '#ffbe6e' });
  neon.position.set(Y.F.cx, 0.415, zS + 0.075); g.add(neon);
  /* 暖光（storefront/modWin/glassHall 自带 glow 盒）+ 霓虹闪烁（两项动画封顶） */
  var glowM = glowMat(0.34);
  var neonM = neon.userData.signMat;
  g.userData.anim = [
    function (t) { glowM.emissiveIntensity = 0.3 + 0.1 * Math.sin(t * 1.7); },
    function (t) { neonM.emissiveIntensity = 0.35 + 0.55 * (Math.sin(t * 6.8) > -0.35 ? 1 : 0.25) * (0.8 + 0.2 * Math.sin(t * 12.4)); }
  ];
  bag.build(g, { glow: glowM });
  g.userData.propId = 1; g.userData.level = 4;
  return g;
}

/* 沙盘：人行道石板 + 双向路缘 + 院心青砖地 */
function basePlinth(bag) {
  bag.box('pave', 2.5, 0.05, 2.5, 0, 0.025, 0, 0, 0, 0, SC.pave);
  bag.box('stone', 2.5, 0.026, 0.055, 0, 0.063, 1.222, 0, 0, 0, SC.conc);
  bag.box('stone', 0.055, 0.026, 2.5, 1.222, 0.063, 0, 0, 0, SC.conc);
  bag.box('court', 1.3, 0.012, 1.14, -0.14, 0.056, -0.11, 0, 0, 0, SC.court);
}

/* ================= 7. 出口 ================= */
window.Props3DModern[1] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0));
  if (lv === 1) return stage1();
  if (lv === 2) return stage2();
  if (lv === 3) return stage3();
  return stage4();
};

})();
