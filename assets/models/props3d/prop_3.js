/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_3.js  (v2 精修版)
 * -------------------------------------------------------------------------------------
 * 格 3「烟袋斜街」(g1 胡同小筑) 独属建筑：京派胡同四阶生长史
 * 参考图 refs/prop_3.png 高保真复刻；v2 = 在已验收 v1 基础上的全局精修迭代
 * （保持整体形态/配色/布局/朝向/导出契约不变，仅加密细节层次）。
 *
 * 风格族谱（同一块地的同一种生长，v1 已验收不得推翻）：
 *   lv1 小屋   木瓦小屋 + 葫芦杆 + 长凳（h≈1.18）
 *   lv2 洋房   横向两开间：铺面 + 砖塔耳房，加披檐与檐廊（h≈1.70）
 *   lv3 大厦   三层退台 + 层层挑檐 + 高砖塔 + 立幌子（h≈2.13）
 *   lv4 地标   石台基 + 石狮朱门 + 两厢 + 歇山楼阁的完整宅院（h≈2.60）
 *
 * v2 精修语汇（对照参考图逐条落实）：
 *   1) 青陶瓦垄逐垄立体：主瓦面加半圆筒瓦垄（rolls）+ 檐口瓦当钉帽（drops）+
 *      檐角金珠收头（tips）；lv1 换参考图同款旧木瓦（shingle）纹理
 *   2) 青砖错缝砖缝分区：256px 错缝砖纹 + 砖塔四角砖柱（Quoins）+ 石砌裙脚 + 腰线分层
 *   3) 朱漆檐廊井字棂加密：竖棂间距 0.06 + 双道横枋成「井」字 + 端柱出头
 *   4) 白纸木格窗棂分格：竖棻×横格网格化；砖塔高窗白漆框 pane 样式
 *   5) 葫芦杆：葫芦加颈箍绑绳 + 杆头十字绑扎 + 挂绳（摆动动画保持）
 *   6) 石狮（lv4）：须弥座双层 + 颈鬃 + 绣球；新增门墩一对（石鼓）
 *   7) 灯笼：金盖 + 双道金箍 + 金穗（呼吸相位逐盏错开保持）
 *   8) 幌子竖排金字笔画：512px 竖排「烟袋斜街」描边+高光笔画 + 挂杆摆动
 *   9) 歇山宝顶层次：须弥座 + 仰莲金盘 + 顶珠 + 金尖（lv4）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[3] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（本轮上限 512px）；每级 mesh ≤350；userData.anim=[fn(t, dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_3] THREE 未定义，请先加载 three.min.js (r147)');
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
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}

/* ================= 1. 程序化 Canvas 纹理（≤512px，零外部资源） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}
function noise(g, S, n, light, dark) {
  for (var i = 0; i < n; i++) {
    g.fillStyle = (i % 3) ? light : dark;
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
}

/* 青陶瓦垄（v2 256px）：垄顶高光/垄间深影/接头错缝/竖向垄面高光 */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#4e5a68'; g.fillRect(0, 0, S, S);
  var rows = 14, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#5d6b7c' : '#525e6d';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#7c8a9e'; g.fillRect(0, y + 1, S, 3);
    g.fillStyle = '#39434f'; g.fillRect(0, y + rh - 4, S, 4);
    var off = (i % 2) ? S / 16 : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(40,48,58,0.6)'; g.fillRect(x, y + 2, 2, rh - 6);
      g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect((x + S / 16) % S, y + 4, 3, rh - 9);
    }
  }
  noise(g, S, 260, 'rgba(255,255,255,0.05)', 'rgba(20,26,34,0.09)');
  return toTex(cv, true);
}
/* 旧木瓦（v2 新增，lv1 参考图同款）：棕木横板 + 灰蓝石板补丁 + 错缝板缝 */
function texShingle() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#6b5138'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  var browns = ['#7a6046', '#69523b', '#74593f', '#5f4934'];
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    for (k = 0; k < 6; k++) {
      var x = k * (S / 6);
      var slate = ((i * 5 + k * 3) % 7 === 0) || ((i * 3 + k * 11) % 13 === 0);
      g.fillStyle = slate ? ((k + i) % 2 ? '#5b6672' : '#4f5a66') : browns[(i * 3 + k * 5) % 4];
      g.fillRect(x, y, S / 6, rh);
      g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(x + 1, y + 1, S / 6 - 2, 2);
      g.fillStyle = 'rgba(20,14,8,0.4)'; g.fillRect(x, y, 2, rh);
    }
    g.fillStyle = '#3a2d20'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = 'rgba(25,18,10,0.5)';
    g.fillRect(((i % 2) ? S / 12 : S / 3), y, 2, rh);
  }
  noise(g, S, 240, 'rgba(255,255,255,0.05)', 'rgba(15,10,5,0.1)');
  return toTex(cv, true);
}
/* 青砖墙（v2 256px）：错缝砖缝 + 每砖值域变化 + 白缝高光 */
function texBrick() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#39414c'; g.fillRect(0, 0, S, S);
  var rows = 14, rh = S / rows, bw = S / 5, i, k;
  var tones = ['#9aa1ab', '#949aa5', '#a0a6b0', '#8e95a0'];
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    var off = (i % 2) ? bw / 2 : 0;
    for (k = 0; k < 5; k++) {
      var x = (off + k * bw) % S;
      g.fillStyle = tones[(i * 3 + k * 7) % 4];
      g.fillRect(x + 1.5, y + 1.5, bw - 3, rh - 3);
      g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x + 3, y + 2, bw - 6, 2);
    }
  }
  noise(g, S, 200, 'rgba(255,255,255,0.05)', 'rgba(30,36,44,0.1)');
  return toTex(cv, true);
}
/* 暖白抹灰：细噪 + 抹痕（128px） */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#d9d2c2'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 200; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(120,110,90,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 立式招牌「烟袋斜街」（v2 512px）：黑漆木纹 + 双道金边 + 铜钉 + 金字描边高光笔画 */
function texSignV() {
  var w = 256, h = 512, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2f1e0e'; g.fillRect(0, 0, w, h);
  for (var i = 0; i < 42; i++) {
    g.fillStyle = 'rgba(0,0,0,' + (0.04 + (i % 3) * 0.03) + ')';
    g.fillRect((i * 6 + (i % 5) * 2) % w, 0, 1, h);
  }
  g.strokeStyle = '#d8a63c'; g.lineWidth = 8; g.strokeRect(9, 9, w - 18, h - 18);
  g.strokeStyle = 'rgba(216,166,60,0.5)'; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44);
  g.fillStyle = '#e7c56a';
  [[9, 9], [w - 9, 9], [9, h - 9], [w - 9, h - 9]].forEach(function (p) {
    g.beginPath(); g.arc(p[0], p[1], 3.2, 0, PI * 2); g.fill();
  });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 92px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '烟袋斜街', k;
  for (k = 0; k < 4; k++) {
    var x = w / 2, y = 92 + k * 112;
    g.fillStyle = '#140c05'; g.fillText(s[k], x + 4, y + 4);
    g.fillStyle = '#e7c56a'; g.fillText(s[k], x, y);
    g.fillStyle = 'rgba(255,240,190,0.4)'; g.fillText(s[k], x - 2, y - 2);
  }
  return toTex(cv, true);
}
/* 横式匾额「烟袋斜街」（v2 512px）：描边金字 + 角花 + 印章 */
function texPlaqueH() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#241608'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
  g.strokeStyle = 'rgba(216,166,60,0.45)'; g.lineWidth = 2; g.strokeRect(15, 15, w - 30, h - 30);
  g.fillStyle = '#d8a63c';
  [[6, 6], [w - 6, 6], [6, h - 6], [w - 6, h - 6]].forEach(function (p) {
    g.beginPath(); g.arc(p[0], p[1], 4, 0, PI * 2); g.fill();
  });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 72px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillStyle = '#140c05'; g.fillText('烟袋斜街', w / 2 + 3, h / 2 + 5);
  g.fillStyle = '#e7c56a'; g.fillText('烟袋斜街', w / 2, h / 2 + 2);
  g.fillStyle = 'rgba(255,240,190,0.4)'; g.fillText('烟袋斜街', w / 2 - 1.5, h / 2);
  g.fillStyle = '#a33b2a'; g.fillRect(w - 52, h / 2 - 14, 24, 28);
  g.fillStyle = '#e7c56a'; g.fillRect(w - 47, h / 2 - 9, 14, 18);
  return toTex(cv, true);
}
/* 横枋金字封板（v2 新增 lv4 二层）：红漆金字「日进斗金」 */
function texStripH() {
  var w = 512, h = 96, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#8e2e20'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 54px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '日进斗金', i;
  for (i = 0; i < 4; i++) {
    var x = 84 + i * 114;
    g.fillStyle = '#3a0e08'; g.fillText(s[i], x + 2, h / 2 + 3);
    g.fillStyle = '#e7c56a'; g.fillText(s[i], x, h / 2);
  }
  g.fillStyle = '#d8a63c';
  [141, 255, 369].forEach(function (x) {
    g.save(); g.translate(x, h / 2); g.rotate(PI / 4); g.fillRect(-4, -4, 8, 8); g.restore();
  });
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图取样；v2 增旧木瓦/白漆框/绑绳） */
function Mats() {
  return {
    roofSun:   MAT('p3roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.02, rough: 0.68 }); }),
    roofShade: MAT('p3roofShd', function () { var t = getTex('tile', texTile); return std('#aeb6c0', { map: t, bump: t, bumpScale: 0.02, rough: 0.74 }); }),
    shingleSun: MAT('p3shgSun', function () { var t = getTex('shingle', texShingle); return std('#ffffff', { map: t, bump: t, bumpScale: 0.022, rough: 0.82 }); }),
    shingleShd: MAT('p3shgShd', function () { var t = getTex('shingle', texShingle); return std('#b3a494', { map: t, bump: t, bumpScale: 0.022, rough: 0.86 }); }),
    ridge:     MAT('p3ridge', function () { return std('#333a46', { rough: 0.8 }); }),
    brick:     MAT('p3brick', function () { var t = getTex('brick', texBrick); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.9 }); }),
    brickDk:   MAT('p3brickDk', function () { return std('#9aa0aa', { rough: 0.9 }); }),
    plaster:   MAT('p3plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    frameW:    MAT('p3frameW', function () { return std('#e8e1d1', { rough: 0.85 }); }),
    lacq:      MAT('p3lacq', function () { return std('#b03a28', { rough: 0.55 }); }),
    lacqBr:    MAT('p3lacqBr', function () { return std('#c14430', { rough: 0.45 }); }),
    lacqDk:    MAT('p3lacqDk', function () { return std('#8e2e20', { rough: 0.62 }); }),
    wood:      MAT('p3wood', function () { return std('#7a5a38', { rough: 0.8 }); }),
    woodD:     MAT('p3woodD', function () { return std('#5a4430', { rough: 0.85 }); }),
    rope:      MAT('p3rope', function () { return std('#a5824e', { rough: 0.92 }); }),
    gold:      MAT('p3gold', function () { return std('#d8a63c', { rough: 0.35, metal: 0.75 }); }),
    stone:     MAT('p3stone', function () { return std('#aba79a', { rough: 0.9 }); }),
    stoneD:    MAT('p3stoneD', function () { return std('#8b877b', { rough: 0.92 }); }),
    grass:     MAT('p3grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p3grassD', function () { return std('#698f4c', { rough: 0.95 }); }),
    path:      MAT('p3path', function () { return std('#c6bca4', { rough: 0.95 }); }),
    ink:       MAT('p3ink', function () { return std('#2a2e33', { rough: 0.8 }); }),
    gourd:     MAT('p3gourd', function () { return std('#c8a84a', { rough: 0.5 }); }),
    gourdW:    MAT('p3gourdW', function () { return std('#d8cfa8', { rough: 0.45, emissive: '#ffd98a', ei: 0.3 }); }),
    paper:     MAT('p3paper', function () { return std('#efe8d8', { rough: 0.9, emissive: '#ffd98a', ei: 0.16 }); })
  };
}

/* ================= 2. 预制件（风格独有语汇） ================= */

/* 白纸木格窗（v2 分格）：木框/白框 + 纸面 + 竖棻×横格几何花格
 * o = { rows: 横格数, cols: 竖棻数, style: 'paper'|'pane'（白漆框十字格） } */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  var frameMat = (o.style === 'pane') ? M.frameW : M.woodD;
  var gridMat = (o.style === 'pane') ? M.wood : M.wood;
  g.add(box(w + 0.05, h + 0.05, 0.032, frameMat));
  g.add(box(w, h, 0.03, M.paper, 0, 0, 0.004));
  var rows = o.rows || 2, cols = o.cols || 2, i;
  for (i = 1; i < cols; i++) {
    g.add(box(0.026, h, 0.036, gridMat, -w / 2 + i * w / cols, 0, 0.009));
  }
  for (i = 1; i < rows; i++) {
    g.add(box(w, 0.024, 0.036, gridMat, 0, -h / 2 + i * h / rows, 0.009));
  }
  return g;
}

/* 朱漆木板门（v2 +门簪）：门洞阴影 + 朱门 + 金箍 + 门楣 + 双门簪 */
function woodDoor(M, w, h, y0) {
  var g = grp();
  g.add(box(w + 0.08, h + 0.05, 0.04, M.woodD, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.045, M.ink, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.92, h * 0.86, 0.05, M.lacqBr, 0, y0 + h / 2, 0.006));
  g.add(box(w * 0.92, 0.03, 0.052, M.gold, 0, y0 + h * 0.7, 0.012));
  g.add(box(w + 0.14, 0.06, 0.07, M.lacqDk, 0, y0 + h + 0.03, 0.008));
  var hl = cyl(0.014, 0.014, 0.024, 12, M.gold, -w * 0.28, y0 + h + 0.008, 0.046); hl.rotation.x = PI / 2; g.add(hl);
  var hr = cyl(0.014, 0.014, 0.024, 12, M.gold, w * 0.28, y0 + h + 0.008, 0.046); hr.rotation.x = PI / 2; g.add(hr);
  return g;
}

/* 街面柜台（v2 +货担加件）：内嵌店口 + 卧楹木板 + 台面货担 */
function shopCounter(M, w, y0) {
  var g = grp();
  g.add(box(w, 0.4, 0.05, M.ink, 0, y0 + 0.2));
  var i, n = 5;
  for (i = 0; i < n; i++) g.add(box(w / n - 0.012, 0.075, 0.02, M.wood, -w / 2 + (i + 0.5) * (w / n), y0 + 0.12, 0.03));
  g.add(box(w, 0.055, 0.16, M.woodD, 0, y0 + 0.22, 0.06));
  g.add(sph(0.045, M.gold, -w * 0.22, y0 + 0.29, 0.06));
  g.add(cyl(0.045, 0.055, 0.09, 12, M.gourd, w * 0.2, y0 + 0.29, 0.06));
  g.add(box(0.09, 0.05, 0.06, M.lacqDk, -w * 0.02, y0 + 0.285, 0.065));
  g.add(box(w + 0.06, 0.05, 0.06, M.lacq, 0, y0 + 0.46, 0.02));
  return g;
}

/* 红灯笼（v2 金盖+双金箍+金穗）：呼吸材质随 phase 共享，逐盏相位错开 */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p3lant' + (phase || 0), function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.036 * s, 0.05 * s, 0.035 * s, 12, M.gold, 0, 0.115 * s, 0));
  var body = sph(0.085 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.084 * s, 0.084 * s, 0.012 * s, 12, M.gold, 0, 0.025 * s, 0));
  g.add(cyl(0.084 * s, 0.084 * s, 0.012 * s, 12, M.gold, 0, -0.025 * s, 0));
  g.add(cyl(0.05 * s, 0.036 * s, 0.035 * s, 12, M.gold, 0, -0.105 * s, 0));
  g.add(cyl(0.007 * s, 0.007 * s, 0.055 * s, 12, M.lacqDk, 0, -0.145 * s, 0));
  var tas = cone(0.02 * s, 0.05 * s, 12, M.gold, 0, -0.195 * s, 0); tas.rotation.x = PI; g.add(tas);
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.2 + (phase || 0)); });
  return g;
}

/* 葫芦（v2 +颈箍绑绳）：双腹葫芦 + 缩颈 + 顶蒂 + 草绳箍 */
function gourdAt(M, s, mat) {
  var g = grp(); s = s || 1;
  var m = mat || M.gourd;
  g.add(cyl(0.008 * s, 0.008 * s, 0.05 * s, 12, M.woodD, 0, 0.055 * s, 0));
  g.add(sph(0.038 * s, m, 0, 0, 0));
  var bot = sph(0.06 * s, m, 0, -0.07 * s, 0); bot.scale.y = 0.9; g.add(bot);
  g.add(cyl(0.014 * s, 0.02 * s, 0.018 * s, 12, M.woodD, 0, 0.035 * s, 0));
  g.add(cyl(0.024 * s, 0.024 * s, 0.012 * s, 12, M.rope, 0, -0.024 * s, 0));
  return g;
}

/* 葫芦杆（v2 +挂绳+十字绑扎）：石础 + 立杆 + 横担 + 双葫芦（摆动动画保持） */
function gourdPole(M, h, anims, phase) {
  var g = grp();
  g.add(cyl(0.024, 0.032, 0.06, 12, M.stoneD, 0, 0.03, 0));
  g.add(cyl(0.018, 0.024, h, 12, M.woodD, 0, h / 2 + 0.05, 0));
  var armY = h * 0.82 + 0.05;
  g.add(box(0.42, 0.03, 0.03, M.woodD, 0.02, armY, 0));
  g.add(box(0.05, 0.03, 0.05, M.woodD, 0.2, armY + 0.03, 0));
  var b1 = box(0.09, 0.014, 0.014, M.rope, 0.02, armY + 0.024, 0); b1.rotation.z = 0.7; g.add(b1);
  var b2 = box(0.09, 0.014, 0.014, M.rope, 0.02, armY + 0.024, 0); b2.rotation.z = -0.7; g.add(b2);
  g.add(cyl(0.021, 0.021, 0.014, 12, M.rope, 0.02, armY - 0.03, 0));
  var swing = grp(); swing.position.set(0.14, armY - 0.02, 0); g.add(swing);
  var gs = Math.min(1, 0.75 + h * 0.3);
  var rope = cyl(0.006, 0.006, 0.05, 12, M.rope, 0, 0.045, 0); swing.add(rope);
  swing.add(gourdAt(M, gs));
  put(swing, gourdAt(M, gs * 0.8), 0.24, -0.02, 0.02);
  anims.push(function (t) { swing.rotation.z = sin(t * 1.3 + (phase || 0)) * 0.055; });
  return g;
}

/* 灰陶瓦坡顶（v2）：双坡瓦面 + 半圆筒瓦垄（rolls）+ 檐口瓦当（drops）+
 * 檐角金珠收头（tips）+ 黑瓦正脊 + 端头翘吻 + 朱漆封檐板
 * o.sunMat/o.shadeMat 可换瓦面材质（lv1 旧木瓦） */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var strips = o.strips !== undefined ? o.strips : 0;
  var sunMat = o.sunMat || M.roofSun, shadeMat = o.shadeMat || M.roofShade;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  var roofW = w + over * 2;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    var sm = (k > 0) ? sunMat : shadeMat;
    sg.add(box(roofW, 0.035, slopeLen, sm, 0, 0, k * slopeLen / 2));
    if (o.rolls) {                                              /* v2 筒瓦垄：沿坡半圆垄条（顶安全边距） */
      var rr = 0.02;
      var zStart = Math.max(0.09, (rr * 0.9 * cos(pitch) + 0.02) / sin(pitch));
      var zEnd = slopeLen - 0.03;
      var len = zEnd - zStart;
      if (len > 0.08) {
        var step = roofW / o.rolls;
        for (i = 0; i < o.rolls; i++) {
          var roll = cyl(rr, rr, len, 12, sm, -roofW / 2 + (i + 0.5) * step, 0.021, k * (zStart + len / 2));
          roll.rotation.x = PI / 2; sg.add(roll);
        }
      }
    } else {
      for (i = 0; i < strips; i++) {
        var u = (i + 0.5) / strips;
        sg.add(box(roofW - 0.04, 0.016, 0.03, M.ridge, 0, 0.026, k * u * eave));
      }
    }
    sg.add(box(roofW + 0.02, 0.05, 0.024, M.lacqDk, 0, -0.004, k * eave));
    if (o.drops && k > 0) {                                     /* v2 檐口瓦当钉帽（前坡） */
      var nd = o.drops, dstep = (roofW - 0.08) / (nd - 1);
      for (i = 0; i < nd; i++) {
        var dsk = cyl(0.021, 0.021, 0.02, 12, sm, -roofW / 2 + 0.04 + i * dstep, -0.014, slopeLen - 0.012);
        dsk.rotation.x = PI / 2; sg.add(dsk);
      }
    }
    var c1 = box(0.075, 0.05, 0.075, M.ridge, roofW / 2 - 0.01, 0.05, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.075, 0.05, 0.075, M.ridge, -(roofW / 2 - 0.01), 0.05, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
    if (o.tips) {                                               /* v2 檐角金珠收头 */
      sg.add(sph(0.016, M.gold, roofW / 2 - 0.01, 0.088, k * (eave - 0.045)));
      sg.add(sph(0.016, M.gold, -(roofW / 2 - 0.01), 0.088, k * (eave - 0.045)));
    }
  }
  if (o.gable !== false) {                                    /* 山墙封板（悬山） */
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plaster); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.0225); g.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plaster); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.0225); g.add(t2);
  }
  if (o.ridge !== false) {
    var rw = o.ridgeW || (roofW + 0.04);
    var ridgeMat = o.ridgeMat || M.ridge;
    g.add(box(rw, 0.06 + (o.big ? 0.02 : 0), 0.09, ridgeMat, 0, h + 0.03, 0));
    var f1 = box(0.06, 0.1 + (o.big ? 0.03 : 0), 0.08, ridgeMat, rw / 2 - 0.01, h + 0.1, 0);
    f1.rotation.z = 0.42; g.add(f1);
    var f2 = box(0.06, 0.1 + (o.big ? 0.03 : 0), 0.08, ridgeMat, -rw / 2 + 0.01, h + 0.1, 0);
    f2.rotation.z = -0.42; g.add(f2);
    if (o.big) {
      put(g, sph(0.032, M.gold), 0, h + 0.12, 0);
      g.add(box(0.032, 0.036, 0.052, M.gold, rw * 0.16, h + 0.052, 0));
      g.add(box(0.032, 0.036, 0.052, M.gold, -rw * 0.16, h + 0.052, 0));
    }
  }
  return g;
}

/* 歇山顶（lv4 顶，v2 宝顶层次+瓦垄+瓦当+金饰）：
 * 前后坡 + 左右坡 + 短正脊 + 四角大起翘金收头 + 须弥座宝顶（座-莲盘-顶珠-金尖） */
function sweepRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.72 + 0.2, 0.035, lenF, M.roofSun, 0, 0, lenF / 2));
  sgF.add(box(w * 0.72 + 0.22, 0.05, 0.024, M.lacqDk, 0, -0.004, eaveF));
  if (o.rolls !== 0) {                                          /* v2 前坡筒瓦垄 */
    var rr = 0.019, n = o.rolls || 7;
    var zStart = Math.max(0.09, (rr * 0.9 * cos(pitchF) + 0.02) / sin(pitchF));
    var zEnd = lenF - 0.03, len = zEnd - zStart;
    if (len > 0.08) {
      var span = w * 0.72 + 0.16, step = span / n;
      for (var i = 0; i < n; i++) {
        var roll = cyl(rr, rr, len, 12, M.roofSun, -span / 2 + (i + 0.5) * step, 0.02, zStart + len / 2);
        roll.rotation.x = PI / 2; sgF.add(roll);
      }
    }
  }
  if (o.drops !== 0) {                                          /* v2 前坡檐口瓦当 */
    var nd = o.drops || 9, spanW = w * 0.72 + 0.18, dstep = spanW / (nd - 1);
    for (var j = 0; j < nd; j++) {
      var dsk = cyl(0.02, 0.02, 0.018, 12, M.roofSun, -spanW / 2 + j * dstep, -0.013, lenF - 0.012);
      dsk.rotation.x = PI / 2; sgF.add(dsk);
    }
  }
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.72 + 0.2, 0.035, lenF, M.roofShade, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.035, d * 0.8, M.roofShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.035, d * 0.8, M.roofShade, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.08, 0.055, 0.08, M.ridge, c[0] * (eaveS - 0.02), 0.05, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.6; g.add(lift);
    put(g, sph(0.015, M.gold), c[0] * (eaveS - 0.02), 0.095, c[1] * (eaveF - 0.06));   /* v2 角珠收头 */
  });
  g.add(box(w * 0.5, 0.07, 0.09, M.ridge, 0, h + 0.035, 0));
  var f1 = box(0.06, 0.12, 0.08, M.ridge, w * 0.25, h + 0.1, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.06, 0.12, 0.08, M.ridge, -w * 0.25, h + 0.1, 0); f2.rotation.z = -0.4; g.add(f2);
  g.add(box(0.03, 0.034, 0.05, M.gold, w * 0.11, h + 0.052, 0));                    /* v2 脊上金饰 */
  g.add(box(0.03, 0.034, 0.05, M.gold, -w * 0.11, h + 0.052, 0));
  /* v2 宝顶层次：须弥座 → 鼓身 → 仰莲金盘 → 顶珠 → 金尖 */
  g.add(cyl(0.055, 0.065, 0.045, 12, M.ridge, 0, h + 0.09, 0));
  g.add(cyl(0.03, 0.042, 0.06, 12, M.ridge, 0, h + 0.135, 0));
  g.add(cyl(0.046, 0.028, 0.026, 12, M.gold, 0, h + 0.18, 0));
  g.add(sph(0.045, M.gold, 0, h + 0.24, 0));
  g.add(cone(0.014, 0.06, 12, M.gold, 0, h + 0.315, 0));
  return g;
}

/* 朱漆檐廊（v2 井字棂加密）：地栿 + 密排竖棂 + 双道横枋成「井」字 + 端柱出头 + 扶手 */
function balconyUnit(M, w) {
  var g = grp();
  g.add(box(w, 0.035, 0.2, M.lacqDk, 0, 0, 0.1));
  var n = Math.max(6, Math.round(w / 0.06)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.15, 0.016, M.lacq, -w / 2 + i * (w / n), 0.09, 0.185));
  }
  g.add(box(w, 0.02, 0.016, M.lacq, 0, 0.055, 0.185));
  g.add(box(w, 0.02, 0.016, M.lacq, 0, 0.125, 0.185));
  g.add(box(0.028, 0.19, 0.024, M.lacqDk, -w / 2 + 0.014, 0.11, 0.185));
  g.add(box(0.028, 0.19, 0.024, M.lacqDk, w / 2 - 0.014, 0.11, 0.185));
  g.add(box(w + 0.04, 0.03, 0.03, M.woodD, 0, 0.175, 0.185));
  return g;
}

/* 朱漆柱（金箍 + 石础） */
function column(M, h, r) {
  var g = grp();
  g.add(cyl(r * 1.35, r * 1.5, 0.045, 12, M.stoneD, 0, 0.022, 0));
  g.add(cyl(r, r, h, 12, M.lacqBr, 0, 0.045 + h / 2, 0));
  g.add(cyl(r * 1.18, r * 1.18, 0.028, 12, M.gold, 0, 0.045 + h * 0.82, 0));
  g.add(cyl(r * 1.22, r * 1.1, 0.04, 12, M.lacqDk, 0, 0.045 + h + 0.02, 0));
  return g;
}

/* 石狮（v2 须弥座+颈鬃+绣球）：基座两层 + 身 + 头 + 双耳 + 鬃领 + 绣球 */
function stoneLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.13 * s, 0.035 * s, 0.13 * s, M.stoneD, 0, 0.0175 * s, 0));
  g.add(box(0.11 * s, 0.03 * s, 0.11 * s, M.stone, 0, 0.05 * s, 0));
  var body = sph(0.05 * s, M.stone, 0, 0.105 * s, 0); body.scale.set(1, 0.9, 1.25); g.add(body);
  var mane = cyl(0.042 * s, 0.048 * s, 0.022 * s, 12, M.stone, 0, 0.145 * s, 0.022 * s);
  mane.rotation.x = 1.1; g.add(mane);
  g.add(sph(0.038 * s, M.stone, 0, 0.165 * s, 0.05 * s));
  var e1 = cone(0.014 * s, 0.03 * s, 12, M.stone, 0.022 * s, 0.2 * s, 0.05 * s); e1.rotation.z = -0.3; g.add(e1);
  var e2 = cone(0.014 * s, 0.03 * s, 12, M.stone, -0.022 * s, 0.2 * s, 0.05 * s); e2.rotation.z = 0.3; g.add(e2);
  g.add(sph(0.018 * s, M.stone, 0.048 * s, 0.038 * s, 0.07 * s));
  return g;
}

/* 石门墩（v2 新增）：底座 + 石鼓（迎面）+ 顶承石 */
function doorPier(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.09 * s, 0.032 * s, 0.15 * s, M.stoneD, 0, 0.016 * s, 0));
  var drum = cyl(0.045 * s, 0.045 * s, 0.04 * s, 12, M.stone, 0, 0.08 * s, 0.02 * s);
  drum.rotation.x = PI / 2; g.add(drum);
  var cap = cyl(0.02 * s, 0.02 * s, 0.008 * s, 12, M.stoneD, 0, 0.08 * s, 0.043 * s);
  cap.rotation.x = PI / 2; g.add(cap);
  g.add(box(0.07 * s, 0.026 * s, 0.1 * s, M.stone, 0, 0.115 * s, -0.01 * s));
  return g;
}

/* 草坪地坪（v2 石板小径 3 块错缝）：草面 + 草沿 + 石板小径 + 岩石 + 灌丛 */
function padUnit(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  var s1 = box(0.42, 0.014, 0.24, M.path, 0.01, 0.056, d / 2 - 0.22); s1.rotation.y = 0.05; g.add(s1);
  var s2 = box(0.34, 0.014, 0.2, M.path, -0.05, 0.056, d / 2 - 0.48); s2.rotation.y = -0.06; g.add(s2);
  var s3 = box(0.4, 0.014, 0.22, M.path, 0.04, 0.056, d / 2 - 0.72); s3.rotation.y = 0.04; g.add(s3);
  var rock1 = mesh(new THREE.DodecahedronGeometry(0.055, 0), M.stoneD); put(g, rock1, size / 2 - 0.28, 0.07, d / 2 - 0.3);
  var rock2 = mesh(new THREE.DodecahedronGeometry(0.04, 0), M.stoneD); put(g, rock2, -size / 2 + 0.32, 0.06, -d / 2 + 0.34);
  var bush1 = mesh(new THREE.IcosahedronGeometry(0.09, 0), M.grassD); put(g, bush1, -size / 2 + 0.26, 0.12, d / 2 - 0.3);
  bush1.scale.y = 0.8;
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：旧木瓦小屋 + 葫芦杆 + 长凳（h≈1.18，带上限 1.2 内不得加顶饰） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.35, 2.35));
  /* 台基 + 墙体 */
  g.add(box(1.3, 0.09, 1.02, M.stoneD, -0.08, 0.045, -0.05));
  g.add(box(1.08, 0.56, 0.82, M.plaster, -0.08, 0.37, -0.05));
  /* 四角木柱 + 前檐枋 */
  [[-0.66, -0.42], [0.5, -0.42], [-0.66, 0.32], [0.5, 0.32]].forEach(function (c) {
    g.add(box(0.06, 0.56, 0.06, M.woodD, c[0], 0.37, c[1]));
  });
  g.add(box(1.22, 0.07, 0.06, M.wood, -0.08, 0.68, 0.38));
  /* 门（偏左）+ 木格窗（右）+ 门口石阶 */
  var door = woodDoor(M, 0.26, 0.36, 0.09); put(g, door, -0.32, 0, 0.355);
  var win = latticeWindow(M, 0.24, 0.26, { rows: 2, cols: 2 }); put(g, win, 0.18, 0.44, 0.375);
  g.add(box(0.4, 0.045, 0.2, M.stoneD, -0.32, 0.115, 0.42));
  /* 门口木箱堆（参考图） */
  g.add(box(0.14, 0.12, 0.12, M.wood, 0.06, 0.15, 0.5));
  g.add(box(0.11, 0.09, 0.1, M.woodD, 0.07, 0.255, 0.51));
  /* 悬山旧木瓦顶（参考图 lv1 为旧木板瓦：木滚正脊、无筒瓦垄/瓦当；apex≈1.02 带内禁顶饰） */
  var roof = tileRoof(M, { w: 1.1, d: 0.86, h: 0.32, strips: 4, big: false,
    sunMat: M.shingleSun, shadeMat: M.shingleShd, ridgeMat: M.woodD });
  put(g, roof, -0.08, 0.7, -0.05);
  /* 山墙斜撑 + 右侧壁木格窗（参考图木框架构与侧窗） */
  var br1 = box(0.03, 0.2, 0.03, M.woodD, 0.462, 0.5, -0.32); br1.rotation.x = 0.6; g.add(br1);
  var br2 = box(0.03, 0.2, 0.03, M.woodD, 0.462, 0.5, 0.22); br2.rotation.x = -0.6; g.add(br2);
  var winS = latticeWindow(M, 0.2, 0.22, { rows: 2, cols: 2 }); winS.rotation.y = PI / 2; put(g, winS, 0.462, 0.42, -0.05);
  /* 门侧灯笼 ×2（参考图左右檐角各一） */
  var lt = lantern(M, 0.72, anims, 0.5); put(g, lt, -0.02, 0.6, 0.42);
  var lt2 = lantern(M, 0.6, anims, 2.6); put(g, lt2, 0.56, 0.6, 0.4);
  /* 葫芦杆（左前） */
  var pole = gourdPole(M, 0.72, anims, 1.4); put(g, pole, -0.98, 0.03, 0.55);
  /* 长凳 + 水缸（加沿口） */
  g.add(box(0.4, 0.035, 0.16, M.wood, 0.72, 0.15, 0.5));
  g.add(box(0.05, 0.13, 0.14, M.stoneD, 0.56, 0.085, 0.5));
  g.add(box(0.05, 0.13, 0.14, M.stoneD, 0.88, 0.085, 0.5));
  g.add(cyl(0.07, 0.085, 0.15, 12, M.brickDk, -0.9, 0.14, -0.4));
  g.add(cyl(0.09, 0.08, 0.03, 12, M.brickDk, -0.9, 0.225, -0.4));
  /* 短篱笆（右前，v2 双道横杆） */
  var i;
  for (i = 0; i < 3; i++) g.add(box(0.035, 0.2, 0.035, M.wood, 0.55 + i * 0.16, 0.16, 0.92));
  g.add(box(0.42, 0.025, 0.03, M.woodD, 0.71, 0.22, 0.92));
  g.add(box(0.42, 0.02, 0.03, M.woodD, 0.71, 0.13, 0.92));
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：两开间（铺面 + 砖塔耳房）+ 披檐 + 檐廊（h≈1.70） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.2));
  /* 铺面主间（左）：台基 + 两层墙 */
  g.add(box(1.42, 0.1, 1.0, M.stoneD, -0.38, 0.05, -0.05));
  g.add(box(1.3, 0.62, 0.9, M.plaster, -0.38, 0.41, -0.05));       /* 铺面层 0.10-0.72 */
  g.add(box(1.34, 0.05, 0.94, M.wood, -0.38, 0.745, -0.04));       /* 二层楼板 */
  g.add(box(1.3, 0.5, 0.84, M.plaster, -0.38, 1.02, -0.05));       /* 二层墙 0.77-1.27 */
  /* 砖塔耳房（右）：塔基 + 塔身 + v2 石裙脚/四角砖柱（错缝分区） */
  g.add(box(0.78, 0.06, 0.92, M.stoneD, 0.56, 0.08, -0.12));
  g.add(box(0.74, 1.1, 0.88, M.brick, 0.56, 0.66, -0.12));         /* 0.11-1.21 */
  g.add(box(0.8, 0.12, 0.94, M.stoneD, 0.56, 0.17, -0.12));
  [[0.19, 0.315], [0.93, 0.315], [0.19, -0.555], [0.93, -0.555]].forEach(function (c) {
    g.add(box(0.05, 1.1, 0.05, M.stone, c[0], 0.66, c[1]));
  });
  /* 塔顶小阁气窗（白框暗窗，参考图塔壁高窗） */
  g.add(box(0.18, 0.2, 0.03, M.frameW, 0.56, 1.06, 0.325));
  g.add(box(0.12, 0.14, 0.02, M.ink, 0.56, 1.06, 0.342));
  /* 铺面门脸：朱门 + 柜台 + 朱柱 */
  var door = woodDoor(M, 0.3, 0.4, 0.1); put(g, door, -0.82, 0, 0.44);
  var counter = shopCounter(M, 0.62, 0.1); put(g, counter, -0.2, 0, 0.44);
  var cL = column(M, 0.52, 0.032); put(g, cL, -0.52, 0.1, 0.47);
  var cR = column(M, 0.52, 0.032); put(g, cR, 0.14, 0.1, 0.47);
  /* 二层：檐廊（井字）+ 开窗木格 + 支开的木板护窗（参考图）+ 隔门 */
  var balc = balconyUnit(M, 1.2); put(g, balc, -0.38, 0.79, 0.42);
  var w1 = latticeWindow(M, 0.26, 0.28, { rows: 2, cols: 2 }); put(g, w1, -0.66, 1.04, 0.385);
  var w2 = latticeWindow(M, 0.26, 0.28, { rows: 2, cols: 2 }); put(g, w2, -0.1, 1.04, 0.385);
  var sh1 = box(0.035, 0.26, 0.02, M.wood, -0.52, 1.04, 0.4); sh1.rotation.y = 0.5; g.add(sh1);
  var sh2 = box(0.035, 0.26, 0.02, M.wood, -0.24, 1.04, 0.4); sh2.rotation.y = -0.5; g.add(sh2);
  g.add(box(0.22, 0.34, 0.04, M.woodD, 0.32, 1.0, 0.385));
  g.add(box(1.36, 0.06, 0.06, M.lacqDk, -0.38, 1.28, 0.44));       /* 廊楣 */
  /* 披檐（铺面顶）+ 主瓦顶（v2 筒瓦垄+瓦当）+ 塔顶小悬山（筒瓦垄） */
  var awn = tileRoof(M, { w: 1.34, d: 0.5, h: 0.14, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, awn, -0.38, 0.8, 0.16);
  var main = tileRoof(M, { w: 1.28, d: 0.98, h: 0.24, strips: 3, big: false, rolls: 8, drops: 9, tips: true });
  put(g, main, -0.38, 1.3, -0.05);                                  /* apex≈1.60 */
  var tRoof = tileRoof(M, { w: 0.7, d: 0.84, h: 0.18, strips: 2, big: false, rolls: 5, tips: true });
  put(g, tRoof, 0.56, 1.23, -0.12);                                 /* apex≈1.46 */
  /* 灯笼 ×2（廊楣下）+ 塔壁白框木格高窗 + 塔身花箱 */
  var l1 = lantern(M, 0.66, anims, 0.8); put(g, l1, -1.0, 1.2, 0.5);
  var l2 = lantern(M, 0.66, anims, 2.1); put(g, l2, 0.24, 1.2, 0.5);
  var tw1 = latticeWindow(M, 0.17, 0.2, { rows: 2, cols: 2, style: 'pane' }); tw1.rotation.y = PI / 2; put(g, tw1, 0.945, 0.95, -0.12);
  var tw2 = latticeWindow(M, 0.15, 0.18, { rows: 2, cols: 2, style: 'pane' }); put(g, tw2, 0.56, 0.62, 0.335);
  g.add(box(0.26, 0.06, 0.1, M.woodD, 0.56, 0.42, 0.34));
  var fb1 = mesh(new THREE.IcosahedronGeometry(0.045, 0), M.grassD); put(g, fb1, 0.49, 0.48, 0.34);
  var fb2 = mesh(new THREE.IcosahedronGeometry(0.035, 0), M.grassD); put(g, fb2, 0.63, 0.47, 0.34);
  /* 葫芦杆 + 街面货桌（参考图）+ 盆栽 */
  var pole = gourdPole(M, 1.05, anims, 1.1); put(g, pole, -1.06, 0.03, 0.6);
  g.add(box(0.26, 0.028, 0.18, M.wood, 0.55, 0.22, 0.8));
  g.add(box(0.03, 0.2, 0.16, M.woodD, 0.45, 0.11, 0.8));
  g.add(box(0.03, 0.2, 0.16, M.woodD, 0.65, 0.11, 0.8));
  g.add(cyl(0.035, 0.042, 0.07, 12, M.gourd, 0.5, 0.27, 0.8));
  g.add(sph(0.035, M.ink, 0.62, 0.26, 0.8));
  g.add(cyl(0.06, 0.075, 0.1, 12, M.brickDk, 1.02, 0.1, 0.62));
  var bush = mesh(new THREE.IcosahedronGeometry(0.075, 0), M.grassD); put(g, bush, 1.02, 0.2, 0.62); bush.scale.y = 0.85;
  g.add(cyl(0.05, 0.06, 0.08, 12, M.brickDk, -1.12, 0.09, -0.6));
  var bush2 = mesh(new THREE.IcosahedronGeometry(0.06, 0), M.grassD); put(g, bush2, -1.12, 0.17, -0.6);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}

/* ---- lv3 大厦：三层退台 + 层层挑檐 + 高砖塔 + 立幌子（h≈2.13） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  /* 高砖塔（右后）：整高青砖 + v2 裙脚/四角砖柱/两道腰线 + 白缝高窗 + 塔顶压檐 + 花箱 */
  g.add(box(0.88, 0.08, 0.96, M.stoneD, 0.66, 0.09, -0.24));
  g.add(box(0.84, 1.8, 0.92, M.brick, 0.66, 1.03, -0.24));         /* 0.13-1.93 */
  g.add(box(0.9, 0.12, 0.98, M.stoneD, 0.66, 0.19, -0.24));
  [[0.24, 0.215], [1.08, 0.215], [0.24, -0.695], [1.08, -0.695]].forEach(function (c) {
    g.add(box(0.05, 1.8, 0.05, M.stone, c[0], 1.03, c[1]));
  });
  g.add(box(0.88, 0.045, 0.96, M.ridge, 0.66, 0.72, -0.24));
  g.add(box(0.88, 0.045, 0.96, M.ridge, 0.66, 1.36, -0.24));
  g.add(box(0.9, 0.05, 0.98, M.ridge, 0.66, 1.955, -0.24));
  var tw1 = latticeWindow(M, 0.16, 0.2, { rows: 2, cols: 2, style: 'pane' }); tw1.rotation.y = PI / 2; put(g, tw1, 1.09, 1.5, -0.24);
  var tw2 = latticeWindow(M, 0.16, 0.2, { rows: 2, cols: 2, style: 'pane' }); tw2.rotation.y = PI / 2; put(g, tw2, 1.09, 0.86, -0.24);
  var tw3 = latticeWindow(M, 0.16, 0.2, { rows: 2, cols: 2, style: 'pane' }); put(g, tw3, 0.66, 1.72, 0.245);
  var tw4 = latticeWindow(M, 0.16, 0.2, { rows: 2, cols: 2, style: 'pane' }); put(g, tw4, 0.66, 1.06, 0.245);
  /* 前楼三层退台（左） */
  var fx = -0.34;
  g.add(box(1.56, 0.1, 1.0, M.stoneD, fx, 0.05, 0));
  g.add(box(1.44, 0.52, 0.9, M.plaster, fx, 0.36, 0));             /* 一层 0.10-0.62 */
  g.add(box(1.6, 0.045, 1.04, M.lacqDk, fx, 0.645, 0));
  g.add(box(1.3, 0.48, 0.84, M.plaster, fx, 0.89, -0.02));         /* 二层 0.65-1.13 */
  g.add(box(1.42, 0.045, 0.94, M.lacqDk, fx, 1.155, -0.02));
  g.add(box(1.14, 0.44, 0.78, M.plaster, fx, 1.395, -0.04));       /* 三层 1.175-1.615 */
  /* 一层门脸：朱门 + 柜台 + 朱柱 + 立幌子（v2 挂杆+摆动） */
  var door = woodDoor(M, 0.3, 0.42, 0.1); put(g, door, fx - 0.52, 0, 0.47);
  var counter = shopCounter(M, 0.6, 0.1); put(g, counter, fx + 0.18, 0, 0.47);
  var cL = column(M, 0.5, 0.032); put(g, cL, fx - 0.16, 0.1, 0.5);
  var cR = column(M, 0.5, 0.032); put(g, cR, fx + 0.56, 0.1, 0.5);
  var sign = grp();                                                 /* 原点=吊挂点，摆动绕杆 */
  sign.add(cyl(0.008, 0.008, 0.045, 12, M.ink, 0, -0.022, 0));
  sign.add(box(0.2, 0.5, 0.05, M.lacqDk, 0, -0.30, 0));
  var sp = mesh(new THREE.PlaneGeometry(0.15, 0.42),
    new THREE.MeshStandardMaterial({ map: getTex('signV', texSignV), roughness: 0.6, metalness: 0.05, flatShading: true }));
  sp.position.set(0, -0.30, 0.046); sign.add(sp);
  put(g, sign, fx + 0.72, 0.68, 0.47);
  g.add(box(0.024, 0.02, 0.13, M.lacqDk, fx + 0.72, 0.675, 0.41));  /* 挑檐支臂（吊挂幌子） */
  anims.push(function (t) { sign.rotation.z = sin(t * 1.5 + 0.5) * 0.07; });
  /* 二层/三层：檐廊（井字）+ 木格窗 + 支开护窗 */
  var b2 = balconyUnit(M, 1.24); put(g, b2, fx, 0.68, 0.42);
  var b3 = balconyUnit(M, 1.06); put(g, b3, fx, 1.2, 0.38);
  var w21 = latticeWindow(M, 0.24, 0.26, { rows: 2, cols: 2 }); put(g, w21, fx - 0.28, 0.94, 0.42);
  var w22 = latticeWindow(M, 0.24, 0.26, { rows: 2, cols: 2 }); put(g, w22, fx + 0.3, 0.94, 0.42);
  var sh21 = box(0.035, 0.24, 0.02, M.wood, fx - 0.15, 0.94, 0.425); sh21.rotation.y = 0.5; g.add(sh21);
  var sh22 = box(0.035, 0.24, 0.02, M.wood, fx - 0.41, 0.94, 0.425); sh22.rotation.y = -0.5; g.add(sh22);
  var w31 = latticeWindow(M, 0.22, 0.24, { rows: 2, cols: 2 }); put(g, w31, fx - 0.2, 1.38, 0.385);
  var w32 = latticeWindow(M, 0.22, 0.24, { rows: 2, cols: 2 }); put(g, w32, fx + 0.24, 1.38, 0.385);
  var sh31 = box(0.032, 0.22, 0.02, M.wood, fx - 0.08, 1.38, 0.39); sh31.rotation.y = 0.5; g.add(sh31);
  var sh32 = box(0.032, 0.22, 0.02, M.wood, fx - 0.32, 1.38, 0.39); sh32.rotation.y = -0.5; g.add(sh32);
  /* 层层挑檐 + 顶层主瓦顶（v2 筒瓦垄+瓦当+角金珠+脊金饰，屋顶完全展开） */
  var a1 = tileRoof(M, { w: 1.46, d: 0.6, h: 0.15, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, a1, fx, 0.67, 0.14);
  var a2 = tileRoof(M, { w: 1.3, d: 0.56, h: 0.14, strips: 2, ridge: false, over: 0.08, gable: false });
  put(g, a2, fx, 1.18, 0.12);
  var main = tileRoof(M, { w: 1.1, d: 0.9, h: 0.32, strips: 4, big: true, rolls: 8, drops: 9, tips: true });
  put(g, main, fx, 1.64, -0.04);                                    /* apex≈2.04 */
  /* 灯笼：一层檐下 ×2 + 二层 ×2（金盖金穗，相位错开） */
  var l1 = lantern(M, 0.6, anims, 0.6); put(g, l1, fx - 0.74, 0.56, 0.52);
  var l2 = lantern(M, 0.6, anims, 1.9); put(g, l2, fx + 0.5, 0.56, 0.52);
  var l3 = lantern(M, 0.55, anims, 2.8); put(g, l3, fx - 0.6, 1.06, 0.48);
  var l4 = lantern(M, 0.55, anims, 4.0); put(g, l4, fx + 0.4, 1.06, 0.48);
  /* 葫芦杆 + 塔顶花箱（v2 加沿口双株）+ 爬藤杆（参考图右）+ 街面茶桌 + 盆栽 */
  var pole = gourdPole(M, 1.32, anims, 1.2); put(g, pole, -1.1, 0.03, 0.62);
  g.add(box(0.3, 0.07, 0.12, M.woodD, 0.66, 2.0, 0.3));
  g.add(box(0.34, 0.02, 0.15, M.wood, 0.66, 2.04, 0.3));
  var fb = mesh(new THREE.IcosahedronGeometry(0.05, 0), M.grassD); put(g, fb, 0.58, 2.08, 0.3);
  var fb2 = mesh(new THREE.IcosahedronGeometry(0.04, 0), M.grassD); put(g, fb2, 0.74, 2.07, 0.3);
  var vStick = cyl(0.012, 0.016, 0.9, 12, M.woodD, 1.16, 0.55, 0.12); vStick.rotation.z = -0.06; g.add(vStick);
  var v1 = mesh(new THREE.IcosahedronGeometry(0.05, 0), M.grassD); put(g, v1, 1.13, 0.42, 0.13);
  var v2 = mesh(new THREE.IcosahedronGeometry(0.042, 0), M.grassD); put(g, v2, 1.19, 0.68, 0.11);
  var v3 = mesh(new THREE.IcosahedronGeometry(0.046, 0), M.grassD); put(g, v3, 1.12, 0.92, 0.13);
  var v4 = mesh(new THREE.IcosahedronGeometry(0.036, 0), M.grassD); put(g, v4, 1.17, 1.08, 0.11);
  g.add(box(0.3, 0.03, 0.2, M.wood, 0.15, 0.22, 0.85));
  g.add(box(0.03, 0.2, 0.17, M.woodD, 0.04, 0.11, 0.85));
  g.add(box(0.03, 0.2, 0.17, M.woodD, 0.26, 0.11, 0.85));
  g.add(sph(0.038, M.ink, 0.12, 0.27, 0.85));
  g.add(cyl(0.014, 0.02, 0.05, 12, M.ink, 0.19, 0.265, 0.85));
  g.add(cyl(0.06, 0.075, 0.1, 12, M.brickDk, 0.98, 0.1, 0.78));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, bush, 0.98, 0.2, 0.78); bush.scale.y = 0.85;
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.15 + 0.6); });
  return g;
}

/* ---- lv4 地标：石台基 + 石狮门墩朱门 + 两厢 + 歇山楼阁（h≈2.60，带内 ≤3.0） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.4));
  /* 石台基 + 垂带踏步 */
  g.add(box(2.06, 0.17, 1.56, M.stone, 0, 0.085, -0.02));
  g.add(box(2.14, 0.05, 1.62, M.stoneD, 0, 0.025, -0.02));
  g.add(box(0.62, 0.07, 0.18, M.stoneD, 0, 0.195, 0.86));
  g.add(box(0.5, 0.06, 0.16, M.stoneD, 0, 0.26, 0.76));
  /* 石狮一对（v2 须弥座+鬃+绣球）+ v2 石门墩一对 */
  put(g, stoneLion(M, 1.15), -0.46, 0.17, 0.72);
  put(g, stoneLion(M, 1.15), 0.46, 0.17, 0.72);
  put(g, doorPier(M, 1.1), -0.72, 0.17, 0.66);
  put(g, doorPier(M, 1.1), 0.72, 0.17, 0.66);
  /* 朱门（金钉门簪）+ 门楣匾额（v2 512px 金字描边） */
  var gate = grp(); put(g, gate, 0, 0.17, 0.6);
  var cGL = column(M, 0.46, 0.035); put(gate, cGL, -0.36, 0.0, 0.06);
  var cGR = column(M, 0.46, 0.035); put(gate, cGR, 0.36, 0.0, 0.06);
  gate.add(box(0.3, 0.42, 0.05, M.lacqBr, -0.155, 0.21, 0.0));
  gate.add(box(0.3, 0.42, 0.05, M.lacqBr, 0.155, 0.21, 0.0));
  [-0.23, -0.08, 0.08, 0.23].forEach(function (x) {
    gate.add(sph(0.016, M.gold, x, 0.3, 0.03));
    gate.add(sph(0.016, M.gold, x, 0.16, 0.03));
  });
  gate.add(box(0.94, 0.09, 0.07, M.lacqDk, 0, 0.47, 0.03));         /* 门楣 */
  var hl = cyl(0.016, 0.016, 0.026, 12, M.gold, -0.2, 0.482, 0.07); hl.rotation.x = PI / 2; gate.add(hl);
  var hr = cyl(0.016, 0.016, 0.026, 12, M.gold, 0.2, 0.482, 0.07); hr.rotation.x = PI / 2; gate.add(hr);
  var plq = mesh(new THREE.PlaneGeometry(0.56, 0.14),
    new THREE.MeshStandardMaterial({ map: getTex('plaqueH', texPlaqueH), roughness: 0.6, metalness: 0.05, flatShading: true }));
  plq.position.set(0, 0.47, 0.072); gate.add(plq);                  /* 匾额「烟袋斜街」 */
  /* 两厢（左右各一间，自覆小悬山 v2 筒瓦垄） */
  [[-1], [1]].forEach(function (s) {
    var wx = s[0] * 0.88;
    g.add(box(0.54, 0.05, 0.94, M.stoneD, wx, 0.195, -0.18));
    g.add(box(0.5, 0.44, 0.9, M.brick, wx, 0.41, -0.18));           /* 0.19-0.63 */
    var wr = tileRoof(M, { w: 0.46, d: 0.86, h: 0.16, strips: 0, big: false, rolls: 4, tips: true });
    put(g, wr, wx, 0.62, -0.18);
    var ww = latticeWindow(M, 0.18, 0.2, { rows: 2, cols: 2 }); put(g, ww, wx + s[0] * 0.16, 0.43, 0.295);
  });
  /* 中央楼阁：一层堂 + 腰檐（v2 筒瓦垄+瓦当）+ 二层廊（金字封板）+ 顶阁歇山 */
  g.add(box(1.16, 0.64, 0.94, M.plaster, 0, 0.51, -0.18));          /* 0.19-0.83 */
  var c1 = column(M, 0.5, 0.034); put(g, c1, -0.42, 0.17, 0.34);
  var c2 = column(M, 0.5, 0.034); put(g, c2, 0.42, 0.17, 0.34);
  var c3 = column(M, 0.5, 0.034); put(g, c3, -0.14, 0.17, 0.36);
  var c4 = column(M, 0.5, 0.034); put(g, c4, 0.14, 0.17, 0.36);
  var w1 = latticeWindow(M, 0.2, 0.24, { rows: 2, cols: 2 }); put(g, w1, -0.28, 0.55, 0.315);
  var w2 = latticeWindow(M, 0.2, 0.24, { rows: 2, cols: 2 }); put(g, w2, 0.28, 0.55, 0.315);
  var waist = tileRoof(M, { w: 1.06, d: 0.72, h: 0.2, strips: 2, big: false, rolls: 6, drops: 8, tips: true });
  put(g, waist, 0, 0.83, -0.18);                                    /* 腰檐 apex≈1.03 */
  g.add(box(0.98, 0.5, 0.84, M.lacq, 0, 1.19, -0.18));              /* 二层廊 0.94-1.44 */
  var strip = box(0.9, 0.075, 0.026, M.lacqDk, 0, 1.42, 0.245);     /* v2 金字封板 */
  var stripP = mesh(new THREE.PlaneGeometry(0.84, 0.06),
    new THREE.MeshStandardMaterial({ map: getTex('stripH', texStripH), roughness: 0.6, metalness: 0.05, flatShading: true }));
  stripP.position.set(0, 1.42, 0.271); g.add(strip); g.add(stripP);
  var b2 = balconyUnit(M, 0.92); put(g, b2, 0, 0.94, 0.26);
  var w3 = latticeWindow(M, 0.2, 0.22, { rows: 2, cols: 2 }); put(g, w3, -0.22, 1.26, 0.255);
  var w4 = latticeWindow(M, 0.2, 0.22, { rows: 2, cols: 2 }); put(g, w4, 0.22, 1.26, 0.255);
  var l3a = lantern(M, 0.52, anims, 0.9); put(g, l3a, -0.52, 0.92, 0.34);
  var l3b = lantern(M, 0.52, anims, 2.3); put(g, l3b, 0.52, 0.92, 0.34);
  g.add(box(0.86, 0.42, 0.76, M.lacqBr, 0, 1.66, -0.18));           /* 顶阁 1.45-1.87 */
  for (var bi = 0; bi < 5; bi++) {                                  /* v2 檐下斗拱一排 */
    var bx = -0.32 + bi * 0.16;
    g.add(box(0.075, 0.03, 0.055, M.lacqDk, bx, 1.868, 0.225));
    g.add(box(0.05, 0.026, 0.045, M.gold, bx, 1.9, 0.24));
  }
  var top = sweepRoof(M, { w: 0.84, d: 0.78, h: 0.38, rolls: 7, drops: 9 });
  put(g, top, 0, 1.88, -0.18);                                      /* 宝顶≈2.60 */
  /* 门口灯笼 ×2 + 葫芦灯杆（左，白膜葫芦灯 + 摆动 + 绑绳） */
  var l1 = lantern(M, 0.66, anims, 0.3); put(g, l1, -0.66, 0.62, 0.6);
  var l2 = lantern(M, 0.66, anims, 1.7); put(g, l2, 0.66, 0.62, 0.6);
  var gl = grp(); put(g, gl, -1.08, 0.03, 0.55);
  gl.add(cyl(0.024, 0.032, 0.07, 12, M.stoneD, 0, 0.035, 0));
  gl.add(cyl(0.02, 0.026, 1.42, 12, M.woodD, 0, 0.78, 0));
  gl.add(box(0.4, 0.032, 0.032, M.woodD, 0.03, 1.42, 0));
  var gb1 = box(0.09, 0.014, 0.014, M.rope, 0.03, 1.444, 0); gb1.rotation.z = 0.7; gl.add(gb1);
  var gb2 = box(0.09, 0.014, 0.014, M.rope, 0.03, 1.444, 0); gb2.rotation.z = -0.7; gl.add(gb2);
  var glSwing = grp(); glSwing.position.set(0.18, 1.4, 0); gl.add(glSwing);
  glSwing.add(cyl(0.006, 0.006, 0.05, 12, M.rope, 0, 0.045, 0));
  glSwing.add(gourdAt(M, 1.15, M.gourdW));
  var gourdGlow = M.gourdW;
  anims.push(function (t) {
    glSwing.rotation.z = sin(t * 1.15 + 0.8) * 0.06;
    gourdGlow.emissiveIntensity = 0.3 + 0.12 * sin(t * 1.9 + 0.4);
  });
  /* 盆栽 ×2（v2 加主杆，踏步两侧） */
  g.add(cyl(0.065, 0.08, 0.11, 12, M.brickDk, -0.86, 0.28, 0.8));
  g.add(cyl(0.012, 0.016, 0.1, 12, M.woodD, -0.86, 0.4, 0.8));
  var pb1 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.grassD); put(g, pb1, -0.86, 0.47, 0.8); pb1.scale.y = 0.85;
  g.add(cyl(0.065, 0.08, 0.11, 12, M.brickDk, 0.86, 0.28, 0.8));
  g.add(cyl(0.012, 0.016, 0.1, 12, M.woodD, 0.86, 0.4, 0.8));
  var pb2 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.grassD); put(g, pb2, 0.86, 0.47, 0.8); pb2.scale.y = 0.85;
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.05 + 1.2); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[3] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_3_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 3;
  g.userData.level = lv;
  g.userData.region = 'g1';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
