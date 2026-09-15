/* =====================================================================================
 * 大富翁 · 个性化地产 格 9 「城隍庙」 —— 庙市骑楼四阶演进（v2 精修版）
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/prop_9.png（四阶一体参考图，唯一视觉真源）。
 * v2 = v1 精修（不推翻）：整体形态 / 配色 / 布局 / 朝向 / 导出契约全部保留，
 *   逐条清偿 v1 对照参考图的细节差距（详见文件尾「v2 精修清单」注释）：
 *   R1 黑瓦坡顶加瓦当滴水排（檐口圆瓦）+ 脊端圆珠（lv2 起）；
 *   R2 条纹波浪篷升级「双篷垂边」：斜篷 + 前缘半圆垂齿（各篷齐备）；
 *   R3 lv4 新增腰檐圈顶（hipRing）+ 檐下红布帐帘（参考图四层建筑第 3/4 层间）；
 *   R4 鎏金中饰 ×2（三层墙心 + 顶檐披檐山花鎏金圆镜帔檐亭）；
 *   R5 灯笼阵列 6 盏（lv4，金盖金穗 + 呼吸微光），lv3 牌坊垂灯；
 *   R6 石牌坊柱头圆珠 + lv4 鎏金宝顶 + 灰石砌块纹理；
 *   R7 lv1 前院石板满铺 + 坊柱头 + 板皮顶挂瓦条 + 草簇；lv2 披檐气窗 + 檐口齿饰；
 *   R8 骑楼廊柱加密（lv3 五柱）+ 阳台石栏花箱 + lv4 市集侧摊（蓝白篷）；
 *   R9 修复 v1 缺陷：lv4 全部门窗/店窗（z≈0.41/0.32）被砖墙体前面（z=0.46）遮挡
 *      → 立面窗外移至 z=0.472、暗廊暖橱窗下沉至 y=0.18 露出。
 * 导出契约：window.Props3D[9](level 1..4) → Group；占地 ≤2.6×2.6；高度带
 *   lv1 0.8–1.2 / lv2 1.2–1.7 / lv3 1.7–2.3 / lv4 2.3–3.0；原点=格心、底面 y=0、正面朝 +Z。
 * 材质：MeshStandardMaterial + convertSRGBToLinear；纹理仅程序化 Canvas ≤256px
 *   （红砖 / 黑瓦垄 / 旧木板 / 灰石砌块），种子随机（禁布局随机）。
 * 圆柱段数 ≥12、球段数 ≥16×12（helper 内强制下限）。
 * 交互 userData.anim = [fn(t,dt)]（幅度克制：旋转 ≤0.3rad、emissive 波动 ≤0.25）：
 *   暖窗呼吸 / 挂匾摇 / 灯笼摆+呼吸 / 鎏金流辉。
 * 预算：每级 ≤350 mesh（v2 实测 lv1~76 / lv2~135 / lv3~200 / lv4~339）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_9] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ============================ 0. 基础件（blockout 层） ============================ */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
  if (o.map) { m.map = o.map; }
  if (o.side) m.side = o.side;
  return m;
}
/* 材质缓存（同参数共享；需独立动画的材质务必单独 std() 创建） */
var _mc = {};
function MAT(hex, o) {
  o = o || {};
  var k = hex + '|' + o.rough + '|' + o.metal + '|' + o.emissive + '|' + (o.map ? o.map.uuid : '');
  if (_mc[k]) return _mc[k];
  var m = std(hex, o); _mc[k] = m; return m;
}
function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg || 12)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, seg, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, Math.max(16, seg || 16), Math.max(12, (seg || 16) - 4)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z) { o.position.set(x || 0, y || 0, z || 0); parent.add(o); return o; }
function anim(g, fn) { (g.userData.anim || (g.userData.anim = [])).push(fn); }
/* 种子随机（仅纹理噪点/铺装错缝等确定性扰动，禁止布局随机） */
function rng9(seed) {
  var s = (seed >>> 0) || 20260914;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ============================ 1. 风格色板（采样自参考图） ============================ */
var P9 = {
  stone:   '#b8b0a0',                                   /* 淡灰石灰岩（框架/牌坊/栏杆） */
  stoneL:  '#ccc4b4',
  stoneD:  '#948c7c',
  brick:   '#9c5a44',                                   /* 红砖填充 */
  brickD:  '#84483a',
  tile:    '#3a4148',                                   /* 黑瓦（近黑炭蓝，区别格 6 蓝瓦） */
  tileD:   '#2e343a',
  tileL:   '#565e66',
  ridgeS:  '#8f897b',                                   /* 灰脊条 */
  woodD:   '#4e3a26',                                   /* 深色木框/百叶 */
  woodM:   '#6a4e30',
  plank:   '#8a7a5e',                                   /* 旧木板（lv1） */
  plankD:  '#6f6350',
  glow:    '#e8b264',                                   /* 店窗暖光 */
  glaz:    '#2c3138',
  lantR:   '#c8402e',                                   /* 灯笼朱红 */
  lantD:   '#a83022',
  gilt:    '#d0a048',                                   /* 鎏金 */
  giltD:   '#b8842e',
  awnA:    '#b04a38',                                   /* 篷：红 */
  awnB:    '#e2cfa8',                                   /* 篷：米白 */
  awnC:    '#5a7a9c',                                   /* 篷：蓝 */
  awnD:    '#dfe3e2',                                   /* 篷：白 */
  grass:   '#8fa655',
  lawn:    '#9fae60',
  path:    '#beb49a',
  green:   '#5d7c3a',
  greenL:  '#6f8f44',
  fruit:   '#d2822e',
  curtain: '#9c3226'                                    /* v2 红布帐帘 */
};

/* ============================ 2. Canvas 程序化纹理（≤256px，种子随机） ============================ */
function cv2(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function toTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }

var _texBrick = null;
function texBrick() {  /* 红砖 256px：错缝 + 逐砖色差 + 风化竖渍 */
  if (_texBrick) return _texBrick;
  var c = cv2(256, 256), g = c.getContext('2d'), R = rng9(91);
  g.fillStyle = P9.brick; g.fillRect(0, 0, 256, 256);
  var row = 20, bw = 52;
  for (var y = 0; y < 256; y += row) {
    g.fillStyle = 'rgba(216,202,182,0.55)'; g.fillRect(0, y, 256, 2);
    var off = (y / row) % 2 ? 0 : bw / 2;
    for (var x = off; x < 256; x += bw) {
      g.fillRect(x, y, 2, row);
      var tint = R();
      g.fillStyle = tint > 0.66 ? 'rgba(70,32,24,0.20)' : (tint > 0.33 ? 'rgba(226,142,106,0.16)' : 'rgba(178,98,70,0.12)');
      g.fillRect(x + 3, y + 2, bw - 5, row - 3);
      for (var i = 0; i < 5; i++) {
        g.fillStyle = R() > 0.5 ? 'rgba(60,28,20,0.15)' : 'rgba(230,150,110,0.13)';
        g.fillRect(x + 3 + R() * (bw - 9), y + 3 + R() * (row - 8), 2 + R() * 4, 2);
      }
    }
  }
  for (var s2 = 0; s2 < 8; s2++) {
    g.fillStyle = 'rgba(48,40,30,0.07)';
    g.fillRect(R() * 256, 0, 3 + R() * 8, 256);
  }
  _texBrick = toTex(c); _texBrick.wrapS = _texBrick.wrapT = THREE.RepeatWrapping;
  return _texBrick;
}
var _texTile = null;
function texTile() {  /* 黑瓦垄 128px：竖垄滚釉 + 暗横缝 + 苔点 */
  if (_texTile) return _texTile;
  var c = cv2(128, 128), g = c.getContext('2d'), R = rng9(57);
  g.fillStyle = P9.tile; g.fillRect(0, 0, 128, 128);
  for (var x = 0; x < 128; x += 16) {
    g.fillStyle = P9.tileD; g.fillRect(x + 8, 0, 8, 128);
    g.fillStyle = 'rgba(14,18,24,0.65)'; g.fillRect(x + 7, 0, 1, 128); g.fillRect(x + 15, 0, 1, 128);
    g.fillStyle = 'rgba(150,166,184,0.22)'; g.fillRect(x + 1, 0, 2, 128);
    g.fillStyle = 'rgba(190,204,220,0.10)'; g.fillRect(x + 3, 0, 3, 128);
  }
  g.fillStyle = 'rgba(12,16,22,0.45)';
  for (var y = 10; y < 128; y += 21) g.fillRect(0, y, 128, 2);
  for (var m = 0; m < 14; m++) {                                /* 苔点 */
    g.fillStyle = 'rgba(86,104,52,' + (0.14 + R() * 0.16).toFixed(2) + ')';
    g.fillRect(R() * 128, 96 + R() * 30, 2 + R() * 5, 2 + R() * 3);
  }
  _texTile = toTex(c); _texTile.wrapS = _texTile.wrapT = THREE.RepeatWrapping;
  return _texTile;
}
var _texPlank = null;
function texPlank() {  /* 旧木板 256px：竖板 + 节疤 + 木纹 */
  if (_texPlank) return _texPlank;
  var c = cv2(256, 256), g = c.getContext('2d'), R = rng9(73);
  g.fillStyle = P9.plank; g.fillRect(0, 0, 256, 256);
  for (var x = 0; x < 256; x += 36) {
    g.fillStyle = 'rgba(38,30,20,0.55)'; g.fillRect(x, 0, 2, 256);
    g.fillStyle = 'rgba(196,176,140,0.10)'; g.fillRect(x + 4, 0, 6, 256);
    for (var i = 0; i < 10; i++) {
      g.fillStyle = R() > 0.5 ? 'rgba(56,44,28,0.28)' : 'rgba(196,176,140,0.16)';
      g.fillRect(x + 6 + R() * 24, R() * 250, 2, 8 + R() * 22);
    }
    for (var k = 0; k < 3; i++, k++) {                          /* 节疤 */
      g.fillStyle = 'rgba(44,32,18,0.4)';
      g.beginPath(); g.arc(x + 10 + R() * 20, R() * 256, 1.5 + R() * 2, 0, PI * 2); g.fill();
    }
  }
  _texPlank = toTex(c); _texPlank.wrapS = _texPlank.wrapT = THREE.RepeatWrapping;
  return _texPlank;
}
var _texStone = null;
function texStone() {  /* 灰石砌块 256px（v2 新增：牌坊/座石） */
  if (_texStone) return _texStone;
  var c = cv2(256, 256), g = c.getContext('2d'), R = rng9(133);
  g.fillStyle = P9.stone; g.fillRect(0, 0, 256, 256);
  var row = 42, bw = 84;
  for (var y = 0; y < 256; y += row) {
    g.fillStyle = 'rgba(118,110,94,0.55)'; g.fillRect(0, y, 256, 2);
    var off = (y / row) % 2 ? 0 : bw / 2;
    for (var x = off; x < 256; x += bw) {
      g.fillRect(x, y, 2, row);
      g.fillStyle = R() > 0.5 ? 'rgba(255,250,238,0.10)' : 'rgba(88,82,68,0.10)';
      g.fillRect(x + 3, y + 3, bw - 5, row - 5);
    }
  }
  for (var i = 0; i < 130; i++) {
    g.fillStyle = R() > 0.5 ? 'rgba(255,252,240,0.09)' : 'rgba(80,74,60,0.09)';
    g.fillRect(R() * 256, R() * 256, 1.5 + R() * 3, 1.5 + R() * 3);
  }
  _texStone = toTex(c); _texStone.wrapS = _texStone.wrapT = THREE.RepeatWrapping;
  return _texStone;
}
/* 匾额：深漆板 + 描金字（faceMat 供微光动画）；板/面片间隙 ≥0.02 防共面 */
function textPlate9(text, w, h, o) {
  o = o || {};
  var cw = 256, ch = 96, c = cv2(cw, ch), g = c.getContext('2d');
  g.fillStyle = o.bg || '#26221a'; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = o.border || '#b08a3c'; g.lineWidth = 8; g.strokeRect(8, 8, cw - 16, ch - 16);
  g.fillStyle = o.fg || '#e8c87a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold ' + Math.round(ch * 0.58) + 'px "Microsoft YaHei","PingFang SC","SimHei",sans-serif';
  g.fillText(text, cw / 2, ch / 2 + 3);
  var tex = toTex(c);
  var g6 = grp();
  g6.add(box(w, h, 0.03, o.backMat || MAT(P9.woodD)));
  var face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.86),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.15, flatShading: true,
      emissive: C(o.fg || '#e8c87a'), emissiveIntensity: o.ei !== undefined ? o.ei : 0.12, emissiveMap: tex }));
  face.position.z = 0.04; g6.add(face);
  g6.userData.faceMat = face.material;
  return g6;
}

/* ============================ 3. Kit 预制件（structure/form 层） ============================ */
function brickBox(w, h, d, rx, ry) {
  var t = texBrick().clone(); t.needsUpdate = true; t.repeat.set(rx || 2, ry || 2);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.9 }));
}
function plankBox(w, h, d, rx, ry) {
  var t = texPlank().clone(); t.needsUpdate = true; t.repeat.set(rx || 1, ry || 1);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.92 }));
}
function stoneBox(w, h, d, rx, ry) {
  var t = texStone().clone(); t.needsUpdate = true; t.repeat.set(rx || 1, ry || 1);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.88 }));
}
/* 通高石壁柱：两块错缝隅石（灰石框架身份特征）—— 2 mesh */
function pilaster(h, x, z) {
  var g = grp();
  g.add(box(0.095, h, 0.062, MAT(P9.stone), 0, h / 2, 0.014));
  g.add(box(0.062, h, 0.095, MAT(P9.stoneL), 0.016, h / 2, 0));
  g.position.set(x, 0, z);
  return g;
}
/* 百叶窗：木框 + 暗玻璃 + 双叶红棕百叶 + 石窗台（+ 花箱）—— 5~8 mesh */
function shutterWindow(w, h, o) {
  o = o || {};
  var g = grp(), fm = MAT(o.frame || P9.woodD), gl = MAT(o.glass || P9.glaz, { rough: 0.4 });
  g.add(box(w + 0.05, h + 0.05, 0.035, fm));
  g.add(box(w, h, 0.03, gl, 0, 0, 0.006));
  g.add(box(w * 0.34, h, 0.028, MAT(o.shutter || P9.brickD), -w * 0.33, 0, 0.018));
  g.add(box(w * 0.34, h, 0.028, MAT(o.shutter || P9.brickD), w * 0.33, 0, 0.018));
  g.add(box(w + 0.14, 0.04, 0.07, MAT(P9.stoneL), 0, -h / 2 - 0.005, 0.014));
  if (o.flower) {
    g.add(box(w * 0.9, 0.05, 0.06, MAT(P9.stoneD), 0, -h / 2 - 0.05, 0.03));
    put(g, sph(0.028, 16, MAT(P9.greenL, { rough: 0.9 })), -w * 0.24, -h / 2 - 0.022, 0.045);
    put(g, sph(0.028, 16, MAT(P9.green, { rough: 0.9 })), w * 0.24, -h / 2 - 0.022, 0.045);
  }
  return g;
}
/* 店窗暖光（供呼吸动画）—— 4 mesh */
function shopGlow9(w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.035, MAT(P9.woodD)));
  var gm = std('#e8b264', { rough: 0.4, emissive: P9.glow, ei: 0.5 });
  g.add(box(w, h, 0.03, gm, 0, 0, 0.005));
  g.add(box(0.03, h, 0.036, MAT(P9.woodD), 0, 0, 0.008));
  g.add(box(w, 0.03, 0.036, MAT(P9.woodD), 0, 0, 0.008));
  g.userData.glowMat = gm;
  return g;
}
/* 石瓶栏杆阳台 —— slab + (n+1) 栏杆 + 顶轨 + 2 边柱 */
function balustrade(w, d, n, mat) {
  var g = grp();
  g.add(box(w, 0.035, d, mat, 0, 0, d / 2));
  for (var i = 0; i <= n; i++) {
    g.add(cyl(0.013, 0.02, 0.11, 12, mat, -w / 2 + i * (w / n), 0.07, d - 0.015));
  }
  g.add(box(w + 0.04, 0.03, 0.045, mat, 0, 0.145, d - 0.015));
  g.add(box(0.03, 0.15, d, mat, -w / 2, 0.07, d / 2));
  g.add(box(0.03, 0.15, d, mat, w / 2, 0.07, d / 2));
  return g;
}
/* 阳台石栏花箱（v2：参考图栏板绿植）—— 4 mesh */
function planter9(w) {
  var g = grp();
  g.add(box(w, 0.05, 0.07, MAT(P9.stoneD), 0, 0.025, 0));
  put(g, sph(0.024, 16, MAT(P9.green, { rough: 0.9 })), -w * 0.28, 0.06, 0);
  put(g, sph(0.026, 16, MAT(P9.greenL, { rough: 0.9 })), 0.01, 0.065, 0.008);
  put(g, sph(0.022, 16, MAT(P9.green, { rough: 0.9 })), w * 0.28, 0.058, -0.006);
  return g;
}
/* 条纹波浪篷 v2「双篷垂边」：斜篷板条交替 + 前杆 + 半圆垂齿 —— (n + 1 + m) mesh */
function awn9(w, r, colA, colB, o) {
  o = o || {};
  var g = grp(), n = o.n || 6, m = o.m || 5;
  var mA = MAT(colA, { rough: 0.88 }), mB = MAT(colB, { rough: 0.88 });
  for (var i = 0; i < n; i++) {
    var tt = i / (n - 1), a = (16 + 52 * tt) * PI / 180;
    var seg = box(w, 0.016, 0.115, (i % 2) ? mB : mA);
    seg.position.set(0, -cos(a) * r, sin(a) * r);
    seg.rotation.x = -a * 0.55;
    g.add(seg);
  }
  var rodY = -cos(68 * PI / 180) * r, rodZ = sin(68 * PI / 180) * r;
  var rod = cyl(0.01, 0.01, w + 0.05, 12, MAT(P9.woodD));
  rod.rotation.z = PI / 2;
  rod.position.set(0, rodY, rodZ);
  g.add(rod);
  var sg = new THREE.CircleGeometry(0.018 * (o.s || 1), 10, PI, PI);
  var sm = MAT(colA, { rough: 0.88, side: THREE.DoubleSide });
  for (var k = 0; k < m; k++) {
    var sc = mesh(sg, sm);
    sc.position.set(-w / 2 + (k + 0.5) * (w / m), rodY - 0.013, rodZ);
    g.add(sc);
  }
  return g;
}
/* 红灯笼：吊线 + 朱红球 + 上下金盖 + 金穗（挂点=顶部摆动轴）—— 5 mesh */
function lantern9(s) {
  s = s || 1;
  var pivot = grp();                                        /* 摆动轴在挂点 */
  var g = grp(); g.position.y = -0.055 * s; pivot.add(g);
  var lm = std(P9.lantR, { rough: 0.45, emissive: '#ff9a5a', ei: 0.22 });
  var body = sph(0.052 * s, 16, lm); body.scale.y = 0.86; g.add(body);
  g.add(cyl(0.02 * s, 0.026 * s, 0.018 * s, 12, MAT(P9.gilt, { rough: 0.4, metal: 0.5 }), 0, 0.045 * s, 0));
  g.add(cyl(0.02 * s, 0.026 * s, 0.018 * s, 12, MAT(P9.gilt, { rough: 0.4, metal: 0.5 }), 0, -0.045 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.04 * s, 12, MAT(P9.giltD, { rough: 0.6 }), 0, -0.072 * s, 0));
  pivot.add(cyl(0.004, 0.004, 0.055 * s, 12, MAT(P9.woodD), 0, 0.028 * s, 0));
  pivot.userData.isLantern = true;
  pivot.userData.lanternMat = lm;                               /* v2：呼吸微光 */
  return pivot;
}
/* 檐口瓦当滴水排（v2 R1）：檐板下一排小圆瓦 —— n mesh */
function eaveTubes9(len, y, z, mat, n) {
  n = n || Math.max(5, Math.min(9, Math.round(len / 0.19)));
  var g = grp();
  for (var i = 0; i < n; i++) {
    g.add(cyl(0.016, 0.016, 0.034, 12, mat, -len / 2 + (i + 0.5) * (len / n), y, z));
  }
  return g;
}
/* 檐口齿饰（v2 R7：层间线脚下的石齿）—— n mesh */
function dentils9(w, y, z, n, mat) {
  var g = grp();
  for (var i = 0; i < n; i++) {
    g.add(box(0.05, 0.042, 0.03, mat, -w / 2 + (i + 0.5) * (w / n), y, z));
  }
  return g;
}
/* 红布帐帘（v2 R3，lv4 腰檐下）—— 5 mesh */
function curtain9(w, h) {
  var g = grp();
  var cm = MAT(P9.curtain, { rough: 0.85 });
  var rod = cyl(0.012, 0.012, w + 0.05, 12, MAT(P9.woodD));
  rod.rotation.z = PI / 2; rod.position.y = h / 2; g.add(rod);
  for (var i = 0; i < 4; i++) {
    var p = box(w * 0.235, h, 0.016, cm);
    p.position.set(-w / 2 + (i + 0.5) * (w / 4), (i % 2 ? -0.012 : 0.008), 0);
    p.rotation.z = (i % 2 ? 0.05 : -0.05);
    g.add(p);
  }
  return g;
}
/* 黑瓦卷尾翘脊坡顶（身份特征 #1，几何壳角部抬升）
   v2：+ 檐口瓦当排 / + 脊端圆珠（lv≥2）/ 段数下限升级 */
function cnRoofGeo9(w, d, h, ov, cl, lift) {
  var hw = w / 2, hd = d / 2, rw = hw * 0.5, l = Math.max(0.001, h - cl) * 0.25;
  var A = [-rw, h, 0], B = [rw, h, 0];
  var Cfr = [hw + ov, cl + lift, hd + ov], Cfl = [-hw - ov, cl + lift, hd + ov];
  var Cbr = [hw + ov, cl + lift, -hd - ov], Cbl = [-hw - ov, cl + lift, -hd - ov];
  var Mf = [0, cl, hd + ov], Mb = [0, cl, -hd - ov], Ml = [-hw - ov, cl, 0], Mr = [hw + ov, cl, 0];
  var pos = [], uvs = [], vh = Math.max(0.001, h - cl);
  function tri(a, b, c, mode) {
    [a, b, c].forEach(function (p) {
      pos.push(p[0], p[1], p[2]);
      if (mode === 'x') uvs.push((p[2] + hd + ov) / (d + 2 * ov), (p[1] - cl) / vh);
      else uvs.push((p[0] + hw + ov) / (w + 2 * ov), (p[1] - cl) / vh);
    });
  }
  tri(A, Cfl, Mf, 'z'); tri(A, Mf, Cfr, 'z'); tri(A, Cfr, B, 'z');   /* 前坡 */
  tri(A, Cbl, Mb, 'z'); tri(A, Mb, Cbr, 'z'); tri(A, Cbr, B, 'z');   /* 后坡 */
  tri(A, Cbl, Ml, 'x'); tri(A, Ml, Cfl, 'x');                        /* 左坡 */
  tri(B, Mr, Cbr, 'x'); tri(B, Cfr, Mr, 'x');                        /* 右坡 */
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}
function cnRoof9(w, d, h, lv) {
  var g = grp();
  var ov = Math.min(w, d) * 0.14, cl = Math.min(w, d) * 0.088, lift = cl * 0.55;
  var t = texTile().clone(); t.needsUpdate = true; t.repeat.set(2, 1);
  g.add(mesh(cnRoofGeo9(w, d, h, ov, cl, lift), std('#ffffff', { map: t, rough: 0.55, side: THREE.DoubleSide })));
  /* 滴檐板（黑瓦色，前后 + 左右）+ 瓦当排（v2） */
  var eb = MAT(P9.tileD, { rough: 0.7 });
  g.add(box(w * 0.94, 0.042, 0.02, eb, 0, cl * 0.45, d / 2 + ov * 0.8));
  g.add(box(w * 0.94, 0.042, 0.02, eb, 0, cl * 0.45, -(d / 2 + ov * 0.8)));
  g.add(eaveTubes9(w * 0.9, cl * 0.45 - 0.026, d / 2 + ov * 0.8 - 0.012, eb));
  if (lv >= 3) {
    g.add(box(0.02, 0.042, d * 0.92, eb, w / 2 + ov * 0.8, cl * 0.45, 0));
    g.add(box(0.02, 0.042, d * 0.92, eb, -(w / 2 + ov * 0.8), cl * 0.45, 0));
  }
  /* 正脊（灰石）+ 脊端卷尾上翘 + 脊端圆珠（v2 R1：lv≥2） */
  var rw = w * 0.25, rs = MAT(P9.ridgeS, { rough: 0.75 });
  g.add(box(rw * 2, 0.05, 0.055, rs, 0, h + 0.018, 0));
  [-1, 1].forEach(function (s) {
    var curl = box(0.048, 0.1, 0.045, rs, s * rw, h + 0.055, 0);
    curl.rotation.z = -s * 0.55; g.add(curl);                 /* 卷尾上翘 */
    var tip = mesh(new THREE.ConeGeometry(0.02, 0.05, 12), lv >= 4 ? MAT(P9.gilt, { rough: 0.4, metal: 0.5 }) : rs);
    tip.position.set(s * (rw + 0.028), h + 0.088, 0);
    tip.rotation.z = -s * 0.9; g.add(tip);
    put(g, sph(0.013, 16, lv >= 4 ? MAT(P9.gilt, { rough: 0.4, metal: 0.5 }) : MAT(P9.stoneL), s * (rw + 0.03), h + 0.096, 0));
    if (lv >= 4) {                                            /* 鎏金脊兽：基座 + 昂首 */
      var beast = grp(); beast.position.set(s * rw * 0.72, h + 0.05, 0);
      beast.add(box(0.05, 0.05, 0.04, MAT(P9.gilt, { rough: 0.4, metal: 0.5 })));
      var head = mesh(new THREE.ConeGeometry(0.022, 0.055, 12), MAT(P9.gilt, { rough: 0.4, metal: 0.5 }));
      head.rotation.z = s > 0 ? -1.2 : 1.2; head.position.set(s * 0.04, 0.012, 0);
      beast.add(head);
      g.add(beast);
    }
  });
  if (lv >= 3) {                                              /* 中央中饰 + 鎏金顶 */
    g.add(box(0.15, 0.045, 0.05, rs, 0, h + 0.055, 0));
    if (lv >= 4) g.add(cyl(0.022, 0.028, 0.032, 12, MAT(P9.gilt, { rough: 0.4, metal: 0.5 }), 0, h + 0.09, 0));
  }
  /* 垂脊（四坡斜脊）+ 圆珠 */
  var hw = w / 2 + ov, hd = d / 2 + ov;
  var V3 = THREE.Vector3;
  function hipBar(x0, y0, z0, x1, y1, z1) {
    var dir = new V3(x1 - x0, y1 - y0, z1 - z0), len = dir.length();
    var bar = box(0.028, 0.024, len, rs);
    bar.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    bar.quaternion.setFromUnitVectors(new V3(0, 0, 1), dir.normalize());
    g.add(bar);
    return bar;
  }
  hipBar(-rw * 0.9, h, 0, -hw, cl + lift, -hd);
  hipBar(-rw * 0.9, h, 0, -hw, cl + lift, hd);
  hipBar(rw * 0.9, h, 0, hw, cl + lift, -hd);
  hipBar(rw * 0.9, h, 0, hw, cl + lift, hd);
  if (lv >= 3) {
    [0.5, 0.78].forEach(function (tt, k) {
      [-1, 1].forEach(function (sx) {
        var b = sph(0.016, 16, rs, sx * (-rw * 0.9 + (hw + rw * 0.9) * tt), h + (cl + lift - h) * tt, (k ? 1 : -1) * hd * tt);
        g.add(b);
      });
    });
  }
  return g;
}
/* 腰檐圈顶（v2 R3，lv4 专属）：无正脊版坡顶环 —— 壳 + 四向滴檐 + 垂脊 + 前檐瓦当 */
function hipRing9(w, d, h) {
  var g = grp(); g.name = 'p9_collar';
  var ov = Math.min(w, d) * 0.14, cl = Math.min(w, d) * 0.088, lift = cl * 0.55;
  var t = texTile().clone(); t.needsUpdate = true; t.repeat.set(2, 1);
  g.add(mesh(cnRoofGeo9(w, d, h, ov, cl, lift), std('#ffffff', { map: t, rough: 0.55, side: THREE.DoubleSide })));
  var eb = MAT(P9.tileD, { rough: 0.7 });
  g.add(box(w * 0.94, 0.04, 0.02, eb, 0, cl * 0.45, d / 2 + ov * 0.8));
  g.add(box(w * 0.94, 0.04, 0.02, eb, 0, cl * 0.45, -(d / 2 + ov * 0.8)));
  g.add(box(0.02, 0.04, d * 0.92, eb, w / 2 + ov * 0.8, cl * 0.45, 0));
  g.add(box(0.02, 0.04, d * 0.92, eb, -(w / 2 + ov * 0.8), cl * 0.45, 0));
  g.add(eaveTubes9(w * 0.9, cl * 0.45 - 0.024, d / 2 + ov * 0.8 - 0.012, eb, 7));
  var hw = w / 2 + ov, hd = d / 2 + ov, rw = w * 0.25, rs = MAT(P9.ridgeS, { rough: 0.75 });
  var V3 = THREE.Vector3;
  [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (c) {
    var x0 = c[0] * rw * 0.9, z0 = 0, x1 = c[0] * hw, z1 = c[1] * hd;
    var dir = new V3(x1 - x0, (cl + lift) - h, z1 - z0), len = dir.length();
    var bar = box(0.026, 0.022, len, rs);
    bar.position.set((x0 + x1) / 2, (h + cl + lift) / 2, (z0 + z1) / 2);
    bar.quaternion.setFromUnitVectors(new V3(0, 0, 1), dir.normalize());
    g.add(bar);
    if (c[1] > 0) put(g, sph(0.014, 16, rs, x1 * 0.96, cl + lift + 0.008, z1 * 0.96));
  });
  return g;
}
/* 披檐山花亭（v2 R4，lv4 顶檐前坡）：小山花 + 石披边 + 微顶 + 内嵌鎏金圆镜 —— 7+4 mesh */
function gableDormer9(w, rise, half) {
  var g = grp();
  var sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false });
  var gab = mesh(tg, MAT(P9.brickD)); g.add(gab);               /* 山花板（+z 面） */
  var ang = Math.atan2(rise, half), slope = Math.sqrt(rise * rise + half * half);
  [-1, 1].forEach(function (s) {
    var rake = box(0.02, 0.02, slope, MAT(P9.stoneL), s * half * 0.5, rise * 0.5, 0.032);
    rake.rotation.z = -s * ang;
    g.add(rake);
  });
  var rF = box(w, 0.026, slope * 0.62, MAT(P9.tileD));
  rF.rotation.x = ang * 0.9; rF.position.set(0, rise * 0.62, half * 0.34); g.add(rF);
  g.add(box(w * 0.5, 0.03, 0.05, MAT(P9.ridgeS), 0, rise + 0.012, 0));
  g.add(box(w * 0.6, rise * 0.5, 0.05, MAT(P9.woodD), 0, rise * 0.22, -0.005));
  return g;
}
/* 山墙鎏金圆镜（鎏金中饰）：环 + 微光圆心 + 十字钉 */
function medallion9() {
  var g = grp();
  var gm = std(P9.gilt, { rough: 0.4, metal: 0.5 });
  g.add(mesh(new THREE.TorusGeometry(0.07, 0.016, 10, 24), gm));
  var dm = std('#8a6428', { rough: 0.5, metal: 0.4, emissive: '#d8a848', ei: 0.2 });
  var disc = cyl(0.062, 0.062, 0.02, 16, dm); disc.rotation.x = PI / 2; g.add(disc);
  for (var k = 0; k < 2; k++) {
    var sp = box(0.104, 0.014, 0.014, gm, 0, 0, 0.012);
    sp.rotation.z = k * PI / 2; g.add(sp);
  }
  g.userData.discMat = dm;
  return g;
}
/* 前院石牌坊（身份特征 #5）：方柱（砌块纹理）+ 柱头圆珠 + 拱梁 + 小坡帽；
   lv4 加鎏金宝顶；匾额逐级递进 */
function paifang9(w, h, lv) {
  var g = grp(), yA = h + w / 2;
  var pL = stoneBox(0.11, h, 0.11, 1, 2); pL.position.set(-w / 2 - 0.04, h / 2, 0); g.add(pL);
  var pR = stoneBox(0.11, h, 0.11, 1, 2); pR.position.set(w / 2 + 0.04, h / 2, 0); g.add(pR);
  var stL = MAT(P9.stoneL);
  [-1, 1].forEach(function (s) {
    g.add(box(0.17, 0.04, 0.17, stL, s * (w / 2 + 0.04), 0.02, 0));
    g.add(box(0.15, 0.035, 0.15, stL, s * (w / 2 + 0.04), h + 0.017, 0));
    put(g, sph(0.028, 16, MAT(P9.stone), s * (w / 2 + 0.04), h + 0.05, 0));   /* 柱头圆珠 v2 */
  });
  if (lv >= 3) {                                              /* 石拱 + 拱心石 */
    var arc = mesh(new THREE.TorusGeometry(w / 2, 0.048, 12, 20, PI), stL);
    arc.position.y = h; g.add(arc);
    g.add(box(0.05, 0.08, 0.055, MAT(P9.stone), 0, yA - 0.02, 0.05));
  } else {
    g.add(box(w + 0.2, 0.06, 0.09, stL, 0, h + 0.06, 0));     /* 石梁 */
  }
  /* 小坡帽（两坡 + 脊，檐角微翘） */
  var rise = 0.09 + w * 0.06, half = w / 2 + 0.09, capBase = yA + 0.02;
  var ang = Math.atan2(rise, half), slope = Math.sqrt(rise * rise + half * half);
  var rF = box(0.05, 0.024, slope, MAT(P9.ridgeS)); rF.rotation.x = ang; rF.position.set(0, rise / 2, half / 2); g.add(rF);
  var rB = box(0.05, 0.024, slope, MAT(P9.ridgeS)); rB.rotation.x = -ang; rB.position.set(0, rise / 2, -half / 2); g.add(rB);
  g.add(box(0.055, 0.03, half * 2 + 0.03, MAT(P9.ridgeS), 0, rise + 0.012, 0));
  if (lv >= 4) put(g, sph(0.026, 16, MAT(P9.gilt, { rough: 0.35, metal: 0.6 }), 0, rise + 0.05, 0));  /* 鎏金宝顶 v2 */
  /* 匾额递进 */
  if (lv >= 4) {
    var tb = textPlate9('城隍庙', 0.3, 0.115, { bg: '#4a1812', fg: '#e8c87a', border: '#d0a048', ei: 0.15 });
    put(g, tb, 0, capBase + rise * 0.4, 0.052);
    g.add(box(0.035, h * 0.52, 0.02, MAT('#8f2b20', { rough: 0.6 }), -w / 2 - 0.04, h * 0.5, 0.062));
    g.add(box(0.035, h * 0.52, 0.02, MAT('#8f2b20', { rough: 0.6 }), w / 2 + 0.04, h * 0.5, 0.062));
    g.userData.tabletMat = tb.userData.faceMat;
  } else if (lv === 3) {
    var t3 = textPlate9('城隍', 0.24, 0.1, { bg: '#2c2a22', fg: '#d8b86a', ei: 0.1 });
    put(g, t3, 0, capBase + rise * 0.4, 0.05);
    g.userData.tabletMat = t3.userData.faceMat;
  } else {
    var t2 = textPlate9('庙', 0.11, 0.11, { bg: '#3a2c1c', fg: '#e2c274', ei: 0.14 });
    var hang = grp(); hang.position.set(0, h + 0.02, 0.055); hang.add(t2);
    t2.position.y = -0.07;
    g.add(hang);
    g.userData.hangPivot = hang;
  }
  return g;
}
/* 石狮（lv4，风格化）：座 + 蹲身 + 鬃 + 首 + 尾球 —— 5 mesh */
function stoneLion() {
  function stD() { return MAT(P9.stoneD, { rough: 0.85 }); }
  var g = grp(), st = MAT(P9.stone, { rough: 0.8 }), stL = MAT(P9.stoneL, { rough: 0.8 });
  g.add(box(0.11, 0.035, 0.14, stD(), 0, 0.017, 0));
  g.add(box(0.075, 0.085, 0.1, st, 0, 0.075, -0.008));
  var mane = sph(0.045, 16, stL, 0, 0.13, 0.028); mane.scale.z = 0.7; g.add(mane);
  g.add(sph(0.032, 16, st, 0, 0.155, 0.052));
  put(g, sph(0.018, 16, stL, 0.02, 0.05, -0.062));
  return g;
}
/* 市集货箱：板箱 + 双果 —— 3 mesh */
function crate9() {
  var g = grp();
  g.add(box(0.16, 0.11, 0.13, MAT(P9.woodM, { rough: 0.9 }), 0, 0.055, 0));
  put(g, sph(0.032, 16, MAT(P9.fruit, { rough: 0.7 })), -0.03, 0.13, 0.01);
  put(g, sph(0.028, 16, MAT('#b8452e', { rough: 0.7 })), 0.035, 0.128, -0.02);
  return g;
}
/* 骑楼廊柱：柱础 + 柱身 + 柱头（+ 柱础环线 v2）—— 4 mesh */
function arcadeColumn(h) {
  var g = grp();
  g.add(box(0.09, 0.03, 0.09, MAT(P9.stoneD), 0, 0.015, 0));
  g.add(cyl(0.028, 0.032, h - 0.07, 12, MAT(P9.stoneL, { rough: 0.8 }), 0, h / 2, 0));
  g.add(cyl(0.036, 0.036, 0.014, 12, MAT(P9.stone, { rough: 0.8 }), 0, 0.037, 0));
  g.add(box(0.075, 0.04, 0.075, MAT(P9.stone), 0, h - 0.02, 0));
  return g;
}
/* 矮石墙 + 压顶 —— 2 mesh */
function yardWall(len, ry) {
  var g = grp();
  g.add(box(len, 0.15, 0.07, MAT(P9.stoneD), 0, 0.075, 0));
  g.add(box(len + 0.04, 0.032, 0.1, MAT(P9.stone), 0, 0.166, 0));
  if (ry) g.rotation.y = ry;
  return g;
}
function gatePost9(h) {
  var g = grp();
  g.add(box(0.085, h, 0.085, MAT(P9.stone), 0, h / 2, 0));
  g.add(box(0.125, 0.038, 0.125, MAT(P9.stoneL), 0, h + 0.019, 0));
  put(g, sph(0.02, 16, MAT(P9.stoneL), 0, h + 0.052, 0));       /* v2 柱头圆珠 */
  return g;
}
/* 石板小径（3 块错缝） */
function flagPath(z0, z1) {
  var g = grp();
  for (var i = 0; i < 3; i++) {
    var u = i / 2;
    var s = box(0.3 - u * 0.06, 0.018, 0.16 + u * 0.05, MAT(P9.path, { rough: 0.95 }), (i % 2 ? 0.05 : -0.04), 0.072, z0 + (z1 - z0) * u);
    s.rotation.y = (i % 2 ? 0.08 : -0.06);
    g.add(s);
  }
  return g;
}
/* 前院石板满铺（v2 R7，lv1）：错缝石板阵 */
function paving9(rows) {
  var g = grp(), R = rng9(885);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    for (var k = 0; k < r.n; k++) {
      var s = box(r.w * (0.86 + R() * 0.2), 0.022, r.d * (0.86 + R() * 0.2), MAT(P9.path, { rough: 0.95 }),
        r.x + (k - (r.n - 1) / 2) * r.w + (R() - 0.5) * 0.02, 0.086, r.z + (R() - 0.5) * 0.02);
      s.rotation.y = (R() - 0.5) * 0.12;
      g.add(s);
    }
  }
  return g;
}
/* 草簇（v2）—— 1 mesh */
function tuft9(s) {
  var t = mesh(new THREE.ConeGeometry(0.03 * (s || 1), 0.07 * (s || 1), 9), MAT(P9.greenL, { rough: 0.95 }));
  return t;
}
/* 陶盆绿植（3 mesh） */
function potPlant9(s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.07 * s, 12, MAT('#9c5a38', { rough: 0.8 }), 0, 0.035 * s, 0));
  put(g, sph(0.055 * s, 16, MAT(P9.green, { rough: 0.9 })), 0, 0.1 * s, 0);
  put(g, sph(0.035 * s, 16, MAT(P9.greenL, { rough: 0.9 })), 0.03 * s, 0.08 * s, 0.02 * s);
  return g;
}
function bush9(s, col) {
  var b = sph(0.085 * (s || 1), 16, MAT(col || P9.greenL, { rough: 0.95 }));
  b.scale.y = 0.85; return b;
}
/* 市集侧摊（v2 R8，lv4）：双柱 + 柜台 + 迷你蓝白篷（垂齿）+ 果箱 —— 13 mesh */
function stall9() {
  var g = grp();
  g.add(box(0.03, 0.34, 0.03, MAT(P9.woodD), -0.2, 0.17, 0.1));
  g.add(box(0.03, 0.34, 0.03, MAT(P9.woodD), 0.2, 0.17, 0.1));
  g.add(box(0.46, 0.05, 0.26, MAT(P9.woodM, { rough: 0.9 }), 0, 0.215, 0));
  var aw = awn9(0.48, 0.1, P9.awnC, P9.awnD, { n: 4, m: 3, s: 0.8 });
  aw.position.set(0, 0.35, 0.02); g.add(aw);
  var cr = crate9(); cr.position.set(-0.07, 0.24, 0.02); cr.scale.setScalar(0.85); g.add(cr);
  return g;
}
/* 地坪：2.6×2.6（≤ 占地上限），草地双层 */
function pad9() {
  var g = grp();
  g.add(box(2.6, 0.06, 2.6, MAT(P9.lawn, { rough: 0.95 }), 0, 0.03, 0));
  g.add(box(2.42, 0.02, 2.42, MAT(P9.grass, { rough: 0.95 }), 0, 0.068, 0));
  return g;
}
/* 披檐气窗（v2 R7，lv2 顶坡）：山花 + 石披边 + 微顶 + 暗窗 —— 7 mesh */
function roofDormer9(w, rise, half) {
  var g = grp();
  var sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.05, bevelEnabled: false });
  g.add(mesh(tg, MAT(P9.brickD)));
  var ang = Math.atan2(rise, half), slope = Math.sqrt(rise * rise + half * half);
  [-1, 1].forEach(function (s) {
    var rake = box(0.018, 0.018, slope, MAT(P9.stoneL), s * half * 0.5, rise * 0.5, 0.028);
    rake.rotation.z = -s * ang;
    g.add(rake);
  });
  var rF = box(w, 0.024, slope * 0.66, MAT(P9.tileD));
  rF.rotation.x = ang * 0.9; rF.position.set(0, rise * 0.6, half * 0.32); g.add(rF);
  g.add(box(w * 0.5, 0.028, 0.048, MAT(P9.ridgeS), 0, rise + 0.011, 0));
  g.add(box(w * 0.44, rise * 0.5, 0.04, MAT(P9.glaz, { rough: 0.4 }), 0, rise * 0.22, 0.03));
  return g;
}
/* 披檐圆窗（v2，lv3 顶坡）：石环 + 暗芯 —— 2 mesh */
function atticVent9() {
  var g = grp();
  g.add(mesh(new THREE.TorusGeometry(0.05, 0.013, 10, 18), MAT(P9.stoneL)));
  var d = cyl(0.046, 0.046, 0.014, 16, MAT(P9.glaz, { rough: 0.4 }));
  d.rotation.x = PI / 2; g.add(d);
  return g;
}

/* ============================ 4. 四阶建筑（blockout→structure→form→material） ============================ */

/* ---------- lv1 小屋：木板屋 + 板皮人字顶（挂瓦条/苔点） + 石板满铺前院 + 矮石坊
   + 市集杂件 + 草簇（~74 mesh, H≈1.02） ---------- */
function lv1() {
  var g = grp(); g.name = 'prop_9_lv1';
  g.userData.kind = 'property'; g.userData.propIdx = 9; g.userData.level = 1;
  g.add(pad9());

  var B = grp(); B.position.set(0, 0.078, -0.22); g.add(B);
  B.add(box(1.22, 0.045, 0.86, MAT(P9.stoneD), 0, 0.022, 0));                     /* 石勒脚 */
  var walls = plankBox(1.12, 0.5, 0.76, 2, 1); walls.position.set(0, 0.295, 0); B.add(walls);
  [[-0.53, -0.35], [0.53, -0.35], [-0.53, 0.35], [0.53, 0.35]].forEach(function (c) {
    B.add(box(0.06, 0.5, 0.06, MAT(P9.plankD), c[0], 0.295, c[1]));               /* 角柱 */
  });
  /* 正门（v2：暗廓 + 半开板门）+ 两侧小窗（右窗暖光 → 动画） */
  B.add(box(0.28, 0.38, 0.03, MAT(P9.woodD), 0, 0.25, 0.385));
  B.add(box(0.24, 0.34, 0.016, MAT('#241f1a', { rough: 0.9 }), 0, 0.245, 0.372));
  var leaf = box(0.14, 0.34, 0.022, MAT(P9.woodM), -0.07, 0.245, 0.396); leaf.rotation.y = -0.55; B.add(leaf);
  var glowM = std('#7a6248', { rough: 0.45, emissive: P9.glow, ei: 0.2 });
  [-0.32, 0.32].forEach(function (x, i) {
    B.add(box(0.24, 0.24, 0.035, MAT(P9.woodD), x, 0.32, 0.385));
    B.add(box(0.18, 0.18, 0.03, i ? glowM : MAT(P9.glaz, { rough: 0.4 }), x, 0.32, 0.391));
    B.add(box(0.2, 0.022, 0.036, MAT(P9.woodD), x, 0.32, 0.397));
    B.add(box(0.022, 0.18, 0.036, MAT(P9.woodD), x, 0.32, 0.397));
    B.add(box(0.3, 0.032, 0.055, MAT(P9.stoneL), x, 0.19, 0.4));
  });
  /* 板皮人字顶（大挑檐，山花朝左右；v2：挂瓦条 ×4 + 苔点 ×2 + 卷脊滚木） */
  var roof = grp(); roof.position.set(0, 0.545, 0); B.add(roof);
  var rise = 0.36, half = 0.74, slope = Math.sqrt(rise * rise + half * half) + 0.05, ang = Math.atan2(rise, half);
  var pF = plankBox(1.36, 0.035, slope, 3, 1); pF.rotation.x = ang; pF.position.set(0, rise * 0.5, half * 0.5); roof.add(pF);
  var pB = plankBox(1.36, 0.035, slope, 3, 1); pB.rotation.x = -ang; pB.position.set(0, rise * 0.5, -half * 0.5); roof.add(pB);
  roof.add(box(1.42, 0.045, 0.07, MAT(P9.plankD), 0, rise + 0.01, 0));
  var roll = cyl(0.03, 0.03, 1.4, 12, MAT(P9.plankD), 0, rise + 0.042, 0); roll.rotation.z = PI / 2; roof.add(roll);
  [0.35, 0.7].forEach(function (tt) {
    [-1, 1].forEach(function (sd) {
      var bat = box(1.32, 0.02, 0.028, MAT(P9.plankD), 0, rise * (1 - tt), sd * half * tt);
      bat.rotation.x = sd * ang;
      roof.add(bat);
    });
  });
  [[-0.3, 0.5], [0.34, 0.42]].forEach(function (m) {
    var mos = sph(0.042, 16, MAT(P9.green, { rough: 0.95 }), m[0], rise * 0.52, m[1] * half);
    mos.scale.y = 0.28; mos.rotation.x = ang * 0.9; roof.add(mos);
  });
  var sh = new THREE.Shape();
  sh.moveTo(-0.38, 0); sh.lineTo(0.38, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
  for (var sd2 = -1; sd2 <= 1; sd2 += 2) {
    var tp = mesh(tg, MAT(P9.plankD));
    tp.rotation.y = PI / 2 * sd2; tp.position.set(sd2 * 0.665, 0, 0);
    roof.add(tp);
  }
  /* 矮石坊（v2：柱头圆珠）+ 石板满铺前院 + 侧矮墙 */
  var gw = grp(); gw.position.set(0, 0.078, 0.86); g.add(gw);
  gw.add(box(0.08, 0.34, 0.08, MAT(P9.stone), -0.26, 0.17, 0));
  gw.add(box(0.08, 0.34, 0.08, MAT(P9.stone), 0.26, 0.17, 0));
  gw.add(box(0.66, 0.055, 0.09, MAT(P9.stoneL), 0, 0.37, 0));
  gw.add(box(0.72, 0.03, 0.11, MAT(P9.stoneL), 0, 0.415, 0));
  put(gw, sph(0.024, 16, MAT(P9.stoneL), -0.26, 0.395, 0));
  put(gw, sph(0.024, 16, MAT(P9.stoneL), 0.26, 0.395, 0));
  g.add(paving9([
    { x: -0.3, z: 0.24, w: 0.3, d: 0.18, n: 2 },
    { x: 0.02, z: 0.24, w: 0.3, d: 0.18, n: 2 },
    { x: -0.3, z: 0.5, w: 0.3, d: 0.18, n: 2 },
    { x: 0.02, z: 0.5, w: 0.3, d: 0.18, n: 2 },
    { x: -0.14, z: 0.76, w: 0.26, d: 0.16, n: 1 }
  ]));
  var wl = yardWall(0.55, 0.42); wl.position.set(-0.78, 0.078, 0.6); g.add(wl);
  var wr = yardWall(0.55, -0.42); wr.position.set(0.78, 0.078, 0.6); g.add(wr);
  var gp1 = gatePost9(0.26); gp1.position.set(-0.34, 0.078, 0.64); g.add(gp1);
  var gp2 = gatePost9(0.26); gp2.position.set(0.34, 0.078, 0.64); g.add(gp2);
  /* 市集杂件：货箱 + 果筐 + 木桶 + 草簇 + 卵石 */
  var c1 = crate9(); c1.position.set(0.72, 0.078, 0.3); g.add(c1);
  var c2 = crate9(); c2.position.set(0.94, 0.078, 0.05); c2.rotation.y = 0.5; g.add(c2);
  g.add(cyl(0.05, 0.055, 0.13, 12, MAT('#5a6a74', { rough: 0.7 }), 0.95, 0.14, -0.4));
  [[-0.62, 1.06], [0.5, 1.14], [-1.08, 0.1], [1.12, -0.62], [0.2, 1.18]].forEach(function (p) {
    var tf = tuft9(0.9); tf.position.set(p[0], 0.1, p[1]); tf.rotation.y = p[0] * 3; g.add(tf);
  });
  var peb = sph(0.05, 16, MAT(P9.stoneD, { rough: 0.9 }), -0.92, 0.088, -0.6); peb.scale.y = 0.6; g.add(peb);
  var b1 = bush9(1.1); b1.position.set(-0.72, 0.14, 0.12); g.add(b1);
  var b2 = bush9(0.8, P9.green); b2.position.set(1.0, 0.13, -0.15); g.add(b2);
  var pp = potPlant9(0.9); pp.position.set(-0.35, 0.078, 0.52); g.add(pp);

  /* anim：暖窗呼吸（幅度克制） */
  anim(g, function (t) { glowM.emissiveIntensity = 0.2 + 0.1 * sin(t * 1.6); });
  return g;
}

/* ---------- lv2 洋房：两层砖石商铺 + 首座黑瓦卷尾顶（瓦当/脊端圆珠/披檐气窗）
   + 红米条纹双篷垂边 + 檐口齿饰 + 挂匾 + 双灯笼（~135 mesh, H≈1.57） ---------- */
function lv2() {
  var g = grp(); g.name = 'prop_9_lv2';
  g.userData.kind = 'property'; g.userData.propIdx = 9; g.userData.level = 2;
  g.add(pad9());

  var B = grp(); B.position.set(0, 0.078, -0.16); g.add(B);
  B.add(box(1.6, 0.05, 0.98, MAT(P9.stoneD), 0, 0.025, 0));                       /* 勒脚 */
  var main = brickBox(1.5, 0.92, 0.88, 3, 2); main.position.set(0, 0.545, 0); B.add(main);
  [[-0.72, 0.41], [0.72, 0.41], [-0.72, -0.41], [0.72, -0.41]].forEach(function (c) {
    var q = pilaster(0.92, c[0], c[1]); q.position.y = 0.05; B.add(q);
  });
  B.add(box(1.56, 0.04, 0.92, MAT(P9.stone), 0, 0.56, 0));                        /* 层间线脚 */
  B.add(box(1.58, 0.055, 0.94, MAT(P9.stoneL), 0, 1.03, 0));                      /* 顶檐口 */
  B.add(dentils9(1.44, 0.985, 0.468, 6, MAT(P9.stone)));                          /* v2 檐口齿饰 */
  /* 一层店面：暖光橱窗 + 木门 + 红米条纹双篷垂边 + 门前果箱 */
  var shop = shopGlow9(0.5, 0.36); shop.position.set(-0.4, 0.3, 0.442); B.add(shop);
  B.add(box(0.28, 0.42, 0.035, MAT(P9.woodD), 0.22, 0.27, 0.442));
  B.add(box(0.22, 0.36, 0.024, MAT(P9.woodM), 0.22, 0.25, 0.456));
  var aw = awn9(1.3, 0.28, P9.awnA, P9.awnB); aw.position.set(0, 0.6, 0.5); B.add(aw);
  /* 二层：百叶窗 ×2（花箱）+ 檐下挂匾 */
  var w1 = shutterWindow(0.26, 0.34, { flower: true }); w1.position.set(-0.4, 0.8, 0.442); B.add(w1);
  var w2 = shutterWindow(0.26, 0.34, { flower: true }); w2.position.set(0.4, 0.8, 0.442); B.add(w2);
  var sign = textPlate9('庙', 0.11, 0.11, { bg: '#3a2c1c', fg: '#e2c274', ei: 0.15 });
  var hang = grp(); hang.position.set(0.02, 0.63, 0.5); hang.add(sign); sign.position.y = -0.075; B.add(hang);
  /* 首座黑瓦卷尾顶（v2 瓦当排 + 脊端圆珠由 cnRoof9 内建） */
  var roof = cnRoof9(1.34, 1.02, 0.32, 2); roof.position.set(0, 1.055, -0.02); B.add(roof);
  var dor = roofDormer9(0.3, 0.1, 0.12); dor.position.set(0, 0.205, 0.26); roof.add(dor);  /* v2 披檐气窗 */
  /* 檐角双灯笼 */
  var l1 = lantern9(1.05); l1.position.set(-0.66, 0.99, 0.46); B.add(l1);
  var l2 = lantern9(1.05); l2.position.set(0.66, 0.99, 0.46); B.add(l2);

  /* 前院：石牌坊（挂匾 + 柱头圆珠）+ 矮墙 + 径 + 盆栽 + 门前果箱 */
  var gw = paifang9(0.42, 0.48, 2); gw.position.set(0, 0.078, 0.88); g.add(gw);
  var yl = yardWall(0.5, 1.05); yl.position.set(-0.98, 0.078, 0.52); g.add(yl);
  var yr = yardWall(0.62, 0); yr.position.set(0.66, 0.078, 1.0); g.add(yr);
  var gpt = gatePost9(0.3); gpt.position.set(1.02, 0.078, 1.0); g.add(gpt);
  g.add(flagPath(0.4, 0.96));
  g.add(box(0.4, 0.026, 0.16, MAT(P9.stoneD), 0, 0.092, 0.52));                   /* v2 门阶 */
  var p1 = potPlant9(1); p1.position.set(-0.36, 0.078, 0.56); g.add(p1);
  var p2 = potPlant9(0.85); p2.position.set(0.4, 0.078, 0.6); g.add(p2);
  var b1 = bush9(1.1); b1.position.set(1.0, 0.14, 0.24); g.add(b1);
  var b2 = bush9(0.8, P9.green); b2.position.set(-1.02, 0.13, -0.42); g.add(b2);
  var cr1 = crate9(); cr1.position.set(0.55, 0.078, 0.34); cr1.rotation.y = -0.3; g.add(cr1);
  var cr2 = crate9(); cr2.position.set(0.36, 0.078, 0.16); cr2.rotation.y = 0.25; g.add(cr2);

  /* anim：店窗呼吸 + 挂匾摇 + 灯笼摆+呼吸（幅度克制） */
  var gm = shop.userData.glowMat;
  anim(g, function (t) { gm.emissiveIntensity = 0.5 + 0.13 * sin(t * 1.7); });
  var lms = [l1.userData.lanternMat, l2.userData.lanternMat];
  anim(g, function (t) {
    hang.rotation.z = sin(t * 1.5) * 0.06;
    l1.rotation.z = sin(t * 1.3) * 0.07;
    l2.rotation.z = sin(t * 1.3 + 1.4) * 0.07;
    for (var i = 0; i < 2; i++) lms[i].emissiveIntensity = 0.2 + 0.09 * (0.5 + 0.5 * sin(t * 1.8 + i * 1.2));
  });
  return g;
}

/* ---------- lv3 大厦：三层起楼 + 骑楼五柱廊 + 石栏花箱阳台 + 蓝白双篷垂边
   + 一层红布篷 + 顶檐展开 + 垂脊圆珠 + 披檐圆窗 + 牌坊垂灯（~200 mesh, H≈2.29） ---------- */
function lv3() {
  var g = grp(); g.name = 'prop_9_lv3';
  g.userData.kind = 'property'; g.userData.propIdx = 9; g.userData.level = 3;
  g.add(pad9());

  var B = grp(); B.position.set(0, 0.078, -0.12); g.add(B);
  B.add(box(1.56, 0.06, 1.02, MAT(P9.stoneD), 0, 0.03, 0));                       /* 勒脚 */
  /* 一层骑楼：架空层板 + 暗廊背景 + 前列五柱（v2 加密） */
  var arcade = box(1.4, 0.04, 0.66, MAT(P9.stoneD), 0, 0.055, 0.14); B.add(arcade); /* 廊地板 */
  var dark = box(1.44, 0.52, 0.03, MAT('#241f1a', { rough: 0.9 }), 0, 0.34, 0.28); B.add(dark);
  var body2 = brickBox(1.5, 0.98, 0.9, 3, 2); body2.position.set(0, 1.09, -0.06); B.add(body2);
  [[-0.72, 0.4], [0.72, 0.4], [-0.72, -0.52], [0.72, -0.52]].forEach(function (c) {
    var q = pilaster(1.86, c[0], c[1]); q.position.y = 0.06; B.add(q);
  });
  B.add(box(1.56, 0.038, 0.94, MAT(P9.stone), 0, 0.64, -0.06));                   /* 层线脚 ×2 */
  B.add(box(1.56, 0.038, 0.94, MAT(P9.stone), 0, 1.14, -0.06));
  B.add(box(1.58, 0.06, 0.96, MAT(P9.stoneL), 0, 1.62, -0.06));                   /* 顶檐口 */
  B.add(dentils9(1.44, 1.575, 0.468, 6, MAT(P9.stone)));                          /* v2 檐口齿饰 */
  /* 一层：廊柱 ×5 + 市集货箱 + 两侧木门/橱窗 + 廊上红布篷（v2） */
  [-0.48, -0.24, 0, 0.24, 0.48].forEach(function (x) {
    var col = arcadeColumn(0.56); col.position.set(x, 0.06, 0.5); B.add(col);
  });
  var cr1 = crate9(); cr1.position.set(-0.22, 0.06, 0.34); B.add(cr1);
  var cr2 = crate9(); cr2.position.set(0.26, 0.06, 0.32); cr2.rotation.y = -0.4; B.add(cr2);
  var cr3 = crate9(); cr3.position.set(0.02, 0.06, 0.38); cr3.rotation.y = 0.2; B.add(cr3);
  var shop = shopGlow9(0.3, 0.3); shop.position.set(-0.62, 0.33, 0.32); B.add(shop);
  var awG = awn9(1.3, 0.18, P9.awnA, P9.lantD); awG.position.set(0, 0.6, 0.56); B.add(awG);  /* v2 红布篷 */
  /* 二层：法式百叶 + 石栏阳台（+ 花箱 ×2 v2）+ 蓝白条纹双篷垂边 */
  var f2 = shutterWindow(0.3, 0.4, { flower: true }); f2.position.set(0, 0.92, 0.392); B.add(f2);
  var w21 = shutterWindow(0.2, 0.3); w21.position.set(-0.46, 0.92, 0.392); B.add(w21);
  var w22 = shutterWindow(0.2, 0.3); w22.position.set(0.46, 0.92, 0.392); B.add(w22);
  var bal = balustrade(1.0, 0.2, 5, MAT(P9.stoneL)); bal.position.set(0, 0.68, 0.46); B.add(bal);
  var pl1 = planter9(0.24); pl1.position.set(-0.32, 0.84, 0.6); B.add(pl1);
  var pl2 = planter9(0.24); pl2.position.set(0.32, 0.84, 0.6); B.add(pl2);
  var awB = awn9(1.24, 0.26, P9.awnC, P9.awnD); awB.position.set(0, 0.74, 0.5); B.add(awB);
  /* 三层：百叶窗 ×3 + 檐下双灯笼 */
  var f3 = shutterWindow(0.26, 0.32); f3.position.set(0, 1.4, 0.392); B.add(f3);
  var w31 = shutterWindow(0.2, 0.28); w31.position.set(-0.46, 1.4, 0.392); B.add(w31);
  var w32 = shutterWindow(0.2, 0.28); w32.position.set(0.46, 1.4, 0.392); B.add(w32);
  var l1 = lantern9(1.1); l1.position.set(-0.7, 1.56, 0.44); B.add(l1);
  var l2 = lantern9(1.1); l2.position.set(0.7, 1.56, 0.44); B.add(l2);
  /* 顶檐完全展开：黑瓦卷尾顶 + 垂脊圆珠 + 披檐圆窗（v2） */
  var roof = cnRoof9(1.62, 1.26, 0.46, 3); roof.position.set(0, 1.63, -0.06); B.add(roof);
  var vent = atticVent9(); vent.position.set(0, 0.345, 0.28); vent.rotation.x = 0.416; roof.add(vent);

  /* 前院：石牌坊（「城隍」石匾 + 拱 + 柱头圆珠 + 垂灯 v2）+ 墙 + 台阶 + 径 */
  var gw = paifang9(0.5, 0.52, 3); gw.position.set(0, 0.078, 0.88); g.add(gw);
  var l3 = lantern9(0.75); l3.position.set(0, 0.42, 0.06); gw.add(l3);            /* v2 牌坊垂灯 */
  var y1 = yardWall(0.44, 1.05); y1.position.set(-1.04, 0.078, 0.54); g.add(y1);
  var y2 = yardWall(0.46, 0.5); y2.position.set(0.82, 0.078, 1.0); g.add(y2);
  var y3 = yardWall(0.46, -0.5); y3.position.set(1.02, 0.078, 0.6); g.add(y3);
  g.add(box(0.5, 0.028, 0.22, MAT(P9.stoneD), 0, 0.09, 0.62));                    /* 门阶 */
  g.add(flagPath(0.4, 0.96));
  g.add(paving9([{ x: -0.34, z: 0.56, w: 0.24, d: 0.15, n: 1 }, { x: 0.34, z: 0.56, w: 0.24, d: 0.15, n: 1 }]));
  var p1 = potPlant9(1); p1.position.set(-0.34, 0.078, 0.58); g.add(p1);
  var p2 = potPlant9(0.9); p2.position.set(0.36, 0.078, 0.62); g.add(p2);
  var p3 = potPlant9(1.05); p3.position.set(-0.98, 0.078, 0.16); g.add(p3);
  var cr4 = crate9(); cr4.position.set(0.58, 0.078, 0.4); cr4.rotation.y = 0.4; g.add(cr4);
  var tf1 = tuft9(0.9); tf1.position.set(1.1, 0.1, -0.1); g.add(tf1);
  var b1 = bush9(1); b1.position.set(1.05, 0.14, 0.1); g.add(b1);
  var b2 = bush9(0.75, P9.green); b2.position.set(-1.08, 0.13, -0.35); g.add(b2);

  /* anim：灯笼摆+呼吸 ×3 + 石匾微光（克制） */
  var lms = [l1.userData.lanternMat, l2.userData.lanternMat, l3.userData.lanternMat];
  anim(g, function (t) {
    l1.rotation.z = sin(t * 1.25) * 0.07;
    l2.rotation.z = sin(t * 1.25 + 1.5) * 0.07;
    l3.rotation.z = sin(t * 1.4 + 0.6) * 0.06;
    for (var i = 0; i < 3; i++) lms[i].emissiveIntensity = 0.2 + 0.09 * (0.5 + 0.5 * sin(t * 1.7 + i * 1.1));
  });
  var tm = gw.userData.tabletMat;
  if (tm) anim(g, function (t) { tm.emissiveIntensity = 0.1 + 0.1 * (0.5 + 0.5 * sin(t * 1.1)); });
  return g;
}

/* ---------- lv4 地标：四层完整地标 + 腰檐圈顶/红布帐帘 + 金脊兽/鎏金中饰 ×2
   + 披檐山花亭 + 双层石栏花箱 + 分体双篷 ×2 层 + 六灯笼阵列 + 鎏金匾牌坊
   + 双石狮 + 市集侧摊（~338 mesh, H≈2.92） ---------- */
function lv4() {
  var g = grp(); g.name = 'prop_9_lv4';
  g.userData.kind = 'property'; g.userData.propIdx = 9; g.userData.level = 4;
  g.add(pad9());

  var B = grp(); B.position.set(0, 0.078, -0.1); g.add(B);
  B.add(box(1.62, 0.07, 1.1, MAT(P9.stoneD), 0, 0.035, 0));                       /* 勒脚 */
  /* 一层骑楼：架空层板 + 暗廊背景 + 前列四柱 + 市集 + 暖橱窗 */
  var arcade = box(1.5, 0.04, 0.7, MAT(P9.stoneD), 0, 0.06, 0.16); B.add(arcade);  /* 廊地板 */
  var dark = box(1.5, 0.56, 0.03, MAT('#241f1a', { rough: 0.9 }), 0, 0.36, 0.3); B.add(dark);
  var body = brickBox(1.56, 1.95, 1.0, 3, 4); body.position.set(0, 1.29, -0.04); B.add(body);
  [[-0.75, 0.44], [0.75, 0.44], [-0.75, -0.52], [0.75, -0.52]].forEach(function (c) {
    var q = pilaster(1.95, c[0], c[1]); q.position.y = 0.07; B.add(q);
  });
  B.add(box(1.62, 0.036, 1.04, MAT(P9.stone), 0, 0.66, -0.04));                   /* 层线脚 ×3 */
  B.add(box(1.62, 0.036, 1.04, MAT(P9.stone), 0, 1.14, -0.04));
  B.add(box(1.62, 0.036, 1.04, MAT(P9.stone), 0, 1.62, -0.04));
  B.add(box(1.64, 0.06, 1.06, MAT(P9.stoneL), 0, 2.14, -0.04));                   /* 顶横檐 */
  B.add(dentils9(1.5, 2.095, 0.482, 6, MAT(P9.stone)));                           /* v2 檐口齿饰 */
  /* 一层：廊柱 ×4 + 货箱 ×3 + 暗廊暖橱窗（v2 修复：v1 店窗 z=0.32 被砖墙体遮挡） */
  [-0.54, -0.18, 0.18, 0.54].forEach(function (x) {
    var col = arcadeColumn(0.58); col.position.set(x, 0.07, 0.5); B.add(col);
  });
  var cr1 = crate9(); cr1.position.set(-0.32, 0.07, 0.34); B.add(cr1);
  var cr2 = crate9(); cr2.position.set(0.3, 0.07, 0.3); cr2.rotation.y = -0.5; B.add(cr2);
  var cr3 = crate9(); cr3.position.set(0.02, 0.07, 0.38); B.add(cr3);
  var shop = shopGlow9(0.34, 0.2); shop.position.set(-0.5, 0.18, 0.335); B.add(shop);
  /* 二层：法式百叶 + 石栏阳台（+ 花箱）+ 分体红白双篷 ×2（v2 双篷）
     （v2 修复：窗 z 0.412 → 0.472，v1 整层窗被 z=0.46 砖墙面遮挡） */
  var f2 = shutterWindow(0.3, 0.38, { flower: true }); f2.position.set(0, 0.95, 0.472); B.add(f2);
  var w21 = shutterWindow(0.2, 0.28); w21.position.set(-0.48, 0.95, 0.472); B.add(w21);
  var w22 = shutterWindow(0.2, 0.28); w22.position.set(0.48, 0.95, 0.472); B.add(w22);
  var bal2 = balustrade(1.04, 0.2, 4, MAT(P9.stoneL)); bal2.position.set(0, 0.71, 0.46); B.add(bal2);
  var plA = planter9(0.24); plA.position.set(-0.34, 0.87, 0.6); B.add(plA);
  var awR1 = awn9(0.68, 0.25, P9.awnA, P9.awnD); awR1.position.set(-0.36, 0.77, 0.5); B.add(awR1);
  var awR2 = awn9(0.68, 0.25, P9.awnA, P9.awnD); awR2.position.set(0.36, 0.77, 0.5); B.add(awR2);
  /* 三层：百叶 ×2 + 中央鎏金圆镜（v2 R4）+ 石栏阳台（+ 花箱）+ 分体红米双篷 ×2 */
  var w31 = shutterWindow(0.2, 0.28); w31.position.set(-0.48, 1.43, 0.472); B.add(w31);
  var w32 = shutterWindow(0.2, 0.28); w32.position.set(0.48, 1.43, 0.472); B.add(w32);
  var med2 = medallion9(); med2.scale.setScalar(0.8); med2.position.set(0, 1.43, 0.482); B.add(med2);
  var bal3 = balustrade(1.04, 0.2, 4, MAT(P9.stoneL)); bal3.position.set(0, 1.19, 0.46); B.add(bal3);
  var plB = planter9(0.24); plB.position.set(0.34, 1.35, 0.6); B.add(plB);
  var awR3 = awn9(0.68, 0.25, P9.awnA, P9.awnB); awR3.position.set(-0.36, 1.25, 0.5); B.add(awR3);
  var awR4 = awn9(0.68, 0.25, P9.awnA, P9.awnB); awR4.position.set(0.36, 1.25, 0.5); B.add(awR4);
  /* 腰檐圈顶 + 檐下红布帐帘（v2 R3） */
  var collar = hipRing9(1.72, 1.3, 0.24); collar.position.set(0, 1.66, -0.04); B.add(collar);
  var curt = curtain9(1.1, 0.3); curt.position.set(0, 1.61, 0.5); B.add(curt);
  /* 四层（腰檐之上）：百叶窗 ×3 + 短石栏 */
  var f4 = shutterWindow(0.24, 0.2); f4.position.set(0, 1.98, 0.472); B.add(f4);
  var w41 = shutterWindow(0.18, 0.18); w41.position.set(-0.48, 1.98, 0.472); B.add(w41);
  var w42 = shutterWindow(0.18, 0.18); w42.position.set(0.48, 1.98, 0.472); B.add(w42);
  var bal4 = balustrade(0.96, 0.2, 4, MAT(P9.stoneL)); bal4.position.set(0, 1.8, 0.48); B.add(bal4);
  /* 六灯笼阵列（v2 R5）：篷下 ×2 / 腰檐 ×2 / 顶檐 ×2 */
  var lans = [];
  [[-0.66, 0.64, 0.74], [0.66, 0.64, 0.74], [-0.84, 1.76, 0.82], [0.84, 1.76, 0.82],
   [-0.8, 2.27, 0.8], [0.8, 2.27, 0.8]].forEach(function (p) {
    var l = lantern9(1.0); l.position.set(p[0], p[1], p[2]); B.add(l); lans.push(l);
  });
  /* 大顶：金脊兽 + 鎏金中饰 + 垂脊圆珠 + 披檐山花亭（内嵌鎏金圆镜 v2 R4） */
  var roof = cnRoof9(1.7, 1.34, 0.55, 4); roof.position.set(0, 2.17, -0.04); B.add(roof);
  var dor = gableDormer9(0.34, 0.15, 0.16); dor.position.set(0, 0.395, 0.27); roof.add(dor);
  var med = medallion9(); med.scale.setScalar(0.82); med.position.set(0, 0.075, 0.075); dor.add(med);

  /* 前院：鎏金匾牌坊（+ 鎏金宝顶 v2）+ 双石狮 + 台阶 ×2 + 径 + 市集侧摊（v2 R8） */
  var gw = paifang9(0.54, 0.56, 4); gw.position.set(0, 0.078, 0.9); g.add(gw);
  var lion1 = stoneLion(); lion1.position.set(-0.42, 0.078, 0.74); lion1.rotation.y = 0.35; g.add(lion1);
  var lion2 = stoneLion(); lion2.position.set(0.42, 0.078, 0.74); lion2.rotation.y = -0.35; g.add(lion2);
  g.add(box(0.56, 0.03, 0.24, MAT(P9.stoneD), 0, 0.093, 0.66));                   /* 门阶 ×2 */
  g.add(box(0.56, 0.03, 0.18, MAT(P9.stoneD), 0, 0.063, 0.44));
  var y1 = yardWall(0.42, 1.05); y1.position.set(-1.06, 0.078, 0.5); g.add(y1);
  var y2 = yardWall(0.44, 0.5); y2.position.set(0.84, 0.078, 1.02); g.add(y2);
  var y3 = yardWall(0.44, -0.5); y3.position.set(1.04, 0.078, 0.58); g.add(y3);
  g.add(flagPath(0.4, 0.96));
  var p1 = potPlant9(1.05); p1.position.set(-0.3, 0.078, 0.5); g.add(p1);
  var p2 = potPlant9(0.9); p2.position.set(0.34, 0.078, 0.52); g.add(p2);
  var st = stall9(); st.position.set(0.95, 0.078, 0.02); st.rotation.y = -0.45; g.add(st);
  [[-0.6, 1.12], [1.18, -0.14]].forEach(function (p) {
    var tf = tuft9(0.9); tf.position.set(p[0], 0.1, p[1]); tf.rotation.y = p[0] * 2; g.add(tf);
  });
  var b1 = bush9(1.1); b1.position.set(-1.14, 0.14, 0.16); g.add(b1);
  var b2 = bush9(0.8, P9.green); b2.position.set(-1.1, 0.13, -0.28); g.add(b2);
  var b3 = bush9(0.7, P9.greenL); b3.position.set(1.12, 0.12, -0.5); g.add(b3);

  /* anim：六灯笼摆+呼吸 + 鎏金匾流辉 + 双圆镜夜光（幅度克制） */
  anim(g, function (t) {
    lans.forEach(function (l, i) {
      l.rotation.z = sin(t * 1.25 + i * 1.3) * 0.06;
      l.userData.lanternMat.emissiveIntensity = 0.2 + 0.09 * (0.5 + 0.5 * sin(t * 1.8 + i * 0.9));
    });
  });
  var tm = gw.userData.tabletMat;
  var dm2 = med2.userData.discMat, dm = med.userData.discMat;
  anim(g, function (t) {
    if (tm) tm.emissiveIntensity = 0.15 + 0.12 * (0.5 + 0.5 * sin(t * 1.15));
    if (dm2) dm2.emissiveIntensity = 0.16 + 0.1 * (0.5 + 0.5 * sin(t * 0.9 + 1.2));
    if (dm) dm.emissiveIntensity = 0.16 + 0.1 * (0.5 + 0.5 * sin(t * 0.8 + 2.0));
  });
  return g;
}

/* ============================ 5. 导出：window.Props3D[9] ============================ */
window.Props3D = window.Props3D || {};
window.Props3D[9] = function (level) {
  level = Math.max(1, Math.min(4, level | 0 || 1));
  if (level === 1) return lv1();
  if (level === 2) return lv2();
  if (level === 3) return lv3();
  return lv4();
};

})();

/* ====================================================================================
 * v2 精修清单（对照 refs/prop_9.png 逐条清偿 v1 差距）：
 *  G1 檐口无瓦当 → cnRoof9/hipRing9 前檐瓦当排（lv2+）              【已清偿】
 *  G2 波浪篷无垂边 → awn9 双篷垂边（斜篷 + 半圆垂齿），lv4 分体双篷   【已清偿】
 *  G3 lv4 缺腰檐圈顶与檐下红帘 → hipRing9 + curtain9                 【已清偿】
 *  G4 鎏金中饰仅 1 处 → 三层墙心圆镜 + 顶檐披檐山花亭鎏金圆镜        【已清偿】
 *  G5 灯笼无呼吸/数量不足 → 6 盏阵列 + emissive 呼吸（lv3 牌坊垂灯）  【已清偿】
 *  G6 牌坊柱头无装饰 → 柱头圆珠 + lv4 鎏金宝顶 + 砌块纹理            【已清偿】
 *  G7 lv1 前院裸草坪 → 石板满铺 + 草簇/卵石 + 板皮顶挂瓦条/苔点       【已清偿】
 *  G8 阳台无绿植/骑楼柱距过大 → 石栏花箱 + lv3 五柱廊 + lv4 市集侧摊  【已清偿】
 *  G9 lv4 门窗被砖墙体遮挡（v1 z 序缺陷）→ 立面窗外移 + 暗廊暖窗下沉  【已清偿】
 * ==================================================================================== */
