/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_36.js  (v2 精修版)
 * -------------------------------------------------------------------------------------
 * 格 36「兰桂坊」(g7 港岛夜色) 独属建筑：兰桂坊酒吧街四阶生长史
 * 参考图 refs/prop_36.png 高保真复刻；v1 已验收，v2 为 REFINE_SPEC.md 精修迭代：
 *   ① 霓虹光管缠绕与描边字笔画层次（板框四面真发光光管 + 背衬/色管/白芯三层笔画）
 *   ② 分色竖招阵金属托架（托臂+螺栓+中横托+底座立柱分体）
 *   ③ 乱石砌墙错缝与色差（256px 变行高变块宽错缝 + 受光/背光棱 + 3D 转角凸石）
 *   ④ 露天卡座桌凳酒杯灯串（圆桌+酒杯+烛芯暖光呼吸+雨棚帷边锯齿+短灯串）
 *   ⑤ 朱漆平座金扶手（望柱+金顶珠+中枋三横体系）
 *   ⑥ 青绿歇山金脊宝顶（山花板金边+垂脊金珠+脊兽+四层宝顶）
 *   ⑦ 窄梯级街踏步垂带（斜顶垂带石成形 + 缘石踏步缘）
 * 风格族谱（同一块地的同一种生长，与 v1 一致不推翻）：
 *   lv1 小屋   乱石小酒馆：石砌墙+深灰瓦双坡+挑杆灯笼+窄石梯径（h≈1.06）
 *   lv2 洋房   木构酒吧铺：绿白条纹雨棚+露天吧台卡座+竖式霓虹+电杆灯串（h≈1.55）
 *   lv3 大厦   混凝土唐楼：四层阳台带+两翼霓虹招牌阵+红雨棚+水箱天线（h≈2.26）
 *   lv4 地标   宫阙会所：石台基大踏步+石狮+朱柱平座三层+青绿金脊+霓虹阵灯串（h≈2.47）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[36] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；高度带 lv1 0.8-1.2 / lv2 1.2-1.7 /
 * lv3 1.7-2.3 / lv4 2.3-3.0；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤512px）；每级 mesh ≤350；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_36] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 颜色 / 材质基元（std: sRGB→Linear，同 buildings3d） ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos, max = Math.max, min = Math.min;
/* 种子杂量（确定性，禁 Math.random） */
function h1(i) { var s = Math.sin(i * 127.1 + 13.7) * 43758.5453; return s - Math.floor(s); }
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

/* 乱石砌块 v2：变行高/变块宽错缝 + 块间色差 + 受光背光棱 + 苔斑（lv1/lv4 墙、台基） */
function texAshlar() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#57523f'; g.fillRect(0, 0, S, S);
  var rows = 7, y = 0, i, k = 0;
  for (i = 0; i < rows; i++) {
    var rh = (S / rows) * (0.8 + 0.45 * h1(i * 5 + 1));
    var x = -h1(i * 7 + 2) * S * 0.3;
    while (x < S - 6) {
      var w = S * (0.15 + 0.18 * h1(i * 11 + k * 3 + 3));
      var tone = 0.76 + 0.32 * h1(i * 13 + k * 7 + 5);
      var rr = Math.floor(150 * tone), gg = Math.floor(142 * tone), bb = Math.floor(122 * tone);
      g.fillStyle = 'rgb(' + rr + ',' + gg + ',' + bb + ')';
      g.fillRect(x + 2, y + 2, w - 4, rh - 4);
      g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(x + 2, y + 2, w - 4, 2);
      g.fillStyle = 'rgba(255,248,230,0.05)'; g.fillRect(x + 2, y + 2, 2, rh - 4);
      g.fillStyle = 'rgba(28,26,18,0.4)'; g.fillRect(x + 2, y + rh - 5, w - 4, 3);
      g.fillStyle = 'rgba(28,26,18,0.25)'; g.fillRect(x + w - 5, y + 2, 3, rh - 4);
      if (h1(i * 17 + k * 2) > 0.72) { g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(x + 6, y + 6, Math.floor(w * 0.3), Math.floor(rh * 0.3)); }
      if (h1(i * 19 + k * 2) < 0.18) { g.fillStyle = 'rgba(30,40,26,0.16)'; g.fillRect(x + Math.floor(w * 0.5), y + Math.floor(rh * 0.45), Math.floor(w * 0.4), Math.floor(rh * 0.4)); }
      x += w; k++;
    }
    y += rh;
  }
  for (i = 0; i < 260; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : (i % 7 ? 'rgba(30,34,24,0.10)' : 'rgba(80,110,60,0.14)');
    g.fillRect((h1(i * 1.3) * S) | 0, (h1(i * 2.1) * S) | 0, 2, 2);
  }
  return toTex(cv, true);
}
/* 暖灰混凝土 v2：细噪 + 抹痕水渍 + 模板螺栓孔（lv3 唐楼身） */
function texConcrete() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#a39f92'; g.fillRect(0, 0, S, S);
  var i, r, c;
  for (i = 0; i < 140; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.055)' : 'rgba(96,92,80,0.075)';
    g.fillRect((i * 31) % S, (i * 47) % S, 3, 2);
  }
  for (i = 0; i < 6; i++) {
    g.fillStyle = 'rgba(90,88,76,0.10)';
    g.fillRect((i * 17 + 5) % S, 0, 2, S);
  }
  for (r = 0; r < 3; r++) {
    for (c = 0; c < 2; c++) {
      var cx = S * (0.3 + c * 0.4), cy = S * (0.22 + r * 0.28);
      g.fillStyle = 'rgba(70,66,56,0.5)';
      g.beginPath(); g.arc(cx, cy, 2.6, 0, PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,0.14)';
      g.beginPath(); g.arc(cx + 1, cy - 1, 1.2, 0, PI * 2); g.fill();
    }
  }
  return toTex(cv, true);
}
/* 深灰瓦垄：横垄行线 + 竖接头错缝（lv1/lv2 坡顶） */
function texTileDark() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#3d4550'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#46505c' : '#39424c';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#28303a'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#525c68'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(24,30,38,0.55)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.04)' : 'rgba(14,18,24,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 青绿琉璃瓦垄（lv4 重檐） */
function texTileTeal() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#2f6558'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#3f7c6c' : '#38705f';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#234f43'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#4f9080'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(18,48,40,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 180; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(10,30,24,0.10)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 木板条：横板条 + 缝深（lv2 墙） */
function texSlat() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#6b4f34'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#7a5c3c' : '#6b4f34';
    g.fillRect(0, y, S, rh);
    g.fillStyle = 'rgba(255,235,200,0.10)'; g.fillRect(0, y + 1, S, 2);
    g.fillStyle = '#3e2e1e'; g.fillRect(0, y + rh - 2, S, 2);
  }
  for (i = 0; i < 140; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,240,210,0.05)' : 'rgba(40,28,16,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 绿白条纹雨棚布（竖条纹 + 条内阴影，lv2） */
function texStripe() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e8e2ce'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 8; i++) {
    var x0 = i * (S / 8);
    g.fillStyle = (i % 2) ? '#4c8a72' : '#e8e2ce';
    g.fillRect(x0, 0, S / 8, S);
    g.fillStyle = 'rgba(20,40,30,0.12)';
    g.fillRect(x0 + S / 8 - 5, 0, 5, S);
    g.fillStyle = 'rgba(255,255,255,0.10)';
    g.fillRect(x0, 0, 3, S);
  }
  g.fillStyle = 'rgba(60,60,50,0.08)';
  for (i = 0; i < 60; i++) g.fillRect((i * 29) % S, (i * 43) % S, 2, 3);
  return toTex(cv, true);
}
/* 竖式霓虹招牌板 v2：暗底 + 光管外晕 + 描边字三层笔画（背衬→色管→白芯） */
var NEON_COLS = ['#ff6fae', '#43e8e0', '#ffd94a', '#ff9040', '#c86fe8'];
var NEON_GLYPHS = ['蘭', '酒', '吧', '夜', '桂', '坊'];
function texNeonV(ci, nGlyph) {
  var w = 112, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  var col = NEON_COLS[ci % NEON_COLS.length];
  g.fillStyle = '#1c1220'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,255,255,0.05)'; g.fillRect(10, 10, w - 20, h - 20);
  /* 光管外框：外晕→加浓→白管芯→内衬线（笔画层次） */
  g.strokeStyle = col; g.lineWidth = 14; g.strokeRect(14, 14, w - 28, h - 28);
  g.strokeStyle = col; g.lineWidth = 7; g.strokeRect(14, 14, w - 28, h - 28);
  g.strokeStyle = '#ffffff'; g.lineWidth = 2.5; g.strokeRect(14, 14, w - 28, h - 28);
  g.strokeStyle = 'rgba(255,255,255,0.22)'; g.lineWidth = 1.5; g.strokeRect(24, 24, w - 48, h - 48);
  /* 竖排描边字：暗背衬→色管→白芯 三层 */
  g.textAlign = 'center'; g.textBaseline = 'middle';
  var i;
  var step = (h - 108) / nGlyph;
  g.font = 'bold 46px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  for (i = 0; i < nGlyph; i++) {
    var ch = NEON_GLYPHS[(ci + i) % NEON_GLYPHS.length];
    var cy = 62 + i * step;
    g.strokeStyle = '#180f14'; g.lineWidth = 12; g.strokeText(ch, w / 2, cy);
    g.strokeStyle = col; g.lineWidth = 6.5; g.strokeText(ch, w / 2, cy);
    g.strokeStyle = '#fff8f0'; g.lineWidth = 2.2; g.strokeText(ch, w / 2, cy);
    g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillText(ch, w / 2, cy);
  }
  /* 底部三色指示灯泡 */
  for (i = 0; i < 3; i++) {
    g.fillStyle = NEON_COLS[(ci + i + 1) % NEON_COLS.length];
    g.beginPath(); g.arc(w / 2 + (i - 1) * 18, h - 30, 4.5, 0, PI * 2); g.fill();
    g.fillStyle = '#ffffff';
    g.beginPath(); g.arc(w / 2 + (i - 1) * 18 - 1, h - 31, 1.6, 0, PI * 2); g.fill();
  }
  return toTex(cv, true);
}
/* 鎏金横匾「兰桂坊」（lv4 门楣，四角泡钉） */
function texPlaque() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#8e6a1e'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d9a53f'; g.fillRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#b8862c'; g.fillRect(6, h - 18, w - 12, 12);
  g.strokeStyle = '#6e4e12'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#a02818';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('兰桂坊', w / 2, h / 2 + 2);
  g.fillStyle = '#f4cf78';
  g.beginPath(); g.arc(14, 14, 4, 0, PI * 2); g.fill();
  g.beginPath(); g.arc(w - 14, 14, 4, 0, PI * 2); g.fill();
  g.beginPath(); g.arc(14, h - 14, 4, 0, PI * 2); g.fill();
  g.beginPath(); g.arc(w - 14, h - 14, 4, 0, PI * 2); g.fill();
  return toTex(cv, true);
}
/* 垂带石浮雕（祥云浅雕 + 金屑，lv4 大踏步垂带） */
function texRampStone() {
  var w = 96, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#a49e8c'; g.fillRect(0, 0, w, h);
  var i;
  for (i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(70,66,52,0.10)';
    g.fillRect((h1(i * 1.7) * w) | 0, (h1(i * 2.3) * h) | 0, 2, 2);
  }
  g.strokeStyle = '#7c7660'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10);
  g.strokeStyle = 'rgba(217,165,63,0.4)'; g.lineWidth = 1.5; g.strokeRect(10, 10, w - 20, h - 20);
  g.strokeStyle = '#847e68'; g.lineWidth = 3;
  g.beginPath(); g.arc(w / 2, h * 0.4, 13, PI * 0.9, PI * 2.1); g.stroke();
  g.beginPath(); g.arc(w / 2 - 13, h * 0.58, 9, PI * 0.8, PI * 2.2); g.stroke();
  g.beginPath(); g.arc(w / 2 + 13, h * 0.58, 9, PI * 0.8, PI * 2.2); g.stroke();
  g.beginPath(); g.arc(w / 2, h * 0.78, 6, 0, PI * 2); g.stroke();
  for (i = 0; i < 14; i++) {
    g.fillStyle = 'rgba(217,165,63,0.5)';
    g.fillRect((h1(i * 3.1) * w) | 0, (h1(i * 4.7) * h) | 0, 1, 1);
  }
  return toTex(cv, true);
}

var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图分区取样） */
function Mats() {
  return {
    ashlar:    MAT('p36ashlar', function () { var t = getTex('ashlar', texAshlar); return std('#ffffff', { map: t, bump: t, bumpScale: 0.02, rough: 0.9 }); }),
    concrete:  MAT('p36concrete', function () { var t = getTex('conc', texConcrete); return std('#ffffff', { map: t, rough: 0.92 }); }),
    tileDarkS: MAT('p36tileDS', function () { var t = getTex('tileD', texTileDark); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.68 }); }),
    tileDarkH: MAT('p36tileDH', function () { var t = getTex('tileD', texTileDark); return std('#aab2bc', { map: t, bump: t, bumpScale: 0.014, rough: 0.74 }); }),
    tileTealS: MAT('p36tealS', function () { var t = getTex('teal', texTileTeal); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.55 }); }),
    tileTealH: MAT('p36tealH', function () { var t = getTex('teal', texTileTeal); return std('#b7d2c8', { map: t, bump: t, bumpScale: 0.014, rough: 0.6 }); }),
    slat:      MAT('p36slat', function () { var t = getTex('slat', texSlat); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.85 }); }),
    rampStone: MAT('p36ramp', function () { var t = getTex('ramp', texRampStone); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.9 }); }),
    timber:    MAT('p36timber', function () { return std('#5a4430', { rough: 0.85 }); }),
    timberD:   MAT('p36timberD', function () { return std('#43311f', { rough: 0.88 }); }),
    red:       MAT('p36red', function () { return std('#b23828', { rough: 0.5 }); }),
    redD:      MAT('p36redD', function () { return std('#8e2a1e', { rough: 0.58 }); }),
    gold:      MAT('p36gold', function () { return std('#d9a53f', { rough: 0.35, metal: 0.75 }); }),
    goldD:     MAT('p36goldD', function () { return std('#b8862c', { rough: 0.42, metal: 0.7 }); }),
    stone:     MAT('p36stone', function () { return std('#aba796', { rough: 0.9 }); }),
    stoneD:    MAT('p36stoneD', function () { return std('#8b877a', { rough: 0.92 }); }),
    steel:     MAT('p36steel', function () { return std('#4a4e54', { rough: 0.55, metal: 0.4 }); }),
    steel2:    MAT('p36steel2', function () { return std('#9aa0a8', { rough: 0.5, metal: 0.45 }); }),
    tankSteel: MAT('p36tank', function () { return std('#7c828a', { rough: 0.5, metal: 0.5 }); }),
    wire:      MAT('p36wire', function () { return std('#26282c', { rough: 0.6, metal: 0.3 }); }),
    grass:     MAT('p36grass', function () { return std('#6f9a4e', { rough: 0.95 }); }),
    grassD:    MAT('p36grassD', function () { return std('#5d8040', { rough: 0.95 }); }),
    pave:      MAT('p36pave', function () { return std('#b5ac97', { rough: 0.95 }); }),
    paveD:     MAT('p36paveD', function () { return std('#9a917c', { rough: 0.95 }); }),
    glass:     MAT('p36glass', function () { return std('#3a2c1c', { rough: 0.4, emissive: '#ffb968', ei: 0.35 }); }),
    glassy:    MAT('p36glassy', function () { return std('#e6efe9', { rough: 0.18, metal: 0.05 }); }),
    wine:      MAT('p36wine', function () { return std('#7a1f24', { rough: 0.3, emissive: '#e85a4a', ei: 0.18 }); }),
    bloom1:    MAT('p36bloom1', function () { return std('#e0688a', { rough: 0.6 }); }),
    bloom2:    MAT('p36bloom2', function () { return std('#e8b04a', { rough: 0.6 }); }),
    stripe:    MAT('p36stripe', function () { var t = getTex('stripe', texStripe); return std('#ffffff', { map: t, rough: 0.8 }); }),
    awnRed:    MAT('p36awnRed', function () { return std('#b23828', { rough: 0.72 }); }),
    lantern:   MAT('p36lantern', function () { return std('#e8d9b0', { rough: 0.55, emissive: '#ffcf8a', ei: 0.6 }); }),
    bulb0:     MAT('p36bulb0', function () { return std('#ffc887', { rough: 0.4, emissive: '#ffc887', ei: 0.75 }); }),
    bulb1:     MAT('p36bulb1', function () { return std('#ffc887', { rough: 0.4, emissive: '#ffc887', ei: 0.75 }); }),
    bulb2:     MAT('p36bulb2', function () { return std('#ffc887', { rough: 0.4, emissive: '#ffc887', ei: 0.75 }); }),
    candle0:   MAT('p36candle0', function () { return std('#ffd27a', { rough: 0.4, emissive: '#ffb45e', ei: 0.9 }); }),
    candle1:   MAT('p36candle1', function () { return std('#ffd27a', { rough: 0.4, emissive: '#ffb45e', ei: 0.9 }); }),
    candle2:   MAT('p36candle2', function () { return std('#ffd27a', { rough: 0.4, emissive: '#ffb45e', ei: 0.9 }); }),
    bottleG:   MAT('p36bottleG', function () { return std('#3f6b3a', { rough: 0.3, emissive: '#9fdc8a', ei: 0.12 }); }),
    bottleA:   MAT('p36bottleA', function () { return std('#7a4a20', { rough: 0.3, emissive: '#e8b06a', ei: 0.12 }); })
  };
}

/* ================= 2. 预制件（兰桂坊独有语汇 v2） ================= */

/* 暖光玻璃窗：深框 + 发光玻面 + 十字棂 + 石窗台（呼吸动画挂 glass 材质） */
function windowGlow(M, w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.032, M.timberD));
  g.add(box(w, h, 0.03, M.glass, 0, 0, 0.004));
  g.add(box(0.026, h, 0.036, M.timberD, 0, 0, 0.008));
  g.add(box(w, 0.026, 0.036, M.timberD, 0, 0, 0.008));
  g.add(box(w + 0.09, 0.016, 0.05, M.stoneD, 0, -(h / 2 + 0.033), 0.02));
  return g;
}

/* 店门：暗洞 + 门板 + 铜环拉手 + 石门槛 + 门楣（楣材可变：石屋木楣 / 会所金楣） */
function barDoor(M, w, h, y0, doorMat, lintelMat, handleMat) {
  var g = grp();
  g.add(box(w + 0.07, h + 0.05, 0.04, M.timberD, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.045, M.timberD, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.94, h * 0.9, 0.05, doorMat, 0, y0 + h / 2, 0.006));
  var hd = mesh(new THREE.TorusGeometry(0.015, 0.004, 8, 12), handleMat || M.steel);
  hd.position.set(w * 0.3, y0 + h * 0.52, 0.034); g.add(hd);
  g.add(box(w + 0.02, 0.022, 0.08, M.stoneD, 0, y0 - 0.011, 0.014));
  g.add(box(w + 0.12, 0.05, 0.06, lintelMat, 0, y0 + h + 0.026, 0.008));
  return g;
}

/* 霓虹光管框：板缘四面真发光光管（外管色 + 高亮管芯），缠绕描边语汇 */
function neonTubeFrame(M, w, h, ci) {
  var g = grp();
  var t = 0.013, d = 0.014;
  var m = MAT('p36ntube' + ci, function () {
    var col = NEON_COLS[ci % NEON_COLS.length];
    return std(col, { rough: 0.35, emissive: col, ei: 1.0 });
  });
  g.add(box(w + t, t, d, m, 0, h / 2, 0));
  g.add(box(w + t, t, d, m, 0, -h / 2, 0));
  g.add(box(t, h - t * 2, d, m, -w / 2, 0, 0));
  g.add(box(t, h - t * 2, d, m, w / 2, 0, 0));
  return g;
}

/* 霓虹招牌板 v2：暗背板 + 辉光字面（emissiveMap 三层笔画）+ 真光管框；slot 0..2 三相追闪 */
function neonBoard(M, w, h, ci, anims, slot) {
  var g = grp();
  slot = ((slot % 3) + 3) % 3;
  g.add(box(w + 0.024, h + 0.024, 0.024, M.timberD));
  var base = MAT('p36neon' + ci + '_' + slot, function () {
    var t = getTex('neon' + ci, (function (c) { return function () { return texNeonV(c, 2 + (c % 2)); }; })(ci));
    var m = std('#ffffff', { map: t, rough: 0.45 });
    m.emissive = C('#ffffff');
    m.emissiveMap = t;
    m.emissiveIntensity = 0.85;
    return m;
  });
  var face = mesh(new THREE.PlaneGeometry(w, h), base);
  face.position.z = 0.014; g.add(face);
  var tube = neonTubeFrame(M, w, h, ci);
  tube.position.z = 0.023; g.add(tube);
  var tm = tube.children[0].material;
  anims.push(function (t) {
    var v = 0.85 + 0.18 * sin(t * 2.1 + slot * 2.1 + ci * 0.9);
    base.emissiveIntensity = v;
    tm.emissiveIntensity = 0.9 + 0.2 * sin(t * 2.1 + slot * 2.1 + ci * 0.9);
  });
  return g;
}

/* 霓虹招牌阵 v2：竖列导轨/立柱 + 分板金属托架（托臂+螺栓+中横托）+ 顶帽金珠；
 * bracket=true 出墙括臂；freestand=true 落地立柱（底座分体） */
function neonColumn(M, parent, x, zOut, y0, n, bw, bh, ci0, anims, bracket, freestand) {
  var g = grp();
  var step = bh + 0.05;
  var hTot = n * step + 0.07;
  if (freestand) {
    g.add(box(0.1, 0.035, 0.1, M.stoneD, 0, 0.0175, -0.03));
    g.add(box(0.045, hTot, 0.045, M.steel, 0, hTot / 2, -0.05));
  } else {
    g.add(box(0.035, hTot, 0.035, M.steel, 0, hTot / 2, -0.05));
  }
  if (bracket) {
    g.add(box(0.02, 0.02, 0.1, M.steel, 0, hTot * 0.28, -0.1));
    g.add(box(0.02, 0.02, 0.1, M.steel, 0, hTot * 0.72, -0.1));
    g.add(box(0.06, 0.018, 0.018, M.steel, 0, hTot * 0.5, -0.09));
    g.add(sph(0.011, M.steel2, 0, hTot * 0.28, -0.145));
    g.add(sph(0.011, M.steel2, 0, hTot * 0.72, -0.145));
  }
  g.add(box(0.2, 0.024, 0.09, M.steel, 0, hTot + 0.018, 0));
  var i;
  for (i = 0; i < n; i++) {
    var b = neonBoard(M, bw, bh, (ci0 + i) % NEON_COLS.length, anims, i);
    put(g, b, 0, hTot - 0.05 - i * step, 0.02);
  }
  put(g, sph(0.028, M.gold, 0, hTot + 0.055, 0.02));
  put(parent, g, x, y0, zOut);
  return y0 + hTot + 0.09;
}

/* 灯串 festoon：垂弧线管 + 吊帽 + 暖泡三组相追逐（幅度克制） */
function festoon(M, anims, parent, x0, y0, z0, x1, y1, z1, sag, nBulb) {
  var g = grp();
  var curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x0, y0, z0),
    new THREE.Vector3((x0 + x1) / 2, min(y0, y1) - sag, (z0 + z1) / 2),
    new THREE.Vector3(x1, y1, z1)
  ]);
  g.add(mesh(new THREE.TubeGeometry(curve, 12, 0.007, 6, false), M.wire));
  var i, p, pt;
  for (i = 0; i < nBulb; i++) {
    p = (i + 0.5) / nBulb;
    pt = curve.getPoint(p);
    g.add(cyl(0.008, 0.008, 0.014, 12, M.wire, pt.x, pt.y - 0.008, pt.z));
    g.add(sph(0.02, [M.bulb0, M.bulb1, M.bulb2][i % 3], pt.x, pt.y - 0.028, pt.z));
  }
  var b0 = M.bulb0, b1 = M.bulb1, b2 = M.bulb2;
  anims.push(function (t) {
    b0.emissiveIntensity = 0.72 + 0.18 * sin(t * 3.1);
    b1.emissiveIntensity = 0.72 + 0.18 * sin(t * 3.1 + 2.09);
    b2.emissiveIntensity = 0.72 + 0.18 * sin(t * 3.1 + 4.19);
  });
  parent.add(g);
  return g;
}

/* 吧凳 v2：圆凳面 + 锥腿 + 踏脚环 + 底盘（露天卡座） */
function stool(M, x, z, y0) {
  var g = grp();
  g.add(cyl(0.05, 0.055, 0.028, 12, M.timber, 0, 0.205, 0));
  g.add(cyl(0.014, 0.024, 0.19, 12, M.steel, 0, 0.1, 0));
  g.add(cyl(0.04, 0.04, 0.011, 12, M.steel2, 0, 0.075, 0));
  g.add(cyl(0.045, 0.05, 0.014, 12, M.steel, 0, 0.007, 0));
  g.position.set(x, y0 || 0, z);
  return g;
}

/* 露天吧台 v2：台身 + 台面 + 暖光前沿 + 踏脚管 + 三酒瓶 */
function barCounter(M, w, y0, x, z) {
  var g = grp();
  g.add(box(w, 0.24, 0.16, M.timberD, 0, y0 + 0.12, 0));
  g.add(box(w + 0.05, 0.035, 0.2, M.timber, 0, y0 + 0.257, 0.01));
  g.add(box(w, 0.05, 0.02, M.glass, 0, y0 + 0.12, 0.085));
  var rail = cyl(0.008, 0.008, w - 0.05, 12, M.steel2, 0, y0 + 0.06, 0.1);
  rail.rotation.z = PI / 2; g.add(rail);
  g.add(cyl(0.014, 0.014, 0.11, 12, M.bottleG, -w * 0.22, y0 + 0.33, 0.01));
  g.add(cyl(0.014, 0.014, 0.09, 12, M.bottleA, w * 0.12, y0 + 0.32, -0.01));
  g.add(cyl(0.011, 0.011, 0.085, 12, M.bottleG, w * 0.28, y0 + 0.315, 0.02));
  g.position.set(x || 0, 0, z || 0);
  return g;
}

/* 圆桌（卡座）+ 酒杯 + 烛灯 */
function barTable(M, x, z, y0) {
  var g = grp();
  g.add(cyl(0.095, 0.095, 0.02, 12, M.timber, 0, 0.29, 0));
  g.add(cyl(0.014, 0.018, 0.26, 12, M.steel, 0, 0.15, 0));
  g.add(cyl(0.06, 0.065, 0.014, 12, M.steel, 0, 0.007, 0));
  g.position.set(x, y0 || 0, z);
  return g;
}
function wineGlass(M, x, y, z) {
  var g = grp();
  g.add(cyl(0.005, 0.007, 0.026, 12, M.glassy, 0, 0.013, 0));
  g.add(cyl(0.02, 0.013, 0.03, 12, M.glassy, 0, 0.041, 0));
  g.add(cyl(0.016, 0.016, 0.007, 12, M.wine, 0, 0.037, 0));
  g.position.set(x, y || 0, z);
  return g;
}
function candleLamp(M, x, y, z, anims, ph) {
  var g = grp();
  g.add(cyl(0.02, 0.023, 0.036, 12, M.lantern, 0, 0.018, 0));
  g.add(cyl(0.024, 0.026, 0.008, 12, M.gold, 0, 0.004, 0));
  var m = [M.candle0, M.candle1, M.candle2][ph % 3];
  g.add(sph(0.011, m, 0, 0.046, 0));
  g.position.set(x, y || 0, z);
  anims.push(function (t) { m.emissiveIntensity = 0.85 + 0.15 * sin(t * 2.4 + (ph % 3) * 2.09); });
  return g;
}

/* 雨棚 v2：斜面 + 锯齿帷边 + 墙侧安装块（可选前撑杆） */
function awning(M, w, d, mat, x, y, z, poles) {
  var g = grp();
  var slope = mesh(new THREE.BoxGeometry(w, 0.018, d), mat);
  slope.rotation.x = 0.32;
  slope.position.set(0, d * 0.16, d * 0.42);
  g.add(slope);
  g.add(box(w, 0.05, 0.016, mat, 0, 0.02, d * 0.86));
  var nT = w > 0.9 ? 6 : 3, i;
  for (i = 0; i < nT; i++) {
    g.add(box(w / nT * 0.6, 0.042, 0.012, mat, -w / 2 + (i + 0.5) * (w / nT), -0.013, d * 0.86 + 0.004));
  }
  g.add(box(0.024, 0.12, 0.024, M.steel, -w / 2 + 0.06, 0.1, 0));
  g.add(box(0.024, 0.12, 0.024, M.steel, w / 2 - 0.06, 0.1, 0));
  if (poles) {
    var ph = y - 0.02;
    g.add(cyl(0.011, 0.013, ph, 12, M.timberD, -w / 2 + 0.08, -ph / 2, d * 0.86));
    g.add(cyl(0.011, 0.013, ph, 12, M.timberD, w / 2 - 0.08, -ph / 2, d * 0.86));
  }
  g.position.set(x || 0, y || 0, z || 0);
  return g;
}

/* 工字电杆 v2：杆身 + 双横担 + 斜撑 + 绝缘子 + 垂弧电线入屋顶 */
function utilityPole(M, parent, x, z, h, wireTo) {
  var g = grp();
  g.add(cyl(0.02, 0.028, h, 12, M.timberD, 0, h / 2, 0));
  g.add(box(0.3, 0.024, 0.024, M.timberD, 0, h - 0.07, 0));
  g.add(box(0.24, 0.022, 0.022, M.timberD, 0, h - 0.2, 0));
  var b1 = box(0.014, 0.14, 0.014, M.timberD, -0.11, h - 0.16, 0); b1.rotation.z = 0.5; g.add(b1);
  var b2 = box(0.014, 0.14, 0.014, M.timberD, 0.11, h - 0.16, 0); b2.rotation.z = -0.5; g.add(b2);
  var i;
  for (i = -1; i <= 1; i++) {
    g.add(cyl(0.009, 0.009, 0.03, 12, M.wire, i * 0.12, h - 0.045, 0));
  }
  if (wireTo) {
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, h - 0.05, 0),
      new THREE.Vector3(wireTo[0] / 2, min(h - 0.05, wireTo[1]) - 0.08, wireTo[2] / 2),
      new THREE.Vector3(wireTo[0], wireTo[1], wireTo[2])
    ]);
    g.add(mesh(new THREE.TubeGeometry(curve, 10, 0.006, 6, false), M.wire));
  }
  put(parent, g, x, 0.03, z);
  return g;
}

/* 暖纸灯笼（挑挂）：筒身 + 金盖 + 穗；外层摇曳枢 + 辉光呼吸 */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var lm = M.lantern;
  g.add(cyl(0.012 * s, 0.012 * s, 0.05 * s, 12, M.timberD, 0, 0.045 * s, 0));
  g.add(cyl(0.052 * s, 0.058 * s, 0.02 * s, 12, M.gold, 0, 0.008 * s, 0));
  g.add(cyl(0.05 * s, 0.05 * s, 0.085 * s, 12, lm, 0, -0.05 * s, 0));
  g.add(cyl(0.052 * s, 0.058 * s, 0.02 * s, 12, M.gold, 0, -0.098 * s, 0));
  g.add(cyl(0.006 * s, 0.006 * s, 0.05 * s, 12, M.redD, 0, -0.135 * s, 0));
  var swing = grp();
  swing.add(g);
  anims.push(function (t) {
    swing.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.055;
    lm.emissiveIntensity = 0.6 + 0.15 * sin(t * 2.2 + (phase || 0) + 0.7);
  });
  return swing;
}

/* 深灰瓦双坡顶 v2（+ 檐下椽头排 + 脊帽三枚；迎光亮/背光暗 + 暗脊 + 翘角 + 封檐板） */
function tileRoofDark(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.08;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.032, slopeLen, k > 0 ? M.tileDarkS : M.tileDarkH, 0, 0, k * slopeLen / 2));
    for (i = 0; i < 3; i++) {
      var u = (i + 0.5) / 3;
      sg.add(box(w + over * 2 - 0.04, 0.015, 0.028, M.timberD, 0, 0.024, k * u * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.022, M.timberD, 0, -0.004, k * eave));
    var c1 = box(0.07, 0.045, 0.07, M.timberD, (w + over * 2) / 2 - 0.01, 0.045, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.045, 0.07, M.timberD, -(w + over * 2) / 2 + 0.01, 0.045, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
  }
  if (o.rafter) {
    var ry = h - eave * sin(pitch) - 0.026;
    var rz = eave * cos(pitch) + 0.012;
    for (i = 0; i < o.rafter; i++) {
      g.add(box(0.028, 0.02, 0.06, M.timberD, -w / 2 + (i + 0.5) * (w / o.rafter), ry, rz));
    }
  }
  if (o.gable !== false) {
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.042, bevelEnabled: false });
    var t1 = mesh(gg, M.timberD); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.021); g.add(t1);
    var t2 = mesh(gg, M.timberD); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.021); g.add(t2);
  }
  if (o.ridge !== false) {
    var rw = w + over * 2 + 0.04;
    g.add(box(rw, 0.055, 0.085, M.timberD, 0, h + 0.028, 0));
    var f1 = box(0.055, 0.09, 0.07, M.timberD, rw / 2 - 0.01, h + 0.085, 0);
    f1.rotation.z = 0.42; g.add(f1);
    var f2 = box(0.055, 0.09, 0.07, M.timberD, -rw / 2 + 0.01, h + 0.085, 0);
    f2.rotation.z = -0.42; g.add(f2);
    if (o.ridgeCaps) {
      for (i = -1; i <= 1; i++) {
        g.add(box(0.095, 0.02, 0.1, M.timberD, i * rw * 0.28, h + 0.066, 0));
      }
    }
  }
  return g;
}

/* 青绿腰檐 v2（lv4 层间披檐）：四坡 + 四角金起翘 + 前坡金封檐 */
function waistTealRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), i;
  var eaveF = d / 2 + 0.07, eaveS = w / 2 + 0.07;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + 0.14, 0.03, lenF, M.tileTealS, 0, 0, lenF / 2));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + 0.14, 0.03, lenF, M.tileTealH, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.03, d * 0.7, M.tileTealH, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.03, d * 0.7, M.tileTealH, -lenS / 2, 0, 0));
  var corn = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (i = 0; i < 4; i++) {
    var lift = box(0.06, 0.042, 0.06, M.gold, corn[i][0] * (eaveS - 0.015), 0.04, corn[i][1] * (eaveF - 0.015));
    lift.rotation.z = -corn[i][0] * 0.6; g.add(lift);
  }
  g.add(box(w + 0.16, 0.022, 0.016, M.gold, 0, h - eaveF * sin(pitchF) + 0.012, eaveF * cos(pitchF) + 0.012));
  return g;
}

/* 青绿歇山金脊顶 v2（lv4 顶）：四坡 + 金封檐 + 山花板金边 + 四向垂脊金珠 + 脊兽 + 四层宝顶 */
function sweptTealRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), i;
  var eaveF = d / 2 + 0.09, eaveS = w / 2 + 0.09;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.7 + 0.18, 0.032, lenF, M.tileTealS, 0, 0, lenF / 2));
  sgF.add(box(w * 0.7 + 0.2, 0.045, 0.022, M.gold, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.7 + 0.18, 0.032, lenF, M.tileTealH, 0, 0, -lenF / 2));
  /* 歇山收山：侧坡自山花底起（不再直上脊），上段由山花板封闭 */
  var gx = w * 0.35 + 0.09;                      /* 山花所在 x = 前后坡半宽 */
  var sStart = gx / cos(pitchS);
  var lenS2 = lenS - sStart;
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS2, 0.032, d * 0.78, M.tileTealH, sStart + lenS2 / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS2, 0.032, d * 0.78, M.tileTealH, -(sStart + lenS2 / 2), 0, 0));
  var corn = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (i = 0; i < 4; i++) {
    var lift = box(0.07, 0.05, 0.07, M.gold, corn[i][0] * (eaveS - 0.02), 0.045, corn[i][1] * (eaveF - 0.02));
    lift.rotation.z = -corn[i][0] * 0.62; g.add(lift);
  }
  /* 山花板（歇山两端等腰三角朱漆板 + 双斜边金博缝） */
  var hg = gx * Math.tan(pitchS);
  var zb = hg / h * eaveF * 0.92;
  var gsh = new THREE.Shape();
  gsh.moveTo(0, 0.012); gsh.lineTo(zb, -hg); gsh.lineTo(-zb, -hg); gsh.closePath();
  var ggeo = new THREE.ExtrudeGeometry(gsh, { depth: 0.016, bevelEnabled: false });
  var gm1 = mesh(ggeo, M.redD); gm1.rotation.y = PI / 2;
  gm1.position.set(gx - 0.008, h, 0); g.add(gm1);
  var gm2 = mesh(ggeo, M.redD); gm2.rotation.y = -PI / 2;
  gm2.position.set(-(gx - 0.008), h, 0); g.add(gm2);
  var eLen = Math.sqrt(zb * zb + hg * hg) + 0.01, eAng = Math.atan2(hg, zb);
  var sgn = [1, -1], si, sj;
  for (si = 0; si < 2; si++) {
    for (sj = 0; sj < 2; sj++) {
      var tr = box(0.014, 0.014, eLen, M.gold, sgn[si] * (gx + 0.012), h - hg / 2 + 0.006, sgn[sj] * zb / 2);
      tr.rotation.x = sgn[sj] * eAng; g.add(tr);
    }
  }
  /* 垂脊四向（金条 + 前坡垂脊金珠） */
  var ang = Math.atan2(eaveS, eaveF);
  var lenHip = Math.sqrt(eaveS * eaveS + eaveF * eaveF + h * h) + 0.02;
  var pitchHip = Math.asin(min(1, h / lenHip));
  var hipAng = [ang, PI - ang, PI + ang, -ang];
  for (i = 0; i < 4; i++) {
    var wrap = grp(); wrap.position.set(0, h + 0.02, 0); wrap.rotation.y = hipAng[i]; g.add(wrap);
    var drop = grp(); drop.rotation.x = pitchHip; wrap.add(drop);
    drop.add(box(0.018, 0.018, lenHip, M.gold, 0, 0, lenHip / 2));
    if (i === 0 || i === 3) {
      var bi;
      for (bi = 0; bi < 3; bi++) {
        var tt = 0.5 + bi * 0.18;
        drop.add(sph(0.009, M.gold, 0, -sin(pitchHip) * lenHip * tt, cos(pitchHip) * lenHip * tt));
      }
    }
  }
  /* 金正脊 + 双吻 + 三脊兽 */
  g.add(box(w * 0.46, 0.06, 0.08, M.gold, 0, h + 0.032, 0));
  var f1 = box(0.05, 0.11, 0.07, M.gold, w * 0.23, h + 0.09, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.05, 0.11, 0.07, M.gold, -w * 0.23, h + 0.09, 0); f2.rotation.z = -0.4; g.add(f2);
  for (i = -1; i <= 1; i++) {
    g.add(box(0.03, 0.045, 0.05, M.goldD, i * w * 0.11, h + 0.078, 0));
  }
  /* 四层宝顶：底座 → 宝柱 → 金环 → 火珠 */
  g.add(cyl(0.038, 0.048, 0.03, 12, M.gold, 0, h + 0.058, 0));
  g.add(cyl(0.016, 0.022, 0.06, 12, M.gold, 0, h + 0.1, 0));
  var ring = mesh(new THREE.TorusGeometry(0.028, 0.008, 8, 14), M.gold);
  ring.rotation.x = PI / 2; ring.position.set(0, h + 0.128, 0); g.add(ring);
  g.add(sph(0.034, M.gold, 0, h + 0.172, 0));
  return g;
}

/* 朱漆平座栏杆 v2：地栿 + 望柱金顶珠 + 直棂 + 中枋 + 金扶手（直棂数按宽自适应） */
function balustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.17, M.redD, 0, 0, 0.085));
  var n = max(5, Math.round(w / 0.14)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.14, 0.014, M.red, -w / 2 + i * (w / n), 0.085, 0.166));
  }
  g.add(box(w, 0.018, 0.014, M.red, 0, 0.042, 0.168));
  g.add(box(0.03, 0.175, 0.03, M.red, -w / 2, 0.085, 0.166));
  g.add(box(0.03, 0.175, 0.03, M.red, w / 2, 0.085, 0.166));
  g.add(sph(0.02, M.gold, -w / 2, 0.186, 0.166));
  g.add(sph(0.02, M.gold, w / 2, 0.186, 0.166));
  g.add(box(w + 0.035, 0.026, 0.026, M.gold, 0, 0.168, 0.166));
  return g;
}

/* 石狮 v2（lv4 门前一对）：基座 + 身 + 头 + 吻 + 双耳 + 前腿 + 绣球 */
function stoneLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.1 * s, 0.028 * s, 0.1 * s, M.stoneD, 0, 0.014 * s, 0));
  var body = sph(0.048 * s, M.stone, 0, 0.07 * s, -0.008 * s); body.scale.set(0.95, 0.85, 1.2); g.add(body);
  g.add(sph(0.036 * s, M.stone, 0, 0.125 * s, 0.04 * s));
  g.add(sph(0.018 * s, M.stoneD, 0, 0.115 * s, 0.072 * s));
  var e1 = mesh(new THREE.ConeGeometry(0.013 * s, 0.028 * s, 10), M.stone); put(g, e1, 0.02 * s, 0.162 * s, 0.04 * s, 0, -0.3);
  var e2 = mesh(new THREE.ConeGeometry(0.013 * s, 0.028 * s, 10), M.stone); put(g, e2, -0.02 * s, 0.162 * s, 0.04 * s, 0, 0.3);
  g.add(box(0.018 * s, 0.045 * s, 0.02 * s, M.stone, 0.032 * s, 0.04 * s, 0.045 * s));
  g.add(box(0.018 * s, 0.045 * s, 0.02 * s, M.stone, -0.032 * s, 0.04 * s, 0.045 * s));
  g.add(sph(0.017 * s, M.stone, 0.048 * s, 0.03 * s, 0.052 * s));
  return g;
}

/* 石阶 v2（窄梯级街语汇）：n 级踏步自 yTop 向 +z 降；sw=true 斜顶垂带石；nos=true 缘石 */
function stoneSteps(M, w, n, x, z0, yTop, sw, nos) {
  var g = grp(), i;
  var dh = 0.045, dd = 0.13;
  for (i = 0; i < n; i++) {
    g.add(box(w, dh, dd, M.stoneD, x || 0, yTop - dh * (i + 0.5), z0 + i * dd));
    if (nos) {
      g.add(box(w + 0.012, 0.012, 0.022, M.stone, x || 0, yTop - dh * i + 0.006, z0 + i * dd - dd / 2 + 0.006));
    }
  }
  if (sw) {
    var sh = new THREE.Shape();
    var zA = z0 - dd * 0.55, zB = z0 + n * dd - dd * 0.45;
    var yA = yTop + 0.024, yB = yTop - n * dh - 0.02;
    var yBc = max(0.012, yB);                     /* 垂带顶随踏步斜向下 */
    var yBt = max(0.004, yB - 0.11);              /* 垂带底不穿地坪 */
    sh.moveTo(-zA, yA); sh.lineTo(-zB, yBc); sh.lineTo(-zB, yBt); sh.lineTo(-zA, max(0.004, yA - 0.11)); sh.closePath();
    var geo = new THREE.ExtrudeGeometry(sh, { depth: 0.06, bevelEnabled: false });
    var s1 = mesh(geo, M.rampStone);
    s1.rotation.y = PI / 2; s1.position.set(-(w / 2 + 0.03), 0, 0); g.add(s1);
    var s2 = mesh(geo, M.rampStone);
    s2.rotation.y = PI / 2; s2.position.set(w / 2 + 0.03, 0, 0); g.add(s2);
  }
  return g;
}

/* 街面地坪：石板中央 + 四角草缘 + 灌丛（+ 零星卵石） */
function padStreet(M, w, d, pebbles) {
  var g = grp();
  g.add(box(w, 0.05, d, M.pave, 0, 0.025, 0));
  g.add(box(w + 0.04, 0.03, d + 0.04, M.paveD, 0, 0.014, 0));
  var cw = 0.34;
  g.add(box(cw, 0.016, cw, M.grass, -w / 2 + cw / 2 + 0.02, 0.056, -d / 2 + cw / 2 + 0.02));
  g.add(box(cw, 0.016, cw, M.grass, w / 2 - cw / 2 - 0.02, 0.056, -d / 2 + cw / 2 + 0.02));
  g.add(box(cw * 0.8, 0.016, cw * 0.8, M.grass, -w / 2 + cw * 0.4 + 0.02, 0.056, d / 2 - cw * 0.4 - 0.02));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD);
  bush.scale.y = 0.8; put(g, bush, w / 2 - 0.3, 0.11, -d / 2 + 0.3);
  if (pebbles) {
    var i;
    for (i = 0; i < pebbles; i++) {
      var r = 0.018 + 0.014 * h1(i * 3.3);
      var pb = sph(r, i % 2 ? M.stone : M.stoneD,
        (h1(i * 5.1) - 0.5) * (w - 0.5), 0.058 + r * 0.3, (h1(i * 7.7) - 0.5) * (d - 0.5));
      pb.scale.y = 0.7; g.add(pb);
    }
  }
  return g;
}

/* 盆栽 */
function potPlant(M, x, y, z, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.075 * s, 12, M.redD, 0, 0.037 * s, 0));
  var b = mesh(new THREE.IcosahedronGeometry(0.062 * s, 0), M.grassD);
  b.scale.y = 0.9; b.position.set(0, 0.11 * s, 0); g.add(b);
  g.position.set(x, y, z);
  return g;
}

/* 栏杆花箱（lv3 阳台 / lv2 廊沿） */
function planterBox(M, x, y, z, w) {
  var g = grp();
  g.add(box(w, 0.05, 0.09, M.timberD, 0, 0.025, 0));
  g.add(box(w + 0.015, 0.018, 0.015, M.timber, 0, 0.055, 0.045));
  var b1 = mesh(new THREE.IcosahedronGeometry(0.032, 0), M.grassD); b1.scale.y = 0.8; b1.position.set(-w * 0.22, 0.07, 0); g.add(b1);
  var b2 = mesh(new THREE.IcosahedronGeometry(0.028, 0), M.grassD); b2.scale.y = 0.8; b2.position.set(w * 0.24, 0.065, 0); g.add(b2);
  g.add(sph(0.014, M.bloom1, -w * 0.24, 0.088, 0.012));
  g.add(sph(0.012, M.bloom2, w * 0.26, 0.082, -0.01));
  g.position.set(x, y, z);
  return g;
}

/* 窗式空调机（lv3 立面） */
function acUnit(M, x, y, z) {
  var g = grp();
  g.add(box(0.15, 0.095, 0.075, M.steel2, 0, 0, 0));
  g.add(box(0.11, 0.05, 0.014, M.wire, 0, 0.008, 0.04));
  g.add(cyl(0.032, 0.032, 0.012, 12, M.wire, 0, 0.008, 0.05));
  g.position.set(x, y, z);
  return g;
}

/* 天台水箱（lv3 天面，参考图必备） */
function waterTank(M, x, y, z) {
  var g = grp();
  var i;
  for (i = 0; i < 4; i++) {
    g.add(cyl(0.008, 0.008, 0.07, 12, M.steel, (i % 2 ? 0.05 : -0.05), 0.035, (i < 2 ? 0.05 : -0.05)));
  }
  g.add(cyl(0.075, 0.075, 0.11, 12, M.tankSteel, 0, 0.125, 0));
  g.add(cyl(0.078, 0.078, 0.012, 12, M.steel, 0, 0.09, 0));
  g.add(cyl(0.078, 0.078, 0.012, 12, M.steel, 0, 0.158, 0));
  g.add(cyl(0.05, 0.075, 0.026, 12, M.steel, 0, 0.192, 0));
  g.position.set(x, y, z);
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：乱石小酒馆 + 挑杆灯笼 + 窄石梯径（h≈1.06） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padStreet(M, 2.3, 2.3, 3));
  /* 台基 + 乱石墙体 */
  g.add(box(1.26, 0.1, 0.94, M.stoneD, -0.06, 0.09, -0.06));
  g.add(box(1.08, 0.52, 0.8, M.ashlar, -0.06, 0.36, -0.06));              /* 墙 0.10-0.62 */
  /* v2: 四角木柱 + 两帮转角凸石（乱石错缝立体化） */
  g.add(box(0.05, 0.56, 0.05, M.timberD, -0.57, 0.38, 0.31));
  g.add(box(0.05, 0.56, 0.05, M.timberD, 0.45, 0.38, 0.31));
  g.add(box(0.05, 0.56, 0.05, M.timberD, -0.57, 0.38, -0.43));
  g.add(box(0.05, 0.56, 0.05, M.timberD, 0.45, 0.38, -0.43));
  g.add(box(0.05, 0.1, 0.06, M.stone, -0.615, 0.2, -0.02));
  g.add(box(0.05, 0.09, 0.06, M.stoneD, -0.615, 0.33, -0.14));
  g.add(box(0.05, 0.11, 0.06, M.stone, -0.615, 0.47, -0.26));
  g.add(box(0.05, 0.1, 0.06, M.stoneD, 0.495, 0.22, -0.02));
  g.add(box(0.05, 0.09, 0.06, M.stone, 0.495, 0.38, -0.16));
  g.add(box(0.05, 0.11, 0.06, M.stoneD, 0.495, 0.5, -0.3));
  /* 木门（左）+ 暖窗（右）+ 侧窗 + 门口窄石梯（垂带） */
  var door = barDoor(M, 0.26, 0.34, 0.1, M.timber, M.timberD, M.steel); put(g, door, -0.3, 0, 0.35);
  var win = windowGlow(M, 0.24, 0.24); put(g, win, 0.2, 0.4, 0.345);
  var win2 = windowGlow(M, 0.2, 0.2); put(g, win2, 0.488, 0.4, -0.08, PI / 2);
  g.add(stoneSteps(M, 0.4, 2, -0.3, 0.44, 0.1, true, true));
  /* 深灰瓦双坡顶（apex≈0.92 + 椽头 + 脊帽） */
  var roof = tileRoofDark(M, { w: 1.14, d: 0.92, h: 0.3, rafter: 5, ridgeCaps: true });
  put(g, roof, -0.06, 0.62, -0.06);
  /* v2: 门侧挂牌（吊臂小木匾 + 金酒徽） */
  g.add(box(0.024, 0.3, 0.024, M.timberD, 0.14, 0.5, 0.36));
  g.add(box(0.024, 0.024, 0.15, M.timberD, 0.14, 0.63, 0.42));
  g.add(box(0.13, 0.09, 0.014, M.slat, 0.14, 0.55, 0.475));
  var badge = cyl(0.024, 0.024, 0.006, 12, M.gold, 0.14, 0.555, 0.485);
  badge.rotation.x = PI / 2; g.add(badge);
  /* 挑杆灯笼（左前，摇曳+辉光） */
  var pg = grp();
  pg.add(cyl(0.016, 0.022, 0.95, 12, M.timberD, 0, 0.475, 0));
  pg.add(box(0.3, 0.026, 0.026, M.timberD, 0.1, 0.93, 0));
  var lt = lantern(M, 0.92, anims, 0.6); put(pg, lt, 0.2, 0.92, 0);
  put(g, pg, -0.95, 0.03, 0.52);
  /* 酒桶（+桶塞）+ 木箱 + 柴堆 */
  g.add(cyl(0.07, 0.078, 0.16, 12, M.timberD, 0.86, 0.13, 0.4));
  g.add(cyl(0.072, 0.072, 0.03, 12, M.steel, 0.86, 0.17, 0.4));
  g.add(cyl(0.012, 0.012, 0.02, 12, M.steel2, 0.86, 0.19, 0.462));
  g.add(box(0.22, 0.16, 0.16, M.slat, 0.72, 0.13, -0.52));
  var log1 = cyl(0.026, 0.026, 0.3, 12, M.timber, 0.98, 0.076, -0.28); log1.rotation.z = PI / 2; g.add(log1);
  var log2 = cyl(0.026, 0.026, 0.3, 12, M.timber, 0.98, 0.124, -0.28); log2.rotation.z = PI / 2; g.add(log2);
  /* v2: 露天小卡座——圆桌 + 凳 + 烛灯 + 双酒杯（酒吧街街具雏形） */
  g.add(barTable(M, 0.42, 0.62, 0.05));
  g.add(stool(M, 0.24, 0.72, 0.05));
  g.add(stool(M, 0.6, 0.52, 0.05));
  g.add(candleLamp(M, 0.42, 0.3, 0.62, anims, 0));
  g.add(wineGlass(M, 0.36, 0.3, 0.55));
  g.add(wineGlass(M, 0.48, 0.3, 0.68));
  /* 草丛点缀 */
  var tu1 = mesh(new THREE.IcosahedronGeometry(0.05, 0), M.grassD); tu1.scale.y = 0.7; put(g, tu1, -0.85, 0.08, -0.85);
  var tu2 = mesh(new THREE.IcosahedronGeometry(0.04, 0), M.grassD); tu2.scale.y = 0.7; put(g, tu2, 0.95, 0.075, 0.85);
  var tu3 = mesh(new THREE.IcosahedronGeometry(0.035, 0), M.grassD); tu3.scale.y = 0.7; put(g, tu3, -0.5, 0.07, 0.92);
  /* 暖窗呼吸 */
  var gm = M.glass;
  anims.push(function (t) { gm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：木构酒吧铺 + 条纹雨棚 + 露天卡座 + 霓虹×3 + 电杆灯串（h≈1.55） ---- */
function level2(M, anims) {
  var g = grp();
  var bx = -0.38;
  g.add(padStreet(M, 2.5, 2.2, 2));
  /* 主铺台基 + 一层开敞吧面 + 二层木廊层 */
  g.add(box(1.5, 0.1, 1.0, M.stoneD, bx, 0.09, -0.05));
  g.add(box(1.38, 0.5, 0.9, M.slat, bx, 0.39, -0.05));                    /* G0 0.14-0.64 前脸 z0.4 */
  g.add(box(1.46, 0.05, 0.96, M.timberD, bx, 0.665, -0.05));              /* 楼板 */
  g.add(box(1.3, 0.42, 0.84, M.slat, bx, 0.9, -0.05));                    /* F1 0.69-1.11 前脸 z0.37 */
  /* 一层门脸：暗店口 + 露天吧台 + 门 */
  g.add(box(0.56, 0.36, 0.04, M.timberD, bx + 0.12, 0.37, 0.405));
  g.add(barCounter(M, 0.44, 0.14, bx + 0.12, 0.36));
  var door = barDoor(M, 0.24, 0.36, 0.14, M.timber, M.timberD, M.steel); put(g, door, bx - 0.5, 0, 0.405);
  /* 绿白条纹雨棚（背檐嵌墙，前撑杆 + 锯齿帷边，前缘 z≈0.79） */
  g.add(awning(M, 1.26, 0.44, M.stripe, bx, 0.64, 0.4, true));
  /* 二层：木栏杆廊 + 暖窗×2 + 窗上迷你条纹篷 + 廊楣 */
  var balc = grp();
  balc.add(box(1.16, 0.03, 0.15, M.timberD, 0, 0, 0.075));
  var i;
  for (i = 0; i <= 8; i++) balc.add(box(0.016, 0.12, 0.013, M.timber, -0.58 + i * 0.145, 0.075, 0.145));
  balc.add(box(1.18, 0.024, 0.024, M.timberD, 0, 0.14, 0.145));
  put(g, balc, bx, 0.71, 0.4);
  var w1 = windowGlow(M, 0.22, 0.24); put(g, w1, bx - 0.28, 0.92, 0.375);
  var w2 = windowGlow(M, 0.22, 0.24); put(g, w2, bx + 0.26, 0.92, 0.375);
  g.add(awning(M, 0.32, 0.17, M.stripe, bx - 0.28, 1.065, 0.38, false));
  g.add(awning(M, 0.32, 0.17, M.stripe, bx + 0.26, 1.065, 0.38, false));
  g.add(box(1.3, 0.05, 0.05, M.timberD, bx, 1.135, 0.4));
  /* 深灰瓦坡顶（apex≈1.40，吻顶≈1.53）+ 天窗急修箱 + 通气竿 */
  var roof = tileRoofDark(M, { w: 1.24, d: 1.02, h: 0.26, ridgeCaps: true });
  put(g, roof, bx, 1.14, -0.05);
  g.add(box(0.17, 0.1, 0.15, M.slat, bx + 0.32, 1.36, -0.36));
  g.add(box(0.19, 0.018, 0.17, M.timberD, bx + 0.32, 1.415, -0.36));
  g.add(cyl(0.014, 0.014, 0.16, 12, M.steel2, bx - 0.42, 1.38, -0.42));
  /* 竖式霓虹 ×3（红/青/紫，真光管框 + 吊链）自雨棚帷边与二层墙角垂挂 */
  var hanger;
  var nb1 = neonBoard(M, 0.14, 0.4, 0, anims, 0); put(g, nb1, bx - 0.35, 0.43, 0.8);
  hanger = box(0.016, 0.06, 0.016, M.steel, bx - 0.35, 0.66, 0.79); g.add(hanger);
  var nb2 = neonBoard(M, 0.13, 0.34, 1, anims, 1); put(g, nb2, bx + 0.38, 0.45, 0.8);
  hanger = box(0.016, 0.06, 0.016, M.steel, bx + 0.38, 0.65, 0.79); g.add(hanger);
  var nb3 = neonBoard(M, 0.11, 0.26, 4, anims, 2); put(g, nb3, bx - 0.58, 1.0, 0.42);
  g.add(box(0.02, 0.02, 0.1, M.steel, bx - 0.58, 1.09, 0.38));
  /* 工字电杆 ×2（右前 + 左后，杆间垂弧线）+ 垂弧电线入屋脊 */
  utilityPole(M, g, 1.05, 0.6, 1.32, [-0.75, 1.39, -0.6]);
  utilityPole(M, g, -1.08, -0.68, 0.98, [2.13, 1.24, 1.28]);
  /* 灯串 ×2：电杆横越街面前坪 + 雨棚帷边短灯串 */
  festoon(M, anims, g, 1.05, 1.26, 0.58, -1.1, 1.0, 0.85, 0.1, 6);
  festoon(M, anims, g, -0.95, 0.62, 0.82, 0.28, 0.62, 0.82, 0.045, 4);
  /* 露天卡座：吧凳 ×3 + 圆桌座（双凳双杯烛灯） */
  g.add(stool(M, bx - 0.12, 0.72, 0.05));
  g.add(stool(M, bx + 0.12, 0.74, 0.05));
  g.add(stool(M, bx + 0.36, 0.72, 0.05));
  g.add(barTable(M, 0.78, 0.58, 0.05));
  g.add(stool(M, 0.6, 0.72, 0.05));
  g.add(stool(M, 0.96, 0.44, 0.05));
  g.add(candleLamp(M, 0.78, 0.3, 0.58, anims, 1));
  g.add(wineGlass(M, 0.72, 0.3, 0.5));
  g.add(wineGlass(M, 0.84, 0.3, 0.66));
  /* 廊沿花箱 + 盆栽 ×2 */
  g.add(planterBox(M, bx + 0.4, 0.725, 0.46, 0.3));
  g.add(potPlant(M, 0.94, 0.05, 0.9, 1.1));
  g.add(potPlant(M, -1.08, 0.05, -0.55, 0.9));
  /* 暖窗呼吸 */
  var gm = M.glass;
  anims.push(function (t) { gm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：混凝土唐楼四层 + 三列霓虹阵 + 红雨棚卡座 + 水箱天线（h≈2.26） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padStreet(M, 2.5, 2.3, 2));
  /* 石台基 + 门口踏步 */
  g.add(box(1.72, 0.12, 1.08, M.stoneD, 0, 0.11, -0.08));
  g.add(stoneSteps(M, 0.5, 2, -0.55, 0.42, 0.17, true, true));
  /* 四层退台混凝土身（0.17-1.80） */
  g.add(box(1.56, 0.4, 0.96, M.concrete, 0, 0.37, -0.08));                /* f0 0.17-0.57 前脸 z0.4 */
  g.add(box(1.62, 0.045, 1.0, M.steel, 0, 0.592, -0.08));
  g.add(box(1.44, 0.38, 0.88, M.concrete, 0, 0.805, -0.08));              /* f1 0.615-0.995 前脸 z0.36 */
  g.add(box(1.5, 0.042, 0.92, M.steel, 0, 1.016, -0.08));
  g.add(box(1.32, 0.36, 0.8, M.concrete, 0, 1.218, -0.08));               /* f2 1.037-1.398 前脸 z0.32 */
  g.add(box(1.38, 0.04, 0.84, M.steel, 0, 1.418, -0.08));
  g.add(box(1.2, 0.34, 0.74, M.concrete, 0, 1.608, -0.08));               /* f3 1.438-1.778 前脸 z0.29 */
  g.add(box(1.32, 0.05, 0.82, M.steel, 0, 1.802, -0.08));                 /* 天面板 */
  /* 一层门脸：红雨棚（前撑杆）+ 店口 + 露天卡座 */
  g.add(awning(M, 1.3, 0.42, M.awnRed, -0.18, 0.57, 0.4, true));
  g.add(box(0.5, 0.32, 0.04, M.timberD, -0.55, 0.38, 0.405));
  g.add(barCounter(M, 0.4, 0.17, 0.28, 0.36));
  g.add(stool(M, 0.1, 0.58, 0.05));
  g.add(stool(M, 0.32, 0.6, 0.05));
  g.add(stool(M, 0.54, 0.58, 0.05));
  g.add(barTable(M, -0.06, 0.72, 0.05));
  g.add(stool(M, -0.22, 0.82, 0.05));
  g.add(candleLamp(M, -0.06, 0.34, 0.72, anims, 0));
  g.add(wineGlass(M, -0.12, 0.34, 0.65));
  g.add(wineGlass(M, 0.0, 0.34, 0.79));
  g.add(barTable(M, 0.88, 0.68, 0.05));
  g.add(stool(M, 0.74, 0.8, 0.05));
  g.add(candleLamp(M, 0.88, 0.34, 0.68, anims, 2));
  g.add(wineGlass(M, 0.82, 0.34, 0.61));
  g.add(wineGlass(M, 0.94, 0.34, 0.75));
  /* f1-f3：钢栏杆阳台带 + 暖窗×2/层 + 窗式空调 ×2 + 花箱 ×2 */
  var fz = [0.3, 0.27, 0.24], wz = [0.365, 0.325, 0.285];
  var fw = [1.2, 1.08, 0.96], wy = [0.63, 1.05, 1.45], wyy = [0.83, 1.24, 1.63];
  var i, k, j;
  for (i = 0; i < 3; i++) {
    var b = grp();
    b.add(box(fw[i], 0.028, 0.13, M.steel, 0, 0, 0.065));
    for (j = 0; j <= 8; j++) b.add(box(0.014, 0.11, 0.012, M.steel, -fw[i] / 2 + j * (fw[i] / 8), 0.07, 0.125));
    b.add(box(fw[i] + 0.03, 0.02, 0.02, M.steel, 0, 0.13, 0.125));
    put(g, b, 0, wy[i], fz[i]);
    var wx = (i === 1) ? [-0.26, 0.26] : [-0.22, 0.22];
    for (k = 0; k < 2; k++) {
      var w = windowGlow(M, 0.2, 0.22);
      put(g, w, wx[k], wyy[i], wz[i]);
    }
  }
  g.add(acUnit(M, -0.26, 1.09, 0.32));
  g.add(acUnit(M, 0.22, 1.49, 0.27));
  g.add(planterBox(M, 0.34, 0.645, 0.42, 0.3));
  g.add(planterBox(M, -0.32, 1.065, 0.39, 0.3));
  /* 两翼霓虹招牌阵（左 4 板 / 右 3 板，括臂附墙）+ 外侧小立柱阵 ×2 */
  neonColumn(M, g, -0.7, 0.42, 0.3, 4, 0.15, 0.26, 0, anims, true, false);
  neonColumn(M, g, 0.7, 0.42, 0.36, 3, 0.14, 0.24, 2, anims, true, false);
  neonColumn(M, g, -0.98, 0.26, 0.55, 3, 0.11, 0.2, 4, anims, false, true);
  neonColumn(M, g, 0.98, 0.26, 0.55, 3, 0.11, 0.2, 1, anims, false, true);
  /* 天面：女儿墙（压顶 + 角柱）+ 楼梯间 + 水箱 + 天线杆 */
  g.add(box(1.32, 0.06, 0.05, M.concrete, 0, 1.855, 0.33));
  g.add(box(1.32, 0.06, 0.05, M.concrete, 0, 1.855, -0.49));
  g.add(box(0.05, 0.06, 0.82, M.concrete, -0.635, 1.855, -0.08));
  g.add(box(0.05, 0.06, 0.82, M.concrete, 0.635, 1.855, -0.08));
  g.add(box(1.36, 0.022, 0.09, M.steel, 0, 1.896, 0.33));
  g.add(box(1.36, 0.022, 0.09, M.steel, 0, 1.896, -0.49));
  g.add(box(0.09, 0.09, 0.09, M.concrete, -0.635, 1.92, 0.33));
  g.add(box(0.09, 0.09, 0.09, M.concrete, 0.635, 1.92, 0.33));
  g.add(box(0.09, 0.09, 0.09, M.concrete, -0.635, 1.92, -0.49));
  g.add(box(0.09, 0.09, 0.09, M.concrete, 0.635, 1.92, -0.49));
  g.add(box(0.42, 0.22, 0.34, M.concrete, 0.42, 1.938, -0.28));           /* 楼梯间 1.83-2.05 */
  g.add(box(0.46, 0.03, 0.38, M.steel, 0.42, 2.06, -0.28));
  g.add(waterTank(M, -0.4, 1.83, -0.34));
  var ant = grp();
  ant.add(cyl(0.008, 0.012, 0.18, 12, M.steel, 0, 0.09, 0));
  ant.add(box(0.16, 0.014, 0.014, M.steel, 0, 0.15, 0));
  ant.add(box(0.12, 0.013, 0.013, M.steel, 0, 0.11, 0));
  put(g, ant, 0.28, 2.075, -0.28);                                        /* 天线顶≈2.26 */
  /* 灯串 ×2：左阵顶 → 右女儿墙端 + 红雨棚帷边短串 */
  festoon(M, anims, g, -0.66, 1.62, 0.44, 0.62, 1.83, 0.38, 0.1, 7);
  festoon(M, anims, g, -0.8, 0.6, 0.82, 0.46, 0.6, 0.82, 0.04, 5);
  /* 盆栽 ×2 */
  g.add(potPlant(M, -0.98, 0.05, 0.62, 1.1));
  g.add(potPlant(M, 1.1, 0.05, -0.4, 0.9));
  /* 暖窗呼吸 */
  var gm = M.glass;
  anims.push(function (t) { gm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.15 + 0.9); });
  return g;
}

/* ---- lv4 地标：宫阙会所——石台基大踏步垂带 + 石狮 + 朱柱平座三层 + 青绿歇山金脊宝顶 + 霓虹阵灯串（h≈2.47） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padStreet(M, 2.5, 2.45, 2));
  /* 石台基 + 裙边 */
  g.add(box(2.3, 0.18, 1.66, M.stone, 0, 0.135, -0.1));
  g.add(box(2.38, 0.05, 1.74, M.stoneD, 0, 0.045, -0.1));
  /* 大踏步（窄梯级街的终极形态）+ 斜顶垂带石（祥云浮雕）+ 缘石 */
  g.add(stoneSteps(M, 0.8, 4, 0, 0.73, 0.225, true, true));
  /* 石狮一对（+ 绣球） */
  put(g, stoneLion(M, 1.15), -0.56, 0.225, 0.6);
  put(g, stoneLion(M, 1.15), 0.56, 0.225, 0.6);
  /* S0 一层堂：朱柱×4（柱础+金枋+雀替）+ 墙身 + 朱门金泡钉 + 暖窗×2 + 鎏金门匾 */
  var cx = [-0.42, -0.14, 0.14, 0.42], i;
  for (i = 0; i < 4; i++) {
    g.add(cyl(0.028, 0.033, 0.5, 12, M.red, cx[i], 0.48, 0.38));
    g.add(cyl(0.036, 0.04, 0.03, 12, M.stoneD, cx[i], 0.245, 0.38));
    g.add(cyl(0.032, 0.032, 0.024, 12, M.gold, cx[i], 0.66, 0.38));
  }
  g.add(box(1.22, 0.5, 0.84, M.red, 0, 0.48, -0.18));                     /* S0 0.23-0.73 前脸 z0.24 */
  g.add(box(1.06, 0.045, 0.05, M.redD, 0, 0.7, 0.38));                    /* 柱头金枋 */
  g.add(box(1.06, 0.014, 0.052, M.gold, 0, 0.725, 0.38));
  var q1 = box(0.05, 0.03, 0.045, M.gold, -0.5, 0.665, 0.38); q1.rotation.z = 0.7; g.add(q1);
  var q2 = box(0.05, 0.03, 0.045, M.gold, 0.5, 0.665, 0.38); q2.rotation.z = -0.7; g.add(q2);
  g.add(box(0.3, 0.34, 0.05, M.timberD, 0, 0.4, 0.25));
  g.add(box(0.26, 0.3, 0.055, M.redD, 0, 0.4, 0.252));
  var sr, sc;
  for (sr = 0; sr < 3; sr++) {
    for (sc = 0; sc < 2; sc++) {
      g.add(sph(0.009, M.gold, -0.065 + sc * 0.13, 0.32 + sr * 0.08, 0.283));
    }
  }
  var hr1 = mesh(new THREE.TorusGeometry(0.016, 0.004, 8, 12), M.gold); put(g, hr1, -0.09, 0.41, 0.285);
  var hr2 = mesh(new THREE.TorusGeometry(0.016, 0.004, 8, 12), M.gold); put(g, hr2, 0.09, 0.41, 0.285);
  var dw1 = windowGlow(M, 0.18, 0.22); put(g, dw1, -0.38, 0.48, 0.245);
  var dw2 = windowGlow(M, 0.18, 0.22); put(g, dw2, 0.38, 0.48, 0.245);
  g.add(box(0.56, 0.14, 0.03, M.gold, 0, 0.78, 0.25));
  var plq = mesh(new THREE.PlaneGeometry(0.5, 0.125),
    new THREE.MeshStandardMaterial({ map: getTex('plaque', texPlaque), roughness: 0.5, metalness: 0.15, flatShading: true }));
  plq.position.set(0, 0.78, 0.267); g.add(plq);
  /* T1 一层平座（朱漆地栿 + 望柱金顶珠 + 金扶手） */
  g.add(box(1.36, 0.04, 0.96, M.redD, 0, 0.75, -0.14));
  var b1 = balustrade(M, 1.26); put(g, b1, 0, 0.79, 0.17);
  /* S1 二层 + 暖窗×2（前脸 z0.22） */
  g.add(box(1.08, 0.42, 0.76, M.redD, 0, 1.0, -0.16));                    /* S1 0.79-1.21 */
  var w21 = windowGlow(M, 0.18, 0.2); put(g, w21, -0.22, 1.0, 0.225);
  var w22 = windowGlow(M, 0.18, 0.2); put(g, w22, 0.22, 1.0, 0.225);
  /* 青绿腰檐（apex≈1.43，前坡金封檐） */
  var waist = waistTealRoof(M, { w: 1.18, d: 0.88, h: 0.22 });
  put(g, waist, 0, 1.21, -0.16);
  /* S2 三层 + 暖窗（前脸 z0.16） */
  g.add(box(0.92, 0.4, 0.68, M.red, 0, 1.63, -0.18));                     /* S2 1.43-1.83 */
  var w31 = windowGlow(M, 0.16, 0.18); put(g, w31, 0, 1.62, 0.165);
  /* T2 顶平座 */
  g.add(box(1.02, 0.035, 0.72, M.redD, 0, 1.85, -0.18));
  var b2 = balustrade(M, 0.92); put(g, b2, 0, 1.885, 0.01);
  /* 青绿歇山金脊宝顶（eave≈1.84，宝顶珠≈2.47） */
  var top = sweptTealRoof(M, { w: 0.94, d: 0.8, h: 0.42 });
  put(g, top, 0, 1.84, -0.18);
  /* 顶部天线杆 ×2（嵌屋脊后坡） */
  var a1 = grp();
  a1.add(cyl(0.007, 0.011, 0.26, 12, M.steel, 0, 0.13, 0));
  a1.add(box(0.14, 0.012, 0.012, M.steel, 0, 0.2, 0));
  put(g, a1, -0.22, 2.08, -0.42);
  var a2 = grp();
  a2.add(cyl(0.007, 0.011, 0.2, 12, M.steel, 0, 0.1, 0));
  a2.add(box(0.1, 0.011, 0.011, M.steel, 0, 0.16, 0));
  put(g, a2, 0.24, 2.06, -0.44);
  /* 两翼霓虹招牌阵（落地立柱底座分体，直上山肩）——地标身份件 */
  neonColumn(M, g, -1.0, 0.42, 0.23, 4, 0.16, 0.28, 1, anims, false, true);
  neonColumn(M, g, 1.0, 0.42, 0.23, 4, 0.16, 0.28, 3, anims, false, true);
  /* 灯串 ×3（两道横越街面 + 上层短串） */
  festoon(M, anims, g, -0.95, 1.6, 0.5, 0.95, 1.6, 0.5, 0.14, 7);
  festoon(M, anims, g, -0.72, 1.04, 0.6, 0.72, 1.04, 0.6, 0.11, 6);
  festoon(M, anims, g, -0.55, 1.95, 0.32, 0.55, 1.95, 0.32, 0.07, 5);
  /* 檐下暖灯笼 ×4（下层平座吊杆 ×2 + 上层平座吊杆 ×2） */
  g.add(cyl(0.005, 0.005, 0.06, 12, M.wire, -0.52, 0.72, 0.42));
  g.add(cyl(0.005, 0.005, 0.06, 12, M.wire, 0.52, 0.72, 0.42));
  var l1 = lantern(M, 0.8, anims, 1.8); put(g, l1, -0.52, 0.69, 0.42);
  var l2 = lantern(M, 0.8, anims, 3.0); put(g, l2, 0.52, 0.69, 0.42);
  g.add(cyl(0.005, 0.005, 0.05, 12, M.wire, -0.34, 1.815, 0.14));
  g.add(cyl(0.005, 0.005, 0.05, 12, M.wire, 0.34, 1.815, 0.14));
  var l3 = lantern(M, 0.7, anims, 4.2); put(g, l3, -0.34, 1.79, 0.14);
  var l4 = lantern(M, 0.7, anims, 5.4); put(g, l4, 0.34, 1.79, 0.14);
  /* 盆栽 ×2 */
  g.add(potPlant(M, -0.92, 0.225, 0.72, 1.0));
  g.add(potPlant(M, 0.92, 0.225, 0.72, 1.0));
  /* 暖窗呼吸 */
  var gm = M.glass;
  anims.push(function (t) { gm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.05 + 1.3); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[36] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_36_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 36;
  g.userData.level = lv;
  g.userData.region = 'g7';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
