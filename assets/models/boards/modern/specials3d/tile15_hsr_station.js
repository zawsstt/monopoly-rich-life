/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/specials3d/tile15_hsr_station.js  格 15「高铁虹桥站」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/special_15.png（2020s 单象限，写实航拍 3/4 视角高铁枢纽）：
 *   主站房  ：横向大跨扁弧银白金属屋盖（半跨 0.95 / 矢高 0.36，直立锁边细缝 + 5 条顺坡蓝灰
 *             玻璃天窗带 + 白脊帽 + 前后檐口弧肋 + 檐口白边），拱脚处通高蓝灰玻璃幕墙
 *             （7 大分格细竖梃 + 三道横档 + 中央三樘玻璃门 + 门头横楣）+ 拱肩弧形高侧玻璃
 *             （竖梃随弧变高 ×6）+ 门廊雨棚（白石板 + 2 玻璃带 + 白柱列 ×6 +「虹桥站」站名牌）
 *             + 台基/勒脚/台阶 + 右侧对站台通高玻璃带 + 左端竖窗带 + 后拱封板
 *   左翼    ：贴站房左端的低层配楼（竖条窗带、条纹金属平顶 + 女儿墙、空调机组 ×2/楼梯间/避雷针）
 *   站台区  ：右侧两条到发线（道砟/钢轨）+ 每线 1 条连续白色低拱雨棚（蓝色脊条 + 弧肋 ×6 +
 *             钢柱列 ×8）+ 接触网门架 ×2 + 站台（黄警戒线/长椅）+ 停靠白色复兴号 ×2
 *             （深色长窗带/红金腰线/裙边/圆润车头/风挡/受电弓/转向架/头灯）
 *   站前    ：高架落客弯桥（贝塞尔弧线 8 平段 + 4 下匝段 + 白色栏板 + 车道虚线 + 细长锥形桥墩
 *             ×6 + 桥面车辆 ×2）+ 浅色石板广场 + 中央轴线步道/斑马线 + 绿化床 ×2（乔木 ×8/
 *             灌木 ×6/白色缘石）+ 玻璃地铁亭 + 路灯 ×3
 *
 * 注册：window.Special3DModern[15]() → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.7×2.7（实测 2.69×2.68，高 1.23）；底面 y=0；正面 +z（站前广场/落客弯桥朝 +z）；
 *       draw call ≤60（实测 24）；三角 ≤28k（实测 13.2k）；Canvas 纹理 ≤256px；
 *       源码零 Math.random（mulberry32 种子流）；
 *       动画 2 项：候车厅/雨棚暖光呼吸 + 复兴号头灯脉冲（≤2 项封顶，幅度 ≤0.25）。
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils）——
 *       静态件全部合并为每材质 1 个 mesh（19 材质桶 + 站名牌/内景/灯带/头灯 ×2 = 24 draw call）；
 *       大弧屋面/雨棚用开口圆柱段（θ 限浅拱角域，UV 按弧长/进深烘焙）；拱肩玻璃/后封板用
 *       THREE.Shape 拱形面板；高架弯桥用贝塞尔采样分段盒（rotateZ 坡度 → rotateY 航向几何预变换）；
 *       文件结构对齐已验收范例 boards/modern/specials3d/tile5_station.js。
 *
 * 本轮 R1→R2 变更摘要（对照参考图差距清单逐条清偿）：
 *   ①占地 2.77→2.69（拱 R 按半跨 0.95 反算、弯桥端点内收）②半圆桶拱改大跨扁弧（矢跨比 0.36）
 *   ③天窗带 3→5 条并加宽 ④幕墙提亮、9→7 大分格 ⑤檐口 0.78→0.80 ⑥翼楼贴合站房左端并压低
 *   ⑦站台雨棚 4 节分离小拱→连续长拱 + 弧肋 ⑧弯桥桥面 0.20→0.17、桥墩细长 5→6 ⑨站名牌加大
 *   ⑩屋面进深 1.90→1.66 ⑪雨棚灯带贴近拱顶 ⑫乔木 5→8、灌木 3→6
 * R2→R3（对照 r2 渲染再校）：天窗带改不透明蓝灰专用材质（半透明玻璃叠金属被洗白）；
 *   站台雨棚改白壳 + 蓝色脊条（参考为白色拱顶）；檐口 0.80→0.84、矢高 0.36（屋顶 1.20，更高挑）；
 *   右侧对站台玻璃通高；翼楼屋面改条纹金属；前后檐口弧肋加厚 0.012→0.016。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[boards/modern/specials3d/tile15_hsr_station] THREE 未定义，请先加载 three.min.js (r147)');
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
/* 广场石板：浅暖灰大板 + 十字分缝 + 受光/阴影边 + 色差斑 */
function texPave() {
  return cvTex('s15pave', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#bcb8ac'; g.fillRect(0, 0, w, h);
    var r, c, s = 64;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.93 + rnd() * 0.14, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(206 * v) + ',' + Math.round(202 * v) + ',' + Math.round(190 * v) + ')';
      g.fillRect(x + 3, y + 3, s - 6, s - 6);
      g.fillStyle = 'rgba(255,253,246,0.32)'; g.fillRect(x + 3, y + 3, s - 6, 2); g.fillRect(x + 3, y + 3, 2, s - 6);
      g.fillStyle = 'rgba(88,84,74,0.22)'; g.fillRect(x + 3, y + s - 5, s - 6, 2); g.fillRect(x + s - 5, y + 3, 2, s - 6);
      if (rnd() < 0.3) { g.fillStyle = 'rgba(130,126,112,0.14)'; g.fillRect(x + 8 + ((rnd() * 24) | 0), y + 8 + ((rnd() * 24) | 0), 12 + ((rnd() * 22) | 0), 7 + ((rnd() * 14) | 0)); }
    }
    speckle(g, w, h, rnd, 120, 'rgba(110,106,96,0.15)', 'rgba(242,240,232,0.18)', 12, 6);
  });
}
/* 沥青桥面：深灰底 + 碎斑 + 中间白虚线（u 沿桥长）+ 两侧边缘实线 */
function texRoad() {
  return cvTex('s15road', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#54585c'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 150, 'rgba(30,32,36,0.3)', 'rgba(120,124,128,0.24)', 4, 3);
    g.fillStyle = '#e8e6e0';
    for (var x = 6; x < w; x += 42) g.fillRect(x, 62, 22, 4);
    g.fillStyle = 'rgba(232,230,224,0.7)'; g.fillRect(0, 10, w, 3); g.fillRect(0, h - 13, w, 3);
  });
}
/* 浅色混凝土/铝板墙：板缝 + 色斑 + 竖向雨水痕 + 根部污带 */
function texConc() {
  return cvTex('s15conc', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#d8d6ce'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 110, 'rgba(150,148,140,0.2)', 'rgba(246,244,238,0.24)', 4, 3);
    g.fillStyle = 'rgba(96,96,92,0.2)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(140,140,134,0.15)'; g.fillRect((rnd() * w) | 0, 0, 2 + ((rnd() * 3) | 0), 30 + ((rnd() * 60) | 0)); }
    g.fillStyle = 'rgba(100,98,92,0.16)'; g.fillRect(0, h - 12, w, 12);
  });
}
/* 配楼竖条窗带：白墙 + 窄竖向玻璃条 + 窗台影 + 横向层间梁 */
function texWin() {
  return cvTex('s15win', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#e8e6de'; g.fillRect(0, 0, w, h);
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
  return cvTex('s15vault', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#ccd3d9'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 16; i++) {
      var x = i * 16, v = 0.96 + rnd() * 0.1;
      g.fillStyle = 'rgb(' + Math.round(212 * v) + ',' + Math.round(219 * v) + ',' + Math.round(226 * v) + ')';
      g.fillRect(x + 2, 0, 14, h);
      g.fillStyle = 'rgba(250,252,255,0.65)'; g.fillRect(x + 4, 0, 2, h);
      g.fillStyle = 'rgba(130,140,150,0.32)'; g.fillRect(x, 0, 1, h);
      g.fillStyle = 'rgba(160,170,180,0.25)'; g.fillRect(x + 15, 0, 1, h);
    }
    g.fillStyle = 'rgba(140,150,160,0.10)';
    for (i = 0; i < 4; i++) g.fillRect(0, i * 64 + 62, w, 2);
    speckle(g, w, h, rnd, 60, 'rgba(140,150,160,0.12)', 'rgba(252,253,255,0.24)', 6, 3);
  });
}
/* 幕墙玻璃：明亮蓝灰天空反射竖向渐变 + 细竖梃 + 淡横档 + 斜高光带 */
function texGlass() {
  return cvTex('s15glass', 128, 128, function (g, w, h) {
    for (var x = 0; x < w; x++) {
      var t = x / w, v = 0.88 + 0.14 * Math.sin(t * 6.283 * 1.4 + 0.5) + 0.04 * Math.sin(t * 36);
      g.fillStyle = 'rgb(' + Math.round(154 * v) + ',' + Math.round(184 * v) + ',' + Math.round(198 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    g.fillStyle = 'rgba(40,58,68,0.18)';
    for (var y = 0; y < h; y += 26) g.fillRect(0, y, w, 2);
    g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(16, 0, 9, h); g.fillRect(80, 0, 4, h);
    g.strokeStyle = 'rgba(232,240,244,0.55)'; g.lineWidth = 2;
    for (x = 0; x <= w; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  });
}
/* 道砟轨道床：深灰砾石 */
function texBallast() {
  return cvTex('s15ballast', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#57544c'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 220, 'rgba(28,26,22,0.5)', 'rgba(150,146,134,0.4)', 3, 2);
    g.fillStyle = 'rgba(70,66,58,0.5)'; g.fillRect(0, 30, w, 8); g.fillRect(0, 90, w, 8);
  });
}
/* 树冠叶斑（三层明暗叶簇） */
function texLeaf() {
  return cvTex('s15leaf', 128, 128, function (g, w, h, rnd) {
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
  return cvTex('s15hall', 256, 128, function (g, w, h, rnd) {
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
    road:    M('#ffffff', { map: texRoad(), rough: 0.97 }),
    conc:    M('#ffffff', { map: texConc(), rough: 0.9, ds: true }),
    winWall: M('#ffffff', { map: texWin(), rough: 0.8, ds: true }),
    vault:   M('#ffffff', { map: texVault(), rough: 0.45, metal: 0.3, ds: true }),
    sky:     M('#7498b0', { rough: 0.16, metal: 0.45 }),
    glass:   M('#ffffff', { map: texGlass(), rough: 0.06, metal: 0.55, tr: 0.5 }),
    white:   M('#f0efe9', { rough: 0.6 }),
    twhite:  M('#f4f6f7', { rough: 0.32, metal: 0.15 }),
    steel:   M('#828c94', { rough: 0.45, metal: 0.7 }),
    dark:    M('#2b3034', { rough: 0.6, metal: 0.2 }),
    rail:    M('#aab2b8', { rough: 0.3, metal: 0.85 }),
    ballast: M('#ffffff', { map: texBallast(), rough: 0.98 }),
    green:   M('#ffffff', { map: texLeaf(), rough: 0.95 }),
    green2:  M('#a9b894', { map: texLeaf(), rough: 0.95 }),
    hedge:   M('#5d7a3f', { rough: 1 }),
    trunk:   M('#8c7050', { rough: 0.9 }),
    gold:    M('#c8a35c', { rough: 0.5, metal: 0.2 }),
    red:     M('#b03a2e', { rough: 0.55 })
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
var SC = { pave: 0.85, road: 2.6, conc: 1.3, win: 1.6, vault: 1.0, glass: 1.2, ballast: 3 };
Bag.prototype.box = function (key, w, h, d, x, y, z, rx, ry, rz, sc) {
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, sc !== undefined ? sc : SC.conc);
  this.put(key, g, m4(x, y, z, rx, ry, rz));
};
Bag.prototype.cyl = function (key, rt, rb, h, x, y, z, rx, ry, rz, seg) {
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 12), m4(x, y, z, rx, ry, rz));
};
Bag.prototype.sph = function (key, r, x, y, z, ws, hs) {
  this.put(key, new THREE.SphereGeometry(r, ws || 14, hs || 10), m4(x, y, z));
};
Bag.prototype.plane = function (key, w, h, x, y, z, rx, ry, rz) {
  this.put(key, new THREE.PlaneGeometry(w, h), m4(x, y, z, rx, ry, rz));
};
/* 浅拱屋面：开口圆柱段（θ 限顶拱角域），轴沿 z；UV 按弧长/长度烘焙 */
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
Bag.prototype.arch = function (key, a, y0, yE, R, yc, x, y, z, ry, sc) {
  this.put(key, archGeo(a, y0, yE, R, yc, sc || 1.2), m4(x, y || 0, z, 0, ry || 0, 0));
};
Bag.prototype.torus = function (key, r, tube, x, y, z, seg, arc, rz) {
  this.put(key, new THREE.TorusGeometry(r, tube, 6, seg || 30, arc !== undefined ? arc : PI), m4(x, y, z, 0, 0, rz || 0));
};
/* 弯桥分段：沿路径段 p0→p1（含 y0→y1 坡度）放置长条盒；
 * offZ/yOff 为局部横向/竖向偏移（栏板/车道线用），yaw+pitch 几何预变换 */
Bag.prototype.seg = function (key, w, h, d, sc, offZ, yOff, p0, y0, p1, y1) {
  var dx = p1.x - p0.x, dz = p1.z - p0.z, hl = Math.sqrt(dx * dx + dz * dz);
  var yaw = -Math.atan2(dz, dx), pitch = Math.atan2(y1 - y0, hl);
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, sc);
  g.translate(0, yOff, offZ);
  g.rotateZ(pitch);
  g.rotateY(yaw);
  g.translate((p0.x + p1.x) / 2, (y0 + y1) / 2, (p0.z + p1.z) / 2);
  this.put(key, g, null);
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
/* 玻璃地铁亭（玻璃盒 + 钢框角柱 + 顶沿 + 门洞） */
function metroBox(bag, x, z) {
  bag.box('glass', 0.17, 0.085, 0.095, x, 0.0925, z);
  var i, sx = [-1, 1], sz = [-1, 1];
  for (i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
    bag.box('steel', 0.012, 0.09, 0.012, x + sx[i] * 0.081, 0.095, z + sz[j] * 0.044);
  }
  bag.box('steel', 0.19, 0.012, 0.115, x, 0.141, z);
  bag.box('steel', 0.19, 0.01, 0.115, x, 0.048, z);
  bag.box('dark', 0.045, 0.06, 0.008, x + 0.045, 0.08, z + 0.049);
}
/* 白色复兴号动车组（白身 + 深色长窗带 + 红金腰线 + 裙边 + 圆润车头 + 受电弓 + 转向架）
 * xc：轨道中心；headlamps：true 时头灯不并入（由独立发光 mesh 承担） */
function fuxing(bag, xc, headlamps) {
  bag.box('twhite', 0.14, 0.115, 1.50, xc, 0.175, -0.38, 0, 0, 0, SC.conc);   /* 车身 */
  var nose = new THREE.SphereGeometry(0.07, 16, 12);                           /* 车头（+z 端） */
  nose.scale(1, 0.85, 1.9);
  bag.put('twhite', nose, m4(xc, 0.172, 0.415));
  var tail = new THREE.SphereGeometry(0.07, 14, 10);                           /* 车尾圆钝端 */
  tail.scale(1, 0.88, 1.15);
  bag.put('twhite', tail, m4(xc, 0.175, -1.13));
  bag.box('dark', 0.143, 0.032, 1.42, xc, 0.198, -0.40);                       /* 长窗带 */
  bag.box('dark', 0.088, 0.028, 0.055, xc, 0.202, 0.452, -0.55, 0, 0);         /* 风挡 */
  bag.box('gold', 0.144, 0.007, 1.50, xc, 0.160, -0.38);                       /* 金腰线 */
  bag.box('red', 0.144, 0.004, 1.50, xc, 0.1505, -0.38);                       /* 红腰线 */
  bag.box('dark', 0.128, 0.030, 1.46, xc, 0.105, -0.38);                       /* 裙边 */
  bag.box('dark', 0.11, 0.035, 0.22, xc, 0.075, -0.95);                        /* 转向架 ×3 */
  bag.box('dark', 0.11, 0.035, 0.22, xc, 0.075, -0.35);
  bag.box('dark', 0.11, 0.035, 0.22, xc, 0.075, 0.25);
  bag.box('dark', 0.10, 0.006, 1.32, xc, 0.2365, -0.42);                       /* 车顶设备脊 */
  bag.box('steel', 0.05, 0.006, 0.12, xc, 0.238, -0.75);                       /* 受电弓 */
  bag.box('steel', 0.006, 0.09, 0.006, xc - 0.02, 0.272, -0.75, 0, 0, 0.6);
  bag.box('steel', 0.006, 0.09, 0.006, xc + 0.02, 0.272, -0.75, 0, 0, -0.6);
  bag.box('steel', 0.07, 0.006, 0.014, xc, 0.316, -0.75);
  if (!headlamps) {                                                            /* 头灯（静止车） */
    bag.sph('white', 0.013, xc - 0.044, 0.152, 0.528, 10, 8);
    bag.sph('white', 0.013, xc + 0.044, 0.152, 0.528, 10, 8);
  }
}
/* 桥面车辆（车头朝路径 +x 向；yaw 由调用方传） */
function van(bag, x, y, z, ry) {
  bag.box('white', 0.13, 0.045, 0.056, x, y + 0.032, z, 0, ry, 0, SC.conc);
  bag.box('white', 0.05, 0.03, 0.054, x - 0.042, y + 0.024, z, 0, ry, 0, SC.conc);
  bag.box('dark', 0.128, 0.014, 0.05, x + 0.004, y + 0.042, z, 0, ry, 0);
  bag.box('dark', 0.126, 0.016, 0.05, x, y + 0.008, z, 0, ry, 0);
}
function car(bag, x, y, z, ry, key) {
  bag.box(key, 0.108, 0.026, 0.048, x, y + 0.022, z, 0, ry, 0, SC.conc);
  bag.box(key, 0.058, 0.018, 0.044, x - 0.004, y + 0.04, z, 0, ry, 0, SC.conc);
  bag.box('dark', 0.06, 0.01, 0.046, x - 0.004, y + 0.04, z, 0, ry, 0);
  bag.box('dark', 0.1, 0.014, 0.044, x, y + 0.006, z, 0, ry, 0);
}

/* ================= 6. 工厂 ================= */
window.Special3DModern[15] = function () {
  var g = new THREE.Group();
  g.name = 'special15m_hsr_station';
  var bag = new Bag();
  var i, sx, k;

  /* —— 主站房几何常量：大跨浅弧 R/矢高/轴心/檐口 —— */
  var HX = -0.39;                       /* 站房轴线 x */
  var R = 1.43347, RISE = 0.36;         /* 拱半径 / 矢高（半跨 0.95，矢跨比 0.38 大跨扁弧） */
  var YE = 0.84;                        /* 檐口高（幕墙顶） */
  var YC = YE - (R - RISE);             /* 拱心 y ≈ -0.233 */
  var PHI = Math.acos((R - RISE) / R);  /* 半弧角 0.725rad（扁弧） */
  var A = 0.945;                        /* 屋面半跨（檐口略收于拱脚 0.95） */
  var AZ = -0.31, ALEN = 1.66;          /* 屋面轴心 z / 进深（z -1.14..0.52） */
  var TOP = YC + R;                     /* 屋面顶 ≈1.20 */
  var BETA = Math.atan2(YE - YC, 0.95); /* 檐口弧角 */

  /* ========== 6.1 沙盘基座：广场石板（底面 y=0） ========== */
  bag.box('pave', 2.68, 0.05, 2.68, 0, 0.025, 0, 0, 0, 0, SC.pave);

  /* ========== 6.2 站前广场：轴线步道 + 斑马线 + 绿化床 + 地铁亭 + 路灯 ========== */
  bag.box('conc', 0.26, 0.006, 0.86, HX, 0.053, 0.90, 0, 0, 0, SC.pave);                /* 轴线步道 */
  for (i = 0; i < 3; i++) bag.box('white', 0.24, 0.0022, 0.024, HX, 0.0575, 0.85 + i * 0.05); /* 斑马线 */
  for (sx = -1; sx <= 1; sx += 2) {                                                      /* 绿化床 ×2 + 白缘石 */
    var bx = sx < 0 ? -0.87 : 0.58, bw = sx < 0 ? 0.86 : 0.52, bz = sx < 0 ? 1.12 : 1.19, bd = sx < 0 ? 0.36 : 0.26;
    bag.box('hedge', bw - 0.02, 0.01, bd - 0.02, bx, 0.055, bz);
    bag.box('white', bw, 0.012, 0.014, bx, 0.056, bz - bd / 2);
    bag.box('white', bw, 0.012, 0.014, bx, 0.056, bz + bd / 2);
    bag.box('white', 0.014, 0.012, bd, bx - bw / 2, 0.056, bz);
    bag.box('white', 0.014, 0.012, bd, bx + bw / 2, 0.056, bz);
  }
  tree(bag, -1.14, 1.12, 0.7); tree(bag, -0.62, 1.10, 0.62);                             /* 左床乔木 ×2 */
  tree(bag, 0.44, 1.19, 0.6); tree(bag, 0.74, 1.22, 0.55);                              /* 右床乔木 ×2 */
  tree(bag, -0.02, 1.26, 0.56); tree(bag, 1.02, 1.20, 0.5);                             /* 前沿行道树 ×2 */
  shrub(bag, -0.94, 1.0, 0.035); shrub(bag, -0.78, 1.24, 0.03); shrub(bag, 0.62, 1.10, 0.03);
  shrub(bag, -1.20, 0.98, 0.03); shrub(bag, -0.44, 1.24, 0.028); shrub(bag, -0.16, 1.16, 0.03);
  tree(bag, -0.30, 0.72, 0.62); tree(bag, 0.30, 0.70, 0.62);                             /* 站前对树 ×2 */
  metroBox(bag, -0.12, 0.64);                                                            /* 玻璃地铁亭 */
  lampPost(bag, -0.72, 0.66, 1); lampPost(bag, 0.16, 1.14, 1); lampPost(bag, 1.06, 1.24, -1); /* 路灯 ×3 */

  /* ========== 6.3 主站房：台基/台阶/勒脚 + 通高幕墙 + 大跨浅弧屋盖 + 拱肩玻璃 ========== */
  bag.box('conc', 1.86, 0.10, 1.12, HX, 0.10, -0.31, 0, 0, 0, SC.conc);                 /* 台基 z -0.87..0.25 */
  bag.box('dark', 1.88, 0.03, 1.14, HX, 0.065, -0.31);                                  /* 勒脚 */
  bag.box('conc', 1.86, 0.05, 0.09, HX, 0.075, 0.295, 0, 0, 0, SC.conc);                /* 台阶 */
  bag.box('conc', 1.78, 0.69, 1.06, HX, 0.495, -0.31, 0, 0, 0, SC.conc);                /* 站房体 y0.15..0.84 */
  /* 通高玻璃幕墙：7 大分格 + 钢竖梃 ×8 / 横档 ×3，中央三樘玻璃门（明亮大分格） */
  var bayW = 0.238, x0 = -1.235;
  for (i = 0; i < 7; i++) {
    var xc2 = x0 + bayW / 2 + i * bayW;
    bag.box('glass', bayW - 0.018, 0.67, 0.02, xc2, 0.495, 0.245, 0, 0, 0, SC.glass);
    if (i >= 2 && i <= 4) bag.box('dark', 0.20, 0.42, 0.014, xc2, 0.36, 0.256);         /* 入口门扇 */
  }
  for (i = 0; i <= 7; i++) bag.box('steel', 0.014, 0.68, 0.018, x0 + i * bayW, 0.50, 0.252);
  var ty = [0.32, 0.52, 0.72];
  for (i = 0; i < 3; i++) bag.box('steel', 1.70, 0.012, 0.018, HX, ty[i], 0.252);
  bag.box('white', 0.78, 0.05, 0.02, HX, 0.575, 0.256);                                 /* 门头横楣 */
  /* 大跨浅弧金属屋面（轴沿 z，前后满跨）+ 檐口白边 + 前后拱肋 */
  bag.vault('vault', R, ALEN, PI - PHI, PHI * 2, HX, YC, AZ);
  bag.box('white', 0.018, 0.022, ALEN + 0.02, HX - A, YE, AZ);
  bag.box('white', 0.018, 0.022, ALEN + 0.02, HX + A, YE, AZ);
  bag.torus('white', R + 0.004, 0.016, HX, YC, AZ + ALEN / 2 - 0.01, 30, PI - 2 * BETA, BETA);
  bag.torus('white', R + 0.004, 0.016, HX, YC, AZ - ALEN / 2 + 0.01, 30, PI - 2 * BETA, BETA);
  /* 拱肩弧形高侧玻璃（前）+ 竖梃随弧变高 ×6 + 后封板 */
  bag.arch('glass', 0.94, 0.82, YE, R, YC, HX, 0, AZ + ALEN / 2 - 0.012, 0, SC.glass);
  bag.arch('conc', 0.94, 0.17, YE, R - 0.004, YC, HX, 0, AZ - ALEN / 2 + 0.012, PI, SC.conc);
  var clX = [-0.78, -0.52, -0.26, 0.26, 0.52, 0.78];
  for (i = 0; i < 6; i++) {
    var mx = clX[i], myTop = YC + Math.sqrt(R * R - mx * mx);
    bag.box('steel', 0.012, myTop - 0.82, 0.014, HX + mx, (myTop + 0.82) / 2, AZ + ALEN / 2 - 0.012);
  }
  /* 屋面天窗带 ×5（不透明蓝灰玻璃条 + 白色脊帽，随弧面切线斜置，顺坡通长） */
  var skx = [-0.75, -0.375, 0, 0.375, 0.75];
  for (i = 0; i < 5; i++) {
    var x3 = skx[i], sq = Math.sqrt(R * R - x3 * x3);
    var ys = YC + sq, tilt = Math.atan2(-x3, sq);
    bag.box('sky', 0.09, 0.016, 1.56, HX + x3, ys + 0.007, AZ, 0, 0, tilt);
    bag.box('white', 0.030, 0.022, 1.56, HX + x3, ys + 0.016, AZ, 0, 0, tilt);
  }
  /* 站房侧墙：右侧对站台玻璃带（通高）+ 左端竖窗带 */
  bag.box('glass', 0.02, 0.66, 1.02, 0.505, 0.48, -0.31, 0, 0, 0, SC.glass);
  for (i = 0; i < 3; i++) bag.box('steel', 0.018, 0.66, 0.014, 0.509, 0.48, -0.71 + i * 0.4);
  bag.box('winWall', 0.012, 0.32, 0.86, -1.285, 0.38, -0.31, 0, 0, 0, SC.win);

  /* ========== 6.4 门廊雨棚（白石板 + 玻璃带 + 白柱列）+ 站名牌 ========== */
  bag.box('white', 1.16, 0.026, 0.50, -0.02, 0.575, 0.27);                              /* 雨棚板 z 0.02..0.52 */
  bag.box('white', 1.16, 0.05, 0.012, -0.02, 0.55, 0.526);                              /* 前檐口 */
  bag.box('white', 1.16, 0.04, 0.012, -0.02, 0.555, 0.014);
  bag.box('steel', 1.16, 0.01, 0.014, -0.02, 0.522, 0.526);
  for (i = 0; i < 2; i++) {                                                             /* 雨棚玻璃带 ×2 + 脊帽 */
    bag.box('glass', 1.12, 0.010, 0.07, -0.02, 0.591, 0.16 + i * 0.22, 0, 0, 0, SC.glass);
    bag.box('white', 1.12, 0.014, 0.02, -0.02, 0.598, 0.16 + i * 0.22);
  }
  for (i = 0; i < 6; i++) bag.cyl('white', 0.013, 0.013, 0.52, -0.50 + i * 0.192, 0.31, 0.49, 0, 0, 0, 12);
  var sign = signMesh('虹桥站', 0.50, 0.074);
  sign.position.set(-0.02, 0.552, 0.537); g.add(sign);

  /* ========== 6.5 左翼配楼（贴站房左端低裙房：竖条窗 + 平顶女儿墙 + 屋顶设备） ========== */
  bag.box('conc', 0.62, 0.44, 0.58, -0.99, 0.27, 0.55, 0, 0, 0, SC.conc);
  bag.box('dark', 0.64, 0.025, 0.60, -0.99, 0.0625, 0.55);
  bag.box('winWall', 0.60, 0.26, 0.012, -0.99, 0.30, 0.842, 0, 0, 0, SC.win);
  bag.box('winWall', 0.012, 0.26, 0.56, -1.302, 0.30, 0.55, 0, 0, 0, SC.win);
  bag.box('vault', 0.66, 0.022, 0.62, -0.99, 0.501, 0.55, 0, 0, 0, SC.vault);
  bag.box('conc', 0.66, 0.026, 0.014, -0.99, 0.522, 0.853);                             /* 女儿墙 ×4 */
  bag.box('conc', 0.66, 0.026, 0.014, -0.99, 0.522, 0.247);
  bag.box('conc', 0.014, 0.026, 0.62, -1.313, 0.522, 0.55);
  bag.box('conc', 0.014, 0.026, 0.62, -0.667, 0.522, 0.55);
  acUnit(bag, -1.12, 0.53, 0.44); acUnit(bag, -0.88, 0.53, 0.66);
  bag.box('white', 0.15, 0.10, 0.13, -0.75, 0.563, 0.40);                               /* 楼梯间 + 门 + 避雷针 */
  bag.box('dark', 0.09, 0.055, 0.012, -0.75, 0.552, 0.469);
  bag.cyl('steel', 0.004, 0.004, 0.13, -0.75, 0.678, 0.40, 0, 0, 0, 6);
  bag.box('dark', 0.09, 0.16, 0.012, -1.18, 0.23, 0.842);                               /* 翼楼入口 */
  bag.box('white', 0.17, 0.008, 0.06, -1.18, 0.325, 0.86);

  /* ========== 6.6 站台区：站台 + 轨道 ×2 + 低拱雨棚 ×8 节 + 门架 ×2 + 复兴号 ×2 ========== */
  var TK = [0.945, 1.215];                                                              /* 两股道中心 */
  bag.box('conc', 0.22, 0.14, 1.84, 0.67, 0.12, -0.40, 0, 0, 0, SC.conc);               /* 站台 z -1.32..0.52 */
  bag.box('white', 0.22, 0.008, 1.84, 0.67, 0.194, -0.40, 0, 0, 0, SC.pave);
  bag.box('gold', 0.012, 0.004, 1.80, 0.585, 0.198, -0.40);                             /* 黄警戒线 */
  bag.box('trunk', 0.05, 0.014, 0.40, 0.71, 0.211, -0.72);                              /* 站台长椅 ×2 */
  bag.box('trunk', 0.05, 0.014, 0.40, 0.71, 0.211, 0.08);
  bag.box('trunk', 0.04, 0.07, 0.03, 0.71, 0.17, -0.88);
  bag.box('trunk', 0.04, 0.07, 0.03, 0.71, 0.17, 0.24);
  for (i = 0; i < 2; i++) {                                                             /* 轨道 ×2（道砟 + 双轨） */
    bag.box('ballast', 0.17, 0.008, 2.60, TK[i], 0.054, -0.04, 0, 0, 0, SC.ballast);
    bag.box('rail', 0.008, 0.006, 2.56, TK[i] - 0.038, 0.062, -0.04, 0, 0, 0, 6);
    bag.box('rail', 0.008, 0.006, 2.56, TK[i] + 0.038, 0.062, -0.04, 0, 0, 0, 6);
  }
  /* 低拱雨棚：每线 1 条连续长拱（端头 + 中间弧肋 ×4，双柱列 ×5），参考为连续低拱长廊 */
  var R3 = 0.137656, RISE3 = 0.08, A3 = 0.125, Y3 = 0.362344;
  var PHI3 = Math.acos((R3 - RISE3) / R3);
  var B3 = Math.atan2(RISE3, A3);
  var colZ = [-1.17, -0.67, -0.17, 0.33];
  for (i = 0; i < 2; i++) {
    bag.vault('white', R3, 2.00, PI - PHI3, PHI3 * 2, TK[i], Y3, -0.30);
    bag.box('sky', 0.05, 0.010, 1.96, TK[i], Y3 + R3 + 0.002, -0.30);
    var ribZ = [-1.05, -0.55, -0.05, 0.45];
    for (k = 0; k < 4; k++) {
      bag.torus('white', R3 + 0.002, 0.007, TK[i], Y3, ribZ[k], 16, PI - 2 * B3, B3);
    }
    bag.torus('white', R3 + 0.002, 0.009, TK[i], Y3, -1.30, 16, PI - 2 * B3, B3);
    bag.torus('white', R3 + 0.002, 0.009, TK[i], Y3, 0.70, 16, PI - 2 * B3, B3);
    for (k = 0; k < 4; k++) {
      bag.cyl('steel', 0.010, 0.010, 0.37, TK[i] - 0.10, 0.235, colZ[k], 0, 0, 0, 10);
      bag.cyl('steel', 0.010, 0.010, 0.37, TK[i] + 0.10, 0.235, colZ[k], 0, 0, 0, 10);
    }
  }
  /* 接触网门架 ×2（立柱 + 横梁 + 吊索） */
  var gz = [-0.70, 0.05];
  for (i = 0; i < 2; i++) {
    bag.cyl('steel', 0.011, 0.011, 0.50, 0.82, 0.30, gz[i], 0, 0, 0, 10);
    bag.cyl('steel', 0.011, 0.011, 0.50, 1.32, 0.30, gz[i], 0, 0, 0, 10);
    bag.box('steel', 0.52, 0.016, 0.016, 1.07, 0.555, gz[i]);
    bag.box('dark', 0.010, 0.035, 0.010, 0.945, 0.532, gz[i]);
    bag.box('dark', 0.010, 0.035, 0.010, 1.215, 0.532, gz[i]);
  }
  /* 复兴号 ×2（前车头灯独立发光，后车并入静态） */
  fuxing(bag, TK[0], true);
  fuxing(bag, TK[1], false);

  /* ========== 6.7 站前高架落客弯桥：贝塞尔弧线桥 + 栏板 + 墩列 + 下匝道 ========== */
  var P0 = { x: -1.29, z: 0.50 }, P1 = { x: -0.05, z: 1.22 }, P2 = { x: 1.30, z: 0.86 };
  function bzp(t) {
    var u = 1 - t;
    return { x: u * u * P0.x + 2 * u * t * P1.x + t * t * P2.x, z: u * u * P0.z + 2 * u * t * P1.z + t * t * P2.z };
  }
  var DECK = 0.315, DW = 0.17, PW = 0.0725, t, t0, t1, pa, pb, L;
  for (i = 0; i < 8; i++) {                                                             /* 主桥平段 ×8（t 0..0.62） */
    t0 = i / 8 * 0.62; t1 = (i + 1) / 8 * 0.62;
    pa = bzp(t0); pb = bzp(t1); L = Math.hypot(pb.x - pa.x, pb.z - pa.z) + 0.012;
    bag.seg('road', L, 0.03, DW, SC.road, 0, 0, pa, DECK, pb, DECK);
    bag.seg('white', L, 0.045, 0.012, SC.conc, PW, 0.037, pa, DECK, pb, DECK);
    bag.seg('white', L, 0.045, 0.012, SC.conc, -PW, 0.037, pa, DECK, pb, DECK);
    bag.seg('white', 0.08, 0.002, 0.01, SC.conc, 0, 0.016, pa, DECK, pb, DECK);         /* 车道虚线 */
  }
  var T0R = 0.62, T1R = 1.0;
  for (i = 0; i < 4; i++) {                                                             /* 下匝道 ×4（t 0.62..1.0，y 降 0.25） */
    t0 = T0R + (T1R - T0R) * i / 4; t1 = T0R + (T1R - T0R) * (i + 1) / 4;
    pa = bzp(t0); pb = bzp(t1); L = Math.hypot(pb.x - pa.x, pb.z - pa.z) + 0.012;
    var y0 = DECK - (t0 - T0R) / (T1R - T0R) * 0.25, y1 = DECK - (t1 - T0R) / (T1R - T0R) * 0.25;
    bag.seg('road', L, 0.03, DW, SC.road, 0, 0, pa, y0, pb, y1);
    bag.seg('white', L, 0.045, 0.012, SC.conc, PW, 0.037, pa, y0, pb, y1);
    bag.seg('white', L, 0.045, 0.012, SC.conc, -PW, 0.037, pa, y0, pb, y1);
  }
  var pierT = [0.06, 0.20, 0.34, 0.48, 0.62, 0.80];
  for (i = 0; i < 6; i++) {                                                             /* 桥墩 ×6（细长锥柱 + 墩帽） */
    t = pierT[i];
    var pp = bzp(t), py = DECK - (t > T0R ? (t - T0R) / (T1R - T0R) * 0.25 : 0);
    var ph = py - 0.015 - 0.05, dir = bzp(Math.min(t + 0.01, 1));
    bag.cyl('conc', 0.024, 0.032, ph, pp.x, 0.05 + ph / 2, pp.z, 0, 0, 0, 12);
    bag.box('conc', 0.08, 0.018, 0.20, pp.x, py - 0.024, pp.z, 0, -Math.atan2(dir.z - pp.z, dir.x - pp.x), 0, SC.conc);
  }
  (function () {                                                                        /* 桥面车辆 ×2 */
    var v1 = bzp(0.30), v2 = bzp(0.15), d1 = bzp(0.32), d2 = bzp(0.17);
    van(bag, v1.x, DECK + 0.015, v1.z, -Math.atan2(d1.z - v1.z, d1.x - v1.x));
    car(bag, v2.x, DECK + 0.015, v2.z, -Math.atan2(d2.z - v2.z, d2.x - v2.x), 'steel');
  })();

  /* ========== 6.8 合并落地 ========== */
  bag.build(g);

  /* ========== 6.9 发光件（每实例新建）+ 动画 ≤2 项 ========== */
  var glowMat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: texHall(), emissive: C('#ffbe72'), emissiveMap: texHall(),
    emissiveIntensity: 0.5, roughness: 0.6
  });
  var hallGlow = new THREE.Mesh(new THREE.PlaneGeometry(1.60, 0.60), glowMat);
  hallGlow.position.set(HX, 0.46, 0.226); g.add(hallGlow);                              /* 候车厅内景（幕墙之后） */
  (function () {                                                                        /* 雨棚/站台灯带（并 1 mesh） */
    var pos = [], nor = [], uv = [];
    var strips = [
      [1.06, 0.010, 0.40, -0.02, 0.556, 0.27]                                           /* 门廊雨棚灯带 */
    ];
    var lightZ = [-0.92, -0.42, 0.08, 0.56];
    for (var n = 0; n < 2; n++) for (k = 0; k < 4; k++) strips.push([0.16, 0.008, 0.30, TK[n], 0.468, lightZ[k]]);
    for (n = 0; n < strips.length; n++) {
      var gg = new THREE.BoxGeometry(strips[n][0], strips[n][1], strips[n][2]).translate(strips[n][3], strips[n][4], strips[n][5]).toNonIndexed();
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
  /* 前车头灯 ×2（合并，脉冲发光） */
  var headMat = new THREE.MeshStandardMaterial({ color: C('#fff4d8'), emissive: C('#ffedb8'), emissiveIntensity: 0.6, roughness: 0.25 });
  var hlGeo = new THREE.SphereGeometry(0.014, 12, 10);
  var headlamps = new THREE.Mesh(hlGeo, headMat);
  headlamps.position.set(TK[0] - 0.044, 0.152, 0.532);
  g.add(headlamps);
  var headlamps2 = new THREE.Mesh(hlGeo.clone(), headMat);
  headlamps2.position.set(TK[0] + 0.044, 0.152, 0.532);
  g.add(headlamps2);

  g.userData.anim = [
    function (t) {                                                                      /* 1) 暖光呼吸（幅度 ≤0.25） */
      glowMat.emissiveIntensity = 0.5 + 0.18 * Math.sin(t * 1.5 + 0.6);
    },
    function (t) {                                                                      /* 2) 复兴号头灯待发脉冲 */
      headMat.emissiveIntensity = 0.55 + 0.22 * Math.sin(t * 2.0);
    }
  ];
  g.userData.specialId = 15;
  g.userData.parts = { glowMat: glowMat, headMat: headMat, sign: sign };
  return g;
};

})();
