/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 37 国际机场（tile37_airport.js）· 参考图高保真重建
 * -------------------------------------------------------------------------------------
 * 参考图 refs/sp_37.png（正立面）：
 *   航站楼：两层 —— 朱红立柱分格 + 青灰玻璃幕墙（中央大厅一跨更亮更宽）+ 暗红楼层腰带
 *           + 米黄檐口板；顶部通宽大曲面青灰玻璃屋面（端部上翘、米黄封檐、脊梁）
 *   塔  台：左后 —— 米灰渐细塔身 + 朱红环带 + 青灰玻璃控制室 + 深灰帽檐 + 天线/红色航标灯
 *   停机坪：深灰地台 + 黄色引导线/机位框 + 白色边线 + 蓝色滑行道边灯
 *   客  机：右前小比例白色客机（蓝尾翼/腰线、双发、起落架）—— 静态装饰，不抢棋盘专机戏
 *   廊  桥：航站楼 → 客机舱门的架空玻璃廊桥（转盘 + 两组支腿）
 *   附  属：旋转雷达、风向袋、牵引车 + 行李拖车、绿篱与树
 *
 *   window.Special3D[37]() → THREE.Group（原点=格心，底面 y=0，正面朝 +Z）
 *   每次调用全新实例（材质不共享可变状态）
 *
 * 动画：1) 塔台航标灯闪烁  2) 雷达旋转  3) 风向袋摆动  4) 滑行道边灯呼吸
 * 技术约束：经典 script；THREE r147；MeshStandardMaterial；Canvas ≤256px；mesh ≤130；
 *           占地 ≤2.7×2.7；底面 y=0；零 Math.random。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[tile37_airport] THREE 未定义，请先加载 three.min.js (r147)');
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
function tsph(r, x, y, z) { return new THREE.SphereGeometry(r, 16, 12).translate(x, y, z); }
/* 两点间定向盒（截面 w×h），用于廊桥/斜杆 */
function obox(x0, y0, z0, x1, y1, z1, w, h) {
  var dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0), L = dir.length(); dir.normalize();
  var g = new THREE.BoxGeometry(w, h, L);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir));
  return g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
}
/* 大曲面屋顶（凹坡 + 端部上翘），同 curvedRoof 思路；UV 归一到面板贴图 */
function curvedRoof(span, depth, rise, rl, up, rows, perim) {
  rows = rows || 7; perim = perim || 56;
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
    var endK = pow(abs(E.x) / hw, 5);                              /* 仅左右端部上翘 */
    var y = rise * pow(vv, 1.5) + up * endK * pow(1 - vv, 2);
    return [x, y, z];
  }
  var pos = [], uv = [], per = 2 * (span + depth) / 0.5, sl = Math.sqrt(hd * hd + rise * rise) / 0.5;
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
  var sp = [], suv = [], TH = 0.045;
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

/* ================= 1. Canvas 纹理 ================= */
function canvasTex(w, h, draw, rx, ry) {
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  var g = cv.getContext('2d'); draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (rx || ry) tex.repeat.set(rx || 1, ry || 1);
  return tex;
}
/* 青灰玻璃面板（屋面/幕墙共用）：4×4 格/贴 + 逐格明暗 + 高光条 */
function texPanel() {
  return canvasTex(128, 128, function (g, w, h) {
    var i, j;
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) {
      g.fillStyle = ((i + j) % 2 === 0) ? '#5b7d8f' : (((i * 3 + j) % 5 === 0) ? '#6f93a6' : '#547487');
      g.fillRect(i * 32, j * 32, 32, 32);
      g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(i * 32 + 2, j * 32 + 2, 28, 4);
    }
    g.strokeStyle = '#34505f'; g.lineWidth = 3;
    for (i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke(); }
    g.fillStyle = 'rgba(230,245,250,0.14)';
    g.beginPath(); g.moveTo(70, 0); g.lineTo(100, 0); g.lineTo(40, h); g.lineTo(10, h); g.closePath(); g.fill();
  });
}
/* 停机坪：深灰沥青 + 微噪 + 细分缝 */
function texApron() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#3f444b'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 90; i++) { g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.12)'; g.fillRect((i * 37) % w, (i * 59) % h, 3, 2); }
    g.strokeStyle = 'rgba(20,22,26,0.6)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(0, 64); g.lineTo(w, 64); g.stroke(); g.beginPath(); g.moveTo(64, 0); g.lineTo(64, h); g.stroke();
  }, 6, 6);
}

/* ================= 2. 工厂 ================= */
window.Special3D = window.Special3D || {};
window.Special3D[37] = function () {
  var g = grp();
  g.name = 'special_37_intl_airport';

  var panelTex = texPanel();
  var M = {
    apron:   std('#3f444b', { rough: 0.95, map: texApron() }),
    yellow:  std('#f0c542', { rough: 0.6 }),
    white:   std('#e9e9e4', { rough: 0.6 }),
    red:     std('#c94a3a', { rough: 0.55 }),
    darkRed: std('#7a3a2e', { rough: 0.6 }),
    tan:     std('#d8c4a8', { rough: 0.7 }),
    tanD:    std('#bfa98c', { rough: 0.75 }),
    glassD:  std('#3f5a6c', { rough: 0.25, metal: 0.3 }),
    glassL:  std('#7a9ab0', { rough: 0.2, metal: 0.25 }),
    panel:   std('#5b7d8f', { rough: 0.3, metal: 0.25, map: panelTex, side: THREE.DoubleSide, tint: '#f0f4f6' }),
    fascia:  std('#d8c4a8', { rough: 0.7, side: THREE.DoubleSide }),
    cream:   std('#e6e3d8', { rough: 0.7 }),
    gray:    std('#8a8f96', { rough: 0.6, metal: 0.3 }),
    dark:    std('#2c2f34', { rough: 0.7 }),
    blue:    std('#2a6fd1', { rough: 0.5 }),
    plane:   std('#ececea', { rough: 0.35, metal: 0.1 }),
    engine:  std('#5c6168', { rough: 0.4, metal: 0.6 }),
    green:   std('#5e9b3a', { rough: 0.9 }),
    trunk:   std('#6b4a2a', { rough: 0.9 }),
    orange:  std('#f07a2a', { rough: 0.7 }),
    steel:   std('#9aa0a6', { rough: 0.4, metal: 0.7 })
  };
  var beaconM = std('#ff3b2f', { rough: 0.4, emissive: '#ff2a1a', ei: 0.9 });
  var taxiLightM = std('#4aa8ff', { rough: 0.4, emissive: '#4aa8ff', ei: 0.7 });

  var i, s, TOP = 0.05;
  var yellowL = [], whiteL = [], redL = [], darkRedL = [], tanL = [], tanDL = [], glassDL = [], glassLL = [], creamL = [], grayL = [], darkL = [], blueL = [], planeL = [], engineL = [], greenL = [], trunkL = [], steelL = [];

  /* ========== 停机坪：地台 + 引导线 + 机位框 + 白边线 + 滑行道边灯 ========== */
  g.add(mesh(new THREE.BoxGeometry(2.64, TOP, 2.64).translate(0, TOP / 2, 0), M.apron));
  yellowL.push(tbox(0.022, 0.012, 1.30, 0.62, TOP + 0.006, 0.42));          /* 引导中线 */
  yellowL.push(tbox(0.90, 0.012, 0.022, 0.62, TOP + 0.006, 1.10));          /* 横向引导线 */
  yellowL.push(tbox(0.022, 0.012, 0.70, -0.30, TOP + 0.006, 0.85));
  yellowL.push(tbox(1.06, 0.012, 0.022, 0.22, TOP + 0.006, 1.20));
  yellowL.push(tbox(0.16, 0.012, 0.022, 0.62, TOP + 0.006, 0.30));          /* 停止线 T */
  for (i = 0; i < 9; i++) whiteL.push(tbox(0.12, 0.012, 0.02, -1.20 + i * 0.30, TOP + 0.006, 1.27)); /* 白色虚边线 */
  for (i = 0; i < 7; i++) whiteL.push(tbox(0.02, 0.012, 0.12, -1.27, TOP + 0.006, -1.05 + i * 0.35));
  var tl = [];
  for (i = 0; i < 7; i++) tl.push(tsph(0.012, -1.10 + i * 0.36, TOP + 0.012, 1.18));
  g.add(mesh(mergeGeos(tl), taxiLightM));

  /* ========== 航站楼：两层朱红柱 + 青灰玻璃 + 暗红腰带 + 米黄檐口 + 大曲面顶 ========== */
  var TX0 = -0.92, TX1 = 0.92, TZ0 = -1.16, TZ1 = -0.26, TH = 0.70, TY = TOP;
  var TW = TX1 - TX0, TD = TZ1 - TZ0, TCX = (TX0 + TX1) / 2, TCZ = (TZ0 + TZ1) / 2;
  darkL.push(tbox(TW - 0.04, TH, TD - 0.04, TCX, TY + TH / 2, TCZ));                    /* 内芯（暗，透过玻璃） */
  /* 玻璃幕墙四面：中央大厅一跨用亮玻璃，其余暗青灰 */
  glassDL.push(tbox(TW, TH - 0.02, 0.012, TCX, TY + TH / 2, TZ1 + 0.004));            /* 前 */
  glassLL.push(tbox(0.62, TH - 0.02, 0.014, TCX, TY + TH / 2, TZ1 + 0.022));           /* 前·中央亮跨（前移，避免被暗玻璃盖住） */
  glassDL.push(tbox(TW, TH - 0.02, 0.012, TCX, TY + TH / 2, TZ0 - 0.004));            /* 后 */
  glassDL.push(tbox(0.012, TH - 0.02, TD, TX0 - 0.004, TY + TH / 2, TCZ));            /* 左 */
  glassDL.push(tbox(0.012, TH - 0.02, TD, TX1 + 0.004, TY + TH / 2, TCZ));            /* 右 */
  /* 朱红立柱（前后各 7、左右各 4）+ 柱础 */
  var cxs = [-0.92, -0.62, -0.32, 0, 0.32, 0.62, 0.92], k;
  for (k = 0; k < cxs.length; k++) {
    if (k === 3) continue;
    redL.push(tbox(0.055, TH + 0.02, 0.07, cxs[k], TY + TH / 2, TZ1 + 0.02));
    redL.push(tbox(0.055, TH + 0.02, 0.07, cxs[k], TY + TH / 2, TZ0 - 0.02));
    tanDL.push(tbox(0.09, 0.04, 0.10, cxs[k], TY + 0.02, TZ1 + 0.02));
  }
  var czs = [-1.16, -0.86, -0.56, -0.26];
  for (k = 0; k < czs.length; k++) {
    redL.push(tbox(0.07, TH + 0.02, 0.055, TX0 - 0.02, TY + TH / 2, czs[k]));
    redL.push(tbox(0.07, TH + 0.02, 0.055, TX1 + 0.02, TY + TH / 2, czs[k]));
  }
  /* 中央亮跨米黄门框 + 入口双门 + 入口雨篷 */
  tanL.push(tbox(0.05, TH, 0.06, -0.31, TY + TH / 2, TZ1 + 0.02)); tanL.push(tbox(0.05, TH, 0.06, 0.31, TY + TH / 2, TZ1 + 0.02));
  tanL.push(tbox(0.66, 0.04, 0.06, 0, TY + 0.40, TZ1 + 0.02));                          /* 中跨楼层横梁 */
  darkL.push(tbox(0.30, 0.26, 0.02, 0, TY + 0.13, TZ1 + 0.03));
  glassLL.push(tbox(0.13, 0.22, 0.01, -0.075, TY + 0.13, TZ1 + 0.05)); glassLL.push(tbox(0.13, 0.22, 0.01, 0.075, TY + 0.13, TZ1 + 0.05));
  tanL.push(tbox(0.56, 0.03, 0.22, 0, TY + 0.30, TZ1 + 0.11));                          /* 雨篷 */
  redL.push(tbox(0.03, 0.25, 0.03, -0.24, TY + 0.125, TZ1 + 0.20)); redL.push(tbox(0.03, 0.25, 0.03, 0.24, TY + 0.125, TZ1 + 0.20));
  /* 暗红楼层腰带（四面）+ 米黄檐口 + 屋面基板 */
  darkRedL.push(tbox(TW + 0.06, 0.045, 0.03, TCX, TY + 0.40, TZ1 + 0.03)); darkRedL.push(tbox(TW + 0.06, 0.045, 0.03, TCX, TY + 0.40, TZ0 - 0.03));
  darkRedL.push(tbox(0.03, 0.045, TD + 0.06, TX0 - 0.03, TY + 0.40, TCZ)); darkRedL.push(tbox(0.03, 0.045, TD + 0.06, TX1 + 0.03, TY + 0.40, TCZ));
  darkRedL.push(tbox(TW + 0.08, 0.05, TD + 0.08, TCX, TY + TH + 0.02, TCZ));           /* 顶部暗红檐带 */
  tanL.push(tbox(TW + 0.14, 0.05, TD + 0.14, TCX, TY + TH + 0.07, TCZ));               /* 米黄檐口板 */
  /* 大曲面青灰玻璃屋面（端部上翘）+ 米黄封檐 + 脊梁 + 端部翘饰 */
  var roof = curvedRoof(TW + 0.30, TD + 0.26, 0.24, 1.36, 0.17, 7, 60);
  g.add(mesh(roof.top.translate(TCX, TY + TH + 0.095, TCZ), M.panel));
  g.add(mesh(roof.skirt.translate(TCX, TY + TH + 0.095, TCZ), M.fascia));
  tanL.push(tbox(1.40, 0.045, 0.10, TCX, TY + TH + 0.095 + 0.245, TCZ));               /* 脊梁 */
  glassLL.push(tbox(1.30, 0.02, 0.14, TCX, TY + TH + 0.095 + 0.235, TCZ));            /* 脊部采光带 */
  /* 屋顶设备：空调箱 ×2 + 天线 */
  grayL.push(tbox(0.16, 0.06, 0.12, -0.55, TY + TH + 0.095 + 0.20, TCZ - 0.05)); grayL.push(tbox(0.16, 0.06, 0.12, 0.55, TY + TH + 0.095 + 0.20, TCZ - 0.05));
  steelL.push(tcyl(0.006, 0.006, 0.18, 8, 0.80, TY + TH + 0.095 + 0.28, TCZ + 0.2));

  /* ========== 塔台（左后）========== */
  var KX = -1.06, KZ = -0.86;
  creamL.push(tbox(0.36, 0.22, 0.36, KX, TOP + 0.11, KZ));                             /* 基座附楼 */
  glassDL.push(tbox(0.30, 0.08, 0.012, KX, TOP + 0.14, KZ + 0.185)); glassDL.push(tbox(0.012, 0.08, 0.30, KX + 0.185, TOP + 0.14, KZ));
  tanDL.push(tbox(0.40, 0.03, 0.40, KX, TOP + 0.235, KZ));
  creamL.push(tcyl(0.10, 0.14, 1.06, 20, KX, TOP + 0.25 + 0.53, KZ));                  /* 渐细塔身 y..1.36 */
  tanDL.push(tcyl(0.145, 0.145, 0.03, 20, KX, TOP + 0.265, KZ));
  redL.push(new THREE.TorusGeometry(0.108, 0.022, 8, 24).rotateX(PI / 2).translate(KX, TOP + 1.24, KZ));   /* 朱红环带 */
  creamL.push(tcyl(0.20, 0.13, 0.08, 20, KX, TOP + 1.35, KZ));                          /* 控制室承托 */
  glassDL.push(tcyl(0.205, 0.205, 0.14, 20, KX, TOP + 1.46, KZ));                       /* 玻璃控制室 */
  for (k = 0; k < 8; k++) steelL.push(tbox(0.014, 0.14, 0.014, KX + cos(k * PI / 4) * 0.205, TOP + 1.46, KZ + sin(k * PI / 4) * 0.205));
  creamL.push(tcyl(0.215, 0.215, 0.03, 20, KX, TOP + 1.545, KZ));
  darkL.push(tcyl(0.06, 0.225, 0.10, 20, KX, TOP + 1.61, KZ));                          /* 深灰帽檐 */
  steelL.push(tcyl(0.008, 0.008, 0.28, 8, KX, TOP + 1.80, KZ));                         /* 天线 */
  steelL.push(tbox(0.08, 0.006, 0.006, KX, TOP + 1.88, KZ));
  var beacon = mesh(new THREE.SphereGeometry(0.022, 12, 10), beaconM); beacon.position.set(KX, TOP + 1.955, KZ); beacon.castShadow = false; g.add(beacon);
  /* 塔台旁绿篱 + 树 */
  greenL.push(tsph(0.06, KX + 0.30, TOP + 0.06, KZ + 0.30)); greenL.push(tsph(0.05, KX + 0.40, TOP + 0.05, KZ + 0.22));
  trunkL.push(tcyl(0.016, 0.02, 0.12, 10, KX - 0.02, TOP + 0.06, KZ + 0.40)); greenL.push(tsph(0.09, KX - 0.02, TOP + 0.20, KZ + 0.40));

  /* ========== 雷达（右后，旋转）+ 风向袋（左前，摆动）========== */
  grayL.push(tbox(0.035, 0.34, 0.035, 1.14, TOP + 0.17, -1.12));
  grayL.push(tbox(0.12, 0.03, 0.12, 1.14, TOP + 0.015, -1.12));
  var radar = grp(); radar.position.set(1.14, TOP + 0.36, -1.12); g.add(radar);
  var dish = mesh(new THREE.SphereGeometry(0.10, 16, 8, 0, PI * 2, 0, PI / 2).rotateX(PI / 2).translate(0, 0, 0.02), M.white);
  dish.scale.set(1, 1, 0.5); radar.add(dish);
  radar.add(mesh(tbox(0.02, 0.02, 0.10, 0, 0, 0.05), M.gray));
  steelL.push(tcyl(0.008, 0.008, 0.40, 8, -0.55, TOP + 0.20, 0.98));
  var sock = grp(); sock.position.set(-0.55, TOP + 0.40, 0.98); g.add(sock);
  sock.add(mesh(new THREE.CylinderGeometry(0.02, 0.035, 0.16, 12).rotateZ(-PI / 2).translate(0.08, 0, 0), M.orange));
  sock.add(mesh(new THREE.CylinderGeometry(0.035, 0.036, 0.03, 12).rotateZ(-PI / 2).translate(0.015, 0, 0), M.white));

  /* ========== 客机（右前，小比例静态；机头朝 +x 并偏向观者）========== */
  var plane = grp(); plane.position.set(0.72, TOP, 0.60); plane.rotation.y = -0.35; g.add(plane);
  var pL = [], pDark = [], pBlue = [], pEng = [], pGear = [];
  pL.push(new THREE.CylinderGeometry(0.075, 0.075, 0.60, 16).rotateZ(PI / 2).translate(0, 0.21, 0));   /* 机身 */
  pL.push(new THREE.SphereGeometry(0.075, 16, 12).scale(1.6, 1, 1).translate(0.30, 0.21, 0));            /* 机鼻 */
  pL.push(new THREE.CylinderGeometry(0.075, 0.03, 0.26, 16).rotateZ(PI / 2).translate(-0.43, 0.23, 0)); /* 尾锥 */
  /* 后掠机翼 ×2 */
  for (s = -1; s <= 1; s += 2) {
    var wing = new THREE.BoxGeometry(0.16, 0.016, 0.40).rotateY(s * 0.42).translate(-0.06 - 0.06, 0.185, s * 0.22);
    pL.push(wing);
    pEng.push(new THREE.CylinderGeometry(0.036, 0.036, 0.14, 14).rotateZ(PI / 2).translate(-0.02, 0.135, s * 0.20));
    pDark.push(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 14).rotateZ(PI / 2).translate(0.052, 0.135, s * 0.20));
    pL.push(new THREE.BoxGeometry(0.11, 0.012, 0.16).rotateY(s * 0.35).translate(-0.48, 0.25, s * 0.09));  /* 平尾 */
  }
  pBlue.push(new THREE.BoxGeometry(0.02, 0.22, 0.16).applyMatrix4(new THREE.Matrix4().makeShear(0, 0, -0.9, 0, 0, 0)).translate(-0.46, 0.35, 0));  /* 垂尾（后掠剪切） */
  pBlue.push(tbox(0.60, 0.014, 0.153, -0.10, 0.175, 0));                                                    /* 腰线 */
  pDark.push(tbox(0.42, 0.024, 0.153, -0.04, 0.235, 0));                                                    /* 舷窗带 */
  pDark.push(new THREE.BoxGeometry(0.07, 0.03, 0.10).translate(0.31, 0.245, 0));                            /* 驾驶舱窗 */
  pGear.push(tcyl(0.012, 0.012, 0.10, 8, 0.24, 0.10, 0)); pGear.push(new THREE.CylinderGeometry(0.018, 0.018, 0.016, 12).rotateX(PI / 2).translate(0.24, 0.02, 0));
  pGear.push(tcyl(0.012, 0.012, 0.10, 8, -0.06, 0.10, 0.06)); pGear.push(tcyl(0.012, 0.012, 0.10, 8, -0.06, 0.10, -0.06));
  pGear.push(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12).rotateX(PI / 2).translate(-0.06, 0.02, 0.07)); pGear.push(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12).rotateX(PI / 2).translate(-0.06, 0.02, -0.07));
  plane.add(mesh(mergeGeos(pL), M.plane));
  plane.add(mesh(mergeGeos(pEng), M.engine));
  plane.add(mesh(mergeGeos(pDark), M.dark));
  plane.add(mesh(mergeGeos(pBlue), M.blue));
  plane.add(mesh(mergeGeos(pGear), M.dark));

  /* ========== 廊桥：航站楼 → 客机舱门（转盘 + 廊道 + 玻璃侧窗 + 支腿）========== */
  var JX0 = 0.62, JZ0 = TZ1 + 0.02, JY = TOP + 0.31;
  var door = new THREE.Vector3(0.13, 0.27, -0.075).applyAxisAngle(new THREE.Vector3(0, 1, 0), -0.35).add(plane.position);
  tanL.push(tcyl(0.08, 0.08, 0.13, 16, JX0, JY, JZ0 + 0.05));                            /* 转盘 */
  glassDL.push(tcyl(0.082, 0.082, 0.045, 16, JX0, JY + 0.015, JZ0 + 0.05));
  var jx1 = door.x - 0.02, jz1 = door.z - 0.04, jy1 = door.y + 0.03;
  tanL.push(obox(JX0, JY, JZ0 + 0.05, jx1, jy1, jz1, 0.09, 0.10));
  glassDL.push(obox(JX0, JY + 0.012, JZ0 + 0.05, jx1, jy1 + 0.012, jz1, 0.094, 0.045));
  var mx = (JX0 + jx1) / 2, mz = (JZ0 + 0.05 + jz1) / 2, my = (JY + jy1) / 2;
  grayL.push(tbox(0.022, my - 0.05 - TOP, 0.022, mx - 0.025, TOP + (my - 0.05 - TOP) / 2, mz)); grayL.push(tbox(0.022, my - 0.05 - TOP, 0.022, mx + 0.025, TOP + (my - 0.05 - TOP) / 2, mz));
  grayL.push(tbox(0.10, 0.02, 0.08, mx, TOP + 0.01, mz));
  grayL.push(tbox(0.024, JY - 0.065 - TOP, 0.024, JX0, TOP + (JY - 0.065 - TOP) / 2, JZ0 + 0.05));

  /* ========== 地勤：牵引车 + 行李拖车 ========== */
  yellowL.push(tbox(0.12, 0.05, 0.08, 0.22, TOP + 0.045, 0.98)); darkL.push(tbox(0.06, 0.05, 0.075, 0.19, TOP + 0.09, 0.98));
  darkL.push(tbox(0.13, 0.02, 0.09, 0.22, TOP + 0.015, 0.98));
  grayL.push(tbox(0.10, 0.05, 0.07, 0.06, TOP + 0.05, 1.00)); darkL.push(tbox(0.11, 0.02, 0.08, 0.06, TOP + 0.015, 1.00));
  blueL.push(tbox(0.08, 0.04, 0.05, 0.06, TOP + 0.09, 1.00));
  /* 航站楼前绿篱 ×3 */
  greenL.push(tsph(0.05, -0.72, TOP + 0.05, TZ1 + 0.10)); greenL.push(tsph(0.045, -0.50, TOP + 0.045, TZ1 + 0.10)); greenL.push(tsph(0.05, 0.86, TOP + 0.05, TZ1 + 0.10));

  /* ========== 合并落地 ========== */
  g.add(mesh(mergeGeos(yellowL), M.yellow));
  g.add(mesh(mergeGeos(whiteL), M.white));
  g.add(mesh(mergeGeos(redL), M.red));
  g.add(mesh(mergeGeos(darkRedL), M.darkRed));
  g.add(mesh(mergeGeos(tanL), M.tan));
  g.add(mesh(mergeGeos(tanDL), M.tanD));
  g.add(mesh(mergeGeos(glassDL), M.glassD));
  g.add(mesh(mergeGeos(glassLL), M.glassL));
  g.add(mesh(mergeGeos(creamL), M.cream));
  g.add(mesh(mergeGeos(grayL), M.gray));
  g.add(mesh(mergeGeos(darkL), M.dark));
  g.add(mesh(mergeGeos(blueL), M.blue));
  g.add(mesh(mergeGeos(greenL), M.green));
  g.add(mesh(mergeGeos(trunkL), M.trunk));
  g.add(mesh(mergeGeos(steelL), M.steel));

  /* ========== 动画 ========== */
  g.userData.anim = [
    function (t) {                                   /* 1) 航标灯闪烁 */
      var b = sin(t * 3.0); beaconM.emissiveIntensity = 0.45 + 0.45 * (b > 0.6 ? 1 : 0.2);
    },
    function (t) { radar.rotation.y = t * 0.9; },    /* 2) 雷达旋转 */
    function (t) {                                   /* 3) 风向袋摆动（≤0.3rad） */
      sock.rotation.y = 0.25 * sin(t * 1.3); sock.rotation.z = -0.15 + 0.08 * sin(t * 2.1);
    },
    function (t) {                                   /* 4) 滑行道边灯呼吸 */
      taxiLightM.emissiveIntensity = 0.6 + 0.2 * sin(t * 1.8);
    }
  ];
  return g;
};
})();
