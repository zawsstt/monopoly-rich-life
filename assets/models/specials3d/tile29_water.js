/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 29 自来水厂（tile29_water.js）· 参考图高保真重建
 * -------------------------------------------------------------------------------------
 * 参考图 refs/ref_utility_water_2.png：等轴俯视紧凑单地台水厂
 *   地台      ：浅灰混凝土矩形平台 + 四周绿草边带 + 白色围栏 + 圆冠树 ×6
 *   圆形沉淀池：大池 A（左前）+ 池 B（后中），混凝土环壁（外壁/内壁/压顶环）+ 清水蓝池水
 *               + 溢流堰内环 + 中心立柱 + 旋转刮泥桥（黄栏杆，动画旋转）+ 池顶黄色环形栏杆
 *   矩形水池  ：右前三格并列清水池，白色格栅走道分隔 + 黄栏杆 + 混凝土围堰
 *   泵房      ：右后白墙两层小楼 + 亮蓝四坡顶 + 蓝门 + 蓝雨篷 + 青灰窗 + 状态灯
 *   管道      ：亮蓝明管主干（地面支墩）+ 竖向弯头分支入池/入泵房 + 红色阀门手轮 ×3 + 侧向环管
 *   附属      ：白色设备箱、灰色控制柜
 *
 *   window.Special3D[29]() → THREE.Group（原点=格心，底面 y=0，正面朝 +Z）
 *   每次调用全新实例（材质不共享可变状态）
 *
 * 动画：1) 两座刮泥桥缓转（异速反向）  2) 池水涟漪纹理漂移  3) 泵房状态灯呼吸
 * 技术约束：经典 script；THREE r147；MeshStandardMaterial；Canvas ≤256px；mesh ≤130；
 *           占地 ≤2.7×2.7；底面 y=0；零 Math.random。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[tile29_water] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

var PI = Math.PI, sin = Math.sin, cos = Math.cos;

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
function tsph(r, x, y, z) { return new THREE.SphereGeometry(r, 16, 12).translate(x, y, z); }
/* 水平圆管：沿 x（axis='x'）或沿 z（axis='z'），中心 (x,y,z)，长 L */
function pipeH(r, L, axis, x, y, z) {
  var g = new THREE.CylinderGeometry(r, r, L, 12);
  if (axis === 'x') g.rotateZ(PI / 2); else g.rotateX(PI / 2);
  return g.translate(x, y, z);
}
function pipeV(r, y0, y1, x, z) { return new THREE.CylinderGeometry(r, r, y1 - y0, 12).translate(x, (y0 + y1) / 2, z); }
/* 四坡顶（脊沿 x） */
function hipRoof(w, d, h, rl) {
  var hw = w / 2, hd = d / 2, hr = rl / 2, pos = [], uv = [];
  function tri(a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); uv.push(0, 0, 1, 0, 1, 1); }
  var A, B, Cc, D;
  A = [-hw, 0, hd]; B = [hw, 0, hd]; Cc = [hr, h, 0]; D = [-hr, h, 0]; tri(A, B, Cc); tri(A, Cc, D);
  A = [hw, 0, -hd]; B = [-hw, 0, -hd]; Cc = [-hr, h, 0]; D = [hr, h, 0]; tri(A, B, Cc); tri(A, Cc, D);
  A = [-hw, 0, -hd]; B = [-hw, 0, hd]; Cc = [-hr, h, 0]; tri(A, B, Cc);
  A = [hw, 0, hd]; B = [hw, 0, -hd]; Cc = [hr, h, 0]; tri(A, B, Cc);
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  return g;
}

/* ================= 1. Canvas 纹理 ================= */
function canvasTex(w, h, draw, rx, ry) {
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  var g = cv.getContext('2d'); draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (rx || ry) tex.repeat.set(rx || 1, ry || 1);
  return tex;
}
/* 清水池水：明亮蓝 + 焦散网纹高光 */
function texPoolWater() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#1f9fc6'; g.fillRect(0, 0, w, h);
    var i, j;
    g.strokeStyle = 'rgba(190,240,250,0.45)'; g.lineWidth = 2;
    for (i = 0; i < 6; i++) {
      g.beginPath();
      for (j = 0; j <= 8; j++) { var x = j * 16, y = i * 22 + 8 * sin(j * 1.3 + i); if (j === 0) g.moveTo(x, y); else g.lineTo(x, y); }
      g.stroke();
      g.beginPath();
      for (j = 0; j <= 8; j++) { var x2 = i * 22 + 8 * cos(j * 1.1 + i), y2 = j * 16; if (j === 0) g.moveTo(x2, y2); else g.lineTo(x2, y2); }
      g.stroke();
    }
    g.fillStyle = 'rgba(10,80,120,0.18)';
    for (i = 0; i < 5; i++) g.fillRect((i * 37) % w, (i * 53) % h, 14, 6);
  }, 3, 3);
}
/* 混凝土地台：浅灰 + 分缝 + 微噪 */
function texConcrete() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#c9cdd1'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,126,132,0.5)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(64, 0); g.lineTo(64, h); g.stroke();
    g.beginPath(); g.moveTo(0, 64); g.lineTo(w, 64); g.stroke();
    var i;
    for (i = 0; i < 40; i++) { g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.12)' : 'rgba(90,96,102,0.10)'; g.fillRect((i * 29) % w, (i * 47) % h, 3, 2); }
  }, 6, 6);
}
/* 草地：绿 + 割草条纹 */
function texLawn() {
  return canvasTex(64, 64, function (g, w, h) {
    var i;
    for (i = 0; i < 4; i++) { g.fillStyle = (i % 2) ? '#7cb043' : '#8cc050'; g.fillRect(0, i * 16, w, 16); }
    for (i = 0; i < 30; i++) { g.fillStyle = 'rgba(40,90,20,0.18)'; g.fillRect((i * 23) % w, (i * 41) % h, 1, 3); }
  }, 8, 1);
}
/* 白色格栅走道：白底细网格 */
function texGrating() {
  return canvasTex(64, 64, function (g, w, h) {
    g.fillStyle = '#ececea'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(150,150,150,0.7)'; g.lineWidth = 1;
    var i;
    for (i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 8, 0); g.lineTo(i * 8, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 8); g.lineTo(w, i * 8); g.stroke(); }
  }, 1, 8);
}

/* ================= 2. 工厂 ================= */
window.Special3D = window.Special3D || {};
window.Special3D[29] = function () {
  var g = grp();
  g.name = 'special_29_water_works';

  var waterTex = texPoolWater();
  var M = {
    slab:    std('#c9cdd1', { rough: 0.92, map: texConcrete() }),
    lawn:    std('#7cb043', { rough: 0.95, map: texLawn() }),
    conc:    std('#d9d4c7', { rough: 0.9, side: THREE.DoubleSide }),
    concD:   std('#b8b3a6', { rough: 0.9 }),
    water:   std('#1f9fc6', { rough: 0.2, metal: 0.05, map: waterTex, tint: '#e8f6fb' }),
    yellow:  std('#f2c230', { rough: 0.5, metal: 0.2 }),
    grating: std('#ececea', { rough: 0.7, map: texGrating() }),
    white:   std('#f2f2ee', { rough: 0.75 }),
    roof:    std('#1a86e6', { rough: 0.55, side: THREE.DoubleSide }),
    pipe:    std('#1f7fe0', { rough: 0.4, metal: 0.3 }),
    valve:   std('#c0392b', { rough: 0.5, metal: 0.2 }),
    slate:   std('#4a6b80', { rough: 0.3, metal: 0.3 }),
    door:    std('#2a6fd1', { rough: 0.5 }),
    crown:   std('#5e9b3a', { rough: 0.9 }),
    crown2:  std('#72b048', { rough: 0.9 }),
    trunk:   std('#6b4a2a', { rough: 0.9 }),
    fence:   std('#e8e8e8', { rough: 0.6, metal: 0.2 }),
    cabinet: std('#9aa0a6', { rough: 0.6, metal: 0.3 }),
    steel:   std('#8d949c', { rough: 0.4, metal: 0.7 })
  };
  var lampM = std('#2ecc71', { rough: 0.4, emissive: '#2ecc71', ei: 0.7 });

  var i, s, TOP = 0.06;
  var concL = [], concDL = [], yellowL = [], whiteL = [], pipeL = [], valveL = [], slateL = [], fenceL = [], crownL = [], crown2L = [], trunkL = [], steelL = [], waterL = [], gratingL = [];

  /* ========== 地台 + 草边带 + 围栏 ========== */
  g.add(mesh(new THREE.BoxGeometry(2.64, TOP, 2.64).translate(0, TOP / 2, 0), M.slab));
  g.add(mesh(mergeGeos([
    tbox(2.64, 0.016, 0.20, 0, TOP + 0.008, 1.22), tbox(2.64, 0.016, 0.20, 0, TOP + 0.008, -1.22),
    tbox(0.20, 0.016, 2.24, 1.22, TOP + 0.008, 0), tbox(0.20, 0.016, 2.24, -1.22, TOP + 0.008, 0)
  ]), M.lawn));
  for (i = 0; i < 8; i++) {                                          /* 围栏立柱（每边 8） */
    var p = -1.155 + i * 0.33;
    fenceL.push(tbox(0.016, 0.11, 0.016, p, TOP + 0.055, 1.30)); fenceL.push(tbox(0.016, 0.11, 0.016, p, TOP + 0.055, -1.30));
    fenceL.push(tbox(0.016, 0.11, 0.016, 1.30, TOP + 0.055, p)); fenceL.push(tbox(0.016, 0.11, 0.016, -1.30, TOP + 0.055, p));
  }
  fenceL.push(tbox(2.62, 0.008, 0.008, 0, TOP + 0.10, 1.30)); fenceL.push(tbox(2.62, 0.008, 0.008, 0, TOP + 0.07, 1.30));
  fenceL.push(tbox(2.62, 0.008, 0.008, 0, TOP + 0.10, -1.30)); fenceL.push(tbox(2.62, 0.008, 0.008, 0, TOP + 0.07, -1.30));
  fenceL.push(tbox(0.008, 0.008, 2.62, 1.30, TOP + 0.10, 0)); fenceL.push(tbox(0.008, 0.008, 2.62, 1.30, TOP + 0.07, 0));
  fenceL.push(tbox(0.008, 0.008, 2.62, -1.30, TOP + 0.10, 0)); fenceL.push(tbox(0.008, 0.008, 2.62, -1.30, TOP + 0.07, 0));

  /* ========== 圆形沉淀池 ×2（环壁 + 池水 + 堰环 + 中柱 + 环栏 + 刮泥桥） ========== */
  var bridges = [];
  function clarifier(cx, cz, r, h) {
    var wall = new THREE.CylinderGeometry(r, r, h, 44, 1, true).translate(cx, TOP + h / 2, cz);
    var inner = new THREE.CylinderGeometry(r - 0.05, r - 0.05, 0.12, 44, 1, true).translate(cx, TOP + h - 0.06, cz);
    var rim = new THREE.RingGeometry(r - 0.05, r + 0.012, 44).rotateX(-PI / 2).translate(cx, TOP + h + 0.001, cz);
    concL.push(wall, inner, rim);
    concDL.push(new THREE.TorusGeometry(r + 0.006, 0.012, 8, 44).rotateX(PI / 2).translate(cx, TOP + h, cz));  /* 压顶圆边 */
    waterL.push(new THREE.CircleGeometry(r - 0.05, 44).rotateX(-PI / 2).translate(cx, TOP + h - 0.045, cz));
    concDL.push(new THREE.TorusGeometry(r * 0.62, 0.012, 8, 44).rotateX(PI / 2).translate(cx, TOP + h - 0.04, cz)); /* 溢流堰环 */
    concL.push(tcyl(0.055, 0.065, h + 0.10, 16, cx, TOP + (h + 0.10) / 2, cz));                 /* 中心立柱 */
    concDL.push(tcyl(0.07, 0.07, 0.02, 16, cx, TOP + h + 0.10, cz));
    /* 池顶环形黄栏杆：12 立柱 + 环管 */
    var k;
    for (k = 0; k < 14; k++) {
      var a = k / 14 * PI * 2;
      yellowL.push(tbox(0.012, 0.10, 0.012, cx + cos(a) * (r - 0.02), TOP + h + 0.05, cz + sin(a) * (r - 0.02)));
    }
    yellowL.push(new THREE.TorusGeometry(r - 0.02, 0.007, 6, 44).rotateX(PI / 2).translate(cx, TOP + h + 0.10, cz));
    yellowL.push(new THREE.TorusGeometry(r - 0.02, 0.006, 6, 44).rotateX(PI / 2).translate(cx, TOP + h + 0.065, cz));
    /* 刮泥桥（中心 → 池壁，动画绕中柱旋转） */
    var bg = grp(); bg.position.set(cx, TOP + h + 0.03, cz); g.add(bg);
    var bl = r + 0.02;
    bg.add(mesh(mergeGeos([
      tbox(bl, 0.022, 0.09, bl / 2, 0, 0),
      tbox(0.08, 0.05, 0.11, 0.06, 0.02, 0),                   /* 驱动箱 */
      tbox(0.02, 0.09, 0.02, bl - 0.02, -0.045, 0)              /* 壁端行走轮架 */
    ]), M.pipe));
    var rails = [];
    for (k = 0; k < 6; k++) { rails.push(tbox(0.01, 0.08, 0.01, 0.10 + k * (bl - 0.14) / 5, 0.045, 0.04)); rails.push(tbox(0.01, 0.08, 0.01, 0.10 + k * (bl - 0.14) / 5, 0.045, -0.04)); }
    rails.push(tbox(bl - 0.12, 0.008, 0.008, 0.10 + (bl - 0.14) / 2, 0.085, 0.04)); rails.push(tbox(bl - 0.12, 0.008, 0.008, 0.10 + (bl - 0.14) / 2, 0.085, -0.04));
    bg.add(mesh(mergeGeos(rails), M.yellow));
    bg.add(mesh(tbox(bl - 0.16, 0.015, 0.03, bl / 2, -0.03 - h * 0.55, 0.0), M.steel));   /* 水下刮臂（透过水面隐约可见） */
    bridges.push(bg);
  }
  clarifier(-0.62, 0.45, 0.52, 0.24);
  clarifier(-0.25, -0.72, 0.44, 0.26);

  /* ========== 矩形清水池组（右前）：围堰 + 三格池水 + 白格栅走道 + 黄栏杆 ========== */
  var RX = 0.72, RZ = 0.45, RW = 1.02, RD = 0.92, RH = 0.16;                 /* 围堰顶 y = TOP+RH+0.08 */
  concL.push(tbox(RW, RH, RD, RX, TOP + RH / 2, RZ));
  concL.push(tbox(RW, 0.08, 0.06, RX, TOP + RH + 0.04, RZ + RD / 2 - 0.03));  /* 四周围堰墙 */
  concL.push(tbox(RW, 0.08, 0.06, RX, TOP + RH + 0.04, RZ - RD / 2 + 0.03));
  concL.push(tbox(0.06, 0.08, RD, RX + RW / 2 - 0.03, TOP + RH + 0.04, RZ));
  concL.push(tbox(0.06, 0.08, RD, RX - RW / 2 + 0.03, TOP + RH + 0.04, RZ));
  var lx = [-0.32, 0, 0.32];
  for (i = 0; i < 3; i++) waterL.push(tbox(0.26, 0.02, RD - 0.12, RX + lx[i], TOP + RH + 0.035, RZ));
  gratingL.push(tbox(0.06, 0.08, RD - 0.12, RX - 0.16, TOP + RH + 0.04, RZ));   /* 格栅走道 ×2 */
  gratingL.push(tbox(0.06, 0.08, RD - 0.12, RX + 0.16, TOP + RH + 0.04, RZ));
  gratingL.push(tbox(RW - 0.12, 0.06, 0.06, RX, TOP + RH + 0.03, RZ - RD / 2 + 0.09)); /* 横向走道 */
  for (s = -1; s <= 1; s += 2) {                                             /* 走道黄栏杆 */
    for (i = 0; i < 6; i++) yellowL.push(tbox(0.01, 0.09, 0.01, RX + s * 0.16, TOP + RH + 0.125, RZ - 0.36 + i * 0.145));
    yellowL.push(tbox(0.008, 0.008, 0.76, RX + s * 0.16, TOP + RH + 0.17, RZ));
    yellowL.push(tbox(0.008, 0.008, 0.76, RX + s * 0.16, TOP + RH + 0.135, RZ));
  }
  for (i = 0; i < 7; i++) yellowL.push(tbox(0.01, 0.09, 0.01, RX - 0.42 + i * 0.14, TOP + RH + 0.125, RZ + RD / 2 - 0.03));
  yellowL.push(tbox(RW - 0.12, 0.008, 0.008, RX, TOP + RH + 0.17, RZ + RD / 2 - 0.03));
  /* 池间闸门（钢） */
  for (i = 0; i < 3; i++) steelL.push(tbox(0.10, 0.06, 0.02, RX + lx[i], TOP + RH + 0.07, RZ - RD / 2 + 0.05));

  /* ========== 泵房（右后）：白墙 + 亮蓝四坡顶 + 门窗 + 雨篷 + 状态灯 ========== */
  var HX = 0.82, HZ = -0.76, HW = 0.76, HD = 0.78, HH = 0.60;
  whiteL.push(tbox(HW, HH, HD, HX, TOP + HH / 2, HZ));
  whiteL.push(tbox(HW + 0.06, 0.03, HD + 0.06, HX, TOP + HH + 0.005, HZ));  /* 檐板 */
  g.add(mesh(hipRoof(HW + 0.10, HD + 0.10, 0.28, 0.36).translate(HX, TOP + HH + 0.02, HZ), M.roof));
  g.add(mesh(mergeGeos([tbox(0.40, 0.03, 0.05, HX, TOP + HH + 0.295, HZ)]), M.white));    /* 屋脊白线 */
  concDL.push(tbox(0.06, 0.16, 0.06, HX + 0.24, TOP + HH + 0.20, HZ - 0.18));               /* 通风筒 */
  /* 前立面（z = HZ + HD/2）：门 + 雨篷 + 4 窗；右侧面 2 窗；楼层线 */
  var fz = HZ + HD / 2 + 0.004;
  g.add(mesh(tbox(0.14, 0.26, 0.012, HX - 0.20, TOP + 0.13, fz), M.door));
  g.add(mesh(tbox(0.28, 0.018, 0.10, HX - 0.20, TOP + 0.30, fz + 0.04), M.roof));
  slateL.push(tbox(0.12, 0.11, 0.012, HX + 0.08, TOP + 0.20, fz)); slateL.push(tbox(0.12, 0.11, 0.012, HX + 0.26, TOP + 0.20, fz));
  slateL.push(tbox(0.12, 0.11, 0.012, HX - 0.22, TOP + 0.46, fz)); slateL.push(tbox(0.12, 0.11, 0.012, HX + 0.02, TOP + 0.46, fz));
  slateL.push(tbox(0.12, 0.11, 0.012, HX + 0.26, TOP + 0.46, fz));
  slateL.push(tbox(0.012, 0.11, 0.14, HX + HW / 2 + 0.004, TOP + 0.46, HZ - 0.20)); slateL.push(tbox(0.012, 0.11, 0.14, HX + HW / 2 + 0.004, TOP + 0.46, HZ + 0.10));
  slateL.push(tbox(0.012, 0.11, 0.14, HX + HW / 2 + 0.004, TOP + 0.20, HZ + 0.10));
  concDL.push(tbox(HW + 0.02, 0.015, HD + 0.02, HX, TOP + 0.32, HZ));         /* 楼层腰线 */
  whiteL.push(tbox(0.14, 0.05, 0.14, HX + 0.28, TOP + HH + 0.02, HZ + 0.30)); /* 屋面设备箱 */
  var lamp = mesh(new THREE.BoxGeometry(0.04, 0.04, 0.02), lampM); lamp.position.set(HX - 0.20, TOP + 0.37, fz + 0.005); lamp.castShadow = false; g.add(lamp);

  /* ========== 亮蓝明管：主干（z=-0.16）+ 分支弯头 + 阀门手轮 + 侧环管 + 支墩 ========== */
  var PY = 0.11, PR = 0.03, MZ = -0.16;
  pipeL.push(pipeH(PR, 2.30, 'x', 0, PY, MZ));                                /* 主干 x -1.15..1.15 */
  for (i = 0; i < 6; i++) concDL.push(tbox(0.07, 0.05, 0.07, -1.05 + i * 0.42, TOP + 0.025, MZ));
  /* 分支 → 池 A（x=-0.62）：竖弯头上 + 横入池壁 */
  pipeL.push(tsph(PR + 0.004, -0.62, PY, MZ)); pipeL.push(pipeV(PR, PY, 0.34, -0.62, MZ));
  pipeL.push(tsph(PR + 0.004, -0.62, 0.34, MZ)); pipeL.push(pipeH(PR, 0.16, 'z', -0.62, 0.34, MZ + 0.08));
  /* 分支 → 池 B（x=-0.25）*/
  pipeL.push(tsph(PR + 0.004, -0.25, PY, MZ)); pipeL.push(pipeV(PR, PY, 0.36, -0.25, MZ));
  pipeL.push(tsph(PR + 0.004, -0.25, 0.36, MZ)); pipeL.push(pipeH(PR, 0.16, 'z', -0.25, 0.36, MZ - 0.08));
  /* 分支 → 矩形池（x=0.72）*/
  pipeL.push(tsph(PR + 0.004, 0.72, PY, MZ)); pipeL.push(pipeV(PR, PY, 0.30, 0.72, MZ));
  pipeL.push(tsph(PR + 0.004, 0.72, 0.30, MZ)); pipeL.push(pipeH(PR, 0.20, 'z', 0.72, 0.30, MZ + 0.10));
  /* 分支 → 泵房（x=0.98）*/
  pipeL.push(tsph(PR + 0.004, 0.98, PY, MZ)); pipeL.push(pipeH(PR, 0.24, 'z', 0.98, PY, MZ - 0.12));
  /* 侧向环管：沿 x=1.24 由泵房到池组前方，两个弯头 */
  pipeL.push(pipeH(PR * 0.8, 0.12, 'x', HX + HW / 2 + 0.06, PY, HZ + 0.20));
  pipeL.push(tsph(PR * 0.84, 1.24, PY, HZ + 0.20)); pipeL.push(pipeH(PR * 0.8, 1.56, 'z', 1.24, PY, HZ + 0.20 + 0.78));
  pipeL.push(tsph(PR * 0.84, 1.24, PY, HZ + 0.20 + 1.56)); pipeL.push(pipeH(PR * 0.8, 0.14, 'x', 1.17, PY, HZ + 0.20 + 1.56));
  concDL.push(tbox(0.06, 0.05, 0.06, 1.24, TOP + 0.025, 0.10)); concDL.push(tbox(0.06, 0.05, 0.06, 1.24, TOP + 0.025, 0.70));
  /* 池 A ↔ 池 B 联通管（地面）*/
  pipeL.push(pipeH(PR * 0.8, 0.40, 'z', -0.95, PY, -0.22)); pipeL.push(tsph(PR * 0.84, -0.95, PY, -0.42)); pipeL.push(pipeH(PR * 0.8, 0.30, 'x', -0.80, PY, -0.42));
  /* 阀门手轮 ×3（红）+ 阀体 */
  function valve(x, z) {
    pipeL.push(pipeV(PR * 0.7, PY, PY + 0.10, x, z));
    valveL.push(tsph(0.038, x, PY + 0.06, z));
    valveL.push(new THREE.TorusGeometry(0.045, 0.009, 8, 20).rotateX(PI / 2).translate(x, PY + 0.13, z));
    valveL.push(tbox(0.08, 0.008, 0.008, x, PY + 0.13, z)); valveL.push(tbox(0.008, 0.008, 0.08, x, PY + 0.13, z));
    steelL.push(tcyl(0.008, 0.008, 0.06, 8, x, PY + 0.10, z));
  }
  valve(-0.84, MZ); valve(0.30, MZ); valve(1.24, 0.40);

  /* ========== 附属：白设备箱 / 灰控制柜 / 圆冠树 ×6 ========== */
  whiteL.push(tbox(0.20, 0.17, 0.16, -1.08, TOP + 0.085, 1.02));
  concDL.push(tbox(0.22, 0.012, 0.18, -1.08, TOP + 0.175, 1.02));
  g.add(mesh(mergeGeos([tbox(0.14, 0.24, 0.10, 1.20, TOP + 0.12, 1.06), tbox(0.15, 0.02, 0.11, 1.20, TOP + 0.245, 1.06)]), M.cabinet));
  slateL.push(tbox(0.08, 0.06, 0.012, 1.20, TOP + 0.16, 1.116));
  var trees = [[-1.22, -1.20], [1.22, -1.22], [-1.22, 1.22], [1.22, 1.22], [0.02, 1.22], [-1.22, -0.30]];
  for (i = 0; i < trees.length; i++) {
    trunkL.push(tcyl(0.018, 0.024, 0.12, 10, trees[i][0], TOP + 0.06, trees[i][1]));
    crownL.push(tsph(0.095, trees[i][0], TOP + 0.20, trees[i][1]));
    crown2L.push(tsph(0.06, trees[i][0] + 0.04, TOP + 0.27, trees[i][1] - 0.03));
  }

  /* ========== 合并落地 ========== */
  g.add(mesh(mergeGeos(concL), M.conc));
  g.add(mesh(mergeGeos(concDL), M.concD));
  g.add(mesh(mergeGeos(waterL), M.water));
  g.add(mesh(mergeGeos(yellowL), M.yellow));
  g.add(mesh(mergeGeos(gratingL), M.grating));
  g.add(mesh(mergeGeos(whiteL), M.white));
  g.add(mesh(mergeGeos(pipeL), M.pipe));
  g.add(mesh(mergeGeos(valveL), M.valve));
  g.add(mesh(mergeGeos(slateL), M.slate));
  g.add(mesh(mergeGeos(fenceL), M.fence));
  g.add(mesh(mergeGeos(crownL), M.crown));
  g.add(mesh(mergeGeos(crown2L), M.crown2));
  g.add(mesh(mergeGeos(trunkL), M.trunk));
  g.add(mesh(mergeGeos(steelL), M.steel));

  /* ========== 动画 ========== */
  g.userData.anim = [
    function (t) {                                   /* 1) 刮泥桥缓转（异速反向） */
      bridges[0].rotation.y = t * 0.16;
      bridges[1].rotation.y = -t * 0.12 + 1.2;
    },
    function (t) {                                   /* 2) 池水涟漪漂移 */
      waterTex.offset.x = (t * 0.015) % 1;
      waterTex.offset.y = (t * 0.01) % 1;
    },
    function (t) {                                   /* 3) 泵房状态灯呼吸 */
      lampM.emissiveIntensity = 0.55 + 0.25 * sin(t * 2.4);
    }
  ];
  return g;
};
})();
