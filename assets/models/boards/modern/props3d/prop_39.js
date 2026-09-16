/* 大富翁·现代写实棋盘（台）格 39「垦丁大街」—— 海滨度假街：滨海路 + 前排彩篷商铺 + 后排白色民宿旅店 + 椰林 + 沙滩 + 海，四年代演进 · v3 精修
 * 视觉基准 refs/modern/prop_39.png 四象限（左上1990s / 右上2000s / 左下2010s / 右下2020s，同机位航拍 3/4；相机自 +x+y+z，+z 临路正面）：
 *   沥青滨海路（中虚线/边线/斑马线/路缘石）→ 铺砖人行道（树池行道椰/路灯/长椅/机车/花箱/挡车柱/外摆咖啡座）→ 前排 6 间 1-3F 彩色商铺
 *   （橱窗灯箱/门缝/台阶/彩篷/店招图集/竖招/顶层窗框窗台/小阳台/女儿墙/水塔/天线/卫星锅/屋顶空调）→ 后排 5 栋 1-6F 白色民宿旅店（层间线脚/
 *   阳台栏杆或玻璃栏板+推拉门/窗框窗台/侧窗/四坡红瓦或灰瓦/浪板双坡/平顶女儿墙+水塔+楼梯间+太阳能+卫星锅+屋顶花园）→ 椰林草地 →
 *   沙滩（遮阳伞/躺椅/救生塔/小卖亭）→ 海（近浅远深三带 + 泡沫线）。
 * 年代特征：lv1 1990s 红瓦四坡顶 3F 民宿 + 灰浪板坡顶小楼 + 褪色篷布 3 间 + 天线 + 水泥路灯 + 天然沙滩单伞 + 沙滩小卖亭；
 *   lv2 2000s 平顶加层（4/3/3F）+ 阳台栏杆 + 水塔/卫星锅/机车/长椅 + 六色篷 + 竖招 + 遮阳伞躺椅加密；
 *   lv3 2010s 圆角玻璃转角咖啡楼（蓝色层带/蓝顶露台）+ 玻璃栏板阳台 + 屋顶霓虹 + 灯箱店招 + 救生塔 + 花箱挡车柱 + 太阳能 + 外摆；
 *   lv4 2020s 6F 精品白旅店（通层玻璃带+玻璃阳台+屋顶 pergola 酒吧+墾丁大街招牌）+ 深色幕墙精品楼（屋顶 pergola）+ 屋顶花园 + 木栈道/沙滩木台。
 * 工程要点：桶 = 材质参数(rg|mt|em|ei|tex|ws|ds|nat)，顶点色承载主色，flush 按三角面主法线烘焙世界尺寸 boxUV（nat 桶保留原生 UV → 店招图集 256×128）；
 *   四坡顶 = 4 段圆柱 rotY45° + 非均匀缩放（平脊）；双坡顶 = 三棱柱山墙 + 出檐坡板 + 脊帽；棕榈 = 3 段渐斜 12 段树干 + 11 枚 5 段下垂 V 形叶（DoubleSide）
 *   + 2 枯叶 + 椰果；Canvas ≤256px 多层（沥青/铺砖/沙/海/草/小口砖灰泥/红瓦/浪板/树皮/叶/篷布/灯箱/霓虹/玻璃反射/太阳能/木板/店招图集/大招牌）；
 *   零 Math.random（LCG 种子流）；文字招牌独立 Canvas mesh。
 * 契约：window.Props3DModern[39](level 1..4) → 每次全新 Group；占地 ≤2.6×2.6（实 2.56×2.56）；底面 y=0；正面 +Z；mesh ≤55/级；
 *   三角 lv1≤9k/lv2≤13k/lv3≤18k/lv4≤24k；动画 2 项（橱窗呼吸+海面漂移 / 霓虹+招牌脉动，240 帧无 NaN）；
 *   高度带（smoke_modern_tw）lv1[0.85,1.15] lv2[1.05,1.35] lv3[1.28,1.58] lv4[1.5,1.8]。
 * 本轮精修（65→90）：R1 结构——1 条薄墙 + 3 盒 → 6 商铺 + 5 旅店（高低错落、屋顶形式按年代切换）+ 后场椰林/沙滩/海分带；立面窗框窗台阳台栏杆、
 *   屋顶设备、街道家具、棕榈重做（弯干/垂叶/枯叶/椰果）、店招图集、玻璃转角咖啡楼（lv3）、精品旅店幕墙+屋顶酒吧（lv4）。R2 材质细节——玻璃 metal
 *   0.75→0.3 + 天空反射渐变贴图（幕墙不再黑带，lv4 深色楼提亮为蓝灰+白竖梃）；小口砖灰泥/红瓦筒垄/浪板锈斑/海面三带渐变+浪脊；棕榈加密内圈叶；
 *   滨海步道、绿防水涂层屋顶分色、阔叶树、救生塔/小卖亭移至可见侧、交通标志。R3 收尾——四坡顶白色檐口封板（1990s 红顶檐口线）、排水篦×3+井盖、
 *   S6 侧墙窗、步道绿篱、泡沫线抬高 0.002 消掠射共面。回归：node --check / CHECK39（占地·BANDS·mesh·三角·贴地·动画 240 帧）/ 渲染四视图。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_39] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TXC = {}, _FR = {}, K;
var DK = '#3a3d40', SL = '#dcd8cf', GLC = '#b6d0da', GLC2 = '#d4e6ec', GW = '#5a4a34', TR = '#8a6f4d', LF = '#5b7a33', LF2 = '#7a9640', DF = '#a89060', WD = '#6b4e33', PW = '#f4f2ea';
var NE = ['#ffd23e', '#ff5fce', '#3ed2ea'], NB = ['#3c300a', '#3a1430', '#12333c'];
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function RG(s) { s = (s >>> 0) || 393; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function mkTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
function TX(id, seed, draw, big) { if (_TXC[id]) return _TXC[id]; var c = big ? cv(256, 256) : cv(128, 128); draw(c.getContext('2d'), c.width, c.height, RG(seed)); return (_TXC[id] = mkTex(c)); }
function F(g, s, x, y, w, h) { g.fillStyle = s; g.fillRect(x, y, w, h); }
function RA(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')'; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? RA(255, 255, 255, a) : RA(22, 20, 16, a), R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
function DOT(g, s, x, y, r) { g.fillStyle = s; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); }
function WAVE(g, s, y0, amp, ph, lw) { var j; g.strokeStyle = s; g.lineWidth = lw || 2; g.beginPath(); for (j = 0; j <= 8; j++) { var x = j * 16, y = y0 + amp * Math.sin(j * 1.3 + ph); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
function LINE(g, s, x0, y0, x1, y1, lw) { g.strokeStyle = s; g.lineWidth = lw || 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
/* ---- 多层 Canvas（近白基色 × 顶点色 = 最终色；模块级缓存，惰性创建） ---- */
function sgnTex() { if (_TXC.sgn) return _TXC.sgn; var c = cv(256, 128), g = c.getContext('2d'), R = RG(3920), i, T = ['海產', '民宿', 'SURF', '冰店', 'BAR', '潛水', 'CAFE', '衝浪'],
  BG = ['#1d4f8a', '#b3261e', '#f2c12e', '#2a9d8f', '#1b1b1f', '#e76f51', '#f4f1e8', '#3a7d44'], FG = ['#ffffff', '#ffe9a8', '#1b1b1f', '#ffffff', '#ff5fce', '#ffffff', '#2a3a48', '#ffffff'];
  for (i = 0; i < 8; i++) { var x0 = (i % 2) * 96, y0 = (i >> 1) * 32; F(g, BG[i], x0, y0, 96, 32); g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2; g.strokeRect(x0 + 2, y0 + 2, 92, 28); g.fillStyle = FG[i]; g.font = 'bold 20px "Microsoft YaHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(T[i], x0 + 48, y0 + 17); }
  var VT = ['民宿', '海鮮'], VB = ['#c0392b', '#1f5fa8'];
  for (i = 0; i < 2; i++) { var vx = 192 + i * 32; F(g, VB[i], vx, 0, 32, 128); g.strokeStyle = 'rgba(255,255,255,0.6)'; g.lineWidth = 2; g.strokeRect(vx + 2, 2, 28, 124); g.fillStyle = '#ffffff'; g.font = 'bold 24px "Microsoft YaHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(VT[i][0], vx + 16, 42); g.fillText(VT[i][1], vx + 16, 88); }
  SPK(g, 256, 128, 50, 0.04, R); return (_TXC.sgn = mkTex(c)); }
var CELL = [], _ci;
for (_ci = 0; _ci < 8; _ci++) CELL.push([(_ci % 2) * 96 / 256, 1 - (( _ci >> 1) * 32 + 32) / 128, ((_ci % 2) * 96 + 96) / 256, 1 - (_ci >> 1) * 32 / 128]);
CELL.push([0.75, 0, 0.875, 1], [0.875, 0, 1, 1]);
var TEX = {
  asph: function () { return TX('asph', 3901, function (g, w, h, R) { F(g, '#ededeb', 0, 0, w, h); var i; SPK(g, w, h, 240, 0.08, R);
    for (i = 0; i < 5; i++) F(g, RA(40, 40, 44, 0.08 + R() * 0.1), R() * w, R() * h, 10 + R() * 30, 6 + R() * 14);
    for (i = 0; i < 4; i++) { var x0 = R() * w, y0 = R() * h; LINE(g, 'rgba(30,30,32,0.3)', x0, y0, x0 + (R() - 0.5) * 40, y0 + (R() - 0.5) * 40); } }); },
  pave: function () { return TX('pave', 3902, function (g, w, h, R) { F(g, '#f3f1ea', 0, 0, w, h); var x, y;
    for (y = 0; y < h; y += 16) { F(g, RA(96, 90, 74, 0.5), 0, y, w, 1.5); var o = (y / 16) % 2 ? 16 : 0; for (x = o - 32; x < w; x += 32) { F(g, RA(96, 90, 74, 0.45), x, y, 1.5, 16); F(g, R() > 0.5 ? RA(255, 255, 250, 0.14) : RA(70, 64, 52, 0.1), x + 2, y + 2, 28, 12); } }
    SPK(g, w, h, 90, 0.06, R); }); },
  sand: function () { return TX('sand', 3903, function (g, w, h, R) { F(g, '#f8f3e6', 0, 0, w, h); var i; SPK(g, w, h, 220, 0.05, R);
    for (i = 0; i < 6; i++) WAVE(g, RA(120, 100, 60, 0.13), 8 + i * 22, 4, i, 1.5); for (i = 0; i < 14; i++) DOT(g, RA(255, 255, 255, 0.7), R() * w, R() * h, 1); }); },
  sea: function () { return TX('sea', 3904, function (g, w, h, R) { F(g, '#eef8f8', 0, 0, w, h); var i;
    for (i = 0; i < 6; i++) WAVE(g, RA(255, 255, 255, 0.5), i * 21 + 6, 5, i, 2); for (i = 0; i < 8; i++) F(g, RA(12, 50, 80, 0.13), R() * w, R() * h, 10 + R() * 18, 3 + R() * 6); SPK(g, w, h, 40, 0.05, R); }); },
  gras: function () { return TX('gras', 3912, function (g, w, h, R) { F(g, '#eef3e2', 0, 0, w, h); var i; for (i = 0; i < 300; i++) F(g, i % 3 ? RA(40, 80, 20, 0.22) : RA(255, 255, 230, 0.3), R() * w, R() * h, 2 + R() * 4, 1 + R() * 3); for (i = 0; i < 6; i++) F(g, RA(150, 130, 80, 0.18), R() * w, R() * h, 8 + R() * 16, 4 + R() * 8); }); },
  plas: function () { return TX('plas', 3905, function (g, w, h, R) { F(g, '#f7f5f0', 0, 0, w, h); var i, x, y;
    for (y = 0; y < h; y += 8) { F(g, RA(120, 110, 90, 0.09), 0, y, w, 1); var o = (y / 8) % 2 ? 8 : 0; for (x = o; x < w; x += 16) F(g, RA(120, 110, 90, 0.07), x, y, 1, 8); }
    for (i = 0; i < 12; i++) F(g, RA(120, 110, 88, 0.04 + R() * 0.06), R() * w, R() * 40, 2 + R() * 5, 40 + R() * 120);
    for (i = 0; i < 4; i++) { x = R() * w; LINE(g, RA(110, 100, 80, 0.16), x, 0, x + (R() - 0.5) * 14, h); }
    F(g, RA(90, 84, 66, 0.08), 0, h - 22, w, 22); SPK(g, w, h, 160, 0.04, R); }, true); },
  tile: function () { return TX('tile', 3906, function (g, w, h, R) { F(g, '#f4ece6', 0, 0, w, h); var x, y;
    for (x = 0; x < w; x += 10) { F(g, RA(60, 20, 10, 0.32), x, 0, 3, h); F(g, RA(255, 240, 230, 0.45), x + 4, 0, 2, h); }
    for (y = 0; y < h; y += 16) { F(g, RA(60, 20, 10, 0.42), 0, y + 12, w, 4); F(g, RA(255, 240, 230, 0.5), 0, y, w, 2); } SPK(g, w, h, 40, 0.06, R); }); },
  corr: function () { return TX('corr', 3913, function (g, w, h, R) { F(g, '#f0f0ee', 0, 0, w, h); var x, i;
    for (x = 0; x < w; x += 6) { F(g, RA(30, 34, 38, 0.3), x, 0, 2, h); F(g, RA(255, 255, 255, 0.35), x + 3, 0, 1.5, h); }
    for (i = 0; i < 8; i++) F(g, RA(150, 80, 30, 0.22), R() * w, R() * h, 4 + R() * 10, 8 + R() * 30); SPK(g, w, h, 40, 0.05, R); }); },
  bark: function () { return TX('bark', 3907, function (g, w, h, R) { F(g, '#f0e6d8', 0, 0, w, h); var y, x;
    for (y = 0; y < h; y += 10) { F(g, RA(70, 45, 20, 0.35), 0, y, w, 3); F(g, RA(255, 250, 240, 0.4), 0, y + 4, w, 1); var o = (y / 10) % 2 ? 8 : 0; for (x = o; x < w; x += 16) F(g, RA(70, 45, 20, 0.25), x, y + 3, 2, 7); } SPK(g, w, h, 90, 0.06, R); }); },
  leaf: function () { return TX('leaf', 3908, function (g, w, h, R) { F(g, '#eef5e4', 0, 0, w, h); var x, i;
    for (x = 0; x < w; x += 6) { F(g, RA(30, 60, 20, 0.16), x, 0, 2, h); F(g, RA(30, 60, 20, 0.12), 0, x, w, 2); } F(g, RA(90, 110, 40, 0.35), 0, 62, w, 4);
    for (i = 0; i < 24; i++) DOT(g, i % 2 ? RA(34, 66, 24, 0.22) : RA(255, 255, 240, 0.3), R() * w, R() * h, 2 + R() * 3); }); },
  awn: function () { return TX('awn', 3909, function (g, w, h, R) { F(g, '#f4f4f2', 0, 0, w, h); var i;
    for (i = 0; i < w; i += 4) { F(g, RA(40, 40, 40, 0.07), i, 0, 1, h); F(g, RA(40, 40, 40, 0.07), 0, i, w, 1); }
    for (i = 0; i < w; i += 32) { F(g, RA(255, 255, 255, 0.62), i + 4, 0, 10, h); F(g, RA(30, 30, 30, 0.14), i + 28, 0, 3, h); } F(g, RA(80, 70, 50, 0.1), 0, 112, w, 16); SPK(g, w, h, 40, 0.05, R); }); },
  lbox: function () { return TX('lbox', 3910, function (g, w, h, R) { F(g, '#fff3d8', 0, 0, w, h); var i, j;
    for (i = 24; i < h; i += 28) { F(g, 'rgba(70,40,15,0.55)', 0, i, w, 3); for (j = 0; j < 7; j++) F(g, ['#e04848', '#3a8ad8', '#ffd040', '#48b060'][(i + j) % 4], 4 + j * 18, i - 14 - R() * 4, 8 + R() * 6, 12 + R() * 4); }
    for (i = 0; i < 8; i++) DOT(g, 'rgba(255,255,255,0.9)', 8 + i * 16, 5, 3); F(g, 'rgba(255,205,130,0.22)', 0, 0, w, h); }); },
  neon: function () { return TX('neon', 3911, function (g, w, h, R) { F(g, '#2a2028', 0, 0, w, h); var i, x;
    for (i = 0, x = 6; i < 6 && x < w - 6; i++) { var L = 8 + R() * 16; F(g, '#ffffff', x, 52, L, 22); DOT(g, '#ffffff', x, 63, 11); DOT(g, '#ffffff', x + L, 63, 11); x += L + 12; } F(g, 'rgba(255,255,255,0.12)', 0, 0, w, h); }); },
  glas: function () { return TX('glas', 3914, function (g, w, h, R) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#dfeef4'); gr.addColorStop(0.55, '#a9c6d2'); gr.addColorStop(1, '#8fb0bd'); g.fillStyle = gr; F(g, gr, 0, 0, w, h); var i;
    for (i = 0; i < 8; i++) F(g, RA(255, 255, 255, 0.12 + R() * 0.18), R() * w, 0, 3 + R() * 6, h); F(g, RA(255, 255, 255, 0.35), 0, 4, w, 10); F(g, RA(40, 60, 70, 0.2), 0, h - 8, w, 8); SPK(g, w, h, 50, 0.06, R); }); },
  sola: function () { return TX('sola', 3915, function (g, w, h) { F(g, '#1b2742', 0, 0, w, h); var x; for (x = 0; x < w; x += 16) { F(g, '#9fb0c8', x, 0, 1.5, h); F(g, '#9fb0c8', 0, x, w, 1.5); } F(g, RA(120, 160, 220, 0.2), 0, 0, w, 24); }); },
  wood: function () { return TX('wood', 3916, function (g, w, h, R) { F(g, '#f2e6d4', 0, 0, w, h); var x, i; for (x = 0; x < w; x += 16) { F(g, RA(60, 36, 16, 0.5), x, 0, 2, h); for (i = 0; i < 3; i++) F(g, RA(90, 60, 30, 0.12 + R() * 0.1), x + 3 + R() * 10, 0, 1, h); } for (i = 0; i < 12; i++) F(g, RA(40, 24, 10, 0.3), R() * w, R() * h, 2, 3); SPK(g, w, h, 40, 0.05, R); }); },
  sgn: sgnTex
};
/* ---- 桶合并构建器：桶 = 材质参数(rg|mt|em|ei|tex|ws|ds|nat)；flush 烘焙世界尺寸 boxUV（nat 桶保留原生 UV） ---- */
var BK;
function BKT(rg, mt, em, ei, tex, ws, ds, nat) { var k = rg + '|' + (mt || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (tex || '') + '|' + (ws || 1) + '|' + (ds ? 1 : 0) + (nat ? 'n' : ''); return BK[k] || (BK[k] = { rg: rg, mt: mt || 0, em: em, ei: ei, tex: tex, ws: ws || 1, ds: ds, nat: nat, gs: [], cs: [] }); }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(b, g, h) { b.gs.push(g); b.cs.push(V(h)); }
function B(b, h, w, ht, d, x, y, z, rx, ry, rz) { put(b, xf(new THREE.BoxGeometry(w, ht, d), x, y, z, rx, ry, rz), h); }
function Y(b, h, r1, r2, ht, s, x, y, z, rx, ry, rz, op) { put(b, xf(new THREE.CylinderGeometry(r1, r2, ht, s || 12, 1, !!op), x, y, z, rx, ry, rz), h); }
function O(b, h, r, x, y, z, sx, sy, sz, det) { var g = new THREE.IcosahedronGeometry(r, det === undefined ? 1 : det); if (sx) g.scale(sx, sy || 1, sz || 1), g.computeVertexNormals(); put(b, xf(g, x, y, z), h); }
function A2(b, h, geo, x, y, z, rx, ry, rz) { put(b, xf(geo, x, y, z, rx, ry, rz), h); }
function HIP(b, h, w, d, ht, f, x, y, z) { var g = new THREE.CylinderGeometry(0.7071 * f, 0.7071, ht, 4, 1).toNonIndexed(); g.rotateY(PI / 4); g.scale(w, 1, d); g.computeVertexNormals(); g.translate(x, y + ht / 2, z); put(b, g, h); }
function PRI(b, h, w, d, ht, x, y, z) { var hw = w / 2, hd = d / 2, P = [[-hw, 0, -hd], [hw, 0, -hd], [hw, 0, hd], [-hw, 0, hd], [-hw, ht, 0], [hw, ht, 0]], T = [3, 2, 5, 3, 5, 4, 1, 0, 4, 1, 4, 5, 0, 3, 4, 2, 1, 5], p = [], i;
  for (i = 0; i < 18; i++) p.push(P[T[i]][0], P[T[i]][1], P[T[i]][2]); var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.computeVertexNormals(); g.translate(x, y, z); put(b, g, h); }
function PB(b, h, x, y, z, nx, nz, off, w, ht, t) { if (nz) B(b, h, w, ht, t, x, y, z + nz * off); else B(b, h, t, ht, w, x + nx * off, y, z); }
function TP(x, z, nx, nz, s) { return nz ? [x + s, z] : [x, z + s]; }
function flush(g, hot) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i, j, q, r, u2;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.count; }
    if (!P) continue;
    var pa = new Float32Array(P * 3), na = new Float32Array(P * 3), ca = new Float32Array(P * 3), ua = new Float32Array(P * 2), o = 0, iv = 1 / b.ws;
    for (i = 0; i < gs.length; i++) {
      var cnt = gs[i].attributes.position.count, c = b.cs[i]; pa.set(gs[i].attributes.position.array, o * 3); na.set(gs[i].attributes.normal.array, o * 3);
      if (b.nat && gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o * 2);
      for (j = 0; j < cnt; j++) { ca[(o + j) * 3] = c[0]; ca[(o + j) * 3 + 1] = c[1]; ca[(o + j) * 3 + 2] = c[2]; } o += cnt;
    }
    if (!b.nat) for (i = 0; i < P; i += 3) {
      q = i * 3; var e1x = pa[q + 3] - pa[q], e1y = pa[q + 4] - pa[q + 1], e1z = pa[q + 5] - pa[q + 2], e2x = pa[q + 6] - pa[q], e2y = pa[q + 7] - pa[q + 1], e2z = pa[q + 8] - pa[q + 2];
      var ax = Math.abs(e1y * e2z - e1z * e2y), ay = Math.abs(e1z * e2x - e1x * e2z), az = Math.abs(e1x * e2y - e1y * e2x);
      for (j = 0; j < 3; j++) { r = q + j * 3; u2 = (i + j) * 2; if (ay >= ax && ay >= az) { ua[u2] = pa[r] * iv; ua[u2 + 1] = pa[r + 2] * iv; } else if (ax >= az) { ua[u2] = pa[r + 2] * iv; ua[u2 + 1] = pa[r + 1] * iv; } else { ua[u2] = pa[r] * iv; ua[u2 + 1] = pa[r + 1] * iv; } }
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, side: b.ds ? THREE.DoubleSide : THREE.FrontSide });
    if (b.tex) m.map = TEX[b.tex]();
    if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tex) m.emissiveMap = m.map; hot[b.em] = m; }
    var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function signMesh(txt, w, h, d, bg, fg, ei) {
  var c = cv(256, 64), g = c.getContext('2d'); F(g, bg, 0, 0, 256, 64); g.strokeStyle = '#ffd7a0'; g.lineWidth = 3; g.strokeRect(4, 4, 248, 56);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34);
  var t = mkTex(c), m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: C(fg), emissiveMap: t, emissiveIntensity: ei }); m.userData.previewColor = bg;
  var ms = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); ms.castShadow = ms.receiveShadow = true; return ms;
}
/* ---- 棕榈叶：5 段下垂 V 形条带（缓存模板 + clone，实例零共享） ---- */
function frondGeo(L, W) { var k = L.toFixed(3) + '_' + W.toFixed(3); if (!_FR[k]) { var N = 4, S = [], p = [], i, t, w;
  for (i = 0; i <= N; i++) { t = i / N; w = W * Math.pow(Math.sin(PI * (0.06 + 0.9 * t)), 0.55); S.push([L * t, L * (0.34 * t - 0.9 * t * t), w]); }
  for (i = 0; i < N; i++) { var a = S[i], b = S[i + 1], A = [a[0], a[1] - a[2] * 0.35, -a[2] / 2], Bm = [a[0], a[1], 0], Cc = [a[0], a[1] - a[2] * 0.35, a[2] / 2],
    D = [b[0], b[1] - b[2] * 0.35, -b[2] / 2], E = [b[0], b[1], 0], Fm = [b[0], b[1] - b[2] * 0.35, b[2] / 2];
    p.push.apply(p, A.concat(Bm, E, A, E, D, Bm, Cc, Fm, Bm, Fm, E)); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.computeVertexNormals(); _FR[k] = g; } return _FR[k].clone(); }
function palm(x, z, s, seed, dz) { var R = RG(seed), h = 0.6 * s, n = 3, sh = h / n, i, px = x, py = 0.05, pz = z, lean = 0.04 + R() * 0.05, k, ang, g;
  for (i = 0; i < n; i++) { var a = lean * (i + 1), dy = Math.cos(a) * sh, dz2 = Math.sin(a) * sh * dz, r1 = (0.021 - 0.005 * i) * s;
    Y(K.bark, TR, r1 - 0.004 * s, r1, sh + 0.012, 12, px, py + dy / 2, pz + dz2 / 2, a * dz, 0, 0, true); py += dy; pz += dz2; }
  Y(K.bark, '#6f5636', 0.036 * s, 0.02 * s, 0.045 * s, 12, px, py, pz);
  for (k = 0; k < 11; k++) { ang = k * PI * 2 / 11 + R() * 0.2; var pitch = (k % 2 ? 0.2 : -0.25) + (R() - 0.5) * 0.15;
    g = frondGeo(0.3 * s * (k % 2 ? 0.9 : 1), 0.08 * s); xf(g, 0, 0, 0, 0, 0, pitch); xf(g, 0, 0, 0, 0, ang, 0); xf(g, px, py + 0.012 * s, pz); put(K.leaf, g, k % 3 === 2 ? LF2 : LF); }
  for (k = 0; k < 4; k++) { g = frondGeo(0.18 * s, 0.065 * s); xf(g, 0, 0, 0, 0, 0, 0.72); xf(g, 0, 0, 0, 0, k * PI / 2 + 0.4 + R() * 0.3, 0); xf(g, px, py + 0.02 * s, pz); put(K.leaf, g, LF2); }
  for (k = 0; k < 2; k++) { g = frondGeo(0.22 * s, 0.06 * s); xf(g, 0, 0, 0, 0, 0, -1.25); xf(g, 0, 0, 0, 0, k * 2.4 + R(), 0); xf(g, px, py - 0.008 * s, pz); put(K.leaf, g, DF); }
  for (k = 0; k < 2; k++) put(K.bark, xf(new THREE.IcosahedronGeometry(0.018 * s, 0), px + (k ? 0.02 : -0.018) * s, py - 0.02 * s, pz + (k ? 0.016 : -0.01) * s), '#5a4022'); }
/* ---- 通用构件 ---- */
function shrub(x, y, z, r, hex, sx, sy, sz) { O(K.leaf, hex || LF, r, x, y, z, sx || 1, sy || 0.8, sz || 1); }
function win(x, y, z, nx, nz, w, h, o) { o = o || {}; if (!o.nf) PB(K.dark, DK, x, y, z, nx, nz, 0.005, w + 0.03, h + 0.03, 0.01); PB(o.g ? K.glow : K.glass, o.g ? GW : (o.c || GLC), x, y, z, nx, nz, 0.012, w, h, 0.006); if (!o.ns) PB(K.conc, SL, x, y - h / 2 - 0.014, z, nx, nz, 0.014, w + 0.06, 0.014, 0.03); }
function tree(x, z, s) { Y(K.wood, '#6b4e33', 0.016 * s, 0.024 * s, 0.3 * s, 12, x, 0.062 + 0.15 * s, z, 0, 0, 0, true); shrub(x, 0.062 + 0.36 * s, z, 0.1 * s, LF, 1.1, 0.85, 1); shrub(x + 0.06 * s, 0.062 + 0.3 * s, z + 0.03 * s, 0.075 * s, LF2, 1, 0.85, 1); shrub(x - 0.055 * s, 0.062 + 0.31 * s, z - 0.035 * s, 0.07 * s, LF2, 1, 0.85, 1); }
function balc(x, y, z, nx, nz, w, gl) { var i, n, p; PB(K.conc, SL, x, y - 0.008, z, nx, nz, 0.05, w, 0.016, 0.1); PB(K.dark, DK, x, y + 0.1, z, nx, nz, 0.095, w, 0.012, 0.012);
  if (gl) PB(K.glass, GLC2, x, y + 0.05, z, nx, nz, 0.095, w - 0.02, 0.085, 0.006); else { n = Math.max(3, Math.round(w / 0.055)); for (i = 0; i <= n; i++) { p = TP(x, z, nx, nz, -w / 2 + w * i / n); B(K.dark, DK, 0.008, 0.1, 0.008, p[0] + nx * 0.095, y + 0.05, p[1] + nz * 0.095); } }
  for (i = -1; i <= 1; i += 2) { p = TP(x, z, nx, nz, i * (w / 2 - 0.005)); B(K.dark, DK, nz ? 0.01 : 0.1, 0.012, nz ? 0.1 : 0.01, p[0] + nx * 0.05, y + 0.1, p[1] + nz * 0.05); }
  PB(K.dark, DK, x, y + 0.115, z, nx, nz, 0.004, w - 0.08, 0.21, 0.008); PB(K.glass, GLC, x, y + 0.115, z, nx, nz, 0.009, w - 0.11, 0.19, 0.006); }
function awning(x, y, z, w, hex, dp) { var a = 0.5, ca = Math.cos(a), sa = Math.sin(a); B(K.awn, hex, w, 0.012, dp, x, y - dp * sa / 2, z + dp * ca / 2, a, 0, 0);
  B(K.awn, hex, w, 0.035, 0.01, x, y - dp * sa - 0.02, z + dp * ca); B(K.dark, DK, w + 0.02, 0.01, 0.01, x, y - dp * sa, z + dp * ca);
  B(K.dark, DK, 0.008, 0.008, dp, x - w / 2 + 0.02, y - dp * sa / 2 - 0.006, z + dp * ca / 2, a, 0, 0); B(K.dark, DK, 0.008, 0.008, dp, x + w / 2 - 0.02, y - dp * sa / 2 - 0.006, z + dp * ca / 2, a, 0, 0); }
function SG(b, x, y, z, w, ht, cell, ry) { var g = new THREE.BoxGeometry(w, ht, 0.02), uv = g.attributes.uv, i, c = CELL[cell]; for (i = 0; i < uv.count; i++) uv.setXY(i, c[0] + uv.getX(i) * (c[2] - c[0]), c[1] + uv.getY(i) * (c[3] - c[1])); put(b, xf(g, x, y, z, 0, ry || 0, 0), '#ffffff'); }
function gable(b, hex, w, d, h, x, y, z) { var a = Math.atan2(h, d / 2), L = Math.sqrt(d * d / 4 + h * h) + 0.05; B(b, hex, w, 0.014, L, x, y + h / 2 + 0.006, z + d / 4, a, 0, 0); B(b, hex, w, 0.014, L, x, y + h / 2 + 0.006, z - d / 4, -a, 0, 0); B(K.dark, '#6a6a68', w + 0.01, 0.02, 0.03, x, y + h + 0.012, z); }
function parapet(x, y, z, w, d, hex, rf) { B(K.plas, hex, w + 0.024, 0.035, 0.024, x, y + 0.017, z + d / 2); B(K.plas, hex, w + 0.024, 0.035, 0.024, x, y + 0.017, z - d / 2); B(K.plas, hex, 0.024, 0.035, d + 0.024, x + w / 2, y + 0.017, z); B(K.plas, hex, 0.024, 0.035, d + 0.024, x - w / 2, y + 0.017, z); B(K.asph, rf || '#8d8a80', w - 0.03, 0.006, d - 0.03, x, y + 0.003, z); }
function tank(x, y, z) { var i; Y(K.metal, '#d4d8dc', 0.042, 0.042, 0.1, 12, x, y + 0.11, z); Y(K.metal, '#b4b8bc', 0.045, 0.045, 0.012, 12, x, y + 0.166, z); B(K.dark, DK, 0.09, 0.012, 0.012, x, y + 0.056, z); B(K.dark, DK, 0.012, 0.012, 0.09, x, y + 0.056, z); for (i = 0; i < 4; i++) B(K.dark, DK, 0.01, 0.06, 0.01, x + (i % 2 ? 0.036 : -0.036), y + 0.03, z + (i < 2 ? -0.036 : 0.036)); }
function ac(x, y, z, nx, nz) { PB(K.metal, '#dcdfdf', x, y, z, nx, nz, 0.034, 0.07, 0.05, 0.05); PB(K.dark, '#5a5e60', x, y, z, nx, nz, 0.062, 0.05, 0.035, 0.006); PB(K.dark, DK, x, y - 0.03, z, nx, nz, 0.03, 0.08, 0.008, 0.06); }
function solar(x, y, z, w, d) { B(K.sola, '#1e2c4a', w, 0.01, d, x, y + 0.05, z, 0.35, 0, 0); B(K.dark, DK, 0.012, 0.06, 0.012, x - w / 3, y + 0.03, z - d * 0.35); B(K.dark, DK, 0.012, 0.06, 0.012, x + w / 3, y + 0.03, z - d * 0.35); }
function pergola(x, y, z, w, d) { var i; for (i = 0; i < 4; i++) B(K.wood, WD, 0.022, 0.2, 0.022, x + (i % 2 ? w / 2 - 0.02 : -w / 2 + 0.02), y + 0.1, z + (i < 2 ? -d / 2 + 0.02 : d / 2 - 0.02)); B(K.wood, WD, w, 0.022, 0.03, x, y + 0.2, z - d / 2 + 0.02); B(K.wood, WD, w, 0.022, 0.03, x, y + 0.2, z + d / 2 - 0.02); for (i = 0; i <= 5; i++) B(K.wood, WD, 0.018, 0.014, d, x - w / 2 + w * i / 5, y + 0.218, z); }
function planter(x, y, z, w, d, seed) { var n = Math.max(2, Math.round(w / 0.09)), i; B(K.conc, '#8e887c', w, 0.05, d, x, y + 0.025, z); B(K.asph, '#3e3a30', w - 0.02, 0.004, d - 0.02, x, y + 0.052, z); for (i = 0; i < n; i++) O(K.leaf, (i + seed) % 2 ? LF : LF2, 0.034, x - w / 2 + w * (i + 0.5) / n, y + 0.078, z, 1.35, 0.9, 1, 0); }
function umbrella(x, y, z, hex) { Y(K.dark, DK, 0.005, 0.005, 0.18, 12, x, y + 0.09, z, 0, 0, 0, true); A2(K.awn, hex, new THREE.ConeGeometry(0.09, 0.05, 12, 1, true), x, y + 0.17, z); }
function lounger(x, z, hex) { B(K.wood, hex, 0.06, 0.012, 0.14, x, 0.085, z); B(K.wood, hex, 0.06, 0.012, 0.08, x, 0.106, z + 0.104, -0.55, 0, 0); B(K.dark, DK, 0.05, 0.03, 0.01, x, 0.066, z - 0.06); B(K.dark, DK, 0.05, 0.03, 0.01, x, 0.066, z + 0.06); }
function lamp(x, z, mod) { if (mod) { Y(K.dark, DK, 0.008, 0.012, 0.5, 12, x, 0.33, z, 0, 0, 0, true); B(K.dark, DK, 0.014, 0.014, 0.14, x, 0.58, z + 0.06); B(K.dark, DK, 0.05, 0.02, 0.04, x, 0.575, z + 0.13); B(K.lampG, '#fff1c8', 0.04, 0.006, 0.03, x, 0.563, z + 0.13); }
  else { Y(K.conc, '#bdb8ac', 0.011, 0.015, 0.62, 12, x, 0.39, z, 0, 0, 0, true); B(K.metal, '#c8ccd0', 0.012, 0.012, 0.16, x, 0.7, z + 0.07); B(K.metal, '#c8ccd0', 0.05, 0.022, 0.045, x, 0.695, z + 0.15); B(K.lampG, '#fff1c8', 0.035, 0.006, 0.03, x, 0.682, z + 0.15); } }
function bench(x, z) { B(K.wood, '#9a7a52', 0.18, 0.014, 0.05, x, 0.13, z); B(K.wood, '#9a7a52', 0.18, 0.05, 0.012, x, 0.16, z - 0.025, -0.15, 0, 0); B(K.dark, DK, 0.012, 0.05, 0.05, x - 0.07, 0.105, z); B(K.dark, DK, 0.012, 0.05, 0.05, x + 0.07, 0.105, z); }
function scooter(x, z, hex) { B(K.metal, hex, 0.045, 0.035, 0.11, x, 0.115, z); B(K.dark, DK, 0.04, 0.015, 0.05, x, 0.14, z - 0.015); B(K.dark, DK, 0.06, 0.006, 0.006, x, 0.17, z + 0.045); B(K.dark, DK, 0.008, 0.05, 0.008, x, 0.15, z + 0.045); Y(K.dark, DK, 0.02, 0.02, 0.014, 12, x, 0.1, z - 0.045, 0, 0, PI / 2); Y(K.dark, DK, 0.02, 0.02, 0.014, 12, x, 0.1, z + 0.045, 0, 0, PI / 2); }
function bollard(x, z) { Y(K.dark, DK, 0.01, 0.012, 0.09, 12, x, 0.125, z); }
function antenna(x, y, z) { B(K.dark, DK, 0.006, 0.16, 0.006, x, y + 0.08, z); B(K.dark, DK, 0.08, 0.005, 0.005, x, y + 0.15, z); B(K.dark, DK, 0.06, 0.005, 0.005, x, y + 0.12, z); }
function dish(x, y, z) { Y(K.metal, '#e4e6e8', 0.03, 0.03, 0.006, 12, x, y + 0.06, z, -0.9, 0, 0); B(K.dark, DK, 0.008, 0.06, 0.008, x, y + 0.03, z); }
function lifeguard(x, z) { var i; for (i = 0; i < 4; i++) B(K.wood, '#d8ccb0', 0.014, 0.2, 0.014, x + (i % 2 ? 0.06 : -0.06), 0.16, z + (i < 2 ? -0.05 : 0.05)); B(K.wood, '#d8ccb0', 0.15, 0.012, 0.13, x, 0.265, z); B(K.plas, '#f4f4f0', 0.13, 0.08, 0.01, x, 0.31, z - 0.055); B(K.plas, '#f4f4f0', 0.01, 0.08, 0.11, x - 0.06, 0.31, z); B(K.awn, '#c0392b', 0.17, 0.012, 0.15, x, 0.36, z); B(K.wood, '#d8ccb0', 0.008, 0.24, 0.008, x + 0.03, 0.16, z + 0.1, 0.4, 0, 0); B(K.wood, '#d8ccb0', 0.008, 0.24, 0.008, x - 0.03, 0.16, z + 0.1, 0.4, 0, 0); }
function kiosk(x, z) { B(K.plas, '#e9efe2', 0.24, 0.16, 0.18, x, 0.14, z); PRI(K.plas, '#e9efe2', 0.24, 0.18, 0.06, x, 0.22, z); gable(K.corr, '#8c9094', 0.28, 0.18, 0.06, x, 0.22, z); awning(x, 0.19, z + 0.09, 0.2, '#2f7a5a', 0.07); PB(K.glow, GW, x, 0.13, z + 0.09, 0, 1, 0.004, 0.14, 0.08, 0.006); }
/* ---- 商铺（前排 +z 临路） ---- */
function shop(x, w, h, hex, o) { var z0 = 0.51, d = 0.38, zf = 0.70, y0 = 0.05, nf = Math.round((h - 0.30) / 0.22), f, wy, rt;
  B(K.plas, hex, w, h, d, x, y0 + h / 2, z0); B(K.conc, '#cfcabf', w + 0.02, 0.03, d + 0.02, x, y0 + 0.015, z0);
  PB(K.dark, DK, x, y0 + 0.14, zf, 0, 1, 0.004, w * 0.84, 0.23, 0.008); PB(K.glow, GW, x, y0 + 0.14, zf, 0, 1, 0.01, w * 0.78, 0.2, 0.006);
  PB(K.dark, '#26282a', x + w * 0.28, y0 + 0.13, zf, 0, 1, 0.014, 0.01, 0.2, 0.004); PB(K.dark, '#26282a', x + w * 0.18, y0 + 0.13, zf, 0, 1, 0.014, 0.01, 0.2, 0.004);
  PB(K.conc, SL, x, y0 + 0.015, zf, 0, 1, 0.035, w * 0.9, 0.03, 0.07);
  if (o.awn) awning(x, y0 + 0.265, zf, w * 0.9, o.awn, 0.13);
  SG(o.lit ? K.sgnL : K.sgn, x, y0 + 0.315, zf + 0.012, w * 0.84, 0.07, o.cell);
  if (o.vs !== undefined && nf) { SG(o.lit ? K.sgnL : K.sgn, x + w / 2 - 0.02, y0 + 0.47, zf + 0.05, 0.065, 0.2, o.vs, PI / 2); B(K.dark, DK, 0.01, 0.01, 0.09, x + w / 2 - 0.02, y0 + 0.58, zf + 0.045); }
  for (f = 0; f < nf; f++) { wy = y0 + 0.30 + f * 0.22; PB(K.conc, SL, x, wy, zf, 0, 1, 0.008, w, 0.014, 0.016);
    if (o.balc && f === 0) { balc(x, wy + 0.004, zf, 0, 1, w * 0.5, false); win(x + w * 0.34, wy + 0.12, zf, 0, 1, 0.07, 0.1); }
    else { win(x - w * 0.24, wy + 0.12, zf, 0, 1, 0.08, 0.1); win(x + w * 0.24, wy + 0.12, zf, 0, 1, 0.08, 0.1); }
    if (o.side) win(x + w / 2, wy + 0.12, z0 + 0.06, 1, 0, 0.08, 0.1, { ns: 1, nf: 1 }); }
  rt = y0 + h;
  if (o.gab) { PRI(K.plas, hex, w, d, 0.09, x, rt, z0); gable(K.corr, '#9a9ea2', w + 0.05, d, 0.09, x, rt, z0); }
  else { parapet(x, rt, z0, w, d, hex); if (o.tank) tank(x - w / 2 + 0.09, rt, z0 - 0.08); if (o.ant) antenna(x + w / 2 - 0.05, rt, z0 - 0.1); if (o.rac) B(K.metal, '#d8dbdb', 0.07, 0.05, 0.05, x + w * 0.2, rt + 0.033, z0 - 0.05); if (o.dish) dish(x - w * 0.25, rt, z0 + 0.05);
    if (o.neon) { B(K.neon[o.neon - 1], NB[o.neon - 1], w * 0.62, 0.07, 0.016, x - w * 0.04, rt + 0.075, z0 + d / 2 - 0.035); B(K.dark, DK, 0.008, 0.05, 0.008, x - w * 0.3, rt + 0.03, z0 + d / 2 - 0.035); B(K.dark, DK, 0.008, 0.05, 0.008, x + w * 0.22, rt + 0.03, z0 + d / 2 - 0.035); } } }
/* ---- 旅店（后排） ---- */
function hotel(x, w, o) { var z0 = -0.02, d = 0.56, y0 = 0.05, fh = 0.24, nf = o.nf, h = nf * fh, zf = z0 + d / 2, zb = z0 - d / 2, xr = x + w / 2, f, wy, rt;
  B(K.plas, o.hex, w, h, d, x, y0 + h / 2, z0); B(K.conc, '#cfcabf', w + 0.02, 0.03, d + 0.02, x, y0 + 0.015, z0);
  for (f = 0; f < nf; f++) { wy = y0 + f * fh;
    if (f) PB(K.conc, SL, x, wy, zf, 0, 1, 0.008, w, 0.014, 0.016);
    if (o.band && f) { PB(K.dark, DK, x, wy + 0.13, zf, 0, 1, 0.003, w - 0.04, 0.17, 0.006); PB(K.glass, o.gc || GLC, x, wy + 0.13, zf, 0, 1, 0.007, w - 0.06, 0.15, 0.006);
      for (var m = 1; m < 4; m++) PB(K.dark, DK, x - w / 2 + 0.03 + (w - 0.06) * m / 4, wy + 0.13, zf, 0, 1, 0.012, 0.008, 0.15, 0.004);
      if (f % 2 === 0) balc(x - w * 0.1, wy + 0.004, zf, 0, 1, w * 0.55, true); }
    else if (o.balc && f) { balc(x - w * 0.13, wy + 0.004, zf, 0, 1, w * 0.5, o.gl); win(x + w * 0.33, wy + 0.13, zf, 0, 1, 0.08, 0.12); }
    else if (!f) { win(x - w * 0.26, wy + 0.13, zf, 0, 1, 0.1, 0.14, { g: o.lobby }); win(x + w * 0.26, wy + 0.13, zf, 0, 1, 0.1, 0.14, { g: o.lobby }); }
    else { win(x - w * 0.24, wy + 0.13, zf, 0, 1, 0.1, 0.13); win(x + w * 0.24, wy + 0.13, zf, 0, 1, 0.1, 0.13); }
    win(x - w * 0.22, wy + 0.13, zb, 0, -1, 0.1, 0.12, { ns: 1, nf: 1 }); win(x + w * 0.22, wy + 0.13, zb, 0, -1, 0.1, 0.12, { ns: 1, nf: 1 });
    if (o.side) { win(xr, wy + 0.13, z0 - 0.15, 1, 0, 0.09, 0.12, { ns: 1 }); win(xr, wy + 0.13, z0 + 0.13, 1, 0, 0.09, 0.12, { ns: 1 }); }
    if (o.ac && f) ac(x + w * 0.43, wy + 0.2, zf, 0, 1); }
  rt = y0 + h;
  if (o.roof === 'hip') { HIP(K.tile, o.rf, w + 0.12, d + 0.12, 0.16, 0.3, x, rt, z0); B(K.dark, o.rc || '#7a3a2c', (w + 0.12) * 0.3 + 0.06, 0.024, (d + 0.12) * 0.3 + 0.04, x, rt + 0.17, z0);
    B(K.plas, '#f4f2ee', w + 0.13, 0.022, 0.024, x, rt - 0.006, z0 + d / 2 + 0.048); B(K.plas, '#f4f2ee', w + 0.13, 0.022, 0.024, x, rt - 0.006, z0 - d / 2 - 0.048);
    B(K.plas, '#f4f2ee', 0.024, 0.022, d + 0.13, x + w / 2 + 0.048, rt - 0.006, z0); B(K.plas, '#f4f2ee', 0.024, 0.022, d + 0.13, x - w / 2 - 0.048, rt - 0.006, z0); }
  else if (o.roof === 'gab') { PRI(K.plas, o.hex, w, d, 0.13, x, rt, z0); gable(K.corr, o.rf, w + 0.06, d, 0.13, x, rt, z0); }
  else { parapet(x, rt, z0, w, d, o.hex, o.rf2);
    if (o.bulk) { B(K.plas, o.hex, 0.14, 0.11, 0.14, x - w / 2 + 0.1, rt + 0.055, z0 - d / 2 + 0.1); B(K.conc, SL, 0.15, 0.012, 0.15, x - w / 2 + 0.1, rt + 0.115, z0 - d / 2 + 0.1); }
    if (o.tank) tank(x + w / 2 - 0.1, rt, z0 - 0.14);
    if (o.solar) { solar(x - 0.05, rt, z0 + 0.05, 0.18, 0.14); solar(x - 0.05, rt, z0 - 0.12, 0.18, 0.14); }
    if (o.ant) antenna(x + w / 2 - 0.06, rt, z0 + 0.15); if (o.dish) dish(x - w / 2 + 0.08, rt, z0 + 0.12);
    if (o.perg) { pergola(x, rt, z0 + 0.02, w - 0.1, d - 0.16); planter(x, rt, z0 - d / 2 + 0.07, w - 0.16, 0.07, 1); B(K.wood, '#7a5a3a', 0.2, 0.06, 0.06, x - 0.02, rt + 0.03, z0 + 0.16); Y(K.metal, '#e8e8e4', 0.035, 0.035, 0.008, 12, x + 0.14, rt + 0.085, z0 + 0.16); Y(K.dark, DK, 0.006, 0.006, 0.075, 12, x + 0.14, rt + 0.042, z0 + 0.16, 0, 0, 0, true); }
    if (o.garden) { planter(x, rt, z0 - d / 2 + 0.07, w - 0.14, 0.08, 3); planter(x + w / 2 - 0.07, rt, z0, 0.07, d - 0.2, 4); umbrella(x - 0.08, rt, z0 + 0.12, '#f0ede4'); Y(K.metal, '#e8e8e4', 0.035, 0.035, 0.008, 12, x - 0.08, rt + 0.09, z0 + 0.12); Y(K.dark, DK, 0.006, 0.006, 0.08, 12, x - 0.08, rt + 0.045, z0 + 0.12, 0, 0, 0, true); } } }
/* ---- 玻璃转角楼（lv3 圆角咖啡楼 / lv4 深色幕墙精品楼） ---- */
function cafe(x, w, lv) { var z0 = 0.51, d = 0.38, y0 = 0.05, r = d / 2, nf = lv === 3 ? 3 : 4, fh = 0.24, h = nf * fh, bw = w - r, bx = x - r / 2, cx = x + w / 2 - r, f, y, i,
    wc = lv === 3 ? '#f2f4f2' : '#eaece9', gc = lv === 3 ? '#a9d2e0' : '#6c8798', ac2 = lv === 3 ? '#3f80bd' : '#dedfdc', mc = lv === 3 ? '#e4e8e8' : '#eef0ee', rt;
  B(K.conc, '#cfcabf', w + 0.02, 0.03, d + 0.02, x, y0 + 0.015, z0);
  for (f = 0; f < nf; f++) { y = y0 + f * fh;
    B(K.plas, wc, bw, fh * 0.3, d, bx, y + fh * 0.15, z0); A2(K.plas, wc, new THREE.CylinderGeometry(r, r, fh * 0.3, 16, 1, false, 0, PI), cx, y + fh * 0.15, z0);
    B(K.glass, gc, bw, fh * 0.7, d - 0.006, bx, y + fh * 0.65, z0); A2(K.glass, gc, new THREE.CylinderGeometry(r - 0.003, r - 0.003, fh * 0.7, 16, 1, false, 0, PI), cx, y + fh * 0.65, z0);
    B(K.conc, ac2, bw + 0.02, 0.02, d + 0.02, bx, y + fh, z0); A2(K.conc, ac2, new THREE.CylinderGeometry(r + 0.01, r + 0.01, 0.02, 16, 1, false, 0, PI), cx, y + fh, z0);
    for (i = 0; i < 4; i++) B(K.dark, mc, 0.008, fh * 0.7, 0.008, bx - bw / 2 + 0.02 + (bw - 0.04) * i / 3, y + fh * 0.65, z0 + d / 2 + 0.002); }
  PB(K.glow, GW, bx, y0 + 0.14, z0 + d / 2, 0, 1, 0.003, bw - 0.06, 0.16, 0.004);
  rt = y0 + h;
  if (lv === 3) { B(K.conc, ac2, bw + 0.04, 0.035, d + 0.04, bx, rt + 0.017, z0); A2(K.conc, ac2, new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.035, 16), cx, rt + 0.017, z0); umbrella(bx, rt + 0.035, z0, '#f0ede4'); Y(K.metal, '#e8e8e4', 0.035, 0.035, 0.008, 12, bx, rt + 0.12, z0); Y(K.dark, DK, 0.006, 0.006, 0.08, 12, bx, rt + 0.075, z0, 0, 0, 0, true); }
  else { B(K.plas, wc, bw + 0.03, 0.035, d + 0.03, bx, rt + 0.017, z0); A2(K.plas, wc, new THREE.CylinderGeometry(r + 0.015, r + 0.015, 0.035, 16), cx, rt + 0.017, z0); pergola(bx - 0.02, rt + 0.035, z0, bw - 0.08, d - 0.1); planter(bx, rt + 0.035, z0 + d / 2 - 0.05, bw - 0.1, 0.06, 5); } }
/* ---- 地面（z −1.28..1.28 街带） ---- */
function ground(lv) { var i, SEA = [['#a6d3cf', '#82c1c6', '#66afbd'], ['#93d6d7', '#5fc4d2', '#3fb0c8'], ['#88e0e0', '#3fcbd9', '#1fb0cc'], ['#8ce6e4', '#36cddc', '#149fc8']][lv - 1];
  B(K.conc, '#a09c93', 2.56, 0.05, 2.56, 0, 0.025, 0);
  B(K.asph, '#4a4c4f', 2.56, 0.012, 0.33, 0, 0.056, 1.115);
  for (i = -1.2; i <= 1.21; i += 0.3) B(K.asph, lv > 1 ? '#e6e6de' : '#b4b2a8', 0.15, 0.004, 0.02, i, 0.064, 1.115);
  B(K.asph, '#dedcd2', 2.56, 0.004, 0.014, 0, 0.064, 1.262); B(K.asph, '#dedcd2', 2.56, 0.004, 0.014, 0, 0.064, 0.968);
  if (lv > 1) for (i = 0; i < 6; i++) B(K.asph, '#e6e6de', 0.035, 0.004, 0.27, 0.9 + i * 0.06, 0.064, 1.115);
  B(K.conc, '#cbc6bb', 2.56, 0.032, 0.03, 0, 0.066, 0.955);
  B(K.walk, '#b8b1a0', 2.56, 0.03, 0.25, 0, 0.066, 0.825);
  B(K.walk, '#a9a292', 2.56, 0.016, 0.06, 0, 0.058, 0.29);
  B(K.gras, '#6f8a3f', 2.56, 0.012, 0.36, 0, 0.056, -0.5);
  B(K.sand, '#e6d8a8', 2.56, 0.012, 0.38, 0, 0.056, -0.87); B(K.sand, '#cdbd8c', 2.56, 0.013, 0.04, 0, 0.0565, -1.08);
  B(K.sea, SEA[0], 2.56, 0.012, 0.07, 0, 0.056, -1.135); B(K.sea, SEA[1], 2.56, 0.012, 0.07, 0, 0.056, -1.205); B(K.sea, SEA[2], 2.56, 0.012, 0.04, 0, 0.056, -1.26);
  B(K.sea, '#f2fbf8', 2.56, 0.013, 0.014, 0, 0.058, -1.105); if (lv >= 3) { B(K.sea, '#e6f6f2', 2.56, 0.013, 0.01, 0, 0.058, -1.19); for (i = 0; i < 3; i++) B(K.sea, '#eef9f7', 0.26, 0.013, 0.007, -0.8 + i * 0.85, 0.058, -1.235 + (i % 2) * 0.02); }
  B(K.conc, '#cfc9bc', 2.56, 0.014, 0.06, 0, 0.057, -0.69);
  for (i = 0; i < 3; i++) B(K.dark, '#2e2e2e', 0.06, 0.003, 0.025, -0.9 + i * 0.85, 0.0635, 0.985); Y(K.dark, '#3a3a3a', 0.035, 0.035, 0.003, 12, 0.3, 0.0635, 1.06);
  if (lv < 4) { B(K.walk, '#c8c0ae', 0.2, 0.014, 1.0, 1.16, 0.057, 0.2); B(K.sand, '#e0d2a0', 0.16, 0.013, 0.36, 1.16, 0.0565, -0.5); }
  else { B(K.wood, '#a8845a', 0.18, 0.014, 1.38, 1.16, 0.057, 0.01); B(K.wood, '#a8845a', 0.5, 0.014, 0.16, 0.98, 0.057, -0.74); } }
/* ---- 垦丁大街四年代 ---- */
function build(level) {
  var lv = level, g = new THREE.Group(); g.name = 'prop_39_lv' + lv; g.userData.kind = 'property'; g.userData.propIdx = 39; g.userData.level = lv;
  var hot = g.userData.hotM = {}, i, p, s; BK = {};
  K = { asph: BKT(0.95, 0, '', 0, 'asph', 1.0), walk: BKT(0.92, 0, '', 0, 'pave', 0.5), sand: BKT(0.95, 0, '', 0, 'sand', 0.8), sea: BKT(0.12, 0.3, '', 0, 'sea', 1.3), gras: BKT(0.95, 0, '', 0, 'gras', 0.6),
    plas: BKT(0.85, 0, '', 0, 'plas', 1.0), tile: BKT(0.8, 0, '', 0, 'tile', 0.4), corr: BKT(0.5, 0.45, '', 0, 'corr', 0.35), glass: BKT(0.18, 0.3, '', 0, 'glas', 0.5), dark: BKT(0.55, 0.5), metal: BKT(0.4, 0.65),
    wood: BKT(0.75, 0, '', 0, 'wood', 0.4), bark: BKT(0.9, 0, '', 0, 'bark', 0.3), leaf: BKT(0.9, 0, '', 0, 'leaf', 0.35, true), awn: BKT(0.9, 0, '', 0, 'awn', 0.4), glow: BKT(0.5, 0, '#ffc06a', 0.5, 'lbox', 0.3),
    sola: BKT(0.3, 0.5, '', 0, 'sola', 0.25), sgn: BKT(0.5, 0, '', 0, 'sgn', 1, false, true), sgnL: BKT(0.5, 0, '#ffffff', 0.35, 'sgn', 1, false, true), lampG: BKT(0.5, 0, '#ffd27a', 0.6),
    neon: [BKT(0.5, 0, NE[0], 0.95, 'neon', 0.3), BKT(0.5, 0, NE[1], 0.9, 'neon', 0.3), BKT(0.5, 0, NE[2], 0.9, 'neon', 0.3)] };
  K.conc = K.asph;
  ground(lv);
  /* 前排商铺 */
  var SX = [-1.06, -0.68, -0.31, 0.06, 0.44, 0.82], SW = [0.4, 0.36, 0.38, 0.36, 0.4, 0.36],
    SHh = [[0.52, 0.3, 0.52, 0.52, 0.3, 0.52], [0.52, 0.52, 0.52, 0.74, 0.52, 0.52], [0.74, 0.52, 0.74, 0.74, 0, 0.52], [0.74, 0.74, 0.74, 0.74, 0, 0.52]][lv - 1],
    SCc = [['#efe6cf', '#e7d9c5', '#d9e2e6', '#efe8d4', '#e8e4d8', '#e2e8d8'], ['#f5e7c4', '#f0d2c2', '#cfe1ea', '#f7ecd0', '#ece7da', '#d9e8d0'], ['#f6efe0', '#f3dcd0', '#d2e4ec', '#f8f0dc', '#eeeae0', '#dcebd6'], ['#f6efe0', '#f3dcd0', '#d2e4ec', '#f8f0dc', '#eeeae0', '#dcebd6']][lv - 1],
    AWc = [[0, '#b48a6a', 0, '#7f95a8', '#c4b07a', 0], ['#c0392b', '#2f6fb0', '#e0b12e', '#c0392b', '#2f7a5a', '#e76f51'], ['#c0392b', '#2f6fb0', '#e0b12e', '#c0392b', 0, '#e76f51'], ['#b83227', '#2b64a3', '#e0b12e', '#b83227', 0, '#e76f51']][lv - 1],
    SO = [[{ ant: 1 }, { gab: 1 }, {}, { tank: 1 }, { gab: 1 }, { ant: 1 }],
      [{ tank: 1, rac: 1 }, { vs: 8, balc: 1 }, { ant: 1 }, { tank: 1, balc: 1 }, { dish: 1 }, { rac: 1 }],
      [{ neon: 1, tank: 1, lit: 1 }, { vs: 8, balc: 1, lit: 1 }, { neon: 2, lit: 1 }, { vs: 9, balc: 1, tank: 1, lit: 1 }, 0, { neon: 3, lit: 1, rac: 1 }],
      [{ neon: 1, tank: 1, lit: 1 }, { vs: 8, balc: 1, lit: 1 }, { neon: 2, lit: 1 }, { vs: 9, balc: 1, tank: 1, lit: 1 }, 0, { neon: 3, lit: 1, rac: 1 }]][lv - 1];
  for (i = 0; i < 6; i++) { if (!SHh[i]) { cafe(SX[i], SW[i], lv); continue; } var o = SO[i]; o.awn = AWc[i]; o.cell = i; o.side = i === 5 ? 1 : 0; shop(SX[i], SW[i], SHh[i], SCc[i], o); }
  /* 后排旅店 */
  var HX = [-1.0, -0.53, -0.06, 0.42, 0.86], HW = [0.46, 0.44, 0.44, 0.44, 0.38], HC = ['#f4f2ea', '#efe9dc', '#f6f4ee', '#ece6d8', '#f2efe6'],
    HO = [[{ nf: 3, roof: 'hip', rf: '#b8503a' }, { nf: 2, roof: 'gab', rf: '#9a9ea2' }, { nf: 2, roof: 'flat', ant: 1 }, { nf: 2, roof: 'hip', rf: '#9aa0a4', rc: '#6a6e72' }, { nf: 1, roof: 'gab', rf: '#a8aaac', side: 1 }],
      [{ nf: 4, roof: 'flat', tank: 1, bulk: 1, balc: 1 }, { nf: 3, roof: 'flat', tank: 1, balc: 1, ac: 1, rf2: '#7f9a86' }, { nf: 3, roof: 'flat', dish: 1, ant: 1 }, { nf: 2, roof: 'hip', rf: '#9aa0a4', rc: '#6a6e72' }, { nf: 2, roof: 'flat', side: 1, tank: 1, rf2: '#7f9a86' }],
      [{ nf: 5, roof: 'flat', tank: 1, bulk: 1, balc: 1, gl: 1, lobby: 1 }, { nf: 4, roof: 'flat', balc: 1, gl: 1, tank: 1, ac: 1, rf2: '#7f9a86' }, { nf: 4, roof: 'flat', balc: 1, bulk: 1, lobby: 1 }, { nf: 3, roof: 'flat', solar: 1, rf2: '#7f9a86' }, { nf: 2, roof: 'flat', side: 1, garden: 1 }],
      [{ nf: 6, roof: 'flat', band: 1, perg: 1, lobby: 1, gc: '#c2dbe4' }, { nf: 5, roof: 'flat', balc: 1, gl: 1, perg: 1, lobby: 1, gc: '#c2dbe4' }, { nf: 4, roof: 'flat', balc: 1, gl: 1, garden: 1, lobby: 1 }, { nf: 3, roof: 'flat', solar: 1, tank: 1, rf2: '#7f9a86' }, { nf: 2, roof: 'flat', side: 1, garden: 1 }]][lv - 1];
  for (i = 0; i < 5; i++) { HO[i].hex = lv === 1 && i === 1 ? '#efe4bf' : HC[i]; hotel(HX[i], HW[i], HO[i]); }
  /* 棕榈（行道 / 椰林 / 沙滩 / 右端幼株） */
  var SPp = [[-0.9, 0.86, 1.0, 11], [0.25, 0.86, 1.05, 12], [-0.35, 0.86, 0.95, 13], [0.82, 0.86, 1.0, 14]], nS = [2, 3, 4, 4][lv - 1],
    GPp = [[-0.9, -0.5, 1.0, 21], [0.05, -0.55, 1.15, 22], [0.7, -0.45, 1.05, 23], [-0.45, -0.42, 1.0, 24], [0.4, -0.62, 1.1, 25], [0.92, -0.4, 0.9, 26], [-0.62, -0.65, 0.9, 27]], nG = [3, 4, 5, 7][lv - 1],
    BPp = [[1.0, -0.86, 0.9, 31], [-0.75, -0.8, 0.9, 32], [0.3, -0.9, 0.85, 33]], nB = [1, 2, 3, 3][lv - 1],
    RPp = [[1.16, 0.12, 0.4, 41], [1.17, -0.2, 0.42, 42]], nR = [0, 1, 2, 2][lv - 1];
  for (i = 0; i < nS; i++) { p = SPp[i]; B(K.dark, '#4a4438', 0.1, 0.004, 0.1, p[0], 0.083, p[1]); palm(p[0], p[1], p[2], p[3], 1); }
  for (i = 0; i < nG; i++) { p = GPp[i]; palm(p[0], p[1], p[2], p[3], -1); }
  for (i = 0; i < nB; i++) { p = BPp[i]; palm(p[0], p[1], p[2], p[3], -1); }
  for (i = 0; i < nR; i++) { p = RPp[i]; palm(p[0], p[1], p[2], p[3], -1); }
  /* 沙滩戏水 */
  var UM = [[-0.35, -0.88, '#2f6fb0'], [0.55, -0.9, '#d9a52a'], [-0.9, -0.92, '#c0392b'], [0.1, -0.95, '#2f7a5a'], [0.78, -0.8, '#e76f51']], nU = [1, 3, 4, 5][lv - 1],
    LG = [[-0.27, -0.83], [-0.43, -0.83], [0.47, -0.85], [0.63, -0.85], [0.02, -0.9], [0.18, -0.9]], nL = [0, 2, 4, 6][lv - 1];
  for (i = 0; i < nU; i++) umbrella(UM[i][0], 0.062, UM[i][1], UM[i][2]);
  for (i = 0; i < nL; i++) lounger(LG[i][0], LG[i][1], i % 2 ? '#e8e2d0' : '#d8dee6');
  if (lv >= 3) lifeguard(0.75, -1.0);
  if (lv <= 2) kiosk(1.14, -0.7);
  if (lv >= 2) tree(-1.15, -0.45, 1.0); if (lv >= 3) tree(0.22, -0.42, 0.85);
  /* 灌木 */
  var SHp = [[-1.15, -0.4, 0.05], [-0.2, -0.66, 0.05], [1.05, -0.58, 0.055], [-1.2, -0.62, 0.05], [0.6, -0.66, 0.045], [-0.75, -0.36, 0.05]], nSh = [2, 3, 5, 6][lv - 1];
  for (i = 0; i < nSh; i++) shrub(SHp[i][0], 0.062 + SHp[i][2] * 0.5, SHp[i][1], SHp[i][2], i % 2 ? LF : LF2, 1.3, 0.8, 1);
  if (lv >= 2) { shrub(-0.35, 0.095, -0.64, 0.042, LF, 3.0, 0.9, 1); shrub(0.58, 0.095, -0.64, 0.042, LF2, 3.0, 0.9, 1); }
  /* 街道家具 */
  if (lv === 1) { lamp(-0.62, 0.92, false); lamp(0.55, 0.92, false); }
  else { lamp(-1.1, 0.92, true); lamp(-0.08, 0.92, true); lamp(0.55, 0.92, true); }
  if (lv >= 2) { scooter(-0.78, 0.92, '#c0392b'); scooter(-0.72, 0.92, '#2c3e50'); scooter(0.45, 0.92, '#e8e8e4'); bench(-0.05, 0.78); Y(K.metal, '#9a9ea2', 0.02, 0.018, 0.07, 12, 0.95, 0.115, 0.9);
    Y(K.dark, DK, 0.005, 0.005, 0.2, 12, 1.22, 0.18, 0.93, 0, 0, 0, true); B(K.metal, '#2f6fb0', 0.05, 0.05, 0.006, 1.22, 0.29, 0.93); }
  if (lv >= 3) { planter(-0.62, 0.081, 0.78, 0.14, 0.07, 3); planter(0.62, 0.081, 0.78, 0.14, 0.07, 4); bollard(-0.5, 0.94); bollard(-0.2, 0.94); bollard(0.1, 0.94); bollard(0.4, 0.94);
    for (i = 0; i < 2; i++) { var tx = 0.36 + i * 0.16; Y(K.metal, '#e8e8e4', 0.035, 0.035, 0.008, 12, tx, 0.17, 0.8); Y(K.dark, DK, 0.006, 0.006, 0.09, 12, tx, 0.125, 0.8, 0, 0, 0, true); }
    umbrella(0.44, 0.081, 0.8, '#f0ede4'); }
  /* 招牌 */
  if (lv >= 3) { var sg = signMesh('墾丁大街', lv === 4 ? 0.42 : 0.36, lv === 4 ? 0.14 : 0.11, 0.03, '#2a1a10', '#ffb060', 0.85);
    if (lv === 4) sg.position.set(HX[0], 0.05 + 5 * 0.24 + 0.125, 0.29);
    else { sg.position.set(HX[0], 1.34, 0.22); B(K.dark, DK, 0.01, 0.1, 0.01, HX[0] - 0.14, 1.28, 0.22); B(K.dark, DK, 0.01, 0.1, 0.01, HX[0] + 0.14, 1.28, 0.22); }
    g.add(sg); hot.sign = sg.material; }
  flush(g, hot);
  var seaT = TEX.sea();
  g.userData.anim = [function (t) { var m = hot['#ffc06a']; if (m) m.emissiveIntensity = 0.4 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.4)); seaT.offset.x = (t * 0.015) % 1; seaT.offset.y = (t * 0.01) % 1; }];
  if (lv >= 3) g.userData.anim.push(function (t) { var s = 0.5 + 0.5 * Math.sin(t * 1.2), n, m;
    for (n = 0; n < 3; n++) if ((m = hot[NE[n]])) m.emissiveIntensity = 0.55 + 0.4 * (0.5 + 0.5 * Math.sin(t * (1.1 + n * 0.5)));
    if (hot.sign) hot.sign.emissiveIntensity = 0.55 + 0.35 * s; if ((m = hot['#ffffff'])) m.emissiveIntensity = 0.25 + 0.15 * s; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[39] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
