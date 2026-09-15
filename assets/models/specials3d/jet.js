/* =====================================================================================
 * 大富翁 · 富贵人生 —— 载具 3D · 私人飞机（jet.js）【v2 全局精修版】
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/asset_private_jet.png（流线商务机 正前左 3/4 视图）
 * 规格工件：.img2threejs/spec_jet.json（v1 --strict-quality PASS）→ v2 精修迭代
 *
 *   window.Special3D.jet() → THREE.Group
 *   原点 = 机底中心（收起起落架的腹线 y=0，悬停姿态由 view3d.rideStart baseY 提供），
 *   机头朝 +Z，飞机自身左侧（左舷 PORT）为 +X。
 *   view3d 会整体放大（Box3 归一化 ~2.5）并按行进方向旋转；userData.anim=[fn(t,dt)] 驱动航行灯。
 *   部件层级：全部为命名 Group（可点选/可拆解），网格 ~212 ≤ 300。
 *
 * 复刻要点（以参考图为准，v2 精修项加 ▲）：
 *   - 流线机身：▲ 20 站位分段旋成体（Lathe 20 棱面 + 纵向 0.95 卵形缩放），暖白漆面
 *     ▲ 站位严格落在 v1 原线性插值上（radiusAt/flankX 连续性不变，窗/门/条带位置零漂移）
 *   - 金色语言：▲ 金鼻尖环带+锥帽两段式 / 风挡厚金框 / 舷窗金圈 / 全展金前缘（机翼+平尾）/
 *     金翼梢 / 发动机金唇 + 金尾环 / 垂尾金顶盖 + ▲ 垂尾后缘暗金条
 *   - 驾驶舱风挡：4 块琥珀金玻璃（2 正前 + 2 侧窗）+ 中央金立柱，包裹式贴脊
 *     ▲ 右前风挡加雨刮（钢色刮臂 + 枢轴座，贴玻璃面局部坐标装配）
 *   - 舷窗带：每侧 7 只 ▲ 金圈双环（外亮金八棱圈 + 内阴影金圈 + 暗色玻璃座 + 琥珀玻璃）
 *   - ▲ 舱门凹槽：门皮 + 四面金框 + 框内暗色槽衬 + 门后缘 3 枚铰链扣（登机梯舱门铰链线）
 *   - 蓝色腰线：舷窗下沿双侧蓝带 + 平行金细线，经机鼻下方环包（1.5π 圆环弧），
 *     机尾段上扬接入垂尾前缘蓝条；短舱外侧带短蓝条
 *   - 主翼：低置后掠（前缘后掠 ~31°，根弦 0.75 / 端弦 0.22）+ 4° 上反，挤出成形，
 *     全展金前缘条 + 金翼梢小翼；左右为真镜像（重建 Shape，不用负缩放翻面）
 *     ▲ 翼尖航行灯座（暗金流线短舱罩，红/绿灯透镜嵌于外端）
 *   - 发动机：两具后机身两侧短舱（▲16 段圆柱），▲ 金进气唇口加厚 + 暗色进气道内壁筒 +
 *     ▲ 风扇叶加密 7→13 片 + 风扇盘 + ▲ 整流罩锥 + 静子盘 + 金尾环 + 暗尾塞 + 白吊架 + 外侧蓝条
 *   - 尾翼：后掠垂直尾翼（蓝前缘条双面 + 金顶盖 + ▲ 暗金后缘条）
 *     + T 形平尾（全展金前缘 + 金翼尖 + ▲ 升降舵铰链缝线 + ▲ 升降舵后段（微偏转）
 *     + ▲ 升降舵配平片）
 *   - ▲ 蒙皮接缝线：机身 6 道环向凸细缝（翼根前后/中筒/尾锥），低模面板读感
 *   - 登机梯收起态：左门前下方折叠贴合金蓝舱条（参考图停机态为展开梯，交付为飞行态）
 *   - 起落架收起：腹线 3 块平齐舱门（前 1 + 主 2），金色铰链提示
 *   - 航行灯：左舷红（+X）/ 右舷绿（-X）/ 尾白
 *
 * 动画（group.userData.anim = [fn(t, dt)]，v2 保持不变）：
 *   1) 航行灯红绿交替发光（emissiveIntensity 相位切换，克制幅度）
 *   2) 机窗微光缓脉动（cabinGlass emissive 慢正弦）
 *
 * 技术约束：经典 script（无模块）；THREE r147 全局；MeshStandardMaterial
 *           （颜色 convertSRGBToLinear）；零纹理（纯实体 albedo，无需 Canvas）；
 *           圆柱/旋成体段数 ≥12；零 Math.random。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[jet] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ---------- 0. 工具 ---------- */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex),
    roughness: (o.rough !== undefined ? o.rough : 0.5),
    metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.opacity !== undefined) { m.transparent = true; m.opacity = o.opacity; }
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
function put(parent, o, x, y, z) {
  if (x !== undefined || y !== undefined || z !== undefined) {
    o.position.set(x || 0, y || 0, z || 0);
  }
  parent.add(o);
  return o;
}

/* ---------- 1. 材质库（共享实例，零纹理） ---------- */
var M = {
  paintW:  std('#f0eee7', { rough: 0.42, metal: 0.04 }),            /* 暖白机身漆 */
  paintS:  std('#e2ded2', { rough: 0.5,  metal: 0.03 }),            /* 腹部暖影白 */
  seam:    std('#d5d1c3', { rough: 0.60, metal: 0.02 }),            /* ▲ 蒙皮接缝线 */
  gold:    std('#d8a442', { rough: 0.30, metal: 0.85 }),            /* 签名金 */
  goldD:   std('#b28026', { rough: 0.38, metal: 0.8  }),            /* 阴影金 */
  blue:    std('#1f5ab2', { rough: 0.40, metal: 0.15 }),            /* 宝蓝腰线 */
  canopy:  std('#d4a03e', { rough: 0.14, metal: 0.1, opacity: 0.82 }), /* 琥珀风挡玻璃 */
  cabin:   std('#c89b4a', { rough: 0.20, metal: 0.05, emissive: '#8a5f18', ei: 0.18 }), /* 舷窗琥珀玻璃 */
  fanK:    std('#26282c', { rough: 0.55, metal: 0.5  }),            /* 风扇暗钢 */
  steelK:  std('#383632', { rough: 0.45, metal: 0.6  }),            /* 尾塞/雨刮暗钢 */
  navRed:  std('#c0392e', { rough: 0.25, emissive: '#ff3222', ei: 0.22 }),
  navGrn:  std('#2e9e48', { rough: 0.25, emissive: '#2eff55', ei: 0.22 }),
  navWht:  std('#edf0f2', { rough: 0.30, emissive: '#fff2cc', ei: 0.30 })
};

/* ---------- 2. 机身旋成体剖面（站位 z / 半径） ---------- */
/* 原点=机底中心 → 机身中轴线 yc = maxR * 0.95（卵形纵向缩放后腹线恰好落在 y=0）
 * v2：20 站位加密（v1 12 站位），全部新站位严格落在 v1 相邻原站位的线性插值上，
 *     radiusAt(z) 处处不变 → 舷窗/舱门/腰线的 flankX 贴面零漂移。 */
var HULL_YC = 0.285, HULL_SY = 0.95;
var HULL = [
  [-1.12, 0.105], [-1.06, 0.125], [-0.96, 0.155], [-0.82, 0.19], [-0.70, 0.217],
  [-0.62, 0.235], [-0.48, 0.2557], [-0.35, 0.275], [-0.17, 0.2879], [0.00, 0.30],
  [0.18, 0.30], [0.35, 0.30], [0.50, 0.2906], [0.62, 0.283], [0.74, 0.258],
  [0.85, 0.235], [0.94, 0.2032], [1.02, 0.175], [1.09, 0.1079], [1.14, 0.06]
];
function radiusAt(z) {
  var i, a, b;
  if (z <= HULL[0][0]) return HULL[0][1];
  for (i = 0; i < HULL.length - 1; i++) {
    a = HULL[i]; b = HULL[i + 1];
    if (z >= a[0] && z <= b[0]) {
      return a[1] + (b[1] - a[1]) * ((z - a[0]) / (b[0] - a[0]));
    }
  }
  return HULL[HULL.length - 1][1];
}
/* 侧壁 x：给定站位 z 与高度 y，返回卵形截面侧壁半宽（含少量内嵌系数） */
function flankX(z, y, inset) {
  var r = radiusAt(z) * (inset || 1);
  var dy = (y - HULL_YC) / (r * HULL_SY);
  var k = 1 - dy * dy;
  return k > 0.05 ? r * Math.sqrt(k) : r * 0.224;
}

/* ---------- 3. 预制组件 ---------- */
/* ▲ 舷窗单元 v2：四层同心（轴向 X）——
 *   外八棱亮金圈（12 段）→ 内阴影金圈（双环读感）→ 暗色玻璃座（凹陷深度）→ 琥珀玻璃镜片 */
var rimGeo, rim2Geo, seatGeo, lensGeo;
function windowUnit(x, y, z) {
  var g = grp('window-unit');
  if (!rimGeo) {
    rimGeo = new THREE.CylinderGeometry(0.037, 0.037, 0.016, 12);
    rimGeo.rotateZ(PI / 2);
    rim2Geo = new THREE.CylinderGeometry(0.0295, 0.0295, 0.021, 12);
    rim2Geo.rotateZ(PI / 2);
    seatGeo = new THREE.CylinderGeometry(0.0292, 0.0292, 0.019, 12);
    seatGeo.rotateZ(PI / 2);
    lensGeo = new THREE.CylinderGeometry(0.0228, 0.0228, 0.014, 12);
    lensGeo.rotateZ(PI / 2);
  }
  var rim = mesh(rimGeo, M.gold);
  rim.name = 'window-rim-outer';
  g.add(rim);
  var rim2 = mesh(rim2Geo, M.goldD);
  rim2.name = 'window-rim-inner';
  g.add(rim2);
  var seat = mesh(seatGeo, M.fanK);
  seat.name = 'window-glass-seat';
  g.add(seat);
  var lens = mesh(lensGeo, M.cabin);
  lens.name = 'window-glass';
  lens.position.x = -0.004;                      /* 玻璃外端面凹进座圈之内 */
  g.add(lens);
  g.position.set(x, y, z);
  return g;
}
/* 风挡玻璃单元：金背板（微大）+ 琥珀玻璃，成组后按法线姿态摆放。 */
function canopyPane(w, h, rx, ry, x, y, z) {
  var g = grp('canopy-pane');
  var plate = box(w + 0.022, h + 0.022, 0.014, M.gold, 0, 0, 0);
  plate.name = 'pane-frame';
  g.add(plate);
  var glass = box(w, h, 0.012, M.canopy, 0, 0, 0.011);
  glass.name = 'pane-glass';
  g.add(glass);
  g.rotation.set(rx, ry, 0);
  g.position.set(x, y, z);
  return g;
}
/* 后掠翼面 Shape（shape-x=展向, shape-y=前后, +y 朝机头），挤出为薄板。 */
function planformGeo(pts, thickness) {
  var sh = new THREE.Shape();
  sh.moveTo(pts[0][0], pts[0][1]);
  var i;
  for (i = 1; i < pts.length; i++) sh.lineTo(pts[i][0], pts[i][1]);
  sh.closePath();
  var geo = new THREE.ExtrudeGeometry(sh, { depth: thickness, bevelEnabled: false });
  geo.rotateX(PI / 2);            /* shape-y → +Z（+y=前），厚度沿 Y 展开 */
  geo.translate(0, thickness / 2, 0);
  return geo;
}
/* ▲ 蒙皮环向接缝：环面贴机身站位（Tube 外缘凸出棱面弦面 ~0.005，无 z-fighting）。
 * 327° 弧段、缺口居中于机腹正下方——参考图蒙皮缝只在侧/背readable，且保证
 * 机底腹线 hover-clean（minY≈0，接缝不外凸成最低点）。 */
function seamRing(z) {
  var geo = new THREE.TorusGeometry(radiusAt(z) + 0.0025, 0.0055, 5, 22, PI * 1.83);
  geo.rotateZ(-PI * 0.415);                      /* 缺口（0.17π）对准机腹 -Y */
  geo.scale(1, HULL_SY, 1);
  var m = mesh(geo, M.seam);
  m.name = 'skin-seam';
  m.position.set(0, HULL_YC, z);
  return m;
}
/* 发动机短舱 v2（s=+1 左舷 / -1 右舷）：
 * 短舱体 + ▲加厚金唇 + ▲暗色进气道内壁筒 + 风扇盘 + ▲13 片风扇叶 + 整流锥
 * + ▲静子盘 + 金尾环 + 尾塞 + 吊架 + 蓝条。 */
var bladeGeo;
function engineUnit(s) {
  var g = grp('engine-unit');
  var nac = mesh(new THREE.CylinderGeometry(0.125, 0.105, 0.52, 16), M.paintW);
  nac.name = 'nacelle-body';
  nac.rotation.x = PI / 2;
  g.add(nac);
  var lip = mesh(new THREE.TorusGeometry(0.117, 0.03, 8, 18), M.gold);
  lip.name = 'intake-lip-gold';
  lip.position.z = 0.252;
  g.add(lip);
  var duct = mesh(new THREE.CylinderGeometry(0.099, 0.092, 0.085, 16, 1, true), M.fanK);
  duct.name = 'intake-duct';
  duct.rotation.x = PI / 2;
  duct.position.z = 0.222;
  g.add(duct);
  var disc = mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.014, 14), M.fanK);
  disc.name = 'fan-disc';
  disc.rotation.x = PI / 2;
  disc.position.z = 0.20;
  g.add(disc);
  if (!bladeGeo) bladeGeo = new THREE.BoxGeometry(0.011, 0.07, 0.006);
  var i, holder, blade;
  for (i = 0; i < 13; i++) {
    holder = grp('fan-blade-' + i);
    holder.rotation.z = (i / 13) * PI * 2;
    blade = mesh(bladeGeo, M.fanK);
    blade.position.y = 0.048;
    blade.rotation.x = 0.5;
    holder.add(blade);
    holder.position.z = 0.196;
    g.add(holder);
  }
  var spin = mesh(new THREE.ConeGeometry(0.024, 0.046, 12), M.fanK);
  spin.name = 'fan-spinner';
  spin.rotation.x = PI / 2;
  spin.position.z = 0.208;
  g.add(spin);
  var stator = mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.01, 14), M.steelK);
  stator.name = 'fan-stator';
  stator.rotation.x = PI / 2;
  stator.position.z = 0.15;
  g.add(stator);
  var exR = mesh(new THREE.TorusGeometry(0.092, 0.013, 6, 14), M.gold);
  exR.name = 'exhaust-ring-gold';
  exR.position.z = -0.26;
  g.add(exR);
  var plug = mesh(new THREE.ConeGeometry(0.05, 0.1, 12), M.steelK);
  plug.name = 'exhaust-plug';
  plug.rotation.x = -PI / 2;
  plug.position.z = -0.27;
  g.add(plug);
  var pylon = box(0.05, 0.16, 0.3, M.paintW, -s * 0.1, -0.03, 0.02);
  pylon.name = 'pylon';
  g.add(pylon);
  var stripe = box(0.012, 0.042, 0.36, M.blue, s * 0.118, 0.005, 0);
  stripe.name = 'nacelle-stripe-blue';
  g.add(stripe);
  g.position.set(s * 0.40, 0.34, -0.55);
  return g;
}

/* ---------- 4. 工厂主函数 ---------- */
window.Special3D = window.Special3D || {};
window.Special3D.jet = function () {
  var g = grp('prop_jet_hifi');
  var i, s, zz;

  /* ======== fuselage：流线旋成体机身（▲20 站位 × 20 棱面，卵形 y0.95） ======== */
  var fuselage = grp('fuselage');
  var lathePts = [];
  for (i = 0; i < HULL.length; i++) {
    lathePts.push(new THREE.Vector2(HULL[i][1], HULL[i][0]));
  }
  var hullGeo = new THREE.LatheGeometry(lathePts, 20);
  hullGeo.rotateX(PI / 2);                       /* +Y(鼻) → +Z */
  hullGeo.scale(1, HULL_SY, 1);
  hullGeo.translate(0, HULL_YC, 0);
  var hull = mesh(hullGeo, M.paintW);
  hull.name = 'hull-revolve';
  fuselage.add(hull);
  g.add(fuselage);

  /* ======== nose-cap / tailcone：▲金鼻环带+锥帽两段式 + 暗尾塞 ======== */
  var noseCap = grp('nose-cap');
  var nband = mesh(new THREE.TorusGeometry(0.121, 0.011, 6, 16), M.gold);
  nband.name = 'nose-gold-band';
  nband.scale.set(1, HULL_SY, 1);
  nband.position.set(0, HULL_YC, 1.075);
  noseCap.add(nband);
  var ncap = mesh(new THREE.CylinderGeometry(0.012, 0.10, 0.085, 12), M.gold);
  ncap.name = 'nose-gold-cone';
  ncap.rotation.x = PI / 2;
  ncap.position.set(0, HULL_YC - 0.008, 1.155);
  noseCap.add(ncap);
  g.add(noseCap);
  var tailcone = grp('tailcone');
  var tplug = mesh(new THREE.ConeGeometry(0.055, 0.1, 12), M.steelK);
  tplug.name = 'tail-exhaust-plug';
  tplug.rotation.x = -PI / 2;
  tplug.position.set(0, HULL_YC, -1.1);
  tailcone.add(tplug);
  g.add(tailcone);

  /* ======== cockpit-canopy：4 块琥珀玻璃 + 厚金框 + ▲雨刮（骑在鼻脊上） ======== */
  var canopy = grp('cockpit-canopy');
  var cpF = canopyPane(0.22, 0.135, -0.55, -0.16, 0.108, 0.525, 0.72);
  cpF.name = 'pane-fwd-port';
  canopy.add(cpF);
  var cpF2 = canopyPane(0.22, 0.135, -0.55, 0.16, -0.108, 0.525, 0.72);
  cpF2.name = 'pane-fwd-stbd';
  canopy.add(cpF2);
  var cpS = canopyPane(0.17, 0.125, -0.35, -0.78, 0.208, 0.472, 0.575);
  cpS.name = 'pane-side-port';
  canopy.add(cpS);
  var cpS2 = canopyPane(0.17, 0.125, -0.35, 0.78, -0.208, 0.472, 0.575);
  cpS2.name = 'pane-side-stbd';
  canopy.add(cpS2);
  var post = box(0.016, 0.15, 0.016, M.gold, 0, 0.54, 0.635);
  post.name = 'canopy-center-post';
  post.rotation.x = -0.55;
  canopy.add(post);
  /* ▲ 风挡雨刮：装配在左前玻璃组的局部坐标系（贴玻璃外表面，随玻璃姿态定位）
   * 局部：玻璃外表面 z≈0.017，下沿 y≈-0.0675。刮臂斜搁 + 枢轴座贴下框。 */
  var wiperArm = box(0.17, 0.0045, 0.006, M.steelK, 0.045, -0.052, 0.024);
  wiperArm.name = 'canopy-wiper-arm';
  wiperArm.rotation.z = -0.22;
  cpF.add(wiperArm);
  var wiperBase = box(0.02, 0.012, 0.014, M.steelK, -0.05, -0.068, 0.02);
  wiperBase.name = 'canopy-wiper-base';
  cpF.add(wiperBase);
  g.add(canopy);

  /* ======== door：左前登机门 v2（关闭态：门皮+金框+▲框内槽衬+▲后缘铰链扣） ======== */
  var door = grp('door');
  var dSkin = box(0.014, 0.29, 0.175, M.paintW, 0, 0, 0);
  dSkin.name = 'door-skin';
  dSkin.position.set(flankX(0.36, 0.34, 0.985) + 0.004, 0.34, 0.36);
  door.add(dSkin);
  /* ▲ 槽衬：紧贴机身的暗金细框，读出「门框内凹一圈」的槽 */
  var dSlotA = box(0.008, 0.34, 0.012, M.goldD, 0, 0, 0);
  dSlotA.name = 'door-slot-lining';
  dSlotA.position.set(flankX(0.26, 0.34, 0.985) + 0.001, 0.34, 0.256);
  door.add(dSlotA);
  var dSlotF = box(0.008, 0.34, 0.012, M.goldD, 0, 0, 0);
  dSlotF.name = 'door-slot-lining';
  dSlotF.position.set(flankX(0.46, 0.34, 0.985) + 0.001, 0.34, 0.464);
  door.add(dSlotF);
  var dSlotT = box(0.008, 0.012, 0.22, M.goldD, 0, 0, 0);
  dSlotT.name = 'door-slot-lining';
  dSlotT.position.set(flankX(0.36, 0.499, 0.985) + 0.001, 0.499, 0.36);
  door.add(dSlotT);
  var dSlotB = box(0.008, 0.012, 0.22, M.goldD, 0, 0, 0);
  dSlotB.name = 'door-slot-lining';
  dSlotB.position.set(flankX(0.36, 0.181, 0.985) + 0.001, 0.181, 0.36);
  door.add(dSlotB);
  var dFrameA = box(0.014, 0.33, 0.02, M.gold, 0, 0, 0);
  dFrameA.name = 'door-frame-aft';
  dFrameA.position.set(flankX(0.26, 0.34, 0.985) + 0.006, 0.34, 0.262);
  door.add(dFrameA);
  var dFrameT = box(0.014, 0.02, 0.20, M.gold, 0, 0, 0);
  dFrameT.name = 'door-frame-top';
  dFrameT.position.set(flankX(0.36, 0.495, 0.985) + 0.006, 0.495, 0.36);
  door.add(dFrameT);
  var dFrameF = box(0.014, 0.33, 0.02, M.gold, 0, 0, 0);
  dFrameF.name = 'door-frame-fwd';
  dFrameF.position.set(flankX(0.46, 0.34, 0.985) + 0.006, 0.34, 0.458);
  door.add(dFrameF);
  var dFrameB = box(0.014, 0.02, 0.20, M.gold, 0, 0, 0);
  dFrameB.name = 'door-frame-bottom';
  dFrameB.position.set(flankX(0.36, 0.185, 0.985) + 0.006, 0.185, 0.36);
  door.add(dFrameB);
  /* ▲ 登机梯舱门铰链线：后缘 3 枚暗金铰链扣（等距） */
  var hingeY = [0.245, 0.34, 0.435];
  for (i = 0; i < 3; i++) {
    var dHinge = box(0.018, 0.016, 0.014, M.goldD, 0, 0, 0);
    dHinge.name = 'door-hinge-pin';
    dHinge.position.set(flankX(0.26, hingeY[i], 0.985) + 0.012, hingeY[i], 0.262);
    door.add(dHinge);
  }
  g.add(door);

  /* ======== cabin-windows：每侧 7 只 ▲金圈双环琥珀窗（跨翼根均匀排布） ======== */
  var cabinWindows = grp('cabin-windows');
  var winZ = [0.18, 0.047, -0.087, -0.22, -0.353, -0.487, -0.62];
  for (s = -1; s <= 1; s += 2) {
    for (i = 0; i < winZ.length; i++) {
      var wu = windowUnit(s * (flankX(winZ[i], 0.375, 0.97) + 0.002), 0.375, winZ[i]);
      wu.name = 'cabin-window';
      cabinWindows.add(wu);
    }
  }
  g.add(cabinWindows);

  /* ======== livery-stripe：蓝腰线 + 金细线（机鼻下环包 / 双侧 / 尾段上扬 / 垂尾 / 短舱） ======== */
  var livery = grp('livery-stripe');
  function bandSeg(len, h, thick, mat, sx, y, z, yaw, pitch, roll, name) {
    var b = box(thick, h, len, mat, sx * (flankX(z, y, 0.965) + thick * 0.5 - 0.012), y, z);
    b.rotation.set(pitch || 0, yaw || 0, roll || 0);
    b.name = name;
    return b;
  }
  var zEdge = [0.78, 0.60, 0.42, 0.24, 0.06, -0.12, -0.30, -0.43, -0.55];
  for (s = -1; s <= 1; s += 2) {
    var yawPrev = 0, yaw2Prev = 0;
    for (i = 0; i < zEdge.length - 1; i++) {
      var zm = (zEdge[i] + zEdge[i + 1]) / 2;
      var dz = zEdge[i + 1] - zEdge[i];
      var yaw = Math.atan((flankX(zEdge[i + 1], 0.315, 0.965) - flankX(zEdge[i], 0.315, 0.965)) / dz);
      /* 相邻段朝向突变（锥段）→ 加长 0.035 楔形互嵌补缝；共线段 → 平头对接（无共面闪烁） */
      var ov = (i > 0 && Math.abs(yaw - yawPrev) < 0.02) ? 0 : 0.035;
      var drop = (i === 0) ? 0.30 : 0;                  /* 最前段向机鼻下潜接环包 */
      var seg = bandSeg(dz + ov, 0.052, 0.022, M.blue, s, 0.315, zm, yaw, drop, 0, 'stripe-blue-seg');
      livery.add(seg);
      var yse = 0.278;
      var yaw2 = Math.atan((flankX(zEdge[i + 1], yse, 0.965) - flankX(zEdge[i], yse, 0.965)) / dz);
      var ov2 = (i > 0 && Math.abs(yaw2 - yaw2Prev) < 0.02) ? 0 : 0.035;
      var drop2 = (i === 0) ? 0.34 : 0;
      var pseg = bandSeg(dz + ov2, 0.014, 0.02, M.gold, s, yse, zm, yaw2, drop2, 0, 'stripe-gold-pin');
      livery.add(pseg);
      yawPrev = yaw;
      yaw2Prev = yaw2;
    }
    /* 尾段上扬两节：腰线 → 垂尾根部（rotation.x 抬尾端） */
    var rise1 = bandSeg(0.24, 0.05, 0.022, M.blue, s, 0.335, -0.66, 0, 0.22, 0, 'stripe-blue-rise1');
    livery.add(rise1);
    var rise2 = bandSeg(0.24, 0.05, 0.022, M.blue, s, 0.362, -0.85, 0, 0.42, 0, 'stripe-blue-rise2');
    livery.add(rise2);
  }
  /* 机鼻下环包：弧段自左舷腰线高度经机腹绕至右舷（开口朝上），蓝带 + 金细线
   * 注意：缩放/旋转烘焙进几何体，保证 Box3 紧致（view3d 尺度归一化依赖包围盒）。 */
  var wrapBGeo = new THREE.TorusGeometry(0.222, 0.026, 6, 16, PI * 0.95);
  wrapBGeo.scale(1, HULL_SY, 1);
  wrapBGeo.rotateZ(PI * 1.075);
  var noseWrapB = mesh(wrapBGeo, M.blue);
  noseWrapB.name = 'stripe-nose-wrap-blue';
  noseWrapB.position.set(0, 0.30, 0.90);
  livery.add(noseWrapB);
  var wrapGGeo = new THREE.TorusGeometry(0.212, 0.009, 6, 14, PI * 0.95);
  wrapGGeo.scale(1, HULL_SY, 1);
  wrapGGeo.rotateZ(PI * 1.075);
  var noseWrapG = mesh(wrapGGeo, M.gold);
  noseWrapG.name = 'stripe-nose-wrap-gold';
  noseWrapG.position.set(0, 0.30, 0.955);
  livery.add(noseWrapG);
  /* 垂尾前缘蓝条（双面，随前缘后掠倾斜） */
  for (s = -1; s <= 1; s += 2) {
    var fs = box(0.012, 0.52, 0.055, M.blue, s * 0.0235, 0.82, -0.755);
    fs.name = 'fin-stripe-blue';
    fs.rotation.x = -0.75;
    livery.add(fs);
  }
  g.add(livery);

  /* ======== wing-l / wing-r：低置后掠翼 + 全展金前缘 + 金翼梢 + ▲翼尖航行灯座 ======== */
  var wingPtsL = [[0.10, 0.58], [1.26, -0.10], [1.26, -0.36], [0.10, -0.27]];
  var wingLEL = [[0.10, 0.58], [1.26, -0.10], [1.26, -0.168], [0.10, 0.512]];
  var wingPtsR = [[-0.10, 0.58], [-1.26, -0.10], [-1.26, -0.36], [-0.10, -0.27]];
  var wingLER = [[-0.10, 0.58], [-1.26, -0.10], [-1.26, -0.168], [-0.10, 0.512]];
  /* ▲ 航行灯座：暗金流线短罩（圆柱 12 段，轴向 X），红/绿透镜嵌于外端 */
  var housingGeo = new THREE.CylinderGeometry(0.013, 0.021, 0.09, 12);
  housingGeo.rotateZ(PI / 2);
  function wingUnit(name, pts, lePts, s) {
    var wg = grp(name);
    var wing = mesh(planformGeo(pts, 0.05), M.paintW);
    wing.name = 'wing-planform';
    wg.add(wing);
    var le = mesh(planformGeo(lePts, 0.058), M.gold);
    le.name = 'wing-le-gold';
    wg.add(le);
    var tiplet = box(0.02, 0.24, 0.22, M.gold, 0, 0, 0);
    tiplet.name = 'winglet-gold';
    tiplet.position.set(s * 1.235, 0.14, -0.21);
    tiplet.rotation.z = -s * 0.35;
    wg.add(tiplet);
    var house = mesh(housingGeo, M.goldD);
    house.name = 'nav-light-housing';
    house.position.set(s * 1.215, 0.175, -0.33);
    if (s < 0) house.rotation.z = PI;               /* 右舷锥度翻向（外端收细） */
    wg.add(house);
    wg.position.set(0, 0.10, 0);
    wg.rotation.z = s * 0.07;                      /* 4° 上反角 */
    return wg;
  }
  g.add(wingUnit('wing-l', wingPtsL, wingLEL, 1));
  g.add(wingUnit('wing-r', wingPtsR, wingLER, -1));

  /* ======== engine-l / engine-r：后机身两具涡扇短舱（▲唇口气口 + 13 叶风扇） ======== */
  var engL = engineUnit(1);  engL.name = 'engine-l';  g.add(engL);
  var engR = engineUnit(-1); engR.name = 'engine-r';  g.add(engR);

  /* ======== empennage-fin：后掠垂尾 + 金顶盖 + ▲暗金后缘条 ========
   * planformGeo 将 shape 映到 XZ 平面；垂尾需竖立：传入（高度, z）点后再绕 Z 转 90°，
   * 高度 → +Y，厚度 → X。 */
  var empennage = grp('empennage-fin');
  var finGeo = planformGeo([[0.60, -0.55], [1.0, -0.92], [1.0, -1.16], [0.56, -1.16]], 0.035);
  finGeo.rotateZ(PI / 2);
  finGeo.translate(0.0175, 0, 0);
  var fin = mesh(finGeo, M.paintW);
  fin.name = 'fin-planform';
  empennage.add(fin);
  var finCap = box(0.05, 0.028, 0.30, M.gold, 0, 1.012, -1.04);
  finCap.name = 'fin-cap-gold';
  empennage.add(finCap);
  var finTE = box(0.045, 0.44, 0.018, M.goldD, 0, 0.78, -1.148);
  finTE.name = 'fin-te-band';
  empennage.add(finTE);
  g.add(empennage);

  /* ======== t-tail-stab：T 形平尾 v2（金前缘 + 金翼尖 + ▲升降舵铰链缝线
   *        + ▲升降舵后段（绕铰链微下偏 0.07rad，配平态） + ▲翼尖配平片） ======== */
  var ttail = grp('t-tail-stab');
  var stabL = mesh(planformGeo([[0.06, -0.78], [0.58, -1.04], [0.58, -1.17], [0.06, -1.12]], 0.04), M.paintW);
  stabL.name = 'stab-planform';
  ttail.add(stabL);
  var stabLE = mesh(planformGeo([[0.06, -0.78], [0.58, -1.04], [0.58, -1.085], [0.06, -0.825]], 0.048), M.gold);
  stabLE.name = 'stab-le-gold';
  ttail.add(stabLE);
  var stabR = mesh(planformGeo([[-0.06, -0.78], [-0.58, -1.04], [-0.58, -1.17], [-0.06, -1.12]], 0.04), M.paintW);
  stabR.name = 'stab-planform';
  ttail.add(stabR);
  var stabRE = mesh(planformGeo([[-0.06, -0.78], [-0.58, -1.04], [-0.58, -1.085], [-0.06, -0.825]], 0.048), M.gold);
  stabRE.name = 'stab-le-gold';
  ttail.add(stabRE);
  var tipCapL = box(0.03, 0.05, 0.14, M.gold, 0.575, 0, -1.1);
  tipCapL.name = 'stab-tip-gold';
  ttail.add(tipCapL);
  var tipCapR = box(0.03, 0.05, 0.14, M.gold, -0.575, 0, -1.1);
  tipCapR.name = 'stab-tip-gold';
  ttail.add(tipCapR);
  /* ▲ 升降舵铰链缝线：60% 弦处细钢线，随后缘后掠（左右镜像 yaw） */
  var hingeLineGeo = new THREE.BoxGeometry(0.53, 0.006, 0.012);
  for (s = -1; s <= 1; s += 2) {
    var hl = mesh(hingeLineGeo, M.steelK);
    hl.name = 'elevator-hinge-line';
    hl.position.set(s * 0.32, 0.0225, -1.0525);
    hl.rotation.y = s * 0.0865;
    ttail.add(hl);
  }
  /* ▲ 升降舵后段：独立薄板，几何先平移使枢轴落在铰链线（z=-1.06），微下偏 0.07rad。
   * 板厚 0.03 居中 y=-0.008 → 上表面低于安定面上表面、下表面凸出安定面下表面，无共面。 */
  var elevPtsL = [[0.06, -1.045], [0.58, -1.09], [0.58, -1.185], [0.06, -1.135]];
  var elevPtsR = [[-0.06, -1.045], [-0.58, -1.09], [-0.58, -1.185], [-0.06, -1.135]];
  for (s = -1; s <= 1; s += 2) {
    var eGeo = planformGeo(s > 0 ? elevPtsL : elevPtsR, 0.03);
    eGeo.translate(0, 0, 1.06);                    /* 枢轴烘焙到铰链线 */
    var elev = mesh(eGeo, M.paintW);
    elev.name = 'elevator-te';
    elev.position.set(0, -0.008, -1.06);
    elev.rotation.x = -0.07;
    ttail.add(elev);
    /* ▲ 配平片：升降舵后缘翼尖外侧小金片（更大偏角，配平读感） */
    var tab = box(0.075, 0.018, 0.035, M.gold, s * 0.525, 0.006, -1.162);
    tab.name = 'stab-trim-tab';
    tab.rotation.x = -0.15;
    ttail.add(tab);
  }
  ttail.position.set(0, 1.012, 0);
  g.add(ttail);

  /* ======== gear-bays：起落架收起（腹线平齐舱门 ×3，金铰链提示） ========
   * 主舱门贴在腹鳍下表面（x=±0.06 在整流罩内），前舱门贴机腹前段。 */
  var gearBays = grp('gear-bays');
  var bayN = box(0.16, 0.012, 0.40, M.paintS, 0, 0.008, 0.52);
  bayN.name = 'gear-bay-nose-door';
  gearBays.add(bayN);
  for (s = -1; s <= 1; s += 2) {
    var bayM = box(0.09, 0.012, 0.5, M.paintS, s * 0.06, 0.006, -0.28);
    bayM.name = 'gear-bay-main-door';
    gearBays.add(bayM);
    var hinge = box(0.05, 0.008, 0.02, M.goldD, s * 0.06, 0.004, -0.515);
    hinge.name = 'gear-door-hinge-gold';
    gearBays.add(hinge);
  }
  g.add(gearBays);

  /* ======== airstair-stowed：登机梯收起（左门下折叠舱条：白蒙皮+蓝坡道盖+金扶手迹） ======== */
  var airstair = grp('airstair-stowed');
  var stSkin = box(0.045, 0.05, 0.32, M.paintW, 0, 0, 0);
  stSkin.name = 'stair-fairing';
  stSkin.position.set(flankX(0.36, 0.20, 0.97) - 0.004, 0.20, 0.33);
  airstair.add(stSkin);
  var stRamp = box(0.012, 0.042, 0.30, M.blue, 0, 0, 0);
  stRamp.name = 'stair-ramp-cover-blue';
  stRamp.position.set(flankX(0.36, 0.20, 0.97) + 0.024, 0.20, 0.33);
  airstair.add(stRamp);
  var stRail = box(0.01, 0.012, 0.26, M.gold, 0, 0, 0);
  stRail.name = 'stair-rail-stowed-gold';
  stRail.position.set(flankX(0.36, 0.20, 0.97) + 0.024, 0.228, 0.33);
  airstair.add(stRail);
  g.add(airstair);

  /* ======== nav-lights：左红（+X PORT）/ 右绿（-X SBD）/ 尾白（▲灯嵌于翼尖灯座外端） ======== */
  var navLights = grp('nav-lights');
  var navP = box(0.035, 0.028, 0.05, M.navRed, 0, 0, 0);
  navP.name = 'nav-light-port-red';
  navP.position.set(1.252, 0.175, -0.33);
  navLights.add(navP);
  var navS = box(0.035, 0.028, 0.05, M.navGrn, 0, 0, 0);
  navS.name = 'nav-light-starboard-green';
  navS.position.set(-1.252, 0.175, -0.33);
  navLights.add(navS);
  var navT = box(0.03, 0.03, 0.022, M.navWht, 0, 0, 0);
  navT.name = 'nav-light-tail-white';
  navT.position.set(0, 0.375, -1.08);
  navLights.add(navT);
  g.add(navLights);

  /* ======== skin-seams：▲机身蒙皮环向接缝 ×6（翼根前后 / 中筒 / 尾锥），凸细缝读感 ======== */
  var seams = grp('skin-seams');
  var seamZ = [0.62, 0.06, -0.43, -0.82, -0.96, -1.05];
  for (i = 0; i < seamZ.length; i++) {
    seams.add(seamRing(seamZ[i]));
  }
  g.add(seams);

  /* ======== antenna：脊背刀片天线 ======== */
  var antenna = grp('antenna');
  var ant = box(0.012, 0.05, 0.09, M.paintW, 0, 0.563, -0.25);
  ant.name = 'blade-antenna';
  antenna.add(ant);
  g.add(antenna);

  /* ======== belly-fairing：翼身融合腹鳍（平滑椭球，▲16×12 段） ======== */
  var belly = grp('belly-fairing');
  var bfGeo = new THREE.SphereGeometry(1, 16, 12);
  bfGeo.scale(0.17, 0.06, 0.46);
  var bf = mesh(bfGeo, M.paintS);
  bf.name = 'belly-fair';
  bf.position.set(0, 0.06, -0.12);
  belly.add(bf);
  g.add(belly);

  /* ======== interaction：航行灯红绿交替 + 机窗微光（t, dt）——v2 保持不变 ======== */
  g.userData.anim = [
    function (t) {                                  /* 航行灯：红绿相位交替（克制幅度） */
      var k = sin(t * 5.0);
      M.navRed.emissiveIntensity = 0.2 + 1.3 * Math.max(0, k);
      M.navGrn.emissiveIntensity = 0.2 + 1.3 * Math.max(0, -k);
      M.navWht.emissiveIntensity = 0.3 + 0.06 * sin(t * 2.0);
    },
    function (t) {                                  /* 机窗微光：慢正弦缓脉动 */
      M.cabin.emissiveIntensity = 0.16 + 0.1 * sin(t * 2.0 + 1.0);
    }
  ];

  return g;
};
})();
