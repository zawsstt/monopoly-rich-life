/* 大富翁·现代写实棋盘（蓉）格 16「宽窄巷子」—— 成都青砖院落巷陌（宽/窄/井三巷）· v3 结构+细节精修
 * 视觉基准 refs/modern/prop_16.png 四象限（左上1990s/右上2000s/左下2010s/右下2020s 同一块地 40 年演进）：
 * 青砖灰瓦围合院落、连排巷墙（阶梯脊线）、巷门头、前街两层茶馆（木栏挑廊）、巷内茶座伞阵、檐下灯笼串；2020s 巷道上空玻璃连廊。
 * 契约：window.Props3DModern[16](level 1..4) → 每次全新 Group；占地 ≤2.6×2.6；底面 y=0；正面 +Z；
 * mesh ≤55/级（按材质合并，lv1..4≈16/19/23/26）；三角 lv1≤9k / lv4≤24k；Canvas ≤256px；零 Math.random（mulberry32 LCG）；
 * 动画 2 项（暖光窗 / 灯笼+匾额 emissive 呼吸）；高度带 lv1[0.83,1.0] lv2[0.88,1.06] lv3[1.1,1.3] lv4[1.2,1.4]。
 * 体量（对照参考）：后排 4 连栋 + 西巷墙 + 巷门头（lv3+ 双层）+ 前排两层茶馆 + 两间铺面 + 前街行道树列。
 * 年代演进（结构性）：lv1 1990s 素面青砖+木门板+稀树+小门头；lv2 2000s +匾额灯笼+白伞茶座+脊上披屋+挂招牌；
 *   lv3 2010s +双层门楼+暖光店面+布雨棚+灯笼串×2+街灯+凉亭+竹丛+花箱；lv4 2020s +玻璃连廊跨巷+屋面阳光房
 *   +满巷灯笼×3+花箱成列+藤蔓+天线+茂树。
 * 本轮变更：R1（结构）——5 盒子+空场 → 10 体量围合连续巷墙；屋面正脊/翘角/博风板；新增两层茶馆木栏挑廊、
 *   窗框/窗台/中挺、楼层板带、前街铺装带+路缘石、巷道分色、灯笼串锚定建筑檐口。
 *   R2（细节清偿）——青砖冷灰+砖缝加密、瓦行顺坡、深色勒脚桶压根、玻璃连廊（钢柱+分格双坡玻璃）、屋面天窗/水箱/
 *   空调外机/天线、竖幌+挂招牌+门匾、三层树冠+竹丛+角树补位、花箱成列、外摆桌椅、排水篦、藤蔓、雨棚托架立杆、1990s 门前箩筐。
 *   R3（补分）——后排 B1/B4 楼层板带+上层小窗（街墙普遍两层）、檐口瓦当线、窗横档、窗玻璃分格反射纹理、空调百叶独立纹理桶。
 * ============================================================================================= */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_16] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TX = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function F(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function RA(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')'; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? RA(255, 255, 255, a) : RA(24, 22, 18, a), R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); } /* 噪点层 */
function MOSS(g, w, h, n, y0, R) { for (var i = 0; i < n; i++) F(g, RA(96, 124, 58, 0.1 + R() * 0.16), R() * w, y0 + R() * (h - y0), 2 + R() * 6, 2 + R() * 3); } /* 苔痕层（下部） */
/* ---- 近白 overlay 纹理（顶点色承载主色）：各 ≥5 层 = 基色 + 块面风化 + 分缝 + 高光 + 噪点 + 苔痕 ---- */
var TXF = {
  s: function (g, w, h, R) { F(g, '#f0ece5', 0, 0, w, h); for (var y = 0; y < h; y += 32) { var o = (y / 32) % 2 ? 32 : 0; F(g, RA(80, 74, 64, 0.5), 0, y, w, 2); /* 石板：错缝分块+块差+磨光 */
    for (var x = o - 64; x < w; x += 64) { F(g, RA(80, 74, 64, 0.4), x, y, 2, 32); F(g, R() > 0.5 ? RA(255, 255, 250, 0.12) : RA(70, 64, 52, 0.1), x + 3, y + 3, 59, 27); F(g, RA(255, 255, 255, 0.22), x + 6, y + 4, 30 + R() * 24, 2); } }
    SPK(g, w, h, 80, 0.06, R); MOSS(g, w, h, 10, 0, R); },
  b: function (g, w, h, R) { F(g, '#efebe4', 0, 0, w, h); for (var y = 0; y < h; y += 14) { var o = (y / 14) % 2 ? 0 : 16; F(g, RA(58, 54, 48, 0.34), 0, y, w, 2); /* 青砖：顺丁砌缝+砖面色差+顶棱高光 */
    for (var x = o - 32; x < w; x += 32) { F(g, RA(58, 54, 48, 0.3), x, y, 2, 14); F(g, R() > 0.5 ? RA(80, 76, 70, 0.05 + R() * 0.08) : RA(255, 255, 255, 0.06 + R() * 0.1), x + 2, y + 2, 28, 10); F(g, RA(255, 255, 255, 0.25), x + 2, y + 2, 28, 1); } }
    SPK(g, w, h, 90, 0.06, R); MOSS(g, w, h, 12, 92, R); },
  t: function (g, w, h, R) { F(g, '#eceeed', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, RA(30, 36, 44, 0.28), x + 11, 0, 3, h); F(g, RA(255, 255, 255, 0.3), x + 2, 0, 2, h); } /* 灰瓦：瓦行顺坡为主+淡垄沟+风化 */
    for (var y = 10; y < h; y += 22) { F(g, RA(20, 26, 34, 0.42), 0, y, w, 3); for (var i = 0; i < 4; i++) F(g, RA(60, 66, 70, 0.05 + R() * 0.1), R() * w, y + 3, 12, 18); } SPK(g, w, h, 60, 0.06, R); MOSS(g, w, h, 12, 70, R); },
  w: function (g, w, h, R) { F(g, '#f5ebdf', 0, 0, w, h); for (var x = 0; x < w; x += 5) F(g, RA(70, 40, 20, 0.14 + R() * 0.14), x + R() * 2, 0, 1, h); /* 木构：直纹+节疤+顺纹高光 */
    for (var i = 0; i < 3; i++) { g.fillStyle = RA(70, 40, 20, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 3 + R() * 3, 0, 6.283); g.fill(); } for (x = 6; x < w; x += 28) F(g, RA(255, 255, 255, 0.32), x, 0, 2, h); SPK(g, w, h, 40, 0.05, R); },
  p: function (g, w, h, R) { F(g, '#f8f4ec', 0, 0, w, h); for (var i = 0; i < 9; i++) F(g, RA(120, 110, 88, 0.05 + R() * 0.07), R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80); /* 灰泥：雨渍+裂纹+泛潮+噪点+苔 */
    for (i = 0; i < 4; i++) { var x0 = R() * w; g.strokeStyle = RA(110, 100, 80, 0.18); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); } F(g, RA(90, 84, 66, 0.1), 0, 108, w, 20); SPK(g, w, h, 100, 0.05, R); MOSS(g, w, h, 8, 100, R); },
  l: function (g, w, h, R) { F(g, '#f1f5ea', 0, 0, w, h); for (var i = 0; i < 34; i++) { g.fillStyle = i % 2 ? RA(34, 66, 24, 0.28) : RA(255, 255, 240, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } }, /* 树冠：明暗叶斑 */
  n: function (g, w, h, R) { F(g, '#ffffff', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, RA(120, 20, 10, 0.35), x + 6, 0, 3, h); F(g, RA(255, 240, 220, 0.4), x + 12, 0, 2, h); } F(g, RA(120, 60, 10, 0.3), 0, 0, w, 6); F(g, RA(120, 60, 10, 0.3), 0, h - 6, w, 6); SPK(g, w, h, 20, 0.04, R); }, /* 灯笼纸：竹骨+纸纹（map+emissiveMap） */
  y: function (g, w, h, R) { F(g, '#eef4f6', 0, 0, w, h); for (var i = 0; i < 10; i++) { g.fillStyle = RA(255, 255, 255, 0.1 + R() * 0.2); g.fillRect(R() * w, 0, 2 + R() * 5, h); } /* 阳光房/连廊玻璃：竖反射带+分格 */
    for (var x = 0; x <= w; x += 32) F(g, RA(70, 92, 102, 0.4), x - 1, 0, 2, h); for (var y = 0; y <= h; y += 32) F(g, RA(70, 92, 102, 0.35), 0, y - 1, w, 2); F(g, RA(255, 255, 255, 0.4), 10, 0, 4, h); SPK(g, w, h, 40, 0.05, R); },
  v: function (g, w, h) { F(g, '#cfd4d8', 0, 0, w, h); for (var y = 2; y < h; y += 6) { F(g, '#3a4147', 0, y, w, 3); F(g, RA(230, 236, 240, 0.5), 0, y + 3, w, 1); } F(g, RA(0, 0, 0, 0.3), 0, 0, 3, h); F(g, RA(0, 0, 0, 0.3), w - 3, 0, 3, h); }, /* 空调百叶 */
  h: function (g, w, h) { F(g, '#8e2318', 0, 0, w, h); g.strokeStyle = '#e8c545'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#f6e2a8'; g.textAlign = 'center'; g.textBaseline = 'middle'; /* 竖幌：茶馆 */
    g.font = 'bold 44px "Microsoft YaHei",sans-serif'; g.fillText('茶', w / 2, 40); g.font = 'bold 34px "Microsoft YaHei",sans-serif'; g.fillText('馆', w / 2, 94); SPK(g, w, h, 14, 0.05, lcg(77)); },
  j: function (g, w, h) { F(g, '#2c2620', 0, 0, w, h); g.strokeStyle = '#a8763c'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#f0d8a0'; g.textAlign = 'center'; g.textBaseline = 'middle'; /* 挂匾：老茶馆 */
    g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText('老茶馆', w / 2, h / 2 + 2); SPK(g, w, h, 16, 0.05, lcg(78)); },
  k: function (g, w, h) { F(g, '#7c2a1c', 0, 0, w, h); g.strokeStyle = '#e8c545'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#f6e2a8'; g.textAlign = 'center'; g.textBaseline = 'middle'; /* 招牌：蜀锦 */
    g.font = 'bold 38px "Microsoft YaHei",sans-serif'; g.fillText('蜀锦', w / 2, h / 2 + 2); SPK(g, w, h, 12, 0.05, lcg(79)); },
  g: function (g, w, h) { F(g, '#35322a', 0, 0, w, h); g.strokeStyle = '#ffd98c'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#ffd98c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 38px "Microsoft YaHei",sans-serif'; g.fillText('宽窄巷子', w / 2, h / 2 + 2); } /* 匾额 256×64 */
};
function tex(id) { if (_TX[id]) return _TX[id]; var c = id === 'g' ? cv(256, 64) : id === 'h' ? cv(64, 128) : (id === 'j' || id === 'k') ? cv(128, 64) : cv(128, 128); TXF[id](c.getContext('2d'), c.width, c.height, lcg(1600 + id.charCodeAt(0))); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return (_TX[id] = t); }
/* ---- 桶系统：桶 = 材质参数；MS() 返回 {b:桶, c:线性顶点色}；flush 同桶合并 + 顶点色 + boxUV（ws=每重复米数，0=保留原 UV） ---- */
var BK;
function MS(h, rg, mt, tx, ws, em, ei, op) { var k = rg + '|' + (mt || 0) + '|' + (tx || '') + '|' + (ws || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (op || 0); var b = BK[k] || (BK[k] = { rg: rg, mt: mt || 0, tx: tx || '', ws: ws || 0, em: em || '', ei: ei || 0, op: op || 0, gs: [], cs: [] }); return { b: b, c: V(h) }; }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(m, g) { m.b.gs.push(g); m.b.cs.push(m.c); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function A2(m, geo, x, y, z, ry) { put(m, xf(geo, x, y, z, 0, ry || 0, 0)); }
function EAVE(m, w, h, t, tip, d, x, y, z, rot) { /* 川西卷檐坡屋顶：quadratic 翘檐断面沿脊挤出（rot=PI/2 脊沿 x / rot=0 脊沿 z） */
  var hw = w / 2, s = new THREE.Shape();
  s.moveTo(0, h); s.lineTo(hw * 0.62, 0); s.quadraticCurveTo(hw * 0.86, 0, hw, tip);
  s.lineTo(hw, tip + t); s.quadraticCurveTo(hw * 0.86, t, hw * 0.62, t); s.lineTo(0, h + t);
  s.lineTo(-hw * 0.62, t); s.quadraticCurveTo(-hw * 0.86, t, -hw, tip + t); s.lineTo(-hw, tip);
  s.quadraticCurveTo(-hw * 0.86, 0, -hw * 0.62, 0); s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2);
  A2(m, geo, x, y, z, rot === undefined ? PI / 2 : rot);
}
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i, j; if (!gs.length) continue; /* 空桶不出 mesh */
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ca = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) {
      var p = gs[i].attributes.position.array, c = b.cs[i]; pa.set(p, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2);
      for (j = 0; j < p.length; j += 3) { ca[o + j] = c[0]; ca[o + j + 1] = c[1]; ca[o + j + 2] = c[2]; } o += p.length;
    }
    if (b.ws) for (i = 0; i < P; i += 9) { /* boxUV：三角面主法线轴投影 × 1/ws（世界尺寸烘焙，跨件无缝） */
      var ax = pa[i + 3] - pa[i], ay = pa[i + 4] - pa[i + 1], az = pa[i + 5] - pa[i + 2], bx = pa[i + 6] - pa[i], by = pa[i + 7] - pa[i + 1], bz = pa[i + 8] - pa[i + 2];
      var nx = Math.abs(ay * bz - az * by), ny = Math.abs(az * bx - ax * bz), nz = Math.abs(ax * by - ay * bx), s = 1 / b.ws;
      for (j = 0; j < 3; j++) { var q = i + j * 3, u = i / 9 * 6 + j * 2; if (ny >= nx && ny >= nz) { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 2] * s; } else if (nx >= nz) { ua[u] = pa[q + 2] * s; ua[u + 1] = pa[q + 1] * s; } else { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 1] * s; } }
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true });
    if (b.tx) m.map = tex(b.tx); if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tx) m.emissiveMap = m.map; } if (b.op) { m.transparent = true; m.opacity = b.op; }
    b.m = m; var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function EI(m, v) { if (m && m.b.m) m.b.m.emissiveIntensity = v; }
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_16_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 16; g.userData.level = level;
  BK = {};
  var GB = 0.07; /* 台基顶 = 室内地坪 */
  var A = { /* 材质分区（桶）：同桶不同顶点色；roughness 石板0.92/青砖0.88/瓦0.7/木0.72/玻璃0.12-0.15/金0.35/钢0.45 */
    stone: MS('#8a8276', 0.92, 0, 's', 0.85), lane: MS('#746b5b', 0.92, 0, 's', 0.85), plaza: MS('#a89e8c', 0.92, 0, 's', 0.85),
    plinth: MS('#5c564c', 0.9, 0, 's', 1.2),
    wall: MS(['#96908a', '#9a948e', '#9e9892', '#9a948e'][level - 1], 0.88, 0, 'b', 2.4),
    plaster: MS('#ddd5c2', 0.85, 0, 'p', 0.8),
    roof: MS(['#52564f', '#555952', '#585c55', '#565a53'][level - 1], 0.7, 0, 't', 0.5),
    roofD: MS('#33362f', 0.76, 0, 't', 0.5),
    wood: MS(level >= 4 ? '#54381e' : '#4a3018', 0.72, 0, 'w', 0.3), trunk: MS('#4e3624', 0.9, 0, 'w', 0.3), win: MS('#3a444c', 0.15, 0.6, 'y', 0.4),
    leaf: MS('#6e7c48', 0.95, 0, 'l', 0.3), leaf2: MS('#82905a', 0.95, 0, 'l', 0.3), white: MS('#e6e0d0', 0.85, 0, 'p', 0.8),
    sky: MS('#9fb8c2', 0.12, 0.5, 'y', 0.9, '', 0, 0.55), steel: MS('#767d83', 0.45, 0.7), louv: MS('#d0d5d9', 0.6, 0.4, 'v', 0.15), umb: MS('#e8e0cc', 0.8), gold: MS('#c9a04a', 0.35, 0.8),
    wire: MS('#3d3b38', 0.8), awn: MS('#8a4a38', 0.85)
  };
  var glow = MS('#6a5a44', 0.2, 0, '', 0, '#ffbd66', level >= 3 ? 0.5 : 0.12); /* 暖光窗 */
  var lant = MS('#b03828', 0.6, 0, 'n', 0.12, '#ff5a2a', level >= 2 ? 0.3 : 0.05); /* 灯笼纸：map+emissiveMap */
  var lampM = level >= 3 ? MS('#ffe6b0', 0.4, 0, '', 0, '#ffd9a0', 0.7) : null;
  var signMs = [];
  function SIGN(id, w, h, x, y, z, ry, ei, ds) { /* 文字招牌：Plane + 顶点色 + map/emissiveMap（独立 mesh） */
    var t = tex(id), m = new THREE.MeshStandardMaterial({ vertexColors: true, map: t, roughness: 0.55, metalness: 0.05, emissive: C('#ffd9a0'), emissiveMap: t, emissiveIntensity: ei || 0.1 });
    if (ds) m.side = THREE.DoubleSide;
    var geo = new THREE.PlaneGeometry(w, h), n = geo.attributes.position.count, ca = new Float32Array(n * 3), i;
    for (i = 0; i < n * 3; i++) ca[i] = 1;
    geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var ms = new THREE.Mesh(geo, m); ms.position.set(x, y, z); ms.rotation.y = ry || 0; ms.castShadow = ms.receiveShadow = true; g.add(ms);
    signMs.push(m); return m;
  }
  function lan(x, y, z, s, hl) { /* 红灯笼：挂线+灯口+纸罩+穗 */
    s = s || 1;
    if (hl) Y(A.wire, 0.004, 0.004, 0.07 * s, 12, x, y + 0.075 * s, z);
    Y(A.gold, 0.013 * s, 0.013 * s, 0.022 * s, 12, x, y + 0.04 * s, z);
    Y(lant, 0.033 * s, 0.04 * s, 0.058 * s, 12, x, y, z);
    Y(A.gold, 0.007 * s, 0.005 * s, 0.028 * s, 12, x, y - 0.043 * s, z);
  }
  function WIN(x, y, z, w, h, vert, lit) { /* 木框窗：框四边+中挺+横档+石窗台（vert=朝 +x） */
    var mk = lit ? glow : A.win;
    if (vert) {
      B(mk, 0.018, h, w, x, y, z);
      B(A.wood, 0.03, 0.03, w + 0.04, x, y + h / 2, z); B(A.wood, 0.03, 0.03, w + 0.04, x, y - h / 2, z);
      B(A.wood, 0.03, h + 0.03, 0.032, x, y, z + w / 2); B(A.wood, 0.03, h + 0.03, 0.032, x, y, z - w / 2);
      B(A.wood, 0.024, h, 0.026, x, y, z); B(A.wood, 0.022, 0.02, w, x, y + h * 0.2, z);
      B(A.stone, 0.05, 0.018, w + 0.08, x + 0.014, y - h / 2 - 0.024, z);
    } else {
      B(mk, w, h, 0.018, x, y, z);
      B(A.wood, w + 0.04, 0.03, 0.03, x, y + h / 2, z); B(A.wood, w + 0.04, 0.03, 0.03, x, y - h / 2, z);
      B(A.wood, 0.032, h + 0.03, 0.03, x + w / 2, y, z); B(A.wood, 0.032, h + 0.03, 0.03, x - w / 2, y, z);
      B(A.wood, 0.026, h, 0.024, x, y, z); B(A.wood, w, 0.02, 0.022, x, y + h * 0.2, z);
      B(A.stone, w + 0.08, 0.018, 0.05, x, y - h / 2 - 0.024, z + 0.014);
    }
  }
  function DOOR(x, y, z, w, h, vert) { /* 木板门：门扇+框+楣+门槛石（y=底） */
    if (vert) {
      B(A.wood, 0.03, h, w, x, y + h / 2, z);
      B(A.wood, 0.04, h + 0.04, 0.045, x, y + h / 2, z + w / 2 + 0.012); B(A.wood, 0.04, h + 0.04, 0.045, x, y + h / 2, z - w / 2 - 0.012);
      B(A.wood, 0.04, 0.04, w + 0.07, x, y + h + 0.02, z);
      B(A.stone, 0.07, 0.014, w + 0.1, x + 0.012, y + 0.007, z);
    } else {
      B(A.wood, w, h, 0.03, x, y + h / 2, z);
      B(A.wood, 0.045, h + 0.04, 0.04, x + w / 2 + 0.012, y + h / 2, z); B(A.wood, 0.045, h + 0.04, 0.04, x - w / 2 - 0.012, y + h / 2, z);
      B(A.wood, w + 0.07, 0.04, 0.04, x, y + h + 0.02, z);
      B(A.stone, w + 0.1, 0.014, 0.07, x, y + 0.007, z + 0.012);
    }
  }
  function RIDGE(len, x, y, z, ax) { /* 正脊 + 两端翘角（川西脊饰） */
    B(A.roofD, ax ? len : 0.05, 0.026, ax ? 0.05 : len, x, y, z);
    var e = len / 2 - 0.02, k;
    for (k = -1; k <= 1; k += 2) B(A.roofD, ax ? 0.065 : 0.05, 0.032, ax ? 0.05 : 0.065, x + (ax ? k * e : 0), y + 0.02, z + (ax ? 0 : k * e), ax ? 0 : -k * 0.3, 0, ax ? k * 0.3 : 0);
  }
  function ROOF(w, d, h, tip, x, y, z, ax, barge) { /* 卷檐坡顶 + 正脊 + 檐口瓦当线 +（悬山）博风板 */
    EAVE(A.roof, w, h, 0.026, tip, d, x, y, z, ax ? PI / 2 : 0);
    RIDGE((ax ? d : w) + 0.06, x, y + h + 0.018, z, ax);
    var hw = w / 2 - 0.012, k;
    for (k = -1; k <= 1; k += 2) B(A.roofD, ax ? d + 0.02 : 0.03, 0.022, ax ? 0.03 : d + 0.02, x + (ax ? 0 : k * hw), y + tip + 0.022, z + (ax ? k * hw : 0));
    if (barge && ax) {
      var run = w * 0.31, ang = Math.atan2(h, run), sl = Math.sqrt(run * run + h * h) + 0.05, i, j;
      for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) B(A.wood, 0.022, 0.03, sl, x + i * (d / 2 + 0.008), y + h * 0.52, z + j * run * 0.55, -j * ang, 0, 0);
    }
  }
  function TREE(x, z, s) { /* 行道树：干+侧枝+三层团簇冠（lv3+ 四层） */
    s *= 1 + 0.08 * (level - 1);
    Y(A.trunk, 0.02 * s, 0.032 * s, 0.5 * s, 12, x, GB + 0.25 * s, z);
    Y(A.wood, 0.011 * s, 0.013 * s, 0.15 * s, 12, x + 0.05 * s, GB + 0.4 * s, z, 0, 0, 0.8);
    O(A.leaf, 0.155 * s, x, GB + 0.52 * s, z);
    O(A.leaf2, 0.105 * s, x + 0.11 * s, GB + 0.45 * s, z + 0.05 * s);
    O(A.leaf, 0.09 * s, x - 0.1 * s, GB + 0.63 * s, z - 0.04 * s);
    if (level >= 3) O(A.leaf2, 0.07 * s, x - 0.02 * s, GB + 0.72 * s, z + 0.04 * s);
  }
  function BAM(x, z, n) { /* 竹丛：细秆+顶梢叶团 */
    for (var i = 0; i < n; i++) {
      Y(A.leaf, 0.006, 0.009, 0.34 + (i % 3) * 0.06, 12, x + (i - n / 2) * 0.032, GB + 0.2 + (i % 3) * 0.03, z + (i % 2) * 0.03);
      O(A.leaf2, 0.045, x + (i - n / 2) * 0.032, GB + 0.42 + (i % 3) * 0.06, z + (i % 2) * 0.03);
    }
  }
  function UMB(x, z, s) { /* 茶馆白伞 */
    s = s || 1;
    Y(A.wood, 0.008 * s, 0.01 * s, 0.38 * s, 12, x, GB + 0.19 * s, z);
    Y(A.umb, 0.016 * s, 0.17 * s, 0.1 * s, 12, x, GB + 0.43 * s, z);
    Y(A.gold, 0.006 * s, 0.006 * s, 0.03 * s, 12, x, GB + 0.49 * s, z);
  }
  function TABLE(x, z) { /* 茶座：小圆桌+双凳 */
    Y(A.wood, 0.013, 0.017, 0.16, 12, x, GB + 0.08, z);
    Y(A.wood, 0.055, 0.055, 0.016, 12, x, GB + 0.168, z);
    Y(A.wood, 0.028, 0.034, 0.03, 12, x + 0.1, GB + 0.063, z + 0.07);
    Y(A.wood, 0.028, 0.034, 0.03, 12, x - 0.09, GB + 0.063, z - 0.06);
  }
  function BENCH(x, z, ax) { /* 靠背长凳 */
    B(A.wood, ax ? 0.26 : 0.08, 0.022, ax ? 0.08 : 0.26, x, GB + 0.15, z);
    B(A.wood, ax ? 0.03 : 0.06, 0.12, ax ? 0.06 : 0.03, x + (ax ? 0.09 : 0), GB + 0.08, z + (ax ? 0 : 0.09));
    B(A.wood, ax ? 0.03 : 0.06, 0.12, ax ? 0.06 : 0.03, x - (ax ? 0.09 : 0), GB + 0.08, z - (ax ? 0 : 0.09));
    B(A.wood, ax ? 0.26 : 0.05, 0.06, ax ? 0.05 : 0.26, x + (ax ? 0 : 0.03), GB + 0.21, z + (ax ? 0.028 : 0));
  }
  function PLANTER(x, z, ax) { /* 花箱：木箱+双色花团 */
    B(A.wood, ax ? 0.26 : 0.13, 0.09, ax ? 0.13 : 0.26, x, GB + 0.045, z);
    O(A.leaf2, 0.05, x - (ax ? 0.07 : 0), GB + 0.115, z - (ax ? 0 : 0.07));
    O(A.leaf, 0.045, x + (ax ? 0.07 : 0), GB + 0.11, z + (ax ? 0 : 0.07));
  }
  function LAMP(x, z, dir) { /* 街灯：基座+杆+悬臂+灯罩+灯泡 */
    Y(A.steel, 0.02, 0.024, 0.014, 12, x, GB + 0.007, z);
    Y(A.steel, 0.013, 0.017, 0.55, 12, x, GB + 0.275, z);
    B(A.steel, 0.14 * dir, 0.013, 0.013, x + dir * 0.065, GB + 0.55, z);
    B(A.steel, 0.07, 0.008, 0.05, x + dir * 0.125, GB + 0.548, z);
    B(lampM || A.steel, 0.06, 0.02, 0.042, x + dir * 0.125, GB + 0.53, z);
  }
  function ACU(x, y, z, vert) { /* 空调外机：机身+百叶面+支脚（vert=挂 +x 向山墙） */
    if (vert) { B(A.steel, 0.075, 0.11, 0.17, x, y, z); B(A.louv, 0.014, 0.075, 0.13, x + 0.044, y, z); B(A.steel, 0.05, 0.02, 0.02, x - 0.01, y - 0.065, z + 0.05); B(A.steel, 0.05, 0.02, 0.02, x - 0.01, y - 0.065, z - 0.05); }
    else { B(A.steel, 0.17, 0.11, 0.075, x, y, z); B(A.louv, 0.13, 0.075, 0.014, x, y, z + 0.044); B(A.steel, 0.02, 0.02, 0.05, x + 0.05, y - 0.065, z); B(A.steel, 0.02, 0.02, 0.05, x - 0.05, y - 0.065, z); }
  }
  function TANK(x, y, z) { /* 屋顶水箱 */
    Y(A.steel, 0.042, 0.042, 0.09, 12, x, y, z);
    Y(A.steel, 0.047, 0.047, 0.012, 12, x, y + 0.05, z);
    B(A.steel, 0.09, 0.016, 0.08, x, y - 0.053, z);
  }
  function SKYL(x, y, z, w, d) { /* 屋面天窗 */
    B(A.steel, w + 0.04, 0.02, d + 0.04, x, y, z);
    B(A.sky, w, 0.014, d, x, y + 0.016, z);
  }
  function AWN(x, y, z, w, dep) { /* 布雨棚：斜篷+滴水帘+托架立杆 */
    B(A.awn, w, 0.013, dep, x, y, z + dep * 0.42, -0.42, 0, 0);
    B(A.awn, w, 0.032, 0.014, x, y - dep * 0.34, z + dep * 0.8);
    Y(A.wood, 0.007, 0.009, y - GB - 0.05, 12, x - w * 0.42, GB + (y - GB - 0.05) / 2, z + dep * 0.8);
    Y(A.wood, 0.007, 0.009, y - GB - 0.05, 12, x + w * 0.42, GB + (y - GB - 0.05) / 2, z + dep * 0.8);
  }
  function STRING(x, z0, z1, y0, y1, n) { /* 灯笼串：锚定两端檐口，垂弧+灯笼 */
    var zm = (z0 + z1) / 2, ym = (y0 + y1) / 2, dz = z1 - z0, len = Math.sqrt(dz * dz + (y1 - y0) * (y1 - y0));
    B(A.wire, 0.005, 0.005, len, x, ym, zm, -Math.atan2(y1 - y0, dz), 0, 0);
    for (var i = 0; i < n; i++) { var f = (i + 0.5) / n, sag = 0.018 + 0.022 * Math.sin(f * PI); lan(x, y0 + (y1 - y0) * f - sag, z0 + dz * f, 0.8, 1); }
  }
  function GRATE(x, z) { B(A.wire, 0.12, 0.012, 0.09, x, GB + 0.026, z); } /* 排水篦 */
  /* ---- 1 地面：院落台基 + 主巷 + 门巷 + 前街 + 路缘石 ---- */
  B(A.stone, 2.56, 0.07, 2.46, 0, 0.035, 0.02);
  B(A.lane, 1.9, 0.018, 0.56, 0.29, 0.079, 0.02);   /* 东西主巷（宽巷） */
  B(A.lane, 0.54, 0.018, 0.66, -0.94, 0.079, 0.63); /* 门巷（巷门入内） */
  B(A.plaza, 2.4, 0.018, 0.36, 0, 0.079, 1.07);     /* 前街石板 */
  B(A.plaza, 0.05, 0.02, 2.42, -1.255, 0.08, 0.02); B(A.plaza, 0.05, 0.02, 2.42, 1.255, 0.08, 0.02);
  /* ---- 2 后排四连栋（阶梯脊线连续巷墙，两层表情）+ 通长勒脚 ---- */
  B(A.plinth, 2.54, 0.062, 0.68, 0, GB + 0.031, -0.62);
  B(A.wall, 0.74, 0.5, 0.64, -0.89, 0.32, -0.62);
  B(A.wood, 0.76, 0.03, 0.66, -0.89, 0.365, -0.62); /* 楼层板带（两层表情） */
  ROOF(0.78, 0.76, 0.14, 0.05, -0.89, 0.568, -0.62, true, true);
  WIN(-1.06, 0.24, -0.292, 0.15, 0.16, 0, level >= 3); WIN(-0.72, 0.24, -0.292, 0.15, 0.16, 0, false);
  WIN(-1.06, 0.46, -0.292, 0.11, 0.11, 0, false); WIN(-0.72, 0.46, -0.292, 0.11, 0.11, 0, false);
  B(A.wall, 0.64, 0.58, 0.66, -0.2, 0.36, -0.62);
  B(A.wood, 0.66, 0.03, 0.68, -0.2, 0.385, -0.62); /* 楼层板带 */
  ROOF(0.72, 0.68, 0.16, 0.055, -0.2, 0.648, -0.62, true, true);
  WIN(-0.36, 0.29, -0.282, 0.15, 0.18, 0, level >= 3); WIN(-0.04, 0.29, -0.282, 0.15, 0.18, 0, level >= 4);
  WIN(-0.36, 0.54, -0.282, 0.12, 0.13, 0, false); WIN(-0.04, 0.54, -0.282, 0.12, 0.13, 0, false);
  B(A.wall, 0.48, 0.44, 0.62, 0.36, 0.29, -0.62);
  ROOF(0.56, 0.52, 0.12, 0.045, 0.36, 0.508, -0.62, true, false);
  DOOR(0.36, GB, -0.282, 0.14, 0.22, false);
  WIN(0.52, 0.31, -0.272, 0.11, 0.13, 0, false);
  B(A.wall, 0.66, 0.53, 0.64, 0.93, 0.335, -0.62);
  B(A.wood, 0.68, 0.03, 0.66, 0.93, 0.375, -0.62); /* 楼层板带 */
  ROOF(0.7, 0.62, 0.14, 0.05, 0.93, 0.598, -0.62, true, true);
  WIN(0.78, 0.25, -0.292, 0.14, 0.16, 0, level >= 3); WIN(1.08, 0.25, -0.292, 0.14, 0.16, 0, false);
  WIN(0.78, 0.48, -0.292, 0.11, 0.11, 0, false); WIN(1.08, 0.48, -0.292, 0.11, 0.11, 0, level >= 4);
  /* ---- 3 西巷墙（围合西界，脊沿 z） ---- */
  B(A.plinth, 0.58, 0.062, 0.6, -0.98, GB + 0.031, -0.01);
  B(A.wall, 0.56, 0.48, 0.58, -0.98, 0.31, -0.01);
  ROOF(0.6, 0.62, 0.13, 0.05, -0.98, 0.548, -0.01, false, false);
  WIN(-0.685, 0.3, -0.15, 0.14, 0.16, true, level >= 3); WIN(-0.685, 0.3, 0.12, 0.14, 0.16, true, false);
  /* ---- 4 巷门头：灰砖门柱+木枋+卷檐匾额（lv3+ 双层翘檐+宝顶，lv4 天线） ---- */
  B(A.plinth, 0.14, 0.05, 0.14, -1.14, GB + 0.025, 0.69); B(A.plinth, 0.14, 0.05, 0.14, -0.74, GB + 0.025, 0.69);
  B(A.wall, 0.11, 0.62, 0.11, -1.14, 0.38, 0.69); B(A.wall, 0.11, 0.62, 0.11, -0.74, 0.38, 0.69);
  B(A.wood, 0.66, 0.07, 0.13, -0.94, 0.715, 0.69);
  if (level >= 2) { B(A.wood, 0.4, 0.115, 0.02, -0.94, 0.715, 0.758); SIGN('g', 0.38, 0.095, -0.94, 0.715, 0.771, 0, 0.12); }
  ROOF(0.68, 0.6, 0.13, 0.05, -0.94, 0.752, 0.69, true, false);
  lan(-1.13, 0.62, 0.775, 0.9, 1); if (level >= 2) lan(-0.75, 0.62, 0.775, 0.9, 1);
  if (level >= 3) {
    B(A.wood, 0.04, 0.28, 0.04, -1.1, 0.89, 0.6); B(A.wood, 0.04, 0.28, 0.04, -0.78, 0.89, 0.6);
    B(A.wood, 0.04, 0.28, 0.04, -1.1, 0.89, 0.78); B(A.wood, 0.04, 0.28, 0.04, -0.78, 0.89, 0.78);
    ROOF(0.5, 0.44, 0.11, 0.045, -0.94, 1.0, 0.69, true, false);
    Y(A.gold, 0.014, 0.02, 0.055, 12, -0.94, 1.16, 0.69);
  }
  if (level >= 4) { Y(A.steel, 0.005, 0.005, 0.12, 12, -0.94, 1.245, 0.69); O(A.steel, 0.012, -0.94, 1.312, 0.69); }
  /* ---- 5 前排：两层茶馆（一层店面+二层白墙木栏挑廊）+ 两间铺面 ---- */
  B(A.plinth, 0.6, 0.062, 0.64, -0.21, GB + 0.031, 0.65); /* 勒脚 */
  B(A.wall, 0.58, 0.3, 0.62, -0.21, 0.22, 0.65);
  WIN(-0.34, 0.24, 0.968, 0.3, 0.18, 0, level >= 2);
  DOOR(-0.02, GB, 0.968, 0.13, 0.24, false);
  if (level >= 2) SIGN('j', 0.3, 0.075, -0.34, 0.362, 0.99, 0, 0.1);
  B(A.wood, 0.62, 0.032, 0.66, -0.21, 0.386, 0.65); /* 楼层板带 */
  B(A.plaster, 0.58, 0.26, 0.6, -0.21, 0.525, 0.64);
  WIN(-0.36, 0.525, 0.948, 0.12, 0.14, 0, level >= 3); WIN(-0.21, 0.525, 0.948, 0.12, 0.14, 0, false); WIN(-0.06, 0.525, 0.948, 0.12, 0.14, 0, level >= 4);
  B(A.wood, 0.62, 0.02, 0.1, -0.21, 0.402, 1.0); /* 木挑廊 */
  for (var bi = 0; bi <= 8; bi++) B(A.wood, 0.016, 0.1, 0.016, -0.5 + bi * 0.0725, 0.462, 1.043);
  B(A.wood, 0.62, 0.02, 0.024, -0.21, 0.518, 1.043); B(A.wood, 0.62, 0.018, 0.02, -0.21, 0.412, 1.043);
  ROOF(0.64, 0.64, 0.13, 0.05, -0.21, 0.655, 0.64, true, true);
  if (level >= 2) { lan(-0.44, 0.58, 0.95, 0.85, 1); lan(0.02, 0.58, 0.95, 0.85, 1); }
  if (level >= 3) SIGN('h', 0.07, 0.2, -0.5, 0.42, 1.0, 0, 0.12, true);
  B(A.plinth, 0.48, 0.062, 0.58, 0.39, GB + 0.031, 0.64);
  B(A.wall, 0.46, 0.36, 0.56, 0.39, 0.25, 0.64);
  WIN(0.3, 0.24, 0.928, 0.2, 0.18, 0, level >= 3);
  DOOR(0.52, GB, 0.928, 0.11, 0.22, false);
  ROOF(0.52, 0.5, 0.11, 0.04, 0.39, 0.428, 0.64, true, false);
  if (level >= 3) SIGN('k', 0.24, 0.1, 0.39, 0.4, 0.928, 0, 0.1);
  B(A.plinth, 0.46, 0.062, 0.58, 0.88, GB + 0.031, 0.64);
  B(A.wall, 0.44, 0.4, 0.56, 0.88, 0.27, 0.64);
  WIN(0.78, 0.26, 0.928, 0.14, 0.16, 0, false);
  DOOR(0.99, GB, 0.928, 0.12, 0.24, false);
  ROOF(0.5, 0.48, 0.12, 0.045, 0.88, 0.468, 0.64, true, false);
  if (level >= 3) ACU(1.14, 0.3, 0.62, true); /* S2 山墙挂机 */
  if (level === 1) { B(A.wood, 0.12, 0.09, 0.1, -0.62, GB + 0.045, 0.5, 0, 0.3, 0); B(A.wood, 0.09, 0.07, 0.08, -0.6, GB + 0.125, 0.51, 0, -0.2, 0); B(A.wood, 0.1, 0.08, 0.09, 0.66, GB + 0.04, 1.0, 0, 0.5, 0); } /* 1990s 门前杂料箩筐 */
  /* ---- 6 屋面加建设备：披屋(lv2) → 凉亭+天窗+水箱+空调(lv3) → 阳光房(lv4) ---- */
  if (level >= 2) { B(A.white, 0.42, 0.2, 0.36, -0.2, 0.92, -0.62); B(A.roofD, 0.48, 0.02, 0.42, -0.2, 1.03, -0.62); }
  if (level >= 3) {
    Y(A.wood, 0.012, 0.012, 0.2, 12, 0.83, 0.79, -0.72); Y(A.wood, 0.012, 0.012, 0.2, 12, 1.03, 0.79, -0.72);
    Y(A.wood, 0.012, 0.012, 0.2, 12, 0.83, 0.79, -0.52); Y(A.wood, 0.012, 0.012, 0.2, 12, 1.03, 0.79, -0.52);
    B(A.white, 0.26, 0.02, 0.26, 0.93, 0.9, -0.62);
    Y(A.roofD, 0.02, 0.27, 0.11, 12, 0.93, 0.955, -0.62);
    Y(A.gold, 0.008, 0.012, 0.03, 12, 0.93, 1.025, -0.62);
    SKYL(-0.2, 1.045, -0.62, 0.14, 0.1);
    ACU(-0.34, 1.105, -0.72, false);
    TANK(-1.02, 0.713, -0.78);
  }
  if (level >= 4) {
    B(A.steel, 0.46, 0.02, 0.36, -0.89, 0.745, -0.62); /* B1 脊上玻璃阳光房 */
    B(A.sky, 0.4, 0.16, 0.3, -0.89, 0.835, -0.62);
    B(A.steel, 0.44, 0.014, 0.34, -0.89, 0.922, -0.62);
    /* 玻璃连廊跨主巷（钢柱+分格双坡玻璃+屋脊） */
    Y(A.steel, 0.01, 0.012, 0.46, 12, 0.3, 0.3, -0.25); Y(A.steel, 0.01, 0.012, 0.46, 12, 0.9, 0.3, -0.25);
    Y(A.steel, 0.01, 0.012, 0.46, 12, 0.3, 0.3, 0.29); Y(A.steel, 0.01, 0.012, 0.46, 12, 0.9, 0.3, 0.29);
    B(A.sky, 0.6, 0.012, 0.3, 0.6, 0.585, -0.125, -0.386, 0, 0);
    B(A.sky, 0.6, 0.012, 0.3, 0.6, 0.585, 0.165, 0.386, 0, 0);
    B(A.steel, 0.64, 0.02, 0.03, 0.6, 0.642, 0.02);
    B(A.steel, 0.014, 0.012, 0.3, 0.42, 0.585, -0.125, -0.386, 0, 0); B(A.steel, 0.014, 0.012, 0.3, 0.78, 0.585, -0.125, -0.386, 0, 0);
    B(A.steel, 0.014, 0.012, 0.3, 0.42, 0.585, 0.165, 0.386, 0, 0); B(A.steel, 0.014, 0.012, 0.3, 0.78, 0.585, 0.165, 0.386, 0, 0);
    B(A.leaf2, 0.02, 0.3, 0.36, -0.688, 0.32, -0.05); /* 西墙藤蔓 */
    O(A.leaf2, 0.06, -0.688, 0.5, -0.02);
  }
  /* ---- 7 巷内生活：排水篦+灯笼串（锚定檐口）+茶座伞阵+桌凳+街灯+花箱 ---- */
  GRATE(0.12, 0.02); GRATE(0.45, -0.12);
  if (level >= 2) {
    STRING(-0.1, -0.27, 0.33, 0.56, 0.42, 3);
    UMB(-0.42, 0.08, 1); TABLE(-0.42, 0.02);
    BENCH(1.14, 0.14, true); LAMP(-0.3, 0.31, 1);
    lan(-0.63, 0.5, 0.3, 0.8, 1);
  }
  if (level >= 3) {
    STRING(0.5, -0.27, 0.33, 0.52, 0.42, 3);
    UMB(0.74, 0.08, 0.95); TABLE(0.74, 0.14);
    LAMP(1.2, 0.95, -1); LAMP(-0.3, 1.17, 1);
    PLANTER(-0.62, -0.24, true); PLANTER(0.3, -0.24, true); PLANTER(1.05, -0.24, true);
    AWN(-0.02, 0.365, 0.97, 0.18, 0.13); AWN(0.78, 0.36, 0.93, 0.3, 0.15);
  }
  if (level >= 4) { STRING(0.9, -0.28, 0.35, 0.5, 0.44, 3); PLANTER(-0.85, 1.12, true); PLANTER(0.75, 1.14, true); }
  /* ---- 8 乔木/竹丛（逐年代增多长高，树冠贴干团簇） ---- */
  TREE(-0.55, 0.02, 0.8); TREE(1.02, -0.98, 1.0); TREE(-1.06, 0.44, 0.75);
  if (level >= 2) { TREE(0.86, -0.06, 0.95); BAM(-1.16, -1.02, 3); }
  if (level >= 3) { TREE(0.4, 1.06, 0.7); TREE(-1.04, -1.04, 0.8); BAM(0.66, 0.24, 2); }
  if (level >= 4) TREE(1.06, 1.08, 0.8);
  flush(g);
  /* ---- 动画 2 项：暖光窗呼吸 / 灯笼+招牌 emissive 呼吸 ---- */
  g.userData.anim = [function (t) { EI(glow, (level >= 3 ? 0.55 : 0.16) + 0.13 * (0.5 + 0.5 * Math.sin(t * 1.4))); },
    function (t) {
      var s = 0.5 + 0.5 * Math.sin(t * 1.8), i;
      EI(lant, (level >= 4 ? 0.62 : level >= 2 ? 0.3 : 0.06) + 0.16 * s);
      for (i = 0; i < signMs.length; i++) signMs[i].emissiveIntensity = 0.08 + 0.1 * s;
    }];
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[16] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
