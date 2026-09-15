/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_21.js (v2 精修)
 * -------------------------------------------------------------------------------------
 * 格 21「平江路」(g5 江南烟雨) 独属建筑：苏式水巷四阶生长史
 * 参考图 refs/prop_21.png 高保真复刻；v2 在 v1 骨架上按 REFINE_SPEC 精修：
 *   1) 灰瓦曲坡凹面（近脊陡/檐口缓三段弦面）+ 檐口起翘条（lv2+ 瓦顶全部落实）
 *   2) 石拱桥拱券分环（放射楔块券石 ×7）+ 栏板上加望柱柱头 + 桥头石
 *   3) 白灰墙 256px 肌理重绘：竖向雨水渍（渐淡多段）+ 露砖底 + 墙脚溅渍青苔
 *   4) 月洞门院墙（白灰墙身 + 瓦顶墙帽 + 木环门框）lv2→lv4 逐级生长
 *   5) 木构架榫卯语汇：柱础石 / 柱头雀替 / 穿枋 / 墙角柱础 + 悬鱼惹草加大
 *   6) 水埠头加深入水石阶 ×3 + 系船石墩 + 条石嘴；前坪石板铺地
 *   7) 垂柳枝束分层（外层长垂枝 + 内层短垂枝双相位摆动）+ 斜出枝
 *   8) 红灯笼金属件：金属挂钩环 + 吊杆 + 中腰金箍 + 锥托双穗须
 *   9) 修正 v1 hipRoofFly 翼角悬于脊部 → 落到檐口四角（lv3/lv4）
 *  10) 纹理升级 256px（鳞瓦/木板/块石/水面），球段 16×12、圆柱 ≥12
 *
 * 风格族谱（同一块水巷岛的同一种生长，非四座无关建筑；与 v1 一致不推翻）：
 *   lv1 小屋   风化木板壁小屋 + 木瓦圆脊顶 + 木栅栏 + 幼柳（h≈0.94）
 *   lv2 洋房   两层白灰墙楼：木柱铺面 + 藏青布棚 + 披檐 + 炭黑翘角瓦顶 + 悬鱼 + 月洞院墙
 *   lv3 大厦   三层退台：层层腰檐挑廊 + 木格窗 + 灯笼成列 + 藤蔓 + 圆冠树（h≈2.27）
 *   lv4 地标   石台基 + 厢房披屋 + 门廊金字牌匾 + 鎏金翼角/金脊/宝顶（h≈2.56）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[21] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤350；userData.anim=[fn(t,dt)]。
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
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function torus(r, t, mat, x, y, z) { var o = mesh(new THREE.TorusGeometry(r, t, 8, 16), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
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

/* 炭黑鳞瓦 256px：鳞次搭接瓦行（弧缘）+ 竖缝错茬 + 三阶行色 + 陶面噪点（map+bump 同源） */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#212429'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  var tones = ['#262a30', '#2b2f35', '#24282e'];
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = tones[i % 3];
    g.fillRect(0, y, S, rh);
    /* 瓦行弧缘（亮口朝下檐）+ 竖向接头错缝 */
    g.strokeStyle = '#48505a'; g.lineWidth = 2.5;
    for (k = 0; k < 10; k++) {
      var x = ((i % 2) * (rh / 2) + k * rh) % S;
      g.beginPath(); g.arc(x + rh / 2, y + rh, rh / 2, PI, 0); g.stroke();
      g.fillStyle = 'rgba(12,14,18,0.5)'; g.fillRect((x + rh) % S, y, 2, rh);
    }
    g.fillStyle = '#141619'; g.fillRect(0, y, S, 2.5);
    g.fillStyle = '#3d444d'; g.fillRect(0, y + 2.5, S, 2);
  }
  for (i = 0; i < 260; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(10,12,15,0.10)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 风化木板 256px（lv1 壁 + 木瓦顶）：横板 + 板缝 + 木纹拉丝 + 节疤 */
function texPlank() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#8a7660'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#937f68' : '#84705a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#55432e'; g.fillRect(0, y + rh - 3, S, 3);
    for (k = 0; k < 8; k++) {
      g.fillStyle = (k + i) % 2 ? 'rgba(255,244,220,0.08)' : 'rgba(60,44,26,0.11)';
      g.fillRect(0, y + 4 + ((k * 17 + i * 9) % (rh - 8)), S, 1.5);
    }
    /* 节疤（每板 1 枚，错位） */
    var kx = ((i * 73 + 40) % (S - 20)) + 10, ky = y + rh / 2 + ((i % 2) - 0.5) * 8;
    g.strokeStyle = 'rgba(62,46,28,0.55)'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(kx, ky, 5, 3, 0.4, 0, PI * 2); g.stroke();
    g.fillStyle = 'rgba(52,38,22,0.6)'; g.fillRect(kx - 1.5, ky - 1.5, 3, 3);
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = 'rgba(48,36,20,0.15)';
    g.fillRect((i * 31) % S, (i * 47) % S, 2, 6);
  }
  return toTex(cv, true);
}
/* 暖白灰墙 256px：斑驳灰浆 + 竖向雨水渍（渐淡多段）+ 露砖底 + 墙脚溅渍青苔 */
function texPlaster() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#f0ebe0'; g.fillRect(0, 0, S, S);
  var i, j;
  /* 斑驳灰浆（亮/暗两色叠） */
  for (i = 0; i < 80; i++) {
    g.fillStyle = i % 2 ? 'rgba(206,196,172,0.32)' : 'rgba(255,252,244,0.4)';
    g.fillRect((i * 67) % S, (i * 97) % S, 12 + (i * 13) % 22, 7 + (i * 9) % 16);
  }
  /* 露砖底（下角两处，风雨剥落见胎） */
  g.fillStyle = 'rgba(190,160,120,0.32)';
  g.fillRect(18, S - 54, 36, 22);
  g.fillRect(S - 74, S - 42, 42, 18);
  g.strokeStyle = 'rgba(150,120,88,0.30)'; g.lineWidth = 1.5;
  g.strokeRect(18, S - 54, 36, 22);
  /* 竖向雨水渍：9 条自上而下渐淡的多段条 */
  for (i = 0; i < 9; i++) {
    var x = 10 + i * 27 + (i % 3) * 5, w2 = 3 + (i % 4) * 2;
    var y0 = (i % 2) ? 0 : 14, hh = 120 + (i * 37) % 90;
    for (j = 0; j < 6; j++) {
      g.fillStyle = 'rgba(150,138,112,' + (0.17 - j * 0.024).toFixed(3) + ')';
      g.fillRect(x + (j % 2), y0 + (hh / 6) * j, w2 - (j % 2), hh / 6 + 2);
    }
  }
  /* 墙脚溅渍带 + 青苔点 */
  g.fillStyle = 'rgba(168,152,122,0.30)'; g.fillRect(0, S - 26, S, 26);
  g.fillStyle = 'rgba(118,140,78,0.22)';
  for (i = 0; i < 14; i++) g.fillRect((i * 53 + 7) % S, S - 20 + (i * 7) % 14, 4 + (i % 3) * 3, 3);
  for (i = 0; i < 150; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,252,244,0.05)' : 'rgba(140,128,104,0.08)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 花岗岩块石 256px（桥/驳岸/踏步）：细密错缝块石 + 三阶石色 + 石屑噪点 */
function texAshlar() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#c3b291'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  var tones = ['rgba(255,248,230,0.10)', 'rgba(96,82,58,0.13)', 'rgba(214,200,168,0.16)'];
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = 'rgba(105,90,64,0.55)'; g.fillRect(0, y + rh - 2.5, S, 2.5);
    var off = (i % 2) ? S / 10 : 0;
    for (k = 0; k < 5; k++) {
      var x = (off + k * (S / 5)) % S;
      g.fillStyle = 'rgba(105,90,64,0.55)'; g.fillRect(x, y, 2.5, rh - 2.5);
      g.fillStyle = tones[(k + i) % 3];
      g.fillRect(x + 3, y + 3, S / 5 - 7, rh - 8);
    }
  }
  for (i = 0; i < 170; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,250,235,0.08)' : 'rgba(80,68,48,0.11)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 藏青布纹（雨棚）128px：经纬织线 + 上缘亮口 */
function texWeave() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#414865'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < S; i += 4) {
    g.fillStyle = (i % 8) ? 'rgba(255,255,255,0.05)' : 'rgba(10,12,24,0.09)';
    g.fillRect(i, 0, 2, S);
  }
  for (i = 0; i < S; i += 6) {
    g.fillStyle = 'rgba(20,24,44,0.10)';
    g.fillRect(0, i, S, 1.5);
  }
  g.fillStyle = 'rgba(96,106,158,0.32)'; g.fillRect(0, 0, S, 8);
  return toTex(cv, true);
}
/* 水面 256px：青碧 + 涟漪弧 + 横向微波 + 深斑 */
function texWater() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#2e6058'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 14; i++) {
    g.fillStyle = 'rgba(22,56,52,0.30)';
    g.fillRect((i * 53) % S, (i * 37) % S, 34 + (i * 11) % 26, 16 + (i * 7) % 14);
  }
  g.strokeStyle = 'rgba(214,244,238,0.17)'; g.lineWidth = 2;
  for (i = 0; i < 10; i++) {
    g.beginPath();
    g.arc((i * 61 + 20) % S, (i * 43 + 14) % S, 12 + (i * 5) % 12, PI * 1.1, PI * 1.9);
    g.stroke();
  }
  g.strokeStyle = 'rgba(226,248,242,0.10)'; g.lineWidth = 1.5;
  for (i = 0; i < 6; i++) {
    g.beginPath();
    g.moveTo(0, (i * 43 + 21) % S);
    g.bezierCurveTo(S / 3, (i * 43 + 13) % S, S * 2 / 3, (i * 43 + 31) % S, S, (i * 43 + 19) % S);
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
    stoneL:    MAT('p21stoneL', function () { var t = getTex('ashlar', texAshlar); return std('#efe6d2', { map: t, rough: 0.88 }); }),
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

/* 草地水巷沙盘：草皮三拼（水湾为真实凹口）+ 土崖 + 石驳岸 + 压沿块石 + 前坪石板
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
  /* 压沿块石（草缘）+ 石缝草丛 + 卵石（kerb-stones 语义组） */
  var ks = grp(); ks.name = 'kerb-stones'; g.add(ks);
  var i;
  for (i = 0; i < 4; i++) ks.add(box(0.085, 0.05, 0.085, M.stoneD, -hw + 0.16 + i * 0.32, 0.095, wz1 + (hd - wz1) / 2));
  for (i = 0; i < 2; i++) ks.add(box(0.085, 0.05, 0.085, M.stoneD, -hw + 0.12, 0.095, wz0 + 0.14 + i * 0.22));
  for (i = 0; i < 2; i++) ks.add(cone(0.024, 0.055, 6, M.grassD, -hw + 0.3 + i * 0.5, 0.1, -hd + 0.22 + (i % 2) * 0.1));
  for (i = 0; i < 2; i++) ks.add(cone(0.02, 0.05, 6, M.treeD, -0.16 - i * 0.2, 0.1, wz1 - 0.08 - (i % 2) * 0.06));
  var rock = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD);
  rock.position.set(-hw + 0.36, 0.09, wz0 - 0.24);
  ks.add(rock);
  /* 前坪石板铺地（三拼石板，落在前草带内 z wz1..hd，对应参考图前坪） */
  var pv = grp(); pv.name = 'street-front'; g.add(pv);
  var pvd = hd - wz1 - 0.02, pvz = (wz1 + hd) / 2;
  pv.add(box(0.5, 0.014, pvd, M.stoneL, -0.45, 0.092, pvz));
  pv.add(box(0.5, 0.014, pvd, M.stone, 0.02, 0.092, pvz));
  pv.add(box(0.44, 0.014, pvd, M.stoneL, 0.5, 0.092, pvz));
  return { g: g, wz0: wz0, wz1: wz1, wx0: wx0, wx1: wx1, hd: hd, hw: hw };
}

/* 睡莲：圆叶 ×5 + 红蕖 ×2 + 花苞（浮动动画） */
function lilyPads(M, anims) {
  var g = grp();
  g.name = 'lily-pads';
  var spots = [[0.72, 0.72], [0.98, 0.85], [0.52, 0.93], [1.1, 0.7], [0.62, 0.6]];
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
  g.add(sph(0.018, M.blossom, spots[3][0] - 0.02, 0.092, spots[3][1] + 0.03));
  g.add(cone(0.014, 0.035, 6, M.blossom, spots[2][0] + 0.02, 0.1, spots[2][1] - 0.02));
  return g;
}

/* 石拱桥 v2：块石拱身（挤出拱洞）+ 拱券分环楔块券石 ×7 + 弧面踏步
 *   + 实心栏板 + 望柱柱头 ×3/侧 + 桥头石 ×2（每阶固有） */
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
  /* 拱券分环：放射状楔块券石 ×7（亮色石镶边，对照参考图券石分环） */
  var nV = 7, R = r + 0.025, k;
  for (k = 0; k < nV; k++) {
    var a = 0.1 + k * (PI - 0.2) / (nV - 1);
    var v = box(W + 0.024, 0.09, 0.05, M.stoneL, x, 0.081 + sin(a) * R, zc - cos(a) * R);
    v.rotation.x = a;
    g.add(v);
  }
  /* 弧面踏步（拱顶人行面，拱心高两端低）+ 栏板 + 望柱（deck-steps 语义组） */
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
      /* 望柱：柱身 + 柱头方斗（栏板望柱，对照参考图栏杆节点） */
      var px = x + s * (W / 2 - 0.017), pz = zc + u2 * zLen;
      deck.add(box(0.042, 0.1, 0.042, M.stoneL, px, 0.39 + hh2 + 0.045, pz));
      deck.add(box(0.056, 0.022, 0.056, M.stoneD, px, 0.39 + hh2 + 0.104, pz));
    }
  }
  /* 桥头石（两端压条） */
  g.add(box(W + 0.06, 0.045, 0.07, M.stoneD, x, 0.4, zc - zLen / 2 + 0.02));
  g.add(box(W + 0.06, 0.045, 0.07, M.stoneD, x, 0.4, zc + zLen / 2 - 0.02));
  return g;
}

/* 凹曲坡面（灰瓦曲坡）：近脊陡/檐口缓三段弦面 + 段间压条 + 檐口起翘条
 * axis 'z'：落坡朝 ±z（dir=±1）；axis 'x'：落坡朝 ±x。 */
function roofSlopePanels(M, mat, spanW, eave, h, dir, axis, segs) {
  var gg = grp();
  var n = segs || 3, pts = [], i;
  for (i = 0; i <= n; i++) {
    var u = i / n;
    pts.push({ r: eave * u, y: h * (1 - sin(u * PI / 2)) });   /* 凹曲 profile */
  }
  var angLast = 0;
  for (i = 0; i < n; i++) {
    var A = pts[i], B = pts[i + 1];
    var dx = B.r - A.r, dy = A.y - B.y;
    var len = Math.sqrt(dx * dx + dy * dy) + 0.045;            /* 搭接防缝 */
    var ang = Math.atan2(dy, dx);
    var midR = (A.r + B.r) / 2, midY = (A.y + B.y) / 2 + 0.012;
    if (i === n - 1) angLast = ang;
    var aEff = (i === n - 1) ? ang * 0.72 : ang;               /* 檐段减角 → 边缘上翘 */
    var p = (axis === 'z') ? box(spanW, 0.032, len, mat) : box(len, 0.032, spanW, mat);
    if (axis === 'z') { p.position.set(0, midY, dir * midR); p.rotation.x = dir * aEff; }
    else { p.position.set(dir * midR, midY, 0); p.rotation.z = -dir * aEff; }
    gg.add(p);
  }
  /* 段间瓦垄压条（盖缝 + 垄线） */
  for (i = 1; i < n; i++) {
    var J = pts[i];
    var angJ = Math.atan2(pts[i - 1].y - J.y, J.r - pts[i - 1].r);
    var st = (axis === 'z') ? box(spanW - 0.05, 0.016, 0.055, M.ridge) : box(0.055, 0.016, spanW - 0.05, M.ridge);
    if (axis === 'z') { st.position.set(0, J.y + 0.028, dir * J.r); st.rotation.x = dir * angJ; }
    else { st.position.set(dir * J.r, J.y + 0.028, 0); st.rotation.z = -dir * angJ; }
    gg.add(st);
  }
  /* 檐口起翘条（封檐上飘，与翼角呼应） */
  var fs = (axis === 'z') ? box(spanW + 0.02, 0.02, 0.09, mat) : box(0.09, 0.02, spanW + 0.02, mat);
  var flick = 0.14 - angLast * 0.3;
  if (axis === 'z') { fs.position.set(0, 0.05, dir * (eave + 0.01)); fs.rotation.x = -dir * flick; }
  else { fs.position.set(dir * (eave + 0.01), 0.05, 0); fs.rotation.z = dir * flick; }
  gg.add(fs);
  return gg;
}

/* 垂柳 v2：斜干 + 斜出枝 + 三团圆冠 + 下挂枝束双层（外长内短、双相位摆动） */
function willow(M, s, anims, phase, strands) {
  var g = grp();
  g.name = 'weeping-willow';
  s = s || 1; strands = strands || 7;
  var trunk = cyl(0.028 * s, 0.046 * s, 0.62 * s, 12, M.woodD, 0, 0.31 * s, 0);
  trunk.rotation.z = 0.1; g.add(trunk);
  var br = cyl(0.012 * s, 0.02 * s, 0.34 * s, 12, M.woodD, 0.09 * s, 0.5 * s, 0.02 * s);
  br.rotation.z = -0.7; br.rotation.x = 0.25; g.add(br);
  var c1 = sph(0.15 * s, M.leafA, 0.05 * s, 0.68 * s, 0); g.add(c1);
  var c2 = sph(0.11 * s, M.leafB, -0.09 * s, 0.62 * s, 0.05 * s); c2.scale.y = 0.85; g.add(c2);
  var c3 = sph(0.08 * s, M.leafC, 0.13 * s, 0.6 * s, -0.07 * s); c3.scale.y = 0.9; g.add(c3);
  var tints = [M.leafA, M.leafB, M.leafC];
  /* 外层长垂枝束（willow-strands 语义组） */
  var hang = grp(); hang.position.set(0.05 * s, 0.66 * s, 0); hang.name = 'willow-strands'; g.add(hang);
  var i, n1 = strands;
  for (i = 0; i < n1; i++) {
    var ang = (i / n1) * PI * 2 + phase;
    var rad = 0.13 * s;
    var len = (0.3 + 0.09 * ((i * 7) % 3)) * s;
    var st = mesh(new THREE.BoxGeometry(0.02 * s, len, 0.02 * s), tints[i % 3]);
    st.position.set(cos(ang) * rad, -len / 2 + 0.02, sin(ang) * rad);
    st.rotation.y = -ang;
    hang.add(st);
  }
  /* 内层短垂枝束（分层 2，摆动相位错开） */
  var hang2 = grp(); hang2.position.set(0.04 * s, 0.73 * s, 0); hang2.name = 'willow-strands-inner'; g.add(hang2);
  var n2 = Math.max(3, strands - 3);
  for (i = 0; i < n2; i++) {
    var ang2 = (i / n2) * PI * 2 + phase + 0.5;
    var rad2 = 0.075 * s;
    var len2 = (0.16 + 0.05 * ((i * 5) % 3)) * s;
    var st2 = mesh(new THREE.BoxGeometry(0.017 * s, len2, 0.017 * s), tints[(i + 1) % 3]);
    st2.position.set(cos(ang2) * rad2, -len2 / 2 + 0.015, sin(ang2) * rad2);
    st2.rotation.y = -ang2;
    hang2.add(st2);
  }
  anims.push(function (t) {
    hang.rotation.z = sin(t * 1.15 + phase) * 0.05;
    hang.rotation.x = cos(t * 0.9 + phase * 1.3) * 0.03;
  });
  anims.push(function (t) {
    hang2.rotation.z = sin(t * 1.6 + phase + 1.1) * 0.04;
    hang2.rotation.x = cos(t * 1.2 + phase) * 0.025;
  });
  return g;
}

/* 炭黑鳞瓦双坡顶 v2：凹曲三段弦面 + 段间压条 + 檐口起翘条 + 翼角斜梁
 * + 卷尾正脊 + 白山花悬鱼惹草 —— 苏式识别件 */
function tileRoofFly(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), i;
  if (o.name) g.name = o.name;
  var over = o.over !== undefined ? o.over : 0.09;
  var eave = d / 2 + over;
  var kickMat = o.gold ? M.gold : M.ridge;
  var k;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); g.add(sg);
    sg.add(roofSlopePanels(M, k > 0 ? M.roofSun : M.roofShade, w + over * 2, eave, h, k, 'z', o.segs));
    /* 檐口封板 */
    var fb = box(w + over * 2 + 0.02, 0.045, 0.022, M.woodD, 0, 0.02, k * (eave - 0.01));
    fb.rotation.x = k * 0.12; sg.add(fb);
    /* 翼角：四角斜梁上翘（flying-corners 语义组） */
    var kick = grp(); kick.name = 'flying-corners'; sg.add(kick);
    var sx;
    for (sx = -1; sx <= 1; sx += 2) {
      var beam = box(0.16, 0.026, 0.026, kickMat, sx * (w / 2 + over - 0.05), 0.055, k * (eave - 0.05));
      beam.rotation.z = -sx * 0.5;
      beam.rotation.y = sx * k * 0.62;
      kick.add(beam);
    }
  }
  if (o.gable !== false) {
    /* 白灰山花 + 悬鱼惹草（gable-fish 语义组） */
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
      for (i = 0; i < 2; i++) {
        var sgn = i ? -1 : 1;
        /* 悬鱼：鱼身锥 + 尾鳍（v2 加大） */
        var f1 = cone(0.036, 0.11, 8, M.woodD, sgn * fx, h * 0.42, 0);
        f1.rotation.x = PI; f1.scale.x = 0.35; gf.add(f1);
        var f2 = box(0.014, 0.05, 0.045, M.woodD, sgn * fx, h * 0.42 - 0.065, 0);
        f2.rotation.z = sgn * 0.25; gf.add(f2);
        /* 惹草：侧边一对小叶垂饰 */
        var rc1 = cone(0.018, 0.05, 6, M.woodD, sgn * (fx - 0.02), h * 0.2, 0.05);
        rc1.rotation.x = PI; gf.add(rc1);
        var rc2 = cone(0.018, 0.05, 6, M.woodD, sgn * (fx - 0.02), h * 0.2, -0.05);
        rc2.rotation.x = PI; gf.add(rc2);
      }
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

/* 炭黑鳞瓦四坡顶 v2（lv3/lv4 主顶）：四坡凹曲 + 四角檐口翘（v1 误悬于脊部，v2 落到檐口）
 * + 卷尾正脊（lv4 鎏金 + 宝顶） */
function hipRoofFly(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  if (o.name) g.name = o.name;
  var eF = d / 2 + 0.09, eS = w / 2 + 0.09;
  var kickMat = o.gold ? M.gold : M.ridge;
  /* 前后坡（凹曲） */
  var sgF = grp(); g.add(sgF);
  sgF.add(roofSlopePanels(M, M.roofSun, w * 0.62 + 0.18, eF, h, 1, 'z'));
  var fF = box(w * 0.62 + 0.2, 0.045, 0.022, M.woodD, 0, 0.02, eF - 0.01); fF.rotation.x = 0.12; sgF.add(fF);
  var sgB = grp(); g.add(sgB);
  sgB.add(roofSlopePanels(M, M.roofShade, w * 0.62 + 0.18, eF, h, -1, 'z'));
  /* 左右坡（凹曲） */
  var slR = grp(); g.add(slR);
  slR.add(roofSlopePanels(M, M.roofShade, d * 0.72 + 0.16, eS, h, 1, 'x'));
  var slL = grp(); g.add(slL);
  slL.add(roofSlopePanels(M, M.roofShade, d * 0.72 + 0.16, eS, h, -1, 'x'));
  /* 翼角：四角檐口斜梁（flying-corners 语义组；v2 落到檐口高度） */
  var cs = [[1, 1], [1, -1], [-1, 1], [-1, -1]], i;
  var kick = grp(); kick.name = 'flying-corners'; g.add(kick);
  for (i = 0; i < 4; i++) {
    var b = box(0.15, 0.026, 0.026, kickMat, cs[i][0] * (eS - 0.05), 0.055, cs[i][1] * (eF - 0.05));
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

/* 月洞门院墙：白灰墙身（真实月洞开口）+ 瓦顶墙帽 + 两端靴头 + 木环门框
 * （lv2→lv4 逐级生长的院落边界；墙沿 x 向，面朝 ±z） */
function courtWall(M, len) {
  var g = grp();
  g.name = 'court-wall';
  var h = 0.3, t = 0.07, r = 0.11, cx = len * 0.16;
  var sh = new THREE.Shape();
  sh.moveTo(-len / 2, 0); sh.lineTo(len / 2, 0); sh.lineTo(len / 2, h); sh.lineTo(-len / 2, h); sh.closePath();
  var hole = new THREE.Path();
  hole.absarc(cx, h * 0.5, r, 0, PI * 2, true);
  sh.holes.push(hole);
  var body = mesh(new THREE.ExtrudeGeometry(sh, { depth: t, bevelEnabled: false }), M.plaster);
  body.position.z = -t / 2; g.add(body);
  /* 瓦顶墙帽：瓦条压顶 + 脊线 */
  g.add(box(len + 0.05, 0.028, 0.13, M.roofShade, 0, h + 0.014, 0));
  g.add(box(len + 0.05, 0.02, 0.035, M.ridge, 0, h + 0.037, 0));
  /* 两端靴头 */
  var ex;
  for (ex = -1; ex <= 1; ex += 2) g.add(box(0.05, 0.05, 0.15, M.plasterD, ex * (len / 2), h - 0.025, 0));
  /* 月洞门木环框 */
  var ring = torus(r + 0.012, 0.014, M.woodD, cx, h * 0.5, 0);
  g.add(ring);
  return g;
}

/* 木格窗 v2：胡桃框 + 暖纸 + 竖棂横格 + 窗台 */
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
  g.add(box(w + 0.09, 0.022, 0.05, M.woodD, 0, -h / 2 - 0.036, 0.008));   /* 窗台 */
  return g;
}

/* 木板门：暗洞 + 板门 + 门簪小披檐 */
function woodDoor(M, w, h, y0) {
  var g = grp();
  g.name = 'door-assembly';
  g.add(box(w + 0.07, h + 0.05, 0.035, M.woodD, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.04, M.ink, 0, y0 + h / 2, -0.005));
  g.add(box(w * 0.9, h * 0.92, 0.042, M.wood, 0, y0 + h / 2, 0.006));
  g.add(box(w + 0.12, 0.045, 0.09, M.ridge, 0, y0 + h + 0.055, 0.012));
  return g;
}

/* 街面铺子 v2：木柱 + 柱础石 + 柱头雀替（榫卯节点）+ 穿枋 + 柜台货担
 * （罐 ×2 / 布包 / 托盘）—— lv2/3/4 固有 */
function shopBay(M, w, y0, h) {
  var g = grp();
  g.name = 'shop-bay';
  g.add(box(0.05, h, 0.05, M.wood, -w / 2 + 0.02, y0 + h / 2, 0.34));
  g.add(box(0.05, h, 0.05, M.wood, w / 2 - 0.02, y0 + h / 2, 0.34));
  /* 柱础石（柱脚石鼓） */
  g.add(cyl(0.034, 0.04, 0.03, 12, M.stoneD, -w / 2 + 0.02, y0 + 0.015, 0.34));
  g.add(cyl(0.034, 0.04, 0.03, 12, M.stoneD, w / 2 - 0.02, y0 + 0.015, 0.34));
  /* 柱头雀替（斜托，榫卯节点暗示） */
  var br;
  for (br = -1; br <= 1; br += 2) {
    var que = box(0.055, 0.02, 0.035, M.woodD, br * (w / 2 - 0.075), y0 + h - 0.035, 0.315);
    que.rotation.y = -br * 0.6; que.rotation.z = br * 0.5;
    g.add(que);
  }
  /* 穿枋（柱头联系梁） */
  g.add(box(w, 0.035, 0.035, M.woodL, 0, y0 + h - 0.017, 0.34));
  /* 柜台 + 柜身 */
  g.add(box(w, 0.05, 0.3, M.woodL, 0, y0 + 0.26, 0.2));
  g.add(box(w - 0.06, 0.2, 0.24, M.woodD, 0, y0 + 0.13, 0.18));
  /* 货担：罐 ×2 + 布包 + 托盘 */
  g.add(cyl(0.06, 0.05, 0.09, 12, M.lacqR, -w * 0.2, y0 + 0.33, 0.2));
  g.add(cyl(0.045, 0.055, 0.07, 12, M.woodL, w * 0.32, y0 + 0.315, 0.2));
  g.add(sph(0.045, M.cloth, w * 0.16, y0 + 0.32, 0.2));
  g.add(box(0.12, 0.03, 0.09, M.woodL, w * 0.02, y0 + 0.3, 0.2));
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

/* 红灯笼 v2：金属挂钩环 + 吊杆 + 金盖金底 + 红壳 + 中腰金箍 + 锥托双穗须
 * （材质随相位呼吸） */
function lantern(M, s, anims, phase) {
  var g = grp();
  g.name = 'lanterns';
  s = s || 1;
  var pk = ((phase % 4) + 4) % 4;
  var bm = MAT('p21lant' + pk, function () { return std('#c9402e', { rough: 0.5, emissive: '#ff8a4a', ei: 0.55 }); });
  /* 金属件：挂钩环 + 吊杆 */
  var hk = torus(0.02 * s, 0.005 * s, M.gold, 0, 0.155 * s, 0);
  g.add(hk);
  g.add(cyl(0.006 * s, 0.006 * s, 0.05 * s, 12, M.gold, 0, 0.125 * s, 0));
  /* 金盖 / 金底 */
  g.add(cyl(0.034 * s, 0.046 * s, 0.03 * s, 12, M.gold, 0, 0.1 * s, 0));
  var body = sph(0.08 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  /* 中腰金属箍带 */
  g.add(cyl(0.079 * s, 0.079 * s, 0.008 * s, 12, M.gold, 0, 0, 0));
  g.add(cyl(0.046 * s, 0.034 * s, 0.03 * s, 12, M.gold, 0, -0.095 * s, 0));
  /* 穗：锥托 + 双穗须 */
  g.add(cone(0.016 * s, 0.035 * s, 8, M.gold, 0, -0.125 * s, 0));
  var t1 = cyl(0.004 * s, 0.004 * s, 0.06 * s, 12, M.lacqR, 0.008 * s, -0.168 * s, 0); t1.rotation.z = 0.12; g.add(t1);
  var t2 = cyl(0.004 * s, 0.004 * s, 0.06 * s, 12, M.lacqR, -0.008 * s, -0.168 * s, 0); t2.rotation.z = -0.12; g.add(t2);
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

/* 水埠头 v2：入水石阶 ×3 + 系船石墩 + 两侧条石嘴（平江路识别件） */
function quaySteps(M, pad) {
  var g = grp();
  g.name = 'street-front';
  var x0 = 0.95, z0 = pad.wz0, i;
  for (i = 0; i < 3; i++) {
    g.add(box(0.24, 0.032, 0.1, M.stoneD, x0, 0.055 - i * 0.011, z0 + 0.03 + i * 0.095));
  }
  /* 系船石墩（缆石） */
  g.add(cyl(0.028, 0.036, 0.11, 12, M.stoneD, x0 - 0.26, 0.115, z0 - 0.06));
  g.add(sph(0.018, M.stoneD, x0 - 0.26, 0.175, z0 - 0.06));
  /* 两侧条石嘴 */
  g.add(box(0.06, 0.04, 0.3, M.stoneD, x0 - 0.16, 0.06, z0 + 0.12));
  g.add(box(0.06, 0.04, 0.3, M.stoneD, x0 + 0.16, 0.06, z0 + 0.12));
  return g;
}

/* 圆冠树 / 灌丛 */
function treeRound(M, s) {
  var g = grp();
  g.name = 'street-front';
  s = s || 1;
  g.add(cyl(0.022 * s, 0.035 * s, 0.3 * s, 12, M.woodD, 0, 0.15 * s, 0));
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

/* 墙角木柱 + 柱础（木构架语汇，贴白墙四角） */
function cornerPosts(M, tw, hx, hz, y0, hh, pts) {
  var i;
  for (i = 0; i < pts.length; i++) {
    tw.add(box(0.05, hh, 0.05, M.woodD, hx + pts[i][0], y0 + hh / 2, hz + pts[i][1]));
    tw.add(cyl(0.036, 0.04, 0.035, 12, M.stoneD, hx + pts[i][0], y0 + 0.017, hz + pts[i][1]));
  }
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：风化木板壁小屋 + 木瓦圆脊顶 + 木栅栏（h≈0.94） ---- */
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
  /* 木瓦圆脊顶（圆木滚杠 + 木瓦双坡 + 檐口起翘条） */
  var rf = grp(); rf.name = 'hut-roof'; put(g, rf, hx, 0.64, hz);
  var eave = 0.52, pitch = Math.atan2(0.24, eave), len = Math.sqrt(eave * eave + 0.24 * 0.24) + 0.02;
  var k;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.y = 0.24; sg.rotation.x = pitch * k; rf.add(sg);
    sg.add(box(1.26, 0.032, len, k > 0 ? M.plankL : M.plank, 0, 0, k * len / 2));
    sg.add(box(1.28, 0.04, 0.02, M.woodD, 0, -0.005, k * eave));
    var fl = box(1.26, 0.016, 0.06, k > 0 ? M.plankL : M.plank, 0, -0.235, k * (eave + 0.015));
    fl.rotation.x = -k * 0.14; rf.add(fl);
  }
  /* 圆木滚杠屋脊（两根原木 + 勒条，脊沿 x 向） */
  var l1 = cyl(0.032, 0.032, 1.24, 12, M.woodD, 0, 0.27, -0.05); l1.rotation.z = PI / 2; rf.add(l1);
  var l2 = cyl(0.028, 0.028, 1.24, 12, M.wood, 0, 0.27, 0.04); l2.rotation.z = PI / 2; rf.add(l2);
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

/* ---- lv2 洋房：两层白灰墙楼（铺面 + 蓝布棚 + 炭黑翘角瓦顶 + 月洞院墙，h≈1.64） ---- */
function level2(M, anims) {
  var g = grp();
  var pad = islandPad2(M, 2.5, 2.3);
  g.add(pad.g);
  g.add(lilyPads(M, anims));
  g.add(archBridge(M, 0.72, 0.46, (pad.wz0 + pad.wz1) / 2 - 0.07));
  g.add(quaySteps(M, pad));
  g.add(stoneSteps(M, 3, 0.5, -0.86, 0.72, 1));
  /* 月洞门院墙（后缘，院落随宅成 nucleate） */
  put(g, courtWall(M, 0.7), -0.8, 0.08, -1.06);
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
  /* 二层白灰墙 + 角柱（柱础）+ 木格窗 + 层间穿枋 */
  tw.add(box(1.34, 0.05, 0.94, M.woodD, hx, 0.685, hz));
  tw.add(box(1.3, 0.5, 0.84, M.plaster, hx, 0.96, hz));
  cornerPosts(M, tw, hx, hz, 0.71, 0.55, [[-0.62, -0.4], [0.62, -0.4], [-0.62, 0.4], [0.62, 0.4]]);
  tw.add(box(1.3, 0.028, 0.024, M.woodL, hx, 0.71, hz + 0.423));   /* 层间穿枋（前檐口枋） */
  var w1 = latticeWindow(M, 0.24, 0.26); put(g, w1, hx - 0.3, 0.98, hz + 0.435);
  var w2 = latticeWindow(M, 0.24, 0.26); put(g, w2, hx + 0.22, 0.98, hz + 0.435);
  /* 主顶：炭黑翘角瓦顶（凹曲坡）+ 白山花悬鱼惹草 */
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

/* ---- lv3 大厦：三层退台楼（层层腰檐挑廊 + 灯笼成列 + 月洞院墙，h≈2.27） ---- */
function level3(M, anims) {
  var g = grp();
  var pad = islandPad2(M, 2.5, 2.3);
  g.add(pad.g);
  g.add(lilyPads(M, anims));
  g.add(archBridge(M, 0.72, 0.46, (pad.wz0 + pad.wz1) / 2 - 0.07));
  g.add(quaySteps(M, pad));
  g.add(stoneSteps(M, 3, 0.5, -0.86, 0.72, 1));
  /* 月洞门院墙（后缘，加长） */
  put(g, courtWall(M, 1.0), -0.65, 0.08, -1.06);
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
  cornerPosts(M, tw, hx, hz, 0.67, 0.44, [[-0.66, -0.42], [0.66, -0.42]]);
  var b2 = railUnit(M, 1.3, 6); put(g, b2, hx, 0.67, hz + 0.42);
  var w21 = latticeWindow(M, 0.22, 0.24); put(g, w21, hx - 0.3, 0.9, hz + 0.455);
  var w22 = latticeWindow(M, 0.22, 0.24); put(g, w22, hx + 0.26, 0.9, hz + 0.455);
  /* 二层腰檐（凹曲翘角） */
  var waist = tileRoofFly(M, { name: 'waist-roofs', w: 1.36, d: 1.0, h: 0.14, strips: 2, gable: false, ridge: false });
  put(g, waist, hx, 1.11, hz - 0.01);
  /* 三层：白灰墙（略退台）+ 挑廊 + 木格窗 */
  tw.add(box(1.3, 0.05, 0.94, M.woodD, hx, 1.265, hz - 0.02));
  tw.add(box(1.24, 0.4, 0.84, M.plaster, hx, 1.49, hz - 0.03));
  cornerPosts(M, tw, hx, hz - 0.02, 1.29, 0.42, [[-0.6, -0.4], [0.6, -0.4]]);
  var b3 = railUnit(M, 1.14, 6); put(g, b3, hx, 1.29, hz + 0.36);
  var w31 = latticeWindow(M, 0.2, 0.22); put(g, w31, hx - 0.24, 1.5, hz + 0.415);
  var w32 = latticeWindow(M, 0.2, 0.22); put(g, w32, hx + 0.24, 1.5, hz + 0.415);
  /* 三层腰檐 + 主顶（四坡凹曲翘角） */
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
  g.add(cyl(0.05, 0.06, 0.09, 12, M.stoneD, hx + 0.78, 0.125, hz + 0.5));
  var pb = sph(0.07, M.treeG, hx + 0.78, 0.23, hz + 0.5); pb.scale.y = 0.85; g.add(pb);
  var tr = treeRound(M, 1.1); put(g, tr, 0.9, 0.08, -0.6);
  /* 垂柳 */
  var wl = willow(M, 1.15, anims, 1.7, 7); put(g, wl, 0.87, 0.08, -0.78);
  var wm = M.water;
  anims.push(function (t) { wm.emissiveIntensity = 0.12 + 0.05 * sin(t * 0.9); });
  return g;
}

/* ---- lv4 地标：石台基 + 厢房 + 鎏金翘角瓦顶楼阁群 + 月洞院墙（h≈2.56） ---- */
function level4(M, anims) {
  var g = grp();
  var pad = islandPad2(M, 2.5, 2.3);
  g.add(pad.g);
  g.add(lilyPads(M, anims));
  g.add(archBridge(M, 0.72, 0.46, (pad.wz0 + pad.wz1) / 2 - 0.07));
  g.add(quaySteps(M, pad));
  g.add(stoneSteps(M, 3, 0.5, -0.86, 0.72, 1));
  /* 月洞门院墙（后缘，最长） */
  put(g, courtWall(M, 1.3), -0.5, 0.08, -1.06);
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
  cornerPosts(M, tw, hx, hz, 0.82, 0.42, [[-0.67, -0.43], [0.67, -0.43]]);
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
  var c1 = cyl(0.028, 0.032, 0.34, 12, M.lacqR, hx - 0.5, 1.6, hz + 0.34); tw.add(c1);
  var c2 = cyl(0.028, 0.032, 0.34, 12, M.lacqR, hx + 0.5, 1.6, hz + 0.34); tw.add(c2);
  tw.add(cyl(0.036, 0.036, 0.02, 12, M.gold, hx - 0.5, 1.78, hz + 0.34));
  tw.add(cyl(0.036, 0.036, 0.02, 12, M.gold, hx + 0.5, 1.78, hz + 0.34));
  cornerPosts(M, tw, hx, hz - 0.02, 1.44, 0.38, [[-0.61, -0.41], [0.61, -0.41]]);
  var b3 = railUnit(M, 0.84, 4); put(g, b3, hx, 1.44, hz + 0.42);
  var w31 = latticeWindow(M, 0.2, 0.2); put(g, w31, hx - 0.24, 1.63, hz + 0.435);
  var w32 = latticeWindow(M, 0.2, 0.2); put(g, w32, hx + 0.24, 1.63, hz + 0.435);
  var waist2 = tileRoofFly(M, { name: 'waist-roofs', w: 1.2, d: 0.94, h: 0.12, strips: 2, gable: false, ridge: false });
  put(g, waist2, hx, 1.82, hz - 0.03);
  /* 主顶：四坡鎏金翘角 + 金脊 + 宝顶 */
  var roof = hipRoofFly(M, { name: 'top-roof', w: 1.12, d: 0.88, h: 0.3, gold: true, finial: true });
  put(g, roof, hx, 1.96, hz - 0.03);                              /* 宝顶≈2.5 */
  /* 厢房披屋（右侧，双坡小瓦顶：两段凹曲坡 + 翘角，同 v1 体量） */
  var wx = hx + 1.04;
  var aw = grp(); aw.name = 'annex-wing'; g.add(aw);
  aw.add(box(0.52, 0.05, 0.9, M.stoneD, wx, 0.225, hz - 0.2));
  aw.add(box(0.48, 0.42, 0.86, M.plaster, wx, 0.46, hz - 0.2));
  aw.add(box(0.12, 0.18, 0.03, M.ink, wx, 0.45, hz + 0.245));
  aw.add(box(0.12, 0.14, 0.02, M.woodD, wx - 0.12, 0.56, hz + 0.245));
  var wr = tileRoofFly(M, { w: 0.44, d: 0.84, h: 0.13, segs: 2, gable: false, ridge: false });
  put(g, wr, wx, 0.69, hz - 0.2);
  /* 门口灯笼 ×2（厢房前） */
  var lt5 = lantern(M, 0.46, anims, 0.5); put(g, lt5, wx - 0.3, 0.56, hz + 0.47);
  var lt6 = lantern(M, 0.46, anims, 2.5); put(g, lt6, wx + 0.3, 0.56, hz + 0.47);
  /* 大绿树（左前）+ 垂柳 ×2（右后 + 左后） */
  var tr = treeRound(M, 1.5); put(g, tr, -0.44, 0.08, 1.0);
  var wl1 = willow(M, 1.2, anims, 0.9, 5); put(g, wl1, 0.92, 0.08, -0.92);   /* v2 后移 0.12：枝束不再刷厢房后檩 */
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
