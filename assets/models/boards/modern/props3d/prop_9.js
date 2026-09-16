/* 大富翁·现代写实棋盘 格 9「城隍庙」（BOARD[9] 沪上风华）—— 豫园金顶庙市四年代 · v3 结构精修（R1-R3）
 * 真源 refs/modern/prop_9.png（四象限 1990s/2000s/2010s/2020s）：L 形绿水池环抱前左角+石岸白栏+石拱桥/九曲板桥/湖心亭；
 *   灰瓦厢房三翼环抱石板大院（逐层腰檐+红木栏杆外廊+格窗窗台+彩篷店面+外壁层间木带）；石台基金顶大殿居中（lv1 金檐玄顶帽→lv2 双重檐
 *   +匾额+石牌坊→lv3 加高+玻璃天窗+摊位阳伞→lv4 三重金檐+铜绿穹顶+玻璃披屋+檐口暖灯带）。R1 结构重建（水体/桥亭/三翼/大殿台基/
 *   结构性年代演进）；R2 材质细节（瓦垄鳞纹/大石板缝/层间木带/穹顶鼓座/加大出檐）；R3 层层腰檐+外壁端面开窗+后檐回廊+大殿侧柱。
 * 工程：合并 BufferGeometry（桶=材质+boxUV 世界投影）、Canvas ≤128px 多层、零 Math.random（LCG）、(1..4) 全新 Group、占地 ≤2.6、贴地 y=0、正面 +z、mesh ≤55。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') return;
var PI = Math.PI, S = Math.sin, Co = Math.cos, _PC = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function RG(s) { s = (s >>> 0) || 909; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
var _TXC = {};
function TX(id, ws, draw) { if (_TXC[id]) return _TXC[id]; var cv = document.createElement('canvas'); cv.width = cv.height = 128; draw(cv.getContext('2d'), 128, 128, RG(id.charCodeAt(1) * 131 + (ws * 10) | 0));
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return _TXC[id] = { t: t, ws: ws }; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,' + a + ')' : 'rgba(22,20,16,' + a + ')'; g.fillRect(R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); } }
var TEX = {
  tile: TX('t9tile', 1.0, function (g, w, h, R) { g.fillStyle = '#333941'; g.fillRect(0, 0, w, h); var x, y, i;   /* 灰瓦：垄沟+鳞arc+苔点 */
    for (x = 0; x < w; x += 16) { g.fillStyle = 'rgba(8,10,14,0.6)'; g.fillRect(x + 13, 0, 3, h); g.fillStyle = 'rgba(182,198,208,0.42)'; g.fillRect(x + 1, 0, 2, h); }
    for (y = 6; y < h; y += 13) { g.fillStyle = 'rgba(8,10,14,0.45)'; g.fillRect(0, y, w, 2); for (x = 0; x < w; x += 16) { g.fillStyle = 'rgba(150,168,180,0.3)'; g.beginPath(); g.arc(x + 8, y + 2, 5, 0, PI); g.fill(); } }
    for (i = 0; i < 9; i++) { g.fillStyle = 'rgba(88,116,72,' + (0.12 + R() * 0.15).toFixed(2) + ')'; g.fillRect(R() * w, 78 + R() * 46, 2 + R() * 5, 2 + R() * 3); } }),
  gold: TX('t9gold', 0.8, function (g, w, h, R) { g.fillStyle = '#f7ddb0'; g.fillRect(0, 0, w, h); var x, y, i;   /* 金瓦：竖瓦条+行缝+碎金 */
    for (x = 0; x < w; x += 8) { g.fillStyle = 'rgba(158,102,18,0.42)'; g.fillRect(x + 6, 0, 2, h); g.fillStyle = 'rgba(255,250,230,0.5)'; g.fillRect(x + 1, 0, 2, h); }
    for (y = 0; y < h; y += 30) { g.fillStyle = 'rgba(150,96,20,0.32)'; g.fillRect(0, y, w, 2); } for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,252,235,0.5)'; g.fillRect(R() * w, R() * h, 1, 1); } }),
  plas: TX('t9plas', 1.6, function (g, w, h, R) { g.fillStyle = '#f6f1e6'; g.fillRect(0, 0, w, h); var i, x0;    /* 灰泥墙：雨渍+裂纹+泛潮+噪点 */
    for (i = 0; i < 9; i++) { g.fillStyle = 'rgba(120,110,88,' + (0.05 + R() * 0.07).toFixed(2) + ')'; g.fillRect(R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80); }
    for (i = 0; i < 4; i++) { x0 = R() * w; g.strokeStyle = 'rgba(110,100,80,0.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); } g.fillStyle = 'rgba(90,84,66,0.10)'; g.fillRect(0, 108, w, 20); SPK(g, w, h, 120, 0.05, R); }),
  ash: TX('t9ash', 1.1, function (g, w, h, R) { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); var x, y;       /* 砌石：错缝分块+色差 */
    for (y = 0; y < h; y += 32) { g.fillStyle = 'rgba(78,72,58,0.65)'; g.fillRect(0, y, w, 3); var o = (y / 32) % 2 ? 32 : 0;
      for (x = o; x < w; x += 64) { g.fillStyle = 'rgba(78,72,58,0.55)'; g.fillRect(x, y, 3, 32); g.fillStyle = R() > 0.5 ? 'rgba(255,255,250,0.12)' : 'rgba(70,64,52,0.12)'; g.fillRect(x + 4, y + 4, 58, 25); } } SPK(g, w, h, 90, 0.06, R); }),
  wat: TX('t9wat', 1.3, function (g, w, h, R) { g.fillStyle = '#eef6f4'; g.fillRect(0, 0, w, h); var i, j;       /* 池水：波纹高光+暗斑 */
    g.strokeStyle = 'rgba(255,255,255,0.55)'; g.lineWidth = 2; for (i = 0; i < 5; i++) { g.beginPath(); for (j = 0; j <= 8; j++) { var x = j * 16, y = i * 26 + 6 * S(j * 1.3 + i); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
    for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(12,50,38,0.14)'; g.fillRect(R() * w, R() * h, 10 + R() * 16, 4 + R() * 8); } }),
  leaf: TX('t9leaf', 0.7, function (g, w, h, R) { g.fillStyle = '#f0f6e6'; g.fillRect(0, 0, w, h); var i;        /* 树冠：明暗叶斑 */
    for (i = 0; i < 34; i++) { g.fillStyle = i % 2 ? 'rgba(34,66,24,0.28)' : 'rgba(255,255,240,0.30)'; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } }),
  lac: TX('t9lac', 0.9, function (g, w, h, R) { g.fillStyle = '#fbece6'; g.fillRect(0, 0, w, h); var x;          /* 朱漆木纹+竖高光 */
    for (x = 0; x < w; x += 7) { g.fillStyle = 'rgba(90,12,6,0.28)'; g.fillRect(x, 0, 1, h); if (x % 28 === 0) { g.fillStyle = 'rgba(255,224,210,0.5)'; g.fillRect(x + 3, 0, 3, h); } } SPK(g, w, h, 40, 0.05, R); })
};
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
function BX(u, w, h, d, x, y, z, col, ry) { var ca = Co(ry || 0), sa = S(ry || 0), y0 = y - h / 2, y1 = y + h / 2;
  function P(lx, lz, ly) { return [x + lx * ca + lz * sa, ly, z - lx * sa + lz * ca]; }
  var A = P(-w / 2, d / 2, y0), Bb = P(w / 2, d / 2, y0), Cc = P(w / 2, d / 2, y1), D = P(-w / 2, d / 2, y1), E = P(-w / 2, -d / 2, y0), F = P(w / 2, -d / 2, y0), G = P(w / 2, -d / 2, y1), H = P(-w / 2, -d / 2, y1);
  QAD(u, A, Bb, Cc, D, col); QAD(u, F, E, H, G, col); QAD(u, Bb, F, G, Cc, col); QAD(u, E, A, D, H, col); QAD(u, D, Cc, G, H, col); QAD(u, E, F, Bb, A, col); }
function CY(u, n, rt, rb, y0, y1, x, z, col) { for (var i = 0; i < n; i++) { var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI, c0 = Co(a0), s0 = S(a0), c1 = Co(a1), s1 = S(a1);
    QAD(u, [x + c0 * rb, y0, z + s0 * rb], [x + c1 * rb, y0, z + s1 * rb], [x + c1 * rt, y1, z + s1 * rt], [x + c0 * rt, y1, z + s0 * rt], col);
    if (rt > 0.004) TRI(u, [x, y1, z], [x + c0 * rt, y1, z + s0 * rt], [x + c1 * rt, y1, z + s1 * rt], col); } }
function SP(u, n, r, x, y, z, col, half) { var R = half ? 2 : 3, base = half ? 0 : -PI / 2, span = half ? PI / 2 : PI;
  for (var j = 0; j < R; j++) { var p0 = base + j / R * span, p1 = base + (j + 1) / R * span, w0 = Co(p0) * r, w1 = Co(p1) * r, y0 = y + S(p0) * r, y1 = y + S(p1) * r;
    for (var i = 0; i < n; i++) { var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI;
      QAD(u, [x + Co(a0) * w0, y0, z + S(a0) * w0], [x + Co(a1) * w0, y0, z + S(a1) * w0], [x + Co(a1) * w1, y1, z + S(a1) * w1], [x + Co(a0) * w1, y1, z + S(a0) * w1], col); } } }
/* 翘檐歇山顶：rot=0 脊沿 x / rot=1 脊沿 z（此时参数 d 管 x 向、w 管 z 向）；檐口垂裙+浅色正脊/垂脊线+脊端圆珠 */
function CR(u, w, d, h, ov, cl, lift, x, y, z, col, rot) { var hw = w / 2 + ov, hd = d / 2 + ov, rw = w * 0.2, yc = y + cl + lift, ym = y + cl, i, c2 = [Math.min(1, col[0] * 1.6 + 0.08), Math.min(1, col[1] * 1.6 + 0.08), Math.min(1, col[2] * 1.6 + 0.08)];
  function M(dx, dy, dz) { return rot ? [x + dz, dy, z + dx] : [x + dx, dy, z + dz]; }
  function HIP(p, q) { var dx = q[0] - p[0], dz = q[2] - p[2], l = Math.sqrt(dx * dx + dz * dz) || 1, ox = -dz / l * 0.009, oz = dx / l * 0.009; QAD(u, [p[0] + ox, p[1] + 0.008, p[2] + oz], [q[0] + ox, q[1] + 0.008, q[2] + oz], [q[0] - ox, q[1] + 0.008, q[2] - oz], [p[0] - ox, p[1] + 0.008, p[2] - oz], c2); }
  var A = M(-rw, y + h, 0), Bb = M(rw, y + h, 0), FL = M(-hw, yc, hd), FR = M(hw, yc, hd), BL = M(-hw, yc, -hd), BR = M(hw, yc, -hd);
  var MF = M(0, ym, hd), MB = M(0, ym, -hd), ML = M(-hw, ym, 0), MR = M(hw, ym, 0), E = [FL, MF, FR, MR, BR, MB, BL, ML, FL];
  TRI(u, A, FL, MF, col); TRI(u, A, MF, FR, col); TRI(u, A, FR, Bb, col); TRI(u, A, MB, BL, col); TRI(u, A, BR, MB, col); TRI(u, A, Bb, BR, col);
  TRI(u, A, ML, BL, col); TRI(u, A, FL, ML, col); TRI(u, Bb, BR, MR, col); TRI(u, Bb, MR, FR, col); HIP(A, FL); HIP(A, BL); HIP(Bb, FR); HIP(Bb, BR);
  for (i = 0; i < 8; i++) QAD(u, E[i], E[i + 1], [E[i + 1][0], E[i + 1][1] - 0.03, E[i + 1][2]], [E[i][0], E[i][1] - 0.03, E[i][2]], col);
  BX(u, rot ? 0.05 : rw * 2.2, 0.032, rot ? rw * 2.2 : 0.05, x, y + h + 0.012, z, c2);
  for (i = -1; i <= 1; i += 2) { var e = M(i * (rw + 0.03), y + h + 0.04, 0); SP(u, 8, 0.026, e[0], e[1], e[2], c2); } }
function AWN(u, x, z, y, nx, w, dep, drop, ca, cb) {                /* 三段彩篷：墙面锚点+外向 nx+沿墙 z */
  var z0 = z - w / 2, i;
  for (i = 0; i < 3; i++) QAD(u, [x, y, z0 + i * w / 3], [x, y, z0 + (i + 1) * w / 3], [x + nx * dep, y - drop, z0 + (i + 1) * w / 3], [x + nx * dep, y - drop, z0 + i * w / 3], i % 2 ? cb : ca); }
function RAIL(f, bk, col, x0, z0, x1, z1, n, y) {                  /* 栏杆：望柱+扶手+下枋（石白/木红） */
  var c = V(col), i, mx = (x0 + x1) / 2, mz = (z0 + z1) / 2, lx = Math.abs(x1 - x0) + 0.025, lz = Math.abs(z1 - z0) + 0.025;
  for (i = 0; i <= n; i++) BX(f[bk], 0.024, 0.17, 0.024, x0 + (x1 - x0) * i / n, y + 0.085, z0 + (z1 - z0) * i / n, c);
  BX(f[bk], lx, 0.018, lz, mx, y + 0.175, mz, c); BX(f[bk], lx, 0.013, lz, mx, y + 0.02, mz, c); }
function LN(f, x, y, z, s) { CY(f.WG, 8, 0.05 * s, 0.042 * s, y - 0.05 * s, y + 0.045 * s, x, z, V('#d8402c')); BX(f.Y, 0.04 * s, 0.016, 0.04 * s, x, y + 0.056 * s, z, V('#d8a848')); BX(f.Y, 0.032 * s, 0.03, 0.032 * s, x, y - 0.066 * s, z, V('#d8a848')); }
function TR(f, x, z, s) { BX(f.U, 0.06 * s, 0.26 * s, 0.06 * s, x, 0.1 + 0.13 * s, z, V('#6a4a30'));
  SP(f.N, 9, 0.17 * s, x, 0.1 + 0.32 * s, z, V(P.leaf)); SP(f.N, 7, 0.11 * s, x - 0.1 * s, 0.1 + 0.44 * s, z + 0.05 * s, V(P.leafL)); SP(f.N, 7, 0.095 * s, x + 0.11 * s, 0.1 + 0.42 * s, z - 0.06 * s, V(P.leafD)); }
function ARCH(f, x, z0, wd) { var tp = [0.17, 0.23, 0.27, 0.23, 0.17];   /* 石拱桥：5 段踏步拱面+两侧望柱栏板 */
  for (var i = 0; i < 5; i++) { var zc = z0 + 0.08 + i * 0.15, k; BX(f.S, wd, 0.04, 0.15, x, tp[i] - 0.02, zc, V(P.stone));
    for (k = -1; k <= 1; k += 2) { BX(f.S, 0.028, 0.13, 0.028, x + k * (wd / 2 - 0.018), tp[i] + 0.045, zc, V(P.pale)); BX(f.S, 0.024, 0.018, 0.14, x + k * (wd / 2 - 0.018), tp[i] + 0.115, zc, V(P.pale)); } } }
function GATE(f, lv, x, z) {                                       /* 石牌坊：双柱+小额枋+灰瓦悬山（lv4 叠顶珠） */
  for (var i = -1; i <= 1; i += 2) { BX(f.S, 0.13, 0.08, 0.13, x + i * 0.3, 0.14, z, V(P.stoneD)); BX(f.R, 0.055, 0.4, 0.055, x + i * 0.3, 0.3, z, V(P.red)); BX(f.R, 0.045, 0.32, 0.045, x + i * 0.11, 0.28, z, V(P.red)); }
  BX(f.R, 0.72, 0.045, 0.08, x, 0.515, z, V(P.red)); BX(f.R, 0.46, 0.04, 0.07, x, 0.435, z, V(P.red)); CR(f.T, 0.52, 0.24, 0.08, 0.06, 0.012, 0.03, x, 0.545, z, V(P.tile), 0);
  if (lv >= 4) { CR(f.T, 0.3, 0.16, 0.06, 0.05, 0.01, 0.025, x, 0.655, z, V(P.tile), 0); BX(f.Y, 0.03, 0.06, 0.03, x, 0.745, z, V('#d8a848')); } }
function PAV(f, x, z, w, d, hp) { var i, k;                        /* 水上红柱灰瓦亭：石台基+4 柱+翘檐 */
  BX(f.S, w + 0.08, 0.12, d + 0.08, x, 0.06, z, V(P.stoneD));
  for (i = -1; i <= 1; i += 2) for (k = -1; k <= 1; k += 2) BX(f.R, 0.042, hp, 0.042, x + i * (w / 2 - 0.015), 0.12 + hp / 2, z + k * (d / 2 - 0.015), V(P.red));
  BX(f.R, w + 0.06, 0.03, d + 0.06, x, 0.12 + hp, z, V(P.red)); CR(f.T, w + 0.1, d + 0.1, 0.1, 0.07, 0.012, 0.04, x, 0.135 + hp, z, V(P.tile), 0); }
function LAMP(f, x, z) { BX(f.S, 0.05, 0.06, 0.05, x, 0.13, z, V(P.stoneD)); BX(f.S, 0.032, 0.24, 0.032, x, 0.27, z, V(P.stoneD)); BX(f.WG, 0.062, 0.075, 0.062, x, 0.42, z, V(P.glow)); BX(f.S, 0.095, 0.022, 0.095, x, 0.465, z, V(P.stoneD)); }
function STALL(f, x, z, ca) {                                      /* 庙市摊位：木桌+货品+遮阳伞 */
  BX(f.U, 0.24, 0.035, 0.15, x, 0.27, z, V('#7a5a38')); BX(f.U, 0.024, 0.14, 0.024, x - 0.1, 0.19, z, V('#5f452c')); BX(f.U, 0.024, 0.14, 0.024, x + 0.1, 0.19, z, V('#5f452c'));
  BX(f.A, 0.09, 0.05, 0.07, x - 0.05, 0.315, z, V(P.awnW)); BX(f.A, 0.07, 0.045, 0.06, x + 0.06, 0.31, z, ca);
  BX(f.U, 0.02, 0.28, 0.02, x, 0.36, z, V('#5f452c')); CY(f.A, 8, 0.005, 0.17, 0.44, 0.53, x, z, ca); }
function PLATE(txt, w, h, bg, fg, bd) { var cv = document.createElement('canvas'); cv.width = 256; cv.height = 128; var g = cv.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 256, 128); g.strokeStyle = bd; g.lineWidth = 10; g.strokeRect(10, 10, 236, 108);
  g.fillStyle = fg; g.font = 'bold 84px "Microsoft YaHei","SimHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, 128, 68);
  var t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding;
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: C(fg), emissiveMap: t, emissiveIntensity: 0.3 })); }
function BUILD(f, g) { for (var k in f.b) { var u = f.b[k]; if (!u.nv) continue;
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(u.p, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(u.n, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(u.u, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(u.c, 3)); geo.setIndex(u.i);
    var a = k.split('|'), m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: +a[0], metalness: +a[1], flatShading: true, side: THREE.DoubleSide });
    if (a[2]) { m.emissive = C(a[2]); m.emissiveIntensity = +a[3]; g.userData.hotM[a[2]] = m; }
    if (a[4] && TEX[a[4]]) m.map = TEX[a[4]].t;
    var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms); } }
var P = { gold: '#dfa940', tile: '#363c46', wall: '#ece4d0', wallD: '#dcd1b9', red: '#a63622', wood: '#7d3a28', stone: '#c6bfae', stoneD: '#9d9585', pale: '#ded8c8', path: '#b7ae9a',
  water: '#457a63', glass: '#a8c4d4', copp: '#8db098', dark: '#2e2a26', awnB: '#4a6a9a', awnR: '#b04838', awnO: '#c98a3a', awnW: '#e8dfc8', glow: '#ffd68e', leaf: '#5c8440', leafL: '#7ba354', leafD: '#49703a' };
/* 厢房翼：fc 0 前面+x / 1 前面-x；逐层红木栏杆外廊+格窗窗台+彩篷店面+外壁层间木带；kind 1 玻璃披屋 / 2 铜绿穹顶(代屋面) */
function BLK(f, lv, cx, cz, w, d, fl, fc, seed, kind) { var i, k, n = [[1, 0], [-1, 0]][fc], span = d, longZ = d > w, tw = V(P.tile);
  var gh = [0.24, 0.27, 0.29, 0.31][lv - 1], y = 0.1, wood = V(P.wood), dk = V(P.dark), fx = cx + n[0] * w / 2, ox = cx - n[0] * (w / 2 + 0.008), nb = Math.max(2, Math.round(span / 0.32)), aw = span / nb, dome = kind === 2 && lv >= 4;
  for (i = 0; i < fl; i++) { var fh = i ? 0.19 : gh;
    BX(f.W, w, fh - 0.01, d, cx, y + fh / 2, cz, i % 2 ? V(P.wallD) : V(P.wall)); BX(f.D, 0.12, 0.13, 0.024, cx, y + fh * 0.58, cz + d / 2 + 0.008, dk);
    for (k = -1; k <= 1; k += 2) { BX(f.R, 0.016, 0.024, d - 0.03, cx + k * (w / 2 + 0.007), y + fh - 0.02, cz, wood); BX(f.R, w + 0.02, 0.024, 0.016, cx, y + fh - 0.02, cz + k * (d / 2 + 0.007), wood); }
    for (k = 0; k <= nb; k++) { var mp = -span / 2 + k * span / nb; BX(f.R, 0.05, fh, 0.04, fx + n[0] * 0.012, y + fh / 2, cz + mp, wood); }
    for (k = 0; k < nb; k++) {
      var pz = cz - span / 2 + (k + 0.5) * span / nb, px = fx + n[0] * 0.008, ca = [P.awnR, P.awnB, P.awnO][(k + seed) % 3];
      if (!i) { BX(f.D, 0.03, 0.17, aw * 0.72, px, y + 0.13, pz, dk);
        if (lv >= 2) AWN(f.A, px + n[0] * 0.05, pz, y + gh - 0.015, n[0], aw * 0.92, 0.12, 0.05, V(ca), V(P.awnW)); }
      else { BX(f.D, 0.024, 0.13, 0.12, px, y + fh * 0.6, pz, dk); BX(f.S, 0.036, 0.016, 0.16, px + n[0] * 0.012, y + fh * 0.36, pz, V(P.pale)); BX(f.D, 0.024, 0.13, 0.12, ox, y + fh * 0.6, pz, dk); } }
    if (i) { BX(f.R, 0.07, 0.016, d, fx + n[0] * 0.035, y - 0.005, cz, wood); AWN(f.T, fx + n[0] * 0.004, cz, y + 0.004, n[0], d + 0.02, 0.12, 0.06, tw, tw); AWN(f.T, cx - n[0] * (w / 2 + 0.002), cz, y + 0.004, -n[0], d + 0.02, 0.08, 0.045, tw, tw);
      RAIL(f, 'R', P.wood, fx + n[0] * 0.075, cz - span / 2 + 0.03, fx + n[0] * 0.075, cz + span / 2 - 0.03, Math.round(span / 0.16), y); }
    y += fh; }
  if (dome) { CY(f.W, 12, w * 0.5, w * 0.56, y, y + 0.06, cx, cz, V(P.wall)); SP(f.CP, 12, w * 0.54, cx, y + 0.05, cz, V(P.copp), true); CY(f.Y, 8, 0.01, 0.018, y + 0.2, y + 0.33, cx, cz, V('#d8a848')); }
  else CR(f.T, longZ ? d + 0.06 : w + 0.02, longZ ? w + 0.02 : d + 0.06, 0.17, 0.07, 0.015, 0.05, cx, y, cz, V(P.tile), 1);
  if (lv >= 3 && kind !== 2) BX(f.X, w * 0.46, 0.026, d * 0.46, cx, y + 0.085, cz, V(P.glass));
  if (kind === 1 && lv >= 4) { BX(f.X, w * 0.6, 0.1, d * 0.34, cx, y + 0.115, cz - d * 0.22, V(P.glass)); BX(f.Y, 0.03, 0.018, d * 0.38, cx, y + 0.172, cz - d * 0.22, V('#d8a848')); } }
function make9(level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), f = { b: {} }, g = new THREE.Group(), i, k;
  g.name = 'prop_9_modern_lv' + lv; g.userData = { kind: 'property', propIdx: 9, level: lv, hotM: {} };
  f.S = B(f, 0.9, 0, '', 0, 'ash', 1.1); f.P = B(f, 0.95, 0, '', 0, 'ash', 1.0); f.W = B(f, 0.85, 0, '', 0, 'plas', 1.6);
  f.R = B(f, 0.55, 0, '', 0, 'lac', 0.9); f.T = B(f, 0.7, 0, '', 0, 'tile', 1.0); f.D = B(f, 0.96); f.X = B(f, 0.15, 0.75);
  f.N = B(f, 0.92, 0, '', 0, 'leaf', 0.7); f.U = B(f, 0.89); f.A = B(f, 0.88); f.Y = B(f, 0.3, 0.85, '', 0, 'gold', 0.5);
  f.G = B(f, 0.42, 0.28, '#8a651c', 0.14, 'gold', 0.8); f.CP = B(f, 0.5, 0.3);
  f.WA = B(f, 0.12, 0.3, '', 0, 'wat', 1.3); f.WB = B(f, 0.14, 0.3, '', 0, 'wat', 1.0); f.WG = B(f, 0.4, 0, '#ffd68e', 0.45);
  var st = V(P.stone), stc = V(P.stoneD), red = V(P.red), wall = V(P.wall), tw = V(P.tile), dk = V(P.dark), au = V('#d8a848');
  /* 地盘石基座+三区大石板铺装（挖出 L 形水池）+池水（前带 WA / 西汊 WB）+驳岸条石+沿岸白栏杆 */
  BX(f.S, 2.56, 0.06, 2.56, 0, 0.03, 0, stc);
  BX(f.P, 1.16, 0.05, 2.5, 0.7, 0.085, 0, V(P.path)); BX(f.P, 0.84, 0.05, 1.8, -0.32, 0.085, -0.37, V(P.path)); BX(f.P, 0.53, 0.05, 1.13, -1.005, 0.085, -0.705, V(P.path));
  BX(f.WA, 1.36, 0.045, 0.66, -0.585, 0.058, 0.89, V(P.water)); BX(f.WB, 0.48, 0.045, 0.66, -0.98, 0.058, 0.21, V(P.water));
  BX(f.S, 1.36, 0.05, 0.07, -0.585, 0.08, 0.535, stc); BX(f.S, 0.07, 0.05, 0.68, -0.715, 0.08, 0.21, stc); BX(f.S, 0.06, 0.05, 0.66, 0.115, 0.08, 0.89, stc);
  RAIL(f, 'S', P.pale, -1.25, 1.25, 1.25, 1.25, 15, 0.06); RAIL(f, 'S', P.pale, -1.25, -0.08, -1.25, 1.24, 8, 0.06);
  RAIL(f, 'S', P.pale, -1.24, 0.5, 0.06, 0.5, 7, 0.105); RAIL(f, 'S', P.pale, -0.68, -0.06, -0.68, 0.14, 1, 0.105);
  /* 石拱桥（跨前带）+九曲板桥（连湖心亭）+湖心亭 */
  ARCH(f, -0.32, 0.5, 0.34); BX(f.S, 0.38, 0.035, 0.16, -0.86, 0.115, 0.3, st); BX(f.S, 0.16, 0.035, 0.3, -1.02, 0.115, 0.44, st);
  for (i = -1; i <= 1; i += 2) BX(f.S, 0.026, 0.12, 0.026, -0.86, 0.19, 0.3 + i * 0.07, stc);
  PAV(f, -0.98, 0.68, 0.32, 0.28, 0.24);
  /* 中央金顶大殿（hx）：双阶石台基+前踏步+红柱 Cream 墙+朱门金钉+金檐（lv1 玄顶帽 / lv2+ 重檐 / lv4 三重檐） */
  var hx = 0.22, hb = [0.38, 0.46, 0.54, 0.6][lv - 1], yb = 0.18 + hb, sk = [0.24, 0.26, 0.3, 0.34][lv - 1];
  BX(f.S, 1.3, 0.1, 0.96, hx, 0.05, -0.62, st); BX(f.S, 1.18, 0.1, 0.84, hx, 0.13, -0.6, stc);
  BX(f.S, 0.42, 0.04, 0.12, hx, 0.12, -0.08, stc); BX(f.S, 0.42, 0.04, 0.12, hx, 0.08, 0.03, stc);
  BX(f.W, 1.12, hb, 0.76, hx, 0.18 + hb / 2, -0.6, wall); BX(f.R, 1.16, 0.05, 0.8, hx, 0.205, -0.6, red);
  var cols = [-0.5, -0.26, 0.26, 0.5, -0.5, 0.5, -0.58, 0.58], colz = [-0.21, -0.21, -0.21, -0.21, -0.99, -0.99, -0.6, -0.6];
  for (i = 0; i < 8; i++) BX(f.R, 0.07, hb, 0.07, hx + cols[i], 0.18 + hb / 2, colz[i], red);
  BX(f.D, 0.3, 0.3, 0.04, hx, 0.33, -0.205, V('#5a1a12'));
  for (i = -1; i <= 1; i += 2) for (k = -1; k <= 1; k += 2) BX(f.Y, 0.024, 0.024, 0.014, hx + i * 0.07, 0.3 + (k > 0 ? 0.09 : 0.02), -0.195, au);
  for (i = -1; i <= 1; i += 2) BX(lv >= 3 ? f.WG : f.D, 0.2, 0.2, 0.03, hx + i * 0.4, 0.4, -0.21, lv >= 3 ? V(P.glow) : dk);
  CR(f.G, [1.46, 1.42, 1.42, 1.46][lv - 1], [1.08, 1.04, 1.04, 1.08][lv - 1], sk, 0.13, 0.02, 0.09, hx, yb, -0.6, V(P.gold), 0);
  var t1 = yb + sk;
  if (lv === 1) { CR(f.T, 0.88, 0.62, 0.2, 0.1, 0.02, 0.08, hx, t1 - 0.02, -0.6, tw, 0); SP(f.G, 8, 0.034, hx, t1 + 0.23, -0.6, V(P.gold)); CY(f.G, 6, 0, 0.018, t1 + 0.25, t1 + 0.33, hx, -0.6, V(P.gold)); }
  else { BX(f.W, 0.78, 0.07, 0.54, hx, t1 + 0.035, -0.6, wall); var u1 = t1 + 0.07;
    if (lv >= 4) { CR(f.G, 1.06, 0.78, 0.24, 0.1, 0.02, 0.08, hx, u1, -0.6, V(P.gold), 0); u1 += 0.24; BX(f.W, 0.56, 0.07, 0.4, hx, u1 + 0.035, -0.6, wall); u1 += 0.07; }
    CR(f.G, 0.92, 0.66, lv === 2 ? 0.26 : 0.4, 0.1, 0.02, 0.09, hx, u1, -0.6, V(P.gold), 0);
    var tp = u1 + (lv === 2 ? 0.26 : 0.4);
    CY(f.Y, 8, 0.012, 0.026, tp + 0.02, tp + (lv >= 3 ? 0.14 : 0.07), hx, -0.6, au); SP(f.Y, 8, 0.03, hx, tp + (lv >= 3 ? 0.17 : 0.1), -0.6, au);
    for (i = -1; i <= 1; i += 2) LN(f, hx + i * 0.72, yb - 0.05, -0.12, 1); }
  if (lv >= 2) { var pl = PLATE('城隍庙', 0.3, 0.115, '#5a1a12', '#e8c87a', '#d0a048'); pl.position.set(hx, yb - 0.07, -0.185); g.add(pl); }
  if (lv >= 4) { BX(f.WG, 1.2, 0.016, 0.016, hx, yb + 0.03, 0.02, V(P.glow)); for (i = -1; i <= 1; i += 2) BX(f.WG, 0.016, 0.016, 0.9, hx + i * 0.71, yb + 0.03, -0.6, V(P.glow)); }
  /* 后影壁小金顶 + 沿脊回廊 + 三翼厢房（东翼=彩篷街+玻璃披屋 / 东北楼=铜绿穹顶 / 西翼） */
  BX(f.W, 0.7, 0.24, 0.08, hx, 0.3, -1.02, wall); CR(f.G, 0.8, 0.16, 0.06, 0.05, 0.01, 0.03, hx, 0.42, -1.02, V(P.gold), 0);
  BX(f.W, 1.5, 0.22, 0.1, 0.08, 0.21, -1.16, wall); CR(f.T, 1.56, 0.12, 0.08, 0.04, 0.01, 0.03, 0.08, 0.32, -1.16, tw, 0);
  var fl = [2, 3, 4, 5][lv - 1];
  BLK(f, lv, 0.98, 0.51, 0.44, 1.02, fl, 1, 23, 1);
  BLK(f, lv, 1.05, -0.76, 0.32, 0.84, Math.min(fl, 4), 1, 53, 2);
  BLK(f, lv, -0.97, -0.67, 0.46, 1.02, fl, 0, 11, 0);
  /* 前院：石牌坊(lv2+) / 摊位阳伞(lv3+) / 桥畔亭(lv4) / 石灯 / 层叠树 / 灯笼串 */
  if (lv >= 2) GATE(f, lv, hx, 0.45);
  if (lv >= 4) PAV(f, 0.42, 1.0, 0.3, 0.26, 0.22);
  if (lv >= 3) { STALL(f, -0.05, 0.62, V(P.awnB)); STALL(f, 0.58, 0.55, V(P.awnR)); }
  LAMP(f, 0.3, 1.14); LAMP(f, 0.95, 1.14); if (lv >= 2) LAMP(f, -0.52, 0.42);
  TR(f, -0.42, 0.16, 0.95); TR(f, 0.05, 0.1, 0.7); TR(f, 0.62, 0.2, 0.85); TR(f, 0.5, 1.1, 0.7); TR(f, 1.08, 1.12, 0.62); TR(f, -0.62, 0.44, 0.55); TR(f, -0.56, -0.36, 0.6); TR(f, 0.76, 1.13, 0.5);
  if (lv >= 2) TR(f, 0.66, 0.72, 0.6); if (lv >= 3) { TR(f, 0.28, 0.66, 0.55); TR(f, -0.44, 0.52, 0.5); } if (lv >= 4) TR(f, 0.86, 1.12, 0.55);
  if (lv >= 2) for (i = 0; i < 3; i++) { LN(f, -0.74, 0.44, -1.0 + i * 0.34, 0.8); LN(f, 0.74, 0.44, 0.15 + i * 0.36, 0.8); }
  BUILD(f, g);
  var hm = g.userData.hotM;
  g.userData.anim = [
    function (t) { var m = hm['#ffd68e']; if (m) m.emissiveIntensity = 0.4 + 0.18 * (0.5 + 0.5 * S(t * 1.6)); },
    function (t) { var m = hm['#8a651c']; if (m) m.emissiveIntensity = 0.12 + 0.1 * (0.5 + 0.5 * S(t * 0.8 + 1)); }];
  return g;
}
window.Props3DModern = window.Props3DModern || {}; window.Props3DModern[9] = make9;
})();
