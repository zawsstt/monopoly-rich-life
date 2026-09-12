/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_10.js
 * -------------------------------------------------------------------------------------
 * 格 10「上下九」(g3 岭南骑楼) 独属建筑：广州西关骑楼茶楼四阶生长史
 * 参考图高保真复刻（img2threejs 流程：blockout→structure→form→material→lighting→
 * interaction→optimization；观察记录见 .img2threejs/evidence_prop10/）。
 * [命名勘误记录] refs/prop_10.png 不存在；refs/prop_11.png（BOARD[11] 为电力公司、
 * 无进化图需求）即格 10 的四阶进化图集，内容为岭南骑楼茶楼，与 BOARD[10] 上下九
 * 完全对应，采为本格视觉基准（同批 prop_13/prop_14 证实按格编号出图）。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   街的起点——木茶寮：四木柱 + 老杉木壁 + 棕陶瓦四坡顶 + 茶桌凳 + 挂灯笼
 *   lv2 洋房   长出奶油骑楼脸：双开间拱廊柱列 + 绿布波浪雨棚 + 二层百叶拱窗 +
 *              白灰巴洛克山花（涡卷/宝珠顶饰），茶桌仍在廊下（h≈1.62）
 *   lv3 大厦   三层高骑楼：三开间拱廊 + 雨棚 + 两排拱窗百叶混色 + 花箱 + 角隅壁柱 +
 *              檐口宝瓶栏杆 + 满宽白灰 crown 山花（三宝珠）+ 竖招「上下九」（h≈2.10）
 *   lv4 地标   转角大茶楼：四开间骑楼 + 红灯笼 + 两层白瓶栏阳台 + 阳台盆栽 +
 *              四层退台 + 金色日纹章 crown + 绿琉璃翘角攒尖顶 + 鎏金宝顶（h≈2.62）
 *
 * 独有语汇（自参考图逐区采样）：奶油灰泥墙（#EDE3D0/暗部 #DFD3BC）、苍白石柱列
 * （方础+圆柱+方垫）、拱带连续骑楼廊、绿色扇贝边布雨棚（#4E7D52）、混色木百叶
 * 拱窗（绿#4F7D5B/赭#C9973F/橙#C56A2E/青#3E7F82/红#A93B2E）、白灰 crown 山花
 * （涡卷+宝珠顶饰+金日纹章）、绿琉璃翘角屋顶（#4E7D5E）、鎏金件（#D8A63C）、
 * 红灯笼（#C8402E）、石板地坪+草皮+陶盆（每阶必有）、廊下茶桌凳（每阶必有）。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[10] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_10] THREE 未定义，请先加载 three.min.js (r147)');
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
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 奶油灰泥墙：细噪 + 抹痕 + 淡雨渍 */
function texStucco() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#ede3d0'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 150; i++) {
    g.fillStyle = (i % 3 === 0) ? 'rgba(120,110,90,0.06)' : (i % 3 === 1 ? 'rgba(255,255,255,0.07)' : 'rgba(223,211,188,0.10)');
    g.fillRect((i * 29) % S, (i * 43) % S, 3, 2);
  }
  for (i = 0; i < 5; i++) {
    g.fillStyle = 'rgba(150,138,114,0.05)';
    g.fillRect((i * 31 + 9) % S, (i * 17) % 40, 4, 34 + (i * 13) % 30);
  }
  return toTex(cv, true);
}
/* 近白抹灰饰件（crown/柱垫/窗台） */
function texTrim() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#f0eadc'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 70; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(150,140,118,0.05)';
    g.fillRect((i * 23) % S, (i * 37) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 石板地坪：石板格缝 + 值域斑驳 */
function texStone() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#b3aa94'; g.fillRect(0, 0, S, S);
  var n = 4, cw = S / n;
  for (i = 0; i < n; i++) for (k = 0; k < n; k++) {
    g.fillStyle = (i + k) % 2 ? '#bdb49e' : '#aca28b';
    g.fillRect(k * cw + 1, i * cw + 1, cw - 2, cw - 2);
  }
  g.fillStyle = '#8f8774';
  for (i = 0; i <= n; i++) { g.fillRect(0, i * cw - 1, S, 2); g.fillRect(i * cw - 1, 0, 2, S); }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.05)' : 'rgba(60,54,42,0.08)';
    g.fillRect((i * 41) % S, (i * 53) % S, 2, 1);
  }
  return toTex(cv, true);
}
/* 棕陶瓦垄（lv1 茶寮顶）：垄线明暗 + 竖接头错缝 */
function texTileBrown() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#7a6a52'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#83725a' : '#74644d';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#57493a'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#93805f'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(50,42,32,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,240,210,0.05)' : 'rgba(40,34,26,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 绿琉璃瓦垄（lv4 攒尖顶）：釉面高光 + 深缝 */
function texTileGreen() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#4e7d5e'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#568767' : '#497659';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#35543f'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#6fa381'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(38,62,46,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 3) ? 'rgba(220,255,230,0.06)' : 'rgba(30,50,38,0.08)';
    g.fillRect((i * 31) % S, (i * 47) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 绿布雨棚：布纹经纬 + 底缘阴影 */
function texAwning() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#4e7d52'; g.fillRect(0, 0, S, S);
  for (i = 0; i < S; i += 3) {
    g.fillStyle = (i % 6) ? 'rgba(255,255,255,0.045)' : 'rgba(20,40,24,0.06)';
    g.fillRect(i, 0, 1, S);
  }
  var gr = g.createLinearGradient(0, 0, 0, S);
  gr.addColorStop(0, 'rgba(255,255,255,0.08)');
  gr.addColorStop(1, 'rgba(30,52,34,0.16)');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  return toTex(cv, true);
}
/* 木百叶窗叶（按漆色生成 5 变体）：横百叶明暗线 + 边框 */
function texLouvre(hex) {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), y;
  g.fillStyle = hex; g.fillRect(0, 0, S, S);
  for (y = 4; y < S - 4; y += 6) {
    g.fillStyle = 'rgba(0,0,0,0.28)'; g.fillRect(3, y + 3, S - 6, 2);
    g.fillStyle = 'rgba(255,255,255,0.20)'; g.fillRect(3, y, S - 6, 2);
  }
  g.strokeStyle = 'rgba(40,26,14,0.55)'; g.lineWidth = 5; g.strokeRect(1, 1, S - 2, S - 2);
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 2; g.strokeRect(5, 5, S - 10, S - 10);
  return toTex(cv, true);
}
/* 老杉木板壁（lv1）：竖板缝 + 木丝纹 */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#7d5f3e'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 5; i++) {
    g.fillStyle = (i % 2) ? '#846546' : '#774f31';
    g.fillRect(i * (S / 5) + 1, 0, S / 5 - 2, S);
    g.fillStyle = '#4c3823'; g.fillRect(i * (S / 5), 0, 2, S);
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,230,190,0.05)' : 'rgba(40,28,16,0.10)';
    g.fillRect((i * 17) % S, (i * 43) % S, 1, 6 + (i % 3) * 4);
  }
  return toTex(cv, true);
}
/* 竖式招牌「上下九」：黑漆金边 + 金字竖排 */
function texSignV() {
  var w = 128, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2c1c0e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 6; g.strokeRect(7, 7, w - 14, h - 14);
  g.strokeStyle = 'rgba(216,166,60,0.45)'; g.lineWidth = 2; g.strokeRect(17, 17, w - 34, h - 34);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 52px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '上下九', i;
  for (i = 0; i < 3; i++) g.fillText(s[i], w / 2, 62 + i * 64);
  return toTex(cv, true);
}

/* 共享材质库（四级统一色板 = 参考图逐区采样） */
function Mats() {
  return {
    stucco:    MAT('p10stucco', function () { var t = getTex('stucco', texStucco); return std('#ffffff', { map: t, rough: 0.9 }); }),
    stuccoDk:  MAT('p10stuccoDk', function () { return std('#d9cdb4', { rough: 0.92 }); }),
    trim:      MAT('p10trim', function () { var t = getTex('trim', texTrim); return std('#ffffff', { map: t, rough: 0.85 }); }),
    shaft:     MAT('p10shaft', function () { return std('#e4dbc8', { rough: 0.82 }); }),
    plinth:    MAT('p10plinth', function () { return std('#cfc3a9', { rough: 0.88 }); }),
    dark:      MAT('p10dark', function () { return std('#33261a', { rough: 0.95 }); }),
    wood:      MAT('p10wood', function () { return std('#8a6844', { rough: 0.8 }); }),
    woodD:     MAT('p10woodD', function () { return std('#6b4e32', { rough: 0.85 }); }),
    plank:     MAT('p10plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, rough: 0.85 }); }),
    tileBSun:  MAT('p10tileBSun', function () { var t = getTex('tileB', texTileBrown); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.72 }); }),
    tileBShd:  MAT('p10tileBShd', function () { var t = getTex('tileB', texTileBrown); return std('#b9ac96', { map: t, bump: t, bumpScale: 0.014, rough: 0.78 }); }),
    tileGSun:  MAT('p10tileGSun', function () { var t = getTex('tileG', texTileGreen); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.55 }); }),
    tileGShd:  MAT('p10tileGShd', function () { var t = getTex('tileG', texTileGreen); return std('#9dbfa9', { map: t, bump: t, bumpScale: 0.014, rough: 0.6 }); }),
    tileGDk:   MAT('p10tileGDk', function () { return std('#3e6748', { rough: 0.6 }); }),
    awn:       MAT('p10awn', function () { var t = getTex('awn', texAwning); return std('#ffffff', { map: t, rough: 0.92 }); }),
    shG:       MAT('p10shG', function () { return std('#ffffff', { map: getTex('lvG', function () { return texLouvre('#4f7d5b'); }), rough: 0.6 }); }),
    shO:       MAT('p10shO', function () { return std('#ffffff', { map: getTex('lvO', function () { return texLouvre('#c9973f'); }), rough: 0.6 }); }),
    shR:       MAT('p10shR', function () { return std('#ffffff', { map: getTex('lvR', function () { return texLouvre('#c56a2e'); }), rough: 0.6 }); }),
    shT:       MAT('p10shT', function () { return std('#ffffff', { map: getTex('lvT', function () { return texLouvre('#3e7f82'); }), rough: 0.6 }); }),
    shC:       MAT('p10shC', function () { return std('#ffffff', { map: getTex('lvC', function () { return texLouvre('#a93b2e'); }), rough: 0.6 }); }),
    gold:      MAT('p10gold', function () { return std('#d8a63c', { rough: 0.35, metal: 0.75 }); }),
    relief:    MAT('p10relief', function () { return std('#4e7d5e', { rough: 0.65 }); }),
    stone:     MAT('p10stone', function () { var t = getTex('stone', texStone); return std('#ffffff', { map: t, rough: 0.92 }); }),
    stoneD:    MAT('p10stoneD', function () { return std('#a29a86', { rough: 0.93 }); }),
    grass:     MAT('p10grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p10grassD', function () { return std('#698f4c', { rough: 0.95 }); }),
    terra:     MAT('p10terra', function () { return std('#b0714a', { rough: 0.85 }); }),
    celadon:   MAT('p10celadon', function () { return std('#7fa38a', { rough: 0.5 }); }),
    ink:       MAT('p10ink', function () { return std('#2a2e33', { rough: 0.8 }); }),
    /* 廊内暖光（呼吸动画按绝对值设定，材质全局缓存安全） */
    glowInner: MAT('p10glow', function () { return std('#3b2d1f', { rough: 0.95, emissive: '#ff9a4c', ei: 0.12 }); })
  };
}

/* ================= 2. 预制件（风格独有语汇） ================= */

/* 几何缓存（同尺寸窗/拱带共用） */
var _gc = {};
function geoCache(id, make) { if (!_gc[id]) _gc[id] = make(); return _gc[id]; }

/* 拱带（半圆环带，骑楼廊拱 / 窗拱头）：spring line 在 y=0，挤出 +z */
function archBandGeo(r, band, depth) {
  var s = new THREE.Shape();
  s.absarc(0, 0, r + band, PI, 0, true);
  s.absarc(0, 0, r, 0, PI, false);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 12 });
}
/* 拱顶板（圆拱轮廓暗面）：底边中心原点，挤出 +z */
function archPanelGeo(w, h, depth) {
  var r = w / 2, s = new THREE.Shape();
  s.moveTo(-r, 0);
  s.lineTo(-r, h - r);
  s.absarc(0, h - r, r, PI, 0, true);
  s.lineTo(r, 0);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false, curveSegments: 10 });
}
/* 巴洛克山花轮廓（crown / 门脸山花） */
function pedimentGeo(w, h, depth) {
  var s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h * 0.4);
  s.quadraticCurveTo(-w / 2, h * 0.78, -w * 0.26, h * 0.86);
  s.quadraticCurveTo(-w * 0.1, h * 0.9, 0, h);
  s.quadraticCurveTo(w * 0.1, h * 0.9, w * 0.26, h * 0.86);
  s.quadraticCurveTo(w / 2, h * 0.78, w / 2, h * 0.4);
  s.lineTo(w / 2, 0);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: false });
}
/* 扇贝垂边（雨棚 valance）：上缘 y=0，下缘波浪 */
function valanceGeo(w, h, n) {
  var s = new THREE.Shape(), sw = w / n, i;
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, -h);
  for (i = 0; i < n; i++) s.absarc(-w / 2 + sw * (i + 0.5), -h, sw / 2, PI, 0, false);
  s.lineTo(w / 2, 0);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false });
}

/* 石板地坪 + 草缘 + 前角陶盆（每阶必有，参考图绿边） */
function qPad(M, w, d) {
  var g = grp();
  g.add(box(w, 0.05, d, M.stone, 0, 0.025, 0));
  g.add(box(w + 0.05, 0.028, d + 0.05, M.stoneD, 0, 0.014, 0));
  var tufts = [[-w / 2 + 0.1, d / 2 - 0.08], [w / 2 - 0.12, d / 2 - 0.1], [-w / 2 + 0.08, -d / 2 + 0.12], [w / 2 - 0.1, -d / 2 + 0.09], [0, -d / 2 + 0.07]];
  tufts.forEach(function (p, k) {
    var b = mesh(new THREE.IcosahedronGeometry(0.05, 0), k % 2 ? M.grassD : M.grass);
    put(g, b, p[0], 0.058, p[1]); b.scale.y = 0.72;
  });
  var p1 = potPlant(M, 0.9); put(g, p1, -w / 2 + 0.24, 0.05, d / 2 - 0.18);
  var p2 = potPlant(M, 1.0); put(g, p2, w / 2 - 0.26, 0.05, d / 2 - 0.2);
  return g;
}

/* 前踏步两级 */
function steps2(M, w, x, z) {
  var g = grp();
  g.add(box(w, 0.045, 0.15, M.stoneD, x, 0.078, z - 0.08));
  g.add(box(w + 0.06, 0.045, 0.15, M.stoneD, x, 0.033, z + 0.05));
  return g;
}

/* 骑楼廊柱列：方础+圆柱+方垫 + 拱带连续 + 暗廊身 + 侧堵（廊下即茶座） */
function colonnade(M, o) {
  var g = grp();
  var w = o.w, hCol = o.hCol, bays = o.bays, zF = o.zF;
  var span = w / bays, archR = span * 0.38, band = o.band || 0.045, depth = o.depth || 0.07;
  var ySpring = hCol - 0.042;
  var i, x;
  for (i = 0; i <= bays; i++) {
    x = -w / 2 + i * span;
    g.add(box(0.095, 0.05, 0.095, M.plinth, x, 0.025, zF - depth / 2));
    g.add(box(0.078, 0.028, 0.078, M.shaft, x, 0.064, zF - depth / 2));
    g.add(cyl(0.032, 0.034, hCol - 0.12, 10, M.shaft, x, 0.078 + (hCol - 0.12) / 2, zF - depth / 2));
    g.add(box(0.095, 0.042, 0.095, M.trim, x, hCol - 0.021, zF - depth / 2));
  }
  var bg = geoCache('ab' + archR.toFixed(3) + '_' + band + '_' + depth, function () { return archBandGeo(archR, band, depth); });
  for (i = 0; i < bays; i++) {
    var ab = mesh(bg, M.trim);
    ab.position.set(-w / 2 + (i + 0.5) * span, ySpring, zF - depth);
    g.add(ab);
  }
  var yTop = ySpring + archR + band;
  var ent = box(w + 0.1, 0.055, depth + 0.04, M.trim, 0, yTop + 0.0275, zF - depth / 2);
  g.add(ent);
  /* 暗廊身（暖光呼吸）+ 廊地面 + 侧堵 */
  var intD = o.interiorD || 0.6;
  var inner = box(w - 0.06, ySpring + archR * 0.5, intD, M.glowInner, 0, (ySpring + archR * 0.5) / 2, zF - depth - intD / 2 + 0.01);
  inner.name = 'arcadeInner';
  g.add(inner);
  g.add(box(w - 0.06, 0.02, intD, M.stoneD, 0, 0.01, zF - depth - intD / 2 + 0.01));
  g.add(box(0.09, ySpring + archR * 0.85, intD + 0.12, M.stuccoDk, -w / 2 - 0.035, (ySpring + archR * 0.85) / 2, zF - depth - intD / 2 + 0.02));
  g.add(box(0.09, ySpring + archR * 0.85, intD + 0.12, M.stuccoDk, w / 2 + 0.035, (ySpring + archR * 0.85) / 2, zF - depth - intD / 2 + 0.02));
  g.userData.yTop = yTop + 0.055;            /* 檐口顶（相对本组原点） */
  g.userData.archR = archR;
  return g;
}

/* 百叶拱窗：暗拱洞 + 白拱带 + 中梃 + 窗台 + 双开百叶（铰链外倾） */
function archWindow(M, w, h, matL, matR) {
  var g = grp();
  var r = w / 2;
  var key = w.toFixed(2) + 'x' + h.toFixed(2);
  var rec = mesh(geoCache('ap' + key, function () { return archPanelGeo(w, h, 0.014); }), M.dark);
  rec.position.z = -0.004; g.add(rec);
  var band = mesh(geoCache('abw' + key, function () { return archBandGeo(Math.max(0.05, r - 0.012), 0.032, 0.03); }), M.trim);
  band.position.set(0, h - r + 0.012, 0); g.add(band);
  g.add(box(0.022, h - r + 0.02, 0.032, M.trim, 0, (h - r) / 2 + 0.006, 0.01));
  g.add(box(w + 0.07, 0.032, 0.05, M.trim, 0, -0.016, 0.012));
  var lw = (w - 0.055) / 2, lh = (h - r) * 0.92 + r * 0.42;
  if (lw >= 0.05 && matL && matR) {
    [[-1, matL], [1, matR]].forEach(function (sd) {
      var hinge = grp();
      hinge.position.set(sd[0] * (w / 2 - 0.012), lh / 2 + 0.012, 0.026);
      var leaf = box(lw, lh, 0.02, sd[1], -sd[0] * lw / 2, 0, 0);
      hinge.add(leaf);
      hinge.rotation.y = -sd[0] * 0.3;
      g.add(hinge);
    });
  }
  return g;
}

/* 绿布扇贝雨棚：斜面 + 波浪垂边（挂在骑楼上） */
function awningUnit(M, w, out, drop, n) {
  var g = grp();
  var ang = Math.atan2(drop, out);
  var len = Math.sqrt(out * out + drop * drop) + 0.03;
  g.rotation.x = ang;
  g.add(box(w + 0.12, 0.02, len, M.awn, 0, 0.012, len / 2));
  var val = mesh(geoCache('val' + w.toFixed(2) + 'n' + n, function () { return valanceGeo(w, 0.075, n); }), M.awn);
  val.position.set(0, 0.004, len - 0.015);
  g.add(val);
  return g;
}

/* 白灰 crown 山花：涡卷 ×2 + 浮雕章（cartouche/金日纹）+ 宝珠顶饰 */
function crownPediment(M, o) {
  var g = grp(), w = o.w, h = o.h, dep = o.depth || 0.09;
  var body = mesh(pedimentGeo(w, h, dep), M.trim);
  body.position.z = -dep / 2; g.add(body);
  var rl = cyl(0.03, 0.03, 0.05, 10, M.trim, -w * 0.3, h * 0.7, 0.015); rl.rotation.x = PI / 2; g.add(rl);
  var rr = cyl(0.03, 0.03, 0.05, 10, M.trim, w * 0.3, h * 0.7, 0.015); rr.rotation.x = PI / 2; g.add(rr);
  if (o.sunburst) {
    var disc = cyl(0.072, 0.072, 0.018, 12, M.gold, 0, h * 0.6, 0.03); disc.rotation.x = PI / 2; g.add(disc);
    var ring = mesh(new THREE.TorusGeometry(0.076, 0.011, 8, 16), M.relief); ring.position.set(0, h * 0.6, 0.04); g.add(ring);
    g.add(sph(0.02, M.gold, 0, h * 0.6, 0.052));
  } else {
    var car = sph(0.048, M.relief, 0, h * 0.58, 0.015); car.scale.set(0.72, 1.12, 0.4); g.add(car);
    g.add(sph(0.018, M.gold, 0, h * 0.58, 0.04));
  }
  var n = o.urns || 2, i, ux;
  for (i = 0; i < n; i++) {
    ux = (n === 1) ? 0 : -w * 0.3 + i * (w * 0.6 / (n - 1));
    g.add(cyl(0.013, 0.02, 0.05, 10, M.trim, ux, h + 0.025, 0));
    g.add(sph(0.017, M.trim, ux, h + 0.058, 0));
  }
  return g;
}

/* 白瓶栏宝瓶栏杆（檐口/阳台）：上下望柱栿 + 瓶式望柱（Lathe 单面） */
function balustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.03, 0.06, M.trim, 0, 0.015, 0));
  g.add(box(w + 0.02, 0.028, 0.07, M.trim, 0, 0.175, 0));
  var n = Math.max(4, Math.min(7, Math.round(w / 0.13))), i;
  var lat = geoCache('bal', function () {
    var pts = [[0.013, 0], [0.019, 0.012], [0.011, 0.045], [0.0085, 0.07], [0.015, 0.1], [0.019, 0.125], [0.013, 0.148], [0.018, 0.16]]
      .map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    return new THREE.LatheGeometry(pts, 10);
  });
  for (i = 0; i <= n; i++) {
    var b = mesh(lat, M.trim);
    b.position.set(-w / 2 + i * (w / n), 0.03, 0);
    g.add(b);
  }
  return g;
}

/* 红灯笼：金盖金底 + 红壳（呼吸）+ 长穗（吊点摆动） */
function lantern(M, s, anims, phase, drop) {
  var g = grp(); s = s || 1;
  var bm = MAT('p10lant' + phase, function () { return std('#c8402e', { rough: 0.5, emissive: '#ff8a4a', ei: 0.55 }); });
  drop = (drop === undefined) ? 0.08 : drop;
  g.add(cyl(0.006, 0.006, drop, 6, M.ink, 0, -drop / 2, 0));
  var body = grp(); body.position.y = -drop; g.add(body);
  body.add(cyl(0.032 * s, 0.045 * s, 0.03 * s, 10, M.gold, 0, 0.1 * s, 0));
  var ball = sph(0.08 * s, bm, 0, 0, 0); ball.scale.y = 0.86; body.add(ball);
  body.add(cyl(0.045 * s, 0.032 * s, 0.03 * s, 10, M.gold, 0, -0.095 * s, 0));
  body.add(cyl(0.007 * s, 0.007 * s, 0.07 * s, 6, M.gold, 0, -0.145 * s, 0));
  anims.push(function (t) {
    body.rotation.z = sin(t * 1.35 + phase) * 0.06;
    body.rotation.x = sin(t * 0.9 + phase * 1.7) * 0.035;
    bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + phase);
  });
  return g;
}

/* 廊下茶座：木桌 + 条凳 ×2 + 青瓷茶壶（骑楼茶楼血脉，每阶必有） */
function teaSet(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.3 * s, 0.026, 0.22 * s, M.wood, 0, 0.135 * s, 0));
  g.add(box(0.024, 0.125 * s, 0.18 * s, M.woodD, -0.11 * s, 0.062 * s, 0));
  g.add(box(0.024, 0.125 * s, 0.18 * s, M.woodD, 0.11 * s, 0.062 * s, 0));
  g.add(cyl(0.05 * s, 0.056 * s, 0.085 * s, 10, M.woodD, -0.26 * s, 0.043 * s, 0.07 * s));
  g.add(cyl(0.05 * s, 0.056 * s, 0.085 * s, 10, M.woodD, 0.27 * s, 0.043 * s, -0.05 * s));
  g.add(cyl(0.026 * s, 0.03 * s, 0.028 * s, 10, M.celadon, 0.03 * s, 0.162 * s, 0));
  g.add(sph(0.014 * s, M.celadon, 0.03 * s, 0.185 * s, 0));
  return g;
}

/* 陶盆绿植（呼应参考图阳台/廊角的盆栽点缀） */
function potPlant(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.052 * s, 0.04 * s, 0.085 * s, 10, M.terra, 0, 0.043 * s, 0));
  g.add(cyl(0.06 * s, 0.056 * s, 0.018 * s, 10, M.terra, 0, 0.092 * s, 0));
  var b = mesh(new THREE.IcosahedronGeometry(0.062 * s, 0), M.grassD);
  put(g, b, 0, 0.15 * s, 0); b.scale.y = 0.92;
  return g;
}

/* 窗下花箱：木箱 + 两簇红花（lv3+） */
function flowerBox(M, w) {
  var g = grp();
  g.add(box(w, 0.05, 0.065, M.woodD, 0, 0.025, 0));
  var f1 = mesh(new THREE.IcosahedronGeometry(0.035, 0), MAT('p10flw', function () { return std('#a93b2e', { rough: 0.6 }); }));
  put(g, f1, -w * 0.22, 0.065, 0); f1.scale.y = 0.8;
  var f2 = mesh(new THREE.IcosahedronGeometry(0.032, 0), MAT('p10flw2', function () { return std('#c56a2e', { rough: 0.6 }); }));
  put(g, f2, w * 0.24, 0.062, 0); f2.scale.y = 0.8;
  return g;
}

/* 竖招「上下九」：托臂 + 吊牌（pendulum 摆动） */
function vSign(M, anims, phase) {
  var g = grp();
  g.add(box(0.035, 0.035, 0.16, M.woodD, 0, 0, 0.07));
  var piv = grp(); piv.position.set(0, -0.017, 0.13); g.add(piv);
  piv.add(cyl(0.012, 0.012, 0.02, 8, M.gold, 0, 0.01, 0));
  piv.add(box(0.17, 0.42, 0.026, M.ink, 0, -0.23, 0));
  var face = mesh(new THREE.PlaneGeometry(0.15, 0.38),
    new THREE.MeshStandardMaterial({ map: getTex('signV', texSignV), roughness: 0.55, metalness: 0.06, flatShading: true }));
  face.position.set(0, -0.23, 0.014); piv.add(face);
  anims.push(function (t) {
    piv.rotation.x = sin(t * 1.05 + phase) * 0.045;
    piv.rotation.z = sin(t * 0.8 + phase * 1.6) * 0.05;
  });
  return g;
}

/* 棕陶瓦四坡顶（lv1 茶寮）：四坡瓦面 + 木压脊 + 四角微翘 */
function brownHipRoof(M, o) {
  var w = o.w, d = o.d, h = o.h, g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.y = h; sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + 0.06, 0.03, lenF, M.tileBSun, 0, 0, lenF / 2));
  var sgB = grp(); sgB.position.y = h; sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + 0.06, 0.03, lenF, M.tileBShd, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.y = h; slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.03, d + 0.06, M.tileBShd, lenS / 2, 0, 0));
  var slL = grp(); slL.position.y = h; slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.03, d + 0.06, M.tileBShd, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.07, 0.045, 0.07, M.woodD, c[0] * (w / 2 + 0.02), 0.05, c[1] * (d / 2 + 0.02));
    lift.rotation.z = -c[0] * 0.5; g.add(lift);
  });
  g.add(box(w * 0.6, 0.055, 0.08, M.woodD, 0, h + 0.027, 0));
  return g;
}

/* 绿琉璃翘角攒尖顶（lv4 顶冠）：四坡釉瓦 + 剑把正脊 + 四角大起翘 + 鎏金宝顶 */
function glazedCrownRoof(M, o) {
  var w = o.w, d = o.d, h = o.rise, g = grp();
  var eaveF = d / 2 + 0.08, eaveS = w / 2 + 0.08;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.y = h; sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + 0.08, 0.028, lenF, M.tileGSun, 0, 0, lenF / 2));
  var sgB = grp(); sgB.position.y = h; sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + 0.08, 0.028, lenF, M.tileGShd, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.y = h; slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.028, d + 0.08, M.tileGShd, lenS / 2, 0, 0));
  var slL = grp(); slL.position.y = h; slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.028, d + 0.08, M.tileGShd, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.075, 0.05, 0.075, M.tileGDk, c[0] * (w / 2 + 0.03), 0.05, c[1] * (d / 2 + 0.03));
    lift.rotation.z = -c[0] * 0.62; g.add(lift);
  });
  g.add(box(w * 0.42, 0.055, 0.075, M.tileGDk, 0, h + 0.027, 0));
  var k1 = box(0.05, 0.09, 0.06, M.tileGDk, w * 0.21, h + 0.09, 0); k1.rotation.z = 0.4; g.add(k1);
  var k2 = box(0.05, 0.09, 0.06, M.tileGDk, -w * 0.21, h + 0.09, 0); k2.rotation.z = -0.4; g.add(k2);
  g.add(cyl(0.014, 0.02, 0.07, 10, M.gold, 0, h + 0.09, 0));
  g.add(sph(0.034, M.gold, 0, h + 0.15, 0));
  g.add(cyl(0.006, 0.012, 0.045, 8, M.gold, 0, h + 0.2, 0));
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：街的起点——木茶寮（h≈1.02） ---- */
function level1(M, anims) {
  var g = grp();
  g.name = 'stall';
  g.add(qPad(M, 2.15, 1.95));
  /* 四木柱 + 老杉木壁（后满壁、左右半壁） */
  var py = 0.05, ph = 0.55;
  [[-0.6, -0.42], [0.6, -0.42], [-0.6, 0.36], [0.6, 0.36]].forEach(function (c) {
    g.add(box(0.055, ph, 0.055, M.woodD, c[0], py + ph / 2, c[1]));
  });
  g.add(box(1.32, 0.52, 0.045, M.plank, 0, py + 0.26, -0.42));
  g.add(box(0.045, 0.3, 0.74, M.plank, -0.6, py + 0.15, -0.03));
  g.add(box(0.045, 0.3, 0.74, M.plank, 0.6, py + 0.15, -0.03));
  /* 檐下横枋 + 出挑连檐 */
  g.add(box(1.34, 0.06, 0.05, M.wood, 0, py + ph - 0.03, 0.38));
  /* 棕陶瓦四坡顶（apex≈0.99） */
  var roof = brownHipRoof(M, { w: 1.42, d: 1.02, h: 0.28 });
  put(g, roof, 0, py + ph, -0.03);
  /* 廊下茶座 + 短凳（血脉件） */
  var tea = teaSet(M, 1.05); put(g, tea, -0.12, py, 0.02);
  /* 吊灯笼（摆 + 呼吸） */
  var lt = lantern(M, 0.68, anims, 0.7, 0.1); put(g, lt, 0.42, py + ph + 0.02, 0.3);
  /* 门口长凳 + 茶水缸 + 陶盆已在 pad */
  g.add(box(0.36, 0.03, 0.15, M.wood, 0.82, py + 0.115, 0.52));
  g.add(box(0.05, 0.1, 0.13, M.stoneD, 0.68, py + 0.05, 0.52));
  g.add(box(0.05, 0.1, 0.13, M.stoneD, 0.96, py + 0.05, 0.52));
  g.add(cyl(0.08, 0.095, 0.16, 10, M.stoneD, -0.85, py + 0.08, 0.35));
  g.add(cyl(0.075, 0.075, 0.02, 10, M.stoneD, -0.85, py + 0.17, 0.35));
  /* 踏步 */
  g.add(steps2(M, 0.52, 0, 1.0));
  /* 廊内暖光呼吸 */
  var glow = M.glowInner;
  anims.push(function (t) { glow.emissiveIntensity = 0.12 + 0.05 * sin(t * 1.2); });
  return g;
}

/* ---- lv2 洋房：长出奶油骑楼脸——双开间拱廊 + 雨棚 + 山花（h≈1.62） ---- */
function level2(M, anims) {
  var g = grp();
  g.name = 'qilouSlice';
  g.add(qPad(M, 2.35, 2.05));
  /* 底层骑楼廊（双开间） */
  var col = colonnade(M, { w: 1.5, hCol: 0.42, bays: 2, zF: 0.46, interiorD: 0.52 });
  col.position.y = 0.05;
  g.add(col);
  var yTop = 0.05 + col.userData.yTop;             /* ≈0.80 檐口顶 */
  /* 二层楼身（奶油灰泥）+ 层间腰线 */
  g.add(box(1.54, 0.53, 0.86, M.stucco, 0, yTop + 0.265, -0.06));
  g.add(box(1.6, 0.035, 0.92, M.trim, 0, yTop + 0.017, -0.06));
  /* 二层拱窗 ×3（绿/赭混色百叶） */
  var w1 = archWindow(M, 0.2, 0.28, M.shG, M.shO); put(g, w1, -0.45, yTop + 0.14, 0.363);
  var w2 = archWindow(M, 0.24, 0.3, M.shT, M.shG); put(g, w2, 0, yTop + 0.125, 0.363);
  var w3 = archWindow(M, 0.2, 0.28, M.shO, M.shG); put(g, w3, 0.45, yTop + 0.14, 0.363);
  /* 绿布扇贝雨棚（骑楼廊顶） */
  var awn = awningUnit(M, 1.58, 0.3, 0.11, 5); put(g, awn, 0, yTop + 0.085, 0.375);
  /* 巴洛克山花（白灰 + 涡卷 + cartouche + 双宝珠）+ 山后小青瓦坡顶 */
  var ped = crownPediment(M, { w: 1.46, h: 0.26, depth: 0.1, urns: 2 });
  put(g, ped, 0, yTop + 0.53, 0.3);
  var ridgeY = yTop + 0.55;
  var sF = box(1.2, 0.028, 0.34, M.tileBSun, 0, ridgeY + 0.03, -0.18);
  sF.rotation.x = 0.42; g.add(sF);
  var sB = box(1.2, 0.028, 0.3, M.tileBShd, 0, ridgeY + 0.03, -0.44);
  sB.rotation.x = -0.5; g.add(sB);
  /* 廊下：茶座 + 双灯笼 */
  var tea = teaSet(M, 1.0); put(g, tea, 0.37, 0.055, 0.16);
  var l1 = lantern(M, 0.56, anims, 1.6, 0.09); put(g, l1, -0.375, yTop - 0.055, 0.38);
  var l2 = lantern(M, 0.56, anims, 2.9, 0.09); put(g, l2, 0.375, yTop - 0.055, 0.38);
  /* 踏步 + 角隅盆栽 */
  g.add(steps2(M, 0.6, 0, 1.04));
  var pb = potPlant(M, 0.8); put(g, pb, 0.98, 0.05, 0.66);
  /* 廊内暖光呼吸 */
  var glow = M.glowInner;
  anims.push(function (t) { glow.emissiveIntensity = 0.12 + 0.05 * sin(t * 1.15 + 0.4); });
  return g;
}

/* ---- lv3 大厦：三层高骑楼——拱窗排 + 栏杆 + crown + 竖招（h≈2.10） ---- */
function level3(M, anims) {
  var g = grp();
  g.name = 'qilouTower';
  g.add(qPad(M, 2.45, 2.2));
  /* 底层骑楼廊（三开间） */
  var col = colonnade(M, { w: 1.8, hCol: 0.5, bays: 3, zF: 0.52, interiorD: 0.58 });
  col.position.y = 0.05;
  g.add(col);
  var yTop = 0.05 + col.userData.yTop;             /* ≈0.835 檐口顶 */
  /* 二层楼身 + 腰线 */
  g.add(box(1.86, 0.46, 0.8, M.stucco, 0, yTop + 0.23, -0.06));
  g.add(box(1.92, 0.032, 0.86, M.trim, 0, yTop + 0.016, -0.06));
  /* 二层拱窗 ×3 + 花箱 ×2 */
  var a1 = archWindow(M, 0.2, 0.3, M.shG, M.shO); put(g, a1, -0.52, yTop + 0.13, 0.353);
  var a2 = archWindow(M, 0.22, 0.32, M.shT, M.shR); put(g, a2, 0, yTop + 0.12, 0.353);
  var a3 = archWindow(M, 0.2, 0.3, M.shO, M.shG); put(g, a3, 0.52, yTop + 0.13, 0.353);
  var fb1 = flowerBox(M, 0.26); put(g, fb1, -0.52, yTop + 0.115, 0.37);
  var fb2 = flowerBox(M, 0.26); put(g, fb2, 0.52, yTop + 0.115, 0.37);
  /* 绿布扇贝雨棚 */
  var awn = awningUnit(M, 1.9, 0.32, 0.12, 6); put(g, awn, 0, yTop + 0.09, 0.38);
  /* 三层楼身（略收）+ 拱窗 ×3 */
  var y3 = yTop + 0.495;
  g.add(box(1.7, 0.42, 0.72, M.stucco, 0, y3 + 0.21, -0.12));
  g.add(box(1.76, 0.03, 0.78, M.trim, 0, y3 + 0.015, -0.12));
  var b1 = archWindow(M, 0.18, 0.26, M.shR, M.shT); put(g, b1, -0.42, y3 + 0.12, 0.333);
  var b2 = archWindow(M, 0.18, 0.26, M.shO, M.shC); put(g, b2, 0, y3 + 0.12, 0.333);
  var b3 = archWindow(M, 0.18, 0.26, M.shG, M.shO); put(g, b3, 0.42, y3 + 0.12, 0.333);
  /* 角隅壁柱（通高两根） */
  g.add(box(0.075, y3 + 0.42 - yTop + 0.02, 0.055, M.trim, -0.925, (yTop + y3 + 0.42) / 2, 0.345));
  g.add(box(0.075, y3 + 0.42 - yTop + 0.02, 0.055, M.trim, 0.925, (yTop + y3 + 0.42) / 2, 0.345));
  /* 檐口 + 满宽白灰 crown（cartouche + 三宝珠）+ 两翼瓶栏 */
  var y4 = y3 + 0.44;
  g.add(box(1.8, 0.055, 0.8, M.trim, 0, y4 + 0.0275, -0.1));
  var ped = crownPediment(M, { w: 1.16, h: 0.27, depth: 0.09, urns: 3 });
  put(g, ped, 0, y4 + 0.055, 0.3);
  var pw1 = balustrade(M, 0.32); put(g, pw1, -0.76, y4 + 0.055, 0.31);
  var pw2 = balustrade(M, 0.32); put(g, pw2, 0.76, y4 + 0.055, 0.31);
  /* crown 后退台暗屋顶（浅色，压低） */
  g.add(box(1.7, 0.05, 0.52, M.stuccoDk, 0, y4 + 0.05, -0.18));
  /* 廊下：茶座 + 双灯笼 + 竖招「上下九」 */
  var tea = teaSet(M, 1.0); put(g, tea, -0.3, 0.055, 0.2);
  var l1 = lantern(M, 0.54, anims, 0.4, 0.09); put(g, l1, -0.6, yTop - 0.055, 0.44);
  var l2 = lantern(M, 0.54, anims, 2.2, 0.09); put(g, l2, 0.6, yTop - 0.055, 0.44);
  var sign = vSign(M, anims, 1.1); put(g, sign, 0.84, yTop - 0.06, 0.56);
  /* 踏步 + 角隅盆栽 */
  g.add(steps2(M, 0.66, 0, 1.12));
  var pb = potPlant(M, 0.85); put(g, pb, -1.02, 0.05, 0.72);
  /* 廊内暖光呼吸 */
  var glow = M.glowInner;
  anims.push(function (t) { glow.emissiveIntensity = 0.12 + 0.05 * sin(t * 1.1 + 0.8); });
  return g;
}

/* ---- lv4 地标：转角大茶楼——四开间骑楼 + 双层瓶栏阳台 + 金日 crown + 绿琉璃攒尖（h≈2.62） ---- */
function level4(M, anims) {
  var g = grp();
  g.name = 'qilouMansion';
  g.add(qPad(M, 2.5, 2.3));
  /* 底层骑楼廊（四开间，转角大楼的临街面） */
  var col = colonnade(M, { w: 2.1, hCol: 0.55, bays: 4, zF: 0.6, interiorD: 0.94, band: 0.04 });
  col.position.y = 0.05;
  g.add(col);
  var yTop = 0.05 + col.userData.yTop;             /* ≈0.86 檐口顶 */
  /* 二层楼身 + 挑阳台（白瓶栏 + 栏上盆栽）+ 拱窗 ×4 */
  g.add(box(2.14, 0.48, 0.9, M.stucco, 0, yTop + 0.24, -0.05));
  g.add(box(2.2, 0.034, 0.96, M.trim, 0, yTop + 0.017, -0.05));
  g.add(box(2.14, 0.04, 0.24, M.stone, 0, yTop + 0.035, 0.42));          /* 阳台板 */
  var bal1 = balustrade(M, 2.02); put(g, bal1, 0, yTop + 0.055, 0.51);
  var c1 = archWindow(M, 0.2, 0.3, M.shG, M.shO); put(g, c1, -0.75, yTop + 0.14, 0.403);
  var c2 = archWindow(M, 0.2, 0.3, M.shT, M.shR); put(g, c2, -0.25, yTop + 0.14, 0.403);
  var c3 = archWindow(M, 0.2, 0.3, M.shO, M.shG); put(g, c3, 0.25, yTop + 0.14, 0.403);
  var c4 = archWindow(M, 0.2, 0.3, M.shC, M.shT); put(g, c4, 0.75, yTop + 0.14, 0.403);
  var rp1 = potPlant(M, 0.55); put(g, rp1, -0.9, yTop + 0.055, 0.5);
  var rp2 = potPlant(M, 0.55); put(g, rp2, 0.9, yTop + 0.055, 0.5);
  /* 绿布扇贝雨棚（更宽） */
  var awn = awningUnit(M, 2.2, 0.34, 0.13, 7); put(g, awn, 0, yTop + 0.095, 0.42);
  /* 三层楼身 + 阳台 + 拱窗 ×4 */
  var y3 = yTop + 0.525;
  g.add(box(2.0, 0.44, 0.8, M.stucco, 0, y3 + 0.22, -0.11));
  g.add(box(2.06, 0.03, 0.86, M.trim, 0, y3 + 0.015, -0.11));
  g.add(box(2.0, 0.04, 0.22, M.stone, 0, y3 + 0.035, 0.4));
  var bal2 = balustrade(M, 1.9); put(g, bal2, 0, y3 + 0.055, 0.49);
  var d1 = archWindow(M, 0.19, 0.28, M.shR, M.shG); put(g, d1, -0.7, y3 + 0.13, 0.383);
  var d2 = archWindow(M, 0.19, 0.28, M.shO, M.shT); put(g, d2, -0.235, y3 + 0.13, 0.383);
  var d3 = archWindow(M, 0.19, 0.28, M.shT, M.shC); put(g, d3, 0.235, y3 + 0.13, 0.383);
  var d4 = archWindow(M, 0.19, 0.28, M.shG, M.shO); put(g, d4, 0.7, y3 + 0.13, 0.383);
  var rp4 = potPlant(M, 0.5); put(g, rp4, -0.85, y3 + 0.055, 0.48);
  var rp5 = potPlant(M, 0.5); put(g, rp5, 0.85, y3 + 0.055, 0.48);
  /* 主檐口 + 角隅宝瓶 */
  var y4 = y3 + 0.475;
  g.add(box(2.2, 0.06, 0.96, M.trim, 0, y4 + 0.03, -0.02));
  [[-1.08, 0.42], [1.08, 0.42]].forEach(function (p) {
    g.add(cyl(0.014, 0.022, 0.06, 10, M.trim, p[0], y4 + 0.09, p[1]));
    g.add(sph(0.02, M.trim, p[0], y4 + 0.135, p[1]));
  });
  /* 四层退台 + 拱窗 ×3 */
  var y5 = y4 + 0.06;
  g.add(box(1.3, 0.36, 0.7, M.stucco, 0, y5 + 0.18, -0.08));
  var e1 = archWindow(M, 0.17, 0.23, M.shO, M.shG); put(g, e1, -0.4, y5 + 0.1, 0.273);
  var e2 = archWindow(M, 0.17, 0.23, M.shT, M.shO); put(g, e2, 0, y5 + 0.1, 0.273);
  var e3 = archWindow(M, 0.17, 0.23, M.shG, M.shC); put(g, e3, 0.4, y5 + 0.1, 0.273);
  /* 金日纹 crown + 绿琉璃翘角攒尖顶（鎏金宝顶） */
  var ped = crownPediment(M, { w: 1.42, h: 0.24, depth: 0.09, urns: 2, sunburst: true });
  put(g, ped, 0, y5 + 0.36, 0.26);
  var roof = glazedCrownRoof(M, { w: 1.12, d: 0.62, rise: 0.22 });
  put(g, roof, 0, y5 + 0.37, -0.08);               /* 宝顶≈2.62 */
  /* 廊下：双茶座 + 红灯笼 ×2 + 竖招 */
  var tea1 = teaSet(M, 1.0); put(g, tea1, -0.5, 0.055, 0.18);
  var tea2 = teaSet(M, 0.9); put(g, tea2, 0.55, 0.055, 0.1);
  var l1 = lantern(M, 0.6, anims, 0.2, 0.1); put(g, l1, -0.79, yTop - 0.055, 0.5);
  var l2 = lantern(M, 0.6, anims, 1.9, 0.1); put(g, l2, 0.79, yTop - 0.055, 0.5);
  var sign = vSign(M, anims, 2.4); put(g, sign, -0.99, yTop - 0.06, 0.62);
  /* 踏步 + 角隅盆栽 */
  g.add(steps2(M, 0.72, 0, 1.18));
  var pb1 = potPlant(M, 0.9); put(g, pb1, 1.06, 0.05, 0.78);
  /* 廊内暖光呼吸 */
  var glow = M.glowInner;
  anims.push(function (t) { glow.emissiveIntensity = 0.12 + 0.05 * sin(t * 1.05 + 1.3); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[10] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_10_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 10;
  g.userData.level = lv;
  g.userData.region = 'g3';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
