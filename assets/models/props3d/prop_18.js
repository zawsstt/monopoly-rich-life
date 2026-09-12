/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_18.js
 * -------------------------------------------------------------------------------------
 * 格 18「锦里古街」(g4 川西木构街市) 独属建筑：锦里楼阁四阶生长史
 * 参考图 refs/prop_18.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop18/）。
 *
 * 风格族谱（同一块地的同一种生长，对位参考图四联）：
 *   lv1 小屋   木瓦弯栰小屋：板壁穿斗构架 + 双扇木门 + 木格窗 + 檐角红灯笼（h≈1.02）
 *   lv2 洋房   两层楼屋：底层开敞铺面 + 二层雕花檐廊 + 黑青瓦主顶/腰披檐（h≈1.60）
 *   lv3 大厦   三层楼阁：层层退台 + 三重檐大翘角 + 竖串灯笼 + 锦里匾/黄幌（h≈2.10）
 *   lv4 地标   石台基 + 大踏步 + 红漆柱网 + 重檐歇山金宝顶 + 红瓦檐帐 + 油纸伞（h≈2.70）
 *
 * 独有语汇（自参考图提炼）：暖褐穿斗木构 + 米白抹灰填板 + 冷黑青筒瓦垄（檐角大翘、
 * 鸱吻状翘脊）+ 开敞雕花木格窗 + 橙红灯笼（竖串）+ 竹丛 + 石板径/草皮台 + lv4 金葫芦
 * 宝顶/红瓦檐帐/油纸伞。与 prop_1（素雅灰瓦白墙）/prop_3（灰砖朱漆）/prop_6（民国
 * 砖石）/prop_8（石库门）/prop_9（骑楼）拉开：木色占主导、瓦更冷更黑、竹为名片。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[18] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_18] THREE 未定义，请先加载 three.min.js (r147)');
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
function MAT(id, make) {
  if (!_mc[id]) { _mc[id] = make(); try { _mc[id].name = id; } catch (e) {} }
  return _mc[id];
}

function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 12, 10), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function ico(r, mat, x, y, z) { var o = mesh(new THREE.IcosahedronGeometry(r, 0), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
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

/* 冷黑青筒瓦垄：竖向垄行明暗 + 垄沟深线 + 陶面噪点（map+bump 同源） */
function texTileRows() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#3c413b'; g.fillRect(0, 0, S, S);
  var cols = 8, cw = S / cols, i, k;
  for (i = 0; i < cols; i++) {
    var x = i * cw;
    g.fillStyle = (i % 2) ? '#4a5049' : '#434941';            /* 垄面 */
    g.fillRect(x, 0, cw, S);
    g.fillStyle = '#565c54'; g.fillRect(x + 2, 0, 4, S);      /* 垄脊受光 */
    g.fillStyle = '#262a25'; g.fillRect(x + cw - 4, 0, 4, S); /* 垄沟阴影 */
    g.fillStyle = 'rgba(30,33,29,0.5)';
    var off = (i % 2) ? 8 : 0;
    for (k = 0; k < 4; k++) g.fillRect(x + 3, off + k * (S / 4), cw - 6, 2); /* 搭接横缝 */
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(210,225,205,0.05)' : 'rgba(12,15,12,0.10)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* lv1 木瓦弯栰：横行叠瓦 + 木纹纤维 + 风化噪点 */
function texShingle() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#6e6250'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#7b6f5b' : '#6a5e4b';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#4e4536'; g.fillRect(0, y + rh - 3, S, 3);  /* 行间阴影缝 */
    g.fillStyle = '#8f8268'; g.fillRect(0, y + 1, S, 2);       /* 瓦栰受光缘 */
    var off = (i % 2) ? 10 : 0;
    for (k = 0; k < 5; k++) {                                   /* 竖向板瓦错缝 */
      g.fillStyle = 'rgba(52,44,32,0.4)';
      g.fillRect((off + k * 26) % S, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(235,225,200,0.05)' : 'rgba(30,24,16,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 米白抹灰填板：细噪 + 抹痕 */
function texPlaster() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#ded4bc'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(120,110,90,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 石板径：不规则石板拼缝 */
function texPath() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#c2bba4'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 14; i++) {
    var x = (i % 4) * 32 + ((i >> 2) % 2) * 10, y = (i >> 2) * 30 + 3;
    g.fillStyle = (i % 3) ? '#c9c2ab' : '#b5ae98';
    g.fillRect(x, y, 28, 26);
    g.fillStyle = 'rgba(70,64,50,0.35)'; g.fillRect(x, y + 26, 28, 2); g.fillRect(x + 28, y, 2, 28);
  }
  return toTex(cv, true);
}
/* 横式匾额「锦里古街」：暗红漆底 + 金字 */
function texPlaqueH() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#7c2413'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('锦里古街', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
/* 黄色酒幌：米黄布 + 朱红边 + 「锦」字 */
function texBanner() {
  var w = 64, h = 192, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#e3cf96'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#a83e20'; g.fillRect(0, 0, w, 8); g.fillRect(0, h - 8, w, 8);
  g.fillRect(0, 0, 6, h); g.fillRect(w - 6, 0, 6, h);
  g.fillStyle = '#a83e20'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 52px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('锦', w / 2, h / 2);
  return toTex(cv, true);
}
/* 横式匾额「锦里古街」：暗红漆底 + 金字（材质命名供调试/软渲染查色） */
function plaqueMat() {
  var m = new THREE.MeshStandardMaterial({ map: getTex('plaque', texPlaqueH), roughness: 0.6, metalness: 0.05, flatShading: true });
  m.name = 'p18plaque'; return m;
}
function bannerMat() {
  var m = new THREE.MeshStandardMaterial({ map: getTex('banner', texBanner), roughness: 0.85, flatShading: true, side: THREE.DoubleSide });
  m.name = 'p18banner'; return m;
}

var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图取样） */
function Mats() {
  return {
    tileSun:   MAT('p18tileSun', function () { var t = getTex('tile', texTileRows); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.66 }); }),
    tileShade: MAT('p18tileShd', function () { var t = getTex('tile', texTileRows); return std('#9aa096', { map: t, bump: t, bumpScale: 0.016, rough: 0.72 }); }),
    ridge:     MAT('p18ridge', function () { return std('#23261f', { rough: 0.82 }); }),
    shingle:   MAT('p18shingle', function () { var t = getTex('shingle', texShingle); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.9 }); }),
    shingleD:  MAT('p18shingleD', function () { return std('#544a38', { rough: 0.92 }); }),
    timber:    MAT('p18timber', function () { return std('#8a5c33', { rough: 0.82 }); }),
    timberD:   MAT('p18timberD', function () { return std('#5f4023', { rough: 0.86 }); }),
    woodF:     MAT('p18woodF', function () { return std('#4f3a22', { rough: 0.86 }); }),
    plaster:   MAT('p18plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.93 }); }),
    lacq:      MAT('p18lacq', function () { return std('#a83e20', { rough: 0.52 }); }),
    lacqBr:    MAT('p18lacqBr', function () { return std('#c14a28', { rough: 0.45 }); }),
    lacqDk:    MAT('p18lacqDk', function () { return std('#8c3018', { rough: 0.6 }); }),
    cream:     MAT('p18cream', function () { return std('#e3cf96', { rough: 0.9 }); }),
    gold:      MAT('p18gold', function () { return std('#d8a63c', { rough: 0.35, metal: 0.72 }); }),
    goldGlow:  MAT('p18goldGlow', function () { return std('#e8a040', { rough: 0.4, metal: 0.6, emissive: '#ffb050', ei: 0.22 }); }),
    stone:     MAT('p18stone', function () { return std('#bdb6a2', { rough: 0.92 }); }),
    stoneD:    MAT('p18stoneD', function () { return std('#a29b88', { rough: 0.94 }); }),
    grass:     MAT('p18grass', function () { return std('#8aa851', { rough: 0.95 }); }),
    grassD:    MAT('p18grassD', function () { return std('#7a9847', { rough: 0.95 }); }),
    bamboo:    MAT('p18bamboo', function () { return std('#7a9a4a', { rough: 0.8 }); }),
    bambooL:   MAT('p18bambooL', function () { return std('#8fb25a', { rough: 0.85 }); }),
    path:      MAT('p18path', function () { var t = getTex('path', texPath); return std('#ffffff', { map: t, rough: 0.95 }); }),
    interior:  MAT('p18interior', function () { return std('#241a10', { rough: 0.95 }); }),
    glowPane:  MAT('p18glowPane', function () { return std('#4a3418', { rough: 0.9, emissive: '#ff9a4a', ei: 0.2 }); })
  };
}

/* ================= 2. 预制件（锦里独有语汇） ================= */

/* 灯笼：金盖 + 橙红壳（发光呼吸）+ 金底穗环（3 mesh 精简版） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p18lant' + (phase || 0), function () { return std('#e0503a', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.034 * s, 0.048 * s, 0.032 * s, 10, M.gold, 0, 0.108 * s, 0));
  var body = sph(0.088 * s, bm, 0, 0, 0); body.scale.y = 0.82; g.add(body);
  g.add(cyl(0.02 * s, 0.012 * s, 0.075 * s, 8, M.gold, 0, -0.135 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 竖串灯笼：吊杆结点 + 绳 + n 只灯笼（整串轻摆） */
function lanternString(M, n, s, anims, phase) {
  var g = grp();
  var sway = grp(); g.add(sway);
  sway.add(cyl(0.006, 0.006, 0.06, 5, M.woodF, 0, 0.03, 0));
  var cordLen = n * 0.19 * s + 0.05;
  sway.add(cyl(0.005 * s, 0.005 * s, cordLen, 5, M.woodF, 0, -cordLen / 2, 0));
  var i;
  for (i = 0; i < n; i++) {
    var lt = lantern(M, s, anims, (phase || 0) + i * 0.9);
    put(sway, lt, 0, -0.06 - i * 0.19 * s, 0);
  }
  anims.push(function (t) { sway.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.05; sway.rotation.x = sin(t * 0.9 + (phase || 0) + 1.3) * 0.03; });
  return g;
}

/* 开敞雕花木格窗：木框 + 暗龛 + 竖棂横格（几何花格；mode 'dark'|'glow'） */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  var back = (o.mode === 'glow') ? M.glowPane : M.interior;
  g.add(box(w + 0.05, h + 0.05, 0.034, M.woodF));
  g.add(box(w, h, 0.03, back, 0, 0, 0.002));
  g.add(box(0.026, h, 0.038, M.timber, 0, 0, 0.008));
  var rows = o.rows || 2, i;
  for (i = 0; i < rows; i++) {
    var y = -h / 2 + (i + 1) * h / (rows + 1);
    g.add(box(w, 0.022, 0.038, M.timber, 0, y, 0.008));
  }
  return g;
}

/* 双扇木门：门框 + 暗洞 + 双扇板门 + 门楣 */
function woodDoor(M, w, h, y0) {
  var g = grp();
  g.add(box(w + 0.08, h + 0.05, 0.04, M.woodF, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.045, M.interior, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.46, h * 0.92, 0.05, M.timberD, -w * 0.24, y0 + h * 0.46, 0.006));
  g.add(box(w * 0.46, h * 0.92, 0.05, M.timberD, w * 0.24, y0 + h * 0.46, 0.006));
  g.add(box(w + 0.14, 0.055, 0.07, M.timberD, 0, y0 + h + 0.03, 0.008));
  return g;
}

/* 开敞铺面：暗龛 + 坐凳板 + 台面陶罐（铺面前脸） */
function shopCounter(M, w, y0, anims) {
  var g = grp();
  g.add(box(w, 0.42, 0.05, M.interior, 0, y0 + 0.21));
  var glow = mesh(new THREE.PlaneGeometry(w * 0.8, 0.3), M.glowPane);
  glow.position.set(0, y0 + 0.24, -0.022); g.add(glow);   /* 面朝 +Z：铺面暖光可见 */
  var n = 4, i;
  for (i = 0; i < n; i++) g.add(box(w / n - 0.014, 0.07, 0.02, M.timber, -w / 2 + (i + 0.5) * (w / n), y0 + 0.115, 0.028));
  g.add(box(w + 0.04, 0.05, 0.15, M.woodF, 0, y0 + 0.2, 0.055));
  g.add(cyl(0.045, 0.055, 0.09, 10, M.stoneD, -w * 0.24, y0 + 0.27, 0.055));
  g.add(cyl(0.04, 0.05, 0.08, 10, M.lacqDk, w * 0.22, y0 + 0.265, 0.055));
  return g;
}

/* 木柱（石础 + 柱身 + 金/木箍）；red=true 用红漆柱（lv4） */
function column(M, h, r, red) {
  var g = grp();
  var bodyM = red ? M.lacqBr : M.timberD;
  g.add(cyl(r * 1.5, r * 1.7, 0.05, 10, M.stoneD, 0, 0.025, 0));
  g.add(cyl(r, r, h, 10, bodyM, 0, 0.05 + h / 2, 0));
  g.add(cyl(r * 1.16, r * 1.16, 0.024, 10, red ? M.gold : M.timber, 0, 0.05 + h * 0.85, 0));
  return g;
}

/* 木栏杆檐廊（雕花版）：地栿 + 望柱棂条 + 扶手；red=true 红漆（lv4） */
function balconyUnit(M, w, red, anims, phase) {
  var g = grp();
  var rail = red ? M.lacq : M.timberD, railB = red ? M.lacqBr : M.timber;
  g.add(box(w, 0.035, 0.2, M.woodF, 0, 0, 0.1));
  var n = Math.max(4, Math.round(w / 0.18)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.15, 0.015, rail, -w / 2 + i * (w / n), 0.09, 0.185));
  }
  g.add(box(w + 0.04, 0.028, 0.03, railB, 0, 0.172, 0.185));
  return g;
}

/* 黑青筒瓦坡顶：竖向瓦垄（迎光亮/背光暗）+ 檐口封板 + 大翘角（卷吻）+ 正脊翘吻
 *   o: {w,d,h, over, rows, gable, ridge, big, gableMat} */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var rows = o.rows !== undefined ? o.rows : 3;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.03, slopeLen, k > 0 ? M.tileSun : M.tileShade, 0, 0, k * slopeLen / 2));
    for (i = 0; i < rows; i++) {                                   /* 竖向筒瓦垄 */
      var u = -((w + over * 2) / 2 - 0.03) + (i + 0.5) * ((w + over * 2 - 0.06) / rows);
      sg.add(box(0.03, 0.02, slopeLen - 0.02, M.ridge, u, 0.024, k * (slopeLen / 2 - 0.02)));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.woodF, 0, -0.006, k * eave)); /* 檐口封板 */
    var c1 = box(0.08, 0.05, 0.075, M.ridge, (w + over * 2) / 2 - 0.012, 0.055, k * (eave - 0.015));
    c1.rotation.z = 0.62; c1.rotation.x = -k * 0.18; sg.add(c1);   /* 大翘角（卷吻） */
    var c2 = box(0.08, 0.05, 0.075, M.ridge, -(w + over * 2) / 2 + 0.012, 0.055, k * (eave - 0.015));
    c2.rotation.z = -0.62; c2.rotation.x = -k * 0.18; sg.add(c2);
  }
  if (o.gable !== false && o.gable !== undefined) {                /* 山墙封板（悬山） */
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
    g.add(box(rw, 0.06 + (o.big ? 0.02 : 0), 0.1, M.ridge, 0, h + 0.03, 0));
    var f1 = box(0.065, 0.11 + (o.big ? 0.03 : 0), 0.08, M.ridge, rw / 2 - 0.01, h + 0.105, 0);
    f1.rotation.z = 0.5; f1.rotation.x = 0.2; g.add(f1);           /* 鸱吻状翘头外翻 */
    var f2 = box(0.065, 0.11 + (o.big ? 0.03 : 0), 0.08, M.ridge, -rw / 2 + 0.01, h + 0.105, 0);
    f2.rotation.z = -0.5; f2.rotation.x = 0.2; g.add(f2);
    if (o.big) put(g, sph(0.034, M.gold), 0, h + 0.13, 0);
  }
  return g;
}

/* lv4 歇山顶：前后坡 + 左右坡 + 短正脊 + 四角大起翘 + 金葫芦宝顶 */
function sweepRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.72 + 0.2, 0.03, lenF, M.tileSun, 0, 0, lenF / 2));
  sgF.add(box(w * 0.72 + 0.22, 0.05, 0.024, M.woodF, 0, -0.006, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.72 + 0.2, 0.03, lenF, M.tileShade, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.03, d * 0.8, M.tileShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.03, d * 0.8, M.tileShade, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.085, 0.06, 0.085, M.ridge, c[0] * (eaveS - 0.02), 0.055, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.65; lift.rotation.x = c[1] * 0.2; g.add(lift);
  });
  g.add(box(w * 0.5, 0.07, 0.1, M.ridge, 0, h + 0.035, 0));
  var f1 = box(0.06, 0.13, 0.08, M.ridge, w * 0.25, h + 0.1, 0); f1.rotation.z = 0.45; g.add(f1);
  var f2 = box(0.06, 0.13, 0.08, M.ridge, -w * 0.25, h + 0.1, 0); f2.rotation.z = -0.45; g.add(f2);
  return g;
}

/* lv1 木瓦弯栰顶：横行叠瓦 + 圆栰脊（微翘） */
function shingleRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.1;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.03, slopeLen, M.shingle, 0, 0, k * slopeLen / 2));
    var nR = 4;
    for (i = 0; i < nR; i++) {                                      /* 横行弯栰叠瓦 */
      var v = (i + 0.5) / nR;
      sg.add(box(w + over * 2 - 0.03, 0.018, 0.035, M.shingleD, 0, 0.024, k * v * slopeLen * 0.92));
    }
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.022, M.woodF, 0, -0.005, k * eave));
    var c1 = box(0.07, 0.045, 0.07, M.woodF, (w + over * 2) / 2 - 0.01, 0.045, k * (eave - 0.012));
    c1.rotation.z = 0.5; sg.add(c1);
    var c2 = box(0.07, 0.045, 0.07, M.woodF, -(w + over * 2) / 2 + 0.01, 0.045, k * (eave - 0.012));
    c2.rotation.z = -0.5; sg.add(c2);
  }
  var roll = cyl(0.035, 0.035, w + over * 2 + 0.06, 10, M.shingleD, 0, h + 0.02, 0);
  roll.rotation.z = PI / 2; g.add(roll);                            /* 圆栰脊 */
  return g;
}

/* 竹丛：分段竹竿（微倾）+ 顶部叶团（整丛摇曳） */
function bambooClump(M, h, anims, phase) {
  var g = grp(); h = h || 0.9;
  var n = 3, i;
  var leaves = grp(); g.add(leaves);
  for (i = 0; i < n; i++) {
    var a = (i / n) * PI * 2 + 0.6, r = 0.05 + (i % 2) * 0.035;
    var bx = cos(a) * r, bz = sin(a) * r;
    var hh = h * (0.75 + (i % 3) * 0.14);
    var lean = 0.06 + (i % 2) * 0.05;
    var st = cyl(0.011, 0.016, hh, 6, M.bamboo, bx + lean * 0.5, hh / 2 + 0.02, bz);
    st.rotation.z = lean; st.rotation.x = (i % 2 ? 1 : -1) * 0.05;
    g.add(st);
    g.add(cyl(0.017, 0.017, 0.014, 6, M.bambooL, bx + lean * hh * 0.62, hh * 0.6 + 0.02, bz));
    var lf = ico(0.085, M.bambooL, bx + lean * hh * 0.94, hh + 0.05, bz);
    lf.scale.set(1, 0.55, 1); leaves.add(lf);
    var lf2 = ico(0.06, M.bamboo, bx + lean * hh + 0.055, hh - 0.02, bz - 0.045);
    lf2.scale.set(1, 0.5, 1); leaves.add(lf2);
  }
  anims.push(function (t) { leaves.rotation.z = sin(t * 1.35 + (phase || 0)) * 0.035; leaves.rotation.x = sin(t * 1.05 + (phase || 0) + 0.7) * 0.03; });
  return g;
}

/* 陶罐盆栽：圆腹罐 + 绿叶团 */
function potPlant(M, s, leafMat) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.09 * s, 10, M.stoneD, 0, 0.045 * s, 0));
  var b = ico(0.062 * s, leafMat || M.grassD, 0, 0.13 * s, 0); b.scale.y = 0.85; g.add(b);
  return g;
}

/* 油纸伞（lv4 茶摊）：伞杆 + 伞面锥 + 伞尖 */
function parasol(M, s, mat) {
  var g = grp(); s = s || 1;
  var m = mat || M.lacqBr;
  g.add(cyl(0.012 * s, 0.012 * s, 0.3 * s, 6, M.woodF, 0, 0.15 * s, 0));
  g.add(cyl(0.002 * s, 0.19 * s, 0.13 * s, 10, m, 0, 0.325 * s, 0));
  g.add(sph(0.018 * s, M.gold, 0, 0.4 * s, 0));
  return g;
}

/* 红瓦檐帐（lv4）：封板 + 一排下垂瓦当 + （可选）米黄凉棚 */
function valance(M, w, withAwning) {
  var g = grp();
  g.add(box(w, 0.05, 0.05, M.lacqDk, 0, 0, 0));
  var n = Math.max(4, Math.round(w / 0.18)), i;
  for (i = 0; i < n; i++) {
    var x = -w / 2 + (i + 0.5) * (w / n);
    g.add(box(w / n - 0.014, 0.07, 0.03, M.lacq, x, -0.055, 0.008));
  }
  if (withAwning) {
    var aw = box(w * 0.52, 0.025, 0.2, M.cream, 0, 0.045, 0.1);
    aw.rotation.x = 0.18; g.add(aw);
    g.add(box(w * 0.52, 0.02, 0.02, M.lacq, 0, 0.072, 0.19));
  }
  return g;
}

/* 草坪地坪：草面 + 土沿 + 石板径 + 岩石（参考图绿台基） */
function padUnit(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.032, d + 0.04, M.grassD, 0, 0.015, 0));
  var pf = mesh(new THREE.BoxGeometry(0.52, 0.016, 0.56), M.path); put(g, pf, 0, 0.054, d / 2 - 0.34);
  var pf2 = mesh(new THREE.BoxGeometry(0.4, 0.014, 0.3), M.path); put(g, pf2, 0, 0.052, d / 2 - 0.76);
  var r1 = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, r1, size / 2 - 0.3, 0.07, -d / 2 + 0.3);
  var r2 = mesh(new THREE.DodecahedronGeometry(0.038, 0), M.stoneD); put(g, r2, -size / 2 + 0.34, 0.062, d / 2 - 0.32);
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：木瓦弯栰小屋 + 竹丛 + 小桌陶罐（h≈1.02，参考图左一） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.3));
  /* 台基 + 板壁墙 + 穿斗角柱 */
  g.add(box(1.32, 0.07, 1.06, M.stoneD, -0.05, 0.035, -0.06));
  g.add(box(1.16, 0.56, 0.9, M.timberD, -0.05, 0.35, -0.06));      /* 板壁主体 0.07-0.63 */
  g.add(box(1.2, 0.12, 0.94, M.plaster, -0.05, 0.13, -0.06));      /* 下裙抹灰 */
  [[-0.63, -0.5], [0.53, -0.5], [-0.63, 0.38], [0.53, 0.38]].forEach(function (c) {
    g.add(box(0.055, 0.6, 0.055, M.timber, c[0], 0.36, c[1]));
  });
  g.add(box(1.24, 0.06, 0.06, M.timberD, -0.05, 0.655, 0.4));      /* 前檐枋 */
  /* 双扇木门（中）+ 木格窗（两侧）+ 门前石阶 */
  var door = woodDoor(M, 0.3, 0.38, 0.07); put(g, door, -0.05, 0, 0.395);
  var w1 = latticeWindow(M, 0.22, 0.24, { rows: 2 }); put(g, w1, -0.44, 0.42, 0.395);
  var w2 = latticeWindow(M, 0.22, 0.24, { rows: 2 }); put(g, w2, 0.34, 0.42, 0.395);
  g.add(box(0.42, 0.05, 0.22, M.stoneD, -0.05, 0.095, 0.48));
  /* 木瓦弯栰顶（apex≈1.0） */
  var roof = shingleRoof(M, { w: 1.18, d: 0.98, h: 0.3, over: 0.1 });
  put(g, roof, -0.05, 0.685, -0.06);
  /* 檐角灯笼 ×2（参考图左右檐柱） */
  var l1 = lantern(M, 0.66, anims, 0.4); put(g, l1, -0.6, 0.52, 0.46);
  var l2 = lantern(M, 0.66, anims, 2.3); put(g, l2, 0.5, 0.52, 0.46);
  /* 竹丛（屋后左右，参考图名片绿化） */
  var b1 = bambooClump(M, 0.95, anims, 1.1); put(g, b1, -0.92, 0.05, -0.5);
  var b2 = bambooClump(M, 0.8, anims, 2.6); put(g, b2, 0.9, 0.05, -0.62);
  /* 小桌 + 凳 + 陶罐（屋前右） */
  g.add(box(0.3, 0.03, 0.2, M.timber, 0.62, 0.22, 0.52));
  g.add(box(0.04, 0.19, 0.04, M.timberD, 0.62, 0.11, 0.52));
  g.add(box(0.14, 0.03, 0.14, M.timber, 0.9, 0.14, 0.62));
  g.add(box(0.04, 0.12, 0.04, M.timberD, 0.9, 0.065, 0.62));
  var p1 = potPlant(M, 1.0, M.grassD); put(g, p1, 0.85, 0.055, 0.4);
  var p2 = potPlant(M, 0.8, M.bambooL); put(g, p2, -0.85, 0.055, 0.52);
  return g;
}

/* ---- lv2 洋房：两层楼屋：底层铺面 + 二层檐廊 + 主瓦顶/腰披檐（h≈1.60，参考图左二） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.15));
  /* 台基 + 两层墙体（穿斗构架：木柱 + 抹灰填板） */
  g.add(box(1.52, 0.09, 1.06, M.stoneD, -0.1, 0.045, -0.04));
  g.add(box(1.4, 0.56, 0.94, M.plaster, -0.1, 0.37, -0.04));        /* 一层 0.09-0.65 */
  g.add(box(1.46, 0.05, 1.0, M.timberD, -0.1, 0.675, -0.04));       /* 楼板枋 */
  g.add(box(1.34, 0.5, 0.9, M.plaster, -0.1, 0.95, -0.06));         /* 二层 0.70-1.20 */
  /* 一层穿斗柱 ×4 + 檐枋 */
  [[-0.72, 0.4], [0.52, 0.4], [-0.72, -0.44], [0.52, -0.44]].forEach(function (c) {
    g.add(box(0.055, 0.6, 0.055, M.timber, c[0] - 0.1 + 0.1, 0.39, c[1]));
  });
  g.add(box(1.44, 0.06, 0.06, M.timberD, -0.1, 0.63, 0.44));
  /* 一层门脸：双扇门 + 开敞铺面 + 石阶 */
  var door = woodDoor(M, 0.28, 0.4, 0.09); put(g, door, -0.5, 0, 0.43);
  var counter = shopCounter(M, 0.68, 0.09, anims); put(g, counter, 0.16, 0, 0.435);
  g.add(box(0.44, 0.05, 0.24, M.stoneD, -0.5, 0.115, 0.52));
  /* 二层：雕花檐廊 + 木格窗 ×2 */
  var balc = balconyUnit(M, 1.2, false, anims, 0.2); put(g, balc, -0.1, 0.73, 0.4);
  var w1 = latticeWindow(M, 0.27, 0.3, { rows: 2 }); put(g, w1, -0.42, 0.98, 0.375);
  var w2 = latticeWindow(M, 0.27, 0.3, { rows: 2 }); put(g, w2, 0.2, 0.98, 0.375);
  g.add(box(1.38, 0.055, 0.06, M.timberD, -0.1, 1.22, 0.42));       /* 廊楣 */
  /* 腰披檐（罩门廊）+ 主黑青瓦顶（大翘角，apex≈1.58） */
  var awn = tileRoof(M, { w: 1.42, d: 0.56, h: 0.13, rows: 3, ridge: false, gable: false, over: 0.08 });
  put(g, awn, -0.1, 0.685, 0.18);
  var main = tileRoof(M, { w: 1.3, d: 1.0, h: 0.26, rows: 4, gable: true, gableMat: M.plaster, over: 0.09 });
  put(g, main, -0.1, 1.245, -0.06);
  /* 灯笼 ×2（廊楣下） */
  var l1 = lantern(M, 0.62, anims, 0.7); put(g, l1, -0.74, 1.14, 0.5);
  var l2 = lantern(M, 0.62, anims, 2.0); put(g, l2, 0.54, 1.14, 0.5);
  /* 竹丛（左后 + 右前角）+ 盆栽 */
  var b1 = bambooClump(M, 1.15, anims, 1.3); put(g, b1, -1.02, 0.05, -0.5);
  var b2 = bambooClump(M, 0.85, anims, 2.9); put(g, b2, 1.0, 0.05, -0.4);
  var p1 = potPlant(M, 0.9); put(g, p1, 1.02, 0.05, 0.55);
  var p2 = potPlant(M, 0.75); put(g, p2, -1.12, 0.05, 0.6);
  return g;
}

/* ---- lv3 大厦：三层楼阁：层层退台 + 三重檐大翘角 + 竖串灯笼 + 匾/黄幌（h≈2.10，参考图左三） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.25));
  /* 台基 + 一层（开敞铺面 + 前檐柱） */
  g.add(box(1.66, 0.08, 1.16, M.stoneD, 0, 0.04, 0));
  g.add(box(1.5, 0.56, 1.0, M.plaster, 0, 0.36, 0));                /* 一层 0.08-0.64 */
  var c1 = column(M, 0.52, 0.03, false); put(g, c1, -0.6, 0.08, 0.46);
  var c2 = column(M, 0.52, 0.03, false); put(g, c2, 0.6, 0.08, 0.46);
  var door = woodDoor(M, 0.28, 0.4, 0.08); put(g, door, -0.3, 0, 0.48);
  var counter = shopCounter(M, 0.6, 0.08, anims); put(g, counter, 0.24, 0, 0.485);
  g.add(box(1.6, 0.05, 1.06, M.timberD, 0, 0.665, 0));              /* 一层顶枋 */
  /* 匾额「锦里古街」+ 黄幌 */
  var plq = mesh(new THREE.PlaneGeometry(0.56, 0.14), plaqueMat());
  plq.position.set(0.05, 0.585, 0.505); g.add(plq);
  var ban = mesh(new THREE.PlaneGeometry(0.13, 0.4), bannerMat());
  ban.position.set(-0.72, 0.42, 0.5); g.add(ban);
  /* 二层（退台）：抹灰墙 + 檐廊 + 木格窗 */
  g.add(box(1.32, 0.06, 0.94, M.timberD, 0, 0.695, -0.03));
  g.add(box(1.22, 0.46, 0.84, M.plaster, 0, 0.955, -0.04));         /* 二层 0.725-1.185 */
  var b2 = balconyUnit(M, 1.1, false, anims, 0.8); put(g, b2, 0, 0.73, 0.36);
  var w21 = latticeWindow(M, 0.25, 0.28, { rows: 2 }); put(g, w21, -0.26, 0.97, 0.365);
  var w22 = latticeWindow(M, 0.25, 0.28, { rows: 2 }); put(g, w22, 0.26, 0.97, 0.365);
  /* 二层腰檐（翘角） */
  var a2 = tileRoof(M, { w: 1.3, d: 0.62, h: 0.14, rows: 3, ridge: false, gable: false, over: 0.08 });
  put(g, a2, 0, 1.21, 0.1);
  /* 三层（再退台）：雕花廊 + 格窗 */
  g.add(box(1.08, 0.05, 0.8, M.timberD, 0, 1.29, -0.05));
  g.add(box(0.98, 0.42, 0.72, M.plaster, 0, 1.525, -0.06));         /* 三层 1.315-1.735 */
  var b3 = balconyUnit(M, 0.9, false, anims, 1.5); put(g, b3, 0, 1.325, 0.3);
  var w31 = latticeWindow(M, 0.22, 0.24, { rows: 2 }); put(g, w31, -0.21, 1.54, 0.305);
  var w32 = latticeWindow(M, 0.22, 0.24, { rows: 2 }); put(g, w32, 0.21, 1.54, 0.305);
  /* 顶檐：黑青瓦大顶（大翘角 + 翘吻 + 金珠，apex≈2.08） */
  var top = tileRoof(M, { w: 1.04, d: 0.84, h: 0.28, rows: 4, gable: true, gableMat: M.plaster, big: true, over: 0.1 });
  put(g, top, 0, 1.76, -0.06);
  /* 顶层脊下绿植带（参考图屋顶花园） */
  g.add(box(0.86, 0.03, 0.1, M.woodF, 0, 1.78, -0.28));
  var gp1 = ico(0.06, M.grassD, -0.28, 1.85, -0.28); gp1.scale.y = 0.7; g.add(gp1);
  var gp2 = ico(0.05, M.bambooL, 0.02, 1.84, -0.28); gp2.scale.y = 0.7; g.add(gp2);
  var gp3 = ico(0.055, M.grassD, 0.3, 1.85, -0.28); gp3.scale.y = 0.7; g.add(gp3);
  /* 灯笼：一层檐下 ×2 + 二层角下 ×1 + 三层竖串 ×2 */
  var l1 = lantern(M, 0.56, anims, 0.5); put(g, l1, -0.78, 0.56, 0.52);
  var l2 = lantern(M, 0.56, anims, 1.8); put(g, l2, 0.78, 0.56, 0.52);
  var l3 = lantern(M, 0.5, anims, 2.7); put(g, l3, 0.62, 1.12, 0.44);
  var s1 = lanternString(M, 2, 0.52, anims, 3.4); put(g, s1, -0.56, 1.24, 0.4);
  var s2 = lanternString(M, 3, 0.46, anims, 4.6); put(g, s2, 0.44, 1.77, 0.32);
  /* 竹丛（左后高 + 右后）+ 盆栽 */
  var b1 = bambooClump(M, 1.5, anims, 1.7); put(g, b1, -1.0, 0.04, -0.55);
  var b2 = bambooClump(M, 1.1, anims, 3.1); put(g, b2, 0.96, 0.04, -0.6);
  var p1 = potPlant(M, 0.85); put(g, p1, 0.94, 0.045, 0.6);
  var p2 = potPlant(M, 0.7); put(g, p2, -0.95, 0.045, 0.62);
  var p3 = potPlant(M, 0.6); put(g, p3, 0.62, 0.045, 0.7);
  return g;
}

/* ---- lv4 地标：石台基 + 大踏步 + 红漆柱网 + 重檐歇山金宝顶 + 红瓦檐帐 + 油纸伞（h≈2.70，参考图右一） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35));
  /* 石台基 + 大踏步（垂带）+ 踏步侧盆栽 */
  g.add(box(2.1, 0.14, 1.6, M.stone, 0, 0.07, -0.05));
  g.add(box(2.16, 0.05, 1.66, M.stoneD, 0, 0.02, -0.05));
  g.add(box(0.6, 0.055, 0.2, M.stoneD, 0, 0.185, 0.9));
  g.add(box(0.5, 0.05, 0.17, M.stoneD, 0, 0.2375, 0.78));
  g.add(box(0.12, 0.14, 0.24, M.stoneD, -0.42, 0.14, 0.86));
  g.add(box(0.12, 0.14, 0.24, M.stoneD, 0.42, 0.14, 0.86));
  var sp1 = potPlant(M, 0.7); put(g, sp1, -0.62, 0.14, 0.82);
  var sp2 = potPlant(M, 0.7); put(g, sp2, 0.62, 0.14, 0.82);
  /* 一层：红漆柱网（×6）+ 抹灰填板 + 朱门 + 匾额 */
  [[-0.86, 0.5], [-0.3, 0.56], [0.3, 0.56], [0.86, 0.5], [-0.86, -0.4], [0.86, -0.4]].forEach(function (c) {
    var col = column(M, 0.6, 0.032, true); put(g, col, c[0], 0.14, c[1]);
  });
  g.add(box(1.9, 0.62, 1.0, M.plaster, 0, 0.45, -0.12));            /* 一层墙 0.14-0.76 */
  g.add(box(1.96, 0.06, 1.06, M.lacqDk, 0, 0.79, -0.12));           /* 一层檐枋 */
  var gate = grp(); put(g, gate, 0, 0.14, 0.42);
  gate.add(box(0.56, 0.5, 0.05, M.interior, 0, 0.25, -0.006));
  gate.add(box(0.24, 0.46, 0.055, M.lacqBr, -0.14, 0.23, 0.006));
  gate.add(box(0.24, 0.46, 0.055, M.lacqBr, 0.14, 0.23, 0.006));
  [-0.2, 0, 0.2].forEach(function (x) { gate.add(sph(0.014, M.gold, x, 0.34, 0.032)); });
  var plq4 = mesh(new THREE.PlaneGeometry(0.6, 0.15), plaqueMat());
  plq4.position.set(0, 0.575, 0.045); gate.add(plq4);
  /* 一层前廊：红漆檐廊 + 两侧木 shop shutter 板（对位参考图格窗节奏） */
  var b1 = balconyUnit(M, 1.7, true, anims, 0.4); put(g, b1, 0, 0.86, 0.42);
  g.add(box(0.34, 0.34, 0.045, M.lacqDk, -0.5, 0.52, 0.385));
  g.add(box(0.34, 0.34, 0.045, M.lacqDk, 0.5, 0.52, 0.385));
  g.add(box(0.26, 0.26, 0.05, M.timber, -0.5, 0.52, 0.39));
  g.add(box(0.26, 0.26, 0.05, M.timber, 0.5, 0.52, 0.39));
  /* 一层腰檐（红漆封板 + 翘角） */
  var a1 = tileRoof(M, { w: 1.86, d: 0.72, h: 0.15, rows: 3, ridge: false, gable: false, over: 0.09 });
  put(g, a1, 0, 0.82, 0.16);
  /* 红瓦檐帐（二层檐口）+ 米黄凉棚 */
  var val = valance(M, 1.5, true); put(g, val, 0, 1.32, 0.4);
  /* 二层：红漆栏板楼座 + 格窗 + 竖串灯笼 */
  g.add(box(1.6, 0.05, 0.94, M.lacqDk, 0, 1.375, -0.08));
  g.add(box(1.5, 0.5, 0.86, M.plaster, 0, 1.65, -0.1));             /* 二层 1.40-1.90 */
  var b2 = balconyUnit(M, 1.42, true, anims, 1.1); put(g, b2, 0, 1.42, 0.36);
  var w21 = latticeWindow(M, 0.25, 0.28, { rows: 2 }); put(g, w21, -0.34, 1.66, 0.345);
  var w22 = latticeWindow(M, 0.25, 0.28, { rows: 2 }); put(g, w22, 0.34, 1.66, 0.345);
  var s1 = lanternString(M, 2, 0.5, anims, 2.2); put(g, s1, -0.78, 1.42, 0.4);
  /* 二层腰檐 */
  var a2 = tileRoof(M, { w: 1.56, d: 0.66, h: 0.14, rows: 3, ridge: false, gable: false, over: 0.09 });
  put(g, a2, 0, 1.92, 0.06);
  /* 三层楼座 + 格窗 */
  g.add(box(1.3, 0.05, 0.84, M.lacqDk, 0, 1.965, -0.1));
  g.add(box(1.2, 0.44, 0.76, M.lacq, 0, 2.21, -0.12));              /* 三层 1.99-2.43 */
  var b3 = balconyUnit(M, 1.1, true, anims, 1.8); put(g, b3, 0, 2.01, 0.3);
  var w31 = latticeWindow(M, 0.22, 0.26, { rows: 2 }); put(g, w31, -0.26, 2.2, 0.285);
  var w32 = latticeWindow(M, 0.22, 0.26, { rows: 2 }); put(g, w32, 0.26, 2.2, 0.285);
  var s2 = lanternString(M, 2, 0.46, anims, 3.6); put(g, s2, 0.6, 2.0, 0.34);
  /* 顶阁歇山（四角大起翘）+ 金葫芦宝顶（apex≈2.72） */
  var top = sweepRoof(M, { w: 1.14, d: 0.94, h: 0.3 });
  put(g, top, 0, 2.43, -0.12);
  var fin = grp(); put(g, fin, 0, 2.73, -0.12);
  fin.add(cyl(0.05, 0.062, 0.03, 10, M.gold, 0, 0.015, 0));
  var bud = sph(0.055, M.goldGlow, 0, 0.08, 0); bud.scale.y = 1.2; fin.add(bud);
  fin.add(sph(0.026, M.gold, 0, 0.17, 0));
  var glowM = M.goldGlow;
  anims.push(function (t) { glowM.emissiveIntensity = 0.22 + 0.1 * sin(t * 1.6 + 0.9); });
  /* 门口灯笼 ×2 + 茶摊油纸伞 ×2 */
  var l1 = lantern(M, 0.62, anims, 0.2); put(g, l1, -0.86, 0.66, 0.56);
  var l2 = lantern(M, 0.62, anims, 1.5); put(g, l2, 0.86, 0.66, 0.56);
  var ps1 = parasol(M, 1.15); put(g, ps1, -1.02, 0.05, 0.78);
  var ps2 = parasol(M, 0.95); put(g, ps2, 1.05, 0.05, 0.86);
  /* 茶摊小桌 */
  g.add(box(0.3, 0.03, 0.22, M.timber, -1.02, 0.2, 0.6));
  g.add(box(0.04, 0.17, 0.04, M.timberD, -1.02, 0.1, 0.6));
  /* 竹丛（左后 + 右后）+ 盆栽 */
  var bb1 = bambooClump(M, 1.7, anims, 2.4); put(g, bb1, -1.05, 0.04, -0.62);
  var bb2 = bambooClump(M, 1.25, anims, 3.9); put(g, bb2, 1.02, 0.04, -0.66);
  var p1 = potPlant(M, 0.8); put(g, p1, 0.94, 0.045, 0.68);
  var p2 = potPlant(M, 0.65); put(g, p2, -0.7, 0.045, 0.86);
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[18] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_18_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 18;
  g.userData.level = lv;
  g.userData.region = 'g4';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
