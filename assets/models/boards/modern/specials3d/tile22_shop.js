/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/specials3d/tile22_shop.js  格 22「道具商店」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/special_22.png（2020s 单象限，写实航拍 3/4 视角两层独栋主题零售店）：
 *   屋顶    ：平屋顶中灰混凝土（分缝 + 色斑）+ 女儿墙奶油色栏板 + 宝瓶栏杆（顶轨 + 细柱列）
 *             + 薄橙压顶线 + 屋顶设备（混凝土机组箱带格栅/风扇/顶格栅 + 小机组 + 沿后檐长天窗条
 *             + 钢百叶通风口 + 地漏 + 避雷针 ×2）
 *   二层    ：通长橙色招牌带（白云 + 青绿半圆日升 + 描边店名）+ 窗顶奶油檐线 + 通长玻璃橱窗
 *             （深棕框 + 竖梃 ×8 + 横梃、透出暖光卖场、吊顶灯板与两排彩色商品货架）
 *   楼层间  ：奶油色腰线带
 *   一层    ：安平雨棚（青绿棚顶微前倾 + 深青绿封檐板 + 侧封板 + 左段橙雨篷/右段橙下缘 + 斜拉杆
 *             对齐竖梃 + 棚底板）+ 大面积玻璃 storefront（深棕框竖梃 + 后退中央双开门 + 拉手
 *             + 门楣灯带 + 营业挂牌 + 地垫 + 门槛 + 门内迎宾陈列堆/货架/收银台）
 *   角部    ：左角琥珀木纹竖条格栅屏 ×9（两楼层通高）+ 右角橙色竖翼板 ×6 包角 + 右角小灯箱
 *   侧墙    ：暖浅灰涂料墙 + 勒脚 + 两幅竖版海报（奶油细框 + 鹅颈壁灯）+ 落水管/管卡 + 设备门/空调
 *   店前    ：浅暖灰石板广场（分格缝 + 深灰路缘 + 45° 切角缘石 + 前沿人行道/沥青镶边 + 入口铺装带）
 *             + 条纹篷促销推车（裙板/车轮/木柱/条纹篷/篷沿/台面商品）+ 木制移动陈列架（三层商品
 *             + 价签 + 万向轮）+ A 字促销牌 + 木花箱粉花 + 白陶盆粉花 ×2 + 绿篱带 ×2 + 树池
 *             + 灌木 + 乔木 ×3（四簇层叠树冠）
 *
 * 注册：window.Special3DModern[22]() → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.7×2.7（实测 2.68×2.68，高 ≈1.45 含避雷针）；底面 y=0；正面 +z（店门/广场朝 +z）；
 *       draw call ≤60（实测 34）；三角 ≤28k（实测 20.8k）；Canvas 纹理 ≤512px（最大 512×96）；
 *       源码零 Math.random（mulberry32 种子流）；
 *       动画 2 项：卖场暖光呼吸（0.72±0.12）+ 招牌带微脉冲（0.22±0.08）（≤2 项封顶，幅度克制）。
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils，对齐已验收范例
 *       tile5_station.js / tile25_ferry_harbor.js）——静态件全部合并为每材质 1 个 mesh
 *       （30 材质桶）+ 招牌 / 海报 ×2 / 卖场内景（合并双平面）= 34 draw call；
 *       建筑为空心壳体（背墙/侧墙/楼板/顶棚独立，墙体双面），暖光内景平面置于后墙前（z -0.28），
 *       3D 货架/陈列堆位于玻璃之后、内景之前，透过 opacity 0.22 玻璃呈现进深；
 *       玻璃用单面 Plane（UV 0..1 完整映射反射渐变，隔扇翻转打散反射条）；商品用彩色自发光小盒阵列。
 *
 * R1（初版全量搭建）：沙盘广场/壳体/女儿墙栏杆/屋顶设备/招牌带/橱窗+内景+货架/腰线/雨棚/storefront
 *   +双开门/角部格栅+翼板/侧墙海报+壁灯/落水管/推车+陈列架+A 字牌/花箱陶盆灌木乔木。
 * R1→R2（差距 12 条）：①雨棚由薄板改深青绿封檐板 + 橙下缘 ②栏杆变细压顶变薄 ③屋面调暗
 *   ④玻璃降斜纹/opacity、内景提亮、商品自发光 ⑤门玻璃加高、底框变薄、白门槛、迎宾陈列堆
 *   ⑥招牌文字放大、云/半圆重排 ⑦推车/陈列架/花盆放大 ⑧树冠三簇→四簇 ⑨前沿镶边收窄
 *   ⑩壁灯放大 ⑪屋顶天窗条加长移后檐 ⑫橱窗内加第二排货架。
 * R2→R3（差距 11 条）：①进深 1.30→1.43（参数化 FD）②压顶 0.05→0.03 ③玻璃 opacity 0.3 + 竖梃加粗
 *   + 内景贴图降饱和 ④云朵移出格栅遮挡 ⑤门后退 0.03 + 门挺加粗 + 地垫 + 门楣灯带 ⑥木条 6→9、
 *   翼板 4→6 ⑦机组箱调暗 + 顶格栅 + 小机组 ⑧花球加倍 ⑨墙色暖浅灰 ⑩路缘加深加宽 ⑪一层内景提亮。
 * R3→R4（差距 10 条）：①雨棚收窄至角部竖屏之间（消除穿模）+ 侧封板 + 右角灯箱 ②玻璃 opacity 0.22
 *   + 内景平面移至后墙前使 3D 货架可见 ③栏杆 33→25 根 ④橙色提亮 #f0913f ⑤窗顶奶油檐线、橙带 0.12
 *   ⑥推车贴左角、陈列架移右窗前 ⑦入口铺装带 + 人行道分色 ⑧屋面再降 ⑨壁灯加大 ⑩陈列堆前移。
 * R4→R5（差距 10 条）：①两层吊顶灯板 ②侧墙勒脚 ③绿篱带 ×2 + 树池 ×3 ④侧封板内移/灯箱前移
 *   ⑤玻璃反射增强 ⑥通风口改钢百叶 ⑦入口铺装带收窄 ⑧店名 60px + 描边 ⑨推车篷加大加倾 ⑩灯箱灯片。
 * R5→R6（差距 11 条）：①屋顶设备布局对齐参考（机组箱中偏左/长条右后）②雨棚橙下缘分左深右薄
 *   ③二层横梃 ④海报奶油框 ⑤树放大重定位（消除穿墙）⑥墙斑点减半 ⑦翼板高度校正 ⑧前沿分色带错位
 *   ⑨营业挂牌 ⑩前角 45° 切角缘石 ⑪绿篱球抬至带顶。
 * R6→R7（差距 10 条）：①拉杆对齐竖梃 ②横梃进深消共面 ③右前树移位消穿模 ④木纹贴图 ⑤角部灌木成簇
 *   ⑥树冠提亮 ⑦避雷针 ×2 ⑧玻璃隔扇翻转 ⑨地垫加宽 ⑩陈列架价签。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[boards/modern/specials3d/tile22_shop] THREE 未定义，请先加载 three.min.js (r147)');
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

/* ================= 1. Canvas 程序纹理（≤512px；懒建单例） ================= */
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
/* 广场石板：暖浅灰大板 + 十字分缝 + 倒角受光/阴影边 + 色差斑 */
function texPave() {
  return cvTex('s22pave', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#c7c3ba'; g.fillRect(0, 0, w, h);
    var r, c, s = 64;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.92 + rnd() * 0.16, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(208 * v) + ',' + Math.round(204 * v) + ',' + Math.round(194 * v) + ')';
      g.fillRect(x + 3, y + 3, s - 6, s - 6);
      g.fillStyle = 'rgba(255,252,244,0.32)'; g.fillRect(x + 3, y + 3, s - 6, 2); g.fillRect(x + 3, y + 3, 2, s - 6);
      g.fillStyle = 'rgba(88,84,74,0.22)'; g.fillRect(x + 3, y + s - 5, s - 6, 2); g.fillRect(x + s - 5, y + 3, 2, s - 6);
      if (rnd() < 0.3) { g.fillStyle = 'rgba(130,124,110,0.13)'; g.fillRect(x + 8 + ((rnd() * 24) | 0), y + 8 + ((rnd() * 24) | 0), 12 + ((rnd() * 20) | 0), 6 + ((rnd() * 12) | 0)); }
    }
    speckle(g, w, h, rnd, 130, 'rgba(112,106,94,0.15)', 'rgba(244,240,230,0.18)', 12, 6);
  });
}
/* 平屋顶混凝土：中灰 + 分块缝 + 斑（参考屋面明显暗于广场铺装） */
function texRoof() {
  return cvTex('s22roof', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#aaa8a1'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 120, 'rgba(90,88,82,0.26)', 'rgba(200,198,190,0.2)', 5, 3);
    g.strokeStyle = 'rgba(70,68,62,0.5)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 42); g.lineTo(w, 42); g.moveTo(0, 96); g.lineTo(w, 96);
    g.moveTo(52, 0); g.lineTo(52, h); g.moveTo(104, 0); g.lineTo(104, h); g.stroke();
    g.fillStyle = 'rgba(60,58,52,0.18)'; g.fillRect(0, h - 10, w, 10);
  });
}
/* 暖灰涂料墙：细腻斑点 + 淡横缝 + 根部污带 */
function texWall() {
  return cvTex('s22wall', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#d9d2c4'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 60, 'rgba(150,142,126,0.12)', 'rgba(246,242,232,0.16)', 5, 3);
    g.fillStyle = 'rgba(140,128,104,0.16)'; g.fillRect(0, 63, w, 2);
    g.fillStyle = 'rgba(120,110,92,0.15)'; g.fillRect(0, h - 12, w, 12);
  });
}
/* 橱窗玻璃：明亮天空反射竖向渐变 + 斜高光带 + 边框阴影（单面板整贴 UV 0..1） */
function texGlass() {
  return cvTex('s22glass', 128, 128, function (g, w, h) {
    var y;
    for (y = 0; y < h; y++) {
      var t = y / h, v = 0.9 - 0.18 * t;
      g.fillStyle = 'rgb(' + Math.round(158 * v) + ',' + Math.round(196 * v) + ',' + Math.round(216 * v) + ')';
      g.fillRect(0, y, w, 1);
    }
    g.fillStyle = 'rgba(255,255,255,0.3)';
    g.beginPath(); g.moveTo(14, 0); g.lineTo(40, 0); g.lineTo(92, h); g.lineTo(66, h); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.14)';
    g.beginPath(); g.moveTo(58, 0); g.lineTo(68, 0); g.lineTo(120, h); g.lineTo(110, h); g.closePath(); g.fill();
    g.fillStyle = 'rgba(46,60,70,0.22)'; g.fillRect(0, 0, 4, h); g.fillRect(w - 4, 0, 4, h);
    g.fillStyle = 'rgba(255,255,255,0.2)'; g.fillRect(0, 0, w, 6);
  });
}
/* 橙色招牌带：橙底渐变 + 白云 + 青绿半圆日升 + 店名 + 上下暗橙收边 */
function texSign() {
  return cvTex('s22sign', 512, 96, function (g, w, h, rnd) {
    var x;
    for (x = 0; x < w; x++) {
      var t = x / w, v = 1 + 0.06 * Math.sin(t * 6.283 * 1.5 + 1.2);
      g.fillStyle = 'rgb(' + Math.round(240 * v) + ',' + Math.round(148 * v) + ',' + Math.round(64 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    speckle(g, w, h, rnd, 40, 'rgba(160,84,28,0.14)', 'rgba(255,206,150,0.16)', 8, 4);
    g.fillStyle = 'rgba(170,92,34,0.55)'; g.fillRect(0, 0, w, 4); g.fillRect(0, h - 4, w, 4);
    /* 白云（左 ~11%）：三圆组合 */
    function cloud(cx, cy, s) {
      g.fillStyle = '#faf6ee';
      g.beginPath(); g.arc(cx, cy, 13 * s, 0, PI * 2); g.arc(cx + 15 * s, cy - 7 * s, 11 * s, 0, PI * 2);
      g.arc(cx + 30 * s, cy, 12 * s, 0, PI * 2); g.fill();
      g.fillRect(cx - 13 * s, cy, 43 * s, 13 * s);
    }
    cloud(84, 44, 1.15);
    /* 青绿半圆日升（~66%）：半圆 + 白色小圆点 */
    g.fillStyle = '#2fa9a2';
    g.beginPath(); g.arc(340, h - 5, 36, PI, PI * 2); g.fill();
    g.fillStyle = 'rgba(250,246,238,0.85)';
    g.beginPath(); g.arc(340, h - 5, 21, PI * 1.15, PI * 1.85); g.arc(340, h - 5, 13, PI * 1.85, PI * 1.15, true); g.fill();
    /* 店名 */
    g.fillStyle = '#fdf8ef'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 60px "Microsoft YaHei","PingFang SC",sans-serif';
    g.strokeStyle = '#b85a1e'; g.lineWidth = 4; g.strokeText('道具商店', 214, 50);
    g.fillText('道具商店', 214, 50);
  });
}
/* 海报 A（青绿底 + 奶油角色 + 粉/黄点缀 + 白框） */
function texPosterA() {
  return cvTex('s22posA', 128, 256, function (g, w, h, rnd) {
    g.fillStyle = '#37aca4'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 40, 'rgba(24,88,84,0.25)', 'rgba(150,220,212,0.2)', 6, 4);
    g.fillStyle = '#f6efdd';
    g.beginPath(); g.arc(64, 96, 34, 0, PI * 2); g.fill();
    g.fillStyle = '#2e7f7a';
    g.beginPath(); g.arc(52, 92, 5, 0, PI * 2); g.arc(76, 92, 5, 0, PI * 2); g.fill();
    g.fillStyle = '#e8873f'; g.beginPath(); g.arc(64, 106, 9, 0, PI); g.fill();
    g.fillStyle = '#f2c14e';
    g.beginPath(); g.arc(30, 170, 12, 0, PI * 2); g.fill();
    g.fillStyle = '#f0a3b8';
    g.beginPath(); g.arc(92, 190, 15, 0, PI * 2); g.fill();
    g.fillStyle = '#fdf8ef'; g.fillRect(24, 222, 80, 12);
    g.strokeStyle = 'rgba(250,246,238,0.9)'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
  });
}
/* 海报 B（粉→蓝竖向渐变 + 橙拱 + 粉团 + 白框） */
function texPosterB() {
  return cvTex('s22posB', 128, 256, function (g, w, h, rnd) {
    var y;
    for (y = 0; y < h; y++) {
      var t = y / h;
      g.fillStyle = 'rgb(' + Math.round(246 - 30 * t) + ',' + Math.round(214 - 10 * t) + ',' + Math.round(222 + 20 * t) + ')';
      g.fillRect(0, y, w, 1);
    }
    speckle(g, w, h, rnd, 30, 'rgba(200,160,180,0.18)', 'rgba(255,255,255,0.2)', 6, 4);
    g.fillStyle = '#f0954a';
    g.beginPath(); g.arc(64, 150, 30, PI, PI * 2); g.fill();
    g.fillStyle = '#37aca4';
    g.beginPath(); g.arc(46, 176, 14, 0, PI * 2); g.fill();
    g.fillStyle = '#f2c14e';
    g.beginPath(); g.arc(84, 168, 11, 0, PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.75)';
    g.beginPath(); g.arc(38, 70, 10, 0, PI * 2); g.arc(80, 56, 7, 0, PI * 2); g.arc(100, 92, 5, 0, PI * 2); g.fill();
    g.strokeStyle = 'rgba(252,248,240,0.9)'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
  });
}
/* 卖场内景（map + emissiveMap）：暖光 + 白货架三层 + 彩色商品块 + 顶部灯带 */
function texInner() {
  return cvTex('s22inner', 256, 128, function (g, w, h, rnd) {
    g.fillStyle = '#fbf3df'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(214,186,138,0.5)'; g.fillRect(0, h - 22, w, 22);
    var cols = ['#f0a3b8', '#f2c14e', '#82b4dc', '#e06a5a', '#7cc49a', '#fdf8ef'], i;
    for (i = 0; i < 3; i++) {
      var sy = 18 + i * 34;
      g.fillStyle = 'rgba(120,96,60,0.55)'; g.fillRect(6, sy + 26, w - 12, 4);
      for (var k = 0; k < 16; k++) {
        g.fillStyle = cols[(rnd() * 6) | 0];
        g.fillRect(10 + k * 15 + ((rnd() * 3) | 0), sy + 6 + ((rnd() * 8) | 0), 7 + ((rnd() * 4) | 0), 16 + ((rnd() * 4) | 0));
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.fillRect(10 + k * 15, sy + 6, 3, 10);
      }
    }
    g.fillStyle = 'rgba(255,244,214,0.9)';
    for (i = 0; i < 8; i++) g.fillRect(8 + i * 31, 2, 20, 5);
  });
}
/* 琥珀木格栅：竖向木纹 */
function texWood() {
  return cvTex('s22wood', 64, 64, function (g, w, h, rnd) {
    g.fillStyle = '#d99c50'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 16; i++) {
      g.fillStyle = i % 2 ? 'rgba(120,70,20,0.2)' : 'rgba(255,222,160,0.18)';
      g.fillRect((rnd() * w) | 0, 0, 1 + ((rnd() * 2) | 0), h);
    }
    g.fillStyle = 'rgba(120,70,20,0.12)'; g.fillRect(0, 30, w, 2);
  });
}
/* 推车条纹篷：橙白竖条 */
function texStripe() {
  return cvTex('s22stripe', 64, 64, function (g, w, h) {
    for (var i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#fdf6ea' : '#ee9440';
      g.fillRect(i * 8, 0, 8, h);
    }
  });
}
/* A 字促销牌面：白底 + 彩色笔画 */
function texAframe() {
  return cvTex('s22afr', 64, 64, function (g, w, h) {
    g.fillStyle = '#fbf7ee'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ee9440'; g.fillRect(6, 6, 52, 12);
    g.fillStyle = '#37aca4'; g.fillRect(10, 26, 44, 5);
    g.fillStyle = '#f0a3b8'; g.fillRect(10, 36, 30, 5);
    g.fillStyle = '#f2c14e'; g.fillRect(10, 46, 38, 5);
  });
}

/* ================= 2. 材质（静态件模块级单例；发光件每实例新建） ================= */
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
    pave:   M('#ffffff', { map: texPave(), rough: 0.95 }),
    roof:   M('#ffffff', { map: texRoof(), rough: 0.92 }),
    wall:   M('#ffffff', { map: texWall(), rough: 0.9, ds: true }),
    stripe: M('#ffffff', { map: texStripe(), rough: 0.8, ds: true }),
    curb:   M('#9c988f', { rough: 0.95 }),
    pave2:  M('#d9d4c9', { rough: 0.95 }),
    asphalt:M('#75726c', { rough: 0.97 }),
    cream:  M('#f1e7d3', { rough: 0.75 }),
    orange: M('#f0913f', { rough: 0.6 }),
    teal:   M('#2fa9a2', { rough: 0.6 }),
    frame:  M('#4a3e33', { rough: 0.55, metal: 0.15 }),
    steel:  M('#8b9298', { rough: 0.4, metal: 0.75 }),
    dark:   M('#33373a', { rough: 0.6, metal: 0.2 }),
    white:  M('#f5f2ea', { rough: 0.8 }),
    glass:  M('#ffffff', { map: texGlass(), rough: 0.06, metal: 0.6, tr: 0.22 }),
    wood:   M('#ffffff', { map: texWood(), rough: 0.7 }),
    concP:  M('#c3c1b9', { rough: 0.9 }),
    trunk:  M('#8a6f52', { rough: 0.9 }),
    leaf:   M('#ffffff', { map: texLeaf(), rough: 0.95 }),
    leaf2:  M('#b8cb92', { map: texLeaf(), rough: 0.95 }),
    hedge:  M('#5d8040', { rough: 1 }),
    mPink:  M('#f0a3b8', { rough: 0.6, emissive: '#f0a3b8', ei: 0.38 }),
    mYellow:M('#f2c14e', { rough: 0.6, emissive: '#f2c14e', ei: 0.38 }),
    mBlue:  M('#82b4dc', { rough: 0.6, emissive: '#82b4dc', ei: 0.38 }),
    mRed:   M('#e06a5a', { rough: 0.6, emissive: '#e06a5a', ei: 0.38 }),
    mGreen: M('#7cc49a', { rough: 0.6, emissive: '#7cc49a', ei: 0.38 }),
    mWhite: M('#fdf8ef', { rough: 0.6, emissive: '#fdf8ef', ei: 0.38 }),
    flower: M('#ef93ae', { rough: 0.7 }),
    flower2:M('#f6c8d4', { rough: 0.7 }),
    aframe: M('#ffffff', { map: texAframe(), rough: 0.8, ds: true })
  };
  return MATS;
}
/* 树冠叶斑（三层明暗叶簇） */
function texLeaf() {
  return cvTex('s22leaf', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#7f9c5e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) {
      var v = rnd();
      g.fillStyle = v < 0.5 ? 'rgba(46,78,34,0.42)' : v < 0.8 ? 'rgba(150,186,100,0.5)' : 'rgba(200,216,140,0.35)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 4 + ((rnd() * 12) | 0), 3 + ((rnd() * 8) | 0));
    }
  });
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
var SC = { pave: 1.4, roof: 1.1, wall: 1.1, stripe: 5.5 };
Bag.prototype.box = function (key, w, h, d, x, y, z, rx, ry, rz, sc) {
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, sc !== undefined ? sc : 1);
  this.put(key, g, m4(x, y, z, rx, ry, rz));
};
Bag.prototype.cyl = function (key, rt, rb, h, x, y, z, rx, ry, rz, seg) {
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 12), m4(x, y, z, rx, ry, rz));
};
Bag.prototype.sph = function (key, r, x, y, z, ws, hs) {
  this.put(key, new THREE.SphereGeometry(r, ws || 16, hs || 12), m4(x, y, z));
};
Bag.prototype.plane = function (key, w, h, x, y, z, rx, ry, rz) {
  this.put(key, new THREE.PlaneGeometry(w, h), m4(x, y, z, rx, ry, rz));
};

/* ================= 4. 预制构件 ================= */
var MERCH = ['mPink', 'mYellow', 'mBlue', 'mRed', 'mGreen', 'mWhite'];
function merchRow(bag, x0, x1, y, z, n, rnd) {
  for (var i = 0; i < n; i++) {
    var w = 0.022 + rnd() * 0.02, h = 0.028 + rnd() * 0.036, d = 0.022 + rnd() * 0.02;
    var x = x0 + (i + 0.5) * (x1 - x0) / n;
    bag.box(MERCH[(rnd() * 6) | 0], w, h, d, x, y + h / 2, z + (rnd() - 0.5) * 0.03);
  }
}
/* 乔木（干 + 四簇层叠树冠：主冠 + 两侧偏冠 + 顶冠） */
function tree(bag, x, z, s) {
  bag.cyl('trunk', 0.016 * s, 0.024 * s, 0.30 * s, x, 0.05 + 0.15 * s, z, 0, 0, 0, 12);
  bag.sph('leaf', 0.15 * s, x, 0.05 + 0.37 * s, z);
  bag.sph('leaf2', 0.115 * s, x + 0.11 * s, 0.05 + 0.3 * s, z + 0.06 * s);
  bag.sph('leaf', 0.1 * s, x - 0.1 * s, 0.05 + 0.32 * s, z - 0.06 * s);
  bag.sph('leaf2', 0.085 * s, x + 0.03 * s, 0.05 + 0.47 * s, z - 0.02 * s);
}
function shrub(bag, x, z, s) { bag.sph('hedge', s, x, 0.05 + s * 0.75, z); }
/* 鹅颈壁灯（底座 + 弯臂 + 灯罩 + 灯头；dir=+1 朝 +x） */
function wallLamp(bag, x, y, z, dir) {
  bag.box('dark', 0.012, 0.04, 0.04, x, y, z);
  bag.cyl('dark', 0.007, 0.007, 0.15, x + 0.058 * dir, y + 0.062, z, 0, 0, -1.15 * dir, 8);
  bag.cyl('dark', 0.044, 0.016, 0.05, x + 0.122 * dir, y + 0.078, z, 0, 0, -0.5 * dir, 12);
  bag.sph('mWhite', 0.018, x + 0.13 * dir, y + 0.056, z, 10, 8);
}
/* 木花箱（箱体 + 土面 + 绿篱 + 粉花球） */
function cratePlanter(bag, x, z) {
  bag.box('wood', 0.2, 0.085, 0.15, x, 0.0925, z);
  bag.box('wood', 0.21, 0.012, 0.16, x, 0.056, z);
  bag.box('dark', 0.18, 0.01, 0.13, x, 0.14, z);
  bag.sph('hedge', 0.055, x - 0.03, 0.165, z - 0.02, 10, 8);
  bag.sph('hedge', 0.045, x + 0.045, 0.16, z + 0.02, 10, 8);
  bag.sph('flower', 0.022, x - 0.06, 0.19, z + 0.03, 10, 8);
  bag.sph('flower2', 0.018, x + 0.01, 0.195, z - 0.04, 10, 8);
  bag.sph('flower', 0.02, x + 0.06, 0.185, z + 0.04, 10, 8);
  bag.sph('flower2', 0.016, x - 0.01, 0.2, z + 0.05, 10, 8);
  bag.sph('flower', 0.018, x - 0.07, 0.18, z - 0.03, 10, 8);
  bag.sph('flower2', 0.02, x + 0.04, 0.205, z - 0.01, 10, 8);
  bag.sph('flower', 0.015, x + 0.08, 0.175, z - 0.04, 10, 8);
}
/* 白陶盆粉花 */
function flowerPot(bag, x, z, s) {
  bag.cyl('white', 0.05 * s, 0.038 * s, 0.09 * s, x, 0.05 + 0.045 * s, z, 0, 0, 0, 12);
  bag.cyl('white', 0.055 * s, 0.055 * s, 0.014 * s, x, 0.05 + 0.095 * s, z, 0, 0, 0, 12);
  bag.sph('hedge', 0.045 * s, x, 0.05 + 0.13 * s, z, 10, 8);
  bag.sph('flower', 0.02 * s, x - 0.035 * s, 0.05 + 0.16 * s, z, 10, 8);
  bag.sph('flower2', 0.017 * s, x + 0.03 * s, 0.05 + 0.17 * s, z + 0.02 * s, 10, 8);
  bag.sph('flower', 0.018 * s, x + 0.02 * s, 0.05 + 0.15 * s, z - 0.03 * s, 10, 8);
  bag.sph('flower2', 0.016 * s, x - 0.01 * s, 0.05 + 0.185 * s, z + 0.03 * s, 10, 8);
  bag.sph('flower', 0.015 * s, x + 0.04 * s, 0.05 + 0.14 * s, z + 0.035 * s, 10, 8);
  bag.sph('flower2', 0.014 * s, x - 0.04 * s, 0.05 + 0.135 * s, z - 0.03 * s, 10, 8);
}

/* ================= 5. 工厂 ================= */
window.Special3DModern[22] = function () {
  var g = new THREE.Group();
  g.name = 'special22m_prop_shop';
  var bag = new Bag();
  var rnd = RNG(220918);
  var i, k;

  /* —— 建筑几何常量 —— 参考为两层盒子：宽:深 ≈ 1.9:1.3，高 ≈1.36 */
  var FX = 0.95;                         /* 半宽（正面 x -0.95..0.95） */
  var FZ1 = 0.19, FZ0 = -1.24;           /* 前脸 z / 背墙 z */
  var FCZ = (FZ1 + FZ0) / 2;             /* 进深中心 ≈ -0.525 */
  var FD = FZ1 - FZ0;                    /* 进深 1.43（参考深:宽 ≈0.75） */
  var YG0 = 0.055, YG1 = 0.55;           /* 一层玻璃带 */
  var YSP0 = 0.55, YSP1 = 0.61;          /* 腰线 */
  var YS0 = 0.61, YS1 = 1.05;            /* 二层橱窗带 */
  var YF0 = 1.05, YF1 = 1.19;            /* 橙色招牌带 */
  var ROOF0 = 1.19, ROOF1 = 1.22;        /* 屋面板 */
  var TOP = 1.33;                        /* 压顶顶 */

  /* ========== 5.1 沙盘基座：广场石板 + 路缘 + 前沿镶边 ========== */
  bag.box('pave', 2.68, 0.05, 2.68, 0, 0.025, 0, 0, 0, 0, SC.pave);
  bag.box('curb', 2.68, 0.014, 0.06, 0, 0.057, 1.31);
  bag.box('curb', 2.68, 0.014, 0.06, 0, 0.057, -1.31);
  bag.box('curb', 0.06, 0.014, 2.56, -1.31, 0.057, 0);
  bag.box('curb', 0.06, 0.014, 2.56, 1.31, 0.057, 0);
  bag.box('asphalt', 2.62, 0.004, 0.07, 0, 0.052, 1.275);
  bag.box('pave2', 1.5, 0.004, 0.26, 0.03, 0.0515, 0.33);                                  /* 店前入口铺装带 */
  bag.box('pave2', 2.62, 0.003, 0.1, 0, 0.0512, 1.19);                                     /* 前沿人行道分色 */
  bag.box('curb', 0.3, 0.014, 0.06, -1.2, 0.057, 1.2, 0, PI / 4, 0);                      /* 前角 45° 切角缘石 ×2 */
  bag.box('curb', 0.3, 0.014, 0.06, 1.2, 0.057, 1.2, 0, -PI / 4, 0);

  /* ========== 5.2 建筑壳体：背墙/侧墙/楼板/顶棚/平屋顶 ========== */
  bag.box('wall', 1.9, 1.14, 0.06, 0, 0.62, FZ0 + 0.03, 0, 0, 0, SC.wall); /* 背墙 */
  bag.box('wall', 0.06, 1.14, FD, -0.92, 0.62, FCZ, 0, 0, 0, SC.wall);     /* 西墙 */
  bag.box('wall', 0.06, 1.14, FD, 0.92, 0.62, FCZ, 0, 0, 0, SC.wall);      /* 东墙 */
  bag.box('cream', 1.9, 0.05, FD, 0, 0.025, FCZ);                          /* 底板 */
  bag.box('cream', 1.9, 0.06, FD, 0, 0.58, FCZ);                           /* 二层楼板（腰线内衬） */
  bag.box('cream', 1.9, 0.02, FD, 0, 1.18, FCZ);                           /* 顶棚 */
  bag.box('roof', 1.96, 0.03, FD + 0.06, 0, 1.205, FCZ, 0, 0, 0, SC.roof); /* 平屋顶 */
  /* 女儿墙栏板 + 宝瓶栏杆 + 橙压顶（四面） */
  var ZB = FZ0 - 0.005;                                                    /* 后檐女儿墙 z */
  bag.box('cream', 1.92, 0.055, 0.05, 0, 1.2175, 0.185);
  bag.box('cream', 1.92, 0.055, 0.05, 0, 1.2175, ZB);
  bag.box('cream', 0.05, 0.055, FD + 0.06, -0.955, 1.2175, FCZ);
  bag.box('cream', 0.05, 0.055, FD + 0.06, 0.955, 1.2175, FCZ);
  for (i = 0; i < 25; i++) bag.box('cream', 0.008, 0.052, 0.011, -0.924 + i * 0.077, 1.271, 0.185);
  for (i = 0; i < 19; i++) {
    bag.box('cream', 0.011, 0.052, 0.008, -0.955, 1.271, FZ0 + 0.04 + i * 0.077);
    bag.box('cream', 0.011, 0.052, 0.008, 0.955, 1.271, FZ0 + 0.04 + i * 0.077);
  }
  bag.box('cream', 1.92, 0.02, 0.046, 0, 1.307, 0.185);
  bag.box('cream', 1.92, 0.02, 0.046, 0, 1.307, ZB);
  bag.box('cream', 0.046, 0.02, FD + 0.06, -0.955, 1.307, FCZ);
  bag.box('cream', 0.046, 0.02, FD + 0.06, 0.955, 1.307, FCZ);
  bag.box('orange', 1.92, 0.013, 0.03, 0, 1.3235, 0.185);
  bag.box('orange', 1.92, 0.013, 0.03, 0, 1.3235, ZB);
  bag.box('orange', 0.03, 0.013, FD + 0.06, -0.955, 1.3235, FCZ);
  bag.box('orange', 0.03, 0.013, FD + 0.06, 0.955, 1.3235, FCZ);
  /* 屋顶设备：混凝土机组箱（格栅 + 风扇）+ 沿后檐长天窗条带 + 通风条 + 地漏 */
  bag.box('concP', 0.44, 0.13, 0.22, -0.2, 1.285, -0.74);
  bag.box('dark', 0.38, 0.08, 0.012, -0.2, 1.285, -0.624);
  bag.cyl('dark', 0.038, 0.038, 0.014, -0.2, 1.285, -0.616, PI / 2, 0, 0, 12);
  bag.box('dark', 0.36, 0.006, 0.16, -0.2, 1.353, -0.74);                                 /* 机组顶格栅 */
  bag.cyl('steel', 0.01, 0.01, 0.05, -0.34, 1.375, -0.8, 0, 0, 0, 8);
  bag.box('concP', 0.16, 0.08, 0.14, -0.7, 1.26, -0.5);                                   /* 小机组 */
  bag.box('dark', 0.12, 0.006, 0.1, -0.7, 1.303, -0.5);
  bag.box('dark', 0.95, 0.02, 0.12, 0.4, 1.23, FZ0 + 0.14);
  bag.box('glass', 0.91, 0.014, 0.09, 0.4, 1.247, FZ0 + 0.14, 0, 0, 0, 3);
  bag.box('steel', 0.05, 0.018, 0.094, 0.03, 1.247, FZ0 + 0.14);
  bag.box('steel', 0.05, 0.018, 0.094, 0.27, 1.247, FZ0 + 0.14);
  bag.box('steel', 0.05, 0.018, 0.094, 0.53, 1.247, FZ0 + 0.14);
  bag.box('steel', 0.05, 0.018, 0.094, 0.77, 1.247, FZ0 + 0.14);
  bag.box('steel', 0.24, 0.03, 0.11, -0.6, 1.235, FZ0 + 0.14);
  bag.box('dark', 0.2, 0.004, 0.08, -0.6, 1.252, FZ0 + 0.14);
  bag.box('dark', 0.2, 0.004, 0.08, -0.6, 1.244, FZ0 + 0.14);
  bag.box('dark', 0.045, 0.028, 0.045, -0.88, 1.226, FZ0 + 0.04);
  bag.cyl('steel', 0.003, 0.003, 0.12, -0.9, 1.39, 0.12, 0, 0, 0, 8);                   /* 避雷针 ×2 */
  bag.cyl('steel', 0.003, 0.003, 0.12, 0.9, 1.39, FZ0 + 0.07, 0, 0, 0, 8);
  /* 落水管 ×2 + 管卡 */
  bag.cyl('dark', 0.011, 0.011, 1.14, 0.935, 0.62, FZ0 + 0.03, 0, 0, 0, 10);
  bag.box('dark', 0.03, 0.014, 0.02, 0.935, 0.35, FZ0 + 0.042);
  bag.box('dark', 0.03, 0.014, 0.02, 0.935, 0.9, FZ0 + 0.042);
  bag.cyl('dark', 0.011, 0.011, 1.14, -0.935, 0.62, FZ0 + 0.03, 0, 0, 0, 10);
  bag.cyl('dark', 0.016, 0.016, 0.03, 0.935, 0.058, FZ0 + 0.03, 0, 0, 0, 10);
  /* 东西墙勒脚（止于角部竖屏之前） */
  bag.box('dark', 0.02, 0.05, 1.24, 0.955, 0.075, -0.62);
  bag.box('dark', 0.02, 0.05, 1.29, -0.955, 0.075, -0.595);
  /* 西墙设备门 + 壁挂空调 */
  bag.box('frame', 0.015, 0.48, 0.34, -0.952, 0.29, -0.6);
  bag.box('steel', 0.012, 0.012, 0.05, -0.945, 0.29, -0.45);
  bag.box('concP', 0.05, 0.1, 0.15, -0.955, 0.85, -0.25);
  bag.cyl('dark', 0.032, 0.032, 0.012, -0.983, 0.85, -0.25, 0, 0, PI / 2, 12);

  /* ========== 5.3 橙色招牌带（三层顶）：通长环绕 + 图形贴图面板 ========== */
  bag.box('cream', 1.9, 0.02, 0.028, 0, 1.06, 0.19);                                      /* 窗顶奶油檐线 */
  bag.box('cream', 0.028, 0.02, FD + 0.06, -0.96, 1.06, FCZ);
  bag.box('cream', 0.028, 0.02, FD + 0.06, 0.96, 1.06, FCZ);
  bag.box('orange', 1.9, 0.12, 0.02, 0, 1.13, 0.185);
  bag.box('orange', 0.02, 0.12, FD + 0.06, -0.96, 1.13, FCZ);
  bag.box('orange', 0.02, 0.12, FD + 0.06, 0.96, 1.13, FCZ);
  /* 奶油腰线（楼层间）四面 */
  bag.box('cream', 1.9, 0.06, 0.015, 0, 0.58, 0.1825);
  bag.box('cream', 0.015, 0.06, FD, -0.9575, 0.58, FCZ);
  bag.box('cream', 0.015, 0.06, FD, 0.9575, 0.58, FCZ);

  /* ========== 5.4 二层通长橱窗：框 + 竖梃 ×9 + 玻璃 ×7 + 暖光内景 + 3D 货架 ========== */
  bag.box('frame', 1.9, 0.045, 0.03, 0, 0.6325, 0.176);
  bag.box('frame', 1.9, 0.045, 0.03, 0, 1.0275, 0.176);
  var mull2 = [-0.72, -0.48, -0.24, 0, 0.24, 0.48, 0.72, 0.92];
  for (i = 0; i < mull2.length; i++) bag.box('frame', 0.036, 0.35, 0.034, mull2[i], 0.83, 0.176);
  bag.box('frame', 1.64, 0.014, 0.026, 0.1, 0.72, 0.176);                                 /* 横梃 */
  for (i = 0; i < mull2.length - 1; i++) {
    var a2 = mull2[i], b2 = mull2[i + 1];
    bag.plane('glass', (b2 - a2) - 0.035, 0.36, (a2 + b2) / 2, 0.83, 0.172, 0, 0, (i % 2) ? PI : 0);
  }
  /* 内景货架：白板 3 层 + 彩色商品阵列（透过橱窗可见） */
  bag.box('white', 1.55, 0.012, 0.16, 0.1, 0.69, 0.05);
  bag.box('white', 1.55, 0.012, 0.16, 0.1, 0.8, 0.05);
  bag.box('white', 1.55, 0.012, 0.16, 0.1, 0.94, 0.05);
  merchRow(bag, -0.62, 0.82, 0.615, 0.05, 22, rnd);
  merchRow(bag, -0.62, 0.82, 0.702, 0.05, 22, rnd);
  merchRow(bag, -0.62, 0.82, 0.812, 0.05, 22, rnd);
  merchRow(bag, -0.62, 0.82, 0.952, 0.05, 22, rnd);
  /* 内景第二排货架（后墙前，进深层次） */
  bag.box('white', 1.5, 0.012, 0.12, 0.1, 0.7, -0.14);
  bag.box('white', 1.5, 0.012, 0.12, 0.1, 0.86, -0.14);
  merchRow(bag, -0.6, 0.8, 0.625, -0.14, 18, rnd);
  merchRow(bag, -0.6, 0.8, 0.712, -0.14, 18, rnd);
  merchRow(bag, -0.6, 0.8, 0.872, -0.14, 18, rnd);
  /* 吊顶灯板 ×4（两层，透过橱窗照亮顶部内景） */
  bag.box('mWhite', 1.7, 0.008, 0.05, 0, 1.162, 0.02);
  bag.box('mWhite', 1.7, 0.008, 0.05, 0, 1.162, -0.45);
  bag.box('mWhite', 1.7, 0.008, 0.05, 0, 0.542, 0.02);
  bag.box('mWhite', 1.7, 0.008, 0.05, 0, 0.542, -0.45);
  /* 橱窗内吊灯 ×3 */
  bag.box('steel', 0.006, 0.05, 0.006, -0.4, 1.14, 0.05);
  bag.box('mYellow', 0.07, 0.012, 0.03, -0.4, 1.11, 0.05);
  bag.box('steel', 0.006, 0.05, 0.006, 0.1, 1.14, 0.05);
  bag.box('mYellow', 0.07, 0.012, 0.03, 0.1, 1.11, 0.05);
  bag.box('steel', 0.006, 0.05, 0.006, 0.55, 1.14, 0.05);
  bag.box('mYellow', 0.07, 0.012, 0.03, 0.55, 1.11, 0.05);

  /* ========== 5.5 一层 storefront：框 + 竖梃 + 中央双开门 + 台阶 ========== */
  bag.box('frame', 1.9, 0.032, 0.03, 0, 0.071, 0.176);
  bag.box('frame', 1.9, 0.045, 0.03, 0, 0.5225, 0.176);
  bag.box('frame', 0.05, 0.49, 0.05, -0.925, 0.3, 0.176);
  bag.box('frame', 0.05, 0.49, 0.05, 0.925, 0.3, 0.176);
  var mull1 = [-0.95, -0.6, -0.3, 0.1, 0.45, 0.7, 0.95];
  for (i = 0; i < mull1.length; i++) bag.box('frame', 0.035, 0.44, 0.034, mull1[i], 0.3, 0.176);
  for (i = 0; i < mull1.length - 1; i++) {
    if (i === 2) continue;                                                                 /* 门洞段 */
    var a1 = mull1[i], b1 = mull1[i + 1];
    bag.plane('glass', (b1 - a1) - 0.042, 0.415, (a1 + b1) / 2, 0.2975, 0.172, 0, 0, (i % 2) ? PI : 0);
  }
  /* 双开玻璃门（门洞 -0.30..0.10）：门挺 + 高挑玻璃 + 中横梃 + 拉手 ×2 */
  bag.box('frame', 0.04, 0.49, 0.034, -0.1, 0.3, 0.146);                                 /* 门（后退 0.03）*/
  bag.box('frame', 0.04, 0.49, 0.034, -0.295, 0.3, 0.146);
  bag.box('frame', 0.04, 0.49, 0.034, 0.095, 0.3, 0.146);
  bag.box('frame', 0.4, 0.045, 0.032, -0.1, 0.5075, 0.146);
  bag.plane('glass', 0.16, 0.42, -0.2, 0.285, 0.142);
  bag.plane('glass', 0.16, 0.42, 0.0, 0.285, 0.142);
  bag.box('frame', 0.36, 0.035, 0.03, -0.1, 0.345, 0.146);
  bag.cyl('steel', 0.0045, 0.0045, 0.12, -0.128, 0.3, 0.163, 0, 0, 0, 10);
  bag.cyl('steel', 0.0045, 0.0045, 0.12, -0.072, 0.3, 0.163, 0, 0, 0, 10);
  bag.box('frame', 0.04, 0.045, 0.045, -0.31, 0.5075, 0.17);                              /* 门洞侧壁 */
  bag.box('frame', 0.04, 0.045, 0.045, 0.11, 0.5075, 0.17);
  bag.box('mYellow', 0.34, 0.012, 0.03, -0.1, 0.49, 0.165);                               /* 门楣灯带 */
  bag.box('steel', 0.004, 0.02, 0.004, -0.1, 0.462, 0.2);                                 /* 营业挂牌 */
  bag.box('white', 0.09, 0.045, 0.006, -0.1, 0.43, 0.2);
  bag.box('teal', 0.07, 0.012, 0.007, -0.1, 0.43, 0.2);
  bag.box('dark', 0.42, 0.006, 0.1, -0.1, 0.053, 0.16);                                   /* 门口地垫 */
  bag.box('white', 0.55, 0.02, 0.1, -0.1, 0.06, 0.235);                                   /* 门槛 */
  /* 门内迎宾陈列堆（透过门/橱窗可见） */
  bag.box('mPink', 0.09, 0.09, 0.08, -0.68, 0.095, 0.125);
  bag.box('mYellow', 0.08, 0.08, 0.07, -0.68, 0.18, 0.125);
  bag.box('mBlue', 0.07, 0.07, 0.06, -0.68, 0.255, 0.125);
  bag.box('mGreen', 0.09, 0.09, 0.08, 0.32, 0.095, 0.125);
  bag.box('mRed', 0.08, 0.08, 0.07, 0.32, 0.18, 0.125);
  bag.box('mWhite', 0.07, 0.07, 0.06, 0.32, 0.255, 0.125);
  /* 一层内景：双组白货架 + 商品（透过橱窗可见） */
  for (k = 0; k < 2; k++) {
    var gx = -0.52 + k * 0.85;
    bag.box('white', 0.55, 0.012, 0.16, gx, 0.14, 0.0);
    bag.box('white', 0.55, 0.012, 0.16, gx, 0.26, 0.0);
    bag.box('white', 0.55, 0.012, 0.16, gx, 0.38, 0.0);
    merchRow(bag, gx - 0.26, gx + 0.26, 0.055, 0.0, 9, rnd);
    merchRow(bag, gx - 0.26, gx + 0.26, 0.146, 0.0, 9, rnd);
    merchRow(bag, gx - 0.26, gx + 0.26, 0.266, 0.0, 9, rnd);
    merchRow(bag, gx - 0.26, gx + 0.26, 0.386, 0.0, 9, rnd);
  }
  /* 收银台 */
  bag.box('white', 0.35, 0.09, 0.14, 0.55, 0.095, -0.1);
  bag.box('dark', 0.1, 0.03, 0.08, 0.55, 0.155, -0.1);

  /* ========== 5.6 一层通长安平雨棚：青绿棚顶（微前倾）+ 深青绿檐口封板 + 橙下缘条 + 斜拉杆 ×4 ========== */
  bag.box('teal', 1.5, 0.014, 0.155, 0.03, 0.612, 0.26, -0.05, 0, 0);
  bag.box('teal', 1.5, 0.095, 0.018, 0.03, 0.557, 0.335);
  bag.box('orange', 0.67, 0.05, 0.016, -0.385, 0.4845, 0.335);                            /* 左段橙色雨篷（较深） */
  bag.box('orange', 0.83, 0.025, 0.014, 0.365, 0.497, 0.334);                              /* 右段橙下缘（较薄） */
  bag.box('steel', 0.67, 0.006, 0.012, -0.385, 0.456, 0.334);
  bag.box('steel', 0.83, 0.006, 0.012, 0.365, 0.481, 0.334);
  bag.box('cream', 1.46, 0.008, 0.13, 0.03, 0.6, 0.255);                                  /* 棚底板 */
  bag.box('teal', 0.018, 0.095, 0.14, -0.705, 0.557, 0.255);                              /* 棚侧封板 ×2 */
  bag.box('teal', 0.018, 0.095, 0.14, 0.765, 0.557, 0.255);
  bag.box('orange', 0.09, 0.06, 0.02, 0.86, 0.56, 0.24);                                  /* 右角小灯箱 */
  bag.box('mWhite', 0.07, 0.04, 0.006, 0.86, 0.56, 0.254);
  var rodX = [-0.48, -0.24, 0.24, 0.48];
  for (i = 0; i < 4; i++) {
    bag.cyl('steel', 0.004, 0.004, 0.21, rodX[i], 0.69, 0.255, 2.356, 0, 0, 8);
  }

  /* ========== 5.7 角部竖条屏：左琥珀木格栅 + 右橙翼板（包角） ========== */
  for (i = 0; i < 9; i++) bag.box('wood', 0.014, 1.0, 0.05, -0.93 + i * 0.024, 0.55, 0.2);
  bag.box('wood', 0.05, 1.0, 0.014, -0.962, 0.55, 0.15);
  bag.box('wood', 0.05, 1.0, 0.014, -0.962, 0.55, 0.115);
  bag.box('wood', 0.05, 1.0, 0.014, -0.962, 0.55, 0.08);
  for (i = 0; i < 6; i++) bag.box('orange', 0.012, 1.14, 0.055, 0.795 + i * 0.03, 0.62, 0.2);
  for (i = 0; i < 4; i++) bag.box('orange', 0.055, 1.14, 0.012, 0.962, 0.62, 0.15 - i * 0.045);

  /* ========== 5.8 东侧墙：海报灯箱 ×2 + 鹅颈壁灯 ×2 ========== */
  bag.box('cream', 0.008, 0.575, 0.325, 0.9525, 0.55, -0.12);
  bag.box('cream', 0.008, 0.575, 0.325, 0.9525, 0.55, -0.62);
  wallLamp(bag, 0.951, 0.89, -0.12, 1);
  wallLamp(bag, 0.951, 0.89, -0.62, 1);
  /* 西侧墙：小型招牌灯箱 + 壁灯 */
  bag.box('frame', 0.008, 0.2, 0.42, -0.9525, 0.78, -0.45);
  wallLamp(bag, -0.951, 0.93, -0.45, -1);

  /* ========== 5.9 店前广场：条纹篷促销推车 + 木陈列架 + A 字牌 ========== */
  /* 促销推车（橙身白裙板 + 车轮 ×4 + 木柱 ×4 + 条纹篷 + 台面商品） */
  (function (cx, cz) {
    bag.box('orange', 0.34, 0.1, 0.19, cx, 0.15, cz);
    bag.box('cream', 0.35, 0.05, 0.195, cx, 0.1, cz);
    bag.box('white', 0.35, 0.01, 0.2, cx, 0.205, cz);
    bag.box('white', 0.22, 0.055, 0.012, cx, 0.135, cz + 0.097);
    bag.cyl('dark', 0.024, 0.024, 0.016, cx - 0.135, 0.074, cz + 0.08, 0, 0, PI / 2, 12);
    bag.cyl('dark', 0.024, 0.024, 0.016, cx + 0.135, 0.074, cz + 0.08, 0, 0, PI / 2, 12);
    bag.cyl('dark', 0.024, 0.024, 0.016, cx - 0.135, 0.074, cz - 0.08, 0, 0, PI / 2, 12);
    bag.cyl('dark', 0.024, 0.024, 0.016, cx + 0.135, 0.074, cz - 0.08, 0, 0, PI / 2, 12);
    bag.box('wood', 0.013, 0.33, 0.013, cx - 0.16, 0.37, cz - 0.085);
    bag.box('wood', 0.013, 0.33, 0.013, cx + 0.16, 0.37, cz - 0.085);
    bag.box('wood', 0.013, 0.33, 0.013, cx - 0.16, 0.37, cz + 0.085);
    bag.box('wood', 0.013, 0.33, 0.013, cx + 0.16, 0.37, cz + 0.085);
    bag.box('stripe', 0.46, 0.012, 0.29, cx, 0.545, cz, -0.16, 0, 0, SC.stripe);
    bag.box('orange', 0.46, 0.03, 0.012, cx, 0.51, cz + 0.145, 0, 0, 0);
    bag.box('orange', 0.012, 0.03, 0.29, cx - 0.23, 0.535, cz, -0.16, 0, 0);
    bag.box('orange', 0.012, 0.03, 0.29, cx + 0.23, 0.535, cz, -0.16, 0, 0);
    bag.sph('mPink', 0.03, cx - 0.09, 0.238, cz, 10, 8);
    bag.sph('mYellow', 0.028, cx + 0.02, 0.235, cz + 0.02, 10, 8);
    bag.sph('mBlue', 0.027, cx + 0.1, 0.232, cz - 0.02, 10, 8);
    bag.box('mRed', 0.055, 0.055, 0.055, cx + 0.055, 0.237, cz + 0.045);
    merchRow(bag, cx - 0.15, cx + 0.15, 0.21, cz, 6, rnd);
  })(-0.6, 0.5);
  /* 木制移动陈列架（侧板 + 三层板 + 商品 + 万向轮 ×4 + 顶沿） */
  (function (cx, cz) {
    bag.box('wood', 0.02, 0.36, 0.22, cx - 0.22, 0.23, cz);
    bag.box('wood', 0.02, 0.36, 0.22, cx + 0.22, 0.23, cz);
    bag.box('wood', 0.44, 0.012, 0.22, cx, 0.075, cz);
    bag.box('wood', 0.44, 0.012, 0.22, cx, 0.185, cz);
    bag.box('wood', 0.44, 0.012, 0.22, cx, 0.295, cz);
    bag.box('orange', 0.47, 0.012, 0.24, cx, 0.315, cz);
    merchRow(bag, cx - 0.2, cx + 0.2, 0.081, cz, 8, rnd);
    merchRow(bag, cx - 0.2, cx + 0.2, 0.191, cz, 8, rnd);
    merchRow(bag, cx - 0.2, cx + 0.2, 0.301, cz, 8, rnd);
    bag.box('white', 0.03, 0.02, 0.004, cx - 0.12, 0.192, cz + 0.112);                     /* 价签 ×3 */
    bag.box('white', 0.03, 0.02, 0.004, cx + 0.04, 0.302, cz + 0.112);
    bag.box('white', 0.03, 0.02, 0.004, cx + 0.13, 0.082, cz + 0.112);
    bag.cyl('dark', 0.016, 0.016, 0.01, cx - 0.18, 0.06, cz + 0.09, 0, 0, PI / 2, 10);
    bag.cyl('dark', 0.016, 0.016, 0.01, cx + 0.18, 0.06, cz + 0.09, 0, 0, PI / 2, 10);
    bag.cyl('dark', 0.016, 0.016, 0.01, cx - 0.18, 0.06, cz - 0.09, 0, 0, PI / 2, 10);
    bag.cyl('dark', 0.016, 0.016, 0.01, cx + 0.18, 0.06, cz - 0.09, 0, 0, PI / 2, 10);
  })(0.42, 0.56);
  /* A 字促销牌（双面板） */
  bag.plane('aframe', 0.19, 0.26, 0.76, 0.18, 0.795, -0.22, -0.25, 0);
  bag.plane('aframe', 0.19, 0.26, 0.76, 0.18, 0.765, -0.22, 0.25, 0);

  /* ========== 5.10 绿化：乔木 ×3 + 灌木 + 花箱/陶盆 ========== */
  tree(bag, -1.05, 0.8, 1.35);
  tree(bag, 1.08, 0.46, 1.1);
  tree(bag, 1.14, -0.85, 0.85);
  bag.sph('hedge', 0.062, -1.2, 0.14, -0.6);
  bag.sph('hedge', 0.055, -1.2, 0.135, -0.22);
  bag.sph('hedge', 0.05, -1.2, 0.13, 0.02);
  shrub(bag, -1.24, 0.22, 0.045);
  shrub(bag, -1.2, 0.42, 0.04);
  shrub(bag, -1.22, 0.58, 0.05);
  shrub(bag, -0.86, 0.33, 0.04);
  shrub(bag, 1.24, 0.7, 0.05);
  shrub(bag, 1.18, 0.86, 0.042);
  shrub(bag, 1.26, 0.98, 0.036);
  bag.sph('hedge', 0.058, 1.2, 0.138, -1.08);
  bag.sph('hedge', 0.05, 1.2, 0.13, -0.86);
  shrub(bag, 0.62, 0.3, 0.035);
  shrub(bag, -0.78, 0.3, 0.03);
  bag.box('curb', 0.18, 0.008, 0.94, -1.2, 0.054, -0.35);                                  /* 左缘绿篱带 + 缘石 */
  bag.box('hedge', 0.14, 0.07, 0.9, -1.2, 0.085, -0.35);
  bag.box('curb', 0.18, 0.008, 0.54, 1.2, 0.054, -1.0);                                    /* 右后绿篱带 */
  bag.box('hedge', 0.14, 0.07, 0.5, 1.2, 0.085, -1.0);
  bag.box('curb', 0.3, 0.012, 0.3, -1.05, 0.056, 0.8);                                     /* 树池 ×3 */
  bag.box('dark', 0.26, 0.014, 0.26, -1.05, 0.057, 0.8);
  bag.box('curb', 0.26, 0.012, 0.26, 1.08, 0.056, 0.46);
  bag.box('dark', 0.22, 0.014, 0.22, 1.08, 0.057, 0.46);
  bag.box('curb', 0.22, 0.012, 0.22, 1.14, 0.056, -0.85);
  bag.box('dark', 0.18, 0.014, 0.18, 1.14, 0.057, -0.85);
  cratePlanter(bag, -1.05, 0.35);
  flowerPot(bag, 0.85, 0.88, 1.2);
  flowerPot(bag, 0.38, 0.32, 0.9);

  /* ========== 5.11 合并落地 ========== */
  var dc = bag.build(g);

  /* ========== 5.12 发光件（每实例新建）+ 动画 ≤2 项 ========== */
  /* 招牌带图形面板（map + emissiveMap，微脉冲） */
  var signMat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: texSign(), emissive: C('#ffb066'), emissiveMap: texSign(),
    emissiveIntensity: 0.22, roughness: 0.55
  });
  var sign = new THREE.Mesh(new THREE.PlaneGeometry(1.86, 0.112), signMat);
  sign.position.set(0, 1.13, 0.196); g.add(sign);
  /* 卖场暖光内景（两层合并单 mesh：map + emissiveMap 呼吸） */
  var glowMat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: texInner(), emissive: C('#ffd9a8'), emissiveMap: texInner(),
    emissiveIntensity: 0.72, roughness: 0.7
  });
  (function () {
    var pos = [], nor = [], uv = [];
    var planes = [[1.84, 0.48, 0, 0.3, -0.28], [1.84, 0.44, 0, 0.83, -0.28]];
    for (var n = 0; n < planes.length; n++) {
      var gg = new THREE.PlaneGeometry(planes[n][0], planes[n][1]).toNonIndexed();
      gg.applyMatrix4(m4(planes[n][2], planes[n][3], planes[n][4]));
      var p = gg.attributes.position.array, nr = gg.attributes.normal.array, u = gg.attributes.uv.array;
      for (var j = 0; j < p.length; j++) pos.push(p[j]);
      for (j = 0; j < nr.length; j++) nor.push(nr[j]);
      for (j = 0; j < u.length; j++) uv.push(u[j]);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.add(new THREE.Mesh(geo, glowMat));
  })();
  /* 海报面 ×2（独立小 mesh） */
  function posterMesh(tex, w, h, x, y, z) {
    var m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 });
    var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
    mesh.position.set(x, y, z); mesh.rotation.y = PI / 2;
    mesh.castShadow = true; g.add(mesh); return mesh;
  }
  var posA = posterMesh(texPosterA(), 0.3, 0.55, 0.957, 0.55, -0.12);
  var posB = posterMesh(texPosterB(), 0.3, 0.55, 0.957, 0.55, -0.62);

  g.userData.anim = [
    function (t) {                                                                        /* 1) 卖场暖光呼吸 */
      glowMat.emissiveIntensity = 0.72 + 0.12 * Math.sin(t * 1.4 + 0.5);
    },
    function (t) {                                                                        /* 2) 招牌带微脉冲 */
      signMat.emissiveIntensity = 0.22 + 0.08 * Math.sin(t * 2.1 + 1.1);
    }
  ];
  g.userData.specialId = 22;
  g.userData.parts = { glowMat: glowMat, signMat: signMat, sign: sign, posterA: posA, posterB: posB, drawCalls: dc };
  return g;
};

})();
