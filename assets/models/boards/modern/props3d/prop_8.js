/* 大富翁·现代写实棋盘（沪）格 8「田子坊」—— 石库门弄堂 + 艺术店铺招牌，四年代演进（v2 材质精修）
 * 契约：window.Props3DModern[8](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z；
 * 每级 mesh ≤55（手写合并 BufferGeometry，同材质合一，增量 ≤+6）；Canvas ≤256px；零 Math.random；动画 ≤2 项。
 * v2 精修（对标 specials3d/tile29_water.js）：多层 Canvas（基色→分缝→风化/苔痕→高光：砖/灰泥剥落露砖/瓦/石板/木门/篷布）；
 *   boxUV 按世界尺寸烘焙；材质分区（玻璃 rg.12/mt.65、钢 mt.85、天窗半透）；发光件独立材质每实例新建+呼吸。
 * 年代特征：lv1 1990s 风化灰泥素瓦+木门紧闭；lv2 2000s 红砖修复+米绿篷+木招牌+盆栽；
 *   lv3 2010s 酒红篷+暖光玻璃+悬挂店招+弄堂路灯+玻璃阳光房；lv4 2020s 玻璃屋顶加建/钢架+发光灯箱+发光「田子坊」匾额。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_8] THREE 未定义'); return; }
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
function texBrick() { return T('brick', 128, 806, function (g, S, R) {
  g.fillStyle = '#cfc8bc'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 16) for (var x = (y / 16) % 2 ? -16 : 0; x < S; x += 32) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '88,58,48' : '238,228,212') + ',' + (0.07 + R() * 0.18).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 12); }
  for (var y2 = 0; y2 < S; y2 += 16) { g.fillStyle = 'rgba(70,58,50,0.6)'; g.fillRect(0, y2, S, 2); g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(0, y2 + 2, S, 1);
    for (var x2 = (y2 / 16) % 2 ? 0 : 16; x2 < S; x2 += 32) { g.fillStyle = 'rgba(70,58,50,0.55)'; g.fillRect(x2, y2, 2, 16); } }
  for (var i = 0; i < 7; i++) { g.fillStyle = 'rgba(40,30,25,0.1)'; g.fillRect(R() * S, 0, 3 + R() * 6, S * (0.4 + R() * 0.6)); }
  specks(g, S, R, 70, 'rgba(60,45,40,0.3)', 'rgba(250,245,235,0.35)');
}); }
function texPlaster() { return T('plaster', 128, 866, function (g, S, R) { /* 灰泥：基色→水渍风化斑→剥落露砖→裂缝→噪点 */
  g.fillStyle = '#cfcac2'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 12; i++) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '90,86,80' : '60,70,60') + ',' + (0.06 + R() * 0.12).toFixed(2) + ')'; g.fillRect(R() * S, R() * S, 10 + R() * 40, 8 + R() * 30); }
  for (var p = 0; p < 4; p++) { var px = R() * S, py = R() * S, pw = 14 + R() * 20, ph = 8 + R() * 16; g.fillStyle = 'rgba(150,90,70,0.55)'; g.fillRect(px, py, pw, ph); g.fillStyle = 'rgba(60,40,35,0.4)'; for (var yy = py; yy < py + ph; yy += 5) g.fillRect(px, yy, pw, 1); }
  for (var c = 0; c < 5; c++) { g.fillStyle = 'rgba(50,46,42,0.5)'; g.fillRect(R() * S, R() * S, 1, 6 + R() * 26); }
  specks(g, S, R, 80, 'rgba(60,56,50,0.25)', 'rgba(255,255,255,0.3)');
}); }
function texTile() { return T('tile', 128, 818, function (g, S, R) {
  g.fillStyle = '#aaa59c'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(x + 1, 0, 3, S); g.fillStyle = 'rgba(30,32,38,0.55)'; g.fillRect(x + 6, 0, 4, S); g.fillStyle = 'rgba(24,26,30,0.5)'; g.fillRect(x + 15, 0, 1, S); }
  for (var y = 10; y < S; y += 22) { g.fillStyle = 'rgba(20,22,26,0.45)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(0, y + 2, S, 1);
    for (var x2 = 0; x2 < S; x2 += 16) if (R() > 0.6) { g.fillStyle = R() > 0.5 ? 'rgba(18,20,24,0.18)' : 'rgba(225,222,214,0.14)'; g.fillRect(x2, y + 3, 16, 19); } }
  for (var i = 0; i < 9; i++) { g.fillStyle = 'rgba(70,95,50,0.38)'; g.fillRect(R() * S, R() * S, 3 + R() * 6, 2 + R() * 4); }
  specks(g, S, R, 40, 'rgba(18,20,24,0.3)', 'rgba(225,222,214,0.25)');
}); }
function texPave() { return T('pave', 128, 842, function (g, S, R) { /* 弄堂石板：基色→板块色差→分缝(暗+亮)→噪点 */
  g.fillStyle = '#d2cec6'; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 32) for (var x = 0; x < S; x += 32) { g.fillStyle = 'rgba(' + (R() > 0.5 ? '80,76,70' : '255,255,255') + ',' + (0.05 + R() * 0.12).toFixed(2) + ')'; g.fillRect(x, y, 32, 32); g.fillStyle = 'rgba(70,66,60,0.5)'; g.fillRect(x, y, 32, 2); g.fillRect(x, y, 2, 32); g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 2, y + 2, 30, 1); }
  specks(g, S, R, 60, 'rgba(70,66,60,0.25)', 'rgba(255,255,255,0.3)');
}); }
function texWood() { return T('wood', 64, 878, function (g, S, R) { /* 木门：基色→板缝→木纹→节疤→噪点 */
  g.fillStyle = '#c9b89a'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 8) { g.fillStyle = 'rgba(40,28,16,0.5)'; g.fillRect(x, 0, 1, S); for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(80,58,36,0.25)'; g.fillRect(x + 2 + R() * 5, R() * S, 1, 8 + R() * 20); } }
  for (var k = 0; k < 3; k++) { g.fillStyle = 'rgba(60,40,24,0.5)'; g.fillRect(R() * S, R() * S, 3, 2); } specks(g, S, R, 30, 'rgba(40,28,16,0.2)', 'rgba(255,240,220,0.25)');
}); }
function texAwn() { return T('awn', 64, 854, function (g, S, R) { /* 篷布：条纹→织纹横线→噪点 */
  g.fillStyle = '#d8d8d8'; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(x, 0, 8, S); }
  for (var y = 0; y < S; y += 3) { g.fillStyle = 'rgba(0,0,0,0.06)'; g.fillRect(0, y, S, 1); } specks(g, S, R, 30, 'rgba(0,0,0,0.12)', 'rgba(255,255,255,0.2)');
}); }
function signTex(txt, bg, fg) { /* 店招/匾额面（Canvas ≤256，按文本缓存；材质仍每实例新建） */
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
/* ---- 田子坊四年代 ---- */
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_8_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = level;
  BK = {};
  var wall = level === 1 ? M('#c4beb6', { map: texPlaster(), rg: 0.94 }) : M(level >= 4 ? '#dc8062' : '#d4785c', { map: texBrick(), rg: 0.9 });
  var A = {
    pave: M('#b0aca4', { map: texPave(), rg: 0.94 }), alley: M('#918d84', { map: texPave(), rg: 0.94 }), band: M('#dcd6c6', { map: texPave(), rg: 0.8 }),
    wood: M('#84603f', { map: texWood(), rg: 0.85 }), glass: M('#2e3840', { rg: 0.12, mt: 0.65 }),
    roof: M('#9aa0a8', { map: texTile(), rg: 0.78 }), trunk: M('#57452f', { rg: 0.9 }),
    leaf: M('#5f7f40', { rg: 0.95 }), leaf2: M('#72904d', { rg: 0.95 }), moss: M('#5a6b46', { rg: 0.95 }),
    steel: M('#787f85', { rg: 0.35, mt: 0.85 }), planter: M('#8f8b81', { rg: 0.9 }), sky: M('#8fa6b4', { rg: 0.08, mt: 0.5, op: 0.6 }),
    awn: M(level === 2 ? '#c9b98a' : '#8e3a3a', { map: texAwn(), rg: 0.9 }), awnG: M('#41684f', { map: texAwn(), rg: 0.9 })
  };
  var glow = MF('#453b32', { rg: 0.4, em: '#ffb768', ei: level >= 3 ? 0.55 : 0.2 });
  var signM = level >= 3 ? MF(level >= 4 ? '#3a3430' : '#e8e0d0', { map: signTex('咖啡', '#26343a', level >= 4 ? '#ffd98c' : '#e8d9b0'), em: '#ffcf8e', ei: level >= 4 ? 0.75 : 0.12, rg: 0.5 }) : null;
  var plqM = level >= 3 ? MF(level >= 4 ? '#30281f' : '#5a4a34', { map: signTex('田子坊', '#20180f', level >= 4 ? '#ffce7a' : '#d8c290'), em: '#ffc76a', ei: level >= 4 ? 0.85 : 0.1, rg: 0.55 }) : null;
  var sign2 = level >= 3 ? MF('#ded5c2', { map: signTex('画廊', '#2e2a22', '#e0c890'), em: '#e8c070', ei: 0.1, rg: 0.6 }) : null;
  /* 地面：街区地坪 + 中央弄堂 + 门槛石 */
  B(A.pave, 2.6, 0.05, 2.6, 0, 0.025, 0); B(A.alley, 0.6, 0.056, 2.6, 0, 0.028, 0); B(A.band, 0.7, 0.058, 0.12, 0, 0.029, 0.95);
  /* 石库门弄堂口：门柱 + 石门楣 + 匾额（几何与 v1 完全一致） */
  B(wall, 0.14, 0.72, 0.14, -0.37, 0.41, 0.85); B(wall, 0.14, 0.72, 0.14, 0.37, 0.41, 0.85);
  B(A.band, 0.98, 0.09, 0.16, 0, 0.815, 0.85); TRI(A.band, 0.94, 0.15, 0.06, 0, 0.87, 0.82);
  if (plqM) B(plqM, 0.4, 0.14, 0.03, 0, 0.83, 0.945, 0, 0, 0, -1);
  /* 两个石库门合院组块 × 前后两户：山墙朝前、店门朝弄堂 */
  var cxs = [-0.8, 0.8], czs = [0.3, -0.7];
  for (var bi = 0; bi < 2; bi++) {
    var cx = cxs[bi], s = cx > 0 ? 1 : -1;
    for (var ui = 0; ui < 2; ui++) {
      var cz = czs[ui], shop = ui === 0; B(wall, 1.0, 0.84, 0.98, cx, 0.47, cz);
      B(A.roof, 0.56, 0.025, 1.04, cx - 0.21, 0.985, cz, 0, 0, 0.62); B(A.roof, 0.56, 0.025, 1.04, cx + 0.21, 0.985, cz, 0, 0, -0.62);
      Y(A.roof, 0.026, 0.026, 1.0, 6, cx, 1.14, cz, PI / 2, 0, 0); B(wall, 0.07, 0.16, 0.07, cx + 0.32, 1.0, cz - 0.3);
      TRI(wall, 0.96, 0.24, 0.03, cx, 0.89, cz - 0.49); TRI(wall, 0.96, 0.24, 0.03, cx, 0.89, cz + 0.46);
      /* 二层窗（正面山墙）+ 石库门框（前户） */
      B(A.glass, 0.15, 0.18, 0.02, cx - 0.25, 0.65, cz + 0.505); B(A.glass, 0.15, 0.18, 0.02, cx + 0.25, 0.65, cz + 0.505);
      B(A.band, 0.19, 0.02, 0.035, cx - 0.25, 0.55, cz + 0.505); B(A.band, 0.19, 0.02, 0.035, cx + 0.25, 0.55, cz + 0.505);
      if (shop) {
        B(A.band, 0.045, 0.38, 0.035, cx - 0.4, 0.26, cz + 0.505); B(A.band, 0.045, 0.38, 0.035, cx - 0.1, 0.26, cz + 0.505);
        B(A.band, 0.4, 0.05, 0.035, cx - 0.25, 0.475, cz + 0.505); B(A.wood, 0.24, 0.34, 0.03, cx - 0.25, 0.27, cz + 0.505);
        if (level === 1) B(A.wood, 0.44, 0.3, 0.03, cx + 0.22, 0.25, cz + 0.505);
        else {
          B(glow, 0.44, 0.3, 0.02, cx + 0.22, 0.25, cz + 0.51); TRI(A.band, 0.42, 0.12, 0.04, cx - 0.25, 0.5, cz + 0.49);
          B(A.awn, 0.55, 0.018, 0.2, cx + 0.22, 0.44, cz + 0.58, -0.55, 0, 0, 4); B(A.awn, 0.55, 0.05, 0.02, cx + 0.22, 0.385, cz + 0.665, 0, 0, 0, 4);
        }
      } else {
        B(level === 1 && bi === 0 ? glow : A.glass, 0.16, 0.2, 0.02, cx, 0.28, cz + 0.505); B(A.band, 0.2, 0.022, 0.035, cx, 0.17, cz + 0.505); B(A.wood, 0.22, 0.3, 0.03, cx - 0.3, 0.26, cz + 0.505);
      }
      /* 弄堂面：门 + 篷 + 悬挂店招（lv3+） */
      B(A.band, 0.035, 0.4, 0.05, s * 0.315, 0.26, cz - 0.145); B(A.band, 0.035, 0.4, 0.05, s * 0.315, 0.26, cz + 0.145);
      B(A.band, 0.035, 0.05, 0.34, s * 0.315, 0.475, cz); B(A.wood, 0.03, 0.34, 0.24, s * 0.317, 0.26, cz);
      if (level >= 2) { B(A.awnG, 0.2, 0.016, 0.44, s * 0.39, 0.52, cz, 0, 0, -s * 0.5, 4); B(A.awnG, 0.02, 0.045, 0.44, s * 0.478, 0.468, cz, 0, 0, 0, 4); }
      if (level >= 3) B(sign2 || signM, 0.26, 0.13, 0.02, s * 0.43, 0.63, cz, 0, 0, 0, -1);
      /* 屋面绿化/青苔 逐年代加密 */
      for (var mi = 0; mi < [1, 2, 3, 4][level - 1]; mi++) {
        var off = [[-0.15, -0.2], [0.2, 0.15], [-0.05, 0.3], [0.18, -0.3]][mi]; O(mi % 2 ? A.moss : A.leaf, 0.055 + mi * 0.012, cx + off[0], 1.06, cz + off[1]);
      }
    }
    /* 屋顶加建：lv3 玻璃阳光房 → lv4 大面积玻璃屋顶加建+钢架 */
    if (level >= 3) { B(A.sky, 0.42, 0.16, 0.3, cx, 1.06, -0.7); B(A.steel, 0.46, 0.015, 0.34, cx, 1.15, -0.7); }
    if (level >= 4) {
      B(A.sky, 0.7, 0.16, 0.5, cx, 1.1, 0.3); B(A.steel, 0.74, 0.015, 0.54, cx, 1.19, 0.3);
      for (var pi = 0; pi < 4; pi++) Y(A.steel, 0.01, 0.01, 0.14, 4, cx + (pi % 2 ? 0.3 : -0.3), 0.96, 0.3 + (pi < 2 ? 0.2 : -0.2));
      B(A.sky, 0.6, 0.28, 0.4, cx, 1.24, -0.7); B(A.steel, 0.64, 0.015, 0.44, cx, 1.39, -0.7);
    }
  }
  /* 弄堂街道家具：lv2+ 盆栽 → lv3+ 路灯/绿植 */
  var pots = [[-0.14, 0.7], [0.15, 0.55], [-0.16, -1.0]];
  for (var qi = 0; qi < (level >= 2 ? 3 : 1); qi++) { B(A.planter, 0.12, 0.09, 0.12, pots[qi][0], 0.1, pots[qi][1]); O(A.leaf2, 0.06, pots[qi][0], 0.19, pots[qi][1]); }
  if (level >= 3) {
    Y(A.steel, 0.012, 0.015, 0.52, 6, 0, 0.32, 0.1); B(glow, 0.09, 0.03, 0.05, 0, 0.585, 0.1);
    O(A.leaf, 0.12, -0.95, 0.62, -1.17); O(A.leaf2, 0.11, 0.95, 0.6, -1.17);
  }
  Y(A.trunk, 0.02, 0.028, 0.3, 6, -0.95, 0.26, -1.18); Y(A.trunk, 0.02, 0.028, 0.3, 6, 0.95, 0.26, -1.18);
  /* 弄堂口前面：石库门侧翼矮墙 + lv4 落地艺术店橱窗 */
  B(wall, 0.42, 0.5, 0.1, -1.09, 0.3, 1.05); B(wall, 0.42, 0.5, 0.1, 1.09, 0.3, 1.05);
  B(A.band, 0.42, 0.03, 0.14, -1.09, 0.565, 1.05); B(A.band, 0.42, 0.03, 0.14, 1.09, 0.565, 1.05);
  if (level >= 4) {
    B(glow, 0.34, 0.36, 0.02, -1.09, 0.28, 1.102); B(glow, 0.34, 0.36, 0.02, 1.09, 0.28, 1.102);
    B(signM, 0.34, 0.11, 0.03, -1.09, 0.52, 1.105, 0, 0, 0, -1); B(signM, 0.34, 0.11, 0.03, 1.09, 0.52, 1.105, 0, 0, 0, -1);
  }
  flush(g);
  g.userData.anim = [function (t) { glow.emissiveIntensity = (level >= 3 ? 0.45 : 0.12) + 0.15 * (0.5 + 0.5 * Math.sin(t * 1.4)); }];
  if (level >= 3) g.userData.anim.push(function (t) {
    var s2 = 0.5 + 0.5 * Math.sin(t * 1.05);
    if (signM) signM.emissiveIntensity = (level >= 4 ? 0.5 : 0.06) + 0.22 * s2; if (plqM) plqM.emissiveIntensity = (level >= 4 ? 0.6 : 0.05) + 0.25 * s2;
    if (sign2) sign2.emissiveIntensity = 0.05 + 0.1 * s2;
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[8] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
