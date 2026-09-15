/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_39.js
 * -------------------------------------------------------------------------------------
 * 格 39「垦丁大街」(g8 热带度假大街) 独属建筑：垦丁海滨街屋四阶生长史
 * 参考图 refs/prop_39.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop39/）。
 * v2 精修（全局精修迭代）：在 v1 验收形态上清偿遗留妥协——瓦垄真实波纹几何、椰树
 * 节疤+叶脉分层、冲浪板条纹+尾鳍、灯串金属灯座+三次悬链、彩棚垂边波浪+缝线+微动、
 * 木栈道板缝、民宿双层栏杆、朱柱金线、台基望柱雕饰、凹曲翘檐+檐下斗拱带+檐口灯笼串。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   海滨冲浪小棚：木板墙 + 青绿瓦楞铁双坡顶 + 橙白彩棚吧台 + 双冲浪板
 *              + 椰树 + 灯串木杆（h≈1.12）
 *   lv2 洋房   横向两层民宿：蓝白扇贝彩棚店面 + 二层百叶窗/花箱 + 瓦楞顶后半 +
 *              前半屋顶露台（木栏杆 + 彩伞 + 绿棚 + 水塔）（h≈1.64）
 *   lv3 大厦   三层大街楼：双开店门面（蓝白+红白彩棚）+ 层层彩棚/花箱 + 平顶屋顶
 *              酒吧（凉亭棚 + 双彩伞 + 女儿墙绿篱）（h≈2.20）
 *   lv4 地标   度假宫殿地标：石台基宽阶石狮 + 朱柱金描楼身 + 三重蓝瓦翼角金脊
 *              翘檐 + 满檐灯笼串（h≈2.56）
 *
 * 独有语汇（自参考图提炼，每阶必有）：椰树（弯干环纹 + 垂叶 + 椰果）、暖光灯串
 * （悬链线 + 灯泡）、红灯笼金盖金穗、扇贝边条纹彩棚（橙白→蓝白→蓝白+红白→红白+蓝白）、
 * 木质吧台条凳、青绿瓦楞铁（lv1-2）→ 蓝陶瓦（lv4）呼应、草皮沙土沙盘 + 石板小径。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[39] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤512px）；每级 mesh ≤350；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_39] THREE 未定义，请先加载 three.min.js (r147)');
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
/* v2 规范：圆柱/圆锥径向段数 ≥12，球 ≥16×12（助手层统一钳制，只增三角形不增 mesh 数） */
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg | 0)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, Math.max(12, seg | 0)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, rx, ry, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz;
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

/* 青绿瓦楞铁：竖向楞条明暗 + 锈斑噪点（map+bump 同源） */
function texCorr() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#46606b'; g.fillRect(0, 0, S, S);
  var i, k;
  for (i = 0; i < 8; i++) {                                   /* 竖楞：亮-中间-暗三笔 */
    var x = i * (S / 8);
    g.fillStyle = '#5a7881'; g.fillRect(x, 0, S / 16, S);
    g.fillStyle = '#6e8c96'; g.fillRect(x + 2, 0, 3, S);
    g.fillStyle = '#3a505a'; g.fillRect(x + S / 16 - 3, 0, 3, S);
  }
  for (i = 0; i < 130; i++) {                                 /* 锈点/划痕 */
    k = i % 5;
    g.fillStyle = k === 0 ? 'rgba(140,90,50,0.18)' : (k === 1 ? 'rgba(255,255,255,0.06)' : 'rgba(20,30,36,0.10)');
    g.fillRect((i * 41) % S, (i * 67) % S, 2, k === 0 ? 3 : 2);
  }
  return toTex(cv, true);
}
/* 蜂蜜色木板：横板缝 + 木纹拉丝（map+bump 同源） */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#7a5230'; g.fillRect(0, 0, S, S);
  var rows = 6, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#83593a' : '#754e2c';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#5c3e22'; g.fillRect(0, y + rh - 2, S, 2);
    g.fillStyle = 'rgba(255,235,200,0.10)'; g.fillRect(0, y + 1, S, 1);
    for (k = 0; k < 5; k++) {                                 /* 木纹拉丝 */
      g.fillStyle = (k % 2) ? 'rgba(60,38,20,0.22)' : 'rgba(220,180,130,0.10)';
      g.fillRect((i * 23 + k * 29) % S, y + 3 + (k * 7) % (rh - 5), 10 + (k * 13) % 14, 1);
    }
  }
  return toTex(cv, true);
}
/* 灰米色旧灰泥：抹面斑驳 + 水渍（map） */
function texStucco() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#9a8f80'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 240; i++) {
    g.fillStyle = (i % 3 === 0) ? 'rgba(60,52,40,0.10)' : ((i % 3 === 1) ? 'rgba(255,250,235,0.08)' : 'rgba(120,105,85,0.10)');
    g.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
  }
  for (i = 0; i < 5; i++) {                                   /* 竖向水渍 */
    g.fillStyle = 'rgba(70,60,48,0.10)';
    g.fillRect((i * 31 + 9) % S, (i * 17) % (S / 2), 3, S / 2 + (i * 13) % 40);
  }
  return toTex(cv, true);
}
/* 蓝陶瓦垄（lv4 宫殿顶）：横瓦垄 + 竖接头 + 釉面噪点（map+bump 同源） */
function texTileBlue() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#47586c'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#5b6c82' : '#52637a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#39485c'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#7d90a8'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh * 0.5 : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(30,40,54,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(15,22,32,0.10)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 棕榈干：环纹（map+bump 同源） */
function texTrunk() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#8a6a4a'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 9; i++) {
    var y = i * (S / 9);
    g.fillStyle = '#6e5238'; g.fillRect(0, y, S, 3);
    g.fillStyle = 'rgba(255,230,190,0.14)'; g.fillRect(0, y + 3, S, 2);
  }
  for (i = 0; i < 60; i++) {
    g.fillStyle = (i % 2) ? 'rgba(50,36,22,0.16)' : 'rgba(230,200,160,0.10)';
    g.fillRect((i * 29) % S, (i * 41) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 彩棚条纹（竖条纹，u 沿宽度）：colorway 参数化 */
function texStripe(cA, cB, n) {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = cB; g.fillRect(0, 0, S, S);
  var w = S / n, i;
  for (i = 0; i < n; i += 2) { g.fillStyle = cA; g.fillRect(i * w, 0, w + 1, S); }
  g.fillStyle = 'rgba(90,60,30,0.10)';                        /* 织物横纹 */
  for (i = 0; i < 8; i++) g.fillRect(0, i * (S / 8), S, 1);
  return toTex(cv, true);
}
/* 立式招牌「垦丁大街」：旧木底 + 描金字竖排 */
function texSignV() {
  var w = 128, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#4a3418'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9a83f'; g.lineWidth = 5; g.strokeRect(6, 6, w - 12, h - 12);
  g.strokeStyle = 'rgba(217,168,63,0.5)'; g.lineWidth = 2; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#efd28a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 44px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '垦丁大街', i;
  for (i = 0; i < 4; i++) g.fillText(s[i], w / 2, 52 + i * 52);
  return toTex(cv, true);
}
/* 小黑板：粉笔涂鸦（menu 感） */
function texChalk() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#2c3830'; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#c9a86a'; g.lineWidth = 6; g.strokeRect(3, 3, S - 6, S - 6);
  g.strokeStyle = 'rgba(240,240,230,0.85)'; g.lineWidth = 2;
  var i, x0, y0;
  for (i = 0; i < 7; i++) {                                   /* 涂鸦行 */
    y0 = 24 + i * 14;
    g.beginPath(); g.moveTo(16, y0);
    g.lineTo(16 + 20 + (i * 23) % 40, y0); g.stroke();
    g.beginPath(); g.moveTo(92, y0 - 2); g.lineTo(108, y0 - 2); g.stroke();
  }
  for (i = 0; i < 5; i++) {                                   /* 粉笔屑噪点 */
    x0 = (i * 37) % 110 + 8; y0 = (i * 53) % 100 + 14;
    g.fillStyle = 'rgba(255,255,245,0.5)'; g.fillRect(x0, y0, 2, 2);
  }
  return toTex(cv, true);
}

var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* ================= 2. 共享材质库（四级统一色板 = 参考图分区取样） ================= */
function Mats() {
  return {
    corrSun:   MAT('p39corrSun', function () { var t = getTex('corr', texCorr); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.52 }); }),
    corrShd:   MAT('p39corrShd', function () { var t = getTex('corr', texCorr); return std('#9fb4bc', { map: t, bump: t, bumpScale: 0.014, rough: 0.6 }); }),
    plank:     MAT('p39plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.82 }); }),
    plankD:    MAT('p39plankD', function () { return std('#5c3e22', { rough: 0.85 }); }),
    pole:      MAT('p39pole', function () { var t = getTex('trunk', texTrunk); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.85 }); }),
    siding:    MAT('p39siding', function () { return std('#7fa893', { rough: 0.75 }); }),
    sidingD:   MAT('p39sidingD', function () { return std('#6b9480', { rough: 0.8 }); }),
    stucco:    MAT('p39stucco', function () { var t = getTex('stucco', texStucco); return std('#ffffff', { map: t, rough: 0.92 }); }),
    stuccoD:   MAT('p39stuccoD', function () { return std('#857b6c', { rough: 0.92 }); }),
    tileSun:   MAT('p39tileSun', function () { var t = getTex('tileB', texTileBlue); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.55 }); }),
    tileShd:   MAT('p39tileShd', function () { var t = getTex('tileB', texTileBlue); return std('#aebccb', { map: t, bump: t, bumpScale: 0.014, rough: 0.62 }); }),
    lacq:      MAT('p39lacq', function () { return std('#b0462e', { rough: 0.5 }); }),
    lacqBr:    MAT('p39lacqBr', function () { return std('#c4553a', { rough: 0.45 }); }),
    lacqDk:    MAT('p39lacqDk', function () { return std('#8e3421', { rough: 0.6 }); }),
    gold:      MAT('p39gold', function () { return std('#d9a83f', { rough: 0.35, metal: 0.7 }); }),
    stone:     MAT('p39stone', function () { return std('#b5ab97', { rough: 0.9 }); }),
    stoneD:    MAT('p39stoneD', function () { return std('#948b78', { rough: 0.92 }); }),
    glass:     MAT('p39glass', function () { return std('#2a3438', { rough: 0.35, metal: 0.1 }); }),
    metalDk:   MAT('p39metalDk', function () { return std('#3c4248', { rough: 0.35, metal: 0.75 }); }),
    bark:      MAT('p39bark', function () { return std('#5f452c', { rough: 0.92 }); }),
    grass:     MAT('p39grass', function () { return std('#6e9c46', { rough: 0.95 }); }),
    grassD:    MAT('p39grassD', function () { return std('#5e8c3c', { rough: 0.95 }); }),
    dirt:      MAT('p39dirt', function () { return std('#8a6c48', { rough: 0.95 }); }),
    path:      MAT('p39path', function () { return std('#b8ac92', { rough: 0.95 }); }),
    leaf:      MAT('p39leaf', function () { return std('#4e8a3c', { rough: 0.9 }); }),
    leafBr:    MAT('p39leafBr', function () { return std('#63a84e', { rough: 0.9 }); }),
    leafDk:    MAT('p39leafDk', function () { return std('#3d6f2e', { rough: 0.9 }); }),
    surfWood:  MAT('p39surfW', function () { return std('#d79221', { rough: 0.55 }); }),
    surfTeal:  MAT('p39surfT', function () { return std('#5e8c96', { rough: 0.55 }); }),
    cream:     MAT('p39cream', function () { return std('#f0e3c8', { rough: 0.9 }); }),
    chalk:     MAT('p39chalk', function () { var t = getTex('chalk', texChalk); return std('#ffffff', { map: t, rough: 0.85 }); }),
    signV:     MAT('p39signV', function () { var t = getTex('signV', texSignV); return std('#ffffff', { map: t, rough: 0.7 }); }),
    bulb:      MAT('p39bulb', function () { return std('#ffc46a', { rough: 0.3, emissive: '#ffb14a', ei: 0.9 }); }),
    awnO:      MAT('p39awnO', function () { return std('#ffffff', { map: getTex('stO', function () { return texStripe('#e0913c', '#f0e3c8', 8); }), rough: 0.85 }); }),
    awnB:      MAT('p39awnB', function () { return std('#ffffff', { map: getTex('stB', function () { return texStripe('#6c93b4', '#f0e3c8', 8); }), rough: 0.85 }); }),
    awnR:      MAT('p39awnR', function () { return std('#ffffff', { map: getTex('stR', function () { return texStripe('#c65a4a', '#f0e3c8', 8); }), rough: 0.85 }); }),
    umbY:      MAT('p39umbY', function () { return std('#ffffff', { map: getTex('stY', function () { return texStripe('#e0a83c', '#f4ead2', 8); }), rough: 0.8 }); }),
    umbG:      MAT('p39umbG', function () { return std('#ffffff', { map: getTex('stG', function () { return texStripe('#7fae8e', '#eef0e2', 8); }), rough: 0.8 }); })
  };
}

/* ================= 3. 预制件（垦丁独有语汇） ================= */

/* 草坪沙盘：草面 + 沙土沿 + 石板小径 + 岩石 + 热带灌丛 */
function padUnit(M, size, depth) {
  var g = grp(); g.name = 'pad-terrain';
  var d = depth || size;
  g.add(box(size + 0.05, 0.03, d + 0.05, M.dirt, 0, 0.015, 0));
  g.add(box(size, 0.045, d, M.grass, 0, 0.048, 0));
  g.add(box(0.44, 0.016, 0.3, M.path, 0, 0.072, d / 2 - 0.22));
  g.add(box(0.5, 0.016, 0.28, M.path, 0.06, 0.072, d / 2 - 0.52));
  var rock1 = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, rock1, size / 2 - 0.26, 0.08, d / 2 - 0.3);
  var rock2 = mesh(new THREE.DodecahedronGeometry(0.038, 0), M.stoneD); put(g, rock2, -size / 2 + 0.3, 0.07, -d / 2 + 0.32);
  var b1 = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.grassD); put(g, b1, -size / 2 + 0.24, 0.12, d / 2 - 0.28); b1.scale.y = 0.78;
  var b2 = mesh(new THREE.IcosahedronGeometry(0.06, 0), M.leafBr); put(g, b2, size / 2 - 0.3, 0.1, -d / 2 + 0.35); b2.scale.y = 0.8;
  return g;
}

/* 椰树：三段弯干 + 节疤环棱 ×6 + 垂叶 7 片（中脉 + 双侧羽片 = 叶脉分层）+ 椰果 3 颗 */
function palmTree(M, h, anims, phase) {
  var g = grp(); phase = phase || 0; g.name = 'palm-tree';
  var segs = 3, sh = h * 0.62 / segs, i, rn;
  var lean = 0.14;
  var tipX = 0;
  for (i = 0; i < segs; i++) {
    var t0 = i / segs, r = 0.05 * (1 - t0 * 0.45);
    tipX += Math.tan(lean) * sh * (i + 0.5) * 0.9;
    var seg = cyl(r, r * 1.14, sh * 1.06, 10, M.pole, tipX, 0.05 + sh * i + sh / 2, 0);
    seg.rotation.z = -lean * (i + 0.4);
    g.add(seg);
    for (rn = 0; rn < 2; rn++) {                             /* 节疤：每段两道环棱 */
      var ring = cyl(r * (rn ? 1.1 : 1.22), r * (rn ? 1.1 : 1.22) * 1.06, 0.017, 10, M.bark,
        tipX, 0.05 + sh * i + sh * (rn ? 0.92 : 0.14), 0);
      ring.rotation.z = -lean * (i + 0.4);
      ring.name = 'trunk-scar';
      g.add(ring);
    }
  }
  g.add(cyl(0.062, 0.075, 0.055, 10, M.bark, 0.008, 0.062, 0));   /* 基部兜 */
  var crown = grp(); crown.position.set(tipX + 0.02, 0.05 + h * 0.62, 0); g.add(crown);
  var nF = 7;
  for (i = 0; i < nF; i++) {
    var a = (i / nF) * PI * 2 + phase;
    var L = h * 0.42;
    var fr = grp();
    put(crown, fr, cos(a) * h * 0.16, -h * 0.03, sin(a) * h * 0.16, 0, -a, 0);
    fr.rotateOnAxis(new THREE.Vector3(1, 0, 0), 1.9);        /* 垂坠 */
    fr.translateY(-h * 0.16);
    var rib = cone(0.028, L * 1.06, 5, M.leafDk || M.leaf, 0, 0, 0);
    rib.scale.z = 0.55; fr.add(rib);                          /* 中脉 */
    var bA = cone(0.056, L * 0.82, 4, i % 2 ? M.leaf : M.leafBr, L * 0.06, -L * 0.1, 0);
    bA.scale.set(1, 1, 0.26); bA.rotation.z = 0.55; bA.name = 'frond-blade'; fr.add(bA);
    var bB = cone(0.056, L * 0.82, 4, i % 2 ? M.leafBr : M.leaf, -L * 0.06, -L * 0.1, 0);
    bB.scale.set(1, 1, 0.26); bB.rotation.z = -0.55; fr.add(bB);
  }
  crown.add(sph(0.055, M.leafDk || M.leaf, 0, 0.02, 0));
  var c1 = sph(0.032, M.plankD, 0.05, -0.045, 0.03); crown.add(c1);
  var c2 = sph(0.028, M.plankD, -0.045, -0.04, -0.02); crown.add(c2);
  var c3 = sph(0.03, M.plankD, 0.01, -0.05, -0.05); crown.add(c3);
  anims.push(function (t) { crown.rotation.z = sin(t * 0.85 + phase) * 0.03; crown.rotation.x = cos(t * 0.7 + phase) * 0.022; });
  return g;
}

/* 暖光灯串：双杆 + 三次贝塞尔悬链（下垂形态）+ 吊线 + 金属灯座 + 灯泡（共享材质呼吸） */
function stringLights(M, p0, p1, sag, nB, anims, phase, poleMats) {
  var g = grp(); phase = phase || 0; g.name = 'string-lights';
  var top = [];
  if (poleMats) {
    var h0 = p0.y, h1 = p1.y;
    var pl0 = cyl(0.016, 0.022, h0, 8, M.pole, p0.x, h0 / 2 + 0.04, p0.z); g.add(pl0);
    var pl1 = cyl(0.014, 0.02, h1, 8, M.pole, p1.x, h1 / 2 + 0.04, p1.z); g.add(pl1);
  }
  var a = new THREE.Vector3(p0.x, p0.y + 0.04, p0.z);
  var b = new THREE.Vector3(p1.x, p1.y + 0.04, p1.z);
  var c1 = a.clone().lerp(b, 0.34); c1.y -= sag * 1.36;      /* 悬链下垂形态 */
  var c2 = a.clone().lerp(b, 0.66); c2.y -= sag * 1.36;
  var curve = new THREE.CubicBezierCurve3(a, c1, c2, b);
  var tube = mesh(new THREE.TubeGeometry(curve, 12, 0.005, 5, false), M.plankD); g.add(tube);
  var i, p, bulb;
  for (i = 0; i < nB; i++) {
    p = curve.getPoint(0.1 + (0.8 * i) / (nB - 1));
    var dw = cyl(0.0028, 0.0028, 0.02, 5, M.plankD, p.x, p.y - 0.012, p.z);   /* 吊线 */
    g.add(dw);
    var sk = cyl(0.0095, 0.0075, 0.016, 6, M.metalDk, p.x, p.y - 0.031, p.z); /* 金属灯座 */
    sk.name = 'bulb-socket'; g.add(sk);
    bulb = sph(0.022, M.bulb, p.x, p.y - 0.049, p.z); bulb.name = 'string-bulbs'; g.add(bulb);
    top.push(bulb);
  }
  var bm = M.bulb;
  anims.push(function (t) { bm.emissiveIntensity = 0.85 + 0.22 * sin(t * 2.3 + phase); });
  return g;
}

/* 檐口灯笼串（lv4 宫殿）：悬链细管 + 三只小灯笼相位呼吸 */
function lanternString(M, w, sag, anims, phase) {
  var g = grp(); g.name = 'string-lights';
  var a = new THREE.Vector3(-w / 2, 0, 0), b = new THREE.Vector3(w / 2, 0, 0);
  var c1 = new THREE.Vector3(-w / 6, -sag * 1.36, 0), c2 = new THREE.Vector3(w / 6, -sag * 1.36, 0);
  var curve = new THREE.CubicBezierCurve3(a, c1, c2, b);
  g.add(mesh(new THREE.TubeGeometry(curve, 10, 0.004, 5, false), M.plankD));
  var us = [0.2, 0.5, 0.8], i;
  for (i = 0; i < 3; i++) {
    var p = curve.getPoint(us[i]);
    var lt = lantern(M, 0.4, anims, phase + i * 0.7);
    lt.position.set(p.x, p.y - 0.03, p.z); g.add(lt);
  }
  return g;
}

/* 红灯笼：金盖金底 + 红壳 + 穗（呼吸相位参数化） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1; g.name = 'lantern-hang';
  var bm = MAT('p39lant' + (phase || 0), function () { return std('#d9502e', { rough: 0.5, emissive: '#ff8a3c', ei: 0.55 }); });
  g.add(cyl(0.034 * s, 0.046 * s, 0.032 * s, 8, M.gold, 0, 0.108 * s, 0));
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.86; g.add(body);
  g.add(cyl(0.046 * s, 0.034 * s, 0.032 * s, 8, M.gold, 0, -0.098 * s, 0));
  var tas = cyl(0.007 * s, 0.007 * s, 0.068 * s, 5, M.lacqDk, 0, -0.156 * s, 0); tas.name = 'lantern-tassel'; g.add(tas);
  anims.push(function (t) { bm.emissiveIntensity = 0.5 + 0.22 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 扇贝边彩棚：斜面棚布（条纹 + 三道缝线）+ 扇贝垂边（拉伸体单 mesh）+ 前沿横杆
 * w 宽 / d 进深 / y0 挂杆高 / mats {canopy, valTex} / drop 垂边高
 * v2：棚布+垂边挂入 wing 铰链组（微动绕挂杆轴），o.anims 传入时注册克制的摆动 */
function scallopAwning(M, o) {
  var g = grp(); g.name = 'awning-system';
  var w = o.w, d = o.d, y0 = o.y0, drop = o.drop || 0.085;
  var pitch = o.pitch !== undefined ? o.pitch : 0.32;
  var slopeLen = d / cos(pitch) + 0.02;
  var zOut = slopeLen * cos(pitch);                            /* 棚出沿外缘 */
  var wing = grp(); wing.position.set(0, y0, 0); g.add(wing);
  var canopy = box(w, 0.022, slopeLen, o.mCanopy, 0, -slopeLen / 2 * sin(pitch), zOut / 2);
  canopy.rotation.x = pitch;                                   /* 外缘下垂 */
  wing.add(canopy);
  var sI;                                                      /* 棚布缝线 ×3（织物分幅） */
  for (sI = 0; sI < 3; sI++) {
    var seamZ = zOut * (0.28 + 0.24 * sI);
    var seam = box(w * 0.94, 0.008, 0.012, o.mBar || M.plankD, 0, -seamZ * Math.tan(pitch) + 0.014, seamZ);
    seam.rotation.x = pitch; seam.name = 'awning-seam'; wing.add(seam);
  }
  /* 扇贝垂边：Shape 上缘直、下缘弧链，Extrude depth 0.018（坐标相对挂杆） */
  var n = Math.max(4, Math.round(w / 0.13));
  var r = w / (2 * n), sh = new THREE.Shape();
  var yT = -slopeLen * sin(pitch) * 0.6, hgt = drop;
  sh.moveTo(-w / 2, yT);
  sh.lineTo(w / 2, yT);
  sh.lineTo(w / 2, yT - (hgt - r));
  var i;
  for (i = 0; i < n; i++) {
    sh.absarc(w / 2 - r - i * 2 * r, yT - (hgt - r), r, 0, PI, true);
  }
  sh.closePath();
  var vg = new THREE.ExtrudeGeometry(sh, { depth: 0.018, bevelEnabled: false, curveSegments: 8 });
  var val = mesh(vg, o.mValance); val.name = 'scallop-valance';
  val.position.set(0, 0, zOut - 0.012);
  wing.add(val);
  wing.add(box(w + 0.03, 0.028, 0.028, o.mBar || M.plankD, 0, yT - hgt + r * 0.4, zOut + 0.012));
  if (o.anims) {
    var ph = o.phase || 0;
    o.anims.push(function (t) { wing.rotation.x = sin(t * 1.25 + ph) * 0.022; });   /* 彩棚微动 */
  }
  return g;
}

/* 彩色遮阳伞：伞面锥(条纹 radial) + 伞杆 + 顶珠 */
function parasol(M, r, hPole, mCanopy, anims, phase) {
  var g = grp(); phase = phase || 0; g.name = 'roof-terrace';
  g.add(cyl(0.012, 0.012, hPole, 8, M.plankD, 0, hPole / 2, 0));
  var um = cone(r, r * 0.55, 10, mCanopy, 0, hPole + r * 0.24, 0);
  um.openEnded = false; g.add(um);
  g.add(sph(0.018, M.gold, 0, hPole + r * 0.52, 0));
  anims.push(function (t) { g.rotation.y = sin(t * 0.5 + (phase || 0)) * 0.06; });
  return g;
}

/* 吧台：台面板 + 竖板前脸 + 踢脚 + 台面货物（盆/罐） */
function barCounter(M, w, d) {
  var g = grp(); g.name = 'bar-counter';
  d = d || 0.26;
  g.add(box(w, 0.3, d, M.plank, 0, 0.15, 0));
  g.add(box(w + 0.06, 0.035, d + 0.05, M.plankD, 0, 0.315, 0));
  g.add(box(w * 0.96, 0.05, d * 0.9, M.plankD, 0, 0.03, 0));
  g.add(cyl(0.032, 0.04, 0.07, 8, M.stoneD, -w * 0.24, 0.37, 0));
  var bush = mesh(new THREE.IcosahedronGeometry(0.045, 0), M.leafBr); put(g, bush, -w * 0.24, 0.44, 0); bush.scale.y = 0.85;
  g.add(cyl(0.026, 0.03, 0.055, 8, M.cream, w * 0.22, 0.36, 0));
  return g;
}

/* 条凳：凳面 + 四腿 */
function stool(M, s) {
  var g = grp(); s = s || 1; g.name = 'bar-counter';
  g.add(cyl(0.052 * s, 0.058 * s, 0.026 * s, 8, M.plank, 0, 0.15 * s, 0));
  var i;
  for (i = 0; i < 4; i++) {
    g.add(cyl(0.007 * s, 0.008 * s, 0.15 * s, 6, M.plankD,
      (i % 2 ? 1 : -1) * 0.034 * s, 0.075 * s, (i < 2 ? 1 : -1) * 0.034 * s));
  }
  return g;
}

/* 冲浪板：尖头轮廓 Shape 拉伸 + 纵向分色条纹 ×2 + 尾鳍（贴墙斜靠） */
function surfboard(M, mFace, h, mStripe) {
  var g = grp(); g.name = 'surfboard';
  var w = h * 0.24, sh = new THREE.Shape();
  sh.moveTo(0, -h / 2);
  sh.quadraticCurveTo(w, -h * 0.28, w * 0.62, h * 0.12);
  sh.quadraticCurveTo(w * 0.34, h * 0.36, 0, h / 2);
  sh.quadraticCurveTo(-w * 0.34, h * 0.36, -w * 0.62, h * 0.12);
  sh.quadraticCurveTo(-w, -h * 0.28, 0, -h / 2);
  var bd = mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: false, curveSegments: 8 }), mFace);
  g.add(bd);
  g.add(box(0.012, h * 0.8, 0.008, M.cream, 0, 0, 0.012));
  var ms = mStripe || M.cream;
  var st1 = box(0.016, h * 0.72, 0.008, ms, h * 0.055, 0, 0.024);  /* 板面分色条纹 */
  var st2 = box(0.016, h * 0.72, 0.008, ms, -h * 0.055, 0, 0.024);
  st1.name = 'surf-stripe'; st2.name = 'surf-stripe';
  g.add(st1); g.add(st2);
  var fin = box(0.01, h * 0.09, 0.05, ms, 0, -h * 0.47, -0.02);    /* 尾鳍 */
  fin.rotation.x = 0.6; fin.name = 'surf-fin';
  g.add(fin);
  return g;
}

/* 百叶木窗：暗玻璃 + 双百叶板 + 木框 */
function shutterWindow(M, w, h) {
  var g = grp(); g.name = 'shutter-window';
  g.add(box(w + 0.06, h + 0.06, 0.04, M.plankD, 0, 0, 0));
  g.add(box(w, h, 0.03, M.glass, 0, 0, 0.006));
  var i, sx = w / 2 + 0.018;
  for (i = 0; i < 2; i++) {
    var s = box(0.035, h, 0.022, M.sidingD, (i ? 1 : -1) * sx, 0, 0.008);
    g.add(s);
  }
  return g;
}

/* 花箱：木盒 + 3 团绿植垂蔓 */
function planterBox(M, w) {
  var g = grp(); g.name = 'planter-band';
  g.add(box(w, 0.09, 0.11, M.plankD, 0, 0.045, 0));
  var i;
  for (i = 0; i < 3; i++) {
    var b = mesh(new THREE.IcosahedronGeometry(0.045, 0), i % 2 ? M.leafBr : M.leaf, 0);
    put(g, b, -w / 2 + (i + 0.5) * (w / 3), 0.1, 0);
    b.scale.y = 0.75;
  }
  return g;
}

/* 小黑板招牌：A 字腿 + 板面涂鸦 */
function chalkboard(M) {
  var g = grp(); g.name = 'sign-board';
  var l1 = box(0.03, 0.34, 0.02, M.plankD, -0.1, 0.17, 0.012); l1.rotation.x = 0.14; g.add(l1);
  var l2 = box(0.03, 0.34, 0.02, M.plankD, -0.1, 0.17, -0.012); l2.rotation.x = -0.14; g.add(l2);
  g.add(box(0.24, 0.26, 0.024, M.chalk, -0.1, 0.2, 0));
  return g;
}

/* 盆栽：陶盆 + 灌丛 */
function potPlant(M, s, leafMat) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.08 * s, 10, M.stoneD, 0, 0.04 * s, 0));
  var b = mesh(new THREE.IcosahedronGeometry(0.062 * s, 0), leafMat || M.leafBr, 0);
  put(g, b, 0, 0.115 * s, 0); b.scale.y = 0.85;
  return g;
}

/* 木栈道：n 块木板 + 板缝（缝宽 0.008 露出底色）；板厚 0.03 抬高铺装避免与草皮/石板共面 */
function boardwalk(M, w, d, n) {
  var g = grp(); g.name = 'boardwalk';
  n = n || 5;
  var pw = (d - 0.008 * (n - 1)) / n, i;
  for (i = 0; i < n; i++) {
    var pk = box(w, 0.03, pw, M.plank, 0, 0.015, -d / 2 + pw / 2 + i * (pw + 0.008));
    pk.name = 'deck-plank';
    g.add(pk);
  }
  return g;
}

/* 木板条钉门（棚屋用） */
function plankDoor(M, w, h) {
  var g = grp();
  g.add(box(w, h, 0.03, M.plankD, 0, 0, 0));
  var i, n = 3;
  for (i = 0; i < n; i++) g.add(box(w / n - 0.014, h * 0.94, 0.012, M.plank, -w / 2 + (i + 0.5) * (w / n), 0, 0.014));
  g.add(sph(0.014, M.gold, w * 0.3, 0, 0.024));
  return g;
}

/* 墙灯：小托架 + 灯罩（暖光） */
function wallLamp(M, anims, phase) {
  var g = grp(); phase = phase || 0;
  g.add(box(0.03, 0.03, 0.06, M.plankD, 0, 0, 0.01));
  var hm = MAT('p39lamp' + (phase || 0), function () { return std('#ffd98a', { rough: 0.4, emissive: '#ffc46a', ei: 0.7 }); });
  g.add(cone(0.035, 0.05, 6, hm, 0, -0.035, 0.035));
  anims.push(function (t) { hm.emissiveIntensity = 0.6 + 0.2 * sin(t * 1.7 + (phase || 0)); });
  return g;
}

/* 瓦楞铁双坡顶（lv1-2）：迎光/背光坡 + 半圆瓦垄管 ×8（真实波纹）+ 博风板 + 木脊 + 脊辊 */
function corrRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.08;
  var nRib = o.ribs !== undefined ? o.ribs : 8;
  var g = grp(); g.name = 'roof-system'; var i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.03, slopeLen, k > 0 ? M.corrSun : M.corrShd, 0, 0, k * slopeLen / 2));
    for (i = 0; i < nRib; i++) {                             /* 半圆瓦垄管（波纹几何） */
      var px = -((w + over * 2) / 2 - 0.06) + i * ((w + over * 2 - 0.12) / (nRib - 1));
      var pipe = cyl(0.013, 0.013, slopeLen - 0.05, 6, k > 0 ? M.corrShd : M.corrSun, px, 0.028, k * slopeLen / 2);
      pipe.rotation.x = PI / 2; pipe.name = 'corrugated-ribs'; sg.add(pipe);
    }
    for (i = 0; i < 2; i++) {                                /* 博风板（坡侧封边） */
      var bb = box(0.022, 0.055, slopeLen, M.plankD, (i ? 1 : -1) * (w + over * 2) / 2, 0.012, k * slopeLen / 2);
      bb.name = 'barge-board'; sg.add(bb);
    }
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.02, M.plankD, 0, -0.006, k * eave));   /* 封檐 */
  }
  if (o.gable !== false) {                                    /* 山墙封板 */
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plank); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plank); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  }
  g.add(box(w + over * 2 + 0.05, 0.05, 0.07, M.plankD, 0, h + 0.025, 0));   /* 木脊压顶 */
  var rr = cyl(0.024, 0.024, w + over * 2 + 0.1, 8, M.corrShd, 0, h + 0.075, 0);  /* 脊辊 */
  rr.rotation.z = PI / 2; rr.name = 'ridge-roll'; g.add(rr);
  return g;
}

/* 木栏杆（露台/阳台）：地栿 + 竖balusters + 中横档 + 扶手 + 柱头圆球（度假民宿式） */
function railUnit(M, w, n) {
  var g = grp(); g.name = 'roof-terrace';
  n = n || Math.max(4, Math.round(w / 0.1));
  g.add(box(w, 0.026, 0.03, M.plankD, 0, 0.013, 0));
  var i;
  for (i = 0; i <= n; i++) g.add(box(0.018, 0.13, 0.014, M.plank, -w / 2 + i * (w / n), 0.09, 0));
  g.add(box(w, 0.016, 0.018, M.plankD, 0, 0.088, 0));          /* 中横档 */
  g.add(box(w + 0.03, 0.026, 0.045, M.plankD, 0, 0.165, 0));
  var p1 = sph(0.013, M.plankD, -w / 2 - 0.005, 0.185, 0); p1.name = 'rail-finial'; g.add(p1);
  var p2 = sph(0.013, M.plankD, w / 2 + 0.005, 0.185, 0); p2.name = 'rail-finial'; g.add(p2);
  return g;
}

/* 红柱（lv4 宫殿）：石础金边 + 朱柱 + 上下双金箍 + 柱头块 */
function redColumn(M, h, r) {
  var g = grp(); g.name = 'palace-portico';
  g.add(cyl(r * 1.4, r * 1.55, 0.04, 10, M.stoneD, 0, 0.02, 0));
  g.add(cyl(r * 1.52, r * 1.62, 0.014, 10, M.gold, 0, 0.047, 0));   /* 础上金边 */
  g.add(cyl(r, r, h, 10, M.lacqBr, 0, 0.04 + h / 2, 0));
  g.add(cyl(r * 1.14, r * 1.14, 0.02, 10, M.gold, 0, 0.04 + h * 0.45, 0));  /* 柱中金箍 */
  g.add(cyl(r * 1.2, r * 1.2, 0.026, 10, M.gold, 0, 0.04 + h * 0.8, 0));
  g.add(box(r * 3, 0.035, r * 3, M.lacqDk, 0, 0.05 + h, 0));
  return g;
}

/* 凹曲坡面（lv4 翘檐）：坡面分 3 段弦（脊陡檐缓的权值分配），ΣΔz=eave、ΣΔy=rise 精确闭合
 * 返回 {g, end:{o,y,f}}；axis 'z'|'x'，sign ±1 出沿方向；局部原点=脊 */
function tierSlope(M, eave, rise, wBox, mat, axis, sign) {
  var g2 = grp();
  var dw = [0.45, 0.33, 0.22], zw = [0.24, 0.33, 0.43];
  var i, acc = 0, yAcc = 0, fLast = 0;
  for (i = 0; i < 3; i++) {
    var dz = eave * zw[i], dr = rise * dw[i];
    var f = Math.atan2(dr, dz);
    var cl = Math.sqrt(dz * dz + dr * dr) + (i < 2 ? 0.014 : 0);
    var cMid = acc + cos(f) * cl / 2;
    var cY = yAcc - sin(f) * cl / 2;
    var seg;
    if (axis === 'z') {
      seg = box(wBox, 0.03, cl, mat, 0, cY, sign * cMid);
      seg.rotation.x = sign * f;
    } else {
      seg = box(cl, 0.03, wBox, mat, sign * cMid, cY, 0);
      seg.rotation.z = -sign * f;
    }
    g2.add(seg);
    acc += cos(f) * cl;
    yAcc -= sin(f) * cl;
    fLast = f;
  }
  return { g: g2, end: { o: acc, y: yAcc, f: fLast } };
}

/* 蓝瓦翼角翘檐层（lv4 三重顶之一）：四坡凹曲蓝瓦 + 四角两段上翘 + 檐下斗拱带 + 金脊金饰 */
function pagodaTier(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(); g.name = 'roof-system';
  var eaveF = d / 2 + 0.09, eaveS = w / 2 + 0.09;
  var wF = w * 0.7 + 0.18, wS = d * 0.66;
  var sp;
  sp = tierSlope(M, eaveF, h, wF, M.tileSun, 'z', 1); sp.g.position.set(0, h, 0); g.add(sp.g);
  var eF = sp.end;
  sp = tierSlope(M, eaveF, h, wF, M.tileShd, 'z', -1); sp.g.position.set(0, h, 0); g.add(sp.g);
  sp = tierSlope(M, eaveS, h, wS, M.tileShd, 'x', 1); sp.g.position.set(0, h, 0); g.add(sp.g);
  sp = tierSlope(M, eaveS, h, wS, M.tileShd, 'x', -1); sp.g.position.set(0, h, 0); g.add(sp.g);
  /* 檏口封檐 + 檐下斗拱带（正面） */
  var fas = box(wF + 0.02, 0.045, 0.022, M.lacqDk, 0, h + eF.y - 0.005, eF.o);
  fas.rotation.x = eF.f; fas.name = 'tile-course-relief'; g.add(fas);
  var fab = box(wF * 0.92, 0.035, 0.03, M.lacqDk, 0, h + eF.y - 0.052, eF.o - 0.03);
  fab.rotation.x = eF.f; g.add(fab);
  var dI;
  for (dI = 0; dI < 4; dI++) {                                  /* 金色斗拱块 ×4 */
    var dou = box(0.032, 0.026, 0.028, M.gold, -wF * 0.36 + dI * (wF * 0.24), h + eF.y - 0.03, eF.o - 0.026);
    dou.rotation.x = eF.f; dou.name = 'dougong-block'; g.add(dou);
  }
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {   /* 四角两段上翘 + 金角珠 */
    var lift1 = box(0.07, 0.045, 0.07, M.lacqDk, c[0] * (eaveS - 0.055), 0.042, c[1] * (eaveF - 0.055));
    lift1.rotation.z = -c[0] * 0.5; lift1.rotation.x = c[1] * 0.24; g.add(lift1);
    var lift2 = box(0.055, 0.04, 0.055, M.lacqDk, c[0] * (eaveS - 0.008), 0.085, c[1] * (eaveF - 0.008));
    lift2.rotation.z = -c[0] * 0.85; lift2.rotation.x = c[1] * 0.42; g.add(lift2);
    g.add(sph(0.02, M.gold, c[0] * (eaveS - 0.008), 0.118, c[1] * (eaveF - 0.008)));
  });
  g.add(box(w * 0.42, 0.055, 0.06, M.gold, 0, h + 0.03, 0));    /* 金脊 */
  var f1 = cone(0.026, 0.09, 6, M.gold, w * 0.21, h + 0.09, 0); f1.rotation.z = -0.5; g.add(f1);
  var f2 = cone(0.026, 0.09, 6, M.gold, -w * 0.21, h + 0.09, 0); f2.rotation.z = 0.5; g.add(f2);
  return g;
}

/* 石狮（lv4 台阶一对）：基座 + 身 + 头 + 双耳 */
function stoneLion(M, s) {
  var g = grp(); s = s || 1; g.name = 'grand-stairs';
  g.add(box(0.1 * s, 0.03 * s, 0.1 * s, M.stoneD, 0, 0.015 * s, 0));
  var body = sph(0.046 * s, M.stone, 0, 0.07 * s, 0); body.scale.set(1, 0.9, 1.25); g.add(body);
  g.add(sph(0.034 * s, M.stone, 0, 0.122 * s, 0.04 * s));
  var e1 = cone(0.012 * s, 0.026 * s, 6, M.stone, 0.02 * s, 0.155 * s, 0.04 * s); e1.rotation.z = -0.3; g.add(e1);
  var e2 = cone(0.012 * s, 0.026 * s, 6, M.stone, -0.02 * s, 0.155 * s, 0.04 * s); e2.rotation.z = 0.3; g.add(e2);
  return g;
}

/* ================= 4. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 海滨冲浪小棚（h≈1.12）：木板棚 + 瓦楞顶 + 橙白彩棚吧台 + 双冲浪板 + 椰树 + 灯串 ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.25));
  /* 石基 + 木板棚身 */
  var mm = grp(); mm.name = 'main-mass'; g.add(mm);
  mm.add(box(1.5, 0.08, 1.06, M.stoneD, -0.06, 0.04, -0.06));
  mm.add(box(1.38, 0.5, 0.94, M.plank, -0.06, 0.33, -0.06));      /* 0.08-0.58 */
  /* 前脸：大店口（暗）+ 台沿 + 板条门 + 墙灯 */
  g.add(box(0.6, 0.32, 0.05, M.glass, -0.22, 0.3, 0.425));
  g.add(box(0.66, 0.05, 0.09, M.plankD, -0.22, 0.14, 0.44));
  var door = plankDoor(M, 0.26, 0.4); put(g, door, 0.36, 0.28, 0.42);
  var lamp = wallLamp(M, anims, 0.9); put(g, lamp, -0.6, 0.52, 0.42);
  /* 瓦楞铁双坡顶（apex≈0.94，真实瓦垄波纹） */
  var roof = corrRoof(M, { w: 1.34, d: 0.98, h: 0.26, ribs: 8 });
  put(g, roof, -0.06, 0.58, -0.06);
  /* 右侧木栈道（板缝） + 吧台 + 条凳 ×2（落座栈道面） */
  var bw1 = boardwalk(M, 0.68, 0.62, 4); put(g, bw1, 0.88, 0.076, 0.2);
  var awn = scallopAwning(M, { w: 0.78, d: 0.5, y0: 0.5, anims: anims, phase: 0.5, mCanopy: M.awnO, mValance: MAT('p39valO', function () {
    var t = getTex('stO', function () { return texStripe('#e0913c', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 0.78, 1 / 0.16); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), mBar: M.plankD, pitch: 0.35 });
  awn.rotation.y = PI / 2; put(g, awn, 0.66, 0, -0.02);
  var post1 = cyl(0.02, 0.024, 0.52, 8, M.plankD, 1.13, 0.37, 0.2); g.add(post1);
  var counter = barCounter(M, 0.66, 0.24); put(g, counter, 0.86, 0.105, 0.14);
  put(g, stool(M, 1), 0.86, 0.105, 0.42);
  put(g, stool(M, 0.9), 1.06, 0.105, 0.36);
  /* 左墙双冲浪板（黄木 + 青绿，板面分色条纹 + 尾鳍） */
  var sb1 = surfboard(M, M.surfWood, 0.72, M.lacqBr); put(g, sb1, -0.82, 0.42, 0.28, 0, 0.12, 0);
  var sb2 = surfboard(M, M.surfTeal, 0.6, M.cream); put(g, sb2, -0.88, 0.36, 0.14, 0, -0.06, 0);
  /* 檐角红灯笼 */
  var lt = lantern(M, 0.7, anims, 0.4); put(g, lt, -0.52, 0.56, 0.46);
  /* 灯串：后杆(高) + 右前杆(低) 悬链过顶 */
  var sl = stringLights(M, { x: -0.72, y: 1.06, z: -0.72 }, { x: 1.08, y: 0.9, z: 0.52 }, 0.16, 5, anims, 0.3, true);
  g.add(sl);
  /* 椰树（左后） + 灌丛 + 草丛 ×2 */
  var palm = palmTree(M, 0.95, anims, 1.2); put(g, palm, -0.72, 0.05, -0.55);
  var pp = potPlant(M, 1, M.leaf); put(g, pp, -1.02, 0.05, 0.6);
  var tf1 = mesh(new THREE.IcosahedronGeometry(0.05, 0), M.grassD); put(g, tf1, 0.5, 0.09, 0.86); tf1.scale.y = 0.7;
  var tf2 = mesh(new THREE.IcosahedronGeometry(0.042, 0), M.leafBr); put(g, tf2, -0.4, 0.085, 0.9); tf2.scale.y = 0.7;
  return g;
}

/* ---- lv2 两层民宿（h≈1.64）：蓝白彩棚店面 + 二层百叶/花箱 + 瓦楞顶 + 露台彩伞水塔 ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.35));
  /* 石基 + 一层（含青绿侧板） + 楼板 + 二层 */
  var mm = grp(); mm.name = 'main-mass'; g.add(mm);
  mm.add(box(1.78, 0.08, 1.1, M.stoneD, -0.08, 0.04, -0.08));
  mm.add(box(1.66, 0.56, 0.98, M.plank, -0.08, 0.36, -0.08));     /* 一层 0.08-0.64 */
  mm.add(box(1.7, 0.05, 1.02, M.plankD, -0.08, 0.665, -0.08));    /* 楼板 */
  mm.add(box(1.6, 0.48, 0.92, M.siding, -0.08, 0.93, -0.1));      /* 二层 0.69-1.17 */
  mm.add(box(1.64, 0.04, 0.96, M.plankD, -0.08, 1.19, -0.1));     /* 檐口板 */
  /* 一层门脸：店口 + 木栈道（板缝）+ 吧台 + 条凳 + 柳条箱（全部落座栈道面） */
  g.add(box(0.62, 0.34, 0.05, M.glass, -0.32, 0.32, 0.44));
  g.add(box(0.68, 0.05, 0.09, M.plankD, -0.32, 0.15, 0.455));
  var door = plankDoor(M, 0.24, 0.42); put(g, door, 0.28, 0.29, 0.43);
  var bw2 = boardwalk(M, 1.7, 0.5, 5); put(g, bw2, -0.06, 0.084, 0.72);
  var counter = barCounter(M, 0.6, 0.24); put(g, counter, -0.36, 0.115, 0.68);
  put(g, stool(M, 1), -0.52, 0.115, 0.88);
  put(g, stool(M, 0.9), -0.2, 0.115, 0.9);
  g.add(box(0.2, 0.16, 0.16, M.plankD, 0.66, 0.195, 0.6));       /* 柳条箱 */
  g.add(box(0.18, 0.14, 0.14, M.plankD, 0.64, 0.345, 0.58));
  /* 蓝白扇贝彩棚（一层整宽，微动） */
  var awn = scallopAwning(M, { w: 1.44, d: 0.46, y0: 0.64, anims: anims, phase: 1.1, mCanopy: M.awnB, mValance: MAT('p39valB', function () {
    var t = getTex('stB', function () { return texStripe('#6c93b4', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 1.44, 1 / 0.16); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), mBar: M.plankD, pitch: 0.34 });
  put(g, awn, -0.08, 0, 0.44);
  /* 二层：阳台窗台板 + 托架 ×2 + 百叶窗 ×2 + 花箱 ×2 + 灯笼 ×2 + 立招 */
  var ledge = box(1.42, 0.024, 0.1, M.plankD, -0.08, 0.712, 0.42); ledge.name = 'balcony-ledge'; g.add(ledge);
  g.add(box(0.03, 0.05, 0.08, M.plankD, -0.62, 0.675, 0.42));
  g.add(box(0.03, 0.05, 0.08, M.plankD, 0.46, 0.675, 0.42));
  var w1 = shutterWindow(M, 0.24, 0.28); put(g, w1, -0.44, 0.94, 0.385);
  var w2 = shutterWindow(M, 0.24, 0.28); put(g, w2, 0.16, 0.94, 0.385);
  var p1 = planterBox(M, 0.3); put(g, p1, -0.44, 0.72, 0.4);
  var p2 = planterBox(M, 0.3); put(g, p2, 0.16, 0.72, 0.4);
  var lt1 = lantern(M, 0.62, anims, 0.8); put(g, lt1, 0.52, 1.1, 0.4);
  var lt2 = lantern(M, 0.62, anims, 2.0); put(g, lt2, -0.72, 1.1, 0.4);
  var sign = grp(); sign.name = 'sign-board';
  sign.add(box(0.05, 0.52, 0.2, M.plankD, 0, 0, 0));
  var sp = mesh(new THREE.PlaneGeometry(0.17, 0.48), M.signV);
  sp.rotation.y = PI / 2; sp.position.set(0.032, 0, 0); sign.add(sp);
  put(g, sign, -0.92, 0.82, 0.4);
  /* 后半瓦楞铁顶（真实瓦垄）+ 前半露台 */
  var roof = corrRoof(M, { w: 1.52, d: 0.86, h: 0.2, ribs: 8 });
  put(g, roof, -0.08, 1.21, -0.32);                              /* apex≈1.51 */
  g.add(box(0.78, 0.045, 0.86, M.plankD, 0.4, 1.212, 0.32));     /* 露台板 */
  var rail = railUnit(M, 0.86, 8); put(g, rail, 0.4, 1.235, 0.73);
  var railS = railUnit(M, 0.6, 6); railS.rotation.y = PI / 2; put(g, railS, 0.8, 1.235, 0.32);
  /* 露台件：黄白彩伞 + 绿棚小屋（瓦垄顶）+ 水塔 */
  put(g, parasol(M, 0.17, 0.3, M.umbY, anims, 0.6), 0.62, 1.235, 0.18);
  g.add(box(0.34, 0.24, 0.3, M.sidingD, -0.52, 1.35, -0.5));
  var shedRoof = box(0.4, 0.03, 0.36, M.corrShd, -0.52, 1.49, -0.5); shedRoof.rotation.x = 0.16; g.add(shedRoof);
  var sr;
  for (sr = 0; sr < 3; sr++) {
    var sp = cyl(0.011, 0.011, 0.34, 6, M.corrSun, -0.64 + sr * 0.12, 1.516, -0.5);
    sp.rotation.x = PI / 2 + 0.16; sp.name = 'corrugated-ribs'; g.add(sp);
  }
  g.add(cyl(0.09, 0.1, 0.2, 10, M.stone, 0.05, 1.33, -0.62));
  g.add(cyl(0.095, 0.095, 0.02, 10, M.stoneD, 0.05, 1.44, -0.62));
  /* 右侧冲浪板（条纹尾鳍） + 右后椰树 + 左前盆栽 */
  var sb = surfboard(M, M.surfTeal, 0.66, M.cream); put(g, sb, 0.88, 0.38, 0.5, 0, -0.15, 0);
  var palm = palmTree(M, 0.95, anims, 2.0); put(g, palm, 0.74, 0.05, -0.78);
  var pp = potPlant(M, 1.1, M.leaf); put(g, pp, -1.06, 0.05, 0.72);
  /* 露台灯串（栏杆柱 → 椰树侧） */
  var sl = stringLights(M, { x: -0.16, y: 1.4, z: 0.73 }, { x: 0.78, y: 1.44, z: -0.1 }, 0.1, 4, anims, 1.6, false);
  g.add(sl);
  return g;
}

/* ---- lv3 三层大街楼（h≈2.20）：双店门面 + 层层彩棚 + 平顶屋顶酒吧（凉亭 + 双伞 + 绿篱） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.4));
  /* 石基 + 三层灰泥楼身（逐层内收） */
  var mm = grp(); mm.name = 'main-mass'; g.add(mm);
  mm.add(box(1.9, 0.08, 1.18, M.stoneD, -0.04, 0.04, -0.08));
  mm.add(box(1.78, 0.58, 1.06, M.stucco, -0.04, 0.37, -0.08));    /* L1 0.08-0.66 */
  mm.add(box(1.82, 0.045, 1.1, M.stoneD, -0.04, 0.683, -0.08));   /* 层带 */
  mm.add(box(1.62, 0.5, 0.98, M.stucco, -0.04, 0.955, -0.1));     /* L2 0.71-1.21 */
  mm.add(box(1.66, 0.04, 1.02, M.stoneD, -0.04, 1.23, -0.1));     /* 层带 */
  mm.add(box(1.4, 0.44, 0.88, M.stucco, -0.04, 1.47, -0.12));     /* L3 1.25-1.69 */
  mm.add(box(1.5, 0.06, 0.98, M.stoneD, -0.04, 1.72, -0.12));     /* 天沟/女儿墙底 */
  /* 一层双店门面：蓝白（左）+ 红白（右）彩棚（微动）+ 木栈道 + 双吧台 + 条凳 + 灯笼 */
  var awnA = scallopAwning(M, { w: 0.74, d: 0.44, y0: 0.63, anims: anims, phase: 0.2, mCanopy: M.awnB, mValance: MAT('p39valB', function () {
    var t = getTex('stB', function () { return texStripe('#6c93b4', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 0.74, 1 / 0.16); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), pitch: 0.34 });
  put(g, awnA, -0.42, 0, 0.46);
  var awnB = scallopAwning(M, { w: 0.74, d: 0.44, y0: 0.63, anims: anims, phase: 1.4, mCanopy: M.awnR, mValance: MAT('p39valR', function () {
    var t = getTex('stR', function () { return texStripe('#c65a4a', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 0.74, 1 / 0.16); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), pitch: 0.34 });
  put(g, awnB, 0.36, 0, 0.46);
  var bw3 = boardwalk(M, 1.84, 0.46, 6); put(g, bw3, 0.0, 0.084, 0.8);
  var cA = barCounter(M, 0.5, 0.22); put(g, cA, -0.44, 0.115, 0.72);
  var cB = barCounter(M, 0.5, 0.22); put(g, cB, 0.38, 0.115, 0.72);
  put(g, stool(M, 0.95), -0.56, 0.115, 0.96);
  put(g, stool(M, 0.85), 0.3, 0.115, 0.98);
  var lt1 = lantern(M, 0.6, anims, 0.5); put(g, lt1, -0.03, 0.6, 0.5);
  var lt2 = lantern(M, 0.55, anims, 1.7); put(g, lt2, 0.78, 1.14, 0.44);
  var cb = chalkboard(M); put(g, cb, 0.68, 0.116, 0.98);
  /* 二层：百叶窗 ×2 + 小彩棚（蓝白）+ 栏杆花箱 + 墙灯 */
  var w21 = shutterWindow(M, 0.24, 0.26); put(g, w21, -0.4, 0.99, 0.41);
  var w22 = shutterWindow(M, 0.24, 0.26); put(g, w22, 0.3, 0.99, 0.41);
  var awn2 = scallopAwning(M, { w: 0.4, d: 0.3, y0: 1.19, anims: anims, phase: 2.3, mCanopy: M.awnB, mValance: MAT('p39valB', function () {
    var t = getTex('stB', function () { return texStripe('#6c93b4', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 0.4, 1 / 0.12); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), pitch: 0.3, drop: 0.06 });
  put(g, awn2, -0.4, 0, 0.43);
  var rail2 = railUnit(M, 0.9, 8); put(g, rail2, -0.04, 1.235, 0.44);
  var pb1 = planterBox(M, 0.3); put(g, pb1, -0.36, 1.21, 0.46);
  var pb2 = planterBox(M, 0.3); put(g, pb2, 0.3, 1.21, 0.46);
  var lamp3 = wallLamp(M, anims, 2.2); put(g, lamp3, 0.62, 1.14, 0.43);
  /* 三层：百叶窗 ×2 + 红白小彩棚 + 花箱 */
  var w31 = shutterWindow(M, 0.22, 0.24); put(g, w31, -0.32, 1.49, 0.37);
  var w32 = shutterWindow(M, 0.22, 0.24); put(g, w32, 0.24, 1.49, 0.37);
  var awn3 = scallopAwning(M, { w: 0.5, d: 0.3, y0: 1.67, anims: anims, phase: 3.1, mCanopy: M.awnR, mValance: MAT('p39valR', function () {
    var t = getTex('stR', function () { return texStripe('#c65a4a', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 0.5, 1 / 0.12); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), pitch: 0.3, drop: 0.06 });
  put(g, awn3, -0.04, 0, 0.4);
  var pb3 = planterBox(M, 0.26); put(g, pb3, -0.04, 1.7, 0.41);
  /* 平顶屋顶酒吧（台面 1.75）：女儿墙 + 连续绿篱带 + 凉亭棚 + 双伞 + 灯串桅杆 */
  g.add(box(1.5, 0.09, 0.06, M.stoneD, -0.04, 1.775, 0.36));     /* 前女儿墙 */
  g.add(box(1.5, 0.09, 0.06, M.stoneD, -0.04, 1.775, -0.58));    /* 后女儿墙 */
  g.add(box(0.06, 0.09, 0.94, M.stoneD, 0.71, 1.775, -0.11));
  g.add(box(0.06, 0.09, 0.94, M.stoneD, -0.79, 1.775, -0.11));
  g.add(box(0.9, 0.07, 0.1, M.plankD, -0.04, 1.77, 0.27));       /* 绿篱槽（加长） */
  var hI, hedgeMats = [M.leafBr, M.leaf, M.grassD, M.leafBr, M.leaf];
  for (hI = 0; hI < 5; hI++) {
    var hb = mesh(new THREE.IcosahedronGeometry(0.06, 0), hedgeMats[hI]);
    put(g, hb, -0.4 + hI * 0.18, 1.82, 0.27); hb.scale.y = 0.8; hb.name = 'hedge';
  }
  /* 凉亭棚（红白彩棚小屋：角柱 ×2 + 板门） */
  g.add(box(0.44, 0.3, 0.36, M.plank, -0.44, 1.94, -0.3));
  g.add(cyl(0.012, 0.014, 0.3, 8, M.plankD, -0.64, 1.94, -0.108));
  g.add(cyl(0.012, 0.014, 0.3, 8, M.plankD, -0.24, 1.94, -0.108));
  g.add(box(0.16, 0.22, 0.02, M.plankD, -0.44, 1.9, -0.125));
  var kAwn = scallopAwning(M, { w: 0.5, d: 0.32, y0: 2.1, anims: anims, phase: 0.9, mCanopy: M.awnR, mValance: MAT('p39valR', function () {
    var t = getTex('stR', function () { return texStripe('#c65a4a', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 0.5, 1 / 0.1); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), pitch: 0.28, drop: 0.05 });
  put(g, kAwn, -0.44, 0, -0.12);
  var lt3 = lantern(M, 0.5, anims, 2.6); put(g, lt3, -0.18, 2.02, -0.12);
  /* 双伞：蓝白（右后）+ 红白（右前小） */
  put(g, parasol(M, 0.19, 0.34, M.awnB, anims, 0.9), 0.42, 1.75, -0.3);
  put(g, parasol(M, 0.15, 0.28, M.awnR, anims, 2.1), 0.14, 1.75, 0.14);
  /* 灯串桅杆（右后角）→ 前女儿墙 */
  var mast = cyl(0.014, 0.018, 0.44, 8, M.pole, 0.66, 1.95, -0.5); g.add(mast);
  var sl = stringLights(M, { x: 0.66, y: 2.14, z: -0.5 }, { x: -0.7, y: 1.82, z: 0.33 }, 0.12, 5, anims, 1.2, false);
  g.add(sl);
  /* 右后椰树 + 盆栽 */
  var palm = palmTree(M, 1.05, anims, 2.8); put(g, palm, 0.6, 0.05, -0.8);
  var pp = potPlant(M, 1.1, M.leaf); put(g, pp, -1.02, 0.05, 0.8);
  return g;
}

/* ---- lv4 度假宫殿地标（h≈2.56）：石台宽阶石狮 + 朱柱楼身 + 三重蓝瓦金脊翘檐 + 满檐灯笼 ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.4));
  /* 石台基 + 宽阶 + 垂带 + 台沿线脚 + 望柱 ×4 + 石狮一对 + 灯笼座 */
  g.add(box(2.25, 0.05, 1.68, M.stoneD, 0, 0.025, -0.06));
  g.add(box(2.12, 0.15, 1.56, M.stone, 0, 0.125, -0.08));        /* 台面 0.2 */
  var st1 = box(0.66, 0.052, 0.17, M.stoneD, 0, 0.026, 1.06); g.add(st1);
  var st2 = box(0.66, 0.052, 0.17, M.stoneD, 0, 0.078, 0.9); g.add(st2);
  var st3 = box(0.66, 0.052, 0.17, M.stoneD, 0, 0.13, 0.74); g.add(st3);
  g.add(box(0.12, 0.16, 0.6, M.stoneD, -0.4, 0.1, 0.86));        /* 垂带石 */
  g.add(box(0.12, 0.16, 0.6, M.stoneD, 0.4, 0.1, 0.86));
  var mold = grp(); mold.name = 'grand-stairs'; g.add(mold);      /* 台沿线脚（须弥座式） */
  mold.add(box(0.73, 0.028, 0.024, M.stoneD, -0.695, 0.19, 0.7));
  mold.add(box(0.73, 0.028, 0.024, M.stoneD, 0.695, 0.19, 0.7));
  mold.add(box(0.024, 0.028, 1.56, M.stoneD, -1.06, 0.19, -0.08));
  mold.add(box(0.024, 0.028, 1.56, M.stoneD, 1.06, 0.19, -0.08));
  [-0.98, -0.36, 0.36, 0.98].forEach(function (px) {              /* 望柱 + 柱头珠 */
    mold.add(cyl(0.014, 0.017, 0.09, 8, M.stone, px, 0.245, 0.66));
    var bl = sph(0.015, M.stone, px, 0.305, 0.66); bl.name = 'baluster-post'; mold.add(bl);
  });
  put(g, stoneLion(M, 1.05), -0.56, 0.2, 0.5);
  put(g, stoneLion(M, 1.05), 0.56, 0.2, 0.5);
  var ls1 = cyl(0.02, 0.026, 0.3, 8, M.stoneD, -0.86, 0.35, 0.5); g.add(ls1);
  var ls1b = lantern(M, 0.5, anims, 3.2); put(g, ls1b, -0.86, 0.52, 0.5);
  var ls2 = cyl(0.02, 0.026, 0.3, 8, M.stoneD, 0.86, 0.35, 0.5); g.add(ls2);
  var ls2b = lantern(M, 0.5, anims, 4.4); put(g, ls2b, 0.86, 0.52, 0.5);
  /* 底层朱楼（0.2-0.80）：楼身 + 中央朱门金钉 + 两侧店口 + 彩棚（微动）+ 朱柱 ×4（金线箍） */
  var mm = grp(); mm.name = 'main-mass'; g.add(mm);
  mm.add(box(1.8, 0.6, 1.06, M.lacq, 0, 0.5, -0.08));             /* 底层 */
  var portal = grp(); put(g, portal, 0, 0.2, 0.44);
  portal.add(box(0.34, 0.46, 0.05, M.glass, 0, 0.23, 0));
  portal.add(box(0.15, 0.42, 0.05, M.lacqBr, -0.095, 0.21, 0.012));
  portal.add(box(0.15, 0.42, 0.05, M.lacqBr, 0.095, 0.21, 0.012));
  portal.add(box(0.42, 0.06, 0.07, M.lacqDk, 0, 0.49, 0.01));
  [-0.3, -0.1, 0.1, 0.3].forEach(function (x) {
    portal.add(sph(0.012, M.gold, x * 0.4, 0.32, 0.04));
  });
  var bayA = scallopAwning(M, { w: 0.56, d: 0.36, y0: 0.76, anims: anims, phase: 0.3, mCanopy: M.awnR, mValance: MAT('p39valR', function () {
    var t = getTex('stR', function () { return texStripe('#c65a4a', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 0.56, 1 / 0.12); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), pitch: 0.3, drop: 0.06 });
  put(g, bayA, -0.56, 0, 0.44);
  var bayB = scallopAwning(M, { w: 0.56, d: 0.36, y0: 0.76, anims: anims, phase: 1.6, mCanopy: M.awnB, mValance: MAT('p39valB', function () {
    var t = getTex('stB', function () { return texStripe('#6c93b4', '#f0e3c8', 8); }).clone();
    t.needsUpdate = true; t.repeat.set(1 / 0.56, 1 / 0.12); t.offset.set(0.5, 1);
    return std('#ffffff', { map: t, rough: 0.85 });
  }), pitch: 0.3, drop: 0.06 });
  put(g, bayB, 0.56, 0, 0.44);
  var col1 = redColumn(M, 0.54, 0.03); put(g, col1, -0.84, 0.2, 0.4);
  var col2 = redColumn(M, 0.54, 0.03); put(g, col2, -0.3, 0.2, 0.44);
  var col3 = redColumn(M, 0.54, 0.03); put(g, col3, 0.3, 0.2, 0.44);
  var col4 = redColumn(M, 0.54, 0.03); put(g, col4, 0.84, 0.2, 0.4);
  mm.add(box(1.9, 0.055, 1.16, M.lacqDk, 0, 0.825, -0.08));       /* 额枋 */
  mm.add(box(1.9, 0.02, 1.16, M.gold, 0, 0.86, -0.08));           /* 金线 */
  /* 一重顶（0.88 起，凹曲翘檐 + 檐下斗拱带）+ 檐口灯笼串 */
  var t1 = pagodaTier(M, { w: 2.0, d: 1.36, h: 0.22 });
  put(g, t1, 0, 0.88, -0.08);
  var ls1s = lanternString(M, 1.5, 0.04, anims, 5.0); put(g, ls1s, 0, 0.87, 0.62);
  /* 二层（1.10-1.50）：朱墙 + 雕栏金手 + 窗 + 绿白小伞 + 灯笼 ×2 */
  var mm2 = grp(); mm2.name = 'main-mass'; g.add(mm2);
  mm2.add(box(1.5, 0.42, 0.92, M.lacqBr, 0, 1.31, -0.1));
  var rail2 = railUnit(M, 0.94, 8); rail2.name = 'palace-portico'; put(g, rail2, 0, 1.12, 0.36);
  g.add(box(0.98, 0.02, 0.05, M.gold, 0, 1.29, 0.37));           /* 金扶手 */
  var w41 = shutterWindow(M, 0.2, 0.22); put(g, w41, -0.3, 1.32, 0.37);
  var w42 = shutterWindow(M, 0.2, 0.22); put(g, w42, 0.3, 1.32, 0.37);
  put(g, parasol(M, 0.13, 0.24, M.umbG, anims, 1.4), -0.62, 1.12, 0.14);
  var lt5 = lantern(M, 0.52, anims, 0.7); put(g, lt5, -0.55, 1.06, 0.42);
  var lt6 = lantern(M, 0.52, anims, 1.9); put(g, lt6, 0.55, 1.06, 0.42);
  /* 二重顶（1.52 起）+ 檐口灯笼串 */
  var t2 = pagodaTier(M, { w: 1.62, d: 1.12, h: 0.2 });
  put(g, t2, 0, 1.52, -0.1);
  var ls2s = lanternString(M, 1.2, 0.04, anims, 6.2); put(g, ls2s, 0, 1.51, 0.48);
  /* 三层（1.72-2.08）：朱墙 + 窗 + 灯笼 ×2 */
  var mm3 = grp(); mm3.name = 'main-mass'; g.add(mm3);
  mm3.add(box(1.18, 0.36, 0.78, M.lacqBr, 0, 1.9, -0.12));
  var w43 = shutterWindow(M, 0.18, 0.2); put(g, w43, -0.24, 1.91, 0.28);
  var w44 = shutterWindow(M, 0.18, 0.2); put(g, w44, 0.24, 1.91, 0.28);
  var lt7 = lantern(M, 0.48, anims, 2.9); put(g, lt7, -0.42, 1.66, 0.34);
  var lt8 = lantern(M, 0.48, anims, 4.1); put(g, lt8, 0.42, 1.66, 0.34);
  /* 三重顶（2.1 起）+ 金顶刹（apex≈2.56） */
  var t3 = pagodaTier(M, { w: 1.3, d: 0.92, h: 0.2 });
  put(g, t3, 0, 2.1, -0.12);
  g.add(cyl(0.016, 0.022, 0.14, 8, M.gold, 0, 2.42, -0.12));
  g.add(sph(0.032, M.gold, 0, 2.52, -0.12));
  /* 灯串：台角桅杆 → 二层栏角 */
  var mast = cyl(0.014, 0.018, 1.1, 8, M.pole, 1.0, 0.75, 0.42); g.add(mast);
  var sl = stringLights(M, { x: 1.0, y: 1.28, z: 0.42 }, { x: 0.5, y: 1.24, z: 0.4 }, 0.08, 4, anims, 2.4, false);
  g.add(sl);
  /* 右后椰树 + 台阶盆栽 */
  var palm = palmTree(M, 1.1, anims, 3.6); put(g, palm, 0.58, 0.05, -0.78);
  var pp1 = potPlant(M, 1.15, M.leafBr); put(g, pp1, -0.82, 0.2, 0.56);
  var pp2 = potPlant(M, 1.15, M.leaf); put(g, pp2, 0.82, 0.2, 0.56);
  return g;
}

/* ================= 5. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[39] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_39_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 39;
  g.userData.level = lv;
  g.userData.region = 'g8';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
