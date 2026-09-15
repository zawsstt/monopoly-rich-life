/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 11 电力公司（tile11_power.js）· 现代光伏发电站
 * -------------------------------------------------------------------------------------
 * 参考图 refs/ref_utility_power_2.png：等轴低多边形现代光伏电站
 *   地台      ：浅灰混凝土矩形平台 + 满铺绿色草坪 + 白色围栏（立柱/双横杆/网格片）+ 前侧大门
 *   光伏阵列  ：3 排深蓝电池板（板面格线纹理+天空反光），白框 + 白立柱 + 混凝土基脚，
 *               倾斜 32° 朝向观众，高边 ~1.56（立体感来源）
 *   控制楼    ：白色平顶楼体 + 蓝玻幕墙前厅（竖梃分格含门）+ 蓝色檐口带 + 平顶空调机组
 *               （含旋转风扇）+ 天线杆 + 状态灯
 *   变压器组  ：翅片式主变（深色顶盖+套管×3）+ 白色柜体 ×2，混凝土台座
 *   道路      ：灰色沥青路面从大门直通控制楼前（带白色边线）
 *   绿化      ：圆冠树 ×4 + 灌木 ×4 + 电缆槽盒/导管
 *
 *   window.Special3D[11]() → THREE.Group（原点=格心，底面 y=0，正面朝 +Z）
 *   每次调用全新实例（材质不共享可变状态）
 *
 * 动画：1) 屋顶风扇旋转  2) 板面反光呼吸（emissive 微幅）  3) 状态灯呼吸
 * 技术约束：经典 script；THREE r147；MeshStandardMaterial；Canvas ≤256px；mesh ≤40；
 *           占地 ≤2.7×2.7；底面 y=0；零 Math.random（固定值布局）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[tile11_power] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

var PI = Math.PI, sin = Math.sin, cos = Math.cos;

/* ================= 0. 工具 ================= */
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(o.map ? (o.tint || '#ffffff') : hex),
    roughness: (o.rough !== undefined ? o.rough : 0.85),
    metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
  if (o.map) { m.map = o.map; m.userData.previewColor = hex; }
  return m;
}
function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function grp() { return new THREE.Group(); }
/* 手写合并（r147 无 BufferGeometryUtils）：转非索引后拼接 position/normal/uv */
function mergeGeos(list) {
  var pos = [], nrm = [], uv = [], i, j, g, g2, p, n, u;
  for (i = 0; i < list.length; i++) {
    g = list[i]; g2 = g.index ? g.toNonIndexed() : g;
    p = g2.attributes.position.array;
    n = g2.attributes.normal ? g2.attributes.normal.array : null;
    u = g2.attributes.uv ? g2.attributes.uv.array : null;
    for (j = 0; j < p.length; j++) pos.push(p[j]);
    if (n) { for (j = 0; j < n.length; j++) nrm.push(n[j]); } else { for (j = 0; j < p.length; j++) nrm.push(0); }
    if (u) { for (j = 0; j < u.length; j++) uv.push(u[j]); } else { for (j = 0; j < p.length / 3 * 2; j++) uv.push(0); }
  }
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return out;
}
function tbox(w, h, d, x, y, z) { return new THREE.BoxGeometry(w, h, d).translate(x, y, z); }
function tcyl(rt, rb, h, seg, x, y, z) { return new THREE.CylinderGeometry(rt, rb, h, seg).translate(x, y, z); }
function tsph(r, x, y, z) { return new THREE.SphereGeometry(r, 16, 12).translate(x, y, z); }

/* ================= 1. Canvas 纹理（≤256px，确定性绘制） ================= */
function canvasTex(w, h, draw, rx, ry) {
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  var g = cv.getContext('2d'); draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (rx || ry) tex.repeat.set(rx || 1, ry || 1);
  return tex;
}
/* 光伏板面：深蓝 + 天空反光带 + 电池格线 + 斜向高光 */
function texPanel() {
  return canvasTex(256, 256, function (g, w, h) {
    var i, j, x, y;
    g.fillStyle = '#183a88'; g.fillRect(0, 0, w, h);
    for (i = 0; i < 8; i++) {                                       /* 顶部天空反光渐变带 */
      g.fillStyle = 'rgba(120,170,255,' + (0.16 * (1 - i / 8)).toFixed(3) + ')';
      g.fillRect(0, i * 8, w, 8);
    }
    for (i = 0; i < 4; i++) {                                       /* 底部微暗带 */
      g.fillStyle = 'rgba(8,20,60,' + (0.10 * (i + 1) / 4).toFixed(3) + ')';
      g.fillRect(0, h - (i + 1) * 12, w, 12);
    }
    var cw = 32, ch = 42;                                           /* 8×6 电池格 */
    g.strokeStyle = 'rgba(232,240,255,0.92)'; g.lineWidth = 3;
    for (i = 0; i <= 8; i++) { x = i * cw; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (j = 0; j <= 6; j++) { y = j * ch; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.14)'; g.lineWidth = 1;      /* 格内左上高光 */
    for (i = 0; i < 8; i++) for (j = 0; j < 6; j++) g.strokeRect(i * cw + 3.5, j * ch + 3.5, cw - 7, ch - 7);
    g.strokeStyle = 'rgba(205,228,255,0.10)'; g.lineWidth = 26;     /* 斜向高光 */
    g.beginPath(); g.moveTo(-30, 200); g.lineTo(150, -30); g.stroke();
    g.beginPath(); g.moveTo(90, 300); g.lineTo(300, 60); g.stroke();
  }, 3, 1);
}
/* 玻璃幕墙：蓝天渐变 + 白竖梃 + 横梃 + 门 */
function texGlass() {
  return canvasTex(128, 128, function (g, w, h) {
    var i, t, r, gc, b;
    for (i = 0; i < h; i++) {                                       /* 垂直渐变 */
      t = i / h; r = 184 - 110 * t; gc = 220 - 96 * t; b = 242 - 56 * t;
      g.fillStyle = 'rgb(' + (r | 0) + ',' + (gc | 0) + ',' + (b | 0) + ')';
      g.fillRect(0, i, w, 1);
    }
    g.strokeStyle = 'rgba(255,255,255,0.18)'; g.lineWidth = 9;      /* 斜向反射 */
    g.beginPath(); g.moveTo(-10, 96); g.lineTo(70, -12); g.stroke();
    g.beginPath(); g.moveTo(40, 140); g.lineTo(140, 10); g.stroke();
    g.fillStyle = 'rgba(28,66,120,0.62)';                           /* 门（右格） */
    g.fillRect(94, 36, 30, 92);
    g.strokeStyle = '#eef4f8'; g.lineWidth = 3; g.strokeRect(95.5, 37.5, 27, 89);
    g.fillStyle = '#dfe8ee'; g.fillRect(99, 78, 3, 14);             /* 门把手 */
    g.fillStyle = '#f2f7fa';                                        /* 竖梃 ×5 + 横梃 */
    for (i = 0; i <= 4; i++) g.fillRect(i * 32 - 2, 0, 5, h);
    g.fillRect(0, 60, w, 5); g.fillRect(0, 0, w, 4); g.fillRect(0, h - 3, w, 3);
  });
}
/* 沥青路面：中灰 + 碎点 + 白边线 */
function texAsphalt() {
  return canvasTex(128, 128, function (g, w, h) {
    var i;
    g.fillStyle = '#a7adb4'; g.fillRect(0, 0, w, h);
    for (i = 0; i < 70; i++) {
      g.fillStyle = (i % 2) ? 'rgba(70,76,84,0.22)' : 'rgba(230,234,238,0.20)';
      g.fillRect((i * 37 + 13) % w, (i * 53 + 7) % h, 2, 2);
    }
    g.fillStyle = 'rgba(244,246,248,0.78)';
    g.fillRect(3, 0, 3, h); g.fillRect(w - 6, 0, 3, h);
  }, 1, 4);
}
/* 变压器翅片：白底竖肋 */
function texFin() {
  return canvasTex(128, 128, function (g, w, h) {
    var i;
    g.fillStyle = '#edf0f3'; g.fillRect(0, 0, w, h);
    for (i = 0; i < 8; i++) {
      g.fillStyle = '#f9fbfc'; g.fillRect(i * 16 + 2, 0, 2, h);
      g.fillStyle = '#c7ced5'; g.fillRect(i * 16 + 4, 0, 8, h);
      g.fillStyle = '#aeb6be'; g.fillRect(i * 16 + 12, 0, 2, h);
    }
    g.fillStyle = '#8f979f';
    for (i = 0; i < 8; i++) { g.fillRect(i * 16 + 6, 6, 4, 4); g.fillRect(i * 16 + 6, h - 10, 4, 4); }
  }, 2, 1);
}
/* 混凝土地台：浅灰 + 分缝 + 微噪 */
function texConcrete() {
  return canvasTex(128, 128, function (g, w, h) {
    g.fillStyle = '#c9cdd1'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,126,132,0.5)'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(64, 0); g.lineTo(64, h); g.stroke();
    g.beginPath(); g.moveTo(0, 64); g.lineTo(w, 64); g.stroke();
    var i;
    for (i = 0; i < 40; i++) { g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.12)' : 'rgba(90,96,102,0.10)'; g.fillRect((i * 29) % w, (i * 47) % h, 3, 2); }
  }, 6, 6);
}
/* 草坪：绿 + 割草条纹 */
function texLawn() {
  return canvasTex(64, 64, function (g, w, h) {
    var i;
    for (i = 0; i < 4; i++) { g.fillStyle = (i % 2) ? '#7cb043' : '#8cc050'; g.fillRect(0, i * 16, w, 16); }
    for (i = 0; i < 30; i++) { g.fillStyle = 'rgba(40,90,20,0.18)'; g.fillRect((i * 23) % w, (i * 41) % h, 1, 3); }
  }, 5, 5);
}
/* 围栏网片：浅灰网格 */
function texFenceMesh() {
  return canvasTex(64, 64, function (g, w, h) {
    var i;
    g.fillStyle = '#eef1f3'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#b6bfc7'; g.lineWidth = 2;
    for (i = 0; i <= 8; i++) {
      g.beginPath(); g.moveTo(i * 8, 0); g.lineTo(i * 8, h); g.stroke();
      g.beginPath(); g.moveTo(0, i * 8); g.lineTo(w, i * 8); g.stroke();
    }
    g.strokeStyle = 'rgba(90,100,110,0.25)'; g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, w - 1, h - 1);
  }, 2, 1);
}

/* ================= 2. 工厂 ================= */
window.Special3D = window.Special3D || {};
window.Special3D[11] = function () {
  var g = grp();
  g.name = 'special_11_power_solar';

  var M = {
    slab:   std('#c9cdd1', { rough: 0.92, map: texConcrete() }),
    lawn:   std('#7cb043', { rough: 0.95, map: texLawn() }),
    road:   std('#a7adb4', { rough: 0.9, map: texAsphalt() }),
    panel:  std('#ffffff', { rough: 0.30, metal: 0.35, map: texPanel(), tint: '#ffffff',
                             emissive: '#4a80e8', ei: 0.05 }),
    white:  std('#f2f3f0', { rough: 0.6 }),
    concD:  std('#b8bdc2', { rough: 0.9 }),
    glass:  std('#ffffff', { rough: 0.12, metal: 0.55, map: texGlass() }),
    dglass: std('#8fb9dd', { rough: 0.15, metal: 0.5 }),
    trim:   std('#2a6fd1', { rough: 0.5 }),
    hvac:   std('#dfe3e6', { rough: 0.6, metal: 0.15 }),
    fan:    std('#4a5a66', { rough: 0.5, metal: 0.4 }),
    steel:  std('#9aa4ac', { rough: 0.4, metal: 0.7 }),
    fin:    std('#ffffff', { rough: 0.55, map: texFin(), tint: '#ffffff' }),
    dark:   std('#37474f', { rough: 0.6, metal: 0.3 }),
    cabW:   std('#eef1f3', { rough: 0.6 }),
    fence:  std('#f0f2f4', { rough: 0.55, metal: 0.1 }),
    fmesh:  std('#ffffff', { rough: 0.7, map: texFenceMesh(), tint: '#ffffff' }),
    trunk:  std('#6b4a2a', { rough: 0.9 }),
    crown:  std('#5e9b3a', { rough: 0.9 }),
    crown2: std('#72b048', { rough: 0.9 }),
    bush:   std('#68a63e', { rough: 0.9 }),
    cable:  std('#4a5056', { rough: 0.7, metal: 0.2 })
  };
  var lampM = std('#2ecc71', { rough: 0.4, emissive: '#2ecc71', ei: 0.7 });

  var L = {
    panel: [], white: [], concD: [], bldg: [], trim: [], dglass: [], hvac: [],
    dark: [], cabW: [], fin: [], steel: [], fenceW: [], fenceM: [], trunk: [],
    crown: [], crown2: [], bush: [], cable: []
  };
  var GR = 0.08;                                                    /* 草坪顶面 */

  /* ========== 地台 + 草坪 + 沥青道路/楼前铺装 ========== */
  g.add(mesh(tbox(2.64, 0.06, 2.64, 0, 0.03, 0), M.slab));          /* 混凝土地台 y 0..0.06 */
  g.add(mesh(tbox(2.54, 0.02, 2.54, 0, 0.07, 0), M.lawn));          /* 草坪 y 0.06..0.08（5cm 灰边） */
  g.add(mesh(mergeGeos([
    tbox(0.40, 0.012, 1.64, 0.98, 0.086, 0.46),                     /* 道路 z -0.36..1.28 */
    tbox(0.34, 0.012, 0.20, 0.61, 0.086, -0.26)                     /* 楼前铺装（路左侧） */
  ]), M.road));

  /* ========== 光伏阵列 ×4 排（板 + 白框 + 檩条 + 立柱 ×8 + 基脚） ========== */
  var TILT = 32 * PI / 180, tanT = Math.tan(TILT);
  var AL = 1.50, PW = 0.60, YC = 1.07, AX = -0.42;                   /* 板顶 ≈1.24，x -1.17..0.33 */
  var POSTX = [-1.10, -0.645, -0.19, 0.265], PZ = 0.21;
  var rowsZ = [-0.825, -0.275, 0.275, 0.825];                        /* 行距 0.55，行深 0.51 → 紧凑排布 */
  var r, k, px, pz, py, h;
  for (r = 0; r < rowsZ.length; r++) {
    var zc = rowsZ[r];
    L.panel.push(new THREE.BoxGeometry(AL, 0.024, PW).rotateX(TILT).translate(AX, YC, zc));
    L.white.push(new THREE.BoxGeometry(AL + 0.045, 0.02, PW + 0.045)                 /* 白色边框 */
      .rotateX(TILT).translate(AX, YC - 0.023 * cos(TILT), zc - 0.023 * sin(TILT)));
    L.white.push(new THREE.BoxGeometry(AL - 0.08, 0.032, 0.032)                      /* 斜檩条 */
      .rotateX(TILT).translate(AX, YC - 0.045 * cos(TILT), zc - 0.045 * sin(TILT)));
    for (k = 0; k < POSTX.length; k++) {
      px = POSTX[k];
      /* 后立柱（高边） */
      pz = zc - PZ; py = YC + PZ * tanT - 0.028; h = py - GR;
      L.white.push(tbox(0.042, h, 0.042, px, GR + h / 2, pz));
      L.concD.push(tbox(0.11, 0.05, 0.11, px, GR + 0.025, pz));      /* 混凝土基脚 */
      /* 前立柱（低边） */
      pz = zc + PZ; py = YC - PZ * tanT - 0.028; h = py - GR;
      L.white.push(tbox(0.042, h, 0.042, px, GR + h / 2, pz));
      L.concD.push(tbox(0.11, 0.05, 0.11, px, GR + 0.025, pz));
    }
  }

  /* ========== 控制楼（宽扁白盒 + 幕墙前厅 + 蓝檐口 + 平顶机组 ×3 + 天线 + 状态灯） ========== */
  var BX = 0.84, BZ = -0.72, BW = 0.80, BD = 0.72, BBT = 0.13, BT = 0.72, RT = 0.755;
  var FZ = BZ + BD / 2;                                             /* 前立面 z = -0.36 */
  L.bldg.push(tbox(BW + 0.04, 0.05, BD + 0.04, BX, 0.105, BZ));     /* 台座 y 0.08..0.13 */
  L.bldg.push(tbox(BW, BT - BBT, BD, BX, (BT + BBT) / 2, BZ));      /* 楼体 y 0.13..0.72 */
  L.bldg.push(tbox(BW + 0.04, RT - BT, BD + 0.04, BX, (RT + BT) / 2, BZ)); /* 屋面板 y 0.72..0.755 */
  L.bldg.push(tbox(0.30, 0.018, 0.14, BX + 0.22, 0.66, FZ + 0.07)); /* 门雨篷 */
  var fy = RT + 0.0225;                                             /* 蓝色檐口带 ×4（y 0.755..0.80） */
  L.trim.push(tbox(BW + 0.044, 0.045, 0.018, BX, fy, FZ + 0.011));
  L.trim.push(tbox(BW + 0.044, 0.045, 0.018, BX, fy, BZ - BD / 2 - 0.011));
  L.trim.push(tbox(0.018, 0.045, BD + 0.04, BX - BW / 2 - 0.013, fy, BZ));
  L.trim.push(tbox(0.018, 0.045, BD + 0.04, BX + BW / 2 + 0.013, fy, BZ));
  g.add(mesh(tbox(BW - 0.08, 0.50, 0.014, BX, 0.43, FZ + 0.004), M.glass)); /* 玻璃幕墙前厅（含门） */
  L.dglass.push(tbox(0.012, 0.16, 0.44, BX + BW / 2 + 0.004, 0.46, BZ - 0.02)); /* 侧窗长带 */
  L.dglass.push(tbox(0.012, 0.14, 0.30, BX - BW / 2 - 0.004, 0.44, BZ + 0.06));
  L.hvac.push(tbox(0.16, 0.12, 0.14, 0.62, RT + 0.06, -0.90));      /* 屋顶空调机组 ×3 */
  L.hvac.push(tbox(0.18, 0.13, 0.15, 1.02, RT + 0.065, -0.58));
  L.hvac.push(tbox(0.12, 0.09, 0.12, 0.66, RT + 0.045, -0.55));
  L.dark.push(tbox(0.12, 0.006, 0.10, 0.62, RT + 0.123, -0.90));    /* 机组格栅 */
  L.dark.push(tbox(0.09, 0.006, 0.09, 0.66, RT + 0.093, -0.55));
  L.steel.push(tcyl(0.006, 0.009, 0.60, 10, 1.14, RT + 0.30, -1.00)); /* 天线杆 → 1.355 */
  L.steel.push(tbox(0.10, 0.008, 0.008, 1.14, RT + 0.47, -1.00));   /* 横枝 ×2 */
  L.steel.push(tbox(0.008, 0.008, 0.07, 1.14, RT + 0.55, -1.00));
  L.steel.push(tsph(0.011, 1.14, RT + 0.61, -1.00));                /* 天线尖 ≈1.37 */
  var lamp = mesh(tbox(0.035, 0.035, 0.02, BX - 0.32, fy, FZ + 0.020), lampM);
  lamp.castShadow = false; g.add(lamp);
  /* 屋顶风扇转子（动画旋转） */
  var rotor = grp(); rotor.position.set(1.02, RT + 0.132, -0.58); g.add(rotor);
  var blade, bl = [tcyl(0.014, 0.014, 0.022, 12, 0, 0.005, 0)];
  for (k = 0; k < 3; k++) {
    blade = tbox(0.055, 0.006, 0.018, 0.030, 0.004, 0).rotateY(k * 2 * PI / 3);
    bl.push(blade);
  }
  rotor.add(mesh(mergeGeos(bl), M.fan));

  /* ========== 变压器组（翅片主变 + 白柜 ×2，混凝土台座） ========== */
  L.concD.push(tbox(0.38, 0.03, 0.66, 0.59, 0.095, 0.39));          /* 台座 x 0.40..0.78 z 0.06..0.72，顶 y 0.11 */
  L.cable.push(tbox(0.05, 0.035, 1.10, 0.40, 0.098, -0.49));        /* 电缆槽盒（阵列侧 → 台座） */
  L.cable.push(tbox(0.04, 0.03, 0.26, 0.66, 0.095, -0.05));         /* 导管（铺装 → 台座） */
  /* 主变：翅片箱体 */
  L.fin.push(tbox(0.32, 0.42, 0.26, 0.57, 0.32, 0.26));
  L.dark.push(tbox(0.34, 0.03, 0.28, 0.57, 0.545, 0.26));           /* 深色顶盖 */
  L.dark.push(tcyl(0.016, 0.02, 0.075, 12, 0.49, 0.5975, 0.26));    /* 套管 ×3 */
  L.dark.push(tcyl(0.016, 0.02, 0.075, 12, 0.57, 0.5975, 0.26));
  L.dark.push(tcyl(0.016, 0.02, 0.075, 12, 0.65, 0.5975, 0.26));
  /* 白柜 ×2 */
  L.cabW.push(tbox(0.26, 0.36, 0.22, 0.62, 0.29, 0.58));
  L.dark.push(tbox(0.28, 0.025, 0.24, 0.62, 0.4825, 0.58));
  L.dark.push(tbox(0.16, 0.10, 0.012, 0.62, 0.28, 0.693));          /* 前面板通风格栅 */
  L.cabW.push(tbox(0.16, 0.24, 0.14, 0.47, 0.23, 0.58));
  L.dark.push(tbox(0.18, 0.02, 0.16, 0.47, 0.36, 0.58));

  /* ========== 围栏（白立柱 + 双横杆 + 网格片）+ 前侧大门 ========== */
  var i, p, fz = 1.28;
  for (i = 0; i < 8; i++) {
    p = -1.155 + i * 0.33;
    L.fenceW.push(tbox(0.02, 0.24, 0.02, p, 0.195, fz));            /* +Z 侧（留门口） */
    if (p < 0.70 || p > 1.21) L.fenceW.push(tbox(0.02, 0.24, 0.02, p, 0.195, -fz));
    L.fenceW.push(tbox(0.02, 0.24, 0.02, fz, 0.195, p));            /* ±X 侧 */
    L.fenceW.push(tbox(0.02, 0.24, 0.02, -fz, 0.195, p));
  }
  /* 横杆 ×2 层：-Z / ±X 整长；+Z 分两段（门洞 0.70..1.26） */
  L.fenceW.push(tbox(2.62, 0.012, 0.012, 0, 0.27, -fz));
  L.fenceW.push(tbox(2.62, 0.012, 0.012, 0, 0.12, -fz));
  L.fenceW.push(tbox(0.012, 0.012, 2.62, fz, 0.27, 0));
  L.fenceW.push(tbox(0.012, 0.012, 2.62, fz, 0.12, 0));
  L.fenceW.push(tbox(0.012, 0.012, 2.62, -fz, 0.27, 0));
  L.fenceW.push(tbox(0.012, 0.012, 2.62, -fz, 0.12, 0));
  L.fenceW.push(tbox(1.955, 0.012, 0.012, -0.2675, 0.27, fz));
  L.fenceW.push(tbox(1.955, 0.012, 0.012, -0.2675, 0.12, fz));
  L.fenceW.push(tbox(0.095, 0.012, 0.012, 1.2475, 0.27, fz));
  L.fenceW.push(tbox(0.095, 0.012, 0.012, 1.2475, 0.12, fz));
  /* 网格片：分段推进（+Z 侧跳过门洞） */
  function meshRun(x0, x1, z, alongX) {
    var n = Math.max(1, Math.round((x1 - x0) / 0.3275)), len = (x1 - x0) / n;
    for (var s = 0; s < n; s++) {
      var c = x0 + len * (s + 0.5);
      if (alongX) L.fenceM.push(tbox(len, 0.20, 0.012, c, 0.17, z));
      else L.fenceM.push(tbox(0.012, 0.20, len, z, 0.17, c));
    }
  }
  meshRun(-1.295, 1.295, -fz, true);
  meshRun(-1.295, 0.70, fz, true);                                  /* +Z 分两段（留门洞） */
  meshRun(1.26, 1.295, fz, true);
  meshRun(-1.295, 1.295, fz, false);
  meshRun(-1.295, 1.295, -fz, false);
  /* 门柱 + 半开门扇（向场内开 28°） */
  L.fenceW.push(tbox(0.026, 0.27, 0.026, 0.70, 0.215, fz));
  L.fenceW.push(tbox(0.026, 0.27, 0.026, 1.26, 0.215, fz));
  L.fenceM.push(new THREE.BoxGeometry(0.42, 0.18, 0.014).translate(-0.21, 0, 0)
    .rotateY(-0.5).translate(1.247, 0.185, fz));

  /* ========== 绿化：圆冠树 ×4 + 灌木 ×4 ========== */
  var trees = [[-1.12, -1.14], [-1.12, 1.12], [0.02, 1.14], [1.18, 0.88]];
  for (i = 0; i < trees.length; i++) {
    L.trunk.push(tcyl(0.018, 0.026, 0.16, 10, trees[i][0], GR + 0.08, trees[i][1]));
    L.crown.push(tsph(0.115, trees[i][0], GR + 0.245, trees[i][1]));
    L.crown2.push(tsph(0.075, trees[i][0] + 0.04, GR + 0.33, trees[i][1] - 0.03));
  }
  var bushes = [[-0.72, 1.12], [-1.12, 0.35], [0.55, 1.10], [0.44, -1.12]];
  for (i = 0; i < bushes.length; i++) {
    L.bush.push(new THREE.SphereGeometry(0.055, 12, 10).scale(1, 0.8, 1)
      .translate(bushes[i][0], GR + 0.045, bushes[i][1]));
  }

  /* ========== 合并落地（同材质静态件合并，控制 mesh 数） ========== */
  g.add(mesh(mergeGeos(L.panel), M.panel));
  g.add(mesh(mergeGeos(L.white), M.white));
  g.add(mesh(mergeGeos(L.concD), M.concD));
  g.add(mesh(mergeGeos(L.bldg), M.white));
  g.add(mesh(mergeGeos(L.trim), M.trim));
  g.add(mesh(mergeGeos(L.dglass), M.dglass));
  g.add(mesh(mergeGeos(L.hvac), M.hvac));
  g.add(mesh(mergeGeos(L.dark), M.dark));
  g.add(mesh(mergeGeos(L.cabW), M.cabW));
  g.add(mesh(mergeGeos(L.fin), M.fin));
  g.add(mesh(mergeGeos(L.steel), M.steel));
  g.add(mesh(mergeGeos(L.fenceW), M.fence));
  g.add(mesh(mergeGeos(L.fenceM), M.fmesh));
  g.add(mesh(mergeGeos(L.trunk), M.trunk));
  g.add(mesh(mergeGeos(L.crown), M.crown));
  g.add(mesh(mergeGeos(L.crown2), M.crown2));
  g.add(mesh(mergeGeos(L.bush), M.bush));
  g.add(mesh(mergeGeos(L.cable), M.cable));

  /* ========== 动画（≤3 项，确定性） ========== */
  g.userData.anim = [
    function (t) {                                   /* 1) 屋顶风扇旋转 */
      rotor.rotation.y = t * 2.2;
    },
    function (t) {                                   /* 2) 板面反光呼吸（emissive 微幅 ≤0.12） */
      M.panel.emissiveIntensity = 0.05 + 0.06 * (0.5 + 0.5 * sin(t * 0.9));
    },
    function (t) {                                   /* 3) 状态灯呼吸 */
      lampM.emissiveIntensity = 0.55 + 0.25 * sin(t * 2.6);
    }
  ];
  return g;
};
})();
