/* 大富翁·现代写实棋盘（杭）格 24「断桥烟雨」—— 西湖断桥：长石桥 / 湖心亭 / 柳岸 / 湖面游船，四年代演进
 * 契约：window.Props3DModern[24](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z（湖面在前、柳岸在左前、长桥向右后、岛亭在右后）；
 * 每级 mesh ≤55：全部手写合并 BufferGeometry（同材质合一 mesh）；Canvas 纹理 ≤256px；零 Math.random（LCG 种子噪点）；动画 ≤2 项。
 * 二轮材质精修（对标 specials3d/tile29_water.js）：纹理多层化（基色+噪点+风化/雾气+分缝线+高光：条石/方砖/青瓦/草地/湖面/木板 6 套）；
 *   UV 按世界尺寸烘焙 boxUV（0.5m/重复，Extrude 同密度 uvD）；roughness/metalness 分区（湖面 0.1/0.5 + 高光带 0.05/0.55、钢 0.42/0.65、瓦 0.72、石 0.9）；
 *   发光件（桥灯/岸灯/lv3+ 水榭暖光窗/lv4 灯笼）独立材质 MF 每实例新建 + 呼吸；湖面纹理每实例新建 + offset 漂移；userData.previewColor 记录设计色。
 * 年代特征（refs/modern/prop_24.png 四象限）：lv1 1990s 浑浊灰绿水+素石桥栏+素面小亭+木码头+树稀疏小+无船；lv2 2000s 水稍清+桥灯柱+亭加围栏+树变密+石板步道+木船；
 *   lv3 2010s 前岸水榭大厅（暖光窗）+景石花境+双头景观灯+垂柳成行+两艘游船+岸灯；lv4 2020s 樱花点缀+带篷画舫+亭/水榭挂灯笼夜灯+花坛+树冠最茂+水最清蓝 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_24] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
var _mc = {};
function M(h, o) {
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + o.em + '|' + o.ei + '|' + (o.map ? o.map.uuid : '') + '|' + (o.op || '');
  if (_mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) m.map = o.map; if (o.op) { m.transparent = true; m.opacity = o.op; }
  m.userData.previewColor = h; return (_mc[k] = m);
}
function MF(h, o) { o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, flatShading: true }); if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; } if (o.map) m.map = o.map; m.userData.previewColor = h; return m; } /* 发光件：每实例新建 */
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
var _t = {};
function texStone() { /* 条石：错缝双线（落影+倒角高光）+ 块内明度扰动 + 风化斑 */
  if (_t.s) return _t.s; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2403), x, y, i;
  g.fillStyle = '#e6e1d5'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 40) { g.fillStyle = 'rgba(255,255,255,' + (0.04 + R() * 0.08).toFixed(3) + ')'; g.fillRect(x + 2, y + 2, 38, 14); }
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(58,56,50,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(0, y + 2, S, 1);
    for (x = (y / 16) % 2 ? 0 : 20; x < S; x += 40) { g.fillStyle = 'rgba(58,56,50,0.5)'; g.fillRect(x, y, 2, 16); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(x + 2, y, 1, 16); } }
  for (i = 0; i < 54; i++) { g.fillStyle = R() > 0.5 ? 'rgba(88,84,76,0.16)' : 'rgba(255,254,248,0.24)'; g.fillRect(R() * S, R() * S, 3 + R() * 8, 2 + R() * 3); }
  return (_t.s = TX(c)); }
function texBrick2() { /* 方砖步道：网格缝落影 + 砖面明度扰动 + 砖口高光 */
  if (_t.b) return _t.b; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2406), x, y;
  g.fillStyle = '#e4dfd4'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,' + (0.02 + R() * 0.1).toFixed(3) + ')'; g.fillRect(x + 2, y + 2, 13, 13); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x + 2, y + 2, 13, 1); }
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(64,60,54,0.45)'; g.fillRect(0, y, S, 2); g.fillRect(y, 0, 2, S); }
  return (_t.b = TX(c)); }
function texTile() { /* 小青瓦：垄脊高光→垄沟落影渐变 + 瓦口压接缝 + 噪点 + 风化白斑/苔斑 */
  if (_t.t) return _t.t; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2401), x, y, i;
  g.fillStyle = '#dfe2e7'; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 12) { var gr = g.createLinearGradient(x, 0, x + 12, 0); gr.addColorStop(0, 'rgba(255,255,255,0.34)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.05)'); gr.addColorStop(0.62, 'rgba(16,18,22,0.5)'); gr.addColorStop(1, 'rgba(16,18,22,0.26)'); g.fillStyle = gr; g.fillRect(x, 0, 12, S); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x, 0, 1, S); }
  for (y = 6; y < S; y += 18) { g.fillStyle = 'rgba(14,16,20,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(0, y + 2, S, 1); }
  for (i = 0; i < 46; i++) { g.fillStyle = R() > 0.5 ? 'rgba(12,14,18,0.3)' : 'rgba(235,238,242,0.3)'; g.fillRect(R() * S, R() * S, 2, 2); }
  for (i = 0; i < 12; i++) { g.fillStyle = R() > 0.55 ? 'rgba(230,236,242,0.2)' : 'rgba(52,72,44,0.16)'; g.beginPath(); g.arc(R() * S, R() * S, 3 + R() * 7, 0, PI * 2); g.fill(); }
  return (_t.t = TX(c)); }
function texFuzz() { /* 草地：深浅草斑 + 草丝短线 + 踩踏土斑 + 高光点 */
  if (_t.f) return _t.f; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2404), i;
  g.fillStyle = '#dfe4d6'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 90; i++) { g.fillStyle = R() > 0.5 ? 'rgba(70,84,52,0.2)' : 'rgba(240,244,224,0.16)'; g.beginPath(); g.arc(R() * S, R() * S, 3 + R() * 9, 0, PI * 2); g.fill(); }
  for (i = 0; i < 160; i++) { g.fillStyle = 'rgba(60,76,44,0.22)'; g.fillRect(R() * S, R() * S, 1, 2 + R() * 3); }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(150,132,104,0.16)'; g.beginPath(); g.arc(R() * S, R() * S, 5 + R() * 9, 0, PI * 2); g.fill(); }
  for (i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,240,0.28)'; g.fillRect(R() * S, R() * S, 1.5, 1.5); }
  return (_t.f = TX(c)); }
function texWater(fresh) { /* 湖面烟雨：长波亮纹 + 细碎暗波 + 雾气白斑 + 闪点；fresh=每实例新建（供 offset 漂移） */
  if (!fresh && _t.a) return _t.a; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2405), i;
  g.fillStyle = '#e0e8e8'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 44; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.12 + R() * 0.16).toFixed(3) + ')'; g.fillRect(R() * S, R() * S, 14 + R() * 36, 1.6); }
  for (i = 0; i < 56; i++) { g.fillStyle = 'rgba(46,66,66,0.12)'; g.fillRect(R() * S, R() * S, 6 + R() * 16, 1.2); }
  for (i = 0; i < 7; i++) { g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(R() * S, R() * S, 10 + R() * 18, 0, PI * 2); g.fill(); }
  for (i = 0; i < 22; i++) { g.fillStyle = 'rgba(255,255,255,0.36)'; g.fillRect(R() * S, R() * S, 1.6, 1.6); }
  var t = TX(c); if (!fresh) _t.a = t; return t; }
function texWood() { /* 木板：分缝（落影+板口高光）+ 木纹丝 + 节疤 */
  if (_t.o) return _t.o; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2407), y, i, yy;
  g.fillStyle = '#d8c9b4'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(56,40,24,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,244,224,0.3)'; g.fillRect(0, y + 2, S, 1);
    for (i = 0; i < 7; i++) { yy = y + 4 + R() * 10; g.strokeStyle = 'rgba(96,72,44,' + (0.1 + R() * 0.14).toFixed(3) + ')'; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(40, yy + (R() - 0.5) * 4, 88, yy + (R() - 0.5) * 4, S, yy + (R() - 0.5) * 2); g.stroke(); } }
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(74,52,30,0.4)'; g.fillRect(R() * S, R() * S, 4, 2); }
  return (_t.o = TX(c)); }
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；UV 按世界尺寸烘焙 ---- */
var BK;
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz, ord) { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0, ord || 'XYZ')), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function boxUV(g, s) { /* 面法线选投影平面，UV=局部坐标/米 → 每 s 米一重复，贴图密度全局一致 */
  var p = g.attributes.position, n = g.attributes.normal, a = new Float32Array(p.count * 2), i;
  for (i = 0; i < p.count; i++) { var nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
    if (nx >= ny && nx >= nz) { a[i * 2] = p.getZ(i) / s; a[i * 2 + 1] = p.getY(i) / s; }
    else if (ny >= nz) { a[i * 2] = p.getX(i) / s; a[i * 2 + 1] = p.getZ(i) / s; }
    else { a[i * 2] = p.getX(i) / s; a[i * 2 + 1] = p.getY(i) / s; } }
  g.setAttribute('uv', new THREE.BufferAttribute(a, 2)); return g;
}
function uvD(g, s) { var a = g.attributes.uv, i; if (a) for (i = 0; i < a.count; i++) a.setXY(i, a.getX(i) / s, a.getY(i) / s); return g; } /* Extrude 世界坐标 UV → 同密度 */
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(boxUV(new THREE.BoxGeometry(w, h, d), 0.5), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z, sx, sy, sz) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z, 0, 0, 0, sx, sy, sz)); }
function EX(m, sh, d, x, y, z, ry) { put(m, xf(uvD(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 10 }), 0.5), x, y, z, 0, ry || 0, 0)); }
function EXH(m, sh, d, x, y, z) { put(m, xf(uvD(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 10 }), 0.5), x, y, z, -PI / 2, 0, 0)); } /* 水平板块：shape(x,y)→世界(x,-z) */
function BR(m, w, h, d, x, y, z, pt, yw) { put(m, xf(boxUV(new THREE.BoxGeometry(w, h, d), 0.5), x, y, z, pt || 0, yw || 0, 0, 1, 1, 1, 'YXZ')); } /* 俯仰+偏航（栏杆段/游船） */
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) { pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length; }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
    var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
/* ---- 部件 ---- */
function arch(L2, r, top, sh, ax) { /* 长桥侧面：低拱桥面 + 局部半圆桥洞(ax 处) */
  var s = new THREE.Shape(); s.moveTo(-L2, 0); s.lineTo(ax - r, 0); s.absarc(ax, 0, r, PI, 0, true); s.lineTo(L2, 0); s.lineTo(L2, sh);
  for (var i = 1; i <= 12; i++) { var t = L2 - i * (2 * L2 / 12); s.lineTo(t, sh + (top - sh) * (1 - (t / L2) * (t / L2))); }
  s.closePath(); return s;
}
function tree(A, x, z, r, kind) { /* kind: 0 香樟 / 1 垂柳 / 2 樱花 */
  Y(A.trunk, r * 0.14, r * 0.2, r * 2.6, 6, x, r * 1.3, z);
  var m = kind === 2 ? A.bloom : (kind === 1 ? A.leaf2 : A.leaf);
  if (kind === 1) { O(m, r, x, r * 2.9, z, 1.1, 1.35, 1.1); O(m, r * 0.5, x + r * 0.7, r * 2.3, z, 1, 1.7, 1); O(m, r * 0.5, x - r * 0.65, r * 2.2, z, 1, 1.7, 1); }
  else { O(m, r, x, r * 3.1, z); O(m, r * 0.7, x + r * 0.5, r * 3.4, z + r * 0.2); if (kind === 2) O(m, r * 0.6, x - r * 0.55, r * 3.0, z - r * 0.25); else O(A.leaf2, r * 0.6, x - r * 0.5, r * 3.0, z - r * 0.3); }
}
function pavilion(A, L, x, z, s, hang) { /* 湖心亭：石台 + 柱 + 双层四角攒尖 + 宝顶；s 缩放；lv4 挂灯笼 + 暖光窗 */
  B(A.stone, 0.6 * s, 0.07, 0.52 * s, x, 0.125, z);
  if (L >= 2) for (var k = 0; k < 8; k++) B(A.rail, 0.025, 0.09, 0.025, x + (k % 4 - 1.5) * 0.19 * s, 0.2, z + (k < 4 ? 0.24 : -0.24) * s);
  var cw = 0.17 * s, cd = 0.15 * s;
  for (var e = -1; e <= 1; e += 2) for (var f = -1; f <= 1; f += 2) Y(A.wood, 0.02 * s, 0.022 * s, 0.34 * s, 6, x + e * cw, 0.16 + 0.17 * s, z + f * cd);
  Y(A.roof, 0.16 * s, 0.44 * s, 0.15 * s, 4, x, 0.33 + 0.31 * s, z, 0, PI / 4, 0);
  B(A.wood, 0.18 * s, 0.13 * s, 0.16 * s, x, 0.33 + 0.375 * s, z);
  Y(A.roof, 0.03 * s, 0.3 * s, 0.16 * s, 4, x, 0.33 + 0.5 * s, z, 0, PI / 4, 0);
  Y(A.dark, 0.012 * s, 0.012 * s, 0.1 * s, 6, x, 0.33 + 0.63 * s, z); O(A.dark, 0.022 * s, x, 0.33 + 0.7 * s, z);
  if (hang) { for (e = -1; e <= 1; e += 2) O(A.lan, 0.035, x + e * cw * 1.5, 0.44, z); B(A.glowWin, 0.14 * s, 0.06 * s, 0.02, x, 0.33 + 0.375 * s, z + 0.08 * s + 0.006); }
}
function boat(A, x, z, yw, canopy, big) { /* 游船/画舫 */
  var L2 = big ? 0.22 : 0.15;
  BR(A.boat, L2 * 2, 0.05, big ? 0.13 : 0.1, x, 0.055, z, 0, yw); BR(A.boat, 0.08, 0.035, 0.07, x + Math.cos(yw) * L2, 0.06, z - Math.sin(yw) * L2, 0, yw); BR(A.boat, 0.08, 0.035, 0.07, x - Math.cos(yw) * L2, 0.06, z + Math.sin(yw) * L2, 0, yw);
  if (canopy) { BR(A.canopy, L2 * 1.5, 0.06, big ? 0.13 : 0.1, x, 0.13, z, 0, yw); BR(A.wood, 0.02, 0.05, 0.02, x + Math.cos(yw) * L2 * 0.6, 0.1, z - Math.sin(yw) * L2 * 0.6, 0, yw); BR(A.wood, 0.02, 0.05, 0.02, x - Math.cos(yw) * L2 * 0.6, 0.1, z + Math.sin(yw) * L2 * 0.6, 0, yw); }
}
/* ---- 断桥烟雨四年代 ---- */
function build(L) {
  var g = new THREE.Group(); g.name = 'prop_24_lv' + L; g.userData.kind = 'property'; g.userData.propIdx = 24; g.userData.level = L;
  BK = {}; var i, k, e, t, sn, cs, wat = texWater(true);
  var A = {
    water: MF(['#9aaaa5', '#95aaab', '#8fa9ae', '#88a8b0'][L - 1], { map: wat, rg: 0.1, mt: 0.5 }), waterHi: MF('#a9bcbc', { map: wat, rg: 0.05, mt: 0.55 }), grass: M('#607147', { map: texFuzz(), rg: 0.95 }), path: M('#aaa497', { map: texBrick2(), rg: 0.9 }),
    stone: M('#b9b3a9', { map: texStone(), rg: 0.9 }), rail: M('#dcd7cc', { rg: 0.82 }), roof: M('#33373d', { map: texTile(), rg: 0.72 }), wood: M('#7a4a33', { rg: 0.7 }), dark: M('#2e3438', { rg: 0.9 }),
    leaf: M('#5a7340', { rg: 0.95 }), leaf2: M('#7a9254', { rg: 0.95 }), bloom: M('#d9a0b8', { rg: 0.85 }), trunk: M('#54432f', { rg: 0.9 }), steel: M('#6e757b', { rg: 0.42, mt: 0.65 }),
    rock: M('#9a968c', { rg: 0.95 }), boat: M('#6b5138', { map: texWood(), rg: 0.65 }), canopy: M('#e4dccb', { rg: 0.85 }), flower: M(['#b8574a', '#c0574a', '#cf6a8a', '#d97fa0'][L - 1], { rg: 0.8 }),
    lan: MF('#b8261f', { rg: 0.5, em: '#ff5a3c', ei: [0.2, 0.35, 0.5, 0.8][L - 1] }), lamp: MF('#ffe6b0', { rg: 0.3, em: '#ffd9a0', ei: [0.3, 0.55, 0.7, 0.9][L - 1] }),
    glowWin: L >= 3 ? MF('#5a4a3a', { rg: 0.35, em: '#ffbe70', ei: 0.45 }) : null /* lv3+ 水榭/亭暖光窗 */
  };
  /* 湖面：椭圆大湖（2.6×2.4）+ 高光带分区（桥影带 + 湖心雾光带，紧贴水面不改剪影）+ 前岸柳岸 + 右后湖心岛（EXH 局部 y→世界 -z，椭圆弧封边） */
  (function () { var s = new THREE.Shape(); s.absellipse(0, 0, 1.3, 1.2, 0, PI * 2, false); EXH(A.water, s, 0.03, 0, 0, 0); })();
  B(A.waterHi, 1.0, 0.004, 0.36, 0.5, 0.032, 0.05, 0, 0.3, 0); B(A.waterHi, 1.2, 0.004, 0.14, -0.05, 0.032, -0.2, 0, 0.1698, 0);
  (function () { var s = new THREE.Shape(); /* 前岸：岸线三段弧，外缘贴椭圆 240°→150° */
    s.moveTo(-0.65, -1.04); s.quadraticCurveTo(-0.2, -0.75, -0.35, -0.6); s.quadraticCurveTo(-0.6, -0.4, -0.5, -0.2); s.quadraticCurveTo(-0.3, 0.0, -0.4, 0.15); s.quadraticCurveTo(-0.55, 0.4, -0.7, 0.45); s.lineTo(-1.126, 0.6); s.absellipse(0, 0, 1.28, 1.18, PI * 150 / 180, PI * 240 / 180, false); s.closePath(); EXH(A.grass, s, 0.09, 0, 0, 0); })();
  (function () { var s = new THREE.Shape(); /* 湖心岛：右后，外缘贴椭圆 75°→20° */
    s.moveTo(1.22, 0.41); s.quadraticCurveTo(1.0, 0.4, 0.9, 0.45); s.quadraticCurveTo(0.7, 0.5, 0.65, 0.6); s.quadraticCurveTo(0.55, 0.7, 0.5, 0.85); s.lineTo(0.336, 1.16); s.absellipse(0, 0, 1.28, 1.18, PI * 75 / 180, PI * 20 / 180, true); s.closePath(); EXH(A.grass, s, 0.085, 0, 0, 0); })();
  /* 步道（方砖）：沿岸 + 岛内 */
  B(A.path, 0.6, 0.095, 0.14, -0.65, 0.05, 0.78); B(A.path, 0.14, 0.095, 0.9, -1.0, 0.05, 0.05); B(A.path, 0.5, 0.095, 0.12, -0.7, 0.05, -0.05); B(A.path, 0.12, 0.095, 0.24, 1.05, 0.05, -0.55);
  /* 断桥：西岸(-1.05,-0.3) → 岛亭台(0.7,-0.6)，长而低的拱 + 偏岛侧桥洞 */
  var by = -0.45, bx0 = -0.175, ry = 0.1698, f = function (u) { return 0.09 + 0.14 * (1 - (u / 0.888) * (u / 0.888)); };
  sn = Math.sin(ry); cs = Math.cos(ry);
  EX(A.stone, arch(0.888, 0.12, 0.23, 0.09, 0.4), 0.3, bx0 - sn * 0.15, 0, by - cs * 0.15, ry); B(A.dark, 0.22, 0.11, 0.22, bx0 + 0.4 * cs, 0.055, by - 0.4 * sn, 0, ry, 0);
  for (k = 0; k <= 12; k++) { t = -0.84 + k * 0.14; var wx = bx0 + cs * t, wz = by - sn * t, yt = f(t);
    for (e = -1; e <= 1; e += 2) { B(A.rail, 0.028, 0.09, 0.028, wx + sn * e * 0.135, yt + 0.045, wz + cs * e * 0.135, 0, ry, 0); if (k < 12) B(A.rail, 0.145, 0.02, 0.02, wx + sn * e * 0.135 + cs * 0.07, yt + 0.098 + (f(t + 0.14) - yt) / 2, wz + cs * e * 0.135 - sn * 0.07, 0, ry, Math.atan2(f(t + 0.14) - yt, 0.14)); } }
  for (k = 0; k < 4; k++) { t = -0.63 + k * 0.42; Y(A.steel, 0.008, 0.011, 0.24, 5, bx0 + cs * t, f(t) + 0.11, by - sn * t); B(A.lamp, 0.05, 0.035, 0.05, bx0 + cs * t + 0.04, f(t) + 0.25, by - sn * t); if (L >= 3) B(A.lamp, 0.05, 0.035, 0.05, bx0 + cs * t - 0.04, f(t) + 0.25, by - sn * t); }
  /* 岛亭（逐年代微增）+ 岛上乔木 */
  pavilion(A, L, 0.82, -0.5, [0.9, 0.97, 1.04, 1.12][L - 1], L >= 4);
  var cr = [0.13, 0.15, 0.17, 0.19][L - 1];
  tree(A, 0.62, -0.84, cr * 1.1, 0); tree(A, 0.55, -0.55, cr, 1); tree(A, 1.1, -0.3, cr * 0.9, 0); tree(A, 0.95, -0.78, cr * 0.9, 1);
  if (L >= 2) tree(A, 1.06, -0.52, cr * 0.85, 0); if (L >= 4) { tree(A, 0.45, -0.75, cr * 0.9, 2); tree(A, 1.05, -0.68, cr * 0.8, 2); }
  /* 前岸柳岸：柳行 + 香樟（多株中等树冠）+ 花坛/景石（逐年代增）+ 岸边护栏 */
  tree(A, -1.05, 0.55, cr, 0); tree(A, -0.7, 0.62, cr * 0.95, 1); tree(A, -0.6, 0.8, cr * 0.9, 1); tree(A, -0.95, 0.15, cr * 0.9, 0); tree(A, -0.62, 0.2, cr * 0.9, 1); tree(A, -1.05, -0.2, cr * 0.85, 0);
  if (L >= 2) { tree(A, -0.8, 0.85, cr * 0.85, 1); tree(A, -0.75, -0.3, cr * 0.85, 0); tree(A, -0.85, -0.45, cr * 0.8, 1); }
  if (L >= 3) { tree(A, -1.1, -0.1, cr * 0.8, 1); tree(A, -0.85, 0.42, cr * 0.75, 0); O(A.rock, 0.06, -0.45, 0.12, 0.42, 1.4, 0.7, 1); O(A.rock, 0.05, -0.52, 0.12, 0.05, 1, 0.7, 1.3); O(A.flower, 0.045, -0.5, 0.13, 0.3); O(A.flower, 0.04, -0.55, 0.13, 0.45); }
  if (L >= 4) { for (k = 0; k < 3; k++) { B(A.stone, 0.14, 0.05, 0.1, -1.05 + k * 0.24, 0.115, 0.45); O(A.flower, 0.045, -1.05 + k * 0.24, 0.16, 0.45); O(A.leaf2, 0.035, -1.05 + k * 0.24, 0.16, 0.45); } }
  if (L >= 2) { for (k = 0; k < 6; k++) B(A.rail, 0.025, 0.08, 0.025, -0.38 - k * 0.03, 0.13, 0.55 - k * 0.07); BR(A.rail, 0.02, 0.02, 0.38, -0.455, 0.17, 0.375, 0, 0.405); }
  /* 临水码头/水榭（伸入湖面；lv1 木码头素亭 → lv3+ 大水榭 + 暖光窗） */
  var dx = -0.1, dz = 0.62;
  if (L <= 2) { B(A.boat, 0.44, 0.05, 0.3, dx, 0.12, dz); for (k = 0; k < 4; k++) Y(A.boat, 0.02, 0.02, 0.12, 5, dx - 0.18 + (k % 2) * 0.36, 0.06, dz - 0.12 + Math.floor(k / 2) * 0.24);
    for (e = -1; e <= 1; e += 2) for (var q = -1; q <= 1; q += 2) Y(A.wood, 0.014, 0.016, 0.26, 5, dx + e * 0.13, 0.25, dz + q * 0.11); Y(A.roof, 0.02, 0.19, 0.1, 4, dx, 0.43, dz, 0, PI / 4, 0); }
  else { B(A.stone, 0.56, 0.12, 0.4, dx, 0.09, dz); for (k = 0; k < 6; k++) B(A.rail, 0.025, 0.09, 0.025, dx - 0.2 + (k % 3) * 0.2, 0.2, dz + (k < 3 ? 0.18 : -0.18));
    for (e = -1; e <= 1; e += 2) for (q = -1; q <= 1; q += 2) Y(A.wood, 0.02, 0.022, 0.3, 6, dx + e * 0.2, 0.3, dz + q * 0.13);
    Y(A.roof, 0.14, 0.4, 0.14, 4, dx, 0.52, dz, 0, PI / 4, 0); B(A.wood, 0.3, 0.1, 0.22, dx, 0.58, dz); Y(A.roof, 0.025, 0.17, 0.11, 4, dx, 0.69, dz, 0, PI / 4, 0); Y(A.dark, 0.01, 0.01, 0.08, 6, dx, 0.78, dz);
    B(A.glowWin, 0.26, 0.06, 0.02, dx, 0.58, dz + 0.116); if (L >= 4) for (e = -1; e <= 1; e += 2) O(A.lan, 0.03, dx + e * 0.3, 0.42, dz); }
  /* 游船（lv2+ 递增）+ 岸灯（lv3+） */
  if (L >= 2) boat(A, 0.6, 0.15, 0.5, false, false); if (L >= 3) { boat(A, 0.95, -0.05, -0.7, false, false); Y(A.steel, 0.009, 0.012, 0.3, 5, -0.85, 0.24, 0.35); B(A.lamp, 0.06, 0.04, 0.04, -0.85, 0.4, 0.35); Y(A.steel, 0.009, 0.012, 0.3, 5, -0.75, 0.24, 0.8); B(A.lamp, 0.06, 0.04, 0.04, -0.75, 0.4, 0.8); }
  if (L >= 4) boat(A, 0.45, -0.15, 0.3, true, true);
  flush(g);
  var lan = A.lan, lamp = A.lamp, gw = A.glowWin, e0 = [0.3, 0.55, 0.7, 0.9][L - 1];
  g.userData.anim = [function (tt) { var s = 0.5 + 0.5 * Math.sin(tt * 1.3); lamp.emissiveIntensity = e0 + 0.15 * s; if (gw) gw.emissiveIntensity = 0.35 + 0.2 * s; wat.offset.x = (tt * 0.012) % 1; wat.offset.y = (tt * 0.008) % 1; }]; /* 灯呼吸 + 暖窗 + 水纹漂移 */
  if (L >= 4) g.userData.anim.push(function (tt) { lan.emissiveIntensity = 0.65 + 0.2 * (0.5 + 0.5 * Math.sin(tt * 1.9)); });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[24] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
