/* 大富翁·现代写实棋盘（沪）格 8「田子坊」—— 石库门弄堂街区 + 艺术店铺，四年代演进（v3 全量精修 R1-R3）
 * 契约：window.Props3DModern[8](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z；
 * 每级 mesh ≤55（手写按材质合并；lv1..lv4=15/18/24/25，均在 v1 基线+6 内）；Canvas ≤256px；零 Math.random；动画 ≤2 项。
 * 视觉基准 refs/modern/prop_8.png（写实航拍 3/4 视角，四象限=同一石库门街区 1990s→2020s）：中央弄堂两侧联排石库门楼
 * （山墙朝街/弄堂、硬山双坡小青瓦、正脊/博风/封檐/老虎窗/天窗/烟囱/空调机/水箱/屋顶植被）、沿街铺房+门楼、行道树/花箱/条石路缘/石板弄堂；
 * 演进为结构性：1990s 风化灰泥+木门紧闭+晾衣竿 → 2000s 红砖修复+篷布+盆栽花箱+空调机 → 2010s 酒红篷+玻璃阳光房+店招路灯+水箱 →
 * 2020s 钢架玻璃屋顶加建(内透暖光)+露台栏杆+发光灯箱。工程要点：boxUV 世界烘焙；玻璃 rg.12/mt.65、钢 mt.85、天窗 op.55、
 * 发光件每实例独立+呼吸；Canvas 真彩绘制（砖红棕/瓦炭灰/石板/木漆），材质色仅作色温微调。
 * v3 R1：体量 4→12/侧组（前楼+后楼+披屋+沿街铺房+院墙），屋面正脊/封檐/烟囱，三层窗（框+玻璃+窗台），门楼三层线脚+柱头座帽。
 * v3 R2：lv4 加建改沿屋面大覆盖率+内透暖光+露台移至玻璃顶；天窗钢框；AC 外机/水箱；弄堂底影壁门+条石路缘；店招移檐下；砖色压暗。
 * v3 R3：小青瓦 256px 重绘压深+博风板/脊吻；灶披间单坡矮屋填天井、天井石板+院树+水缸；弄堂面石库门门洞+楣窗+木窗插板+壁灯+竖幌；
 *        lv4 玻璃加建改透明玻璃顶+黑框分格+顶缘花池（替换原不透明钢板顶）；lv3 阳光房加基座黑框顶花池；墙挂 AC 百叶面 lv2+；
 *        店内暖光陈列贴图（map+emissiveMap）；屋面绿植/街树树冠加大（球 16×12）；圆柱段全部 ≥12；修正烟囱/AC/水箱落坡贴地。
 * v3 R4：前楼外山墙三窗+落水管+墙挂 AC；亭子间平顶小间（灶披间上，天窗/盆栽移顶）；后楼外坡棚顶老虎窗+卫星锅(lv2-3)；
 *        弄堂排水沟+沿边木箱/箩筐/陶盆绿植；lv4 露台缩小露瓦面+篷下外摆座；竖幌加大；lv3 阳光房玻璃顶+椽条；lv4 砖色压暗。
 * v3 R5：过街楼跨弄小楼（后段连接两侧后楼，山墙朝弄堂正脊沿 x）；砖纹升 256px 皮数加密+泛碱/青苔；砖/瓦增 roughnessMap（缝糙面光）；
 *        小型灌木/苔斑用二十面体、树冠球 16×12 分级控预算（lv1..lv4=8.9k/12.0k/14.8k/17.2k）。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_8] THREE 未定义'); return; }
var _mc = {}, _t = {}, BK, PI2 = Math.PI / 2;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function mk(h, o, fresh) { /* 材质工厂：map 为真彩纹理×color 微调；rm=roughnessMap；fresh=发光/动画材质每实例独立 */
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + o.em + '|' + o.ei + '|' + (o.map ? o.map.uuid : '') + '|' + (o.rm ? o.rm.uuid : '') + '|' + o.op;
  if (!fresh && _mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) m.map = o.map; if (o.rm) m.roughnessMap = o.rm; if (o.op) { m.transparent = true; m.opacity = o.op; }
  return fresh ? m : (_mc[k] = m);
}
function M(h, o) { return mk(h, o); } function MF(h, o) { return mk(h, o, 1); }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c, lin) { var t = new THREE.CanvasTexture(c); t.encoding = lin ? THREE.LinearEncoding : THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function T(k, S, seed, draw, lin) { if (!_t[k]) { var c = cv(S, S), R = lcg(seed); draw(c.getContext('2d'), S, R); _t[k] = TX(c, lin); } return _t[k]; }
function specks(g, S, R, n, a, b) { for (var i = 0; i < n; i++) { g.fillStyle = R() > 0.5 ? a : b; g.fillRect(R() * S, R() * S, 1 + R() * 3, 1 + R() * 2); } }
function gy(v) { v = Math.max(0, Math.min(255, v | 0)); return 'rgb(' + v + ',' + v + ',' + v + ')'; }
/* Canvas 真彩纹理：基色→砌块/瓦垄→分缝(暗+亮边)→风化→噪点；*R 为线性粗糙度图（缝 255 最糙、面 190-235） */
function texBrick() { return T('brick', 256, 811, function (g, S, R) { var bc = ['152,84,66', '132,70,56', '168,102,80', '116,60,48', '142,92,74'];
  g.fillStyle = '#96897a'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 16) for (var x = (y / 16) % 2 ? -16 : 0; x < S; x += 32) { g.fillStyle = 'rgba(' + bc[Math.floor(R() * 5)] + ',' + (0.78 + R() * 0.22).toFixed(2) + ')'; g.fillRect(x + 1, y + 1, 30, 14); }
  for (var y2 = 0; y2 < S; y2 += 16) { g.fillStyle = 'rgba(54,42,34,0.6)'; g.fillRect(0, y2, S, 2); g.fillStyle = 'rgba(255,236,216,0.3)'; g.fillRect(0, y2 + 2, S, 1);
    for (var x2 = (y2 / 16) % 2 ? 0 : 16; x2 < S; x2 += 32) { g.fillStyle = 'rgba(54,42,34,0.55)'; g.fillRect(x2, y2, 2, 16); } }
  for (var i = 0; i < 12; i++) { g.fillStyle = 'rgba(34,26,20,0.15)'; g.fillRect(R() * S, 0, 3 + R() * 6, S * (0.4 + R() * 0.6)); }
  for (var e = 0; e < 6; e++) { g.fillStyle = 'rgba(222,218,206,0.2)'; g.fillRect(R() * S, R() * S * 0.5, 6 + R() * 10, 24 + R() * 46); }
  g.fillStyle = 'rgba(70,90,50,0.14)'; g.fillRect(0, S - 22, S, 22);
  specks(g, S, R, 160, 'rgba(40,30,24,0.32)', 'rgba(255,230,206,0.28)'); }); }
function texBrickR() { return T('brickR', 128, 813, function (g, S, R) { g.fillStyle = gy(255); g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 16) for (var x = (y / 16) % 2 ? -16 : 0; x < S; x += 32) { g.fillStyle = gy(196 + R() * 40); g.fillRect(x + 1, y + 1, 30, 14); }
  specks(g, S, R, 50, gy(180), gy(245)); }, true); }
function texTileR() { return T('tileR', 128, 819, function (g, S, R) { g.fillStyle = gy(255); g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 24) for (var x = -9; x < S; x += 18) { g.fillStyle = gy(186 + R() * 44); g.fillRect(x + 2, y + 4, 14, 19); }
  for (var i = 0; i < 6; i++) { g.fillStyle = gy(160); g.fillRect(R() * S, R() * S, 8 + R() * 14, 6 + R() * 10); } specks(g, S, R, 40, gy(170), gy(240)); }, true); }
function texPlaster() { return T('plaster', 128, 866, function (g, S, R) { /* 风化灰泥：水渍+剥落露砖+裂缝 */
  g.fillStyle = '#b7b0a2'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 12; i++) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '84,80,74' : '54,64,54') + ',' + (0.09 + R() * 0.15).toFixed(2) + ')'; g.fillRect(R() * S, R() * S, 10 + R() * 40, 8 + R() * 30); }
  for (var p = 0; p < 5; p++) { var px = R() * S, py = R() * S, pw = 14 + R() * 20, ph = 8 + R() * 16; g.fillStyle = 'rgba(142,82,62,0.65)'; g.fillRect(px, py, pw, ph); g.fillStyle = 'rgba(54,34,28,0.45)'; for (var yy = py; yy < py + ph; yy += 5) g.fillRect(px, yy, pw, 1); }
  for (var c = 0; c < 5; c++) { g.fillStyle = 'rgba(44,40,36,0.55)'; g.fillRect(R() * S, R() * S, 1, 6 + R() * 26); }
  specks(g, S, R, 80, 'rgba(52,48,42,0.28)', 'rgba(255,250,240,0.3)'); }); }
function texTile() { return T('tile', 256, 818, function (g, S, R) { /* 小青瓦(压深)：瓦行+单瓦色差+瓦端弧光+竖缝+行口高光+苔痕 */
  g.fillStyle = '#3a3f45'; g.fillRect(0, 0, S, S);
  for (var y = 0, row = 0; y < S; y += 24, row++) {
    for (var x = -9; x < S; x += 18) {
      var v = 0.82 + R() * 0.36;
      g.fillStyle = 'rgb(' + Math.round(96 * v) + ',' + Math.round(102 * v) + ',' + Math.round(110 * v) + ')'; g.fillRect(x + 2, y + 4, 14, 19);
      g.fillStyle = 'rgba(178,188,198,0.38)'; g.fillRect(x + 4, y + 5, 9, 3);
      g.fillStyle = 'rgba(8,10,14,0.7)'; g.fillRect(x + 16, y, 2, 24);
    }
    g.fillStyle = 'rgba(10,12,16,0.62)'; g.fillRect(0, y, S, 3); g.fillStyle = 'rgba(168,178,188,0.2)'; g.fillRect(0, y + 3, S, 1);
  }
  for (var i = 0; i < 16; i++) { g.fillStyle = i % 3 ? 'rgba(84,102,60,0.42)' : 'rgba(138,126,56,0.3)'; g.fillRect(R() * S, R() * S, 4 + R() * 9, 3 + R() * 5); }
  specks(g, S, R, 60, 'rgba(6,8,12,0.4)', 'rgba(190,198,206,0.22)'); }); }
function texPave() { return T('pave', 128, 842, function (g, S, R) { /* 石板：板块色差+分缝(暗+亮) */
  g.fillStyle = '#b2ab9d'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 32) for (var x = 0; x < S; x += 32) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '72,68,60' : '255,255,250') + ',' + (0.07 + R() * 0.14).toFixed(2) + ')'; g.fillRect(x, y, 32, 32);
    g.fillStyle = 'rgba(62,56,46,0.58)'; g.fillRect(x, y, 32, 2); g.fillRect(x, y, 2, 32); g.fillStyle = 'rgba(255,255,248,0.28)'; g.fillRect(x + 2, y + 2, 30, 1); }
  specks(g, S, R, 60, 'rgba(58,54,46,0.28)', 'rgba(255,255,248,0.3)'); }); }
function texWood() { return T('wood', 64, 878, function (g, S, R) { /* 木板：板缝+木纹+节疤 */
  g.fillStyle = '#a8845a'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 8) { g.fillStyle = 'rgba(46,30,16,0.55)'; g.fillRect(x, 0, 1, S); for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(84,58,32,0.28)'; g.fillRect(x + 2 + R() * 5, R() * S, 1, 8 + R() * 20); } }
  for (var k = 0; k < 3; k++) { g.fillStyle = 'rgba(56,36,18,0.55)'; g.fillRect(R() * S, R() * S, 3, 2); } specks(g, S, R, 30, 'rgba(40,26,14,0.22)', 'rgba(255,238,214,0.25)'); }); }
function texAwn() { return T('awn', 64, 854, function (g, S, R) { /* 篷布条纹（×color 染米/酒红/绿） */
  g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.4)'; g.fillRect(x, 0, 8, S); }
  for (var y = 0; y < S; y += 3) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, S, 1); } specks(g, S, R, 30, 'rgba(0,0,0,0.12)', 'rgba(255,255,255,0.2)'); }); }
function texLouver() { return T('louver', 64, 872, function (g, S, R) { /* 空调百叶：横栅+凹影 */
  g.fillStyle = '#788088'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 7) { g.fillStyle = '#2c3237'; g.fillRect(0, y, S, 3); g.fillStyle = 'rgba(222,228,232,0.4)'; g.fillRect(0, y + 3, S, 1); }
  g.fillStyle = 'rgba(0,0,0,0.4)'; g.fillRect(0, 0, 3, S); g.fillRect(S - 3, 0, 3, S); specks(g, S, R, 20, 'rgba(60,66,70,0.3)', 'rgba(240,244,246,0.3)'); }); }
function texInterior() { return T2('interior', 128, 64, 890, function (g, w, h, R) { /* 店内暖光陈列：层板+陈设+顶灯（map+emissiveMap） */
  g.fillStyle = '#f2d9a8'; g.fillRect(0, 0, w, h);
  for (var y = 12; y < h; y += 16) { g.fillStyle = 'rgba(90,60,30,0.45)'; g.fillRect(6, y, w - 12, 3); }
  for (var i = 0; i < 18; i++) { g.fillStyle = i % 3 ? 'rgba(120,80,40,0.5)' : 'rgba(60,90,120,0.45)'; g.fillRect(8 + ((R() * (w - 20)) | 0), 6 + (i % 3) * 16, 5 + ((R() * 6) | 0), 7); }
  g.fillStyle = 'rgba(255,250,230,0.9)'; g.fillRect(20, 2, 10, 3); g.fillRect(70, 2, 10, 3); g.fillRect(105, 2, 8, 3); }); }
function T2(k, w, h, seed, draw) { if (!_t[k]) { var c = cv(w, h), R = lcg(seed); draw(c.getContext('2d'), w, h, R); _t[k] = TX(c); } return _t[k]; }
function signTex(txt, bg, fg) { /* 店招/匾额面（≤256，按文本缓存；材质每实例新建） */
  var k = 's' + txt + bg + fg; if (_t[k]) return _t[k]; var c = cv(256, 64), g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 38px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34); return (_t[k] = TX(c)); }
function signTexV(txt, bg, fg) { /* 竖幌面（64×256，文字竖排） */
  var k = 'v' + txt + bg + fg; if (_t[k]) return _t[k]; var c = cv(64, 256), g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 64, 256); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(4, 4, 56, 248);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 46px "Microsoft YaHei",sans-serif';
  for (var i = 0; i < txt.length; i++) g.fillText(txt[i], 32, 40 + (200 / txt.length) * (i + 0.5)); return (_t[k] = TX(c)); }
/* 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；boxUV 按世界尺寸烘焙 */
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function uvS(g, u, v) { if (u || v) { var a = g.attributes.uv, i; for (i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * (u || 1), a.getY(i) * (v || 1)); } return g; }
function boxUV(g, w, h, d, s) { var a = g.attributes.uv, dm = [d, h, d, h, w, d, w, d, w, h, w, h]; for (var i = 0; i < 24; i++) a.setXY(i, a.getX(i) * dm[(i >> 2) * 2] * s, a.getY(i) * dm[(i >> 2) * 2 + 1] * s); return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz, s) { var g = new THREE.BoxGeometry(w, h, d); if (m.map && s !== -1) boxUV(g, w, h, d, s || 2.2); put(m, xf(g, x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s || 12), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function S(m, r, x, y, z) { put(m, xf(new THREE.SphereGeometry(r, 16, 12), x, y, z)); }
function A2(m, geo, x, y, z, u, v) { put(m, xf(uvS(geo, u, v), x, y, z)); }
function TRI(m, w, h, d, x, y, z) { var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); A2(m, new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), x, y, z, 2.2, 2.2); }
function ROOF(A, cx, cz, w, d, h, rise) { /* 硬山双坡：两坡面+正脊+前后封檐+两侧博风板+脊吻 */
  var run = w / 2, ang = Math.atan2(rise, run), pw = Math.sqrt(run * run + rise * rise) + 0.06;
  B(A.roof, pw, 0.024, d + 0.06, cx - run / 2, h + rise / 2, cz, 0, 0, ang); B(A.roof, pw, 0.024, d + 0.06, cx + run / 2, h + rise / 2, cz, 0, 0, -ang);
  B(A.ridge, 0.09, 0.05, d + 0.1, cx, h + rise + 0.008, cz);
  B(A.ridge, w + 0.08, 0.045, 0.028, cx, h - 0.008, cz + d / 2 + 0.026); B(A.ridge, w + 0.08, 0.045, 0.028, cx, h - 0.008, cz - d / 2 - 0.026);
  B(A.ridge, 0.034, 0.052, d + 0.08, cx - w / 2 - 0.008, h + rise / 2 + 0.016, cz, 0, 0, ang); B(A.ridge, 0.034, 0.052, d + 0.08, cx + w / 2 + 0.008, h + rise / 2 + 0.016, cz, 0, 0, -ang);
  B(A.ridge, 0.11, 0.06, 0.045, cx, h + rise + 0.014, cz + d / 2 + 0.05); B(A.ridge, 0.11, 0.06, 0.045, cx, h + rise + 0.014, cz - d / 2 - 0.05); }
function GABLE(m, w, rise, d, x, y, z, dir) { TRI(m, w - 0.04, rise + 0.06, 0.03, x, y - 0.02, z + dir * (d / 2 + 0.02)); }
function WIN(A, w, h, x, y, z, dx, shut) { /* 三层窗：石框+玻璃/木闭板+窗台；dx=1 嵌 ±x 面 */
  B(A.band, dx ? 0.035 : w + 0.05, h + 0.05, dx ? w + 0.05 : 0.035, x, y, z);
  B(shut ? A.wood : A.glass, dx ? 0.045 : w, h, dx ? w : 0.045, x, y, z);
  B(A.band, dx ? 0.06 : w + 0.09, 0.025, dx ? w + 0.09 : 0.06, x, y - h / 2 - 0.024, z); }
function CHIM(A, x, y, z, pot) { B(A.wall, 0.09, 0.16, 0.09, x, y + 0.08, z); B(A.ridge, 0.125, 0.025, 0.125, x, y + 0.172, z); if (pot) Y(A.ridge, 0.018, 0.024, 0.07, 12, x, y + 0.22, z); }
function ACW(A, x, y, z, s) { /* 墙挂空调外机：机体+百叶面+托架+滴水管（总凸出 0.055，外墙 x=1.24 时 ≤1.295） */
  B(A.steel, 0.045, 0.11, 0.1, x + s * 0.0225, y, z); B(A.acf, 0.01, 0.09, 0.08, x + s * 0.05, y, z);
  B(A.ridge, 0.04, 0.01, 0.02, x + s * 0.02, y - 0.07, z); B(A.ridge, 0.006, 0.006, 0.05, x + s * 0.03, y - 0.1, z); }
function flush(g) { for (var k in BK) { var b = BK[k], gs = b.gs, P = 0, i;
  for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
  var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
  for (i = 0; i < gs.length; i++) { pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o);
    if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length; }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
  var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms); } }
/* 田子坊四年代 */
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_8_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = level; BK = {};
  var pi, px, bi, vi, di, dx, mi, ti, li;
  var A = { wall: level === 1 ? M('#dcd4c4', { map: texPlaster(), rg: 0.94 }) : M(level >= 4 ? '#d2bcaa' : '#d0bfae', { map: texBrick(), rm: texBrickR(), rg: 1 }),
    pave: M('#b9b2a6', { map: texPave(), rg: 0.94 }), alley: M('#6e6a62', { map: texPave(), rg: 0.95 }),
    band: M('#d8d0be', { map: texPave(), rg: 0.82 }), wood: M('#b99a78', { map: texWood(), rg: 0.85 }),
    door: M('#6b503a', { map: texWood(), rg: 0.7 }), glass: M('#2e3840', { rg: 0.12, mt: 0.65 }),
    roof: M('#a8adb5', { map: texTile(), rm: texTileR(), rg: 0.92 }), ridge: M('#3a3f47', { rg: 0.85 }),
    trunk: M('#57452f', { rg: 0.9 }), leaf: M('#5f7f40', { rg: 0.95 }), leaf2: M('#72904d', { rg: 0.95 }),
    moss: M('#5a6b46', { rg: 0.95 }), planter: M('#8f877a', { rg: 0.9 }), steel: M('#8a9198', { rg: 0.35, mt: 0.85 }),
    sky: M('#9fb4c0', { rg: 0.08, mt: 0.5, op: 0.55 }), acf: M('#ffffff', { map: texLouver(), rg: 0.55, mt: 0.45 }),
    dark: M('#262b30', { rg: 0.5, mt: 0.55 }),
    awn: M(level === 2 ? '#c9b98a' : '#8e3a3a', { map: texAwn(), rg: 0.9 }), awnG: M('#41684f', { map: texAwn(), rg: 0.9 }) };
  var glow = MF('#ffe4c0', { map: texInterior(), rg: 0.45, em: '#ffb768', ei: level >= 3 ? 0.6 : 0.25 });
  var signM = level >= 3 ? MF('#f0e8d8', { map: signTex('咖啡', '#26343a', level >= 4 ? '#ffd98c' : '#e8d9b0'), em: '#ffcf8e', ei: level >= 4 ? 0.75 : 0.12, rg: 0.5 }) : null;
  var plqM = level >= 3 ? MF('#efe6d4', { map: signTex('田子坊', '#20180f', level >= 4 ? '#ffce7a' : '#d8c290'), em: '#ffc76a', ei: level >= 4 ? 0.85 : 0.1, rg: 0.55 }) : null;
  var sign2 = level >= 3 ? MF('#ded5c2', { map: signTex('画廊', '#2e2a22', '#e0c890'), em: '#e8c070', ei: 0.1, rg: 0.6 }) : null;
  var vsignM = level >= 3 ? MF('#e8ddc8', { map: signTexV('茶', '#33261a', level >= 4 ? '#ffd98c' : '#dcc494'), em: '#ffcf8e', ei: level >= 4 ? 0.55 : 0.12, rg: 0.55 }) : null;
  /* 地面：地坪+中央弄堂+窨井+门槛石+前街条石带+路缘 */
  B(A.pave, 2.6, 0.05, 2.6, 0, 0.025, 0); B(A.alley, 0.58, 0.056, 2.6, 0, 0.028, 0);
  B(A.ridge, 0.03, 0.006, 2.5, -0.27, 0.057, 0); B(A.ridge, 0.03, 0.006, 2.5, 0.27, 0.057, 0);
  B(A.ridge, 0.16, 0.007, 0.22, 0.13, 0.06, 0.24); B(A.band, 0.7, 0.058, 0.12, 0, 0.029, 0.98);
  B(A.band, 2.56, 0.025, 0.05, 0, 0.042, 1.275);
  for (var sti = 0; sti < 2; sti++) { B(A.band, 0.42, 0.007, 0.06, sti ? 0.65 : -0.65, 0.0545, 1.1); B(A.band, 0.42, 0.007, 0.06, sti ? 0.65 : -0.65, 0.0545, 1.2); }
  /* 石库门弄堂口：门柱+座帽+雀替、双层门楣+山花(拼花块)+匾额(lv3+)+门柱灯(lv4) */
  B(A.wall, 0.16, 0.78, 0.16, -0.36, 0.39, 0.9); B(A.wall, 0.16, 0.78, 0.16, 0.36, 0.39, 0.9);
  B(A.band, 0.21, 0.05, 0.21, -0.36, 0.805, 0.9); B(A.band, 0.21, 0.05, 0.21, 0.36, 0.805, 0.9);
  B(A.band, 0.92, 0.1, 0.18, 0, 0.86, 0.9); B(A.band, 0.78, 0.04, 0.13, 0, 0.925, 0.895); TRI(A.band, 0.9, 0.15, 0.06, 0, 0.945, 0.875);
  B(A.band, 0.07, 0.07, 0.04, -0.265, 0.79, 0.9, 0, 0, 0.78); B(A.band, 0.07, 0.07, 0.04, 0.265, 0.79, 0.9, 0, 0, -0.78);
  for (var fi = 0; fi < 3; fi++) B(A.ridge, 0.06, 0.05, 0.02, (fi - 1) * 0.17, 0.995, 0.925);
  if (plqM) B(plqM, 0.42, 0.14, 0.03, 0, 0.865, 0.985, 0, 0, 0, -1);
  if (level >= 4) { B(glow, 0.05, 0.07, 0.05, -0.36, 0.875, 0.985); B(glow, 0.05, 0.07, 0.05, 0.36, 0.875, 0.985); }
  /* 弄堂底影壁+二道木门（全年代） */
  B(A.wall, 0.6, 0.34, 0.08, 0, 0.17, -1.24); B(A.band, 0.64, 0.03, 0.1, 0, 0.355, -1.24); B(A.door, 0.26, 0.26, 0.02, 0, 0.13, -1.21);
  /* 沿街铺房×2（弄堂口两翼）：木框橱窗+单坡篷+花箱；lv1 木板封窗+木箱；lv4 落地发光橱窗+灯箱；lv3+ 绿篷 */
  for (pi = 0; pi < 2; pi++) { px = pi ? 1.05 : -1.05;
    B(A.band, 0.42, 0.07, 0.44, px, 0.035, 1.03); B(A.wall, 0.4, 0.46, 0.42, px, 0.3, 1.03);
    B(A.roof, 0.46, 0.022, 0.52, px, 0.565, 1.01, -0.38, 0, 0); B(A.ridge, 0.48, 0.03, 0.03, px, 0.47, 1.25); WIN(A, 0.24, 0.22, px, 0.3, 1.243);
    if (level === 1) { B(A.wood, 0.28, 0.26, 0.02, px, 0.3, 1.25); B(A.wood, 0.14, 0.14, 0.14, px + 0.1, 0.07, 1.21); }
    else { var am = (pi && level >= 3) ? A.awnG : A.awn;
      B(am, 0.36, 0.016, 0.12, px, 0.46, 1.245, -0.5, 0, 0); B(am, 0.36, 0.05, 0.015, px, 0.405, 1.29);
      B(A.planter, 0.3, 0.08, 0.1, px, 0.09, 1.24); O(A.leaf2, 0.05, px - 0.09, 0.16, 1.24); O(A.leaf, 0.045, px + 0.02, 0.155, 1.25); O(A.moss, 0.04, px + 0.11, 0.15, 1.24);
      if (level >= 4) { B(glow, 0.24, 0.24, 0.015, px, 0.3, 1.256); B(signM, 0.3, 0.1, 0.02, px, 0.58, 1.26, 0, 0, 0, -1); } }
  }
  /* 两侧石库门组：前楼(山墙朝街)+后楼(山墙朝弄堂/背街)+灶披间+天井 */
  var cxs = [-1, 1], veg = [[-0.2, 0.16], [0.22, -0.1], [-0.05, -0.24], [0.15, 0.26]];
  for (bi = 0; bi < 2; bi++) {
    var s = cxs[bi], cx = s * 0.76;
    /* 前楼：山墙朝街，正脊沿弄堂；石勒脚+腰线+二层双窗+阁楼通风窗 */
    B(A.wall, 0.96, 0.8, 0.72, cx, 0.4, 0.46);
    GABLE(A.wall, 0.96, 0.26, 0.72, cx, 0.8, 0.46, 1); GABLE(A.wall, 0.96, 0.26, 0.72, cx, 0.8, 0.46, -1);
    ROOF(A, cx, 0.46, 0.96, 0.72, 0.8, 0.26);
    B(A.band, 0.98, 0.09, 0.03, cx, 0.045, 0.826); B(A.band, 0.98, 0.035, 0.025, cx, 0.455, 0.824);
    WIN(A, 0.16, 0.2, cx - 0.22, 0.63, 0.826); WIN(A, 0.16, 0.2, cx + 0.22, 0.63, 0.826);
    for (vi = 0; vi < 3; vi++) B(A.ridge, 0.07, 0.07, 0.015, cx + (vi - 1) * 0.13, 0.9, 0.822);
    if (level === 1) { /* 1990s：木门紧闭+木窗板+暖光高窗 */
      B(A.door, 0.28, 0.44, 0.03, cx - 0.2, 0.24, 0.826); WIN(A, 0.3, 0.26, cx + 0.22, 0.26, 0.826, 0, 1);
      B(A.glass, 0.12, 0.14, 0.045, cx + 0.22, 0.5, 0.826); B(glow, 0.1, 0.12, 0.05, cx + 0.22, 0.5, 0.826);
    } else { /* 2000s+：木框店面+暖光内景橱窗+雨篷(+檐下悬挂店招 lv3+) */
      B(A.wood, 0.05, 0.48, 0.045, cx - 0.45, 0.24, 0.828); B(A.wood, 0.05, 0.48, 0.045, cx - 0.13, 0.24, 0.828); B(A.wood, 0.05, 0.48, 0.045, cx + 0.45, 0.24, 0.828);
      B(A.wood, 0.94, 0.06, 0.045, cx, 0.5, 0.828); B(A.door, 0.22, 0.42, 0.025, cx + 0.29, 0.21, 0.832);
      B(glow, 0.24, 0.32, 0.02, cx - 0.29, 0.26, 0.836); B(glow, 0.24, 0.32, 0.02, cx + 0.05, 0.26, 0.836);
      B(A.awn, 0.9, 0.018, 0.22, cx, 0.51, 0.92, -0.55, 0, 0, 4); B(A.awn, 0.9, 0.055, 0.015, cx, 0.445, 1.015, 0, 0, 0, 4);
      if (level >= 3) { B(A.steel, 0.015, 0.015, 0.14, cx + 0.28, 0.5, 0.95); B(sign2, 0.28, 0.12, 0.02, cx + 0.28, 0.42, 1.018, 0, 0, 0, -1); } }
    B(A.band, 0.26, 0.024, 0.08, cx + 0.29, 0.012, 0.87);
    /* 前楼弄堂面：石库门门洞(石框+黑漆门+门楣+楣窗)+木窗(lv1 木插板)+竖幌(lv3+) */
    B(A.band, 0.028, 0.5, 0.3, s * 0.285, 0.26, 0.52); B(A.door, 0.016, 0.4, 0.22, s * 0.266, 0.21, 0.52);
    B(A.band, 0.034, 0.05, 0.34, s * 0.283, 0.53, 0.52);
    B(A.glass, 0.012, 0.09, 0.2, s * 0.277, 0.62, 0.52); B(A.band, 0.016, 0.02, 0.24, s * 0.281, 0.68, 0.52);
    WIN(A, 0.18, 0.2, s * 0.283, 0.42, 0.22, 1, level === 1);
    if (level >= 3) { B(A.steel, 0.05, 0.012, 0.014, s * 0.3, 0.8, 0.75); B(vsignM, 0.014, 0.3, 0.1, s * 0.305, 0.63, 0.75); }
    /* 前楼外山墙面：二层双窗+底层窗(lv1 木插板)+落水管+墙挂 AC(lv2+) */
    WIN(A, 0.16, 0.2, s * 1.245, 0.6, 0.3, 1); WIN(A, 0.16, 0.2, s * 1.245, 0.6, 0.62, 1);
    WIN(A, 0.18, 0.2, s * 1.245, 0.24, 0.62, 1, level === 1);
    Y(A.ridge, 0.011, 0.011, 0.78, 12, s * 1.252, 0.4, 0.14);
    if (level >= 2) ACW(A, s * 1.24, 0.3, 0.3, s);
    /* 后楼：低层，山墙朝弄堂/背街；弄堂面窗+门+壁灯(lv3+)、背街双窗+腰线勒脚、外山墙窗 */
    B(A.wall, 0.96, 0.72, 0.86, cx, 0.36, -0.71);
    GABLE(A.wall, 0.96, 0.22, 0.86, cx, 0.72, -0.71, 1); GABLE(A.wall, 0.96, 0.22, 0.86, cx, 0.72, -0.71, -1);
    ROOF(A, cx, -0.71, 0.96, 0.86, 0.72, 0.22);
    WIN(A, 0.14, 0.18, s * 0.287, 0.5, -0.55, 1); B(A.door, 0.03, 0.32, 0.22, s * 0.287, 0.17, -0.88);
    B(A.band, 0.034, 0.04, 0.26, s * 0.283, 0.35, -0.88);
    WIN(A, 0.14, 0.18, cx - 0.22, 0.44, -1.146); WIN(A, 0.14, 0.18, cx + 0.22, 0.44, -1.146);
    B(A.band, 0.98, 0.035, 0.025, cx, 0.42, -1.147); B(A.band, 0.98, 0.07, 0.03, cx, 0.035, -1.146); WIN(A, 0.1, 0.12, cx, 0.62, -1.148);
    WIN(A, 0.15, 0.18, s * 1.245, 0.5, -0.55, 1, level === 1); WIN(A, 0.15, 0.18, s * 1.245, 0.22, -0.55, 1, level === 1);
    if (level >= 3) { B(A.steel, 0.014, 0.014, 0.04, s * 0.292, 0.66, -0.5); B(glow, 0.03, 0.05, 0.032, s * 0.3, 0.625, -0.5); }
    if (level >= 2) ACW(A, s * 0.28, 0.58, -0.72, s);
    /* 灶披间：贴外墙单坡小屋（填天井）+弄堂面窗；其上「亭子间」平顶小间（弄堂面/外墙窗）+顶部天窗(lv3+)/盆栽(lv2+) */
    B(A.wall, 0.38, 0.36, 0.3, s * 1.05, 0.18, -0.09);
    B(A.roof, 0.44, 0.02, 0.36, s * 1.02, 0.4, -0.09, 0, 0, s * 0.34);
    B(A.ridge, 0.024, 0.035, 0.38, s * 0.81, 0.345, -0.09);
    B(A.band, 0.02, 0.16, 0.18, s * 0.87, 0.21, -0.06); B(A.glass, 0.012, 0.11, 0.13, s * 0.873, 0.21, -0.06);
    B(A.wall, 0.3, 0.3, 0.2, s * 1.08, 0.58, -0.16); B(A.ridge, 0.34, 0.02, 0.24, s * 1.08, 0.74, -0.16);
    WIN(A, 0.11, 0.12, s * 0.933, 0.6, -0.16, 1); WIN(A, 0.11, 0.12, s * 1.235, 0.6, -0.16, 1, level === 1);
    if (level >= 3) { B(A.steel, 0.14, 0.008, 0.12, s * 1.08, 0.755, -0.16); B(A.sky, 0.12, 0.01, 0.1, s * 1.08, 0.764, -0.16); }
    else if (level >= 2) { B(A.planter, 0.09, 0.05, 0.09, s * 1.0, 0.775, -0.1); O(A.leaf2, 0.04, s * 1.0, 0.83, -0.1); }
    /* 天井：石板地+院树+水缸；lv1 晾衣竿 → lv2+ 台阶盆栽 */
    B(A.alley, 0.56, 0.057, 0.36, s * 0.57, 0.0285, -0.1);
    Y(A.trunk, 0.014, 0.02, 0.4, 12, s * 0.44, 0.26, -0.14);
    S(A.leaf, 0.11, s * 0.44, 0.54, -0.14); O(A.leaf2, 0.08, s * 0.53, 0.63, -0.09);
    Y(A.ridge, 0.05, 0.042, 0.085, 12, s * 0.74, 0.1, 0.02);
    if (level === 1) { Y(A.trunk, 0.006, 0.006, 0.46, 12, s * 0.42, 0.95, -0.1, PI2, 0, 0);
      B(A.awn, 0.008, 0.1, 0.08, s * 0.42, 0.885, -0.19); B(A.door, 0.008, 0.085, 0.07, s * 0.42, 0.9, -0.02); }
    else { B(A.planter, 0.2, 0.07, 0.1, s * 0.44, 0.09, 0.04); O(A.leaf2, 0.045, s * 0.4, 0.165, 0.04); O(A.moss, 0.04, s * 0.48, 0.155, 0.04); }
    /* 弄堂沿边杂物：lv1 木箱+箩筐 → lv2 木箱+盆栽 → lv3+ 陶盆绿植×2 */
    if (level <= 2) { B(A.wood, 0.1, 0.08, 0.1, s * 0.35, 0.097, -0.3); Y(A.wood, 0.045, 0.038, 0.07, 12, s * 0.35, 0.092, -0.02); }
    if (level >= 2) { Y(A.planter, 0.04, 0.034, 0.07, 12, s * 0.345, 0.092, -0.62); O(A.leaf2, 0.045, s * 0.345, 0.16, -0.62); }
    if (level >= 3) { Y(A.planter, 0.04, 0.034, 0.07, 12, s * 0.345, 0.092, 0.0); O(A.leaf, 0.045, s * 0.345, 0.16, 0.0); }
    /* 烟囱（前楼脊+后楼脊，lv3+ 加烟囱帽）+ 屋面 AC/卫星锅/后楼外坡棚顶老虎窗（lv2-3，lv4 让位玻璃加建）+ 水箱 lv3+（均落坡贴地） */
    CHIM(A, cx - s * 0.06, 1.0, 0.28, level >= 3); CHIM(A, cx + s * 0.05, 0.9, -0.95, false);
    if (level === 2 || level === 3) { B(A.ridge, 0.1, 0.012, 0.08, cx + s * 0.28, 0.818, -0.5); B(A.steel, 0.09, 0.065, 0.07, cx + s * 0.28, 0.856, -0.5);
      Y(A.steel, 0.006, 0.006, 0.1, 12, cx - s * 0.28, 0.85, -1.02); Y(A.steel, 0.045, 0.045, 0.006, 12, cx - s * 0.28, 0.92, -1.0, 0.9, 0, 0);
      B(A.wall, 0.14, 0.11, 0.13, cx + s * 0.2, 0.86, -0.92); B(A.roof, 0.18, 0.016, 0.17, cx + s * 0.2, 0.93, -0.92, 0, 0, -s * 0.2); B(A.glass, 0.012, 0.07, 0.09, cx + s * 0.276, 0.86, -0.92); }
    if (level >= 3) { for (var wi = 0; wi < 4; wi++) Y(A.steel, 0.006, 0.006, 0.08, 12, s * 1.08 + (wi % 2 ? 0.05 : -0.05), 0.835, -0.95 + (wi < 2 ? 0.05 : -0.05)); Y(A.steel, 0.055, 0.055, 0.09, 12, s * 1.08, 0.925, -0.95); }
    /* 老虎窗 lv2+（前楼街坡） */
    if (level >= 2) for (di = 0; di < 2; di++) { dx = cx + (di ? 0.2 : -0.2);
      B(A.wall, 0.15, 0.13, 0.13, dx, 0.94, 0.64); TRI(A.ridge, 0.18, 0.07, 0.13, dx, 1.005, 0.575); B(A.glass, 0.09, 0.07, 0.012, dx, 0.94, 0.708); }
    /* 天窗 lv3（后楼坡面，钢框衬底；lv4 由玻璃加建取代） */
    if (level === 3) { B(A.steel, 0.18, 0.01, 0.26, cx - 0.24, 0.846, -0.95, 0, 0, 0.43); B(A.sky, 0.16, 0.014, 0.24, cx - 0.24, 0.858, -0.95, 0, 0, 0.43);
      B(A.steel, 0.18, 0.01, 0.26, cx + 0.24, 0.846, -0.38, 0, 0, -0.43); B(A.sky, 0.16, 0.014, 0.24, cx + 0.24, 0.858, -0.38, 0, 0, -0.43); }
    /* 屋顶加建：lv3 玻璃阳光房(黑框+基座+顶花池) → lv4 大面积钢架玻璃加建(透明顶+内透暖光+顶缘花池)+前楼玻璃阳光顶+露台 */
    if (level === 3) { B(A.steel, 0.44, 0.02, 0.48, cx, 0.965, -0.66); B(A.sky, 0.4, 0.2, 0.44, cx, 1.07, -0.66); B(glow, 0.3, 0.12, 0.34, cx, 1.03, -0.66);
      for (var q = 0; q < 4; q++) B(A.dark, 0.014, 0.2, 0.014, cx + (q % 2 ? 0.18 : -0.18), 1.07, -0.66 + (q < 2 ? 0.19 : -0.19));
      B(A.sky, 0.4, 0.012, 0.44, cx, 1.176, -0.66);
      B(A.dark, 0.014, 0.02, 0.44, cx - 0.13, 1.186, -0.66); B(A.dark, 0.014, 0.02, 0.44, cx + 0.13, 1.186, -0.66);
      B(A.dark, 0.42, 0.02, 0.016, cx, 1.186, -0.45); B(A.dark, 0.42, 0.02, 0.016, cx, 1.186, -0.87);
      B(A.planter, 0.16, 0.045, 0.08, cx + 0.1, 1.21, -0.47); O(A.leaf2, 0.04, cx + 0.1, 1.255, -0.47); }
    else if (level >= 4) {
      B(A.wall, 0.72, 0.16, 0.72, cx, 0.87, -0.66); B(A.steel, 0.72, 0.03, 0.72, cx, 0.965, -0.66);
      B(A.sky, 0.68, 0.32, 0.68, cx, 1.15, -0.66); B(glow, 0.56, 0.2, 0.56, cx, 1.1, -0.66);
      for (var q2 = 0; q2 < 5; q2++) { var mx = cx - 0.34 + q2 * 0.17; B(A.dark, 0.016, 0.32, 0.016, mx, 1.15, -0.33); B(A.dark, 0.016, 0.32, 0.016, mx, 1.15, -0.99); }
      B(A.dark, 0.7, 0.016, 0.016, cx, 1.15, -0.33); B(A.dark, 0.7, 0.016, 0.016, cx, 1.15, -0.99);
      B(A.dark, 0.016, 0.016, 0.68, cx - 0.34, 1.15, -0.66); B(A.dark, 0.016, 0.016, 0.68, cx + 0.34, 1.15, -0.66);
      B(A.sky, 0.68, 0.012, 0.68, cx, 1.318, -0.66);
      for (var q3 = 0; q3 < 3; q3++) B(A.dark, 0.016, 0.024, 0.68, cx + (q3 - 1) * 0.22, 1.331, -0.66);
      B(A.dark, 0.68, 0.024, 0.02, cx, 1.331, -0.33); B(A.dark, 0.68, 0.024, 0.02, cx, 1.331, -0.99);
      B(A.planter, 0.3, 0.05, 0.07, cx - 0.15, 1.35, -0.37); O(A.leaf2, 0.04, cx - 0.15, 1.4, -0.37);
      B(A.planter, 0.3, 0.05, 0.07, cx + 0.15, 1.35, -0.95); O(A.moss, 0.04, cx + 0.15, 1.395, -0.95);
      B(A.wall, 0.46, 0.14, 0.52, cx, 0.99, 0.44); B(A.sky, 0.46, 0.14, 0.52, cx, 1.13, 0.44); B(glow, 0.34, 0.08, 0.4, cx, 1.1, 0.44);
      for (var q4 = 0; q4 < 4; q4++) B(A.dark, 0.014, 0.16, 0.012, cx + (q4 % 2 ? 0.15 : -0.15), 1.13, 0.18 + (q4 < 2 ? 0 : 1) * 0.52);
      B(A.dark, 0.48, 0.016, 0.54, cx, 1.208, 0.44); B(A.wood, 0.46, 0.02, 0.52, cx, 1.226, 0.44);
      B(A.sky, 0.46, 0.11, 0.014, cx, 1.29, 0.7); B(A.sky, 0.014, 0.11, 0.52, cx - 0.23, 1.29, 0.44); B(A.sky, 0.014, 0.11, 0.52, cx + 0.23, 1.29, 0.44); B(A.sky, 0.46, 0.11, 0.014, cx, 1.29, 0.18);
      B(A.steel, 0.48, 0.012, 0.022, cx, 1.352, 0.7); B(A.steel, 0.022, 0.012, 0.54, cx - 0.23, 1.352, 0.44); B(A.steel, 0.022, 0.012, 0.54, cx + 0.23, 1.352, 0.44); B(A.steel, 0.48, 0.012, 0.022, cx, 1.352, 0.18);
      B(A.planter, 0.14, 0.05, 0.09, cx - 0.14, 1.26, 0.3); O(A.leaf2, 0.045, cx - 0.14, 1.31, 0.3);
      B(A.planter, 0.14, 0.05, 0.09, cx + 0.14, 1.26, 0.58); O(A.moss, 0.04, cx + 0.14, 1.305, 0.58);
      /* 街面外摆座（篷下小圆桌+双凳） */
      Y(A.dark, 0.05, 0.05, 0.012, 12, cx - s * 0.3, 0.2, 1.02); Y(A.dark, 0.008, 0.012, 0.14, 12, cx - s * 0.3, 0.125, 1.02);
      Y(A.dark, 0.03, 0.03, 0.016, 12, cx - s * 0.3 - 0.09, 0.15, 1.04); Y(A.dark, 0.006, 0.008, 0.09, 12, cx - s * 0.3 - 0.09, 0.1, 1.04);
      Y(A.dark, 0.03, 0.03, 0.016, 12, cx - s * 0.3 + 0.09, 0.15, 1.0); Y(A.dark, 0.006, 0.008, 0.09, 12, cx - s * 0.3 + 0.09, 0.1, 1.0); }
    /* 屋面植被（瓦缝青苔/探出树冠）逐年代加密；小球用二十面体控预算，大树冠用球 16×12 */
    for (mi = 0; mi < [1, 2, 3, 4][level - 1]; mi++) { O(mi % 2 ? A.moss : A.leaf, 0.065 + mi * 0.014, cx + veg[mi][0] * s, 1.0, 0.46 + veg[mi][1]);
      if (mi < [1, 1, 2, 3][level - 1]) O(A.moss, 0.05 + mi * 0.01, cx - veg[mi][0] * s, 0.86, -0.71 + veg[mi][1] * 1.4); }
    if (level >= 3) { S(A.leaf2, 0.085, cx - 0.3 * s, 1.12, 0.3); O(A.leaf, 0.055, cx + 0.42 * s, 0.78, -1.08); O(A.moss, 0.05, cx + 0.4 * s, 0.86, 0.2); }
  }
  /* 过街楼：跨弄堂小楼（弄堂后段，连接两侧后楼；山墙朝弄堂、正脊沿 x；博风/封檐/两面窗；底净空 0.56） */
  B(A.wall, 0.66, 0.3, 0.3, 0, 0.71, -0.95);
  GABLE(A.wall, 0.66, 0.1, 0.3, 0, 0.86, -0.95, 1); GABLE(A.wall, 0.66, 0.1, 0.3, 0, 0.86, -0.95, -1);
  B(A.roof, 0.72, 0.024, 0.24, 0, 0.91, -1.028, -0.588, 0, 0); B(A.roof, 0.72, 0.024, 0.24, 0, 0.91, -0.872, 0.588, 0, 0);
  B(A.ridge, 0.74, 0.05, 0.09, 0, 0.968, -0.95); B(A.ridge, 0.74, 0.045, 0.028, 0, 0.852, -1.128); B(A.ridge, 0.74, 0.045, 0.028, 0, 0.852, -0.772);
  B(A.ridge, 0.034, 0.052, 0.22, -0.368, 0.926, -1.028, -0.588, 0, 0); B(A.ridge, 0.034, 0.052, 0.22, 0.368, 0.926, -1.028, -0.588, 0, 0);
  B(A.ridge, 0.034, 0.052, 0.22, -0.368, 0.926, -0.872, 0.588, 0, 0); B(A.ridge, 0.034, 0.052, 0.22, 0.368, 0.926, -0.872, 0.588, 0, 0);
  WIN(A, 0.16, 0.14, 0, 0.7, -0.797); WIN(A, 0.16, 0.14, 0, 0.7, -1.103);
  /* 街道家具：行道树(层叠树冠+树池)×4（前排三簇球冠、后排两簇）+ 路灯 lv3+ */
  var ts = [0.85, 0.92, 1, 1.08][level - 1], tp = [[0.62, 1.12], [-0.62, 1.12], [1.08, -1.1], [-1.08, -1.1]];
  for (ti = 0; ti < 4; ti++) { var tx = tp[ti][0], tz = tp[ti][1];
    B(A.ridge, 0.15, 0.006, 0.15, tx, 0.054, tz); Y(A.trunk, 0.024, 0.034, 0.3, 12, tx, 0.2, tz);
    S(A.leaf, 0.15 * ts, tx, 0.48 * ts + 0.04, tz);
    if (ti < 2) { S(A.leaf2, 0.11 * ts, tx + 0.08, 0.6 * ts + 0.04, tz - 0.04); S(A.leaf, 0.09 * ts, tx - 0.09, 0.58 * ts + 0.03, tz + 0.05); O(A.leaf2, 0.07 * ts, tx + 0.02, 0.72 * ts + 0.03, tz - 0.02); }
    else { O(A.leaf2, 0.11 * ts, tx + 0.08, 0.6 * ts + 0.04, tz - 0.04); O(A.leaf, 0.09 * ts, tx - 0.09, 0.58 * ts + 0.03, tz + 0.05); } }
  if (level >= 3) for (li = 0; li < 2; li++) { var lx = li ? 0.24 : -0.24;
    Y(A.steel, 0.012, 0.016, 0.56, 12, lx, 0.31, 0.66); B(A.steel, 0.05, 0.03, 0.05, lx, 0.045, 0.66);
    B(A.steel, 0.02, 0.02, 0.1, lx, 0.6, 0.71); B(glow, 0.08, 0.035, 0.06, lx, 0.585, 0.77); }
  flush(g);
  g.userData.anim = [function (t) { glow.emissiveIntensity = (level >= 3 ? 0.5 : 0.18) + 0.15 * (0.5 + 0.5 * Math.sin(t * 1.4)); }];
  if (level >= 3) g.userData.anim.push(function (t) { var s2 = 0.5 + 0.5 * Math.sin(t * 1.05);
    if (signM) signM.emissiveIntensity = (level >= 4 ? 0.5 : 0.06) + 0.22 * s2; if (plqM) plqM.emissiveIntensity = (level >= 4 ? 0.6 : 0.05) + 0.25 * s2;
    if (sign2) sign2.emissiveIntensity = 0.05 + 0.1 * s2; if (vsignM) vsignM.emissiveIntensity = (level >= 4 ? 0.4 : 0.05) + 0.15 * s2; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[8] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
