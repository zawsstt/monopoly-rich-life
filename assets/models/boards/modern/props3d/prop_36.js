/* 大富翁·现代写实棋盘 格 36「兰桂坊」—— 陡坡 L 形酒吧街 + 唐楼骑楼 + 霓虹灯牌夜景 四年代（1990s→2020s）
 * 视觉真源 refs/modern/prop_36.png（左上 1990s / 右上 2000s / 左下 2010s / 右下 2020s）。
 * 年代差异：lv1 斑驳灰白唐楼+绿瓦转角檐+红白条纹篷+红灯笼+天台水箱天线树+白天；lv2 炭黑外立面+玻璃店面暖光+蓝粉霓虹盒招+后排米色板楼；
 *   lv3 转角天台玻璃酒吧亭+竖向霓虹灯牌群+后排玻璃塔+湿路反光；lv4 全玻璃幕塔群+LED 媒体墙+天台温室花园酒吧+最密霓虹+街灯满配。
 * 契约：window.Props3DModern[36](level 1..4) → 全新 Group；占地 ≤2.6×2.6、底面 y=0、正面 +z（街道在前）；每级 mesh ≤55（手写合并 BufferGeometry：
 *   同材质桶=1 mesh）；Canvas ≤256px；零 Math.random（种子 LCG）；动画 2 项（霓虹粉/青交替脉动 / 橱窗暖光呼吸）。
 * R2 材质精修（剪影/构图不变，mesh 零增长）：顶点色承载主色调 + 近白多层 Canvas overlay（噪点/分缝/高光/风化）承载细节，材质 color=白；
 *   BUILD 内 boxUV 世界尺寸烘焙；霓虹灯牌 emissiveMap 升级为晕光+色管+白热管芯三层、lv3+ 湿路低粗糙反光、玻璃分格贴图、住户窗暖光 emissiveMap。 */
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
/* 斜坡路面（x 向条带，z 从 z0→z1 高度 y0→y1）+ 侧封板 */
function SLOPE(u, x0, x1, z0, y0, z1, y1, col, thick) { QAD(u, [x0, y0, z0], [x1, y0, z0], [x1, y1, z1], [x0, y1, z1], col); QAD(u, [x0, y0 - thick, z0], [x0, y1 - thick, z1], [x0, y1, z1], [x0, y0, z0], col); QAD(u, [x1, y0, z0], [x1, y1, z1], [x1, y1 - thick, z1], [x1, y0 - thick, z0], col); }
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
/* ---------- Canvas 程序纹理（≤256px）：overlay 叠加层（近白，乘顶点色主色）+ 竖向霓虹灯牌（辉光管字）/ 横向酒吧招牌 ---------- */
function CAN(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; } function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t; }
function TXR(c) { var t = TX(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; } var _T = {};
function TXG() { /* 灰泥/炭黑立面/石材/柏油通用：基色 → 噪点 → 分缝（横缝+错缝竖缝）→ 高光点 → 风化污渍（唐楼斑驳感） */
  if (_T.g) return _T.g; var c = CAN(128, 128), g = c.getContext('2d'), R = RG(3601), i, x, y; g.fillStyle = '#e6e4e0'; g.fillRect(0, 0, 128, 128);
  for (i = 0; i < 260; i++) { g.fillStyle = R() > 0.5 ? 'rgba(40,36,32,' + (0.04 + R() * 0.08).toFixed(2) + ')' : 'rgba(255,255,255,' + (0.05 + R() * 0.1).toFixed(2) + ')'; g.fillRect(R() * 128, R() * 128, 1 + R() * 3, 1 + R() * 2); }
  for (y = 0; y < 128; y += 21) { g.fillStyle = 'rgba(30,28,26,0.16)'; g.fillRect(0, y, 128, 1); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(0, y + 1, 128, 1); g.fillStyle = 'rgba(30,28,26,0.12)'; for (x = (y / 21) % 2 ? 0 : 32; x < 128; x += 64) g.fillRect(x, y, 1, 21); }
  for (i = 0; i < 18; i++) { g.fillStyle = 'rgba(60,52,44,' + (0.06 + R() * 0.1).toFixed(2) + ')'; g.fillRect(R() * 128, Math.floor(R() * 6) * 21 + 2, 2 + R() * 3, 8 + R() * 14); }
  g.fillStyle = 'rgba(255,255,255,0.35)'; for (i = 0; i < 20; i++) g.fillRect(R() * 128, R() * 128, 2, 1); return (_T.g = TXR(c));
}
function TXC() { /* 玻璃（店面/幕墙）：淡青基色 → 随机窗格明暗 → 斜向反光带 → 分格 → 高光点 */
  if (_T.c) return _T.c; var c = CAN(128, 128), g = c.getContext('2d'), R = RG(3602), i, x, y; g.fillStyle = '#dde6ec'; g.fillRect(0, 0, 128, 128);
  for (y = 0; y < 128; y += 32) for (x = 0; x < 128; x += 32) { var v = R(); g.fillStyle = v > 0.72 ? 'rgba(18,34,52,0.3)' : v < 0.2 ? 'rgba(255,255,255,0.28)' : 'rgba(60,90,120,' + (0.06 + R() * 0.1).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 28); }
  g.fillStyle = 'rgba(255,255,255,0.26)'; for (i = 0; i < 6; i++) { x = R() * 128; for (y = 0; y < 128; y += 2) g.fillRect((x + y * 0.6) % 128, y, 3, 2); }
  g.fillStyle = 'rgba(20,28,36,0.55)'; for (i = 0; i <= 128; i += 32) { g.fillRect(i, 0, 2, 128); g.fillRect(0, i, 128, 2); }
  g.fillStyle = 'rgba(255,255,255,0.5)'; for (i = 0; i < 24; i++) g.fillRect(R() * 128, R() * 128, 2, 1); return (_T.c = TXR(c));
}
function TXL() { /* 暖光橱窗/住户窗 map+emissiveMap：暖白 → 局部暗窗 → 窗棂暗线 */
  if (_T.l) return _T.l; var c = CAN(64, 64), g = c.getContext('2d'), R = RG(3603), x, y; g.fillStyle = '#fff2d8'; g.fillRect(0, 0, 64, 64);
  for (y = 0; y < 64; y += 16) for (x = 0; x < 64; x += 16) if (R() > 0.7) { g.fillStyle = 'rgba(80,50,20,0.45)'; g.fillRect(x + 2, y + 2, 12, 12); }
  g.fillStyle = 'rgba(40,24,10,0.5)'; for (x = 0; x <= 64; x += 16) { g.fillRect(x, 0, 2, 64); g.fillRect(0, x, 64, 2); } return (_T.l = TXR(c));
}
function NEONV(txt, col) { /* 竖向霓虹：暗底 → 外圈晕光边 → 亮边 → 字：晕（shadowBlur）+ 色管 + 白热管芯 → 闪烁碎光 */
  var c = CAN(64, 256), g = c.getContext('2d'), R = RG(3604), i; g.fillStyle = '#120e12'; g.fillRect(0, 0, 64, 256);
  g.globalAlpha = 0.35; g.fillStyle = col; g.fillRect(0, 0, 64, 12); g.fillRect(0, 244, 64, 12); g.fillRect(0, 0, 12, 256); g.fillRect(52, 0, 12, 256); g.globalAlpha = 1; g.fillRect(0, 0, 64, 4); g.fillRect(0, 252, 64, 4); g.fillRect(0, 0, 4, 256); g.fillRect(60, 0, 4, 256);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = col; g.shadowBlur = 16;
  for (i = 0; i < txt.length; i++) { g.font = 'bold 42px "Microsoft YaHei","SimHei",sans-serif'; g.fillStyle = col; g.fillText(txt[i], 32, 40 + i * 52); g.font = 'bold 34px "Microsoft YaHei","SimHei",sans-serif'; g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillText(txt[i], 32, 40 + i * 52); }
  g.shadowBlur = 0; g.fillStyle = 'rgba(255,255,255,0.35)'; for (i = 0; i < 12; i++) g.fillRect(6 + R() * 52, 6 + R() * 244, 2, 2); return TX(c);
}
function BARTX(txt, bg, fg) { /* 横向酒吧招牌：暗底 → 边线 → 字（晕光+管芯）→ 灯箱亮带 */
  var c = CAN(256, 64), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.fillStyle = fg; g.fillRect(6, 6, 244, 3); g.fillRect(6, 55, 244, 3);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = fg; g.shadowBlur = 12; g.font = 'bold 30px Arial'; g.fillText(txt, 128, 33); g.font = 'bold 26px Arial'; g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillText(txt, 128, 33);
  g.shadowBlur = 0; g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 10, 256, 8); return TX(c);
}
function SIGNM(w, h, tex, ei) { return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: tex, roughness: 0.35, metalness: 0.1, emissive: C('#ffffff'), emissiveMap: tex, emissiveIntensity: ei, side: THREE.DoubleSide })); }
/* ---------- 色板（采样自参考图） ---------- */
var P = { pave: '#c4beb0', stone: '#b0aa9c', road: '#4a4c50', roadW: '#5a5d63', mark: '#e9c74a', plaster: '#d6d0c2', plasterD: '#b9b1a1', char: '#34322f', charL: '#4a4744', tile: '#3f6b52',
  shop: '#8fb0a8', glassT: '#6f9ab0', glassB: '#7fa8c8', dark: '#2c2b29', white: '#ece7da', red: '#c4322a', awnW: '#efe6d2', metal: '#8a9098', tree: '#5f7f3d', treeL: '#7a9a4e', trunk: '#6a4e30',
  glow: '#ffd68e', neonP: '#ff4fa8', neonC: '#3fd8e8', neonG: '#ffb84a' };
/* ---------- 唐楼单元（可选炭黑立面 / 骑楼阳台 / 店面 / 篷 / 灯笼 / 天台杂物 或 玻璃亭） ---------- */
function TL(f, lv, cx, cz, w, d, fl, seed, hero) {
  var R = RG(seed), y = 0.26, h = 0.22, i, k, dk = V(P.dark), mt = V(P.metal), front = cz + d / 2, nw = Math.max(2, Math.round(w / 0.16));
  var darkF = lv >= 2 && (hero || R() > 0.45), wall = V(darkF ? P.char : (R() > 0.5 ? P.plaster : P.plasterD)), wb = darkF ? f.CH : f.PL;
  BX(wb, w, 0.3, d, cx, y + 0.15, cz, wall); BX(lv >= 2 ? f.WG : f.SH, w * 0.8, 0.17, 0.02, cx, y + 0.15, front + 0.008, V(lv >= 2 ? P.glow : P.shop));
  for (k = -1; k <= 1; k += 2) BX(wb, 0.05, 0.3, 0.05, cx + k * (w / 2 - 0.03), y + 0.15, front + 0.01, wall);
  if (lv === 1 && hero) { for (k = 0; k < 4; k++) BX(f.TI, w / 4 - 0.01, 0.03, 0.16, cx - w / 2 + (k + 0.5) * w / 4, y + 0.325 - k * 0.0, front + 0.06, V(P.tile)); }
  if (lv === 1) for (k = 0; k < 3; k++) BX(f.AW, w * 0.26, 0.02, 0.12, cx - w * 0.3 + k * w * 0.3, y + 0.28, front + 0.07, k % 2 ? V(P.awnW) : V(P.red));
  y += 0.3;
  for (i = 1; i < fl; i++) {
    BX(wb, w, h - 0.015, d, cx, y + h / 2, cz, wall); BX(f.PL, w + 0.04, 0.02, 0.1, cx, y + 0.01, front + 0.04, V(P.plasterD));
    for (k = 0; k < nw; k++) { var wx = cx - w / 2 + (k + 0.5) * w / nw, lit = lv >= 2 && R() > 0.5; BX(lit ? f.WG : f.D, w / nw * 0.55, 0.12, 0.02, wx, y + h * 0.55, front + 0.008, lit ? V(P.glow) : dk); }
    for (k = 0; k <= 4; k++) BX(f.M, 0.012, 0.07, 0.012, cx - w / 2 + k * w / 4, y + 0.055, front + 0.085, mt); BX(f.M, w + 0.02, 0.012, 0.012, cx, y + 0.09, front + 0.085, mt);
    y += h;
  }
  BX(f.PL, w + 0.03, 0.03, d + 0.03, cx, y + 0.015, cz, V(P.plasterD)); y += 0.03;
  if (hero && lv >= 3) { BX(f.GS, w * 0.7, 0.2, d * 0.6, cx, y + 0.1, cz, V(P.shop)); BX(f.M, w * 0.74, 0.02, d * 0.64, cx, y + 0.21, cz, mt); BX(f.WG, w * 0.5, 0.06, d * 0.4, cx, y + 0.06, cz, V(P.glow));
    if (lv >= 4) for (k = 0; k < 3; k++) SP(f.N, 5, 0.05, cx - w * 0.3 + k * w * 0.3, y + 0.24, cz + d * 0.28, V(P.tree)); }
  else if (lv <= 2) { CY(f.M, 6, 0.04, 0.04, y, y + 0.09, cx + w * 0.25, cz - d * 0.2, mt); CY(f.M, 4, 0.006, 0.006, y, y + 0.16, cx - w * 0.2, cz, mt); BX(f.M, 0.08, 0.008, 0.008, cx - w * 0.2, y + 0.15, cz, mt); if (R() > 0.5) SP(f.N, 5, 0.07, cx + w * 0.1, y + 0.08, cz + d * 0.2, V(P.treeL)); }
  else { BX(f.M, w * 0.3, 0.05, d * 0.3, cx, y + 0.025, cz - d * 0.1, mt); for (k = 0; k < 2; k++) BX(f.N, w * 0.35, 0.04, 0.08, cx - w * 0.2 + k * w * 0.4, y + 0.02, cz + d * 0.3, V(P.tree)); }
  if (lv === 1 && hero) for (k = 0; k < 3; k++) { CY(f.R, 6, 0.028, 0.028, 0.52, 0.58, cx - w * 0.3 + k * w * 0.3, front + 0.12, V(P.red)); }
  return y + 0.25;
}
function NEONBOX(f, x, y, z, w, pk) { BX(pk ? f.NE1 : f.NE2, w, 0.05, 0.03, x, y, z, V(pk ? P.neonP : P.neonC)); BX(f.D, w + 0.02, 0.06, 0.02, x, y, z - 0.02, V(P.dark)); }
function VSIGN(hot, x, y, z, tex, tint) { var m = SIGNM(0.09, 0.34, tex, 0.6, tint); m.position.set(x, y, z); m.rotation.y = PI / 2; g_add(m); hot.push(m.material); }
function TR(f, x, z, s) { BX(f.U, 0.03 * s, 0.22 * s, 0.03 * s, x, 0.12 + 0.11 * s, z, V(P.trunk)); SP(f.N, 6, 0.1 * s, x, 0.12 + 0.28 * s, z, V(P.tree)); SP(f.NL, 5, 0.065 * s, x + 0.04 * s, 0.12 + 0.34 * s, z + 0.03 * s, V(P.treeL)); }
function RAIL(f, x0, z0, x1, z1, y, n) { var c = V(P.metal), i; for (i = 0; i <= n; i++) BX(f.M, 0.014, 0.1, 0.014, x0 + (x1 - x0) * i / n, y + 0.05, z0 + (z1 - z0) * i / n, c); BX(f.M, x0 === x1 ? 0.014 : Math.abs(x1 - x0) + 0.02, 0.012, z0 === z1 ? 0.014 : Math.abs(z1 - z0) + 0.02, (x0 + x1) / 2, y + 0.1, (z0 + z1) / 2, c); }
function GTWR(f, lv, cx, cz, w, d, h, buck, col, led) {
  var y = 0.26, fl = Math.round(h / 0.2), hh = h / fl, i, k, mt = V(P.metal);
  for (i = 0; i < fl; i++) { BX(buck, w, hh - 0.015, d, cx, y + hh / 2, cz, col); BX(f.WH, w + 0.02, 0.016, d + 0.02, cx, y, cz, V(P.white)); for (k = 0; k <= 3; k++) BX(f.M, 0.014, hh, 0.014, cx - w / 2 + k * w / 3, y + hh / 2, cz + d / 2 + 0.004, mt); y += hh; }
  BX(f.M, w * 0.4, 0.05, d * 0.4, cx, y + 0.025, cz, mt); if (led) { BX(f.NE1, 0.06, h * 0.55, 0.02, cx + w / 2 + 0.012, 0.26 + h * 0.5, cz, V(P.neonP)); BX(f.NE2, w * 0.7, 0.05, 0.02, cx, 0.26 + h * 0.86, cz + d / 2 + 0.012, V(P.neonC)); }
  if (lv >= 4) CY(f.M, 4, 0.004, 0.012, y + 0.05, y + 0.2, cx, cz, mt); return y + (lv >= 4 ? 0.2 : 0.05);
}
var g_cur = null; function g_add(m) { m.castShadow = m.receiveShadow = true; g_cur.add(m); }
function make36(level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), f = { b: {} }, g = new THREE.Group(), i, hot = [];
  g.name = 'prop_36_modern_lv' + lv; g.userData = { kind: 'property', propIdx: 36, level: lv, hotM: {} }; g_cur = g;
  /* 材质分区：灰泥/炭黑/石材 = 高粗糙 + 颗粒风化 overlay；lv3+ 湿路 = 低粗糙微金属反光；绿釉瓦微光；店面/幕墙玻璃 = 低粗糙高金属 + 分格；暗窗微金属；金属拉丝；橱窗与住户窗 = 暖光 emissiveMap；霓虹管桶保持纯色发光 */
  var tg = TXG(), tc = TXC(), tl = TXL();
  f.P = B(f, 0.93, 0, '', 0, tg); f.S = B(f, 0.9, 0, '', 0, tg); f.A = B(f, lv >= 3 ? 0.35 : 0.97, lv >= 3 ? 0.2 : 0, '', 0, tg); f.MK = B(f, 0.9); f.PL = B(f, 0.88, 0, '', 0, tg); f.CH = B(f, 0.8, 0, '', 0, tg);
  f.TI = B(f, 0.45, 0.15, '', 0, tg); f.SH = B(f, 0.15, 0.5, '', 0, tc); f.GS = B(f, 0.1, 0.65, '', 0, tc); f.GT = B(f, 0.08, 0.75, '', 0, tc); f.D = B(f, 0.35, 0.3, '', 0, tc); f.WH = B(f, 0.85, 0, '', 0, tg); f.AW = B(f, 0.88);
  f.R = B(f, 0.55, 0.15, '', 0, tg); f.M = B(f, 0.3, 0.75, '', 0, tg); f.U = B(f, 0.89); f.N = B(f, 0.92); f.NL = B(f, 0.91);
  f.WG = B(f, 0.4, 0, P.glow, 0.5, tl, tl); f.NE1 = B(f, 0.4, 0, P.neonP, 0.8); f.NE2 = B(f, 0.4, 0, P.neonC, 0.8); f.NE3 = B(f, 0.4, 0, P.neonG, 0.7);
  /* 地形：下层街面（y=0.12）+ 上层台地（y=0.26，后/左）+ 陡坡路面 + 右侧石阶巷（L 形转角） */
  BX(f.P, 2.56, 0.12, 2.56, 0, 0.06, 0, V(P.pave)); BX(f.P, 2.56, 0.14, 1.5, 0, 0.19, -0.53, V(P.pave));
  BX(f.A, 2.56, 0.02, 0.5, 0, 0.13, 0.85, V(lv >= 3 ? P.roadW : P.road)); SLOPE(f.A, -1.28, 1.28, 0.22, 0.262, 0.6, 0.142, V(lv >= 3 ? P.roadW : P.road), 0.02);
  BX(f.S, 2.56, 0.02, 0.18, 0, 0.13, 1.19, V(P.stone)); if (lv >= 2) for (i = 0; i < 8; i++) BX(f.MK, 0.16, 0.006, 0.02, -1.15 + i * 0.32, 0.145, 0.85, V(P.mark));
  for (i = 0; i < 4; i++) BX(f.S, 0.34, 0.035, 0.12, 0.85, 0.28 + i * 0.03, 0.15 - i * 0.12, V(P.stone)); RAIL(f, 0.66, 0.2, 0.66, -0.3, 0.26, 4); RAIL(f, 1.04, 0.2, 1.04, -0.3, 0.26, 4);
  RAIL(f, -1.24, 0.2, 0.62, 0.2, 0.26, 12); RAIL(f, -1.24, 1.1, 0.62, 1.1, 0.14, 12);
  /* 前排唐楼（转角主角在左）+ 后排；lv2+ 后排米色板楼；lv3+ 玻璃塔；lv4 LED 媒体塔 */
  TL(f, lv, -0.9, -0.1, 0.62, 0.5, [3, 3, 4, 4][lv - 1], 61, true); TL(f, lv, -0.3, -0.1, 0.5, 0.5, [3, 4, 4, 4][lv - 1], 73, false); TL(f, lv, 0.28, -0.1, 0.56, 0.5, [3, 4, 4, 5][lv - 1], 89, false);
  TL(f, lv, 1.17, -0.3, 0.2, 0.9, [3, 4, 4, 4][lv - 1], 97, false); TL(f, lv, -0.85, -0.85, 0.7, 0.5, [3, 4, 4, 4][lv - 1], 101, false); TL(f, lv, -0.15, -0.85, 0.5, 0.5, [3, 4, 4, 4][lv - 1], 113, false);
  if (lv === 2) { BX(f.PL, 0.6, 1.1, 0.4, 0.55, 0.81, -1.02, V(P.plaster)); for (i = 0; i < 8; i++) BX(f.D, 0.08, 0.1, 0.02, 0.33 + (i % 4) * 0.15, 0.5 + Math.floor(i / 4) * 0.4, -0.81, V(P.dark)); }
  if (lv >= 3) { GTWR(f, lv, 0.55, -1.0, 0.56, 0.44, lv >= 4 ? 2.2 : 1.6, f.GT, V(P.glassT), lv >= 4); if (lv >= 4) GTWR(f, lv, -0.15, -0.85, 0.44, 0.4, 1.5, f.GS, V(P.glassB), false); }
  /* 霓虹：横向盒招（lv2+）+ 竖向中文灯牌（lv2+ 递增）+ 金色横招（lv3+） */
  if (lv >= 2) { NEONBOX(f, -0.72, 0.62, 0.17, 0.3, true); NEONBOX(f, 0.2, 0.66, 0.17, 0.26, false); if (lv >= 3) { NEONBOX(f, -0.28, 0.9, 0.17, 0.24, true); NEONBOX(f, 0.42, 1.08, 0.17, 0.2, false); }
    var t1 = NEONV('蘭桂坊', P.neonP), t2 = NEONV('酒吧', P.neonC), t3 = NEONV('夜市', P.neonG), n = [1, 2, 4, 6][lv - 1], px = [-0.58, 0.02, -0.02, 0.56, -0.6, 1.06], pz = [0.25, 0.27, 0.27, 0.25, 0.3, 0.2], k;
    for (k = 0; k < n; k++) VSIGN(hot, px[k], 0.68 + (k % 3) * 0.14, pz[k], [t1, t2, t3][k % 3], '#c0a0b0');
    if (lv >= 3) { var bs = SIGNM(0.42, 0.1, BARTX('LAN KWAI FONG', '#1a1418', '#ffb84a'), 0.5, '#8a7050'); bs.position.set(-0.9, 0.5, 0.17); g_add(bs); hot.push(bs.material); } }
  /* 街灯 / 消防栓 / 护柱 / 行道树 */
  for (i = 0; i < (lv >= 3 ? 3 : 2); i++) { var lx = -1.0 + i * 0.85; BX(f.M, 0.016, 0.34, 0.016, lx, 0.31, 1.0, V(P.metal)); BX(lv >= 2 ? f.NE3 : f.WH, 0.05, 0.03, 0.05, lx, 0.5, 1.0, V(lv >= 2 ? P.neonG : P.white)); }
  CY(f.R, 6, 0.02, 0.02, 0.14, 0.22, 0.95, 1.05, V(P.red)); BX(f.R, 0.05, 0.02, 0.02, 0.95, 0.2, 1.05, V(P.red)); for (i = 0; i < 5; i++) CY(f.M, 5, 0.012, 0.012, 0.14, 0.2, -1.1 + i * 0.5, 0.62, V(P.metal));
  TR(f, -1.15, 0.85, 0.7); if (lv >= 2) TR(f, 1.15, 0.95, 0.65); if (lv >= 4) TR(f, 0.4, 1.02, 0.55);
  BUILD(f, g);
  var hm = g.userData.hotM;
  g.userData.anim = [
    function (t) { var a = hm[P.neonP], b = hm[P.neonC], s = 0.5 + 0.5 * S(t * 2.4); if (a) a.emissiveIntensity = 0.55 + 0.4 * s; if (b) b.emissiveIntensity = 0.95 - 0.4 * s; for (var i = 0; i < hot.length; i++) hot[i].emissiveIntensity = 0.45 + 0.3 * (0.5 + 0.5 * S(t * 2.4 + i)); },
    function (t) { var m = hm[P.glow]; if (m) m.emissiveIntensity = 0.42 + 0.18 * (0.5 + 0.5 * S(t * 1.2 + 0.8)); }];
  return g;
}
window.Props3DModern = window.Props3DModern || {}; window.Props3DModern[36] = make36;
})();
