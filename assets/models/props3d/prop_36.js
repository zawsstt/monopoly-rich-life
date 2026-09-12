/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_36.js
 * -------------------------------------------------------------------------------------
 * 格 36「兰桂坊」(g7 港岛夜色) 独属建筑：兰桂坊酒吧街四阶生长史
 * 参考图 refs/prop_36.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop36/
 * object-sculpt-spec.json，validate + strict-quality 均 PASS）。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   乱石小酒馆：石砌墙+深灰瓦双坡+挑杆灯笼+窄石梯径（h≈1.00）
 *   lv2 洋房   木构酒吧铺：绿白条纹雨棚+露天吧台卡座+竖式霓虹+电杆灯串（h≈1.53）
 *   lv3 大厦   混凝土唐楼：四层阳台带+两翼霓虹招牌阵+红雨棚+天面天线（h≈2.26）
 *   lv4 地标   宫阙会所：石台基大踏步+石狮+朱柱平座三层+青绿金脊+霓虹阵灯串（h≈2.42）
 *
 * 独有语汇（自参考图提炼，与 prop_33 铜锣湾 / prop_34 尖沙咀 拉开差异）：
 *   ① 多列彩色竖式霓虹招牌阵（粉/青/黄/橙，括臂出挑，逐板呼吸追闪）——33 为少量绿框
 *     吊牌、34 为单幅红底竖幅，36 为成列分色阵
 *   ② 露天酒吧卡座（吧台+暖光酒瓶+圆凳排）——姊妹格为果蔬摊/杂货铺
 *   ③ 灯串 festoon（垂弧电线+暖泡追逐闪烁）——33 为红灯笼串
 *   ④ 窄梯级街（lv1 门口石径 → lv4 大踏步+垂带石+石狮）
 *   ⑤ 绿白条纹雨棚（lv2）→ 红雨棚（lv3）
 *   ⑥ 工字电杆+垂弧电线入屋顶（lv2）；暖光玻璃窗（全阶）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[36] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；高度带 lv1 0.8-1.2 / lv2 1.2-1.7 /
 * lv3 1.7-2.3 / lv4 2.3-3.0；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_36] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 颜色 / 材质基元（std: sRGB→Linear，同 buildings3d） ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos, max = Math.max, min = Math.min;
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

/* 乱石砌块：错缝石块 + 值域斑驳（map+bump 同源，lv1 墙体） */
function texAshlar() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#6e6858'; g.fillRect(0, 0, S, S);
  var rows = 6, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh, off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S, w = S / 3 - 4;
      var tone = 0.82 + 0.14 * (((i * 7 + k * 13) % 10) / 10);
      var r = Math.floor(148 * tone), gg = Math.floor(140 * tone), b = Math.floor(120 * tone);
      g.fillStyle = 'rgb(' + r + ',' + gg + ',' + b + ')';
      g.fillRect(x + 2, y + 2, w, rh - 4);
      g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(x + 2, y + 2, w, 2);
      g.fillStyle = 'rgba(30,28,20,0.35)'; g.fillRect(x + 2, y + rh - 5, w, 3);
    }
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.045)' : 'rgba(30,34,24,0.09)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 暖灰混凝土：细噪 + 抹痕水渍（lv3 唐楼身） */
function texConcrete() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#a39f92'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.055)' : 'rgba(96,92,80,0.075)';
    g.fillRect((i * 31) % S, (i * 47) % S, 3, 2);
  }
  for (i = 0; i < 6; i++) {
    g.fillStyle = 'rgba(90,88,76,0.10)';
    g.fillRect((i * 17 + 5) % S, 0, 2, S);
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
/* 绿白条纹雨棚布（竖条纹，lv2） */
function texStripe() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e8e2ce'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 8; i++) {
    g.fillStyle = (i % 2) ? '#4c8a72' : '#e8e2ce';
    g.fillRect(i * (S / 8), 0, S / 8, S);
  }
  g.fillStyle = 'rgba(60,60,50,0.08)';
  for (i = 0; i < 60; i++) g.fillRect((i * 29) % S, (i * 43) % S, 2, 3);
  return toTex(cv, true);
}
/* 竖式霓虹招牌板：暗底 + 彩色辉光边 + 竖排字（ci: 色号） */
var NEON_COLS = ['#ff6fae', '#43e8e0', '#ffd94a', '#ff9040', '#c86fe8'];
var NEON_GLYPHS = ['蘭', '酒', '吧', '夜', '桂', '坊'];
function texNeonV(ci, nGlyph) {
  var w = 96, h = 224, cv = mkCanvas(w, h), g = cv.getContext('2d');
  var col = NEON_COLS[ci % NEON_COLS.length];
  g.fillStyle = '#241822'; g.fillRect(0, 0, w, h);
  g.strokeStyle = col; g.lineWidth = 8;
  g.shadowColor = col; g.shadowBlur = 14;
  g.strokeRect(8, 8, w - 16, h - 16);
  g.shadowBlur = 0;
  g.strokeStyle = 'rgba(255,255,255,0.25)'; g.lineWidth = 2;
  g.strokeRect(18, 18, w - 36, h - 36);
  g.fillStyle = '#fff6ee';
  g.shadowColor = col; g.shadowBlur = 10;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 44px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var i;
  for (i = 0; i < nGlyph; i++) {
    g.fillText(NEON_GLYPHS[(ci + i) % NEON_GLYPHS.length], w / 2, 64 + i * 58);
  }
  g.shadowBlur = 0;
  for (i = 0; i < 3; i++) {
    g.fillStyle = (i % 2) ? col : '#ffffff';
    g.beginPath(); g.arc(28 + i * 20, h - 28, 4, 0, PI * 2); g.fill();
  }
  return toTex(cv, true);
}
/* 鎏金横匾「兰桂坊」（lv4 门楣） */
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
  return toTex(cv, true);
}

var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图分区取样） */
function Mats() {
  return {
    ashlar:    MAT('p36ashlar', function () { var t = getTex('ashlar', texAshlar); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.9 }); }),
    concrete:  MAT('p36concrete', function () { var t = getTex('conc', texConcrete); return std('#ffffff', { map: t, rough: 0.92 }); }),
    tileDarkS: MAT('p36tileDS', function () { var t = getTex('tileD', texTileDark); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.68 }); }),
    tileDarkH: MAT('p36tileDH', function () { var t = getTex('tileD', texTileDark); return std('#aab2bc', { map: t, bump: t, bumpScale: 0.014, rough: 0.74 }); }),
    tileTealS: MAT('p36tealS', function () { var t = getTex('teal', texTileTeal); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.55 }); }),
    tileTealH: MAT('p36tealH', function () { var t = getTex('teal', texTileTeal); return std('#b7d2c8', { map: t, bump: t, bumpScale: 0.014, rough: 0.6 }); }),
    slat:      MAT('p36slat', function () { var t = getTex('slat', texSlat); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.85 }); }),
    timber:    MAT('p36timber', function () { return std('#5a4430', { rough: 0.85 }); }),
    timberD:   MAT('p36timberD', function () { return std('#43311f', { rough: 0.88 }); }),
    red:       MAT('p36red', function () { return std('#b23828', { rough: 0.5 }); }),
    redD:      MAT('p36redD', function () { return std('#8e2a1e', { rough: 0.58 }); }),
    gold:      MAT('p36gold', function () { return std('#d9a53f', { rough: 0.35, metal: 0.75 }); }),
    stone:     MAT('p36stone', function () { return std('#aba796', { rough: 0.9 }); }),
    stoneD:    MAT('p36stoneD', function () { return std('#8b877a', { rough: 0.92 }); }),
    steel:     MAT('p36steel', function () { return std('#4a4e54', { rough: 0.55, metal: 0.4 }); }),
    wire:      MAT('p36wire', function () { return std('#26282c', { rough: 0.6, metal: 0.3 }); }),
    grass:     MAT('p36grass', function () { return std('#6f9a4e', { rough: 0.95 }); }),
    grassD:    MAT('p36grassD', function () { return std('#5d8040', { rough: 0.95 }); }),
    pave:      MAT('p36pave', function () { return std('#b5ac97', { rough: 0.95 }); }),
    paveD:     MAT('p36paveD', function () { return std('#9a917c', { rough: 0.95 }); }),
    glass:     MAT('p36glass', function () { return std('#3a2c1c', { rough: 0.4, emissive: '#ffb968', ei: 0.35 }); }),
    stripe:    MAT('p36stripe', function () { var t = getTex('stripe', texStripe); return std('#ffffff', { map: t, rough: 0.8 }); }),
    awnRed:    MAT('p36awnRed', function () { return std('#b23828', { rough: 0.72 }); }),
    lantern:   MAT('p36lantern', function () { return std('#e8d9b0', { rough: 0.55, emissive: '#ffcf8a', ei: 0.6 }); }),
    bulb0:     MAT('p36bulb0', function () { return std('#ffc887', { rough: 0.4, emissive: '#ffc887', ei: 0.75 }); }),
    bulb1:     MAT('p36bulb1', function () { return std('#ffc887', { rough: 0.4, emissive: '#ffc887', ei: 0.75 }); }),
    bulb2:     MAT('p36bulb2', function () { return std('#ffc887', { rough: 0.4, emissive: '#ffc887', ei: 0.75 }); }),
    bottleG:   MAT('p36bottleG', function () { return std('#3f6b3a', { rough: 0.3, emissive: '#9fdc8a', ei: 0.12 }); }),
    bottleA:   MAT('p36bottleA', function () { return std('#7a4a20', { rough: 0.3, emissive: '#e8b06a', ei: 0.12 }); })
  };
}

/* ================= 2. 预制件（兰桂坊独有语汇） ================= */

/* 暖光玻璃窗：深框 + 发光玻面 + 十字棂（呼吸动画挂 glass 材质） */
function windowGlow(M, w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.032, M.timberD));
  g.add(box(w, h, 0.03, M.glass, 0, 0, 0.004));
  g.add(box(0.026, h, 0.036, M.timberD, 0, 0, 0.008));
  g.add(box(w, 0.026, 0.036, M.timberD, 0, 0, 0.008));
  return g;
}

/* 店门（暗洞 + 门板 + 门楣；楣材可变：石屋木楣 / 会所金楣） */
function barDoor(M, w, h, y0, doorMat, lintelMat) {
  var g = grp();
  g.add(box(w + 0.07, h + 0.05, 0.04, M.timberD, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.045, M.timberD, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.94, h * 0.9, 0.05, doorMat, 0, y0 + h / 2, 0.006));
  g.add(box(w + 0.12, 0.05, 0.06, lintelMat, 0, y0 + h + 0.026, 0.008));
  return g;
}

/* 霓虹招牌板：暗背板 + 辉光字面（emissiveMap）；slot 0..2 三相追闪 */
function neonBoard(M, w, h, ci, anims, slot) {
  var g = grp();
  slot = ((slot % 3) + 3) % 3;
  g.add(box(w + 0.024, h + 0.024, 0.026, M.timberD));
  var base = MAT('p36neon' + ci + '_' + slot, function () {
    var t = getTex('neon' + ci, (function (c) { return function () { return texNeonV(c, 2 + (c % 2)); }; })(ci));
    var m = std('#ffffff', { map: t, rough: 0.45 });
    m.emissive = C('#ffffff');
    m.emissiveMap = t;
    m.emissiveIntensity = 0.85;
    return m;
  });
  var face = mesh(new THREE.PlaneGeometry(w, h), base);
  face.position.z = 0.015; g.add(face);
  anims.push(function (t) { base.emissiveIntensity = 0.85 + 0.18 * sin(t * 2.1 + slot * 2.1 + ci * 0.9); });
  return g;
}

/* 霓虹招牌阵：竖列导轨 + n 板叠排 + 顶金珠；bracket=true 时出墙括臂（挂立面） */
function neonColumn(M, parent, x, zOut, y0, n, bw, bh, ci0, anims, bracket) {
  var g = grp();
  var step = bh + 0.045;
  var hTot = n * step + 0.06;
  g.add(box(0.035, hTot, 0.035, M.steel, 0, hTot / 2, -0.05));            /* 竖导轨（贴墙） */
  if (bracket) {
    g.add(box(0.02, 0.02, 0.1, M.steel, 0, hTot * 0.28, -0.1));
    g.add(box(0.02, 0.02, 0.1, M.steel, 0, hTot * 0.72, -0.1));
  }
  g.add(box(0.2, 0.024, 0.09, M.steel, 0, hTot + 0.018, 0));              /* 顶帽 */
  var i;
  for (i = 0; i < n; i++) {
    var b = neonBoard(M, bw, bh, (ci0 + i) % NEON_COLS.length, anims, i);
    put(g, b, 0, hTot - 0.05 - i * step, 0.02);
  }
  put(g, sph(0.028, M.gold, 0, hTot + 0.055, 0.02));
  put(parent, g, x, y0, zOut);
  return y0 + hTot + 0.09;
}

/* 灯串 festoon：垂弧线管 + 暖泡三组相追逐（幅度克制） */
function festoon(M, anims, parent, x0, y0, z0, x1, y1, z1, sag, nBulb) {
  var g = grp();
  var curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x0, y0, z0),
    new THREE.Vector3((x0 + x1) / 2, min(y0, y1) - sag, (z0 + z1) / 2),
    new THREE.Vector3(x1, y1, z1)
  ]);
  g.add(mesh(new THREE.TubeGeometry(curve, 12, 0.007, 5, false), M.wire));
  var i, p, pt;
  for (i = 0; i < nBulb; i++) {
    p = (i + 0.5) / nBulb;
    pt = curve.getPoint(p);
    g.add(sph(0.021, [M.bulb0, M.bulb1, M.bulb2][i % 3], pt.x, pt.y - 0.024, pt.z));
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

/* 吧凳：圆凳面 + 锥腿 + 底盘（露天卡座） */
function stool(M, x, z, y0) {
  var g = grp();
  g.add(cyl(0.05, 0.055, 0.028, 10, M.timber, 0, 0.205, 0));
  g.add(cyl(0.014, 0.024, 0.19, 8, M.steel, 0, 0.1, 0));
  g.add(cyl(0.045, 0.05, 0.014, 8, M.steel, 0, 0.007, 0));
  g.position.set(x, y0 || 0, z);
  return g;
}

/* 露天吧台：台身 + 台面 + 暖光前沿 + 双酒瓶 */
function barCounter(M, w, y0, x, z) {
  var g = grp();
  g.add(box(w, 0.24, 0.16, M.timberD, 0, y0 + 0.12, 0));
  g.add(box(w + 0.05, 0.035, 0.2, M.timber, 0, y0 + 0.257, 0.01));
  g.add(box(w, 0.05, 0.02, M.glass, 0, y0 + 0.12, 0.085));
  g.add(cyl(0.014, 0.014, 0.11, 8, M.bottleG, -w * 0.2, y0 + 0.33, 0.01));
  g.add(cyl(0.014, 0.014, 0.09, 8, M.bottleA, w * 0.15, y0 + 0.32, -0.01));
  g.position.set(x || 0, 0, z || 0);
  return g;
}

/* 雨棚：斜面 + 波浪帷边 + 墙侧安装块（mat: 条纹/红布） */
function awning(M, w, d, mat, x, y, z) {
  var g = grp();
  var slope = mesh(new THREE.BoxGeometry(w, 0.018, d), mat);
  slope.rotation.x = 0.32;
  slope.position.set(0, d * 0.16, d * 0.42);
  g.add(slope);
  g.add(box(w, 0.05, 0.016, mat, 0, 0.02, d * 0.86));
  g.add(box(0.024, 0.12, 0.024, M.steel, -w / 2 + 0.06, 0.1, 0));
  g.add(box(0.024, 0.12, 0.024, M.steel, w / 2 - 0.06, 0.1, 0));
  g.position.set(x || 0, y || 0, z || 0);
  return g;
}

/* 工字电杆：杆身 + 双横担 + 绝缘子 + 垂弧电线入屋顶（wireTo 为杆局部坐标） */
function utilityPole(M, parent, x, z, h, wireTo) {
  var g = grp();
  g.add(cyl(0.02, 0.028, h, 10, M.timberD, 0, h / 2, 0));
  g.add(box(0.3, 0.024, 0.024, M.timberD, 0, h - 0.07, 0));
  g.add(box(0.24, 0.022, 0.022, M.timberD, 0, h - 0.2, 0));
  var i;
  for (i = -1; i <= 1; i++) {
    g.add(cyl(0.009, 0.009, 0.03, 8, M.wire, i * 0.12, h - 0.045, 0));
  }
  if (wireTo) {
    var curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, h - 0.05, 0),
      new THREE.Vector3(wireTo[0] / 2, min(h - 0.05, wireTo[1]) - 0.08, wireTo[2] / 2),
      new THREE.Vector3(wireTo[0], wireTo[1], wireTo[2])
    ]);
    g.add(mesh(new THREE.TubeGeometry(curve, 10, 0.006, 5, false), M.wire));
  }
  put(parent, g, x, 0.03, z);
  return g;
}

/* 暖纸灯笼（挑挂）：筒身 + 金盖 + 穗；外层摇曳枢 + 辉光呼吸 */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var lm = M.lantern;
  g.add(cyl(0.012 * s, 0.012 * s, 0.05 * s, 6, M.timberD, 0, 0.045 * s, 0));
  g.add(cyl(0.052 * s, 0.058 * s, 0.02 * s, 10, M.gold, 0, 0.008 * s, 0));
  g.add(cyl(0.05 * s, 0.05 * s, 0.085 * s, 10, lm, 0, -0.05 * s, 0));
  g.add(cyl(0.052 * s, 0.058 * s, 0.02 * s, 10, M.gold, 0, -0.098 * s, 0));
  g.add(cyl(0.006 * s, 0.006 * s, 0.05 * s, 6, M.redD, 0, -0.135 * s, 0));
  var swing = grp();
  swing.add(g);
  anims.push(function (t) {
    swing.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.055;
    lm.emissiveIntensity = 0.6 + 0.15 * sin(t * 2.2 + (phase || 0) + 0.7);
  });
  return swing;
}

/* 深灰瓦双坡顶（迎光亮/背光暗 + 暗脊 + 翘角 + 封檐板） */
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
  }
  return g;
}

/* 青绿腰檐（lv4 层间披檐）：四坡 + 四角金起翘 */
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
  return g;
}

/* 青绿歇山金脊顶（lv4 顶）：四坡 + 四角金吻大起翘 + 金正脊双吻 + 金宝顶 */
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
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.032, d * 0.78, M.tileTealH, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.032, d * 0.78, M.tileTealH, -lenS / 2, 0, 0));
  var corn = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (i = 0; i < 4; i++) {
    var lift = box(0.07, 0.05, 0.07, M.gold, corn[i][0] * (eaveS - 0.02), 0.045, corn[i][1] * (eaveF - 0.02));
    lift.rotation.z = -corn[i][0] * 0.62; g.add(lift);
  }
  g.add(box(w * 0.46, 0.06, 0.08, M.gold, 0, h + 0.032, 0));
  var f1 = box(0.05, 0.11, 0.07, M.gold, w * 0.23, h + 0.09, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.05, 0.11, 0.07, M.gold, -w * 0.23, h + 0.09, 0); f2.rotation.z = -0.4; g.add(f2);
  g.add(cyl(0.02, 0.03, 0.05, 10, M.gold, 0, h + 0.09, 0));
  g.add(sph(0.036, M.gold, 0, h + 0.125, 0));
  return g;
}

/* 朱漆平座栏杆：地栿 + 望柱直棂 + 金扶手（直棂数按宽自适应，控 mesh 预算） */
function balustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.17, M.redD, 0, 0, 0.085));
  var n = max(5, Math.round(w / 0.14)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.14, 0.014, M.red, -w / 2 + i * (w / n), 0.085, 0.166));
  }
  g.add(box(w + 0.035, 0.026, 0.026, M.gold, 0, 0.168, 0.166));
  return g;
}

/* 石狮（lv4 门前一对）：基座 + 身 + 头 + 吻 + 双耳 + 前腿 */
function stoneLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.1 * s, 0.028 * s, 0.1 * s, M.stoneD, 0, 0.014 * s, 0));
  var body = sph(0.048 * s, M.stone, 0, 0.07 * s, -0.008 * s); body.scale.set(0.95, 0.85, 1.2); g.add(body);
  g.add(sph(0.036 * s, M.stone, 0, 0.125 * s, 0.04 * s));
  g.add(sph(0.018 * s, M.stoneD, 0, 0.115 * s, 0.072 * s));
  var e1 = mesh(new THREE.ConeGeometry(0.013 * s, 0.028 * s, 8), M.stone); put(g, e1, 0.02 * s, 0.162 * s, 0.04 * s, 0, -0.3);
  var e2 = mesh(new THREE.ConeGeometry(0.013 * s, 0.028 * s, 8), M.stone); put(g, e2, -0.02 * s, 0.162 * s, 0.04 * s, 0, 0.3);
  g.add(box(0.018 * s, 0.045 * s, 0.02 * s, M.stone, 0.032 * s, 0.04 * s, 0.045 * s));
  g.add(box(0.018 * s, 0.045 * s, 0.02 * s, M.stone, -0.032 * s, 0.04 * s, 0.045 * s));
  return g;
}

/* 石阶（窄梯级街语汇）：n 级踏步自 yTop 向 +z 降；sw=true 加两侧垂带石 */
function stoneSteps(M, w, n, x, z0, yTop, sw) {
  var g = grp(), i;
  var dh = 0.045, dd = 0.13;
  for (i = 0; i < n; i++) {
    g.add(box(w, dh, dd, M.stoneD, x || 0, yTop - dh * (i + 0.5), z0 + i * dd));
  }
  if (sw) {
    g.add(box(0.06, dh * (n + 1), dd * n, M.stoneD, -w / 2 - 0.045, yTop - dh * n / 2, z0 + dd * (n - 1) / 2));
    g.add(box(0.06, dh * (n + 1), dd * n, M.stoneD, w / 2 + 0.045, yTop - dh * n / 2, z0 + dd * (n - 1) / 2));
  }
  return g;
}

/* 街面地坪：石板中央 + 四角草缘 + 灌丛（参考图绿边石面） */
function padStreet(M, w, d) {
  var g = grp();
  g.add(box(w, 0.05, d, M.pave, 0, 0.025, 0));
  g.add(box(w + 0.04, 0.03, d + 0.04, M.paveD, 0, 0.014, 0));
  var cw = 0.34;
  g.add(box(cw, 0.016, cw, M.grass, -w / 2 + cw / 2 + 0.02, 0.056, -d / 2 + cw / 2 + 0.02));
  g.add(box(cw, 0.016, cw, M.grass, w / 2 - cw / 2 - 0.02, 0.056, -d / 2 + cw / 2 + 0.02));
  g.add(box(cw * 0.8, 0.016, cw * 0.8, M.grass, -w / 2 + cw * 0.4 + 0.02, 0.056, d / 2 - cw * 0.4 - 0.02));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD);
  bush.scale.y = 0.8; put(g, bush, w / 2 - 0.3, 0.11, -d / 2 + 0.3);
  return g;
}

/* 盆栽 */
function potPlant(M, x, y, z, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.075 * s, 10, M.redD, 0, 0.037 * s, 0));
  var b = mesh(new THREE.IcosahedronGeometry(0.062 * s, 0), M.grassD);
  b.scale.y = 0.9; b.position.set(0, 0.11 * s, 0); g.add(b);
  g.position.set(x, y, z);
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：乱石小酒馆 + 挑杆灯笼 + 窄石梯径（h≈0.98） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padStreet(M, 2.3, 2.3));
  /* 台基 + 乱石墙体 */
  g.add(box(1.26, 0.1, 0.94, M.stoneD, -0.06, 0.09, -0.06));
  g.add(box(1.08, 0.52, 0.8, M.ashlar, -0.06, 0.36, -0.06));              /* 墙 0.10-0.62 */
  /* 木门（左）+ 暖窗（右）+ 门口窄石梯 */
  var door = barDoor(M, 0.26, 0.34, 0.1, M.timber, M.timberD); put(g, door, -0.3, 0, 0.35);
  var win = windowGlow(M, 0.24, 0.24); put(g, win, 0.2, 0.4, 0.345);
  g.add(stoneSteps(M, 0.4, 2, -0.3, 0.44, 0.1));
  /* 深灰瓦双坡顶（apex≈0.92） */
  var roof = tileRoofDark(M, { w: 1.14, d: 0.92, h: 0.3 });
  put(g, roof, -0.06, 0.62, -0.06);
  /* 挑杆灯笼（左前，摇曳+辉光） */
  var pg = grp();
  pg.add(cyl(0.016, 0.022, 0.95, 8, M.timberD, 0, 0.475, 0));
  pg.add(box(0.3, 0.026, 0.026, M.timberD, 0.1, 0.93, 0));
  var lt = lantern(M, 0.92, anims, 0.6); put(pg, lt, 0.2, 0.92, 0);
  put(g, pg, -0.95, 0.03, 0.52);
  /* 酒桶 + 木箱 + 条凳（酒吧街街具雏形） */
  g.add(cyl(0.07, 0.078, 0.16, 10, M.timberD, 0.86, 0.13, 0.4));
  g.add(cyl(0.072, 0.072, 0.03, 10, M.steel, 0.86, 0.17, 0.4));
  g.add(box(0.22, 0.16, 0.16, M.slat, 0.72, 0.13, -0.52));
  g.add(box(0.26, 0.03, 0.14, M.timber, 0.35, 0.15, 0.62));
  g.add(box(0.04, 0.12, 0.12, M.stoneD, 0.24, 0.09, 0.62));
  g.add(box(0.04, 0.12, 0.12, M.stoneD, 0.46, 0.09, 0.62));
  /* 草丛点缀 */
  var tu1 = mesh(new THREE.IcosahedronGeometry(0.05, 0), M.grassD); tu1.scale.y = 0.7; put(g, tu1, -0.85, 0.08, -0.85);
  var tu2 = mesh(new THREE.IcosahedronGeometry(0.04, 0), M.grassD); tu2.scale.y = 0.7; put(g, tu2, 0.95, 0.075, 0.85);
  /* 暖窗呼吸 */
  var gm = M.glass;
  anims.push(function (t) { gm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：木构酒吧铺 + 条纹雨棚 + 露天卡座 + 霓虹×2 + 电杆灯串（h≈1.53） ---- */
function level2(M, anims) {
  var g = grp();
  var bx = -0.38;
  g.add(padStreet(M, 2.5, 2.2));
  /* 主铺台基 + 一层开敞吧面 + 二层木廊层 */
  g.add(box(1.5, 0.1, 1.0, M.stoneD, bx, 0.09, -0.05));
  g.add(box(1.38, 0.5, 0.9, M.slat, bx, 0.39, -0.05));                    /* G0 0.14-0.64 前脸 z0.4 */
  g.add(box(1.46, 0.05, 0.96, M.timberD, bx, 0.665, -0.05));              /* 楼板 */
  g.add(box(1.3, 0.42, 0.84, M.slat, bx, 0.9, -0.05));                    /* F1 0.69-1.11 前脸 z0.37 */
  /* 一层门脸：暗店口 + 露天吧台 + 门 */
  g.add(box(0.56, 0.36, 0.04, M.timberD, bx + 0.12, 0.37, 0.405));
  g.add(barCounter(M, 0.44, 0.14, bx + 0.12, 0.36));
  var door = barDoor(M, 0.24, 0.36, 0.14, M.timber, M.timberD); put(g, door, bx - 0.5, 0, 0.405);
  /* 绿白条纹雨棚（背檐嵌墙，前缘 z≈0.79） */
  g.add(awning(M, 1.26, 0.44, M.stripe, bx, 0.64, 0.4));
  /* 二层：木栏杆廊 + 暖窗×2 + 廊楣 */
  var balc = grp();
  balc.add(box(1.16, 0.03, 0.15, M.timberD, 0, 0, 0.075));
  var i;
  for (i = 0; i <= 8; i++) balc.add(box(0.016, 0.12, 0.013, M.timber, -0.58 + i * 0.145, 0.075, 0.145));
  balc.add(box(1.18, 0.024, 0.024, M.timberD, 0, 0.14, 0.145));
  put(g, balc, bx, 0.71, 0.4);
  var w1 = windowGlow(M, 0.22, 0.24); put(g, w1, bx - 0.28, 0.92, 0.375);
  var w2 = windowGlow(M, 0.22, 0.24); put(g, w2, bx + 0.26, 0.92, 0.375);
  g.add(box(1.3, 0.05, 0.05, M.timberD, bx, 1.135, 0.4));
  /* 深灰瓦坡顶（apex≈1.40，吻顶≈1.53） */
  var roof = tileRoofDark(M, { w: 1.24, d: 1.02, h: 0.26 });
  put(g, roof, bx, 1.14, -0.05);
  /* 竖式霓虹 ×2（红/粉）自雨棚帷边垂挂（前缘 z0.80，无穿模） */
  var hanger;
  var nb1 = neonBoard(M, 0.14, 0.4, 0, anims, 0); put(g, nb1, bx - 0.35, 0.43, 0.8);
  hanger = box(0.016, 0.06, 0.016, M.steel, bx - 0.35, 0.66, 0.79); g.add(hanger);
  var nb2 = neonBoard(M, 0.13, 0.34, 1, anims, 1); put(g, nb2, bx + 0.38, 0.45, 0.8);
  hanger = box(0.016, 0.06, 0.016, M.steel, bx + 0.38, 0.65, 0.79); g.add(hanger);
  /* 工字电杆（右前）+ 垂弧电线入屋脊 */
  utilityPole(M, g, 1.05, 0.6, 1.32, [-0.75, 1.39, -0.6]);
  /* 灯串：电杆横越街面前坪（弧顶在前坪上空，避开雨棚） */
  festoon(M, anims, g, 1.05, 1.26, 0.58, -1.1, 1.0, 0.85, 0.1, 6);
  /* 露天卡座：吧凳 ×3 */
  g.add(stool(M, bx - 0.12, 0.72, 0.05));
  g.add(stool(M, bx + 0.12, 0.74, 0.05));
  g.add(stool(M, bx + 0.36, 0.72, 0.05));
  /* 盆栽 ×2 */
  g.add(potPlant(M, 0.88, 0.05, 0.85, 1.1));
  g.add(potPlant(M, -1.05, 0.05, -0.62, 0.9));
  /* 暖窗呼吸 */
  var gm = M.glass;
  anims.push(function (t) { gm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：混凝土唐楼四层 + 两翼霓虹阵 + 红雨棚卡座 + 天面设备（h≈2.26） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padStreet(M, 2.5, 2.3));
  /* 石台基 + 门口踏步 */
  g.add(box(1.72, 0.12, 1.08, M.stoneD, 0, 0.11, -0.08));
  g.add(stoneSteps(M, 0.5, 2, -0.55, 0.42, 0.17));
  /* 四层退台混凝土身（0.17-1.80） */
  g.add(box(1.56, 0.4, 0.96, M.concrete, 0, 0.37, -0.08));                /* f0 0.17-0.57 前脸 z0.4 */
  g.add(box(1.62, 0.045, 1.0, M.steel, 0, 0.592, -0.08));
  g.add(box(1.44, 0.38, 0.88, M.concrete, 0, 0.805, -0.08));              /* f1 0.615-0.995 前脸 z0.36 */
  g.add(box(1.5, 0.042, 0.92, M.steel, 0, 1.016, -0.08));
  g.add(box(1.32, 0.36, 0.8, M.concrete, 0, 1.218, -0.08));               /* f2 1.037-1.398 前脸 z0.32 */
  g.add(box(1.38, 0.04, 0.84, M.steel, 0, 1.418, -0.08));
  g.add(box(1.2, 0.34, 0.74, M.concrete, 0, 1.608, -0.08));               /* f3 1.438-1.778 前脸 z0.29 */
  g.add(box(1.32, 0.05, 0.82, M.steel, 0, 1.802, -0.08));                 /* 天面板 */
  /* 一层门脸：红雨棚 + 店口 + 露天卡座凳 ×4 */
  g.add(awning(M, 1.3, 0.42, M.awnRed, -0.18, 0.57, 0.4));
  g.add(box(0.5, 0.32, 0.04, M.timberD, -0.55, 0.38, 0.405));
  g.add(barCounter(M, 0.4, 0.17, 0.28, 0.36));
  g.add(stool(M, 0.1, 0.58, 0.05));
  g.add(stool(M, 0.32, 0.6, 0.05));
  g.add(stool(M, 0.54, 0.58, 0.05));
  g.add(stool(M, 0.76, 0.55, 0.05));
  /* f1-f3：钢栏杆阳台带 + 暖窗×2/层（栏板嵌楼板，窗贴墙） */
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
  /* 两翼霓虹招牌阵（左 4 板 / 右 3 板，括臂附墙）——兰桂坊身份件 */
  neonColumn(M, g, -0.7, 0.42, 0.3, 4, 0.15, 0.26, 0, anims, true);
  neonColumn(M, g, 0.7, 0.42, 0.36, 3, 0.14, 0.24, 2, anims, true);
  /* 天面：女儿墙 + 楼梯间 + 天线杆 */
  g.add(box(1.32, 0.06, 0.05, M.concrete, 0, 1.855, 0.33));
  g.add(box(1.32, 0.06, 0.05, M.concrete, 0, 1.855, -0.49));
  g.add(box(0.05, 0.06, 0.82, M.concrete, -0.635, 1.855, -0.08));
  g.add(box(0.05, 0.06, 0.82, M.concrete, 0.635, 1.855, -0.08));
  g.add(box(0.42, 0.22, 0.34, M.concrete, 0.42, 1.938, -0.28));           /* 楼梯间 1.83-2.05 */
  g.add(box(0.46, 0.03, 0.38, M.steel, 0.42, 2.06, -0.28));
  var ant = grp();
  ant.add(cyl(0.008, 0.012, 0.18, 8, M.steel, 0, 0.09, 0));
  ant.add(box(0.16, 0.014, 0.014, M.steel, 0, 0.15, 0));
  ant.add(box(0.12, 0.013, 0.013, M.steel, 0, 0.11, 0));
  put(g, ant, 0.28, 2.075, -0.28);                                        /* 天线顶≈2.26 */
  /* 灯串：左阵顶 → 右女儿墙端 */
  festoon(M, anims, g, -0.66, 1.62, 0.44, 0.62, 1.83, 0.38, 0.1, 7);
  /* 盆栽 ×2 */
  g.add(potPlant(M, -0.95, 0.05, 0.6, 1.1));
  g.add(potPlant(M, 0.98, 0.05, -0.55, 0.9));
  /* 暖窗呼吸 */
  var gm = M.glass;
  anims.push(function (t) { gm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.15 + 0.9); });
  return g;
}

/* ---- lv4 地标：宫阙会所——石台基大踏步 + 石狮 + 朱柱三层 + 青绿金脊 + 霓虹阵灯串（h≈2.42） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padStreet(M, 2.5, 2.45));
  /* 石台基 + 裙边 */
  g.add(box(2.3, 0.18, 1.66, M.stone, 0, 0.135, -0.1));
  g.add(box(2.38, 0.05, 1.74, M.stoneD, 0, 0.045, -0.1));
  /* 大踏步（窄梯级街的终极形态）+ 垂带石 */
  g.add(stoneSteps(M, 0.8, 4, 0, 0.73, 0.225, true));
  /* 石狮一对 */
  put(g, stoneLion(M, 1.15), -0.56, 0.225, 0.6);
  put(g, stoneLion(M, 1.15), 0.56, 0.225, 0.6);
  /* S0 一层堂：朱柱×4 + 墙身 + 朱门 + 暖窗×2 + 鎏金门匾 */
  var cx = [-0.42, -0.14, 0.14, 0.42], i;
  for (i = 0; i < 4; i++) {
    g.add(cyl(0.028, 0.033, 0.5, 10, M.red, cx[i], 0.48, 0.38));
    g.add(cyl(0.036, 0.04, 0.03, 10, M.stoneD, cx[i], 0.245, 0.38));
    g.add(cyl(0.032, 0.032, 0.024, 10, M.gold, cx[i], 0.66, 0.38));
  }
  g.add(box(1.22, 0.5, 0.84, M.red, 0, 0.48, -0.18));                     /* S0 0.23-0.73 前脸 z0.24 */
  g.add(box(0.3, 0.34, 0.05, M.timberD, 0, 0.4, 0.25));
  var dw1 = windowGlow(M, 0.18, 0.22); put(g, dw1, -0.38, 0.48, 0.245);
  var dw2 = windowGlow(M, 0.18, 0.22); put(g, dw2, 0.38, 0.48, 0.245);
  g.add(box(0.56, 0.14, 0.03, M.gold, 0, 0.78, 0.25));
  var plq = mesh(new THREE.PlaneGeometry(0.5, 0.125),
    new THREE.MeshStandardMaterial({ map: getTex('plaque', texPlaque), roughness: 0.5, metalness: 0.15, flatShading: true }));
  plq.position.set(0, 0.78, 0.267); g.add(plq);
  /* T1 一层平座（栏板落在台沿内） */
  g.add(box(1.36, 0.04, 0.96, M.redD, 0, 0.75, -0.14));
  var b1 = balustrade(M, 1.26); put(g, b1, 0, 0.79, 0.17);
  /* S1 二层 + 暖窗×2（前脸 z0.22） */
  g.add(box(1.08, 0.42, 0.76, M.redD, 0, 1.0, -0.16));                    /* S1 0.79-1.21 */
  var w21 = windowGlow(M, 0.18, 0.2); put(g, w21, -0.22, 1.0, 0.225);
  var w22 = windowGlow(M, 0.18, 0.2); put(g, w22, 0.22, 1.0, 0.225);
  /* 青绿腰檐（apex≈1.43） */
  var waist = waistTealRoof(M, { w: 1.18, d: 0.88, h: 0.22 });
  put(g, waist, 0, 1.21, -0.16);
  /* S2 三层 + 暖窗（前脸 z0.16） */
  g.add(box(0.92, 0.4, 0.68, M.red, 0, 1.63, -0.18));                     /* S2 1.43-1.83 */
  var w31 = windowGlow(M, 0.16, 0.18); put(g, w31, 0, 1.62, 0.165);
  /* T2 顶平座 */
  g.add(box(1.02, 0.035, 0.72, M.redD, 0, 1.85, -0.18));
  var b2 = balustrade(M, 0.92); put(g, b2, 0, 1.885, 0.01);
  /* 青绿歇山金脊顶（eave≈1.84，宝顶≈2.42） */
  var top = sweptTealRoof(M, { w: 0.94, d: 0.8, h: 0.42 });
  put(g, top, 0, 1.84, -0.18);
  /* 顶部天线杆 ×2（嵌屋脊后坡） */
  var a1 = grp();
  a1.add(cyl(0.007, 0.011, 0.26, 8, M.steel, 0, 0.13, 0));
  a1.add(box(0.14, 0.012, 0.012, M.steel, 0, 0.2, 0));
  put(g, a1, -0.22, 2.08, -0.42);
  var a2 = grp();
  a2.add(cyl(0.007, 0.011, 0.2, 8, M.steel, 0, 0.1, 0));
  a2.add(box(0.1, 0.011, 0.011, M.steel, 0, 0.16, 0));
  put(g, a2, 0.24, 2.06, -0.44);
  /* 两翼霓虹招牌阵（立在台基上，直上山肩）——地标身份件 */
  neonColumn(M, g, -1.0, 0.42, 0.23, 4, 0.16, 0.28, 1, anims, false);
  neonColumn(M, g, 1.0, 0.42, 0.23, 4, 0.16, 0.28, 3, anims, false);
  /* 灯串 ×2（高低两道横越街面） */
  festoon(M, anims, g, -0.95, 1.6, 0.5, 0.95, 1.6, 0.5, 0.14, 7);
  festoon(M, anims, g, -0.72, 1.04, 0.6, 0.72, 1.04, 0.6, 0.11, 6);
  /* 檐下暖灯笼 ×2（吊杆自平座底）+ 盆栽 ×2 */
  g.add(cyl(0.005, 0.005, 0.06, 6, M.wire, -0.52, 0.72, 0.42));
  g.add(cyl(0.005, 0.005, 0.06, 6, M.wire, 0.52, 0.72, 0.42));
  var l1 = lantern(M, 0.8, anims, 1.8); put(g, l1, -0.52, 0.69, 0.42);
  var l2 = lantern(M, 0.8, anims, 3.0); put(g, l2, 0.52, 0.69, 0.42);
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
