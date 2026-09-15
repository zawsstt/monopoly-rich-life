/* 大富翁·富贵人生 — boards/modern/props3d/prop_14.js 沙面大街（现代写实·广州沙面欧陆历史街区）v2 材质精修
 * 四阶=四年代（refs/modern/prop_14.png）：lv1 1990s 纯欧陆低层群+教堂尖塔+暗绿树 / lv2 2000s 翻新粉刷+
 * 棕榈+现代中层出现 / lv3 2010s 中层楼群+穹顶楼 / lv4 2020s 玻璃塔楼群+最茂密绿荫。识别特征：
 * 珠江 L 形堤岸水面（前+左）+ 券廊殖民建筑（黄/粉/白·红瓦坡顶/平顶瓶栏）+ 哥特教堂尖塔 + 绿荫草坪。
 * v2（工艺对标 specials3d/tile29_water.js）：多层 Canvas（基色+LCG噪点+风化+分缝+高光，≤128px）、
 * 六区材质分区合并（灰泥 / 红瓦屋面 rough.7 / 玻璃金属 rough.15 metal.55 / 石材 / 草坪 / 植被）独立材质每实例
 * 新建、boxUV 按世界尺寸三平面烘焙（分区密度）、水面独立材质+呼吸+涟漪纹理。剪影与构图与 v1 完全一致。
 * 契约：window.Props3DModern[14](level)→Group；占地≤2.6²、底面 y=0、正面 +Z；每级 mesh≤55（v2=9/9/9/9）；
 * 零 Math.random（种子 LCG）；动画≤2（水光呼吸/涟漪 + 棕榈摇曳）；THREE r147 全局，无 import/export。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') return;
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function rng(s) { s = s >>> 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function mkCv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function tex(cv, rep) { var t = new THREE.CanvasTexture(cv); if (THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function cvTex(w, h, draw) { var cv = mkCv(w, h); draw(cv.getContext('2d'), w, h); return tex(cv, true); }
function noise(g, w, h, R, n, a, b) { for (var i = 0; i < n; i++) { g.fillStyle = (i % 2) ? a : b; g.fillRect(R() * w, R() * h, 1 + R() * 3, 1 + R() * 2); } }
function zoneMat(map, rough, metal) { return new THREE.MeshStandardMaterial({ vertexColors: true, map: map, roughness: rough, metalness: metal }); }
var UB = new THREE.BoxGeometry(1, 1, 1), UC = new THREE.CylinderGeometry(0.5, 0.5, 1, 10), USP = new THREE.SphereGeometry(0.5, 10, 8),
    UICO = new THREE.IcosahedronGeometry(0.5, 1), UCO4 = new THREE.ConeGeometry(0.5, 1, 4), UCO8 = new THREE.ConeGeometry(0.5, 1, 8),
    USPH = new THREE.SphereGeometry(0.5, 12, 8, 0, PI * 2, 0, PI / 2);
function MB(dens) { this.p = []; this.n = []; this.c = []; this.u = []; this.d = dens || 1.5; }
MB.prototype.put = function (g, hex, x, y, z, rx, ry, rz, sx, sy, sz) {
  var m = new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0),
    new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1));
  var ng = (g.index ? g.toNonIndexed() : g).clone(); ng.applyMatrix4(m);
  var nm = new THREE.Matrix3().getNormalMatrix(m), nv = new THREE.Vector3();
  var P = ng.attributes.position, N = ng.attributes.normal, col = C(hex), k, d = this.d, px, py, pz, ax, ay, az;
  for (k = 0; k < P.count; k++) {
    px = P.getX(k); py = P.getY(k); pz = P.getZ(k); nv.set(N.getX(k), N.getY(k), N.getZ(k)).applyMatrix3(nm);
    ax = Math.abs(nv.x); ay = Math.abs(nv.y); az = Math.abs(nv.z);
    this.p.push(px, py, pz); this.n.push(nv.x, nv.y, nv.z); this.c.push(col.r, col.g, col.b);
    if (ay >= ax && ay >= az) this.u.push(px * d, pz * d); else if (ax >= az) this.u.push(pz * d, py * d); else this.u.push(px * d, py * d);
  }
  return this;
};
MB.prototype.mesh = function (mat) {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
  var o = new THREE.Mesh(g, mat); o.castShadow = o.receiveShadow = true; return o;
};
/* ===== Canvas 纹理（≤128px，种子 LCG，多层：基色+噪点+风化+分缝+高光） ===== */
function texStucco() { return cvTex(128, 128, function (g, w, h) { var R = rng(1421), i; g.fillStyle = '#f6f2ea'; g.fillRect(0, 0, w, h); noise(g, w, h, R, 380, 'rgba(255,255,255,0.35)', 'rgba(140,120,100,0.10)'); g.fillStyle = 'rgba(150,130,105,0.12)'; g.fillRect(0, 62, w, 2); for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(120,100,70,0.07)'; g.fillRect(R() * w, R() * h, 8 + R() * 20, 4 + R() * 12); } g.fillStyle = 'rgba(96,84,70,0.12)'; g.fillRect(0, h - 12, w, 12); for (i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(R() * w, R() * h, 1, 1); } }); }
function texTile() { return cvTex(128, 128, function (g, w, h) { var R = rng(1422), r, k; g.fillStyle = '#f4ece6'; g.fillRect(0, 0, w, h); for (r = 0; r < 8; r++) { var y = r * 16; g.fillStyle = 'rgba(255,255,255,0.42)'; g.fillRect(0, y, w, 5); g.fillStyle = 'rgba(70,30,20,0.42)'; g.fillRect(0, y + 12, w, 4); g.fillStyle = 'rgba(70,30,20,0.38)'; for (k = 0; k < 8; k++) g.fillRect(((k * 16 + (r % 2) * 8) % w), y, 1, 16); } noise(g, w, h, R, 200, 'rgba(255,255,255,0.2)', 'rgba(70,30,20,0.16)'); }); }
function texStone() { return cvTex(128, 128, function (g, w, h) { var R = rng(1423), r, k; g.fillStyle = '#cfc9bc'; g.fillRect(0, 0, w, h); for (r = 0; r < 8; r++) { var y = r * 16; g.fillStyle = 'rgba(80,74,64,0.45)'; g.fillRect(0, y, w, 1); for (k = 0; k < 4; k++) { var x = ((k * 32 + (r % 2) * 16) % w); g.fillRect(x, y, 1, 16); g.fillStyle = (k % 2) ? 'rgba(255,255,255,0.14)' : 'rgba(80,74,64,0.10)'; g.fillRect(x + 1, y + 1, 30, 14); g.fillStyle = 'rgba(80,74,64,0.45)'; } } g.fillStyle = 'rgba(255,255,255,0.25)'; g.fillRect(0, 1, w, 1); for (r = 0; r < 8; r++) { g.fillStyle = 'rgba(110,120,90,0.14)'; g.fillRect(R() * w, h - 8 + R() * 6, 8 + R() * 14, 3); } noise(g, w, h, R, 240, 'rgba(255,255,255,0.2)', 'rgba(80,74,64,0.14)'); }); }
function texLawn() { return cvTex(64, 64, function (g, w, h) { var R = rng(1424), i; g.fillStyle = '#f0f6ea'; g.fillRect(0, 0, w, h); for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(20,60,10,0.10)'; g.fillRect(0, i * 8, w, 4); } noise(g, w, h, R, 180, 'rgba(255,255,255,0.35)', 'rgba(20,60,10,0.30)'); }); }
function texLeaf() { return cvTex(64, 64, function (g, w, h) { var R = rng(1425); g.fillStyle = '#eef4e6'; g.fillRect(0, 0, w, h); noise(g, w, h, R, 220, 'rgba(255,255,255,0.4)', 'rgba(20,50,10,0.38)'); }); }
function texCurtain() { return cvTex(128, 128, function (g, w, h) { var R = rng(1426), i, gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e8f0f6'); gr.addColorStop(1, '#bccfda'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (i = 0; i < 16; i++) { g.fillStyle = (i % 3) ? 'rgba(40,60,80,0.20)' : 'rgba(255,255,255,0.30)'; g.fillRect((i % 4) * 32 + 4, ((i / 4) | 0) * 32 + 4, 24, 12); } g.fillStyle = 'rgba(255,255,255,0.8)'; for (i = 0; i < 4; i++) { g.fillRect(i * 32, 0, 2, h); g.fillRect(0, i * 32, w, 2); } g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(70, 0, 14, h); g.fillRect(96, 0, 5, h); noise(g, w, h, R, 60, 'rgba(255,255,255,0.2)', 'rgba(30,50,70,0.12)'); }); }
function texWater() { var S = 128, cv = mkCv(S, S), g = cv.getContext('2d'), R = rng(1410), i, j; g.fillStyle = '#8aa6ac'; g.fillRect(0, 0, S, S); for (i = 0; i < 26; i++) { g.fillStyle = i % 3 ? 'rgba(210,236,232,0.30)' : 'rgba(38,84,86,0.28)'; g.fillRect(R() * S, R() * S, 14 + R() * 30, 1.6); } g.strokeStyle = 'rgba(220,244,240,0.18)'; g.lineWidth = 1; for (i = 0; i < 4; i++) { g.beginPath(); for (j = 0; j <= 8; j++) { var x = j * 16, y = i * 32 + 8 + 4 * Math.sin(j * 1.2 + i); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); } for (i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(R() * S, R() * S, 3 + R() * 8, 1); } return tex(cv, true); }
/* 岛基（草坪）/ L 形堤岸 + 瓶栏 / 步道 —— 分区：Z.s 石材 / Z.l 草坪 */
function island(Z) {
  var i, mb = Z.s;
  Z.l.put(UB, '#688050', 0.15, 0.05, -0.24, 0, 0, 0, 2.3, 0.1, 2.1);
  mb.put(UB, '#6e6658', 0.15, 0.05, 0.86, 0, 0, 0, 2.3, 0.1, 0.12);
  mb.put(UB, '#6e6658', -1.04, 0.05, -0.2, 0, 0, 0, 0.08, 0.1, 2.2);
  mb.put(UB, '#d8cc88', 0.15, 0.105, 0.64, 0, 0, 0, 2.3, 0.012, 0.36);
  mb.put(UB, '#d8cc88', -0.9, 0.105, -0.2, 0, 0, 0, 0.2, 0.012, 2.0);
  mb.put(UB, '#d8cc88', 0.15, 0.105, -0.12, 0, 0, 0, 2.3, 0.012, 0.16);
  mb.put(UB, '#e8e2d2', 0.15, 0.175, 0.905, 0, 0, 0, 2.3, 0.014, 0.022);
  mb.put(UB, '#e8e2d2', -1.03, 0.175, -0.2, 0, 0, 0, 0.022, 0.014, 2.2);
  for (i = 0; i < 8; i++) mb.put(UB, '#e8e2d2', -0.9 + i * 0.3, 0.142, 0.905, 0, 0, 0, 0.016, 0.062, 0.018);
  for (i = 0; i < 7; i++) mb.put(UB, '#e8e2d2', -1.03, 0.142, -1.1 + i * 0.3, 0, 0, 0, 0.018, 0.062, 0.016);
  mb.put(UB, '#d8e4de', 0, 0.06, 0.95, 0, 0, 0, 2.6, 0.008, 0.04);
  mb.put(UB, '#d8e4de', -1.07, 0.06, -0.2, 0, 0, 0, 0.04, 0.008, 2.2);
}
/* 欧陆殖民楼：券廊 + 白框窗（暗玻璃内芯）+ 屋顶（style 0 红瓦四坡 / 1 平顶瓶栏 / 2 平顶+山花+角穹）*/
function colo(Z, x, zc, w, d, h, wall, roof, style, lv) {
  var y0 = 0.1, zf = zc + d / 2, i, r, n = Math.max(3, Math.round(w / 0.15)), rows = h > 0.55 ? 2 : 1, mb = Z.w;
  mb.put(UB, wall, x, y0 + h / 2, zc, 0, 0, 0, w, h, d);
  mb.put(UB, '#c9bfa8', x, y0 + 0.016, zf + 0.006, 0, 0, 0, w, 0.032, 0.012);
  for (i = 0; i <= n; i++) mb.put(UB, '#f6f1e2', x - w / 2 + (i * w) / n, y0 + 0.062, zf + 0.012, 0, 0, 0, 0.028, 0.124, 0.024);
  for (i = 0; i < n; i++) Z.g.put(UB, '#5a5044', x - w / 2 + ((i + 0.5) * w) / n, y0 + 0.058, zf + 0.008, 0, 0, 0, (w / n) * 0.6, 0.112, 0.012);
  mb.put(UB, '#f6f1e2', x, y0 + 0.132, zf + 0.012, 0, 0, 0, w + 0.015, 0.022, 0.03);
  var nw = Math.max(2, Math.round(w / 0.2));
  for (r = 0; r < rows; r++) {
    var wy = y0 + 0.16 + (h - 0.16) * ((r + 0.55) / rows);
    mb.put(UB, '#f6f1e2', x, wy - 0.095, zf + 0.008, 0, 0, 0, w + 0.01, 0.018, 0.02);
    for (i = 0; i < nw; i++) {
      var wx = x - w / 2 + ((i + 0.5) * w) / nw;
      mb.put(UB, '#f8f4e8', wx, wy, zf + 0.01, 0, 0, 0, 0.085, 0.14, 0.01);
      Z.g.put(UB, i % 2 ? '#5a6e5a' : '#6e6254', wx, wy, zf + 0.016, 0, 0, 0, 0.062, 0.11, 0.008);
    }
  }
  mb.put(UB, '#f6f1e2', x, y0 + h + 0.008, zc, 0, 0, 0, w + 0.03, 0.018, d + 0.03);
  if (style === 0) {
    var rh = 0.09 + 0.02 * (lv >= 2);
    Z.r.put(UCO4, roof, x, y0 + h + rh / 2 + 0.012, zc, 0, PI / 4, 0, (w + 0.1) / 0.7071, rh, (d + 0.1) / 0.7071);
    Z.r.put(UB, '#8a4438', x, y0 + h + rh + 0.02, zc, 0, 0, 0, 0.03, 0.016, 0.03);
  } else {
    mb.put(UB, '#f6f1e2', x, y0 + h + 0.078, zf + 0.004, 0, 0, 0, w + 0.02, 0.012, 0.02);
    for (i = 0; i <= n; i++) mb.put(UB, '#f6f1e2', x - w / 2 + (i * w) / n, y0 + 0.045 + h, zf + 0.004, 0, 0, 0, 0.014, 0.06, 0.014);
    if (style === 2) { mb.put(UCO4, '#f6f1e2', x, y0 + h + 0.09, zf - 0.03, 0, PI / 4, 0, 0.32, 0.09, 0.09); if (lv >= 2) { Z.g.put(USPH, '#7a9c98', x + w / 2 - 0.08, y0 + h + 0.014, zc + d / 2 - 0.08, 0, 0, 0, 0.14, 0.11, 0.14); Z.g.put(UC, '#c8a850', x + w / 2 - 0.08, y0 + h + 0.15, zc + d / 2 - 0.08, 0, 0, 0, 0.008, 0.06, 0.008); } }
  }
}
/* 哥特教堂：殿身+扶壁+尖窗+陡坡顶+钟塔（4 小尖塔）+八棱尖塔+金十字 */
function church(Z, x, z, s) {
  var y0 = 0.1, i, tx = x + 0.15 * s, tz = z + 0.18 * s, mb = Z.w;
  mb.put(UB, '#ece4d0', x, y0 + 0.2 * s, z, 0, 0, 0, 0.4 * s, 0.4 * s, 0.56 * s);
  for (i = 0; i < 3; i++) mb.put(UB, '#d8ccb4', x - 0.21 * s, y0 + 0.14 * s, z + (i - 1) * 0.2 * s, 0, 0, 0, 0.04 * s, 0.28 * s, 0.05 * s);
  for (i = 0; i < 2; i++) Z.g.put(UB, '#3a3430', x - 0.205 * s, y0 + 0.24 * s, z + (i - 0.5) * 0.2 * s, 0, 0, 0, 0.01, 0.14 * s, 0.035 * s);
  Z.r.put(UCO4, '#6e7a80', x, y0 + 0.4 * s + 0.09 * s, z, 0, PI / 4, 0, (0.5 * s) / 0.7071, 0.18 * s, (0.66 * s) / 0.7071);
  mb.put(UB, '#ece4d0', tx, y0 + 0.31 * s, tz, 0, 0, 0, 0.16 * s, 0.62 * s, 0.16 * s);
  Z.g.put(UB, '#3a3430', tx, y0 + 0.46 * s, tz + 0.081 * s, 0, 0, 0, 0.06 * s, 0.1 * s, 0.01);
  Z.g.put(UB, '#3a3430', tx, y0 + 0.13 * s, tz + 0.081 * s, 0, 0, 0, 0.06 * s, 0.14 * s, 0.01);
  Z.g.put(UC, '#3a3430', x - 0.06 * s, y0 + 0.3 * s, z + 0.281 * s, PI / 2, 0, 0, 0.09 * s, 0.01, 0.09 * s);
  for (i = 0; i < 4; i++) Z.r.put(UCO8, '#5e6870', tx + (i % 2 ? 0.07 : -0.07) * s, y0 + 0.66 * s, tz + (i < 2 ? 0.07 : -0.07) * s, 0, 0, 0, 0.035 * s, 0.09 * s, 0.035 * s);
  Z.r.put(UCO8, '#5e6870', tx, y0 + 0.62 * s + 0.25 * s, tz, 0, 0, 0, 0.18 * s, 0.5 * s, 0.18 * s);
  Z.g.put(USP, '#c8a850', tx, y0 + 1.125 * s, tz, 0, 0, 0, 0.02 * s, 0.02 * s, 0.02 * s);
  Z.g.put(UB, '#c8a850', tx, y0 + 1.17 * s, tz, 0, 0, 0, 0.012 * s, 0.09 * s, 0.012 * s);
  Z.g.put(UB, '#c8a850', tx, y0 + 1.185 * s, tz, 0, 0, 0, 0.05 * s, 0.013 * s, 0.013 * s);
}
function domeB(Z, x, z, s) {
  var y0 = 0.1;
  Z.w.put(UB, '#e4d6ae', x, y0 + 0.24 * s, z, 0, 0, 0, 0.42 * s, 0.48 * s, 0.42 * s);
  Z.w.put(UB, '#f6f1e2', x, y0 + 0.48 * s + 0.01, z, 0, 0, 0, 0.45 * s, 0.02, 0.45 * s);
  Z.g.put(USPH, '#7a9c98', x, y0 + 0.48 * s, z, 0, 0, 0, 0.4 * s, 0.32 * s, 0.4 * s);
  Z.g.put(USP, '#c8a850', x, y0 + 0.48 * s + 0.34 * s, z, 0, 0, 0, 0.018 * s, 0.018 * s, 0.018 * s);
  Z.g.put(UC, '#c8a850', x, y0 + 0.48 * s + 0.38 * s, z, 0, 0, 0, 0.008 * s, 0.06 * s, 0.008 * s);
}
function modB(Z, x, w, d, h, hex, band, lv) {
  var y0 = 0.1, zc = -1.05, n = Math.max(3, Math.floor(h / 0.16)), i;
  Z.w.put(UB, hex, x, y0 + h / 2, zc, 0, 0, 0, w, h, d);
  for (i = 0; i < n; i++) Z.g.put(UB, band, x, y0 + 0.1 + (i + 0.5) * (h / n), zc + d / 2 + 0.006, 0, 0, 0, w * 0.9, (h / n) * 0.55, 0.012);
  if (lv >= 4) { Z.w.put(UB, '#e8ecef', x - w * 0.2, y0 + h / 2, zc + d / 2 + 0.008, 0, 0, 0, 0.014, h, 0.01); Z.w.put(UB, '#e8ecef', x + w * 0.2, y0 + h / 2, zc + d / 2 + 0.008, 0, 0, 0, 0.014, h, 0.01); Z.w.put(UB, '#78807c', x, y0 + h + 0.02, zc, 0, 0, 0, w * 0.4, 0.04, d * 0.5); }
  else Z.w.put(UB, '#8e887c', x, y0 + h + 0.012, zc, 0, 0, 0, w + 0.03, 0.024, d + 0.03);
  if (h > 1.55) Z.g.put(UC, '#6a7076', x, y0 + h + 0.09, zc, 0, 0, 0, 0.014, 0.13, 0.014);
}
function tree(Z, x, z, s, dark) {
  Z.w.put(UC, '#6e5238', x, 0.1 + 0.08 * s, z, 0, 0, 0, 0.03 * s, 0.16 * s, 0.03 * s);
  Z.v.put(UICO, dark ? '#2e5228' : '#4a703e', x, 0.1 + 0.2 * s, z, 0, 0.4, 0, 0.3 * s, 0.24 * s, 0.3 * s);
  Z.v.put(UICO, '#62844c', x + 0.03 * s, 0.1 + 0.3 * s, z - 0.02, 0, 1.1, 0, 0.2 * s, 0.15 * s, 0.2 * s);
}
function canopy(Z, x, z, s) {
  Z.v.put(UICO, '#2e5228', x, 0.1 + 0.26 * s, z, 0, 0.7, 0, 0.62 * s, 0.5 * s, 0.62 * s);
  Z.v.put(UICO, '#4a703e', x + 0.06, 0.1 + 0.38 * s, z - 0.05, 0, 1.3, 0, 0.4 * s, 0.3 * s, 0.4 * s);
}
function palm(mb, x, z, s) {
  mb.put(UC, '#8a6a48', x, 0.1 + 0.14 * s, z, 0.06, 0, 0.03, 0.024 * s, 0.3 * s, 0.024 * s);
  var tx = x + 0.02 * s, ty = 0.1 + 0.28 * s, i;
  for (i = 0; i < 6; i++) { var a = (i * 60 * PI) / 180; mb.put(UB, i % 2 ? '#4e8a3c' : '#5c9a48', tx + Math.sin(a) * 0.09 * s, ty + 0.008, z + Math.cos(a) * 0.09 * s, 0, a - PI / 2, -0.5, 0.22 * s, 0.012, 0.06 * s); }
  mb.put(USP, '#7a5c38', tx, ty, z, 0, 0, 0, 0.03 * s, 0.03 * s, 0.03 * s);
}
/* ================= 四阶（1990s→2020s） ================= */
function build(lv, anims) {
  var g = new THREE.Group(), pm = new MB(3), i, Z = { w: new MB(1.6), r: new MB(2.4), g: new MB(1.8), s: new MB(2), l: new MB(3), v: new MB(3) };
  island(Z);
  var walls = lv >= 2 ? ['#e6d478', '#e8d890', '#e6cca0', '#e0d490'] : ['#c4b47c', '#c8bc88', '#c4ac8c', '#c6bc8a'];
  colo(Z, -0.72, 0.24, 0.5, 0.5, 0.44, walls[0], '#a07a66', 0, lv);
  colo(Z, -0.16, 0.24, 0.5, 0.5, 0.62, walls[1], '#946e5c', 1, lv);
  colo(Z, 0.4, 0.24, 0.5, 0.5, 0.46, walls[2], '#a07a66', 0, lv);
  colo(Z, 0.94, 0.24, 0.44, 0.5, 0.5, walls[3], '#946e5c', 2, lv);
  colo(Z, -0.1, -0.42, 0.34, 0.36, 0.34, lv >= 2 ? '#e0d080' : '#c2b488', '#9c7660', 0, lv);
  colo(Z, 0.25, -0.42, 0.34, 0.36, 0.38, lv >= 2 ? '#e6d89a' : '#c6ba9c', '#946e5c', 0, lv);
  church(Z, 0.66, -0.5, lv >= 2 ? 1.15 : 0.9);
  if (lv >= 3) domeB(Z, -0.62, -0.58, lv >= 4 ? 1 : 0.9);
  var mods = [
    [],
    [[-0.5, 0.44, 0.6, '#c8ccd0'], [0.15, 0.4, 0.74, '#d0d4d6']],
    [[-0.78, 0.42, 0.9, '#c8d0d2'], [-0.4, 0.3, 1.6, '#ccd6da'], [0.05, 0.3, 1.05, '#c4cdd2'], [0.45, 0.44, 0.85, '#ccd4d6'], [0.95, 0.3, 1.1, '#c4c8cc']],
    [[-0.78, 0.42, 0.95, '#c8d2d4'], [-0.42, 0.3, 2.1, '#ccd8de'], [0.0, 0.28, 1.4, '#b8c6cc'], [0.38, 0.46, 1.0, '#ccd6da'], [0.88, 0.3, 1.3, '#c0ced4'], [1.14, 0.28, 0.8, '#c8d0d4']]
  ][lv - 1];
  for (i = 0; i < mods.length; i++) modB(Z, mods[i][0], mods[i][1], 0.36, mods[i][2], mods[i][3], lv >= 4 ? '#7ea8b8' : '#8ca8b0', lv);
  /* 绿荫：堤岸行道树 + 左岸树 + 街区大树冠 + 灌丛（lv 越高越密） */
  var prom = [-0.85, -0.45, -0.05, 0.35, 0.75, 1.1]; if (lv >= 3) prom = prom.concat([-0.65, 0.55]); if (lv >= 4) prom.push(0.15, 0.95);
  for (i = 0; i < prom.length; i++) tree(Z, prom[i], 0.64, 0.5 + 0.06 * lv + (i % 3) * 0.05, i % 2 === 0);
  var left = [0.2, -0.3, -0.8]; if (lv >= 2) left.push(-0.05); if (lv >= 3) left.push(-0.55, -1.05);
  for (i = 0; i < left.length; i++) tree(Z, -0.9, left[i], 0.52 + 0.05 * lv, i % 2 === 1);
  var cps = [[0.05, -0.7, 0.6], [1.1, -0.25, 0.65], [1.1, -0.6, 0.55], [-0.5, -0.22, 0.6]];
  if (lv < 3) cps.push([-0.55, -0.62, 0.85]); if (lv < 2) cps.push([-0.2, -0.9, 0.7]); if (lv >= 2) cps.push([0.66, -0.12, 0.5]); if (lv >= 4) cps.push([-0.3, -0.72, 0.5], [0.45, -0.72, 0.5]);
  for (i = 0; i < cps.length; i++) canopy(Z, cps[i][0], cps[i][1], cps[i][2]);
  for (i = 0; i < 5 + lv; i++) Z.v.put(UICO, '#587a48', -0.85 + (i * 2.0) / (4 + lv), 0.15, 0.5 + (i % 2) * 0.06, 0, i, 0, 0.18, 0.12, 0.18);
  palm(pm, -0.88, 0.56, 0.85); palm(pm, 1.08, 0.6, 0.75); if (lv >= 3) palm(pm, 0.15, 0.62, 0.7);
  /* 分区落地：六个独立材质（rough/metal 分区），每实例新建 */
  g.add(Z.w.mesh(zoneMat(texStucco(), 0.88, 0.02))); g.add(Z.r.mesh(zoneMat(texTile(), 0.72, 0.02)));
  g.add(Z.g.mesh(zoneMat(texCurtain(), 0.15, 0.55))); g.add(Z.s.mesh(zoneMat(texStone(), 0.9, 0.02)));
  g.add(Z.l.mesh(zoneMat(texLawn(), 0.95, 0))); g.add(Z.v.mesh(zoneMat(texLeaf(), 0.92, 0)));
  var palmGrp = new THREE.Group(); palmGrp.add(pm.mesh(zoneMat(texLeaf(), 0.92, 0))); g.add(palmGrp);
  var wm = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: texWater(), roughness: 0.2, metalness: 0.1, emissive: C('#5a8088'), emissiveIntensity: 0.06 });
  var wTex = wm.map;
  var w1 = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.014, 0.4), wm); w1.position.set(0, 0.052, 1.1); g.add(w1);
  var w2 = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.014, 2.2), wm); w2.position.set(-1.18, 0.052, -0.2); g.add(w2);
  anims.push(function (t) { wm.emissiveIntensity = 0.06 + 0.04 * Math.sin(t * 1.8); wTex.offset.x = (t * 0.012) % 1; });
  anims.push(function (t) { palmGrp.rotation.z = Math.sin(t * 1.35 + 0.6) * 0.022; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[14] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), anims = [], g = build(lv, anims);
  g.name = 'prop_14_lv' + lv; g.userData.kind = 'property'; g.userData.propIdx = 14; g.userData.level = lv; g.userData.region = 'g3';
  g.userData.anim = anims;
  return g;
};
})();
