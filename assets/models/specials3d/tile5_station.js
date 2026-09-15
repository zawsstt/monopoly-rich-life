/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 5 中央车站（tile5_station.js）· 参考图高保真重建
 * -------------------------------------------------------------------------------------
 * 参考图 refs/sp_5.png：中西合璧古典大站（正立面，左右严格对称 7 体块）
 *   中央大厅：绿琉璃瓦筒拱大顶 + 顶脊金饰 + 巨大半圆拱玻璃立面（暗红木拱圈镶金边、
 *             朱红竖挺 + 放射辐条、拱心奶油白大钟）+ 拱下灰石檐带 + 通宽绿瓦雨棚
 *             + 朱红柱廊 + 三个暗色拱门洞 + 三级白石台阶
 *   双塔楼  ：方形奶油塔身 + 朱红角柱 + 金腰线 + 拱窗 + 重檐（绿瓦裙檐 + 鼓座暗窗带
 *             + 四角攒尖绿瓦顶 + 金宝顶）
 *   翼楼    ：内翼/外翼两级递降（绿瓦歇山坡顶 + 朱红壁柱 + 暗红腰带 + 拱窗）
 *   氛围    ：入口双红灯笼（呼吸发光）、站名牌「中央车站」、站后轨道
 *
 *   window.Special3D[5]() → THREE.Group（原点=格心，底面 y=0，正面朝 +Z）
 *   每次调用全新实例（材质不共享可变状态）
 *
 * 动画（group.userData.anim = [fn(t,dt)]）：1) 大钟分/时针  2) 红灯笼呼吸  3) 门洞暖光
 *
 * 技术约束：经典 script；THREE r147 全局；MeshStandardMaterial（convertSRGBToLinear）；
 *           纹理 Canvas ≤256px；mesh ≤130（同材质静态件手工合并 BufferGeometry）；
 *           占地 ≤2.7×2.7；底面 y=0；零 Math.random。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[tile5_station] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

var PI = Math.PI, sin = Math.sin, cos = Math.cos;

/* ================= 0. 工具（每次工厂调用内新建材质，无共享可变状态） ================= */
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(o.map ? (o.tint || '#ffffff') : hex),      /* 贴图材质：color 近白，避免与 map 叠色变暗 */
    roughness: (o.rough !== undefined ? o.rough : 0.85),
    metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
  if (o.map) { m.map = o.map; m.userData.previewColor = hex; }   /* 软渲染自查取色（无 WebGL 时） */
  if (o.side) m.side = o.side;
  return m;
}
function mesh(geo, mat) {
  var o = new THREE.Mesh(geo, mat);
  o.castShadow = true; o.receiveShadow = true;
  return o;
}
function grp() { return new THREE.Group(); }
/* 合并：把若干已变换好的 BufferGeometry 缝成 1 个（position/normal/uv） */
function mergeGeos(list) {
  var pos = [], nrm = [], uv = [], i, j, g, g2, p, n, u;
  for (i = 0; i < list.length; i++) {
    g = list[i];
    g2 = g.index ? g.toNonIndexed() : g;
    p = g2.attributes.position.array;
    n = g2.attributes.normal ? g2.attributes.normal.array : null;
    u = g2.attributes.uv ? g2.attributes.uv.array : null;
    for (j = 0; j < p.length; j++) pos.push(p[j]);
    if (n) { for (j = 0; j < n.length; j++) nrm.push(n[j]); }
    else { for (j = 0; j < p.length; j++) nrm.push(0); }
    if (u) { for (j = 0; j < u.length; j++) uv.push(u[j]); }
    else { for (j = 0; j < p.length / 3 * 2; j++) uv.push(0); }
  }
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return out;
}
function tbox(w, h, d, x, y, z) { return new THREE.BoxGeometry(w, h, d).translate(x, y, z); }
function tcyl(rt, rb, h, seg, x, y, z) { return new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z); }
function tsph(r, x, y, z, sy) {
  var g = new THREE.SphereGeometry(r, 16, 12);
  if (sy) g.scale(1, sy, 1);
  return g.translate(x, y, z);
}
/* 两点间斜杆（方截面 th），用于戗脊/斜撑 */
function tbar(x0, y0, z0, x1, y1, z1, th) {
  var dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0);
  var L = dir.length(); dir.normalize();
  var g = new THREE.BoxGeometry(th, th, L);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir));
  return g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
}
/* 半圆拱（XY 面，朝 +Z），thetaStart 0 → 上半圆 */
function tarc(r, tube, x, y, z) { return new THREE.TorusGeometry(r, tube, 8, 40, PI).translate(x, y, z); }
function thalfdisc(r, x, y, z, flip) {
  var g = new THREE.CircleGeometry(r, 32, 0, PI);
  if (flip) g.rotateY(PI);
  return g.translate(x, y, z);
}
/* 四坡（歇山/庑殿）屋面：底边 w×d 于 y=0，脊高 h、脊长 rl；alongZ 时脊沿 z。
 * UV：u 沿檐口、v 檐→脊，按 0.8 单位一贴（瓦列 ≈0.10 宽） */
function hipRoof(w, d, h, rl, alongZ) {
  if (alongZ) { var t = w; w = d; d = t; }
  var hw = w / 2, hd = d / 2, hr = rl / 2;
  var pos = [], uv = [];
  var slope = Math.sqrt(hd * hd + h * h) / 0.8;
  function tri(a, b, c, ua, va, ub, vb, uc, vc) {
    pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    uv.push(ua, va, ub, vb, uc, vc);
  }
  var A, B, Cc, D, k = w / 0.8;
  /* 前坡 */
  A = [-hw, 0, hd]; B = [hw, 0, hd]; Cc = [hr, h, 0]; D = [-hr, h, 0];
  tri(A, B, Cc, 0, 0, k, 0, (hr + hw) / 0.8, slope); tri(A, Cc, D, 0, 0, (hr + hw) / 0.8, slope, (hw - hr) / 0.8, slope);
  /* 后坡 */
  A = [hw, 0, -hd]; B = [-hw, 0, -hd]; Cc = [-hr, h, 0]; D = [hr, h, 0];
  tri(A, B, Cc, 0, 0, k, 0, (hr + hw) / 0.8, slope); tri(A, Cc, D, 0, 0, (hr + hw) / 0.8, slope, (hw - hr) / 0.8, slope);
  /* 左戗 */
  A = [-hw, 0, -hd]; B = [-hw, 0, hd]; Cc = [-hr, h, 0];
  tri(A, B, Cc, 0, 0, d / 0.8, 0, hd / 0.8, slope);
  /* 右戗 */
  A = [hw, 0, hd]; B = [hw, 0, -hd]; Cc = [hr, h, 0];
  tri(A, B, Cc, 0, 0, d / 0.8, 0, hd / 0.8, slope);
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.computeVertexNormals();
  if (alongZ) g.rotateY(PI / 2);
  return g;
}
/* 四角攒尖（方锥），底边正对轴向；UV 重映射到瓦贴 */
function pyramid(side, h, x, y, z) {
  var r = side / Math.SQRT2;
  var g = new THREE.ConeGeometry(r, h, 4, 1);
  g.rotateY(PI / 4);
  var uvA = g.attributes.uv, i, per = side * 4 / 0.8, sl = Math.sqrt(h * h + side * side / 4) / 0.8;
  for (i = 0; i < uvA.count; i++) uvA.setXY(i, uvA.getX(i) * per, uvA.getY(i) * sl);
  return g.translate(x, y + h / 2, z);
}
/* 方锥台裙檐（重檐下层） */
function frustum(sideTop, sideBot, h, x, y, z) {
  var g = new THREE.CylinderGeometry(sideTop / Math.SQRT2, sideBot / Math.SQRT2, h, 4, 1);
  g.rotateY(PI / 4);
  var uvA = g.attributes.uv, i;
  for (i = 0; i < uvA.count; i++) uvA.setXY(i, uvA.getX(i) * sideBot * 4 / 0.8, uvA.getY(i) * h * 2 / 0.8);
  return g.translate(x, y + h / 2, z);
}
/* 拱形（矩形 + 半圆）ShapeGeometry，UV 归一化到包围盒 */
function archShape(hw, y0, y1, seg) {
  var s = new THREE.Shape();
  s.moveTo(-hw, y0); s.lineTo(hw, y0); s.lineTo(hw, y1);
  s.absarc(0, y1, hw, 0, PI, false);
  s.lineTo(-hw, y0);
  var g = new THREE.ShapeGeometry(s, seg || 24);
  var p = g.attributes.position, uv = [], i, H = (y1 + hw) - y0;
  for (i = 0; i < p.count; i++) uv.push((p.getX(i) + hw) / (2 * hw), (p.getY(i) - y0) / H);
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return g;
}

/* ================= 1. Canvas 程序化纹理（≤256px） ================= */
function canvasTex(w, h, draw, rx, ry) {
  var cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  var g = cv.getContext('2d');
  draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (rx || ry) tex.repeat.set(rx || 1, ry || 1);
  return tex;
}
/* 绿琉璃瓦：8 列筒瓦/贴（竖向瓦垄 + 高光棱 + 横向瓦口线） */
function texTile() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#579582'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 8; i++) {
      var x = i * 16;
      g.fillStyle = '#3c6f60'; g.fillRect(x, 0, 3, h);
      g.fillStyle = '#4a8472'; g.fillRect(x + 3, 0, 3, h);
      g.fillStyle = '#7fbba3'; g.fillRect(x + 9, 0, 2, h);
      g.fillStyle = '#639e8b'; g.fillRect(x + 11, 0, 3, h);
    }
    g.fillStyle = 'rgba(30,60,50,0.28)';
    for (i = 0; i < 8; i++) g.fillRect(0, i * 16 + 13, w, 2);
    g.fillStyle = 'rgba(255,255,255,0.10)';
    for (i = 0; i < 8; i++) g.fillRect(0, i * 16 + 15, w, 1);
  });
}
/* 拱玻璃：暗青玻璃 + 朱红竖挺/横档 + 拱部放射辐条 + 逐格高光 */
function texArchGlass() {
  return canvasTex(256, 256, function (g, w, h) {
    /* 形状：u 0..1 ↔ x -hw..hw；v 0..1 ↔ y y0..y1+hw；拱心 v = 1 - hw/H */
    var springV = 0.435 / 0.885;            /* = 0.4915（矩 0.765..1.20 + r0.45） */
    var cy = (1 - springV) * h;             /* 拱心像素 y（自顶）*/
    g.fillStyle = '#3f6474'; g.fillRect(0, 0, w, h);
    var i, j, cols = 7, rows = 3, cw = w / cols, ch = (h - cy) / rows;
    for (i = 0; i < cols; i++) {
      for (j = 0; j < rows; j++) {
        g.fillStyle = ((i + j) % 3 === 0) ? '#4a7286' : (((i * 3 + j) % 4 === 0) ? '#365a6a' : '#3f6474');
        g.fillRect(i * cw, cy + j * ch, cw, ch);
        g.fillStyle = 'rgba(255,255,255,0.16)';
        g.fillRect(i * cw + 3, cy + j * ch + 3, cw - 6, 5);
      }
    }
    /* 拱部扇形分格明暗 */
    var spokes = 8, a;
    for (i = 0; i < spokes; i++) {
      g.fillStyle = (i % 2) ? '#436a7c' : '#385f70';
      g.beginPath(); g.moveTo(w / 2, cy);
      g.arc(w / 2, cy, w / 2, PI + i * PI / spokes, PI + (i + 1) * PI / spokes, false);
      g.closePath(); g.fill();
    }
    /* 斜向反光带 */
    g.fillStyle = 'rgba(220,240,245,0.13)';
    g.beginPath(); g.moveTo(w * 0.55, 0); g.lineTo(w * 0.75, 0); g.lineTo(w * 0.35, h); g.lineTo(w * 0.15, h); g.closePath(); g.fill();
    /* 朱红竖挺 + 横档 + 辐条 */
    g.strokeStyle = '#c94a38'; g.lineWidth = 5;
    for (i = 1; i < cols; i++) { g.beginPath(); g.moveTo(i * cw, cy); g.lineTo(i * cw, h); g.stroke(); }
    for (j = 1; j < rows; j++) { g.beginPath(); g.moveTo(0, cy + j * ch); g.lineTo(w, cy + j * ch); g.stroke(); }
    g.lineWidth = 6;
    g.beginPath(); g.moveTo(0, cy); g.lineTo(w, cy); g.stroke();
    g.lineWidth = 4;
    for (i = 1; i < spokes; i++) {
      a = PI + i * PI / spokes;
      g.beginPath(); g.moveTo(w / 2, cy); g.lineTo(w / 2 + cos(a) * w, cy + sin(a) * w); g.stroke();
    }
    /* 同心内环（拱部二道横档） */
    g.beginPath(); g.arc(w / 2, cy, w * 0.30, PI, 2 * PI, false); g.stroke();
    /* 金色细边（挺子高光） */
    g.strokeStyle = 'rgba(232,184,75,0.55)'; g.lineWidth = 1;
    for (i = 1; i < cols; i++) { g.beginPath(); g.moveTo(i * cw + 3, cy); g.lineTo(i * cw + 3, h); g.stroke(); }
  });
}
/* 大钟盘面：奶油底 + 12 时刻 + 60 分刻度 + 罗马式粗刻 */
function texClock() {
  return canvasTex(128, 128, function (g, w) {
    var cx = w / 2, R = w / 2 - 3, i, a;
    g.fillStyle = '#f6f1e4'; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#7a3a28'; g.lineWidth = 3;
    g.beginPath(); g.arc(cx, cx, R - 2, 0, PI * 2); g.stroke();
    for (i = 0; i < 60; i++) {
      a = i / 60 * PI * 2;
      var maj = (i % 5 === 0);
      g.strokeStyle = maj ? '#2b2b2b' : 'rgba(43,43,43,0.5)';
      g.lineWidth = maj ? 4 : 1.5;
      var r1 = R * (maj ? 0.74 : 0.80), r2 = R * 0.90;
      g.beginPath(); g.moveTo(cx + cos(a) * r1, cx + sin(a) * r1); g.lineTo(cx + cos(a) * r2, cx + sin(a) * r2); g.stroke();
    }
    g.fillStyle = '#2b2b2b'; g.beginPath(); g.arc(cx, cx, 3, 0, PI * 2); g.fill();
  });
}
/* 站名牌：藏蓝底金字「中央车站」 */
function texSign() {
  return canvasTex(256, 64, function (g, w, h) {
    g.fillStyle = '#1e3350'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e8b84b'; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6);
    g.strokeStyle = 'rgba(232,184,75,0.45)'; g.lineWidth = 1.5; g.strokeRect(9, 9, w - 18, h - 18);
    g.fillStyle = '#f2d78a'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 40px "Microsoft YaHei","PingFang SC",sans-serif';
    g.fillText('中央车站', w / 2, h / 2 + 2);
  });
}
/* 广场石板：暖灰底 + 十字缝 */
function texPlaza() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#c9c0ad'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,110,95,0.55)'; g.lineWidth = 2;
    var i;
    for (i = 0; i <= 4; i++) {
      g.beginPath(); g.moveTo(i * 32, 0); g.lineTo(i * 32, h); g.stroke();
      g.beginPath(); g.moveTo(0, i * 32); g.lineTo(w, i * 32); g.stroke();
    }
    g.fillStyle = 'rgba(255,255,255,0.08)';
    for (i = 0; i < 4; i++) g.fillRect(i * 32 + 2, 2, 28, 3);
  }, 6, 6);
}

/* ================= 2. 工厂 ================= */
window.Special3D = window.Special3D || {};
window.Special3D[5] = function () {
  var g = grp();
  g.name = 'special_5_central_station';

  /* —— 材质（本实例独占） —— */
  var M = {
    plaza:   std('#c9c0ad', { rough: 0.9, map: texPlaza() }),
    stoneW:  std('#efe9dc', { rough: 0.8 }),
    stoneG:  std('#b9b2a2', { rough: 0.85 }),
    cream:   std('#ece2cf', { rough: 0.75 }),
    red:     std('#d4503c', { rough: 0.55 }),
    darkRed: std('#7a3a28', { rough: 0.6 }),
    gold:    std('#e2b24a', { rough: 0.4, metal: 0.35 }),
    tile:    std('#579582', { rough: 0.62, map: texTile(), side: THREE.DoubleSide }),
    eave:    std('#2c3a36', { rough: 0.8 }),
    slate:   std('#3f6474', { rough: 0.3, metal: 0.25 }),
    rail:    std('#8d949c', { rough: 0.35, metal: 0.8 }),
    sleeper: std('#6b5a48', { rough: 0.9 }),
    ballast: std('#8e887c', { rough: 0.95 }),
    navy:    std('#1e3350', { rough: 0.55 })
  };
  var archGlassM = new THREE.MeshStandardMaterial({
    color: C('#e4eef2'), map: texArchGlass(), roughness: 0.22, metalness: 0.2, flatShading: true
  });
  archGlassM.userData.previewColor = '#3f6474';
  var lanternM = std('#e0402e', { rough: 0.5, emissive: '#ff5a3c', ei: 0.55 });
  var doorGlowM = std('#3a2a1c', { rough: 0.8, emissive: '#ffb060', ei: 0.28 });
  var clockFaceM = new THREE.MeshStandardMaterial({ map: texClock(), roughness: 0.5, flatShading: true });
  clockFaceM.userData.previewColor = '#f6f1e4';
  var signM = new THREE.MeshStandardMaterial({ map: texSign(), roughness: 0.5, emissive: C('#5a4a20'), emissiveIntensity: 0.3, flatShading: true });
  signM.userData.previewColor = '#1e3350';

  var PLZ = 0.05, PL = 0.20, s, cx, i;
  var creamL = [], redL = [], goldL = [], darkRedL = [], tileL = [], eaveL = [], slateL = [], stoneWL = [], stoneGL = [], doorL = [];
  /* 布局常量（对照参考图量得：中央 41% / 塔 9% / 内翼 8% / 外翼 12%；塔顶与拱顶宝顶齐平） */
  var HW = 0.55;                 /* 中央大厅半宽 */
  var VR = 0.585;                /* 筒拱半径（含 0.035 出檐） */
  var TX = 0.68, TW = 0.26;      /* 塔楼中心 / 边长 */
  var IX = 0.92, IW = 0.22;      /* 内翼 */
  var OX = 1.18, OW = 0.30;      /* 外翼 */

  /* ========== 地坪 / 台基 / 台阶 ========== */
  g.add(mesh(new THREE.BoxGeometry(2.64, 0.05, 2.56).translate(0, 0.025, 0.02), M.plaza));
  stoneWL.push(tbox(2.64, 0.15, 1.70, 0, 0.125, -0.23));                  /* 台基 z -1.08..0.62 */
  stoneGL.push(tbox(2.66, 0.02, 1.72, 0, 0.20, -0.23));                    /* 台基压顶灰线 */
  for (i = 1; i <= 3; i++) stoneWL.push(tbox(1.50, 0.05 * i, 0.16, 0, PLZ + 0.025 * i, 0.70 + 0.16 * (3 - i)));
  /* 垂带 + 望柱 + 扶手 + 金珠 */
  for (s = -1; s <= 1; s += 2) {
    stoneWL.push(tbox(0.08, 0.15, 0.50, s * 0.79, 0.125, 0.87));
    stoneWL.push(tbox(0.045, 0.11, 0.045, s * 0.79, 0.255, 0.66));
    stoneWL.push(tbox(0.045, 0.11, 0.045, s * 0.79, 0.255, 0.86));
    stoneWL.push(tbox(0.045, 0.11, 0.045, s * 0.79, 0.255, 1.06));
    stoneWL.push(tbox(0.04, 0.03, 0.44, s * 0.79, 0.30, 0.86));
    goldL.push(tsph(0.025, s * 0.79, 0.325, 0.66));
    goldL.push(tsph(0.025, s * 0.79, 0.325, 1.06));
  }

  /* ========== 中央大厅：厅体 + 前后山花 + 筒拱绿瓦大顶 ========== */
  creamL.push(tbox(HW * 2, 1.00, 1.50, 0, 0.70, -0.30));                  /* y0.20..1.20 z-1.05..0.45 */
  creamL.push(thalfdisc(HW, 0, 1.20, 0.462));
  creamL.push(thalfdisc(HW, 0, 1.20, -1.062, true));
  var vault = new THREE.CylinderGeometry(VR, VR, 1.58, 40, 1, true, PI / 2, PI);
  vault.rotateX(PI / 2);
  (function () {
    var uvA = vault.attributes.uv, k;
    for (k = 0; k < uvA.count; k++) uvA.setXY(k, uvA.getY(k) * 1.58 / 0.8, uvA.getX(k) * (PI * VR) / 0.8);
  })();
  vault.translate(0, 1.20, -0.30);
  tileL.push(vault);
  /* 拱檐暗板（前后）+ 金边弧 */
  eaveL.push(new THREE.TorusGeometry(VR - 0.012, 0.022, 8, 40, PI).translate(0, 1.20, 0.492));
  eaveL.push(new THREE.TorusGeometry(VR - 0.012, 0.022, 8, 40, PI).translate(0, 1.20, -1.092));
  goldL.push(tarc(VR + 0.008, 0.014, 0, 1.20, 0.50));
  goldL.push(tarc(VR + 0.008, 0.014, 0, 1.20, -1.10));
  goldL.push(tbox(0.07, 0.035, 1.62, 0, 1.20 + VR + 0.012, -0.30));       /* 顶脊 */
  goldL.push(tbox(0.22, 0.05, 0.16, 0, 1.20 + VR + 0.05, -0.30));         /* 脊心座 */
  goldL.push(tbox(0.07, 0.05, 0.07, 0, 1.20 + VR + 0.095, -0.30));
  goldL.push(tsph(0.042, 0, 1.20 + VR + 0.14, -0.30));                    /* 宝珠（顶 ≈1.93） */
  goldL.push(tbox(0.06, 0.07, 0.10, 0, 1.20 + VR + 0.04, 0.50));          /* 脊端吻兽 ×2（沿 z 两端） */
  goldL.push(tbox(0.06, 0.07, 0.10, 0, 1.20 + VR + 0.04, -1.10));

  /* ========== 大拱玻璃（矩 0.765..1.20 + 半圆 r0.45 → 顶 1.65）+ 暗红木拱圈镶金 ========== */
  var arch = mesh(archShape(0.45, 0.765, 1.20), archGlassM);
  arch.position.z = 0.476; g.add(arch);
  darkRedL.push(tarc(0.478, 0.036, 0, 1.20, 0.49));
  goldL.push(tarc(0.518, 0.012, 0, 1.20, 0.492));
  goldL.push(tarc(0.441, 0.010, 0, 1.20, 0.494));
  for (s = -1; s <= 1; s += 2) {
    darkRedL.push(tbox(0.072, 0.44, 0.06, s * 0.478, 0.98, 0.49));
    goldL.push(tbox(0.024, 0.44, 0.03, s * 0.519, 0.98, 0.493));
    goldL.push(tbox(0.020, 0.44, 0.03, s * 0.441, 0.98, 0.495));
    goldL.push(tbox(0.10, 0.03, 0.09, s * 0.478, 1.215, 0.49));           /* 拱脚金斗 */
  }
  goldL.push(tbox(0.13, 0.10, 0.06, 0, 1.70, 0.50));                      /* 拱顶金匾饰 */
  goldL.push(tbox(0.22, 0.04, 0.06, 0, 1.655, 0.50));
  /* 大钟（拱心） */
  var clockG = grp(); clockG.position.set(0, 1.245, 0.51); g.add(clockG);
  var face = mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.024, 32), M.stoneW);
  face.rotation.x = PI / 2; clockG.add(face);
  var faceTex = mesh(new THREE.CircleGeometry(0.128, 32), clockFaceM);
  faceTex.position.z = 0.013; clockG.add(faceTex);
  goldL.push(new THREE.TorusGeometry(0.141, 0.016, 8, 36).translate(0, 1.245, 0.515));
  var minHand = mesh(new THREE.BoxGeometry(0.014, 0.105, 0.006).translate(0, 0.047, 0), M.eave);
  minHand.position.z = 0.018; clockG.add(minHand);
  var hourHand = mesh(new THREE.BoxGeometry(0.018, 0.072, 0.006).translate(0, 0.032, 0), M.eave);
  hourHand.position.z = 0.016; clockG.add(hourHand);
  goldL.push(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 12).rotateX(PI / 2).translate(0, 1.245, 0.534));

  /* ========== 拱下灰石檐带 + 通宽绿瓦雨棚 + 朱红柱廊 + 三拱门洞 + 站名牌 ========== */
  stoneGL.push(tbox(1.12, 0.045, 0.05, 0, 0.742, 0.47));
  tileL.push(hipRoof(1.24, 0.34, 0.10, 1.16, false).translate(0, 0.62, 0.62));
  eaveL.push(tbox(1.26, 0.028, 0.36, 0, 0.606, 0.62));
  goldL.push(tbox(1.26, 0.012, 0.022, 0, 0.60, 0.80));
  goldL.push(tbox(0.022, 0.012, 0.36, -0.63, 0.60, 0.62));
  goldL.push(tbox(0.022, 0.012, 0.36, 0.63, 0.60, 0.62));
  goldL.push(new THREE.BoxGeometry(0.08, 0.05, 0.05).rotateZ(0.5).translate(-0.62, 0.70, 0.79));   /* 雨棚翘角 */
  goldL.push(new THREE.BoxGeometry(0.08, 0.05, 0.05).rotateZ(-0.5).translate(0.62, 0.70, 0.79));
  var colX = [-0.53, -0.22, 0.22, 0.53];
  for (i = 0; i < 4; i++) {
    redL.push(tcyl(0.034, 0.034, 0.39, 12, colX[i], PL + 0.20, 0.66));
    stoneGL.push(tbox(0.10, 0.045, 0.10, colX[i], PL + 0.0225, 0.66));
    goldL.push(tbox(0.09, 0.028, 0.09, colX[i], 0.578, 0.66));
    redL.push(tbox(0.16, 0.024, 0.05, colX[i], 0.58, 0.66));
  }
  redL.push(tbox(1.18, 0.03, 0.05, 0, 0.595, 0.66));                      /* 额枋 */
  for (i = -1; i <= 1; i++) {
    doorL.push(tbox(0.20, 0.30, 0.02, i * 0.31, 0.35, 0.458));
    doorL.push(thalfdisc(0.10, i * 0.31, 0.50, 0.469));
    goldL.push(tbox(0.24, 0.014, 0.024, i * 0.31, 0.205, 0.455));
  }
  var sign = mesh(new THREE.BoxGeometry(0.40, 0.075, 0.022), M.navy);
  sign.position.set(0, 0.545, 0.66); g.add(sign);
  var signFace = mesh(new THREE.PlaneGeometry(0.37, 0.058), signM);
  signFace.position.set(0, 0.545, 0.672); g.add(signFace);
  goldL.push(tbox(0.41, 0.010, 0.026, 0, 0.586, 0.66));
  goldL.push(tbox(0.41, 0.010, 0.026, 0, 0.504, 0.66));

  /* ========== 双塔楼（纤细方塔 · 重檐攒尖 · 顶与拱顶齐平）+ 塔后侧翼 ========== */
  for (s = -1; s <= 1; s += 2) {
    cx = s * TX;
    creamL.push(tbox(TW, 1.05, TW, cx, 0.725, 0.32));                     /* 塔身 y0.20..1.25 z0.19..0.45 */
    creamL.push(tbox(TW, 0.75, 1.24, cx, 0.575, -0.43));                  /* 侧翼 y..0.95 z-1.05..0.19 */
    tileL.push(hipRoof(TW + 0.04, 1.28, 0.11, 0.96, true).translate(cx, 0.95, -0.43));
    eaveL.push(tbox(TW + 0.04, 0.025, 1.28, cx, 0.94, -0.43));
    goldL.push(tbox(TW + 0.02, 0.02, 1.26, cx, 0.925, -0.43));
    /* 塔身朱红角柱 ×4 + 金腰线 ×2 */
    redL.push(tbox(0.04, 1.05, 0.04, cx - 0.115, 0.725, 0.435));
    redL.push(tbox(0.04, 1.05, 0.04, cx + 0.115, 0.725, 0.435));
    redL.push(tbox(0.04, 1.05, 0.04, cx - 0.115, 0.725, 0.205));
    redL.push(tbox(0.04, 1.05, 0.04, cx + 0.115, 0.725, 0.205));
    goldL.push(tbox(TW + 0.03, 0.022, TW + 0.03, cx, 0.66, 0.32));
    goldL.push(tbox(TW + 0.03, 0.022, TW + 0.03, cx, 0.98, 0.32));
    /* 拱窗三层（前面 + 外侧面）+ 金窗台 */
    var wy = [0.48, 0.80, 1.10], wi;
    for (wi = 0; wi < 3; wi++) {
      slateL.push(tbox(0.08, 0.13, 0.012, cx, wy[wi], 0.458));
      slateL.push(thalfdisc(0.04, cx, wy[wi] + 0.065, 0.466));
      goldL.push(tbox(0.12, 0.014, 0.024, cx, wy[wi] - 0.075, 0.458));
      slateL.push(tbox(0.012, 0.13, 0.08, cx + s * 0.138, wy[wi], 0.32));
      slateL.push(new THREE.CircleGeometry(0.04, 16, 0, PI).rotateY(s * PI / 2).translate(cx + s * 0.146, wy[wi] + 0.065, 0.32));
    }
    /* 重檐：暗檐板 → 绿瓦裙檐（宽出檐）→ 鼓座（暗窗带 + 红角柱）→ 暗檐板 → 攒尖 → 金宝顶 */
    eaveL.push(tbox(0.36, 0.04, 0.36, cx, 1.27, 0.32));
    tileL.push(frustum(0.26, 0.42, 0.09, cx, 1.29, 0.32));
    creamL.push(tbox(0.23, 0.14, 0.23, cx, 1.45, 0.32));
    slateL.push(tbox(0.24, 0.06, 0.24, cx, 1.46, 0.32));
    redL.push(tbox(0.03, 0.14, 0.03, cx - 0.105, 1.45, 0.425));
    redL.push(tbox(0.03, 0.14, 0.03, cx + 0.105, 1.45, 0.425));
    redL.push(tbox(0.03, 0.14, 0.03, cx - 0.105, 1.45, 0.215));
    redL.push(tbox(0.03, 0.14, 0.03, cx + 0.105, 1.45, 0.215));
    eaveL.push(tbox(0.34, 0.03, 0.34, cx, 1.535, 0.32));
    tileL.push(pyramid(0.36, 0.25, cx, 1.55, 0.32));
    goldL.push(tbar(cx, 1.80, 0.32, cx - 0.18, 1.55, 0.50, 0.016));      /* 四条戗脊 */
    goldL.push(tbar(cx, 1.80, 0.32, cx + 0.18, 1.55, 0.50, 0.016));
    goldL.push(tbar(cx, 1.80, 0.32, cx - 0.18, 1.55, 0.14, 0.016));
    goldL.push(tbar(cx, 1.80, 0.32, cx + 0.18, 1.55, 0.14, 0.016));
    goldL.push(tcyl(0.03, 0.05, 0.04, 12, cx, 1.815, 0.32));
    goldL.push(tsph(0.034, cx, 1.86, 0.32));
    goldL.push(tcyl(0.006, 0.006, 0.07, 8, cx, 1.925, 0.32));
    /* 裙檐四角翘饰（参考图塔檐起翘） */
    goldL.push(tbar(cx - 0.20, 1.30, 0.53, cx - 0.25, 1.36, 0.58, 0.018));
    goldL.push(tbar(cx + 0.20, 1.30, 0.53, cx + 0.25, 1.36, 0.58, 0.018));
    goldL.push(tbar(cx - 0.20, 1.30, 0.11, cx - 0.25, 1.36, 0.06, 0.018));
    goldL.push(tbar(cx + 0.20, 1.30, 0.11, cx + 0.25, 1.36, 0.06, 0.018));
  }
  /* 雨棚檐下斗拱带（金/朱红交错小斗） */
  for (i = 0; i < 9; i++) {
    var bx = -0.52 + i * 0.13;
    if (i % 2 === 0) goldL.push(tbox(0.035, 0.03, 0.05, bx, 0.585, 0.78));
    else redL.push(tbox(0.03, 0.03, 0.05, bx, 0.585, 0.78));
  }

  /* ========== 翼楼：内翼（窄高）+ 外翼（宽低），绿瓦歇山 + 朱红壁柱 + 暗红腰带 + 拱窗 ========== */
  for (s = -1; s <= 1; s += 2) {
    var ix = s * IX, ox = s * OX;
    creamL.push(tbox(IW, 0.68, 1.31, ix, 0.54, -0.295));                  /* 内翼 y..0.88 z-0.95..0.36 */
    tileL.push(hipRoof(IW + 0.04, 1.35, 0.10, 0.98, true).translate(ix, 0.88, -0.295));
    eaveL.push(tbox(IW + 0.04, 0.025, 1.35, ix, 0.87, -0.295));
    goldL.push(tbox(IW + 0.02, 0.02, 1.33, ix, 0.855, -0.295));
    darkRedL.push(tbox(IW + 0.02, 0.04, 1.33, ix, 0.60, -0.295));
    creamL.push(tbox(OW, 0.58, 1.15, ox, 0.49, -0.275));                  /* 外翼 y..0.78 z-0.85..0.30 x..±1.34 */
    tileL.push(hipRoof(OW + 0.03, 1.19, 0.11, 0.80, true).translate(ox, 0.78, -0.275));
    eaveL.push(tbox(OW + 0.03, 0.025, 1.19, ox, 0.77, -0.275));
    goldL.push(tbox(OW + 0.01, 0.02, 1.17, ox, 0.755, -0.275));
    darkRedL.push(tbox(OW + 0.01, 0.035, 1.17, ox, 0.47, -0.275));
    /* 朱红壁柱：内翼前 ×2、外翼前 ×2、外侧面 ×3 */
    redL.push(tbox(0.04, 0.68, 0.04, ix - s * 0.09, 0.54, 0.37));
    redL.push(tbox(0.04, 0.68, 0.04, ix + s * 0.09, 0.54, 0.37));
    redL.push(tbox(0.045, 0.58, 0.04, ox - s * 0.125, 0.49, 0.31));
    redL.push(tbox(0.045, 0.58, 0.04, ox + s * 0.125, 0.49, 0.31));
    redL.push(tbox(0.028, 0.58, 0.05, s * 1.331, 0.49, -0.72));
    redL.push(tbox(0.028, 0.58, 0.05, s * 1.331, 0.49, -0.275));
    redL.push(tbox(0.028, 0.58, 0.05, s * 1.331, 0.49, 0.17));
    /* 拱窗：内翼前 1、外翼前 1（大）、外侧面 2、内翼侧高窗 2 */
    slateL.push(tbox(0.08, 0.20, 0.012, ix, 0.50, 0.368));
    slateL.push(thalfdisc(0.04, ix, 0.60, 0.376));
    goldL.push(tbox(0.12, 0.014, 0.024, ix, 0.395, 0.368));
    slateL.push(tbox(0.13, 0.20, 0.012, ox, 0.42, 0.308));
    slateL.push(thalfdisc(0.065, ox, 0.52, 0.316));
    goldL.push(tbox(0.17, 0.014, 0.024, ox, 0.315, 0.308));
    slateL.push(tbox(0.012, 0.18, 0.11, s * 1.338, 0.40, -0.50));
    slateL.push(new THREE.CircleGeometry(0.055, 16, 0, PI).rotateY(s * PI / 2).translate(s * 1.346, 0.49, -0.50));
    slateL.push(tbox(0.012, 0.18, 0.11, s * 1.338, 0.40, -0.05));
    slateL.push(new THREE.CircleGeometry(0.055, 16, 0, PI).rotateY(s * PI / 2).translate(s * 1.346, 0.49, -0.05));
    slateL.push(tbox(0.012, 0.11, 0.10, s * (IX + IW / 2 + 0.008), 0.79, -0.60));
    slateL.push(tbox(0.012, 0.11, 0.10, s * (IX + IW / 2 + 0.008), 0.79, -0.10));
  }

  /* ========== 红灯笼柱 ×2（广场前角） ========== */
  var lanternL = [];
  for (s = -1; s <= 1; s += 2) {
    redL.push(tcyl(0.02, 0.024, 0.62, 12, s * 1.06, PLZ + 0.31, 1.08));
    stoneGL.push(tbox(0.10, 0.04, 0.10, s * 1.06, PLZ + 0.02, 1.08));
    goldL.push(tbox(0.07, 0.02, 0.07, s * 1.06, PLZ + 0.63, 1.08));
    redL.push(tbox(0.18, 0.02, 0.02, s * 0.98, PLZ + 0.61, 1.08));
    goldL.push(tcyl(0.03, 0.03, 0.014, 12, s * 0.90, PLZ + 0.56, 1.08));
    lanternL.push(tsph(0.058, s * 0.90, PLZ + 0.50, 1.08, 0.86));
    goldL.push(tcyl(0.03, 0.03, 0.014, 12, s * 0.90, PLZ + 0.445, 1.08));
    goldL.push(tcyl(0.008, 0.012, 0.06, 8, s * 0.90, PLZ + 0.405, 1.08));
  }
  g.add(mesh(mergeGeos(lanternL), lanternM));

  /* ========== 站后轨道 ========== */
  g.add(mesh(new THREE.BoxGeometry(2.64, 0.02, 0.22).translate(0, 0.06, -1.17), M.ballast));
  var sleeperL = [];
  for (i = 0; i < 14; i++) sleeperL.push(tbox(0.05, 0.012, 0.18, -1.2 + i * 0.1846, 0.076, -1.17));
  g.add(mesh(mergeGeos(sleeperL), M.sleeper));
  g.add(mesh(mergeGeos([tbox(2.60, 0.02, 0.014, 0, 0.092, -1.11), tbox(2.60, 0.02, 0.014, 0, 0.092, -1.23)]), M.rail));

  /* ========== 合并落地 ========== */
  g.add(mesh(mergeGeos(stoneWL), M.stoneW));
  g.add(mesh(mergeGeos(stoneGL), M.stoneG));
  g.add(mesh(mergeGeos(creamL), M.cream));
  g.add(mesh(mergeGeos(tileL), M.tile));
  g.add(mesh(mergeGeos(eaveL), M.eave));
  g.add(mesh(mergeGeos(goldL), M.gold));
  g.add(mesh(mergeGeos(darkRedL), M.darkRed));
  g.add(mesh(mergeGeos(redL), M.red));
  g.add(mesh(mergeGeos(slateL), M.slate));
  g.add(mesh(mergeGeos(doorL), doorGlowM));

  /* ========== 动画 ========== */
  g.userData.anim = [
    function (t) {                                   /* 1) 大钟：分针 1 圈/60s，时针缓行 */
      minHand.rotation.z = -t * (PI / 30);
      hourHand.rotation.z = -t * (PI / 360);
    },
    function (t) {                                   /* 2) 红灯笼呼吸（幅度 ≤0.25） */
      lanternM.emissiveIntensity = 0.55 + 0.2 * sin(t * 1.7);
    },
    function (t) {                                   /* 3) 门洞暖光微漾 */
      doorGlowM.emissiveIntensity = 0.28 + 0.1 * sin(t * 1.1 + 1.0);
    }
  ];
  return g;
};
})();
