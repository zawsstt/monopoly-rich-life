/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_10.js（v2 精修版）
 * -------------------------------------------------------------------------------------
 * 格 10「上下九」(g3 岭南骑楼) 独属建筑：广州西关骑楼茶楼四阶生长史
 * 参考图高保真复刻（img2threejs 流程：blockout→structure→form→material→lighting→
 * interaction→optimization；观察记录见 .img2threejs/evidence_prop10/）。
 * [命名勘误记录] refs/prop_10.png 不存在；refs/prop_11.png（BOARD[11] 为电力公司、
 * 无进化图需求）即格 10 的四阶进化图集，内容为岭南骑楼茶楼，与 BOARD[10] 上下九
 * 完全对应，采为本格视觉基准（同批 prop_13/prop_14 证实按格编号出图）。
 *
 * 风格族谱（同一块地的同一种生长，v1 已验收，v2 不推翻）：
 *   lv1 小屋   街的起点——木茶寮：四木柱 + 老杉木壁 + 棕陶瓦四坡顶 + 茶桌凳 + 挂灯笼
 *   lv2 洋房   长出奶油骑楼脸：双开间拱廊柱列 + 绿布波浪雨棚 + 二层百叶拱窗 +
 *              白灰巴洛克山花（涡卷/宝珠顶饰），茶桌仍在廊下（h≈1.68）
 *   lv3 大厦   三层高骑楼：三开间拱廊 + 雨棚 + 两排拱窗百叶混色 + 花箱 + 角隅壁柱 +
 *              檐口宝瓶栏杆 + 满宽白灰 crown 山花（三宝珠）+ 竖招「上下九」（h≈2.17）
 *   lv4 地标   转角大茶楼：四开间骑楼 + 红灯笼 + 两层白瓶栏阳台 + 阳台盆栽 +
 *              四层退台 + 金色日纹章 crown + 绿琉璃翘角攒尖顶 + 鎏金宝顶（h≈2.73）
 *
 * 独有语汇（自参考图逐区采样）：奶油灰泥墙（#EDE3D0/暗部 #DFD3BC）、苍白石柱列
 * （双层高基座+圆柱+颈环+方垫）、拱带连续骑楼廊（楔形 keystone + 拱肩绿釉圆浮雕）、
 * 绿色扇贝边布雨棚（#4E7D52）、混色木百叶拱窗（绿#4F7D5B/赭#C9973F/橙#C56A2E/
 * 青#3E7F82/红#A93B2E，逐片百叶 + 框线）、白灰 crown 山花（涡卷+卷眼+浮雕卷草+
 * 宝珠顶饰）、金日纹章（6 道放射金芒+绿釉方贴）、绿琉璃翘角屋顶（#4E7D5E 鱼鳞
 * 圆瓦垄纹 + 坡面瓦垄条 + 鎏金卷草翘头）、鎏金件（#D8A63C）、红灯笼（#C8402E，
 * 金盖沿/金箍/穗尾金珠）、白瓶栏（端柱+瓶式望柱）、石板地坪+草皮+陶盆（每阶必有）、
 * 廊下茶桌凳（每阶必有）。
 *
 * [v2 精修记录]（对照 refs/prop_11.png 逐条清偿 v1 遗留差距，布局/配色/朝向不变）
 *   1. 骑楼拱廊：每跨拱券加楔形 keystone；柱础改双层高基座；柱头加颈环；
 *      跨间拱肩加绿釉圆浮雕（lv3/lv4）；檐枋下加阴影缝。
 *   2. 奶油灰泥墙面阴阳面分档：lv2 窗后绿灰泥面板 + 上下框线；lv3 左右对称壁面板；
 *      lv4 三层窗上浮雕饰带；lv3/lv4 主檐口下加凹影缝；lv2/lv3/lv4 角隅鹑石色
 *      quoin 块（lv3 与既有壁柱结合）。
 *   3. 百叶窗：每扇加楔形 keystone + 顶横框线 + 双竖框线；叶面加逐片百叶条
 *      （lv2/lv3 每叶 3 片、lv4 下两层每叶 2 片/退台每叶 1 片，预算平衡）。
 *   4. 巴洛克山花：涡卷加卷眼；墙面加对置浮雕卷草；lv4 金日纹章加 6 道放射金芒
 *      （鎏金呼吸）+ 绿釉方贴 ×2 + 下置浮雕章。
 *   5. 绿琉璃翘角攒尖顶：坡面加瓦垄条；正脊加圆滚；脊端翘头改鎏金卷草 + 卷眼；
 *      宝顶加金环；瓦纹 Canvas 升级为参考图鱼鳞圆瓦垄（256px）。
 *   6. 灯笼金属件：金盖加外沿、红灯壳加金箍、穗尾加金珠。
 *   7. 宝瓶栏杆：两端加端柱；lv2/lv3 按参考图补全宽瓶栏阳台（楼板+栏杆+花箱上栏）。
 *   8. lv1 茶寮：坡面瓦垄 ×4 + 圆滚正脊 + 脊端圆珠 + 前封檐板；木壁斜撑 ×2、
 *      右壁百叶窗、室内货架茶罐、第二盏小灯笼、门口小凳。
 *   9. 修复 v1 悬浮：lv3 三层窗 / lv4 三层窗贴合退台墙面（v1 距墙 0.07-0.09 悬空）。
 *  10. 硬门槛：圆柱段数 ≥12、球 ≥16×12；纹理 ≤256px；动画保持并增强
 *      （雨棚微摆、鎏金日纹呼吸，旋转 ≤0.3rad、emissive 波动 ≤0.25）。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[10] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤350；userData.anim=[fn(t,dt)]。
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
/* v2：圆柱段数硬门槛 ≥12 */
function cyl(rt, rb, h, seg, mat, x, y, z) {
  var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg || 12)), mat);
  o.position.set(x || 0, y || 0, z || 0); return o;
}
/* v2：球段数硬门槛 ≥16×12 */
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
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

/* 奶油灰泥墙（v2 升级 256px）：细噪 + 抹痕 + 淡雨渍 + 边角磨暗 */
function texStucco() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#ede3d0'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 420; i++) {
    g.fillStyle = (i % 3 === 0) ? 'rgba(120,110,90,0.06)' : (i % 3 === 1 ? 'rgba(255,255,255,0.07)' : 'rgba(223,211,188,0.10)');
    g.fillRect((i * 29) % S, (i * 43) % S, 4, 3);
  }
  for (i = 0; i < 10; i++) {
    g.fillStyle = 'rgba(150,138,114,0.05)';
    g.fillRect((i * 61 + 9) % S, (i * 17) % 60, 5, 60 + (i * 13) % 80);
  }
  var gr = g.createLinearGradient(0, 0, S, 0);
  gr.addColorStop(0, 'rgba(120,108,86,0.10)'); gr.addColorStop(0.12, 'rgba(120,108,86,0)');
  gr.addColorStop(0.9, 'rgba(120,108,86,0)'); gr.addColorStop(1, 'rgba(120,108,86,0.09)');
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
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
/* 棕陶瓦垄（lv1 茶寮顶，v2 升级 256px）：垄线明暗 + 竖接头错缝 */
function texTileBrown() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#7a6a52'; g.fillRect(0, 0, S, S);
  var rows = 14, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#83725a' : '#74644d';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#57493a'; g.fillRect(0, y + rh - 4, S, 4);
    g.fillStyle = '#93805f'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(50,42,32,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 300; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,240,210,0.05)' : 'rgba(40,34,26,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 绿琉璃鱼鳞圆瓦垄（lv4 攒尖顶，v2 对照参考图重绘 256px）：
 * 逐排半圆鳞瓦 + 深缝 + 釉面高光，替代 v1 平行垄线 */
function texTileGreen() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#3c6349'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows, r = rh * 0.62;
  for (i = 0; i <= rows; i++) {
    var y = i * rh, off = (i % 2) ? rh * 0.5 : 0;
    for (k = -1; k < S / (rh) + 1; k++) {
      var x = off + k * rh;
      g.fillStyle = (k % 2) ? '#568767' : '#4c7a5c';
      g.beginPath(); g.arc(x, y, r, 0, PI, false); g.fill();
      g.strokeStyle = 'rgba(28,48,36,0.65)'; g.lineWidth = 2;
      g.beginPath(); g.arc(x, y, r, 0, PI, false); g.stroke();
      g.strokeStyle = 'rgba(190,230,200,0.30)'; g.lineWidth = 1.5;
      g.beginPath(); g.arc(x, y - 1.5, r * 0.72, PI * 1.15, PI * 1.85); g.stroke();
    }
    g.fillStyle = 'rgba(30,50,38,0.35)'; g.fillRect(0, y - 2, S, 3);
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(220,255,230,0.06)' : 'rgba(30,50,38,0.08)';
    g.fillRect((i * 31) % S, (i * 47) % S, 3, 2);
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
/* 木百叶窗叶（按漆色生成 5 变体，v2 升级 128px 百叶加密）：横百叶明暗线 + 边框 */
function texLouvre(hex) {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), y;
  g.fillStyle = hex; g.fillRect(0, 0, S, S);
  for (y = 6; y < S - 6; y += 11) {
    g.fillStyle = 'rgba(0,0,0,0.30)'; g.fillRect(5, y + 6, S - 10, 4);
    g.fillStyle = 'rgba(255,255,255,0.22)'; g.fillRect(5, y, S - 10, 3);
  }
  g.strokeStyle = 'rgba(40,26,14,0.55)'; g.lineWidth = 9; g.strokeRect(2, 2, S - 4, S - 4);
  g.strokeStyle = 'rgba(255,255,255,0.10)'; g.lineWidth = 3; g.strokeRect(10, 10, S - 20, S - 20);
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
    stuccoCel: MAT('p10stuccoCel', function () { return std('#ccd6c0', { rough: 0.9 }); }),   /* v2 lv2 绿灰泥档 */
    trim:      MAT('p10trim', function () { var t = getTex('trim', texTrim); return std('#ffffff', { map: t, rough: 0.85 }); }),
    shaft:     MAT('p10shaft', function () { return std('#e4dbc8', { rough: 0.82 }); }),
    plinth:    MAT('p10plinth', function () { return std('#cfc3a9', { rough: 0.88 }); }),
    dark:      MAT('p10dark', function () { return std('#33261a', { rough: 0.95 }); }),
    wood:      MAT('p10wood', function () { return std('#8a6844', { rough: 0.8 }); }),
    woodD:     MAT('p10woodD', function () { return std('#6b4e32', { rough: 0.85 }); }),
    plank:     MAT('p10plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, rough: 0.85 }); }),
    tileBSun:  MAT('p10tileBSun', function () { var t = getTex('tileB', texTileBrown); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.72 }); }),
    tileBShd:  MAT('p10tileBShd', function () { var t = getTex('tileB', texTileBrown); return std('#b9ac96', { map: t, bump: t, bumpScale: 0.014, rough: 0.78 }); }),
    tileGSun:  MAT('p10tileGSun', function () { var t = getTex('tileG', texTileGreen); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.55 }); }),
    tileGShd:  MAT('p10tileGShd', function () { var t = getTex('tileG', texTileGreen); return std('#9dbfa9', { map: t, bump: t, bumpScale: 0.016, rough: 0.6 }); }),
    tileGDk:   MAT('p10tileGDk', function () { return std('#3e6748', { rough: 0.6 }); }),
    awn:       MAT('p10awn', function () { var t = getTex('awn', texAwning); return std('#ffffff', { map: t, rough: 0.92 }); }),
    shG:       MAT('p10shG', function () { return std('#ffffff', { map: getTex('lvG', function () { return texLouvre('#4f7d5b'); }), rough: 0.6 }); }),
    shO:       MAT('p10shO', function () { return std('#ffffff', { map: getTex('lvO', function () { return texLouvre('#c9973f'); }), rough: 0.6 }); }),
    shR:       MAT('p10shR', function () { return std('#ffffff', { map: getTex('lvR', function () { return texLouvre('#c56a2e'); }), rough: 0.6 }); }),
    shT:       MAT('p10shT', function () { return std('#ffffff', { map: getTex('lvT', function () { return texLouvre('#3e7f82'); }), rough: 0.6 }); }),
    shC:       MAT('p10shC', function () { return std('#ffffff', { map: getTex('lvC', function () { return texLouvre('#a93b2e'); }), rough: 0.6 }); }),
    /* v2 百叶条（逐片）深色实色 5 变体 */
    slatG:     MAT('p10slatG', function () { return std('#3d6147', { rough: 0.65 }); }),
    slatO:     MAT('p10slatO', function () { return std('#a0762d', { rough: 0.65 }); }),
    slatR:     MAT('p10slatR', function () { return std('#9c4f22', { rough: 0.65 }); }),
    slatT:     MAT('p10slatT', function () { return std('#33636a', { rough: 0.65 }); }),
    slatC:     MAT('p10slatC', function () { return std('#8c2d23', { rough: 0.65 }); }),
    /* v2 百叶窗叶对（叶面纹理 + 逐片条材质） */
    shutG:     { f: null, s: null },
    gold:      MAT('p10gold', function () { return std('#d8a63c', { rough: 0.35, metal: 0.75 }); }),
    goldGlow:  MAT('p10goldGlow', function () { return std('#e2b04a', { rough: 0.3, metal: 0.8, emissive: '#ffcf7a', ei: 0.22 }); }),  /* v2 金日纹放射芒（呼吸） */
    relief:    MAT('p10relief', function () { return std('#4e7d5e', { rough: 0.65 }); }),
    quoin:     MAT('p10quoin', function () { return std('#dcc7a2', { rough: 0.88 }); }),   /* v2 角隅 quoin 亮块 */
    quoinD:    MAT('p10quoinD', function () { return std('#c6ab84', { rough: 0.88 }); }),  /* v2 角隅 quoin 暗块 */
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
/* v2：补齐百叶叶对（f/s 材质引用） */
function shutPairs(M) {
  M.shutG = { f: M.shG, s: M.slatG };
  var o = {
    G: M.shutG,
    O: { f: M.shO, s: M.slatO },
    R: { f: M.shR, s: M.slatR },
    T: { f: M.shT, s: M.slatT },
    C: { f: M.shC, s: M.slatC }
  };
  return o;
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
/* v2 楔形 keystone（4 棱台，轴沿 +z、小端朝外）；rotation.set(PI/2,0,PI/4) 使用 */
function keystoneGeo(len) {
  return geoCache('key' + len.toFixed(3), function () {
    return new THREE.CylinderGeometry(0.022, 0.042, len, 4, 1);
  });
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

/* v2 墙面阴阳面分档壁面板：暗色 field（凹影）+ 上下框线条 */
function wallPanel(M, w, h, fieldMat, x, y, z) {
  var g = grp();
  g.add(box(w, h, 0.014, fieldMat, 0, 0, 0));
  g.add(box(w + 0.05, 0.024, 0.022, M.trim, 0, h / 2 + 0.014, 0.003));
  g.add(box(w + 0.05, 0.024, 0.022, M.trim, 0, -h / 2 - 0.014, 0.003));
  g.position.set(x, y, z);
  return g;
}

/* v2 角隅 quoin 块列（参考图鹑石色隅石）：n 块交替亮暗，前墙面 */
function quoins(M, n, bh, x, y0, z) {
  var g = grp(), i;
  for (i = 0; i < n; i++) {
    g.add(box(0.05, bh - 0.012, 0.026, i % 2 ? M.quoinD : M.quoin, 0, bh / 2 + i * bh, 0));
  }
  g.position.set(x, y0, z);
  return g;
}

/* 骑楼廊柱列 v2：双层高基座 + 圆柱 + 颈环 + 方垫 + 拱带连续 + 楔形 keystone +
 * 拱肩圆浮雕 + 檐枋阴影缝（廊下即茶座） */
function colonnade(M, o) {
  var g = grp();
  var w = o.w, hCol = o.hCol, bays = o.bays, zF = o.zF;
  var span = w / bays, archR = span * 0.38, band = o.band || 0.045, depth = o.depth || 0.07;
  var ySpring = hCol - 0.042;
  var i, x;
  for (i = 0; i <= bays; i++) {
    x = -w / 2 + i * span;
    /* v2 柱础：双层高基座（参考图方墩基座） */
    g.add(box(0.1, 0.058, 0.1, M.plinth, x, 0.029, zF - depth / 2));
    g.add(box(0.082, 0.03, 0.082, M.shaft, x, 0.073, zF - depth / 2));
    /* 柱身（12 段，微收分） */
    g.add(cyl(0.029, 0.035, hCol - 0.145, 12, M.shaft, x, 0.088 + (hCol - 0.145) / 2, zF - depth / 2));
    /* v2 柱头：颈环 + 方 Abacus（顶面仍压在 hCol，yTop 语义不变） */
    g.add(cyl(0.036, 0.043, 0.022, 12, M.trim, x, hCol - 0.046, zF - depth / 2));
    g.add(box(0.096, 0.035, 0.096, M.trim, x, hCol - 0.0175, zF - depth / 2));
  }
  var bg = geoCache('ab' + archR.toFixed(3) + '_' + band + '_' + depth, function () { return archBandGeo(archR, band, depth); });
  var kg = keystoneGeo(depth + 0.03);
  for (i = 0; i < bays; i++) {
    var cx = -w / 2 + (i + 0.5) * span;
    var ab = mesh(bg, M.trim);
    ab.position.set(cx, ySpring, zF - depth);
    g.add(ab);
    /* v2 楔形 keystone（拱冠） */
    var ks = mesh(kg, M.trim);
    ks.rotation.set(PI / 2, 0, PI / 4);
    ks.position.set(cx, ySpring + archR + band * 0.55, zF - depth / 2);
    g.add(ks);
  }
  /* v2 拱肩绿釉圆浮雕（跨间拱肩交汇处） */
  if (o.rosettes) {
    var rn = o.rosettes, rg = geoCache('ros', function () { return new THREE.CylinderGeometry(0.021, 0.021, 0.016, 12); });
    for (i = 1; i <= rn; i++) {
      var ro = mesh(rg, M.relief);
      ro.rotation.x = PI / 2;
      ro.position.set(-w / 2 + i * (w / (rn + 1)), ySpring + archR * 0.52, zF + 0.006);
      g.add(ro);
    }
  }
  var yTop = ySpring + archR + band;
  var ent = box(w + 0.1, 0.055, depth + 0.04, M.trim, 0, yTop + 0.0275, zF - depth / 2);
  g.add(ent);
  /* v2 檐枋下阴影缝（阴阳面） */
  g.add(box(w + 0.1, 0.02, depth + 0.02, M.dark, 0, yTop - 0.011, zF - depth / 2));
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

/* 百叶拱窗 v2：暗拱洞 + 白拱带 + 中梃 + 窗台 + 楔形 keystone + 顶/竖框线 +
 * 双开百叶（铰链外倾）+ 逐片百叶条 */
function archWindow(M, w, h, shutL, shutR, slats) {
  var g = grp();
  var r = w / 2;
  var key = w.toFixed(2) + 'x' + h.toFixed(2);
  var rec = mesh(geoCache('ap' + key, function () { return archPanelGeo(w, h, 0.014); }), M.dark);
  rec.position.z = -0.004; g.add(rec);
  var band = mesh(geoCache('abw' + key, function () { return archBandGeo(Math.max(0.05, r - 0.012), 0.032, 0.03); }), M.trim);
  band.position.set(0, h - r + 0.012, 0); g.add(band);
  g.add(box(0.022, h - r + 0.02, 0.032, M.trim, 0, (h - r) / 2 + 0.006, 0.01));
  g.add(box(w + 0.07, 0.032, 0.05, M.trim, 0, -0.016, 0.012));
  /* v2 楔形 keystone */
  var ks = mesh(keystoneGeo(0.05), M.trim);
  ks.rotation.set(PI / 2, 0, PI / 4);
  ks.position.set(0, h + 0.018, 0.012); g.add(ks);
  /* v2 框线：顶横框 + 双竖框 */
  g.add(box(w + 0.11, 0.016, 0.046, M.trim, 0, h + 0.04, 0.006));
  g.add(box(0.016, h + 0.054, 0.046, M.trim, -(w / 2 + 0.036), (h + 0.014) / 2, 0.006));
  g.add(box(0.016, h + 0.054, 0.046, M.trim, w / 2 + 0.036, (h + 0.014) / 2, 0.006));
  var lw = (w - 0.055) / 2, lh = (h - r) * 0.92 + r * 0.42;
  slats = (slats === undefined) ? 3 : slats;
  if (lw >= 0.05 && shutL && shutR) {
    [[-1, shutL], [1, shutR]].forEach(function (sd) {
      var hinge = grp();
      hinge.position.set(sd[0] * (w / 2 - 0.012), lh / 2 + 0.012, 0.026);
      var leaf = box(lw, lh, 0.02, sd[1].f, -sd[0] * lw / 2, 0, 0);
      hinge.add(leaf);
      /* v2 逐片百叶条 */
      var k;
      for (k = 0; k < slats; k++) {
        var sl = box(lw * 0.92, 0.018, 0.014, sd[1].s, -sd[0] * lw / 2, -lh / 2 + lh * (k + 0.5) / slats, 0.014);
        sl.rotation.x = -0.5;
        hinge.add(sl);
      }
      hinge.rotation.y = -sd[0] * 0.3;
      g.add(hinge);
    });
  }
  return g;
}

/* 绿布扇贝雨棚 v2：斜面 + 波浪垂边 + 端头垂穗（参考图流苏）+ 微摆动画 */
function awningUnit(M, w, out, drop, n, anims, phase, fringe) {
  var g = grp();
  var ang = Math.atan2(drop, out);
  var len = Math.sqrt(out * out + drop * drop) + 0.03;
  g.rotation.x = ang;
  g.add(box(w + 0.12, 0.02, len, M.awn, 0, 0.012, len / 2));
  var val = mesh(geoCache('val' + w.toFixed(2) + 'n' + n, function () { return valanceGeo(w, 0.075, n); }), M.awn);
  val.position.set(0, 0.004, len - 0.015);
  g.add(val);
  /* v2 端头垂穗 ×2 */
  if (fringe) {
    g.add(box(0.014, 0.06, 0.014, M.awn, -w / 2 - 0.03, -0.03, len - 0.02));
    g.add(box(0.014, 0.06, 0.014, M.awn, w / 2 + 0.03, -0.03, len - 0.02));
  }
  /* v2 雨棚微风微摆（幅度克制） */
  if (anims) {
    anims.push(function (t) { g.rotation.z = sin(t * 0.8 + phase) * 0.02; });
  }
  return g;
}

/* 白灰 crown 山花 v2：涡卷 + 卷眼 + 对置浮雕卷草 + 浮雕章（cartouche/金日纹）+ 宝珠顶饰；
 * sunburst 时加 6 道鎏金放射芒（呼吸）+ 绿釉方贴 ×2 */
function crownPediment(M, o) {
  var g = grp(), w = o.w, h = o.h, dep = o.depth || 0.09;
  var body = mesh(pedimentGeo(w, h, dep), M.trim);
  body.position.z = -dep / 2; g.add(body);
  var rl = cyl(0.03, 0.03, 0.05, 12, M.trim, -w * 0.3, h * 0.7, 0.015); rl.rotation.x = PI / 2; g.add(rl);
  var rr = cyl(0.03, 0.03, 0.05, 12, M.trim, w * 0.3, h * 0.7, 0.015); rr.rotation.x = PI / 2; g.add(rr);
  /* v2 涡卷卷眼 */
  g.add(sph(0.011, M.trim, -w * 0.3 - 0.025, h * 0.7, 0.015));
  g.add(sph(0.011, M.trim, w * 0.3 + 0.025, h * 0.7, 0.015));
  /* v2 墙面对置浮雕卷草 */
  var fr1 = sph(0.026, M.relief, -w * 0.15, h * 0.3, 0.012); fr1.scale.set(1.5, 0.7, 0.42); g.add(fr1);
  var fr2 = sph(0.026, M.relief, w * 0.15, h * 0.3, 0.012); fr2.scale.set(1.5, 0.7, 0.42); g.add(fr2);
  if (o.sunburst) {
    /* v2 金日纹章：6 道放射金芒（goldGlow 呼吸）+ 金盘 + 绿釉环 + 中心珠 */
    var rayGeo = geoCache('ray', function () { return new THREE.BoxGeometry(0.014, 0.046, 0.01); });
    var k;
    for (k = 0; k < 6; k++) {
      var ang = PI / 2 + (k - 2.5) * (PI / 7);
      var ray = mesh(rayGeo, M.goldGlow);
      ray.position.set(Math.cos(ang) * 0.098, h * 0.6 + Math.sin(ang) * 0.098, 0.026);
      ray.rotation.z = ang - PI / 2;
      g.add(ray);
    }
    var disc = cyl(0.072, 0.072, 0.018, 12, M.gold, 0, h * 0.6, 0.03); disc.rotation.x = PI / 2; g.add(disc);
    var ring = mesh(new THREE.TorusGeometry(0.076, 0.011, 10, 20), M.relief); ring.position.set(0, h * 0.6, 0.04); g.add(ring);
    g.add(sph(0.02, M.gold, 0, h * 0.6, 0.052));
    /* v2 绿釉方贴 ×2 + 下置浮雕章（参考图 crown 浮雕带） */
    g.add(box(0.05, 0.05, 0.014, M.relief, -w * 0.33, h * 0.24, 0.01));
    g.add(box(0.05, 0.05, 0.014, M.relief, w * 0.33, h * 0.24, 0.01));
    var car2 = sph(0.03, M.relief, 0, h * 0.24, 0.012); car2.scale.set(0.8, 1.1, 0.45); g.add(car2);
    g.add(sph(0.013, M.gold, 0, h * 0.24, 0.032));
  } else {
    var car = sph(0.048, M.relief, 0, h * 0.58, 0.015); car.scale.set(0.72, 1.12, 0.4); g.add(car);
    g.add(sph(0.018, M.gold, 0, h * 0.58, 0.04));
  }
  var n = o.urns || 2, i, ux;
  for (i = 0; i < n; i++) {
    ux = (n === 1) ? 0 : -w * 0.3 + i * (w * 0.6 / (n - 1));
    g.add(cyl(0.013, 0.02, 0.05, 12, M.trim, ux, h + 0.025, 0));
    g.add(sph(0.017, M.trim, ux, h + 0.058, 0));
  }
  return g;
}

/* 白瓶栏宝瓶栏杆 v2：上下望柱栿 + 端柱 + 瓶式望柱（Lathe 12 段单面） */
function balustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.03, 0.06, M.trim, 0, 0.015, 0));
  g.add(box(w + 0.02, 0.028, 0.07, M.trim, 0, 0.175, 0));
  /* v2 端柱 ×2（参考图栏端方墩） */
  g.add(box(0.034, 0.2, 0.08, M.trim, -(w / 2 + 0.01), 0.1, 0));
  g.add(box(0.034, 0.2, 0.08, M.trim, w / 2 + 0.01, 0.1, 0));
  var n = Math.max(4, Math.min(7, Math.round(w / 0.13))), i;
  var lat = geoCache('bal', function () {
    var pts = [[0.013, 0], [0.019, 0.012], [0.011, 0.045], [0.0085, 0.07], [0.015, 0.1], [0.019, 0.125], [0.013, 0.148], [0.018, 0.16]]
      .map(function (p) { return new THREE.Vector2(p[0], p[1]); });
    return new THREE.LatheGeometry(pts, 12);
  });
  for (i = 0; i <= n; i++) {
    var b = mesh(lat, M.trim);
    b.position.set(-w / 2 + i * (w / n), 0.03, 0);
    g.add(b);
  }
  return g;
}

/* 红灯笼 v2：金盖 + 盖沿 + 金箍 + 红壳（呼吸）+ 金底 + 长穗 + 穗尾金珠（吊点摆动） */
function lantern(M, s, anims, phase, drop) {
  var g = grp(); s = s || 1;
  var bm = MAT('p10lant' + phase, function () { return std('#c8402e', { rough: 0.5, emissive: '#ff8a4a', ei: 0.55 }); });
  drop = (drop === undefined) ? 0.08 : drop;
  g.add(cyl(0.006, 0.006, drop, 12, M.ink, 0, -drop / 2, 0));
  var body = grp(); body.position.y = -drop; g.add(body);
  body.add(cyl(0.032 * s, 0.045 * s, 0.03 * s, 12, M.gold, 0, 0.1 * s, 0));
  /* v2 金属件：盖沿 + 壳身金箍 + 穗尾金珠 */
  body.add(cyl(0.05 * s, 0.041 * s, 0.008 * s, 12, M.gold, 0, 0.081 * s, 0));
  var ball = sph(0.08 * s, bm, 0, 0, 0); ball.scale.y = 0.86; body.add(ball);
  var rib = mesh(new THREE.TorusGeometry(0.055 * s, 0.005 * s, 8, 16), M.gold);
  rib.rotation.x = PI / 2; rib.position.y = 0.012 * s; body.add(rib);
  body.add(cyl(0.045 * s, 0.032 * s, 0.03 * s, 12, M.gold, 0, -0.095 * s, 0));
  body.add(cyl(0.007 * s, 0.007 * s, 0.07 * s, 12, M.gold, 0, -0.145 * s, 0));
  body.add(sph(0.011 * s, M.gold, 0, -0.186 * s, 0));
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
  g.add(cyl(0.05 * s, 0.056 * s, 0.085 * s, 12, M.woodD, -0.26 * s, 0.043 * s, 0.07 * s));
  g.add(cyl(0.05 * s, 0.056 * s, 0.085 * s, 12, M.woodD, 0.27 * s, 0.043 * s, -0.05 * s));
  g.add(cyl(0.026 * s, 0.03 * s, 0.028 * s, 12, M.celadon, 0.03 * s, 0.162 * s, 0));
  g.add(sph(0.014 * s, M.celadon, 0.03 * s, 0.185 * s, 0));
  return g;
}

/* 陶盆绿植（呼应参考图阳台/廊角的盆栽点缀） */
function potPlant(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.052 * s, 0.04 * s, 0.085 * s, 12, M.terra, 0, 0.043 * s, 0));
  g.add(cyl(0.06 * s, 0.056 * s, 0.018 * s, 12, M.terra, 0, 0.092 * s, 0));
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
  piv.add(cyl(0.012, 0.012, 0.02, 12, M.gold, 0, 0.01, 0));
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

/* 棕陶瓦四坡顶 v2（lv1 茶寮）：四坡瓦面 + 坡面瓦垄 + 圆滚正脊 + 脊端圆珠 +
 * 木压脊 + 四角微翘 + 前封檐板 */
function brownHipRoof(M, o) {
  var w = o.w, d = o.d, h = o.h, g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.y = h; sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + 0.06, 0.03, lenF, M.tileBSun, 0, 0, lenF / 2));
  /* v2 前坡瓦垄 ×4 */
  var k;
  for (k = 0; k < 4; k++) {
    sgF.add(box(0.045, 0.012, lenF * 0.94, M.tileBShd, -w * 0.36 + k * (w * 0.24), 0.021, lenF / 2 - 0.01));
  }
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
  /* v2 圆滚正脊 + 脊端圆珠（参考图卷材圆脊） */
  var roll = cyl(0.026, 0.026, w * 0.6, 12, M.woodD, 0, h + 0.062, 0); roll.rotation.z = PI / 2; g.add(roll);
  g.add(sph(0.03, M.woodD, -w * 0.3, h + 0.062, 0));
  g.add(sph(0.03, M.woodD, w * 0.3, h + 0.062, 0));
  /* v2 前封檐板 */
  g.add(box(w + 0.1, 0.05, 0.028, M.woodD, 0, h - 0.032, eaveF + 0.008));
  return g;
}

/* 绿琉璃翘角攒尖顶 v2（lv4 顶冠）：四坡釉瓦（鱼鳞圆瓦垄纹）+ 坡面瓦垄条 +
 * 剑把正脊 + 正脊圆滚 + 四角大起翘（鎏金卷草 + 卷眼）+ 鎏金宝顶 + 金环 */
function glazedCrownRoof(M, o) {
  var w = o.w, d = o.d, h = o.rise, g = grp();
  var eaveF = d / 2 + 0.08, eaveS = w / 2 + 0.08;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.y = h; sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + 0.08, 0.028, lenF, M.tileGSun, 0, 0, lenF / 2));
  /* v2 前坡瓦垄条 ×3 */
  var k;
  for (k = 0; k < 3; k++) {
    sgF.add(box(0.05, 0.012, lenF * 0.94, M.tileGDk, -w * 0.3 + k * (w * 0.3), 0.019, lenF / 2 - 0.01));
  }
  var sgB = grp(); sgB.position.y = h; sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + 0.08, 0.028, lenF, M.tileGShd, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.y = h; slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.028, d + 0.08, M.tileGShd, lenS / 2, 0, 0));
  var slL = grp(); slL.position.y = h; slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.028, d + 0.08, M.tileGShd, -lenS / 2, 0, 0));
  /* v2 四角起翘改鎏金卷草（参考图金色卷草翘头）+ 卷眼 */
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.07, 0.05, 0.07, M.tileGDk, c[0] * (w / 2 + 0.03), 0.05, c[1] * (d / 2 + 0.03));
    lift.rotation.z = -c[0] * 0.62; g.add(lift);
  });
  var s1 = box(0.045, 0.095, 0.055, M.gold, w * 0.21, h + 0.095, 0); s1.rotation.z = 0.4; g.add(s1);
  g.add(sph(0.015, M.gold, w * 0.21 + 0.034, h + 0.132, 0));
  var s2 = box(0.045, 0.095, 0.055, M.gold, -w * 0.21, h + 0.095, 0); s2.rotation.z = -0.4; g.add(s2);
  g.add(sph(0.015, M.gold, -w * 0.21 - 0.034, h + 0.132, 0));
  g.add(box(w * 0.42, 0.055, 0.075, M.tileGDk, 0, h + 0.027, 0));
  /* v2 正脊圆滚 */
  var roll = cyl(0.021, 0.021, w * 0.42, 12, M.tileGDk, 0, h + 0.062, 0); roll.rotation.z = PI / 2; g.add(roll);
  g.add(cyl(0.014, 0.02, 0.07, 12, M.gold, 0, h + 0.09, 0));
  g.add(sph(0.034, M.gold, 0, h + 0.15, 0));
  /* v2 宝顶金环 */
  var fr = mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 14), M.gold);
  fr.rotation.x = PI / 2; fr.position.y = h + 0.178; g.add(fr);
  g.add(cyl(0.006, 0.012, 0.045, 12, M.gold, 0, h + 0.2, 0));
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：街的起点——木茶寮（h≈0.96） ---- */
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
  /* v2 檐下斜撑 ×2（柱头到连檐） */
  var brL = box(0.028, 0.24, 0.028, M.woodD, -0.6, py + 0.42, 0.29);
  brL.rotation.x = -0.55; g.add(brL);
  var brR = box(0.028, 0.24, 0.028, M.woodD, 0.6, py + 0.42, 0.29);
  brR.rotation.x = -0.55; g.add(brR);
  /* v2 右壁百叶窗（参考图侧壁木百叶）：洞影 + 3 片百叶 */
  g.add(box(0.012, 0.17, 0.23, M.dark, 0.624, py + 0.18, -0.03));
  var k;
  for (k = 0; k < 3; k++) {
    var slw = box(0.014, 0.016, 0.2, M.wood, 0.634, py + 0.12 + k * 0.055, -0.03);
    slw.rotation.z = 0.5; g.add(slw);
  }
  /* v2 室内货架 + 茶罐 */
  g.add(box(0.52, 0.02, 0.16, M.wood, -0.05, py + 0.3, -0.35));
  g.add(cyl(0.035, 0.04, 0.09, 12, M.stoneD, 0.22, py + 0.355, -0.35));
  /* 檐下横枋 + 出挑连檐 */
  g.add(box(1.34, 0.06, 0.05, M.wood, 0, py + ph - 0.03, 0.38));
  /* 棕陶瓦四坡顶（v2 瓦垄 + 圆滚正脊，apex≈0.96） */
  var roof = brownHipRoof(M, { w: 1.42, d: 1.02, h: 0.28 });
  put(g, roof, 0, py + ph, -0.03);
  /* 廊下茶座 + 小凳（血脉件） */
  var tea = teaSet(M, 1.05); put(g, tea, -0.12, py, 0.02);
  /* v2 门口小凳 */
  g.add(cyl(0.05, 0.06, 0.028, 12, M.wood, -0.52, py + 0.114, 0.34));
  g.add(cyl(0.016, 0.02, 0.1, 12, M.woodD, -0.52, py + 0.05, 0.34));
  /* 吊灯笼 ×2（摆 + 呼吸；v2 金属件） */
  var lt = lantern(M, 0.68, anims, 0.7, 0.1); put(g, lt, 0.42, py + ph + 0.02, 0.3);
  var lt2 = lantern(M, 0.5, anims, 2.6, 0.08); put(g, lt2, -0.42, py + ph + 0.02, 0.26);
  /* 门口长凳 + 茶水缸 + 陶盆已在 pad */
  g.add(box(0.36, 0.03, 0.15, M.wood, 0.82, py + 0.115, 0.52));
  g.add(box(0.05, 0.1, 0.13, M.stoneD, 0.68, py + 0.05, 0.52));
  g.add(box(0.05, 0.1, 0.13, M.stoneD, 0.96, py + 0.05, 0.52));
  g.add(cyl(0.08, 0.095, 0.16, 12, M.stoneD, -0.85, py + 0.08, 0.35));
  g.add(cyl(0.075, 0.075, 0.02, 12, M.stoneD, -0.85, py + 0.17, 0.35));
  /* 踏步 */
  g.add(steps2(M, 0.52, 0, 1.0));
  /* 廊内暖光呼吸 */
  var glow = M.glowInner;
  anims.push(function (t) { glow.emissiveIntensity = 0.12 + 0.05 * sin(t * 1.2); });
  return g;
}

/* ---- lv2 洋房：长出奶油骑楼脸——双开间拱廊 + 雨棚 + 山花（h≈1.68） ---- */
function level2(M, anims) {
  var g = grp();
  g.name = 'qilouSlice';
  g.add(qPad(M, 2.35, 2.05));
  /* 底层骑楼廊（双开间，v2 keystone/柱础柱头/拱肩浮雕/檐枋阴影缝） */
  var col = colonnade(M, { w: 1.5, hCol: 0.42, bays: 2, zF: 0.46, interiorD: 0.52, rosettes: 1 });
  col.position.y = 0.05;
  g.add(col);
  var yTop = 0.05 + col.userData.yTop;             /* ≈0.81 檐口顶 */
  /* 二层楼身（奶油灰泥）+ 层间腰线 */
  g.add(box(1.54, 0.53, 0.86, M.stucco, 0, yTop + 0.265, -0.06));
  g.add(box(1.6, 0.035, 0.92, M.trim, 0, yTop + 0.017, -0.06));
  /* v2 阴阳面分档：窗后绿灰泥面板 + 上下框线（参考图 lv2 绿灰泥色带） */
  g.add(wallPanel(M, 1.3, 0.42, M.stuccoCel, 0, yTop + 0.27, 0.372));
  /* v2 角隅 quoin ×2（参考图鹑石色隅石） */
  g.add(quoins(M, 3, 0.15, -0.735, yTop + 0.05, 0.372));
  g.add(quoins(M, 3, 0.15, 0.735, yTop + 0.05, 0.372));
  /* 二层拱窗 ×3（绿/赭混色百叶，v2 keystone + 框线 + 逐片百叶） */
  var SH = shutPairs(M);
  var w1 = archWindow(M, 0.2, 0.28, SH.G, SH.O, 3); put(g, w1, -0.45, yTop + 0.14, 0.382);
  var w2 = archWindow(M, 0.24, 0.3, SH.T, SH.G, 3); put(g, w2, 0, yTop + 0.125, 0.382);
  var w3 = archWindow(M, 0.2, 0.28, SH.O, SH.G, 3); put(g, w3, 0.45, yTop + 0.14, 0.382);
  /* v2 二层瓶栏阳台（参考图：栏板在窗台前、雨棚之上） */
  g.add(box(1.62, 0.032, 0.2, M.stone, 0, yTop + 0.105, 0.46));
  var bal = balustrade(M, 1.48); put(g, bal, 0, yTop + 0.12, 0.53);
  /* 绿布扇贝雨棚（骑楼廊顶，v2 垂穗 + 微摆） */
  var awn = awningUnit(M, 1.58, 0.3, 0.11, 5, anims, 0.3, true);
  put(g, awn, 0, yTop + 0.055, 0.375);
  /* 巴洛克山花（白灰 + 涡卷卷眼 + 浮雕卷草 + cartouche + 双宝珠）+ 山后小青瓦坡顶 */
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
  /* v2 落水管（参考图侧角圆管） */
  g.add(cyl(0.012, 0.012, 0.56, 12, M.stoneD, 0.765, yTop + 0.26, -0.462));
  /* 廊内暖光呼吸 */
  var glow = M.glowInner;
  anims.push(function (t) { glow.emissiveIntensity = 0.12 + 0.05 * sin(t * 1.15 + 0.4); });
  return g;
}

/* ---- lv3 大厦：三层高骑楼——拱窗排 + 阳台 + 栏杆 + crown + 竖招（h≈2.17） ---- */
function level3(M, anims) {
  var g = grp();
  g.name = 'qilouTower';
  g.add(qPad(M, 2.45, 2.2));
  /* 底层骑楼廊（三开间，v2 keystone/柱础柱头/拱肩浮雕 ×2/檐枋阴影缝） */
  var col = colonnade(M, { w: 1.8, hCol: 0.5, bays: 3, zF: 0.52, interiorD: 0.58, rosettes: 2 });
  col.position.y = 0.05;
  g.add(col);
  var yTop = 0.05 + col.userData.yTop;             /* ≈0.835 檐口顶 */
  /* 二层楼身 + 腰线 */
  g.add(box(1.86, 0.46, 0.8, M.stucco, 0, yTop + 0.23, -0.06));
  g.add(box(1.92, 0.032, 0.86, M.trim, 0, yTop + 0.016, -0.06));
  /* v2 阴阳面分档：左右对称壁面板（窗与壁柱之间） */
  g.add(wallPanel(M, 0.18, 0.28, M.stuccoDk, -0.775, yTop + 0.23, 0.345));
  g.add(wallPanel(M, 0.18, 0.28, M.stuccoDk, 0.775, yTop + 0.23, 0.345));
  /* v2 角隅 quoin（嵌在既有壁柱前，参考图隅石双色） */
  g.add(quoins(M, 2, 0.19, -0.925, yTop + 0.14, 0.376));
  g.add(quoins(M, 2, 0.19, 0.925, yTop + 0.14, 0.376));
  /* 二层拱窗 ×3 + 花箱 ×2 */
  var SH = shutPairs(M);
  var a1 = archWindow(M, 0.2, 0.3, SH.G, SH.O, 3); put(g, a1, -0.52, yTop + 0.13, 0.353);
  var a2 = archWindow(M, 0.22, 0.32, SH.T, SH.R, 3); put(g, a2, 0, yTop + 0.12, 0.353);
  var a3 = archWindow(M, 0.2, 0.3, SH.O, SH.G, 3); put(g, a3, 0.52, yTop + 0.13, 0.353);
  /* v2 二层瓶栏阳台（参考图：全宽栏板在窗台前）+ 花箱上栏 */
  g.add(box(1.94, 0.032, 0.2, M.stone, 0, yTop + 0.105, 0.44));
  var bal1 = balustrade(M, 1.8); put(g, bal1, 0, yTop + 0.12, 0.51);
  var fb1 = flowerBox(M, 0.26); put(g, fb1, -0.52, yTop + 0.125, 0.4);
  var fb2 = flowerBox(M, 0.26); put(g, fb2, 0.52, yTop + 0.125, 0.4);
  /* 绿布扇贝雨棚（v2 垂穗 + 微摆） */
  var awn = awningUnit(M, 1.9, 0.32, 0.12, 6, anims, 0.9, true);
  put(g, awn, 0, yTop + 0.055, 0.38);
  /* 三层楼身（略收）+ 拱窗 ×3（v2 贴合墙面：0.333→0.248） */
  var y3 = yTop + 0.495;
  g.add(box(1.7, 0.42, 0.72, M.stucco, 0, y3 + 0.21, -0.12));
  g.add(box(1.76, 0.03, 0.78, M.trim, 0, y3 + 0.015, -0.12));
  g.add(wallPanel(M, 0.16, 0.24, M.stuccoDk, -0.7, y3 + 0.21, 0.245));
  g.add(wallPanel(M, 0.16, 0.24, M.stuccoDk, 0.7, y3 + 0.21, 0.245));
  var b1 = archWindow(M, 0.18, 0.26, SH.R, SH.T, 3); put(g, b1, -0.42, y3 + 0.12, 0.248);
  var b2 = archWindow(M, 0.18, 0.26, SH.O, SH.C, 3); put(g, b2, 0, y3 + 0.12, 0.248);
  var b3 = archWindow(M, 0.18, 0.26, SH.G, SH.O, 3); put(g, b3, 0.42, y3 + 0.12, 0.248);
  /* 角隅壁柱（通高两根） */
  g.add(box(0.075, y3 + 0.42 - yTop + 0.02, 0.055, M.trim, -0.925, (yTop + y3 + 0.42) / 2, 0.345));
  g.add(box(0.075, y3 + 0.42 - yTop + 0.02, 0.055, M.trim, 0.925, (yTop + y3 + 0.42) / 2, 0.345));
  /* 檐口（v2 檐口下凹影缝）+ 满宽白灰 crown（卷眼浮雕 + cartouche + 三宝珠）+ 两翼瓶栏 */
  var y4 = y3 + 0.44;
  g.add(box(1.8, 0.055, 0.8, M.trim, 0, y4 + 0.0275, -0.1));
  g.add(box(1.74, 0.02, 0.74, M.dark, 0, y4 - 0.012, -0.1));
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
  /* v2 落水管 */
  g.add(cyl(0.012, 0.012, 1.28, 12, M.stoneD, 0.925, 0.66, -0.412));
  /* 廊内暖光呼吸 */
  var glow = M.glowInner;
  anims.push(function (t) { glow.emissiveIntensity = 0.12 + 0.05 * sin(t * 1.1 + 0.8); });
  return g;
}

/* ---- lv4 地标：转角大茶楼——四开间骑楼 + 双层瓶栏阳台 + 金日 crown + 绿琉璃攒尖（h≈2.73） ---- */
function level4(M, anims) {
  var g = grp();
  g.name = 'qilouMansion';
  g.add(qPad(M, 2.5, 2.3));
  /* 底层骑楼廊（四开间，v2 keystone ×4/柱础柱头/拱肩浮雕 ×2/檐枋阴影缝） */
  var col = colonnade(M, { w: 2.1, hCol: 0.55, bays: 4, zF: 0.6, interiorD: 0.94, band: 0.04, rosettes: 3 });
  col.position.y = 0.05;
  g.add(col);
  var yTop = 0.05 + col.userData.yTop;             /* ≈0.86 檐口顶 */
  /* 二层楼身 + 挑阳台（白瓶栏 + 栏上盆栽）+ 拱窗 ×4 */
  g.add(box(2.14, 0.48, 0.9, M.stucco, 0, yTop + 0.24, -0.05));
  g.add(box(2.2, 0.034, 0.96, M.trim, 0, yTop + 0.017, -0.05));
  /* v2 角隅 quoin ×2（参考图鹑石色隅石列） */
  g.add(quoins(M, 3, 0.14, -1.03, yTop + 0.05, 0.403));
  g.add(quoins(M, 3, 0.14, 1.03, yTop + 0.05, 0.403));
  g.add(box(2.14, 0.04, 0.24, M.stone, 0, yTop + 0.035, 0.42));          /* 阳台板 */
  var bal1 = balustrade(M, 2.02); put(g, bal1, 0, yTop + 0.055, 0.51);
  var SH = shutPairs(M);
  var c1 = archWindow(M, 0.2, 0.3, SH.G, SH.O, 2); put(g, c1, -0.75, yTop + 0.14, 0.403);
  var c2 = archWindow(M, 0.2, 0.3, SH.T, SH.R, 2); put(g, c2, -0.25, yTop + 0.14, 0.403);
  var c3 = archWindow(M, 0.2, 0.3, SH.O, SH.G, 2); put(g, c3, 0.25, yTop + 0.14, 0.403);
  var c4 = archWindow(M, 0.2, 0.3, SH.C, SH.T, 2); put(g, c4, 0.75, yTop + 0.14, 0.403);
  var rp1 = potPlant(M, 0.55); put(g, rp1, -0.9, yTop + 0.055, 0.5);
  var rp2 = potPlant(M, 0.55); put(g, rp2, 0.9, yTop + 0.055, 0.5);
  /* 绿布扇贝雨棚（更宽，v2 微摆） */
  var awn = awningUnit(M, 2.2, 0.34, 0.13, 7, anims, 1.7, false);
  put(g, awn, 0, yTop + 0.095, 0.42);
  /* 三层楼身 + 阳台 + 拱窗 ×4（v2 贴合墙面：0.383→0.295） */
  var y3 = yTop + 0.525;
  g.add(box(2.0, 0.44, 0.8, M.stucco, 0, y3 + 0.22, -0.11));
  g.add(box(2.06, 0.03, 0.86, M.trim, 0, y3 + 0.015, -0.11));
  /* v2 层间绿釉浮雕条（参考图拱窗间绿釉饰板，居中窄条避免与窗框相撞） */
  g.add(wallPanel(M, 0.14, 0.3, M.relief, 0, y3 + 0.26, 0.298));
  g.add(box(2.0, 0.04, 0.22, M.stone, 0, y3 + 0.035, 0.4));
  var bal2 = balustrade(M, 1.9); put(g, bal2, 0, y3 + 0.055, 0.49);
  var d1 = archWindow(M, 0.19, 0.28, SH.R, SH.G, 2); put(g, d1, -0.7, y3 + 0.13, 0.295);
  var d2 = archWindow(M, 0.19, 0.28, SH.O, SH.T, 2); put(g, d2, -0.235, y3 + 0.13, 0.295);
  var d3 = archWindow(M, 0.19, 0.28, SH.T, SH.C, 2); put(g, d3, 0.235, y3 + 0.13, 0.295);
  var d4 = archWindow(M, 0.19, 0.28, SH.G, SH.O, 2); put(g, d4, 0.7, y3 + 0.13, 0.295);
  var rp4 = potPlant(M, 0.5); put(g, rp4, -0.85, y3 + 0.055, 0.48);
  var rp5 = potPlant(M, 0.5); put(g, rp5, 0.85, y3 + 0.055, 0.48);
  /* 主檐口（v2 檐口下凹影缝）+ 角隅宝瓶（v2 改小琉璃尖顶帽 + 金珠，参考图角亭帽） */
  var y4 = y3 + 0.475;
  g.add(box(2.2, 0.06, 0.96, M.trim, 0, y4 + 0.03, -0.02));
  g.add(box(2.12, 0.02, 0.88, M.dark, 0, y4 - 0.012, -0.02));
  [[-1.08, 0.42], [1.08, 0.42]].forEach(function (p) {
    g.add(cyl(0.001, 0.052, 0.07, 12, M.tileGDk, p[0], y4 + 0.095, p[1]));
    g.add(sph(0.018, M.gold, p[0], y4 + 0.145, p[1]));
  });
  /* 四层退台 + 拱窗 ×3（贴合墙面 0.273） */
  var y5 = y4 + 0.06;
  g.add(box(1.3, 0.36, 0.7, M.stucco, 0, y5 + 0.18, -0.08));
  var e1 = archWindow(M, 0.17, 0.23, SH.O, SH.G, 1); put(g, e1, -0.4, y5 + 0.1, 0.273);
  var e2 = archWindow(M, 0.17, 0.23, SH.T, SH.O, 1); put(g, e2, 0, y5 + 0.1, 0.273);
  var e3 = archWindow(M, 0.17, 0.23, SH.G, SH.C, 1); put(g, e3, 0.4, y5 + 0.1, 0.273);
  /* 金日纹 crown（v2 六道鎏金放射芒 + 绿釉方贴 + 浮雕章）+ 绿琉璃翘角攒尖顶（鎏金卷草 + 宝顶金环） */
  var ped = crownPediment(M, { w: 1.42, h: 0.24, depth: 0.09, urns: 2, sunburst: true });
  put(g, ped, 0, y5 + 0.36, 0.26);
  var roof = glazedCrownRoof(M, { w: 1.12, d: 0.62, rise: 0.22 });
  put(g, roof, 0, y5 + 0.37, -0.08);               /* 宝顶≈2.73 */
  /* v2 鎏金日纹呼吸（幅度 ≤0.25） */
  var gg = M.goldGlow;
  anims.push(function (t) { gg.emissiveIntensity = 0.22 + 0.12 * sin(t * 1.4); });
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
