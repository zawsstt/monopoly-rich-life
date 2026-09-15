/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_30.js  (v2 精修版)
 * -------------------------------------------------------------------------------------
 * 格 30「大唐不夜城」(g6 盛唐地标) 独属建筑：唐风楼阁四阶生长史
 * 参考图 refs/prop_30.png 高保真复刻；v2 = 在 v1 验收布局上逐条清偿细节差距
 *（规范见 REFINE_SPEC.md；渲染对照 .img2threejs/render_prop30_sheet_lv.png）。
 *
 * 风格族谱（同一块地的同一种盛唐的生长，v2 保持不变）：
 *   lv1 小屋   金棕木瓦小屋 + 披屋 + 金头灯柱（h≈1.05）——木瓦垄 + 圆脊杆是唐风种子
 *   lv2 洋房   横向两开间：瓦顶正堂 + 红布篷铺面披屋，金饰鸱吻初现 + 檐下斗拱初现（h≈1.48）
 *   lv3 大厦   三重檐楼阁：逐层收分 + 斗拱带 + 檐角金灯笼串 + 红毯踏步 + 双层平座栏杆（h≈2.26）
 *   lv4 地标   重檐宫殿楼阁 + 金鸱吻火焰宝顶 + 朱门金钉 + 垂幔 + 金凤仪仗 + 灯柱石板广场（h≈2.73）
 *
 * v2 精修清单（对照参考图逐区落实）：
 *   · 筒瓦瓦垄立体化：前坡半圆垄线逐垄排布（tileHipTier.ribs）+ 檐口浅色瓦当/滴水带
 *     （512px texEave 瓦当圆盘+滴水三角，替换 v1 单条平面封檐）
 *   · 鸱吻双段卷曲：根板金箍 + 下段反卷 + 上段回勾 + 卷珠 + 背刺（v1 单板小块）
 *   · 斗拱昂拱分层带：下枋 + 红拱臂/金斗/斜昂相间 + 上枋金边（v1 单排扁块）
 *   · 红棂窗棂格：行×列双向密格 + 窗台板（v1 仅 1 竖棂 + 横棂）
 *   · 金灯笼串骨架与穗：挂环 + 吊杆（挂点即摆动轴）+ 上下金盖 + 双道笼箍 + 三股红穗
 *   · 匾额描金笔画：512px 木纹朱底 + 双勾描金 + 角花（v1 平面金字）
 *   · 火焰宝顶层次：莲座三叠盘 + 六瓣火焰叶 + 宝珠 + 顶刺（v1 三盘一锥）
 *   · 金凤仪仗翎羽：五支扇形尾翎 + 双翼 + 冠羽（v1 两片尾板）
 *   · lv1 檐下椽头加密压条 + 脊上鸟饰 + 墙边柴堆；lv2 篷柱竹筐；lv3 二层平座栏杆 + 石板前场
 *   · lv4 入口红毯改沿踏步分段落地（修复 v1 毯端悬空）、石板广场、金锣架、盆栽落地
 *   · 圆柱段数≥12 / 球≥16×12 / 圆锥≥8（对齐 REFINE_SPEC 第三节），纹理上限 512px
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[30] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤512px）；每级 mesh ≤350；userData.anim=[fn(t,dt)]。
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
function cyl(rt, rb, h, seg, mat, x, y, z) {
  var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg | 0)), mat);
  o.position.set(x || 0, y || 0, z || 0); return o;
}
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) {
  var o = mesh(new THREE.ConeGeometry(r, h, Math.max(8, seg | 0)), mat);
  o.position.set(x || 0, y || 0, z || 0); return o;
}
function torus(r, t, rs, ts, mat, x, y, z) {
  var o = mesh(new THREE.TorusGeometry(r, t, Math.max(6, rs | 0), Math.max(12, ts | 0)), mat);
  o.position.set(x || 0, y || 0, z || 0); return o;
}
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

/* 黑青筒瓦垄：横向垄线明暗 + 竖向接头错缝 + 釉面噪点（map+bump 同源） */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#454e5a'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#4d5765' : '#48515e';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#5a6674'; g.fillRect(0, y + 1, S, 3);            /* 亮瓦垄面 */
    g.fillStyle = '#3a424d'; g.fillRect(0, y + rh - 6, S, 3);       /* 垄肩阴影 */
    g.fillStyle = '#2c323b'; g.fillRect(0, y + rh - 3, S, 3);       /* 深垄缝 */
    var off = (i % 2) ? rh * 1.5 : 0;
    for (k = 0; k < 5; k++) {
      var x = (off + k * (S / 5)) % S;
      g.fillStyle = 'rgba(30,36,44,0.5)'; g.fillRect(x, y, 2, rh - 3);
    }
  }
  for (i = 0; i < 320; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(16,20,26,0.09)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 金棕木瓦垄（lv1）：横排瓦板 + 板端阴影缝 + 亮板面 */
function texShingle() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b07c42'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows, i, k;
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
  for (i = 0; i < 200; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,230,180,0.05)' : 'rgba(60,34,12,0.07)';
    g.fillRect((i * 41) % S, (i * 57) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 金棕木板壁（lv1 墙身）：横板拼缝 + 木纹丝 */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#8a6438'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#90693c' : '#856033'; g.fillRect(0, y, S, rh);
    g.fillStyle = '#9d7544'; g.fillRect(0, y + 1, S, 2);
    g.fillStyle = '#593d1d'; g.fillRect(0, y + rh - 2, S, 2);
  }
  for (i = 0; i < 120; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,230,180,0.05)' : 'rgba(50,30,10,0.08)';
    g.fillRect((i * 31) % S, (i * 47) % S, 5, 1);
  }
  return toTex(cv, true);
}
/* 奶白抹灰：细噪 + 抹痕 */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#f2e8d4'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 140; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(150,132,100,0.06)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  return toTex(cv, true);
}
/* 檐口瓦当带：浅色望板 + 一排圆瓦当（金环朱心）+ 盘间滴水（v2 新增，512px） */
function texEave() {
  var w = 512, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#3a424d'; g.fillRect(0, 0, w, 12);                /* 檐内阴影 */
  g.fillStyle = '#e9ddc2'; g.fillRect(0, 12, w, h - 12);           /* 浅色望板底 */
  g.fillStyle = 'rgba(120,104,70,0.25)';
  for (var i = 0; i < 60; i++) g.fillRect((i * 53) % w, 14 + (i * 29) % (h - 22), 3, 2);
  var n = 16, step = w / n, i2;
  for (i2 = 0; i2 < n; i2++) {
    var cx = (i2 + 0.5) * step;
    g.fillStyle = '#ddd0b0';                                       /* 滴水三角（盘间） */
    g.beginPath(); g.moveTo(cx - step * 0.5 + 2, 12); g.lineTo(cx - 3, 52);
    g.lineTo(cx + 3, 52); g.lineTo(cx + step * 0.5 - 2, 12); g.closePath(); g.fill();
    g.fillStyle = '#c9b891'; g.beginPath(); g.arc(cx, 34, 15, 0, PI * 2); g.fill();
    g.fillStyle = '#efe6cf'; g.beginPath(); g.arc(cx, 34, 12, 0, PI * 2); g.fill();
    g.strokeStyle = '#a98f56'; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, 34, 9, 0, PI * 2); g.stroke();
    g.fillStyle = '#b53424'; g.beginPath(); g.arc(cx, 34, 4, 0, PI * 2); g.fill();
    g.fillStyle = 'rgba(60,50,30,0.35)'; g.fillRect(cx - 15, 48, 30, 3);
  }
  return toTex(cv, true);
}
/* 石板广场（lv3/4 前场 + 门径）：错缝石板 + 深色垫层噪点 */
function texPave() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#c9c2ae'; g.fillRect(0, 0, S, S);
  var cell = 42, i, j;
  for (j = 0; j < 7; j++) for (i = 0; i < 7; i++) {
    var x = i * cell + ((j % 2) ? cell / 2 : 0), y = j * cell;
    g.fillStyle = (i + j) % 2 ? '#d5cebb' : '#dcd6c5';
    g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
    if ((i * 7 + j) % 5 === 0) { g.fillStyle = 'rgba(150,140,115,0.3)'; g.fillRect(x + 5, y + 6, cell - 12, 3); }
  }
  for (i = 0; i < 260; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.05)' : 'rgba(80,72,55,0.07)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 红毯金边（lv3/4 踏步地毯）：朱红地 + 金织边 + 中心织纹点 */
function texCarpet() {
  var w = 256, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#a8382a'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#e8c27a'; g.lineWidth = 7; g.strokeRect(5, 5, w - 10, h - 10);
  g.strokeStyle = 'rgba(232,194,122,0.5)'; g.lineWidth = 2; g.strokeRect(18, 18, w - 36, h - 36);
  g.fillStyle = 'rgba(255,220,150,0.3)';
  for (var i = 0; i < 40; i++) g.fillRect(24 + (i * 23) % (w - 48), 26 + (i * 17) % (h - 52), 3, 3);
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 2) ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.04)';
    g.fillRect((i * 41) % w, (i * 57) % h, 2, 2);
  }
  return toTex(cv, true);
}
/* 匾额「大唐不夜城」：朱漆木纹底 + 双层金框 + 角花 + 双勾描金笔画（512px） */
function texPlaqueH() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#43100a'; g.fillRect(0, 0, w, h);
  for (var i = 0; i < 24; i++) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect((i * 37) % w, 0, 2, h); }
  g.strokeStyle = '#e8c27a'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
  g.strokeStyle = 'rgba(232,194,122,0.55)'; g.lineWidth = 2; g.strokeRect(22, 22, w - 44, h - 44);
  g.fillStyle = '#f2cf7e';
  [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]].forEach(function (p) {
    g.beginPath(); g.arc(p[0], p[1], 6, 0, PI * 2); g.fill();
  });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 74px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.lineWidth = 6; g.strokeStyle = '#7a5a1e'; g.strokeText('大唐不夜城', w / 2, h / 2 + 4);
  g.fillStyle = '#f6d488'; g.fillText('大唐不夜城', w / 2, h / 2 + 4);
  g.lineWidth = 1.5; g.strokeStyle = 'rgba(255,244,200,0.85)'; g.strokeText('大唐不夜城', w / 2, h / 2 + 1);
  return toTex(cv, true);
}
/* 金圆盒徽（lv3/4 层间金饰）：金地 + 朱圈 + 金珠心 */
function texRoundel() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e8b866'; g.fillRect(0, 0, S, S);
  g.fillStyle = '#9e2619'; g.beginPath(); g.arc(S / 2, S / 2, 44, 0, PI * 2); g.fill();
  g.strokeStyle = '#f6d488'; g.lineWidth = 8; g.beginPath(); g.arc(S / 2, S / 2, 34, 0, PI * 2); g.stroke();
  g.fillStyle = '#f6d488'; g.beginPath(); g.arc(S / 2, S / 2, 14, 0, PI * 2); g.fill();
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
    plank:     MAT('p30plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.85 }); }),
    stone:     MAT('p30stone', function () { return std('#cfc5b0', { rough: 0.92 }); }),
    stoneD:    MAT('p30stoneD', function () { return std('#b0a793', { rough: 0.94 }); }),
    stoneBr:   MAT('p30stoneBr', function () { return std('#ddd5c2', { rough: 0.9 }); }),
    grass:     MAT('p30grass', function () { return std('#7c8536', { rough: 0.95 }); }),
    grassD:    MAT('p30grassD', function () { return std('#6a732c', { rough: 0.95 }); }),
    pave:      MAT('p30pave', function () { return std('#ffffff', { map: getTex('pave', texPave), rough: 0.93 }); }),
    eaveBand:  MAT('p30eave', function () { return std('#ffffff', { map: getTex('eave', texEave), rough: 0.7 }); }),
    carpet:    MAT('p30carpet', function () { return std('#ffffff', { map: getTex('carpet', texCarpet), rough: 0.95 }); }),
    drape:     MAT('p30drape', function () { return std('#7e2013', { rough: 0.6 }); }),
    ink:       MAT('p30ink', function () { return std('#2a2226', { rough: 0.85 }); }),
    /* 发光件（共享材质 → 呼吸动画只需驱动一次） */
    lampGlow:  MAT('p30lampGlow', function () { return std('#f7d9a0', { rough: 0.4, emissive: '#ffc97e', ei: 0.62 }); }),
    lantGlow:  MAT('p30lantGlow', function () { return std('#e8b866', { rough: 0.42, metal: 0.55, emissive: '#ffbe6e', ei: 0.5 }); }),
    paper:     MAT('p30paper', function () { return std('#f5e9cc', { rough: 0.9, emissive: '#ffd98a', ei: 0.16 }); })
  };
}

/* ================= 2. 预制件（风格独有语汇，v2 精修） ================= */

/* 红框白纸格窗 v2：朱框 + 纸面（微光）+ 行×列双向棂格 + 窗台板 */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var rows = o.rows || 2, cols = (o.cols === undefined ? 2 : o.cols), i;
  var g = grp(); g.name = 'lattice-window';
  g.add(box(w + 0.045, h + 0.045, 0.03, M.lacqDk));
  g.add(box(w, h, 0.028, M.paper, 0, 0, 0.004));
  for (i = 1; i <= rows; i++) g.add(box(w, 0.02, 0.034, M.lacq, 0, -h / 2 + i * h / (rows + 1), 0.007));
  for (i = 1; i <= cols; i++) g.add(box(0.018, h, 0.034, M.lacq, -w / 2 + i * w / (cols + 1), 0, 0.007));
  g.add(box(w + 0.09, 0.028, 0.06, M.lacqDk, 0, -(h + 0.045) / 2 - 0.012, 0.01));  /* 窗台 */
  return g;
}

/* 朱柱 v2（金箍柱头 + 中段金箍 + 石础 + 柱顶枋头；plain=上层短柱省中箍） */
function column(M, h, r, plain) {
  var g = grp(); g.name = 'column';
  g.add(box(r * 2.6, 0.04, r * 2.6, M.stoneD, 0, 0.02, 0));
  g.add(cyl(r, r * 1.06, h, 12, M.lacqBr, 0, 0.04 + h / 2, 0));
  g.add(cyl(r * 1.16, r * 1.16, 0.026, 12, M.gilt, 0, 0.04 + h - 0.05, 0));
  if (!plain) g.add(cyl(r * 1.1, r * 1.1, 0.02, 12, M.giltDk, 0, 0.04 + h * 0.45, 0));
  g.add(box(r * 2.5, 0.05, r * 2.5, M.lacqDk, 0, 0.04 + h + 0.025, 0));
  return g;
}

/* 斗拱带 v2（lv2 起）：下枋 + 红拱臂（出跳）/金斗/斜昂相间 + 上枋金边 */
function dougongBand(M, w, n) {
  var g = grp(); g.name = 'dougong-band';
  n = n || 6; var i;
  g.add(box(w, 0.032, 0.1, M.lacqDk, 0, 0, 0));                              /* 下枋 */
  var step = w / n;
  for (i = 0; i < n; i++) {
    var x = -w / 2 + (i + 0.5) * step;
    g.add(box(step * 0.52, 0.028, 0.15, M.lacq, x, 0.035, 0.012));           /* 红拱臂（出跳） */
    if (i % 2 === 0) g.add(box(step * 0.4, 0.026, step * 0.4, M.gilt, x, 0.062, 0));  /* 金斗 */
    else {
      var ang = box(step * 0.3, 0.052, 0.045, M.giltDk, x, 0.048, 0.05);
      ang.rotation.x = 0.6; g.add(ang);                                      /* 斜昂 */
    }
  }
  g.add(box(w, 0.026, 0.13, M.lacqBr, 0, 0.086, 0));                         /* 上枋 */
  g.add(box(w * 0.98, 0.012, 0.135, M.gilt, 0, 0.105, 0));                   /* 金边 */
  return g;
}

/* 鎏金鸱吻 v2：脊端双段 S 形卷曲（根板金箍 + 下段反卷 + 上段回勾 + 卷珠 + 背刺） */
function chiwen(M, s, flip) {
  var g = grp(); g.name = 'chiwen-curl'; s = s || 1;
  var f = flip ? -1 : 1;
  g.add(box(0.05 * s, 0.15 * s, 0.055 * s, M.gilt, 0, 0.075 * s, 0));
  g.add(box(0.064 * s, 0.028 * s, 0.07 * s, M.giltDk, 0, 0.03 * s, 0));
  var c1 = box(0.052 * s, 0.078 * s, 0.048 * s, M.gilt, f * 0.028 * s, 0.168 * s, 0);
  c1.rotation.z = f * -0.95; g.add(c1);
  var c2 = box(0.04 * s, 0.058 * s, 0.04 * s, M.giltBr, f * 0.072 * s, 0.192 * s, 0);
  c2.rotation.z = f * -1.95; g.add(c2);
  g.add(sph(0.02 * s, M.giltBr, f * 0.096 * s, 0.213 * s, 0));
  g.add(cone(0.013 * s, 0.042 * s, 8, M.giltBr, 0, 0.172 * s, 0));
  return g;
}

/* 火焰宝顶簇 v2（lv4）：莲座三叠盘 + 六瓣火焰叶 + 宝珠 + 顶刺 */
function flameFinial(M, s) {
  var g = grp(); g.name = 'flame-finial'; s = s || 1;
  g.add(cyl(0.062 * s, 0.078 * s, 0.032 * s, 12, M.gilt, 0, 0.016 * s, 0));
  g.add(cyl(0.046 * s, 0.058 * s, 0.03 * s, 12, M.giltDk, 0, 0.047 * s, 0));
  g.add(cyl(0.03 * s, 0.042 * s, 0.028 * s, 12, M.gilt, 0, 0.076 * s, 0));
  for (var k = 0; k < 6; k++) {
    var a = k * PI / 3;
    var petal = cone(0.011 * s, 0.05 * s, 8, M.giltBr, cos(a) * 0.036 * s, 0.098 * s, sin(a) * 0.036 * s);
    petal.rotation.z = -cos(a) * 0.55; petal.rotation.x = sin(a) * 0.55;
    g.add(petal);
  }
  g.add(sph(0.02 * s, M.giltBr, 0, 0.115 * s, 0));
  g.add(cone(0.009 * s, 0.05 * s, 8, M.gilt, 0, 0.148 * s, 0));
  return g;
}

/* 金笼灯笼 v2：挂环 + 吊杆（挂点=摆动轴）+ 金盖 + 笼箍骨架（大笼双道/小笼单道）+ 三股红穗 */
function lanternGold(M, s, hang) {
  var g = grp(); g.name = 'lantern-unit'; s = s || 1;
  hang = (hang === undefined ? 0.06 * s : hang);
  g.add(torus(0.013 * s, 0.0045 * s, 6, 12, M.giltDk, 0, hang + 0.05 * s, 0));       /* 挂环 */
  g.add(cyl(0.005 * s, 0.005 * s, hang + 0.002, 12, M.giltDk, 0, 0.05 * s + hang / 2, 0));  /* 吊杆 */
  g.add(cyl(0.033 * s, 0.046 * s, 0.03 * s, 12, M.gilt, 0, 0.035 * s, 0));           /* 上金盖 */
  var body = sph(0.07 * s, M.lantGlow, 0, 0, 0); body.scale.y = 0.92; g.add(body);   /* 暖光笼身 */
  if (s >= 0.9) {
    var r1 = torus(0.062 * s, 0.0045 * s, 6, 14, M.gilt, 0, 0.03 * s, 0); r1.rotation.x = PI / 2; g.add(r1);
    var r2 = torus(0.062 * s, 0.0045 * s, 6, 14, M.gilt, 0, -0.03 * s, 0); r2.rotation.x = PI / 2; g.add(r2);
  } else {
    var r0 = torus(0.07 * s, 0.0045 * s, 6, 14, M.gilt, 0, 0, 0); r0.rotation.x = PI / 2; g.add(r0);
  }
  g.add(cyl(0.046 * s, 0.032 * s, 0.028 * s, 12, M.gilt, 0, -0.035 * s, 0));         /* 下金盖 */
  g.add(cyl(0.013 * s, 0.009 * s, 0.014 * s, 12, M.giltBr, 0, -0.056 * s, 0));       /* 穗座 */
  for (var k = -1; k <= 1; k++) g.add(cyl(0.0042 * s, 0.0042 * s, 0.055 * s, 12, M.lacqBr, k * 0.013 * s, -0.09 * s, 0));
  return g;
}
/* 挂灯笼：sw 组原点=挂环点（摆动以挂点为轴），笼身下垂 hang */
function hangLantern(parent, M, x, yRing, z, s, hang) {
  var sw = grp(); sw.name = 'lantern-unit';
  sw.position.set(x, yRing, z);
  var unit = lanternGold(M, s, hang);
  unit.position.y = -(hang + 0.05 * s);
  sw.add(unit);
  parent.add(sw);
  return sw;
}

/* 金头灯柱 v2：石础 + 独杆金箍 + 金盏灯头 + 暖光珠 + 顶珠（每阶必有） */
function lampPost(M, h, o) {
  o = o || {};
  var g = grp(); g.name = 'lamp-post';
  var poleM = o.red ? M.lacqBr : M.timber;
  g.add(cyl(0.03, 0.042, 0.06, 12, M.stoneD, 0, 0.03, 0));
  if (o.pedestal) g.add(box(0.14, 0.16, 0.14, M.stone, 0, 0.14, 0));
  var y0 = o.pedestal ? 0.22 : 0.06;
  g.add(cyl(0.014, 0.02, h, 12, poleM, 0, y0 + h / 2, 0));
  g.add(cyl(0.02, 0.024, 0.03, 12, M.giltDk, 0, y0 + h * 0.55, 0));      /* 杆中金箍 */
  g.add(cyl(0.05, 0.028, 0.045, 12, M.gilt, 0, y0 + h + 0.02, 0));       /* 金盏 */
  g.add(sph(0.032, M.lampGlow, 0, y0 + h + 0.07, 0));                    /* 灯珠 */
  g.add(cone(0.034, 0.03, 12, M.giltBr, 0, y0 + h + 0.115, 0));
  g.add(sph(0.012, M.giltBr, 0, y0 + h + 0.14, 0));                      /* 顶珠 */
  return g;
}

/* 朱门金钉门脸：门洞阴影 + 朱门扇 + 金横带 + 金钉 + 石门槛 */
function doorBay(M, w, h, y0, studs) {
  var g = grp(); g.name = 'door-bay';
  g.add(box(w + 0.07, h + 0.05, 0.04, M.lacqDk, 0, y0 + (h + 0.05) / 2));
  g.add(box(w, h, 0.042, M.ink, 0, y0 + h / 2, -0.006));
  g.add(box(w * 0.9, h * 0.84, 0.05, M.lacqBr, 0, y0 + h / 2, 0.006));
  g.add(box(w * 0.9, 0.026, 0.052, M.gilt, 0, y0 + h * 0.66, 0.012));
  g.add(box(w + 0.02, 0.03, 0.09, M.stoneD, 0, Math.max(0.015, y0 - 0.005), 0.02));  /* 石门槛 */
  if (studs) {
    var xs = [-w * 0.24, 0, w * 0.24], ys = [y0 + h * 0.32, y0 + h * 0.58], i, j;
    for (j = 0; j < 2; j++) for (i = 0; i < 3; i++) g.add(sph(0.014, M.giltBr, xs[i], ys[j], 0.032));
  }
  return g;
}

/* 匾额（朱底金框描金金字） */
function plaqueH(M, w, h) {
  var g = grp(); g.name = 'plaque';
  g.add(box(w, h, 0.035, M.lacqDk));
  var p = mesh(new THREE.PlaneGeometry(w * 0.92, h * 0.78),
    new THREE.MeshStandardMaterial({ map: getTex('plaque', texPlaqueH), roughness: 0.55, metalness: 0.08, flatShading: true }));
  p.material.name = 'p30plaqueM';
  p.position.z = 0.019; g.add(p);
  return g;
}
/* 金圆盒徽 */
function roundel(M, r) {
  var g = grp();
  var d = mesh(new THREE.CircleGeometry(r, 16),
    new THREE.MeshStandardMaterial({ map: getTex('roundel', texRoundel), roughness: 0.5, metalness: 0.3, flatShading: true }));
  d.material.name = 'p30roundelM';
  g.add(d);
  var rim = mesh(new THREE.TorusGeometry(r * 0.98, r * 0.09, 8, 16), M.giltDk); g.add(rim);
  return g;
}

/* 红布篷（lv2 铺面）：斜篷布 + 扇贝垂边 + 金横杆 */
function awningUnit(M, w) {
  var g = grp(); g.name = 'awning-valance';
  var slope = box(w, 0.02, 0.24, M.drape, 0, 0.07, 0.08);
  slope.rotation.x = 0.42; g.add(slope);
  var n = 5, i;
  for (i = 0; i < n; i++) {
    var sc = mesh(new THREE.CylinderGeometry(0.03, 0.03, w / n - 0.012, 12, 1, false, PI * 0.5, PI), M.lacqBr);
    put(g, sc, -w / 2 + (i + 0.5) * (w / n), -0.014, 0.196, 0, PI / 2);
  }
  g.add(box(w + 0.03, 0.022, 0.022, M.gilt, 0, 0.024, 0.19));
  return g;
}

/* 垂幔 v2（lv4 门廊）：两侧斜垂布 + 中凹垂 + 金饰条 + 三粒金结珠 */
function drapeSwag(M, w) {
  var g = grp(); g.name = 'drape-curtain';
  var l = box(w * 0.42, 0.3, 0.022, M.drape, -w * 0.26, -0.1, 0);
  l.rotation.z = 0.42; g.add(l);
  var r = box(w * 0.42, 0.3, 0.022, M.drape, w * 0.26, -0.1, 0);
  r.rotation.z = -0.42; g.add(r);
  g.add(box(w * 0.2, 0.16, 0.022, M.drape, 0, -0.19, 0.006));
  g.add(box(w, 0.02, 0.024, M.gilt, 0, 0.052, 0.004));
  g.add(sph(0.026, M.giltBr, -w * 0.47, -0.21, 0.008));
  g.add(sph(0.026, M.giltBr, w * 0.47, -0.21, 0.008));
  g.add(sph(0.026, M.giltBr, 0, -0.28, 0.01));
  return g;
}

/* 金凤凰仪仗 v2（lv4 门侧）：身 + 颈 + 头喙冠 + 五支扇形尾翎 + 双翼 */
function phoenixStatue(M, s) {
  var g = grp(); g.name = 'guardian-statue'; s = s || 1;
  g.add(cyl(0.055 * s, 0.07 * s, 0.03 * s, 12, M.giltDk, 0, 0.015 * s, 0));
  var body = sph(0.05 * s, M.gilt, 0, 0.075 * s, 0); body.scale.set(0.9, 0.85, 1.25); g.add(body);
  var neck = cyl(0.016 * s, 0.02 * s, 0.07 * s, 12, M.gilt, 0, 0.13 * s, 0.03 * s);
  neck.rotation.x = -0.35; g.add(neck);
  g.add(sph(0.026 * s, M.gilt, 0, 0.175 * s, 0.052 * s));
  var beak = cone(0.01 * s, 0.03 * s, 8, M.giltDk, 0, 0.172 * s, 0.08 * s);
  beak.rotation.x = PI / 2; g.add(beak);
  g.add(cone(0.012 * s, 0.035 * s, 8, M.giltBr, 0, 0.2 * s, 0.04 * s));
  for (var k = -2; k <= 2; k++) {                                            /* 扇形尾翎 */
    var fl = box(0.011 * s, (0.1 - Math.abs(k) * 0.014) * s, 0.02 * s, k % 2 ? M.gilt : M.giltBr,
      0, 0.085 * s, (-0.062 - Math.abs(k) * 0.004) * s);
    fl.rotation.x = -0.62; fl.rotation.z = k * 0.3;
    g.add(fl);
  }
  var wgl = box(0.012 * s, 0.05 * s, 0.035 * s, M.giltBr, 0.048 * s, 0.085 * s, 0.01 * s);
  wgl.rotation.z = 0.55; g.add(wgl);                                         /* 翼 */
  var wgr = box(0.012 * s, 0.05 * s, 0.035 * s, M.giltBr, -0.048 * s, 0.085 * s, 0.01 * s);
  wgr.rotation.z = -0.55; g.add(wgr);
  return g;
}

/* 金棕木瓦坡顶 v2（lv1）：双坡木瓦 + 密排压条 + 檐下椽头 + 圆脊杆 + 微翘 */
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
    for (i = 0; i < 5; i++) {                                                /* 瓦板端头压条（加密） */
      var u = (i + 0.5) / 5;
      sg.add(box(w + over * 2 - 0.05, 0.014, 0.024, M.timber, 0, 0.022, k * u * eave));
    }
    if (k > 0) for (i = 0; i < 4; i++) {                                     /* 檐下椽头（前坡） */
      sg.add(box(0.028, 0.03, 0.05, M.timberBr, -0.39 + i * 0.26, -0.032, k * (eave - 0.03)));
    }
    var cL = box(0.06, 0.04, 0.06, M.timber, (w + over * 2) / 2 - 0.005, 0.045, k * (eave - 0.02));
    cL.rotation.z = 0.5; sg.add(cL);
    var cR = box(0.06, 0.04, 0.06, M.timber, -(w + over * 2) / 2 + 0.005, 0.045, k * (eave - 0.02));
    cR.rotation.z = -0.5; sg.add(cR);
  }
  var ridge = cyl(0.026, 0.026, w + over * 2 + 0.1, 12, M.timberBr, 0, h + 0.028, 0);
  ridge.rotation.z = PI / 2; g.add(ridge);                                   /* 圆脊杆(沿X) */
  var p1 = box(0.05, 0.05, 0.06, M.timberBr, (w + over * 2) / 2 + 0.02, h + 0.02, 0);
  p1.rotation.z = 0.6; g.add(p1);                                            /* 穿枋出头 */
  var p2 = box(0.05, 0.05, 0.06, M.timberBr, -(w + over * 2) / 2 - 0.02, h + 0.02, 0);
  p2.rotation.z = -0.6; g.add(p2);
  return g;
}

/* 黑青筒瓦四坡檐层 v2（核心语汇）：四坡瓦面 + 逐垄筒瓦线 + 瓦当带 + 朱封檐 +
 * 檐角挑块 + 金腰檐带 + 正脊金段 + 双段卷曲鸱吻 + 火焰宝顶 */
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
  if (o.ribs) for (i = 0; i < o.ribs; i++) {                                     /* 筒瓦垄（v2） */
    var rx = -w / 2 - over + (i + 0.5) * ((w + over * 2) / o.ribs);
    var rib = cyl(0.011, 0.011, lenF * 0.82, 12, M.roofJoint, rx, 0.028, lenF / 2);
    rib.rotation.x = PI / 2; sgF.add(rib);
  }
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
  /* 檐口瓦当带（v2：浅色圆瓦当+滴水，贴在封檐之外） */
  if (o.dang) g.add(box(w + over * 2 + 0.01, 0.03, 0.016, M.eaveBand, 0, 0.008, eaveF + 0.03));
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
  /* 正脊 + 金脊段 + 鸱吻 + 宝顶 */
  g.add(box(w * 0.44, 0.055, 0.085, M.roofJoint, 0, h + 0.028, 0));
  if (o.segs) for (i = 0; i < o.segs; i++) {
    g.add(box(0.07, 0.026, 0.095, M.gilt, (i - (o.segs - 1) / 2) * w * 0.13, h + 0.068, 0));
  }
  if (o.chiwen) {
    g.add(box(w * 0.46, 0.018, 0.06, M.gilt, 0, h + 0.062, 0));
    var cwS = o.cwS || 0.8;
    put(g, chiwen(M, o.big ? 1.05 : cwS, false), w * 0.23, h + 0.026, 0);
    put(g, chiwen(M, o.big ? 1.05 : cwS, true), -w * 0.23, h + 0.026, 0);
  }
  if (o.finial) put(g, flameFinial(M, 1.0), 0, h + 0.06, 0);
  return g;
}

/* 草坪石板地坪：草面 + 深草沿 + 前径石板 + 岩石灌丛 + 花点（参考图绿缘） */
function padUnit(M, size, depth, flowers) {
  var g = grp(); g.name = 'pad-terrain';
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  g.add(box(0.5, 0.014, 0.56, M.pave, 0, 0.056, d / 2 - 0.33));
  var rock = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, rock, size / 2 - 0.3, 0.065, -d / 2 + 0.32);
  var bush = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.grassD); put(g, bush, -size / 2 + 0.28, 0.11, d / 2 - 0.3);
  bush.scale.y = 0.8;
  if (flowers) {
    [[size * 0.38, d / 2 - 0.12, M.lacqBr], [-size * 0.38, d / 2 - 0.12, M.giltBr], [size * 0.3, d / 2 - 0.32, M.paper]].forEach(function (f) {
      g.add(sph(0.02, f[2], f[0], 0.062, f[1]));
    });
  }
  return g;
}

/* 货担（lv1/2）：条板货箱 + 陶罐 */
function goodsProps(M) {
  var g = grp(); g.name = 'goods';
  g.add(box(0.24, 0.11, 0.15, M.timberBr, 0, 0.055, 0));
  g.add(box(0.26, 0.02, 0.17, M.timber, 0, 0.115, 0));
  g.add(box(0.18, 0.09, 0.13, M.timberBr, 0.28, 0.045, 0.02));
  g.add(cyl(0.055, 0.07, 0.12, 12, M.panelSd, -0.28, 0.06, 0.02));
  g.add(cyl(0.04, 0.05, 0.02, 12, M.stoneD, -0.28, 0.13, 0.02));
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：金棕木瓦小屋 + 披屋 + 柴堆 + 脊上鸟饰 + 金头灯柱（h≈1.05） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.3, true));
  /* 石板台基 + 前踏 */
  var podium = grp(); podium.name = 'podium-terrace'; g.add(podium);
  podium.add(box(1.34, 0.09, 1.0, M.stoneD, -0.05, 0.045, -0.04));
  podium.add(box(0.44, 0.05, 0.2, M.stoneD, -0.28, 0.1, 0.48));
  /* 木构屋身：角柱 + 横板壁 + 门洞门框 + 格窗 + 右侧披屋 + 柴堆 */
  var hall = grp(); hall.name = 'hall-body'; g.add(hall);
  hall.add(box(1.1, 0.5, 0.86, M.plank, -0.05, 0.34, -0.04));
  hall.add(box(1.16, 0.05, 0.9, M.timber, -0.05, 0.615, -0.04));
  [[-0.58, -0.44], [0.48, -0.44], [-0.58, 0.36], [0.48, 0.36]].forEach(function (c) {
    hall.add(box(0.055, 0.56, 0.055, M.timber, c[0], 0.32, c[1]));
  });
  hall.add(box(0.3, 0.4, 0.06, M.ink, -0.3, 0.29, 0.4));
  hall.add(box(0.032, 0.44, 0.05, M.timber, -0.465, 0.31, 0.41));     /* 门框柱 */
  hall.add(box(0.032, 0.44, 0.05, M.timber, -0.135, 0.31, 0.41));
  hall.add(box(0.36, 0.04, 0.07, M.timber, -0.3, 0.525, 0.41));       /* 门楣 */
  hall.add(box(0.34, 0.02, 0.09, M.stoneD, -0.3, 0.1, 0.43));         /* 门槛石 */
  var win = latticeWindow(M, 0.22, 0.22, { rows: 2, cols: 2 }); put(hall, win, 0.18, 0.4, 0.4);
  hall.add(box(0.44, 0.3, 0.6, M.plank, 0.82, 0.195, -0.02));
  var lean = box(0.5, 0.024, 0.68, M.shingle, 0.84, 0.4, -0.02);
  lean.rotation.z = -0.16; hall.add(lean);
  hall.add(box(0.04, 0.42, 0.04, M.timber, 1.06, 0.25, 0.3));
  /* 柴堆（参考图墙边柴薪；圆木横卧沿 X，落于草面、台基之外） */
  var lg1 = cyl(0.026, 0.026, 0.3, 12, M.timberBr, -0.88, 0.076, 0.26); lg1.rotation.z = PI / 2; hall.add(lg1);
  var lg2 = cyl(0.026, 0.026, 0.3, 12, M.timber, -0.88, 0.076, 0.312); lg2.rotation.z = PI / 2; hall.add(lg2);
  var lg3 = cyl(0.026, 0.026, 0.3, 12, M.timberBr, -0.88, 0.122, 0.286); lg3.rotation.z = PI / 2; hall.add(lg3);
  /* 屋顶系统：木瓦双坡顶（密排压条 + 椽头 + 圆脊杆）apex≈1.0 */
  var roof = grp(); roof.name = 'roof-system'; g.add(roof);
  var shing = shingleRoof(M, { w: 1.02, d: 0.88, h: 0.3, over: 0.12 });
  put(roof, shing, -0.05, 0.66, -0.04);
  /* 脊上鸟饰（参考图右坡顶小鸟） */
  var bird = grp(); bird.name = 'ridge-bird'; put(roof, bird, 0.38, 0.99, -0.04);
  var bb = sph(0.03, M.timberBr, 0, 0.02, 0); bb.scale.set(1.25, 0.85, 0.85); bird.add(bb);
  var bt = box(0.07, 0.018, 0.03, M.timberBr, -0.045, 0.03, 0); bt.rotation.z = 0.45; bird.add(bt);
  bird.add(sph(0.017, M.timberBr, 0.036, 0.045, 0));
  var bk = cone(0.006, 0.018, 8, M.giltDk, 0.055, 0.045, 0); bk.rotation.z = -PI / 2; bird.add(bk);
  /* 前场：金头灯柱（每阶必有）+ 货担 + 水缸 */
  var fore = grp(); fore.name = 'forecourt-stage'; g.add(fore);
  var lamp = lampPost(M, 0.62, {}); put(fore, lamp, -0.98, 0.05, 0.52);
  var goods = goodsProps(M); put(fore, goods, 0.42, 0.06, 0.55);
  fore.add(cyl(0.07, 0.085, 0.14, 12, M.stoneD, -0.85, 0.12, -0.35));
  /* 动画：灯珠呼吸 + 纸窗呼吸 */
  var lg = M.lampGlow, pm = M.paper;
  anims.push(function (t) { lg.emissiveIntensity = 0.62 + 0.18 * sin(t * 1.6 + 0.4); });
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1); });
  return g;
}
/* ---- lv2 洋房：横向两开间（瓦顶正堂 + 红布篷铺面披屋）+ 金饰鸱吻 + 檐下斗拱初现（h≈1.48） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3, true));
  /* 石台基 + 双级踏步 */
  var podium = grp(); podium.name = 'podium-terrace'; g.add(podium);
  podium.add(box(1.9, 0.12, 1.06, M.stone, -0.12, 0.06, -0.06));
  podium.add(box(0.62, 0.06, 0.18, M.stoneD, -0.42, 0.15, 0.56));
  podium.add(box(0.5, 0.05, 0.15, M.stoneD, -0.42, 0.2, 0.68));
  /* 正堂：奶白板壁红框（两开间横墙）+ 四朱柱 + 门脸 + 格窗 + 斗拱 + 红布篷 + 柜台 + 披屋 */
  var hall = grp(); hall.name = 'hall-body'; g.add(hall);
  hall.add(box(1.66, 0.66, 0.94, M.plaster, -0.12, 0.45, -0.06));
  hall.add(box(1.72, 0.05, 0.98, M.lacqDk, -0.12, 0.8, -0.06));
  var cols = grp(); cols.name = 'hall-colonnade'; hall.add(cols);
  [[-0.88, -0.48], [0.64, -0.48], [-0.88, 0.4], [0.64, 0.4]].forEach(function (c) {
    var col = column(M, 0.62, 0.03); put(cols, col, c[0], 0.12, c[1]);
  });
  var door = doorBay(M, 0.3, 0.4, 0.12, false); put(hall, door, -0.52, 0, 0.43);
  var plq = plaqueH(M, 0.44, 0.12); put(hall, plq, -0.52, 0.62, 0.44);
  var w1 = latticeWindow(M, 0.3, 0.3, { rows: 2, cols: 2 }); put(hall, w1, 0.34, 0.5, 0.43);
  var dg = dougongBand(M, 1.56, 5); put(hall, dg, -0.12, 0.755, 0.44);       /* 斗拱初现 */
  var awn = awningUnit(M, 0.92); put(hall, awn, 0.02, 0.58, 0.48);
  hall.add(cyl(0.011, 0.011, 0.5, 12, M.timber, -0.36, 0.31, 0.655));        /* 篷柱 */
  hall.add(cyl(0.011, 0.011, 0.5, 12, M.timber, 0.4, 0.31, 0.655));
  hall.add(box(0.62, 0.34, 0.07, M.ink, 0.06, 0.29, 0.47));
  hall.add(box(0.66, 0.05, 0.17, M.timber, 0.06, 0.26, 0.56));
  var goods = goodsProps(M); put(hall, goods, 0.52, 0.12, 0.6);
  hall.add(cyl(0.07, 0.055, 0.1, 12, M.timberBr, -0.86, 0.17, 0.5));         /* 竹筐 */
  hall.add(cyl(0.075, 0.075, 0.014, 12, M.timber, -0.86, 0.225, 0.5));
  hall.add(box(0.5, 0.4, 0.7, M.plaster, 0.95, 0.32, -0.12));
  hall.add(cyl(0.08, 0.095, 0.16, 12, M.panelSd, 1.04, 0.1, 0.4));
  /* 屋顶系统：主瓦顶（逐垄筒瓦 + 瓦当带 + 双段鸱吻）+ 披屋小悬山 */
  var roof = grp(); roof.name = 'roof-system'; g.add(roof);
  var main = tileHipTier(M, { w: 1.56, d: 1.06, h: 0.42, strips: 3, ribs: 8, dang: true, chiwen: true, cwS: 0.9, trim: true, tips: true });
  put(roof, main, -0.12, 0.82, -0.06);
  var shed = tileHipTier(M, { w: 0.44, d: 0.66, h: 0.16, over: 0.07, ribs: 4, dang: true });
  put(roof, shed, 0.95, 0.52, -0.12);
  /* 前场：檐角金灯笼 ×2（挂环摆动）+ 灯柱 ×1 */
  var fore = grp(); fore.name = 'forecourt-stage'; g.add(fore);
  var sw1 = hangLantern(fore, M, -0.86, 0.86, 0.56, 0.9, 0.09);
  var sw2 = hangLantern(fore, M, 0.6, 0.86, 0.56, 0.9, 0.13);
  var lamp = lampPost(M, 0.88, {}); put(fore, lamp, -1.08, 0.05, 0.58);
  /* 动画：灯笼摆 + 灯珠/笼身/纸窗呼吸 */
  var lg = M.lampGlow, pm = M.paper, nt = M.lantGlow;
  anims.push(function (t) {
    sw1.rotation.z = sin(t * 1.3 + 0.9) * 0.06;
    sw2.rotation.z = sin(t * 1.3 + 2.4) * 0.06;
  });
  anims.push(function (t) { lg.emissiveIntensity = 0.62 + 0.16 * sin(t * 1.5 + 0.8); });
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.05 + 0.3); });
  anims.push(function (t) { nt.emissiveIntensity = 0.5 + 0.14 * sin(t * 1.7 + 0.3); });
  return g;
}
/* ---- lv3 大厦：三重檐楼阁 + 斗拱带 + 檐角金灯笼串 + 红毯踏步 + 双层平座栏杆（h≈2.26） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.4, false));
  /* 石台基 + 踏步 + 红毯（沿踏步分段）+ 前场石板 */
  var podium = grp(); podium.name = 'podium-terrace'; g.add(podium);
  podium.add(box(2.0, 0.14, 1.3, M.stone, 0, 0.07, -0.08));
  podium.add(box(0.66, 0.055, 0.2, M.stoneD, 0, 0.17, 0.62));
  podium.add(box(0.56, 0.05, 0.17, M.stoneD, 0, 0.225, 0.76));
  podium.add(box(0.34, 0.012, 0.18, M.carpet, 0, 0.2055, 0.62));
  podium.add(box(0.34, 0.012, 0.15, M.carpet, 0, 0.258, 0.76));
  podium.add(box(0.34, 0.012, 0.26, M.carpet, 0, 0.074, 0.95));
  g.add(box(1.9, 0.012, 0.5, M.pave, 0, 0.058, 0.88));                       /* 前场石板 */
  /* 楼身三层 + 柱列 + 门脸 + 格窗 + 双层红栏杆 + 金圆徽 + 斗拱 */
  var hall = grp(); hall.name = 'hall-body'; g.add(hall);
  hall.add(box(1.58, 0.56, 0.94, M.plaster, 0, 0.42, -0.05));
  hall.add(box(1.64, 0.045, 0.98, M.lacqDk, 0, 0.72, -0.05));
  var cols = grp(); cols.name = 'hall-colonnade'; hall.add(cols);
  [[-0.72, -0.44], [0.72, -0.44], [-0.72, 0.4], [0.72, 0.4]].forEach(function (c) {
    var col = column(M, 0.54, 0.03); put(cols, col, c[0], 0.14, c[1]);
  });
  var door = doorBay(M, 0.32, 0.42, 0.14, true); put(hall, door, 0, 0, 0.44);
  var wf1 = latticeWindow(M, 0.26, 0.26, { rows: 2, cols: 2 }); put(hall, wf1, -0.5, 0.46, 0.43);
  var wf2 = latticeWindow(M, 0.26, 0.26, { rows: 2, cols: 2 }); put(hall, wf2, 0.5, 0.46, 0.43);
  var dg1 = dougongBand(M, 1.6, 6); put(hall, dg1, 0, 0.72, 0.37);
  hall.add(box(1.3, 0.44, 0.82, M.lacq, 0, 1.1, -0.06));
  hall.add(box(1.14, 0.26, 0.03, M.plaster, 0, 1.1, 0.36));
  hall.add(box(0.94, 0.03, 0.03, M.lacqDk, 0, 1.21, 0.38));
  var balc = grp(); balc.name = 'balcony-band'; hall.add(balc);
  balc.position.set(0, 0.92, 0.4);
  balc.add(box(1.06, 0.028, 0.06, M.lacqDk, 0, 0, 0));
  balc.add(box(1.06, 0.02, 0.03, M.lacq, 0, 0.09, 0.02));
  for (var bi = 0; bi < 9; bi++) balc.add(box(0.018, 0.08, 0.016, M.lacq, -0.48 + bi * 0.12, 0.05, 0.015));
  var balc2 = grp(); balc2.name = 'balcony-band-2'; hall.add(balc2);         /* 二层平座栏杆 */
  balc2.position.set(0, 1.475, 0.415);
  balc2.add(box(0.94, 0.026, 0.05, M.lacqDk, 0, 0, 0));
  balc2.add(box(0.94, 0.018, 0.026, M.lacq, 0, 0.08, 0.016));
  for (bi = 0; bi < 8; bi++) balc2.add(box(0.016, 0.07, 0.014, M.lacq, -0.42 + bi * 0.12, 0.042, 0.012));
  var dg2 = dougongBand(M, 1.34, 6); put(hall, dg2, 0, 1.345, 0.36);
  var rd1 = roundel(M, 0.075); rd1.name = 'roundel'; put(hall, rd1, 0, 1.14, 0.385);
  hall.add(box(1.04, 0.34, 0.72, M.lacqBr, 0, 1.65, -0.06));
  hall.add(box(0.86, 0.2, 0.03, M.plaster, 0, 1.66, 0.31));
  var wt1 = latticeWindow(M, 0.18, 0.16, { rows: 1, cols: 2 }); put(hall, wt1, -0.2, 1.66, 0.33);
  var wt2 = latticeWindow(M, 0.18, 0.16, { rows: 1, cols: 2 }); put(hall, wt2, 0.2, 1.66, 0.33);
  var rd2 = roundel(M, 0.06); rd2.name = 'roundel-2'; put(hall, rd2, 0, 1.73, 0.315);
  /* 屋顶系统：三层檐（逐垄筒瓦 + 瓦当带；顶檐鸱吻+金脊段）+ 檐角灯笼串 */
  var roof = grp(); roof.name = 'roof-system'; g.add(roof);
  var e1 = tileHipTier(M, { w: 1.72, d: 1.14, h: 0.18, strips: 2, ribs: 7, dang: true, trim: true });
  put(roof, e1, 0, 0.79, -0.05);
  var e2 = tileHipTier(M, { w: 1.46, d: 1.0, h: 0.16, strips: 2, ribs: 6, dang: true, trim: true });
  put(roof, e2, 0, 1.5, -0.06);
  var e3 = tileHipTier(M, { w: 1.18, d: 0.86, h: 0.28, strips: 3, ribs: 6, dang: true, chiwen: true, cwS: 0.75, trim: true, tips: true, segs: 3 });
  put(roof, e3, 0, 1.78, -0.06);
  var sws = [];
  [[-0.94, 0.82, 0.6, 0.09], [0.94, 0.82, 0.6, 0.13], [-0.8, 1.53, 0.52, 0.08], [0.8, 1.53, 0.52, 0.12]].forEach(function (p, i) {
    var sw = hangLantern(roof, M, p[0], p[1], p[2], 0.82, p[3]);
    sws.push({ g: sw, ph: i * 1.3 });
  });
  /* 前场：灯柱 ×2 + 对称盆栽 */
  var fore = grp(); fore.name = 'forecourt-stage'; g.add(fore);
  var lampL = lampPost(M, 1.05, {}); put(fore, lampL, -1.06, 0.05, 0.62);
  var lampR = lampPost(M, 1.05, {}); put(fore, lampR, 1.06, 0.05, 0.62);
  [[-0.72], [0.72]].forEach(function (c) {                                   /* 盆栽落于石板（修复 v1 悬空） */
    fore.add(cyl(0.055, 0.07, 0.1, 12, M.stoneD, c[0], 0.11, 0.85));
    var b = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(fore, b, c[0], 0.2, 0.85); b.scale.y = 0.85;
  });
  /* 动画：灯笼串摆 + 灯珠/笼身/纸窗呼吸 */
  var lg = M.lampGlow, pm = M.paper, nt = M.lantGlow;
  anims.push(function (t) {
    for (var i = 0; i < sws.length; i++) sws[i].g.rotation.z = sin(t * 1.35 + sws[i].ph) * 0.055;
  });
  anims.push(function (t) { lg.emissiveIntensity = 0.62 + 0.16 * sin(t * 1.5 + 1.2); });
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.1 + 0.5); });
  anims.push(function (t) { nt.emissiveIntensity = 0.5 + 0.14 * sin(t * 1.7 + 0.9); });
  return g;
}
/* ---- lv4 地标：重檐宫殿楼阁 + 火焰宝顶 + 朱门垂幔 + 金凤仪仗 + 灯柱石板广场（h≈2.73） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.45, false));
  /* 高石台基（双层收边）+ 三级踏步 + 红毯沿踏步分段落地（修复 v1 悬空）*/
  var podium = grp(); podium.name = 'podium-terrace'; g.add(podium);
  podium.add(box(2.16, 0.05, 1.62, M.stoneD, 0, 0.025, -0.04));
  podium.add(box(2.06, 0.21, 1.54, M.stone, 0, 0.155, -0.04));
  podium.add(box(2.12, 0.035, 1.58, M.stoneBr, 0, 0.26, -0.04));
  podium.add(box(0.72, 0.06, 0.22, M.stoneD, 0, 0.29, 0.74));
  podium.add(box(0.62, 0.055, 0.2, M.stoneD, 0, 0.35, 0.9));
  podium.add(box(0.52, 0.05, 0.18, M.stoneD, 0, 0.4, 1.04));
  podium.add(box(0.44, 0.012, 0.5, M.carpet, 0, 0.2855, 0.4));
  podium.add(box(0.44, 0.012, 0.2, M.carpet, 0, 0.328, 0.74));
  podium.add(box(0.44, 0.012, 0.18, M.carpet, 0, 0.3855, 0.9));
  podium.add(box(0.44, 0.012, 0.16, M.carpet, 0, 0.433, 1.04));
  podium.add(box(0.44, 0.01, 0.2, M.carpet, 0, 0.062, 1.1));
  g.add(box(2.2, 0.012, 0.44, M.pave, 0, 0.058, 0.86));                      /* 石板广场 */
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
  var wl = latticeWindow(M, 0.24, 0.22, { rows: 2, cols: 2 }); put(hall, wl, -0.32, 1.68, 0.39);
  var wr = latticeWindow(M, 0.24, 0.22, { rows: 2, cols: 2 }); put(hall, wr, 0.32, 1.68, 0.39);
  var rd = roundel(M, 0.085); rd.name = 'roundel'; put(hall, rd, 0, 1.72, 0.385);
  var balc = grp(); balc.name = 'balcony-band'; hall.add(balc);
  balc.position.set(0, 1.4, 0.4);
  balc.add(box(1.34, 0.03, 0.07, M.lacqDk, 0, 0, 0));
  balc.add(box(1.34, 0.022, 0.032, M.lacq, 0, 0.1, 0.02));
  for (var bi = 0; bi < 8; bi++) balc.add(box(0.018, 0.09, 0.016, M.lacq, -0.6 + bi * 0.17, 0.055, 0.018));
  [[-0.62, 0.34], [0.62, 0.34]].forEach(function (c) {
    var col = column(M, 0.56, 0.03, true); put(cols, col, c[0], 1.36, c[1]);
  });
  var dg2 = dougongBand(M, 1.46, 6); put(hall, dg2, 0, 2.0, 0.3);
  /* 屋顶系统：重檐（逐垄筒瓦 + 瓦当带 + 腰檐）+ 鸱吻 + 火焰宝顶 + 檐角灯笼串 */
  var roof = grp(); roof.name = 'roof-system'; g.add(roof);
  var e1 = tileHipTier(M, { w: 2.0, d: 1.34, h: 0.3, strips: 3, ribs: 9, dang: true, chiwen: true, cwS: 0.85, trim: true });
  put(roof, e1, 0, 1.06, -0.08);
  var e2 = tileHipTier(M, { w: 1.64, d: 1.14, h: 0.44, strips: 3, ribs: 8, dang: true, chiwen: true, big: true, trim: true, tips: true, segs: 3, finial: true });
  put(roof, e2, 0, 2.02, -0.08);
  var sws = [];
  [[-0.62, 1.05, 0.5, 0.1, 1.05], [0.62, 1.05, 0.5, 0.12, 1.05],
   [-1.06, 1.09, 0.66, 0.09, 0.8], [1.06, 1.09, 0.66, 0.13, 0.8],
   [-0.88, 2.05, 0.56, 0.08, 0.8], [0.88, 2.05, 0.56, 0.11, 0.8]].forEach(function (p, i) {
    var sw = hangLantern(roof, M, p[0], p[1], p[2], p[4], p[3]);
    sws.push({ g: sw, ph: i * 1.1 });
  });
  /* 前场广场：朱柱金灯石础一对 + 金凤凰仪仗一对（落地石础，修复 v1 悬空）+ 金锣架 + 盆栽 */
  var fore = grp(); fore.name = 'forecourt-stage'; g.add(fore);
  var lampL = lampPost(M, 0.6, { red: true, pedestal: true }); put(fore, lampL, -0.95, 0.05, 0.86);
  var lampR = lampPost(M, 0.6, { red: true, pedestal: true }); put(fore, lampR, 0.95, 0.05, 0.86);
  var phL = grp(); phL.name = 'statue-pedestal'; put(fore, phL, -1.1, 0.05, 0.55);
  phL.add(box(0.18, 0.2, 0.18, M.stoneD, 0, 0.1, 0));
  put(phL, phoenixStatue(M, 1.15), 0, 0.2, 0);
  var phR = grp(); phR.name = 'statue-pedestal'; put(fore, phR, 1.1, 0.05, 0.55);
  phR.add(box(0.18, 0.2, 0.18, M.stoneD, 0, 0.1, 0));
  put(phR, phoenixStatue(M, 1.15), 0, 0.2, 0);
  var gong = grp(); gong.name = 'gong-stand'; put(fore, gong, 0.86, 0.2775, 0.12);
  gong.add(cyl(0.013, 0.013, 0.34, 12, M.timberBr, -0.08, 0.17, 0));
  gong.add(cyl(0.013, 0.013, 0.34, 12, M.timberBr, 0.08, 0.17, 0));
  gong.add(box(0.22, 0.03, 0.03, M.lacqDk, 0, 0.345, 0));
  var disc = cyl(0.085, 0.085, 0.012, 16, M.giltDk, 0, 0.24, 0.012); disc.rotation.x = PI / 2; gong.add(disc);
  gong.add(sph(0.018, M.gilt, 0, 0.24, 0.024));
  [[-0.78], [0.78]].forEach(function (c) {                                   /* 盆栽落于石板广场（修复 v1 悬空） */
    fore.add(cyl(0.055, 0.07, 0.1, 12, M.stoneD, c[0], 0.11, 0.95));
    var b = mesh(new THREE.IcosahedronGeometry(0.065, 0), M.grassD); put(fore, b, c[0], 0.196, 0.95); b.scale.y = 0.85;
  });
  /* 动画：灯笼串摆 + 灯珠/笼身/纸窗呼吸 */
  var lg = M.lampGlow, pm = M.paper, nt = M.lantGlow;
  anims.push(function (t) {
    for (var i = 0; i < sws.length; i++) sws[i].g.rotation.z = sin(t * 1.25 + sws[i].ph) * 0.05;
  });
  anims.push(function (t) { lg.emissiveIntensity = 0.62 + 0.16 * sin(t * 1.5 + 1.6); });
  anims.push(function (t) { pm.emissiveIntensity = 0.16 + 0.06 * sin(t * 1.05 + 0.9); });
  anims.push(function (t) { nt.emissiveIntensity = 0.5 + 0.14 * sin(t * 1.7 + 1.3); });
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
