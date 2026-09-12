/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_16.js
 * -------------------------------------------------------------------------------------
 * 格 16「宽窄巷子」(g4 川西民居) 独属建筑：川西茶馆四阶生长史
 * 参考图 refs/prop_16.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop16/）。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   老瓦小屋 + 右侧披屋 + 竹丛 + 木桌陶壶（h≈1.02）
 *   lv2 洋房   两层茶铺：底层敞廊柜台 + 青布雨棚 + 二层格栅窗雕栏 + 侧厢（h≈1.58）
 *   lv3 大厦   三层退台木构 + 门罩坡顶 + 层层红灯笼 + 瓦顶院墙 + 匾额/告示牌（h≈2.05）
 *   lv4 地标   石台基石狮 + 门屋 + 两层木构环廊 + 金饰歇山顶 + 青伞 + 挂瓦院墙（h≈2.46）
 *
 * 独有语汇（自参考图提炼，与 prop_1/6/8/9 拉开差异）：
 *   · 穿斗式木构：暖棕木柱网格 + 米白抹灰嵌板（非砖墙、非骑楼）
 *   · 小青瓦坡顶：瓦垄横排 + 檐口圆瓦当一排 + 檐角起翘逐级加大
 *   · 【反差特征】瓦脊浅灰（比瓦面亮），非黑脊
 *   · 青布幌：lv2 下垂雨棚 → lv4 环廊垂幔 + 阳伞（青色贯穿族谱）
 *   · 方格木格栅窗（暖光内透）+ 红灯笼金盖红穗 + 挂瓦白院墙 + 石狮 + 竹丛
 *   · 土台草皮地坪：草沿悬挑露出黄土侧壁 + 石板小径
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[16] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_16] THREE 未定义，请先加载 three.min.js (r147)');
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
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 12, 9), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
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

/* 小青瓦垄：横排瓦垄明暗 + 竖向搭接错缝 + 陶面噪点（map+bump 同源） */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#4f473d'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#584f43' : '#514a3f';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#6e6455'; g.fillRect(0, y + 1, S, 2);          /* 垄脊受光 */
    g.fillStyle = '#322a21'; g.fillRect(0, y + rh - 4, S, 4);     /* 垄谷阴影 */
    var off = (i % 2) ? rh * 0.9 : 0;
    for (k = 0; k < 5; k++) {
      var x = (off + k * (S / 5)) % S;
      g.fillStyle = 'rgba(38,30,22,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,246,224,0.05)' : 'rgba(24,18,12,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 老瓦（lv1 专属）：偏褐 + 苔斑 */
function texTileOld() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#5c4c33'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#64553a' : '#5d4e36';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#7a6a4c'; g.fillRect(0, y + 1, S, 2);
    g.fillStyle = '#43331f'; g.fillRect(0, y + rh - 4, S, 4);
    var off = (i % 2) ? rh * 0.9 : 0;
    for (k = 0; k < 5; k++) {
      var x = (off + k * (S / 5)) % S;
      g.fillStyle = 'rgba(52,38,22,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 26; i++) {                                       /* 苔斑 */
    g.fillStyle = 'rgba(86,102,61,0.35)';
    g.fillRect((i * 47 + 13) % S, (i * 71 + 5) % S, 3 + (i % 3), 2);
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,244,214,0.05)' : 'rgba(30,22,12,0.1)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 米白抹灰：细噪 + 抹痕（粉墙嵌板） */
function texPlaster() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#dcd3bf'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,250,236,0.07)' : 'rgba(126,112,86,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 黄土台壁：水平层理 + 土粒 */
function texEarth() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#9a7040'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 8; i++) {
    g.fillStyle = (i % 2) ? 'rgba(120,86,48,0.5)' : 'rgba(170,132,84,0.35)';
    g.fillRect(0, i * 8, S, 3);
  }
  for (i = 0; i < 70; i++) {
    g.fillStyle = (i % 2) ? 'rgba(70,48,26,0.25)' : 'rgba(220,180,120,0.18)';
    g.fillRect((i * 31) % S, (i * 47) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 横式匾额「宽窄巷子」：深木底 + 金字 */
function texPlaqueH() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#291a0c'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9ac5a'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#ecd28a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('宽窄巷子', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }
function plaqueMat() {
  return MAT('p16plaque', function () {
    return new THREE.MeshStandardMaterial({ map: getTex('plaqueH', texPlaqueH), roughness: 0.6, metalness: 0.05, flatShading: true });
  });
}

/* 共享材质库（四级统一色板 = 参考图取样） */
function Mats() {
  return {
    roof:      MAT('p16roof', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.68 }); }),
    roofShd:   MAT('p16roofShd', function () { var t = getTex('tile', texTile); return std('#b3aa9c', { map: t, bump: t, bumpScale: 0.016, rough: 0.74 }); }),
    roofOld:   MAT('p16roofOld', function () { var t = getTex('tileOld', texTileOld); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.76 }); }),
    roofOldShd:MAT('p16roofOldShd', function () { var t = getTex('tileOld', texTileOld); return std('#b8ab94', { map: t, bump: t, bumpScale: 0.016, rough: 0.8 }); }),
    ridgeL:    MAT('p16ridgeL', function () { return std('#a8a49e', { rough: 0.82 }); }),   /* 浅灰瓦脊(反差特征) */
    ridgeD:    MAT('p16ridgeD', function () { return std('#8d897f', { rough: 0.85 }); }),
    plaster:   MAT('p16plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    timber:    MAT('p16timber', function () { return std('#7c4a22', { rough: 0.75 }); }),
    timberD:   MAT('p16timberD', function () { return std('#5f3417', { rough: 0.8 }); }),
    timberW:   MAT('p16timberW', function () { return std('#6b4a2e', { rough: 0.85 }); }),  /* lv1 风化木 */
    canvas:    MAT('p16canvas', function () { return std('#4e7974', { rough: 0.88 }); }),
    canvasD:   MAT('p16canvasD', function () { return std('#3e635f', { rough: 0.9 }); }),
    gold:      MAT('p16gold', function () { return std('#d9ac5a', { rough: 0.35, metal: 0.72 }); }),
    stone:     MAT('p16stone', function () { return std('#b0a995', { rough: 0.9 }); }),
    stoneD:    MAT('p16stoneD', function () { return std('#8a857c', { rough: 0.92 }); }),
    grass:     MAT('p16grass', function () { return std('#6da33e', { rough: 0.95 }); }),
    grassD:    MAT('p16grassD', function () { return std('#5c8f33', { rough: 0.95 }); }),
    earth:     MAT('p16earth', function () { var t = getTex('earth', texEarth); return std('#ffffff', { map: t, rough: 0.95 }); }),
    path:      MAT('p16path', function () { return std('#c6c1b0', { rough: 0.95 }); }),
    ink:       MAT('p16ink', function () { return std('#241a10', { rough: 0.9 }); }),
    clay:      MAT('p16clay', function () { return std('#8a5a33', { rough: 0.85 }); }),
    glow:      MAT('p16glow', function () { return std('#e8d9b8', { rough: 0.9, emissive: '#ffc873', ei: 0.22 }); })
  };
}

/* 草皮顶面高度（土台上沿） */
var PADTOP = 0.078;

/* ================= 2. 预制件（风格独有语汇） ================= */

/* 土台草皮地坪：黄土侧壁 + 草沿悬挑 + 石板小径 + 碎石（参考图绿边土台） */
function earthPad(M, w, d) {
  var g = grp();
  g.add(box(w, 0.06, d, M.earth, 0, 0.03, 0));
  g.add(box(w + 0.05, 0.032, d + 0.05, M.grass, 0, 0.062, 0));    /* 草沿悬挑 */
  g.add(box(0.34, 0.016, 0.2, M.path, 0, PADTOP + 0.008, d / 2 - 0.22));
  g.add(box(0.3, 0.016, 0.18, M.path, 0.06, PADTOP + 0.008, d / 2 - 0.48));
  g.add(box(0.26, 0.016, 0.16, M.path, -0.05, PADTOP + 0.008, d / 2 - 0.72));
  var r1 = mesh(new THREE.DodecahedronGeometry(0.035, 0), M.stoneD); put(g, r1, w / 2 - 0.26, PADTOP + 0.03, d / 2 - 0.3);
  var r2 = mesh(new THREE.DodecahedronGeometry(0.026, 0), M.stoneD); put(g, r2, -w / 2 + 0.3, PADTOP + 0.026, -d / 2 + 0.32);
  return g;
}

/* 方格木格栅窗：木框 + 暖光内透 + 方格棂条（几何花格，非贴图） */
function latticeWin(M, w, h, o) {
  o = o || {};
  var g = grp();
  g.add(box(w + 0.04, h + 0.04, 0.03, M.timberD));
  g.add(box(w, h, 0.026, M.glow, 0, 0, 0.004));
  var nv = o.nv !== undefined ? o.nv : Math.max(2, Math.round(w / 0.1));
  var nh = o.nh !== undefined ? o.nh : Math.max(2, Math.round(h / 0.1));
  var i;
  for (i = 0; i < nv; i++) {
    var x = -w / 2 + (i + 1) * w / (nv + 1);
    g.add(box(0.02, h, 0.032, M.timber, x, 0, 0.008));
  }
  for (i = 0; i < nh; i++) {
    var y = -h / 2 + (i + 1) * h / (nh + 1);
    g.add(box(w, 0.02, 0.032, M.timber, 0, y, 0.008));
  }
  return g;
}

/* 木板门（y0=门槛地面线）：门洞阴影 + 暖木门扇 + 横挺（川西素木门） */
function woodDoor(M, w, h, y0) {
  var g = grp();
  g.add(box(w + 0.07, h + 0.04, 0.04, M.timberD, 0, y0 + (h + 0.04) / 2));
  g.add(box(w, h, 0.045, M.ink, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.94, h * 0.9, 0.05, M.timberW, 0, y0 + h / 2, 0.006));
  g.add(box(w * 0.94, 0.03, 0.052, M.timberD, 0, y0 + h * 0.62, 0.012));
  return g;
}

/* 红灯笼：金盖金底 + 红壳 + 红穗（材质随 phase 共享呼吸） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p16lant' + (phase || 0), function () { return std('#c23a24', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.034 * s, 0.048 * s, 0.034 * s, 10, M.gold, 0, 0.112 * s, 0));
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.048 * s, 0.034 * s, 0.034 * s, 10, M.gold, 0, -0.1 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.07 * s, 6, M.ink, 0, -0.158 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 竹丛：双竿 + 三簇叶（轻摆动画；h=竿高，叶再抬 ~0.1） */
function bambooClump(M, h, anims, phase) {
  var g = grp();
  g.add(cyl(0.012, 0.015, h, 6, M.grass, -0.02, h / 2, 0));
  g.add(cyl(0.009, 0.012, h * 0.78, 6, M.grassD, 0.035, h * 0.39, 0.02));
  var l1 = cone(0.055, 0.24, 5, M.grassD, -0.03, h * 0.92, 0); l1.rotation.z = 0.5; g.add(l1);
  var l2 = cone(0.05, 0.22, 5, M.grass, 0.05, h * 0.78, 0.03); l2.rotation.z = -0.55; l2.rotation.x = 0.3; g.add(l2);
  var l3 = cone(0.045, 0.18, 5, M.grassD, 0, h * 0.62, -0.03); l3.rotation.x = -0.5; g.add(l3);
  anims.push(function (t) { g.rotation.z = sin(t * 1.15 + (phase || 0)) * 0.045; });
  return g;
}

/* 石狮（lv4）：基座 + 身 + 头 + 双耳（青灰石） */
function stoneLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.11 * s, 0.03 * s, 0.11 * s, M.stoneD, 0, 0.015 * s, 0));
  var body = sph(0.05 * s, M.stone, 0, 0.07 * s, -0.012 * s); body.scale.set(1, 0.92, 1.28); g.add(body);
  g.add(sph(0.037 * s, M.stone, 0, 0.125 * s, 0.042 * s));
  var e1 = cone(0.014 * s, 0.03 * s, 6, M.stoneD, 0.022 * s, 0.162 * s, 0.042 * s); e1.rotation.z = -0.3; g.add(e1);
  var e2 = cone(0.014 * s, 0.03 * s, 6, M.stoneD, -0.022 * s, 0.162 * s, 0.042 * s); e2.rotation.z = 0.3; g.add(e2);
  return g;
}

/* 雕花木栏：地栿 + 雕花板段 + 扶手（川西雕花栏，非直棂条） */
function carvedRail(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.18, M.timberD, 0, 0, 0.09));
  var n = Math.max(3, Math.round(w / 0.45)), i;
  for (i = 0; i < n; i++) {
    var pw = w / n - 0.03;
    g.add(box(pw, 0.1, 0.022, M.timber, -w / 2 + (i + 0.5) * (w / n), 0.075, 0.165));
    g.add(box(pw * 0.55, 0.05, 0.026, M.timberD, -w / 2 + (i + 0.5) * (w / n), 0.075, 0.168));
  }
  g.add(box(0.03, 0.13, 0.03, M.timberD, -w / 2, 0.08, 0.17));
  g.add(box(0.03, 0.13, 0.03, M.timberD, w / 2, 0.08, 0.17));
  g.add(box(w + 0.04, 0.026, 0.032, M.timberD, 0, 0.148, 0.17));
  return g;
}

/* 檐口圆瓦当一排：半圆瓦头收边（前坡专用，几何收边） */
function tileEndRow(M, w, y, z, n) {
  var g = grp();
  var i, step = w / (n - 1);
  for (i = 0; i < n; i++) {
    var c = cyl(0.022, 0.022, 0.02, 8, M.ridgeD, -w / 2 + i * step, y, z);
    c.rotation.x = PI / 2;
    g.add(c);
  }
  return g;
}

/* 挂瓦墙帽：院墙顶一排仰瓦（亮脊条 + 暗底瓦交错） */
function wallCoping(M, w, x, y, z, ry, n) {
  var g = grp();
  if (ry) g.rotation.y = ry;
  g.position.set(x, y, z);
  var step = w / n, i;
  for (i = 0; i < n; i++) {
    g.add(box(step * 0.8, 0.03, 0.1, M.ridgeD, -w / 2 + (i + 0.5) * step, 0.015, 0));
    g.add(box(step * 0.62, 0.024, 0.085, M.ridgeL, -w / 2 + (i + 0.5) * step, 0.04, 0.004));
  }
  return g;
}

/* 灰瓦双坡顶：瓦垄明暗 + 圆瓦当 + 浅灰正脊 + 翘角 + 抹灰山墙
 * o: w d h over strips ends aged ridge gable lift big gold */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var strips = o.strips !== undefined ? o.strips : 2;
  var aged = !!o.aged;
  var rSun = aged ? M.roofOld : M.roof;
  var rShd = aged ? M.roofOldShd : M.roofShd;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, k > 0 ? rSun : rShd, 0, 0, k * slopeLen / 2));
    for (i = 0; i < strips; i++) {
      var u = (i + 0.5) / strips;
      sg.add(box(w + over * 2 - 0.04, 0.018, 0.028, M.ridgeD, 0, 0.026, k * u * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.timberD, 0, -0.004, k * eave));
    var lift = o.lift !== undefined ? o.lift : 0.55;
    var c1 = box(0.07, 0.05, 0.07, M.ridgeD, (w + over * 2) / 2 - 0.01, 0.05, k * (eave - 0.015));
    c1.rotation.z = lift; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ridgeD, -(w + over * 2) / 2 + 0.01, 0.05, k * (eave - 0.015));
    c2.rotation.z = -lift; sg.add(c2);
  }
  if (o.ends !== 0) {                                              /* 前坡圆瓦当 */
    g.add(tileEndRow(M, w + over * 2 - 0.12, 0.02, eave + 0.012, o.ends || 5));
  }
  if (o.gable !== false) {                                          /* 抹灰山墙 */
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
    var t1 = mesh(gg, M.plaster); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.0225); g.add(t1);
    var t2 = mesh(gg, M.plaster); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.0225); g.add(t2);
  }
  if (o.ridge !== false) {                                          /* 浅灰正脊 + 翘端 */
    var rw = o.ridgeW || (w + over * 2 + 0.04);
    g.add(box(rw, 0.055 + (o.big ? 0.015 : 0), 0.085, M.ridgeL, 0, h + 0.028, 0));
    var f1 = box(0.055, 0.09 + (o.big ? 0.03 : 0), 0.075, M.ridgeD, rw / 2 - 0.01, h + 0.085, 0);
    f1.rotation.z = 0.4; g.add(f1);
    var f2 = box(0.055, 0.09 + (o.big ? 0.03 : 0), 0.075, M.ridgeD, -rw / 2 + 0.01, h + 0.085, 0);
    f2.rotation.z = -0.4; g.add(f2);
    if (o.gold) put(g, sph(0.03, M.gold), 0, h + 0.115, 0);
  }
  return g;
}

/* 单坡披顶：披屋/门罩（脊线在群组原点，向 +z 降到 z=d 的檐口） */
function pentRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var pitch = Math.atan2(h, d);
  var slopeLen = Math.sqrt(d * d + h * h) + 0.02;
  var aged = !!o.aged;
  var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch; g.add(sg);
  sg.add(box(w, 0.032, slopeLen, aged ? M.roofOld : M.roof, 0, 0, slopeLen / 2));
  sg.add(box(w - 0.04, 0.016, 0.026, M.ridgeD, 0, 0.024, slopeLen * 0.33));
  sg.add(box(w - 0.04, 0.016, 0.026, M.ridgeD, 0, 0.024, slopeLen * 0.66));
  sg.add(box(w + 0.02, 0.045, 0.022, M.timberD, 0, -0.004, slopeLen));
  var c1 = box(0.06, 0.045, 0.06, M.ridgeD, w / 2 - 0.01, 0.04, slopeLen - 0.02); c1.rotation.z = 0.5; sg.add(c1);
  var c2 = box(0.06, 0.045, 0.06, M.ridgeD, -w / 2 + 0.01, 0.04, slopeLen - 0.02); c2.rotation.z = -0.5; sg.add(c2);
  g.add(tileEndRow(M, w - 0.1, 0.005, d + 0.012, o.ends || 4));
  return g;
}

/* 歇山金饰顶（lv4 顶）：四坡 + 大翘角金钩 + 短正脊 + 金吻 + 金宝珠 */
function sweepRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.82 + 0.2, 0.035, lenF, M.roof, 0, 0, lenF / 2));
  sgF.add(box(w * 0.82 + 0.22, 0.05, 0.022, M.timberD, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.82 + 0.2, 0.035, lenF, M.roofShd, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.035, d * 0.9, M.roofShd, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.035, d * 0.9, M.roofShd, -lenS / 2, 0, 0));
  g.add(tileEndRow(M, w * 0.82 + 0.16, 0.015, eaveF + 0.012, 6));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {     /* 大翘角 + 金钩 */
    var lift = box(0.075, 0.055, 0.075, M.ridgeD, c[0] * (eaveS - 0.02), 0.05, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.62; g.add(lift);
    var hook = box(0.03, 0.075, 0.03, M.gold, c[0] * (eaveS - 0.02), 0.105, c[1] * (eaveF - 0.02));
    hook.rotation.z = -c[0] * 0.5; g.add(hook);
  });
  g.add(box(w * 0.46, 0.06, 0.085, M.ridgeL, 0, h + 0.03, 0));
  var f1 = box(0.055, 0.11, 0.07, M.gold, w * 0.23, h + 0.085, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.055, 0.11, 0.07, M.gold, -w * 0.23, h + 0.085, 0); f2.rotation.z = -0.4; g.add(f2);
  put(g, sph(0.036, M.gold), 0, h + 0.15, 0);
  return g;
}

/* 青布幌雨棚（lv2）：三段帆布向檐前下垂 + 双支撑圆杆（组原点=棚顶后沿） */
function tealAwning(M, w) {
  var g = grp();
  var segs = 3, i;
  for (i = 0; i < segs; i++) {
    var seg = box(w, 0.018, 0.2, i === 1 ? M.canvasD : M.canvas, 0, -i * 0.035, 0.1 + i * 0.18);
    seg.rotation.x = -0.12 + i * 0.12;
    g.add(seg);
  }
  g.add(box(w + 0.03, 0.03, 0.025, M.timberD, 0, 0.005, 0.08));
  g.add(cyl(0.013, 0.015, 0.66, 8, M.timberW, -w / 2 + 0.05, -0.33, 0.4));
  g.add(cyl(0.013, 0.015, 0.66, 8, M.timberW, w / 2 - 0.05, -0.33, 0.4));
  return g;
}

/* 青布阳伞（lv4）：伞杆 + 伞面 + 金顶 */
function parasol(M) {
  var g = grp();
  g.add(cyl(0.012, 0.014, 0.5, 8, M.timberW, 0, 0.25, 0));
  g.add(cone(0.27, 0.13, 10, M.canvas, 0, 0.52, 0));
  g.add(sph(0.018, M.gold, 0, 0.6, 0));
  return g;
}

/* A 形告示牌（lv3）：双斜腿 + 板 + 纸面 */
function noticeBoard(M, x, z) {
  var g = grp();
  var l1 = box(0.03, 0.34, 0.02, M.timberD, 0, 0.16, 0); l1.rotation.x = 0.16; g.add(l1);
  var l2 = box(0.03, 0.34, 0.02, M.timberD, 0, 0.16, 0.06); l2.rotation.x = -0.16; g.add(l2);
  g.add(box(0.22, 0.2, 0.025, M.timber, 0, 0.16, 0.03));
  g.add(box(0.17, 0.15, 0.012, M.glow, 0, 0.16, 0.048));
  g.position.set(x, PADTOP, z);
  return g;
}

/* 盆栽（陶盆 + 绿球） */
function potPlant(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.085 * s, 10, M.clay, 0, 0.042 * s, 0));
  var b = mesh(new THREE.IcosahedronGeometry(0.06 * s, 0), M.grassD); b.position.set(0, 0.115 * s, 0); b.scale.y = 0.85; g.add(b);
  return g;
}

/* 垂藤（lv3/4 栏下悬挂）：两颗绿球叠垂 */
function vineBlob(M, x, y, z) {
  var g = grp();
  var a = mesh(new THREE.IcosahedronGeometry(0.05, 0), M.grassD); a.position.set(0, -0.05, 0); a.scale.set(1.2, 1.1, 0.7);
  var b = mesh(new THREE.IcosahedronGeometry(0.035, 0), M.grass); b.position.set(0.04, -0.13, 0.01); b.scale.set(1, 1.2, 0.7);
  g.add(a); g.add(b);
  g.position.set(x, y, z);
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：老瓦小屋 + 右侧披屋 + 竹丛 + 木桌陶壶（h≈1.02） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(earthPad(M, 2.3, 2.3));
  var y0 = PADTOP;
  /* 台基 + 墙体（穿斗式：抹灰板 + 风化木柱） */
  g.add(box(1.4, 0.07, 1.05, M.stoneD, -0.12, y0 + 0.035, -0.06));
  g.add(box(1.15, 0.46, 0.82, M.plaster, -0.12, y0 + 0.3, -0.06));
  [[-0.67, -0.44], [0.43, -0.44], [-0.67, 0.32], [0.43, 0.32]].forEach(function (c) {
    g.add(box(0.05, 0.46, 0.05, M.timberW, c[0], y0 + 0.3, c[1]));
  });
  g.add(box(1.2, 0.06, 0.05, M.timberW, -0.12, y0 + 0.507, 0.345));
  /* 门（偏左）+ 方格窗（右）+ 山面小窗 */
  var door = woodDoor(M, 0.26, 0.36, y0 + 0.07); put(g, door, -0.4, 0, 0.352);
  var win = latticeWin(M, 0.26, 0.24, { nv: 3, nh: 3 }); put(g, win, 0.14, y0 + 0.32, 0.352);
  var swin = latticeWin(M, 0.2, 0.2, { nv: 2, nh: 2 }); swin.rotation.y = PI / 2; put(g, swin, -0.705, y0 + 0.32, -0.06);
  /* 老瓦坡顶（apex≈0.89+脊≈0.94，翘吻顶 ≈1.02） */
  var roof = tileRoof(M, { w: 1.15, d: 0.88, h: 0.28, strips: 2, ends: 5, aged: true, lift: 0.5 });
  put(g, roof, -0.12, y0 + 0.53, -0.06);
  /* 右侧披屋：双柱 + 横梁 + 披顶 + 条凳 + 陶罐 */
  var shed = grp(); put(g, shed, 0.82, y0 + 0.07, -0.02);
  shed.add(box(0.05, 0.36, 0.05, M.timberW, -0.28, 0.18, 0.3));
  shed.add(box(0.05, 0.36, 0.05, M.timberW, 0.3, 0.18, 0.3));
  shed.add(box(0.68, 0.05, 0.05, M.timberW, 0.01, 0.37, 0.3));
  var pent = pentRoof(M, { w: 0.78, d: 0.66, h: 0.11, aged: true, ends: 4 });
  put(shed, pent, 0.01, 0.4, -0.33);
  shed.add(box(0.3, 0.03, 0.14, M.timber, -0.15, 0.12, -0.05));
  shed.add(box(0.04, 0.1, 0.12, M.timberW, -0.27, 0.055, -0.05));
  shed.add(box(0.04, 0.1, 0.12, M.timberW, -0.03, 0.055, -0.05));
  shed.add(cyl(0.05, 0.06, 0.11, 10, M.clay, 0.22, 0.055, -0.08));
  /* 门侧灯笼（挂于檐枋下） */
  var lt = lantern(M, 0.7, anims, 0.5); put(g, lt, -0.02, y0 + 0.4, 0.4);
  /* 竹丛 ×2（屋后） */
  var b1 = bambooClump(M, 0.42, anims, 1.3); put(g, b1, -0.92, y0, -0.62);
  var b2 = bambooClump(M, 0.36, anims, 2.6); put(g, b2, 0.78, y0, -0.68);
  /* 短篱笆（左前） */
  var i;
  for (i = 0; i < 3; i++) g.add(box(0.035, 0.2, 0.035, M.timberW, -0.98 + i * 0.17, y0 + 0.1, 0.9));
  g.add(box(0.4, 0.024, 0.03, M.timberW, -0.81, y0 + 0.17, 0.9));
  /* 木桌 + 陶壶（右前） */
  g.add(box(0.28, 0.028, 0.17, M.timberW, 0.55, y0 + 0.19, 0.62));
  g.add(box(0.04, 0.17, 0.15, M.timberW, 0.55, y0 + 0.095, 0.62));
  g.add(cyl(0.035, 0.045, 0.08, 10, M.clay, 0.55, y0 + 0.245, 0.62));
  /* 内透光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：两层茶铺 + 青布雨棚 + 侧厢（h≈1.58） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(earthPad(M, 2.5, 2.3));
  var y0 = PADTOP;
  /* 台基 + 一层墙柱 + 二层楼板/墙柱 */
  g.add(box(2.0, 0.08, 1.05, M.stoneD, 0, y0 + 0.04, 0));
  g.add(box(1.9, 0.5, 0.9, M.plaster, 0, y0 + 0.33, 0));
  [[-0.92, -0.42], [0.92, -0.42], [-0.92, 0.42], [0.92, 0.42], [-0.31, 0.42], [0.31, 0.42]].forEach(function (c) {
    g.add(box(0.055, 0.5, 0.055, M.timber, c[0], y0 + 0.33, c[1]));
  });
  g.add(box(1.95, 0.05, 0.95, M.timberD, 0, y0 + 0.605, 0));
  g.add(box(1.78, 0.44, 0.84, M.plaster, 0, y0 + 0.85, 0));
  [[-0.86, -0.39], [0.86, -0.39], [-0.86, 0.39], [0.86, 0.39], [-0.29, 0.39], [0.29, 0.39]].forEach(function (c) {
    g.add(box(0.05, 0.44, 0.05, M.timber, c[0], y0 + 0.85, c[1]));
  });
  /* 底层门脸：木门 + 敞口柜台 + 货担陶罐 */
  var door = woodDoor(M, 0.26, 0.38, y0 + 0.08); put(g, door, -0.85, 0, 0.442);
  g.add(box(1.05, 0.4, 0.04, M.ink, -0.2, y0 + 0.28, 0.44));
  g.add(box(0.95, 0.045, 0.16, M.timberD, -0.2, y0 + 0.17, 0.48));
  g.add(box(0.95, 0.1, 0.03, M.timberD, -0.2, y0 + 0.1, 0.47));
  g.add(cyl(0.035, 0.042, 0.09, 10, M.clay, -0.45, y0 + 0.235, 0.5));
  g.add(cyl(0.04, 0.046, 0.07, 10, M.clay, -0.3, y0 + 0.225, 0.51));
  g.add(box(0.16, 0.1, 0.12, M.timber, 0, y0 + 0.22, 0.5));
  /* 青布幌雨棚（跨深度下垂，组原点=棚顶后沿 z=0.34） */
  var awn = tealAwning(M, 1.15); put(g, awn, -0.2, y0 + 0.62, 0.34);
  /* 二层：方格窗 ×3 + 雕花栏 + 檐下小木匾 */
  var w1 = latticeWin(M, 0.3, 0.26, { nv: 3, nh: 3 }); put(g, w1, -0.58, y0 + 0.85, 0.422);
  var w2 = latticeWin(M, 0.3, 0.26, { nv: 3, nh: 3 }); put(g, w2, 0, y0 + 0.85, 0.422);
  var w3 = latticeWin(M, 0.3, 0.26, { nv: 3, nh: 3 }); put(g, w3, 0.58, y0 + 0.85, 0.422);
  var balc = carvedRail(M, 1.7); put(g, balc, 0, y0 + 0.655, 0.42);
  g.add(box(0.34, 0.1, 0.028, M.timberD, -0.5, y0 + 0.6, 0.61));
  var plq = mesh(new THREE.PlaneGeometry(0.3, 0.075), plaqueMat());
  plq.position.set(-0.5, y0 + 0.6, 0.626); g.add(plq);
  /* 主瓦顶（apex≈1.45+脊≈1.50，翘吻顶 ≈1.58） */
  var main = tileRoof(M, { w: 1.75, d: 1.0, h: 0.3, strips: 3, ends: 6, lift: 0.62 });
  put(g, main, 0, y0 + 1.07, 0);
  /* 侧厢（右）：抹灰间 + 单柱 + 披顶 + 柜面陶罐 */
  g.add(box(0.68, 0.4, 0.9, M.plaster, 0.85, y0 + 0.28, 0.02));
  g.add(box(0.05, 0.4, 0.05, M.timber, 0.85, y0 + 0.28, 0.48));
  var annex = pentRoof(M, { w: 0.76, d: 0.98, h: 0.13, ends: 4 });
  put(g, annex, 0.85, y0 + 0.48, -0.47);
  g.add(box(0.5, 0.04, 0.14, M.timberD, 0.85, y0 + 0.16, 0.5));
  g.add(cyl(0.035, 0.042, 0.08, 10, M.clay, 0.72, y0 + 0.22, 0.52));
  /* 灯笼 ×2（檐角） */
  var l1 = lantern(M, 0.62, anims, 0.9); put(g, l1, -1.02, y0 + 0.94, 0.5);
  var l2 = lantern(M, 0.62, anims, 2.2); put(g, l2, 1.02, y0 + 0.94, 0.5);
  /* 竹丛 + 盆栽 */
  var b1 = bambooClump(M, 0.52, anims, 1.1); put(g, b1, -1.08, y0, -0.5);
  var b2 = bambooClump(M, 0.46, anims, 2.9); put(g, b2, 1.12, y0, -0.62);
  var p1 = potPlant(M, 1); put(g, p1, 1.18, y0, 0.66);
  var p2 = potPlant(M, 0.85); put(g, p2, -1.2, y0, -0.15);
  /* 内透光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.15 + 0.5); });
  return g;
}

/* ---- lv3 大厦：三层退台木构 + 门罩 + 匾额 + 瓦顶院墙 + 告示牌（h≈2.05） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(earthPad(M, 2.5, 2.35));
  var y0 = PADTOP;
  var fx = -0.38;
  /* 台基 + 三层退台（逐层收小） */
  g.add(box(1.7, 0.09, 1.0, M.stoneD, fx, y0 + 0.045, 0));
  g.add(box(1.55, 0.44, 0.9, M.plaster, fx, y0 + 0.31, 0));
  [[-0.74, -0.42], [0.74, -0.42], [-0.74, 0.42], [0.74, 0.42]].forEach(function (c) {
    g.add(box(0.05, 0.44, 0.05, M.timber, fx + c[0], y0 + 0.31, c[1]));
  });
  g.add(box(1.6, 0.045, 0.94, M.timberD, fx, y0 + 0.552, 0));
  g.add(box(1.48, 0.42, 0.84, M.plaster, fx, y0 + 0.785, -0.01));
  g.add(box(1.44, 0.045, 0.88, M.timberD, fx, y0 + 1.04, -0.02));
  g.add(box(1.3, 0.4, 0.78, M.plaster, fx, y0 + 1.262, -0.03));
  /* 一层门脸：门罩坡顶 + 双柱 + 门 + 窗 + 石阶 */
  var porch = pentRoof(M, { w: 1.3, d: 0.58, h: 0.16, ends: 5 });
  put(g, porch, fx, y0 + 0.55, -0.1);
  g.add(cyl(0.028, 0.032, 0.46, 10, M.timber, fx - 0.5, y0 + 0.32, 0.46));
  g.add(cyl(0.028, 0.032, 0.46, 10, M.timber, fx + 0.5, y0 + 0.32, 0.46));
  var door = woodDoor(M, 0.28, 0.4, y0 + 0.09); put(g, door, fx - 0.18, 0, 0.45);
  var wf1 = latticeWin(M, 0.22, 0.2, { nv: 2, nh: 2 }); put(g, wf1, fx + 0.42, y0 + 0.32, 0.445);
  g.add(box(0.5, 0.035, 0.22, M.stoneD, fx - 0.18, y0 + 0.02, 0.58));
  /* 二层：雕花栏 + 方格窗 ×3 */
  var b2 = carvedRail(M, 1.45); put(g, b2, fx, y0 + 0.6, 0.47);
  var w21 = latticeWin(M, 0.28, 0.24, { nv: 3, nh: 3 }); put(g, w21, fx - 0.5, y0 + 0.8, 0.415);
  var w22 = latticeWin(M, 0.28, 0.24, { nv: 3, nh: 3 }); put(g, w22, fx, y0 + 0.8, 0.415);
  var w23 = latticeWin(M, 0.28, 0.24, { nv: 3, nh: 3 }); put(g, w23, fx + 0.5, y0 + 0.8, 0.415);
  /* 三层：雕花栏 + 方格窗 ×2 */
  var b3 = carvedRail(M, 1.26); put(g, b3, fx, y0 + 1.085, 0.42);
  var w31 = latticeWin(M, 0.26, 0.22, { nv: 3, nh: 3 }); put(g, w31, fx - 0.28, y0 + 1.28, 0.375);
  var w32 = latticeWin(M, 0.26, 0.22, { nv: 3, nh: 3 }); put(g, w32, fx + 0.28, y0 + 1.28, 0.375);
  /* 垂藤（栏下） */
  g.add(vineBlob(M, fx - 0.6, y0 + 0.58, 0.5));
  g.add(vineBlob(M, fx + 0.55, y0 + 0.58, 0.5));
  g.add(vineBlob(M, fx + 0.3, y0 + 1.07, 0.45));
  /* 主瓦顶（apex≈1.90+脊≈1.95，翘吻顶 ≈2.05） */
  var main = tileRoof(M, { w: 1.34, d: 0.96, h: 0.36, strips: 3, ends: 6, lift: 0.72, big: true });
  put(g, main, fx, y0 + 1.462, -0.03);
  /* 匾额「宽窄巷子」（门罩下） */
  g.add(box(0.5, 0.12, 0.03, M.timberD, fx, y0 + 0.47, 0.44));
  var plq = mesh(new THREE.PlaneGeometry(0.44, 0.11), plaqueMat());
  plq.position.set(fx, y0 + 0.47, 0.457); g.add(plq);
  /* 灯笼 ×4：门罩下 ×2 + 二层栏端 ×2 */
  var l1 = lantern(M, 0.56, anims, 0.6); put(g, l1, fx - 0.62, y0 + 0.44, 0.52);
  var l2 = lantern(M, 0.56, anims, 1.9); put(g, l2, fx + 0.62, y0 + 0.44, 0.52);
  var l3 = lantern(M, 0.52, anims, 2.8); put(g, l3, fx - 0.74, y0 + 0.4, 0.5);
  var l4 = lantern(M, 0.52, anims, 4.1); put(g, l4, fx + 0.74, y0 + 0.4, 0.5);
  /* 瓦顶院墙（右侧 L 形） */
  g.add(box(0.1, 0.05, 0.9, M.stoneD, 1.02, y0 + 0.025, 0.05));
  g.add(box(0.07, 0.26, 0.9, M.plaster, 1.02, y0 + 0.18, 0.05));
  g.add(wallCoping(M, 0.92, 1.02, y0 + 0.31, 0.05, PI / 2, 6));
  g.add(box(0.62, 0.05, 0.1, M.stoneD, 0.82, y0 + 0.025, 0.6));
  g.add(box(0.62, 0.24, 0.07, M.plaster, 0.82, y0 + 0.17, 0.6));
  g.add(wallCoping(M, 0.64, 0.82, y0 + 0.29, 0.6, PI / 2, 4));
  /* A 形告示牌 + 竹丛 + 盆栽 */
  g.add(noticeBoard(M, 0.42, 0.98));
  var b1 = bambooClump(M, 0.72, anims, 1.2); put(g, b1, -1.06, y0, -0.55);
  var b2c = bambooClump(M, 0.6, anims, 3.1); put(g, b2c, 1.14, y0, -0.7);
  var p1 = potPlant(M, 0.95); put(g, p1, -1.12, y0, 0.72);
  var p2 = potPlant(M, 0.8); put(g, p2, 1.14, y0, -0.2);
  /* 内透光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.2 + 0.9); });
  return g;
}

/* ---- lv4 地标：石台基石狮 + 门屋 + 两层环廊 + 金饰歇山 + 青伞 + 挂瓦院墙（h≈2.46） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(earthPad(M, 2.55, 2.5));
  var y0 = PADTOP;
  /* 石台基 + 垂带踏步 + 石狮一对 */
  g.add(box(2.16, 0.05, 1.6, M.stoneD, 0, y0 + 0.025, -0.02));
  g.add(box(2.1, 0.16, 1.55, M.stone, 0, y0 + 0.13, -0.02));
  g.add(box(0.66, 0.055, 0.2, M.stoneD, 0, y0 + 0.19, 0.86));
  g.add(box(0.54, 0.05, 0.18, M.stoneD, 0, y0 + 0.245, 0.74));
  put(g, stoneLion(M, 1.2), -0.56, y0 + 0.21, 0.62);
  put(g, stoneLion(M, 1.2), 0.56, y0 + 0.21, 0.62);
  /* 一层堂：抹灰墙柱 + 门屋（双门扇 + 匾额）+ 门屋坡顶 */
  g.add(box(1.3, 0.72, 0.9, M.plaster, 0, y0 + 0.57, -0.08));
  [[-0.62, -0.42], [0.62, -0.42], [-0.62, 0.4], [0.62, 0.4]].forEach(function (c) {
    g.add(box(0.055, 0.72, 0.055, M.timber, c[0], y0 + 0.57, c[1]));
  });
  g.add(cyl(0.03, 0.034, 0.62, 10, M.timber, -0.42, y0 + 0.52, 0.5));
  g.add(cyl(0.03, 0.034, 0.62, 10, M.timber, 0.42, y0 + 0.52, 0.5));
  g.add(box(0.3, 0.46, 0.045, M.timberD, -0.155, y0 + 0.44, 0.5));
  g.add(box(0.3, 0.46, 0.045, M.timberD, 0.155, y0 + 0.44, 0.5));
  g.add(box(0.86, 0.08, 0.06, M.timberD, 0, y0 + 0.71, 0.51));
  g.add(box(0.58, 0.13, 0.03, M.timberD, 0, y0 + 0.79, 0.51));
  var plq = mesh(new THREE.PlaneGeometry(0.52, 0.115), plaqueMat());
  plq.position.set(0, y0 + 0.79, 0.527); g.add(plq);
  var gRoof = tileRoof(M, { w: 1.15, d: 0.6, h: 0.16, strips: 2, ends: 5, gable: false, lift: 0.66 });
  put(g, gRoof, 0, y0 + 0.83, 0.2);
  /* 二层环廊：雕花栏 + 青布垂幔 + 方格窗 ×3 + 灯笼 ×2 + 垂藤 */
  g.add(box(1.5, 0.045, 0.92, M.timberD, 0, y0 + 0.975, -0.04));
  g.add(box(1.4, 0.44, 0.86, M.plaster, 0, y0 + 1.22, -0.05));
  var b2 = carvedRail(M, 1.44); put(g, b2, 0, y0 + 1.0, 0.4);
  [-0.4, 0, 0.4].forEach(function (x, i) {
    var v = box(0.15, 0.1, 0.02, i % 2 ? M.canvasD : M.canvas, x, y0 + 0.93, 0.46);
    v.rotation.z = (i - 1) * 0.06; g.add(v);
  });
  var w21 = latticeWin(M, 0.28, 0.24, { nv: 3, nh: 3 }); put(g, w21, -0.48, y0 + 1.2, 0.385);
  var w22 = latticeWin(M, 0.28, 0.24, { nv: 3, nh: 3 }); put(g, w22, 0, y0 + 1.2, 0.385);
  var w23 = latticeWin(M, 0.28, 0.24, { nv: 3, nh: 3 }); put(g, w23, 0.48, y0 + 1.2, 0.385);
  var l3a = lantern(M, 0.52, anims, 0.8); put(g, l3a, -0.8, y0 + 0.9, 0.46);
  var l3b = lantern(M, 0.52, anims, 2.4); put(g, l3b, 0.8, y0 + 0.9, 0.46);
  g.add(vineBlob(M, -0.62, y0 + 0.96, 0.44));
  g.add(vineBlob(M, 0.62, y0 + 0.96, 0.44));
  /* 三层环廊：雕花栏 + 方格窗 ×2 + 灯笼 ×2 */
  g.add(box(1.34, 0.045, 0.84, M.timberD, 0, y0 + 1.445, -0.06));
  g.add(box(1.22, 0.4, 0.76, M.plaster, 0, y0 + 1.668, -0.07));
  var b3 = carvedRail(M, 1.18); put(g, b3, 0, y0 + 1.47, 0.36);
  var w31 = latticeWin(M, 0.26, 0.22, { nv: 3, nh: 3 }); put(g, w31, -0.28, y0 + 1.66, 0.325);
  var w32 = latticeWin(M, 0.26, 0.22, { nv: 3, nh: 3 }); put(g, w32, 0.28, y0 + 1.66, 0.325);
  var l4a = lantern(M, 0.5, anims, 3.6); put(g, l4a, -0.68, y0 + 1.34, 0.42);
  var l4b = lantern(M, 0.5, anims, 5.0); put(g, l4b, 0.68, y0 + 1.34, 0.42);
  /* 金饰歇山顶（apex≈2.23+脊/宝珠 ≈2.46） */
  var top = sweepRoof(M, { w: 1.18, d: 0.88, h: 0.36 });
  put(g, top, 0, y0 + 1.868, -0.07);
  /* 门口灯笼 ×2（挂于门屋坡顶檐下） */
  var l1 = lantern(M, 0.64, anims, 0.3); put(g, l1, -0.62, y0 + 0.72, 0.55);
  var l2 = lantern(M, 0.64, anims, 1.6); put(g, l2, 0.62, y0 + 0.72, 0.55);
  /* 挂瓦院墙（右 + 前回抱）+ 墙上石镜 */
  g.add(box(0.1, 0.05, 1.05, M.stoneD, 1.06, y0 + 0.025, 0.16));
  g.add(box(0.07, 0.28, 1.05, M.plaster, 1.06, y0 + 0.19, 0.16));
  g.add(wallCoping(M, 1.07, 1.06, y0 + 0.33, 0.16, PI / 2, 7));
  g.add(box(0.56, 0.05, 0.1, M.stoneD, 0.87, y0 + 0.025, 0.92));
  g.add(box(0.56, 0.26, 0.07, M.plaster, 0.87, y0 + 0.18, 0.92));
  g.add(wallCoping(M, 0.58, 0.87, y0 + 0.31, 0.92, PI / 2, 4));
  var mir = cyl(0.062, 0.062, 0.02, 12, M.stoneD, 0.87, y0 + 0.18, 0.958); mir.rotation.x = PI / 2; g.add(mir);
  /* 青布阳伞（右墙台上，呼应 lv2 雨棚） */
  var um = parasol(M); put(g, um, 1.02, y0 + 0.36, 0.5);
  /* 盆竹 ×2 */
  [[-1.05, 0.92, 1.2], [0.94, -0.45, 2.6]].forEach(function (p) {
    g.add(cyl(0.055, 0.068, 0.09, 10, M.clay, p[0], y0 + 0.045, p[1]));
    var bc = bambooClump(M, 0.42, anims, p[2]);
    bc.position.set(p[0], y0 + 0.08, p[1]);
    g.add(bc);
  });
  /* 内透光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.05 + 1.3); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[16] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_16_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 16;
  g.userData.level = lv;
  g.userData.region = 'g4';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
