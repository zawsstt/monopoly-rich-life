/* 大富翁·现代写实棋盘 格 10「上下九」—— 广州骑楼连廊街四年代（1990s→2020s）· v2 材质精修
 * 视觉真源 refs/modern/prop_10.png（左上 1990s / 右上 2000s / 左下 2010s / 右下 2020s）。年代差异：lv1 风化灰白立面+屋顶乱搭水箱+褪色招牌+稀疏路灯；
 *   lv2 +彩色竖招牌/红黄漆面/彩钢屋顶/红砖廊地；lv3 立面翻新米白+屋顶绿化+暗玻璃塔+暖光橱窗/廊内暖灯；lv4 +LED 巨幕/屋顶玻璃亭+花园/立面泛光/满街树灯。
 * v2 材质工艺（对标 specials3d/tile29_water.js）：Canvas 多层化（基色晕染+噪点/风化+分缝线+高光，128px，顶点色承载主色调、贴图承载细节）；
 *   boxUV 按世界尺寸烘焙（主法线轴投影，ws=每重复米数）；材质分区：玻璃 rough0.15/metal0.7（窗棂贴图）、铜绿穹顶 metal0.55、招牌漆面 rough0.6、
 *   彩钢 rough0.7/metal0.3；发光件（橱窗/廊灯/路灯/LED）每实例新建独立材质 + 呼吸/脉动动画。立面加密（剪影不变）：3 窗/开间+窗台/过梁+层间线脚+檐下齿饰+柱头柱础。
 * 契约：window.Props3DModern[10](level 1..4) → 全新 Group；占地 ≤2.6×2.6、底面 y=0、正面 +z（街道在前）；每级 mesh ≤55（合并 BufferGeometry，v2 增量 +0）；
 *   零 Math.random（种子 LCG）；动画 2 项（LED/霓虹脉动 / 骑楼暖光呼吸）。骑楼柱廊 = 灵魂：7 柱连廊 + 转角穹顶塔楼。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') return;
var PI = Math.PI, S = Math.sin, Co = Math.cos, _PC = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function RG(s) { s = (s >>> 0) || 1010; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
/* ---------- Canvas 多层纹理（128px；基色晕染+噪点/风化+分缝+高光；模块级缓存，材质每实例新建） ---------- */
var _TXC = {};
function TX(id, ws, draw) {
  if (_TXC[id]) return _TXC[id];
  var cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; draw(cv.getContext('2d'), 128, 128, RG(id.charCodeAt(2) * 131 + (ws * 10) | 0));
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return _TXC[id] = { t: t, ws: ws };
}
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,' + a + ')' : 'rgba(22,20,16,' + a + ')'; g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); } }
var TEX = {
  stuc: TX('t10stuc', 1.5, function (g, w, h, R) { g.fillStyle = '#f6f2ea'; g.fillRect(0, 0, w, h); var i, x0;   /* 灰泥立面：雨渍+裂纹+底部泛潮+噪点 */
    for (i = 0; i < 10; i++) { g.fillStyle = 'rgba(118,108,90,' + (0.05 + R() * 0.08).toFixed(2) + ')'; g.fillRect(R() * w, R() * 24, 2 + R() * 6, 30 + R() * 90); }
    for (i = 0; i < 5; i++) { x0 = R() * w; g.strokeStyle = 'rgba(100,92,76,0.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 18, h); g.stroke(); } g.fillStyle = 'rgba(80,74,60,0.12)'; g.fillRect(0, 104, w, 24); SPK(g, w, h, 140, 0.05, R); }),
  ash: TX('t10ash', 1.0, function (g, w, h, R) { g.fillStyle = '#f1efe8'; g.fillRect(0, 0, w, h); var x, y;      /* 麻石：错缝分块+块面色差+噪点（铺装换 ws 复用） */
    for (y = 0; y < h; y += 32) { g.fillStyle = 'rgba(92,88,74,0.5)'; g.fillRect(0, y, w, 2); var o = (y / 32) % 2 ? 32 : 0;
      for (x = o; x < w; x += 64) { g.fillStyle = 'rgba(92,88,74,0.4)'; g.fillRect(x, y, 2, 32); g.fillStyle = R() > 0.5 ? 'rgba(255,255,250,0.10)' : 'rgba(70,64,52,0.10)'; g.fillRect(x + 3, y + 3, 60, 27); } } SPK(g, w, h, 90, 0.06, R); }),
  glass: TX('t10glass', 0.22, function (g, w, h, R) { g.fillStyle = '#e6edf3'; g.fillRect(0, 0, w, h); var i;     /* 玻璃：窗棂十字+斜向反光带+暗角 */
    g.fillStyle = 'rgba(40,46,54,0.55)'; g.fillRect(62, 0, 4, h); g.fillRect(0, 62, w, 4); g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h);
    for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,255,255,0.30)'; g.fillRect(i * 9, 118 - i * 9, 9, 16); } g.fillStyle = 'rgba(30,36,44,0.18)'; g.fillRect(0, 96, w, 32); SPK(g, w, h, 20, 0.04, R); }),
  sign: TX('t10sign', 0.5, function (g, w, h, R) { g.fillStyle = '#f8f0ea'; g.fillRect(0, 0, w, h); var x, y;    /* 招牌漆面：竖向木纹+金字行带+边框 */
    for (x = 0; x < w; x += 8) { g.fillStyle = 'rgba(70,20,10,0.22)'; g.fillRect(x, 0, 1, h); } for (y = 8; y < h; y += 30) { g.fillStyle = 'rgba(255,240,200,0.5)'; g.fillRect(14, y, w - 28, 14); }
    g.fillStyle = 'rgba(60,20,10,0.45)'; g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h); SPK(g, w, h, 30, 0.05, R); }),
  corr: TX('t10corr', 0.55, function (g, w, h, R) { g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, w, h); var x;      /* 彩钢瓦：波纹明暗条+锈斑 */
    for (x = 0; x < w; x += 6) { g.fillStyle = 'rgba(30,30,34,0.35)'; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(x + 3, 0, 1, h); }
    for (x = 0; x < 6; x++) { g.fillStyle = 'rgba(120,60,20,0.2)'; g.fillRect(R() * w, R() * h, 4 + R() * 10, 2 + R() * 6); } }),
  pat: TX('t10pat', 0.9, function (g, w, h, R) { g.fillStyle = '#eef3ee'; g.fillRect(0, 0, w, h); var i;         /* 铜绿：竖向流痕+斑块+高光 */
    for (i = 0; i < 12; i++) { g.fillStyle = 'rgba(40,90,70,' + (0.12 + R() * 0.2).toFixed(2) + ')'; g.fillRect(R() * w, 0, 2 + R() * 5, 40 + R() * 88); }
    for (i = 0; i < 16; i++) { g.fillStyle = i % 2 ? 'rgba(20,40,30,0.25)' : 'rgba(255,255,255,0.3)'; g.fillRect(R() * w, R() * h, 3 + R() * 8, 2 + R() * 5); } }),
  leaf: TX('t10leaf', 0.65, function (g, w, h, R) { g.fillStyle = '#f0f6e6'; g.fillRect(0, 0, w, h); var i;      /* 树冠：明暗叶斑 */
    for (i = 0; i < 34; i++) { g.fillStyle = i % 2 ? 'rgba(34,66,24,0.28)' : 'rgba(255,255,240,0.30)'; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } }),
  glow: TX('t10glow', 0.3, function (g, w, h, R) { g.fillStyle = '#fff8ee'; g.fillRect(0, 0, w, h); var i;       /* 暖窗：细窗棂格 */
    for (i = 0; i < w; i += 32) { g.fillStyle = 'rgba(90,50,20,0.35)'; g.fillRect(i, 0, 3, h); g.fillRect(0, i, w, 3); } SPK(g, w, h, 10, 0.03, R); })
};
/* ---------- 合并几何核心：桶 = 材质参数；三角形追加（顶点色）+ boxUV（主法线轴投影 × ws） ---------- */
function B(f, r, mt, em, ei, tex, ws) { var k = r + '|' + (mt || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (tex || '') + '|' + (ws || 0); return f.b[k] || (f.b[k] = { k: k, p: [], n: [], u: [], c: [], i: [], nv: 0, ws: ws || 1 }); }
function TRI(u, a, b, c, col) {
  var e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2], e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
  var nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x, l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
  nx /= l; ny /= l; nz /= l; var s = u.nv, iv = 1 / u.ws, ax = nx < 0 ? -nx : nx, ay = ny < 0 ? -ny : ny, az = nz < 0 ? -nz : nz;
  function UV(p) { if (ay >= ax && ay >= az) u.u.push(p[0] * iv, p[2] * iv); else if (ax >= az) u.u.push(p[2] * iv, p[1] * iv); else u.u.push(p[0] * iv, p[1] * iv); }
  UV(a); UV(b); UV(c);
  u.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); u.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz);
  u.c.push(col[0], col[1], col[2], col[0], col[1], col[2], col[0], col[1], col[2]); u.i.push(s, s + 1, s + 2); u.nv = s + 3;
}
function QAD(u, a, b, c, d, col) { TRI(u, a, b, c, col); TRI(u, a, c, d, col); }
function BX(u, w, h, d, x, y, z, col, ry) {                       /* 盒（y=中心，可绕 y 偏转） */
  var ca = Co(ry || 0), sa = S(ry || 0), y0 = y - h / 2, y1 = y + h / 2;
  function P(lx, lz, ly) { return [x + lx * ca + lz * sa, ly, z - lx * sa + lz * ca]; }
  var A = P(-w / 2, d / 2, y0), Bb = P(w / 2, d / 2, y0), Cc = P(w / 2, d / 2, y1), D = P(-w / 2, d / 2, y1);
  var E = P(-w / 2, -d / 2, y0), F = P(w / 2, -d / 2, y0), G = P(w / 2, -d / 2, y1), H = P(-w / 2, -d / 2, y1);
  QAD(u, A, Bb, Cc, D, col); QAD(u, F, E, H, G, col); QAD(u, Bb, F, G, Cc, col); QAD(u, E, A, D, H, col); QAD(u, D, Cc, G, H, col); QAD(u, E, F, Bb, A, col);
}
function CY(u, n, rt, rb, y0, y1, x, z, col) {                    /* 棱柱/圆锥（rt=0 为锥） */
  for (var i = 0; i < n; i++) {
    var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI, c0 = Co(a0), s0 = S(a0), c1 = Co(a1), s1 = S(a1);
    QAD(u, [x + c0 * rb, y0, z + s0 * rb], [x + c1 * rb, y0, z + s1 * rb], [x + c1 * rt, y1, z + s1 * rt], [x + c0 * rt, y1, z + s0 * rt], col);
    if (rt > 0.004) TRI(u, [x, y1, z], [x + c0 * rt, y1, z + s0 * rt], [x + c1 * rt, y1, z + s1 * rt], col);
  }
}
function SP(u, n, r, x, y, z, col, half) {                       /* 低模球 / 半球穹顶 */
  var R = half ? 2 : 3, base = half ? 0 : -PI / 2, span = half ? PI / 2 : PI;
  for (var j = 0; j < R; j++) {
    var p0 = base + j / R * span, p1 = base + (j + 1) / R * span, w0 = Co(p0) * r, w1 = Co(p1) * r, y0 = y + S(p0) * r, y1 = y + S(p1) * r;
    for (var i = 0; i < n; i++) {
      var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI;
      QAD(u, [x + Co(a0) * w0, y0, z + S(a0) * w0], [x + Co(a1) * w0, y0, z + S(a1) * w0], [x + Co(a1) * w1, y1, z + S(a1) * w1], [x + Co(a0) * w1, y1, z + S(a0) * w1], col);
    }
  }
}
function TR(f, x, z, s) { BX(f.U, 0.045 * s, 0.24 * s, 0.045 * s, x, 0.1 + 0.12 * s, z, V('#6a4e30')); SP(f.N, 6, 0.12 * s, x, 0.1 + 0.3 * s, z, V('#5f7f3d')); SP(f.NL, 6, 0.08 * s, x + 0.05 * s, 0.1 + 0.37 * s, z + 0.03 * s, V('#7a9a4e')); }
function PL(f, x, z, w) { BX(f.S, w, 0.08, 0.14, x, 0.14, z, V(P.stone)); SP(f.N, 6, 0.065, x, 0.22, z, V('#5f7f3d')); if (w > 0.3) SP(f.NL, 6, 0.05, x + w * 0.3, 0.21, z, V('#7a9a4e')); }
function LP(f, x, z, lit) {                                       /* 黑铁双臂路灯 */
  var ir = V(P.iron); CY(f.I, 6, 0.012, 0.018, 0.1, 0.62, x, z, ir); BX(f.I, 0.2, 0.014, 0.014, x, 0.6, z, ir);
  for (var k = -1; k <= 1; k += 2) BX(lit ? f.WG : f.I, 0.05, 0.045, 0.045, x + k * 0.1, 0.585, z, lit ? V(P.warm) : ir);
}
function VSIGN(txt, w, h, bg, fg) {                               /* 竖排招牌 Canvas 96×256 */
  var cv = document.createElement('canvas'); cv.width = 96; cv.height = 256; var g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 96, 256); g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(6, 6, 84, 244);
  g.fillStyle = fg; g.font = 'bold 60px "Microsoft YaHei","SimHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (var i = 0; i < txt.length; i++) g.fillText(txt[i], 48, 48 + i * 80);
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: C(fg), emissiveMap: t, emissiveIntensity: 0.35 }));
}
function BUILD(f, g) {
  for (var k in f.b) {
    var u = f.b[k]; if (!u.nv) continue;
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(u.p, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(u.n, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(u.u, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(u.c, 3)); geo.setIndex(u.i);
    var a = k.split('|'), m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: +a[0], metalness: +a[1], flatShading: true, side: THREE.DoubleSide });
    if (a[2]) { m.emissive = C(a[2]); m.emissiveIntensity = +a[3]; g.userData.hotM[a[2]] = m; }
    if (a[4] && TEX[a[4]]) m.map = TEX[a[4]].t;
    var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
/* ---------- 色板（采样自参考图；贴图桶的顶点色=主色调，Canvas 承载细节） ---------- */
var P = { cream: '#e6dfcd', creamD: '#d4cbb5', grey: '#bdb7aa', greyD: '#9a9387', tintY: '#d9bf8a', tintR: '#b05a42', stone: '#b5ae9f', pave: '#bfb8a8', paveD: '#a09889',
  dark: '#2b2723', glass: '#8ea6ba', glassD: '#33404c', copper: '#4a443c', roof: '#6b665e', signR: '#b43226', signG: '#d9a848', signB: '#3f6a9c', warm: '#ffd28a',
  ledC: '#3ec8e6', ledM: '#d24ad2', red: '#9e3626', iron: '#2a2a2c', faded: '#a89a80' };
function make10(level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), f = { b: {} }, g = new THREE.Group(), R = RG(100 + lv), i, k, p;
  g.name = 'prop_10_modern_lv' + lv; g.userData = { kind: 'property', propIdx: 10, level: lv, hotM: {} };
  f.S = B(f, 0.9, 0, '', 0, 'ash', 1.0); f.P = B(f, 0.95, 0, '', 0, 'ash', 1.5); f.W = B(f, 0.85, 0, '', 0, 'stuc', 1.5); f.WD = B(f, 0.86, 0, '', 0, 'stuc', 1.5); f.D = B(f, 0.96);
  f.X = B(f, 0.15, 0.7, '', 0, 'glass', 0.3); f.XD = B(f, 0.15, 0.7, '', 0, 'glass', 0.22); f.N = B(f, 0.92, 0, '', 0, 'leaf', 0.65); f.NL = B(f, 0.91, 0, '', 0, 'leaf', 0.5);
  f.U = B(f, 0.89); f.I = B(f, 0.6, 0.4); f.CP = B(f, 0.45, 0.55, '', 0, 'pat', 0.9); f.SG = B(f, 0.6, 0, '', 0, 'sign', 0.5); f.RF = B(f, 0.7, 0.3, '', 0, 'corr', 0.55);
  f.WG = B(f, 0.4, 0, P.warm, 0.5, 'glow', 0.3); f.LC = B(f, 0.3, 0, P.ledC, 0.9); f.LM = B(f, 0.3, 0, P.ledM, 0.9);
  var cream = V(P.cream), st = V(P.stone), dk = V(P.dark), gl = V(lv >= 3 ? P.glassD : P.dark);
  /* 步行街铺装（长条形占地 2.56×1.32，建筑在后/街在前，整体最后沿 z 平移 Z 居中）：麻石地 + 分格带 + 骑楼廊地（lv2+ 红砖）*/
  var Z = 0.34; BX(f.P, 2.56, 0.1, 1.32, 0, 0.05, -0.34, V(P.pave));
  for (i = 0; i < 2; i++) BX(f.P, 2.4, 0.008, 0.1, 0, 0.104, -0.1 + i * 0.3, V(P.paveD));
  for (i = -2; i <= 2; i++) BX(f.P, 0.1, 0.008, 0.44, i * 0.5, 0.104, 0.08, V(P.paveD));
  if (lv >= 2) BX(f.P, 2.36, 0.01, 0.3, 0, 0.105, -0.33, V('#8e4a3a'));
  /* 骑楼柱廊（灵魂）：7 柱（柱础/柱头）+ 拱梁 + 暗廊背墙/顶 + 每开间橱窗（lv3+ 暖光）+ 廊内暖灯带 */
  var F = [2, 3, 3, 4][lv - 1], fh = [0.2, 0.2, 0.22, 0.24][lv - 1], y0 = 0.66, top = y0 + F * fh, cc = lv === 1 ? V(P.grey) : cream;
  for (i = 0; i <= 6; i++) { var cx = -1.13 + i * 0.3767; BX(f.W, 0.07, 0.48, 0.07, cx, 0.34, -0.28, cc); BX(f.S, 0.095, 0.03, 0.095, cx, 0.545, -0.28, st); BX(f.S, 0.095, 0.02, 0.095, cx, 0.11, -0.28, st); }
  BX(f.W, 2.4, 0.1, 0.12, 0, 0.61, -0.28, cc); BX(f.WD, 2.36, 0.56, 0.05, 0, 0.38, -0.47, V(P.creamD)); BX(f.D, 2.36, 0.03, 0.2, 0, 0.645, -0.38, dk);
  for (i = 0; i < 5; i++) { var xi = -0.944 + i * 0.472; BX(lv >= 3 ? f.WG : f.D, 0.3, 0.26, 0.02, xi, 0.36, -0.44, lv >= 3 ? V(P.warm) : dk); }
  if (lv >= 3) BX(f.WG, 2.3, 0.035, 0.03, 0, 0.555, -0.3, V(P.warm));
  /* 五开间立面（v2 加密）：年代色带 / 3 窗+窗台+过梁 / 层间线脚 / 壁柱 / 檐口+齿饰 / 女儿墙+山花 / 竖招牌 / LED */
  var tint = [[P.grey, P.cream, P.greyD, P.grey, P.cream], [P.cream, P.tintY, P.tintR, P.cream, P.tintY], [P.cream, P.cream, P.creamD, P.cream, P.cream], [P.cream, P.cream, P.cream, P.creamD, P.cream]][lv - 1];
  var sc = [P.faded, P.signR, P.signG, P.signB], nS = [1, 4, 6, 7][lv - 1], ns = 0, j;
  for (i = 0; i < 5; i++) {
    var x = -0.944 + i * 0.472, col = V(tint[i]);
    BX(f.W, 0.462, top - y0, 0.7, x, (y0 + top) / 2, -0.6, col); BX(f.S, 0.462, 0.02, 0.7, x, top + 0.01, -0.6, V(P.roof));
    for (k = 0; k < F; k++) { var wy = y0 + k * fh + fh / 2;
      for (j = -1; j <= 1; j++) { var wx = x + j * 0.14; BX(f.XD, 0.09, fh * 0.6, 0.02, wx, wy, -0.24, gl); BX(f.S, 0.11, 0.016, 0.035, wx, wy - fh * 0.32, -0.233, st); BX(f.S, 0.11, 0.012, 0.03, wx, wy + fh * 0.32, -0.233, V(P.greyD)); }
      if (k) BX(f.S, 0.462, 0.014, 0.03, x, y0 + k * fh, -0.233, st); }
    BX(f.S, 0.05, top - y0, 0.05, x - 0.236, (y0 + top) / 2, -0.235, st);
    for (j = -2; j <= 2; j++) BX(f.S, 0.03, 0.03, 0.03, x + j * 0.09, top - 0.065, -0.24, st);
    BX(f.W, 0.44, 0.08, 0.06, x, top + 0.04, -0.25, col);
    if (i % 2 === 1) { BX(f.W, 0.3, 0.06, 0.06, x, top + 0.11, -0.25, col); BX(f.W, 0.16, 0.05, 0.06, x, top + 0.165, -0.25, col); }
    for (k = 0; k < 2 && ns < nS; k++, ns++) { var sx = x + (k ? 0.16 : -0.16); if (i === 2 && k === 0 && lv >= 2) continue;
      BX(f.SG, 0.075, 0.38, 0.025, sx, top - 0.3, -0.226, V(lv === 1 ? P.faded : sc[1 + (ns % 3)])); }
  }
  BX(f.S, 0.05, top - y0, 0.05, 1.18, (y0 + top) / 2, -0.235, st); BX(f.W, 2.4, 0.05, 0.1, 0, top - 0.02, -0.24, cream);
  if (lv >= 2) { var vs = VSIGN('上下九', 0.14, 0.4, '#8e1e14', '#f0c860'); vs.position.set(-0.16, top - 0.3, -0.214); g.add(vs); }
  if (lv >= 4) { BX(f.LC, 0.3, 0.5, 0.02, 0.472, top - 0.36, -0.222, V(P.ledC)); BX(f.LM, 0.26, 0.42, 0.02, -0.472, top - 0.34, -0.222, V(P.ledM)); }
  /* 转角圆塔（骑楼地标）：圆柱 + 檩口环 + 铜绿穹顶 + 尖顶球；斜向窗 */
  var tx = -0.97, tz = -0.46, tt = top + 0.06;
  CY(f.W, 12, 0.21, 0.21, 0.1, tt, tx, tz, cc); CY(f.S, 12, 0.235, 0.235, tt - 0.05, tt, tx, tz, st);
  for (k = 0; k < F + 1; k++) for (i = 0; i < 2; i++) { var th = i ? -1.0 : -0.35; BX(f.XD, 0.1, 0.13, 0.02, tx + S(th) * 0.205, 0.4 + k * fh + (k ? 0.1 : 0), tz + Co(th) * 0.205, gl, th); }
  SP(f.CP, 12, 0.15, tx, tt + 0.02, tz, V(P.copper), true); CY(f.I, 6, 0.006, 0.012, tt + 0.16, tt + 0.24, tx, tz, V(P.iron)); SP(f.CP, 6, 0.018, tx, tt + 0.25, tz, V('#d9a848'));
  /* 屋顶年代志：lv1 乱搭灰盒+水箱+天线 → lv2 彩钢顶 → lv3 绿化+暗玻璃塔 → lv4 玻璃亭+花园 */
  var ry = top + 0.08, gy = V(P.greyD);
  if (lv <= 2) { BX(f.S, 0.36, 0.14, 0.4, -0.3, ry + 0.07, -0.6, gy); BX(f.S, 0.4, 0.18, 0.4, 0.45, ry + 0.09, -0.65, gy); BX(f.S, 0.34, 0.12, 0.4, 0.95, ry + 0.06, -0.58, gy);
    CY(f.S, 8, 0.08, 0.08, ry, ry + 0.18, 0.15, -0.8, V(P.roof)); BX(f.I, 0.012, 0.22, 0.012, 0.7, ry + 0.11, -0.85, V(P.iron)); BX(f.I, 0.012, 0.18, 0.012, -0.55, ry + 0.09, -0.8, V(P.iron)); }
  if (lv === 2) { BX(f.RF, 0.42, 0.02, 0.44, -0.3, ry + 0.15, -0.6, V(P.signR)); BX(f.RF, 0.44, 0.02, 0.44, 0.45, ry + 0.19, -0.65, V(P.signB)); }
  if (lv >= 3) { for (i = 0; i < 3; i++) BX(f.N, 0.42, 0.02, 0.3, -0.7 + i * 0.7, ry + 0.01, -0.62 + (i % 2) * 0.12, V('#5f7f3d'));
    SP(f.N, 6, 0.07, -0.55, ry + 0.09, -0.78, V('#5f7f3d')); SP(f.NL, 6, 0.06, 0.2, ry + 0.08, -0.55, V('#7a9a4e'));
    var gh = lv >= 4 ? 0.6 : 0.5; BX(f.X, 0.42, gh, 0.4, 0.944, ry - 0.06 + gh / 2, -0.6, V(P.glass)); BX(f.I, 0.44, 0.03, 0.42, 0.944, ry - 0.06 + gh + 0.015, -0.6, V(P.iron)); }
  if (lv >= 4) { BX(f.X, 0.78, 0.22, 0.44, -0.24, ry + 0.11, -0.62, V(P.glass)); BX(f.I, 0.84, 0.025, 0.5, -0.24, ry + 0.235, -0.62, V(P.iron));
    SP(f.N, 6, 0.08, 0.5, ry + 0.1, -0.5, V('#5f7f3d')); SP(f.NL, 6, 0.07, -0.85, ry + 0.09, -0.75, V('#7a9a4e')); BX(f.WG, 2.36, 0.02, 0.03, 0, top - 0.06, -0.225, V(P.warm)); }
  /* 街道家具：花池 + 行道树 + 路灯（数量与亮灯随年代）*/
  var nP = [2, 3, 4, 4][lv - 1], nT = [2, 3, 4, 6][lv - 1], nL = [2, 2, 3, 4][lv - 1];
  for (i = 0; i < nP; i++) PL(f, -0.84 + i * (1.68 / Math.max(1, nP - 1)), -0.06, 0.28 + (lv >= 3 ? 0.1 : 0));
  for (i = 0; i < nT; i++) TR(f, -1.0 + i * (2.0 / Math.max(1, nT - 1)), 0.14 + (i % 2) * 0.06, 0.75 + 0.1 * (lv - 1) * 0.5 + (i % 3) * 0.05);
  for (i = 0; i < nL; i++) LP(f, -0.9 + i * (1.8 / Math.max(1, nL - 1)), 0.27, lv >= 3);
  if (lv >= 2) for (i = 0; i < 6; i++) BX(f.S, 0.12 + R() * 0.06, 0.008, 0.12, -1.0 + i * 0.4, 0.108, -0.04 + R() * 0.05, V(P.paveD), (R() - 0.5) * 0.2);
  for (k in f.b) { var pp = f.b[k].p; for (i = 2; i < pp.length; i += 3) pp[i] += Z; }   /* 整体沿 z 平移居中 */
  if (lv >= 2) vs.position.z += Z;
  BUILD(f, g);
  var hm = g.userData.hotM;
  g.userData.anim = [
    function (t) { var a = hm[P.ledC], b = hm[P.ledM]; if (a) a.emissiveIntensity = 0.75 + 0.25 * (0.5 + 0.5 * S(t * 2.2)); if (b) b.emissiveIntensity = 0.75 + 0.25 * (0.5 + 0.5 * S(t * 1.7 + 2)); },
    function (t) { var m = hm[P.warm]; if (m) m.emissiveIntensity = 0.45 + 0.15 * (0.5 + 0.5 * S(t * 1.4)); }];
  return g;
}
window.Props3DModern = window.Props3DModern || {}; window.Props3DModern[10] = make10;
})();
