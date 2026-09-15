/* 大富翁·现代写实棋盘 格 9「城隍庙」—— 豫园金顶庙市四年代（1990s→2020s）· v2 材质精修
 * 视觉真源 refs/modern/prop_9.png（左上 1990s / 右上 2000s / 左下 2010s / 右下 2020s）。年代差异：lv1 单檐金顶殿+2F 灰瓦厢房
 *   +素石下沉池/九曲桥+前右小亭；lv2 +市集彩篷/红灯笼/3F/红栏/石牌坊；lv3 +屋顶玻璃天窗/摊位阳伞/暖光橱窗/重檐/4F；lv4 +铜绿穹顶/桥上红亭/三重金檐/檐口暖灯带/5F。
 * v2 材质工艺（对标 specials3d/tile29_water.js）：Canvas 多层化（基色晕染+噪点/风化+分缝线+高光，128px，顶点色承载主色调、贴图承载细节）；
 *   boxUV 按世界尺寸烘焙（主法线轴投影，ws=每重复米数）；材质分区：玻璃 rough0.15/metal0.75、金饰 metal0.85、朱漆 rough0.5、水面 rough0.12/metal0.3；
 *   发光件（暖窗/灯笼/金顶）每实例新建独立材质 + 呼吸动画（userData.hotM）。
 * 契约：window.Props3DModern[9](level 1..4) → 全新 Group；占地 ≤2.6×2.6、底面 y=0、正面 +z；每级 mesh ≤55（合并 BufferGeometry，v2 增量 +0）；
 *   零 Math.random（种子 LCG）；动画 ≤2 项。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') return;
var PI = Math.PI, S = Math.sin, Co = Math.cos, _PC = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function RG(s) { s = (s >>> 0) || 909; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
/* ---------- Canvas 多层纹理（≤128px；基色晕染+噪点/风化+分缝+高光；模块级缓存，材质每实例新建） ---------- */
var _TXC = {};
function TX(id, ws, draw) {
  if (_TXC[id]) return _TXC[id];
  var cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; draw(cv.getContext('2d'), 128, 128, RG(id.charCodeAt(1) * 131 + (ws * 10) | 0));
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return _TXC[id] = { t: t, ws: ws };
}
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,' + a + ')' : 'rgba(22,20,16,' + a + ')'; g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); } }
var TEX = {
  tile: TX('t9tile', 1.0, function (g, w, h, R) { g.fillStyle = '#eef1f6'; g.fillRect(0, 0, w, h); var x, y, i;   /* 灰瓦：垄滚釉+暗横缝+苔点 */
    for (x = 0; x < w; x += 16) { g.fillStyle = 'rgba(28,38,52,0.55)'; g.fillRect(x + 12, 0, 4, h); g.fillStyle = 'rgba(255,255,255,0.6)'; g.fillRect(x + 1, 0, 2, h); }
    for (y = 10; y < h; y += 22) { g.fillStyle = 'rgba(18,24,32,0.4)'; g.fillRect(0, y, w, 2); } for (i = 0; i < 10; i++) { g.fillStyle = 'rgba(92,122,58,' + (0.12 + R() * 0.16).toFixed(2) + ')'; g.fillRect(R() * w, 78 + R() * 46, 2 + R() * 5, 2 + R() * 3); } }),
  gold: TX('t9gold', 0.8, function (g, w, h, R) { g.fillStyle = '#fff3d8'; g.fillRect(0, 0, w, h); var x, y, i;   /* 金瓦：竖瓦条+行缝+高光碎金 */
    for (x = 0; x < w; x += 10) { g.fillStyle = 'rgba(150,104,26,0.4)'; g.fillRect(x + 8, 0, 2, h); g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(x + 2, 0, 2, h); }
    for (y = 0; y < h; y += 32) { g.fillStyle = 'rgba(150,104,26,0.35)'; g.fillRect(0, y, w, 2); } for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,255,240,0.5)'; g.fillRect(R() * w, R() * h, 1, 1); } }),
  plas: TX('t9plas', 1.6, function (g, w, h, R) { g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h); var i, x0;    /* 灰泥墙：雨渍+发丝裂纹+底部泛潮+噪点 */
    for (i = 0; i < 9; i++) { g.fillStyle = 'rgba(120,110,88,' + (0.05 + R() * 0.07).toFixed(2) + ')'; g.fillRect(R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80); }
    for (i = 0; i < 4; i++) { x0 = R() * w; g.strokeStyle = 'rgba(110,100,80,0.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); } g.fillStyle = 'rgba(90,84,66,0.10)'; g.fillRect(0, 108, w, 20); SPK(g, w, h, 120, 0.05, R); }),
  ash: TX('t9ash', 1.1, function (g, w, h, R) { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); var x, y;       /* 砌石：错缝分块+块面色差+噪点（铺装换 ws 复用） */
    for (y = 0; y < h; y += 32) { g.fillStyle = 'rgba(96,90,74,0.5)'; g.fillRect(0, y, w, 2); var o = (y / 32) % 2 ? 32 : 0;
      for (x = o; x < w; x += 64) { g.fillStyle = 'rgba(96,90,74,0.4)'; g.fillRect(x, y, 2, 32); g.fillStyle = R() > 0.5 ? 'rgba(255,255,250,0.10)' : 'rgba(70,64,52,0.10)'; g.fillRect(x + 3, y + 3, 60, 27); } }
    SPK(g, w, h, 90, 0.06, R); }),
  wat: TX('t9wat', 1.3, function (g, w, h, R) { g.fillStyle = '#eef6f4'; g.fillRect(0, 0, w, h); var i, j;       /* 池水：波纹高光+暗斑 */
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2; for (i = 0; i < 5; i++) { g.beginPath(); for (j = 0; j <= 8; j++) { var x = j * 16, y = i * 26 + 6 * S(j * 1.3 + i); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
    for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(12,50,38,0.14)'; g.fillRect(R() * w, R() * h, 10 + R() * 16, 4 + R() * 8); } }),
  leaf: TX('t9leaf', 0.7, function (g, w, h, R) { g.fillStyle = '#f0f6e6'; g.fillRect(0, 0, w, h); var i;        /* 树冠：明暗叶斑 */
    for (i = 0; i < 34; i++) { g.fillStyle = i % 2 ? 'rgba(34,66,24,0.28)' : 'rgba(255,255,240,0.30)'; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } }),
  lac: TX('t9lac', 0.9, function (g, w, h, R) { g.fillStyle = '#fbece6'; g.fillRect(0, 0, w, h); var x;          /* 朱漆：木纹+竖向高光 */
    for (x = 0; x < w; x += 7) { g.fillStyle = 'rgba(90,12,6,0.28)'; g.fillRect(x, 0, 1, h); if (x % 28 === 0) { g.fillStyle = 'rgba(255,224,210,0.5)'; g.fillRect(x + 3, 0, 3, h); } } SPK(g, w, h, 40, 0.05, R); })
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
/* 翘檐歇山顶：脊顶 y+h，檐角上翘 lift，檐中 cl；檐口随曲线下垂裙板 + 正脊 + 脊端圆珠；rot=脊沿 z */
function CR(u, w, d, h, ov, cl, lift, x, y, z, col, rot) {
  var hw = w / 2 + ov, hd = d / 2 + ov, rw = w * 0.2, yc = y + cl + lift, ym = y + cl, i;
  function M(dx, dy, dz) { return rot ? [x + dz, dy, z + dx] : [x + dx, dy, z + dz]; }
  var A = M(-rw, y + h, 0), Bb = M(rw, y + h, 0), FL = M(-hw, yc, hd), FR = M(hw, yc, hd), BL = M(-hw, yc, -hd), BR = M(hw, yc, -hd);
  var MF = M(0, ym, hd), MB = M(0, ym, -hd), ML = M(-hw, ym, 0), MR = M(hw, ym, 0), E = [FL, MF, FR, MR, BR, MB, BL, ML, FL];
  TRI(u, A, FL, MF, col); TRI(u, A, MF, FR, col); TRI(u, A, FR, Bb, col); TRI(u, A, MB, BL, col); TRI(u, A, BR, MB, col); TRI(u, A, Bb, BR, col);
  TRI(u, A, ML, BL, col); TRI(u, A, FL, ML, col); TRI(u, Bb, BR, MR, col); TRI(u, Bb, MR, FR, col);
  for (i = 0; i < 8; i++) QAD(u, E[i], E[i + 1], [E[i + 1][0], E[i + 1][1] - 0.035, E[i + 1][2]], [E[i][0], E[i][1] - 0.035, E[i][2]], col);
  BX(u, rot ? 0.05 : rw * 2.2, 0.035, rot ? rw * 2.2 : 0.05, x, y + h + 0.012, z, col);
  for (i = -1; i <= 1; i += 2) { var e = M(i * (rw + 0.03), y + h + 0.04, 0); SP(u, 6, 0.028, e[0], e[1], e[2], col); }
}
function AWN(u, cx, cz, th, y, v0, w, dep, drop, ca, cb) {        /* 条纹斜篷（3 段交替色，可朝向） */
  var ct = Co(th), st = S(th);
  function L(uu, v, yy) { return [cx + uu * ct + v * st, yy, cz - uu * st + v * ct]; }
  for (var i = 0; i < 3; i++) { var u0 = -w / 2 + i * w / 3, u1 = u0 + w / 3; QAD(u, L(u0, v0, y), L(u1, v0, y), L(u1, v0 + dep, y - drop), L(u0, v0 + dep, y - drop), i % 2 ? cb : ca); }
}
function LN(f, x, y, z, s) { CY(f.WG, 8, 0.048 * s, 0.048 * s, y - 0.04 * s, y + 0.04 * s, x, z, V('#d8402c')); BX(f.Y, 0.04 * s, 0.014, 0.04 * s, x, y + 0.046 * s, z, V('#d8a848')); BX(f.Y, 0.03 * s, 0.03, 0.03 * s, x, y - 0.05 * s, z, V('#d8a848')); }
function TR(f, x, z, s) { BX(f.U, 0.05 * s, 0.22 * s, 0.05 * s, x, 0.12 + 0.11 * s, z, V('#6a4e30')); SP(f.N, 6, 0.13 * s, x, 0.12 + 0.28 * s, z, V('#5f7f3d')); SP(f.NL, 6, 0.085 * s, x + 0.06 * s, 0.12 + 0.35 * s, z + 0.04 * s, V('#7a9a4e')); }
function RAIL(f, x0, z0, x1, z1, n) { var c = V('#dcd6c8'), i; for (i = 0; i <= n; i++) BX(f.S, 0.024, 0.09, 0.024, x0 + (x1 - x0) * i / n, 0.165, z0 + (z1 - z0) * i / n, c); BX(f.S, x0 === x1 ? 0.02 : Math.abs(x1 - x0) + 0.03, 0.018, z0 === z1 ? 0.02 : Math.abs(z1 - z0) + 0.03, (x0 + x1) / 2, 0.205, (z0 + z1) / 2, c); }
function PAV(f, x, z, w, d, hp) {                                 /* 红柱小亭 */
  for (var i = -1; i <= 1; i += 2) for (var k = -1; k <= 1; k += 2) BX(f.R, 0.05, hp, 0.05, x + i * w / 2, 0.12 + hp / 2, z + k * d / 2, V(P.red));
  BX(f.R, w + 0.05, 0.04, d + 0.05, x, 0.12 + hp, z, V(P.red)); CR(f.T, w + 0.1, d + 0.1, 0.11, 0.06, 0.01, 0.035, x, 0.14 + hp, z, V(P.tile));
}
function PLATE(txt, w, h, bg, fg, bd) {                          /* 匾额 Canvas 256×128 */
  var cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; var g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 256, 128); g.strokeStyle = bd; g.lineWidth = 10; g.strokeRect(10, 10, 236, 108);
  g.fillStyle = fg; g.font = 'bold 84px "Microsoft YaHei","SimHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 68);
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: C(fg), emissiveMap: t, emissiveIntensity: 0.3 }));
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
var P = { gold: '#dfa940', tile: '#3b4149', wall: '#e9e2d3', wallD: '#d9d0bc', red: '#a83a26', stone: '#b4ada0', stoneD: '#948d7e', path: '#b3ab9c',
  water: '#37604f', glass: '#a3bccb', copp: '#7a9e88', dark: '#2a2622', awnB: '#5a7ca4', awnR: '#b24838', awnW: '#e6dcc4', glow: '#ffd68e' };
/* ---------- 庙市厢房块（可朝向 th）：cream 墙 + 红柱 + 灰瓦翘檐 + 彩篷/暖橱窗/天窗/穹顶 ---------- */
function BLK(f, lv, cx, cz, th, fw, fd, fl, seed, dome) {
  var R = RG(seed), ct = Co(th), st = S(th), y = 0.12, nw = Math.max(1, Math.round(fw / 0.27)), wall = V(P.wall), red = V(P.red), dk = V(P.dark), tw = V(P.tile), i, k, p, h;
  function L(u, v) { return [cx + u * ct + v * st, cz - u * st + v * ct]; }
  for (i = 0; i < fl; i++) {
    h = i ? 0.21 : 0.3; BX(f.W, fw, h - 0.015, fd, cx, y + h / 2, cz, i % 2 ? V(P.wallD) : wall, th);
    for (k = 0; k <= nw; k++) { p = L(-fw / 2 + k * fw / nw, fd / 2 - 0.02); BX(f.R, 0.055, h, 0.055, p[0], y + h / 2, p[1], red, th); }
    for (k = 0; k < nw; k++) { p = L(-fw / 2 + (k + 0.5) * fw / nw, fd / 2 + 0.006);
      if (i) BX(f.D, 0.11, 0.12, 0.02, p[0], y + h / 2, p[1], dk, th); else BX(lv >= 3 ? f.WG : f.D, fw / nw * 0.6, 0.17, 0.02, p[0], y + 0.15, p[1], lv >= 3 ? V(P.glow) : dk, th); }
    if (i) { p = L(0, fd / 2 + 0.04); BX(f.S, fw + 0.06, 0.022, 0.1, p[0], y + 0.01, p[1], V(P.stone), th); if (lv >= 2) { p = L(0, fd / 2 + 0.085); BX(f.R, fw + 0.06, 0.045, 0.02, p[0], y + 0.055, p[1], red, th); } }
    else if (lv >= 2) AWN(f.A, cx, cz, th, y + 0.27, fd / 2 + 0.01, fw * 0.94, 0.15, 0.08, V(R() > 0.5 ? P.awnB : P.awnR), V(P.awnW));
    y += h;
  }
  CR(f.T, fw + 0.06, fd + 0.04, 0.16, 0.06, 0.012, 0.045, cx, y - 0.01, cz, tw, Math.abs(st) > 0.5);
  if (lv >= 3 && !dome) for (k = -1; k <= 1; k += 2) { p = L(k * fw * 0.25, 0); BX(f.X, fw * 0.3, 0.05, fd * 0.42, p[0], y + 0.07, p[1], V(P.glass), th); }
  if (dome) { SP(f.CP, 10, 0.17, cx, y + 0.1, cz, V(P.copp), true); CY(f.Y, 6, 0.012, 0.012, y + 0.27, y + 0.36, cx, cz, V('#d8a848')); }
  if (lv >= 4) { p = L(0, fd / 2 + 0.09); BX(f.WG, fw * 0.9, 0.025, 0.025, p[0], y - 0.04, p[1], V(P.glow), th); }
}
function make9(level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), f = { b: {} }, g = new THREE.Group(), R = RG(90 + lv), i, k;
  g.name = 'prop_9_modern_lv' + lv; g.userData = { kind: 'property', propIdx: 9, level: lv, hotM: {} };
  f.S = B(f, 0.9, 0, '', 0, 'ash', 1.1); f.P = B(f, 0.95, 0, '', 0, 'ash', 1.6); f.W = B(f, 0.85, 0, '', 0, 'plas', 1.6); f.R = B(f, 0.5, 0, '', 0, 'lac', 0.9);
  f.T = B(f, 0.7, 0, '', 0, 'tile', 1.0); f.D = B(f, 0.96); f.X = B(f, 0.15, 0.75); f.N = B(f, 0.92, 0, '', 0, 'leaf', 0.7); f.NL = B(f, 0.91, 0, '', 0, 'leaf', 0.55);
  f.U = B(f, 0.89); f.A = B(f, 0.88); f.Y = B(f, 0.3, 0.85, '', 0, 'gold', 0.5); f.CP = B(f, 0.5, 0.3); f.WA = B(f, 0.12, 0.3, '', 0, 'wat', 1.3);
  f.WG = B(f, 0.4, 0, P.glow, 0.45); f.G = B(f, 0.42, 0.28, '#8a651c', 0.14, 'gold', 0.8);
  var st = V(P.stone), sd = V(P.stoneD), red = V(P.red), wall = V(P.wall), dk = V(P.dark), tw = V(P.tile);
  /* 地坪（挖出前左水池凹槽）+ 石板铺装（LCG 错缝）+ 下沉水池/九曲桥/白石栏（身份特征） */
  BX(f.P, 2.56, 0.12, 1.7, 0, 0.06, -0.43, V(P.path)); BX(f.P, 1.12, 0.12, 0.86, 0.72, 0.06, 0.85, V(P.path));
  for (i = 0; i < 15; i++) BX(f.S, 0.2 + R() * 0.08, 0.012, 0.15 + R() * 0.06, 0.05 + (i % 5) * 0.24, 0.126, 0.3 + Math.floor(i / 5) * 0.24, R() > 0.5 ? st : V(P.path), (R() - 0.5) * 0.1);
  BX(f.S, 1.44, 0.05, 0.86, -0.56, 0.025, 0.85, sd); BX(f.WA, 1.42, 0.03, 0.84, -0.56, 0.065, 0.85, V(P.water));
  BX(f.S, 0.06, 0.12, 0.86, -1.25, 0.06, 0.85, sd); BX(f.S, 1.44, 0.12, 0.06, -0.56, 0.06, 1.25, sd);
  for (i = 0; i < 3; i++) { var bx = -0.24 - i * 0.38, bz = 0.85 + (i % 2 ? 0.07 : -0.07); BX(f.S, 0.46, 0.03, 0.2, bx, 0.115, bz, st, i % 2 ? 0.45 : -0.45);
    for (k = -1; k <= 1; k += 2) BX(f.S, 0.025, 0.1, 0.025, bx + k * 0.18, 0.165, bz + k * 0.09, st); }
  RAIL(f, -1.26, 1.26, 0.2, 1.26, 7); RAIL(f, -1.26, 0.4, -1.26, 1.26, 4); if (lv >= 2) RAIL(f, 0.3, 1.26, 1.26, 1.26, 5);
  /* 中央金顶正殿：石台基 + 红柱 cream 墙 + 匾额 + 单檐(lv1)/重檐(lv2-3)/三重檐(lv4) 金顶 */
  var hs = [1.02, 1.5, 1.8, 2.2][lv - 1], hb = [0.4, 0.6, 0.72, 0.86][lv - 1], hx = 0, hz = -0.5, yb = 0.22 + hb;
  BX(f.S, 1.3, 0.1, 1.1, hx, 0.17, hz, st); BX(f.S, 0.5, 0.05, 0.3, hx, 0.145, hz + 0.62, sd);
  BX(f.W, 1.1, hb, 0.9, hx, 0.22 + hb / 2, hz, wall); BX(f.R, 1.18, 0.07, 0.98, hx, yb - 0.035, hz, red);
  for (i = -3; i <= 3; i += 2) BX(f.R, 0.08, hb, 0.08, hx + i * 0.18, 0.22 + hb / 2, hz + 0.48, red);
  for (i = -1; i <= 1; i += 2) { BX(f.R, 0.08, hb, 0.08, hx + i * 0.55, 0.22 + hb / 2, hz + 0.48, red); BX(f.R, 0.08, hb, 0.08, hx + i * 0.55, 0.22 + hb / 2, hz - 0.44, red); }
  BX(f.D, 0.26, 0.34, 0.05, hx, 0.39, hz + 0.46, dk);
  if (lv >= 3) for (i = -1; i <= 1; i += 2) BX(lv >= 4 ? f.WG : f.D, 0.16, 0.2, 0.04, hx + i * 0.36, 0.4, hz + 0.46, lv >= 4 ? V(P.glow) : dk);
  if (lv >= 2) { var pl = PLATE('城隍庙', 0.32, 0.12, '#5a1a12', '#e8c87a', '#d0a048'); pl.position.set(hx, 0.22 + 0.4 + (lv >= 3 ? 0.12 : 0), hz + 0.49); g.add(pl); }
  if (lv === 1) CR(f.G, 1.24, 1.0, hs - yb, 0.12, 0.02, 0.09, hx, yb, hz, V('#dfa940'));
  else {
    CR(f.G, 1.38, 1.18, 0.13, 0.1, 0.015, 0.07, hx, yb, hz, V('#dfa940')); BX(f.W, 0.9, 0.15, 0.7, hx, yb + 0.2, hz, wall); BX(f.R, 0.96, 0.05, 0.76, hx, yb + 0.255, hz, red);
    var ub = yb + 0.28;
    if (lv >= 4) { CR(f.G, 1.14, 0.94, 0.26, 0.09, 0.015, 0.08, hx, ub, hz, V('#dfa940')); BX(f.W, 0.72, 0.16, 0.54, hx, ub + 0.36, hz, wall); BX(f.R, 0.78, 0.05, 0.6, hx, ub + 0.415, hz, red); ub += 0.44; }
    CR(f.G, lv >= 4 ? 0.98 : 1.14, lv >= 4 ? 0.78 : 0.94, hs - ub, 0.1, 0.02, 0.1, hx, ub, hz, V('#dfa940'));
    for (i = -1; i <= 1; i += 2) LN(f, hx + i * 0.62, yb - 0.06, hz + 0.52, 1);
  }
  /* 周边商圈：左右厢房长翼（朝向内院）+ 后排配楼 + 前右小亭；楼层随年代增高 */
  var fl = [2, 3, 4, 5][lv - 1];
  BLK(f, lv, -1.0, -0.2, PI / 2, 1.5, 0.46, fl, 11, false); BLK(f, lv, 1.0, -0.2, -PI / 2, 1.5, 0.46, fl, 23, lv >= 4);
  BLK(f, lv, 0, -1.02, 0, 1.4, 0.34, fl, 37, false); PAV(f, 0.74, 0.9, 0.3, 0.26, 0.3);
  /* 前院石牌坊（lv2+）/ 桥上红亭（lv4）/ 摊位阳伞（lv3+）/ 树木 / 广场灯笼 */
  if (lv >= 2) { for (i = -1; i <= 1; i += 2) BX(f.S, 0.08, 0.44, 0.08, hx + i * 0.34, 0.34, 0.9, st); BX(f.S, 0.9, 0.06, 0.1, hx, 0.58, 0.9, st);
    CR(f.T, 0.44, 0.22, 0.1, 0.06, 0.01, 0.03, hx, 0.61, 0.9, tw); if (lv >= 4) SP(f.Y, 6, 0.03, hx, 0.75, 0.9, V('#d8a848')); }
  if (lv >= 4) { PAV(f, -0.6, 0.82, 0.34, 0.26, 0.3); for (i = -1; i <= 1; i += 2) LN(f, -0.6 + i * 0.3, 0.42, 1.0, 0.8); }
  if (lv >= 3) for (i = 0; i < 2; i++) { var sx = 0.3 + i * 0.8, sz = 0.6 + i * 0.44; BX(f.U, 0.24, 0.05, 0.16, sx, 0.26, sz, V('#6a4e30')); BX(f.U, 0.02, 0.3, 0.02, sx, 0.3, sz, V('#6a4e30')); CY(f.A, 8, 0, 0.16, 0.42, 0.5, sx, sz, i ? V(P.awnR) : V(P.awnB)); }
  TR(f, 1.12, 0.78, 0.95); TR(f, 0.42, 1.12, 0.85); TR(f, -0.55, 0.22, 0.8); TR(f, 0.5, 0.2, 0.7); TR(f, -0.42, 0.14, 0.6); TR(f, 1.1, 1.14, 0.75);
  if (lv >= 2) TR(f, 0.1, 1.14, 0.7); if (lv >= 3) { TR(f, -0.15, 0.32, 0.7); TR(f, 0.98, 0.64, 0.6); } if (lv >= 4) TR(f, 0.8, 0.5, 0.6);
  for (i = 0; i < [0, 2, 4, 6][lv - 1]; i++) LN(f, -0.6 + i * 0.24, 0.5 + (i % 2) * 0.04, 0.02 + (i % 2 ? 0.3 : 0), 0.7);
  BUILD(f, g);
  var hm = g.userData.hotM;
  g.userData.anim = [
    function (t) { var m = hm[P.glow]; if (m) m.emissiveIntensity = 0.4 + 0.18 * (0.5 + 0.5 * S(t * 1.6)); },
    function (t) { var m = hm['#8a651c']; if (m) m.emissiveIntensity = 0.12 + 0.1 * (0.5 + 0.5 * S(t * 0.8 + 1)); }];
  return g;
}
window.Props3DModern = window.Props3DModern || {}; window.Props3DModern[9] = make9;
})();
