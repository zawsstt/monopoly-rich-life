/* 大富翁·现代写实棋盘（沪）格 6「武康路」—— 武康大楼船首转角楼 + 双街交汇 + 环绕里弄肌理，四年代演进（R1-R3 结构精修）
 * 契约：window.Props3DModern[6](level 1..4) → Group，全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z（45° 机位在 +x+z 象限）。
 * 视觉基准 refs/modern/prop_6.png：街区转角 6 层船首弧形砖楼（弧形转角朝街心、每层铁艺栏杆阳台、奶油色层间线脚/檐口），
 *   两翼较短，沿正面街 + 右侧街被 2-3 层里弄坡顶房环绕（陶土瓦/石板瓦/白墙，烟囱/老虎窗/披屋），转角圆弧路缘 + 斑马线；
 *   lv1 1990s 石材拱廊+木百叶+褪色斑马线+水箱；lv2 2000s 加层+绿布篷橱窗+屋顶披屋/露台花箱+路灯+1 车+车道线；
 *   lv3 2010s 深框落地玻璃+店招+白盒屋顶加建（主楼+里弄）+双斑马线+3 车+井盖；lv4 2020s 玻璃阳光房+钢架葡萄架+
 *   拆旧建新玻璃塔楼（全街最高，如参考 2020 象限）+屋顶花园+5 车+花箱+双灯箱。
 * 工程：手写合并（同材质单 mesh，mesh=材质数 17/21/22/24 ≤ 基线+6）；Canvas ≤256；零 Math.random；动画 ≤2 项；圆柱 12 段。
 * R1：布局重构（L 形转角楼/双街/圆角路缘/后排肌理/分层树冠/年代结构演进）；R2：拱廊/阳台栏杆/店招/屋顶设备；R3：短翼露出环绕肌理 + 檐口上坡瓦檐 + 船首锥帽 + 5 开间窗套立面 + 两街连续树列。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_6] THREE 未定义'); return; }
var PI = Math.PI, _mc = {}, _t = {}, BK;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function mk(h, o, fresh) { o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + o.em + '|' + o.ei + '|' + (o.map ? o.map.uuid : '') + '|' + o.op;
  if (!fresh && _mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) m.map = o.map; if (o.op) { m.transparent = true; m.opacity = o.op; }
  return fresh ? m : (_mc[k] = m); }
function M(h, o) { return mk(h, o); } function MF(h, o) { return mk(h, o, 1); }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function T(k, S, seed, draw) { if (!_t[k]) { var c = cv(S, S), R = lcg(seed); draw(c.getContext('2d'), S, R); _t[k] = TX(c); } return _t[k]; }
function specks(g, S, R, n, a, b) { for (var i = 0; i < n; i++) { g.fillStyle = R() > 0.5 ? a : b; g.fillRect(R() * S, R() * S, 1 + R() * 3, 1 + R() * 2); } }
function texBrick() { return T('brick', 128, 606, function (g, S, R) { /* 红砖：顺砖错缝 + 砖面色差 + 缝阴影/高光 + 风化渍 */
  g.fillStyle = '#d8ccb8'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 16) for (var x = (y / 16) % 2 ? -16 : 0; x < S; x += 32) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '128,64,44' : '235,210,190') + ',' + (0.10 + R() * 0.20).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 12); }
  for (var y2 = 0; y2 < S; y2 += 16) { g.fillStyle = 'rgba(62,44,36,0.62)'; g.fillRect(0, y2, S, 2); g.fillStyle = 'rgba(255,246,230,0.3)'; g.fillRect(0, y2 + 2, S, 1);
    for (var x2 = (y2 / 16) % 2 ? 0 : 16; x2 < S; x2 += 32) { g.fillStyle = 'rgba(62,44,36,0.55)'; g.fillRect(x2, y2, 2, 16); } }
  for (var i = 0; i < 8; i++) { g.fillStyle = 'rgba(40,26,20,0.12)'; g.fillRect(R() * S, 0, 3 + R() * 6, S * (0.4 + R() * 0.6)); }
  specks(g, S, R, 80, 'rgba(58,36,28,0.32)', 'rgba(250,240,224,0.35)'); }); }
function texTile() { return T('tile', 128, 618, function (g, S, R) { /* 陶土筒瓦：瓦垄列 + 搭接横缝 + 苔痕 */
  g.fillStyle = '#cfc0b0'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,246,232,0.28)'; g.fillRect(x + 1, 0, 4, S); g.fillStyle = 'rgba(58,44,40,0.5)'; g.fillRect(x + 7, 0, 4, S); g.fillStyle = 'rgba(40,32,30,0.5)'; g.fillRect(x + 15, 0, 1, S); }
  for (var y = 8; y < S; y += 20) { g.fillStyle = 'rgba(48,36,34,0.45)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,244,228,0.18)'; g.fillRect(0, y + 2, S, 1);
    for (var x2 = 0; x2 < S; x2 += 16) if (R() > 0.55) { g.fillStyle = R() > 0.5 ? 'rgba(52,40,36,0.2)' : 'rgba(240,226,206,0.16)'; g.fillRect(x2, y + 3, 16, 17); } }
  for (var i = 0; i < 7; i++) { g.fillStyle = 'rgba(78,100,54,0.35)'; g.fillRect(R() * S, R() * S, 3 + R() * 6, 2 + R() * 3); }
  specks(g, S, R, 46, 'rgba(44,34,30,0.3)', 'rgba(240,228,208,0.25)'); }); }
function texAsph() { return T('asph', 128, 630, function (g, S, R) { g.fillStyle = '#c9c9c9'; g.fillRect(0, 0, S, S); specks(g, S, R, 240, 'rgba(30,30,34,0.32)', 'rgba(255,255,255,0.2)');
  g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 24, S, 22); g.fillRect(0, 78, S, 22);
  for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(20,20,24,0.38)'; g.fillRect(R() * S, R() * S, 1, 10 + R() * 30); } }); }
function texPave() { return T('pave', 128, 642, function (g, S, R) { g.fillStyle = '#d6d1c8'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 32) for (var x = 0; x < S; x += 32) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '84,78,70' : '255,255,255') + ',' + (0.08 + R() * 0.16).toFixed(2) + ')'; g.fillRect(x, y, 32, 32); g.fillStyle = 'rgba(70,64,58,0.7)'; g.fillRect(x, y, 32, 2); g.fillRect(x, y, 2, 32); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x + 2, y + 2, 30, 1); }
  specks(g, S, R, 60, 'rgba(70,64,58,0.25)', 'rgba(255,255,255,0.3)'); }); }
function texAwn() { return T('awn', 64, 654, function (g, S, R) { g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, 0, 8, S); }
  for (var y = 0; y < S; y += 3) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, S, 1); } specks(g, S, R, 30, 'rgba(0,0,0,0.12)', 'rgba(255,255,255,0.2)'); }); }
function signTex(txt, bg, fg) { var k = 's' + txt + bg + fg; if (_t[k]) return _t[k]; var c = cv(256, 64), g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 38px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34); return (_t[k] = TX(c)); }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function uvS(g, u, v) { if (u || v) { var a = g.attributes.uv, i; for (i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * (u || 1), a.getY(i) * (v || 1)); } return g; }
function boxUV(g, w, h, d, s) { var a = g.attributes.uv, dm = [d, h, d, h, w, d, w, d, w, h, w, h]; for (var i = 0; i < 24; i++) a.setXY(i, a.getX(i) * dm[(i >> 2) * 2] * s, a.getY(i) * dm[(i >> 2) * 2 + 1] * s); return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz, s) { var g = new THREE.BoxGeometry(w, h, d); if (m.map && s !== -1) boxUV(g, w, h, d, s || 2.2); put(m, xf(g, x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, sg, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, sg || 12), x, y, z, rx, ry, rz)); }
function CY(r, h, a0, al, op) { return new THREE.CylinderGeometry(r, r, h, 12, 1, !!op, a0, al); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function A2(m, geo, x, y, z, u, v) { put(m, xf(uvS(geo, u, v), x, y, z)); }
function TRI(m, w, h, d, x, y, z) { var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); A2(m, new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), x, y, z, 2.2, 2.2); }
function flush(g) { for (var k in BK) { var b = BK[k], gs = b.gs, P = 0, i;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) { pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o);
      if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length; }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
    var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms); } }
/* ---- 武康路四年代 ---- */
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_6_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = level;
  BK = {}; var N = [3, 4, 5, 6][level - 1], FH = [0.4, 0.36, 0.36, 0.36][level - 1], H = 0.06 + N * FH, HM = [1, 1.1, 1.25, 1.35][level - 1];
  var A = {
    asph: M('#9c9a98', { map: texAsph(), rg: 0.96 }), line: M(level === 1 ? '#b3ab9a' : '#eae6d6', { rg: 0.7 }),
    sw: M('#d8d2c6', { map: texPave(), rg: 0.9 }), stone: M('#b6ada0', { map: texPave(), rg: 0.85 }),
    brick: M('#d8a082', { map: texBrick(), rg: 0.9 }), band: M('#f2ead9', { map: texPave(), rg: 0.8 }),
    glass: M('#4a5661', { rg: 0.12, mt: 0.65 }), win: M('#6b7886', { rg: 0.25, mt: 0.2 }), tile: M('#dc9c78', { map: texTile(), rg: 0.75 }), slate: M('#77848f', { map: texTile(), rg: 0.8 }),
    white: M('#ece7e0', { rg: 0.85 }), wood: M('#6a4e33', { rg: 0.8 }), metal: M('#474d53', { rg: 0.4, mt: 0.85 }),
    trunk: M('#5c4936', { rg: 0.9 }), leaf: M('#587332', { rg: 0.95 }), leaf2: M('#76943f', { rg: 0.95 }),
    awn: M('#3f7a6e', { map: texAwn(), rg: 0.9 }), car: M('#3f4340', { rg: 0.35, mt: 0.6 }), carW: M('#c9c8c2', { rg: 0.35, mt: 0.6 }),
    carS: M('#9aa0a5', { rg: 0.3, mt: 0.65 }), tire: M('#232629', { rg: 0.9 }), sky: M('#8fa6b4', { rg: 0.08, mt: 0.5, op: 0.55 })
  };
  var glow = MF('#2e2620', { rg: 0.4, em: '#ffbe6e', ei: 0.5 }), lampM = MF('#ffe2ac', { rg: 0.4, em: '#ffd9a0', ei: 0.75 });
  var signM = level >= 3 ? MF('#f2ead8', { map: signTex('武康路', '#26343a', '#ffd98c'), em: '#ffcf8e', ei: level >= 4 ? 0.8 : 0.15, rg: 0.5 }) : null;
  /* 地面：正面街 + 右侧街（交汇于 +x+z 角）+ 街区内块 + 人行道 + 转角圆弧路缘 + 年代标线 */
  B(A.asph, 2.6, 0.05, 0.58, 0, 0.025, 1.01); B(A.asph, 0.58, 0.05, 2.02, 1.01, 0.025, -0.29); B(A.asph, 0.22, 0.05, 0.22, 0.61, 0.025, 0.61); B(A.stone, 1.8, 0.06, 1.8, -0.4, 0.03, -0.4);
  B(A.sw, 1.8, 0.09, 0.22, -0.4, 0.045, 0.61); B(A.sw, 0.22, 0.09, 1.8, 0.61, 0.045, -0.4); A2(A.sw, CY(0.22, 0.09, 0, PI / 2, false), 0.5, 0.045, 0.5, 3, 1.5);
  if (level === 1) { for (var z1 = 0; z1 < 4; z1++) B(A.line, 0.07, 0.01, 0.42, -0.86 + z1 * 0.12, 0.055, 1.01); }
  else { for (var z2 = 0; z2 < 6; z2++) B(A.line, 0.07, 0.01, 0.5, -0.89 + z2 * 0.115, 0.055, 1.01);
    for (var d1 = 0; d1 < 5; d1++) B(A.line, 0.2, 0.01, 0.05, -1.2 + d1 * 0.34, 0.055, 1.01);
    for (var d2 = 0; d2 < 4; d2++) B(A.line, 0.05, 0.01, 0.2, 1.01, 0.055, -1.18 + d2 * 0.34); }
  if (level >= 3) { for (var z3 = 0; z3 < 6; z3++) B(A.line, 0.5, 0.01, 0.07, 1.01, 0.055, -0.89 + z3 * 0.115); B(A.line, 0.04, 0.01, 0.44, 0.42, 0.055, 1.01);
    Y(A.metal, 0.032, 0.032, 0.008, 12, -0.2, 0.052, 1.12); Y(A.metal, 0.028, 0.028, 0.008, 12, 1.12, 0.052, 0.15); }
  /* 主楼：短翼 L 形转角楼（前翼 x -0.85..0.5 / 右翼 z -0.62..0.18）+ 船首弧形转角朝街心；层间线脚 + 奶油窗套/窗台 + 弧形阳台栏杆 */
  B(A.brick, 1.35, H, 0.64, -0.175, 0.06 + H / 2, 0.18); B(A.brick, 0.64, H, 0.8, 0.18, 0.06 + H / 2, -0.22);
  A2(A.brick, CY(0.32, H, 0, PI / 2, false), 0.18, 0.06 + H / 2, 0.18, PI * 0.32 * 2.2, H * 2.2);
  for (var f = 0; f < N; f++) {
    var yc = 0.06 + f * FH + FH * 0.55, yb = 0.06 + (f + 1) * FH;
    B(A.band, 1.37, 0.03, 0.68, -0.175, yb, 0.18); A2(A.band, CY(0.335, 0.03, 0, PI / 2, false), 0.18, yb, 0.18, 2.1, 0.2); B(A.band, 0.68, 0.03, 0.82, 0.18, yb, -0.22);
    if (f > 0) {
      for (var i = 0; i < 5; i++) { var x = -0.75 + i * 0.2; B(A.band, 0.17, 0.28, 0.02, x, yc, 0.495); B(A.win, 0.13, 0.24, 0.03, x, yc, 0.5); B(A.band, 0.17, 0.022, 0.05, x, yc - 0.14, 0.51); B(A.metal, 0.15, 0.06, 0.01, x, yc - 0.1, 0.53);
        if (level === 1 && i === 1) { B(A.wood, 0.05, 0.24, 0.02, x - 0.105, yc, 0.505); B(A.wood, 0.05, 0.24, 0.02, x + 0.105, yc, 0.505); } }
      for (var p = 0; p < 3; p++) { var a = 0.45 + p * 0.34; B(A.band, 0.17, 0.28, 0.02, 0.18 + Math.sin(a) * 0.33, yc, 0.18 + Math.cos(a) * 0.33, 0, a, 0); B(A.win, 0.13, 0.24, 0.03, 0.18 + Math.sin(a) * 0.335, yc, 0.18 + Math.cos(a) * 0.335, 0, a, 0); }
      for (var j = 0; j < 3; j++) { var z = -0.48 + j * 0.22; B(A.band, 0.02, 0.28, 0.19, 0.495, yc, z); B(A.win, 0.03, 0.24, 0.15, 0.5, yc, z); B(A.band, 0.05, 0.022, 0.19, 0.51, yc - 0.14, z); B(A.metal, 0.01, 0.06, 0.17, 0.53, yc - 0.1, z); }
      var yba = yc - 0.13; A2(A.band, CY(0.375, 0.022, 0, PI / 2, false), 0.18, yba, 0.18, 2.3, 0.2); A2(A.metal, CY(0.375, 0.1, 0, PI / 2, true), 0.18, yba + 0.06, 0.18); A2(A.metal, CY(0.382, 0.014, 0, PI / 2, true), 0.18, yba + 0.11, 0.18);
    }
  }
  B(A.band, 1.39, 0.04, 0.7, -0.175, H + 0.005, 0.18); A2(A.band, CY(0.35, 0.04, 0, PI / 2, false), 0.18, H + 0.005, 0.18, 2.2, 0.3); B(A.band, 0.7, 0.04, 0.84, 0.18, H + 0.005, -0.22);
  /* 底层：lv1 石材拱廊（拱形暗洞口 + 壁柱）；lv2 暖光橱窗 + 绿布篷；lv3+ 深金属框落地玻璃 + 店招 */
  var ARC = function (r) { return xf(CY(r, 0.035, -PI / 2, PI, false), 0, 0, 0, -PI / 2, 0, 0); };
  if (level === 1) {
    B(A.stone, 1.03, 0.42, 0.03, -0.335, 0.27, 0.505); A2(A.stone, CY(0.325, 0.42, 0, PI / 2, true), 0.18, 0.27, 0.18, 2.2, 0.9); B(A.stone, 0.03, 0.42, 0.8, 0.505, 0.27, -0.22);
    for (var pi = 0; pi < 4; pi++) B(A.stone, 0.09, 0.42, 0.06, -0.8 + pi * 0.2, 0.27, 0.515);
    for (var ao = 0; ao < 3; ao++) { var ax1 = -0.7 + ao * 0.2, om = ao === 1 ? glow : A.wood; B(om, 0.16, 0.26, 0.03, ax1, 0.19, 0.51); A2(om, ARC(0.08), ax1, 0.32, 0.51); }
    for (var pr = 0; pr < 2; pr++) { var aa = 0.5 + pr * 0.57, px = 0.18 + Math.sin(aa) * 0.32, pz = 0.18 + Math.cos(aa) * 0.32;
      B(A.wood, 0.22, 0.26, 0.03, px, 0.19, pz, 0, aa, 0); A2(A.wood, xf(ARC(0.11), 0, 0, 0, 0, aa, 0), px, 0.32, pz); }
    for (var ar = 0; ar < 2; ar++) { var az = -0.18 - ar * 0.3; B(A.wood, 0.03, 0.26, 0.22, 0.51, 0.19, az); A2(A.wood, xf(ARC(0.11), 0, 0, 0, 0, PI / 2, 0), 0.51, 0.32, az); }
  } else {
    B(glow, 0.18, 0.3, 0.03, -0.7, 0.24, 0.5); B(glow, 0.18, 0.3, 0.03, -0.5, 0.24, 0.5); B(glow, 0.18, 0.3, 0.03, -0.3, 0.24, 0.5); B(A.wood, 0.14, 0.31, 0.03, 0.04, 0.215, 0.5);
    A2(glow, CY(0.33, 0.31, 0, PI / 2, false), 0.18, 0.215, 0.18); B(glow, 0.03, 0.3, 0.36, 0.5, 0.24, -0.3);
    if (level === 2) { B(A.metal, 1.03, 0.035, 0.04, -0.335, 0.45, 0.5); for (var ai = 0; ai < 3; ai++) { var ax = -0.7 + ai * 0.2; B(A.awn, 0.19, 0.015, 0.24, ax, 0.5, 0.6, -0.5, 0, 0); B(A.awn, 0.19, 0.05, 0.014, ax, 0.45, 0.705); }
      for (var ap = 0; ap < 2; ap++) { var apa = 0.5 + ap * 0.57; B(A.awn, 0.24, 0.014, 0.2, 0.18 + Math.sin(apa) * 0.4, 0.49, 0.18 + Math.cos(apa) * 0.4, -0.5, apa, 0); } }
    if (level >= 3) { B(A.metal, 1.03, 0.065, 0.03, -0.335, 0.4325, 0.505); B(signM, 0.6, 0.065, 0.045, -0.5, 0.4325, 0.515, 0, 0, 0, -1);
      for (var mi = 0; mi < 4; mi++) B(A.metal, 0.02, 0.31, 0.03, -0.8 + mi * 0.2, 0.24, 0.505); }
  }
  /* 屋面：奶油檐口之上一圈陶瓦坡屋面（船首处四分之一锥帽）+ 内侧瓦屋面 + 水箱/空调 + 年代加建（lv1 披屋 → lv2 披屋+露台花箱 → lv3 白盒加建 → lv4 玻璃阳光房+钢架葡萄架+花园） */
  B(A.tile, 1.37, 0.03, 0.66, -0.175, H + 0.015, 0.18); A2(A.tile, CY(0.335, 0.03, 0, PI / 2, false), 0.18, H + 0.015, 0.18, 2.1, 0.2); B(A.tile, 0.66, 0.03, 0.82, 0.18, H + 0.015, -0.22);
  B(A.tile, 1.39, 0.02, 0.18, -0.175, H + 0.06, 0.43, 0.55, 0, 0); B(A.tile, 0.73, 0.02, 0.18, -0.485, H + 0.06, -0.065, -0.55, 0, 0); B(A.tile, 0.18, 0.02, 0.66, -0.775, H + 0.06, 0.18, 0, 0, 0.55);
  B(A.tile, 0.18, 0.02, 0.82, 0.43, H + 0.06, -0.22, 0, 0, -0.55); B(A.tile, 0.68, 0.02, 0.18, 0.18, H + 0.06, -0.55, -0.55, 0, 0); B(A.tile, 0.18, 0.02, 0.5, -0.07, H + 0.06, -0.38, 0, 0, 0.55);
  A2(A.tile, new THREE.CylinderGeometry(0.2, 0.35, 0.09, 12, 1, true, 0, PI / 2), 0.18, H + 0.06, 0.18, 2, 0.3); B(A.brick, 0.12, 0.05, 0.12, 0.38, H + 0.055, 0.4); Y(A.slate, 0.055, 0.055, 0.1, 12, 0.38, H + 0.11, 0.4);
  if (level === 1) { B(A.brick, 0.4, 0.2, 0.28, -0.55, H + 0.13, 0.08); B(A.band, 0.42, 0.02, 0.3, -0.55, H + 0.24, 0.08); B(A.glass, 0.12, 0.08, 0.02, -0.55, H + 0.13, 0.225); }
  else { B(A.brick, 0.44, 0.26, 0.3, -0.55, H + 0.16, 0.08); B(A.band, 0.46, 0.02, 0.32, -0.55, H + 0.29, 0.08); B(A.glass, 0.14, 0.1, 0.02, -0.55, H + 0.16, 0.235); B(A.metal, 0.1, 0.06, 0.1, -0.72, H + 0.06, 0.4); B(A.metal, 0.1, 0.06, 0.1, 0.4, H + 0.06, -0.52);
    for (var gi = 0; gi < 3; gi++) { B(A.band, 0.12, 0.06, 0.1, 0.05 - gi * 0.2, H + 0.06, 0.4); O(A.leaf2, 0.05, 0.05 - gi * 0.2, H + 0.11, 0.4); } }
  if (level >= 3) { B(A.white, 0.56, 0.26, 0.36, 0.18, H + 0.16, -0.31); B(A.glass, 0.02, 0.12, 0.28, 0.465, H + 0.16, -0.31); B(A.band, 0.58, 0.02, 0.38, 0.18, H + 0.29, -0.31); }
  if (level >= 4) { B(A.sky, 0.46, 0.2, 0.3, -0.55, H + 0.16, 0.08); B(A.metal, 0.48, 0.015, 0.32, -0.55, H + 0.06, 0.08); B(A.metal, 0.48, 0.015, 0.32, -0.55, H + 0.265, 0.08);
    O(A.leaf2, 0.05, 0.25, H + 0.07, 0.4); O(A.leaf2, 0.045, 0.42, H + 0.07, -0.05);
    for (var pg = 0; pg < 4; pg++) Y(A.metal, 0.007, 0.007, 0.16, 12, 0.22 + (pg % 2) * 0.24, H + 0.11, 0.0 + (pg >> 1) * 0.3);
    B(A.metal, 0.02, 0.014, 0.34, 0.22, H + 0.195, 0.15); B(A.metal, 0.02, 0.014, 0.34, 0.46, H + 0.195, 0.15); O(A.leaf2, 0.06, 0.34, H + 0.23, 0.15); }
  /* 环绕里弄肌理 ×7（左排 L1/L2/L3 临正面街 / 中排 M1-M2 / 右排 R1a-R1b 临右侧街，逐年代长高 ×HM）：砖/白墙 + 陶土瓦/石板瓦/平顶 + 烟囱/老虎窗/披屋 → lv3 白盒加建 → lv4 拆 M2 建玻璃塔 */
  var HS = [[-1.06, 0.2, 0.4, 0.56, 0.85, 0, 0], [-0.95, -0.42, 0.62, 0.56, 0.95, 1, 0], [-0.95, -0.98, 0.62, 0.52, 0.7, 0, 1], [-0.38, -0.44, 0.44, 0.56, 0.9, 0, 0], [-0.38, -1.02, 0.4, 0.48, 0.75, 1, 0], [0.2, -0.76, 0.6, 0.26, 0.8, 1, 2], [0.2, -1.05, 0.6, 0.28, 0.66, 0, 0]], HW = [];
  for (var hi = 0; hi < HS.length; hi++) { var s = HS[hi], wm = s[5] ? A.white : A.brick, hh = s[4] * HM, hw = 0.06 + hh; HW.push(hw); if (level >= 4 && hi === 4) continue;
    B(wm, s[2], hh, s[3], s[0], 0.06 + hh / 2, s[1]);
    for (var wf = 0; wf < Math.floor(hh / 0.32); wf++) { var wy = 0.26 + wf * 0.32, sz = s[3] * 0.22, fz = s[1] + s[3] / 2; B(A.band, 0.14, 0.17, 0.014, s[0] - s[2] * 0.22, wy, fz + 0.002); B(A.band, 0.14, 0.17, 0.014, s[0] + s[2] * 0.22, wy, fz + 0.002);
      B(A.win, 0.11, 0.14, 0.02, s[0] - s[2] * 0.22, wy, fz + 0.005); B(A.win, 0.11, 0.14, 0.02, s[0] + s[2] * 0.22, wy, fz + 0.005);
      B(A.win, 0.02, 0.14, 0.1, s[0] - s[2] / 2 - 0.005, wy, s[1]); B(A.win, 0.02, 0.14, 0.1, s[0] + s[2] / 2 + 0.005, wy, s[1] + sz); B(A.win, 0.02, 0.14, 0.1, s[0] + s[2] / 2 + 0.005, wy, s[1] - sz); }
    B(A.wood, 0.1, 0.19, 0.02, s[0], 0.155, s[1] + s[3] / 2 + 0.005); if (hi >= 5) B(A.wood, 0.02, 0.19, 0.1, s[0] + s[2] / 2 + 0.005, 0.155, s[1]);
    if (s[6] === 2) { B(A.band, s[2] + 0.04, 0.05, s[3] + 0.04, s[0], hw + 0.025, s[1]); B(A.tile, s[2] - 0.04, 0.02, s[3] - 0.04, s[0], hw + 0.065, s[1]); }
    else { var rm = s[6] ? A.slate : A.tile;
      B(rm, s[2] + 0.06, 0.022, s[3] * 0.72, s[0], hw + 0.05, s[1] - s[3] * 0.26, -0.5, 0, 0); B(rm, s[2] + 0.06, 0.022, s[3] * 0.72, s[0], hw + 0.05, s[1] + s[3] * 0.26, 0.5, 0, 0);
      Y(rm, 0.018, 0.018, s[2] - 0.06, 12, s[0], hw + 0.1, s[1], 0, 0, PI / 2); TRI(wm, s[2] - 0.06, s[3] * 0.28, 0.03, s[0], hw, s[1] - s[3] / 2 + 0.005); TRI(wm, s[2] - 0.06, s[3] * 0.28, 0.03, s[0], hw, s[1] + s[3] / 2 - 0.035); } }
  B(A.brick, 0.07, 0.18, 0.07, -0.95, HW[0] + 0.08, 0.2); B(A.brick, 0.07, 0.16, 0.07, -0.25, HW[3] + 0.08, -0.44);
  if (level >= 2) { B(A.brick, 0.3, 0.22, 0.24, -0.95, HW[1] + 0.05, -0.42); B(A.glass, 0.1, 0.02, 0.12, -0.45, HW[3] + 0.07, -0.294, 0.5, 0, 0); B(A.slate, 0.26, 0.2, 0.2, -0.95, HW[2] + 0.06, -0.98); }
  if (level >= 3) { B(A.white, 0.3, 0.2, 0.3, -1.06, HW[0] + 0.14, 0.2); B(A.glass, 0.18, 0.1, 0.02, -1.06, HW[0] + 0.15, 0.375); B(A.white, 0.34, 0.22, 0.2, 0.2, HW[5] + 0.16, -0.76); B(A.band, 0.36, 0.02, 0.22, 0.2, HW[5] + 0.28, -0.76); }
  if (level >= 4) { B(A.win, 0.38, 2.44, 0.42, -0.38, 0.06 + 1.22, -1.02); for (var tb = 1; tb <= 7; tb++) B(A.metal, 0.4, 0.014, 0.44, -0.38, 0.06 + tb * 0.34, -1.02);
    B(A.metal, 0.41, 0.02, 0.45, -0.38, 2.51, -1.02); O(A.leaf2, 0.05, -0.3, 2.53, -0.95); O(A.leaf2, 0.04, -0.46, 2.53, -1.1);
    B(A.white, 0.36, 0.2, 0.34, -0.95, HW[2] + 0.14, -0.98); O(A.leaf2, 0.05, 0.05, HW[5] + 0.1, -0.7); O(A.leaf, 0.04, 0.35, HW[5] + 0.1, -0.82); }
  /* 梧桐行道树 ×8-10（两街连续树列）：主干 + 三层树冠，逐年代茂密，冠幅按序号微变 */
  var TXP = [[-1.1, 0.62], [-0.61, 0.62], [-0.07, 0.62], [0.62, -0.12], [0.62, -0.64], [0.62, -1.08], [-0.88, 0.62], [0.62, -0.38], [-0.34, 0.62], [0.62, -0.88]];
  var NT = [8, 9, 10, 10][level - 1], cr0 = [0.13, 0.15, 0.17, 0.18][level - 1];
  for (var ti = 0; ti < NT; ti++) { var tx = TXP[ti], cr = cr0 * (0.9 + 0.1 * (ti % 3)); Y(A.trunk, 0.025, 0.035, 0.56, 12, tx[0], 0.37, tx[1]);
    O(A.leaf, cr, tx[0], 0.7 + cr * 0.5, tx[1]); O(A.leaf2, cr * 0.7, tx[0] + cr * 0.4, 0.74 + cr * 0.8, tx[1] + cr * 0.15); O(A.leaf, cr * 0.5, tx[0] - cr * 0.45, 0.76 + cr, tx[1] - cr * 0.3); }
  /* 街道家具：lv2+ 路灯/停车，lv3+ 第三杆，lv4 花箱 + 右立面灯箱 */
  if (level >= 2) {
    var LP = [[0.2, 0.67, 0, 1], [0.67, -0.25, 1, 0]]; if (level >= 3) LP.push([0.67, -0.77, 1, 0]);
    for (var li = 0; li < LP.length; li++) { var l = LP[li]; Y(A.metal, 0.011, 0.015, 0.6, 12, l[0], 0.39, l[1]);
      B(A.metal, l[2] ? 0.16 : 0.02, 0.014, l[2] ? 0.02 : 0.16, l[0] + (l[2] ? 0.08 : 0), 0.69, l[1] + (l[3] ? 0.08 : 0)); B(lampM, 0.075, 0.02, 0.05, l[0] + (l[2] ? 0.14 : 0), 0.68, l[1] + (l[3] ? 0.14 : 0)); }
    var CAR = function (m, x, z, v) { B(m, 0.34, 0.068, 0.15, x, 0.114, z, 0, v ? PI / 2 : 0, 0); B(m, 0.18, 0.055, 0.14, x + (v ? 0.02 : -0.02), 0.172, z + (v ? -0.02 : 0), 0, v ? PI / 2 : 0, 0);
      for (var wi = 0; wi < 4; wi++) { var dx = (wi % 2 ? 0.11 : -0.11), dz = (wi >> 1 ? 0.062 : -0.062); if (v) { var tt = dx; dx = dz; dz = -tt; } Y(A.tire, 0.032, 0.032, 0.026, 12, x + dx, 0.082, z + dz, v ? 0 : PI / 2, 0, v ? PI / 2 : 0); } };
    CAR(A.car, 0.32, 1.06, 0); if (level >= 3) { CAR(A.carW, 1.07, -0.5, 1); CAR(A.car, -1.1, 0.92, 0); }
    if (level >= 4) { CAR(A.carS, 0.62, 0.92, 0); CAR(A.carW, 1.07, 0.12, 1);
      B(A.band, 0.16, 0.09, 0.12, -1.22, 0.135, 0.66); O(A.leaf2, 0.06, -1.22, 0.22, 0.66); B(A.band, 0.16, 0.09, 0.12, 0.4, 0.135, 0.63); O(A.leaf2, 0.06, 0.4, 0.22, 0.63);
      B(signM, 0.045, 0.065, 0.42, 0.515, 0.4325, -0.2, 0, 0, 0, -1); }
  }
  flush(g);
  g.userData.anim = [function (t) { glow.emissiveIntensity = 0.4 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.5)); }];
  if (level >= 3) g.userData.anim.push(function (t) { var s = 0.5 + 0.5 * Math.sin(t * 1.1);
    signM.emissiveIntensity = (level >= 4 ? 0.55 : 0.08) + 0.25 * s; lampM.emissiveIntensity = 0.55 + 0.2 * s; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[6] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
