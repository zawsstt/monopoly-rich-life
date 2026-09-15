/* 大富翁·富贵人生 — boards/modern/props3d/prop_13.js 北京路（现代写实·广州步行街）v2 材质精修
 * 四阶=四年代（refs/modern/prop_13.png）：lv1 1990s 米白矮楼+密集小店招 / lv2 2000s 弧角玻璃楼+红竖招 /
 * lv3 2010s LED大屏高层化 / lv4 2020s 弧形幕墙塔+转角曲面巨幕。识别特征：玻璃罩千年古道遗址贯穿全街。
 * v2（工艺对标 specials3d/tile29_water.js）：多层 Canvas（基色+LCG噪点+风化+分缝+高光，≤128px）、
 * 五区材质分区合并（灰泥 / 幕墙玻璃 rough.15 metal.55 / 石材地坪 / 金属 / 植被）各自独立材质每实例新建、
 * boxUV 按世界尺寸三平面烘焙（分区密度）、发光件（LED/灯罩/玻璃罩）独立材质+呼吸。剪影与构图与 v1 完全一致。
 * 契约：window.Props3DModern[13](level)→Group；占地≤2.6²、底面 y=0、正面 +Z；每级 mesh≤55（v2=14/14/15/15）；
 * 零 Math.random（种子 LCG）；动画≤2；THREE r147 全局，无 import/export。 */
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
/* 分区材质（每实例新建）：顶点色 × 贴图 */
function zoneMat(map, rough, metal) { return new THREE.MeshStandardMaterial({ vertexColors: true, map: map, roughness: rough, metalness: metal }); }
/* 单位几何 + 手写合并器（position/normal/color/uv，uv=世界坐标三平面投影×密度） */
var UB = new THREE.BoxGeometry(1, 1, 1), UC = new THREE.CylinderGeometry(0.5, 0.5, 1, 10), USP = new THREE.SphereGeometry(0.5, 10, 8),
    UICO = new THREE.IcosahedronGeometry(0.5, 1), UCY = new THREE.CylinderGeometry(0.5, 0.5, 1, 14, 1, false, -PI / 2, PI),
    UHD = new THREE.CircleGeometry(0.5, 12, PI, PI); UHD.rotateX(-PI / 2);
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
/* ===== Canvas 纹理（≤128/256px，种子 LCG，多层：基色+噪点+风化+分缝+高光） ===== */
function texPlaster() { return cvTex(128, 128, function (g, w, h) { var R = rng(1321), i; g.fillStyle = '#faf7f1'; g.fillRect(0, 0, w, h); noise(g, w, h, R, 420, 'rgba(255,255,255,0.35)', 'rgba(110,96,80,0.08)'); for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(90,80,70,0.12)'; g.fillRect(0, i * 32 + 30, w, 2); g.fillStyle = 'rgba(255,255,255,0.30)'; g.fillRect(0, i * 32 + 32, w, 1); } for (i = 0; i < 9; i++) { g.fillStyle = 'rgba(120,100,70,0.06)'; g.fillRect(R() * w, R() * h, 10 + R() * 22, 4 + R() * 10); } g.fillStyle = 'rgba(96,84,70,0.08)'; g.fillRect(0, h - 10, w, 10); }); }
function texCurtain() { return cvTex(128, 128, function (g, w, h) { var R = rng(1322), i, gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#eef1f2'); gr.addColorStop(1, '#c4cbd0'); g.fillStyle = gr; g.fillRect(0, 0, w, h); for (i = 0; i < 16; i++) { g.fillStyle = (i % 3) ? 'rgba(30,40,55,0.30)' : 'rgba(255,255,255,0.30)'; g.fillRect((i % 4) * 32 + 4, ((i / 4) | 0) * 32 + 4, 24, 12); } g.fillStyle = 'rgba(255,255,255,0.8)'; for (i = 0; i < 4; i++) { g.fillRect(i * 32, 0, 2, h); g.fillRect(0, i * 32, w, 2); } g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(70, 0, 14, h); g.fillRect(96, 0, 5, h); noise(g, w, h, R, 60, 'rgba(255,255,255,0.2)', 'rgba(30,40,55,0.14)'); }); }
function texPave() { return cvTex(128, 128, function (g, w, h) { var R = rng(1323), i, k; g.fillStyle = '#e6e2da'; g.fillRect(0, 0, w, h); for (i = 0; i < 4; i++) for (k = 0; k < 4; k++) { g.fillStyle = ((i + k) % 2) ? 'rgba(255,255,255,0.12)' : 'rgba(90,86,78,0.06)'; g.fillRect(k * 32 + 1, i * 32 + 1, 30, 30); } g.fillStyle = 'rgba(70,66,60,0.32)'; for (i = 0; i <= 4; i++) { g.fillRect(i * 32, 0, 1, h); g.fillRect(0, i * 32, w, 1); } noise(g, w, h, R, 260, 'rgba(255,255,255,0.25)', 'rgba(80,76,70,0.12)'); for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(100,110,90,0.09)'; g.fillRect(R() * w, R() * h, 6 + R() * 10, 3); } }); }
function texLeaf() { return cvTex(64, 64, function (g, w, h) { var R = rng(1324); g.fillStyle = '#eef4e6'; g.fillRect(0, 0, w, h); noise(g, w, h, R, 220, 'rgba(255,255,255,0.4)', 'rgba(20,50,10,0.38)'); }); }
function texMetal() { return cvTex(64, 64, function (g, w, h) { var R = rng(1325), i; g.fillStyle = '#e8eaec'; g.fillRect(0, 0, w, h); for (i = 0; i < 8; i++) { g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.25)' : 'rgba(40,44,50,0.12)'; g.fillRect(0, i * 8, w, 4); } noise(g, w, h, R, 80, 'rgba(255,255,255,0.3)', 'rgba(30,34,40,0.2)'); }); }
function texGlass() { var S = 128, cv = mkCv(S, 256), g = cv.getContext('2d'), R = rng(1310), i, j; g.fillStyle = '#c4e4ee'; g.fillRect(0, 0, S, 256); for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.1 + R() * 0.16).toFixed(2) + ')'; g.save(); g.translate(R() * S, 0); g.rotate(0.5); g.fillRect(0, -40, 3 + R() * 5, 340); g.restore(); } g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 2; for (i = 0; i < 5; i++) { g.beginPath(); for (j = 0; j <= 8; j++) { var x = j * 16, y = i * 50 + 12 + 7 * Math.sin(j * 1.3 + i); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); } g.fillStyle = 'rgba(70,96,108,0.35)'; g.fillRect(0, 0, S, 6); g.fillRect(0, 250, S, 6); for (i = 0; i < 90; i++) { g.fillStyle = 'rgba(120,160,175,0.16)'; g.fillRect(R() * S, R() * 256, 3, 2); } return tex(cv); }
function texSignV() { var w = 128, h = 256, cv = mkCv(w, h), g = cv.getContext('2d'), R = rng(1326), i; g.fillStyle = '#a8281e'; g.fillRect(0, 0, w, h); noise(g, w, h, R, 160, 'rgba(255,200,160,0.10)', 'rgba(60,10,6,0.16)'); g.strokeStyle = '#e8c060'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12); g.strokeStyle = '#7a5010'; g.lineWidth = 2; g.strokeRect(14, 14, w - 28, h - 28); g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 42px "Microsoft YaHei",sans-serif'; g.fillStyle = '#f4d488'; var s = '北京路'; for (i = 0; i < 3; i++) g.fillText(s[i], w / 2, 44 + i * 60); g.font = 'bold 28px sans-serif'; g.fillText('步行街', w / 2, h - 34); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, 0, w, 20); return tex(cv); }
function texSignH() { var w = 256, h = 64, cv = mkCv(w, h), g = cv.getContext('2d'), R = rng(1327); g.fillStyle = '#203a5e'; g.fillRect(0, 0, w, h); noise(g, w, h, R, 120, 'rgba(180,200,230,0.12)', 'rgba(0,10,30,0.2)'); g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(0, 0, w, 14); g.strokeStyle = '#d8e4f0'; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6); g.fillStyle = '#f0e8c8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 34px "Microsoft YaHei",sans-serif'; g.fillText('北京路步行街', w / 2, h / 2 + 2); return tex(cv); }
function texLED() { var S = 128, cv = mkCv(S, S), g = cv.getContext('2d'), R = rng(1311), i, gr = g.createLinearGradient(0, 0, 0, S); gr.addColorStop(0, '#30406e'); gr.addColorStop(1, '#c05878'); g.fillStyle = gr; g.fillRect(0, 0, S, S); g.fillStyle = '#f0d0a8'; g.beginPath(); g.arc(S * 0.5, S * 0.42, 17, 0, PI * 2); g.fill(); g.fillStyle = '#e8b8c8'; g.beginPath(); g.moveTo(S * 0.5, S * 0.52); g.lineTo(S * 0.72, S); g.lineTo(S * 0.28, S); g.closePath(); g.fill(); for (i = 0; i < 26; i++) { g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(R() * S, R() * S, 4, 4); } g.fillStyle = '#f4e0a0'; g.fillRect(8, 8, S - 16, 12); g.fillStyle = 'rgba(0,0,0,0.14)'; for (i = 0; i < S; i += 4) g.fillRect(0, i, S, 1); return tex(cv); }
/* ===== 静态语汇（Z = 分区合并器：w 灰泥 / g 玻璃 / s 石材 / m 金属 / v 植被） ===== */
var SIGNS = ['#c8342a', '#e8b43a', '#2a58a8', '#d84a30', '#f0d048'];
function plaza(Z, gl) {
  var zr = -0.06, i, mb = Z.s;
  mb.put(UB, '#9c988e', 0, 0.03, 0, 0, 0, 0, 2.6, 0.06, 2.6);
  mb.put(UB, '#d8d6ce', 0, 0.078, 0.745, 0, 0, 0, 2.5, 0.042, 1.01);       /* 地坪分前/后两片，中间留考古沟 */
  mb.put(UB, '#d8d6ce', 0, 0.078, -0.805, 0, 0, 0, 2.5, 0.042, 0.89);
  for (i = -1; i <= 1; i += 2) if (gl < 2.2) mb.put(UB, '#d8d6ce', i * (gl / 4 + 0.675), 0.078, zr, 0, 0, 0, 1.25 - gl / 2 - 0.1, 0.042, 0.62);
  for (i = 0; i < 4; i++) mb.put(UB, i % 2 ? '#cac8c0' : '#e2e0d8', -0.94 + i * 0.625, 0.1, 0.75, 0, 0, 0, 0.6, 0.006, 0.95);
  for (i = 0; i < 4; i++) mb.put(UB, i % 2 ? '#cac8c0' : '#e2e0d8', -0.94 + i * 0.625, 0.1, -0.46, 0, 0, 0, 0.6, 0.006, 0.16);
  /* 千年古道遗址：石框环 + 下沉考古坑（三层路面叠压）+ 玻璃罩（另 mesh，透明发光） */
  for (i = -1; i <= 1; i += 2) { mb.put(UB, '#8a847a', 0, 0.098, zr + i * 0.33, 0, 0, 0, gl + 0.2, 0.024, 0.08); mb.put(UB, '#8a847a', i * (gl / 2 + 0.06), 0.098, zr, 0, 0, 0, 0.08, 0.024, 0.74); }
  mb.put(UB, '#3a362f', 0, 0.02, zr, 0, 0, 0, gl + 0.04, 0.01, 0.6);
  for (i = -1; i <= 1; i += 2) { mb.put(UB, '#6a645c', 0, 0.058, zr + i * 0.285, 0, 0, 0, gl + 0.04, 0.085, 0.03); mb.put(UB, '#6a645c', i * (gl / 2 + 0.005), 0.058, zr, 0, 0, 0, 0.03, 0.085, 0.6); }
  mb.put(UB, '#c8b898', 0, 0.05, zr, 0, 0, 0, gl - 0.06, 0.018, 0.5);
  mb.put(UB, '#a86a4c', 0, 0.068, zr, 0, 0, 0, gl * 0.72, 0.018, 0.46);
  mb.put(UB, '#8a8078', 0, 0.084, zr, 0, 0, 0, gl * 0.46, 0.018, 0.42);
  for (i = -1; i <= 1; i += 2) Z.m.put(UB, '#5c6168', 0, 0.118, zr + i * 0.33, 0, 0, 0, gl + 0.2, 0.016, 0.02);
}
function tower(Z, x, w, d, h, hex, band, o) {
  o = o || {}; var y0 = 0.1, zc = o.zc, n = Math.max(2, Math.floor(h / 0.17)), i, cx, r, f = o.face || 1, zf = zc + f * d / 2, cols = Math.max(2, Math.round(w / 0.14)), mb = Z.w;
  if (o.curve) {                                    /* 弧形转角楼：弧筒凸出核心体，半圆顶盖，底层暗玻璃环带 */
    cx = x + 0.26 * w; r = 0.45 * w;
    mb.put(UB, hex, x - 0.16 * w, y0 + h / 2, zc - 0.05, 0, 0, 0, 0.74 * w, h, 0.5 * w);
    mb.put(UCY, hex, cx, y0 + h / 2, zc, 0, 0, 0, 2 * r, h, 2 * r);
    Z.g.put(UCY, '#2e3844', cx, y0 + 0.08, zc, 0, 0, 0, 2 * r * 1.02, 0.12, 2 * r * 1.02);
    for (i = 0; i < n; i++) Z.g.put(UCY, band, cx, y0 + 0.14 + (i + 0.5) * ((h - 0.16) / n), zc, 0, 0, 0, 2 * r * 1.02, (h - 0.16) / n * 0.56, 2 * r * 1.02);
    mb.put(UHD, o.cap || '#8e887c', cx, y0 + h + 0.026, zc, 0, 0, 0, 2 * r * 1.04, 1, 2 * r * 1.04);
    mb.put(UB, o.cap || '#8e887c', x - 0.16 * w, y0 + h + 0.012, zc - 0.05, 0, 0, 0, 0.78 * w, 0.026, 0.54 * w);
    return cx;
  }
  mb.put(UB, hex, x, y0 + h / 2, zc, 0, 0, 0, w, h, d);
  var faces = o.both ? [1, -1] : [f], fi;
  for (fi = 0; fi < faces.length; fi++) {
    f = faces[fi]; zf = zc + f * d / 2;
    /* 底层店脸：暗玻璃橱窗 + 彩色店招（ref 密集店招）；窗带 + 竖梃网格 */
    Z.g.put(UB, '#2e3844', x, y0 + 0.08, zf + f * 0.004, 0, 0, 0, w * 0.92, 0.12, 0.012);
    for (i = 0; i < 2; i++) mb.put(UB, SIGNS[(o.si + i + fi) % 5], x + (i - 0.5) * w * 0.46, y0 + 0.19, zf + f * 0.012, 0, 0, 0, w * 0.4, 0.06, 0.02);
    for (i = 0; i < n; i++) Z.g.put(UB, band, x, y0 + 0.14 + (i + 0.5) * ((h - 0.16) / n), zf + f * 0.006, 0, 0, 0, w * (o.glz ? 0.94 : 0.88), (h - 0.16) / n * (o.glz ? 0.66 : 0.5), 0.012);
    for (i = 1; i < cols; i++) mb.put(UB, o.glz ? '#e4eaec' : hex, x - w / 2 + (i * w) / cols, y0 + 0.16 + (h - 0.16) / 2, zf + f * 0.01, 0, 0, 0, 0.018, h - 0.18, 0.012);
  }
  mb.put(UB, o.cap || '#8e887c', x, y0 + h + 0.012, zc, 0, 0, 0, w + 0.03, 0.026, d + 0.03);
  if (o.tank) { Z.m.put(UC, '#8a8478', x + w * 0.24, y0 + h + 0.055, zc, 0, 0, 0, w * 0.13, 0.08, w * 0.13); mb.put(UB, '#9c968a', x - w * 0.22, y0 + h + 0.04, zc - d * 0.1, 0, 0, 0, w * 0.2, 0.05, d * 0.3); }
  if (o.garden) { Z.v.put(UB, '#5e8a46', x, y0 + h + 0.035, zc, 0, 0, 0, w * 0.6, 0.03, d * 0.55); Z.v.put(UB, '#4c7238', x - w * 0.2, y0 + h + 0.05, zc, 0, 0, 0, w * 0.16, 0.045, d * 0.3); Z.v.put(UB, '#4c7238', x + w * 0.18, y0 + h + 0.05, zc + d * 0.08, 0, 0, 0, w * 0.13, 0.04, d * 0.26); }
  if (o.mast) { Z.m.put(UC, '#6a7076', x, y0 + h + 0.1, zc, 0, 0, 0, 0.016, 0.16, 0.016); Z.m.put(USP, '#d84038', x, y0 + h + 0.185, zc, 0, 0, 0, 0.024, 0.024, 0.024); }
  return x;
}
function tree(Z, x, z, s) {
  Z.w.put(UC, '#7a5c40', x, 0.1 + 0.09 * s, z, 0, 0, 0, 0.032 * s, 0.18 * s, 0.032 * s);
  Z.v.put(UICO, '#3c6a30', x, 0.1 + 0.24 * s, z, 0, 0.5, 0, 0.3 * s, 0.26 * s, 0.3 * s);
  Z.v.put(UICO, '#527f3c', x + 0.04 * s, 0.1 + 0.34 * s, z - 0.03, 0, 1.2, 0, 0.2 * s, 0.18 * s, 0.2 * s);
}
function lamp(Z, glow, x, z) {
  Z.m.put(UC, '#3c4148', x, 0.22, z, 0, 0, 0, 0.02, 0.26, 0.02);
  Z.m.put(UB, '#3c4148', x + 0.05, 0.345, z, 0, 0, 0, 0.12, 0.014, 0.014);
  glow.put(USP, '#ffd88a', x + 0.1, 0.325, z, 0, 0, 0, 0.05, 0.05, 0.05);
}
/* ================= 四阶（1990s→2020s 生长） ================= */
function build(lv, anims) {
  var g = new THREE.Group(), glow = new MB(1), i, Z = { w: new MB(1.6), g: new MB(1.8), s: new MB(1.4), m: new MB(3), v: new MB(3) }, cfg = [
    { gl: 1.6, hs: [[-1.0, 0.44, 0.5, '#e6d8c2'], [-0.52, 0.44, 0.66, '#eee2cc'], [-0.06, 0.42, 0.56, '#d8c8b0'], [0.4, 0.42, 0.7, '#e2d4be'], [0.88, 0.44, 0.6, '#d4c6ae']], fl: 0.5 },
    { gl: 2.0, hs: [[-1.0, 0.44, 0.98, '#eadcc4'], [-0.52, 0.44, 1.18, '#d6c2a4'], [-0.06, 0.42, 1.06, '#f0e4d0'], [0.4, 0.42, 1.24, '#dcd0ba'], [0.93, 0.4, 1.34, '#b8bcb8']], fl: 0.72 },
    { gl: 2.24, hs: [[-1.0, 0.44, 1.36, '#ece4d4'], [-0.52, 0.44, 1.68, '#d8ccb8'], [-0.06, 0.42, 1.5, '#f2ece0'], [0.4, 0.42, 1.78, '#d6cab8'], [0.93, 0.4, 1.86, '#c4c8c4']], fl: 0.95 },
    { gl: 2.3, hs: [[-1.0, 0.44, 1.84, '#e4dccc'], [-0.52, 0.44, 2.24, '#d0c8b8'], [-0.06, 0.42, 2.0, '#ece8dc'], [0.4, 0.42, 2.36, '#d4cec0'], [0.93, 0.4, 2.52, '#b8c0c0']], fl: 1.2 }
  ][lv - 1], bandHex = lv >= 3 ? '#6e7e8a' : (lv === 2 ? '#6a7a84' : '#3e4650');
  plaza(Z, cfg.gl);
  for (i = 0; i < cfg.hs.length; i++) {
    var t = cfg.hs[i], o = { zc: -0.82, si: i, tank: lv === 1, garden: lv >= 2 && i % 2 === 0, mast: lv >= 3 && i === 3, glz: lv >= 3, cap: lv >= 3 ? '#78807c' : '#8e887c' };
    if (i === cfg.hs.length - 1 && lv >= 2) o.curve = true;
    tower(Z, t[0], t[1], 0.62, t[2], t[3], bandHex, o);
  }
  /* 前排：四地块（左高右低，年代长高；沿街轴视角两排楼群夹出古道视廊） */
  var fr = [[-0.92, 0.7, 1.0, 3], [-0.2, 0.62, 0.72, 4], [0.5, 0.66, 0.56, 1], [1.08, 0.4, 0.3, 2]];
  for (i = 0; i < 4; i++) tower(Z, fr[i][0], fr[i][1], 0.6, Math.max(0.24, cfg.fl * fr[i][2]), lv >= 3 ? ['#dcd4c6', '#ece4d4', '#cfc8bc', '#e2d8c8'][i] : ['#e2d2bc', '#ede2cc', '#d6c6ac', '#e6dac4'][i], bandHex, { zc: 0.86, both: true, si: fr[i][3], tank: lv === 1 && i !== 3, garden: lv >= 2, glz: lv >= 3 && i === 2 });
  var tx = [-1.05, -0.35, 0.35, 1.05]; if (lv >= 2) tx = tx.concat([-0.7, 0.7]); if (lv >= 3) tx.push(0.0); if (lv >= 4) tx.push(-1.12, 1.12);
  for (i = 0; i < tx.length; i++) tree(Z, tx[i], 0.36, Math.min(0.72 + 0.09 * lv + (i % 3) * 0.06, (1.27 - Math.abs(tx[i])) / 0.2));
  lamp(Z, glow, -0.52, 0.16); lamp(Z, glow, 0.62, 0.16); lamp(Z, glow, 0.05, -0.36);
  Z.w.put(UB, '#7a5e42', -0.2, 0.12, 0.44, 0, 0, 0, 0.3, 0.03, 0.09); Z.w.put(UB, '#7a5e42', -0.2, 0.15, 0.47, 0, 0, 0, 0.3, 0.03, 0.03);
  /* 分区落地：五个独立材质（rough/metal 分区），每实例新建 */
  g.add(Z.w.mesh(zoneMat(texPlaster(), 0.86, 0.02))); g.add(Z.g.mesh(zoneMat(texCurtain(), 0.15, 0.55)));
  g.add(Z.s.mesh(zoneMat(texPave(), 0.9, 0.02))); g.add(Z.m.mesh(zoneMat(texMetal(), 0.42, 0.65))); g.add(Z.v.mesh(zoneMat(texLeaf(), 0.92, 0)));
  var gm = new THREE.MeshStandardMaterial({ color: C('#c4dce4'), roughness: 0.08, metalness: 0.2, transparent: true, opacity: 0.58, map: texGlass(), emissive: C('#9cc8d4'), emissiveIntensity: 0.12 });
  var glass = new THREE.Mesh(new THREE.BoxGeometry(cfg.gl, 0.008, 0.62), gm); glass.position.set(0, 0.104, -0.06); g.add(glass);
  var sh = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.155), new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: texSignH(), roughness: 0.5, metalness: 0.1 }));
  sh.position.set(-0.52, lv >= 3 ? 0.68 : 0.5, -0.47); sh.rotation.x = -0.12; g.add(sh);
  var swGroup = new THREE.Group(), sb = [[-1.18, 0.44], [1.02, 0.44], [0.4, -0.42]], poleM = zoneMat(texMetal(), 0.42, 0.65), signM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: texSignV(), roughness: 0.55, side: THREE.DoubleSide });
  for (i = 0; i < 3; i++) {
    var pg = new THREE.Group(); pg.position.set(sb[i][0], 0.1, sb[i][1]);
    var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.9, 8), poleM); pole.position.y = 0.45; pg.add(pole);
    var plane = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.42), signM); plane.position.set(0.02, 0.68, 0); pg.add(plane); swGroup.add(pg);
  }
  g.add(swGroup);
  var ledM = null;
  if (lv >= 3) {
    ledM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: texLED(), emissive: C('#ffffff'), emissiveMap: texLED(), emissiveIntensity: 0.35, roughness: 0.3, metalness: 0.1 });
    var led;
    if (lv >= 4) {      /* 转角曲面巨幕：包住弧形楼筒身 */
      led = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1, 14, 1, true, -0.95, 1.9), ledM);
      led.scale.set(0.4, 0.62, 0.4); led.position.set(1.034, 1.92, -0.82);
    } else { led = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.34, 0.03), ledM); led.position.set(-0.52, 1.36, -0.5); }
    g.add(led);
  }
  var glowM = new THREE.MeshStandardMaterial({ color: C('#ffd88a'), emissive: C('#ffcf7a'), emissiveIntensity: 0.5, roughness: 0.3 });
  g.add(glow.mesh(glowM));
  anims.push(function (t) { var e = 0.3 + 0.18 * Math.sin(t * 2.1); if (ledM) ledM.emissiveIntensity = e; gm.emissiveIntensity = (lv >= 4 ? 0.2 : 0.12) + 0.08 * Math.sin(t * 1.6 + 1); glowM.emissiveIntensity = 0.42 + 0.14 * Math.sin(t * 2.6 + 0.5); });
  anims.push(function (t) { swGroup.rotation.y = Math.sin(t * 1.2 + 0.8) * 0.028; });
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
