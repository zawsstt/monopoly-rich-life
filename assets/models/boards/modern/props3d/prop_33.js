/* 大富翁·现代写实棋盘 格 33「铜锣湾」—— 港岛商厦路口 + LED 广告幕墙 + 双层巴士街景 四年代（1990s→2020s）
 * 视觉真源 refs/modern/prop_33.png（左上 1990s / 右上 2000s / 左下 2010s / 右下 2020s）。
 * 年代差异：lv1 米色瓷砖商住楼+弧角大厦肖像海报+红奶油双层巴士+素柏油+稀树；lv2 +蓝玻璃塔/金玻璃塔/崇光白盒+彩色霓虹招牌+弧形 LED+双黄线；
 *   lv3 蓝绿玻璃幕墙化+更高媒体塔+橱窗暖光+车流加密；lv4 全玻璃幕+最高弧形媒体塔+天台天线阵+街景满配。
 * 契约：window.Props3DModern[33](level 1..4) → 全新 Group；占地 ≤2.6×2.6、底面 y=0、正面 +z；每级 mesh ≤55（手写合并 BufferGeometry：
 *   同材质桶=1 mesh）；Canvas ≤256px；零 Math.random（种子 LCG）；动画 2 项（LED 流光呼吸 / 橱窗暖光呼吸）。
 * R2 材质精修（剪影/构图不变，mesh 零增长）：顶点色承载主色调 + 近白多层 Canvas overlay（噪点/分缝/高光/风化）承载细节，材质 color=白；
 *   BUILD 内 boxUV 世界尺寸烘焙；玻璃低粗糙高金属+分格贴图、暗玻窗微金属、金属拉丝、LED 像素点阵/扫描线 emissiveMap、橱窗暖光 emissiveMap。 */
(function () { 'use strict'; if (typeof THREE === 'undefined') return;
var PI = Math.PI, S = Math.sin, Co = Math.cos, _PC = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); } function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function RG(s) { s = (s >>> 0) || 909; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function B(f, r, mt, em, ei, mp, ep) { var k = r + '|' + (mt || 0) + '|' + (em || '') + '|' + (ei || 0); return f.b[k] || (f.b[k] = { k: k, p: [], n: [], c: [], i: [], nv: 0, mp: mp || null, ep: ep || null }); }
function TRI(u, a, b, c, col) {
  var e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2], e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
  var nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x, l = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1, s = u.nv; nx /= l; ny /= l; nz /= l;
  u.p.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); u.n.push(nx, ny, nz, nx, ny, nz, nx, ny, nz); u.c.push(col[0], col[1], col[2], col[0], col[1], col[2], col[0], col[1], col[2]); u.i.push(s, s + 1, s + 2); u.nv = s + 3;
}
function QAD(u, a, b, c, d, col) { TRI(u, a, b, c, col); TRI(u, a, c, d, col); }
function BX(u, w, h, d, x, y, z, col, ry) {
  var ca = Co(ry || 0), sa = S(ry || 0), y0 = y - h / 2, y1 = y + h / 2; function P(lx, lz, ly) { return [x + lx * ca + lz * sa, ly, z - lx * sa + lz * ca]; }
  var A = P(-w / 2, d / 2, y0), Bb = P(w / 2, d / 2, y0), Cc = P(w / 2, d / 2, y1), D = P(-w / 2, d / 2, y1), E = P(-w / 2, -d / 2, y0), F = P(w / 2, -d / 2, y0), G = P(w / 2, -d / 2, y1), H = P(-w / 2, -d / 2, y1);
  QAD(u, A, Bb, Cc, D, col); QAD(u, F, E, H, G, col); QAD(u, Bb, F, G, Cc, col); QAD(u, E, A, D, H, col); QAD(u, D, Cc, G, H, col); QAD(u, E, F, Bb, A, col);
}
function CY(u, n, rt, rb, y0, y1, x, z, col) {
  for (var i = 0; i < n; i++) { var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI, c0 = Co(a0), s0 = S(a0), c1 = Co(a1), s1 = S(a1);
    QAD(u, [x + c0 * rb, y0, z + s0 * rb], [x + c1 * rb, y0, z + s1 * rb], [x + c1 * rt, y1, z + s1 * rt], [x + c0 * rt, y1, z + s0 * rt], col);
    if (rt > 0.004) TRI(u, [x, y1, z], [x + c0 * rt, y1, z + s0 * rt], [x + c1 * rt, y1, z + s1 * rt], col); }
}
function CYA(u, n, r, y0, y1, x, z, a0, a1, col) {
  for (var i = 0; i < n; i++) { var b0 = a0 + (a1 - a0) * i / n, b1 = a0 + (a1 - a0) * (i + 1) / n, c0 = Co(b0), s0 = S(b0), c1 = Co(b1), s1 = S(b1);
    QAD(u, [x + c1 * r, y0, z + s1 * r], [x + c0 * r, y0, z + s0 * r], [x + c0 * r, y1, z + s0 * r], [x + c1 * r, y1, z + s1 * r], col); }
}
function SP(u, n, r, x, y, z, col, half) {
  var R = half ? 2 : 3, base = half ? 0 : -PI / 2, span = half ? PI / 2 : PI;
  for (var j = 0; j < R; j++) { var p0 = base + j / R * span, p1 = base + (j + 1) / R * span, w0 = Co(p0) * r, w1 = Co(p1) * r, y0 = y + S(p0) * r, y1 = y + S(p1) * r;
    for (var i = 0; i < n; i++) { var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI;
      QAD(u, [x + Co(a0) * w0, y0, z + S(a0) * w0], [x + Co(a1) * w0, y0, z + S(a1) * w0], [x + Co(a1) * w1, y1, z + S(a1) * w1], [x + Co(a0) * w1, y1, z + S(a0) * w1], col); } }
}
function BUILD(f, g) {
  for (var k in f.b) { var u = f.b[k]; if (!u.nv) continue;
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(u.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(u.n, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(u.c, 3)); geo.setIndex(u.i);
    if (u.mp || u.ep) { /* boxUV 世界尺寸烘焙：按面法线主轴投影，1 世界单位 = 3 次贴图重复（各塔楼纹理密度一致） */
      var uv = new Float32Array(u.nv * 2), p = u.p, n = u.n, i, ax, ay, az;
      for (i = 0; i < u.nv; i++) { ax = Math.abs(n[i * 3]); ay = Math.abs(n[i * 3 + 1]); az = Math.abs(n[i * 3 + 2]);
        if (ax >= ay && ax >= az) { uv[i * 2] = p[i * 3 + 2] * 3; uv[i * 2 + 1] = p[i * 3 + 1] * 3; } else if (ay >= az) { uv[i * 2] = p[i * 3] * 3; uv[i * 2 + 1] = p[i * 3 + 2] * 3; } else { uv[i * 2] = p[i * 3] * 3; uv[i * 2 + 1] = p[i * 3 + 1] * 3; } }
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
    var a = k.split('|'), m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: +a[0], metalness: +a[1], flatShading: true, side: THREE.DoubleSide, map: u.mp, emissiveMap: u.ep });
    if (a[2]) { m.emissive = C(a[2]); m.emissiveIntensity = +a[3]; g.userData.hotM[a[2]] = m; }
    var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms); }
}
/* ---------- Canvas 程序纹理（≤256px）：overlay 叠加层（近白，乘顶点色主色）+ LED 巨幕 / 1990s 肖像海报 / 崇光招牌 ---------- */
function CAN(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; } function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function TXR(c) { var t = TX(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; } var _T = {};
function TXG() { /* 混凝土/瓷砖/柏油通用：基色 → 噪点 → 分缝（横缝+错缝竖缝）→ 高光点 → 风化污渍 */
  if (_T.g) return _T.g; var c = CAN(128, 128), g = c.getContext('2d'), R = RG(3301), i, x, y; g.fillStyle = '#e6e4e0'; g.fillRect(0, 0, 128, 128);
  for (i = 0; i < 260; i++) { g.fillStyle = R() > 0.5 ? 'rgba(40,36,32,' + (0.04 + R() * 0.08).toFixed(2) + ')' : 'rgba(255,255,255,' + (0.05 + R() * 0.1).toFixed(2) + ')'; g.fillRect(R() * 128, R() * 128, 1 + R() * 3, 1 + R() * 2); }
  for (y = 0; y < 128; y += 21) { g.fillStyle = 'rgba(30,28,26,0.16)'; g.fillRect(0, y, 128, 1); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, y + 1, 128, 1); g.fillStyle = 'rgba(30,28,26,0.12)'; for (x = (y / 21) % 2 ? 0 : 32; x < 128; x += 64) g.fillRect(x, y, 1, 21); }
  for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(60,52,44,' + (0.06 + R() * 0.08).toFixed(2) + ')'; g.fillRect(R() * 128, Math.floor(R() * 6) * 21 + 2, 2 + R() * 3, 8 + R() * 12); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; for (i = 0; i < 20; i++) g.fillRect(R() * 128, R() * 128, 2, 1); return (_T.g = TXR(c));
}
function TXC() { /* 玻璃幕墙：淡青基色 → 随机窗格明暗 → 斜向反光带 → 竖梃横梃分格 → 高光点 */
  if (_T.c) return _T.c; var c = CAN(128, 128), g = c.getContext('2d'), R = RG(3302), i, x, y; g.fillStyle = '#dde6ec'; g.fillRect(0, 0, 128, 128);
  for (y = 0; y < 128; y += 32) for (x = 0; x < 128; x += 32) { var v = R(); g.fillStyle = v > 0.72 ? 'rgba(18,34,52,0.3)' : v < 0.2 ? 'rgba(255,255,255,0.28)' : 'rgba(60,90,120,' + (0.06 + R() * 0.1).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 28); }
  g.fillStyle = 'rgba(255,255,255,0.26)'; for (i = 0; i < 6; i++) { x = R() * 128; for (y = 0; y < 128; y += 2) g.fillRect((x + y * 0.6) % 128, y, 3, 2); }
  g.fillStyle = 'rgba(20,28,36,0.55)'; for (i = 0; i <= 128; i += 32) { g.fillRect(i, 0, 2, 128); g.fillRect(0, i, 128, 2); }
  g.fillStyle = 'rgba(255,255,255,0.5)'; for (i = 0; i < 24; i++) g.fillRect(R() * 128, R() * 128, 2, 1); return (_T.c = TXR(c));
}
function TXL() { /* 暖光橱窗 map+emissiveMap：暖白 → 局部暗窗 → 窗棂暗线（发光面出现窗格密度） */
  if (_T.l) return _T.l; var c = CAN(64, 64), g = c.getContext('2d'), R = RG(3303), x, y; g.fillStyle = '#fff2d8'; g.fillRect(0, 0, 64, 64);
  for (y = 0; y < 64; y += 16) for (x = 0; x < 64; x += 16) if (R() > 0.7) { g.fillStyle = 'rgba(80,50,20,0.45)'; g.fillRect(x + 2, y + 2, 12, 12); }
  g.fillStyle = 'rgba(40,24,10,0.5)'; for (x = 0; x <= 64; x += 16) { g.fillRect(x, 0, 2, 64); g.fillRect(0, x, 64, 2); } return (_T.l = TXR(c));
}
function LEDTX() { /* LED 巨幕：夜色底 → 广告内容 → 像素点阵格 → 扫描线 → 色噪 → 热像素 */
  var c = CAN(256, 128), g = c.getContext('2d'), R = RG(337), i, x, y;
  g.fillStyle = '#12294a'; g.fillRect(0, 0, 256, 128); g.fillStyle = '#1f4470'; g.fillRect(0, 84, 256, 44); g.fillStyle = '#d078d8'; g.fillRect(150, 14, 66, 82);
  g.fillStyle = '#f0d8c0'; g.fillRect(166, 26, 32, 30); g.fillStyle = '#c06888'; g.fillRect(158, 58, 48, 38); g.fillStyle = '#ffffff'; g.fillRect(16, 24, 98, 12);
  g.fillRect(16, 46, 72, 8); g.fillRect(16, 62, 86, 8); g.fillStyle = '#ffd24a'; g.fillRect(16, 90, 54, 14); g.fillStyle = '#4fd8f0'; g.fillRect(80, 92, 40, 10);
  for (i = 0; i < 40; i++) { g.fillStyle = R() > 0.5 ? 'rgba(255,90,200,0.22)' : 'rgba(80,220,255,0.22)'; g.fillRect(R() * 256, R() * 128, 3 + R() * 6, 2 + R() * 3); }
  g.fillStyle = 'rgba(0,0,0,0.32)'; for (x = 0; x < 256; x += 8) g.fillRect(x, 0, 1, 128); for (y = 0; y < 128; y += 8) g.fillRect(0, y, 256, 1);
  g.fillStyle = 'rgba(0,0,0,0.1)'; for (y = 2; y < 128; y += 4) g.fillRect(0, y, 256, 1); g.fillStyle = 'rgba(255,255,255,0.5)'; for (i = 0; i < 30; i++) g.fillRect(R() * 256, R() * 128, 2, 2); return TX(c);
}
function POSTTX() { /* 1990s 肖像海报：底纸 → 人像 → 纸面噪点 → 边角褪色 */
  var c = CAN(128, 256), g = c.getContext('2d'), R = RG(339), i;
  g.fillStyle = '#e8c8d0'; g.fillRect(0, 0, 128, 256); g.fillStyle = '#d0a8b8'; g.fillRect(8, 8, 112, 240); g.fillStyle = '#5a3a30'; g.fillRect(34, 32, 60, 26);
  g.fillStyle = '#f2e2d8'; g.fillRect(40, 52, 48, 48); g.fillStyle = '#5a3a30'; g.fillRect(28, 52, 16, 92); g.fillRect(84, 52, 16, 92);
  g.fillStyle = '#c05868'; g.fillRect(40, 148, 48, 72); g.fillStyle = '#8a3040'; g.fillRect(16, 230, 96, 14);
  for (i = 0; i < 60; i++) { g.fillStyle = R() > 0.5 ? 'rgba(60,30,30,0.1)' : 'rgba(255,255,255,0.18)'; g.fillRect(R() * 128, R() * 256, 2, 2); } g.fillStyle = 'rgba(255,240,220,0.35)'; g.fillRect(0, 0, 128, 14); g.fillRect(0, 0, 12, 256); return TX(c);
}
function SGOTX() { /* 崇光招牌：白底 → 蓝边带 → 字 → 灯箱亮带 */
  var c = CAN(256, 64), g = c.getContext('2d'); g.fillStyle = '#f4f6f8'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#2258c8'; g.fillRect(0, 0, 256, 6); g.fillRect(0, 58, 256, 6);
  g.font = 'bold 40px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SOGO 崇光', 128, 33); g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(0, 8, 256, 6); g.fillStyle = 'rgba(0,20,60,0.12)'; g.fillRect(0, 50, 256, 8); return TX(c);
}
function ARCSG(r, y0, y1, x, z, a0, a1, n) {
  var pos = [], uv = [], idx = [], i;
  for (i = 0; i <= n; i++) { var a = a0 + (a1 - a0) * i / n, c = Co(a), s = S(a); pos.push(x + c * r, y0, z + s * r, x + c * r, y1, z + s * r); uv.push(i / n, 0, i / n, 1); }
  for (i = 0; i < n; i++) { var b = i * 2; idx.push(b, b + 1, b + 3, b, b + 3, b + 2); }
  var g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
function SIGNM(w, h, tex, ei) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: tex, roughness: 0.35, metalness: 0.1, emissive: C('#ffffff'), emissiveMap: tex, emissiveIntensity: ei })); }
/* ---------- 色板（采样自参考图） ---------- */
var P = { wall: '#ddd0b4', wallD: '#c8b494', dark: '#3a3f46', road: '#3e4044', mark: '#e9e6da', podium: '#d8d2c6', stone: '#a39d90', cream: '#efe9dc', glassB: '#7fa8c8',
  glassT: '#5f9aa8', gold: '#c8a860', metal: '#8a9098', red: '#b03028', tree: '#5f7f3d', treeL: '#7a9a4e', trunk: '#6a4e30', glow: '#ffd68e', neonP: '#ff4fa8', neonC: '#3fd8e8' };
/* ---------- 瓷砖商住楼（米色墙+窗带+水箱天线，港式身份） ---------- */
function TILETW(f, cx, cz, w, d, fl, seed) {
  var R = RG(seed), y = 0.16, i, k, h = 0.2, nw = Math.max(2, Math.round(w / 0.11)), dk = V(P.dark);
  for (i = 0; i < fl; i++) {
    BX(f.T, w, h - 0.02, d, cx, y + h / 2, cz, i % 2 ? V(P.wallD) : V(P.wall));
    for (k = 0; k < nw; k++) { var wx = cx - w / 2 + (k + 0.5) * w / nw; BX(f.D, w / nw * 0.6, 0.1, 0.02, wx, y + h / 2 + 0.02, cz + d / 2 + 0.006, dk); BX(f.D, w / nw * 0.6, 0.1, 0.02, wx, y + h / 2 + 0.02, cz - d / 2 - 0.006, dk); }
    for (k = 0; k < 2; k++) { var wz = cz - d / 2 + (k + 0.5) * d / 2; BX(f.D, 0.02, 0.1, d * 0.3, cx - w / 2 - 0.006, y + h / 2 + 0.02, wz, dk); BX(f.D, 0.02, 0.1, d * 0.3, cx + w / 2 + 0.006, y + h / 2 + 0.02, wz, dk); }
    BX(f.S, w + 0.03, 0.018, d + 0.03, cx, y + h, cz, V(P.stone)); y += h;
  }
  BX(f.M, w * 0.2, 0.09, w * 0.2, cx - w * 0.18, y + 0.055, cz + d * 0.12, V(P.metal)); CY(f.M, 6, 0.01, 0.01, y, y + 0.13, cx + w * 0.2, cz - d * 0.1, V(P.metal));
  if (R() > 0.4) CY(f.M, 4, 0.012, 0.002, y, y + 0.16, cx, cz, V(P.metal)); return y + 0.16;
}
/* ---------- 玻璃幕墙塔（玻璃体+白色层间环+竖梃+角柱，lv3+ 天线） ---------- */
function GLSTW(f, lv, cx, cz, w, d, fl, buck, col) {
  var y = 0.16, h = 0.2, i, k, n = Math.max(3, Math.round(w / 0.12)), mt = V(P.metal);
  for (i = 0; i < fl; i++) { BX(buck, w, h - 0.02, d, cx, y + h / 2, cz, col); BX(f.WH, w + 0.02, 0.022, d + 0.02, cx, y, cz, V(P.cream));
    for (k = 0; k <= n; k++) BX(f.M, 0.016, h - 0.02, 0.016, cx - w / 2 + k * w / n, y + h / 2, cz + d / 2 + 0.004, mt); y += h; }
  for (i = -1; i <= 1; i += 2) for (k = -1; k <= 1; k += 2) BX(f.M, 0.03, y - 0.16, 0.03, cx + i * (w / 2 - 0.01), 0.16 + (y - 0.16) / 2, cz + k * (d / 2 - 0.01), mt);
  BX(f.M, w * 0.4, 0.06, d * 0.4, cx, y + 0.03, cz, mt); if (lv >= 3) CY(f.M, 4, 0.018, 0.002, y + 0.06, y + 0.22, cx, cz, mt);
  return y + (lv >= 3 ? 0.22 : 0.06);
}
/* ---------- 转角媒体大厦：方塔+四分之一圆弧角，lv1 海报 / lv2+ 弧形 LED 巨幕 ---------- */
function HERO(f, lv, hot) {
  var cx = 0.05, cz = -0.28, w = 0.54, d = 0.52, r = 0.2, fl = [3, 4, 6, 8][lv - 1], h = 0.2, y = 0.16, i, k, mt = V(P.metal), cr = V(P.cream);
  var gl = lv === 1 ? f.T : lv === 2 ? f.G : f.GT, gc = V(lv === 1 ? P.wall : lv === 2 ? P.glassB : P.glassT);
  var xa = cx - w / 2, x1 = cx + w / 2, za = cz - d / 2, z1 = cz + d / 2, acx = x1 - r, acz = z1 - r;
  BX(f.S, w + 0.05, 0.16, d + 0.05, cx, 0.08, cz, V(P.stone));
  for (i = 0; i < fl; i++) {
    BX(gl, w, h - 0.02, d - r, cx, y + h / 2, (za + acz) / 2, gc); BX(gl, w - r, h - 0.02, r, (xa + acx) / 2, y + h / 2, (acz + z1) / 2, gc); CYA(gl, 5, r, y, y + h - 0.02, acx, acz, 0, PI / 2, gc);
    BX(f.WH, w + 0.02, 0.02, d - r + 0.02, cx, y, (za + acz) / 2, cr); BX(f.WH, w - r + 0.02, 0.02, r + 0.02, (xa + acx) / 2, y, (acz + z1) / 2, cr); CYA(f.WH, 3, r + 0.015, y - 0.008, y + 0.008, acx, acz, 0, PI / 2, cr);
    for (k = 1; k < 3; k++) BX(f.M, 0.014, h - 0.03, 0.014, xa + k * (w - r) / 3, y + h / 2, z1 + 0.006, mt);
    for (k = 1; k < 4; k++) { var an = k * PI / 8; BX(f.M, 0.014, h - 0.03, 0.014, acx + Co(an) * (r + 0.006), y + h / 2, acz + S(an) * (r + 0.006), mt); }
    y += h;
  }
  if (lv >= 2) { var led = SIGNM(1, 1, LEDTX(), 0.6); led.geometry = ARCSG(r + 0.022, 0.4, y - 0.05, acx, acz, 0.05, PI / 2 - 0.05, 6); g_add(led); hot.led = led.material; }
  else { var po = SIGNM(0.24, 0.34, POSTTX(), 0.15); po.position.set(cx - 0.08, 0.64, z1 + 0.008); g_add(po); hot.post = po.material; }
  BX(f.M, 0.3, 0.05, 0.26, cx, y + 0.025, cz - 0.05, mt); if (lv >= 3) CY(f.M, 4, 0.014, 0.002, y + 0.05, y + 0.2, cx - 0.12, acz, mt);
  return y + (lv >= 3 ? 0.2 : 0.05);
}
/* ---------- 沿街商铺带（橱窗 lv3+ 暖光 / 彩色霓虹招牌 lv2+）/ 双层巴士 / 轿车 / 行道树 ---------- */
function SHOP(f, lv, x0, x1, seed) {
  var R = RG(seed), w = x1 - x0, cx = (x0 + x1) / 2, n = Math.max(1, Math.round(w / 0.32)), k; BX(f.WH, w, 0.26, 0.3, cx, 0.27, 0.33, V(P.cream));
  for (k = 0; k < n; k++) { var sx = x0 + (k + 0.5) * w / n; BX(lv >= 3 ? f.WG : f.D, w / n * 0.72, 0.13, 0.02, sx, 0.3, 0.485, V(lv >= 3 ? P.glow : P.dark));
    if (lv >= 2 && R() > 0.35) { var pk = R() > 0.5; BX(pk ? f.NE1 : f.NE2, 0.17, 0.06, 0.03, sx, 0.445, 0.49, V(pk ? P.neonP : P.neonC)); } }
}
function BUS(f, x, z, ry) {
  var dk = V(P.dark); BX(f.R, 0.42, 0.08, 0.15, x, 0.175, z, V(P.red), ry); BX(f.R, 0.4, 0.055, 0.14, x, 0.242, z, V(P.red), ry);
  BX(f.D, 0.36, 0.032, 0.152, x, 0.247, z, dk, ry); BX(f.D, 0.42, 0.035, 0.152, x, 0.175, z, dk, ry); BX(f.WH, 0.4, 0.014, 0.14, x, 0.277, z, V(P.cream), ry);
  for (var sx = -1; sx <= 1; sx += 2) for (var sz = -1; sz <= 1; sz += 2) BX(f.D, 0.07, 0.05, 0.02, x + sx * 0.13 * Co(ry) + sz * 0.075 * S(ry), 0.125, z - sx * 0.13 * S(ry) + sz * 0.075 * Co(ry), dk, ry);
}
function CAR(f, x, z, col, ry) { BX(f.M, 0.2, 0.05, 0.1, x, 0.145, z, col, ry); BX(f.D, 0.1, 0.035, 0.09, x - 0.015 * Co(ry), 0.185, z + 0.015 * S(ry), V(P.dark), ry); }
function TR(f, x, z, s) { BX(f.U, 0.04 * s, 0.2 * s, 0.04 * s, x, 0.13 + 0.1 * s, z, V(P.trunk)); SP(f.N, 6, 0.11 * s, x, 0.13 + 0.25 * s, z, V(P.tree)); SP(f.NL, 5, 0.075 * s, x + 0.05 * s, 0.13 + 0.32 * s, z + 0.03 * s, V(P.treeL)); }
var g_cur = null; function g_add(m) { m.castShadow = m.receiveShadow = true; g_cur.add(m); }
function make33(level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), f = { b: {} }, g = new THREE.Group(), i, hot = {};
  g.name = 'prop_33_modern_lv' + lv; g.userData = { kind: 'property', propIdx: 33, level: lv, hotM: {} }; g_cur = g;
  /* 材质分区：石材/瓷砖/柏油 = 高粗糙 + 颗粒 overlay；玻璃幕墙 = 低粗糙高金属 + 分格 overlay；暗玻窗 = 中粗糙微金属；金属机壳 = 拉丝；橱窗 = 暖光 emissiveMap */
  var tg = TXG(), tc = TXC(), tl = TXL();
  f.P = B(f, 0.95, 0, '', 0, tg); f.S = B(f, 0.9, 0, '', 0, tg); f.T = B(f, 0.8, 0, '', 0, tg); f.D = B(f, 0.35, 0.3, '', 0, tc); f.WH = B(f, 0.85, 0, '', 0, tg); f.U = B(f, 0.89);
  f.G = B(f, 0.1, 0.7, '', 0, tc); f.GT = B(f, 0.08, 0.75, '', 0, tc); f.GG = B(f, 0.12, 0.8, '', 0, tc); f.M = B(f, 0.3, 0.75, '', 0, tg); f.R = B(f, 0.55, 0.15, '', 0, tg);
  f.N = B(f, 0.92); f.NL = B(f, 0.91); f.A = B(f, 0.98, 0, '', 0, tg); f.MK = B(f, 0.9); f.WG = B(f, 0.4, 0, P.glow, 0.5, tl, tl); f.NE1 = B(f, 0.4, 0, P.neonP, 0.7); f.NE2 = B(f, 0.4, 0, P.neonC, 0.7);
  /* 地坪：城基座 + 人行道 + 柏油马路 + 斑马线 / 车道线+双黄线（lv2+） */
  BX(f.P, 2.56, 0.14, 1.9, 0, 0.07, -0.33, V(P.podium)); BX(f.S, 2.56, 0.14, 0.18, 0, 0.07, 0.59, V(P.stone)); BX(f.A, 2.56, 0.1, 0.62, 0, 0.05, 0.96, V(P.road));
  for (i = 0; i < 5; i++) BX(f.MK, 0.34, 0.012, 0.075, 0.1, 0.107, 0.72 + i * 0.115, V(P.mark));
  if (lv >= 2) { for (i = 0; i < 7; i++) BX(f.MK, 0.12, 0.012, 0.03, -1.05 + i * 0.35, 0.107, 1.0, V(P.mark)); BX(f.GG, 2.5, 0.012, 0.03, 0, 0.107, 0.675, V(P.gold)); }
  /* 背排连续横墙（廓形完整）+ 转角媒体大厦 + 瓷砖楼群 */
  BX(f.T, 2.5, 0.52, 0.16, 0, 0.42, -1.19, V(P.wallD)); for (i = 0; i < 9; i++) BX(f.D, 0.07, 0.09, 0.02, -1.1 + (i % 5) * 0.55, 0.34 + Math.floor(i / 5) * 0.17, -1.1, V(P.dark));
  HERO(f, lv, hot); TILETW(f, -0.58, -0.62, 0.44, 0.5, [4, 5, 6, 7][lv - 1], 11); TILETW(f, -1.02, -0.28, 0.4, 0.5, [3, 4, 5, 6][lv - 1], 23); TILETW(f, 0.62, -0.55, 0.44, 0.5, [3, 4, 5, 6][lv - 1], 37);
  /* 崇光白盒百货 + 蓝玻璃塔 + 金玻璃塔（lv2+）；蓝绿媒体塔（lv3+，lv4 最高） */
  if (lv >= 2) {
    GLSTW(f, lv, -0.58, -1.0, 0.44, 0.42, [6, 7, 8, 9][lv - 2], f.G, V(P.glassB)); GLSTW(f, lv, 0.98, -0.85, 0.46, 0.5, [7, 8, 9, 10][lv - 2], f.GG, V(P.gold));
    BX(f.WH, 0.56, 0.5, 0.42, 0.62, 0.41, 0.0, V(P.cream)); BX(f.G, 0.5, 0.1, 0.02, 0.62, 0.24, 0.22, V(P.glassB)); BX(f.M, 0.2, 0.08, 0.2, 0.62, 0.7, 0.0, V(P.metal));
    var sg = SIGNM(0.4, 0.1, SGOTX(), 0.25, '#dfe6ee'); sg.position.set(0.62, 0.55, 0.215); g_add(sg);
  }
  if (lv >= 3) GLSTW(f, lv, -0.02, -1.02, 0.46, 0.4, lv >= 4 ? 11 : 9, f.GT, V(P.glassT));
  /* 沿街商铺 + 街景：双层巴士 / 的士 / 轿车 / 行道树 / 路灯 */
  SHOP(f, lv, -1.25, -0.28, 51); SHOP(f, lv, 0.38, 1.25, 63); if (lv >= 3) SHOP(f, lv, -0.24, 0.34, 75);
  BUS(f, -0.55, 0.88, 0); if (lv >= 2) BUS(f, 0.72, 1.13, PI); if (lv >= 4) BUS(f, -1.05, 1.13, PI);
  CAR(f, 0.45, 0.88, V(P.red), 0); if (lv >= 2) CAR(f, 1.08, 1.13, V(P.cream), PI); if (lv >= 3) CAR(f, -0.95, 0.88, V(P.glassB), 0);
  var tn = [2, 3, 4, 4][lv - 1], tx = [0.5, -0.35, -0.9, 1.1]; for (i = 0; i < tn; i++) TR(f, tx[i], 0.59, 0.8 + (i % 2) * 0.15);
  if (lv >= 2) for (i = 0; i < 2; i++) { BX(f.M, 0.02, 0.3, 0.02, i ? 0.9 : -1.15, 0.28, 0.59, V(P.metal)); BX(f.M, 0.07, 0.02, 0.07, i ? 0.9 : -1.15, 0.44, 0.59, V(P.metal)); }
  BUILD(f, g);
  var hm = g.userData.hotM; hm.led = hot.led; hm.post = hot.post;
  g.userData.anim = [
    function (t) { var m = hm.led || hm.post; if (m) m.emissiveIntensity = (hm.led ? 0.6 : 0.12) + (hm.led ? 0.3 : 0.05) * (0.5 + 0.5 * S(t * 2.1)); },
    function (t) { var m = hm[P.glow]; if (m) m.emissiveIntensity = 0.4 + 0.2 * (0.5 + 0.5 * S(t * 1.3 + 1.2)); }];
  return g;
}
window.Props3DModern = window.Props3DModern || {}; window.Props3DModern[33] = make33;
})();
