/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_13.js
 * -------------------------------------------------------------------------------------
 * 格 13「北京路」(g3 岭南骑楼) 独属建筑：广州骑楼四阶生长史
 * 参考图 refs/prop_13.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见 .img2threejs/evidence_prop13/
 * object-sculpt-spec.json，--strict-quality PASS；12 材质 crop 实拍 PBR 证据 conf≥0.83）。
 *
 * 风格族谱（同一块地的同一种生长 —— 参考图从左到右四栋即四阶）：
 *   lv1 小屋   木板市集棚屋 + 暖棕瓦坡顶 + 奶油帆布挑棚 + 果摊货担 + 红灯笼（h≈1.06）
 *   lv2 洋房   两层小楼：双拱骑楼廊 + 绿帆布挑棚 + 彩色百叶窗×2 + 荷兰弧山墙瓦顶（h≈1.67）
 *   lv3 大厦   三层骑楼：三拱连廊 + 红白条纹挑棚 + 百叶窗×6 + 弧形巴洛克山花 + 四坡瓦顶
 *              + 竖招「北京路」+ 铸铁路灯（h≈2.31）
 *   lv4 地标   四层骑楼总会：四拱连廊 + 红挑棚 + 百叶窗×12 + 平座栏杆望柱 + 绿琉璃攒尖
 *              翘檐宝顶金冠 + 横匾（h≈2.99）
 *
 * 独有语汇（自参考图逐区采样）：
 *   奶油灰泥墙面（壁柱提亮/转角隅石）、石柱圆拱骑楼廊（键石 impost 带）、成对彩色百叶
 *   窗（绿/赭/红/青/蓝轮换）+ 窗下花箱红蕊、挑棚色阶 奶油→绿→红白条→红（扇贝垂边）、
 *   暗陶瓦垄（阳面亮/阴面暗 + 翘角）、lv4 绿琉璃瓦垄金宝顶、黑板铁艺路灯、金边竖招。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[13] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_13] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 颜色 / 材质基元（std: sRGB→Linear，同 buildings3d） ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos, SQ2 = Math.SQRT2;
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
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rx, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}
/* 两点间斜梁（lookAt 使 +Z 指向终点；几何长度沿 Z） */
function beam(ax, ay, az, bx, by, bz, thick, mat) {
  var dx = bx - ax, dy = by - ay, dz = bz - az;
  var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  var o = mesh(new THREE.BoxGeometry(thick, thick, len), mat);
  o.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  o.lookAt(new THREE.Vector3(bx, by, bz));
  return o;
}

/* ================= 1. 程序化 Canvas 纹理（≤256px，零外部资源） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 奶油灰泥：细噪 + 抹痕 + 值域斑驳（采样自 lv2/lv3 墙面） */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e6ddc4'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 130; i++) {
    g.fillStyle = (i % 3 === 0) ? 'rgba(255,255,255,0.07)' : (i % 3 === 1 ? 'rgba(140,126,96,0.05)' : 'rgba(120,104,76,0.05)');
    g.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
  }
  /* 水平抹缝（灰泥分格） */
  g.fillStyle = 'rgba(120,104,76,0.10)';
  g.fillRect(0, 42, S, 2); g.fillRect(0, 96, S, 2);
  return toTex(cv, true);
}
/* 暗陶瓦垄：横向垄线明暗 + 竖向接头错缝 + 陶面噪点（map+bump 同源，lv1-3 暗陶） */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#5a544e'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#6a635a' : '#57514a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#413c36'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#7a7368'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(44,40,34,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(20,18,14,0.09)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 绿琉璃瓦垄：垄行 + 高光釉斑（lv4 宝顶） */
function texTileGreen() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#3e7a52'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#4c8a60' : '#3a7250';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#2b5a3e'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = '#69aa7c'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(24,52,36,0.55)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = 'rgba(210,240,215,0.10)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 1);
  }
  return toTex(cv, true);
}
/* 百叶窗板：水平板条明暗（map+bump 同源，leaf 贴面） */
function texLouver() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#888888'; g.fillRect(0, 0, S, S);
  var n = 6, i;
  for (i = 0; i < n; i++) {
    var y = i * (S / n);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(0, y, S, 2);
    g.fillStyle = 'rgba(0,0,0,0.32)'; g.fillRect(0, y + S / n - 3, S, 3);
  }
  return toTex(cv, true);
}
/* 挑棚条纹（红白，lv3）：竖条沿 U 重复 */
function texStripe() {
  var w = 128, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  var i;
  for (i = 0; i < 4; i++) {
    g.fillStyle = (i % 2) ? '#e8e4d8' : '#c03830';
    g.fillRect(i * (w / 4), 0, w / 4, h);
  }
  g.fillStyle = 'rgba(0,0,0,0.10)'; g.fillRect(0, h - 6, w, 6);
  return toTex(cv, true);
}
/* 花箱红蕊：绿叶底 + 红/粉蕊点 */
function texFlower() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#4e7a3c'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 26; i++) {
    g.fillStyle = 'rgba(96,140,70,0.8)';
    g.fillRect((i * 17) % S, (i * 29) % S, 4, 3);
  }
  for (i = 0; i < 22; i++) {
    g.fillStyle = (i % 3 === 0) ? '#d84a58' : (i % 3 === 1 ? '#e86a5a' : '#e89ab0');
    g.fillRect((i * 23 + 5) % S, (i * 31 + 7) % S, 3, 3);
  }
  return toTex(cv, true);
}
/* 石板路（格心坪）：大板缝 + 值域斑驳 */
function texPave() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#c9c2ae'; g.fillRect(0, 0, S, S);
  var rows = 3, rh = S / rows, cols = 3, cw = S / cols, i, k;
  for (i = 0; i < rows; i++) {
    for (k = 0; k < cols; k++) {
      g.fillStyle = ((i + k) % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(90,82,64,0.10)';
      g.fillRect(k * cw + 2, i * rh + 2, cw - 4, rh - 4);
      g.strokeStyle = 'rgba(70,64,50,0.55)'; g.lineWidth = 2;
      g.strokeRect(k * cw + 1, i * rh + 1, cw - 2, rh - 2);
    }
  }
  return toTex(cv, true);
}
/* 木板墙（lv1）：竖板缝 + 木纹值域 */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#8a6a48'; g.fillRect(0, 0, S, S);
  var n = 8, i, k;
  for (i = 0; i < n; i++) {
    var x = i * (S / n);
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(40,26,14,0.12)';
    g.fillRect(x, 0, S / n, S);
    g.fillStyle = 'rgba(30,20,10,0.6)'; g.fillRect(x, 0, 2, S);
    for (k = 0; k < 4; k++) {
      g.fillStyle = 'rgba(60,42,24,0.25)';
      g.fillRect(x + 3 + ((k * 13) % 10), (k * 37 + i * 11) % S, 1, 8);
    }
  }
  return toTex(cv, true);
}
/* 竖招「北京路」：黑漆金边 + 金字竖排（lv3+） */
function texSignV() {
  var w = 96, h = 224, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2c1c0e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 6; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 52px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '北京路', i;
  for (i = 0; i < 3; i++) g.fillText(s[i], w / 2, 48 + i * 62);
  return toTex(cv, true);
}
/* 横匾「北京路」金漆（lv4 门楣） */
function texPlaqueH() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#26180c'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 42px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('北 京 路', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
/* 望柱栏杆条：竖柱明暗节奏（lv4 平座） */
function texBaluster() {
  var w = 128, h = 32, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#d8cfb8'; g.fillRect(0, 0, w, h);
  var n = 8, i;
  for (i = 0; i < n; i++) {
    var x = i * (w / n);
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.18)' : 'rgba(70,60,44,0.30)';
    g.fillRect(x + 2, 0, w / n - 4, h);
    g.fillStyle = 'rgba(50,44,32,0.5)';
    g.fillRect(x + w / n - 2, 0, 2, h);
  }
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) { TEX[id] = make(); TEX[id].name = 'p13tex_' + id; } return TEX[id]; }

/* ================= 共享材质库（四级统一色板 = 参考图逐区采样） ================= */
function Mats() {
  return {
    /* 墙面：front 提亮 / side 压暗（同贴图不同 tint，参考图阴阳面） */
    wallF:     MAT('p13wallF', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.88 }); }),
    wallS:     MAT('p13wallS', function () { var t = getTex('plaster', texPlaster); return std('#cfc6ac', { map: t, rough: 0.9 }); }),
    wallTrim:  MAT('p13wallTrim', function () { return std('#efe8d6', { rough: 0.82 }); }),
    plinth:    MAT('p13plinth', function () { return std('#c9bfa6', { rough: 0.92 }); }),
    stone:     MAT('p13stone', function () { return std('#d8cfb8', { rough: 0.86 }); }),
    stoneD:    MAT('p13stoneD', function () { return std('#c4bba4', { rough: 0.9 }); }),
    /* 瓦顶：阳面 / 阴面（同 texTile tint 分档） */
    tileSun:   MAT('p13tileSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.7 }); }),
    tileShade: MAT('p13tileShd', function () { var t = getTex('tile', texTile); return std('#a9a29a', { map: t, bump: t, bumpScale: 0.014, rough: 0.76 }); }),
    tileWarm:  MAT('p13tileWarm', function () { var t = getTex('tile', texTile); return std('#d8c0a0', { map: t, bump: t, bumpScale: 0.014, rough: 0.72 }); }),
    tileWarmD: MAT('p13tileWrmD', function () { var t = getTex('tile', texTile); return std('#b09a80', { map: t, bump: t, bumpScale: 0.014, rough: 0.78 }); }),
    ridge:     MAT('p13ridge', function () { return std('#3a3630', { rough: 0.8 }); }),
    /* 绿琉璃（lv4 宝顶） */
    glazeSun:  MAT('p13glazeSun', function () { var t = getTex('tileG', texTileGreen); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.4, metal: 0.05 }); }),
    glazeShd:  MAT('p13glazeShd', function () { var t = getTex('tileG', texTileGreen); return std('#8fa8a0', { map: t, bump: t, bumpScale: 0.012, rough: 0.46, metal: 0.05 }); }),
    glazeRidge: MAT('p13glazeRdg', function () { return std('#2e5e40', { rough: 0.5 }); }),
    /* 百叶窗五色（参考图轮换） */
    shutter: [
      MAT('p13shG', function () { var t = getTex('louver', texLouver); return std('#3e8e5a', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); }),
      MAT('p13shO', function () { var t = getTex('louver', texLouver); return std('#d89c3c', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); }),
      MAT('p13shR', function () { var t = getTex('louver', texLouver); return std('#c04434', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); }),
      MAT('p13shT', function () { var t = getTex('louver', texLouver); return std('#3a8a96', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); }),
      MAT('p13shB', function () { var t = getTex('louver', texLouver); return std('#4a7ab0', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); })],
    frameW:    MAT('p13frameW', function () { return std('#f4eee0', { rough: 0.7 }); }),
    openD:     MAT('p13openD', function () { return std('#4a4038', { rough: 0.85 }); }),
    glow:      MAT('p13glow', function () { return std('#e8c890', { rough: 0.6, emissive: '#ffb45c', ei: 0.18 }); }),
    planter:   MAT('p13planter', function () { return std('#b0653c', { rough: 0.8 }); }),
    flower:    MAT('p13flower', function () { return std('#ffffff', { map: getTex('flower', texFlower), rough: 0.85 }); }),
    /* 挑棚色阶 */
    canvasC:   MAT('p13canvasC', function () { return std('#e8ddc0', { rough: 0.94 }); }),
    canvasG:   MAT('p13canvasG', function () { return std('#3f8f5f', { rough: 0.92 }); }),
    canvasR:   MAT('p13canvasR', function () { return std('#c03830', { rough: 0.92 }); }),
    stripe:    MAT('p13stripe', function () { return std('#ffffff', { map: getTex('stripe', texStripe), rough: 0.92 }); }),
    /* 木作 / 铁 / 金 / 灯笼 */
    plank:     MAT('p13plank', function () { return std('#ffffff', { map: getTex('plank', texPlank), bump: getTex('plank', texPlank), bumpScale: 0.01, rough: 0.82 }); }),
    wood:      MAT('p13wood', function () { return std('#8a6a48', { rough: 0.8 }); }),
    woodD:     MAT('p13woodD', function () { return std('#6e5438', { rough: 0.86 }); }),
    iron:      MAT('p13iron', function () { return std('#2e3238', { rough: 0.6, metal: 0.3 }); }),
    lampGlow:  MAT('p13lampGlow', function () { return std('#e8d0a0', { rough: 0.4, emissive: '#ffcf7a', ei: 0.5 }); }),
    gold:      MAT('p13gold', function () { return std('#d4a83c', { rough: 0.35, metal: 0.75 }); }),
    glint:     MAT('p13glint', function () { return std('#e8c468', { rough: 0.28, metal: 0.8, emissive: '#ffd98a', ei: 0.15 }); }),
    lantM:     MAT('p13lant', function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.5 }); }),
    lacqDk:    MAT('p13lacqDk', function () { return std('#5a3018', { rough: 0.6 }); }),
    /* 地坪 */
    pave:      MAT('p13pave', function () { return std('#ffffff', { map: getTex('pave', texPave), rough: 0.92 }); }),
    paveB:     MAT('p13paveB', function () { return std('#a8a08c', { rough: 0.94 }); }),
    grass:     MAT('p13grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p13grassD', function () { return std('#698f4c', { rough: 0.95 }); }),
    balustr:   MAT('p13balustr', function () { return std('#ffffff', { map: getTex('balu', texBaluster), rough: 0.85 }); })
  };
}

/* ================= 2. 预制件（骑楼独有语汇） ================= */

/* 骑楼拱廊墙：Shape + 半圆拱洞（absarc）一次挤出 —— 1 mesh 承载整排拱 */
function archWall(M, w, h, t, arches, mat, zf) {
  var shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h); shape.lineTo(-w / 2, h); shape.closePath();
  var i;
  for (i = 0; i < arches.length; i++) {
    var a = arches[i], r = a.w / 2;
    var p = new THREE.Path();
    p.moveTo(a.cx - r, 0);
    p.lineTo(a.cx - r, a.spring);
    p.absarc(a.cx, a.spring, r, PI, 0, true);
    p.lineTo(a.cx + r, 0);
    p.closePath();
    shape.holes.push(p);
  }
  var geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
  var m = mesh(geo, mat);
  m.position.z = zf - t;                          /* 墙前皮对齐 zf */
  return m;
}

/* 石柱：柱础 + 柱身 + 柱头（骑楼廊柱） */
function columnRound(M, h, r) {
  var g = grp();
  g.add(box(r * 2.6, 0.045, r * 2.6, M.stoneD, 0, 0.022, 0));
  g.add(cyl(r, r * 1.06, h, 10, M.stone, 0, 0.045 + h / 2, 0));
  g.add(box(r * 2.5, 0.04, r * 2.5, M.stoneD, 0, 0.045 + h + 0.02, 0));
  return g;
}

/* 百叶窗单元：白框 + 暗腔 + 暖光腔 + 成对百叶 + 花箱花蕊（7 mesh） */
function shutterWindow(M, w, h, cIdx) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.035, M.frameW));
  g.add(box(w, h, 0.032, M.openD, 0, 0, 0.004));
  g.add(box(w * 0.42, h * 0.86, 0.022, M.glow, 0, 0, 0.014));
  var sl = box(w * 0.3, h * 1.02, 0.04, M.shutter[cIdx], -w * 0.335, 0, 0.018); g.add(sl);
  var sr = box(w * 0.3, h * 1.02, 0.04, M.shutter[cIdx], w * 0.335, 0, 0.018); g.add(sr);
  g.add(box(w * 0.82, 0.07, 0.078, M.planter, 0, -h / 2 - 0.045, 0.026));
  g.add(box(w * 0.74, 0.05, 0.05, M.flower, 0, -h / 2 - 0.02, 0.028));
  return g;
}

/* 挑棚：斜面棚布 + 扇贝垂边（色随 level；sway 组供动画） */
function awningUnit(M, w, out, mat, y0, zf) {
  var g = grp();
  var slope = Math.atan2(0.16, out);
  var len = Math.sqrt(out * out + 0.16 * 0.16) + 0.02;
  var cloth = box(w, 0.016, len, mat, 0, 0, 0);
  cloth.rotation.x = slope;
  cloth.position.set(0, y0 - 0.08, zf + out / 2);
  g.add(cloth);
  var val = grp(); val.position.set(0, y0 - 0.155, zf + out); g.add(val);
  val.add(box(w + 0.02, 0.075, 0.014, mat, 0, 0, 0));
  return { g: g, val: val };
}

/* 双坡瓦顶（lv1/lv2）：阳/阴坡 + 黑瓦脊 + 翘角 + 封檐板（-prop_3 语法，色阶不同） */
function tileRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var sun = o.warm ? M.tileWarm : M.tileSun;
  var shd = o.warm ? M.tileWarmD : M.tileShade;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.034, slopeLen, k > 0 ? sun : shd, 0, 0, k * slopeLen / 2));
    for (i = 0; i < 3; i++) {
      sg.add(box(w + over * 2 - 0.04, 0.015, 0.028, M.ridge, 0, 0.024, k * (0.3 + i * 0.3) * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.ridge, 0, -0.004, k * eave));
    var c1 = box(0.07, 0.05, 0.07, M.ridge, (w + over * 2) / 2 - 0.01, 0.045, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ridge, -(w + over * 2) / 2 + 0.01, 0.045, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
  }
  /* 山墙封板 */
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  var t1 = mesh(gg, M.wallTrim); t1.rotation.y = PI / 2;
  t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
  var t2 = mesh(gg, M.wallTrim); t2.rotation.y = -PI / 2;
  t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  var rw = w + over * 2 + 0.04;
  g.add(box(rw, 0.055, 0.085, M.ridge, 0, h + 0.028, 0));
  var f1 = box(0.055, 0.09, 0.075, M.ridge, rw / 2 - 0.01, h + 0.09, 0); f1.rotation.z = 0.42; g.add(f1);
  var f2 = box(0.055, 0.09, 0.075, M.ridge, -rw / 2 + 0.01, h + 0.09, 0); f2.rotation.z = -0.42; g.add(f2);
  return g;
}

/* 四坡攒尖顶（lv3 暗陶 / lv4 绿琉璃）：4 棱锥 + 四条垂脊 + 翘角 +（金饰）
 * 注：旋转烘焙进几何（geo.rotateY），避免 Cone AABB 方形包络在旋转后虚增 Box3。 */
function pyramidRoof(M, o) {
  var wx = o.w, wz = o.d, ch = o.h;
  var matSun = o.glaze ? M.glazeSun : M.tileSun;
  var matShd = o.glaze ? M.glazeShd : M.tileShade;
  var matRdg = o.glaze ? M.glazeRidge : M.ridge;
  var g = grp();
  var r = (wx + 0.12) * 0.7071;
  var pyGeo = new THREE.ConeGeometry(r, ch, 4);
  pyGeo.rotateY(PI / 4);
  var py = mesh(pyGeo, matSun);
  py.scale.z = (wz + 0.12) / (wx + 0.12);
  py.position.y = ch / 2;
  g.add(py);
  /* 阴面：贴一片暗色前坡横带（近似值区分档，省 mesh） */
  g.add(box(wx * 0.62, 0.02, 0.02, matShd, 0, ch * 0.32, wz / 2 + 0.02));
  /* 四条垂脊（apex → 四角，端头内收贴檐口） */
  var hx = wx / 2 + 0.02, hz = wz / 2 + 0.02, i;
  var corners = [[hx, hz], [hx, -hz], [-hx, hz], [-hx, -hz]];
  for (i = 0; i < 4; i++) {
    g.add(beam(0, ch, 0, corners[i][0] * 0.985, 0.012, corners[i][1] * 0.985, 0.036, matRdg));
  }
  /* 四角翘角 + 金珠（glaze 时） */
  for (i = 0; i < 4; i++) {
    var lift = box(0.06, 0.04, 0.06, matRdg, corners[i][0] * 1.02, 0.018, corners[i][1] * 1.02);
    lift.rotation.z = -Math.sign(corners[i][0]) * 0.5;
    g.add(lift);
    if (o.goldTips) put(g, sph(0.024, M.gold), corners[i][0] * 1.05, 0.055, corners[i][1] * 1.05);
  }
  /* 宝顶：座 + 球 + 尖（glaze 时；金球 else 瓦色） */
  if (o.finial) {
    g.add(cyl(0.05, 0.065, 0.045, 10, matRdg, 0, ch + 0.02, 0));
    g.add(sph(0.05, M.glint, 0, ch + 0.082, 0));
    var sp = cone(0.018, 0.07, 10, M.glint, 0, ch + 0.145, 0); g.add(sp);
  } else {
    g.add(box(0.34, 0.05, 0.09, matRdg, 0, ch + 0.025, 0));
    var f1 = box(0.05, 0.07, 0.07, matRdg, 0.17, ch + 0.07, 0); f1.rotation.z = 0.4; g.add(f1);
    var f2 = box(0.05, 0.07, 0.07, matRdg, -0.17, ch + 0.07, 0); f2.rotation.z = -0.4; g.add(f2);
  }
  return g;
}

/* 弧形巴洛克山花（lv2 顶 / lv3 山花）：连续曲线轮廓 + 中央饰 + 角壶 */
function parapetGable(M, w, h, t) {
  var s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h * 0.42);
  s.quadraticCurveTo(-w / 2, h * 0.88, -w * 0.22, h * 0.96);
  s.quadraticCurveTo(0, h * 1.06, w * 0.22, h * 0.96);
  s.quadraticCurveTo(w / 2, h * 0.88, w / 2, h * 0.42);
  s.lineTo(w / 2, 0);
  s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
  var m = mesh(geo, M.wallTrim);
  var g = grp(); g.add(m);
  g.add(box(w * 0.24, h * 0.3, t + 0.012, M.stone, 0, h * 0.42, t / 2));   /* 中央饰块 */
  g.add(sph(0.032, M.stoneD, -w / 2 + 0.05, h * 0.5, t / 2));              /* 角壶 ×2 */
  g.add(sph(0.032, M.stoneD, w / 2 - 0.05, h * 0.5, t / 2));
  return g;
}

/* 红灯笼（金盖金底 + 红壳 + 穗，呼吸随 phase） */
function lanternUnit(M, s, phase) {
  var g = grp(); s = s || 1;
  var bm = M.lantM;
  g.add(cyl(0.034 * s, 0.048 * s, 0.033 * s, 10, M.gold, 0, 0.11 * s, 0));
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.048 * s, 0.034 * s, 0.033 * s, 10, M.gold, 0, -0.1 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.07 * s, 10, M.lacqDk, 0, -0.158 * s, 0));
  return g;
}

/* 铸铁路灯（lv3+）：基座 + 锥柱 + 灯头暖光 + 尖顶（flicker 动画） */
function lampPost(M, h) {
  var g = grp();
  g.add(cyl(0.055, 0.07, 0.06, 10, M.iron, 0, 0.03, 0));
  g.add(cyl(0.022, 0.034, h, 10, M.iron, 0, 0.06 + h / 2, 0));
  g.add(cyl(0.034, 0.034, 0.022, 10, M.iron, 0, 0.06 + h * 0.86, 0));
  g.add(box(0.085, 0.1, 0.085, M.lampGlow, 0, 0.06 + h + 0.02, 0));
  var cap = cone(0.062, 0.06, 10, M.iron, 0, 0.06 + h + 0.1, 0); cap.rotation.y = PI / 4; g.add(cap);
  g.add(sph(0.017, M.gold, 0, 0.06 + h + 0.145, 0));
  return g;
}

/* 竖招「北京路」：横担（+Z 挑出）+ 黑漆金边招板（sway 动画） */
function signBoard(M, h) {
  var g = grp();
  g.add(box(0.03, 0.03, 0.3, M.iron, 0, 0, 0.15));                /* 挑臂（+Z 挑出） */
  g.add(cyl(0.014, 0.014, 0.05, 10, M.iron, 0, -0.02, 0.28));
  var bd = grp(); bd.position.set(0, -h / 2 - 0.02, 0.28); g.add(bd);
  bd.add(box(0.17, h, 0.035, M.lacqDk));
  var face = new THREE.Mesh(new THREE.PlaneGeometry(0.145, h - 0.04),
    new THREE.MeshStandardMaterial({ map: getTex('signV', texSignV), roughness: 0.55, metalness: 0.08, flatShading: true }));
  face.position.z = 0.019; bd.add(face);
  var face2 = face.clone(); face2.position.z = -0.019; face2.rotation.y = PI; bd.add(face2);
  return { g: g, bd: bd };
}

/* 望柱栏杆跑（lv4 平座）：扶手 + 望柱纹条 + 地栿（2 mesh） */
function balustradeRun(M, w) {
  var g = grp();
  g.add(box(w, 0.028, 0.045, M.stone, 0, 0.155, 0));
  var strip = box(w, 0.13, 0.03, M.balustr, 0, 0.075, 0); g.add(strip);
  return g;
}

/* 陶罐望柱头（lv4）：罐身 + 罐口 */
function urnMini(M, s) {
  var g = grp(); s = s || 1;
  var b = sph(0.05 * s, M.stone, 0, 0.05 * s, 0); b.scale.y = 1.15; g.add(b);
  g.add(cyl(0.036 * s, 0.024 * s, 0.03 * s, 10, M.stoneD, 0, 0.115 * s, 0));
  return g;
}

/* 果摊（lv1）：案 + 交叉腿 + 果堆 ×3 + 木箱 */
function marketStall(M, w) {
  var g = grp();
  g.add(box(w, 0.035, 0.3, M.wood, 0, 0.24, 0));
  g.add(box(0.035, 0.22, 0.26, M.woodD, -w / 2 + 0.05, 0.11, 0));
  g.add(box(0.035, 0.22, 0.26, M.woodD, w / 2 - 0.05, 0.11, 0));
  var fr = mesh(new THREE.IcosahedronGeometry(0.05, 0), MAT('p13orange', function () { return std('#e08a30', { rough: 0.7 }); }));
  put(g, fr, -w * 0.24, 0.29, 0.02); fr.scale.y = 0.7;
  var fg = mesh(new THREE.IcosahedronGeometry(0.045, 0), M.grassD);
  put(g, fg, 0.02, 0.285, -0.04); fg.scale.y = 0.7;
  var frd = mesh(new THREE.IcosahedronGeometry(0.04, 0), MAT('p13red2', function () { return std('#c04a38', { rough: 0.7 }); }));
  put(g, frd, w * 0.24, 0.28, 0.03); frd.scale.y = 0.7;
  g.add(box(0.14, 0.1, 0.12, M.woodD, w * 0.3, 0.05, 0.24));
  return g;
}

/* 地坪：石板坪 + 草沿 + 灌丛（参考图绿边石板广场） */
function padUnit(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.pave, 0, 0.028, 0));
  g.add(box(size + 0.05, 0.028, d + 0.05, M.paveB, 0, 0.012, 0));
  var bush = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.grassD);
  put(g, bush, -size / 2 + 0.24, 0.1, d / 2 - 0.26); bush.scale.y = 0.8;
  var bush2 = mesh(new THREE.IcosahedronGeometry(0.065, 0), M.grass);
  put(g, bush2, size / 2 - 0.3, 0.09, -d / 2 + 0.3); bush2.scale.y = 0.8;
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：木板市集棚屋（h≈1.00） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.1));
  /* 棚屋主体：木板墙 + 角柱 + 暗陶单坡双坡瓦顶 */
  g.add(box(1.15, 0.55, 0.85, M.plank, 0, 0.335, -0.12));
  [[-0.55, -0.5], [0.55, -0.5], [-0.55, 0.26], [0.55, 0.26]].forEach(function (c) {
    g.add(box(0.055, 0.58, 0.055, M.woodD, c[0], 0.35, c[1]));
  });
  /* 门洞 + 木闱小窗 + 门口石阶 */
  g.add(box(0.28, 0.4, 0.05, M.openD, -0.32, 0.26, 0.315));
  g.add(box(0.2, 0.24, 0.045, M.woodD, 0.22, 0.4, 0.315));
  g.add(box(0.34, 0.045, 0.18, M.stoneD, -0.32, 0.083, 0.42));
  /* 暖棕瓦顶（apex≈0.95） */
  var roof = tileRoof(M, { w: 1.16, d: 0.9, h: 0.3, over: 0.1, warm: true });
  put(g, roof, 0, 0.615, -0.12);
  /* 奶油帆布挑棚（左前，摇曳） */
  var aw = awningUnit(M, 0.95, 0.52, M.canvasC, 0.44, 0.24);
  put(g, aw.g, -0.25, 0, 0);
  g.add(box(0.03, 0.42, 0.03, M.woodD, -0.68, 0.23, 0.72));
  g.add(box(0.03, 0.42, 0.03, M.woodD, 0.18, 0.23, 0.72));
  anims.push(function (t) { aw.val.rotation.x = sin(t * 1.4) * 0.05; });
  /* 果摊（棚下）+ 货箱（右前） */
  var st = marketStall(M, 0.85); put(g, st, -0.3, 0.05, 0.58);
  g.add(box(0.16, 0.12, 0.14, M.woodD, 0.62, 0.11, 0.52));
  /* 红灯笼（右门柱挑出，摇曳 + 呼吸） */
  var lt = grp(); lt.position.set(0.55, 0.56, 0.3); g.add(lt);
  lt.add(box(0.2, 0.025, 0.025, M.woodD, 0.1, 0, 0));
  var ltSwing = grp(); ltSwing.position.set(0.18, -0.02, 0); lt.add(ltSwing);
  ltSwing.add(lanternUnit(M, 0.72, 0));
  anims.push(function (t) {
    ltSwing.rotation.z = sin(t * 1.25 + 0.4) * 0.055;
    M.lantM.emissiveIntensity = 0.5 + 0.18 * sin(t * 2.1);
  });
  return g;
}

/* ---- lv2 洋房：两层双拱骑楼小楼 + 荷兰弧山墙（h≈1.62） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.2));
  var zf = 0.56;                                   /* 立面前皮 */
  /* 台基 + 主体（0.10-1.26） */
  g.add(box(1.86, 0.1, 1.12, M.stoneD, 0, 0.05, 0));
  g.add(box(1.72, 1.16, 1.0, M.wallF, 0, 0.68, -0.06));
  g.add(box(1.72, 1.16, 0.02, M.wallS, 0, 0.68, -0.57));
  /* 骑楼廊：双拱墙 + 石柱 ×2 + 走廊板（0.10-0.74） */
  g.add(archWall(M, 1.66, 0.66, 0.07, [
    { cx: -0.42, w: 0.46, spring: 0.4 },
    { cx: 0.42, w: 0.46, spring: 0.4 }
  ], M.wallF, zf));
  var cA = columnRound(M, 0.56, 0.038); put(g, cA, -0.42, 0.1, 0.62);
  var cB = columnRound(M, 0.56, 0.038); put(g, cB, 0.42, 0.1, 0.62);
  g.add(box(1.78, 0.05, 0.24, M.stoneD, 0, 0.075, 0.6));
  /* 店脸（廊内）：门 + 货堆 */
  g.add(box(0.4, 0.44, 0.04, M.woodD, -0.44, 0.32, 0.31));
  g.add(box(0.42, 0.05, 0.1, M.wood, -0.44, 0.56, 0.31));
  g.add(box(0.3, 0.2, 0.16, M.woodD, 0.4, 0.2, 0.3));
  /* 绿挑棚（横贯廊口，摇曳） */
  var aw = awningUnit(M, 1.6, 0.42, M.canvasG, 0.78, zf + 0.02);
  put(g, aw.g, 0, 0, 0);
  anims.push(function (t) { aw.val.rotation.x = sin(t * 1.3 + 0.7) * 0.045; });
  /* 二层：百叶窗 ×2（绿/赭）+ 层间腰线 */
  var w1 = shutterWindow(M, 0.3, 0.34, 0); put(g, w1, -0.42, 0.98, zf - 0.01);
  var w2 = shutterWindow(M, 0.3, 0.34, 1); put(g, w2, 0.42, 0.98, zf - 0.01);
  g.add(box(1.78, 0.05, 0.06, M.stone, 0, 0.755, zf + 0.01));
  /* 荷兰弧山墙 + 暗陶瓦顶（apex≈1.62） */
  var pg = parapetGable(M, 1.7, 0.16, 0.05); put(g, pg, 0, 1.26, zf + 0.015);
  var roof = tileRoof(M, { w: 1.6, d: 1.0, h: 0.26, over: 0.08, warm: false });
  put(g, roof, 0, 1.27, -0.06);
  /* 盆栽 ×2 + 石阶 */
  g.add(cyl(0.06, 0.075, 0.1, 10, M.planter, -1.0, 0.1, 0.62));
  var b1 = mesh(new THREE.IcosahedronGeometry(0.075, 0), M.grass); put(g, b1, -1.0, 0.2, 0.62); b1.scale.y = 0.8;
  g.add(cyl(0.06, 0.075, 0.1, 10, M.planter, 1.0, 0.1, 0.62));
  var b2 = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, b2, 1.0, 0.19, 0.62); b2.scale.y = 0.8;
  /* 窗光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.18 + 0.07 * sin(t * 1.05 + 0.3); });
  return g;
}

/* ---- lv3 大厦：三层三拱骑楼 + 山花 + 攒尖瓦顶 + 竖招 + 路灯（h≈2.15） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  var zf = 0.6;
  /* 台基 + 主体（0.10-1.96） */
  g.add(box(2.06, 0.1, 1.16, M.stoneD, 0, 0.05, -0.03));
  g.add(box(1.92, 1.86, 1.04, M.wallF, 0, 1.03, -0.08));
  g.add(box(1.92, 1.86, 0.02, M.wallS, 0, 1.03, -0.61));
  /* 骑楼廊：三拱墙 + 石柱 ×3 + 走廊板（0.10-0.78） */
  g.add(archWall(M, 1.86, 0.7, 0.07, [
    { cx: -0.62, w: 0.44, spring: 0.42 },
    { cx: 0, w: 0.44, spring: 0.42 },
    { cx: 0.62, w: 0.44, spring: 0.42 }
  ], M.wallF, zf));
  var cx, ci;
  for (ci = 0; ci < 3; ci++) {
    cx = -0.62 + ci * 0.62;
    var cc = columnRound(M, 0.6, 0.036); put(g, cc, cx, 0.1, 0.66);
  }
  g.add(box(1.98, 0.05, 0.24, M.stoneD, 0, 0.075, 0.64));
  /* 店脸：门 + 柜面 + 货箱 */
  g.add(box(0.38, 0.46, 0.04, M.woodD, -0.62, 0.33, 0.34));
  g.add(box(0.62, 0.05, 0.1, M.wood, 0.05, 0.58, 0.34));
  g.add(box(0.34, 0.2, 0.16, M.woodD, 0.5, 0.2, 0.32));
  /* 红白条纹挑棚（摇曳） */
  var aw = awningUnit(M, 1.78, 0.44, M.stripe, 0.82, zf + 0.02);
  put(g, aw.g, 0, 0, 0);
  anims.push(function (t) { aw.val.rotation.x = sin(t * 1.35 + 1.1) * 0.045; });
  /* 层间腰线 ×2 + 转角隅石 ×6 */
  g.add(box(1.98, 0.045, 0.06, M.stone, 0, 0.795, zf + 0.01));
  g.add(box(1.98, 0.045, 0.06, M.stone, 0, 1.29, zf - 0.01));
  [[-1, 0], [-1, 1], [-1, 2], [1, 0], [1, 1], [1, 2]].forEach(function (q) {
    g.add(box(0.07, 0.5, 0.03, M.wallTrim, q[0] * 0.93, 1.03 + (q[1] - 1) * 0.62, zf - 0.028));
  });
  /* 二/三层百叶窗 ×6（红/赭/青 轮换）+ 三层小栏板 */
  var floors = [[0.98, 0.3, 0], [1.16, 0.28, 0], [1.48, 0.3, 2], [1.66, 0.28, 1], [1.98, 0.3, 3], [2.16, 0.28, 2]];
  var wi, wy, ww, wc;
  var idxs = [[-0.6, 0.98, 2, 0.3], [0.05, 0.98, 1, 0.3], [0.68, 0.98, 4, 0.28],
              [-0.6, 1.48, 3, 0.28], [0.05, 1.48, 0, 0.28], [0.68, 1.48, 2, 0.26]];
  for (wi = 0; wi < idxs.length; wi++) {
    var u = idxs[wi];
    var win = shutterWindow(M, u[3], u[3] * 1.12, u[2]);
    put(g, win, u[0], u[1] + u[3] / 2, zf - 0.015);
  }
  /* 三层窗下小栏板 ×3（几何压花条） */
  for (wi = 0; wi < 3; wi++) {
    cx = -0.6 + wi * 0.64;
    g.add(box(0.4, 0.05, 0.04, M.stone, cx, 1.36, zf + 0.005));
  }
  /* 弧形山花（顶前）+ 暗陶四坡顶（出檐盖墙，apex≈2.30） */
  var pg = parapetGable(M, 1.86, 0.24, 0.06); put(g, pg, 0, 1.96, zf + 0.015);
  var roof = pyramidRoof(M, { w: 2.0, d: 1.24, h: 0.26, glaze: false, finial: false });
  put(g, roof, 0, 1.94, -0.08);
  /* 竖招「北京路」（右前，挑出摇曳） */
  var sb = signBoard(M, 0.62); put(g, sb.g, 0.88, 1.62, zf + 0.02);
  anims.push(function (t) { sb.bd.rotation.z = sin(t * 1.2 + 0.9) * 0.045; });
  /* 灯笼 ×2（挑棚垂边下） */
  var l1 = lanternUnit(M, 0.6, 0); put(g, l1, -0.86, 0.74, 1.0);
  var l2 = lanternUnit(M, 0.6, 0); put(g, l2, 0.86, 0.74, 1.0);
  anims.push(function (t) { M.lantM.emissiveIntensity = 0.5 + 0.18 * sin(t * 2.2 + 0.7); });
  /* 铸铁路灯（右前，flicker） */
  var lp = lampPost(M, 0.72); put(g, lp, 1.02, 0.05, 0.78);
  anims.push(function (t) { M.lampGlow.emissiveIntensity = 0.5 + 0.14 * sin(t * 3.1 + 1.4); });
  /* 盆栽 */
  g.add(cyl(0.06, 0.075, 0.1, 10, M.planter, -1.08, 0.1, 0.68));
  var b3 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.grassD); put(g, b3, -1.08, 0.21, 0.68); b3.scale.y = 0.8;
  /* 窗光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.18 + 0.07 * sin(t * 1.1 + 0.6); });
  return g;
}

/* ---- lv4 地标：四层四拱骑楼总会 + 绿琉璃翘檐金冠（h≈2.85） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.4));
  var zf = 0.62;
  /* 台基 + 主体（0.10-2.44） + 阴面 */
  g.add(box(2.26, 0.1, 1.26, M.stoneD, 0, 0.05, -0.04));
  g.add(box(2.12, 2.34, 1.12, M.wallF, 0, 1.27, -0.1));
  g.add(box(2.12, 2.34, 0.02, M.wallS, 0, 1.27, -0.67));
  /* 石阶 + 门楣横匾「北京路」 */
  g.add(box(0.66, 0.06, 0.2, M.stoneD, 0, 0.13, 0.72));
  var plq = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.125),
    new THREE.MeshStandardMaterial({ map: getTex('plaqueH', texPlaqueH), roughness: 0.55, metalness: 0.08, flatShading: true }));
  put(g, plq, 0, 0.95, zf + 0.005);
  /* 骑楼廊：四拱墙 + 石柱 ×4 + 走廊板（0.10-0.82） */
  g.add(archWall(M, 2.06, 0.74, 0.07, [
    { cx: -0.78, w: 0.42, spring: 0.46 },
    { cx: -0.26, w: 0.42, spring: 0.46 },
    { cx: 0.26, w: 0.42, spring: 0.46 },
    { cx: 0.78, w: 0.42, spring: 0.46 }
  ], M.wallF, zf));
  var ci, cx;
  for (ci = 0; ci < 4; ci++) {
    cx = -0.78 + ci * 0.52;
    var cc = columnRound(M, 0.64, 0.034); put(g, cc, cx, 0.1, 0.68);
  }
  g.add(box(2.18, 0.05, 0.24, M.stoneD, 0, 0.075, 0.66));
  /* 店脸：门 + 柜面 + 货堆 ×2 */
  g.add(box(0.38, 0.48, 0.04, M.woodD, -0.26, 0.34, 0.38));
  g.add(box(0.7, 0.05, 0.1, M.wood, 0.5, 0.6, 0.38));
  g.add(box(0.3, 0.18, 0.14, M.woodD, 0.24, 0.19, 0.36));
  g.add(box(0.24, 0.14, 0.12, M.woodD, -0.78, 0.17, 0.38));
  /* 红挑棚（摇曳） */
  var aw = awningUnit(M, 1.96, 0.46, M.canvasR, 0.86, zf + 0.02);
  put(g, aw.g, 0, 0, 0);
  anims.push(function (t) { aw.val.rotation.x = sin(t * 1.3 + 1.6) * 0.04; });
  /* 层间腰线 ×3 + 转角隅石 ×8 */
  var bands = [0.835, 1.36, 1.885], bi;
  for (bi = 0; bi < bands.length; bi++) {
    g.add(box(2.18, 0.045, 0.06, M.stone, 0, bands[bi], zf + 0.01));
  }
  var qi;
  for (qi = 0; qi < 4; qi++) {
    g.add(box(0.07, 0.48, 0.03, M.wallTrim, -1.03, 1.0 + qi * 0.52, zf - 0.03));
    g.add(box(0.07, 0.48, 0.03, M.wallTrim, 1.03, 1.0 + qi * 0.52, zf - 0.03));
  }
  /* 二/三/四层百叶窗 ×12（五色轮换） */
  var idxs = [], fi, an;
  var shutColors = [1, 2, 3, 0, 4, 1, 2, 0, 3, 1, 4, 2];
  for (fi = 0; fi < 3; fi++) {
    var fy = 1.06 + fi * 0.525;
    for (an = 0; an < 4; an++) {
      idxs.push([-0.78 + an * 0.52, fy, shutColors[fi * 4 + an], fi === 2 ? 0.26 : 0.28]);
    }
  }
  for (an = 0; an < idxs.length; an++) {
    var u = idxs[an];
    var win = shutterWindow(M, u[3], u[3] * 1.1, u[2]);
    put(g, win, u[0], u[1] + u[3] / 2, zf - 0.015);
  }
  /* 四层窗下小栏板 ×4 */
  for (an = 0; an < 4; an++) {
    g.add(box(0.38, 0.05, 0.04, M.stone, -0.78 + an * 0.52, 2.02, zf + 0.005));
  }
  /* 平座（退台）：座板 + 望柱栏杆跑 ×3 + 陶罐 ×4（h 至 2.44） */
  g.add(box(1.7, 0.09, 1.06, M.stone, 0, 2.44, -0.12));
  var br1 = balustradeRun(M, 1.66); put(g, br1, 0, 2.485, zf - 0.06);
  var br2 = balustradeRun(M, 0.98); br2.rotation.y = PI / 2; put(g, br2, 0.81, 2.485, -0.12);
  var br3 = balustradeRun(M, 0.98); br3.rotation.y = PI / 2; put(g, br3, -0.81, 2.485, -0.12);
  [[-0.79, 0.4], [0.79, 0.4], [-0.79, -0.62], [0.79, -0.62]].forEach(function (q) {
    put(g, urnMini(M, 1.15), q[0], 2.485, q[1]);
  });
  /* 绿琉璃攒尖翘檐金冠（apex≈2.81 + 宝顶→2.99） */
  var crown = pyramidRoof(M, { w: 1.56, d: 0.98, h: 0.32, glaze: true, finial: true, goldTips: true });
  put(g, crown, 0, 2.485, -0.12);
  /* 金冠 glint 呼吸（finial 材质） */
  anims.push(function (t) { M.glint.emissiveIntensity = 0.15 + 0.12 * sin(t * 1.6 + 0.2); });
  /* 灯笼 ×2（挑棚垂边下）+ 铸铁路灯 + 竖招（终阶全语汇） */
  var l1 = lanternUnit(M, 0.6, 0); put(g, l1, -0.95, 0.78, 1.04);
  var l2 = lanternUnit(M, 0.6, 0); put(g, l2, 0.95, 0.78, 1.04);
  anims.push(function (t) { M.lantM.emissiveIntensity = 0.5 + 0.18 * sin(t * 2.2 + 0.7); });
  var lp = lampPost(M, 0.76); put(g, lp, 1.06, 0.05, 0.82);
  anims.push(function (t) { M.lampGlow.emissiveIntensity = 0.5 + 0.14 * sin(t * 3.1 + 1.4); });
  var sb = signBoard(M, 0.62); put(g, sb.g, -0.92, 1.66, zf + 0.02);
  anims.push(function (t) { sb.bd.rotation.z = sin(t * 1.2 + 2.1) * 0.045; });
  /* 盆栽 ×2 + 货箱 */
  g.add(cyl(0.06, 0.075, 0.1, 10, M.planter, -1.14, 0.1, 0.72));
  var b4 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.grass); put(g, b4, -1.14, 0.21, 0.72); b4.scale.y = 0.8;
  g.add(box(0.2, 0.14, 0.14, M.woodD, 0.86, 0.12, 0.86));
  /* 窗光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.18 + 0.07 * sin(t * 1.05 + 1.1); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[13] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_13_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 13;
  g.userData.level = lv;
  g.userData.region = 'g3';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
