/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_18.js  (v2 精修)
 * -------------------------------------------------------------------------------------
 * 格 18「锦里古街」(g4 川西木构街市) 独属建筑：锦里楼阁四阶生长史
 * 参考图 refs/prop_18.png 视觉唯一基准（三视图排版取正面），v1 轮廓/配色/布局全保留。
 *
 * v1 → v2 精修清单（对照参考图逐条清偿）：
 *   1. 穿斗木构柱网榫卯节点：lv1 板壁竖拼板+壁带+柱头榫块；lv2/3 露明柱+节点块+雀替
 *   2. 黑青筒瓦瓦垄逐垄：tileRoof 垄条按面宽自动布垄(≈0.17 间距)，瓦面纹 256px/12 垄
 *      + 檐口瓦当排条；鸱吻翘角升级双段卷吻（正脊端吻+吻尖内勾）
 *   3. 木瓦弯栰顶横行叠瓦：lv1 顶 6 道弯栰 + 2 道[1/3,2/3]加厚叠瓦层 + 圆栰脊两端栰头
 *   4. 红灯笼金盖金穗双股：灯笼骨双环 + 金盖/底箍 + 双股金穗+穗结；竖串灯笼加密
 *   5. 竹丛枝节分层：竹竿分节(2-3 段)+竹节环，叶团上下两层独立摇曳(竹摇分层)
 *   6. 油纸伞伞骨：lv4 茶摊伞加 4 伞骨+伞尖端，红瓦檐帐加垂弧瓦排+金线
 *   7. 雕花檐廊棂条：栏杆加中枋+交错斜棂（万字纹简化）；木格窗上层窗改暖光 mode:'glow'
 *   8. 金字匾额描边：匾额 512px 金字描边+双线金框+角钉；黄幌加布褶+挂杆+轻摆
 *   9. lv3 顶层屋顶花园：花箱+ mini 栏杆 + 5 株绿植；大瓦顶加瓦松青苔簇（参考图苔瓦）
 *  10. lv4 石阶大踏步 3 级+垂带；金葫芦宝顶双腹葫芦+须弥座；球段 16×12、柱段≥12（规范）
 *
 * 风格族谱（同一块地的同一种生长，对位参考图四联，轮廓不变）：
 *   lv1 小屋   木瓦弯栰小屋：板壁穿斗构架 + 双扇木门 + 木格窗 + 檐角红灯笼（h≈1.1）
 *   lv2 洋房   两层楼屋：底层开敞铺面 + 二层雕花檐廊 + 黑青瓦主顶/腰披檐（h≈1.68）
 *   lv3 大厦   三层楼阁：层层退台 + 三重檐大翘角 + 竖串灯笼 + 锦里匾/黄幌（h≈2.2）
 *   lv4 地标   石台基 + 大踏步 + 红漆柱网 + 重檐歇山金宝顶 + 红瓦檐帐 + 油纸伞（h≈2.9）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[18] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤512px）；每级 mesh ≤350；userData.anim=[fn(t,dt)]。
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
function cyl(rt, rb, h, seg, mat, x, y, z) {
  seg = Math.max(12, seg | 0 || 12);                    /* 规范：圆柱段数 ≥12 */
  var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o;
}
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function ico(r, mat, x, y, z) { var o = mesh(new THREE.IcosahedronGeometry(r, 0), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rz, rx) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz; if (rx) o.rotation.x = rx;
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

/* 冷黑青筒瓦垄（256px/12 垄）：竖垄明暗 + 垄沟深线 + 搭接横缝 + 陶面噪点 + 瓦松青苔 */
function texTileRows() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#3c413b'; g.fillRect(0, 0, S, S);
  var cols = 12, cw = S / cols, i, k;
  for (i = 0; i < cols; i++) {
    var x = i * cw;
    g.fillStyle = (i % 2) ? '#4a5049' : '#434941';            /* 垄面 */
    g.fillRect(x, 0, cw, S);
    g.fillStyle = '#585e56'; g.fillRect(x + 2, 0, 5, S);      /* 垄脊受光 */
    g.fillStyle = '#565c54'; g.fillRect(x + 3, 0, 2, S);
    g.fillStyle = '#262a25'; g.fillRect(x + cw - 6, 0, 5, S); /* 垄沟阴影 */
    g.fillStyle = 'rgba(30,33,29,0.5)';
    var off = (i % 2) ? 11 : 0;
    for (k = 0; k < 6; k++) g.fillRect(x + 3, off + k * (S / 6), cw - 6, 3); /* 搭接横缝 */
  }
  for (i = 0; i < 380; i++) {
    g.fillStyle = (i % 3) ? 'rgba(210,225,205,0.05)' : 'rgba(12,15,12,0.10)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  for (i = 0; i < 26; i++) {                                   /* 瓦松青苔 */
    var mx = (i * 97) % S, my = S - 14 - (i * 37) % 40;
    g.fillStyle = (i % 2) ? 'rgba(110,140,70,0.14)' : 'rgba(90,120,60,0.11)';
    g.fillRect(mx, my, 4 + (i % 3) * 3, 3 + (i % 2) * 2);
  }
  return toTex(cv, true);
}
/* lv1 木瓦弯栰（256px/10 行）：横行叠瓦 + 木纹纤维 + 风化噪点 + 苔斑 */
function texShingle() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#6e6250'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#7b6f5b' : '#6a5e4b';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#4e4536'; g.fillRect(0, y + rh - 4, S, 4);  /* 行间阴影缝 */
    g.fillStyle = '#8f8268'; g.fillRect(0, y + 1, S, 3);       /* 瓦栰受光缘 */
    var off = (i % 2) ? 14 : 0;
    for (k = 0; k < 9; k++) {                                   /* 竖向板瓦错缝 */
      g.fillStyle = 'rgba(52,44,32,0.4)';
      g.fillRect((off + k * 30) % S, y, 3, rh - 4);
    }
  }
  for (i = 0; i < 300; i++) {
    g.fillStyle = (i % 3) ? 'rgba(235,225,200,0.05)' : 'rgba(30,24,16,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  for (i = 0; i < 14; i++) {
    g.fillStyle = (i % 2) ? 'rgba(110,140,70,0.13)' : 'rgba(90,120,60,0.10)';
    g.fillRect((i * 61) % S, (i * 43) % S, 6 + (i % 3) * 4, 4);
  }
  return toTex(cv, true);
}
/* lv1 板壁竖拼板（256px）：立板拼缝 + 板面木纹 + 露节钉点 */
function texPlank() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#756044'; g.fillRect(0, 0, S, S);
  var bw = 32, i, k;
  for (i = 0; i < S / bw; i++) {
    var x = i * bw;
    g.fillStyle = (i % 2) ? '#7b664a' : '#6f5a40';
    g.fillRect(x, 0, bw, S);
    g.fillStyle = 'rgba(40,28,16,0.55)'; g.fillRect(x, 0, 2, S);       /* 拼缝 */
    g.fillStyle = 'rgba(190,165,125,0.16)'; g.fillRect(x + 3, 0, 3, S);/* 板缘受光 */
    for (k = 0; k < 6; k++) {                                          /* 顺纹纤维 */
      g.fillStyle = (k % 2) ? 'rgba(48,34,20,0.22)' : 'rgba(200,178,138,0.10)';
      g.fillRect(x + 6 + ((k * 13 + i * 7) % (bw - 10)), (k * 47 + i * 19) % S, 2, 26 + (k % 3) * 14);
    }
    g.fillStyle = 'rgba(30,22,12,0.6)';                                /* 露节钉点 */
    g.fillRect(x + bw / 2 - 1, 10, 2, 2); g.fillRect(x + bw / 2 - 1, S - 12, 2, 2);
  }
  return toTex(cv, true);
}
/* 米白抹灰填板（128px）：细噪 + 抹痕 */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#ded4bc'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 160; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(120,110,90,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 檐口瓦当排（256×32）：深色条 + 一排瓦当圆盘（如意纹点） */
function texEave() {
  var w = 256, h = 32, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#262a25'; g.fillRect(0, 0, w, h);
  for (var i = 0; i < 16; i++) {
    var x = 8 + i * 16;
    g.fillStyle = '#4a5049'; g.beginPath(); g.arc(x, 20, 6, 0, PI * 2); g.fill();
    g.fillStyle = '#585e56'; g.beginPath(); g.arc(x - 1.5, 18.5, 3.4, 0, PI * 2); g.fill();
    g.fillStyle = '#262a25'; g.fillRect(x - 1, 19, 2, 2);
    g.fillStyle = 'rgba(20,22,18,0.8)'; g.fillRect(x + 6, 14, 3, 12);
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
/* 横式匾额「锦里古街」（512×128）：暗红漆底 + 双线金框 + 角钉 + 金字描边 */
function texPlaqueH() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  var grd = g.createLinearGradient(0, 0, 0, h);
  grd.addColorStop(0, '#8a2a15'); grd.addColorStop(0.5, '#7c2413'); grd.addColorStop(1, '#6a1d0e');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 7; g.strokeRect(8, 8, w - 16, h - 16);
  g.strokeStyle = '#a8792a'; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44);
  g.fillStyle = '#e7c56a';
  [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]].forEach(function (p) {
    g.beginPath(); g.arc(p[0], p[1], 4, 0, PI * 2); g.fill();
  });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 72px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.lineWidth = 8; g.strokeStyle = '#3a0d05';                   /* 金字描边 */
  g.strokeText('锦里古街', w / 2, h / 2 + 3);
  g.fillStyle = '#e7c56a'; g.fillText('锦里古街', w / 2, h / 2 + 3);
  g.fillStyle = 'rgba(255,240,190,0.35)'; g.fillText('锦里古街', w / 2, h / 2 + 1);
  return toTex(cv, true);
}
/* 黄色酒幌（128×320）：米黄布 + 布褶明暗 + 朱红边 + 「锦」字描边 */
function texBanner() {
  var w = 128, h = 320, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#e3cf96'; g.fillRect(0, 0, w, h);
  for (var i = 0; i < 4; i++) {                                 /* 布褶竖向明暗 */
    var x = 18 + i * 28;
    g.fillStyle = 'rgba(120,95,50,0.13)'; g.fillRect(x, 6, 10, h - 12);
    g.fillStyle = 'rgba(255,246,214,0.25)'; g.fillRect(x + 12, 6, 5, h - 12);
  }
  g.fillStyle = '#a83e20'; g.fillRect(0, 0, w, 12); g.fillRect(0, h - 12, w, 12);
  g.fillRect(0, 0, 10, h); g.fillRect(w - 10, 0, 10, h);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 118px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.lineWidth = 10; g.strokeStyle = '#5e1c0a';                  /* 字描边 */
  g.strokeText('锦', w / 2, h / 2 + 6);
  g.fillStyle = '#a83e20'; g.fillText('锦', w / 2, h / 2 + 6);
  return toTex(cv, true);
}
function plaqueMat() {
  var m = new THREE.MeshStandardMaterial({ map: getTex('plaque', texPlaqueH), roughness: 0.55, metalness: 0.08, flatShading: true });
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
    eaveDot:   MAT('p18eaveDot', function () { var t = getTex('eave', texEave); return std('#ffffff', { map: t, rough: 0.7 }); }),
    ridge:     MAT('p18ridge', function () { return std('#23261f', { rough: 0.82 }); }),
    shingle:   MAT('p18shingle', function () { var t = getTex('shingle', texShingle); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.9 }); }),
    shingleD:  MAT('p18shingleD', function () { return std('#544a38', { rough: 0.92 }); }),
    plank:     MAT('p18plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.011, rough: 0.88 }); }),
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
    moss:      MAT('p18moss', function () { return std('#6f8f45', { rough: 0.95 }); }),
    path:      MAT('p18path', function () { var t = getTex('path', texPath); return std('#ffffff', { map: t, rough: 0.95 }); }),
    interior:  MAT('p18interior', function () { return std('#241a10', { rough: 0.95 }); }),
    glowPane:  MAT('p18glowPane', function () { return std('#4a3418', { rough: 0.9, emissive: '#ff9a4a', ei: 0.2 }); })
  };
}

/* ================= 2. 预制件（锦里独有语汇 · v2 细节加密） ================= */

/* 灯笼 v2：金盖 + 橙红壳（发光呼吸）+ 灯笼骨双环 + 金底箍 + 金穗双股+穗结 */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p18lant' + (phase || 0), function () { return std('#e0503a', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.034 * s, 0.048 * s, 0.032 * s, 12, M.gold, 0, 0.108 * s, 0));      /* 金盖 */
  var body = sph(0.088 * s, bm, 0, 0, 0); body.scale.y = 0.82; g.add(body);
  g.add(cyl(0.074 * s, 0.079 * s, 0.008 * s, 12, M.lacqDk, 0, 0.036 * s, 0));    /* 骨环上 */
  g.add(cyl(0.079 * s, 0.074 * s, 0.008 * s, 12, M.lacqDk, 0, -0.036 * s, 0));   /* 骨环下 */
  g.add(cyl(0.02 * s, 0.012 * s, 0.075 * s, 12, M.gold, 0, -0.135 * s, 0));      /* 金底箍 */
  var t1 = cyl(0.0045 * s, 0.0035 * s, 0.055 * s, 12, M.gold, 0.013 * s, -0.198 * s, 0);
  t1.rotation.z = 0.16; g.add(t1);                                               /* 金穗右股 */
  var t2 = cyl(0.0045 * s, 0.0035 * s, 0.055 * s, 12, M.gold, -0.013 * s, -0.198 * s, 0);
  t2.rotation.z = -0.16; g.add(t2);                                              /* 金穗左股 */
  g.add(sph(0.009 * s, M.gold, 0, -0.178 * s, 0));                               /* 穗结 */
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 竖串灯笼 v2：吊杆结点 + 绳 + n 只灯笼（整串轻摆，幅度克制） */
function lanternString(M, n, s, anims, phase) {
  var g = grp();
  var sway = grp(); g.add(sway);
  sway.add(cyl(0.006, 0.006, 0.06, 12, M.woodF, 0, 0.03, 0));
  var cordLen = n * 0.19 * s + 0.05;
  sway.add(cyl(0.005 * s, 0.005 * s, cordLen, 12, M.woodF, 0, -cordLen / 2, 0));
  var i;
  for (i = 0; i < n; i++) {
    var lt = lantern(M, s, anims, (phase || 0) + i * 0.9);
    put(sway, lt, 0, -0.06 - i * 0.19 * s, 0);
  }
  anims.push(function (t) { sway.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.05; sway.rotation.x = sin(t * 0.9 + (phase || 0) + 1.3) * 0.03; });
  return g;
}

/* 开敞雕花木格窗：木框 + 暗龛/暖光 + 竖棂×cols + 横格×rows（mode 'dark'|'glow'） */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  var back = (o.mode === 'glow') ? M.glowPane : M.interior;
  g.add(box(w + 0.05, h + 0.05, 0.034, M.woodF));
  g.add(box(w, h, 0.03, back, 0, 0, 0.002));
  var cols = o.cols || 1, i;
  for (i = 0; i < cols; i++) {
    var x = (i - (cols - 1) / 2) * (w / (cols + 1));
    g.add(box(0.026, h, 0.038, M.timber, x, 0, 0.008));
  }
  var rows = o.rows || 2;
  for (i = 0; i < rows; i++) {
    var y = -h / 2 + (i + 1) * h / (rows + 1);
    g.add(box(w, 0.022, 0.038, M.timber, 0, y, 0.008));
  }
  return g;
}

/* 双扇木门 v2：门框 + 暗洞 + 双扇拼板门（板壁纹）+ 门楣 + 门簪×2 */
function woodDoor(M, w, h, y0) {
  var g = grp();
  g.add(box(w + 0.08, h + 0.05, 0.04, M.woodF, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.045, M.interior, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.46, h * 0.92, 0.05, M.plank, -w * 0.24, y0 + h * 0.46, 0.006));
  g.add(box(w * 0.46, h * 0.92, 0.05, M.plank, w * 0.24, y0 + h * 0.46, 0.006));
  g.add(box(w + 0.14, 0.055, 0.07, M.timberD, 0, y0 + h + 0.03, 0.008));
  g.add(cyl(0.015, 0.015, 0.022, 12, M.timberD, -w * 0.22, y0 + h + 0.014, 0.045));
  g.add(cyl(0.015, 0.015, 0.022, 12, M.timberD, w * 0.22, y0 + h + 0.014, 0.045));
  return g;
}

/* 开敞铺面：暗龛 + 暖光 + 坐凳板 + 台面陶罐（铺面前脸） */
function shopCounter(M, w, y0, anims) {
  var g = grp();
  g.add(box(w, 0.42, 0.05, M.interior, 0, y0 + 0.21));
  var glow = mesh(new THREE.PlaneGeometry(w * 0.8, 0.3), M.glowPane);
  glow.position.set(0, y0 + 0.24, -0.022); g.add(glow);   /* 面朝 +Z：铺面暖光可见 */
  var n = 4, i;
  for (i = 0; i < n; i++) g.add(box(w / n - 0.014, 0.07, 0.02, M.timber, -w / 2 + (i + 0.5) * (w / n), y0 + 0.115, 0.028));
  g.add(box(w + 0.04, 0.05, 0.15, M.woodF, 0, y0 + 0.2, 0.055));
  g.add(cyl(0.045, 0.055, 0.09, 12, M.stoneD, -w * 0.24, y0 + 0.27, 0.055));
  g.add(cyl(0.04, 0.05, 0.08, 12, M.lacqDk, w * 0.22, y0 + 0.265, 0.055));
  return g;
}

/* 木柱（石础 + 柱身 + 金/木箍）；red=true 用红漆柱（lv4） */
function column(M, h, r, red) {
  var g = grp();
  var bodyM = red ? M.lacqBr : M.timberD;
  g.add(cyl(r * 1.5, r * 1.7, 0.05, 12, M.stoneD, 0, 0.025, 0));
  g.add(cyl(r, r, h, 12, bodyM, 0, 0.05 + h / 2, 0));
  g.add(cyl(r * 1.16, r * 1.16, 0.024, 12, red ? M.gold : M.timber, 0, 0.05 + h * 0.85, 0));
  return g;
}

/* 榫卯节点块 + 雀替（穿斗构架节点；x,z 为柱位，y 为枋下皮） */
function jointBlock(M, x, y, z, s) {
  s = s || 1;
  return box(0.062 * s, 0.05 * s, 0.05 * s, M.woodF, x, y, z);
}
function queTi(M, x, y, z, dir, s) {           /* 雀替：梁柱间斜托 */
  s = s || 1;
  var q = box(0.09 * s, 0.035 * s, 0.045 * s, M.timberD, x, y, z);
  q.rotation.z = 0.6 * dir; return q;
}

/* 木栏杆檐廊 v2（雕花版）：地栿 + 望柱 + 扶手 + 中枋 + 交错斜棂（万字纹简化）；red=红漆 */
function balconyUnit(M, w, red, anims, phase) {
  var g = grp();
  var rail = red ? M.lacq : M.timberD, railB = red ? M.lacqBr : M.timber;
  g.add(box(w, 0.035, 0.2, M.woodF, 0, 0, 0.1));
  var n = Math.max(4, Math.round(w / 0.18)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.016, 0.15, 0.014, rail, -w / 2 + i * (w / n), 0.09, 0.185));
  }
  g.add(box(w + 0.04, 0.026, 0.03, railB, 0, 0.172, 0.185));
  g.add(box(w, 0.02, 0.013, rail, 0, 0.112, 0.176));            /* 中枋 */
  var m = Math.max(3, Math.round(n / 2));
  for (i = 0; i < m; i++) {                                      /* 交错斜棂 */
    var xx = -w / 2 + (i + 0.5) * (w / m);
    var dg = box(0.011, 0.052, 0.011, rail, xx, 0.092, 0.178);
    dg.rotation.z = (i % 2) ? 0.66 : -0.66; g.add(dg);
  }
  return g;
}

/* 黑青筒瓦坡顶 v2：瓦垄逐垄（按面宽自动布垄）+ 檐口封板 + 瓦当排 + 双段卷吻翘角
 *   + 鸱吻状正脊端吻（吻身+吻尖内勾，不增高）+ 可选瓦松苔簇
 *   o: {w,d,h, over, rows(最小垄数), rPitch(垄距), gable, ridge, big, moss, gableMat} */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  var rows = Math.max(o.rows || 0, Math.round((w + over * 2) / (o.rPitch || 0.17)));
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.03, slopeLen, k > 0 ? M.tileSun : M.tileShade, 0, 0, k * slopeLen / 2));
    for (i = 0; i < rows; i++) {                                   /* 筒瓦垄：逐垄布设 */
      var u = -((w + over * 2) / 2 - 0.03) + (i + 0.5) * ((w + over * 2 - 0.06) / rows);
      sg.add(box(0.028, 0.022, slopeLen - 0.02, M.ridge, u, 0.026, k * (slopeLen / 2 - 0.02)));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.woodF, 0, -0.006, k * eave)); /* 檐口封板 */
    sg.add(box(w + over * 2 + 0.02, 0.028, 0.03, M.eaveDot, 0, -0.037, k * (eave + 0.003))); /* 瓦当排 */
    var dir = 1;
    for (i = 0; i < 2; i++) {                                      /* 大翘角：双段卷吻 */
      var ex = i ? -(w + over * 2) / 2 + 0.012 : (w + over * 2) / 2 - 0.012;
      dir = i ? -1 : 1;
      var c1 = box(0.078, 0.05, 0.072, M.ridge, ex, 0.052, k * (eave - 0.015));
      c1.rotation.z = 0.62 * dir; c1.rotation.x = -k * 0.18; sg.add(c1);
      var c2 = box(0.052, 0.062, 0.052, M.ridge, ex + dir * 0.03, 0.088, k * (eave - 0.03));
      c2.rotation.z = 1.0 * dir; c2.rotation.x = -k * 0.18; sg.add(c2);
    }
    if (o.moss) {                                                  /* 瓦松苔簇（参考图苔瓦） */
      for (i = 0; i < o.moss; i++) {
        var mz = k * slopeLen * (0.24 + 0.21 * (i % 3));
        var mx = ((i * 73) % Math.max(1, Math.floor((w + over * 2) * 100)) - (w + over * 2) * 50) / 100;
        var tuft = ico(0.032 + (i % 2) * 0.012, M.moss, mx, 0.042, mz);
        tuft.scale.set(1.3, 0.7, 1); sg.add(tuft);
      }
    }
  }
  if (o.gable) {                                                   /* 山墙封板（悬山） */
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
    var fh = 0.11 + (o.big ? 0.03 : 0);
    var f1 = box(0.06, fh, 0.08, M.ridge, rw / 2 - 0.01, h + 0.105, 0);
    f1.rotation.z = 0.5; f1.rotation.x = 0.2; g.add(f1);           /* 鸱吻吻身外翻 */
    var f2 = box(0.06, fh, 0.08, M.ridge, -rw / 2 + 0.01, h + 0.105, 0);
    f2.rotation.z = -0.5; f2.rotation.x = 0.2; g.add(f2);
    var f1b = box(0.042, 0.05, 0.06, M.ridge, rw / 2 + 0.03, h + 0.128, 0);
    f1b.rotation.z = 1.15; g.add(f1b);                             /* 吻尖内勾 */
    var f2b = box(0.042, 0.05, 0.06, M.ridge, -rw / 2 - 0.03, h + 0.128, 0);
    f2b.rotation.z = -1.15; g.add(f2b);
    if (o.big) put(g, sph(0.034, M.gold), 0, h + 0.13, 0);
  }
  return g;
}

/* lv4 歇山顶 v2：前后坡(+瓦垄) + 左右坡 + 短正脊 + 四角双段起翘（不增高） */
function sweepRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.72 + 0.2, 0.03, lenF, M.tileSun, 0, 0, lenF / 2));
  var rowsF = Math.max(4, Math.round((w * 0.72 + 0.2) / 0.2)), i;
  for (i = 0; i < rowsF; i++) {                                    /* 前坡瓦垄（主视面） */
    var u = -(w * 0.72 + 0.2) / 2 + 0.03 + (i + 0.5) * ((w * 0.72 + 0.14) / rowsF);
    sgF.add(box(0.028, 0.022, lenF - 0.02, M.ridge, u, 0.026, lenF / 2 - 0.02));
  }
  sgF.add(box(w * 0.72 + 0.22, 0.05, 0.024, M.woodF, 0, -0.006, eaveF));
  sgF.add(box(w * 0.72 + 0.22, 0.028, 0.03, M.eaveDot, 0, -0.037, eaveF + 0.003));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.72 + 0.2, 0.03, lenF, M.tileShade, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.03, d * 0.8, M.tileShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.03, d * 0.8, M.tileShade, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.085, 0.06, 0.085, M.ridge, c[0] * (eaveS - 0.02), 0.055, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.65; lift.rotation.x = c[1] * 0.2; g.add(lift);
    var tip = box(0.05, 0.06, 0.055, M.ridge, c[0] * (eaveS + 0.005), 0.09, c[1] * (eaveF - 0.035));
    tip.rotation.z = -c[0] * 1.05; tip.rotation.x = c[1] * 0.2; g.add(tip);
  });
  g.add(box(w * 0.5, 0.07, 0.1, M.ridge, 0, h + 0.035, 0));
  var f1 = box(0.06, 0.13, 0.08, M.ridge, w * 0.25, h + 0.1, 0); f1.rotation.z = 0.45; g.add(f1);
  var f2 = box(0.06, 0.13, 0.08, M.ridge, -w * 0.25, h + 0.1, 0); f2.rotation.z = -0.45; g.add(f2);
  var f1b = box(0.042, 0.05, 0.06, M.ridge, w * 0.25 + 0.03, h + 0.125, 0); f1b.rotation.z = 1.1; g.add(f1b);
  var f2b = box(0.042, 0.05, 0.06, M.ridge, -w * 0.25 - 0.03, h + 0.125, 0); f2b.rotation.z = -1.1; g.add(f2b);
  return g;
}

/* lv1 木瓦弯栰顶 v2：6 道横行弯栰 + [1/3,2/3]两道加厚叠瓦层 + 圆栰脊 + 两端栰头翘 */
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
    var nR = 6;
    for (i = 0; i < nR; i++) {                                      /* 横行弯栰叠瓦 */
      var v = (i + 0.5) / nR;
      sg.add(box(w + over * 2 - 0.03, 0.018, 0.036, M.shingleD, 0, 0.024, k * v * slopeLen * 0.92));
    }
    for (i = 0; i < 2; i++) {                                       /* 加厚叠瓦层（出檐分层） */
      var vv = 0.33 + i * 0.34;
      sg.add(box(w + over * 2 - 0.015, 0.028, 0.06, M.shingleD, 0, 0.033, k * vv * slopeLen * 0.92));
    }
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.022, M.woodF, 0, -0.005, k * eave));
    sg.add(box(w + over * 2 + 0.02, 0.026, 0.026, M.shingleD, 0, -0.032, k * (eave + 0.004)));
    var dir = 1;
    for (i = 0; i < 2; i++) {
      var ex = i ? -(w + over * 2) / 2 + 0.01 : (w + over * 2) / 2 - 0.01;
      dir = i ? -1 : 1;
      var c1 = box(0.068, 0.045, 0.068, M.woodF, ex, 0.045, k * (eave - 0.012));
      c1.rotation.z = 0.5 * dir; sg.add(c1);
      var c2 = box(0.046, 0.055, 0.048, M.woodF, ex + dir * 0.026, 0.075, k * (eave - 0.025));
      c2.rotation.z = 0.9 * dir; sg.add(c2);
    }
  }
  var roll = cyl(0.035, 0.035, w + over * 2 + 0.06, 12, M.shingleD, 0, h + 0.02, 0);
  roll.rotation.z = PI / 2; g.add(roll);                            /* 圆栰脊 */
  var e1 = sph(0.045, M.woodF, (w + over * 2 + 0.06) / 2 - 0.01, h + 0.045, 0); g.add(e1);
  var e2 = sph(0.045, M.woodF, -(w + over * 2 + 0.06) / 2 + 0.01, h + 0.045, 0); g.add(e2);
  return g;
}

/* 竹丛 v2：竹竿分节(2-3 段)+竹节环 + 叶团上下两层独立摇曳（枝节分层、竹摇克制）
 * mode: 'full' 密 | 'mid' 中 | 'lite' 疏（lv4 预算调度用） */
function bambooClump(M, h, anims, phase, mode) {
  var g = grp(); h = h || 0.9;
  mode = mode || 'full';
  var n = (mode === 'lite') ? 2 : 3;
  var leavesA = grp(), leavesB = grp(); g.add(leavesA); g.add(leavesB);
  var i, j;
  for (i = 0; i < n; i++) {
    var a = (i / n) * PI * 2 + 0.6, r = 0.05 + (i % 2) * 0.035;
    var bx = cos(a) * r, bz = sin(a) * r;
    var hh = h * (0.75 + (i % 3) * 0.14);
    var lean = 0.06 + (i % 2) * 0.05;
    var segs = (mode !== 'full' || hh < 1.1) ? 2 : 3;
    for (j = 0; j < segs; j++) {
      var segH = hh / segs;
      var yy = 0.02 + hh * (j + 0.5) / segs;
      var tpr = 0.016 - j * 0.002;
      var st = cyl(tpr - 0.002, tpr, segH, 12, M.bamboo, bx + lean * yy, yy, bz);
      st.rotation.z = lean; st.rotation.x = (i % 2 ? 1 : -1) * 0.05;
      g.add(st);
      if (j > 0) {                                                   /* 竹节环 */
        g.add(cyl(0.017 - j * 0.002, 0.017 - j * 0.002, 0.012, 12, M.bambooL,
          bx + lean * (yy - segH / 2), yy - segH / 2 + 0.004, bz));
      }
    }
    var topX = bx + lean * hh;
    var lf = ico(0.085, M.bambooL, topX, hh + 0.05, bz);
    lf.scale.set(1, 0.55, 1); leavesA.add(lf);                       /* 上层叶（随风） */
    if (mode !== 'lite' || i === 0) {
      var lf2 = ico(0.06, M.bamboo, topX + 0.055, hh - 0.02, bz - 0.045);
      lf2.scale.set(1, 0.5, 1); leavesA.add(lf2);
    }
    if (mode !== 'lite' || i === 1) {
      var lf3 = ico(0.05, M.bambooL, topX - 0.06, hh * 0.68, bz + 0.05);
      lf3.scale.set(1, 0.5, 1); leavesB.add(lf3);                    /* 下层枝叶 */
    }
  }
  anims.push(function (t) {
    leavesA.rotation.z = sin(t * 1.35 + (phase || 0)) * 0.035;
    leavesA.rotation.x = sin(t * 1.05 + (phase || 0) + 0.7) * 0.03;
    leavesB.rotation.z = sin(t * 1.1 + (phase || 0) + 2.1) * 0.028;  /* 分层异相摇曳 */
  });
  return g;
}

/* 陶罐盆栽：圆腹罐 + 绿叶团 */
function potPlant(M, s, leafMat) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.09 * s, 12, M.stoneD, 0, 0.045 * s, 0));
  var b = ico(0.062 * s, leafMat || M.grassD, 0, 0.13 * s, 0); b.scale.y = 0.85; g.add(b);
  return g;
}

/* 油纸伞 v2：伞杆 + 伞面锥 + 4 伞骨 + 伞尖（lv4 茶摊） */
function parasol(M, s, mat) {
  var g = grp(); s = s || 1;
  var m = mat || M.lacqBr;
  g.add(cyl(0.012 * s, 0.012 * s, 0.3 * s, 12, M.woodF, 0, 0.15 * s, 0));
  g.add(cyl(0.002 * s, 0.19 * s, 0.13 * s, 12, m, 0, 0.325 * s, 0));
  var i;
  for (i = 0; i < 4; i++) {                                          /* 伞骨 */
    var a = i * PI / 2 + PI / 4;
    var rib = box(0.006 * s, 0.006 * s, 0.185 * s, M.woodF, cos(a) * 0.09 * s, 0.295 * s, sin(a) * 0.09 * s);
    rib.rotation.y = -a; rib.rotation.x = 0.36; g.add(rib);
  }
  g.add(sph(0.018 * s, M.gold, 0, 0.4 * s, 0));
  return g;
}

/* 红瓦檐帐 v2：封板 + 下垂瓦排 + 垂弧瓦当 + 金线 + （可选）米黄凉棚 */
function valance(M, w, withAwning) {
  var g = grp();
  g.add(box(w, 0.05, 0.05, M.lacqDk, 0, 0, 0));
  var n = Math.max(4, Math.round(w / 0.2)), i;
  for (i = 0; i < n; i++) {
    var x = -w / 2 + (i + 0.5) * (w / n);
    g.add(box(w / n - 0.014, 0.07, 0.03, M.lacq, x, -0.055, 0.008));
  }
  for (i = 0; i < n; i++) {                                          /* 垂弧瓦当（隔位半圆点排） */
    if (i % 2) continue;
    var x2 = -w / 2 + (i + 0.5) * (w / n);
    g.add(cyl(0.022, 0.022, 0.016, 12, M.lacqBr, x2, -0.098, 0.012));
  }
  g.add(box(w + 0.02, 0.012, 0.052, M.gold, 0, 0.031, 0));           /* 金线 */
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

/* ---- lv1 小屋：木瓦弯栰小屋 + 竹丛 + 小桌陶罐（h≈1.1，参考图左一） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.3));
  /* 台基 + 石甃勒脚 + 竖拼板壁（板壁纹）+ 穿斗角柱 */
  g.add(box(1.32, 0.07, 1.06, M.stoneD, -0.05, 0.035, -0.06));
  g.add(box(1.22, 0.1, 0.96, M.stone, -0.05, 0.12, -0.06));        /* 勒脚（换抹灰→石甃） */
  g.add(box(1.16, 0.46, 0.9, M.plank, -0.05, 0.4, -0.06));         /* 板壁主体 0.17-0.63 */
  [[-0.63, -0.5], [0.53, -0.5], [-0.63, 0.38], [0.53, 0.38]].forEach(function (c) {
    g.add(box(0.055, 0.6, 0.055, M.timber, c[0], 0.36, c[1]));
  });
  /* 板壁壁带（横栿）+ 柱头榫卯节点块（v2） */
  [-0.24, 0.12, 0.44].forEach(function (x) {                        /* 壁间竖拼板带 */
    g.add(box(0.02, 0.44, 0.012, M.timberD, x, 0.4, 0.398));
  });
  [[-0.63, 0.38], [0.53, 0.38]].forEach(function (c) {
    g.add(jointBlock(M, c[0], 0.632, c[1] + 0.02, 0.9));
  });
  g.add(box(1.24, 0.06, 0.06, M.timberD, -0.05, 0.655, 0.4));      /* 前檐枋 */
  /* 双扇木门（中）+ 木格窗（两侧）+ 门前石阶 */
  var door = woodDoor(M, 0.3, 0.38, 0.17); put(g, door, -0.05, 0, 0.395);
  var w1 = latticeWindow(M, 0.22, 0.24, { rows: 2 }); put(g, w1, -0.44, 0.42, 0.395);
  var w2 = latticeWindow(M, 0.22, 0.24, { rows: 2 }); put(g, w2, 0.34, 0.42, 0.395);
  g.add(box(0.42, 0.05, 0.22, M.stoneD, -0.05, 0.095, 0.48));
  /* 木瓦弯栰顶（apex≈1.0，v2 叠瓦加密） */
  var roof = shingleRoof(M, { w: 1.18, d: 0.98, h: 0.3, over: 0.1 });
  put(g, roof, -0.05, 0.685, -0.06);
  /* 檐角灯笼 ×2（金盖金穗双股） */
  var l1 = lantern(M, 0.66, anims, 0.4); put(g, l1, -0.6, 0.52, 0.46);
  var l2 = lantern(M, 0.66, anims, 2.3); put(g, l2, 0.5, 0.52, 0.46);
  /* 竹丛（屋后左右，枝节分层） */
  var b1 = bambooClump(M, 0.95, anims, 1.1, 'full'); put(g, b1, -0.92, 0.05, -0.5);
  var b2 = bambooClump(M, 0.8, anims, 2.6, 'mid'); put(g, b2, 0.9, 0.05, -0.62);
  /* 小桌 + 凳 + 陶罐（屋前右） */
  g.add(box(0.3, 0.03, 0.2, M.timber, 0.62, 0.22, 0.52));
  g.add(box(0.04, 0.19, 0.04, M.timberD, 0.62, 0.11, 0.52));
  g.add(box(0.14, 0.03, 0.14, M.timber, 0.9, 0.14, 0.62));
  g.add(box(0.04, 0.12, 0.04, M.timberD, 0.9, 0.065, 0.62));
  var p1 = potPlant(M, 1.0, M.grassD); put(g, p1, 0.85, 0.055, 0.4);
  var p2 = potPlant(M, 0.8, M.bambooL); put(g, p2, -0.85, 0.055, 0.52);
  return g;
}

/* ---- lv2 洋房：两层楼屋：底层铺面 + 二层檐廊 + 主瓦顶/腰披檐（h≈1.68，参考图左二） ---- */
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
    g.add(box(0.055, 0.6, 0.055, M.timber, c[0], 0.39, c[1]));
  });
  g.add(box(1.44, 0.06, 0.06, M.timberD, -0.1, 0.63, 0.44));
  /* 二层露明穿斗柱 ×2 + 榫卯节点（v2） */
  [[-0.68, 0.39], [0.5, 0.39]].forEach(function (c) {
    g.add(box(0.05, 0.5, 0.05, M.timber, c[0], 0.95, c[1]));
    g.add(jointBlock(M, c[0], 1.205, c[1] + 0.03, 0.85));
  });
  g.add(queTi(M, -0.74, 1.185, 0.42, 1, 0.9));                      /* 廊楣雀替 ×2 */
  g.add(queTi(M, 0.54, 1.185, 0.42, -1, 0.9));
  /* 一层门脸：双扇门 + 开敞铺面 + 石阶 */
  var door = woodDoor(M, 0.28, 0.4, 0.09); put(g, door, -0.5, 0, 0.43);
  var counter = shopCounter(M, 0.68, 0.09, anims); put(g, counter, 0.16, 0, 0.435);
  g.add(box(0.44, 0.05, 0.24, M.stoneD, -0.5, 0.115, 0.52));
  /* 二层：雕花檐廊（中枋+斜棂）+ 暖光木格窗 */
  var balc = balconyUnit(M, 1.2, false, anims, 0.2); put(g, balc, -0.1, 0.73, 0.4);
  var w1 = latticeWindow(M, 0.27, 0.3, { rows: 2, cols: 2, mode: 'glow' }); put(g, w1, -0.42, 0.98, 0.375);
  var w2 = latticeWindow(M, 0.27, 0.3, { rows: 2, cols: 2, mode: 'glow' }); put(g, w2, 0.2, 0.98, 0.375);
  g.add(box(1.38, 0.055, 0.06, M.timberD, -0.1, 1.22, 0.42));       /* 廊楣 */
  /* 腰披檐（罩门廊）+ 主黑青瓦顶（逐垄+瓦当+大翘角，apex≈1.58） */
  var awn = tileRoof(M, { w: 1.42, d: 0.56, h: 0.13, ridge: false, gable: false, over: 0.08 });
  put(g, awn, -0.1, 0.685, 0.18);
  var main = tileRoof(M, { w: 1.3, d: 1.0, h: 0.26, gable: true, gableMat: M.plaster, over: 0.09, moss: 3 });
  put(g, main, -0.1, 1.245, -0.06);
  /* 灯笼 ×2（廊楣下，金穗双股） */
  var l1 = lantern(M, 0.62, anims, 0.7); put(g, l1, -0.74, 1.14, 0.5);
  var l2 = lantern(M, 0.62, anims, 2.0); put(g, l2, 0.54, 1.14, 0.5);
  /* 竹丛（左后 + 右前角）+ 盆栽 */
  var b1 = bambooClump(M, 1.15, anims, 1.3, 'full'); put(g, b1, -1.02, 0.05, -0.5);
  var b2 = bambooClump(M, 0.85, anims, 2.9, 'mid'); put(g, b2, 1.0, 0.05, -0.4);
  var p1 = potPlant(M, 0.9); put(g, p1, 1.02, 0.05, 0.55);
  var p2 = potPlant(M, 0.75); put(g, p2, -1.12, 0.05, 0.6);
  /* 暖光窗呼吸（幅度 ≤0.25） */
  var glowM = M.glowPane;
  anims.push(function (t) { glowM.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.7 + 1.1); });
  return g;
}

/* ---- lv3 大厦：三层楼阁：层层退台 + 三重檐大翘角 + 竖串灯笼 + 匾/黄幌（h≈2.2，参考图左三） ---- */
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
  g.add(jointBlock(M, -0.6, 0.648, 0.48, 0.9));                     /* 柱头榫卯 ×2 */
  g.add(jointBlock(M, 0.6, 0.648, 0.48, 0.9));
  /* 匾额「锦里古街」（金字描边+角钉）+ 黄幌（挂杆+轻摆） */
  var plq = mesh(new THREE.PlaneGeometry(0.56, 0.14), plaqueMat());
  plq.position.set(0.05, 0.585, 0.505); g.add(plq);
  g.add(sph(0.012, M.gold, -0.24, 0.585, 0.512));
  g.add(sph(0.012, M.gold, 0.34, 0.585, 0.512));
  var banPivot = grp(); put(g, banPivot, -0.72, 0.62, 0.5);
  banPivot.add(box(0.02, 0.02, 0.14, M.woodF, 0, 0, -0.05));        /* 挑杆 */
  var ban = mesh(new THREE.PlaneGeometry(0.13, 0.4), bannerMat());
  ban.position.set(0, -0.21, 0); banPivot.add(ban);
  anims.push(function (t) { banPivot.rotation.z = sin(t * 1.15 + 2.2) * 0.05; });
  /* 二层（退台）：抹灰墙 + 露明柱 + 檐廊 + 暖光格窗 */
  g.add(box(1.32, 0.06, 0.94, M.timberD, 0, 0.695, -0.03));
  g.add(box(1.22, 0.46, 0.84, M.plaster, 0, 0.955, -0.04));         /* 二层 0.725-1.185 */
  [[-0.56, 0.36], [0.56, 0.36]].forEach(function (c) {
    g.add(box(0.045, 0.46, 0.045, M.timber, c[0], 0.955, c[1]));
  });
  var b2 = balconyUnit(M, 1.1, false, anims, 0.8); put(g, b2, 0, 0.73, 0.36);
  var w21 = latticeWindow(M, 0.25, 0.28, { rows: 2, cols: 2, mode: 'glow' }); put(g, w21, -0.26, 0.97, 0.365);
  var w22 = latticeWindow(M, 0.25, 0.28, { rows: 2, cols: 2, mode: 'glow' }); put(g, w22, 0.26, 0.97, 0.365);
  /* 二层腰檐（逐垄+瓦当+翘角） */
  var a2 = tileRoof(M, { w: 1.3, d: 0.62, h: 0.14, ridge: false, gable: false, over: 0.08 });
  put(g, a2, 0, 1.21, 0.1);
  /* 三层（再退台）：雕花廊 + 暖光格窗 */
  g.add(box(1.08, 0.05, 0.8, M.timberD, 0, 1.29, -0.05));
  g.add(box(0.98, 0.42, 0.72, M.plaster, 0, 1.525, -0.06));         /* 三层 1.315-1.735 */
  var b3 = balconyUnit(M, 0.9, false, anims, 1.5); put(g, b3, 0, 1.325, 0.3);
  var w31 = latticeWindow(M, 0.22, 0.24, { rows: 2, cols: 2, mode: 'glow' }); put(g, w31, -0.21, 1.54, 0.305);
  var w32 = latticeWindow(M, 0.22, 0.24, { rows: 2, cols: 2, mode: 'glow' }); put(g, w32, 0.21, 1.54, 0.305);
  /* 顶檐：黑青瓦大顶（逐垄+瓦当+双段翘角+鸱吻+金珠+瓦松，apex≈2.08） */
  var top = tileRoof(M, { w: 1.04, d: 0.84, h: 0.28, gable: true, gableMat: M.plaster, big: true, over: 0.1, moss: 3 });
  put(g, top, 0, 1.76, -0.06);
  /* 顶层屋顶花园（v2：花箱 + mini 栏杆 + 绿植，对位参考图顶园） */
  g.add(box(0.86, 0.03, 0.1, M.woodF, 0, 1.78, -0.28));
  g.add(box(0.8, 0.055, 0.075, M.timberD, 0, 1.815, -0.3));
  [0, 1, 2, 3].forEach(function (i) {
    g.add(box(0.014, 0.05, 0.014, M.timberD, -0.34 + i * 0.2267, 1.855, -0.335));
  });
  g.add(box(0.8, 0.014, 0.014, M.timberD, 0, 1.878, -0.335));
  var gp1 = ico(0.05, M.grassD, -0.26, 1.88, -0.3); gp1.scale.y = 0.75; g.add(gp1);
  var gp2 = ico(0.045, M.bambooL, 0.0, 1.872, -0.3); gp2.scale.y = 0.75; g.add(gp2);
  var gp3 = ico(0.05, M.grassD, 0.27, 1.88, -0.3); gp3.scale.y = 0.75; g.add(gp3);
  /* 灯笼：一层檐下 ×2 + 二层角下 ×1 + 三层竖串 ×3（金穗双股） */
  var l1 = lantern(M, 0.56, anims, 0.5); put(g, l1, -0.78, 0.56, 0.52);
  var l2 = lantern(M, 0.56, anims, 1.8); put(g, l2, 0.78, 0.56, 0.52);
  var l3 = lantern(M, 0.5, anims, 2.7); put(g, l3, 0.62, 1.12, 0.44);
  var s1 = lanternString(M, 2, 0.52, anims, 3.4); put(g, s1, -0.56, 1.24, 0.4);
  var s2 = lanternString(M, 3, 0.46, anims, 4.6); put(g, s2, 0.44, 1.77, 0.32);
  var s3 = lanternString(M, 2, 0.48, anims, 5.4); put(g, s3, -0.5, 1.78, 0.28);
  /* 竹丛（左后高 + 右后）+ 盆栽 */
  var b1 = bambooClump(M, 1.5, anims, 1.7, 'full'); put(g, b1, -1.0, 0.04, -0.55);
  var b2 = bambooClump(M, 1.1, anims, 3.1, 'mid'); put(g, b2, 0.96, 0.04, -0.6);
  var p1 = potPlant(M, 0.85); put(g, p1, 0.94, 0.045, 0.6);
  var p2 = potPlant(M, 0.7); put(g, p2, -0.95, 0.045, 0.62);
  var p3 = potPlant(M, 0.6); put(g, p3, 0.62, 0.045, 0.7);
  var glowM = M.glowPane;
  anims.push(function (t) { glowM.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.7 + 1.1); });
  return g;
}

/* ---- lv4 地标：石台基 + 大踏步 + 红漆柱网 + 重檐歇山金宝顶 + 红瓦檐帐 + 油纸伞（h≈2.9，参考图右一） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35));
  /* 石台基 + 大踏步 3 级（v2）+ 垂带 + 踏步侧盆栽 */
  g.add(box(2.1, 0.14, 1.6, M.stone, 0, 0.07, -0.05));
  g.add(box(2.16, 0.05, 1.66, M.stoneD, 0, 0.02, -0.05));
  g.add(box(0.6, 0.055, 0.2, M.stoneD, 0, 0.185, 0.9));             /* 踏步 3 级 */
  g.add(box(0.6, 0.05, 0.17, M.stoneD, 0, 0.2375, 0.76));
  g.add(box(0.6, 0.05, 0.15, M.stoneD, 0, 0.2875, 0.62));
  var cbL = box(0.1, 0.14, 0.5, M.stoneD, -0.4, 0.2, 0.75);         /* 垂带 ×2 */
  cbL.rotation.x = -0.32; g.add(cbL);
  var cbR = box(0.1, 0.14, 0.5, M.stoneD, 0.4, 0.2, 0.75);
  cbR.rotation.x = -0.32; g.add(cbR);
  var sp1 = potPlant(M, 0.7); put(g, sp1, -0.62, 0.14, 0.82);
  var sp2 = potPlant(M, 0.7); put(g, sp2, 0.62, 0.14, 0.82);
  /* 一层：红漆柱网（×6）+ 抹灰填板 + 朱门 + 匾额 */
  [[-0.86, 0.5], [-0.3, 0.56], [0.3, 0.56], [0.86, 0.5], [-0.86, -0.4], [0.86, -0.4]].forEach(function (c) {
    var col = column(M, 0.6, 0.032, true); put(g, col, c[0], 0.14, c[1]);
  });
  g.add(box(1.9, 0.62, 1.0, M.plaster, 0, 0.45, -0.12));            /* 一层墙 0.14-0.76 */
  g.add(box(1.96, 0.06, 1.06, M.lacqDk, 0, 0.79, -0.12));           /* 一层檐枋 */
  [[-0.86, 0.5], [0.86, 0.5]].forEach(function (c) {
    g.add(jointBlock(M, c[0], 0.772, c[1], 1.0));                   /* 红柱头榫卯 ×2（前柱） */
  });
  var gate = grp(); put(g, gate, 0, 0.14, 0.42);
  gate.add(box(0.56, 0.5, 0.05, M.interior, 0, 0.25, -0.006));
  gate.add(box(0.24, 0.46, 0.055, M.lacqBr, -0.14, 0.23, 0.006));
  gate.add(box(0.24, 0.46, 0.055, M.lacqBr, 0.14, 0.23, 0.006));
  [-0.14, 0.14].forEach(function (x) { gate.add(sph(0.014, M.gold, x, 0.34, 0.032)); });
  var plq4 = mesh(new THREE.PlaneGeometry(0.6, 0.15), plaqueMat());
  plq4.position.set(0, 0.575, 0.045); gate.add(plq4);
  /* 一层前廊：红漆檐廊（中枋+斜棂）+ 两侧木 shop shutter 板 */
  var b1 = balconyUnit(M, 1.7, true, anims, 0.4); put(g, b1, 0, 0.86, 0.42);
  g.add(box(0.34, 0.34, 0.045, M.lacqDk, -0.5, 0.52, 0.385));
  g.add(box(0.34, 0.34, 0.045, M.lacqDk, 0.5, 0.52, 0.385));
  g.add(box(0.26, 0.26, 0.05, M.plank, -0.5, 0.52, 0.39));
  g.add(box(0.26, 0.26, 0.05, M.plank, 0.5, 0.52, 0.39));
  /* 一层腰檐（逐垄+瓦当+翘角） */
  var a1 = tileRoof(M, { w: 1.86, d: 0.72, h: 0.15, ridge: false, gable: false, over: 0.09, rPitch: 0.19 });
  put(g, a1, 0, 0.82, 0.16);
  /* 红瓦檐帐（垂弧瓦当+金线）+ 米黄凉棚 */
  var val = valance(M, 1.5, true); put(g, val, 0, 1.32, 0.4);
  /* 二层：红漆栏板楼座 + 暖光格窗 + 竖串灯笼 */
  g.add(box(1.6, 0.05, 0.94, M.lacqDk, 0, 1.375, -0.08));
  g.add(box(1.5, 0.5, 0.86, M.plaster, 0, 1.65, -0.1));             /* 二层 1.40-1.90 */
  var b2 = balconyUnit(M, 1.42, true, anims, 1.1); put(g, b2, 0, 1.42, 0.36);
  var w21 = latticeWindow(M, 0.25, 0.28, { rows: 2, cols: 2, mode: 'glow' }); put(g, w21, -0.34, 1.66, 0.345);
  var w22 = latticeWindow(M, 0.25, 0.28, { rows: 2, cols: 2, mode: 'glow' }); put(g, w22, 0.34, 1.66, 0.345);
  var s1 = lanternString(M, 2, 0.5, anims, 2.2); put(g, s1, -0.78, 1.42, 0.4);
  /* 二层腰檐 */
  var a2 = tileRoof(M, { w: 1.56, d: 0.66, h: 0.14, ridge: false, gable: false, over: 0.09, rPitch: 0.19 });
  put(g, a2, 0, 1.92, 0.06);
  /* 三层楼座 + 暖光格窗 */
  g.add(box(1.3, 0.05, 0.84, M.lacqDk, 0, 1.965, -0.1));
  g.add(box(1.2, 0.44, 0.76, M.lacq, 0, 2.21, -0.12));              /* 三层 1.99-2.43 */
  var b3 = balconyUnit(M, 1.1, true, anims, 1.8); put(g, b3, 0, 2.01, 0.3);
  var w31 = latticeWindow(M, 0.22, 0.26, { rows: 2, cols: 2, mode: 'glow' }); put(g, w31, -0.26, 2.2, 0.285);
  var w32 = latticeWindow(M, 0.22, 0.26, { rows: 2, cols: 2, mode: 'glow' }); put(g, w32, 0.26, 2.2, 0.285);
  var s2 = lanternString(M, 2, 0.46, anims, 3.6); put(g, s2, 0.6, 2.0, 0.34);
  /* 顶阁歇山（前坡瓦垄+瓦当+四角双段起翘）+ 金葫芦宝顶（双腹葫芦+座，apex≈2.9） */
  var top = sweepRoof(M, { w: 1.14, d: 0.94, h: 0.3 });
  put(g, top, 0, 2.43, -0.12);
  var fin = grp(); put(g, fin, 0, 2.73, -0.12);
  fin.add(box(0.11, 0.045, 0.11, M.ridge, 0, 0.022, 0));            /* 须弥座 */
  fin.add(cyl(0.05, 0.062, 0.03, 12, M.gold, 0, 0.055, 0));         /* 莲座盘 */
  var gourd1 = sph(0.052, M.goldGlow, 0, 0.105, 0); gourd1.scale.y = 1.1; fin.add(gourd1); /* 葫芦下腹 */
  var gourd2 = sph(0.036, M.goldGlow, 0, 0.172, 0); gourd2.scale.y = 1.12; fin.add(gourd2); /* 上腹 */
  fin.add(sph(0.016, M.gold, 0, 0.208, 0));                         /* 顶尖 */
  var glowM = M.goldGlow;
  anims.push(function (t) { glowM.emissiveIntensity = 0.22 + 0.1 * sin(t * 1.6 + 0.9); });
  /* 门口灯笼 ×2 + 茶摊油纸伞 ×2（伞骨） */
  var l1 = lantern(M, 0.62, anims, 0.2); put(g, l1, -0.86, 0.66, 0.56);
  var l2 = lantern(M, 0.62, anims, 1.5); put(g, l2, 0.86, 0.66, 0.56);
  var ps1 = parasol(M, 1.15); put(g, ps1, -1.02, 0.05, 0.78);
  var ps2 = parasol(M, 0.95); put(g, ps2, 1.05, 0.05, 0.86);
  /* 茶摊小桌 */
  g.add(box(0.3, 0.03, 0.22, M.timber, -1.02, 0.2, 0.6));
  g.add(box(0.04, 0.17, 0.04, M.timberD, -1.02, 0.1, 0.6));
  /* 竹丛（左后 + 右后）+ 盆栽 */
  var bb1 = bambooClump(M, 1.7, anims, 2.4, 'mid'); put(g, bb1, -1.05, 0.04, -0.62);
  var bb2 = bambooClump(M, 1.25, anims, 3.9, 'mid'); put(g, bb2, 1.02, 0.04, -0.66);
  var p1 = potPlant(M, 0.8); put(g, p1, 0.94, 0.045, 0.68);
  var p2 = potPlant(M, 0.65); put(g, p2, -0.7, 0.045, 0.86);
  var glowW = M.glowPane;
  anims.push(function (t) { glowW.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.7 + 1.1); });
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
