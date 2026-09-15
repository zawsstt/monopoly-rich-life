/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_26.js  (v2 精修)
 * -------------------------------------------------------------------------------------
 * 格 26「回民街」(g6 西北食坊) 独属建筑：回坊食街四阶生长史
 * 参考图 refs/prop_26.png 高保真复刻（blockout→structure→form→material→lighting→
 * interaction→optimization）。v2 = v1 布局契约上的细节精修（不推翻轮廓/配色/生长史）。
 *
 * 风格族谱（同一块地的同一种生长）：
 *   lv1 小屋   木瓦坡顶食摊小屋 + 蓝布凉棚 + 石灶沸锅（h≈1.05）
 *   lv2 洋房   两层瓦顶堂口 + 鎏金吻角 + 檐廊 + 星月幡杆（h≈1.65）
 *   lv3 大厦   三层退台 + 层层腰檐 + 大金角 + 条纹凉棚 + 双幡（h≈2.07）
 *   lv4 地标   石台基 + 朱柱廊 + 红金拱楣 + 双层庑殿金顶 + 金塔刹（h≈2.75）
 *
 * v2 精修清偿（对照参考图逐项）：
 *   1) 翘角炭瓦：筒瓦逐垄几何条分层（前后坡各 7 垄）+ 檐口瓦当 + 垄端金帽 + 鎏金弯钩
 *      吻加垫座分层、垂脊端金套兽（lv2+）；瓦贴图升 256px 密垄
 *   2) 朱漆柱廊：正朱红柱身 + 白石鼓柱础 + 金腰箍 + 莲托柱头（lv4 带柱头斗）
 *   3) 木格暖窗：棂条加密 4×3 格 + 窗台托 + 双线脚框
 *   4) 蓝布凉棚：256px 织纹（经纬+分幅缝+褶皱）+ 波浪垂沿加密 + 垂沿金点
 *   5) 星月幡：幡面 Canvas 文字描边（金新月 + 铭文行 + 描边框）+ 双股底穗
 *   6) 灯笼：棱瓣壳贴图 + 上下收口金线 + 金盖金底 + 双股金穗
 *   7) 石灶锅具：墨锅双耳 + 蒸屉白汽座 + 白汽三团
 *   8) 摊案货筐：竹篾纹双箍筐 + 提梁 + 双层果堆 + 案面碗碟砧板分层 + 蒸笼塔
 *   9) lv1 木瓦改竖排板垄贴图 + 搏风板/悬鱼；lv4 台基条石贴图 + 前缘石栏杆
 * 动画：灯笼呼吸 / 幌幡摆 / 灶火 + 白汽升 / 暖窗呼吸（幅度克制，转角 ≤0.3rad）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[26] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤350；userData.anim=[fn(t, dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_26] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 颜色 / 材质基元（std: sRGB→Linear） ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true),
    transparent: (o.op !== undefined), opacity: (o.op !== undefined ? o.op : 1)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.side !== undefined) m.side = o.side;
  if (o.map) m.map = o.map;
  if (o.bump) { m.bumpMap = o.bump; m.bumpScale = (o.bumpScale !== undefined ? o.bumpScale : 0.012); }
  return m;
}
/* 材质缓存（同进程复用；view3d.disposeGroup 只释放 geometry，不释放材质） */
var _mc = {};
function MAT(id, make) { if (!_mc[id]) _mc[id] = make(); return _mc[id]; }
function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, rx, ry, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (rx) o.rotation.x = rx; if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}

/* ================= 1. 程序化 Canvas 纹理（≤256px，零外部资源） ================= */
function mkCanvas(w, h) {
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv;
}
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 炭青筒瓦垄 v2（256px）：密垄 + 垄缝深影 + 垄顶高光 + 陶面噪点（map+bump 同源） */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#333a45'; g.fillRect(0, 0, S, S);
  var rows = 11, rh = S / rows, cols = 8, cw = S / cols, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    for (k = 0; k < cols; k++) {                                /* 圆垄：竖向半圆瓦垄 + 错缝 */
      var x = k * cw + ((i % 2) * cw / 2);
      var grd = g.createLinearGradient(x, 0, x + cw, 0);
      grd.addColorStop(0, '#252b34'); grd.addColorStop(0.42, '#5d6678');
      grd.addColorStop(0.62, '#4a5361'); grd.addColorStop(1, '#2c323c');
      g.fillStyle = grd; g.fillRect(x, y, cw, rh);
      g.fillStyle = 'rgba(14,18,24,0.72)'; g.fillRect(x, y, 3, rh);
      g.fillStyle = 'rgba(220,232,248,0.10)'; g.fillRect(x + cw * 0.4, y, 3, rh);
      g.fillStyle = 'rgba(18,22,28,0.5)'; g.fillRect(x + cw - 2, y, 2, rh);
    }
    g.fillStyle = 'rgba(16,20,26,0.55)'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = 'rgba(210,222,240,0.06)'; g.fillRect(0, y + 1, S, 2);
  }
  for (i = 0; i < 260; i++) {                                   /* 陶面噪点（固定步进） */
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(10,14,20,0.10)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* lv1 木瓦 v2（256px）：竖排板垄（板缝平行坡向）+ 板端波浪 + 木纹明暗 */
function texShingle() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b08050'; g.fillRect(0, 0, S, S);
  var cols = 10, cw = S / cols, i, k;
  for (i = 0; i < cols; i++) {
    var x = i * cw;
    var grd = g.createLinearGradient(x, 0, x + cw, 0);
    grd.addColorStop(0, '#93683c'); grd.addColorStop(0.45, '#c2925e'); grd.addColorStop(1, '#a5794a');
    g.fillStyle = grd; g.fillRect(x, 0, cw, S);
    g.fillStyle = 'rgba(96,62,34,0.9)'; g.fillRect(x, 0, 3, S);          /* 板缝 */
    g.fillStyle = 'rgba(255,232,190,0.16)'; g.fillRect(x + cw * 0.42, 0, 2, S);
    var rows = 5, rh = S / rows;                                          /* 错缝横接 + 板端阴影 */
    for (k = 0; k < rows; k++) {
      var y = (k * rh + ((i % 2) * rh / 2)) % S;
      g.fillStyle = 'rgba(104,68,38,0.75)'; g.fillRect(x + 2, y, cw - 4, 3);
      g.fillStyle = 'rgba(255,236,200,0.10)'; g.fillRect(x + 2, y + 3, cw - 4, 2);
    }
  }
  for (i = 0; i < 180; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,240,210,0.07)' : 'rgba(80,50,26,0.08)';
    g.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 钢蓝帆布织纹 v2（256px）：经纬织纹 + 分幅竖缝 + 褶皱明暗（底色即棚色） */
function texAwning() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#6e88a0'; g.fillRect(0, 0, S, S);
  var i, k;
  for (i = 0; i < S; i += 3) {                                  /* 经纬织纹 */
    g.fillStyle = (i % 6) ? 'rgba(255,255,255,0.045)' : 'rgba(20,34,48,0.06)';
    g.fillRect(0, i, S, 1);
    g.fillStyle = 'rgba(24,40,56,0.05)';
    g.fillRect(i, 0, 1, S);
  }
  for (k = 0; k < 6; k++) {                                     /* 分幅竖缝 */
    var x = k * (S / 6);
    g.fillStyle = 'rgba(28,44,60,0.5)'; g.fillRect(x, 0, 2, S);
    g.fillStyle = 'rgba(226,238,250,0.14)'; g.fillRect(x + 2, 0, 2, S);
  }
  for (k = 0; k < 4; k++) {                                     /* 褶皱明暗 */
    var fx = S * (0.12 + k * 0.24);
    var fgd = g.createLinearGradient(fx - 18, 0, fx + 18, 0);
    fgd.addColorStop(0, 'rgba(18,32,46,0.0)');
    fgd.addColorStop(0.5, 'rgba(18,32,46,0.20)');
    fgd.addColorStop(1, 'rgba(18,32,46,0.0)');
    g.fillStyle = fgd; g.fillRect(fx - 18, 0, 36, S);
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = 'rgba(50,60,40,0.04)';
    g.fillRect((i * 29) % S, (i * 41) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 蓝白条纹棚布 v2（256px）：宽条纹 + 织纹叠加 */
function texStripe() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#ece0c4'; g.fillRect(0, 0, S, S);
  var i, k;
  g.fillStyle = '#5b7a94';
  for (i = 0; i < 4; i++) g.fillRect(i * (S / 4), 0, S / 8, S);
  g.fillStyle = 'rgba(48,68,86,0.35)';
  for (i = 0; i < 4; i++) g.fillRect(i * (S / 4) + S / 8 - 4, 0, 4, S);
  for (i = 0; i < S; i += 4) {                                  /* 织纹 */
    g.fillStyle = (i % 8) ? 'rgba(255,255,255,0.05)' : 'rgba(30,40,50,0.06)';
    g.fillRect(0, i, S, 2);
  }
  for (k = 0; k < 2; k++) {                                     /* 分幅缝 */
    var x = S * (0.33 + k * 0.34);
    g.fillStyle = 'rgba(40,52,64,0.4)'; g.fillRect(x, 0, 2, S);
  }
  return toTex(cv, true);
}
/* 青绿燕尾幡面 v2（128×256）：金新月 + 铭文行文字描边 + 描边框 + 布缝 */
function texBanner() {
  var w = 128, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#4e8877'; g.fillRect(0, 0, w, h);
  var grd = g.createLinearGradient(0, 0, w, 0);                 /* 幅面垂感 */
  grd.addColorStop(0, 'rgba(20,48,40,0.35)'); grd.addColorStop(0.5, 'rgba(20,48,40,0.0)');
  grd.addColorStop(1, 'rgba(20,48,40,0.35)');
  g.fillStyle = grd; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9a94e'; g.lineWidth = 5; g.strokeRect(7, 7, w - 14, h - 14);  /* 金描边框 */
  g.strokeStyle = 'rgba(20,40,34,0.8)'; g.lineWidth = 2; g.strokeRect(13, 13, w - 26, h - 26);
  /* 金新月（填充月牙 + 深描边） */
  g.fillStyle = '#ecd9a0';
  g.beginPath(); g.arc(w / 2, 64, 26, 0, PI * 2); g.fill();
  g.fillStyle = '#4e8877';
  g.beginPath(); g.arc(w / 2 + 11, 58, 22, 0, PI * 2); g.fill();
  g.strokeStyle = 'rgba(58,40,10,0.55)'; g.lineWidth = 2.5;
  g.beginPath(); g.arc(w / 2, 64, 26, PI * 0.62, PI * 2.25); g.stroke();
  /* 铭文行：金色字杆 + 描边（两行抽象回文） */
  var r0, c0;
  for (r0 = 0; r0 < 2; r0++) {
    var y0 = 138 + r0 * 42;
    for (c0 = 0; c0 < 5; c0++) {
      var x0 = 24 + c0 * 18;
      g.strokeStyle = 'rgba(30,50,42,0.9)'; g.lineWidth = 6;    /* 深描边 */
      g.strokeRect(x0, y0, 10, 26);
      g.fillStyle = '#e6cf8e';                                   /* 金字杆 */
      g.fillRect(x0, y0, 10, 26);
      g.fillStyle = 'rgba(90,60,16,0.85)';
      g.fillRect(x0 + 2, y0 + 8, 6, 3);
      g.fillRect(x0 + 2, y0 + 17, 6, 3);
    }
  }
  g.fillStyle = 'rgba(24,52,44,0.5)'; g.fillRect(14, h - 30, w - 28, 16);  /* 燕尾区压深 */
  var i;
  for (i = 0; i < 120; i++) {                                   /* 布面噪点 */
    g.fillStyle = (i % 2) ? 'rgba(255,255,240,0.045)' : 'rgba(10,30,24,0.07)';
    g.fillRect((i * 31) % w, (i * 67) % h, 2, 2);
  }
  g.fillStyle = 'rgba(20,44,36,0.45)';                          /* 左幅缝 */
  g.fillRect(40, 0, 2, h); g.fillRect(86, 0, 2, h);
  return toTex(cv, true);
}
/* 灯笼壳棱瓣 v2（128px）：红底竖瓣明暗 + 上下渐深 */
function texLantern() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#d84524'; g.fillRect(0, 0, S, S);
  var petals = 7, pw = S / petals, i;
  for (i = 0; i < petals; i++) {
    var x = i * pw;
    var grd = g.createLinearGradient(x, 0, x + pw, 0);
    grd.addColorStop(0, '#a83018'); grd.addColorStop(0.42, '#f2603a');
    grd.addColorStop(0.62, '#e04b28'); grd.addColorStop(1, '#9c2c16');
    g.fillStyle = grd; g.fillRect(x, 0, pw, S);
    g.fillStyle = 'rgba(96,22,8,0.75)'; g.fillRect(x, 0, 2, S);
  }
  var vg = g.createLinearGradient(0, 0, 0, S);
  vg.addColorStop(0, 'rgba(80,16,6,0.5)'); vg.addColorStop(0.25, 'rgba(80,16,6,0.0)');
  vg.addColorStop(0.75, 'rgba(80,16,6,0.0)'); vg.addColorStop(1, 'rgba(80,16,6,0.55)');
  g.fillStyle = vg; g.fillRect(0, 0, S, S);
  return toTex(cv, true);
}
/* 条石台基 v2（256px）：沙岩条石错缝 + 缝影 + 噪点 */
function texStone() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#9aa0a6'; g.fillRect(0, 0, S, S);
  var rows = 6, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = 'rgba(70,74,80,0.85)'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = 'rgba(240,244,248,0.10)'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? S / 8 : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(70,74,80,0.85)'; g.fillRect(x, y, 3, rh - 3);
      g.fillStyle = ((k + i) % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(40,44,50,0.08)';
      g.fillRect(x + 4, y + 3, S / 4 - 8, rh - 8);
    }
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(40,44,50,0.08)';
    g.fillRect((i * 53) % S, (i * 37) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 竹篾筐纹 v2（128px）：人字编条纹 */
function texWeave() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#a97e4a'; g.fillRect(0, 0, S, S);
  var i, k;
  for (k = 0; k < 8; k++) {
    for (i = 0; i < 8; i++) {
      var x = i * (S / 8), y = k * (S / 8);
      g.fillStyle = ((i + k) % 2) ? 'rgba(80,52,26,0.55)' : 'rgba(226,190,130,0.4)';
      g.beginPath();
      g.moveTo(x, y); g.lineTo(x + S / 8, y + S / 8);
      g.lineTo(x, y + S / 8); g.closePath(); g.fill();
    }
  }
  g.fillStyle = 'rgba(60,38,18,0.5)';
  for (k = 0; k <= 8; k++) g.fillRect(0, k * (S / 8) - 1, S, 2);
  return toTex(cv, true);
}
/* 深红帘幔：金边 + 金团花暗纹（保留 v1） */
function texCurtain() {
  var w = 96, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#96382a'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#7a2a1e'; g.fillRect(0, h - 14, w, 14);
  g.strokeStyle = '#d9a94e'; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6);
  g.strokeStyle = 'rgba(217,169,78,0.55)'; g.lineWidth = 2;
  g.beginPath(); g.arc(w / 2, h * 0.38, 14, 0, PI * 2); g.stroke();
  g.beginPath(); g.arc(w / 2, h * 0.38, 7, 0, PI * 2); g.stroke();
  var i;
  for (i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(40,10,6,0.08)';
    g.fillRect((i * 23) % w, (i * 47) % h, 2, 2);
  }
  return toTex(cv, true);
}
/* 灶砖：沙岩砖错缝 + 灶口煤黑（保留 v1，升 128） */
function texStove() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#a8a49a'; g.fillRect(0, 0, S, S);
  var rows = 5, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = 'rgba(90,86,76,0.85)'; g.fillRect(0, y + rh - 2, S, 2);
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillStyle = 'rgba(90,86,76,0.85)'; g.fillRect(x, y, 2, rh - 2);
      g.fillStyle = ((k + i) % 2) ? 'rgba(255,255,255,0.05)' : 'rgba(40,36,30,0.08)';
      g.fillRect(x + 3, y + 1, S / 3 - 6, rh - 5);
    }
  }
  g.fillStyle = 'rgba(20,16,14,0.5)'; g.fillRect(0, S - 12, S, 12);   /* 底部煤烟 */
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图逐区取样；v2 rough/metal 分区加细） */
function Mats() {
  return {
    roofSun:   MAT('p26roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.018, rough: 0.58 }); }),
    roofShade: MAT('p26roofShd', function () { var t = getTex('tile', texTile); return std('#96a0ae', { map: t, bump: t, bumpScale: 0.018, rough: 0.7 }); }),
    ridgeHi:   MAT('p26ridgeHi', function () { return std('#5d6a7c', { rough: 0.5 }); }),
    ridgeHiSd: MAT('p26ridgeHiSd', function () { return std('#454f5c', { rough: 0.62 }); }),
    eaveDisc:  MAT('p26eaveDisc', function () { return std('#9aa4b2', { rough: 0.62 }); }),
    ridgeDk:   MAT('p26ridgeDk', function () { return std('#23272e', { rough: 0.8 }); }),
    shingle:   MAT('p26shingle', function () { var t = getTex('shingle', texShingle); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.76 }); }),
    shingleSd: MAT('p26shingleSd', function () { var t = getTex('shingle', texShingle); return std('#b0a090', { map: t, bump: t, bumpScale: 0.014, rough: 0.84 }); }),
    plaster:   MAT('p26plaster', function () { return std('#e6d5ae', { rough: 0.92 }); }),
    timber:    MAT('p26timber', function () { return std('#6b4526', { rough: 0.82 }); }),
    timberD:   MAT('p26timberD', function () { return std('#59371e', { rough: 0.86 }); }),
    wood:      MAT('p26wood', function () { return std('#8a5a32', { rough: 0.76 }); }),
    woodHi:    MAT('p26woodHi', function () { return std('#9e6b3e', { rough: 0.68 }); }),
    lacq:      MAT('p26lacq', function () { return std('#a03622', { rough: 0.5 }); }),
    lacqBr:    MAT('p26lacqBr', function () { return std('#c24e33', { rough: 0.42 }); }),
    lacqDk:    MAT('p26lacqDk', function () { return std('#872b1c', { rough: 0.58 }); }),
    pillar:    MAT('p26pillar', function () { return std('#b0321f', { rough: 0.38 }); }),
    curtain:   MAT('p26curtain', function () { var t = getTex('curtain', texCurtain); return std('#ffffff', { map: t, rough: 0.88 }); }),
    gold:      MAT('p26gold', function () { return std('#d9a94e', { rough: 0.34, metal: 0.68 }); }),
    goldBr:    MAT('p26goldBr', function () { return std('#e8c06a', { rough: 0.26, metal: 0.78 }); }),
    awning:    MAT('p26awning', function () { return std('#6e88a0', { rough: 0.9, side: THREE.DoubleSide }); }),
    awningCv:  MAT('p26awningCv', function () { var t = getTex('awning', texAwning); return std('#ffffff', { map: t, rough: 0.94, side: THREE.DoubleSide }); }),
    stripe:    MAT('p26stripe', function () { var t = getTex('stripe', texStripe); return std('#ffffff', { map: t, rough: 0.92, side: THREE.DoubleSide }); }),
    banner:    MAT('p26bannerCv', function () { var t = getTex('banner', texBanner); return std('#ffffff', { map: t, rough: 0.9, side: THREE.DoubleSide }); }),
    crescent:  MAT('p26crescent', function () { return std('#e8d9a8', { rough: 0.5, metal: 0.2 }); }),
    bracket:   MAT('p26bracket', function () { return std('#3a708c', { rough: 0.72 }); }),
    stone:     MAT('p26stone', function () { return std('#9aa0a6', { rough: 0.9 }); }),
    stoneCv:   MAT('p26stoneCv', function () { var t = getTex('stone', texStone); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.88 }); }),
    stoneD:    MAT('p26stoneD', function () { return std('#848a90', { rough: 0.92 }); }),
    stove:     MAT('p26stove', function () { var t = getTex('stove', texStove); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.9 }); }),
    weave:     MAT('p26weave', function () { var t = getTex('weave', texWeave); return std('#ffffff', { map: t, rough: 0.88 }); }),
    pot:       MAT('p26pot', function () { return std('#262a2e', { rough: 0.62 }); }),
    grass:     MAT('p26grass', function () { return std('#92b044', { rough: 0.95 }); }),
    grassD:    MAT('p26grassD', function () { return std('#7a9638', { rough: 0.95 }); }),
    path:      MAT('p26path', function () { return std('#cbb086', { rough: 0.95 }); }),
    pathD:     MAT('p26pathD', function () { return std('#b39468', { rough: 0.96 }); }),
    fruit:     MAT('p26fruit', function () { return std('#e09633', { rough: 0.82 }); }),
    fruitR:    MAT('p26fruitR', function () { return std('#c8542e', { rough: 0.78 }); }),
    paper:     MAT('p26paper', function () { return std('#f5c96a', { rough: 0.85, emissive: '#ffcf8a', ei: 0.35 }); }),
    fire:      MAT('p26fire', function () { return std('#ff6a2a', { rough: 0.6, emissive: '#ff7a30', ei: 0.7 }); }),
    broth:     MAT('p26broth', function () { return std('#ffb84a', { rough: 0.42, emissive: '#ffb84a', ei: 0.5 }); }),
    steam:     MAT('p26steam', function () { return std('#f2f2f0', { rough: 0.98, op: 0.5, emissive: '#ffffff', ei: 0.12 }); })
  };
}
/* 灯笼红壳（棱瓣贴图，按相位分壳，呼吸动画共享） */
function lanternMat(phase) {
  return MAT('p26lant' + phase, function () {
    var t = getTex('lantern', texLantern);
    return std('#ffffff', { map: t, rough: 0.5, emissive: '#ff7a3c', ei: 0.55 });
  });
}

/* ================= 2. 预制件（回坊风格独有语汇 v2） ================= */

/* 木格棂暖窗 v2：双线脚框 + 暖光纸面 + 4×3 密棂 + 窗台托（几何花格） */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp(); g.name = 'p26lattice';
  g.add(box(w + 0.05, h + 0.05, 0.03, M.wood));
  g.add(box(w + 0.018, h + 0.018, 0.034, M.timberD, 0, 0, -0.001));
  g.add(box(w, h, 0.024, M.paper, 0, 0, 0.002));
  var cols = o.cols || 4, rows = o.rows || 3, i;
  for (i = 1; i < cols; i++) g.add(box(0.018, h, 0.03, M.wood, -w / 2 + i * (w / cols), 0, 0.008));
  for (i = 1; i < rows; i++) g.add(box(w, 0.017, 0.03, M.wood, 0, -h / 2 + i * (h / rows), 0.008));
  g.add(box(w * 0.34, 0.026, 0.032, M.timberD, 0, h * 0.33, 0.01));    /* 横披上枋 */
  g.add(box(w + 0.06, 0.03, 0.05, M.timber, 0, -h / 2 - 0.035, 0.004)); /* 窗台托 */
  return g;
}

/* 红帘幔面板：帘面 + 金边条 + 挂杆 + 杆端双球（保留 v1 + 杆饰） */
function curtainPanel(M, w, h) {
  var g = grp();
  g.add(cyl(w * 0.55, w * 0.55, 0.022, 12, M.timberD, 0, h * 0.5 + 0.015, 0)).rotation.z = PI / 2;
  put(g, sph(0.014, M.gold), w * 0.55, h * 0.5 + 0.015, 0);
  put(g, sph(0.014, M.gold), -w * 0.55, h * 0.5 + 0.015, 0);
  g.add(box(w, h, 0.018, M.curtain));
  g.add(box(w, 0.028, 0.022, M.gold, 0, h * 0.42, 0.004));
  return g;
}

/* 红灯笼 v2：金盖 + 棱瓣壳 + 上下双股金线 + 金底座 + 双股金穗（呼吸相位共享） */
function lantern(M, s, anims, phase) {
  var g = grp(); g.name = 'p26lantern'; s = s || 1;
  var bm = lanternMat(phase || 0);
  g.add(cyl(0.05 * s, 0.034 * s, 0.028 * s, 12, M.gold, 0, 0.096 * s, 0));       /* 金盖檐 */
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.85; g.add(body);      /* 棱瓣壳 */
  /* 上下收口金线（贴壳面略凸 0.002） */
  g.add(cyl(0.048 * s, 0.048 * s, 0.008 * s, 14, M.gold, 0, 0.058 * s, 0));
  g.add(cyl(0.048 * s, 0.048 * s, 0.008 * s, 14, M.gold, 0, -0.058 * s, 0));
  g.add(cyl(0.036 * s, 0.026 * s, 0.026 * s, 12, M.gold, 0, -0.088 * s, 0));     /* 金底座 */
  /* 双股金穗 */
  var t1 = mesh(new THREE.CylinderGeometry(0.003 * s, 0.001 * s, 0.055 * s, 12), M.gold);
  put(g, t1, -0.008 * s, -0.128 * s, 0);
  var t2 = mesh(new THREE.CylinderGeometry(0.003 * s, 0.001 * s, 0.055 * s, 12), M.gold);
  put(g, t2, 0.008 * s, -0.128 * s, 0);
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0) * 1.7); });
  return g;
}

/* 鎏金弯钩吻 v2：弧钩 + 分层垫座（檐角/正脊端头），参考图 signature */
function goldHook(M, s, rz) {
  var g = grp();
  g.add(box(0.05 * s, 0.035 * s, 0.05 * s, M.gold, 0, 0.012 * s, 0));            /* 垫座 */
  var arc = mesh(new THREE.TorusGeometry(0.06 * s, 0.02 * s, 8, 14, PI * 0.95), M.goldBr);
  arc.rotation.z = (rz === undefined ? 0.5 : rz); g.add(arc);
  return g;
}

/* 炭青瓦庑殿/歇山坡顶 v2：瓦面贴图 + 前后坡逐垄筒瓦条 + 檐口瓦当 + 端坡 + 端山花 +
 * 檐角鎏金弯钩（带垫座）+ 垂脊端金套兽 + 深色下楣 + 中央金饰 + 弧形金脊
 * （o.hip=false 时为悬山带山花 + 搏风板 + 悬鱼） */
function tileRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), i;
  var over = o.over !== undefined ? o.over : 0.09;
  var eaveF = d / 2 + over, eaveS = w / 2 + over;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var nR = o.ridges !== undefined ? o.ridges : 7;
  /* 前后主坡 */
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + over * 2, 0.034, lenF, M.roofSun, 0, 0, lenF / 2));
  for (i = 0; i < (o.strips || 4); i++) {                          /* 横向瓦条（暗层） */
    var u = (i + 0.5) / (o.strips || 4);
    sgF.add(box(w + over * 2 - 0.03, 0.015, 0.028, M.ridgeDk, 0, 0.025, u * eaveF));
  }
  if (nR > 0) {                                                    /* 筒瓦逐垄（凸出分层） */
    for (i = 0; i < nR; i++) {
      var rx = -w / 2 + 0.02 + (i + 0.5) * ((w - 0.04) / nR);
      var rg = cyl(0.013, 0.013, lenF * 0.84, 12, M.ridgeHi, rx, 0.04, lenF * 0.52);
      rg.rotation.x = PI / 2; rg.name = 'p26ridge'; sgF.add(rg);
      var dc = cyl(0.017, 0.017, 0.012, 12, M.eaveDisc, rx, 0.038, lenF - 0.012); /* 瓦当 */
      dc.rotation.x = PI / 2; dc.name = 'p26disc'; sgF.add(dc);
    }
  }
  sgF.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.lacqDk, 0, -0.004, eaveF));   /* 朱封檐 */
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + over * 2, 0.034, lenF, M.roofShade, 0, 0, -lenF / 2));
  if (nR > 0) {                                                    /* 背坡垄条（无瓦当） */
    for (i = 0; i < nR; i++) {
      var rx2 = -w / 2 + 0.02 + (i + 0.5) * ((w - 0.04) / nR);
      var rg2 = cyl(0.013, 0.013, lenF * 0.84, 12, M.ridgeHiSd, rx2, 0.04, -lenF * 0.52);
      rg2.rotation.x = PI / 2; rg2.name = 'p26ridge'; sgB.add(rg2);
    }
  }
  sgB.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.lacqDk, 0, -0.004, -eaveF));
  /* 端坡 + 山花（庑殿式：左右短坡自檐口向脊内收 + 垂脊端金套兽） */
  var hipW = o.hip === false ? 0 : Math.min(0.34, w * 0.3);
  if (hipW > 0.05) {
    var Rh = eaveS * 0.72;
    var pitH = Math.atan2(h, Rh);
    var lenH = Math.sqrt(Rh * Rh + h * h) + 0.02;
    var slR = grp(); slR.position.set(eaveS - Rh / 2, h / 2, 0); slR.rotation.z = -pitH; g.add(slR);
    slR.add(box(lenH, 0.03, hipW + over, M.roofShade, 0, 0, 0));
    var chR = mesh(new THREE.ConeGeometry(0.02, 0.055, 12), M.gold);
    chR.position.set(lenH / 2 - 0.02, 0.03, 0); chR.name = 'p26charm'; slR.add(chR);
    var slL = grp(); slL.position.set(-(eaveS - Rh / 2), h / 2, 0); slL.rotation.z = pitH; g.add(slL);
    slL.add(box(lenH, 0.03, hipW + over, M.roofShade, 0, 0, 0));
    var chL = mesh(new THREE.ConeGeometry(0.02, 0.055, 12), M.gold);
    chL.position.set(lenH / 2 - 0.02, 0.03, 0); chL.name = 'p26charm'; slL.add(chL);
  } else {
    /* 悬山：山花封板 + 搏风板 + 悬鱼 */
    var gs = new THREE.Shape();
    gs.moveTo(-eaveF, 0); gs.lineTo(eaveF, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
    var t1 = mesh(gg, M.plaster); t1.rotation.y = PI / 2; t1.position.set(w / 2, -0.02, -0.02); g.add(t1);
    var t2 = mesh(gg, M.plaster); t2.rotation.y = -PI / 2; t2.position.set(-w / 2 + 0.04, -0.02, 0.02); g.add(t2);
    /* 搏风板：沿山墙斜边（y-z 面）自檐口斜上至脊，悬于坡面下缘外侧 */
    var bLen = Math.sqrt(eaveF * eaveF + h * h) + 0.04, bi;
    var bAng = Math.atan2(h, eaveF);
    var bX = w / 2 + 0.07;
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (bp, k2) {
      var bf = box(0.03, 0.045, bLen, k2 < 2 ? M.woodHi : M.timber);
      put(g, bf, bp[0] * bX, h / 2 - 0.035, bp[1] * eaveF / 2, bp[1] * bAng, 0, 0);
      bf.name = 'p26barge';
    });
    for (bi = 0; bi < 2; bi++) {                                   /* 悬鱼（脊端下方菱形雕板） */
      var xy = box(0.06, 0.06, 0.014, M.wood);
      put(g, xy, (bi ? 1 : -1) * bX, h - 0.1, 0, 0, 0, PI / 4);
      xy.name = 'p26xiayu';
    }
  }
  /* 檐角鎏金弯钩 ×4（前排大、后排小；钩下垫座分层） */
  var cs = o.hookS || 1;
  [[1, 1], [-1, 1]].forEach(function (c) {
    var hk = goldHook(M, cs, -c[0] * 0.85);
    put(g, hk, c[0] * (eaveS - 0.055), 0.055, c[1] * (eaveF - 0.02));
  });
  [[1, -1], [-1, -1]].forEach(function (c) {
    var hk = goldHook(M, cs * 0.8, PI + c[0] * 0.85);
    put(g, hk, c[0] * (eaveS - 0.055), 0.055, c[1] * (eaveF - 0.02));
  });
  /* 正脊：弧形三段（浅木金）+ 深色衬脊 + 端吻 + 中央金饰 */
  var rw = w + over * 2 + 0.04;
  g.add(box(rw, 0.045, 0.075, M.ridgeDk, 0, h + 0.02, 0));
  var r1 = box(rw * 0.42, 0.05, 0.06, M.woodHi, -rw * 0.27, h + 0.06, 0); r1.rotation.z = 0.1; g.add(r1);
  var r2 = box(rw * 0.42, 0.05, 0.06, M.woodHi, rw * 0.27, h + 0.06, 0); r2.rotation.z = -0.1; g.add(r2);
  var r3 = box(rw * 0.2, 0.052, 0.062, M.woodHi, 0, h + 0.068, 0); g.add(r3);
  var f1 = box(0.055, 0.115, 0.07, M.goldBr, rw / 2 - 0.015, h + 0.09, 0); f1.rotation.z = 0.38; g.add(f1);
  var f2 = box(0.055, 0.115, 0.07, M.goldBr, -rw / 2 + 0.015, h + 0.09, 0); f2.rotation.z = -0.38; g.add(f2);
  g.add(box(0.07, 0.02, 0.08, M.gold, rw / 2 - 0.02, h + 0.036, 0));            /* 吻垫座 */
  g.add(box(0.07, 0.02, 0.08, M.gold, -rw / 2 + 0.02, h + 0.036, 0));
  if (o.crest !== false) {
    g.add(cyl(0.03, 0.038, 0.024, 12, M.gold, 0, h + 0.052, 0.0));
    put(g, sph(0.02, M.goldBr), 0, h + 0.078, 0);
  }
  return g;
}

/* 腰檐 v2：窄裙檐一圈（前后坡 + 垄条 + 两侧窄坡 + 角钩 + 檐口瓦当） */
function waistEave(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var over = o.over !== undefined ? o.over : 0.075;
  var eaveF = d / 2 + over, eaveS = w / 2 + over;
  var pitchF = Math.atan2(h, eaveF);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var nR = o.ridges !== undefined ? o.ridges : 3;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + over * 2, 0.03, lenF, M.roofSun, 0, 0, lenF / 2));
  var i;
  for (i = 0; i < nR; i++) {
    var rx = -w / 2 + 0.02 + (i + 0.5) * ((w - 0.04) / nR);
    var rg = cyl(0.012, 0.012, lenF * 0.82, 12, M.ridgeHi, rx, 0.036, lenF * 0.52);
    rg.rotation.x = PI / 2; rg.name = 'p26ridge'; sgF.add(rg);
  }
  sgF.add(box(w + over * 2 + 0.02, 0.042, 0.022, M.lacqDk, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + over * 2, 0.03, lenF, M.roofShade, 0, 0, -lenF / 2));
  var Rh2 = eaveS * 0.6;
  var pitH2 = Math.atan2(h, Rh2);
  var lenH2 = Math.sqrt(Rh2 * Rh2 + h * h) + 0.02;
  var slR = grp(); slR.position.set(eaveS - Rh2 / 2, h / 2, 0); slR.rotation.z = -pitH2; g.add(slR);
  slR.add(box(lenH2, 0.03, d + over, M.roofShade, 0, 0, 0));
  var chR = mesh(new THREE.ConeGeometry(0.017, 0.05, 12), M.gold);
  chR.position.set(lenH2 / 2 - 0.02, 0.028, 0); chR.name = 'p26charm'; slR.add(chR);
  var slL = grp(); slL.position.set(-(eaveS - Rh2 / 2), h / 2, 0); slL.rotation.z = pitH2; g.add(slL);
  slL.add(box(lenH2, 0.03, d + over, M.roofShade, 0, 0, 0));
  var chL = mesh(new THREE.ConeGeometry(0.017, 0.05, 12), M.gold);
  chL.position.set(lenH2 / 2 - 0.02, 0.028, 0); chL.name = 'p26charm'; slL.add(chL);
  [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(function (c) {
    var hk = goldHook(M, o.hookS || 0.72, -c[0] * 0.9);
    put(g, hk, c[0] * (eaveS - 0.05), 0.045, c[1] * (eaveF - 0.015));
  });
  g.add(box(w + over * 2 + 0.03, 0.035, 0.05, M.ridgeDk, 0, h + 0.012, 0));
  return g;
}

/* 金塔刹 v2（lv4 顶）：座箍 + 三球收分 + 双相轮 + 针刹 + 顶珠 */
function finialSpire(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.095 * s, 0.115 * s, 0.05 * s, 12, M.gold, 0, 0.025 * s, 0));
  g.add(cyl(0.07 * s, 0.09 * s, 0.035 * s, 12, M.goldBr, 0, 0.068 * s, 0));
  g.add(sph(0.062 * s, M.goldBr, 0, 0.14 * s, 0));
  g.add(cyl(0.048 * s, 0.048 * s, 0.014 * s, 14, M.gold, 0, 0.178 * s, 0));      /* 相轮下盘 */
  g.add(sph(0.044 * s, M.gold, 0, 0.215 * s, 0));
  g.add(cyl(0.052 * s, 0.052 * s, 0.012 * s, 14, M.gold, 0, 0.252 * s, 0));      /* 相轮上盘 */
  g.add(cyl(0.03 * s, 0.04 * s, 0.03 * s, 12, M.goldBr, 0, 0.28 * s, 0));
  g.add(mesh(new THREE.ConeGeometry(0.016 * s, 0.17 * s, 12), M.goldBr)).position.y = 0.38 * s;
  put(g, sph(0.014 * s, M.goldBr), 0, 0.472 * s, 0);
  return g;
}

/* 朱漆柱 v2：白石鼓柱础 + 金脚箍 + 正朱柱身 + 金腰箍 + 莲托柱头 + 枋头斗 */
function column(M, h, r, plinth) {
  var g = grp(); var y0 = 0;
  if (plinth) {
    g.add(box(r * 3.6, 0.05, r * 3.6, M.stone, 0, 0.025, 0));                    /* 方础 */
    g.add(cyl(r * 1.5, r * 1.7, 0.04, 12, M.stoneCv, 0, 0.07, 0));               /* 白石鼓 */
    g.add(cyl(r * 1.42, r * 1.42, 0.014, 12, M.gold, 0, 0.096, 0));              /* 金脚箍 */
    y0 = 0.104;
  } else {
    g.add(cyl(r * 1.45, r * 1.6, 0.045, 12, M.stoneCv, 0, 0.0225, 0));           /* 石础 */
    g.add(cyl(r * 1.38, r * 1.38, 0.012, 12, M.gold, 0, 0.05, 0));
    y0 = 0.056;
  }
  g.add(cyl(r, r * 1.06, h, 14, M.pillar, 0, y0 + h / 2, 0));                    /* 朱柱身 */
  g.add(cyl(r * 1.14, r * 1.14, 0.02, 14, M.gold, 0, y0 + h * 0.52, 0));         /* 金腰箍 */
  g.add(cyl(r * 1.22, r * 1.1, 0.032, 14, M.gold, 0, y0 + h - 0.006, 0));        /* 莲托柱头 */
  g.add(cyl(r * 1.16, r * 1.16, 0.022, 14, M.gold, 0, y0 + h * 0.85, 0));
  g.add(box(r * 3.1, 0.032, r * 3.1, M.lacqDk, 0, y0 + h + 0.016, 0));           /* 枋头斗 */
  return g;
}

/* 木栏杆檐廊 v2：地栿 + 望柱棂条 + 双横扶手 + 望柱头珠 */
function balustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.18, M.wood, 0, 0.02, 0.09));
  var n = Math.max(5, Math.round(w / 0.115)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.14, 0.014, M.woodHi, -w / 2 + i * (w / n), 0.105, 0.17));
    if (i === 0 || i === n) put(g, sph(0.014, M.goldBr), -w / 2 + i * (w / n), 0.2, 0.17);
  }
  g.add(box(w + 0.035, 0.026, 0.05, M.woodHi, 0, 0.185, 0.17));
  return g;
}

/* 钢蓝帆布凉棚 v2：织纹棚面（斜面）+ 金边 + 双层波浪垂沿 + 垂沿金点 + 前柱 */
function canvasAwning(M, w, o) {
  o = o || {};
  var g = grp();
  var d = o.d || 0.42, drop = o.drop || 0.2;
  var slope = Math.atan2(drop, d);
  var len = Math.sqrt(d * d + drop * drop) + 0.03;
  var clothMat = o.striped ? M.stripe : M.awningCv;
  var face = grp(); face.rotation.x = slope; g.add(face);                     /* 前低后高 */
  face.position.y = drop;
  face.add(box(w, 0.012, len, clothMat, 0, 0, len / 2));
  face.add(box(w, 0.014, len * 0.5, clothMat, 0, 0.009, len * 0.24));
  face.add(box(w, 0.02, 0.02, M.gold, 0, 0.012, len));                       /* 金边 */
  var n = Math.round(w / 0.13), i;                                           /* 波浪垂沿（加密） */
  for (i = 0; i < n; i++) {
    var sc = mesh(new THREE.CylinderGeometry(0.034, 0.034, 0.012, 12, 1, false, 0, PI), M.awningCv);
    sc.rotation.x = PI / 2; sc.rotation.z = -PI / 2;
    put(face, sc, -w / 2 + (i + 0.5) * (w / n), 0.012, len + 0.014);
    sc.name = 'p26scallop';
    if (i % 3 === 0) {                                                       /* 垂沿金点 */
      var dot = sph(0.008, M.gold, -w / 2 + (i + 0.5) * (w / n), 0.012, len + 0.024);
      face.add(dot);
    }
  }
  if (o.poles) {
    var ph = (o.frontY || 0.35) + 0.02;
    g.add(cyl(0.014, 0.014, ph, 12, M.timberD, -w / 2 + 0.06, ph / 2, d + 0.02));
    g.add(cyl(0.014, 0.014, ph, 12, M.timberD, w / 2 - 0.06, ph / 2, d + 0.02));
    put(g, sph(0.018, M.goldBr), -w / 2 + 0.06, ph + 0.008, d + 0.02);       /* 柱头金珠 */
    put(g, sph(0.018, M.goldBr), w / 2 - 0.06, ph + 0.008, d + 0.02);
  }
  return g;
}

/* 青绿燕尾新月幡 v2：杆 + 金冠球 + 燕尾幡面（文字描边贴图）+ 几何新月 + 双股底穗（摆动） */
function crescentBanner(M, h, anims, phase) {
  var g = grp();
  g.add(cyl(0.02, 0.028, 0.05, 12, M.stoneD, 0, 0.025, 0));
  g.add(cyl(0.015, 0.02, h, 12, M.timberD, 0, h / 2 + 0.05, 0));
  g.add(sph(0.024, M.goldBr, 0, h + 0.075, 0));                              /* 金冠球 */
  var swing = grp(); swing.position.set(0, h - 0.02, 0); g.add(swing);
  swing.add(box(0.28, 0.024, 0.024, M.timberD, 0.04, 0, 0));
  /* 燕尾幡面：Shape 带 V 口，UV 归一化贴文字描边纹理 */
  var wC = 0.2, hC = 0.44;
  var sh = new THREE.Shape();
  sh.moveTo(-wC / 2, 0); sh.lineTo(wC / 2, 0); sh.lineTo(wC / 2, -hC);
  sh.lineTo(0, -hC * 0.72); sh.lineTo(-wC / 2, -hC); sh.closePath();
  var cloth = mesh(new THREE.ShapeGeometry(sh), M.banner);
  cloth.material.side = THREE.DoubleSide;
  var uvA = cloth.geometry.attributes.uv, vi;
  for (vi = 0; vi < uvA.count; vi++) {
    uvA.setXY(vi, (uvA.getX(vi) + wC / 2) / wC, (uvA.getY(vi) + hC) / hC);
  }
  cloth.position.set(0.04, -0.01, 0); cloth.name = 'p26cloth'; swing.add(cloth);
  /* 金新月：圆环弧段贴面（与贴图新月错位分层，几何在前） */
  var moon = mesh(new THREE.TorusGeometry(0.05, 0.013, 8, 16, PI * 1.25), M.crescent);
  moon.rotation.z = PI * 0.72; put(swing, moon, 0.04, -hC * 0.42, 0.014);
  /* 双股底穗 */
  var s1 = mesh(new THREE.CylinderGeometry(0.004, 0.0015, 0.06, 12), M.gold);
  put(swing, s1, 0.04 - 0.05, -hC - 0.028, 0);
  var s2 = mesh(new THREE.CylinderGeometry(0.004, 0.0015, 0.06, 12), M.gold);
  put(swing, s2, 0.04 + 0.05, -hC - 0.028, 0);
  anims.push(function (t) {
    swing.rotation.y = sin(t * 1.25 + (phase || 0)) * 0.19;
    swing.rotation.z = sin(t * 1.6 + (phase || 0) * 2.0) * 0.05;
  });
  return g;
}

/* 石灶 + 墨锅双耳 + 金汤 + 蒸屉白汽座 + 白汽四团（每级必有，蒸汽动画） */
function stove(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  g.add(box(0.34 * s, 0.2 * s, 0.28 * s, M.stove, 0, 0.1 * s, 0));
  g.add(box(0.15 * s, 0.11 * s, 0.02 * s, M.pot, 0, 0.07 * s, 0.141 * s));    /* 灶口缘 */
  var fire = box(0.1 * s, 0.06 * s, 0.015 * s, M.fire, 0, 0.062 * s, 0.148 * s);
  g.add(fire);
  g.add(cyl(0.115 * s, 0.09 * s, 0.09 * s, 14, M.pot, 0, 0.245 * s, 0));      /* 墨锅 */
  var eL = mesh(new THREE.TorusGeometry(0.022 * s, 0.007 * s, 6, 12, PI), M.pot);
  put(g, eL, -0.122 * s, 0.262 * s, 0, 0, 0, 0); eL.rotation.z = -PI / 2;      /* 左耳 */
  eL.name = 'p26ear'; g.add(eL);
  var eR = mesh(new THREE.TorusGeometry(0.022 * s, 0.007 * s, 6, 12, PI), M.pot);
  put(g, eR, 0.122 * s, 0.262 * s, 0, 0, 0, 0); eR.rotation.z = PI / 2;        /* 右耳 */
  eR.name = 'p26ear'; g.add(eR);
  g.add(cyl(0.1 * s, 0.1 * s, 0.012 * s, 14, M.broth, 0, 0.288 * s, 0));      /* 金汤面 */
  g.add(cyl(0.085 * s, 0.096 * s, 0.02 * s, 14, M.timberD, 0, 0.303 * s, 0)); /* 蒸屉白汽座 */
  /* 白汽三团循环（共享蒸汽材质，从汽座升起） */
  var steam = grp(); steam.position.set(0, 0.33 * s, 0); g.add(steam);
  var puffs = [], i;
  for (i = 0; i < 3; i++) {
    var p = sph((0.028 + 0.008 * i) * s, M.steam, 0, i * 0.06 * s, 0);
    steam.add(p); puffs.push(p);
  }
  var fm = M.fire;
  anims.push(function (t) {
    fm.emissiveIntensity = 0.7 + 0.22 * sin(t * 9.3 + (phase || 0));
    var k;
    for (k = 0; k < 3; k++) {
      var ph = ((t * 0.5 + k / 3 + (phase || 0) * 0.13) % 1);
      puffs[k].position.y = ph * 0.34 * s;
      puffs[k].position.x = sin(t * 1.8 + k * 2.1) * 0.02 * s;
      puffs[k].scale.setScalar(0.6 + ph * 0.9);
    }
  });
  return g;
}

/* 食案 v2：厚面板 + 四腿 + 双耳锅/金汤 + 白瓷碟×n + 碗 + 砧板肉案 + 隔板 */
function foodTable(M, w, o) {
  o = o || {};
  var g = grp();
  g.add(box(w, 0.045, 0.3, M.woodHi, 0, 0.24, 0));
  var lx = w / 2 - 0.035;
  [[-lx, -0.1], [lx, -0.1], [-lx, 0.1], [lx, 0.1]].forEach(function (p) {
    g.add(box(0.045, 0.22, 0.045, M.timber, p[0], 0.11, p[1]));
  });
  g.add(box(w - 0.1, 0.03, 0.06, M.wood, 0, 0.17, 0));                        /* 隔板 */
  var potX = o.potX === undefined ? -w * 0.22 : o.potX;
  g.add(cyl(0.085, 0.07, 0.075, 14, M.pot, potX, 0.3, 0));
  var eL = mesh(new THREE.TorusGeometry(0.018, 0.006, 6, 12, PI), M.pot);
  put(g, eL, potX - 0.09, 0.315, 0); eL.rotation.z = -PI / 2; eL.name = 'p26ear'; g.add(eL);
  var eR = mesh(new THREE.TorusGeometry(0.018, 0.006, 6, 12, PI), M.pot);
  put(g, eR, potX + 0.09, 0.315, 0); eR.rotation.z = PI / 2; eR.name = 'p26ear'; g.add(eR);
  g.add(cyl(0.072, 0.072, 0.01, 14, M.broth, potX, 0.332, 0));
  var nPlate = o.plates === undefined ? 2 : o.plates, i;
  for (i = 0; i < nPlate; i++) {                                              /* 白瓷碟×n */
    g.add(cyl(0.04, 0.045, 0.014, 12, M.paper, w * 0.24 + i * 0.11, 0.27, sin(i * 2.4) * 0.07));
    g.add(cyl(0.026, 0.026, 0.014, 12, M.fruit, w * 0.24 + i * 0.11, 0.282, sin(i * 2.4) * 0.07));
  }
  g.add(cyl(0.042, 0.036, 0.045, 12, M.paper, w * 0.05, 0.283, 0.08));        /* 汤碗 */
  g.add(box(0.1, 0.022, 0.07, M.timber, -w * 0.05, 0.274, -0.08));            /* 砧板 */
  return g;
}

/* 货筐 v2：竹篾纹筐身 + 双箍 + 提梁 + 双层果堆（底层 3 + 顶层 2） */
function basket(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.075 * s, 0.06 * s, 0.09 * s, 12, M.weave, 0, 0.045 * s, 0));
  g.add(cyl(0.078 * s, 0.078 * s, 0.012 * s, 12, M.timberD, 0, 0.086 * s, 0)); /* 上沿箍 */
  g.add(cyl(0.07 * s, 0.07 * s, 0.01 * s, 12, M.timberD, 0, 0.045 * s, 0));    /* 中腰箍 */
  var i;
  for (i = 0; i < 3; i++) {                                                    /* 底层果 */
    g.add(sph(0.024 * s, M.fruit, sin(i * 2.1) * 0.035 * s, 0.098 * s, cos(i * 2.1) * 0.035 * s));
  }
  for (i = 0; i < 2; i++) {                                                    /* 顶层果 */
    g.add(sph(0.022 * s, M.fruitR, sin(i * 2.6 + 1.2) * 0.02 * s, 0.125 * s, cos(i * 2.6 + 1.2) * 0.02 * s));
  }
  return g;
}

/* 蒸笼塔：三层屉 + 笼盖钮（店口/案头） */
function steamStack(M, s) {
  var g = grp(); s = s || 1;
  var i;
  for (i = 0; i < 3; i++) {
    g.add(cyl(0.052 * s, 0.052 * s, 0.028 * s, 12, M.woodHi, 0, (0.014 + i * 0.03) * s, 0));
    g.add(cyl(0.053 * s, 0.053 * s, 0.005 * s, 12, M.timberD, 0, (0.03 + i * 0.03) * s, 0));
  }
  g.add(cyl(0.05 * s, 0.055 * s, 0.018 * s, 12, M.wood, 0, 0.106 * s, 0));     /* 笼盖 */
  put(g, sph(0.009 * s, M.timberD), 0, 0.12 * s, 0);                           /* 盖钮 */
  return g;
}

/* 凳 / 桶 */
function stool(M) {
  var g = grp();
  g.add(box(0.11, 0.026, 0.11, M.woodHi, 0, 0.11, 0));
  [[-0.038, -0.038], [0.038, -0.038], [-0.038, 0.038], [0.038, 0.038]].forEach(function (p) {
    g.add(box(0.024, 0.1, 0.024, M.timber, p[0], 0.05, p[1]));
  });
  return g;
}
function barrel(M) {
  var g = grp();
  g.add(cyl(0.07, 0.06, 0.14, 12, M.wood, 0, 0.07, 0));
  g.add(cyl(0.072, 0.072, 0.014, 12, M.timberD, 0, 0.045, 0));
  g.add(cyl(0.072, 0.072, 0.014, 12, M.timberD, 0, 0.105, 0));
  return g;
}

/* 灌丛 / 小树（草岛绿化） */
function bush(M, r, x, z) {
  var b = mesh(new THREE.IcosahedronGeometry(r, 0), M.grassD);
  b.position.set(x || 0, r * 0.85, z || 0); b.scale.y = 0.82; return b;
}
function tree(M, s, x, z) {
  var g = grp(); s = s || 1;
  g.position.set(x || 0, 0.03, z || 0);
  g.add(cyl(0.028 * s, 0.036 * s, 0.26 * s, 12, M.timber, 0, 0.13 * s, 0));
  var c1 = mesh(new THREE.IcosahedronGeometry(0.14 * s, 0), M.grassD); put(g, c1, 0, 0.32 * s, 0);
  var c2 = mesh(new THREE.IcosahedronGeometry(0.1 * s, 0), M.grassD); put(g, c2, 0.07 * s, 0.4 * s, 0.03 * s);
  return g;
}

/* 草岛地坪：草面 + 草沿 + 沙岩石板径 */
function padUnit(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.032, d + 0.04, M.grassD, 0, 0.015, 0));
  /* 石板径：主径两块 + 门前横板 */
  g.add(box(0.5, 0.016, 0.34, M.path, 0, 0.056, d / 2 - 0.3));
  g.add(box(0.42, 0.016, 0.3, M.pathD, 0.18, 0.056, d / 2 - 0.68));
  g.add(box(0.5, 0.016, 0.28, M.path, -0.16, 0.056, d / 2 - 1.0));
  return g;
}

/* lv4 金饰拱楣：红底金框雕花板 + 中央团窠 + 两端青金彩画板 + 垂沿 */
function goldLintel(M, w) {
  var g = grp();
  g.add(box(w, 0.16, 0.045, M.lacq, 0, 0.08, 0));
  g.add(box(w + 0.03, 0.022, 0.05, M.gold, 0, 0.155, 0));
  g.add(box(w + 0.03, 0.018, 0.05, M.gold, 0, 0.01, 0));
  var i, n = 3;
  for (i = 0; i < n; i++) {                                                   /* 鎏金卷草分隔 */
    g.add(box(0.018, 0.11, 0.052, M.gold, -w / 2 + (i + 0.5) * (w / n), 0.08, 0));
  }
  g.add(cyl(0.045, 0.045, 0.024, 14, M.goldBr, 0, 0.08, 0.028)).rotation.x = PI / 2;
  g.add(mesh(new THREE.TorusGeometry(0.027, 0.007, 6, 14), M.gold)).position.set(0, 0.08, 0.04);
  g.add(box(0.22, 0.13, 0.014, M.bracket, -w / 2 + 0.12, 0.08, 0.026));      /* 青金彩画 */
  g.add(box(0.22, 0.13, 0.014, M.bracket, w / 2 - 0.12, 0.08, 0.026));
  for (i = 0; i < 4; i++) {                                                   /* 波浪垂沿 */
    g.add(box(w / 4 - 0.02, 0.035, 0.016, M.gold, -w / 2 + (i + 0.5) * (w / 4), -0.008, 0.02));
  }
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：木瓦坡顶食摊小屋 + 蓝布凉棚 + 石灶沸锅（h≈1.05） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.2, 2.1));
  /* 灶台（左前）+ 食案（右前） */
  put(g, stove(M, 1.0, anims, 0.3), -0.52, 0.05, 0.58);
  var tb = foodTable(M, 0.78, { plates: 2 }); put(g, tb, 0.42, 0.05, 0.62);
  put(g, stool(M), 0.98, 0.05, 0.42);
  put(g, basket(M, 0.9), 0.06, 0.05, 0.92);
  /* 摊屋：条石基 + 深木框 + 奶油板墙（后半封闭） */
  g.add(box(1.28, 0.07, 0.94, M.stoneD, -0.06, 0.075, -0.16));
  g.add(box(1.2, 0.56, 0.86, M.plaster, -0.06, 0.39, -0.16));
  g.add(box(1.26, 0.05, 0.9, M.timber, -0.06, 0.695, -0.16));                 /* 檐枋 */
  [[-0.62, -0.55], [0.5, -0.55]].forEach(function (c) {
    g.add(box(0.07, 0.56, 0.07, M.timberD, c[0], 0.39, c[1]));
  });
  [[-0.62, 0.22], [0.5, 0.22]].forEach(function (c) {
    g.add(box(0.07, 0.56, 0.07, M.timberD, c[0], 0.39, c[1]));
  });
  /* 店口暖光内景：柜台 + 吊灯笼 + 腊味串 + 蒸笼塔 */
  var glow = box(1.04, 0.4, 0.1, M.paper, -0.06, 0.42, 0.2);
  g.add(glow);
  g.add(box(1.0, 0.05, 0.2, M.woodHi, -0.06, 0.3, 0.24));                     /* 柜面 */
  g.add(cyl(0.05, 0.055, 0.07, 12, M.pot, -0.3, 0.35, 0.24));
  put(g, steamStack(M, 0.8), 0.16, 0.325, 0.24);                              /* 蒸笼塔 */
  g.add(cyl(0.012, 0.012, 0.16, 12, M.fruit, -0.18, 0.52, 0.13));              /* 腊味串 */
  g.add(cyl(0.012, 0.012, 0.13, 12, M.fruit, -0.06, 0.5, 0.13));
  var ltIn = lantern(M, 0.6, anims, 2.6); put(g, ltIn, 0.34, 0.5, 0.2);
  /* 木瓦悬山顶（脊木杆翘头 + 搏风板 + 悬鱼，apex≈1.05） */
  var roof = tileRoof(M, { w: 1.14, d: 0.88, h: 0.28, strips: 0, ridges: 0, hip: false, hookS: 0.7, crest: false });
  roof.traverse(function (ch) {                                                 /* lv1 顶全树改木瓦材质 */
    if (!ch.isMesh) return;
    if (ch.material === M.roofSun) ch.material = M.shingle;
    else if (ch.material === M.roofShade) ch.material = M.shingleSd;
    else if (ch.material === M.goldBr || ch.material === M.gold) ch.material = M.woodHi;
    else if (ch.material === M.ridgeDk) ch.material = M.timberD;
    else if (ch.material === M.lacqDk) ch.material = M.timber;
  });
  var woodHookL = mesh(new THREE.TorusGeometry(0.042, 0.02, 6, 12, PI * 0.9), M.woodHi);
  put(roof, woodHookL, -0.68, 0.34, 0, 0, 0, -0.7);
  var woodHookR = mesh(new THREE.TorusGeometry(0.042, 0.02, 6, 12, PI * 0.9), M.woodHi);
  put(roof, woodHookR, 0.68, 0.34, 0, 0, 0, 0.7 + PI);
  /* 脊木杆：圆杆 + 两端雕花翘头 */
  var pole = cyl(0.03, 0.03, 1.3, 12, M.woodHi, 0, 0.335, 0); pole.rotation.z = PI / 2; roof.add(pole);
  put(g, roof, -0.06, 0.72, -0.16);
  /* 蓝布凉棚横跨店口（原点=前檐下缘，织纹 + 波浪垂沿） */
  var awn = canvasAwning(M, 1.02, { d: 0.3, drop: 0.2 });
  put(g, awn, -0.06, 0.44, 0.3);
  /* 左墙红帘幔 */
  var ct = curtainPanel(M, 0.34, 0.42); ct.rotation.y = PI / 2; put(g, ct, -0.68, 0.39, -0.16);
  /* 灯笼 ×2：檐下一 + 右柱外一 */
  var l1 = lantern(M, 0.72, anims, 0.9); put(g, l1, 0.5, 0.6, 0.34);
  var lp = cyl(0.016, 0.016, 0.5, 12, M.timberD, 0.92, 0.55, 0.5);
  g.add(lp);
  put(g, sph(0.016, M.gold), 0.92, 0.81, 0.5);                                 /* 灯杆顶金珠 */
  var l2 = lantern(M, 0.62, anims, 3.7); put(g, l2, 0.92, 0.72, 0.5);
  /* 短篱笆（左前）+ 草簇 + 奶罐 */
  var i;
  for (i = 0; i < 3; i++) g.add(box(0.032, 0.18, 0.032, M.wood, -0.9 + i * 0.15, 0.15, 0.85));
  g.add(box(0.36, 0.022, 0.028, M.timber, -0.75, 0.21, 0.85));
  g.add(bush(M, 0.07, -1.0, -0.3));
  g.add(cyl(0.05, 0.058, 0.1, 12, M.stone, 1.0, 0.1, -0.3));
  /* 暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.35 + 0.08 * sin(t * 1.05); });
  return g;
}

/* ---- lv2 洋房：两层瓦顶堂口 + 鎏金吻角 + 檐廊 + 星月幡杆（h≈1.65） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  var cx = 0.02;
  /* 主体两层：一层堂口 + 二层堂 */
  g.add(box(1.56, 0.09, 1.02, M.stoneD, cx, 0.085, -0.12));
  g.add(box(1.48, 0.56, 0.94, M.plaster, cx, 0.41, -0.12));                    /* 一层 0.13-0.69 */
  g.add(box(1.56, 0.05, 1.0, M.lacqDk, cx, 0.715, -0.12));                     /* 层间枋 */
  g.add(box(1.34, 0.48, 0.86, M.plaster, cx, 0.99, -0.14));                    /* 二层 0.74-1.23 */
  /* 一层门脸：朱柱（石础+柱头）+ 暖光店口 + 柜面 + 蒸笼 + 红帘 */
  var cL = column(M, 0.5, 0.032); put(g, cL, cx - 0.56, 0.13, 0.36);
  var cR = column(M, 0.5, 0.032); put(g, cR, cx + 0.56, 0.13, 0.36);
  var glow = box(1.0, 0.42, 0.08, M.paper, cx + 0.08, 0.42, 0.325); g.add(glow);
  g.add(box(0.98, 0.05, 0.18, M.woodHi, cx + 0.1, 0.29, 0.37));
  g.add(cyl(0.05, 0.055, 0.06, 12, M.pot, cx - 0.14, 0.335, 0.37));
  put(g, steamStack(M, 0.7), cx + 0.32, 0.315, 0.37);
  var ct = curtainPanel(M, 0.36, 0.44); put(g, ct, cx - 0.62, 0.35, 0.35);
  /* 二层：檐廊 + 暖窗 ×3（密棂）+ 角柱 */
  var bal = balustrade(M, 1.28); put(g, bal, cx, 0.74, 0.3);
  var w1 = latticeWindow(M, 0.24, 0.26, { rows: 3 }); put(g, w1, cx - 0.4, 1.0, 0.29);
  var w2 = latticeWindow(M, 0.24, 0.26, { rows: 3 }); put(g, w2, cx + 0.04, 1.0, 0.29);
  var w3 = latticeWindow(M, 0.2, 0.24, { cols: 3, rows: 3 }); put(g, w3, cx + 0.42, 1.0, 0.29);
  [[-0.63], [0.63]].forEach(function (s) {
    g.add(cyl(0.03, 0.032, 0.5, 12, M.lacqBr, cx + s[0], 0.99, 0.28));
    put(g, sph(0.034, M.goldBr), cx + s[0], 1.25, 0.28);                       /* 角柱金顶球 */
  });
  /* 炭青瓦庑殿顶 + 逐垄筒瓦 + 大金钩（apex≈1.65） */
  var roof = tileRoof(M, { w: 1.3, d: 0.98, h: 0.26, strips: 4, ridges: 7, hookS: 1.0 });
  put(g, roof, cx, 1.245, -0.12);
  /* 蓝布凉棚 + 食街（前场） */
  var awn = canvasAwning(M, 1.14, { d: 0.32, drop: 0.24, poles: true, frontY: 0.42 });
  put(g, awn, cx + 0.06, 0.42, 0.4);
  put(g, stove(M, 0.95, anims, 1.1), cx - 0.78, 0.05, 0.72);
  var tb = foodTable(M, 0.9, {}); put(g, tb, cx + 0.18, 0.05, 0.76);
  put(g, stool(M), cx + 0.86, 0.05, 0.56);
  put(g, basket(M, 1.0), cx + 0.72, 0.05, 0.95);
  put(g, barrel(M), cx - 1.02, 0.05, 0.3);
  /* 星月幡杆（右前） */
  var bn = crescentBanner(M, 1.32, anims, 0.7); put(g, bn, 1.06, 0.05, 0.42);
  /* 灯笼 ×4：檐柱 ×2 + 二层廊 ×2 */
  var l1 = lantern(M, 0.62, anims, 0.4); put(g, l1, cx - 0.78, 0.58, 0.44);
  var l2 = lantern(M, 0.62, anims, 2.2); put(g, l2, cx + 0.78, 0.58, 0.44);
  var l3 = lantern(M, 0.5, anims, 3.4); put(g, l3, cx - 0.56, 1.06, 0.3);
  var l4 = lantern(M, 0.5, anims, 4.8); put(g, l4, cx + 0.56, 1.06, 0.3);
  /* 绿化 + 草簇 */
  g.add(tree(M, 1.0, -1.12, -0.7));
  g.add(bush(M, 0.08, 1.16, -0.62));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：三层退台 + 层层腰檐 + 大金角 + 条纹凉棚 + 双幡（h≈2.07） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35));
  var cx = -0.08;
  /* 三层退台：一层 1.56 宽 → 二层 1.34 → 三层 1.12 */
  g.add(box(1.6, 0.09, 1.04, M.stoneD, cx, 0.085, -0.14));
  g.add(box(1.5, 0.5, 0.94, M.plaster, cx, 0.385, -0.14));                     /* 一层 0.13-0.635 */
  var e1 = waistEave(M, { w: 1.38, d: 0.9, h: 0.1, hookS: 0.72, ridges: 3 }); put(g, e1, cx, 0.655, -0.14);
  g.add(box(1.36, 0.42, 0.86, M.plaster, cx, 0.905, -0.16));                   /* 二层 0.695-1.115 */
  var e2 = waistEave(M, { w: 1.16, d: 0.8, h: 0.095, hookS: 0.66, ridges: 3 }); put(g, e2, cx, 1.125, -0.16);
  g.add(box(1.14, 0.42, 0.78, M.plaster, cx, 1.375, -0.18));                   /* 三层 1.165-1.585 */
  /* 一层门脸：朱柱 + 店口 + 红帘 + 凉棚 */
  var cL = column(M, 0.46, 0.03); put(g, cL, cx - 0.58, 0.13, 0.35);
  var cR = column(M, 0.46, 0.03); put(g, cR, cx + 0.58, 0.13, 0.35);
  var glow = box(1.02, 0.38, 0.08, M.paper, cx + 0.1, 0.4, 0.325); g.add(glow);
  g.add(box(1.0, 0.05, 0.18, M.woodHi, cx + 0.12, 0.27, 0.37));
  g.add(cyl(0.05, 0.055, 0.06, 12, M.pot, cx - 0.1, 0.315, 0.37));
  var ct = curtainPanel(M, 0.34, 0.42); put(g, ct, cx - 0.64, 0.34, 0.35);
  var awn = canvasAwning(M, 1.2, { d: 0.32, drop: 0.24, poles: true, frontY: 0.4 });
  put(g, awn, cx + 0.08, 0.4, 0.4);
  /* 二层/三层：栏杆檐廊 + 密棂暖窗 */
  var b2 = balustrade(M, 1.24); put(g, b2, cx, 0.7, 0.28);
  var w21 = latticeWindow(M, 0.22, 0.24, { cols: 3, rows: 3 }); put(g, w21, cx - 0.36, 0.92, 0.28);
  var w22 = latticeWindow(M, 0.22, 0.24, { cols: 3, rows: 3 }); put(g, w22, cx + 0.04, 0.92, 0.28);
  var w23 = latticeWindow(M, 0.18, 0.22, { cols: 3, rows: 3 }); put(g, w23, cx + 0.4, 0.92, 0.28);
  var b3 = balustrade(M, 1.04); put(g, b3, cx, 1.135, 0.26);
  var w31 = latticeWindow(M, 0.2, 0.22, { rows: 3 }); put(g, w31, cx - 0.24, 1.36, 0.24);
  var w32 = latticeWindow(M, 0.2, 0.22, { rows: 3 }); put(g, w32, cx + 0.16, 1.36, 0.24);
  [[-0.52], [0.52]].forEach(function (s) {
    g.add(cyl(0.028, 0.03, 0.44, 12, M.lacqBr, cx + s[0], 1.36, 0.245));
    put(g, sph(0.03, M.goldBr), cx + s[0], 1.59, 0.245);
  });
  /* 顶：炭青瓦庑殿 + 逐垄筒瓦 + 大金钩 + 金饰（apex≈2.07） */
  var roof = tileRoof(M, { w: 1.06, d: 0.9, h: 0.3, strips: 4, ridges: 7, hookS: 1.25 });
  put(g, roof, cx, 1.615, -0.18);
  /* 侧摊条纹凉棚（右前，织纹条纹） */
  var st = grp(); put(g, st, 0.98, 0.05, 0.62);
  st.add(box(0.5, 0.035, 0.3, M.woodHi, 0, 0.22, 0));
  [[-0.2, -0.1], [0.2, -0.1], [-0.2, 0.1], [0.2, 0.1]].forEach(function (p) {
    st.add(box(0.03, 0.2, 0.03, M.timber, p[0], 0.1, p[1]));
  });
  var stAwn = canvasAwning(M, 0.56, { d: 0.3, drop: 0.13, striped: true });
  put(st, stAwn, 0, 0.3, 0.04);
  var stPot = cyl(0.05, 0.055, 0.05, 12, M.pot, 0.08, 0.27, 0); st.add(stPot);
  var stE = mesh(new THREE.TorusGeometry(0.014, 0.005, 6, 12, PI), M.pot);
  put(st, stE, 0.08 - 0.055, 0.28, 0); stE.rotation.z = -PI / 2; stE.name = 'p26ear'; st.add(stE);
  var stE2 = mesh(new THREE.TorusGeometry(0.014, 0.005, 6, 12, PI), M.pot);
  put(st, stE2, 0.08 + 0.055, 0.28, 0); stE2.rotation.z = PI / 2; stE2.name = 'p26ear'; st.add(stE2);
  /* 食街：灶 + 案 + 筐凳桶 */
  put(g, stove(M, 1.0, anims, 2.2), -1.02, 0.05, 0.66);
  var tb1 = foodTable(M, 0.84, {}); put(g, tb1, cx + 0.16, 0.05, 0.78);
  put(g, stool(M), cx - 0.34, 0.05, 1.0);
  put(g, basket(M, 0.9), cx + 0.66, 0.05, 1.06);
  put(g, barrel(M), -0.94, 0.05, -0.5);
  /* 星月双幡（左右） */
  var bn1 = crescentBanner(M, 1.46, anims, 1.2); put(g, bn1, 1.08, 0.05, 0.3);
  var bn2 = crescentBanner(M, 1.3, anims, 3.3); put(g, bn2, -1.08, 0.05, -0.62);
  /* 灯笼 ×5 */
  var l1 = lantern(M, 0.58, anims, 0.6); put(g, l1, cx - 0.8, 0.56, 0.44);
  var l2 = lantern(M, 0.58, anims, 2.0); put(g, l2, cx + 0.8, 0.56, 0.44);
  var l3 = lantern(M, 0.48, anims, 3.2); put(g, l3, cx - 0.6, 1.05, 0.28);
  var l4 = lantern(M, 0.48, anims, 4.4); put(g, l4, cx + 0.6, 1.05, 0.28);
  var l5 = lantern(M, 0.44, anims, 5.6); put(g, l5, cx - 0.5, 1.5, 0.24);
  /* 绿化 */
  g.add(tree(M, 1.05, 1.04, -0.78));
  g.add(bush(M, 0.085, -1.12, -0.84));
  g.add(bush(M, 0.06, 1.14, 0.9));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.35 + 0.07 * sin(t * 1.12 + 0.9); });
  return g;
}

/* ---- lv4 地标：石台基 + 朱柱廊 + 红金拱楣 + 双层庑殿金顶 + 金塔刹（h≈2.75） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.4));
  /* 条石台基（砌缝贴图）+ 三级垂带踏步 */
  g.add(box(2.14, 0.16, 1.6, M.stoneCv, 0, 0.12, -0.08));
  g.add(box(2.22, 0.05, 1.66, M.stoneD, 0, 0.025, -0.08));
  g.add(box(0.7, 0.055, 0.18, M.stoneD, 0, 0.1975, 0.78));
  g.add(box(0.58, 0.05, 0.16, M.stoneD, 0, 0.25, 0.68));
  g.add(box(0.46, 0.045, 0.14, M.stoneD, 0, 0.3, 0.58));
  /* 台基前缘石栏杆短段 ×2（望柱 + 扶手） */
  [[-0.66], [0.66]].forEach(function (s) {
    g.add(box(0.36, 0.026, 0.05, M.stone, s[0], 0.34, 0.8));
    g.add(box(0.045, 0.1, 0.045, M.stone, s[0] - 0.15, 0.295, 0.8));
    g.add(box(0.045, 0.1, 0.045, M.stone, s[0] + 0.15, 0.295, 0.8));
  });
  /* 朱柱廊 ×4（白石鼓础 + 莲托柱头）承下檐 */
  var xs = [-0.78, -0.27, 0.27, 0.78];
  var i;
  for (i = 0; i < 4; i++) {
    var c = column(M, 0.74, 0.036, true);
    put(g, c, xs[i], 0.2, 0.52);
  }
  /* 廊内暖光 + 货台 */
  var glow = box(1.44, 0.44, 0.08, M.paper, 0, 0.5, 0.42); g.add(glow);
  g.add(box(1.34, 0.05, 0.16, M.woodHi, 0, 0.38, 0.44));
  /* 红金拱楣（入口雕花枋）+ 青金彩画 */
  var lin = goldLintel(M, 1.6); put(g, lin, 0, 0.96, 0.52);
  /* 下层庑殿金顶（金痕瓦面，apex≈1.55） */
  var r1 = tileRoof(M, { w: 1.9, d: 1.3, h: 0.27, strips: 4, ridges: 8, hookS: 1.35 });
  put(g, r1, 0, 1.16, -0.08);
  /* 金痕瓦面：坡面贴金薄片 ×4（抬升分离防 z-fight） */
  [[-0.5, 0.45], [0.1, 0.5], [-0.3, -0.42], [0.4, -0.4]].forEach(function (p, k) {
    var fl = box(0.16 + (k % 2) * 0.07, 0.006, 0.1 + (k % 3) * 0.03, M.gold);
    put(r1, fl, p[0], 0.19 - (k % 2) * 0.03, p[1], Math.atan2(0.27, 0.73) * (p[1] > 0 ? 1 : -1), 0, 0);
  });
  /* 上层朱墙殿身（收分）+ 金带 + 暖窗 ×2 + 栏杆环 */
  g.add(box(1.22, 0.58, 0.92, M.lacq, 0, 1.545, -0.08));                       /* 1.255-1.835 */
  g.add(box(1.3, 0.035, 0.98, M.gold, 0, 1.85, -0.08));
  g.add(box(1.3, 0.03, 0.98, M.gold, 0, 1.27, -0.08));
  var w41 = latticeWindow(M, 0.18, 0.2, { cols: 3, rows: 2 }); put(g, w41, -0.3, 1.56, 0.385);
  var w42 = latticeWindow(M, 0.18, 0.2, { cols: 3, rows: 2 }); put(g, w42, 0.3, 1.56, 0.385);
  var ring = balustrade(M, 1.36); put(g, ring, 0, 1.885, 0.44);
  /* 上层庑殿金顶（大金钩，apex≈2.2） */
  var r2 = tileRoof(M, { w: 1.12, d: 0.96, h: 0.32, strips: 4, ridges: 7, hookS: 1.5 });
  put(g, r2, 0, 1.87, -0.08);
  /* 金塔刹（双相轮，顶珠≈2.75） */
  var sp = finialSpire(M, 1.15); put(g, sp, 0, 2.19, -0.08);
  /* 灯笼 ×6：廊柱一排 + 上层两角 */
  var lx = [-0.78, -0.27, 0.27, 0.78];
  for (i = 0; i < 4; i++) {
    var l = lantern(M, 0.5, anims, 0.7 + i * 1.3);
    put(g, l, lx[i], 0.78, 0.56);
  }
  var lu1 = lantern(M, 0.46, anims, 4.2); put(g, lu1, -0.62, 1.82, 0.44);
  var lu2 = lantern(M, 0.46, anims, 5.3); put(g, lu2, 0.62, 1.82, 0.44);
  /* 星月双幡（台基两侧） */
  var bn1 = crescentBanner(M, 1.62, anims, 0.9); put(g, bn1, 1.08, 0.05, 0.4);
  var bn2 = crescentBanner(M, 1.5, anims, 3.1); put(g, bn2, -1.08, 0.05, 0.4);
  /* 食街全景：双灶 + 大案 + 筐桶 */
  put(g, stove(M, 1.05, anims, 0.4), -0.72, 0.05, 0.85);
  put(g, stove(M, 0.9, anims, 2.9), 0.98, 0.05, 0.62);
  var tb1 = foodTable(M, 0.9, {}); put(g, tb1, 0.14, 0.05, 0.95);
  put(g, basket(M, 1.05), 0.52, 0.05, 1.2);
  put(g, barrel(M), -1.18, 0.05, 0.14);
  /* 绿化：台基两侧小树 + 灌丛 */
  g.add(tree(M, 1.1, 1.08, -0.72));
  g.add(tree(M, 0.9, -1.12, -0.8));
  g.add(bush(M, 0.09, -1.18, 0.78));
  g.add(bush(M, 0.075, 1.16, 0.94));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.35 + 0.08 * sin(t * 1.08 + 1.4); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[26] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_26_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 26;
  g.userData.level = lv;
  g.userData.region = 'g6';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
