/* 大富翁·现代写实棋盘（台）格 38「士林夜市」—— 发光摊位 rows + 士林夜市拱门招牌 + 铁皮棚顶，四年代演进 · v2 材质精修
 * v2 材质工艺（对标 specials3d/tile29_water.js 与 prop_9.js overlay 语义）：顶点色承载主色调、128px 多层 Canvas 承载细节
 *   （基色+噪点+分缝+高光+风化）、材质 color=白；boxUV 按世界尺寸烘焙（三角面主法线轴投影 / ws 米）；材质分区：钢拱棚
 *   rough0.55/metal0.5、涂装铁皮 rough0.8/metal0.15、玻璃幕墙 rough0.15/metal0.75、钢柱 metal0.6；摊位灯箱/招牌/LED 用 emissiveMap。
 *   几何坐标与 v1 逐字一致（剪影/构图零改动）；桶合并后每级 mesh 9-13（v1 17-19，增量为负）。
 * 契约：window.Props3DModern[38](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z；每级 mesh ≤55；
 *   Canvas ≤256px；零 Math.random（LCG）；动画 ≤2 项（摊位灯箱呼吸 + 招牌/灯串/LED 脉动，240 帧无 NaN）。
 * 年代特征（refs/modern/prop_38.png 四象限）：lv1 1990s 铁皮矮铺+杂乱屋面+简朴红拱招牌+稀疏摊位；lv2 2000s +大跨椭圆钢拱棚
 *   +整齐彩篷摊位阵列+场中灯柱灯串；lv3 2010s +曲面金属大厅+玻璃山墙+钢肋；lv4 2020s +玻璃幕墙商厦+钢肋玻璃穹顶+LED 大屏+天线。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_38] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TXC = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function RG(s) { s = (s >>> 0) || 383; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function mkTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
function TX(id, seed, draw) { if (_TXC[id]) return _TXC[id]; var c = cv(128, 128); draw(c.getContext('2d'), 128, 128, RG(seed)); return (_TXC[id] = mkTex(c)); }
function F(g, s, x, y, w, h) { g.fillStyle = s; g.fillRect(x, y, w, h); }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? 'rgba(255,255,255,' + a + ')' : 'rgba(22,20,16,' + a + ')', R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
function DOT(g, s, x, y, r) { g.fillStyle = s; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); }
/* ---- 多层 Canvas（近白基色 × 顶点色 = 最终色；模块级缓存，惰性创建） ---- */
var TEX = {
  conc: function () { return TX('conc', 3801, function (g, w, h, R) { F(g, '#efece4', 0, 0, w, h); var i;             /* 混凝土：分格缝+油渍+噪点 */
    for (i = 0; i < w; i += 64) { F(g, 'rgba(90,86,76,0.45)', i, 0, 2, h); F(g, 'rgba(90,86,76,0.45)', 0, i, w, 2); }
    for (i = 0; i < 7; i++) F(g, 'rgba(70,60,48,' + (0.05 + R() * 0.08).toFixed(2) + ')', R() * w, R() * h, 8 + R() * 22, 5 + R() * 12); SPK(g, w, h, 110, 0.06, R); }); },
  plas: function () { return TX('plas', 3802, function (g, w, h, R) { F(g, '#f5f1e8', 0, 0, w, h); var i, x0;         /* 灰泥墙：雨渍+发丝裂纹+底部泛潮+噪点 */
    for (i = 0; i < 9; i++) F(g, 'rgba(120,110,88,' + (0.05 + R() * 0.07).toFixed(2) + ')', R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80);
    for (i = 0; i < 4; i++) { x0 = R() * w; g.strokeStyle = 'rgba(110,100,80,0.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); }
    F(g, 'rgba(90,84,66,0.1)', 0, 108, w, 20); SPK(g, w, h, 120, 0.05, R); }); },
  corr: function () { return TX('corr', 3803, function (g, w, h, R) { F(g, '#f2f2f0', 0, 0, w, h); var i;             /* 波纹铁皮：垄沟高光/阴影+板缝+锈斑 */
    for (i = 0; i < w; i += 12) { F(g, 'rgba(255,255,255,0.55)', i + 1, 0, 3, h); F(g, 'rgba(30,32,36,0.42)', i + 6, 0, 4, h); }
    for (i = 0; i < h; i += 64) F(g, 'rgba(30,32,36,0.35)', 0, i, w, 2);
    for (i = 0; i < 18; i++) F(g, 'rgba(120,60,30,' + (0.12 + R() * 0.25).toFixed(2) + ')', R() * w, R() * h, 3 + R() * 9, 2 + R() * 6); SPK(g, w, h, 40, 0.08, R); }); },
  wood: function () { return TX('wood', 3804, function (g, w, h, R) { F(g, '#f3ece0', 0, 0, w, h); var i;             /* 摊位木板：板缝+木纹+节疤 */
    for (i = 0; i < h; i += 21) F(g, 'rgba(70,44,22,0.5)', 0, i, w, 2);
    for (i = 0; i < 40; i++) F(g, 'rgba(90,60,30,' + (0.06 + R() * 0.1).toFixed(2) + ')', R() * w, R() * h, 10 + R() * 40, 1);
    for (i = 0; i < 5; i++) DOT(g, 'rgba(60,36,16,0.35)', R() * w, R() * h, 2 + R() * 2); }); },
  awn: function () { return TX('awn', 3805, function (g, w, h, R) { F(g, '#f4f4f2', 0, 0, w, h); var i;              /* 篷布：经纬织纹+折痕高光/阴影+下摆污渍 */
    for (i = 0; i < w; i += 4) { F(g, 'rgba(40,40,40,0.08)', i, 0, 1, h); F(g, 'rgba(40,40,40,0.08)', 0, i, w, 1); }
    for (i = 0; i < w; i += 32) { F(g, 'rgba(255,255,255,0.5)', i + 2, 0, 4, h); F(g, 'rgba(30,30,30,0.16)', i + 26, 0, 3, h); } F(g, 'rgba(80,70,50,0.12)', 0, 112, w, 16); SPK(g, w, h, 50, 0.05, R); }); },
  lbox: function () { return TX('lbox', 3806, function (g, w, h, R) { F(g, '#fff1d2', 0, 0, w, h); var i, j, x, L;    /* 摊位灯箱：菜单字行+顶部灯泡串（map+emissiveMap） */
    for (i = 14; i < h; i += 24) for (j = 0, x = 6; j < 5 && x < w - 8; j++) { L = 8 + R() * 18; F(g, 'rgba(70,32,10,0.6)', x, i, L, 8); x += L + 6; }
    for (i = 0; i < 8; i++) DOT(g, 'rgba(255,255,255,0.9)', 8 + i * 16, 5, 3); F(g, 'rgba(255,200,120,0.25)', 0, 0, w, h); }); },
  leaf: function () { return TX('leaf', 3807, function (g, w, h, R) { F(g, '#f0f6e6', 0, 0, w, h); var i;             /* 树冠：明暗叶斑 */
    for (i = 0; i < 34; i++) DOT(g, i % 2 ? 'rgba(34,66,24,0.28)' : 'rgba(255,255,240,0.3)', R() * w, R() * h, 2 + R() * 4); }); },
  led: function () { return TX('led', 3808, function (g, w, h, R) { F(g, '#dcefff', 0, 0, w, h); var i;               /* LED 大屏：彩色内容块+像素网格（emissiveMap） */
    for (i = 0; i < 6; i++) F(g, ['#5ec8ff', '#ff6fd8', '#ffffff', '#ffd54a'][i % 4], R() * w, R() * h, 16 + R() * 40, 10 + R() * 30);
    for (i = 0; i < w; i += 8) { F(g, 'rgba(0,10,30,0.45)', i, 0, 2, h); F(g, 'rgba(0,10,30,0.45)', 0, i, w, 2); } }); }
};
/* ---- 桶合并构建器：桶 = 材质参数(rg|mt|em|ei|tex|ws)，顶点色承载主色调；flush 烘焙世界尺寸 boxUV ---- */
var BK;
function BKT(rg, mt, em, ei, tex, ws) { var k = rg + '|' + (mt || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (tex || '') + '|' + (ws || 1); return BK[k] || (BK[k] = { rg: rg, mt: mt || 0, em: em, ei: ei, tex: tex, ws: ws || 1, gs: [], cs: [] }); }
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) { if (x || y || z || rx || ry || rz || sx || sy || sz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function put(b, g, h) { b.gs.push(g); b.cs.push(V(h)); }
function B(b, h, w, ht, d, x, y, z, rx, ry, rz) { put(b, xf(new THREE.BoxGeometry(w, ht, d), x, y, z, rx, ry, rz), h); }
function Y(b, h, r1, r2, ht, s, x, y, z, rx, ry, rz) { put(b, xf(new THREE.CylinderGeometry(r1, r2, ht, s), x, y, z, rx, ry, rz), h); }
function O(b, h, r, x, y, z) { put(b, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z), h); }
function A2(b, h, geo, x, y, z, rx, ry, rz, sx, sy, sz) { put(b, xf(geo, x, y, z, rx, ry, rz, sx, sy, sz), h); }
function flush(g, hot) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i, j, q, r, u2;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.count; }
    if (!P) continue;
    var pa = new Float32Array(P * 3), na = new Float32Array(P * 3), ca = new Float32Array(P * 3), ua = new Float32Array(P * 2), o = 0, iv = 1 / b.ws;
    for (i = 0; i < gs.length; i++) {
      var cnt = gs[i].attributes.position.count, c = b.cs[i]; pa.set(gs[i].attributes.position.array, o * 3); na.set(gs[i].attributes.normal.array, o * 3);
      for (j = 0; j < cnt; j++) { ca[(o + j) * 3] = c[0]; ca[(o + j) * 3 + 1] = c[1]; ca[(o + j) * 3 + 2] = c[2]; } o += cnt;
    }
    for (i = 0; i < P; i += 3) {                                   /* 三角面法线主轴 → 世界坐标投影 UV（每 ws 米一重复） */
      q = i * 3; var e1x = pa[q + 3] - pa[q], e1y = pa[q + 4] - pa[q + 1], e1z = pa[q + 5] - pa[q + 2], e2x = pa[q + 6] - pa[q], e2y = pa[q + 7] - pa[q + 1], e2z = pa[q + 8] - pa[q + 2];
      var ax = Math.abs(e1y * e2z - e1z * e2y), ay = Math.abs(e1z * e2x - e1x * e2z), az = Math.abs(e1x * e2y - e1y * e2x);
      for (j = 0; j < 3; j++) { r = q + j * 3; u2 = (i + j) * 2; if (ay >= ax && ay >= az) { ua[u2] = pa[r] * iv; ua[u2 + 1] = pa[r + 2] * iv; } else if (ax >= az) { ua[u2] = pa[r + 2] * iv; ua[u2 + 1] = pa[r + 1] * iv; } else { ua[u2] = pa[r] * iv; ua[u2 + 1] = pa[r + 1] * iv; } }
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true });
    if (b.tex) m.map = TEX[b.tex]();
    if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tex) m.emissiveMap = m.map; hot[b.em] = m; }
    var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function signMesh(txt, w, h, d, bg, fg, ei) {                     /* 拱门招牌：Canvas 256×64 → map + emissiveMap（独立 mesh，原生盒 UV） */
  var c = cv(256, 64), g = c.getContext('2d'); F(g, bg, 0, 0, 256, 64); g.strokeStyle = '#ffb14e'; g.lineWidth = 3; g.strokeRect(4, 4, 248, 56);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34);
  var t = mkTex(c), m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: C(fg), emissiveMap: t, emissiveIntensity: ei }); m.userData.previewColor = bg;
  var ms = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); ms.castShadow = ms.receiveShadow = true; return ms;
}
/* ---- 士林夜市四年代（坐标与 v1 一致） ---- */
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_38_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 38; g.userData.level = level;
  var hot = g.userData.hotM = {}; BK = {};
  var conc = BKT(0.94, 0, '', 0, 'conc', 1.2), plas = BKT(0.9, 0, '', 0, 'plas', 1.6), wood = BKT(0.85, 0, '', 0, 'wood', 0.6), post = BKT(0.5, 0.6), steel = BKT(0.45, 0.65),
    corrP = BKT(0.8, 0.15, '', 0, 'corr', 0.5), corrS = BKT(0.55, 0.5, '', 0, 'corr', 0.5), glass = BKT(0.15, 0.75), leaf = BKT(0.95, 0, '', 0, 'leaf', 0.7), awn = BKT(0.9, 0, '', 0, 'awn', 0.4),
    glow = BKT(0.5, 0, '#ffab52', 0.5, 'lbox', 0.3), lamp = BKT(0.5, 0, '#ffd9a0', 0.8), screen = BKT(0.4, 0, '#9fd4ec', 0.9, 'led', 0.25);
  var PK = '#33363a', ST = '#7d848a', WL = '#9a9183', WH = '#e4ded0', GL = '#2e373f', GW = '#5a4632', LP = '#6b5a40', VC = level >= 3 ? '#6a7079' : '#616770', AW = ['#c4432f', '#f0c832', '#3d6a94', '#a4281f'];
  /* 地面：前广场 + 市场通道 + 后场 */
  B(conc, '#9d9484', 2.6, 0.04, 0.9, 0, 0.02, 0.85); B(conc, '#5e5850', 2.6, 0.04, 0.9, 0, 0.02, -0.05); B(conc, '#5e5850', 2.6, 0.04, 0.8, 0, 0.02, -0.9);
  /* 士林夜市拱门：双钢柱 + 半环红拱 + 发光招牌 */
  var gh = [0.66, 0.78, 0.8, 0.8][level - 1], ar = [0.34, 0.45, 0.45, 0.5][level - 1];
  Y(post, PK, 0.05, 0.06, gh, 8, -0.55, gh / 2 + 0.04, 1.06); Y(post, PK, 0.05, 0.06, gh, 8, 0.55, gh / 2 + 0.04, 1.06);
  A2(post, PK, new THREE.TorusGeometry(ar, 0.03, 6, 16, PI), 0, gh + 0.075, 1.06);
  var sg = signMesh('士林夜市', 1.06, 0.2, 0.05, '#7e1a12', '#ff7434', [0.2, 0.5, 0.55, 0.85][level - 1]); sg.position.set(0, gh - 0.1, 1.09); g.add(sg); hot.sign = sg.material;
  B(post, PK, 1.14, 0.025, 0.1, 0, gh + 0.045, 1.075);
  /* 摊位 rows：木台身 + 四色篷布 + 双前柱 + 摊口灯箱（夜市灵魂） */
  function stall(x, z, k) {
    B(wood, '#5c3e27', 0.3, 0.15, 0.22, x, 0.115, z); B(awn, AW[k % 4], 0.36, 0.022, 0.3, x, 0.285, z);
    B(post, PK, 0.016, 0.13, 0.016, x - 0.16, 0.21, z + 0.13); B(post, PK, 0.016, 0.13, 0.016, x + 0.16, 0.21, z + 0.13); B(glow, GW, 0.26, 0.075, 0.012, x, 0.125, z + 0.113);
  }
  var fx = [-1.12, -0.78, -0.44, 0.44, 0.78, 1.12], mx = [-0.95, -0.61, 0.61, 0.95], i, k = level;
  for (i = 0; i < 6; i++) stall(fx[i], 0.56, k++);
  if (level >= 2) for (i = 0; i < 4; i++) stall(mx[i], 0.04, k++);
  if (level >= 3) for (i = 0; i < 6; i++) stall(fx[i], -0.34, k++);
  /* 后场市场主体：lv1 铁皮矮铺 → lv2 椭圆钢拱棚 → lv3 曲面大厅 → lv4 玻璃商厦+穹顶 */
  if (level === 1) {
    B(plas, '#625b51', 2.5, 0.4, 0.78, 0, 0.24, -0.9);
    B(corrP, '#4f5d4a', 0.86, 0.02, 0.5, -0.83, 0.465, -0.9, 0, 0, 0.09); B(corrP, '#6d4a35', 0.86, 0.02, 0.5, 0.03, 0.465, -0.9, 0, 0, -0.07); B(corrP, '#4f5d4a', 0.8, 0.02, 0.48, 0.88, 0.46, -0.9, 0, 0, 0.11);
    B(plas, WL, 0.68, 0.5, 0.62, -0.94, 0.71, -0.98); B(corrP, '#6d4a35', 0.7, 0.02, 0.4, -0.94, 0.985, -1.09, 0, 0, 0.12); B(corrP, '#6d4a35', 0.7, 0.02, 0.4, -0.94, 0.985, -0.87, 0, 0, -0.12);
    Y(post, PK, 0.05, 0.05, 0.12, 8, 0.98, 0.52, -1.05); B(plas, '#625b51', 0.5, 0.16, 0.4, 0.95, 0.54, -0.75);
    for (i = 0; i < 5; i++) B(glow, GW, 0.2, 0.13, 0.012, -1.05 + i * 0.45, 0.24, -0.505);
  } else {
    B(plas, WL, 2.5, level >= 3 ? 0.46 : 0.42, 0.8, 0, level >= 3 ? 0.27 : 0.25, -0.9); B(glow, GW, 2.3, 0.3, 0.02, 0, 0.3, -0.485);
    if (level === 2) {
      A2(corrS, VC, new THREE.CylinderGeometry(0.7, 0.7, 2.44, 16, 1, true, 0, PI), 0, 0.46, -0.88, 0, 0, PI / 2, 1, 1, 0.5);
      A2(plas, WL, new THREE.CylinderGeometry(0.69, 0.69, 0.05, 16, 1, false, 0, PI), -1.21, 0.46, -0.88, 0, 0, PI / 2, 1, 1, 0.5);
      A2(plas, WL, new THREE.CylinderGeometry(0.69, 0.69, 0.05, 16, 1, false, 0, PI), 1.21, 0.46, -0.88, 0, 0, PI / 2, 1, 1, 0.5);
      B(steel, ST, 1.9, 0.05, 0.04, 0, 0.47, -0.47); B(steel, ST, 0.05, 0.42, 0.04, -0.95, 0.25, -0.47); B(steel, ST, 0.05, 0.42, 0.04, 0.95, 0.25, -0.47);
    } else if (level === 3) {
      A2(corrS, VC, new THREE.CylinderGeometry(0.78, 0.78, 2.44, 16, 1, true, 0, PI), 0, 0.5, -0.88, 0, 0, PI / 2, 1, 1, 0.5);
      A2(steel, ST, new THREE.TorusGeometry(0.76, 0.014, 4, 10, PI), -0.9, 0.5, -0.88, 0, PI / 2, 0, 0.5, 1, 1); A2(steel, ST, new THREE.TorusGeometry(0.76, 0.014, 4, 10, PI), 0.9, 0.5, -0.88, 0, PI / 2, 0, 0.5, 1, 1);
      B(glass, GL, 2.44, 0.28, 0.03, 0, 0.6, -0.515); B(steel, ST, 2.3, 0.02, 0.1, 0, 1.285, -0.88); B(plas, WH, 0.4, 0.2, 0.3, 0.85, 1.36, -1.12); B(glass, GL, 0.3, 0.12, 0.02, 0.85, 1.38, -0.965);
    } else {
      A2(glass, GL, new THREE.CylinderGeometry(0.68, 0.68, 1.5, 14, 1, true, 0, PI), -0.55, 0.5, -0.88, 0, 0, PI / 2, 1, 1, 0.5);
      for (i = 0; i < 3; i++) A2(steel, ST, new THREE.TorusGeometry(0.66, 0.014, 4, 10, PI), -1.15 + i * 0.6, 0.5, -0.88, 0, PI / 2, 0, 0.5, 1, 1);
      B(glass, GL, 0.95, 1.42, 0.78, 0.72, 0.75, -0.9); for (i = 0; i < 3; i++) B(plas, WH, 0.99, 0.03, 0.8, 0.72, 0.52 + i * 0.36, -0.9); B(plas, WH, 0.99, 0.06, 0.8, 0.72, 1.48, -0.9);
      B(screen, '#20323c', 0.04, 0.5, 0.62, 1.2, 0.98, -0.9); B(steel, ST, 0.3, 0.1, 0.22, 0.55, 1.56, -1.0); B(plas, WH, 0.24, 0.08, 0.2, 0.9, 1.55, -0.75); Y(post, PK, 0.006, 0.006, 0.32, 5, 0.85, 1.62, -0.85);
    }
  }
  /* 场中灯柱 + 灯串（lv2+） */
  if (level >= 2) {
    Y(post, PK, 0.014, 0.018, 0.72, 6, -0.66, 0.4, 0.08); Y(post, PK, 0.014, 0.018, 0.72, 6, 0.66, 0.4, 0.08);
    for (var s2 = -1; s2 <= 1; s2 += 2) for (i = 0; i < 5; i++) B(lamp, LP, 0.026, 0.026, 0.026, s2 * 0.6, 0.86 - i * 0.04 + 0.03 * Math.sin(i * 0.8), 0.98 - i * 0.22);
    for (i = 0; i < 13; i++) B(lamp, LP, 0.022, 0.022, 0.022, -0.96 + i * 0.16, 0.315, 0.72);
  }
  /* 广场行道树 */
  var tp = [[-1.15, 1.12], [1.15, 1.12], [1.12, 0.35], [-1.12, 0.35]], tn = [2, 2, 3, 3][level - 1], cr = [0.085, 0.095, 0.105, 0.115][level - 1];
  for (i = 0; i < tn; i++) { Y(wood, '#57452f', 0.02, 0.03, 0.16, 6, tp[i][0], 0.2, tp[i][1]); O(leaf, '#3f5a33', cr, tp[i][0], 0.34 + cr * 0.5, tp[i][1]); O(leaf, '#527046', cr * 0.6, tp[i][0] + cr * 0.5, 0.4, tp[i][1] - cr * 0.3); }
  flush(g, hot);
  g.userData.anim = [function (t) { var m = hot['#ffab52']; if (m) m.emissiveIntensity = 0.38 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.6)); }];
  if (level >= 2) g.userData.anim.push(function (t) {
    var s = 0.5 + 0.5 * Math.sin(t * 1.1), m; hot.sign.emissiveIntensity = (level >= 4 ? 0.6 : 0.28) + 0.22 * s;
    if ((m = hot['#ffd9a0'])) m.emissiveIntensity = 0.6 + 0.25 * s; if ((m = hot['#9fd4ec'])) m.emissiveIntensity = 0.7 + 0.35 * s;
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[38] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
