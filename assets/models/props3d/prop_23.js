/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_23.js
 * -------------------------------------------------------------------------------------
 * 格 23「山塘街」(g5 江南烟雨) 独属建筑：枕河人家四阶生长史
 * 参考图 refs/prop_23.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见
 * .img2threejs/evidence_prop23/object-sculpt-spec.json，strict PASS）。
 *
 * 风格族谱（同一块水边地界的同一种生长）：
 *   lv1 小屋   全木板壁小屋 + 木瓦坡顶 + 垂柳 + 晾衣杆（h≈1.14）
 *   lv2 洋房   粉墙两开间（铺面蓝布棚 + 耳房）+ 层层瓦顶（h≈1.67）
 *   lv3 大厦   四层退台白塔楼 + 层层挑檐 + 绿布棚茶肆 + 垂柳（h≈2.20）
 *   lv4 地标   石台基 + 双踏步 + 三重歇山金饰楼阁 + 花树 + 灯船（h≈2.6）
 *
 * 独有语汇（自参考图提炼，与 prop_1/prop_3 的差异点见文末注释）：
 *   · 石驳岸小岛 + 环岛碧水 + 河埠踏步（每阶必有 —— 水乡识别件）
 *   · 篷船（乌篷船）每阶泊于右前，lv4 加灯彩
 *   · 黛瓦层层叠叠 + 卷尾翘角（屋脊端部螺旋卷钩）
 *   · 粉墙 + 深色木构架/木格窗（2×3 井字格）
 *   · 布棚铺面（lv2 蓝 / lv3 绿）、红灯笼、lv4 金饰 + 红金挂屏 + 金字匾
 *   · 垂柳（lv1/lv3）→ 绿树（lv2）→ 粉红花树（lv4）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[23] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_23] THREE 未定义，请先加载 three.min.js (r147)');
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

/* 黛瓦：横向垄线明暗 + 竖向接头错缝 + 瓦面噪点（比烟袋斜街灰瓦更冷更黑） */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#3b4046'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#464c54' : '#3a3f46';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#26282c'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#5a6068'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh * 0.5 : 0;
    for (k = 0; k < 5; k++) {
      var x = (off + k * (S / 5)) % S;
      g.fillStyle = 'rgba(22,24,27,0.6)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.045)' : 'rgba(12,14,17,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 木瓦/木板：横板接缝 + 木纹丝缕（lv1 屋面与墙板共用） */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#96794c'; g.fillRect(0, 0, S, S);
  var rows = 7, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#9a7b4f' : '#8f7346';
    g.fillRect(0, y, S, rh);
    g.fillStyle = 'rgba(64,46,26,0.85)'; g.fillRect(0, y + rh - 2, S, 2);
    g.fillStyle = 'rgba(220,196,150,0.25)'; g.fillRect(0, y + 1, S, 1);
    for (k = 0; k < 5; k++) {
      g.fillStyle = 'rgba(74,54,30,0.22)';
      g.fillRect((i * 23 + k * 31) % S, y + 3, 1, rh - 6);
    }
  }
  return toTex(cv, true);
}
/* 粉墙：暖白抹灰 + 值域斑驳 + 底部灰渍 */
function texPlaster() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e4ddcb'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,252,0.07)' : 'rgba(140,130,108,0.07)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  g.fillStyle = 'rgba(120,132,100,0.16)'; g.fillRect(0, S - 8, S, 8);
  return toTex(cv, true);
}
/* 石驳岸：块石错缝砌 + 暖灰 + 勾缝（map+bump 同源） */
function texStone() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b3a78e'; g.fillRect(0, 0, S, S);
  var rows = 4, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S, w = S / 3 - 3;
      g.fillStyle = ((i + k) % 2) ? '#b8ac93' : '#ab9f86';
      g.fillRect(x + 1, y + 1, w, rh - 3);
      g.fillStyle = 'rgba(110,100,80,0.55)';
      g.fillRect(x, y, w + 2, 2);
      g.fillRect(x, y, 2, rh);
    }
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,240,0.06)' : 'rgba(70,62,46,0.08)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 碧水：横向波纹 + 岸线白沫点（emissive 微亮，rough 低） */
function texWater() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#6fa8a2'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 26; i++) {
    g.fillStyle = (i % 2) ? 'rgba(156,200,194,0.5)' : 'rgba(87,140,134,0.45)';
    g.fillRect(0, (i * 5 + 2) % S, S, 2);
  }
  for (i = 0; i < 40; i++) {
    g.fillStyle = 'rgba(234,239,239,0.35)';
    g.fillRect((i * 31) % S, (i * 17) % S, 3, 1);
  }
  return toTex(cv, true);
}
/* 篷：竹编篷面深色条带（乌篷船顶） */
function texCanopy() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#4a4a3e'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 8; i++) {
    g.fillStyle = (i % 2) ? '#5c5c4c' : '#3a3a30';
    g.fillRect(0, i * 8, S, 8);
    g.fillStyle = 'rgba(24,24,18,0.6)'; g.fillRect(0, i * 8 + 7, S, 1);
  }
  return toTex(cv, true);
}
/* 金字横匾「山塘街」：黑漆金边 + 金字（lv4 门额 / lv3 金匾） */
function texPlaque() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2c1c0e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9a83e'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#eac46a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 38px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('山 塘 街', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
/* lv4 红金挂屏：朱底 + 金团花 + 角饰 */
function texPanel() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b23020'; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#d9a83e'; g.lineWidth = 5; g.strokeRect(8, 8, S - 16, S - 16);
  g.fillStyle = '#d9a83e';
  g.beginPath(); g.arc(S / 2, S / 2, 26, 0, PI * 2); g.fill();
  g.fillStyle = '#b23020';
  g.beginPath(); g.arc(S / 2, S / 2, 17, 0, PI * 2); g.fill();
  g.fillStyle = '#d9a83e';
  g.beginPath(); g.arc(S / 2, S / 2, 8, 0, PI * 2); g.fill();
  [[14, 14], [S - 14, 14], [14, S - 14], [S - 14, S - 14]].forEach(function (p) {
    g.fillRect(p[0] - 5, p[1] - 5, 10, 10);
  });
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图逐区取样） */
function Mats() {
  return {
    roofSun:   MAT('p23roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.68 }); }),
    roofShade: MAT('p23roofShd', function () { var t = getTex('tile', texTile); return std('#9aa2ac', { map: t, bump: t, bumpScale: 0.014, rough: 0.74 }); }),
    shingle:   MAT('p23shingle', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.82 }); }),
    shingleSd: MAT('p23shingleSd', function () { var t = getTex('plank', texPlank); return std('#8a8478', { map: t, bump: t, bumpScale: 0.016, rough: 0.85 }); }),
    ridge:     MAT('p23ridge', function () { return std('#2c2f34', { rough: 0.75 }); }),
    plaster:   MAT('p23plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    plank:     MAT('p23plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.85 }); }),
    timber:    MAT('p23timber', function () { return std('#6b4a2c', { rough: 0.8 }); }),
    timberD:   MAT('p23timberD', function () { return std('#54381f', { rough: 0.85 }); }),
    timberL:   MAT('p23timberL', function () { return std('#8a6238', { rough: 0.75 }); }),
    stone:     MAT('p23stone', function () { var t = getTex('stone', texStone); return std('#ffffff', { map: t, bump: t, bumpScale: 0.015, rough: 0.9 }); }),
    stoneD:    MAT('p23stoneD', function () { return std('#97896e', { rough: 0.92 }); }),
    water:     MAT('p23water', function () { var t = getTex('water', texWater); return std('#ffffff', { map: t, rough: 0.22, metal: 0.06, emissive: '#2e5a55', ei: 0.12 }); }),
    hull:      MAT('p23hull', function () { return std('#7d5a34', { rough: 0.78 }); }),
    hullD:     MAT('p23hullD', function () { return std('#5e4325', { rough: 0.82 }); }),
    canopy:    MAT('p23canopy', function () { var t = getTex('canopy', texCanopy); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.88 }); }),
    gold:      MAT('p23gold', function () { return std('#d9a83e', { rough: 0.35, metal: 0.75 }); }),
    lacq:      MAT('p23lacq', function () { return std('#b23020', { rough: 0.55 }); }),
    awnBlue:   MAT('p23awnBlue', function () { return std('#4a7ab0', { rough: 0.8 }); }),
    awnBlueD:  MAT('p23awnBlueD', function () { return std('#3a669a', { rough: 0.85 }); }),
    awnGreen:  MAT('p23awnGreen', function () { return std('#5d7a4a', { rough: 0.8 }); }),
    awnGreenD: MAT('p23awnGreenD', function () { return std('#4c663c', { rough: 0.85 }); }),
    willow:    MAT('p23willow', function () { return std('#8aa84e', { rough: 0.95 }); }),
    willowL:   MAT('p23willowL', function () { return std('#a8c464', { rough: 0.95 }); }),
    leafGreen: MAT('p23leafGreen', function () { return std('#5f8f3e', { rough: 0.95 }); }),
    blossom:   MAT('p23blossom', function () { return std('#e8aeb8', { rough: 0.95 }); }),
    blossomL:  MAT('p23blossomL', function () { return std('#f0c2ca', { rough: 0.95 }); }),
    grass:     MAT('p23grass', function () { return std('#86a850', { rough: 0.95 }); }),
    grassD:    MAT('p23grassD', function () { return std('#6e9040', { rough: 0.95 }); }),
    moss:      MAT('p23moss', function () { return std('#788464', { rough: 0.95 }); }),
    path:      MAT('p23path', function () { return std('#c4bba8', { rough: 0.95 }); }),
    cloth:     MAT('p23cloth', function () { return std('#d8cfa8', { rough: 0.9 }); }),
    paper:     MAT('p23paper', function () { return std('#efe8d8', { rough: 0.9, emissive: '#ffd98a', ei: 0.16 }); })
  };
}

/* ================= 2. 预制件（山塘街独有语汇） ================= */

/* 卷尾翘角：屋脊端部/戗角尖的螺旋卷钩（两段小盒内外翻转叠出钩形，参考图钩形脊尾） */
function curlEnd(M, s, goldMat) {
  var g = grp(); s = s || 1;
  var m = goldMat || M.ridge;
  var a = box(0.075 * s, 0.05 * s, 0.06 * s, m, 0, 0, 0); a.rotation.z = 0.55; g.add(a);
  var b = box(0.055 * s, 0.045 * s, 0.05 * s, m, 0.028 * s, 0.045 * s, 0); b.rotation.z = -0.5; g.add(b);
  return g;
}

/* 黛瓦双坡顶（悬山）：迎光/背光坡 + 黑瓦正脊 + 卷尾翘角 + 封檐板 + 山墙
 * o.shingle=true 时用木瓦（lv1 初创期），o.gold=true 时脊端卷钩为鎏金（lv4） */
function gableRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var strips = o.strips !== undefined ? o.strips : 0;
  var sun = o.shingle ? M.shingle : M.roofSun;
  var shade = o.shingle ? M.shingleSd : M.roofShade;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.032, slopeLen, k > 0 ? sun : shade, 0, 0, k * slopeLen / 2));
    for (i = 0; i < strips; i++) {
      var u = (i + 0.5) / strips;
      sg.add(box(w + over * 2 - 0.04, 0.014, 0.028, M.ridge, 0, 0.024, k * u * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.048, 0.022, M.timberD, 0, -0.004, k * eave));
  }
  if (o.gable !== false) {                                    /* 山墙封板（悬山） */
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.042, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plaster); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.021); g.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plaster); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.021); g.add(t2);
  }
  if (o.ridge !== false) {
    var rw = o.ridgeW || (w + over * 2 + 0.04);
    g.add(box(rw, 0.055 + (o.big ? 0.02 : 0), 0.085, M.ridge, 0, h + 0.028, 0));
    var c1 = curlEnd(M, o.big ? 1.15 : 1, o.gold ? M.gold : null);
    put(g, c1, rw / 2 - 0.015, h + 0.05, 0);
    var c2 = curlEnd(M, o.big ? 1.15 : 1, o.gold ? M.gold : null);
    c2.rotation.y = PI; put(g, c2, -rw / 2 + 0.015, h + 0.05, 0);
  }
  return g;
}

/* 歇山/庑殿式四坡顶（lv3 顶 / lv4 各重檐）：四坡 + 四戗角起翘卷尾 + 短正脊
 * o.gold=true：鎏金卷尾 + 脊上金鞍座（lv4） */
function hipRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.09, eaveS = w / 2 + 0.09;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.74 + 0.18, 0.032, lenF, M.roofSun, 0, 0, lenF / 2));
  sgF.add(box(w * 0.74 + 0.2, 0.048, 0.022, M.timberD, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.74 + 0.18, 0.032, lenF, M.roofShade, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.032, d * 0.82, M.roofShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.032, d * 0.82, M.roofShade, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var cm = box(0.07, 0.05, 0.07, M.ridge, c[0] * (eaveS - 0.02), 0.045, c[1] * (eaveF - 0.02));
    cm.rotation.z = -c[0] * 0.6; g.add(cm);
    var tip = curlEnd(M, 0.85, o.gold ? M.gold : null);
    tip.rotation.y = (c[0] * c[1] > 0) ? PI / 2 : -PI / 2;
    put(g, tip, c[0] * (eaveS + 0.02), 0.085, c[1] * (eaveF - 0.02));
  });
  g.add(box(w * 0.5, 0.06 + (o.gold ? 0.015 : 0), 0.085, M.ridge, 0, h + 0.03, 0));
  var f1 = box(0.055, 0.11, 0.075, M.ridge, w * 0.25, h + 0.09, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.055, 0.11, 0.075, M.ridge, -w * 0.25, h + 0.09, 0); f2.rotation.z = -0.4; g.add(f2);
  if (o.gold) {                                               /* lv4 脊上金鞍座 */
    [[w * 0.12], [-w * 0.12]].forEach(function (x) {
      g.add(box(0.09, 0.05, 0.06, M.gold, x[0], h + 0.085, 0));
    });
  }
  return g;
}

/* 木格窗：深木框 + 纸面 + 2×3 井字格（参考图窗格，几何花格非贴图） */
function latticeWin(M, w, h, o) {
  o = o || {};
  var g = grp();
  g.add(box(w + 0.045, h + 0.045, 0.03, M.timberD));
  g.add(box(w, h, 0.028, M.paper, 0, 0, 0.004));
  var i;
  for (i = 1; i < 2; i++) {                                   /* 竖棂 ×1 → 2 列 */
    g.add(box(0.026, h, 0.034, M.timber, -w / 4 + (i - 1) * w / 2, 0, 0.008));
  }
  for (i = 0; i < 2; i++) {                                   /* 横格 ×2 → 3 行 */
    var y = -h / 2 + (i + 1) * h / 3;
    g.add(box(w, 0.022, 0.034, M.timber, 0, y, 0.008));
  }
  return g;
}

/* 木板门：深木门扇 + 门框 + 门槛石（y0 = 门槛地面线） */
function timberDoor(M, w, h, y0) {
  var g = grp();
  g.add(box(w + 0.08, h + 0.05, 0.04, M.timberD, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.042, M.timberL, 0, y0 + h / 2, 0.005));
  g.add(box(w * 0.94, 0.028, 0.046, M.timberD, 0, y0 + h * 0.62, 0.012));
  g.add(box(w * 0.94, 0.028, 0.046, M.timberD, 0, y0 + h * 0.3, 0.012));
  g.add(sph(0.016, M.gold, w * 0.32, y0 + h * 0.46, 0.028));
  return g;
}

/* 木栏杆挑廊：地栿 + 望柱直棂 + 扶手（参考图深木色栏杆） */
function balustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.18, M.timberD, 0, 0, 0.09));
  var n = Math.max(5, Math.round(w / 0.095)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.14, 0.015, M.timber, -w / 2 + i * (w / n), 0.085, 0.172));
  }
  g.add(box(w + 0.04, 0.028, 0.03, M.timberD, 0, 0.163, 0.172));
  return g;
}

/* 红灯笼：金盖金底 + 红壳（呼吸）+ 穗（材质按 phase 分组共享） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p23lant' + (phase || 0), function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.034 * s, 0.048 * s, 0.032 * s, 8, M.gold, 0, 0.11 * s, 0));
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.048 * s, 0.034 * s, 0.032 * s, 8, M.gold, 0, -0.1 * s, 0));
  g.add(box(0.014 * s, 0.07 * s, 0.014 * s, M.lacq, 0, -0.16 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 布棚铺面：斜坡布面 + 波浪垂边 + 两根斜撑木柱（lv2 蓝 / lv3 绿） */
function awning(M, w, d, mat, matD) {
  var g = grp();
  g.add(box(w, 0.022, d, mat, 0, 0, -d * 0.1, 0));
  g.rotation.x = -0.32;
  var n = Math.round(w / 0.16), i;
  for (i = 0; i < n; i++) {
    g.add(box(w / n - 0.012, 0.05, 0.014, matD, -w / 2 + (i + 0.5) * (w / n), -0.032, d * 0.42));
  }
  return g;
}

/* 垂柳 / 绿树 / 花树：干 + 冠 + 下垂枝叶（sway 摆动，幅度克制）
 * kind: 'willow' | 'green' | 'blossom' */
function treeAt(M, h, anims, phase, kind) {
  var g = grp();
  var trunkH = h * 0.52;
  g.add(cyl(0.022, 0.038, trunkH, 7, M.timberD, 0, trunkH / 2, 0));
  g.add(cyl(0.014, 0.02, trunkH * 0.55, 6, M.timberD, 0.05, trunkH * 1.1, 0.02));
  var crown = grp(); crown.position.set(0, trunkH * 1.08, 0); g.add(crown);
  var i;
  if (kind === 'green') {
    for (i = 0; i < 3; i++) {
      var blob = mesh(new THREE.IcosahedronGeometry(h * 0.21 - i * 0.012, 0), i % 2 ? M.leafGreen : M.willow);
      put(crown, blob, (i - 1) * 0.09, h * 0.16 + i * 0.05, (i % 2) * 0.06 - 0.02);
    }
  } else if (kind === 'blossom') {
    for (i = 0; i < 4; i++) {
      var bb = mesh(new THREE.IcosahedronGeometry(h * 0.17 - (i % 2) * 0.02, 0), i % 2 ? M.blossomL : M.blossom);
      put(crown, bb, (i - 1.5) * 0.08, h * 0.13 + (i % 2) * 0.06, (i % 2) * 0.08 - 0.03);
    }
  } else {                                                    /* 垂柳：三条下垂叶幕 */
    for (i = 0; i < 3; i++) {
      var frond = mesh(new THREE.SphereGeometry(h * 0.17 - i * 0.015, 10, 8), i % 2 ? M.willowL : M.willow);
      frond.scale.y = 1.65;
      put(crown, frond, (i - 1) * 0.11, h * 0.1, (i % 2) * 0.05 - 0.02);
    }
  }
  anims.push(function (t) { crown.rotation.z = sin(t * 0.9 + (phase || 0)) * 0.04; });
  return g;
}

/* 晾衣杆（lv1）：双柱 + 横杆 + 两片布衣（flutter 摆动） */
function laundryLine(M, anims, phase) {
  var g = grp();
  g.add(box(0.035, 0.42, 0.035, M.timberD, -0.22, 0.21, 0));
  g.add(box(0.035, 0.42, 0.035, M.timberD, 0.22, 0.21, 0));
  g.add(box(0.5, 0.024, 0.024, M.timberD, 0, 0.42, 0));
  var cl1 = box(0.13, 0.16, 0.012, M.cloth, -0.1, 0.33, 0);
  var cl2 = box(0.12, 0.15, 0.012, M.paper, 0.09, 0.325, 0);
  g.add(cl1); g.add(cl2);
  anims.push(function (t) {
    cl1.rotation.x = sin(t * 1.6 + (phase || 0)) * 0.08;
    cl2.rotation.x = sin(t * 1.6 + (phase || 0) + 0.9) * 0.08;
  });
  return g;
}

/* 篷船（乌篷船）：船底 + 两舷 + 船头/船尾起翘 + 篷拱 + 橹 + 篙（bob 浮动）
 * s 缩放，fancy=true 时加灯彩（lv4）：首尾灯挂 + 红沿条 */
function sampan(M, s, anims, phase, fancy) {
  var g = grp(); s = s || 1;
  var L = 1.05 * s, W = 0.3 * s;
  var hull = grp(); g.add(hull);
  hull.add(box(W, 0.05 * s, L, M.hullD, 0, 0.025 * s, 0));
  [-1, 1].forEach(function (sg) {
    hull.add(box(0.03 * s, 0.075 * s, L * 0.96, M.hull, sg * W / 2, 0.075 * s, 0));
  });
  var bow = box(W * 0.9, 0.055 * s, 0.3 * s, M.hull, 0, 0.09 * s, L / 2 - 0.08 * s);
  bow.rotation.x = -0.4; hull.add(bow);
  var stern = box(W * 0.9, 0.05 * s, 0.22 * s, M.hull, 0, 0.085 * s, -L / 2 + 0.06 * s);
  stern.rotation.x = 0.45; hull.add(stern);
  hull.add(box(W + 0.05 * s, 0.02 * s, L * 0.9, M.hullD, 0, 0.118 * s, 0.02 * s));
  /* 篷拱（船尾半段）：三段斜板搭拱 + 两道篾箍 */
  var can = grp(); can.position.set(0, 0.12 * s, -L * 0.16); g.add(can);
  var cw = 0.4 * s, segs = 3, i;
  for (i = 0; i < segs; i++) {
    var p = (i - (segs - 1) / 2) * 0.16 * s;
    can.add(box(cw, 0.016 * s, 0.2 * s, M.canopy, 0, 0.075 * s - Math.abs(p) * 0.35, p));
  }
  [-1, 1].forEach(function (sg) {
    can.add(box(0.016 * s, 0.16 * s, 0.5 * s, M.hullD, sg * cw / 2, 0.03 * s, 0));
  });
  /* 橹（船尾斜出，贴水面）+ 篙 */
  var oar = box(0.022 * s, 0.022 * s, 0.44 * s, M.hullD, W * 0.42, 0.16 * s, -L * 0.38);
  oar.rotation.x = 0.5; oar.rotation.z = -0.15; hull.add(oar);
  hull.add(cyl(0.012 * s, 0.012 * s, 0.5 * s, 5, M.timberD, -W * 0.3, 0.3 * s, L * 0.28));
  if (fancy) {                                                /* lv4 灯彩 */
    hull.add(box(cw + 0.03 * s, 0.02 * s, 0.5 * s, M.lacq, 0, 0.155 * s, -L * 0.16));
    var lt1 = lantern(M, 0.5, anims, 3.3); put(hull, lt1, W * 0.42, 0.3 * s, L * 0.3);
    var lt2 = lantern(M, 0.5, anims, 4.4); put(hull, lt2, -W * 0.42, 0.3 * s, -L * 0.34);
  }
  var baseY = 0.016;
  anims.push(function (t) {
    g.position.y = baseY + 0.008 * sin(t * 1.5 + (phase || 0));
    g.rotation.z = 0.012 * sin(t * 1.1 + (phase || 0) * 1.3);
  });
  return g;
}

/* 石驳岸小岛：环岛碧水 + 块石驳岸四壁 + 石板面 + 草沿 + 水位青苔 + 河埠踏步
 * 所有四阶共用此底座（水乡识别件）。返回 { g, top } top=可建面高度 */
function quayIsland(M, W, D, anims) {
  var g = grp();
  /* 碧水（含白沫沿，收在占地包络内） */
  g.add(box(W + 0.12, 0.016, D + 0.12, M.water, 0, 0.008, 0));
  /* 块石驳岸四壁（水位线以下略深） */
  g.add(box(W, 0.2, 0.16, M.stone, 0, 0.11, (D - 0.16) / 2));
  g.add(box(W, 0.2, 0.16, M.stone, 0, 0.11, -(D - 0.16) / 2));
  g.add(box(0.16, 0.2, D - 0.32, M.stone, (W - 0.16) / 2, 0.11, 0));
  g.add(box(0.16, 0.2, D - 0.32, M.stone, -(W - 0.16) / 2, 0.11, 0));
  /* 水位青苔带 */
  g.add(box(W + 0.02, 0.03, 0.17, M.moss, 0, 0.075, (D - 0.16) / 2));
  g.add(box(W + 0.02, 0.03, 0.17, M.moss, 0, 0.075, -(D - 0.16) / 2));
  /* 石板台面 + 拼缝 */
  g.add(box(W - 0.1, 0.05, D - 0.1, M.stone, 0, 0.225, 0));
  g.add(box(W - 0.24, 0.012, D - 0.24, M.path, 0, 0.252, 0));
  /* 草沿（前后缘 + 右后角草皮） */
  g.add(box(W - 0.2, 0.028, 0.1, M.grass, 0, 0.262, (D - 0.1) / 2 - 0.12));
  g.add(box(W - 0.2, 0.028, 0.1, M.grassD, 0, 0.262, -(D - 0.1) / 2 + 0.14));
  g.add(box(0.34, 0.028, 0.16, M.grass, W / 2 - 0.32, 0.262, -D / 2 + 0.26));
  /* 河埠踏步：左前三级下到水面（收在占地包络内） */
  var sx = -W / 2 + 0.42;
  g.add(box(0.4, 0.06, 0.18, M.stoneD, sx, 0.19, D / 2 + 0.05));
  g.add(box(0.4, 0.05, 0.18, M.stoneD, sx, 0.125, D / 2 + 0.14));
  g.add(box(0.4, 0.045, 0.18, M.stoneD, sx, 0.065, D / 2 + 0.23));
  return { g: g, top: 0.25 };
}

/* 立式招牌 / 茶肆金匾（共享 canvas） */
function goldPlaque(M, w, h) {
  var g = grp();
  g.add(box(w + 0.03, h + 0.03, 0.024, M.timberD));
  var plq = mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: getTex('plaque', texPlaque), roughness: 0.55, metalness: 0.12, flatShading: true }));
  plq.position.z = 0.014; g.add(plq);
  return g;
}
/* lv4 红金挂屏（ tier 山墙装饰面） */
function goldPanel(M, w, h) {
  var g = grp();
  g.add(box(w + 0.026, h + 0.026, 0.022, M.gold));
  var plq = mesh(new THREE.PlaneGeometry(w, h),
    new THREE.MeshStandardMaterial({ map: getTex('panel', texPanel), roughness: 0.6, metalness: 0.08, flatShading: true }));
  plq.position.z = 0.013; g.add(plq);
  return g;
}
/* 石灯柱（lv4 驳岸上） */
function lanternPost(M, h) {
  var g = grp();
  g.add(cyl(0.03, 0.04, 0.05, 8, M.stoneD, 0, 0.025, 0));
  g.add(cyl(0.02, 0.024, h, 6, M.stone, 0, 0.05 + h / 2, 0));
  g.add(box(0.075, 0.05, 0.075, M.stoneD, 0, 0.05 + h + 0.025, 0));
  g.add(box(0.05, 0.055, 0.05, M.paper, 0, 0.05 + h + 0.075, 0));
  return g;
}
/* 木桶 / 缸（lv1/道具） */
function barrel(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.055 * s, 0.062 * s, 0.13 * s, 10, M.timber, 0, 0.065 * s, 0));
  g.add(cyl(0.064 * s, 0.064 * s, 0.012 * s, 10, M.timberD, 0, 0.09 * s, 0));
  g.add(cyl(0.064 * s, 0.064 * s, 0.012 * s, 10, M.timberD, 0, 0.04 * s, 0));
  return g;
}
/* 盆栽 */
function potted(M, s, leafMat) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.08 * s, 10, M.stoneD, 0, 0.04 * s, 0));
  var b = mesh(new THREE.IcosahedronGeometry(0.062 * s, 0), leafMat || M.grassD);
  b.scale.y = 0.85; put(g, b, 0, 0.115 * s, 0);
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */
/* 台面可建高度 top=0.25（石板面）。高度带从 y=0（水面）算起。 */

/* ---- lv1 小屋：全木板壁小屋 + 木瓦顶 + 垂柳 + 晾衣杆（h≈1.17） ---- */
function level1(M, anims) {
  var q = quayIsland(M, 2.3, 2.06, anims), g = q.g, top = q.top;
  /* 木板壁小屋（左后） */
  var hx = -0.14, hz = -0.08;
  g.add(box(1.08, 0.53, 0.8, M.plank, hx, top + 0.265, hz));
  [[-0.58, -0.44], [0.58, -0.44], [-0.58, 0.44], [0.58, 0.44]].forEach(function (c) {
    g.add(box(0.062, 0.55, 0.062, M.timberD, hx + c[0], top + 0.275, hz + c[1]));
  });
  g.add(box(1.24, 0.06, 0.06, M.timberD, hx, top + 0.565, hz + 0.45));
  /* 门（偏右）+ 木格窗（左）+ 门槛石 */
  var door = timberDoor(M, 0.26, 0.38, top); put(g, door, hx + 0.24, 0, hz + 0.415);
  var win = latticeWin(M, 0.26, 0.28); put(g, win, hx - 0.26, top + 0.28, hz + 0.405);
  g.add(box(0.36, 0.04, 0.16, M.stoneD, hx + 0.24, top + 0.02, hz + 0.47));
  /* 木瓦坡顶（参考图 lv1 是木板瓦，卷尾翘角已成形）apex≈1.17 */
  var roof = gableRoof(M, { w: 1.1, d: 0.84, h: 0.26, over: 0.14, strips: 3, shingle: true });
  put(g, roof, hx, top + 0.53, hz);
  /* 垂柳（左后，顶 ≈1.12） */
  var willow = treeAt(M, 0.92, anims, 0.7, 'willow'); put(g, willow, -0.82, top, -0.52);
  /* 晾衣杆（右前）+ 木桶 ×2 + 盆栽 */
  var laun = laundryLine(M, anims, 1.5); put(g, laun, 0.78, top, 0.42);
  var b1 = barrel(M, 1); put(g, b1, 0.34, top, 0.6);
  var b2 = barrel(M, 0.85); put(g, b2, 0.52, top, 0.66);
  var pot1 = potted(M, 1); put(g, pot1, -0.66, top, 0.62);
  /* 石板小径（门→河埠） */
  g.add(box(0.32, 0.012, 0.5, M.path, hx + 0.24, top + 0.007, hz + 0.72));
  /* 篷船（右前水面） */
  var boat = sampan(M, 0.92, anims, 0.4, false); put(g, boat, 0.5, 0.016, 0.76);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.05 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：粉墙两开间（蓝布棚铺面 + 两层耳房）+ 瓦顶两重（h≈1.66） ---- */
function level2(M, anims) {
  var q = quayIsland(M, 2.46, 2.2, anims), g = q.g, top = q.top;
  var fx = -0.36;                                             /* 主间中心 */
  /* 主间两层粉墙 */
  g.add(box(1.5, 0.56, 0.92, M.plaster, fx, top + 0.28, -0.06));   /* 一层 0.25-0.81 */
  g.add(box(1.56, 0.045, 0.96, M.timber, fx, top + 0.575, -0.055));/* 楼板枋 */
  g.add(box(1.42, 0.44, 0.86, M.plaster, fx, top + 0.8, -0.07));   /* 二层 0.83-1.27 */
  /* 一层门脸：木板门 + 敞口柜 + 蓝布棚 + 斜撑柱 */
  var door = timberDoor(M, 0.28, 0.4, top); put(g, door, fx - 0.5, 0, 0.42);
  var win1 = latticeWin(M, 0.22, 0.24); put(g, win1, fx + 0.52, top + 0.3, 0.42);
  var awn = awning(M, 1.06, 0.44, M.awnBlue, M.awnBlueD); put(g, awn, fx - 0.12, top + 0.56, 0.52);
  g.add(box(0.04, 0.52, 0.04, M.timberD, fx - 0.6, top + 0.26, 0.72));
  g.add(box(0.04, 0.52, 0.04, M.timberD, fx + 0.36, top + 0.26, 0.72));
  /* 柜台 + 货担 */
  g.add(box(0.78, 0.08, 0.3, M.timberD, fx - 0.08, top + 0.2, 0.6));
  g.add(box(0.7, 0.05, 0.24, M.timberL, fx - 0.08, top + 0.27, 0.6));
  g.add(box(0.16, 0.07, 0.12, M.cloth, fx - 0.24, top + 0.32, 0.6));
  g.add(box(0.14, 0.06, 0.1, M.willow, fx + 0.02, top + 0.32, 0.6));
  /* 二层：木栏杆挑廊 + 木格窗 ×2 + 隔门板 */
  var balc = balustrade(M, 1.3); put(g, balc, fx, top + 0.6, 0.4);
  var w1 = latticeWin(M, 0.26, 0.28); put(g, w1, fx - 0.34, top + 0.78, 0.375);
  var w2 = latticeWin(M, 0.26, 0.28); put(g, w2, fx + 0.24, top + 0.78, 0.375);
  g.add(box(0.22, 0.36, 0.04, M.timberD, fx + 0.58, top + 0.76, 0.375));
  /* 耳房（右）：两层粉墙 + 两重小瓦顶 */
  var wx = 0.66;
  g.add(box(0.74, 0.5, 0.88, M.plaster, wx, top + 0.25, -0.16));   /* 0.25-0.75 */
  g.add(box(0.78, 0.4, 0.84, M.plaster, wx, top + 0.84, -0.18));   /* 0.89-1.29 */
  var wDoor = timberDoor(M, 0.24, 0.36, top); put(g, wDoor, wx - 0.1, 0, 0.29);
  var wWin = latticeWin(M, 0.2, 0.22); put(g, wWin, wx + 0.2, top + 0.28, 0.29);
  var wWin2 = latticeWin(M, 0.18, 0.2); put(g, wWin2, wx, top + 0.76, 0.245);
  var lt3 = lantern(M, 0.5, anims, 2.6); put(g, lt3, wx - 0.32, top + 0.52, 0.3);
  /* 瓦顶两重 + 耳房两顶（apex≈1.66） */
  var main = gableRoof(M, { w: 1.34, d: 0.94, h: 0.25, strips: 3, big: true });
  put(g, main, fx, top + 1.02, -0.06);                        /* 1.27+卷尾 */
  var wing1 = gableRoof(M, { w: 0.62, d: 0.8, h: 0.15, strips: 2, gable: false });
  put(g, wing1, wx, top + 0.52, -0.16);
  var wing2 = gableRoof(M, { w: 0.66, d: 0.78, h: 0.15, strips: 2 });
  put(g, wing2, wx, top + 1.04, -0.18);                       /* apex≈1.57 */
  /* 灯笼：棚角 + 廊下 */
  var l1 = lantern(M, 0.6, anims, 0.8); put(g, l1, fx + 0.44, top + 0.5, 0.62);
  var l2 = lantern(M, 0.55, anims, 1.9); put(g, l2, fx - 0.72, top + 0.94, 0.5);
  /* 绿树（右后 h≈1.31） */
  var tree = treeAt(M, 1.12, anims, 2.2, 'green'); put(g, tree, 1.0, top, -0.56);
  /* 盆栽 + 石凳 */
  var pot1 = potted(M, 1.1); put(g, pot1, wx + 0.44, top, 0.36);
  g.add(box(0.3, 0.05, 0.16, M.stoneD, -0.92, top + 0.14, 0.6));
  g.add(box(0.05, 0.14, 0.14, M.stoneD, -1.04, top + 0.07, 0.6));
  g.add(box(0.05, 0.14, 0.14, M.stoneD, -0.8, top + 0.07, 0.6));
  /* 篷船 */
  var boat = sampan(M, 0.98, anims, 0.9, false); put(g, boat, 0.56, 0.016, 0.78);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.05 * sin(t * 1.1 + 0.4); });
  return g;
}

/* ---- lv3 大厦：四层退台白塔楼 + 层层挑檐 + 绿布棚茶肆 + 垂柳（h≈2.28） ---- */
function level3(M, anims) {
  var q = quayIsland(M, 2.46, 2.2, anims), g = q.g, top = q.top;
  var fx = -0.22;
  /* 四层退台：层层收分 + 每层挑檐 */
  g.add(box(1.52, 0.42, 0.94, M.plaster, fx, top + 0.21, -0.04));  /* 一层 0.25-0.67 */
  g.add(box(1.4, 0.4, 0.88, M.plaster, fx, top + 0.62, -0.06));    /* 二层 0.67-1.07 */
  g.add(box(1.26, 0.38, 0.82, M.plaster, fx, top + 1.01, -0.08));  /* 三层 1.07-1.45 */
  g.add(box(1.1, 0.47, 0.76, M.plaster, fx, top + 1.435, -0.1));   /* 四层 1.45-1.92 */
  /* 一层茶肆门脸：木门 + 敞口柜 + 绿布棚 + 茶桌凳 */
  var door = timberDoor(M, 0.28, 0.4, top); put(g, door, fx - 0.56, 0, 0.43);
  var awn = awning(M, 1.0, 0.42, M.awnGreen, M.awnGreenD); put(g, awn, fx + 0.1, top + 0.54, 0.5);
  g.add(box(0.04, 0.5, 0.04, M.timberD, fx - 0.34, top + 0.25, 0.7));
  g.add(box(0.04, 0.5, 0.04, M.timberD, fx + 0.52, top + 0.25, 0.7));
  var tbl = box(0.4, 0.045, 0.26, M.timberL, fx + 0.16, top + 0.22, 0.72); g.add(tbl);
  [[-0.14], [0.14]].forEach(function (o) {
    g.add(box(0.035, 0.2, 0.035, M.timberD, fx + 0.16 + o[0], top + 0.1, 0.72));
  });
  g.add(box(0.13, 0.06, 0.1, M.cloth, fx + 0.05, top + 0.27, 0.72));
  var winS = latticeWin(M, 0.2, 0.22); put(g, winS, fx + 0.58, top + 0.3, 0.44);
  /* 二/三层：木栏杆挑廊 + 木格窗；四层高窗 */
  var b2 = balustrade(M, 1.24); put(g, b2, fx, top + 0.45, 0.42);
  var b3 = balustrade(M, 1.1); put(g, b3, fx, top + 0.87, 0.38);
  var w21 = latticeWin(M, 0.24, 0.26); put(g, w21, fx - 0.28, top + 0.8, 0.4);
  var w22 = latticeWin(M, 0.24, 0.26); put(g, w22, fx + 0.26, top + 0.8, 0.4);
  var w31 = latticeWin(M, 0.22, 0.24); put(g, w31, fx - 0.22, top + 1.21, 0.345);
  var w32 = latticeWin(M, 0.22, 0.24); put(g, w32, fx + 0.24, top + 1.21, 0.345);
  var w41 = latticeWin(M, 0.2, 0.22); put(g, w41, fx - 0.18, top + 1.64, 0.29);
  var w42 = latticeWin(M, 0.2, 0.22); put(g, w42, fx + 0.2, top + 1.64, 0.29);
  /* 金匾（二层檐下）+ 层层挑檐（披檐 ×3）+ 顶四坡（apex≈2.28） */
  var plq = goldPlaque(M, 0.34, 0.1); put(g, plq, fx - 0.02, top + 1.11, 0.36);
  var a1 = gableRoof(M, { w: 1.42, d: 0.56, h: 0.12, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, a1, fx, top + 0.65, 0.14);
  var a2 = gableRoof(M, { w: 1.28, d: 0.52, h: 0.12, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, a2, fx, top + 1.05, 0.12);
  var a3 = gableRoof(M, { w: 1.12, d: 0.5, h: 0.12, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, a3, fx, top + 1.43, 0.1);
  var top4 = hipRoof(M, { w: 1.1, d: 0.7, h: 0.22 }); put(g, top4, fx, top + 1.67, -0.1); /* 1.92+卷尾≈2.30 大顶檐 */
  /* 灯笼 ×4（一/二层檐下） */
  var l1 = lantern(M, 0.55, anims, 0.6); put(g, l1, fx - 0.62, top + 0.42, 0.5);
  var l2 = lantern(M, 0.55, anims, 1.9); put(g, l2, fx + 0.66, top + 0.42, 0.5);
  var l3 = lantern(M, 0.5, anims, 2.8); put(g, l3, fx - 0.56, top + 0.84, 0.46);
  var l4 = lantern(M, 0.5, anims, 4.0); put(g, l4, fx + 0.6, top + 0.84, 0.46);
  /* 垂柳（右 h≈1.47）+ 墙面爬藤 + 盆栽 */
  var willow = treeAt(M, 1.3, anims, 1.2, 'willow'); put(g, willow, 1.0, top, -0.52);
  var ivy1 = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); ivy1.scale.y = 1.4;
  put(g, ivy1, fx + 0.55, top + 0.5, 0.435);
  var ivy2 = mesh(new THREE.IcosahedronGeometry(0.055, 0), M.leafGreen);
  put(g, ivy2, fx - 0.62, top + 1.18, 0.375);
  var pot1 = potted(M, 1.05); put(g, pot1, -1.04, top, 0.56);
  var pot2 = potted(M, 0.9, M.leafGreen); put(g, pot2, 0.96, top, 0.46);
  /* 篷船 */
  var boat = sampan(M, 1.0, anims, 1.4, false); put(g, boat, 0.56, 0.016, 0.78);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.05 * sin(t * 1.12 + 0.8); });
  return g;
}

/* ---- lv4 地标：石台基 + 双踏步 + 三重金饰楼阁 + 花树 + 灯船（h≈2.83） ---- */
function level4(M, anims) {
  var q = quayIsland(M, 2.4, 2.2, anims), g = q.g, top = q.top;
  /* 石台基 + 垂带双踏步 */
  g.add(box(1.98, 0.19, 1.5, M.stone, 0, top + 0.095, -0.08));
  g.add(box(2.06, 0.045, 1.56, M.stoneD, 0, top + 0.022, -0.08));
  [[-0.5], [0.5]].forEach(function (o) {                      /* 双踏步 */
    g.add(box(0.5, 0.06, 0.18, M.stoneD, o[0], top + 0.155, 0.78));
    g.add(box(0.42, 0.055, 0.16, M.stoneD, o[0], top + 0.2, 0.68));
    g.add(box(0.05, 0.1, 0.2, M.stoneD, o[0] * 0.78, top + 0.13, 0.8));
  });
  /* 石灯柱 ×2（驳岸） */
  var lp1 = lanternPost(M, 0.34); put(g, lp1, -1.0, top, 0.84);
  var lp2 = lanternPost(M, 0.34); put(g, lp2, 1.0, top, 0.84);
  /* 三重楼阁（中央） */
  var cz = -0.14;
  /* 一重：粉墙大堂 + 木柱 + 红金挂屏 + 门 */
  g.add(box(1.3, 0.6, 0.92, M.plaster, 0, top + 0.295, cz));  /* 0.25-0.85 */
  [[-0.5, cz + 0.4], [0.5, cz + 0.4], [-0.2, cz + 0.46], [0.2, cz + 0.46]].forEach(function (c) {
    g.add(cyl(0.032, 0.038, 0.58, 10, M.timber, c[0], top + 0.29, c[1]));
  });
  var gp1 = goldPanel(M, 0.2, 0.34); put(g, gp1, -0.48, top + 0.36, cz + 0.47);
  var gp2 = goldPanel(M, 0.2, 0.34); put(g, gp2, 0.48, top + 0.36, cz + 0.47);
  var door = timberDoor(M, 0.3, 0.44, top); put(g, door, 0, 0, cz + 0.47);
  var w1 = latticeWin(M, 0.2, 0.24); put(g, w1, -0.22, top + 0.42, cz + 0.475);
  var w2 = latticeWin(M, 0.2, 0.24); put(g, w2, 0.22, top + 0.42, cz + 0.475);
  /* 金字门匾 */
  var plq = goldPlaque(M, 0.44, 0.12); put(g, plq, 0, top + 0.78, cz + 0.44);
  /* 一重檐（四坡 + 鎏金）apex≈1.18 */
  var e1 = hipRoof(M, { w: 1.24, d: 0.84, h: 0.22, gold: true }); put(g, e1, 0, top + 0.9, cz);
  /* 二重：木构层 + 栏杆 + 窗 + 挂屏 */
  g.add(box(1.02, 0.48, 0.8, M.timberL, 0, top + 1.26, cz));  /* 1.02-1.5 */
  var b2 = balustrade(M, 0.94); put(g, b2, 0, top + 1.05, cz + 0.34);
  var w3 = latticeWin(M, 0.18, 0.22); put(g, w3, -0.2, top + 1.32, cz + 0.415);
  var w4 = latticeWin(M, 0.18, 0.22); put(g, w4, 0.2, top + 1.32, cz + 0.415);
  var gp3 = goldPanel(M, 0.16, 0.28); put(g, gp3, -0.42, top + 1.28, cz + 0.36);
  var gp4 = goldPanel(M, 0.16, 0.28); put(g, gp4, 0.42, top + 1.28, cz + 0.36);
  /* 二重檐 apex≈1.79 */
  var e2 = hipRoof(M, { w: 1.02, d: 0.74, h: 0.2, gold: true }); put(g, e2, 0, top + 1.54, cz);
  /* 三重：粉墙阁 + 窗 */
  g.add(box(0.84, 0.4, 0.7, M.plaster, 0, top + 1.89, cz));   /* 1.74-2.14 */
  var w5 = latticeWin(M, 0.16, 0.2); put(g, w5, -0.16, top + 2.0, cz + 0.36);
  var w6 = latticeWin(M, 0.16, 0.2); put(g, w6, 0.16, top + 2.0, cz + 0.36);
  /* 顶檐 + 宝顶金珠（总高≈2.88） */
  var e3 = hipRoof(M, { w: 0.86, d: 0.66, h: 0.26, gold: true }); put(g, e3, 0, top + 2.14, cz);
  g.add(box(0.05, 0.12, 0.05, M.gold, 0, top + 2.45, cz));
  g.add(sph(0.045, M.gold, 0, top + 2.54, cz));
  /* 灯笼 ×6：一重檐下 ×2 + 二重 ×2 + 台基口 ×2 */
  var l1 = lantern(M, 0.6, anims, 0.3); put(g, l1, -0.72, top + 0.72, cz + 0.5);
  var l2 = lantern(M, 0.6, anims, 1.7); put(g, l2, 0.72, top + 0.72, cz + 0.5);
  var l3 = lantern(M, 0.52, anims, 2.4); put(g, l3, -0.6, top + 1.45, cz + 0.42);
  var l4 = lantern(M, 0.52, anims, 3.6); put(g, l4, 0.6, top + 1.45, cz + 0.42);
  var l5 = lantern(M, 0.56, anims, 0.9); put(g, l5, -0.66, top + 0.4, 0.74);
  var l6 = lantern(M, 0.56, anims, 2.9); put(g, l6, 0.66, top + 0.4, 0.74);
  /* 花树（右后 h≈1.43）+ 灌丛 + 盆栽 */
  var blossom = treeAt(M, 1.2, anims, 0.4, 'blossom'); put(g, blossom, 0.98, top, -0.62);
  var bush1 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.grassD); bush1.scale.y = 0.8;
  put(g, bush1, -0.93, top + 0.28, -0.86);
  var pot1 = potted(M, 1.1); put(g, pot1, -0.9, top, 0.58);
  /* 灯彩篷船（首尾挂灯） */
  var boat = sampan(M, 1.04, anims, 2.0, true); put(g, boat, 0.52, 0.016, 0.78);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.05 * sin(t * 1.05 + 1.2); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[23] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_23_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 23;
  g.userData.level = lv;
  g.userData.region = 'g5';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();

/* -------------------------------------------------------------------------------------
 * 与 prop_1（南锣鼓巷）/prop_3（烟袋斜街）的差异点（自参考图 prop_23.png 提炼）：
 * 1. 水乡识别件：石驳岸小岛 + 环岛碧水（水纹 canvas）+ 河埠三级踏步 —— 每阶必有，
 *    prop_1/prop_3 是草地/街面地坪，无水面无河埠。
 * 2. 篷船：乌篷船（船底+起翘首尾+篾篷拱+橹）每阶泊于右前，随级微增，lv4 加首尾灯彩；
 *    prop_1/prop_3 无船。
 * 3. 屋顶语汇：黛瓦（更冷更黑的 #3b4046 系）+ 屋脊端部螺旋卷尾翘角（curlEnd 双段钩），
 *    lv1 先以木瓦过渡（参考图 lv1 是木板瓦小屋），lv3 逐层挑檐、lv4 三重四坡鎏金；
 *    prop_1 是灰瓦曲坡、prop_3 是灰陶瓦+朱漆封檐。
 * 4. 立面语汇：粉墙 + 深木构架 + 2×3 木格窗（prop_3 是青砖白缝高窗 + 白纸木格）。
 * 5. 铺面语汇：布棚（lv2 蓝 / lv3 绿，波浪垂边 + 斜撑柱）+ 茶桌凳；
 *    prop_3 是朱漆柜台 + 葫芦杆（山塘街不用葫芦杆）。
 * 6. 植栽语汇：垂柳（lv1/lv3）→ 绿树（lv2）→ 粉红花树（lv4），prop_1/prop_3 无柳无花树。
 * 7. lv4 地标：石台基 + 双踏步 + 石灯柱 + 红金挂屏 + 金字「山塘街」匾 + 宝顶金珠；
 *    prop_3 是石狮朱门两厢歇山，prop_1 是红柱三重檐 —— 各不相同。
 * ------------------------------------------------------------------------------------ */
