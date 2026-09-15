/* 大富翁·现代写实棋盘（西安）格 30「大唐不夜城」—— 唐风金顶宫殿群 + 大雁塔 + 现代灯光秀（大件地标，满格 2.56²），四年代演进
 * 契约：window.Props3DModern[30](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z；每级 mesh ≤55（同材质手写合并）；
 *   Canvas ≤256px；零 Math.random（LCG）；动画 ≤2 项（塔身/楼宇窗暖光呼吸 / 水景纹理漂移+发光+LED 呼吸，240 帧无 NaN）。
 * 材质精修（对标 specials3d/tile29_water.js）：多层 Canvas（石板分缝倒角+风化 / 琉璃瓦垄搭接高光 / 塔砖错缝色差 / 红墙抹灰噪点 / 幕墙分格 / 焦散水面）、boxUV 按世界尺寸烘焙、
 *   rough/metal 分区（琉璃金顶 rg.45/mt.35、鎏金 rg.35/mt.7、幕墙 rg.3/mt.6、水面 rg.15/mt.1、抹灰 rg.9）、发光件独立 MF+呼吸，水面纹理每实例新建并 offset 漂移；自着色水面/LED 用 previewColor 供软渲染取色。
 * 年代特征（refs/modern/prop_30.png）：lv1 1990s 灰褐瓦低矮民房群+素土黄大雁塔+素广场+简素红门，无高楼树稀；lv2 2000s 前殿/后殿金顶初起+轴线树阵绿带+红墙金顶连廊+背景高楼初现；
 *   lv3 2010s 主殿双重檐金顶宫殿群成型主导+喷泉水池+成片高楼+红灯笼；lv4 2020s 金顶泛光更艳+轴线灯光秀水景光带+LED屏+高楼亮窗+满绿树阵，夜景辉光。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_30] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); } var _mc = {};
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
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; } var _t = {};
function texStone() { /* 广场石板：基色 + 板块色差 + 分缝/倒角高光 + 噪点 + 风化渍 */
  if (_t.s) return _t.s; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1230), x, y, i;
  g.fillStyle = '#dcd8cf'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 32) for (x = 0; x < S; x += 32) {
    g.fillStyle = 'rgba(' + (R() > 0.5 ? '255,252,246' : '90,86,78') + ',' + (0.04 + R() * 0.08).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 28);
    g.fillStyle = 'rgba(60,56,50,0.4)'; g.fillRect(x, y, 32, 2); g.fillRect(x, y, 2, 32); g.fillStyle = 'rgba(255,252,246,0.35)'; g.fillRect(x + 2, y + 2, 28, 1); g.fillRect(x + 2, y + 2, 1, 28);
  }
  for (i = 0; i < 60; i++) { g.fillStyle = R() > 0.5 ? 'rgba(60,56,50,0.16)' : 'rgba(255,252,246,0.3)'; g.fillRect(R() * S, R() * S, 2 + R() * 4, 2); }
  for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(70,66,58,0.07)'; g.fillRect(R() * S, R() * S, 10 + R() * 16, 6 + R() * 10); }
  return (_t.s = TX(c));
}
function texTile() { /* 琉璃瓦：浅金底 + 垄沟 + 横向搭接 + 垄脊高光 + 噪点 */
  if (_t.t) return _t.t; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1242), x, i;
  g.fillStyle = '#efe3bc'; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(x + 1, 0, 3, S); g.fillStyle = 'rgba(120,86,30,0.32)'; g.fillRect(x + 6, 0, 4, S); g.fillStyle = 'rgba(255,255,240,0.16)'; g.fillRect(x + 11, 0, 2, S); }
  for (x = 10; x < S; x += 22) { g.fillStyle = 'rgba(90,64,22,0.28)'; g.fillRect(0, x, S, 2); g.fillStyle = 'rgba(255,250,230,0.14)'; g.fillRect(0, x + 2, S, 1); }
  for (i = 0; i < 36; i++) { g.fillStyle = R() > 0.5 ? 'rgba(80,58,20,0.2)' : 'rgba(255,246,214,0.3)'; g.fillRect(R() * S, R() * S, 2, 2); }
  return (_t.t = TX(c));
}
function texBrick() { /* 塔身青砖：浅底 + 错缝砌层 + 砖块色差 + 风化竖渍 + 缝上高光 */
  if (_t.b) return _t.b; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1254), x, y, i;
  g.fillStyle = '#dccfb4'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = (y / 16) % 2 ? 0 : 16; x < S + 16; x += 32) {
    g.fillStyle = 'rgba(' + (R() > 0.5 ? '255,248,230' : '88,66,38') + ',' + (0.04 + R() * 0.1).toFixed(2) + ')'; g.fillRect(x - 14, y + 2, 28, 12);
    g.fillStyle = 'rgba(88,66,38,0.4)'; g.fillRect(x - 16, y, 32, 2); g.fillRect(x - 16, y, 2, 16); g.fillStyle = 'rgba(255,250,236,0.22)'; g.fillRect(x - 14, y + 2, 28, 1);
  }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(70,52,28,0.06)'; g.fillRect(R() * S, R() * S * 0.5, 3 + R() * 4, 30 + R() * 40); }
  return (_t.b = TX(c));
}
function texPlaster() { /* 抹灰/沥青：基色 + 细噪 + 横向拖痕 + 斑渍（无缝，材质色定调） */
  if (_t.p) return _t.p; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1262), i;
  g.fillStyle = '#dcd8d0'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 160; i++) { g.fillStyle = R() > 0.5 ? 'rgba(70,64,56,0.12)' : 'rgba(255,255,250,0.16)'; g.fillRect(R() * S, R() * S, 1 + R() * 3, 1 + R() * 2); }
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(70,64,56,0.06)'; g.fillRect(0, R() * S, S, 2 + R() * 4); g.fillStyle = 'rgba(60,56,50,0.05)'; g.fillRect(R() * S, R() * S, 14 + R() * 20, 8 + R() * 12); }
  return (_t.p = TX(c));
}
function texGlass() { /* 幕墙：浅蓝灰底 + 分格暗线 + 随机亮/暗窗格 + 竖向高光 */
  if (_t.g) return _t.g; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1270), x, y;
  g.fillStyle = '#d2d8de'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 16) { g.fillStyle = R() > 0.7 ? 'rgba(255,255,255,0.22)' : R() > 0.5 ? 'rgba(60,70,84,0.16)' : 'rgba(0,0,0,0)'; g.fillRect(x + 2, y + 2, 12, 12); }
  for (x = 0; x < S; x += 16) { g.fillStyle = 'rgba(50,58,68,0.5)'; g.fillRect(x, 0, 2, S); g.fillRect(0, x, S, 2); }
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(40, 0, 6, S);
  return (_t.g = TX(c));
}
function texWater(R) { /* 水面（自着色，每实例新建以供 offset 漂移）：蓝底 + 焦散波纹高光 + 深水斑 */
  var S = 128, c = cv(S, S), g = c.getContext('2d'), i, j;
  g.fillStyle = '#2f98cc'; g.fillRect(0, 0, S, S); g.strokeStyle = 'rgba(200,240,255,0.45)'; g.lineWidth = 2;
  for (i = 0; i < 6; i++) {
    g.beginPath(); for (j = 0; j <= 8; j++) { var x = j * 16, y = i * 22 + 8 * Math.sin(j * 1.3 + i); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
    g.beginPath(); for (j = 0; j <= 8; j++) { var x2 = i * 22 + 8 * Math.cos(j * 1.1 + i), y2 = j * 16; if (j) g.lineTo(x2, y2); else g.moveTo(x2, y2); } g.stroke();
  }
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(10,70,120,0.2)'; g.fillRect(R() * S, R() * S, 10 + R() * 8, 4 + R() * 4); }
  return TX(c);
}
function texLED() { /* 灯光秀屏（自着色，每实例新建）：品红/紫/青蓝渐变 + 扫描线 + 高亮字幕条 */
  var c = cv(128, 64), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 128, 64), i;
  gr.addColorStop(0, '#ff4e9b'); gr.addColorStop(0.5, '#7a4ee8'); gr.addColorStop(1, '#3fc6ff'); g.fillStyle = gr; g.fillRect(0, 0, 128, 64);
  for (i = 0; i < 64; i += 4) { g.fillStyle = 'rgba(0,0,30,0.12)'; g.fillRect(0, i, 128, 1); }
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(10, 14, 30, 8); g.fillRect(56, 34, 44, 8);
  return TX(c);
}
var BK; function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function boxUV(g, w, h, d, k) { /* 按世界尺寸烘焙盒 UV（六面顺序 ±x,±y,±z），k=每单位重复数 */
  var a = g.attributes.uv, F = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], i, f;
  for (i = 0; i < a.count; i++) { f = F[Math.floor(i / 4)]; a.setXY(i, a.getX(i) * f[0] * k, a.getY(i) * f[1] * k); }
}
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { var g = new THREE.BoxGeometry(w, h, d); if (m.userData.k) boxUV(g, w, h, d, m.userData.k); put(m, xf(g, x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function HIP(m, w, d, x, y, z, a, t) { /* 四坡顶（庑殿简化） */
  t = t || 0.026; B(m, w + 0.06, t, d * 0.58, x, y, z + d * 0.22, -a, 0, 0); B(m, w + 0.06, t, d * 0.58, x, y, z - d * 0.22, a, 0, 0);
  B(m, w * 0.56, t, d + 0.04, x - w * 0.22, y, z, 0, 0, a); B(m, w * 0.56, t, d + 0.04, x + w * 0.22, y, z, 0, 0, -a);
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
  var g = new THREE.Group(); g.name = 'prop_30_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 30; g.userData.level = level;
  BK = {}; var GL = level >= 2;
  var A = {
    plaza: M(level >= 3 ? '#95908a' : '#8f8a7f', { map: texStone(), rg: 0.94, k: 2 }), axis: M('#a8a396', { map: texStone(), rg: 0.92, k: 2.5 }), road: M('#6b7686', { map: texPlaster(), rg: 0.96, k: 2 }),
    red: M(GL ? '#93392c' : '#8a5a48', { map: texPlaster(), rg: 0.9, k: 3 }), gold: M(level >= 3 ? '#b8923a' : GL ? '#a8923e' : '#877650', { map: texTile(), rg: GL ? 0.45 : 0.8, mt: GL ? 0.35 : 0, k: 2.5 }),
    pag: M(level === 1 ? '#9c8862' : '#a58a5c', { map: texBrick(), rg: 0.9, k: 3 }), dark: M('#46443f', { map: texTile(), rg: 0.85, k: 2.5 }),
    trim: M('#b8922e', { rg: 0.35, mt: 0.7 }), grey: M('#9aa6b4', { map: texGlass(), rg: 0.3, mt: 0.6, k: 3 }), grey2: M('#8b97a5', { map: texGlass(), rg: 0.3, mt: 0.6, k: 3 }),
    trunk: M('#6a5238', { rg: 0.92 }), leaf: M('#6a7c42', { rg: 0.95 }), leaf2: M('#7e9050', { rg: 0.95 }), green: M('#66803e', { map: texPlaster(), rg: 0.95, k: 3 }),
    rim: M('#a8a397', { map: texStone(), rg: 0.9, k: 2.5 }), low: M(level === 1 ? '#95896f' : '#a0947c', { map: texBrick(), rg: 0.92, k: 3 })
  };
  var win = MF('#4a4c50', { rg: 0.3, mt: 0.35, em: '#ffd070', ei: [0.06, 0.15, 0.28, 0.45][level - 1] });
  var waterTex = level >= 3 ? texWater(lcg(1290 + level)) : null;
  var water = level >= 3 ? MF('#ffffff', { map: waterTex, k: 1.5, pc: '#3f98cc', rg: 0.15, mt: 0.1, em: '#7fd8ff', ei: level >= 4 ? 0.8 : 0.45 }) : null;
  var led = level >= 4 ? MF('#ffffff', { map: texLED(), em: '#ff5fa8', ei: 0.75, rg: 0.35 }) : null;
  var lan = MF('#c0362a', { rg: 0.55, mt: 0.1, em: '#ff6a42', ei: 0.4 });
  /* 台地广场 + 环路 + 中央轴线步道 + lv2+ 绿带；轴线山门（z=0.95）：红柱门廊 + 金顶 + 正脊鸱吻 + lv3+ 红灯笼 */
  B(A.plaza, 2.56, 0.06, 2.56, 0, 0.03, 0); B(A.axis, 0.5, 0.014, 1.8, 0, 0.066, 0.38);
  B(A.road, 2.56, 0.01, 0.22, 0, 0.062, 1.17); B(A.road, 0.22, 0.01, 2.56, -1.17, 0.062, 0); B(A.road, 0.22, 0.01, 2.56, 1.17, 0.062, 0);
  if (GL) { B(A.green, 0.18, 0.04, 1.5, -0.5, 0.08, 0.2); B(A.green, 0.18, 0.04, 1.5, 0.5, 0.08, 0.2); }
  for (var s = -1; s <= 1; s += 2) { B(A.red, 0.22, 0.46, 0.28, s * 0.4, 0.29, 0.95); B(A.trim, 0.28, 0.07, 0.34, s * 0.4, 0.095, 0.95); }
  B(A.red, 1.04, 0.12, 0.3, 0, 0.58, 0.95); HIP(A.gold, 1.2, 0.46, 0, 0.72, 0.95, 0.52); B(GL ? A.trim : A.dark, 0.9, 0.035, 0.05, 0, 0.83, 0.95);
  if (GL) for (var gf = 0; gf < 2; gf++) Y(A.trim, 0.014, 0.028, 0.1, 5, gf ? 0.45 : -0.45, 0.87, 0.95);
  if (level >= 3) for (var li = 0; li < 2; li++) { Y(A.dark, 0.006, 0.006, 0.06, 4, li ? 0.24 : -0.24, 0.62, 1.1); O(lan, 0.045, li ? 0.24 : -0.24, 0.565, 1.1); }
  /* 两翼（镜像）：前殿(lv2+) / 主殿双重檐(lv3+) / 后殿(lv2+)，未建成处为灰褐低矮民房；红墙金顶连廊；lv4 LED 屏 */
  for (var sd = -1; sd <= 1; sd += 2) {
    var hx = sd * 0.78;
    if (GL) { B(A.red, 0.56, 0.46, 0.46, hx, 0.29, 0.5); B(A.dark, 0.2, 0.24, 0.03, hx, 0.22, 0.745); HIP(A.gold, 0.68, 0.58, hx, 0.57, 0.5, 0.55); Y(A.trim, 0.012, 0.024, 0.1, 5, hx, 0.68, 0.5); }
    else for (var l1 = 0; l1 < 2; l1++) { B(A.low, 0.34, 0.26, 0.3, hx + (l1 ? sd * 0.2 : -sd * 0.16), 0.19, 0.5 + l1 * 0.18); B(A.dark, 0.4, 0.02, 0.36, hx + (l1 ? sd * 0.2 : -sd * 0.16), 0.33, 0.5 + l1 * 0.18, 0, 0, 0.3); }
    if (level >= 3) {
      B(A.red, 0.7, 0.6, 0.56, hx, 0.36, -0.25);
      for (var dc = 0; dc < 3; dc++) B(A.dark, 0.11, 0.15, 0.03, hx - 0.22 + dc * 0.22, 0.4, 0.035);
      HIP(A.gold, 0.84, 0.72, hx, 0.68, -0.25, 0.55); B(A.red, 0.36, 0.12, 0.3, hx, 0.8, -0.25);
      HIP(A.gold, 0.46, 0.4, hx, 0.9, -0.25, 0.55); Y(A.trim, 0.012, 0.022, 0.14, 5, hx, 1.02, -0.25); O(A.trim, 0.03, hx, 1.11, -0.25);
    } else for (var lo = 0; lo < 3; lo++) {
      var lz = -0.02 - lo * 0.26;
      B(A.low, 0.5 - lo * 0.06, 0.26 + lo * 0.03, 0.22, hx, 0.19 + lo * 0.015, lz);
      B(level <= 2 ? A.dark : A.gold, 0.56 - lo * 0.06, 0.02, 0.28, hx, 0.33 + lo * 0.03, lz, 0, 0, 0.3);
    }
    if (GL) { B(A.red, 0.5, 0.42, 0.42, hx, 0.27, -0.88); HIP(level >= 3 ? A.gold : A.dark, 0.6, 0.52, hx, 0.5, -0.88, 0.55); Y(A.trim, 0.012, 0.022, 0.1, 5, hx, 0.6, -0.88); }
    else { B(A.low, 0.42, 0.28, 0.34, hx, 0.2, -0.88); B(A.dark, 0.48, 0.02, 0.4, hx, 0.35, -0.88, 0, 0, 0.3); }
    B(A.red, 0.14, 0.24, 1.95, sd * 1.12, 0.18, -0.12);
    B(A.gold, 0.2, 0.022, 2.0, sd * 1.12, 0.315, -0.12, 0, 0, 0.28); B(A.gold, 0.2, 0.022, 2.0, sd * 1.12, 0.315, -0.12, 0, 0, -0.28);
    if (level >= 3) for (var ci = 0; ci < 4; ci++) B(A.dark, 0.03, 0.12, 0.03, sd * 1.12, 0.12, -0.75 + ci * 0.42);
    if (level >= 4) B(led, 0.4, 0.24, 0.025, hx, 0.34, 0.74);
  }
  /* 大雁塔（轴线端点，全年代地标）：方座 + 七层收分塔身 + 塔刹；背景高楼（lv2+，仅后排）：幕墙体块 + lv4 亮窗带 */
  B(A.rim, 0.62, 0.12, 0.62, 0, 0.12, -0.9);
  var tw = 0.5;
  for (var tier = 0; tier < 7; tier++) {
    var ty = 0.24 + tier * 0.14;
    B(A.pag, tw, 0.12, tw, 0, ty, -0.9); B(A.pag, tw + 0.06, 0.035, tw + 0.06, 0, ty + 0.072, -0.9);
    B(win, 0.07, 0.08, 0.03, 0, ty, -0.9 + (tw + 0.06) / 2 + 0.017); tw *= 0.905;
  }
  Y(A.trim, 0.016, 0.024, 0.16, 6, 0, 1.24, -0.9); O(A.trim, 0.035, 0, 1.34, -0.9);
  var towers = [[-1.1, 0.62], [1.1, 0.5], [-0.62, 0.44], [0.62, 0.56]], tN = level === 1 ? 0 : level === 2 ? 2 : 4;
  for (var tI = 0; tI < tN; tI++) {
    var tP = towers[tI], th = tP[1] + (level >= 4 ? 0.08 : 0);
    B(tI % 2 ? A.grey : A.grey2, 0.26, th, 0.2, tP[0], 0.06 + th / 2, -1.2);
    if (level >= 4) { B(win, 0.2, 0.04, 0.02, tP[0], 0.06 + th * 0.55, -1.09); B(win, 0.2, 0.04, 0.02, tP[0], 0.06 + th * 0.8, -1.09); }
  }
  /* 轴线树阵（逐年代繁茂）+ 周边行道树带（左右+前沿） + lv3+ 轴线喷泉水池（焦散水面 + lv4 喷射） */
  var spots = [[0.36, 0.8], [-0.36, 0.8], [0.36, 0.2], [-0.36, 0.2], [0.36, -0.45], [-0.36, -0.45]], cr = [0.08, 0.1, 0.12, 0.14][level - 1];
  for (var sp = [2, 4, 6, 6][level - 1]; sp--;) { var p2 = spots[sp]; Y(A.trunk, 0.02, 0.03, 0.3, 5, p2[0], 0.21, p2[1]); O(A.leaf, cr, p2[0], 0.4 + cr * 0.6, p2[1]); O(A.leaf2, cr * 0.6, p2[0] + cr * 0.5, 0.44 + cr * 0.4, p2[1] + 0.02); }
  for (var ri = 0; ri < 22; ri++) {
    if (level === 1 && ri % 2) continue;
    var rx = ri < 16 ? (ri % 2 ? 1.17 : -1.17) : -0.9 + (ri - 16) * 0.36, rz = ri < 16 ? 1.05 - Math.floor(ri / 2) * 0.3 : 1.17;
    Y(A.trunk, 0.016, 0.024, 0.22, 4, rx, 0.17, rz); O(A.leaf, 0.085 + level * 0.008, rx, 0.33, rz);
  }
  if (level >= 3) for (var pi = 0; pi < 2; pi++) {
    var pz = pi ? -0.05 : 0.55;
    B(A.rim, 0.6, 0.08, 0.44, 0, 0.1, pz); B(water, 0.52, 0.02, 0.36, 0, 0.14, pz);
    if (level >= 4) for (var wj = 0; wj < 3; wj++) Y(water, 0.012, 0.005, 0.12, 4, -0.16 + wj * 0.16, 0.2, pz);
  }
  flush(g);
  g.userData.anim = [function (t) { win.emissiveIntensity = (0.5 + 0.5 * Math.sin(t * 1.1)) * 0.14 + [0.03, 0.1, 0.2, 0.38][level - 1]; }];
  if (level >= 3) g.userData.anim.push(function (t) {
    var s2 = 0.5 + 0.5 * Math.sin(t * 1.8 + 0.5);
    water.emissiveIntensity = (level >= 4 ? 0.6 : 0.35) + 0.3 * s2; waterTex.offset.set((t * 0.02) % 1, (t * 0.013) % 1); lan.emissiveIntensity = 0.32 + 0.24 * s2;
    if (led) led.emissiveIntensity = 0.55 + 0.35 * s2;
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[30] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
