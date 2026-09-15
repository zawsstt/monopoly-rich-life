/* 大富翁·现代写实棋盘（沪）格 6「武康路」—— 梧桐街 + 武康大楼剪影 + 精品店，四年代演进（v2 材质精修）
 * 契约：window.Props3DModern[6](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z；
 * 每级 mesh ≤55（手写合并 BufferGeometry，同材质合一，增量 ≤+6）；Canvas ≤256px；零 Math.random；动画 ≤2 项。
 * v2 精修（对标 specials3d/tile29_water.js）：多层 Canvas（基色→分缝→风化/苔痕→高光：砖/瓦/沥青/铺装/篷布）；
 *   boxUV 按世界尺寸烘焙（贴图密度一致）；材质分区（玻璃 rg.12/mt.65、钢 mt.85、漆面车漆、天窗半透）；发光件独立材质每实例新建+呼吸。
 * 年代特征：lv1 1990s 素面转角楼+稀疏梧桐+木门板店面，无标线无车；lv2 2000s +斑马线/车道线+绿篷橱窗+屋顶披屋；
 *   lv3 2010s +暖光玻璃店面+街灯+路侧停车+白色屋顶加建；lv4 2020s +玻璃屋顶加建/钢架/天线+发光灯箱+双车+茂密梧桐。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_6] THREE 未定义'); return; }
var PI = Math.PI, _mc = {}, _t = {}, BK;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function mk(h, o, fresh) { /* 材质工厂：map 为灰度纹理×color 染色；fresh=发光/动画材质每实例独立 */
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + o.em + '|' + o.ei + '|' + (o.map ? o.map.uuid : '') + '|' + o.op;
  if (!fresh && _mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) m.map = o.map; if (o.op) { m.transparent = true; m.opacity = o.op; }
  return fresh ? m : (_mc[k] = m);
}
function M(h, o) { return mk(h, o); } function MF(h, o) { return mk(h, o, 1); }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function T(k, S, seed, draw) { if (!_t[k]) { var c = cv(S, S), R = lcg(seed); draw(c.getContext('2d'), S, R); _t[k] = TX(c); } return _t[k]; }
function specks(g, S, R, n, a, b) { for (var i = 0; i < n; i++) { g.fillStyle = R() > 0.5 ? a : b; g.fillRect(R() * S, R() * S, 1 + R() * 3, 1 + R() * 2); } }
/* ---- 多层纹理：基色→分缝(暗+亮边)→风化/色差→噪点高光 ---- */
function texBrick() { return T('brick', 128, 606, function (g, S, R) {
  g.fillStyle = '#cfc8bc'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 16) for (var x = (y / 16) % 2 ? -16 : 0; x < S; x += 32) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '88,58,48' : '238,228,212') + ',' + (0.07 + R() * 0.18).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 12); }
  for (var y2 = 0; y2 < S; y2 += 16) { g.fillStyle = 'rgba(70,58,50,0.6)'; g.fillRect(0, y2, S, 2); g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(0, y2 + 2, S, 1);
    for (var x2 = (y2 / 16) % 2 ? 0 : 16; x2 < S; x2 += 32) { g.fillStyle = 'rgba(70,58,50,0.55)'; g.fillRect(x2, y2, 2, 16); } }
  for (var i = 0; i < 7; i++) { g.fillStyle = 'rgba(40,30,25,0.1)'; g.fillRect(R() * S, 0, 3 + R() * 6, S * (0.4 + R() * 0.6)); }
  specks(g, S, R, 70, 'rgba(60,45,40,0.3)', 'rgba(250,245,235,0.35)');
}); }
function texTile() { return T('tile', 128, 618, function (g, S, R) {
  g.fillStyle = '#b4afa6'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x + 1, 0, 3, S); g.fillStyle = 'rgba(35,38,44,0.55)'; g.fillRect(x + 6, 0, 4, S); g.fillStyle = 'rgba(28,30,36,0.5)'; g.fillRect(x + 15, 0, 1, S); }
  for (var y = 10; y < S; y += 22) { g.fillStyle = 'rgba(24,26,32,0.45)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, y + 2, S, 1);
    for (var x2 = 0; x2 < S; x2 += 16) if (R() > 0.6) { g.fillStyle = R() > 0.5 ? 'rgba(20,22,26,0.18)' : 'rgba(230,228,220,0.14)'; g.fillRect(x2, y + 3, 16, 19); } }
  for (var i = 0; i < 6; i++) { g.fillStyle = 'rgba(70,95,50,0.35)'; g.fillRect(R() * S, R() * S, 3 + R() * 5, 2 + R() * 3); }
  specks(g, S, R, 40, 'rgba(20,22,26,0.3)', 'rgba(230,228,220,0.25)');
}); }
function texAsph() { return T('asph', 128, 630, function (g, S, R) { /* 沥青：基色→骨料噪点→轮迹磨亮带→裂缝 */
  g.fillStyle = '#bfbfbf'; g.fillRect(0, 0, S, S); specks(g, S, R, 220, 'rgba(30,30,34,0.35)', 'rgba(255,255,255,0.22)');
  g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(0, 22, S, 26); g.fillRect(0, 80, S, 26);
  for (var i = 0; i < 3; i++) { g.fillStyle = 'rgba(20,20,24,0.4)'; g.fillRect(R() * S, R() * S, 1, 10 + R() * 30); }
}); }
function texPave() { return T('pave', 128, 642, function (g, S, R) { /* 石板铺装：基色→板块色差→分缝(暗+亮)→噪点 */
  g.fillStyle = '#d2cec6'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 32) for (var x = 0; x < S; x += 32) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '80,76,70' : '255,255,255') + ',' + (0.05 + R() * 0.12).toFixed(2) + ')'; g.fillRect(x, y, 32, 32); g.fillStyle = 'rgba(70,66,60,0.5)'; g.fillRect(x, y, 32, 2); g.fillRect(x, y, 2, 32); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 2, y + 2, 30, 1); }
  specks(g, S, R, 60, 'rgba(70,66,60,0.25)', 'rgba(255,255,255,0.3)');
}); }
function texAwn() { return T('awn', 64, 654, function (g, S, R) { /* 篷布：条纹→织纹横线→噪点 */
  g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, 0, 8, S); }
  for (var y = 0; y < S; y += 3) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, S, 1); } specks(g, S, R, 30, 'rgba(0,0,0,0.12)', 'rgba(255,255,255,0.2)');
}); }
function signTex(txt, bg, fg) { /* 店招灯箱面（Canvas ≤256，按文本缓存；材质仍每实例新建） */
  var k = 's' + txt + bg + fg; if (_t[k]) return _t[k]; var c = cv(256, 64), g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 38px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34); return (_t[k] = TX(c));
}
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；boxUV 按世界尺寸烘焙 ---- */
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function uvS(g, u, v) { if (u || v) { var a = g.attributes.uv, i; for (i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * (u || 1), a.getY(i) * (v || 1)); } return g; }
function boxUV(g, w, h, d, s) { var a = g.attributes.uv, dm = [d, h, d, h, w, d, w, d, w, h, w, h]; for (var i = 0; i < 24; i++) a.setXY(i, a.getX(i) * dm[(i >> 2) * 2] * s, a.getY(i) * dm[(i >> 2) * 2 + 1] * s); return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz, s) { var g = new THREE.BoxGeometry(w, h, d); if (m.map && s !== -1) boxUV(g, w, h, d, s || 2.2); put(m, xf(g, x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function A2(m, geo, x, y, z, u, v) { put(m, xf(uvS(geo, u, v), x, y, z)); }
function TRI(m, w, h, d, x, y, z) { var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); A2(m, new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), x, y, z, 2.2, 2.2); }
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) {
      pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o);
      if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
    var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
/* ---- 武康路四年代 ---- */
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_6_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = level;
  BK = {}; var FH = 0.4, N = [3, 3, 4, 4][level - 1], H = 0.08 + N * FH;
  var A = {
    asph: M('#5e6369', { map: texAsph(), rg: 0.96 }), line: M('#e8e8e0', { rg: 0.7 }), sw: M('#b4afa4', { map: texPave(), rg: 0.9 }), court: M('#9a958b', { map: texPave(), rg: 0.92 }),
    brick: M('#e68a68', { map: texBrick(), rg: 0.9 }), band: M('#f0e8d6', { map: texPave(), rg: 0.8 }), glass: M('#313c46', { rg: 0.12, mt: 0.65 }),
    roof: M('#8a9099', { map: texTile(), rg: 0.75 }), tile: M('#cc8262', { map: texTile(), rg: 0.75 }), wood: M('#5f4630', { rg: 0.85 }), trunk: M('#57452f', { rg: 0.9 }),
    leaf: M('#5f7f40', { rg: 0.95 }), leaf2: M('#72904d', { rg: 0.95 }), white: M('#e9e4d8', { rg: 0.85 }), steel: M('#8b9298', { rg: 0.35, mt: 0.85 }),
    awn: M(level === 2 ? '#3f6a50' : '#a34a36', { map: texAwn(), rg: 0.9 }), car: M('#c3c7ca', { rg: 0.25, mt: 0.7 }),
    car2: M('#5f666d', { rg: 0.25, mt: 0.7 }), tire: M('#232629', { rg: 0.9 }), sky: M('#8fa6b4', { rg: 0.08, mt: 0.5, op: 0.6 })
  };
  var glow = MF('#4a4038', { rg: 0.4, em: '#ffbd66', ei: 0.35 }); var lampM = MF('#ffe6b0', { rg: 0.4, em: '#ffd9a0', ei: 0.7 });
  var signM = level >= 3 ? MF('#f2ead8', { map: signTex('武康路', '#26343a', '#ffd98c'), em: '#ffcf8e', ei: level >= 4 ? 0.8 : 0.15, rg: 0.5 }) : null;
  /* 地面：沥青路 + 人行道 + 后院 + 斑马线/车道线（lv2+） */
  B(A.asph, 2.6, 0.05, 0.68, 0, 0.025, 0.96); B(A.sw, 2.6, 0.09, 0.32, 0, 0.045, 0.46); B(A.court, 2.6, 0.05, 1.6, 0, 0.025, -0.5);
  if (level >= 2) { for (var zx = 0.62; zx <= 1.26; zx += 0.13) B(A.line, 0.06, 0.056, 0.56, zx, 0.053, 0.96); for (var lx = -1.2; lx <= 0.25; lx += 0.44) B(A.line, 0.2, 0.056, 0.05, lx, 0.053, 0.96); }
  /* 武康大楼剪影：船头弧形转角 + 双翼（几何与 v1 完全一致） */
  B(A.brick, 1.73, 0.08, 0.68, -0.415, 0.04, -0.01); B(A.brick, 1.73, H, 0.62, -0.415, 0.08 + H / 2, -0.01);
  A2(A.brick, new THREE.CylinderGeometry(0.36, 0.36, 0.08, 10, 1, false, -PI / 2, PI), 0.45, 0.04, -0.04);
  A2(A.brick, new THREE.CylinderGeometry(0.34, 0.34, H, 10, 1, false, -PI / 2, PI), 0.45, 0.08 + H / 2, -0.04, PI * 0.34 * 2.2, H * 2.2);
  B(A.brick, 0.6, H, 1.05, 0.75, 0.08 + H / 2, -0.49, 0, -0.61, 0); /* 右翼（后退斜置） */
  for (var f = 0; f < N; f++) {
    var yc = 0.08 + f * FH + FH * 0.55;
    A2(A.band, new THREE.CylinderGeometry(0.362, 0.362, 0.035, 10, 1, true, -PI / 2, PI), 0.45, 0.08 + (f + 1) * FH, -0.04);
    B(A.band, 1.76, 0.035, 0.66, -0.415, 0.08 + (f + 1) * FH, -0.01);
    for (var wx = 0; wx < 6; wx++) { var x = -1.16 + wx * 0.236; B(A.glass, 0.13, 0.22, 0.03, x, yc, 0.305); B(A.band, 0.1, 0.24, 0.025, x + 0.118, yc, 0.307); }
    for (var pa = 0; pa < 5; pa++) { var a = -1.05 + pa * 0.525; B(A.glass, 0.14, 0.22, 0.03, 0.45 + Math.sin(a) * 0.345, yc, -0.04 + Math.cos(a) * 0.345, 0, a, 0); }
    for (var wt = -1; wt <= 1; wt += 2) B(A.glass, 0.14, 0.22, 0.03, 0.75 - 0.573 * wt * 0.26, yc, -0.49 + 0.819 * wt * 0.26, 0, -0.61, 0);
  }
  B(A.band, 1.73, 0.07, 0.66, -0.415, H + 0.115, -0.01); B(A.band, 0.62, 0.07, 1.05, 0.75, H + 0.115, -0.49, 0, -0.61, 0);
  A2(A.band, new THREE.CylinderGeometry(0.362, 0.362, 0.07, 10, 1, true, -PI / 2, PI), 0.45, H + 0.115, -0.04);
  /* 底商：lv1 木门板 / lv2+ 橱窗暖光 + 条纹布篷 / lv3+ 船头落地玻璃 + 灯箱 */
  if (level === 1) {
    B(A.wood, 0.5, 0.3, 0.03, -0.9, 0.23, 0.305); B(A.wood, 0.5, 0.3, 0.03, -0.35, 0.23, 0.305);
    B(glow, 0.16, 0.24, 0.03, -0.62, 0.23, 0.307); B(A.wood, 0.26, 0.3, 0.03, 0.05, 0.23, 0.305);
  } else {
    B(glow, 0.55, 0.3, 0.03, -0.9, 0.23, 0.307); B(glow, 0.55, 0.3, 0.03, -0.35, 0.23, 0.307);
    B(A.glass, 0.24, 0.3, 0.03, 0.05, 0.23, 0.306); B(A.band, 0.03, 0.3, 0.032, 0.05, 0.23, 0.308);
    B(A.awn, 0.62, 0.018, 0.24, -0.9, 0.44, 0.41, -0.5, 0, 0, 4); B(A.awn, 0.62, 0.05, 0.02, -0.9, 0.375, 0.525, 0, 0, 0, 4);
    B(A.awn, 0.62, 0.018, 0.24, -0.35, 0.44, 0.41, -0.5, 0, 0, 4); B(A.awn, 0.62, 0.05, 0.02, -0.35, 0.375, 0.525, 0, 0, 0, 4);
  }
  if (level >= 3) {
    A2(glow, new THREE.CylinderGeometry(0.31, 0.31, 0.3, 10, 1, false, -PI / 2, PI), 0.45, 0.24, -0.04);
    B(signM, 0.52, 0.13, 0.045, 0.45, 0.53, 0.32, 0, 0, 0, -1); B(A.steel, 0.54, 0.02, 0.05, 0.45, 0.605, 0.32);
  }
  /* 屋顶：lv2+ 小披屋/圆亭 → lv3 白色加建 → lv4 玻璃阳光房+钢架+天线 */
  if (level >= 2) {
    B(A.white, 0.72, 0.24 + (level >= 4 ? 0.08 : 0), 0.42, -0.7, H + 0.19, -0.05); B(A.band, 0.76, 0.03, 0.46, -0.7, H + 0.32, -0.05);
    Y(A.band, 0.12, 0.12, 0.2, 8, 0.77, H + 0.17, -0.49); Y(A.roof, 0.16, 0.01, 0.12, 8, 0.77, H + 0.33, -0.49);
    if (level >= 4) {
      B(A.sky, 0.5, 0.2, 0.3, -0.7, H + 0.42, -0.05); B(A.steel, 0.54, 0.015, 0.34, -0.7, H + 0.525, -0.05);
      Y(A.steel, 0.008, 0.008, 0.3, 5, -0.7, H + 0.68, -0.05); B(A.sky, 0.5, 0.2, 0.4, 0.75, H + 0.26, -0.49, 0, -0.61, 0);
    }
  }
  /* 后排花园洋房 ×3（两层砖墙 + 陶土红瓦坡顶 + 烟囱），年代屋面变化 */
  var hx = [-0.85, 0.05, 0.85];
  for (var hi = 0; hi < 3; hi++) {
    var hxx = hx[hi];
    B(A.brick, 0.62, 0.75, 0.55, hxx, 0.425, -0.92);
    B(A.tile, 0.72, 0.025, 0.4, hxx, 0.94, -1.065, -0.5, 0, 0); B(A.tile, 0.72, 0.025, 0.4, hxx, 0.94, -0.775, 0.5, 0, 0);
    Y(A.tile, 0.024, 0.024, 0.68, 6, hxx, 1.045, -0.92, 0, 0, PI / 2); B(A.brick, 0.06, 0.14, 0.06, hxx + 0.18, 1.09, -0.92);
    TRI(A.brick, 0.58, 0.17, 0.03, hxx, 0.88, -1.205); TRI(A.brick, 0.58, 0.17, 0.03, hxx, 0.88, -0.635);
    B(A.glass, 0.12, 0.16, 0.02, hxx - 0.15, 0.62, -0.634); B(A.glass, 0.12, 0.16, 0.02, hxx + 0.15, 0.62, -0.634); B(A.glass, 0.12, 0.16, 0.02, hxx - 0.15, 0.3, -0.634); B(A.glass, 0.12, 0.16, 0.02, hxx + 0.15, 0.62, -1.206);
  }
  if (level === 1) O(A.leaf, 0.05, 0.05, 1.05, -0.9); else if (level === 2) O(A.leaf, 0.06, 0.05, 1.07, -0.95);
  else B(A.white, 0.4, 0.18, 0.3, 0.05, 1.03, -0.92);
  if (level >= 4) {
    B(A.sky, 0.44, 0.16, 0.34, -0.85, 1.01, -0.92);
    O(A.leaf2, 0.09, 0.05, 1.09, -0.92); O(A.leaf, 0.07, 0.85, 1.07, -0.92); O(A.leaf2, 0.06, -0.85, 1.11, -1.05);
  }
  /* 梧桐行道树 ×4：树冠逐年代变大 */
  var tx = [-1.05, -0.55, -0.05, 0.9], cr = [0.15, 0.18, 0.21, 0.22][level - 1];
  for (var ti = 0; ti < 4; ti++) {
    Y(A.trunk, 0.028, 0.04, 0.55, 6, tx[ti], 0.365, 0.46); O(A.leaf, cr, tx[ti], 0.68 + cr * 0.6, 0.46);
    O(A.leaf2, cr * 0.65, tx[ti] + cr * 0.55, 0.74 + cr * 0.5, 0.52);
  }
  /* 街道家具：lv3+ 路侧停车/街灯，lv4 花箱+第二灯箱 */
  if (level >= 3) {
    B(A.car, 0.36, 0.075, 0.17, -0.6, 0.125, 0.97); B(A.car, 0.2, 0.06, 0.155, -0.64, 0.19, 0.97);
    for (var wi = 0; wi < 4; wi++) Y(A.tire, 0.034, 0.034, 0.028, 8, -0.71 + (wi % 2) * 0.22, 0.083, 0.9 + Math.floor(wi / 2) * 0.14, PI / 2, 0, 0);
    var lx2 = [-0.25, 1.08];
    for (var li = 0; li < 2; li++) {
      Y(A.steel, 0.012, 0.016, 0.55, 6, lx2[li], 0.365, 0.52); B(A.steel, 0.16, 0.015, 0.015, lx2[li] + 0.075, 0.635, 0.52);
      B(lampM, 0.08, 0.022, 0.05, lx2[li] + 0.13, 0.625, 0.52);
    }
  }
  if (level >= 4) {
    B(A.car2, 0.36, 0.075, 0.17, -1.05, 0.125, 0.97); B(A.car2, 0.2, 0.06, 0.155, -1.09, 0.19, 0.97);
    for (var wi2 = 0; wi2 < 4; wi2++) Y(A.tire, 0.034, 0.034, 0.028, 8, -1.16 + (wi2 % 2) * 0.22, 0.083, 0.9 + Math.floor(wi2 / 2) * 0.14, PI / 2, 0, 0);
    B(A.court, 0.24, 0.1, 0.14, 0.12, 0.14, 0.4); B(A.court, 0.24, 0.1, 0.14, 1.12, 0.14, 0.4);
    O(A.leaf2, 0.07, 0.12, 0.24, 0.4); O(A.leaf2, 0.07, 1.12, 0.24, 0.4);
    B(signM, 0.3, 0.1, 0.035, -0.62, 0.44, 0.315, 0, 0, 0, -1);
  }
  flush(g);
  g.userData.anim = [function (t) { glow.emissiveIntensity = 0.3 + 0.16 * (0.5 + 0.5 * Math.sin(t * 1.5)); }];
  if (level >= 3) g.userData.anim.push(function (t) {
    var s = 0.5 + 0.5 * Math.sin(t * 1.1);
    signM.emissiveIntensity = (level >= 4 ? 0.55 : 0.08) + 0.25 * s; lampM.emissiveIntensity = 0.55 + 0.2 * s;
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[6] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
