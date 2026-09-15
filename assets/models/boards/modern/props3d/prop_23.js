/* 大富翁·现代写实棋盘（苏）格 23「山塘街」—— 苏州水乡：河道 / 石拱桥 / 枕河人家 / 木铺店面，四年代演进
 * 契约：window.Props3DModern[23](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z（河道在前、街屋在后、拱桥在左）；
 * 每级 mesh ≤55：全部手写合并 BufferGeometry（同材质合一 mesh）；Canvas 纹理 ≤256px；零 Math.random（LCG 种子噪点）；动画 ≤2 项。
 * 二轮材质精修（对标 specials3d/tile29_water.js）：纹理多层化（基色+噪点+风化斑+分缝线+高光，瓦/墙/条石/水/木 5 套）；UV 按世界尺寸烘焙 boxUV
 *   （0.5m/重复，Extrude 同密度 uvD）；roughness/metalness 分区（水 0.12/0.45、玻璃 0.12/0.55、玻璃房 0.08/0.45、钢 0.42/0.65、瓦 0.72、石 0.92）；
 *   发光件（灯笼/橱窗/街灯/店招/lv4 驳岸灯带）独立材质 MF 每实例新建 + 呼吸；水面纹理每实例新建 + offset 漂移；userData.previewColor 记录设计色。
 * 年代特征（refs/modern/prop_23.png 四象限）：lv1 1990s 斑驳灰墙+木板门店面+素石驳岸矮墙+零星灯笼，树稀疏 2 棵，水浑浊灰绿，无街灯无篷；
 *   lv2 2000s 粉刷白墙+彩色布篷/橱窗+石栏望柱+行道树+灯笼成排+中排屋顶小披屋；lv3 2010s 木格栅挑檐+暖光橱窗+街灯列+中排平顶露台/玻璃阳光房+木船+屋顶盆栽；
 *   lv4 2020s 通高玻璃店面+发光店招「山塘街」+大玻璃亭/钢架+转角屋顶花架绿化+夜灯驳岸灯带+带篷画舫+垂柳树冠最茂 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_23] THREE 未定义'); return; }
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
function MF(h, o) { /* 动画/发光材质：每次全新实例（呼吸不跨实例共享） */
  o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; } if (o.map) m.map = o.map; m.userData.previewColor = h; return m;
}
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
var _t = {};
function texTile() { /* 小青瓦：垄脊高光→垄沟落影渐变 + 瓦口压接缝 + 噪点 + 风化白斑/苔斑 */
  if (_t.t) return _t.t; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2301), x, y, i;
  g.fillStyle = '#dfe2e7'; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 12) { var gr = g.createLinearGradient(x, 0, x + 12, 0); gr.addColorStop(0, 'rgba(255,255,255,0.34)'); gr.addColorStop(0.45, 'rgba(255,255,255,0.05)'); gr.addColorStop(0.62, 'rgba(16,18,22,0.5)'); gr.addColorStop(1, 'rgba(16,18,22,0.26)'); g.fillStyle = gr; g.fillRect(x, 0, 12, S); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x, 0, 1, S); }
  for (y = 6; y < S; y += 18) { g.fillStyle = 'rgba(14,16,20,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(0, y + 2, S, 1); }
  for (i = 0; i < 46; i++) { g.fillStyle = R() > 0.5 ? 'rgba(12,14,18,0.3)' : 'rgba(235,238,242,0.3)'; g.fillRect(R() * S, R() * S, 2, 2); }
  for (i = 0; i < 12; i++) { g.fillStyle = R() > 0.55 ? 'rgba(230,236,242,0.2)' : 'rgba(52,72,44,0.16)'; g.beginPath(); g.arc(R() * S, R() * S, 3 + R() * 7, 0, PI * 2); g.fill(); }
  return (_t.t = TX(c));
}
function texWall() { /* 粉墙：细粒噪 + 风化斑 + 发丝裂纹 + 墙脚返潮渐变 */
  if (_t.w) return _t.w; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2302), i, x0, y0;
  g.fillStyle = '#f0eee8'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 240; i++) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(96,100,96,0.08)'; g.fillRect(R() * S, R() * S, 1, 1); }
  for (i = 0; i < 26; i++) { g.fillStyle = R() > 0.5 ? 'rgba(148,144,134,0.12)' : 'rgba(120,126,118,0.1)'; g.beginPath(); g.arc(R() * S, R() * S, 5 + R() * 16, 0, PI * 2); g.fill(); }
  for (i = 0; i < 3; i++) { x0 = R() * S; y0 = R() * S * 0.7; g.strokeStyle = 'rgba(110,112,106,0.3)'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (R() - 0.5) * 10, y0 + 8 + R() * 14); g.lineTo(x0 + (R() - 0.5) * 16, y0 + 20 + R() * 18); g.stroke(); }
  var gr = g.createLinearGradient(0, S, 0, S - 26); gr.addColorStop(0, 'rgba(84,86,80,0.42)'); gr.addColorStop(1, 'rgba(84,86,80,0)'); g.fillStyle = gr; g.fillRect(0, S - 26, S, 26);
  return (_t.w = TX(c));
}
function texStone() { /* 条石：错缝双线（落影+倒角高光）+ 块内明度扰动 + 风化斑 */
  if (_t.s) return _t.s; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2303), x, y, i;
  g.fillStyle = '#e6e1d5'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 40) { g.fillStyle = 'rgba(255,255,255,' + (0.04 + R() * 0.08).toFixed(3) + ')'; g.fillRect(x + 2, y + 2, 38, 14); }
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(58,56,50,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(0, y + 2, S, 1);
    for (x = (y / 16) % 2 ? 0 : 20; x < S; x += 40) { g.fillStyle = 'rgba(58,56,50,0.5)'; g.fillRect(x, y, 2, 16); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(x + 2, y, 1, 16); } }
  for (i = 0; i < 54; i++) { g.fillStyle = R() > 0.5 ? 'rgba(88,84,76,0.16)' : 'rgba(255,254,248,0.24)'; g.fillRect(R() * S, R() * S, 3 + R() * 8, 2 + R() * 3); }
  return (_t.s = TX(c));
}
function texWater(fresh) { /* 河面：长波亮纹 + 细碎暗波 + 闪点；fresh=每实例新建（供 offset 漂移） */
  if (!fresh && _t.a) return _t.a; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2304), i;
  g.fillStyle = '#dfe7e3'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 46; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.1 + R() * 0.16).toFixed(3) + ')'; g.fillRect(R() * S, R() * S, 12 + R() * 34, 1.6); }
  for (i = 0; i < 60; i++) { g.fillStyle = 'rgba(38,58,54,0.13)'; g.fillRect(R() * S, R() * S, 6 + R() * 16, 1.2); }
  for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(R() * S, R() * S, 1.6, 1.6); }
  var t = TX(c); if (!fresh) _t.a = t; return t;
}
function texWood() { /* 木板：分缝（落影+板口高光）+ 木纹丝 + 节疤 */
  if (_t.o) return _t.o; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2305), y, i, yy;
  g.fillStyle = '#d8c9b4'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(56,40,24,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,244,224,0.3)'; g.fillRect(0, y + 2, S, 1);
    for (i = 0; i < 7; i++) { yy = y + 4 + R() * 10; g.strokeStyle = 'rgba(96,72,44,' + (0.1 + R() * 0.14).toFixed(3) + ')'; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(40, yy + (R() - 0.5) * 4, 88, yy + (R() - 0.5) * 4, S, yy + (R() - 0.5) * 2); g.stroke(); } }
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(74,52,30,0.4)'; g.fillRect(R() * S, R() * S, 4, 2); }
  return (_t.o = TX(c));
}
function signTex(txt, bg, fg) { var c = cv(256, 64), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",serif'; g.fillText(txt, 128, 34); return TX(c); }
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；UV 按世界尺寸烘焙 ---- */
var BK;
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function boxUV(g, s) { /* 面法线选投影平面，UV=世界坐标/米 → 每 s 米一重复，贴图密度全局一致 */
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
function TRI(m, b, h, t, x, y, z) { var s = new THREE.Shape(); s.moveTo(-b / 2, 0); s.lineTo(b / 2, 0); s.lineTo(0, h); s.closePath(); EX(m, s, t, x, y, z, PI / 2); } /* 山墙三角：底边沿 z，厚度沿 +x */
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
function tree(A, x, z, r, willow) { /* 香樟/垂柳：柳冠拉长下垂 */
  Y(A.trunk, r * 0.15, r * 0.22, r * 2.6, 6, x, r * 1.3, z);
  if (willow) { O(A.leaf2, r, x, r * 2.9, z, 1.1, 1.35, 1.1); O(A.leaf2, r * 0.55, x + r * 0.7, r * 2.3, z + r * 0.3, 1, 1.7, 1); O(A.leaf2, r * 0.55, x - r * 0.65, r * 2.2, z - r * 0.3, 1, 1.7, 1); }
  else { O(A.leaf, r, x, r * 3.1, z); O(A.leaf2, r * 0.7, x + r * 0.5, r * 3.4, z + r * 0.2); O(A.leaf, r * 0.6, x - r * 0.5, r * 3.0, z - r * 0.3); }
}
function house(A, L, x, w, z, d, h, mt, front, flat) { /* 枕河人家：粉墙 + 双坡小青瓦 + 山墙/马头墙 + 店面/窗 */
  var zf = z + d / 2 + 0.006, ang = 0.58, rise = d / 2 * Math.tan(ang), sl = d / 2 / Math.cos(ang) + 0.06, i, e, n, xk;
  B(A.wall, w, h, d, x, h / 2, z);
  if (flat) { /* 改平顶：女儿墙 */
    B(A.wall, w + 0.02, 0.05, 0.03, x, h + 0.025, z + d / 2); B(A.wall, w + 0.02, 0.05, 0.03, x, h + 0.025, z - d / 2); B(A.wall, 0.03, 0.05, d, x - w / 2, h + 0.025, z); B(A.wall, 0.03, 0.05, d, x + w / 2, h + 0.025, z);
  } else {
    B(A.roof, w + 0.08, 0.025, sl, x, h + rise / 2 - 0.01, z + d / 4 + 0.015, ang, 0, 0); B(A.roof, w + 0.08, 0.025, sl, x, h + rise / 2 - 0.01, z - d / 4 - 0.015, -ang, 0, 0);
    Y(A.ridge, 0.022, 0.022, w + 0.08, 6, x, h + rise + 0.005, z, 0, 0, PI / 2);
    TRI(A.wall, d, rise, 0.02, x - w / 2, h, z); TRI(A.wall, d, rise, 0.02, x + w / 2 - 0.02, h, z);
    for (i = 0; i < mt; i++) for (e = -1; e <= 1; e += 2) { /* 马头墙：阶梯山墙 + 瓦压顶 */
      var tw = d * (1 - i * 0.42), th = h + rise * (0.55 + i * 0.5) + 0.04, ex = x + e * (w / 2 - 0.01);
      B(A.wall, 0.045, th, tw, ex, th / 2, z); B(A.ridge, 0.09, 0.025, tw + 0.05, ex, th + 0.012, z);
    }
  }
  n = Math.max(2, Math.round(w / 0.17));
  for (i = 0; i < n; i++) { xk = x - w / 2 + (i + 0.5) * w / n; B(L >= 3 ? A.glass : A.woodD, 0.09, 0.12, 0.02, xk, h * 0.72, zf); if (L >= 3 && front) B(A.woodD, 0.11, 0.02, 0.03, xk, h * 0.64, zf + 0.006); }
  if (L >= 3 && front) B(A.wood, w * 0.9, 0.05, 0.02, x, h * 0.5, zf + 0.008); /* 木格栅栏板 */
  if (!front) return;
  if (L === 1) { B(A.wood, w * 0.82, 0.28, 0.02, x, 0.2, zf); B(A.dark, 0.11, 0.25, 0.024, x + w * 0.22, 0.185, zf); }
  else if (L === 2) { B(A.glass, w * 0.4, 0.22, 0.02, x - w * 0.18, 0.21, zf); B(A.wood, w * 0.3, 0.28, 0.02, x + w * 0.24, 0.2, zf); B(A.awn, w * 0.86, 0.015, 0.16, x, 0.39, zf + 0.075, -0.4, 0, 0); B(A.awn, w * 0.86, 0.04, 0.015, x, 0.355, zf + 0.15); }
  else { B(A.glow, w * (L === 4 ? 0.86 : 0.64), 0.28, 0.02, x - (L === 4 ? 0 : w * 0.09), 0.2, zf); B(L === 4 ? A.steel : A.woodD, w * 0.9, 0.03, 0.03, x, 0.355, zf + 0.005); if (L === 3) B(A.awn, w * 0.86, 0.015, 0.14, x, 0.4, zf + 0.06, -0.4, 0, 0); }
  var nl = L === 1 ? mt : (L >= 3 ? 3 : 2); for (i = 0; i < nl; i++) O(A.lan, 0.026, x - w / 2 + (i + 0.5) * w / nl, h - 0.04, zf + 0.045); /* 檐下灯笼 */
}
function arch(L2, r, top, sh) { /* 拱桥侧面轮廓：底边挖半圆拱 + 抛物线桥面 */
  var s = new THREE.Shape(); s.moveTo(-L2, 0); s.lineTo(-r, 0); s.absarc(0, 0, r, PI, 0, true); s.lineTo(L2, 0); s.lineTo(L2, sh);
  for (var i = 1; i <= 8; i++) { var t = L2 - i * L2 / 4; s.lineTo(t, top - (top - sh) * (t / L2) * (t / L2)); }
  s.closePath(); return s;
}
function boat(A, x, z, canopy) { B(A.boat, 0.3, 0.05, 0.1, x, 0.05, z); B(A.boat, 0.07, 0.035, 0.07, x + 0.18, 0.06, z); B(A.boat, 0.07, 0.035, 0.07, x - 0.18, 0.06, z); B(A.dark, 0.26, 0.012, 0.07, x, 0.078, z); if (canopy) { B(A.canopy, 0.16, 0.05, 0.11, x, 0.13, z); Y(A.wood, 0.006, 0.006, 0.06, 4, x - 0.07, 0.1, z); Y(A.wood, 0.006, 0.006, 0.06, 4, x + 0.07, 0.1, z); } }
/* ---- 山塘街四年代 ---- */
function build(L) {
  var g = new THREE.Group(); g.name = 'prop_23_lv' + L; g.userData.kind = 'property'; g.userData.propIdx = 23; g.userData.level = L;
  BK = {}; var i, k, e, t, wat = texWater(true);
  var A = {
    water: MF(['#7f968c', '#7a9a90', '#759b94', '#6f9c96'][L - 1], { map: wat, rg: 0.12, mt: 0.45 }), quay: M('#a8a296', { map: texStone(), rg: 0.92 }), bank: M('#9c9587', { map: texStone(), rg: 0.92 }),
    wall: M(L === 1 ? '#cfcac0' : '#ebe7de', { map: texWall(), rg: 0.9 }), roof: M('#3f434a', { map: texTile(), rg: 0.72 }), ridge: M('#33373e', { map: texTile(), rg: 0.7 }),
    wood: M('#7d6146', { map: texWood(), rg: 0.72 }), woodD: M('#4a3828', { rg: 0.78 }), dark: M('#2e3438', { rg: 0.9 }),
    stone: M('#b9b3a7', { map: texStone(), rg: 0.9 }), rail: M('#d9d4c8', { rg: 0.85 }), leaf: M('#566c42', { rg: 0.95 }), leaf2: M('#6f8752', { rg: 0.95 }), trunk: M('#4f3f2c', { rg: 0.9 }),
    glass: M('#33404a', { rg: 0.12, mt: 0.55 }), sky: M('#8fa6b4', { rg: 0.08, mt: 0.45, op: 0.55 }), steel: M('#6e757b', { rg: 0.42, mt: 0.65 }), boat: M('#6b5138', { map: texWood(), rg: 0.65 }), canopy: M('#e4dccb', { rg: 0.85 }),
    awn: M(['#a34a36', '#c0574a', '#7d3b31', '#2f3235'][L - 1], { rg: 0.9 }),
    lan: MF('#b8261f', { rg: 0.5, em: '#ff5a3c', ei: [0.25, 0.4, 0.55, 0.8][L - 1] }), glow: MF('#5a4a3a', { rg: 0.35, em: '#ffbe70', ei: L === 1 ? 0.12 : 0.4 }), lamp: MF('#ffe6b0', { rg: 0.3, em: '#ffd9a0', ei: 0.7 })
  };
  var signM = L >= 3 ? MF('#f2ead8', { map: signTex('山塘街', '#2b2f33', '#ffd98c'), em: '#ffcf8e', ei: L >= 4 ? 0.8 : 0.2, rg: 0.45 }) : null, strip = L >= 4 ? MF('#3a2f28', { em: '#ffc27a', ei: 0.5, rg: 0.4 }) : null; /* 店招 / lv4 驳岸灯带：发光件独立材质 */
  /* 地面：街屋地坪(z -1.05..0.08) + 河道(0.08..0.50) + 对岸驳岸(0.50..0.70)；UV 已按世界尺寸烘焙 */
  B(A.quay, 2.6, 0.06, 1.13, 0, 0.03, -0.485); B(A.water, 2.6, 0.03, 0.42, 0, 0.015, 0.29); B(A.bank, 2.6, 0.09, 0.2, 0, 0.045, 0.6);
  /* 临河栏：lv1 素石矮墙 / lv2+ 石栏望柱（桥头留口） */
  if (L === 1) { B(A.stone, 2.6, 0.05, 0.04, 0, 0.085, 0.07); B(A.stone, 2.6, 0.05, 0.04, 0, 0.115, 0.52); }
  else for (k = 0; k < 14; k++) { var px = -1.28 + k * 0.197; if (px < -0.92 || px > -0.5) { B(A.rail, 0.035, 0.13, 0.035, px, 0.125, 0.07); B(A.rail, 0.035, 0.13, 0.035, px, 0.155, 0.52); }
    if (k < 13 && (px < -0.92 || px > -0.5)) { B(A.rail, 0.197, 0.02, 0.02, px + 0.0985, 0.185, 0.07); B(A.rail, 0.197, 0.02, 0.02, px + 0.0985, 0.215, 0.52); } }
  if (L >= 4) B(strip, 2.5, 0.018, 0.02, 0, 0.078, 0.062); /* 驳岸夜灯带 */
  /* 石拱桥 x=-0.72 跨河（局部 x→世界 z） */
  var bx = -0.72, bz = 0.29, f = function (u) { return 0.38 - 0.25 * (u / 0.42) * (u / 0.42); };
  EX(A.stone, arch(0.42, 0.16, 0.38, 0.13), 0.3, bx - 0.15, 0, bz, PI / 2); B(A.dark, 0.2, 0.16, 0.32, bx, 0.08, bz);
  for (k = -3; k <= 3; k++) { t = k * 0.14; for (e = -1; e <= 1; e += 2) B(A.rail, 0.03, 0.12, 0.03, bx + e * 0.135, f(t) + 0.06, bz + t);
    if (k < 3) { var y0 = f(t), y1 = f(t + 0.14), an = Math.atan2(y1 - y0, 0.14); for (e = -1; e <= 1; e += 2) B(A.rail, 0.02, 0.02, 0.145, bx + e * 0.135, (y0 + y1) / 2 + 0.115, bz + t + 0.07, -an, 0, 0); } }
  B(A.stone, 0.3, 0.04, 0.08, bx, 0.08, bz - 0.46); B(A.stone, 0.3, 0.04, 0.08, bx, 0.11, bz + 0.46); /* 桥头踏步 */
  if (L >= 4) for (e = -1; e <= 1; e += 2) { B(A.lamp, 0.04, 0.04, 0.04, bx + e * 0.135, 0.48, bz); B(A.lamp, 0.04, 0.04, 0.04, bx + e * 0.135, 0.29, bz - 0.42); }
  /* 三排街屋：前排临街店屋 ×5（面河 +z）/ 中排 ×4（lv3+ 中间改平顶露台加高）/ 后排 ×3 */
  house(A, L, -1.02, 0.44, -0.28, 0.36, 0.58, 2, true, L >= 4); house(A, L, -0.6, 0.44, -0.28, 0.36, 0.5, 0, true); house(A, L, -0.14, 0.46, -0.28, 0.36, 0.54, 1, true);
  house(A, L, 0.34, 0.48, -0.28, 0.36, 0.5, 0, true); house(A, L, 0.94, 0.6, -0.28, 0.36, 0.56, 2, true);
  house(A, L, -0.96, 0.54, -0.6, 0.32, 0.7, 2, false); house(A, L, -0.4, 0.58, -0.6, 0.32, 0.62, 0, false); house(A, L, 0.2, 0.56, -0.6, 0.32, L >= 3 ? 0.88 : 0.74, 1, false, L >= 3); house(A, L, 0.86, 0.72, -0.6, 0.32, 0.64, 2, false);
  house(A, L, -0.9, 0.6, -0.9, 0.3, 0.66, 1, false); house(A, L, -0.2, 0.6, -0.9, 0.3, 0.6, 0, false); house(A, L, 0.6, 0.7, -0.9, 0.3, 0.7, 2, false);
  if (L === 2) { B(A.wall, 0.26, 0.14, 0.2, 0.2, 0.935, -0.6); Y(A.ridge, 0.02, 0.2, 0.09, 4, 0.2, 1.05, -0.6, 0, PI / 4, 0); } /* 中排屋顶小披屋 */
  if (L >= 3) { /* 中排平顶：玻璃阳光房 + 钢架 + 露台绿植 */
    var sh = L === 4 ? 0.3 : 0.24; B(A.sky, L === 4 ? 0.4 : 0.32, sh, 0.26, 0.2, 0.9 + sh / 2, -0.6); B(A.steel, L === 4 ? 0.44 : 0.36, 0.015, 0.3, 0.2, 0.9 + sh + 0.008, -0.6);
    for (e = -1; e <= 1; e += 2) B(A.steel, 0.012, sh, 0.012, 0.2 + e * (L === 4 ? 0.2 : 0.16), 0.9 + sh / 2, -0.46);
    O(A.leaf2, 0.05, -0.02, 0.94, -0.47); O(A.leaf2, 0.045, 0.42, 0.94, -0.47); O(A.leaf, 0.05, 0.44, 0.94, -0.73);
    B(signM, 0.4, 0.1, 0.03, -0.14, 0.46, -0.04); B(A.steel, 0.42, 0.015, 0.03, -0.14, 0.515, -0.04);
  }
  if (L >= 4) { /* 转角屋顶花架 + 绿化 + 第二店招 */
    for (k = 0; k < 5; k++) B(A.wood, 0.03, 0.02, 0.4, -1.2 + k * 0.09, 0.83, -0.28); for (e = -1; e <= 1; e += 2) { B(A.wood, 0.42, 0.02, 0.03, -1.02, 0.82, -0.28 + e * 0.18); Y(A.wood, 0.012, 0.012, 0.22, 5, -1.02 + e * 0.19, 0.72, -0.28 + e * 0.16); Y(A.wood, 0.012, 0.012, 0.22, 5, -1.02 - e * 0.19, 0.72, -0.28 + e * 0.16); }
    O(A.leaf2, 0.06, -1.14, 0.66, -0.18); O(A.leaf, 0.05, -0.9, 0.66, -0.38); O(A.leaf2, 0.045, -0.96, 0.65, -0.16); B(signM, 0.36, 0.09, 0.03, 0.94, 0.45, -0.04);
  }
  /* 树木：对岸行道树逐年代增密；左端街角大树 */
  var cr = [0.14, 0.16, 0.18, 0.19][L - 1]; tree(A, -1.02, -0.02, cr * 1.1, false); tree(A, -1.0, 0.6, cr, L >= 4); tree(A, 1.0, 0.6, cr, false);
  if (L >= 2) tree(A, 0.2, 0.6, cr * 0.9, false); if (L >= 3) { tree(A, -0.45, 0.6, cr * 0.85, true); tree(A, 0.72, 0.6, cr * 0.85, false); } if (L >= 4) { tree(A, -0.15, 0.6, cr * 0.8, true); tree(A, 0.5, 0.0, cr * 0.7, true); }
  /* 街灯（lv3+）/ 河上木船（lv3+，lv4 带篷画舫） */
  if (L >= 3) { var lx = [-0.3, 0.3, 0.9]; for (i = 0; i < lx.length; i++) { Y(A.steel, 0.01, 0.014, 0.36, 6, lx[i], 0.24, 0.0); B(A.lamp, 0.05, 0.04, 0.05, lx[i], 0.44, 0.0); } boat(A, 0.55, 0.29, false); }
  if (L >= 4) { boat(A, -0.1, 0.31, true); for (i = 0; i < 2; i++) { Y(A.steel, 0.01, 0.014, 0.3, 6, -0.5 + i * 1.1, 0.24, 0.66); B(A.lamp, 0.05, 0.04, 0.05, -0.5 + i * 1.1, 0.41, 0.66); } }
  flush(g);
  var lan = A.lan, glow = A.glow, lamp = A.lamp, e0 = lan.emissiveIntensity;
  g.userData.anim = [function (tt) { lan.emissiveIntensity = e0 + 0.15 * (0.5 + 0.5 * Math.sin(tt * 1.7)); wat.offset.x = (tt * 0.02) % 1; wat.offset.y = (tt * 0.013) % 1; }]; /* 灯笼呼吸 + 水纹漂移 */
  if (L >= 2) g.userData.anim.push(function (tt) { var s = 0.5 + 0.5 * Math.sin(tt * 1.1);
    glow.emissiveIntensity = 0.3 + 0.2 * s; lamp.emissiveIntensity = 0.55 + 0.2 * s; if (signM) signM.emissiveIntensity = (L >= 4 ? 0.6 : 0.12) + 0.2 * s; if (strip) strip.emissiveIntensity = 0.4 + 0.25 * s; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[23] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
