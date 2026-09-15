/* 大富翁·现代写实棋盘（台）格 39「垦丁大街」—— 海滨度假街：棕榈树 + 民宿霓虹 + 海滩气息，四年代演进 · v2 材质精修
 * v2 材质工艺（对标 specials3d/tile29_water.js 与 prop_9.js overlay 语义）：顶点色承载主色调、128px 多层 Canvas 承载细节
 *   （基色+噪点+分缝+高光+风化）、材质 color=白；boxUV 按世界尺寸烘焙（三角面主法线轴投影 / ws 米）；材质分区：海面 rough0.12/metal0.3
 *   （波纹贴图漂移）、玻璃幕墙/咖啡亭 rough0.15/metal0.75、pergola 深色金属 metal0.5、棕榈树皮环纹、红瓦垄纹；橱窗灯箱/霓虹/招牌用 emissiveMap。
 *   几何坐标与 v1 逐字一致（剪影/构图零改动）；桶合并后每级 mesh 11-15（v1 17-23，增量为负）。
 * 契约：window.Props3DModern[39](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z；每级 mesh ≤55；
 *   Canvas ≤256px；零 Math.random（LCG）；动画 ≤2 项（橱窗呼吸+海面漂移 / 霓虹+招牌脉动，240 帧无 NaN）。
 * 年代特征（refs/modern/prop_39.png 四象限）：lv1 1990s 两三层素面小楼+红瓦披屋+稀疏棕榈+天然沙滩；lv2 2000s +四五层阳台水塔+彩篷
 *   +行道棕榈加密+遮阳伞；lv3 2010s +玻璃转角咖啡亭+艳海+泡沫线躺椅+霓虹；lv4 2020s +精品白色旅店幕墙+屋顶 pergola 酒吧+墾丁大街招牌。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_39] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TXC = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function RG(s) { s = (s >>> 0) || 393; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function mkTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
function TX(id, seed, draw) { if (_TXC[id]) return _TXC[id]; var c = cv(128, 128); draw(c.getContext('2d'), 128, 128, RG(seed)); return (_TXC[id] = mkTex(c)); }
function F(g, s, x, y, w, h) { g.fillStyle = s; g.fillRect(x, y, w, h); }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? 'rgba(255,255,255,' + a + ')' : 'rgba(22,20,16,' + a + ')', R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
function DOT(g, s, x, y, r) { g.fillStyle = s; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); }
function WAVE(g, s, y0, amp, ph) { var j; g.strokeStyle = s; g.lineWidth = 2; g.beginPath(); for (j = 0; j <= 8; j++) { var x = j * 16, y = y0 + amp * Math.sin(j * 1.3 + ph); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
/* ---- 多层 Canvas（近白基色 × 顶点色 = 最终色；模块级缓存，惰性创建） ---- */
var TEX = {
  asph: function () { return TX('asph', 3901, function (g, w, h, R) { F(g, '#f0f0ee', 0, 0, w, h); var i;             /* 沥青：粗粒噪点+修补斑+裂纹 */
    SPK(g, w, h, 170, 0.07, R); for (i = 0; i < 4; i++) F(g, 'rgba(40,40,44,' + (0.08 + R() * 0.1).toFixed(2) + ')', R() * w, R() * h, 10 + R() * 30, 6 + R() * 14);
    for (i = 0; i < 3; i++) { var x0 = R() * w; g.strokeStyle = 'rgba(30,30,32,0.3)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, R() * h); g.lineTo(x0 + (R() - 0.5) * 40, R() * h); g.stroke(); } }); },
  pave: function () { return TX('pave', 3902, function (g, w, h, R) { F(g, '#f3f1ea', 0, 0, w, h); var x, y;          /* 人行道砖：错缝分块+块面色差+噪点 */
    for (y = 0; y < h; y += 32) { F(g, 'rgba(96,90,74,0.45)', 0, y, w, 2); var o = (y / 32) % 2 ? 16 : 0; for (x = o; x < w; x += 32) { F(g, 'rgba(96,90,74,0.4)', x, y, 2, 32); F(g, R() > 0.5 ? 'rgba(255,255,250,0.12)' : 'rgba(70,64,52,0.1)', x + 2, y + 2, 28, 28); } }
    SPK(g, w, h, 80, 0.06, R); }); },
  sand: function () { return TX('sand', 3903, function (g, w, h, R) { F(g, '#f8f3e6', 0, 0, w, h); var i;             /* 沙滩：细沙噪点+风纹波线+贝壳亮点 */
    SPK(g, w, h, 200, 0.05, R); for (i = 0; i < 5; i++) WAVE(g, 'rgba(120,100,60,0.14)', 10 + i * 26, 5, i); for (i = 0; i < 12; i++) DOT(g, 'rgba(255,255,255,0.7)', R() * w, R() * h, 1); }); },
  sea: function () { return TX('sea', 3904, function (g, w, h, R) { F(g, '#eef8f8', 0, 0, w, h); var i;               /* 海面：波纹高光+暗斑（rough0.12 + 漂移动画） */
    for (i = 0; i < 5; i++) WAVE(g, 'rgba(255,255,255,0.55)', i * 26 + 8, 6, i); for (i = 0; i < 6; i++) F(g, 'rgba(12,50,80,0.14)', R() * w, R() * h, 10 + R() * 16, 4 + R() * 8); }); },
  plas: function () { return TX('plas', 3905, function (g, w, h, R) { F(g, '#f7f5ef', 0, 0, w, h); var i, x0;         /* 民宿灰泥墙：雨渍+发丝裂纹+底部泛潮+噪点 */
    for (i = 0; i < 8; i++) F(g, 'rgba(120,110,88,' + (0.04 + R() * 0.06).toFixed(2) + ')', R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80);
    for (i = 0; i < 3; i++) { x0 = R() * w; g.strokeStyle = 'rgba(110,100,80,0.16)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); }
    F(g, 'rgba(90,84,66,0.08)', 0, 110, w, 18); SPK(g, w, h, 100, 0.04, R); }); },
  tile: function () { return TX('tile', 3906, function (g, w, h, R) { F(g, '#f4ece6', 0, 0, w, h); var x, y;          /* 红瓦：瓦行阴影+错位竖缝+瓦头高光 */
    for (y = 0; y < h; y += 16) { F(g, 'rgba(60,20,10,0.4)', 0, y + 12, w, 4); F(g, 'rgba(255,240,230,0.5)', 0, y, w, 2); var o = (y / 16) % 2 ? 8 : 0; for (x = o; x < w; x += 16) F(g, 'rgba(60,20,10,0.3)', x, y, 1, 12); } SPK(g, w, h, 30, 0.05, R); }); },
  bark: function () { return TX('bark', 3907, function (g, w, h, R) { F(g, '#f0e6d8', 0, 0, w, h); var y;             /* 棕榈树皮：叶痕环纹+纤维噪点 */
    for (y = 0; y < h; y += 10) { F(g, 'rgba(70,45,20,0.35)', 0, y, w, 3); F(g, 'rgba(255,250,240,0.4)', 0, y + 4, w, 1); } SPK(g, w, h, 80, 0.06, R); }); },
  leaf: function () { return TX('leaf', 3908, function (g, w, h, R) { F(g, '#eef5e4', 0, 0, w, h); var x, i;          /* 棕榈叶：小叶条纹+中肋+明暗斑 */
    for (x = 0; x < w; x += 6) F(g, 'rgba(30,60,20,0.18)', x, 0, 2, h); F(g, 'rgba(90,110,40,0.35)', 0, 62, w, 4); for (i = 0; i < 20; i++) DOT(g, i % 2 ? 'rgba(34,66,24,0.22)' : 'rgba(255,255,240,0.3)', R() * w, R() * h, 2 + R() * 3); }); },
  awn: function () { return TX('awn', 3909, function (g, w, h, R) { F(g, '#f4f4f2', 0, 0, w, h); var i;              /* 篷布/伞面：织纹+折痕高光/阴影+下摆污渍 */
    for (i = 0; i < w; i += 4) { F(g, 'rgba(40,40,40,0.08)', i, 0, 1, h); F(g, 'rgba(40,40,40,0.08)', 0, i, w, 1); }
    for (i = 0; i < w; i += 32) { F(g, 'rgba(255,255,255,0.5)', i + 2, 0, 4, h); F(g, 'rgba(30,30,30,0.16)', i + 26, 0, 3, h); } F(g, 'rgba(80,70,50,0.12)', 0, 112, w, 16); SPK(g, w, h, 50, 0.05, R); }); },
  lbox: function () { return TX('lbox', 3910, function (g, w, h, R) { F(g, '#fff3d8', 0, 0, w, h); var i, j;          /* 橱窗灯箱：货架层板+彩色商品+顶灯串（map+emissiveMap） */
    for (i = 24; i < h; i += 28) { F(g, 'rgba(70,40,15,0.55)', 0, i, w, 3); for (j = 0; j < 7; j++) F(g, ['#e04848', '#3a8ad8', '#ffd040', '#48b060'][(i + j) % 4], 4 + j * 18, i - 14 - R() * 4, 8 + R() * 6, 12 + R() * 4); }
    for (i = 0; i < 8; i++) DOT(g, 'rgba(255,255,255,0.9)', 8 + i * 16, 5, 3); F(g, 'rgba(255,205,130,0.22)', 0, 0, w, h); }); },
  neon: function () { return TX('neon', 3911, function (g, w, h, R) { F(g, '#2a2028', 0, 0, w, h); var i, x;          /* 霓虹招牌：暗底板+发光字段+管头亮点（emissiveMap） */
    for (i = 0, x = 6; i < 6 && x < w - 6; i++) { var L = 8 + R() * 16; F(g, '#ffffff', x, 52, L, 22); DOT(g, '#ffffff', x, 63, 11); DOT(g, '#ffffff', x + L, 63, 11); x += L + 12; } F(g, 'rgba(255,255,255,0.12)', 0, 0, w, h); }); }
};
/* ---- 桶合并构建器：桶 = 材质参数(rg|mt|em|ei|tex|ws)，顶点色承载主色调；flush 烘焙世界尺寸 boxUV ---- */
var BK;
function BKT(rg, mt, em, ei, tex, ws) { var k = rg + '|' + (mt || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (tex || '') + '|' + (ws || 1); return BK[k] || (BK[k] = { rg: rg, mt: mt || 0, em: em, ei: ei, tex: tex, ws: ws || 1, gs: [], cs: [] }); }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(b, g, h) { b.gs.push(g); b.cs.push(V(h)); }
function B(b, h, w, ht, d, x, y, z, rx, ry, rz) { put(b, xf(new THREE.BoxGeometry(w, ht, d), x, y, z, rx, ry, rz), h); }
function Y(b, h, r1, r2, ht, s, x, y, z, rx, ry, rz) { put(b, xf(new THREE.CylinderGeometry(r1, r2, ht, s), x, y, z, rx, ry, rz), h); }
function O(b, h, r, x, y, z) { put(b, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z), h); }
function A2(b, h, geo, x, y, z, rx, ry, rz) { put(b, xf(geo, x, y, z, rx, ry, rz), h); }
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
function signMesh(txt, w, h, d, bg, fg, ei) {                     /* 墾丁大街招牌：Canvas 256×64 → map + emissiveMap（独立 mesh，原生盒 UV） */
  var c = cv(256, 64), g = c.getContext('2d'); F(g, bg, 0, 0, 256, 64); g.strokeStyle = '#ffd7a0'; g.lineWidth = 3; g.strokeRect(4, 4, 248, 56);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34);
  var t = mkTex(c), m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: C(fg), emissiveMap: t, emissiveIntensity: ei }); m.userData.previewColor = bg;
  var ms = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); ms.castShadow = ms.receiveShadow = true; return ms;
}
/* ---- 垦丁大街四年代（坐标与 v1 一致） ---- */
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_39_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 39; g.userData.level = level;
  var hot = g.userData.hotM = {}; BK = {};
  var asph = BKT(0.95, 0, '', 0, 'asph', 1.0), walk = BKT(0.92, 0, '', 0, 'pave', 0.5), sand = BKT(0.95, 0, '', 0, 'sand', 0.8), sea = BKT(0.12, 0.3, '', 0, 'sea', 1.3),
    plas = BKT(0.85, 0, '', 0, 'plas', 1.6), tile = BKT(0.8, 0, '', 0, 'tile', 0.5), glass = BKT(0.15, 0.75), dark = BKT(0.6, 0.5), bark = BKT(0.9, 0, '', 0, 'bark', 0.3),
    leaf = BKT(0.92, 0, '', 0, 'leaf', 0.35), awn = BKT(0.9, 0, '', 0, 'awn', 0.4), glow = BKT(0.5, 0, '#ffc06a', 0.5, 'lbox', 0.3);
  var NE = ['#ffd23e', '#ff5fce', '#3ed2ea'], NB = ['#3c300a', '#3a1430', '#12333c'], neon = [BKT(0.5, 0, NE[0], 0.95, 'neon', 0.3), BKT(0.5, 0, NE[1], 0.9, 'neon', 0.3), BKT(0.5, 0, NE[2], 0.9, 'neon', 0.3)];
  var WH = '#f3f0e2', GL = '#3f4a50', DK = '#46494c', TR = '#8a6f4d', LF = '#6b7f3a', LF2 = '#829440', GW = '#5a4a34', AW = ['#c04a38', '#3d6d99', '#e2b22e', '#c8572e'], seaC = ['#8ec7c4', '#63c1cf', '#3cbdd8', '#27b9dc'][level - 1];
  /* 地面（z -1.1..1.05 狭长街带）：滨海大道（车道虚线 lv2+）+ 人行道 + 民宿区 + 沙滩 + 海（逐年代变艳）+ 泡沫线 lv3+ */
  B(asph, '#4a4c4f', 2.6, 0.04, 0.4, 0, 0.02, 0.85);
  if (level >= 2) for (var lx = -1.19; lx <= 1.19; lx += 0.34) B(asph, '#e8e8e0', 0.16, 0.046, 0.035, lx, 0.043, 0.85);
  B(walk, '#9a9480', 2.6, 0.07, 0.25, 0, 0.035, 0.525); B(walk, '#9a9480', 2.6, 0.04, 1.0, 0, 0.02, -0.1);
  B(sand, '#e6d69a', 2.6, 0.05, 0.45, 0, 0.025, -0.625); B(sea, seaC, 2.6, 0.05, 0.25, 0, 0.025, -0.975);
  if (level >= 3) B(sea, '#eef7f4', 2.6, 0.052, 0.022, 0, 0.026, -0.86);
  /* 商店街：连续骑楼 + 四色遮阳篷 + 橱窗灯箱 + 霓虹招牌 lv3+ + 墾丁大街招牌 lv4 */
  B(plas, '#d9cc9e', 2.5, 0.3, 0.22, 0, 0.19, 0.27);
  var sx = [-1.0, -0.5, 0, 0.5, 1.0], kc = [0, 1, 2, 3, 0], i;
  for (i = 0; i < 5; i++) { B(awn, AW[kc[i]], 0.46, 0.016, 0.2, sx[i], 0.375, 0.38, -0.4, 0, 0); B(awn, AW[kc[i]], 0.46, 0.05, 0.012, sx[i], 0.315, 0.455); B(glow, GW, 0.3, 0.13, 0.012, sx[i], 0.185, 0.385); }
  if (level >= 3) for (i = 0; i < 3; i++) B(neon[i], NB[i], 0.3, 0.07, 0.018, sx[i], 0.45, 0.385);
  if (level >= 4) { var sg = signMesh('墾丁大街', 0.52, 0.17, 0.045, '#3a1e10', '#ffb060', 0.85); sg.position.set(sx[3], 0.445, 0.4); g.add(sg); hot.sign = sg.material; }
  /* 民宿/旅店 ×3：逐年代长高；lv1 红瓦披屋 → lv2 阳台水塔 → lv3 玻璃咖啡亭 → lv4 屋顶 pergola+幕墙 */
  var BH = [[0.6, 0.8, 0.66], [0.92, 1.08, 0.95], [1.12, 1.3, 1.08], [1.32, 1.52, 1.22]][level - 1], bx = [-0.7, 0, 0.7], nf = [1, 2, 3, 3][level - 1];
  for (var b = 0; b < 3; b++) {
    B(plas, WH, 0.62, BH[b], 0.6, bx[b], BH[b] / 2 + 0.04, -0.1);
    if (level === 1 && b === 1) { B(tile, '#b05540', 0.68, 0.02, 0.38, 0, 0.9, -0.28, -0.5, 0, 0); B(tile, '#b05540', 0.68, 0.02, 0.38, 0, 0.9, 0.08, 0.5, 0, 0); Y(tile, '#b05540', 0.02, 0.02, 0.66, 6, 0, 0.975, -0.1, 0, 0, PI / 2); }
    else B(asph, '#7a766c', 0.66, 0.03, 0.64, bx[b], BH[b] + 0.055, -0.1);
    for (var f = 0; f < nf; f++) for (var wx = -0.16; wx <= 0.16; wx += 0.32) B(glass, GL, 0.11, 0.13, 0.012, bx[b] + wx, 0.48 + f * 0.24, 0.205);
    if (level >= 2) {
      for (var f2 = 0; f2 < level - 1; f2++) { B(plas, WH, 0.44, 0.016, 0.1, bx[b], 0.42 + f2 * 0.26, 0.25); B(plas, WH, 0.44, 0.05, 0.012, bx[b], 0.45 + f2 * 0.26, 0.295); }
      Y(plas, WH, 0.034, 0.034, 0.07, 8, bx[b] + 0.18, BH[b] + 0.09, -0.28);
    }
    if (level >= 4 && b !== 1) {
      var ry = BH[b] + 0.07; B(dark, DK, 0.52, 0.018, 0.4, bx[b], ry + 0.26, -0.1); B(glow, GW, 0.36, 0.02, 0.24, bx[b], ry + 0.235, -0.1);
      for (var p2 = 0; p2 < 4; p2++) B(dark, DK, 0.02, 0.24, 0.02, bx[b] + (p2 % 2 ? 0.21 : -0.21), ry + 0.14, p2 < 2 ? -0.26 : 0.06);
      B(glass, GL, 0.52, 0.5, 0.015, bx[b], BH[b] - 0.4, 0.208);
    }
  }
  if (level >= 3) { A2(glass, GL, new THREE.CylinderGeometry(0.15, 0.15, 0.3, 10, 1, false, -PI / 2, PI), 1.1, 0.21, 0.35); A2(plas, WH, new THREE.CylinderGeometry(0.17, 0.17, 0.02, 10, 1, false, -PI / 2, PI), 1.1, 0.37, 0.35); }
  /* 棕榈（度假灵魂）：树皮环纹干 + 7 枚条纹垂坠叶；行道树 + 沙滩丛逐年代加密 */
  function palm(x, z, s) {
    var h = 0.42 * s, ty = 0.04 + h; Y(bark, TR, 0.011 * s, 0.02 * s, h, 6, x, 0.04 + h / 2, z, 0, 0, 0.07);
    for (var k = 0; k < 7; k++) { var fr = new THREE.BoxGeometry(0.32 * s, 0.011 * s, 0.065 * s); xf(fr, 0.15 * s, 0, 0, 0, 0, -0.52); xf(fr, 0, 0, 0, 0, -k * PI * 2 / 7 + 0.3, 0); xf(fr, x + h * 0.07, ty, z); put(leaf, fr, LF); }
    O(leaf, LF2, 0.035 * s, x + h * 0.07, ty + 0.02 * s, z);
  }
  var stP = [[-0.95, 0.525], [0.35, 0.525], [-0.35, 0.525], [0.95, 0.525]], bP = [[-0.92, -0.55], [0.92, -0.55], [-0.5, -0.72], [0.45, -0.72], [0.0, -0.6]];
  for (i = 0; i < [2, 3, 4, 4][level - 1]; i++) palm(stP[i][0], stP[i][1], 0.9);
  for (i = 0; i < [2, 3, 4, 5][level - 1]; i++) palm(bP[i][0], bP[i][1], 1.15);
  /* 沙滩戏水：遮阳伞 lv2+（篷布伞面）+ 躺椅 lv3+ + 灌木 */
  if (level >= 2) { var ux = [-0.85, 0.7, -0.3, 0.35]; for (i = 0; i < [2, 3, 4, 4][level - 1]; i++) { Y(bark, TR, 0.005, 0.005, 0.12, 5, ux[i], 0.1, -0.7); A2(awn, AW[kc[i]], new THREE.ConeGeometry(0.075, 0.06, 7), ux[i], 0.19, -0.7); } }
  if (level >= 3) for (i = 0; i < 3; i++) B(plas, WH, 0.1, 0.014, 0.045, -0.55 + i * 0.45, 0.055, -0.5, 0, i * 1.1 - 0.5, 0);
  O(leaf, LF2, 0.05, -1.22, 0.1, 0.47); O(leaf, LF2, 0.045, 1.24, 0.1, 0.5); if (level >= 3) O(leaf, LF2, 0.05, 0.28, 0.1, 0.5);
  flush(g, hot);
  var seaT = TEX.sea();
  g.userData.anim = [function (t) { var m = hot['#ffc06a']; if (m) m.emissiveIntensity = 0.4 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.4)); seaT.offset.x = (t * 0.015) % 1; seaT.offset.y = (t * 0.01) % 1; }];
  if (level >= 3) g.userData.anim.push(function (t) {
    var s = 0.5 + 0.5 * Math.sin(t * 1.2), n, m; for (n = 0; n < 3; n++) if ((m = hot[NE[n]])) m.emissiveIntensity = 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(t * (1.1 + n * 0.5)));
    if (hot.sign) hot.sign.emissiveIntensity = 0.55 + 0.35 * s;
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[39] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
