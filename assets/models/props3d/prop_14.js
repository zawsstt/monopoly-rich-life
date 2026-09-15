/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_14.js  (v2 精修)
 * -------------------------------------------------------------------------------------
 * 格 14「沙面大街」(g3 岭南组) 独属建筑：欧陆殖民骑楼四阶生长史
 * 参考图 refs/prop_14.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization）。
 *
 * —— v2 精修记录（对照 v1 自述差距逐条清偿，整体形态/配色/布局/朝向契约不变）——
 *   1) 拱廊拱券分环：每开间加半环拱券环（archivolt）+ 拱心石 + 拱脚 impost 线
 *   2) 骑楼柱柱式化：方础→双层柱础→收分柱身→柱颈环→柱头斗→柱头顶板（7 件套）
 *   3) 百叶窗逐片：每扇窗双侧百叶叶（背板+外倾百叶条逐片），绿/蓝绿/砖红三态
 *   4) 灰泥阴阳面分档：新增 stuccoShd 阴面材质（侧/后墙）、trimD 阴角线脚；
 *      隅石棋盘交替（trim/trimD）；层间腰线+窗楣/窗台成对
 *   5) 壁柱分间：上层层间加三件套壁柱（柱身+柱头+柱础）
 *   6) 陶瓦四坡顶：瓦垄贴图 256px 加密 + 檐下托板（modillion）成排
 *   7) 荷兰涡卷山花：肩部涡卷改圆环涡线盘+芯、肩角垫块、底檐口带、顶饰珠/方尖
 *      （修复 v1 lv3 山花埋入墙体 z 轴缺陷，v2 前凸出墙面）
 *   8) 绿釉中式亭顶：四角翘起+翅尖上挑+套兽、宝顶（车削座+葫芦腹）+金顶珠+顶刹
 *   9) 白瓶柱栏杆：瓶柱改车削花瓶剖面（LE 缓存几何）；穹顶尖加柱环
 *  10) lv1 木作风化：墙面板缝横板逐条、门三板双撑双铰链、板闭窗、坡面板缝压条+
 *      檩条+双层脊皮、木桶双铁箍、木柴堆
 *  11) 修复 v1 悬空：lv2/lv3/lv4 各层窗背面与墙面齐平贴装；lv4 横匾改挂于入口
 *      门楣通长护额板（fascia 前凸 0.71，彻底可见）
 *  12) 规范对齐：圆柱段数统一 ≥12、球体 16×12；Canvas 上限放宽至 512px
 *      （匾额 512×128 / 立牌 128×320 字形更锐）；材质 Roughness 分区更细
 *
 * 风格族谱（同一块地的同一种生长——沙面欧陆殖民风，与 v1 一致不推翻）：
 *   lv1 小屋   风化板条小屋 + 板皮人字顶 + 右前披檐棚 + 芭蕉（h≈1.10）
 *   lv2 洋房   两层奶油灰泥主楼 + 右塔楼荷兰涡卷山墙 + 底层三连拱廊 + 陶瓦四坡顶
 *              + 左侧木披檐门 + 绿百叶（h≈1.69）
 *   lv3 大厦   三层全拱廊骑楼 + 蓝绿百叶成排 + 白瓶柱压檐栏 + 陶瓦坡顶双老虎窗
 *              + 右端涡卷山花升高前凸 + 侧便门披棚 + 立式挂招牌（h≈2.23）
 *   lv4 地标   四层拱廊（f2/f3 白栏 galley）+ 四层退台混色百叶 + 白栏露台 + 宝瓶饰柱
 *              + 左翼陶瓦四坡顶 + 右上绿釉中式翘角亭顶宝顶 + 左角穹顶尖
 *              +「沙面大街」入口横匾（h≈2.96）
 *
 * 独有语汇（自参考图提炼，四阶贯穿）：奶油灰泥墙 × 白石材隅石/线脚、半圆拱骑楼廊
 * （拱券分环）、荷兰涡卷山墙（生长主线）、陶土瓦垄四坡顶、百叶窗板（绿→蓝绿→混色）、
 * 白瓶柱栏杆、木披檐棚、盆栽芭蕉石板径。同源生长锚点：涡卷山花随层数升位、拱廊由
 * 3 开间展至全宽、栏杆由压檐栏生长为层层 galley。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[14] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤512px）；每级 mesh ≤350；userData.anim=[fn(t, dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_14] THREE 未定义，请先加载 three.min.js (r147)');
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

/* 奶油灰泥：细噪 + 抹痕带（参考图米黄墙面；256px） */
function texStucco() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#e8daa8'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 380; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,240,0.06)' : 'rgba(140,120,80,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 4, 3);
  }
  for (i = 0; i < 26; i++) {                                    /* 水平抹痕带 */
    g.fillStyle = 'rgba(255,250,225,0.045)';
    g.fillRect(0, (i * 37) % S, S, 2 + (i % 3));
  }
  return toTex(cv, true);
}
/* 陶土瓦垄：12 行瓦 + 竖向接头错缝 + 陶面噪点（map+bump 同源；256px） */
function texTerra() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#ad5127'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#c96a33' : '#b5582a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#8a3f1f'; g.fillRect(0, y + rh - 4, S, 4);       /* 行底阴影 */
    g.fillStyle = '#dd8246'; g.fillRect(0, y + 1, S, 2);            /* 行顶高光 */
    var off = (i % 2) ? S / 8 : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(90,40,18,0.5)'; g.fillRect(x, y, 2, rh - 4);
      g.fillStyle = 'rgba(255,210,160,0.25)'; g.fillRect(x + 2, y + 2, 2, rh - 6);
    }
  }
  for (i = 0; i < 420; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,220,180,0.05)' : 'rgba(60,24,10,0.08)';
    g.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 绿釉瓦垄：同构绿釉（lv4 中式亭顶；256px） */
function texGlaze() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#47734d'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#57885c' : '#4d7a52';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#3a5f41'; g.fillRect(0, y + rh - 4, S, 4);
    g.fillStyle = '#6f9e74'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? S / 8 : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(30,52,36,0.5)'; g.fillRect(x, y, 2, rh - 4);
      g.fillStyle = 'rgba(210,245,215,0.22)'; g.fillRect(x + 2, y + 2, 2, rh - 6);
    }
  }
  for (i = 0; i < 380; i++) {
    g.fillStyle = (i % 3) ? 'rgba(220,255,225,0.05)' : 'rgba(18,36,24,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 风化木板：8 列竖板错色 + 深板缝 + 钉点（lv1 小屋；256px） */
function texPlank() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#8a7458'; g.fillRect(0, 0, S, S);
  var cols = 8, cw = S / cols, i, k;
  for (i = 0; i < cols; i++) {
    var x = i * cw;
    g.fillStyle = (i % 2) ? '#8a7458' : (i % 3) ? '#7d6850' : '#836e54';
    g.fillRect(x, 0, cw, S);
    g.fillStyle = 'rgba(52,42,30,0.75)'; g.fillRect(x, 0, 3, S);        /* 板缝深影 */
    g.fillStyle = 'rgba(255,240,210,0.10)'; g.fillRect(x + 3, 0, 2, S); /* 板缝受光 */
    for (k = 0; k < 4; k++) {                                           /* 木纹划痕 */
      g.fillStyle = (k % 2) ? 'rgba(255,240,210,0.06)' : 'rgba(50,38,26,0.10)';
      g.fillRect(x + 6 + ((k * 23) % (cw - 8)), (k * 67) % S, 2, 18 + (k * 11) % 22);
    }
    g.fillStyle = 'rgba(40,32,22,0.7)';                                 /* 板端钉点 */
    g.fillRect(x + cw / 2 - 2, 10, 4, 4);
    g.fillRect(x + cw / 2 - 2, S - 14, 4, 4);
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = 'rgba(70,120,60,0.05)';
    g.fillRect((i * 41) % S, (i * 19) % S, 4, 3);
  }
  return toTex(cv, true);
}
/* 石板径：石板网格 + 斑驳（地坪 / 骑楼走道；128px） */
function texStone() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b7ac97'; g.fillRect(0, 0, S, S);
  var i, k, cell = S / 4;
  for (i = 0; i < 4; i++) {
    for (k = 0; k < 4; k++) {
      g.fillStyle = ((i + k) % 2) ? 'rgba(255,255,245,0.08)' : 'rgba(90,82,66,0.10)';
      g.fillRect(i * cell + 2, k * cell + 2, cell - 4, cell - 4);
    }
  }
  g.fillStyle = '#8d8474';
  for (i = 0; i <= 4; i++) { g.fillRect(i * cell - 1, 0, 2, S); g.fillRect(0, i * cell - 1, S, 2); }
  return toTex(cv, true);
}
/* 立式招牌「沙面大街」：深栗漆 + 金边金字竖排（128×320，字形更锐） */
function texSignV() {
  var w = 128, h = 320, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2c2418'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d3a648'; g.lineWidth = 7; g.strokeRect(8, 8, w - 16, h - 16);
  g.strokeStyle = 'rgba(211,166,72,0.5)'; g.lineWidth = 3; g.strokeRect(18, 18, w - 36, h - 36);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 56px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '沙面大街', i;
  for (i = 0; i < 4; i++) g.fillText(s[i], w / 2, 62 + i * 68);
  return toTex(cv, true);
}
/* 横式匾额「沙面大街」（512×128；lv4 入口门楣） */
function texPlaqueH() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2c2418'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d3a648'; g.lineWidth = 9; g.strokeRect(9, 9, w - 18, h - 18);
  g.strokeStyle = 'rgba(211,166,72,0.5)'; g.lineWidth = 3; g.strokeRect(22, 22, w - 44, h - 44);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 78px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('沙面大街', w / 2, h / 2 + 4);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图逐区取样；v2 增加阴面档 stuccoShd/trimD） */
function Mats() {
  return {
    stucco:    MAT('p14stucco', function () { var t = getTex('stucco', texStucco); return std('#ffffff', { map: t, rough: 0.92 }); }),
    stuccoShd: MAT('p14stuccoS', function () { var t = getTex('stucco', texStucco); return std('#cfc09c', { map: t, rough: 0.95 }); }),
    trim:      MAT('p14trim', function () { return std('#efe9d8', { rough: 0.9 }); }),
    trimD:     MAT('p14trimD', function () { return std('#d9d0ba', { rough: 0.92 }); }),
    terraSun:  MAT('p14terraS', function () { var t = getTex('terra', texTerra); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.7 }); }),
    terraShd:  MAT('p14terraH', function () { var t = getTex('terra', texTerra); return std('#b09a90', { map: t, bump: t, bumpScale: 0.016, rough: 0.78 }); }),
    ridgeT:    MAT('p14ridgeT', function () { return std('#8a4526', { rough: 0.78 }); }),
    glazeSun:  MAT('p14glazeS', function () { var t = getTex('glaze', texGlaze); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.45, metal: 0.06 }); }),
    glazeShd:  MAT('p14glazeH', function () { var t = getTex('glaze', texGlaze); return std('#8fa8a0', { map: t, bump: t, bumpScale: 0.016, rough: 0.5, metal: 0.06 }); }),
    ridgeG:    MAT('p14ridgeG', function () { return std('#3a5f41', { rough: 0.55 }); }),
    plank:     MAT('p14plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.015, rough: 0.88 }); }),
    plankD:    MAT('p14plankD', function () { return std('#6b5842', { rough: 0.88 }); }),
    roofPlkS:  MAT('p14roofPlkS', function () { var t = getTex('plank', texPlank); return std('#c8b89c', { map: t, bump: t, bumpScale: 0.015, rough: 0.82 }); }),
    roofPlkH:  MAT('p14roofPlkH', function () { var t = getTex('plank', texPlank); return std('#96876f', { map: t, bump: t, bumpScale: 0.015, rough: 0.86 }); }),
    shutTeal:  MAT('p14shutT', function () { return std('#4a7a88', { rough: 0.62 }); }),
    shutGreen: MAT('p14shutG', function () { return std('#5f7d52', { rough: 0.62 }); }),
    shutRed:   MAT('p14shutR', function () { return std('#8e4a3a', { rough: 0.62 }); }),
    glassWarm: MAT('p14glassW', function () { return std('#453e30', { rough: 0.4, emissive: '#ffd98a', ei: 0.16 }); }),
    glassDk:   MAT('p14glassD', function () { return std('#33322c', { rough: 0.5 }); }),
    stone:     MAT('p14stone', function () { var t = getTex('stone', texStone); return std('#ffffff', { map: t, rough: 0.94 }); }),
    stoneD:    MAT('p14stoneD', function () { return std('#9a9080', { rough: 0.94 }); }),
    path:      MAT('p14path', function () { var t = getTex('stone', texStone); return std('#ffffff', { map: t, rough: 0.95 }); }),
    iron:      MAT('p14iron', function () { return std('#3a3f45', { rough: 0.55, metal: 0.35 }); }),
    gold:      MAT('p14gold', function () { return std('#cfa14a', { rough: 0.35, metal: 0.75 }); }),
    potT:      MAT('p14pot', function () { return std('#a05a38', { rough: 0.8 }); }),
    leaf:      MAT('p14leaf', function () { return std('#5d8a46', { rough: 0.85 }); }),
    leafD:     MAT('p14leafD', function () { return std('#497038', { rough: 0.85 }); }),
    trunk:     MAT('p14trunk', function () { return std('#7a6648', { rough: 0.9 }); }),
    grass:     MAT('p14grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p14grassD', function () { return std('#698f4c', { rough: 0.95 }); }),
    colRed:    MAT('p14colRed', function () { return std('#8a5a44', { rough: 0.75 }); }),
    ink:       MAT('p14ink', function () { return std('#32302a', { rough: 0.8 }); })
  };
}

/* ================= 2. 共享几何缓存（车削件 / 拱券环） ================= */
var _GEO = {};
function latheOf(key, prof, seg) {
  if (!_GEO[key]) {
    var pts = [], i;
    for (i = 0; i < prof.length; i++) pts.push(new THREE.Vector2(prof[i][0], prof[i][1]));
    _GEO[key] = new THREE.LatheGeometry(pts, seg);
  }
  return _GEO[key];
}
/* 白瓶柱：花瓶剖面（底珠→鼓腹→束腰→上盏），高 0.145 */
function vaseGeo() {
  return latheOf('vase',
    [[0.017, 0], [0.028, 0.012], [0.031, 0.03], [0.026, 0.055], [0.014, 0.085],
     [0.012, 0.1], [0.018, 0.12], [0.023, 0.136], [0.024, 0.145]], 12);
}
/* 宝瓶饰柱瓶身（lv4 露台角），高 0.145×s */
function urnGeo() {
  return latheOf('urn',
    [[0.05, 0], [0.062, 0.008], [0.05, 0.02], [0.028, 0.045], [0.02, 0.07],
     [0.026, 0.095], [0.018, 0.115], [0.012, 0.125], [0.02, 0.135], [0.023, 0.145]], 12);
}
/* 绿釉亭宝顶：座 + 葫芦腹 + 颈 + 顶珠座（高 0.112） */
function baodingGeo() {
  return latheOf('baoding',
    [[0.05, 0], [0.055, 0.012], [0.034, 0.03], [0.038, 0.06], [0.024, 0.082],
     [0.016, 0.095], [0.026, 0.105], [0.012, 0.112]], 12);
}
/* 半环拱券环（archivolt）：外环 ro 内环 ri，厚 0.032 */
function halfRingGeo(ro, ri) {
  var key = 'ring' + ro.toFixed(3) + '_' + ri.toFixed(3);
  if (!_GEO[key]) {
    var s = new THREE.Shape();
    s.absarc(0, 0, ro, 0, PI, false);
    var h = new THREE.Path();
    h.absarc(0, 0, ri, 0, PI, true);
    s.holes.push(h);
    _GEO[key] = new THREE.ExtrudeGeometry(s, { depth: 0.032, bevelEnabled: false, curveSegments: 12 });
  }
  return _GEO[key];
}

/* ================= 3. 预制件（风格独有语汇：blockout→structure→form） ================= */

/* 半圆拱拱墙：一块 ExtrudeGeometry 开 n 个拱洞（骑楼立面核心件） */
function archPanel(M, w, h, d, n, o) {
  o = o || {};
  var shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0); shape.lineTo(-w / 2, h);
  shape.lineTo(w / 2, h); shape.lineTo(w / 2, 0); shape.lineTo(-w / 2, 0);
  var aw = Math.min(o.aw !== undefined ? o.aw : (w / n) * 0.66, w / n - 0.06);
  var ah = (o.ah !== undefined ? o.ah : aw * 0.72);
  var i, cx;
  for (i = 0; i < n; i++) {
    cx = -w / 2 + (i + 0.5) * (w / n);
    var hole = new THREE.Path();
    hole.moveTo(cx - aw / 2, 0);
    hole.lineTo(cx - aw / 2, ah);
    hole.absarc(cx, ah, aw / 2, PI, 0, true);
    hole.lineTo(cx + aw / 2, 0);
    hole.lineTo(cx - aw / 2, 0);
    shape.holes.push(hole);
  }
  var geo = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false, curveSegments: 12 });
  geo.translate(0, 0, -d / 2);
  return mesh(geo, o.mat || M.stucco);
}

/* 拱廊正立面：拱墙 + 每开间拱券分环 + 拱心石 + 拱脚 impost 线（v2 清偿差距#1） */
function arcadeFront(M, w, h, d, n, o) {
  o = o || {};
  var g = grp();
  g.add(archPanel(M, w, h, d, n, o));
  var aw = Math.min(o.aw !== undefined ? o.aw : (w / n) * 0.66, w / n - 0.06);
  var ah = (o.ah !== undefined ? o.ah : aw * 0.72);
  var zf = d / 2, i, cx;
  for (i = 0; i < n; i++) {
    cx = -w / 2 + (i + 0.5) * (w / n);
    var ring = mesh(halfRingGeo(aw / 2 + 0.034, aw / 2), M.trim);      /* 拱券环 */
    ring.position.set(cx, ah, zf - 0.004); g.add(ring);
    g.add(box(0.05, 0.09, 0.05, M.trim, cx, ah + aw / 2 + 0.012, zf + 0.014)); /* 拱心石 */
  }
  g.add(box(w + 0.05, 0.026, 0.02, M.trim, 0, ah, zf + 0.004));        /* 拱脚线 */
  return g;
}

/* 骑楼柱（柱式化 v2）：方础→双层柱础→收分柱身→柱颈环→柱头斗→柱头顶板（差距#2） */
function colArc(M, h, r) {
  var g = grp();
  g.add(box(r * 3.1, 0.04, r * 3.1, M.trim, 0, 0.02, 0));
  g.add(cyl(r * 1.5, r * 1.58, 0.032, 12, M.trim, 0, 0.056, 0));
  g.add(cyl(r * 1.16, r * 1.36, 0.03, 12, M.trim, 0, 0.086, 0));
  g.add(cyl(r * 0.92, r * 1.04, h - 0.17, 12, M.trim, 0, 0.1 + (h - 0.17) / 2, 0));
  g.add(cyl(r * 1.04, r * 0.94, 0.026, 12, M.trim, 0, h - 0.092, 0));
  g.add(cyl(r * 1.28, r * 1.04, 0.036, 12, M.trim, 0, h - 0.06, 0));
  g.add(box(r * 2.7, 0.03, r * 2.7, M.trim, 0, h - 0.027, 0));
  return g;
}

/* 百叶叶：背板 + 逐片外倾百叶条（v2 差距#3：百叶逐片可读） */
function shutterLeaf(M, w, h, mat, slats) {
  var g = grp();
  g.add(box(w, h, 0.016, mat, 0, 0, 0));
  var sh = h / slats, i;
  for (i = 0; i < slats; i++) {
    var sl = box(w * 1.08, 0.011, sh * 0.78, mat, 0, -h / 2 + sh * (i + 0.5), 0.02);
    sl.rotation.x = 0.5;
    g.add(sl);
  }
  return g;
}

/* 百叶窗：白框 + 暖玻璃 + 双棂 + 双侧外张百叶叶 + 窗台/窗楣（背面与墙面齐平贴装） */
function shutterWindow(M, w, h, shMat, o) {
  o = o || {};
  var g = grp();
  g.add(box(w + 0.06, h + 0.06, 0.03, M.trim));
  g.add(box(w, h, 0.032, o.glass || M.glassWarm, 0, 0, 0.004));
  g.add(box(w, 0.018, 0.012, M.trim, 0, 0, 0.024));                    /* 横棂 */
  if (!o.slim) g.add(box(0.02, h, 0.012, M.trim, 0, 0, 0.024));        /* 竖棂 */
  var sw = w * 0.42;
  var slats = o.slats || Math.max(3, Math.round(h / 0.075));
  var i;
  for (i = -1; i <= 1; i += 2) {
    var leaf = shutterLeaf(M, sw, h, shMat, slats);
    leaf.position.set(i * (w / 2 + sw / 2 + 0.012), 0, 0.008);
    leaf.rotation.y = -i * 0.18;                                       /* 外张开启 */
    g.add(leaf);
  }
  if (!o.noSill) g.add(box(w + 0.14, 0.03, 0.06, M.trim, 0, -h / 2 - 0.045, 0.004));
  if (!o.slim) g.add(box(w + 0.12, 0.035, 0.05, M.trim, 0, h / 2 + 0.032, 0.004));
  return g;
}

/* 壁柱三件套：柱身 + 柱础 + 柱头（v2 差距#4 立面分间） */
function pilaster(M, h) {
  var g = grp();
  g.add(box(0.07, h, 0.03, M.trimD, 0, h / 2, 0));
  g.add(box(0.098, 0.032, 0.04, M.trim, 0, 0.016, 0.005));
  g.add(box(0.098, 0.032, 0.04, M.trim, 0, h - 0.016, 0.005));
  return g;
}

/* 白瓶柱栏杆：下轨 + 车削花瓶瓶柱列 + 压顶（v2 差距#8：瓶形可读） */
function balustrade(M, w, o) {
  o = o || {};
  var sp = o.sp || 0.16, hh = (o.h !== undefined ? o.h : 0.19);
  var g = grp();
  g.add(box(w, 0.035, 0.05, M.trim, 0, 0.0175, 0));
  var n = Math.max(3, Math.round(w / sp)), i;
  for (i = 0; i <= n; i++) {
    var v = mesh(vaseGeo(), M.trim);
    v.position.set(-w / 2 + i * (w / n), 0.035, 0);
    g.add(v);
  }
  g.add(box(w + 0.02, 0.028, 0.062, M.trim, 0, 0.192, 0));
  return g;
}

/* 四坡瓦顶：四面瓦坡 + 滴檐 + 正脊 + 端吻 + 平顶芯 +（v2）檐下托板成排 */
function hipRoof(M, o) {
  var w = o.w, d = o.d, h = o.h, sun = o.mat || M.terraSun, shd = o.shadeMat || M.terraShd;
  var w2 = w / 2, d2 = d / 2, rw = Math.max(0.03, w2 - d2 * 0.7);
  var pos = [], uv = [];
  function tri(a, b, c, uvs) {
    pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
    uv.push(uvs[0], uvs[1], uvs[2], uvs[3], uvs[4], uvs[5]);
  }
  function quad(a, b, c, d2p) {
    tri(a, b, d2p, [0, 0, 1, 0, 0, 1]);
    tri(b, c, d2p, [1, 0, 1, 1, 0, 1]);
  }
  var A = [-w2, 0, d2], B = [w2, 0, d2], Cp = [rw, h, 0], Dp = [-rw, h, 0], E = [w2, 0, -d2], F = [-w2, 0, -d2];
  quad(A, B, Cp, Dp);            /* 前坡（迎光） */
  quad(E, F, Dp, Cp);            /* 后坡（背光） */
  tri(B, E, Cp, [0, 0, 1, 0, 0.6, 1]);   /* 右坡 */
  tri(F, A, Dp, [0, 0, 1, 0, 0.6, 1]);   /* 左坡 */
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
  geo.computeVertexNormals();
  var g = grp();
  var body = mesh(geo, sun); g.add(body);
  g.add(box(w - 0.06, 0.025, d - 0.06, shd, 0, -0.012, 0));          /* 底芯（防透视） */
  g.add(box(w + 0.1, 0.05, 0.03, M.ridgeT, 0, -0.02, d2 + 0.02));    /* 前滴檐 */
  g.add(box(w + 0.1, 0.05, 0.03, M.ridgeT, 0, -0.02, -d2 - 0.02));   /* 后滴檐 */
  g.add(box(Math.max(0.08, rw * 2 + 0.06), 0.055, 0.1, M.ridgeT, 0, h + 0.02, 0)); /* 正脊 */
  var f1 = box(0.07, 0.09, 0.09, M.ridgeT, Math.max(0.05, rw) + 0.02, h + 0.06, 0);
  f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.07, 0.09, 0.09, M.ridgeT, -(Math.max(0.05, rw) + 0.02), h + 0.06, 0);
  f2.rotation.z = -0.4; g.add(f2);
  if (o.corbels) {                                                   /* 檐下托板（v2） */
    var nc = o.corbels, ci;
    for (ci = 0; ci < nc; ci++) {
      g.add(box(0.05, 0.045, 0.075, M.trim, -w * 0.32 + ci * (w * 0.64 / (nc - 1)), -0.05, d2 + 0.005));
    }
  }
  return g;
}

/* 板皮人字顶（lv1 v2）：双坡板面 + 板缝压条 + 檐下檩条 + 山墙封板 + 双层脊皮 */
function gableRoofPlank(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), i, k;
  var eave = d / 2 + 0.08;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + 0.16, 0.035, slopeLen, k > 0 ? M.roofPlkS : M.roofPlkH, 0, 0, k * slopeLen / 2));
    sg.add(box(w + 0.18, 0.05, 0.026, M.plankD, 0, -0.004, k * eave));
    for (i = -1; i <= 1; i++) {                                       /* 板缝压条 ×3 */
      sg.add(box(0.022, 0.014, slopeLen * 0.96, M.plankD, i * (w + 0.02) / 3.4, 0.021, k * slopeLen / 2));
    }
    for (i = -1; i <= 1; i++) {                                       /* 檐下檩条 ×3 */
      var pl = cyl(0.016, 0.016, 0.09, 12, M.plankD, i * w * 0.32, -0.035, k * (eave - 0.06));
      pl.rotation.z = PI / 2; sg.add(pl);
    }
  }
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
  var t1 = mesh(gg, M.plankD); t1.rotation.y = PI / 2;
  t1.position.set(w / 2 + 0.005, -0.02, -0.0225); g.add(t1);
  var t2 = mesh(gg, M.plankD); t2.rotation.y = -PI / 2;
  t2.position.set(-(w / 2 + 0.005), -0.02, 0.0225); g.add(t2);
  g.add(box(w + 0.2, 0.028, 0.075, M.plankD, 0, h + 0.03, 0));        /* 双层脊皮 */
  g.add(box(w + 0.16, 0.028, 0.055, M.plankD, 0, h + 0.058, 0));
  return g;
}

/* 荷兰涡卷山花 v2：弧胸山墙体 + 白缘盘 + 底檐口带 + 圆环涡卷盘（涡线+芯）
 * + 肩角垫块 + 圆窗 + 顶饰珠（lv2）/ 方尖顶饰（lv3）；整体前凸出墙面（修复 v1 埋墙） */
function dutchGable(M, o) {
  var w = o.w, h = o.h, d = o.d || 0.14;
  var g = grp();
  function prof(sw, sh) {
    var s = new THREE.Shape();
    s.moveTo(-sw / 2, 0); s.lineTo(-sw / 2, sh * 0.5);
    s.quadraticCurveTo(-sw / 2, sh * 0.82, -sw * 0.22, sh * 0.9);
    s.quadraticCurveTo(-sw * 0.08, sh * 0.95, 0, sh);
    s.quadraticCurveTo(sw * 0.08, sh * 0.95, sw * 0.22, sh * 0.9);
    s.quadraticCurveTo(sw / 2, sh * 0.82, sw / 2, sh * 0.5);
    s.lineTo(sw / 2, 0); s.lineTo(-sw / 2, 0);
    return s;
  }
  var rimGeo = new THREE.ExtrudeGeometry(prof(w * 1.12, h * 1.08), { depth: d * 0.6, bevelEnabled: false, curveSegments: 12 });
  rimGeo.translate(0, 0, -d * 0.3);
  var rim = mesh(rimGeo, M.trim); rim.position.z = -0.012; g.add(rim);
  var bodyGeo = new THREE.ExtrudeGeometry(prof(w, h), { depth: d, bevelEnabled: false, curveSegments: 12 });
  bodyGeo.translate(0, 0, -d / 2);
  g.add(mesh(bodyGeo, M.stucco));
  g.add(box(w * 1.2, 0.035, d + 0.07, M.trim, 0, 0.018, 0));          /* 底檐口带 */
  var i;
  for (i = -1; i <= 1; i += 2) {                                      /* 肩部涡卷盘 + 芯 */
    var vol = mesh(new THREE.TorusGeometry(h * 0.13, h * 0.05, 8, 18), M.trim);
    vol.position.set(i * w * 0.36, h * 0.5, d / 2 + 0.005); g.add(vol);
    g.add(sph(h * 0.045, M.trim, i * w * 0.36, h * 0.5, d / 2 + 0.016));
    g.add(box(0.055, 0.05, d * 0.7, M.trim, i * w * 0.5, h * 0.16, 0)); /* 肩角垫块 */
  }
  var winF = cyl(h * 0.16, h * 0.16, 0.035, 12, M.trim, 0, h * 0.4, d / 2 + 0.006);
  winF.rotation.x = PI / 2; g.add(winF);
  var winG = cyl(h * 0.1, h * 0.1, 0.04, 12, o.winMat || M.glassWarm, 0, h * 0.4, d / 2 + 0.008);
  winG.rotation.x = PI / 2; g.add(winG);
  if (o.finial === 'obelisk') {                                       /* 方尖顶饰 + 珠 */
    g.add(sph(0.028, M.trim, 0, h * 1.08 + 0.02, 0));
    var ob = cone(0.024, 0.09, 4, M.trim, 0, h * 1.08 + 0.075, 0);
    ob.rotation.y = PI / 4; g.add(ob);
  } else {                                                            /* 圆珠顶饰（lv2 限高） */
    g.add(sph(0.022, M.trim, 0, h * 1.08 + 0.015, 0));
  }
  return g;
}

/* 老虎窗 v2：窗肚墙 + 暖玻璃 + 窗楣/窗台 + 四棱瓦顶 + 顶脊 */
function dormer(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.16 * s, 0.14 * s, 0.07, M.stuccoShd));
  g.add(box(0.11 * s, 0.09 * s, 0.06, M.glassWarm, 0, -0.006 * s, 0.006));
  g.add(box(0.15 * s, 0.022, 0.03, M.trim, 0, 0.052 * s, 0.008));
  g.add(box(0.15 * s, 0.02, 0.035, M.trim, 0, -0.062 * s, 0.008));
  var tent = cone(0.105 * s, 0.085 * s, 4, M.terraSun, 0, 0.115 * s, 0);
  tent.rotation.y = PI / 4; tent.scale.z = 1.3; g.add(tent);
  g.add(box(0.02, 0.024, 0.1 * s, M.ridgeT, 0, 0.128 * s, 0.07 * s));
  return g;
}

/* 绿釉中式亭顶 v2：四坡绿瓦 + 四角翘起+翅尖上挑 + 卷脊 + 宝顶 + 金顶珠 + 顶刹 */
function pavilionRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.06, eaveS = w / 2 + 0.06;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.74 + 0.14, 0.03, lenF, M.glazeSun, 0, 0, lenF / 2));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.74 + 0.14, 0.03, lenF, M.glazeShd, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.03, d * 0.82, M.glazeShd, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.03, d * 0.82, M.glazeShd, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {         /* 四角翘起+翅尖 */
    var lift = box(0.07, 0.055, 0.07, M.ridgeG, c[0] * (eaveS - 0.02), 0.05, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.62; lift.rotation.x = c[1] * 0.18; g.add(lift);
    var tip = box(0.028, 0.026, 0.028, M.ridgeG, c[0] * (eaveS + 0.028), 0.088, c[1] * (eaveF + 0.028));
    tip.rotation.z = -c[0] * 0.9; g.add(tip);
  });
  g.add(box(w * 0.5, 0.055, 0.08, M.ridgeG, 0, h + 0.02, 0));
  var c1 = box(0.05, 0.09, 0.07, M.ridgeG, w * 0.25, h + 0.07, 0); c1.rotation.z = 0.45; g.add(c1);
  var c2 = box(0.05, 0.09, 0.07, M.ridgeG, -w * 0.25, h + 0.07, 0); c2.rotation.z = -0.45; g.add(c2);
  var bd = mesh(baodingGeo(), M.ridgeG);                              /* 宝顶 */
  bd.position.set(0, h + 0.042, 0); g.add(bd);
  put(g, sph(0.028, M.gold), 0, h + 0.163, 0);                         /* 金顶珠 */
  g.add(cone(0.012, 0.035, 12, M.gold, 0, h + 0.205, 0));              /* 顶刹 */
  return g;
}

/* 宝瓶饰柱（lv4 露台角）v2：方座 + 车削瓶身 + 金珠 + 金尖 */
function urnFinial(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.085 * s, 0.05 * s, 0.085 * s, M.trim, 0, 0.025 * s, 0));
  var u = mesh(urnGeo(), M.trim);
  u.scale.set(s, s, s); u.position.set(0, 0.05 * s, 0); g.add(u);
  g.add(sph(0.02 * s, M.gold, 0, 0.21 * s, 0));
  g.add(cone(0.014 * s, 0.04 * s, 12, M.gold, 0, 0.25 * s, 0));
  return g;
}

/* 穹顶尖（lv4 左角）v2：鼓座 + 柱环 + 陶穹顶 + 金尖 */
function domeFinial(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.058 * s, 0.06 * s, 12, M.trim, 0, 0.03 * s, 0));
  g.add(cyl(0.04 * s, 0.046 * s, 0.02 * s, 12, M.trim, 0, 0.07 * s, 0));
  var dm = sph(0.055 * s, M.terraSun, 0, 0.095 * s, 0); dm.scale.y = 0.9; g.add(dm);
  g.add(cone(0.014 * s, 0.055 * s, 12, M.gold, 0, 0.175 * s, 0));
  return g;
}

/* 木披檐棚（lv1 披棚 / lv2 侧门棚 / lv3 侧便门棚）：立柱 + 斜板面 + 滴水封板 */
function awningShed(M, o) {
  var g = grp();
  if (o.post) g.add(box(0.045, o.py, 0.045, M.plankD, o.px || 0, o.py / 2, o.pz || 0));
  var roof = box(o.w, 0.026, o.d, M.plankD, 0, 0, 0);
  if (o.axis === 'z') roof.rotation.x = o.tilt; else roof.rotation.z = o.tilt;
  roof.position.set(o.rx || 0, o.ry || 0, o.rz || 0);
  g.add(roof);
  var fas = box(o.axis === 'z' ? o.w : 0.03, 0.05, o.axis === 'z' ? 0.03 : o.d, M.plankD);
  fas.position.set(o.fx !== undefined ? o.fx : (o.rx || 0), o.fy !== undefined ? o.fy : (o.ry || 0) - 0.045,
    o.fz !== undefined ? o.fz : (o.rz || 0) + (o.axis === 'z' ? o.d / 2 : 0));
  g.add(fas);
  return g;
}

/* 吊灯（骑楼廊下）：吊杆 + 锥帽 + 暖光罩（摆动 + 呼吸） */
function pendantLamp(M, anims, phase) {
  var g = grp();
  g.add(cyl(0.008, 0.008, 0.09, 12, M.iron, 0, -0.045, 0));
  g.add(cone(0.05, 0.045, 12, M.iron, 0, -0.105, 0));
  g.add(box(0.055, 0.065, 0.055, M.glassWarm, 0, -0.155, 0));
  anims.push(function (t) { g.rotation.z = sin(t * 1.4 + (phase || 0)) * 0.05; });
  return g;
}

/* 立式挂招牌：挑臂 + 吊杆 + 栗漆牌 + 金字面（摆动动画） */
function hangingSign(M, anims, phase) {
  var g = grp();
  g.add(box(0.025, 0.025, 0.34, M.iron, 0, 0, 0.17));
  g.add(box(0.018, 0.06, 0.018, M.iron, 0, -0.04, 0.3));
  var swing = grp(); swing.position.set(0, -0.07, 0.3); g.add(swing);
  swing.add(box(0.02, 0.46, 0.16, M.plankD, 0, -0.23, 0));
  var face = mesh(new THREE.PlaneGeometry(0.13, 0.4),
    new THREE.MeshStandardMaterial({ map: getTex('signV', texSignV), roughness: 0.6, metalness: 0.05, flatShading: true }));
  face.rotation.y = PI / 2; face.position.set(0.012, -0.23, 0); swing.add(face);
  anims.push(function (t) { swing.rotation.y = sin(t * 1.25 + (phase || 0)) * 0.06; });
  return g;
}

/* 芭蕉：柱干 + 六片大叶（摇曳动画——热带沙面锚点件） */
function bananaPlant(M, s, anims, phase) {
  var g = grp();
  g.add(cyl(0.032 * s, 0.048 * s, 0.32 * s, 12, M.trunk, 0, 0.16 * s, 0));
  var crown = grp(); crown.position.y = 0.33 * s; g.add(crown);
  var i;
  for (i = 0; i < 6; i++) {
    var hold = grp();
    hold.rotation.y = (i / 6) * PI * 2 + 0.3;
    hold.rotation.z = 0.42 + (i % 3) * 0.12;
    var leaf = sph(0.15 * s, i % 2 ? M.leaf : M.leafD, 0.14 * s, 0, 0);
    leaf.scale.set(1.45, 0.1, 0.4);
    hold.add(leaf); crown.add(hold);
  }
  anims.push(function (t) { crown.rotation.z = sin(t * 1.05 + (phase || 0)) * 0.035; });
  return g;
}

/* 盆栽：陶盆 + 灌丛（骑楼前沿锚点件） */
function pottedPlant(M, s, tall) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.065 * s, 0.09 * s, 12, M.potT, 0, 0.045 * s, 0));
  if (tall) g.add(cyl(0.014 * s, 0.02 * s, 0.09 * s, 12, M.trunk, 0, 0.13 * s, 0));
  var b = mesh(new THREE.IcosahedronGeometry(0.062 * s, 0), M.leafD);
  b.position.set(0, (tall ? 0.21 : 0.14) * s, 0); b.scale.y = 0.9; g.add(b);
  return g;
}

/* 地坪：草缘 + 草面 + 石板径 + 前导踏石 ×2 + 岩石 + 灌丛（参考图绿边 + 石板路） */
function padUnit(M, size, depth, px) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  g.add(box(0.52, 0.014, 0.7, M.path, px !== undefined ? px : 0, 0.056, d / 2 - 0.38));
  g.add(box(0.3, 0.012, 0.18, M.path, (px !== undefined ? px : 0) + 0.14, 0.055, d / 2 - 0.08));
  g.add(box(0.26, 0.012, 0.15, M.path, (px !== undefined ? px : 0) - 0.13, 0.055, d / 2 - 0.16));
  var rock = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD);
  put(g, rock, size / 2 - 0.3, 0.065, -d / 2 + 0.32);
  var bush = mesh(new THREE.IcosahedronGeometry(0.075, 0), M.grassD);
  put(g, bush, -size / 2 + 0.28, 0.1, -d / 2 + 0.3);
  bush.scale.y = 0.8;
  return g;
}

/* ================= 4. 四阶生长（form→material→lighting→interaction） ================= */

/* ---- lv1 小屋：风化板条小屋 + 板皮人字顶 + 披檐棚（h≈1.10） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.0, 0.42));
  /* 石础台 + 板条墙 + 角柱 + 顶板 */
  g.add(box(1.5, 0.08, 1.14, M.stoneD, 0, 0.04, -0.06));
  g.add(box(1.34, 0.6, 0.96, M.plank, 0, 0.38, -0.06));
  /* 风化板缝：正面横板逐条 ×3（v2 差距#9） */
  var bi;
  for (bi = 0; bi < 3; bi++) {
    g.add(box(1.37, 0.115, 0.016, M.plankD, 0, 0.19 + bi * 0.165, 0.425));
  }
  [[-0.64, 0.39], [0.64, 0.39], [-0.64, -0.51], [0.64, -0.51]].forEach(function (c) {
    g.add(box(0.055, 0.6, 0.055, M.plankD, c[0], 0.38, c[1]));
  });
  g.add(box(1.44, 0.05, 1.06, M.plankD, 0, 0.705, -0.06));
  /* 门：三竖板 + 双横撑 + 双铰链（偏左） */
  var di;
  for (di = -1; di <= 1; di++) {
    g.add(box(0.088, 0.44, 0.05, M.plankD, -0.25 + di * 0.093, 0.31, 0.435));
  }
  g.add(box(0.28, 0.05, 0.02, M.ink, -0.25, 0.42, 0.462));
  g.add(box(0.28, 0.05, 0.02, M.ink, -0.25, 0.18, 0.462));
  g.add(box(0.022, 0.05, 0.03, M.iron, -0.2, 0.35, 0.462));
  g.add(box(0.022, 0.05, 0.03, M.iron, -0.3, 0.35, 0.462));
  /* 暖光小窗（右）+ 双侧板闭窗 + 窗台 */
  g.add(box(0.26, 0.24, 0.045, M.plankD, 0.3, 0.44, 0.43));
  g.add(box(0.2, 0.18, 0.05, M.glassWarm, 0.3, 0.44, 0.432));
  g.add(box(0.075, 0.2, 0.03, M.plankD, 0.185, 0.44, 0.452));
  g.add(box(0.075, 0.2, 0.03, M.plankD, 0.415, 0.44, 0.452));
  g.add(box(0.3, 0.03, 0.06, M.plankD, 0.3, 0.305, 0.44));
  /* 门口石阶 ×2 */
  g.add(box(0.4, 0.05, 0.18, M.stoneD, -0.25, 0.025, 0.56));
  g.add(box(0.34, 0.04, 0.12, M.stoneD, -0.25, 0.07, 0.63));
  /* 板皮人字顶（v2：板缝压条+檩条+双层脊皮，apex≈1.10） */
  var roof = gableRoofPlank(M, { w: 1.34, d: 1.06, h: 0.3 });
  put(g, roof, 0, 0.73, -0.06);
  /* 右前披檐棚（lv2 侧门棚的前身） */
  var awn = awningShed(M, {
    post: true, py: 0.42, px: 0.14, pz: 0.56, axis: 'z',
    w: 0.72, d: 0.4, rx: 0.44, ry: 0.47, rz: 0.42, tilt: -0.26,
    fy: 0.42, fz: 0.61
  });
  g.add(awn);
  /* 斜靠木板 + 木桶（双铁箍）+ 木柴堆 */
  var pallet = box(0.22, 0.3, 0.018, M.plankD, -0.66, 0.21, 0.47);
  pallet.rotation.x = -0.22; g.add(pallet);
  g.add(cyl(0.068, 0.082, 0.16, 12, M.plankD, 0.84, 0.12, 0.24));
  var hp;
  for (hp = 0; hp < 2; hp++) {
    var hoop = mesh(new THREE.TorusGeometry(0.085, 0.008, 6, 16), M.iron);
    hoop.rotation.x = PI / 2; hoop.position.set(0.84, 0.07 + hp * 0.08, 0.24); g.add(hoop);
  }
  var li;
  for (li = 0; li < 3; li++) {
    var log = cyl(0.032, 0.032, 0.24, 12, M.trunk, -0.86 + li * 0.015, 0.065 + li * 0.055, 0.6 - li * 0.1);
    log.rotation.z = PI / 2; log.rotation.y = 0.06 * li; g.add(log);
  }
  /* 芭蕉（左后，摇曳）+ 灌丛 */
  put(g, bananaPlant(M, 1.0, anims, 0.7), -0.9, 0.02, -0.44);
  var bush = mesh(new THREE.IcosahedronGeometry(0.09, 0), M.leafD);
  put(g, bush, 0.98, 0.09, -0.34); bush.scale.y = 0.85;
  /* 暖窗呼吸 */
  var gw = M.glassWarm;
  anims.push(function (t) { gw.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：两层灰泥主楼 + 右塔涡卷山墙 + 三连拱廊 + 陶瓦四坡顶（h≈1.69） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.15, -0.3));
  /* 台基 + 主楼体（左） + 塔楼体（右；侧面阴面档） */
  g.add(box(2.14, 0.09, 1.32, M.stoneD, -0.08, 0.045, -0.04));
  g.add(box(1.22, 1.08, 1.06, M.stucco, -0.5, 0.585, -0.04));      /* 主楼 0.09-1.125 */
  g.add(box(0.82, 1.21, 1.1, M.stucco, 0.51, 0.695, -0.06));       /* 塔楼 0.09-1.30 */
  g.add(box(0.02, 1.21, 1.1, M.stuccoShd, 0.925, 0.695, -0.06));   /* 塔楼右侧阴面（分档） */
  /* 白隅石（棋盘交替 trim/trimD，v2 差距#4） */
  [[0.105, 0.4], [0.915, 0.95], [-1.095, 0.4], [-1.08, 1.06],
   [0.105, 0.95], [0.915, 0.4], [-1.095, 0.95], [-1.08, 0.4]].forEach(function (q, qi) {
    g.add(box(0.075, 0.22, 0.035, qi % 2 ? M.trimD : M.trim, q[0], q[1], 0.5));
  });
  /* 层间线脚 ×2 + 主楼顶檐口 + 塔顶压顶石 */
  g.add(box(1.28, 0.05, 1.1, M.trim, -0.5, 0.635, -0.04));
  g.add(box(0.88, 0.05, 1.14, M.trim, 0.51, 0.70, -0.06));
  g.add(box(1.3, 0.06, 1.12, M.trim, -0.5, 1.155, -0.04));
  g.add(box(0.9, 0.05, 1.14, M.trim, 0.51, 1.325, -0.06));
  /* 主楼壁柱分间（v2） */
  var pil = pilaster(M, 0.98); put(g, pil, -0.5, 0.09, 0.505);
  /* 底层三连拱廊（拱券分环 + 暗腔 + 走道石板 + 柱式骑楼柱 ×4） */
  var arc = arcadeFront(M, 1.12, 0.5, 0.07, 3, { aw: 0.28, ah: 0.2 });
  put(g, arc, -0.5, 0.09, 0.5);
  g.add(box(1.0, 0.48, 0.03, M.ink, -0.5, 0.33, 0.455));
  g.add(box(1.12, 0.02, 0.26, M.path, -0.5, 0.10, 0.32));
  var ci, colXs = [-0.995, -0.687, -0.313, -0.005];
  for (ci = 0; ci < 4; ci++) {
    var c = colArc(M, 0.46, 0.032); put(g, c, colXs[ci], 0.09, 0.42);
  }
  /* 塔楼底层：独拱门洞（分环） + 暗腔 */
  var tdoor = arcadeFront(M, 0.36, 0.52, 0.05, 1, { aw: 0.22, ah: 0.3 });
  put(g, tdoor, 0.51, 0.09, 0.505);
  g.add(box(0.24, 0.34, 0.03, M.ink, 0.51, 0.26, 0.472));
  /* 二层百叶窗 ×3（绿，逐片；背面与墙面 0.49 齐平） */
  var w1 = shutterWindow(M, 0.24, 0.3, M.shutGreen); put(g, w1, -0.78, 0.9, 0.505);
  var w2 = shutterWindow(M, 0.24, 0.3, M.shutGreen); put(g, w2, -0.22, 0.9, 0.505);
  var w3 = shutterWindow(M, 0.24, 0.3, M.shutGreen); put(g, w3, 0.51, 1.0, 0.505);
  /* 塔楼侧面窄百叶窗（slim，外张） */
  var wT = shutterWindow(M, 0.2, 0.26, M.shutGreen, { slim: true, noSill: true, slats: 3 });
  put(g, wT, 0.925, 0.98, -0.1, PI / 2);
  /* 塔顶荷兰涡卷山花（生长主线起点，前凸 z0.53，圆珠顶饰，apex≈1.69） */
  var gab = dutchGable(M, { w: 0.86, h: 0.28, d: 0.16 });
  put(g, gab, 0.51, 1.35, 0.53);
  /* 主楼陶瓦四坡顶（apex≈1.42；v2 檐下托板 ×4） */
  var roof = hipRoof(M, { w: 1.3, d: 1.16, h: 0.26, corbels: 4 });
  put(g, roof, -0.5, 1.155, -0.04);
  /* 左侧墙木披檐门 + 棚（lv1 披棚基因） */
  g.add(box(0.04, 0.34, 0.24, M.ink, -1.115, 0.26, 0.14));
  g.add(box(0.05, 0.03, 0.28, M.plankD, -1.11, 0.44, 0.14));
  var swn = awningShed(M, {
    post: true, py: 0.5, px: -1.19, pz: 0.36, axis: 'x',
    w: 0.24, d: 0.52, rx: -1.15, ry: 0.58, rz: 0.2, tilt: 0.3,
    fx: -1.28, fy: 0.535, fz: 0.2
  });
  g.add(swn);
  /* 廊下吊灯（摆动）+ 盆栽 ×2 + 芭蕉 */
  var lamp = pendantLamp(M, anims, 0.6); put(g, lamp, 0.02, 1.05, 0.52);
  put(g, pottedPlant(M, 1.0, false), -1.16, 0.09, 0.42);
  put(g, pottedPlant(M, 1.0, false), 0.74, 0.09, 0.56);
  put(g, bananaPlant(M, 0.9, anims, 1.6), -1.0, 0.02, -0.52);
  /* 暖窗呼吸 */
  var gw = M.glassWarm;
  anims.push(function (t) { gw.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1 + 0.4); });
  return g;
}

/* ---- lv3 大厦：三层全拱廊骑楼 + 白瓶柱压檐栏 + 双虎窗 + 涡卷山花升位（h≈2.23） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3, 0));
  /* 台基 + 骑楼走道石板 */
  g.add(box(2.26, 0.1, 1.54, M.stoneD, 0, 0.05, -0.08));
  g.add(box(2.16, 0.03, 1.44, M.path, 0, 0.115, -0.08));
  /* 一层骑楼（0.13-0.72）：三连拱全宽分环 + 暗腔 + 阴面侧/后墙 + 柱式柱 ×4 + 顶板 */
  var arc = arcadeFront(M, 2.2, 0.59, 0.07, 3, { aw: 0.42, ah: 0.3 });
  put(g, arc, 0, 0.13, 0.6);
  g.add(box(2.1, 0.57, 1.14, M.ink, 0, 0.42, -0.06));
  g.add(box(0.1, 0.59, 1.3, M.stuccoShd, -1.07, 0.425, -0.08));
  g.add(box(0.1, 0.59, 1.3, M.stuccoShd, 1.07, 0.425, -0.08));
  g.add(box(2.2, 0.59, 0.12, M.stuccoShd, 0, 0.425, -0.68));
  var ci, colXs = [-1.0, -0.367, 0.367, 1.0];
  for (ci = 0; ci < 4; ci++) {
    var c = colArc(M, 0.52, 0.034); put(g, c, colXs[ci], 0.13, 0.5);
  }
  g.add(box(2.3, 0.055, 1.4, M.trim, 0, 0.7475, -0.08));
  /* 二层（0.775-1.225）：灰泥墙 + 蓝绿百叶 ×3（贴墙 0.52）+ 壁柱 ×2 + 层间线脚 */
  g.add(box(2.14, 0.45, 1.24, M.stucco, 0, 1.0, -0.1));
  var w21 = shutterWindow(M, 0.26, 0.3, M.shutTeal); put(g, w21, -0.68, 1.0, 0.535);
  var w22 = shutterWindow(M, 0.26, 0.3, M.shutTeal); put(g, w22, 0, 1.0, 0.535);
  var w23 = shutterWindow(M, 0.26, 0.3, M.shutGreen); put(g, w23, 0.68, 1.0, 0.535);
  var p21 = pilaster(M, 0.45); put(g, p21, -0.34, 0.775, 0.53);
  var p22 = pilaster(M, 0.45); put(g, p22, 0.34, 0.775, 0.53);
  g.add(box(2.22, 0.05, 1.3, M.trim, 0, 1.25, -0.1));
  /* 三层（1.275-1.725）：同构 + 顶檐口 */
  g.add(box(2.14, 0.45, 1.24, M.stucco, 0, 1.5, -0.1));
  var w31 = shutterWindow(M, 0.26, 0.3, M.shutTeal); put(g, w31, -0.68, 1.5, 0.535);
  var w32 = shutterWindow(M, 0.26, 0.3, M.shutTeal); put(g, w32, 0, 1.5, 0.535);
  var w33 = shutterWindow(M, 0.26, 0.3, M.shutGreen); put(g, w33, 0.68, 1.5, 0.535);
  var p31 = pilaster(M, 0.45); put(g, p31, -0.34, 1.275, 0.53);
  var p32 = pilaster(M, 0.45); put(g, p32, 0.34, 1.275, 0.53);
  g.add(box(2.22, 0.055, 1.3, M.trim, 0, 1.755, -0.1));
  /* 正面隅石（棋盘交替，v2） */
  [[-1.055, 1.0, 0], [1.055, 1.0, 1], [-1.055, 1.5, 1], [1.055, 1.5, 0],
   [-1.055, 1.22, 1], [1.055, 1.22, 0], [-1.055, 1.72, 0], [1.055, 1.72, 1]].forEach(function (q) {
    g.add(box(0.075, 0.2, 0.035, q[2] ? M.trimD : M.trim, q[0], q[1], 0.53));
  });
  /* 顶压檐白瓶柱栏（栏杆基因起点；车削瓶柱） */
  var para = balustrade(M, 2.18, { sp: 0.16 });
  put(g, para, 0, 1.783, 0.52);
  /* 陶瓦四坡顶（apex≈2.06；托板 ×6）+ 双老虎窗（v2 窗肚墙+楣台） */
  var roof = hipRoof(M, { w: 1.86, d: 1.2, h: 0.28, corbels: 6 });
  put(g, roof, 0, 1.78, -0.12);
  var d1 = dormer(M, 1.0); put(g, d1, -0.42, 1.99, 0.3);
  var d2 = dormer(M, 1.0); put(g, d2, 0.42, 1.99, 0.3);
  /* 右端涡卷山花升位（v2 前凸 z0.56 出墙 0.52，方尖顶饰，apex≈2.23） */
  var gab = dutchGable(M, { w: 0.72, h: 0.3, d: 0.14, finial: 'obelisk' });
  put(g, gab, 0.72, 1.783, 0.56);
  /* 左侧墙便门 + 木披棚（参考图 lv3 侧檐棚） */
  g.add(box(0.035, 0.42, 0.22, M.ink, -1.125, 0.36, 0.2));
  g.add(box(0.045, 0.035, 0.26, M.plankD, -1.12, 0.59, 0.2));
  var swn3 = awningShed(M, {
    post: true, py: 0.52, px: -1.17, pz: 0.4, axis: 'x',
    w: 0.22, d: 0.5, rx: -1.13, ry: 0.66, rz: 0.28, tilt: 0.3,
    fx: -1.25, fy: 0.615, fz: 0.28
  });
  g.add(swn3);
  /* 立式挂招牌（左前柱挑出，摆动） */
  var sign = hangingSign(M, anims, 0.5); put(g, sign, -0.98, 1.3, 0.56);
  /* 廊下吊灯 ×2 + 盆栽 ×3 + 芭蕉 */
  var l1 = pendantLamp(M, anims, 1.8); put(g, l1, -0.5, 0.68, 0.35);
  var l2 = pendantLamp(M, anims, 2.9); put(g, l2, 0.5, 0.68, 0.35);
  put(g, pottedPlant(M, 1.0, false), -0.92, 0.13, 0.44);
  put(g, pottedPlant(M, 1.0, true), 0.3, 0.13, 0.46);
  put(g, pottedPlant(M, 1.0, false), 0.94, 0.13, 0.44);
  put(g, bananaPlant(M, 0.85, anims, 2.2), 1.02, 0.02, -0.68);
  /* 暖窗呼吸 */
  var gw = M.glassWarm;
  anims.push(function (t) { gw.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.15 + 0.8); });
  return g;
}

/* ---- lv4 地标：四层拱廊 + 白栏 galley + 露台宝瓶 + 绿釉中式亭顶冠（h≈2.96） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35, 0));
  /* 台基 + 双步踏 + 走道石板 */
  g.add(box(2.32, 0.12, 1.62, M.stoneD, 0, 0.06, -0.1));
  g.add(box(0.72, 0.06, 0.22, M.stoneD, 0, 0.03, 0.9));
  g.add(box(0.6, 0.05, 0.18, M.stoneD, 0, 0.085, 0.82));
  g.add(box(2.22, 0.03, 1.52, M.path, 0, 0.135, -0.1));
  /* 一层骑楼（0.15-0.75）：三连拱分环 + 暗腔 + 阴面墙 + 柱式柱 ×4 + 门楣护额 */
  var arc = arcadeFront(M, 2.24, 0.6, 0.07, 3, { aw: 0.44, ah: 0.32 });
  put(g, arc, 0, 0.15, 0.66);
  g.add(box(2.14, 0.58, 1.18, M.ink, 0, 0.44, -0.08));
  g.add(box(2.24, 0.6, 0.12, M.stuccoShd, 0, 0.45, -0.7));
  g.add(box(0.1, 0.6, 1.34, M.stuccoShd, -1.09, 0.45, -0.1));
  g.add(box(0.1, 0.6, 1.34, M.stuccoShd, 1.09, 0.45, -0.1));
  var ci, colXs = [-1.02, -0.37, 0.37, 1.02];
  for (ci = 0; ci < 4; ci++) {
    var c = colArc(M, 0.53, 0.034); put(g, c, colXs[ci], 0.15, 0.56);
  }
  /* 门楣通长护额板（fascia 前凸 0.71，承「沙面大街」横匾——v2 修复 v1 匾额被窗遮挡） */
  g.add(box(2.34, 0.14, 1.62, M.trim, 0, 0.79, -0.1));
  /* 二层（0.81-1.31）：拱窗百叶 ×3（贴墙 0.52）+ 白栏 galley（瓶柱升层） */
  g.add(box(2.16, 0.5, 1.28, M.stucco, 0, 1.06, -0.12));
  var w21 = shutterWindow(M, 0.28, 0.32, M.shutTeal); put(g, w21, -0.7, 1.06, 0.535);
  var w22 = shutterWindow(M, 0.28, 0.32, M.shutTeal); put(g, w22, 0, 1.06, 0.535);
  var w23 = shutterWindow(M, 0.28, 0.32, M.shutGreen); put(g, w23, 0.7, 1.06, 0.535);
  var p21 = pilaster(M, 0.5); put(g, p21, -0.35, 0.81, 0.53);
  var p22 = pilaster(M, 0.5); put(g, p22, 0.35, 0.81, 0.53);
  g.add(box(2.26, 0.05, 1.36, M.trim, 0, 1.335, -0.12));
  var gal2 = balustrade(M, 2.08, { sp: 0.17 }); put(g, gal2, 0, 1.36, 0.55);
  /* 三层（1.39-1.89）：混色百叶（蓝/绿/砖红）+ 壁柱 + galley */
  g.add(box(2.16, 0.5, 1.28, M.stucco, 0, 1.64, -0.12));
  var w31 = shutterWindow(M, 0.28, 0.32, M.shutTeal); put(g, w31, -0.7, 1.64, 0.535);
  var w32 = shutterWindow(M, 0.28, 0.32, M.shutGreen); put(g, w32, 0, 1.64, 0.535);
  var w33 = shutterWindow(M, 0.28, 0.32, M.shutRed); put(g, w33, 0.7, 1.64, 0.535);
  var p31 = pilaster(M, 0.5); put(g, p31, -0.35, 1.39, 0.53);
  var p32 = pilaster(M, 0.5); put(g, p32, 0.35, 1.39, 0.53);
  g.add(box(2.26, 0.05, 1.36, M.trim, 0, 1.915, -0.12));
  var gal3 = balustrade(M, 2.08, { sp: 0.17 }); put(g, gal3, 0, 1.94, 0.55);
  /* 四层退台（1.94-2.32）：灰泥墙 + 窄百叶 ×4（混色，贴墙 0.44）+ 顶檐口 */
  g.add(box(2.0, 0.38, 1.2, M.stucco, 0, 2.13, -0.16));
  var w41 = shutterWindow(M, 0.2, 0.24, M.shutRed, { slim: true, noSill: true, slats: 2 }); put(g, w41, -0.7, 2.13, 0.455);
  var w42 = shutterWindow(M, 0.2, 0.24, M.shutTeal, { slim: true, noSill: true, slats: 2 }); put(g, w42, -0.23, 2.13, 0.455);
  var w43 = shutterWindow(M, 0.2, 0.24, M.shutGreen, { slim: true, noSill: true, slats: 2 }); put(g, w43, 0.23, 2.13, 0.455);
  var w44 = shutterWindow(M, 0.2, 0.24, M.shutTeal, { slim: true, noSill: true, slats: 2 }); put(g, w44, 0.7, 2.13, 0.455);
  g.add(box(2.08, 0.05, 1.26, M.trim, 0, 2.345, -0.16));
  /* 露台白瓶柱栏 + 宝瓶饰柱 ×2 */
  var para = balustrade(M, 2.14, { sp: 0.16 }); put(g, para, 0, 2.37, 0.48);
  var u1 = urnFinial(M, 1.0); put(g, u1, -0.98, 2.37, 0.3);
  var u2 = urnFinial(M, 1.0); put(g, u2, 0.98, 2.37, 0.3);
  /* 左翼陶瓦四坡顶（apex≈2.59；托板 ×4）+ 右上绿釉中式翘角亭顶宝顶（东冠，apex≈2.96） */
  var roof = hipRoof(M, { w: 1.3, d: 1.05, h: 0.22, corbels: 4 });
  put(g, roof, -0.45, 2.37, -0.15);
  g.add(box(0.8, 0.04, 0.7, M.stoneD, 0.55, 2.39, -0.2));
  var pi;
  for (pi = 0; pi < 4; pi++) {
    g.add(cyl(0.028, 0.032, 0.18, 12, M.colRed, 0.55 + (pi % 2 ? 0.28 : -0.28), 2.5, -0.2 + (pi < 2 ? 0.22 : -0.22)));
  }
  var pr = pavilionRoof(M, { w: 0.78, d: 0.66, h: 0.15 });
  put(g, pr, 0.55, 2.59, -0.2);
  /* 左角穹顶尖（西冠，柱环版）+「沙面大街」入口横匾（挂于门楣护额板正面） */
  var dm = domeFinial(M, 1.0); put(g, dm, -0.95, 2.37, -0.35);
  g.add(box(0.62, 0.14, 0.03, M.plankD, 0, 0.79, 0.725));
  var plq = mesh(new THREE.PlaneGeometry(0.58, 0.12),
    new THREE.MeshStandardMaterial({ map: getTex('plaqueH', texPlaqueH), roughness: 0.6, metalness: 0.05, flatShading: true }));
  plq.position.set(0, 0.79, 0.7415); g.add(plq);
  /* 立式挂招牌 + 廊下吊灯 ×2 + 盆栽 ×4 + 芭蕉 + 灌丛 */
  var sign = hangingSign(M, anims, 1.1); put(g, sign, 1.02, 1.28, 0.62);
  var l1 = pendantLamp(M, anims, 0.9); put(g, l1, -0.55, 0.72, 0.4);
  var l2 = pendantLamp(M, anims, 2.1); put(g, l2, 0.55, 0.72, 0.4);
  put(g, pottedPlant(M, 1.0, false), -0.98, 0.15, 0.46);
  put(g, pottedPlant(M, 0.85, true), -0.44, 0.15, 0.52);
  put(g, pottedPlant(M, 0.85, true), 0.44, 0.15, 0.52);
  put(g, pottedPlant(M, 1.0, false), 0.98, 0.15, 0.46);
  put(g, bananaPlant(M, 0.95, anims, 2.6), -0.95, 0.02, -0.62);
  var bush = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.leafD);
  put(g, bush, 1.05, 0.1, 0.66); bush.scale.y = 0.85;
  /* 暖窗呼吸 */
  var gw = M.glassWarm;
  anims.push(function (t) { gw.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.05 + 1.2); });
  return g;
}

/* ================= 5. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[14] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_14_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 14;
  g.userData.level = lv;
  g.userData.region = 'g3';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
