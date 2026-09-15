/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_33.js  (v2 精修版)
 * -------------------------------------------------------------------------------------
 * 格 33「铜锣湾」(g7 东方之珠) 独属建筑：港式高密度垂直商楼四阶生长史
 * 参考图 refs/prop_33.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；v2 全局精修迭代：
 * 纹理 256px 重绘 / 霓虹灯管描边+扫光 / 暖窗逐格分档+窗台 / 空调外机散热格栅+
 * 滴水管 / 绿帆布雨棚垂边+撑杆 / 女儿墙压顶 / 石狮卷毛鬃+绣球 / 绿釉瓦垄纹理+
 * 正脊吻兽+吻珠 / 鱼骨天线四层加密 / 灯笼金箍+檐角垂串 / 屋顶水箱爬梯+双坡铁皮棚）。
 *
 * 风格族谱（同一块地的同一种生长——铜锣湾唐楼基因，v1 布局与配色基调不变）：
 *   lv1 小屋   锈铁皮双坡棚屋 + 四层鱼骨天线 + 暖窗 + 石板径木凳柴堆（h≈1.21）
 *   lv2 洋房   两层木构唐楼 storefront：绿瓦楞坡顶 + 琥珀扇贝披棚×2 + 竖招霓虹三连
 *              + 檐廊花箱 + 空调外机 + 红灯笼对 + 果蔬档（h≈1.69）
 *   lv3 大厦   五层混凝土 walk-up：密集暖光窗格（逐格分档）+ 绿帆布雨棚排（垂边）
 *              + 空调外机排 + 女儿墙压顶 + 支腿钢水箱（爬梯）+ 双坡铁皮棚
 *              + 竖招霓虹四连柱（h≈2.28）
 *   lv4 地标   四重绿釉瓦金脊塔式商楼：红漆木廊层 + 檐下灯笼排 + 檐角灯笼垂串
 *              + 左右竖招阵列 + 粉紫横霓虹「銅鑼灣」+ 石狮鬃毛绣球金匾石阶（h≈2.97）
 *
 * 独有语汇（自参考图提炼，四阶贯穿）：竖排霓虹招牌阵列（逐级加密、灯管描边、
 * 扫光）、绿色系屋顶（铁皮锈→瓦楞绿→混凝土平顶绿棚→绿釉瓦金脊）、扇贝边布艺
 * 披棚、空调外机、红灯笼、鱼骨天线/水箱屋顶线、石板地坪+草缘+盆栽。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[33] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤512px）；每级 mesh ≤350；userData.anim=[fn(t, dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_33] THREE 未定义，请先加载 three.min.js (r147)');
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

/* ================= 1. 程序化 Canvas 纹理（≤512px，零外部资源；v2 重绘加密） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 锈棕瓦楞铁皮 256px：垄线明暗 + 竖向压缝 + 锈流渍 + 板缝高光（lv1 屋面） */
function texCorrugRust() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#8a6a48'; g.fillRect(0, 0, S, S);
  var rows = 16, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#947452' : '#7e5f40';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#5c4430'; g.fillRect(0, y + rh - 5, S, 5);
    g.fillStyle = '#a4866a'; g.fillRect(0, y + 1, S, 3);
    for (k = 0; k < 4; k++) {                                        /* 垄间竖向压缝 */
      g.fillStyle = 'rgba(50,36,24,0.5)';
      g.fillRect(((i * 61) + k * 64 + (i % 2) * 32) % S, y, 2, rh);
    }
  }
  for (i = 0; i < 14; i++) {                                         /* 竖向锈流双笔 */
    var x = (i * 47 + 11) % S, y0 = (i * 29) % 60;
    g.fillStyle = 'rgba(96,52,28,' + (0.2 + (i % 3) * 0.08) + ')';
    g.fillRect(x, y0, 3, 70 + (i * 23) % 140);
    g.fillStyle = 'rgba(70,38,20,0.16)';
    g.fillRect(x + 4, y0 + 12, 2, 50 + (i * 13) % 90);
  }
  for (i = 0; i < 420; i++) {
    g.fillStyle = (i % 3) ? 'rgba(150,90,50,0.10)' : 'rgba(40,26,16,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  for (k = 0; k < 4; k++) {                                          /* 大板缝 + 高光 */
    g.fillStyle = 'rgba(60,44,30,0.45)'; g.fillRect((k * 64 + 20) % S, 0, 3, S);
    g.fillStyle = 'rgba(180,150,110,0.22)'; g.fillRect((k * 64 + 23) % S, 0, 2, S);
  }
  return toTex(cv, true);
}
/* 风化竖板木墙 256px：错缝板 + 钉眼 + 横向木纹（lv1/lv2 墙体） */
function texPlank() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#4a352a'; g.fillRect(0, 0, S, S);
  var n = 12, pw = S / n;
  for (i = 0; i < n; i++) {
    g.fillStyle = (i % 2) ? '#54402c' : '#42301f';
    g.fillRect(i * pw, 0, pw - 3, S);
    g.fillStyle = '#2c1f16'; g.fillRect(i * pw + pw - 3, 0, 3, S);
    g.fillStyle = 'rgba(120,90,60,0.25)';
    g.fillRect(i * pw + 2, (i * 31) % S, 2, S);
    for (k = 0; k < 3; k++) {                                        /* 板间钉眼 */
      g.fillStyle = 'rgba(24,16,10,0.7)';
      g.fillRect(i * pw + pw * 0.5 + ((k * 13) % 9) - 4, 22 + k * 84 + (i * 17) % 20, 2, 2);
    }
  }
  for (i = 0; i < 200; i++) {                                        /* 横向木纹擦痕 */
    g.fillStyle = (i % 3) ? 'rgba(0,0,0,0.10)' : 'rgba(200,170,130,0.06)';
    g.fillRect((i * 43) % S, (i * 61) % S, 4, 2);
  }
  return toTex(cv, true);
}
/* 绿灰瓦楞坡顶 256px（lv2 屋面） */
function texGreenCorrug() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#7d8f6c'; g.fillRect(0, 0, S, S);
  var rows = 14, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#879a74' : '#71835f';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#556747'; g.fillRect(0, y + rh - 4, S, 4);
    g.fillStyle = '#9db188'; g.fillRect(0, y + 1, S, 3);
  }
  for (i = 0; i < 14; i++) {                                         /* 竖向垄缝 */
    g.fillStyle = 'rgba(40,54,32,0.4)';
    g.fillRect((i * 19 + 5) % S, 0, 2, S);
    g.fillStyle = 'rgba(220,235,200,0.10)';
    g.fillRect((i * 19 + 7) % S, 0, 2, S);
  }
  for (i = 0; i < 260; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(30,44,24,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 混凝土墙 256px：灰调斑驳 + 竖向污痕 + 模板对拉螺栓点阵（lv3 楼身） */
function texConcrete() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#8a8d86'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 12; i++) {                                         /* 竖向水渍 */
    var x = (i * 19 + 7) % S;
    g.fillStyle = 'rgba(70,76,72,0.22)';
    g.fillRect(x, (i * 23) % 40, 3 + (i % 3), 90 + (i * 13) % 130);
  }
  for (var r = 0; r < 4; r++) for (var c = 0; c < 4; c++) {          /* 模板螺栓点阵 */
    g.fillStyle = 'rgba(58,62,58,0.5)';
    g.fillRect(28 + c * 64, 30 + r * 64, 3, 3);
  }
  for (i = 0; i < 380; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(52,58,54,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 琥珀条纹披棚布 256px + 织纹（lv2 扇贝棚面） */
function texAwningAmber() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#e0a048'; g.fillRect(0, 0, S, S);
  var n = 7, sw = S / n;
  for (i = 0; i < n; i++) {
    if (i % 2) { g.fillStyle = '#c88438'; g.fillRect(i * sw, 0, sw, S); }
    g.fillStyle = 'rgba(255,235,190,0.35)'; g.fillRect(i * sw, 0, 2, S);
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,240,200,0.08)' : 'rgba(120,70,20,0.07)';
    g.fillRect((i * 29) % S, (i * 41) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 绿帆布雨棚布 256px（白细条纹 + 织纹；lv3/lv4 棚面） */
function texCanvasGreen() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#4f7a55'; g.fillRect(0, 0, S, S);
  var n = 7, sw = S / n;
  for (i = 0; i < n; i++) {
    if (i % 2) { g.fillStyle = '#43684a'; g.fillRect(i * sw, 0, sw, S); }
    g.fillStyle = 'rgba(235,245,230,0.5)'; g.fillRect(i * sw, 0, 3, S);
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = 'rgba(20,40,24,0.10)';
    g.fillRect((i * 31) % S, (i * 47) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 绿釉筒瓦垄 256px：行垄 + 釉面高光 + 筒瓦竖缝（lv4 塔冠屋面） */
function texGlaze() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#2c6a48'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#31744f' : '#286344';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#439162'; g.fillRect(0, y + 1, S, 3);             /* 釉面高光 */
    g.fillStyle = '#1a4a33'; g.fillRect(0, y + rh - 4, S, 4);        /* 行间落影 */
  }
  for (i = 0; i < 16; i++) {                                         /* 筒瓦竖缝 */
    var x = i * 16 + 8;
    g.fillStyle = 'rgba(18,58,38,0.55)'; g.fillRect(x, 0, 3, S);
    g.fillStyle = 'rgba(130,210,160,0.18)'; g.fillRect(x + 3, 0, 2, S);
  }
  for (i = 0; i < 140; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(10,40,26,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 空调外机散热面 64px：百叶格栅 + 风扇罩同心圆（lv2/lv3 外机） */
function texAcGrille() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#96968c'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 4; i++) {
    g.fillStyle = '#6e6e66'; g.fillRect(5, 5 + i * 8, S - 10, 3);
    g.fillStyle = '#bcbcb2'; g.fillRect(5, 4 + i * 8, S - 10, 1);
  }
  var cx = S / 2, cy2 = S * 0.74;
  g.strokeStyle = '#5a5a52'; g.lineWidth = 2;
  g.beginPath(); g.arc(cx, cy2, 10, 0, PI * 2); g.stroke();
  g.beginPath(); g.arc(cx, cy2, 5, 0, PI * 2); g.stroke();
  g.beginPath(); g.moveTo(cx - 10, cy2); g.lineTo(cx + 10, cy2);
  g.moveTo(cx, cy2 - 10); g.lineTo(cx, cy2 + 10); g.stroke();
  return toTex(cv, true);
}
/* 竖排霓虹字牌 128×512：彩底 + 金内框 + 描边金字（金描边+亮色填充）+ 双侧灯珠列 */
function texNeonV(text, bg, fg, frame) {
  var w = 128, h = 512, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = frame; g.fillRect(0, 0, w, h);
  g.fillStyle = bg; g.fillRect(9, 9, w - 18, h - 18);
  g.strokeStyle = '#d8a850'; g.lineWidth = 3; g.strokeRect(15, 15, w - 30, h - 30);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 92px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var n = text.length, step = (h - 104) / n, i;
  for (i = 0; i < n; i++) {
    var y = 56 + step * (i + 0.5);
    g.strokeStyle = '#d8a850'; g.lineWidth = 12; g.strokeText(text[i], w / 2, y);  /* 描边金字 */
    g.fillStyle = fg; g.fillText(text[i], w / 2, y);
  }
  g.fillStyle = 'rgba(255,255,255,0.9)';                             /* 霓虹灯珠双侧列 */
  var dots = 5 + n * 2;
  for (i = 0; i < dots; i++) {
    var dy = 28 + i * ((h - 56) / (dots - 1));
    g.beginPath(); g.arc(19, dy, 4, 0, PI * 2); g.fill();
    g.beginPath(); g.arc(w - 19, dy, 4, 0, PI * 2); g.fill();
  }
  return toTex(cv, true);
}
/* 横式发光匾 512×128：彩底 + 描边金字 + 边珠灯（lv4 横招 / 店招 / 金匾共用工厂） */
function texBoardH(text, bg, fg, frame, glow) {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = frame; g.fillRect(0, 0, w, h);
  g.fillStyle = bg; g.fillRect(9, 9, w - 18, h - 18);
  g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(17, 17, w - 34, h - 34);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 74px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.strokeStyle = '#d8a850'; g.lineWidth = 9; g.strokeText(text, w / 2, h / 2 + 3); /* 描边金字 */
  g.fillStyle = fg; g.fillText(text, w / 2, h / 2 + 3);
  if (glow) {
    g.fillStyle = 'rgba(255,255,255,0.5)';
    for (var i = 0; i < 16; i++) { g.beginPath(); g.arc(26 + i * 31, 10, 3, 0, PI * 2); g.fill(); g.beginPath(); g.arc(26 + i * 31, h - 10, 3, 0, PI * 2); g.fill(); }
  }
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图分区取样；釉瓦/格栅 v2 新增贴图分区） */
function Mats() {
  return {
    corrug:    MAT('p33corrug', function () { var t = getTex('corrug', texCorrugRust); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.8 }); }),
    plank:     MAT('p33plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.86 }); }),
    greenCorr: MAT('p33greenCorr', function () { var t = getTex('greenCorr', texGreenCorrug); return std('#ffffff', { map: t, bump: t, bumpScale: 0.015, rough: 0.7 }); }),
    concSun:   MAT('p33concSun', function () { var t = getTex('conc', texConcrete); return std('#ffffff', { map: t, rough: 0.9 }); }),
    concShade: MAT('p33concShd', function () { var t = getTex('conc', texConcrete); return std('#b9bdb6', { map: t, rough: 0.92 }); }),
    glazeSun:  MAT('p33glazeSun', function () { var t = getTex('glaze', texGlaze); var m = std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.4, metal: 0.06 }); m.side = THREE.DoubleSide; return m; }),
    glazeShd:  MAT('p33glazeShd', function () { var t = getTex('glaze', texGlaze); var m = std('#9db3a6', { map: t, bump: t, bumpScale: 0.012, rough: 0.46, metal: 0.06 }); m.side = THREE.DoubleSide; return m; }),
    woodD:     MAT('p33woodD', function () { return std('#3c2c20', { rough: 0.82 }); }),
    wood:      MAT('p33wood', function () { return std('#54402c', { rough: 0.8 }); }),
    awnAmber:  MAT('p33awnAmber', function () { var t = getTex('awnA', texAwningAmber); return std('#ffffff', { map: t, rough: 0.72 }); }),
    awnGreen:  MAT('p33awnGreen', function () { var t = getTex('awnG', texCanvasGreen); return std('#ffffff', { map: t, rough: 0.75 }); }),
    gold:      MAT('p33gold', function () { return std('#d8a850', { rough: 0.35, metal: 0.75 }); }),
    lacq:      MAT('p33lacq', function () { return std('#6a2c20', { rough: 0.5 }); }),
    lacqBr:    MAT('p33lacqBr', function () { return std('#7e3a28', { rough: 0.45 }); }),
    steel:     MAT('p33steel', function () { return std('#7a95a0', { rough: 0.55, metal: 0.3 }); }),
    acGrey:    MAT('p33ac', function () { return std('#a8a8a0', { rough: 0.6 }); }),
    acGrille:  MAT('p33acg', function () { var t = getTex('acg', texAcGrille); return std('#ffffff', { map: t, rough: 0.55, metal: 0.12 }); }),
    ink:       MAT('p33ink', function () { return std('#24201c', { rough: 0.8 }); }),
    stone:     MAT('p33stone', function () { return std('#b0a893', { rough: 0.92 }); }),
    stoneD:    MAT('p33stoneD', function () { return std('#988f7a', { rough: 0.93 }); }),
    grass:     MAT('p33grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p33grassD', function () { return std('#699048', { rough: 0.95 }); }),
    pave:      MAT('p33pave', function () { return std('#b8b09a', { rough: 0.94 }); }),
    warm:      MAT('p33warm', function () { return std('#ffd98a', { rough: 0.6, emissive: '#ffcf7a', ei: 0.42 }); }),
    crate:     MAT('p33crate', function () { return std('#8a6a45', { rough: 0.85 }); }),
    sweep:     MAT('p33sweep', function () {
      var m = new THREE.MeshStandardMaterial({ color: C('#ffffff'), emissive: C('#fff3c0'), emissiveIntensity: 0.7, transparent: true, opacity: 0.28, roughness: 0.4, depthWrite: false });
      return m;
    })
  };
}

/* ================= 2. 预制件（铜锣湾独有语汇 · v2 细化） ================= */

/* 暖光窗（v2 逐格分档）：深木框 + 内透光板 + 竖横窗棂 (cols×rows 分格) + 石窗台 */
function warmWindow(M, w, h, cols, rows) {
  cols = cols || 2; rows = rows || 2;
  var g = grp(), i;
  g.add(box(w, h, 0.03, M.woodD));
  g.add(box(w - 0.05, h - 0.05, 0.034, M.warm, 0, 0, 0.006));
  for (i = 1; i < cols; i++) g.add(box(0.022, h - 0.06, 0.04, M.woodD, -w / 2 + (w * i) / cols, 0, 0.008));
  for (i = 1; i < rows; i++) g.add(box(w - 0.06, 0.02, 0.04, M.woodD, 0, -h / 2 + (h * i) / rows, 0.008));
  g.add(box(w + 0.04, 0.024, 0.07, M.stoneD, 0, -h / 2 - 0.013, 0.016));   /* 窗台压板 */
  return g;
}

/* 竖排霓虹字牌（v2）：铁框盒 + 双面金字板 + 四边霓光管描边 + 自下而上扫光条 */
function neonSign(M, text, bg, fg, w, h, anims, phase) {
  var g = grp();
  g.add(box(w + 0.04, h + 0.04, 0.05, M.ink));
  var tex = getTex('nv' + text + bg, function () { return texNeonV(text, bg, fg, '#24201c'); });
  var mat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: tex, emissive: C('#ffffff'), emissiveMap: tex,
    emissiveIntensity: 0.72, roughness: 0.45, flatShading: true
  });
  var p1 = mesh(new THREE.PlaneGeometry(w, h), mat); p1.position.z = 0.031; g.add(p1);
  var p2 = mesh(new THREE.PlaneGeometry(w, h), mat); p2.position.z = -0.031; p2.rotation.y = PI; g.add(p2);
  /* 霓光管描边框（四边发光管，读作缠绕灯管） */
  var tm = MAT('p33tube' + fg, function () { return std(fg, { rough: 0.38, metal: 0.05, emissive: fg, ei: 0.8 }); });
  var tw = 0.016, tz = 0.031;
  g.add(box(w, tw, 0.022, tm, 0, h / 2 - tw / 2, tz));
  g.add(box(w, tw, 0.022, tm, 0, -h / 2 + tw / 2, tz));
  g.add(box(tw, h - tw * 2, 0.022, tm, -w / 2 + tw / 2, 0, tz));
  g.add(box(tw, h - tw * 2, 0.022, tm, w / 2 - tw / 2, 0, tz));
  /* 扫光条：字面自下而上扫过（低透明白条，扫出即隐，克制） */
  var bar = mesh(new THREE.BoxGeometry(Math.max(0.05, w - 0.06), 0.05, 0.006), M.sweep);
  bar.position.z = 0.036; g.add(bar);
  var travel = Math.max(0.04, h - 0.16);
  anims.push(function (t) { mat.emissiveIntensity = 0.62 + 0.22 * sin(t * 1.7 + (phase || 0)); });
  anims.push(function (t) { tm.emissiveIntensity = 0.7 + 0.18 * sin(t * 1.7 + (phase || 0)); });
  anims.push(function (t) {
    var u = ((t * 0.32 + (phase || 0) * 0.13) % 1 + 1) % 1;
    bar.position.y = -travel / 2 + travel * u;
    bar.visible = u < 0.72;            /* 一个周期内 72% 时间可见 */
  });
  return g;
}

/* 横式发光匾：框 + 发光字板（512×128 高清描边金字） */
function boardSign(M, text, bg, fg, frame, w, h, glow, ei) {
  var g = grp();
  /* v1 遗症修复：frame 传入的是 hex 字符串，字符串材质会被渲染器静默丢弃（框体不可见），
   * v2 统一转成缓存 MeshStandardMaterial，金匾/店招框体真正上屏 */
  var fm = (typeof frame === 'string')
    ? MAT('p33bfrm' + frame, function () { return std(frame, { rough: (frame === '#d8a850' ? 0.35 : 0.6), metal: (frame === '#d8a850' ? 0.75 : 0) }); })
    : frame;
  g.add(box(w + 0.05, h + 0.05, 0.045, fm));
  var tex = getTex('bh' + text + bg, function () { return texBoardH(text, bg, fg, '#1c1814', glow); });
  var mat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: tex, emissive: C('#ffffff'), emissiveMap: tex,
    emissiveIntensity: (ei !== undefined ? ei : 0.5), roughness: 0.5, flatShading: true
  });
  var p = mesh(new THREE.PlaneGeometry(w, h), mat); p.position.z = 0.028; g.add(p);
  g.userData.mat = mat;
  return g;
}

/* 扇贝边披棚：斜棚板 + 布纹 + 半圆垂弧排（铜锣湾布艺签名件，v2 加前缘垂条） */
function scallopAwning(M, w, proj, mat, nScallop, yTilt) {
  var g = grp();
  var tilt = (yTilt !== undefined ? yTilt : 0.5);
  var board = box(w, 0.028, proj, mat);
  board.rotation.x = tilt;
  board.position.z = proj * 0.42;
  g.add(board);
  var r = w / (nScallop * 2), i;
  var scGeo = new THREE.CylinderGeometry(r, r, 0.03, 10, 1, false, 0, PI);
  for (i = 0; i < nScallop; i++) {
    var sc = mesh(scGeo, mat);
    sc.rotation.x = PI / 2;
    sc.rotation.z = PI;
    sc.position.set(-w / 2 + r + i * 2 * r, -proj * sin(tilt) * 0.5 - r * 0.4, proj * 0.84);
    g.add(sc);
  }
  /* 前缘垂边布条（扇贝上方一道，遮挡板缝） */
  var val = box(w - 0.02, proj * 0.34, 0.014, mat, 0, -proj * sin(tilt) * 0.5 + proj * 0.1, proj * 0.82);
  val.rotation.x = 0.1; g.add(val);
  return g;
}

/* 素面斜雨棚（v2 新增）：斜棚板 + 前缘垂边（lv3 窗棚排） */
function flatAwning(M, w, proj, mat, tilt) {
  var g = grp();
  var b = box(w, 0.02, proj, mat);
  b.rotation.x = tilt; b.position.z = proj * 0.42;
  g.add(b);
  var v = box(w, proj * 0.4, 0.013, mat, 0, -proj * sin(tilt) * 0.5 - proj * 0.17, proj * 0.82);
  v.rotation.x = 0.1; g.add(v);
  return g;
}

/* 空调外机（v2）：灰壳 + 散热格栅面（百叶+风扇罩贴图） + 侧百叶 + 滴水管 */
function acUnit(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.2 * s, 0.14 * s, 0.13 * s, M.acGrey));
  g.add(box(0.16 * s, 0.1 * s, 0.014, M.acGrille, 0, 0, 0.068 * s));
  g.add(box(0.018 * s, 0.11 * s, 0.01, M.ink, 0.096 * s, 0, 0));
  g.add(cyl(0.007 * s, 0.007 * s, 0.1 * s, 6, M.steel, -0.075 * s, -0.115 * s, 0.03 * s));
  return g;
}

/* 鱼骨天线（v2 加密）：立杆 + 四层横担（每层端对振子） + 延长段 + 顶杆顶珠 */
function antennaHK(M, h, anims, phase) {
  var g = grp();
  g.add(cyl(0.011, 0.015, h, 6, M.woodD, 0, h / 2, 0));
  var top = grp(); top.position.set(0, h, 0); g.add(top);
  var i;
  var arms = [[-0.114, 0.36], [-0.064, 0.3], [-0.014, 0.24], [0.036, 0.19]];
  for (i = 0; i < 4; i++) {
    var y = arms[i][0], wA = arms[i][1];
    top.add(box(wA, 0.013, 0.013, M.woodD, 0, y, 0));
    top.add(box(0.013, 0.013, 0.05, M.woodD, -wA / 2 + 0.02, y, 0));
    top.add(box(0.013, 0.013, 0.05, M.woodD, wA / 2 - 0.02, y, 0));
  }
  top.add(box(0.02, 0.15, 0.02, M.woodD, 0, -0.02, 0));               /* 延长立柱 */
  top.add(cyl(0.006, 0.006, 0.06, 5, M.steel, 0, 0.075, 0));
  top.add(sph(0.008, M.lacq, 0, 0.1, 0));                             /* 顶珠 */
  anims.push(function (t) { top.rotation.z = sin(t * 1.05 + (phase || 0)) * 0.026; });
  return g;
}

/* 红灯笼：金盖 + 红壳 + 金腰箍（v2，noRib 可省） + 穗（材质按相位桶共享，3-4 mesh） */
function lanternHK(M, s, anims, phase, noRib) {
  var g = grp(); s = s || 1;
  var pk = String(Math.round((phase || 0) * 10) % 10);
  var bm = MAT('p33lant' + pk, function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.032 * s, 0.045 * s, 0.03 * s, 10, M.gold, 0, 0.1 * s, 0));
  var body = sph(0.078 * s, bm, 0, 0, 0); body.scale.y = 0.86; g.add(body);
  if (!noRib) {
    var rib = mesh(new THREE.TorusGeometry(0.078 * s, 0.006 * s, 5, 12), M.gold);
    rib.rotation.x = PI / 2; g.add(rib);
  }
  g.add(cyl(0.007 * s, 0.007 * s, 0.07 * s, 5, M.lacq, 0, -0.115 * s, 0));
  return g;
}
/* 灯笼材质呼吸（每级推一条：遍历已建灯笼相位桶，错相呼吸） */
function lanternBreathe(anims, phase) {
  var keys = Object.keys(_mc), i;
  for (i = 0; i < keys.length; i++) {
    if (keys[i].indexOf('p33lant') === 0) {
      (function (bm, k) {
        anims.push(function (t) { bm.emissiveIntensity = 0.5 + 0.18 * sin(t * 2.1 + k * 1.1 + phase); });
      })(_mc[keys[i]], i);
    }
  }
}

/* 支腿钢水箱：四腿 + 箱体 + 锥顶 + 字带 + 检修爬梯（lv3 天际线签名件，总高≈0.42） */
function waterTank(M) {
  var g = grp(), i;
  for (i = 0; i < 4; i++) {
    var lx = (i % 2) ? 0.12 : -0.12, lz = (i < 2) ? 0.1 : -0.1;
    g.add(box(0.026, 0.12, 0.026, M.steel, lx, 0.06, lz));
  }
  g.add(box(0.34, 0.22, 0.3, M.steel, 0, 0.23, 0));
  var cap = mesh(new THREE.ConeGeometry(0.25, 0.08, 4), M.corrug); cap.rotation.y = PI / 4; cap.position.set(0, 0.38, 0); g.add(cap);
  var band = boardSign(M, '水源', '#7a95a0', '#22303a', '#4a5c66', 0.28, 0.08, false, 0.12);
  band.position.set(0, 0.23, 0.153); g.add(band);
  g.add(box(0.012, 0.3, 0.012, M.steel, -0.085, 0.17, 0.158));        /* 爬梯双轨 */
  g.add(box(0.012, 0.3, 0.012, M.steel, 0.085, 0.17, 0.158));
  for (i = 0; i < 4; i++) g.add(box(0.17, 0.011, 0.011, M.steel, 0, 0.09 + i * 0.072, 0.158));
  return g;
}

/* 石狮（v2）：础座 + 身 + 头 + 七球卷毛鬃 + 双耳 + 吻部 + 前腿 + 爪侧绣球（绶带金钮）
 * dir=±1 镜像摆位（左雄右雌对位），共 16 mesh */
function stoneLionHK(M, s, dir) {
  dir = dir || 1;
  var g = grp(); s = s || 1;
  g.add(box(0.11 * s, 0.035 * s, 0.11 * s, M.stoneD, 0, 0.018 * s, 0));
  var body = sph(0.048 * s, M.stone, 0, 0.07 * s, -0.006 * s); body.scale.set(0.9, 0.85, 1.22); g.add(body);
  g.add(sph(0.035 * s, M.stone, 0, 0.126 * s, 0.042 * s));
  var mane = [[0.028, 0.15, 0.018], [-0.028, 0.15, 0.018], [0.038, 0.126, -0.002],
              [-0.038, 0.126, -0.002], [0.03, 0.104, 0.006], [-0.03, 0.104, 0.006], [0, 0.158, -0.004]];
  var i;
  for (i = 0; i < mane.length; i++) g.add(sph(0.0135 * s, M.stoneD, mane[i][0] * s, mane[i][1] * s, mane[i][2] * s));
  var e1 = mesh(new THREE.ConeGeometry(0.012 * s, 0.026 * s, 6), M.stone); put(g, e1, 0.02 * s * dir, 0.158 * s, 0.04 * s, 0, 0, -0.3 * dir);
  var e2 = mesh(new THREE.ConeGeometry(0.012 * s, 0.026 * s, 6), M.stone); put(g, e2, -0.02 * s * dir, 0.158 * s, 0.04 * s, 0, 0, 0.3 * dir);
  g.add(sph(0.015 * s, M.stone, 0, 0.12 * s, 0.072 * s));             /* 吻部 */
  g.add(box(0.03 * s, 0.035 * s, 0.05 * s, M.stoneD, 0, 0.03 * s, 0.062 * s)); /* 前腿 */
  var bx = 0.058 * s * dir;                                           /* 绣球 + 绶带 */
  g.add(sph(0.02 * s, M.stone, bx, 0.03 * s, 0.058 * s));
  var rib = mesh(new THREE.TorusGeometry(0.02 * s, 0.0045 * s, 6, 12), M.lacq);
  rib.rotation.x = PI / 2; rib.position.set(bx, 0.03 * s, 0.058 * s); g.add(rib);
  return g;
}

/* 港式双坡屋顶：铁皮/瓦楞绿两用（垄面顺坡 + 悬山封板 + 挑檐 + 脊带 + v2 脊端封头） */
function gableRoof(M, o) {
  var w = o.w, d = o.d, h = o.h, matS = o.mat, over = o.over !== undefined ? o.over : 0.09;
  var g = grp(), k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, matS, 0, 0, k * slopeLen / 2));
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.026, M.ink, 0, -0.006, k * eave));
  }
  if (o.gable !== false) {
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plank); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plank); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  }
  g.add(box(w + over * 2 + 0.04, 0.05, 0.08, o.ridgeMat || M.ink, 0, h + 0.025, 0));
  if (o.ridgeFin) {                                                   /* v2 脊端封头 */
    g.add(box(0.035, 0.06, 0.075, o.ridgeMat || M.ink, -(w / 2 + over - 0.02), h + 0.03, 0));
    g.add(box(0.035, 0.06, 0.075, o.ridgeMat || M.ink, w / 2 + over - 0.02, h + 0.03, 0));
  }
  return g;
}

/* 平面片几何：四边形（两三角）/ 三角形，带 uv + 法线（四坡釉瓦面用，零厚度双面材质） */
function quadGeo(a, b, c, d) {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2],
    a[0], a[1], a[2], c[0], c[1], c[2], d[0], d[1], d[2]]), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]), 2));
  g.computeVertexNormals();
  return g;
}
function triGeo(a, b, c) {
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]]), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array([0, 0, 1, 0, 0.5, 1]), 2));
  g.computeVertexNormals();
  return g;
}

/* 绿釉瓦四坡顶（lv4 塔冠，v2 重构）：真四坡（前后梯形 + 左右三角，共边水密，v1 十字
 * 五板留角空洞已清偿）+ 三面金封檐板 + 金正脊 + 上翘端吻 + 吻珠 +
 * 四角翘角金吻 + 角吻珠 + 前檐斗拱块 + 宝顶（塔层生长件；屋面釉瓦垄纹理分区） */
function hipRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.06, eaveS = w / 2 + 0.06, rh = w * 0.26;   /* rh: 正脊半长（沿用 v1 0.52w） */
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS - rh);
  g.add(mesh(quadGeo([-eaveS, 0, eaveF], [eaveS, 0, eaveF], [rh, h, 0], [-rh, h, 0]), M.glazeSun));
  g.add(mesh(quadGeo([eaveS, 0, -eaveF], [-eaveS, 0, -eaveF], [-rh, h, 0], [rh, h, 0]), M.glazeShd));
  g.add(mesh(triGeo([eaveS, 0, eaveF], [eaveS, 0, -eaveF], [rh, h, 0]), M.glazeShd));
  g.add(mesh(triGeo([-eaveS, 0, -eaveF], [-eaveS, 0, eaveF], [-rh, h, 0]), M.glazeShd));
  /* 檐口金封檐板（前 + 左右） */
  var ef = box(eaveS * 2 + 0.02, 0.045, 0.024, M.gold, 0, 0, eaveF); ef.rotation.x = pitchF; g.add(ef);
  var eR = box(0.024, 0.045, eaveF * 2 + 0.02, M.gold, eaveS, 0, 0); eR.rotation.z = -pitchS; g.add(eR);
  var eL = box(0.024, 0.045, eaveF * 2 + 0.02, M.gold, -eaveS, 0, 0); eL.rotation.z = pitchS; g.add(eL);
  /* 金正脊 + 上翘端吻 + 吻珠 */
  g.add(box(rh * 2, 0.05, 0.07, M.gold, 0, h + 0.025, 0));
  var f1 = box(0.04, 0.1, 0.055, M.gold, rh, h + 0.075, 0); f1.rotation.z = 0.45; g.add(f1);
  var f2 = box(0.04, 0.1, 0.055, M.gold, -rh, h + 0.075, 0); f2.rotation.z = -0.45; g.add(f2);
  g.add(sph(0.014, M.gold, rh + 0.032, h + 0.128, 0));
  g.add(sph(0.014, M.gold, -rh - 0.032, h + 0.128, 0));
  /* 四角翘角金吻 + 吻珠（坐于真实檐角上） */
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var horn = box(0.055, 0.05, 0.055, M.gold, c[0] * (eaveS - 0.015), 0.03, c[1] * (eaveF - 0.015));
    horn.rotation.z = -c[0] * 0.55; g.add(horn);
    g.add(sph(0.013, M.gold, c[0] * (eaveS - 0.015), 0.052, c[1] * (eaveF - 0.015)));
  });
  /* 檐角斗拱块（前檐两枚，红漆木作） */
  g.add(box(0.034, 0.03, 0.034, M.lacqBr, w * 0.28, -0.02, eaveF - 0.02));
  g.add(box(0.034, 0.03, 0.034, M.lacqBr, -w * 0.28, -0.02, eaveF - 0.02));
  if (o.finial) {
    g.add(cyl(0.02, 0.028, 0.05, 10, M.gold, 0, h + 0.07, 0));
    g.add(sph(0.034, M.gold, 0, h + 0.11, 0));
  }
  return g;
}

/* 石板地坪 + 草缘 + 石板径 + 灌丛（参考图基座语汇，四级统一） */
function padHK(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size + 0.06, 0.032, d + 0.06, M.grassD, 0, 0.016, 0));
  g.add(box(size, 0.05, d, M.pave, 0, 0.03, 0));
  g.add(box(size - 0.5, 0.052, d - 0.5, M.stone, 0, 0.031, 0.02));
  g.add(box(0.44, 0.014, 0.6, M.stoneD, 0, 0.058, d / 2 - 0.34));
  var r1 = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, r1, size / 2 - 0.24, 0.07, d / 2 - 0.26);
  var b1 = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.grassD); put(g, b1, -size / 2 + 0.24, 0.115, d / 2 - 0.28); b1.scale.y = 0.78;
  var b2 = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, b2, size / 2 - 0.2, 0.1, -d / 2 + 0.3); b2.scale.y = 0.8;
  return g;
}

/* 木条箱果蔬档（lv2 GFR 签名件；v2 修复四色果盘） */
function crateStall(M) {
  var g = grp();
  g.add(box(0.34, 0.14, 0.2, M.crate, 0, 0.07, 0));
  g.add(box(0.3, 0.12, 0.18, M.crate, -0.3, 0.06, 0.04));
  g.add(box(0.4, 0.026, 0.24, M.wood, 0.02, 0.15, 0.01));
  ['#c04030', '#e0a030', '#70a848', '#d87848'].forEach(function (fc, fi) {
    g.add(sph(0.028, MAT('p33fruit' + fi, function () { return std(fc, { rough: 0.6 }); }), -0.12 + (fi % 2) * 0.22, 0.19, (fi < 2) ? -0.04 : 0.05));
  });
  return g;
}

/* 阳台花箱（v2）：木箱 + 绿叶 + 三色小花（参考图阳台绿饰） */
function flowerBox(M) {
  var g = grp();
  g.add(box(0.26, 0.055, 0.09, M.crate, 0, 0.027, 0));
  g.add(sph(0.045, M.grassD, 0, 0.075, 0)); g.add(sph(0.038, M.grassD, -0.08, 0.065, 0.01)); g.add(sph(0.038, M.grassD, 0.08, 0.065, -0.01));
  g.add(sph(0.015, MAT('p33flw1', function () { return std('#d05a70', { rough: 0.6 }); }), -0.05, 0.1, 0.02));
  g.add(sph(0.015, MAT('p33flw2', function () { return std('#e0b040', { rough: 0.6 }); }), 0.05, 0.098, -0.02));
  g.add(sph(0.014, MAT('p33flw3', function () { return std('#c8dce8', { rough: 0.6 }); }), 0, 0.108, 0));
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→lighting→interaction） ================= */

/* ---- lv1 小屋：锈铁皮棚屋 + 四层鱼骨天线 + 暖窗 + 木凳柴堆（h≈1.21） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padHK(M, 2.3, 2.3));
  /* 台基 + 板条墙体（blockout：单一棚体量） */
  g.add(box(1.52, 0.08, 1.16, M.stoneD, -0.05, 0.04, -0.05));
  g.add(box(1.36, 0.62, 1.0, M.plank, -0.05, 0.39, -0.05));
  /* 四角深色角柱 */
  [[-0.68, -0.5], [0.58, -0.5], [-0.68, 0.4], [0.58, 0.4]].forEach(function (c) {
    g.add(box(0.06, 0.64, 0.06, M.woodD, c[0], 0.4, c[1]));
  });
  /* 门（左）+ 暖窗×2（右/中，逐格分档）+ 石阶 */
  g.add(box(0.28, 0.4, 0.04, M.woodD, -0.4, 0.29, 0.455));
  g.add(box(0.24, 0.36, 0.045, M.lacq, -0.4, 0.29, 0.462));
  var w1 = warmWindow(M, 0.24, 0.26); put(g, w1, 0.16, 0.42, 0.462);
  var w2 = warmWindow(M, 0.2, 0.2); put(g, w2, 0.635, 0.38, 0.12, PI / 2);
  g.add(box(0.4, 0.05, 0.18, M.stoneD, -0.4, 0.105, 0.53));
  /* 锈铁皮双坡顶（apex≈1.00）+ 脊带 + 脊端封头 */
  var roof = gableRoof(M, { w: 1.46, d: 1.06, h: 0.3, mat: M.corrug, gableMat: M.plank, ridgeMat: M.ink, ridgeFin: true });
  put(g, roof, -0.05, 0.7, -0.05);
  /* 屋后通排气管（生活细节，参考图棚屋管件） */
  g.add(cyl(0.03, 0.03, 0.18, 8, M.steel, -0.42, 0.85, -0.35));
  g.add(cyl(0.048, 0.048, 0.02, 8, M.ink, -0.42, 0.95, -0.35));
  /* 四层鱼骨天线（脊上，总顶≈1.21） */
  var ant = antennaHK(M, 0.09, anims, 1.3); put(g, ant, 0.32, 1.0, -0.05);
  /* 门口物件：木凳 + 铁桶（双箍） + 板条箱 */
  g.add(box(0.36, 0.03, 0.15, M.wood, 0.78, 0.16, 0.5));
  g.add(box(0.045, 0.13, 0.13, M.woodD, 0.64, 0.09, 0.5));
  g.add(box(0.045, 0.13, 0.13, M.woodD, 0.92, 0.09, 0.5));
  g.add(cyl(0.07, 0.08, 0.14, 10, M.steel, -0.95, 0.1, 0.42));
  g.add(cyl(0.078, 0.078, 0.014, 10, M.ink, -0.95, 0.13, 0.42));
  g.add(cyl(0.082, 0.082, 0.014, 10, M.ink, -0.95, 0.075, 0.42));
  g.add(box(0.26, 0.16, 0.18, M.crate, 0.72, 0.1, -0.62));
  /* 墙边柴堆（三根圆木） + 踏步石 */
  var lg1 = cyl(0.034, 0.034, 0.4, 7, M.wood, -1.0, 0.075, -0.28); lg1.rotation.z = PI / 2; g.add(lg1);
  var lg2 = cyl(0.034, 0.034, 0.4, 7, M.woodD, -1.0, 0.075, -0.19); lg2.rotation.z = PI / 2; g.add(lg2);
  var lg3 = cyl(0.034, 0.034, 0.4, 7, M.wood, -1.0, 0.138, -0.235); lg3.rotation.z = PI / 2; g.add(lg3);
  g.add(box(0.2, 0.012, 0.16, M.stoneD, -0.32, 0.058, 0.98));
  g.add(box(0.18, 0.012, 0.15, M.stoneD, 0.12, 0.058, 1.0));
  /* 暖窗呼吸 */
  var wm = M.warm;
  anims.push(function (t) { wm.emissiveIntensity = 0.4 + 0.12 * sin(t * 1.15); });
  return g;
}

/* ---- lv2 洋房：两层木构唐楼 + 绿瓦楞顶 + 扇贝披棚 + 竖招三连（h≈1.69） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padHK(M, 2.45, 2.3));
  /* 台基 + 一层铺面（0.10-0.72）+ 二层（0.75-1.27） */
  g.add(box(1.72, 0.1, 1.14, M.stoneD, -0.25, 0.05, -0.05));
  g.add(box(1.54, 0.62, 1.02, M.plank, -0.25, 0.41, -0.05));
  g.add(box(1.6, 0.05, 1.06, M.wood, -0.25, 0.735, -0.05));
  g.add(box(1.6, 0.52, 1.04, M.plank, -0.25, 1.025, -0.05));
  /* 一层门脸：门 + 3×2 大分格橱窗 + 横招 */
  g.add(box(0.3, 0.42, 0.04, M.woodD, -0.72, 0.31, 0.475));
  g.add(box(0.26, 0.38, 0.045, M.lacq, -0.72, 0.31, 0.482));
  var shop = warmWindow(M, 0.5, 0.36, 3, 2); put(g, shop, -0.1, 0.32, 0.472);   /* 店面大橱窗 */
  var sign1 = boardSign(M, '茶樓', '#8a4a20', '#ffd98a', '#3c2412', 0.5, 0.15, true, 0.55);
  put(g, sign1, -0.05, 0.62, 0.487);
  /* 二层：檐廊木栏 + 暖窗×2（逐格分档）+ 花箱×2 + 横招 + 空调×2 */
  g.add(box(1.4, 0.03, 0.16, M.lacq, -0.3, 0.78, 0.5));
  var i, n = 8;
  for (i = 0; i <= n; i++) g.add(box(0.02, 0.13, 0.016, M.lacqBr, -0.98 + i * 0.175, 0.86, 0.57));
  g.add(box(1.44, 0.03, 0.03, M.lacq, -0.3, 0.94, 0.575));
  var u1 = warmWindow(M, 0.26, 0.28); put(g, u1, -0.62, 1.06, 0.475);
  var u2 = warmWindow(M, 0.26, 0.28); put(g, u2, -0.16, 1.06, 0.475);
  var fb1 = flowerBox(M); put(g, fb1, -0.62, 0.945, 0.56);
  var fb2 = flowerBox(M); put(g, fb2, -0.16, 0.945, 0.56);
  var sign2 = boardSign(M, '旅店', '#8a4a20', '#ffd98a', '#3c2412', 0.44, 0.14, true, 0.5);
  put(g, sign2, 0.32, 1.12, 0.467);
  var a1 = acUnit(M, 1); put(g, a1, 0.6, 0.92, 0.44);
  var a2 = acUnit(M, 0.9); put(g, a2, 0.32, 0.5, 0.45);
  /* 琥珀扇贝披棚×2（GFR 大棚 + 2F 小棚，带前缘垂条） */
  var aw1 = scallopAwning(M, 1.06, 0.42, M.awnAmber, 6, 0.5); put(g, aw1, -0.22, 0.78, 0.42);
  var aw2 = scallopAwning(M, 0.6, 0.3, M.awnAmber, 4, 0.5); put(g, aw2, 0.32, 1.24, 0.4);
  /* 绿瓦楞悬山屋顶（apex≈1.55，脊≈1.60，脊端封头） */
  var roof = gableRoof(M, { w: 1.66, d: 1.16, h: 0.24, mat: M.greenCorr, gableMat: M.plank, ridgeMat: M.ink, ridgeFin: true });
  put(g, roof, -0.25, 1.28, -0.05);
  var ant = antennaHK(M, 0.1, anims, 2.2); put(g, ant, 0.4, 1.48, -0.05);
  /* 竖排霓虹三连（右前角，粉/青/绿，灯管描边+扫光，接地立柱 cantilever） */
  var stack = grp(); put(g, stack, 0.68, 0, 0.5);
  var s1 = neonSign(M, '銅鑼灣', '#c8388e', '#ffe45c', 0.19, 0.56, anims, 0.0); put(stack, s1, 0, 1.06, 0.06, 0.3);
  var s2 = neonSign(M, '茶', '#2ba8b8', '#ffffff', 0.13, 0.3, anims, 2.1); put(stack, s2, 0.02, 0.6, 0.08, 0.3);
  var s3 = neonSign(M, '樓', '#3e9e4e', '#ffe45c', 0.13, 0.3, anims, 4.2); put(stack, s3, 0.04, 0.28, 0.1, 0.3);
  stack.add(box(0.05, 1.45, 0.05, M.ink, 0.0, 0.75, -0.02));
  /* 红灯笼对（左前檐角垂挂 + 吊索，金腰箍） */
  g.add(cyl(0.006, 0.006, 0.1, 6, M.ink, -1.06, 1.23, 0.5));
  put(g, lanternHK(M, 0.8, anims, 0), -1.06, 1.12, 0.5);
  g.add(cyl(0.005, 0.005, 0.08, 6, M.ink, -1.06, 1.0, 0.5));
  put(g, lanternHK(M, 0.72, anims, 3.1), -1.06, 0.9, 0.5);
  lanternBreathe(anims, 0);
  /* 果蔬档（四色果盘） + 盆栽 + 石阶 */
  var stall = crateStall(M); put(g, stall, 0.6, 0.06, 0.82);
  g.add(cyl(0.07, 0.085, 0.11, 10, M.stoneD, -1.0, 0.06, 0.9));
  var bush = mesh(new THREE.IcosahedronGeometry(0.09, 0), M.grassD); put(g, bush, -1.0, 0.17, 0.9); bush.scale.y = 0.85;
  g.add(box(0.44, 0.05, 0.2, M.stoneD, -0.72, 0.12, 0.6));
  /* 暖窗呼吸 */
  var wm = M.warm;
  anims.push(function (t) { wm.emissiveIntensity = 0.4 + 0.12 * sin(t * 1.2 + 0.5); });
  return g;
}

/* ---- lv3 大厦：五层混凝土 walk-up + 水箱爬梯 + 双坡棚 + 竖招四连柱（h≈2.28） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padHK(M, 2.5, 2.4));
  /* 台基 + 楼身（0.10-1.85）+ 层间腰线 + 前角柱 */
  g.add(box(1.42, 0.1, 1.2, M.stoneD, 0.12, 0.05, -0.08));
  g.add(box(1.3, 1.75, 1.1, M.concSun, 0.12, 0.975, -0.08));
  g.add(box(1.3, 0.03, 1.1, M.concShade, 0.12, 0.52, -0.08));
  g.add(box(1.3, 0.03, 1.1, M.concShade, 0.12, 0.87, -0.08));
  g.add(box(1.3, 0.03, 1.1, M.concShade, 0.12, 1.22, -0.08));
  g.add(box(1.3, 0.03, 1.1, M.concShade, 0.12, 1.57, -0.08));
  g.add(box(0.08, 1.75, 0.08, M.concShade, -0.49, 0.975, 0.49));
  g.add(box(0.08, 1.75, 0.08, M.concShade, 0.73, 0.975, 0.49));
  /* 密集暖光窗格：正面 4 层 × 3 列 = 12（逐格分档 2×2 + 窗台） */
  var fy = [0.36, 0.71, 1.06, 1.41], fx = [-0.22, 0.12, 0.46], i, k;
  for (i = 0; i < 4; i++) {
    for (k = 0; k < 3; k++) {
      var win = warmWindow(M, 0.22, 0.26);
      put(g, win, fx[k], fy[i], 0.473);
    }
  }
  /* 侧面（+x）4 层 × 2 列 = 8 窗 */
  for (i = 0; i < 4; i++) {
    for (k = 0; k < 2; k++) {
      var sw = warmWindow(M, 0.2, 0.24);
      sw.rotation.y = PI / 2;
      put(g, sw, 0.783, fy[i], -0.36 + k * 0.42);
    }
  }
  /* 绿帆布雨棚排（正面 3 + 侧面 2，前缘垂边） */
  for (k = 0; k < 3; k++) {
    var awF = flatAwning(M, 0.3, 0.2, M.awnGreen, 0.55);
    put(g, awF, fx[k], fy[k] + 0.2, 0.53);
  }
  for (i = 0; i < 2; i++) {
    var awS = flatAwning(M, 0.24, 0.2, M.awnGreen, 0.55);
    put(g, awS, 0.84, fy[i] + 0.19, -0.36 + i * 0.42, PI / 2);
  }
  /* 空调外机排（正面 3 + 侧 2，窗下，散热格栅面 + 滴水管） */
  var ax = [-0.22, 0.12, 0.46];
  for (i = 0; i < 3; i++) { var a = acUnit(M, 0.9); put(g, a, ax[i], fy[i] - 0.2, 0.47); }
  for (i = 0; i < 2; i++) {
    var aS = acUnit(M, 0.85); aS.rotation.y = PI / 2; put(g, aS, 0.78, fy[i + 1] - 0.19, -0.36 + i * 0.42);
  }
  /* 女儿墙（1.85-1.94）+ 压顶盖石（v2） */
  g.add(box(1.38, 0.09, 0.07, M.concShade, 0.12, 1.895, 0.51));
  g.add(box(1.38, 0.09, 0.07, M.concShade, 0.12, 1.895, -0.67));
  g.add(box(0.07, 0.09, 1.24, M.concShade, -0.55, 1.895, -0.08));
  g.add(box(0.07, 0.09, 1.24, M.concShade, 0.79, 1.895, -0.08));
  g.add(box(1.44, 0.024, 0.11, M.stoneD, 0.12, 1.952, 0.51));
  g.add(box(1.44, 0.024, 0.11, M.stoneD, 0.12, 1.952, -0.67));
  g.add(box(0.11, 0.024, 1.3, M.stoneD, -0.55, 1.952, -0.08));
  g.add(box(0.11, 0.024, 1.3, M.stoneD, 0.79, 1.952, -0.08));
  /* 屋顶设备群：水箱（爬梯） + 双坡铁皮棚 + 天线 + 排气管（屋面 1.85） */
  var tank = waterTank(M); put(g, tank, 0.48, 1.86, -0.3);                   /* 顶≈2.28 */
  var shed = gableRoof(M, { w: 0.5, d: 0.42, h: 0.1, mat: M.corrug, gable: false, ridgeMat: M.ink, over: 0.03 });
  put(g, shed, -0.28, 1.85, -0.3);
  shed.add(box(0.14, 0.13, 0.02, M.woodD, 0.1, 0.065, 0.225));               /* 棚门 */
  var ant = antennaHK(M, 0.22, anims, 2.6); put(g, ant, -0.42, 1.85, 0.3);
  g.add(cyl(0.018, 0.018, 0.36, 6, M.steel, 0.72, 2.04, -0.62));
  /* 墙面雨水管（左前角，卡箍两道） */
  g.add(cyl(0.014, 0.014, 1.7, 6, M.steel, -0.53, 0.975, 0.482));
  g.add(cyl(0.018, 0.018, 0.02, 6, M.ink, -0.53, 1.5, 0.482));
  g.add(cyl(0.018, 0.018, 0.02, 6, M.ink, -0.53, 0.6, 0.482));
  /* 竖招霓虹四连柱（右前角外挑，灯管描边+扫光，接地立柱） */
  var stack = grp(); put(g, stack, 0.92, 0, 0.45, -0.35);
  var s1 = neonSign(M, '金', '#c83030', '#ffe45c', 0.14, 0.36, anims, 0.0); put(stack, s1, 0, 1.62, 0);
  var s2 = neonSign(M, '紫', '#8e3ec8', '#ffffff', 0.14, 0.36, anims, 1.6); put(stack, s2, 0, 1.2, 0);
  var s3 = neonSign(M, '水', '#2ba8b8', '#ffffff', 0.14, 0.36, anims, 3.2); put(stack, s3, 0, 0.78, 0);
  var s4 = neonSign(M, '發', '#c8388e', '#ffe45c', 0.14, 0.36, anims, 4.8); put(stack, s4, 0, 0.36, 0);
  stack.add(box(0.045, 1.86, 0.045, M.ink, -0.05, 1.0, 0));
  /* 前脸小竖招 ×2 */
  var f1 = neonSign(M, '餐廳', '#3e9e4e', '#ffe45c', 0.15, 0.42, anims, 2.4); put(g, f1, -0.6, 0.86, 0.52, 0.22);
  var f2 = neonSign(M, '旅', '#2b5ac8', '#ffffff', 0.12, 0.28, anims, 5.3); put(g, f2, 0.66, 0.66, 0.5, -0.18);
  /* GFR：通长绿帆布棚（扇贝 + 垂边 + 撑杆） + 店招 + 门/窗/柜台 */
  var can = grp(); put(g, can, 0.12, 0.66, 0.42);
  var cb = box(1.34, 0.026, 0.36, M.awnGreen); cb.rotation.x = 0.42; cb.position.z = 0.1; can.add(cb);
  var r = 1.34 / 16, scGeo = new THREE.CylinderGeometry(r, r, 0.026, 10, 1, false, 0, PI);
  for (i = 0; i < 8; i++) {
    var sc = mesh(scGeo, M.awnGreen);
    sc.rotation.x = PI / 2; sc.rotation.z = PI;
    sc.position.set(-0.67 + r + i * 2 * r, -0.105, 0.25);
    can.add(sc);
  }
  var val = box(1.32, 0.1, 0.014, M.awnGreen, 0, -0.155, 0.27); val.rotation.x = 0.08; can.add(val);
  g.add(cyl(0.008, 0.008, 0.5, 6, M.steel, -0.46, 0.31, 0.57));
  g.add(cyl(0.008, 0.008, 0.5, 6, M.steel, 0.7, 0.31, 0.57));
  var sgn = boardSign(M, '銅鑼灣', '#14432e', '#ffe45c', '#0c2b1d', 0.62, 0.14, true, 0.55);
  put(g, sgn, 0.42, 0.52, 0.55);
  g.add(box(0.28, 0.4, 0.04, M.woodD, -0.28, 0.3, 0.475));
  g.add(box(0.24, 0.36, 0.045, M.lacq, -0.28, 0.3, 0.482));
  var shopW = warmWindow(M, 0.42, 0.3, 3, 2); put(g, shopW, 0.28, 0.32, 0.475);
  g.add(box(0.5, 0.05, 0.14, M.stoneD, 0.28, 0.115, 0.66));
  /* 红灯笼对（棚下，金腰箍） */
  put(g, lanternHK(M, 0.7, anims, 0), -0.42, 0.52, 0.6);
  put(g, lanternHK(M, 0.7, anims, 3.1), 0.78, 0.52, 0.6);
  lanternBreathe(anims, 0);
  /* 盆栽/绿篱/石阶 */
  g.add(cyl(0.075, 0.09, 0.12, 10, M.stoneD, -0.95, 0.07, 0.86));
  var bsh = mesh(new THREE.IcosahedronGeometry(0.1, 0), M.grassD); put(g, bsh, -0.95, 0.2, 0.86); bsh.scale.y = 0.82;
  g.add(box(0.5, 0.09, 0.14, M.grassD, 1.02, 0.06, 0.75));
  g.add(box(0.44, 0.05, 0.2, M.stoneD, 0.42, 0.12, 0.72));
  /* 暖窗呼吸 */
  var wm = M.warm;
  anims.push(function (t) { wm.emissiveIntensity = 0.4 + 0.12 * sin(t * 1.25 + 0.8); });
  return g;
}

/* ---- lv4 地标：四重绿釉瓦金脊塔式商楼 + 灯笼排/垂串 + 石狮金匾（h≈2.97） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padHK(M, 2.5, 2.5));
  /* 石阶（三級垂带） */
  g.add(box(1.0, 0.06, 0.22, M.stoneD, 0, 0.03, 1.0));
  g.add(box(0.88, 0.06, 0.2, M.stoneD, 0, 0.09, 0.9));
  g.add(box(0.76, 0.06, 0.18, M.stoneD, 0, 0.15, 0.8));
  /* 石狮一对（镜像，卷毛鬃 + 绣球） + 金匾门头 */
  put(g, stoneLionHK(M, 1.2, 1), -0.56, 0.05, 0.72);
  put(g, stoneLionHK(M, 1.2, -1), 0.56, 0.05, 0.72);
  var plq = boardSign(M, '銅鑼灣', '#8a5a1a', '#ff3c2c', '#d8a850', 0.66, 0.14, true, 0.55);
  put(g, plq, 0, 0.565, 0.625);
  /* 金框朱门 */
  g.add(box(0.52, 0.48, 0.05, M.gold, 0, 0.37, 0.585));
  g.add(box(0.44, 0.42, 0.055, M.lacqBr, 0, 0.35, 0.59));
  g.add(box(0.4, 0.38, 0.06, M.lacq, 0, 0.33, 0.6));
  g.add(sph(0.02, M.gold, -0.12, 0.4, 0.635));
  g.add(sph(0.02, M.gold, 0.12, 0.4, 0.635));
  /* 四层塔身：塔冠 apex = 上一层楼面（生长咬合；釉瓦垄面 + 金脊端吻 + 吻珠 + 斗拱） */
  var tiers = [
    { y0: 0.14, h: 0.48, w: 1.9, d: 1.38, roofH: 0.22, win: 3 },
    { y0: 0.84, h: 0.46, w: 1.6, d: 1.14, roofH: 0.2, win: 3 },
    { y0: 1.5, h: 0.44, w: 1.32, d: 0.94, roofH: 0.19, win: 2 },
    { y0: 2.13, h: 0.42, w: 1.02, d: 0.74, roofH: 0.28, win: 2 }
  ];
  tiers.forEach(function (T, ti) {
    var cx = 0, cz = -0.1;
    /* 层身（红漆木廊层）+ 金腰带 */
    g.add(box(T.w, T.h, T.d, M.lacq, cx, T.y0 + T.h / 2, cz));
    g.add(box(T.w + 0.03, 0.045, T.d + 0.03, M.gold, cx, T.y0 + 0.025, cz));
    /* 前脸暖窗（逐格分档） */
    var n = T.win, i, gap = T.w / (n + 1);
    for (i = 0; i < n; i++) {
      var win = warmWindow(M, Math.min(0.24, gap * 0.6), T.h * 0.52);
      put(g, win, cx - T.w / 2 + gap * (i + 1), T.y0 + T.h * 0.55, cz + T.d / 2 + 0.005);
    }
    /* 前廊金栏（平座，T1 落地不设） */
    if (ti > 0) {
      g.add(box(T.w - 0.12, 0.028, 0.03, M.gold, cx, T.y0 - 0.06, cz + T.d / 2 + 0.09));
      g.add(box(T.w - 0.12, 0.05, 0.02, M.lacqBr, cx, T.y0 - 0.115, cz + T.d / 2 + 0.09));
    }
    /* 绿釉四坡塔冠 + 金脊（顶冠带宝顶，≈2.97） */
    var roof = hipRoof(M, { w: T.w + 0.1, d: T.d + 0.1, h: T.roofH, finial: ti === 3 });
    put(g, roof, cx, T.y0 + T.h, cz);
    /* 檐下红灯笼排（前 3，金腰箍，错相呼吸） */
    var li;
    for (li = 0; li < 3; li++) {
      var lx = cx - (T.w * 0.3) + li * (T.w * 0.3);
      put(g, lanternHK(M, 0.62, anims, ti * 1.3), lx, T.y0 + T.h - 0.1, cz + T.d / 2 + 0.12);
    }
  });
  lanternBreathe(anims, 0.9);
  /* 檐角红灯笼垂串×2（T2 前檐两角，参考图檐角三连串；小灯笼省腰箍控预算） */
  [-0.62, 0.62].forEach(function (sx, si) {
    g.add(cyl(0.005, 0.005, 0.5, 5, M.ink, sx, 1.08, 0.58));
    var li;
    for (li = 0; li < 3; li++) put(g, lanternHK(M, 0.55, anims, 0.6 + si * 1.7 + li * 0.5, true), sx, 1.28 - li * 0.19, 0.58);
  });
  /* 右侧竖招四连 + 左侧竖招三连（灯管描边+扫光，接地立柱） */
  var stR = grp(); put(g, stR, 1.02, 0, 0.1, -0.4);
  var r1 = neonSign(M, '夜', '#2b5ac8', '#ffffff', 0.16, 0.32, anims, 0.0); put(stR, r1, 0, 2.0, 0);
  var r2 = neonSign(M, '會', '#c8388e', '#ffe45c', 0.16, 0.32, anims, 1.5); put(stR, r2, 0, 1.62, 0);
  var r3 = neonSign(M, '金', '#8e3ec8', '#ffe45c', 0.16, 0.32, anims, 3.0); put(stR, r3, 0, 1.24, 0);
  var r4 = neonSign(M, '茶', '#3e9e4e', '#ffe45c', 0.16, 0.32, anims, 4.5); put(stR, r4, 0, 0.86, 0);
  stR.add(box(0.045, 2.14, 0.045, M.ink, -0.05, 1.1, 0));
  var stL = grp(); put(g, stL, -1.0, 0, 0.05, 0.4);
  var q1 = neonSign(M, '發', '#c8388e', '#ffe45c', 0.15, 0.3, anims, 2.2); put(stL, q1, 0, 1.7, 0);
  var q2 = neonSign(M, '財', '#2ba8b8', '#ffffff', 0.15, 0.3, anims, 3.7); put(stL, q2, 0, 1.34, 0);
  var q3 = neonSign(M, '寶', '#3e9e4e', '#ffe45c', 0.15, 0.3, anims, 5.2); put(stL, q3, 0, 0.98, 0);
  stL.add(box(0.04, 1.9, 0.04, M.ink, 0.05, 0.98, 0));
  /* 中部粉紫横霓虹「銅鑼灣」（T3 前脸，呼吸+相位扫光） */
  var neo = boardSign(M, '銅鑼灣', '#c02ca0', '#ffffff', '#5c1660', 0.9, 0.2, true, 0.85);
  put(g, neo, 0.05, 1.56, 0.42, 0.06);
  var neoMat = neo.userData.mat;
  anims.push(function (t) { neoMat.emissiveIntensity = 0.74 + 0.22 * sin(t * 2.3); });
  /* 平座盆栽（贴塔冠坡面，T2 檐角） */
  var pi;
  for (pi = 0; pi < 2; pi++) {
    var px = pi ? 0.66 : -0.66;
    g.add(cyl(0.06, 0.075, 0.1, 10, M.stoneD, px, 0.71, 0.55));
    var pb = mesh(new THREE.IcosahedronGeometry(0.09, 0), M.grassD); put(g, pb, px, 0.81, 0.55); pb.scale.y = 0.82;
  }
  /* 门口条凳 + 绿篱 */
  g.add(box(0.34, 0.03, 0.14, M.wood, 0.82, 0.17, 0.92));
  g.add(box(0.04, 0.1, 0.12, M.woodD, 0.7, 0.105, 0.92));
  g.add(box(0.04, 0.1, 0.12, M.woodD, 0.94, 0.105, 0.92));
  g.add(box(0.4, 0.08, 0.12, M.grassD, -1.04, 0.05, 0.9));
  /* 暖窗呼吸 */
  var wm = M.warm;
  anims.push(function (t) { wm.emissiveIntensity = 0.4 + 0.12 * sin(t * 1.1 + 1.4); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[33] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_33_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 33;
  g.userData.level = lv;
  g.userData.region = 'g7';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
