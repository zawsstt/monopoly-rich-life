/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_26.js
 * -------------------------------------------------------------------------------------
 * 格 26「回民街」(g6 西北食坊) 独属建筑：回坊食街四阶生长史
 * 参考图 refs/prop_26.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop26/）。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   木瓦坡顶食摊小屋 + 蓝布凉棚 + 石灶沸锅（h≈1.05）
 *   lv2 洋房   两层瓦顶堂口 + 鎏金吻角 + 檐廊 + 星月幡杆（h≈1.60）
 *   lv3 大厦   三层退台 + 层层腰檐 + 大金角 + 条纹凉棚 + 双幡（h≈2.08）
 *   lv4 地标   石台基 + 朱柱廊 + 红金拱楣 + 双层庑殿金顶 + 金塔刹（h≈2.72）
 *
 * 独有语汇（自参考图逐区取样）：炭青筒瓦垄（檐角起翘 + 鎏金弯钩吻）、朱漆柱/封檐板、
 * 奶油色抹灰墙 + 木格棂暖窗、深红帘幔金边、钢蓝帆布凉棚（lv3 蓝白条纹）、
 * 青绿燕尾新月幡、红灯笼金盖穗、石灶橙火 + 墨锅金汤白汽、草岛沙岩石板径。
 * 与 prop_1（京派灰砖）/prop_8（石库门）/prop_9（岭南骑楼）完全拉开。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[26] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_26] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 颜色 / 材质基元（std: sRGB→Linear） ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true),
    transparent: (o.op !== undefined), opacity: (o.op !== undefined ? o.op : 1)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.side !== undefined) m.side = o.side;
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
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, rx, ry, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}

/* ================= 1. 程序化 Canvas 纹理（≤256px，零外部资源） ================= */
function mkCanvas(w, h) {
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv;
}
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 炭青筒瓦垄：下行圆垄明暗 + 错缝接头 + 陶面噪点（map+bump 同源） */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#3a424f'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    for (k = 0; k < 5; k++) {                                   /* 圆垄：竖向半圆瓦垄 */
      var x = k * (S / 5) + ((i % 2) * S / 10);
      var grd = g.createLinearGradient(x, 0, x + S / 5, 0);
      grd.addColorStop(0, '#2c313b'); grd.addColorStop(0.45, '#596274'); grd.addColorStop(1, '#333a45');
      g.fillStyle = grd; g.fillRect(x, y, S / 5, rh);
      g.fillStyle = 'rgba(16,20,26,0.65)'; g.fillRect(x, y, 2, rh);
    }
    g.fillStyle = 'rgba(20,24,30,0.5)'; g.fillRect(0, y + rh - 2, S, 2);
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.045)' : 'rgba(10,14,20,0.09)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* lv1 木瓦/望板：横向板垄 + 板缝 + 木纹明暗 */
function texShingle() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b98a58'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#b4854f' : '#a87c4c'; g.fillRect(0, y, S, rh);
    g.fillStyle = 'rgba(110,74,42,0.9)'; g.fillRect(0, y + rh - 2, S, 2);
    g.fillStyle = 'rgba(255,230,190,0.20)'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? S / 8 : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(90,58,32,0.55)'; g.fillRect(x, y + 2, 2, rh - 4);
    }
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,240,210,0.06)' : 'rgba(80,50,26,0.07)';
    g.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 蓝白条纹棚布（lv3 侧摊） */
function texStripe() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e8dcc0'; g.fillRect(0, 0, S, S);
  g.fillStyle = '#5b7a94';
  var i;
  for (i = 0; i < 4; i++) g.fillRect(i * (S / 4), 0, S / 8, S);
  for (i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(60,50,30,0.05)';
    g.fillRect((i * 29) % S, (i * 41) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 深红帘幔：金边 + 金团花暗纹 */
function texCurtain() {
  var w = 96, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#96382a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a2a1e'; g.fillRect(0, h - 14, w, 14);
  g.strokeStyle = '#d9a94e'; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6);
  g.strokeStyle = 'rgba(217,169,78,0.55)'; g.lineWidth = 2;
  g.beginPath(); g.arc(w / 2, h * 0.38, 14, 0, PI * 2); g.stroke();
  g.beginPath(); g.arc(w / 2, h * 0.38, 7, 0, PI * 2); g.stroke();
  var i;
  for (i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(40,10,6,0.08)';
    g.fillRect((i * 23) % w, (i * 47) % h, 2, 2);
  }
  return toTex(cv, true);
}
/* 灶砖：沙岩砖错缝 + 灶口煤黑 */
function texStove() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#a8a49a'; g.fillRect(0, 0, S, S);
  var rows = 5, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = 'rgba(90,86,76,0.85)'; g.fillRect(0, y + rh - 2, S, 2);
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillStyle = 'rgba(90,86,76,0.85)'; g.fillRect(x, y, 2, rh - 2);
      g.fillStyle = ((k + i) % 2) ? 'rgba(255,255,255,0.05)' : 'rgba(40,36,30,0.08)';
      g.fillRect(x + 3, y + 1, S / 3 - 6, rh - 5);
    }
  }
  g.fillStyle = 'rgba(20,16,14,0.5)'; g.fillRect(0, S - 10, S, 10);   /* 底部煤烟 */
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图逐区取样） */
function Mats() {
  return {
    roofSun:   MAT('p26roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.62 }); }),
    roofShade: MAT('p26roofShd', function () { var t = getTex('tile', texTile); return std('#96a0ae', { map: t, bump: t, bumpScale: 0.016, rough: 0.72 }); }),
    ridgeDk:   MAT('p26ridgeDk', function () { return std('#23272e', { rough: 0.8 }); }),
    shingle:   MAT('p26shingle', function () { var t = getTex('shingle', texShingle); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.78 }); }),
    shingleSd: MAT('p26shingleSd', function () { var t = getTex('shingle', texShingle); return std('#b0a090', { map: t, bump: t, bumpScale: 0.012, rough: 0.84 }); }),
    plaster:   MAT('p26plaster', function () { return std('#e6d5ae', { rough: 0.92 }); }),
    timber:    MAT('p26timber', function () { return std('#6b4526', { rough: 0.82 }); }),
    timberD:   MAT('p26timberD', function () { return std('#59371e', { rough: 0.86 }); }),
    wood:      MAT('p26wood', function () { return std('#8a5a32', { rough: 0.76 }); }),
    woodHi:    MAT('p26woodHi', function () { return std('#9e6b3e', { rough: 0.68 }); }),
    lacq:      MAT('p26lacq', function () { return std('#a03622', { rough: 0.5 }); }),
    lacqBr:    MAT('p26lacqBr', function () { return std('#c24e33', { rough: 0.42 }); }),
    lacqDk:    MAT('p26lacqDk', function () { return std('#872b1c', { rough: 0.58 }); }),
    curtain:   MAT('p26curtain', function () { var t = getTex('curtain', texCurtain); return std('#ffffff', { map: t, rough: 0.88 }); }),
    gold:      MAT('p26gold', function () { return std('#d9a94e', { rough: 0.36, metal: 0.65 }); }),
    goldBr:    MAT('p26goldBr', function () { return std('#e8c06a', { rough: 0.3, metal: 0.75 }); }),
    awning:    MAT('p26awning', function () { return std('#6e88a0', { rough: 0.9, side: THREE.DoubleSide }); }),
    awningHi:  MAT('p26awningHi', function () { return std('#8fa9c0', { rough: 0.86, side: THREE.DoubleSide }); }),
    stripe:    MAT('p26stripe', function () { var t = getTex('stripe', texStripe); return std('#ffffff', { map: t, rough: 0.9, side: THREE.DoubleSide }); }),
    banner:    MAT('p26banner', function () { return std('#57907f', { rough: 0.9, side: THREE.DoubleSide }); }),
    crescent:  MAT('p26crescent', function () { return std('#e8d9a8', { rough: 0.55 }); }),
    bracket:   MAT('p26bracket', function () { return std('#3a708c', { rough: 0.72 }); }),
    stone:     MAT('p26stone', function () { return std('#9aa0a6', { rough: 0.9 }); }),
    stoneD:    MAT('p26stoneD', function () { return std('#848a90', { rough: 0.92 }); }),
    stove:     MAT('p26stove', function () { var t = getTex('stove', texStove); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.9 }); }),
    pot:       MAT('p26pot', function () { return std('#262a2e', { rough: 0.66 }); }),
    grass:     MAT('p26grass', function () { return std('#92b044', { rough: 0.95 }); }),
    grassD:    MAT('p26grassD', function () { return std('#7a9638', { rough: 0.95 }); }),
    path:      MAT('p26path', function () { return std('#cbb086', { rough: 0.95 }); }),
    pathD:     MAT('p26pathD', function () { return std('#b39468', { rough: 0.96 }); }),
    fruit:     MAT('p26fruit', function () { return std('#e09633', { rough: 0.82 }); }),
    paper:     MAT('p26paper', function () { return std('#f5c96a', { rough: 0.85, emissive: '#ffcf8a', ei: 0.35 }); }),
    fire:      MAT('p26fire', function () { return std('#ff6a2a', { rough: 0.6, emissive: '#ff7a30', ei: 0.7 }); }),
    broth:     MAT('p26broth', function () { return std('#ffb84a', { rough: 0.42, emissive: '#ffb84a', ei: 0.5 }); }),
    steam:     MAT('p26steam', function () { return std('#f2f2f0', { rough: 0.98, op: 0.52, emissive: '#ffffff', ei: 0.12 }); })
  };
}
/* 灯笼红壳（按相位分壳，呼吸动画共享） */
function lanternMat(phase) {
  return MAT('p26lant' + phase, function () { return std('#e04b28', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
}

/* ================= 2. 预制件（回坊风格独有语汇） ================= */

/* 木格棂暖窗：木框 + 暖光纸面 + 竖棂横格（几何花格） */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  g.add(box(w + 0.045, h + 0.045, 0.03, M.wood));
  g.add(box(w, h, 0.026, M.paper, 0, 0, 0.004));
  var cols = o.cols || 2, rows = o.rows || 2, i;
  for (i = 1; i < cols; i++) g.add(box(0.024, h, 0.032, M.wood, -w / 2 + i * (w / cols), 0, 0.007));
  for (i = 1; i < rows; i++) g.add(box(w, 0.022, 0.032, M.wood, 0, -h / 2 + i * (h / rows), 0.007));
  g.add(box(w * 0.3, 0.03, 0.034, M.timberD, 0, h * 0.32, 0.009));   /* 横披上枋 */
  return g;
}

/* 红帘幔面板：帘面 + 金边条 + 挂杆 */
function curtainPanel(M, w, h) {
  var g = grp();
  g.add(cyl(w * 0.55, w * 0.55, 0.022, 10, M.timberD, 0, h * 0.5 + 0.015, 0)).rotation.z = PI / 2;
  g.add(box(w, h, 0.018, M.curtain));
  g.add(box(w, 0.028, 0.022, M.gold, 0, h * 0.42, 0.004));
  return g;
}

/* 红灯笼：金盖金底 + 红壳 + 金环 + 穗（呼吸相位共享） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = lanternMat(phase || 0);
  g.add(cyl(0.032 * s, 0.046 * s, 0.03 * s, 10, M.gold, 0, 0.1 * s, 0));
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.85; g.add(body);
  g.add(cyl(0.046 * s, 0.03 * s, 0.028 * s, 10, M.gold, 0, -0.096 * s, 0));
  g.add(cyl(0.007 * s, 0.007 * s, 0.07 * s, 10, M.lacqDk, 0, -0.152 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0) * 1.7); });
  return g;
}

/* 鎏金弯钩吻：圆环弧段卷成钩（檐角/正脊端头），参考图 signature */
function goldHook(M, s, rz) {
  var o = mesh(new THREE.TorusGeometry(0.052 * s, 0.017 * s, 6, 12, PI * 0.95), M.goldBr);
  o.rotation.z = (rz === undefined ? 0.5 : rz);
  return o;
}

/* 炭青瓦庑殿/歇山坡顶：前后坡（向光/背光）+ 端坡 + 端山花 + 檐角金钩 +
 * 深色下楣 + 中央金饰 + 弧形金脊（o.hip=false 时为悬山带山花） */
function tileRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), i;
  var over = o.over !== undefined ? o.over : 0.09;
  var eaveF = d / 2 + over, eaveS = w / 2 + over;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  /* 前后主坡 */
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + over * 2, 0.034, lenF, M.roofSun, 0, 0, lenF / 2));
  for (i = 0; i < (o.strips || 4); i++) {
    var u = (i + 0.5) / (o.strips || 4);
    sgF.add(box(w + over * 2 - 0.03, 0.015, 0.028, M.ridgeDk, 0, 0.025, u * eaveF));
  }
  sgF.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.lacqDk, 0, -0.004, eaveF));   /* 朱封檐 */
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + over * 2, 0.034, lenF, M.roofShade, 0, 0, -lenF / 2));
  sgB.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.lacqDk, 0, -0.004, -eaveF));
  /* 端坡 + 山花（庑殿式：左右短坡自檐口向脊内收） */
  var hipW = o.hip === false ? 0 : Math.min(0.34, w * 0.3);
  if (hipW > 0.05) {
    var Rh = eaveS * 0.72;                                   /* 端坡水平距 */
    var pitH = Math.atan2(h, Rh);
    var lenH = Math.sqrt(Rh * Rh + h * h) + 0.02;
    var slR = grp(); slR.position.set(eaveS - Rh / 2, h / 2, 0); slR.rotation.z = -pitH; g.add(slR);
    slR.add(box(lenH, 0.03, hipW + over, M.roofShade, 0, 0, 0));
    var slL = grp(); slL.position.set(-(eaveS - Rh / 2), h / 2, 0); slL.rotation.z = pitH; g.add(slL);
    slL.add(box(lenH, 0.03, hipW + over, M.roofShade, 0, 0, 0));
  } else {
    /* 悬山：山花封板 */
    var gs = new THREE.Shape();
    gs.moveTo(-eaveF, 0); gs.lineTo(eaveF, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
    var t1 = mesh(gg, M.plaster); t1.rotation.y = PI / 2; t1.position.set(w / 2, -0.02, -0.02); g.add(t1);
    var t2 = mesh(gg, M.plaster); t2.rotation.y = -PI / 2; t2.position.set(-w / 2 + 0.04, -0.02, 0.02); g.add(t2);
  }
  /* 檐角鎏金弯钩 ×4（前排大、后排小） */
  var cs = o.hookS || 1;
  [[1, 1], [-1, 1]].forEach(function (c) {
    var hk = goldHook(M, cs, -c[0] * 0.85);
    put(g, hk, c[0] * (eaveS - 0.055), 0.055, c[1] * (eaveF - 0.02));
  });
  [[1, -1], [-1, -1]].forEach(function (c) {
    var hk = goldHook(M, cs * 0.8, PI + c[0] * 0.85);
    put(g, hk, c[0] * (eaveS - 0.055), 0.055, c[1] * (eaveF - 0.02));
  });
  /* 正脊：弧形三段（浅木金）+ 深色衬脊 + 端吻 + 中央金饰 */
  var rw = w + over * 2 + 0.04;
  g.add(box(rw, 0.045, 0.075, M.ridgeDk, 0, h + 0.02, 0));
  var r1 = box(rw * 0.42, 0.05, 0.06, M.woodHi, -rw * 0.27, h + 0.06, 0); r1.rotation.z = 0.1; g.add(r1);
  var r2 = box(rw * 0.42, 0.05, 0.06, M.woodHi, rw * 0.27, h + 0.06, 0); r2.rotation.z = -0.1; g.add(r2);
  var r3 = box(rw * 0.2, 0.052, 0.062, M.woodHi, 0, h + 0.068, 0); g.add(r3);
  var f1 = box(0.055, 0.105, 0.07, M.goldBr, rw / 2 - 0.015, h + 0.085, 0); f1.rotation.z = 0.38; g.add(f1);
  var f2 = box(0.055, 0.105, 0.07, M.goldBr, -rw / 2 + 0.015, h + 0.085, 0); f2.rotation.z = -0.38; g.add(f2);
  if (o.crest !== false) {
    g.add(cyl(0.03, 0.038, 0.024, 10, M.gold, 0, h + 0.052, 0.0));
    put(g, sph(0.02, M.goldBr), 0, h + 0.078, 0);
  }
  return g;
}

/* 腰檐：窄裙檐一圈（前后坡 + 两侧窄坡 + 角钩），用于层间 */
function waistEave(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var over = o.over !== undefined ? o.over : 0.075;
  var eaveF = d / 2 + over, eaveS = w / 2 + over;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + over * 2, 0.03, lenF, M.roofSun, 0, 0, lenF / 2));
  sgF.add(box(w + over * 2 + 0.02, 0.042, 0.022, M.lacqDk, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + over * 2, 0.03, lenF, M.roofShade, 0, 0, -lenF / 2));
  var Rh2 = eaveS * 0.6;
  var pitH2 = Math.atan2(h, Rh2);
  var lenH2 = Math.sqrt(Rh2 * Rh2 + h * h) + 0.02;
  var slR = grp(); slR.position.set(eaveS - Rh2 / 2, h / 2, 0); slR.rotation.z = -pitH2; g.add(slR);
  slR.add(box(lenH2, 0.03, d + over, M.roofShade, 0, 0, 0));
  var slL = grp(); slL.position.set(-(eaveS - Rh2 / 2), h / 2, 0); slL.rotation.z = pitH2; g.add(slL);
  slL.add(box(lenH2, 0.03, d + over, M.roofShade, 0, 0, 0));
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (c) {
    var hk = goldHook(M, o.hookS || 0.72, -c[0] * 0.9);
    put(g, hk, c[0] * (eaveS - 0.05), 0.045, c[1] * (eaveF - 0.015));
  });
  g.add(box(w + over * 2 + 0.03, 0.035, 0.05, M.ridgeDk, 0, h + 0.012, 0));
  return g;
}

/* 金塔刹（lv4 顶）：座箍 + 双球收分 + 针刹 + 顶珠 */
function finialSpire(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.095 * s, 0.115 * s, 0.05 * s, 12, M.gold, 0, 0.025 * s, 0));
  g.add(cyl(0.07 * s, 0.09 * s, 0.035 * s, 12, M.goldBr, 0, 0.068 * s, 0));
  g.add(sph(0.062 * s, M.goldBr, 0, 0.14 * s, 0));
  g.add(sph(0.044 * s, M.gold, 0, 0.215 * s, 0));
  g.add(cyl(0.03 * s, 0.04 * s, 0.03 * s, 10, M.goldBr, 0, 0.262 * s, 0));
  g.add(mesh(new THREE.ConeGeometry(0.016 * s, 0.17 * s, 10), M.goldBr)).position.y = 0.36 * s;
  put(g, sph(0.014 * s, M.goldBr), 0, 0.452 * s, 0);
  return g;
}

/* 朱漆柱：石础 + 金脚箍 + 柱身 + 金顶箍（lv2+ 门柱 / lv4 廊柱） */
function column(M, h, r, plinth) {
  var g = grp(); var y0 = 0;
  if (plinth) {
    g.add(box(r * 3.4, 0.05, r * 3.4, M.stoneD, 0, 0.025, 0));
    g.add(cyl(r * 1.4, r * 1.55, 0.035, 10, M.gold, 0, 0.068, 0));
    y0 = 0.085;
  } else {
    g.add(cyl(r * 1.35, r * 1.5, 0.04, 10, M.stoneD, 0, 0.02, 0));
    y0 = 0.04;
  }
  g.add(cyl(r, r, h, 10, M.lacqBr, 0, y0 + h / 2, 0));
  g.add(cyl(r * 1.16, r * 1.16, 0.024, 10, M.gold, 0, y0 + h * 0.85, 0));
  g.add(cyl(r * 1.2, r * 1.05, 0.035, 10, M.lacqDk, 0, y0 + h + 0.015, 0));
  return g;
}

/* 木栏杆檐廊：地栿 + 望柱棂条 + 扶手 */
function balustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.18, M.wood, 0, 0.02, 0.09));
  var n = Math.max(5, Math.round(w / 0.115)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.14, 0.014, M.woodHi, -w / 2 + i * (w / n), 0.105, 0.17));
  }
  g.add(box(w + 0.035, 0.026, 0.05, M.woodHi, 0, 0.185, 0.17));
  return g;
}

/* 钢蓝帆布凉棚：组原点=前檐下缘；斜棚面向后上扬（可条纹）+ 金边 + 波浪垂沿 + 前柱 */
function canvasAwning(M, w, o) {
  o = o || {};
  var g = grp();
  var d = o.d || 0.42, drop = o.drop || 0.2;
  var slope = Math.atan2(drop, d);
  var len = Math.sqrt(d * d + drop * drop) + 0.03;
  var face = grp(); face.rotation.x = slope; g.add(face);                     /* 前低后高 */
  face.position.y = drop;
  face.add(box(w, 0.012, len, o.striped ? M.stripe : M.awning, 0, 0, len / 2));
  face.add(box(w, 0.014, len * 0.5, o.striped ? M.stripe : M.awningHi, 0, 0.008, len * 0.24));
  face.add(box(w, 0.02, 0.02, M.gold, 0, 0.012, len));                       /* 金边 */
  var n = Math.round(w / 0.16), i;                                           /* 波浪垂沿 */
  for (i = 0; i < n; i++) {
    var sc = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 8, 1, false, 0, PI), M.awning);
    sc.rotation.x = PI / 2; sc.rotation.z = -PI / 2;
    put(face, sc, -w / 2 + (i + 0.5) * (w / n), 0.012, len + 0.001);
  }
  if (o.poles) {
    var ph = (o.frontY || 0.35) + 0.02;
    g.add(cyl(0.014, 0.014, ph, 10, M.timberD, -w / 2 + 0.06, ph / 2, d + 0.02));
    g.add(cyl(0.014, 0.014, ph, 10, M.timberD, w / 2 - 0.06, ph / 2, d + 0.02));
  }
  return g;
}

/* 青绿燕尾新月幡：杆 + 横担 + 燕尾幡面 + 金新月（摆动） */
function crescentBanner(M, h, anims, phase) {
  var g = grp();
  g.add(cyl(0.02, 0.028, 0.05, 10, M.stoneD, 0, 0.025, 0));
  g.add(cyl(0.015, 0.02, h, 10, M.timberD, 0, h / 2 + 0.05, 0));
  g.add(sph(0.022, M.goldBr, 0, h + 0.07, 0));
  var swing = grp(); swing.position.set(0, h - 0.02, 0); g.add(swing);
  swing.add(box(0.28, 0.024, 0.024, M.timberD, 0.04, 0, 0));
  /* 燕尾幡面：Shape 带下 V 口 */
  var wC = 0.2, hC = 0.44;
  var sh = new THREE.Shape();
  sh.moveTo(-wC / 2, 0); sh.lineTo(wC / 2, 0); sh.lineTo(wC / 2, -hC);
  sh.lineTo(0, -hC * 0.72); sh.lineTo(-wC / 2, -hC); sh.closePath();
  var cloth = mesh(new THREE.ShapeGeometry(sh), M.banner);
  cloth.material.side = THREE.DoubleSide;
  cloth.position.set(0.04, -0.01, 0); swing.add(cloth);
  /* 金新月：圆环弧段贴面 */
  var moon = mesh(new THREE.TorusGeometry(0.05, 0.013, 6, 14, PI * 1.25), M.crescent);
  moon.rotation.z = PI * 0.72; put(swing, moon, 0.04, -hC * 0.42, 0.012);
  anims.push(function (t) { swing.rotation.y = sin(t * 1.25 + (phase || 0)) * 0.16; swing.rotation.z = sin(t * 1.6 + (phase || 0) * 2.0) * 0.045; });
  return g;
}

/* 石灶 + 墨锅 + 金汤 + 灶火 + 白汽（每级必有，蒸汽动画） */
function stove(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  g.add(box(0.34 * s, 0.2 * s, 0.28 * s, M.stove, 0, 0.1 * s, 0));
  g.add(box(0.14 * s, 0.1 * s, 0.02 * s, M.pot, 0, 0.07 * s, 0.141 * s));     /* 灶口 */
  var fire = box(0.1 * s, 0.06 * s, 0.015 * s, M.fire, 0, 0.062 * s, 0.148 * s);
  g.add(fire);
  g.add(cyl(0.115 * s, 0.09 * s, 0.09 * s, 12, M.pot, 0, 0.245 * s, 0));      /* 墨锅 */
  g.add(cyl(0.1 * s, 0.1 * s, 0.012 * s, 12, M.broth, 0, 0.288 * s, 0));      /* 金汤面 */
  /* 白汽三球循环（共享蒸汽材质） */
  var steam = grp(); steam.position.set(0, 0.34 * s, 0); g.add(steam);
  var puffs = [], i;
  for (i = 0; i < 3; i++) {
    var p = sph((0.03 + 0.008 * i) * s, M.steam, 0, i * 0.06 * s, 0);
    steam.add(p); puffs.push(p);
  }
  var fm = M.fire;
  anims.push(function (t) {
    fm.emissiveIntensity = 0.7 + 0.22 * sin(t * 9.3 + (phase || 0));
    var k;
    for (k = 0; k < 3; k++) {
      var ph = ((t * 0.5 + k / 3 + (phase || 0) * 0.13) % 1);
      puffs[k].position.y = ph * 0.34 * s;
      puffs[k].position.x = sin(t * 1.8 + k * 2.1) * 0.02 * s;
      puffs[k].scale.setScalar(0.6 + ph * 0.9);
    }
  });
  return g;
}

/* 食案：厚面板 + 四腿 + 锅/金汤 + 白瓷碟 + （可带蒸汽） */
function foodTable(M, w, o) {
  o = o || {};
  var g = grp();
  g.add(box(w, 0.045, 0.3, M.woodHi, 0, 0.24, 0));
  var lx = w / 2 - 0.035, i;
  [[-lx, -0.1], [lx, -0.1], [-lx, 0.1], [lx, 0.1]].forEach(function (p) {
    g.add(box(0.045, 0.22, 0.045, M.timber, p[0], 0.11, p[1]));
  });
  g.add(box(w - 0.1, 0.03, 0.06, M.wood, 0, 0.17, 0));                        /* 隔板 */
  var potX = o.potX === undefined ? -w * 0.22 : o.potX;
  g.add(cyl(0.085, 0.07, 0.075, 12, M.pot, potX, 0.3, 0));
  g.add(cyl(0.072, 0.072, 0.01, 12, M.broth, potX, 0.332, 0));
  var nPlate = o.plates === undefined ? 1 : o.plates;
  for (i = 0; i < nPlate; i++) {
    g.add(cyl(0.045, 0.05, 0.016, 10, M.paper, w * 0.28 + i * 0.12, 0.27, sin(i * 2.4) * 0.06));
  }
  return g;
}

/* 货筐：筐体 + 果堆 */
function basket(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.075 * s, 0.06 * s, 0.09 * s, 10, M.wood, 0, 0.045 * s, 0));
  var i;
  for (i = 0; i < 3; i++) {
    g.add(sph(0.026 * s, M.fruit, sin(i * 2.1) * 0.035 * s, 0.098 * s, cos(i * 2.1) * 0.035 * s));
  }
  return g;
}

/* 凳 / 桶 */
function stool(M) {
  var g = grp();
  g.add(box(0.11, 0.026, 0.11, M.woodHi, 0, 0.11, 0));
  [[-0.038, -0.038], [0.038, -0.038], [-0.038, 0.038], [0.038, 0.038]].forEach(function (p) {
    g.add(box(0.024, 0.1, 0.024, M.timber, p[0], 0.05, p[1]));
  });
  return g;
}
function barrel(M) {
  var g = grp();
  g.add(cyl(0.07, 0.06, 0.14, 10, M.wood, 0, 0.07, 0));
  g.add(cyl(0.072, 0.072, 0.014, 10, M.timberD, 0, 0.045, 0));
  g.add(cyl(0.072, 0.072, 0.014, 10, M.timberD, 0, 0.105, 0));
  return g;
}

/* 灌丛 / 小树（草岛绿化） */
function bush(M, r, x, z) {
  var b = mesh(new THREE.IcosahedronGeometry(r, 0), M.grassD);
  b.position.set(x || 0, r * 0.85, z || 0); b.scale.y = 0.82; return b;
}
function tree(M, s, x, z) {
  var g = grp(); s = s || 1;
  g.position.set(x || 0, 0.03, z || 0);
  g.add(cyl(0.028 * s, 0.036 * s, 0.26 * s, 10, M.timber, 0, 0.13 * s, 0));
  var c1 = mesh(new THREE.IcosahedronGeometry(0.14 * s, 0), M.grassD); put(g, c1, 0, 0.32 * s, 0);
  var c2 = mesh(new THREE.IcosahedronGeometry(0.1 * s, 0), M.grassD); put(g, c2, 0.07 * s, 0.4 * s, 0.03 * s);
  return g;
}

/* 草岛地坪：草面 + 草沿 + 沙岩石板径 */
function padUnit(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.032, d + 0.04, M.grassD, 0, 0.015, 0));
  /* 石板径：主径两块 + 门前横板 */
  g.add(box(0.5, 0.016, 0.34, M.path, 0, 0.056, d / 2 - 0.3));
  g.add(box(0.42, 0.016, 0.3, M.pathD, 0.18, 0.056, d / 2 - 0.68));
  g.add(box(0.5, 0.016, 0.28, M.path, -0.16, 0.056, d / 2 - 1.0));
  return g;
}

/* lv4 金饰拱楣：红底金框雕花板 + 中央团窠 + 两端青金彩画板 + 垂沿 */
function goldLintel(M, w) {
  var g = grp();
  g.add(box(w, 0.16, 0.045, M.lacq, 0, 0.08, 0));
  g.add(box(w + 0.03, 0.022, 0.05, M.gold, 0, 0.155, 0));
  g.add(box(w + 0.03, 0.018, 0.05, M.gold, 0, 0.01, 0));
  var i, n = 3;
  for (i = 0; i < n; i++) {                                                   /* 鎏金卷草分隔 */
    g.add(box(0.018, 0.11, 0.052, M.gold, -w / 2 + (i + 0.5) * (w / n), 0.08, 0));
  }
  g.add(cyl(0.045, 0.045, 0.024, 14, M.goldBr, 0, 0.08, 0.028)).rotation.x = PI / 2;
  g.add(mesh(new THREE.TorusGeometry(0.027, 0.007, 6, 12), M.gold)).position.set(0, 0.08, 0.04);
  g.add(box(0.22, 0.13, 0.014, M.bracket, -w / 2 + 0.12, 0.08, 0.026));      /* 青金彩画 */
  g.add(box(0.22, 0.13, 0.014, M.bracket, w / 2 - 0.12, 0.08, 0.026));
  for (i = 0; i < 4; i++) {                                                   /* 波浪垂沿 */
    g.add(box(w / 4 - 0.02, 0.035, 0.016, M.gold, -w / 2 + (i + 0.5) * (w / 4), -0.008, 0.02));
  }
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：木瓦坡顶食摊小屋 + 蓝布凉棚 + 石灶沸锅（h≈1.05） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.2, 2.1));
  /* 灶台（左前）+ 食案（右前） */
  put(g, stove(M, 1.0, anims, 0.3), -0.52, 0.05, 0.58);
  var tb = foodTable(M, 0.78, {}); put(g, tb, 0.42, 0.05, 0.62);
  put(g, stool(M), 0.98, 0.05, 0.42);
  put(g, basket(M, 0.9), 0.06, 0.05, 0.92);
  /* 摊屋：条石基 + 深木框 + 奶油板墙（后半封闭） */
  g.add(box(1.28, 0.07, 0.94, M.stoneD, -0.06, 0.075, -0.16));
  g.add(box(1.2, 0.56, 0.86, M.plaster, -0.06, 0.39, -0.16));
  g.add(box(1.26, 0.05, 0.9, M.timber, -0.06, 0.695, -0.16));                 /* 檐枋 */
  [[-0.62, -0.55], [0.5, -0.55]].forEach(function (c) {
    g.add(box(0.07, 0.56, 0.07, M.timberD, c[0], 0.39, c[1]));
  });
  [[-0.62, 0.22], [0.5, 0.22]].forEach(function (c) {
    g.add(box(0.07, 0.56, 0.07, M.timberD, c[0], 0.39, c[1]));
  });
  /* 店口暖光内景：柜台 + 吊灯笼 + 腊味串 */
  var glow = box(1.04, 0.4, 0.1, M.paper, -0.06, 0.42, 0.2);
  g.add(glow);
  g.add(box(1.0, 0.05, 0.2, M.woodHi, -0.06, 0.3, 0.24));                     /* 柜面 */
  g.add(cyl(0.05, 0.055, 0.07, 10, M.pot, -0.3, 0.35, 0.24));
  g.add(cyl(0.045, 0.045, 0.05, 10, M.paper, 0.14, 0.35, 0.24));
  g.add(cyl(0.012, 0.012, 0.16, 10, M.fruit, -0.18, 0.52, 0.13));              /* 腊味串 */
  g.add(cyl(0.012, 0.012, 0.13, 10, M.fruit, -0.06, 0.5, 0.13));
  var ltIn = lantern(M, 0.6, anims, 2.6); put(g, ltIn, 0.3, 0.48, 0.2);
  /* 木瓦悬山顶（脊木杆翘头） */
  var roof = tileRoof(M, { w: 1.14, d: 0.88, h: 0.28, strips: 0, hip: false, hookS: 0.7, crest: false });
  roof.traverse(function (ch) {                                                 /* lv1 顶全树改木瓦材质 */
    if (!ch.isMesh) return;
    if (ch.material === M.roofSun) ch.material = M.shingle;
    else if (ch.material === M.roofShade) ch.material = M.shingleSd;
    else if (ch.material === M.goldBr || ch.material === M.gold) ch.material = M.woodHi;
    else if (ch.material === M.ridgeDk) ch.material = M.timberD;
    else if (ch.material === M.lacqDk) ch.material = M.timber;
  });
  var woodHookL = mesh(new THREE.TorusGeometry(0.042, 0.02, 6, 10, PI * 0.9), M.woodHi);
  put(roof, woodHookL, -0.68, 0.34, 0, 0, 0, -0.7);
  var woodHookR = mesh(new THREE.TorusGeometry(0.042, 0.02, 6, 10, PI * 0.9), M.woodHi);
  put(roof, woodHookR, 0.68, 0.34, 0, 0, 0, 0.7 + PI);
  /* 脊木杆：圆杆 + 两端雕花翘头 */
  var pole = cyl(0.03, 0.03, 1.3, 10, M.woodHi, 0, 0.335, 0); pole.rotation.z = PI / 2; roof.add(pole);
  put(g, roof, -0.06, 0.72, -0.16);                                            /* apex≈1.05 */
  /* 蓝布凉棚横跨店口（原点=前檐下缘，高斜不遮店） */
  var awn = canvasAwning(M, 1.02, { d: 0.3, drop: 0.2 });
  put(g, awn, -0.06, 0.44, 0.3);
  /* 左墙红帘幔 */
  var ct = curtainPanel(M, 0.34, 0.42); ct.rotation.y = PI / 2; put(g, ct, -0.68, 0.39, -0.16);
  /* 灯笼 ×2：檐下一 + 右柱外一 */
  var l1 = lantern(M, 0.72, anims, 0.9); put(g, l1, 0.5, 0.6, 0.34);
  var lp = cyl(0.016, 0.016, 0.5, 10, M.timberD, 0.92, 0.55, 0.5);
  g.add(lp);
  var l2 = lantern(M, 0.62, anims, 3.7); put(g, l2, 0.92, 0.72, 0.5);
  /* 短篱笆（左前）+ 草簇 + 奶罐 */
  var i;
  for (i = 0; i < 3; i++) g.add(box(0.032, 0.18, 0.032, M.wood, -0.9 + i * 0.15, 0.15, 0.85));
  g.add(box(0.36, 0.022, 0.028, M.timber, -0.75, 0.21, 0.85));
  g.add(bush(M, 0.07, -1.0, -0.3));
  g.add(cyl(0.05, 0.058, 0.1, 10, M.stone, 1.0, 0.1, -0.3));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.35 + 0.08 * sin(t * 1.05); });
  return g;
}

/* ---- lv2 洋房：两层瓦顶堂口 + 鎏金吻角 + 檐廊 + 星月幡杆（h≈1.60） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  var cx = 0.02;
  /* 主体两层：一层堂口 + 二层堂 */
  g.add(box(1.56, 0.09, 1.02, M.stoneD, cx, 0.085, -0.12));
  g.add(box(1.48, 0.56, 0.94, M.plaster, cx, 0.41, -0.12));                    /* 一层 0.13-0.69 */
  g.add(box(1.56, 0.05, 1.0, M.lacqDk, cx, 0.715, -0.12));                     /* 层间枋 */
  g.add(box(1.34, 0.48, 0.86, M.plaster, cx, 0.99, -0.14));                    /* 二层 0.74-1.23 */
  /* 一层门脸：朱柱 + 暖光店口 + 柜面 + 红帘 */
  var cL = column(M, 0.52, 0.032); put(g, cL, cx - 0.56, 0.13, 0.36);
  var cR = column(M, 0.52, 0.032); put(g, cR, cx + 0.56, 0.13, 0.36);
  var glow = box(1.0, 0.42, 0.08, M.paper, cx + 0.08, 0.42, 0.325); g.add(glow);
  g.add(box(0.98, 0.05, 0.18, M.woodHi, cx + 0.1, 0.29, 0.37));
  g.add(cyl(0.05, 0.055, 0.06, 10, M.pot, cx - 0.14, 0.335, 0.37));
  g.add(cyl(0.04, 0.042, 0.05, 10, M.paper, cx + 0.32, 0.33, 0.37));
  var ct = curtainPanel(M, 0.36, 0.44); put(g, ct, cx - 0.62, 0.35, 0.35);
  /* 二层：檐廊 + 暖窗 ×3 + 角柱 */
  var bal = balustrade(M, 1.28); put(g, bal, cx, 0.74, 0.3);
  var w1 = latticeWindow(M, 0.24, 0.26, { rows: 3 }); put(g, w1, cx - 0.4, 1.0, 0.29);
  var w2 = latticeWindow(M, 0.24, 0.26, { rows: 3 }); put(g, w2, cx + 0.04, 1.0, 0.29);
  var w3 = latticeWindow(M, 0.2, 0.24, { rows: 3 }); put(g, w3, cx + 0.42, 1.0, 0.29);
  [[-0.63], [0.63]].forEach(function (s) {
    g.add(cyl(0.03, 0.032, 0.5, 10, M.lacqBr, cx + s[0], 0.99, 0.28));
  });
  /* 炭青瓦庑殿顶 + 大金钩（apex≈1.60） */
  var roof = tileRoof(M, { w: 1.3, d: 0.98, h: 0.26, strips: 4, hookS: 1.0 });
  put(g, roof, cx, 1.245, -0.12);
  /* 蓝布凉棚 + 食街（前场） */
  var awn = canvasAwning(M, 1.14, { d: 0.32, drop: 0.24, poles: true, frontY: 0.42 });
  put(g, awn, cx + 0.06, 0.42, 0.4);
  put(g, stove(M, 0.95, anims, 1.1), cx - 0.78, 0.05, 0.72);
  var tb = foodTable(M, 0.9, {}); put(g, tb, cx + 0.18, 0.05, 0.76);
  put(g, stool(M), cx + 0.86, 0.05, 0.56);
  put(g, basket(M, 1.0), cx + 0.72, 0.05, 0.95);
  put(g, barrel(M), cx - 1.02, 0.05, 0.3);
  /* 星月幡杆（右前） */
  var bn = crescentBanner(M, 1.32, anims, 0.7); put(g, bn, 1.06, 0.05, 0.42);
  /* 灯笼 ×4：檐柱 ×2 + 二层廊 ×2 */
  var l1 = lantern(M, 0.62, anims, 0.4); put(g, l1, cx - 0.78, 0.58, 0.44);
  var l2 = lantern(M, 0.62, anims, 2.2); put(g, l2, cx + 0.78, 0.58, 0.44);
  var l3 = lantern(M, 0.5, anims, 3.4); put(g, l3, cx - 0.56, 1.06, 0.3);
  var l4 = lantern(M, 0.5, anims, 4.8); put(g, l4, cx + 0.56, 1.06, 0.3);
  /* 绿化 + 草簇 */
  g.add(tree(M, 1.0, -1.12, -0.7));
  g.add(bush(M, 0.08, 1.16, -0.62));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：三层退台 + 层层腰檐 + 大金角 + 条纹凉棚 + 双幡（h≈2.08） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35));
  var cx = -0.08;
  /* 三层退台：一层 1.56 宽 → 二层 1.34 → 三层 1.12 */
  g.add(box(1.6, 0.09, 1.04, M.stoneD, cx, 0.085, -0.14));
  g.add(box(1.5, 0.5, 0.94, M.plaster, cx, 0.385, -0.14));                     /* 一层 0.13-0.635 */
  var e1 = waistEave(M, { w: 1.38, d: 0.9, h: 0.1, hookS: 0.72 }); put(g, e1, cx, 0.655, -0.14);
  g.add(box(1.36, 0.42, 0.86, M.plaster, cx, 0.905, -0.16));                   /* 二层 0.695-1.115 */
  var e2 = waistEave(M, { w: 1.16, d: 0.8, h: 0.095, hookS: 0.66 }); put(g, e2, cx, 1.125, -0.16);
  g.add(box(1.14, 0.42, 0.78, M.plaster, cx, 1.375, -0.18));                   /* 三层 1.165-1.585 */
  /* 一层门脸：朱柱 + 店口 + 红帘 + 凉棚 */
  var cL = column(M, 0.48, 0.03); put(g, cL, cx - 0.58, 0.13, 0.35);
  var cR = column(M, 0.48, 0.03); put(g, cR, cx + 0.58, 0.13, 0.35);
  var glow = box(1.02, 0.38, 0.08, M.paper, cx + 0.1, 0.4, 0.325); g.add(glow);
  g.add(box(1.0, 0.05, 0.18, M.woodHi, cx + 0.12, 0.27, 0.37));
  g.add(cyl(0.05, 0.055, 0.06, 10, M.pot, cx - 0.1, 0.315, 0.37));
  var ct = curtainPanel(M, 0.34, 0.42); put(g, ct, cx - 0.64, 0.34, 0.35);
  var awn = canvasAwning(M, 1.2, { d: 0.32, drop: 0.24, poles: true, frontY: 0.4 });
  put(g, awn, cx + 0.08, 0.4, 0.4);
  /* 二层/三层：栏杆檐廊 + 暖窗 */
  var b2 = balustrade(M, 1.24); put(g, b2, cx, 0.7, 0.28);
  var w21 = latticeWindow(M, 0.22, 0.24, { rows: 3 }); put(g, w21, cx - 0.36, 0.92, 0.28);
  var w22 = latticeWindow(M, 0.22, 0.24, { rows: 3 }); put(g, w22, cx + 0.04, 0.92, 0.28);
  var w23 = latticeWindow(M, 0.18, 0.22, { rows: 3 }); put(g, w23, cx + 0.4, 0.92, 0.28);
  var b3 = balustrade(M, 1.04); put(g, b3, cx, 1.135, 0.26);
  var w31 = latticeWindow(M, 0.2, 0.22, { rows: 3 }); put(g, w31, cx - 0.24, 1.36, 0.24);
  var w32 = latticeWindow(M, 0.2, 0.22, { rows: 3 }); put(g, w32, cx + 0.16, 1.36, 0.24);
  [[-0.52], [0.52]].forEach(function (s) {
    g.add(cyl(0.028, 0.03, 0.44, 10, M.lacqBr, cx + s[0], 1.36, 0.245));
  });
  /* 顶：炭青瓦庑殿 + 大金钩 + 金饰（apex≈2.08） */
  var roof = tileRoof(M, { w: 1.06, d: 0.9, h: 0.3, strips: 4, hookS: 1.25 });
  put(g, roof, cx, 1.615, -0.18);
  /* 侧摊条纹凉棚（右前） */
  var st = grp(); put(g, st, 0.98, 0.05, 0.62);
  st.add(box(0.5, 0.035, 0.3, M.woodHi, 0, 0.22, 0));
  [[-0.2, -0.1], [0.2, -0.1], [-0.2, 0.1], [0.2, 0.1]].forEach(function (p) {
    st.add(box(0.03, 0.2, 0.03, M.timber, p[0], 0.1, p[1]));
  });
  var stAwn = canvasAwning(M, 0.56, { d: 0.3, drop: 0.13, striped: true });
  put(st, stAwn, 0, 0.3, 0.04);
  st.add(cyl(0.05, 0.055, 0.05, 10, M.pot, 0.08, 0.27, 0));
  /* 食街：灶 + 案 + 筐凳桶 */
  put(g, stove(M, 1.0, anims, 2.2), -1.02, 0.05, 0.66);
  var tb1 = foodTable(M, 0.84, {}); put(g, tb1, cx + 0.16, 0.05, 0.78);
  put(g, stool(M), cx - 0.34, 0.05, 1.0);
  put(g, basket(M, 0.9), cx + 0.66, 0.05, 1.06);
  put(g, barrel(M), -0.94, 0.05, -0.5);
  /* 星月双幡（左右） */
  var bn1 = crescentBanner(M, 1.46, anims, 1.2); put(g, bn1, 1.08, 0.05, 0.3);
  var bn2 = crescentBanner(M, 1.3, anims, 3.3); put(g, bn2, -1.08, 0.05, -0.62);
  /* 灯笼 ×5 */
  var l1 = lantern(M, 0.58, anims, 0.6); put(g, l1, cx - 0.8, 0.56, 0.44);
  var l2 = lantern(M, 0.58, anims, 2.0); put(g, l2, cx + 0.8, 0.56, 0.44);
  var l3 = lantern(M, 0.48, anims, 3.2); put(g, l3, cx - 0.6, 1.05, 0.28);
  var l4 = lantern(M, 0.48, anims, 4.4); put(g, l4, cx + 0.6, 1.05, 0.28);
  var l5 = lantern(M, 0.44, anims, 5.6); put(g, l5, cx - 0.5, 1.5, 0.24);
  /* 绿化 */
  g.add(tree(M, 1.05, 1.04, -0.78));
  g.add(bush(M, 0.085, -1.12, -0.84));
  g.add(bush(M, 0.06, 1.14, 0.9));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.12 + 0.9); });
  return g;
}

/* ---- lv4 地标：石台基 + 朱柱廊 + 红金拱楣 + 双层庑殿金顶 + 金塔刹（h≈2.72） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.4));
  /* 石台基 + 垂带踏步 */
  g.add(box(2.14, 0.16, 1.6, M.stone, 0, 0.12, -0.08));
  g.add(box(2.22, 0.05, 1.66, M.stoneD, 0, 0.025, -0.08));
  g.add(box(0.7, 0.06, 0.18, M.stoneD, 0, 0.2, 0.78));
  g.add(box(0.56, 0.05, 0.16, M.stoneD, 0, 0.255, 0.68));
  /* 朱柱廊 ×4（石础金脚）承下檐 */
  var xs = [-0.78, -0.27, 0.27, 0.78];
  var i;
  for (i = 0; i < 4; i++) {
    var c = column(M, 0.78, 0.036, true);
    put(g, c, xs[i], 0.2, 0.52);
  }
  /* 廊内暖光 + 货台 */
  var glow = box(1.44, 0.44, 0.08, M.paper, 0, 0.5, 0.42); g.add(glow);
  g.add(box(1.34, 0.05, 0.16, M.woodHi, 0, 0.38, 0.44));
  /* 红金拱楣（入口雕花枋）+ 青金彩画 */
  var lin = goldLintel(M, 1.6); put(g, lin, 0, 0.96, 0.52);
  /* 下层庑殿金顶（金痕瓦面，apex≈1.55） */
  var r1 = tileRoof(M, { w: 1.9, d: 1.3, h: 0.27, strips: 4, hookS: 1.35 });
  put(g, r1, 0, 1.16, -0.08);
  /* 金痕瓦面：坡面贴金薄片 ×4 */
  [[-0.5, 0.45], [0.1, 0.5], [-0.3, -0.42], [0.4, -0.4]].forEach(function (p, k) {
    var fl = box(0.16 + (k % 2) * 0.07, 0.006, 0.1 + (k % 3) * 0.03, M.gold);
    put(r1, fl, p[0], 0.16 - (k % 2) * 0.03, p[1], Math.atan2(0.27, 0.73) * (p[1] > 0 ? 1 : -1), 0, 0);
  });
  /* 上层朱墙殿身（收分）+ 金带 + 暖窗 ×2 + 栏杆环 */
  g.add(box(1.22, 0.58, 0.92, M.lacq, 0, 1.545, -0.08));                       /* 1.255-1.835 */
  g.add(box(1.3, 0.035, 0.98, M.gold, 0, 1.85, -0.08));
  g.add(box(1.3, 0.03, 0.98, M.gold, 0, 1.27, -0.08));
  var w41 = latticeWindow(M, 0.18, 0.2, { rows: 2 }); put(g, w41, -0.3, 1.56, 0.385);
  var w42 = latticeWindow(M, 0.18, 0.2, { rows: 2 }); put(g, w42, 0.3, 1.56, 0.385);
  var ring = balustrade(M, 1.36); put(g, ring, 0, 1.885, 0.44);
  /* 上层庑殿金顶（大金钩，apex≈2.2） */
  var r2 = tileRoof(M, { w: 1.12, d: 0.96, h: 0.32, strips: 4, hookS: 1.5 });
  put(g, r2, 0, 1.87, -0.08);
  /* 金塔刹（顶珠≈2.72） */
  var sp = finialSpire(M, 1.15); put(g, sp, 0, 2.19, -0.08);
  /* 灯笼 ×6：廊柱一排 + 上层两角 */
  var lx = [-0.78, -0.27, 0.27, 0.78];
  for (i = 0; i < 4; i++) {
    var l = lantern(M, 0.5, anims, 0.7 + i * 1.3);
    put(g, l, lx[i], 0.78, 0.56);
  }
  var lu1 = lantern(M, 0.46, anims, 4.2); put(g, lu1, -0.62, 1.82, 0.44);
  var lu2 = lantern(M, 0.46, anims, 5.3); put(g, lu2, 0.62, 1.82, 0.44);
  /* 星月双幡（台基两侧） */
  var bn1 = crescentBanner(M, 1.62, anims, 0.9); put(g, bn1, 1.08, 0.05, 0.4);
  var bn2 = crescentBanner(M, 1.5, anims, 3.1); put(g, bn2, -1.08, 0.05, 0.4);
  /* 食街全景：双灶 + 大案 + 筐桶 */
  put(g, stove(M, 1.05, anims, 0.4), -0.72, 0.05, 0.85);
  put(g, stove(M, 0.9, anims, 2.9), 0.98, 0.05, 0.62);
  var tb1 = foodTable(M, 0.9, {}); put(g, tb1, 0.14, 0.05, 0.95);
  put(g, basket(M, 1.05), 0.52, 0.05, 1.2);
  put(g, barrel(M), -1.18, 0.05, 0.14);
  /* 绿化：台基两侧小树 + 灌丛 */
  g.add(tree(M, 1.1, 1.08, -0.72));
  g.add(tree(M, 0.9, -1.12, -0.8));
  g.add(bush(M, 0.09, -1.18, 0.78));
  g.add(bush(M, 0.075, 1.16, 0.94));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.35 + 0.08 * sin(t * 1.08 + 1.4); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[26] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_26_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 26;
  g.userData.level = lv;
  g.userData.region = 'g6';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
