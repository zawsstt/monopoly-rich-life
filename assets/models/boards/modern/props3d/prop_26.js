/* 大富翁·现代写实棋盘（西安）格 26「回民街」—— 石牌楼 + 回坊小吃窄巷 + 两侧两层铺面 + 后排天台院落，四年代演进
 * 视觉基准 refs/modern/prop_26.png 四象限（左上1990s/右上2000s/左下2010s/右下2020s 同一块地 40 年演进）：
 * 前场石牌楼（柱础双柱/边柱挎檐/阔额花板/斗拱/歇山翘檐瓦顶/正脊鸱吻/匾额）+ 窄巷两侧小吃摊阵（彩篷脊檐垂帘/柜台食案/
 * 暖光灯箱/灯笼）+ 两侧各两栋两层铺面（砖墙木窗/楼层板带/挑廊栏杆/竖幌）+ 后排三栋天台院落（烟囱/水箱/空调/阳光房）+ 行道树。
 * 契约：window.Props3DModern[26](level 1..4) → 每次全新 Group；占地 ≤2.6×2.6（窄长街区 1.8×2.56）；底面 y=0；正面 +Z；
 * mesh ≤55/级（桶=材质参数，同桶顶点色合并）；三角 lv1≤9k/lv2≤13k/lv3≤18k/lv4≤24k；Canvas ≤256px；零 Math.random（LCG）；
 * 动画 ≤2 项（暖光窗/摊灯箱呼吸 / 灯笼+匾额 emissive 呼吸）；高度带 lv1/2[1.2,1.5] lv3[1.2,1.55] lv4[1.25,1.6]。
 * 材质：近白 overlay Canvas（石/砖/瓦/木/抹灰/叶/玻璃格/百叶/布/条纹布/灯笼纸）×顶点色分区；彩画/食案/匾额自带色；
 *   rough 石.92/砖.88/瓦.68/木.75/玻璃.12-.14/金.35/钢.45/织物.92；发光件独立桶+emissiveMap。
 * 年代演进（结构性）：lv1 1990s 素面石牌楼灰瓦木匾+灰白布篷稀摊无灯+板墙木窗+石敢当+门前箩筐；
 *   lv2 2000s 绿瓦彩枋斗拱+匾额+红蓝白彩篷+摊内暖光+右后天台（空调/木箱）+背树；lv3 2010s 檐下双灯笼+摊灯笼+
 *   二层木栏挑廊+街灯+盆树+竖幌+水箱天窗+花坛；lv4 2020s 金脊宝顶+匾额发光+门洞灯笼串+巷内灯串+玻璃亮棚摊+
 *   后天台阳光房天线+满窗暖光+行道树最茂。
 * 本轮变更：R1（结构）——原 HIP 四片破板屋面 → EAVE 曲线翘檐体系（牌楼大歇山/两侧坡顶带正脊博风/摊篷脊檐）；
 *   侧栋由裸盒 → 两层立面（窗框/窗台/横档/楼层板带/门框门扇）；新增后排三栋天台院落、摊位重构（背板/垂帘/食盘/灯箱）、
 *   牌楼柱础/边柱/挎檐/花板/斗拱/翼墙/门槛石、三层树冠+石花坛、路缘石+巷道分色铺装+排水篦。
 *   R2（细节清偿）——修 ax=true ROOF 的 w(横跨)/d(脊长) 互换（左后/中栋屋面越界，占地 2.66→2.56）；修 paint 桶 ws 语义
 *   （uv=世界/ws：0.55 使门头板采到 q 金边行整条发金 → 2.1 落青绿素场）；q 纹理重排（金箍/花心移出板面采样行，
 *   中段云纹淡笔）；瓦面加深青灰、砖墙调灰；lv1 阔额改灰木（1990s 素面）；正脊吻饰加大至 0.07×0.06；
 *   两侧后栋补 lv3+ 二层木栏挑廊（平台+立柱+扶手）；树坛 z 1.14→1.06 控脚；回归 smoke_modern_xa/sq_theme_modern PASS。
 * ============================================================================================= */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_26] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TX = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function F(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function RA(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')'; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? RA(255, 255, 255, a) : RA(24, 22, 18, a), R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
/* ---- 近白 overlay 纹理（顶点色承载主色）+ 自着色彩画/食案/匾额 ---- */
var TXF = {
  s: function (g, w, h, R) { F(g, '#f0ece5', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 32) { var o = (y / 32) % 2 ? 16 : 0; F(g, RA(80, 74, 64, 0.45), 0, y, w, 2); for (x = o - 32; x < w; x += 32) { F(g, RA(80, 74, 64, 0.4), x, y, 2, 32); F(g, R() > 0.5 ? RA(255, 255, 250, 0.12) : RA(70, 64, 52, 0.1), x + 3, y + 3, 27, 26); F(g, RA(255, 255, 255, 0.22), x + 6, y + 4, 16 + R() * 12, 2); } } SPK(g, w, h, 70, 0.06, R); },
  b: function (g, w, h, R) { F(g, '#efebe4', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 14) { var o = (y / 14) % 2 ? 0 : 16; F(g, RA(58, 54, 48, 0.34), 0, y, w, 2); for (x = o - 32; x < w; x += 32) { F(g, RA(58, 54, 48, 0.3), x, y, 2, 14); F(g, R() > 0.5 ? RA(80, 76, 70, 0.08) : RA(255, 255, 255, 0.08), x + 2, y + 2, 28, 10); F(g, RA(255, 255, 255, 0.25), x + 2, y + 2, 28, 1); } } SPK(g, w, h, 80, 0.06, R); },
  t: function (g, w, h, R) { F(g, '#eceeed', 0, 0, w, h); var x, y, i; for (x = 0; x < w; x += 14) { F(g, RA(30, 36, 44, 0.32), x + 10, 0, 3, h); F(g, RA(255, 255, 255, 0.3), x + 1, 0, 2, h); } for (y = 9; y < h; y += 20) { F(g, RA(20, 26, 34, 0.4), 0, y, w, 3); for (i = 0; i < 4; i++) F(g, RA(60, 66, 70, 0.06 + R() * 0.1), R() * w, y + 3, 10, 14); } SPK(g, w, h, 50, 0.06, R); },
  w: function (g, w, h, R) { F(g, '#f5ebdf', 0, 0, w, h); var x, i; for (x = 0; x < w; x += 5) F(g, RA(70, 40, 20, 0.13 + R() * 0.13), x + R() * 2, 0, 1, h); for (i = 0; i < 3; i++) { g.fillStyle = RA(70, 40, 20, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 3, 0, 6.283); g.fill(); } for (x = 5; x < w; x += 26) F(g, RA(255, 255, 255, 0.3), x, 0, 2, h); SPK(g, w, h, 30, 0.05, R); },
  p: function (g, w, h, R) { F(g, '#f8f4ec', 0, 0, w, h); var i; for (i = 0; i < 9; i++) F(g, RA(120, 110, 88, 0.05 + R() * 0.07), R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80); for (i = 0; i < 3; i++) { var x0 = R() * w; g.strokeStyle = RA(110, 100, 80, 0.16); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 12, h); g.stroke(); } F(g, RA(90, 84, 66, 0.09), 0, 108, w, 20); SPK(g, w, h, 80, 0.05, R); },
  l: function (g, w, h, R) { F(g, '#f1f5ea', 0, 0, w, h); var i; for (i = 0; i < 34; i++) { g.fillStyle = i % 2 ? RA(34, 66, 24, 0.28) : RA(255, 255, 240, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } },
  n: function (g, w, h, R) { F(g, '#ffffff', 0, 0, w, h); var x; for (x = 0; x < w; x += 12) { F(g, RA(140, 30, 16, 0.35), x + 4, 0, 3, h); F(g, RA(255, 230, 210, 0.4), x + 8, 0, 2, h); } F(g, RA(130, 60, 10, 0.35), 0, 0, w, 5); F(g, RA(130, 60, 10, 0.35), 0, h - 5, w, 5); SPK(g, w, h, 16, 0.04, R); },
  y: function (g, w, h, R) { F(g, '#eef4f6', 0, 0, w, h); var i, x, y; for (i = 0; i < 10; i++) F(g, RA(255, 255, 255, 0.12 + R() * 0.18), R() * w, 0, 2 + R() * 4, h); for (x = 0; x <= w; x += 32) F(g, RA(70, 92, 102, 0.4), x - 1, 0, 2, h); for (y = 0; y <= h; y += 32) F(g, RA(70, 92, 102, 0.35), 0, y - 1, w, 2); SPK(g, w, h, 30, 0.05, R); },
  v: function (g, w, h) { F(g, '#cfd4d8', 0, 0, w, h); var y; for (y = 2; y < h; y += 6) { F(g, '#3a4147', 0, y, w, 3); F(g, RA(230, 236, 240, 0.5), 0, y + 3, w, 1); } },
  f: function (g, w, h, R) { F(g, '#f4f1e8', 0, 0, w, h); var i; for (i = 0; i < w; i += 3) { F(g, RA(90, 84, 72, 0.08), i, 0, 1, h); F(g, RA(255, 255, 250, 0.1), 0, i, w, 1); } for (i = 0; i < 4; i++) F(g, RA(70, 64, 54, 0.06), R() * w, R() * h, 8 + R() * 10, 4 + R() * 6); },
  fs: function (g, w, h, R) { F(g, '#ffffff', 0, 0, w, h); var i; for (i = 0; i < w; i += 16) { F(g, RA(105, 96, 86, 0.52), i, 0, 8, h); F(g, RA(255, 255, 255, 0.2), i + 1, 0, 1, h); } for (i = 0; i < h; i += 3) F(g, RA(90, 84, 72, 0.06), 0, i, w, 1); },
  q: function (g, w, h, R) { F(g, '#2e6068', 0, 0, w, h); F(g, '#c9a13e', 0, 0, w, 4); F(g, '#c9a13e', 0, h - 4, w, 4); var i, x; for (i = 0; i < 8; i++) { x = i * 32 + 2; F(g, i % 2 ? '#356e78' : '#295a62', x, 6, 28, h - 12); F(g, '#c9a13e', x, 6, 28, 2); F(g, '#c9a13e', x, h - 8, 28, 2); F(g, '#c9a13e', x, 12, 2, h - 24); F(g, '#c9a13e', x + 26, 12, 2, h - 24); g.fillStyle = i % 2 ? '#e8e2d0' : '#c9a13e'; g.beginPath(); g.arc(x + 14, 14, 4, 0, PI * 2); g.fill(); g.beginPath(); g.arc(x + 14, h - 14, 4, 0, PI * 2); g.fill(); F(g, '#b23a2e', x + 11, h / 2 - 2, 6, 4); } g.strokeStyle = 'rgba(232,226,208,0.35)'; g.lineWidth = 1.5; for (i = 0; i < 8; i++) { g.beginPath(); g.arc(i * 32 + 16, 32, 8, 3.4, 6.0); g.stroke(); } },
  d: function (g, w, h, R) { F(g, '#ded8c8', 0, 0, w, h); var i, x, y, FC = ['#8a5a2e', '#d8a832', '#b03a28', '#6a8a3a', '#c47f30']; for (i = 0; i < 6; i++) { x = 12 + (i % 3) * 40 + R() * 8; y = 16 + Math.floor(i / 3) * 28 + R() * 6; g.fillStyle = 'rgba(255,255,252,0.9)'; g.beginPath(); g.arc(x, y, 10, 0, PI * 2); g.fill(); g.fillStyle = FC[i % 5]; g.beginPath(); g.arc(x, y, 6, 0, PI * 2); g.fill(); g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(x - 2, y - 2, 2, 0, PI * 2); g.fill(); } }
};
var TDIM = { s: [128, 128], b: [128, 128], t: [128, 128], w: [128, 128], p: [128, 128], l: [128, 128], y: [128, 128], n: [64, 64], f: [64, 64], fs: [64, 64], v: [64, 64], q: [256, 64], d: [128, 64] };
function tex(id) { if (_TX[id]) return _TX[id]; var d = TDIM[id], c = cv(d[0], d[1]); TXF[id](c.getContext('2d'), c.width, c.height, lcg(1700 + id.charCodeAt(0) * 7)); return (_TX[id] = TX(c)); }
function signTex(txt, bg, fg) { /* 匾额 256×64：双线边框 + 题字 + 金粉噪点 */
  var c = cv(256, 64), g = c.getContext('2d'), R = lcg(966), i;
  F(g, bg, 0, 0, 256, 64); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54); g.lineWidth = 1.5; g.strokeRect(11, 11, 234, 42);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34);
  for (i = 0; i < 24; i++) { g.fillStyle = 'rgba(255,240,200,' + (0.06 + R() * 0.1).toFixed(2) + ')'; g.fillRect(R() * 256, R() * 64, 2, 1); }
  return TX(c);
}
function vSign(txt, bg, fg) { /* 竖幌 64×128：边框 + 双字 */
  var c = cv(64, 128), g = c.getContext('2d');
  F(g, bg, 0, 0, 64, 128); g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(4, 4, 56, 120);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 34px "Microsoft YaHei",sans-serif';
  g.fillText(txt.charAt(0), 32, 40); g.fillText(txt.charAt(1), 32, 92);
  return TX(c);
}
/* ---- 桶系统：桶 = 材质参数；MS() 返回 {b:桶,c:线性顶点色}；flush 同桶合并 + 顶点色 + 世界尺寸 boxUV ---- */
var BK;
function MS(h, rg, mt, tx, ws, em, ei, op) { var k = rg + '|' + (mt || 0) + '|' + (tx || '') + '|' + (ws || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (op || 0); var b = BK[k] || (BK[k] = { rg: rg, mt: mt || 0, tx: tx || '', ws: ws || 0, em: em || '', ei: ei || 0, op: op || 0, gs: [], cs: [] }); return { b: b, c: V(h) }; }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(m, g) { m.b.gs.push(g); m.b.cs.push(m.c); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function A2(m, geo, x, y, z, ry) { put(m, xf(geo, x, y, z, 0, ry || 0, 0)); }
function EAVE(m, w, h, t, tip, d, x, y, z, rot) { /* 曲线翘檐坡屋顶：quadratic 起翘断面沿脊挤出（rot=PI/2 脊沿 x / 0 脊沿 z） */
  var hw = w / 2, s = new THREE.Shape();
  s.moveTo(0, h); s.lineTo(hw * 0.62, 0); s.quadraticCurveTo(hw * 0.86, 0, hw, tip);
  s.lineTo(hw, tip + t); s.quadraticCurveTo(hw * 0.86, t, hw * 0.62, t); s.lineTo(0, h + t);
  s.lineTo(-hw * 0.62, t); s.quadraticCurveTo(-hw * 0.86, t, -hw, tip + t); s.lineTo(-hw, tip);
  s.quadraticCurveTo(-hw * 0.86, 0, -hw * 0.62, 0); s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 5 }); geo.translate(0, 0, -d / 2);
  A2(m, geo, x, y, z, rot === undefined ? PI / 2 : rot);
}
function GABLE(m, w, h, x, y, z, ry) { /* 山花三角板 */
  var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: 0.024, bevelEnabled: false }); geo.translate(0, 0, -0.012);
  A2(m, geo, x, y, z, ry);
}
function RIDGE(m, len, x, y, z, ax) { /* 正脊 + 两端翘角 */
  B(m, ax ? len : 0.05, 0.026, ax ? 0.05 : len, x, y, z);
  var e = len / 2 - 0.02, k;
  for (k = -1; k <= 1; k += 2) B(m, 0.05, 0.042, 0.045, x + (ax ? k * e : 0), y + 0.026, z + (ax ? 0 : k * e), ax ? 0 : -k * 0.5, 0, ax ? k * 0.5 : 0);
}
function ROOF(m, tm, w, d, h, tip, x, y, z, ax, barge) { /* 坡顶 + 正脊 +（山墙）博风板 */
  EAVE(m, w, h, 0.026, tip, d, x, y, z, ax ? PI / 2 : 0);
  RIDGE(tm, d + 0.06, x, y + h + 0.02, z, ax);
  if (!barge) return;
  var run = w / 2, ang = Math.atan2(h - tip, run), sl = Math.sqrt(run * run + (h - tip) * (h - tip)) + 0.04, i, j;
  for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) {
    if (ax) B(tm, 0.026, 0.024, sl, x + i * (d / 2 + 0.014), y + (h + tip) / 2 + 0.012, z + j * run / 2, j * ang, 0, 0);
    else B(tm, sl, 0.024, 0.026, x + i * run / 2, y + (h + tip) / 2 + 0.012, z + j * (d / 2 + 0.014), 0, 0, -i * ang);
  }
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
    if (b.ws) for (i = 0; i < P; i += 9) { /* boxUV：三角面主法线轴投影 × 1/ws（世界尺寸烘焙） */
      var ax = pa[i + 3] - pa[i], ay = pa[i + 4] - pa[i + 1], az = pa[i + 5] - pa[i + 2], bx = pa[i + 6] - pa[i], by = pa[i + 7] - pa[i + 1], bz = pa[i + 8] - pa[i + 2];
      var nx = Math.abs(ay * bz - az * by), ny = Math.abs(az * bx - ax * bz), nz = Math.abs(ax * by - ay * bx), s2 = 1 / b.ws;
      for (j = 0; j < 3; j++) { var q = i + j * 3, u = i / 9 * 6 + j * 2; if (ny >= nx && ny >= nz) { ua[u] = pa[q] * s2; ua[u + 1] = pa[q + 2] * s2; } else if (nx >= nz) { ua[u] = pa[q + 2] * s2; ua[u + 1] = pa[q + 1] * s2; } else { ua[u] = pa[q] * s2; ua[u + 1] = pa[q + 1] * s2; } }
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true });
    if (b.tx) m.map = tex(b.tx); if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tx) m.emissiveMap = m.map; } if (b.op) { m.transparent = true; m.opacity = b.op; }
    b.m = m; var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function EI(m, v) { if (m && m.b && m.b.m) m.b.m.emissiveIntensity = v; }
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_26_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 26; g.userData.level = level;
  BK = {};
  var GB = 0.06, sd, i, di, bi, k2;
  var A = {
    stone: MS('#b7b0a2', 0.92, 0, 's', 0.85), lane: MS('#8f887a', 0.92, 0, 's', 0.85),
    plaza: MS('#c6bfae', 0.92, 0, 's', 0.85), curb: MS('#cbc2ac', 0.92, 0, 's', 0.85),
    wall: MS(['#a8a196', '#aca59a', '#b0a99e', '#aca59a'][level - 1], 0.88, 0, 'b', 2.2),
    plaster: MS('#ddd5c2', 0.86, 0, 'p', 0.8),
    roofS: MS(['#5f666b', '#636a6e', '#676e71', '#636a6e'][level - 1], 0.68, 0, 't', 0.5),
    roofG: MS(level === 1 ? '#8d948e' : ['#41724f', '#3c6e4b', '#386a47'][level - 2], level >= 2 ? 0.5 : 0.85, level >= 2 ? 0.15 : 0, 't', 0.5),
    trim: MS('#4c5049', 0.75, 0, '', 0), wood: MS('#7c5c3a', 0.75, 0, 'w', 0.35),
    gold: MS('#d2a64a', 0.35, 0.8, '', 0), steel: MS('#7d848a', 0.45, 0.7, '', 0),
    louv: MS('#cfd4d8', 0.6, 0.4, 'v', 0.15), sky: MS('#a8c2cc', 0.12, 0.5, 'y', 0.8, '', 0, 0.55),
    win: MS('#39434b', 0.14, 0.6, 'y', 0.5), leaf: MS('#75834b', 0.95, 0, 'l', 0.35),
    glow: MS('#6a5a44', 0.25, 0, '', 0, '#ffbd66', [0.06, 0.3, 0.42, 0.55][level - 1]),
    lant: MS('#b03828', 0.6, 0, 'n', 0.5, '#ff5a2a', [0.04, 0.16, 0.3, 0.42][level - 1]),
    awn: MS('#e2ddd0', 0.92, 0, 'f', 1.6), awnS: MS('#e2ddd0', 0.92, 0, 'fs', 1.6),
    paint: MS('#ffffff', 0.55, 0.1, 'q', 2.1), food: MS('#ffffff', 0.6, 0, 'd', 1.6)
  };
  var colM = level >= 4 ? MS('#b23a2c', 0.5, 0.1, 'w', 0.5) : MS('#b9b2a4', 0.85, 0, 's', 1.1);
  var beamM = level >= 2 ? A.paint : MS('#9a948a', 0.85, 0, 'w', 0.35);
  var CAN = level === 1 ? ['#cdc9be', '#b6b2a8'] : level === 2 ? ['#c44a3a', '#3e6e94', '#ddd7c6'] : level === 3 ? ['#c44a3a', '#5a8a4e', '#ddd7c6', '#b5482f'] : ['#3e938c', '#ddd7c6', '#3e938c', '#c44a3a', '#4a7c54'];
  var signMs = [];
  function FAB(h, s2) { return s2 ? MS(h, 0.92, 0, 'fs', 1.6) : MS(h, 0.92, 0, 'f', 1.6); }
  function SIGN(t, w, h, x, y, z, ry, ei) { /* 文字牌：Plane + map/emissiveMap（独立 mesh） */
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, map: t, roughness: 0.5, metalness: 0.08, emissive: C('#ffd9a0'), emissiveMap: t, emissiveIntensity: ei || 0.1 });
    m.side = THREE.DoubleSide;
    var geo = new THREE.PlaneGeometry(w, h), n = geo.attributes.position.count, ca = new Float32Array(n * 3), i2;
    for (i2 = 0; i2 < n * 3; i2++) ca[i2] = 1;
    geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var ms = new THREE.Mesh(geo, m); ms.position.set(x, y, z); ms.rotation.y = ry || 0; ms.castShadow = ms.receiveShadow = true; g.add(ms);
    signMs.push(m); return m;
  }
  function WIN(x, y, z, w, h, vert, lit, si) { /* 木框窗：框四边+中挺+横档+石窗台（vert=朝 ±x，si=窗台挑出向） */
    var mk = lit ? A.glow : A.win;
    if (vert) {
      B(mk, 0.016, h, w, x, y, z);
      B(A.wood, 0.028, 0.028, w + 0.05, x, y + h / 2, z); B(A.wood, 0.028, 0.028, w + 0.05, x, y - h / 2, z);
      B(A.wood, 0.03, h + 0.03, 0.032, x, y, z + w / 2); B(A.wood, 0.03, h + 0.03, 0.032, x, y, z - w / 2);
      B(A.wood, 0.02, h, 0.024, x, y, z); B(A.wood, 0.024, 0.018, w, x, y + h * 0.22, z);
      B(A.stone, 0.045, 0.016, w + 0.09, x - si * 0.02, y - h / 2 - 0.022, z);
    } else {
      B(mk, w, h, 0.016, x, y, z);
      B(A.wood, w + 0.05, 0.028, 0.028, x, y + h / 2, z); B(A.wood, w + 0.05, 0.028, 0.028, x, y - h / 2, z);
      B(A.wood, 0.032, h + 0.03, 0.03, x + w / 2, y, z); B(A.wood, 0.032, h + 0.03, 0.03, x - w / 2, y, z);
      B(A.wood, w, 0.02, 0.024, x, y, z); B(A.wood, w, 0.018, 0.024, x, y + h * 0.22, z);
      B(A.stone, w + 0.09, 0.016, 0.045, x, y - h / 2 - 0.022, z + 0.02);
    }
  }
  function DOORV(x, y, z, w, h) { /* 板门（朝 ±x）：门扇+框+楣+门槛石 */
    B(A.wood, 0.03, h, w, x, y + h / 2, z);
    B(A.wood, 0.05, h + 0.04, 0.04, x, y + h / 2, z + w / 2 + 0.014); B(A.wood, 0.05, h + 0.04, 0.04, x, y + h / 2, z - w / 2 - 0.014);
    B(A.wood, 0.045, 0.04, w + 0.07, x, y + h + 0.02, z);
    B(A.stone, 0.06, 0.016, w + 0.1, x, y + 0.008, z);
  }
  function DOORH(x, y, z, w, h) { /* 板门（朝 ±z） */
    B(A.wood, w, h, 0.03, x, y + h / 2, z);
    B(A.wood, 0.04, h + 0.04, 0.05, x + w / 2 + 0.014, y + h / 2, z); B(A.wood, 0.04, h + 0.04, 0.05, x - w / 2 - 0.014, y + h / 2, z);
    B(A.wood, w + 0.07, 0.04, 0.045, x, y + h + 0.02, z);
    B(A.stone, w + 0.1, 0.016, 0.06, x, y + 0.008, z + 0.016);
  }
  function LANT(x, y, z, s2, hl) { /* 红灯笼：挂线+灯口+纸罩+穗 */
    s2 = s2 || 1;
    if (hl) Y(A.steel, 0.004, 0.004, 0.055 * s2, 12, x, y + 0.05 * s2, z);
    Y(A.gold, 0.012 * s2, 0.012 * s2, 0.018 * s2, 12, x, y + 0.032 * s2, z);
    Y(A.lant, 0.03 * s2, 0.038 * s2, 0.056 * s2, 12, x, y, z);
    Y(A.gold, 0.006 * s2, 0.004 * s2, 0.024 * s2, 12, x, y - 0.038 * s2, z);
  }
  function TREE(x, z, s2) { /* 行道树：干+侧枝+三层团簇冠（lv3+ 四层） */
    s2 *= [0.78, 0.9, 1.02, 1.14][level - 1];
    Y(A.wood, 0.02 * s2, 0.034 * s2, 0.52 * s2, 12, x, GB + 0.26 * s2, z);
    Y(A.wood, 0.011 * s2, 0.013 * s2, 0.16 * s2, 12, x + 0.05 * s2, GB + 0.43 * s2, z, 0, 0, 0.9);
    O(MS('#75834b', 0.95, 0, 'l', 0.35), 0.15 * s2, x, GB + 0.56 * s2, z);
    O(MS('#8a9957', 0.95, 0, 'l', 0.35), 0.1 * s2, x + 0.1 * s2, GB + 0.48 * s2, z + 0.05 * s2);
    O(MS('#66743e', 0.95, 0, 'l', 0.35), 0.088 * s2, x - 0.09 * s2, GB + 0.65 * s2, z - 0.04 * s2);
    if (level >= 3) O(MS('#82904e', 0.95, 0, 'l', 0.35), 0.06 * s2, x - 0.01 * s2, GB + 0.73 * s2, z + 0.03 * s2);
  }
  function POT(x, z) { Y(A.stone, 0.062, 0.075, 0.09, 12, x, GB + 0.045, z); }
  function FLOWER(x, z) { /* 花坛：木箱+三色花团 */
    B(A.wood, 0.36, 0.13, 0.2, x, GB + 0.065, z);
    B(A.trim, 0.32, 0.02, 0.16, x, GB + 0.135, z);
    O(MS('#c46a6a', 0.95, 0, 'l', 0.35), 0.045, x - 0.1, GB + 0.16, z);
    O(MS('#75834b', 0.95, 0, 'l', 0.35), 0.05, x, GB + 0.165, z + 0.02);
    O(MS('#d8b04a', 0.95, 0, 'l', 0.35), 0.04, x + 0.1, GB + 0.16, z - 0.01);
  }
  function BOLL(x, z) { B(A.stone, 0.09, 0.2, 0.09, x, GB + 0.1, z); B(A.stone, 0.11, 0.018, 0.11, x, GB + 0.21, z); }
  function LAMP(x, z, dir) { /* 街灯：基座+杆+悬臂+暖光灯头 */
    Y(A.steel, 0.02, 0.024, 0.014, 12, x, GB + 0.007, z);
    Y(A.steel, 0.013, 0.017, 0.56, 12, x, GB + 0.29, z);
    B(A.steel, 0.13 * dir, 0.013, 0.013, x + dir * 0.06, GB + 0.57, z);
    B(A.glow, 0.06, 0.02, 0.045, x + dir * 0.115, GB + 0.565, z);
  }
  function ACU(x, y, z, vert, f) { /* 空调外机：机身+百叶面+支脚（f=百叶朝向） */
    f = f || 1;
    if (vert) { B(A.steel, 0.075, 0.11, 0.17, x, y, z); B(A.louv, 0.014, 0.075, 0.13, x + f * 0.044, y, z); B(A.steel, 0.05, 0.02, 0.02, x - f * 0.01, y - 0.065, z + 0.05); B(A.steel, 0.05, 0.02, 0.02, x - f * 0.01, y - 0.065, z - 0.05); }
    else { B(A.steel, 0.17, 0.11, 0.075, x, y, z); B(A.louv, 0.13, 0.075, 0.014, x, y, z + 0.044); B(A.steel, 0.02, 0.02, 0.05, x + 0.05, y - 0.065, z); B(A.steel, 0.02, 0.02, 0.05, x - 0.05, y - 0.065, z); }
  }
  function TANK(x, y, z) { Y(A.steel, 0.042, 0.042, 0.09, 12, x, y, z); Y(A.steel, 0.047, 0.047, 0.012, 12, x, y + 0.05, z); B(A.steel, 0.09, 0.016, 0.08, x, y - 0.053, z); }
  function SKYL(x, y, z, w, d) { B(A.steel, w + 0.04, 0.02, d + 0.04, x, y, z); B(A.sky, w, 0.014, d, x, y + 0.016, z); }
  function GRATE(x, z) { B(A.steel, 0.12, 0.012, 0.09, x, GB + 0.026, z); }
  function STRING(x, z0, z1, y0, y1, n) { /* 灯笼串：垂弧钢丝+小灯笼 */
    var zm = (z0 + z1) / 2, ym = (y0 + y1) / 2, dz = z1 - z0, len = Math.sqrt(dz * dz + (y1 - y0) * (y1 - y0));
    B(A.steel, 0.005, 0.005, len, x, ym, zm, -Math.atan2(y1 - y0, dz), 0, 0);
    for (var i2 = 0; i2 < n; i2++) { var f2 = (i2 + 0.5) / n, sag = 0.016 + 0.02 * Math.sin(f2 * PI); LANT(x, y0 + (y1 - y0) * f2 - sag, z0 + dz * f2, 0.7, 1); }
  }
  /* ---- 1 地面：台基 + 窄巷 + 前广场 + 路缘石 ---- */
  B(A.stone, 1.7, 0.05, 2.56, 0, 0.025, 0);
  B(A.lane, 0.72, 0.014, 1.9, 0, 0.057, -0.19);
  B(A.plaza, 1.62, 0.014, 0.42, 0, 0.057, 1.05);
  B(A.curb, 0.05, 0.03, 2.52, -0.825, 0.075, 0); B(A.curb, 0.05, 0.03, 2.52, 0.825, 0.075, 0);
  if (level >= 2) { GRATE(0.02, -0.08); GRATE(-0.06, -0.6); }
  /* ---- 2 石牌楼（z 0.78）：柱础双柱/边柱挎檐/阔额花板/斗拱/歇山翘檐瓦顶/正脊鸱吻/匾额/灯笼 ---- */
  var gz = 0.78;
  B(A.stone, 0.18, 0.1, 0.2, -0.34, GB + 0.05, gz); B(A.stone, 0.18, 0.1, 0.2, 0.34, GB + 0.05, gz);
  B(A.stone, 0.13, 0.024, 0.15, -0.34, GB + 0.112, gz); B(A.stone, 0.13, 0.024, 0.15, 0.34, GB + 0.112, gz);
  Y(colM, 0.042, 0.05, 0.85, 12, -0.34, GB + 0.549, gz); Y(colM, 0.042, 0.05, 0.85, 12, 0.34, GB + 0.549, gz);
  B(A.stone, 0.13, 0.08, 0.16, -0.6, GB + 0.04, gz); B(A.stone, 0.13, 0.08, 0.16, 0.6, GB + 0.04, gz);
  Y(A.stone, 0.03, 0.036, 0.6, 12, -0.6, GB + 0.38, gz); Y(A.stone, 0.03, 0.036, 0.6, 12, 0.6, GB + 0.38, gz);
  EAVE(A.roofG, 0.27, 0.08, 0.02, 0.045, 0.36, -0.47, 0.79, gz, PI / 2);
  EAVE(A.roofG, 0.27, 0.08, 0.02, 0.045, 0.36, 0.47, 0.79, gz, PI / 2);
  B(beamM, 1.36, 0.07, 0.1, 0, 1.07, gz);
  B(beamM, 1.3, 0.14, 0.024, 0, 0.96, gz + 0.062); B(beamM, 1.3, 0.14, 0.024, 0, 0.96, gz - 0.062);
  B(beamM, 1.44, 0.035, 0.13, 0, 1.122, gz);
  if (level >= 2) {
    for (di = 0; di < 7; di++) B(beamM, 0.055, 0.06, 0.1, -0.48 + di * 0.16, 1.175, gz);
    B(beamM, 1.44, 0.028, 0.16, 0, 1.215, gz);
  } else { B(A.wood, 0.05, 0.05, 0.1, -0.3, 1.16, gz); B(A.wood, 0.05, 0.05, 0.1, 0, 1.16, gz); B(A.wood, 0.05, 0.05, 0.1, 0.3, 1.16, gz); }
  EAVE(A.roofG, 0.6, 0.17, 0.03, 0.085, 1.46, 0, 1.24, gz, PI / 2);
  GABLE(A.trim, 0.56, 0.15, -0.715, 1.24, gz, PI / 2); GABLE(A.trim, 0.56, 0.15, 0.715, 1.24, gz, PI / 2);
  B(A.trim, 1.5, 0.026, 0.06, 0, 1.425, gz);
  B(level >= 4 ? A.gold : A.trim, 0.07, 0.06, 0.05, -0.72, 1.452, gz, 0, 0, -0.55);
  B(level >= 4 ? A.gold : A.trim, 0.07, 0.06, 0.05, 0.72, 1.452, gz, 0, 0, 0.55);
  if (level >= 4) { Y(A.gold, 0.02, 0.027, 0.05, 12, 0, 1.475, gz); O(A.gold, 0.024, 0, 1.52, gz); }
  B(A.wall, 0.26, 0.5, 0.14, -0.71, GB + 0.25, gz); B(A.wall, 0.26, 0.5, 0.14, 0.71, GB + 0.25, gz);
  B(A.roofG, 0.3, 0.026, 0.18, -0.71, GB + 0.52, gz, 0, 0, 0.16); B(A.roofG, 0.3, 0.026, 0.18, 0.71, GB + 0.52, gz, 0, 0, -0.16);
  B(A.stone, 1.2, 0.045, 0.18, 0, GB + 0.0225, 0.95);
  if (level >= 2) SIGN(signTex('回民街', '#1d3a40', '#ffd98c'), 0.36, 0.12, 0, 0.94, gz + 0.085, 0, level >= 4 ? 0.5 : 0.15);
  else B(A.wood, 0.36, 0.12, 0.028, 0, 0.94, gz + 0.078);
  if (level === 3) {
    B(A.steel, 0.005, 0.07, 0.005, -0.22, 1.0, gz + 0.07); B(A.steel, 0.005, 0.07, 0.005, 0.22, 1.0, gz + 0.07);
    LANT(-0.22, 0.925, gz + 0.07, 1, 0); LANT(0.22, 0.925, gz + 0.07, 1, 0);
  }
  if (level >= 4) {
    B(A.steel, 0.92, 0.005, 0.005, 0, 1.0, gz + 0.07);
    for (bi = 0; bi < 4; bi++) LANT(-0.315 + bi * 0.21, 0.95 - (bi === 1 || bi === 2 ? 0.045 : 0.02), gz + 0.07, 0.85, 1);
  }
  /* ---- 3 两侧各两栋两层铺面（砖墙+楼层板带+木框窗+坡顶博风；lv3+ 挑廊/空调/竖幌） ---- */
  for (sd = -1; sd <= 1; sd += 2) {
    B(A.stone, 0.4, 0.05, 0.56, sd * 0.64, GB + 0.025, 0.08);
    B(A.wall, 0.36, 0.72, 0.52, sd * 0.64, GB + 0.36, 0.08);
    B(A.wood, 0.38, 0.025, 0.54, sd * 0.64, 0.42, 0.08);
    DOORV(sd * 0.452, GB, 0.0, 0.15, 0.26);
    WIN(sd * 0.452, 0.24, 0.24, 0.14, 0.15, true, level >= 2, sd);
    WIN(sd * 0.452, 0.58, 0.0, 0.13, 0.14, true, level >= 2, sd);
    WIN(sd * 0.452, 0.58, 0.21, 0.13, 0.14, true, level >= 4, sd);
    ROOF(A.roofS, A.trim, 0.44, 0.58, 0.11, 0.045, sd * 0.64, 0.78, 0.08, false, true);
    if (level >= 3) {
      B(A.wood, 0.16, 0.022, 0.5, sd * 0.375, 0.435, 0.08);
      for (bi = 0; bi < 4; bi++) B(A.wood, 0.014, 0.09, 0.014, sd * 0.305, 0.485, -0.1 + bi * 0.12);
      B(A.wood, 0.018, 0.016, 0.52, sd * 0.305, 0.535, 0.08);
      ACU(sd * 0.5, 0.3, -0.12, true, -sd);
    }
    B(A.stone, 0.42, 0.05, 0.6, sd * 0.65, GB + 0.025, -0.62);
    B(A.wall, 0.38, 0.66, 0.56, sd * 0.65, GB + 0.33, -0.62);
    B(A.wood, 0.4, 0.025, 0.58, sd * 0.65, 0.4, -0.62);
    DOORV(sd * 0.457, GB, -0.48, 0.15, 0.26);
    WIN(sd * 0.457, 0.26, -0.7, 0.14, 0.15, true, level >= 3, sd);
    WIN(sd * 0.457, 0.56, -0.48, 0.13, 0.14, true, level >= 3, sd);
    WIN(sd * 0.457, 0.56, -0.72, 0.13, 0.14, true, level >= 4, sd);
    ROOF(A.roofS, A.trim, 0.46, 0.62, 0.12, 0.05, sd * 0.65, 0.72, -0.62, false, true);
    if (level >= 3) { /* 后栋二层木栏挑廊 */
      B(A.wood, 0.14, 0.022, 0.44, sd * 0.385, 0.415, -0.62);
      for (bi = 0; bi < 3; bi++) B(A.wood, 0.014, 0.08, 0.014, sd * 0.32, 0.462, -0.78 + bi * 0.16);
      B(A.wood, 0.018, 0.016, 0.46, sd * 0.32, 0.506, -0.62);
    }
    if (level >= 3) SIGN(vSign(sd > 0 ? '烤肉' : '酿皮', sd > 0 ? '#8a2318' : '#1d3a40', '#f6e2a8'), 0.07, 0.2, sd * 0.456, 0.5, -0.55, sd > 0 ? -PI / 2 : PI / 2, 0.1);
  }
  /* ---- 4 后排三栋天台院落（左双坡+烟囱/中抹灰平房/右平顶天台：空调木箱 lv2+ 水箱 lv3+ 阳光房天线 lv4） ---- */
  B(A.stone, 0.6, 0.05, 0.38, -0.52, GB + 0.025, -1.05);
  B(A.wall, 0.56, 0.72, 0.34, -0.52, GB + 0.36, -1.05);
  WIN(-0.66, 0.28, -0.865, 0.13, 0.15, false, level >= 2, 0);
  WIN(-0.38, 0.28, -0.865, 0.13, 0.15, false, false, 0);
  WIN(-0.66, 0.58, -0.865, 0.12, 0.13, false, false, 0);
  WIN(-0.38, 0.58, -0.865, 0.12, 0.13, false, level >= 3, 0);
  ROOF(A.roofS, A.trim, 0.42, 0.62, 0.11, 0.045, -0.52, 0.78, -1.05, true, true);
  if (level >= 2) B(A.stone, 0.07, 0.16, 0.07, -0.74, 0.86, -1.13);
  if (level >= 3) SKYL(-0.34, 0.86, -1.0, 0.12, 0.09);
  B(A.plaster, 0.4, 0.56, 0.3, 0.03, GB + 0.28, -1.07);
  DOORH(0.03, GB, -0.915, 0.13, 0.22);
  WIN(0.16, 0.3, -0.915, 0.11, 0.13, false, level >= 2, 0);
  ROOF(A.roofS, A.trim, 0.36, 0.46, 0.09, 0.04, 0.03, 0.62, -1.07, true, false);
  if (level >= 3) TANK(0.14, 0.72, -1.1);
  B(A.stone, 0.54, 0.05, 0.38, 0.55, GB + 0.025, -1.05);
  B(A.wall, 0.5, 0.84, 0.34, 0.55, GB + 0.42, -1.05);
  WIN(0.44, 0.34, -0.865, 0.12, 0.14, false, level >= 2, 0);
  WIN(0.66, 0.34, -0.865, 0.12, 0.14, false, false, 0);
  WIN(0.44, 0.64, -0.865, 0.11, 0.12, false, level >= 4, 0);
  B(A.stone, 0.54, 0.026, 0.38, 0.55, 0.852, -1.05);
  B(A.stone, 0.54, 0.05, 0.03, 0.55, 0.875, -0.875); B(A.stone, 0.54, 0.05, 0.03, 0.55, 0.875, -1.225);
  B(A.stone, 0.03, 0.05, 0.38, 0.295, 0.875, -1.05); B(A.stone, 0.03, 0.05, 0.38, 0.805, 0.875, -1.05);
  if (level >= 2) { ACU(0.44, 0.93, -1.0, false, 0); B(A.wood, 0.1, 0.1, 0.1, 0.68, 0.915, -1.13); B(A.wood, 0.08, 0.08, 0.08, 0.68, 1.005, -1.13); }
  if (level >= 4) {
    B(A.steel, 0.34, 0.018, 0.26, 0.48, 0.873, -1.02); B(A.sky, 0.3, 0.14, 0.22, 0.48, 0.952, -1.02); B(A.steel, 0.32, 0.014, 0.24, 0.48, 1.027, -1.02);
    Y(A.steel, 0.004, 0.004, 0.18, 12, 0.7, 0.99, -1.16); O(A.steel, 0.011, 0.7, 1.09, -1.16);
  }
  /* ---- 5 窄巷小吃摊阵（柜台食案/背板/支杆/彩篷脊檐+垂帘/食盘/灯箱 lv2+/灯笼 lv3+） ---- */
  var NS = [2, 3, 4, 5][level - 1];
  function STALL(sd2, z, i2) {
    var x = sd2 * 0.31, striped = level >= 2 && (i2 % 2 === 0), glass = level === 4 && i2 === 2;
    var cc = CAN[(i2 + (sd2 > 0 ? 1 : 0)) % CAN.length];
    var cm = glass ? A.sky : FAB(cc, striped);
    B(A.wood, 0.26, 0.16, 0.3, x, GB + 0.11, z);
    B(A.food, 0.28, 0.018, 0.32, x, GB + 0.2, z);
    B(A.wood, 0.025, 0.34, 0.3, sd2 * 0.445, GB + 0.23, z);
    Y(A.wood, 0.011, 0.013, 0.56, 12, sd2 * 0.14, GB + 0.28, z + 0.14);
    Y(A.wood, 0.011, 0.013, 0.56, 12, sd2 * 0.14, GB + 0.28, z - 0.14);
    EAVE(cm, 0.34, 0.09, 0.012, 0.03, 0.34, x, GB + 0.57, z, 0);
    B(cm, 0.014, 0.06, 0.3, sd2 * 0.143, GB + 0.55, z);
    B(A.food, 0.06, 0.04, 0.06, x - sd2 * 0.06, GB + 0.24, z + 0.05);
    Y(A.food, 0.028, 0.034, 0.045, 12, x + sd2 * 0.05, GB + 0.245, z - 0.05);
    if (level >= 2) B(A.glow, 0.014, 0.2, 0.24, sd2 * 0.424, GB + 0.3, z);
    if (level >= 3) LANT(sd2 * 0.14, GB + 0.52, z + 0.14, 0.75, 1);
  }
  for (sd = -1; sd <= 1; sd += 2) for (i = 0; i < NS; i++) STALL(sd, 0.26 - i * (1.04 / (NS - 1)), i);
  /* ---- 6 行道树（石花坛前角对树）/ 石敢当→花坛 / 盆树 lv3+ / 街灯 lv3+ / 灯串 lv4 / lv1 箩筐 ---- */
  B(A.stone, 0.32, 0.14, 0.32, -0.62, GB + 0.07, 1.06); B(A.trim, 0.26, 0.03, 0.26, -0.62, GB + 0.15, 1.06);
  B(A.stone, 0.32, 0.14, 0.32, 0.62, GB + 0.07, 1.06); B(A.trim, 0.26, 0.03, 0.26, 0.62, GB + 0.15, 1.06);
  TREE(-0.62, 1.06, 1); TREE(0.62, 1.06, 1);
  if (level >= 2) TREE(-0.62, 0.52, 0.7);
  if (level <= 2) { BOLL(-0.34, 1.0); BOLL(0.34, 1.0); BOLL(-0.3, 1.2); BOLL(0.3, 1.2); }
  else { FLOWER(-0.27, 0.96); FLOWER(0.27, 0.96); }
  if (level >= 3) {
    LAMP(0.44, 0.55, -1); LAMP(-0.44, 0.55, 1);
    POT(-0.52, 0.9); TREE(-0.52, 0.9, 0.42); POT(0.52, 0.9); TREE(0.52, 0.9, 0.42);
  }
  if (level >= 4) STRING(0, 0.18, -0.66, GB + 0.66, GB + 0.62, 4);
  if (level === 1) { B(A.wood, 0.12, 0.09, 0.1, 0.0, GB + 0.045, -0.84); B(A.wood, 0.09, 0.08, 0.09, 0.14, GB + 0.04, -0.82, 0, 0.4, 0); B(A.wood, 0.1, 0.07, 0.09, -0.13, GB + 0.035, -0.86, 0, -0.3, 0); }
  flush(g);
  /* ---- 动画 2 项：暖光窗/摊灯箱呼吸 / 灯笼+匾额+竖幌 emissive 呼吸 ---- */
  g.userData.anim = [function (t) { EI(A.glow, [0.06, 0.3, 0.42, 0.55][level - 1] + 0.13 * (0.5 + 0.5 * Math.sin(t * 1.4))); },
    function (t) {
      var s2 = 0.5 + 0.5 * Math.sin(t * 1.8), i2;
      EI(A.lant, [0.04, 0.16, 0.3, 0.42][level - 1] + 0.14 * s2);
      for (i2 = 0; i2 < signMs.length; i2++) signMs[i2].emissiveIntensity = (level >= 4 ? 0.4 : 0.1) + 0.1 * s2;
    }];
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[26] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
