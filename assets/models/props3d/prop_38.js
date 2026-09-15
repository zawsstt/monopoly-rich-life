/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_38.js  (v2 精修版 2026-09-14)
 * -------------------------------------------------------------------------------------
 * 格 38「士林夜市」(g8) 独属建筑：台湾夜市美食街四阶生长史
 * 视觉基准：refs/prop_38.png（四阶一体参考图，唯一视觉真源；img2threejs 流程：
 * blockout→structure→form→material→lighting→interaction→optimization）。
 *
 * 风格族谱（同一块地的同一种生长——夜市美食街，v1 布局/配色/轮廓全部保留）：
 *   lv1 小屋   木造小吃摊车：拼板人字棚 + 灶面锅具蒸汽 + 灯串门柱 + 双灯笼（h≈1.05）
 *   lv2 洋房   横向两开间：绿雨棚 + 红白条纹棚双摊位、二层檐廊、蓝瓦悬山 +
 *              翘窗老虎窗 + 棚顶灯串（h≈1.66）
 *   lv3 大厦   三层砖砌商住楼：奶石砌角 + 暖百叶窗 + 直立金字招牌「士林夜市」 +
 *              蓝雨棚 + 屋顶晒台（灯串 + 脚架水塔）（h≈2.23）
 *   lv4 地标   夜市牌楼 + 三层殿座商楼：翘角青瓦顶层层起台、金龙双踞、
 *              红白大条纹棚下蒸汽食桌、灯笼阵 + 灯串网（h≈2.6）
 *
 * v2 精修（对照参考图逐条清偿，轮廓/配色/布局不动）：
 *   1) 灯泡串升级：暖泡加大 + 金属螺口灯座 + 悬挂短链，悬链管段加密
 *   2) 灯笼升级：挂环 + 挂绳 + 双金箍圈 + 穗珠，红壳呼吸分相位
 *   3) 灶面升级：中锅带盖（微响动画）+ 碗列 + 砧板 + 前板抽屉线 + 蒸汽粒子座（球簇）
 *   4) lv1 柱接棚（消悬空）+ 屋脊端头 + 烤串炭炉（炭火呼吸）
 *   5) lv2 砖砌烟囱 + 老虎窗加脊加侧板 + 雨棚斜撑杆 + 阳台盆栽
 *   6) lv3 砖纹 512px 错缝分区 + 奶石砌角交错块 + 直立招牌托架/顶底帽/描边金字 +
 *      水塔四脚架/斜撑/爬梯/锥顶 + 山墙面暖窗 + 晒台家具
 *   7) lv4 殿顶翘角两段卷 + 金珠尖 + 正脊吻兽对 + 金龙重塑（蜿蜒身/背鳍/双角/双须/前爪）
 *      + 红白大条纹棚高垂边大扇贝 + 台基踏步接石（消悬空）+ 灯笼阵加密
 *   8) 全局：球段 16×12 / 主圆柱段 ≥12 / Canvas 纹理 ≤512px / 共面薄片分离 ≥0.02
 *
 * 材质：MeshStandardMaterial（convertSRGBToLinear）；纹理全部 Canvas 程序化（≤512px）；
 * 光照：不添加灯光，暖光家族（灯笼/灯泡/窗纸/招牌/汤色/炭火）用 emissive 克制表达。
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[38] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 每级 mesh ≤350；group.userData.anim = [fn(t, dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_38] THREE 未定义，请先加载 three.min.js (r147)');
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
    transparent: !!o.opac, opacity: (o.opac !== undefined ? o.opac : 1)
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
function tor(R, tube, mat, x, y, z, seg) { var o = mesh(new THREE.TorusGeometry(R, tube, 6, seg || 14), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
/* 水平环（绕平的 torus）与沿 z 轴圆杆 */
function hring(R, tube, mat, x, y, z, seg) { var o = tor(R, tube, mat, x, y, z, seg); o.rotation.x = PI / 2; return o; }
function zrod(r, len, seg, mat, x, y, z) { var o = cyl(r, r, len, seg, mat, x, y, z); o.rotation.x = PI / 2; return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rx, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}
/* yz 平面内两点间斜杆（雨棚撑杆 / 招牌托架） */
function strut(M, x, y1, z1, y2, z2, r, mat) {
  var dy = y2 - y1, dz = z2 - z1, len = Math.sqrt(dy * dy + dz * dz);
  var o = cyl(r || 0.008, r || 0.008, len, 10, mat || M.steel);
  o.rotation.x = Math.atan2(dz, dy);
  o.position.set(x, (y1 + y2) / 2, (z1 + z2) / 2);
  return o;
}

/* ================= 1. 程序化 Canvas 纹理（≤512px，零外部资源） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 拼木板（lv1 棚面/摊车）：横板明暗 + 板缝 + 旧化噪点（256px） */
function texPlank() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#84786a'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#8d8172' : '#7c7060';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#5c5245'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = 'rgba(255,255,255,0.07)'; g.fillRect(0, y + 1, S, 3);
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 3; k++) {
      var x = (off + k * (S / 3)) % S;
      g.fillStyle = 'rgba(52,46,38,0.5)'; g.fillRect(x, y, 3, rh - 3);
    }
    /* 木纹细丝 */
    for (k = 0; k < 4; k++) {
      g.fillStyle = 'rgba(60,52,42,0.14)';
      g.fillRect(((i * 37 + k * 53) % S), y + 4 + k * (rh / 5), S / 4, 1);
    }
  }
  for (i = 0; i < 260; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(30,26,20,0.10)';
    g.fillRect((i * 43) % S, (i * 61) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 蓝灰石瓦（lv2 顶）：瓦垄横行 + 接头错缝（256px） */
function texSlate() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#56688a'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#5d7094' : '#4f6182';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#3c4c68'; g.fillRect(0, y + rh - 4, S, 4);
    g.fillStyle = '#6d82a8'; g.fillRect(0, y + 1, S, 3);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 5; k++) {
      var x = (off + k * (S / 5)) % S;
      g.fillStyle = 'rgba(44,56,78,0.55)'; g.fillRect(x, y, 3, rh - 4);
      g.fillStyle = 'rgba(120,140,175,0.35)'; g.fillRect(x + 6, y + 2, 3, rh - 8);
    }
  }
  for (i = 0; i < 140; i++) {
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.fillRect((i * 47) % S, (i * 71) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 青瓦（lv3 晒台/lv4 殿顶）：偏绿釉面横垄（256px） */
function texTeal() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#3f7d70'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#478878' : '#39725f';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#2a5247'; g.fillRect(0, y + rh - 4, S, 4);
    g.fillStyle = '#5aa08c'; g.fillRect(0, y + 1, S, 3);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 5; k++) {
      var x = (off + k * (S / 5)) % S;
      g.fillStyle = 'rgba(34,66,54,0.5)'; g.fillRect(x, y, 3, rh - 4);
      g.fillStyle = 'rgba(150,210,185,0.30)'; g.fillRect(x + 7, y + 3, 3, rh - 9);
    }
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = 'rgba(255,255,255,0.05)';
    g.fillRect((i * 47) % S, (i * 71) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 砖墙（lv3）：tan 砖 + 米色缝，错缝顺砌 + 砖色分区（512px） */
function texBrick() {
  var S = 512, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#cdbf9e'; g.fillRect(0, 0, S, S);            /* 砖缝底 */
  var rows = 16, rh = S / rows, bw = S / 8;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    var off = (i % 2) ? -bw / 2 : 0;
    for (k = -1; k < 9; k++) {
      var x = off + k * bw;
      var tone = (i * 7 + k * 5) % 5;
      g.fillStyle = (tone === 0) ? '#9c744e' : (tone === 1) ? '#b08858'
                  : (tone === 2) ? '#a5805a' : (tone === 3) ? '#ab8560' : '#9f7a52';
      g.fillRect(x + 3, y + 3, bw - 6, rh - 6);
      g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(x + 3, y + 3, bw - 6, 3);
      g.fillStyle = 'rgba(70,45,25,0.16)'; g.fillRect(x + 3, y + rh - 7, bw - 6, 4);
    }
  }
  for (i = 0; i < 420; i++) {
    g.fillStyle = (i % 4) ? 'rgba(255,255,255,0.045)' : 'rgba(60,40,22,0.09)';
    g.fillRect((i * 97) % S, (i * 61) % S, 3, 3);
  }
  return toTex(cv, true);
}
/* 红白大条纹棚布：宽竖条 + 布面阴影 + 垂边暗带（512px，lv2 右/lv4 大棚） */
function texStripe() {
  var S = 512, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#ece4d2'; g.fillRect(0, 0, S, S);
  var n = 10, w = S / n;
  for (i = 0; i < n; i++) {
    g.fillStyle = (i % 2) ? '#c8402e' : '#ece4d2';
    g.fillRect(i * w, 0, w, S);
    g.fillStyle = 'rgba(90,30,20,0.13)';
    g.fillRect(i * w + w - 5, 0, 5, S);
    if (i % 2) {
      g.fillStyle = 'rgba(255,255,255,0.10)';
      g.fillRect(i * w + 4, 0, 6, S);
    }
  }
  /* 布纹噪点 */
  for (i = 0; i < 200; i++) {
    g.fillStyle = 'rgba(120,110,90,0.06)';
    g.fillRect((i * 53) % S, (i * 37) % S, 4, 3);
  }
  return toTex(cv, true);
}
/* 直立招牌「士林夜市」：黑框金底 + 描边金字（笔画感）+ 角钉（256×512，lv3） */
function texSignV() {
  var w = 256, h = 512, cv = mkCanvas(w, h), g = cv.getContext('2d'), i;
  g.fillStyle = '#241a0c'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2d98e'; g.fillRect(14, 14, w - 28, h - 28);            /* 金底亮带 */
  g.fillStyle = 'rgba(180,140,60,0.4)'; g.fillRect(14, 296, w - 28, 202); /* 下段金沉 */
  g.fillStyle = 'rgba(255,244,210,0.55)'; g.fillRect(14, 18, w - 28, 10); /* 上高光 */
  g.strokeStyle = '#8a6a24'; g.lineWidth = 7; g.strokeRect(22, 22, w - 44, h - 44);
  g.strokeStyle = 'rgba(138,106,36,0.55)'; g.lineWidth = 2; g.strokeRect(34, 34, w - 68, h - 68);
  [[24, 24], [w - 24, 24], [24, h - 24], [w - 24, h - 24]].forEach(function (p) {
    g.fillStyle = '#7a5a1c'; g.beginPath(); g.arc(p[0], p[1], 5, 0, 6.3); g.fill();
    g.fillStyle = 'rgba(255,240,190,0.5)'; g.beginPath(); g.arc(p[0] - 1, p[1] - 1, 2, 0, 6.3); g.fill();
  });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 88px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  var s = '士林夜市';
  for (i = 0; i < 4; i++) {
    var y = 82 + i * 116;
    g.lineWidth = 12; g.strokeStyle = '#6a4a16'; g.strokeText(s[i], w / 2, y);
    g.fillStyle = '#f5e3ac'; g.fillText(s[i], w / 2 - 3, y - 3);   /* 起笔高光（阴刻感） */
    g.fillStyle = '#3f2c0e'; g.fillText(s[i], w / 2, y);
    g.fillStyle = 'rgba(255,235,170,0.28)'; g.fillText(s[i], w / 2, y + 2);
  }
  return toTex(cv, true);
}
/* 横式牌匾「士林夜市」（lv4 牌楼横枋，512×128） */
function texPlaque() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#241a0c'; g.fillRect(0, 0, w, h);
  g.fillStyle = '#f2d98e'; g.fillRect(8, 8, w - 16, h - 16);
  g.fillStyle = 'rgba(180,140,60,0.4)'; g.fillRect(8, 74, w - 16, 46);    /* 下段金沉 */
  g.fillStyle = 'rgba(255,244,210,0.55)'; g.fillRect(8, 11, w - 16, 7);   /* 上高光 */
  g.strokeStyle = '#8a6a24'; g.lineWidth = 5; g.strokeRect(13, 13, w - 26, h - 26);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 78px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.lineWidth = 10; g.strokeStyle = '#6a4a16'; g.strokeText('士林夜市', w / 2, h / 2 + 4);
  g.fillStyle = '#f5e3ac'; g.fillText('士林夜市', w / 2 - 2, h / 2 + 1);
  g.fillStyle = '#3f2c0e'; g.fillText('士林夜市', w / 2, h / 2 + 4);
  return toTex(cv, true);
}
/* 小黑板（摊车菜单）：墨底 + 粉笔涂鸦 */
function texChalk() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#33342f'; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#6b5a3e'; g.lineWidth = 5; g.strokeRect(2, 2, S - 4, S - 4);
  g.strokeStyle = 'rgba(230,225,210,0.75)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(12, 18); g.lineTo(46, 16); g.stroke();
  g.beginPath(); g.moveTo(12, 30); g.lineTo(52, 29); g.stroke();
  g.beginPath(); g.moveTo(12, 42); g.lineTo(38, 43); g.stroke();
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图取样） */
function Mats() {
  return {
    plank:     MAT('p38plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.82 }); }),
    plankShade:MAT('p38plankS', function () { var t = getTex('plank', texPlank); return std('#b9b0a2', { map: t, bump: t, bumpScale: 0.014, rough: 0.86 }); }),
    slate:     MAT('p38slate', function () { var t = getTex('slate', texSlate); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.7 }); }),
    slateShade:MAT('p38slateS', function () { var t = getTex('slate', texSlate); return std('#a8b2c4', { map: t, bump: t, bumpScale: 0.012, rough: 0.74 }); }),
    teal:      MAT('p38teal', function () { var t = getTex('teal', texTeal); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.62 }); }),
    tealShade: MAT('p38tealS', function () { var t = getTex('teal', texTeal); return std('#9dbcae', { map: t, bump: t, bumpScale: 0.012, rough: 0.66 }); }),
    brick:     MAT('p38brick', function () { var t = getTex('brick', texBrick); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.9 }); }),
    cream:     MAT('p38cream', function () { return std('#d6c8a8', { rough: 0.9 }); }),
    creamD:    MAT('p38creamD', function () { return std('#bfb08c', { rough: 0.92 }); }),
    stone:     MAT('p38stone', function () { return std('#aba79a', { rough: 0.9 }); }),
    stoneD:    MAT('p38stoneD', function () { return std('#8b877b', { rough: 0.92 }); }),
    red:       MAT('p38red', function () { return std('#b03a28', { rough: 0.55 }); }),
    redD:      MAT('p38redD', function () { return std('#8e2e20', { rough: 0.62 }); }),
    stripe:    MAT('p38stripe', function () { var t = getTex('stripe', texStripe); return std('#ffffff', { map: t, rough: 0.8 }); }),
    stripeSd:  MAT('p38stripeSd', function () { var t = getTex('stripe', texStripe); return std('#c9c2b2', { map: t, rough: 0.84 }); }),
    greenF:    MAT('p38greenF', function () { return std('#4a7d52', { rough: 0.8 }); }),
    greenFd:   MAT('p38greenFd', function () { return std('#3c6a44', { rough: 0.84 }); }),
    blueF:     MAT('p38blueF', function () { return std('#4a6f9e', { rough: 0.8 }); }),
    blueFd:    MAT('p38blueFd', function () { return std('#3c5c86', { rough: 0.84 }); }),
    wood:      MAT('p38wood', function () { return std('#8a6a48', { rough: 0.82 }); }),
    woodD:     MAT('p38woodD', function () { return std('#5f4a34', { rough: 0.86 }); }),
    ink:       MAT('p38ink', function () { return std('#2a2e33', { rough: 0.8 }); }),
    gold:      MAT('p38gold', function () { return std('#d8a63c', { rough: 0.3, metal: 0.75 }); }),
    steel:     MAT('p38steel', function () { return std('#8a8f96', { rough: 0.5, metal: 0.6 }); }),
    jade:      MAT('p38jade', function () { return std('#4f8a5e', { rough: 0.5 }); }),
    grass:     MAT('p38grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p38grassD', function () { return std('#698f4c', { rough: 0.95 }); }),
    path:      MAT('p38path', function () { return std('#c6bca4', { rough: 0.95 }); }),
    bush:      MAT('p38bush', function () { return std('#5c8a4a', { rough: 0.95 }); }),
    bamboo:    MAT('p38bamboo', function () { return std('#c8a86a', { rough: 0.8 }); }),
    /* 暖光家族（参考图黄昏光感，emissive 克制） */
    paper:     MAT('p38paper', function () { return std('#f2e6c8', { rough: 0.9, emissive: '#ffd98a', ei: 0.34 }); }),
    soup:      MAT('p38soup', function () { return std('#c8862e', { rough: 0.5, emissive: '#ff9a3c', ei: 0.4 }); }),
    ember:     MAT('p38ember', function () { return std('#d4542a', { rough: 0.7, emissive: '#ff5a20', ei: 0.55 }); }),
    steamM:    function () { return std('#f4f0e8', { rough: 0.9, emissive: '#fff6e8', ei: 0.16, opac: 0.42 }); }
  };
}

/* ================= 2. 预制件（夜市独有语汇） ================= */

/* 红灯笼 v2：挂环 + 挂绳 + 金盖金底 + 红壳 + 双金箍 + 穗珠（材质分 3 相位共享呼吸） */
function lanternMat(phase) {
  return MAT('p38lant' + phase, function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
}
function lantern(M, s, anims, phase) {
  var g = grp(); g.name = 'lantern-set'; s = s || 1;
  var bm = lanternMat(Math.floor(((phase || 0) % 3 + 3)) % 3);
  g.add(tor(0.018 * s, 0.005 * s, M.gold, 0, 0.185 * s, 0, 10));                 /* 挂环 */
  g.add(cyl(0.006 * s, 0.006 * s, 0.055 * s, 8, M.ink, 0, 0.155 * s, 0));        /* 挂绳 */
  g.add(cyl(0.036 * s, 0.05 * s, 0.035 * s, 12, M.gold, 0, 0.115 * s, 0));       /* 金盖 */
  var body = sph(0.085 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  var band1 = tor(0.078 * s, 0.005 * s, M.gold, 0, 0.035 * s, 0); band1.rotation.x = PI / 2; g.add(band1);
  var band2 = tor(0.072 * s, 0.005 * s, M.gold, 0, -0.035 * s, 0); band2.rotation.x = PI / 2; g.add(band2);
  g.add(cyl(0.05 * s, 0.036 * s, 0.035 * s, 12, M.gold, 0, -0.105 * s, 0));      /* 金底 */
  g.add(box(0.012 * s, 0.055 * s, 0.012 * s, M.gold, 0, -0.16 * s, 0));          /* 穗绳 */
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.1 + (phase || 0)); });
  return g;
}

/* 灯串 v2（夜市签名件）：悬链弧线 + 金属螺口灯座 + 悬挂短链 + 暖泡分组呼吸 + 整串微摆 */
function bulbMat(phase) {
  return MAT('p38bulb' + phase, function () { return std('#ffd27a', { rough: 0.3, emissive: '#ffbf5e', ei: 0.85 }); });
}
function bulbString(M, x1, y1, z1, x2, y2, z2, n, anims, phase, bulbR) {
  var g = grp(); g.name = 'bulb-string'; var i;
  var a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2);
  var mid = a.clone().add(b).multiplyScalar(0.5);
  var sag = a.distanceTo(b) * 0.16;
  mid.y -= sag;
  var curve = new THREE.CatmullRomCurve3([a, mid, b]);
  var wire = mesh(new THREE.TubeGeometry(curve, 16, 0.007, 6), M.ink);
  wire.castShadow = false; g.add(wire);
  var pi = Math.floor(((phase || 0) % 3 + 3)) % 3;
  var bm0 = bulbMat(pi), bm1 = bulbMat((pi + 1) % 3);
  var r = bulbR || 0.03;
  for (i = 1; i <= n; i++) {
    var p = curve.getPoint(i / (n + 1));
    var hk = cyl(0.004, 0.004, 0.018, 8, M.ink, p.x, p.y + 0.008, p.z);          /* 悬挂短链 */
    hk.castShadow = false; g.add(hk);
    var sk = cyl(0.011, 0.013, 0.02, 12, M.steel, p.x, p.y - 0.012, p.z);        /* 螺口灯座 */
    sk.castShadow = false; g.add(sk);
    var bulb = sph(r, (i % 2) ? bm0 : bm1, p.x, p.y - 0.012 - r * 0.9, p.z);
    bulb.castShadow = false; g.add(bulb);
  }
  anims.push(function (t) {
    g.rotation.z = sin(t * 1.4 + (phase || 0) * 1.7) * 0.012;
    g.rotation.x = sin(t * 1.1 + (phase || 0)) * 0.008;
    bm0.emissiveIntensity = 0.85 + 0.22 * sin(t * 2.3 + (phase || 0));
    bm1.emissiveIntensity = 0.85 + 0.22 * sin(t * 2.3 + (phase || 0) + 2.1);
  });
  return g;
}

/* 灯串木杆：石础 + 杆 + 顶横担 + 斜撑 + 杆帽 */
function stringPole(M, h, x, z) {
  var g = grp(); g.name = 'bulb-string';
  g.add(cyl(0.032, 0.042, 0.06, 12, M.stoneD, 0, 0.03, 0));
  g.add(cyl(0.02, 0.026, h, 12, M.woodD, 0, h / 2 + 0.05, 0));
  g.add(strut(M, 0.0, 0.1, 0.02, h * 0.45, 0.012, 0.007, M.woodD));
  g.add(box(0.17, 0.03, 0.035, M.woodD, 0, h + 0.03, 0));
  g.add(sph(0.018, M.gold, 0, h + 0.055, 0));
  g.position.set(x, 0, z);
  return g;
}

/* 蒸汽缕：2 段锥叠 + 升起-放大-循环（每缕独立材质与动画） */
function steamWisp(M, x, y, z, s, anims, phase) {
  var g = grp(); g.name = 'pot-steam'; s = s || 1;
  var m = M.steamM();
  var c1 = cone(0.045 * s, 0.14 * s, 10, m, 0, 0.07 * s, 0);
  var c2 = cone(0.032 * s, 0.11 * s, 10, m, 0.012 * s, 0.2 * s, 0.008 * s);
  c1.castShadow = c2.castShadow = false;
  g.add(c1); g.add(c2);
  g.position.set(x, y, z);
  var ph = (phase || 0);
  anims.push(function (t) {
    var k = (t * 0.55 + ph) % 1;                    /* 0..1 循环 */
    g.position.y = y + k * 0.22 * s;
    g.rotation.y = k * 1.2 + ph;
    var sc = 1 + k * 0.5;
    g.scale.set(sc, 1 + k * 0.25, sc);
    m.opacity = 0.42 * (1 - k) * Math.min(1, k / 0.12);
  });
  return g;
}

/* 蒸汽粒子座 v2：三球簇 + 锥柱，成团白汽（升起-放大-循环） */
function steamSeat(M, x, y, z, s, anims, phase) {
  var g = grp(); g.name = 'pot-steam'; s = s || 1;
  var m = M.steamM();
  var puffs = [[0, 0.05, 0, 0.05], [0.032, 0.13, 0.012, 0.038], [-0.028, 0.11, -0.014, 0.032]];
  puffs.forEach(function (p) {
    var b = sph(p[3] * s, m, p[0] * s, p[1] * s, p[2] * s);
    b.castShadow = false; g.add(b);
  });
  var c1 = cone(0.05 * s, 0.16 * s, 10, m, 0, 0.22 * s, 0);
  c1.castShadow = false; g.add(c1);
  g.position.set(x, y, z);
  var ph = (phase || 0);
  anims.push(function (t) {
    var k = (t * 0.45 + ph) % 1;
    g.position.y = y + k * 0.24 * s;
    g.rotation.y = k * 1.4 + ph;
    var sc = 1 + k * 0.6;
    g.scale.set(sc, 1 + k * 0.3, sc);
    m.opacity = 0.4 * (1 - k) * Math.min(1, k / 0.12);
  });
  return g;
}

/* 竹蒸笼塔（参考图摊台蒸笼）：n 层笼 + 笼沿 + 顶盖 */
function steamerTower(M, tiers) {
  var g = grp(); g.name = 'stall-counter'; var i;
  var n = tiers || 2;
  for (i = 0; i < n; i++) {
    g.add(cyl(0.055, 0.055, 0.045, 14, M.bamboo, 0, 0.026 + i * 0.05, 0));
    g.add(hring(0.055, 0.006, M.woodD, 0, 0.026 + i * 0.05, 0, 14));
  }
  g.add(cyl(0.05, 0.058, 0.02, 14, M.bamboo, 0, 0.008, 0));                        /* 底座 */
  g.add(cyl(0.048, 0.052, 0.016, 14, M.woodD, 0, 0.028 + n * 0.05, 0));            /* 顶盖 */
  g.add(sph(0.01, M.woodD, 0, 0.042 + n * 0.05, 0));                               /* 盖钮 */
  return g;
}

/* 摊车灶面 v2（每阶必有）：柜体 + 抽屉线 + 台面 + 锅具（中锅带盖微响）+ 碗列 + 砧板
 * + 蒸汽缕 ×2 + 蒸汽粒子座；局部原点=柜底中心；调用方 put(g, c, x, 0, z) 落位 */
function foodCounter(M, w, y0, anims, phase, npots) {
  var g = grp(); g.name = 'stall-counter'; var i;
  var n = npots || 3;
  g.add(box(w, 0.3, 0.3, M.ink, 0, y0 + 0.15, 0));                       /* 店口阴影 */
  g.add(box(w, 0.2, 0.05, M.plank, 0, y0 + 0.1, 0.15));                  /* 木板前板 */
  g.add(box(w * 0.4, 0.016, 0.008, M.woodD, -w * 0.24, y0 + 0.16, 0.178));/* 抽屉线 ×2 */
  g.add(box(w * 0.4, 0.016, 0.008, M.woodD, w * 0.24, y0 + 0.16, 0.178));
  g.add(box(w + 0.04, 0.045, 0.36, M.woodD, 0, y0 + 0.315, 0.02));       /* 台面 */
  var lid = null;
  for (i = 0; i < n; i++) {                                              /* 锅具：钢身+汤色+柄钮 */
    var px = -w / 2 + (i + 0.5) * (w / n);
    g.add(cyl(0.052, 0.058, 0.05, 12, M.steel, px, y0 + 0.36, 0));
    g.add(cyl(0.042, 0.042, 0.014, 12, M.soup, px, y0 + 0.392, 0));
    g.add(cyl(0.012, 0.016, 0.02, 12, M.steel, px + 0.035, y0 + 0.4, 0.03));
    var hd1 = tor(0.02, 0.005, M.steel, px - 0.06, y0 + 0.37, 0, 10);
    hd1.rotation.x = PI / 2; hd1.rotation.y = PI / 2; g.add(hd1);        /* 双耳锅柄 */
    if (i === Math.floor(n / 2)) {                                       /* 中锅带盖 */
      lid = cyl(0.048, 0.05, 0.012, 12, M.steel, px, y0 + 0.398, 0);
      g.add(lid);
      g.add(sph(0.011, M.ink, px, y0 + 0.412, 0));
    }
  }
  if (lid) {                                                             /* 盖微响（幅度克制） */
    var ly = y0 + 0.398;
    anims.push(function (t) {
      lid.rotation.y = sin(t * 3.1) * 0.05;
      lid.position.y = ly + Math.abs(sin(t * 3.1)) * 0.006;
    });
  }
  for (i = 0; i < 3; i++) {                                              /* 佐料瓶 ×3 */
    g.add(cyl(0.014, 0.016, 0.05, 12, [M.red, M.greenFd, M.bamboo][i], w / 2 - 0.04, y0 + 0.36, 0.09 - i * 0.055));
  }
  for (i = 0; i < 2; i++) {                                              /* 瓷碗列 ×2 */
    g.add(cyl(0.02 - i * 0.004, 0.014, 0.018, 12, M.cream, -w / 2 + 0.06 + i * 0.05, y0 + 0.355, 0.1));
  }
  g.add(box(0.12, 0.016, 0.08, M.plank, -w / 2 + 0.08, y0 + 0.34, -0.08)); /* 砧板 */
  var p1 = -w / 2 + 0.5 * (w / n), p2 = -w / 2 + (n - 0.5) * (w / n);
  g.add(steamWisp(M, p1, y0 + 0.42, 0, 1, anims, ((phase || 0) * 0.37) % 1));
  g.add(steamWisp(M, p2, y0 + 0.42, 0, 0.85, anims, ((phase || 0) * 0.37 + 0.5) % 1));
  g.add(steamSeat(M, 0, y0 + 0.42, 0.02, 0.9, anims, ((phase || 0) * 0.29 + 0.25) % 1));
  return g;
}

/* 木箱堆（两层错缝） */
function crateAt(M, x, z, s, ry) {
  var g = grp(); g.name = 'street-crates'; s = s || 1;
  g.add(box(0.16 * s, 0.13 * s, 0.14 * s, M.plank, 0, 0.065 * s, 0));
  g.add(box(0.13 * s, 0.11 * s, 0.12 * s, M.plankShade, 0.02 * s, 0.185 * s, 0.01 * s));
  if (ry) g.rotation.y = ry;
  g.position.set(x, 0.05, z);
  return g;
}
function stoolAt(M, x, y, z) {
  var g = grp(); g.name = 'street-crates';
  g.add(cyl(0.05, 0.055, 0.025, 12, M.wood, 0, 0.09, 0));
  g.add(cyl(0.018, 0.022, 0.08, 12, M.woodD, 0, 0.04, 0));
  g.add(strut(M, 0.028, 0.02, 0, 0.078, 0.018, 0.006, M.woodD));
  g.position.set(x, y === undefined ? 0.05 : y, z);
  return g;
}
function chalkboardAt(M, x, z, ry) {
  var g = grp(); g.name = 'street-crates';
  g.add(box(0.16, 0.02, 0.12, M.woodD, 0, 0.01, 0));
  var f = mesh(new THREE.PlaneGeometry(0.15, 0.15),
    new THREE.MeshStandardMaterial({ map: getTex('chalk', texChalk), roughness: 0.85, flatShading: true }));
  f.position.set(0, 0.11, 0.012); g.add(f);
  g.add(box(0.15, 0.15, 0.012, M.woodD, 0, 0.11, -0.006));
  if (ry) g.rotation.y = ry; else g.rotation.y = 0.06;
  g.position.set(x, 0.05, z);
  return g;
}

/* 烤串炭炉（lv1，参考图灶边小炉）：铁桶 + 炭火呼吸 + 串烤 ×2 */
function skewerBrazier(M, x, z, anims) {
  var g = grp(); g.name = 'street-crates';
  g.add(cyl(0.055, 0.045, 0.09, 12, M.steel, 0, 0.045, 0));
  var em = cyl(0.042, 0.042, 0.014, 12, M.ember, 0, 0.095, 0);
  g.add(em);
  anims.push(function (t) { M.ember.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.7); });
  var i;
  for (i = 0; i < 2; i++) {
    var sk = cyl(0.004, 0.004, 0.17, 8, M.bamboo, -0.015 + i * 0.03, 0.14, 0.01);
    sk.rotation.z = 0.28; sk.rotation.x = -0.12 - i * 0.1; g.add(sk);
    g.add(sph(0.011, i ? M.red : M.cream, -0.015 + i * 0.03 + 0.024, 0.222, 0.012 - i * 0.012));
  }
  g.position.set(x, 0.05, z);
  return g;
}

/* 扇贝垂边雨棚 v2：斜棚面 + 高垂边 + 大扇贝 + 斜撑杆（stripes:'red' 条纹 | mat 色棚）
 * 局部原点=棚面中心（y 为挂点高度），背缘贴墙 */
function awning(M, o) {
  var g = grp(); g.name = 'awning-row';
  var w = o.w, d = o.d, tilt = o.tilt !== undefined ? o.tilt : 0.34;
  var top = o.stripes === 'red' ? M.stripe : o.mat;
  var under = o.stripes === 'red' ? M.stripeSd : (o.matD || M.creamD);
  var i;
  var slab = box(w, 0.024, d, top, 0, 0, 0); slab.rotation.x = tilt; g.add(slab);
  var noseY = -sin(tilt) * d / 2, noseZ = cos(tilt) * d / 2;
  var vh = o.valance || 0.05;                                            /* 垂边（大条纹棚加高） */
  g.add(box(w, vh, 0.02, under, 0, noseY - vh / 2 + 0.01, noseZ));
  var scR = o.scallop || 0.026;
  var n = Math.max(5, Math.round(w / (scR * 4.6)));
  for (i = 0; i < n; i++) {                                              /* 扇贝半圆片 */
    var sc = cyl(scR, scR, 0.016, 12, under, -w / 2 + (i + 0.5) * (w / n), noseY - vh + 0.008, noseZ);
    sc.rotation.x = PI / 2; g.add(sc);
  }
  if (o.strutX) {                                                        /* 斜撑杆 ×2（组内局部坐标） */
    var wz = o.wallZ - (o.z || 0);
    g.add(strut(M, o.strutX[0] - (o.x || 0), 0.02, wz, noseY + 0.01, noseZ - 0.01, 0.007));
    g.add(strut(M, o.strutX[1] - (o.x || 0), 0.02, wz, noseY + 0.01, noseZ - 0.01, 0.007));
  }
  g.position.set(o.x || 0, o.y, o.z);
  return g;
}

/* 暖光百叶窗 v2：双色框 + 暖纸面 + 十字棂 + 双侧木百叶 + 窗台 + 楣线 */
function glowWindow(M, w, h) {
  var g = grp(); g.name = 'window-glow';
  g.add(box(w + 0.05, h + 0.05, 0.03, M.woodD));
  g.add(box(w + 0.02, h + 0.02, 0.026, M.cream, 0, 0, 0.004));
  g.add(box(w * 0.62, h, 0.03, M.paper, -w * 0.17, 0, 0.008));
  g.add(box(w * 0.18, h, 0.032, M.wood, -w * 0.17, 0, 0.014));
  g.add(box(w * 0.44, 0.022, 0.03, M.wood, -w * 0.17, 0, 0.014));        /* 横棂 */
  g.add(box(w * 0.19, h, 0.03, M.plankShade, w * 0.3, 0, 0.008));
  g.add(box(w * 0.19, h, 0.03, M.plankShade, -w * 0.44, 0, 0.008));
  g.add(box(w + 0.1, 0.03, 0.06, M.cream, 0, -h / 2 - 0.04, 0.01));
  g.add(box(w + 0.06, 0.024, 0.04, M.woodD, 0, h / 2 + 0.037, 0.006));   /* 楣线 */
  return g;
}

/* 石栏阳台：地栿 + 望柱栏板 + 扶手 + 中横档 */
function balconyUnit(M, w, mat) {
  var g = grp(); g.name = 'balcony-row'; var m = mat || M.cream;
  g.add(box(w, 0.035, 0.18, m, 0, 0, 0.09));
  var n = Math.max(4, Math.round(w / 0.14)), i;
  for (i = 0; i <= n; i++) g.add(box(0.024, 0.13, 0.02, m, -w / 2 + i * (w / n), 0.082, 0.17));
  g.add(box(w, 0.02, 0.016, m, 0, 0.082, 0.178));                        /* 中横档 */
  g.add(box(w + 0.03, 0.026, 0.035, M.stoneD, 0, 0.16, 0.17));
  return g;
}

/* 人字拼板棚（lv1，参考图左一）：双坡拼板 + 压板条 + 悬山暗封板 + 脊端头 */
function plankRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.08;
  var g = grp(); g.name = 'roof-system'; var k, i;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, len, k > 0 ? M.plank : M.plankShade, 0, 0, k * len / 2));
    for (i = 1; i < 4; i++) {
      sg.add(box(w + over * 2 + 0.01, 0.018, 0.026, M.woodD, 0, 0.026, k * (i / 4) * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.woodD, 0, -0.004, k * eave));
  }
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  var t1 = mesh(gg, M.ink); t1.rotation.y = PI / 2; t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
  var t2 = mesh(gg, M.ink); t2.rotation.y = -PI / 2; t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  var ridge = grp(); ridge.name = 'ridge-ornaments'; g.add(ridge);
  ridge.add(box(w + over * 2 + 0.05, 0.05, 0.07, M.woodD, 0, h + 0.02, 0));
  ridge.add(box(0.05, 0.07, 0.075, M.ink, (w + over * 2) / 2 - 0.02, h + 0.03, 0));   /* 脊端头 ×2 */
  ridge.add(box(0.05, 0.07, 0.075, M.ink, -(w + over * 2) / 2 + 0.02, h + 0.03, 0));
  return g;
}

/* 蓝灰石瓦悬山（lv2 顶 + 老虎窗小披） */
function slateRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var g = grp(); g.name = 'roof-system'; var k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, len, k > 0 ? M.slate : M.slateShade, 0, 0, k * len / 2));
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.ink, 0, -0.004, k * eave));
    var c1 = box(0.07, 0.05, 0.07, M.ink, (w + over * 2) / 2 - 0.01, 0.045, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ink, -(w + over * 2) / 2 + 0.01, 0.045, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
  }
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  var t1 = mesh(gg, M.creamD); t1.rotation.y = PI / 2; t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
  var t2 = mesh(gg, M.creamD); t2.rotation.y = -PI / 2; t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  var ridge = grp(); ridge.name = 'ridge-ornaments'; g.add(ridge);
  ridge.add(box(w + over * 2 + 0.04, 0.055, 0.08, M.ink, 0, h + 0.028, 0));
  return g;
}

/* 翘角青瓦四坡殿顶 v2（lv4 三层同式逐层收分）：四坡 + 两段卷翘角 + 金珠尖
 * + 正脊吻兽对 + 宝顶金柱金珠 */
function tealHipRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(); g.name = 'roof-system';
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.72 + 0.2, 0.035, lenF, M.teal, 0, 0, lenF / 2));
  sgF.add(box(w * 0.72 + 0.22, 0.05, 0.024, M.ink, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.72 + 0.2, 0.035, lenF, M.tealShade, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.035, d * 0.8, M.tealShade, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.035, d * 0.8, M.teal, -lenS / 2, 0, 0));
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {            /* 四角两段卷翘 + 金珠尖 */
    var sx = c[0], sz = c[1];
    var s1 = box(0.075, 0.05, 0.075, M.ink, sx * (eaveS - 0.03), h + 0.045, sz * (eaveF - 0.03));
    s1.rotation.z = -sx * 0.5; s1.rotation.x = sz * 0.28; g.add(s1);
    var s2 = box(0.05, 0.04, 0.05, M.ink, sx * (eaveS + 0.012), h + 0.088, sz * (eaveF + 0.012));
    s2.rotation.z = -sx * 0.95; s2.rotation.x = sz * 0.55; g.add(s2);
    if (!o.plain) g.add(sph(0.017, M.gold, sx * (eaveS + 0.038), h + 0.118, sz * (eaveF + 0.038)));
  });
  var ridge = grp(); ridge.name = 'ridge-ornaments'; g.add(ridge);
  ridge.add(box(w * 0.5, 0.065, 0.09, M.ink, 0, h + 0.033, 0));            /* 正脊 */
  [[1], [-1]].forEach(function (s) {                                       /* 吻兽对（张口吻） */
    var sx = s[0];
    ridge.add(box(0.045, 0.1, 0.07, M.ink, sx * w * 0.25, h + 0.1, 0));
    var cu = box(0.05, 0.045, 0.06, M.ink, sx * (w * 0.25 + 0.028), h + 0.155, 0);
    cu.rotation.z = -sx * 0.55; ridge.add(cu);
  });
  ridge.add(cyl(0.014, 0.02, 0.07, 12, M.gold, 0, h + 0.14, 0));           /* 宝顶金柱 */
  put(ridge, sph(0.034, M.gold), 0, h + 0.185, 0);                         /* 宝顶金珠 */
  return g;
}

/* 朱红立柱（石础 + 柱身 + 柱头箍） */
function redColumn(M, h, r) {
  var g = grp();
  g.add(cyl(r * 1.35, r * 1.5, 0.04, 12, M.stoneD, 0, 0.02, 0));
  g.add(cyl(r, r, h, 12, M.red, 0, 0.04 + h / 2, 0));
  g.add(hring(r * 1.15, 0.008, M.gold, 0, h - 0.035, 0, 14));
  return g;
}

/* 金龙 v2（lv4 对踞）：蜿蜒串珠身 ×6 + 背鳍列 + 颅吻颌 + 双角双须 + 双目 + 前爪
 * （baseRot 定朝向；摆动 ≤0.06rad） */
function dragonAt(M, s, anims, phase, baseRot) {
  var g = grp(); g.name = 'dragon-set'; var s = s || 1, i;
  for (i = 0; i < 6; i++) {                                /* 蛇身：渐小串珠蜿蜒上升 */
    var u = i / 6;
    var b = sph(0.05 * (1 - u * 0.42) * s, M.gold,
      sin(u * 2.4) * 0.1 * s, u * 0.2 * s + 0.02 * s, cos(u * 2.0) * 0.06 * s);
    b.scale.y = 0.92; g.add(b);
  }
  for (i = 0; i < 4; i++) {                                /* 背鳍列 */
    var u2 = 0.12 + i * 0.18;
    var f = cone(0.014 * s, 0.045 * s, 4, M.jade,
      sin(u2 * 2.4) * 0.1 * s, u2 * 0.2 * s + 0.06 * s, cos(u2 * 2.0) * 0.06 * s);
    f.rotation.z = -0.2; g.add(f);
  }
  var hx = sin(2.4) * 0.1 * s, hy = 0.22 * s, hz = cos(2.0) * 0.06 * s;
  g.add(sph(0.05 * s, M.gold, hx, hy, hz));                              /* 颅 */
  g.add(box(0.075 * s, 0.045 * s, 0.1 * s, M.gold, hx, hy + 0.008 * s, hz + 0.05 * s));  /* 吻 */
  g.add(box(0.05 * s, 0.02 * s, 0.06 * s, M.redD, hx, hy - 0.022 * s, hz + 0.07 * s));   /* 下颌 */
  [[1], [-1]].forEach(function (sd) {                                    /* 双角 / 双须 / 双目 */
    var k = sd[0];
    var h1 = cone(0.012 * s, 0.055 * s, 6, M.jade, hx + k * 0.028 * s, hy + 0.06 * s, hz - 0.005 * s);
    h1.rotation.z = -k * 0.35; h1.rotation.x = -0.25; g.add(h1);
    var ws = cyl(0.004 * s, 0.004 * s, 0.06 * s, 6, M.gold, hx + k * 0.03 * s, hy - 0.005 * s, hz + 0.075 * s);
    ws.rotation.x = 1.2; ws.rotation.z = k * 0.3; g.add(ws);
    g.add(sph(0.009 * s, M.ink, hx + k * 0.026 * s, hy + 0.012 * s, hz + 0.032 * s));
  });
  g.add(box(0.035 * s, 0.03 * s, 0.05 * s, M.gold, hx - 0.02 * s, hy - 0.1 * s, hz + 0.03 * s));  /* 前爪 ×2 */
  g.add(box(0.035 * s, 0.03 * s, 0.05 * s, M.gold, hx + 0.035 * s, hy - 0.06 * s, hz + 0.01 * s));
  var br = (baseRot || 0);
  var ph = (phase || 0);
  anims.push(function (t) { g.rotation.y = br + sin(t * 0.9 + ph) * 0.06; });
  return g;
}

/* 脚架水塔 v2（lv3 屋顶天际线签名件）：四脚架 + 双环箍 + 直爬梯 + 锥顶 + 溢流管 */
function waterTank(M) {
  var g = grp(); g.name = 'water-tank'; var ri;
  [[-0.07, 0.05], [0.07, 0.05], [-0.07, -0.06], [0.07, -0.06]].forEach(function (p) {
    var leg = cyl(0.012, 0.014, 0.12, 12, M.steel, p[0], 0.06, p[1]);
    leg.rotation.z = -p[0] * 1.1; leg.rotation.x = -p[1] * 0.8; g.add(leg);
  });
  g.add(hring(0.085, 0.005, M.steel, 0, 0.05, 0, 16));                    /* 脚架环箍 ×2 */
  g.add(hring(0.085, 0.005, M.steel, 0, 0.09, 0, 16));
  g.add(cyl(0.095, 0.095, 0.19, 14, M.steel, 0, 0.205, 0));
  g.add(cyl(0.1, 0.1, 0.014, 14, M.stoneD, 0, 0.14, 0));
  g.add(cyl(0.1, 0.1, 0.014, 14, M.stoneD, 0, 0.25, 0));
  g.add(cyl(0.099, 0.045, 0.045, 14, M.steel, 0, 0.325, 0));              /* 锥顶 */
  g.add(sph(0.014, M.woodD, 0, 0.35, 0));                                 /* 顶珠 */
  g.add(cyl(0.005, 0.005, 0.2, 8, M.steel, 0.1, 0.1, 0.0));               /* 直爬梯 */
  g.add(cyl(0.005, 0.005, 0.2, 8, M.steel, 0.1, 0.1, 0.035));
  for (ri = 0; ri < 4; ri++) g.add(zrod(0.004, 0.035, 8, M.steel, 0.1, 0.035 + ri * 0.044, 0.0175));
  g.add(cyl(0.008, 0.008, 0.09, 8, M.steel, -0.1, 0.29, 0));              /* 溢流管 */
  return g;
}

/* 草皮基座：草面 + 草沿 + 石板小径 + 草丛 + 灌丛（参考图绿边，每阶必有） */
function padUnit(M, size, depth) {
  var g = grp(); g.name = 'groundscape';
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  g.add(box(0.5, 0.012, 0.5, M.path, 0.05, 0.056, d / 2 - 0.32));
  g.add(box(0.16, 0.012, 0.14, M.path, -0.32, 0.056, d / 2 - 0.14));      /* 踏石 ×2 */
  g.add(box(0.14, 0.012, 0.12, M.path, -0.14, 0.056, d / 2 - 0.52));
  var bush1 = mesh(new THREE.IcosahedronGeometry(0.08, 0), M.bush);
  put(g, bush1, -size / 2 + 0.24, 0.11, d / 2 - 0.26); bush1.scale.y = 0.8;
  var i;
  for (i = 0; i < 3; i++) {                                               /* 草丛锥 ×3 */
    var tf = cone(0.02, 0.06, 6, M.bush, size / 2 - 0.16 - i * 0.09, 0.08, -d / 2 + 0.18 + (i % 2) * 0.1);
    tf.rotation.z = (i - 1) * 0.12; g.add(tf);
  }
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→lighting→interaction） ================= */

/* ---- lv1 小屋：木造小吃摊车（h≈1.06） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.2, 2.0));
  /* 摊车地台 + 围板 */
  g.add(box(1.6, 0.1, 1.05, M.wood, -0.05, 0.09, -0.1));
  g.add(box(1.5, 0.05, 0.04, M.woodD, -0.05, 0.135, 0.42));
  /* 四角木柱（后两根承棚，前两根挑檐；v2 柱顶接棚底，消悬空） */
  [[-0.72, -0.42, 0.72], [0.62, -0.42, 0.72], [-0.72, 0.3, 0.6], [0.62, 0.3, 0.6]].forEach(function (c) {
    g.add(box(0.07, c[2], 0.07, M.woodD, c[0], 0.14 + c[2] / 2, c[1]));
  });
  /* 背墙 + 侧挂巾 + 挂钩杆 */
  g.add(box(1.44, 0.44, 0.045, M.plankShade, -0.05, 0.36, -0.44));
  g.add(box(0.3, 0.2, 0.02, M.red, -0.35, 0.42, -0.41));
  g.add(box(0.3, 0.2, 0.02, M.greenFd, 0.05, 0.42, -0.41));
  g.add(zrod(0.008, 1.2, 8, M.woodD, -0.05, 0.53, -0.4));             /* 挂钩杆 */
  /* 灶面摊台（锅具带盖 + 蒸汽 + 蒸汽粒子座 + 佐料 + 碗列） */
  var counter = foodCounter(M, 1.24, 0.14, anims, 1, 3);
  put(g, counter, -0.05, 0, 0.34);
  /* 棚边竹蒸笼塔 ×2（参考图台面蒸笼） */
  put(g, steamerTower(M, 2), 0.72, 0.14, 0.3);
  put(g, steamerTower(M, 3), -0.78, 0.14, 0.28);
  /* 人字拼板棚（悬山，apex≈0.99，含脊端头） */
  var roof = plankRoof(M, { w: 1.7, d: 1.1, h: 0.22, over: 0.09 });
  put(g, roof, -0.05, 0.76, -0.06);
  /* 灯串门柱 ×2 + 双弧灯串（夜市签名，金属灯座灯泡） */
  g.add(stringPole(M, 1.0, -1.0, 0.62));
  g.add(stringPole(M, 1.0, 0.94, 0.62));
  g.add(bulbString(M, -0.97, 1.0, 0.62, 0.91, 1.0, 0.62, 9, anims, 0));
  g.add(bulbString(M, -0.97, 0.9, 0.62, 0.91, 0.9, 0.62, 7, anims, 2, 0.024));
  /* 檐角红灯笼 ×2（带挂绳指向棚檐） */
  var l1 = lantern(M, 0.7, anims, 0.5); put(g, l1, -0.66, 0.62, 0.5);
  var l2 = lantern(M, 0.7, anims, 2.2); put(g, l2, 0.56, 0.62, 0.5);
  /* 街景：木箱堆 ×2 + 凳 ×2 + 小黑板 + 烤串炭炉（炭火呼吸） */
  g.add(crateAt(M, 0.92, 0.28, 1.0, 0.3));
  g.add(crateAt(M, 1.02, -0.02, 0.8, -0.2));
  g.add(stoolAt(M, -0.82, undefined, 0.72));
  g.add(stoolAt(M, -0.6, undefined, 0.85));
  g.add(chalkboardAt(M, -1.0, 0.35, -0.4));
  g.add(skewerBrazier(M, 1.02, 0.62, anims));
  g.add(cyl(0.07, 0.085, 0.15, 12, M.steel, 1.0, 0.125, -0.5));            /* 水桶 */
  /* 暖窗纸呼吸（背墙内透） */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.34 + 0.08 * sin(t * 1.15); });
  return g;
}

/* ---- lv2 洋房：两开间双棚摊铺 + 蓝瓦阁楼（h≈1.66） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.45, 2.15));
  /* 一层：石砌台基 + 奶油墙两开间 */
  g.add(box(1.86, 0.09, 1.02, M.stoneD, 0, 0.045, -0.08));
  g.add(box(1.74, 0.58, 0.92, M.cream, 0, 0.38, -0.08));             /* 0.09-0.67 */
  /* 双摊位灶面（左绿棚右条纹棚，各带锅具蒸汽+粒子座） */
  var cL = foodCounter(M, 0.68, 0.09, anims, 2, 2); put(g, cL, -0.42, 0, 0.42);
  var cR = foodCounter(M, 0.68, 0.09, anims, 4, 2); put(g, cR, 0.42, 0, 0.42);
  /* 摊间竹蒸笼塔（参考图两棚之间蒸笼堆） */
  put(g, steamerTower(M, 3), 0.0, 0.09, 0.44);
  /* 三色雨棚序列：绿 + 红白条纹（高垂边大扇贝 + 斜撑杆） */
  g.add(awning(M, { w: 0.8, d: 0.5, y: 0.7, z: 0.52, mat: M.greenF, matD: M.greenFd, tilt: 0.36, strutX: [-0.62, -0.22], wallZ: 0.36 }));
  g.add(awning(M, { w: 0.8, d: 0.5, y: 0.7, z: 0.52, stripes: 'red', tilt: 0.36, valance: 0.065, scallop: 0.03, strutX: [0.22, 0.62], wallZ: 0.36 }));
  g.add(box(0.06, 0.02, 0.44, M.woodD, -0.42, 0.71, 0.42));
  g.add(box(0.06, 0.02, 0.44, M.woodD, 0.42, 0.71, 0.42));
  /* 二层：楼板 + 檐廊 + 暖窗 + 阳台盆栽 */
  g.add(box(1.8, 0.05, 0.96, M.wood, 0, 0.715, -0.08));
  g.add(box(1.7, 0.48, 0.86, M.cream, 0, 0.98, -0.08));              /* 0.74-1.22 */
  var balc = balconyUnit(M, 1.3, M.wood); put(g, balc, 0, 0.76, 0.4);
  var w1 = glowWindow(M, 0.26, 0.26); put(g, w1, -0.4, 0.99, 0.355);
  var w2 = glowWindow(M, 0.26, 0.26); put(g, w2, 0.4, 0.99, 0.355);
  [[-0.62], [0.62]].forEach(function (s) {                           /* 阳台盆栽（绿意） */
    g.add(box(0.14, 0.05, 0.09, M.redD, s[0], 0.8, 0.46));
    var pb = mesh(new THREE.IcosahedronGeometry(0.045, 0), M.bush);
    put(g, pb, s[0], 0.86, 0.46); pb.scale.y = 0.8;
  });
  g.add(box(1.5, 0.05, 0.05, M.woodD, 0, 1.24, 0.365));              /* 廊楣（嵌墙） */
  /* 阁楼 + 蓝瓦悬山（apex≈1.56）+ 前坡老虎窗（加脊+侧板） + 砖砌烟囱 */
  g.add(box(1.56, 0.05, 0.92, M.creamD, 0, 1.245, -0.08));
  var main = slateRoof(M, { w: 1.5, d: 1.0, h: 0.24, over: 0.09 });
  put(g, main, 0, 1.27, -0.08);
  g.add(box(0.34, 0.2, 0.26, M.cream, 0.3, 1.42, 0.12));             /* 老虎窗体 */
  g.add(box(0.36, 0.03, 0.03, M.woodD, 0.3, 1.525, 0.12));           /* 老虎窗侧板 ×2 */
  g.add(box(0.03, 0.03, 0.26, M.woodD, 0.14, 1.5, 0.12));
  g.add(box(0.03, 0.03, 0.26, M.woodD, 0.46, 1.5, 0.12));
  var dw = glowWindow(M, 0.16, 0.13); put(g, dw, 0.3, 1.42, 0.26);
  var dr = box(0.42, 0.025, 0.3, M.slate, 0.3, 1.545, 0.1); dr.rotation.x = 0.5; g.add(dr);
  var drg = box(0.05, 0.03, 0.3, M.ink, 0.3, 1.6, 0.1); drg.rotation.x = 0.5; g.add(drg); /* 老虎窗脊 */
  /* 砖砌烟囱（左后坡，参考图屋上矮塔）：烟囱身 + 顶帽 + 烟口 */
  g.add(box(0.13, 0.34, 0.13, M.brick, -0.52, 1.4, -0.3));
  g.add(box(0.17, 0.035, 0.17, M.stoneD, -0.52, 1.585, -0.3));
  g.add(box(0.09, 0.045, 0.09, M.ink, -0.52, 1.615, -0.3));
  /* 棚顶灯串杆 ×2 + 弧线 */
  g.add(stringPole(M, 1.6, -0.9, 0.08));
  g.add(stringPole(M, 1.6, 0.9, 0.08));
  g.add(bulbString(M, -0.88, 1.64, 0.08, 0.88, 1.64, 0.08, 10, anims, 1));
  /* 灯笼 ×2（廊楣下，带挂绳）+ 街景 */
  var l1 = lantern(M, 0.62, anims, 0.9); put(g, l1, -0.6, 1.13, 0.46);
  var l2 = lantern(M, 0.62, anims, 2.6); put(g, l2, 0.6, 1.13, 0.46);
  g.add(crateAt(M, 1.02, 0.5, 0.9, -0.4));
  g.add(crateAt(M, 1.12, 0.16, 0.75, 0.5));
  g.add(stoolAt(M, -1.02, undefined, 0.68));
  g.add(chalkboardAt(M, -1.1, 0.3, -0.2));
  g.add(cyl(0.07, 0.085, 0.14, 12, M.steel, 1.08, 0.115, -0.72));
  /* 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.34 + 0.08 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：三层砖砌商住楼 + 直立金字招牌 + 屋顶晒台水塔（h≈2.26） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  var cx = 0.08;
  var palace = grp(); palace.name = 'market-palace'; g.add(palace);
  /* 台基 + 三层砖墙退台（奶石阶层线） */
  palace.add(box(1.5, 0.08, 1.15, M.stoneD, cx, 0.04, -0.12));
  var floors = grp(); floors.name = 'floor-stack'; palace.add(floors);
  floors.add(box(1.42, 0.6, 1.05, M.brick, cx, 0.38, -0.12));        /* f1 0.08-0.68 */
  floors.add(box(1.52, 0.05, 1.15, M.cream, cx, 0.705, -0.12));
  floors.add(box(1.3, 0.54, 0.95, M.brick, cx, 1.0, -0.14));         /* f2 0.73-1.27 */
  floors.add(box(1.4, 0.05, 1.05, M.cream, cx, 1.295, -0.14));
  floors.add(box(1.16, 0.48, 0.85, M.brick, cx, 1.56, -0.16));       /* f3 1.32-1.80 */
  /* 奶石砌角 v2：交错砌块（长/短腿交替 ×2 层 ×4 角） */
  [[cx - 0.6, 1.0, 0.325, cx - 0.635, 0.31], [cx + 0.6, 1.0, 0.325, cx + 0.635, 0.31]].forEach(function (q) {
    palace.add(box(0.1, 0.13, 0.055, M.cream, q[0], q[1] - 0.07, q[2]));
    palace.add(box(0.05, 0.13, 0.09, M.creamD, q[3], q[1] + 0.06, q[4]));
    palace.add(box(0.1, 0.13, 0.055, M.cream, q[0], q[1] + 0.19, q[2]));
  });
  [[cx - 0.52, 1.56, 0.27, cx - 0.55, 0.26], [cx + 0.52, 1.56, 0.27, cx + 0.55, 0.26]].forEach(function (q) {
    palace.add(box(0.09, 0.12, 0.05, M.cream, q[0], q[1] - 0.06, q[2]));
    palace.add(box(0.045, 0.12, 0.08, M.creamD, q[3], q[1] + 0.06, q[4]));
  });
  /* 一层店口：蓝雨棚（带斜撑）+ 大灶面 + 朱门（门框+门楣+踏步） */
  g.add(awning(M, { w: 1.34, d: 0.56, y: 0.76, z: 0.56, mat: M.blueF, matD: M.blueFd, tilt: 0.34, strutX: [cx - 0.5, cx + 0.5], wallZ: 0.41, valance: 0.06, scallop: 0.03 }));
  var counter = foodCounter(M, 1.0, 0.08, anims, 3, 4);
  put(g, counter, cx - 0.08, 0, 0.48);
  g.add(box(0.26, 0.42, 0.04, M.red, 0.62 + cx, 0.29, 0.4));
  g.add(box(0.32, 0.035, 0.06, M.redD, 0.62 + cx, 0.52, 0.4));       /* 门楣 */
  g.add(box(0.3, 0.03, 0.1, M.stoneD, 0.62 + cx, 0.065, 0.44));      /* 门踏步 */
  g.add(cyl(0.014, 0.014, 0.06, 12, M.gold, 0.54 + cx, 0.3, 0.43));
  /* 二/三层：暖百叶窗 + 石栏阳台 */
  var b2 = balconyUnit(M, 1.06, M.cream); put(g, b2, cx, 0.73, 0.42);
  var w21 = glowWindow(M, 0.22, 0.26); put(g, w21, cx - 0.26, 1.0, 0.355);
  var w22 = glowWindow(M, 0.22, 0.26); put(g, w22, cx + 0.38, 1.0, 0.355);
  var b3 = balconyUnit(M, 0.9, M.cream); put(g, b3, cx, 1.32, 0.38);
  var w31 = glowWindow(M, 0.2, 0.24); put(g, w31, cx - 0.2, 1.57, 0.31);
  var w32 = glowWindow(M, 0.2, 0.24); put(g, w32, cx + 0.32, 1.57, 0.31);
  /* 山墙面暖窗（参考图侧墙开窗）：右侧 ×2 + 左侧 ×1 */
  var sw1 = glowWindow(M, 0.2, 0.24); put(g, sw1, cx + 0.66, 1.0, -0.14, -PI / 2);
  var sw2 = glowWindow(M, 0.18, 0.2); put(g, sw2, cx + 0.585, 1.56, -0.2, -PI / 2);
  var sw3 = glowWindow(M, 0.2, 0.24); put(g, sw3, cx - 0.66, 1.0, -0.3, PI / 2);
  /* 直立金字招牌 v2（黑框金底描边字，双面 + 顶底帽 + 双托架斜杆 + 墙板） */
  var sign = grp(); sign.name = 'vertical-sign';
  sign.add(box(0.24, 0.98, 0.024, M.ink));
  var smat = new THREE.MeshStandardMaterial({
    map: getTex('signV', texSignV), roughness: 0.5, flatShading: true,
    emissive: C('#ffe08a'), emissiveIntensity: 0.22
  });
  var sp = mesh(new THREE.PlaneGeometry(0.19, 0.9), smat);
  sp.position.z = 0.034; sign.add(sp);
  var sp2 = sp.clone(); sp2.position.z = -0.034; sp2.rotation.y = PI; sign.add(sp2);
  sign.add(box(0.28, 0.03, 0.05, M.gold, 0, 0.515, 0));              /* 顶帽 */
  sign.add(box(0.28, 0.03, 0.05, M.gold, 0, -0.515, 0));             /* 底帽 */
  sign.add(cyl(0.016, 0.016, 0.05, 12, M.gold, 0, 0.55, 0));
  sign.add(cyl(0.016, 0.016, 0.05, 12, M.gold, 0, -0.55, 0));
  sign.add(box(0.06, 0.3, 0.016, M.steel, 0, 0, -0.06));             /* 墙板 */
  put(g, sign, cx - 0.82, 1.16, 0.42);
  g.add(strut(M, cx - 0.82, 1.0, 0.35, 1.1, 0.404, 0.007));   /* 托架斜杆 ×2 */
  g.add(strut(M, cx - 0.82, 1.32, 0.35, 1.22, 0.404, 0.007));
  /* 屋顶晒台：青瓦压顶 + 围沿 + 角杆灯串 + 脚架水塔 + 晒台桌凳 */
  palace.add(box(1.28, 0.05, 0.95, M.teal, cx, 1.845, -0.16));
  palace.add(box(1.34, 0.04, 1.0, M.creamD, cx, 1.87, -0.16));
  var deckPoles = grp(); deckPoles.name = 'bulb-string'; palace.add(deckPoles);
  [[-0.6, 0.32], [0.6, 0.32], [-0.6, -0.6], [0.6, -0.6]].forEach(function (p) {
    deckPoles.add(box(0.035, 0.3, 0.035, M.woodD, p[0] + cx, 2.02, p[1] - 0.02));
  });
  g.add(bulbString(M, cx - 0.6, 2.17, 0.32, cx + 0.6, 2.17, 0.32, 6, anims, 0, 0.02));
  g.add(bulbString(M, cx - 0.6, 2.17, -0.58, cx + 0.6, 2.17, -0.58, 6, anims, 1, 0.02));
  var tank = waterTank(M); put(g, tank, cx - 0.44, 1.9, -0.42);
  g.add(cyl(0.075, 0.08, 0.03, 12, M.bamboo, cx + 0.34, 1.925, -0.36));   /* 晒台小桌 */
  g.add(cyl(0.02, 0.024, 0.07, 12, M.woodD, cx + 0.34, 1.885, -0.36));
  g.add(stoolAt(M, cx + 0.18, 1.895, -0.3));
  g.add(stoolAt(M, cx + 0.5, 1.895, -0.44));
  /* 灯笼 ×3（棚下 ×2 + 晒台角 ×1）+ 街景 */
  var l1 = lantern(M, 0.6, anims, 1.3); put(g, l1, cx - 0.72, 0.6, 0.6);
  var l2 = lantern(M, 0.6, anims, 3.1); put(g, l2, cx + 0.66, 0.6, 0.6);
  var l3 = lantern(M, 0.5, anims, 4.4); put(g, l3, cx - 0.58, 2.08, -0.58);
  g.add(crateAt(M, 1.06, 0.6, 0.95, 0.5));
  g.add(stoolAt(M, 0.98, undefined, 0.86));
  g.add(stoolAt(M, 0.72, undefined, 0.94));
  g.add(chalkboardAt(M, -1.08, 0.62, -0.3));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.bush);
  put(g, bush, 1.08, 0.16, -0.7); bush.scale.y = 0.85;
  var pot2 = cyl(0.05, 0.06, 0.07, 12, M.redD, -1.04, 0.085, -0.62);       /* 左侧盆栽 */
  g.add(pot2);
  var bush2 = mesh(new THREE.IcosahedronGeometry(0.055, 0), M.bush);
  put(g, bush2, -1.04, 0.16, -0.62); bush2.scale.y = 0.85;
  /* 招牌微闪 + 暖窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) {
    smat.emissiveIntensity = 0.22 + 0.06 * sin(t * 1.6);
    pm.emissiveIntensity = 0.34 + 0.08 * sin(t * 1.05 + 0.9);
  });
  return g;
}

/* ---- lv4 地标：夜市牌楼 + 三层殿座商楼 + 金龙食街（h≈2.62） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.45));
  /* 石台基 v2（加深承住牌楼柱）+ 垂带踏步（两级接石消悬空） */
  var palace = grp(); palace.name = 'market-palace'; g.add(palace);
  palace.add(box(2.06, 0.14, 1.9, M.stone, 0, 0.07, -0.01));
  palace.add(box(2.14, 0.05, 1.98, M.stoneD, 0, 0.025, -0.01));
  palace.add(box(0.8, 0.05, 0.2, M.stoneD, 0, 0.165, 1.02));         /* 踏步下级（坐在草面） */
  palace.add(box(0.64, 0.04, 0.16, M.stone, 0, 0.21, 0.86));         /* 踏步上级（接台面） */
  /* 夜市牌楼：双红柱（坐台基）+ 金帽 + 横枋金字匾（带匾框背板） */
  var gate = grp(); gate.name = 'paifang-entry'; g.add(gate);
  [[-0.74], [0.74]].forEach(function (s) {
    var px = s[0];
    gate.add(box(0.07, 0.05, 0.07, M.stoneD, px, 0.165, 0.9));
    gate.add(box(0.055, 1.06, 0.055, M.red, px, 0.72, 0.9));
    gate.add(cyl(0.045, 0.045, 0.035, 12, M.gold, px, 1.27, 0.9));
    gate.add(box(0.1, 0.03, 0.1, M.redD, px, 1.3, 0.9));
  });
  var lgL = lantern(M, 0.52, anims, 1.8); put(g, lgL, -0.74, 1.0, 0.93);
  var lgR = lantern(M, 0.52, anims, 2.8); put(g, lgR, 0.74, 1.0, 0.93);
  gate.add(box(1.62, 0.08, 0.06, M.redD, 0, 1.19, 0.9));
  gate.add(box(1.52, 0.02, 0.07, M.gold, 0, 1.245, 0.9));
  var qmat = new THREE.MeshStandardMaterial({
    map: getTex('plaque', texPlaque), roughness: 0.55, flatShading: true,
    emissive: C('#ffe08a'), emissiveIntensity: 0.2
  });
  gate.add(box(0.72, 0.2, 0.024, M.ink, 0, 1.16, 0.906));            /* 匾框背板 */
  var plq = mesh(new THREE.PlaneGeometry(0.66, 0.15), qmat);
  plq.position.set(0, 1.16, 0.928); gate.add(plq);                   /* 与背板面分离 ≥0.02 */
  /* 一层殿座：红柱廊 + 暖堂口 */
  var floors = grp(); floors.name = 'floor-stack'; palace.add(floors);
  floors.add(box(1.66, 0.1, 1.2, M.stoneD, 0, 0.19, -0.14));
  floors.add(box(1.58, 0.56, 1.1, M.red, 0, 0.52, -0.14));           /* 0.24-0.80 */
  floors.add(box(1.2, 0.4, 0.03, M.ink, 0, 0.44, 0.42));
  floors.add(box(1.14, 0.34, 0.03, M.paper, 0, 0.42, 0.44));
  var c1 = redColumn(M, 0.56, 0.034); put(g, c1, -0.68, 0.24, 0.44);
  var c2 = redColumn(M, 0.56, 0.034); put(g, c2, 0.68, 0.24, 0.44);
  var c3 = redColumn(M, 0.56, 0.034); put(g, c3, -0.24, 0.24, 0.46);
  var c4 = redColumn(M, 0.56, 0.034); put(g, c4, 0.24, 0.24, 0.46);
  /* 一层翘角青瓦殿顶（apex≈1.06，两段卷翘 + 吻兽 + 宝顶金柱） */
  var r1 = tealHipRoof(M, { w: 1.7, d: 1.2, h: 0.26 });
  put(palace, r1, 0, 0.82, -0.14);
  /* 二层殿座：金栏板 + 暖窗 + 角盆栽 */
  floors.add(box(1.4, 0.05, 1.0, M.creamD, 0, 1.12, -0.16));
  floors.add(box(1.32, 0.5, 0.9, M.red, 0, 1.395, -0.16));           /* 1.145-1.645 */
  var balc = balconyUnit(M, 1.12, M.gold); put(g, balc, 0, 1.15, 0.3);
  var w1 = glowWindow(M, 0.22, 0.26); put(g, w1, -0.3, 1.4, 0.295);
  var w2 = glowWindow(M, 0.22, 0.26); put(g, w2, 0.3, 1.4, 0.295);
  /* 二层翘角青瓦殿顶（apex≈1.98）+ 金龙双踞（重塑：蜿蜒身+鳍+角+须+爪） */
  var r2 = tealHipRoof(M, { w: 1.46, d: 1.0, h: 0.3 });
  put(palace, r2, 0, 1.66, -0.16);
  var d1 = dragonAt(M, 1.0, anims, 0.4, 0.25); put(g, d1, -0.78, 1.74, 0.18);
  var d2 = dragonAt(M, 0.9, anims, 2.9, -2.2); put(g, d2, 0.78, 1.72, 0.18);
  /* 顶阁宝座（宝顶金珠≈2.62，小顶省金珠尖控预算） */
  floors.add(box(0.6, 0.3, 0.6, M.red, 0, 2.0, -0.16));              /* 1.85-2.15 */
  var r3 = tealHipRoof(M, { w: 0.7, d: 0.6, h: 0.22, plain: true });
  put(palace, r3, 0, 2.17, -0.16);
  /* 红白大条纹棚（高垂边大扇贝 + 斜撑）：棚下长条蒸汽食桌（夜市正脸） */
  g.add(awning(M, { w: 1.9, d: 0.62, y: 0.86, z: 0.66, stripes: 'red', tilt: 0.3, valance: 0.09, scallop: 0.044, strutX: [-0.7, 0.7], wallZ: 0.47 }));
  var table = foodCounter(M, 1.5, 0.19, anims, 5, 3);
  put(g, table, 0, 0.19, 0.62);
  /* 棚下竹蒸笼塔 + 凳（食客座） */
  put(g, steamerTower(M, 3), -0.85, 0.19, 0.66);
  g.add(stoolAt(M, -0.62, 0.24, 0.98));
  g.add(stoolAt(M, 0.62, 0.24, 0.98));
  /* 灯笼阵：一层檐下 ×3 + 牌楼柱 ×2（共 5） */
  var i;
  for (i = 0; i < 3; i++) {
    var lg = lantern(M, 0.5, anims, 0.6 + i * 0.9);
    put(g, lg, -0.45 + i * 0.45, 0.72, 0.5);
  }
  /* 灯串网：牌楼柱顶 ↔ 二层檐角 + 沿棚弧线 */
  g.add(bulbString(M, -0.74, 1.28, 0.9, -0.78, 1.72, 0.46, 4, anims, 2, 0.02));
  g.add(bulbString(M, 0.74, 1.28, 0.9, 0.78, 1.72, 0.46, 4, anims, 0, 0.02));
  g.add(bulbString(M, -0.86, 0.94, 0.82, 0.86, 0.94, 0.82, 6, anims, 1));
  /* 街景：凳 + 木箱 + 黑板 + 盆栽 */
  g.add(stoolAt(M, -0.95, undefined, 1.0));
  g.add(crateAt(M, 0.98, 0.62, 0.85, 0.4));
  g.add(chalkboardAt(M, -1.05, 0.72, -0.5));
  [[-0.9], [0.9]].forEach(function (s) {
    g.add(cyl(0.06, 0.075, 0.1, 12, M.redD, s[0], 0.1, 0.9));
    var pb = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.bush);
    put(g, pb, s[0], 0.2, 0.9); pb.scale.y = 0.85;
  });
  /* 匾额微光 + 暖窗/堂口呼吸 */
  var pm = M.paper;
  anims.push(function (t) {
    qmat.emissiveIntensity = 0.2 + 0.05 * sin(t * 1.5 + 0.3);
    pm.emissiveIntensity = 0.34 + 0.07 * sin(t * 1.0 + 1.4);
  });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[38] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_38_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 38;
  g.userData.level = lv;
  g.userData.region = 'g8';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
