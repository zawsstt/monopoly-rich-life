/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_30.js
 * -------------------------------------------------------------------------------------
 * 格 30「大唐不夜城」(g6 盛唐地标) 独属建筑：唐风楼阁四阶生长史
 * 参考图 refs/prop_30.png 高保真复刻（img2threejs 流程：blockout→structure→form→
 * material→lighting→interaction→optimization；spec/证据见 .img2threejs/evidence_prop30/）。
 *
 * 风格族谱（同一块地的同一种盛唐的生长）：
 *   lv1 小屋   金棕木瓦小屋 + 披屋 + 金头灯柱（h≈1.03）——木瓦垄 + 圆脊杆是唐风种子
 *   lv2 洋房   横向两开间：瓦顶正堂 + 红布篷铺面披屋，金饰鸱吻初现（h≈1.52）
 *   lv3 大厦   三重檐楼阁：逐层收分 + 斗拱带 + 檐角金灯笼串 + 红毯踏步（h≈2.2）
 *   lv4 地标   重檐宫殿楼阁 + 金鸱吻火焰宝顶 + 朱门金钉 + 垂幔 + 金凤仪仗 + 灯柱广场（h≈2.8）
 *
 * 独有语汇（自参考图逐区采样提炼，区别于 prop_1 灰瓦 / prop_9 骑楼 / prop_18 穿斗 /
 * prop_28 书院门木棕色系）：
 *   · 黑青筒瓦垄（#454E5A 深 slate，亮瓦垄 #5A6674）+ 檐口浅色瓦当带
 *   · 鎏金正脊饰：脊端卷曲鸱吻（lv2 起）→ lv4 中央火焰宝顶簇
 *   · 朱红柱列（#B53424/#C64226）金箍柱头 + 奶白抹灰墙面板（#F2E8D4）红框
 *   · 斗拱带：红拱臂 + 金斗块交替（lv3 起，lv4 加密）
 *   · 金笼灯笼（暖光呼吸）+ 金头灯柱（每阶必有，lv4 升级为朱柱金灯石础一对）
 *   · lv1 金棕木瓦垄 + 圆脊杆；lv2 红布篷（扇贝垂边）；lv3/4 红毯金边踏步；
 *     lv4 垂幔 + 金凤凰仪仗一对 + 匾额「大唐不夜城」
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[30] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤256px）；每级 mesh ≤220；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_30] THREE 未定义，请先加载 three.min.js (r147)');
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
function MAT(id, make) {
  if (!_mc[id]) { _mc[id] = make(); _mc[id].name = id; }
  return _mc[id];
}

function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 12, 8), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
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

/* 黑青筒瓦垄：横向垄线明暗 + 竖向接头错缝 + 釉面噪点（map+bump 同源） */
function texTile() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#454e5a'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#4d5765' : '#48515e';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#333a44'; g.fillRect(0, y + rh - 3, S, 3);       /* 深垄缝 */
    g.fillStyle = '#5a6674'; g.fillRect(0, y + 1, S, 2);            /* 亮瓦垄 */
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 4; k++) {
      var x = (off + k * (S / 4)) % S;
      g.fillStyle = 'rgba(30,36,44,0.55)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.045)' : 'rgba(16,20,26,0.08)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 金棕木瓦垄（lv1）：横排瓦板 + 板端阴影缝 + 亮板面 */
function texShingle() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b07c42'; g.fillRect(0, 0, S, S);
  var rows = 9, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#c08444' : '#b57a3e';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#cf8c45'; g.fillRect(0, y + 1, S, 2);            /* 亮板面 */
    g.fillStyle = '#623c1a'; g.fillRect(0, y + rh - 3, S, 3);       /* 板端深缝 */
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillStyle = 'rgba(74,44,16,0.4)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 140; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,230,180,0.05)' : 'rgba(60,34,12,0.07)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 奶白抹灰：细噪 + 抹痕 */
function texPlaster() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#f2e8d4'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(150,132,100,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 红毯金边（lv3/4 踏步地毯）：朱红地 + 金织边 + 中心织纹点 */
function texCarpet() {
  var w = 128, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#b5402e'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8c27a'; g.lineWidth = 6; g.strokeRect(4, 4, w - 8, h - 8);
  g.strokeStyle = 'rgba(232,194,122,0.55)'; g.lineWidth = 2; g.strokeRect(13, 13, w - 26, h - 26);
  g.fillStyle = 'rgba(255,220,150,0.28)';
  for (var i = 0; i < 26; i++) g.fillRect(20 + (i * 17) % (w - 40), 20 + (i * 11) % (h - 40), 3, 3);
  return toTex(cv, true);
}
/* 匾额「大唐不夜城」：朱漆底 + 金框金字 */
function texPlaqueH() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#4a120a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8c27a'; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10);
  g.strokeStyle = 'rgba(232,194,122,0.5)'; g.lineWidth = 2; g.strokeRect(14, 14, w - 28, h - 28);
  g.fillStyle = '#f2cf7e'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 38px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('大唐不夜城', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
/* 金圆盒徽（lv3/4 层间金饰）：金地 + 朱圈 + 金珠心 */
function texRoundel() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e8b866'; g.fillRect(0, 0, S, S);
  g.fillStyle = '#9e2619'; g.beginPath(); g.arc(S / 2, S / 2, 22, 0, PI * 2); g.fill();
  g.strokeStyle = '#f6d488'; g.lineWidth = 4; g.beginPath(); g.arc(S / 2, S / 2, 17, 0, PI * 2); g.stroke();
  g.fillStyle = '#f6d488'; g.beginPath(); g.arc(S / 2, S / 2, 7, 0, PI * 2); g.fill();
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图逐区取样） */
function Mats() {
  return {
    /* 瓦面：迎光亮 / 背光暗（map+bump 同源） */
    roofSun:   MAT('p30roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.62 }); }),
    roofShade: MAT('p30roofShd', function () { var t = getTex('tile', texTile); return std('#9aa2ae', { map: t, bump: t, bumpScale: 0.014, rough: 0.68 }); }),
    roofJoint: MAT('p30roofJoint', function () { return std('#2e343d', { rough: 0.75 }); }),
    shingle:   MAT('p30shingle', function () { var t = getTex('shingle', texShingle); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.8 }); }),
    shingleSd: MAT('p30shingleSd', function () { var t = getTex('shingle', texShingle); return std('#8f9aa8', { map: t, bump: t, bumpScale: 0.014, rough: 0.84 }); }),
    /* 鎏金件 */
    gilt:      MAT('p30gilt', function () { return std('#efc16e', { rough: 0.32, metal: 0.8 }); }),
    giltBr:    MAT('p30giltBr', function () { return std('#f6d488', { rough: 0.26, metal: 0.8 }); }),
    giltDk:    MAT('p30giltDk', function () { return std('#b08840', { rough: 0.4, metal: 0.75 }); }),
    /* 朱漆木作 */
    lacq:      MAT('p30lacq', function () { return std('#b53424', { rough: 0.5 }); }),
    lacqBr:    MAT('p30lacqBr', function () { return std('#c64226', { rough: 0.45 }); }),
    lacqDk:    MAT('p30lacqDk', function () { return std('#781e12', { rough: 0.6 }); }),
    /* 墙面板 / 石作 / 木作 */
    plaster:   MAT('p30plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.9 }); }),
    panelSd:   MAT('p30panelSd', function () { return std('#d9cdb4', { rough: 0.92 }); }),
    timber:    MAT('p30timber', function () { return std('#6b4a28', { rough: 0.85 }); }),
    timberBr:  MAT('p30timberBr', function () { return std('#8a6438', { rough: 0.82 }); }),
    stone:     MAT('p30stone', function () { return std('#cfc5b0', { rough: 0.92 }); }),
    stoneD:    MAT('p30stoneD', function () { return std('#b0a793', { rough: 0.94 }); }),
    stoneBr:   MAT('p30stoneBr', function () { return std('#ddd5c2', { rough: 0.9 }); }),
    grass:     MAT('p30grass', function () { return std('#7c8536', { rough: 0.95 }); }),
    grassD:    MAT('p30grassD', function () { return std('#6a732c', { rough: 0.95 }); }),
    path:      MAT('p30path', function () { return std('#e4dcc4', { rough: 0.95 }); }),
    carpet:    MAT('p30carpet', function () { return std('#ffffff', { map: getTex('carpet', texCarpet), rough: 0.95 }); }),
    drape:     MAT('p30drape', function () { return std('#7e2013', { rough: 0.6 }); }),
    ink:       MAT('p30ink', function () { return std('#2a2226', { rough: 0.85 }); }),
    /* 发光件（共享材质 → 呼吸动画只需驱动一次） */
    lampGlow:  MAT('p30lampGlow', function () { return std('#f7d9a0', { rough: 0.4, emissive: '#ffc97e', ei: 0.62 }); }),
    lantGlow:  MAT('p30lantGlow', function () { return std('#e8b866', { rough: 0.42, metal: 0.55, emissive: '#ffbe6e', ei: 0.5 }); }),
    paper:     MAT('p30paper', function () { return std('#f5e9cc', { rough: 0.9, emissive: '#ffd98a', ei: 0.16 }); })
  };
}

/* ================= 2. 预制件（风格独有语汇） ================= */

/* 红框白纸格窗：朱框 + 纸面（微光）+ 红棂 */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp(); g.name = 'lattice-window';
  g.add(box(w + 0.045, h + 0.045, 0.03, M.lacqDk));
  g.add(box(w, h, 0.028, M.paper, 0, 0, 0.004));
  g.add(box(0.026, h, 0.034, M.lacq, 0, 0, 0.007));
  var rows = o.rows || 2, i;
  for (i = 0; i < rows; i++) {
    var y = -h / 2 + (i + 1) * h / (rows + 1);
    g.add(box(w, 0.022, 0.034, M.lacq, 0, y, 0.007));
  }
  return g;
}

/* 朱柱（金箍柱头 + 石础 + 柱顶枋头） */
function column(M, h, r) {
  var g = grp(); g.name = 'column';
  g.add(box(r * 2.6, 0.04, r * 2.6, M.stoneD, 0, 0.02, 0));
  g.add(cyl(r, r * 1.06, h, 10, M.lacqBr, 0, 0.04 + h / 2, 0));
  g.add(cyl(r * 1.16, r * 1.16, 0.026, 10, M.gilt, 0, 0.04 + h - 0.05, 0));
  g.add(box(r * 2.5, 0.05, r * 2.5, M.lacqDk, 0, 0.04 + h + 0.025, 0));
  return g;
}

/* 斗拱带（lv3/4）：朱枋一圈 + 红拱臂与金斗块交替（属于柱头之上的兜檐构件） */
function dougongBand(M, w, blocks) {
  var g = grp(); g.name = 'dougong-band';
  g.add(box(w, 0.035, 0.09, M.lacqDk, 0, 0, 0));                      /* 枋 */
  var n = blocks || 6, i;
  for (i = 0; i < n; i++) {
    var x = -w / 2 + (i + 0.5) * (w / n);
    if (i % 2) g.add(box(w / n * 0.52, 0.045, 0.07, M.gilt, x, 0.042, 0.006));   /* 金斗 */
    else g.add(box(w / n * 0.5, 0.03, 0.12, M.lacq, x, 0.036, 0));               /* 红拱臂(出跳) */
  }
  return g;
}

/* 鎏金鸱吻：脊端卷曲钩（竖板 + 内卷板 + 珠） */
function chiwen(M, s, flip) {
  var g = grp(); g.name = 'chiwen-curl-micro'; s = s || 1;
  var f = flip ? -1 : 1;
  g.add(box(0.035 * s, 0.13 * s, 0.05 * s, M.gilt, 0, 0.065 * s, 0));
  var curl = box(0.05 * s, 0.06 * s, 0.046 * s, M.giltBr, f * 0.026 * s, 0.15 * s, 0);
  curl.rotation.z = f * -0.85; g.add(curl);
  g.add(sph(0.016 * s, M.giltBr, f * 0.052 * s, 0.155 * s, 0));
  return g;
}

/* 火焰宝顶簇（lv4）：金叠盘 + 火焰叶 + 珠 */
function flameFinial(M, s) {
  var g = grp(); g.name = 'flame-finial-micro'; s = s || 1;
  g.add(cyl(0.06 * s, 0.075 * s, 0.03 * s, 10, M.gilt, 0, 0.015 * s, 0));
  g.add(cyl(0.042 * s, 0.055 * s, 0.03 * s, 10, M.giltDk, 0, 0.045 * s, 0));
  g.add(cyl(0.026 * s, 0.04 * s, 0.03 * s, 8, M.gilt, 0, 0.072 * s, 0));
  g.add(cone(0.02 * s, 0.1 * s, 8, M.giltBr, 0, 0.13 * s, 0));
  g.add(sph(0.018 * s, M.giltBr, 0, 0.19 * s, 0));
  return g;
}

/* 金笼灯笼：金盖金底 + 暖光笼身 + 红穗（材质共享 → 呼吸驱动一次） */
function lanternGold(M, s, phase) {
  var g = grp(); g.name = 'lantern-unit'; s = s || 1;
  g.add(cyl(0.03 * s, 0.045 * s, 0.03 * s, 8, M.gilt, 0, -0.02 * s, 0));
  var body = sph(0.072 * s, M.lantGlow, 0, 0.04 * s, 0); body.scale.y = 0.92; g.add(body);
  g.add(cyl(0.046 * s, 0.03 * s, 0.03 * s, 8, M.gilt, 0, 0.105 * s, 0));
  g.add(cyl(0.006 * s, 0.006 * s, 0.06 * s, 8, M.lacqDk, 0, -0.085 * s, 0));
  g.add(sph(0.012 * s, M.giltBr, 0, 0.125 * s, 0));
  void phase;
  return g;
}

/* 金头灯柱：石础 + 独杆 + 金盏灯头 + 暖光珠（每阶必有） */
function lampPost(M, h, o) {
  o = o || {};
  var g = grp(); g.name = 'lamp-post';
  var poleM = o.red ? M.lacqBr : M.timber;
  g.add(cyl(0.03, 0.042, 0.06, 8, M.stoneD, 0, 0.03, 0));
  if (o.pedestal) g.add(box(0.14, 0.16, 0.14, M.stone, 0, 0.14, 0));
  var y0 = o.pedestal ? 0.22 : 0.06;
  g.add(cyl(0.014, 0.02, h, 8, poleM, 0, y0 + h / 2, 0));
  g.add(cyl(0.05, 0.028, 0.045, 8, M.gilt, 0, y0 + h + 0.02, 0));      /* 金盏 */
  g.add(sph(0.032, M.lampGlow, 0, y0 + h + 0.07, 0));                  /* 灯珠 */
  g.add(cone(0.034, 0.03, 8, M.giltBr, 0, y0 + h + 0.115, 0));
  return g;
}

/* 朱门金钉门脸：门洞阴影 + 朱门扇 + 金钉 + 门楣（lv2 起生，lv4 加金钉） */
function doorBay(M, w, h, y0, studs) {
  var g = grp(); g.name = 'door-bay';
  g.add(box(w + 0.07, h + 0.05, 0.04, M.lacqDk, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.042, M.ink, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.9, h * 0.84, 0.05, M.lacqBr, 0, y0 + h / 2, 0.006));
  g.add(box(w * 0.9, 0.026, 0.052, M.gilt, 0, y0 + h * 0.66, 0.012));
  if (studs) {
    var xs = [-w * 0.24, 0, w * 0.24], ys = [y0 + h * 0.32, y0 + h * 0.58], i, j;
    for (j = 0; j < 2; j++) for (i = 0; i < 3; i++) g.add(sph(0.014, M.giltBr, xs[i], ys[j], 0.032));
  }
  return g;
}

/* 匾额（朱底金框金字） */
function plaqueH(M, w, h) {
  var g = grp(); g.name = 'plaque';
  g.add(box(w, h, 0.035, M.lacqDk));
  var p = mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.8),
    new THREE.MeshStandardMaterial({ map: getTex('plaque', texPlaqueH), roughness: 0.55, metalness: 0.08, flatShading: true }));
  p.material.name = 'p30plaqueM';
  p.position.z = 0.019; g.add(p);
  return g;
}
/* 金圆盒徽 */
function roundel(M, r) {
  var g = grp();
  var d = mesh(new THREE.CircleGeometry(r, 14),
    new THREE.MeshStandardMaterial({ map: getTex('roundel', texRoundel), roughness: 0.5, metalness: 0.3, flatShading: true }));
  d.material.name = 'p30roundelM';
  g.add(d);
  var rim = mesh(new THREE.TorusGeometry(r * 0.98, r * 0.09, 6, 14), M.giltDk); g.add(rim);
  return g;
}

/* 红布篷（lv2 铺面）：斜篷布 + 扇贝垂边 + 金横杆 */
function awningUnit(M, w) {
  var g = grp(); g.name = 'awning-valance';
  var slope = box(w, 0.02, 0.24, M.drape, 0, 0.07, 0.08);
  slope.rotation.x = 0.42; g.add(slope);
  var n = 5, i;
  for (i = 0; i < n; i++) {
    var sc = mesh(new THREE.CylinderGeometry(0.03, 0.03, w / n - 0.012, 8, 1, false, PI * 0.5, PI), M.lacqBr);
    put(g, sc, -w / 2 + (i + 0.5) * (w / n), -0.014, 0.196, 0, PI / 2);
  }
  g.add(box(w + 0.03, 0.022, 0.022, M.gilt, 0, 0.024, 0.19));
  return g;
}

/* 垂幔（lv4 门廊）：两侧斜垂布 + 中凹垂 + 金饰条 + 结珠 */
function drapeSwag(M, w) {
  var g = grp(); g.name = 'drape-curtain';
  var l = box(w * 0.42, 0.3, 0.022, M.drape, -w * 0.26, -0.1, 0);
  l.rotation.z = 0.42; g.add(l);
  var r = box(w * 0.42, 0.3, 0.022, M.drape, w * 0.26, -0.1, 0);
  r.rotation.z = -0.42; g.add(r);
  g.add(box(w * 0.2, 0.16, 0.022, M.drape, 0, -0.19, 0.006));
  g.add(box(w, 0.02, 0.024, M.gilt, 0, 0.052, 0.004));
  g.add(sph(0.026, M.giltBr, 0, -0.28, 0.01));
  return g;
}

/* 金凤凰仪仗（lv4 门侧）：身 + 颈 + 头喙冠 + 尾屏 + 座环 */
function phoenixStatue(M, s) {
  var g = grp(); g.name = 'guardian-statue'; s = s || 1;
  var base = cyl(0.055 * s, 0.07 * s, 0.03 * s, 10, M.giltDk, 0, 0.015 * s, 0); g.add(base);
  var body = sph(0.05 * s, M.gilt, 0, 0.075 * s, 0); body.scale.set(0.9, 0.85, 1.25); g.add(body);
  var neck = cyl(0.016 * s, 0.02 * s, 0.07 * s, 8, M.gilt, 0, 0.13 * s, 0.03 * s);
  neck.rotation.x = -0.35; g.add(neck);
  g.add(sph(0.026 * s, M.gilt, 0, 0.175 * s, 0.052 * s));
  var beak = cone(0.01 * s, 0.03 * s, 6, M.giltDk, 0, 0.172 * s, 0.08 * s);
  beak.rotation.x = PI / 2; g.add(beak);
  var crest = cone(0.012 * s, 0.035 * s, 6, M.giltBr, 0, 0.2 * s, 0.04 * s); g.add(crest);
  var t1 = box(0.012 * s, 0.09 * s, 0.02 * s, M.giltBr, 0.02 * s, 0.1 * s, -0.06 * s);
  t1.rotation.x = -0.7; t1.rotation.z = 0.25; g.add(t1);
  var t2 = box(0.012 * s, 0.08 * s, 0.02 * s, M.gilt, -0.02 * s, 0.095 * s, -0.06 * s);
  t2.rotation.x = -0.8; t2.rotation.z = -0.25; g.add(t2);
  return g;
}

/* 金棕木瓦坡顶（lv1）：双坡木瓦 + 圆脊杆 + 出梢挑檐 + 微翘 */
function shingleRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(); g.name = 'shingle-roof'; var k, i;
  var over = o.over !== undefined ? o.over : 0.1;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.03, len, k > 0 ? M.shingle : M.shingleSd, 0, 0, k * len / 2));
    for (i = 0; i < 3; i++) {                                          /* 瓦板端头压条 */
      var u = (i + 0.5) / 3;
      sg.add(box(w + over * 2 - 0.05, 0.014, 0.024, M.timber, 0, 0.022, k * u * eave));
    }
    var cL = box(0.06, 0.04, 0.06, M.timber, (w + over * 2) / 2 - 0.005, 0.045, k * (eave - 0.02));
    cL.rotation.z = 0.5; sg.add(cL);                                   /* 檐角微翘 */
    var cR = box(0.06, 0.04, 0.06, M.timber, -(w + over * 2) / 2 + 0.005, 0.045, k * (eave - 0.02));
    cR.rotation.z = -0.5; sg.add(cR);
  }
  var ridge = cyl(0.026, 0.026, w + over * 2 + 0.1, 8, M.timberBr, 0, h + 0.028, 0);
  ridge.rotation.z = PI / 2; g.add(ridge);                                       /* 圆脊杆(沿X) */
  var p1 = box(0.05, 0.05, 0.06, M.timberBr, (w + over * 2) / 2 + 0.02, h + 0.02, 0);
  p1.rotation.z = 0.6; g.add(p1);                                      /* 穿枋出头 */
  var p2 = box(0.05, 0.05, 0.06, M.timberBr, -(w + over * 2) / 2 - 0.02, h + 0.02, 0);
  p2.rotation.z = -0.6; g.add(p2);
  return g;
}

/* 黑青筒瓦四坡檐层（核心语汇）：四坡瓦面 + 朱封檐 + 檐角挑块 + 金腰檐带 + 脊饰 */
function tileHipTier(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(); g.name = 'tile-hip-tier'; var i;
  var over = o.over !== undefined ? o.over : 0.09;
  var eaveF = d / 2 + over, eaveS = w / 2 + over;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  /* 前后坡（前亮后暗，全宽 → 与左右坡在角部交叠成完整的四坡体） */
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w + over * 2, 0.032, lenF, M.roofSun, 0, 0, lenF / 2));
  sgF.add(box(w + over * 2 + 0.02, 0.045, 0.022, M.lacqDk, 0, -0.004, eaveF));   /* 朱封檐 */
  if (o.strips) for (i = 0; i < o.strips; i++) {
    var u = (i + 0.5) / o.strips;
    sgF.add(box(w + over * 2 - 0.05, 0.014, 0.026, M.roofJoint, 0, 0.023, u * eaveF));
  }
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w + over * 2, 0.032, lenF, M.roofShade, 0, 0, -lenF / 2));
  sgB.add(box(w + over * 2 + 0.02, 0.045, 0.022, M.lacqDk, 0, -0.004, -eaveF));
  /* 左右坡（全深，角部与前後坡交叠） */
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.032, d + over * 2, M.roofShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.032, d + over * 2, M.roofShade, -lenS / 2, 0, 0));
  /* 檐角挑块（四角起翘） */
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.07, 0.045, 0.07, M.roofJoint, c[0] * (eaveS - 0.02), 0.04, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.55; lift.rotation.x = c[1] * 0.55; g.add(lift);
    if (o.tips) g.add(sph(0.016, M.giltBr, c[0] * (eaveS + 0.005), 0.065, c[1] * (eaveF + 0.005)));
  });
  /* 金腰檐带（沿四坡腰的鎏金条） */
  if (o.trim) {
    var hipF = Math.sqrt(eaveF * eaveF + h * h);
    var hipS = Math.sqrt(eaveS * eaveS + h * h);
    var trim = box(0.028, 0.02, hipF * 0.92, M.gilt, 0, h * 0.52, eaveF * 0.42);
    trim.rotation.x = -pitchF; g.add(trim);
    var trim2 = box(0.028, 0.02, hipF * 0.92, M.gilt, 0, h * 0.52, -eaveF * 0.42);
    trim2.rotation.x = pitchF; g.add(trim2);
    var trim3 = box(hipS * 0.92, 0.02, 0.028, M.gilt, eaveS * 0.42, h * 0.52, 0);
    trim3.rotation.z = pitchS; g.add(trim3);
    var trim4 = box(hipS * 0.92, 0.02, 0.028, M.gilt, -eaveS * 0.42, h * 0.52, 0);
    trim4.rotation.z = -pitchS; g.add(trim4);
  }
  /* 正脊 + 金脊条 + 鸱吻 */
  g.add(box(w * 0.44, 0.055, 0.085, M.roofJoint, 0, h + 0.028, 0));
  if (o.chiwen) {
    g.add(box(w * 0.46, 0.018, 0.06, M.gilt, 0, h + 0.062, 0));
    var cw1 = chiwen(M, o.big ? 1.0 : 0.8, false); put(g, cw1, w * 0.23, h + 0.03, 0);
    var cw2 = chiwen(M, o.big ? 1.0 : 0.8, true); put(g, cw2, -w * 0.23, h + 0.03, 0);
  }
  if (o.finial) put(g, flameFinial(M, 1.0), 0, h + 0.06, 0);
  return g;
}

/* 草坪石板地坪：草面 + 深草沿 + 前径石板 + 岩石灌丛（参考图绿缘） */
function padUnit(M, size, depth) {
  var g = grp(); g.name = 'pad-terrain';
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  g.add(box(0.5, 0.014, 0.56, M.path, 0, 0.056, d / 2 - 0.33));
  var rock = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, rock, size / 2 - 0.3, 0.065, -d / 2 + 0.32);
  var bush = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.grassD); put(g, bush, -size / 2 + 0.28, 0.11, d / 2 - 0.3);
  bush.scale.y = 0.8;
  return g;
}

/* 货担（lv1/2）：条板货箱 + 陶罐 */
function goodsProps(M) {
  var g = grp(); g.name = 'goods';
  g.add(box(0.24, 0.11, 0.15, M.timberBr, 0, 0.055, 0));
  g.add(box(0.26, 0.02, 0.17, M.timber, 0, 0.115, 0));
  g.add(box(0.18, 0.09, 0.13, M.timberBr, 0.28, 0.045, 0.02));
  g.add(cyl(0.055, 0.07, 0.12, 10, M.panelSd, -0.28, 0.06, 0.02));
  g.add(cyl(0.04, 0.05, 0.02, 10, M.stoneD, -0.28, 0.13, 0.02));
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：金棕木瓦小屋 + 披屋 + 金头灯柱（h≈1.03） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.3));
  /* 石板台基 + 前踏 */
  var podium = grp(); podium.name = 'podium-terrace'; g.add(podium);
  podium.add(box(1.34, 0.09, 1.0, M.stoneD, -0.05, 0.045, -0.04));
  podium.add(box(0.44, 0.05, 0.2, M.stoneD, -0.28, 0.1, 0.48));
  /* 木构屋身：角柱 + 横板壁 + 门洞 + 格窗 + 右侧披屋 */
  var hall = grp(); hall.name = 'hall-body'; g.add(hall);
  hall.add(box(1.1, 0.5, 0.86, M.timberBr, -0.05, 0.34, -0.04));
  hall.add(box(1.16, 0.05, 0.9, M.timber, -0.05, 0.615, -0.04));
  [[-0.58, -0.44], [0.48, -0.44], [-0.58, 0.36], [0.48, 0.36]].forEach(function (c) {
    hall.add(box(0.055, 0.56, 0.055, M.timber, c[0], 0.32, c[1]));
  });
  hall.add(box(0.3, 0.4, 0.06, M.ink, -0.3, 0.29, 0.4));
  hall.add(box(0.32, 0.045, 0.08, M.timber, -0.3, 0.52, 0.4));
  var win = latticeWindow(M, 0.22, 0.22, { rows: 2 }); put(hall, win, 0.18, 0.4, 0.4);
  hall.add(box(0.44, 0.3, 0.6, M.timberBr, 0.82, 0.195, -0.02));
  var lean = box(0.5, 0.024, 0.68, M.shingle, 0.84, 0.4, -0.02);
  lean.rotation.z = -0.16; hall.add(lean);
  hall.add(box(0.04, 0.42, 0.04, M.timber, 1.06, 0.25, 0.3));
  /* 屋顶系统：木瓦双坡顶（圆脊杆）apex≈0.99 */
  var roof = grp(); roof.name = 'roof-system'; g.add(roof);
  var shing = shingleRoof(M, { w: 1.02, d: 0.88, h: 0.3, over: 0.12 });
  put(roof, shing, -0.05, 0.66, -0.04);
  /* 前场：金头灯柱（每阶必有）+ 货担 + 水缸 */
  var fore = grp(); fore.name = 'forecourt-stage'; g.add(fore);
  var lamp = lampPost(M, 0.62, {}); put(fore, lamp, -0.98, 0.05, 0.52);
  var goods = goodsProps(M); put(fore, goods, 0.42, 0.06, 0.55);
  fore.add(cyl(0.07, 0.085, 0.14, 10, M.stoneD, -0.85, 0.12, -0.35));
  /* 动画：灯珠呼吸 + 纸窗呼吸 */
  var lg = M.lampGlow, pm = M.paper;
  anims.push(function (t) { lg.emissiveIntensity = 0.62 + 0.18 * sin(t * 1.6 + 0.4); });
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}
/* ---- lv2 洋房：横向两开间（瓦顶正堂 + 红布篷铺面披屋）+ 金饰鸱吻初现（h≈1.52） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  /* 石台基 + 双级踏步 */
  var podium = grp(); podium.name = 'podium-terrace'; g.add(podium);
  podium.add(box(1.9, 0.12, 1.06, M.stone, -0.12, 0.06, -0.06));
  podium.add(box(0.62, 0.06, 0.18, M.stoneD, -0.42, 0.15, 0.56));
  podium.add(box(0.5, 0.05, 0.15, M.stoneD, -0.42, 0.2, 0.68));
  /* 正堂：奶白板壁红框（两开间横墙）+ 四朱柱 + 门脸 + 格窗 + 红布篷 + 柜台 + 披屋 */
  var hall = grp(); hall.name = 'hall-body'; g.add(hall);
  hall.add(box(1.66, 0.66, 0.94, M.plaster, -0.12, 0.45, -0.06));
  hall.add(box(1.72, 0.05, 0.98, M.lacqDk, -0.12, 0.8, -0.06));
  var cols = grp(); cols.name = 'hall-colonnade'; hall.add(cols);
  [[-0.88, -0.48], [0.64, -0.48], [-0.88, 0.4], [0.64, 0.4]].forEach(function (c) {
    var col = column(M, 0.62, 0.03); put(cols, col, c[0], 0.12, c[1]);
  });
  var door = doorBay(M, 0.3, 0.4, 0.12, false); put(hall, door, -0.52, 0, 0.43);
  var plq = plaqueH(M, 0.44, 0.12); put(hall, plq, -0.52, 0.62, 0.44);
  var w1 = latticeWindow(M, 0.3, 0.3, { rows: 2 }); put(hall, w1, 0.34, 0.5, 0.43);
  var awn = awningUnit(M, 0.92); put(hall, awn, 0.02, 0.58, 0.48);
  hall.add(box(0.62, 0.34, 0.07, M.ink, 0.06, 0.29, 0.47));
  hall.add(box(0.66, 0.05, 0.17, M.timber, 0.06, 0.26, 0.56));
  var goods = goodsProps(M); put(hall, goods, 0.52, 0.12, 0.6);
  hall.add(box(0.5, 0.4, 0.7, M.plaster, 0.95, 0.32, -0.12));
  hall.add(cyl(0.08, 0.095, 0.16, 10, M.panelSd, 1.04, 0.1, 0.4));
  /* 屋顶系统：主瓦顶（鸱吻初现）+ 披屋小悬山 */
  var roof = grp(); roof.name = 'roof-system'; g.add(roof);
  var main = tileHipTier(M, { w: 1.56, d: 1.06, h: 0.42, strips: 3, chiwen: true, trim: true, tips: true });
  put(roof, main, -0.12, 0.82, -0.06);
  var shed = tileHipTier(M, { w: 0.44, d: 0.66, h: 0.16, over: 0.07 });
  put(roof, shed, 0.95, 0.52, -0.12);
  /* 前场：檐角金灯笼 ×2（摇摆）+ 灯柱 ×1 */
  var fore = grp(); fore.name = 'forecourt-stage'; g.add(fore);
  var sw1 = grp(); sw1.name = 'lantern-unit'; put(fore, sw1, -0.86, 0.86, 0.5);
  sw1.add(lanternGold(M, 0.9, 0.9));
  var sw2 = grp(); sw2.name = 'lantern-unit'; put(fore, sw2, 0.6, 0.86, 0.5);
  sw2.add(lanternGold(M, 0.9, 2.2));
  var lamp = lampPost(M, 0.88, {}); put(fore, lamp, -1.08, 0.05, 0.58);
  /* 动画：灯笼摆 + 灯珠/纸窗呼吸 */
  var lg = M.lampGlow, pm = M.paper;
  anims.push(function (t) {
    sw1.rotation.z = sin(t * 1.3 + 0.9) * 0.06;
    sw2.rotation.z = sin(t * 1.3 + 2.4) * 0.06;
  });
  anims.push(function (t) { lg.emissiveIntensity = 0.62 + 0.16 * sin(t * 1.5 + 0.8); });
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.05 + 0.3); });
  return g;
}
/* ---- lv3 大厦：三重檐楼阁 + 斗拱带 + 檐角金灯笼串 + 红毯踏步（h≈2.2） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.4));
  /* 石台基 + 踏步 + 红毯 */
  var podium = grp(); podium.name = 'podium-terrace'; g.add(podium);
  podium.add(box(2.0, 0.14, 1.3, M.stone, 0, 0.07, -0.08));
  podium.add(box(0.66, 0.055, 0.2, M.stoneD, 0, 0.17, 0.62));
  podium.add(box(0.56, 0.05, 0.17, M.stoneD, 0, 0.225, 0.76));
  podium.add(box(0.34, 0.012, 0.5, M.carpet, 0, 0.2, 0.78));
  /* 楼身三层 + 柱列 + 门脸 + 格窗 + 红栏杆 + 金圆徽 + 斗拱 */
  var hall = grp(); hall.name = 'hall-body'; g.add(hall);
  hall.add(box(1.58, 0.56, 0.94, M.plaster, 0, 0.42, -0.05));
  hall.add(box(1.64, 0.045, 0.98, M.lacqDk, 0, 0.72, -0.05));
  var cols = grp(); cols.name = 'hall-colonnade'; hall.add(cols);
  [[-0.72, -0.44], [0.72, -0.44], [-0.72, 0.4], [0.72, 0.4]].forEach(function (c) {
    var col = column(M, 0.54, 0.03); put(cols, col, c[0], 0.14, c[1]);
  });
  var door = doorBay(M, 0.32, 0.42, 0.14, true); put(hall, door, 0, 0, 0.44);
  var wf1 = latticeWindow(M, 0.26, 0.26, { rows: 2 }); put(hall, wf1, -0.5, 0.46, 0.43);
  var wf2 = latticeWindow(M, 0.26, 0.26, { rows: 2 }); put(hall, wf2, 0.5, 0.46, 0.43);
  var dg1 = dougongBand(M, 1.6, 6); put(hall, dg1, 0, 0.765, 0.4);
  hall.add(box(1.3, 0.44, 0.82, M.lacq, 0, 1.1, -0.06));
  hall.add(box(1.14, 0.26, 0.03, M.plaster, 0, 1.1, 0.36));
  hall.add(box(0.94, 0.03, 0.03, M.lacqDk, 0, 1.21, 0.38));
  var balc = grp(); balc.name = 'balcony-band'; hall.add(balc);
  balc.position.set(0, 0.92, 0.4);
  balc.add(box(1.06, 0.028, 0.06, M.lacqDk, 0, 0, 0));
  balc.add(box(1.06, 0.02, 0.03, M.lacq, 0, 0.09, 0.02));
  for (var bi = 0; bi < 9; bi++) balc.add(box(0.018, 0.08, 0.016, M.lacq, -0.48 + bi * 0.12, 0.05, 0.015));
  var rd1 = roundel(M, 0.075); rd1.name = 'roundel'; put(hall, rd1, 0, 1.14, 0.385);
  var dg2 = dougongBand(M, 1.34, 6); put(hall, dg2, 0, 1.345, 0.36);
  hall.add(box(1.04, 0.34, 0.72, M.lacqBr, 0, 1.65, -0.06));
  hall.add(box(0.86, 0.2, 0.03, M.plaster, 0, 1.66, 0.31));
  var wt1 = latticeWindow(M, 0.18, 0.16, { rows: 1 }); put(hall, wt1, -0.2, 1.66, 0.33);
  var wt2 = latticeWindow(M, 0.18, 0.16, { rows: 1 }); put(hall, wt2, 0.2, 1.66, 0.33);
  var rd2 = roundel(M, 0.06); rd2.name = 'roundel-2'; put(hall, rd2, 0, 1.73, 0.315);
  /* 屋顶系统：三层檐（顶檐鸱吻+金脊）+ 檐角灯笼串 */
  var roof = grp(); roof.name = 'roof-system'; g.add(roof);
  var e1 = tileHipTier(M, { w: 1.72, d: 1.14, h: 0.18, strips: 2, chiwen: false, trim: true });
  put(roof, e1, 0, 0.79, -0.05);
  var e2 = tileHipTier(M, { w: 1.46, d: 1.0, h: 0.16, strips: 2, chiwen: false, trim: true });
  put(roof, e2, 0, 1.5, -0.06);
  var e3 = tileHipTier(M, { w: 1.18, d: 0.86, h: 0.28, strips: 3, chiwen: true, trim: true, big: true });
  put(roof, e3, 0, 1.78, -0.06);
  var sws = [];
  [[-0.94, 0.86, 0.52], [0.94, 0.86, 0.52], [-0.8, 1.55, 0.46], [0.8, 1.55, 0.46]].forEach(function (p, i) {
    var sw = grp(); sw.name = 'lantern-unit'; put(roof, sw, p[0], p[1], p[2]);
    sw.add(lanternGold(M, 0.82, i * 1.3));
    sws.push({ g: sw, ph: i * 1.3 });
  });
  /* 前场：灯柱 ×2 + 盆栽 */
  var fore = grp(); fore.name = 'forecourt-stage'; g.add(fore);
  var lampL = lampPost(M, 1.05, {}); put(fore, lampL, -1.06, 0.05, 0.62);
  var lampR = lampPost(M, 1.05, {}); put(fore, lampR, 1.06, 0.05, 0.62);
  fore.add(cyl(0.055, 0.07, 0.1, 10, M.stoneD, -0.72, 0.21, 0.85));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(fore, bush, -0.72, 0.31, 0.85); bush.scale.y = 0.85;
  /* 动画：灯笼串摆 + 灯珠/纸窗呼吸 */
  var lg = M.lampGlow, pm = M.paper;
  anims.push(function (t) {
    for (var i = 0; i < sws.length; i++) sws[i].g.rotation.z = sin(t * 1.35 + sws[i].ph) * 0.055;
  });
  anims.push(function (t) { lg.emissiveIntensity = 0.62 + 0.16 * sin(t * 1.5 + 1.2); });
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1 + 0.5); });
  return g;
}
/* ---- lv4 地标：重檐宫殿楼阁 + 火焰宝顶 + 朱门垂幔 + 金凤仪仗 + 灯柱广场（h≈2.8） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.45));
  /* 高石台基（双层收边）+ 三级踏步 + 通幅红毯 */
  var podium = grp(); podium.name = 'podium-terrace'; g.add(podium);
  podium.add(box(2.16, 0.05, 1.62, M.stoneD, 0, 0.025, -0.04));
  podium.add(box(2.06, 0.21, 1.54, M.stone, 0, 0.155, -0.04));
  podium.add(box(2.12, 0.035, 1.58, M.stoneBr, 0, 0.26, -0.04));
  podium.add(box(0.72, 0.06, 0.22, M.stoneD, 0, 0.29, 0.74));
  podium.add(box(0.62, 0.055, 0.2, M.stoneD, 0, 0.35, 0.9));
  podium.add(box(0.52, 0.05, 0.18, M.stoneD, 0, 0.4, 1.04));
  podium.add(box(0.44, 0.014, 0.72, M.carpet, 0, 0.375, 0.98));
  /* 门廊殿（一层）+ 二层殿身：朱柱白壁 + 朱门金钉 + 垂幔 + 匾额 + 金圆徽 + 斗拱 + 红平座 */
  var hall = grp(); hall.name = 'hall-body'; g.add(hall);
  hall.add(box(1.76, 0.66, 0.98, M.plaster, 0, 0.65, -0.1));
  hall.add(box(1.82, 0.05, 1.02, M.lacqDk, 0, 1.005, -0.1));
  var cols = grp(); cols.name = 'hall-colonnade'; hall.add(cols);
  [-0.78, -0.26, 0.26, 0.78].forEach(function (x) {
    var col = column(M, 0.64, 0.034); put(cols, col, x, 0.26, 0.36);
  });
  var door = doorBay(M, 0.36, 0.5, 0.26, true); put(hall, door, 0, 0, 0.44);
  var drape = drapeSwag(M, 1.0); put(hall, drape, 0, 0.86, 0.42);
  var plq = plaqueH(M, 0.56, 0.14); put(hall, plq, 0, 0.97, 0.465);
  var dg1 = dougongBand(M, 1.78, 6); put(hall, dg1, 0, 1.03, 0.34);
  hall.add(box(1.42, 0.6, 0.88, M.lacq, 0, 1.66, -0.08));
  hall.add(box(1.22, 0.3, 0.03, M.plaster, 0, 1.68, 0.37));
  var wl = latticeWindow(M, 0.24, 0.22, { rows: 2 }); put(hall, wl, -0.32, 1.68, 0.39);
  var wr = latticeWindow(M, 0.24, 0.22, { rows: 2 }); put(hall, wr, 0.32, 1.68, 0.39);
  var rd = roundel(M, 0.085); rd.name = 'roundel'; put(hall, rd, 0, 1.72, 0.385);
  var balc = grp(); balc.name = 'balcony-band'; hall.add(balc);
  balc.position.set(0, 1.4, 0.4);
  balc.add(box(1.34, 0.03, 0.07, M.lacqDk, 0, 0, 0));
  balc.add(box(1.34, 0.022, 0.032, M.lacq, 0, 0.1, 0.02));
  for (var bi = 0; bi < 8; bi++) balc.add(box(0.018, 0.09, 0.016, M.lacq, -0.6 + bi * 0.17, 0.055, 0.018));
  [[-0.62, 0.34], [0.62, 0.34]].forEach(function (c) {
    var col = column(M, 0.56, 0.03); put(cols, col, c[0], 1.36, c[1]);
  });
  var dg2 = dougongBand(M, 1.46, 6); put(hall, dg2, 0, 2.0, 0.3);
  /* 屋顶系统：重檐（腰檐+顶檐）+ 鸱吻 + 火焰宝顶 + 檐角灯笼串 */
  var roof = grp(); roof.name = 'roof-system'; g.add(roof);
  var e1 = tileHipTier(M, { w: 2.0, d: 1.34, h: 0.3, strips: 3, chiwen: true, trim: true });
  put(roof, e1, 0, 1.06, -0.08);
  var e2 = tileHipTier(M, { w: 1.64, d: 1.14, h: 0.44, strips: 3, chiwen: true, trim: true, tips: true, big: true, finial: true });
  put(roof, e2, 0, 2.02, -0.08);
  var sws = [];
  [[-0.5, 1.02, 0.44], [0.5, 1.02, 0.44], [-1.06, 1.28, 0.5], [1.06, 1.28, 0.5], [-0.72, 2.2, 0.44], [0.72, 2.2, 0.44]].forEach(function (p, i) {
    var sw = grp(); sw.name = 'lantern-unit'; put(roof, sw, p[0], p[1], p[2]);
    sw.add(lanternGold(M, i < 2 ? 1.05 : 0.8, i * 1.1));
    sws.push({ g: sw, ph: i * 1.1 });
  });
  /* 前场广场：朱柱金灯石础一对 + 金凤凰仪仗一对（石础）+ 盆栽 */
  var fore = grp(); fore.name = 'forecourt-stage'; g.add(fore);
  var lampL = lampPost(M, 0.6, { red: true, pedestal: true }); put(fore, lampL, -0.95, 0.05, 0.86);
  var lampR = lampPost(M, 0.6, { red: true, pedestal: true }); put(fore, lampR, 0.95, 0.05, 0.86);
  var phL = grp(); phL.name = 'statue-pedestal'; put(fore, phL, -1.14, 0.28, 0.6);
  phL.add(box(0.16, 0.14, 0.16, M.stoneD, 0, 0.07, 0));
  phL.add(phoenixStatue(M, 1.15));
  var phR = grp(); phR.name = 'statue-pedestal'; put(fore, phR, 1.14, 0.28, 0.6);
  phR.add(box(0.16, 0.14, 0.16, M.stoneD, 0, 0.07, 0));
  phR.add(phoenixStatue(M, 1.15));
  [[-0.78], [0.78]].forEach(function (c) {
    fore.add(cyl(0.055, 0.07, 0.1, 10, M.stoneD, c[0], 0.31, 0.95));
    var b = mesh(new THREE.IcosahedronGeometry(0.065, 0), M.grassD); put(fore, b, c[0], 0.4, 0.95); b.scale.y = 0.85;
  });
  /* 动画：灯笼串摆 + 灯珠/纸窗呼吸 */
  var lg = M.lampGlow, pm = M.paper;
  anims.push(function (t) {
    for (var i = 0; i < sws.length; i++) sws[i].g.rotation.z = sin(t * 1.25 + sws[i].ph) * 0.05;
  });
  anims.push(function (t) { lg.emissiveIntensity = 0.62 + 0.16 * sin(t * 1.5 + 1.6); });
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.05 + 0.9); });
  return g;
}
/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[30] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_30_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 30;
  g.userData.level = lv;
  g.userData.region = 'g6';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
