/* =====================================================================================
 * 大富翁 · 个性化地产 格 9 「城隍庙」 —— 庙市骑楼四阶演进（img2threejs 高保真重建）
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/prop_9.png（四阶一体参考图，唯一视觉真源）。
 * 格名以 data.js BOARD[9] = 城隍庙（g2 沪上组）为准；prop_9.png 内容即灰石框+红砖填充、
 *   黑瓦翘脊、灯笼罩顶的庙市骑楼族谱，与城隍庙匹配；本文件以参考图 + Props3D[9] 契约为准。
 *
 * —— img2threejs 雕刻 spec（摘要，spec 已过 --strict-quality，存 .img2threejs_p9/） ————
 * 对象类别：object / installed-domain（微缩沙盘建筑），complexity: complex。
 * 风格族谱：「庙市骑楼」——淡灰石材壁柱/隅石框架 + 红砖填充双色立面、底层骑楼柱廊
 *   （内退阴影 + 前柱）、黑瓦起翘卷尾脊坡顶（垂脊 + 圆珠）、条纹波浪市集篷（红米/蓝白/
 *   红白）、红灯笼金盖金穗、白石瓶栏阳台、红棕木百叶窗 + 花箱、前院石牌坊
 *   （lv2 挂匾「庙」/ lv3 石匾「城隍」/ lv4 鎏金匾「城隍庙」+ 红漆侧镶 + 石狮）。
 * 身份定义特征（identity-defining，任一错误即 fail 该 pass）：
 *   1) 黑瓦卷尾翘脊坡顶（几何壳角部抬升 + 脊端上翘 + 垂脊圆珠；与格 6 蓝瓦红封檐区分）
 *   2) 灰石框架 vs 红砖填充的双色立面（通高壁柱 + 层间线脚）
 *   3) 底层骑楼柱廊（几何内退 + 前列圆柱 + 市集货箱）
 *   4) 条纹波浪篷（逐板条交替材质，红米→蓝白→红白/蓝 递进）
 *   5) 前院石牌坊（方柱 + 拱梁 + 小坡帽；匾额木→石→鎏金 + 石狮）
 *   6) 红灯笼阵列（金盖金穗，檐角悬挂摆动）
 * 四阶演进（同一块地同一风格的生长史）：
 *   lv1 小屋  H 0.8–1.2：木板小屋 + 板皮人字顶 + 矮石坊 + 市集杂件，暖窗微光
 *   lv2 洋房  H 1.2–1.7：两层砖石商铺 + 首座黑瓦卷尾顶 + 红米条纹篷 + 挂匾 + 双灯笼
 *   lv3 大厦  H 1.7–2.3：三层起楼 + 骑楼柱廊 + 石栏阳台 + 蓝白篷 + 顶檐完全展开 +
 *             垂脊圆珠 + 「城隍」石匾
 *   lv4 地标  H 2.3–3.0：四层完整地标 + 金脊兽/鎏金中饰 + 山墙鎏金圆镜 + 双层石栏 +
 *             双篷一蓝 + 鎏金匾牌坊 + 双石狮 + 六灯笼阵列
 * 材质：MeshStandardMaterial（convertSRGBToLinear）；Canvas 程序化纹理 ≤256px：
 *   红砖 / 黑瓦垄 / 旧木板；光照：不添加灯光，暖窗/灯笼/金件用 emissive 克制表现。
 * 交互（userData.anim = [fn(t,dt)]，幅度克制）：暖窗呼吸 / 挂匾摇 / 灯笼摆 / 鎏金流辉。
 * 预算：每级 ≤220 mesh；占地 ≤2.6×2.6；原点=格心、底面 y=0；正面朝 +Z。
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
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, seg, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, seg || 12, (seg || 12) - 2), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z) { o.position.set(x || 0, y || 0, z || 0); parent.add(o); return o; }
function anim(g, fn) { (g.userData.anim || (g.userData.anim = [])).push(fn); }

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
  fruit:   '#d2822e'
};

/* ============================ 2. Canvas 程序化纹理（≤256px） ============================ */
function cv2(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function toTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }

var _texBrick = null;
function texBrick() {  /* 红砖：横缝 + 竖错缝 + 噪点 */
  if (_texBrick) return _texBrick;
  var c = cv2(128, 128), g = c.getContext('2d');
  g.fillStyle = P9.brick; g.fillRect(0, 0, 128, 128);
  var row = 16;
  for (var y = 0; y < 128; y += row) {
    g.fillStyle = 'rgba(212,198,178,0.5)'; g.fillRect(0, y, 128, 2);
    var off = (y / row) % 2 ? 0 : 16;
    for (var x = off; x < 128; x += 32) { g.fillRect(x, y, 2, row); }
    for (var i = 0; i < 24; i++) {
      var bx = (x + Math.random() * 30) % 128, by = y + 3 + Math.random() * (row - 6);
      g.fillStyle = Math.random() > 0.5 ? 'rgba(64,30,22,0.16)' : 'rgba(226,140,104,0.15)';
      g.fillRect(bx, by, 3 + Math.random() * 4, 2);
    }
  }
  _texBrick = toTex(c); _texBrick.wrapS = _texBrick.wrapT = THREE.RepeatWrapping;
  return _texBrick;
}
var _texTile = null;
function texTile() {  /* 黑瓦垄：竖垄滚釉 + 暗横缝（坡向 UV） */
  if (_texTile) return _texTile;
  var c = cv2(64, 64), g = c.getContext('2d');
  g.fillStyle = P9.tile; g.fillRect(0, 0, 64, 64);
  for (var x = 0; x < 64; x += 16) {
    g.fillStyle = P9.tileD; g.fillRect(x + 8, 0, 8, 64);
    g.fillStyle = 'rgba(14,18,24,0.65)'; g.fillRect(x + 7, 0, 1, 64); g.fillRect(x + 15, 0, 1, 64);
    g.fillStyle = 'rgba(150,166,184,0.22)'; g.fillRect(x + 1, 0, 2, 64);
  }
  g.fillStyle = 'rgba(12,16,22,0.45)';
  for (var y = 10; y < 64; y += 21) g.fillRect(0, y, 64, 2);
  _texTile = toTex(c); _texTile.wrapS = _texBrickWrap(); _texTile.wrapT = _texTile.wrapS;
  return _texTile;
}
function _texBrickWrap() { return THREE.RepeatWrapping; }
var _texPlank = null;
function texPlank() {  /* 旧木板：竖板 + 节疤 */
  if (_texPlank) return _texPlank;
  var c = cv2(128, 128), g = c.getContext('2d');
  g.fillStyle = P9.plank; g.fillRect(0, 0, 128, 128);
  for (var x = 0; x < 128; x += 18) {
    g.fillStyle = 'rgba(38,30,20,0.55)'; g.fillRect(x, 0, 2, 128);
    for (var i = 0; i < 6; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(56,44,28,0.28)' : 'rgba(196,176,140,0.16)';
      g.fillRect(x + 3 + Math.random() * 12, Math.random() * 124, 2, 6 + Math.random() * 14);
    }
  }
  _texPlank = toTex(c); _texPlank.wrapS = _texPlank.wrapT = THREE.RepeatWrapping;
  return _texPlank;
}
/* 匾额：深漆板 + 描金字（faceMat 供微光动画） */
function textPlate9(text, w, h, o) {
  o = o || {};
  var cw = 128, ch = 48, c = cv2(cw, ch), g = c.getContext('2d');
  g.fillStyle = o.bg || '#26221a'; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = o.border || '#b08a3c'; g.lineWidth = 5; g.strokeRect(4, 4, cw - 8, ch - 8);
  g.fillStyle = o.fg || '#e8c87a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold ' + Math.round(ch * 0.6) + 'px "Microsoft YaHei","PingFang SC","SimHei",sans-serif';
  g.fillText(text, cw / 2, ch / 2 + 2);
  var tex = toTex(c);
  var g6 = grp();
  g6.add(box(w, h, 0.035, o.backMat || MAT(P9.woodD)));
  var face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.86),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.15, flatShading: true,
      emissive: C(o.fg || '#e8c87a'), emissiveIntensity: o.ei !== undefined ? o.ei : 0.12, emissiveMap: tex }));
  face.position.z = 0.024; g6.add(face);
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
/* 通高石壁柱：两块错缝隅石（灰石框架身份特征）—— 2 mesh */
function pilaster(h, x, z) {
  var g = grp();
  g.add(box(0.095, h, 0.062, MAT(P9.stone), 0, h / 2, 0.014));
  g.add(box(0.062, h, 0.095, MAT(P9.stoneL), 0.016, h / 2, 0));
  g.position.set(x, 0, z);
  return g;
}
/* 百叶窗：木框 + 暗玻璃 + 双叶红棕百叶 + 石窗台（+ 花箱）—— 5~7 mesh */
function shutterWindow(w, h, o) {
  o = o || {};
  var g = grp(), fm = MAT(o.frame || P9.woodD), gl = MAT(o.glass || P9.glaz, { rough: 0.4 });
  g.add(box(w + 0.05, h + 0.05, 0.035, fm));
  g.add(box(w, h, 0.03, gl, 0, 0, 0.005));
  g.add(box(w * 0.34, h, 0.028, MAT(o.shutter || P9.brickD), -w * 0.33, 0, 0.012));
  g.add(box(w * 0.34, h, 0.028, MAT(o.shutter || P9.brickD), w * 0.33, 0, 0.012));
  g.add(box(w + 0.14, 0.04, 0.07, MAT(P9.stoneL), 0, -h / 2 - 0.005, 0.014));
  if (o.flower) {
    g.add(box(w * 0.9, 0.05, 0.06, MAT(P9.stoneD), 0, -h / 2 - 0.05, 0.03));
    put(g, sph(0.028, 12, MAT(P9.greenL, { rough: 0.9 })), -w * 0.24, -h / 2 - 0.022, 0.045);
    put(g, sph(0.028, 12, MAT(P9.green, { rough: 0.9 })), w * 0.24, -h / 2 - 0.022, 0.045);
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
    g.add(cyl(0.013, 0.02, 0.11, 10, mat, -w / 2 + i * (w / n), 0.07, d - 0.015));
  }
  g.add(box(w + 0.04, 0.03, 0.045, mat, 0, 0.145, d - 0.015));
  g.add(box(0.03, 0.15, d, mat, -w / 2, 0.07, d / 2));
  g.add(box(0.03, 0.15, d, mat, w / 2, 0.07, d / 2));
  return g;
}
/* 条纹波浪篷：逐板条交替双材质 + 收边杆 —— (n+1) mesh */
function awn9(w, r, colA, colB) {
  var g = grp(), n = 6;
  var mA = MAT(colA, { rough: 0.88 }), mB = MAT(colB, { rough: 0.88 });
  for (var i = 0; i < n; i++) {
    var tt = i / (n - 1), a = (16 + 52 * tt) * PI / 180;
    var seg = box(w, 0.016, 0.115, (i % 2) ? mB : mA);
    seg.position.set(0, -cos(a) * r, sin(a) * r);
    seg.rotation.x = -a * 0.55;
    g.add(seg);
  }
  var rod = cyl(0.01, 0.01, w + 0.05, 10, MAT(P9.woodD));
  rod.rotation.z = PI / 2;
  rod.position.set(0, -cos(68 * PI / 180) * r, sin(68 * PI / 180) * r);
  g.add(rod);
  return g;
}
/* 红灯笼：吊线 + 朱红球 + 上下金盖 + 金穗（挂点=顶部摆动轴）—— 5 mesh */
function lantern9(s) {
  s = s || 1;
  var pivot = grp();                                        /* 摆动轴在挂点 */
  var g = grp(); g.position.y = -0.055 * s; pivot.add(g);
  var lm = std(P9.lantR, { rough: 0.45, emissive: '#ff9a5a', ei: 0.22 });
  var body = sph(0.052 * s, 12, lm); body.scale.y = 0.86; g.add(body);
  g.add(cyl(0.02 * s, 0.026 * s, 0.018 * s, 10, MAT(P9.gilt, { rough: 0.4, metal: 0.5 }), 0, 0.045 * s, 0));
  g.add(cyl(0.02 * s, 0.026 * s, 0.018 * s, 10, MAT(P9.gilt, { rough: 0.4, metal: 0.5 }), 0, -0.045 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.04 * s, 8, MAT(P9.giltD, { rough: 0.6 }), 0, -0.072 * s, 0));
  pivot.add(cyl(0.004, 0.004, 0.055 * s, 6, MAT(P9.woodD), 0, 0.028 * s, 0));
  pivot.userData.isLantern = true;
  return pivot;
}
/* 黑瓦卷尾翘脊坡顶（身份特征 #1，几何壳角部抬升） */
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
  /* 滴檐板（黑瓦色，前后 + 左右） */
  var eb = MAT(P9.tileD, { rough: 0.7 });
  g.add(box(w * 0.94, 0.042, 0.02, eb, 0, cl * 0.45, d / 2 + ov * 0.8));
  g.add(box(w * 0.94, 0.042, 0.02, eb, 0, cl * 0.45, -(d / 2 + ov * 0.8)));
  if (lv >= 3) {
    g.add(box(0.02, 0.042, d * 0.92, eb, w / 2 + ov * 0.8, cl * 0.45, 0));
    g.add(box(0.02, 0.042, d * 0.92, eb, -(w / 2 + ov * 0.8), cl * 0.45, 0));
  }
  /* 正脊（灰石）+ 脊端卷尾上翘 */
  var rw = w * 0.25, rs = MAT(P9.ridgeS, { rough: 0.75 });
  g.add(box(rw * 2, 0.05, 0.055, rs, 0, h + 0.018, 0));
  [-1, 1].forEach(function (s) {
    var curl = box(0.048, 0.1, 0.045, rs, s * rw, h + 0.055, 0);
    curl.rotation.z = -s * 0.55; g.add(curl);                 /* 卷尾上翘 */
    var tip = mesh(new THREE.ConeGeometry(0.02, 0.05, 10), lv >= 4 ? MAT(P9.gilt, { rough: 0.4, metal: 0.5 }) : rs);
    tip.position.set(s * (rw + 0.028), h + 0.088, 0);
    tip.rotation.z = -s * 0.9; g.add(tip);
    if (lv >= 4) {                                            /* 鎏金脊兽：基座 + 昂首 */
      var beast = grp(); beast.position.set(s * rw * 0.72, h + 0.05, 0);
      beast.add(box(0.05, 0.05, 0.04, MAT(P9.gilt, { rough: 0.4, metal: 0.5 })));
      var head = mesh(new THREE.ConeGeometry(0.022, 0.055, 10), MAT(P9.gilt, { rough: 0.4, metal: 0.5 }));
      head.rotation.z = s > 0 ? -1.2 : 1.2; head.position.set(s * 0.04, 0.012, 0);
      beast.add(head);
      g.add(beast);
    }
  });
  if (lv >= 3) {                                              /* 中央中饰 + 鎏金顶 */
    g.add(box(0.15, 0.045, 0.05, rs, 0, h + 0.055, 0));
    if (lv >= 4) g.add(cyl(0.022, 0.028, 0.032, 10, MAT(P9.gilt, { rough: 0.4, metal: 0.5 }), 0, h + 0.09, 0));
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
        var b = sph(0.016, 12, rs, sx * (-rw * 0.9 + (hw + rw * 0.9) * tt), h + (cl + lift - h) * tt, (k ? 1 : -1) * hd * tt);
        g.add(b);
      });
    });
  }
  return g;
}
/* 山墙鎏金圆镜（lv4）：环 + 微光圆心 + 十字钉 */
function medallion9() {
  var g = grp();
  var gm = std(P9.gilt, { rough: 0.4, metal: 0.5 });
  g.add(mesh(new THREE.TorusGeometry(0.07, 0.016, 8, 20), gm));
  var dm = std('#8a6428', { rough: 0.5, metal: 0.4, emissive: '#d8a848', ei: 0.2 });
  var disc = cyl(0.062, 0.062, 0.02, 16, dm); disc.rotation.x = PI / 2; g.add(disc);
  for (var k = 0; k < 2; k++) {
    var sp = box(0.104, 0.014, 0.014, gm, 0, 0, 0.012);
    sp.rotation.z = k * PI / 2; g.add(sp);
  }
  g.userData.discMat = dm;
  return g;
}
/* 前院石牌坊（身份特征 #5）：方柱 + 拱梁 + 小坡帽；匾额逐级递进 */
function paifang9(w, h, lv) {
  var g = grp(), yA = h + w / 2;
  var st = MAT(P9.stone), stL = MAT(P9.stoneL);
  g.add(box(0.11, h, 0.11, st, -w / 2 - 0.04, h / 2, 0));
  g.add(box(0.11, h, 0.11, st, w / 2 + 0.04, h / 2, 0));
  g.add(box(0.17, 0.04, 0.17, stL, -w / 2 - 0.04, 0.02, 0));
  g.add(box(0.17, 0.04, 0.17, stL, w / 2 + 0.04, 0.02, 0));
  g.add(box(0.15, 0.035, 0.15, stL, -w / 2 - 0.04, h + 0.017, 0));
  g.add(box(0.15, 0.035, 0.15, stL, w / 2 + 0.04, h + 0.017, 0));
  if (lv >= 3) {                                              /* 石拱 + 拱心石 */
    var arc = mesh(new THREE.TorusGeometry(w / 2, 0.048, 8, 16, PI), stL);
    arc.position.y = h; g.add(arc);
    g.add(box(0.05, 0.08, 0.055, st, 0, yA - 0.02, 0.05));
  } else {
    g.add(box(w + 0.2, 0.06, 0.09, stL, 0, h + 0.06, 0));     /* 石梁 */
  }
  /* 小坡帽（两坡 + 脊，檐角微翘） */
  var rise = 0.09 + w * 0.06, half = w / 2 + 0.09, capBase = yA + 0.02;
  var ang = Math.atan2(rise, half), slope = Math.sqrt(rise * rise + half * half);
  var rF = box(0.05, 0.024, slope, MAT(P9.ridgeS)); rF.rotation.x = ang; rF.position.set(0, rise / 2, half / 2); g.add(rF);
  var rB = box(0.05, 0.024, slope, MAT(P9.ridgeS)); rB.rotation.x = -ang; rB.position.set(0, rise / 2, -half / 2); g.add(rB);
  g.add(box(0.055, 0.03, half * 2 + 0.03, MAT(P9.ridgeS), 0, rise + 0.012, 0));
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
  var g = grp(), st = MAT(P9.stone, { rough: 0.8 }), stL = MAT(P9.stoneL, { rough: 0.8 });
  g.add(box(0.11, 0.035, 0.14, stD(), 0, 0.017, 0));
  g.add(box(0.075, 0.085, 0.1, st, 0, 0.075, -0.008));
  var mane = sph(0.045, 12, stL, 0, 0.13, 0.028); mane.scale.z = 0.7; g.add(mane);
  g.add(sph(0.032, 12, st, 0, 0.155, 0.052));
  put(g, sph(0.018, 12, stL, 0.02, 0.05, -0.062));
  function stD() { return MAT(P9.stoneD, { rough: 0.85 }); }
  return g;
}
/* 市集货箱：板箱 + 双果 —— 3 mesh */
function crate9() {
  var g = grp();
  g.add(box(0.16, 0.11, 0.13, MAT(P9.woodM, { rough: 0.9 }), 0, 0.055, 0));
  put(g, sph(0.032, 12, MAT(P9.fruit, { rough: 0.7 })), -0.03, 0.13, 0.01);
  put(g, sph(0.028, 12, MAT('#b8452e', { rough: 0.7 })), 0.035, 0.128, -0.02);
  return g;
}
/* 骑楼廊柱：柱础 + 柱身 + 柱头 —— 3 mesh */
function arcadeColumn(h) {
  var g = grp();
  g.add(box(0.09, 0.03, 0.09, MAT(P9.stoneD), 0, 0.015, 0));
  g.add(cyl(0.028, 0.032, h - 0.07, 10, MAT(P9.stoneL, { rough: 0.8 }), 0, h / 2, 0));
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
/* 陶盆绿植（3 mesh） */
function potPlant9(s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.07 * s, 10, MAT('#9c5a38', { rough: 0.8 }), 0, 0.035 * s, 0));
  put(g, sph(0.055 * s, 12, MAT(P9.green, { rough: 0.9 })), 0, 0.1 * s, 0);
  put(g, sph(0.035 * s, 12, MAT(P9.greenL, { rough: 0.9 })), 0.03 * s, 0.08 * s, 0.02 * s);
  return g;
}
function bush9(s, col) {
  var b = sph(0.085 * (s || 1), 12, MAT(col || P9.greenL, { rough: 0.95 }));
  b.scale.y = 0.85; return b;
}
/* 地坪：2.6×2.6（≤ 占地上限），草地双层 */
function pad9() {
  var g = grp();
  g.add(box(2.6, 0.06, 2.6, MAT(P9.lawn, { rough: 0.95 }), 0, 0.03, 0));
  g.add(box(2.42, 0.02, 2.42, MAT(P9.grass, { rough: 0.95 }), 0, 0.068, 0));
  return g;
}
/* 小人字坡（山墙后小顶，lv2） */
function miniGable9(w, rise, half) {
  var g = grp();
  var slope = Math.sqrt(rise * rise + half * half), ang = Math.atan2(rise, half);
  var rF = box(w, 0.032, slope, MAT(P9.tileD)); rF.rotation.x = ang; rF.position.set(0, rise / 2, half / 2); g.add(rF);
  var rB = box(w, 0.032, slope, MAT(P9.tileD)); rB.rotation.x = -ang; rB.position.set(0, rise / 2, -half / 2); g.add(rB);
  g.add(box(w + 0.04, 0.038, 0.055, MAT(P9.ridgeS), 0, rise + 0.014, 0));
  var sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.024, bevelEnabled: false });
  for (var sd = -1; sd <= 1; sd += 2) {
    var tp = mesh(tg, MAT(P9.brickD));
    tp.rotation.y = PI / 2 * sd; tp.position.set(sd * (w / 2 - 0.024), 0, 0);
    g.add(tp);
  }
  return g;
}

/* ============================ 4. 四阶建筑（blockout→structure→form→material） ============================ */

/* ---------- lv1 小屋：木板屋 + 板皮人字顶 + 矮石坊 + 市集杂件（~51 mesh, H≈1.0） ---------- */
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
  /* 正门 + 两侧小窗（右窗暖光 → 动画） */
  B.add(box(0.28, 0.38, 0.03, MAT(P9.woodD), 0, 0.25, 0.385));
  B.add(box(0.22, 0.32, 0.02, MAT(P9.woodM), 0, 0.23, 0.395));
  var glowM = std('#7a6248', { rough: 0.45, emissive: P9.glow, ei: 0.2 });
  [-0.32, 0.32].forEach(function (x, i) {
    B.add(box(0.24, 0.24, 0.035, MAT(P9.woodD), x, 0.32, 0.385));
    B.add(box(0.18, 0.18, 0.03, i ? glowM : MAT(P9.glaz, { rough: 0.4 }), x, 0.32, 0.391));
    B.add(box(0.2, 0.022, 0.036, MAT(P9.woodD), x, 0.32, 0.397));
    B.add(box(0.022, 0.18, 0.036, MAT(P9.woodD), x, 0.32, 0.397));
    B.add(box(0.3, 0.032, 0.055, MAT(P9.stoneL), x, 0.19, 0.4));
  });
  /* 板皮人字顶（大挑檐，山花朝左右） */
  var roof = grp(); roof.position.set(0, 0.545, 0); B.add(roof);
  var rise = 0.36, half = 0.74, slope = Math.sqrt(rise * rise + half * half) + 0.05, ang = Math.atan2(rise, half);
  var pF = plankBox(1.36, 0.035, slope, 3, 1); pF.rotation.x = ang; pF.position.set(0, rise * 0.5, half * 0.5); roof.add(pF);
  var pB = plankBox(1.36, 0.035, slope, 3, 1); pB.rotation.x = -ang; pB.position.set(0, rise * 0.5, -half * 0.5); roof.add(pB);
  roof.add(box(1.42, 0.045, 0.07, MAT(P9.plankD), 0, rise + 0.01, 0));
  var sh = new THREE.Shape();
  sh.moveTo(-0.38, 0); sh.lineTo(0.38, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
  for (var sd = -1; sd <= 1; sd += 2) {
    var tp = mesh(tg, MAT(P9.plankD));
    tp.rotation.y = PI / 2 * sd; tp.position.set(sd * 0.665, 0, 0);
    roof.add(tp);
  }
  /* 矮石坊 + 门柱 + 石板径 */
  var gw = grp(); gw.position.set(0, 0.078, 0.86); g.add(gw);
  gw.add(box(0.08, 0.34, 0.08, MAT(P9.stone), -0.26, 0.17, 0));
  gw.add(box(0.08, 0.34, 0.08, MAT(P9.stone), 0.26, 0.17, 0));
  gw.add(box(0.66, 0.055, 0.09, MAT(P9.stoneL), 0, 0.37, 0));
  gw.add(box(0.72, 0.03, 0.11, MAT(P9.stoneL), 0, 0.415, 0));
  g.add(flagPath(0.4, 0.96));
  var wl = yardWall(0.55, 0.42); wl.position.set(-0.78, 0.078, 0.6); g.add(wl);
  var wr = yardWall(0.55, -0.42); wr.position.set(0.78, 0.078, 0.6); g.add(wr);
  var gp1 = gatePost9(0.26); gp1.position.set(-0.34, 0.078, 0.64); g.add(gp1);
  var gp2 = gatePost9(0.26); gp2.position.set(0.34, 0.078, 0.64); g.add(gp2);
  /* 市集杂件：货箱 + 果筐 + 木桶 */
  var c1 = crate9(); c1.position.set(0.72, 0.078, 0.3); g.add(c1);
  var c2 = crate9(); c2.position.set(0.94, 0.078, 0.05); c2.rotation.y = 0.5; g.add(c2);
  g.add(cyl(0.05, 0.055, 0.13, 10, MAT('#5a6a74', { rough: 0.7 }), 0.95, 0.14, -0.4));
  var b1 = bush9(1.1); b1.position.set(-0.72, 0.14, 0.12); g.add(b1);
  var b2 = bush9(0.8, P9.green); b2.position.set(1.0, 0.13, -0.15); g.add(b2);
  var pp = potPlant9(0.9); pp.position.set(-0.35, 0.078, 0.52); g.add(pp);

  /* anim：暖窗呼吸（幅度克制） */
  anim(g, function (t) { glowM.emissiveIntensity = 0.2 + 0.1 * sin(t * 1.6); });
  return g;
}

/* ---------- lv2 洋房：两层砖石商铺 + 首座黑瓦卷尾顶 + 红米条纹篷 + 挂匾 + 双灯笼
   （~96 mesh, H≈1.60） ---------- */
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
  /* 一层店面：暖光橱窗 + 木门 + 红米条纹篷 */
  var shop = shopGlow9(0.5, 0.36); shop.position.set(-0.4, 0.3, 0.442); B.add(shop);
  B.add(box(0.28, 0.42, 0.035, MAT(P9.woodD), 0.22, 0.27, 0.442));
  B.add(box(0.22, 0.36, 0.024, MAT(P9.woodM), 0.22, 0.25, 0.456));
  var aw = awn9(1.3, 0.28, P9.awnA, P9.awnB); aw.position.set(0, 0.6, 0.5); B.add(aw);
  /* 二层：百叶窗 ×2（花箱）+ 檐下挂匾 */
  var w1 = shutterWindow(0.26, 0.34, { flower: true }); w1.position.set(-0.4, 0.8, 0.442); B.add(w1);
  var w2 = shutterWindow(0.26, 0.34, { flower: true }); w2.position.set(0.4, 0.8, 0.442); B.add(w2);
  var sign = textPlate9('庙', 0.11, 0.11, { bg: '#3a2c1c', fg: '#e2c274', ei: 0.15 });
  var hang = grp(); hang.position.set(0.02, 0.63, 0.5); hang.add(sign); sign.position.y = -0.075; B.add(hang);
  /* 首座黑瓦卷尾顶 */
  var roof = cnRoof9(1.34, 1.02, 0.32, 2); roof.position.set(0, 1.055, -0.02); B.add(roof);
  /* 檐角双灯笼 */
  var l1 = lantern9(1.05); l1.position.set(-0.66, 0.99, 0.46); B.add(l1);
  var l2 = lantern9(1.05); l2.position.set(0.66, 0.99, 0.46); B.add(l2);

  /* 前院：石牌坊（挂匾）+ 矮墙 + 径 + 盆栽 */
  var gw = paifang9(0.42, 0.48, 2); gw.position.set(0, 0.078, 0.88); g.add(gw);
  var yl = yardWall(0.5, 1.05); yl.position.set(-0.98, 0.078, 0.52); g.add(yl);
  var yr = yardWall(0.62, 0); yr.position.set(0.66, 0.078, 1.0); g.add(yr);
  var gpt = gatePost9(0.3); gpt.position.set(1.02, 0.078, 1.0); g.add(gpt);
  g.add(flagPath(0.4, 0.96));
  var p1 = potPlant9(1); p1.position.set(-0.36, 0.078, 0.56); g.add(p1);
  var p2 = potPlant9(0.85); p2.position.set(0.4, 0.078, 0.6); g.add(p2);
  var b1 = bush9(1.1); b1.position.set(1.0, 0.14, 0.24); g.add(b1);
  var b2 = bush9(0.8, P9.green); b2.position.set(-1.02, 0.13, -0.42); g.add(b2);
  var cr = crate9(); cr.position.set(-0.75, 0.078, 0.18); g.add(cr);

  /* anim：店窗呼吸 + 挂匾摇 + 灯笼摆（幅度克制） */
  var gm = shop.userData.glowMat;
  anim(g, function (t) { gm.emissiveIntensity = 0.5 + 0.13 * sin(t * 1.7); });
  anim(g, function (t) {
    hang.rotation.z = sin(t * 1.5) * 0.06;
    l1.rotation.z = sin(t * 1.3) * 0.07;
    l2.rotation.z = sin(t * 1.3 + 1.4) * 0.07;
  });
  return g;
}

/* ---------- lv3 大厦：三层起楼 + 骑楼柱廊 + 石栏阳台 + 蓝白篷 + 顶檐展开 + 垂脊圆珠
   + 「城隍」石匾（~143 mesh, H≈2.20） ---------- */
function lv3() {
  var g = grp(); g.name = 'prop_9_lv3';
  g.userData.kind = 'property'; g.userData.propIdx = 9; g.userData.level = 3;
  g.add(pad9());

  var B = grp(); B.position.set(0, 0.078, -0.12); g.add(B);
  B.add(box(1.56, 0.06, 1.02, MAT(P9.stoneD), 0, 0.03, 0));                       /* 勒脚 */
  /* 一层骑楼：架空层板 + 暗廊背景 + 前列三柱 */
  var arcade = box(1.4, 0.04, 0.66, MAT(P9.stoneD), 0, 0.055, 0.14); B.add(arcade); /* 廊地板 */
  var dark = box(1.44, 0.52, 0.03, MAT('#241f1a', { rough: 0.9 }), 0, 0.34, 0.28); B.add(dark);
  var body2 = brickBox(1.5, 0.98, 0.9, 3, 2); body2.position.set(0, 1.09, -0.06); B.add(body2);
  [[-0.72, 0.4], [0.72, 0.4], [-0.72, -0.52], [0.72, -0.52]].forEach(function (c) {
    var q = pilaster(1.86, c[0], c[1]); q.position.y = 0.06; B.add(q);
  });
  B.add(box(1.56, 0.038, 0.94, MAT(P9.stone), 0, 0.64, -0.06));                   /* 层线脚 ×2 */
  B.add(box(1.56, 0.038, 0.94, MAT(P9.stone), 0, 1.14, -0.06));
  B.add(box(1.58, 0.06, 0.96, MAT(P9.stoneL), 0, 1.62, -0.06));                   /* 顶檐口 */
  /* 一层：廊柱 ×3 + 市集货箱 + 两侧木门/橱窗 */
  [-0.48, 0, 0.48].forEach(function (x) {
    var col = arcadeColumn(0.56); col.position.set(x, 0.06, 0.5); B.add(col);
  });
  var cr1 = crate9(); cr1.position.set(-0.22, 0.06, 0.34); B.add(cr1);
  var cr2 = crate9(); cr2.position.set(0.26, 0.06, 0.32); cr2.rotation.y = -0.4; B.add(cr2);
  var shop = shopGlow9(0.3, 0.3); shop.position.set(-0.62, 0.33, 0.32); B.add(shop);
  /* 二层：法式百叶 + 石栏阳台 + 蓝白条纹篷 */
  var f2 = shutterWindow(0.3, 0.4, { flower: true }); f2.position.set(0, 0.92, 0.392); B.add(f2);
  var w21 = shutterWindow(0.2, 0.3); w21.position.set(-0.46, 0.92, 0.392); B.add(w21);
  var w22 = shutterWindow(0.2, 0.3); w22.position.set(0.46, 0.92, 0.392); B.add(w22);
  var bal = balustrade(1.0, 0.2, 5, MAT(P9.stoneL)); bal.position.set(0, 0.68, 0.46); B.add(bal);
  var awB = awn9(1.24, 0.26, P9.awnC, P9.awnD); awB.position.set(0, 0.74, 0.5); B.add(awB);
  /* 三层：百叶窗 ×3 + 檐下双灯笼 */
  var f3 = shutterWindow(0.26, 0.32); f3.position.set(0, 1.4, 0.392); B.add(f3);
  var w31 = shutterWindow(0.2, 0.28); w31.position.set(-0.46, 1.4, 0.392); B.add(w31);
  var w32 = shutterWindow(0.2, 0.28); w32.position.set(0.46, 1.4, 0.392); B.add(w32);
  var l1 = lantern9(1.1); l1.position.set(-0.7, 1.56, 0.44); B.add(l1);
  var l2 = lantern9(1.1); l2.position.set(0.7, 1.56, 0.44); B.add(l2);
  /* 顶檐完全展开：黑瓦卷尾顶 + 垂脊圆珠 */
  var roof = cnRoof9(1.62, 1.26, 0.46, 3); roof.position.set(0, 1.63, -0.06); B.add(roof);

  /* 前院：石牌坊（「城隍」石匾 + 拱）+ 墙 + 台阶 + 径 */
  var gw = paifang9(0.5, 0.52, 3); gw.position.set(0, 0.078, 0.88); g.add(gw);
  var y1 = yardWall(0.44, 1.05); y1.position.set(-1.04, 0.078, 0.54); g.add(y1);
  var y2 = yardWall(0.46, 0.5); y2.position.set(0.82, 0.078, 1.0); g.add(y2);
  var y3 = yardWall(0.46, -0.5); y3.position.set(1.02, 0.078, 0.6); g.add(y3);
  g.add(box(0.5, 0.028, 0.22, MAT(P9.stoneD), 0, 0.09, 0.62));                    /* 门阶 */
  g.add(flagPath(0.4, 0.96));
  var p1 = potPlant9(1); p1.position.set(-0.34, 0.078, 0.58); g.add(p1);
  var p2 = potPlant9(0.9); p2.position.set(0.36, 0.078, 0.62); g.add(p2);
  var p3 = potPlant9(1.05); p3.position.set(-0.98, 0.078, 0.16); g.add(p3);
  var b1 = bush9(1); b1.position.set(1.05, 0.14, 0.1); g.add(b1);
  var b2 = bush9(0.75, P9.green); b2.position.set(-1.08, 0.13, -0.35); g.add(b2);

  /* anim：灯笼摆 + 石匾微光（克制） */
  anim(g, function (t) {
    l1.rotation.z = sin(t * 1.25) * 0.07;
    l2.rotation.z = sin(t * 1.25 + 1.5) * 0.07;
  });
  var tm = gw.userData.tabletMat;
  if (tm) anim(g, function (t) { tm.emissiveIntensity = 0.1 + 0.1 * (0.5 + 0.5 * sin(t * 1.1)); });
  return g;
}

/* ---------- lv4 地标：四层完整地标 + 金脊兽/鎏金中饰 + 山墙鎏金圆镜 + 双层石栏
   + 鎏金匾牌坊 + 双石狮（~212 mesh, H≈2.77） ---------- */
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
  /* 一层：廊柱 ×4 + 货箱 ×3 + 暖橱窗 */
  [-0.54, -0.18, 0.18, 0.54].forEach(function (x) {
    var col = arcadeColumn(0.58); col.position.set(x, 0.07, 0.5); B.add(col);
  });
  var cr1 = crate9(); cr1.position.set(-0.32, 0.07, 0.34); B.add(cr1);
  var cr2 = crate9(); cr2.position.set(0.3, 0.07, 0.3); cr2.rotation.y = -0.5; B.add(cr2);
  var cr3 = crate9(); cr3.position.set(0.02, 0.07, 0.38); B.add(cr3);
  var shop = shopGlow9(0.34, 0.32); shop.position.set(-0.58, 0.34, 0.32); B.add(shop);
  /* 二层：法式百叶 + 石栏阳台 + 红白条纹篷 */
  var f2 = shutterWindow(0.3, 0.38, { flower: true }); f2.position.set(0, 0.95, 0.412); B.add(f2);
  var w21 = shutterWindow(0.2, 0.28); w21.position.set(-0.48, 0.95, 0.412); B.add(w21);
  var w22 = shutterWindow(0.2, 0.28); w22.position.set(0.48, 0.95, 0.412); B.add(w22);
  var bal2 = balustrade(1.04, 0.2, 4, MAT(P9.stoneL)); bal2.position.set(0, 0.71, 0.46); B.add(bal2);
  var awR = awn9(1.28, 0.25, P9.awnA, P9.awnD); awR.position.set(0, 0.77, 0.5); B.add(awR);
  /* 三层：法式百叶 + 石栏阳台 + 红篷 */
  var f3 = shutterWindow(0.28, 0.36, { flower: true }); f3.position.set(0, 1.43, 0.412); B.add(f3);
  var w31 = shutterWindow(0.2, 0.28); w31.position.set(-0.48, 1.43, 0.412); B.add(w31);
  var w32 = shutterWindow(0.2, 0.28); w32.position.set(0.48, 1.43, 0.412); B.add(w32);
  var bal3 = balustrade(1.04, 0.2, 4, MAT(P9.stoneL)); bal3.position.set(0, 1.19, 0.46); B.add(bal3);
  var awR3 = awn9(1.28, 0.25, P9.awnA, P9.awnB); awR3.position.set(0, 1.25, 0.5); B.add(awR3);
  /* 四层：百叶窗 ×3 + 檐下四灯笼 */
  var f4 = shutterWindow(0.26, 0.3); f4.position.set(0, 1.9, 0.412); B.add(f4);
  var w41 = shutterWindow(0.18, 0.26); w41.position.set(-0.48, 1.9, 0.412); B.add(w41);
  var w42 = shutterWindow(0.18, 0.26); w42.position.set(0.48, 1.9, 0.412); B.add(w42);
  var lans = [];
  [[-0.72, 0.5], [0.72, 0.5], [-0.72, 1.98], [0.72, 1.98]].forEach(function (p) {
    var l = lantern9(1.0); l.position.set(p[0], p[1], 0.42); B.add(l); lans.push(l);
  });
  /* 山墙鎏金圆镜 + 大顶：金脊兽 + 鎏金中饰 + 垂脊圆珠 */
  var med = medallion9(); med.position.set(0, 2.02, 0.45); B.add(med);
  var roof = cnRoof9(1.7, 1.34, 0.55, 4); roof.position.set(0, 2.17, -0.04); B.add(roof);

  /* 前院：鎏金匾牌坊 + 双石狮 + 台阶 ×2 + 径 */
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
  var b1 = bush9(1.1); b1.position.set(1.06, 0.14, 0.05); g.add(b1);
  var b2 = bush9(0.8, P9.green); b2.position.set(-1.1, 0.13, -0.28); g.add(b2);
  var b3 = bush9(0.7, P9.greenL); b3.position.set(1.12, 0.12, -0.5); g.add(b3);

  /* anim：四灯笼摆 + 鎏金匾流辉 + 圆镜夜光（幅度克制） */
  anim(g, function (t) {
    lans.forEach(function (l, i) { l.rotation.z = sin(t * 1.25 + i * 1.3) * 0.06; });
  });
  var tm = gw.userData.tabletMat;
  var dm = med.userData.discMat;
  anim(g, function (t) {
    if (tm) tm.emissiveIntensity = 0.15 + 0.12 * (0.5 + 0.5 * sin(t * 1.15));
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
