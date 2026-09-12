/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_3.js
 * -------------------------------------------------------------------------------------
 * 格 3「烟袋斜街」(g1 胡同小筑) 独属建筑：京派胡同四阶生长史
 * 参考图 refs/prop_3.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop3/）。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   灰砖灰瓦一间小屋 + 葫芦杆 + 长凳（h≈1.10）
 *   lv2 洋房   横向两开间：铺面 + 砖塔耳房，加披檐与檐廊（h≈1.66）
 *   lv3 大厦   三层退台 + 层层挑檐 + 高砖塔 + 立幌子（h≈2.08）
 *   lv4 地标   石台基 + 石狮朱门 + 两厢 + 歇山楼阁的完整宅院（h≈2.40）
 *
 * 独有语汇（自参考图提炼）：灰陶瓦垄（檐角起翘 + 黑瓦脊吻）、青砖墙（白缝高窗）、
 * 朱漆檐廊/门扇、白纸木格窗、金箍红灯笼、烟袋斜街招牌葫芦杆（每阶必有）。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[3] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_3] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 颜色 / 材质基元（std: sRGB→Linear，同 buildings3d） ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.map) m.map = o.map;
  if (o.bump) { m.bumpMap = o.bump; m.bumpScale = (o.bumpScale !== undefined ? o.bumpScale : 0.012); }
  return m;
}
/* 材质缓存（同进程复用；view3d.disposeGroup 只释放 geometry，不释放材质） */
var _mc = {};
function MAT(id, make) { if (!_mc[id]) _mc[id] = make(); return _mc[id]; }

function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 10, 8), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}

/* ================= 1. 程序化 Canvas 纹理（≤256px，零外部资源） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 灰陶瓦垄：横向垄线明暗 + 竖向接头错缝 + 陶面噪点（map+bump 同源） */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#4e5a68'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#5d6b7c' : '#525e6d';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#39434f'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#67758a'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(40,48,58,0.55)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 220; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(20,26,34,0.08)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 青砖墙：砖缝错缝 + 值域斑驳 */
function texBrick() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#9096a0'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  g.fillStyle = '#333a44';
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillRect(0, y + rh - 2, S, 2);
    var off = (i % 2) ? S / 8 : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillRect(x, y, 2, rh - 2);
      g.fillStyle = (k + i) % 3 ? 'rgba(255,255,255,0.05)' : 'rgba(30,36,44,0.10)';
      g.fillRect(x + 3, y + 1, S / 4 - 5, rh - 4);
      g.fillStyle = '#333a44';
    }
  }
  return toTex(cv, true);
}
/* 暖白抹灰：细噪 + 抹痕 */
function texPlaster() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#d9d2c2'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(120,110,90,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 立式招牌「烟袋斜街」：黑漆金边 + 金字竖排 */
function texSignV() {
  var w = 128, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#33200f'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 6; g.strokeRect(7, 7, w - 14, h - 14);
  g.strokeStyle = 'rgba(216,166,60,0.5)'; g.lineWidth = 2; g.strokeRect(16, 16, w - 32, h - 32);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 46px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '烟袋斜街', i;
  for (i = 0; i < 4; i++) g.fillText(s[i], w / 2, 52 + i * 52);
  return toTex(cv, true);
}
/* 横式匾额「烟袋斜街」 */
function texPlaqueH() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2c1c0e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('烟袋斜街', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图取样） */
function Mats() {
  return {
    roofSun:   MAT('p3roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.68 }); }),
    roofShade: MAT('p3roofShd', function () { var t = getTex('tile', texTile); return std('#aeb6c0', { map: t, bump: t, bumpScale: 0.014, rough: 0.74 }); }),
    ridge:     MAT('p3ridge', function () { return std('#333a46', { rough: 0.8 }); }),
    brick:     MAT('p3brick', function () { var t = getTex('brick', texBrick); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.9 }); }),
    brickDk:   MAT('p3brickDk', function () { return std('#9aa0aa', { rough: 0.9 }); }),
    plaster:   MAT('p3plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    lacq:      MAT('p3lacq', function () { return std('#b03a28', { rough: 0.55 }); }),
    lacqBr:    MAT('p3lacqBr', function () { return std('#c14430', { rough: 0.45 }); }),
    lacqDk:    MAT('p3lacqDk', function () { return std('#8e2e20', { rough: 0.62 }); }),
    wood:      MAT('p3wood', function () { return std('#7a5a38', { rough: 0.8 }); }),
    woodD:     MAT('p3woodD', function () { return std('#5a4430', { rough: 0.85 }); }),
    gold:      MAT('p3gold', function () { return std('#d8a63c', { rough: 0.35, metal: 0.75 }); }),
    stone:     MAT('p3stone', function () { return std('#aba79a', { rough: 0.9 }); }),
    stoneD:    MAT('p3stoneD', function () { return std('#8b877b', { rough: 0.92 }); }),
    grass:     MAT('p3grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p3grassD', function () { return std('#698f4c', { rough: 0.95 }); }),
    path:      MAT('p3path', function () { return std('#c6bca4', { rough: 0.95 }); }),
    ink:       MAT('p3ink', function () { return std('#2a2e33', { rough: 0.8 }); }),
    gourd:     MAT('p3gourd', function () { return std('#c8a84a', { rough: 0.5 }); }),
    gourdW:    MAT('p3gourdW', function () { return std('#d8cfa8', { rough: 0.45, emissive: '#ffd98a', ei: 0.3 }); }),
    paper:     MAT('p3paper', function () { return std('#efe8d8', { rough: 0.9, emissive: '#ffd98a', ei: 0.16 }); })
  };
}

/* ================= 2. 预制件（风格独有语汇） ================= */

/* 白纸木格窗：木框 + 纸面 + 竖棂横格（几何花格，非贴图） */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.032, M.woodD));
  g.add(box(w, h, 0.03, M.paper, 0, 0, 0.004));
  g.add(box(0.028, h, 0.036, M.wood, 0, 0, 0.008));
  var rows = o.rows || 2, i;
  for (i = 0; i < rows; i++) {
    var y = -h / 2 + (i + 1) * h / (rows + 1);
    g.add(box(w, 0.024, 0.036, M.wood, 0, y, 0.008));
  }
  return g;
}

/* 朱漆木板门（y0 = 门槛地面线）：门洞阴影 + 朱门 + 金箍 + 门楣 */
function woodDoor(M, w, h, y0) {
  var g = grp();
  g.add(box(w + 0.08, h + 0.05, 0.04, M.woodD, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.045, M.ink, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.92, h * 0.86, 0.05, M.lacqBr, 0, y0 + h / 2, 0.006));
  g.add(box(w * 0.92, 0.03, 0.052, M.gold, 0, y0 + h * 0.7, 0.012));
  g.add(box(w + 0.14, 0.06, 0.07, M.lacqDk, 0, y0 + h + 0.03, 0.008));
  return g;
}

/* 街面柜台（y0 = 门槛地面线）：内嵌店口 + 卧楹木板 + 台面货担 */
function shopCounter(M, w, y0) {
  var g = grp();
  g.add(box(w, 0.4, 0.05, M.ink, 0, y0 + 0.2));
  var i, n = 5;
  for (i = 0; i < n; i++) g.add(box(w / n - 0.012, 0.075, 0.02, M.wood, -w / 2 + (i + 0.5) * (w / n), y0 + 0.12, 0.03));
  g.add(box(w, 0.055, 0.16, M.woodD, 0, y0 + 0.22, 0.06));
  g.add(sph(0.045, M.gold, -w * 0.22, y0 + 0.29, 0.06));
  g.add(cyl(0.045, 0.055, 0.09, 10, M.gourd, w * 0.2, y0 + 0.29, 0.06));
  g.add(box(w + 0.06, 0.05, 0.06, M.lacq, 0, y0 + 0.46, 0.02));
  return g;
}

/* 红灯笼：金盖金底 + 红壳 + 穗（材质随 phase 共享呼吸） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p3lant' + (phase || 0), function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.036 * s, 0.05 * s, 0.035 * s, 8, M.gold, 0, 0.115 * s, 0));
  var body = sph(0.085 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.05 * s, 0.036 * s, 0.035 * s, 8, M.gold, 0, -0.105 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.075 * s, 5, M.lacqDk, 0, -0.168 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.2 + (phase || 0)); });
  return g;
}

/* 葫芦：双腹葫芦（烟袋斜街招牌件） */
function gourdAt(M, s, mat) {
  var g = grp(); s = s || 1;
  var m = mat || M.gourd;
  g.add(cyl(0.008 * s, 0.008 * s, 0.05 * s, 5, M.woodD, 0, 0.055 * s, 0));
  g.add(sph(0.038 * s, m, 0, 0, 0));
  var bot = sph(0.06 * s, m, 0, -0.07 * s, 0); bot.scale.y = 0.9; g.add(bot);
  g.add(cyl(0.014 * s, 0.02 * s, 0.018 * s, 6, M.woodD, 0, 0.035 * s, 0));
  return g;
}

/* 葫芦杆：石础 + 立杆 + 横担 + 双葫芦（摆动动画） */
function gourdPole(M, h, anims, phase) {
  var g = grp();
  g.add(cyl(0.024, 0.032, 0.06, 8, M.stoneD, 0, 0.03, 0));
  g.add(cyl(0.018, 0.024, h, 6, M.woodD, 0, h / 2 + 0.05, 0));
  var armY = h * 0.82 + 0.05;
  g.add(box(0.42, 0.03, 0.03, M.woodD, 0.02, armY, 0));
  g.add(box(0.05, 0.03, 0.05, M.woodD, 0.2, armY + 0.03, 0));
  var swing = grp(); swing.position.set(0.14, armY - 0.02, 0); g.add(swing);
  var gs = Math.min(1, 0.75 + h * 0.3);
  swing.add(gourdAt(M, gs));
  put(swing, gourdAt(M, gs * 0.8), 0.24, -0.02, 0.02);
  anims.push(function (t) { swing.rotation.z = sin(t * 1.3 + (phase || 0)) * 0.055; });
  return g;
}

/* 灰陶瓦坡顶：双坡瓦面（迎光亮/背光暗）+ 黑瓦正脊 + 端头翘吻 + 檐角起翘 + 朱漆封檐板 */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var strips = o.strips !== undefined ? o.strips : 0;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, k > 0 ? M.roofSun : M.roofShade, 0, 0, k * slopeLen / 2));
    for (i = 0; i < strips; i++) {
      var u = (i + 0.5) / strips;
      sg.add(box(w + over * 2 - 0.04, 0.016, 0.03, M.ridge, 0, 0.026, k * u * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.lacqDk, 0, -0.004, k * eave));
    var c1 = box(0.075, 0.05, 0.075, M.ridge, (w + over * 2) / 2 - 0.01, 0.05, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.075, 0.05, 0.075, M.ridge, -(w + over * 2) / 2 + 0.01, 0.05, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
  }
  if (o.gable !== false) {                                    /* 山墙封板（悬山） */
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plaster); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.0225); g.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plaster); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.0225); g.add(t2);
  }
  if (o.ridge !== false) {
    var rw = o.ridgeW || (w + over * 2 + 0.04);
    g.add(box(rw, 0.06 + (o.big ? 0.02 : 0), 0.09, M.ridge, 0, h + 0.03, 0));
    var f1 = box(0.06, 0.1 + (o.big ? 0.03 : 0), 0.08, M.ridge, rw / 2 - 0.01, h + 0.1, 0);
    f1.rotation.z = 0.42; g.add(f1);
    var f2 = box(0.06, 0.1 + (o.big ? 0.03 : 0), 0.08, M.ridge, -rw / 2 + 0.01, h + 0.1, 0);
    f2.rotation.z = -0.42; g.add(f2);
    if (o.big) put(g, sph(0.032, M.gold), 0, h + 0.12, 0);
  }
  return g;
}

/* 歇山顶（lv4 顶）：前后坡 + 左右坡 + 短正脊 + 四角大起翘 + 宝顶金珠 */
function sweepRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.72 + 0.2, 0.035, lenF, M.roofSun, 0, 0, lenF / 2));
  sgF.add(box(w * 0.72 + 0.22, 0.05, 0.024, M.lacqDk, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.72 + 0.2, 0.035, lenF, M.roofShade, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.035, d * 0.8, M.roofShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.035, d * 0.8, M.roofShade, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.08, 0.055, 0.08, M.ridge, c[0] * (eaveS - 0.02), 0.05, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.6; g.add(lift);
  });
  g.add(box(w * 0.5, 0.07, 0.09, M.ridge, 0, h + 0.035, 0));
  var f1 = box(0.06, 0.12, 0.08, M.ridge, w * 0.25, h + 0.1, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.06, 0.12, 0.08, M.ridge, -w * 0.25, h + 0.1, 0); f2.rotation.z = -0.4; g.add(f2);
  put(g, sph(0.038, M.gold), 0, h + 0.14, 0);
  return g;
}

/* 朱漆檐廊：地栿 + 井字棂 + 扶手 */
function balconyUnit(M, w) {
  var g = grp();
  g.add(box(w, 0.035, 0.2, M.lacqDk, 0, 0, 0.1));
  var n = Math.max(4, Math.round(w / 0.085)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.02, 0.15, 0.016, M.lacq, -w / 2 + i * (w / n), 0.09, 0.185));
  }
  g.add(box(w + 0.04, 0.03, 0.03, M.woodD, 0, 0.175, 0.185));
  return g;
}

/* 朱漆柱（金箍 + 石础） */
function column(M, h, r) {
  var g = grp();
  g.add(cyl(r * 1.35, r * 1.5, 0.045, 10, M.stoneD, 0, 0.022, 0));
  g.add(cyl(r, r, h, 10, M.lacqBr, 0, 0.045 + h / 2, 0));
  g.add(cyl(r * 1.18, r * 1.18, 0.028, 10, M.gold, 0, 0.045 + h * 0.82, 0));
  g.add(cyl(r * 1.22, r * 1.1, 0.04, 10, M.lacqDk, 0, 0.045 + h + 0.02, 0));
  return g;
}

/* 石狮（lv4）：基座 + 身 + 头 + 双耳 */
function stoneLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.11 * s, 0.03 * s, 0.11 * s, M.stoneD, 0, 0.015 * s, 0));
  var body = sph(0.05 * s, M.stone, 0, 0.075 * s, 0); body.scale.set(1, 0.9, 1.25); g.add(body);
  g.add(sph(0.038 * s, M.stone, 0, 0.13 * s, 0.045 * s));
  var e1 = mesh(new THREE.ConeGeometry(0.014 * s, 0.03 * s, 6), M.stone); put(g, e1, 0.022 * s, 0.168 * s, 0.045 * s, 0, -0.3);
  var e2 = mesh(new THREE.ConeGeometry(0.014 * s, 0.03 * s, 6), M.stone); put(g, e2, -0.022 * s, 0.168 * s, 0.045 * s, 0, 0.3);
  return g;
}

/* 草坪地坪：草面 + 草沿 + 石板小径 + 岩石 + 灌丛（参考图绿边） */
function padUnit(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  g.add(box(0.42, 0.014, 0.62, M.path, 0, 0.056, d / 2 - 0.36));
  var rock1 = mesh(new THREE.DodecahedronGeometry(0.055, 0), M.stoneD); put(g, rock1, size / 2 - 0.28, 0.07, d / 2 - 0.3);
  var rock2 = mesh(new THREE.DodecahedronGeometry(0.04, 0), M.stoneD); put(g, rock2, -size / 2 + 0.32, 0.06, -d / 2 + 0.34);
  var bush1 = mesh(new THREE.IcosahedronGeometry(0.09, 0), M.grassD); put(g, bush1, -size / 2 + 0.26, 0.12, d / 2 - 0.3);
  bush1.scale.y = 0.8;
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：一间灰瓦小屋 + 葫芦杆 + 长凳（h≈1.10） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.35, 2.35));
  /* 台基 + 墙体 */
  g.add(box(1.3, 0.09, 1.02, M.stoneD, -0.08, 0.045, -0.05));
  g.add(box(1.08, 0.56, 0.82, M.plaster, -0.08, 0.37, -0.05));
  /* 四角木柱 + 前檐枋 */
  [[-0.66, -0.42], [0.5, -0.42], [-0.66, 0.32], [0.5, 0.32]].forEach(function (c) {
    g.add(box(0.06, 0.56, 0.06, M.woodD, c[0], 0.37, c[1]));
  });
  g.add(box(1.22, 0.07, 0.06, M.wood, -0.08, 0.68, 0.38));
  /* 门（偏左）+ 木格窗（右）+ 门口石阶 */
  var door = woodDoor(M, 0.26, 0.36, 0.09); put(g, door, -0.32, 0, 0.355);
  var win = latticeWindow(M, 0.24, 0.26, { rows: 2 }); put(g, win, 0.18, 0.44, 0.375);
  g.add(box(0.4, 0.045, 0.2, M.stoneD, -0.32, 0.115, 0.42));
  /* 悬山瓦顶（apex≈1.02） */
  var roof = tileRoof(M, { w: 1.1, d: 0.86, h: 0.32, strips: 4, big: false });
  put(g, roof, -0.08, 0.7, -0.05);
  /* 门侧灯笼 */
  var lt = lantern(M, 0.72, anims, 0.5); put(g, lt, -0.02, 0.6, 0.42);
  /* 葫芦杆（左前） */
  var pole = gourdPole(M, 0.72, anims, 1.4); put(g, pole, -0.98, 0.03, 0.55);
  /* 长凳 + 水缸 */
  g.add(box(0.4, 0.035, 0.16, M.wood, 0.72, 0.15, 0.5));
  g.add(box(0.05, 0.13, 0.14, M.stoneD, 0.56, 0.085, 0.5));
  g.add(box(0.05, 0.13, 0.14, M.stoneD, 0.88, 0.085, 0.5));
  g.add(cyl(0.07, 0.085, 0.15, 10, M.brickDk, -0.9, 0.14, -0.4));
  /* 短篱笆（右前） */
  var i;
  for (i = 0; i < 3; i++) g.add(box(0.035, 0.2, 0.035, M.wood, 0.55 + i * 0.16, 0.16, 0.92));
  g.add(box(0.42, 0.025, 0.03, M.woodD, 0.71, 0.22, 0.92));
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：两开间（铺面 + 砖塔耳房）+ 披檐 + 檐廊（h≈1.66） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.2));
  /* 铺面主间（左）：台基 + 两层墙 */
  g.add(box(1.42, 0.1, 1.0, M.stoneD, -0.38, 0.05, -0.05));
  g.add(box(1.3, 0.62, 0.9, M.plaster, -0.38, 0.41, -0.05));       /* 铺面层 0.10-0.72 */
  g.add(box(1.34, 0.05, 0.94, M.wood, -0.38, 0.745, -0.04));       /* 二层楼板 */
  g.add(box(1.3, 0.5, 0.84, M.plaster, -0.38, 1.02, -0.05));       /* 二层墙 0.77-1.27 */
  /* 砖塔耳房（右）：塔基 + 塔身 */
  g.add(box(0.78, 0.06, 0.92, M.stoneD, 0.56, 0.08, -0.12));
  g.add(box(0.74, 1.1, 0.88, M.brick, 0.56, 0.66, -0.12));         /* 0.11-1.21 */
  /* 铺面门脸：朱门 + 柜台 + 朱柱 */
  var door = woodDoor(M, 0.3, 0.4, 0.1); put(g, door, -0.82, 0, 0.44);
  var counter = shopCounter(M, 0.62, 0.1); put(g, counter, -0.2, 0, 0.44);
  var cL = column(M, 0.52, 0.032); put(g, cL, -0.52, 0.1, 0.47);
  var cR = column(M, 0.52, 0.032); put(g, cR, 0.14, 0.1, 0.47);
  /* 二层：檐廊 + 木格窗 + 隔门 */
  var balc = balconyUnit(M, 1.2); put(g, balc, -0.38, 0.79, 0.42);
  var w1 = latticeWindow(M, 0.26, 0.28, { rows: 2 }); put(g, w1, -0.66, 1.04, 0.385);
  var w2 = latticeWindow(M, 0.26, 0.28, { rows: 2 }); put(g, w2, -0.1, 1.04, 0.385);
  g.add(box(0.22, 0.34, 0.04, M.woodD, 0.32, 1.0, 0.385));
  g.add(box(1.36, 0.06, 0.06, M.lacqDk, -0.38, 1.28, 0.44));       /* 廊楣 */
  /* 披檐（铺面顶）+ 主瓦顶 + 塔顶小悬山 */
  var awn = tileRoof(M, { w: 1.34, d: 0.5, h: 0.14, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, awn, -0.38, 0.8, 0.16);
  var main = tileRoof(M, { w: 1.28, d: 0.98, h: 0.24, strips: 3, big: false });
  put(g, main, -0.38, 1.3, -0.05);                                  /* apex≈1.60 */
  var tRoof = tileRoof(M, { w: 0.7, d: 0.84, h: 0.18, strips: 2, big: false });
  put(g, tRoof, 0.56, 1.23, -0.12);                                 /* apex≈1.46 */
  /* 灯笼 ×2（廊楣下）+ 塔壁高窗 */
  var l1 = lantern(M, 0.66, anims, 0.8); put(g, l1, -1.0, 1.2, 0.5);
  var l2 = lantern(M, 0.66, anims, 2.1); put(g, l2, 0.24, 1.2, 0.5);
  var tw1 = latticeWindow(M, 0.17, 0.2, { rows: 2 }); tw1.rotation.y = PI / 2; put(g, tw1, 0.945, 0.95, -0.12);
  var tw2 = latticeWindow(M, 0.15, 0.18, { rows: 2 }); put(g, tw2, 0.56, 0.62, 0.335);
  /* 葫芦杆 + 盆栽 */
  var pole = gourdPole(M, 1.05, anims, 1.1); put(g, pole, -1.06, 0.03, 0.6);
  g.add(cyl(0.06, 0.075, 0.1, 10, M.brickDk, 1.02, 0.1, 0.62));
  var bush = mesh(new THREE.IcosahedronGeometry(0.075, 0), M.grassD); put(g, bush, 1.02, 0.2, 0.62); bush.scale.y = 0.85;
  g.add(cyl(0.05, 0.06, 0.08, 10, M.brickDk, -1.12, 0.09, -0.6));
  var bush2 = mesh(new THREE.IcosahedronGeometry(0.06, 0), M.grassD); put(g, bush2, -1.12, 0.17, -0.6);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}

/* ---- lv3 大厦：三层退台 + 层层挑檐 + 高砖塔 + 立幌子（h≈2.08） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  /* 高砖塔（右后）：整高青砖 + 白缝高窗 + 塔顶压檐 + 花箱 */
  g.add(box(0.88, 0.08, 0.96, M.stoneD, 0.66, 0.09, -0.24));
  g.add(box(0.84, 1.8, 0.92, M.brick, 0.66, 1.03, -0.24));         /* 0.13-1.93 */
  g.add(box(0.9, 0.05, 0.98, M.ridge, 0.66, 1.955, -0.24));
  var tw1 = latticeWindow(M, 0.16, 0.2, { rows: 2 }); tw1.rotation.y = PI / 2; put(g, tw1, 1.09, 1.5, -0.24);
  var tw2 = latticeWindow(M, 0.16, 0.2, { rows: 2 }); tw2.rotation.y = PI / 2; put(g, tw2, 1.09, 0.86, -0.24);
  var tw3 = latticeWindow(M, 0.16, 0.2, { rows: 2 }); put(g, tw3, 0.66, 1.72, 0.245);
  var tw4 = latticeWindow(M, 0.16, 0.2, { rows: 2 }); put(g, tw4, 0.66, 1.06, 0.245);
  /* 前楼三层退台（左） */
  var fx = -0.34;
  g.add(box(1.56, 0.1, 1.0, M.stoneD, fx, 0.05, 0));
  g.add(box(1.44, 0.52, 0.9, M.plaster, fx, 0.36, 0));             /* 一层 0.10-0.62 */
  g.add(box(1.6, 0.045, 1.04, M.lacqDk, fx, 0.645, 0));
  g.add(box(1.3, 0.48, 0.84, M.plaster, fx, 0.89, -0.02));         /* 二层 0.65-1.13 */
  g.add(box(1.42, 0.045, 0.94, M.lacqDk, fx, 1.155, -0.02));
  g.add(box(1.14, 0.44, 0.78, M.plaster, fx, 1.395, -0.04));       /* 三层 1.175-1.615 */
  /* 一层门脸：朱门 + 柜台 + 朱柱 + 立幌子 */
  var door = woodDoor(M, 0.3, 0.42, 0.1); put(g, door, fx - 0.52, 0, 0.47);
  var counter = shopCounter(M, 0.6, 0.1); put(g, counter, fx + 0.18, 0, 0.47);
  var cL = column(M, 0.5, 0.032); put(g, cL, fx - 0.16, 0.1, 0.5);
  var cR = column(M, 0.5, 0.032); put(g, cR, fx + 0.56, 0.1, 0.5);
  var sign = grp();
  sign.add(box(0.2, 0.66, 0.05, M.lacqDk));
  var sp = mesh(new THREE.PlaneGeometry(0.16, 0.58),
    new THREE.MeshStandardMaterial({ map: getTex('signV', texSignV), roughness: 0.6, metalness: 0.05, flatShading: true }));
  sp.position.z = 0.028; sign.add(sp);
  put(g, sign, fx + 0.63, 0.35, 0.5);                               /* 幌子顶端挂在层间枋 */
  /* 二层/三层：檐廊 + 木格窗 */
  var b2 = balconyUnit(M, 1.24); put(g, b2, fx, 0.68, 0.42);
  var b3 = balconyUnit(M, 1.06); put(g, b3, fx, 1.2, 0.38);
  var w21 = latticeWindow(M, 0.24, 0.26, { rows: 2 }); put(g, w21, fx - 0.28, 0.94, 0.42);
  var w22 = latticeWindow(M, 0.24, 0.26, { rows: 2 }); put(g, w22, fx + 0.3, 0.94, 0.42);
  var w31 = latticeWindow(M, 0.22, 0.24, { rows: 2 }); put(g, w31, fx - 0.2, 1.38, 0.385);
  var w32 = latticeWindow(M, 0.22, 0.24, { rows: 2 }); put(g, w32, fx + 0.24, 1.38, 0.385);
  /* 层层挑檐 + 顶层主瓦顶（屋顶完全展开） */
  var a1 = tileRoof(M, { w: 1.46, d: 0.6, h: 0.15, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, a1, fx, 0.67, 0.14);
  var a2 = tileRoof(M, { w: 1.3, d: 0.56, h: 0.14, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, a2, fx, 1.18, 0.12);
  var main = tileRoof(M, { w: 1.1, d: 0.9, h: 0.32, strips: 4, big: true });
  put(g, main, fx, 1.64, -0.04);                                    /* apex≈2.04 */
  /* 灯笼：一层檐下 ×2 + 二层 ×2 */
  var l1 = lantern(M, 0.6, anims, 0.6); put(g, l1, fx - 0.74, 0.56, 0.52);
  var l2 = lantern(M, 0.6, anims, 1.9); put(g, l2, fx + 0.5, 0.56, 0.52);
  var l3 = lantern(M, 0.55, anims, 2.8); put(g, l3, fx - 0.6, 1.06, 0.48);
  var l4 = lantern(M, 0.55, anims, 4.0); put(g, l4, fx + 0.4, 1.06, 0.48);
  /* 葫芦杆 + 塔上花箱 + 盆栽 */
  var pole = gourdPole(M, 1.32, anims, 1.2); put(g, pole, -1.1, 0.03, 0.62);
  g.add(box(0.3, 0.07, 0.12, M.woodD, 0.66, 2.0, 0.3));
  var fb = mesh(new THREE.IcosahedronGeometry(0.05, 0), M.grassD); put(g, fb, 0.66, 2.07, 0.3);
  g.add(cyl(0.06, 0.075, 0.1, 10, M.brickDk, 0.98, 0.1, 0.78));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, bush, 0.98, 0.2, 0.78); bush.scale.y = 0.85;
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.15 + 0.6); });
  return g;
}

/* ---- lv4 地标：石台基 + 石狮朱门 + 两厢 + 歇山楼阁（h≈2.40） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.4));
  /* 石台基 + 垂带踏步 */
  g.add(box(2.06, 0.17, 1.56, M.stone, 0, 0.085, -0.02));
  g.add(box(2.14, 0.05, 1.62, M.stoneD, 0, 0.025, -0.02));
  g.add(box(0.62, 0.07, 0.18, M.stoneD, 0, 0.195, 0.86));
  g.add(box(0.5, 0.06, 0.16, M.stoneD, 0, 0.26, 0.76));
  /* 石狮一对 */
  put(g, stoneLion(M, 1.15), -0.46, 0.17, 0.72);
  put(g, stoneLion(M, 1.15), 0.46, 0.17, 0.72);
  /* 朱门（金钉门簪）+ 门楣匾额 */
  var gate = grp(); put(g, gate, 0, 0.17, 0.6);
  var cGL = column(M, 0.46, 0.035); put(gate, cGL, -0.36, 0.0, 0.06);
  var cGR = column(M, 0.46, 0.035); put(gate, cGR, 0.36, 0.0, 0.06);
  gate.add(box(0.3, 0.42, 0.05, M.lacqBr, -0.155, 0.21, 0.0));
  gate.add(box(0.3, 0.42, 0.05, M.lacqBr, 0.155, 0.21, 0.0));
  [-0.23, -0.08, 0.08, 0.23].forEach(function (x) {
    gate.add(sph(0.016, M.gold, x, 0.3, 0.03));
    gate.add(sph(0.016, M.gold, x, 0.16, 0.03));
  });
  gate.add(box(0.94, 0.09, 0.07, M.lacqDk, 0, 0.47, 0.03));         /* 门楣 */
  var plq = mesh(new THREE.PlaneGeometry(0.56, 0.14),
    new THREE.MeshStandardMaterial({ map: getTex('plaqueH', texPlaqueH), roughness: 0.6, metalness: 0.05, flatShading: true }));
  plq.position.set(0, 0.47, 0.072); gate.add(plq);                  /* 匾额「烟袋斜街」 */
  /* 两厢（左右各一间，自覆小悬山） */
  [[-1], [1]].forEach(function (s) {
    var wx = s[0] * 0.88;
    g.add(box(0.54, 0.05, 0.94, M.stoneD, wx, 0.195, -0.18));
    g.add(box(0.5, 0.44, 0.9, M.brick, wx, 0.41, -0.18));           /* 0.19-0.63 */
    var wr = tileRoof(M, { w: 0.46, d: 0.86, h: 0.16, strips: 0, big: false });
    put(g, wr, wx, 0.62, -0.18);
    var ww = latticeWindow(M, 0.18, 0.2, { rows: 2 }); put(g, ww, wx + s[0] * 0.16, 0.43, 0.295);
  });
  /* 中央楼阁：一层堂 + 腰檐 + 二层廊 + 顶阁歇山 */
  g.add(box(1.16, 0.64, 0.94, M.plaster, 0, 0.51, -0.18));          /* 0.19-0.83 */
  var c1 = column(M, 0.5, 0.034); put(g, c1, -0.42, 0.17, 0.34);
  var c2 = column(M, 0.5, 0.034); put(g, c2, 0.42, 0.17, 0.34);
  var c3 = column(M, 0.5, 0.034); put(g, c3, -0.14, 0.17, 0.36);
  var c4 = column(M, 0.5, 0.034); put(g, c4, 0.14, 0.17, 0.36);
  var w1 = latticeWindow(M, 0.2, 0.24, { rows: 2 }); put(g, w1, -0.28, 0.55, 0.315);
  var w2 = latticeWindow(M, 0.2, 0.24, { rows: 2 }); put(g, w2, 0.28, 0.55, 0.315);
  var waist = tileRoof(M, { w: 1.06, d: 0.72, h: 0.2, strips: 2, big: false });
  put(g, waist, 0, 0.83, -0.18);                                    /* 腰檐 apex≈1.03 */
  g.add(box(0.98, 0.5, 0.84, M.lacq, 0, 1.19, -0.18));              /* 二层廊 0.94-1.44 */
  var b2 = balconyUnit(M, 0.92); put(g, b2, 0, 0.94, 0.26);
  var w3 = latticeWindow(M, 0.2, 0.24, { rows: 2 }); put(g, w3, -0.22, 1.28, 0.255);
  var w4 = latticeWindow(M, 0.2, 0.24, { rows: 2 }); put(g, w4, 0.22, 1.28, 0.255);
  var l3a = lantern(M, 0.52, anims, 0.9); put(g, l3a, -0.52, 0.92, 0.34);
  var l3b = lantern(M, 0.52, anims, 2.3); put(g, l3b, 0.52, 0.92, 0.34);
  g.add(box(0.86, 0.42, 0.76, M.lacqBr, 0, 1.66, -0.18));           /* 顶阁 1.45-1.87 */
  var top = sweepRoof(M, { w: 0.84, d: 0.78, h: 0.38 });
  put(g, top, 0, 1.88, -0.18);                                      /* 宝顶≈2.40 */
  /* 门口灯笼 ×2 + 葫芦灯杆（左，白膜葫芦灯 + 摆动） */
  var l1 = lantern(M, 0.66, anims, 0.3); put(g, l1, -0.66, 0.62, 0.6);
  var l2 = lantern(M, 0.66, anims, 1.7); put(g, l2, 0.66, 0.62, 0.6);
  var gl = grp(); put(g, gl, -1.08, 0.03, 0.55);
  gl.add(cyl(0.024, 0.032, 0.07, 8, M.stoneD, 0, 0.035, 0));
  gl.add(cyl(0.02, 0.026, 1.42, 6, M.woodD, 0, 0.78, 0));
  gl.add(box(0.4, 0.032, 0.032, M.woodD, 0.03, 1.42, 0));
  var glSwing = grp(); glSwing.position.set(0.18, 1.4, 0); gl.add(glSwing);
  glSwing.add(gourdAt(M, 1.15, M.gourdW));
  var gourdGlow = M.gourdW;
  anims.push(function (t) {
    glSwing.rotation.z = sin(t * 1.15 + 0.8) * 0.06;
    gourdGlow.emissiveIntensity = 0.3 + 0.12 * sin(t * 1.9 + 0.4);
  });
  /* 盆栽 ×2（踏步两侧） */
  g.add(cyl(0.065, 0.08, 0.11, 10, M.brickDk, -0.86, 0.28, 0.8));
  var pb1 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.grassD); put(g, pb1, -0.86, 0.39, 0.8); pb1.scale.y = 0.85;
  g.add(cyl(0.065, 0.08, 0.11, 10, M.brickDk, 0.86, 0.28, 0.8));
  var pb2 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.grassD); put(g, pb2, 0.86, 0.39, 0.8); pb2.scale.y = 0.85;
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.05 + 1.2); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[3] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_3_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 3;
  g.userData.level = lv;
  g.userData.region = 'g1';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
