/* 大富翁·现代写实棋盘（西安）格 28「书院门」—— 青砖门楼 + 书画牌匾一条街（窄长街区），四年代演进
 * 契约：window.Props3DModern[28](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6（窄长 ~1.7×2.56）；底面 y=0；正面 +Z；
 * 每级 mesh ≤55（同材质手写合并）；Canvas ≤256px；零 Math.random（LCG）；动画 ≤2 项（铺面窗暖光呼吸 / 街灯+牌匾呼吸，240 帧无 NaN）。
 * 材质精修（对标 specials3d/tile29_water.js）：多层 Canvas（青砖错缝砌层+砖块色差+风化竖渍+缝上高光 / 石板分缝倒角 / 瓦垄搭接 / 木纹节疤 / 红漆金钉门）、
 *   boxUV 按世界尺寸烘焙、rough/metal 分区（玻璃 rg.3/mt.35、钢 rg.4/mt.8、鎏金 rg.35/mt.7、漆面 rg.45/mt.15、乌瓦 lv4 rg.65）、发光件独立 MF+呼吸；门钉纹理 previewColor 供软渲染取色。
 * 年代特征（refs/modern/prop_28.png 四象限）：lv1 1990s 素青砖门楼+暗木匾+木格栅封闭铺面+斑驳旧瓦，无树无灯；lv2 2000s 白石匾额+朱红门扇+檐下红灯笼+灰瓦齐整+街尾树木；
 *   lv3 2010s 蓝绿书画彩匾开敞门面+行道盆栽+路灯+浅色石板；lv4 2020s 暖光玻璃幕墙铺面+现代店招+乌黑齐整瓦面+金正脊+门楼泛光+花箱繁茂。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_28] THREE 未定义'); return; }
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
function texBrick() { /* 青砖墙：基色 + 错缝砌层 + 砖块色差 + 风化竖渍 + 缝上高光 */
  if (_t.b) return _t.b; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1026), x, y, i;
  g.fillStyle = '#d6d6d8'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = (y / 16) % 2 ? 0 : 16; x < S + 16; x += 32) {
    g.fillStyle = 'rgba(' + (R() > 0.5 ? '255,255,252' : '70,70,76') + ',' + (0.04 + R() * 0.1).toFixed(2) + ')'; g.fillRect(x - 14, y + 2, 28, 12);
    g.fillStyle = 'rgba(58,58,64,0.45)'; g.fillRect(x - 16, y, 32, 2); g.fillRect(x - 16, y, 2, 16); g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(x - 14, y + 2, 28, 1);
  }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(52,54,58,0.06)'; g.fillRect(R() * S, R() * S * 0.5, 3 + R() * 4, 30 + R() * 40); }
  for (i = 0; i < 40; i++) { g.fillStyle = R() > 0.5 ? 'rgba(45,45,50,0.2)' : 'rgba(255,255,252,0.3)'; g.fillRect(R() * S, R() * S, 2 + R() * 3, 1); }
  return (_t.b = TX(c));
}
function texStone() { /* 石板/条石：基色 + 板块色差 + 分缝/倒角高光 + 噪点 + 风化渍 */
  if (_t.s) return _t.s; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1030), x, y, i;
  g.fillStyle = '#d8d5cd'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 32) for (x = 0; x < S; x += 32) {
    g.fillStyle = 'rgba(' + (R() > 0.5 ? '255,252,246' : '90,88,82') + ',' + (0.04 + R() * 0.08).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 28);
    g.fillStyle = 'rgba(52,50,46,0.4)'; g.fillRect(x, y, 32, 2); g.fillRect(x, y, 2, 32); g.fillStyle = 'rgba(255,252,246,0.35)'; g.fillRect(x + 2, y + 2, 28, 1); g.fillRect(x + 2, y + 2, 1, 28);
  }
  for (i = 0; i < 70; i++) { g.fillStyle = R() > 0.5 ? 'rgba(52,50,46,0.18)' : 'rgba(255,252,246,0.3)'; g.fillRect(R() * S, R() * S, 2 + R() * 4, 2); }
  for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(70,66,58,0.07)'; g.fillRect(R() * S, R() * S, 10 + R() * 16, 6 + R() * 10); }
  return (_t.s = TX(c));
}
function texTile() { /* 瓦面：垄沟 + 横向搭接 + 垄脊高光 + 噪点 */
  if (_t.t) return _t.t; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1038), x, i;
  g.fillStyle = '#d4d0c8'; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(x + 1, 0, 3, S); g.fillStyle = 'rgba(35,38,44,0.35)'; g.fillRect(x + 6, 0, 4, S); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(x + 11, 0, 2, S); }
  for (x = 10; x < S; x += 22) { g.fillStyle = 'rgba(24,26,32,0.3)'; g.fillRect(0, x, S, 2); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, x + 2, S, 1); }
  for (i = 0; i < 40; i++) { g.fillStyle = R() > 0.5 ? 'rgba(20,22,26,0.2)' : 'rgba(240,238,232,0.3)'; g.fillRect(R() * S, R() * S, 2, 2); }
  return (_t.t = TX(c));
}
function texWood() { /* 木纹：基色 + 竖向纹理 + 节疤 + 顺纹高光 */
  if (_t.w) return _t.w; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1046), i;
  g.fillStyle = '#d8c6aa'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(96,66,38,' + (0.08 + R() * 0.1).toFixed(2) + ')'; g.fillRect(i * 5 + R() * 2, 0, 1 + R() * 2, S); }
  for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(70,46,24,0.5)'; g.beginPath(); g.ellipse(R() * S, R() * S, 2 + R() * 2, 4 + R() * 3, 0, 0, PI * 2); g.fill(); }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(255,240,214,0.25)'; g.fillRect(R() * S, 0, 1, S); }
  return (_t.w = TX(c));
}
function texDoor() { /* 朱漆门扇（自着色）：红漆底 + 竖向漆纹 + 边框暗线 + 鎏金门钉（带暗环/高光） */
  if (_t.d) return _t.d; var c = cv(64, 128), g = c.getContext('2d'), R = lcg(1052), i, j;
  g.fillStyle = '#9c3126'; g.fillRect(0, 0, 64, 128);
  for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(60,18,12,' + (0.06 + R() * 0.1).toFixed(2) + ')'; g.fillRect(i * 4.6 + R() * 2, 0, 1 + R(), 128); }
  g.fillStyle = 'rgba(50,14,10,0.55)'; g.fillRect(0, 0, 64, 3); g.fillRect(0, 125, 64, 3); g.fillRect(0, 0, 3, 128); g.fillRect(61, 0, 3, 128);
  for (i = 0; i < 2; i++) for (j = 0; j < 4; j++) {
    var x = 18 + i * 28, y = 16 + j * 32; g.fillStyle = 'rgba(40,10,6,0.6)'; g.beginPath(); g.arc(x, y, 6, 0, PI * 2); g.fill();
    g.fillStyle = '#d4ac3e'; g.beginPath(); g.arc(x, y, 5, 0, PI * 2); g.fill(); g.fillStyle = 'rgba(255,240,190,0.7)'; g.beginPath(); g.arc(x - 1.5, y - 1.5, 1.8, 0, PI * 2); g.fill();
  }
  return (_t.d = TX(c));
}
function signTex(txt, bg, fg) { /* 匾额：双线边框 + 题字 + 金粉噪点 */
  var c = cv(256, 64), g = c.getContext('2d'), R = lcg(1066), i;
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
function ARCH(m, r, len, x, y, z) { var geo = new THREE.CylinderGeometry(r, r, len, 12, 1, false, 0, PI); geo.rotateZ(PI / 2); geo.rotateY(PI / 2); put(m, xf(geo, x, y, z)); } /* 半圆拱券：轴沿 Z、拱背朝上 */
function HIP(m, w, d, x, y, z, a, t) { /* 四坡顶 */
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
  var g = new THREE.Group(); g.name = 'prop_28_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 28; g.userData.level = level;
  BK = {}; var GZ = 0.86;
  var A = {
    pave: M(level >= 3 ? '#a39d92' : '#9a9489', { map: texStone(), rg: 0.94, k: 2 }), walk: M('#b2ac9f', { map: texStone(), rg: 0.92, k: 2.5 }),
    brick: M(level === 1 ? '#a39f98' : '#aca79e', { map: texBrick(), rg: 0.92, k: 3 }), stone: M('#b0aba1', { map: texStone(), rg: 0.88, k: 2.5 }),
    roof: M(level >= 4 ? '#454648' : level === 1 ? '#585755' : '#4f5052', { map: texTile(), rg: level >= 4 ? 0.65 : 0.82, mt: level >= 4 ? 0.08 : 0, k: 2.5 }),
    wood: M('#5e4a36', { map: texWood(), rg: 0.85, k: 3 }), wood2: M('#7a6248', { map: texWood(), rg: 0.85, k: 3 }), red: M('#a83b2e', { rg: 0.45, mt: 0.15 }),
    door: M('#ffffff', { map: texDoor(), rg: 0.45, mt: 0.15, k: 6.5, pc: '#93392c' }),
    white: M('#e2ded4', { rg: 0.88 }), dark: M('#34373b', { rg: 0.92 }), gold: M('#d6ac48', { rg: 0.35, mt: 0.7 }),
    steel: M('#8a8f95', { rg: 0.4, mt: 0.8 }), trunk: M('#6a5238', { map: texWood(), rg: 0.92 }),
    leaf: M('#84995a', { rg: 0.95 }), leaf2: M('#9aae66', { rg: 0.95 }), box: M('#9a958b', { map: texStone(), rg: 0.9, k: 3 })
  };
  var win = MF(level >= 4 ? '#7a6a52' : '#4a3f32', { rg: level >= 4 ? 0.25 : 0.4, mt: level >= 4 ? 0.35 : 0.2, em: '#ffd070', ei: [0.1, 0.2, 0.3, 0.5][level - 1] });
  var lamp = MF('#ffe0a8', { rg: 0.3, mt: 0.1, em: '#ffe0a8', ei: 0.7 });
  var lan = MF('#c0362a', { rg: 0.55, mt: 0.1, em: '#ff5638', ei: 0.35 });
  var plaque = level >= 2 ? MF('#efece2', { map: signTex('书院门', '#ece8dc', '#2a2c30'), em: '#fff2cc', ei: level >= 4 ? 0.4 : 0.06, rg: 0.55 }) : null;
  var sign1 = level >= 3 ? MF('#3e5a72', { map: signTex('書畫', '#28527a', '#f0e6c8'), rg: 0.6 }) : null;
  var sign2 = level >= 3 ? MF('#8a3a2c', { map: signTex('文房', '#7a3226', '#f5d9a0'), rg: 0.6 }) : null;
  /* 地面：石板街 + 前广场 + 中央步道；青砖门楼（z=GZ）：城台 + 拱券门洞 + 朱漆门扇 + 台阶 + 门匾 + 城楼双重檐 */
  B(A.pave, 1.66, 0.06, 2.56, 0, 0.03, 0); B(A.walk, 1.66, 0.014, 0.36, 0, 0.066, 1.1); B(A.walk, 0.5, 0.012, 2.2, 0, 0.066, -0.14);
  B(A.brick, 1.1, 0.6, 0.5, 0, 0.36, GZ); B(A.stone, 1.16, 0.08, 0.56, 0, 0.1, GZ);
  ARCH(A.dark, 0.18, 0.46, 0, 0.36, GZ); B(A.dark, 0.36, 0.14, 0.46, 0, 0.26, GZ);
  if (level >= 2) { B(A.door, 0.15, 0.36, 0.03, -0.09, 0.28, GZ + 0.255); B(A.door, 0.15, 0.36, 0.03, 0.09, 0.28, GZ + 0.255); }
  for (var st = 0; st < 3; st++) B(A.stone, 1.0 - st * 0.1, 0.05, 0.12, 0, 0.082 + st * 0.048, 1.2 - st * 0.065);
  B(A.wood, 0.7, 0.09, 0.05, 0, 0.7, GZ + 0.26);
  B(level >= 2 ? plaque : A.dark, 0.6, 0.18, 0.04, 0, 0.71, GZ + 0.275);
  if (level >= 2) for (var gi = 0; gi < 2; gi++) { Y(A.dark, 0.006, 0.006, 0.06, 4, gi ? 0.26 : -0.26, 0.86, GZ + 0.27); O(lan, 0.045, gi ? 0.26 : -0.26, 0.8, GZ + 0.27); }
  B(A.brick, 0.9, 0.24, 0.4, 0, 0.78, GZ);
  for (var aw = 0; aw < 3; aw++) B(A.dark, 0.09, 0.12, 0.03, -0.26 + aw * 0.26, 0.78, GZ + 0.205);
  HIP(A.roof, 1.06, 0.56, 0, 0.94, GZ, 0.45);
  B(A.brick, 0.72, 0.2, 0.32, 0, 1.06, GZ);
  HIP(A.roof, 0.9, 0.5, 0, 1.2, GZ, 0.5); B(level >= 4 ? A.gold : A.dark, 0.5, 0.035, 0.05, 0, 1.31, GZ);
  if (level >= 3) for (var cp = 0; cp < 2; cp++) B(level >= 4 ? A.gold : A.dark, 0.045, 0.1, 0.045, cp ? 0.3 : -0.3, 1.3, GZ, 0, 0, cp ? -0.6 : 0.6);
  /* 门楼两翼两层铺面 + 两侧书画铺面 ×每侧3间：砖墙 + 门面（木格栅→彩匾→暖光玻璃）+ 四坡灰瓦 */
  for (var sd = -1; sd <= 1; sd += 2) {
    B(A.brick, 0.5, 0.62, 0.46, sd * 0.58, 0.37, GZ); HIP(A.roof, 0.5, 0.5, sd * 0.58, 0.74, GZ, 0.5);
    B(win, 0.16, 0.14, 0.02, sd * 0.58, 0.52, GZ + 0.24); B(level === 1 ? A.wood2 : win, 0.24, 0.24, 0.02, sd * 0.58, 0.22, GZ + 0.24);
    for (var si = 0; si < 3; si++) {
      var bx = sd * 0.6, bz = 0.22 - si * 0.54, sm = level >= 3 ? (si % 2 ? sign2 : sign1) : null;
      B(A.brick, 0.4, 0.56, 0.48, bx, 0.34, bz); HIP(A.roof, 0.4, 0.52, bx, 0.67, bz, 0.5);
      if (level === 1) { B(A.wood2, 0.026, 0.3, 0.38, bx - sd * 0.205, 0.24, bz); for (var lt = 0; lt < 3; lt++) B(A.wood, 0.03, 0.03, 0.1, bx - sd * 0.21, 0.16 + lt * 0.09, bz); }
      else B(win, 0.026, 0.3, 0.36, bx - sd * 0.205, 0.24, bz);
      B(sm || (level >= 2 ? A.red : A.wood), 0.03, 0.08, 0.28, bx - sd * 0.212, 0.46, bz);
    }
  }
  /* 后排临街楼：两栋四坡顶 + 街尾树木（lv2+）；行道盆栽（lv3+）+ 路灯 ×2（lv3+，lv4 点亮） */
  for (var hi = 0; hi < 2; hi++) {
    var hx = hi ? 0.42 : -0.42;
    B(A.brick, 0.76, 0.66, 0.3, hx, 0.39, -1.12); HIP(A.roof, 0.76, 0.34, hx, 0.76, -1.12, 0.5);
    for (var wb = 0; wb < 2; wb++) B(win, 0.14, 0.15, 0.02, hx - 0.18 + wb * 0.36, 0.4, -0.96);
  }
  var crown = [0, 0.15, 0.18, 0.21][level - 1];
  if (level >= 2) for (var ti = 0; ti < 2; ti++) {
    var tx = ti ? 0.62 : -0.62;
    Y(A.trunk, 0.03, 0.045, 0.5, 6, tx, 0.46, -1.06); O(A.leaf, crown, tx, 0.78 + crown * 0.5, -1.06);
    O(A.leaf2, crown * 0.6, tx - (ti ? 1 : -1) * crown * 0.5, 0.84 + crown * 0.4, -1.02);
  }
  if (level >= 3) for (var pi = 0; pi < (level >= 4 ? 6 : 4); pi++) {
    var px = pi % 2 ? 0.34 : -0.34, pz = 0.5 - Math.floor(pi / 2) * 0.55, cr2 = level >= 4 ? 0.13 : 0.11;
    B(A.box, 0.18, 0.12, 0.18, px, 0.12, pz); Y(A.trunk, 0.02, 0.03, 0.36, 5, px, 0.36, pz);
    O(A.leaf, cr2, px, 0.58 + cr2 * 0.5, pz); if (level >= 4) O(A.leaf2, cr2 * 0.6, px + 0.06, 0.64, pz + 0.03);
  }
  if (level >= 3) for (var li = 0; li < 2; li++) {
    var lx = li ? 0.4 : -0.4;
    Y(A.steel, 0.012, 0.016, 0.66, 6, lx, 0.39, 1.14); B(A.steel, 0.12, 0.014, 0.014, lx, 0.7, 1.1); B(level >= 4 ? lamp : A.steel, 0.06, 0.022, 0.045, lx, 0.69, 1.07);
  }
  flush(g);
  g.userData.anim = [function (t) { win.emissiveIntensity = (0.5 + 0.5 * Math.sin(t * 1.2)) * 0.15 + [0.05, 0.13, 0.22, 0.42][level - 1]; }];
  if (level >= 3) g.userData.anim.push(function (t) {
    var s2 = 0.5 + 0.5 * Math.sin(t * 1.5 + 0.8);
    lamp.emissiveIntensity = 0.55 + 0.3 * s2; lan.emissiveIntensity = 0.3 + 0.22 * s2;
    if (plaque) plaque.emissiveIntensity = (level >= 4 ? 0.35 : 0.05) + 0.15 * s2;
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[28] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
