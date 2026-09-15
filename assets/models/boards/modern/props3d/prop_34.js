/* 大富翁·现代写实棋盘 格 34「尖沙咀」—— 维港海滨钟楼 + 文化中心 + 天星码头 + 港岛天际线 四年代（1990s→2020s）
 * 视觉真源 refs/modern/prop_34.png（左上 1990s / 右上 2000s / 左下 2010s / 右下 2020s）。
 * 年代差异：lv1 红砖钟楼+米色酒店板楼+文化中心弧顶+双渡轮+海滨椰树；lv2 +蓝玻璃 IFC 一期+玻璃中层群+第三码头棚；
 *   lv3 +中银大厦(绿玻璃 X 斜撑)+IFC 二期(蓝幕墙冠顶)+窗光暖色+第三艘渡轮；lv4 IFC 二期最高+尖顶天线+海滨摩天轮(红白)+更密塔群+海滨灯带。
 * 契约：window.Props3DModern[34](level 1..4) → 全新 Group；占地 ≤2.6×2.6、底面 y=0、正面 +z（维港在前）；每级 mesh ≤55（手写合并 BufferGeometry：
 *   同材质桶=1 mesh）；Canvas ≤256px；零 Math.random（种子 LCG）；动画 2 项（塔群窗光呼吸 / 维港波光=emissive 脉动+涟漪贴图漂移）。
 * R2 材质精修（剪影/构图不变，mesh 零增长）：顶点色承载主色调 + 近白多层 Canvas overlay（噪点/分缝/高光/风化）承载细节，材质 color=白；
 *   BUILD 内 boxUV 世界尺寸烘焙；水面极低粗糙+涟漪贴图、玻璃幕墙分格贴图、红砖分缝、暗玻窗微金属、金属拉丝、钟面铜绿风化、塔群窗光 emissiveMap。 */
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
function SP(u, n, r, x, y, z, col, half) {
  var R = half ? 2 : 3, base = half ? 0 : -PI / 2, span = half ? PI / 2 : PI;
  for (var j = 0; j < R; j++) { var p0 = base + j / R * span, p1 = base + (j + 1) / R * span, w0 = Co(p0) * r, w1 = Co(p1) * r, y0 = y + S(p0) * r, y1 = y + S(p1) * r;
    for (var i = 0; i < n; i++) { var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI;
      QAD(u, [x + Co(a0) * w0, y0, z + S(a0) * w0], [x + Co(a1) * w0, y0, z + S(a1) * w0], [x + Co(a1) * w1, y1, z + S(a1) * w1], [x + Co(a0) * w1, y1, z + S(a0) * w1], col); } }
}
/* 竖直面内斜撑条（x-y 平面，固定 z）：中银 X 斜撑 / 摩天轮辐条与轮圈段（y-z 平面版 DIAGZ） */
function DIAG(u, x0, y0, x1, y1, z, t, col) { var dx = x1 - x0, dy = y1 - y0, l = Math.sqrt(dx * dx + dy * dy) || 1, px = -dy / l * t / 2, py = dx / l * t / 2; QAD(u, [x0 + px, y0 + py, z], [x0 - px, y0 - py, z], [x1 - px, y1 - py, z], [x1 + px, y1 + py, z], col); }
function DIAGZ(u, x, y0, z0, y1, z1, t, col) { var dz = z1 - z0, dy = y1 - y0, l = Math.sqrt(dz * dz + dy * dy) || 1, pz = -dy / l * t / 2, py = dz / l * t / 2; QAD(u, [x, y0 + py, z0 + pz], [x, y0 - py, z0 - pz], [x, y1 - py, z1 - pz], [x, y1 + py, z1 + pz], col); }
function BUILD(f, g) {
  for (var k in f.b) { var u = f.b[k]; if (!u.nv) continue;
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(u.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(u.n, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(u.c, 3)); geo.setIndex(u.i);
    if (u.mp || u.ep) { /* boxUV 世界尺寸烘焙：按面法线主轴投影，1 世界单位 = 3 次贴图重复 */
      var uv = new Float32Array(u.nv * 2), p = u.p, n = u.n, i, ax, ay, az;
      for (i = 0; i < u.nv; i++) { ax = Math.abs(n[i * 3]); ay = Math.abs(n[i * 3 + 1]); az = Math.abs(n[i * 3 + 2]);
        if (ax >= ay && ax >= az) { uv[i * 2] = p[i * 3 + 2] * 3; uv[i * 2 + 1] = p[i * 3 + 1] * 3; } else if (ay >= az) { uv[i * 2] = p[i * 3] * 3; uv[i * 2 + 1] = p[i * 3 + 2] * 3; } else { uv[i * 2] = p[i * 3] * 3; uv[i * 2 + 1] = p[i * 3 + 1] * 3; } }
      geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); }
    var a = k.split('|'), m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: +a[0], metalness: +a[1], flatShading: true, side: THREE.DoubleSide, map: u.mp, emissiveMap: u.ep });
    if (a[2]) { m.emissive = C(a[2]); m.emissiveIntensity = +a[3]; g.userData.hotM[a[2]] = m; }
    var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms); }
}
/* ---------- Canvas 程序纹理（≤256px）：overlay 叠加层（近白，乘顶点色主色）+ 维港水面 + 钟面 / 天星码头招牌 ---------- */
function CAN(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; } function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function TXR(c) { var t = TX(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; } var _T = {};
function TXG() { /* 石材/砖/混凝土通用：基色 → 噪点 → 分缝（横缝+错缝竖缝，红砖桶上读作砖层）→ 高光点 → 风化污渍 */
  if (_T.g) return _T.g; var c = CAN(128, 128), g = c.getContext('2d'), R = RG(3401), i, x, y; g.fillStyle = '#e6e4e0'; g.fillRect(0, 0, 128, 128);
  for (i = 0; i < 260; i++) { g.fillStyle = R() > 0.5 ? 'rgba(40,36,32,' + (0.04 + R() * 0.08).toFixed(2) + ')' : 'rgba(255,255,255,' + (0.05 + R() * 0.1).toFixed(2) + ')'; g.fillRect(R() * 128, R() * 128, 1 + R() * 3, 1 + R() * 2); }
  for (y = 0; y < 128; y += 21) { g.fillStyle = 'rgba(30,28,26,0.16)'; g.fillRect(0, y, 128, 1); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, y + 1, 128, 1); g.fillStyle = 'rgba(30,28,26,0.12)'; for (x = (y / 21) % 2 ? 0 : 32; x < 128; x += 64) g.fillRect(x, y, 1, 21); }
  for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(60,52,44,' + (0.06 + R() * 0.08).toFixed(2) + ')'; g.fillRect(R() * 128, Math.floor(R() * 6) * 21 + 2, 2 + R() * 3, 8 + R() * 12); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; for (i = 0; i < 20; i++) g.fillRect(R() * 128, R() * 128, 2, 1); return (_T.g = TXR(c));
}
function TXC() { /* 玻璃幕墙：淡青基色 → 随机窗格明暗 → 斜向反光带 → 竖梃横梃分格 → 高光点 */
  if (_T.c) return _T.c; var c = CAN(128, 128), g = c.getContext('2d'), R = RG(3402), i, x, y; g.fillStyle = '#dde6ec'; g.fillRect(0, 0, 128, 128);
  for (y = 0; y < 128; y += 32) for (x = 0; x < 128; x += 32) { var v = R(); g.fillStyle = v > 0.72 ? 'rgba(18,34,52,0.3)' : v < 0.2 ? 'rgba(255,255,255,0.28)' : 'rgba(60,90,120,' + (0.06 + R() * 0.1).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 28); }
  g.fillStyle = 'rgba(255,255,255,0.26)'; for (i = 0; i < 6; i++) { x = R() * 128; for (y = 0; y < 128; y += 2) g.fillRect((x + y * 0.6) % 128, y, 3, 2); }
  g.fillStyle = 'rgba(20,28,36,0.55)'; for (i = 0; i <= 128; i += 32) { g.fillRect(i, 0, 2, 128); g.fillRect(0, i, 128, 2); }
  g.fillStyle = 'rgba(255,255,255,0.5)'; for (i = 0; i < 24; i++) g.fillRect(R() * 128, R() * 128, 2, 1); return (_T.c = TXR(c));
}
function TXL() { /* 暖光窗 map+emissiveMap：暖白 → 局部暗窗 → 窗棂暗线 */
  if (_T.l) return _T.l; var c = CAN(64, 64), g = c.getContext('2d'), R = RG(3403), x, y; g.fillStyle = '#fff2d8'; g.fillRect(0, 0, 64, 64);
  for (y = 0; y < 64; y += 16) for (x = 0; x < 64; x += 16) if (R() > 0.7) { g.fillStyle = 'rgba(80,50,20,0.45)'; g.fillRect(x + 2, y + 2, 12, 12); }
  g.fillStyle = 'rgba(40,24,10,0.5)'; for (x = 0; x <= 64; x += 16) { g.fillRect(x, 0, 2, 64); g.fillRect(0, x, 64, 2); } return (_T.l = TXR(c));
}
function TXW() { /* 维港水面（每实例，供 offset 漂移动画）：基色 → 正弦涟漪明/暗线 → 暗流斑 → 碎光 */
  var c = CAN(128, 128), g = c.getContext('2d'), R = RG(3404), i, j; g.fillStyle = '#e6f0f4'; g.fillRect(0, 0, 128, 128);
  for (i = 0; i < 7; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,0.42)' : 'rgba(20,60,80,0.2)'; for (j = 0; j < 128; j += 2) g.fillRect(j, (i * 18 + 6 * S(j * 0.12 + i * 1.7) + 128) % 128, 2, 2); }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(10,50,70,0.12)'; g.fillRect(R() * 128, R() * 128, 10 + R() * 20, 3 + R() * 4); }
  g.fillStyle = 'rgba(255,255,255,0.55)'; for (i = 0; i < 30; i++) g.fillRect(R() * 128, R() * 128, 2 + R() * 3, 1); return TXR(c);
}
function CLKTX() { /* 钟面：米白 → 黑框 → 刻度/指针 → 铜绿风化斑 */
  var c = CAN(128, 128), g = c.getContext('2d'), R = RG(3405), i; g.fillStyle = '#f4efe2'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#2a2622'; g.fillRect(0, 0, 128, 8); g.fillRect(0, 120, 128, 8); g.fillRect(0, 0, 8, 128); g.fillRect(120, 0, 8, 128);
  for (i = 0; i < 12; i++) { var a = i / 12 * 2 * PI; g.fillRect(64 + Co(a) * 46 - 4, 64 + S(a) * 46 - 4, 8, 8); }
  g.fillRect(60, 28, 8, 40); g.fillRect(64, 60, 30, 7); g.fillStyle = '#b0402a'; g.fillRect(58, 58, 12, 12);
  for (i = 0; i < 18; i++) { g.fillStyle = R() > 0.5 ? 'rgba(90,120,100,0.14)' : 'rgba(120,90,60,0.1)'; g.fillRect(10 + R() * 108, 10 + R() * 108, 3 + R() * 5, 2 + R() * 4); } return TX(c);
}
function SFTX() { /* 天星码头招牌：绿底 → 白边 → 字 → 灯箱亮带 */
  var c = CAN(256, 48), g = c.getContext('2d'); g.fillStyle = '#2f7a56'; g.fillRect(0, 0, 256, 48); g.fillStyle = '#ffffff'; g.fillRect(0, 0, 256, 4); g.fillRect(0, 44, 256, 4);
  g.font = 'bold 28px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STAR FERRY 天星小輪', 128, 25); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(0, 6, 256, 8); return TX(c);
}
function SIGNM(w, h, tex, ei) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: tex, roughness: 0.4, metalness: 0.1, emissive: C('#ffffff'), emissiveMap: tex, emissiveIntensity: ei })); }
/* ---------- 色板（采样自参考图） ---------- */
var P = { pave: '#c9c2b2', stone: '#a9a396', water: '#2f7086', waterD: '#25596c', brick: '#a85a3e', white: '#f1ece0', cream: '#e6dcc6', dark: '#3a3f46', glassB: '#7fa8c8', glassG: '#7fb8a8',
  glassD: '#5a7d94', metal: '#8a9098', gold: '#c9a55a', green: '#3f7d5c', red: '#c4322a', tree: '#5f7f3d', treeL: '#7a9a4e', trunk: '#6a4e30', glow: '#ffdf9e', conc: '#d8d0bc' };
/* ---------- 尖沙咀钟楼（红砖方塔+白饰带+四面钟+白穹顶+金顶针）—— 各年代不变的身份锚 ---------- */
function CLOCK(f, x, z, hot) {
  var br = V(P.brick), wh = V(P.white), y = 0.13, i;
  BX(f.S, 0.34, 0.04, 0.34, x, y + 0.02, z, V(P.stone)); BX(f.BR, 0.26, 0.56, 0.26, x, y + 0.32, z, br); BX(f.WH, 0.29, 0.03, 0.29, x, y + 0.3, z, wh); BX(f.WH, 0.29, 0.03, 0.29, x, y + 0.58, z, wh);
  for (i = -1; i <= 1; i += 2) { BX(f.WH, 0.05, 0.5, 0.02, x + i * 0.11, y + 0.32, z + 0.135, wh); BX(f.D, 0.05, 0.1, 0.02, x + i * 0.11, y + 0.24, z + 0.14, V(P.dark)); }
  BX(f.WH, 0.3, 0.14, 0.3, x, y + 0.67, z, wh); BX(f.BR, 0.22, 0.12, 0.22, x, y + 0.8, z, br); BX(f.WH, 0.25, 0.025, 0.25, x, y + 0.87, z, wh);
  for (i = 0; i < 4; i++) { var a = i * PI / 2, cf = SIGNM(0.1, 0.1, hot.clk, 0.08, '#e8e2d4'); cf.position.set(x + S(a) * 0.152, y + 0.67, z + Co(a) * 0.152); cf.rotation.y = a; g_add(cf); }
  SP(f.WH, 8, 0.11, x, y + 0.88, z, wh, true); CY(f.Y, 6, 0.004, 0.012, y + 0.99, y + 1.08, x, z, V(P.gold)); return y + 1.08;
}
/* ---------- 文化中心（无窗米色弧顶体量，年代越新越大越白）/ 天星码头棚 / 渡轮 / 塔楼 / 摩天轮 ---------- */
function CULT(f, lv, cx, cz) {
  var col = V(lv >= 3 ? P.white : P.cream), w = 1.0, d = 0.5, i;
  BX(f.CR, w, 0.22, d, cx, 0.24, cz, col); for (i = 0; i < 4; i++) BX(f.CR, w - i * 0.16, 0.06, d - i * 0.05, cx - i * 0.06, 0.38 + i * 0.06, cz, col);
  for (i = 0; i < 5; i++) BX(f.CR, 0.03, 0.25, 0.02, cx - w / 2 + 0.06 + i * 0.09, 0.47, cz + d / 2 + 0.005, V(P.conc));
  BX(f.S, 0.6, 0.04, 0.3, cx + 0.1, 0.15, cz + 0.4, V(P.stone)); if (lv >= 3) BX(f.G, 0.5, 0.12, 0.02, cx - 0.15, 0.2, cz + d / 2 + 0.01, V(P.glassB));
}
function PIER(f, x, z, hot) {
  var wh = V(P.white), i; BX(f.S, 0.34, 0.03, 0.55, x, 0.14, z, V(P.stone)); BX(f.WH, 0.36, 0.02, 0.55, x, 0.34, z, wh);
  for (i = -1; i <= 1; i += 2) { BX(f.M, 0.02, 0.2, 0.02, x - 0.15, 0.24, z + i * 0.25, V(P.metal)); BX(f.M, 0.02, 0.2, 0.02, x + 0.15, 0.24, z + i * 0.25, V(P.metal)); CY(f.M, 5, 0.02, 0.02, 0.0, 0.14, x - 0.14, z + i * 0.25, V(P.metal)); CY(f.M, 5, 0.02, 0.02, 0.0, 0.14, x + 0.14, z + i * 0.25, V(P.metal)); }
  BX(f.WH, 0.3, 0.1, 0.06, x, 0.25, z - 0.2, wh); if (hot.sf) { var s = SIGNM(0.3, 0.06, hot.sf, 0.12, '#4a8a68'); s.position.set(x, 0.29, z + 0.28); g_add(s); }
}
function FERRY(f, x, z, ry) {
  var wh = V(P.white), gr = V(P.green); BX(f.GR, 0.36, 0.05, 0.13, x, 0.05, z, gr, ry); BX(f.WH, 0.38, 0.03, 0.14, x, 0.09, z, wh, ry); BX(f.WH, 0.28, 0.07, 0.11, x, 0.14, z, wh, ry);
  BX(f.D, 0.26, 0.025, 0.115, x, 0.135, z, V(P.dark), ry); BX(f.GR, 0.22, 0.05, 0.09, x, 0.2, z, gr, ry); BX(f.WH, 0.2, 0.015, 0.1, x, 0.235, z, wh, ry); BX(f.GR, 0.04, 0.05, 0.04, x - 0.03, 0.26, z, gr, ry);
}
function TWR(f, buck, col, cx, cz, w, d, h, style, f2) {
  var y = 0.12, fl = Math.max(2, Math.round(h / 0.2)), hh = h / fl, i, k, mt = V(P.metal), dk = V(P.dark);
  for (i = 0; i < fl; i++) { BX(buck, w, hh - 0.015, d, cx, y + hh / 2, cz, col); BX(style === 'tile' ? f.S : f.WH, w + 0.02, 0.018, d + 0.02, cx, y, cz, style === 'tile' ? V(P.stone) : V(P.white));
    if (style === 'tile') for (k = 0; k < 3; k++) BX(f.D, w / 3 * 0.55, hh * 0.45, 0.015, cx - w / 2 + (k + 0.5) * w / 3, y + hh * 0.55, cz + d / 2 + 0.006, dk);
    else if (f2 && i % 2 === 0) BX(f2, w * 0.7, hh * 0.4, 0.012, cx, y + hh * 0.55, cz + d / 2 + 0.006, V(P.glow)); y += hh; }
  if (style === 'boc') { var yb = 0.12, hs = h / 3; for (k = 0; k < 3; k++) { DIAG(f.WH, cx - w / 2, yb, cx + w / 2, yb + hs, cz + d / 2 + 0.008, 0.022, V(P.white)); DIAG(f.WH, cx + w / 2, yb, cx - w / 2, yb + hs, cz + d / 2 + 0.008, 0.022, V(P.white)); yb += hs; } CY(f.M, 4, 0.004, 0.012, y, y + 0.32, cx + w * 0.3, cz, mt); }
  if (style === 'ifc') { BX(f.WH, w * 0.8, 0.05, d * 0.8, cx, y + 0.025, cz, V(P.white)); CY(f.WH, 8, 0.02, w * 0.36, y + 0.05, y + 0.16, cx, cz, V(P.white)); CY(f.M, 4, 0.004, 0.01, y + 0.16, y + 0.36, cx, cz, mt); }
  else if (style !== 'boc') BX(f.M, w * 0.4, 0.05, d * 0.4, cx, y + 0.025, cz, mt);
}
function WHEEL(f, x, z, r) {
  var rd = V(P.red), wh = V(P.white), cy = 0.13 + r + 0.07, i, n = 16;
  for (i = 0; i < n; i++) { var a0 = i / n * 2 * PI, a1 = (i + 1) / n * 2 * PI; DIAGZ(f.WH, x, cy + S(a0) * r, z + Co(a0) * r, cy + S(a1) * r, z + Co(a1) * r, 0.02, wh); if (i % 2 === 0) DIAGZ(f.R, x, cy, z, cy + S(a0) * r, z + Co(a0) * r, 0.012, rd); }
  for (i = 0; i < 8; i++) { var a = i / 8 * 2 * PI; BX(f.R, 0.05, 0.05, 0.05, x, cy + S(a) * r, z + Co(a) * r, rd); }
  BX(f.M, 0.06, 0.06, 0.06, x, cy, z, V(P.metal)); for (i = -1; i <= 1; i += 2) { DIAGZ(f.M, x + i * 0.02, 0.13, z + i * 0.18, cy, z, 0.03, V(P.metal)); } BX(f.S, 0.2, 0.03, 0.5, x, 0.145, z, V(P.stone));
}
function TR(f, x, z, s) { BX(f.U, 0.03 * s, 0.24 * s, 0.03 * s, x, 0.13 + 0.12 * s, z, V(P.trunk)); SP(f.N, 6, 0.1 * s, x, 0.13 + 0.3 * s, z, V(P.tree)); SP(f.NL, 5, 0.065 * s, x + 0.04 * s, 0.13 + 0.36 * s, z + 0.03 * s, V(P.treeL)); }
var g_cur = null; function g_add(m) { m.castShadow = m.receiveShadow = true; g_cur.add(m); }
function make34(level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), f = { b: {} }, g = new THREE.Group(), i, hot = {};
  g.name = 'prop_34_modern_lv' + lv; g.userData = { kind: 'property', propIdx: 34, level: lv, hotM: {} }; g_cur = g;
  /* 材质分区：石材/砖/混凝土 = 高粗糙 + 颗粒 overlay；水面 = 极低粗糙微金属 + 涟漪贴图（漂移）；玻璃幕墙 = 低粗糙高金属 + 分格；暗玻窗微金属；金属拉丝；渡轮漆面微光；塔群窗光 emissiveMap */
  var tg = TXG(), tc = TXC(), tl = TXL(), tw = TXW(); hot.wt = tw;
  f.P = B(f, 0.93, 0, '', 0, tg); f.S = B(f, 0.9, 0, '', 0, tg); f.WA = B(f, 0.08, 0.35, P.waterD, 0.3, tw); f.BR = B(f, 0.82, 0, '', 0, tg); f.WH = B(f, 0.85, 0, '', 0, tg); f.CR = B(f, 0.86, 0, '', 0, tg);
  f.D = B(f, 0.35, 0.3, '', 0, tc); f.G = B(f, 0.1, 0.7, '', 0, tc); f.GG = B(f, 0.09, 0.72, '', 0, tc); f.GD = B(f, 0.12, 0.65, '', 0, tc); f.M = B(f, 0.3, 0.75, '', 0, tg); f.Y = B(f, 0.3, 0.8);
  f.GR = B(f, 0.6, 0.1, '', 0, tg); f.R = B(f, 0.55, 0.15, '', 0, tg); f.U = B(f, 0.89); f.N = B(f, 0.92); f.NL = B(f, 0.91); f.WG = B(f, 0.4, 0, P.glow, 0.5, tl, tl);
  hot.clk = CLKTX(); hot.sf = lv >= 2 ? SFTX() : null;
  /* 地坪：城区基座 + 海滨长廊 + 海堤 + 维港水面（正面 +z） */
  BX(f.P, 2.56, 0.12, 1.85, 0, 0.06, -0.355, V(P.pave)); BX(f.S, 2.56, 0.13, 0.42, 0, 0.065, 0.4, V(P.stone)); BX(f.S, 2.56, 0.13, 0.05, 0, 0.065, 0.635, V(P.stone));
  BX(f.WA, 2.56, 0.05, 0.62, 0, 0.025, 0.97, V(P.water)); for (i = 0; i < 12; i++) BX(f.WA, 0.16 + (i % 3) * 0.06, 0.006, 0.03, -1.15 + i * 0.21, 0.052, 0.72 + (i % 4) * 0.13, V(P.glassB));
  for (i = 0; i < 9; i++) BX(f.M, 0.012, 0.06, 0.012, -1.2 + i * 0.3, 0.16, 0.63, V(P.metal)); BX(f.M, 2.5, 0.012, 0.012, 0, 0.19, 0.63, V(P.metal));
  /* 身份锚：钟楼 / 文化中心 / 天星码头 + 渡轮 */
  CLOCK(f, 0.35, 0.3, hot); CULT(f, lv, 0.72, -0.28); PIER(f, -0.5, 0.86, hot); PIER(f, -1.02, 0.78, hot);
  FERRY(f, -0.22, 1.05, 0.1); FERRY(f, -0.78, 1.12, -0.2); if (lv >= 3) FERRY(f, -1.1, 1.1, 0.35);
  /* 天际线（后排，随年代升高/玻璃化）：lv1 米色板楼；lv2 +IFC 一期；lv3 +中银+IFC 二期；lv4 IFC 二期最高+塔群 */
  TWR(f, f.CR, V(P.cream), -0.95, -0.95, 0.42, 0.42, [0.7, 0.9, 0.9, 1.0][lv - 1], 'tile'); TWR(f, f.CR, V(P.conc), -0.42, -1.02, 0.46, 0.34, [0.85, 0.85, 0.95, 1.1][lv - 1], 'tile');
  TWR(f, f.CR, V(P.cream), 0.85, -1.02, 0.5, 0.34, [0.62, 0.7, 0.8, 0.9][lv - 1], 'tile'); TWR(f, f.CR, V(P.conc), 1.15, -0.65, 0.22, 0.3, 0.5, 'tile'); TWR(f, f.CR, V(P.cream), -0.05, -0.62, 0.3, 0.28, [0.55, 0.62, 0.62, 0.62][lv - 1], 'tile');
  if (lv >= 2) { TWR(f, f.G, V(P.glassB), 0.15, -1.0, 0.4, 0.4, [1.35, 1.35, 1.4][lv - 2], 'glass', lv >= 3 ? f.WG : null); TWR(f, f.GD, V(P.glassD), 0.5, -0.66, 0.3, 0.3, [0.9, 1.0, 1.1][lv - 2], 'glass'); }
  if (lv >= 3) { TWR(f, f.GG, V(P.glassG), -0.7, -0.75, 0.36, 0.36, [1.75, 1.9][lv - 3], 'boc'); TWR(f, f.G, V(P.glassB), 0.42, -1.02, 0.42, 0.42, [1.75, 2.3][lv - 3], 'ifc', f.WG); }
  if (lv >= 4) { TWR(f, f.GD, V(P.glassD), -1.05, -0.5, 0.28, 0.28, 1.35, 'glass', f.WG); TWR(f, f.G, V(P.glassB), 1.05, -1.05, 0.32, 0.32, 1.6, 'glass', f.WG); WHEEL(f, 1.08, 0.3, 0.26); }
  /* 海滨椰树 / 灌木 */
  var tn = [3, 4, 5, 5][lv - 1], tx = [-0.05, 0.75, -1.2, 1.0, -0.75]; for (i = 0; i < tn; i++) TR(f, tx[i], 0.32 + (i % 2) * 0.1, 0.75 + (i % 3) * 0.12);
  BUILD(f, g);
  var hm = g.userData.hotM;
  g.userData.anim = [
    function (t) { var m = hm[P.glow]; if (m) m.emissiveIntensity = 0.4 + 0.2 * (0.5 + 0.5 * S(t * 1.4)); },
    function (t) { var m = hm[P.waterD]; if (m) m.emissiveIntensity = 0.25 + 0.15 * (0.5 + 0.5 * S(t * 0.9 + 0.7)); hot.wt.offset.x = (t * 0.02) % 1; hot.wt.offset.y = (t * 0.012) % 1; }];
  return g;
}
window.Props3DModern = window.Props3DModern || {}; window.Props3DModern[34] = make34;
})();
