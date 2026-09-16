/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/specials3d/tile5_station.js  格 5「中央车站」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/special_5.png（2020s 单象限，写实航拍 3/4 视角现代铁路枢纽）：
 *   中央大厅：银白金属浅拱大屋面（直立锁边细缝 + 3 条纵向玻璃天窗带 + 前后出挑），
 *             正面通高平面外凸弧形玻璃幕墙（竖梃分格、透出暖光候车厅）+ 拱形天窗（钢竖梃翼肋
 *             + 横档 + 拱心大钟）+ 轻薄入口雨棚（钢柱列）+「中央车站」站名牌 + 台阶 + 深色勒脚
 *   两翼    ：白色低层配楼（竖条窗带、平顶女儿墙、屋顶空调机组/楼梯间/避雷针），玻璃连廊接主厅
 *   站后    ：4 组连续白色折板站台雨棚（稀疏钢柱列 + 檐下暖光灯带）+ 3 股轨道（道砟/钢轨）
 *             + 矮接触网门架 ×3 + 停靠银白动车组（深色长窗带/金腰线/圆润车头/受电弓）
 *   站前    ：完整浅色石板广场 + 中央轴线步道 + 绿化床（乔木/灌木/白色缘石）+ 玻璃地铁亭 ×2
 *             + 出租车排队 ×5（黄）+ 公交车 ×2 + 公交亭 ×2 + 前沿沥青环路（虚线/斑马线 ×2/路缘石）
 *             + 路灯 ×4 + 行道树 ×14（前排 8 / 草坪 2 / 轴线 2 / 中庭侧 2）
 *
 * 注册：window.Special3DModern[5]() → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.7×2.7；底面 y=0；正面 +z（站前广场朝 +z）；draw call ≤60；三角 ≤28k；
 *       Canvas 纹理 ≤512px；源码零 Math.random（mulberry32 种子流）；
 *       动画 2 项：拱心大钟指针 / 雨棚+候车厅暖光呼吸（≤2 项封顶）。
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils）——
 *       静态件全部合并为每材质 1 个 mesh（17 材质桶 + 少量独立小件 ≈ 23 draw call）；
 *       弧形屋面用开口圆柱段（θ 限浅拱角域，UV 按弧长/进深烘焙保证贴图密度）；
 *       端拱用 THREE.Shape 拱形面板（UV 按世界尺寸烘焙）；折板雨棚/斜置幕墙段用旋转盒；
 *       文件结构对齐 props3d/prop_1.js 范本。
 *
 * 本轮 R1→R2 变更摘要（对照参考图差距清单逐条清偿）：
 *   ①屋面提亮为银白金属（降 metalness/贴图对比、细缝）②半圆穹顶改浅拱大跨弧面
 *   （θ 域 2.57rad、前后出挑）③拱形天窗加钢竖梃翼肋×6+横档×2、玻璃提亮 ④幕墙通高
 *   至 0.70、雨棚减薄下移 ⑤站台雨棚加厚成连续白板+檐口封板、柱 5→4 ⑥门架降高细化
 *   ⑦动车组加高+金腰线+车顶暗线 ⑧前环路移至前沿、广场扩大、行道树 6→8
 *   ⑨配楼窗带提亮收窄、配楼加高 ⑩勒脚/台基侧墙竖窗板/内景提亮补细节
 * R2→R3（对照 r2 渲染再校）：矢高 0.42→0.36（矢跨比 0.32 更贴参考扁弧）并按半跨 0.56 反算
 *   R=0.6156；屋面/幕墙贴图再提亮、metalness 0.35→0.25；檐口弧肋/侧檐/雨棚檐口/天窗脊帽
 *   改白色（参考檐口为浅色铝板）；拱部竖梃 6→8；拱玻璃退至幕墙背后消除同面闪烁；
 *   幕墙改平面外凸弧线（5 段折线 + 11 竖梃 + 分段横档，参考立面明显外凸）；补路缘石 ×3、
 *   中庭侧树 ×2（合计 14 棵）；环路内收使占地 2.69 留安全余量。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[boards/modern/specials3d/tile5_station] THREE 未定义，请先加载 three.min.js (r147)');
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
/* 广场石板：暖白大板 + 十字分缝 + 倒角受光/阴影边 + 色差斑 + 水渍 */
function texPave() {
  return cvTex('s5pave', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#b8b2a4'; g.fillRect(0, 0, w, h);
    var r, c, s = 64;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.9 + rnd() * 0.2, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(216 * v) + ',' + Math.round(211 * v) + ',' + Math.round(198 * v) + ')';
      g.fillRect(x + 3, y + 3, s - 6, s - 6);
      g.fillStyle = 'rgba(255,253,246,0.3)'; g.fillRect(x + 3, y + 3, s - 6, 2); g.fillRect(x + 3, y + 3, 2, s - 6);
      g.fillStyle = 'rgba(70,66,58,0.22)'; g.fillRect(x + 3, y + s - 5, s - 6, 2); g.fillRect(x + s - 5, y + 3, 2, s - 6);
      if (rnd() < 0.3) { g.fillStyle = 'rgba(120,114,100,0.14)'; g.fillRect(x + 8 + ((rnd() * 24) | 0), y + 8 + ((rnd() * 24) | 0), 12 + ((rnd() * 22) | 0), 7 + ((rnd() * 14) | 0)); }
    }
    speckle(g, w, h, rnd, 130, 'rgba(105,100,90,0.16)', 'rgba(240,236,226,0.18)', 12, 6);
  });
}
/* 沥青路面：深灰底 + 碎斑 + 中间白虚线 + 车道边缘实线（u 沿路长） */
function texRoad() {
  return cvTex('s5road', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#54585c'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 150, 'rgba(30,32,36,0.3)', 'rgba(120,124,128,0.24)', 4, 3);
    g.fillStyle = 'rgba(25,27,30,0.5)'; g.fillRect(0, h - 20, w, 20);
    g.fillStyle = '#e8e6e0';
    for (var x = 6; x < w; x += 42) g.fillRect(x, 62, 22, 4);
    g.fillStyle = 'rgba(232,230,224,0.75)'; g.fillRect(0, 10, w, 3); g.fillRect(0, h - 13, w, 3);
  });
}
/* 浅色混凝土/铝板墙：板缝 + 色斑 + 竖向雨水痕 + 根部污带 */
function texConc() {
  return cvTex('s5conc', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#d4d2ca'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 110, 'rgba(150,148,140,0.2)', 'rgba(244,242,236,0.24)', 4, 3);
    g.fillStyle = 'rgba(90,90,86,0.22)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(140,140,134,0.16)'; g.fillRect((rnd() * w) | 0, 0, 2 + ((rnd() * 3) | 0), 30 + ((rnd() * 60) | 0)); }
    g.fillStyle = 'rgba(96,94,88,0.18)'; g.fillRect(0, h - 12, w, 12);
  });
}
/* 配楼竖条窗带：白墙 + 窄竖向玻璃条（反光高光/窗台影）+ 横向层间梁 */
function texWin() {
  return cvTex('s5win', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#e6e4dc'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 50, 'rgba(176,174,164,0.2)', 'rgba(250,248,242,0.2)', 8, 5);
    var i;
    for (i = 0; i < 4; i++) {
      var x = i * 32;
      g.fillStyle = '#4a6272'; g.fillRect(x + 11, 8, 11, 106);
      g.fillStyle = 'rgba(205,226,236,0.6)'; g.fillRect(x + 12, 10, 3, 102);
      g.fillStyle = 'rgba(30,44,54,0.55)'; g.fillRect(x + 19, 8, 3, 106);
      g.fillStyle = 'rgba(244,242,234,0.95)'; g.fillRect(x + 9, 114, 15, 3);
      g.fillStyle = 'rgba(70,70,66,0.3)'; g.fillRect(x + 9, 117, 15, 2);
    }
    g.fillStyle = 'rgba(100,102,100,0.25)';
    for (i = 0; i < 3; i++) g.fillRect(0, 8 + i * 38, w, 2);
  });
}
/* 金属屋面：银白直立锁边板（细缝双线 + 板面亮色差 + 淡横向咬口） */
function texVault() {
  return cvTex('s5vault', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#d0d6dc'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 16; i++) {
      var x = i * 16, v = 0.96 + rnd() * 0.1;
      g.fillStyle = 'rgb(' + Math.round(214 * v) + ',' + Math.round(220 * v) + ',' + Math.round(226 * v) + ')';
      g.fillRect(x + 2, 0, 14, h);
      g.fillStyle = 'rgba(250,252,255,0.65)'; g.fillRect(x + 4, 0, 2, h);
      g.fillStyle = 'rgba(140,148,156,0.32)'; g.fillRect(x, 0, 1, h);
      g.fillStyle = 'rgba(168,176,184,0.25)'; g.fillRect(x + 15, 0, 1, h);
    }
    g.fillStyle = 'rgba(150,158,166,0.14)';
    for (i = 0; i < 8; i++) g.fillRect(0, i * 32 + 30, w, 2);
    speckle(g, w, h, rnd, 60, 'rgba(150,158,166,0.12)', 'rgba(252,253,255,0.24)', 6, 3);
  });
}
/* 幕墙玻璃：明亮天空反射竖向渐变 + 细竖梃 + 淡横档 + 斜高光带 */
function texGlass() {
  return cvTex('s5glass', 128, 128, function (g, w, h) {
    for (var x = 0; x < w; x++) {
      var t = x / w, v = 0.86 + 0.16 * Math.sin(t * 6.283 * 1.4 + 0.5) + 0.04 * Math.sin(t * 36);
      g.fillStyle = 'rgb(' + Math.round(150 * v) + ',' + Math.round(180 * v) + ',' + Math.round(194 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    g.fillStyle = 'rgba(40,58,68,0.2)';
    for (var y = 0; y < h; y += 26) g.fillRect(0, y, w, 2);
    g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(16, 0, 8, h); g.fillRect(80, 0, 3, h);
    g.strokeStyle = 'rgba(232,238,242,0.55)'; g.lineWidth = 2;
    for (x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  });
}
/* 道砟轨道床：深灰砾石 */
function texBallast() {
  return cvTex('s5ballast', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#57554e'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 220, 'rgba(28,26,22,0.5)', 'rgba(150,146,134,0.4)', 3, 2);
    g.fillStyle = 'rgba(70,66,58,0.5)'; g.fillRect(0, 30, w, 8); g.fillRect(0, 90, w, 8);
  });
}
/* 树冠叶斑（三层明暗叶簇） */
function texLeaf() {
  return cvTex('s5leaf', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#7f9c5e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) {
      var v = rnd();
      g.fillStyle = v < 0.5 ? 'rgba(46,78,34,0.42)' : v < 0.8 ? 'rgba(150,186,100,0.5)' : 'rgba(200,216,140,0.35)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 4 + ((rnd() * 12) | 0), 3 + ((rnd() * 8) | 0));
    }
  });
}
/* 候车厅内景（map + emissiveMap）：暖光地面/立柱/旅客/吊顶灯带 */
function texHall() {
  return cvTex('s5hall', 256, 128, function (g, w, h, rnd) {
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
    pave:    M('#ffffff', { map: texPave(), rough: 0.95 }),
    road:    M('#ffffff', { map: texRoad(), rough: 0.98 }),
    conc:    M('#ffffff', { map: texConc(), rough: 0.9, ds: true }),
    winWall: M('#ffffff', { map: texWin(), rough: 0.8, ds: true }),
    vault:   M('#ffffff', { map: texVault(), rough: 0.5, metal: 0.25, ds: true }),
    glass:   M('#ffffff', { map: texGlass(), rough: 0.06, metal: 0.7, tr: 0.5 }),
    white:   M('#eceae2', { rough: 0.6 }),
    steel:   M('#7a828a', { rough: 0.45, metal: 0.7 }),
    dark:    M('#2b3034', { rough: 0.6, metal: 0.2 }),
    rail:    M('#aab2b8', { rough: 0.3, metal: 0.85 }),
    ballast: M('#ffffff', { map: texBallast(), rough: 0.98 }),
    green:   M('#ffffff', { map: texLeaf(), rough: 0.95 }),
    green2:  M('#a9b894', { map: texLeaf(), rough: 0.95 }),
    hedge:   M('#5d7a3f', { rough: 1 }),
    trunk:   M('#8c7050', { rough: 0.9 }),
    yellow:  M('#e8c832', { rough: 0.45, metal: 0.15 }),
    blue:    M('#3f6a8f', { rough: 0.5, metal: 0.1 })
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
var SC = { pave: 0.85, road: 3.3, conc: 1.3, win: 1.6, vault: 1.0, glass: 1.2, ballast: 4 };
Bag.prototype.box = function (key, w, h, d, x, y, z, rx, ry, rz, sc) {
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, sc !== undefined ? sc : SC.conc);
  this.put(key, g, m4(x, y, z, rx, ry, rz));
};
Bag.prototype.cyl = function (key, rt, rb, h, x, y, z, rx, ry, rz, seg) {
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 10), m4(x, y, z, rx, ry, rz));
};
Bag.prototype.sph = function (key, r, x, y, z, ws, hs) {
  this.put(key, new THREE.SphereGeometry(r, ws || 12, hs || 9), m4(x, y, z));
};
Bag.prototype.plane = function (key, w, h, x, y, z, rx, ry, rz) {
  this.put(key, new THREE.PlaneGeometry(w, h), m4(x, y, z, rx, ry, rz));
};
/* 浅拱屋面：开口圆柱段（θ 限顶拱角域），轴沿 z；檐口在 y'=R·cosφm 相对轴心 */
function vaultGeo(R, len, thStart, thLen, sc) {
  var g = new THREE.CylinderGeometry(R, R, len, 30, 1, true, thStart, thLen);
  g.rotateX(PI / 2);
  var uv = g.attributes.uv, arc = R * thLen, i;
  for (i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * arc * sc, uv.getY(i) * len * sc);
  return g;
}
Bag.prototype.vault = function (key, R, len, thStart, thLen, x, y, z, sc) {
  this.put(key, vaultGeo(R, len, thStart, thLen, sc !== undefined ? sc : SC.vault), m4(x, y, z));
};
/* 拱形端墙面板（THREE.Shape：矩形 + 圆弧拱顶），XY 面朝 +z；flip 朝 -z；UV 按世界尺寸 */
function archGeo(a, y0, yE, R, yc, sc) {
  var s = new THREE.Shape();
  s.moveTo(-a, y0); s.lineTo(a, y0); s.lineTo(a, yE);
  s.absarc(0, yc, R, Math.atan2(yE - yc, a), PI - Math.atan2(yE - yc, a), false);
  s.lineTo(-a, y0);
  var g = new THREE.ShapeGeometry(s, 24);
  var p = g.attributes.position, uv = [], i;
  for (i = 0; i < p.count; i++) uv.push(p.getX(i) * sc, p.getY(i) * sc);
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
}
Bag.prototype.arch = function (key, a, y0, yE, R, yc, x, z, flip, sc) {
  this.put(key, archGeo(a, y0, yE, R, yc, sc || 1.2), m4(x, 0, z, 0, flip ? PI : 0, 0));
};
Bag.prototype.torus = function (key, r, tube, x, y, z, seg, arc, rz) {
  this.put(key, new THREE.TorusGeometry(r, tube, 6, seg || 30, arc !== undefined ? arc : PI), m4(x, y, z, 0, 0, rz || 0));
};

/* ================= 4. 文字/钟面（Canvas 纹理，独立小 mesh） ================= */
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
function clockFaceMesh(r) {
  var cv = document.createElement('canvas'); cv.width = 128; cv.height = 128;
  var g = cv.getContext('2d');
  g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#3a3d40'; g.lineWidth = 4;
  g.beginPath(); g.arc(64, 64, 58, 0, PI * 2); g.stroke();
  var i, a;
  for (i = 0; i < 60; i++) {
    a = i / 60 * PI * 2;
    var maj = (i % 5 === 0);
    g.strokeStyle = maj ? '#2b2e30' : 'rgba(43,46,48,0.45)';
    g.lineWidth = maj ? 5 : 1.5;
    g.beginPath(); g.moveTo(64 + (maj ? 44 : 50) * Math.cos(a), 64 + (maj ? 44 : 50) * Math.sin(a)); g.lineTo(64 + 54 * Math.cos(a), 64 + 54 * Math.sin(a)); g.stroke();
  }
  g.fillStyle = '#2b2e30'; g.beginPath(); g.arc(64, 64, 4, 0, PI * 2); g.fill();
  g.fillStyle = '#9c2b24'; g.fillRect(62, 20, 4, 12);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  var m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.4 });
  return new THREE.Mesh(new THREE.CircleGeometry(r, 24), m);
}

/* ================= 5. 预制构件 ================= */
/* 行道树（干 + 双球冠） */
function tree(bag, x, z, s) {
  bag.cyl('trunk', 0.02 * s, 0.028 * s, 0.26 * s, x, 0.05 + 0.13 * s, z, 0, 0, 0, 8);
  bag.sph('green', 0.15 * s, x, 0.05 + 0.32 * s, z, 12, 9);
  bag.sph('green2', 0.105 * s, x + 0.07 * s, 0.05 + 0.24 * s, z + 0.04 * s, 10, 8);
}
function shrub(bag, x, z, s) {
  bag.sph('hedge', s, x, 0.05 + s * 0.7, z, 10, 8);
}
/* 路灯（钢杆 + 悬挑 + 灯头；dir=灯臂朝向） */
function lampPost(bag, x, z, dir) {
  bag.cyl('steel', 0.008, 0.011, 0.34, x, 0.05 + 0.17, z, 0, 0, 0, 8);
  bag.box('steel', 0.1 * dir, 0.014, 0.014, x + 0.05 * dir, 0.385, z);
  bag.box('white', 0.045, 0.018, 0.03, x + 0.095 * dir, 0.372, z);
}
/* 空调机组（机壳 + 风扇盘） */
function acUnit(bag, x, y, z) {
  bag.box('steel', 0.09, 0.05, 0.05, x, y, z);
  bag.cyl('dark', 0.017, 0.017, 0.012, x + 0.028, y, z, 0, PI / 2, 0, 12);
  bag.box('dark', 0.012, 0.03, 0.04, x - 0.05, y - 0.02, z);
}
/* 出租车（黄身 + 深色窗带 + 顶灯） */
function taxi(bag, x, z) {
  bag.box('dark', 0.08, 0.014, 0.046, x, 0.0565, z);
  bag.box('yellow', 0.095, 0.024, 0.044, x, 0.075, z);
  bag.box('yellow', 0.052, 0.022, 0.04, x - 0.004, 0.096, z);
  bag.box('dark', 0.054, 0.011, 0.042, x - 0.004, 0.096, z);
  bag.box('yellow', 0.014, 0.008, 0.014, x - 0.004, 0.111, z);
}
/* 公交车（白身 + 蓝窗带 + 裙边；alongZ 时绕 y 转 90°） */
function bus(bag, x, z, alongZ) {
  var L = 0.26, W = 0.06, H = 0.055;
  if (!alongZ) {
    bag.box('dark', L, 0.016, W - 0.006, x, 0.062, z);
    bag.box('white', L, H, W, x, 0.0975, z);
    bag.box('blue', L - 0.01, 0.02, W + 0.003, x, 0.112, z);
    bag.box('dark', L - 0.02, 0.014, W - 0.014, x, 0.069, z);
  } else {
    bag.box('dark', W - 0.006, 0.016, L, x, 0.062, z);
    bag.box('white', W, H, L, x, 0.0975, z);
    bag.box('blue', W + 0.003, 0.02, L - 0.01, x, 0.112, z);
    bag.box('dark', W - 0.014, 0.014, L - 0.02, x, 0.069, z);
  }
}
/* 公交亭（雨棚 + 背板玻璃 + 立柱） */
function busStop(bag, x, z) {
  bag.box('white', 0.062, 0.008, 0.16, x, 0.125, z, 0, 0, 0);
  bag.box('glass', 0.005, 0.05, 0.15, x + 0.026, 0.095, z);
  bag.cyl('steel', 0.005, 0.005, 0.075, x - 0.024, 0.0875, z - 0.07, 0, 0, 0, 6);
  bag.cyl('steel', 0.005, 0.005, 0.075, x - 0.024, 0.0875, z + 0.07, 0, 0, 0, 6);
}
/* 玻璃地铁亭（玻璃盒 + 钢框角柱 + 顶沿 + 门洞） */
function metroBox(bag, x, z) {
  bag.box('glass', 0.22, 0.095, 0.1, x, 0.0975, z);
  var i, sx = [-1, 1], sz = [-1, 1];
  for (i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
    bag.box('steel', 0.014, 0.1, 0.014, x + sx[i] * 0.104, 0.1, z + sz[j] * 0.046);
  }
  bag.box('steel', 0.236, 0.012, 0.124, x, 0.152, z);
  bag.box('steel', 0.236, 0.01, 0.124, x, 0.052, z);
  bag.box('dark', 0.05, 0.07, 0.008, x + 0.06, 0.085, z + 0.051);
}

/* ================= 6. 工厂 ================= */
window.Special3DModern[5] = function () {
  var g = new THREE.Group();
  g.name = 'special5m_central_station';
  var bag = new Bag();
  var i, sx, k;

  /* —— 大厅几何常量：浅拱 R/矢高/轴心/檐口 —— */
  var HW = 0.72;                        /* 台基半宽 */
  var R = 0.6156, RISE = 0.36;          /* 拱半径 / 矢高（浅拱：半跨 0.56、矢跨比 0.32，参考为扁弧大跨） */
  var YE = 0.70;                        /* 檐口高（幕墙顶） */
  var YC = YE - (R - RISE);             /* 拱心 y ≈ 0.444 */
  var PHI = Math.acos((R - RISE) / R);  /* 半弧角 1.287rad */
  var A = R * Math.sin(PHI);            /* 檐口半跨 ≈0.56 */
  var AZ = -0.275, ALEN = 0.93;         /* 屋面轴心 z / 进深（前后出挑） */
  var TOP = YC + R;                     /* 屋面顶 ≈1.12 */

  /* ========== 6.1 沙盘基座：广场石板（底面 y=0） ========== */
  bag.box('pave', 2.68, 0.05, 2.68, 0, 0.025, 0, 0, 0, 0, SC.pave);

  /* ========== 6.2 站前广场：前沿环路 + 斑马线 + 轴线步道 + 绿化床 + 树列 ========== */
  bag.box('road', 2.68, 0.004, 0.2, 0, 0.052, 1.22, 0, 0, 0, SC.road);                  /* 前环路（贴前沿） */
  bag.box('road', 0.21, 0.004, 1.17, -1.235, 0.0522, 0.735, 0, 0, 0, SC.road);          /* 西环路 */
  bag.box('road', 0.21, 0.004, 1.17, 1.235, 0.0522, 0.735, 0, 0, 0, SC.road);           /* 东环路 */
  bag.box('white', 2.68, 0.006, 0.012, 0, 0.056, 1.114);                                /* 路缘石 ×3 */
  bag.box('white', 0.012, 0.006, 0.97, -1.127, 0.056, 0.635);
  bag.box('white', 0.012, 0.006, 0.97, 1.127, 0.056, 0.635);
  for (i = 0; i < 5; i++) {                                                             /* 斑马线 ×2 */
    bag.box('white', 0.03, 0.0025, 0.16, -0.51 + i * 0.03, 0.0553, 1.22);
    bag.box('white', 0.03, 0.0025, 0.16, 0.49 + i * 0.03, 0.0553, 1.22);
  }
  bag.box('conc', 0.36, 0.003, 0.68, 0, 0.0515, 0.62, 0, 0, 0, SC.pave);                /* 轴线步道 */
  for (sx = -1; sx <= 1; sx += 2) {                                                     /* 绿化床 ×2 + 白缘石 */
    bag.box('hedge', 0.4, 0.008, 0.34, sx * 0.5, 0.054, 0.5);
    bag.box('white', 0.42, 0.01, 0.014, sx * 0.5, 0.055, 0.335);
    bag.box('white', 0.42, 0.01, 0.014, sx * 0.5, 0.055, 0.665);
    bag.box('white', 0.014, 0.01, 0.34, sx * 0.5 - sx * 0.203, 0.055, 0.5);
    bag.box('white', 0.014, 0.01, 0.34, sx * 0.5 + sx * 0.203, 0.055, 0.5);
    tree(bag, sx * 0.5, 0.5, 0.7);
    shrub(bag, sx * 0.4, 0.42, 0.035);
    shrub(bag, sx * 0.62, 0.6, 0.03);
  }
  tree(bag, -0.14, 0.95, 0.62); tree(bag, 0.14, 0.95, 0.62);                            /* 前排行道树 ×8 */
  tree(bag, -0.5, 0.95, 0.62); tree(bag, 0.5, 0.95, 0.62);
  tree(bag, -0.86, 0.95, 0.62); tree(bag, 0.86, 0.95, 0.62);
  tree(bag, -1.18, 0.95, 0.62); tree(bag, 1.18, 0.95, 0.62);
  tree(bag, -0.32, 1.02, 0.58); tree(bag, 0.32, 1.02, 0.58);                            /* 轴线对树 ×2 */
  tree(bag, -0.74, 0.7, 0.62); tree(bag, 0.74, 0.7, 0.62);                              /* 中庭侧树 ×2 */
  shrub(bag, -0.6, 0.3, 0.045); shrub(bag, 0.6, 0.3, 0.045);
  shrub(bag, -0.26, 0.98, 0.035); shrub(bag, 0.26, 0.98, 0.035);
  metroBox(bag, -0.34, 0.84); metroBox(bag, 0.34, 0.84);                                /* 玻璃地铁亭 ×2 */
  for (i = 0; i < 5; i++) taxi(bag, -0.86 + i * 0.13, 0.78);                            /* 出租车排队 ×5 */
  bus(bag, 0.9, 1.22, false);                                                           /* 公交 ×2 */
  bus(bag, 1.24, 0.42, true);
  busStop(bag, 0.86, 0.52); busStop(bag, 0.86, 0.8);                                    /* 公交亭 ×2 */
  lampPost(bag, -1.02, 1.05, 1); lampPost(bag, 1.02, 1.05, -1);                         /* 路灯 ×4 */
  lampPost(bag, -0.32, 0.3, 1); lampPost(bag, 0.32, 0.3, -1);
  bag.cyl('steel', 0.009, 0.009, 0.055, -0.55, 0.0775, 0.3, 0, 0, 0, 8);                /* 入口矮柱 ×2 */
  bag.cyl('white', 0.01, 0.01, 0.012, -0.55, 0.1, 0.3, 0, 0, 0, 8);
  bag.cyl('steel', 0.009, 0.009, 0.055, 0.55, 0.0775, 0.3, 0, 0, 0, 8);
  bag.cyl('white', 0.01, 0.01, 0.012, 0.55, 0.1, 0.3, 0, 0, 0, 8);

  /* ========== 6.3 中央大厅：台基/台阶/勒脚 + 幕墙 + 浅拱屋面 + 拱形天窗 + 大钟 ========== */
  bag.box('conc', HW * 2, 0.12, 0.88, 0, 0.11, -0.31, 0, 0, 0, SC.conc);                /* 台基 z -0.75..0.13 */
  bag.box('dark', HW * 2 + 0.016, 0.03, 0.896, 0, 0.065, -0.31);                        /* 勒脚 */
  bag.box('conc', 1.06, 0.08, 0.05, 0, 0.09, 0.155);                                    /* 台阶 ×2 */
  bag.box('conc', 1.06, 0.04, 0.05, 0, 0.07, 0.21);
  /* 通高玻璃幕墙：平面外凸弧线（5 段折线逼近，矢高 0.03）+ 钢竖梃 ×11 / 分段横档 ×4 */
  var segW = 0.228, kk = 0.147, j, xj, zj, ryj, nx, nz;
  for (j = -2; j <= 2; j++) {
    xj = j * segW; zj = 0.146 - kk * xj * xj; ryj = Math.atan(2 * kk * xj);
    nx = Math.sin(ryj) * 0.013; nz = Math.cos(ryj) * 0.013;
    bag.box('glass', segW, 0.53, 0.024, xj, 0.435, zj, 0, ryj, 0, SC.glass);
    bag.box('steel', segW, 0.012, 0.014, xj + nx, 0.635, zj + nz, 0, ryj, 0);
    bag.box('steel', segW, 0.012, 0.014, xj + nx, 0.475, zj + nz, 0, ryj, 0);
    bag.box('steel', segW, 0.012, 0.014, xj + nx, 0.31, zj + nz, 0, ryj, 0);
    bag.box('steel', segW, 0.016, 0.014, xj + nx, 0.185, zj + nz, 0, ryj, 0);
  }
  var finX = [-0.57, -0.456, -0.342, -0.228, -0.114, 0, 0.114, 0.228, 0.342, 0.456, 0.57];
  for (j = 0; j < finX.length; j++) {
    xj = finX[j]; zj = 0.146 - kk * xj * xj; ryj = Math.atan(2 * kk * xj);
    bag.box('steel', 0.014, 0.53, 0.016, xj + Math.sin(ryj) * 0.014, 0.435, zj + Math.cos(ryj) * 0.014, 0, ryj, 0);
  }
  /* 浅拱金属屋面（前后出挑）+ 檐口白边 + 端拱弧肋 */
  bag.vault('vault', R, ALEN, PI - PHI, PHI * 2, 0, YC, AZ);
  bag.box('white', 0.02, 0.02, ALEN, -A - 0.004, YE, AZ);
  bag.box('white', 0.02, 0.02, ALEN, A + 0.004, YE, AZ);
  bag.torus('white', R + 0.004, 0.012, 0, YC, 0.19, 30, PI - 2 * Math.atan2(YE - YC, A), Math.atan2(YE - YC, A));
  bag.torus('white', R + 0.004, 0.012, 0, YC, -0.74, 30, PI - 2 * Math.atan2(YE - YC, A), Math.atan2(YE - YC, A));
  /* 拱形端天窗（前玻璃，退于幕墙之后 + 后封板）+ 拱部钢竖梃翼肋 ×6 + 横档 ×2 */
  bag.arch('glass', A, YE, YE, R, YC, 0, 0.126, false, SC.glass);
  bag.arch('conc', A - 0.004, 0.17, YE, R - 0.004, YC, 0, -0.745, true, SC.conc);
  var mullX = [-0.49, -0.42, -0.28, -0.14, 0.14, 0.28, 0.42, 0.49];
  for (i = 0; i < 8; i++) {
    var mx = mullX[i], myTop = YC + Math.sqrt(R * R - mx * mx);
    bag.box('steel', 0.012, myTop - YE, 0.012, mx, (myTop + YE) / 2, 0.132);
  }
  bag.box('steel', 1.02, 0.012, 0.012, 0, 0.78, 0.132);
  bag.box('steel', 0.6, 0.012, 0.012, 0, 0.98, 0.132);
  /* 屋面天窗带 ×3（玻璃条 + 白色脊帽，随弧面切线斜置） */
  var skx = [-0.22, 0, 0.22];
  for (i = 0; i < 3; i++) {
    var x0 = skx[i];
    var dysq = R * R - x0 * x0, sq = Math.sqrt(dysq);
    var th = PI - Math.atan2(x0, sq);                                                   /* 该点 θ 角 */
    var ys = YC - R * Math.cos(th);
    var tilt = Math.atan2(-x0, sq);
    bag.box('glass', 0.05, 0.012, 0.9, x0, ys + 0.006, AZ, 0, 0, tilt, SC.glass);
    bag.box('white', 0.02, 0.018, 0.9, x0, ys + 0.012, AZ, 0, 0, tilt);
  }
  /* 台基侧平顶（拱脚外两条）+ 台基侧墙竖窗板 */
  for (sx = -1; sx <= 1; sx += 2) {
    bag.box('white', 0.16, 0.014, 0.9, sx * 0.64, YE + 0.008, AZ);
    bag.box('winWall', 0.012, 0.26, 0.7, sx * 0.727, 0.3, -0.31, 0, 0, 0, SC.win);
  }
  /* 入口雨棚（轻薄白板 + 白檐口 + 钢柱列） */
  bag.box('white', 1.34, 0.012, 0.3, 0, 0.562, 0.31);
  bag.box('white', 1.34, 0.07, 0.01, 0, 0.524, 0.462);
  bag.box('steel', 1.34, 0.012, 0.012, 0, 0.486, 0.462);
  for (i = 0; i < 6; i++) bag.cyl('steel', 0.01, 0.01, 0.506, -0.6 + i * 0.24, 0.303, 0.42, 0, 0, 0, 10);
  /* 站名牌（雨棚檐口） */
  var sign = signMesh('中央车站', 0.46, 0.062);
  sign.position.set(0, 0.524, 0.469); g.add(sign);
  /* 拱心大钟（钢圈 + 盘面 + 时/分针 + 中轴） */
  bag.torus('steel', 0.075, 0.008, 0, 0.84, 0.132, 24, PI * 2, 0);
  var faceM = clockFaceMesh(0.07); faceM.position.set(0, 0.84, 0.13); g.add(faceM);
  var minH = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.056, 0.004).translate(0, 0.024, 0), mats().dark);
  minH.position.set(0, 0.84, 0.134); g.add(minH);
  var hrH = new THREE.Mesh(new THREE.BoxGeometry(0.01, 0.04, 0.004).translate(0, 0.016, 0), mats().dark);
  hrH.position.set(0, 0.84, 0.133); g.add(hrH);
  bag.cyl('steel', 0.007, 0.007, 0.008, 0, 0.84, 0.136, PI / 2, 0, 0, 10);

  /* ========== 6.4 两翼配楼（竖条窗 + 平顶女儿墙 + 屋顶设备）+ 玻璃连廊 ========== */
  /* 西翼 */
  bag.box('conc', 0.6, 0.46, 0.82, -0.82, 0.28, -0.11, 0, 0, 0, SC.conc);
  bag.box('winWall', 0.58, 0.38, 0.012, -0.82, 0.27, 0.306, 0, 0, 0, SC.win);
  bag.box('winWall', 0.012, 0.38, 0.8, -1.126, 0.27, -0.11, 0, 0, 0, SC.win);
  bag.box('white', 0.56, 0.02, 0.78, -0.82, 0.5, -0.11);
  bag.box('conc', 0.6, 0.03, 0.02, -0.82, 0.525, 0.3);                                  /* 女儿墙 ×4 */
  bag.box('conc', 0.6, 0.03, 0.02, -0.82, 0.525, -0.52);
  bag.box('conc', 0.02, 0.03, 0.86, -1.12, 0.525, -0.11);
  bag.box('conc', 0.02, 0.03, 0.86, -0.52, 0.525, -0.11);
  acUnit(bag, -0.95, 0.545, -0.28);
  bag.box('dark', 0.1, 0.2, 0.014, -0.82, 0.15, 0.307);                                 /* 翼楼入口 */
  bag.box('white', 0.2, 0.008, 0.08, -0.82, 0.26, 0.33);
  /* 东翼（稍高） */
  bag.box('conc', 0.6, 0.51, 0.88, 0.82, 0.305, -0.11, 0, 0, 0, SC.conc);
  bag.box('winWall', 0.58, 0.42, 0.012, 0.82, 0.29, 0.346, 0, 0, 0, SC.win);
  bag.box('winWall', 0.012, 0.42, 0.86, 1.126, 0.29, -0.11, 0, 0, 0, SC.win);
  bag.box('white', 0.56, 0.02, 0.84, 0.82, 0.55, -0.11);
  bag.box('conc', 0.6, 0.03, 0.02, 0.82, 0.575, 0.33);
  bag.box('conc', 0.6, 0.03, 0.02, 0.82, 0.575, -0.55);
  bag.box('conc', 0.02, 0.03, 0.9, 1.12, 0.575, -0.11);
  bag.box('conc', 0.02, 0.03, 0.9, 0.52, 0.575, -0.11);
  acUnit(bag, 0.68, 0.595, -0.2);
  acUnit(bag, 0.72, 0.595, -0.5);
  bag.box('conc', 0.16, 0.1, 0.12, 0.95, 0.6, -0.35);                                   /* 楼梯间 + 避雷针 */
  bag.box('dark', 0.08, 0.06, 0.012, 0.95, 0.585, -0.286);
  bag.cyl('steel', 0.004, 0.004, 0.14, 0.95, 0.72, -0.35, 0, 0, 0, 6);
  bag.box('dark', 0.1, 0.2, 0.014, 0.82, 0.15, 0.347);
  bag.box('white', 0.2, 0.008, 0.08, 0.82, 0.26, 0.37);
  /* 玻璃连廊 ×2（接主厅与两翼） */
  for (sx = -1; sx <= 1; sx += 2) {
    bag.box('glass', 0.2, 0.28, 0.34, sx * 0.62, 0.31, -0.05, 0, 0, 0, SC.glass);
    bag.box('steel', 0.014, 0.3, 0.014, sx * 0.53, 0.31, 0.115);
    bag.box('steel', 0.014, 0.3, 0.014, sx * 0.53, 0.31, -0.215);
    bag.box('white', 0.22, 0.012, 0.36, sx * 0.62, 0.456, -0.05);
  }

  /* ========== 6.5 站后站台区：雨棚 ×4 + 轨道 ×3 + 门架 ×3 + 动车组 ========== */
  var canopyZ = [-0.845, -0.995, -1.145, -1.29], trackZ = [-0.92, -1.07, -1.22];
  for (i = 0; i < 4; i++) {
    var cz = canopyZ[i];
    bag.box('white', 2.56, 0.03, 0.056, 0, 0.065, cz);                                  /* 站台条板 */
    bag.box('white', 2.62, 0.016, 0.036, 0, 0.419, cz);                                 /* 连续折板雨棚 */
    bag.box('white', 2.62, 0.014, 0.03, 0, 0.416, cz - 0.029, -0.7, 0, 0);
    bag.box('white', 2.62, 0.014, 0.03, 0, 0.416, cz + 0.029, 0.7, 0, 0);
    bag.box('white', 2.62, 0.022, 0.008, 0, 0.412, cz + 0.05);                          /* 檐口封板（前） */
    bag.box('white', 2.62, 0.022, 0.008, 0, 0.412, cz - 0.05);                          /* 檐口封板（后） */
    for (k = 0; k < 4; k++) bag.cyl('steel', 0.012, 0.012, 0.35, -0.9 + k * 0.6, 0.225, cz, 0, 0, 0, 8);
  }
  for (i = 0; i < 3; i++) {                                                             /* 轨道 ×3（道砟 + 双轨） */
    var tz = trackZ[i];
    bag.box('ballast', 2.6, 0.008, 0.07, 0, 0.054, tz, 0, 0, 0, SC.ballast);
    bag.box('rail', 2.56, 0.006, 0.008, 0, 0.062, tz - 0.018, 0, 0, 0, 6);
    bag.box('rail', 2.56, 0.006, 0.008, 0, 0.062, tz + 0.018, 0, 0, 0, 6);
  }
  var gx = [-0.85, 0, 0.85];
  for (i = 0; i < 3; i++) {                                                             /* 接触网门架 ×3（矮） */
    bag.cyl('steel', 0.01, 0.01, 0.52, gx[i], 0.31, -0.8, 0, 0, 0, 8);
    bag.cyl('steel', 0.01, 0.01, 0.52, gx[i], 0.31, -1.33, 0, 0, 0, 8);
    bag.box('steel', 0.018, 0.012, 0.53, gx[i], 0.575, -1.065);
    bag.box('dark', 0.012, 0.02, 0.012, gx[i], 0.59, -0.98);
    bag.box('dark', 0.012, 0.02, 0.012, gx[i], 0.59, -1.16);
  }
  /* 动车组（白车身 + 深色长窗带 + 金腰线 + 裙边 + 圆润车头 + 车顶暗线 + 受电弓） */
  bag.box('white', 2.2, 0.115, 0.072, -0.05, 0.118, -1.07, 0, 0, 0, SC.conc);
  bag.box('dark', 2.2, 0.032, 0.074, -0.05, 0.152, -1.07);
  bag.box('yellow', 2.2, 0.008, 0.073, -0.05, 0.128, -1.07);
  bag.box('dark', 2.2, 0.03, 0.062, -0.05, 0.075, -1.07);
  bag.box('dark', 2.2, 0.006, 0.05, -0.05, 0.178, -1.07);
  bag.cyl('white', 0.036, 0.036, 0.08, 1.13, 0.118, -1.07, 0, 0, PI / 2, 12);
  bag.box('dark', 0.02, 0.05, 0.05, 1.05, 0.16, -1.07);
  bag.box('steel', 0.05, 0.006, 0.006, -0.4, 0.198, -1.07);
  bag.box('steel', 0.006, 0.05, 0.006, -0.42, 0.172, -1.07, 0, 0, 0.5);
  bag.box('steel', 0.006, 0.05, 0.006, -0.38, 0.172, -1.07, 0, 0, -0.5);

  /* ========== 6.6 合并落地 ========== */
  bag.build(g);

  /* ========== 6.7 发光件（每实例新建）+ 动画 ≤2 项 ========== */
  var glowMat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: texHall(), emissive: C('#ffbe72'), emissiveMap: texHall(),
    emissiveIntensity: 0.5, roughness: 0.6
  });
  var hallGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.08, 0.5), glowMat);
  hallGlow.position.set(0, 0.42, 0.095); g.add(hallGlow);                               /* 候车厅内景（弧形幕墙之后） */
  (function () {                                                                        /* 站台雨棚灯带 ×4（并 1 mesh） */
    var pos = [], nor = [], uv = [];
    for (var n = 0; n < 4; n++) {
      var gg = new THREE.BoxGeometry(2.44, 0.01, 0.024).translate(0, 0.404, canopyZ[n]).toNonIndexed();
      var p = gg.attributes.position.array, nr = gg.attributes.normal.array, u = gg.attributes.uv.array;
      for (var j2 = 0; j2 < p.length; j2++) pos.push(p[j2]);
      for (j2 = 0; j2 < nr.length; j2++) nor.push(nr[j2]);
      for (j2 = 0; j2 < u.length; j2++) uv.push(u[j2]);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.add(new THREE.Mesh(geo, glowMat));
  })();

  g.userData.anim = [
    function (t) {                                                                      /* 1) 拱心大钟指针 */
      minH.rotation.z = -t * (PI / 30);
      hrH.rotation.z = -t * (PI / 360);
    },
    function (t) {                                                                      /* 2) 暖光呼吸（幅度 ≤0.25） */
      glowMat.emissiveIntensity = 0.5 + 0.18 * Math.sin(t * 1.6 + 0.7);
    }
  ];
  g.userData.specialId = 5;
  g.userData.parts = { minuteHand: minH, hourHand: hrH, glowMat: glowMat, sign: sign };
  return g;
};

})();
