/* =====================================================================================
 * 大富翁 · 富贵人生 —— 载具 3D · 警车（police_car.js）v2 精修版
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/asset_police_car.png（三盒式低模警车 正侧 3/4 视图）
 * v2 精修（对照参考图逐条清偿 v1 遗留差距，mesh 127 → 190 ≤ 220）：
 *   1) 车身曲面分段：引擎盖三段下溜 + 中央脊线/双侧棱线 + 前鼻下压板；
 *      前后翼子板肩块（轮拱上方隆起）；后备箱盖后倾 + 侧缝线 + 尾 decking 条
 *   2) 车顶过渡：顶板双侧倒角（crown 读感）+ 风挡/后窗窗楣横条 + 侧窗下沿黑色腰线
 *   3) 座舱 tumblehome：侧壁上半段内倾 9°，侧窗玻璃同步内倾（上窄下宽）
 *   4) 轮毂镂空化：开放轮辋筒 + 内凹制动盘背板 + 5 辐条悬空 + 螺栓圈纹理轮毂盖
 *      （圆柱段数全部 ≥12；轮胎 18 段棱面保留）
 *   5) 格栅分层：内凹背板 + 四边框条 + 6 横条交错深度 + 双竖隔条 + 上沿镀铬亮条
 *   6) 门缝 ×3/侧（前门前缘/B 柱/后门后缘）+ 把手底座/握柄两层；
 *      修复 v1 后门"公安 POLICE"贴片被侧裙带淹没的缺陷（v1 x=0.4865 < 带外沿 0.490）
 *   7) 后视镜双杆支架（斜臂 + 连杆 + 壳 + 后向镜面）
 *   8) 前杠阶梯造型 + 包角 + 竖护角；杠面内凹下进气口（面板 + 双鳍）；
 *      后杠 + 包角 + 下唇
 *   9) 警灯排底座结构：双足 + 双中柱 + 底盘 + 内凹反光槽 + 镜组分隔肋 + 顶盖条；
 *      红蓝警灯交替动画保留（+X 蓝 / -X 红，同 v1 已验收契约）
 *
 *   window.Special3D.police() → THREE.Group
 *   原点 = 车底中心（四轮触地面 y=0），车头朝 +Z，车辆自身左侧为 +X。
 *   view3d rideStart 按 Box3 实测长度归一化（smoke_ride 复测通过）。
 *
 * 动画（group.userData.anim = [fn(t, dt)]）：
 *   1) 警灯红蓝交替发光（emissiveIntensity 相位切换，兼容 view3d runAnims(t,dt)）
 *   2) 大灯暖光常亮 + 尾灯同相微光（v1 已验收行为保留）
 *
 * 技术约束：经典 script（无模块）；THREE r147 全局；MeshStandardMaterial
 *           （颜色 convertSRGBToLinear）；纹理仅程序化 Canvas ≤512px；
 *           圆柱段数 ≥12；四轮落地；零随机布局（禁用随机数 API）。
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

/* ---------- 1. Canvas 程序化纹理（≤512px，零外部资源） ---------- */
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
/* 后门配字："公安" 大字 + "POLICE" 小字（深藏青，白底上清晰；256px 提升笔画锐度） */
function texLettering() {
  return canvasTex('polLetter', 256, 128, function (g, w, h) {
    g.clearRect(0, 0, w, h);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#1e2a48';
    g.font = 'bold 60px "Microsoft YaHei","SimHei","PingFang SC",sans-serif';
    g.fillText('公安', 88, 60);
    g.font = 'bold 30px "Arial Narrow",Arial,sans-serif';
    g.fillText('POLICE', 184, 80);
    g.font = 'bold 16px Arial,sans-serif';
    g.fillStyle = 'rgba(30,42,72,0.75)';
    g.fillText('MUNICIPAL PATROL', 128, 114);
  });
}
/* 后车牌：白底细框 + 警牌字样（远处读感，近看有细节） */
function texPlate() {
  return canvasTex('polPlate', 256, 88, function (g, w, h) {
    g.fillStyle = '#e8ecf0'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2a2f36'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#1c2740'; g.fillRect(12, 12, 24, h - 24);
    g.fillStyle = '#e8ecf0';
    g.font = 'bold 20px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText('警', 24, h / 2 + 1);
    g.fillStyle = '#23282f';
    g.font = 'bold 44px Arial';
    g.fillText('A·1024', 144, h / 2 + 1);
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
/* 轮毂盖端面：5 螺栓圈 + 中心盖（Cylinder 端帽极坐标映射，两面同显） */
function texHubCap() {
  return canvasTex('polHubCap', 128, 128, function (g, w, h) {
    var cx = w / 2, cy = h / 2, i, a;
    g.fillStyle = '#878d93'; g.fillRect(0, 0, w, h);
    /* 机加工同心圈（确定性） */
    g.strokeStyle = 'rgba(70,74,80,0.5)';
    g.lineWidth = 3;
    g.beginPath(); g.arc(cx, cy, 46, 0, PI * 2); g.stroke();
    g.beginPath(); g.arc(cx, cy, 30, 0, PI * 2); g.stroke();
    /* 5 螺栓 */
    g.fillStyle = '#33373d';
    for (i = 0; i < 5; i++) {
      a = -PI / 2 + i * PI * 2 / 5;
      g.beginPath(); g.arc(cx + cos(a) * 38, cy + sin(a) * 38, 7.5, 0, PI * 2); g.fill();
    }
    g.beginPath(); g.arc(cx, cy, 11, 0, PI * 2); g.fill();
    g.fillStyle = 'rgba(220,226,232,0.55)';
    g.beginPath(); g.arc(cx - 3, cy - 3, 4, 0, PI * 2); g.fill();
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
  hub:     std('#8a9096', { rough: 0.38, metal: 0.8 }),               /* 轮毂灰金属（辐条） */
  hubCap:  std('#878d93', { rough: 0.42, metal: 0.7, map: texHubCap() }), /* 螺栓圈端帽 */
  hubDark: std('#26292e', { rough: 0.55, metal: 0.55 }),              /* 轮辋筒/制动盘暗钢 */
  trim:    std('#9aa0a6', { rough: 0.3,  metal: 0.85 }),              /* 格栅上沿亮条 */
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
/* 车轮单元 v2（镂空轮毂）：胎 18 段 + 开放轮辋筒 + 内凹制动背板 + 5 悬空辐条
 * + 螺栓圈纹理端帽 + 中心盖（共 10 mesh）。
 * 轴线沿 X（rotation.z=PI/2），触地：半径 0.21。左右侧共用（对称设计）。 */
function wheelUnit() {
  var g = grp('wheel-unit');
  var tire = mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.15, 18, 1), M.rubber);
  tire.name = 'tire';
  tire.rotation.z = PI / 2;
  g.add(tire);
  /* 轮辋筒（openEnded：辐条间隙透出胎腔暗色 → 镂空深度读感） */
  var barrel = mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.125, 18, 1, true), M.hubDark);
  barrel.name = 'rim-barrel';
  barrel.rotation.z = PI / 2;
  g.add(barrel);
  /* 内凹制动背板（比辐条低 0.013，辐条间隙可见层次） */
  var backing = cyl(0.118, 0.118, 0.018, 18, M.hubDark, 0, 0, 0);
  backing.name = 'hub-backing';
  backing.rotation.z = PI / 2;
  g.add(backing);
  var i;
  for (i = 0; i < 5; i++) {
    var holder = grp('spoke-' + i);
    holder.rotation.x = (i / 5) * PI * 2;
    holder.add(box(0.045, 0.128, 0.036, M.hub, 0, 0.064, 0));
    g.add(holder);
  }
  var cap = cyl(0.052, 0.052, 0.06, 12, M.hubCap, 0, 0, 0);
  cap.name = 'hubcap-boltring';
  cap.rotation.z = PI / 2;
  g.add(cap);
  var dot = cyl(0.018, 0.018, 0.075, 12, M.grilleK, 0, 0, 0);
  dot.name = 'hub-center-cap';
  dot.rotation.z = PI / 2;
  g.add(dot);
  return g;
}
/* 大灯组 v2：黑框 + 内衬背板 + 暖白内镜（内侧）+ 琥珀转向灯（外侧）；s=+1 右侧(+X) */
function headlamp(s) {
  var g = grp('headlamp-cluster');
  put(g, box(0.27, 0.15, 0.035, M.grilleK, 0, 0, 0)).name = 'lamp-bezel';
  put(g, box(0.23, 0.115, 0.012, M.hubDark, 0, 0, 0.014)).name = 'lamp-backing';
  var lens = box(0.16, 0.115, 0.02, headM, -0.045 * s, 0, 0.028);
  lens.name = 'headlamp-lens';
  g.add(lens);
  var amber = box(0.08, 0.115, 0.02, M.amber, 0.09 * s, 0, 0.028);
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
/* 后视镜 v2：斜臂 + 连杆 + 黑壳 + 后向镜面（双层支架）；s 控制左右 */
function mirror(s) {
  var g = grp('mirror');
  var arm = box(0.05, 0.02, 0.032, M.grilleK, 0.022 * s, -0.004, 0);
  arm.name = 'mirror-arm';
  arm.rotation.z = -s * 0.22;
  g.add(arm);
  put(g, box(0.045, 0.018, 0.028, M.grilleK, 0.048 * s, 0.006, 0)).name = 'mirror-link';
  put(g, box(0.052, 0.066, 0.052, M.grilleK, 0.078 * s, 0.016, 0)).name = 'mirror-head';
  put(g, box(0.046, 0.05, 0.008, M.glass, 0.078 * s, 0.016, -0.028)).name = 'mirror-face';
  return g;
}
/* 车门徽标 v2：暗金底托 + 金色盾形 + 金星三层叠级，朝 ±X；s 控制左右 */
function doorBadge(s) {
  var g = grp('badge');
  var sh = new THREE.Shape();
  sh.moveTo(-0.065, 0.075);
  sh.lineTo(0.065, 0.075);
  sh.lineTo(0.065, -0.01);
  sh.lineTo(0.0325, -0.0625);
  sh.lineTo(0, -0.08);
  sh.lineTo(-0.0325, -0.0625);
  sh.lineTo(-0.065, -0.01);
  sh.closePath();
  var rim = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }), M.goldD);
  rim.name = 'badge-rim';
  rim.scale.set(1.13, 1.13, 1);
  rim.rotation.y = s * PI / 2;
  rim.position.x = s * 0.008;
  g.add(rim);
  var shield = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false }), M.gold);
  shield.name = 'badge-shield';
  shield.rotation.y = s * PI / 2;
  shield.position.x = s * 0.016;
  g.add(shield);
  var st = new THREE.Shape();
  var i, r, a, x, y;
  for (i = 0; i < 10; i++) {
    r = (i % 2) ? 0.0162 : 0.039;
    a = -PI / 2 + i * PI / 5;
    x = cos(a) * r; y = 0.015 + sin(a) * r;
    if (i === 0) st.moveTo(x, y); else st.lineTo(x, y);
  }
  st.closePath();
  var star = mesh(new THREE.ExtrudeGeometry(st, { depth: 0.007, bevelEnabled: false }), M.goldD);
  star.name = 'badge-star';
  star.rotation.y = s * PI / 2;
  star.position.x = s * 0.024;
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

  /* ======== hood-panel v2：引擎盖三段下溜 + 脊线/棱线 + 前鼻板 ======== */
  var hoodPanel = grp('hood-panel');
  var hoodA = box(0.72, 0.026, 0.26, M.paintW, 0, 0.523, 0.66);
  hoodA.name = 'hood-plate-a'; hoodA.rotation.x = 0.045; hoodPanel.add(hoodA);
  var hoodB = box(0.75, 0.026, 0.26, M.paintW, 0, 0.5155, 0.43);
  hoodB.name = 'hood-plate-b'; hoodB.rotation.x = 0.055; hoodPanel.add(hoodB);
  var hoodC = box(0.78, 0.026, 0.26, M.paintW, 0, 0.5085, 0.20);
  hoodC.name = 'hood-plate-c'; hoodC.rotation.x = 0.06; hoodPanel.add(hoodC);
  var noseCap = box(0.86, 0.028, 0.22, M.paintW, 0, 0.492, 0.975);
  noseCap.name = 'hood-nose-cap'; noseCap.rotation.x = 0.10; hoodPanel.add(noseCap);
  var spine = box(0.05, 0.014, 0.60, M.paintW, 0, 0.5405, 0.48);
  spine.name = 'hood-spine'; spine.rotation.x = 0.052; hoodPanel.add(spine);
  for (s = -1; s <= 1; s += 2) {
    var crease = box(0.014, 0.012, 0.58, M.paintW, s * 0.245, 0.5355, 0.46);
    crease.name = 'hood-crease'; crease.rotation.x = 0.052;
    hoodPanel.add(crease);
  }
  g.add(hoodPanel);

  /* ======== shoulder v2：前后翼子板肩块（轮拱上方隆起，与盖面成肩线） ======== */
  var shoulders = grp('fender-shoulders');
  for (s = -1; s <= 1; s += 2) {
    var ff = box(0.055, 0.15, 0.60, M.paintW, s * 0.4925, 0.425, 0.66);
    ff.name = 'fender-shoulder-front'; ff.rotation.x = 0.09;
    shoulders.add(ff);
    var rq = box(0.055, 0.14, 0.56, M.paintW, s * 0.4925, 0.428, -0.72);
    rq.name = 'quarter-shoulder-rear'; rq.rotation.x = -0.05;
    shoulders.add(rq);
  }
  g.add(shoulders);

  /* ======== trunk-lid v2：后备箱盖（后倾）+ 侧缝线 + 尾 decking 条 ======== */
  var trunkLid = grp('trunk-lid');
  var lid = box(0.74, 0.026, 0.40, M.paintW, 0, 0.5175, -0.79);
  lid.name = 'trunk-inset'; lid.rotation.x = -0.045; trunkLid.add(lid);
  for (s = -1; s <= 1; s += 2) {
    var tseam = box(0.012, 0.01, 0.42, M.seamK, s * 0.375, 0.5215, -0.79);
    tseam.name = 'trunk-seam'; tseam.rotation.x = -0.045;
    trunkLid.add(tseam);
  }
  put(trunkLid, box(0.76, 0.02, 0.03, M.bandK, 0, 0.507, -1.055)).name = 'trunk-deck-edge';
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

  /* ======== greenhouse v2：座舱（顶板+双侧倒角 / 分段侧壁（上半内倾 9°）/ 柱 / 窗楣） ======== */
  var ghSlopeF = -Math.atan2(0.22, 0.35);                                    /* 前风挡后倾 */
  var ghSlopeR = Math.atan2(0.19, 0.35);                                     /* 后窗前倾 */
  var greenhouse = grp('greenhouse');
  var roofPanel = grp('roof-panel');
  put(roofPanel, box(0.78, 0.035, 0.74, M.paintW, 0, 0.905, -0.26)).name = 'roof-slab';
  for (s = -1; s <= 1; s += 2) {
    var cham = box(0.075, 0.024, 0.75, M.paintW, s * 0.376, 0.903, -0.26);
    cham.name = 'roof-chamfer'; cham.rotation.z = -s * 0.55;
    roofPanel.add(cham);
  }
  greenhouse.add(roofPanel);
  put(greenhouse, box(0.80, 0.035, 0.055, M.paintW, 0, 0.899, 0.115)).name = 'windshield-header';
  put(greenhouse, box(0.76, 0.035, 0.055, M.paintW, 0, 0.897, -0.478)).name = 'rear-window-header';
  for (s = -1; s <= 1; s += 2) {
    put(greenhouse, box(0.02, 0.20, 0.76, M.paintW, s * 0.415, 0.60, -0.26)).name = 'cabin-side-wall-lower';
    var up = box(0.02, 0.21, 0.76, M.paintW, s * 0.4045, 0.795, -0.26);
    up.name = 'cabin-side-wall-upper'; up.rotation.z = s * 0.16;           /* tumblehome 内倾 */
    greenhouse.add(up);
    var pA = box(0.05, 0.42, 0.055, M.paintW, s * 0.425, 0.705, 0.235);
    pA.name = 'a-pillar'; pA.rotation.x = ghSlopeF; greenhouse.add(pA);
    var pC = box(0.05, 0.42, 0.055, M.paintW, s * 0.40, 0.705, -0.57);
    pC.name = 'c-pillar'; pC.rotation.x = ghSlopeR; greenhouse.add(pC);
    put(greenhouse, box(0.045, 0.40, 0.05, M.paintW, s * 0.424, 0.69, -0.055)).name = 'b-pillar';
  }
  put(greenhouse, box(0.8, 0.035, 0.06, M.grilleK, 0, 0.515, 0.36)).name = 'cowl-vent';
  put(greenhouse, box(0.8, 0.06, 0.03, M.paintW, 0, 0.515, -0.665)).name = 'rear-cabin-seal';
  g.add(greenhouse);

  /* ======== windshield / rear-glass / side-glass v2（斜置薄盒 + 侧窗内倾） ======== */
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
    var gf = box(0.015, 0.28, 0.3, M.glass, s * 0.408, 0.72, 0.14);
    gf.name = 'door-glass-front'; gf.rotation.z = s * 0.14;
    sideGlass.add(gf);
    var gr = box(0.015, 0.28, 0.5, M.glass, s * 0.408, 0.72, -0.34);
    gr.name = 'door-glass-rear'; gr.rotation.z = s * 0.14;
    sideGlass.add(gr);
    /* 侧窗下沿黑色腰线（窗台chrome trim 读感） */
    put(sideGlass, box(0.03, 0.018, 0.88, M.seamK, s * 0.428, 0.5725, -0.17)).name = 'beltline-trim';
  }
  g.add(sideGlass);

  /* ======== interior-hint：内饰剪影（透过微透玻璃的暗色座舱读感） ======== */
  var interiorHint = grp('interior-hint');
  put(interiorHint, box(0.66, 0.1, 0.12, M.innerK, 0, 0.56, 0.26)).name = 'dashboard';
  put(interiorHint, box(0.24, 0.3, 0.1, M.innerK, -0.17, 0.68, -0.16)).name = 'seat-l';
  put(interiorHint, box(0.24, 0.3, 0.1, M.innerK, 0.17, 0.68, -0.16)).name = 'seat-r';
  put(interiorHint, box(0.14, 0.07, 0.06, M.innerK, -0.17, 0.845, -0.19)).name = 'headrest-l';
  put(interiorHint, box(0.14, 0.07, 0.06, M.innerK, 0.17, 0.845, -0.19)).name = 'headrest-r';
  var steer = mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 12), M.innerK);
  steer.name = 'steering-wheel';
  steer.position.set(-0.17, 0.66, 0.2);
  steer.rotation.x = -1.1;
  interiorHint.add(steer);
  g.add(interiorHint);

  /* ======== lightbar v2：车顶警灯排（足/柱/底盘/反光槽/分肋/顶盖 + 红白蓝镜组） ======== */
  var lightbar = grp('lightbar');
  var barZ = -0.09;
  for (s = -1; s <= 1; s += 2) {
    put(lightbar, box(0.12, 0.03, 0.30, M.grilleK, s * 0.24, 0.9375, barZ)).name = 'bar-foot';
    put(lightbar, box(0.03, 0.03, 0.28, M.grilleK, s * 0.10, 0.9375, barZ)).name = 'bar-post';
  }
  put(lightbar, box(0.72, 0.02, 0.40, M.grilleK, 0, 0.9625, barZ)).name = 'bar-base';
  put(lightbar, box(0.68, 0.02, 0.34, M.hubDark, 0, 0.9825, barZ)).name = 'bar-reflector-floor';
  var lensD = 0.36, lensH = 0.075, lensY = 1.03;
  var lensBlue = box(0.24, lensH, lensD, lensBlueM, 0.22, lensY, barZ);
  lensBlue.name = 'bar-lens-blue';
  lightbar.add(lensBlue);
  var lensClear = box(0.21, lensH, lensD, lensWhtM, -0.005, lensY, barZ);
  lensClear.name = 'bar-lens-clear';
  lightbar.add(lensClear);
  var lensRed = box(0.22, lensH, lensD, lensRedM, -0.22, lensY, barZ);
  lensRed.name = 'bar-lens-red';
  lightbar.add(lensRed);
  for (s = -1; s <= 1; s += 2) {
    put(lightbar, box(0.012, 0.08, 0.365, M.grilleK, s * 0.105, lensY, barZ)).name = 'bar-divider';
  }
  var capB = box(0.05, lensH + 0.01, lensD * 0.62, lensBlueM, 0.345, lensY, barZ);
  capB.name = 'bar-endcap-blue';
  capB.rotation.y = -0.42;
  lightbar.add(capB);
  var capR = box(0.05, lensH + 0.01, lensD * 0.62, lensRedM, -0.345, lensY, barZ);
  capR.name = 'bar-endcap-red';
  capR.rotation.y = 0.42;
  lightbar.add(capR);
  put(lightbar, box(0.70, 0.012, 0.20, M.grilleK, 0, 1.0735, barZ)).name = 'bar-top-cap';
  g.add(lightbar);

  /* ======== front-fascia v2：格栅（背板内凹 + 边框 + 6 交错横条 + 双竖隔 + 亮条） ======== */
  var frontFascia = grp('front-fascia');
  var grille = grp('grille');
  put(grille, box(0.44, 0.19, 0.02, M.grilleK, 0, 0.385, 1.078)).name = 'grille-backing';
  put(grille, box(0.46, 0.022, 0.045, M.grilleK, 0, 0.488, 1.095)).name = 'grille-bezel-top';
  put(grille, box(0.46, 0.022, 0.045, M.grilleK, 0, 0.282, 1.095)).name = 'grille-bezel-bottom';
  put(grille, box(0.02, 0.155, 0.045, M.grilleK, 0.22, 0.385, 1.095)).name = 'grille-bezel-l';
  put(grille, box(0.02, 0.155, 0.045, M.grilleK, -0.22, 0.385, 1.095)).name = 'grille-bezel-r';
  for (i = 0; i < 6; i++) {
    var slat = box(0.40, 0.016, 0.012, M.bandK, 0, 0.31 + i * 0.0324, (i % 2) ? 1.112 : 1.102);
    slat.name = 'grille-slat-' + i;
    grille.add(slat);
  }
  put(grille, box(0.014, 0.15, 0.012, M.bandK, 0.115, 0.385, 1.108)).name = 'grille-divider-l';
  put(grille, box(0.014, 0.15, 0.012, M.bandK, -0.115, 0.385, 1.108)).name = 'grille-divider-r';
  put(grille, box(0.46, 0.014, 0.02, M.trim, 0, 0.505, 1.093)).name = 'grille-chrome-brow';
  frontFascia.add(grille);
  var hlL = headlamp(1);  hlL.name = 'headlamp-cluster';  put(frontFascia, hlL, 0.34, 0.4, 1.1);
  var hlR = headlamp(-1); hlR.name = 'headlamp-cluster';  put(frontFascia, hlR, -0.34, 0.4, 1.1);
  /* 翼子板前角琥珀示宽条（参考图前角橙色竖标） */
  for (s = -1; s <= 1; s += 2) {
    put(frontFascia, box(0.024, 0.09, 0.018, M.amber, s * 0.435, 0.415, 1.079)).name = 'corner-marker';
  }
  g.add(frontFascia);

  /* ======== rear-fascia：尾灯 ×2 + 车牌 + 高位制动灯（尾面按级别惯例推断） ======== */
  var rearFascia = grp('rear-fascia');
  var tlL = taillamp(1);  tlL.name = 'taillight-cluster';  put(rearFascia, tlL, 0.37, 0.43, -1.095);
  var tlR = taillamp(-1); tlR.name = 'taillight-cluster';  put(rearFascia, tlR, -0.37, 0.43, -1.095);
  var plate = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.1), M.plate);
  plate.name = 'rear-plate';
  plate.position.set(0, 0.28, -1.099);
  plate.rotation.y = PI;
  rearFascia.add(plate);
  put(rearFascia, box(0.30, 0.028, 0.02, tailM, 0, 0.9365, -0.615)).name = 'chmsl';
  g.add(rearFascia);

  /* ======== bumpers v2：前杠阶梯造型 + 包角 + 竖护角 + 杠面进气口；后杠 + 包角 ======== */
  var bumpers = grp('bumpers');
  put(bumpers, box(1.0, 0.16, 0.13, M.bandK, 0, 0.25, 1.125)).name = 'bumper-front';
  put(bumpers, box(0.96, 0.06, 0.09, M.bandK, 0, 0.145, 1.135)).name = 'bumper-front-lip';
  for (s = -1; s <= 1; s += 2) {
    put(bumpers, box(0.10, 0.18, 0.15, M.bandK, s * 0.475, 0.25, 1.09)).name = 'bumper-front-corner';
    put(bumpers, box(0.075, 0.34, 0.075, M.grilleK, s * 0.40, 0.31, 1.17)).name = 'guard-horn';
    put(bumpers, box(0.075, 0.09, 0.06, M.grilleK, s * 0.4, 0.5, 1.16)).name = 'guard-horn-cap';
  }
  put(bumpers, box(0.56, 0.05, 0.016, M.grilleK, 0, 0.185, 1.196)).name = 'intake-panel';
  put(bumpers, box(0.014, 0.05, 0.012, M.grilleK, 0.14, 0.185, 1.208)).name = 'intake-fin';
  put(bumpers, box(0.014, 0.05, 0.012, M.grilleK, -0.14, 0.185, 1.208)).name = 'intake-fin';
  put(bumpers, box(0.98, 0.17, 0.11, M.bandK, 0, 0.25, -1.115)).name = 'bumper-rear';
  put(bumpers, box(0.94, 0.06, 0.09, M.bandK, 0, 0.145, -1.105)).name = 'bumper-rear-lip';
  for (s = -1; s <= 1; s += 2) {
    put(bumpers, box(0.10, 0.18, 0.13, M.bandK, s * 0.465, 0.25, -1.08)).name = 'bumper-rear-corner';
  }
  g.add(bumpers);

  /* ======== badge：前车门金盾金星 ×2（三层叠级） ======== */
  var bdL = doorBadge(1);  bdL.name = 'badge';  put(g, bdL, 0.4805, 0.405, 0.22);
  var bdR = doorBadge(-1); bdR.name = 'badge';  put(g, bdR, -0.4805, 0.405, 0.22);

  /* ======== door-trim v2：配字贴片（抬高至带外沿之上）+ 缝线 ×3 + 两层把手 ======== */
  var doorTrim = grp('door-trim');
  var letGeo = new THREE.PlaneGeometry(0.32, 0.16);
  var letL = new THREE.Mesh(letGeo, M.letter);
  letL.name = 'lettering-l';
  letL.position.set(0.4925, 0.4, -0.24);
  letL.rotation.y = PI / 2;
  doorTrim.add(letL);
  var letR = new THREE.Mesh(letGeo, M.letter);
  letR.name = 'lettering-r';
  letR.position.set(-0.4925, 0.4, -0.24);
  letR.rotation.y = -PI / 2;
  doorTrim.add(letR);
  var seamZ = [0.335, -0.075, -0.385];
  for (s = -1; s <= 1; s += 2) {
    for (i = 0; i < seamZ.length; i++) {
      put(doorTrim, box(0.012, 0.28, 0.012, M.seamK, s * 0.4915, 0.36, seamZ[i])).name = 'door-seam-' + i;
    }
    put(doorTrim, box(0.02, 0.014, 0.115, M.seamK, s * 0.4935, 0.4555, 0.14)).name = 'door-handle-base-front';
    put(doorTrim, box(0.016, 0.022, 0.10, M.seamK, s * 0.5025, 0.4675, 0.14)).name = 'door-handle-grip-front';
    put(doorTrim, box(0.02, 0.014, 0.115, M.seamK, s * 0.4935, 0.4555, -0.26)).name = 'door-handle-base-rear';
    put(doorTrim, box(0.016, 0.022, 0.10, M.seamK, s * 0.5025, 0.4675, -0.26)).name = 'door-handle-grip-rear';
  }
  g.add(doorTrim);

  /* ======== mirror v2：外后视镜 ×2（双杆支架，A 柱根部） ======== */
  var miL = mirror(1);  miL.name = 'mirror';  put(g, miL, 0.434, 0.62, 0.28);
  var miR = mirror(-1); miR.name = 'mirror';  put(g, miR, -0.434, 0.62, 0.28);

  /* ======== exhaust：排气管（左后：横管 + 尾口） ======== */
  var exhaust = grp('exhaust');
  var pipe = cyl(0.022, 0.022, 0.44, 12, M.chrome, -0.30, 0.13, -0.90);
  pipe.name = 'exhaust-pipe';
  pipe.rotation.x = PI / 2;
  exhaust.add(pipe);
  var exh = cyl(0.026, 0.026, 0.09, 12, M.chrome, -0.30, 0.13, -1.13);
  exh.name = 'exhaust-tip';
  exh.rotation.x = PI / 2;
  exhaust.add(exh);
  g.add(exhaust);

  /* ======== interaction：警灯交替动画（t, dt）—— v1 已验收契约保留 ======== */
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
