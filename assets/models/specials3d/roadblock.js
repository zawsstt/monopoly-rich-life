/* =====================================================================================
 * 大富翁 · 富贵人生 —— 道具 3D · 路障（roadblock.js）
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/asset_roadblock.png（A 字架施工路障 3/4 视图）
 * 规格工件：.img2threejs/spec_roadblock.json（--strict-quality PASS）
 *
 *   window.Special3D.roadblock() → THREE.Group
 *   原点 = 底面中心（支腿/配石触地 y=0），板面长轴 = X（条纹面朝 ±Z），警示灯在 +X 端。
 *   view3d.rebuildBlocks 挂到格子中心（TILE_TOP），rotation.y = sideRotY(idx)。
 *   userData.anim = [fn(t, dt)] 驱动警示灯呼吸闪烁（兼容 view3d runAnims(t,dt)）。
 *   部件层级：全部 spec 组件为命名 Group（可点选/可拆解），网格 41 ≤ 120。
 *
 * 复刻要点（以参考图为准）：
 *   - 橙白斜纹挡板：条纹为几何分板（Shape 裁剪挤出），硬边界绝不走纹理
 *   - A 字支腿 ×2：方形截面，沿深度方向前后叉开，腿顶自板后穿过
 *   - 横撑 ×2：连接前后腿对（后横撑参考图半遮挡，按结构惯例补齐）
 *   - 红色警示灯：琥珀八角底座 + 深灰帽圈 + 棱面红球罩 + 内置暖光核心（呼吸闪烁）
 *   - 六角螺栓 ×8：板面四角内嵌（前后各 4，背面按级别惯例推断）
 *   - 沙袋/碎石配重 ×2：低模棱面岩块堆在脚线处，确定性摆布（零 Math.random）
 *
 * 动画（group.userData.anim = [fn(t, dt)]）：
 *   警示灯呼吸闪烁：核心 emissiveIntensity 0.35→1.4 正弦平方呼吸，红灯罩同相微光
 *
 * 技术约束：经典 script（无模块）；THREE r147 全局；MeshStandardMaterial
 *           （颜色 convertSRGBToLinear）；零外部图片/网络/生图 API（本模型零纹理贴图）；
 *           占地 ≤1.6×1.6、总高 ≈0.96 ∈ [0.5,1.0]；零 Math.random。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[roadblock] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ---------- 0. 工具 ---------- */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex),
    roughness: (o.rough !== undefined ? o.rough : 0.6),
    metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  return m;
}
function mesh(geo, mat) {
  var o = new THREE.Mesh(geo, mat);
  o.castShadow = true;
  return o;
}
function box(w, h, d, mat, x, y, z) {
  var o = mesh(new THREE.BoxGeometry(w, h, d), mat);
  o.position.set(x || 0, y || 0, z || 0);
  return o;
}
function grp(name) {
  var g = new THREE.Group();
  if (name) g.name = name;
  return g;
}

/* ---------- 1. 材质库（共享实例，零纹理贴图） ---------- */
var M = {
  stripeO:  std('#e87e22', { rough: 0.70 }),                      /* 条纹橙 */
  stripeW:  std('#efe9dc', { rough: 0.72 }),                      /* 条纹米白 */
  frame:    std('#57544e', { rough: 0.80 }),                      /* 深暖灰框架 */
  bolt:     std('#46464a', { rough: 0.50, metal: 0.35 }),         /* 六角螺栓深钢 */
  amber:    std('#e8a020', { rough: 0.45 }),                      /* 灯座琥珀八角 */
  rock:     std('#c39a62', { rough: 0.92 })                       /* 配石沙袋土黄 */
};
/* 发光材质（动画驱动，独立实例）；红罩微透，让暖光核心透出（参考图读感） */
var domeM = std('#d42525', { rough: 0.32, emissive: '#ff3a20', ei: 0.25 });
domeM.transparent = true;
domeM.opacity = 0.92;
domeM.depthWrite = true;
var coreM = std('#ff9a20', { rough: 0.40, emissive: '#ff9a20', ei: 1.1 });

/* ---------- 2. 条纹板几何（Sutherland–Hodgman 裁剪出斜条纹多边形） ---------- */
/* 板面局部 2D：u = x ∈ [-0.75, 0.75]，v ∈ [-0.20, 0.20]（板中心 y=0.54）。
 * 条纹带法线 n = (-sin60°, cos60°)，带 k 占据 n·p ∈ [c0, c0+w)；白带 0.18 / 橙带 0.30。 */
var FACE_H = 0.20, FACE_W = 0.75;
var N_X = -sin(PI / 3), N_Y = cos(PI / 3);          /* (-0.866, 0.5) */
var BANDS = [
  { c0: -0.795, w: 0.18, mat: 'stripeW' },
  { c0: -0.615, w: 0.30, mat: 'stripeO' },
  { c0: -0.315, w: 0.18, mat: 'stripeW' },
  { c0: -0.135, w: 0.30, mat: 'stripeO' },
  { c0:  0.165, w: 0.18, mat: 'stripeW' },
  { c0:  0.345, w: 0.30, mat: 'stripeO' },
  { c0:  0.645, w: 0.18, mat: 'stripeW' }
];
/* 半平面裁剪：保留 n·p + off ≥ 0 的点 */
function clipHalf(poly, nx, ny, off) {
  if (poly.length < 3) return [];
  var out = [];
  for (var i = 0; i < poly.length; i++) {
    var a = poly[i], b = poly[(i + 1) % poly.length];
    var da = nx * a[0] + ny * a[1] + off, db = nx * b[0] + ny * b[1] + off;
    if (da >= 0) out.push(a);
    if ((da >= 0) !== (db >= 0)) {
      var t = da / (da - db);
      out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
    }
  }
  return out;
}
/* 单条条纹 → 裁剪后的板面多边形（(u,v) 点列） */
function stripePoly(band) {
  /* 带矩形四角（(c,v) 空间）→ 反解 u = (0.5v - c) / 0.866 */
  var cs = [band.c0, band.c0 + band.w], vs = [-FACE_H - 0.01, FACE_H + 0.01];
  var quad = [], i, j;
  for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) {
    var c = cs[i], v = vs[j];
    quad.push([(N_Y * v - c) / -N_X, v]);           /* c = N_X*u + N_Y*v → u = (c - N_Y*v)/N_X */
  }
  /* 排成正确环序：c 小/v 小、c 小/v 大、c 大/v 大、c 大/v 小 */
  quad = [quad[0], quad[1], quad[3], quad[2]];
  /* 裁剪 |u| ≤ FACE_W，|v| ≤ FACE_H */
  var poly2 = clipHalf(quad, 1, 0, FACE_W);
  poly2 = clipHalf(poly2, -1, 0, FACE_W);
  poly2 = clipHalf(poly2, 0, 1, FACE_H);
  poly2 = clipHalf(poly2, 0, -1, FACE_H);
  return poly2;
}
function stripeMesh(band, isRear) {
  var pts = stripePoly(band);
  if (pts.length < 3) return null;
  var shape = new THREE.Shape();
  for (var i = 0; i < pts.length; i++) {
    if (i === 0) shape.moveTo(pts[i][0], pts[i][1]);
    else shape.lineTo(pts[i][0], pts[i][1]);
  }
  shape.closePath();
  var geo = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false });
  var m = mesh(geo, M[band.mat]);
  m.name = isRear ? 'stripe-band-rear' : 'stripe-band-front';
  if (isRear) { m.rotation.y = PI; m.position.set(0, 0.54, -0.022); }
  else { m.position.set(0, 0.54, 0.022); }
  return m;
}

/* ---------- 3. 预制组件 ---------- */
/* 六角螺栓：6 棱柱，轴向 = 面法线(z) */
function boltUnit(x, y, z) {
  var b = mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.016, 6), M.bolt);
  b.name = 'bolt-hex';
  b.rotation.x = PI / 2;
  b.position.set(x, y, z);
  return b;
}
/* A 字架（bent）：前腿 + 后腿 ×2 根方柱（0.09 截面），Box3 精确落地。
 * 腿顶 (x0,0.70,-0.05) 藏于板背上部（参考图：长腿自板顶后方直达地面）；
 * 前腿近直立（脚 z+0.12，越过板面前缘(+0.04)的高度 ≈0.33 < 板底 0.34，不穿条纹面），
 * 后腿向后叉开（脚 z-0.28），构成 A 字读感。 */
function bentUnit(x0, name) {
  var g = grp(name);
  var apexY = 0.64, apexZ = -0.05;
  var legs = [
    { fz: 0.12, nm: 'leg-front' },
    { fz: -0.28, nm: 'leg-rear' }
  ];
  for (var i = 0; i < legs.length; i++) {
    var dy = apexY, dz = legs[i].fz - apexZ;
    var len = Math.sqrt(dy * dy + dz * dz);
    var a = Math.atan2(dz, dy);                     /* 绕 X 轴角（+Y 转向 +Z 为正） */
    var leg = box(0.09, len, 0.09, M.frame, x0, apexY / 2, (apexZ + legs[i].fz) / 2);
    leg.name = legs[i].nm;
    leg.rotation.x = a;
    g.add(leg);
  }
  /* Box3 精确落地：整体抬升使世界 minY = 0 */
  g.updateMatrixWorld(true);
  var bb = new THREE.Box3().setFromObject(g);
  g.position.y -= bb.min.y;
  return g;
}
/* 配石堆：4 块大低模棱面岩块（确定性参数，零 Math.random），轻微埋地、环抱腿脚 */
function rockCluster(x0, name) {
  var g = grp(name);
  var specs = [
    { ox: 0.06, oz: 0.10, r: 0.150, sq: 0.55, yaw: 0.0 },
    { ox: -0.06, oz: -0.02, r: 0.140, sq: 0.62, yaw: 1.7 },
    { ox: -0.02, oz: -0.16, r: 0.130, sq: 0.50, yaw: 3.1 },
    { ox: 0.0, oz: -0.30, r: 0.120, sq: 0.60, yaw: 4.6 }
  ];
  for (var i = 0; i < specs.length; i++) {
    var s = specs[i];
    var rock = mesh(new THREE.IcosahedronGeometry(s.r, 0), M.rock);
    rock.name = 'rock-lump-' + i;
    rock.scale.set(1.1, s.sq, 0.95);
    rock.rotation.y = s.yaw;
    rock.position.set(x0 + s.ox, s.r * s.sq * 0.85, s.oz);
    g.add(rock);
  }
  return g;
}

/* ---------- 4. 工厂主函数 ---------- */
window.Special3D = window.Special3D || {};
window.Special3D.roadblock = function () {
  var g = grp('prop_roadblock_hifi');
  var i;

  /* ======== board-panel：条板基体（blockout 主质量） ======== */
  var boardPanel = grp('board-panel');
  var slab = box(1.5, 0.40, 0.08, M.stripeO, 0, 0.54, 0);
  slab.name = 'board-slab';
  boardPanel.add(slab);
  g.add(boardPanel);

  /* ======== stripe-band：前后各 7 条斜纹（几何硬边界，非纹理） ======== */
  var stripeBand = grp('stripe-band');
  var stripesFront = grp('stripe-band-front');
  var stripesRear = grp('stripe-band-rear');
  for (i = 0; i < BANDS.length; i++) {
    var sf = stripeMesh(BANDS[i], false);
    if (sf) stripesFront.add(sf);
    var sr = stripeMesh(BANDS[i], true);
    if (sr) stripesRear.add(sr);
  }
  stripeBand.add(stripesFront);
  stripeBand.add(stripesRear);
  boardPanel.add(stripeBand);

  /* ======== bolt ×8：板面四角六角螺栓 ======== */
  var bolts = grp('bolt');
  var bx = [-0.62, 0.62], by = [0.45, 0.63];
  for (i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
    bolts.add(boltUnit(bx[i], by[j], 0.047));
    var rear = boltUnit(bx[i], by[j], -0.047);
    rear.rotation.x = -PI / 2;
    bolts.add(rear);
  }
  boardPanel.add(bolts);

  /* ======== trestle-frame：A 字架 ×2 + 横撑 ×2 ======== */
  var trestle = grp('trestle-frame');
  var bentL = bentUnit(-0.62, 'leg-bent');
  var bentR = bentUnit(0.62, 'leg-bent-mirrored');
  trestle.add(bentL);
  trestle.add(bentR);
  /* 前横撑接前腿（y=0.18 时前腿 z≈0.076），后横撑接后腿（z≈-0.221，参考图半遮挡按惯例补齐） */
  var crossBrace = grp('cross-brace');
  var braceF = box(1.30, 0.06, 0.06, M.frame, 0, 0.18, 0.076);
  braceF.name = 'cross-brace-front';
  crossBrace.add(braceF);
  var braceR = box(1.30, 0.06, 0.06, M.frame, 0, 0.18, -0.221);
  braceR.name = 'cross-brace-rear';
  crossBrace.add(braceR);
  trestle.add(crossBrace);
  g.add(trestle);

  /* ======== beacon：琥珀八角底座 + 深灰帽圈 + 棱面红罩（微透）+ 暖光核心 ======== */
  var beacon = grp('beacon');
  var oct = mesh(new THREE.CylinderGeometry(0.135, 0.155, 0.06, 8), M.amber);
  oct.name = 'beacon-base-octagon';
  oct.position.set(0.52, 0.77, 0);
  beacon.add(oct);
  var cap = mesh(new THREE.CylinderGeometry(0.098, 0.108, 0.045, 10), M.frame);
  cap.name = 'beacon-cap-ring';
  cap.position.set(0.52, 0.8325, 0);
  beacon.add(cap);
  var dome = mesh(new THREE.SphereGeometry(0.105, 10, 7), domeM);
  dome.name = 'beacon-dome';
  dome.scale.y = 0.82;
  dome.position.set(0.52, 0.905, 0);
  beacon.add(dome);
  var core = mesh(new THREE.SphereGeometry(0.05, 8, 6), coreM);
  core.name = 'beacon-core';
  core.position.set(0.52, 0.9, 0);
  beacon.add(core);
  boardPanel.add(beacon);   /* spec：beacon 挂于 board-panel（板顶 +X 端） */

  /* ======== ballast：脚线配石堆 ×2 ======== */
  var ballast = grp('ballast');
  ballast.add(rockCluster(-0.56, 'rock-cluster-left'));
  ballast.add(rockCluster(0.56, 'rock-cluster-right'));
  g.add(ballast);

  /* ======== interaction：警示灯呼吸闪烁（t, dt） ======== */
  g.userData.anim = [
    function (t) {
      var k = Math.pow(0.5 + 0.5 * sin(t * 3.4), 2);       /* 呼吸包络（平方更柔） */
      coreM.emissiveIntensity = 0.35 + 1.05 * k;
      domeM.emissiveIntensity = 0.15 + 0.35 * k;
    }
  ];

  /* ======== parts 语义表（可点选/可拆解层级引用） ======== */
  g.userData.parts = {
    boardPanel: boardPanel, stripeBand: stripeBand, stripesFront: stripesFront,
    stripesRear: stripesRear, bolts: bolts, trestle: trestle, beacon: beacon, ballast: ballast
  };

  return g;
};
})();
