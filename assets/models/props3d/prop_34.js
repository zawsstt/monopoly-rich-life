/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_34.js
 * -------------------------------------------------------------------------------------
 * 格 34「尖沙咀」(g7 港岛双雄) 独属建筑：尖沙咀钟楼唐楼四阶生长史
 * 参考图 refs/prop_34.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop34/，
 * strict-quality PASS @ iter 3）。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   暖棕木瓦棚屋 + 圆木压脊 + 鱼骨天线 ×2 + 门侧壁灯（h≈0.95，天线≈1.17）
 *   lv2 洋房   两开间唐楼：红扇贝披棚铺面 + 木栏檐廊 + 灰瓦坡顶/草天台 + 红金竖灯箱（h≈1.62）
 *   lv3 大厦   六层奶油唐楼 walk-up：米色腰线 + 灰蓝窗棚 + 黄绿雨棚包角 + 屋顶梯屋铁棚群（h≈2.26）
 *   lv4 地标   尖沙咀钟楼塔式建筑群：石台基红柱廊 + 双重青绿琉璃翘檐退台 +
 *              朱漆钟鼓层（罗马字钟面 + 走针）+ 攒尖宝顶串环（h≈2.79）
 *
 * 独有语汇（自参考图提炼，与 prop_33 铜锣湾拉开差异）：
 *   - 红金竖排灯箱（红底 + 金圈字形 + 金边框 + 底部灯点），非铜锣湾的彩虹竖招阵列
 *   - 钟面（lv4 顶冠）+ 缓动走针 —— 尖沙咀钟楼独有锚件
 *   - 浅青绿(sage)釉瓦攒尖翘檐 + 米金脊带（铜锣湾为深绿釉瓦 + 金色人物脊饰）
 *   - 奶油抹灰墙（阳面 #E4CC9C / 阴面 #B0A488）+ 灰蓝/黄绿帆布棚（铜锣湾 lv3 为灰混凝土 + 水箱）
 *   - 黑柱暖头街灯（天星码头灯柱语汇，lv2 起）、红消防栓（lv3）、石狮（lv4 门狮）
 *   - 鱼骨 TV 天线（lv1-lv3 屋顶生长线）、暖光窗/红灯笼（全族贯穿）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[34] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_34] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 1. 色板 / 材质基元（material 阶段：参考图逐区取样） ================= */
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
  if (o.emissiveMap) { m.emissiveMap = o.emissiveMap; if (!o.emissive) m.emissive = C('#ffffff'); }
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

/* ================= 2. 程序化 Canvas 纹理（≤256px，零外部资源） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 暖棕木瓦（lv1 屋面）：横板错缝 + 木纹噪点 */
function texShingle() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#b48454'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#c09060' : '#a87848';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#8a6440'; g.fillRect(0, y + rh - 2, S, 2);
    g.fillStyle = 'rgba(255,230,190,0.18)'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      g.fillStyle = 'rgba(70,45,25,0.4)';
      g.fillRect((off + k * (S / 3)) % S, y, 2, rh - 2);
    }
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,240,210,0.05)' : 'rgba(60,38,20,0.08)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 1);
  }
  return toTex(cv, true);
}
/* 竖板风化木墙（lv1） */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#c09c78'; g.fillRect(0, 0, S, S);
  var n = 8, pw = S / n;
  for (i = 0; i < n; i++) {
    var x = i * pw;
    g.fillStyle = (i % 3 === 0) ? '#cca884' : (i % 3 === 1) ? '#b8906a' : '#c49a74';
    g.fillRect(x, 0, pw, S);
    g.fillStyle = 'rgba(90,60,35,0.5)'; g.fillRect(x, 0, 1, S);
    g.fillStyle = 'rgba(255,235,205,0.12)'; g.fillRect(x + 1, 0, 1, S);
  }
  for (i = 0; i < 110; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,240,210,0.06)' : 'rgba(80,55,30,0.07)';
    g.fillRect((i * 37) % S, (i * 53) % S, 1, 3);
  }
  return toTex(cv, true);
}
/* 灰青瓦垄（lv2 坡顶） */
function texSlate() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#6c6c60'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#78786c' : '#66665a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#4e4e44'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#8a8a7e'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      g.fillStyle = 'rgba(50,52,44,0.5)';
      g.fillRect((off + k * (S / 4)) % S, y, 2, rh - 3);
    }
  }
  return toTex(cv, true);
}
/* 浅青绿釉瓦（lv4 攒尖顶）：瓦垄 + 釉面高光 */
function texGlaze() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#9cb484'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#a8c090' : '#8ca876';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#5e784c'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = 'rgba(240,255,220,0.28)'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      g.fillStyle = 'rgba(70,95,55,0.45)';
      g.fillRect((off + k * (S / 4)) % S, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = 'rgba(255,255,240,0.07)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 奶油抹灰（lv3 唐楼）：细噪 + 雨渍竖痕 */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#e4cc9c'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 8; i++) {
    g.fillStyle = 'rgba(150,130,95,0.06)';
    var x = (i * 37) % S;
    g.fillRect(x, (i * 23) % 40, 3, 60 + (i * 13) % 50);
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,248,225,0.07)' : 'rgba(140,115,80,0.06)';
    g.fillRect((i * 29) % S, (i * 47) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 红条纹披棚布（lv2） */
function texStripe() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#c04838'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 4; i++) {
    g.fillStyle = (i % 2) ? '#c85644' : '#b03e30';
    g.fillRect(i * (S / 4), 0, S / 4, S);
    g.fillStyle = 'rgba(255,180,150,0.15)';
    g.fillRect(i * (S / 4), 0, 2, S);
  }
  g.fillStyle = 'rgba(80,20,10,0.18)'; g.fillRect(0, S - 6, S, 6);
  return toTex(cv, true);
}
/* 扇贝垂边条（披棚 valance）：上布 + 下缘扇贝弧 */
function texScallop() {
  var w = 128, h = 48, cv = mkCanvas(w, h), g = cv.getContext('2d'), i;
  g.fillStyle = '#b03e30'; g.fillRect(0, 0, w, h);
  for (i = 0; i < 4; i++) {
    g.fillStyle = (i % 2) ? '#c85644' : '#a83828';
    g.fillRect(i * (w / 4), 0, w / 4, h - 12);
  }
  g.fillStyle = '#b03e30';
  for (i = 0; i < 4; i++) {
    g.beginPath();
    g.arc((i + 0.5) * (w / 4), h - 12, w / 8, 0, PI, false);
    g.fill();
  }
  g.strokeStyle = 'rgba(255,200,170,0.35)'; g.lineWidth = 2;
  for (i = 0; i < 4; i++) {
    g.beginPath();
    g.arc((i + 0.5) * (w / 4), h - 12, w / 8 - 1, PI + 0.25, -0.25);
    g.stroke();
  }
  return toTex(cv, true);
}
/* 楞纹帆布棚通用（灰蓝/黄绿/橙红）：竖肋 */
function texRib(base, hi, lo) {
  return function () {
    var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (i = 0; i < 8; i++) {
      g.fillStyle = (i % 2) ? hi : lo;
      g.fillRect(i * (S / 8), 0, S / 8, S);
      g.fillStyle = 'rgba(255,255,255,0.10)';
      g.fillRect(i * (S / 8), 0, 2, S);
      g.fillStyle = 'rgba(40,30,10,0.12)';
      g.fillRect(i * (S / 8) + S / 8 - 2, 0, 2, S);
    }
    return toTex(cv, true);
  };
}
/* 红金字形灯箱（map = 红底金框；emissiveMap = 字形亮片） */
function texSignPair() {
  var w = 96, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  var cvE = mkCanvas(w, h), ge = cvE.getContext('2d');
  g.fillStyle = '#a83028'; g.fillRect(0, 0, w, h);
  ge.fillStyle = '#201008'; ge.fillRect(0, 0, w, h);
  g.fillStyle = '#d86048'; g.fillRect(9, 9, w - 18, h - 18);
  g.strokeStyle = '#f0c060'; g.lineWidth = 6; g.strokeRect(7, 7, w - 14, h - 14);
  g.strokeStyle = 'rgba(240,192,96,0.55)'; g.lineWidth = 2; g.strokeRect(16, 16, w - 32, h - 32);
  var i, cy;
  for (i = 0; i < 4; i++) {
    cy = 58 + i * 48;
    g.strokeStyle = '#fce46c'; g.lineWidth = 5;
    g.beginPath(); g.arc(w / 2, cy, 16, 0, PI * 2); g.stroke();
    g.strokeStyle = 'rgba(252,228,108,0.6)'; g.lineWidth = 2;
    g.beginPath(); g.arc(w / 2, cy, 10, 0, PI * 2); g.stroke();
    g.fillStyle = '#fce46c';
    g.beginPath(); g.arc(w / 2, cy, 4.5, 0, PI * 2); g.fill();
    ge.strokeStyle = '#ffcc66'; ge.lineWidth = 5;
    ge.beginPath(); ge.arc(w / 2, cy, 16, 0, PI * 2); ge.stroke();
    ge.fillStyle = '#ffe49a';
    ge.beginPath(); ge.arc(w / 2, cy, 7, 0, PI * 2); ge.fill();
  }
  for (i = -1; i <= 1; i++) {
    g.fillStyle = '#ffe9a0';
    g.beginPath(); g.arc(w / 2 + i * 14, 238, 3.2, 0, PI * 2); g.fill();
    ge.fillStyle = '#fff2c0';
    ge.beginPath(); ge.arc(w / 2 + i * 14, 238, 3.8, 0, PI * 2); ge.fill();
  }
  return { map: toTex(cv, true), emissive: toTex(cvE, true) };
}
/* 钟面（lv4）：贴在圆柱端盖极向 UV 上（rotation.x=PI/2 后 v 沿 -Y，
 * 故 XII 画在画布底部、VI 画在顶部，呈现时为正立钟面） */
function texClock() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  var R = S / 2;
  g.fillStyle = '#f0e4c0'; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#4a3826'; g.lineWidth = 7;
  g.beginPath(); g.arc(R, R, R - 10, 0, PI * 2); g.stroke();
  g.fillStyle = '#3a2c1e'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 32px "Times New Roman","Georgia",serif';
  g.fillText('XII', R, R + 78);      /* 画布底 → 呈现于钟面顶部（端盖 UV v=0 采画布底） */
  g.fillText('III', R + 78, R);      /* 画布右 → 呈现于钟面右 */
  g.fillText('VI', R, R - 78);
  g.fillText('IX', R - 78, R);
  var i, a;
  for (i = 0; i < 12; i++) {
    a = i * PI / 6;
    g.strokeStyle = '#5a4832'; g.lineWidth = (i % 3 === 0) ? 3 : 5;
    g.beginPath();
    g.moveTo(R + cos(a) * 54, R + sin(a) * 54);
    g.lineTo(R + cos(a) * 63, R + sin(a) * 63);
    g.stroke();
  }
  return toTex(cv, true);
}
/* 石板地坪（tan 错缝石板） */
function texPaving() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#b49c78'; g.fillRect(0, 0, S, S);
  var rows = 5, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#ac9470' : '#bca482';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#8a7454'; g.fillRect(0, y + rh - 2, S, 2);
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      g.fillStyle = 'rgba(110,90,60,0.55)';
      g.fillRect((off + k * (S / 3)) % S, y, 2, rh - 2);
    }
  }
  for (i = 0; i < 80; i++) {
    g.fillStyle = 'rgba(255,245,220,0.06)';
    g.fillRect((i * 47) % S, (i * 31) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 锈色瓦楞（lv3 屋顶铁棚） */
function texRust() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#8a5a3c'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 8; i++) {
    g.fillStyle = (i % 2) ? '#96684a' : '#7c5034';
    g.fillRect(i * (S / 8), 0, S / 8, S);
    g.fillStyle = 'rgba(50,28,12,0.4)';
    g.fillRect(i * (S / 8) + S / 8 - 2, 0, 2, S);
  }
  return toTex(cv, true);
}
/* 暖棕木纹（tan wood：lv2/lv4 铺面木构） */
function texWoodTan() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#b4906c'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 6; i++) {
    g.fillStyle = (i % 2) ? '#ac8660' : '#bc9874';
    g.fillRect(i * (S / 6), 0, S / 6, S);
    g.fillStyle = 'rgba(90,60,35,0.4)';
    g.fillRect(i * (S / 6), 0, 2, S);
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,235,205,0.06)' : 'rgba(80,55,30,0.06)';
    g.fillRect((i * 43) % S, (i * 29) % S, 3, 1);
  }
  return toTex(cv, true);
}

var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板；圆段数：球 12×10、圆柱/圆锥 ≥10，锥面金字塔 4 段为刻意方锥） */
function Mats() {
  return {
    shingle:  MAT('p34shingle', function () { var t = getTex('shingle', texShingle); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.8 }); }),
    shingleS: MAT('p34shingleS', function () { var t = getTex('shingle', texShingle); return std('#b0a090', { map: t, bump: t, bumpScale: 0.014, rough: 0.84 }); }),
    plank:    MAT('p34plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.86 }); }),
    slate:    MAT('p34slate', function () { var t = getTex('slate', texSlate); return std('#ffffff', { map: t, bump: t, bumpScale: 0.013, rough: 0.7 }); }),
    slateS:   MAT('p34slateS', function () { var t = getTex('slate', texSlate); return std('#aaa89c', { map: t, bump: t, bumpScale: 0.013, rough: 0.74 }); }),
    glaze:    MAT('p34glaze', function () { var t = getTex('glaze', texGlaze); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.45 }); }),
    glazeS:   MAT('p34glazeS', function () { var t = getTex('glaze', texGlaze); return std('#96a088', { map: t, bump: t, bumpScale: 0.012, rough: 0.5 }); }),
    plaster:  MAT('p34plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.9 }); }),
    plasterS: MAT('p34plasterS', function () { var t = getTex('plaster', texPlaster); return std('#a89878', { map: t, rough: 0.92 }); }),
    trim:     MAT('p34trim', function () { return std('#f0d8b4', { rough: 0.42, metal: 0.25 }); }),
    vermi:    MAT('p34vermi', function () { return std('#e8443c', { rough: 0.5 }); }),
    vermiD:   MAT('p34vermiD', function () { return std('#c03028', { rough: 0.58 }); }),
    wood:     MAT('p34wood', function () { var t = getTex('woodtan', texWoodTan); return std('#ffffff', { map: t, rough: 0.8 }); }),
    woodD:    MAT('p34woodD', function () { return std('#6e5438', { rough: 0.84 }); }),
    stripe:   MAT('p34stripe', function () { return std('#ffffff', { map: getTex('stripe', texStripe), rough: 0.75 }); }),
    scallop:  MAT('p34scallop', function () { return std('#ffffff', { map: getTex('scallop', texScallop), rough: 0.75 }); }),
    lime:     MAT('p34lime', function () { return std('#ffffff', { map: getTex('lime', texRib('#90a824', '#a4bc34', '#7c9218')), rough: 0.72 }); }),
    canSlate: MAT('p34canSlate', function () { return std('#ffffff', { map: getTex('canslate', texRib('#5a7080', '#6c8494', '#48606e')), rough: 0.75 }); }),
    orange:   MAT('p34orange', function () { return std('#ffffff', { map: getTex('orange', texRib('#d86830', '#e87a40', '#c05824')), rough: 0.74 }); }),
    rust:     MAT('p34rust', function () { return std('#ffffff', { map: getTex('rust', texRust), rough: 0.85 }); }),
    stone:    MAT('p34stone', function () { return std('#aba79a', { rough: 0.9 }); }),
    stoneD:   MAT('p34stoneD', function () { return std('#8b877b', { rough: 0.92 }); }),
    paving:   MAT('p34paving', function () { var t = getTex('paving', texPaving); return std('#ffffff', { map: t, bump: t, bumpScale: 0.008, rough: 0.92 }); }),
    grass:    MAT('p34grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:   MAT('p34grassD', function () { return std('#6a9048', { rough: 0.95 }); }),
    gold:     MAT('p34gold', function () { return std('#d8a63c', { rough: 0.35, metal: 0.75 }); }),
    dark:     MAT('p34dark', function () { return std('#2e2a26', { rough: 0.7, metal: 0.4 }); }),
    ink:      MAT('p34ink', function () { return std('#3a3a40', { rough: 0.85 }); }),
    /* 发光族（呼吸动画挂钩；全局共享 → 同级同步呼吸） */
    glow:     MAT('p34glow', function () { return std('#efe0c0', { rough: 0.9, emissive: '#ffd98a', ei: 0.2 }); }),
    lamp:     MAT('p34lamp', function () { return std('#efe0c0', { rough: 0.6, emissive: '#ffd98a', ei: 0.5 }); })
  };
}
function lanternMat(phase) {
  return MAT('p34lant' + phase, function () { return std('#d8402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
}
/* 红金灯箱（每相位独立材质错相呼吸；map+emissiveMap 同源） */
function signMats(phase) {
  return MAT('p34sign' + phase, function () {
    var pair = getTex('signpair', texSignPair);
    return {
      board: std('#a83028', { rough: 0.55 }),
      face: new THREE.MeshStandardMaterial({
        map: pair.map, emissiveMap: pair.emissive,
        emissive: C('#ff8a50'), emissiveIntensity: 0.5, roughness: 0.55, flatShading: true
      })
    };
  });
}
function signGlow(phase, anims) {
  var mats = signMats(phase);
  anims.push(function (t) { mats.face.emissiveIntensity = 0.5 + 0.22 * sin(t * 2.0 + phase); });
  return mats;
}

/* ================= 3. 风格预制件（structure/form 阶段复用语汇） ================= */

/* 石板地坪 + 草缘（grassy=lv1 草地大 + 径；否则满铺石板） */
function padUnit(M, size, depth, grassy) {
  var g = grp();
  var d = depth || size;
  g.add(box(size + 0.07, 0.032, d + 0.07, M.grassD, 0, 0.016, 0));
  g.add(box(size, 0.03, d, M.grass, 0, 0.038, 0));
  if (grassy) {
    g.add(box(size * 0.52, 0.018, 0.5, M.paving, 0, 0.058, d / 2 - 0.3));
    g.add(box(0.42, 0.014, 0.62, M.paving, 0.08, 0.06, d / 2 - 0.52));
  } else {
    g.add(box(size * 0.94, 0.018, d * 0.9, M.paving, 0, 0.058, 0));
  }
  return g;
}

/* 暖光木格窗（框 + 暖光玻璃 + 木棂） */
function warmWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  var fr = o.frame || M.woodD;
  g.add(box(w + 0.05, h + 0.05, 0.032, fr));
  g.add(box(w, h, 0.03, o.glowMat || M.glow, 0, 0, 0.004));
  g.add(box(0.026, h, 0.036, M.wood, 0, 0, 0.008));
  var rows = o.rows || 1, i;
  for (i = 0; i < rows; i++) {
    g.add(box(w, 0.024, 0.036, M.wood, 0, -h / 2 + (i + 1) * h / (rows + 1), 0.008));
  }
  return g;
}

/* 布棚：斜坡面 + 扇贝垂边（楞线在纹理内，省 mesh） */
function awning(M, w, depth, mat, valMat, x, y, z, ry) {
  var g = grp();
  var slope = box(w, 0.022, depth, mat, 0, 0, depth / 2 - 0.02);
  slope.rotation.x = 0.32;
  g.add(slope);
  var val = mesh(new THREE.PlaneGeometry(w, 0.1), valMat);
  val.position.set(0, -depth * 0.17 + 0.012, depth * 0.955 - 0.03);
  val.rotation.x = 0.12;
  g.add(val);
  g.position.set(x || 0, y || 0, z || 0);
  if (ry) g.rotation.y = ry;
  return g;
}

/* 红金竖排灯箱（托臂 + 板 + 发光面 + 上下盖） */
function signBox(M, anims, phase, h, x, y, z, ry) {
  var g = grp(), mats = signGlow(phase, anims);
  g.add(box(0.05, 0.07, 0.24, M.dark, 0, 0, -0.11));
  g.add(box(0.22, h, 0.06, mats.board, 0, 0, 0));
  var face = mesh(new THREE.PlaneGeometry(0.16, h - 0.05), mats.face);
  face.position.set(0, 0, 0.033); g.add(face);
  g.add(box(0.25, 0.034, 0.08, M.vermiD, 0, h / 2 + 0.017, 0));
  g.add(box(0.25, 0.034, 0.08, M.vermiD, 0, -h / 2 - 0.017, 0));
  g.position.set(x, y, z);
  if (ry) g.rotation.y = ry;
  return g;
}

/* 红灯笼：金盖金底 + 红壳 + 穗（小号省穗） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = lanternMat(phase || 0);
  g.add(cyl(0.034 * s, 0.046 * s, 0.032 * s, 10, M.gold, 0, 0.108 * s, 0));
  var body = sph(0.08 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.046 * s, 0.034 * s, 0.032 * s, 10, M.gold, 0, -0.1 * s, 0));
  if (s >= 0.56) g.add(cyl(0.008 * s, 0.008 * s, 0.07 * s, 6, M.vermiD, 0, -0.156 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.2 + (phase || 0)); });
  return g;
}

/* 鱼骨 TV 天线：立杆 + 3 层横担 + 顶针 */
function antenna(M, h, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.012 * s, 0.016 * s, h, 8, M.dark, 0, h / 2, 0));
  var i, y0 = h * 0.4;
  for (i = 0; i < 3; i++) {
    g.add(box((0.3 - i * 0.07) * s, 0.018 * s, 0.014 * s, M.dark, 0, y0 + i * h * 0.2, 0));
    g.add(box(0.016 * s, 0.05 * s, 0.014 * s, M.dark, 0, y0 + i * h * 0.2 + 0.03 * s, 0));
  }
  g.add(cyl(0.004 * s, 0.004 * s, 0.09 * s, 5, M.dark, 0, h + 0.045 * s, 0));
  return g;
}

/* 黑柱暖头街灯（天星码头灯柱） */
function streetLamp(M, anims, phase, h) {
  var g = grp(); h = h || 1.0;
  g.add(cyl(0.05, 0.065, 0.05, 10, M.stoneD, 0, 0.025, 0));
  g.add(cyl(0.022, 0.03, h - 0.16, 10, M.dark, 0, (h - 0.16) / 2 + 0.05, 0));
  g.add(box(0.085, 0.12, 0.085, M.lamp, 0, h - 0.08, 0));
  g.add(box(0.105, 0.02, 0.105, M.dark, 0, h - 0.005, 0));
  var pike = mesh(new THREE.ConeGeometry(0.035, 0.06, 10), M.dark); put(g, pike, 0, h + 0.045, 0);
  var lm = M.lamp;
  anims.push(function (t) { lm.emissiveIntensity = 0.5 + 0.15 * sin(t * 1.7 + (phase || 0)); });
  return g;
}

/* 空调外机：壳 + 格栅面 */
function acUnit(M, x, y, z, ry) {
  var g = grp();
  g.add(box(0.2, 0.14, 0.13, M.stone, 0, 0, 0));
  g.add(box(0.16, 0.1, 0.012, M.ink, 0, 0, 0.066));
  g.position.set(x, y, z);
  if (ry) g.rotation.y = ry;
  return g;
}

/* 木箱 / 红面凳 */
function crate(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.16 * s, 0.13 * s, 0.14 * s, M.wood, 0, 0.065 * s, 0));
  g.add(box(0.165 * s, 0.02 * s, 0.145 * s, M.woodD, 0, 0.06 * s, 0));
  g.add(box(0.165 * s, 0.02 * s, 0.145 * s, M.woodD, 0, 0.11 * s, 0));
  return g;
}
function stool(M) {
  var g = grp();
  g.add(box(0.11, 0.03, 0.1, M.vermi, 0, 0.115, 0));
  g.add(cyl(0.014, 0.018, 0.1, 8, M.woodD, 0, 0.05, 0));
  g.add(cyl(0.045, 0.05, 0.014, 10, M.woodD, 0, 0.008, 0));
  return g;
}

/* 灌丛 */
function bush(M, r, x, y, z) {
  var b = sph(r, M.grassD, x, y, z);
  b.scale.y = 0.82;
  return b;
}

/* 暖棕木瓦双坡顶（lv1）：板垄坡面 + 圆木压脊 + 封檐山墙 */
function shingleRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), k;
  var eave = d / 2 + (o.over !== undefined ? o.over : 0.08);
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + 0.16, 0.03, len, k > 0 ? M.shingle : M.shingleS, 0, 0, k * len / 2));
    sg.add(box(w + 0.18, 0.05, 0.024, M.woodD, 0, -0.004, k * eave));
  }
  var r1 = cyl(0.032, 0.032, w + 0.18, 10, M.woodD, 0, h + 0.022, 0); r1.rotation.z = PI / 2; g.add(r1);
  var r2 = cyl(0.024, 0.024, w + 0.02, 10, M.woodD, 0, h + 0.066, 0); r2.rotation.z = PI / 2; g.add(r2);
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  for (k = -1; k <= 1; k += 2) {
    var t = mesh(gg, M.plank); t.rotation.y = k * PI / 2;
    t.position.set(k * (w / 2 + 0.004), -0.02, k * 0.02); g.add(t);
  }
  return g;
}

/* 灰青瓦双坡顶（lv2）：瓦垄坡面 + 正脊 + 翘端 */
function slateRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), k;
  var eave = d / 2 + (o.over !== undefined ? o.over : 0.08);
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + 0.16, 0.03, len, k > 0 ? M.slate : M.slateS, 0, 0, k * len / 2));
    sg.add(box(w + 0.18, 0.045, 0.024, M.woodD, 0, -0.004, k * eave));
  }
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  for (k = -1; k <= 1; k += 2) {
    var t = mesh(gg, M.plaster); t.rotation.y = k * PI / 2;
    t.position.set(k * (w / 2 + 0.004), -0.02, k * 0.02); g.add(t);
  }
  g.add(box(w + 0.2, 0.055, 0.09, M.ink, 0, h + 0.025, 0));
  var f1 = box(0.06, 0.09, 0.08, M.ink, (w + 0.2) / 2 - 0.01, h + 0.09, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.06, 0.09, 0.08, M.ink, -(w + 0.2) / 2 + 0.01, h + 0.09, 0); f2.rotation.z = -0.4; g.add(f2);
  return g;
}

/* 青绿釉瓦翘檐（lv4 层檐，四坡歇山式）：坡面组各自升到脊高、绕脊倾斜；
 * 坡面盒中心在 (0,0,±len/2) → 檐口端落到 y=0（平座面）、脊端在 y=h */
function pagodaRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.09, eaveS = w / 2 + 0.09;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.7 + 0.16, 0.03, lenF, M.glaze, 0, 0, lenF / 2));
  sgF.add(box(w * 0.7 + 0.18, 0.05, 0.026, M.trim, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.7 + 0.16, 0.03, lenF, M.glazeS, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.03, d * 0.7 + 0.1, M.glazeS, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.03, d * 0.7 + 0.1, M.glazeS, -lenS / 2, 0, 0));
  /* 四角起翘 + 金钩 */
  var i, corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  for (i = 0; i < 4; i++) {
    var c = corners[i];
    var lift = box(0.07, 0.045, 0.07, M.trim, c[0] * (eaveS - 0.03), 0.055, c[1] * (eaveF - 0.03));
    lift.rotation.z = -c[0] * 0.62; g.add(lift);
    var hook = box(0.022, 0.05, 0.022, M.gold, c[0] * (eaveS - 0.02), 0.1, c[1] * (eaveF - 0.02));
    hook.rotation.z = -c[0] * 0.5; g.add(hook);
  }
  /* 米金脊带（脊顶收口） */
  g.add(box(w * 0.36, 0.05, d * 0.36 + 0.06, M.trim, 0, h - 0.005, 0));
  return g;
}

/* 攒尖宝顶（lv4 crown）：方锥釉瓦（Cone 4 段=刻意方锥）+ 基环 + 角钩 + 串环尖针 */
function pagodaCrown(M, o) {
  var w = o.w, h = o.h;
  var g = grp();
  var r = (w / 2 + 0.09) * 1.414;
  var pyr = mesh(new THREE.ConeGeometry(r, h, 4), M.glaze);
  pyr.rotation.y = PI / 4;
  pyr.position.y = h / 2;
  g.add(pyr);
  g.add(box(w + 0.12, 0.05, w + 0.12, M.trim, 0, 0.02, 0));
  var i, corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  var e = w / 2 + 0.06;
  for (i = 0; i < 4; i++) {
    var hk = box(0.02, 0.05, 0.02, M.gold, corners[i][0] * e, 0.09, corners[i][1] * e);
    hk.rotation.z = -corners[i][0] * 0.5; g.add(hk);
  }
  g.add(cyl(0.012, 0.02, 0.22, 8, M.dark, 0, h + 0.1, 0));
  g.add(cyl(0.05, 0.05, 0.014, 10, M.gold, 0, h + 0.09, 0));
  g.add(cyl(0.038, 0.038, 0.012, 10, M.gold, 0, h + 0.16, 0));
  g.add(sph(0.026, M.gold, 0, h + 0.235, 0));
  return g;
}

/* 木栏檐廊（lv2）：地栿 + 竖棂 + 扶手 */
function woodRail(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.05, M.woodD, 0, 0, 0));
  var n = Math.max(5, Math.round(w / 0.13)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.14, 0.015, M.wood, -w / 2 + i * (w / n), 0.088, 0.012));
  }
  g.add(box(w + 0.03, 0.026, 0.028, M.woodD, 0, 0.168, 0.012));
  return g;
}

/* 朱漆石栏平座（lv4）：座 + 望柱 + 寻杖 */
function stoneBalustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.05, 0.045, M.stone, 0, 0.025, 0));
  var n = Math.max(4, Math.round(w / 0.26)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.024, 0.13, 0.03, M.vermi, -w / 2 + i * (w / n), 0.105, 0));
  }
  g.add(box(w, 0.024, 0.034, M.stone, 0, 0.178, 0));
  return g;
}

/* 朱漆圆柱（金箍 + 石础）；simple=单柱身省 mesh */
function vermiColumn(M, h, r, simple) {
  var g = grp();
  if (simple) {
    g.add(cyl(r, r, h, 10, M.vermi, 0, h / 2, 0));
    return g;
  }
  g.add(cyl(r * 1.4, r * 1.6, 0.04, 10, M.stoneD, 0, 0.02, 0));
  g.add(cyl(r, r, h, 10, M.vermi, 0, 0.04 + h / 2, 0));
  g.add(cyl(r * 1.2, r * 1.2, 0.026, 10, M.gold, 0, 0.04 + h * 0.85, 0));
  return g;
}

/* 石狮（lv4 门狮） */
function stoneLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.12 * s, 0.03 * s, 0.12 * s, M.stoneD, 0, 0.015 * s, 0));
  var body = sph(0.052 * s, M.stone, 0, 0.08 * s, 0); body.scale.set(1, 0.92, 1.3); g.add(body);
  g.add(sph(0.04 * s, M.stone, 0, 0.14 * s, 0.05 * s));
  var e1 = mesh(new THREE.ConeGeometry(0.015 * s, 0.032 * s, 8), M.stone); put(g, e1, 0.024 * s, 0.18 * s, 0.05 * s, 0, 0, -0.3);
  var e2 = mesh(new THREE.ConeGeometry(0.015 * s, 0.032 * s, 8), M.stone); put(g, e2, -0.024 * s, 0.18 * s, 0.05 * s, 0, 0, 0.3);
  return g;
}

/* ================= 4. 四阶生长（interaction 阶段挂钩 userData.anim） ================= */

/* ---- lv1 小屋：暖棕木瓦棚屋（apex≈0.95，天线至≈1.17） ---- */
function level1(M, anims) {
  var g = grp();
  /* 地坪（草地 + 石板径）+ 灌丛 */
  g.add(padUnit(M, 2.3, 2.3, true));
  g.add(bush(M, 0.11, 0.95, 0.14, 0.72));
  g.add(bush(M, 0.07, -1.0, 0.11, -0.75));
  /* 台基 + 竖板墙 + 角柱 */
  g.add(box(1.36, 0.07, 1.02, M.stoneD, 0, 0.035, -0.02));
  g.add(box(1.22, 0.52, 0.88, M.plank, 0, 0.33, -0.02));
  [[-0.63, -0.48], [0.63, -0.48], [-0.63, 0.44], [0.63, 0.44]].forEach(function (c) {
    g.add(box(0.055, 0.52, 0.055, M.woodD, c[0], 0.33, c[1]));
  });
  /* 板条门 + 门侧壁灯（暖光呼吸） */
  g.add(box(0.3, 0.44, 0.04, M.ink, -0.26, 0.29, 0.43));
  g.add(box(0.26, 0.4, 0.045, M.wood, -0.26, 0.27, 0.435));
  g.add(box(0.26, 0.03, 0.05, M.woodD, -0.26, 0.38, 0.44));
  g.add(box(0.07, 0.1, 0.05, M.dark, 0.02, 0.5, 0.43));
  g.add(sph(0.045, M.lamp, 0.02, 0.42, 0.47));
  anims.push(function (t) { M.lamp.emissiveIntensity = 0.5 + 0.14 * sin(t * 1.9); });
  g.add(box(0.34, 0.045, 0.2, M.stoneD, -0.26, 0.09, 0.5));
  /* 披檐小窗（右前 + 右山墙） */
  var win = warmWindow(M, 0.24, 0.24); put(g, win, 0.3, 0.38, 0.43);
  var aw1 = box(0.36, 0.02, 0.18, M.shingle, 0.3, 0.53, 0.5); aw1.rotation.x = 0.35; g.add(aw1);
  var win2 = warmWindow(M, 0.2, 0.2); win2.rotation.y = PI / 2; put(g, win2, 0.63, 0.4, -0.2);
  var aw2 = box(0.02, 0.02, 0.3, M.shingle, 0.65, 0.55, -0.2); aw2.rotation.z = -0.35; g.add(aw2);
  /* 暖棕木瓦双坡顶 */
  var roof = shingleRoof(M, { w: 1.28, d: 0.92, h: 0.3 });
  put(g, roof, 0, 0.62, -0.02);
  /* 鱼骨天线 ×2（脊上） */
  put(g, antenna(M, 0.16, 0.9), -0.3, 0.97, -0.1);
  put(g, antenna(M, 0.14, 0.9), 0.34, 0.97, -0.02, 0.5);
  /* 街具：木箱 ×2 + 石缸 */
  put(g, crate(M, 1.0), 0.86, 0.06, 0.62);
  put(g, crate(M, 0.8), -0.92, 0.06, 0.5);
  g.add(cyl(0.07, 0.09, 0.14, 10, M.stoneD, -0.88, 0.13, -0.5));
  /* 暖光窗呼吸 */
  var wm = M.glow;
  anims.push(function (t) { wm.emissiveIntensity = 0.2 + 0.08 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：红扇贝披棚铺面 + 木栏檐廊 + 灰瓦坡顶/草天台（h≈1.62） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.2, false));
  /* 主构（tan 木构）：GFA 0.05-0.67，2F 0.72-1.2 */
  g.add(box(1.66, 0.06, 1.0, M.stoneD, -0.12, 0.03, -0.05));
  g.add(box(1.56, 0.58, 0.94, M.wood, -0.12, 0.35, -0.05));
  g.add(box(1.64, 0.05, 1.0, M.woodD, -0.12, 0.665, -0.05));
  g.add(box(1.48, 0.46, 0.88, M.plank, -0.12, 0.935, -0.05));
  /* GFA 门脸：暖光橱窗 ×2 + 木门 */
  put(g, warmWindow(M, 0.34, 0.3), -0.62, 0.32, 0.44);
  put(g, warmWindow(M, 0.34, 0.3), -0.18, 0.32, 0.44);
  g.add(box(0.3, 0.44, 0.04, M.ink, 0.32, 0.27, 0.44));
  g.add(box(0.26, 0.4, 0.045, M.woodD, 0.32, 0.25, 0.445));
  /* 红条纹扇贝披棚（包前角） */
  g.add(awning(M, 1.54, 0.42, M.stripe, M.scallop, -0.12, 0.72, 0.42));
  g.add(awning(M, 0.9, 0.34, M.stripe, M.scallop, 0.68, 0.72, -0.12, PI / 2));
  /* 街具：红面凳 ×2 + 木箱 + 檐下灯笼 */
  put(g, stool(M), -0.6, 0.05, 0.72);
  put(g, stool(M), -0.32, 0.05, 0.78);
  put(g, crate(M, 0.9), 0.86, 0.05, 0.6);
  put(g, lantern(M, 0.62, anims, 0.8), -0.88, 0.64, 0.56);
  /* 2F：木栏檐廊 + 暖光窗 + 木滑门 + 垂灯笼 */
  put(g, woodRail(M, 1.3), -0.24, 0.695, 0.44);
  put(g, warmWindow(M, 0.28, 0.26), -0.52, 0.94, 0.415);
  put(g, warmWindow(M, 0.28, 0.26), -0.1, 0.94, 0.415);
  g.add(box(0.24, 0.32, 0.04, M.woodD, 0.28, 0.92, 0.415));
  put(g, lantern(M, 0.55, anims, 2.1), 0.02, 1.13, 0.46);
  put(g, lantern(M, 0.55, anims, 3.4), -0.7, 1.13, 0.46);
  /* 墙挂空调外机 ×2 */
  g.add(acUnit(M, 0.5, 0.52, 0.42));
  g.add(acUnit(M, 0.56, 1.0, -0.36, PI / 2));
  /* 灰瓦坡顶（前 2/3）+ 后草天台（栏 + 天线） */
  put(g, slateRoof(M, { w: 1.44, d: 0.62, h: 0.24 }), -0.12, 1.2, 0.08);
  g.add(box(1.5, 0.04, 0.3, M.woodD, -0.12, 1.215, -0.35));
  g.add(box(1.46, 0.03, 0.05, M.woodD, -0.12, 1.26, -0.48));
  g.add(box(0.05, 0.03, 0.3, M.woodD, -0.85, 1.26, -0.35));
  g.add(box(0.05, 0.03, 0.3, M.woodD, 0.61, 1.26, -0.35));
  g.add(box(1.36, 0.02, 0.24, M.grass, -0.12, 1.24, -0.35));
  put(g, antenna(M, 0.3, 0.9), -0.5, 1.23, -0.38);
  put(g, antenna(M, 0.24, 0.8), 0.24, 1.23, -0.4, 0.7);
  g.add(cyl(0.014, 0.018, 0.4, 8, M.dark, -0.12, 1.42, -0.42));
  /* 红金竖灯箱（右壁托臂，板面朝 +X；托臂插入墙内） */
  g.add(signBox(M, anims, 0.5, 0.7, 0.8, 1.12, 0.62, PI / 2));
  /* 黑柱暖头街灯（左前） */
  var sl = streetLamp(M, anims, 1.2, 0.95); sl.position.set(-1.08, 0.05, 0.66); g.add(sl);
  /* 暖光窗呼吸 */
  var wm = M.glow;
  anims.push(function (t) { wm.emissiveIntensity = 0.2 + 0.08 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：六层奶油唐楼 + 屋顶梯屋铁棚群（h≈2.26） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35, false));
  /* 主体：GFA 0.06-0.6 + 5 层 ×0.26 → 顶 1.9 */
  g.add(box(1.6, 0.07, 1.06, M.stoneD, 0, 0.035, -0.02));
  g.add(box(1.5, 0.53, 0.98, M.plaster, 0, 0.33, -0.02));
  var fl, y0 = 0.6;
  for (fl = 0; fl < 5; fl++) {
    g.add(box(1.56, 0.035, 1.02, M.trim, 0, y0 + 0.017, -0.02));
    g.add(box(1.5, 0.225, 0.98, M.plaster, 0, y0 + 0.13, -0.02));
    y0 += 0.26;
  }
  /* 阴面 value drop（右山墙 + 后墙下沿） */
  g.add(box(0.02, 1.83, 0.98, M.plasterS, 0.755, 1.0, -0.02));
  g.add(box(1.5, 0.02, 0.02, M.plasterS, 0, 0.12, -0.51));
  /* 2F 青绿墙板带 */
  g.add(box(1.44, 0.2, 0.02, M.canSlate, 0, 0.86, 0.475));
  /* GFA 门脸：橱窗 ×2 + 门 + 黄绿帆布棚包角 + 灯笼 */
  put(g, warmWindow(M, 0.36, 0.3), -0.48, 0.3, 0.48);
  put(g, warmWindow(M, 0.36, 0.3), 0.06, 0.3, 0.48);
  g.add(box(0.28, 0.4, 0.04, M.ink, 0.48, 0.26, 0.48));
  g.add(box(0.24, 0.36, 0.045, M.woodD, 0.48, 0.24, 0.485));
  g.add(awning(M, 1.7, 0.44, M.lime, M.lime, 0, 0.6, 0.46));
  g.add(awning(M, 1.0, 0.36, M.lime, M.lime, 0.68, 0.6, -0.1, PI / 2));
  put(g, lantern(M, 0.55, anims, 0.9), -0.78, 0.5, 0.6);
  put(g, lantern(M, 0.55, anims, 2.4), 0.62, 0.5, 0.6);
  /* 4 层暖光窗对 + 灰蓝窗棚 */
  var fw = [0.87, 1.13, 1.39, 1.65], fi;
  for (fi = 0; fi < fw.length; fi++) {
    put(g, warmWindow(M, 0.26, 0.22), -0.32, fw[fi], 0.485);
    put(g, warmWindow(M, 0.26, 0.22), 0.3, fw[fi], 0.485);
    g.add(awning(M, 0.86, 0.2, M.canSlate, M.canSlate, -0.01, fw[fi] + 0.16, 0.47));
  }
  /* 墙挂空调外机 ×3 */
  g.add(acUnit(M, 0.62, 1.05, 0.36));
  g.add(acUnit(M, 0.62, 1.55, 0.36));
  g.add(acUnit(M, -0.72, 1.3, 0.1, PI / 2));
  /* 屋顶：收口檐 + 女儿墙 + 草皮 */
  g.add(box(1.6, 0.06, 1.06, M.trim, 0, 1.92, -0.02));
  g.add(box(1.52, 0.05, 0.05, M.plasterS, 0, 1.955, -0.5));
  g.add(box(0.05, 0.05, 1.0, M.plasterS, 0.76, 1.955, -0.02));
  g.add(box(0.05, 0.05, 1.0, M.plasterS, -0.76, 1.955, -0.02));
  g.add(box(1.42, 0.02, 0.9, M.grass, 0, 1.935, -0.05));
  /* 屋顶群：混凝土梯屋（含栏）+ 锈色铁棚 + 水管 */
  g.add(box(0.5, 0.2, 0.42, M.plasterS, -0.42, 2.03, -0.28));
  g.add(box(0.54, 0.03, 0.46, M.trim, -0.42, 2.145, -0.28));
  g.add(box(0.44, 0.02, 0.03, M.dark, -0.42, 2.1, -0.055));
  g.add(box(0.4, 0.12, 0.4, M.rust, 0.3, 1.99, -0.2));
  var shed = box(0.46, 0.02, 0.46, M.rust, 0.3, 2.06, -0.2); shed.rotation.x = 0.12; g.add(shed);
  g.add(cyl(0.02, 0.02, 0.2, 8, M.dark, 0.62, 2.0, -0.42));
  /* 天线 ×2 + 避雷针（总高 ≤2.29） */
  put(g, antenna(M, 0.15, 0.9), -0.1, 2.05, -0.4);
  put(g, antenna(M, 0.12, 0.85), 0.5, 2.08, -0.42, 0.8);
  g.add(cyl(0.008, 0.012, 0.1, 6, M.dark, -0.42, 2.2, -0.28));
  /* 红金竖灯箱（右壁托臂，板面朝 +X；中段） */
  g.add(signBox(M, anims, 1.4, 0.84, 0.9, 1.25, 0.4, PI / 2));
  /* 小绿吊牌（右墙） */
  g.add(box(0.02, 0.22, 0.16, M.vermiD, 0.79, 0.62, 0.05));
  var gp = mesh(new THREE.PlaneGeometry(0.12, 0.17), M.lime); put(g, gp, 0.775, 0.62, 0.05, PI / 2);
  /* 红消防栓（右前） + 街灯（左前） + 木箱 */
  var hy = grp();
  hy.add(cyl(0.032, 0.04, 0.09, 10, M.vermi, 0, 0.045, 0));
  hy.add(sph(0.03, M.vermi, 0, 0.1, 0));
  hy.add(box(0.09, 0.024, 0.024, M.vermiD, 0, 0.06, 0));
  put(g, hy, 1.02, 0.06, 0.86);
  var sl = streetLamp(M, anims, 2.0, 1.05); sl.position.set(-1.1, 0.05, 0.78); g.add(sl);
  put(g, crate(M, 0.9), 0.9, 0.05, 0.72);
  /* 暖光窗呼吸 */
  var wm = M.glow;
  anims.push(function (t) { wm.emissiveIntensity = 0.2 + 0.08 * sin(t * 1.15 + 0.8); });
  return g;
}

/* ---- lv4 地标：尖沙咀钟楼塔式建筑群（h≈2.79） ---- */
function level4(M, anims) {
  var g = grp();
  /* 地坪 + 石台基 + 双阶踏步 + 门狮 */
  g.add(padUnit(M, 2.5, 2.36, false));
  g.add(box(2.12, 0.06, 1.66, M.stoneD, 0, 0.03, -0.02));
  g.add(box(2.04, 0.1, 1.58, M.stone, 0, 0.11, -0.02));
  g.add(box(0.66, 0.06, 0.18, M.stoneD, -0.24, 0.14, 0.86));
  g.add(box(0.54, 0.05, 0.16, M.stoneD, -0.24, 0.195, 0.77));
  g.add(box(0.66, 0.06, 0.18, M.stoneD, 0.36, 0.14, 0.86));
  g.add(box(0.54, 0.05, 0.16, M.stoneD, 0.36, 0.195, 0.77));
  put(g, stoneLion(M, 1.1), -0.72, 0.16, 0.72);
  /* GFA 红柱廊（0.16-0.72）：tan 墙 + 橙红楞纹棚包角 + 暖光店面 + 金匾木门 */
  g.add(box(1.78, 0.56, 1.14, M.wood, 0, 0.44, -0.06));
  g.add(box(1.86, 0.05, 1.2, M.vermiD, 0, 0.735, -0.06));
  put(g, vermiColumn(M, 0.5, 0.036), -0.72, 0.16, 0.52);
  put(g, vermiColumn(M, 0.5, 0.036, true), -0.26, 0.16, 0.58);
  put(g, vermiColumn(M, 0.5, 0.036, true), 0.26, 0.16, 0.58);
  put(g, vermiColumn(M, 0.5, 0.036), 0.72, 0.16, 0.52);
  g.add(awning(M, 1.9, 0.46, M.orange, M.orange, 0, 0.77, 0.44));
  g.add(awning(M, 1.06, 0.36, M.orange, M.orange, 0.82, 0.77, -0.1, PI / 2));
  put(g, warmWindow(M, 0.38, 0.3), -0.5, 0.36, 0.55);
  put(g, warmWindow(M, 0.38, 0.3), 0.42, 0.36, 0.55);
  g.add(box(0.3, 0.44, 0.04, M.ink, -0.02, 0.4, 0.56));
  g.add(box(0.26, 0.4, 0.045, M.vermiD, -0.02, 0.38, 0.565));
  g.add(box(0.2, 0.07, 0.02, M.gold, -0.02, 0.52, 0.565));
  put(g, lantern(M, 0.6, anims, 0.4), -0.88, 0.66, 0.6);
  put(g, lantern(M, 0.6, anims, 1.8), 0.84, 0.66, 0.6);
  /* 平座 0：GFA 顶朱栏 */
  put(g, stoneBalustrade(M, 1.8), 0, 0.76, 0.52);
  /* 一层退台（0.78-1.14）：奶油墙（右贴 shade）+ 暖窗 ×3 + 朱柱 */
  g.add(box(1.5, 0.36, 0.98, M.plaster, 0, 0.96, -0.1));
  g.add(box(0.02, 0.36, 0.98, M.plasterS, 0.74, 0.96, -0.1));
  put(g, warmWindow(M, 0.24, 0.22), -0.42, 0.96, 0.4);
  put(g, warmWindow(M, 0.24, 0.22), 0, 0.96, 0.4);
  put(g, warmWindow(M, 0.24, 0.22), 0.42, 0.96, 0.4);
  put(g, vermiColumn(M, 0.34, 0.03, true), -0.68, 0.78, 0.42);
  put(g, vermiColumn(M, 0.34, 0.03, true), 0.68, 0.78, 0.42);
  /* 一层翘檐（eave 1.14 → apex≈1.36，加重瓦坡的宝塔比例） */
  put(g, pagodaRoof(M, { w: 1.42, d: 0.92, h: 0.22 }), 0, 1.14, -0.1);
  /* 平座 1 + 朱栏 */
  g.add(box(1.56, 0.045, 1.02, M.stone, 0, 1.16, -0.1));
  put(g, stoneBalustrade(M, 1.5), 0, 1.185, 0.39);
  /* 二层退台（1.18-1.5）：tan 墙 + 暖窗 ×2 + 青绿窗帽 */
  g.add(box(1.18, 0.32, 0.82, M.wood, 0, 1.34, -0.12));
  put(g, warmWindow(M, 0.22, 0.2), -0.26, 1.34, 0.3);
  put(g, warmWindow(M, 0.22, 0.2), 0.26, 1.34, 0.3);
  g.add(awning(M, 0.34, 0.14, M.canSlate, M.canSlate, -0.26, 1.48, 0.29));
  g.add(awning(M, 0.34, 0.14, M.canSlate, M.canSlate, 0.26, 1.48, 0.29));
  put(g, vermiColumn(M, 0.3, 0.028, true), -0.52, 1.2, 0.32);
  put(g, vermiColumn(M, 0.3, 0.028, true), 0.52, 1.2, 0.32);
  /* 二层翘檐（eave 1.52 → apex≈1.72，插入鼓壁生根） */
  put(g, pagodaRoof(M, { w: 1.1, d: 0.76, h: 0.2 }), 0, 1.52, -0.12);
  /* 平座 2 + 朱栏（让位鼓壁外凸） */
  g.add(box(1.2, 0.04, 0.86, M.stone, 0, 1.535, -0.12));
  put(g, stoneBalustrade(M, 1.14), 0, 1.56, 0.24);
  /* 钟鼓层（1.55-1.91）：朱漆鼓壁 + 钟面 + 金圈 + 走针 + 双灯笼 */
  g.add(cyl(0.42, 0.44, 0.36, 12, M.vermi, 0, 1.73, -0.12));
  g.add(cyl(0.46, 0.46, 0.035, 12, M.vermiD, 0, 1.56, -0.12));
  var faceGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.05, 20);
  var clockTex = getTex('clock', texClock);
  var faceSide = MAT('p34clockSide', function () { return std('#c03028', { rough: 0.5 }); });
  var faceCap = MAT('p34clockCap', function () { return std('#ffffff', { map: clockTex, rough: 0.5 }); });
  var face = new THREE.Mesh(faceGeo, [faceSide, faceCap, faceCap]);
  face.castShadow = true; face.receiveShadow = true;
  face.rotation.x = PI / 2;
  face.position.set(0, 1.75, 0.325);
  g.add(face);
  var bezel = mesh(new THREE.TorusGeometry(0.27, 0.024, 10, 20), M.gold);
  bezel.position.set(0, 1.75, 0.3); g.add(bezel);
  /* 走针（interaction：≈10:10 起步的缓动时针/分针） */
  var hands = grp(); hands.position.set(0, 1.75, 0.36); g.add(hands);
  var hourPivot = grp(), minPivot = grp();
  hourPivot.add(box(0.03, 0.13, 0.012, M.dark, 0, 0.05, 0));
  minPivot.add(box(0.024, 0.19, 0.012, M.dark, 0, 0.08, 0));
  hands.add(hourPivot); hands.add(minPivot);
  hourPivot.rotation.z = -1.05; minPivot.rotation.z = 0.55;
  anims.push(function (t) {
    minPivot.rotation.z = 0.55 - t * 0.052;
    hourPivot.rotation.z = -1.05 - t * 0.0043;
  });
  put(g, lantern(M, 0.52, anims, 2.6), -0.3, 1.84, 0.16);
  put(g, lantern(M, 0.52, anims, 3.8), 0.3, 1.84, 0.16);
  /* 攒尖宝顶（坐在鼓顶 1.91 上：apex≈2.21，尖顶至≈2.45） */
  put(g, pagodaCrown(M, { w: 0.94, h: 0.3 }), 0, 1.91, -0.12);
  /* 前角红金竖灯箱（对，托臂插入 GFA 墙身，板面朝左右外） */
  g.add(signBox(M, anims, 0.8, 0.6, 0.92, 0.4, 0.62, PI / 2));
  g.add(signBox(M, anims, 2.2, 0.6, -0.92, 0.4, 0.62, -PI / 2));
  /* 墙挂空调 + 小碟天线 */
  g.add(acUnit(M, 0.6, 1.02, 0.42));
  var dish = mesh(new THREE.SphereGeometry(0.07, 12, 10, 0, PI * 2, 0, PI / 2), M.stone);
  put(g, dish, 0.85, 0.52, 0.2, 0, -0.9, 0.4);
  /* 街灯 ×2（天星码头灯柱） + 灌丛 */
  var sl1 = streetLamp(M, anims, 0.7, 1.1); sl1.position.set(-1.16, 0.05, 0.92); g.add(sl1);
  var sl2 = streetLamp(M, anims, 2.9, 1.02); sl2.position.set(1.14, 0.05, 0.95); g.add(sl2);
  g.add(bush(M, 0.09, -1.06, 0.12, 0.4));
  g.add(bush(M, 0.08, 1.05, 0.11, 0.5));
  /* 暖光窗呼吸 */
  var wm = M.glow;
  anims.push(function (t) { wm.emissiveIntensity = 0.2 + 0.08 * sin(t * 1.05 + 1.3); });
  return g;
}

/* ================= 5. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[34] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_34_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 34;
  g.userData.level = lv;
  g.userData.region = 'g7';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
