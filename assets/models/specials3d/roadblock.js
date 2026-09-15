/* =====================================================================================
 * 大富翁 · 富贵人生 —— 道具 3D · 路障（roadblock.js）  【v2 全局精修版】
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/asset_roadblock.png（A 字架施工路障 3/4 视图）
 * v2 精修：在 v1（41 mesh，已验收布局/配色/契约）基础上按 REFINE_SPEC 清偿细节差距，
 *          mesh 41 → 112（>2.7×，全部用于可见细节），布局/配色/朝向/导出契约不变。
 *
 *   window.Special3D.roadblock() → THREE.Group
 *   原点 = 底面中心（支脚垫/配石触地 y=0），板面长轴 = X（条纹面朝 ±Z），警示灯在 +X 端。
 *   userData.anim = [fn(t, dt)] 驱动警示灯呼吸闪烁（兼容 view3d runAnims(t,dt)）。
 *   userData.parts = 命名组件表（可点选/可拆解）。
 *
 * v2 差距清偿（对照参考图逐项）：
 *   1. 板厚倒角：板基体改圆角矩形挤出 + 双面 bevel（倒角带捕捉高光，替代 v1 纯直角 Box）
 *   2. 条纹几何精度：条纹挤出加微 bevel（棱边受光），四周留橙色包边（参考图板缘橙色露底），
 *      裁剪边界精确到 CLIP_W/CLIP_H，白/橙带宽与 60° 走向保持 v1 已验收比例
 *   3. 板面磨损掉漆：前后板面确定性散布 12+6 枚掉漆/划痕色斑（露出底漆棕 / 浅磨白）
 *   4. 六角螺栓升级：每颗螺栓 = 沉孔座圈 + 凸出六角头（v1 为单枚平贴六角柱）
 *   5. A 字架铰链销轴：每榀 A 字架在双腿之间加贯穿钢销 + 两端销帽（参考图结构惯例落实）
 *   6. 底部支脚垫：每条腿底加宽脚垫 + 垫面压板（v1 腿直接插进石堆）
 *   7. 配石堆自然化：v1 每侧 4 块同色等大岩块 → 每侧 9 块三级粒径（大/中/小）+ 5 粒碎石散落，
 *      三档沙土色分层（亮沙面/基本色/阴影褐），逐块确定性 Box3 落地微埋
 *   8. 警示灯精修：琥珀底座改双层（宽法兰盘 + 八角台，参考图双层台阶读感），
 *      法兰 4 颗 + 帽圈 6 颗紧固螺栓；灯罩改 Icosahedron(detail 1) 大三角棱面（参考图刻面读感）
 *
 * 动画（group.userData.anim = [fn(t, dt)]）：
 *   警示灯呼吸闪烁：核心 emissiveIntensity 0.35→1.40 正弦平方呼吸；
 *   红灯罩同相微光 0.18→0.40（波动 0.22 ≤ 规范 0.25，幅度克制）
 *
 * 技术约束：经典 script（无模块）；THREE r147 全局；MeshStandardMaterial
 *           （颜色 convertSRGBToLinear）；零外部图片/网络/生图 API（零纹理贴图，全几何细节）；
 *           占地 ≤1.6×1.6、总高 ≈0.985 ∈ [0.5,1.0]；零 Math.random（全部确定性表格摆布）。
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
function mesh(geo, mat, name) {
  var o = new THREE.Mesh(geo, mat);
  o.castShadow = true;
  if (name) o.name = name;
  return o;
}
function box(w, h, d, mat, x, y, z, name) {
  var o = mesh(new THREE.BoxGeometry(w, h, d), mat, name);
  o.position.set(x || 0, y || 0, z || 0);
  return o;
}
function grp(name) {
  var g = new THREE.Group();
  if (name) g.name = name;
  return g;
}
/* 挤出体统一 z 向居中修正：bevel 挤出 z 跨度 = [-bt, depth+bt] → 平移回 ±half 总厚 */
function centerZ(geo, depth, bt) { geo.translate(0, 0, -(depth / 2)); return geo; }

/* ---------- 1. 材质库（共享实例，零纹理贴图） ---------- */
var M = {
  stripeO:  std('#e87e22', { rough: 0.70 }),                      /* 条纹橙（板基体同色） */
  stripeW:  std('#efe9dc', { rough: 0.72 }),                      /* 条纹米白 */
  frame:    std('#57544e', { rough: 0.80 }),                      /* 深暖灰框架/脚垫 */
  bolt:     std('#46464a', { rough: 0.50, metal: 0.35 }),         /* 六角螺栓深钢 */
  socket:   std('#3a3a3f', { rough: 0.55, metal: 0.30 }),         /* 螺栓沉孔座圈 */
  steel:    std('#6a6a72', { rough: 0.42, metal: 0.50 }),         /* 铰链销轴亮钢 */
  amber:    std('#e8a020', { rough: 0.45 }),                      /* 灯座琥珀八角 */
  rockA:    std('#cfa76e', { rough: 0.92 }),                      /* 配石 · 亮沙面 */
  rockB:    std('#c39a62', { rough: 0.92 }),                      /* 配石 · 基本色(v1 沿用) */
  rockC:    std('#a8814f', { rough: 0.94 }),                      /* 配石 · 阴影褐 */
  chipD:    std('#9c7146', { rough: 0.88 }),                      /* 掉漆 · 露底漆棕 */
  chipL:    std('#f2ead9', { rough: 0.80 })                       /* 磨损 · 浅磨白 */
};
/* 发光材质（动画驱动，独立实例）；红罩微透，让暖光核心透出（参考图读感） */
var domeM = std('#d42525', { rough: 0.32, emissive: '#ff3a20', ei: 0.25 });
domeM.transparent = true;
domeM.opacity = 0.92;
domeM.depthWrite = true;
var coreM = std('#ff9a20', { rough: 0.40, emissive: '#ff9a20', ei: 1.1 });

/* ---------- 2. 支腿几何常量（销轴/贯穿件按同一参数推导，保证精确贯穿不悬空） ---------- */
var APEX_Y = 0.64, APEX_Z = -0.05, FOOT_FZ = 0.12, FOOT_RZ = -0.28;
var LEG_SEC = 0.09;                                   /* 方柱截面 */
function legZ(y, footZ) { return APEX_Z + (APEX_Y - y) * (footZ - APEX_Z) / APEX_Y; }

/* ---------- 3. 条纹板几何（Sutherland–Hodgman 裁剪出斜条纹多边形） ---------- */
/* 板面局部 2D：u = x ∈ [-0.75, 0.75]，v ∈ [-0.20, 0.20]（板中心 y=0.54）。
 * 条纹带法线 n = (-sin60°, cos60°)，带 k 占据 n·p ∈ [c0, c0+w)；白带 0.18 / 橙带 0.30。
 * v2：裁剪边界内缩，四周留橙色包边（参考图板缘橙底露边），并允许条纹微 bevel 外扩 0.003。 */
var N_X = -sin(PI / 3), N_Y = cos(PI / 3);            /* (-0.866, 0.5) */
var CLIP_W = 0.740, CLIP_H = 0.191;
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
  var cs = [band.c0, band.c0 + band.w], vs = [-CLIP_H - 0.01, CLIP_H + 0.01];
  var quad = [], i, j;
  for (i = 0; i < 2; i++) for (j = 0; j < 2; j++) {
    var c = cs[i], v = vs[j];
    quad.push([(N_Y * v - c) / -N_X, v]);             /* c = N_X*u + N_Y*v → u = (c - N_Y*v)/N_X */
  }
  quad = [quad[0], quad[1], quad[3], quad[2]];        /* 环序：c 小/v 小、c 小/v 大、c 大/v 大、c 大/v 小 */
  var poly2 = clipHalf(quad, 1, 0, CLIP_W);
  poly2 = clipHalf(poly2, -1, 0, CLIP_W);
  poly2 = clipHalf(poly2, 0, 1, CLIP_H);
  poly2 = clipHalf(poly2, 0, -1, CLIP_H);
  return poly2;
}
/* v2：条纹挤出加微 bevel（棱边受光，几何精度读感）；前面板 z 0.020→0.056，背面板镜像 */
function stripeMesh(band, isRear) {
  var pts = stripePoly(band);
  if (pts.length < 3) return null;
  var shape = new THREE.Shape();
  for (var i = 0; i < pts.length; i++) {
    if (i === 0) shape.moveTo(pts[i][0], pts[i][1]);
    else shape.lineTo(pts[i][0], pts[i][1]);
  }
  shape.closePath();
  var geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.028, bevelEnabled: true,
    bevelThickness: 0.004, bevelSize: 0.003, bevelSegments: 1
  });
  var m = mesh(geo, M[band.mat], isRear ? 'stripe-band-rear' : 'stripe-band-front');
  if (isRear) { m.rotation.y = PI; m.position.set(0, 0.54, -0.024); }
  else { m.position.set(0, 0.54, 0.024); }
  return m;
}

/* ---------- 4. 预制细节组件 ---------- */
/* 圆角矩形轮廓（板基体倒角基形） */
function roundedRectShape(w, h, r) {
  var s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
/* v2 螺栓：沉孔座圈(12 棱) + 凸出六角头；face = ±0.056（条纹表面） */
function boardBolt(parent, x, y, rear) {
  var sgn = rear ? -1 : 1, face = 0.056 * sgn;
  var socket = mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.014, 12), M.socket, 'bolt-socket');
  socket.rotation.x = PI / 2;
  socket.position.set(x, y, face - sgn * 0.002);
  parent.add(socket);
  var head = mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.020, 6), M.bolt, 'bolt-hex');
  head.rotation.x = PI / 2;
  head.position.set(x, y, face + sgn * 0.008);
  parent.add(head);
}
/* v2 掉漆/划痕色斑：薄片嵌入条纹表面（半嵌入不共面），确定性表格摆布 */
var CHIPS_F = [   /* [u, v, size, rotZ, 深色(露底漆)] 前板面 12 枚 */
  [-0.52,  0.12, 0.048, 0.30, 1],
  [-0.35, -0.12, 0.030, 1.20, 0],
  [-0.10,  0.14, 0.052, 0.70, 1],
  [ 0.08, -0.05, 0.028, 2.10, 1],
  [ 0.30,  0.12, 0.040, 0.20, 0],
  [ 0.55, -0.10, 0.050, 1.60, 1],
  [-0.45, -0.02, 0.026, 0.90, 0],
  [ 0.20,  0.02, 0.034, 2.70, 1],
  [ 0.68,  0.14, 0.026, 0.50, 0],
  [-0.15, -0.16, 0.024, 1.90, 1],
  [ 0.42, -0.16, 0.038, 0.10, 0],
  [-0.70, -0.14, 0.030, 2.40, 1]
];
var CHIPS_R = [   /* 背板面 6 枚（镜像逻辑，独立散布） */
  [-0.50,  0.08, 0.042, 0.80, 1],
  [ 0.15, -0.10, 0.032, 1.40, 0],
  [ 0.60,  0.12, 0.036, 2.20, 1],
  [-0.20, -0.14, 0.028, 0.40, 0],
  [ 0.38,  0.04, 0.026, 1.10, 1],
  [-0.65, -0.06, 0.034, 2.80, 0]
];
function chipUnit(tbl) {
  var m = box(tbl[2], tbl[2] * 0.72, 0.012, (tbl[4] ? M.chipD : M.chipL), tbl[0], 0.54 + tbl[1], 0, 'wear-chip');
  m.rotation.z = tbl[3];
  m.position.z = 0.056;
  return m;
}
/* v2 铰链销轴：y=0.28 高度贯穿前后腿（legZ 推导），两端销帽外露 0.004 */
function hingePinUnit(x0, name) {
  var g = grp(name);
  var zf = legZ(0.28, FOOT_FZ), zr = legZ(0.28, FOOT_RZ);       /* 0.0456 / -0.1794 */
  var zc = (zf + zr) / 2;
  var len = (zf - zr) + LEG_SEC + 0.086;                        /* 贯穿双腿 + 两端外露 */
  var pin = mesh(new THREE.CylinderGeometry(0.024, 0.024, len, 12), M.steel, 'hinge-pin');
  pin.rotation.x = PI / 2;
  pin.position.set(x0, 0.28, zc);
  g.add(pin);
  var ends = [zc - len / 2 + 0.004, zc + len / 2 - 0.004];
  for (var i = 0; i < 2; i++) {
    var cap = mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.016, 12), M.steel, 'hinge-pin-cap');
    cap.rotation.x = PI / 2;
    cap.position.set(x0, 0.28, ends[i]);
    g.add(cap);
  }
  return g;
}
/* v2 底部支脚垫：加宽垫块 + 垫面压板（腿端 0.012 悬埋入垫块内，不落地不悬空） */
function footPadUnit(x0, fz, name) {
  var g = grp(name);
  g.add(box(0.17, 0.05, 0.16, M.frame, x0, 0.025, fz, 'foot-pad'));
  g.add(box(0.12, 0.022, 0.11, M.frame, x0, 0.057, fz, 'foot-pad-top'));
  return g;
}
/* v1 沿用：A 字架（前腿 + 后腿），v2 腿端抬升 0.012 埋入脚垫 */
function bentUnit(x0, name) {
  var g = grp(name);
  var legs = [
    { fz: FOOT_FZ, nm: 'leg-front' },
    { fz: FOOT_RZ, nm: 'leg-rear' }
  ];
  for (var i = 0; i < legs.length; i++) {
    var dy = APEX_Y, dz = legs[i].fz - APEX_Z;
    var len = Math.sqrt(dy * dy + dz * dz);
    var a = Math.atan2(dz, dy);                     /* 绕 X 轴角（+Y 转向 +Z 为正） */
    var leg = box(LEG_SEC, len, LEG_SEC, M.frame, x0, APEX_Y / 2, (APEX_Z + legs[i].fz) / 2, legs[i].nm);
    leg.rotation.x = a;
    g.add(leg);
  }
  /* Box3 精确控地：腿端停于 y=0.012（埋入脚垫，触地由脚垫承担） */
  g.updateMatrixWorld(true);
  var bb = new THREE.Box3().setFromObject(g);
  g.position.y -= bb.min.y - 0.012;
  return g;
}
/* v2 配石：低模棱面岩块（确定性参数），逐块 Box3 落地微埋 -0.004（自然半埋读感）；
 * 并对 x 向做确定性钳制（|x| ≤ 0.775），保证占地 ≤1.6 契约在任意偏转下成立 */
var ROCK_X_CLAMP = 0.775;
function addRock(parent, x, z, r, sx, sy, sz, yaw, matName, nm) {
  var rock = mesh(new THREE.IcosahedronGeometry(r, 0), M[matName], nm);
  rock.scale.set(sx, sy, sz);
  rock.rotation.y = yaw;
  rock.position.set(x, r * sy, z);
  parent.add(rock);
  parent.updateMatrixWorld(true);
  var bb = new THREE.Box3().setFromObject(rock);
  rock.position.y -= bb.min.y + 0.004;
  if (bb.max.x > ROCK_X_CLAMP) rock.position.x -= bb.max.x - ROCK_X_CLAMP;
  else if (bb.min.x < -ROCK_X_CLAMP) rock.position.x += -ROCK_X_CLAMP - bb.min.x;
  return rock;
}
/* 左右配石堆表：[x, z, r, sx, sy, sz, yaw, 材质] —— 大/中/小三级粒径 + 色差分层，
 * 大石居内承重、小石滚落外侧，包围腿脚（参考图读感）；|x|+0.851·r·sx ≤ 0.775 保占地契约 */
var ROCKS_L = [
  [-0.545, 0.02, 0.165, 1.15, 0.62, 0.95, 0.35, 'rockB'],
  [-0.585, -0.10, 0.150, 1.05, 0.58, 0.95, 2.10, 'rockA'],
  [-0.44, -0.15, 0.140, 1.10, 0.60, 0.90, 4.01, 'rockC'],
  [-0.52, -0.30, 0.122, 1.05, 0.55, 0.95, 1.20, 'rockB'],
  [-0.625, -0.27, 0.105, 1.10, 0.55, 0.90, 5.30, 'rockA'],
  [-0.38,  0.08, 0.092, 1.00, 0.60, 0.90, 0.80, 'rockC'],
  [-0.655, 0.08, 0.085, 1.00, 0.58, 0.95, 3.60, 'rockB'],
  [-0.47, -0.40, 0.072, 1.05, 0.55, 0.90, 2.70, 'rockA'],
  [-0.60,  0.16, 0.068, 1.00, 0.56, 0.92, 1.75, 'rockC']
];
var ROCKS_R = [
  [ 0.56,  0.03, 0.160, 1.12, 0.60, 0.95, 1.85, 'rockA'],
  [ 0.575, -0.08, 0.148, 1.06, 0.57, 0.92, 0.60, 'rockC'],
  [ 0.43, -0.16, 0.136, 1.10, 0.60, 0.90, 3.30, 'rockB'],
  [ 0.53, -0.31, 0.120, 1.05, 0.56, 0.95, 5.00, 'rockA'],
  [ 0.625, -0.25, 0.100, 1.10, 0.55, 0.90, 2.20, 'rockB'],
  [ 0.37,  0.07, 0.090, 1.00, 0.60, 0.90, 4.40, 'rockC'],
  [ 0.645, 0.10, 0.082, 1.00, 0.58, 0.95, 1.05, 'rockA'],
  [ 0.46, -0.41, 0.070, 1.05, 0.55, 0.90, 0.40, 'rockB'],
  [ 0.59,  0.17, 0.066, 1.00, 0.56, 0.92, 2.95, 'rockC']
];
var GRAVEL_L = [[-0.40, -0.22, 0.045], [-0.68, -0.12, 0.040], [-0.50, 0.20, 0.036], [-0.63, -0.36, 0.042], [-0.35, -0.05, 0.034]];
var GRAVEL_R = [[ 0.41, -0.23, 0.042], [ 0.68, -0.13, 0.038], [ 0.49, 0.21, 0.034], [ 0.62, -0.37, 0.040], [ 0.36, -0.04, 0.036]];

/* ---------- 5. 工厂主函数 ---------- */
window.Special3D = window.Special3D || {};
window.Special3D.roadblock = function () {
  var g = grp('prop_roadblock_hifi');
  var i;

  /* ======== board-panel：条板基体（v2：圆角矩形挤出 + 双面 bevel 倒角） ======== */
  var boardPanel = grp('board-panel');
  var slabGeo = new THREE.ExtrudeGeometry(roundedRectShape(1.5, 0.40, 0.03), {
    depth: 0.056, bevelEnabled: true,
    bevelThickness: 0.012, bevelSize: 0.010, bevelSegments: 2, curveSegments: 4
  });
  centerZ(slabGeo, 0.056, 0.012);                   /* 总厚 0.08，居中 ±0.04 */
  var slab = mesh(slabGeo, M.stripeO, 'board-slab');
  slab.position.y = 0.54;
  boardPanel.add(slab);
  g.add(boardPanel);

  /* ======== stripe-band：前后各 7 条斜纹（几何硬边界 + 微 bevel 棱边） ======== */
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

  /* ======== wear-chips：板面磨损掉漆色斑（前 12 + 后 6，确定性散布） ======== */
  var wearChips = grp('wear-chips');
  for (i = 0; i < CHIPS_F.length; i++) wearChips.add(chipUnit(CHIPS_F[i]));
  for (i = 0; i < CHIPS_R.length; i++) {
    var cr = chipUnit(CHIPS_R[i]);
    cr.position.z = -0.056;
    cr.rotation.y = PI;
    wearChips.add(cr);
  }
  boardPanel.add(wearChips);

  /* ======== bolt ×8：板面四角螺栓（沉孔座圈 + 六角头，前 4 + 后 4） ======== */
  var bolts = grp('bolt');
  var bx = [-0.62, 0.62], by = [0.45, 0.63];
  for (i = 0; i < 2; i++) for (var j = 0; j < 2; j++) {
    boardBolt(bolts, bx[i], by[j], false);
    boardBolt(bolts, bx[i], by[j], true);
  }
  boardPanel.add(bolts);

  /* ======== beacon：宽法兰盘 + 八角台（双层琥珀底座）+ 底座/帽圈螺栓 + 棱面红罩 + 暖核 ======== */
  var beacon = grp('beacon');
  var flange = mesh(new THREE.CylinderGeometry(0.175, 0.185, 0.03, 8), M.amber, 'beacon-base-flange');
  flange.position.set(0.52, 0.752, 0);              /* 底面 0.737 埋入板顶 0.74 */
  beacon.add(flange);
  var oct = mesh(new THREE.CylinderGeometry(0.125, 0.140, 0.052, 8), M.amber, 'beacon-base-octagon');
  oct.position.set(0.52, 0.79, 0);                  /* 0.764–0.816，底面埋入法兰 */
  beacon.add(oct);
  for (i = 0; i < 4; i++) {                         /* 法兰盘 4 颗紧固螺栓（对角布置） */
    var ang = PI / 8 + i * PI / 2;
    var fb = mesh(new THREE.CylinderGeometry(0.017, 0.017, 0.012, 6), M.bolt, 'beacon-bolt');
    fb.position.set(0.52 + cos(ang) * 0.155, 0.769, sin(ang) * 0.155);
    beacon.add(fb);
  }
  var cap = mesh(new THREE.CylinderGeometry(0.094, 0.106, 0.05, 12), M.frame, 'beacon-cap-ring');
  cap.position.set(0.52, 0.838, 0);                 /* 0.813–0.863，底面埋入八角台 */
  beacon.add(cap);
  for (i = 0; i < 6; i++) {                         /* 帽圈顶面 6 颗小螺栓 */
    var ang2 = i * PI / 3;
    var cb = mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.012, 6), M.bolt, 'cap-bolt');
    cb.position.set(0.52 + cos(ang2) * 0.076, 0.866, sin(ang2) * 0.076);
    beacon.add(cb);
  }
  var dome = mesh(new THREE.IcosahedronGeometry(0.105, 1), domeM, 'beacon-dome');
  dome.scale.y = 0.82;                              /* 大三角棱面 + 扁球读感（参考图刻面罩） */
  dome.position.set(0.52, 0.895, 0);
  beacon.add(dome);
  var core = mesh(new THREE.IcosahedronGeometry(0.048, 0), coreM, 'beacon-core');
  core.position.set(0.52, 0.893, 0);
  beacon.add(core);
  boardPanel.add(beacon);   /* spec：beacon 挂于 board-panel（板顶 +X 端） */

  /* ======== trestle-frame：A 字架 ×2 + 铰链销轴 ×2 + 横撑 ×2 ======== */
  var trestle = grp('trestle-frame');
  var bentL = bentUnit(-0.62, 'leg-bent');
  var bentR = bentUnit(0.62, 'leg-bent-mirrored');
  trestle.add(bentL);
  trestle.add(bentR);
  /* v2：A 字架铰链销轴（贯穿前后腿，两端销帽，y=0.28 避开横撑 0.15–0.21 与板底 0.34） */
  var hingePins = grp('hinge-pins');
  hingePins.add(hingePinUnit(-0.62, 'hinge-pin-assembly-left'));
  hingePins.add(hingePinUnit(0.62, 'hinge-pin-assembly-right'));
  trestle.add(hingePins);
  /* 前横撑接前腿（y=0.18 时前腿 z≈0.072），后横撑接后腿（z≈-0.215，参考图半遮挡按惯例补齐） */
  var crossBrace = grp('cross-brace');
  var braceF = box(1.30, 0.06, 0.06, M.frame, 0, 0.18, 0.072, 'cross-brace-front');
  crossBrace.add(braceF);
  var braceR = box(1.30, 0.06, 0.06, M.frame, 0, 0.18, -0.215, 'cross-brace-rear');
  crossBrace.add(braceR);
  trestle.add(crossBrace);
  g.add(trestle);

  /* ======== foot-pads：底部支脚垫 ×4（加宽垫块 + 垫面压板） ======== */
  var footPads = grp('foot-pads');
  footPads.add(footPadUnit(-0.62, FOOT_FZ, 'foot-pad-assembly-fl'));
  footPads.add(footPadUnit(-0.62, FOOT_RZ, 'foot-pad-assembly-rl'));
  footPads.add(footPadUnit(0.62, FOOT_FZ, 'foot-pad-assembly-fr'));
  footPads.add(footPadUnit(0.62, FOOT_RZ, 'foot-pad-assembly-rr'));
  trestle.add(footPads);

  /* ======== ballast：脚线配石堆 ×2（9 岩块 + 5 碎石/侧，三级粒径 + 三档色差） ======== */
  var ballast = grp('ballast');
  var clusterL = grp('rock-cluster-left');
  var clusterR = grp('rock-cluster-right');
  for (i = 0; i < ROCKS_L.length; i++) {
    var s = ROCKS_L[i];
    addRock(clusterL, s[0], s[1], s[2], s[3], s[4], s[5], s[6], s[7], 'rock-lump-' + i);
  }
  for (i = 0; i < ROCKS_R.length; i++) {
    var s2 = ROCKS_R[i];
    addRock(clusterR, s2[0], s2[1], s2[2], s2[3], s2[4], s2[5], s2[6], s2[7], 'rock-lump-' + i);
  }
  for (i = 0; i < GRAVEL_L.length; i++) {
    var gv = GRAVEL_L[i];
    addRock(clusterL, gv[0], gv[1], gv[2], 1.0, 0.62, 0.95, 0.8 + i * 1.3, (i % 2) ? 'rockC' : 'rockB', 'gravel-bit-' + i);
  }
  for (i = 0; i < GRAVEL_R.length; i++) {
    var gv2 = GRAVEL_R[i];
    addRock(clusterR, gv2[0], gv2[1], gv2[2], 1.0, 0.62, 0.95, 2.1 + i * 1.1, (i % 2) ? 'rockA' : 'rockB', 'gravel-bit-' + i);
  }
  ballast.add(clusterL);
  ballast.add(clusterR);
  g.add(ballast);

  /* ======== interaction：警示灯呼吸闪烁（t, dt）；红罩波动 0.22 ≤ 规范 0.25 ======== */
  g.userData.anim = [
    function (t) {
      var k = Math.pow(0.5 + 0.5 * sin(t * 3.4), 2);       /* 呼吸包络（平方更柔） */
      coreM.emissiveIntensity = 0.35 + 1.05 * k;           /* 0.35 → 1.40 */
      domeM.emissiveIntensity = 0.18 + 0.22 * k;           /* 0.18 → 0.40 */
    }
  ];

  /* ======== parts 语义表（可点选/可拆解层级引用） ======== */
  g.userData.parts = {
    boardPanel: boardPanel, stripeBand: stripeBand, stripesFront: stripesFront,
    stripesRear: stripesRear, wearChips: wearChips, bolts: bolts, beacon: beacon,
    trestle: trestle, hingePins: hingePins, crossBrace: crossBrace,
    footPads: footPads, ballast: ballast, clusterL: clusterL, clusterR: clusterR
  };

  return g;
};
})();
