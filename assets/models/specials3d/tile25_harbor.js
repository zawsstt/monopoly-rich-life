/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 25 轮渡码头（tile25_harbor.js）· 参考图高保真重建
 * -------------------------------------------------------------------------------------
 * 参考图 refs/sp_25.png：低多边形中式渡口（暖光、等轴 30° 俯视）
 *   主亭（渡口牌楼）：青灰筒瓦歇山大顶（凹坡 + 四角起翘 + 正脊/鸱吻）+ 4 根朱红柱 + 灰石柱础
 *                     + 两侧木格栅槛墙 + 檐下露明椽 + 四角悬红灯笼
 *   左侧小亭        ：单檐小青瓦顶 + 木长椅 + 灯杆
 *   高桩木栈桥      ：厚木板面（板缝纹理）+ 边梁 + 圆木桩列 + 前侧低一级的木跳板（黑轮胎护舷）
 *   石阶下水        ：五级灰石踏步自栈桥面下至水面（上船点）
 *   绳索护栏        ：灰石方柱 + 麻绳悬链（TubeGeometry 沿垂弧）
 *   乌篷画舫        ：分段放样低多边形船体（翘首翘尾）+ 木客舱 + 前低后高两段青灰篷顶
 *                     + 墨绿玻璃窗 + 格栅围栏 + 三只黑轮胎 + 船头红灯笼
 *   氛围            ：8 只红灯笼（呼吸发光 + 轻摆）、水面涟漪纹理缓流、画舫随波起伏
 *
 *   window.Special3D[25]() → THREE.Group（原点=格心，底面 y=0，水面朝 +Z 为正面）
 *   每次调用全新实例（材质不共享可变状态）
 *
 * 动画（group.userData.anim）：1) 画舫起伏  2) 灯笼呼吸  3) 灯笼轻摆  4) 水面纹理缓流
 * 技术约束：经典 script；THREE r147；MeshStandardMaterial；Canvas ≤256px；mesh ≤130；
 *           占地 ≤2.7×2.7；底面 y=0；零 Math.random。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[tile25_harbor] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

var PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs, pow = Math.pow;

/* ================= 0. 工具 ================= */
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(o.map ? (o.tint || '#ffffff') : hex),
    roughness: (o.rough !== undefined ? o.rough : 0.85),
    metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
  if (o.map) { m.map = o.map; m.userData.previewColor = hex; }
  if (o.side) m.side = o.side;
  return m;
}
function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function grp() { return new THREE.Group(); }
function mergeGeos(list) {
  var pos = [], nrm = [], uv = [], i, j, g, g2, p, n, u;
  for (i = 0; i < list.length; i++) {
    g = list[i]; g2 = g.index ? g.toNonIndexed() : g;
    p = g2.attributes.position.array;
    n = g2.attributes.normal ? g2.attributes.normal.array : null;
    u = g2.attributes.uv ? g2.attributes.uv.array : null;
    for (j = 0; j < p.length; j++) pos.push(p[j]);
    if (n) { for (j = 0; j < n.length; j++) nrm.push(n[j]); } else { for (j = 0; j < p.length; j++) nrm.push(0); }
    if (u) { for (j = 0; j < u.length; j++) uv.push(u[j]); } else { for (j = 0; j < p.length / 3 * 2; j++) uv.push(0); }
  }
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return out;
}
function tbox(w, h, d, x, y, z) { return new THREE.BoxGeometry(w, h, d).translate(x, y, z); }
function tcyl(rt, rb, h, seg, x, y, z) { return new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z); }
function tsph(r, x, y, z, sy) { var g = new THREE.SphereGeometry(r, 16, 12); if (sy) g.scale(1, sy, 1); return g.translate(x, y, z); }
function ttorus(r, tube, x, y, z, rotY) { var g = new THREE.TorusGeometry(r, tube, 8, 24); if (rotY) g.rotateY(rotY); return g.translate(x, y, z); }
function tbar(x0, y0, z0, x1, y1, z1, th) {
  var dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0), L = dir.length(); dir.normalize();
  var g = new THREE.BoxGeometry(th, th, L);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir));
  return g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
}
/* 麻绳悬链：两点间下垂 sag 的管 */
function rope(x0, y0, z0, x1, y1, z1, sag) {
  var c = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x0, y0, z0),
    new THREE.Vector3((x0 + x1) / 2, (y0 + y1) / 2 - sag, (z0 + z1) / 2),
    new THREE.Vector3(x1, y1, z1)
  ]);
  return new THREE.TubeGeometry(c, 10, 0.012, 6, false);
}
/* 中式凹坡歇山顶：檐口矩形 span×depth 于 y=0，脊高 rise、脊长 rl，四角起翘 up。
 * UV：u 沿檐口周长、v 檐→脊（瓦垄贴 0.8 单位一贴） */
function curvedRoof(span, depth, rise, rl, up, rows, perim) {
  rows = rows || 7; perim = perim || 48;
  var hw = span / 2, hd = depth / 2, hr = rl / 2, i, v, P = [];
  function perimPt(s) {
    var L = 2 * (span + depth) * s, x, z, L2;
    if (L < span) { x = -hw + L; z = hd; }
    else { L2 = L - span; if (L2 < depth) { x = hw; z = hd - L2; }
      else { L2 -= depth; if (L2 < span) { x = hw - L2; z = -hd; } else { L2 -= span; x = -hw; z = -hd + L2; } } }
    return { x: x, z: z };
  }
  for (i = 0; i < perim; i++) P.push(perimPt(i / perim));
  function surf(E, vv) {
    var rx = Math.max(-hr, Math.min(hr, E.x));
    var x = rx + (E.x - rx) * (1 - vv), z = E.z * (1 - vv);
    var corner = pow(abs(E.x) / hw, 3) * pow(abs(E.z) / hd, 3);
    var y = rise * pow(vv, 1.7) + up * corner * pow(1 - vv, 3);
    return [x, y, z];
  }
  var pos = [], uv = [], per = 2 * (span + depth) / 0.8, sl = Math.sqrt(hd * hd + rise * rise) / 0.8;
  for (i = 0; i < perim; i++) {
    var A = P[i], B = P[(i + 1) % perim];
    for (v = 0; v < rows; v++) {
      var v0 = v / rows, v1 = (v + 1) / rows;
      var a0 = surf(A, v0), a1 = surf(A, v1), b0 = surf(B, v0), b1 = surf(B, v1);
      pos.push(a0[0], a0[1], a0[2], b0[0], b0[1], b0[2], b1[0], b1[1], b1[2]);
      pos.push(a0[0], a0[1], a0[2], b1[0], b1[1], b1[2], a1[0], a1[1], a1[2]);
      uv.push(i / perim * per, v0 * sl, (i + 1) / perim * per, v0 * sl, (i + 1) / perim * per, v1 * sl);
      uv.push(i / perim * per, v0 * sl, (i + 1) / perim * per, v1 * sl, i / perim * per, v1 * sl);
    }
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  /* 封檐板（檐口一圈竖板，随起翘） */
  var sp = [], suv = [], TH = 0.035;
  for (i = 0; i < perim; i++) {
    var A2 = P[i], B2 = P[(i + 1) % perim], at = surf(A2, 0), bt = surf(B2, 0);
    var al = Math.sqrt(at[0] * at[0] + at[2] * at[2]) || 1, bl = Math.sqrt(bt[0] * bt[0] + bt[2] * bt[2]) || 1;
    at = [at[0] + at[0] / al * 0.006, at[1], at[2] + at[2] / al * 0.006];
    bt = [bt[0] + bt[0] / bl * 0.006, bt[1], bt[2] + bt[2] / bl * 0.006];
    sp.push(at[0], at[1], at[2], bt[0], bt[1], bt[2], bt[0], bt[1] - TH, bt[2]);
    sp.push(at[0], at[1], at[2], bt[0], bt[1] - TH, bt[2], at[0], at[1] - TH, at[2]);
    suv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
  }
  var skirt = new THREE.BufferGeometry();
  skirt.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  skirt.setAttribute('uv', new THREE.Float32BufferAttribute(suv, 2));
  skirt.computeVertexNormals();
  return { top: g, skirt: skirt };
}
/* 小四坡顶（篷顶/小亭用，直坡） */
function hipRoof(w, d, h, rl) {
  var hw = w / 2, hd = d / 2, hr = rl / 2, pos = [], uv = [], sl = Math.sqrt(hd * hd + h * h) / 0.8, k = w / 0.8;
  function tri(a, b, c, ua, va, ub, vb, uc, vc) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); uv.push(ua, va, ub, vb, uc, vc); }
  var A, B, Cc, D;
  A = [-hw, 0, hd]; B = [hw, 0, hd]; Cc = [hr, h, 0]; D = [-hr, h, 0];
  tri(A, B, Cc, 0, 0, k, 0, (hr + hw) / 0.8, sl); tri(A, Cc, D, 0, 0, (hr + hw) / 0.8, sl, (hw - hr) / 0.8, sl);
  A = [hw, 0, -hd]; B = [-hw, 0, -hd]; Cc = [-hr, h, 0]; D = [hr, h, 0];
  tri(A, B, Cc, 0, 0, k, 0, (hr + hw) / 0.8, sl); tri(A, Cc, D, 0, 0, (hr + hw) / 0.8, sl, (hw - hr) / 0.8, sl);
  A = [-hw, 0, -hd]; B = [-hw, 0, hd]; Cc = [-hr, h, 0]; tri(A, B, Cc, 0, 0, d / 0.8, 0, hd / 0.8, sl);
  A = [hw, 0, hd]; B = [hw, 0, -hd]; Cc = [hr, h, 0]; tri(A, B, Cc, 0, 0, d / 0.8, 0, hd / 0.8, sl);
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}
/* 画舫船体：沿 x 分段放样（翘首翘尾、尖艏艉），龙骨 y≈0.03、舷缘 y≈0.22..0.29 */
function hullGeo(L, B) {
  var N = 12, i, secs = [], pos = [], uv = [];
  for (i = 0; i <= N; i++) {
    var u = -1 + 2 * i / N, x = u * L / 2, au = abs(u);
    var w = (B / 2) * Math.sqrt(Math.max(0, 1 - pow(au, 2.8))) * (1 - 0.08 * u);
    var yb = 0.03 + 0.11 * pow(au, 4), yt = 0.22 + 0.075 * pow(au, 2.2);
    secs.push([[x, yb, 0], [x, yb + 0.04, w * 0.92], [x, yt, w]]);
  }
  function quad(a, b, c, d, flip) {
    if (!flip) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2], a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2]); }
    else { pos.push(a[0], a[1], a[2], c[0], c[1], c[2], b[0], b[1], b[2], a[0], a[1], a[2], d[0], d[1], d[2], c[0], c[1], c[2]); }
    uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
  }
  function mir(p) { return [p[0], p[1], -p[2]]; }
  for (i = 0; i < N; i++) {
    var s0 = secs[i], s1 = secs[i + 1];
    quad(s0[0], s1[0], s1[1], s0[1], false); quad(s0[1], s1[1], s1[2], s0[2], false);
    quad(mir(s0[0]), mir(s1[0]), mir(s1[1]), mir(s0[1]), true); quad(mir(s0[1]), mir(s1[1]), mir(s1[2]), mir(s0[2]), true);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/* ================= 1. Canvas 纹理（≤256px） ================= */
function canvasTex(w, h, draw, rx, ry) {
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  var g = cv.getContext('2d'); draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (rx || ry) tex.repeat.set(rx || 1, ry || 1);
  return tex;
}
/* 青灰筒瓦：8 垄/贴 */
function texSlateTile() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#3d4d5c'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 8; i++) {
      var x = i * 16;
      g.fillStyle = '#28343f'; g.fillRect(x, 0, 3, h);
      g.fillStyle = '#34424f'; g.fillRect(x + 3, 0, 3, h);
      g.fillStyle = '#5a6d7e'; g.fillRect(x + 9, 0, 2, h);
      g.fillStyle = '#46586a'; g.fillRect(x + 11, 0, 3, h);
    }
    g.fillStyle = 'rgba(15,22,30,0.32)';
    for (i = 0; i < 8; i++) g.fillRect(0, i * 16 + 13, w, 2);
  });
}
/* 木板面：暖棕 + 板缝 + 木纹 */
function texPlank() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#a9743e'; g.fillRect(0, 0, w, h);
    var i, j;
    for (i = 0; i < 8; i++) {
      g.fillStyle = (i % 3 === 0) ? '#b07c45' : ((i % 3 === 1) ? '#a26e3a' : '#ab7640');
      g.fillRect(0, i * 16, w, 16);
      g.fillStyle = '#5e3a1a'; g.fillRect(0, i * 16, w, 2);
      g.fillStyle = 'rgba(255,220,160,0.18)'; g.fillRect(0, i * 16 + 2, w, 1);
      for (j = 0; j < 3; j++) { g.fillStyle = 'rgba(80,45,15,0.22)'; g.fillRect(0, i * 16 + 5 + j * 4, w, 1); }
    }
    g.fillStyle = 'rgba(70,40,15,0.45)';
    g.fillRect(40, 0, 2, 64); g.fillRect(96, 64, 2, 64); g.fillRect(20, 96, 2, 32);
  });
}
/* 水面：青碧底 + 弧形涟漪高光 */
function texWater() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#2f7a72'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(160,220,210,0.35)'; g.lineWidth = 2;
    var i, pts = [[20, 30], [70, 20], [100, 60], [40, 80], [90, 105], [15, 110]];
    for (i = 0; i < pts.length; i++) { g.beginPath(); g.arc(pts[i][0], pts[i][1], 14 + (i % 3) * 5, PI * 1.05, PI * 1.85); g.stroke(); }
    g.strokeStyle = 'rgba(20,70,65,0.35)';
    for (i = 0; i < pts.length; i++) { g.beginPath(); g.arc(pts[i][0] + 4, pts[i][1] + 5, 15 + (i % 3) * 5, PI * 1.1, PI * 1.8); g.stroke(); }
  }, 4, 4);
}

/* ================= 2. 工厂 ================= */
window.Special3D = window.Special3D || {};
window.Special3D[25] = function () {
  var g = grp();
  g.name = 'special_25_ferry_harbor';

  var waterTex = texWater();
  var M = {
    water:  std('#2f7a72', { rough: 0.25, metal: 0.1, map: waterTex, tint: '#dff2ee' }),
    plank:  std('#a9743e', { rough: 0.85, map: texPlank() }),
    wood:   std('#7a4a22', { rough: 0.85 }),
    dark:   std('#4a2c14', { rough: 0.9 }),
    red:    std('#c23b22', { rough: 0.55 }),
    tile:   std('#3d4d5c', { rough: 0.7, map: texSlateTile(), side: THREE.DoubleSide }),
    fascia: std('#2a3540', { rough: 0.8, side: THREE.DoubleSide }),
    stone:  std('#9a9a96', { rough: 0.9 }),
    stoneD: std('#7c7c78', { rough: 0.9 }),
    rope:   std('#c9a05c', { rough: 0.9 }),
    tire:   std('#2b2b2b', { rough: 0.95 }),
    canopy: std('#3e4e60', { rough: 0.7 }),
    glass:  std('#2e6b4f', { rough: 0.3, metal: 0.2 }),
    gold:   std('#e8b93a', { rough: 0.45, metal: 0.3 }),
    hull:   std('#8a5a2a', { rough: 0.8, side: THREE.DoubleSide })
  };
  var lanternM = std('#d93a2b', { rough: 0.5, emissive: '#ff4a30', ei: 0.55 });

  var s, i, DK = 0.36, DB = 0.28;      /* 主栈桥面 / 前跳板面 */
  var plankL = [], woodL = [], darkL = [], redL = [], tileL = [], fasciaL = [], stoneL = [], stoneDL = [], ropeL = [], tireL = [], goldL = [];

  /* ========== 水面 ========== */
  g.add(mesh(new THREE.BoxGeometry(2.66, 0.03, 2.66).translate(0, 0.015, 0), M.water));

  /* ========== 栈桥：主台（高）+ 前跳板（低）+ 边梁 + 木桩 ========== */
  plankL.push(tbox(2.64, 0.06, 1.40, 0, DK - 0.03, -0.60));               /* 主台 z-1.30..0.10 */
  plankL.push(tbox(1.12, 0.06, 0.50, -0.76, DB - 0.03, 0.35));             /* 跳板 x-1.32..-0.20 z0.10..0.60 */
  darkL.push(tbox(2.64, 0.05, 0.05, 0, DK - 0.085, 0.10));                 /* 主台前边梁 */
  darkL.push(tbox(2.64, 0.05, 0.05, 0, DK - 0.085, -1.30));
  darkL.push(tbox(0.05, 0.05, 1.40, 1.32, DK - 0.085, -0.60));
  darkL.push(tbox(0.05, 0.05, 1.40, -1.32, DK - 0.085, -0.60));
  darkL.push(tbox(1.12, 0.05, 0.05, -0.76, DB - 0.085, 0.60));
  darkL.push(tbox(0.05, 0.05, 0.50, -1.32, DB - 0.085, 0.35));
  var px = [-1.22, -0.82, -0.42, -0.02, 0.38, 0.78, 1.22], pz = [-1.22, -0.62, 0.02], a, b;
  for (a = 0; a < px.length; a++) for (b = 0; b < pz.length; b++) woodL.push(tcyl(0.036, 0.042, 0.30, 12, px[a], 0.15, pz[b]));
  woodL.push(tcyl(0.036, 0.042, 0.24, 12, -1.24, 0.12, 0.54));
  woodL.push(tcyl(0.036, 0.042, 0.24, 12, -0.76, 0.12, 0.54));
  woodL.push(tcyl(0.036, 0.042, 0.24, 12, -0.28, 0.12, 0.54));
  /* 桩间斜撑 ×3（参考图桩下横杆） */
  woodL.push(tbox(1.60, 0.03, 0.03, 0.40, 0.20, 0.02));
  woodL.push(tbox(0.03, 0.03, 1.20, 1.22, 0.20, -0.60));
  /* 跳板前沿黑轮胎护舷 ×3 */
  tireL.push(ttorus(0.055, 0.02, -1.10, 0.20, 0.64));
  tireL.push(ttorus(0.055, 0.02, -0.80, 0.20, 0.64));
  tireL.push(ttorus(0.055, 0.02, -0.50, 0.20, 0.64));

  /* ========== 石阶下水（五级）========== */
  for (i = 0; i < 5; i++) {
    var top = DK - 0.06 * (i + 1);
    stoneL.push(tbox(0.50, top, 0.10, 0.15, top / 2, 0.15 + 0.10 * i));
    stoneDL.push(tbox(0.50, 0.012, 0.02, 0.15, top + 0.006, 0.10 + 0.10 * i + 0.01));   /* 踏步沿线 */
  }
  stoneDL.push(tbox(0.05, 0.30, 0.50, -0.125, 0.15, 0.35));                /* 石阶侧墙 ×2 */
  stoneDL.push(tbox(0.05, 0.30, 0.50, 0.425, 0.15, 0.35));

  /* ========== 绳索护栏（灰石方柱 + 麻绳悬链）========== */
  function post(x, z, base) {
    stoneL.push(tbox(0.06, 0.18, 0.06, x, base + 0.09, z));
    stoneDL.push(tbox(0.078, 0.022, 0.078, x, base + 0.19, z));
    stoneDL.push(tbox(0.05, 0.02, 0.05, x, base + 0.21, z));
  }
  function ropeRun(pts, base) {
    var k;
    for (k = 0; k < pts.length; k++) post(pts[k][0], pts[k][1], base);
    for (k = 0; k + 1 < pts.length; k++) ropeL.push(rope(pts[k][0], base + 0.16, pts[k][1], pts[k + 1][0], base + 0.16, pts[k + 1][1], 0.045));
  }
  ropeRun([[0.48, 0.06], [0.78, 0.06], [1.05, 0.06], [1.28, 0.06], [1.28, -0.35], [1.28, -0.78], [1.28, -1.26], [0.85, -1.26], [0.40, -1.26]], DK);
  ropeRun([[-0.16, 0.06], [-0.16, -0.30]], DK);
  ropeRun([[-1.28, -1.26], [-1.28, -0.85], [-1.28, -0.45], [-1.28, -0.05]], DK);
  ropeRun([[-1.28, 0.55], [-0.95, 0.55], [-0.60, 0.55], [-0.26, 0.55], [-0.26, 0.14]], DB);
  post(-0.60, -1.26, DK); post(-1.0, -1.26, DK);
  ropeL.push(rope(-0.60, DK + 0.16, -1.26, -1.0, DK + 0.16, -1.26, 0.045));
  ropeL.push(rope(-1.0, DK + 0.16, -1.26, -1.28, DK + 0.16, -1.26, 0.04));
  ropeL.push(rope(0.40, DK + 0.16, -1.26, -0.60, DK + 0.16, -1.26, 0.06));

  /* ========== 主亭（渡口牌楼）========== */
  var PX = -0.12, PZ = -0.66, CT = DK + 0.70;               /* 柱顶 y=1.06 */
  var colPts = [[PX - 0.46, PZ - 0.28], [PX + 0.46, PZ - 0.28], [PX - 0.46, PZ + 0.28], [PX + 0.46, PZ + 0.28]];
  for (i = 0; i < 4; i++) {
    redL.push(tcyl(0.042, 0.046, 0.68, 14, colPts[i][0], DK + 0.36, colPts[i][1]));
    stoneL.push(tbox(0.14, 0.05, 0.14, colPts[i][0], DK + 0.025, colPts[i][1]));
    stoneDL.push(tbox(0.11, 0.02, 0.11, colPts[i][0], DK + 0.06, colPts[i][1]));
    goldL.push(tcyl(0.05, 0.045, 0.025, 14, colPts[i][0], CT - 0.36, colPts[i][1]));   /* 柱身金箍 */
    darkL.push(tbox(0.12, 0.05, 0.12, colPts[i][0], CT + 0.01, colPts[i][1]));      /* 栌斗 */
  }
  darkL.push(tbox(1.06, 0.07, 0.08, PX, CT + 0.06, PZ + 0.28));            /* 前后额枋 */
  darkL.push(tbox(1.06, 0.07, 0.08, PX, CT + 0.06, PZ - 0.28));
  darkL.push(tbox(0.08, 0.07, 0.64, PX - 0.46, CT + 0.06, PZ));            /* 左右额枋 */
  darkL.push(tbox(0.08, 0.07, 0.64, PX + 0.46, CT + 0.06, PZ));
  redL.push(tbox(1.00, 0.035, 0.05, PX, CT - 0.10, PZ + 0.30));            /* 朱红下枋（前后） */
  redL.push(tbox(1.00, 0.035, 0.05, PX, CT - 0.10, PZ - 0.30));
  goldL.push(tbox(1.00, 0.014, 0.052, PX, CT - 0.075, PZ + 0.30));         /* 枋上金线 */
  goldL.push(tbox(1.00, 0.014, 0.052, PX, CT - 0.075, PZ - 0.30));
  /* 檐下斗拱小斗（前后各 7） */
  for (i = 0; i < 7; i++) {
    darkL.push(tbox(0.05, 0.05, 0.06, PX - 0.36 + i * 0.12, CT + 0.125, PZ + 0.32));
    darkL.push(tbox(0.05, 0.05, 0.06, PX - 0.36 + i * 0.12, CT + 0.125, PZ - 0.32));
  }
  /* 两侧木格栅槛墙（x=PX±0.44 面，y DK..DK+0.40） */
  for (s = -1; s <= 1; s += 2) {
    var wx = PX + s * 0.46;
    woodL.push(tbox(0.05, 0.04, 0.50, wx, DK + 0.40, PZ));                 /* 上槛 */
    woodL.push(tbox(0.05, 0.04, 0.50, wx, DK + 0.14, PZ));                 /* 下槛 */
    darkL.push(tbox(0.03, 0.12, 0.50, wx, DK + 0.07, PZ));                 /* 裙板 */
    for (i = 0; i < 5; i++) woodL.push(tbox(0.035, 0.24, 0.02, wx, DK + 0.27, PZ - 0.20 + i * 0.10));   /* 竖棂 */
    woodL.push(tbox(0.035, 0.02, 0.48, wx, DK + 0.27, PZ));                /* 横棂 */
    woodL.push(tbox(0.035, 0.02, 0.48, wx, DK + 0.33, PZ));
  }
  /* 歇山大顶（凹坡起翘）+ 封檐板 + 正脊 + 鸱吻 + 脊刹 + 露明椽 */
  var roof = curvedRoof(1.54, 1.10, 0.36, 0.70, 0.17, 8, 56);
  tileL.push(roof.top.translate(PX, CT + 0.16, PZ));
  fasciaL.push(roof.skirt.translate(PX, CT + 0.16, PZ));
  darkL.push(tbox(0.76, 0.05, 0.09, PX, CT + 0.535, PZ));                  /* 正脊 */
  darkL.push(tbar(PX - 0.38, CT + 0.52, PZ, PX - 0.47, CT + 0.63, PZ, 0.05));  /* 鸱吻 ×2 */
  darkL.push(tbar(PX + 0.38, CT + 0.52, PZ, PX + 0.47, CT + 0.63, PZ, 0.05));
  goldL.push(tbox(0.06, 0.06, 0.06, PX, CT + 0.58, PZ));                   /* 脊刹 */
  goldL.push(tsph(0.03, PX, CT + 0.635, PZ));
  for (i = 0; i < 11; i++) {                                               /* 露明椽（前后） */
    redL.push(tbox(0.024, 0.02, 0.16, PX - 0.60 + i * 0.12, CT + 0.14, PZ + 0.48));
    redL.push(tbox(0.024, 0.02, 0.16, PX - 0.60 + i * 0.12, CT + 0.14, PZ - 0.48));
  }
  for (i = 0; i < 7; i++) {                                                /* 露明椽（左右） */
    redL.push(tbox(0.16, 0.02, 0.024, PX - 0.70, CT + 0.14, PZ - 0.36 + i * 0.12));
    redL.push(tbox(0.16, 0.02, 0.024, PX + 0.70, CT + 0.14, PZ - 0.36 + i * 0.12));
  }

  /* ========== 左侧小亭：单檐小青瓦 + 木长椅 ========== */
  var SX = -0.96, SZ = -0.56, ST = DK + 0.42;
  for (s = -1; s <= 1; s += 2) {
    woodL.push(tcyl(0.024, 0.026, 0.42, 12, SX + s * 0.20, DK + 0.21, SZ - 0.20));
    woodL.push(tcyl(0.024, 0.026, 0.42, 12, SX + s * 0.20, DK + 0.21, SZ + 0.20));
    stoneL.push(tbox(0.07, 0.03, 0.07, SX + s * 0.20, DK + 0.015, SZ - 0.20));
    stoneL.push(tbox(0.07, 0.03, 0.07, SX + s * 0.20, DK + 0.015, SZ + 0.20));
  }
  darkL.push(tbox(0.48, 0.05, 0.05, SX, ST + 0.02, SZ + 0.20));
  darkL.push(tbox(0.48, 0.05, 0.05, SX, ST + 0.02, SZ - 0.20));
  darkL.push(tbox(0.05, 0.05, 0.44, SX - 0.20, ST + 0.02, SZ));
  darkL.push(tbox(0.05, 0.05, 0.44, SX + 0.20, ST + 0.02, SZ));
  var sroof = curvedRoof(0.62, 0.60, 0.13, 0.26, 0.06, 5, 36);
  tileL.push(sroof.top.translate(SX, ST + 0.06, SZ));
  fasciaL.push(sroof.skirt.translate(SX, ST + 0.06, SZ));
  darkL.push(tbox(0.30, 0.04, 0.06, SX, ST + 0.20, SZ));
  /* 长椅：座板 + 靠背 + 腿 */
  plankL.push(tbox(0.34, 0.03, 0.13, SX, DK + 0.16, SZ - 0.06));
  woodL.push(tbox(0.34, 0.13, 0.025, SX, DK + 0.25, SZ - 0.12));
  woodL.push(tbox(0.03, 0.16, 0.03, SX - 0.15, DK + 0.08, SZ - 0.06));
  woodL.push(tbox(0.03, 0.16, 0.03, SX + 0.15, DK + 0.08, SZ - 0.06));
  /* 小亭侧格栅 */
  for (i = 0; i < 4; i++) woodL.push(tbox(0.02, 0.22, 0.03, SX - 0.20, DK + 0.20, SZ - 0.15 + i * 0.10));
  woodL.push(tbox(0.03, 0.02, 0.40, SX - 0.20, DK + 0.31, SZ));

  /* ========== 灯杆 ×2（右前 / 左跳板）========== */
  woodL.push(tbox(0.055, 0.78, 0.055, 1.10, DK + 0.39, -0.62));
  woodL.push(tbox(0.32, 0.04, 0.04, 0.96, DK + 0.75, -0.62));
  woodL.push(tbar(1.08, DK + 0.62, -0.62, 0.88, DK + 0.73, -0.62, 0.025)); /* 斜撑 */
  woodL.push(tbox(0.055, 0.64, 0.055, -1.22, DB + 0.32, 0.36));
  woodL.push(tbox(0.30, 0.04, 0.04, -1.08, DB + 0.61, 0.36));
  woodL.push(tbar(-1.20, DB + 0.50, 0.36, -1.02, DB + 0.59, 0.36, 0.025));

  /* ========== 红灯笼 ×7（岸上）：独立 mesh（轻摆）+ 金盖/流苏合并 ========== */
  var lanterns = [];
  function lantern(x, y, z, r) {
    /* 支点在吊绳顶 (x,y,z)；灯体中心在 y - 0.02 - r*0.9 */
    var body = new THREE.SphereGeometry(r, 16, 12); body.scale(1, 0.86, 1); body.translate(0, -0.02 - r * 0.9, 0);
    var mm = mesh(body, lanternM); mm.position.set(x, y, z); mm.castShadow = false;
    goldL.push(tcyl(r * 0.55, r * 0.55, 0.012, 12, x, y - 0.02 - r * 0.9 + r * 0.86, z));
    goldL.push(tcyl(r * 0.55, r * 0.55, 0.012, 12, x, y - 0.02 - r * 0.9 - r * 0.86, z));
    goldL.push(tcyl(0.006, 0.010, r * 1.0, 8, x, y - 0.02 - r * 0.9 - r * 0.86 - r * 0.5, z));
    darkL.push(tcyl(0.004, 0.004, 0.02, 6, x, y - 0.01, z));
    g.add(mm); lanterns.push(mm);
    return mm;
  }
  lantern(0.84, DK + 0.73, -0.62, 0.06);
  lantern(-0.97, DB + 0.59, 0.36, 0.055);
  lantern(PX - 0.62, CT + 0.12, PZ + 0.50, 0.055);
  lantern(PX + 0.62, CT + 0.12, PZ + 0.50, 0.055);
  lantern(PX - 0.62, CT + 0.12, PZ - 0.50, 0.055);
  lantern(PX + 0.62, CT + 0.12, PZ - 0.50, 0.055);
  lantern(SX + 0.24, ST + 0.02, SZ + 0.24, 0.045);

  /* ========== 乌篷画舫（+x 为船头，停靠右前水面）========== */
  var boat = grp(); boat.position.set(0.66, -0.02, 0.86); boat.rotation.y = 0.10; boat.scale.set(1.1, 1.1, 1.1); g.add(boat);
  var BL = 1.16, BB = 0.44;
  boat.add(mesh(hullGeo(BL, BB), M.hull));
  var bPlank = [], bWood = [], bDark = [], bCanopy = [], bGlass = [], bTire = [], bGold = [];
  bPlank.push(tbox(0.96, 0.02, 0.36, 0, 0.215, 0));                         /* 甲板 */
  bWood.push(tbox(1.04, 0.025, 0.03, 0, 0.245, 0.195));                     /* 舷缘条 ×2 */
  bWood.push(tbox(1.04, 0.025, 0.03, 0, 0.245, -0.195));
  /* 木客舱（中后段）+ 墨绿玻璃窗 + 舱门 */
  bWood.push(tbox(0.50, 0.20, 0.30, -0.10, 0.325, 0));
  bGlass.push(tbox(0.16, 0.10, 0.012, -0.20, 0.35, 0.155)); bGlass.push(tbox(0.16, 0.10, 0.012, 0.02, 0.35, 0.155));
  bGlass.push(tbox(0.16, 0.10, 0.012, -0.20, 0.35, -0.155)); bGlass.push(tbox(0.16, 0.10, 0.012, 0.02, 0.35, -0.155));
  bDark.push(tbox(0.02, 0.12, 0.34, -0.09, 0.35, 0));                        /* 窗间竖框 */
  bDark.push(tbox(0.52, 0.02, 0.32, -0.10, 0.30, 0));                        /* 窗下横框 */
  bDark.push(tbox(0.012, 0.14, 0.10, 0.155, 0.32, 0));                       /* 舱门 */
  /* 后段高篷（青灰）+ 前段低篷 + 篷柱 */
  bCanopy.push(hipRoof(0.64, 0.44, 0.06, 0.52).translate(-0.10, 0.44, 0));
  bDark.push(tbox(0.64, 0.02, 0.44, -0.10, 0.43, 0));
  bCanopy.push(hipRoof(0.36, 0.38, 0.045, 0.28).translate(0.34, 0.37, 0));
  bDark.push(tbox(0.36, 0.018, 0.38, 0.34, 0.36, 0));
  for (s = -1; s <= 1; s += 2) {
    bWood.push(tbox(0.025, 0.14, 0.025, 0.19, 0.29, s * 0.16));
    bWood.push(tbox(0.025, 0.14, 0.025, 0.49, 0.29, s * 0.16));
    bWood.push(tbox(0.025, 0.09, 0.025, -0.40, 0.39, s * 0.19));
    bWood.push(tbox(0.025, 0.09, 0.025, 0.19, 0.39, s * 0.19));
  }
  /* 船头/船尾格栅围栏 */
  for (i = 0; i < 4; i++) { bWood.push(tbox(0.02, 0.07, 0.02, 0.24 + i * 0.09, 0.26, 0.17)); bWood.push(tbox(0.02, 0.07, 0.02, 0.24 + i * 0.09, 0.26, -0.17)); }
  bWood.push(tbox(0.36, 0.02, 0.02, 0.37, 0.295, 0.17)); bWood.push(tbox(0.36, 0.02, 0.02, 0.37, 0.295, -0.17));
  for (i = 0; i < 3; i++) { bWood.push(tbox(0.02, 0.07, 0.02, -0.40 - i * 0.07, 0.26, 0.16)); bWood.push(tbox(0.02, 0.07, 0.02, -0.40 - i * 0.07, 0.26, -0.16)); }
  bWood.push(tbox(0.20, 0.02, 0.02, -0.47, 0.295, 0.16)); bWood.push(tbox(0.20, 0.02, 0.02, -0.47, 0.295, -0.16));
  /* 舷侧黑轮胎 ×3（迎观者一侧 +z） */
  bTire.push(ttorus(0.05, 0.018, -0.30, 0.15, 0.205)); bTire.push(ttorus(0.05, 0.018, 0.02, 0.15, 0.215)); bTire.push(ttorus(0.05, 0.018, 0.32, 0.15, 0.19));
  /* 竹篙 + 缆绳桩 */
  bWood.push(tbar(-0.50, 0.24, -0.12, 0.10, 0.62, -0.19, 0.014));
  bDark.push(tcyl(0.018, 0.018, 0.06, 8, 0.52, 0.27, 0));
  bGold.push(tbox(0.04, 0.02, 0.10, 0.56, 0.30, 0));                       /* 船首金饰 */
  boat.add(mesh(mergeGeos(bPlank), M.plank));
  boat.add(mesh(mergeGeos(bWood), M.wood));
  boat.add(mesh(mergeGeos(bDark), M.dark));
  boat.add(mesh(mergeGeos(bCanopy), M.canopy));
  boat.add(mesh(mergeGeos(bGlass), M.glass));
  boat.add(mesh(mergeGeos(bTire), M.tire));
  boat.add(mesh(mergeGeos(bGold), M.gold));
  /* 船头红灯笼（随船） */
  var bl = new THREE.SphereGeometry(0.04, 16, 12); bl.scale(1, 0.86, 1); bl.translate(0, -0.05, 0);
  var boatLantern = mesh(bl, lanternM); boatLantern.position.set(0.50, 0.36, 0.17); boatLantern.castShadow = false;
  boat.add(boatLantern); lanterns.push(boatLantern);
  /* 船缆（船头 → 岸上石柱） */
  ropeL.push(rope(1.02, 0.30, 0.94, 1.28, DK + 0.16, 0.06, 0.05));

  /* ========== 合并落地 ========== */
  g.add(mesh(mergeGeos(plankL), M.plank));
  g.add(mesh(mergeGeos(woodL), M.wood));
  g.add(mesh(mergeGeos(darkL), M.dark));
  g.add(mesh(mergeGeos(redL), M.red));
  g.add(mesh(mergeGeos(tileL), M.tile));
  g.add(mesh(mergeGeos(fasciaL), M.fascia));
  g.add(mesh(mergeGeos(stoneL), M.stone));
  g.add(mesh(mergeGeos(stoneDL), M.stoneD));
  g.add(mesh(mergeGeos(ropeL), M.rope));
  g.add(mesh(mergeGeos(tireL), M.tire));
  g.add(mesh(mergeGeos(goldL), M.gold));

  /* ========== 动画 ========== */
  var boatY0 = boat.position.y;
  g.userData.anim = [
    function (t) {                                   /* 1) 画舫随波起伏 */
      boat.position.y = boatY0 + 0.012 * sin(t * 1.3);
      boat.rotation.z = 0.022 * sin(t * 0.9);
      boat.rotation.x = 0.014 * sin(t * 1.1 + 1.0);
    },
    function (t) {                                   /* 2) 灯笼呼吸 */
      lanternM.emissiveIntensity = 0.55 + 0.2 * sin(t * 1.6);
    },
    function (t) {                                   /* 3) 灯笼轻摆（≤0.07rad） */
      var k;
      for (k = 0; k < lanterns.length; k++) {
        lanterns[k].rotation.z = 0.06 * sin(t * 1.4 + k * 0.9);
        lanterns[k].rotation.x = 0.04 * sin(t * 1.1 + k * 1.3);
      }
    },
    function (t, dt) {                               /* 4) 水面涟漪缓流 */
      waterTex.offset.x = (t * 0.012) % 1;
      waterTex.offset.y = (t * 0.008) % 1;
    }
  ];
  return g;
};
})();
