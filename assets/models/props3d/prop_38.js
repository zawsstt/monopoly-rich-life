/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_38.js
 * -------------------------------------------------------------------------------------
 * 格 38「士林夜市」(g8) 独属建筑：台湾夜市美食街四阶生长史
 * 视觉基准：refs/prop_38.png（四阶一体参考图，唯一视觉真源；img2threejs 流程：
 * blockout→structure→form→material→lighting→interaction→optimization；
 * spec 已过 --strict-quality，证据存 .img2threejs_p38/）。
 *
 * 风格族谱（同一块地的同一种生长——夜市美食街）：
 *   lv1 小屋   木造小吃摊车：拼板人字棚 + 灶面锅具蒸汽 + 灯串门柱 + 双灯笼（h≈1.05）
 *   lv2 洋房   横向两开间：绿雨棚 + 红白条纹棚双摊位、二层檐廊、蓝瓦悬山 +
 *              翘窗老虎窗 + 棚顶灯串（h≈1.66）
 *   lv3 大厦   三层砖砌商住楼：奶石砌角 + 暖百叶窗 + 直立金字招牌「士林夜市」 +
 *              蓝雨棚 + 屋顶晒台（灯串 + 脚架水塔）（h≈2.23）
 *   lv4 地标   夜市牌楼 + 三层殿座商楼：翘角青瓦顶层层起台、金龙双踞、
 *              红白大条纹棚下蒸汽食桌、灯笼阵 + 灯串网（h≈2.60）
 *
 * 独有语汇（自参考图逐区采样；与 prop_9 黑瓦庙市骑楼 / prop_10 岭南茶楼拉开）：
 *   1) 灯串（每阶必有）：木杆间悬垂灯泡串，暖泡分组呼吸 + 整串微摆
 *   2) 三色雨棚序列：绿棚(lv2) / 红白条纹棚(lv2,lv4) / 蓝棚(lv3)，扇贝垂边
 *   3) 摊车灶面（每阶必有）：锅具 + 汤色 + 蒸汽缕（升起-放大-循环）
 *   4) 直立金字招牌（lv3）：黑框金底「士林夜市」竖牌；lv4 牌楼横匾
 *   5) 屋顶晒台 + 脚架水塔（lv3）：台湾屋顶天际线
 *   6) 翘角青瓦殿顶 + 金龙对（lv4）：庙口夜市终极形态
 *   7) 草皮基座 + 石板小径（每阶必有，参考图绿边）
 *
 * 材质：MeshStandardMaterial（convertSRGBToLinear）；纹理全部 Canvas 程序化（≤256px）；
 * 光照：不添加灯光，暖光家族（灯笼/灯泡/窗纸/招牌/汤色）用 emissive 克制表达。
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[38] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 每级 mesh ≤220；group.userData.anim = [fn(t, dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_38] THREE 未定义，请先加载 three.min.js (r147)');
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
    transparent: !!o.opac, opacity: (o.opac !== undefined ? o.opac : 1)
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

/* 拼木板（lv1 棚面/摊车）：横板明暗 + 板缝 + 旧化噪点 */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#84786a'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#8d8172' : '#7c7060';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#5c5245'; g.fillRect(0, y + rh - 2, S, 2);
    g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillStyle = 'rgba(52,46,38,0.5)'; g.fillRect(x, y, 2, rh - 2);
    }
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(30,26,20,0.10)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 蓝灰石瓦（lv2 顶）：瓦垄横行 + 接头错缝 */
function texSlate() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#56688a'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#5d7094' : '#4f6182';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#3c4c68'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#6d82a8'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(44,56,78,0.55)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  return toTex(cv, true);
}
/* 青瓦（lv3 晒台/lv4 殿顶）：偏绿釉面横垄 */
function texTeal() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#3f7d70'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#478878' : '#39725f';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#2a5247'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#5aa08c'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(34,66,54,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.fillRect((i * 47) % S, (i * 71) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 砖墙（lv3）：tan 砖 + 米色缝，错缝顺砌 */
function texBrick() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#a5805a'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = '#d8c9a8'; g.fillRect(0, y + rh - 2, S, 2);
    var off = (i % 2) ? S / 8 : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillRect(x, y, 2, rh - 2);
      g.fillStyle = (k + i) % 3 ? 'rgba(255,255,255,0.06)' : 'rgba(90,64,40,0.12)';
      g.fillRect(x + 3, y + 1, S / 4 - 5, rh - 4);
      g.fillStyle = '#d8c9a8';
    }
  }
  return toTex(cv, true);
}
/* 红白条纹棚布：竖条 + 布面阴影（lv2 右/lv4 大棚） */
function texStripe() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#ece4d2'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 8; i++) {
    g.fillStyle = (i % 2) ? '#c8402e' : '#ece4d2';
    g.fillRect(i * (S / 8), 0, S / 8, S);
    g.fillStyle = 'rgba(90,30,20,0.10)';
    g.fillRect(i * (S / 8) + S / 8 - 3, 0, 3, S);
  }
  for (i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(120,110,90,0.06)';
    g.fillRect((i * 53) % S, (i * 37) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 直立招牌「士林夜市」：黑框金底 + 墨字竖排（lv3） */
function texSignV() {
  var w = 128, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#3a2c14'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8c86a'; g.fillRect(10, 10, w - 20, h - 20);
  g.fillStyle = '#f0d488'; g.fillRect(14, 14, w - 28, h / 2 - 14);
  g.strokeStyle = '#8a6a24'; g.lineWidth = 4; g.strokeRect(12, 12, w - 24, h - 24);
  g.fillStyle = '#4a3210'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 46px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '士林夜市', i;
  for (i = 0; i < 4; i++) g.fillText(s[i], w / 2, 50 + i * 52);
  return toTex(cv, true);
}
/* 横式牌匾「士林夜市」（lv4 牌楼横枋） */
function texPlaque() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#3a2c14'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#e8c86a'; g.fillRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#f0d488'; g.fillRect(10, 10, w - 20, (h - 20) / 2);
  g.strokeStyle = '#8a6a24'; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16);
  g.fillStyle = '#4a3210'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('士林夜市', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
/* 小黑板（摊车菜单）：墨底 + 粉笔涂鸦 */
function texChalk() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#33342f'; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#6b5a3e'; g.lineWidth = 5; g.strokeRect(2, 2, S - 4, S - 4);
  g.strokeStyle = 'rgba(230,225,210,0.75)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(12, 18); g.lineTo(46, 16); g.stroke();
  g.beginPath(); g.moveTo(12, 30); g.lineTo(52, 29); g.stroke();
  g.beginPath(); g.moveTo(12, 42); g.lineTo(38, 43); g.stroke();
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图取样） */
function Mats() {
  return {
    plank:     MAT('p38plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.82 }); }),
    plankShade:MAT('p38plankS', function () { var t = getTex('plank', texPlank); return std('#b9b0a2', { map: t, bump: t, bumpScale: 0.014, rough: 0.86 }); }),
    slate:     MAT('p38slate', function () { var t = getTex('slate', texSlate); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.7 }); }),
    slateShade:MAT('p38slateS', function () { var t = getTex('slate', texSlate); return std('#a8b2c4', { map: t, bump: t, bumpScale: 0.012, rough: 0.74 }); }),
    teal:      MAT('p38teal', function () { var t = getTex('teal', texTeal); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.62 }); }),
    tealShade: MAT('p38tealS', function () { var t = getTex('teal', texTeal); return std('#9dbcae', { map: t, bump: t, bumpScale: 0.012, rough: 0.66 }); }),
    brick:     MAT('p38brick', function () { var t = getTex('brick', texBrick); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.9 }); }),
    cream:     MAT('p38cream', function () { return std('#d6c8a8', { rough: 0.9 }); }),
    creamD:    MAT('p38creamD', function () { return std('#bfb08c', { rough: 0.92 }); }),
    stone:     MAT('p38stone', function () { return std('#aba79a', { rough: 0.9 }); }),
    stoneD:    MAT('p38stoneD', function () { return std('#8b877b', { rough: 0.92 }); }),
    red:       MAT('p38red', function () { return std('#b03a28', { rough: 0.55 }); }),
    redD:      MAT('p38redD', function () { return std('#8e2e20', { rough: 0.62 }); }),
    stripe:    MAT('p38stripe', function () { var t = getTex('stripe', texStripe); return std('#ffffff', { map: t, rough: 0.8 }); }),
    stripeSd:  MAT('p38stripeSd', function () { var t = getTex('stripe', texStripe); return std('#c9c2b2', { map: t, rough: 0.84 }); }),
    greenF:    MAT('p38greenF', function () { return std('#4a7d52', { rough: 0.8 }); }),
    greenFd:   MAT('p38greenFd', function () { return std('#3c6a44', { rough: 0.84 }); }),
    blueF:     MAT('p38blueF', function () { return std('#4a6f9e', { rough: 0.8 }); }),
    blueFd:    MAT('p38blueFd', function () { return std('#3c5c86', { rough: 0.84 }); }),
    wood:      MAT('p38wood', function () { return std('#8a6a48', { rough: 0.82 }); }),
    woodD:     MAT('p38woodD', function () { return std('#5f4a34', { rough: 0.86 }); }),
    ink:       MAT('p38ink', function () { return std('#2a2e33', { rough: 0.8 }); }),
    gold:      MAT('p38gold', function () { return std('#d8a63c', { rough: 0.3, metal: 0.75 }); }),
    steel:     MAT('p38steel', function () { return std('#8a8f96', { rough: 0.5, metal: 0.6 }); }),
    jade:      MAT('p38jade', function () { return std('#4f8a5e', { rough: 0.5 }); }),
    grass:     MAT('p38grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p38grassD', function () { return std('#698f4c', { rough: 0.95 }); }),
    path:      MAT('p38path', function () { return std('#c6bca4', { rough: 0.95 }); }),
    bush:      MAT('p38bush', function () { return std('#5c8a4a', { rough: 0.95 }); }),
    /* 暖光家族（参考图黄昏光感，emissive 克制） */
    paper:     MAT('p38paper', function () { return std('#f2e6c8', { rough: 0.9, emissive: '#ffd98a', ei: 0.34 }); }),
    soup:      MAT('p38soup', function () { return std('#c8862e', { rough: 0.5, emissive: '#ff9a3c', ei: 0.4 }); }),
    steamM:    function () { return std('#f4f0e8', { rough: 0.9, emissive: '#fff6e8', ei: 0.16, opac: 0.42 }); }
  };
}

/* ================= 2. 预制件（夜市独有语汇） ================= */

/* 红灯笼：金盖金底 + 红壳 + 金穗（材质分 3 相位共享呼吸） */
function lanternMat(phase) {
  return MAT('p38lant' + phase, function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
}
function lantern(M, s, anims, phase) {
  var g = grp(); g.name = 'lantern-set'; s = s || 1;
  var bm = lanternMat(Math.floor(((phase || 0) % 3 + 3)) % 3);
  g.add(cyl(0.036 * s, 0.05 * s, 0.035 * s, 8, M.gold, 0, 0.115 * s, 0));
  var body = sph(0.085 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.05 * s, 0.036 * s, 0.035 * s, 8, M.gold, 0, -0.105 * s, 0));
  g.add(box(0.012 * s, 0.06 * s, 0.012 * s, M.gold, 0, -0.165 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 灯串（夜市签名件）：杆间悬垂弧线 + 暖泡分组呼吸 + 整串微摆 */
function bulbMat(phase) {
  return MAT('p38bulb' + phase, function () { return std('#ffd27a', { rough: 0.3, emissive: '#ffbf5e', ei: 0.85 }); });
}
function bulbString(M, x1, y1, z1, x2, y2, z2, n, anims, phase, bulbR) {
  var g = grp(); g.name = 'bulb-string'; var i;
  var a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2);
  var mid = a.clone().add(b).multiplyScalar(0.5);
  var sag = a.distanceTo(b) * 0.16;
  mid.y -= sag;
  var curve = new THREE.CatmullRomCurve3([a, mid, b]);
  var wire = mesh(new THREE.TubeGeometry(curve, 12, 0.007, 5), M.ink);
  wire.castShadow = false; g.add(wire);
  var pi = Math.floor(((phase || 0) % 3 + 3)) % 3;
  var bm0 = bulbMat(pi), bm1 = bulbMat((pi + 1) % 3);
  var r = bulbR || 0.026;
  for (i = 1; i <= n; i++) {
    var p = curve.getPoint(i / (n + 1));
    var bulb = sph(r, (i % 2) ? bm0 : bm1, p.x, p.y - r * 0.6, p.z);
    bulb.castShadow = false; g.add(bulb);
    var hk = cyl(0.008, 0.008, 0.02, 5, M.ink, p.x, p.y + r * 0.4, p.z);
    hk.castShadow = false; g.add(hk);
  }
  anims.push(function (t) {
    g.rotation.z = sin(t * 1.4 + (phase || 0) * 1.7) * 0.012;
    g.rotation.x = sin(t * 1.1 + (phase || 0)) * 0.008;
    bm0.emissiveIntensity = 0.85 + 0.22 * sin(t * 2.3 + (phase || 0));
    bm1.emissiveIntensity = 0.85 + 0.22 * sin(t * 2.3 + (phase || 0) + 2.1);
  });
  return g;
}

/* 灯串木杆：石础 + 杆 + 顶横担 */
function stringPole(M, h, x, z) {
  var g = grp(); g.name = 'bulb-string';
  g.add(cyl(0.03, 0.04, 0.06, 8, M.stoneD, 0, 0.03, 0));
  g.add(cyl(0.02, 0.026, h, 6, M.woodD, 0, h / 2 + 0.05, 0));
  g.add(box(0.16, 0.03, 0.035, M.woodD, 0, h + 0.03, 0));
  g.position.set(x, 0, z);
  return g;
}

/* 蒸汽缕：2 段锥叠 + 升起-放大-循环（每缕独立材质与动画） */
function steamWisp(M, x, y, z, s, anims, phase) {
  var g = grp(); g.name = 'pot-steam'; s = s || 1;
  var m = M.steamM();
  var c1 = cone(0.045 * s, 0.14 * s, 8, m, 0, 0.07 * s, 0);
  var c2 = cone(0.032 * s, 0.11 * s, 8, m, 0.012 * s, 0.2 * s, 0.008 * s);
  c1.castShadow = c2.castShadow = false;
  g.add(c1); g.add(c2);
  g.position.set(x, y, z);
  var ph = (phase || 0);
  anims.push(function (t) {
    var k = (t * 0.55 + ph) % 1;                    /* 0..1 循环 */
    g.position.y = y + k * 0.22 * s;
    g.rotation.y = k * 1.2 + ph;
    var sc = 1 + k * 0.5;
    g.scale.set(sc, 1 + k * 0.25, sc);
    m.opacity = 0.42 * (1 - k) * Math.min(1, k / 0.12);
  });
  return g;
}

/* 摊车灶面（每阶必有）：柜体木板 + 台面 + 锅具汤色 + 蒸汽 + 佐料瓶
 * 局部原点=柜底中心；调用方 put(g, c, x, 0, z) 落位 */
function foodCounter(M, w, y0, anims, phase, npots) {
  var g = grp(); g.name = 'stall-counter'; var i;
  var n = npots || 3;
  g.add(box(w, 0.3, 0.3, M.ink, 0, y0 + 0.15, 0));                       /* 店口阴影 */
  g.add(box(w, 0.2, 0.05, M.plank, 0, y0 + 0.1, 0.15));                  /* 木板前板 */
  g.add(box(w + 0.04, 0.045, 0.36, M.woodD, 0, y0 + 0.315, 0.02));       /* 台面 */
  for (i = 0; i < n; i++) {                                              /* 锅具：钢身+汤色+盖钮 */
    var px = -w / 2 + (i + 0.5) * (w / n);
    g.add(cyl(0.052, 0.058, 0.05, 10, M.steel, px, y0 + 0.36, 0));
    g.add(cyl(0.042, 0.042, 0.014, 10, M.soup, px, y0 + 0.392, 0));
    g.add(cyl(0.012, 0.016, 0.02, 6, M.steel, px + 0.035, y0 + 0.4, 0.03));
  }
  for (i = 0; i < 2; i++) {                                              /* 佐料瓶 ×2 */
    g.add(cyl(0.014, 0.016, 0.05, 6, i === 1 ? M.red : M.greenFd, w / 2 - 0.04, y0 + 0.36, 0.08 - i * 0.05));
  }
  var p1 = -w / 2 + 0.5 * (w / n), p2 = -w / 2 + (n - 0.5) * (w / n);
  g.add(steamWisp(M, p1, y0 + 0.42, 0, 1, anims, ((phase || 0) * 0.37) % 1));
  g.add(steamWisp(M, p2, y0 + 0.42, 0, 0.85, anims, ((phase || 0) * 0.37 + 0.5) % 1));
  return g;
}

/* 木箱堆（两层错缝） */
function crateAt(M, x, z, s, ry) {
  var g = grp(); g.name = 'street-crates'; s = s || 1;
  g.add(box(0.16 * s, 0.13 * s, 0.14 * s, M.plank, 0, 0.065 * s, 0));
  g.add(box(0.13 * s, 0.11 * s, 0.12 * s, M.plankShade, 0.02 * s, 0.185 * s, 0.01 * s));
  if (ry) g.rotation.y = ry;
  g.position.set(x, 0.06, z);
  return g;
}
function stoolAt(M, x, y, z) {
  var g = grp(); g.name = 'street-crates';
  g.add(cyl(0.05, 0.055, 0.025, 8, M.wood, 0, 0.09, 0));
  g.add(cyl(0.018, 0.022, 0.08, 6, M.woodD, 0, 0.04, 0));
  g.position.set(x, y || 0, z);
  return g;
}
function chalkboardAt(M, x, z, ry) {
  var g = grp(); g.name = 'street-crates';
  g.add(box(0.16, 0.02, 0.12, M.woodD, 0, 0.01, 0));
  var f = mesh(new THREE.PlaneGeometry(0.15, 0.15),
    new THREE.MeshStandardMaterial({ map: getTex('chalk', texChalk), roughness: 0.85, flatShading: true }));
  f.position.set(0, 0.11, 0.004); g.add(f);
  g.add(box(0.15, 0.15, 0.012, M.woodD, 0, 0.11, -0.006));
  g.rotation.y = 0.06;
  if (ry) g.rotation.y = ry;
  g.position.set(x, 0.06, z);
  return g;
}

/* 扇贝垂边雨棚：斜棚面 + 垂边 + 扇贝圆片（stripes:'red' 条纹 | mat 色棚）
 * 局部原点=棚面中心（y 为挂点高度），背缘贴墙 */
function awning(M, o) {
  var g = grp(); g.name = 'awning-row';
  var w = o.w, d = o.d, tilt = o.tilt !== undefined ? o.tilt : 0.34;
  var top = o.stripes === 'red' ? M.stripe : o.mat;
  var under = o.stripes === 'red' ? M.stripeSd : (o.matD || M.creamD);
  var i;
  var slab = box(w, 0.024, d, top, 0, 0, 0); slab.rotation.x = tilt; g.add(slab);
  var noseY = -sin(tilt) * d / 2, noseZ = cos(tilt) * d / 2;
  g.add(box(w, 0.05, 0.02, under, 0, noseY - 0.01, noseZ));               /* 垂边 */
  var n = Math.max(5, Math.round(w / 0.13));
  for (i = 0; i < n; i++) {                                               /* 扇贝圆片 */
    var sc = cyl(0.022, 0.022, 0.018, 8, under, -w / 2 + (i + 0.5) * (w / n), noseY - 0.03, noseZ);
    sc.rotation.x = PI / 2; g.add(sc);
  }
  g.position.set(o.x || 0, o.y, o.z);
  return g;
}

/* 暖光百叶窗：木框 + 暖纸面 + 中棂 + 双侧木百叶 + 窗台 */
function glowWindow(M, w, h) {
  var g = grp(); g.name = 'window-glow';
  g.add(box(w + 0.05, h + 0.05, 0.03, M.woodD));
  g.add(box(w * 0.62, h, 0.03, M.paper, -w * 0.17, 0, 0.006));
  g.add(box(w * 0.18, h, 0.032, M.wood, -w * 0.17, 0, 0.012));
  g.add(box(w * 0.19, h, 0.03, M.plankShade, w * 0.3, 0, 0.008));
  g.add(box(w * 0.19, h, 0.03, M.plankShade, -w * 0.44, 0, 0.008));
  g.add(box(w + 0.1, 0.03, 0.06, M.cream, 0, -h / 2 - 0.04, 0.01));
  return g;
}

/* 石栏阳台：地栿 + 望柱栏板 + 扶手 */
function balconyUnit(M, w, mat) {
  var g = grp(); g.name = 'balcony-row'; var m = mat || M.cream;
  g.add(box(w, 0.035, 0.18, m, 0, 0, 0.09));
  var n = Math.max(4, Math.round(w / 0.14)), i;
  for (i = 0; i <= n; i++) g.add(box(0.024, 0.13, 0.02, m, -w / 2 + i * (w / n), 0.082, 0.17));
  g.add(box(w + 0.03, 0.026, 0.035, M.stoneD, 0, 0.16, 0.17));
  return g;
}

/* 人字拼板棚（lv1，参考图左一）：双坡拼板 + 压板条 + 悬山暗封板 */
function plankRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.08;
  var g = grp(); g.name = 'roof-system'; var k, i;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, len, k > 0 ? M.plank : M.plankShade, 0, 0, k * len / 2));
    for (i = 1; i < 4; i++) {
      sg.add(box(w + over * 2 + 0.01, 0.018, 0.026, M.woodD, 0, 0.026, k * (i / 4) * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.woodD, 0, -0.004, k * eave));
  }
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  var t1 = mesh(gg, M.ink); t1.rotation.y = PI / 2; t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
  var t2 = mesh(gg, M.ink); t2.rotation.y = -PI / 2; t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  var ridge = grp(); ridge.name = 'ridge-ornaments'; g.add(ridge);
  ridge.add(box(w + over * 2 + 0.05, 0.05, 0.07, M.woodD, 0, h + 0.02, 0));
  return g;
}

/* 蓝灰石瓦悬山（lv2 顶 + 老虎窗小披） */
function slateRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var g = grp(); g.name = 'roof-system'; var k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, len, k > 0 ? M.slate : M.slateShade, 0, 0, k * len / 2));
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.ink, 0, -0.004, k * eave));
    var c1 = box(0.07, 0.05, 0.07, M.ink, (w + over * 2) / 2 - 0.01, 0.045, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ink, -(w + over * 2) / 2 + 0.01, 0.045, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
  }
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  var t1 = mesh(gg, M.creamD); t1.rotation.y = PI / 2; t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
  var t2 = mesh(gg, M.creamD); t2.rotation.y = -PI / 2; t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  var ridge = grp(); ridge.name = 'ridge-ornaments'; g.add(ridge);
  ridge.add(box(w + over * 2 + 0.04, 0.055, 0.08, M.ink, 0, h + 0.028, 0));
  return g;
}

/* 翘角青瓦四坡殿顶（lv4 三层同式逐层收分）：四坡 + 四角起翘 + 正脊吻 + 宝顶金珠 */
function tealHipRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(); g.name = 'roof-system';
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.72 + 0.2, 0.035, lenF, M.teal, 0, 0, lenF / 2));
  sgF.add(box(w * 0.72 + 0.22, 0.05, 0.024, M.ink, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.72 + 0.2, 0.035, lenF, M.tealShade, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.035, d * 0.8, M.tealShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.035, d * 0.8, M.teal, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {              /* 四角起翘 */
    var lift = box(0.085, 0.05, 0.085, M.ink, c[0] * (eaveS - 0.02), 0.05, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.6; g.add(lift);
  });
  var ridge = grp(); ridge.name = 'ridge-ornaments'; g.add(ridge);
  ridge.add(box(w * 0.5, 0.065, 0.09, M.ink, 0, h + 0.033, 0));            /* 正脊 */
  var f1 = box(0.055, 0.11, 0.075, M.ink, w * 0.25, h + 0.09, 0); f1.rotation.z = 0.42; ridge.add(f1);
  var f2 = box(0.055, 0.11, 0.075, M.ink, -w * 0.25, h + 0.09, 0); f2.rotation.z = -0.42; ridge.add(f2);
  put(ridge, sph(0.032, M.gold), 0, h + 0.13, 0);                          /* 宝顶金珠 */
  return g;
}

/* 朱红立柱（石础 + 柱身） */
function redColumn(M, h, r) {
  var g = grp();
  g.add(cyl(r * 1.35, r * 1.5, 0.04, 10, M.stoneD, 0, 0.02, 0));
  g.add(cyl(r, r, h, 10, M.red, 0, 0.04 + h / 2, 0));
  return g;
}

/* 金龙（lv4 对踞）：串珠蛇身 + 头吻 + 独角 + 背鳍（baseRot 定朝向） */
function dragonAt(M, s, anims, phase, baseRot) {
  var g = grp(); g.name = 'dragon-set'; var s = s || 1, i;
  var seg = 4;
  for (i = 0; i < seg; i++) {
    var u = i / seg;
    var b = sph(0.045 * (1 - i / (seg + 2)) * s, M.gold, sin(u * 2.2) * 0.09 * s, u * 0.16 * s, cos(u * 1.8) * 0.05 * s);
    b.scale.y = 0.9; g.add(b);
  }
  var hx = sin(2.2) * 0.09 * s, hy = 0.16 * s, hz = cos(1.8) * 0.05 * s;
  g.add(box(0.07 * s, 0.05 * s, 0.1 * s, M.gold, hx, hy + 0.02 * s, hz + 0.04 * s));
  g.add(box(0.05 * s, 0.024 * s, 0.05 * s, M.gold, hx, hy + 0.005 * s, hz + 0.09 * s));
  var h1 = cone(0.012 * s, 0.05 * s, 5, M.jade, hx + 0.02 * s, hy + 0.07 * s, hz + 0.02 * s);
  h1.rotation.z = -0.3; g.add(h1);
  var fin = cone(0.02 * s, 0.05 * s, 4, M.jade, 0.045 * s, 0.08 * s, 0.02 * s);
  g.add(fin);
  var br = (baseRot || 0);
  var ph = (phase || 0);
  anims.push(function (t) { g.rotation.y = br + sin(t * 0.9 + ph) * 0.06; });
  return g;
}

/* 脚架水塔（lv3 屋顶天际线签名件） */
function waterTank(M) {
  var g = grp(); g.name = 'water-tank';
  [[-0.07, 0.05], [0.07, 0.05], [0, -0.08]].forEach(function (p) {
    var leg = cyl(0.012, 0.014, 0.11, 6, M.steel, p[0], 0.055, p[1]);
    leg.rotation.z = -p[0] * 1.2; leg.rotation.x = p[1] * 0.9; g.add(leg);
  });
  g.add(cyl(0.095, 0.095, 0.19, 12, M.steel, 0, 0.2, 0));
  g.add(cyl(0.1, 0.1, 0.014, 12, M.stoneD, 0, 0.14, 0));
  g.add(cyl(0.1, 0.1, 0.014, 12, M.stoneD, 0, 0.25, 0));
  g.add(cyl(0.098, 0.07, 0.03, 12, M.steel, 0, 0.31, 0));
  return g;
}

/* 草皮基座：草面 + 草沿 + 石板小径 + 灌丛（参考图绿边，每阶必有） */
function padUnit(M, size, depth) {
  var g = grp(); g.name = 'groundscape';
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  g.add(box(0.5, 0.012, 0.5, M.path, 0.05, 0.056, d / 2 - 0.32));
  var bush1 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.bush);
  put(g, bush1, -size / 2 + 0.24, 0.11, d / 2 - 0.26); bush1.scale.y = 0.8;
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→lighting→interaction） ================= */

/* ---- lv1 小屋：木造小吃摊车（h≈1.05） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.2, 2.0));
  /* 摊车地台 + 围板 */
  g.add(box(1.6, 0.1, 1.05, M.wood, -0.05, 0.09, -0.1));
  g.add(box(1.5, 0.05, 0.04, M.woodD, -0.05, 0.135, 0.42));
  /* 四角木柱（后两根承棚，前两根挑檐） */
  [[-0.72, -0.42], [0.62, -0.42], [-0.72, 0.3], [0.62, 0.3]].forEach(function (c) {
    g.add(box(0.07, c[1] > 0 ? 0.5 : 0.62, 0.07, M.woodD, c[0], c[1] > 0 ? 0.4 : 0.45, c[1]));
  });
  /* 背墙 + 侧挂巾 */
  g.add(box(1.44, 0.44, 0.045, M.plankShade, -0.05, 0.36, -0.44));
  g.add(box(0.3, 0.2, 0.02, M.red, -0.35, 0.42, -0.41));
  g.add(box(0.3, 0.2, 0.02, M.greenFd, 0.05, 0.42, -0.41));
  /* 灶面摊台（锅具 + 蒸汽 + 佐料） */
  var counter = foodCounter(M, 1.24, 0.14, anims, 1, 3);
  put(g, counter, -0.05, 0, 0.34);
  /* 人字拼板棚（悬山，apex≈0.98） */
  var roof = plankRoof(M, { w: 1.7, d: 1.1, h: 0.22, over: 0.09 });
  put(g, roof, -0.05, 0.76, -0.06);
  /* 灯串门柱 ×2 + 双弧灯串（夜市签名） */
  g.add(stringPole(M, 1.0, -1.0, 0.62));
  g.add(stringPole(M, 1.0, 0.94, 0.62));
  g.add(bulbString(M, -0.97, 1.0, 0.62, 0.91, 1.0, 0.62, 9, anims, 0));
  g.add(bulbString(M, -0.97, 0.9, 0.62, 0.91, 0.9, 0.62, 7, anims, 2, 0.022));
  /* 檐角红灯笼 ×2 */
  var l1 = lantern(M, 0.7, anims, 0.5); put(g, l1, -0.66, 0.6, 0.5);
  var l2 = lantern(M, 0.7, anims, 2.2); put(g, l2, 0.56, 0.6, 0.5);
  /* 街景：木箱堆 + 凳 + 小黑板 + 水桶 */
  g.add(crateAt(M, 0.92, 0.28, 1.0, 0.3));
  g.add(stoolAt(M, -0.82, 0.06, 0.72));
  g.add(stoolAt(M, -0.6, 0.06, 0.85));
  g.add(chalkboardAt(M, -1.0, 0.35, -0.4));
  g.add(cyl(0.07, 0.085, 0.15, 10, M.steel, 1.0, 0.14, -0.5));
  /* 暖窗纸呼吸（背墙内透） */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.34 + 0.08 * sin(t * 1.15); });
  return g;
}

/* ---- lv2 洋房：两开间双棚摊铺 + 蓝瓦阁楼（h≈1.66） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.15));
  /* 一层：石砌台基 + 奶油墙两开间 */
  g.add(box(1.86, 0.09, 1.02, M.stoneD, 0, 0.045, -0.08));
  g.add(box(1.74, 0.58, 0.92, M.cream, 0, 0.38, -0.08));             /* 0.09-0.67 */
  /* 双摊位灶面（左绿棚右条纹棚，各带锅具蒸汽） */
  var cL = foodCounter(M, 0.68, 0.09, anims, 2, 2); put(g, cL, -0.42, 0, 0.42);
  var cR = foodCounter(M, 0.68, 0.09, anims, 4, 2); put(g, cR, 0.42, 0, 0.42);
  /* 三色雨棚序列：绿 + 红白条纹（扇贝垂边） */
  g.add(awning(M, { w: 0.8, d: 0.5, y: 0.7, z: 0.52, mat: M.greenF, matD: M.greenFd, tilt: 0.36 }));
  g.add(awning(M, { w: 0.8, d: 0.5, y: 0.7, z: 0.52, stripes: 'red', tilt: 0.36 }));
  g.add(box(0.06, 0.02, 0.44, M.woodD, -0.42, 0.71, 0.42));
  g.add(box(0.06, 0.02, 0.44, M.woodD, 0.42, 0.71, 0.42));
  /* 二层：楼板 + 檐廊 + 暖窗 */
  g.add(box(1.8, 0.05, 0.96, M.wood, 0, 0.715, -0.08));
  g.add(box(1.7, 0.48, 0.86, M.cream, 0, 0.98, -0.08));              /* 0.74-1.22 */
  var balc = balconyUnit(M, 1.3, M.wood); put(g, balc, 0, 0.76, 0.4);
  var w1 = glowWindow(M, 0.26, 0.26); put(g, w1, -0.4, 0.99, 0.355);
  var w2 = glowWindow(M, 0.26, 0.26); put(g, w2, 0.4, 0.99, 0.355);
  g.add(box(1.5, 0.05, 0.05, M.woodD, 0, 1.24, 0.38));               /* 廊楣 */
  /* 阁楼 + 蓝瓦悬山（apex≈1.56）+ 前坡老虎窗 */
  g.add(box(1.56, 0.05, 0.92, M.creamD, 0, 1.245, -0.08));
  var main = slateRoof(M, { w: 1.5, d: 1.0, h: 0.24, over: 0.09 });
  put(g, main, 0, 1.27, -0.08);
  g.add(box(0.34, 0.2, 0.26, M.cream, 0.3, 1.42, 0.12));             /* 老虎窗体 */
  var dw = glowWindow(M, 0.16, 0.13); put(g, dw, 0.3, 1.42, 0.26);
  var dr = box(0.42, 0.025, 0.3, M.slate, 0.3, 1.545, 0.1); dr.rotation.x = 0.5; g.add(dr);
  /* 棚顶灯串杆 ×2 + 弧线 */
  g.add(stringPole(M, 1.6, -0.9, 0.08));
  g.add(stringPole(M, 1.6, 0.9, 0.08));
  g.add(bulbString(M, -0.88, 1.64, 0.08, 0.88, 1.64, 0.08, 10, anims, 1));
  /* 灯笼 ×2（廊楣下）+ 街景 */
  var l1 = lantern(M, 0.62, anims, 0.9); put(g, l1, -0.6, 1.13, 0.46);
  var l2 = lantern(M, 0.62, anims, 2.6); put(g, l2, 0.6, 1.13, 0.46);
  g.add(crateAt(M, 1.02, 0.5, 0.9, -0.4));
  g.add(crateAt(M, 1.12, 0.16, 0.75, 0.5));
  g.add(stoolAt(M, -1.02, 0.06, 0.68));
  g.add(chalkboardAt(M, -1.1, 0.3, -0.2));
  g.add(cyl(0.07, 0.085, 0.14, 10, M.steel, 1.08, 0.12, -0.72));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.34 + 0.08 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：三层砖砌商住楼 + 直立金字招牌 + 屋顶晒台水塔（h≈2.23） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  var cx = 0.08;
  var palace = grp(); palace.name = 'market-palace'; g.add(palace);
  /* 台基 + 三层砖墙退台（奶石阶层线） */
  palace.add(box(1.5, 0.08, 1.15, M.stoneD, cx, 0.04, -0.12));
  var floors = grp(); floors.name = 'floor-stack'; palace.add(floors);
  floors.add(box(1.42, 0.6, 1.05, M.brick, cx, 0.38, -0.12));        /* f1 0.08-0.68 */
  floors.add(box(1.52, 0.05, 1.15, M.cream, cx, 0.705, -0.12));
  floors.add(box(1.3, 0.54, 0.95, M.brick, cx, 1.0, -0.14));         /* f2 0.73-1.27 */
  floors.add(box(1.4, 0.05, 1.05, M.cream, cx, 1.295, -0.14));
  floors.add(box(1.16, 0.48, 0.85, M.brick, cx, 1.56, -0.16));       /* f3 1.32-1.80 */
  /* 奶石砌角（quoin 长条） */
  palace.add(box(0.06, 0.54, 0.06, M.cream, cx - 0.62, 1.0, 0.31));
  palace.add(box(0.06, 0.54, 0.06, M.cream, cx + 0.62, 1.0, 0.31));
  palace.add(box(0.05, 0.48, 0.05, M.cream, cx - 0.54, 1.56, 0.26));
  palace.add(box(0.05, 0.48, 0.05, M.cream, cx + 0.54, 1.56, 0.26));
  /* 一层店口：蓝雨棚 + 大灶面 + 朱门 */
  g.add(awning(M, { w: 1.34, d: 0.56, y: 0.76, z: 0.56, mat: M.blueF, matD: M.blueFd, tilt: 0.34 }));
  var counter = foodCounter(M, 1.0, 0.08, anims, 3, 4);
  put(g, counter, cx - 0.08, 0, 0.48);
  g.add(box(0.26, 0.42, 0.04, M.red, 0.62 + cx, 0.29, 0.4));
  g.add(cyl(0.014, 0.014, 0.06, 6, M.gold, 0.54 + cx, 0.3, 0.43));
  /* 二/三层：暖百叶窗 + 石栏阳台 */
  var b2 = balconyUnit(M, 1.06, M.cream); put(g, b2, cx, 0.73, 0.42);
  var w21 = glowWindow(M, 0.22, 0.26); put(g, w21, cx - 0.26, 1.0, 0.355);
  var w22 = glowWindow(M, 0.22, 0.26); put(g, w22, cx + 0.38, 1.0, 0.355);
  var b3 = balconyUnit(M, 0.9, M.cream); put(g, b3, cx, 1.32, 0.38);
  var w31 = glowWindow(M, 0.2, 0.24); put(g, w31, cx - 0.2, 1.57, 0.31);
  var w32 = glowWindow(M, 0.2, 0.24); put(g, w32, cx + 0.32, 1.57, 0.31);
  /* 直立金字招牌（黑框金底「士林夜市」，左缘挑出，双面） */
  var sign = grp(); sign.name = 'vertical-sign';
  sign.add(box(0.24, 0.98, 0.05, M.ink));
  var smat = new THREE.MeshStandardMaterial({
    map: getTex('signV', texSignV), roughness: 0.5, flatShading: true,
    emissive: C('#ffe08a'), emissiveIntensity: 0.22
  });
  var sp = mesh(new THREE.PlaneGeometry(0.19, 0.9), smat);
  sp.position.z = 0.028; sign.add(sp);
  var sp2 = sp.clone(); sp2.position.z = -0.028; sp2.rotation.y = PI; sign.add(sp2);
  sign.add(cyl(0.016, 0.016, 0.05, 6, M.gold, 0, 0.52, 0));
  sign.add(cyl(0.016, 0.016, 0.05, 6, M.gold, 0, -0.52, 0));
  put(g, sign, cx - 0.82, 1.16, 0.42);
  /* 屋顶晒台：青瓦压顶 + 围沿 + 角杆灯串 + 脚架水塔 */
  palace.add(box(1.28, 0.05, 0.95, M.teal, cx, 1.845, -0.16));
  palace.add(box(1.34, 0.04, 1.0, M.creamD, cx, 1.87, -0.16));
  var deckPoles = grp(); deckPoles.name = 'bulb-string'; palace.add(deckPoles);
  [[-0.6, 0.32], [0.6, 0.32], [-0.6, -0.6], [0.6, -0.6]].forEach(function (p) {
    deckPoles.add(box(0.035, 0.3, 0.035, M.woodD, p[0] + cx, 2.02, p[1] - 0.02));
  });
  g.add(bulbString(M, cx - 0.6, 2.17, 0.32, cx + 0.6, 2.17, 0.32, 6, anims, 0, 0.02));
  g.add(bulbString(M, cx - 0.6, 2.17, -0.58, cx + 0.6, 2.17, -0.58, 6, anims, 1, 0.02));
  var tank = waterTank(M); put(g, tank, cx - 0.44, 1.9, -0.42);
  /* 灯笼 ×2（棚下）+ 街景 */
  var l1 = lantern(M, 0.6, anims, 1.3); put(g, l1, cx - 0.72, 0.6, 0.6);
  var l2 = lantern(M, 0.6, anims, 3.1); put(g, l2, cx + 0.66, 0.6, 0.6);
  g.add(crateAt(M, 1.06, 0.6, 0.95, 0.5));
  g.add(stoolAt(M, 0.98, 0.06, 0.86));
  g.add(stoolAt(M, 0.72, 0.06, 0.94));
  g.add(chalkboardAt(M, -1.08, 0.62, -0.3));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.bush);
  put(g, bush, 1.08, 0.17, -0.7); bush.scale.y = 0.85;
  /* 招牌微闪 + 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) {
    smat.emissiveIntensity = 0.22 + 0.06 * sin(t * 1.6);
    pm.emissiveIntensity = 0.34 + 0.08 * sin(t * 1.05 + 0.9);
  });
  return g;
}

/* ---- lv4 地标：夜市牌楼 + 三层殿座商楼 + 金龙食街（h≈2.60） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.45));
  /* 石台基 + 垂带踏步 */
  var palace = grp(); palace.name = 'market-palace'; g.add(palace);
  palace.add(box(2.06, 0.14, 1.6, M.stone, 0, 0.07, -0.08));
  palace.add(box(2.14, 0.05, 1.66, M.stoneD, 0, 0.025, -0.08));
  palace.add(box(0.72, 0.06, 0.16, M.stoneD, 0, 0.17, 0.88));
  palace.add(box(0.56, 0.05, 0.14, M.stoneD, 0, 0.245, 0.78));
  /* 夜市牌楼：双红柱 + 金帽 + 横枋金字匾 */
  var gate = grp(); gate.name = 'paifang-entry'; g.add(gate);
  [[-0.74], [0.74]].forEach(function (s) {
    var px = s[0];
    gate.add(box(0.07, 0.05, 0.07, M.stoneD, px, 0.245, 0.95));
    gate.add(box(0.055, 1.06, 0.055, M.red, px, 0.78, 0.95));
    gate.add(cyl(0.045, 0.045, 0.035, 8, M.gold, px, 1.33, 0.95));
    gate.add(box(0.1, 0.03, 0.1, M.redD, px, 1.36, 0.95));
  });
  var lgL = lantern(M, 0.52, anims, 1.8); put(g, lgL, -0.74, 1.06, 0.98);
  var lgR = lantern(M, 0.52, anims, 2.8); put(g, lgR, 0.74, 1.06, 0.98);
  gate.add(box(1.62, 0.08, 0.06, M.redD, 0, 1.19, 0.95));
  gate.add(box(1.52, 0.02, 0.07, M.gold, 0, 1.245, 0.95));
  var qmat = new THREE.MeshStandardMaterial({
    map: getTex('plaque', texPlaque), roughness: 0.55, flatShading: true,
    emissive: C('#ffe08a'), emissiveIntensity: 0.2
  });
  var plq = mesh(new THREE.PlaneGeometry(0.66, 0.15), qmat);
  plq.position.set(0, 1.16, 0.985); gate.add(plq);
  /* 一层殿座：红柱廊 + 暖堂口 */
  var floors = grp(); floors.name = 'floor-stack'; palace.add(floors);
  floors.add(box(1.66, 0.1, 1.2, M.stoneD, 0, 0.19, -0.14));
  floors.add(box(1.58, 0.56, 1.1, M.red, 0, 0.52, -0.14));           /* 0.24-0.80 */
  floors.add(box(1.2, 0.4, 0.03, M.ink, 0, 0.44, 0.42));
  floors.add(box(1.14, 0.34, 0.03, M.paper, 0, 0.42, 0.435));
  var c1 = redColumn(M, 0.56, 0.034); put(g, c1, -0.68, 0.24, 0.44);
  var c2 = redColumn(M, 0.56, 0.034); put(g, c2, 0.68, 0.24, 0.44);
  var c3 = redColumn(M, 0.56, 0.034); put(g, c3, -0.24, 0.24, 0.46);
  var c4 = redColumn(M, 0.56, 0.034); put(g, c4, 0.24, 0.24, 0.46);
  /* 一层翘角青瓦殿顶（apex≈1.08+宝顶） */
  var r1 = tealHipRoof(M, { w: 1.7, d: 1.2, h: 0.26 });
  put(palace, r1, 0, 0.82, -0.14);
  /* 二层殿座：金栏板 + 暖窗 */
  floors.add(box(1.4, 0.05, 1.0, M.creamD, 0, 1.12, -0.16));
  floors.add(box(1.32, 0.5, 0.9, M.red, 0, 1.395, -0.16));           /* 1.145-1.645 */
  var balc = balconyUnit(M, 1.12, M.gold); put(g, balc, 0, 1.15, 0.3);
  var w1 = glowWindow(M, 0.22, 0.26); put(g, w1, -0.3, 1.4, 0.295);
  var w2 = glowWindow(M, 0.22, 0.26); put(g, w2, 0.3, 1.4, 0.295);
  /* 二层翘角青瓦殿顶（apex≈1.96+宝顶）+ 金龙对踞 */
  var r2 = tealHipRoof(M, { w: 1.46, d: 1.0, h: 0.3 });
  put(palace, r2, 0, 1.66, -0.16);
  var d1 = dragonAt(M, 1.0, anims, 0.4, 0.25); put(g, d1, -0.78, 1.76, 0.18);
  var d2 = dragonAt(M, 0.9, anims, 2.9, -2.2); put(g, d2, 0.78, 1.74, 0.18);
  /* 顶阁宝座（宝顶≈2.60） */
  floors.add(box(0.6, 0.3, 0.6, M.red, 0, 2.0, -0.16));              /* 1.85-2.15 */
  var r3 = tealHipRoof(M, { w: 0.7, d: 0.6, h: 0.22 });
  put(palace, r3, 0, 2.17, -0.16);
  /* 红白大条纹棚：棚下长条蒸汽食桌（夜市正脸） */
  g.add(awning(M, { w: 1.9, d: 0.62, y: 0.86, z: 0.66, stripes: 'red', tilt: 0.3 }));
  var table = foodCounter(M, 1.5, 0.19, anims, 5, 3);
  put(g, table, 0, 0.19, 0.62);
  /* 灯笼阵：一层檐下 ×3 + 牌楼柱 ×2（上文） */
  var i;
  for (i = 0; i < 3; i++) {
    var lg = lantern(M, 0.5, anims, 0.6 + i * 0.9);
    put(g, lg, -0.45 + i * 0.45, 0.72, 0.5);
  }
  /* 灯串网：牌楼柱顶 ↔ 二层檐角 + 沿棚弧线 */
  g.add(bulbString(M, -0.74, 1.34, 0.95, -0.78, 1.72, 0.46, 5, anims, 2, 0.02));
  g.add(bulbString(M, 0.74, 1.34, 0.95, 0.78, 1.72, 0.46, 5, anims, 0, 0.02));
  g.add(bulbString(M, -0.86, 0.94, 0.82, 0.86, 0.94, 0.82, 6, anims, 1));
  /* 街景：凳 + 木箱 + 黑板 + 盆栽 */
  g.add(stoolAt(M, -0.95, 0.06, 1.0));
  g.add(crateAt(M, 0.98, 0.62, 0.85, 0.4));
  g.add(chalkboardAt(M, -1.05, 0.72, -0.5));
  [[-0.9], [0.9]].forEach(function (s) {
    g.add(cyl(0.06, 0.075, 0.1, 8, M.redD, s[0], 0.19, 0.9));
    var pb = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.bush);
    put(g, pb, s[0], 0.29, 0.9); pb.scale.y = 0.85;
  });
  /* 匾额微光 + 暖窗/堂口呼吸 */
  var pm = M.paper;
  anims.push(function (t) {
    qmat.emissiveIntensity = 0.2 + 0.05 * sin(t * 1.5 + 0.3);
    pm.emissiveIntensity = 0.34 + 0.07 * sin(t * 1.0 + 1.4);
  });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[38] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_38_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 38;
  g.userData.level = lv;
  g.userData.region = 'g8';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
