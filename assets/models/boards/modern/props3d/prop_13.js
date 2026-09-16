/* 大富翁·富贵人生 — boards/modern/props3d/prop_13.js 北京路（现代写实·广州北京路步行街）v3 结构精修 R1
 * 视觉基准 refs/modern/prop_13.png（四象限 1990s→2020s）：连续骑楼街墙夹步行街，千年古道玻璃遗址纵贯中央；弧角楼在前排远端
 * （lv1 弧角阳台楼→lv2 玻璃转角+海报→lv3 LED 大屏→lv4 曲面巨幕塔）。lv1 4-6 层骑楼+灰瓦坡顶+水塔 / lv2 加层+转角玻璃化+天窗 /
 * lv3 幕墙化+LED+屋顶绿化 / lv4 全幕墙+曲面巨幕。R1 变更：后 5 前 4 贴邻连续街墙（女儿墙/彩条雨篷/壁柱）、角楼移前排远端、
 * 竖招灯箱+店招+海报贴图合并网格、灰瓦双坡顶+屋脊、屋顶设备（水塔/AC/天窗/太阳能/绿化）、古道玻璃带加宽+四层考古地层+框格、
 * 行道树双列成排、加厚基座、立面语言按年代切换（punched→curtain）。R2 变更：角楼核心体走 bldg 立面生成器（窗带/雨篷/招牌/女儿墙）、
 * 玻璃筒逐层饰带、LED 弧面转向可视侧、lv3+ 店面暖光独立发光网格、三层树冠行道树、古道玻璃降透明度+加密玻璃格栅、后排最高楼移至远端、
 * lv1 前排增灰瓦坡顶、角楼屋顶花园。R3：lv3 LED 放大、后排墙面海报、玻璃罩青绿调、幕墙提亮+天空反射带、山墙端窗带、骑楼柱廊逐开间、
 * 店面横楯、建筑线铺装边带、屋顶花坛边、树冠 lv3+ 三层（预算）。契约：window.Props3DModern[13](level)→全新 Group；占地≤2.6²、底面 y=0、正面 +Z；
 * mesh lv1..4=11/12/13/13；零 Math.random（LCG 种子流）；动画 1 项（LED/玻璃罩发光呼吸）；THREE r147 全局，无 import/export。 */
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
var UB = new THREE.BoxGeometry(1, 1, 1), UC = new THREE.CylinderGeometry(0.5, 0.5, 1, 12), UICO = new THREE.IcosahedronGeometry(0.5, 1),
    UCY = new THREE.CylinderGeometry(0.5, 0.5, 1, 16, 1, false, -PI / 2, PI);
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
function QB() { this.p = []; this.n = []; this.u = []; }
QB.prototype.q = function (x, y, z, ry, w, h, u0, v0, u1, v1) {
  var cs = Math.cos(ry), sn = Math.sin(ry), vx = [-w / 2, w / 2, w / 2, -w / 2], vy = [-h / 2, -h / 2, h / 2, h / 2],
      us = [u0, u1, u1, u0], vs = [v0, v0, v1, v1], id = [0, 1, 2, 0, 2, 3], k, j;
  for (k = 0; k < 6; k++) { j = id[k]; this.p.push(x + vx[j] * cs, y + vy[j], z - vx[j] * sn); this.n.push(sn, 0, cs); this.u.push(us[j], vs[j]); }
  return this;
};
QB.prototype.mesh = function (mat) {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
  var o = new THREE.Mesh(g, mat); o.castShadow = o.receiveShadow = true; return o;
};
function UV(W, H, x, y, w, h) { return [x / W, 1 - (y + h) / H, (x + w) / W, 1 - y / H]; }
/* ===== Canvas 纹理（≤256px，种子 LCG，多层：基色+噪点+分缝+高光） ===== */
function texPlaster() { return cvTex(128, 128, function (g, w, h) { var R = rng(1321), i; g.fillStyle = '#efe6d4'; g.fillRect(0, 0, w, h); noise(g, w, h, R, 420, 'rgba(255,255,255,0.35)', 'rgba(110,96,80,0.08)'); for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(90,80,70,0.14)'; g.fillRect(0, i * 32 + 30, w, 2); g.fillStyle = 'rgba(255,255,255,0.30)'; g.fillRect(0, i * 32 + 32, w, 1); } for (i = 0; i < 9; i++) { g.fillStyle = 'rgba(120,100,70,0.07)'; g.fillRect(R() * w, R() * h, 10 + R() * 22, 4 + R() * 10); } g.fillStyle = 'rgba(96,84,70,0.10)'; g.fillRect(0, h - 10, w, 10); }); }
function texCurtain() { return cvTex(128, 128, function (g, w, h) { var R = rng(1322), i, gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#c8d6dd'); gr.addColorStop(1, '#93a6b2'); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,0.30)'; g.fillRect(0, 6, w, 16); for (i = 0; i < 10; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.1 + R() * 0.2).toFixed(2) + ')'; g.fillRect(R() * w, 0, 3 + R() * 7, h); } g.fillStyle = 'rgba(24,34,46,0.5)'; for (i = 0; i <= 4; i++) g.fillRect(i * 32 - 1, 0, 2, h); for (i = 0; i <= 4; i++) g.fillRect(0, i * 32 - 1, w, 2); noise(g, w, h, R, 70, 'rgba(255,255,255,0.25)', 'rgba(20,30,44,0.2)'); }); }
function texTile() { return cvTex(96, 96, function (g, w, h) { var R = rng(1328), i, k; g.fillStyle = '#7d786e'; g.fillRect(0, 0, w, h); for (i = 0; i < 6; i++) for (k = 0; k < 6; k++) { g.fillStyle = ((i + k) % 2) ? 'rgba(255,255,255,0.10)' : 'rgba(20,20,16,0.16)'; g.fillRect(k * 16 + (i % 2) * 8 - 8, i * 16, 16, 16); g.fillStyle = 'rgba(30,28,22,0.30)'; g.fillRect(k * 16 + (i % 2) * 8 - 8, i * 16 + 15, 16, 1); } noise(g, w, h, R, 160, 'rgba(255,255,255,0.2)', 'rgba(20,18,14,0.25)'); }); }
function texPave() { return cvTex(128, 128, function (g, w, h) { var R = rng(1323), i, k; g.fillStyle = '#dcd7cb'; g.fillRect(0, 0, w, h); for (i = 0; i < 2; i++) for (k = 0; k < 2; k++) { g.fillStyle = ((i + k) % 2) ? 'rgba(255,255,255,0.14)' : 'rgba(96,90,80,0.10)'; g.fillRect(k * 64 + 2, i * 64 + 2, 60, 60); } g.fillStyle = 'rgba(70,66,58,0.4)'; for (i = 0; i <= 2; i++) { g.fillRect(i * 64, 0, 2, h); g.fillRect(0, i * 64, w, 2); } noise(g, w, h, R, 300, 'rgba(255,255,255,0.25)', 'rgba(80,76,68,0.14)'); for (i = 0; i < 7; i++) { g.fillStyle = 'rgba(100,108,88,0.10)'; g.fillRect(R() * w, R() * h, 8 + R() * 14, 4); } }); }
function texLeaf() { return cvTex(64, 64, function (g, w, h) { var R = rng(1324); g.fillStyle = '#eef4e6'; g.fillRect(0, 0, w, h); noise(g, w, h, R, 220, 'rgba(255,255,255,0.4)', 'rgba(20,50,10,0.38)'); }); }
function texMetal() { return cvTex(64, 64, function (g, w, h) { var R = rng(1325), i; g.fillStyle = '#e8eaec'; g.fillRect(0, 0, w, h); for (i = 0; i < 8; i++) { g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.25)' : 'rgba(40,44,50,0.12)'; g.fillRect(0, i * 8, w, 4); } noise(g, w, h, R, 80, 'rgba(255,255,255,0.3)', 'rgba(30,34,40,0.2)'); }); }
function texAwning() { return cvTex(64, 64, function (g, w, h) { var i; g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h); for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(120,116,108,0.55)'; g.fillRect(i * 16, 0, 8, h); } }); }
function texGlass() { var S = 128, cv = mkCv(S, 256), g = cv.getContext('2d'), R = rng(1310), i, j; g.fillStyle = '#c4e4ee'; g.fillRect(0, 0, S, 256); for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.1 + R() * 0.16).toFixed(2) + ')'; g.save(); g.translate(R() * S, 0); g.rotate(0.5); g.fillRect(0, -40, 3 + R() * 5, 340); g.restore(); } g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; for (i = 0; i < 5; i++) { g.beginPath(); for (j = 0; j <= 8; j++) { var x = j * 16, y = i * 50 + 12 + 7 * Math.sin(j * 1.3 + i); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); } g.fillStyle = 'rgba(70,96,108,0.35)'; g.fillRect(0, 0, S, 6); g.fillRect(0, 250, S, 6); for (i = 0; i < 90; i++) { g.fillStyle = 'rgba(120,160,175,0.16)'; g.fillRect(R() * S, R() * 256, 3, 2); } return tex(cv); }
function texSV() { var W = 128, H = 256, cv = mkCv(W, H), g = cv.getContext('2d'), R = rng(1326), i, j; for (i = 0; i < 2; i++) { var x0 = i * 64; g.fillStyle = i ? '#b8860e' : '#a8281e'; g.fillRect(x0, 0, 64, H); noise(g, 64, H, R, 90, 'rgba(255,220,160,0.12)', 'rgba(40,6,4,0.2)'); g.strokeStyle = i ? '#f4d488' : '#e8c060'; g.lineWidth = 4; g.strokeRect(x0 + 4, 6, 56, H - 12); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 34px "Microsoft YaHei",sans-serif'; g.fillStyle = '#f6e2a8'; var s = i ? '步行街' : '北京路'; for (j = 0; j < 3; j++) g.fillText(s[j], x0 + 32, 52 + j * 66); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(x0, 0, 64, 16); } return tex(cv); }
function texSH() { var W = 256, H = 128, cv = mkCv(W, H), g = cv.getContext('2d'), R = rng(1327), i; g.fillStyle = '#1e3a5e'; g.fillRect(0, 0, W, 64); g.strokeStyle = '#d8e4f0'; g.lineWidth = 4; g.strokeRect(3, 3, W - 6, 58); g.fillStyle = '#f0e8c8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 32px "Microsoft YaHei",sans-serif'; g.fillText('北京路步行街', W / 2, 33); var gr = g.createLinearGradient(0, 64, 0, H); gr.addColorStop(0, '#e888a8'); gr.addColorStop(0.5, '#c05878'); gr.addColorStop(1, '#4868a8'); g.fillStyle = gr; g.fillRect(0, 64, W, 64); g.fillStyle = '#f8e8f0'; g.beginPath(); g.arc(88, 100, 16, 0, PI * 2); g.fill(); g.fillRect(77, 114, 22, 12); for (i = 0; i < 30; i++) { g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(R() * W, 64 + R() * 60, 3, 3); } g.strokeStyle = 'rgba(255,255,255,0.75)'; g.lineWidth = 3; g.strokeRect(2, 66, W - 4, 60); noise(g, W, H, R, 80, 'rgba(255,255,255,0.15)', 'rgba(0,10,30,0.15)'); return tex(cv); }
function texLED() { var S = 128, cv = mkCv(S, S), g = cv.getContext('2d'), R = rng(1311), i, gr = g.createLinearGradient(0, 0, 0, S); gr.addColorStop(0, '#30406e'); gr.addColorStop(1, '#c05878'); g.fillStyle = gr; g.fillRect(0, 0, S, S); g.fillStyle = '#f0d0a8'; g.beginPath(); g.arc(S * 0.5, S * 0.42, 17, 0, PI * 2); g.fill(); g.fillStyle = '#e8b8c8'; g.beginPath(); g.moveTo(S * 0.5, S * 0.52); g.lineTo(S * 0.72, S); g.lineTo(S * 0.28, S); g.closePath(); g.fill(); for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(R() * S, R() * S, 4, 4); } g.fillStyle = '#f4e0a0'; g.fillRect(8, 8, S - 16, 12); g.fillStyle = 'rgba(0,0,0,0.14)'; for (i = 0; i < S; i += 4) g.fillRect(0, i, S, 1); return tex(cv); }
var SVC = [UV(128, 256, 0, 0, 64, 256), UV(128, 256, 64, 0, 64, 256)], SHC = UV(256, 128, 0, 0, 256, 64), BLC = UV(256, 128, 0, 64, 256, 64);
/* ===== 静态语汇（Z 分区合并器：w 灰泥 / g 玻璃 / s 石材 / m 金属 / v 植被；AW 雨篷 / RW 瓦顶 / CG 转角玻璃） ===== */
var Z, AW, RW, CG, SG, glow, SV, SH, band, CAP;
var AWN = ['#c8342a', '#2a6a3c', '#2a58a8'];
var LV = [
 { gl: 1.7, bh: [0.92, 0.86, 0.66, 0.80, 0.72], fh: [0.60, 0.54, 0.68, 0.44], ch: 0.90, tile: [0, 4], ftile: [3], tank: 1, ts: [[-1.08, -0.36, 0.36, 1.08], [-1.08, -0.36, 0.36, 1.08]] },
 { gl: 2.02, bh: [1.36, 1.28, 0.98, 1.18, 1.08], fh: [0.90, 0.80, 1.00, 0.66], ch: 1.40, tile: [4], ftile: [], tank: 1, ts: [[-1.08, -0.72, -0.36, 0.36, 0.72, 1.08], [-1.08, -0.36, 0.36, 1.08]] },
 { gl: 2.24, bh: [1.78, 1.66, 1.30, 1.54, 1.42], fh: [1.16, 1.02, 1.26, 0.88], ch: 1.80, tile: [], ftile: [], tank: 0, ts: [[-1.08, -0.72, -0.36, 0, 0.36, 0.72, 1.08], [-1.08, -0.72, -0.36, 0, 0.36, 0.72, 1.08]] },
 { gl: 2.3, bh: [2.28, 2.12, 1.66, 1.94, 1.82], fh: [1.56, 1.36, 1.66, 1.16], ch: 2.42, tile: [], ftile: [], tank: 0, ts: [[-1.08, -0.72, -0.36, 0, 0.36, 0.72, 1.08], [-1.08, -0.72, -0.36, 0, 0.36, 0.72, 1.08]] }];
var BHEX = [['#ece2cc', '#e2d5bc', '#f0e8d6', '#d9cdb6', '#e6dcc8'], ['#eee4ce', '#e4d7be', '#f2ead8', '#dbcfb8', '#c8ccca'], ['#f0e8d8', '#c4ccd0', '#e6ddc9', '#cdd2d2', '#bcc6c8'], ['#d8dee0', '#aebfc6', '#e2dcc9', '#b4c0c4', '#a8b8be']];
var FHEX = [['#f0e8d6', '#e6dbc4', '#e2d5bc', '#dcd0ba'], ['#f2ead8', '#e8ddc6', '#e4d8c0', '#d6cab2'], ['#f4ecda', '#eae0c8', '#e6dac2', '#d8ccb4'], ['#f0e8d6', '#e6dcc4', '#e2d6be', '#d4c8b0']];
function street(gl) {
  var i;
  Z.s.put(UB, '#a49f94', 0, 0.05, 0, 0, 0, 0, 2.6, 0.1, 2.6);
  Z.s.put(UB, '#ddd8cc', 0, 0.106, 0.44, 0, 0, 0, 2.5, 0.013, 0.36); Z.s.put(UB, '#d7d2c6', 0, 0.106, -0.42, 0, 0, 0, 2.5, 0.013, 0.32);
  Z.s.put(UB, '#c4bdae', 0, 0.1135, 0.575, 0, 0, 0, 2.5, 0.005, 0.09); Z.s.put(UB, '#c4bdae', 0, 0.1135, -0.535, 0, 0, 0, 2.5, 0.005, 0.09);
  Z.s.put(UB, '#2e2822', 0, 0.103, 0, 0, 0, 0, gl, 0.008, 0.5); Z.s.put(UB, '#5a4a38', 0, 0.108, 0, 0, 0, 0, gl, 0.016, 0.5);
  Z.s.put(UB, '#6e5c46', 0, 0.124, 0, 0, 0, 0, gl - 0.06, 0.016, 0.44); Z.s.put(UB, '#85735c', 0, 0.139, 0, 0, 0, 0, gl - 0.12, 0.014, 0.38);
  Z.s.put(UB, '#cabd9f', 0, 0.118, 0, 0, 0, 0, gl - 0.04, 0.005, 0.46); Z.s.put(UB, '#b3a58a', 0, 0.133, 0, 0, 0, 0, gl - 0.1, 0.005, 0.4);
  Z.s.put(UB, '#c2b294', 0, 0.147, 0, 0, 0, 0, gl - 0.16, 0.005, 0.34); Z.m.put(UB, '#5c6168', 0, 0.158, 0, 0, 0, 0, gl + 0.04, 0.008, 0.012);
  for (i = -1; i <= 1; i += 2) { Z.s.put(UB, '#c6c0b2', 0, 0.13, i * 0.285, 0, 0, 0, gl + 0.08, 0.05, 0.06); Z.m.put(UB, '#6a7076', 0, 0.157, i * 0.285, 0, 0, 0, gl + 0.08, 0.012, 0.016); }
  for (i = 0; i <= 9; i++) Z.m.put(UB, '#5c6168', -gl / 2 + (i * gl) / 9, 0.158, 0, 0, 0, 0, 0.018, 0.01, 0.55);
}
function bldg(x, w, d, zc, h, hex, o) {
  var faces = o.both ? [1, -1] : [1], n = Math.max(2, Math.round((h - 0.34) / 0.13)), fh = (h - 0.34) / n, i, j, f, zf, k, q2, wy, su, y0 = 0.1;
  Z.w.put(UB, hex, x, y0 + h / 2, zc, 0, 0, 0, w, h, d); Z.w.put(UB, CAP, x, y0 + h + 0.013, zc, 0, 0, 0, w + 0.026, 0.026, d + 0.026);
  for (i = -1; i <= 1; i += 2) {
    Z.w.put(UB, '#8f887b', x, y0 + h + 0.034, zc + i * (d / 2 - 0.014), 0, 0, 0, w + 0.026, 0.042, 0.028);
    Z.w.put(UB, '#8f887b', x + i * (w / 2 - 0.014), y0 + h + 0.034, zc, 0, 0, 0, 0.028, 0.042, d + 0.026);
  }
  for (j = 0; j < faces.length; j++) {
    f = faces[j]; zf = zc + f * d / 2;
    SG.put(UB, SG === Z.g ? '#26303a' : '#f6dcae', x, y0 + 0.09, zf + f * 0.004, 0, 0, 0, w * 0.92, 0.18, 0.012);
    k = Math.max(2, Math.round(w / 0.24)); for (q2 = 0; q2 <= k; q2++) Z.w.put(UB, '#f4efe2', x - w * 0.46 + (q2 * w * 0.92) / k, y0 + 0.09, zf + f * 0.012, 0, 0, 0, 0.026, 0.18, 0.022);
    Z.w.put(UB, '#e8e2d4', x, y0 + 0.16, zf + f * 0.008, 0, 0, 0, w * 0.9, 0.012, 0.014);
    AW.put(UB, AWN[(o.si + j) % 3], x, y0 + 0.215, zf + f * 0.05, f * 0.45, 0, 0, w * 0.84, 0.01, 0.13);
    su = f > 0 ? [SHC[0], SHC[2]] : [SHC[2], SHC[0]];
    SH.q(x, y0 + 0.29, zf + f * 0.014, f > 0 ? 0 : PI, w * 0.46, 0.07, su[0], SHC[1], su[1], SHC[3]);
    SV.q(x + (j ? w * 0.28 : -w * 0.28), y0 + 0.52, zf + f * 0.026, PI / 2, 0.085, 0.32, SVC[(o.si + j) % 2][0], SVC[(o.si + j) % 2][1], SVC[(o.si + j) % 2][2], SVC[(o.si + j) % 2][3]);
    if (o.bill && !j) SH.q(x, y0 + h * 0.62, zf + f * 0.022, 0, w * 0.56, h * 0.3, BLC[0], BLC[1], BLC[2], BLC[3]);
    for (i = 0; i < n; i++) {
      wy = y0 + 0.34 + (i + 0.5) * fh;
      if (o.glz) { Z.g.put(UB, band, x, wy, zf + f * 0.005, 0, 0, 0, w * 0.94, fh * 0.8, 0.012); Z.w.put(UB, CAP, x, y0 + 0.34 + (i + 1) * fh, zf + f * 0.009, 0, 0, 0, w * 0.97, 0.02, 0.016); }
      else { k = Math.max(2, Math.round(w / 0.17)); for (q2 = 0; q2 < k; q2++) Z.g.put(UB, band, x - w / 2 + ((q2 + 0.5) * w) / k, wy, zf + f * 0.005, 0, 0, 0, (w / k) * 0.56, fh * 0.5, 0.012); Z.w.put(UB, '#f0e9d8', x, wy - fh * 0.36, zf + f * 0.011, 0, 0, 0, w * 0.9, 0.014, 0.02); }
    }
    if (o.glz) for (i = 1; i < 4; i++) Z.w.put(UB, '#dfe6ea', x - w / 2 + (i * w) / 4, y0 + 0.34 + (h - 0.34) / 2, zf + f * 0.009, 0, 0, 0, 0.016, h - 0.36, 0.014);
  }
  if (o.ew) for (i = 0; i < n; i++) for (j = -1; j <= 1; j += 2) Z.g.put(UB, band, x + w / 2 + 0.005, y0 + 0.34 + (i + 0.5) * fh, zc + j * 0.12, 0, 0, 0, 0.012, fh * 0.55, 0.15);
  if (o.tile) {
    RW.put(UB, '#78736a', x, y0 + h + 0.072, zc - d * 0.16, -0.3, 0, 0, w, 0.014, d * 0.62); RW.put(UB, '#6b665e', x, y0 + h + 0.072, zc + d * 0.16, 0.3, 0, 0, w, 0.014, d * 0.62);
    Z.w.put(UB, '#8a8478', x, y0 + h + 0.038, zc, 0, 0, 0, w - 0.02, 0.07, d * 0.5); RW.put(UB, '#524e46', x, y0 + h + 0.132, zc, 0, 0, 0, w + 0.02, 0.022, 0.034);
  }
  if (o.tank) { Z.m.put(UC, '#9a958a', x + w * 0.26, y0 + h + 0.068, zc - d * 0.12, 0, 0, 0, 0.085, 0.085, 0.085); Z.m.put(UC, '#88837a', x + w * 0.26, y0 + h + 0.022, zc - d * 0.12, 0, 0, 0, 0.05, 0.02, 0.05); }
  if (o.ac) for (i = -1; i <= 1; i += 2) Z.m.put(UB, '#b8bcc0', x + i * w * 0.22, y0 + h + 0.048, zc + i * d * 0.16, 0, i * 0.4, 0, 0.075, 0.05, 0.05);
  if (o.gard) { Z.w.put(UB, '#8f887b', x, y0 + h + 0.03, zc, 0, 0, 0, w * 0.6, 0.024, d * 0.55); Z.v.put(UB, '#5e8a46', x, y0 + h + 0.04, zc, 0, 0, 0, w * 0.55, 0.026, d * 0.5); Z.v.put(UICO, '#4c7a38', x - w * 0.13, y0 + h + 0.072, zc, 0, 0.4, 0, 0.1, 0.07, 0.1); Z.v.put(UICO, '#5d8f46', x + w * 0.12, y0 + h + 0.065, zc + d * 0.07, 0, 1.1, 0, 0.08, 0.06, 0.08); }
  if (o.sky) { Z.m.put(UB, '#7c848a', x + w * 0.17, y0 + h + 0.042, zc, 0.5, 0, 0, w * 0.28, 0.008, d * 0.36); Z.g.put(UB, '#9ec4d4', x + w * 0.17, y0 + h + 0.052, zc, 0.5, 0, 0, w * 0.26, 0.01, d * 0.34); }
  if (o.pent) { Z.w.put(UB, hex, x - w * 0.2, y0 + h + 0.073, zc, 0, 0, 0, w * 0.34, 0.09, d * 0.44); Z.g.put(UB, band, x - w * 0.2, y0 + h + 0.085, zc + d * 0.222, 0, 0, 0, w * 0.3, 0.04, 0.01); }
  if (o.solar) Z.m.put(UB, '#2c3c55', x + w * 0.2, y0 + h + 0.048, zc + d * 0.16, -0.5, 0, 0, w * 0.3, 0.008, d * 0.3);
  if (o.mast) { Z.m.put(UC, '#6a7076', x, y0 + h + 0.11, zc, 0, 0, 0, 0.014, 0.13, 0.014); Z.m.put(UICO, '#d84038', x, y0 + h + 0.185, zc, 0, 0, 0, 0.03, 0.03, 0.03); }
}
function corner(ch, lv) {
  var r = 0.24, cx = -1.0, cz = 0.93, y0 = 0.1, i, n = Math.max(3, Math.round(ch / 0.17)), fh = ch / n, glz = lv >= 2;
  bldg(-0.88, 0.44, 0.52, 0.84, ch, glz ? '#c2cbd0' : '#e4ebe6', { both: true, glz: glz, gard: lv >= 3, ac: lv === 2, si: 5 });
  if (glz) {
    CG.put(UCY, '#cfe4ec', cx, y0 + ch / 2, cz, 0, -PI / 4, 0, 2 * r, ch, 2 * r);
    for (i = 1; i < n; i++) Z.w.put(UCY, '#d9dee1', cx, y0 + i * fh, cz, 0, -PI / 4, 0, 2 * (r + 0.005), 0.032, 2 * (r + 0.005));
  } else {
    for (i = 0; i < n; i++) { Z.w.put(UCY, '#e4ebe6', cx, y0 + (i + 0.5) * fh, cz, 0, -PI / 4, 0, 2 * r, fh * 0.62, 2 * r); Z.g.put(UCY, band, cx, y0 + (i + 0.5) * fh + fh * 0.08, cz, 0, -PI / 4, 0, 2 * r * 1.02, fh * 0.3, 2 * r * 1.02); Z.m.put(UCY, '#f2f0ea', cx, y0 + (i + 1) * fh - 0.008, cz, 0, -PI / 4, 0, 2 * (r + 0.014), 0.014, 2 * (r + 0.014)); }
    AW.put(UCY, '#c8342a', cx, y0 + 0.24, cz, 0, -PI / 4, 0, 2 * (r + 0.04), 0.012, 2 * (r + 0.04));
  }
  Z.w.put(UC, glz ? '#828c92' : '#9a948a', cx, y0 + ch + 0.017, cz, 0, 0, 0, 2 * (r + 0.022), 0.03, 2 * (r + 0.022));
  if (lv >= 3) { Z.v.put(UC, '#5e8a46', cx, y0 + ch + 0.04, cz, 0, 0, 0, 2 * (r - 0.02), 0.016, 2 * (r - 0.02)); Z.v.put(UICO, '#4c7a38', cx - 0.08, y0 + ch + 0.075, cz + 0.06, 0, 0.4, 0, 0.1, 0.07, 0.1); }
  SV.q(cx - 0.16, y0 + 0.44, cz + 0.16, PI / 4, 0.09, 0.34, SVC[0][0], SVC[0][1], SVC[0][2], SVC[0][3]);
  if (glz) SH.q(-0.88, y0 + ch * 0.62, 1.122, 0, 0.3, 0.4, BLC[0], BLC[1], BLC[2], BLC[3]);
}
function tree(x, z, s) {
  Z.s.put(UB, '#6a655c', x, 0.115, z, 0, 0, 0, 0.1, 0.006, 0.1); Z.w.put(UC, '#6e543c', x, 0.1 + 0.07 * s, z, 0, 0, 0, 0.028 * s, 0.14 * s, 0.028 * s);
  Z.v.put(UICO, '#355f2a', x, 0.1 + 0.19 * s, z, 0, 0.5, 0, 0.32 * s, 0.22 * s, 0.32 * s); Z.v.put(UICO, '#47773a', x + 0.04 * s, 0.1 + 0.27 * s, z - 0.03 * s, 0, 1.3, 0, 0.24 * s, 0.18 * s, 0.24 * s);
  if (tree.lv >= 3) Z.v.put(UICO, '#5a8a48', x - 0.03 * s, 0.1 + 0.33 * s, z + 0.02 * s, 0, 2.1, 0, 0.15 * s, 0.12 * s, 0.15 * s);
}
function lamp(x, z) {
  Z.m.put(UC, '#3a3f46', x, 0.25, z, 0, 0, 0, 0.018, 0.3, 0.018); Z.m.put(UB, '#3a3f46', x, 0.395, z, 0, 0, 0, 0.2, 0.012, 0.012);
  glow.put(UICO, '#ffd88a', x - 0.09, 0.38, z, 0, 0, 0, 0.045, 0.05, 0.045); glow.put(UICO, '#ffd88a', x + 0.09, 0.38, z, 0, 0, 0, 0.045, 0.05, 0.045);
}
/* ================= 四阶（1990s→2020s 生长） ================= */
function build(lv, anims) {
  var g = new THREE.Group(), cfg = LV[lv - 1], i, j;
  Z = { w: new MB(1.6), g: new MB(1.8), s: new MB(1.5), m: new MB(3), v: new MB(3) };
  AW = new MB(2.2); RW = new MB(1.8); CG = new MB(2); glow = new MB(3); SV = new QB(); SH = new QB(); SG = lv >= 3 ? new MB(2) : Z.g;
  band = lv >= 4 ? '#6b8ba2' : lv === 3 ? '#6e889c' : lv === 2 ? '#56697a' : '#3c4652';
  CAP = lv >= 3 ? '#7e8886' : '#93917f';
  street(cfg.gl);
  var bw = [-1.0, -0.5, 0, 0.5, 1.0];
  for (i = 0; i < 5; i++) bldg(bw[i], i % 2 ? 0.44 : 0.48, 0.6, -0.88, cfg.bh[i], BHEX[lv - 1][i], { glz: lv >= 3 ? i !== 2 : (lv === 2 && i === 0), tile: cfg.tile.indexOf(i) >= 0, tank: !!cfg.tank && i === 1, ac: lv >= 2, gard: lv >= 3 && i % 2 === 0, sky: lv >= 2 && i === 2, pent: lv >= 2 && i === 4, solar: lv >= 3 && i === 1, mast: lv >= 3 && i === 0, ew: i === 4, bill: lv >= 3 && (i === 1 || i === 3), si: i });
  corner(cfg.ch, lv);
  var fx = [-0.40, 0.09, 0.58, 1.03], fn = [0.43, 0.45, 0.43, 0.38];
  for (i = 0; i < 4; i++) bldg(fx[i], fn[i], 0.56, 0.9, cfg.fh[i], FHEX[lv - 1][i], { both: true, glz: lv >= 4 && i < 2, tile: cfg.ftile.indexOf(i) >= 0, tank: lv === 1 && i === 1, gard: lv >= 2 && i % 2 === 0, ac: lv >= 3 && i === 2, pent: lv >= 3 && i === 0, sky: lv >= 2 && i === 3, ew: i === 3, si: i + 2 });
  var ts = cfg.ts, s = 0.62 + 0.08 * lv; tree.lv = lv;
  for (i = 0; i < ts.length; i++) for (j = 0; j < ts[i].length; j++) tree(ts[i][j], i ? -0.44 : 0.44, s * (1 - 0.06 * (j % 2)));
  lamp(-0.5, 0.44); lamp(0.55, 0.44); lamp(0, -0.44); if (lv >= 2) lamp(-1.02, -0.44);
  g.add(Z.w.mesh(zoneMat(texPlaster(), 0.85, 0.02))); g.add(Z.g.mesh(zoneMat(texCurtain(), 0.14, 0.55)));
  g.add(Z.s.mesh(zoneMat(texPave(), 0.92, 0.02))); g.add(Z.m.mesh(zoneMat(texMetal(), 0.4, 0.7))); g.add(Z.v.mesh(zoneMat(texLeaf(), 0.92, 0)));
  g.add(AW.mesh(zoneMat(texAwning(), 0.8, 0)));
  if (cfg.tile.length || cfg.ftile.length) g.add(RW.mesh(zoneMat(texTile(), 0.9, 0.05)));
  if (SG !== Z.g) { var sgm = zoneMat(texMetal(), 0.3, 0.1); sgm.emissive = C('#ffb870'); sgm.emissiveIntensity = 0.42; g.add(SG.mesh(sgm)); }
  var gm = new THREE.MeshStandardMaterial({ color: C('#a2ccc6'), roughness: 0.06, metalness: 0.25, transparent: true, opacity: 0.42, map: texGlass(), emissive: C('#8cc4bc'), emissiveIntensity: 0.06 });
  var gc = new THREE.Mesh(new THREE.BoxGeometry(cfg.gl, 0.007, 0.52), gm); gc.position.set(0, 0.156, 0); gc.castShadow = gc.receiveShadow = true; g.add(gc);
  if (lv >= 2) g.add(CG.mesh(new THREE.MeshStandardMaterial({ color: C('#cfe4ec'), map: texGlass(), roughness: 0.06, metalness: 0.45, transparent: true, opacity: 0.85 })));
  var smap = texSV();
  g.add(SV.mesh(new THREE.MeshStandardMaterial({ map: smap, roughness: 0.5, side: THREE.DoubleSide, emissive: C('#ffffff'), emissiveMap: smap, emissiveIntensity: 0.22 })));
  var hmap = texSH();
  g.add(SH.mesh(new THREE.MeshStandardMaterial({ map: hmap, roughness: 0.45, side: THREE.DoubleSide, emissive: C('#ffffff'), emissiveMap: hmap, emissiveIntensity: 0.15 })));
  var ledM = null;
  if (lv >= 3) {
    ledM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: texLED(), emissive: C('#ffffff'), emissiveMap: texLED(), emissiveIntensity: 0.4, roughness: 0.3, side: THREE.DoubleSide });
    var L = lv >= 4 ? 2.3 : 1.7, hs = lv >= 4 ? 1.15 : 0.85, cs = new THREE.Mesh(new THREE.CylinderGeometry(0.254, 0.254, hs, 16, 1, true, -PI / 8 - L / 2, L), ledM);
    cs.position.set(-1.0, 0.1 + cfg.ch * (lv >= 4 ? 0.5 : 0.46), 0.93); cs.castShadow = true; g.add(cs);
  }
  g.add(glow.mesh(new THREE.MeshStandardMaterial({ color: C('#ffd88a'), emissive: C('#ffcf7a'), emissiveIntensity: 0.55, roughness: 0.3 })));
  anims.push(function (t) { if (ledM) ledM.emissiveIntensity = 0.34 + 0.16 * Math.sin(t * 2.1); gm.emissiveIntensity = (lv >= 4 ? 0.18 : 0.1) + 0.06 * Math.sin(t * 1.6 + 1); });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[13] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1)), anims = [], g = build(lv, anims);
  g.name = 'prop_13_lv' + lv; g.userData.kind = 'property'; g.userData.propIdx = 13; g.userData.level = lv; g.userData.region = 'g3';
  g.userData.anim = anims;
  return g;
};
})();
