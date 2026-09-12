/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_21.js
 * -------------------------------------------------------------------------------------
 * 格 21「平江路」(g5 江南烟雨) 独属建筑：苏式水巷四阶生长史
 * 参考图 refs/prop_21.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec 见
 * .img2threejs/evidence_prop21/object-sculpt-spec.json，strict-quality PASS）。
 *
 * 风格族谱（同一块水巷岛的同一种生长，非四座无关建筑）：
 *   lv1 小屋   风化木板壁小屋 + 木瓦圆脊顶 + 木栅栏 + 幼柳（h≈1.0）
 *   lv2 洋房   两层白灰墙楼：木柱铺面 + 藏青布棚 + 披檐 + 炭黑翘角瓦顶 + 悬鱼（h≈1.62）
 *   lv3 大厦   三层退台：层层腰檐挑廊 + 木格窗 + 灯笼成列 + 藤蔓 + 圆冠树（h≈2.16）
 *   lv4 地标   石台基 + 厢房披屋 + 门廊金字牌匾 + 鎏金翼角/金脊/宝顶（h≈2.5）
 *
 * 独有语汇（自参考图提炼，与 prop_1 胡同 / prop_3 京派拉开差异）：
 *   水巷沙盘（草地岛 + 石驳岸水湾 + 睡莲红蕖）+ 石拱桥（块石拱券+踏步+实心栏板）
 *   + 垂柳下挂枝束 + 炭黑鳞瓦强翘角 + 白灰山花悬鱼 + 藏青布棚 + 水埠石阶
 *   + 黑底金字竖招 / 金牌匾（每阶必有水湾、拱桥、垂柳、踏步）。
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[21] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_21] THREE 未定义，请先加载 three.min.js (r147)');
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
function MAT(id, make) { if (!_mc[id]) _mc[id] = make(); return _mc[id]; }

function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 12, 9), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rz, rx) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rz) o.rotation.z = rz; if (rx) o.rotation.x = rx;
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

/* 炭黑鳞瓦：鳞次搭接瓦行（弧缘）+ 竖向接头错缝 + 陶面噪点（map+bump 同源独立绘制） */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#212429'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#2b2f35' : '#262a30';
    g.fillRect(0, y, S, rh);
    /* 瓦行弧缘（亮口朝下檐） */
    g.strokeStyle = '#454c55'; g.lineWidth = 2;
    for (k = 0; k < 8; k++) {
      var x = ((i % 2) * 8 + k * 16) % S;
      g.beginPath(); g.arc(x + 8, y + rh, 8, PI, 0); g.stroke();
    }
    g.fillStyle = '#15171b'; g.fillRect(0, y, S, 2);
    g.fillStyle = '#3a4048'; g.fillRect(0, y + 2, S, 2);
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.045)' : 'rgba(10,12,15,0.09)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 风化木板（lv1 壁 + 木瓦顶）：横板 + 板缝 + 木纹拉丝 */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#8a7660'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#937f68' : '#84705a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#55432e'; g.fillRect(0, y + rh - 2, S, 2);
    for (k = 0; k < 5; k++) {
      g.fillStyle = (k + i) % 2 ? 'rgba(255,244,220,0.07)' : 'rgba(60,44,26,0.10)';
      g.fillRect(0, y + 3 + ((k * 11 + i * 5) % (rh - 5)), S, 1);
    }
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = 'rgba(48,36,20,0.14)';
    g.fillRect((i * 31) % S, (i * 47) % S, 2, 5);
  }
  return toTex(cv, true);
}
/* 暖白灰墙：斑驳 + 底部水渍（苏式白墙） */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#f0ebe0'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 46; i++) {
    g.fillStyle = i % 2 ? 'rgba(210,200,178,0.35)' : 'rgba(255,252,244,0.4)';
    g.fillRect((i * 37) % S, (i * 53) % S, 8 + (i * 7) % 14, 5 + (i * 5) % 10);
  }
  for (i = 0; i < 5; i++) {
    g.fillStyle = 'rgba(164,150,124,0.20)';
    g.fillRect(10 + i * 24, 92 + (i % 3) * 8, 3, 36);
  }
  g.fillStyle = 'rgba(170,158,132,0.25)'; g.fillRect(0, S - 12, S, 12);
  return toTex(cv, true);
}
/* 花岗岩块石（桥/驳岸/踏步）：错缝块石 + 石屑噪点 */
function texAshlar() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#c3b291'; g.fillRect(0, 0, S, S);
  var rows = 6, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = 'rgba(110,95,68,0.55)'; g.fillRect(0, y + rh - 2, S, 2);
    var off = (i % 2) ? S / 8 : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(110,95,68,0.55)'; g.fillRect(x, y, 2, rh - 2);
      g.fillStyle = (k + i) % 3 ? 'rgba(255,248,230,0.10)' : 'rgba(96,82,58,0.14)';
      g.fillRect(x + 3, y + 2, S / 4 - 6, rh - 6);
    }
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,250,235,0.07)' : 'rgba(80,68,48,0.10)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 藏青布纹（雨棚） */
function texWeave() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#414865'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < S; i += 3) {
    g.fillStyle = (i % 6) ? 'rgba(255,255,255,0.045)' : 'rgba(10,12,24,0.08)';
    g.fillRect(i, 0, 1, S);
  }
  g.fillStyle = 'rgba(86,96,144,0.30)'; g.fillRect(0, 0, S, 6);
  return toTex(cv, true);
}
/* 水面：青碧 + 涟漪弧 + 深斑 */
function texWater() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#2e6058'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 10; i++) {
    g.fillStyle = 'rgba(22,56,52,0.30)';
    g.fillRect((i * 53) % S, (i * 37) % S, 22 + (i * 11) % 20, 12 + (i * 7) % 12);
  }
  g.strokeStyle = 'rgba(214,244,238,0.16)'; g.lineWidth = 2;
  for (i = 0; i < 7; i++) {
    g.beginPath();
    g.arc((i * 61 + 20) % S, (i * 43 + 14) % S, 9 + (i * 5) % 10, PI * 1.1, PI * 1.9);
    g.stroke();
  }
  return toTex(cv, true);
}
/* 竖板黑底金字招牌「平江路」 */
function texSignV() {
  var w = 96, h = 192, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2e2317'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d9b25c'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 12);
  g.strokeStyle = 'rgba(217,178,92,0.5)'; g.lineWidth = 2; g.strokeRect(12, 12, w - 24, h - 26);
  g.fillStyle = '#e8c878'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '平江路', i;
  for (i = 0; i < 3; i++) g.fillText(s[i], w / 2, 44 + i * 50);
  return toTex(cv, true);
}
/* 金字牌匾「平江路」（lv4） */
function texPlaqueG() {
  var w = 192, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#b9862c'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#d9a43c'; g.fillRect(5, 5, w - 10, h - 10);
  g.strokeStyle = '#8a6417'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#7a5612'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 38px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('平 江 路', w / 2, h / 2 + 2);
  g.fillStyle = '#8a6417';
  var rv = [[10, 10], [w - 10, 10], [10, h - 10], [w - 10, h - 10]], i;
  for (i = 0; i < 4; i++) { g.beginPath(); g.arc(rv[i][0], rv[i][1], 3, 0, PI * 2); g.fill(); }
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图聚类实测） */
function Mats() {
  return {
    roofSun:   MAT('p21roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.015, rough: 0.66 }); }),
    roofShade: MAT('p21roofShd', function () { var t = getTex('tile', texTile); return std('#8f969f', { map: t, bump: t, bumpScale: 0.015, rough: 0.72 }); }),
    ridge:     MAT('p21ridge', function () { return std('#17191d', { rough: 0.8 }); }),
    plaster:   MAT('p21plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    plasterD:  MAT('p21plasterD', function () { return std('#ddd5c4', { rough: 0.92 }); }),
    plank:     MAT('p21plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.85 }); }),
    plankL:    MAT('p21plankL', function () { var t = getTex('plank', texPlank); return std('#cfc4ae', { map: t, bump: t, bumpScale: 0.012, rough: 0.82 }); }),
    wood:      MAT('p21wood', function () { return std('#5b452c', { rough: 0.8 }); }),
    woodD:     MAT('p21woodD', function () { return std('#3f2f1c', { rough: 0.85 }); }),
    woodL:     MAT('p21woodL', function () { return std('#7a5c38', { rough: 0.78 }); }),
    lacqR:     MAT('p21lacqR', function () { return std('#8e3a28', { rough: 0.5 }); }),
    cloth:     MAT('p21cloth', function () { var t = getTex('weave', texWeave); return std('#ffffff', { map: t, rough: 0.8 }); }),
    gold:      MAT('p21gold', function () { return std('#dca840', { rough: 0.35, metal: 0.75 }); }),
    stone:     MAT('p21stone', function () { var t = getTex('ashlar', texAshlar); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.9 }); }),
    stoneD:    MAT('p21stoneD', function () { return std('#a4936f', { rough: 0.92 }); }),
    grass:     MAT('p21grass', function () { return std('#74a03e', { rough: 0.95 }); }),
    grassD:    MAT('p21grassD', function () { return std('#5c8531', { rough: 0.95 }); }),
    soil:      MAT('p21soil', function () { return std('#6b4f33', { rough: 0.92 }); }),
    leafA:     MAT('p21leafA', function () { return std('#a3b578', { rough: 0.9 }); }),
    leafB:     MAT('p21leafB', function () { return std('#8ba35f', { rough: 0.9 }); }),
    leafC:     MAT('p21leafC', function () { return std('#7d9a52', { rough: 0.9 }); }),
    treeG:     MAT('p21treeG', function () { return std('#5f8a3c', { rough: 0.9 }); }),
    treeD:     MAT('p21treeD', function () { return std('#496e2e', { rough: 0.9 }); }),
    ivy:       MAT('p21ivy', function () { return std('#5d8a3a', { rough: 0.9 }); }),
    lily:      MAT('p21lily', function () { return std('#6f9c3f', { rough: 0.85 }); }),
    blossom:   MAT('p21blossom', function () { return std('#d96a6a', { rough: 0.6 }); }),
    ink:       MAT('p21ink', function () { return std('#16130e', { rough: 0.9 }); }),
    paper:     MAT('p21paper', function () { return std('#e8dcc0', { rough: 0.9, emissive: '#ffd98a', ei: 0.16 }); }),
    water:     MAT('p21water', function () { var t = getTex('water', texWater); return std('#3e7a72', { map: t, rough: 0.3, emissive: '#1c5f58', ei: 0.12 }); })
  };
}

/* ================= 2. 预制件（风格独有语汇） ================= */

/* 草地水巷沙盘：草皮三拼（水湾为真实凹口）+ 土崖 + 石驳岸 + 压沿块石（每阶固有）
 * 返回 {g, wz0, wz1, wx0, wx1, hd, hw} 供桥/水埠/踏步定位。 */
function islandPad2(M, w, d) {
  var g = grp();
  g.name = 'island-base';
  var hw = w / 2, hd = d / 2;
  var wz0 = 0.58, wz1 = hd - 0.13;          /* 水湾 z 范围 */
  var wx0 = -0.30, wx1 = hw - 0.07;         /* 水湾 x 范围（直达右缘留石沿） */
  g.add(box(w - 0.06, 0.055, d - 0.06, M.soil, 0, 0.0275, 0));
  /* 草皮 A：z -hd..wz0 全宽 */
  g.add(box(w, 0.03, wz0 + hd, M.grass, 0, 0.07, (wz0 - hd) / 2));
  /* 草皮 B：水湾以南前侧条带 z wz1..hd */
  g.add(box(w, 0.03, hd - wz1, M.grass, 0, 0.07, (wz1 + hd) / 2));
  /* 草皮 C：水湾以左 x -hw..wx0 */
  g.add(box(wx0 + hw, 0.03, wz1 - wz0, M.grass, -(hw + wx0) / 2, 0.07, (wz0 + wz1) / 2));
  /* 水面（凹口内，低于草面）+ 石驳岸内唇（canal-water 语义组） */
  var cw = grp(); cw.name = 'canal-water'; g.add(cw);
  var wt = box(wx1 - wx0, 0.026, wz1 - wz0, M.water, (wx0 + wx1) / 2, 0.058, (wz0 + wz1) / 2);
  wt.receiveShadow = true; cw.add(wt);
  cw.add(box(0.07, 0.095, wz1 - wz0 + 0.05, M.stoneD, wx0 - 0.02, 0.0475, (wz0 + wz1) / 2));
  cw.add(box(wx1 - wx0 + 0.1, 0.095, 0.07, M.stoneD, (wx0 + wx1) / 2, 0.0475, wz0 - 0.02));
  cw.add(box(wx1 - wx0 + 0.1, 0.095, 0.07, M.stoneD, (wx0 + wx1) / 2, 0.0475, wz1 + 0.02));
  /* 压沿块石（草缘）+ 草丛 + 卵石（kerb-stones 语义组） */
  var ks = grp(); ks.name = 'kerb-stones'; g.add(ks);
  var i;
  for (i = 0; i < 3; i++) ks.add(box(0.085, 0.05, 0.085, M.stoneD, -hw + 0.18 + i * 0.3, 0.095, wz1 + (hd - wz1) / 2));
  for (i = 0; i < 2; i++) ks.add(box(0.085, 0.05, 0.085, M.stoneD, -hw + 0.12, 0.095, wz0 + 0.14 + i * 0.22));
  for (i = 0; i < 2; i++) ks.add(cone(0.024, 0.055, 6, M.grassD, -hw + 0.3 + i * 0.5, 0.1, -hd + 0.22 + (i % 2) * 0.1));
  var rock = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD);
  rock.position.set(-hw + 0.36, 0.09, wz0 - 0.24);
  ks.add(rock);
  return { g: g, wz0: wz0, wz1: wz1, wx0: wx0, wx1: wx1, hd: hd, hw: hw };
}

/* 睡莲：圆叶 + 红蕖（浮动动画） */
function lilyPads(M, anims) {
  var g = grp();
  g.name = 'lily-pads';
  var spots = [[0.72, 0.72], [0.98, 0.85], [0.52, 0.93], [1.1, 0.7]];
  var i;
  for (i = 0; i < spots.length; i++) {
    var p = cyl(0.055 + (i % 2) * 0.018, 0.065 + (i % 2) * 0.018, 0.012, 12, i % 2 ? M.lily : M.grassD,
      spots[i][0], 0.075, spots[i][1]);
    g.add(p);
    anims.push((function (p, ph) {
      return function (t) { p.position.y = 0.075 + sin(t * 1.4 + ph) * 0.008; };
    })(p, i * 1.7));
  }
  g.add(sph(0.022, M.blossom, spots[1][0] + 0.03, 0.095, spots[1][1] - 0.02));
  return g;
}

/* 石拱桥：块石拱身（挤出拱洞）+ 弧面踏步 + 实心栏板（每阶固有） */
function archBridge(M, zLen, x, zc) {
  var g = grp();
  g.name = 'arch-bridge';
  var H = 0.2, r = 0.15, W = 0.5;
  var sh = new THREE.Shape();
  sh.moveTo(-zLen / 2, 0); sh.lineTo(zLen / 2, 0); sh.lineTo(zLen / 2, H);
  sh.lineTo(-zLen / 2, H); sh.closePath();
  var hole = new THREE.Path();
  hole.absarc(0, 0, r, 0, PI, false);
  sh.holes.push(hole);
  var body = mesh(new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }), M.stone);
  body.rotation.y = PI / 2;                 /* 拱洞沿 z 向穿透，厚度沿 x */
  body.position.set(x - W / 2, 0.081, zc);
  body.receiveShadow = true;
  g.add(body);
  /* 弧面踏步（拱顶人行面，拱心高两端低）+ 实心栏板（deck-steps 语义组） */
  var deck = grp(); deck.name = 'deck-steps'; g.add(deck);
  var i, n = 5;
  for (i = 0; i < n; i++) {
    var u = (i + 0.5) / n - 0.5;
    var dz = u * zLen * 0.72;
    var hh = 0.1 + 0.13 * cos(u * PI);
    deck.add(box(W - 0.06, hh, zLen / n + 0.005, M.stoneD, x, 0.251 + hh / 2, zc + dz));
  }
  var s;
  for (s = -1; s <= 1; s += 2) {
    for (i = 0; i < 3; i++) {
      var u2 = (i - 1) * 0.3;
      var hh2 = 0.07 + 0.05 * cos(u2 * PI);
      deck.add(box(0.035, hh2, zLen * 0.26, M.stoneD, x + s * (W / 2 - 0.017), 0.39 + hh2 / 2, zc + u2 * zLen));
    }
  }
  return g;
}

/* 垂柳：斜干 + 团冠 + 下挂枝束（摆动）——平江路识别件 */
function willow(M, s, anims, phase, strands) {
  var g = grp();
  g.name = 'weeping-willow';
  s = s || 1; strands = strands || 6;
  var trunk = cyl(0.028 * s, 0.045 * s, 0.62 * s, 10, M.woodD, 0, 0.31 * s, 0);
  trunk.rotation.z = 0.1; g.add(trunk);
  var c1 = sph(0.15 * s, M.leafA, 0.05 * s, 0.68 * s, 0); g.add(c1);
  var c2 = sph(0.11 * s, M.leafB, -0.09 * s, 0.6 * s, 0.05 * s); c2.scale.y = 0.85; g.add(c2);
  var hang = grp(); hang.position.set(0.05 * s, 0.66 * s, 0); hang.name = 'willow-strands'; g.add(hang);
  var tints = [M.leafA, M.leafB, M.leafC];
  var i;
  for (i = 0; i < strands; i++) {
    var ang = (i / strands) * PI * 2 + phase;
    var rad = 0.13 * s;
    var len = (0.3 + 0.09 * ((i * 7) % 3)) * s;
    var st = mesh(new THREE.BoxGeometry(0.02 * s, len, 0.02 * s), tints[i % 3]);
    st.position.set(cos(ang) * rad, -len / 2 + 0.02, sin(ang) * rad);
    st.rotation.y = -ang;
    hang.add(st);
  }
  anims.push(function (t) {
    hang.rotation.z = sin(t * 1.15 + phase) * 0.05;
    hang.rotation.x = cos(t * 0.9 + phase * 1.3) * 0.03;
  });
  return g;
}

/* 炭黑鳞瓦双坡顶：强翘角（翼角斜梁）+ 卷尾正脊 + 白山花悬鱼 —— 苏式识别件 */
function tileRoofFly(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), i, k;
  if (o.name) g.name = o.name;
  var over = o.over !== undefined ? o.over : 0.09;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  var kickMat = o.gold ? M.gold : M.ridge;
  var nst = o.strips || 2;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, len, k > 0 ? M.roofSun : M.roofShade, 0, 0, k * len / 2));
    for (i = 0; i < nst; i++) {
      sg.add(box(w + over * 2 - 0.05, 0.014, 0.024, M.ridge, 0, 0.025, k * ((i + 0.5) / nst) * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.022, M.woodD, 0, -0.006, k * eave));
    /* 翼角：四角斜梁上翘（flying-corners 语义组） */
    var kick = grp(); kick.name = 'flying-corners'; sg.add(kick);
    var sx;
    for (sx = -1; sx <= 1; sx += 2) {
      var beam = box(0.16, 0.026, 0.026, kickMat, sx * (w / 2 + over - 0.05), 0.045, k * (eave - 0.04));
      beam.rotation.z = -sx * 0.5;
      beam.rotation.y = sx * k * 0.62;
      kick.add(beam);
    }
  }
  if (o.gable !== false) {
    /* 白灰山花 + 悬鱼（gable-fish 语义组） */
    var gf = grp(); gf.name = 'gable-fish'; g.add(gf);
    var gs = new THREE.Shape();
    var ge = eave * 0.92;
    gs.moveTo(-ge, 0); gs.lineTo(ge, 0); gs.lineTo(0, h * 0.96); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plaster); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.01, -0.015, -0.02); gf.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plaster); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.01), -0.015, 0.02); gf.add(t2);
    if (o.fish !== false) {
      var fx = w / 2 + 0.045;
      var f1 = cone(0.032, 0.1, 6, M.woodD, fx, h * 0.4, 0);
      f1.rotation.x = PI; f1.scale.x = 0.35; gf.add(f1);
      var f2 = cone(0.032, 0.1, 6, M.woodD, -fx, h * 0.4, 0);
      f2.rotation.x = PI; f2.scale.x = 0.35; gf.add(f2);
    }
  }
  if (o.ridge !== false) {
    /* 正脊 + 卷尾（ridge-curls 语义组） */
    var rc = grp(); rc.name = 'ridge-curls'; g.add(rc);
    var rw = w + over * 2 - 0.06;
    rc.add(box(rw, 0.055, 0.085, M.ridge, 0, h + 0.028, 0));
    var c1 = box(0.055, 0.1, 0.075, M.ridge, rw / 2 - 0.01, h + 0.075, 0); c1.rotation.z = 0.85; rc.add(c1);
    var c2 = box(0.055, 0.1, 0.075, M.ridge, -rw / 2 + 0.01, h + 0.075, 0); c2.rotation.z = -0.85; rc.add(c2);
    if (o.big) put(rc, sph(0.03, M.gold), 0, h + 0.12, 0);
  }
  return g;
}

/* 炭黑鳞瓦四坡顶（lv3/lv4 主顶）：四坡 + 四角强翘 + 卷尾正脊（lv4 鎏金 + 宝顶） */
function hipRoofFly(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  if (o.name) g.name = o.name;
  var eF = d / 2 + 0.09, eS = w / 2 + 0.09;
  var kickMat = o.gold ? M.gold : M.ridge;
  var pF = Math.atan2(h, eF), pS = Math.atan2(h, eS);
  var lF = Math.sqrt(eF * eF + h * h) + 0.02, lS = Math.sqrt(eS * eS + h * h) + 0.02;
  var sgF = grp(); sgF.position.y = h; sgF.rotation.x = pF; g.add(sgF);
  sgF.add(box(w * 0.62 + 0.18, 0.035, lF, M.roofSun, 0, 0, lF / 2));
  sgF.add(box(w * 0.62 + 0.2, 0.045, 0.022, M.woodD, 0, -0.006, eF));
  var sgB = grp(); sgB.position.y = h; sgB.rotation.x = -pF; g.add(sgB);
  sgB.add(box(w * 0.62 + 0.18, 0.035, lF, M.roofShade, 0, 0, -lF / 2));
  var slR = grp(); slR.position.y = h; slR.rotation.z = -pS; g.add(slR);
  slR.add(box(lS, 0.035, d * 0.72 + 0.16, M.roofShade, lS / 2, 0, 0));
  var slL = grp(); slL.position.y = h; slL.rotation.z = pS; g.add(slL);
  slL.add(box(lS, 0.035, d * 0.72 + 0.16, M.roofShade, -lS / 2, 0, 0));
  var cs = [[1, 1], [1, -1], [-1, 1], [-1, -1]], i;
  var kick = grp(); kick.name = 'flying-corners'; g.add(kick);
  for (i = 0; i < 4; i++) {
    var b = box(0.15, 0.026, 0.026, kickMat, cs[i][0] * (eS - 0.04), h + 0.05, cs[i][1] * (eF - 0.04));
    b.rotation.z = -cs[i][0] * 0.55;
    b.rotation.y = cs[i][0] * cs[i][1] * 0.7;
    kick.add(b);
  }
  var rc = grp(); rc.name = 'ridge-curls'; g.add(rc);
  rc.add(box(w * 0.5, 0.06, 0.085, o.gold ? M.gold : M.ridge, 0, h + 0.03, 0));
  var c1 = box(0.05, 0.1, 0.07, o.gold ? M.gold : M.ridge, w * 0.25, h + 0.08, 0); c1.rotation.z = 0.85; rc.add(c1);
  var c2 = box(0.05, 0.1, 0.07, o.gold ? M.gold : M.ridge, -w * 0.25, h + 0.08, 0); c2.rotation.z = -0.85; rc.add(c2);
  if (o.finial) {
    rc.add(sph(0.036, M.gold, 0, h + 0.1, 0));
    rc.add(box(0.03, 0.09, 0.03, M.gold, 0, h + 0.16, 0));
    rc.add(sph(0.026, M.gold, 0, h + 0.22, 0));
    rc.add(cone(0.02, 0.05, 8, M.gold, 0, h + 0.27, 0));
  }
  return g;
}

/* 木格窗：胡桃框 + 暖纸 + 竖棂横格 */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  g.name = 'lattice-windows';
  g.add(box(w + 0.05, h + 0.05, 0.03, M.woodD));
  g.add(box(w, h, 0.028, M.paper, 0, 0, 0.004));
  var muns = o.muns === undefined ? 2 : o.muns, i;
  for (i = 0; i < muns; i++) {
    g.add(box(0.024, h, 0.034, M.wood, -w / 2 + (i + 1) * w / (muns + 1), 0, 0.006));
  }
  g.add(box(w, 0.022, 0.034, M.wood, 0, 0, 0.006));
  return g;
}

/* 木板门：暗洞 + 板门 + 小披檐 */
function woodDoor(M, w, h, y0) {
  var g = grp();
  g.name = 'door-assembly';
  g.add(box(w + 0.07, h + 0.05, 0.035, M.woodD, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.04, M.ink, 0, y0 + h / 2, -0.005));
  g.add(box(w * 0.9, h * 0.92, 0.042, M.wood, 0, y0 + h / 2, 0.006));
  g.add(box(w + 0.12, 0.045, 0.09, M.ridge, 0, y0 + h + 0.055, 0.012));
  return g;
}

/* 街面铺子：木柱 + 柜台 + 货担（罐/布包/托盘）—— lv2/3/4 固有 */
function shopBay(M, w, y0, h) {
  var g = grp();
  g.name = 'shop-bay';
  g.add(box(0.05, h, 0.05, M.wood, -w / 2 + 0.02, y0 + h / 2, 0.34));
  g.add(box(0.05, h, 0.05, M.wood, w / 2 - 0.02, y0 + h / 2, 0.34));
  g.add(box(w, 0.05, 0.3, M.woodL, 0, y0 + 0.26, 0.2));                       /* 柜台面 */
  g.add(box(w - 0.06, 0.2, 0.24, M.woodD, 0, y0 + 0.13, 0.18));               /* 柜身 */
  g.add(cyl(0.06, 0.05, 0.09, 10, M.lacqR, -w * 0.2, y0 + 0.33, 0.2));        /* 罐 */
  g.add(sph(0.045, M.cloth, w * 0.16, y0 + 0.32, 0.2));                       /* 布包 */
  g.add(box(0.12, 0.03, 0.09, M.woodL, w * 0.3, y0 + 0.3, 0.2));              /* 托盘 */
  return g;
}

/* 藏青布棚：斜棚 + 垂浪檐边（平江路识别件） */
function navyAwning(M, w, y0, z0) {
  var g = grp();
  g.name = 'navy-awning';
  var slope = box(w, 0.025, 0.34, M.cloth, 0, y0 + 0.07, z0 - 0.14);
  slope.rotation.x = 0.42; g.add(slope);
  var i;
  for (i = 0; i < 4; i++) {
    var v = box(w / 4 - 0.015, 0.05, 0.02, M.cloth, -w / 2 + (i + 0.5) * (w / 4), y0 + 0.012 + (i % 2) * 0.014, z0 + 0.015);
    v.rotation.x = 0.42;
    g.add(v);
  }
  return g;
}

/* 披檐（铺面顶）：单坡小瓦 + 翘角 */
function leanToRoof(M, w, d, y0, z0) {
  var g = grp();
  g.name = 'lean-to-roof';
  var slope = box(w + 0.16, 0.032, d, M.roofSun, 0, y0 + 0.05, z0 + d * 0.18);
  slope.rotation.x = 0.42; g.add(slope);
  g.add(box(w + 0.18, 0.04, 0.022, M.woodD, 0, y0 + 0.115, z0 + d * 0.52));
  var sx;
  for (sx = -1; sx <= 1; sx += 2) {
    var b = box(0.13, 0.024, 0.024, M.ridge, sx * (w / 2 + 0.05), y0 + 0.1, z0 + d * 0.5);
    b.rotation.z = -sx * 0.5; g.add(b);
  }
  return g;
}

/* 红灯笼：金盖金底 + 红壳 + 穗（材质随相位呼吸） */
function lantern(M, s, anims, phase) {
  var g = grp();
  g.name = 'lanterns';
  s = s || 1;
  var pk = ((phase % 4) + 4) % 4;
  var bm = MAT('p21lant' + pk, function () { return std('#c9402e', { rough: 0.5, emissive: '#ff8a4a', ei: 0.55 }); });
  g.add(cyl(0.034 * s, 0.046 * s, 0.03 * s, 10, M.gold, 0, 0.1 * s, 0));
  var body = sph(0.08 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.046 * s, 0.034 * s, 0.03 * s, 10, M.gold, 0, -0.095 * s, 0));
  g.add(cyl(0.007 * s, 0.007 * s, 0.07 * s, 10, M.lacqR, 0, -0.15 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.1 + pk * 1.6); });
  return g;
}

/* 竖板黑底金字招牌（摆动） */
function signBoard(M, anims, phase) {
  var g = grp();
  g.name = 'sign-board';
  var pivot = grp(); pivot.position.y = -0.02; g.add(pivot);
  pivot.add(box(0.15, 0.5, 0.035, M.woodD, 0, -0.27, 0));
  var face = mesh(new THREE.PlaneGeometry(0.12, 0.44),
    new THREE.MeshStandardMaterial({ map: getTex('signV', texSignV), roughness: 0.6, metalness: 0.05, flatShading: true }));
  face.position.set(0, -0.27, 0.019); pivot.add(face);
  anims.push(function (t) { pivot.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.05; });
  return g;
}

/* 金字牌匾（lv4） */
function goldPlaque(M) {
  var g = grp();
  g.name = 'gold-plaque';
  g.add(box(0.46, 0.15, 0.04, M.gold));
  var face = mesh(new THREE.PlaneGeometry(0.42, 0.12),
    new THREE.MeshStandardMaterial({ map: getTex('plaqueG', texPlaqueG), roughness: 0.45, metalness: 0.4, flatShading: true }));
  face.position.z = 0.021; g.add(face);
  return g;
}

/* 石踏步（前坪向岛沿下行） */
function stoneSteps(M, n, w, x, z0, dir) {
  var g = grp();
  g.name = 'stone-steps';
  var i;
  for (i = 0; i < n; i++) {
    g.add(box(w, 0.045, 0.13, M.stoneD, x, 0.085 + (n - 1 - i) * 0.045, z0 + dir * (i * 0.13 + 0.065)));
  }
  g.add(box(w + 0.06, 0.03, n * 0.13 + 0.04, M.stoneD, x, 0.075, z0 + dir * (n * 0.13) / 2));
  return g;
}

/* 水埠头：入水石阶（平江路识别件） */
function quaySteps(M, pad) {
  var g = grp();
  g.name = 'street-front';
  var i;
  for (i = 0; i < 2; i++) {
    g.add(box(0.2, 0.035, 0.09, M.stoneD, 0.95, 0.062 - i * 0.012, pad.wz0 + 0.05 + i * 0.085));
  }
  return g;
}

/* 圆冠树 / 灌丛 */
function treeRound(M, s) {
  var g = grp();
  g.name = 'street-front';
  s = s || 1;
  g.add(cyl(0.022 * s, 0.035 * s, 0.3 * s, 10, M.woodD, 0, 0.15 * s, 0));
  var b1 = sph(0.14 * s, M.treeG, 0, 0.38 * s, 0); g.add(b1);
  var b2 = sph(0.1 * s, M.treeD, 0.08 * s, 0.3 * s, 0.04 * s); b2.scale.y = 0.85; g.add(b2);
  return g;
}

/* 藤蔓（白墙爬藤，扁平贴面） */
function ivyPatch(M, s) {
  var g = grp();
  g.name = 'ivy-patches';
  s = s || 1;
  var a = sph(0.09 * s, M.ivy, 0, 0, 0); a.scale.set(1, 1.4, 0.35); g.add(a);
  var b = sph(0.06 * s, M.treeD, 0.05 * s, 0.12 * s, 0.005); b.scale.set(0.9, 1.2, 0.3); g.add(b);
  return g;
}

/* 木栏杆挑廊：上下枋 + 望柱 + 蜀柱列 */
function railUnit(M, w, slats) {
  var g = grp();
  g.name = 'balconies';
  slats = slats || 6;
  g.add(box(w, 0.03, 0.16, M.woodD, 0, 0, 0.06));
  g.add(box(w + 0.03, 0.026, 0.026, M.woodL, 0, 0.15, 0.13));
  g.add(box(0.03, 0.17, 0.03, M.woodD, -w / 2 + 0.015, 0.085, 0.12));
  g.add(box(0.03, 0.17, 0.03, M.woodD, w / 2 - 0.015, 0.085, 0.12));
  var i;
  for (i = 0; i < slats; i++) {
    g.add(box(0.018, 0.13, 0.018, M.wood, -w / 2 + 0.06 + i * (w - 0.12) / (slats - 1), 0.075, 0.125));
  }
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：风化木板壁小屋 + 木瓦圆脊顶（h≈1.0） ---- */
function level1(M, anims) {
  var g = grp();
  var pad = islandPad2(M, 2.45, 2.3);
  g.add(pad.g);
  g.add(lilyPads(M, anims));
  g.add(archBridge(M, 0.7, 0.44, (pad.wz0 + pad.wz1) / 2 - 0.07));
  g.add(quaySteps(M, pad));
  /* 石踏步（前坪向岛沿下行，前左） */
  g.add(stoneSteps(M, 3, 0.5, -0.82, 0.72, 1));
  /* 木板小屋（初创态：无瓦无灯） */
  var hx = -0.38, hz = -0.16, i;
  var hut = grp(); hut.name = 'hut-body'; g.add(hut);
  hut.add(box(1.24, 0.06, 0.94, M.stoneD, hx, 0.11, hz));
  hut.add(box(1.08, 0.5, 0.8, M.plank, hx, 0.39, hz));
  var cps = [[-0.58, -0.44], [0.58, -0.44], [-0.58, 0.44], [0.58, 0.44]];
  for (i = 0; i < 4; i++) hut.add(box(0.055, 0.56, 0.055, M.woodD, hx + cps[i][0], 0.39, hz + cps[i][1]));
  /* 板门 + 小木格窗 */
  var door = woodDoor(M, 0.26, 0.34, 0.14); put(g, door, hx - 0.28, 0, hz + 0.43);
  var win = latticeWindow(M, 0.22, 0.22, { muns: 1 }); put(g, win, hx + 0.2, 0.46, hz + 0.43);
  /* 木瓦圆脊顶（圆木滚杠 + 木瓦双坡） */
  var rf = grp(); rf.name = 'hut-roof'; put(g, rf, hx, 0.64, hz);
  var eave = 0.52, pitch = Math.atan2(0.24, eave), len = Math.sqrt(eave * eave + 0.24 * 0.24) + 0.02;
  var k;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.y = 0.24; sg.rotation.x = pitch * k; rf.add(sg);
    sg.add(box(1.26, 0.032, len, k > 0 ? M.plankL : M.plank, 0, 0, k * len / 2));
    sg.add(box(1.28, 0.04, 0.02, M.woodD, 0, -0.005, k * eave));
  }
  /* 圆木滚杠屋脊（两根原木 + 勒条，脊沿 x 向） */
  var l1 = cyl(0.032, 0.032, 1.24, 10, M.woodD, 0, 0.27, -0.05); l1.rotation.z = PI / 2; rf.add(l1);
  var l2 = cyl(0.028, 0.028, 1.24, 10, M.wood, 0, 0.27, 0.04); l2.rotation.z = PI / 2; rf.add(l2);
  rf.add(box(0.02, 0.03, 0.12, M.wood, -0.4, 0.285, 0));
  rf.add(box(0.02, 0.03, 0.12, M.wood, 0.4, 0.285, 0));
  /* 矮木栅栏（左侧） */
  for (i = 0; i < 3; i++) g.add(box(0.032, 0.2, 0.032, M.woodD, -1.06, 0.18, -0.3 + i * 0.24));
  g.add(box(0.028, 0.024, 0.52, M.woodD, -1.06, 0.24, -0.06));
  /* 幼柳（右后） */
  var wl = willow(M, 0.85, anims, 0.6, 6); put(g, wl, 0.85, 0.08, -0.66);
  /* 水面呼吸 + 纸窗微光 */
  var wm = M.water, pm = M.paper;
  anims.push(function (t) { wm.emissiveIntensity = 0.12 + 0.05 * sin(t * 0.9); });
  anims.push(function (t) { pm.emissiveIntensity = 0.14 + 0.05 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv2 洋房：两层白灰墙楼（铺面 + 蓝布棚 + 炭黑翘角瓦顶，h≈1.62） ---- */
function level2(M, anims) {
  var g = grp();
  var pad = islandPad2(M, 2.5, 2.3);
  g.add(pad.g);
  g.add(lilyPads(M, anims));
  g.add(archBridge(M, 0.72, 0.46, (pad.wz0 + pad.wz1) / 2 - 0.07));
  g.add(quaySteps(M, pad));
  g.add(stoneSteps(M, 3, 0.5, -0.86, 0.72, 1));
  /* 主楼（左后） */
  var hx = -0.36, hz = -0.1;
  var mt = grp(); mt.name = 'main-tower'; g.add(mt);
  var tw = grp(); tw.name = 'tier-walls'; mt.add(tw);
  tw.add(box(1.44, 0.06, 0.98, M.stoneD, hx, 0.11, hz));
  /* 一层：后墙/侧墙白灰 + 临街铺面开间 */
  tw.add(box(1.38, 0.56, 0.1, M.plaster, hx, 0.38, hz - 0.42));
  tw.add(box(0.1, 0.56, 0.88, M.plasterD, hx - 0.64, 0.38, hz));
  tw.add(box(0.1, 0.56, 0.88, M.plasterD, hx + 0.64, 0.38, hz));
  tw.add(box(0.5, 0.56, 0.1, M.plaster, hx + 0.43, 0.38, hz + 0.42));
  var door = woodDoor(M, 0.24, 0.36, 0.14); put(g, door, hx + 0.36, 0, hz + 0.435);
  var shop = shopBay(M, 1.0, 0.14, 0.42); put(g, shop, hx - 0.32, 0, hz + 0.24);
  var awn = navyAwning(M, 1.0, 0.6, hz + 0.42); put(g, awn, hx - 0.32, 0, 0);
  var lean = leanToRoof(M, 1.02, 0.5, 0.72, hz + 0.18); put(g, lean, hx - 0.25, 0, 0);
  var lt1 = lantern(M, 0.62, anims, 0); put(g, lt1, hx - 0.74, 0.68, hz + 0.44);
  var lt2 = lantern(M, 0.62, anims, 2); put(g, lt2, hx + 0.04, 0.68, hz + 0.44);
  var sign = signBoard(M, anims, 1.2); put(g, sign, hx - 0.78, 0.7, hz + 0.42);
  /* 二层白灰墙 + 角柱 + 木格窗 */
  tw.add(box(1.34, 0.05, 0.94, M.woodD, hx, 0.685, hz));
  tw.add(box(1.3, 0.5, 0.84, M.plaster, hx, 0.96, hz));
  var up2 = [[-0.62, -0.4], [0.62, -0.4], [-0.62, 0.4], [0.62, 0.4]];
  var i;
  for (i = 0; i < 4; i++) tw.add(box(0.05, 0.55, 0.05, M.woodD, hx + up2[i][0], 0.965, hz + up2[i][1]));
  var w1 = latticeWindow(M, 0.24, 0.26); put(g, w1, hx - 0.3, 0.98, hz + 0.435);
  var w2 = latticeWindow(M, 0.24, 0.26); put(g, w2, hx + 0.22, 0.98, hz + 0.435);
  /* 主顶：炭黑翘角瓦顶 + 白山花悬鱼 */
  var roof = tileRoofFly(M, { name: 'top-roof', w: 1.24, d: 0.94, h: 0.3, strips: 3, gable: true, fish: true });
  put(g, roof, hx, 1.21, hz);                                     /* apex≈1.56+卷尾 */
  /* 藤蔓（右前墙角）+ 角灌丛 */
  var iv = ivyPatch(M, 1); put(g, iv, hx + 0.55, 0.55, hz + 0.48);
  var bush = sph(0.08, M.treeG, 1.0, 0.16, 1.06); bush.scale.y = 0.85; g.add(bush);
  /* 垂柳（右后） */
  var wl = willow(M, 1.05, anims, 1.1, 6); put(g, wl, 0.87, 0.08, -0.66);
  var wm = M.water;
  anims.push(function (t) { wm.emissiveIntensity = 0.12 + 0.05 * sin(t * 0.9); });
  return g;
}

/* ---- lv3 大厦：三层退台楼（层层腰檐挑廊 + 灯笼成列，h≈2.16） ---- */
function level3(M, anims) {
  var g = grp();
  var pad = islandPad2(M, 2.5, 2.3);
  g.add(pad.g);
  g.add(lilyPads(M, anims));
  g.add(archBridge(M, 0.72, 0.46, (pad.wz0 + pad.wz1) / 2 - 0.07));
  g.add(quaySteps(M, pad));
  g.add(stoneSteps(M, 3, 0.5, -0.86, 0.72, 1));
  var hx = -0.36, hz = -0.08;
  var mt = grp(); mt.name = 'main-tower'; g.add(mt);
  var tw = grp(); tw.name = 'tier-walls'; mt.add(tw);
  tw.add(box(1.5, 0.06, 1.0, M.stoneD, hx, 0.11, hz));
  /* 一层：铺面（同 lv2 语汇） */
  tw.add(box(1.44, 0.52, 0.1, M.plaster, hx, 0.37, hz - 0.44));
  tw.add(box(0.1, 0.52, 0.92, M.plasterD, hx - 0.67, 0.37, hz));
  tw.add(box(0.1, 0.52, 0.92, M.plasterD, hx + 0.67, 0.37, hz));
  tw.add(box(0.5, 0.52, 0.1, M.plaster, hx + 0.44, 0.37, hz + 0.44));
  var door = woodDoor(M, 0.24, 0.34, 0.14); put(g, door, hx + 0.38, 0, hz + 0.455);
  var shop = shopBay(M, 1.04, 0.14, 0.4); put(g, shop, hx - 0.32, 0, hz + 0.26);
  var awn = navyAwning(M, 1.04, 0.56, hz + 0.44); put(g, awn, hx - 0.32, 0, 0);
  var lean = leanToRoof(M, 1.06, 0.5, 0.66, hz + 0.2); put(g, lean, hx - 0.23, 0, 0);
  var lt1 = lantern(M, 0.56, anims, 0); put(g, lt1, hx - 0.76, 0.62, hz + 0.46);
  var lt2 = lantern(M, 0.56, anims, 2); put(g, lt2, hx + 0.06, 0.62, hz + 0.46);
  var sign = signBoard(M, anims, 1.4); put(g, sign, hx - 0.78, 0.64, hz + 0.44);
  /* 二层：白灰墙 + 挑廊 + 木格窗 */
  tw.add(box(1.48, 0.05, 1.02, M.woodD, hx, 0.645, hz));
  tw.add(box(1.42, 0.42, 0.92, M.plaster, hx, 0.88, hz - 0.01));
  var b2 = railUnit(M, 1.3, 6); put(g, b2, hx, 0.67, hz + 0.42);
  var w21 = latticeWindow(M, 0.22, 0.24); put(g, w21, hx - 0.3, 0.9, hz + 0.455);
  var w22 = latticeWindow(M, 0.22, 0.24); put(g, w22, hx + 0.26, 0.9, hz + 0.455);
  /* 二层腰檐 */
  var waist = tileRoofFly(M, { name: 'waist-roofs', w: 1.36, d: 1.0, h: 0.14, strips: 2, gable: false, ridge: false });
  put(g, waist, hx, 1.11, hz - 0.01);
  /* 三层：白灰墙（略退台）+ 挑廊 + 木格窗 */
  tw.add(box(1.3, 0.05, 0.94, M.woodD, hx, 1.265, hz - 0.02));
  tw.add(box(1.24, 0.4, 0.84, M.plaster, hx, 1.49, hz - 0.03));
  var b3 = railUnit(M, 1.14, 6); put(g, b3, hx, 1.29, hz + 0.36);
  var w31 = latticeWindow(M, 0.2, 0.22); put(g, w31, hx - 0.24, 1.5, hz + 0.415);
  var w32 = latticeWindow(M, 0.2, 0.22); put(g, w32, hx + 0.24, 1.5, hz + 0.415);
  /* 三层腰檐 + 主顶（四坡翘角） */
  var waist2 = tileRoofFly(M, { name: 'waist-roofs', w: 1.18, d: 0.92, h: 0.13, strips: 2, gable: false, ridge: false });
  put(g, waist2, hx, 1.71, hz - 0.03);
  var roof = hipRoofFly(M, { name: 'top-roof', w: 1.1, d: 0.86, h: 0.3 });
  put(g, roof, hx, 1.84, hz - 0.03);                              /* apex≈2.14+卷尾 */
  /* 灯笼：二层 ×1 + 三层 ×1 */
  var lt3 = lantern(M, 0.5, anims, 1); put(g, lt3, hx - 0.62, 1.24, hz + 0.4);
  var lt4 = lantern(M, 0.5, anims, 3); put(g, lt4, hx + 0.56, 1.86, hz + 0.34);
  /* 藤蔓 ×2 + 盆栽 + 圆冠树 */
  var iv1 = ivyPatch(M, 1); put(g, iv1, hx + 0.58, 0.55, hz + 0.5);
  var iv2 = ivyPatch(M, 0.8); put(g, iv2, hx - 0.73, 1.05, hz + 0.15, PI / 2);
  g.add(cyl(0.05, 0.06, 0.09, 10, M.stoneD, hx + 0.78, 0.125, hz + 0.5));
  var pb = sph(0.07, M.treeG, hx + 0.78, 0.23, hz + 0.5); pb.scale.y = 0.85; g.add(pb);
  var tr = treeRound(M, 1.1); put(g, tr, 0.9, 0.08, -0.6);
  /* 垂柳 */
  var wl = willow(M, 1.15, anims, 1.7, 7); put(g, wl, 0.87, 0.08, -0.78);
  var wm = M.water;
  anims.push(function (t) { wm.emissiveIntensity = 0.12 + 0.05 * sin(t * 0.9); });
  return g;
}

/* ---- lv4 地标：石台基 + 厢房 + 鎏金翘角瓦顶楼阁群（h≈2.5） ---- */
function level4(M, anims) {
  var g = grp();
  var pad = islandPad2(M, 2.5, 2.3);
  g.add(pad.g);
  g.add(lilyPads(M, anims));
  g.add(archBridge(M, 0.72, 0.46, (pad.wz0 + pad.wz1) / 2 - 0.07));
  g.add(quaySteps(M, pad));
  g.add(stoneSteps(M, 3, 0.5, -0.86, 0.72, 1));
  /* 石台基（后场）+ 垂带踏步 */
  var hx = -0.25, hz = -0.1;
  g.add(box(2.0, 0.12, 1.34, M.stone, hx, 0.14, hz - 0.14));
  g.add(box(0.56, 0.05, 0.2, M.stoneD, hx - 0.3, 0.225, hz + 0.72));
  /* 主楼：三层楼阁 */
  var mt = grp(); mt.name = 'main-tower'; g.add(mt);
  var tw = grp(); tw.name = 'tier-walls'; mt.add(tw);
  tw.add(box(1.52, 0.06, 1.02, M.stoneD, hx, 0.23, hz));
  /* 一层：铺面 + 门廊（蓝布棚 + 金匾） */
  tw.add(box(1.46, 0.5, 0.1, M.plaster, hx, 0.52, hz - 0.44));
  tw.add(box(0.1, 0.5, 0.94, M.plasterD, hx - 0.68, 0.52, hz));
  tw.add(box(0.1, 0.5, 0.94, M.plasterD, hx + 0.68, 0.52, hz));
  tw.add(box(0.5, 0.5, 0.1, M.plaster, hx + 0.45, 0.52, hz + 0.44));
  var door = woodDoor(M, 0.26, 0.34, 0.26); put(g, door, hx + 0.39, 0, hz + 0.475);
  var shop = shopBay(M, 1.06, 0.26, 0.38); put(g, shop, hx - 0.32, 0, hz + 0.27);
  var awn = navyAwning(M, 1.06, 0.66, hz + 0.46); put(g, awn, hx - 0.32, 0, 0);
  var plq = goldPlaque(M); put(g, plq, hx - 0.32, 0.76, hz + 0.48);
  /* 一层腰檐（披檐翘角） */
  var lean = leanToRoof(M, 1.5, 0.5, 0.78, hz + 0.2); put(g, lean, hx, 0, 0);
  var lt1 = lantern(M, 0.52, anims, 0); put(g, lt1, hx - 0.85, 0.74, hz + 0.48);
  var lt2 = lantern(M, 0.52, anims, 2); put(g, lt2, hx + 0.18, 0.74, hz + 0.48);
  /* 二层：挑廊 + 窗 */
  tw.add(box(1.5, 0.05, 1.04, M.woodD, hx, 0.795, hz));
  tw.add(box(1.44, 0.4, 0.94, M.plaster, hx, 1.02, hz - 0.01));
  var b2 = railUnit(M, 1.34, 5); put(g, b2, hx, 0.82, hz + 0.44);
  var w21 = latticeWindow(M, 0.22, 0.22); put(g, w21, hx - 0.32, 1.04, hz + 0.475);
  var w22 = latticeWindow(M, 0.22, 0.22); put(g, w22, hx + 0.3, 1.04, hz + 0.475);
  var waist1 = tileRoofFly(M, { name: 'waist-roofs', w: 1.38, d: 1.02, h: 0.13, strips: 2, gable: false, ridge: false });
  put(g, waist1, hx, 1.24, hz - 0.01);
  var lt3 = lantern(M, 0.48, anims, 1); put(g, lt3, hx - 0.62, 1.36, hz + 0.42);
  var lt4 = lantern(M, 0.48, anims, 3); put(g, lt4, hx + 0.6, 1.36, hz + 0.42);
  /* 三层：红柱廊 + 窗 */
  tw.add(box(1.32, 0.05, 0.96, M.woodD, hx, 1.415, hz - 0.02));
  tw.add(box(1.26, 0.36, 0.86, M.plaster, hx, 1.62, hz - 0.03));
  var c1 = cyl(0.028, 0.032, 0.34, 10, M.lacqR, hx - 0.5, 1.6, hz + 0.34); tw.add(c1);
  var c2 = cyl(0.028, 0.032, 0.34, 10, M.lacqR, hx + 0.5, 1.6, hz + 0.34); tw.add(c2);
  tw.add(cyl(0.036, 0.036, 0.02, 10, M.gold, hx - 0.5, 1.78, hz + 0.34));
  tw.add(cyl(0.036, 0.036, 0.02, 10, M.gold, hx + 0.5, 1.78, hz + 0.34));
  var b3 = railUnit(M, 0.84, 4); put(g, b3, hx, 1.44, hz + 0.42);
  var w31 = latticeWindow(M, 0.2, 0.2); put(g, w31, hx - 0.24, 1.63, hz + 0.435);
  var w32 = latticeWindow(M, 0.2, 0.2); put(g, w32, hx + 0.24, 1.63, hz + 0.435);
  var waist2 = tileRoofFly(M, { name: 'waist-roofs', w: 1.2, d: 0.94, h: 0.12, strips: 2, gable: false, ridge: false });
  put(g, waist2, hx, 1.82, hz - 0.03);
  /* 主顶：四坡鎏金翘角 + 金脊 + 宝顶 */
  var roof = hipRoofFly(M, { name: 'top-roof', w: 1.12, d: 0.88, h: 0.3, gold: true, finial: true });
  put(g, roof, hx, 1.96, hz - 0.03);                              /* 宝顶≈2.5 */
  /* 厢房披屋（右侧） */
  var wx = hx + 1.04;
  var aw = grp(); aw.name = 'annex-wing'; g.add(aw);
  aw.add(box(0.52, 0.05, 0.9, M.stoneD, wx, 0.225, hz - 0.2));
  aw.add(box(0.48, 0.42, 0.86, M.plaster, wx, 0.46, hz - 0.2));
  aw.add(box(0.12, 0.18, 0.03, M.ink, wx, 0.45, hz + 0.245));
  aw.add(box(0.12, 0.14, 0.02, M.woodD, wx - 0.12, 0.56, hz + 0.245));
  var wr = tileRoofFly(M, { w: 0.44, d: 0.84, h: 0.13, strips: 2, gable: false, ridge: false });
  put(g, wr, wx, 0.69, hz - 0.2);
  /* 门口灯笼 ×2（厢房前） */
  var lt5 = lantern(M, 0.46, anims, 0.5); put(g, lt5, wx - 0.3, 0.56, hz + 0.47);
  var lt6 = lantern(M, 0.46, anims, 2.5); put(g, lt6, wx + 0.3, 0.56, hz + 0.47);
  /* 大绿树（左前）+ 垂柳 ×2（右后 + 左后） */
  var tr = treeRound(M, 1.5); put(g, tr, -0.44, 0.08, 1.0);
  var wl1 = willow(M, 1.2, anims, 0.9, 5); put(g, wl1, 0.92, 0.08, -0.8);
  var wl2 = willow(M, 0.8, anims, 2.2, 4); put(g, wl2, -1.06, 0.08, -0.86);
  var wm = M.water;
  anims.push(function (t) { wm.emissiveIntensity = 0.12 + 0.05 * sin(t * 0.9); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[21] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_21_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 21;
  g.userData.level = lv;
  g.userData.region = 'g5';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
