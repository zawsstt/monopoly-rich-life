/* 大富翁·现代写实棋盘（蓉）格 18「锦里古街」—— 锦里大红牌坊 + 白墙木构铺面 + 戏台 + 满街红灯笼，四年代演进 · v2 材质精修
 * 契约：window.Props3DModern[18](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z；每级 mesh ≤55（v2 增量 ≤+6，实际 -2）；
 * 零 Math.random（mulberry32 LCG）；动画 ≤2 项（窗光 / 灯笼+匾额 emissive 呼吸，240 帧无 NaN）。剪影/构图与 v1 完全一致（几何调用逐一保留）。
 * v2 工艺（对标 specials3d/tile29_water.js · prop_9 overlay 语义）：桶 = roughness|metalness|tex|ws|emissive|opacity，同桶手写合并 BufferGeometry；
 *   顶点色承载主色调、材质 color=白、近白 Canvas 承载细节（基色+块面风化+分缝+高光+噪点+苔痕，≤256px）；boxUV 按三角面主法线轴投影 × 世界尺寸烘焙；
 *   材质分区：石板 0.92 / 石础 0.9 / 灰泥 0.85 / 瓦 0.7 / 木 0.72 / 树干 0.9 / 玻璃 0.15·metal0.6 / 金饰 0.35·metal0.8 / 钢 0.45·metal0.7；灯笼纸纹与红匾 map+emissiveMap。
 * 年代特征（refs/modern/prop_18.png）：lv1 1990s 素白墙+单层木牌坊+少量灯笼；lv2 2000s +金顶+跨街灯笼串+树；lv3 2010s +双层牌坊+红围幔酒旗+暖光柱廊+双排灯笼+街灯+凉亭；lv4 2020s +坊顶增高+满街灯笼+门灯花箱+玻璃茶座+茂树。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_18] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TX = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function F(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function RA(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')'; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? RA(255, 255, 255, a) : RA(24, 22, 18, a), R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); } /* 噪点层 */
function MOSS(g, w, h, n, y0, R) { for (var i = 0; i < n; i++) F(g, RA(96, 124, 58, 0.1 + R() * 0.16), R() * w, y0 + R() * (h - y0), 2 + R() * 6, 2 + R() * 3); } /* 苔痕层（下部） */
/* ---- 近白 overlay 纹理（顶点色承载主色）：各 ≥5 层 = 基色 + 块面风化 + 分缝 + 高光 + 噪点 + 苔痕 ---- */
var TXF = {
  s: function (g, w, h, R) { F(g, '#f0ece5', 0, 0, w, h); for (var y = 0; y < h; y += 32) { var o = (y / 32) % 2 ? 32 : 0; F(g, RA(80, 74, 64, 0.5), 0, y, w, 2); /* 石板：错缝分块+块差+磨光 */
    for (var x = o - 64; x < w; x += 64) { F(g, RA(80, 74, 64, 0.4), x, y, 2, 32); F(g, R() > 0.5 ? RA(255, 255, 250, 0.12) : RA(70, 64, 52, 0.1), x + 3, y + 3, 59, 27); F(g, RA(255, 255, 255, 0.22), x + 6, y + 4, 30 + R() * 24, 2); } }
    SPK(g, w, h, 80, 0.06, R); MOSS(g, w, h, 10, 0, R); },
  t: function (g, w, h, R) { F(g, '#eceeed', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, RA(30, 36, 44, 0.5), x + 11, 0, 4, h); F(g, RA(255, 255, 255, 0.55), x + 2, 0, 2, h); } /* 灰瓦：垄沟+釉光+行缝+瓦面风化 */
    for (var y = 10; y < h; y += 22) { F(g, RA(20, 26, 34, 0.4), 0, y, w, 2); for (var i = 0; i < 4; i++) F(g, RA(60, 66, 70, 0.05 + R() * 0.1), R() * w, y + 2, 12, 18); } SPK(g, w, h, 60, 0.06, R); MOSS(g, w, h, 12, 70, R); },
  w: function (g, w, h, R) { F(g, '#f5ebdf', 0, 0, w, h); for (var x = 0; x < w; x += 5) F(g, RA(70, 40, 20, 0.14 + R() * 0.14), x + R() * 2, 0, 1, h); /* 木构：直纹+节疤+顺纹高光 */
    for (var i = 0; i < 3; i++) { g.fillStyle = RA(70, 40, 20, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 3 + R() * 3, 0, 6.283); g.fill(); } for (x = 6; x < w; x += 28) F(g, RA(255, 255, 255, 0.32), x, 0, 2, h); SPK(g, w, h, 40, 0.05, R); },
  p: function (g, w, h, R) { F(g, '#f8f4ec', 0, 0, w, h); for (var i = 0; i < 9; i++) F(g, RA(120, 110, 88, 0.05 + R() * 0.07), R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80); /* 灰泥：雨渍+裂纹+泛潮+噪点+苔 */
    for (i = 0; i < 4; i++) { var x0 = R() * w; g.strokeStyle = RA(110, 100, 80, 0.18); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); } F(g, RA(90, 84, 66, 0.1), 0, 108, w, 20); SPK(g, w, h, 100, 0.05, R); MOSS(g, w, h, 8, 100, R); },
  l: function (g, w, h, R) { F(g, '#f1f5ea', 0, 0, w, h); for (var i = 0; i < 34; i++) { g.fillStyle = i % 2 ? RA(34, 66, 24, 0.28) : RA(255, 255, 240, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } }, /* 树冠：明暗叶斑 */
  n: function (g, w, h, R) { F(g, '#ffffff', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, RA(120, 20, 10, 0.35), x + 6, 0, 3, h); F(g, RA(255, 240, 220, 0.4), x + 12, 0, 2, h); } F(g, RA(120, 60, 10, 0.3), 0, 0, w, 6); F(g, RA(120, 60, 10, 0.3), 0, h - 6, w, 6); SPK(g, w, h, 20, 0.04, R); }, /* 灯笼纸：竹骨+纸纹（map+emissiveMap） */
  g: function (g, w, h) { F(g, '#8a2318', 0, 0, w, h); g.strokeStyle = '#ffd98c'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#ffd98c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 42px "Microsoft YaHei",sans-serif'; g.fillText('锦里', w / 2, h / 2 + 2); } /* 红底金字大牌匾 256×64 */
};
function tex(id) { if (_TX[id]) return _TX[id]; var c = id === 'g' ? cv(256, 64) : cv(128, 128); TXF[id](c.getContext('2d'), c.width, c.height, lcg(1800 + id.charCodeAt(0))); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return (_TX[id] = t); }
/* ---- 桶系统：桶 = 材质参数；MS() 返回 {b:桶, c:线性顶点色}；flush 同桶合并 + 顶点色 + boxUV（ws=每重复米数，0=保留原 UV） ---- */
var BK;
function MS(h, rg, mt, tx, ws, em, ei, op) { var k = rg + '|' + (mt || 0) + '|' + (tx || '') + '|' + (ws || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (op || 0); var b = BK[k] || (BK[k] = { rg: rg, mt: mt || 0, tx: tx || '', ws: ws || 0, em: em || '', ei: ei || 0, op: op || 0, gs: [], cs: [] }); return { b: b, c: V(h) }; }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(m, g) { m.b.gs.push(g); m.b.cs.push(m.c); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function A2(m, geo, x, y, z, ry) { put(m, xf(geo, x, y, z, 0, ry || 0, 0)); }
function TRI(m, w, h, d, x, y, z) { var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); A2(m, new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), x, y, z); }
function EAVE(m, w, h, t, tip, d, x, y, z) { /* 卷檐坡屋顶： quadratic 翘檐断面沿脊挤出 */
  var hw = w / 2, s = new THREE.Shape();
  s.moveTo(0, h); s.lineTo(hw * 0.62, 0); s.quadraticCurveTo(hw * 0.86, 0, hw, tip);
  s.lineTo(hw, tip + t); s.quadraticCurveTo(hw * 0.86, t, hw * 0.62, t); s.lineTo(0, h + t);
  s.lineTo(-hw * 0.62, t); s.quadraticCurveTo(-hw * 0.86, t, -hw, tip + t); s.lineTo(-hw, tip);
  s.quadraticCurveTo(-hw * 0.86, 0, -hw * 0.62, 0); s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2);
  A2(m, geo, x, y, z, PI / 2);
}
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i, j; if (!gs.length) continue; /* 空桶不出 mesh */
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ca = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) {
      var p = gs[i].attributes.position.array, c = b.cs[i]; pa.set(p, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2);
      for (j = 0; j < p.length; j += 3) { ca[o + j] = c[0]; ca[o + j + 1] = c[1]; ca[o + j + 2] = c[2]; } o += p.length;
    }
    if (b.ws) for (i = 0; i < P; i += 9) { /* boxUV：三角面主法线轴投影 × 1/ws（世界尺寸烘焙，跨件无缝） */
      var ax = pa[i + 3] - pa[i], ay = pa[i + 4] - pa[i + 1], az = pa[i + 5] - pa[i + 2], bx = pa[i + 6] - pa[i], by = pa[i + 7] - pa[i + 1], bz = pa[i + 8] - pa[i + 2];
      var nx = Math.abs(ay * bz - az * by), ny = Math.abs(az * bx - ax * bz), nz = Math.abs(ax * by - ay * bx), s = 1 / b.ws;
      for (j = 0; j < 3; j++) { var q = i + j * 3, u = i / 9 * 6 + j * 2; if (ny >= nx && ny >= nz) { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 2] * s; } else if (nx >= nz) { ua[u] = pa[q + 2] * s; ua[u + 1] = pa[q + 1] * s; } else { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 1] * s; } }
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true });
    if (b.tx) m.map = tex(b.tx); if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tx) m.emissiveMap = m.map; } if (b.op) { m.transparent = true; m.opacity = b.op; }
    b.m = m; var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function EI(m, v) { if (m && m.b.m) m.b.m.emissiveIntensity = v; }
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_18_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 18; g.userData.level = level;
  BK = {};
  var A = { /* 材质分区（桶）：石板/石础/灰泥/瓦/木/树干/玻璃/金/钢/布/线 —— 同桶不同顶点色（stone/lane、plast/white、leaf/leaf2 合桶） */
    stone: MS('#7e766a', 0.92, 0, 's', 0.6), lane: MS('#746a5e', 0.92, 0, 's', 0.6), stone2: MS('#a39a88', 0.9, 0, 's', 0.4),
    plast: MS(['#cbc2ae', '#d6cdb9', '#e2dbc9', '#e0d8c5'][level - 1], 0.85, 0, 'p', 0.8), white: MS('#ddd6c6', 0.85, 0, 'p', 0.8),
    roof: MS(['#40433a', '#454841', '#4a4d45', '#484b44'][level - 1], 0.7, 0, 't', 0.35),
    wood: MS(level >= 4 ? '#54381e' : '#4a3018', 0.72, 0, 'w', 0.3), trunk: MS('#4e3624', 0.9, 0, 'w', 0.3), win: MS('#262c30', 0.15, 0.6),
    leaf: MS('#6c7d42', 0.95, 0, 'l', 0.3), leaf2: MS('#80904f', 0.95, 0, 'l', 0.3), gold: MS('#c9a04a', 0.35, 0.8),
    wire: MS('#3d3b38', 0.8), flagR: MS('#a5352a', 0.85), steel: MS('#7d848a', 0.45, 0.7), sky: MS('#354049', 0.12, 0.5, '', 0, '', 0, 0.55)
  };
  var glow = MS('#5a4636', 0.2, 0, '', 0, '#ffbd66', 0.14); /* 暖光窗玻璃：低 rough */
  var lant = MS('#b03828', 0.6, 0, 'n', 0.12, '#ff5a2a', level >= 2 ? 0.3 : 0.05); /* 灯笼纸：map+emissiveMap（lv1 微光） */
  var signM = MS('#ffffff', 0.5, 0, 'g', 0, '#ffcf8e', level >= 4 ? 0.55 : 0.12); /* 红匾：保留原 UV，map+emissiveMap */
  var lampM = level >= 3 ? MS('#ffe6b0', 0.4, 0, '', 0, '#ffd9a0', 0.7) : null;
  function lan(x, y, z, s, hl) { s = s || 1; if (hl) Y(A.wire, 0.004, 0.004, 0.07 * s, 4, x, y + 0.075 * s, z); Y(A.gold, 0.013 * s, 0.013 * s, 0.022 * s, 6, x, y + 0.04 * s, z); Y(lant, 0.034 * s, 0.042 * s, 0.06 * s, 6, x, y, z); Y(A.gold, 0.007 * s, 0.005 * s, 0.03 * s, 4, x, y - 0.045 * s, z); }
  /* 地面：石板街 + 红砂石主街 */
  B(A.stone, 2.6, 0.06, 1.76, 0, 0.03, 0); B(A.lane, 2.6, 0.064, 0.42, 0, 0.032, 0.09);
  /* 锦里大牌坊：木柱石础 + 红匾 + 卷檐，lv2 金顶 lv3+ 双层 */
  B(A.stone2, 0.2, 0.1, 0.2, -1.13, 0.11, 0.58); B(A.stone2, 0.2, 0.1, 0.2, -0.55, 0.11, 0.58); B(A.wood, 0.13, 0.78, 0.13, -1.13, 0.55, 0.58); B(A.wood, 0.13, 0.78, 0.13, -0.55, 0.55, 0.58);
  B(A.wood, 0.74, 0.06, 0.15, -0.84, 0.82, 0.58); B(A.wood, 0.62, 0.05, 0.13, -0.84, 0.9, 0.58);
  B(signM, 0.3, 0.15, 0.03, -0.84, 0.7, 0.67);
  EAVE(A.roof, 0.88, 0.16, 0.028, 0.065, 0.7, -0.84, 0.94, 0.58);
  lan(-1.09, 0.8, 0.86, 1, 1); lan(-0.59, 0.8, 0.86, 1, 1);
  if (level >= 2) { lan(-0.84, 0.8, 0.86, 0.9, 1); Y(A.gold, 0.016, 0.026, 0.06, 6, -0.84, 1.16, 0.58); }
  if (level >= 3) {
    B(A.wood, 0.045, 0.12, 0.045, -1.0, 1.12, 0.48); B(A.wood, 0.045, 0.12, 0.045, -0.68, 1.12, 0.48); B(A.wood, 0.045, 0.12, 0.045, -1.0, 1.12, 0.68); B(A.wood, 0.045, 0.12, 0.045, -0.68, 1.12, 0.68);
    EAVE(A.roof, 0.58, 0.13, 0.022, 0.055, 0.5, -0.84, 1.18, 0.58);
    Y(A.gold, 0.018, 0.022, level >= 4 ? 0.16 : 0.09, 6, -0.84, 1.332 + (level >= 4 ? 0.08 : 0.045), 0.58);
  }
  /* 后街白墙木构铺面 ×2 */
  B(A.plast, 1.0, 0.44, 0.62, -0.72, 0.28, -0.53);
  B(A.wood, 1.0, 0.05, 0.02, -0.72, 0.465, -0.213); EAVE(A.roof, 0.76, 0.14, 0.026, 0.05, 1.04, -0.72, 0.5, -0.53);
  B(A.plast, 0.84, 0.5, 0.62, 0.29, 0.31, -0.53);
  B(A.wood, 0.84, 0.05, 0.02, 0.29, 0.525, -0.213); EAVE(A.roof, 0.76, 0.15, 0.026, 0.05, 0.86, 0.29, 0.56, -0.53);
  var gx = [-1.0, -0.45, 0.05, 0.5], i;
  for (i = 0; i < 4; i++) B(i === 2 || level >= 3 ? glow : A.win, 0.13, 0.16, 0.02, gx[i], 0.3, -0.213);
  /* 武侯戏台：石础台 + 木柱 + 卷檐（lv3+ 红围幔，lv4 台口灯笼） */
  B(A.stone2, 0.52, 0.1, 0.5, 1.02, 0.11, -0.53); B(A.wood, 0.52, 0.06, 0.42, 1.02, 0.19, -0.53);
  B(A.wood, 0.045, 0.32, 0.045, 0.83, 0.38, -0.68); B(A.wood, 0.045, 0.32, 0.045, 1.21, 0.38, -0.68);
  B(A.wood, 0.045, 0.32, 0.045, 0.83, 0.38, -0.38); B(A.wood, 0.045, 0.32, 0.045, 1.21, 0.38, -0.38);
  EAVE(A.roof, 0.56, 0.12, 0.024, 0.05, 0.56, 1.02, 0.54, -0.53);
  if (level >= 3) B(A.flagR, 0.46, 0.06, 0.015, 1.02, 0.5, -0.305);
  if (level >= 4) { lan(0.83, 0.46, -0.3, 0.8); lan(1.21, 0.46, -0.3, 0.8); }
  /* 前排柱廊铺面（面向 +Z）+ 二层角楼 */
  B(A.plast, 0.68, 0.4, 0.46, -0.13, 0.26, 0.63); EAVE(A.roof, 0.58, 0.11, 0.024, 0.04, 0.76, -0.13, 0.46, 0.63);
  B(A.plast, 0.68, 0.4, 0.46, 0.6, 0.26, 0.63); EAVE(A.roof, 0.58, 0.11, 0.024, 0.04, 0.76, 0.6, 0.46, 0.63);
  B(A.plast, 0.28, 0.56, 0.46, 1.13, 0.34, 0.63); EAVE(A.roof, 0.6, 0.13, 0.026, 0.05, 0.32, 1.13, 0.62, 0.63);
  var px = [-0.44, 0.18, 0.29, 0.91];
  for (i = 0; i < 4; i++) B(A.wood, 0.05, 0.4, 0.05, px[i], 0.26, 0.84);
  B(A.wood, 0.74, 0.05, 0.06, -0.13, 0.485, 0.84); B(A.wood, 0.74, 0.05, 0.06, 0.6, 0.485, 0.84);
  if (level === 1) {
    B(A.wood, 0.5, 0.3, 0.02, -0.13, 0.21, 0.865); B(A.wood, 0.5, 0.3, 0.02, 0.6, 0.21, 0.865);
  } else {
    B(glow, 0.52, 0.28, 0.02, -0.13, 0.2, 0.865); B(glow, 0.52, 0.28, 0.02, 0.6, 0.2, 0.865);
    B(A.wood, 0.52, 0.07, 0.05, -0.13, 0.105, 0.88); B(A.wood, 0.52, 0.07, 0.05, 0.6, 0.105, 0.88);
  }
  B(level >= 3 ? glow : A.win, 0.16, 0.18, 0.02, 1.13, 0.5, 0.865);
  if (level >= 3) { /* 酒旗 */
    Y(A.wood, 0.007, 0.007, 0.26, 5, -0.44, 0.63, 0.84); TRI(A.flagR, 0.14, 0.08, 0.012, -0.37, 0.74, 0.84);
    Y(A.wood, 0.007, 0.007, 0.26, 5, 0.91, 0.63, 0.84); TRI(A.gold, 0.14, 0.08, 0.012, 0.98, 0.74, 0.84);
  }
  /* 灯笼阵：lv1 坊灯 → lv2 跨街串灯 → lv3 双排+街灯 → lv4 满街点亮+门灯+花箱 */
  if (level >= 2) {
    B(A.wire, 1.5, 0.006, 0.006, 0.35, 0.72, 0.09); lan(-0.1, 0.655, 0.09); lan(0.35, 0.655, 0.09); lan(0.8, 0.655, 0.09);
    if (level >= 3) {
      B(A.wire, 1.2, 0.006, 0.006, 0.42, 0.72, -0.04); lan(0.0, 0.655, -0.04); lan(0.42, 0.655, -0.04); lan(0.84, 0.655, -0.04);
      var lx = [-0.3, 0.9];
      for (i = 0; i < 2; i++) { Y(A.steel, 0.01, 0.013, 0.5, 6, lx[i], 0.31, 0.36); B(A.steel, 0.12, 0.014, 0.014, lx[i] + 0.05, 0.555, 0.36); B(lampM, 0.07, 0.02, 0.045, lx[i] + 0.1, 0.545, 0.36); }
    }
    if (level >= 4) {
      B(A.wire, 1.1, 0.006, 0.006, 0.45, 0.72, 0.24); lan(0.05, 0.655, 0.24); lan(0.45, 0.655, 0.24); lan(0.85, 0.655, 0.24);
      lan(-0.44, 0.4, 0.9, 0.85, 1); lan(0.29, 0.4, 0.9, 0.85, 1);
      B(A.stone2, 0.18, 0.09, 0.13, 0.16, 0.105, 0.36); O(A.leaf2, 0.06, 0.16, 0.2, 0.36);
      B(A.stone2, 0.18, 0.09, 0.13, -0.6, 0.105, 0.36); O(A.leaf2, 0.06, -0.6, 0.2, 0.36);
    }
  }
  /* 屋面加建：lv3 白色凉亭 → lv4 玻璃茶座+钢架 */
  if (level >= 3) { B(A.white, 0.36, 0.18, 0.32, -0.72, 0.75, -0.53); B(A.roof, 0.42, 0.02, 0.38, -0.72, 0.85, -0.53); }
  if (level >= 4) { B(A.sky, 0.36, 0.16, 0.3, 0.29, 0.82, -0.53); B(A.steel, 0.4, 0.015, 0.34, 0.29, 0.91, -0.53); Y(A.steel, 0.006, 0.006, 0.12, 5, 0.4, 0.975, -0.6); }
  /* 古街乔木：逐年代增多长高（冠幅 0.16→0.26） */
  var TP = [[[-1.06, -0.6], [0.4, -0.58], [1.1, 0.08]], [[-1.06, -0.6], [0.4, -0.58], [1.08, 0.12], [-0.95, 0.1]],
    [[-1.06, -0.6], [0.38, -0.56], [1.04, 0.16], [-0.95, 0.1], [0.95, 0.42]], [[-1.04, -0.58], [0.36, -0.54], [1.0, 0.18], [-0.92, 0.12], [0.92, 0.44], [0.05, -0.5], [-0.5, -0.62], [0.62, -0.6]]][level - 1];
  var cr = [0.16, 0.19, 0.22, 0.26][level - 1];
  for (i = 0; i < TP.length; i++) {
    Y(A.trunk, 0.024, 0.034, 0.5, 6, TP[i][0], 0.31, TP[i][1]);
    O(A.leaf, cr, TP[i][0], 0.62 + cr * 0.55, TP[i][1]);
    O(A.leaf2, cr * 0.62, TP[i][0] + cr * 0.5, 0.68 + cr * 0.5, TP[i][1] + cr * 0.3);
  }
  flush(g);
  g.userData.anim = [function (t) { EI(glow, (level >= 3 ? 0.5 : 0.1) + 0.14 * (0.5 + 0.5 * Math.sin(t * 1.4))); }];
  if (level >= 2) g.userData.anim.push(function (t) {
    var s = 0.5 + 0.5 * Math.sin(t * 1.8);
    EI(lant, (level >= 4 ? 0.6 : 0.24) + 0.18 * s); EI(signM, (level >= 4 ? 0.5 : 0.1) + 0.12 * s);
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[18] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
