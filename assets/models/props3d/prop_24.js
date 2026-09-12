/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_24.js
 * -------------------------------------------------------------------------------------
 * 格 24「断桥烟雨」(g5 江南烟雨) 独属建筑：西湖烟雨园林水景四阶生长史
 * 参考图 refs/prop_24.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop24/）。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   原木水乡小筑 + 木板瓦垄顶 + 木栈桥 + 迷你水亭（h≈1.07）
 *   lv2 洋房   白墙黛瓦两层楼阁 + 木栏杆阳台 + 青白条纹布幌店口 + 石拱断桥（h≈1.63）
 *   lv3 大厦   三层楼阁起层 + 层层腰檐 + 灯串 + 木匾「断桥烟雨」+ 双层檐水亭（h≈2.06）
 *   lv4 地标   四重飞檐湖畔地标 + 鎏金匾额宝顶 + 灯笼成对 + 青幌廊街 + 烟雨迷雾（h≈2.7）
 *
 * 独有语汇（自参考图逐区采样提炼，见 evidence_prop24/palette24b_c 记录）：
 *   白灰墙（#e8e2d0）+ 炭青瓦（#4a4c54）翘角披檐 + 暖木廊柱（#9c6a3f）+ 橙红灯笼
 *   （#df7c29 金盖）+ 湖青水面（#58b3a2→#7bcab6 涟漪）+ 石拱断桥（#b0a98d 栏板）
 *   + 水中六角亭（石台金顶）+ 垂柳睡莲 + lv4 鎏金饰（#d9a842）与烟雨雾片。
 *   与 prop_3（灰砖胡同）/prop_6（红砖洋楼）/prop_9（骑楼）无共享立面语汇。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[24] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_24] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 基元（blockout 层：颜色 / 材质 / helper） ================= */
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
  if (o.opaque === false) { m.transparent = true; m.opacity = (o.opacity !== undefined ? o.opacity : 0.16); m.depthWrite = false; }
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

/* ================= 1. 程序化 Canvas 纹理（form/material 层，≤256px） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 炭青瓦垄：横向垄线 + 竖向接头错缝 + 陶面噪点（参考图 #494849 均值） */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#4a4c54'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#54565f' : '#464852';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#2e3036'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#5e616c'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(34,36,42,0.55)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(18,20,26,0.08)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* lv1 杉木皮瓦：长条木板纹（参考图暖草黄 #f3cc8f/#d9a860） */
function texShake() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#d9a860'; g.fillRect(0, 0, S, S);
  var cols = 8, cw = S / cols, i;
  for (i = 0; i < cols; i++) {
    var x = i * cw;
    g.fillStyle = (i % 2) ? '#cf9c55' : '#e0b26c';
    g.fillRect(x, 0, cw, S);
    g.fillStyle = '#8a6236'; g.fillRect(x, 0, 2, S);
    g.fillStyle = 'rgba(138,98,54,0.5)';
    g.fillRect(x + 3 + (i * 13) % 8, 0, 2, S);
  }
  for (i = 0; i < 26; i++) {                              /* 横向风雨痕 */
    g.fillStyle = 'rgba(120,88,44,' + (0.08 + (i % 3) * 0.05) + ')';
    g.fillRect(0, (i * 19) % S, S, 2 + (i % 2));
  }
  return toTex(cv, true);
}
/* 原木墙：横圆木叠缝（lv1） */
function texLog() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#a97e4a'; g.fillRect(0, 0, S, S);
  var rows = 7, rh = S / rows, i;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#b2854f' : '#a1784a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#6f4e28'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = 'rgba(255,235,200,0.18)'; g.fillRect(0, y + 2, S, 3);
  }
  for (i = 0; i < 60; i++) {
    g.fillStyle = (i % 2) ? 'rgba(90,62,32,0.10)' : 'rgba(255,240,210,0.06)';
    g.fillRect((i * 31) % S, (i * 47) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 白灰墙：暖白抹灰细噪（参考图 #d5cbb4 阴影面） */
function texPlaster() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e8e2d0'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.07)' : 'rgba(140,128,100,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 石板路：大块不规则石板 + 深缝（参考图 #afa685/#a6a887） */
function texPath() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b0a98d'; g.fillRect(0, 0, S, S);
  var rows = 5, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillStyle = ((i + k) % 2) ? '#aaa387' : '#b6b095';
      g.fillRect(x + 1, y + 1, S / 3 - 3, rh - 3);
    }
  }
  g.fillStyle = 'rgba(90,84,64,0.55)';
  for (i = 0; i <= rows; i++) g.fillRect(0, i * rh - 1, S, 2);
  for (i = 0; i < 40; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(100,92,70,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 湖水：青绿底 + 横向波光（参考图 #4fa38d→#7bcab6），动画滚动 */
function texWater() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#58b3a2'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 14; i++) {
    g.fillStyle = i % 3 ? 'rgba(123,202,182,0.5)' : 'rgba(79,163,141,0.6)';
    g.fillRect(0, (i * 9 + 3) % S, S, 3 + (i % 2) * 2);
  }
  for (i = 0; i < 26; i++) {
    g.fillStyle = 'rgba(210,244,236,0.16)';
    g.fillRect((i * 43) % S, (i * 29) % S, 8 + (i % 3) * 5, 2);
  }
  return toTex(cv, true);
}
/* 青白条纹布幌（lv2/lv4 店口，参考图浅青条纹） */
function texAwning() {
  var w = 128, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#eef4ef'; g.fillRect(0, 0, w, h);
  for (var i = 0; i < 8; i++) {
    g.fillStyle = '#8ecfc6';
    g.fillRect(i * 16, 0, 8, h);
  }
  g.fillStyle = 'rgba(120,180,172,0.35)';
  g.fillRect(0, h - 8, w, 8);
  return toTex(cv, true);
}
/* 木匾「断桥烟雨」：深漆金边金字（lv3） */
function texPlaqueD() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#33240f'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 38px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('断桥烟雨', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
/* 鎏金匾「断桥烟雨」：金底黑字（lv4，参考图 lv4 金匾） */
function texPlaqueG() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#c79a3e'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,240,190,0.4)'; g.fillRect(0, 0, w, 8);
  g.strokeStyle = '#6e4f1c'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#3a2a12'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 38px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('断桥烟雨', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图逐区采样） */
function Mats() {
  return {
    roofLit:   MAT('p24roofLit', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.66 }); }),
    roofShd:   MAT('p24roofShd', function () { var t = getTex('tile', texTile); return std('#9aa1ad', { map: t, bump: t, bumpScale: 0.014, rough: 0.72 }); }),
    ridge:     MAT('p24ridge', function () { return std('#2e3036', { rough: 0.8 }); }),
    shakeLit:  MAT('p24shkLit', function () { var t = getTex('shake', texShake); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.74 }); }),
    shakeShd:  MAT('p24shkShd', function () { var t = getTex('shake', texShake); return std('#c9a06a', { map: t, rough: 0.78 }); }),
    log:       MAT('p24log', function () { var t = getTex('log', texLog); return std('#ffffff', { map: t, rough: 0.8 }); }),
    logEnd:    MAT('p24logEnd', function () { return std('#b2854f', { rough: 0.8 }); }),
    plaster:   MAT('p24plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    timber:    MAT('p24timber', function () { return std('#9c6a3f', { rough: 0.7 }); }),
    timberD:   MAT('p24timberD', function () { return std('#6f4a2a', { rough: 0.78 }); }),
    stone:     MAT('p24stone', function () { return std('#b0a98d', { rough: 0.9 }); }),
    stoneD:    MAT('p24stoneD', function () { return std('#8f8a74', { rough: 0.92 }); }),
    embank:    MAT('p24embank', function () { return std('#8d9881', { rough: 0.92 }); }),
    path:      MAT('p24path', function () { var t = getTex('path', texPath); return std('#ffffff', { map: t, rough: 0.95 }); }),
    water:     MAT('p24water', function () { var t = getTex('water', texWater); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return std('#ffffff', { map: t, rough: 0.35, metal: 0.05, emissive: '#2a8a7a', ei: 0.18 }); }),
    ripple:    MAT('p24ripple', function () { return std('#d9f2ea', { rough: 0.4, opaque: false, opacity: 0.4, emissive: '#8fd8c8', ei: 0.4 }); }),
    grass:     MAT('p24grass', function () { return std('#8a9a5c', { rough: 0.95 }); }),
    grassD:    MAT('p24grassD', function () { return std('#76874c', { rough: 0.95 }); }),
    willow:    MAT('p24willow', function () { return std('#7f9c4a', { rough: 0.95 }); }),
    willowD:   MAT('p24willowD', function () { return std('#6d8a3e', { rough: 0.95 }); }),
    lily:      MAT('p24lily', function () { return std('#5da96b', { rough: 0.9 }); }),
    rock:      MAT('p24rock', function () { return std('#9aa093', { rough: 0.92 }); }),
    lantern:   MAT('p24lant', function () { return std('#df7c29', { rough: 0.5, emissive: '#ff8a3c', ei: 0.55 }); }),
    gold:      MAT('p24gold', function () { return std('#d9a842', { rough: 0.35, metal: 0.75 }); }),
    awning:    MAT('p24awning', function () { var t = getTex('awning', texAwning); return std('#ffffff', { map: t, rough: 0.8 }); }),
    paper:     MAT('p24paper', function () { return std('#f2ead6', { rough: 0.9, emissive: '#ffd98a', ei: 0.16 }); }),
    ink:       MAT('p24ink', function () { return std('#2a2d31', { rough: 0.8 }); }),
    clay:      MAT('p24clay', function () { return std('#8a6a4a', { rough: 0.85 }); }),
    mist:      MAT('p24mist', function () { return std('#ffffff', { rough: 1, opaque: false, opacity: 0.14, flat: false }); })
  };
}

/* ================= 2. 预制件（风格独有语汇：structure→form 层） ================= */

/* 木格窗：木框 + 暖纸 + 十字棂（4 mesh） */
function latticeWindow(M, w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.032, M.timberD));
  g.add(box(w, h, 0.03, M.paper, 0, 0, 0.004));
  g.add(box(0.028, h, 0.036, M.timber, 0, 0, 0.008));
  g.add(box(w, 0.024, 0.036, M.timber, 0, 0, 0.008));
  return g;
}

/* 橙红灯笼：金盖金底 + 橙壳 + 穗（参考图 #df7c29），摇曳 + 呼吸 */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p24lantB' + (phase || 0), function () { return std('#df7c29', { rough: 0.5, emissive: '#ff8a3c', ei: 0.55 }); });
  g.add(cyl(0.006 * s, 0.006 * s, 0.14 * s, 10, M.timberD, 0, 0.19 * s, 0));
  g.add(cyl(0.034 * s, 0.046 * s, 0.032 * s, 10, M.gold, 0, 0.108 * s, 0));
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.046 * s, 0.034 * s, 0.032 * s, 10, M.gold, 0, -0.1 * s, 0));
  g.add(cyl(0.007 * s, 0.007 * s, 0.07 * s, 10, M.timberD, 0, -0.155 * s, 0));
  var sw = grp(); sw.add(g);
  anims.push(function (t) {
    sw.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.07;
    bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0) * 1.7);
  });
  return sw;
}

/* 垂柳：曲干 + 垂枝冠（2~5 mesh） */
function willowTree(M, s) {
  var g = grp(); s = s || 1;
  var trunk = cyl(0.024 * s, 0.042 * s, 0.3 * s, 10, M.timberD, 0, 0.15 * s, 0);
  trunk.rotation.z = 0.1; g.add(trunk);
  var top = sph(0.15 * s, M.willow, 0.02 * s, 0.36 * s, 0); top.scale.set(1.25, 0.72, 1.25); g.add(top);
  var d1 = sph(0.08 * s, M.willowD, 0.14 * s, 0.24 * s, 0.03 * s); d1.scale.set(0.55, 1.5, 0.55); g.add(d1);
  var d2 = sph(0.07 * s, M.willowD, -0.1 * s, 0.22 * s, -0.03 * s); d2.scale.set(0.55, 1.4, 0.55); g.add(d2);
  return g;
}

/* 湖心石台六角水亭：石台 + 六柱 + 六面栏杆 +（双层）攒尖瓦顶 + 金顶（断桥烟雨地标件） */
function waterPavilion(M, o) {
  o = o || {};
  var s = o.s || 1, anims = o.anims, phase = o.phase || 0;
  var g = grp();
  var deckY = 0.3 * s;
  /* 石台 + 水中墩 */
  g.add(box(0.56 * s, 0.2 * s, 0.5 * s, M.stoneD, 0, 0.12 * s, 0));
  g.add(box(0.62 * s, 0.055 * s, 0.56 * s, M.stone, 0, 0.245 * s, 0));
  g.add(box(0.66 * s, 0.028 * s, 0.6 * s, M.stoneD, 0, 0.285 * s, 0));
  /* 六柱（六角布置） */
  var i;
  for (i = 0; i < 6; i++) {
    var a = i * PI / 3 + PI / 6;
    g.add(cyl(0.02 * s, 0.023 * s, 0.3 * s, 10, M.timber,
      cos(a) * 0.21 * s, deckY + 0.15 * s, sin(a) * 0.21 * s));
  }
  /* 六面栏杆（坐凳楣 + 栏条） */
  for (i = 0; i < 6; i++) {
    var a2 = i * PI / 3;
    var px = cos(a2 + PI / 6) * 0.21 * s, pz = sin(a2 + PI / 6) * 0.21 * s;
    var panel = box(0.2 * s, 0.085 * s, 0.018 * s, M.timberD, px, deckY + 0.06 * s, pz);
    panel.rotation.y = -a2; g.add(panel);
    var rail = box(0.21 * s, 0.02 * s, 0.022 * s, M.timber, px, deckY + 0.115 * s, pz);
    rail.rotation.y = -a2; g.add(rail);
  }
  /* 攒尖瓦顶（单层 lv1-2 / 双层 lv3-4）+ 六角翘钩 */
  var roofM = MAT('p24pavRoof', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.68 }); });
  var baseY = deckY + 0.3 * s;
  var cone1 = mesh(new THREE.ConeGeometry(0.36 * s, 0.16 * s, 6), roofM);
  put(g, cone1, 0, baseY + 0.08 * s, 0, PI / 6);
  for (i = 0; i < 6; i++) {
    var a3 = i * PI / 3 + PI / 6;
    var hook = box(0.035 * s, 0.022 * s, 0.022 * s, M.ridge,
      cos(a3) * 0.33 * s, baseY + 0.015 * s, sin(a3) * 0.33 * s);
    hook.rotation.y = -a3; hook.rotation.z = 0.5; g.add(hook);
  }
  if (o.double) {
    var neck = cyl(0.05 * s, 0.07 * s, 0.05 * s, 10, M.timberD, 0, baseY + 0.18 * s, 0);
    g.add(neck);
    var cone2 = mesh(new THREE.ConeGeometry(0.24 * s, 0.15 * s, 6), roofM);
    put(g, cone2, 0, baseY + 0.28 * s, 0, PI / 6);
    var ball = sph(0.032 * s, M.gold, 0, baseY + 0.375 * s, 0); g.add(ball);
    var tipH = baseY + 0.41 * s;
  } else {
    var ball2 = sph(0.028 * s, M.gold, 0, baseY + 0.175 * s, 0); g.add(ball2);
    var tipH = baseY + 0.21 * s;
  }
  /* 亭柱间暖光呼吸（悬于顶下小球灯） */
  if (anims) {
    var glowM = MAT('p24pavGlow' + phase, function () { return std('#ffca7a', { rough: 0.6, emissive: '#ffb45a', ei: 0.35 }); });
    var bulb = sph(0.026 * s, glowM, 0, deckY + 0.2 * s, 0); g.add(bulb);
    anims.push(function (t) { glowM.emissiveIntensity = 0.35 + 0.12 * sin(t * 1.6 + phase * 2); });
  }
  return g;
}

/* 石拱断桥：半圆卷洞 + 拱顶石阶 + 两侧栏板望柱（参考图桥头件，lv2+） */
function stoneBridge(M, o) {
  o = o || {};
  var s = o.s || 1, anims = o.anims || null, phase = o.phase || 0;
  var g = grp();
  var half = new THREE.CylinderGeometry(0.27 * s, 0.27 * s, 0.4 * s, 14, 1, false, 0, PI);
  half.rotateX(PI / 2); half.rotateZ(-PI / 2);        /* 平顶朝上、弧腹朝下，桥宽沿 Z */
  var barrel = mesh(half, M.stone);
  barrel.position.set(0, 0.34 * s, 0); g.add(barrel);
  /* 两端碉石（桥台） */
  g.add(box(0.14 * s, 0.2 * s, 0.42 * s, M.stoneD, -0.36 * s, 0.16 * s, 0));
  g.add(box(0.14 * s, 0.2 * s, 0.42 * s, M.stoneD, 0.36 * s, 0.16 * s, 0));
  /* 桥面石阶：中央平 + 两端下坡 */
  g.add(box(0.3 * s, 0.04 * s, 0.46 * s, M.path, 0, 0.355 * s, 0));
  var r1 = box(0.22 * s, 0.035 * s, 0.46 * s, M.path, -0.28 * s, 0.315 * s, 0);
  r1.rotation.z = 0.3; g.add(r1);
  var r2 = box(0.22 * s, 0.035 * s, 0.46 * s, M.path, 0.28 * s, 0.315 * s, 0);
  r2.rotation.z = -0.3; g.add(r2);
  var r3 = box(0.16 * s, 0.03 * s, 0.44 * s, M.path, -0.45 * s, 0.22 * s, 0);
  r3.rotation.z = 0.55; g.add(r3);
  var r4 = box(0.16 * s, 0.03 * s, 0.44 * s, M.path, 0.45 * s, 0.22 * s, 0);
  r4.rotation.z = -0.55; g.add(r4);
  /* 栏板 + 望柱（每侧 3 柱） */
  var i;
  for (i = -1; i <= 1; i += 2) {
    var zb = i * 0.225 * s;
    var wall = box(0.62 * s, 0.055 * s, 0.025 * s, M.stone, 0, 0.4 * s, zb);
    g.add(wall);
    for (var k = -1; k <= 1; k++) {
      g.add(box(0.035 * s, 0.1 * s, 0.03 * s, M.stoneD, k * 0.29 * s, 0.415 * s, zb));
    }
    g.add(box(0.66 * s, 0.022 * s, 0.032 * s, M.stone, 0, 0.472 * s, zb));
  }
  return g;
}

/* 木栈桥（lv1 初创）：木梁 + 横板 + 双柱扶手 */
function woodBridge(M) {
  var g = grp();
  g.add(box(0.1, 0.14, 0.4, M.stoneD, -0.5, 0.1, 0));
  g.add(box(0.1, 0.14, 0.4, M.stoneD, 0.5, 0.1, 0));
  var i;
  for (i = -1; i <= 1; i += 2) {
    g.add(box(0.92, 0.03, 0.05, M.timberD, 0, 0.19, i * 0.17));
    g.add(box(0.03, 0.14, 0.04, M.timberD, -0.4, 0.25, i * 0.17));
    g.add(box(0.03, 0.14, 0.04, M.timberD, 0.4, 0.25, i * 0.17));
    g.add(box(0.86, 0.026, 0.032, M.timber, 0, 0.33, i * 0.17));
  }
  for (i = 0; i < 7; i++) {
    g.add(box(0.1, 0.022, 0.42, M.timber, -0.42 + i * 0.14, 0.215, 0));
  }
  return g;
}

/* 白墙黛瓦双坡披檐（迎光亮/背光暗）+ 黑瓦正脊 + 端头翘吻 + 檐角起翘 + 木色封檐板 */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.11;
  var g = grp(), i, k;
  var lit = o.shake ? M.shakeLit : M.roofLit;
  var shd = o.shake ? M.shakeShd : M.roofShd;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, k > 0 ? lit : shd, 0, 0, k * slopeLen / 2));
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.timberD, 0, -0.004, k * eave));
    var c1 = box(0.07, 0.05, 0.07, M.ridge, (w + over * 2) / 2 - 0.01, 0.05, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ridge, -(w + over * 2) / 2 + 0.01, 0.05, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
  }
  if (o.gable !== false) {                                    /* 山墙封板（白灰/木皮） */
    var gm = o.shake ? M.shakeLit : M.plaster;
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
    var t1 = mesh(gg, gm); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.0225); g.add(t1);
    var t2 = mesh(gg, gm); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.0225); g.add(t2);
  }
  if (o.shake) {                                              /* lv1 圆木正脊 */
    var rl = (w + over * 2 + 0.06);
    var lg = mesh(new THREE.CylinderGeometry(0.045, 0.045, rl, 10), M.logEnd);
    lg.rotation.z = PI / 2; lg.position.set(0, h + 0.045, 0); g.add(lg);
    g.add(sph(0.048, M.logEnd, -rl / 2, h + 0.045, 0));
    g.add(sph(0.048, M.logEnd, rl / 2, h + 0.045, 0));
  } else if (o.ridge !== false) {                             /* 黑瓦正脊 + 端头翘吻 */
    var rw = o.ridgeW || (w + over * 2 + 0.04);
    g.add(box(rw, 0.06 + (o.big ? 0.02 : 0), 0.09, M.ridge, 0, h + 0.03, 0));
    var hh = o.big ? 0.13 : 0.09, hy = o.big ? 0.1 : 0.08;
    var f1 = box(0.055, hh, 0.075, M.ridge, rw / 2 - 0.008, h + hy, 0);
    f1.rotation.z = 0.45; g.add(f1);
    var f2 = box(0.055, hh, 0.075, M.ridge, -rw / 2 + 0.008, h + hy, 0);
    f2.rotation.z = -0.45; g.add(f2);
    if (o.big) put(g, sph(0.03, M.gold), 0, h + 0.12, 0);
  }
  return g;
}

/* 腰檐环（lv3/lv4 层间披檐）：四坡浅檐 + 四角翘钩（lifts=false 省 4 mesh） */
function eaveRing(M, w, d, rise, lifts) {
  var g = grp();
  var ow = 0.14, slope = Math.sqrt(rise * rise + ow * ow) + 0.01;
  var angW = Math.atan2(rise, ow);
  var f1 = box(w + ow * 2, 0.03, slope, M.roofLit, 0, rise / 2, d / 2 + ow / 2);
  f1.rotation.x = angW; g.add(f1);
  var f2 = box(w + ow * 2, 0.03, slope, M.roofShd, 0, rise / 2, -d / 2 - ow / 2);
  f2.rotation.x = -angW; g.add(f2);
  var s1 = box(slope, 0.03, d * 0.7, M.roofShd, w / 2 + ow / 2, rise / 2, 0);
  s1.rotation.z = -angW; g.add(s1);
  var s2 = box(slope, 0.03, d * 0.7, M.roofShd, -w / 2 - ow / 2, rise / 2, 0);
  s2.rotation.z = angW; g.add(s2);
  if (lifts !== false) {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
      var lift = box(0.05, 0.035, 0.05, M.ridge, c[0] * (w / 2 + ow - 0.02), 0.035, c[1] * (d / 2 + ow - 0.02));
      lift.rotation.z = -c[0] * 0.55; g.add(lift);
    });
  }
  return g;
}

/* 木栏杆阳台：地栿 + 栏条 + 扶手（5 栏条） */
function balcony(M, w) {
  var g = grp();
  g.add(box(w, 0.035, 0.18, M.timberD, 0, 0, 0.09));
  var n = 5, i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.13, 0.014, M.timber, -w / 2 + i * (w / n), 0.082, 0.168));
  }
  g.add(box(w + 0.04, 0.026, 0.03, M.timberD, 0, 0.158, 0.168));
  return g;
}

/* 匾额：深漆金字（lv3）/ 鎏金黑字（lv4），挂在楼阁层间 */
function plaque(M, gold, w, h, anims, phase) {
  var g = grp();
  var mat;
  if (gold) {
    mat = new THREE.MeshStandardMaterial({ map: getTex('plaqueG', texPlaqueG), roughness: 0.42, metalness: 0.35, flatShading: true });
    g.add(box(w + 0.04, h + 0.04, 0.03, M.gold));
  } else {
    mat = new THREE.MeshStandardMaterial({ map: getTex('plaqueD', texPlaqueD), roughness: 0.6, metalness: 0.05, flatShading: true });
    g.add(box(w + 0.04, h + 0.04, 0.03, M.timberD));
  }
  var face = mesh(new THREE.PlaneGeometry(w, h), mat);
  face.position.z = 0.017; g.add(face);
  if (anims) {
    var em = gold ? '#ffdf8a' : '#e7c56a';
    var glowM = MAT('p24plq' + phase, function () { return std('#000000', { rough: 0.5, emissive: em, ei: 0.0 }); });
    var halo = mesh(new THREE.PlaneGeometry(w * 1.02, h * 1.05), glowM);
    halo.position.z = 0.012; g.add(halo);
    anims.push(function (t) { glowM.emissiveIntensity = 0.05 + 0.05 * sin(t * 0.9 + (phase || 0)); });
  }
  return g;
}

/* ================= 3. 岛屿地坪（同一块地：水环 + 草台 + 石驳 + 小径） ================= */
function islandPad(M, anims, lv) {
  var g = grp();
  /* 湖面（涟漪纹理滚动） */
  var water = box(2.56, 0.05, 2.56, M.water, 0, 0.025, 0);
  water.castShadow = false; g.add(water);
  var wt = M.water.map;
  if (wt) anims.push(function (t) { wt.offset.y = (t * 0.018) % 1; wt.offset.x = sin(t * 0.11) * 0.02; });
  /* 涟漪光环（桥畔扩散，幅度克制） */
  var ring = mesh(new THREE.TorusGeometry(0.13, 0.011, 6, 20), M.ripple);
  ring.rotation.x = PI / 2; ring.position.set(-0.5, 0.062, 0.82); g.add(ring);
  anims.push(function (t) {
    var k = (t * 0.45) % 1;
    var sc = 1 + k * 1.6;
    ring.scale.set(sc, sc, 1);
    M.ripple.opacity = 0.38 * (1 - k);
  });
  /* 草台主体 + 石驳坎（island A：后半） */
  g.add(box(2.16, 0.1, 1.74, M.embank, -0.12, 0.05, -0.32));
  g.add(box(2.1, 0.09, 1.68, M.grass, -0.12, 0.125, -0.32));
  /* 前左草舌（桥堍） */
  g.add(box(0.78, 0.1, 0.8, M.embank, -0.68, 0.05, 0.5));
  g.add(box(0.72, 0.09, 0.74, M.grass, -0.68, 0.125, 0.5));
  /* 石驳压顶沿（前 + 右） */
  g.add(box(2.14, 0.035, 0.075, M.stoneD, -0.12, 0.185, 0.52));
  g.add(box(0.075, 0.035, 1.7, M.stoneD, 0.99, 0.185, -0.33));
  /* 石板小径（桥堍 → 门前） */
  var p1 = box(0.36, 0.02, 0.26, M.path, -0.5, 0.185, 0.3); p1.rotation.y = 0.5; g.add(p1);
  var p2 = box(0.34, 0.02, 0.26, M.path, -0.33, 0.185, 0.1); p2.rotation.y = 0.35; g.add(p2);
  var p3 = box(0.34, 0.02, 0.26, M.path, -0.2, 0.185, -0.08); p3.rotation.y = 0.2; g.add(p3);
  if (lv >= 3) {                                            /* lv3+ 门前石板广场 + 垂带踏步 */
    g.add(box(1.04, 0.022, 0.5, M.path, -0.14, 0.186, 0.24));
    g.add(box(0.66, 0.05, 0.14, M.stoneD, -0.14, 0.2, 0.5));
    g.add(box(0.5, 0.045, 0.12, M.stoneD, -0.14, 0.245, 0.42));
  }
  /* 湖石 + 睡莲 */
  var rk1 = mesh(new THREE.DodecahedronGeometry(0.07, 0), M.rock); put(g, rk1, 1.0, 0.068, 0.85);
  var rk2 = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.rock); put(g, rk2, 0.78, 0.058, 1.02);
  var rk3 = mesh(new THREE.DodecahedronGeometry(0.055, 0), M.rock); put(g, rk3, -1.02, 0.068, -0.95);
  var i;
  for (i = 0; i < 3; i++) {
    var lp = cyl(0.05, 0.05, 0.008, 10, M.lily, 0.32 + i * 0.17, 0.058, 0.95 - i * 0.13);
    lp.castShadow = false; g.add(lp);
  }
  /* 双柳（左后 + 右后） */
  put(g, willowTree(M, 1.05), -0.92, 0.17, -0.72);
  put(g, willowTree(M, 0.85), 0.8, 0.17, -0.8);
  if (lv >= 4) put(g, willowTree(M, 0.7), 1.0, 0.17, -0.2);
  return g;
}

/* ================= 4. 四阶生长（blockout→structure→form→interaction） ================= */

/* ---- lv1 小屋：原木水乡小筑 + 木皮顶 + 木栈桥 + 迷你水亭（h≈1.07） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(islandPad(M, anims, 1));
  var y0 = 0.17;
  /* 石脚 + 原木墙 */
  g.add(box(1.04, 0.05, 0.84, M.stoneD, -0.12, y0 + 0.025, -0.34));
  g.add(box(0.98, 0.5, 0.76, M.log, -0.12, y0 + 0.3, -0.34));           /* 0.22-0.72 */
  /* 转角圆木柱 + 出头 */
  [[-0.61, -0.71], [0.37, -0.71], [-0.61, 0.04], [0.37, 0.04]].forEach(function (c) {
    g.add(cyl(0.035, 0.035, 0.56, 10, M.logEnd, c[0], y0 + 0.31, c[1]));
  });
  /* 门（偏左，深洞口）+ 木格窗（右） */
  g.add(box(0.3, 0.4, 0.026, M.timberD, -0.3, y0 + 0.22, 0.038));
  g.add(box(0.24, 0.34, 0.034, M.ink, -0.3, y0 + 0.19, 0.04));
  var win = latticeWindow(M, 0.2, 0.18); put(g, win, 0.16, y0 + 0.33, 0.04);
  /* 门廊：地栿 + 双柱 + 三栏条 + 石阶 */
  g.add(box(0.46, 0.04, 0.24, M.timberD, -0.3, y0 + 0.07, 0.17));
  g.add(cyl(0.018, 0.02, 0.3, 10, M.timber, -0.5, y0 + 0.24, 0.26));
  g.add(cyl(0.018, 0.02, 0.3, 10, M.timber, -0.1, y0 + 0.24, 0.26));
  g.add(box(0.44, 0.026, 0.03, M.timber, -0.3, y0 + 0.4, 0.26));
  var bi;
  for (bi = 0; bi < 3; bi++) g.add(box(0.018, 0.1, 0.014, M.timber, -0.44 + bi * 0.14, y0 + 0.33, 0.26));
  g.add(box(0.32, 0.045, 0.14, M.stoneD, -0.3, y0 + 0.115, 0.34));
  /* 木皮双坡顶 + 圆木正脊（apex≈1.07） */
  var roof = tileRoof(M, { w: 1.0, d: 0.8, h: 0.3, over: 0.12, shake: true });
  put(g, roof, -0.12, y0 + 0.55, -0.34);
  /* 陶罐 ×2 + 柴堆 */
  g.add(cyl(0.055, 0.065, 0.13, 10, M.clay, 0.52, y0 + 0.09, 0.12));
  g.add(cyl(0.04, 0.05, 0.1, 10, M.clay, 0.62, y0 + 0.075, 0.0));
  var logP = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 10), M.timberD);
  logP.rotation.x = PI / 2; logP.position.set(0.56, y0 + 0.2, -0.62); g.add(logP);
  /* 木栈桥（前左，跨水） */
  var wb = woodBridge(M); put(g, wb, -0.7, 0.02, 0.62, 0.7);
  /* 迷你水亭（右前水中） */
  var pav = waterPavilion(M, { s: 0.78, anims: anims, phase: 1 });
  put(g, pav, 0.74, 0, 0.66);
  /* 纸窗暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：白墙黛瓦两层楼阁 + 阳台 + 条纹布幌店口 + 石拱断桥（h≈1.63） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(islandPad(M, anims, 2));
  var y0 = 0.17;
  var cx = -0.1;
  /* 石基座 + 一层白灰墙 + 转角木柱 */
  g.add(box(1.32, 0.09, 0.96, M.stoneD, cx, y0 + 0.045, -0.36));
  g.add(box(1.2, 0.56, 0.86, M.plaster, cx, y0 + 0.37, -0.36));          /* 0.26-0.82 */
  [[-0.62], [0.62]].forEach(function (sx) {
    g.add(box(0.05, 0.56, 0.05, M.timberD, cx + sx[0], y0 + 0.37, 0.06));
    g.add(box(0.05, 0.56, 0.05, M.timberD, cx + sx[0], y0 + 0.37, -0.78));
  });
  /* 店口（左半）：木柜台 + 货担 + 青白条纹布幌 */
  g.add(box(0.6, 0.34, 0.05, M.timberD, cx - 0.3, y0 + 0.21, 0.08));
  g.add(box(0.56, 0.05, 0.14, M.timber, cx - 0.3, y0 + 0.2, 0.12));
  g.add(box(0.12, 0.09, 0.08, M.clay, cx - 0.48, y0 + 0.28, 0.1));
  g.add(box(0.1, 0.07, 0.08, M.clay, cx - 0.32, y0 + 0.27, 0.1));
  g.add(box(0.11, 0.06, 0.07, M.lily, cx - 0.16, y0 + 0.265, 0.1));
  var awn = box(0.72, 0.018, 0.3, M.awning, cx - 0.3, y0 + 0.47, 0.2);
  awn.rotation.x = 0.42; g.add(awn);
  g.add(box(0.72, 0.03, 0.03, M.timberD, cx - 0.3, y0 + 0.43, 0.34));
  /* 门（右半）+ 石阶 + 方格窗 */
  g.add(box(0.28, 0.38, 0.026, M.timberD, cx + 0.32, y0 + 0.21, 0.078));
  g.add(box(0.22, 0.32, 0.034, M.ink, cx + 0.32, y0 + 0.185, 0.08));
  g.add(box(0.3, 0.045, 0.14, M.stoneD, cx + 0.32, y0 + 0.115, 0.14));
  var w1 = latticeWindow(M, 0.16, 0.2); put(g, w1, cx - 0.06, y0 + 0.34, 0.078);
  /* 二层：楼板 + 白灰墙 + 木栏杆阳台 + 木格窗 */
  g.add(box(1.26, 0.05, 0.9, M.timberD, cx, y0 + 0.685, -0.36));
  g.add(box(1.16, 0.46, 0.8, M.plaster, cx, y0 + 0.94, -0.36));          /* 0.74-1.20 */
  var balc = balcony(M, 0.94); put(g, balc, cx - 0.28, y0 + 0.73, 0.12);
  var w2 = latticeWindow(M, 0.2, 0.22); put(g, w2, cx - 0.42, y0 + 0.99, 0.05);
  var w3 = latticeWindow(M, 0.2, 0.22); put(g, w3, cx + 0.1, y0 + 0.99, 0.05);
  g.add(box(0.05, 0.42, 0.05, M.timberD, cx - 0.72, y0 + 0.95, 0.16));
  g.add(box(0.05, 0.42, 0.05, M.timberD, cx + 0.16, y0 + 0.95, 0.16));
  /* 主瓦顶：白灰山墙 + 翘角 + 黑瓦正脊（apex≈1.60）+ 前坡老虎窗 */
  var roof = tileRoof(M, { w: 1.16, d: 0.84, h: 0.22, over: 0.13, big: false });
  put(g, roof, cx, y0 + 1.16, -0.36);
  g.add(box(0.2, 0.16, 0.2, M.plaster, cx - 0.26, y0 + 1.28, -0.02));
  var dm = tileRoof(M, { w: 0.24, d: 0.2, h: 0.09, strips: 0, over: 0.05, ridge: false });
  put(g, dm, cx - 0.26, y0 + 1.36, -0.02);
  /* 廊下灯笼 ×2 */
  var l1 = lantern(M, 0.62, anims, 0.8); put(g, l1, cx - 0.72, y0 + 0.98, 0.2);
  var l2 = lantern(M, 0.62, anims, 2.1); put(g, l2, cx + 0.14, y0 + 0.98, 0.2);
  /* 石拱断桥 + 水亭（升级） */
  var br = stoneBridge(M, { s: 0.92 }); put(g, br, -0.7, 0.02, 0.58, 0.7);
  var pav = waterPavilion(M, { s: 0.95, anims: anims, phase: 2 });
  put(g, pav, 0.76, 0, 0.62);
  /* 纸窗暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：三层楼阁起层 + 层层腰檐 + 灯串 + 木匾 + 双层檐水亭（h≈2.06） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(islandPad(M, anims, 3));
  var y0 = 0.17;
  var cx = -0.14;
  /* 一层：石基 + 白灰墙 + 朱门 + 格窗 + 木柱 */
  g.add(box(1.42, 0.09, 1.0, M.stoneD, cx, y0 + 0.045, -0.38));
  g.add(box(1.3, 0.5, 0.9, M.plaster, cx, y0 + 0.3, -0.38));             /* 0.26-0.76 */
  g.add(box(0.26, 0.36, 0.026, M.timberD, cx - 0.3, y0 + 0.2, 0.09));
  g.add(box(0.2, 0.3, 0.034, M.ink, cx - 0.3, y0 + 0.17, 0.092));
  var w1 = latticeWindow(M, 0.18, 0.22); put(g, w1, cx + 0.14, y0 + 0.3, 0.095);
  var w2 = latticeWindow(M, 0.18, 0.22); put(g, w2, cx + 0.5, y0 + 0.3, 0.095);
  [[-0.66], [0.66]].forEach(function (sx) {
    g.add(box(0.05, 0.5, 0.05, M.timberD, cx + sx[0], y0 + 0.34, 0.07));
    g.add(box(0.05, 0.5, 0.05, M.timberD, cx + sx[0], y0 + 0.34, -0.83));
  });
  /* 腰檐 1 + 阳台 1 */
  var e1 = eaveRing(M, 1.36, 0.96, 0.09); put(g, e1, cx, y0 + 0.55, -0.38);
  var b1 = balcony(M, 1.06); put(g, b1, cx, y0 + 0.61, 0.1);
  /* 二层：白灰墙 + 格窗 + 木柱 + 灯笼 ×2 + 木匾「断桥烟雨」 */
  g.add(box(1.2, 0.46, 0.84, M.plaster, cx, y0 + 0.86, -0.38));          /* 0.80-1.26 */
  var w3 = latticeWindow(M, 0.18, 0.2); put(g, w3, cx - 0.28, y0 + 0.86, 0.055);
  var w4 = latticeWindow(M, 0.18, 0.2); put(g, w4, cx + 0.28, y0 + 0.86, 0.055);
  [[-0.61], [0.61]].forEach(function (sx) {
    g.add(box(0.045, 0.46, 0.045, M.timberD, cx + sx[0], y0 + 0.86, 0.02));
    g.add(box(0.045, 0.46, 0.045, M.timberD, cx + sx[0], y0 + 0.86, -0.78));
  });
  var plq = plaque(M, false, 0.34, 0.085, anims, 3); put(g, plq, cx, y0 + 0.96, 0.06);
  var l1 = lantern(M, 0.5, anims, 1.2); put(g, l1, cx - 0.56, y0 + 1.07, 0.12);
  var l2 = lantern(M, 0.5, anims, 2.6); put(g, l2, cx + 0.56, y0 + 1.07, 0.12);
  /* 腰檐 2 + 阳台 2 */
  var e2 = eaveRing(M, 1.24, 0.88, 0.085); put(g, e2, cx, y0 + 1.09, -0.38);
  var b2 = balcony(M, 0.92); put(g, b2, cx, y0 + 1.15, 0.08);
  /* 三层：白灰墙 + 格窗 + 灯笼 ×2 */
  g.add(box(1.08, 0.44, 0.76, M.plaster, cx, y0 + 1.35, -0.38));         /* 1.30-1.74 */
  var w5 = latticeWindow(M, 0.16, 0.18); put(g, w5, cx - 0.22, y0 + 1.35, 0.035);
  var w6 = latticeWindow(M, 0.16, 0.18); put(g, w6, cx + 0.22, y0 + 1.35, 0.035);
  [[-0.55], [0.55]].forEach(function (sx) {
    g.add(box(0.042, 0.44, 0.042, M.timberD, cx + sx[0], y0 + 1.35, 0.0));
    g.add(box(0.042, 0.44, 0.042, M.timberD, cx + sx[0], y0 + 1.35, -0.76));
  });
  var l3 = lantern(M, 0.46, anims, 3.4); put(g, l3, cx - 0.5, y0 + 1.25, 0.08);
  var l4 = lantern(M, 0.46, anims, 4.6); put(g, l4, cx + 0.5, y0 + 1.25, 0.08);
  /* 顶层主瓦顶（完全展开，apex≈2.19） */
  var roof = tileRoof(M, { w: 1.06, d: 0.8, h: 0.3, over: 0.13, big: true });
  put(g, roof, cx, y0 + 1.57, -0.38);
  /* 石拱断桥 + 双层檐水亭 */
  var br = stoneBridge(M, { s: 0.98 }); put(g, br, -0.72, 0.02, 0.6, 0.72);
  var pav = waterPavilion(M, { s: 1.05, double: true, anims: anims, phase: 3 });
  put(g, pav, 0.78, 0, 0.6);
  /* 纸窗暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.15 + 0.8); });
  return g;
}

/* ---- lv4 地标：四重飞檐湖畔地标 + 鎏金匾额宝顶 + 青幌廊街 + 烟雨迷雾（h≈2.7） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(islandPad(M, anims, 4));
  var y0 = 0.17;
  var cx = -0.14;
  /* 一层廊街：白灰墙 + 木柱列 + 朱门 + 青幌 ×2 + 格窗 */
  g.add(box(1.56, 0.09, 1.06, M.stoneD, cx, y0 + 0.045, -0.4));
  g.add(box(1.44, 0.54, 0.96, M.plaster, cx, y0 + 0.315, -0.4));         /* 0.26-0.80 */
  [[-0.72], [-0.26], [0.26], [0.72]].forEach(function (sx) {
    g.add(cyl(0.028, 0.032, 0.52, 10, M.timberD, cx + sx[0], y0 + 0.36, 0.1));
  });
  g.add(box(0.26, 0.38, 0.026, M.timberD, cx, y0 + 0.21, 0.1));
  g.add(box(0.2, 0.32, 0.034, M.ink, cx, y0 + 0.18, 0.102));
  var aw1 = box(0.42, 0.016, 0.24, M.awning, cx - 0.5, y0 + 0.5, 0.2);
  aw1.rotation.x = 0.42; g.add(aw1);
  g.add(box(0.42, 0.026, 0.026, M.timberD, cx - 0.5, y0 + 0.46, 0.31));
  var aw2 = box(0.42, 0.016, 0.24, M.awning, cx + 0.5, y0 + 0.5, 0.2);
  aw2.rotation.x = 0.42; g.add(aw2);
  g.add(box(0.42, 0.026, 0.026, M.timberD, cx + 0.5, y0 + 0.46, 0.31));
  var w1 = latticeWindow(M, 0.18, 0.22); put(g, w1, cx - 0.5, y0 + 0.3, 0.105);
  var w2 = latticeWindow(M, 0.18, 0.22); put(g, w2, cx + 0.5, y0 + 0.3, 0.105);
  /* 腰檐 1 + 阳台 1 */
  var e1 = eaveRing(M, 1.5, 1.02, 0.1); put(g, e1, cx, y0 + 0.585, -0.4);
  var b1 = balcony(M, 1.2); put(g, b1, cx, y0 + 0.66, 0.12);
  var lA = lantern(M, 0.5, anims, 0.6); put(g, lA, cx - 0.68, y0 + 0.63, 0.18);
  var lB = lantern(M, 0.5, anims, 1.9); put(g, lB, cx + 0.68, y0 + 0.63, 0.18);
  /* 二层：白灰墙 + 格窗 + 鎏金匾「断桥烟雨」+ 灯笼 ×2 */
  g.add(box(1.3, 0.46, 0.9, M.plaster, cx, y0 + 0.935, -0.4));           /* 0.875-1.335 */
  var w3 = latticeWindow(M, 0.18, 0.2); put(g, w3, cx - 0.3, y0 + 0.93, 0.07);
  var w4 = latticeWindow(M, 0.18, 0.2); put(g, w4, cx + 0.3, y0 + 0.93, 0.07);
  [[-0.66], [0.66]].forEach(function (sx) {
    g.add(box(0.048, 0.46, 0.048, M.timberD, cx + sx[0], y0 + 0.935, 0.04));
    g.add(box(0.048, 0.46, 0.048, M.timberD, cx + sx[0], y0 + 0.935, -0.84));
  });
  var plq = plaque(M, true, 0.44, 0.11, anims, 4); put(g, plq, cx, y0 + 1.06, 0.065);
  var l1 = lantern(M, 0.48, anims, 2.8); put(g, l1, cx - 0.6, y0 + 1.13, 0.16);
  var l2 = lantern(M, 0.48, anims, 3.7); put(g, l2, cx + 0.6, y0 + 1.13, 0.16);
  /* 腰檐 2 + 阳台 2（高层省翘钩） */
  var e2 = eaveRing(M, 1.36, 0.94, 0.095, false); put(g, e2, cx, y0 + 1.165, -0.4);
  var b2 = balcony(M, 1.04); put(g, b2, cx, y0 + 1.195, 0.1);
  /* 三层：白灰墙 + 格窗 */
  g.add(box(1.14, 0.42, 0.8, M.plaster, cx, y0 + 1.51, -0.4));           /* 1.47-1.89 */
  var w5 = latticeWindow(M, 0.16, 0.18); put(g, w5, cx - 0.24, y0 + 1.51, 0.045);
  var w6 = latticeWindow(M, 0.16, 0.18); put(g, w6, cx + 0.24, y0 + 1.51, 0.045);
  [[-0.58], [0.58]].forEach(function (sx) {
    g.add(box(0.042, 0.42, 0.042, M.timberD, cx + sx[0], y0 + 1.51, 0.01));
    g.add(box(0.042, 0.42, 0.042, M.timberD, cx + sx[0], y0 + 1.51, -0.81));
  });
  /* 腰檐 3 */
  var e3 = eaveRing(M, 1.2, 0.84, 0.09, false); put(g, e3, cx, y0 + 1.72, -0.4);
  /* 四层顶阁：白灰墙 + 木栏 */
  g.add(box(0.96, 0.4, 0.68, M.plaster, cx, y0 + 1.99, -0.4));           /* 1.96-2.36 */
  var b3 = balcony(M, 0.78); put(g, b3, cx, y0 + 1.75, 0.06);
  /* 攒尖四坡大顶（四重檐之顶，apex≈2.7）：四坡 + 四金翘 + 金脊 + 鎏金宝顶 */
  var tw = 0.98, td = 0.74, th = 0.36;
  var top = grp(); g.add(top);
  var eF = td / 2 + 0.12, eS = tw / 2 + 0.12;
  var pF = Math.atan2(th, eF), pS = Math.atan2(th, eS);
  var lenF = Math.sqrt(eF * eF + th * th) + 0.02;
  var lenS = Math.sqrt(eS * eS + th * th) + 0.02;
  var sgF = grp(); sgF.position.y = th; sgF.rotation.x = pF; top.add(sgF);
  sgF.add(box(tw * 0.7 + 0.22, 0.035, lenF, M.roofLit, 0, 0, lenF / 2));
  sgF.add(box(tw * 0.7 + 0.24, 0.05, 0.024, M.timberD, 0, -0.004, eF));
  var sgB = grp(); sgB.position.y = th; sgB.rotation.x = -pF; top.add(sgB);
  sgB.add(box(tw * 0.7 + 0.22, 0.035, lenF, M.roofShd, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.y = th; slR.rotation.z = -pS; top.add(slR);
  slR.add(box(lenS, 0.035, td * 0.8, M.roofShd, lenS / 2, 0, 0));
  var slL = grp(); slL.position.y = th; slL.rotation.z = pS; top.add(slL);
  slL.add(box(lenS, 0.035, td * 0.8, M.roofShd, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.07, 0.05, 0.07, M.ridge, c[0] * (eS - 0.02), 0.05, c[1] * (eF - 0.02));
    lift.rotation.z = -c[0] * 0.6; top.add(lift);
  });
  top.add(box(tw * 0.42, 0.065, 0.085, M.ridge, 0, th + 0.032, 0));
  var gf1 = box(0.05, 0.13, 0.07, M.gold, tw * 0.21, th + 0.1, 0); gf1.rotation.z = 0.42; top.add(gf1);
  var gf2 = box(0.05, 0.13, 0.07, M.gold, -tw * 0.21, th + 0.1, 0); gf2.rotation.z = -0.42; top.add(gf2);
  var fin = sph(0.05, M.gold, 0, th + 0.13, 0); top.add(fin);
  var spire = cyl(0.014, 0.026, 0.09, 10, M.gold, 0, th + 0.2, 0); top.add(spire);
  var orb = sph(0.026, M.gold, 0, th + 0.23, 0); top.add(orb);
  put(g, top, cx, y0 + 2.19, -0.4);
  /* 鎏金宝顶微光 */
  var gm = MAT('p24finGlow', function () { return std('#000000', { rough: 0.3, metal: 0.6, emissive: '#ffe9a0', ei: 0.0 }); });
  var halo = mesh(new THREE.SphereGeometry(0.062, 12, 10), gm);
  halo.castShadow = false;
  halo.position.set(cx, y0 + 2.19 + th + 0.13, -0.4); g.add(halo);
  anims.push(function (t) { gm.emissiveIntensity = 0.12 + 0.1 * sin(t * 0.8 + 1.1); });
  /* 大石拱桥 + 大双层檐水亭 */
  var br = stoneBridge(M, { s: 1.08 }); put(g, br, -0.68, 0.02, 0.58, 0.74);
  var pav = waterPavilion(M, { s: 1.2, double: true, anims: anims, phase: 5 });
  put(g, pav, 0.72, 0, 0.62);
  /* 烟雨迷雾（贴水缓移雾片，幅度克制） */
  var i;
  for (i = 0; i < 3; i++) {
    var m0 = sph(0.3, M.mist, -0.4 + i * 0.4, 0.1 + (i % 2) * 0.04, 0.85 - i * 0.28);
    m0.scale.y = 0.22; m0.castShadow = false; g.add(m0);
    (function (m0, k) {
      anims.push(function (t) {
        m0.position.x = sin(t * 0.14 + k * 2.1) * 0.25 + (-0.4 + k * 0.4);
        m0.position.y = 0.1 + 0.02 * sin(t * 0.5 + k);
      });
    })(m0, i);
  }
  /* 纸窗暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.05 * sin(t * 1.05 + 1.4); });
  return g;
}

/* ================= 5. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[24] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_24_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 24;
  g.userData.level = lv;
  g.userData.region = 'g5';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
