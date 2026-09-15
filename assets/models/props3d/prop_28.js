/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_28.js (v2 精修)
 * -------------------------------------------------------------------------------------
 * 格 28「书院门」(g6 三秦大地) 独属建筑：唐风书院文化街四阶生长史
 * 参考图 refs/prop_28.png 视觉唯一基准；v1 形态/配色/布局/契约全部保留，
 * 本轮逐条清偿 v1 差距（对照 .img2threejs/evidence_prop28 复核）：
 *
 *   G1 瓦垄只有横档 → v2 texTile 256px 竖向瓦垄成排 + 阴(暗档)/阳(亮档)分档 +
 *      横向瓦条接头错缝 + 陶噪点；map+bump 双通道。
 *   G2 檐口无瓦当收头 → v2 tileRoof/sweepRoof/waistEave 每条檐口增加瓦当排
 *      （端面小圆盘Facing 下坡向，参考图檐口圆瓦当）。
 *   G3 脊饰单薄 → v2 木色脊枋 + 枋身鎏金条 + 端头金箍；鸱吻三段卷曲（大弧+内卷+端珠）；
 *      歇山四角增鎏金角吻卷草；lv4 宝顶加高为金杆叠珠+双金环（scepter）。
 *   G4 朱柱细节弱 → v2 石础双层 + 础身金箍 + 柱身上下双金箍 + 柱头斗块（枋上斗）。
 *   G5 抹灰墙无肌理 → v2 texPlaster 256px 斑驳抹痕 + 云斑 + 踢脚污渍。
 *   G6 竖幡空白 → v2 Canvas 直书竖排文字（书院/文房/笔墨/纸墨 四变体）+ 顶部红/金头。
 *   G7 布棚素面 → v2 细布纹理 + 两道朱红束带（参考图 straps）+ 扇贝边双色分档。
 *   G8 灯笼无骨架 → v2 灯笼竖向骨线贴图（红/橙双色）+ 金盖金底 + 坠珠 +
 *      悬点小幅摆动（与分相位呼吸叠加，幅度克制）。
 *   G9 文房摊缺笔架 → v2 笔架（立柱+横梁+三支垂笔）+ 册簿叠 + 卷轴 + 瓷罐。
 *   G10 地坪铺装弱 → v2 石板铺装贴图（板缝网格/错缝/_value 差）+ 土径砾石贴图 + 草簇。
 *   G11 lv1 草顶过平（v1 自述）→ v2 茅草 256px 秸秆丝理 + 檐口垂穗排 + 草脊滚边三段。
 *   G12 圆匾素片 → v2 鎏金圆匾加外框环；lv2 山墙增露明木构（系札/斜撑/脊柱）。
 *
 * 风格族谱（同一块地的同一种生长——唐风青灰瓦 + 鎏金脊饰 + 朱柱白墙 + 米白布幌）：
 *   lv1 小屋   草顶木构纸扎摊：X 形脊杆茅草坡顶 + 垂穗/草脊 + 木柱抹灰墙 + 布棚幌子
 *              + 旗杆文字幡 + 文房摊（h≈1.10）
 *   lv2 洋房   横向两开间：正屋青瓦坡顶（瓦当排）+ 鎏金鸱吻 + 露明山墙 + 朱柱檐廊 +
 *              披屋耳房 + 布棚铺面（h≈1.55）
 *   lv3 大厦   腰檐起台两层：一层铺面 scrolls 摊 + 二层木栏杆回廊 + 门帘格 + 圆鎏金匾
 *              + 大屋顶金饰戗脊角吻（h≈2.05）
 *   lv4 地标   石台基 + 红毯踏步 + 鎏金石狮 + 三重檐楼阁：金门朱廊、层层栏杆、
 *              高宝顶金杆、左右杏花（h≈2.80）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[28] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（本轮上限 512px，实际 ≤256px）；每级 mesh ≤350；
 * userData.anim=[fn(t,dt)]（灯笼分相位呼吸+悬摆 / 布幡摆 / 窗光呼吸）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_28] THREE 未定义，请先加载 three.min.js (r147)');
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
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
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

/* 青灰瓦垄（G1/G2 语汇底）：竖向垄成排 + 阴阳分档 + 横向瓦条错缝 + 陶噪点。
 * 坡面 Box 顶面 UV：u→横向、v→坡向，故竖瓦垄=canvas 竖列。 */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#59616d'; g.fillRect(0, 0, S, S);
  var cols = 10, cw = S / cols, i, k;
  for (i = 0; i < cols; i++) {
    var x = i * cw;
    g.fillStyle = (i % 2) ? '#6b7482' : '#5d6672';        /* 阳档亮 / 阴档暗 */
    g.fillRect(x, 0, cw, S);
    g.fillStyle = '#7d8794'; g.fillRect(x + 1, 0, 3, S);   /* 垄脊阳棱 */
    g.fillStyle = '#39404b'; g.fillRect(x + cw - 4, 0, 4, S); /* 垄沟阴影 */
    g.fillStyle = 'rgba(122,134,150,0.5)'; g.fillRect(x + cw - 8, 0, 2, S);
    for (k = 0; k < 5; k++) {                              /* 横向瓦条（错缝搭接） */
      var y = ((i % 2) * 21 + k * 42 + 10) % S;
      g.fillStyle = 'rgba(46,52,62,0.75)'; g.fillRect(x + 2, y, cw - 4, 4);
      g.fillStyle = 'rgba(150,162,178,0.5)'; g.fillRect(x + 2, y + 4, cw - 4, 2);
    }
  }
  for (i = 0; i < 320; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(22,27,34,0.10)';
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 茅草（G11）：秸秆丝理密铺 + 行间压顶 + 底缘垂穗暗带 */
function texThatch() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#d3a055'; g.fillRect(0, 0, S, S);
  var i, rows = 12, rh = S / rows, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#c8934a' : '#dcae64';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#a06a30'; g.fillRect(0, y + rh - 3, S, 3);
    for (k = 0; k < 26; k++) {
      var x = (k * 9.5 + (i % 3) * 3.5) % S;
      g.strokeStyle = (k % 2) ? 'rgba(226,180,108,0.55)' : 'rgba(138,90,38,0.45)';
      g.beginPath(); g.moveTo(x, y + 1); g.lineTo(x + 3 + (k % 3), y + rh - 2); g.stroke();
    }
  }
  g.fillStyle = 'rgba(122,78,32,0.35)'; g.fillRect(0, S - 18, S, 18); /* 檐缘垂穗暗带 */
  for (k = 0; k < 30; k++) {
    g.fillStyle = 'rgba(238,196,128,0.6)';
    g.fillRect((k * 8.5 + 3) % S, S - 16 + (k % 3) * 4, 2, 8);
  }
  return toTex(cv, true);
}
/* 暖白抹灰（G5）：云斑 + 抹痕弧 + 细噪 + 踢脚污渍 */
function texPlaster() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#efe4d1'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 26; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,252,240,0.10)' : 'rgba(168,148,116,0.08)';
    g.beginPath();
    g.ellipse((i * 67) % S, (i * 97) % S, 14 + (i % 4) * 9, 9 + (i % 3) * 7, (i % 5) * 0.6, 0, PI * 2);
    g.fill();
  }
  for (i = 0; i < 16; i++) {
    g.strokeStyle = 'rgba(150,132,102,0.10)';
    g.beginPath(); g.moveTo((i * 41) % S, (i * 83) % S);
    g.quadraticCurveTo((i * 41) % S + 22, (i * 83) % S + 6, (i * 41) % S + 44, (i * 83) % S);
    g.stroke();
  }
  for (i = 0; i < 160; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.07)' : 'rgba(150,132,102,0.08)';
    g.fillRect((i * 29) % S, (i * 41) % S, 3, 2);
  }
  g.fillStyle = 'rgba(140,120,92,0.10)'; g.fillRect(0, S - 26, S, 26); /* 踢脚污渍 */
  return toTex(cv, true);
}
/* 石板铺装（G10）：错缝板格 + 板面明暗差 + 板缝 + 磨圆角斑 */
function texPaver() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#8f8468'; g.fillRect(0, 0, S, S);
  var rows = 4, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var n = 4, off = (i % 2) * (S / (n * 2));
    for (k = -1; k < n; k++) {
      var x = k * (S / n) + off, w = S / n - 4;
      var t = ((i * 7 + k * 13) % 5) / 5;
      g.fillStyle = t < 0.2 ? '#c1aa7c' : (t < 0.5 ? '#cbb68a' : (t < 0.8 ? '#d2bd93' : '#bda678'));
      g.fillRect(Math.max(0, x + 2), i * rh + 2, Math.min(w, S - x - 2), rh - 4);
      g.fillStyle = 'rgba(255,246,220,0.16)'; g.fillRect(Math.max(0, x + 2), i * rh + 2, Math.min(w, S - x - 2), 3);
    }
  }
  for (i = 0; i < 130; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.05)' : 'rgba(90,78,54,0.09)';
    g.fillRect((i * 53) % S, (i * 31) % S, 2, 2);
  }
  return toTex(cv, true);
}
/* 夯土径（G10）：土面拖痕 + 碎砾 */
function texDirt() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#d8b57c'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 26; i++) {
    g.strokeStyle = (i % 2) ? 'rgba(160,120,70,0.25)' : 'rgba(240,206,148,0.3)';
    g.beginPath(); g.moveTo((i * 17) % S, 0); g.lineTo((i * 23 + 9) % S, S); g.stroke();
  }
  for (i = 0; i < 40; i++) {
    g.fillStyle = (i % 3) ? '#b09a70' : '#c4ad82';
    g.beginPath(); g.ellipse((i * 31) % S, (i * 47) % S, 2.5, 1.8, 0, 0, PI * 2); g.fill();
  }
  return toTex(cv, true);
}
/* 米白细布（G7）：织纹 + 淡摺痕 */
function texCloth() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#f4e8cd'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < S; i += 5) {
    g.fillStyle = 'rgba(190,168,128,0.10)'; g.fillRect(0, i, S, 1);
    g.fillStyle = 'rgba(255,250,235,0.10)'; g.fillRect(i, 0, 1, S);
  }
  for (i = 0; i < 8; i++) {
    g.fillStyle = 'rgba(196,174,134,0.10)';
    g.fillRect((i * 17 + 6) % S, 0, 3, S);
  }
  return toTex(cv, true);
}
/* 灯笼骨架（G8）：竖向骨线 + 上下收口 + 中段提亮（base 控制红/橙） */
function texLantern(base, rib) {
  var w = 128, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  g.fillStyle = 'rgba(255,190,120,0.30)'; g.fillRect(0, 20, w, 24); /* 中段提亮 */
  var i;
  for (i = 0; i < 10; i++) {                                        /* 竖骨 */
    var x = 6 + i * 12.8;
    g.strokeStyle = rib; g.lineWidth = 2;
    g.beginPath(); g.moveTo(x, 2);
    g.quadraticCurveTo(x - 3, h / 2, x, h - 2);
    g.stroke();
  }
  g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(0, 0, w, 3); g.fillRect(0, h - 3, w, 3);
  return toTex(cv, true);
}
/* 竖幡文字（G6）：布底织纹 + 顶束带 + 竖排字（四变体） */
function texBanner(chars, bandHex, inkHex) {
  var w = 128, h = 256, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#f2e7cc'; g.fillRect(0, 0, w, h);
  var i;
  for (i = 0; i < h; i += 6) { g.fillStyle = 'rgba(186,164,124,0.10)'; g.fillRect(0, i, w, 1); }
  for (i = 0; i < w; i += 8) { g.fillStyle = 'rgba(255,250,236,0.10)'; g.fillRect(i, 0, 1, h); }
  g.strokeStyle = '#c9a86a'; g.lineWidth = 4; g.strokeRect(6, 6, w - 12, h - 12);
  g.fillStyle = bandHex; g.fillRect(14, 12, w - 28, 16);            /* 顶束带 */
  g.fillStyle = 'rgba(255,230,170,0.55)'; g.fillRect(14, 12, w - 28, 4);
  g.fillStyle = inkHex; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 62px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  for (i = 0; i < chars.length; i++) g.fillText(chars[i], w / 2, 78 + i * 78);
  g.fillStyle = 'rgba(140,70,40,0.25)'; g.fillRect(0, h - 14, w, 8); /* 底缘磨损 */
  return toTex(cv, true);
}
/* 横式鎏金匾「书院门」（lv4 门楣） */
function texPlaqueH() {
  var w = 256, h = 64, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#8f5c14'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#f2c96a'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10);
  g.fillStyle = '#ffe6a0'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 40px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.fillText('书 院 门', w / 2, h / 2 + 2);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板 = 参考图 MEDIANCUT/逐区取样） */
function Mats() {
  return {
    roofSun:   MAT('p28roofSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.016, rough: 0.66 }); }),
    roofShade: MAT('p28roofShd', function () { var t = getTex('tile', texTile); return std('#a9b2be', { map: t, bump: t, bumpScale: 0.016, rough: 0.72 }); }),
    ridge:     MAT('p28ridge', function () { return std('#3f4652', { rough: 0.8 }); }),
    timber:    MAT('p28timber', function () { return std('#7a4a24', { rough: 0.8 }); }),
    timberD:   MAT('p28timberD', function () { return std('#5c3418', { rough: 0.85 }); }),
    lacq:      MAT('p28lacq', function () { return std('#b04018', { rough: 0.5 }); }),
    lacqDk:    MAT('p28lacqDk', function () { return std('#8a2a10', { rough: 0.58 }); }),
    gold:      MAT('p28gold', function () { return std('#e0a83c', { rough: 0.35, metal: 0.75 }); }),
    goldHi:    MAT('p28goldHi', function () { return std('#f2c96a', { rough: 0.3, metal: 0.8 }); }),
    plaster:   MAT('p28plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.92 }); }),
    cloth:     MAT('p28cloth', function () { var t = getTex('cloth', texCloth); return std('#ffffff', { map: t, rough: 0.95 }); }),
    clothSh:   MAT('p28clothSh', function () { return std('#e4d1ae', { rough: 0.95 }); }),
    thatch:    MAT('p28thatch', function () { var t = getTex('thatch', texThatch); return std('#ffffff', { map: t, bump: t, bumpScale: 0.024, rough: 0.95 }); }),
    thatchD:   MAT('p28thatchD', function () { return std('#a06a30', { rough: 0.95 }); }),
    stone:     MAT('p28stone', function () { return std('#b0a48a', { rough: 0.9 }); }),
    stoneD:    MAT('p28stoneD', function () { return std('#948a72', { rough: 0.92 }); }),
    grass:     MAT('p28grass', function () { return std('#7fa036', { rough: 0.95 }); }),
    grassD:    MAT('p28grassD', function () { return std('#63832e', { rough: 0.95 }); }),
    dirt:      MAT('p28dirt', function () { return std('#d8b57c', { rough: 0.95 }); }),
    court:     MAT('p28court', function () { var t = getTex('paver', texPaver); return std('#ffffff', { map: t, rough: 0.94 }); }),
    dirtC:     MAT('p28dirtC', function () { var t = getTex('dirt', texDirt); return std('#ffffff', { map: t, rough: 0.96 }); }),
    paver:     MAT('p28paver', function () { return std('#c9b285', { rough: 0.95 }); }),
    ink:       MAT('p28ink', function () { return std('#2a2622', { rough: 0.9 }); }),
    paper:     MAT('p28paper', function () { return std('#f2c06a', { rough: 0.85, emissive: '#ffbe5a', ei: 0.3 }); }),
    scroll:    MAT('p28scroll', function () { return std('#f5eee0', { rough: 0.9 }); }),
    brush:     MAT('p28brush', function () { return std('#3a3226', { rough: 0.9 }); }),
    blossom:   MAT('p28blossom', function () { return std('#f2b4c0', { rough: 0.95 }); }),
    blossomD:  MAT('p28blossomD', function () { return std('#e895a8', { rough: 0.95 }); }),
    trunk:     MAT('p28trunk', function () { return std('#6b4a30', { rough: 0.9 }); }),
    carpet:    MAT('p28carpet', function () { return std('#d84c20', { rough: 0.9 }); }),
    carpetD:   MAT('p28carpetD', function () { return std('#b03418', { rough: 0.9 }); }),
    leaf:      MAT('p28leaf', function () { return std('#7fa032', { rough: 0.95 }); }),
    leafD:     MAT('p28leafD', function () { return std('#5d7f26', { rough: 0.95 }); })
  };
}
/* 竖幡材质（四变体：书院/文房/笔墨/纸墨；参考图红纹幡 → 头束带朱/金交替） */
function banMat(id) {
  var V = [
    [['书', '院'], '#a8321a', '#6e2416'],
    [['文', '房'], '#c98a2c', '#5a3a1a'],
    [['笔', '墨'], '#a8321a', '#54462e'],
    [['纸', '墨'], '#b08028', '#4a3c28']
  ][id % 4];
  return MAT('p28ban' + (id % 4), function () {
    return std('#ffffff', { map: getTex('ban' + (id % 4), function () { return texBanner(V[0], V[1], V[2]); }), rough: 0.95 });
  });
}

/* ================= 2. 预制件（风格独有语汇） ================= */

/* 瓦当排（G2）：坡面檐口一排端面圆盘（Facing 下坡向）
 * endRow：前后坡（下坡向=局部 ±z），沿 x 排布；endRowX：侧坡（下坡向=局部 ±x），沿 z 排布 */
function endRow(parent, wid, zPos, n, mat) {
  var step = wid / n, x0 = -wid / 2 + step * 0.5, i;
  for (i = 0; i < n; i++) {
    var d = cyl(0.024, 0.024, 0.022, 12, mat, x0 + i * step, 0.002, zPos);
    d.rotation.x = PI / 2;
    parent.add(d);
  }
}
function endRowX(parent, wid, xPos, n, mat) {
  var step = wid / n, z0 = -wid / 2 + step * 0.5, i;
  for (i = 0; i < n; i++) {
    var d = cyl(0.024, 0.024, 0.022, 12, mat, xPos, 0.002, z0 + i * step);
    d.rotation.z = PI / 2;
    parent.add(d);
  }
}

/* 木格窗：木框 + 暖纸 + 竖棂横格 + 窗台板（几何花格，非贴图） */
function latticeWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.032, M.timberD));
  g.add(box(w, h, 0.03, M.paper, 0, 0, 0.004));
  var cols = o.cols || 3, i;
  for (i = 0; i < cols; i++) {
    g.add(box(0.026, h, 0.036, M.timber, -w / 2 + (i + 1) * w / (cols + 1), 0, 0.008));
  }
  var rows = o.rows || 2;
  for (i = 0; i < rows; i++) {
    g.add(box(w, 0.022, 0.036, M.timber, 0, -h / 2 + (i + 1) * h / (rows + 1), 0.008));
  }
  g.add(box(w + 0.1, 0.03, 0.05, M.timber, 0, -h / 2 - 0.04, 0.004)); /* 窗台板 */
  return g;
}

/* 朱红列柱（G4）：双层石础 + 础身金箍 + 柱身 + 上下双金箍 + 枋上斗块（唐风 column） */
function redColumn(M, h, r) {
  var g = grp();
  g.add(box(r * 3.4, 0.028, r * 3.4, M.stoneD, 0, 0.014, 0));          /* 础底 */
  g.add(cyl(r * 1.28, r * 1.4, 0.026, 12, M.stone, 0, 0.041, 0));      /* 础身 */
  g.add(cyl(r * 1.34, r * 1.34, 0.01, 12, M.gold, 0, 0.052, 0));       /* 础金箍 */
  g.add(cyl(r, r * 1.04, h, 12, M.lacq, 0, 0.055 + h / 2, 0));         /* 柱身 */
  g.add(cyl(r * 1.16, r * 1.16, 0.022, 12, M.gold, 0, 0.055 + h * 0.82, 0)); /* 上金箍 */
  g.add(cyl(r * 1.1, r * 1.1, 0.016, 12, M.gold, 0, 0.055 + h * 0.28, 0));   /* 下金箍 */
  g.add(box(r * 2.6, 0.05, r * 2.6, M.lacqDk, 0, 0.058 + h + 0.025, 0));     /* 柱头枋 */
  g.add(box(r * 1.9, 0.038, r * 1.9, M.timber, 0, 0.058 + h + 0.068, 0));    /* 斗块 */
  return g;
}

/* 鎏金鸱吻（G3）：大弧卷 + 内卷小弧 + 端珠（参考图脊端金角） */
function chiwen(M, s, flip) {
  var g = grp(); s = s || 1;
  var tor = mesh(new THREE.TorusGeometry(0.055 * s, 0.017 * s, 10, 16, PI * 0.85), M.gold);
  tor.rotation.z = flip ? -PI * 0.5 : PI * 0.65;
  g.add(tor);
  var inner = mesh(new THREE.TorusGeometry(0.026 * s, 0.011 * s, 10, 14, PI * 0.6), M.goldHi);
  inner.rotation.z = flip ? -PI * 0.15 : PI * 0.35;
  inner.position.set((flip ? -0.05 : 0.05) * s, 0.012 * s, 0);
  g.add(inner);
  g.add(sph(0.024 * s, M.goldHi, (flip ? -0.055 : 0.055) * s, 0.058 * s, 0));
  return g;
}

/* 青瓦双坡顶：阳/阴坡瓦面（分档瓦垄）+ 瓦当排 + 黑瓦条 + 木脊枋金条 + 双鎏金鸱吻
 * + 檐角翘起金包角 + 可选山墙 */
function tileRoof(M, o) {
  o = o || {};
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  var ends = o.ends !== undefined ? o.ends : 0;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.035, slopeLen, k > 0 ? M.roofSun : M.roofShade, 0, 0, k * slopeLen / 2));
    var strips = o.strips !== undefined ? o.strips : 3;
    for (i = 0; i < strips; i++) {
      var u = (i + 0.5) / strips;
      sg.add(box(w + over * 2 - 0.04, 0.015, 0.028, M.ridge, 0, 0.026, k * u * eave));
    }
    if (ends) endRow(sg, w + over * 2 - 0.02, k * (eave + 0.012), ends, k > 0 ? M.roofSun : M.roofShade);
    sg.add(box(w + over * 2 + 0.02, 0.045, 0.024, M.lacqDk, 0, -0.004, k * eave));
    /* 檐角起翘：两端小方块上翘 + 金包角 */
    var c1 = box(0.07, 0.05, 0.07, M.ridge, (w + over * 2) / 2 - 0.01, 0.045, k * (eave - 0.02));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ridge, -(w + over * 2) / 2 + 0.01, 0.045, k * (eave - 0.02));
    c2.rotation.z = -0.55; sg.add(c2);
    if (o.goldTips) {
      sg.add(sph(0.026, M.goldHi, (w + over * 2) / 2 - 0.01, 0.085, k * (eave - 0.02)));
      sg.add(sph(0.026, M.goldHi, -(w + over * 2) / 2 + 0.01, 0.085, k * (eave - 0.02)));
    }
  }
  if (o.gable) {                                            /* 山墙封板（悬山） */
    var gs = new THREE.Shape();
    gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
    var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.045, bevelEnabled: false });
    var t1 = mesh(gg, o.gableMat || M.plaster); t1.rotation.y = PI / 2;
    t1.position.set(w / 2 - 0.005, -0.02, -0.0225); g.add(t1);
    var t2 = mesh(gg, o.gableMat || M.plaster); t2.rotation.y = -PI / 2;
    t2.position.set(-(w / 2 - 0.005), -0.02, 0.0225); g.add(t2);
  }
  if (o.ridge !== false) {
    /* 顶脊：木色脊枋（G3）+ 枋面鎏金条 + 两端金箍 + 双鎏金鸱吻 */
    var rw = o.ridgeW || (w + over * 2 + 0.04);
    g.add(box(rw, 0.05 + (o.big ? 0.02 : 0), 0.075, o.ridgeMat || M.timber, 0, h + 0.062, 0));
    g.add(box(rw - 0.03, 0.018, 0.012, M.goldHi, 0, h + 0.058, 0.041));      /* 枋面金条 */
    g.add(box(0.03, 0.062 + (o.big ? 0.02 : 0), 0.085, M.gold, rw / 2 - 0.012, h + 0.058, 0));
    g.add(box(0.03, 0.062 + (o.big ? 0.02 : 0), 0.085, M.gold, -(rw / 2 - 0.012), h + 0.058, 0));
    if (o.chiwen !== false) {
      var ch1 = chiwen(M, o.big ? 1.2 : 0.95, false); put(g, ch1, rw / 2 - 0.01, h + 0.09, 0);
      var ch2 = chiwen(M, o.big ? 1.2 : 0.95, true); put(g, ch2, -rw / 2 + 0.01, h + 0.09, 0);
    }
    if (o.centerOrb) g.add(sph(0.036, M.goldHi, 0, h + 0.13, 0));
  }
  return g;
}

/* 歇山/庑殿四坡顶（lv3 顶 / lv4 顶）：四坡分档瓦面 + 瓦当排 + 四角大起翘 +
 * 鎏金戗脊金条 + 鎏金角吻卷草 + 木脊枋金条 + 宝顶 */
function sweepRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.1, eaveS = w / 2 + 0.1;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var endsF = o.ends ? o.ends.fb : 0, endsS = o.ends ? o.ends.sd : 0;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.72 + 0.2, 0.035, lenF, M.roofSun, 0, 0, lenF / 2));
  if (endsF) endRow(sgF, w * 0.72 + 0.16, eaveF + 0.012, endsF, M.roofSun);
  sgF.add(box(w * 0.72 + 0.22, 0.045, 0.024, M.lacqDk, 0, -0.004, eaveF));
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.72 + 0.2, 0.035, lenF, M.roofShade, 0, 0, -lenF / 2));
  if (endsF) endRow(sgB, w * 0.72 + 0.16, -(eaveF + 0.012), endsF, M.roofShade);
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.035, d * 0.8, M.roofShade, lenS / 2, 0, 0));
  if (endsS) endRowX(slR, d * 0.8 - 0.06, lenS + 0.012, endsS, M.roofShade);
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.035, d * 0.8, M.roofShade, -lenS / 2, 0, 0));
  if (endsS) endRowX(slL, d * 0.8 - 0.06, -(lenS + 0.012), endsS, M.roofShade);
  /* 四角起翘 + 鎏金戗脊条 + 角吻卷草（G3，参考图金饰戗脊/角吻） */
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.075, 0.05, 0.075, M.ridge, c[0] * (eaveS - 0.02), 0.05, c[1] * (eaveF - 0.02));
    lift.rotation.z = -c[0] * 0.6; g.add(lift);
    if (o.goldHips) {
      var horiz = Math.sqrt(eaveS * eaveS + eaveF * eaveF);
      var hipLen = Math.sqrt(horiz * horiz + h * h) * 0.92;
      var yaw = grp(); yaw.position.set(0, h, 0);
      yaw.rotation.y = Math.atan2(c[0] * eaveS, c[1] * eaveF);
      g.add(yaw);
      var pitch = grp(); pitch.rotation.x = Math.atan2(horiz, h); yaw.add(pitch);
      pitch.add(box(0.028, 0.018, hipLen, M.gold, 0, 0.012, hipLen * 0.44));
      g.add(sph(0.024, M.goldHi, c[0] * (eaveS - 0.02), 0.1, c[1] * (eaveF - 0.02)));
      var curl = mesh(new THREE.TorusGeometry(0.034, 0.012, 10, 16, PI * 0.8), M.gold);
      curl.position.set(c[0] * (eaveS - 0.015), 0.115, c[1] * (eaveF - 0.015));
      curl.rotation.y = Math.atan2(c[0], c[1]); curl.rotation.z = -PI * 0.25;
      g.add(curl);
    }
  });
  g.add(box(w * 0.5, 0.065, 0.08, o.ridgeMat || M.timber, 0, h + 0.032, 0));
  g.add(box(w * 0.5 - 0.03, 0.018, 0.012, M.goldHi, 0, h + 0.03, 0.045));    /* 脊枋金条 */
  if (o.chiwen !== false) {
    var ch1 = chiwen(M, 1.2, false); put(g, ch1, w * 0.25, h + 0.08, 0);
    var ch2 = chiwen(M, 1.2, true); put(g, ch2, -w * 0.25, h + 0.08, 0);
  }
  if (o.finial) {
    /* 鎏金宝顶（G3 加高）：金杆叠珠 + 双金环 + 顶珠（参考图 lv4 金杆宝顶） */
    g.add(cyl(0.03, 0.048, 0.07, 12, M.gold, 0, h + 0.08, 0));
    var r1 = mesh(new THREE.TorusGeometry(0.032, 0.011, 10, 14), M.goldHi);
    r1.rotation.x = PI / 2; r1.position.set(0, h + 0.13, 0); g.add(r1);
    g.add(sph(0.042, M.goldHi, 0, h + 0.18, 0));
    var r2 = mesh(new THREE.TorusGeometry(0.028, 0.01, 10, 14), M.gold);
    r2.rotation.x = PI / 2; r2.position.set(0, h + 0.225, 0); g.add(r2);
    g.add(cyl(0.011, 0.011, 0.075, 12, M.gold, 0, h + 0.285, 0));
    g.add(sph(0.024, M.goldHi, 0, h + 0.335, 0));
  } else if (o.centerOrb) {
    g.add(sph(0.034, M.goldHi, 0, h + 0.1, 0));
  }
  return g;
}

/* 腰檐：四面小瓦坡带 + 檐口瓦当排（lv3 层间 / lv4 诸层间） */
function waistEave(M, o) {
  var w = o.w, d = o.d, h = o.h || 0.1;
  var g = grp();
  var over = 0.08;
  var eaveF = d / 2 + over, eaveS = w / 2 + over;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.01;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.01;
  var endsFB = o.ends || 0, endsSD = o.endsSD || 0;
  var f = grp(); f.position.set(0, h, 0); f.rotation.x = pitchF; g.add(f);
  f.add(box(w + over * 2, 0.03, lenF, M.roofSun, 0, 0, lenF / 2));
  if (endsFB) endRow(f, w + over * 2 - 0.02, eaveF + 0.012, endsFB, M.roofSun);
  var b = grp(); b.position.set(0, h, 0); b.rotation.x = -pitchF; g.add(b);
  b.add(box(w + over * 2, 0.03, lenF, M.roofShade, 0, 0, -lenF / 2));
  if (endsFB) endRow(b, w + over * 2 - 0.02, -(eaveF + 0.012), endsFB, M.roofShade);
  var r = grp(); r.position.set(0, h, 0); r.rotation.z = -pitchS; g.add(r);
  r.add(box(lenS, 0.03, d * 0.86, M.roofShade, lenS / 2, 0, 0));
  if (endsSD) endRowX(r, d * 0.86 - 0.06, lenS + 0.012, endsSD, M.roofShade);
  var l = grp(); l.position.set(0, h, 0); l.rotation.z = pitchS; g.add(l);
  l.add(box(lenS, 0.03, d * 0.86, M.roofShade, -lenS / 2, 0, 0));
  if (endsSD) endRowX(l, d * 0.86 - 0.06, -(lenS + 0.012), endsSD, M.roofShade);
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var lift = box(0.055, 0.04, 0.055, M.ridge, c[0] * (eaveS - 0.015), 0.035, c[1] * (eaveF - 0.015));
    lift.rotation.z = -c[0] * 0.55; g.add(lift);
  });
  return g;
}

/* 红灯笼（G8）：骨线贴图壳 + 金盖金底 + 坠珠 + 悬点小幅摆 + 分相位呼吸 */
function lantern(M, s, anims, phase, orange) {
  var g = grp(); s = s || 1;
  var texId = 'lant' + (orange ? 'O' : 'R');
  var bm = MAT('p28lant' + (orange ? 'o' : '') + (phase || 0), function () {
    return std('#ffffff', {
      map: getTex(texId, function () {
        return texLantern(orange ? '#f4851f' : '#e04818', 'rgba(120,18,6,0.55)');
      }),
      rough: 0.55, emissive: '#ff8c3c', ei: 0.55
    });
  });
  var piv = grp(); piv.position.y = 0.16 * s; g.add(piv);   /* 悬点 */
  piv.add(cyl(0.036 * s, 0.05 * s, 0.035 * s, 12, M.gold, 0, -0.045 * s, 0));
  var body = sph(0.085 * s, bm, 0, -0.16 * s, 0); body.scale.y = 0.84; piv.add(body);
  piv.add(cyl(0.05 * s, 0.036 * s, 0.035 * s, 12, M.gold, 0, -0.275 * s, 0));
  piv.add(cyl(0.008 * s, 0.008 * s, 0.06 * s, 12, M.lacqDk, 0, -0.325 * s, 0));
  g.add(sph(0.013 * s, M.goldHi, 0, -0.365 * s, 0));        /* 坠珠 */
  var ph = phase || 0;
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.18 * sin(t * 2.2 + ph); });
  anims.push(function (t) { piv.rotation.z = sin(t * 1.5 + ph) * 0.045; });
  return g;
}

/* 米白竖幡（G6）：顶杆 pivot 布幅（竖排文字变体）+ 摆动 */
function banner(M, w, h, anims, phase, banId) {
  var g = grp();
  var piv = grp(); g.add(piv);
  g.add(box(w + 0.06, 0.022, 0.022, M.timberD, 0, 0.005, 0));  /* 幡杆 */
  piv.add(box(w, h, 0.02, banMat(banId || 0), 0, -h / 2, 0));
  piv.add(box(w + 0.015, 0.03, 0.024, M.clothSh, 0, -h + 0.015, 0));
  anims.push(function (t) { piv.rotation.z = sin(t * 1.25 + (phase || 0)) * 0.065; });
  return g;
}

/* 朱漆木栏杆：地栿 + 中栿 + 井字棂 + 扶手 */
function balconyUnit(M, w, mat) {
  var g = grp();
  var mm = mat || M.lacq;
  g.add(box(w, 0.032, 0.03, mm, 0, 0, 0));
  var n = Math.max(4, Math.round(w / 0.09)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.13, 0.015, mm, -w / 2 + i * (w / n), 0.082, 0));
  }
  g.add(box(w, 0.02, 0.026, mm, 0, 0.045, 0));               /* 中栿 */
  g.add(box(w + 0.03, 0.028, 0.032, M.timberD, 0, 0.158, 0));
  return g;
}

/* 米白布棚（G7）：斜布面（织纹）+ 双朱红束带 + 扇贝边双色分档 + 封边 */
function awning(M, w, depth, anims) {
  var g = grp();
  var sl = grp(); sl.position.set(0, 0, depth / 2 - 0.03); sl.rotation.x = 0.32; g.add(sl);
  sl.add(box(w, 0.022, depth, M.cloth, 0, 0, 0));
  sl.add(box(0.035, 0.008, depth - 0.03, M.lacq, -w * 0.27, 0.016, 0));   /* 朱红束带 ×2 */
  sl.add(box(0.035, 0.008, depth - 0.03, M.lacq, w * 0.27, 0.016, 0));
  var n = Math.max(5, Math.round(w / 0.16)), i;
  for (i = 0; i < n; i++) {
    var x = -w / 2 + (i + 0.5) * (w / n);
    var sc = sph(0.03, (i % 2) ? M.cloth : M.clothSh, x, -0.028, depth / 2 - 0.025);
    sc.scale.y = 0.62; g.add(sc);
  }
  g.add(box(w, 0.016, 0.02, M.clothSh, 0, -0.03, depth - 0.045));
  return g;
}

/* 文房摊（G9）：矮桌 + 书卷 + 瓷罐 + 笔架（立柱+横梁+三垂笔）+ 册簿叠 */
function stallTable(M, withScrolls) {
  var g = grp();
  g.add(box(0.42, 0.035, 0.22, M.timber, 0, 0.17, 0));
  g.add(box(0.04, 0.17, 0.04, M.timberD, -0.17, 0.085, -0.07));
  g.add(box(0.04, 0.17, 0.04, M.timberD, 0.17, 0.085, -0.07));
  g.add(box(0.04, 0.17, 0.04, M.timberD, -0.17, 0.085, 0.07));
  g.add(box(0.04, 0.17, 0.04, M.timberD, 0.17, 0.085, 0.07));
  if (withScrolls !== false) {
    for (var i = 0; i < 3; i++) {
      var sc = cyl(0.024, 0.024, 0.16, 12, M.scroll, -0.1 + i * 0.055, 0.21, 0.02);
      sc.rotation.z = PI / 2; g.add(sc);
    }
  }
  var pot = sph(0.045, M.stoneD, 0.13, 0.215, -0.03); pot.scale.y = 0.85; g.add(pot);
  /* 笔架：双立柱 + 横梁 + 三支垂笔（杆+锋） */
  g.add(box(0.026, 0.11, 0.026, M.timberD, -0.06, 0.242, -0.06));
  g.add(box(0.026, 0.11, 0.026, M.timberD, 0.06, 0.242, -0.06));
  g.add(box(0.15, 0.02, 0.024, M.timber, 0, 0.3, -0.06));
  for (i = 0; i < 3; i++) {
    var bx = -0.045 + i * 0.045;
    g.add(cyl(0.006, 0.006, 0.06, 12, M.brush, bx, 0.262, -0.06));
    g.add(cyl(0.007, 0.002, 0.022, 12, M.scroll, bx, 0.222, -0.06));
  }
  /* 册簿叠 ×2 */
  g.add(box(0.09, 0.016, 0.06, M.lacqDk, -0.12, 0.196, -0.06));
  g.add(box(0.08, 0.014, 0.055, M.scroll, -0.12, 0.211, -0.055));
  return g;
}

/* 草坪地坪（G10）：草面 + 草沿 + 前庭铺装（石板格/夯土贴图）+ 灌丛/岩石/草簇 */
function padUnit(M, size, depth, court) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.grass, 0, 0.025, 0));
  g.add(box(size + 0.04, 0.03, d + 0.04, M.grassD, 0, 0.014, 0));
  if (court === 'paver') {
    g.add(box(1.06, 0.014, 0.8, M.court, 0, 0.057, d / 2 - 0.5));
  } else {
    g.add(box(0.5, 0.013, 0.88, M.dirtC, 0, 0.0565, d / 2 - 0.52));
  }
  var rock = mesh(new THREE.DodecahedronGeometry(0.05, 0), M.stoneD); put(g, rock, size / 2 - 0.26, 0.065, d / 2 - 0.28);
  var bush = mesh(new THREE.IcosahedronGeometry(0.085, 0), M.grassD); put(g, bush, -size / 2 + 0.25, 0.11, d / 2 - 0.3);
  bush.scale.y = 0.8;
  var t1 = mesh(new THREE.ConeGeometry(0.032, 0.085, 6), M.grassD); put(g, t1, -size / 2 + 0.34, 0.093, d / 2 - 0.16);
  var t2 = mesh(new THREE.ConeGeometry(0.026, 0.07, 6), M.leafD); put(g, t2, size / 2 - 0.4, 0.085, d / 2 - 0.14);
  return g;
}

/* 杏花树（lv4）：褐干 + 三粉冠 */
function blossomTree(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.022 * s, 0.032 * s, 0.3 * s, 12, M.trunk, 0, 0.15 * s, 0));
  var c1 = sph(0.16 * s, M.blossom, 0, 0.38 * s, 0); c1.scale.y = 0.88; g.add(c1);
  var c2 = sph(0.11 * s, M.blossomD, 0.1 * s, 0.3 * s, 0.06 * s); g.add(c2);
  var c3 = sph(0.08 * s, M.blossom, -0.09 * s, 0.31 * s, -0.05 * s); g.add(c3);
  return g;
}

/* 绿树（lv2/lv3 背景树）：三冠 */
function greenTree(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.018 * s, 0.026 * s, 0.22 * s, 12, M.trunk, 0, 0.11 * s, 0));
  var c1 = sph(0.15 * s, M.leaf, 0, 0.32 * s, 0); c1.scale.y = 0.9; g.add(c1);
  var c2 = sph(0.1 * s, M.leafD, 0.09 * s, 0.24 * s, 0.05 * s); g.add(c2);
  var c3 = sph(0.075 * s, M.leaf, -0.08 * s, 0.25 * s, -0.04 * s); g.add(c3);
  return g;
}

/* 鎏金石狮（lv4）：石座 + 金身 + 鬃环 + 头/耳 + 尾卷 + 座沿金条 */
function goldLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.13 * s, 0.05 * s, 0.13 * s, M.stoneD, 0, 0.025 * s, 0));
  g.add(box(0.1 * s, 0.03 * s, 0.1 * s, M.stone, 0, 0.065 * s, 0));
  g.add(box(0.104 * s, 0.008 * s, 0.104 * s, M.gold, 0, 0.082 * s, 0));
  var body = sph(0.052 * s, M.gold, 0, 0.12 * s, 0); body.scale.set(1, 0.88, 1.25); g.add(body);
  var mane = mesh(new THREE.TorusGeometry(0.036 * s, 0.014 * s, 10, 16), M.goldHi);
  mane.rotation.x = PI / 2; mane.position.set(0, 0.155 * s, 0.05 * s); g.add(mane);
  g.add(sph(0.034 * s, M.gold, 0, 0.165 * s, 0.062 * s));
  var tail = mesh(new THREE.TorusGeometry(0.018 * s, 0.008 * s, 10, 14, PI * 1.2), M.goldHi);
  tail.position.set(0, 0.13 * s, -0.07 * s); tail.rotation.x = PI * 0.5; tail.rotation.z = PI * 0.4; g.add(tail);
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：草顶木构纸扎摊 + 垂穗草脊 + 旗杆文字幡 + 文房摊（h≈1.10） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.3, 'dirt'));
  var hx = -0.12, hz = -0.12;
  /* 台基 + 木柱 + 抹灰填充墙（正面留门窗洞） */
  g.add(box(1.42, 0.08, 1.12, M.stoneD, hx, 0.04, hz));
  g.add(box(1.3, 0.3, 1.0, M.plaster, hx, 0.23, hz));            /* 后墙身 0.08-0.38 */
  g.add(box(1.34, 0.045, 1.04, M.timber, hx, 0.395, hz));        /* 额枋 */
  /* 四角木柱 + 前檐柱 */
  [[-0.72, -0.5], [0.48, -0.5], [-0.72, 0.42], [0.48, 0.42], [-0.14, 0.52]].forEach(function (c) {
    g.add(box(0.055, 0.52, 0.055, M.timberD, hx + c[0], 0.36, hz + c[1]));
  });
  /* 门洞（中）+ 木格窗（左） */
  g.add(box(0.3, 0.34, 0.04, M.ink, hx + 0.08, 0.25, hz + 0.505));
  var win = latticeWindow(M, 0.24, 0.22, { rows: 2, cols: 2 }); put(g, win, hx - 0.32, 0.27, hz + 0.512);
  g.add(box(0.4, 0.04, 0.16, M.stoneD, hx + 0.08, 0.12, hz + 0.6));
  /* 茅草坡顶（apex≈0.90 + 草脊≈0.97）：陡两坡 + 垂穗排 + 草脊滚边（G11） */
  var thatch = grp(); put(g, thatch, hx, 0.44, hz);
  var eave = 0.76, rise = 0.46, pitch = Math.atan2(rise, eave), len = Math.sqrt(eave * eave + rise * rise) + 0.02;
  var k, i;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, rise, 0); sg.rotation.x = pitch * k; thatch.add(sg);
    sg.add(box(1.56, 0.04, len, M.thatch, 0, 0, k * len / 2));
    sg.add(box(1.56, 0.02, 0.05, M.thatchD, 0, 0.012, k * eave));
    for (i = 0; i < 6; i++) {                                    /* 檐口垂穗（G11） */
      var fr = mesh(new THREE.ConeGeometry(0.024, 0.09, 6), M.thatchD);
      fr.position.set(-0.7 + i * 0.28, -0.035, k * (eave - 0.02));
      fr.rotation.x = PI; sg.add(fr);
    }
  }
  for (i = 0; i < 3; i++) {                                      /* 草脊滚边三段 */
    var rc = cyl(0.028, 0.028, 0.52, 12, M.thatch, 0, rise + 0.024, (i - 1) * 0.26);
    rc.rotation.z = PI / 2; thatch.add(rc);
  }
  /* X 形交叉脊杆 + 中柱（参考图草顶特征） */
  var xp1 = cyl(0.022, 0.022, 0.32, 12, M.timberD, 0.12, 0.5, 0); xp1.rotation.z = 0.5; thatch.add(xp1);
  var xp2 = cyl(0.022, 0.022, 0.32, 12, M.timberD, -0.12, 0.5, 0); xp2.rotation.z = -0.5; thatch.add(xp2);
  thatch.add(box(0.035, 0.17, 0.035, M.timberD, 0, 0.53, 0));
  /* 前廊布棚（右侧，束带+扇贝）+ 挂橙灯笼 */
  var aw = awning(M, 0.86, 0.34, anims); put(g, aw, hx + 0.36, 0.5, hz + 0.56);
  var lt = lantern(M, 0.62, anims, 0.4, true); put(g, lt, hx + 0.76, 0.66, hz + 0.6);
  /* 文房摊（左前，笔架+册簿）+ 长凳（右前） */
  var stall = stallTable(M, true); put(g, stall, hx - 0.62, 0.05, hz + 0.72);
  g.add(box(0.36, 0.03, 0.15, M.timber, hx + 0.72, 0.2, hz + 0.66));
  g.add(box(0.04, 0.13, 0.13, M.timberD, hx + 0.58, 0.14, hz + 0.66));
  g.add(box(0.04, 0.13, 0.13, M.timberD, hx + 0.86, 0.14, hz + 0.66));
  /* 旗杆 + 米白文字幡「纸墨」（左，G6） */
  g.add(cyl(0.016, 0.022, 0.98, 12, M.timberD, -1.02, 0.54, 0.62));
  g.add(box(0.03, 0.03, 0.3, M.timberD, -1.02, 0.96, 0.5));
  var fl = banner(M, 0.16, 0.5, anims, 1.3, 3); put(g, fl, -1.02, 0.96, 0.4);
  fl.rotation.y = PI / 2;
  /* 短篱笆（左前 + 右前） */
  [[-0.9, 0.95, 0.4], [0.55, 0.98, 0.5]].forEach(function (f, fi) {
    var n = fi ? 3 : 4, i2;
    for (i2 = 0; i2 < n; i2++) g.add(box(0.032, 0.2, 0.032, M.timber, f[0] + i2 * 0.16, 0.16, f[1]));
    g.add(box(n * 0.16, 0.024, 0.028, M.timberD, f[0] + (n - 1) * 0.08, 0.22, f[1]));
  });
  /* 水罐（右后） */
  var jar = sph(0.075, M.stoneD, 0.92, 0.13, -0.5); jar.scale.y = 0.9; g.add(jar);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.3 + 0.1 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：正屋青瓦殿（瓦当排+露明山墙）+ 鎏金鸱吻 + 朱柱铺面 + 披屋耳房（h≈1.55） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.25, 'paver'));
  var mx = -0.38, mz = -0.1;
  /* 正屋：石基 + 抹灰墙身 + 楣枋 */
  g.add(box(1.56, 0.11, 1.06, M.stoneD, mx, 0.0525, mz));
  g.add(box(1.44, 0.655, 0.94, M.plaster, mx, 0.4325, mz));       /* 0.105-0.76 */
  g.add(box(1.5, 0.05, 1.0, M.timber, mx, 0.785, mz));
  /* 铺面门脸：朱门洞 + 双朱柱（斗块石础金箍） */
  g.add(box(0.62, 0.5, 0.05, M.ink, mx - 0.18, 0.355, mz + 0.475));
  g.add(box(0.5, 0.4, 0.045, M.lacq, mx - 0.18, 0.305, mz + 0.49));
  var cL = redColumn(M, 0.66, 0.032); put(g, cL, mx - 0.56, 0.105, mz + 0.44);
  var cR = redColumn(M, 0.66, 0.032); put(g, cR, mx + 0.2, 0.105, mz + 0.44);
  /* 木格窗（右间）+ 石阶 */
  var win = latticeWindow(M, 0.3, 0.32, { rows: 2, cols: 3 }); put(g, win, mx + 0.44, 0.44, mz + 0.485);
  g.add(box(0.56, 0.05, 0.2, M.stoneD, mx - 0.18, 0.13, mz + 0.6));
  /* 山墙面（前后三角抹灰 + 露明木构 + 金圆匾加框，G12） */
  var gsf = new THREE.Shape();
  gsf.moveTo(-0.66, 0); gsf.lineTo(0.66, 0); gsf.lineTo(0, 0.5); gsf.closePath();
  var gf = mesh(new THREE.ExtrudeGeometry(gsf, { depth: 0.045, bevelEnabled: false }), M.plaster);
  gf.position.set(mx, 0.81, mz + 0.48); g.add(gf);
  g.add(box(1.0, 0.038, 0.03, M.timber, mx, 0.86, mz + 0.528));            /* 系札 */
  var br1 = box(0.035, 0.3, 0.03, M.timber, mx + 0.2, 0.96, mz + 0.528); br1.rotation.z = 0.62; g.add(br1);
  var br2 = box(0.035, 0.3, 0.03, M.timber, mx - 0.2, 0.96, mz + 0.528); br2.rotation.z = -0.62; g.add(br2);
  g.add(box(0.035, 0.2, 0.03, M.timberD, mx, 0.94, mz + 0.528));           /* 脊柱 */
  g.add(cyl(0.055, 0.055, 0.02, 14, M.gold, mx, 1.0, mz + 0.545));         /* 金圆匾 */
  var gfRing = mesh(new THREE.TorusGeometry(0.068, 0.011, 10, 16), M.goldHi);
  put(g, gfRing, mx, 1.0, mz + 0.552);
  /* 主瓦顶（瓦当排 + 木脊枋金条 + 双鎏金鸱吻；apex≈1.31） */
  var roof = tileRoof(M, { w: 1.5, d: 1.14, h: 0.5, strips: 4, big: true, goldTips: true, gable: false, ends: 12 });
  put(g, roof, mx, 0.81, mz);
  /* 披屋耳房（右）：抹灰 + 小瓦顶（瓦当排）+ 小鸱吻 */
  var wx = 0.72, wz = -0.05;
  g.add(box(0.72, 0.08, 0.96, M.stoneD, wx, 0.04, wz));
  g.add(box(0.66, 0.58, 0.9, M.plaster, wx, 0.41, wz));           /* 0.12-0.70 */
  var wwin = latticeWindow(M, 0.2, 0.22, { rows: 2, cols: 2 }); put(g, wwin, wx, 0.44, wz + 0.46);
  var wroof = tileRoof(M, { w: 0.62, d: 0.96, h: 0.18, strips: 2, ridgeW: 0.7, ends: 6 });
  put(g, wroof, wx, 0.7, wz);                                     /* apex≈0.88 */
  /* 铺面布棚（束带+扇贝）+ 红灯笼 */
  var aw = awning(M, 1.16, 0.36, anims); put(g, aw, mx - 0.14, 0.66, mz + 0.52);
  var l1 = lantern(M, 0.66, anims, 0.9); put(g, l1, mx - 0.72, 0.7, mz + 0.52);
  /* 布幌杆（右前，文字幡「文房」）+ 橙灯笼杆 */
  g.add(cyl(0.015, 0.02, 1.02, 12, M.timberD, 0.98, 0.56, 0.62));
  g.add(box(0.03, 0.03, 0.34, M.timberD, 0.98, 1.01, 0.5));
  var bn = banner(M, 0.17, 0.56, anims, 2.0, 1); put(g, bn, 0.98, 1.01, 0.38);
  bn.rotation.y = PI / 2;
  var lp = lantern(M, 0.58, anims, 1.6, true); put(g, lp, 0.74, 0.96, 0.62);
  /* 文房摊（左前，笔架）+ 绿树（右后） */
  var stall = stallTable(M, true); put(g, stall, -0.98, 0.03, 0.62);
  var tree = greenTree(M, 1.0); put(g, tree, 0.95, 0.05, -0.68);
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.3 + 0.1 * sin(t * 1.15 + 0.5); });
  return g;
}

/* ---- lv3 大厦：腰檐起台两层（瓦当排）+ 二层回廊门帘 + 圆鎏金匾 + 大屋顶角吻戗脊（h≈2.05） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35, 'paver'));
  var fx = -0.34, fz = 0;
  /* 一层：石基 + 墙身 + 铺面（朱柱列 + 门洞 + 木格窗） */
  g.add(box(1.6, 0.1, 1.06, M.stoneD, fx, 0.05, fz));
  g.add(box(1.48, 0.62, 0.94, M.plaster, fx, 0.41, fz));          /* 0.10-0.72 */
  g.add(box(1.54, 0.05, 1.0, M.timber, fx, 0.745, fz));
  g.add(box(0.56, 0.46, 0.05, M.ink, fx - 0.3, 0.33, fz + 0.475));
  g.add(box(0.44, 0.36, 0.045, M.lacq, fx - 0.3, 0.28, fz + 0.49));
  var cL = redColumn(M, 0.6, 0.03); put(g, cL, fx - 0.62, 0.1, fz + 0.44);
  var cR = redColumn(M, 0.6, 0.03); put(g, cR, fx + 0.04, 0.1, fz + 0.44);
  var cM = redColumn(M, 0.6, 0.03); put(g, cM, fx + 0.62, 0.1, fz + 0.44);
  var win1 = latticeWindow(M, 0.28, 0.3, { rows: 2, cols: 3 }); put(g, win1, fx + 0.32, 0.4, fz + 0.485);
  /* 铺面前：布棚 + 书卷摊（笔架）+ 石阶 */
  var aw = awning(M, 1.2, 0.38, anims); put(g, aw, fx - 0.12, 0.64, fz + 0.54);
  var stall = stallTable(M, true); put(g, stall, -1.06, 0.03, fz + 0.7);
  g.add(box(0.5, 0.05, 0.2, M.stoneD, fx - 0.3, 0.125, fz + 0.6));
  /* 腰檐（y≈0.8）：四面小瓦坡 + 前后瓦当排 */
  var waist = waistEave(M, { w: 1.34, d: 0.84, h: 0.12, ends: 8 });
  put(g, waist, fx, 0.78, fz);
  /* 二层（退台 0.84-1.40）：抹灰墙 + 前廊朱柱 + 木栏杆 + 格窗门帘 + 圆鎏金匾加框 */
  g.add(box(1.3, 0.56, 0.8, M.plaster, fx, 1.12, fz - 0.03));     /* 0.84-1.40 */
  var c2L = redColumn(M, 0.5, 0.028); put(g, c2L, fx - 0.5, 0.9, fz + 0.33);
  var c2R = redColumn(M, 0.5, 0.028); put(g, c2R, fx + 0.5, 0.9, fz + 0.33);
  var balc = balconyUnit(M, 1.14); put(g, balc, fx, 0.9, fz + 0.36);
  var w21 = latticeWindow(M, 0.2, 0.28, { rows: 2, cols: 2 }); put(g, w21, fx - 0.32, 1.14, fz + 0.39);
  var w22 = latticeWindow(M, 0.2, 0.28, { rows: 2, cols: 2 }); put(g, w22, fx + 0.32, 1.14, fz + 0.39);
  var dr2 = latticeWindow(M, 0.2, 0.36, { rows: 3, cols: 2 }); put(g, dr2, fx, 1.12, fz + 0.39); /* 中门帘格 */
  g.add(cyl(0.085, 0.085, 0.024, 14, M.gold, fx, 1.22, fz + 0.41));
  var mRing = mesh(new THREE.TorusGeometry(0.092, 0.011, 10, 16), M.goldHi);
  put(g, mRing, fx, 1.22, fz + 0.418);                            /* 匾外框环 */
  g.add(cyl(0.05, 0.05, 0.03, 12, M.lacqDk, fx, 1.22, fz + 0.425));
  /* 二层灯笼 ×2 + 檐下文字幡 ×2（书院/文房） */
  var l1 = lantern(M, 0.56, anims, 1.1); put(g, l1, fx - 0.6, 1.13, fz + 0.42);
  var l2 = lantern(M, 0.56, anims, 2.4); put(g, l2, fx + 0.6, 1.13, fz + 0.42);
  var b1 = banner(M, 0.15, 0.4, anims, 0.7, 0); put(g, b1, fx - 0.4, 0.88, fz + 0.4);
  var b2 = banner(M, 0.15, 0.4, anims, 2.9, 1); put(g, b2, fx + 0.4, 0.88, fz + 0.4);
  /* 大屋顶（歇山）：1.40 起，金戗脊角吻 + 瓦当排 + 中央金珠（总高≈2.05） */
  var roof = sweepRoof(M, { w: 1.16, d: 1.0, h: 0.44, goldHips: true, centerOrb: true, ends: { fb: 8, sd: 6 } });
  put(g, roof, fx, 1.4, fz - 0.03);                               /* 脊顶 ≈1.89 + 金珠 ≈1.98 */
  /* 橙灯笼杆（右前）+ 绿树（右后）+ 盆栽 */
  g.add(cyl(0.015, 0.02, 1.14, 12, M.timberD, 1.02, 0.62, 0.66));
  var lp = lantern(M, 0.56, anims, 3.3, true); put(g, lp, 1.02, 1.23, 0.66);
  var tree = greenTree(M, 1.1); put(g, tree, 0.92, 0.05, -0.72);
  g.add(cyl(0.055, 0.068, 0.09, 12, M.stoneD, -1.1, 0.095, -0.62));
  var bush = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, bush, -1.1, 0.19, -0.62);
  bush.scale.y = 0.85;
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.3 + 0.1 * sin(t * 1.15 + 0.8); });
  return g;
}

/* ---- lv4 地标：石台基红毯踏步 + 鎏金石狮 + 三重檐楼阁（瓦当排+角吻）+ 杏花（h≈2.80） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.5, 'paver'));
  /* 石台基 + 垂带踏步 + 红毯 */
  g.add(box(2.1, 0.16, 1.66, M.stone, 0, 0.08, -0.06));
  g.add(box(2.18, 0.05, 1.72, M.stoneD, 0, 0.025, -0.06));
  /* 三级踏步（前） */
  g.add(box(0.94, 0.055, 0.2, M.stoneD, 0, 0.185, 0.88));
  g.add(box(0.94, 0.055, 0.2, M.stoneD, 0, 0.24, 0.76));
  g.add(box(0.94, 0.055, 0.2, M.stoneD, 0, 0.295, 0.64));
  /* 红毯（踏步中央 + 台面引道） */
  g.add(box(0.4, 0.012, 0.6, M.carpet, 0, 0.33, 0.76));
  g.add(box(0.44, 0.014, 0.34, M.carpetD, 0, 0.243, 0.76));
  g.add(box(0.44, 0.014, 0.34, M.carpetD, 0, 0.188, 0.88));
  /* 踏步侧朱红栏杆 ×2 */
  [[-0.52], [0.52]].forEach(function (s) {
    var sx = s[0];
    g.add(box(0.05, 0.36, 0.05, M.lacq, sx, 0.42, 0.86));
    g.add(box(0.05, 0.3, 0.05, M.lacq, sx, 0.4, 0.6));
    g.add(box(0.035, 0.3, 0.56, M.lacq, sx, 0.56, 0.72));
  });
  /* 鎏金石狮 ×2（踏步两侧）+ 杏花 ×2 */
  put(g, goldLion(M, 1.2), -0.85, 0.16, 0.82);
  put(g, goldLion(M, 1.2), 0.85, 0.16, 0.82);
  put(g, blossomTree(M, 1.15), -1.08, 0.05, 0.42);
  put(g, blossomTree(M, 0.95), 1.1, 0.05, 0.38);
  /* 一层（0.16 起）：回廊朱柱 ×6 + 填充墙 + 金门 + 圆匾 + 「书院门」匾 + 文字幡 ×3 */
  g.add(box(1.56, 0.9, 1.1, M.plaster, 0, 0.61, -0.12));          /* 0.16-1.06 */
  [[-0.64, 0.4], [-0.32, 0.44], [0.32, 0.44], [0.64, 0.4], [-0.64, -0.5], [0.64, -0.5]].forEach(function (c) {
    var col = redColumn(M, 0.8, 0.032); put(g, col, c[0], 0.16, c[1]);
  });
  /* 金门（中）+ 门钉 + 上方金匾 */
  g.add(box(0.4, 0.62, 0.05, M.ink, 0, 0.47, 0.45));
  g.add(box(0.34, 0.56, 0.05, M.gold, 0, 0.47, 0.475));
  g.add(box(0.22, 0.3, 0.04, M.goldHi, 0, 0.55, 0.495));
  [-0.08, 0.08].forEach(function (x) {
    g.add(sph(0.02, M.goldHi, x, 0.42, 0.505));
    g.add(sph(0.02, M.goldHi, x, 0.52, 0.505));
  });
  var plq = mesh(new THREE.PlaneGeometry(0.5, 0.125),
    new THREE.MeshStandardMaterial({ map: getTex('plaqueH', texPlaqueH), roughness: 0.5, metalness: 0.35, flatShading: true }));
  plq.position.set(0, 0.9, 0.505); g.add(plq);                    /* 「书院门」（离门面 ≥0.02） */
  g.add(box(0.56, 0.035, 0.05, M.lacqDk, 0, 0.975, 0.47));
  /* 侧向木格窗 ×2（暖光） */
  var w1 = latticeWindow(M, 0.24, 0.3, { rows: 2, cols: 2 }); put(g, w1, -0.5, 0.56, 0.44);
  var w2 = latticeWindow(M, 0.24, 0.3, { rows: 2, cols: 2 }); put(g, w2, 0.5, 0.56, 0.44);
  /* 一层文字幡 ×3（柱间：书院/笔墨/文房） */
  var fb1 = banner(M, 0.16, 0.44, anims, 0.5, 0); put(g, fb1, -0.48, 1.0, 0.46);
  var fb2 = banner(M, 0.16, 0.44, anims, 1.8, 2); put(g, fb2, 0, 1.0, 0.5);
  var fb3 = banner(M, 0.16, 0.44, anims, 3.0, 1); put(g, fb3, 0.48, 1.0, 0.46);
  /* 一层腰檐（y≈1.1）：瓦当排 + 檐下灯笼 ×2（分相位） */
  var wa1 = waistEave(M, { w: 1.36, d: 0.96, h: 0.12, ends: 10 });
  put(g, wa1, 0, 1.06, -0.12);
  var l0a = lantern(M, 0.44, anims, 5.2); put(g, l0a, -0.85, 1.06, 0.36);
  var l0b = lantern(M, 0.44, anims, 6.1); put(g, l0b, 0.85, 1.06, 0.36);
  /* 二层（1.18 起）：朱柱廊 + 栏杆 + 米白墙 + 金圆匾加框 + 灯笼 ×2 */
  g.add(box(1.22, 0.44, 0.76, M.plaster, 0, 1.4, -0.14));         /* 1.18-1.62 */
  var c2L = redColumn(M, 0.4, 0.026); put(g, c2L, -0.5, 1.18, 0.26);
  var c2R = redColumn(M, 0.4, 0.026); put(g, c2R, 0.5, 1.18, 0.26);
  var balc2 = balconyUnit(M, 1.14); put(g, balc2, 0, 1.18, 0.3);
  g.add(cyl(0.075, 0.075, 0.022, 14, M.gold, 0, 1.48, 0.38));
  var r2f = mesh(new THREE.TorusGeometry(0.082, 0.01, 10, 16), M.goldHi);
  put(g, r2f, 0, 1.48, 0.388);                                    /* 匾外框环 */
  var l3a = lantern(M, 0.5, anims, 1.4); put(g, l3a, -0.56, 1.42, 0.34);
  var l3b = lantern(M, 0.5, anims, 2.7); put(g, l3b, 0.56, 1.42, 0.34);
  /* 二层腰檐（y≈1.66）：瓦当排 */
  var wa2 = waistEave(M, { w: 1.18, d: 0.84, h: 0.11, ends: 9 });
  put(g, wa2, 0, 1.62, -0.14);
  /* 三层（1.73 起）：小红栏平座 + 米白墙 + 金圆匾加框 + 灯笼 ×2 */
  g.add(box(1.0, 0.36, 0.64, M.lacq, 0, 1.93, -0.14));            /* 1.75-2.11 */
  var balc3 = balconyUnit(M, 0.94, M.lacqDk); put(g, balc3, 0, 1.75, 0.2);
  g.add(cyl(0.065, 0.065, 0.02, 14, M.gold, 0, 2.0, 0.32));
  var r3f = mesh(new THREE.TorusGeometry(0.072, 0.009, 10, 16), M.goldHi);
  put(g, r3f, 0, 2.0, 0.328);                                     /* 匾外框环 */
  var l4a = lantern(M, 0.46, anims, 0.6); put(g, l4a, -0.46, 1.94, 0.26);
  var l4b = lantern(M, 0.46, anims, 2.0); put(g, l4b, 0.46, 1.94, 0.26);
  /* 顶层歇山（2.11 起）：金戗脊角吻 + 瓦当排 + 鎏金高宝顶（顶尖 ≈2.80） */
  var top = sweepRoof(M, { w: 0.98, d: 0.82, h: 0.32, goldHips: true, finial: true, ends: { fb: 7, sd: 5 } });
  put(g, top, 0, 2.11, -0.14);
  /* 台基四角盆栽 + 橙灯笼杆 ×2 */
  [[-0.96, -0.72], [0.96, -0.72]].forEach(function (p) {
    g.add(cyl(0.055, 0.068, 0.09, 12, M.stoneD, p[0], 0.295, p[1]));
    var b = mesh(new THREE.IcosahedronGeometry(0.07, 0), M.grassD); put(g, b, p[0], 0.395, p[1]);
    b.scale.y = 0.85;
  });
  var pl1 = lantern(M, 0.52, anims, 3.6, true); put(g, pl1, -1.16, 1.1, 0.72);
  g.add(cyl(0.014, 0.019, 1.06, 12, M.timberD, -1.16, 0.56, 0.72));
  var pl2 = lantern(M, 0.52, anims, 4.4, true); put(g, pl2, 1.16, 1.08, 0.7);
  g.add(cyl(0.014, 0.019, 1.04, 12, M.timberD, 1.16, 0.55, 0.7));
  /* 纸窗呼吸 */
  var pm = M.paper;
  anims.push(function (t) { pm.emissiveIntensity = 0.3 + 0.1 * sin(t * 1.05 + 1.2); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[28] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_28_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 28;
  g.userData.level = lv;
  g.userData.region = 'g6';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
