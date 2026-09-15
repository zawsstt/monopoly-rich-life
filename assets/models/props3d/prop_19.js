/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_19.js  (v2 精修版)
 * -------------------------------------------------------------------------------------
 * 格 19「春熙路」(g4 川西商街) 独属建筑：锦官楼阁四阶生长史
 * 参考图 refs/prop_19.png 高保真复刻（v1 已验收形态/配色/布局/契约全部保留，
 * v2 按 REFINE_SPEC 在其上加密细节：清偿 v1 自述妥协 + 对照参考图补刻）。
 *
 * 风格族谱（同一块地的同一种生长，对位参考图四联）：
 *   lv1 小屋   茅草初创屋：厚草坡（双层草 course+檐缘流苏）+ 原木卷脊 + 山墙竹竿斜撑
 *              + 深木构架米白抹灰 + 双扇木门门簪金匾条 + 格窗团花 + 竹丛石径（h≈1.1）
 *   lv2 洋房   两层商铺：底层敞口店面（货架/货物加密）+ 靛蓝布雨棚（波浪垂幔+撑杆微动）
 *              + 二层雕花格窗 + 镂空雕栏（望柱/透空花板/金顶柱头）+ 大歇山瓦顶
 *              （垂脊+檐口椽头）（h≈1.62）
 *   lv3 大厦   三层退台楼阁：层层挑檐（垂脊加密）+ 雕花格窗墙 + 右侧塔楼 + 青布雨棚
 *              玻璃橱窗（竖梃分格）+ 顶部露台栏杆茶伞（h≈2.1）
 *   lv4 地标   锦官地标：石台基垂带踏步（贴地三步+垂带+鼓石）+ 石狮升级（须弥座/
 *              前腿/卷尾/项圈）+ 红伞茶座（伞骨+方桌凳+茶壶）+ 中央玻璃幕墙圆筒
 *              （14 竖梃+5 环梁+3 层楼板暖光呼吸）+ 两翼雕栏层楼 + 入口门楼金匾
 *              （512px 描边金字）+ 顶冠环廊宝顶（h≈2.9）
 *
 * 独有语汇（自参考图提炼，与 prop_1/3/6/8/9/14/10/16/18 拉开差异）：
 *   · 深咖木构架 + 米白抹灰填充的双色立面（木框网格暴露在外）
 *   · 暖深灰瓦面（#4C463E）+ 浅灰瓦脊（#6E675C，脊比瓦面亮——与 prop_3/18 黑脊相反）
 *   · 檐角大起翘 + 脊端卷尾 + 4 枚斜置挑角块 + 垂脊走兽（v2 增）
 *   · 金棕色镂空雕花格窗/雕栏（几何镂空，非贴图）+ 暖光窗芯
 *   · 茅草原木卷脊（lv1 身份件）→ 瓦顶族谱（lv2+）
 *   · 玻璃幕墙圆筒：lv3 橱窗萌芽 → lv4 全圆筒（竖梃 + 环梁 + 暖光楼层呼吸）
 *   · 靛蓝布雨棚（lv2）→ 青布雨棚（lv3）→ 红伞茶座（lv4）同族演变
 *   · 竹丛双丛驻场 + 红灯笼金盖金穗 + 石板径/草皮台
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[19] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤512px）；每级 mesh ≤350；userData.anim=[fn(t, dt)]。
 * v2 变化：圆柱段数统一 ≥12、球 16×12；主纹理升 256/512px；金匾描边+回纹角花；
 *          雨棚波浪垂幔+微动；雕栏真镂空；瓦顶垂脊/椽头/脊兽；石狮须弥座整装；
 *          玻璃筒 14 梃 5 环梁 3 楼板；踏步贴地+垂带；灯笼金箍+挂绳。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_19] THREE 未定义，请先加载 three.min.js (r147)');
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
  if (o.eMap) { m.emissiveMap = o.eMap; if (!o.emissive) m.emissive = C('#ffffff'); }
  if (o.transparent) { m.transparent = true; m.opacity = (o.opacity !== undefined ? o.opacity : 0.55); }
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
/* v2：圆柱段数下限 12（规范硬门槛），调用处不再散落 10 段 */
function cyl(rt, rb, h, seg, mat, x, y, z) {
  var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg | 0)), mat);
  o.position.set(x || 0, y || 0, z || 0); return o;
}
/* v2：球 16×12（规范：球段数 ≥16×12） */
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) {
  var o = mesh(new THREE.ConeGeometry(r, h, Math.max(12, seg | 0)), mat);
  o.position.set(x || 0, y || 0, z || 0); return o;
}
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rx, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz;
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

/* 茅草（v2→256px）：交错草股横带 + 竖向草茎 + 束腰明暗（map+bump 同源） */
function texThatch() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#b08850'; g.fillRect(0, 0, S, S);
  var rows = 18, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#c9a45f' : '#a37c46';
    g.fillRect(0, y, S, rh);
    g.fillStyle = 'rgba(90,62,28,0.55)'; g.fillRect(0, y + rh - 2, S, 2);
    g.fillStyle = 'rgba(232,206,140,0.5)'; g.fillRect(0, y + 1, S, 1.5);
    var off = (i % 2) ? 7 : 0;
    for (k = 0; k < 22; k++) {
      var x = (off + k * 12) % S;
      g.fillStyle = (k % 3) ? 'rgba(122,90,40,0.4)' : 'rgba(226,200,138,0.4)';
      g.fillRect(x, y, 2, rh - 1);
    }
  }
  for (i = 0; i < 340; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,235,180,0.10)' : 'rgba(70,46,18,0.12)';
    g.fillRect((i * 41) % S, (i * 67) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 暖深灰瓦垄（v2→256px）：横排瓦垄（垄冠亮/垄沟暗）+ 竖向接头错缝 + 满瓦噪点
 * —— 脊与瓦面区分（脊用独立浅灰材质） */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#4c463e'; g.fillRect(0, 0, S, S);
  var rows = 18, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#504a41' : '#48423a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#322d26'; g.fillRect(0, y + rh - 2, S, 2);
    g.fillStyle = '#5f584d'; g.fillRect(0, y + 1, S, 1.5);
    var off = (i % 2) ? 16 : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(34,30,24,0.5)'; g.fillRect(x, y, 2, rh - 2);
    }
  }
  for (i = 0; i < 420; i++) {
    g.fillStyle = (i % 3) ? 'rgba(220,212,196,0.05)' : 'rgba(22,18,14,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 米白抹灰（v2→128px）：细噪 + 抹痕 + 檐下渍线 */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#e8e2d2'; g.fillRect(0, 0, S, S);
  for (var i = 0; i < 200; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,250,0.07)' : 'rgba(120,110,90,0.07)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  g.fillStyle = 'rgba(110,116,100,0.16)'; g.fillRect(0, 0, S, 8);
  g.fillStyle = 'rgba(110,116,100,0.10)'; g.fillRect(0, 8, S, 5);
  return toTex(cv, true);
}
/* 布雨棚条纹（v2→256px + 底缘缝线）：base/light 成对出图 */
function texAwning(base, light, dark) {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  var n = 6, w = S / n, i;
  for (i = 0; i < n; i++) {
    var x = i * w;
    g.fillStyle = light; g.fillRect(x + 5, 0, w - 12, S);
    g.fillStyle = dark; g.fillRect(x + w - 8, 0, 8, S);
    g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x + 8, 0, 4, S);
  }
  g.fillStyle = 'rgba(40,32,20,0.22)'; g.fillRect(0, S - 7, S, 7);   /* 底缘卷边阴影 */
  for (i = 0; i < 130; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.05)' : 'rgba(30,26,18,0.07)';
    g.fillRect((i * 53) % S, (i * 97) % S, 3, 1.5);
  }
  return toTex(cv, true);
}
/* 玻璃幕墙（v2→256px，14×5 分格与几何竖梃/环梁对齐）+ 冷色渐变 */
function texGlass() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  var grad = g.createLinearGradient(0, 0, 0, S);
  grad.addColorStop(0, '#a8c4d6'); grad.addColorStop(0.5, '#8fb0c4'); grad.addColorStop(1, '#7aa2ba');
  g.fillStyle = grad; g.fillRect(0, 0, S, S);
  var COLS = 14, ROWS = 5, cw = S / COLS, rh = S / ROWS, i, k;
  for (i = 0; i <= COLS; i++) { g.fillStyle = 'rgba(50,60,70,0.75)'; g.fillRect(Math.round(i * cw) - 1, 0, 2, S); }
  for (k = 0; k <= ROWS; k++) { g.fillStyle = 'rgba(50,60,70,0.8)'; g.fillRect(0, Math.round(k * rh) - 1, S, 2); }
  g.fillStyle = 'rgba(255,255,255,0.18)';
  for (i = 0; i < 7; i++) g.fillRect(i * 36 + 4, 0, 6, S);
  return toTex(cv, true);
}
/* 玻璃暖光楼层（emissiveMap，v2→256px）：环梁之间的暖色窗格（14×5 对齐） */
function texGlassGlow() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#000000'; g.fillRect(0, 0, S, S);
  var COLS = 14, ROWS = 5, cw = S / COLS, rh = S / ROWS, i, k;
  for (i = 0; i < ROWS; i++) {
    for (k = 0; k < COLS; k++) {
      if ((i * 3 + k) % 4 === 3) continue;                       /* 部分格暗，制造楼层进深 */
      g.fillStyle = (k % 2) ? 'rgba(232,200,144,0.95)' : 'rgba(216,176,112,0.85)';
      g.fillRect(k * cw + 5, i * rh + 5, cw - 11, rh - 11);
    }
  }
  return toTex(cv, true);
}
/* 金匾「春熙路」（v2→512×160 描边版）：暗底 + 双金框 + 四角回纹 + 描边金字 */
function texPlaque() {
  var w = 512, h = 160, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#2c1c0e'; g.fillRect(0, 0, w, h);
  var vgr = g.createLinearGradient(0, 0, 0, h);                  /* 匾面微光 */
  vgr.addColorStop(0, 'rgba(255,220,150,0.10)'); vgr.addColorStop(0.5, 'rgba(0,0,0,0)');
  vgr.addColorStop(1, 'rgba(0,0,0,0.22)');
  g.fillStyle = vgr; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 10; g.strokeRect(9, 9, w - 18, h - 18);   /* 主金框 */
  g.strokeStyle = 'rgba(216,166,60,0.55)'; g.lineWidth = 3; g.strokeRect(26, 26, w - 52, h - 52); /* 内细框 */
  /* 四角回纹角花（金匾描边族） */
  function meander(cx, cy, sx, sy) {
    g.strokeStyle = '#d8a63c'; g.lineWidth = 4; g.beginPath();
    g.moveTo(cx + sx * 34, cy + sy * 4); g.lineTo(cx + sx * 4, cy + sy * 4);
    g.lineTo(cx + sx * 4, cy + sy * 26); g.lineTo(cx + sx * 22, cy + sy * 26);
    g.lineTo(cx + sx * 22, cy + sy * 12); g.lineTo(cx + sx * 12, cy + sy * 12);
    g.stroke();
  }
  meander(38, 38, 1, 1); meander(w - 38, 38, -1, 1);
  meander(38, h - 38, 1, -1); meander(w - 38, h - 38, -1, -1);
  /* 描边金字（先深棕描边后金填充） */
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 88px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.lineWidth = 12; g.lineJoin = 'round';
  g.strokeStyle = 'rgba(84,50,14,0.95)';
  g.strokeText('春 熙 路', w / 2, h / 2 + 4);
  g.fillStyle = '#ecd28a'; g.fillText('春 熙 路', w / 2, h / 2 + 4);
  g.fillStyle = 'rgba(120,80,20,0.6)'; g.fillText('春 熙 路', w / 2, h / 2 + 7);   /* 底部厚度阴影 */
  g.fillStyle = '#f4dfa0'; g.fillText('春 熙 路', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
/* 石板径（v2→256px）：错缝石板 + 明暗 + 磨圆角 */
function texPath() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#c6b99f'; g.fillRect(0, 0, S, S);
  var rows = 8, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh, off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillStyle = (k + i) % 2 ? '#cfc2a8' : '#bcae94';
      g.fillRect(x + 2, y + 2, S / 3 - 5, rh - 5);
      g.fillStyle = 'rgba(70,62,48,0.5)'; g.fillRect(x, y, S / 3, 1.5);
      g.fillStyle = 'rgba(255,255,248,0.14)'; g.fillRect(x + 2, y + 2, S / 3 - 5, 1.5);
    }
  }
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图取样；脊比瓦亮 = 族谱反差特征） */
function Mats() {
  return {
    thatch:    MAT('p19thatch', function () { var t = getTex('thatch', texThatch); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.9 }); }),
    logRidge:  MAT('p19log', function () { return std('#7a5a34', { rough: 0.88 }); }),
    roofSun:   MAT('p19roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.7 }); }),
    roofShade: MAT('p19roofShd', function () { var t = getTex('tile', texTile); return std('#b5aea0', { map: t, bump: t, bumpScale: 0.014, rough: 0.76 }); }),
    ridge:     MAT('p19ridge', function () { return std('#6e675c', { rough: 0.8 }); }),      /* 浅灰脊（反差特征） */
    fascia:    MAT('p19fascia', function () { return std('#462c14', { rough: 0.8 }); }),
    timber:    MAT('p19timber', function () { return std('#5a3a1e', { rough: 0.82 }); }),
    timberD:   MAT('p19timberD', function () { return std('#462c14', { rough: 0.86 }); }),
    carved:    MAT('p19carved', function () { return std('#8a5f36', { rough: 0.55 }); }),
    goldwood:  MAT('p19goldwood', function () { return std('#c9984e', { rough: 0.42 }); }),
    plaster:   MAT('p19plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    lanternM:  null,   /* 相位材质，见 lantern() */
    gold:      MAT('p19gold', function () { return std('#d8a63c', { rough: 0.35, metal: 0.75 }); }),
    glass:     MAT('p19glass', function () {
      var t = getTex('glass', texGlass), e = getTex('glassGlow', texGlassGlow);
      var m = std('#ffffff', { map: t, eMap: e, rough: 0.2, metal: 0.1, transparent: true, opacity: 0.62 });
      m.emissive = C('#ffd9a0'); m.emissiveIntensity = 0.38;
      m.side = THREE.DoubleSide;
      return m;
    }),
    glow:      MAT('p19glow', function () { return std('#e8c890', { rough: 0.6, emissive: '#ffcf8a', ei: 0.42 }); }),
    pane:      MAT('p19pane', function () { return std('#efe3c2', { rough: 0.7, emissive: '#ffd98a', ei: 0.2 }); }),
    awnI:      MAT('p19awnI', function () { var t = getTex('awnI', function () { return texAwning('#4a5d8c', '#5c72a6', '#39496e'); }); return std('#ffffff', { map: t, rough: 0.85 }); }),
    awnT:      MAT('p19awnT', function () { var t = getTex('awnT', function () { return texAwning('#4e9494', '#62acac', '#3a7676'); }); return std('#ffffff', { map: t, rough: 0.85 }); }),
    umbrella:  MAT('p19umb', function () { return std('#c04838', { rough: 0.6 }); }),
    umbrellaC: MAT('p19umbC', function () { return std('#e8e0ce', { rough: 0.65 }); }),
    stone:     MAT('p19stone', function () { return std('#b0a89a', { rough: 0.9 }); }),
    stoneD:    MAT('p19stoneD', function () { return std('#948c7c', { rough: 0.92 }); }),
    step:      MAT('p19step', function () { var t = getTex('path', texPath); return std('#ffffff', { map: t, rough: 0.9 }); }),
    grass:     MAT('p19grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p19grassD', function () { return std('#698f4c', { rough: 0.95 }); }),
    bush:      MAT('p19bush', function () { return std('#5f8a42', { rough: 0.95 }); }),
    bamboo:    MAT('p19bamboo', function () { return std('#8fbe55', { rough: 0.8 }); }),
    bambooL:   MAT('p19bambooL', function () { return std('#6fae4a', { rough: 0.85 }); }),
    jar:       MAT('p19jar', function () { return std('#8a6a4a', { rough: 0.85 }); }),
    goods:     MAT('p19goods', function () { return std('#c8955a', { rough: 0.8 }); }),
    ink:       MAT('p19ink', function () { return std('#2a2622', { rough: 0.8 }); })
  };
}

/* ================= 2. 预制件（风格独有语汇 · v2 加密） ================= */

/* 红灯笼：金盖金底 + 红壳 + 金箍×2（v2）+ 挂绳（v2）+ 穗（相位呼吸） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = MAT('p19lant' + (phase || 0), function () { return std('#c8402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
  if (s >= 0.52) g.add(cyl(0.005 * s, 0.005 * s, 0.07 * s, 12, M.fascia, 0, 0.2 * s, 0));   /* 挂绳 */
  g.add(cyl(0.036 * s, 0.05 * s, 0.035 * s, 12, M.gold, 0, 0.115 * s, 0));
  var body = sph(0.085 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.0605 * s, 0.0605 * s, 0.006 * s, 12, M.fascia, 0, 0.036 * s, 0));             /* 金箍上 */
  g.add(cyl(0.062 * s, 0.062 * s, 0.006 * s, 12, M.fascia, 0, -0.03 * s, 0));               /* 金箍下 */
  g.add(cyl(0.05 * s, 0.036 * s, 0.035 * s, 12, M.gold, 0, -0.105 * s, 0));
  if (s > 0.55) g.add(cyl(0.008 * s, 0.008 * s, 0.075 * s, 12, M.fascia, 0, -0.168 * s, 0));
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 雕花格窗：深木框 + 暖光窗芯 + 竖棂横棂 + 中枋 + 团花（v2）+ 金棕沿条（几何镂空族） */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.034, M.timberD));
  g.add(box(w, h, 0.03, M.pane, 0, 0, 0.004));
  var cols = o.cols || 3, i;
  for (i = 0; i < cols; i++) {
    var x = -w / 2 + (i + 1) * w / (cols + 1);
    g.add(box(0.024, h, 0.038, M.carved, x, 0, 0.008));
  }
  var rows = o.rows || 2;
  for (i = 0; i < rows; i++) {
    var y = -h / 2 + (i + 1) * h / (rows + 1);
    g.add(box(w, 0.02, 0.038, M.carved, 0, y, 0.008));
  }
  if (w >= 0.24) {
    g.add(box(w, 0.016, 0.042, M.carved, 0, 0, 0.01));                    /* 中枋 */
    var med = box(0.05, 0.05, 0.046, M.goldwood, 0, 0, 0.012);            /* 团花 */
    med.rotation.z = PI / 4; g.add(med);
  }
  g.add(box(w + 0.09, 0.03, 0.05, M.goldwood, 0, -h / 2 - 0.035, 0.004));
  return g;
}

/* 镂空雕栏阳台（v2 真镂空）：地栿 + 下梃 + 望柱列 + 透空花板（上下留缝） +
 * 金棕扶手 + 端柱金顶 —— 对位参考图镂空雕花栏杆 */
function carvedBalcony(M, w) {
  var g = grp();
  g.add(box(w, 0.035, 0.2, M.timberD, 0, 0, 0.1));                       /* 地栿 */
  g.add(box(w + 0.04, 0.024, 0.024, M.timberD, 0, 0.032, 0.185));        /* 下梃 */
  var n = Math.max(3, Math.round(w / 0.24)), i;
  for (i = 0; i <= n; i++) {                                             /* 望柱 n+1 */
    var px = -w / 2 + i * (w / n);
    g.add(box(0.024, 0.1, 0.024, M.carved, px, 0.072, 0.185));
  }
  for (i = 0; i < n; i++) {                                              /* 透空花板（上下透缝） */
    var cx = -w / 2 + (i + 0.5) * (w / n);
    g.add(box(w / n - 0.032, 0.056, 0.02, M.carved, cx, 0.072, 0.185));
  }
  g.add(box(w + 0.05, 0.032, 0.032, M.goldwood, 0, 0.145, 0.185));       /* 扶手 */
  g.add(box(0.03, 0.17, 0.03, M.timberD, -w / 2 + 0.015, 0.085, 0.185));
  g.add(box(0.03, 0.17, 0.03, M.timberD, w / 2 - 0.015, 0.085, 0.185));
  g.add(sph(0.016, M.gold, -w / 2 + 0.015, 0.178, 0.185));               /* 金顶柱头 */
  g.add(sph(0.016, M.gold, w / 2 - 0.015, 0.178, 0.185));
  return g;
}

/* 深木柱：石础 + 柱身（随参考：素面深木） */
function column19(M, h, r) {
  var g = grp();
  g.add(cyl(r * 1.4, r * 1.55, 0.04, 12, M.stoneD, 0, 0.02, 0));
  g.add(cyl(r, r, h, 12, M.timber, 0, 0.04 + h / 2, 0));
  return g;
}

/* 瓦顶（歇山-庑殿混合的微缩简化）：
 * 前后坡（迎光亮/背光暗）+ 左右坡 + 浅灰正脊 + 脊端卷尾 + 4 枚斜置挑角块
 * + 垂脊×4（v2，沿前后坡两侧到挑角）+ 檐口椽头排（v2，o.rafters）
 * + 脊兽×2（v2，o.big）+ 檐口深木封檐 —— 本族谱的剪影担当 */
function tileRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.1;
  var g = grp();
  var W = w + over * 2, D = d + over * 2;
  var rw = o.ridgeW !== undefined ? o.ridgeW : Math.max(0.1, w * 0.42);
  var rd = Math.min(0.1, D * 0.3);
  var half = (D - rd) / 2;
  var pitch = Math.atan2(h, half);
  var lenF = Math.sqrt(h * h + half * half) + 0.02;
  /* 前坡（迎光） */
  var f = grp(); f.position.set(0, h, 0); f.rotation.x = pitch; g.add(f);
  f.add(box(W, 0.035, lenF, M.roofSun, 0, 0, lenF / 2));
  f.add(box(W + 0.02, 0.05, 0.024, M.fascia, 0, -0.006, lenF - 0.012));
  if (o.hips !== false) {                                                /* v2 垂脊（前后坡两侧） */
    f.add(box(0.055, 0.03, lenF - 0.04, M.ridge, (W / 2 - 0.025), 0.016, lenF / 2));
    f.add(box(0.055, 0.03, lenF - 0.04, M.ridge, -(W / 2 - 0.025), 0.016, lenF / 2));
  }
  if (o.rafters) {                                                       /* v2 檐口椽头排 */
    var nR = Math.max(5, Math.round(W / 0.22)), k;
    for (k = 0; k < nR; k++) {
      var rx = -((nR - 1) / 2) * (W - 0.14) / (nR - 1);
      f.add(box(0.028, 0.028, 0.06, M.timberD, rx, -0.036, lenF - 0.03));
    }
  }
  /* 后坡（背光） */
  var b = grp(); b.position.set(0, h, 0); b.rotation.x = -pitch; g.add(b);
  b.add(box(W, 0.035, lenF, M.roofShade, 0, 0, -lenF / 2));
  if (!o.noFasciaB) b.add(box(W + 0.02, 0.05, 0.024, M.fascia, 0, -0.006, -(lenF - 0.012)));
  if (o.hips !== false) {
    b.add(box(0.055, 0.03, lenF - 0.04, M.ridge, (W / 2 - 0.025), 0.016, -lenF / 2));
    b.add(box(0.055, 0.03, lenF - 0.04, M.ridge, -(W / 2 - 0.025), 0.016, -lenF / 2));
  }
  /* 左右坡 */
  var halfS = (W - rw) / 2;
  var pitchS = Math.atan2(h, halfS);
  var lenS = Math.sqrt(h * h + halfS * halfS) + 0.02;
  var sr = grp(); sr.position.set(0, h, 0); sr.rotation.z = -pitchS; g.add(sr);
  sr.add(box(lenS, 0.035, D * 0.82, M.roofShade, lenS / 2, 0, 0));
  var sl = grp(); sl.position.set(0, h, 0); sl.rotation.z = pitchS; g.add(sl);
  sl.add(box(lenS, 0.035, D * 0.82, M.roofShade, -lenS / 2, 0, 0));
  /* 4 枚斜置挑角块（檐角起翘；小檐可省） */
  if (!o.noLifts) {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
      var lift = box(0.075, 0.05, 0.075, M.ridge, c[0] * (W / 2 - 0.03), 0.045, c[1] * (D / 2 - 0.03));
      lift.rotation.z = -c[0] * 0.55; lift.rotation.x = c[1] * 0.45; g.add(lift);
    });
  }
  /* 浅灰正脊 + 脊端卷尾 */
  g.add(box(rw, 0.06 + (o.big ? 0.02 : 0), rd + 0.02, M.ridge, 0, h + 0.03, 0));
  var c1 = box(0.055, 0.09 + (o.big ? 0.03 : 0), rd * 0.9, M.ridge, rw / 2 + 0.02, h + 0.09, 0);
  c1.rotation.z = 0.55; g.add(c1);
  var c2 = box(0.055, 0.09 + (o.big ? 0.03 : 0), rd * 0.9, M.ridge, -(rw / 2 + 0.02), h + 0.09, 0);
  c2.rotation.z = -0.55; g.add(c2);
  if (o.big) {
    put(g, sph(0.034, M.gold), 0, h + 0.16, 0);
    g.add(box(0.035, 0.05, 0.045, M.fascia, (rw / 2 - 0.09), h + 0.078, 0));   /* v2 脊兽 ×2 */
    g.add(box(0.035, 0.05, 0.045, M.fascia, -(rw / 2 - 0.09), h + 0.078, 0));
  }
  return g;
}

/* 茅草顶（lv1 身份件，v2 加密）：双坡厚草 + 双层草 course + 檐缘流苏分片 +
 * 山墙封板 + 竹竿斜撑 + 原木卷脊 */
function thatchRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.1;
  var g = grp();
  var W = w + over * 2, D = d + over * 2;
  var pitch = Math.atan2(h, D / 2);
  var slopeLen = Math.sqrt(h * h + D / 2 * D / 2) + 0.03;
  var f = grp(); f.position.set(0, h, 0); f.rotation.x = pitch; g.add(f);
  f.add(box(W, 0.06, slopeLen, M.thatch, 0, 0, slopeLen / 2));
  f.add(box(W + 0.02, 0.028, 0.1, M.thatch, 0, 0.046, slopeLen * 0.58));   /* v2 草 course ×2 */
  f.add(box(W - 0.06, 0.028, 0.1, M.thatch, 0, 0.046, slopeLen * 0.32));
  f.add(box(W + 0.02, 0.03, 0.05, M.thatch, 0, -0.03, slopeLen + 0.005));  /* 檐缘流苏 */
  var k;                                                                   /* v2 檐缘流苏分片 ×4 */
  for (k = 0; k < 4; k++) {
    var fx = -W / 2 + 0.12 + k * (W - 0.24) / 3;
    var fr = box(0.15, 0.05, 0.04, M.thatch, fx, -0.058, slopeLen - 0.012);
    fr.rotation.x = (k % 2) ? 0.1 : -0.08; f.add(fr);
  }
  var b = grp(); b.position.set(0, h, 0); b.rotation.x = -pitch; g.add(b);
  b.add(box(W, 0.06, slopeLen, M.thatch, 0, 0, -slopeLen / 2));
  b.add(box(W + 0.02, 0.028, 0.1, M.thatch, 0, 0.046, -slopeLen * 0.58));
  b.add(box(W - 0.06, 0.028, 0.1, M.thatch, 0, 0.046, -slopeLen * 0.32));
  /* 山墙封板 */
  var gs = new THREE.Shape();
  gs.moveTo(-D / 2 - 0.01, 0); gs.lineTo(D / 2 + 0.01, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
  var t1 = mesh(gg, M.plaster); t1.rotation.y = PI / 2;
  t1.position.set(W / 2 - 0.02, -0.02, -0.0225); g.add(t1);
  var t2 = mesh(gg, M.plaster); t2.rotation.y = -PI / 2;
  t2.position.set(-(W / 2 - 0.02), -0.02, 0.0225); g.add(t2);
  /* v2 山墙竹竿斜撑 ×4（左右山墙各一组交叉；参考图小屋骨架竿） */
  [1, -1].forEach(function (sd) {
    var p1 = cyl(0.014, 0.014, h * 1.25, 12, M.bambooL, sd * (W / 2 - 0.015), h * 0.46, 0);
    p1.rotation.x = PI / 2 - 0.22; g.add(p1);
    var p2 = cyl(0.014, 0.014, h * 1.25, 12, M.bambooL, sd * (W / 2 - 0.015), h * 0.5, 0);
    p2.rotation.x = PI / 2 + 0.22; g.add(p2);
  });
  /* 原木卷脊：中段原木 + 两端翘卷 */
  g.add(box(W + 0.06, 0.07, 0.1, M.logRidge, 0, h + 0.03, 0));
  var r1 = cyl(0.035, 0.035, 0.14, 12, M.logRidge, W / 2 + 0.01, h + 0.09, 0);
  r1.rotation.z = 0.7; g.add(r1);
  var r2 = cyl(0.035, 0.035, 0.14, 12, M.logRidge, -(W / 2 + 0.01), h + 0.09, 0);
  r2.rotation.z = -0.7; g.add(r2);
  return g;
}

/* 玻璃幕墙圆筒（v2 加密）：玻璃筒 + 暖光内筒 + 竖梃（默认 14）+ 环梁（5）+
 * 3 层内楼板（参考图筒内可见楼层）——现代春熙签名件 */
function glassDrum(M, r, h, anims, mullions) {
  var g = grp();
  var glowM = M.glass;   /* 呼吸直接作用在玻璃材质 emissive 上 */
  var inner = cyl(r * 0.88, r * 0.88, h * 0.96, 16, M.glow, 0, 0, 0); g.add(inner);
  var glass = cyl(r, r, h, 20, glowM, 0, 0, 0); g.add(glass);
  var n = mullions || 14, i;
  for (i = 0; i < n; i++) {
    var a = i * PI * 2 / n;
    var m = box(0.022, h, 0.022, M.timberD, cos(a) * (r + 0.004), 0, sin(a) * (r + 0.004));
    m.rotation.y = -a; g.add(m);
  }
  var rings = 5;
  for (i = 1; i <= rings; i++) {
    var y = -h / 2 + i * h / (rings + 1);
    g.add(cyl(r + 0.012, r + 0.012, 0.03, 20, M.timberD, 0, y, 0));
  }
  for (i = 0; i < 3; i++) {                                              /* v2 筒内楼板 */
    var fy = -h * 0.28 + i * h * 0.28;
    g.add(cyl(r * 0.86, r * 0.86, 0.02, 16, M.timber, 0, fy, 0));
  }
  g.add(cyl(r + 0.014, r + 0.014, 0.035, 20, M.timberD, 0, h / 2, 0));
  g.add(cyl(r + 0.014, r + 0.014, 0.035, 20, M.timberD, 0, -h / 2, 0));
  anims.push(function (t) { glowM.emissiveIntensity = 0.38 + 0.12 * sin(t * 0.9 + 0.5); });
  return g;
}

/* 金匾（春熙路，v2：512px 描边金字 + 回纹角花） */
function plaque(M, w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.03, M.timberD));
  var pm = new THREE.MeshStandardMaterial({ map: getTex('plaque', texPlaque), roughness: 0.55, metalness: 0.08, flatShading: true });
  pm.name = 'p19plaque';
  var p = mesh(new THREE.PlaneGeometry(w, h), pm);
  p.position.z = 0.018; g.add(p);
  return g;
}

/* 竹丛（v2 加密）：4 秆 + 竹节环 ×2 + 叶刃（摆动；双丛驻场 = 成都组名片） */
function bambooClump(M, h, anims, phase) {
  var g = grp();
  var n = 4, i;
  for (i = 0; i < n; i++) {
    var a = i * 2.3, rr = 0.035 * i;
    var hh = h * (0.75 + 0.25 * ((i * 37) % 10) / 10);
    var st = cyl(0.016, 0.02, hh, 12, M.bamboo, cos(a) * rr, hh / 2, sin(a) * rr);
    g.add(st);
    if (i < 2) {                                                         /* v2 竹节环 */
      g.add(cyl(0.02, 0.02, 0.012, 12, M.bambooL, cos(a) * rr, hh * 0.45, sin(a) * rr));
      g.add(cyl(0.019, 0.019, 0.012, 12, M.bambooL, cos(a) * rr, hh * 0.72, sin(a) * rr));
    }
    var l1 = box(0.11, 0.008, 0.026, M.bambooL, cos(a) * rr + 0.05, hh - 0.03, sin(a) * rr);
    l1.rotation.z = 0.5; l1.rotation.y = a; g.add(l1);
    if (i === 0) {
      var l2 = box(0.1, 0.008, 0.024, M.bambooL, cos(a) * rr - 0.04, hh - 0.1, sin(a) * rr + 0.02);
      l2.rotation.z = -0.45; l2.rotation.y = a + 1.2; g.add(l2);
    }
  }
  anims.push(function (t) { g.rotation.z = sin(t * 1.15 + (phase || 0)) * 0.022; });
  return g;
}

/* 石狮（lv4 门狮，v2 整装）：须弥座 ×3 层 + 身 + 鬃胸 + 头 + 双耳 + 前腿 ×2 +
 * 卷尾 + 金项圈金铃 —— 对位参考图踏步门狮 */
function stoneLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.15 * s, 0.028 * s, 0.15 * s, M.stoneD, 0, 0.014 * s, 0));      /* 座一层 */
  g.add(box(0.125 * s, 0.026 * s, 0.125 * s, M.stone, 0, 0.041 * s, 0));     /* 座二层 */
  g.add(box(0.135 * s, 0.02 * s, 0.135 * s, M.stoneD, 0, 0.064 * s, 0));     /* 座面 */
  var body = sph(0.05 * s, M.stone, 0, 0.118 * s, -0.008 * s); body.scale.set(1, 0.9, 1.25); g.add(body);
  var mane = sph(0.036 * s, M.stone, 0, 0.128 * s, 0.045 * s); mane.scale.set(1.15, 1, 0.9); g.add(mane); /* 鬃胸 */
  g.add(sph(0.038 * s, M.stone, 0, 0.172 * s, 0.052 * s));                   /* 头 */
  var e1 = cone(0.014 * s, 0.03 * s, 12, M.stone, 0.022 * s, 0.208 * s, 0.05 * s); e1.rotation.z = -0.3; g.add(e1);
  var e2 = cone(0.014 * s, 0.03 * s, 12, M.stone, -0.022 * s, 0.208 * s, 0.05 * s); e2.rotation.z = 0.3; g.add(e2);
  var f1 = cyl(0.013 * s, 0.015 * s, 0.05 * s, 12, M.stone, 0.026 * s, 0.085 * s, 0.055 * s); g.add(f1); /* 前腿 */
  var f2 = cyl(0.013 * s, 0.015 * s, 0.05 * s, 12, M.stone, -0.026 * s, 0.085 * s, 0.055 * s); g.add(f2);
  var tail = sph(0.02 * s, M.stone, 0, 0.132 * s, -0.072 * s); tail.scale.set(0.9, 0.9, 1.2); g.add(tail); /* 卷尾 */
  g.add(cyl(0.031 * s, 0.031 * s, 0.008 * s, 12, M.gold, 0, 0.15 * s, 0.05 * s));            /* 金项圈 */
  g.add(sph(0.009 * s, M.gold, 0, 0.128 * s, 0.082 * s));                                    /* 金铃 */
  return g;
}

/* 布雨棚（v2）：斜面板条纹 + 波浪垂幔分片（布褶）+ 斜撑杆 ×2 + 微动动画
 * —— 对位参考图布褶垂边 */
function awningStrip(M, mat, w, depth, anims, phase) {
  var g = grp();
  var a = box(w, 0.022, depth, mat, 0, 0, depth / 2 - 0.02);
  a.rotation.x = 0.42; g.add(a);
  var n = Math.max(4, Math.round(w / 0.16)), i;
  for (i = 0; i < n; i++) {                                              /* 波浪垂幔 */
    var vx = -w / 2 + (i + 0.5) * (w / n);
    var v = box(w / n - 0.012, 0.055, 0.016, mat, vx, -0.045, depth - 0.02);
    v.rotation.x = (i % 2) ? 0.1 : -0.06; g.add(v);
  }
  var s1 = box(0.018, 0.018, depth * 0.92, M.timberD, -(w / 2 - 0.05), -0.028, depth / 2 - 0.02);
  s1.rotation.x = 0.42; g.add(s1);                                       /* 斜撑 ×2 */
  var s2 = box(0.018, 0.018, depth * 0.92, M.timberD, (w / 2 - 0.05), -0.028, depth / 2 - 0.02);
  s2.rotation.x = 0.42; g.add(s2);
  if (anims) {                                                           /* 雨棚布微动（克制） */
    anims.push(function (t) { g.rotation.x = sin(t * 1.4 + (phase || 0)) * 0.014; });
  }
  return g;
}

/* 红伞（v2 + 伞骨 ×4）：杆 + 伞冠 + 顶珠 + 方桌 —— lv4 茶座同族件 */
function parasol(M, mat, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.012 * s, 0.012 * s, 0.34 * s, 12, M.timberD, 0, 0.17 * s, 0));
  var cone1 = cone(0.19 * s, 0.09 * s, 12, mat, 0, 0.375 * s, 0); g.add(cone1);
  var k;                                                                 /* v2 伞骨 ×4 */
  for (k = 0; k < 4; k++) {
    var ra = k * PI / 2;
    var rib = box(0.16 * s, 0.005, 0.01, M.timberD, cos(ra) * 0.08 * s, 0.352 * s, sin(ra) * 0.08 * s);
    rib.rotation.y = -ra; rib.rotation.z = -0.24; g.add(rib);
  }
  g.add(sph(0.02 * s, M.gold, 0, 0.435 * s, 0));
  g.add(box(0.14 * s, 0.02 * s, 0.14 * s, M.timber, 0, 0.01 * s, 0));
  return g;
}

/* 茶座（v2 新增，lv4）：方桌（桌面+桌腿）+ 凳 ×2 + 茶壶 —— 红伞下的茶客席 */
function teaSet(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.055 * s, 0.055 * s, 0.012 * s, 12, M.timber, 0, 0.085 * s, 0));   /* 桌面 */
  g.add(cyl(0.012 * s, 0.016 * s, 0.08 * s, 12, M.timberD, 0, 0.04 * s, 0));    /* 桌腿 */
  g.add(cyl(0.03 * s, 0.034 * s, 0.018 * s, 12, M.timber, 0.085 * s, 0.009 * s, 0.03 * s));  /* 凳1 */
  g.add(cyl(0.03 * s, 0.034 * s, 0.018 * s, 12, M.timber, -0.08 * s, 0.009 * s, -0.035 * s));/* 凳2 */
  var pot = sph(0.02 * s, M.jar, 0, 0.105 * s, 0); pot.scale.y = 0.8; g.add(pot);            /* 茶壶 */
  return g;
}

/* 草坪地坪：草面 + 草沿 + 石板径 + 岩石 + 灌丛 + 草簇 ×2（v2）（参考图绿边石径） */
function padUnit(M, size, depth, anims, phase) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  g.add(box(0.4, 0.012, d * 0.42, M.step, 0, 0.056, d / 2 - d * 0.21));
  var rock = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, rock, size / 2 - 0.3, 0.07, -d / 2 + 0.3);
  var bush = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.bush); put(g, bush, -size / 2 + 0.28, 0.11, d / 2 - 0.32);
  bush.scale.y = 0.8;
  var tuft = cone(0.035, 0.055, 12, M.grassD, -size / 2 + 0.16, 0.075, -d / 2 + 0.22); g.add(tuft);   /* v2 草簇 */
  var tuft2 = cone(0.028, 0.05, 12, M.grassD, size / 2 - 0.14, 0.073, d / 2 - 0.14); g.add(tuft2);
  if (anims) {
    /* 地坪无独立动画，占位保持接口一致 */
  }
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：茅草初创屋 + 竹丛 + 短篱（h≈1.1） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.15));
  /* 竹丛（左右后角，身份件） */
  var b1 = bambooClump(M, 0.78, anims, 0.9); put(g, b1, -0.95, 0.05, -0.72);
  var b2 = bambooClump(M, 0.62, anims, 2.4); put(g, b2, 0.92, 0.05, -0.78);
  /* 台基 + 墙体（深木构架 + 米白抹灰） */
  g.add(box(1.34, 0.09, 1.06, M.stoneD, -0.06, 0.045, -0.04));
  g.add(box(1.12, 0.54, 0.86, M.plaster, -0.06, 0.36, -0.04));
  /* 四角木柱 + 前檐枋（构架外露=立面语汇） */
  [[-0.64, -0.49], [0.52, -0.49], [-0.64, 0.41], [0.52, 0.41]].forEach(function (c) {
    g.add(box(0.065, 0.56, 0.065, M.timber, c[0], 0.37, c[1]));
  });
  g.add(box(1.26, 0.07, 0.06, M.timberD, -0.06, 0.66, 0.44));
  /* 双扇木门（中偏左）+ 门楣金匾条 + 门簪 ×2（v2）+ 格窗（右，v2 带团花） */
  g.add(box(0.42, 0.46, 0.05, M.timberD, -0.2, 0.32, 0.395));
  g.add(box(0.3, 0.36, 0.055, M.timber, -0.2, 0.29, 0.4));
  g.add(box(0.045, 0.3, 0.06, M.fascia, -0.2, 0.29, 0.404));
  g.add(sph(0.014, M.gold, -0.26, 0.42, 0.43));
  g.add(sph(0.014, M.gold, -0.14, 0.42, 0.43));
  g.add(box(0.48, 0.07, 0.07, M.timberD, -0.2, 0.585, 0.41));
  g.add(box(0.34, 0.045, 0.05, M.goldwood, -0.2, 0.585, 0.43));
  g.add(cyl(0.02, 0.02, 0.03, 12, M.gold, -0.3, 0.635, 0.44));            /* 门簪 ×2 */
  g.add(cyl(0.02, 0.02, 0.03, 12, M.gold, -0.1, 0.635, 0.44));
  var win = latticeWindow(M, 0.26, 0.26, { rows: 2, cols: 3 }); put(g, win, 0.28, 0.42, 0.4);
  /* 茅草顶（原木卷脊 + 草 course + 流苏分片 + 竹竿斜撑） */
  var roof = thatchRoof(M, { w: 1.16, d: 0.9, h: 0.3, over: 0.1 });
  put(g, roof, -0.06, 0.65, -0.04);
  /* 檐下灯笼（v2 带金箍挂绳） */
  var lt = lantern(M, 0.72, anims, 0.5); put(g, lt, 0.05, 0.56, 0.46);
  /* 门口石阶 + 水缸（v2 加缸沿） */
  g.add(box(0.44, 0.05, 0.2, M.stoneD, -0.2, 0.115, 0.52));
  g.add(box(0.36, 0.045, 0.16, M.stone, -0.2, 0.16, 0.55));
  g.add(cyl(0.07, 0.085, 0.14, 12, M.jar, 0.66, 0.16, 0.5));
  g.add(cyl(0.088, 0.08, 0.024, 12, M.stoneD, 0.66, 0.24, 0.5));          /* 缸沿 */
  /* 右前短篱（v2 加密一根 + 双横杆） */
  var i;
  for (i = 0; i < 4; i++) g.add(box(0.035, 0.2, 0.035, M.timber, 0.52 + i * 0.17, 0.16, 0.9));
  g.add(box(0.6, 0.025, 0.03, M.timberD, 0.7, 0.2, 0.9));
  g.add(box(0.6, 0.025, 0.03, M.timberD, 0.7, 0.13, 0.9));
  /* 暖光窗芯呼吸 */
  var pm = M.pane;
  anims.push(function (t) { pm.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：两层商铺（敞口店面 + 靛蓝雨棚垂幔 + 镂空雕栏 + 大瓦顶垂脊椽头）（h≈1.62） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.2));
  var b1 = bambooClump(M, 0.95, anims, 1.3); put(g, b1, -1.05, 0.05, -0.68);
  var b2 = bambooClump(M, 0.8, anims, 2.9); put(g, b2, 1.0, 0.05, -0.75);
  /* 台基 + 一层墙体 */
  g.add(box(1.62, 0.09, 1.06, M.stoneD, -0.14, 0.045, -0.04));
  g.add(box(1.5, 0.56, 0.92, M.plaster, -0.14, 0.37, -0.04));
  /* 一层前脸：左敞口店面（暖光内退 + 柜台 + 货架/货物 v2 加密）+ 右双扇门 */
  g.add(box(0.86, 0.42, 0.1, M.ink, -0.48, 0.31, 0.38));
  g.add(box(0.74, 0.3, 0.06, M.glow, -0.48, 0.27, 0.36));
  g.add(box(0.78, 0.05, 0.14, M.timber, -0.48, 0.16, 0.44));
  g.add(box(0.7, 0.035, 0.05, M.timber, -0.48, 0.42, 0.34));              /* v2 后货架 */
  g.add(sph(0.035, M.jar, -0.66, 0.24, 0.42));
  g.add(sph(0.03, M.goods, -0.42, 0.22, 0.43));
  g.add(sph(0.026, M.goods, -0.34, 0.21, 0.43));
  g.add(box(0.05, 0.07, 0.05, M.goods, -0.58, 0.215, 0.43));              /* v2 货箱 ×2 */
  g.add(box(0.05, 0.05, 0.05, M.jar, -0.5, 0.205, 0.435));
  g.add(box(0.4, 0.44, 0.05, M.timberD, 0.18, 0.31, 0.395));
  g.add(box(0.28, 0.34, 0.055, M.timber, 0.18, 0.28, 0.4));
  g.add(box(0.045, 0.28, 0.06, M.fascia, 0.18, 0.28, 0.404));
  g.add(box(0.44, 0.06, 0.07, M.timberD, 0.18, 0.56, 0.41));
  g.add(box(0.3, 0.04, 0.05, M.goldwood, 0.18, 0.56, 0.43));
  g.add(cyl(0.018, 0.018, 0.028, 12, M.gold, 0.08, 0.605, 0.44));         /* v2 门簪 ×2 */
  g.add(cyl(0.018, 0.018, 0.028, 12, M.gold, 0.28, 0.605, 0.44));
  /* 靛蓝布雨棚（店面之上，v2 波浪垂幔 + 撑杆 + 微动） */
  var awn = awningStrip(M, M.awnI, 0.92, 0.34, anims, 0.3); put(g, awn, -0.48, 0.5, 0.42);
  /* 层间木枋 + 二层墙 */
  g.add(box(1.58, 0.06, 1.0, M.timberD, -0.14, 0.68, -0.04));
  g.add(box(1.46, 0.46, 0.88, M.plaster, -0.14, 0.94, -0.04));
  /* 二层角柱 + 雕花格窗 ×2 + 镂空雕栏（v2 真镂空） */
  [[-0.82, 0.4], [0.54, 0.4], [-0.82, -0.48], [0.54, -0.48]].forEach(function (c) {
    g.add(box(0.06, 0.5, 0.06, M.timber, c[0], 0.94, c[1]));
  });
  var w1 = latticeWindow(M, 0.3, 0.28, { rows: 2, cols: 3 }); put(g, w1, -0.44, 0.96, 0.415);
  var w2 = latticeWindow(M, 0.3, 0.28, { rows: 2, cols: 3 }); put(g, w2, 0.16, 0.96, 0.415);
  var balc = carvedBalcony(M, 1.44); put(g, balc, -0.14, 0.71, 0.46);
  /* 大瓦顶（檐角大起翘 + 浅灰脊卷尾 + v2 垂脊 ×4 + 椽头排） */
  var roof = tileRoof(M, { w: 1.5, d: 1.02, h: 0.26, over: 0.12, ridgeW: 0.66, rafters: true });
  put(g, roof, -0.14, 1.2, -0.04);                                   /* apex≈1.56 */
  /* 灯笼 ×2（雕栏端头，v2 金箍挂绳） */
  var l1 = lantern(M, 0.62, anims, 0.8); put(g, l1, -0.93, 0.62, 0.52);
  var l2 = lantern(M, 0.62, anims, 2.1); put(g, l2, 0.66, 0.62, 0.52);
  /* 石阶 + 陶缸（v2 缸沿）+ 竹 */
  g.add(box(0.44, 0.05, 0.18, M.stoneD, 0.18, 0.115, 0.52));
  g.add(cyl(0.075, 0.09, 0.15, 12, M.jar, 0.56, 0.165, 0.5));
  g.add(cyl(0.095, 0.086, 0.024, 12, M.stoneD, 0.56, 0.252, 0.5));
  g.add(box(0.3, 0.045, 0.16, M.step, -0.48, 0.115, 0.62));
  /* 暖光呼吸 */
  var gm = M.glow, pm = M.pane;
  anims.push(function (t) {
    gm.emissiveIntensity = 0.42 + 0.1 * sin(t * 1.0 + 0.4);
    pm.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.1 + 0.8);
  });
  return g;
}

/* ---- lv3 大厦：三层退台楼阁（垂脊挑檐）+ 侧塔 + 青布雨棚玻璃橱窗（竖梃分格）+ 顶部露台（h≈2.1） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  var b1 = bambooClump(M, 1.35, anims, 1.1); put(g, b1, -1.1, 0.05, -0.6);
  var b2 = bambooClump(M, 1.1, anims, 2.6); put(g, b2, 1.08, 0.05, -0.72);
  var fx = -0.3;   /* 主楼轴 */
  /* 台基 + 一层（店面层） */
  g.add(box(1.66, 0.09, 1.08, M.stoneD, fx, 0.045, -0.02));
  g.add(box(1.54, 0.56, 0.96, M.plaster, fx, 0.37, -0.02));
  /* 一层前脸：左木门金匾条+门簪 + 右玻璃橱窗（幕墙萌芽，v2 竖梃分格）+ 青布雨棚（垂幔） */
  g.add(box(0.36, 0.44, 0.05, M.timberD, fx - 0.44, 0.33, 0.445));
  g.add(box(0.26, 0.34, 0.055, M.timber, fx - 0.44, 0.31, 0.45));
  g.add(box(0.045, 0.28, 0.06, M.fascia, fx - 0.44, 0.31, 0.454));
  g.add(box(0.42, 0.06, 0.07, M.timberD, fx - 0.44, 0.58, 0.46));
  g.add(box(0.3, 0.04, 0.05, M.goldwood, fx - 0.44, 0.58, 0.48));
  g.add(cyl(0.018, 0.018, 0.028, 12, M.gold, fx - 0.55, 0.625, 0.49));    /* v2 门簪 ×2 */
  g.add(cyl(0.018, 0.018, 0.028, 12, M.gold, fx - 0.33, 0.625, 0.49));
  var awnT = awningStrip(M, M.awnT, 0.78, 0.3, anims, 1.7); put(g, awnT, fx + 0.32, 0.52, 0.44);
  g.add(box(0.62, 0.34, 0.06, M.ink, fx + 0.32, 0.29, 0.435));
  var disp = mesh(new THREE.BoxGeometry(0.52, 0.24, 0.02), M.glass);
  disp.position.set(fx + 0.32, 0.28, 0.45); g.add(disp);
  var k;                                                                   /* v2 橱窗竖梃 ×3 + 横梁 */
  for (k = 0; k < 3; k++) {
    g.add(box(0.016, 0.24, 0.028, M.timberD, fx + 0.13 + k * 0.19, 0.28, 0.462));
  }
  g.add(box(0.52, 0.016, 0.028, M.timberD, fx + 0.32, 0.28, 0.462));
  g.add(box(0.56, 0.03, 0.09, M.timber, fx + 0.32, 0.14, 0.45));
  g.add(box(0.66, 0.05, 0.05, M.timberD, fx + 0.32, 0.485, 0.45));
  /* 入口披檐（小瓦顶） */
  var porch = tileRoof(M, { w: 0.5, d: 0.42, h: 0.11, over: 0.08, ridgeW: 0.2, noFasciaB: true, noLifts: true, hips: false });
  put(g, porch, fx - 0.44, 0.63, 0.32);
  /* 二层 + 镂空雕栏（v2）+ 格窗 ×2 */
  g.add(box(1.6, 0.055, 1.02, M.timberD, fx, 0.675, -0.02));
  g.add(box(1.42, 0.46, 0.9, M.plaster, fx, 0.915, -0.03));
  g.add(box(0.06, 0.5, 0.06, M.timber, fx - 0.68, 0.92, 0.42));
  g.add(box(0.06, 0.5, 0.06, M.timber, fx + 0.68, 0.92, 0.42));
  g.add(box(0.06, 0.5, 0.06, M.timber, fx - 0.68, 0.92, -0.46));
  g.add(box(0.06, 0.5, 0.06, M.timber, fx + 0.68, 0.92, -0.46));
  var w1 = latticeWindow(M, 0.32, 0.28, { rows: 2, cols: 3 }); put(g, w1, fx - 0.34, 0.93, 0.43);
  var w2 = latticeWindow(M, 0.32, 0.28, { rows: 2, cols: 3 }); put(g, w2, fx + 0.34, 0.93, 0.43);
  var balc2 = carvedBalcony(M, 1.42); put(g, balc2, fx, 0.705, 0.47);
  var a2 = tileRoof(M, { w: 1.48, d: 0.66, h: 0.13, over: 0.1, ridgeW: 0.6, noFasciaB: true, noLifts: true });
  put(g, a2, fx, 0.7, 0.1);                                          /* 二层腰檐（v2 带垂脊） */
  /* 三层（退台）+ 镂空雕栏 + 格窗 ×2 */
  g.add(box(1.42, 0.05, 0.94, M.timberD, fx, 1.165, -0.04));
  g.add(box(1.26, 0.44, 0.82, M.plaster, fx, 1.395, -0.05));
  g.add(box(0.06, 0.48, 0.06, M.timber, fx - 0.6, 1.4, 0.36));
  g.add(box(0.06, 0.48, 0.06, M.timber, fx + 0.6, 1.4, 0.36));
  g.add(box(0.06, 0.48, 0.06, M.timber, fx - 0.6, 1.4, -0.42));
  g.add(box(0.06, 0.48, 0.06, M.timber, fx + 0.6, 1.4, -0.42));
  var w3 = latticeWindow(M, 0.28, 0.26, { rows: 2, cols: 3 }); put(g, w3, fx - 0.3, 1.41, 0.365);
  var w4 = latticeWindow(M, 0.28, 0.26, { rows: 2, cols: 3 }); put(g, w4, fx + 0.3, 1.41, 0.365);
  var balc3 = carvedBalcony(M, 1.26); put(g, balc3, fx, 1.19, 0.4);
  /* 顶层大瓦顶（v2 垂脊+椽头）+ 顶部露台（腰檐顶面） */
  var a3 = tileRoof(M, { w: 1.34, d: 0.6, h: 0.14, over: 0.1, ridgeW: 0.5, noFasciaB: true, noLifts: true, rafters: true });
  put(g, a3, fx, 1.2, 0.02);
  var top = tileRoof(M, { w: 1.2, d: 0.94, h: 0.28, over: 0.12, ridgeW: 0.5, big: true });
  put(g, top, fx, 1.63, -0.05);                                      /* 宝顶≈2.1 */
  /* 露台（v2 加望柱矮栏）：栏杆柱 + 盆栽 + 米色茶伞（v2 伞骨） */
  g.add(box(1.3, 0.03, 0.06, M.goldwood, fx, 1.345, 0.34));
  g.add(box(1.3, 0.03, 0.05, M.goldwood, fx, 1.345, -0.32));
  g.add(box(0.026, 0.09, 0.026, M.carved, fx - 0.6, 1.32, 0.34));          /* v2 望柱 ×4 */
  g.add(box(0.026, 0.09, 0.026, M.carved, fx + 0.6, 1.32, 0.34));
  g.add(box(0.026, 0.09, 0.026, M.carved, fx - 0.6, 1.32, -0.32));
  g.add(box(0.026, 0.09, 0.026, M.carved, fx + 0.6, 1.32, -0.32));
  g.add(cyl(0.05, 0.06, 0.09, 12, M.jar, fx - 0.52, 1.325, 0.24));
  var pb = mesh(new THREE.IcosahedronGeometry(0.06, 0), M.bush); put(g, pb, fx - 0.52, 1.4, 0.24); pb.scale.y = 0.85;
  var umb = parasol(M, M.umbrellaC, 0.9); put(g, umb, fx + 0.38, 1.36, -0.1);
  /* 右后侧塔：两层 + 檐（v2 垂脊）+ 小瓦顶（退台族谱） */
  var tx = 0.68, tz = -0.3;
  g.add(box(0.72, 0.07, 0.8, M.stoneD, tx, 0.035, tz));
  g.add(box(0.64, 1.5, 0.72, M.plaster, tx, 0.82, tz));
  g.add(box(0.7, 0.05, 0.78, M.timberD, tx, 1.06, tz));
  var tw1 = latticeWindow(M, 0.18, 0.2, { rows: 2, cols: 2 }); tw1.rotation.y = PI / 2; put(g, tw1, tx + 0.335, 1.32, tz);
  var tw2 = latticeWindow(M, 0.18, 0.2, { rows: 2, cols: 2 }); tw2.rotation.y = PI / 2; put(g, tw2, tx + 0.335, 0.62, tz);
  var tw3 = latticeWindow(M, 0.18, 0.2, { rows: 2, cols: 2 }); put(g, tw3, tx, 0.62, tz + 0.375);
  var tRoof = tileRoof(M, { w: 0.6, d: 0.68, h: 0.16, over: 0.09, ridgeW: 0.26, noLifts: true });
  put(g, tRoof, tx, 1.6, tz);                                        /* 塔顶≈1.86 */
  /* 灯笼 ×6（檐下/雕栏端头/塔檐，v2 金箍挂绳） */
  var l1 = lantern(M, 0.56, anims, 0.6); put(g, l1, fx - 0.62, 0.56, 0.5);
  var l2 = lantern(M, 0.56, anims, 1.9); put(g, l2, fx + 0.78, 0.56, 0.5);
  var l3 = lantern(M, 0.52, anims, 2.8); put(g, l3, fx - 0.78, 1.06, 0.48);
  var l4 = lantern(M, 0.52, anims, 4.0); put(g, l4, fx + 0.78, 1.06, 0.48);
  var l5 = lantern(M, 0.5, anims, 5.1); put(g, l5, tx - 0.4, 1.5, tz + 0.4);
  var l6 = lantern(M, 0.5, anims, 6.2); put(g, l6, fx - 0.72, 1.55, 0.34);
  /* 石阶（v2 贴地两步）+ 陶缸（v2 缸沿） */
  g.add(box(0.42, 0.05, 0.18, M.stoneD, fx - 0.44, 0.115, 0.5));
  g.add(box(0.42, 0.04, 0.16, M.step, fx - 0.44, 0.07, 0.64));
  g.add(cyl(0.07, 0.085, 0.14, 12, M.jar, fx + 0.82, 0.16, 0.52));
  g.add(cyl(0.088, 0.08, 0.024, 12, M.stoneD, fx + 0.82, 0.24, 0.52));
  /* 暖光呼吸（店面 glow + 格窗 pane + 橱窗玻璃 emissive） */
  var gm = M.glow, pm = M.pane, dm = M.glass;
  anims.push(function (t) {
    gm.emissiveIntensity = 0.42 + 0.1 * sin(t * 1.0 + 0.4);
    pm.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.1 + 0.8);
    dm.emissiveIntensity = 0.38 + 0.1 * sin(t * 0.9 + 0.5);
  });
  return g;
}

/* ---- lv4 地标：石台基垂带踏步（贴地+鼓石）+ 石狮整装 + 红伞茶座 + 中央玻璃幕墙
 *      圆筒（14 梃 5 环梁 3 楼板）+ 两翼雕栏层楼 + 门楼金匾描边 + 顶冠环廊（h≈2.9） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.4));
  var b1 = bambooClump(M, 1.3, anims, 1.2); put(g, b1, -1.12, 0.05, -0.8);
  var b2 = bambooClump(M, 1.15, anims, 2.7); put(g, b2, 1.12, 0.05, -0.85);
  /* 石台基 + 垂带踏步（v2：三步贴地降落 + 垂带斜梁 ×2 + 垂带鼓石 ×2） */
  g.add(box(2.06, 0.16, 1.66, M.stone, 0, 0.08, -0.06));
  g.add(box(2.14, 0.05, 1.72, M.stoneD, 0, 0.025, -0.06));
  g.add(box(0.66, 0.055, 0.16, M.step, 0, 0.1325, 0.72));            /* 上步（贴台沿） */
  g.add(box(0.66, 0.05, 0.16, M.step, 0, 0.105, 0.86));              /* 中步 */
  g.add(box(0.66, 0.05, 0.17, M.step, 0, 0.0775, 1.02));             /* 下步（落地） */
  var cb1 = box(0.08, 0.1, 0.38, M.stoneD, -0.36, 0.105, 0.875);     /* v2 垂带 ×2 */
  cb1.rotation.x = 0.32; g.add(cb1);
  var cb2 = box(0.08, 0.1, 0.38, M.stoneD, 0.36, 0.105, 0.875);
  cb2.rotation.x = 0.32; g.add(cb2);
  g.add(cyl(0.05, 0.058, 0.05, 12, M.stone, -0.36, 0.165, 0.71));    /* v2 鼓石 ×2 */
  g.add(cyl(0.05, 0.058, 0.05, 12, M.stone, 0.36, 0.165, 0.71));
  /* 石狮一对（踏步两侧，v2 须弥座整装） */
  put(g, stoneLion(M, 1.1), -0.52, 0.16, 0.78);
  put(g, stoneLion(M, 1.1), 0.52, 0.16, 0.78);
  /* 红伞茶座 ×2（v2 伞骨 + 伞下茶座）+ 盆栽 */
  var u1 = parasol(M, M.umbrella, 1.0); put(g, u1, -0.86, 0.16, 0.55);
  var u2 = parasol(M, M.umbrella, 1.0); put(g, u2, 0.86, 0.16, 0.55);
  var t1 = teaSet(M, 1.0); put(g, t1, -0.86, 0.165, 0.72);
  var t2 = teaSet(M, 1.0); put(g, t2, 0.86, 0.165, 0.72);
  var p1 = cyl(0.055, 0.065, 0.1, 12, M.jar, -0.56, 0.21, 0.38);
  g.add(p1);
  var pb1 = mesh(new THREE.IcosahedronGeometry(0.065, 0), M.bush); put(g, pb1, -0.56, 0.31, 0.38); pb1.scale.y = 0.85;
  var p2 = cyl(0.055, 0.065, 0.1, 12, M.jar, 0.56, 0.21, 0.38);
  g.add(p2);
  var pb2 = mesh(new THREE.IcosahedronGeometry(0.065, 0), M.bush); put(g, pb2, 0.56, 0.31, 0.38); pb2.scale.y = 0.85;
  /* 中央入口门楼（金匾拱门 + 双开门 v2 门环/门簪）+ 门楼小瓦顶（垂脊椽头） */
  g.add(box(0.98, 0.72, 0.4, M.plaster, 0, 0.52, 0.4));
  g.add(box(0.42, 0.5, 0.08, M.ink, 0, 0.41, 0.615));
  g.add(box(0.17, 0.42, 0.06, M.timber, -0.1, 0.37, 0.63));
  g.add(box(0.17, 0.42, 0.06, M.timber, 0.1, 0.37, 0.63));
  var arch = cyl(0.2, 0.2, 0.06, 14, M.timberD, 0, 0.62, 0.615);
  arch.rotation.x = PI / 2; g.add(arch);
  g.add(cyl(0.022, 0.022, 0.028, 12, M.gold, -0.14, 0.63, 0.655));   /* v2 门簪 ×2 */
  g.add(cyl(0.022, 0.022, 0.028, 12, M.gold, 0.14, 0.63, 0.655));
  var kr1 = mesh(new THREE.TorusGeometry(0.024, 0.006, 8, 14), M.gold); put(g, kr1, -0.15, 0.36, 0.665);  /* v2 门环 ×2 */
  var kr2 = mesh(new THREE.TorusGeometry(0.024, 0.006, 8, 14), M.gold); put(g, kr2, 0.15, 0.36, 0.665);
  g.add(box(0.9, 0.05, 0.09, M.timberD, 0, 0.895, 0.6));
  var plq = plaque(M, 0.62, 0.17); put(g, plq, 0, 0.895, 0.65);
  var gate = tileRoof(M, { w: 1.06, d: 0.5, h: 0.15, over: 0.11, ridgeW: 0.4, noFasciaB: true, rafters: true });
  put(g, gate, 0, 0.92, 0.42);
  /* 中央玻璃幕墙圆筒（v2：竖梃 14 + 环梁 5 + 筒内楼板 3，暖光楼层呼吸） */
  var drum = glassDrum(M, 0.4, 1.4, anims, 14);
  put(g, drum, 0, 1.62, -0.14);                                      /* 0.92 → 2.32 */
  /* 两翼层楼（各两层：木构架抹灰 + v2 镂空雕栏 + 格窗 + 翼顶垂脊） */
  [[-1], [1]].forEach(function (sd) {
    var wx = sd[0] * 0.74;
    g.add(box(0.52, 0.05, 0.9, M.stoneD, wx, 0.185, -0.12));
    g.add(box(0.46, 0.52, 0.84, M.plaster, wx, 0.47, -0.12));        /* 翼一层 0.21-0.73 */
    g.add(box(0.52, 0.045, 0.9, M.timberD, wx, 0.745, -0.12));
    g.add(box(0.44, 0.44, 0.8, M.plaster, wx, 0.985, -0.13));        /* 翼二层 0.77-1.2 */
    var ww1 = latticeWindow(M, 0.2, 0.22, { rows: 2, cols: 2 }); put(g, ww1, wx + sd[0] * 0.05, 0.44, 0.315);
    var ww2 = latticeWindow(M, 0.18, 0.2, { rows: 1, cols: 2 }); put(g, ww2, wx + sd[0] * 0.05, 0.98, 0.29);
    var balcW = carvedBalcony(M, 0.44); put(g, balcW, wx, 0.775, 0.32);
    var roofW = tileRoof(M, { w: 0.52, d: 0.9, h: 0.16, over: 0.09, ridgeW: 0.2 });
    put(g, roofW, wx, 1.21, -0.12);                                  /* 翼顶≈1.45 */
    /* 翼与圆筒之间的连檐 */
    var link = tileRoof(M, { w: 0.34, d: 0.62, h: 0.1, over: 0.07, ridgeW: 0.12, noFasciaB: true, noLifts: true, hips: false });
    put(g, link, sd[0] * 0.44, 1.32, -0.1);
  });
  /* 灯笼族：门楼 ×2（v2 挂入摆动组）+ 两翼各 ×2 + 顶冠 ×2 */
  var sway = grp(); sway.position.set(0, 0.86, 0.66); g.add(sway);
  var l1 = lantern(M, 0.6, anims, 0.4); put(sway, l1, -0.56, -0.14, 0);
  var l2 = lantern(M, 0.6, anims, 1.6); put(sway, l2, 0.56, -0.14, 0);
  var l3 = lantern(M, 0.52, anims, 2.4); put(g, l3, -0.74, 1.02, 0.36);
  var l4 = lantern(M, 0.52, anims, 3.3); put(g, l4, 0.74, 1.02, 0.36);
  var l5 = lantern(M, 0.48, anims, 4.2); put(g, l5, -1.02, 1.28, 0.34);
  var l6 = lantern(M, 0.48, anims, 5.1); put(g, l6, 1.02, 1.28, 0.34);
  /* 顶冠：环廊（金栏 v2 双环）+ 冠顶瓦（v2 垂脊椽头脊兽）+ 金宝珠 */
  var ring = grp(); ring.position.set(0, 2.36, -0.14); g.add(ring);
  ring.add(cyl(0.54, 0.54, 0.05, 20, M.timberD, 0, 0, 0));
  var i, nP = 6;
  for (i = 0; i < nP; i++) {
    var a = i * PI * 2 / nP;
    ring.add(box(0.026, 0.11, 0.026, M.carved, cos(a) * 0.5, 0.08, sin(a) * 0.5));
  }
  var rail = mesh(new THREE.TorusGeometry(0.5, 0.014, 6, 20), M.gold);
  rail.rotation.x = PI / 2; rail.position.y = 0.135; ring.add(rail);
  var rail2 = mesh(new THREE.TorusGeometry(0.5, 0.01, 6, 20), M.gold);   /* v2 内环金栏 */
  rail2.rotation.x = PI / 2; rail2.position.y = 0.09; ring.add(rail2);
  var crown = tileRoof(M, { w: 1.06, d: 1.06, h: 0.3, over: 0.13, ridgeW: 0.42, big: true, rafters: true });
  put(g, crown, 0, 2.44, -0.14);                                     /* 宝顶≈2.86 */
  /* 门楼灯笼摆动（克制，v2 实挂双灯） */
  anims.push(function (t) { sway.rotation.z = sin(t * 1.05 + 0.6) * 0.02; });
  /* 暖光呼吸（窗芯 + 店面） */
  var pm = M.pane, gm = M.glow;
  anims.push(function (t) {
    pm.emissiveIntensity = 0.2 + 0.07 * sin(t * 1.05 + 1.1);
    gm.emissiveIntensity = 0.42 + 0.1 * sin(t * 0.95 + 0.2);
  });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[19] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_19_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 19;
  g.userData.level = lv;
  g.userData.region = 'g4';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
