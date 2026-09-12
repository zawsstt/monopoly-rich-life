/* =====================================================================================
 * 大富翁 · 富贵人生 —— 载具 3D · 警车（police_car.js）
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/asset_police_car.png（三盒式低模警车 正侧 3/4 视图）
 * 规格工件：.img2threejs/spec_police.json（--strict-quality PASS，4 轮）
 *
 *   window.Special3D.police() → THREE.Group
 *   原点 = 车底中心（四轮触地面 y=0），车头朝 +Z，车辆自身左侧为 +X。
 *   view3d.rideStart 整体放大 2.6 倍并按行进方向旋转；userData.anim=[fn(t,dt)] 驱动警灯。
 *   部件层级：全部 spec 组件为命名 Group（可点选/可拆解），网格 127 ≤ 260。
 *
 * 复刻要点（以参考图为准）：
 *   - 三盒式轿车体：引擎盖 / 座舱 / 后备箱三段体块，座舱收窄、低多边形棱面
 *   - 黑白双色涂装：白上黑下硬边界（侧裙+车门下三分之一），前后杠/轮拱全黑
 *   - 车顶红蓝警灯排：+X 端蓝、-X 端红、中段白色（棱面斜切端帽），深色底座双足
 *   - 前脸：黑格栅五横条 + 方形大灯（暖白发光内镜 + 外侧琥珀转向灯）+ 黑色护杠角
 *   - 尾部：红色尾灯 ×2 + 琥珀下灯 ×2 + 白色车牌（参考图未展示尾面，按级别惯例推断）
 *   - 前车门金盾金星徽 ×2；车门缝线 + 黑门把手；后门 "公安 POLICE" Canvas 配字
 *   - 黑色外后视镜 ×2（A 柱根部短摇臂）；深色微透玻璃；暗色内饰剪影（座/台/盘）
 *   - 五辐轮毂 ×4：胎面棱面轮胎 + 辐条 + 八棱灰轮毂盖 + 中心盖；黑色轮拱唇
 *   - 排气管（左后）、前后下唇、车底暗盒（低角度不穿帮）
 *
 * 动画（group.userData.anim = [fn(t, dt)]）：
 *   1) 警灯红蓝交替发光（emissiveIntensity 相位切换，兼容 view3d runAnims(t,dt)）
 *   2) 大灯暖光常亮 + 尾灯微光（静态发光）
 *
 * 技术约束：经典 script（无模块）；THREE r147 全局；MeshStandardMaterial
 *           （颜色 convertSRGBToLinear）；纹理仅程序化 Canvas ≤256px；
 *           车轮（胎）圆柱 18 段 ≥14；四轮落地；零 Math.random。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[police_car] THREE 未定义，请先加载 three.min.js (r147)');
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
  if (o.map) { m.map = o.map; }
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
function cyl(rt, rb, h, seg, mat, x, y, z) {
  var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  o.position.set(x || 0, y || 0, z || 0);
  return o;
}
function grp(name) {
  var g = new THREE.Group();
  if (name) g.name = name;
  return g;
}
function put(parent, o, x, y, z) {
  /* 仅在传入坐标时覆盖位置（box() 可能已自带定位） */
  if (x !== undefined || y !== undefined || z !== undefined) {
    o.position.set(x || 0, y || 0, z || 0);
  }
  parent.add(o);
  return o;
}

/* ---------- 1. Canvas 程序化纹理（≤256px，零外部资源） ---------- */
var _texCache = {};
function canvasTex(key, w, h, draw) {
  if (_texCache[key]) return _texCache[key];
  var cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  var g = cv.getContext('2d');
  draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  _texCache[key] = tex;
  return tex;
}
/* 后门配字："公安" 大字 + "POLICE" 小字（深藏青，白底上清晰） */
function texLettering() {
  return canvasTex('polLetter', 128, 64, function (g, w, h) {
    g.clearRect(0, 0, w, h);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#1e2a48';
    g.font = 'bold 30px "Microsoft YaHei","SimHei","PingFang SC",sans-serif';
    g.fillText('公安', 44, 30);
    g.font = 'bold 15px "Arial Narrow",Arial,sans-serif';
    g.fillText('POLICE', 92, 40);
    g.font = 'bold 8px Arial,sans-serif';
    g.fillStyle = 'rgba(30,42,72,0.75)';
    g.fillText('MUNICIPAL PATROL', 64, 57);
  });
}
/* 后车牌：白底细框 + 警牌字样（远处读感，近看有细节） */
function texPlate() {
  return canvasTex('polPlate', 128, 44, function (g, w, h) {
    g.fillStyle = '#e8ecf0'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2a2f36'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
    g.fillStyle = '#1c2740'; g.fillRect(6, 6, 12, h - 12);
    g.fillStyle = '#e8ecf0';
    g.font = 'bold 10px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('警', 12, h / 2 + 1);
    g.fillStyle = '#23282f';
    g.font = 'bold 22px Arial';
    g.fillText('A·1024', 72, h / 2 + 1);
  });
}
/* 座舱玻璃内侧微噪（极弱，避免玻璃读成纯平面） */
function texGlass() {
  return canvasTex('polGlass', 64, 64, function (g, w, h) {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    var i, x, y;
    for (i = 0; i < 90; i++) {
      x = (i * 37) % w; y = (i * 23) % h;             /* 确定性散点（无需随机） */
      g.fillStyle = (i % 3) ? 'rgba(190,205,225,0.10)' : 'rgba(120,140,170,0.12)';
      g.fillRect(x, y, 2, 1);
    }
  });
}

/* ---------- 2. 材质库（共享实例，压缩材质数） ---------- */
var M = {
  paintW:  std('#edf1f3', { rough: 0.38, metal: 0.04 }),              /* 白车漆 */
  bandK:   std('#1e242c', { rough: 0.55, metal: 0.15 }),              /* 黑涂装带/杠/轮拱 */
  grilleK: std('#14171c', { rough: 0.6,  metal: 0.1 }),               /* 格栅/边框黑 */
  seamK:   std('#232830', { rough: 0.55 }),                           /* 缝线/把手 */
  glass:   std('#32405a', { rough: 0.12, metal: 0.1, opacity: 0.8, map: texGlass() }), /* 深色微透玻璃 */
  innerK:  std('#20242b', { rough: 0.9 }),                            /* 内饰剪影 */
  rubber:  std('#1b1d20', { rough: 0.92 }),                           /* 轮胎橡胶 */
  hub:     std('#8a9096', { rough: 0.38, metal: 0.8 }),               /* 轮毂灰金属 */
  hubCap:  std('#62666c', { rough: 0.45, metal: 0.7 }),               /* 八棱盖中灰 */
  gold:    std('#dfa936', { rough: 0.32, metal: 0.85 }),              /* 徽章金 */
  goldD:   std('#b98a24', { rough: 0.4,  metal: 0.8 }),               /* 徽章暗金描边 */
  amber:   std('#e89a3c', { rough: 0.35 }),                           /* 琥珀转向灯 */
  plate:   std('#e8ecf0', { rough: 0.5, map: texPlate() }),           /* 车牌 */
  chrome:  std('#3c4148', { rough: 0.4,  metal: 0.7 }),               /* 排气暗钢 */
  letter: new THREE.MeshStandardMaterial({                            /* 后门配字贴片 */
    map: texLettering(), transparent: true, roughness: 0.5, metalness: 0,
    flatShading: true, polygonOffset: true, polygonOffsetFactor: -1
  })
};
/* 发光材质（动画驱动，独立实例） */
var lensRedM  = std('#c23327', { rough: 0.25, emissive: '#ff2f1f', ei: 0.18 });
var lensBlueM = std('#2758c4', { rough: 0.25, emissive: '#2f6bff', ei: 0.18 });
var lensWhtM  = std('#e8ecf2', { rough: 0.3 });                       /* 中段白 */
var headM     = std('#f4ebd2', { rough: 0.3,  emissive: '#ffedb0', ei: 0.55 });
var tailM     = std('#b3261d', { rough: 0.3,  emissive: '#ff2418', ei: 0.2 });
var amberTailM = std('#e89a3c', { rough: 0.35, emissive: '#ff9a2a', ei: 0.12 });

/* ---------- 3. 预制组件 ---------- */
/* 车轮单元：胎（18 段棱面）+ 辐条盘 + 五辐条 + 八棱盖 + 中心盖（共 9 mesh）。
 * 轴线沿 X（rotation.z=PI/2），触地：半径 0.21。 */
function wheelUnit() {
  var g = grp('wheel-unit');
  var tire = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.15, 18, 1), M.rubber);
  tire.name = 'tire';
  tire.rotation.z = PI / 2;
  g.add(tire);
  var disc = mesh(new THREE.CylinderGeometry(0.118, 0.118, 0.12, 14), M.hub);
  disc.name = 'rim-disc';
  disc.rotation.z = PI / 2;
  g.add(disc);
  var i;
  for (i = 0; i < 5; i++) {
    var holder = grp('spoke-' + i);
    holder.rotation.x = (i / 5) * PI * 2;
    holder.add(box(0.14, 0.105, 0.036, M.hub, 0, 0.055, 0));
    g.add(holder);
  }
  var cap = mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.165, 8), M.hubCap);
  cap.name = 'hubcap-octagon';
  cap.rotation.z = PI / 2;
  g.add(cap);
  var dot = mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.172, 8), M.grilleK);
  dot.name = 'hub-center-cap';
  dot.rotation.z = PI / 2;
  g.add(dot);
  return g;
}
/* 大灯组：黑框 + 暖白内镜（内侧）+ 琥珀转向灯（外侧）；s=+1 右侧(+X)，s=-1 左侧镜像 */
function headlamp(s) {
  var g = grp('headlamp-cluster');
  put(g, box(0.27, 0.15, 0.035, M.grilleK, 0, 0, 0)).name = 'lamp-bezel';
  var lens = box(0.16, 0.115, 0.02, headM, -0.045 * s, 0, 0.012);
  lens.name = 'headlamp-lens';
  g.add(lens);
  var amber = box(0.08, 0.115, 0.02, M.amber, 0.09 * s, 0, 0.012);
  amber.name = 'turn-signal-cell';
  g.add(amber);
  return g;
}
/* 尾灯组：红灯 + 下琥珀灯；s 控制左右 */
function taillamp(s) {
  var g = grp('taillight-cluster');
  put(g, box(0.17, 0.095, 0.03, tailM, 0, 0, 0)).name = 'tail-lens';
  put(g, box(0.08, 0.05, 0.028, amberTailM, -0.06 * s, -0.085, 0)).name = 'tail-amber-cell';
  return g;
}
/* 后视镜：短摇臂 + 黑壳镜头；s 控制左右 */
function mirror(s) {
  var g = grp('mirror');
  put(g, box(0.055, 0.028, 0.045, M.grilleK, 0.026 * s, -0.008, 0)).name = 'mirror-stalk';
  put(g, box(0.085, 0.062, 0.055, M.grilleK, 0.062 * s, 0.012, 0)).name = 'mirror-head';
  put(g, box(0.06, 0.045, 0.01, M.glass, 0.062 * s, 0.012, 0.026)).name = 'mirror-face';
  return g;
}
/* 车门徽标：金色盾形（挤出）+ 金星（挤出），朝 ±X；s 控制左右 */
function doorBadge(s) {
  var g = grp('badge');
  var sh = new THREE.Shape();
  sh.moveTo(-0.052, 0.06);
  sh.lineTo(0.052, 0.06);
  sh.lineTo(0.052, -0.008);
  sh.lineTo(0.026, -0.05);
  sh.lineTo(0, -0.064);
  sh.lineTo(-0.026, -0.05);
  sh.lineTo(-0.052, -0.008);
  sh.closePath();
  var shield = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }), M.gold);
  shield.name = 'badge-shield';
  shield.rotation.y = s * PI / 2;
  shield.position.x = s * 0.012;
  g.add(shield);
  var st = new THREE.Shape();
  var i, r, a, x, y;
  for (i = 0; i < 10; i++) {
    r = (i % 2) ? 0.013 : 0.031;
    a = -PI / 2 + i * PI / 5;
    x = cos(a) * r; y = 0.012 + sin(a) * r;
    if (i === 0) st.moveTo(x, y); else st.lineTo(x, y);
  }
  st.closePath();
  var star = mesh(new THREE.ExtrudeGeometry(st, { depth: 0.007, bevelEnabled: false }), M.goldD);
  star.name = 'badge-star';
  star.rotation.y = s * PI / 2;
  star.position.x = s * 0.019;
  g.add(star);
  return g;
}

/* ---------- 4. 工厂主函数 ---------- */
window.Special3D = window.Special3D || {};
window.Special3D.police = function () {
  var g = grp('prop_police_hifi');
  var i, s;

  /* ======== body-tub：车身体块（blockout 主质量） ======== */
  var bodyTub = grp('body-tub');
  put(bodyTub, box(0.96, 0.38, 2.16, M.paintW, 0, 0.31, 0), undefined, undefined, undefined).name = 'tub-main';
  put(bodyTub, box(0.86, 0.07, 2.0, M.bandK, 0, 0.1, 0)).name = 'underbody-shroud';
  g.add(bodyTub);

  /* ======== hood-panel / trunk-lid：盖面内嵌板 ======== */
  var hoodPanel = grp('hood-panel');
  put(hoodPanel, box(0.7, 0.03, 0.6, M.paintW, 0, 0.5, 0.75)).name = 'hood-inset';
  g.add(hoodPanel);
  var trunkLid = grp('trunk-lid');
  put(trunkLid, box(0.74, 0.03, 0.42, M.paintW, 0, 0.5, -0.84)).name = 'trunk-inset';
  g.add(trunkLid);

  /* ======== wheel-unit ×4 + wheel-arches（饰板 + 拱唇） ======== */
  var wheels = [[0.455, 0.62, 'fl'], [-0.455, 0.62, 'fr'], [0.455, -0.62, 'rl'], [-0.455, -0.62, 'rr']];
  var wheelArches = grp('wheel-arches');
  for (i = 0; i < wheels.length; i++) {
    var wu = wheelUnit();
    wu.name = 'wheel-unit';
    put(g, wu, wheels[i][0], 0.21, wheels[i][1]);
    var archPanel = box(0.008, 0.32, 0.42, M.bandK, wheels[i][0] > 0 ? 0.4835 : -0.4835, 0.24, wheels[i][1]);
    archPanel.name = 'arch-panel-' + wheels[i][2];
    wheelArches.add(archPanel);
    var lip = mesh(new THREE.TorusGeometry(0.235, 0.024, 6, 14, PI), M.bandK);
    lip.name = 'arch-lip-' + wheels[i][2];
    lip.rotation.set(0, PI / 2, 0);
    lip.position.set(wheels[i][0] > 0 ? 0.49 : -0.49, 0.21, wheels[i][1]);
    wheelArches.add(lip);
  }
  g.add(wheelArches);

  /* ======== livery-band：黑白涂装硬边界（侧裙带 + 前后脸黑区与杠同高） ======== */
  var liveryBand = grp('livery-band');
  for (s = -1; s <= 1; s += 2) {
    put(liveryBand, box(0.016, 0.18, 2.14, M.bandK, s * 0.482, 0.21, 0)).name = 'band-strip-side';
  }
  put(liveryBand, box(0.964, 0.2, 0.05, M.bandK, 0, 0.24, 1.072)).name = 'band-panel-front';
  put(liveryBand, box(0.964, 0.2, 0.05, M.bandK, 0, 0.24, -1.072)).name = 'band-panel-rear';
  g.add(liveryBand);

  /* ======== greenhouse：座舱（顶板 / 侧壁 / 柱 / 雨刷罩板） ======== */
  var ghSlopeF = -Math.atan2(0.22, 0.35);                                    /* 前风挡后倾 */
  var ghSlopeR = Math.atan2(0.19, 0.35);                                     /* 后窗前倾 */
  var greenhouse = grp('greenhouse');
  var roofPanel = grp('roof-panel');
  put(roofPanel, box(0.78, 0.035, 0.74, M.paintW, 0, 0.905, -0.26)).name = 'roof-slab';
  greenhouse.add(roofPanel);
  for (s = -1; s <= 1; s += 2) {
    put(greenhouse, box(0.02, 0.4, 0.76, M.paintW, s * 0.415, 0.7, -0.26)).name = 'cabin-side-wall';
  }
  put(greenhouse, box(0.8, 0.06, 0.03, M.paintW, 0, 0.515, -0.665)).name = 'rear-cabin-seal';
  for (s = -1; s <= 1; s += 2) {
    var pA = box(0.05, 0.42, 0.055, M.paintW, s * 0.425, 0.705, 0.235);
    pA.name = 'a-pillar'; pA.rotation.x = ghSlopeF; greenhouse.add(pA);
    var pC = box(0.05, 0.42, 0.055, M.paintW, s * 0.4, 0.705, -0.57);
    pC.name = 'c-pillar'; pC.rotation.x = ghSlopeR; greenhouse.add(pC);
    put(greenhouse, box(0.045, 0.34, 0.05, M.paintW, s * 0.427, 0.68, -0.055)).name = 'b-pillar';
  }
  put(greenhouse, box(0.8, 0.035, 0.06, M.grilleK, 0, 0.515, 0.36)).name = 'cowl-vent';
  g.add(greenhouse);

  /* ======== windshield / rear-glass / side-glass（斜置薄盒，深色微透） ======== */
  var windshield = grp('windshield');
  var ws = box(0.8, 0.43, 0.022, M.glass, 0, 0.705, 0.235);
  ws.name = 'windshield-glass';
  ws.rotation.x = ghSlopeF;
  windshield.add(ws);
  g.add(windshield);
  var rearGlass = grp('rear-glass');
  var rg = box(0.76, 0.41, 0.022, M.glass, 0, 0.705, -0.57);
  rg.name = 'rear-glass-panel';
  rg.rotation.x = ghSlopeR;
  rearGlass.add(rg);
  g.add(rearGlass);
  var sideGlass = grp('side-glass');
  for (s = -1; s <= 1; s += 2) {
    put(sideGlass, box(0.015, 0.28, 0.3, M.glass, s * 0.425, 0.71, 0.14)).name = 'door-glass-front';
    put(sideGlass, box(0.015, 0.28, 0.5, M.glass, s * 0.425, 0.71, -0.34)).name = 'door-glass-rear';
  }
  g.add(sideGlass);

  /* ======== interior-hint：内饰剪影（透过微透玻璃的暗色座舱读感） ======== */
  var interiorHint = grp('interior-hint');
  put(interiorHint, box(0.66, 0.1, 0.1, M.innerK, 0, 0.56, 0.26)).name = 'dashboard';
  put(interiorHint, box(0.24, 0.3, 0.1, M.innerK, -0.17, 0.68, -0.16)).name = 'seat-l';
  put(interiorHint, box(0.24, 0.3, 0.1, M.innerK, 0.17, 0.68, -0.16)).name = 'seat-r';
  var steer = mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 12), M.innerK);
  steer.name = 'steering-wheel';
  steer.position.set(-0.17, 0.66, 0.2);
  steer.rotation.x = -1.1;
  interiorHint.add(steer);
  g.add(interiorHint);

  /* ======== lightbar：车顶警灯排（红/白/蓝棱面镜 + 底座双足） ======== */
  var lightbar = grp('lightbar');
  var barZ = -0.07;
  put(lightbar, box(0.72, 0.028, 0.44, M.grilleK, 0, 0.937, barZ)).name = 'bar-base';
  for (s = -1; s <= 1; s += 2) {
    put(lightbar, box(0.13, 0.055, 0.3, M.grilleK, s * 0.24, 0.952, barZ)).name = 'bar-foot';
  }
  var lensD = 0.36, lensH = 0.055, lensY = 0.9825;
  var lensBlue = box(0.215, lensH, lensD, lensBlueM, 0.2375, lensY, barZ);
  lensBlue.name = 'bar-lens-blue';
  lightbar.add(lensBlue);
  var lensRed = box(0.24, lensH, lensD, lensRedM, -0.2275, lensY, barZ);
  lensRed.name = 'bar-lens-red';
  lightbar.add(lensRed);
  var lensClear = box(0.235, lensH, lensD, lensWhtM, 0.0125, lensY, barZ);
  lensClear.name = 'bar-lens-clear';
  lightbar.add(lensClear);
  var capB = box(0.05, lensH + 0.01, lensD * 0.62, lensBlueM, 0.315, lensY, barZ);
  capB.name = 'bar-endcap-blue';
  capB.rotation.y = -0.35;
  lightbar.add(capB);
  var capR = box(0.05, lensH + 0.01, lensD * 0.62, lensRedM, -0.325, lensY, barZ);
  capR.name = 'bar-endcap-red';
  capR.rotation.y = 0.35;
  lightbar.add(capR);
  g.add(lightbar);

  /* ======== front-fascia：格栅（五横条）+ 大灯组 ×2 ======== */
  var frontFascia = grp('front-fascia');
  var grille = grp('grille');
  put(grille, box(0.4, 0.17, 0.05, M.grilleK, 0, 0.385, 1.09)).name = 'grille-bezel';
  for (i = 0; i < 5; i++) {
    put(grille, box(0.36, 0.017, 0.014, M.bandK, 0, 0.317 + i * 0.034, 1.112)).name = 'grille-slat-' + i;
  }
  frontFascia.add(grille);
  var hlL = headlamp(1);  hlL.name = 'headlamp-cluster';  put(frontFascia, hlL, 0.34, 0.4, 1.1);
  var hlR = headlamp(-1); hlR.name = 'headlamp-cluster';  put(frontFascia, hlR, -0.34, 0.4, 1.1);
  g.add(frontFascia);

  /* ======== rear-fascia：尾灯 ×2 + 车牌（尾面参考图未展示，级别惯例推断） ======== */
  var rearFascia = grp('rear-fascia');
  var tlL = taillamp(1);  tlL.name = 'taillight-cluster';  put(rearFascia, tlL, 0.37, 0.43, -1.095);
  var tlR = taillamp(-1); tlR.name = 'taillight-cluster';  put(rearFascia, tlR, -0.37, 0.43, -1.095);
  var plate = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.1), M.plate);
  plate.name = 'rear-plate';
  plate.position.set(0, 0.28, -1.099);
  plate.rotation.y = PI;
  rearFascia.add(plate);
  g.add(rearFascia);

  /* ======== bumpers：包裹式前后杠 + 下唇 + 前防撞角 ======== */
  var bumpers = grp('bumpers');
  put(bumpers, box(1.0, 0.2, 0.16, M.bandK, 0, 0.24, 1.11)).name = 'bumper-front';
  put(bumpers, box(0.96, 0.06, 0.1, M.bandK, 0, 0.135, 1.12)).name = 'bumper-front-lip';
  put(bumpers, box(1.0, 0.18, 0.12, M.bandK, 0, 0.24, -1.11)).name = 'bumper-rear';
  put(bumpers, box(0.96, 0.06, 0.1, M.bandK, 0, 0.135, -1.1)).name = 'bumper-rear-lip';
  for (s = -1; s <= 1; s += 2) {
    put(bumpers, box(0.075, 0.38, 0.09, M.grilleK, s * 0.4, 0.32, 1.16)).name = 'guard-horn';
    put(bumpers, box(0.075, 0.09, 0.06, M.grilleK, s * 0.4, 0.485, 1.145)).name = 'guard-horn-cap';
  }
  g.add(bumpers);

  /* ======== badge：前车门金盾金星 ×2 ======== */
  var bdL = doorBadge(1);  bdL.name = 'badge';  put(g, bdL, 0.484, 0.4, 0.22);
  var bdR = doorBadge(-1); bdR.name = 'badge';  put(g, bdR, -0.484, 0.4, 0.22);

  /* ======== door-trim：配字贴片 + 缝线 + 门把手 ======== */
  var doorTrim = grp('door-trim');
  var letGeo = new THREE.PlaneGeometry(0.32, 0.16);
  var letL = new THREE.Mesh(letGeo, M.letter);
  letL.name = 'lettering-l';
  letL.position.set(0.4865, 0.4, -0.24);
  letL.rotation.y = PI / 2;
  doorTrim.add(letL);
  var letR = new THREE.Mesh(letGeo, M.letter);
  letR.name = 'lettering-r';
  letR.position.set(-0.4865, 0.4, -0.24);
  letR.rotation.y = -PI / 2;
  doorTrim.add(letR);
  for (s = -1; s <= 1; s += 2) {
    put(doorTrim, box(0.012, 0.15, 0.012, M.seamK, s * 0.4865, 0.38, -0.075)).name = 'door-seam-b';
    put(doorTrim, box(0.012, 0.15, 0.012, M.seamK, s * 0.4865, 0.38, -0.405)).name = 'door-seam-rear';
    put(doorTrim, box(0.014, 0.028, 0.1, M.seamK, s * 0.487, 0.455, 0.1)).name = 'door-handle-front';
    put(doorTrim, box(0.014, 0.028, 0.1, M.seamK, s * 0.487, 0.455, -0.3)).name = 'door-handle-rear';
  }
  g.add(doorTrim);

  /* ======== mirror：外后视镜 ×2（A 柱根部） ======== */
  var miL = mirror(1);  miL.name = 'mirror';  put(g, miL, 0.44, 0.62, 0.28);
  var miR = mirror(-1); miR.name = 'mirror';  put(g, miR, -0.44, 0.62, 0.28);

  /* ======== exhaust：排气管（左后） ======== */
  var exhaust = grp('exhaust');
  var exh = cyl(0.026, 0.026, 0.09, 12, M.chrome, -0.3, 0.115, -1.115);
  exh.name = 'exhaust-tip';
  exh.rotation.x = PI / 2;
  exhaust.add(exh);
  g.add(exhaust);

  /* ======== interaction：警灯交替动画（t, dt） ======== */
  g.userData.anim = [
    function (t) {                                   /* 红蓝交替（相位切换）+ 尾灯同相微闪 */
      var k = sin(t * 6.4);
      lensRedM.emissiveIntensity = 0.16 + 1.5 * Math.max(0, k);
      lensBlueM.emissiveIntensity = 0.16 + 1.5 * Math.max(0, -k);
      tailM.emissiveIntensity = 0.2 + 0.45 * Math.max(0, k);
    }
  ];

  return g;
};
})();