/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_28.js
 * -------------------------------------------------------------------------------------
 * 格 28「书院门」(g6 三秦大地) 独属建筑：唐风书院文化街四阶生长史
 * 参考图 refs/prop_28.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop28/，
 * strict-quality PASS；材质 referencePbr 均自参考图逐区提取）。
 *
 * 风格族谱（同一块地的同一种生长——唐风青灰瓦 + 鎏金脊饰 + 朱柱白墙 + 米白布幌）：
 *   lv1 小屋   草顶木构纸扎摊：X 形脊杆茅草坡顶 + 木柱抹灰墙 + 布棚幌子 + 旗杆（h≈1.05）
 *   lv2 洋房   横向两开间：正屋青瓦坡顶 + 鎏金鸱吻 + 朱柱檐廊 + 披屋耳房 + 布棚铺面（h≈1.62）
 *   lv3 大厦   腰檐起台两层：一层铺面 scrolls 摊 + 二层木栏杆回廊 + 圆鎏金匾 + 大屋顶金
 *              饰戗脊（h≈2.10）
 *   lv4 地标   石台基 + 红毯踏步 + 鎏金石狮 + 三重檐楼阁：金门朱廊、层层栏杆、宝顶金珠、
 *              左右杏花（h≈2.75）
 *
 * 独有语汇（自参考图提炼，与 prop_1/3/8/9/14 拉开差异）：
 *   青灰瓦垄（阳面亮/阴面暗 + 鎏金鸱吻角吻）、朱红列柱（金箍+斗块）、米白抹灰填充墙、
 *   米白布幌（店铺凉棚扇贝边 + 竖幡）、文房摊（书卷/瓷器）、红灯笼暖光、
 *   lv4 石台基红毯踏步 + 鎏金狮 + 杏花 + 「书院门」金匾。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[28] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_28] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 颜色 / 材质基元（std: sRGB→Linear） ================= */
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
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 12, 8), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rz, rx) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz; if (rx) o.rotation.x = rx;
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

/* 青灰瓦垄：横向垄线明暗（阳面亮 #6b7482 / 阴面暗 #454c58 同源） + 竖向接头 + 陶噪点 */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#59616d'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#656e7c' : '#5a6270';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#3f4652'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#707a8a'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(44,50,60,0.55)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(22,27,34,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 茅草：横向草秆层铺 + 深浅交错 + 垂穗 */
function texThatch() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#d3a055'; g.fillRect(0, 0, S, S);
  var i, rows = 11, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#c8934a' : '#dcae64';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#a06a30'; g.fillRect(0, y + rh - 2, S, 2);
    for (var k = 0; k < 14; k++) {
      var x = (k * 9 + (i % 3) * 3) % S;
      g.strokeStyle = (k % 2) ? 'rgba(224,178,106,0.5)' : 'rgba(140,92,40,0.42)';
      g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x + 3, y + rh - 2); g.stroke();
    }
  }
  return toTex(cv, true);
}
/* 暖白抹灰：细噪 + 抹痕 */
function texPlaster() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#efe4d1'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 80; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.07)' : 'rgba(150,132,102,0.07)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 横式鎏金匾「书院门」（lv4 门楣） */
function texPlaqueH() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#8f5c14'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2c96a'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#ffe6a0'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('书 院 门', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图 MEDIANCUT/逐区取样） */
function Mats() {
  return {
    roofSun:   MAT('p28roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.66 }); }),
    roofShade: MAT('p28roofShd', function () { var t = getTex('tile', texTile); return std('#a9b2be', { map: t, bump: t, bumpScale: 0.014, rough: 0.72 }); }),
    ridge:     MAT('p28ridge', function () { return std('#3f4652', { rough: 0.8 }); }),
    timber:    MAT('p28timber', function () { return std('#7a4a24', { rough: 0.8 }); }),
    timberD:   MAT('p28timberD', function () { return std('#5c3418', { rough: 0.85 }); }),
    lacq:      MAT('p28lacq', function () { return std('#b04018', { rough: 0.5 }); }),
    lacqDk:    MAT('p28lacqDk', function () { return std('#8a2a10', { rough: 0.58 }); }),
    gold:      MAT('p28gold', function () { return std('#e0a83c', { rough: 0.35, metal: 0.75 }); }),
    goldHi:    MAT('p28goldHi', function () { return std('#f2c96a', { rough: 0.3, metal: 0.8 }); }),
    plaster:   MAT('p28plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    cloth:     MAT('p28cloth', function () { return std('#f2e3c4', { rough: 0.95 }); }),
    clothSh:   MAT('p28clothSh', function () { return std('#e4d1ae', { rough: 0.95 }); }),
    thatch:    MAT('p28thatch', function () { var t = getTex('thatch', texThatch); return std('#ffffff', { map: t, bump: t, bumpScale: 0.02, rough: 0.95 }); }),
    thatchD:   MAT('p28thatchD', function () { return std('#a06a30', { rough: 0.95 }); }),
    stone:     MAT('p28stone', function () { return std('#b0a48a', { rough: 0.9 }); }),
    stoneD:    MAT('p28stoneD', function () { return std('#948a72', { rough: 0.92 }); }),
    grass:     MAT('p28grass', function () { return std('#7fa036', { rough: 0.95 }); }),
    grassD:    MAT('p28grassD', function () { return std('#63832e', { rough: 0.95 }); }),
    dirt:      MAT('p28dirt', function () { return std('#d8b57c', { rough: 0.95 }); }),
    paver:     MAT('p28paver', function () { return std('#c9b285', { rough: 0.95 }); }),
    ink:       MAT('p28ink', function () { return std('#2a2622', { rough: 0.9 }); }),
    paper:     MAT('p28paper', function () { return std('#f2c06a', { rough: 0.85, emissive: '#ffbe5a', ei: 0.3 }); }),
    scroll:    MAT('p28scroll', function () { return std('#f5eee0', { rough: 0.9 }); }),
    blossom:   MAT('p28blossom', function () { return std('#f2b4c0', { rough: 0.95 }); }),
    blossomD:  MAT('p28blossomD', function () { return std('#e895a8', { rough: 0.95 }); }),
    trunk:     MAT('p28trunk', function () { return std('#6b4a30', { rough: 0.9 }); }),
    carpet:    MAT('p28carpet', function () { return std('#d84c20', { rough: 0.9 }); }),
    carpetD:   MAT('p28carpetD', function () { return std('#b03418', { rough: 0.9 }); }),
    leaf:      MAT('p28leaf', function () { return std('#7fa032', { rough: 0.95 }); }),
    leafD:     MAT('p28leafD', function () { return std('#5d7f26', { rough: 0.95 }); })
  };
}

/* ================= 2. 预制件（风格独有语汇） ================= */

/* 木格窗：木框 + 暖纸 + 竖棂横格（几何花格，非贴图） */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.032, M.timberD));
  g.add(box(w, h, 0.03, M.paper, 0, 0, 0.004));
  var cols = o.cols || 3, i;
  for (i = 0; i < cols; i++) {
    g.add(box(0.026, h, 0.036, M.timber, -w / 2 + (i + 1) * w / (cols + 1), 0, 0.008));
  }
  var rows = o.rows || 2;
  for (i = 0; i < rows; i++) {
    g.add(box(w, 0.022, 0.036, M.timber, 0, -h / 2 + (i + 1) * h / (rows + 1), 0.008));
  }
  return g;
}

/* 朱红列柱：石础 + 柱身 + 金箍 + 枋上斗块（唐风column） */
function redColumn(M, h, r) {
  var g = grp();
  g.add(box(r * 3.2, 0.045, r * 3.2, M.stoneD, 0, 0.022, 0));
  g.add(cyl(r, r * 1.04, h, 10, M.lacq, 0, 0.045 + h / 2, 0));
  g.add(cyl(r * 1.16, r * 1.16, 0.026, 10, M.gold, 0, 0.045 + h * 0.84, 0));
  g.add(box(r * 2.6, 0.05, r * 2.6, M.lacqDk, 0, 0.045 + h + 0.025, 0));
  return g;
}

/* 鎏金鸱吻：四分之一环角 + 端珠（参考图脊端金角） */
function chiwen(M, s, flip) {
  var g = grp(); s = s || 1;
  var tor = mesh(new THREE.TorusGeometry(0.05 * s, 0.017 * s, 8, 12, PI * 0.8), M.gold);
  tor.rotation.z = flip ? -PI * 0.55 : PI * 0.65;
  g.add(tor);
  g.add(sph(0.024 * s, M.goldHi, (flip ? -0.052 : 0.052) * s, 0.05 * s, 0));
  return g;
}

/* 青瓦双坡顶：阳/阴坡瓦面 + 黑瓦条 + 顶脊木栏 + 双鎏金鸱吻 + 檐角翘起 + 可选山墙 */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, k > 0 ? M.roofSun : M.roofShade, 0, 0, k * slopeLen / 2));
    var strips = o.strips !== undefined ? o.strips : 3;
    for (i = 0; i < strips; i++) {
      var u = (i + 0.5) / strips;
      sg.add(box(w + over * 2 - 0.04, 0.015, 0.028, M.ridge, 0, 0.026, k * u * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.024, M.lacqDk, 0, -0.004, k * eave));
    /* 檐角起翘：两端小方块上翘 + 金包角 */
    var c1 = box(0.07, 0.05, 0.07, M.ridge, (w + over * 2) / 2 - 0.01, 0.045, k * (eave - 0.02));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ridge, -(w + over * 2) / 2 + 0.01, 0.045, k * (eave - 0.02));
    c2.rotation.z = -0.55; sg.add(c2);
    if (o.goldTips) {
      sg.add(sph(0.026, M.goldHi, (w + over * 2) / 2 - 0.01, 0.085, k * (eave - 0.02)));
      sg.add(sph(0.026, M.goldHi, -(w + over * 2) / 2 + 0.01, 0.085, k * (eave - 0.02)));
    }
  }
  if (o.gable) {                                            /* 山墙封板（悬山） */
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plaster); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.0225); g.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plaster); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.0225); g.add(t2);
  }
  if (o.ridge !== false) {
    /* 顶脊：木脊栏（参考图为木色脊枋）+ 两端鎏金鸱吻 */
    var rw = o.ridgeW || (w + over * 2 + 0.04);
    g.add(box(rw, 0.055 + (o.big ? 0.02 : 0), 0.075, o.ridgeMat || M.timber, 0, h + 0.055, 0));
    if (o.chiwen !== false) {
      var ch1 = chiwen(M, o.big ? 1.15 : 0.9, false); put(g, ch1, rw / 2 - 0.01, h + 0.09, 0);
      var ch2 = chiwen(M, o.big ? 1.15 : 0.9, true); put(g, ch2, -rw / 2 + 0.01, h + 0.09, 0);
    }
    if (o.centerOrb) g.add(sph(0.036, M.goldHi, 0, h + 0.13, 0));
  }
  return g;
}

/* 歇山/庑殿四坡顶（lv3 顶 / lv4 顶）：四坡瓦面 + 四角大起翘 + 鎏金戗脊 + 宝顶 */
function sweepRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.72 + 0.2, 0.035, lenF, M.roofSun, 0, 0, lenF / 2));
  sgF.add(box(w * 0.72 + 0.22, 0.045, 0.024, M.lacqDk, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.72 + 0.2, 0.035, lenF, M.roofShade, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.035, d * 0.8, M.roofShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.035, d * 0.8, M.roofShade, -lenS / 2, 0, 0));
  /* 四角起翘 + 鎏金戗脊条（沿脊线方向，参考图金饰戗脊） */
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.075, 0.05, 0.075, M.ridge, c[0] * (eaveS - 0.02), 0.05, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.6; g.add(lift);
    if (o.goldHips) {
      var horiz = Math.sqrt(eaveS * eaveS + eaveF * eaveF);
      var hipLen = Math.sqrt(horiz * horiz + h * h) * 0.92;
      var yaw = grp(); yaw.position.set(0, h, 0);
      yaw.rotation.y = Math.atan2(c[0] * eaveS, c[1] * eaveF);
      g.add(yaw);
      var pitch = grp(); pitch.rotation.x = Math.atan2(horiz, h); yaw.add(pitch);
      pitch.add(box(0.028, 0.018, hipLen, M.gold, 0, 0.012, hipLen * 0.44));
      g.add(sph(0.024, M.goldHi, c[0] * (eaveS - 0.02), 0.1, c[1] * (eaveF - 0.02)));
    }
  });
  g.add(box(w * 0.5, 0.065, 0.08, o.ridgeMat || M.timber, 0, h + 0.032, 0));
  if (o.chiwen !== false) {
    var ch1 = chiwen(M, 1.15, false); put(g, ch1, w * 0.25, h + 0.08, 0);
    var ch2 = chiwen(M, 1.15, true); put(g, ch2, -w * 0.25, h + 0.08, 0);
  }
  if (o.finial) {
    /* 鎏金宝顶：叠珠 + 角叉（参考图 lv4 顶） */
    g.add(cyl(0.03, 0.045, 0.05, 10, M.gold, 0, h + 0.09, 0));
    g.add(sph(0.042, M.goldHi, 0, h + 0.14, 0));
    var horn1 = mesh(new THREE.TorusGeometry(0.045, 0.013, 8, 12, PI * 0.7), M.gold);
    horn1.rotation.z = PI * 0.7; put(g, horn1, 0.01, h + 0.2, 0);
    var horn2 = mesh(new THREE.TorusGeometry(0.045, 0.013, 8, 12, PI * 0.7), M.gold);
    horn2.rotation.z = PI * 0.3; put(g, horn2, -0.01, h + 0.2, 0);
    g.add(sph(0.026, M.goldHi, 0, h + 0.24, 0));
  } else if (o.centerOrb) {
    g.add(sph(0.034, M.goldHi, 0, h + 0.1, 0));
  }
  return g;
}

/* 腰檐：四面小瓦坡带（lv3 层间 / lv4 诸层间） */
function waistEave(M, o) {
  var w = o.w, d = o.d, h = o.h || 0.1;
  var g = grp();
  var over = 0.08;
  var eaveF = d / 2 + over, eaveS = w / 2 + over;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.01;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.01;
  var f = grp(); f.position.set(0, h, 0); f.rotation.x = pitchF; g.add(f);
  f.add(box(w + over * 2, 0.03, lenF, M.roofSun, 0, 0, lenF / 2));
  var b = grp(); b.position.set(0, h, 0); b.rotation.x = -pitchF; g.add(b);
  b.add(box(w + over * 2, 0.03, lenF, M.roofShade, 0, 0, -lenF / 2));
  var r = grp(); r.position.set(0, h, 0); r.rotation.z = -pitchS; g.add(r);
  r.add(box(lenS, 0.03, d * 0.86, M.roofShade, lenS / 2, 0, 0));
  var l = grp(); l.position.set(0, h, 0); l.rotation.z = pitchS; g.add(l);
  l.add(box(lenS, 0.03, d * 0.86, M.roofShade, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.055, 0.04, 0.055, M.ridge, c[0] * (eaveS - 0.015), 0.035, c[1] * (eaveF - 0.015));
    lift.rotation.z = -c[0] * 0.55; g.add(lift);
  });
  return g;
}

/* 红灯笼：金盖金底 + 红壳 + 穗（材质随 phase 共享呼吸） */
function lantern(M, s, anims, phase, orange) {
  var g = grp(); s = s || 1;
  var bm = MAT('p28lant' + (orange ? 'o' : '') + (phase || 0), function () {
    return std(orange ? '#f4851f' : '#e04818', { rough: 0.55, emissive: '#ff8c3c', ei: 0.55 });
  });
  g.add(cyl(0.036 * s, 0.05 * s, 0.035 * s, 8, M.gold, 0, 0.115 * s, 0));
  var body = sph(0.085 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.05 * s, 0.036 * s, 0.035 * s, 8, M.gold, 0, -0.105 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.07 * s, 5, M.lacqDk, 0, -0.16 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.2 + (phase || 0)); });
  return g;
}

/* 米白竖幡：顶杆 pivot 布幅 + 摆动（参考图幌子） */
function banner(M, w, h, anims, phase, clothMat) {
  var g = grp();
  var piv = grp(); g.add(piv);
  piv.add(box(w, h, 0.02, clothMat || M.cloth, 0, -h / 2, 0));
  piv.add(box(w + 0.015, 0.03, 0.024, M.clothSh, 0, -h + 0.015, 0));
  anims.push(function (t) { piv.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.065; });
  return g;
}

/* 朱漆木栏杆：地栿 + 井字棂 + 扶手 */
function balconyUnit(M, w, mat) {
  var g = grp();
  var mm = mat || M.lacq;
  g.add(box(w, 0.032, 0.03, mm, 0, 0, 0));
  var n = Math.max(4, Math.round(w / 0.09)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.13, 0.015, mm, -w / 2 + i * (w / n), 0.082, 0));
  }
  g.add(box(w + 0.03, 0.028, 0.032, M.timberD, 0, 0.158, 0));
  return g;
}

/* 米白布棚（店铺凉棚）：斜布面 + 扇贝边（参考图 scalloped awning） */
function awning(M, w, depth, anims) {
  var g = grp();
  var slab = box(w, 0.022, depth, M.cloth, 0, 0, depth / 2 - 0.03);
  slab.rotation.x = 0.32; g.add(slab);
  var n = Math.max(5, Math.round(w / 0.16)), i;
  for (i = 0; i < n; i++) {
    var x = -w / 2 + (i + 0.5) * (w / n);
    var sc = sph(0.03, M.cloth, x, -0.028, depth - 0.055);
    sc.scale.y = 0.62; g.add(sc);
  }
  g.add(box(w, 0.016, 0.02, M.clothSh, 0, -0.03, depth - 0.045));
  return g;
}

/* 文房摊：矮桌 + 书卷 + 瓷罐（书院门 lineage） */
function stallTable(M, withScrolls) {
  var g = grp();
  g.add(box(0.42, 0.035, 0.22, M.timber, 0, 0.17, 0));
  g.add(box(0.04, 0.17, 0.04, M.timberD, -0.17, 0.085, -0.07));
  g.add(box(0.04, 0.17, 0.04, M.timberD, 0.17, 0.085, -0.07));
  g.add(box(0.04, 0.17, 0.04, M.timberD, -0.17, 0.085, 0.07));
  g.add(box(0.04, 0.17, 0.04, M.timberD, 0.17, 0.085, 0.07));
  if (withScrolls !== false) {
    for (var i = 0; i < 3; i++) {
      var sc = cyl(0.024, 0.024, 0.16, 10, M.scroll, -0.1 + i * 0.055, 0.21, 0.02);
      sc.rotation.z = PI / 2; g.add(sc);
    }
  }
  var pot = sph(0.045, M.stoneD, 0.13, 0.215, -0.03); pot.scale.y = 0.85; g.add(pot);
  return g;
}

/* 草坪地坪：草面 + 草沿 + 前径（土路 or 石板） + 灌丛/岩石 */
function padUnit(M, size, depth, paver) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  if (paver) {
    g.add(box(0.5, 0.012, 0.5, M.paver, 0, 0.056, d / 2 - 0.34));
    g.add(box(0.72, 0.012, 0.4, M.paver, 0, 0.056, d / 2 - 0.62));
  } else {
    g.add(box(0.44, 0.012, 0.7, M.dirt, 0, 0.056, d / 2 - 0.42));
  }
  var rock = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, rock, size / 2 - 0.26, 0.065, d / 2 - 0.28);
  var bush = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.grassD); put(g, bush, -size / 2 + 0.25, 0.11, d / 2 - 0.3);
  bush.scale.y = 0.8;
  return g;
}

/* 杏花树（lv4）：褐干 + 双粉冠 */
function blossomTree(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.022 * s, 0.032 * s, 0.3 * s, 8, M.trunk, 0, 0.15 * s, 0));
  var c1 = sph(0.16 * s, M.blossom, 0, 0.38 * s, 0); c1.scale.y = 0.88; g.add(c1);
  var c2 = sph(0.11 * s, M.blossomD, 0.1 * s, 0.3 * s, 0.06 * s); g.add(c2);
  return g;
}

/* 绿树（lv2/lv3 背景树） */
function greenTree(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.018 * s, 0.026 * s, 0.22 * s, 8, M.trunk, 0, 0.11 * s, 0));
  var c1 = sph(0.15 * s, M.leaf, 0, 0.32 * s, 0); c1.scale.y = 0.9; g.add(c1);
  var c2 = sph(0.1 * s, M.leafD, 0.09 * s, 0.24 * s, 0.05 * s); g.add(c2);
  return g;
}

/* 鎏金石狮（lv4）：石座 + 金身 + 鬃环 + 头/耳 */
function goldLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.13 * s, 0.05 * s, 0.13 * s, M.stoneD, 0, 0.025 * s, 0));
  g.add(box(0.1 * s, 0.03 * s, 0.1 * s, M.stone, 0, 0.065 * s, 0));
  var body = sph(0.052 * s, M.gold, 0, 0.12 * s, 0); body.scale.set(1, 0.88, 1.25); g.add(body);
  var mane = mesh(new THREE.TorusGeometry(0.036 * s, 0.014 * s, 8, 12), M.goldHi);
  mane.rotation.x = PI / 2; mane.position.set(0, 0.155 * s, 0.05 * s); g.add(mane);
  g.add(sph(0.034 * s, M.gold, 0, 0.165 * s, 0.062 * s));
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：草顶木构纸扎摊 + 旗杆布幌 + 文房摊（h≈1.05） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.3, false));
  var hx = -0.12, hz = -0.12;
  /* 台基 + 木柱 + 抹灰填充墙（正面留门窗洞） */
  g.add(box(1.42, 0.08, 1.12, M.stoneD, hx, 0.04, hz));
  g.add(box(1.3, 0.3, 1.0, M.plaster, hx, 0.23, hz));            /* 后墙身 0.08-0.38 */
  g.add(box(1.34, 0.045, 1.04, M.timber, hx, 0.395, hz));        /* 额枋 */
  /* 四角木柱 + 前檐柱 */
  [[-0.72, -0.5], [0.48, -0.5], [-0.72, 0.42], [0.48, 0.42], [-0.14, 0.52]].forEach(function (c) {
    g.add(box(0.055, 0.52, 0.055, M.timberD, hx + c[0], 0.36, hz + c[1]));
  });
  /* 门洞（中）+ 木格窗（左） */
  g.add(box(0.3, 0.34, 0.04, M.ink, hx + 0.08, 0.25, hz + 0.505));
  var win = latticeWindow(M, 0.24, 0.22, { rows: 2, cols: 2 }); put(g, win, hx - 0.32, 0.27, hz + 0.512);
  g.add(box(0.4, 0.04, 0.16, M.stoneD, hx + 0.08, 0.12, hz + 0.6));
  /* 茅草坡顶（apex≈0.96）：陡两坡 + X 形脊杆 */
  var thatch = grp(); put(g, thatch, hx, 0.44, hz);
  var eave = 0.62 + 0.14, pitch = Math.atan2(0.52, eave), len = Math.sqrt(eave * eave + 0.52 * 0.52) + 0.02;
  var sf = grp(); sf.position.set(0, 0.52, 0); sf.rotation.x = pitch; thatch.add(sf);
  sf.add(box(1.56, 0.04, len, M.thatch, 0, 0, len / 2));
  sf.add(box(1.56, 0.02, 0.05, M.thatchD, 0, 0.012, eave));
  var sb = grp(); sb.position.set(0, 0.52, 0); sb.rotation.x = -pitch; thatch.add(sb);
  sb.add(box(1.56, 0.04, len, M.thatch, 0, 0, -len / 2));
  sb.add(box(1.56, 0.02, 0.05, M.thatchD, 0, 0.012, -eave));
  /* X 形交叉脊杆（参考图草顶特征） */
  var xp1 = cyl(0.022, 0.022, 0.36, 8, M.timberD, 0.13, 0.58, 0); xp1.rotation.z = 0.55; thatch.add(xp1);
  var xp2 = cyl(0.022, 0.022, 0.36, 8, M.timberD, -0.13, 0.58, 0); xp2.rotation.z = -0.55; thatch.add(xp2);
  /* 前廊布棚（右侧）+ 挂橙灯笼 */
  var aw = awning(M, 0.86, 0.34, anims); put(g, aw, hx + 0.36, 0.5, hz + 0.56);
  var lt = lantern(M, 0.62, anims, 0.4, true); put(g, lt, hx + 0.76, 0.56, hz + 0.6);
  /* 文房摊（左前）+ 长凳（右前） */
  var stall = stallTable(M, true); put(g, stall, hx - 0.62, 0.05, hz + 0.72);
  g.add(box(0.36, 0.03, 0.15, M.timber, hx + 0.72, 0.2, hz + 0.66));
  g.add(box(0.04, 0.13, 0.13, M.timberD, hx + 0.58, 0.14, hz + 0.66));
  g.add(box(0.04, 0.13, 0.13, M.timberD, hx + 0.86, 0.14, hz + 0.66));
  /* 旗杆 + 米白布幌（左） */
  g.add(cyl(0.016, 0.022, 0.98, 8, M.timberD, -1.02, 0.54, 0.62));
  g.add(box(0.03, 0.03, 0.3, M.timberD, -1.02, 0.96, 0.5));
  var fl = banner(M, 0.16, 0.5, anims, 1.3); put(g, fl, -1.02, 0.96, 0.4);
  fl.rotation.y = PI / 2;
  /* 短篱笆（左前 + 右前） */
  [[-0.9, 0.95, 0.4], [0.55, 0.98, 0.5]].forEach(function (f, fi) {
    var n = fi ? 3 : 4, i;
    for (i = 0; i < n; i++) g.add(box(0.032, 0.2, 0.032, M.timber, f[0] + i * 0.16, 0.16, f[1]));
    g.add(box(n * 0.16, 0.024, 0.028, M.timberD, f[0] + (n - 1) * 0.08, 0.22, f[1]));
  });
  /* 水罐（右后） */
  var jar = sph(0.075, M.stoneD, 0.92, 0.13, -0.5); jar.scale.y = 0.9; g.add(jar);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.3 + 0.1 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：正屋青瓦殿 + 鎏金鸱吻 + 朱柱铺面 + 披屋耳房（h≈1.50） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.25, true));
  var mx = -0.38, mz = -0.1;
  /* 正屋：石基 + 抹灰墙身 + 楣枋 */
  g.add(box(1.56, 0.11, 1.06, M.stoneD, mx, 0.0525, mz));
  g.add(box(1.44, 0.655, 0.94, M.plaster, mx, 0.4325, mz));       /* 0.105-0.76 */
  g.add(box(1.5, 0.05, 1.0, M.timber, mx, 0.785, mz));
  /* 铺面门脸：朱门洞 + 双朱柱 */
  g.add(box(0.62, 0.5, 0.05, M.ink, mx - 0.18, 0.355, mz + 0.475));
  g.add(box(0.5, 0.4, 0.045, M.lacq, mx - 0.18, 0.305, mz + 0.49));
  var cL = redColumn(M, 0.66, 0.032); put(g, cL, mx - 0.56, 0.105, mz + 0.44);
  var cR = redColumn(M, 0.66, 0.032); put(g, cR, mx + 0.2, 0.105, mz + 0.44);
  /* 木格窗（右间）+ 石阶 */
  var win = latticeWindow(M, 0.3, 0.32, { rows: 2, cols: 3 }); put(g, win, mx + 0.44, 0.44, mz + 0.485);
  g.add(box(0.56, 0.05, 0.2, M.stoneD, mx - 0.18, 0.13, mz + 0.6));
  /* 山墙面（前后三角抹灰 + 金圆匾） */
  var gsf = new THREE.Shape();
  gsf.moveTo(-0.66, 0); gsf.lineTo(0.66, 0); gsf.lineTo(0, 0.5); gsf.closePath();
  var gf = mesh(new THREE.ExtrudeGeometry(gsf, { depth: 0.045, bevelEnabled: false }), M.plaster);
  gf.position.set(mx, 0.81, mz + 0.475); g.add(gf);
  g.add(cyl(0.06, 0.06, 0.02, 12, M.gold, mx, 0.98, mz + 0.51));
  /* 主瓦顶（apex≈1.31 + 木脊 + 双鎏金鸱吻 → 总高≈1.5） */
  var roof = tileRoof(M, { w: 1.5, d: 1.14, h: 0.5, strips: 4, big: true, goldTips: true, gable: false });
  put(g, roof, mx, 0.81, mz);
  /* 披屋耳房（右）：抹灰 + 小瓦顶 + 小鸱吻 */
  var wx = 0.72, wz = -0.05;
  g.add(box(0.72, 0.08, 0.96, M.stoneD, wx, 0.04, wz));
  g.add(box(0.66, 0.58, 0.9, M.plaster, wx, 0.41, wz));           /* 0.12-0.70 */
  var wwin = latticeWindow(M, 0.2, 0.22, { rows: 2, cols: 2 }); put(g, wwin, wx, 0.44, wz + 0.46);
  var wroof = tileRoof(M, { w: 0.62, d: 0.96, h: 0.18, strips: 2, ridgeW: 0.7 });
  put(g, wroof, wx, 0.7, wz);                                     /* apex≈0.88 */
  /* 铺面布棚 + 红灯笼 */
  var aw = awning(M, 1.16, 0.36, anims); put(g, aw, mx - 0.14, 0.66, mz + 0.52);
  var l1 = lantern(M, 0.66, anims, 0.9); put(g, l1, mx - 0.72, 0.6, mz + 0.52);
  /* 布幌杆（右前）+ 橙灯笼杆 */
  g.add(cyl(0.015, 0.02, 1.02, 8, M.timberD, 0.98, 0.56, 0.62));
  g.add(box(0.03, 0.03, 0.34, M.timberD, 0.98, 1.01, 0.5));
  var bn = banner(M, 0.17, 0.56, anims, 2.0); put(g, bn, 0.98, 1.01, 0.38);
  bn.rotation.y = PI / 2;
  var lp = lantern(M, 0.58, anims, 1.6, true); put(g, lp, 0.74, 0.88, 0.62);
  /* 文房摊（左前）+ 绿树（右后） */
  var stall = stallTable(M, true); put(g, stall, -0.98, 0.03, 0.62);
  var tree = greenTree(M, 1.0); put(g, tree, 0.95, 0.05, -0.68);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.3 + 0.1 * sin(t * 1.15 + 0.5); });
  return g;
}

/* ---- lv3 大厦：腰檐起台两层 + 二层木栏杆回廊 + 圆鎏金匾 + 大屋顶金饰戗脊（h≈2.0） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35, true));
  var fx = -0.34, fz = 0;
  /* 一层：石基 + 墙身 + 铺面（朱柱列 + 门洞 + 木格窗） */
  g.add(box(1.6, 0.1, 1.06, M.stoneD, fx, 0.05, fz));
  g.add(box(1.48, 0.62, 0.94, M.plaster, fx, 0.41, fz));          /* 0.10-0.72 */
  g.add(box(1.54, 0.05, 1.0, M.timber, fx, 0.745, fz));
  g.add(box(0.56, 0.46, 0.05, M.ink, fx - 0.3, 0.33, fz + 0.475));
  g.add(box(0.44, 0.36, 0.045, M.lacq, fx - 0.3, 0.28, fz + 0.49));
  var cL = redColumn(M, 0.6, 0.03); put(g, cL, fx - 0.62, 0.1, fz + 0.44);
  var cR = redColumn(M, 0.6, 0.03); put(g, cR, fx + 0.04, 0.1, fz + 0.44);
  var cM = redColumn(M, 0.6, 0.03); put(g, cM, fx + 0.62, 0.1, fz + 0.44);
  var win1 = latticeWindow(M, 0.28, 0.3, { rows: 2, cols: 3 }); put(g, win1, fx + 0.32, 0.4, fz + 0.485);
  /* 铺面前：布棚 + 书卷摊 + 石阶 */
  var aw = awning(M, 1.2, 0.38, anims); put(g, aw, fx - 0.12, 0.64, fz + 0.54);
  var stall = stallTable(M, true); put(g, stall, -1.06, 0.03, fz + 0.7);
  g.add(box(0.5, 0.05, 0.2, M.stoneD, fx - 0.3, 0.125, fz + 0.6));
  /* 腰檐（y≈0.8）：四面小瓦坡 */
  var waist = waistEave(M, { w: 1.34, d: 0.84, h: 0.12 });
  put(g, waist, fx, 0.78, fz);
  /* 二层（退台 0.84-1.40）：抹灰墙 + 前廊朱柱 + 木栏杆 + 木格窗 + 圆鎏金匾 */
  g.add(box(1.3, 0.56, 0.8, M.plaster, fx, 1.12, fz - 0.03));     /* 0.84-1.40 */
  var c2L = redColumn(M, 0.5, 0.028); put(g, c2L, fx - 0.5, 0.9, fz + 0.33);
  var c2R = redColumn(M, 0.5, 0.028); put(g, c2R, fx + 0.5, 0.9, fz + 0.33);
  var balc = balconyUnit(M, 1.14); put(g, balc, fx, 0.9, fz + 0.36);
  var w21 = latticeWindow(M, 0.22, 0.28, { rows: 2, cols: 2 }); put(g, w21, fx - 0.26, 1.14, fz + 0.39);
  var w22 = latticeWindow(M, 0.22, 0.28, { rows: 2, cols: 2 }); put(g, w22, fx + 0.26, 1.14, fz + 0.39);
  g.add(cyl(0.085, 0.085, 0.024, 14, M.gold, fx, 1.2, fz + 0.41));
  g.add(cyl(0.05, 0.05, 0.03, 12, M.lacqDk, fx, 1.2, fz + 0.415));
  /* 二层灯笼 ×2 + 檐下幡 ×2 */
  var l1 = lantern(M, 0.56, anims, 1.1); put(g, l1, fx - 0.6, 1.04, fz + 0.42);
  var l2 = lantern(M, 0.56, anims, 2.4); put(g, l2, fx + 0.6, 1.04, fz + 0.42);
  var b1 = banner(M, 0.15, 0.4, anims, 0.7); put(g, b1, fx - 0.4, 0.88, fz + 0.4);
  var b2 = banner(M, 0.15, 0.4, anims, 2.9); put(g, b2, fx + 0.4, 0.88, fz + 0.4);
  /* 大屋顶（歇山）：1.40 起，金戗脊 + 中央金珠（总高≈2.0） */
  var roof = sweepRoof(M, { w: 1.16, d: 1.0, h: 0.44, goldHips: true, centerOrb: true });
  put(g, roof, fx, 1.4, fz - 0.03);                               /* 脊顶 ≈1.84 + 金珠 ≈1.94 */
  /* 橙灯笼杆（右前）+ 绿树（右后）+ 盆栽 */
  g.add(cyl(0.015, 0.02, 1.14, 8, M.timberD, 1.02, 0.62, 0.66));
  var lp = lantern(M, 0.56, anims, 3.3, true); put(g, lp, 1.02, 1.14, 0.66);
  var tree = greenTree(M, 1.1); put(g, tree, 0.92, 0.05, -0.72);
  g.add(cyl(0.055, 0.068, 0.09, 10, M.stoneD, -1.1, 0.095, -0.62));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, bush, -1.1, 0.19, -0.62);
  bush.scale.y = 0.85;
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.3 + 0.1 * sin(t * 1.15 + 0.8); });
  return g;
}

/* ---- lv4 地标：石台基红毯踏步 + 鎏金石狮 + 三重檐楼阁 + 杏花（h≈2.75） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.5, true));
  /* 石台基 + 垂带踏步 + 红毯 */
  g.add(box(2.1, 0.16, 1.66, M.stone, 0, 0.08, -0.06));
  g.add(box(2.18, 0.05, 1.72, M.stoneD, 0, 0.025, -0.06));
  /* 三级踏步（前） */
  g.add(box(0.94, 0.055, 0.2, M.stoneD, 0, 0.185, 0.88));
  g.add(box(0.94, 0.055, 0.2, M.stoneD, 0, 0.24, 0.76));
  g.add(box(0.94, 0.055, 0.2, M.stoneD, 0, 0.295, 0.64));
  /* 红毯（踏步中央 + 台面引道） */
  g.add(box(0.4, 0.012, 0.6, M.carpet, 0, 0.33, 0.76));
  g.add(box(0.44, 0.014, 0.34, M.carpetD, 0, 0.243, 0.76));
  g.add(box(0.44, 0.014, 0.34, M.carpetD, 0, 0.188, 0.88));
  /* 踏步侧朱红栏杆 ×2 */
  [[-0.52], [0.52]].forEach(function (s) {
    var sx = s[0];
    g.add(box(0.05, 0.36, 0.05, M.lacq, sx, 0.42, 0.86));
    g.add(box(0.05, 0.3, 0.05, M.lacq, sx, 0.4, 0.6));
    g.add(box(0.035, 0.3, 0.56, M.lacq, sx, 0.56, 0.72));
  });
  /* 鎏金石狮 ×2（踏步两侧）+ 杏花 ×2 */
  put(g, goldLion(M, 1.2), -0.85, 0.16, 0.82);
  put(g, goldLion(M, 1.2), 0.85, 0.16, 0.82);
  put(g, blossomTree(M, 1.15), -1.08, 0.05, 0.42);
  put(g, blossomTree(M, 0.95), 1.1, 0.05, 0.38);
  /* 一层（0.16 起）：回廊朱柱 ×6 + 填充墙 + 金门 + 圆匾 + 「书院门」匾 + 横幡 ×3 */
  g.add(box(1.56, 0.9, 1.1, M.plaster, 0, 0.61, -0.12));          /* 0.16-1.06 */
  [[-0.64, 0.4], [-0.32, 0.44], [0.32, 0.44], [0.64, 0.4], [-0.64, -0.5], [0.64, -0.5]].forEach(function (c) {
    var col = redColumn(M, 0.8, 0.032); put(g, col, c[0], 0.16, c[1]);
  });
  /* 金门（中）+ 门钉 + 上方金匾 */
  g.add(box(0.4, 0.62, 0.05, M.ink, 0, 0.47, 0.45));
  g.add(box(0.34, 0.56, 0.05, M.gold, 0, 0.47, 0.47));
  g.add(box(0.22, 0.3, 0.052, M.goldHi, 0, 0.55, 0.475));
  [-0.08, 0.08].forEach(function (x) {
    g.add(sph(0.02, M.goldHi, x, 0.42, 0.5));
    g.add(sph(0.02, M.goldHi, x, 0.52, 0.5));
  });
  var plq = mesh(new THREE.PlaneGeometry(0.5, 0.125),
    new THREE.MeshStandardMaterial({ map: getTex('plaqueH', texPlaqueH), roughness: 0.5, metalness: 0.35, flatShading: true }));
  plq.position.set(0, 0.9, 0.482); g.add(plq);                    /* 「书院门」 */
  g.add(box(0.56, 0.035, 0.05, M.lacqDk, 0, 0.975, 0.47));
  /* 侧向木格窗 ×2（暖光） */
  var w1 = latticeWindow(M, 0.24, 0.3, { rows: 2, cols: 2 }); put(g, w1, -0.5, 0.56, 0.44);
  var w2 = latticeWindow(M, 0.24, 0.3, { rows: 2, cols: 2 }); put(g, w2, 0.5, 0.56, 0.44);
  /* 一层横幡 ×3（柱间） */
  var fb1 = banner(M, 0.16, 0.44, anims, 0.5); put(g, fb1, -0.48, 1.0, 0.46);
  var fb2 = banner(M, 0.16, 0.44, anims, 1.8); put(g, fb2, 0, 1.0, 0.5);
  var fb3 = banner(M, 0.16, 0.44, anims, 3.0); put(g, fb3, 0.48, 1.0, 0.46);
  /* 一层腰檐（y≈1.1） */
  var wa1 = waistEave(M, { w: 1.36, d: 0.96, h: 0.12 });
  put(g, wa1, 0, 1.06, -0.12);
  /* 二层（1.18 起）：朱柱廊 + 栏杆 + 米白墙 + 金圆匾 + 灯笼 ×2 */
  g.add(box(1.22, 0.44, 0.76, M.plaster, 0, 1.4, -0.14));         /* 1.18-1.62 */
  var c2L = redColumn(M, 0.4, 0.026); put(g, c2L, -0.5, 1.18, 0.26);
  var c2R = redColumn(M, 0.4, 0.026); put(g, c2R, 0.5, 1.18, 0.26);
  var balc2 = balconyUnit(M, 1.14); put(g, balc2, 0, 1.18, 0.3);
  g.add(cyl(0.075, 0.075, 0.022, 14, M.gold, 0, 1.48, 0.38));
  var l3a = lantern(M, 0.5, anims, 1.4); put(g, l3a, -0.56, 1.34, 0.34);
  var l3b = lantern(M, 0.5, anims, 2.7); put(g, l3b, 0.56, 1.34, 0.34);
  /* 二层腰檐（y≈1.66） */
  var wa2 = waistEave(M, { w: 1.18, d: 0.84, h: 0.11 });
  put(g, wa2, 0, 1.62, -0.14);
  /* 三层（1.73 起）：小红栏平座 + 米白墙 + 金圆匾 + 灯笼 ×2 */
  g.add(box(1.0, 0.36, 0.64, M.lacq, 0, 1.93, -0.14));            /* 1.75-2.11 */
  var balc3 = balconyUnit(M, 0.94, M.lacqDk); put(g, balc3, 0, 1.75, 0.2);
  g.add(cyl(0.065, 0.065, 0.02, 14, M.gold, 0, 2.0, 0.32));
  var l4a = lantern(M, 0.46, anims, 0.6); put(g, l4a, -0.46, 1.86, 0.26);
  var l4b = lantern(M, 0.46, anims, 2.0); put(g, l4b, 0.46, 1.86, 0.26);
  /* 顶层歇山（2.11 起）：金戗脊 + 鸱吻 + 鎏金宝顶（脊顶 ≈2.55） */
  var top = sweepRoof(M, { w: 0.98, d: 0.82, h: 0.32, goldHips: true, finial: true });
  put(g, top, 0, 2.11, -0.14);                                    /* 宝顶尖 ≈2.56 */
  /* 台基四角盆栽 + 橙灯笼杆 ×2 */
  [[-0.96, -0.72], [0.96, -0.72]].forEach(function (p) {
    g.add(cyl(0.055, 0.068, 0.09, 10, M.stoneD, p[0], 0.295, p[1]));
    var b = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, b, p[0], 0.395, p[1]);
    b.scale.y = 0.85;
  });
  var pl1 = lantern(M, 0.52, anims, 3.6, true); put(g, pl1, -1.16, 1.02, 0.72);
  g.add(cyl(0.014, 0.019, 1.06, 8, M.timberD, -1.16, 0.56, 0.72));
  var pl2 = lantern(M, 0.52, anims, 4.4, true); put(g, pl2, 1.16, 1.0, 0.7);
  g.add(cyl(0.014, 0.019, 1.04, 8, M.timberD, 1.16, 0.55, 0.7));
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.3 + 0.1 * sin(t * 1.05 + 1.2); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[28] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_28_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 28;
  g.userData.level = lv;
  g.userData.region = 'g6';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
