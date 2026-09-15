/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_24.js（v2 精修版）
 * -------------------------------------------------------------------------------------
 * 格 24「断桥烟雨」(g5 江南烟雨) 独属建筑：西湖烟雨园林水景四阶生长史
 * 视觉唯一基准 refs/prop_24.png（三视图排版取正面）。v2 = v1 精修（不推翻）：
 * 整体形态 / 配色 / 布局 / 朝向 / 导出契约全部保留，逐条清偿 v1 对照参考图的细节差距
 * （详见文末「v2 精修清单」注释）。
 *
 * 风格族谱（同一块地的同一种生长，v1 已验收）：
 *   lv1 小屋   原木水乡小筑 + 木板瓦垄顶 + 木栈桥 + 迷你水亭
 *   lv2 洋房   白墙黛瓦两层楼阁 + 木栏杆阳台 + 青白条纹布幌店口 + 石拱断桥
 *   lv3 大厦   三层楼阁起层 + 层层腰檐 + 灯串 + 木匾「断桥烟雨」+ 双层檐水亭
 *   lv4 地标   四重飞檐湖畔地标 + 鎏金匾额宝顶 + 灯笼成对 + 青幌廊街 + 烟雨迷雾
 *
 * 独有语汇（自参考图逐区采样，见 evidence_prop24/palette24b_c 记录）：
 *   白灰墙（#e8e2d0）+ 炭青瓦（#4a4c54）翘角披檐 + 暖木廊柱（#9c6a3f）+ 橙红灯笼
 *   （#df7c29 金盖）+ 湖青水面（#58b3a2→#7bcab6 涟漪）+ 石拱断桥（#b0a98d 栏板）
 *   + 水中六角亭（石台金顶）+ 垂柳睡莲 + lv4 鎏金饰（#d9a842）与烟雨雾片。
 *   与 prop_3（灰砖胡同）/prop_6（红砖洋楼）/prop_9（骑楼）无共享立面语汇。
 *
 * 导出契约：window.Props3D[24] = function (level 1..4) → Group；
 *   1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0、正面朝 +Z；
 *   高度带 lv1 0.8-1.2 / lv2 1.2-1.7 / lv3 1.7-2.3 / lv4 2.3-3.0；
 *   userData.anim = [fn(t,dt)]（灯笼呼吸/幌子摆/雾气微动，旋转 ≤0.3rad、emissive ≤0.25）。
 * 材质 MeshStandardMaterial + convertSRGBToLinear；纹理仅程序化 Canvas ≤512px；
 * 经典 script（无 import/export），THREE r147 全局；圆柱段数 ≥12、球段数 ≥16×12；
 * 种子随机仅用于纹理噪点（杜绝布局随机）。
 * 预算：每级 mesh ≤350（v2 实测见 smoke_prop24.js 输出）。
 *
 * ============================ v2 精修清单（对照参考图逐条清偿） ============================
 *  R1 断桥石拱券「分环」：v1 半圆筒实心无券 → v2 半管拱洞 + 双面环圈面 + 7 块分环券石
 *     + 阴辰石（keystone）+ 拱脚墩石 + 洞内衬暗盘（名 p24_bridge）。
 *  R2 桥栏板望柱「莲纹」：v1 素方柱 → v2 每柱柱础 + 仰莲蕾柱头（石色莲瓣），桥阶逐级。
 *  R3 炭青瓦「瓦垄逐垄」：瓦纹 Canvas 升级 256px 竖垄滚釉 + 横向错缝 + 苔点；主檐口增
 *     「瓦当排」（筒瓦头几何），lv1 木皮顶增瓦条行。
 *  R4 正脊「吻钩」：v1 斜方块吻 → v2 卷尾吻钩（锥形外撇）+ 脊端圆珠 + 大屋顶鎏金中饰。
 *  R5 白灰墙「分档 + 湿度渍痕」：Canvas 256px 增下碱水渍渐变 / 雨痕竖渍；立面增开间
 *     壁柱分档 + 檐下木枋 + 石勒脚（lv3/lv4 每层）。
 *  R6 木格窗「棂条加密」：v1 十字棂 → v2 三开三横井字棂 + 窗楣 + 石/木窗台。
 *  R7 青白条纹布幌「垂边波纹」：v1 平板 → v2 斜篷 + 前杆 + 半圆垂齿波纹边 + 随风微摆。
 *  R8 六角亭「宝顶层次 + 檐角」：v1 单珠顶 → v2 宝座 + 伞盖 + 相轮环 + 宝珠（双层檐）；
 *     檐角翘钩升级锥形勾头 + 珠，前檐挂落。
 *  R9 灯笼「金属件」：v1 光杆金盖 → v2 挂环 + 金盖翻边 + 底座托盘 + 穗子（呼吸/摆保持）。
 *  R10 烟雨迷雾「薄纱层次」：lv4 v1 三片 → v2 近水/悬浮两层四片 + 透明度呼吸（幅度克制）。
 *  R11 纹理全线 512px 上限内升级（瓦 256 / 墙 256 / 石 256 / 木皮 256 / 水 256 / 匾 512×128）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_24] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 基元（blockout 层：颜色 / 材质 / helper） ================= */
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
  if (o.side) m.side = o.side;
  if (o.opaque === false) { m.transparent = true; m.opacity = (o.opacity !== undefined ? o.opacity : 0.16); m.depthWrite = false; }
  return m;
}
/* 材质缓存（同进程复用；view3d.disposeGroup 只释放 geometry，不释放材质） */
var _mc = {};
function MAT(id, make) { if (!_mc[id]) _mc[id] = make(); return _mc[id]; }

function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) {
  var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg || 12)), mat);
  o.position.set(x || 0, y || 0, z || 0); return o;
}
function sph(r, mat, x, y, z, ws, hs) {
  var o = mesh(new THREE.SphereGeometry(r, Math.max(16, ws || 16), Math.max(12, hs || 12)), mat);
  o.position.set(x || 0, y || 0, z || 0); return o;
}
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rx, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}
/* 种子随机（仅纹理噪点/渍痕这类确定性扰动，禁止布局随机） */
function rng24(seed) {
  var s = (seed >>> 0) || 20260914;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================= 1. 程序化 Canvas 纹理（form/material 层，≤512px） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}
/* 竖向渐变（缺 createLinearGradient 的极简桩环境退化为末段平色，浏览器恒为真渐变） */
function vGrad(g, y0, y1, stops) {
  if (typeof g.createLinearGradient === 'function') {
    var gr = g.createLinearGradient(0, y0, 0, y1);
    for (var i = 0; i < stops.length; i++) gr.addColorStop(stops[i][0], stops[i][1]);
    return gr;
  }
  return stops[stops.length - 1][1];
}

/* [R3] 炭青瓦垄 256px：竖向筒瓦垄逐垄 + 横向错缝接头 + 滚釉高光 + 苔点（参考图 #4a4c54） */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng24(247);
  var i, k;
  g.fillStyle = '#4a4c54'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 8; i++) {                                  /* 竖垄：一亮一暗成对 = 筒瓦仰俯瓦 */
    var x = i * 32;
    g.fillStyle = '#54565f'; g.fillRect(x, 0, 18, S);        /* 仰瓦面 */
    g.fillStyle = '#42444e'; g.fillRect(x + 18, 0, 14, S);   /* 俯瓦面 */
    g.fillStyle = 'rgba(94,97,108,0.9)'; g.fillRect(x + 1, 0, 3, S);      /* 垄脊滚釉 */
    g.fillStyle = 'rgba(150,156,172,0.28)'; g.fillRect(x + 5, 0, 3, S);
    g.fillStyle = 'rgba(30,32,38,0.85)'; g.fillRect(x + 17, 0, 2, S);     /* 垄间深缝 */
    g.fillStyle = 'rgba(24,26,32,0.6)'; g.fillRect(x + 31, 0, 1, S);
  }
  for (i = 0; i < 6; i++) {                                  /* 横向瓦翼错缝 */
    var y = 21 + i * 42;
    g.fillStyle = 'rgba(22,24,30,0.5)'; g.fillRect(0, y, S, 2);
    g.fillStyle = 'rgba(110,116,130,0.35)'; g.fillRect(0, y + 2, S, 2);
    for (k = 0; k < 8; k++) {                                /* 接头错缝 */
      g.fillStyle = 'rgba(20,22,28,0.55)';
      g.fillRect(((k + (i % 2) * 0.5) * 32 + 8) % S, y + 2, 2, 14);
    }
  }
  for (i = 0; i < 260; i++) {                                /* 陶面噪点 */
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(18,20,26,0.09)';
    g.fillRect(R() * S, R() * S, 2, 2);
  }
  for (i = 0; i < 16; i++) {                                 /* 垄底苔点（水乡潮气） */
    g.fillStyle = 'rgba(96,116,64,' + (0.12 + R() * 0.16).toFixed(2) + ')';
    g.fillRect(R() * S, 190 + R() * 62, 2 + R() * 5, 2 + R() * 3);
  }
  return toTex(cv, true);
}
/* [R3] lv1 杉木皮瓦 256px：逐行瓦条 + 错缝 + 风雨痕（参考图 #f3cc8f/#d9a860） */
function texShake() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng24(241);
  g.fillStyle = '#d9a860'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#cf9c55' : '#e0b26c';
    g.fillRect(0, y, S, rh);
    g.fillStyle = 'rgba(255,236,190,0.25)'; g.fillRect(0, y + 1, S, 3);
    g.fillStyle = '#8a6236'; g.fillRect(0, y + rh - 4, S, 4);
    var off = (i % 2) ? rh * 0.5 : 0;
    for (k = 0; k < 5; k++) {                                /* 竖向错缝 */
      var x = (off + k * (S / 5)) % S;
      g.fillStyle = 'rgba(120,86,44,0.6)'; g.fillRect(x, y, 2, rh - 3);
      g.fillStyle = 'rgba(138,98,54,0.4)'; g.fillRect(x + 4 + ((i * 7 + k * 5) % 9), y, 2, rh - 3);
    }
  }
  for (i = 0; i < 30; i++) {                                 /* 横向风雨痕 */
    g.fillStyle = 'rgba(120,88,44,' + (0.07 + (i % 3) * 0.05) + ')';
    g.fillRect(0, R() * S, S, 2 + (i % 2));
  }
  for (i = 0; i < 60; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,240,200,0.07)' : 'rgba(96,66,32,0.08)';
    g.fillRect(R() * S, R() * S, 2, 2);
  }
  return toTex(cv, true);
}
/* 原木墙 128px：横圆木叠缝（lv1） */
function texLog() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng24(243);
  g.fillStyle = '#a97e4a'; g.fillRect(0, 0, S, S);
  var rows = 7, rh = S / rows, i;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#b2854f' : '#a1784a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#6f4e28'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = 'rgba(255,235,200,0.18)'; g.fillRect(0, y + 2, S, 3);
  }
  for (i = 0; i < 70; i++) {
    g.fillStyle = (i % 2) ? 'rgba(90,62,32,0.10)' : 'rgba(255,240,210,0.06)';
    g.fillRect(R() * S, R() * S, 3, 2);
  }
  return toTex(cv, true);
}
/* [R5] 白灰墙 256px：暖白抹灰 + 下碱湿度渍痕 + 雨痕竖渍 + 抹灰分格（参考图 #d5cbb4 阴影面） */
function texPlaster() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng24(249);
  var i;
  g.fillStyle = '#e8e2d0'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 260; i++) {                                /* 抹灰细噪 */
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.07)' : 'rgba(140,128,100,0.07)';
    g.fillRect(R() * S, R() * S, 3, 2);
  }
  for (i = 0; i < 5; i++) {                                  /* 抹灰分格浅缝 */
    g.fillStyle = 'rgba(150,140,112,0.16)';
    g.fillRect(0, 36 + i * 52, S, 1);
  }
  g.fillStyle = vGrad(g, S * 0.62, S, [                     /* 下碱湿度渍痕（江南潮气） */
    [0, 'rgba(122,124,108,0)'], [0.55, 'rgba(122,124,108,0.16)'], [1, 'rgba(104,106,92,0.30)']]);
  g.fillRect(0, S * 0.62, S, S * 0.38);
  for (i = 0; i < 9; i++) {                                  /* 竖向雨渍/水痕 */
    var x = 8 + R() * (S - 20), w2 = 3 + R() * 7, top = R() * S * 0.45;
    g.fillStyle = vGrad(g, top, S, [
      [0, 'rgba(128,130,112,0)'], [0.7, 'rgba(120,122,104,' + (0.08 + R() * 0.1).toFixed(2) + ')'],
      [1, 'rgba(104,106,92,0.22)']]);
    g.fillRect(x, top, w2, S - top);
  }
  for (i = 0; i < 12; i++) {                                 /* 霉斑 */
    g.fillStyle = 'rgba(110,116,96,' + (0.06 + R() * 0.08).toFixed(2) + ')';
    g.beginPath(); g.arc(R() * S, S * 0.72 + R() * S * 0.26, 2 + R() * 5, 0, PI * 2); g.fill();
  }
  return toTex(cv, true);
}
/* [R11] 石砌块 256px（驳坎/桥台/台阶/桥拱环面） */
function texStone() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng24(253);
  g.fillStyle = '#b0a98d'; g.fillRect(0, 0, S, S);
  var rows = 6, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = 'rgba(88,82,62,0.55)'; g.fillRect(0, y, S, 2);
    var off = (i % 2) ? rh * 0.7 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillRect(x, y, 2, rh);
      g.fillStyle = ((i + k) % 2) ? 'rgba(255,250,236,0.10)' : 'rgba(96,90,68,0.12)';
      g.fillRect(x + 3, y + 3, S / 3 - 6, rh - 6);
    }
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,252,240,0.07)' : 'rgba(84,78,60,0.09)';
    g.fillRect(R() * S, R() * S, 2, 2);
  }
  for (i = 0; i < 10; i++) {                                 /* 石缝苔 */
    g.fillStyle = 'rgba(104,120,70,0.18)';
    g.fillRect(R() * S, R() * S, 3 + R() * 6, 2);
  }
  return toTex(cv, true);
}
/* 石板路 128px：大块不规则石板 + 深缝（参考图 #afa685/#a6a887） */
function texPath() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng24(257);
  g.fillStyle = '#b0a98d'; g.fillRect(0, 0, S, S);
  var rows = 5, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillStyle = ((i + k) % 2) ? '#aaa387' : '#b6b095';
      g.fillRect(x + 1, y + 1, S / 3 - 3, rh - 3);
    }
  }
  g.fillStyle = 'rgba(90,84,64,0.55)';
  for (i = 0; i <= rows; i++) g.fillRect(0, i * rh - 1, S, 2);
  for (i = 0; i < 46; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(100,92,70,0.10)';
    g.fillRect(R() * S, R() * S, 2, 2);
  }
  return toTex(cv, true);
}
/* 湖水 256px：青绿底 + 横向波光 + 涟漪碎光（参考图 #4fa38d→#7bcab6），动画滚动 */
function texWater() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng24(263);
  var i;
  g.fillStyle = '#58b3a2'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 24; i++) {
    g.fillStyle = i % 3 ? 'rgba(123,202,182,0.5)' : 'rgba(79,163,141,0.6)';
    g.fillRect(0, (i * 11 + 5) % S, S, 4 + (i % 2) * 3);
  }
  for (i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(210,244,236,0.15)';
    g.fillRect(R() * S, R() * S, 10 + R() * 16, 2);
  }
  for (i = 0; i < 30; i++) {
    g.fillStyle = 'rgba(46,118,104,0.16)';
    g.fillRect(R() * S, R() * S, 8 + R() * 12, 3);
  }
  return toTex(cv, true);
}
/* [R7] 青白条纹布幌 256px：宽条靛青/月白 + 织纹 + 底边磨旧（参考图浅青条纹） */
function texAwning() {
  var w = 256, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d'), R = rng24(269);
  var i;
  g.fillStyle = '#eef4ef'; g.fillRect(0, 0, w, h);
  for (i = 0; i < 8; i++) {
    g.fillStyle = '#8ecfc6';
    g.fillRect(i * 32, 0, 16, h);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(i * 32 + 2, 0, 3, h);
    g.fillStyle = 'rgba(84,148,140,0.35)';
    g.fillRect(i * 32 + 14, 0, 2, h);
  }
  for (i = 0; i < 200; i++) {                                /* 织纹 */
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(100,150,142,0.06)';
    g.fillRect(R() * w, R() * h, 3, 1);
  }
  g.fillStyle = 'rgba(120,180,172,0.35)'; g.fillRect(0, h - 10, w, 10);
  return toTex(cv, true);
}
/* 木匾「断桥烟雨」512×128：深漆金边金字（lv3） */
function texPlaqueD() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#33240f'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(0,0,0,0.35)'; g.fillRect(0, h - 14, w, 14);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.strokeStyle = 'rgba(216,166,60,0.4)'; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44);
  g.fillStyle = '#e7c56a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 74px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('断 桥 烟 雨', w / 2, h / 2 + 4);
  return toTex(cv, true);
}
/* 鎏金匾「断桥烟雨」512×128：金底黑字 + 高光（lv4，参考图金匾） */
function texPlaqueG() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#c79a3e'; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,240,190,0.4)'; g.fillRect(0, 0, w, 12);
  g.fillStyle = 'rgba(110,79,28,0.5)'; g.fillRect(0, h - 12, w, 12);
  g.strokeStyle = '#6e4f1c'; g.lineWidth = 8; g.strokeRect(10, 10, w - 20, h - 20);
  g.strokeStyle = 'rgba(255,235,170,0.5)'; g.lineWidth = 2; g.strokeRect(24, 24, w - 48, h - 48);
  g.fillStyle = '#3a2a12'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 74px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('断 桥 烟 雨', w / 2, h / 2 + 4);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图逐区采样；v1 配色基调不动） */
function Mats() {
  return {
    roofLit:   MAT('p24roofLit', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.62 }); }),
    roofShd:   MAT('p24roofShd', function () { var t = getTex('tile', texTile); return std('#9aa1ad', { map: t, bump: t, bumpScale: 0.016, rough: 0.7 }); }),
    tube:      MAT('p24tube', function () { return std('#3a3c44', { rough: 0.6 }); }),
    ridge:     MAT('p24ridge', function () { return std('#2e3036', { rough: 0.8 }); }),
    shakeLit:  MAT('p24shkLit', function () { var t = getTex('shake', texShake); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.72 }); }),
    shakeShd:  MAT('p24shkShd', function () { var t = getTex('shake', texShake); return std('#c9a06a', { map: t, rough: 0.76 }); }),
    log:       MAT('p24log', function () { var t = getTex('log', texLog); return std('#ffffff', { map: t, rough: 0.8 }); }),
    logEnd:    MAT('p24logEnd', function () { return std('#b2854f', { rough: 0.8 }); }),
    plaster:   MAT('p24plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    timber:    MAT('p24timber', function () { return std('#9c6a3f', { rough: 0.7 }); }),
    timberD:   MAT('p24timberD', function () { return std('#6f4a2a', { rough: 0.78 }); }),
    stone:     MAT('p24stone', function () { return std('#b0a98d', { rough: 0.9 }); }),
    stoneT:    MAT('p24stoneT', function () { var t = getTex('stone', texStone); return std('#ffffff', { map: t, rough: 0.9 }); }),
    stoneD:    MAT('p24stoneD', function () { return std('#8f8a74', { rough: 0.92 }); }),
    stoneL:    MAT('p24stoneL', function () { return std('#c9c2a8', { rough: 0.85 }); }),
    embank:    MAT('p24embank', function () { var t = getTex('stone', texStone); return std('#c2c9b4', { map: t, rough: 0.93 }); }),
    path:      MAT('p24path', function () { var t = getTex('path', texPath); return std('#ffffff', { map: t, rough: 0.95 }); }),
    water:     MAT('p24water', function () { var t = getTex('water', texWater); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return std('#ffffff', { map: t, rough: 0.35, metal: 0.05, emissive: '#2a8a7a', ei: 0.18 }); }),
    ripple:    MAT('p24ripple', function () { return std('#d9f2ea', { rough: 0.4, opaque: false, opacity: 0.4, emissive: '#8fd8c8', ei: 0.4 }); }),
    grass:     MAT('p24grass', function () { return std('#8a9a5c', { rough: 0.95 }); }),
    grassD:    MAT('p24grassD', function () { return std('#76874c', { rough: 0.95 }); }),
    willow:    MAT('p24willow', function () { return std('#7f9c4a', { rough: 0.95 }); }),
    willowD:   MAT('p24willowD', function () { return std('#6d8a3e', { rough: 0.95 }); }),
    lily:      MAT('p24lily', function () { return std('#5da96b', { rough: 0.9 }); }),
    rock:      MAT('p24rock', function () { return std('#9aa093', { rough: 0.92 }); }),
    gold:      MAT('p24gold', function () { return std('#d9a842', { rough: 0.35, metal: 0.75 }); }),
    awning:    MAT('p24awning', function () { var t = getTex('awning', texAwning); return std('#ffffff', { map: t, rough: 0.8 }); }),
    awnA:      MAT('p24awnA', function () { return std('#8ecfc6', { rough: 0.82, side: THREE.DoubleSide }); }),
    awnB:      MAT('p24awnB', function () { return std('#eef4ef', { rough: 0.82, side: THREE.DoubleSide }); }),
    paper:     MAT('p24paper', function () { return std('#f2ead6', { rough: 0.9, emissive: '#ffd98a', ei: 0.16 }); }),
    ink:       MAT('p24ink', function () { return std('#2a2d31', { rough: 0.8 }); }),
    clay:      MAT('p24clay', function () { return std('#8a6a4a', { rough: 0.85 }); }),
    mistA:     MAT('p24mistA', function () { return std('#ffffff', { rough: 1, opaque: false, opacity: 0.13, flat: false }); }),
    mistB:     MAT('p24mistB', function () { return std('#eef4f2', { rough: 1, opaque: false, opacity: 0.10, flat: false }); })
  };
}

/* ================= 2. 预制件（风格独有语汇：structure→form 层） ================= */

/* [R6] 木格窗 v2：木框 + 暖纸 + 井字密棂（三开三横）+ 窗楣 + 窗台（8 mesh） */
function latticeWindow(M, w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.034, M.timberD));
  g.add(box(w, h, 0.03, M.paper, 0, 0, 0.004));
  g.add(box(0.024, h, 0.04, M.timber, -w / 6, 0, 0.008));
  g.add(box(0.024, h, 0.04, M.timber, w / 6, 0, 0.008));
  g.add(box(w, 0.022, 0.04, M.timber, 0, h / 6, 0.008));
  g.add(box(w, 0.022, 0.04, M.timber, 0, -h / 6, 0.008));
  g.add(box(w + 0.11, 0.026, 0.052, M.timberD, 0, -h / 2 - 0.022, 0.008));
  g.add(box(w + 0.09, 0.024, 0.042, M.timberD, 0, h / 2 + 0.02, 0.006));
  return g;
}

/* [R9] 橙红灯笼 v2：挂环 + 吊杆 + 金盖翻边 + 橙壳 + 金底托盘 + 穗（7 mesh），摇曳 + 呼吸
 * 挂点 = 组原点（悬于檐口下），壳心在挂点下 0.165s */
function lantern(M, s, anims, phase) {
  s = s || 1;
  var pid = 'p24lantB' + Math.round((phase || 0) * 3);
  var bm = MAT(pid, function () { return std('#df7c29', { rough: 0.5, emissive: '#ff8a3c', ei: 0.55 }); });
  var pivot = grp();
  pivot.add(mesh(new THREE.TorusGeometry(0.014 * s, 0.0045 * s, 8, 14), M.gold));           /* 挂环 */
  var body = grp(); body.position.y = -0.1 * s; pivot.add(body);
  body.add(cyl(0.006 * s, 0.006 * s, 0.07 * s, 12, M.timberD, 0, 0.05 * s, 0));            /* 吊杆 */
  body.add(cyl(0.034 * s, 0.048 * s, 0.03 * s, 12, M.gold, 0, 0.012 * s, 0));              /* 金盖 */
  var rim = mesh(new THREE.TorusGeometry(0.046 * s, 0.006 * s, 8, 14), M.gold);            /* 盖翻边 */
  rim.rotation.x = PI / 2; rim.position.y = -0.004 * s; body.add(rim);
  var shell = sph(0.082 * s, bm, 0, -0.065 * s, 0); shell.scale.y = 0.84; body.add(shell); /* 橙壳 */
  body.add(cyl(0.048 * s, 0.036 * s, 0.03 * s, 12, M.gold, 0, -0.146 * s, 0));             /* 金底托盘 */
  body.add(cyl(0.005 * s, 0.002 * s, 0.06 * s, 12, M.timberD, 0, -0.19 * s, 0));           /* 穗 */
  pivot.userData.isLantern = true;
  anims.push(function (t) {
    pivot.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.07;
    bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0) * 1.7);
  });
  return pivot;
}

/* 垂柳 v2：曲干 + 双团冠 + 三垂枝（6 mesh） */
function willowTree(M, s) {
  var g = grp(); s = s || 1;
  var trunk = cyl(0.024 * s, 0.042 * s, 0.3 * s, 12, M.timberD, 0, 0.15 * s, 0);
  trunk.rotation.z = 0.1; g.add(trunk);
  var top = sph(0.15 * s, M.willow, 0.02 * s, 0.36 * s, 0); top.scale.set(1.25, 0.72, 1.25); g.add(top);
  g.add(sph(0.09 * s, M.willow, -0.1 * s, 0.4 * s, 0.04 * s));
  var d1 = sph(0.08 * s, M.willowD, 0.14 * s, 0.24 * s, 0.03 * s); d1.scale.set(0.55, 1.5, 0.55); g.add(d1);
  var d2 = sph(0.07 * s, M.willowD, -0.1 * s, 0.22 * s, -0.03 * s); d2.scale.set(0.55, 1.4, 0.55); g.add(d2);
  var d3 = sph(0.06 * s, M.willowD, 0.02 * s, 0.2 * s, 0.11 * s); d3.scale.set(0.5, 1.3, 0.5); g.add(d3);
  return g;
}

/* [R8] 湖心石台六角水亭 v2：石台 + 六柱 + 六面栏杆 +（双层）攒尖瓦顶 + 层次宝顶 +
   锥形檐角勾头 + 前檐挂落（single 39 / double 46 mesh；名 p24_pav） */
function waterPavilion(M, o) {
  o = o || {};
  var s = o.s || 1, anims = o.anims, phase = o.phase || 0;
  var g = grp(); g.name = 'p24_pav';
  var deckY = 0.3 * s;
  var i;
  /* 石台 + 水中墩（砌块纹） */
  g.add(box(0.56 * s, 0.2 * s, 0.5 * s, M.stoneT, 0, 0.12 * s, 0));
  g.add(box(0.62 * s, 0.055 * s, 0.56 * s, M.stone, 0, 0.245 * s, 0));
  g.add(box(0.66 * s, 0.028 * s, 0.6 * s, M.stoneD, 0, 0.285 * s, 0));
  /* 六柱（六角布置，带柱础） */
  for (i = 0; i < 6; i++) {
    var a = i * PI / 3 + PI / 6;
    var px = cos(a) * 0.21 * s, pz = sin(a) * 0.21 * s;
    g.add(cyl(0.018 * s, 0.021 * s, 0.3 * s, 12, M.timber, px, deckY + 0.15 * s, pz));
    g.add(cyl(0.024 * s, 0.026 * s, 0.02 * s, 12, M.stoneD, px, deckY + 0.012 * s, pz));
  }
  /* 六面栏杆（坐凳楣 + 望柱 + 扶手） */
  for (i = 0; i < 6; i++) {
    var a2 = i * PI / 3;
    var qx = cos(a2 + PI / 6) * 0.21 * s, qz = sin(a2 + PI / 6) * 0.21 * s;
    var panel = box(0.2 * s, 0.085 * s, 0.018 * s, M.timberD, qx, deckY + 0.06 * s, qz);
    panel.rotation.y = -a2; g.add(panel);
    var rail = box(0.21 * s, 0.02 * s, 0.022 * s, M.timber, qx, deckY + 0.115 * s, qz);
    rail.rotation.y = -a2; g.add(rail);
  }
  /* [R8] 前檐挂落（木棂花罩：短提梁悬自檐口 + 花板 + 棂牙） */
  var baseY = deckY + 0.3 * s;
  var ks = 0.05 * s;
  var kg = grp(); kg.position.set(0, baseY + 0.015 * s, 0.295 * s); g.add(kg);
  kg.add(box(0.2 * s, 0.02 * s, 0.012 * s, M.timberD));                       /* 花板 */
  kg.add(box(0.012 * s, 0.05 * s, 0.01 * s, M.timber, -0.08 * s, 0.032 * s, 0)); /* 提梁 */
  kg.add(box(0.012 * s, 0.05 * s, 0.01 * s, M.timber, 0.08 * s, 0.032 * s, 0));
  kg.add(box(0.014 * s, ks, 0.012 * s, M.timber, -0.06 * s, -ks / 2 - 0.01 * s, 0));
  kg.add(box(0.014 * s, ks, 0.012 * s, M.timber, 0.06 * s, -ks / 2 - 0.01 * s, 0));
  kg.add(box(0.1 * s, 0.012 * s, 0.012 * s, M.timber, 0, -ks - 0.016 * s, 0));
  /* 攒尖瓦顶（单层 lv1-2 / 双层 lv3-4）+ 六角锥形勾头 + 圆珠 */
  var roofM = MAT('p24pavRoof', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.66 }); });
  var cone1 = mesh(new THREE.ConeGeometry(0.36 * s, 0.16 * s, 6), roofM);
  put(g, cone1, 0, baseY + 0.08 * s, 0, PI / 6);
  for (i = 0; i < 6; i++) {
    var a3 = i * PI / 3 + PI / 6;
    var hx = cos(a3) * 0.335 * s, hz = sin(a3) * 0.335 * s;
    var hook = mesh(new THREE.ConeGeometry(0.014 * s, 0.055 * s, 12), M.ridge);
    hook.position.set(hx, baseY + 0.035 * s, hz);
    hook.rotation.z = -cos(a3) * 1.35; hook.rotation.x = sin(a3) * 1.35;
    g.add(hook);
    g.add(sph(0.011 * s, M.ridge, cos(a3) * 0.36 * s, baseY + 0.058 * s, sin(a3) * 0.36 * s));
  }
  /* [R8] 宝顶层次 */
  if (o.double) {
    var neck = cyl(0.05 * s, 0.07 * s, 0.05 * s, 12, M.timberD, 0, baseY + 0.18 * s, 0);
    g.add(neck);
    var cone2 = mesh(new THREE.ConeGeometry(0.24 * s, 0.15 * s, 6), roofM);
    put(g, cone2, 0, baseY + 0.28 * s, 0, PI / 6);
    g.add(cyl(0.022 * s, 0.03 * s, 0.022 * s, 12, M.gold, 0, baseY + 0.365 * s, 0));       /* 宝座 */
    var umb = mesh(new THREE.ConeGeometry(0.026 * s, 0.03 * s, 12), M.gold);               /* 伞盖 */
    umb.position.y = baseY + 0.39 * s; g.add(umb);
    var ringT = mesh(new THREE.TorusGeometry(0.016 * s, 0.005 * s, 8, 14), M.gold);         /* 相轮 */
    ringT.rotation.x = PI / 2; ringT.position.y = baseY + 0.412 * s; g.add(ringT);
    g.add(sph(0.017 * s, M.gold, 0, baseY + 0.432 * s, 0));                                 /* 宝珠 */
  } else {
    g.add(cyl(0.02 * s, 0.026 * s, 0.02 * s, 12, M.gold, 0, baseY + 0.185 * s, 0));        /* 宝座 */
    g.add(sph(0.024 * s, M.gold, 0, baseY + 0.212 * s, 0));                                 /* 宝珠 */
    g.add(cyl(0.004 * s, 0.008 * s, 0.03 * s, 12, M.gold, 0, baseY + 0.245 * s, 0));       /* 顶刺 */
  }
  /* 亭柱间暖光呼吸（悬于顶下小球灯） */
  if (anims) {
    var glowM = MAT('p24pavGlow' + phase, function () { return std('#ffca7a', { rough: 0.6, emissive: '#ffb45a', ei: 0.35 }); });
    var bulb = sph(0.026 * s, glowM, 0, deckY + 0.2 * s, 0); g.add(bulb);
    anims.push(function (t) { glowM.emissiveIntensity = 0.35 + 0.12 * sin(t * 1.6 + phase * 2); });
  }
  return g;
}

/* [R1][R2] 石拱断桥 v2「分环券 + 望柱莲纹」（43 mesh；名 p24_bridge）
 * 半管拱洞（仰拱可见）+ 双面环圈面 + 7 块分环券石 + 阴辰石 + 拱脚墩石 + 洞内衬暗 +
 * 桥面四级石阶 + 两侧栏板（墙 + 3 望柱：柱础/柱身/仰莲蕾柱头 + 扶手 + 端头翘钩） */
function stoneBridge(M, o) {
  o = o || {};
  var s = o.s || 1;
  var g = grp(); g.name = 'p24_bridge';
  var cy = 0.13 * s;                                   /* 拱心高（水面以上起券） */
  var rIn = 0.15 * s, rOut = 0.27 * s;
  var i, k;
  /* 桥台（砌块纹墩石） */
  g.add(box(0.14 * s, 0.2 * s, 0.42 * s, M.stoneT, -0.37 * s, 0.12 * s, 0));
  g.add(box(0.14 * s, 0.2 * s, 0.42 * s, M.stoneT, 0.37 * s, 0.12 * s, 0));
  /* 拱脚墩石（券脚承托） */
  g.add(box(0.09 * s, 0.05 * s, 0.44 * s, M.stoneD, -0.2 * s, cy + 0.005 * s, 0));
  g.add(box(0.09 * s, 0.05 * s, 0.44 * s, M.stoneD, 0.2 * s, cy + 0.005 * s, 0));
  /* 半管拱洞（仰拱弧腹，开口朝下） */
  var pipe = new THREE.CylinderGeometry(rIn, rIn, 0.42 * s, 14, 1, true, 0, PI);
  pipe.rotateX(PI / 2); pipe.rotateZ(PI / 2);          /* 拱顶朝上、开口朝下，桥宽沿 Z */
  var soffit = mesh(pipe, M.stoneD);
  soffit.material = MAT('p24soffit', function () { return std('#8f8a74', { rough: 0.94, side: THREE.DoubleSide }); });
  soffit.position.set(0, cy, 0); g.add(soffit);
  /* 双面环圈面 + 洞内衬暗盘 */
  for (k = -1; k <= 1; k += 2) {
    var ringF = mesh(new THREE.RingGeometry(rIn, rOut, 14, 1, 0, PI),
      MAT('p24ringF', function () { return std('#a89f80', { rough: 0.92, side: THREE.DoubleSide }); }));
    ringF.position.set(0, cy, k * 0.205 * s); g.add(ringF);
  }
  var back = mesh(new THREE.CircleGeometry(rIn * 0.99, 14, 0, PI),
    MAT('p24archIn', function () { return std('#26282c', { rough: 1, side: THREE.DoubleSide }); }));
  back.position.set(0, cy, 0); g.add(back);
  /* [R1] 分环券石 ×7 + 阴辰石（放射状砌块，两端插入桥台） */
  var R2 = (rIn + rOut) / 2 + 0.005 * s;
  for (i = 0; i < 7; i++) {
    var th = PI * (0.14 + 0.72 * i / 6);
    var v = box(0.085 * s, 0.062 * s, 0.45 * s, M.stone,
      cos(th) * R2, cy + sin(th) * R2, 0);
    v.rotation.z = th; v.userData.isVoussoir = true; g.add(v);
  }
  var key = box(0.07 * s, 0.095 * s, 0.45 * s, M.stoneL, 0, cy + R2, 0);
  g.add(key);                                          /* 阴辰石（拱冠） */
  /* 桥面石阶：中央平 + 两侧逐级下坡 */
  g.add(box(0.3 * s, 0.04 * s, 0.46 * s, M.path, 0, cy + rOut + 0.035 * s, 0));
  var r1 = box(0.24 * s, 0.035 * s, 0.46 * s, M.path, -0.27 * s, cy + rOut - 0.01 * s, 0);
  r1.rotation.z = 0.34; g.add(r1);
  var r2 = box(0.24 * s, 0.035 * s, 0.46 * s, M.path, 0.27 * s, cy + rOut - 0.01 * s, 0);
  r2.rotation.z = -0.34; g.add(r2);
  var r3 = box(0.17 * s, 0.03 * s, 0.44 * s, M.path, -0.44 * s, cy + rOut - 0.09 * s, 0);
  r3.rotation.z = 0.6; g.add(r3);
  var r4 = box(0.17 * s, 0.03 * s, 0.44 * s, M.path, 0.44 * s, cy + rOut - 0.09 * s, 0);
  r4.rotation.z = -0.6; g.add(r4);
  /* [R2] 栏板 + 望柱莲纹（每侧 3 柱：柱础 + 柱身 + 仰莲蕾）+ 扶手 + 端头翘钩 */
  var railY = cy + rOut + 0.075 * s;
  for (i = -1; i <= 1; i += 2) {
    var zb = i * 0.222 * s;
    g.add(box(0.64 * s, 0.05 * s, 0.024 * s, M.stoneT, 0, railY - 0.03 * s, zb));
    g.add(box(0.72 * s, 0.02 * s, 0.032 * s, M.stone, 0, railY + 0.028 * s, zb));
    for (k = -1; k <= 1; k++) {
      var px2 = k * 0.26 * s;
      g.add(box(0.036 * s, 0.09 * s, 0.03 * s, M.stoneD, px2, railY, zb));               /* 柱身 */
      g.add(box(0.05 * s, 0.016 * s, 0.038 * s, M.stone, px2, railY - 0.052 * s, zb));   /* 柱础 */
      var bud = sph(0.017 * s, M.stoneL, px2, railY + 0.058 * s, zb);                    /* 仰莲蕾 */
      bud.scale.y = 1.3; g.add(bud);
      var cal = cyl(0.012 * s, 0.017 * s, 0.014 * s, 12, M.stoneL, px2, railY + 0.044 * s, zb); /* 莲托 */
      g.add(cal);
    }
    var cE = mesh(new THREE.ConeGeometry(0.014 * s, 0.045 * s, 12), M.stone);
    cE.position.set(-0.375 * s, railY + 0.045 * s, zb); cE.rotation.z = 0.9; g.add(cE);  /* 端头翘钩 */
    var cE2 = mesh(new THREE.ConeGeometry(0.014 * s, 0.045 * s, 12), M.stone);
    cE2.position.set(0.375 * s, railY + 0.045 * s, zb); cE2.rotation.z = -0.9; g.add(cE2);
  }
  return g;
}

/* 木栈桥（lv1 初创）：木梁 + 横板 + 双柱扶手 + 斜撑（19 mesh） */
function woodBridge(M) {
  var g = grp();
  g.add(box(0.1, 0.14, 0.4, M.stoneD, -0.5, 0.1, 0));
  g.add(box(0.1, 0.14, 0.4, M.stoneD, 0.5, 0.1, 0));
  var i;
  for (i = -1; i <= 1; i += 2) {
    g.add(box(0.92, 0.03, 0.05, M.timberD, 0, 0.19, i * 0.17));
    g.add(box(0.03, 0.14, 0.04, M.timberD, -0.4, 0.25, i * 0.17));
    g.add(box(0.03, 0.14, 0.04, M.timberD, 0.4, 0.25, i * 0.17));
    g.add(box(0.86, 0.026, 0.032, M.timber, 0, 0.33, i * 0.17));
  }
  for (i = 0; i < 7; i++) {
    g.add(box(0.1, 0.022, 0.42, M.timber, -0.42 + i * 0.14, 0.215, 0));
  }
  /* 斜撑 ×2 */
  var b1 = box(0.03, 0.16, 0.03, M.timberD, -0.44, 0.16, 0.13); b1.rotation.x = 0.6; g.add(b1);
  var b2 = box(0.03, 0.16, 0.03, M.timberD, 0.44, 0.16, -0.13); b2.rotation.x = -0.6; g.add(b2);
  return g;
}

/* [R3][R4] 白墙黛瓦双坡披檐 v2：瓦垄 Canvas + 檐口瓦当排 + 卷尾吻钩 + 脊端圆珠 +
   博风板 + 翘角（tile ≈29-33 / shake 19 mesh） */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.11;
  var g = grp(), i, k;
  var lit = o.shake ? M.shakeLit : M.roofLit;
  var shd = o.shake ? M.shakeShd : M.roofShd;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, k > 0 ? lit : shd, 0, 0, k * slopeLen / 2));
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.timberD, 0, -0.004, k * eave));
    var c1 = box(0.07, 0.05, 0.07, M.ridge, (w + over * 2) / 2 - 0.01, 0.05, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ridge, -(w + over * 2) / 2 + 0.01, 0.05, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
    if (o.shake) {                                      /* [R3] lv1 木皮瓦条行 ×2 */
      sg.add(box(w + over * 2 - 0.04, 0.012, 0.018, M.timberD, 0, 0.024, k * slopeLen * 0.42));
      sg.add(box(w + over * 2 - 0.04, 0.012, 0.018, M.timberD, 0, 0.024, k * slopeLen * 0.74));
    } else if (!o.small) {                              /* [R3] 檐口瓦当排（筒瓦头 ×6） */
      for (i = 0; i < 6; i++) {
        var tx = -(w + over * 2) * 0.4 + i * (w + over * 2) * 0.16;
        sg.add(cyl(0.014, 0.014, 0.034, 12, M.tube, tx, -0.032, k * (eave - 0.012)));
      }
    }
  }
  if (o.gable !== false) {                              /* 山墙封板 + [R3] 博风板 */
    var gm = o.shake ? M.shakeLit : M.plaster;
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
    var t1 = mesh(gg, gm); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.0225); g.add(t1);
    var t2 = mesh(gg, gm); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.0225); g.add(t2);
    if (!o.small) {                                     /* 博风板 ×4（沿坡向，贴山墙边） */
      var rk = Math.atan2(h, eave), rl2 = Math.sqrt(eave * eave + h * h) + 0.02;
      for (k = -1; k <= 1; k += 2) {
        for (var zz = -1; zz <= 1; zz += 2) {
          var rb = box(0.022, 0.05, rl2, M.timberD,
            k * (w / 2 - 0.008), h / 2 - 0.012, zz * eave / 2);
          rb.rotation.x = zz > 0 ? rk : -rk;
          g.add(rb);
        }
      }
    }
  }
  if (o.shake) {                                        /* lv1 圆木正脊 */
    var rl = (w + over * 2 + 0.06);
    var lg = mesh(new THREE.CylinderGeometry(0.045, 0.045, rl, 12), M.logEnd);
    lg.rotation.z = PI / 2; lg.position.set(0, h + 0.045, 0); g.add(lg);
    g.add(sph(0.048, M.logEnd, -rl / 2, h + 0.045, 0));
    g.add(sph(0.048, M.logEnd, rl / 2, h + 0.045, 0));
  } else if (o.ridge !== false) {                       /* [R4] 黑瓦正脊 + 卷尾吻钩 + 圆珠 */
    var rw = o.ridgeW || (w + over * 2 + 0.04);
    g.add(box(rw, 0.06 + (o.big ? 0.02 : 0), 0.09, M.ridge, 0, h + 0.03, 0));
    var hh = o.big ? 0.12 : 0.085, hy = o.big ? 0.095 : 0.078;
    for (k = -1; k <= 1; k += 2) {
      var f1 = mesh(new THREE.ConeGeometry(0.028, hh, 12), M.ridge);
      f1.position.set(k * (rw / 2 - 0.004), h + hy, 0);
      f1.rotation.z = k * -2.25; g.add(f1);             /* 卷尾吻钩外撇 */
      g.add(sph(0.016, M.ridge, k * (rw / 2 + 0.024), h + hy + hh * 0.42, 0));
      if (o.big) g.add(sph(0.013, M.gold, k * (rw / 2 + 0.024), h + hy + hh * 0.42 + 0.018, 0));
    }
    if (o.big) {                                        /* 鎏金中饰 */
      g.add(box(0.16, 0.05, 0.1, M.ridge, 0, h + 0.062, 0));
      put(g, sph(0.024, M.gold), 0, h + 0.105, 0);
    }
  }
  return g;
}

/* 腰檐环（lv3/lv4 层间披檐）v2：四坡浅檐 + 四角翘钩 + 前檐瓦当排 ×5（13/9 mesh） */
function eaveRing(M, w, d, rise, lifts) {
  var g = grp();
  var ow = 0.14, slope = Math.sqrt(rise * rise + ow * ow) + 0.01;
  var angW = Math.atan2(rise, ow);
  var f1 = box(w + ow * 2, 0.03, slope, M.roofLit, 0, rise / 2, d / 2 + ow / 2);
  f1.rotation.x = angW; g.add(f1);
  var f2 = box(w + ow * 2, 0.03, slope, M.roofShd, 0, rise / 2, -d / 2 - ow / 2);
  f2.rotation.x = -angW; g.add(f2);
  var s1 = box(slope, 0.03, d * 0.7, M.roofShd, w / 2 + ow / 2, rise / 2, 0);
  s1.rotation.z = -angW; g.add(s1);
  var s2 = box(slope, 0.03, d * 0.7, M.roofShd, -w / 2 - ow / 2, rise / 2, 0);
  s2.rotation.z = angW; g.add(s2);
  var i;
  for (i = 0; i < 5; i++) {                             /* 前檐瓦当排 */
    g.add(cyl(0.013, 0.013, 0.03, 12, M.tube, -w * 0.4 + i * w * 0.2, -0.02, d / 2 + ow - 0.012));
  }
  if (lifts !== false) {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
      var lift = box(0.05, 0.035, 0.05, M.ridge, c[0] * (w / 2 + ow - 0.02), 0.035, c[1] * (d / 2 + ow - 0.02));
      lift.rotation.z = -c[0] * 0.55; g.add(lift);
    });
  }
  return g;
}

/* 木栏杆阳台 v2：地栿 + 6 栏条 + 中枋 + 扶手（9 mesh） */
function balcony(M, w) {
  var g = grp();
  g.add(box(w, 0.035, 0.18, M.timberD, 0, 0, 0.09));
  var n = 5, i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.13, 0.014, M.timber, -w / 2 + i * (w / n), 0.082, 0.168));
  }
  g.add(box(w + 0.04, 0.026, 0.03, M.timberD, 0, 0.158, 0.168));
  g.add(box(w + 0.04, 0.014, 0.022, M.timber, 0, 0.1, 0.172));   /* 中枋 */
  return g;
}

/* 匾额：深漆金字（lv3）/ 鎏金黑字（lv4），挂在楼阁层间（3 mesh；名 p24_plaque） */
function plaque(M, gold, w, h, anims, phase) {
  var g = grp(); g.name = 'p24_plaque';
  var mat;
  if (gold) {
    mat = new THREE.MeshStandardMaterial({ map: getTex('plaqueG', texPlaqueG), roughness: 0.42, metalness: 0.35, flatShading: true });
    g.add(box(w + 0.04, h + 0.04, 0.03, M.gold));
  } else {
    mat = new THREE.MeshStandardMaterial({ map: getTex('plaqueD', texPlaqueD), roughness: 0.6, metalness: 0.05, flatShading: true });
    g.add(box(w + 0.04, h + 0.04, 0.03, M.timberD));
  }
  var face = mesh(new THREE.PlaneGeometry(w, h), mat);
  face.position.z = 0.03; g.add(face);
  if (anims) {
    var em = gold ? '#ffdf8a' : '#e7c56a';
    var glowM = MAT('p24plq' + phase, function () { return std('#000000', { rough: 0.5, emissive: em, ei: 0.0 }); });
    var halo = mesh(new THREE.PlaneGeometry(w * 1.02, h * 1.05), glowM);
    halo.position.z = 0.008; g.add(halo);
    anims.push(function (t) { glowM.emissiveIntensity = 0.05 + 0.05 * sin(t * 0.9 + (phase || 0)); });
  }
  return g;
}

/* [R7] 青白条纹布幌 v2：斜篷 + 前杆 + 半圆垂齿波纹垂边 + 微风摆（7 mesh；名 p24_awn） */
function clothAwning(M, w, o) {
  o = o || {};
  var anims = o.anims, phase = o.phase || 0, n = o.sc || 5;
  var g = grp(); g.name = 'p24_awn';
  var slope = box(w, 0.016, 0.3, M.awning, 0, 0.05, 0.13);
  slope.rotation.x = 0.42; g.add(slope);
  var rodY = 0.05 - sin(0.42) * 0.3, rodZ = 0.13 + cos(0.42) * 0.3;
  var rod = cyl(0.008, 0.008, w + 0.06, 12, M.timberD, 0, rodY + 0.012, rodZ);
  rod.rotation.z = PI / 2; g.add(rod);
  var i;
  for (i = 0; i < n; i++) {
    var sc = mesh(new THREE.CircleGeometry(0.021, 12, PI, PI), (i % 2) ? M.awnB : M.awnA);
    sc.position.set(-w / 2 + (i + 0.5) * (w / n), rodY - 0.008, rodZ);
    g.add(sc);
  }
  if (anims) {                                          /* 幌子摆（幅度克制 ≤0.03rad） */
    anims.push(function (t) {
      g.rotation.z = sin(t * 0.9 + phase) * 0.025;
      g.rotation.x = 0; /* 基线回零（风摆仅绕挂轴） */
    });
  }
  return g;
}

/* ================= 3. 岛屿地坪（同一块地：水环 + 草台 + 石驳 + 小径） ================= */
function islandPad(M, anims, lv) {
  var g = grp();
  /* 湖面（涟漪纹理滚动） */
  var water = box(2.56, 0.05, 2.56, M.water, 0, 0.025, 0);
  water.castShadow = false; g.add(water);
  var wt = M.water.map;
  if (wt) anims.push(function (t) { wt.offset.y = (t * 0.018) % 1; wt.offset.x = sin(t * 0.11) * 0.02; });
  /* 涟漪光环（桥畔扩散，幅度克制） */
  var ring = mesh(new THREE.TorusGeometry(0.13, 0.011, 8, 22), M.ripple);
  ring.rotation.x = PI / 2; ring.position.set(-0.5, 0.062, 0.82); g.add(ring);
  anims.push(function (t) {
    var k = (t * 0.45) % 1;
    var sc = 1 + k * 1.6;
    ring.scale.set(sc, sc, 1);
    M.ripple.opacity = 0.38 * (1 - k);
  });
  /* 草台主体 + 石驳坎（island A：后半；v2 驳坎带砌块纹） */
  g.add(box(2.16, 0.1, 1.74, M.embank, -0.12, 0.05, -0.32));
  g.add(box(2.1, 0.09, 1.68, M.grass, -0.12, 0.125, -0.32));
  /* 前左草舌（桥堍） */
  g.add(box(0.78, 0.1, 0.8, M.embank, -0.68, 0.05, 0.5));
  g.add(box(0.72, 0.09, 0.74, M.grass, -0.68, 0.125, 0.5));
  /* 石驳压顶沿（前 + 右） */
  g.add(box(2.14, 0.035, 0.075, M.stoneD, -0.12, 0.185, 0.52));
  g.add(box(0.075, 0.035, 1.7, M.stoneD, 0.99, 0.185, -0.33));
  /* 石板小径（桥堍 → 门前） */
  var p1 = box(0.36, 0.02, 0.26, M.path, -0.5, 0.185, 0.3); p1.rotation.y = 0.5; g.add(p1);
  var p2 = box(0.34, 0.02, 0.26, M.path, -0.33, 0.185, 0.1); p2.rotation.y = 0.35; g.add(p2);
  var p3 = box(0.34, 0.02, 0.26, M.path, -0.2, 0.185, -0.08); p3.rotation.y = 0.2; g.add(p3);
  if (lv >= 2) {                                        /* v2：径上补石 ×2（lv2+） */
    var p4 = box(0.3, 0.02, 0.24, M.path, -0.62, 0.185, 0.46); p4.rotation.y = 0.6; g.add(p4);
    var p5 = box(0.28, 0.02, 0.22, M.path, -0.1, 0.185, -0.22); p5.rotation.y = 0.1; g.add(p5);
  }
  if (lv >= 3) {                                        /* lv3+ 门前石板广场 + 垂带踏步 */
    g.add(box(1.04, 0.022, 0.5, M.path, -0.14, 0.186, 0.24));
    g.add(box(0.66, 0.05, 0.14, M.stoneT, -0.14, 0.2, 0.5));
    g.add(box(0.5, 0.045, 0.12, M.stoneT, -0.14, 0.245, 0.42));
  }
  /* 湖石 + 睡莲（v2：一朵莲蕊） */
  var rk1 = mesh(new THREE.DodecahedronGeometry(0.07, 0), M.rock); put(g, rk1, 1.0, 0.068, 0.85);
  var rk2 = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.rock); put(g, rk2, 0.78, 0.058, 1.02);
  var rk3 = mesh(new THREE.DodecahedronGeometry(0.055, 0), M.rock); put(g, rk3, -1.02, 0.068, -0.95);
  var i;
  for (i = 0; i < 3; i++) {
    var lp = cyl(0.05, 0.05, 0.008, 12, M.lily, 0.32 + i * 0.17, 0.058, 0.95 - i * 0.13);
    lp.castShadow = false; g.add(lp);
  }
  g.add(sph(0.014, M.awning, 0.49, 0.068, 0.82));       /* 莲蕊（月白点翠） */
  /* 双柳（左后 + 右后） */
  put(g, willowTree(M, 1.05), -0.92, 0.17, -0.72);
  put(g, willowTree(M, 0.85), 0.8, 0.17, -0.8);
  if (lv >= 4) put(g, willowTree(M, 0.7), 1.0, 0.17, -0.2);
  return g;
}

/* ================= 4. 四阶生长（blockout→structure→form→interaction） ================= */

/* ---- lv1 小屋：原木水乡小筑 + 木皮顶 + 木栈桥 + 迷你水亭（apex≈1.11） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(islandPad(M, anims, 1));
  var y0 = 0.17;
  /* 石脚 + 原木墙 */
  g.add(box(1.04, 0.05, 0.84, M.stoneD, -0.12, y0 + 0.025, -0.34));
  g.add(box(0.98, 0.5, 0.76, M.log, -0.12, y0 + 0.3, -0.34));           /* 0.22-0.72 */
  /* 转角圆木柱 + 出头 */
  [[-0.61, -0.71], [0.37, -0.71], [-0.61, 0.04], [0.37, 0.04]].forEach(function (c) {
    g.add(cyl(0.035, 0.035, 0.56, 12, M.logEnd, c[0], y0 + 0.31, c[1]));
  });
  /* 门（偏左，深洞口）+ 木格窗（右，v2 井字密棂） */
  g.add(box(0.3, 0.4, 0.026, M.timberD, -0.3, y0 + 0.22, 0.038));
  g.add(box(0.24, 0.34, 0.034, M.ink, -0.3, y0 + 0.19, 0.04));
  var win = latticeWindow(M, 0.2, 0.18); put(g, win, 0.16, y0 + 0.33, 0.04);
  /* 门廊：地栿 + 双柱 + 三栏条 + 石阶 */
  g.add(box(0.46, 0.04, 0.24, M.timberD, -0.3, y0 + 0.07, 0.17));
  g.add(cyl(0.018, 0.02, 0.3, 12, M.timber, -0.5, y0 + 0.24, 0.26));
  g.add(cyl(0.018, 0.02, 0.3, 12, M.timber, -0.1, y0 + 0.24, 0.26));
  g.add(box(0.44, 0.026, 0.03, M.timber, -0.3, y0 + 0.4, 0.26));
  var bi;
  for (bi = 0; bi < 3; bi++) g.add(box(0.018, 0.1, 0.014, M.timber, -0.44 + bi * 0.14, y0 + 0.33, 0.26));
  g.add(box(0.32, 0.045, 0.14, M.stoneD, -0.3, y0 + 0.115, 0.34));
  /* 木皮双坡顶 + 圆木正脊 + [R3] 瓦条行（apex≈1.07） */
  var roof = tileRoof(M, { w: 1.0, d: 0.8, h: 0.3, over: 0.12, shake: true });
  put(g, roof, -0.12, y0 + 0.55, -0.34);
  /* 陶罐 ×2 + 柴堆 */
  g.add(cyl(0.055, 0.065, 0.13, 12, M.clay, 0.52, y0 + 0.09, 0.12));
  g.add(cyl(0.04, 0.05, 0.1, 12, M.clay, 0.62, y0 + 0.075, 0.0));
  var logP = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 12), M.timberD);
  logP.rotation.x = PI / 2; logP.position.set(0.56, y0 + 0.2, -0.62); g.add(logP);
  /* 木栈桥（前左，跨水） */
  var wb = woodBridge(M); put(g, wb, -0.7, 0.02, 0.62, 0.7);
  /* 迷你水亭（右前水中，v2 宝座+宝珠顶刺） */
  var pav = waterPavilion(M, { s: 0.78, anims: anims, phase: 1 });
  put(g, pav, 0.74, 0, 0.66);
  /* 纸窗暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：白墙黛瓦两层楼阁 + 阳台 + 条纹布幌店口 + 石拱断桥（apex≈1.68） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(islandPad(M, anims, 2));
  var y0 = 0.17;
  var cx = -0.1;
  /* [R5] 石勒脚 + 一层白灰墙（湿度渍痕纹理）+ 转角木柱 + 檐下木枋 */
  g.add(box(1.32, 0.09, 0.96, M.stoneT, cx, y0 + 0.045, -0.36));
  g.add(box(1.2, 0.56, 0.86, M.plaster, cx, y0 + 0.37, -0.36));          /* 0.26-0.82 */
  [[-0.62], [0.62]].forEach(function (sx) {
    g.add(box(0.05, 0.56, 0.05, M.timberD, cx + sx[0], y0 + 0.37, 0.06));
    g.add(box(0.05, 0.56, 0.05, M.timberD, cx + sx[0], y0 + 0.37, -0.78));
  });
  g.add(box(1.24, 0.03, 0.88, M.timberD, cx, y0 + 0.645, -0.36));        /* 檐下木枋分档 */
  /* 店口（左半）：木柜台 + 货担 + [R7] 青白条纹布幌（垂边波纹 + 微风摆） */
  g.add(box(0.6, 0.34, 0.05, M.timberD, cx - 0.3, y0 + 0.21, 0.08));
  g.add(box(0.56, 0.05, 0.14, M.timber, cx - 0.3, y0 + 0.2, 0.12));
  g.add(box(0.12, 0.09, 0.08, M.clay, cx - 0.48, y0 + 0.28, 0.1));
  g.add(box(0.1, 0.07, 0.08, M.clay, cx - 0.32, y0 + 0.27, 0.1));
  g.add(box(0.11, 0.06, 0.07, M.lily, cx - 0.16, y0 + 0.265, 0.1));
  var awn = clothAwning(M, 0.72, { anims: anims, phase: 0.8, sc: 5 });
  put(g, awn, cx - 0.3, y0 + 0.42, 0.06);
  /* 门（右半）+ 石阶 + [R6] 井字格窗 */
  g.add(box(0.28, 0.38, 0.026, M.timberD, cx + 0.32, y0 + 0.21, 0.078));
  g.add(box(0.22, 0.32, 0.034, M.ink, cx + 0.32, y0 + 0.185, 0.08));
  g.add(box(0.3, 0.045, 0.14, M.stoneD, cx + 0.32, y0 + 0.115, 0.14));
  var w1 = latticeWindow(M, 0.16, 0.2); put(g, w1, cx - 0.06, y0 + 0.34, 0.078);
  /* 二层：楼板 + 白灰墙 + 木栏杆阳台 + [R5] 开间壁柱 + 木格窗 */
  g.add(box(1.26, 0.05, 0.9, M.timberD, cx, y0 + 0.685, -0.36));
  g.add(box(1.16, 0.46, 0.8, M.plaster, cx, y0 + 0.94, -0.36));          /* 0.74-1.20 */
  var balc = balcony(M, 0.94); put(g, balc, cx - 0.28, y0 + 0.73, 0.12);
  var w2 = latticeWindow(M, 0.2, 0.22); put(g, w2, cx - 0.42, y0 + 0.99, 0.05);
  var w3 = latticeWindow(M, 0.2, 0.22); put(g, w3, cx + 0.1, y0 + 0.99, 0.05);
  g.add(box(0.05, 0.42, 0.05, M.timberD, cx - 0.72, y0 + 0.95, 0.16));
  g.add(box(0.05, 0.42, 0.05, M.timberD, cx + 0.16, y0 + 0.95, 0.16));
  g.add(box(0.04, 0.42, 0.04, M.timberD, cx - 0.28, y0 + 0.95, 0.16));   /* [R5] 中壁柱 */
  /* [R3][R4] 主瓦顶：瓦当排 + 卷尾吻钩 + 圆珠（apex≈1.66）+ 前坡老虎窗 */
  var roof = tileRoof(M, { w: 1.16, d: 0.84, h: 0.21, over: 0.13, big: false });
  put(g, roof, cx, y0 + 1.16, -0.36);
  g.add(box(0.2, 0.16, 0.2, M.plaster, cx - 0.26, y0 + 1.27, -0.02));
  var dm = tileRoof(M, { w: 0.24, d: 0.2, h: 0.09, over: 0.05, ridge: false, small: true });
  put(g, dm, cx - 0.26, y0 + 1.35, -0.02);
  /* 廊下灯笼 ×2（v2 金属件，挂环悬于檐口下） */
  var l1 = lantern(M, 0.62, anims, 0.8); put(g, l1, cx - 0.72, y0 + 1.0, 0.2);
  var l2 = lantern(M, 0.62, anims, 2.1); put(g, l2, cx + 0.14, y0 + 1.0, 0.2);
  /* [R1][R2] 石拱断桥（分环券 + 望柱莲纹）+ 水亭（升级） */
  var br = stoneBridge(M, { s: 0.86 }); put(g, br, -0.7, 0.02, 0.58, 0.7);
  var pav = waterPavilion(M, { s: 0.95, anims: anims, phase: 2 });
  put(g, pav, 0.76, 0, 0.62);
  /* 纸窗暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：三层楼阁起层 + 层层腰檐 + 灯串 + 木匾 + 双层檐水亭（apex≈2.22） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(islandPad(M, anims, 3));
  var y0 = 0.17;
  var cx = -0.14;
  /* 一层：[R5] 石勒脚 + 白灰墙 + 朱门 + 格窗 + 木柱 + 中壁柱 */
  g.add(box(1.42, 0.09, 1.0, M.stoneT, cx, y0 + 0.045, -0.38));
  g.add(box(1.3, 0.5, 0.9, M.plaster, cx, y0 + 0.3, -0.38));             /* 0.26-0.76 */
  g.add(box(0.26, 0.36, 0.026, M.timberD, cx - 0.3, y0 + 0.2, 0.09));
  g.add(box(0.2, 0.3, 0.034, M.ink, cx - 0.3, y0 + 0.17, 0.092));
  var w1 = latticeWindow(M, 0.18, 0.22); put(g, w1, cx + 0.14, y0 + 0.3, 0.095);
  var w2 = latticeWindow(M, 0.18, 0.22); put(g, w2, cx + 0.5, y0 + 0.3, 0.095);
  [[-0.66], [0.66]].forEach(function (sx) {
    g.add(box(0.05, 0.5, 0.05, M.timberD, cx + sx[0], y0 + 0.34, 0.07));
    g.add(box(0.05, 0.5, 0.05, M.timberD, cx + sx[0], y0 + 0.34, -0.83));
  });
  g.add(box(0.04, 0.5, 0.04, M.timberD, cx + 0.32, y0 + 0.34, 0.075));   /* [R5] 中壁柱 */
  /* 腰檐 1 + 阳台 1 */
  var e1 = eaveRing(M, 1.36, 0.96, 0.09); put(g, e1, cx, y0 + 0.55, -0.38);
  var b1 = balcony(M, 1.06); put(g, b1, cx, y0 + 0.61, 0.1);
  /* 二层：白灰墙 + 格窗 + 木柱 + [R5] 分档 + 灯笼 ×2 + 木匾「断桥烟雨」 */
  g.add(box(1.2, 0.46, 0.84, M.plaster, cx, y0 + 0.86, -0.38));          /* 0.80-1.26 */
  var w3 = latticeWindow(M, 0.18, 0.2); put(g, w3, cx - 0.28, y0 + 0.86, 0.055);
  var w4 = latticeWindow(M, 0.18, 0.2); put(g, w4, cx + 0.28, y0 + 0.86, 0.055);
  [[-0.61], [0.61]].forEach(function (sx) {
    g.add(box(0.045, 0.46, 0.045, M.timberD, cx + sx[0], y0 + 0.86, 0.02));
    g.add(box(0.045, 0.46, 0.045, M.timberD, cx + sx[0], y0 + 0.86, -0.78));
  });
  g.add(box(0.06, 0.46, 0.04, M.timberD, cx, y0 + 0.86, 0.045));         /* 明间中柱分档 */
  var plq = plaque(M, false, 0.34, 0.085, anims, 3); put(g, plq, cx, y0 + 0.96, 0.06);
  var l1 = lantern(M, 0.5, anims, 1.2); put(g, l1, cx - 0.56, y0 + 1.11, 0.12);
  var l2 = lantern(M, 0.5, anims, 2.6); put(g, l2, cx + 0.56, y0 + 1.11, 0.12);
  /* 腰檐 2 + 阳台 2 */
  var e2 = eaveRing(M, 1.24, 0.88, 0.085); put(g, e2, cx, y0 + 1.09, -0.38);
  var b2 = balcony(M, 0.92); put(g, b2, cx, y0 + 1.15, 0.08);
  /* 三层：白灰墙 + 格窗 + 灯笼 ×2 */
  g.add(box(1.08, 0.44, 0.76, M.plaster, cx, y0 + 1.35, -0.38));         /* 1.30-1.74 */
  var w5 = latticeWindow(M, 0.16, 0.18); put(g, w5, cx - 0.22, y0 + 1.35, 0.035);
  var w6 = latticeWindow(M, 0.16, 0.18); put(g, w6, cx + 0.22, y0 + 1.35, 0.035);
  [[-0.55], [0.55]].forEach(function (sx) {
    g.add(box(0.042, 0.44, 0.042, M.timberD, cx + sx[0], y0 + 1.35, 0.0));
    g.add(box(0.042, 0.44, 0.042, M.timberD, cx + sx[0], y0 + 1.35, -0.76));
  });
  var l3 = lantern(M, 0.46, anims, 3.4); put(g, l3, cx - 0.5, y0 + 1.55, 0.08);
  var l4 = lantern(M, 0.46, anims, 4.6); put(g, l4, cx + 0.5, y0 + 1.55, 0.08);
  /* [R3][R4] 顶层主瓦顶（瓦当排 + 吻钩圆珠 + 鎏金中饰，apex≈2.22） */
  var roof = tileRoof(M, { w: 1.06, d: 0.8, h: 0.3, over: 0.13, big: true });
  put(g, roof, cx, y0 + 1.57, -0.38);
  /* [R1][R2] 石拱断桥 + [R8] 双层檐水亭（层次宝顶） */
  var br = stoneBridge(M, { s: 0.94 }); put(g, br, -0.72, 0.02, 0.6, 0.72);
  var pav = waterPavilion(M, { s: 1.05, double: true, anims: anims, phase: 3 });
  put(g, pav, 0.78, 0, 0.6);
  /* 纸窗暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.15 + 0.8); });
  return g;
}

/* ---- lv4 地标：四重飞檐湖畔地标 + 鎏金匾额宝顶 + 青幌廊街 + 烟雨迷雾（apex≈2.98） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(islandPad(M, anims, 4));
  var y0 = 0.17;
  var cx = -0.14;
  /* 一层廊街：[R5] 石勒脚 + 白灰墙 + 木柱列 + 朱门 + [R7] 青幌 ×2（垂边波纹）+ 格窗 */
  g.add(box(1.56, 0.09, 1.06, M.stoneT, cx, y0 + 0.045, -0.4));
  g.add(box(1.44, 0.54, 0.96, M.plaster, cx, y0 + 0.315, -0.4));         /* 0.26-0.80 */
  [[-0.72], [-0.26], [0.26], [0.72]].forEach(function (sx) {
    g.add(cyl(0.028, 0.032, 0.52, 12, M.timberD, cx + sx[0], y0 + 0.36, 0.1));
  });
  g.add(box(1.48, 0.03, 0.98, M.timberD, cx, y0 + 0.585, -0.4));         /* 檐下木枋 */
  g.add(box(0.26, 0.38, 0.026, M.timberD, cx, y0 + 0.21, 0.1));
  g.add(box(0.2, 0.32, 0.034, M.ink, cx, y0 + 0.18, 0.102));
  var aw1 = clothAwning(M, 0.42, { anims: anims, phase: 1.7, sc: 4 }); put(g, aw1, cx - 0.5, y0 + 0.46, 0.08);
  var aw2 = clothAwning(M, 0.42, { anims: anims, phase: 3.1, sc: 4 }); put(g, aw2, cx + 0.5, y0 + 0.46, 0.08);
  var w1 = latticeWindow(M, 0.18, 0.22); put(g, w1, cx - 0.5, y0 + 0.3, 0.105);
  var w2 = latticeWindow(M, 0.18, 0.22); put(g, w2, cx + 0.5, y0 + 0.3, 0.105);
  /* 腰檐 1 + 阳台 1 + 灯笼 ×2 */
  var e1 = eaveRing(M, 1.5, 1.02, 0.1); put(g, e1, cx, y0 + 0.585, -0.4);
  var b1 = balcony(M, 1.2); put(g, b1, cx, y0 + 0.66, 0.12);
  var lA = lantern(M, 0.5, anims, 0.6); put(g, lA, cx - 0.76, y0 + 0.62, 0.18);
  var lB = lantern(M, 0.5, anims, 1.9); put(g, lB, cx + 0.76, y0 + 0.62, 0.18);
  /* 二层：白灰墙 + 格窗 + 鎏金匾「断桥烟雨」+ 灯笼 ×2 */
  g.add(box(1.3, 0.46, 0.9, M.plaster, cx, y0 + 0.935, -0.4));           /* 0.875-1.335 */
  var w3 = latticeWindow(M, 0.18, 0.2); put(g, w3, cx - 0.3, y0 + 0.93, 0.07);
  var w4 = latticeWindow(M, 0.18, 0.2); put(g, w4, cx + 0.3, y0 + 0.93, 0.07);
  [[-0.66], [0.66]].forEach(function (sx) {
    g.add(box(0.048, 0.46, 0.048, M.timberD, cx + sx[0], y0 + 0.935, 0.04));
    g.add(box(0.048, 0.46, 0.048, M.timberD, cx + sx[0], y0 + 0.935, -0.84));
  });
  g.add(box(0.06, 0.46, 0.04, M.timberD, cx, y0 + 0.935, 0.09));         /* 明间中柱 */
  var plq = plaque(M, true, 0.44, 0.11, anims, 4); put(g, plq, cx, y0 + 1.06, 0.065);
  var l1 = lantern(M, 0.48, anims, 2.8); put(g, l1, cx - 0.6, y0 + 1.18, 0.16);
  var l2 = lantern(M, 0.48, anims, 3.7); put(g, l2, cx + 0.6, y0 + 1.18, 0.16);
  /* 腰檐 2 + 阳台 2（高层省翘钩） */
  var e2 = eaveRing(M, 1.36, 0.94, 0.095, false); put(g, e2, cx, y0 + 1.165, -0.4);
  var b2 = balcony(M, 1.04); put(g, b2, cx, y0 + 1.195, 0.1);
  /* 三层：白灰墙 + 格窗 */
  g.add(box(1.14, 0.42, 0.8, M.plaster, cx, y0 + 1.51, -0.4));           /* 1.47-1.89 */
  var w5 = latticeWindow(M, 0.16, 0.18); put(g, w5, cx - 0.24, y0 + 1.51, 0.045);
  var w6 = latticeWindow(M, 0.16, 0.18); put(g, w6, cx + 0.24, y0 + 1.51, 0.045);
  [[-0.58], [0.58]].forEach(function (sx) {
    g.add(box(0.042, 0.42, 0.042, M.timberD, cx + sx[0], y0 + 1.51, 0.01));
    g.add(box(0.042, 0.42, 0.042, M.timberD, cx + sx[0], y0 + 1.51, -0.81));
  });
  /* 腰檐 3 */
  var e3 = eaveRing(M, 1.2, 0.84, 0.09, false); put(g, e3, cx, y0 + 1.72, -0.4);
  /* 四层顶阁：白灰墙 + 木栏 */
  g.add(box(0.96, 0.4, 0.68, M.plaster, cx, y0 + 1.99, -0.4));           /* 1.96-2.36 */
  var b3 = balcony(M, 0.78); put(g, b3, cx, y0 + 1.75, 0.06);
  /* 攒尖四坡大顶（四重檐之顶，apex≈2.98）：四坡 + 四金翘 + [R4] 吻钩圆珠 + [R8] 层次宝顶 */
  var tw = 0.98, td = 0.74, th = 0.36;
  var top = grp(); g.add(top);
  var eF = td / 2 + 0.12, eS = tw / 2 + 0.12;
  var pF = Math.atan2(th, eF), pS = Math.atan2(th, eS);
  var lenF = Math.sqrt(eF * eF + th * th) + 0.02;
  var lenS = Math.sqrt(eS * eS + th * th) + 0.02;
  var sgF = grp(); sgF.position.y = th; sgF.rotation.x = pF; top.add(sgF);
  sgF.add(box(tw * 0.7 + 0.22, 0.035, lenF, M.roofLit, 0, 0, lenF / 2));
  sgF.add(box(tw * 0.7 + 0.24, 0.05, 0.024, M.timberD, 0, -0.004, eF));
  var sgB = grp(); sgB.position.y = th; sgB.rotation.x = -pF; top.add(sgB);
  sgB.add(box(tw * 0.7 + 0.22, 0.035, lenF, M.roofShd, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.y = th; slR.rotation.z = -pS; top.add(slR);
  slR.add(box(lenS, 0.035, td * 0.8, M.roofShd, lenS / 2, 0, 0));
  var slL = grp(); slL.position.y = th; slL.rotation.z = pS; top.add(slL);
  slL.add(box(lenS, 0.035, td * 0.8, M.roofShd, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.07, 0.05, 0.07, M.ridge, c[0] * (eS - 0.02), 0.05, c[1] * (eF - 0.02));
    lift.rotation.z = -c[0] * 0.6; top.add(lift);
  });
  top.add(box(tw * 0.42, 0.065, 0.085, M.ridge, 0, th + 0.032, 0));
  var gf1 = box(0.05, 0.12, 0.07, M.gold, tw * 0.21, th + 0.095, 0); gf1.rotation.z = 0.42; top.add(gf1);
  var gf2 = box(0.05, 0.12, 0.07, M.gold, -tw * 0.21, th + 0.095, 0); gf2.rotation.z = -0.42; top.add(gf2);
  /* [R8] 鎏金层次宝顶：宝座 + 伞盖 + 相轮 + 宝珠 + 顶刺 */
  top.add(cyl(0.03, 0.04, 0.03, 12, M.gold, 0, th + 0.14, 0));
  var canopy = mesh(new THREE.ConeGeometry(0.038, 0.034, 12), M.gold);
  canopy.position.y = th + 0.172; top.add(canopy);
  var ringT = mesh(new THREE.TorusGeometry(0.02, 0.006, 8, 14), M.gold);
  ringT.rotation.x = PI / 2; ringT.position.y = th + 0.196; top.add(ringT);
  top.add(sph(0.024, M.gold, 0, th + 0.216, 0));
  top.add(cyl(0.005, 0.009, 0.026, 12, M.gold, 0, th + 0.24, 0));
  put(g, top, cx, y0 + 2.19, -0.4);
  /* 鎏金宝顶微光 */
  var gm = MAT('p24finGlow', function () { return std('#000000', { rough: 0.3, metal: 0.6, emissive: '#ffe9a0', ei: 0.0 }); });
  var halo = sph(0.06, gm, cx, y0 + 2.19 + th + 0.13, -0.4);
  halo.castShadow = false; g.add(halo);
  anims.push(function (t) { gm.emissiveIntensity = 0.12 + 0.1 * sin(t * 0.8 + 1.1); });
  /* [R1][R2] 大石拱桥 + [R8] 大双层檐水亭 */
  var br = stoneBridge(M, { s: 1.02 }); put(g, br, -0.68, 0.02, 0.58, 0.74);
  var pav = waterPavilion(M, { s: 1.2, double: true, anims: anims, phase: 5 });
  put(g, pav, 0.72, 0, 0.62);
  /* [R10] 烟雨迷雾 v2：近水薄纱 ×2 + 悬浮纱 ×2，漂移 + 透明度呼吸（幅度克制） */
  var i;
  for (i = 0; i < 4; i++) {
    var low = i < 2;
    var m0 = sph(0.3, low ? M.mistA : M.mistB,
      -0.45 + (i % 2) * 0.9, low ? 0.08 : 0.2, 0.78 - (i % 2) * 0.35 + (low ? 0 : 0.12));
    m0.scale.y = low ? 0.2 : 0.13; m0.castShadow = false;
    m0.userData.isMist = true; g.add(m0);
    (function (m0, k, low) {
      anims.push(function (t) {
        m0.position.x = sin(t * 0.14 + k * 2.1) * 0.25 + (-0.45 + (k % 2) * 0.9);
        m0.position.y = (low ? 0.08 : 0.2) + 0.02 * sin(t * 0.5 + k);
        var m = low ? M.mistA : M.mistB;
        m.opacity = (low ? 0.11 : 0.085) + 0.028 * sin(t * 0.42 + k * 1.3);
      });
    })(m0, i, low);
  }
  /* 纸窗暖光呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.05 * sin(t * 1.05 + 1.4); });
  return g;
}

/* ================= 5. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[24] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_24_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 24;
  g.userData.level = lv;
  g.userData.region = 'g5';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
