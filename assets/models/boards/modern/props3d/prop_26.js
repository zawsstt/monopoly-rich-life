/* 大富翁·现代写实棋盘（西安）格 26「回民街」—— 石牌楼 + 回坊美食窄巷 + 小吃摊彩篷旗招，四年代演进
 * 契约：window.Props3DModern[26](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6（窄长街区 1.6×2.56）；底面 y=0；正面 +Z；
 * 每级 mesh ≤55（同材质手写合并）；Canvas ≤256px；零 Math.random（LCG）；动画 ≤2 项（木窗暖光呼吸 / 摊位灯箱+灯笼呼吸，240 帧无 NaN）。
 * 材质精修（对标 specials3d/tile29_water.js）：多层 Canvas（基色+分缝+噪点+风化+高光）、boxUV 按世界尺寸烘焙、rough/metal 分区
 *   （玻璃 rg.3/mt.35、鎏金 rg.35/mt.7、漆柱 rg.5/mt.15、琉璃瓦 rg.5/mt.2、织物 rg.95）、发光件独立 MF 材质+呼吸；自着色彩画/食案纹理 previewColor 供软渲染取色。
 * 年代特征（refs/modern/prop_26.png 四象限）：lv1 1990s 素面石牌楼灰瓦+灰白旧布篷稀摊+裸抹灰铺面+小树，无灯光；lv2 2000s 绿瓦红柱彩枋牌楼+红蓝白布篷+石板路+窗暖光；
 *   lv3 2010s 青绿斗拱全彩牌楼+红绿白布篷+摊位暖光灯箱+红灯笼+屋顶平台；lv4 2020s 金边彩画牌楼+红白条纹亮篷满摊+成串红灯笼+茂密行道树+亮窗不夜街。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_26] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
var _mc = {};
function M(h, o) {
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + o.em + '|' + o.ei + '|' + (o.map ? o.map.uuid : '') + '|' + (o.k || '') + '|' + (o.pc || '');
  if (_mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) m.map = o.map; if (o.k) m.userData.k = o.k; if (o.pc) m.userData.previewColor = o.pc;
  return (_mc[k] = m);
}
function MF(h, o) { /* 发光/动画材质：每实例新建 */
  o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) m.map = o.map; if (o.k) m.userData.k = o.k; if (o.pc) m.userData.previewColor = o.pc; return m;
}
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
var _t = {};
function texStone() { /* 青石板：基色 + 板块色差 + 分缝/倒角高光 + 噪点 + 风化渍 */
  if (_t.s) return _t.s; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(926), x, y, i;
  g.fillStyle = '#d8d4cb'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 32) for (x = 0; x < S; x += 32) {
    g.fillStyle = 'rgba(' + (R() > 0.5 ? '255,252,244' : '96,92,84') + ',' + (0.04 + R() * 0.08).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 28);
    g.fillStyle = 'rgba(52,50,44,0.4)'; g.fillRect(x, y, 32, 2); g.fillRect(x, y, 2, 32);
    g.fillStyle = 'rgba(255,252,246,0.35)'; g.fillRect(x + 2, y + 2, 28, 1); g.fillRect(x + 2, y + 2, 1, 28);
  }
  for (i = 0; i < 70; i++) { g.fillStyle = R() > 0.5 ? 'rgba(52,50,46,0.18)' : 'rgba(255,252,246,0.3)'; g.fillRect(R() * S, R() * S, 2 + R() * 4, 2); }
  for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(70,66,58,0.07)'; g.fillRect(R() * S, R() * S, 10 + R() * 16, 6 + R() * 10); }
  return (_t.s = TX(c));
}
function texTile() { /* 屋瓦：垄沟 + 横向搭接 + 垄脊高光 + 噪点 */
  if (_t.t) return _t.t; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(938), x, i;
  g.fillStyle = '#d4d0c8'; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 1, 0, 3, S); g.fillStyle = 'rgba(35,38,44,0.35)'; g.fillRect(x + 6, 0, 4, S); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(x + 11, 0, 2, S); }
  for (x = 10; x < S; x += 22) { g.fillStyle = 'rgba(24,26,32,0.3)'; g.fillRect(0, x, S, 2); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, x + 2, S, 1); }
  for (i = 0; i < 40; i++) { g.fillStyle = R() > 0.5 ? 'rgba(20,22,26,0.2)' : 'rgba(240,238,232,0.3)'; g.fillRect(R() * S, R() * S, 2, 2); }
  return (_t.t = TX(c));
}
function texBrick() { /* 青砖墙：基色 + 错缝砌层 + 砖块色差 + 风化竖渍 + 缝上高光 */
  if (_t.b) return _t.b; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(942), x, y, i;
  g.fillStyle = '#d4d2cc'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = (y / 16) % 2 ? 0 : 16; x < S + 16; x += 32) {
    g.fillStyle = 'rgba(' + (R() > 0.5 ? '255,255,250' : '80,78,74') + ',' + (0.04 + R() * 0.1).toFixed(2) + ')'; g.fillRect(x - 16 + 2, y + 2, 28, 12);
    g.fillStyle = 'rgba(58,58,60,0.45)'; g.fillRect(x - 16, y, 32, 2); g.fillRect(x - 16, y, 2, 16); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x - 14, y + 2, 28, 1);
  }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(60,58,54,0.06)'; g.fillRect(R() * S, R() * S * 0.5, 3 + R() * 4, 30 + R() * 40); }
  return (_t.b = TX(c));
}
function texWood() { /* 木纹：基色 + 竖向纹理 + 节疤 + 顺纹高光 */
  if (_t.w) return _t.w; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(946), i;
  g.fillStyle = '#d8c6aa'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(96,66,38,' + (0.08 + R() * 0.1).toFixed(2) + ')'; g.fillRect(i * 5 + R() * 2, 0, 1 + R() * 2, S); }
  for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(70,46,24,0.5)'; g.beginPath(); g.ellipse(R() * S, R() * S, 2 + R() * 2, 4 + R() * 3, 0, 0, PI * 2); g.fill(); }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(255,240,214,0.25)'; g.fillRect(R() * S, 0, 1, S); }
  return (_t.w = TX(c));
}
function texFabric(a, b) { /* 篷布：基色（可选条纹）+ 经纬织纹 + 褶皱渍 */
  var key = 'f' + (a || '') + (b || ''); if (_t[key]) return _t[key]; var S = 64, c = cv(S, S), g = c.getContext('2d'), R = lcg(952), i;
  g.fillStyle = a || '#e4e0d6'; g.fillRect(0, 0, S, S); if (b) { g.fillStyle = b; for (i = 0; i < S; i += 16) g.fillRect(i, 0, 8, S); }
  for (i = 0; i < S; i += 3) { g.fillStyle = 'rgba(90,84,72,0.08)'; g.fillRect(i, 0, 1, S); g.fillStyle = 'rgba(255,255,250,0.10)'; g.fillRect(0, i, S, 1); }
  for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(70,64,54,0.06)'; g.fillRect(R() * S, R() * S, 8 + R() * 12, 4 + R() * 6); }
  return (_t[key] = TX(c));
}
function texPaint() { /* 彩画额枋（自着色）：青绿底 + 金边箍头 + 卡子图案 + 花心 */
  if (_t.p) return _t.p; var c = cv(256, 64), g = c.getContext('2d'), R = lcg(958), i, x;
  g.fillStyle = '#2e6068'; g.fillRect(0, 0, 256, 64); g.fillStyle = '#c9a13e'; g.fillRect(0, 0, 256, 6); g.fillRect(0, 58, 256, 6);
  for (i = 0; i < 8; i++) {
    x = i * 32 + 4; g.fillStyle = i % 2 ? '#356e78' : '#295a62'; g.fillRect(x, 10, 24, 44); g.fillStyle = '#c9a13e'; g.fillRect(x + 2, 14, 20, 3); g.fillRect(x + 2, 47, 20, 3);
    g.fillStyle = i % 2 ? '#e8e2d0' : '#c9a13e'; g.beginPath(); g.arc(x + 12, 32, 5 + R() * 2, 0, PI * 2); g.fill(); g.fillStyle = '#b23a2e'; g.fillRect(x + 9, 22, 6, 6);
  }
  return (_t.p = TX(c));
}
function texFood() { /* 摊案食盘（自着色）：布面 + 白盘 + 各色小吃 + 高光 */
  if (_t.fd) return _t.fd; var c = cv(128, 64), g = c.getContext('2d'), R = lcg(962), FC = ['#8a5a2e', '#d8a832', '#b03a28', '#6a8a3a', '#c47f30'], i, x, y;
  g.fillStyle = '#ded8c8'; g.fillRect(0, 0, 128, 64);
  for (i = 0; i < 6; i++) {
    x = 12 + (i % 3) * 40 + R() * 8; y = 16 + Math.floor(i / 3) * 28 + R() * 6;
    g.fillStyle = 'rgba(255,255,252,0.9)'; g.beginPath(); g.arc(x, y, 10, 0, PI * 2); g.fill(); g.fillStyle = FC[i % 5]; g.beginPath(); g.arc(x, y, 6, 0, PI * 2); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.arc(x - 2, y - 2, 2, 0, PI * 2); g.fill();
  }
  return (_t.fd = TX(c));
}
function signTex(txt, bg, fg) { /* 匾额：双线边框 + 题字 + 金粉噪点 */
  var c = cv(256, 64), g = c.getContext('2d'), R = lcg(966), i;
  g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54); g.lineWidth = 1.5; g.strokeRect(11, 11, 234, 42);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34);
  for (i = 0; i < 24; i++) { g.fillStyle = 'rgba(255,240,200,' + (0.06 + R() * 0.1).toFixed(2) + ')'; g.fillRect(R() * 256, R() * 64, 2, 1); }
  return TX(c);
}
var BK;
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function boxUV(g, w, h, d, k) { /* 按世界尺寸烘焙盒 UV（六面顺序 ±x,±y,±z），k=每单位重复数 */
  var a = g.attributes.uv, F = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], i, f;
  for (i = 0; i < a.count; i++) { f = F[Math.floor(i / 4)]; a.setXY(i, a.getX(i) * f[0] * k, a.getY(i) * f[1] * k); }
}
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { var g = new THREE.BoxGeometry(w, h, d); if (m.userData.k) boxUV(g, w, h, d, m.userData.k); put(m, xf(g, x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function TRI(m, w, h, d, x, y, z) { var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); put(m, xf(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), x, y, z)); }
function HIP(m, w, d, x, y, z, a, t) { /* 四坡顶：前后长坡 + 左右短坡 */
  t = t || 0.024; B(m, w + 0.05, t, d * 0.58, x, y, z + d * 0.22, -a, 0, 0); B(m, w + 0.05, t, d * 0.58, x, y, z - d * 0.22, a, 0, 0);
  B(m, w * 0.56, t, d + 0.03, x - w * 0.22, y, z, 0, 0, a); B(m, w * 0.56, t, d + 0.03, x + w * 0.22, y, z, 0, 0, -a);
}
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) { pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length; }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
    var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_26_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 26; g.userData.level = level;
  BK = {};
  var NS = [2, 3, 4, 5][level - 1], crown = [0.17, 0.2, 0.22, 0.24][level - 1], FB = function (h, a, b) { return M(h, { map: texFabric(a, b), rg: 0.95, k: 2 }); };
  var A = {
    pave: M(level >= 2 ? '#a5a095' : '#9d988d', { map: texStone(), rg: 0.94, k: 2 }), walk: M('#b5b0a4', { map: texStone(), rg: 0.92, k: 2.5 }),
    stone: M('#a9a49a', { map: texStone(), rg: 0.9, k: 2 }), stone2: M('#b8b3a8', { map: texStone(), rg: 0.88, k: 2.5 }),
    roof: M(level >= 3 ? '#454443' : '#4e4c4a', { map: texTile(), rg: 0.82, k: 2.5 }), groof: M(level === 1 ? '#5c5a56' : '#4a6a52', { map: texTile(), rg: level >= 2 ? 0.5 : 0.8, mt: level >= 2 ? 0.2 : 0, k: 2.5 }),
    wall: M(level === 1 ? '#b3ada2' : '#bdb7ab', { map: texBrick(), rg: 0.92, k: 3 }), plaster: M('#c2bcb0', { map: texFabric(), rg: 0.95, k: 4 }),
    wood: M('#6e4e36', { map: texWood(), rg: 0.85, k: 3 }), col: M(level >= 2 ? '#a83b2e' : '#a8a398', { rg: level >= 2 ? 0.5 : 0.9, mt: level >= 2 ? 0.15 : 0, map: level >= 2 ? texWood() : texStone() }),
    beam: level >= 2 ? M('#ffffff', { map: texPaint(), rg: 0.55, mt: 0.1, k: 0.9, pc: '#3b6664' }) : M('#7e6e5a', { map: texWood(), rg: 0.85, k: 3 }),
    doug: level >= 2 ? M('#ffffff', { map: texPaint(), rg: 0.55, mt: 0.1, k: 1.4, pc: '#3b6664' }) : M('#7e6e5a', { rg: 0.85 }),
    gold: M('#d6ac48', { rg: 0.35, mt: 0.7 }), pole: M('#6a5a4a', { map: texWood(), rg: 0.9 }),
    trunk: M('#6a5238', { map: texWood(), rg: 0.92 }), leaf: M('#7fa044', { rg: 0.95 }), leaf2: M('#98b64e', { rg: 0.95 }),
    dark: M('#3a3e44', { rg: 0.9 }), cnt: M('#ffffff', { map: texFood(), rg: 0.6, k: 1.6, pc: '#d8d2c4' })
  };
  var canopy = level === 1 ? [FB('#cfc9bc'), FB('#bab4a8')] : level === 2 ? [FB('#c8463a'), FB('#e8e2d4'), FB('#4a7fa8')]
    : level === 3 ? [FB('#c8463a'), FB('#6f9a4e'), FB('#e8e2d4')] : [FB('#d04a3c', '#d04a3c', '#f2ece0'), FB('#6f9a4e'), FB('#e8e2d4'), FB('#c8463a')];
  var win = MF('#5a5048', { rg: 0.3, mt: 0.35, em: '#ffd070', ei: [0.08, 0.22, 0.32, 0.42][level - 1] });
  var glow = MF('#8a6b48', { rg: 0.4, mt: 0.1, em: '#ffd76a', ei: 0.5 });
  var lan = MF('#c0362a', { rg: 0.55, mt: 0.1, em: '#ff5638', ei: 0.35 });
  var signM = level >= 2 ? MF('#2a4a52', { map: signTex('回民街', '#1d3a40', '#ffd98c'), em: '#ffcf8e', ei: level >= 4 ? 0.55 : 0.12, rg: 0.5 }) : null;
  /* 地面：石板窄巷 + 前广场；石牌楼（z≈0.9）：柱础/立柱/额枋/斗拱/瓦顶/匾额 */
  B(A.pave, 1.6, 0.06, 2.56, 0, 0.03, 0); B(A.walk, 1.6, 0.014, 0.44, 0, 0.066, 1.06); B(A.walk, 0.44, 0.012, 2.0, 0, 0.066, -0.16);
  for (var s = -1; s <= 1; s += 2) {
    B(A.stone2, 0.18, 0.1, 0.2, s * 0.36, 0.11, 0.9); Y(A.col, 0.048, 0.056, 0.95, 6, s * 0.36, 0.585, 0.9);
    B(A.stone2, 0.14, 0.08, 0.16, s * 0.64, 0.1, 0.9); Y(A.col, 0.038, 0.046, 0.66, 6, s * 0.64, 0.44, 0.9);
  }
  B(A.beam, 1.4, 0.07, 0.1, 0, 0.8, 0.9); B(A.beam, 1.22, 0.06, 0.1, 0, 0.91, 0.9); B(A.beam, 1.04, 0.09, 0.08, 0, 1.015, 0.9);
  if (level >= 2) for (var di = 0; di < 5; di++) B(A.doug, 0.07, 0.07, 0.13, -0.48 + di * 0.24, 1.09, 0.9);
  HIP(A.groof, 1.2, 0.46, 0, 1.18, 0.9, 0.5); B(level >= 4 ? A.gold : A.dark, 0.74, 0.035, 0.05, 0, 1.29, 0.9);
  if (level >= 4) { B(A.gold, 0.05, 0.08, 0.05, -0.34, 1.34, 0.9); B(A.gold, 0.05, 0.08, 0.05, 0.34, 1.34, 0.9); }
  B(level >= 2 ? signM : A.wood, 0.34, 0.12, 0.035, 0, 1.015, 0.945);
  if (level >= 4) for (var li = 0; li < 3; li++) { Y(A.dark, 0.006, 0.006, 0.06, 4, -0.3 + li * 0.3, 0.735, 0.9); O(lan, 0.045, -0.3 + li * 0.3, 0.68, 0.9); }
  /* 小吃摊 ×两侧（贴铺面、面向窄巷）：柜台/食案/撑杆/斜布篷/挡檐/暖光灯箱/灯笼 */
  for (var sd = -1; sd <= 1; sd += 2) for (var i = 0; i < NS; i++) {
    var x = sd * 0.37, z = 0.42 - i * (NS > 1 ? 1.1 / (NS - 1) : 0), cm = canopy[(i + (sd > 0 ? 1 : 0)) % canopy.length];
    B(A.wood, 0.26, 0.2, 0.26, x, 0.16, z); B(A.cnt, 0.29, 0.03, 0.29, x, 0.275, z);
    Y(A.pole, 0.014, 0.014, 0.44, 5, x, 0.5, z + 0.12); Y(A.pole, 0.014, 0.014, 0.44, 5, x, 0.5, z - 0.12);
    B(cm, 0.36, 0.014, 0.36, x, 0.72, z, 0, 0, sd * 0.22); B(cm, 0.36, 0.08, 0.012, x, 0.67, z - 0.17);
    if (level >= 3) { B(glow, 0.022, 0.1, 0.22, x - sd * 0.14, 0.2, z); O(lan, 0.04, x - sd * 0.1, 0.58, z - 0.16); }
  }
  /* 两侧两层铺面：石灰砖墙木窗 + 悬山深灰瓦 */
  for (var sd2 = -1; sd2 <= 1; sd2 += 2) for (var bi = 0; bi < 2; bi++) {
    var bz = -0.22 - bi * 0.52, bx = sd2 * 0.63;
    B(A.wall, 0.34, 0.74, 0.5, bx, 0.43, bz);
    B(A.roof, 0.34, 0.022, 0.56, bx, 0.86, bz + 0.12, -0.5, 0, 0); B(A.roof, 0.34, 0.022, 0.56, bx, 0.86, bz - 0.12, 0.5, 0, 0);
    TRI(A.wall, 0.3, 0.13, 0.03, bx, 0.83, bz - 0.265); TRI(A.wall, 0.3, 0.13, 0.03, bx, 0.83, bz + 0.235);
    B(win, 0.024, 0.15, 0.16, bx - sd2 * 0.175, 0.6, bz); B(A.wood, 0.026, 0.28, 0.4, bx - sd2 * 0.175, 0.2, bz);
  }
  /* 后排主楼：抹灰/砖墙 + 四坡顶 / lv2+ 屋顶平台 + lv3+ 栏杆；盆栽行道树（前角两株 + lv3+ 巷腰两株） */
  B(level === 1 ? A.plaster : A.wall, 1.56, 0.8, 0.3, 0, 0.46, -1.12);
  if (level === 1) HIP(A.roof, 1.5, 0.3, 0, 0.9, -1.12, 0.5);
  else { B(A.plaster, 1.5, 0.05, 0.28, 0, 0.885, -1.12); HIP(A.roof, 0.7, 0.28, -0.4, 0.94, -1.12, 0.5); B(A.wall, 0.6, 0.12, 0.22, -0.4, 0.95, -1.12); }
  if (level >= 3) { for (var ri = 0; ri < 7; ri++) B(A.dark, 0.025, 0.09, 0.025, 0.06 + ri * 0.11, 0.955, -0.985); B(A.dark, 0.7, 0.025, 0.025, 0.39, 1.0, -0.985); }
  for (var wi = 0; wi < 4; wi++) B(win, 0.16, 0.16, 0.02, -0.58 + wi * 0.39, 0.5, -0.965);
  for (var pi = 0; pi < (level >= 3 ? 4 : 2); pi++) {
    var px = pi % 2 ? 0.56 : -0.56, pz = pi < 2 ? 1.02 : 0.12, sg = pi % 2 ? 1 : -1;
    B(A.stone, 0.24, 0.14, 0.24, px, 0.13, pz); Y(A.trunk, 0.03, 0.045, 0.5, 6, px, 0.45, pz);
    O(A.leaf, crown, px, 0.76 + crown * 0.55, pz); O(A.leaf2, crown * 0.62, px - sg * crown * 0.5, 0.82 + crown * 0.45, pz + 0.04);
  }
  flush(g);
  g.userData.anim = [function (t) { win.emissiveIntensity = (0.5 + 0.5 * Math.sin(t * 1.3)) * 0.16 + [0.04, 0.14, 0.24, 0.34][level - 1]; }];
  if (level >= 3) g.userData.anim.push(function (t) {
    var s2 = 0.5 + 0.5 * Math.sin(t * 1.7 + 1.2);
    glow.emissiveIntensity = 0.38 + 0.3 * s2; lan.emissiveIntensity = 0.3 + 0.25 * s2;
    if (signM) signM.emissiveIntensity = (level >= 4 ? 0.5 : 0.1) + 0.22 * s2;
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[26] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
