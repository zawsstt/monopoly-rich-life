/* 大富翁·现代写实棋盘（港）格 34「尖沙咀」—— 维港海滨：钟楼 + 文化中心 + 天星码头 + 半岛酒店板楼 + 中环塔群 + 摩天轮，四年代演进
 * 视觉基准 refs/modern/prop_34.png 四象限（左上1990s/右上2000s/左下2010s/右下2020s 同一块地 40 年演进）：
 * 前场维港水面 + 海堤 + 海滨长廊（栏杆/树列/街灯/长椅/花坛）；左前红砖钟楼（白饰带/拱窗/四面钟/白穹顶/金顶针，各年代不变身份锚）；
 * 中前文化中心（米色弧形翘屋顶 + 竖向遮阳片 + 玻璃大堂）；其后半岛式酒店板楼（密窗格 + 门廊 + 屋顶设备）；
 * 左侧两座天星码头栈桥（桩柱 + 双层白亭 + 绿边檐口 + STAR FERRY 招牌）+ 绿身白篷渡轮 2-3 艘；
 * 后排中环天际线 6-10 塔：lv1 米色混凝土办公楼群（点窗/壁柱/平顶女儿墙/屋顶水箱）→ lv2 +蓝玻璃 IFC 一期（白冠+短尖）+暗玻塔+酒店加建塔楼+绿篱+售货亭
 * → lv3 +中银大厦（绿玻璃 X 斜撑 + 收分冠 + 桅杆）+ IFC 二期 + G5 塔 + 塔身暖光窗带 + 第三渡轮（尾迹）+ 街灯长椅旗杆 → lv4 IFC 二期升至最高
 * （冠部四翼 + 长尖顶）+ 右前海滨红白摩天轮（辐条/吊舱/A 支架）+ 旧低楼汰换为玻璃塔 + G4/G6 新塔 + 花坛。
 * 契约：window.Props3DModern[34](level 1..4) → 每次全新 Group；占地 ≤2.6×2.6（实测 2.56×2.56）；底面 y=0；正面 +z（维港在前）；
 * mesh ≤55/级（桶=材质参数，同桶顶点色合并；实测 lv1..4 = 16/19/20/20）；三角 lv1≤9k/lv2≤13k/lv3≤18k/lv4≤24k（实测 4.0k/4.9k/6.6k/7.9k）；
 * Canvas ≤256px（9 张）；零 Math.random（LCG 种子流）；动画 2 项（塔群暖光窗呼吸 / 水面 emissive 脉动+涟漪贴图漂移，每实例独立贴图）；
 * 高度带 lv1[0.8,1.4] lv2[1.2,1.8] lv3[1.6,2.3] lv4[2.0,2.9]（实测 1.13 钟楼 / 1.52 IFC 一期 / 2.09 IFC 二期 / 2.58 IFC 二期+冠翼+尖顶）。
 * 材质：近白 overlay Canvas（铺装分缝/石材/红砖顺丁/幕墙分格+反光带/点窗/水波涟漪/叶斑/钟面/码头招牌）× 顶点色分区，
 *   世界尺寸 boxUV；rough 铺装.93/石.88/砖.82/幕墙.10金属.70（蓝/深蓝/浅蓝/中银绿四色调）/点窗楼.85/金属.35金属度.75/渡轮漆.5/沥青.95/水.10金属.3。
 * 本轮变更：R1（结构重写）—— 旧 65 分版（全盒塔群+贴图窗）→ 全套按参考图重组：水面扩至前场 0.5 深 + 海堤 + 长廊全套街具；
 *   钟楼成 lv1 制高点（拱窗/四面钟/穹顶/顶针）；文化中心由叠板 → Extrude 弧形翘屋顶+遮阳片+玻璃大堂；新增半岛式酒店板楼（密窗格桶）；
 *   码头重构（桩柱双层白亭+檐口+招牌）；渡轮加大（绿身/双层/烟囱/桅杆）；塔群按年代重排（lv1 办公楼群 → lv2+ 幕墙塔白冠短尖 →
 *   lv3 中银 X 斜撑四向 → lv4 IFC 二期制高 + 摩天轮 + 旧楼汰换为玻璃塔）。
 *   R2（差距清偿）—— 海滨区去白：长廊/海堤/码头板改灰石色、码头檐口改天星绿；钟楼收细加高 0.24×0.63 成 lv1 最高（1.13）；
 *   中银独立绿玻璃桶 + 斜撑改正到 ±z/±x 四面；摩天轮 r0.2→0.24；渡轮干舷加高；办公楼壁柱；水箱顶盘改深色；IFC 二期 lv3/4 升至 2.09/2.58。
 *   R3（细节补分）—— 文化中心弧顶 h0.26→0.40 + 沿贝塞尔切向 7 道屋面肋条 + 后侧沥青路带/标线 + 红的士 4 辆 + 旗杆 lv3+ + 角树；
 *   半岛酒店 lv2+ 加建中央塔楼（1994 结构性演进）+ 楼层带；码头板抬 0.005 消除与海堤共面 z-fight + 边栏杆；渡轮重停泊（不再侵入码头桩）
 *   + 行驶船尾迹；海堤泡沫线；IFC 二期冠部四翼；lv3+ 新增 G5 塔、lv4 新增 G4/G6 塔（四色玻璃）；售货亭 lv2+；第三街灯；钟楼双层基座。
 * ============================================================================================= */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_34] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TX = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function F(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function RA(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')'; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? RA(255, 255, 255, a) : RA(24, 22, 18, a), R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
/* ---- 近白 overlay 纹理（顶点色承载主色）：p 铺装分缝 / s 石材 / b 红砖顺丁 / c 幕墙分格+反光带 / o 点窗楼 / w 水波 / l 叶斑 / k 钟面 / f 码头招牌 ---- */
var TXF = {
  p: function (g, w, h, R) { F(g, '#ede8dc', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 32) for (x = 0; x < w; x += 32) { F(g, R() > 0.5 ? RA(118, 108, 90, 0.09) : RA(255, 255, 250, 0.1), x + 2, y + 2, 28, 28); F(g, RA(88, 82, 70, 0.38), x, y, w, 2); F(g, RA(88, 82, 70, 0.38), x, y, 2, 32); F(g, RA(255, 255, 255, 0.26), x, y + 2, w, 1); } SPK(g, w, h, 70, 0.05, R); },
  s: function (g, w, h, R) { F(g, '#f4f1ea', 0, 0, w, h); var i, y; for (y = 12; y < h; y += 20) { F(g, RA(96, 90, 78, 0.13), 0, y, w, 2); F(g, RA(255, 255, 255, 0.24), 0, y + 2, w, 1); } for (i = 0; i < 8; i++) F(g, RA(110, 100, 84, 0.05 + R() * 0.08), R() * w, R() * h, 4 + R() * 8, 2 + R() * 5); SPK(g, w, h, 50, 0.06, R); },
  b: function (g, w, h, R) { F(g, '#f6e7dc', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 10) { var o = (y / 10) % 2 ? 10 : 0; F(g, RA(70, 42, 30, 0.48), 0, y, w, 2); for (x = o - 20; x < w; x += 20) { F(g, RA(70, 42, 30, 0.38), x, y, 2, 10); F(g, R() > 0.5 ? RA(255, 255, 255, 0.14) : RA(120, 50, 30, 0.12), x + 2, y + 2, 17, 6); F(g, RA(255, 255, 255, 0.2), x + 2, y + 2, 17, 1); } } SPK(g, w, h, 60, 0.06, R); },
  c: function (g, w, h, R) { F(g, '#e6edf2', 0, 0, w, h); var x, y, i; for (y = 0; y < h; y += 32) for (x = 0; x < w; x += 32) { var v = R(); F(g, v > 0.74 ? RA(255, 255, 255, 0.38) : v < 0.22 ? RA(40, 66, 92, 0.3) : RA(90, 130, 165, 0.16 + R() * 0.12), x + 2, y + 2, 28, 28); F(g, RA(255, 255, 255, 0.2), x + 3, y + 3, 20, 1); } for (i = 0; i < 5; i++) { var x0 = R() * w; for (y = 0; y < h; y += 2) F(g, RA(255, 255, 255, 0.24), (x0 + y * 0.55) % w, y, 3, 2); } F(g, RA(34, 46, 58, 0.5), 0, 0, w, 2); for (i = 0; i <= w; i += 32) { F(g, RA(34, 46, 58, 0.5), i, 0, 2, h); F(g, RA(34, 46, 58, 0.45), 0, i, w, 2); } SPK(g, w, h, 24, 0.05, R); },
  o: function (g, w, h, R) { F(g, '#f0e9da', 0, 0, w, h); var x, y; for (y = 4; y < h - 6; y += 16) for (x = 4; x < w - 4; x += 16) { F(g, RA(52, 74, 96, 0.32 + R() * 0.18), x, y, 10, 9); F(g, RA(255, 255, 255, 0.3), x - 1, y + 9, 12, 1); F(g, RA(255, 255, 255, 0.14), x, y, 10, 2); } F(g, RA(96, 88, 72, 0.16), 0, h - 6, w, 6); SPK(g, w, h, 50, 0.05, R); },
  w: function (g, w, h, R) { F(g, '#e8f2f2', 0, 0, w, h); var i, j; for (i = 0; i < 8; i++) { var y0 = i * 16; for (j = 0; j < w; j += 2) { var yy = (y0 + 5 * Math.sin(j * 0.11 + i * 1.9) + h) % h; F(g, i % 2 ? RA(255, 255, 255, 0.45) : RA(24, 84, 96, 0.16), j, yy, 2, 2); } } for (i = 0; i < 9; i++) F(g, RA(16, 70, 84, 0.1), R() * w, R() * h, 12 + R() * 22, 3 + R() * 5); for (i = 0; i < 34; i++) F(g, RA(255, 255, 255, 0.5), R() * w, R() * h, 2 + R() * 3, 1); },
  l: function (g, w, h, R) { F(g, '#f2f6ec', 0, 0, w, h); var i; for (i = 0; i < 40; i++) { g.fillStyle = i % 2 ? RA(50, 84, 34, 0.24) : RA(255, 255, 240, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 1.5 + R() * 3.5, 0, 6.283); g.fill(); } },
  k: function (g, w, h, R) { F(g, '#f4efe2', 0, 0, w, h); F(g, '#2a2622', 0, 0, w, 7); F(g, '#2a2622', 0, h - 7, w, 7); F(g, '#2a2622', 0, 0, 7, h); F(g, '#2a2622', w - 7, 0, 7, h); var i; for (i = 0; i < 12; i++) { var a = i / 12 * 2 * PI; F(g, '#2a2622', 64 + Math.cos(a) * 45 - 3, 64 + Math.sin(a) * 45 - 3, 6, 6); } F(g, '#2a2622', 60, 28, 8, 38); F(g, '#2a2622', 64, 60, 28, 7); F(g, '#b0402a', 58, 58, 12, 12); for (i = 0; i < 16; i++) { g.fillStyle = R() > 0.5 ? RA(90, 120, 100, 0.14) : RA(120, 90, 60, 0.1); F(g, RA(90, 120, 100, 0.12), 10 + R() * 108, 10 + R() * 108, 3 + R() * 5, 2 + R() * 4); } },
  f: function (g, w, h) { F(g, '#1e6e4e', 0, 0, w, h); F(g, '#ffffff', 0, 0, w, 3); F(g, '#ffffff', 0, h - 3, w, 3); g.fillStyle = '#ffffff'; g.font = 'bold 26px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('STAR FERRY 天星小輪', 128, 25); F(g, RA(255, 255, 255, 0.2), 0, 5, w, 7); }
};
var TDIM = { p: [128, 128], s: [128, 128], b: [128, 128], c: [128, 128], o: [128, 128], w: [128, 128], l: [64, 64], k: [128, 128], f: [256, 48] };
function tex(id) { if (_TX[id]) return _TX[id]; var d = TDIM[id], c = cv(d[0], d[1]); TXF[id](c.getContext('2d'), c.width, c.height, lcg(2300 + id.charCodeAt(0) * 11)); return (_TX[id] = TX(c)); }
/* ---- 桶系统：桶 = 材质参数；MS() 返回 {b:桶,c:线性顶点色}；flush 同桶合并 + 顶点色 + boxUV（ws=每重复米数） ---- */
var BK;
function MS(h, rg, mt, tx, ws, em, ei) { var k = rg + '|' + (mt || 0) + '|' + (tx || '') + '|' + (ws || 0) + '|' + (em || '') + '|' + (ei || 0); var b = BK[k] || (BK[k] = { rg: rg, mt: mt || 0, tx: tx || '', ws: ws || 0, em: em || '', ei: ei || 0, gs: [], cs: [] }); return { b: b, c: V(h) }; }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(m, g) { m.b.gs.push(g); m.b.cs.push(m.c); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function SPH(m, r, x, y, z) { put(m, xf(new THREE.SphereGeometry(r, 16, 12, 0, 2 * PI, 0, PI / 2), x, y, z)); }
function A2(m, geo, x, y, z, ry) { put(m, xf(geo, x, y, z, 0, ry || 0, 0)); }
function SWOOP(m, w, h, d, x, y, z, rib) { /* 文化中心弧形翘屋顶：左高右低凹曲线断面沿 z 挤出；rib=屋面肋条桶（沿曲线切向布置） */
  var hw = w / 2, s = new THREE.Shape(), P = [[hw, h * 0.1], [hw * 0.1, h * 0.12], [-hw * 0.4, h * 0.6]], Q = [[-hw * 0.4, h * 0.6], [-hw * 0.78, h * 0.98], [-hw, h]];
  s.moveTo(-hw, 0); s.lineTo(hw, 0); s.lineTo(hw, h * 0.1);
  s.quadraticCurveTo(P[1][0], P[1][1], P[2][0], P[2][1]);
  s.quadraticCurveTo(Q[1][0], Q[1][1], Q[2][0], Q[2][1]); s.lineTo(-hw, 0);
  var geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 10 }); geo.translate(0, 0, -d / 2);
  A2(m, geo, x, y, z, 0);
  if (!rib) return;
  function bz(c, t, k) { var u = 1 - t; return u * u * c[0][k] + 2 * u * t * c[1][k] + t * t * c[2][k]; }
  function tg(c, t, k) { return 2 * (1 - t) * (c[1][k] - c[0][k]) + 2 * t * (c[2][k] - c[1][k]); }
  var ts = [[P, 0.12], [P, 0.3], [P, 0.48], [P, 0.66], [P, 0.84], [Q, 0.3], [Q, 0.62]], i;
  for (i = 0; i < ts.length; i++) { var c = ts[i][0], t = ts[i][1], px = bz(c, t, 0), py = bz(c, t, 1), tx = tg(c, t, 0), ty = tg(c, t, 1), a = Math.atan2(ty, tx);
    B(rib, 0.016, 0.012, d - 0.03, x + px, y + py + 0.004, z, 0, 0, a); }
}
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i, j; if (!gs.length) continue;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ca = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) {
      var p = gs[i].attributes.position.array, c = b.cs[i]; pa.set(p, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2);
      for (j = 0; j < p.length; j += 3) { ca[o + j] = c[0]; ca[o + j + 1] = c[1]; ca[o + j + 2] = c[2]; } o += p.length;
    }
    if (b.ws) for (i = 0; i < P; i += 9) { /* boxUV：三角面主法线轴投影 × 1/ws */
      var ax = pa[i + 3] - pa[i], ay = pa[i + 4] - pa[i + 1], az = pa[i + 5] - pa[i + 2], bx = pa[i + 6] - pa[i], by = pa[i + 7] - pa[i + 1], bz = pa[i + 8] - pa[i + 2];
      var nx = Math.abs(ay * bz - az * by), ny = Math.abs(az * bx - ax * bz), nz = Math.abs(ax * by - ay * bx), s2 = 1 / b.ws;
      for (j = 0; j < 3; j++) { var q = i + j * 3, u = i / 9 * 6 + j * 2; if (ny >= nx && ny >= nz) { ua[u] = pa[q] * s2; ua[u + 1] = pa[q + 2] * s2; } else if (nx >= nz) { ua[u] = pa[q + 2] * s2; ua[u + 1] = pa[q + 1] * s2; } else { ua[u] = pa[q] * s2; ua[u + 1] = pa[q + 1] * s2; } }
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true });
    if (b.tx) m.map = tex(b.tx); if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tx) m.emissiveMap = m.map; }
    b.m = m; var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function EI(m, v) { if (m && m.b && m.b.m) m.b.m.emissiveIntensity = v; }
/* ---- 文字牌（独立 mesh：钟面 ×4 / STAR FERRY 招牌） ---- */
function PLATE(id, w, h, x, y, z, ry, ei) {
  var t = tex(id), m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.42, metalness: 0.08, emissive: C('#fff0cc'), emissiveMap: t, emissiveIntensity: ei || 0.06, side: THREE.DoubleSide });
  var ms = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); ms.position.set(x, y, z); ms.rotation.y = ry || 0;
  ms.castShadow = ms.receiveShadow = true; return ms;
}
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_34_lv' + level; g.userData = { kind: 'property', propIdx: 34, level: level }; BK = {};
  var A = {
    pave: MS('#cbc4b4', 0.93, 0, 'p', 0.38), trim: MS('#e9e5db', 0.88, 0, 's', 0.5),
    walk: MS('#c6bda9', 0.88, 0, 's', 0.5), wall: MS('#a19b8c', 0.88, 0, 's', 0.5),
    cult: MS('#cfc6b4', 0.88, 0, 's', 0.5), road: MS('#585a5e', 0.95, 0, '', 0),
    brick: MS('#b25f42', 0.82, 0, 'b', 0.2), slab: MS('#e2dac8', 0.85, 0, 'o', 0.24),
    office: MS('#d8d2c2', 0.85, 0, 'o', 0.24), glass: MS('#84b4d6', 0.1, 0.7, 'c', 0.2),
    glassD: MS('#5c7f9a', 0.1, 0.7, 'c', 0.2), glassL: MS('#9fc6de', 0.1, 0.7, 'c', 0.2),
    boc: MS('#6fae9e', 0.1, 0.7, 'c', 0.2),
    metal: MS('#9aa0a6', 0.35, 0.75, 's', 0.5), dark: MS('#3c4148', 0.5, 0.35, '', 0),
    ferry: MS('#2f6e50', 0.5, 0.1, '', 0), red: MS('#c23a30', 0.5, 0.15, '', 0),
    leaf: MS('#5d7c3e', 0.95, 0, 'l', 0.4), gold: MS('#c9a55a', 0.35, 0.8, '', 0),
    water: MS('#2f8a92', 0.1, 0.3, 'w', 0.85, '#175a66', 0.15),
    glow: MS('#6a5f4a', 0.3, 0, 'l', 0.3, '#ffcf8e', [0, 0, 0.22, 0.28][level - 1])
  };
  var GB = 0.1, i, k;
  /* ---- 1 地坪：城区基座 + 海滨长廊 + 海堤 + 维港水面 ---- */
  B(A.pave, 2.56, 0.1, 1.9, 0, 0.05, -0.33);
  B(A.walk, 2.56, 0.12, 0.34, 0, 0.06, 0.55);
  B(A.wall, 2.56, 0.14, 0.05, 0, 0.07, 0.745);
  B(A.water, 2.56, 0.06, 0.5, 0, 0.03, 1.02);
  /* ---- 2 钟楼（左前身份锚）：白基座 + 红砖方塔 + 白饰带 + 拱窗 + 白钟层 + 四面钟 + 白穹顶 + 金顶针；lv1 制高点 1.11 ---- */
  var cx = -0.52, cz = 0.18, wh = A.trim, br = A.brick, dk = A.dark;
  B(A.trim, 0.34, 0.05, 0.34, cx, GB + 0.025, cz); B(A.trim, 0.3, 0.03, 0.3, cx, GB + 0.065, cz);
  B(br, 0.24, 0.63, 0.24, cx, GB + 0.365, cz);
  B(wh, 0.27, 0.02, 0.27, cx, GB + 0.15, cz); B(wh, 0.27, 0.02, 0.27, cx, GB + 0.63, cz);
  for (i = -1; i <= 1; i += 2) { B(dk, 0.048, 0.11, 0.014, cx + i * 0.06, GB + 0.4, cz + 0.121); B(dk, 0.048, 0.048, 0.014, cx + i * 0.06, GB + 0.462, cz + 0.121, 0, 0, PI / 4); }
  B(wh, 0.28, 0.14, 0.28, cx, GB + 0.75, cz);
  for (i = 0; i < 4; i++) g.add(PLATE('k', 0.12, 0.12, cx + Math.sin(i * PI / 2) * 0.142, GB + 0.75, cz + Math.cos(i * PI / 2) * 0.142, i * PI / 2, 0.06));
  B(wh, 0.31, 0.02, 0.31, cx, GB + 0.83, cz);
  SPH(wh, 0.115, cx, GB + 0.84, cz);
  Y(A.gold, 0.005, 0.009, 0.05, 12, cx, GB + 0.98, cz); O(A.gold, 0.013, cx, GB + 1.015, cz);
  /* ---- 3 文化中心（中前）：米色体量 + 弧形翘屋顶 + 竖向遮阳片 + 玻璃大堂（lv2+） + 右翼 + 后侧红的士/树 ---- */
  B(A.cult, 1.06, 0.22, 0.56, 0.38, GB + 0.11, -0.12);
  SWOOP(A.cult, 1.12, 0.4, 0.58, 0.38, GB + 0.22, -0.12, MS('#b9af9c', 0.88, 0, 's', 0.5));
  for (i = 0; i < 7; i++) B(A.trim, 0.02, 0.19, 0.018, -0.07 + i * 0.16, GB + 0.28, 0.16);
  B(A.dark, 0.9, 0.014, 0.014, 0.42, GB + 0.19, 0.166);
  if (level >= 2) B(A.glass, 0.8, 0.07, 0.014, 0.3, GB + 0.145, 0.163);
  B(A.cult, 0.3, 0.14, 0.4, 0.98, GB + 0.07, -0.12);
  if (level >= 3) for (i = 0; i < 3; i++) { Y(A.metal, 0.004, 0.004, 0.3, 12, 0.0 + i * 0.15, GB + 0.15, 0.3); B(A.red, 0.04, 0.025, 0.004, 0.02 + i * 0.15, GB + 0.285, 0.3); }
  B(A.road, 1.3, 0.006, 0.1, 0.6, GB + 0.003, -0.455); for (i = 0; i < 6; i++) B(A.trim, 0.06, 0.002, 0.006, 0.02 + i * 0.22, GB + 0.007, -0.455);
  for (i = 0; i < 4; i++) { var qx = 0.18 + i * 0.22; B(i % 2 ? A.red : A.trim, 0.08, 0.03, 0.04, qx, GB + 0.022, -0.45); B(A.dark, 0.05, 0.02, 0.036, qx - 0.005, GB + 0.047, -0.45); }
  /* ---- 4 半岛式酒店板楼（其后）：密窗格桶 + 楼层带 + 女儿墙 + 门廊雨篷（lv2+） + 屋顶设备 + 加建中央塔楼（lv2+，结构性演进） ---- */
  var hh = [0.6, 0.66, 0.7, 0.76][level - 1], th = [0, 0.42, 0.5, 0.56][level - 1];
  B(A.slab, 0.95, hh, 0.26, 0.62, GB + hh / 2, -0.62);
  B(A.trim, 0.97, 0.02, 0.3, 0.62, GB + hh + 0.01, -0.62);
  for (i = 1; i <= 3; i++) B(A.trim, 0.96, 0.008, 0.008, 0.62, GB + hh * i / 4, -0.487);
  B(A.dark, 0.24, 0.13, 0.012, 0.62, GB + 0.155, -0.486);
  if (level >= 2) B(A.dark, 0.3, 0.018, 0.1, 0.62, GB + 0.235, -0.45);
  B(A.metal, 0.1, 0.05, 0.09, 0.4, GB + hh + 0.045, -0.66); B(A.dark, 0.08, 0.04, 0.08, 0.28, GB + hh + 0.04, -0.58);
  if (level >= 2) { B(A.slab, 0.3, th, 0.22, 0.62, GB + hh + 0.02 + th / 2, -0.62); B(A.trim, 0.32, 0.018, 0.24, 0.62, GB + hh + 0.029 + th, -0.62); Y(A.metal, 0.004, 0.004, 0.08, 12, 0.62, GB + hh + 0.078 + th, -0.62); }
  if (level >= 2) { Y(A.metal, 0.035, 0.035, 0.08, 12, 0.94, GB + hh + 0.06, -0.66); Y(A.dark, 0.04, 0.04, 0.012, 12, 0.94, GB + hh + 0.106, -0.66); }
  /* ---- 5 天星码头：两座栈桥（桩柱 + 板桥 + 双层白亭 + 绿檐口 + 招牌 lv2+） ---- */
  function PIER(px, pz, pw, pd, big) {
    var j;
    for (j = 0; j < 4; j++) Y(A.metal, 0.014, 0.014, 0.12, 12, px + (j % 2 ? 1 : -1) * (pw / 2 - 0.05), 0.06, pz + (j < 2 ? 1 : -1) * (pd / 2 - 0.05));
    B(A.walk, pw, 0.04, pd, px, 0.125, pz);
    B(A.metal, 0.02, 0.22, 0.02, px - pw / 2 + 0.05, 0.25, pz - pd / 2 + 0.05); B(A.metal, 0.02, 0.22, 0.02, px + pw / 2 - 0.05, 0.25, pz - pd / 2 + 0.05);
    B(A.metal, 0.02, 0.22, 0.02, px - pw / 2 + 0.05, 0.25, pz + pd / 2 - 0.05); B(A.metal, 0.02, 0.22, 0.02, px + pw / 2 - 0.05, 0.25, pz + pd / 2 - 0.05);
    B(A.trim, pw + 0.04, 0.024, pd + 0.04, px, 0.375, pz);
    B(A.ferry, pw + 0.04, 0.026, 0.016, px, 0.36, pz + pd / 2 + 0.022);
    if (big) { B(A.trim, pw * 0.62, 0.02, pd * 0.62, px, 0.445, pz); B(A.ferry, pw * 0.62, 0.022, 0.014, px, 0.434, pz + pd * 0.31 + 0.008); }
    for (j = -1; j <= 1; j += 2) { B(A.dark, 0.03, 0.03, 0.03, px + j * (pw / 2 - 0.03), 0.155, pz + pd / 2 - 0.04);
      B(A.metal, 0.008, 0.05, pd - 0.14, px + j * (pw / 2 - 0.012), 0.165, pz); B(A.metal, 0.01, 0.006, pd - 0.14, px + j * (pw / 2 - 0.012), 0.192, pz); }
  }
  PIER(-0.52, 0.94, 0.56, 0.42, true); PIER(-1.03, 0.92, 0.44, 0.36, false);
  if (level >= 2) { g.add(PLATE('f', 0.34, 0.062, -0.52, 0.362, 1.184, 0, 0.12)); g.add(PLATE('f', 0.26, 0.05, -1.03, 0.33, 1.134, 0, 0.1)); }
  B(MS('#dff0f0', 0.88, 0, 's', 0.5), 2.56, 0.004, 0.02, 0, 0.061, 0.78);
  /* ---- 6 天星渡轮（绿身白篷 双层 + 烟囱 + 桅杆；wk=航行尾迹，靠泊船无） ---- */
  function FERRY(fx, fz, ry, wk) {
    var co = Math.cos(ry), si = Math.sin(ry);
    function FB(w, h, d, ox, oy, m) { B(m || A.trim, w, h, d, fx + ox * co, oy, fz - ox * si, 0, ry, 0); }
    FB(0.42, 0.05, 0.14, 0, 0.06, A.ferry); FB(0.42, 0.02, 0.145, 0, 0.095);
    FB(0.32, 0.055, 0.105, 0.02, 0.132); FB(0.26, 0.014, 0.11, 0.02, 0.166, A.dark);
    FB(0.22, 0.042, 0.09, 0.03, 0.194); FB(0.2, 0.012, 0.095, 0.03, 0.221, A.dark);
    Y(A.ferry, 0.018, 0.022, 0.055, 12, fx - 0.1 * co, 0.26, fz + 0.1 * si, 0, ry, 0.12);
    B(A.ferry, 0.012, 0.1, 0.012, fx + 0.15 * co, 0.26, fz - 0.15 * si, 0, ry, 0);
    if (wk) { FB(0.16, 0.003, 0.05, -0.29, 0.062, MS('#dff0f0', 0.88, 0, 's', 0.5)); FB(0.1, 0.003, 0.09, -0.4, 0.062, MS('#dff0f0', 0.88, 0, 's', 0.5)); }
  }
  FERRY(-0.02, 1.06, 0.06, 0); FERRY(-1.0, 1.18, -0.08, 0); if (level >= 3) FERRY(0.62, 1.08, 0.25, 1);
  /* ---- 7 天际线（后排，随年代玻璃化升高；lv4 旧低楼汰换为玻璃塔） ---- */
  function OFFICE(ox, oz, w2, d2, h2, cap) { /* 混凝土点窗办公楼：壁柱 + 女儿墙 + 屋顶 AC + 水箱（lv2+）+ 门 */
    B(A.office, w2, h2, d2, ox, GB + h2 / 2, oz);
    B(A.trim, w2 + 0.02, 0.018, d2 + 0.02, ox, GB + h2 + 0.009, oz);
    for (var p2 = -1; p2 <= 1; p2 += 2) B(A.trim, 0.014, h2 * 0.85, 0.01, ox + p2 * w2 * 0.28, GB + h2 * 0.47, oz + d2 / 2 + 0.006);
    B(A.dark, 0.1, 0.12, 0.012, ox, GB + 0.16, oz + d2 / 2 + 0.004);
    B(A.metal, 0.09, 0.05, 0.08, ox - w2 * 0.2, GB + h2 + 0.043, oz);
    if (level >= 2) { Y(A.metal, 0.03, 0.03, 0.07, 12, ox + w2 * 0.22, GB + h2 + 0.053, oz - d2 * 0.15); Y(A.dark, 0.034, 0.034, 0.01, 12, ox + w2 * 0.22, GB + h2 + 0.093, oz - d2 * 0.15); }
    if (cap) Y(A.metal, 0.005, 0.005, 0.09, 12, ox, GB + h2 + 0.063, oz);
  }
  function GLASS(gx, gz, w2, d2, base, h2, crown, spire, hot, tint) { /* 幕墙塔：裙房 + 塔身 + 白冠层 + 尖顶 + 暖光窗带（lv3+） */
    var m = tint || A.glass;
    if (base) { B(m, w2 + 0.06, base, d2 + 0.06, gx, GB + base / 2, gz); B(A.trim, w2 + 0.08, 0.012, d2 + 0.08, gx, GB + base + 0.006, gz); }
    var y0 = GB + (base || 0);
    B(m, w2, h2, d2, gx, y0 + h2 / 2, gz);
    B(A.trim, w2 * 0.82, 0.05, d2 * 0.82, gx, y0 + h2 + 0.025, gz);
    var yt = y0 + h2 + 0.05;
    if (crown) { B(A.trim, w2 * 0.6, 0.04, d2 * 0.6, gx, yt + 0.02, gz); yt += 0.04; }
    if (spire) { Y(A.metal, 0.006, 0.011, spire, 12, gx, yt + spire / 2, gz); yt += spire; }
    if (hot && level >= 3) for (var s2 = 0; s2 < 2; s2++) B(A.glow, w2 * 0.55, 0.011, 0.008, gx, y0 + h2 * (0.38 + s2 * 0.3), gz + d2 / 2 + 0.005);
    return yt;
  }
  OFFICE(-1.06, -1.02, 0.4, 0.4, [0.78, 0.84, 0.88, 0.92][level - 1], true);
  OFFICE(-0.32, -1.12, 0.34, 0.3, [0.88, 0.92, 0.96, 1.0][level - 1], false);
  OFFICE(1.08, -1.05, 0.36, 0.26, [0.56, 0.64, 0.74, 1.0][level - 1], true);
  if (level < 4) OFFICE(-1.14, -0.52, 0.24, 0.3, 0.42, false); else GLASS(-1.14, -0.52, 0.24, 0.24, 0, 1.05, true, 0.06, false, A.glassL);
  if (level >= 2) GLASS(-0.52, -0.72, 0.26, 0.24, 0.06, [0.68, 0.84, 0.94][level - 2], true, 0.05, level >= 3, A.glassD);
  if (level >= 2) GLASS(0.14, -1.04, 0.38, 0.38, 0.1, [1.15, 1.2, 1.25][level - 2], true, 0.08, level >= 3);
  if (level >= 3) GLASS(-0.68, -1.12, 0.26, 0.26, 0.06, [0.95, 1.35][level - 3], true, 0.05, true, MS('#6f9cc0', 0.1, 0.7, 'c', 0.2));
  if (level >= 4) { GLASS(-0.02, -0.55, 0.24, 0.24, 0, 1.3, true, 0.06, true, A.glassL); GLASS(1.16, -0.85, 0.2, 0.14, 0, 1.3, true, 0.05, true, A.glassD); }
  if (level >= 3) { /* 中银大厦：绿玻璃 + 四向 X 斜撑 + 收分冠 + 桅杆 */
    var bx = -0.82, bz = -0.62, bw = 0.32, bh = 1.25, hs = bh / 3, ang = Math.atan2(hs, bw), ln = Math.sqrt(bw * bw + hs * hs) + 0.03;
    B(A.boc, bw, bh, bw, bx, GB + bh / 2, bz);
    for (k = 0; k < 3; k++) { var yb = GB + k * hs, ym = yb + hs / 2;
      for (i = -1; i <= 1; i += 2) {
        B(A.trim, ln, 0.018, 0.016, bx, ym, bz + i * (bw / 2 + 0.006), 0, 0, i * ang); B(A.trim, ln, 0.018, 0.016, bx, ym, bz + i * (bw / 2 + 0.006), 0, 0, -i * ang);
        B(A.trim, 0.016, 0.018, ln, bx + i * (bw / 2 + 0.006), ym, bz, i * ang, 0, 0); B(A.trim, 0.016, 0.018, ln, bx + i * (bw / 2 + 0.006), ym, bz, -i * ang, 0, 0);
      } }
    B(A.trim, 0.24, 0.1, 0.24, bx, GB + bh + 0.05, bz); B(A.trim, 0.14, 0.08, 0.14, bx, GB + bh + 0.14, bz);
    Y(A.metal, 0.004, 0.008, 0.28, 12, bx, GB + bh + 0.32, bz);
    B(A.glow, 0.2, 0.011, 0.008, bx, GB + bh * 0.55, bz + bw / 2 + 0.006);
  }
  if (level >= 3) { var ih = [1.7, 2.15][level - 3]; GLASS(0.62, -1.02, 0.4, 0.4, 0.1, ih, true, [0.1, 0.14][level - 3], true);
    for (i = 0; i < 4; i++) B(A.trim, 0.03, 0.14, 0.03, 0.62 + (i % 2 ? 0.15 : -0.15), GB + 0.1 + ih + 0.07, -1.02 + (i < 2 ? 0.15 : -0.15)); }
  /* ---- 8 海滨摩天轮（lv4 右前）：平台 + A 支架 + 红白轮圈 + 辐条 + 吊舱 ---- */
  if (level >= 4) {
    var wx = 1.02, wz = 0.42, r = 0.24, hubY = 0.46, j2, a2;
    B(A.walk, 0.5, 0.04, 0.4, wx, 0.14, wz);
    for (i = -1; i <= 1; i += 2) { var ly = hubY - 0.16, lz = -0.13, ln2 = Math.sqrt(ly * ly + lz * lz);
      B(A.metal, 0.02, ln2, 0.02, wx + i * 0.06, 0.16 + ly / 2, wz + 0.065, Math.atan2(lz, ly), 0, 0); }
    B(A.metal, 0.13, 0.016, 0.016, wx, 0.28, wz + 0.1);
    A2(A.red, new THREE.TorusGeometry(r, 0.011, 6, 24), wx, hubY, wz, PI / 2);
    for (j2 = 0; j2 < 8; j2++) { a2 = j2 / 8 * 2 * PI; var dy2 = Math.sin(a2), dz2 = Math.cos(a2);
      B(A.trim, 0.008, r, 0.008, wx, hubY + dy2 * r / 2, wz + dz2 * r / 2, PI / 2 - a2, 0, 0);
      B(j2 % 2 ? A.red : A.trim, 0.034, 0.042, 0.028, wx, hubY + dy2 * r, wz + dz2 * r); }
    Y(A.metal, 0.016, 0.016, 0.03, 12, wx, hubY, wz, PI / 2, 0, 0);
  }
  /* ---- 9 长廊街具：栏杆 + 灯柱（lv3+）+ 长椅（lv3+）+ 绿篱（lv2+）+ 系船桩（lv2+）+ 花坛（lv4） ---- */
  for (i = 0; i <= 6; i++) B(A.metal, 0.012, 0.07, 0.012, -0.15 + i * 0.145, 0.155, 0.71);
  B(A.metal, 0.88, 0.012, 0.012, 0.285, 0.185, 0.71); B(A.metal, 0.88, 0.012, 0.012, 0.285, 0.16, 0.71);
  if (level >= 2) { for (i = 0; i < 3; i++) { B(A.dark, 0.03, 0.055, 0.03, 0.05 + i * 0.32, 0.168, 0.745); B(A.dark, 0.045, 0.014, 0.045, 0.05 + i * 0.32, 0.2, 0.745); } }
  if (level >= 3) {
    function LAMP(lx, lz) { Y(A.metal, 0.016, 0.02, 0.014, 12, lx, 0.127, lz); Y(A.metal, 0.01, 0.013, 0.42, 12, lx, 0.34, lz); B(A.metal, 0.1, 0.012, 0.012, lx + 0.05, 0.55, lz); B(A.glow, 0.05, 0.018, 0.04, lx + 0.095, 0.545, lz); }
    LAMP(0.05, 0.6); LAMP(0.62, 0.6); LAMP(-0.98, 0.64);
    B(A.metal, 0.16, 0.02, 0.05, 0.32, 0.145, 0.64); B(A.metal, 0.016, 0.045, 0.04, 0.32, 0.12, 0.64);
  }
  if (level >= 2) { B(A.trim, 0.12, 0.09, 0.1, -0.45, 0.165, 0.55); B(A.ferry, 0.14, 0.012, 0.12, -0.45, 0.216, 0.55); B(A.dark, 0.08, 0.04, 0.008, -0.45, 0.17, 0.605); }
  if (level >= 2) { B(A.leaf, 0.5, 0.06, 0.05, 0.4, 0.15, 0.44); B(A.leaf, 0.4, 0.06, 0.05, -0.95, 0.15, 0.44); }
  if (level >= 4) { for (i = 0; i < 2; i++) { var px2 = -0.75 + i * 0.46; B(A.trim, 0.2, 0.08, 0.08, px2, 0.14, 0.44); O(A.leaf, 0.035, px2 - 0.05, 0.19, 0.44); O(A.red, 0.028, px2 + 0.05, 0.19, 0.44); } }
  /* ---- 10 树列：海滨长廊（三层团簇冠，随年代加茂）+ 文化中心后广场角树 ---- */
  var TN = [[3, 0.95], [3, 1.05], [4, 1.12], [5, 1.2]][level - 1], TP = [[-1.14, 0.5], [-0.2, 0.5], [0.52, 0.5], [0.28, 0.52], [-0.72, 0.52]];
  function TREE(tx, tz, s3) {
    B(A.trim, 0.026 * s3, 0.3 * s3, 0.026 * s3, tx, 0.12 + 0.15 * s3, tz);
    O(A.leaf, 0.105 * s3, tx, 0.12 + 0.36 * s3, tz);
    O(MS('#6f8d48', 0.95, 0, 'l', 0.4), 0.078 * s3, tx + 0.055 * s3, 0.12 + 0.3 * s3, tz + 0.03 * s3);
    O(MS('#4f6c33', 0.95, 0, 'l', 0.4), 0.07 * s3, tx - 0.05 * s3, 0.12 + 0.43 * s3, tz - 0.02 * s3);
  }
  for (i = 0; i < TN[0]; i++) TREE(TP[i][0], TP[i][1], TN[1]);
  TREE(-0.3, -0.45, 0.75); TREE(1.17, -0.4, 0.7);
  flush(g);
  /* ---- 动画 2 项：暖光窗呼吸 / 水面 emissive 脉动 + 涟漪贴图漂移（每实例独立贴图） ---- */
  var wt = tex('w').clone(); wt.needsUpdate = true;
  if (A.water.b.m) A.water.b.m.map = wt;
  var glowBase = [0, 0, 0.22, 0.28][level - 1];
  g.userData.anim = [
    function (t) { EI(A.glow, glowBase + 0.1 * (0.5 + 0.5 * Math.sin(t * 1.3))); },
    function (t) { EI(A.water, 0.13 + 0.08 * (0.5 + 0.5 * Math.sin(t * 0.8 + 0.6))); wt.offset.x = (t * 0.018) % 1; wt.offset.y = (t * 0.011) % 1; }
  ];
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[34] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
