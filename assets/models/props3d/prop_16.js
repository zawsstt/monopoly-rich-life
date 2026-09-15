/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_16.js  (v2 精修版)
 * -------------------------------------------------------------------------------------
 * 格 16「宽窄巷子」(g4 川西民居) 独属建筑：川西茶馆四阶生长史
 * 参考图 refs/prop_16.png 视觉唯一基准（三视图排版取正面，正面朝 +Z）。
 *
 * 风格族谱（同一块地的同一种生长，v1 已验收形态/配色/布局全部保留）：
 *   lv1 小屋   老瓦小屋 + 右侧披屋 + 竹丛 + 木桌陶壶（h≈1.05）
 *   lv2 洋房   两层茶铺：底层敞廊柜台 + 青布幌雨棚 + 二层格栅窗雕栏 + 侧厢（h≈1.60）
 *   lv3 大厦   三层退台木构 + 门罩坡顶 + 层层红灯笼 + 瓦顶院墙 + 匾额/告示牌（h≈2.09）
 *   lv4 地标   石台基石狮 + 门屋 + 两层木构环廊 + 金吻宝珠歇山顶 + 青伞 + 挂瓦院墙（h≈2.55）
 *
 * v2 精修（对照参考图逐条清偿 v1 遗留妥协，预算 220→350）：
 *   · 穿斗木构：柱头榫卯穿枋出头（p16_jnt）+ 地栿 + 雀替 + 檐下椽头一排
 *   · 小青瓦：瓦垄 Canvas 128→256px 12 垄 + 几何压垄条加密 + 檐口圆瓦当 5→9/11（seg12）
 *   · 瓦脊浅灰反差保留（ridgeL 亮于瓦面）；lv1 老瓦苔斑 + 翘端帽
 *   · 方格格栅窗棂条 0.1→0.062 加密 + 中梃/中横披 + 窗台板（暖光内透呼吸增强）
 *   · 青布幌：lv2 雨棚加垂边幔（p16_drape，微摆）+ 斜拉杆；lv4 环廊垂幔成排 + 阳伞伞缘
 *   · 挂瓦墙帽：方块交错 → 拔檐托盘 + 半圆仰瓦垄一排（p16_cope）+ 端头收尾
 *   · 石狮：鬃毛卷弧排 + 前腿/尾/吻部 + 垫带金铃 + 绣球（p16_lion）；踏步加垂带石
 *   · lv4 歇山：金吻（双段弯钩）+ 火焰宝珠（座+珠+焰）+ 压垄条 + 瓦当 11（p16_sweep）
 *   · 竹丛：双竿→三竿分节（节环）+ 五叶分层（p16_bamboo）
 *   · 圆柱段数统一 ≥12、球 16×12；纹理上限 512px；动画幅度克制（旋转≤0.06rad、
 *     emissive 波动≤0.25）：灯笼呼吸/窗光呼吸/竹摇/垂幔摆/伞摇
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[16] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_16] THREE 未定义，请先加载 three.min.js (r147)');
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
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, Math.max(6, seg)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rx, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}

/* ================= 1. 程序化 Canvas 纹理（本轮上限 512px，零外部资源） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 小青瓦垄（v2 256px/12 垄）：逐垄受光脊+垄谷阴影+竖向搭接错缝+垄端弧影+陶面噪点 */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#4f473d'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#584f43' : '#514a3f';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#6e6455'; g.fillRect(0, y + 1, S, 3);          /* 垄脊受光 */
    g.fillStyle = '#7d7263'; g.fillRect(0, y + 1, S, 1);          /* 垄脊高光 */
    g.fillStyle = '#322a21'; g.fillRect(0, y + rh - 6, S, 6);     /* 垄谷阴影 */
    g.fillStyle = '#28211a'; g.fillRect(0, y + rh - 2, S, 2);     /* 垄谷最暗 */
    var off = (i % 2) ? rh * 0.9 : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(38,30,22,0.5)'; g.fillRect(x, y, 3, rh - 4);   /* 竖向搭接缝 */
      g.fillStyle = 'rgba(150,138,118,0.28)'; g.fillRect(x + 3, y, 2, rh - 4); /* 缝侧受光 */
    }
    for (k = 0; k < 4; k++) {                                      /* 垄端弧形搭接影 */
      var cx = (off + k * (S / 4) + S / 8) % S;
      g.fillStyle = 'rgba(30,24,17,0.32)';
      g.fillRect(cx - 5, y + rh - 7, 10, 3);
    }
  }
  for (i = 0; i < 420; i++) {                                      /* 陶面噪点 */
    g.fillStyle = (i % 3) ? 'rgba(255,246,224,0.05)' : 'rgba(24,18,12,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  for (i = 0; i < 26; i++) {
    g.fillStyle = 'rgba(180,170,150,0.10)';                        /* 局部风化亮斑 */
    g.fillRect((i * 83 + 19) % S, (i * 47 + 7) % S, 4, 2);
  }
  return toTex(cv, true);
}
/* 老瓦（lv1 专属）：偏褐 + 苔斑（v2 256px/12 垄） */
function texTileOld() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#5c4c33'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#64553a' : '#5d4e36';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#7a6a4c'; g.fillRect(0, y + 1, S, 3);
    g.fillStyle = '#8a7a58'; g.fillRect(0, y + 1, S, 1);
    g.fillStyle = '#43331f'; g.fillRect(0, y + rh - 6, S, 6);
    var off = (i % 2) ? rh * 0.9 : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(52,38,22,0.5)'; g.fillRect(x, y, 3, rh - 4);
    }
  }
  for (i = 0; i < 46; i++) {                                       /* 苔斑（檐口/垄谷富集） */
    g.fillStyle = 'rgba(86,102,61,0.35)';
    g.fillRect((i * 47 + 13) % S, (i * 71 + 5) % S, 4 + (i % 4), 3);
  }
  for (i = 0; i < 22; i++) {
    g.fillStyle = 'rgba(64,80,44,0.28)';
    g.fillRect((i * 61 + 29) % S, (i * 37 + 11) % S, 3, 2);
  }
  for (i = 0; i < 340; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,244,214,0.05)' : 'rgba(30,22,12,0.1)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 米白抹灰：细噪 + 抹痕（粉墙嵌板，v2 128px） */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#dcd3bf'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 200; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,250,236,0.07)' : 'rgba(126,112,86,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 4, 2);
  }
  for (i = 0; i < 14; i++) {                                       /* 抹刀痕 */
    g.fillStyle = 'rgba(150,136,108,0.08)';
    g.fillRect((i * 37 + 9) % S, (i * 53 + 3) % S, 12, 2);
  }
  return toTex(cv, true);
}
/* 黄土台壁：水平层理 + 土粒（v2 128px） */
function texEarth() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#9a7040'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 12; i++) {
    g.fillStyle = (i % 2) ? 'rgba(120,86,48,0.5)' : 'rgba(170,132,84,0.35)';
    g.fillRect(0, i * 11, S, 4);
  }
  for (i = 0; i < 150; i++) {
    g.fillStyle = (i % 2) ? 'rgba(70,48,26,0.25)' : 'rgba(220,180,120,0.18)';
    g.fillRect((i * 31) % S, (i * 47) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 横式匾额「宽窄巷子」：深木底 + 金字（v2 512px 描边+内框双线） */
function texPlaqueH() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#291a0c'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9ac5a'; g.lineWidth = 9; g.strokeRect(9, 9, w - 18, h - 18);
  g.strokeStyle = '#8a6a34'; g.lineWidth = 3; g.strokeRect(26, 26, w - 52, h - 52);
  g.fillStyle = '#ecd28a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 78px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('宽 窄 巷 子', w / 2, h / 2 + 3);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }
function plaqueMat() {
  return MAT('p16plaque', function () {
    return new THREE.MeshStandardMaterial({ map: getTex('plaqueH', texPlaqueH), roughness: 0.6, metalness: 0.05, flatShading: true });
  });
}

/* 共享材质库（四级统一色板 = 参考图取样，v1 保留） */
function Mats() {
  return {
    roof:      MAT('p16roof', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.68 }); }),
    roofShd:   MAT('p16roofShd', function () { var t = getTex('tile', texTile); return std('#b3aa9c', { map: t, bump: t, bumpScale: 0.016, rough: 0.74 }); }),
    roofOld:   MAT('p16roofOld', function () { var t = getTex('tileOld', texTileOld); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.76 }); }),
    roofOldShd:MAT('p16roofOldShd', function () { var t = getTex('tileOld', texTileOld); return std('#b8ab94', { map: t, bump: t, bumpScale: 0.016, rough: 0.8 }); }),
    ridgeL:    MAT('p16ridgeL', function () { return std('#a8a49e', { rough: 0.82 }); }),   /* 浅灰瓦脊(反差特征) */
    ridgeD:    MAT('p16ridgeD', function () { return std('#8d897f', { rough: 0.85 }); }),
    plaster:   MAT('p16plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    timber:    MAT('p16timber', function () { return std('#7c4a22', { rough: 0.75 }); }),
    timberD:   MAT('p16timberD', function () { return std('#5f3417', { rough: 0.8 }); }),
    timberW:   MAT('p16timberW', function () { return std('#6b4a2e', { rough: 0.85 }); }),  /* lv1 风化木 */
    canvas:    MAT('p16canvas', function () { return std('#4e7974', { rough: 0.88 }); }),
    canvasD:   MAT('p16canvasD', function () { return std('#3e635f', { rough: 0.9 }); }),
    gold:      MAT('p16gold', function () { return std('#d9ac5a', { rough: 0.35, metal: 0.72 }); }),
    stone:     MAT('p16stone', function () { return std('#b0a995', { rough: 0.9 }); }),
    stoneD:    MAT('p16stoneD', function () { return std('#8a857c', { rough: 0.92 }); }),
    grass:     MAT('p16grass', function () { return std('#6da33e', { rough: 0.95 }); }),
    grassD:    MAT('p16grassD', function () { return std('#5c8f33', { rough: 0.95 }); }),
    earth:     MAT('p16earth', function () { var t = getTex('earth', texEarth); return std('#ffffff', { map: t, rough: 0.95 }); }),
    path:      MAT('p16path', function () { return std('#c6c1b0', { rough: 0.95 }); }),
    ink:       MAT('p16ink', function () { return std('#241a10', { rough: 0.9 }); }),
    clay:      MAT('p16clay', function () { return std('#8a5a33', { rough: 0.85 }); }),
    glow:      MAT('p16glow', function () { return std('#e8d9b8', { rough: 0.9, emissive: '#ffc873', ei: 0.22 }); })
  };
}

/* 草皮顶面高度（土台上沿） */
var PADTOP = 0.078;

/* ================= 2. 预制件（风格独有语汇，v2 加密版） ================= */

/* 土台草皮地坪：黄土侧壁 + 草沿悬挑 + 石板小径 + 碎石 + 草簇（参考图绿边土台） */
function earthPad(M, w, d) {
  var g = grp();
  g.add(box(w, 0.06, d, M.earth, 0, 0.03, 0));
  g.add(box(w + 0.05, 0.032, d + 0.05, M.grass, 0, 0.062, 0));    /* 草沿悬挑 */
  g.add(box(0.34, 0.016, 0.2, M.path, 0, PADTOP + 0.008, d / 2 - 0.22));
  g.add(box(0.3, 0.016, 0.18, M.path, 0.06, PADTOP + 0.008, d / 2 - 0.48));
  g.add(box(0.26, 0.016, 0.16, M.path, -0.05, PADTOP + 0.008, d / 2 - 0.72));
  var r1 = mesh(new THREE.DodecahedronGeometry(0.035, 0), M.stoneD); put(g, r1, w / 2 - 0.26, PADTOP + 0.03, d / 2 - 0.3);
  var r2 = mesh(new THREE.DodecahedronGeometry(0.026, 0), M.stoneD); put(g, r2, -w / 2 + 0.3, PADTOP + 0.026, -d / 2 + 0.32);
  var r3 = mesh(new THREE.DodecahedronGeometry(0.02, 0), M.stoneD); put(g, r3, -w / 2 + 0.42, PADTOP + 0.024, d / 2 - 0.42);
  return g;
}

/* 草簇：三片小锥叶（贴地） */
function grassTuft(M, x, z) {
  var g = grp();
  var a = cone(0.018, 0.05, 6, M.grassD, 0, 0.025, 0); a.rotation.z = 0.25; g.add(a);
  var b = cone(0.016, 0.042, 6, M.grass, 0.02, 0.02, 0.01); b.rotation.z = -0.3; g.add(b);
  var c = cone(0.014, 0.036, 6, M.grassD, -0.018, 0.018, -0.01); c.rotation.x = 0.3; g.add(c);
  g.position.set(x, PADTOP, z);
  return g;
}

/* 方格木格栅窗（v2 加密）：木框 + 暖光内透 + 密排方格棂条 + 中梃/中横披 + 窗台板
 * o: nv nh mid(默认 w≥0.22 时加) */
function latticeWin(M, w, h, o) {
  o = o || {};
  var g = grp(); g.name = 'p16_win';
  g.add(box(w + 0.05, h + 0.05, 0.032, M.timberD));
  g.add(box(w, h, 0.026, M.glow, 0, 0, 0.004));
  var nv = o.nv !== undefined ? o.nv : Math.max(3, Math.round(w / 0.062));
  var nh = o.nh !== undefined ? o.nh : Math.max(3, Math.round(h / 0.062));
  var i;
  for (i = 0; i < nv; i++) {
    var x = -w / 2 + (i + 1) * w / (nv + 1);
    g.add(box(0.016, h, 0.034, M.timber, x, 0, 0.01));
  }
  for (i = 0; i < nh; i++) {
    var y = -h / 2 + (i + 1) * h / (nh + 1);
    g.add(box(w, 0.016, 0.034, M.timber, 0, y, 0.01));
  }
  if ((o.mid !== false) && (w >= 0.22)) {                           /* 中央开扇中梃 + 中横披 */
    g.add(box(0.03, h, 0.036, M.timberD, 0, 0, 0.012));
    g.add(box(w, 0.03, 0.036, M.timberD, 0, 0, 0.012));
  }
  g.add(box(w + 0.07, 0.024, 0.05, M.timberD, 0, -h / 2 - 0.03, 0.008)); /* 窗台板 */
  return g;
}

/* 木板门（v2 + 门簪/门环/门枕石，川西素木门；y0=门槛地面线） */
function woodDoor(M, w, h, y0) {
  var g = grp();
  g.add(box(w + 0.07, h + 0.04, 0.04, M.timberD, 0, y0 + (h + 0.04) / 2));
  g.add(box(w, h, 0.045, M.ink, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.94, h * 0.9, 0.05, M.timberW, 0, y0 + h / 2, 0.006));
  g.add(box(w * 0.94, 0.03, 0.052, M.timberD, 0, y0 + h * 0.62, 0.012));
  var hw = w * 0.28, i;                                            /* 门簪 ×2（门楣上） */
  for (i = 0; i < 2; i++) {
    var hs = cyl(0.014, 0.014, 0.018, 12, M.timberD, (i ? 1 : -1) * hw, y0 + h + 0.032, 0.014);
    hs.rotation.x = PI / 2; g.add(hs);
  }
  for (i = 0; i < 2; i++) {                                        /* 门环 ×2 */
    g.add(cyl(0.012, 0.012, 0.008, 12, M.gold, (i ? 1 : -1) * w * 0.32, y0 + h * 0.5, 0.034));
    g.add(cyl(0.005, 0.005, 0.024, 12, M.gold, (i ? 1 : -1) * w * 0.32, y0 + h * 0.5 - 0.014, 0.034));
  }
  g.add(box(0.05, 0.04, 0.07, M.stoneD, -w / 2 - 0.02, y0 + 0.02, 0.012));   /* 门枕石 ×2 */
  g.add(box(0.05, 0.04, 0.07, M.stoneD, w / 2 + 0.02, y0 + 0.02, 0.012));
  return g;
}

/* 雀替（榫卯节点配角）：柱头梁下双斜块 */
function queti(M, x, y, z, s) {
  var g = grp(); s = s || 1;
  var a = box(0.026 * s, 0.022 * s, 0.05 * s, M.timberD, 0.02 * s, y, z); a.rotation.z = 0.6; g.add(a);
  var b = box(0.026 * s, 0.022 * s, 0.05 * s, M.timberD, -0.02 * s, y, z); b.rotation.z = -0.6; g.add(b);
  g.position.set(x, 0, 0);
  return g;
}

/* 红灯笼：挂钩 + 金盖金底 + 红壳 + 穗（大号双穗；材质随 phase 共享呼吸） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p16lant' + (phase || 0), function () { return std('#c23a24', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  g.add(cyl(0.006 * s, 0.006 * s, 0.03 * s, 12, M.ink, 0, 0.132 * s, 0));      /* 挂钩 */
  g.add(cyl(0.034 * s, 0.048 * s, 0.034 * s, 12, M.gold, 0, 0.108 * s, 0));    /* 金盖 */
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.048 * s, 0.034 * s, 0.034 * s, 12, M.gold, 0, -0.1 * s, 0));     /* 金底 */
  g.add(cyl(0.008 * s, 0.008 * s, 0.05 * s, 12, M.ink, 0, -0.147 * s, 0));     /* 穗梗 */
  if (s >= 0.6) {                                                              /* 双侧穗（大号） */
    g.add(cyl(0.005 * s, 0.005 * s, 0.04 * s, 12, M.ink, 0.013 * s, -0.158 * s, 0.005 * s));
    g.add(cyl(0.005 * s, 0.005 * s, 0.04 * s, 12, M.ink, -0.013 * s, -0.158 * s, -0.005 * s));
  }
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 竹丛（v2 分层）：三竿两节（节环）+ 五叶错层（轻摆动画；o.simple=两竿四叶） */
function bambooClump(M, h, anims, phase, o) {
  o = o || {};
  var g = grp(); g.name = 'p16_bamboo';
  var culms = o.simple
    ? [[-0.02, 0, 1], [0.04, 0.02, 0.76]]
    : [[-0.02, 0, 1], [0.035, 0.022, 0.8], [-0.055, -0.024, 0.62]];
  var ci, i;
  for (ci = 0; ci < culms.length; ci++) {
    var c = culms[ci], ch = h * c[2];
    g.add(cyl(0.011, 0.014, ch * 0.52, 12, M.grass, c[0], ch * 0.26, c[1]));      /* 下节 */
    g.add(cyl(0.009, 0.011, ch * 0.48, 12, M.grassD, c[0] + 0.006, ch * 0.76, c[1] + 0.004)); /* 上节(微斜) */
    g.add(cyl(0.014, 0.014, 0.012, 12, M.grassD, c[0] + 0.002, ch * 0.52, c[1])); /* 节环 */
  }
  var leaves = [[-0.03, 0.92, 0.5, 0.28], [0.05, 0.78, -0.55, 0.3], [0, 0.66, 0.2, -0.5], [-0.055, 0.58, -0.3, -0.42], [0.03, 0.88, 0.55, -0.2]];
  var nLeaf = o.simple ? 4 : 5;
  for (i = 0; i < nLeaf; i++) {
    var L = leaves[i];
    var lf = cone(0.05, 0.22, 6, (i % 2) ? M.grassD : M.grass, L[0], h * L[1], (i % 2) ? 0.03 : -0.02);
    lf.rotation.z = L[2]; lf.rotation.x = L[3]; lf.scale.z = 0.45;
    g.add(lf);
  }
  anims.push(function (t) {
    g.rotation.z = sin(t * 1.15 + (phase || 0)) * 0.05;
    g.rotation.x = sin(t * 0.9 + (phase || 0) * 1.7) * 0.03;
  });
  return g;
}

/* 石狮（v2 鬃毛卷 + 腿尾吻 + 垫带金铃 + 绣球；青灰石，朝 +z） */
function stoneLion(M, s) {
  var g = grp(); g.name = 'p16_lion'; s = s || 1;
  g.add(box(0.13 * s, 0.028 * s, 0.13 * s, M.stoneD, 0, 0.014 * s, 0));        /* 石座 */
  var body = sph(0.05 * s, M.stone, 0, 0.068 * s, -0.014 * s); body.scale.set(1, 0.9, 1.25); g.add(body);
  g.add(box(0.055 * s, 0.05 * s, 0.03 * s, M.stone, 0, 0.055 * s, 0.032 * s)); /* 前胸 */
  g.add(box(0.02 * s, 0.05 * s, 0.024 * s, M.stone, 0.021 * s, 0.03 * s, 0.04 * s));   /* 前腿 ×2 */
  g.add(box(0.02 * s, 0.05 * s, 0.024 * s, M.stone, -0.021 * s, 0.03 * s, 0.04 * s));
  g.add(sph(0.038 * s, M.stone, 0, 0.121 * s, 0.036 * s));                     /* 头 */
  g.add(box(0.032 * s, 0.02 * s, 0.022 * s, M.stoneD, 0, 0.115 * s, 0.068 * s));/* 吻部 */
  var mane = [[0.024, 0.05], [-0.024, 0.05], [0.034, 0.018], [-0.034, 0.018]], i;
  for (i = 0; i < mane.length; i++) {                                          /* 鬃毛卷 ×4 */
    g.add(sph(0.012 * s, M.stoneD, mane[i][0] * s, 0.142 * s, (mane[i][1] - 0.01) * s));
  }
  var e1 = cone(0.013 * s, 0.028 * s, 6, M.stoneD, 0.022 * s, 0.158 * s, 0.036 * s); e1.rotation.z = -0.3; g.add(e1);
  var e2 = cone(0.013 * s, 0.028 * s, 6, M.stoneD, -0.022 * s, 0.158 * s, 0.036 * s); e2.rotation.z = 0.3; g.add(e2);
  var tail = box(0.013 * s, 0.013 * s, 0.05 * s, M.stoneD, 0, 0.1 * s, -0.062 * s); tail.rotation.x = 0.5; g.add(tail); /* 尾 */
  g.add(box(0.046 * s, 0.012 * s, 0.028 * s, M.ink, 0, 0.088 * s, 0.046 * s)); /* 垫带 */
  g.add(sph(0.008 * s, M.gold, 0, 0.072 * s, 0.052 * s));                      /* 金铃 */
  g.add(sph(0.015 * s, M.stone, 0.046 * s, 0.015 * s, 0.046 * s));             /* 绣球 */
  return g;
}

/* 雕花木栏（v2 + 扶手圆端头）：地栿 + 雕花板段 + 扶手（川西雕花栏） */
function carvedRail(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.18, M.timberD, 0, 0, 0.09));
  var n = Math.max(3, Math.round(w / 0.45)), i;
  for (i = 0; i < n; i++) {
    var pw = w / n - 0.03;
    g.add(box(pw, 0.1, 0.022, M.timber, -w / 2 + (i + 0.5) * (w / n), 0.075, 0.165));
    g.add(box(pw * 0.55, 0.05, 0.026, M.timberD, -w / 2 + (i + 0.5) * (w / n), 0.075, 0.168));
  }
  g.add(box(0.03, 0.13, 0.03, M.timberD, -w / 2, 0.08, 0.17));
  g.add(box(0.03, 0.13, 0.03, M.timberD, w / 2, 0.08, 0.17));
  g.add(box(w + 0.04, 0.026, 0.032, M.timberD, 0, 0.148, 0.17));
  g.add(sph(0.018, M.timberD, -w / 2 - 0.015, 0.155, 0.17));       /* 扶手圆端头 ×2 */
  g.add(sph(0.018, M.timberD, w / 2 + 0.015, 0.155, 0.17));
  return g;
}

/* 檐口圆瓦当一排：半圆瓦头收边（seg12；v2 数量 9/11） */
function tileEndRow(M, w, y, z, n) {
  var g = grp();
  var i, step = w / (n - 1);
  for (i = 0; i < n; i++) {
    var c = cyl(0.022, 0.022, 0.02, 12, M.ridgeD, -w / 2 + i * step, y, z);
    c.rotation.x = PI / 2;
    g.add(c);
  }
  return g;
}

/* 檐下椽头一排（穿斗语汇）：小幅木方出檐（v2 新增） */
function rafterRow(M, w, y, z, n) {
  var g = grp();
  var i, step = w / (n - 1);
  for (i = 0; i < n; i++) {
    g.add(box(0.022, 0.016, 0.055, M.timberD, -w / 2 + i * step, y, z));
  }
  return g;
}

/* 挂瓦墙帽（v2）：拔檐托盘 + 半圆仰瓦垄一排 + 两端收头（p16_cope） */
function wallCoping(M, w, x, y, z, ry, n) {
  var g = grp(); g.name = 'p16_cope';
  if (ry) g.rotation.y = ry;
  g.position.set(x, y, z);
  g.add(box(w + 0.05, 0.022, 0.115, M.stone, 0, 0.011, 0));        /* 拔檐托盘 */
  var step = w / n, i;
  for (i = 0; i < n; i++) {
    var c = cyl(0.026, 0.026, 0.112, 12, M.ridgeD, -w / 2 + (i + 0.5) * step, 0.038, 0);
    c.rotation.x = PI / 2;
    g.add(c);
  }
  g.add(box(0.028, 0.03, 0.115, M.ridgeL, -w / 2 - 0.01, 0.038, 0)); /* 端头收尾 ×2 */
  g.add(box(0.028, 0.03, 0.115, M.ridgeL, w / 2 + 0.01, 0.038, 0));
  return g;
}

/* 灰瓦双坡顶（v2）：瓦垄压条加密 + 檐下椽头 + 圆瓦当 + 浅灰正脊 + 翘角 + 抹灰山墙
 * o: w d h over strips ends aged ridge gable lift big gold rafterN */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var strips = o.strips !== undefined ? o.strips : 3;
  var aged = !!o.aged;
  var rSun = aged ? M.roofOld : M.roof;
  var rShd = aged ? M.roofOldShd : M.roofShd;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, k > 0 ? rSun : rShd, 0, 0, k * slopeLen / 2));
    for (i = 0; i < strips; i++) {
      var u = (i + 0.5) / strips;
      sg.add(box(w + over * 2 - 0.04, 0.018, 0.028, M.ridgeD, 0, 0.026, k * u * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.timberD, 0, -0.004, k * eave));
    var lift = o.lift !== undefined ? o.lift : 0.55;
    var c1 = box(0.07, 0.05, 0.07, M.ridgeD, (w + over * 2) / 2 - 0.01, 0.05, k * (eave - 0.015));
    c1.rotation.z = lift; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ridgeD, -(w + over * 2) / 2 + 0.01, 0.05, k * (eave - 0.015));
    c2.rotation.z = -lift; sg.add(c2);
  }
  if (o.rafter !== false) {                                        /* 檐下椽头（前坡） */
    var rn = o.rafterN || Math.max(5, Math.round(w / 0.24));
    g.add(rafterRow(M, w + over * 2 - 0.14, 0.012, eave - 0.028, rn));
  }
  if (o.ends !== 0) {                                              /* 前坡圆瓦当 */
    g.add(tileEndRow(M, w + over * 2 - 0.12, 0.028, eave + 0.012, o.ends || 9));
  }
  if (o.gable !== false) {                                          /* 抹灰山墙 */
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
    var t1 = mesh(gg, M.plaster); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.0225); g.add(t1);
    var t2 = mesh(gg, M.plaster); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.0225); g.add(t2);
  }
  if (o.ridge !== false) {                                          /* 浅灰正脊 + 翘端 */
    var rw = o.ridgeW || (w + over * 2 + 0.04);
    g.add(box(rw, 0.055 + (o.big ? 0.015 : 0), 0.085, M.ridgeL, 0, h + 0.028, 0));
    var f1 = box(0.055, 0.09 + (o.big ? 0.03 : 0), 0.075, M.ridgeD, rw / 2 - 0.01, h + 0.085, 0);
    f1.rotation.z = 0.4; g.add(f1);
    var f2 = box(0.055, 0.09 + (o.big ? 0.03 : 0), 0.075, M.ridgeD, -rw / 2 + 0.01, h + 0.085, 0);
    f2.rotation.z = -0.4; g.add(f2);
    if (o.big) {                                                    /* 脊身分段细线 ×2 */
      g.add(box(0.012, 0.06, 0.09, M.ridgeD, 0, h + 0.028, 0));
      g.add(box(0.012, 0.06, 0.09, M.ridgeD, rw * 0.22, h + 0.028, 0));
    }
    if (aged) {                                                     /* 老瓦翘端帽 ×2 */
      var a1 = box(0.045, 0.04, 0.06, M.ridgeL, rw / 2 + 0.008, h + 0.135, 0); a1.rotation.z = 0.55; g.add(a1);
      var a2 = box(0.045, 0.04, 0.06, M.ridgeL, -rw / 2 - 0.008, h + 0.135, 0); a2.rotation.z = -0.55; g.add(a2);
    }
    if (o.gold) put(g, sph(0.03, M.gold), 0, h + 0.115, 0);
  }
  return g;
}

/* 单坡披顶（v2 + 椽头）：披屋/门罩（脊线在群组原点，向 +z 降到 z=d 的檐口） */
function pentRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var pitch = Math.atan2(h, d);
  var slopeLen = Math.sqrt(d * d + h * h) + 0.02;
  var aged = !!o.aged;
  var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch; g.add(sg);
  sg.add(box(w, 0.032, slopeLen, aged ? M.roofOld : M.roof, 0, 0, slopeLen / 2));
  sg.add(box(w - 0.04, 0.016, 0.026, M.ridgeD, 0, 0.024, slopeLen * 0.28));
  sg.add(box(w - 0.04, 0.016, 0.026, M.ridgeD, 0, 0.024, slopeLen * 0.55));
  sg.add(box(w - 0.04, 0.016, 0.026, M.ridgeD, 0, 0.024, slopeLen * 0.82));
  sg.add(box(w + 0.02, 0.045, 0.022, M.timberD, 0, -0.004, slopeLen));
  var c1 = box(0.06, 0.045, 0.06, M.ridgeD, w / 2 - 0.01, 0.04, slopeLen - 0.02); c1.rotation.z = 0.5; sg.add(c1);
  var c2 = box(0.06, 0.045, 0.06, M.ridgeD, -w / 2 + 0.01, 0.04, slopeLen - 0.02); c2.rotation.z = -0.5; sg.add(c2);
  if (o.rafter !== false) g.add(rafterRow(M, w - 0.14, 0.008, d - 0.02, o.rafterN || 5));
  g.add(tileEndRow(M, w - 0.1, 0.016, d + 0.012, o.ends || 6));
  return g;
}

/* 歇山金饰顶（v2）：四坡 + 压垄条 + 瓦当 11 + 大翘角金钩 + 金吻双段弯钩 + 火焰宝珠 */
function sweepRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(); g.name = 'p16_sweep';
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.82 + 0.2, 0.035, lenF, M.roof, 0, 0, lenF / 2));
  sgF.add(box(w * 0.82 + 0.22, 0.05, 0.022, M.timberD, 0, -0.004, eaveF));
  var i;
  for (i = 0; i < 3; i++) {                                        /* 前坡压垄条 ×3 */
    var u = (i + 0.5) / 3;
    sgF.add(box(w * 0.82 + 0.16, 0.016, 0.026, M.ridgeD, 0, 0.024, u * eaveF));
  }
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.82 + 0.2, 0.035, lenF, M.roofShd, 0, 0, -lenF / 2));
  sgB.add(box(w * 0.82 + 0.16, 0.016, 0.026, M.ridgeD, 0, 0.024, -eaveF * 0.55));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.035, d * 0.9, M.roofShd, lenS / 2, 0, 0));
  slR.add(box(0.026, 0.016, d * 0.9 - 0.06, M.ridgeD, eaveS * 0.55, 0.024, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.035, d * 0.9, M.roofShd, -lenS / 2, 0, 0));
  slL.add(box(0.026, 0.016, d * 0.9 - 0.06, M.ridgeD, -eaveS * 0.55, 0.024, 0));
  g.add(tileEndRow(M, w * 0.82 + 0.16, 0.028, eaveF + 0.012, 11));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {     /* 大翘角 + 金钩 */
    var lift = box(0.075, 0.055, 0.075, M.ridgeD, c[0] * (eaveS - 0.02), 0.05, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.62; g.add(lift);
    var hook = box(0.03, 0.075, 0.03, M.gold, c[0] * (eaveS - 0.02), 0.105, c[1] * (eaveF - 0.02));
    hook.rotation.z = -c[0] * 0.5; g.add(hook);
  });
  g.add(box(w * 0.46, 0.06, 0.085, M.ridgeL, 0, h + 0.03, 0));    /* 短正脊 */
  [[1], [-1]].forEach(function (sx) {                              /* 金吻（两段弯钩）×2 */
    var k1 = box(0.03, 0.085, 0.06, M.gold, sx[0] * (w * 0.23 - 0.005), h + 0.07, 0);
    k1.rotation.z = sx[0] * -0.28; g.add(k1);
    var k2 = box(0.026, 0.05, 0.05, M.gold, sx[0] * (w * 0.23 + 0.028), h + 0.125, 0);
    k2.rotation.z = sx[0] * -0.62; g.add(k2);
  });
  g.add(cyl(0.018, 0.028, 0.032, 12, M.gold, 0, h + 0.072, 0));   /* 宝珠座 */
  g.add(sph(0.034, M.gold, 0, h + 0.118, 0));                     /* 宝珠 */
  g.add(sph(0.015, M.gold, 0, h + 0.162, 0));                     /* 火焰珠尖 */
  return g;
}

/* 青布幌雨棚（v2 + 垂边幔 + 斜拉杆，p16_drape；组原点=棚顶后沿；垂边微摆） */
function tealAwning(M, w, anims) {
  var g = grp(); g.name = 'p16_drape';
  var segs = 3, i;
  for (i = 0; i < segs; i++) {
    var seg = box(w, 0.018, 0.2, i === 1 ? M.canvasD : M.canvas, 0, -i * 0.035, 0.1 + i * 0.18);
    seg.rotation.x = -0.12 + i * 0.12;
    g.add(seg);
  }
  var val = grp();                                                 /* 前缘垂边幔（波浪） */
  var nV = 4;
  for (i = 0; i < nV; i++) {
    var vw = w / nV;
    var v = box(vw * 0.9, 0.075 - (i % 2) * 0.02, 0.016, (i % 2) ? M.canvasD : M.canvas,
      -w / 2 + (i + 0.5) * vw, -0.085, 0.545);
    v.rotation.x = 0.1;
    val.add(v);
  }
  g.add(val);
  g.add(box(w + 0.03, 0.03, 0.025, M.timberD, 0, 0.005, 0.08));
  g.add(cyl(0.013, 0.015, 0.66, 12, M.timberW, -w / 2 + 0.05, -0.33, 0.4));
  g.add(cyl(0.013, 0.015, 0.66, 12, M.timberW, w / 2 - 0.05, -0.33, 0.4));
  var br1 = box(0.016, 0.4, 0.016, M.timberW, -w / 2 + 0.05, -0.2, 0.22); br1.rotation.x = -0.5; g.add(br1);
  var br2 = box(0.016, 0.4, 0.016, M.timberW, w / 2 - 0.05, -0.2, 0.22); br2.rotation.x = -0.5; g.add(br2);
  if (anims) anims.push(function (t) { val.rotation.x = sin(t * 1.5 + 0.7) * 0.05; });
  return g;
}

/* 环廊垂幔一排（lv4，p16_drape，微摆）：横杆 + 波浪垂片 */
function drapeRun(M, w, anims, phase) {
  var g = grp(); g.name = 'p16_drape';
  g.add(box(w + 0.04, 0.018, 0.02, M.timberD, 0, 0, 0));
  var n = 5, i;
  for (i = 0; i < n; i++) {
    var dw = w / n;
    var v = box(dw * 0.86, 0.095 - (i % 2) * 0.028, 0.016, (i % 2) ? M.canvasD : M.canvas,
      -w / 2 + (i + 0.5) * dw, -0.055, 0.004);
    g.add(v);
  }
  anims.push(function (t) { g.rotation.z = sin(t * 1.35 + (phase || 0)) * 0.035; });
  return g;
}

/* 青布阳伞（v2 + 伞缘垂片 + 微摇；伞杆 + 伞面 + 金顶） */
function parasol(M, anims, phase) {
  var g = grp(); g.name = 'p16_umb';
  g.add(cyl(0.012, 0.014, 0.5, 12, M.timberW, 0, 0.25, 0));
  var cp = grp();
  cp.add(cone(0.27, 0.13, 12, M.canvas, 0, 0.52, 0));
  var i;
  for (i = 0; i < 6; i++) {                                        /* 伞缘垂片 ×6 */
    var a = i / 6 * PI * 2;
    var sc = cone(0.028, 0.05, 6, (i % 2) ? M.canvasD : M.canvas, cos(a) * 0.225, 0.472, sin(a) * 0.225);
    sc.rotation.z = sin(a) * 0.5; sc.rotation.x = -cos(a) * 0.5;
    cp.add(sc);
  }
  cp.add(sph(0.018, M.gold, 0, 0.6, 0));
  g.add(cp);
  if (anims) anims.push(function (t) { cp.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.04; });
  return g;
}

/* A 形告示牌（v2 + 顶帽 + 横档 + 纸钉；lv3） */
function noticeBoard(M, x, z) {
  var g = grp();
  var l1 = box(0.03, 0.34, 0.02, M.timberD, 0, 0.16, 0); l1.rotation.x = 0.16; g.add(l1);
  var l2 = box(0.03, 0.34, 0.02, M.timberD, 0, 0.16, 0.06); l2.rotation.x = -0.16; g.add(l2);
  g.add(box(0.22, 0.2, 0.025, M.timber, 0, 0.16, 0.03));
  g.add(box(0.17, 0.15, 0.012, M.glow, 0, 0.16, 0.048));
  g.add(box(0.24, 0.02, 0.03, M.timberD, 0, 0.345, 0.03));         /* 顶帽 */
  g.add(box(0.18, 0.014, 0.02, M.timberD, 0, 0.24, 0.042));        /* 横档 */
  g.add(cyl(0.008, 0.008, 0.006, 12, M.gold, -0.04, 0.205, 0.055));/* 纸钉 ×2 */
  g.add(cyl(0.008, 0.008, 0.006, 12, M.gold, 0.04, 0.205, 0.055));
  g.position.set(x, PADTOP, z);
  return g;
}

/* 盆栽（陶盆 + 绿球；v2 + 盆沿） */
function potPlant(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.085 * s, 12, M.clay, 0, 0.042 * s, 0));
  g.add(cyl(0.056 * s, 0.05 * s, 0.014 * s, 12, M.clay, 0, 0.088 * s, 0));
  var b = mesh(new THREE.IcosahedronGeometry(0.06 * s, 0), M.grassD); b.position.set(0, 0.12 * s, 0); b.scale.y = 0.85; g.add(b);
  return g;
}

/* 垂藤（v2 三球叠垂）：栏下悬挂 */
function vineBlob(M, x, y, z) {
  var g = grp();
  var a = mesh(new THREE.IcosahedronGeometry(0.05, 0), M.grassD); a.position.set(0, -0.05, 0); a.scale.set(1.2, 1.1, 0.7);
  var b = mesh(new THREE.IcosahedronGeometry(0.035, 0), M.grass); b.position.set(0.04, -0.13, 0.01); b.scale.set(1, 1.2, 0.7);
  var c = mesh(new THREE.IcosahedronGeometry(0.024, 0), M.grassD); c.position.set(-0.035, -0.18, 0.015); c.scale.set(0.9, 1.15, 0.65);
  g.add(a); g.add(b); g.add(c);
  g.position.set(x, y, z);
  return g;
}

/* 柱头榫卯穿枋出头（穿斗语汇，p16_jnt）：柱列 cols=[[x,z],...]，穿枋沿 z 向出头 */
function tenonHeads(M, parent, cols, y) {
  var j = grp(); j.name = 'p16_jnt';
  cols.forEach(function (c) {
    var t = box(0.024, 0.024, 0.135, M.timberD, c[0], y, c[1]);
    j.add(t);
  });
  parent.add(j);
  return j;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：老瓦小屋 + 右侧披屋 + 竹丛 + 木桌陶壶（h≈1.05） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(earthPad(M, 2.3, 2.3));
  g.add(grassTuft(M, 0.95, -0.95));
  g.add(grassTuft(M, -1.05, 0.35));
  g.add(grassTuft(M, 0.3, 1.05));
  var y0 = PADTOP;
  /* 台基 + 墙体（穿斗式：抹灰板 + 风化木柱 + 地栿 + 柱头榫卯出头） */
  g.add(box(1.4, 0.07, 1.05, M.stoneD, -0.12, y0 + 0.035, -0.06));
  g.add(box(1.15, 0.46, 0.82, M.plaster, -0.12, y0 + 0.3, -0.06));
  var cols = [[-0.67, -0.44], [0.43, -0.44], [-0.67, 0.32], [0.43, 0.32]];
  cols.forEach(function (c) {
    g.add(box(0.05, 0.46, 0.05, M.timberW, c[0], y0 + 0.3, c[1]));
  });
  g.add(box(1.2, 0.06, 0.05, M.timberW, -0.12, y0 + 0.507, 0.345));
  g.add(box(0.05, 0.04, 0.82, M.timberW, -0.67, y0 + 0.06, -0.06));  /* 地栿（山面柱脚） */
  tenonHeads(M, g, cols, y0 + 0.507);
  g.add(queti(M, -0.4, y0 + 0.47, 0.345, 1));                        /* 门楣雀替 */
  /* 门（偏左）+ 方格窗（右）+ 山面小窗 */
  var door = woodDoor(M, 0.26, 0.36, y0 + 0.07); put(g, door, -0.4, 0, 0.352);
  var win = latticeWin(M, 0.26, 0.24, { nv: 3, nh: 3, mid: false }); put(g, win, 0.14, y0 + 0.32, 0.352);
  var swin = latticeWin(M, 0.2, 0.2, { nv: 2, nh: 2, mid: false }); swin.rotation.y = PI / 2; put(g, swin, -0.705, y0 + 0.32, -0.06);
  /* 老瓦坡顶（apex≈0.89+脊≈0.94，翘帽顶 ≈1.05） */
  var roof = tileRoof(M, { w: 1.15, d: 0.88, h: 0.28, strips: 2, ends: 9, aged: true, lift: 0.5, rafterN: 6 });
  put(g, roof, -0.12, y0 + 0.53, -0.06);
  /* 右侧披屋：双柱 + 斜撑 + 横梁 + 披顶 + 条凳 + 陶罐 + 柴堆 */
  var shed = grp(); put(g, shed, 0.82, y0 + 0.07, -0.02);
  shed.add(box(0.05, 0.36, 0.05, M.timberW, -0.28, 0.18, 0.3));
  shed.add(box(0.05, 0.36, 0.05, M.timberW, 0.3, 0.18, 0.3));
  var sbr1 = box(0.04, 0.24, 0.04, M.timberW, -0.24, 0.22, 0.3); sbr1.rotation.z = 0.7; shed.add(sbr1);
  var sbr2 = box(0.04, 0.24, 0.04, M.timberW, 0.26, 0.22, 0.3); sbr2.rotation.z = -0.7; shed.add(sbr2);
  shed.add(box(0.68, 0.05, 0.05, M.timberW, 0.01, 0.37, 0.3));
  var pent = pentRoof(M, { w: 0.78, d: 0.66, h: 0.11, aged: true, ends: 7, rafterN: 5 });
  put(shed, pent, 0.01, 0.4, -0.33);
  shed.add(box(0.3, 0.03, 0.14, M.timber, -0.15, 0.12, -0.05));
  shed.add(box(0.04, 0.1, 0.12, M.timberW, -0.27, 0.055, -0.05));
  shed.add(box(0.04, 0.1, 0.12, M.timberW, -0.03, 0.055, -0.05));
  shed.add(cyl(0.05, 0.06, 0.11, 12, M.clay, 0.22, 0.055, -0.08));
  shed.add(cyl(0.055, 0.055, 0.016, 12, M.clay, 0.22, 0.118, -0.08)); /* 陶罐盖 */
  /* 柴堆（披屋后，参考图杂物层） */
  shed.add(cyl(0.028, 0.028, 0.2, 12, M.timberW, 0.24, 0.028, -0.22));
  shed.add(cyl(0.028, 0.028, 0.2, 12, M.timber, 0.24, 0.082, -0.22));
  shed.add(cyl(0.028, 0.028, 0.2, 12, M.timberW, 0.24, 0.028, -0.16));
  /* 门侧灯笼（挂于檐枋下） */
  var lt = lantern(M, 0.7, anims, 0.5); put(g, lt, -0.02, y0 + 0.4, 0.4);
  /* 竹丛 ×2（屋后） */
  var b1 = bambooClump(M, 0.46, anims, 1.3); put(g, b1, -0.92, y0, -0.62);
  var b2 = bambooClump(M, 0.4, anims, 2.6); put(g, b2, 0.78, y0, -0.68);
  /* 短篱笆（左前） */
  var i;
  for (i = 0; i < 4; i++) g.add(box(0.035, 0.2, 0.035, M.timberW, -0.98 + i * 0.17, y0 + 0.1, 0.9));
  g.add(box(0.56, 0.024, 0.03, M.timberW, -0.81, y0 + 0.17, 0.9));
  /* 木桌 + 陶壶（右前） */
  g.add(box(0.28, 0.028, 0.17, M.timberW, 0.55, y0 + 0.19, 0.62));
  g.add(box(0.04, 0.17, 0.15, M.timberW, 0.55, y0 + 0.095, 0.62));
  g.add(cyl(0.035, 0.045, 0.08, 12, M.clay, 0.55, y0 + 0.245, 0.62));
  g.add(cyl(0.018, 0.028, 0.02, 12, M.clay, 0.55, y0 + 0.295, 0.62));            /* 壶嘴盖 */
  /* 内透光呼吸（v2 幅度增强至 ±0.08，仍 ≤0.25） */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.22 + 0.08 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：两层茶铺 + 青布幌雨棚 + 侧厢（h≈1.60） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(earthPad(M, 2.5, 2.3));
  g.add(grassTuft(M, -0.6, 1.05));
  g.add(grassTuft(M, 1.1, -0.9));
  var y0 = PADTOP;
  /* 台基 + 一层墙柱 + 二层楼板/墙柱（v2 + 榫卯出头 + 地栿） */
  g.add(box(2.0, 0.08, 1.05, M.stoneD, 0, y0 + 0.04, 0));
  g.add(box(1.9, 0.5, 0.9, M.plaster, 0, y0 + 0.33, 0));
  var cols1 = [[-0.92, -0.42], [0.92, -0.42], [-0.92, 0.42], [0.92, 0.42], [-0.31, 0.42], [0.31, 0.42]];
  cols1.forEach(function (c) {
    g.add(box(0.055, 0.5, 0.055, M.timber, c[0], y0 + 0.33, c[1]));
  });
  g.add(box(1.95, 0.05, 0.95, M.timberD, 0, y0 + 0.605, 0));
  g.add(box(1.78, 0.44, 0.84, M.plaster, 0, y0 + 0.85, 0));
  var cols2 = [[-0.86, -0.39], [0.86, -0.39], [-0.86, 0.39], [0.86, 0.39], [-0.29, 0.39], [0.29, 0.39]];
  cols2.forEach(function (c) {
    g.add(box(0.05, 0.44, 0.05, M.timber, c[0], y0 + 0.85, c[1]));
  });
  tenonHeads(M, g, cols1, y0 + 0.55);
  tenonHeads(M, g, cols2, y0 + 1.045);
  g.add(box(0.06, 0.045, 0.92, M.timber, -0.92, y0 + 0.085, 0));   /* 地栿 ×2（角柱柱脚） */
  g.add(box(0.06, 0.045, 0.92, M.timber, 0.92, y0 + 0.085, 0));
  /* 底层门脸：木门 + 敞口柜台 + 货担陶罐 + 茶碗 */
  var door = woodDoor(M, 0.26, 0.38, y0 + 0.08); put(g, door, -0.85, 0, 0.442);
  g.add(box(1.05, 0.4, 0.04, M.ink, -0.2, y0 + 0.28, 0.44));
  g.add(box(0.95, 0.045, 0.16, M.timberD, -0.2, y0 + 0.17, 0.48));
  g.add(box(0.95, 0.1, 0.03, M.timberD, -0.2, y0 + 0.1, 0.47));
  g.add(cyl(0.035, 0.042, 0.09, 12, M.clay, -0.45, y0 + 0.235, 0.5));
  g.add(cyl(0.04, 0.046, 0.07, 12, M.clay, -0.3, y0 + 0.225, 0.51));
  g.add(box(0.16, 0.1, 0.12, M.timber, 0, y0 + 0.22, 0.5));
  g.add(cyl(0.022, 0.016, 0.03, 12, M.clay, 0.12, y0 + 0.203, 0.5));   /* 茶碗 ×2 */
  g.add(cyl(0.022, 0.016, 0.03, 12, M.clay, 0.2, y0 + 0.203, 0.49));
  /* 青布幌雨棚（跨深度下垂 + 垂边幔微摆，组原点=棚顶后沿 z=0.34） */
  var awn = tealAwning(M, 1.15, anims); put(g, awn, -0.2, y0 + 0.62, 0.34);
  /* 二层：方格窗 ×3（加密棂条）+ 雕花栏 + 檐下小木匾 */
  var w1 = latticeWin(M, 0.3, 0.26, {}); put(g, w1, -0.58, y0 + 0.85, 0.422);
  var w2 = latticeWin(M, 0.3, 0.26, {}); put(g, w2, 0, y0 + 0.85, 0.422);
  var w3 = latticeWin(M, 0.3, 0.26, {}); put(g, w3, 0.58, y0 + 0.85, 0.422);
  var balc = carvedRail(M, 1.7); put(g, balc, 0, y0 + 0.655, 0.42);
  g.add(box(0.34, 0.1, 0.028, M.timberD, -0.5, y0 + 0.6, 0.61));
  var plq = mesh(new THREE.PlaneGeometry(0.3, 0.075), plaqueMat());
  plq.position.set(-0.5, y0 + 0.6, 0.626); g.add(plq);
  /* 主瓦顶（apex≈1.45+脊≈1.50，金顶 ≈1.60） */
  var main = tileRoof(M, { w: 1.75, d: 1.0, h: 0.3, strips: 4, ends: 11, lift: 0.62, rafterN: 7, gold: true });
  put(g, main, 0, y0 + 1.07, 0);
  /* 侧厢（右）：抹灰间 + 单柱 + 披顶 + 格栅小窗 + 柜面陶罐 */
  g.add(box(0.68, 0.4, 0.9, M.plaster, 0.85, y0 + 0.28, 0.02));
  g.add(box(0.05, 0.4, 0.05, M.timber, 0.85, y0 + 0.28, 0.48));
  var awin = latticeWin(M, 0.18, 0.18, { nv: 2, nh: 2, mid: false });
  awin.rotation.y = PI / 2; put(g, awin, 1.195, y0 + 0.3, -0.1);
  var annex = pentRoof(M, { w: 0.76, d: 0.98, h: 0.13, ends: 7, rafterN: 5 });
  put(g, annex, 0.85, y0 + 0.48, -0.47);
  g.add(box(0.5, 0.04, 0.14, M.timberD, 0.85, y0 + 0.16, 0.5));
  g.add(cyl(0.035, 0.042, 0.08, 12, M.clay, 0.72, y0 + 0.22, 0.52));
  /* 灯笼 ×2（檐角） */
  var l1 = lantern(M, 0.62, anims, 0.9); put(g, l1, -1.02, y0 + 0.94, 0.5);
  var l2 = lantern(M, 0.62, anims, 2.2); put(g, l2, 1.02, y0 + 0.94, 0.5);
  /* 竹丛 + 盆栽 */
  var b1 = bambooClump(M, 0.54, anims, 1.1); put(g, b1, -1.08, y0, -0.5);
  var b2 = bambooClump(M, 0.48, anims, 2.9); put(g, b2, 1.12, y0, -0.62);
  var p1 = potPlant(M, 1); put(g, p1, 1.18, y0, 0.66);
  var p2 = potPlant(M, 0.85); put(g, p2, -1.2, y0, -0.15);
  /* 内透光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.22 + 0.08 * sin(t * 1.15 + 0.5); });
  return g;
}

/* ---- lv3 大厦：三层退台木构 + 门罩 + 匾额 + 瓦顶院墙 + 告示牌（h≈2.09） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(earthPad(M, 2.5, 2.35));
  g.add(grassTuft(M, -0.5, 1.08));
  g.add(grassTuft(M, 1.16, -0.95));
  var y0 = PADTOP;
  var fx = -0.38;
  /* 台基 + 三层退台（逐层收小；v2 二三层加角柱 + 榫卯出头 + 地栿） */
  g.add(box(1.7, 0.09, 1.0, M.stoneD, fx, y0 + 0.045, 0));
  g.add(box(1.55, 0.44, 0.9, M.plaster, fx, y0 + 0.31, 0));
  var cols1 = [[-0.74, -0.42], [0.74, -0.42], [-0.74, 0.42], [0.74, 0.42]];
  cols1.forEach(function (c) {
    g.add(box(0.05, 0.44, 0.05, M.timber, fx + c[0], y0 + 0.31, c[1]));
  });
  g.add(box(1.6, 0.045, 0.94, M.timberD, fx, y0 + 0.552, 0));
  g.add(box(1.48, 0.42, 0.84, M.plaster, fx, y0 + 0.785, -0.01));
  var cols2 = [[-0.72, -0.4], [0.72, -0.4], [-0.72, 0.4], [0.72, 0.4]];
  cols2.forEach(function (c) {
    g.add(box(0.045, 0.42, 0.045, M.timber, fx + c[0], y0 + 0.785, c[1] - 0.01));
  });
  g.add(box(1.44, 0.045, 0.88, M.timberD, fx, y0 + 1.04, -0.02));
  g.add(box(1.3, 0.4, 0.78, M.plaster, fx, y0 + 1.262, -0.03));
  var cols3 = [[-0.63, -0.37], [0.63, -0.37], [-0.63, 0.37], [0.63, 0.37]];
  cols3.forEach(function (c) {
    g.add(box(0.045, 0.4, 0.045, M.timber, fx + c[0], y0 + 1.262, c[1] - 0.03));
  });
  var j1 = tenonHeads(M, g, cols1, y0 + 0.5); j1.position.x = fx;
  var j2 = tenonHeads(M, g, cols2, y0 + 0.975); j2.position.set(fx, 0, -0.01);
  var j3 = tenonHeads(M, g, cols3, y0 + 1.43); j3.position.set(fx, 0, -0.03);
  g.add(box(1.44, 0.04, 0.05, M.timber, fx, y0 + 0.08, 0.42));      /* 一层地栿 */
  /* 一层门脸：门罩坡顶 + 双柱 + 雀替 + 门 + 窗 + 两级石阶垂带 */
  var porch = pentRoof(M, { w: 1.3, d: 0.58, h: 0.16, ends: 7, rafterN: 5 });
  put(g, porch, fx, y0 + 0.55, -0.1);
  g.add(cyl(0.028, 0.032, 0.46, 12, M.timber, fx - 0.5, y0 + 0.32, 0.46));
  g.add(cyl(0.028, 0.032, 0.46, 12, M.timber, fx + 0.5, y0 + 0.32, 0.46));
  g.add(queti(M, fx, y0 + 0.51, 0.46, 1.1));
  var door = woodDoor(M, 0.28, 0.4, y0 + 0.09); put(g, door, fx - 0.18, 0, 0.45);
  var wf1 = latticeWin(M, 0.22, 0.2, { nv: 2, nh: 2, mid: false }); put(g, wf1, fx + 0.42, y0 + 0.32, 0.445);
  g.add(box(0.52, 0.032, 0.22, M.stoneD, fx - 0.18, y0 + 0.016, 0.58));
  g.add(box(0.46, 0.032, 0.18, M.stoneD, fx - 0.18, y0 + 0.048, 0.55));
  g.add(box(0.05, 0.065, 0.26, M.stone, fx - 0.45, y0 + 0.032, 0.58)); /* 垂带石 ×2 */
  g.add(box(0.05, 0.065, 0.26, M.stone, fx + 0.09, y0 + 0.032, 0.58));
  /* 二层：雕花栏 + 方格窗 ×3（加密） */
  var b2 = carvedRail(M, 1.45); put(g, b2, fx, y0 + 0.6, 0.47);
  var w21 = latticeWin(M, 0.28, 0.24, {}); put(g, w21, fx - 0.5, y0 + 0.8, 0.415);
  var w22 = latticeWin(M, 0.28, 0.24, {}); put(g, w22, fx, y0 + 0.8, 0.415);
  var w23 = latticeWin(M, 0.28, 0.24, {}); put(g, w23, fx + 0.5, y0 + 0.8, 0.415);
  /* 三层：雕花栏 + 方格窗 ×2（加密） */
  var b3 = carvedRail(M, 1.26); put(g, b3, fx, y0 + 1.085, 0.42);
  var w31 = latticeWin(M, 0.26, 0.22, {}); put(g, w31, fx - 0.28, y0 + 1.28, 0.375);
  var w32 = latticeWin(M, 0.26, 0.22, {}); put(g, w32, fx + 0.28, y0 + 1.28, 0.375);
  /* 垂藤（栏下，三球叠垂） */
  g.add(vineBlob(M, fx - 0.6, y0 + 0.58, 0.5));
  g.add(vineBlob(M, fx + 0.55, y0 + 0.58, 0.5));
  g.add(vineBlob(M, fx + 0.3, y0 + 1.07, 0.45));
  /* 主瓦顶（apex≈1.90+脊≈1.96，金顶 ≈2.09） */
  var main = tileRoof(M, { w: 1.34, d: 0.96, h: 0.36, strips: 4, ends: 9, lift: 0.72, big: true, gold: true, rafterN: 6 });
  put(g, main, fx, y0 + 1.462, -0.03);
  /* 匾额「宽窄巷子」（门罩下） */
  g.add(box(0.5, 0.12, 0.03, M.timberD, fx, y0 + 0.47, 0.44));
  var plq = mesh(new THREE.PlaneGeometry(0.44, 0.11), plaqueMat());
  plq.position.set(fx, y0 + 0.47, 0.457); g.add(plq);
  /* 灯笼 ×4：门罩下 ×2 + 二层栏端 ×2 */
  var l1 = lantern(M, 0.56, anims, 0.6); put(g, l1, fx - 0.62, y0 + 0.44, 0.52);
  var l2 = lantern(M, 0.56, anims, 1.9); put(g, l2, fx + 0.62, y0 + 0.44, 0.52);
  var l3 = lantern(M, 0.52, anims, 2.8); put(g, l3, fx - 0.74, y0 + 0.4, 0.5);
  var l4 = lantern(M, 0.52, anims, 4.1); put(g, l4, fx + 0.74, y0 + 0.4, 0.5);
  /* 瓦顶院墙（右侧 L 形；v2 半圆仰瓦垄墙帽 + 墙脚散水石） */
  g.add(box(0.1, 0.05, 0.9, M.stoneD, 1.02, y0 + 0.025, 0.05));
  g.add(box(0.07, 0.26, 0.9, M.plaster, 1.02, y0 + 0.18, 0.05));
  g.add(wallCoping(M, 0.92, 1.02, y0 + 0.31, 0.05, PI / 2, 8));
  g.add(box(0.62, 0.05, 0.1, M.stoneD, 0.82, y0 + 0.025, 0.6));
  g.add(box(0.62, 0.24, 0.07, M.plaster, 0.82, y0 + 0.17, 0.6));
  g.add(wallCoping(M, 0.64, 0.82, y0 + 0.29, 0.6, PI / 2, 5));
  g.add(box(0.16, 0.02, 0.12, M.stoneD, 1.02, y0 + 0.008, -0.42));  /* 墙脚散水石 ×3 */
  g.add(box(0.14, 0.02, 0.1, M.stoneD, 0.98, y0 + 0.008, 0.5));
  g.add(box(0.14, 0.02, 0.1, M.stoneD, 0.62, y0 + 0.008, 0.6));
  /* A 形告示牌 + 竹丛 + 盆栽 */
  g.add(noticeBoard(M, 0.42, 0.98));
  var b1 = bambooClump(M, 0.74, anims, 1.2); put(g, b1, -1.06, y0, -0.55);
  var b2c = bambooClump(M, 0.62, anims, 3.1); put(g, b2c, 1.14, y0, -0.7);
  var p1 = potPlant(M, 0.95); put(g, p1, -1.12, y0, 0.72);
  var p2 = potPlant(M, 0.8); put(g, p2, 1.14, y0, -0.2);
  /* 内透光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.22 + 0.08 * sin(t * 1.2 + 0.9); });
  return g;
}

/* ---- lv4 地标：石台基石狮 + 门屋 + 两层环廊 + 金吻宝珠歇山 + 青伞 + 挂瓦院墙（h≈2.55） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(earthPad(M, 2.55, 2.5));
  g.add(grassTuft(M, -1.18, 0.4));
  g.add(grassTuft(M, -0.5, -1.15));
  var y0 = PADTOP;
  /* 石台基 + 垂带踏步 + 石狮一对（v2 鬃毛卷石狮 + 双级垂带） */
  g.add(box(2.16, 0.05, 1.6, M.stoneD, 0, y0 + 0.025, -0.02));
  g.add(box(2.1, 0.16, 1.55, M.stone, 0, y0 + 0.13, -0.02));
  g.add(box(0.66, 0.055, 0.2, M.stoneD, 0, y0 + 0.19, 0.86));
  g.add(box(0.54, 0.05, 0.18, M.stoneD, 0, y0 + 0.245, 0.74));
  g.add(box(0.08, 0.115, 0.3, M.stone, -0.37, y0 + 0.187, 0.82));   /* 踏步垂带石 ×2 */
  g.add(box(0.08, 0.115, 0.3, M.stone, 0.37, y0 + 0.187, 0.82));
  put(g, stoneLion(M, 1.2), -0.56, y0 + 0.21, 0.62);
  put(g, stoneLion(M, 1.2), 0.56, y0 + 0.21, 0.62);
  /* 一层堂：抹灰墙柱 + 榫卯出头 + 门屋（双门扇 + 门簪 + 匾额）+ 门屋坡顶 */
  g.add(box(1.3, 0.72, 0.9, M.plaster, 0, y0 + 0.57, -0.08));
  var cols1 = [[-0.62, -0.42], [0.62, -0.42], [-0.62, 0.4], [0.62, 0.4]];
  cols1.forEach(function (c) {
    g.add(box(0.055, 0.72, 0.055, M.timber, c[0], y0 + 0.57, c[1]));
  });
  tenonHeads(M, g, cols1, y0 + 0.9);
  g.add(cyl(0.03, 0.034, 0.62, 12, M.timber, -0.42, y0 + 0.52, 0.5));
  g.add(cyl(0.03, 0.034, 0.62, 12, M.timber, 0.42, y0 + 0.52, 0.5));
  g.add(box(0.3, 0.46, 0.045, M.timberD, -0.155, y0 + 0.44, 0.5));
  g.add(box(0.3, 0.46, 0.045, M.timberD, 0.155, y0 + 0.44, 0.5));
  g.add(box(0.86, 0.08, 0.06, M.timberD, 0, y0 + 0.71, 0.51));
  var pin1 = cyl(0.016, 0.016, 0.02, 12, M.timberD, -0.12, y0 + 0.775, 0.53); pin1.rotation.x = PI / 2; g.add(pin1);
  var pin2 = cyl(0.016, 0.016, 0.02, 12, M.timberD, 0.12, y0 + 0.775, 0.53); pin2.rotation.x = PI / 2; g.add(pin2);
  g.add(box(0.58, 0.13, 0.03, M.timberD, 0, y0 + 0.79, 0.51));
  var plq = mesh(new THREE.PlaneGeometry(0.52, 0.115), plaqueMat());
  plq.position.set(0, y0 + 0.79, 0.527); g.add(plq);
  var gRoof = tileRoof(M, { w: 1.15, d: 0.6, h: 0.16, strips: 3, ends: 9, gable: false, lift: 0.66, rafterN: 5 });
  put(g, gRoof, 0, y0 + 0.83, 0.2);
  /* 二层环廊：雕花栏 + 青布垂幔（成排微摆）+ 方格窗 ×3 + 灯笼 ×2 + 垂藤 */
  g.add(box(1.5, 0.045, 0.92, M.timberD, 0, y0 + 0.975, -0.04));
  g.add(box(1.4, 0.44, 0.86, M.plaster, 0, y0 + 1.22, -0.05));
  var b2 = carvedRail(M, 1.44); put(g, b2, 0, y0 + 1.0, 0.4);
  var dr2 = drapeRun(M, 1.34, anims, 0.4); put(g, dr2, 0, y0 + 0.985, 0.475);
  var w21 = latticeWin(M, 0.28, 0.24, { mid: false }); put(g, w21, -0.48, y0 + 1.2, 0.385);
  var w22 = latticeWin(M, 0.28, 0.24, { mid: false }); put(g, w22, 0, y0 + 1.2, 0.385);
  var w23 = latticeWin(M, 0.28, 0.24, { mid: false }); put(g, w23, 0.48, y0 + 1.2, 0.385);
  var l3a = lantern(M, 0.52, anims, 0.8); put(g, l3a, -0.8, y0 + 0.9, 0.46);
  var l3b = lantern(M, 0.52, anims, 2.4); put(g, l3b, 0.8, y0 + 0.9, 0.46);
  g.add(vineBlob(M, -0.62, y0 + 0.96, 0.44));
  g.add(vineBlob(M, 0.62, y0 + 0.96, 0.44));
  /* 三层环廊：雕花栏 + 方格窗 ×2 + 灯笼 ×2 */
  g.add(box(1.34, 0.045, 0.84, M.timberD, 0, y0 + 1.445, -0.06));
  g.add(box(1.22, 0.4, 0.76, M.plaster, 0, y0 + 1.668, -0.07));
  var b3 = carvedRail(M, 1.18); put(g, b3, 0, y0 + 1.47, 0.36);
  var w31 = latticeWin(M, 0.26, 0.22, { mid: false }); put(g, w31, -0.28, y0 + 1.66, 0.325);
  var w32 = latticeWin(M, 0.26, 0.22, { mid: false }); put(g, w32, 0.28, y0 + 1.66, 0.325);
  var l4a = lantern(M, 0.5, anims, 3.6); put(g, l4a, -0.68, y0 + 1.34, 0.42);
  var l4b = lantern(M, 0.5, anims, 5.0); put(g, l4b, 0.68, y0 + 1.34, 0.42);
  /* 金吻宝珠歇山顶（apex≈2.23+宝珠焰尖 ≈2.55） */
  var top = sweepRoof(M, { w: 1.18, d: 0.88, h: 0.36 });
  put(g, top, 0, y0 + 1.868, -0.07);
  /* 门口灯笼 ×2（挂于门屋坡顶檐下） */
  var l1 = lantern(M, 0.64, anims, 0.3); put(g, l1, -0.62, y0 + 0.72, 0.55);
  var l2 = lantern(M, 0.64, anims, 1.6); put(g, l2, 0.62, y0 + 0.72, 0.55);
  /* 挂瓦院墙（右 + 前回抱；v2 半圆仰瓦垄墙帽）+ 墙上石镜 */
  g.add(box(0.1, 0.05, 1.05, M.stoneD, 1.06, y0 + 0.025, 0.16));
  g.add(box(0.07, 0.28, 1.05, M.plaster, 1.06, y0 + 0.19, 0.16));
  g.add(wallCoping(M, 1.07, 1.06, y0 + 0.33, 0.16, PI / 2, 9));
  g.add(box(0.56, 0.05, 0.1, M.stoneD, 0.87, y0 + 0.025, 0.92));
  g.add(box(0.56, 0.26, 0.07, M.plaster, 0.87, y0 + 0.18, 0.92));
  g.add(wallCoping(M, 0.58, 0.87, y0 + 0.31, 0.92, PI / 2, 5));
  var mir = cyl(0.062, 0.062, 0.02, 12, M.stoneD, 0.87, y0 + 0.18, 0.958); mir.rotation.x = PI / 2; g.add(mir);
  /* 青布阳伞（右墙台上，呼应 lv2 雨棚；伞缘垂片微摇） */
  var um = parasol(M, anims, 2.1); put(g, um, 1.02, y0 + 0.36, 0.5);
  /* 盆竹 ×2（v2 分节盆竹） */
  [[-1.05, 0.92, 1.2], [0.94, -0.45, 2.6]].forEach(function (p) {
    g.add(cyl(0.055, 0.068, 0.09, 12, M.clay, p[0], y0 + 0.045, p[1]));
    var bc = bambooClump(M, 0.42, anims, p[2], { simple: true });
    bc.position.set(p[0], y0 + 0.08, p[1]);
    g.add(bc);
  });
  /* 内透光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.22 + 0.08 * sin(t * 1.05 + 1.3); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[16] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_16_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 16;
  g.userData.level = lv;
  g.userData.region = 'g4';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
