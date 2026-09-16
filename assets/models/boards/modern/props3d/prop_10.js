/* 大富翁·现代写实棋盘 格 10「上下九」—— 广州骑楼连廊街四年代（1990s→2020s）· v3 结构精修 R1+R2+R3
 * 视觉真源 refs/modern/prop_10.png（左上 1990s / 右上 2000s / 左下 2010s / 右下 2020s）。
 * R1：新增后排 3 座退台高楼（lv3+ 远端换蓝灰玻璃幕墙塔+玻璃顶亭）；转角塔改檐上双鼓座穹顶亭（石栏板圈/拱窗鼓座/灰绿穹顶/灯式尖顶）+ 各层拱顶旋转窗；
 *     骑楼廊加深（7 柱+廊顶板+檐梁+齿饰+店后墙）；开间交替山花（弧形/阶梯/平头）；窗框/窗台/过梁/腰线/通高壁柱/齿饰；底店横幅+两级雨棚(lv2+)；
 *     屋顶水箱钢架/波纹棚屋/空调对/天线 → lv3+ 绿化树池/玻璃亭；行道树三层冠+树池+绿篱花槽+双臂路灯+长椅+车挡+树灯(lv4)。
 * R2：整体 x 镜像（穹顶转角置于 +x 近机位侧，同参考构图）；lv1/2 前排压低让后排高楼露出（年代高差）；暗玻璃开间改幕墙（层带+竖梃）；LED 加暗框。
 * R3：转角塔前突 + 底层三拱廊(lv4 玻璃) + 檐口望柱栏杆圈；端开间二层拱窗；柱间拱肩；女儿墙望柱；后楼阳台(lv1/2)/空调；lv4 壁柱脚泛光灯 +
 *     通高玻璃店面 + 双暖窗 + 暖白墙；lv3+ 雨棚改深色。材质 19 桶（玻璃 rough.15/met.7、幕墙 GS、铜绿、彩钢、招牌漆、暖光、LED、雨棚漆）。
 * 契约：window.Props3DModern[10](level 1..4) → 全新 Group；占地 ≤2.6×2.6、底面 y=0、正面 +z；mesh ≤55；Canvas ≤256px；零 Math.random；动画 2 项。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') return;
var PI = Math.PI, S = Math.sin, Co = Math.cos, _PC = {}, _TXC = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function RG(s) { s = (s >>> 0) || 1010; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
/* ---------- Canvas 多层纹理（128px；基色+噪点/风化+分缝+高光；模块级缓存，材质每实例新建） ---------- */
function TX(id, ws, draw) { if (_TXC[id]) return _TXC[id];
  var cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; draw(cv.getContext('2d'), 128, 128, RG(id.charCodeAt(2) * 131 + (ws * 10) | 0));
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return _TXC[id] = { t: t, ws: ws }; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,' + a + ')' : 'rgba(22,20,16,' + a + ')'; g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); } }
var TEX = {
  stuc: TX('t10stuc', 1.5, function (g, w, h, R) { g.fillStyle = '#f6f2ea'; g.fillRect(0, 0, w, h); var i, x0; for (i = 0; i < 10; i++) { g.fillStyle = 'rgba(118,108,90,' + (0.07 + R() * 0.1).toFixed(2) + ')'; g.fillRect(R() * w, R() * 24, 2 + R() * 6, 30 + R() * 90); }
    for (i = 0; i < h; i += 16) { g.fillStyle = 'rgba(96,88,72,0.16)'; g.fillRect(0, i, w, 1); g.fillRect((i / 16) % 2 ? 32 : 0, i, 1, 16); g.fillRect((i / 16) % 2 ? 96 : 64, i, 1, 16); }
    for (i = 0; i < 5; i++) { x0 = R() * w; g.strokeStyle = 'rgba(100,92,76,0.2)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 18, h); g.stroke(); } g.fillStyle = 'rgba(80,74,60,0.12)'; g.fillRect(0, 104, w, 24); SPK(g, w, h, 140, 0.05, R); }),
  ash: TX('t10ash', 1.0, function (g, w, h, R) { g.fillStyle = '#f1efe8'; g.fillRect(0, 0, w, h); var x, y; for (y = 0; y < h; y += 32) { g.fillStyle = 'rgba(92,88,74,0.5)'; g.fillRect(0, y, w, 2); var o = (y / 32) % 2 ? 32 : 0;
      for (x = o; x < w; x += 64) { g.fillStyle = 'rgba(92,88,74,0.4)'; g.fillRect(x, y, 2, 32); g.fillStyle = R() > 0.5 ? 'rgba(255,255,250,0.10)' : 'rgba(70,64,52,0.10)'; g.fillRect(x + 3, y + 3, 60, 27); } } SPK(g, w, h, 90, 0.06, R); }),
  glass: TX('t10glass', 0.22, function (g, w, h, R) { g.fillStyle = '#e6edf3'; g.fillRect(0, 0, w, h); var i; g.fillStyle = 'rgba(40,46,54,0.55)'; g.fillRect(62, 0, 4, h); g.fillRect(0, 62, w, 4); g.fillRect(0, 0, w, 3); g.fillRect(0, 0, 3, h);
    for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,255,255,0.30)'; g.fillRect(i * 9, 118 - i * 9, 9, 16); } g.fillStyle = 'rgba(30,36,44,0.18)'; g.fillRect(0, 96, w, 32); SPK(g, w, h, 20, 0.04, R); }),
  sign: TX('t10sign', 0.5, function (g, w, h, R) { g.fillStyle = '#f8f0ea'; g.fillRect(0, 0, w, h); var x, y; for (x = 0; x < w; x += 8) { g.fillStyle = 'rgba(70,20,10,0.22)'; g.fillRect(x, 0, 1, h); }
    for (y = 8; y < h; y += 30) { g.fillStyle = 'rgba(255,240,200,0.5)'; g.fillRect(14, y, w - 28, 14); } g.fillStyle = 'rgba(60,20,10,0.45)'; g.fillRect(0, 0, 5, h); g.fillRect(w - 5, 0, 5, h); SPK(g, w, h, 30, 0.05, R); }),
  corr: TX('t10corr', 0.55, function (g, w, h, R) { g.fillStyle = '#f4f4f2'; g.fillRect(0, 0, w, h); var x; for (x = 0; x < w; x += 6) { g.fillStyle = 'rgba(30,30,34,0.35)'; g.fillRect(x, 0, 2, h); g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(x + 3, 0, 1, h); }
    for (x = 0; x < 6; x++) { g.fillStyle = 'rgba(120,60,20,0.2)'; g.fillRect(R() * w, R() * h, 4 + R() * 10, 2 + R() * 6); } }),
  pat: TX('t10pat', 0.9, function (g, w, h, R) { g.fillStyle = '#eef3ee'; g.fillRect(0, 0, w, h); var i; for (i = 0; i < 12; i++) { g.fillStyle = 'rgba(40,90,70,' + (0.12 + R() * 0.2).toFixed(2) + ')'; g.fillRect(R() * w, 0, 2 + R() * 5, 40 + R() * 88); }
    for (i = 0; i < 16; i++) { g.fillStyle = i % 2 ? 'rgba(20,40,30,0.25)' : 'rgba(255,255,255,0.3)'; g.fillRect(R() * w, R() * h, 3 + R() * 8, 2 + R() * 5); } }),
  leaf: TX('t10leaf', 0.65, function (g, w, h, R) { g.fillStyle = '#f0f6e6'; g.fillRect(0, 0, w, h); for (var i = 0; i < 34; i++) { g.fillStyle = i % 2 ? 'rgba(34,66,24,0.28)' : 'rgba(255,255,240,0.30)'; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } }),
  glow: TX('t10glow', 0.3, function (g, w, h, R) { g.fillStyle = '#fff8ee'; g.fillRect(0, 0, w, h); for (var i = 0; i < w; i += 32) { g.fillStyle = 'rgba(90,50,20,0.35)'; g.fillRect(i, 0, 3, h); g.fillRect(0, i, w, 3); } SPK(g, w, h, 10, 0.03, R); })
};
/* ---------- 合并几何核心：桶=材质参数；顶点色 + boxUV（主法线轴投影 × ws） ---------- */
function B(f, r, mt, em, ei, tex, ws) { var k = r + '|' + (mt || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (tex || '') + '|' + (ws || 0); return f.b[k] || (f.b[k] = { k: k, p: [], n: [], u: [], c: [], i: [], nv: 0, ws: ws || 1 }); }
function TRI(u, a, b, c, col) {
  var e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2], e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
  var nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x, l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1; nx /= l; ny /= l; nz /= l;
  var s = u.nv, iv = 1 / u.ws, ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
  function UV(p) { if (ay >= ax && ay >= az) u.u.push(p[0] * iv, p[2] * iv); else if (ax >= az) u.u.push(p[2] * iv, p[1] * iv); else u.u.push(p[0] * iv, p[1] * iv); } UV(a); UV(b); UV(c);
  u.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); u.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz); u.c.push(col[0], col[1], col[2], col[0], col[1], col[2], col[0], col[1], col[2]); u.i.push(s, s + 1, s + 2); u.nv = s + 3; }
function QAD(u, a, b, c, d, col) { TRI(u, a, b, c, col); TRI(u, a, c, d, col); }
function BX(u, w, h, d, x, y, z, col, ry) { var ca = Co(ry || 0), sa = S(ry || 0), y0 = y - h / 2, y1 = y + h / 2, P = function (lx, lz, ly) { return [x + lx * ca + lz * sa, ly, z - lx * sa + lz * ca]; };
  var A = P(-w / 2, d / 2, y0), Bb = P(w / 2, d / 2, y0), Cc = P(w / 2, d / 2, y1), D = P(-w / 2, d / 2, y1), E = P(-w / 2, -d / 2, y0), F = P(w / 2, -d / 2, y0), G = P(w / 2, -d / 2, y1), H = P(-w / 2, -d / 2, y1);
  QAD(u, A, Bb, Cc, D, col); QAD(u, F, E, H, G, col); QAD(u, Bb, F, G, Cc, col); QAD(u, E, A, D, H, col); QAD(u, D, Cc, G, H, col); QAD(u, E, F, Bb, A, col); }
function CY(u, n, rt, rb, y0, y1, x, z, col) { for (var i = 0; i < n; i++) { var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI, c0 = Co(a0), s0 = S(a0), c1 = Co(a1), s1 = S(a1);
  QAD(u, [x + c0 * rb, y0, z + s0 * rb], [x + c1 * rb, y0, z + s1 * rb], [x + c1 * rt, y1, z + s1 * rt], [x + c0 * rt, y1, z + s0 * rt], col); if (rt > 0.004) TRI(u, [x, y1, z], [x + c0 * rt, y1, z + s0 * rt], [x + c1 * rt, y1, z + s1 * rt], col); } }
function SP(u, n, r, x, y, z, col, half) { var R = half ? 2 : 3, base = half ? 0 : -PI / 2, span = half ? PI / 2 : PI;
  for (var j = 0; j < R; j++) { var p0 = base + j / R * span, p1 = base + (j + 1) / R * span, w0 = Co(p0) * r, w1 = Co(p1) * r, y0 = y + S(p0) * r, y1 = y + S(p1) * r;
    for (var i = 0; i < n; i++) { var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI; QAD(u, [x + Co(a0) * w0, y0, z + S(a0) * w0], [x + Co(a1) * w0, y0, z + S(a1) * w0], [x + Co(a1) * w1, y1, z + S(a1) * w1], [x + Co(a0) * w1, y1, z + S(a0) * w1], col); } } }
function VSIGN(txt, w, h, bg, fg) { var cv = document.createElement('canvas'); cv.width = 96; cv.height = 256; var g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 96, 256); g.strokeStyle = fg; g.lineWidth = 6; g.strokeRect(6, 6, 84, 244); g.fillStyle = fg; g.font = 'bold 60px "Microsoft YaHei","SimHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (var i = 0; i < txt.length; i++) g.fillText(txt[i], 48, 48 + i * 80); var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: C(fg), emissiveMap: t, emissiveIntensity: 0.35 })); }
function BUILD(f, g) { for (var k in f.b) { var u = f.b[k]; if (!u.nv) continue;
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(u.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(u.n, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(u.u, 2)); geo.setAttribute('color', new THREE.Float32BufferAttribute(u.c, 3)); geo.setIndex(u.i);
    var a = k.split('|'), m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: +a[0], metalness: +a[1], flatShading: true, side: THREE.DoubleSide });
    if (a[2]) { m.emissive = C(a[2]); m.emissiveIntensity = +a[3]; g.userData.hotM[a[2]] = m; } if (a[4] && TEX[a[4]]) m.map = TEX[a[4]].t;
    var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms); } }
/* ---------- 色板（采样参考图） ---------- */
var P = { cream: '#e8e1cf', creamD: '#d8cfba', grey: '#b3aa97', greyD: '#8f887b', tintY: '#d9b36a', tintR: '#a34a38', stone: '#cfc7b4', pave: '#b9b2a2', paveD: '#948c7d',
  dark: '#2b2723', glass: '#8ea6ba', glassD: '#33404c', curt: '#4a5866', copper: '#565a50', roof: '#57534b', signR: '#a32b1e', signG: '#d9a838', signB: '#2f5e8c', warm: '#ffd28a',
  ledC: '#3ec8e6', ledM: '#d24ad2', iron: '#26262a', faded: '#a89a80', awn: '#8e2a1e', awnD: '#6e2018', bark: '#6a4e30', gn1: '#5f7f3d', gn2: '#7a9a4e', gn3: '#4e6e34', warmW: '#f0e6cf' };
function make10(level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), f = { b: {} }, g = new THREE.Group(), i, j, k, th, vs = null;
  g.name = 'prop_10_modern_lv' + lv; g.userData = { kind: 'property', propIdx: 10, region: 'g3', level: lv, hotM: {} };
  f.S = B(f, 0.85, 0, '', 0, 'ash', 1.0); f.P = B(f, 0.95, 0, '', 0, 'ash', 1.5); f.W = B(f, 0.85, 0, '', 0, 'stuc', 1.5); f.WD = B(f, 0.86, 0, '', 0, 'stuc', 1.5); f.D = B(f, 0.96);
  f.X = B(f, 0.15, 0.7, '', 0, 'glass', 0.3); f.XD = B(f, 0.15, 0.7, '', 0, 'glass', 0.22); f.N = B(f, 0.92, 0, '', 0, 'leaf', 0.65); f.NL = B(f, 0.91, 0, '', 0, 'leaf', 0.5);
  f.U = B(f, 0.89); f.I = B(f, 0.6, 0.4); f.CP = B(f, 0.45, 0.55, '', 0, 'pat', 0.9); f.SG = B(f, 0.6, 0, '', 0, 'sign', 0.5); f.RF = B(f, 0.7, 0.3, '', 0, 'corr', 0.55);
  f.WG = B(f, 0.4, 0, P.warm, 0.5, 'glow', 0.3); f.LC = B(f, 0.3, 0, P.ledC, 0.9); f.LM = B(f, 0.3, 0, P.ledM, 0.9); f.GS = B(f, 0.12, 0.75, '', 0, 'glass', 0.38); f.AW = B(f, 0.7, 0);
  var cream = V(P.cream), st = V(P.stone), dk = V(P.dark), ir = V(P.iron), wm = V(P.warm), gn1 = V(P.gn1), gn2 = V(P.gn2), gl = V(lv >= 3 ? P.glassD : P.dark), cc2 = lv === 1 ? V(P.greyD) : V(P.creamD);
  var F = [2, 3, 3, 4][lv - 1], fh = [0.18, 0.2, 0.23, 0.24][lv - 1], y0 = 0.6, top = y0 + F * fh, cc = lv === 1 ? V('#c4beb0') : cream, hT = [1.32, 1.58, 1.95, 2.45][lv - 1];
  /* 广场：麻石大板 + 深色分格波带 + 骑楼廊地（lv2+ 红砖） */
  BX(f.P, 2.56, 0.1, 1.72, 0, 0.05, 0.44, V(P.pave));
  for (i = 0; i < 4; i++) BX(f.P, 2.44, 0.01, 0.06, 0, 0.104, -0.34 + i * 0.44, V(P.paveD));
  for (i = 0; i < 7; i++) BX(f.P, 0.06, 0.01, 1.6, -0.96 + i * 0.32, 0.104, 0.5, V(P.paveD));
  if (lv >= 2) BX(f.P, 2.42, 0.012, 0.28, 0, 0.107, -0.28, V('#8e4a3a'));
  /* 骑楼柱廊：7 柱（柱础/柱头）+ 廊顶板 + 檐梁 + 檐下齿饰 */
  for (i = 0; i < 7; i++) { var c7 = -0.82 + i * 0.3333; BX(f.W, 0.055, 0.42, 0.055, c7, 0.33, -0.5, cc); BX(f.S, 0.085, 0.045, 0.085, c7, 0.122, -0.5, st); BX(f.S, 0.08, 0.04, 0.08, c7, 0.545, -0.5, st); }
  BX(f.WD, 2.44, 0.05, 0.24, 0, 0.575, -0.51, cc); BX(f.WD, 2.44, 0.06, 0.028, 0, 0.53, -0.415, cc); for (i = 0; i < 8; i++) BX(f.S, 0.03, 0.028, 0.024, -1.05 + i * 0.3, 0.495, -0.407, st);
  for (i = 0; i < 6; i++) { BX(f.W, 0.05, 0.05, 0.05, -0.77 + i * 0.3333, 0.5, -0.5, cc); BX(f.W, 0.05, 0.05, 0.05, -0.54 + i * 0.3333, 0.5, -0.5, cc); }   /* 柱间拱肩 */
  /* 底店：店后墙 + 门窗(lv4 通高玻璃) + 横幅招幌 + 两级雨棚(lv2+，lv3+ 深色) + 店内暖光(lv3+) */
  var sbc = lv === 1 ? [P.faded, '#7a8a98', P.faded, '#9c6e58', P.faded] : [P.signR, P.signG, P.signB, P.signR, P.signG], aw1 = V(lv >= 3 ? '#3a3a3e' : P.awn), aw2 = V(lv >= 3 ? '#2c2c30' : P.awnD);
  for (i = 0; i < 5; i++) { var sx = -0.98 + i * 0.49; BX(f.WD, 0.49, 0.5, 0.02, sx, 0.35, -0.59, cc2); BX(lv >= 4 ? f.X : f.D, 0.36, 0.34, 0.012, sx, 0.27, -0.594, lv >= 4 ? V(P.glass) : dk); BX(f.SG, 0.43, 0.09, 0.014, sx, 0.487, -0.581, V(sbc[i]));
    if (lv >= 2) { BX(f.AW, 0.4, 0.014, 0.075, sx, 0.425, -0.553, aw1); BX(f.AW, 0.34, 0.012, 0.06, sx, 0.4, -0.512, aw2); } if (lv >= 3) BX(f.WG, 0.34, 0.03, 0.012, sx, 0.155, -0.583, wm); }
  if (lv >= 4) for (i = 0; i < 6; i++) BX(f.WG, 0.034, 0.02, 0.024, -1.225 + i * 0.49, y0 + 0.02, -0.562, wm);   /* 壁柱脚泛光灯 */
  /* 五开间立面：分色墙 + 窗(框/台/过梁) + 腰线 + 通高壁柱 + 女儿墙 + 齿饰 + 交替山花；lv3+ 中段幕墙填充（层带+竖梃） */
  var tint = [['#c4beb0', P.faded, P.greyD, P.grey, P.faded], [P.cream, P.tintY, P.tintR, P.cream, P.tintY], [P.cream, P.cream, P.curt, P.cream, P.creamD], [P.warmW, P.warmW, P.curt, P.warmW, P.warmW]][lv - 1], ped = [1, 0, 2, 1, 0];
  function WIN(x, y, w, h, arc) { BX(f.W, w + 0.02, h + 0.02, 0.012, x, y, -0.576, st); BX(f.XD, w, h, 0.008, x, y, -0.578, gl); BX(f.S, w + 0.03, 0.016, 0.022, x, y - h / 2 - 0.008, -0.568, st); BX(f.S, w + 0.03, 0.012, 0.02, x, y + h / 2 + 0.007, -0.569, st);
    if (arc) { BX(f.W, w * 0.72, 0.014, 0.016, x, y + h / 2 + 0.02, -0.571, st); BX(f.W, w * 0.4, 0.012, 0.016, x, y + h / 2 + 0.033, -0.571, st); } }
  for (i = 0; i < 5; i++) { var x = -0.98 + i * 0.49, dkb = lv >= 3 && i === 2, col = V(tint[i]), ym = (y0 + top) / 2;
    BX(dkb ? f.GS : f.W, 0.49, top - y0, 0.68, x, ym, -0.92, col); BX(f.S, 0.49, 0.018, 0.7, x, top + 0.009, -0.92, V(P.roof));
    if (dkb) { for (k = 1; k < F; k++) BX(f.S, 0.49, 0.012, 0.02, x, y0 + k * fh, -0.571, st); for (j = -1; j <= 1; j++) BX(f.I, 0.012, top - y0, 0.014, x + j * 0.16, ym, -0.572, ir); }
    else for (k = 0; k < F; k++) { var wy = y0 + k * fh + fh / 2; for (j = -1; j <= 1; j++) WIN(x + j * 0.145, wy, 0.082, fh * 0.56, k === 0 && (i === 0 || i === 4));
      if (lv >= 3 && k >= 1 && (i + k) % 2) for (j = -1; j <= 1; j += (lv >= 4 ? 2 : 3)) BX(f.WG, 0.082, fh * 0.56, 0.01, x + (lv >= 4 ? j : (k % 2 ? -1 : 1)) * 0.145, wy, -0.577, wm); if (k) BX(f.S, 0.49, 0.016, 0.024, x, y0 + k * fh, -0.572, st); }
    BX(f.W, 0.05, top - y0, 0.024, x - 0.245, ym, -0.57, col); BX(f.W, 0.05, top - y0, 0.024, x + 0.245, ym, -0.57, col); BX(f.W, 0.49, 0.05, 0.055, x, top + 0.05, -0.6, col); BX(f.S, 0.5, 0.014, 0.062, x, top + 0.082, -0.6, st);
    for (j = -2; j <= 2; j++) BX(f.S, 0.026, 0.026, 0.026, x + j * 0.085, top - 0.085, -0.568, st);
    for (j = 0; j < 4; j++) BX(f.S, 0.014, 0.046, 0.014, x + [-0.2, -0.13, 0.13, 0.2][j], top + 0.112, -0.6, st);   /* 女儿墙望柱 */
    var pt = top + 0.09;
    if (ped[i] === 1) { BX(f.W, 0.36, 0.024, 0.05, x, pt + 0.012, -0.6, col); BX(f.W, 0.24, 0.024, 0.05, x, pt + 0.036, -0.6, col); BX(f.W, 0.12, 0.024, 0.05, x, pt + 0.06, -0.6, col); }
    else if (ped[i] === 2) { BX(f.W, 0.4, 0.022, 0.05, x, pt + 0.011, -0.6, col); BX(f.W, 0.28, 0.022, 0.05, x - 0.05, pt + 0.033, -0.6, col); BX(f.W, 0.16, 0.022, 0.05, x - 0.1, pt + 0.055, -0.6, col); }
    else BX(f.W, 0.18, 0.03, 0.05, x, pt + 0.015, -0.6, col); }
  for (k = 0; k < F; k++) { var gy = y0 + k * fh + fh / 2; BX(f.W, 0.012, fh * 0.56 + 0.02, 0.1, -1.231, gy, -0.9, st); BX(f.XD, 0.008, fh * 0.56, 0.082, -1.233, gy, -0.9, gl); }
  /* 转角圆塔（镜像后位于 +x 近机位）：柱础环/檐环 + 各层拱顶旋转窗 + 石栏板圈 + 拱窗鼓座 + 窄鼓座 + 灰绿穹顶 + 灯式尖顶 */
  var tx = -1.02, tz = -0.7, tt = top + 0.02;
  CY(f.W, 12, 0.21, 0.21, 0.1, tt, tx, tz, cc); CY(f.S, 12, 0.24, 0.24, 0.1, 0.16, tx, tz, st); CY(f.S, 12, 0.225, 0.225, tt - 0.05, tt, tx, tz, st); CY(f.S, 12, 0.222, 0.222, y0 - 0.04, y0, tx, tz, st);
  for (i = 0; i < 3; i++) { th = -0.62 + i * 0.62; BX(lv >= 4 ? f.X : f.D, 0.1, 0.36, 0.02, tx + S(th) * 0.207, 0.34, tz + Co(th) * 0.207, lv >= 4 ? V(P.glass) : dk, th); BX(f.D, 0.06, 0.03, 0.02, tx + S(th) * 0.207, 0.535, tz + Co(th) * 0.207, dk, th); }   /* 底层拱廊 */
  for (k = 0; k < F; k++) for (i = 0; i < 4; i++) { th = [-0.75, -0.25, 0.25, 0.75][i] + (k % 2) * 0.5; var ty = y0 + k * fh + fh * 0.55, sx2 = tx + S(th) * 0.203, sz2 = tz + Co(th) * 0.203;
    BX(f.W, 0.105, fh * 0.56, 0.024, sx2, ty, sz2, st, th); BX(f.XD, 0.085, fh * 0.5, 0.02, tx + S(th) * 0.206, ty, tz + Co(th) * 0.206, gl, th);
    if (k < 2) { BX(f.W, 0.06, 0.02, 0.022, sx2, ty + fh * 0.31, sz2, st, th); BX(f.W, 0.032, 0.018, 0.022, sx2, ty + fh * 0.375, sz2, st, th); } }
  CY(f.S, 12, 0.222, 0.222, tt, tt + 0.012, tx, tz, st); for (i = 0; i < 12; i++) { th = i * PI / 6; BX(f.S, 0.014, 0.036, 0.014, tx + S(th) * 0.218, tt + 0.03, tz + Co(th) * 0.218, st, th); }
  CY(f.S, 12, 0.232, 0.232, tt + 0.047, tt + 0.059, tx, tz, st); CY(f.W, 12, 0.125, 0.13, tt + 0.047, tt + 0.167, tx, tz, cc);
  for (i = 0; i < 4; i++) { th = i * PI / 2; BX(f.D, 0.055, 0.07, 0.02, tx + S(th) * 0.127, tt + 0.112, tz + Co(th) * 0.127, dk, th); }
  CY(f.S, 12, 0.145, 0.145, tt + 0.167, tt + 0.181, tx, tz, st); CY(f.W, 10, 0.07, 0.08, tt + 0.181, tt + 0.231, tx, tz, cc); SP(f.CP, 12, 0.095, tx, tt + 0.231, tz, V(P.copper), true);
  CY(f.I, 6, 0.004, 0.009, tt + 0.31, tt + 0.37, tx, tz, ir); SP(f.CP, 6, 0.015, tx, tt + 0.378, tz, V('#d9a848'));
  if (lv >= 2) { vs = VSIGN('上下九', 0.13, 0.36, '#8e1e14', '#f0c860'); vs.position.set(-tx, y0 + 0.52, tz + 0.212); g.add(vs); }
  /* 后排退台高楼 ×3（lv3+ 远端换玻璃幕墙塔）：楼身/檐口/窗排/空调外机；近端小穹顶亭 */
  function TW(cx, w, h, b) { BX(b, w, h - 0.1, 0.37, cx, (h + 0.1) / 2, -1.065, cc2); BX(f.S, w, 0.02, 0.4, cx, h - 0.01, -1.065, V(P.roof)); BX(b, w + 0.02, 0.045, 0.02, cx, h - 0.045, -0.878, cc2);
    for (var yy = top + 0.18; yy < h - 0.14; yy += 0.21) for (var j2 = -1; j2 <= 1; j2++) { BX(f.XD, 0.07, 0.11, 0.014, cx + j2 * w * 0.26, yy, -0.879, gl);
      if (lv <= 2) { BX(f.S, 0.11, 0.01, 0.05, cx + j2 * w * 0.26, yy - 0.06, -0.86, st); BX(f.I, 0.11, 0.03, 0.008, cx + j2 * w * 0.26, yy - 0.04, -0.837, ir); } else if (j2 === 0 && b !== f.GS) BX(f.I, 0.04, 0.03, 0.03, cx + j2 * w * 0.26 + 0.06, yy - 0.075, -0.865, ir); } }
  var h2 = hT - [0.12, 0.16, 0.2, 0.26][lv - 1], h3 = hT - [0.16, 0.2, 0.28, 0.38][lv - 1];
  TW(0.1, 0.9, hT, f.WD); TW(0.89, 0.58, h2, lv >= 3 ? f.GS : f.WD); TW(-0.785, 0.72, h3, f.WD);
  CY(f.W, 10, 0.06, 0.06, h3, h3 + 0.05, -0.95, -1.0, cc2); SP(f.CP, 8, 0.055, -0.95, h3 + 0.05, -1.0, V(P.copper), true);
  if (lv >= 2) { BX(f.WD, 0.36, 0.14, 0.26, -0.15, hT + 0.07, -1.1, cc2); BX(f.S, 0.38, 0.015, 0.28, -0.15, hT + 0.147, -1.1, V(P.roof)); BX(f.XD, 0.06, 0.07, 0.012, -0.15, hT + 0.07, -0.965, gl); }   /* 退台阁楼 */
  if (lv >= 3) BX(f.I, 0.14, 0.08, 0.14, 0.89, h2 + 0.04, -1.1, ir);   /* 幕墙楼顶机房 */
  /* 屋顶年代志：lv1/2 乱搭（棚屋/水箱钢架/空调对/天线）→ lv3/4 绿化树池 + 玻璃亭 */
  var r1y = top + 0.1;
  function TN(x, z, y) { BX(f.I, 0.1, 0.01, 0.1, x, y + 0.015, z, ir); CY(f.I, 8, 0.052, 0.052, y + 0.02, y + 0.11, x, z, V(P.roof)); CY(f.I, 8, 0.055, 0.055, y + 0.11, y + 0.125, x, z, ir); }
  function SH(x, z, y, c) { BX(f.WD, 0.16, 0.085, 0.13, x, y + 0.043, z, cc2); BX(f.RF, 0.19, 0.012, 0.16, x, y + 0.092, z, V(c || P.roof)); BX(f.D, 0.05, 0.055, 0.008, x, y + 0.028, z - 0.066, dk); }
  function AC(x, z, y) { BX(f.I, 0.05, 0.032, 0.032, x, y + 0.016, z, ir); BX(f.I, 0.04, 0.028, 0.028, x + 0.06, y + 0.014, z + 0.02, ir); }
  function AN(x, z, y) { CY(f.I, 4, 0.003, 0.006, y, y + 0.16, x, z, ir); BX(f.I, 0.08, 0.008, 0.008, x, y + 0.12, z, ir); }
  if (lv <= 2) { SH(-0.7, -0.72, r1y); SH(0.62, -0.7, r1y, lv === 2 ? '#3e6a8e' : ''); TN(-0.05, -0.7, r1y); AC(0.3, -0.66, r1y); AC(-1.0, -0.68, r1y); AN(1.05, -0.72, r1y); AN(-0.35, -0.74, r1y); TN(-0.55, -1.15, h3 - 0.02); }
  else { for (i = 0; i < 4; i++) { var gx = -0.85 + i * 0.56; BX(f.S, 0.24, 0.045, 0.1, gx, r1y + 0.022, -0.68, st); SP(f.NL, 6, 0.05, gx, r1y + 0.068, -0.68, gn1); SP(f.NL, 5, 0.035, gx + 0.07, r1y + 0.05, -0.64, gn2); }
    TN(-0.55, -1.15, h3 - 0.02); AC(-0.5, -0.68, r1y); for (i = 0; i < 2; i++) { var gx2 = -0.35 + i * 1.1; CY(f.U, 5, 0.012, 0.016, r1y, r1y + 0.16, gx2, -0.72, V(P.bark)); SP(f.NL, 6, 0.075, gx2, r1y + 0.22, -0.72, gn1); }
    BX(f.X, 0.4, 0.22, 0.3, 0.3, hT + 0.13, -1.05, V(P.glass)); BX(f.I, 0.44, 0.02, 0.34, 0.3, hT + 0.25, -1.05, ir); BX(f.I, 0.42, 0.014, 0.32, 0.3, hT + 0.015, -1.05, ir); }
  if (lv >= 4) { BX(f.X, 0.44, 0.2, 0.34, -0.3, top + 0.15, -0.9, V(P.glass)); BX(f.I, 0.48, 0.018, 0.38, -0.3, top + 0.26, -0.9, ir); SP(f.NL, 6, 0.06, 0.3, top + 0.13, -0.68, gn1); SP(f.NL, 6, 0.05, -0.85, top + 0.12, -0.68, gn2); }
  /* 招牌：贴墙竖匾（壁柱位）+ 挑出双面刃匾；lv3+ 两层高披挂匾；lv4 LED 巨幕(暗框) + 檐口泛光带 */
  var nB = [2, 4, 3, 2][lv - 1], bg2 = lv === 1 ? [P.faded, '#7a8a98', P.faded, '#9c6e58'] : [P.signR, P.signG, P.signB, P.signR], bh = [0.42, 0.52, 0.62, 0.66][lv - 1];
  for (i = 0; i < nB; i++) { var bx3 = [-0.735, 0.245, -0.245, 0.735][i]; BX(f.SG, 0.15, bh, 0.016, bx3, y0 + 0.05 + bh / 2, -0.571, V(bg2[i % 4]));
    if (i % 2) BX(f.SG, 0.018, bh - 0.08, 0.12, bx3 + 0.49, y0 + 0.1 + bh / 2, -0.5, V(bg2[(i + 1) % 4])); }
  if (lv >= 3) for (i = 0; i < (lv >= 4 ? 2 : 4); i++) { var vx = [-0.98, -0.245, 0.245, 0.988][i]; BX(f.SG, 0.12, 0.6, 0.014, vx, y0 + 0.42, -0.569, V(i % 2 ? P.signR : P.signG)); }
  if (lv >= 4) { BX(f.D, 0.22, 0.71, 0.012, -0.49, top + 0.05, -0.586, dk); BX(f.LC, 0.19, 0.68, 0.02, -0.49, top + 0.05, -0.578, V(P.ledC)); BX(f.D, 0.2, 0.61, 0.012, 0.496, top + 0.02, -0.586, dk); BX(f.LM, 0.17, 0.58, 0.02, 0.496, top + 0.02, -0.578, V(P.ledM));
    BX(f.WG, 2.4, 0.013, 0.012, 0, top - 0.02, -0.573, wm); }
  /* 街道：行道树（三层冠+树池+lv4 树灯）+ 绿篱花槽 + 双臂路灯 + 长椅(lv2+) + 车挡(lv3+) */
  function TR(x, z, s, lit) { BX(f.P, 0.1, 0.008, 0.1, x, 0.104, z, V(P.paveD)); CY(f.U, 5, 0.013, 0.019, 0.1, 0.1 + 0.34 * s, x, z, V(P.bark)); SP(f.N, 8, 0.17 * s, x, 0.1 + 0.46 * s, z, gn1);
    SP(f.NL, 6, 0.115 * s, x + 0.03 * s, 0.1 + 0.62 * s, z + 0.02 * s, gn2); SP(f.N, 5, 0.075 * s, x - 0.06 * s, 0.1 + 0.7 * s, z - 0.02 * s, V(P.gn3)); if (lit) BX(f.WG, 0.04, 0.022, 0.04, x, 0.115, z + 0.055, wm); }
  var nT = [3, 4, 5, 6][lv - 1], nH = [1, 2, 3, 3][lv - 1], nL = [2, 2, 3, 4][lv - 1];
  for (i = 0; i < nT; i++) TR(-1.0 + i * (2.0 / (nT - 1)), 0.5, [0.6, 0.7, 0.8, 0.9][lv - 1] * (0.9 + (i % 3) * 0.08), lv >= 4);
  for (i = 0; i < nH; i++) { var hx = nH > 1 ? -0.7 + i * (1.4 / (nH - 1)) : 0; BX(f.S, 0.52, 0.07, 0.15, hx, 0.135, 1.0, st); BX(f.NL, 0.47, 0.06, 0.11, hx, 0.2, 1.0, V(P.gn3)); SP(f.NL, 6, 0.045, hx - 0.15, 0.25, 1.0, gn1); SP(f.NL, 6, 0.045, hx + 0.15, 0.25, 1.0, gn2); }
  function LP(x, z, lit) { var lb = lit ? f.WG : f.I, lc = lit ? wm : ir; CY(f.I, 6, 0.02, 0.028, 0.1, 0.14, x, z, ir); CY(f.I, 6, 0.009, 0.013, 0.14, 0.66, x, z, ir); BX(f.I, 0.24, 0.012, 0.012, x, 0.65, z, ir);
    for (var k2 = -1; k2 <= 1; k2 += 2) { SP(lb, 6, 0.03, x + k2 * 0.1, 0.625, z, lc); CY(lb, 6, 0.004, 0.006, 0.638, 0.652, x + k2 * 0.1, z, lc); } }
  for (i = 0; i < nL; i++) LP(-0.9 + i * (1.8 / (nL - 1)), 0.78, lv >= 3);
  if (lv >= 2) for (i = 0; i < 2; i++) { var bx4 = i ? 0.62 : -0.62; BX(f.U, 0.24, 0.016, 0.07, bx4, 0.12, 0.66, V(P.bark)); BX(f.I, 0.02, 0.04, 0.06, bx4 - 0.09, 0.09, 0.66, ir); BX(f.I, 0.02, 0.04, 0.06, bx4 + 0.09, 0.09, 0.66, ir); }
  if (lv >= 3) for (i = 0; i < 5; i++) CY(f.I, 6, 0.011, 0.014, 0.1, 0.19, -0.8 + i * 0.4, 1.22, ir);
  /* 整体 x 镜像（穹顶转角→+x 近机位侧；flatShading 法线由屏幕导数求得，镜像安全）→ 合并建 mesh → 动画 */
  for (k in f.b) { var pp = f.b[k].p, nn = f.b[k].n; for (i = 0; i < pp.length; i += 3) { pp[i] = -pp[i]; nn[i] = -nn[i]; } }
  BUILD(f, g);
  var hm = g.userData.hotM;
  g.userData.anim = [
    function (t) { var a = hm[P.ledC], b = hm[P.ledM]; if (a) a.emissiveIntensity = 0.75 + 0.25 * (0.5 + 0.5 * S(t * 2.2)); if (b) b.emissiveIntensity = 0.75 + 0.25 * (0.5 + 0.5 * S(t * 1.7 + 2)); },
    function (t) { var m = hm[P.warm]; if (m) m.emissiveIntensity = 0.5 + 0.18 * (0.5 + 0.5 * S(t * 1.4)); }];
  return g;
}
window.Props3DModern = window.Props3DModern || {}; window.Props3DModern[10] = make10;
})();
