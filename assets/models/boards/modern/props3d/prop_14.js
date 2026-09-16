/* 大富翁·富贵人生 — boards/modern/props3d/prop_14.js 沙面大街（现代写实·广州沙面欧陆历史街区）v3 结构+材质精修
 * 四阶=四年代（refs/modern/prop_14.png 四象限）：lv1 1990s 纯殖民楼群+教堂尖塔+堤岸绿荫 / lv2 2000s 翻新亮色+
 * 白色中层公寓出现 / lv3 2010s 中层加密+粉楼+教堂前红砖广场 / lv4 2020s 玻璃塔楼群+殖民楼玻璃翻新+入水大台阶。
 * 识别特征：珠江 L 形堤岸（前+左·花岗砌块堤壁+瓶饰栏杆+系船柱+入水台阶）+ 拱券券廊殖民楼（黄/粉/白·陶土
 * 双坡瓦顶+白檐口+山墙封板）+ 哥特教堂（钟塔+深灰八角尖塔+四角小尖塔+金十字+扶壁尖窗）+ 层叠树冠+棕榈。
 * R1 结构重构：单排棚屋→两排 7 栋错落+后区年代演进+教堂前广场；堤岸砌石/栏杆/灯柱/长凳/台阶；教堂重比例；
 *   屋面改双坡棱柱+正脊+封板；瓦色对齐参考陶土橙红；现代楼加阳台带/水箱/机房/桅杆。
 * R2 清偿：前排 4 栋错落留缝+右翼平顶小楼(lv2+)；中层细高化+lv3 第4栋+lv4 第3玻璃塔；树冠加大
 *   交错+lv3 补树；水面加宽调翠(rough.14)；棕榈加大；券廊暗龛/窗玻璃加深；尖塔收瘦。
 * R3/R4 打磨：堤岸浪花线；lv3+ 滨河第二排树；券廊布雨篷×4+教堂前广场花坛(lv2+)。
 * 契约：window.Props3DModern[14](level)→Group；占地≤2.6²、底面 y=0、正面 +Z；每级 mesh≤55（=9）；
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
function speck(g, w, h, R, n, a, b, mw, mh) { for (var i = 0; i < n; i++) { g.fillStyle = (i % 2) ? a : b; g.fillRect((R() * w) | 0, (R() * h) | 0, 1 + ((R() * mw) | 0), 1 + ((R() * mh) | 0)); } }
function zoneMat(map, rough, metal) { return new THREE.MeshStandardMaterial({ vertexColors: true, map: map, roughness: rough, metalness: metal }); }
var UB = new THREE.BoxGeometry(1, 1, 1), UC = new THREE.CylinderGeometry(0.5, 0.5, 1, 12), UCO4 = new THREE.ConeGeometry(0.5, 1, 4), UCO8 = new THREE.ConeGeometry(0.5, 1, 8),
    USPH = new THREE.SphereGeometry(0.5, 16, 12, 0, PI * 2, 0, PI / 2), UICO = new THREE.IcosahedronGeometry(0.5, 1);
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
  } return this; };
MB.prototype.mesh = function (mat) {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
  var o = new THREE.Mesh(g, mat); o.castShadow = o.receiveShadow = true; return o; };
function BX(bag, hex, x, y, z, sx, sy, sz) { bag.put(UB, hex, x, y, z, 0, 0, 0, sx, sy, sz); }
function CY(bag, hex, x, y, z, sx, sy, sz, ry) { bag.put(UC, hex, x, y, z, 0, ry || 0, 0, sx, sy, sz); }
/* ===== Canvas 纹理（≤128px·种子 LCG·多层） ===== */
function texStucco() { return cvTex(128, 128, function (g, w, h) { var R = rng(1421), i; g.fillStyle = '#f5f1e8'; g.fillRect(0, 0, w, h); speck(g, w, h, R, 320, 'rgba(255,255,255,0.4)', 'rgba(150,128,104,0.12)', 4, 3); for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(140,120,96,0.1)'; g.fillRect(R() * w, 0, 3 + R() * 5, h * (0.3 + R() * 0.5)); } g.fillStyle = 'rgba(96,84,70,0.15)'; g.fillRect(0, h - 14, w, 14); for (i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect((R() * w) | 0, (R() * h) | 0, 1, 1); } }); }
function texTile() { return cvTex(128, 128, function (g, w, h) { var R = rng(1422), r, k; g.fillStyle = '#efe2d2'; g.fillRect(0, 0, w, h); for (r = 0; r < 8; r++) { var y = r * 16; g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(0, y + 1, w, 5); g.fillStyle = 'rgba(60,26,14,0.5)'; g.fillRect(0, y + 11, w, 5); g.fillStyle = 'rgba(60,26,14,0.42)'; for (k = 0; k < 8; k++) g.fillRect((k * 16 + (r % 2) * 8) % w, y, 1.6, 16); } speck(g, w, h, R, 160, 'rgba(255,255,255,0.25)', 'rgba(70,32,18,0.2)', 6, 4); }); }
function texStone() { return cvTex(128, 128, function (g, w, h) { var R = rng(1423), r, c; g.fillStyle = '#6e685a'; g.fillRect(0, 0, w, h); for (r = 0; r < 4; r++) { var off = (r % 2) * 16; for (c = -1; c < 5; c++) { var v = 0.85 + R() * 0.28, x = c * 32 + off, y = r * 32; g.fillStyle = 'rgb(' + Math.round(198 * v) + ',' + Math.round(190 * v) + ',' + Math.round(172 * v) + ')'; g.fillRect(x + 2, y + 2, 28, 28); g.fillStyle = 'rgba(255,252,240,0.28)'; g.fillRect(x + 2, y + 2, 28, 2); g.fillRect(x + 2, y + 2, 2, 28); g.fillStyle = 'rgba(40,36,28,0.34)'; g.fillRect(x + 2, y + 28, 28, 2); g.fillRect(x + 28, y + 2, 2, 28); } } speck(g, w, h, R, 140, 'rgba(255,255,255,0.2)', 'rgba(70,64,52,0.2)', 4, 3); }); }
function texPave() { return cvTex(128, 128, function (g, w, h) { var R = rng(1424), r, c; g.fillStyle = '#8a867a'; g.fillRect(0, 0, w, h); for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) { var v = 0.86 + R() * 0.24, x = c * 32, y = r * 32; g.fillStyle = 'rgb(' + Math.round(196 * v) + ',' + Math.round(192 * v) + ',' + Math.round(178 * v) + ')'; g.fillRect(x + 2, y + 2, 28, 28); g.fillStyle = 'rgba(255,252,244,0.22)'; g.fillRect(x + 2, y + 2, 28, 2); g.fillStyle = 'rgba(52,48,42,0.3)'; g.fillRect(x + 2, y + 29, 28, 2); g.fillRect(x + 29, y + 2, 2, 28); } speck(g, w, h, R, 120, 'rgba(255,255,255,0.2)', 'rgba(70,66,58,0.18)', 5, 3); }); }
function texLawn() { return cvTex(64, 64, function (g, w, h) { var R = rng(1425), i; g.fillStyle = '#eef4e6'; g.fillRect(0, 0, w, h); for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(20,60,10,0.1)'; g.fillRect(0, i * 8, w, 4); } speck(g, w, h, R, 180, 'rgba(255,255,255,0.35)', 'rgba(20,60,10,0.3)', 3, 2); }); }
function texLeaf() { return cvTex(64, 64, function (g, w, h) { var R = rng(1426); g.fillStyle = '#e8f2de'; g.fillRect(0, 0, w, h); speck(g, w, h, R, 220, 'rgba(255,255,255,0.4)', 'rgba(20,50,10,0.38)', 5, 4); }); }
function texCurtain() { return cvTex(128, 128, function (g, w, h) { var R = rng(1427), i, gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#e8f0f6'); gr.addColorStop(1, '#bccfda'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (i = 0; i < 16; i++) { g.fillStyle = (i % 3) ? 'rgba(40,60,80,0.2)' : 'rgba(255,255,255,0.3)'; g.fillRect((i % 4) * 32 + 4, ((i / 4) | 0) * 32 + 4, 24, 12); } g.fillStyle = 'rgba(255,255,255,0.8)'; for (i = 0; i < 4; i++) { g.fillRect(i * 32, 0, 2, h); g.fillRect(0, i * 32, w, 2); } speck(g, w, h, R, 60, 'rgba(255,255,255,0.2)', 'rgba(30,50,70,0.12)', 4, 3); }); }
function texWater() { return cvTex(128, 128, function (g, w, h) { var R = rng(1410), i; g.fillStyle = '#7e9a90'; g.fillRect(0, 0, w, h); for (i = 0; i < 26; i++) { g.fillStyle = i % 3 ? 'rgba(212,234,226,0.32)' : 'rgba(28,70,70,0.3)'; g.fillRect(R() * w, R() * h, 14 + R() * 30, 1.6); } for (i = 0; i < 60; i++) { g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(R() * w, R() * h, 3 + R() * 8, 1); } }); }
/* 双坡棱柱（屋脊沿 x）+ 山墙三角封板 */
var _pg = {};
function prismG(w, d, hh) {
  var k = w + '_' + d + '_' + hh; if (_pg[k]) return _pg[k];
  var x = w / 2, z = d / 2, sl = Math.sqrt(z * z + hh * hh), A = [-x, 0, -z], B = [x, 0, -z], Cc = [x, 0, z], D = [-x, 0, z], E = [-x, hh, 0], F = [x, hh, 0], pos = [], nor = [], uv = [];
  function tri(a, b, c) {
    var e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    var n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]], l = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]) || 1; n[0] /= l; n[1] /= l; n[2] /= l;
    [a, b, c].forEach(function (p, i) { pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]); uv.push([0, 0, w][i], [0, sl, sl][i]); });
  }
  tri(D, Cc, F); tri(D, F, E); tri(B, A, E); tri(B, E, F);
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  _pg[k] = g; return g; }
var _tg = {};
function triG(d, hh) {
  var k = d + '_' + hh; if (_tg[k]) return _tg[k];
  var hd = d / 2, g = new THREE.BufferGeometry(), pos = [0, 0, -hd, 0, 0, hd, 0, hh, 0, 0, 0, hd, 0, 0, -hd, 0, hh, 0], nrm = [1, 0, 0, 1, 0, 0, 1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0], uv = [0, 0, d, 0, d / 2, hh, 0, 0, d, 0, d / 2, hh];
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  _tg[k] = g; return g; }
/* ===== 岛面 / 堤岸 / 广场 ===== */
function ground(Z, lv) {
  var i;
  BX(Z.p, '#b9b5a7', 0.12, 0.05, -0.12, 2.3, 0.1, 2.3);
  BX(Z.p, '#cfcaba', 0.12, 0.104, 0.88, 2.3, 0.012, 0.2); BX(Z.p, '#cfcaba', -0.9, 0.104, -0.1, 0.2, 0.012, 1.9); BX(Z.p, '#a49f90', 0.02, 0.103, 0.04, 1.86, 0.011, 0.13);
  BX(Z.p, lv >= 3 ? '#b4836a' : '#c2bcae', 0.78, 0.104, -0.02, 0.62, 0.011, 0.3); BX(Z.p, '#c8c3b2', 0.78, 0.1035, 0.2, 0.3, 0.01, 0.12);
  BX(Z.n, '#7d9a5e', -0.42, 0.102, -0.5, 0.85, 0.012, 0.45); BX(Z.n, '#7d9a5e', 1.02, 0.102, 0.3, 0.28, 0.012, 0.8); BX(Z.n, '#7d9a5e', -0.72, 0.102, 0.28, 0.24, 0.012, 0.72);
  BX(Z.s, '#d8d2c2', 0.12, 0.052, 1.0, 2.34, 0.105, 0.06); BX(Z.s, '#d8d2c2', -1.0, 0.052, -0.1, 0.06, 0.105, 2.15);
  BX(Z.w, '#efe9da', 0.12, 0.121, 0.985, 2.3, 0.008, 0.02); BX(Z.w, '#efe9da', -0.985, 0.121, -0.1, 0.02, 0.008, 2.0);
  for (i = 0; i < 10; i++) BX(Z.w, '#efe9da', -0.98 + i * 0.245, 0.116, 0.985, 0.014, 0.026, 0.016);
  for (i = 0; i < 8; i++) BX(Z.w, '#efe9da', -0.985, 0.116, -0.95 + i * 0.24, 0.016, 0.026, 0.014); for (i = 0; i < 9; i++) BX(Z.s, '#8c8574', -0.9 + i * 0.26, 0.114, 1.0, 0.016, 0.028, 0.016);
  for (i = 0; i < 7; i++) BX(Z.s, '#8c8574', -1.0, 0.114, -0.9 + i * 0.26, 0.016, 0.028, 0.016); for (i = 0; i < 3; i++) BX(Z.s, '#d0cabb', 0.42, 0.092 - i * 0.024, 1.06 + i * 0.05, 0.3, 0.03, 0.05);
  if (lv >= 4) for (i = 0; i < 4; i++) BX(Z.s, '#cfc9ba', 0.78, 0.092 - i * 0.02, 1.07 + i * 0.048, 0.46, 0.026, 0.048); }

function lamp(Z, x, z) { BX(Z.w, '#4c4842', x, 0.22, z, 0.014, 0.24, 0.014); BX(Z.w, '#4c4842', x + 0.03, 0.335, z, 0.07, 0.01, 0.012); BX(Z.g, '#f6e6b8', x + 0.062, 0.322, z, 0.03, 0.03, 0.024); }
function bench(Z, x, z) { BX(Z.w, '#8a6a48', x, 0.122, z, 0.16, 0.012, 0.05); BX(Z.w, '#8a6a48', x, 0.137, z - 0.022, 0.16, 0.028, 0.012); }
function planter(Z, x, z) { CY(Z.s, '#c8c0ae', x, 0.122, z, 0.11, 0.045, 0.11, 0); Z.l.put(UICO, '#4e7838', x, 0.16, z, 0, 0, 0, 0.15, 0.07, 0.15); Z.l.put(UICO, '#688a4a', x + 0.04, 0.18, z - 0.02, 0.9, 0, 0, 0.08, 0.05, 0.08); }
function awning(Z, x, zf, w, hex) { BX(Z.w, hex, x, 0.235, zf + 0.055, w, 0.01, 0.15); BX(Z.g, '#2e2a26', x - w / 2 + 0.02, 0.185, zf + 0.115, 0.008, 0.16, 0.008); BX(Z.g, '#2e2a26', x + w / 2 - 0.02, 0.185, zf + 0.115, 0.008, 0.16, 0.008); }
/* ===== 殖民楼：底层拱券券廊 + 白框窗台 + 檐口 + 双坡瓦顶/平顶瓶栏 ===== */
function villa(Z, x, zc, w, d, h, wall, roofHex, o) {
  var y0 = 0.1, zf = zc + d / 2, n = Math.max(3, Math.round(w / 0.15)), r, i;
  BX(Z.w, wall, x, y0 + h / 2, zc, w, h, d); BX(Z.w, '#96876c', x, y0 + 0.011, zf + 0.004, w + 0.012, 0.022, 0.01);
  BX(Z.g, o.retro ? '#7ea89a' : '#39332b', x, y0 + 0.068, zf + 0.004, w * 0.9, 0.095, 0.012);
  for (i = 0; i <= n; i++) BX(Z.w, '#f5f0e0', x - w / 2 + (i * w) / n, y0 + 0.072, zf + 0.01, 0.024, 0.1, 0.022);
  for (i = 0; i < n; i++) CY(Z.w, '#f5f0e0', x - w / 2 + ((i + 0.5) * w) / n, y0 + 0.122, zf + 0.004, (w / n) * 0.62, (w / n) * 0.62, 0.018, PI / 2);
  BX(Z.w, '#f5f0e0', x, y0 + 0.15, zf + 0.012, w + 0.02, 0.018, 0.026);
  var rows = h > 0.34 ? 2 : 1;
  for (r = 0; r < rows; r++) { var wy = y0 + 0.2 + (h - 0.2) * ((r + 0.5) / rows);
    for (i = 0; i < n; i++) { var wx = x - w / 2 + ((i + 0.5) * w) / n;
      BX(Z.w, '#f6f2e4', wx, wy, zf + 0.008, 0.085, 0.12, 0.01); BX(Z.g, r % 2 ? '#56685a' : '#4a5a82', wx, wy, zf + 0.014, 0.06, 0.095, 0.008);
      BX(Z.w, '#f6f2e4', wx, wy - 0.068, zf + 0.011, 0.105, 0.014, 0.02);
    } }
  BX(Z.w, '#f5f0e0', x, y0 + h + 0.007, zc, w + 0.035, 0.016, d + 0.035);
  if (o.flat) { var yt = y0 + h + 0.014;
    BX(Z.w, '#f0eadb', x, yt + 0.017, zc + d / 2 + 0.008, w + 0.03, 0.034, 0.014); BX(Z.w, '#f0eadb', x, yt + 0.017, zc - d / 2 - 0.008, w + 0.03, 0.034, 0.014);
    BX(Z.w, '#f0eadb', x - w / 2 - 0.008, yt + 0.017, zc, 0.014, 0.034, d - 0.02); BX(Z.w, '#f0eadb', x + w / 2 + 0.008, yt + 0.017, zc, 0.014, 0.034, d - 0.02);
    CY(Z.w, '#c8beaa', x + w * 0.2, yt + 0.028, zc, 0.05, 0.055, 0.05, 0); BX(Z.w, '#b8ac92', x - w * 0.22, yt + 0.02, zc - d * 0.12, 0.12, 0.04, 0.1);
  } else { var rise = o.rise || 0.11;
    Z.r.put(prismG(w + 0.06, d + 0.1, rise), roofHex, x, y0 + h + 0.012, zc, 0, 0, 0, 1, 1, 1);
    BX(Z.r, '#7c3a24', x, y0 + h + rise + 0.018, zc, w + 0.05, 0.018, 0.032);
    Z.w.put(triG(d + 0.1, rise), wall, x - w / 2 - 0.026, y0 + h + 0.012, zc, 0, 0, 0, 1, 1, 1);
    Z.w.put(triG(d + 0.1, rise), wall, x + w / 2 + 0.026, y0 + h + 0.012, zc, 0, 0, 0, 1, 1, 1);
    if (o.chimney) { BX(Z.w, '#c9bca4', x + w * 0.26, y0 + h + rise * 0.5 + 0.02, zc - d * 0.18, 0.032, rise + 0.04, 0.032); BX(Z.w, '#8a7a62', x + w * 0.26, y0 + h + rise + 0.052, zc - d * 0.18, 0.044, 0.012, 0.044); }
  } }
/* ===== 哥特教堂：钟塔(钟窗/玫瑰窗) + 殿身(扶壁/尖窗) + 八角尖塔 + 四角小尖塔 + 金十字 ===== */
function church(Z, x, z) {
  var y0 = 0.1, nx = x + 0.24, nz = z - 0.32, i;
  BX(Z.w, '#e9deca', x, y0 + 0.26, z, 0.2, 0.52, 0.2); BX(Z.w, '#e2d6bc', nx, y0 + 0.15, nz, 0.44, 0.3, 0.58);
  for (i = 0; i < 3; i++) { BX(Z.w, '#dcd0b4', nx - 0.235, y0 + 0.12, nz - 0.19 + i * 0.19, 0.03, 0.22, 0.045); BX(Z.w, '#dcd0b4', nx + 0.235, y0 + 0.12, nz - 0.19 + i * 0.19, 0.03, 0.22, 0.045); }
  BX(Z.w, '#dcd0b4', x - 0.115, y0 + 0.14, z + 0.02, 0.045, 0.26, 0.045); BX(Z.w, '#dcd0b4', x + 0.115, y0 + 0.14, z + 0.02, 0.045, 0.26, 0.045);
  for (i = 0; i < 3; i++) { BX(Z.g, '#3c3834', nx - 0.222, y0 + 0.19, nz - 0.17 + i * 0.17, 0.012, 0.1, 0.032); BX(Z.g, '#3c3834', nx + 0.222, y0 + 0.19, nz - 0.17 + i * 0.17, 0.012, 0.1, 0.032); }
  BX(Z.g, '#3c3834', x, y0 + 0.42, z + 0.102, 0.055, 0.09, 0.01); BX(Z.g, '#3c3834', x, y0 + 0.17, z + 0.102, 0.07, 0.12, 0.01);
  CY(Z.w, '#e9deca', x, y0 + 0.23, z + 0.098, 0.055, 0.055, 0.012, PI / 2); CY(Z.g, '#c8a850', x, y0 + 0.475, z + 0.104, 0.02, 0.02, 0.01, PI / 2);
  Z.r.put(prismG(0.5, 0.66, 0.16), '#7e868e', nx, y0 + 0.3, nz, 0, 0, 0, 1, 1, 1); BX(Z.r, '#5e666e', nx, y0 + 0.47, nz, 0.52, 0.016, 0.03);
  Z.w.put(triG(0.66, 0.16), '#e9deca', nx - 0.25, y0 + 0.3, nz, 0, 0, 0, 1, 1, 1); Z.w.put(triG(0.66, 0.16), '#e9deca', nx + 0.25, y0 + 0.3, nz, 0, 0, 0, 1, 1, 1);
  BX(Z.w, '#efe6d2', x, y0 + 0.535, z, 0.24, 0.016, 0.24); Z.r.put(UCO8, '#525a66', x, y0 + 0.79, z, 0, 0, 0, 0.155, 0.42, 0.155);
  for (i = 0; i < 4; i++) Z.r.put(UCO8, '#6a7078', x + (i % 2 ? 0.095 : -0.095), y0 + 0.61, z + (i < 2 ? 0.095 : -0.095), 0, 0, 0, 0.055, 0.14, 0.055);
  Z.g.put(USPH, '#c8a850', x, y0 + 1.004, z, 0, 0, 0, 0.016, 0.016, 0.016);
  BX(Z.g, '#c8a850', x, y0 + 1.045, z, 0.01, 0.08, 0.01); BX(Z.g, '#c8a850', x, y0 + 1.058, z, 0.04, 0.01, 0.01); }
/* ===== 现代楼：白公寓(阳台带/水箱/机房/空调) 与 玻璃塔(竖梃/冠部/桅杆) ===== */
function aptB(Z, x, w, d, h, hex, lv) {
  var y0 = 0.1, zc = -0.87, i, n = Math.max(2, Math.round(h / 0.16));
  BX(Z.w, hex, x, y0 + h / 2, zc, w, h, d);
  for (i = 0; i < n; i++) { var fy = y0 + 0.07 + (i + 0.5) * (h / n);
    BX(Z.w, '#eef0ee', x, fy + (h / n) * 0.42, zc + d / 2 + 0.006, w + 0.02, 0.014, 0.018); BX(Z.g, '#5e7078', x, fy - 0.01, zc + d / 2 + 0.012, w * 0.94, (h / n) * 0.62, 0.01); }
  BX(Z.w, '#dfe2df', x, y0 + h + 0.012, zc, w + 0.03, 0.024, d + 0.03);
  CY(Z.w, '#b6bcc0', x + w * 0.24, y0 + h + 0.045, zc, 0.045, 0.05, 0.045, 0);
  BX(Z.w, '#c6cac8', x - w * 0.2, y0 + h + 0.035, zc - d * 0.1, 0.14, 0.045, 0.11);
  if (lv >= 3) BX(Z.g, '#7c888c', x + w * 0.02, y0 + h + 0.032, zc + d * 0.2, 0.08, 0.03, 0.06); }
function glassT(Z, x, w, d, h) {
  var y0 = 0.1, zc = -0.87, i, n = Math.max(3, Math.round(w / 0.09));
  BX(Z.g, '#9ec4cf', x, y0 + h / 2, zc, w, h, d);
  for (i = 0; i <= n; i++) BX(Z.w, '#eef1f2', x - w / 2 + (i * w) / n, y0 + h / 2, zc + d / 2 + 0.006, 0.012, h, 0.012);
  BX(Z.w, '#dfe3e4', x, y0 + h + 0.014, zc, w + 0.02, 0.028, d + 0.02); BX(Z.w, '#c9ced1', x, y0 + h + 0.05, zc - d * 0.1, w * 0.5, 0.05, d * 0.5);
  if (h > 1.9) BX(Z.g, '#8c969a', x, y0 + h + 0.14, zc, 0.012, 0.16, 0.012); }
/* ===== 绿植 ===== */
function tree(Z, x, z, s, full) {
  CY(Z.l, '#6e5238', x, 0.1 + 0.09 * s, z, 0.034 * s, 0.18 * s, 0.034 * s, 0);
  Z.l.put(UICO, '#3c6831', x, 0.1 + 0.22 * s, z, 0.5, 0, 0, 0.34 * s, 0.27 * s, 0.34 * s);
  if (full) Z.l.put(UICO, '#58883f', x + 0.05 * s, 0.1 + 0.3 * s, z - 0.03, 1.2, 0, 0, 0.22 * s, 0.16 * s, 0.22 * s); }
function palmQ(pm, x, z, s) {
  CY(pm, '#8a6a48', x, 0.1 + 0.14 * s, z, 0.022 * s, 0.3 * s, 0.022 * s, 0); var tx = x + 0.016 * s, ty = 0.1 + 0.28 * s, i;
  for (i = 0; i < 8; i++) { var a = i * PI / 4; pm.put(UB, i % 2 ? '#4e8a3c' : '#63a04c', tx + Math.sin(a) * 0.07 * s, ty + 0.006, z + Math.cos(a) * 0.07 * s, 0, a - PI / 2, -0.55, 0.2 * s, 0.01, 0.055 * s); }
  pm.put(USPH, '#7a5c38', tx, ty + 0.005, z, 0, 0, 0, 0.024 * s, 0.024 * s, 0.024 * s); }
/* ================= 四阶（1990s→2020s） ================= */
function build(lv, anims) {
  var g = new THREE.Group(), i, Z = { w: new MB(1.5), r: new MB(2.2), g: new MB(1.6), s: new MB(2), p: new MB(2.4), n: new MB(3), l: new MB(2.6) }, pm = new MB(2.6), wm = new MB(1.5);
  ground(Z, lv);
  var walls = lv >= 2 ? ['#e6cf6e', '#eee4c2', '#f2ede1', lv >= 3 ? '#e3b9ac' : '#e8d89a'] : ['#c8b173', '#ccc2a2', '#cfc9b8', '#c4ad8a'];
  var roof = lv >= 2 ? '#bf5a34' : '#a85e42';
  villa(Z, -0.77, 0.31, 0.42, 0.42, 0.3, walls[0], roof, {}); villa(Z, -0.24, 0.31, 0.48, 0.42, 0.38, walls[1], roof, { chimney: lv >= 2, retro: lv >= 4 });
  villa(Z, 0.31, 0.31, 0.44, 0.42, 0.28, walls[2], roof, {}); villa(Z, 0.85, 0.31, 0.38, 0.42, 0.36, walls[3], roof, { flat: lv >= 3 });
  villa(Z, -0.52, -0.32, 0.42, 0.4, 0.3, walls[2], lv >= 4 ? '#7e868e' : roof, { retro: lv >= 4 }); villa(Z, -0.04, -0.32, 0.38, 0.4, 0.34, walls[0], roof, { chimney: true });
  villa(Z, 0.32, -0.32, 0.3, 0.38, 0.28, walls[1], roof, { flat: true }); if (lv >= 2) villa(Z, 1.04, -0.28, 0.28, 0.3, 0.24, walls[2], roof, { flat: true });
  church(Z, 0.62, -0.44);
  if (lv === 1) { villa(Z, -0.55, -0.85, 0.36, 0.3, 0.24, walls[1], roof, {}); BX(Z.w, '#b5a888', -0.18, 0.13, -0.68, 0.5, 0.05, 0.02); }
  if (lv === 2) { aptB(Z, -0.58, 0.3, 0.3, 0.92, '#e8e6df', lv); aptB(Z, -0.12, 0.28, 0.3, 1.12, '#eceae2', lv); }
  if (lv === 3) { aptB(Z, -0.74, 0.28, 0.3, 0.95, '#e8e6df', lv); aptB(Z, -0.38, 0.28, 0.3, 1.55, '#e2e0d8', lv); aptB(Z, -0.04, 0.26, 0.3, 1.28, '#eceae2', lv); aptB(Z, 0.24, 0.24, 0.28, 1.05, '#d8dcda', lv); }
  if (lv >= 4) { glassT(Z, -0.58, 0.32, 0.3, 2.06); glassT(Z, -0.18, 0.28, 0.28, 1.62); glassT(Z, 0.18, 0.26, 0.28, 1.32); }
  var prom = lv >= 2 ? [-0.85, -0.61, -0.37, -0.13, 0.11, 0.35, 0.59, 1.06] : [-0.8, -0.45, -0.1, 0.25, 0.6, 1.06];
  for (i = 0; i < prom.length; i++) tree(Z, prom[i], 0.88 + (i % 2) * 0.04, 0.56 + 0.06 * lv + (i % 3) * 0.05, lv >= 2 || i % 2 === 0);
  if (lv >= 3) for (i = 0; i < 7; i++) tree(Z, -0.73 + i * 0.3, 0.71, 0.42 + (i % 2) * 0.05, false);
  var bank = [0.5, 0.14, -0.22, -0.58, -0.92];
  for (i = 0; i < bank.length; i++) tree(Z, -0.9 + (i % 2) * 0.03, bank[i], 0.54 + 0.05 * lv, i % 2 === 0);
  tree(Z, -0.88, -0.68, 0.56 + 0.06 * lv, true); if (lv >= 2) tree(Z, 0.3, -0.66, 0.6, true);
  tree(Z, 1.08, 0.52, 0.6, true); tree(Z, 1.1, 0.12, 0.55, lv >= 2); if (lv >= 3) { tree(Z, 1.05, 0.85, 0.5, false); tree(Z, -0.35, -0.62, 0.5, true); }
  for (i = 0; i < 5; i++) Z.l.put(UICO, '#4e7838', [-0.58, 0.12, 0.62, -0.14, 0.5][i], 0.14, [0.18, -0.14, 0.24, 0.44, -0.56][i], i * 0.7, 0, 0, 0.13, 0.09, 0.13);
  palmQ(pm, 1.06, 0.82, 0.85); palmQ(pm, 0.64, 0.64, 0.7); if (lv >= 2) palmQ(pm, 1.1, 0.2, 0.75);
  if (lv >= 2) { lamp(Z, -0.5, 0.92); lamp(Z, 0.42, 0.92); lamp(Z, -0.92, -0.55); bench(Z, -0.12, 0.9); bench(Z, 0.82, 0.9); }
  if (lv >= 2) { awning(Z, -0.24, 0.52, 0.42, '#8a4a3a'); awning(Z, 0.31, 0.52, 0.38, '#3e5a44'); awning(Z, -0.52, -0.12, 0.36, '#3e5a44'); awning(Z, -0.04, -0.12, 0.32, '#8a4a3a'); planter(Z, 0.78, -0.02); }
  g.add(Z.w.mesh(zoneMat(texStucco(), 0.85, 0.02))); g.add(Z.r.mesh(zoneMat(texTile(), 0.72, 0.02)));
  g.add(Z.g.mesh(zoneMat(texCurtain(), 0.15, 0.55))); g.add(Z.s.mesh(zoneMat(texStone(), 0.9, 0.02)));
  g.add(Z.p.mesh(zoneMat(texPave(), 0.95, 0))); g.add(Z.n.mesh(zoneMat(texLawn(), 0.95, 0))); g.add(Z.l.mesh(zoneMat(texLeaf(), 0.92, 0)));
  var palmGrp = new THREE.Group(); palmGrp.add(pm.mesh(zoneMat(texLeaf(), 0.92, 0))); g.add(palmGrp);
  var mat = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: texWater(), roughness: 0.14, metalness: 0.2, emissive: C('#548482'), emissiveIntensity: 0.07 });
  wm.put(UB, '#ffffff', 0, 0.052, 1.155, 0, 0, 0, 2.54, 0.012, 0.25); wm.put(UB, '#ffffff', -1.155, 0.052, -0.12, 0, 0, 0, 0.25, 0.012, 2.3);
  wm.put(UB, '#eaf4ee', 0.12, 0.058, 1.045, 0, 0, 0, 2.3, 0.004, 0.03); wm.put(UB, '#eaf4ee', -1.045, 0.058, -0.1, 0, 0, 0, 0.03, 0.004, 2.0);
  var wMesh = wm.mesh(mat), wTex = mat.map; g.add(wMesh);
  anims.push(function (t) { mat.emissiveIntensity = 0.07 + 0.04 * Math.sin(t * 1.8); wTex.offset.x = (t * 0.012) % 1; });
  anims.push(function (t) { palmGrp.rotation.z = Math.sin(t * 1.35 + 0.6) * 0.022; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[14] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), anims = [], g = build(lv, anims);
  g.name = 'prop_14_lv' + lv; g.userData.kind = 'property'; g.userData.propIdx = 14; g.userData.level = lv; g.userData.region = 'g3';
  g.userData.anim = anims; return g; };
})();
