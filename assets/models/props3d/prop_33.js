/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_33.js
 * -------------------------------------------------------------------------------------
 * 格 33「铜锣湾」(g7 东方之珠) 独属建筑：港式高密度垂直商楼四阶生长史
 * 参考图 refs/prop_33.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop33/，
 * validate_sculpt_spec R2 PASS，纹理 256px 契约偏差已记录）。
 *
 * 风格族谱（同一块地的同一种生长——铜锣湾唐楼基因）：
 *   lv1 小屋   锈铁皮双坡棚屋 + 鱼骨天线 + 暖窗 + 石板径木凳（h≈1.18）
 *   lv2 洋房   两层木构唐楼 storefront：绿瓦楞坡顶 + 琥珀扇贝披棚×2 + 竖招霓虹三连
 *              + 檐廊 + 空调外机 + 红灯笼对 + 果蔬档（h≈1.66）
 *   lv3 大厦   五层混凝土 walk-up：密集暖光窗格 + 绿帆布雨棚排 + 空调外机排 + 女儿墙
 *              + 支腿钢水箱 + 屋顶铁皮棚 + 竖招霓虹四连柱（h≈2.28）
 *   lv4 地标   四重绿釉瓦金脊塔式商楼：红漆木廊层 + 檐下灯笼排 + 左右竖招阵列
 *              + 粉紫横霓虹「銅鑼灣」+ 石狮金匾石阶（h≈2.91）
 *
 * 独有语汇（自参考图提炼，四阶贯穿）：竖排霓虹招牌阵列（逐级加密）、绿色系屋顶
 * （铁皮锈→瓦楞绿→混凝土平顶绿棚→绿釉瓦金脊）、扇贝边布艺披棚、空调外机、
 * 红灯笼、鱼骨天线/水箱屋顶线、石板地坪+草缘+盆栽。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[33] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_33] THREE 未定义，请先加载 three.min.js (r147)');
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
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 12, 10), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rx, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz;
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

/* 锈棕瓦楞铁皮：横向垄线明暗 + 竖向错缝 + 锈斑（lv1 屋面） */
function texCorrugRust() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#8a6a48'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#947452' : '#7e5f40';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#5c4430'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#a4866a'; g.fillRect(0, y + 1, S, 2);
  }
  for (i = 0; i < 5; i++) {                                          /* 竖向锈痕 */
    var x = (i * 53 + 17) % S;
    g.fillStyle = 'rgba(96,52,28,0.35)';
    g.fillRect(x, (i * 29) % 40, 3, 40 + (i * 17) % 60);
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(150,90,50,0.10)' : 'rgba(40,26,16,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  for (k = 0; k < 4; k++) {
    g.fillStyle = 'rgba(60,44,30,0.4)'; g.fillRect(((k * 41) + 9) % S, 0, 2, S);
  }
  return toTex(cv, true);
}
/* 风化竖板木墙（lv1/lv2 墙体） */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#4a352a'; g.fillRect(0, 0, S, S);
  var n = 8, pw = S / n;
  for (i = 0; i < n; i++) {
    g.fillStyle = (i % 2) ? '#54402c' : '#42301f';
    g.fillRect(i * pw, 0, pw - 2, S);
    g.fillStyle = '#2c1f16'; g.fillRect(i * pw + pw - 2, 0, 2, S);
    g.fillStyle = 'rgba(120,90,60,0.25)';
    g.fillRect(i * pw + 2, (i * 31) % S, 2, S);
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = (i % 3) ? 'rgba(0,0,0,0.10)' : 'rgba(200,170,130,0.06)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 3);
  }
  return toTex(cv, true);
}
/* 绿灰瓦楞坡顶（lv2 屋面） */
function texGreenCorrug() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#7d8f6c'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#879a74' : '#71835f';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#556747'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#9db188'; g.fillRect(0, y + 1, S, 2);
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(30,44,24,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 混凝土墙：灰调斑驳 + 竖向污痕（lv3 楼身） */
function texConcrete() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#8a8d86'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 7; i++) {                                          /* 竖向水渍 */
    var x = (i * 19 + 7) % S;
    g.fillStyle = 'rgba(70,76,72,0.22)';
    g.fillRect(x, (i * 23) % 30, 2 + (i % 3), 50 + (i * 13) % 70);
  }
  for (i = 0; i < 170; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(52,58,54,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 琥珀条纹披棚布（lv2 扇贝棚面） */
function texAwningAmber() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#e0a048'; g.fillRect(0, 0, S, S);
  var n = 6, sw = S / n;
  for (i = 0; i < n; i++) {
    if (i % 2) { g.fillStyle = '#c88438'; g.fillRect(i * sw, 0, sw, S); }
  }
  for (i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(255,240,200,0.08)';
    g.fillRect((i * 29) % S, (i * 41) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 绿帆布雨棚布（lv3/lv4 棚面，白细条纹） */
function texCanvasGreen() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#4f7a55'; g.fillRect(0, 0, S, S);
  var n = 6, sw = S / n;
  for (i = 0; i < n; i++) {
    if (i % 2) { g.fillStyle = '#43684a'; g.fillRect(i * sw, 0, sw, S); }
    g.fillStyle = 'rgba(235,245,230,0.5)'; g.fillRect(i * sw, 0, 3, S);
  }
  for (i = 0; i < 50; i++) {
    g.fillStyle = 'rgba(20,40,24,0.10)';
    g.fillRect((i * 31) % S, (i * 47) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 竖排霓虹字牌：彩底 + 描边 + 黄/白竖排字（缓存键含文字） */
function texNeonV(text, bg, fg, frame) {
  var w = 96, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = frame; g.fillRect(0, 0, w, h);
  g.fillStyle = bg; g.fillRect(8, 8, w - 16, h - 16);
  g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(13, 13, w - 26, h - 26);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 52px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var n = text.length, step = (h - 60) / n, i;
  for (i = 0; i < n; i++) g.fillText(text[i], w / 2, 34 + step * (i + 0.5));
  /* 霓虹灯珠点 */
  g.fillStyle = 'rgba(255,255,255,0.85)';
  for (i = 0; i < 6; i++) { g.beginPath(); g.arc(16, 24 + i * 42, 3, 0, PI * 2); g.fill(); g.beginPath(); g.arc(w - 16, 24 + i * 42, 3, 0, PI * 2); g.fill(); }
  return toTex(cv, true);
}
/* 横式霓虹匾：彩底 + 字（lv4 横招 / 店招 / 金匾共用工厂） */
function texBoardH(text, bg, fg, frame, glow) {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = frame; g.fillRect(0, 0, w, h);
  g.fillStyle = bg; g.fillRect(6, 6, w - 12, h - 12);
  g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(10, 10, w - 20, h - 20);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText(text, w / 2, h / 2 + 2);
  if (glow) {
    g.fillStyle = 'rgba(255,255,255,0.5)';
    for (var i = 0; i < 8; i++) { g.beginPath(); g.arc(14 + i * 32, 8, 2.5, 0, PI * 2); g.fill(); g.beginPath(); g.arc(14 + i * 32, h - 8, 2.5, 0, PI * 2); g.fill(); }
  }
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图分区取样） */
function Mats() {
  return {
    corrug:    MAT('p33corrug', function () { var t = getTex('corrug', texCorrugRust); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.8 }); }),
    plank:     MAT('p33plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.86 }); }),
    greenCorr: MAT('p33greenCorr', function () { var t = getTex('greenCorr', texGreenCorrug); return std('#ffffff', { map: t, bump: t, bumpScale: 0.013, rough: 0.7 }); }),
    concSun:   MAT('p33concSun', function () { var t = getTex('conc', texConcrete); return std('#ffffff', { map: t, rough: 0.9 }); }),
    concShade: MAT('p33concShd', function () { var t = getTex('conc', texConcrete); return std('#b9bdb6', { map: t, rough: 0.92 }); }),
    woodD:     MAT('p33woodD', function () { return std('#3c2c20', { rough: 0.82 }); }),
    wood:      MAT('p33wood', function () { return std('#54402c', { rough: 0.8 }); }),
    awnAmber:  MAT('p33awnAmber', function () { var t = getTex('awnA', texAwningAmber); return std('#ffffff', { map: t, rough: 0.72 }); }),
    awnGreen:  MAT('p33awnGreen', function () { var t = getTex('awnG', texCanvasGreen); return std('#ffffff', { map: t, rough: 0.75 }); }),
    glazeSun:  MAT('p33glazeSun', function () { return std('#2c6a48', { rough: 0.45, metal: 0.05 }); }),
    glazeShd:  MAT('p33glazeShd', function () { return std('#1c4e37', { rough: 0.5, metal: 0.05 }); }),
    gold:      MAT('p33gold', function () { return std('#d8a850', { rough: 0.35, metal: 0.75 }); }),
    lacq:      MAT('p33lacq', function () { return std('#6a2c20', { rough: 0.5 }); }),
    lacqBr:    MAT('p33lacqBr', function () { return std('#7e3a28', { rough: 0.45 }); }),
    steel:     MAT('p33steel', function () { return std('#7a95a0', { rough: 0.55, metal: 0.3 }); }),
    acGrey:    MAT('p33ac', function () { return std('#a8a8a0', { rough: 0.6 }); }),
    ink:       MAT('p33ink', function () { return std('#24201c', { rough: 0.8 }); }),
    stone:     MAT('p33stone', function () { return std('#b0a893', { rough: 0.92 }); }),
    stoneD:    MAT('p33stoneD', function () { return std('#988f7a', { rough: 0.93 }); }),
    grass:     MAT('p33grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p33grassD', function () { return std('#699048', { rough: 0.95 }); }),
    pave:      MAT('p33pave', function () { return std('#b8b09a', { rough: 0.94 }); }),
    warm:      MAT('p33warm', function () { return std('#ffd98a', { rough: 0.6, emissive: '#ffcf7a', ei: 0.42 }); }),
    crate:     MAT('p33crate', function () { return std('#8a6a45', { rough: 0.85 }); })
  };
}

/* ================= 2. 预制件（铜锣湾独有语汇） ================= */

/* 暖光窗：深木框 + 内透光板（2 mesh，光板共享 warm 材质随级呼吸） */
function warmWindow(M, w, h) {
  var g = grp();
  g.add(box(w, h, 0.03, M.woodD));
  g.add(box(w - 0.05, h - 0.05, 0.034, M.warm, 0, 0, 0.006));
  g.add(box(0.024, h - 0.05, 0.04, M.woodD, 0, 0, 0.008));
  g.add(box(w - 0.05, 0.024, 0.04, M.woodD, 0, 0, 0.008));
  return g;
}

/* 竖排霓虹字牌：铁框盒 + 双面发光字板（自建材质以支持独立相位脉冲） */
function neonSign(M, text, bg, fg, w, h, anims, phase) {
  var g = grp();
  g.add(box(w + 0.04, h + 0.04, 0.055, M.ink));
  var tex = getTex('nv' + text + bg, function () { return texNeonV(text, bg, fg, '#24201c'); });
  var mat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: tex, emissive: C('#ffffff'), emissiveMap: tex,
    emissiveIntensity: 0.72, roughness: 0.45, flatShading: true
  });
  var p1 = mesh(new THREE.PlaneGeometry(w, h), mat); p1.position.z = 0.03; g.add(p1);
  var p2 = mesh(new THREE.PlaneGeometry(w, h), mat); p2.position.z = -0.03; p2.rotation.y = PI; g.add(p2);
  anims.push(function (t) { mat.emissiveIntensity = 0.62 + 0.22 * sin(t * 1.7 + (phase || 0)); });
  return g;
}

/* 横式发光匾：框 + 发光字板 */
function boardSign(M, text, bg, fg, frame, w, h, glow, ei) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.045, frame));
  var tex = getTex('bh' + text + bg, function () { return texBoardH(text, bg, fg, '#1c1814', glow); });
  var mat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: tex, emissive: C('#ffffff'), emissiveMap: tex,
    emissiveIntensity: (ei !== undefined ? ei : 0.5), roughness: 0.5, flatShading: true
  });
  var p = mesh(new THREE.PlaneGeometry(w, h), mat); p.position.z = 0.026; g.add(p);
  g.userData.mat = mat;
  return g;
}

/* 扇贝边披棚：斜棚板 + 布纹 + 半圆垂弧排（铜锣湾布艺签名件） */
function scallopAwning(M, w, proj, mat, nScallop, yTilt) {
  var g = grp();
  var board = box(w, 0.028, proj, mat);
  board.rotation.x = (yTilt !== undefined ? yTilt : 0.5);
  /* 斜置后前端略低：以组内 pivot 调整 */
  board.position.z = proj * 0.42;
  g.add(board);
  var r = w / (nScallop * 2), i;
  var scGeo = new THREE.CylinderGeometry(r, r, 0.03, 10, 1, false, 0, PI);
  for (i = 0; i < nScallop; i++) {
    var sc = mesh(scGeo, mat);
    sc.rotation.x = PI / 2;
    sc.rotation.z = PI;
    sc.position.set(-w / 2 + r + i * 2 * r, -proj * sin(yTilt || 0.5) * 0.5 - r * 0.4, proj * 0.84);
    g.add(sc);
  }
  return g;
}

/* 空调外机：灰壳 + 格栅面 + 支架（2 mesh 壳+格） */
function acUnit(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.2 * s, 0.14 * s, 0.13 * s, M.acGrey));
  g.add(box(0.16 * s, 0.09 * s, 0.012, M.ink, 0, 0, 0.068 * s));
  return g;
}

/* 鱼骨天线：立杆 + 三层横担（自顶向下排布） + 端头（屋顶生长线，总高≈h+0.105） */
function antennaHK(M, h, anims, phase) {
  var g = grp();
  g.add(cyl(0.011, 0.014, h, 6, M.woodD, 0, h / 2, 0));
  var top = grp(); top.position.set(0, h, 0); g.add(top);
  var i;
  var arms = [[-0.09, 0.34], [-0.03, 0.28], [0.03, 0.22]];
  for (i = 0; i < 3; i++) {
    var y = arms[i][0], wArm = arms[i][1];
    top.add(box(wArm, 0.014, 0.014, M.woodD, 0, y, 0));
    top.add(box(0.014, 0.014, 0.05, M.woodD, -wArm / 2 + 0.02, y, 0));
    top.add(box(0.014, 0.014, 0.05, M.woodD, wArm / 2 - 0.02, y, 0));
  }
  top.add(cyl(0.006, 0.006, 0.06, 5, M.steel, 0, 0.075, 0));
  anims.push(function (t) { top.rotation.z = sin(t * 1.05 + (phase || 0)) * 0.028; });
  return g;
}

/* 红灯笼：金盖 + 红壳 + 穗（材质按相位桶共享，3 mesh） */
function lanternHK(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var pk = String(Math.round((phase || 0) * 10) % 10);
  var bm = MAT('p33lant' + pk, function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.032 * s, 0.045 * s, 0.03 * s, 10, M.gold, 0, 0.1 * s, 0));
  var body = sph(0.078 * s, bm, 0, 0, 0); body.scale.y = 0.86; g.add(body);
  g.add(cyl(0.007 * s, 0.007 * s, 0.07 * s, 5, M.lacq, 0, -0.115 * s, 0));
  return g;
}
/* 灯笼材质呼吸（每级推一条：遍历已建灯笼相位桶，错相呼吸） */
function lanternBreathe(anims, phase) {
  var keys = Object.keys(_mc), i;
  for (i = 0; i < keys.length; i++) {
    if (keys[i].indexOf('p33lant') === 0) {
      (function (bm, k) {
        anims.push(function (t) { bm.emissiveIntensity = 0.5 + 0.18 * sin(t * 2.1 + k * 1.1 + phase); });
      })(_mc[keys[i]], i);
    }
  }
}

/* 支腿钢水箱：四腿 + 箱体 + 锥顶 + 字带（lv3 天际线签名件，总高≈0.42） */
function waterTank(M) {
  var g = grp(), i;
  for (i = 0; i < 4; i++) {
    var lx = (i % 2) ? 0.12 : -0.12, lz = (i < 2) ? 0.1 : -0.1;
    g.add(box(0.026, 0.12, 0.026, M.steel, lx, 0.06, lz));
  }
  g.add(box(0.34, 0.22, 0.3, M.steel, 0, 0.23, 0));
  var cap = mesh(new THREE.ConeGeometry(0.25, 0.08, 4), M.corrug); cap.rotation.y = PI / 4; cap.position.set(0, 0.38, 0); g.add(cap);
  var band = boardSign(M, '水源', '#7a95a0', '#22303a', '#4a5c66', 0.28, 0.08, false, 0.12);
  band.position.set(0, 0.23, 0.153); g.add(band);
  return g;
}

/* 石狮：础座 + 身 + 头 + 耳 + 卷毛球（lv4 门前） */
function stoneLionHK(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.1 * s, 0.035 * s, 0.1 * s, M.stoneD, 0, 0.018 * s, 0));
  var body = sph(0.048 * s, M.stone, 0, 0.07 * s, 0); body.scale.set(0.9, 0.85, 1.25); g.add(body);
  g.add(sph(0.036 * s, M.stone, 0, 0.125 * s, 0.042 * s));
  var mane = sph(0.02 * s, M.stoneD, 0, 0.15 * s, 0.02 * s); g.add(mane);
  var e1 = mesh(new THREE.ConeGeometry(0.012 * s, 0.026 * s, 6), M.stone); put(g, e1, 0.02 * s, 0.158 * s, 0.04 * s, 0, 0, -0.3);
  var e2 = mesh(new THREE.ConeGeometry(0.012 * s, 0.026 * s, 6), M.stone); put(g, e2, -0.02 * s, 0.158 * s, 0.04 * s, 0, 0, 0.3);
  g.add(box(0.03 * s, 0.035 * s, 0.05 * s, M.stoneD, 0, 0.03 * s, 0.06 * s));
  return g;
}

/* 港式双坡屋顶：铁皮/瓦楞绿两用（垄面顺坡 + 悬山封板 + 挑檐 + 脊带） */
function gableRoof(M, o) {
  var w = o.w, d = o.d, h = o.h, matS = o.mat, over = o.over !== undefined ? o.over : 0.09;
  var g = grp(), k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, matS, 0, 0, k * slopeLen / 2));
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.026, M.ink, 0, -0.006, k * eave));
  }
  if (o.gable !== false) {
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plank); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plank); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  }
  g.add(box(w + over * 2 + 0.04, 0.05, 0.08, o.ridgeMat || M.ink, 0, h + 0.025, 0));
  return g;
}

/* 绿釉瓦四坡顶（lv4 塔冠）：四向坡面 + 金脊 + 翘角金吻 + 宝顶（塔层生长件） */
function hipRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.06, eaveS = w / 2 + 0.06;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.62 + 0.1, 0.03, lenF, M.glazeSun, 0, 0, lenF / 2));
  sgF.add(box(w * 0.62 + 0.12, 0.045, 0.024, M.gold, 0, -0.005, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.62 + 0.1, 0.03, lenF, M.glazeShd, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.03, d * 0.66, M.glazeShd, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.03, d * 0.66, M.glazeShd, -lenS / 2, 0, 0));
  /* 金正脊 + 端吻 */
  g.add(box(w * 0.52, 0.05, 0.07, M.gold, 0, h + 0.025, 0));
  var f1 = box(0.05, 0.09, 0.06, M.gold, w * 0.26, h + 0.07, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.05, 0.09, 0.06, M.gold, -w * 0.26, h + 0.07, 0); f2.rotation.z = -0.4; g.add(f2);
  /* 四角翘角金吻 */
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var horn = box(0.055, 0.05, 0.055, M.gold, c[0] * (eaveS - 0.015), 0.042, c[1] * (eaveF - 0.015));
    horn.rotation.z = -c[0] * 0.55; g.add(horn);
  });
  if (o.finial) {
    g.add(cyl(0.02, 0.028, 0.05, 10, M.gold, 0, h + 0.07, 0));
    g.add(sph(0.034, M.gold, 0, h + 0.11, 0));
  }
  return g;
}

/* 石板地坪 + 草缘 + 石板径 + 灌丛（参考图基座语汇，四级统一） */
function padHK(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size + 0.06, 0.032, d + 0.06, M.grassD, 0, 0.016, 0));
  g.add(box(size, 0.05, d, M.pave, 0, 0.03, 0));
  g.add(box(size - 0.5, 0.052, d - 0.5, M.stone, 0, 0.031, 0.02));
  g.add(box(0.44, 0.014, 0.6, M.stoneD, 0, 0.058, d / 2 - 0.34));
  var r1 = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, r1, size / 2 - 0.24, 0.07, d / 2 - 0.26);
  var b1 = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.grassD); put(g, b1, -size / 2 + 0.24, 0.115, d / 2 - 0.28); b1.scale.y = 0.78;
  var b2 = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, b2, size / 2 - 0.2, 0.1, -d / 2 + 0.3); b2.scale.y = 0.8;
  return g;
}

/* 木条箱果蔬档（lv2 GFR 签名件） */
function crateStall(M) {
  var g = grp();
  var c1 = box(0.34, 0.14, 0.2, M.crate, 0, 0.07, 0); g.add(c1);
  var c2 = box(0.3, 0.12, 0.18, M.crate, -0.3, 0.06, 0.04); g.add(c2);
  g.add(box(0.4, 0.026, 0.24, M.wood, 0.02, 0.15, 0.01));
  var i;
  var cols = ['#c04030', '#e0a030', '#70a848', '#d87848'];
  for (i = 0; i < 4; i++) g.add(sph(0.028, MAT('p33fruit' + i, function () { return std('#c04030', { rough: 0.6 }); }), -0.12 + (i % 2) * 0.22, 0.19, (i < 2) ? -0.04 : 0.05));
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→lighting→interaction） ================= */

/* ---- lv1 小屋：锈铁皮棚屋 + 天线 + 暖窗 + 木凳（h≈1.18） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padHK(M, 2.3, 2.3));
  /* 台基 + 板条墙体（blockout：单一棚体量） */
  g.add(box(1.52, 0.08, 1.16, M.stoneD, -0.05, 0.04, -0.05));
  g.add(box(1.36, 0.62, 1.0, M.plank, -0.05, 0.39, -0.05));
  /* 四角深色角柱 */
  [[-0.68, -0.5], [0.58, -0.5], [-0.68, 0.4], [0.58, 0.4]].forEach(function (c) {
    g.add(box(0.06, 0.64, 0.06, M.woodD, c[0], 0.4, c[1]));
  });
  /* 门（左）+ 暖窗×2（右/中）+ 石阶 */
  g.add(box(0.28, 0.4, 0.04, M.woodD, -0.4, 0.29, 0.455));
  g.add(box(0.24, 0.36, 0.045, M.lacq, -0.4, 0.29, 0.462));
  var w1 = warmWindow(M, 0.24, 0.26); put(g, w1, 0.16, 0.42, 0.462);
  var w2 = warmWindow(M, 0.2, 0.2); put(g, w2, 0.635, 0.38, 0.12, PI / 2);
  g.add(box(0.4, 0.05, 0.18, M.stoneD, -0.4, 0.105, 0.53));
  /* 锈铁皮双坡顶（apex≈1.00）+ 脊带 */
  var roof = gableRoof(M, { w: 1.46, d: 1.06, h: 0.3, mat: M.corrug, gableMat: M.plank, ridgeMat: M.ink });
  put(g, roof, -0.05, 0.7, -0.05);
  /* 鱼骨天线（脊上，总顶≈1.20） */
  var ant = antennaHK(M, 0.09, anims, 1.3); put(g, ant, 0.32, 1.0, -0.05);
  /* 门口物件：木凳 + 铁桶 + 板条箱 */
  g.add(box(0.36, 0.03, 0.15, M.wood, 0.78, 0.16, 0.5));
  g.add(box(0.045, 0.13, 0.13, M.woodD, 0.64, 0.09, 0.5));
  g.add(box(0.045, 0.13, 0.13, M.woodD, 0.92, 0.09, 0.5));
  g.add(cyl(0.07, 0.08, 0.14, 10, M.steel, -0.95, 0.1, 0.42));
  g.add(cyl(0.075, 0.075, 0.02, 10, M.ink, -0.95, 0.175, 0.42));
  g.add(box(0.26, 0.16, 0.18, M.crate, 0.72, 0.1, -0.62));
  /* 暖窗呼吸 */
  var wm = M.warm;
  anims.push(function (t) { wm.emissiveIntensity = 0.4 + 0.12 * sin(t * 1.15); });
  return g;
}

/* ---- lv2 洋房：两层木构唐楼 + 绿瓦楞顶 + 扇贝披棚 + 竖招三连（h≈1.66） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padHK(M, 2.45, 2.3));
  /* 台基 + 一层铺面（0.10-0.72）+ 二层（0.75-1.27） */
  g.add(box(1.72, 0.1, 1.14, M.stoneD, -0.25, 0.05, -0.05));
  g.add(box(1.54, 0.62, 1.02, M.plank, -0.25, 0.41, -0.05));
  g.add(box(1.6, 0.05, 1.06, M.wood, -0.25, 0.735, -0.05));
  g.add(box(1.6, 0.52, 1.04, M.plank, -0.25, 1.025, -0.05));
  /* 一层门脸：门 + 柜台窗 + 横招 */
  g.add(box(0.3, 0.42, 0.04, M.woodD, -0.72, 0.31, 0.475));
  g.add(box(0.26, 0.38, 0.045, M.lacq, -0.72, 0.31, 0.482));
  var shop = warmWindow(M, 0.5, 0.36); put(g, shop, -0.1, 0.32, 0.472);      /* 店面大橱窗 */
  var sign1 = boardSign(M, '茶樓', '#8a4a20', '#ffd98a', '#3c2412', 0.5, 0.15, true, 0.55);
  put(g, sign1, -0.05, 0.62, 0.487);
  /* 二层：檐廊木栏 + 暖窗×2 + 横招 + 空调×2 */
  g.add(box(1.4, 0.03, 0.16, M.lacq, -0.3, 0.78, 0.5));
  var i, n = 8;
  for (i = 0; i <= n; i++) g.add(box(0.02, 0.13, 0.016, M.lacqBr, -0.98 + i * 0.175, 0.86, 0.57));
  g.add(box(1.44, 0.03, 0.03, M.lacq, -0.3, 0.94, 0.575));
  var u1 = warmWindow(M, 0.26, 0.28); put(g, u1, -0.62, 1.06, 0.475);
  var u2 = warmWindow(M, 0.26, 0.28); put(g, u2, -0.16, 1.06, 0.475);
  var sign2 = boardSign(M, '旅店', '#8a4a20', '#ffd98a', '#3c2412', 0.44, 0.14, true, 0.5);
  put(g, sign2, 0.32, 1.12, 0.467);
  var a1 = acUnit(M, 1); put(g, a1, 0.6, 0.92, 0.44);
  var a2 = acUnit(M, 0.9); put(g, a2, 0.32, 0.5, 0.45);
  /* 琥珀扇贝披棚×2（GFR 大棚 + 2F 小棚） */
  var aw1 = scallopAwning(M, 1.06, 0.42, M.awnAmber, 6, 0.5); put(g, aw1, -0.22, 0.78, 0.42);
  var aw2 = scallopAwning(M, 0.6, 0.3, M.awnAmber, 4, 0.5); put(g, aw2, 0.32, 1.24, 0.4);
  /* 绿瓦楞悬山屋顶（apex≈1.55，脊≈1.60） */
  var roof = gableRoof(M, { w: 1.66, d: 1.16, h: 0.24, mat: M.greenCorr, gableMat: M.plank, ridgeMat: M.ink });
  put(g, roof, -0.25, 1.28, -0.05);
  var ant = antennaHK(M, 0.1, anims, 2.2); put(g, ant, 0.4, 1.48, -0.05);
  /* 竖排霓虹三连（右前角，粉/青/绿，接地立柱 cantilever） */
  var stack = grp(); put(g, stack, 0.68, 0, 0.5);
  var s1 = neonSign(M, '銅鑼灣', '#c8388e', '#ffe45c', 0.19, 0.56, anims, 0.0); put(stack, s1, 0, 1.06, 0.06, 0.3);
  var s2 = neonSign(M, '茶', '#2ba8b8', '#ffffff', 0.13, 0.3, anims, 2.1); put(stack, s2, 0.02, 0.6, 0.08, 0.3);
  var s3 = neonSign(M, '樓', '#3e9e4e', '#ffe45c', 0.13, 0.3, anims, 4.2); put(stack, s3, 0.04, 0.28, 0.1, 0.3);
  stack.add(box(0.05, 1.45, 0.05, M.ink, 0.0, 0.75, -0.02));
  /* 红灯笼对（左前檐角垂挂 + 吊索） */
  g.add(cyl(0.006, 0.006, 0.1, 6, M.ink, -1.06, 1.23, 0.5));
  put(g, lanternHK(M, 0.8, anims, 0), -1.06, 1.12, 0.5);
  g.add(cyl(0.005, 0.005, 0.08, 6, M.ink, -1.06, 1.0, 0.5));
  put(g, lanternHK(M, 0.72, anims, 3.1), -1.06, 0.9, 0.5);
  lanternBreathe(anims, 0);
  /* 果蔬档 + 盆栽 + 石阶 */
  var stall = crateStall(M); put(g, stall, 0.6, 0.06, 0.82);
  g.add(cyl(0.07, 0.085, 0.11, 10, M.stoneD, -1.0, 0.06, 0.9));
  var bush = mesh(new THREE.IcosahedronGeometry(0.09, 0), M.grassD); put(g, bush, -1.0, 0.17, 0.9); bush.scale.y = 0.85;
  g.add(box(0.44, 0.05, 0.2, M.stoneD, -0.72, 0.12, 0.6));
  /* 暖窗呼吸 */
  var wm = M.warm;
  anims.push(function (t) { wm.emissiveIntensity = 0.4 + 0.12 * sin(t * 1.2 + 0.5); });
  return g;
}

/* ---- lv3 大厦：五层混凝土 walk-up + 水箱 + 竖招四连柱（h≈2.26） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padHK(M, 2.5, 2.4));
  /* 台基 + 楼身（0.10-1.85）+ 层间腰线 + 前角柱 */
  g.add(box(1.42, 0.1, 1.2, M.stoneD, 0.12, 0.05, -0.08));
  g.add(box(1.3, 1.75, 1.1, M.concSun, 0.12, 0.975, -0.08));
  g.add(box(1.3, 0.03, 1.1, M.concShade, 0.12, 0.52, -0.08));
  g.add(box(1.3, 0.03, 1.1, M.concShade, 0.12, 0.87, -0.08));
  g.add(box(1.3, 0.03, 1.1, M.concShade, 0.12, 1.22, -0.08));
  g.add(box(1.3, 0.03, 1.1, M.concShade, 0.12, 1.57, -0.08));
  g.add(box(0.08, 1.75, 0.08, M.concShade, -0.49, 0.975, 0.49));
  g.add(box(0.08, 1.75, 0.08, M.concShade, 0.73, 0.975, 0.49));
  /* 密集暖光窗格：正面 4 层 × 3 列 = 12（框+光 2 mesh/窗） */
  var fy = [0.36, 0.71, 1.06, 1.41], fx = [-0.22, 0.12, 0.46], i, k;
  for (i = 0; i < 4; i++) {
    for (k = 0; k < 3; k++) {
      var win = warmWindow(M, 0.22, 0.26);
      put(g, win, fx[k], fy[i], 0.473);
    }
  }
  /* 侧面（+x）4 层 × 2 列 = 8 窗 */
  for (i = 0; i < 4; i++) {
    for (k = 0; k < 2; k++) {
      var sw = warmWindow(M, 0.2, 0.24);
      sw.rotation.y = PI / 2;
      put(g, sw, 0.783, fy[i], -0.36 + k * 0.42);
    }
  }
  /* 绿帆布雨棚排（正面 4 + 侧面 2） */
  for (k = 0; k < 3; k++) {
    var awF = box(0.3, 0.02, 0.2, M.awnGreen, fx[k], fy[k] + 0.2, 0.53);
    awF.rotation.x = 0.55; g.add(awF);
  }
  for (i = 0; i < 2; i++) {
    var awS = box(0.2, 0.02, 0.26, M.awnGreen, 0.84, fy[i] + 0.19, -0.36 + i * 0.42);
    awS.rotation.z = -0.55; g.add(awS);
  }
  /* 空调外机排（正面 4 + 侧 2，窗下） */
  var ax = [-0.22, 0.12, 0.46];
  for (i = 0; i < 3; i++) { var a = acUnit(M, 0.9); put(g, a, ax[i], fy[i] - 0.2, 0.47); }
  for (i = 0; i < 2; i++) {
    var aS = acUnit(M, 0.85); aS.rotation.y = PI / 2; put(g, aS, 0.78, fy[i + 1] - 0.19, -0.36 + i * 0.42);
  }
  /* 女儿墙（1.85-1.94） */
  g.add(box(1.38, 0.09, 0.07, M.concShade, 0.12, 1.895, 0.51));
  g.add(box(1.38, 0.09, 0.07, M.concShade, 0.12, 1.895, -0.67));
  g.add(box(0.07, 0.09, 1.24, M.concShade, -0.55, 1.895, -0.08));
  g.add(box(0.07, 0.09, 1.24, M.concShade, 0.79, 1.895, -0.08));
  /* 屋顶设备群：水箱 + 铁皮棚 + 天线 + 管线（屋面 1.85） */
  var tank = waterTank(M); put(g, tank, 0.48, 1.86, -0.3);                   /* 顶≈2.28 */
  var shed = grp(); put(g, shed, -0.28, 1.85, -0.3);
  shed.add(box(0.5, 0.2, 0.42, M.corrug, 0, 0.1, 0));
  shed.add(box(0.52, 0.03, 0.44, M.corrug, 0, 0.215, 0));
  shed.add(box(0.14, 0.13, 0.02, M.woodD, 0.1, 0.065, 0.215));
  var ant = antennaHK(M, 0.22, anims, 2.6); put(g, ant, -0.42, 1.85, 0.3);
  g.add(cyl(0.018, 0.018, 0.36, 6, M.steel, 0.72, 2.04, -0.62));
  /* 竖招霓虹四连柱（右前角外挑，接地立柱） */
  var stack = grp(); put(g, stack, 0.92, 0, 0.45, -0.35);
  var s1 = neonSign(M, '金', '#c83030', '#ffe45c', 0.14, 0.36, anims, 0.0); put(stack, s1, 0, 1.62, 0);
  var s2 = neonSign(M, '紫', '#8e3ec8', '#ffffff', 0.14, 0.36, anims, 1.6); put(stack, s2, 0, 1.2, 0);
  var s3 = neonSign(M, '水', '#2ba8b8', '#ffffff', 0.14, 0.36, anims, 3.2); put(stack, s3, 0, 0.78, 0);
  var s4 = neonSign(M, '發', '#c8388e', '#ffe45c', 0.14, 0.36, anims, 4.8); put(stack, s4, 0, 0.36, 0);
  stack.add(box(0.045, 1.86, 0.045, M.ink, -0.05, 1.0, 0));
  /* 前脸小竖招 ×2 */
  var f1 = neonSign(M, '餐廳', '#3e9e4e', '#ffe45c', 0.15, 0.42, anims, 2.4); put(g, f1, -0.6, 0.86, 0.52, 0.22);
  var f2 = neonSign(M, '旅', '#2b5ac8', '#ffffff', 0.12, 0.28, anims, 5.3); put(g, f2, 0.66, 0.66, 0.5, -0.18);
  /* GFR：通长绿帆布棚 + 扇贝 + 店招 + 门/窗/柜台 */
  var can = grp(); put(g, can, 0.12, 0.66, 0.42);
  var cb = box(1.34, 0.026, 0.36, M.awnGreen); cb.rotation.x = 0.42; cb.position.z = 0.1; can.add(cb);
  var r = 1.34 / 16, scGeo = new THREE.CylinderGeometry(r, r, 0.026, 10, 1, false, 0, PI);
  for (i = 0; i < 8; i++) {
    var sc = mesh(scGeo, M.awnGreen);
    sc.rotation.x = PI / 2; sc.rotation.z = PI;
    sc.position.set(-0.67 + r + i * 2 * r, -0.105, 0.25);
    can.add(sc);
  }
  var sgn = boardSign(M, '銅鑼灣', '#14432e', '#ffe45c', '#0c2b1d', 0.62, 0.14, true, 0.55);
  put(g, sgn, 0.42, 0.52, 0.55);
  g.add(box(0.28, 0.4, 0.04, M.woodD, -0.28, 0.3, 0.475));
  g.add(box(0.24, 0.36, 0.045, M.lacq, -0.28, 0.3, 0.482));
  var shopW = warmWindow(M, 0.42, 0.3); put(g, shopW, 0.28, 0.32, 0.475);
  g.add(box(0.5, 0.05, 0.14, M.stoneD, 0.28, 0.115, 0.66));
  /* 红灯笼对（棚下） */
  put(g, lanternHK(M, 0.7, anims, 0), -0.42, 0.52, 0.6);
  put(g, lanternHK(M, 0.7, anims, 3.1), 0.78, 0.52, 0.6);
  lanternBreathe(anims, 0);
  /* 盆栽/绿篱/石阶 */
  g.add(cyl(0.075, 0.09, 0.12, 10, M.stoneD, -0.95, 0.07, 0.86));
  var bsh = mesh(new THREE.IcosahedronGeometry(0.1, 0), M.grassD); put(g, bsh, -0.95, 0.2, 0.86); bsh.scale.y = 0.82;
  g.add(box(0.5, 0.09, 0.14, M.grassD, 1.02, 0.06, 0.75));
  g.add(box(0.44, 0.05, 0.2, M.stoneD, 0.42, 0.12, 0.72));
  /* 暖窗呼吸 */
  var wm = M.warm;
  anims.push(function (t) { wm.emissiveIntensity = 0.4 + 0.12 * sin(t * 1.25 + 0.8); });
  return g;
}

/* ---- lv4 地标：四重绿釉瓦金脊塔式商楼 + 灯笼排 + 石狮金匾（h≈2.88） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padHK(M, 2.5, 2.5));
  /* 石阶（三級垂带） */
  g.add(box(1.0, 0.06, 0.22, M.stoneD, 0, 0.03, 1.0));
  g.add(box(0.88, 0.06, 0.2, M.stoneD, 0, 0.09, 0.9));
  g.add(box(0.76, 0.06, 0.18, M.stoneD, 0, 0.15, 0.8));
  /* 石狮一对 + 金匾门头 */
  put(g, stoneLionHK(M, 1.2), -0.56, 0.05, 0.72);
  put(g, stoneLionHK(M, 1.2), 0.56, 0.05, 0.72);
  var plq = boardSign(M, '銅鑼灣', '#8a5a1a', '#ff3c2c', '#d8a850', 0.66, 0.14, true, 0.55);
  put(g, plq, 0, 0.565, 0.625);
  /* 金框朱门 */
  g.add(box(0.52, 0.48, 0.05, M.gold, 0, 0.37, 0.585));
  g.add(box(0.44, 0.42, 0.055, M.lacqBr, 0, 0.35, 0.59));
  g.add(box(0.4, 0.38, 0.06, M.lacq, 0, 0.33, 0.6));
  g.add(sph(0.02, M.gold, -0.12, 0.4, 0.635));
  g.add(sph(0.02, M.gold, 0.12, 0.4, 0.635));
  /* 四层塔身：塔冠 apex = 上一层楼面（生长咬合） */
  var tiers = [
    { y0: 0.14, h: 0.48, w: 1.9, d: 1.38, roofH: 0.22, win: 3 },
    { y0: 0.84, h: 0.46, w: 1.6, d: 1.14, roofH: 0.2, win: 3 },
    { y0: 1.5, h: 0.44, w: 1.32, d: 0.94, roofH: 0.19, win: 2 },
    { y0: 2.13, h: 0.42, w: 1.02, d: 0.74, roofH: 0.28, win: 2 }
  ];
  tiers.forEach(function (T, ti) {
    var cx = 0, cz = -0.1;
    /* 层身（红漆木廊层）+ 金腰带 */
    g.add(box(T.w, T.h, T.d, M.lacq, cx, T.y0 + T.h / 2, cz));
    g.add(box(T.w + 0.03, 0.045, T.d + 0.03, M.gold, cx, T.y0 + 0.025, cz));
    /* 前脸暖窗 */
    var n = T.win, i, gap = T.w / (n + 1);
    for (i = 0; i < n; i++) {
      var win = warmWindow(M, Math.min(0.24, gap * 0.6), T.h * 0.52);
      put(g, win, cx - T.w / 2 + gap * (i + 1), T.y0 + T.h * 0.55, cz + T.d / 2 + 0.005);
    }
    /* 前廊金栏（平座，T1 落地不设） */
    if (ti > 0) {
      g.add(box(T.w - 0.12, 0.028, 0.03, M.gold, cx, T.y0 - 0.06, cz + T.d / 2 + 0.09));
      g.add(box(T.w - 0.12, 0.05, 0.02, M.lacqBr, cx, T.y0 - 0.115, cz + T.d / 2 + 0.09));
    }
    /* 绿釉四坡塔冠 + 金脊（顶冠带宝顶，≈2.91） */
    var roof = hipRoof(M, { w: T.w + 0.1, d: T.d + 0.1, h: T.roofH, finial: ti === 3 });
    put(g, roof, cx, T.y0 + T.h, cz);
    /* 檐下红灯笼排（前 3） */
    var li;
    for (li = 0; li < 3; li++) {
      var lx = cx - (T.w * 0.3) + li * (T.w * 0.3);
      put(g, lanternHK(M, 0.62, anims, ti * 1.3), lx, T.y0 + T.h - 0.1, cz + T.d / 2 + 0.12);
    }
  });
  lanternBreathe(anims, 0.9);
  /* 右侧竖招四连 + 左侧竖招三连（接地立柱） */
  var stR = grp(); put(g, stR, 1.02, 0, 0.1, -0.4);
  var r1 = neonSign(M, '夜', '#2b5ac8', '#ffffff', 0.16, 0.32, anims, 0.0); put(stR, r1, 0, 2.0, 0);
  var r2 = neonSign(M, '會', '#c8388e', '#ffe45c', 0.16, 0.32, anims, 1.5); put(stR, r2, 0, 1.62, 0);
  var r3 = neonSign(M, '金', '#8e3ec8', '#ffe45c', 0.16, 0.32, anims, 3.0); put(stR, r3, 0, 1.24, 0);
  var r4 = neonSign(M, '茶', '#3e9e4e', '#ffe45c', 0.16, 0.32, anims, 4.5); put(stR, r4, 0, 0.86, 0);
  stR.add(box(0.045, 2.14, 0.045, M.ink, -0.05, 1.1, 0));
  var stL = grp(); put(g, stL, -1.0, 0, 0.05, 0.4);
  var q1 = neonSign(M, '發', '#c8388e', '#ffe45c', 0.15, 0.3, anims, 2.2); put(stL, q1, 0, 1.7, 0);
  var q2 = neonSign(M, '財', '#2ba8b8', '#ffffff', 0.15, 0.3, anims, 3.7); put(stL, q2, 0, 1.34, 0);
  var q3 = neonSign(M, '寶', '#3e9e4e', '#ffe45c', 0.15, 0.3, anims, 5.2); put(stL, q3, 0, 0.98, 0);
  stL.add(box(0.04, 1.9, 0.04, M.ink, 0.05, 0.98, 0));
  /* 中部粉紫横霓虹「銅鑼灣」（T3 前脸） */
  var neo = boardSign(M, '銅鑼灣', '#c02ca0', '#ffffff', '#5c1660', 0.9, 0.2, true, 0.85);
  put(g, neo, 0.05, 1.56, 0.42, 0.06);
  var neoMat = neo.userData.mat;
  anims.push(function (t) { neoMat.emissiveIntensity = 0.72 + 0.25 * sin(t * 2.3); });
  /* 平座盆栽（贴塔冠坡面，T2 檐角；T3 省出 mesh 预算） */
  var pi;
  for (pi = 0; pi < 2; pi++) {
    var px = pi ? 0.66 : -0.66;
    g.add(cyl(0.06, 0.075, 0.1, 10, M.stoneD, px, 0.71, 0.55));
    var pb = mesh(new THREE.IcosahedronGeometry(0.09, 0), M.grassD); put(g, pb, px, 0.81, 0.55); pb.scale.y = 0.82;
  }
  /* 门口条凳 + 绿篱 */
  g.add(box(0.34, 0.03, 0.14, M.wood, 0.82, 0.17, 0.92));
  g.add(box(0.04, 0.1, 0.12, M.woodD, 0.7, 0.105, 0.92));
  g.add(box(0.04, 0.1, 0.12, M.woodD, 0.94, 0.105, 0.92));
  g.add(box(0.4, 0.08, 0.12, M.grassD, -1.04, 0.05, 0.9));
  /* 暖窗呼吸 */
  var wm = M.warm;
  anims.push(function (t) { wm.emissiveIntensity = 0.4 + 0.12 * sin(t * 1.1 + 1.4); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[33] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_33_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 33;
  g.userData.level = lv;
  g.userData.region = 'g7';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
