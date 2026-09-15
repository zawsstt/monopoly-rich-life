/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_34.js  (v2 精修版)
 * -------------------------------------------------------------------------------------
 * 格 34「尖沙咀」(g7 港岛双雄) 独属建筑：尖沙咀钟楼唐楼四阶生长史
 * 参考图 refs/prop_34.png；v2 = 在已验收 v1 基础上的全局精修迭代
 * （保持整体形态/配色/布局/朝向/导出契约不变，仅加密细节层次）。
 *
 * 风格族谱（同一块地的同一种生长，v1 已验收不得推翻）：
 *   lv1 小屋   暖棕木瓦棚屋 + 圆木压脊 + 鱼骨天线 ×2 + 门侧壁灯（h≈1.21）
 *   lv2 洋房   两开间唐楼：红扇贝披棚铺面 + 木栏檐廊 + 灰瓦坡顶/草天台 + 红金竖灯箱（h≈1.62）
 *   lv3 大厦   六层奶油唐楼 walk-up：米色腰线 + 灰蓝窗棚 + 黄绿雨棚包角 + 屋顶梯屋铁棚群（h≈2.28）
 *   lv4 地标   尖沙咀钟楼塔式建筑群：石台基红柱廊 + 双重青绿琉璃翘檐退台 +
 *              朱漆钟鼓层（罗马字钟面 + 走针）+ 攒尖宝顶串环（h≈2.69）
 *
 * v2 精修语汇（对照参考图逐条落实）：
 *   1) 钟楼罗马字钟面：512px 表盘（60 分钟刻度圈 + 12 时针粗刻度 + 双环边框 +
 *      中心铜毂）+ 时/分针锚尾配重 + 金帽轴心（走针 anim 保持，缓动 ≤0.005rad/s）
 *   2) 青绿釉瓦瓦垄：256px 逐垄纹（垄顶高光 + 垄间深影 + 错缝接头）+
 *      lv4 两重翘檐前坡半圆筒瓦垄 rolls 逐垄 + 戗脊四出 + 檐角卷尾钩（Torus 弧段）
 *   3) 朱漆钟鼓层拱窗：鼓壁金箍带 ×2 + 拱环窗 ×4（Extrude 环框 + 暗龛 + 金钥石 +
 *      米金窗台），避开正面钟面呈十字分布
 *   4) 退台釉瓦翘檐层级：lv4 平座朱栏加中枋、一层退台阴阳面分档、
 *      攒尖宝顶四棱米金脊条 + 尖针串环加高（串环 ×3）
 *   5) 红金竖灯箱：512px 字面（金圈 + 暗描边双钩笔画 + 角花铆钉）+ 灯座托盘 +
 *      3D 灯点 ×3（暖光）+ 托臂斜撑 —— lv2 起全族贯穿
 *   6) 天星码头黑柱暖头街灯：双层石座 + 柱身铜箍 ×2 + 灯托 + 灯檐 + 锥顶
 *   7) 奶油抹灰阴阳面分档：lv3 四向独立墙板（前阳 #e4cc9c / 左次阳 / 右后阴 #a89878，
 *      出挑 ≥0.02 杜绝 z-fight）+ 右墙暗处空调外机可见化修复
 *   8) 石台基垂带踏步：lv4 双阶踏步加级缘石 + 两侧垂带斜石；lv1 门口双级踏步
 *   9) 规范达标：圆柱段数 ≥12 / 球段数 16×12 / 檐下椽尾（lv1）/ 布棚褶皱明暗条 /
 *      暖光窗加窗台板（全族）/ 灯笼下金箍双穗 / 灰瓦坡顶筒瓦垄（lv2）
 *  10) 纹理上限放宽到 512px（钟面 512 / 灯箱 128×512 / 木瓦·灰瓦·釉瓦·石板 256）
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[34] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 纹理全部 Canvas 程序化（≤512px）；每级 mesh ≤350；userData.anim=[fn(t, dt)]；
 * userData.parts 记录专项部件计数（roll/arch/curl/pier/shade/rafter/pipe/clockHands）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_34] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 1. 色板 / 材质基元（material 阶段：参考图逐区取样） ================= */
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
  if (o.emissiveMap) { m.emissiveMap = o.emissiveMap; if (!o.emissive) m.emissive = C('#ffffff'); }
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
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rx, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}

/* ================= 2. 程序化 Canvas 纹理（≤512px，零外部资源） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}
function noise(g, S, n, light, dark) {
  for (var i = 0; i < n; i++) {
    g.fillStyle = (i % 3) ? light : dark;
    g.fillRect((i * 37) % S, (i * 53) % S, 2, 2);
  }
}

/* 暖棕木瓦（lv1 屋面，v2 256px）：横板错缝 + 木纹丝缕 + 钉眼 + 板节疤 */
function texShingle() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#b48454'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#c09060' : '#a87848';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#8a6440'; g.fillRect(0, y + rh - 3, S, 3);
    g.fillStyle = 'rgba(255,230,190,0.18)'; g.fillRect(0, y + 1, S, 2);
    var off = (i % 2) ? S / 6 : 0;
    for (k = 0; k < 6; k++) {
      var x = (off + k * (S / 6)) % S;
      g.fillStyle = 'rgba(70,45,25,0.4)'; g.fillRect(x, y + 2, 2, rh - 5);
      g.fillStyle = 'rgba(92,64,38,0.28)';
      g.fillRect((x + 14) % S, y + 3, 1, rh - 7);            /* 木纹丝缕 */
      if ((i + k) % 6 === 0) {                                /* 板节疤 */
        g.fillStyle = 'rgba(74,50,28,0.45)';
        g.fillRect((k * 53 + i * 29) % S, y + rh / 2, 4, 3);
      }
    }
    g.fillStyle = 'rgba(50,32,16,0.5)';                       /* 钉眼 */
    g.fillRect(((i * 67) + 20) % S, y + rh / 2, 2, 2);
  }
  noise(g, S, 220, 'rgba(255,240,210,0.05)', 'rgba(60,38,20,0.08)');
  return toTex(cv, true);
}
/* 竖板风化木墙（lv1，v2 256px） */
function texPlank() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#c09c78'; g.fillRect(0, 0, S, S);
  var n = 8, pw = S / n;
  for (i = 0; i < n; i++) {
    var x = i * pw;
    g.fillStyle = (i % 3 === 0) ? '#cca884' : (i % 3 === 1) ? '#b8906a' : '#c49a74';
    g.fillRect(x, 0, pw, S);
    g.fillStyle = 'rgba(90,60,35,0.5)'; g.fillRect(x, 0, 2, S);
    g.fillStyle = 'rgba(255,235,205,0.12)'; g.fillRect(x + 2, 0, 1, S);
    g.fillStyle = 'rgba(96,66,40,0.2)';
    g.fillRect(x + pw / 2, (i * 61) % (S - 40), 1, 30 + (i * 17) % 20);
    if (i % 3 === 1) {                                        /* 板节疤 */
      g.fillStyle = 'rgba(80,52,30,0.4)';
      g.fillRect(x + pw / 2 - 2, (i * 97 + 40) % S, 5, 4);
    }
  }
  noise(g, S, 160, 'rgba(255,240,210,0.06)', 'rgba(80,55,30,0.07)');
  return toTex(cv, true);
}
/* 灰青瓦垄（lv2 坡顶，v2 256px 逐垄）：垄顶高光 + 垄间深影 + 错缝接头 */
function texSlate() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#6c6c60'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#78786c' : '#66665a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#8e8e80'; g.fillRect(0, y + 1, S, 3);       /* 垄顶高光 */
    g.fillStyle = '#46463c'; g.fillRect(0, y + rh - 4, S, 4);  /* 垄间深影 */
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(44,46,38,0.55)'; g.fillRect(x, y + 2, 2, rh - 6);   /* 接头错缝 */
      g.fillStyle = 'rgba(235,235,220,0.08)'; g.fillRect((x + 12) % S, y + 4, 3, rh - 9);
    }
  }
  noise(g, S, 180, 'rgba(255,255,240,0.05)', 'rgba(30,32,26,0.09)');
  return toTex(cv, true);
}
/* 浅青绿釉瓦（lv4 攒尖/翘檐，v2 256px 逐垄）：瓦垄 + 釉面高光 + 错缝接头 */
function texGlaze() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), i, k;
  g.fillStyle = '#9cb484'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#a8c090' : '#8ca876';
    g.fillRect(0, y, S, rh);
    g.fillStyle = 'rgba(245,255,225,0.4)'; g.fillRect(0, y + 1, S, 3);  /* 垄顶釉光 */
    g.fillStyle = '#54684a'; g.fillRect(0, y + rh - 4, S, 4);           /* 垄间深影 */
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 8; k++) {
      var x = (off + k * (S / 8)) % S;
      g.fillStyle = 'rgba(58,78,44,0.5)'; g.fillRect(x, y + 2, 2, rh - 6);
      g.fillStyle = 'rgba(250,255,235,0.2)'; g.fillRect((x + 13) % S, y + 4, 3, rh - 9);
    }
  }
  noise(g, S, 150, 'rgba(255,255,240,0.08)', 'rgba(60,82,46,0.09)');
  return toTex(cv, true);
}
/* 奶油抹灰（lv3/lv4，v2）：细噪 + 雨渍竖痕 + 底部灰渍带 */
function texPlaster() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#e4cc9c'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 8; i++) {
    g.fillStyle = 'rgba(150,130,95,0.06)';
    var x = (i * 37) % S;
    g.fillRect(x, (i * 23) % 40, 3, 60 + (i * 13) % 50);
  }
  for (i = 0; i < 5; i++) {                                    /* 雨水垂痕 */
    var x2 = (i * 29 + 11) % S;
    g.fillStyle = 'rgba(140,120,86,0.1)';
    g.fillRect(x2, (i * 19) % 30, 2, 40 + (i * 11) % 40);
  }
  g.fillStyle = 'rgba(140,118,84,0.14)'; g.fillRect(0, S - 6, S, 6);
  g.fillStyle = 'rgba(140,118,84,0.08)'; g.fillRect(0, S - 13, S, 4);
  noise(g, S, 110, 'rgba(255,248,225,0.07)', 'rgba(140,115,80,0.06)');
  return toTex(cv, true);
}
/* 红条纹披棚布（lv2） */
function texStripe() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#c04838'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 4; i++) {
    g.fillStyle = (i % 2) ? '#c85644' : '#b03e30';
    g.fillRect(i * (S / 4), 0, S / 4, S);
    g.fillStyle = 'rgba(255,180,150,0.15)';
    g.fillRect(i * (S / 4), 0, 2, S);
  }
  g.fillStyle = 'rgba(80,20,10,0.18)'; g.fillRect(0, S - 6, S, 6);
  return toTex(cv, true);
}
/* 扇贝垂边条（披棚 valance）：上布 + 下缘扇贝弧 */
function texScallop() {
  var w = 128, h = 48, cv = mkCanvas(w, h), g = cv.getContext('2d'), i;
  g.fillStyle = '#b03e30'; g.fillRect(0, 0, w, h);
  for (i = 0; i < 4; i++) {
    g.fillStyle = (i % 2) ? '#c85644' : '#a83828';
    g.fillRect(i * (w / 4), 0, w / 4, h - 12);
  }
  g.fillStyle = '#b03e30';
  for (i = 0; i < 4; i++) {
    g.beginPath();
    g.arc((i + 0.5) * (w / 4), h - 12, w / 8, 0, PI, false);
    g.fill();
  }
  g.strokeStyle = 'rgba(255,200,170,0.35)'; g.lineWidth = 2;
  for (i = 0; i < 4; i++) {
    g.beginPath();
    g.arc((i + 0.5) * (w / 4), h - 12, w / 8 - 1, PI + 0.25, -0.25);
    g.stroke();
  }
  return toTex(cv, true);
}
/* 楞纹帆布棚通用（灰蓝/黄绿/橙红）：竖肋 */
function texRib(base, hi, lo) {
  return function () {
    var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
    g.fillStyle = base; g.fillRect(0, 0, S, S);
    for (i = 0; i < 8; i++) {
      g.fillStyle = (i % 2) ? hi : lo;
      g.fillRect(i * (S / 8), 0, S / 8, S);
      g.fillStyle = 'rgba(255,255,255,0.10)';
      g.fillRect(i * (S / 8), 0, 2, S);
      g.fillStyle = 'rgba(40,30,10,0.12)';
      g.fillRect(i * (S / 8) + S / 8 - 2, 0, 2, S);
    }
    return toTex(cv, true);
  };
}
/* 红金字形灯箱（v2 128×512）：map = 红底 + 金圈字暗描边双钩 + 角花铆钉 + 底部灯座；
 * emissiveMap = 字形/灯点亮片（呼吸） */
function texSignPair() {
  var w = 128, h = 512, cv = mkCanvas(w, h), g = cv.getContext('2d');
  var cvE = mkCanvas(w, h), ge = cvE.getContext('2d');
  g.fillStyle = '#a83028'; g.fillRect(0, 0, w, h);
  ge.fillStyle = '#201008'; ge.fillRect(0, 0, w, h);
  g.fillStyle = '#d86048'; g.fillRect(11, 11, w - 22, h - 22);
  g.strokeStyle = '#f0c060'; g.lineWidth = 7; g.strokeRect(8, 8, w - 16, h - 16);
  g.strokeStyle = 'rgba(240,192,96,0.55)'; g.lineWidth = 2; g.strokeRect(19, 19, w - 38, h - 38);
  /* 四角花铆钉 */
  var rv = [[16, 16], [w - 16, 16], [16, h - 16], [w - 16, h - 16]], i;
  for (i = 0; i < 4; i++) {
    g.fillStyle = '#fce46c';
    g.beginPath(); g.arc(rv[i][0], rv[i][1], 4, 0, PI * 2); g.fill();
    g.fillStyle = '#8a5010';
    g.beginPath(); g.arc(rv[i][0], rv[i][1], 1.8, 0, PI * 2); g.fill();
  }
  /* 金圈字：印章式笔画（中竖 + 三横）；描边 = 先暗粗描边再亮细笔画（双钩） */
  function glyphPath(gc, cx, cy, s, lw, col) {
    gc.strokeStyle = col; gc.lineWidth = lw; gc.lineCap = 'round';
    gc.beginPath();
    gc.moveTo(cx, cy - 13 * s); gc.lineTo(cx, cy + 12 * s);            /* 中竖 */
    gc.moveTo(cx - 12 * s, cy - 7 * s); gc.lineTo(cx + 12 * s, cy - 7 * s);
    gc.moveTo(cx - 12 * s, cy + 3 * s); gc.lineTo(cx + 12 * s, cy + 3 * s);
    gc.moveTo(cx - 15 * s, cy + 13 * s); gc.lineTo(cx + 15 * s, cy + 13 * s);
    gc.stroke();
  }
  function ring(gc, cx, cy, r, lw, col) {
    gc.strokeStyle = col; gc.lineWidth = lw;
    gc.beginPath(); gc.arc(cx, cy, r, 0, PI * 2); gc.stroke();
  }
  var cy2;
  for (i = 0; i < 4; i++) {
    cy2 = 62 + i * 96;
    ring(g, w / 2, cy2, 30, 12, '#8a5010');                          /* 圈暗描边 */
    ring(g, w / 2, cy2, 30, 6, '#fce46c');                           /* 圈亮线 */
    ring(g, w / 2, cy2, 22, 3, 'rgba(252,228,108,0.6)');
    g.fillStyle = '#fce46c';
    g.beginPath(); g.arc(w / 2, cy2, 3.5, 0, PI * 2); g.fill();
    glyphPath(g, w / 2, cy2, 1, 9, '#8a5010');                       /* 字暗描边 */
    glyphPath(g, w / 2, cy2, 1, 4.5, '#fce46c');                     /* 字亮笔画 */
    /* 发光层：字圈 + 笔画 */
    ring(ge, w / 2, cy2, 30, 6, '#ffcc66');
    glyphPath(ge, w / 2, cy2, 1, 4.5, '#ffe49a');
  }
  /* 底部灯座：托板 + 三灯点 */
  g.fillStyle = '#8a5010'; g.fillRect(28, 434, w - 56, 8);
  g.fillStyle = '#f0c060'; g.fillRect(26, 442, w - 52, 4);
  for (i = -1; i <= 1; i++) {
    g.fillStyle = '#ffe9a0';
    g.beginPath(); g.arc(w / 2 + i * 20, 462, 7, 0, PI * 2); g.fill();
    g.strokeStyle = '#8a5010'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(w / 2 + i * 20, 462, 7, 0, PI * 2); g.stroke();
    ge.fillStyle = '#fff2c0';
    ge.beginPath(); ge.arc(w / 2 + i * 20, 462, 8, 0, PI * 2); ge.fill();
  }
  return { map: toTex(cv, true), emissive: toTex(cvE, true) };
}
/* 钟面（lv4，v2 512px）：贴在圆柱端盖极向 UV 上（rotation.x=PI/2 后 v 沿 -Y，
 * 故 XII 画在画布底部、VI 画在顶部，呈现时为正立钟面）。
 * 60 分钟刻度 + 12 时粗刻度 + 双环边框 + 罗马字 + 内圈 + 中心座 */
function texClock() {
  var S = 512, cv = mkCanvas(S, S), g = cv.getContext('2d');
  var R = S / 2;
  g.fillStyle = '#f0e4c0'; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#4a3826'; g.lineWidth = 11;
  g.beginPath(); g.arc(R, R, R - 16, 0, PI * 2); g.stroke();
  g.strokeStyle = 'rgba(74,56,38,0.55)'; g.lineWidth = 4;
  g.beginPath(); g.arc(R, R, R - 34, 0, PI * 2); g.stroke();
  /* 60 分钟刻度 + 12 时粗刻度 */
  var i, a;
  for (i = 0; i < 60; i++) {
    a = i * PI / 30;
    var hour = (i % 5 === 0);
    g.strokeStyle = hour ? '#3a2c1e' : '#6a5842';
    g.lineWidth = hour ? 8 : 3;
    g.beginPath();
    g.moveTo(R + cos(a) * (hour ? 186 : 196), R + sin(a) * (hour ? 186 : 196));
    g.lineTo(R + cos(a) * 216, R + sin(a) * 216);
    g.stroke();
  }
  /* 内圈线 */
  g.strokeStyle = 'rgba(74,56,38,0.45)'; g.lineWidth = 3;
  g.beginPath(); g.arc(R, R, 128, 0, PI * 2); g.stroke();
  /* 罗马字（画布底=XII，呈现于钟面顶部） */
  g.fillStyle = '#3a2c1e'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 60px "Times New Roman","Georgia",serif';
  g.fillText('XII', R, R + 156);
  g.fillText('III', R + 156, R);
  g.fillText('VI', R, R - 156);
  g.fillText('IX', R - 156, R);
  /* 其余 8 时位小圆点 */
  for (i = 0; i < 12; i++) {
    if (i % 3 === 0) continue;
    a = i * PI / 6;
    g.fillStyle = '#5a4832';
    g.beginPath(); g.arc(R + cos(a) * 156, R + sin(a) * 156, 6, 0, PI * 2); g.fill();
  }
  /* 中心座（几何铜毂之下衬圈） */
  g.fillStyle = '#c8a04a';
  g.beginPath(); g.arc(R, R, 20, 0, PI * 2); g.fill();
  g.strokeStyle = '#8a6a30'; g.lineWidth = 4;
  g.beginPath(); g.arc(R, R, 20, 0, PI * 2); g.stroke();
  return toTex(cv, true);
}
/* 石板地坪（v2 256px 方石拼缝四色微差） */
function texPaving() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d');
  var cols = ['#b49c78', '#ac9470', '#bca482', '#a68e6a'];
  var n = 4, cs = S / n, i, k;
  for (i = 0; i < n; i++) {
    for (k = 0; k < n; k++) {
      g.fillStyle = cols[(i * 3 + k * 5) % 4];
      g.fillRect(i * cs + 2, k * cs + 2, cs - 4, cs - 4);
      g.fillStyle = 'rgba(255,245,220,0.09)';
      g.fillRect(i * cs + 5, k * cs + 5, cs - 10, 3);
    }
  }
  g.fillStyle = 'rgba(96,80,54,0.5)';
  for (i = 0; i <= n; i++) { g.fillRect(i * cs - 2, 0, 4, S); g.fillRect(0, i * cs - 2, S, 4); }
  noise(g, S, 140, 'rgba(255,245,220,0.06)', 'rgba(70,58,38,0.08)');
  return toTex(cv, true);
}
/* 锈色瓦楞（lv3 屋顶铁棚） */
function texRust() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#8a5a3c'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 8; i++) {
    g.fillStyle = (i % 2) ? '#96684a' : '#7c5034';
    g.fillRect(i * (S / 8), 0, S / 8, S);
    g.fillStyle = 'rgba(50,28,12,0.4)';
    g.fillRect(i * (S / 8) + S / 8 - 2, 0, 2, S);
  }
  return toTex(cv, true);
}
/* 暖棕木纹（tan wood：lv2/lv4 铺面木构） */
function texWoodTan() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), i;
  g.fillStyle = '#b4906c'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 6; i++) {
    g.fillStyle = (i % 2) ? '#ac8660' : '#bc9874';
    g.fillRect(i * (S / 6), 0, S / 6, S);
    g.fillStyle = 'rgba(90,60,35,0.4)';
    g.fillRect(i * (S / 6), 0, 2, S);
  }
  for (i = 0; i < 90; i++) {
    g.fillStyle = (i % 2) ? 'rgba(255,235,205,0.06)' : 'rgba(80,55,30,0.06)';
    g.fillRect((i * 43) % S, (i * 29) % S, 3, 1);
  }
  return toTex(cv, true);
}

var TEX = {};
function getTex(id, make) { if (!TEX[id]) TEX[id] = make(); return TEX[id]; }

/* 共享材质库（四级统一色板；圆柱 ≥12 段 / 球 16×12；锥面金字塔 4 段为刻意方锥） */
function Mats() {
  return {
    shingle:  MAT('p34shingle', function () { var t = getTex('shingle', texShingle); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.8 }); }),
    shingleS: MAT('p34shingleS', function () { var t = getTex('shingle', texShingle); return std('#b0a090', { map: t, bump: t, bumpScale: 0.014, rough: 0.84 }); }),
    plank:    MAT('p34plank', function () { var t = getTex('plank', texPlank); return std('#ffffff', { map: t, bump: t, bumpScale: 0.01, rough: 0.86 }); }),
    slate:    MAT('p34slate', function () { var t = getTex('slate', texSlate); return std('#ffffff', { map: t, bump: t, bumpScale: 0.013, rough: 0.7 }); }),
    slateS:   MAT('p34slateS', function () { var t = getTex('slate', texSlate); return std('#aaa89c', { map: t, bump: t, bumpScale: 0.013, rough: 0.74 }); }),
    glaze:    MAT('p34glaze', function () { var t = getTex('glaze', texGlaze); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.45 }); }),
    glazeS:   MAT('p34glazeS', function () { var t = getTex('glaze', texGlaze); return std('#96a088', { map: t, bump: t, bumpScale: 0.012, rough: 0.5 }); }),
    plaster:  MAT('p34plaster', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.9 }); }),
    plasterM: MAT('p34plasterM', function () { var t = getTex('plaster', texPlaster); return std('#c8b088', { map: t, rough: 0.9 }); }),
    plasterS: MAT('p34plasterS', function () { var t = getTex('plaster', texPlaster); return std('#a89878', { map: t, rough: 0.92 }); }),
    trim:     MAT('p34trim', function () { return std('#f0d8b4', { rough: 0.42, metal: 0.25 }); }),
    vermi:    MAT('p34vermi', function () { return std('#e8443c', { rough: 0.5 }); }),
    vermiD:   MAT('p34vermiD', function () { return std('#c03028', { rough: 0.58 }); }),
    wood:     MAT('p34wood', function () { var t = getTex('woodtan', texWoodTan); return std('#ffffff', { map: t, rough: 0.8 }); }),
    woodD:    MAT('p34woodD', function () { return std('#6e5438', { rough: 0.84 }); }),
    stripe:   MAT('p34stripe', function () { return std('#ffffff', { map: getTex('stripe', texStripe), rough: 0.75 }); }),
    scallop:  MAT('p34scallop', function () { return std('#ffffff', { map: getTex('scallop', texScallop), rough: 0.75 }); }),
    lime:     MAT('p34lime', function () { return std('#ffffff', { map: getTex('lime', texRib('#90a824', '#a4bc34', '#7c9218')), rough: 0.72 }); }),
    canSlate: MAT('p34canSlate', function () { return std('#ffffff', { map: getTex('canslate', texRib('#5a7080', '#6c8494', '#48606e')), rough: 0.75 }); }),
    orange:   MAT('p34orange', function () { return std('#ffffff', { map: getTex('orange', texRib('#d86830', '#e87a40', '#c05824')), rough: 0.74 }); }),
    rust:     MAT('p34rust', function () { return std('#ffffff', { map: getTex('rust', texRust), rough: 0.85 }); }),
    stone:    MAT('p34stone', function () { return std('#aba79a', { rough: 0.9 }); }),
    stoneD:   MAT('p34stoneD', function () { return std('#8b877b', { rough: 0.92 }); }),
    paving:   MAT('p34paving', function () { var t = getTex('paving', texPaving); return std('#ffffff', { map: t, bump: t, bumpScale: 0.008, rough: 0.92 }); }),
    grass:    MAT('p34grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:   MAT('p34grassD', function () { return std('#6a9048', { rough: 0.95 }); }),
    gold:     MAT('p34gold', function () { return std('#d8a63c', { rough: 0.35, metal: 0.75 }); }),
    dark:     MAT('p34dark', function () { return std('#2e2a26', { rough: 0.7, metal: 0.4 }); }),
    ink:      MAT('p34ink', function () { return std('#3a3a40', { rough: 0.85 }); }),
    /* 发光族（呼吸动画挂钩；全局共享 → 同级同步呼吸） */
    glow:     MAT('p34glow', function () { return std('#efe0c0', { rough: 0.9, emissive: '#ffd98a', ei: 0.2 }); }),
    lamp:     MAT('p34lamp', function () { return std('#efe0c0', { rough: 0.6, emissive: '#ffd98a', ei: 0.5 }); })
  };
}
function lanternMat(phase) {
  return MAT('p34lant' + phase, function () { return std('#d8402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.55 }); });
}
/* 红金灯箱（每相位独立材质错相呼吸；map+emissiveMap 同源） */
function signMats(phase) {
  return MAT('p34sign' + phase, function () {
    var pair = getTex('signpair', texSignPair);
    return {
      board: std('#a83028', { rough: 0.55 }),
      face: new THREE.MeshStandardMaterial({
        map: pair.map, emissiveMap: pair.emissive,
        emissive: C('#ff8a50'), emissiveIntensity: 0.5, roughness: 0.55, flatShading: true
      })
    };
  });
}
function signGlow(phase, anims) {
  var mats = signMats(phase);
  anims.push(function (t) { mats.face.emissiveIntensity = 0.5 + 0.22 * sin(t * 2.0 + phase); });
  return mats;
}

/* ================= 3. 风格预制件（structure/form 阶段复用语汇 · v2 加密） ================= */

/* 石板地坪 + 草缘（grassy=lv1 草地大 + 径；否则满铺石板） */
function padUnit(M, size, depth, grassy) {
  var g = grp();
  var d = depth || size;
  g.add(box(size + 0.07, 0.032, d + 0.07, M.grassD, 0, 0.016, 0));
  g.add(box(size, 0.03, d, M.grass, 0, 0.038, 0));
  if (grassy) {
    g.add(box(size * 0.52, 0.018, 0.5, M.paving, 0, 0.058, d / 2 - 0.3));
    g.add(box(0.42, 0.014, 0.62, M.paving, 0.08, 0.06, d / 2 - 0.52));
  } else {
    g.add(box(size * 0.94, 0.018, d * 0.9, M.paving, 0, 0.058, 0));
  }
  return g;
}

/* 暖光木格窗（v2 +窗台板：框 + 暖光玻璃 + 木棂 + 窗台） */
function warmWindow(M, w, h, o) {
  o = o || {};
  var g = grp();
  var fr = o.frame || M.woodD;
  g.add(box(w + 0.05, h + 0.05, 0.032, fr));
  g.add(box(w, h, 0.03, o.glowMat || M.glow, 0, 0, 0.004));
  g.add(box(0.026, h, 0.036, M.wood, 0, 0, 0.008));
  var rows = o.rows || 1, i;
  for (i = 0; i < rows; i++) {
    g.add(box(w, 0.024, 0.036, M.wood, 0, -h / 2 + (i + 1) * h / (rows + 1), 0.008));
  }
  g.add(box(w + 0.1, 0.02, 0.05, fr, 0, -h / 2 - 0.036, 0.008));   /* v2 窗台板 */
  return g;
}

/* 布棚（v2 +褶皱明暗条）：斜坡面 + 扇贝垂边 + 褶条（楞线在纹理内，省 mesh） */
function awning(M, w, depth, mat, valMat, x, y, z, ry, folds) {
  var g = grp();
  var sg = grp(); sg.rotation.x = 0.32; g.add(sg);
  sg.add(box(w, 0.022, depth, mat, 0, 0, depth / 2 - 0.02));
  if (folds !== false && w >= 0.5) {                    /* v2 布褶明暗条（仅大棚） */
    var nf = Math.max(2, Math.round(w / 0.6)), fi;
    for (fi = 1; fi <= nf; fi++) {
      sg.add(box(0.02, 0.026, depth - 0.06, valMat, -w / 2 + fi * w / (nf + 1), 0.014, depth / 2 - 0.02));
    }
  }
  var val = mesh(new THREE.PlaneGeometry(w, 0.1), valMat);
  val.position.set(0, -depth * 0.17 + 0.012, depth * 0.955 - 0.03);
  val.rotation.x = 0.12;
  g.add(val);
  g.position.set(x || 0, y || 0, z || 0);
  if (ry) g.rotation.y = ry;
  return g;
}

/* 红金竖排灯箱（v2：托臂 + 斜撑 + 板 + 发光字面 + 上下盖 + 金檐 + 灯座托盘 + 3D 灯点×3） */
function signBox(M, anims, phase, h, x, y, z, ry) {
  var g = grp(), mats = signGlow(phase, anims), i;
  g.add(box(0.05, 0.07, 0.24, M.dark, 0, 0, -0.11));
  var brace = box(0.03, 0.05, 0.17, M.dark, 0, -0.05, -0.09);
  brace.rotation.x = 0.55; g.add(brace);                /* v2 斜撑 */
  g.add(box(0.22, h, 0.06, mats.board, 0, 0, 0));
  var face = mesh(new THREE.PlaneGeometry(0.16, h - 0.05), mats.face);
  face.position.set(0, 0, 0.033); g.add(face);
  g.add(box(0.25, 0.034, 0.08, M.vermiD, 0, h / 2 + 0.017, 0));
  g.add(box(0.25, 0.034, 0.08, M.vermiD, 0, -h / 2 - 0.017, 0));
  g.add(box(0.24, 0.012, 0.09, M.gold, 0, h / 2 + 0.041, 0));     /* v2 顶檐金条 */
  g.add(box(0.24, 0.02, 0.1, M.gold, 0, -h / 2 - 0.044, 0));      /* v2 灯座托盘 */
  for (i = -1; i <= 1; i++) {                                      /* v2 灯点 ×3（暖光） */
    g.add(cyl(0.013, 0.013, 0.016, 12, M.lamp, i * 0.055, -h / 2 - 0.066, 0.015));
  }
  g.position.set(x, y, z);
  if (ry) g.rotation.y = ry;
  return g;
}

/* 红灯笼（v2：金盖金底 + 下金箍 + 红壳 + 双穗；呼吸） */
function lantern(M, s, anims, phase) {
  var g = grp(); s = s || 1;
  var bm = lanternMat(phase || 0);
  g.add(cyl(0.034 * s, 0.046 * s, 0.032 * s, 12, M.gold, 0, 0.108 * s, 0));
  var body = sph(0.08 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.05 * s, 0.05 * s, 0.012 * s, 12, M.gold, 0, -0.062 * s, 0));  /* v2 下金箍 */
  g.add(cyl(0.046 * s, 0.034 * s, 0.032 * s, 12, M.gold, 0, -0.1 * s, 0));
  g.add(box(0.01 * s, 0.07 * s, 0.01 * s, M.vermiD, 0, -0.156 * s, 0));
  if (s >= 0.56) {
    g.add(box(0.007 * s, 0.05 * s, 0.007 * s, M.gold, 0.012 * s, -0.14 * s, 0));  /* v2 双穗 */
  }
  anims.push(function (t) { bm.emissiveIntensity = 0.55 + 0.2 * sin(t * 2.2 + (phase || 0)); });
  return g;
}

/* 鱼骨 TV 天线：立杆 + 3 层横担 + 顶针 */
function antenna(M, h, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.012 * s, 0.016 * s, h, 12, M.dark, 0, h / 2, 0));
  var i, y0 = h * 0.4;
  for (i = 0; i < 3; i++) {
    g.add(box((0.3 - i * 0.07) * s, 0.018 * s, 0.014 * s, M.dark, 0, y0 + i * h * 0.2, 0));
    g.add(box(0.016 * s, 0.05 * s, 0.014 * s, M.dark, 0, y0 + i * h * 0.2 + 0.03 * s, 0));
  }
  g.add(cyl(0.004 * s, 0.004 * s, 0.09 * s, 12, M.dark, 0, h + 0.045 * s, 0));
  return g;
}

/* 黑柱暖头街灯（v2 天星码头灯柱：双层石座 + 铜箍 ×2 + 灯托 + 灯檐 + 锥顶） */
function streetLamp(M, anims, phase, h) {
  var g = grp(); h = h || 1.0;
  g.add(box(0.15, 0.045, 0.15, M.stoneD, 0, 0.0225, 0));
  g.add(box(0.11, 0.04, 0.11, M.stoneD, 0, 0.062, 0));
  var ph = h - 0.24;
  g.add(cyl(0.02, 0.028, ph, 12, M.dark, 0, ph / 2 + 0.08, 0));
  g.add(cyl(0.027, 0.027, 0.016, 12, M.gold, 0, 0.08 + ph * 0.42, 0));
  g.add(cyl(0.024, 0.024, 0.014, 12, M.dark, 0, 0.08 + ph * 0.6, 0));
  g.add(box(0.11, 0.018, 0.11, M.dark, 0, h - 0.15, 0));
  g.add(box(0.085, 0.11, 0.085, M.lamp, 0, h - 0.088, 0));
  g.add(box(0.105, 0.02, 0.105, M.dark, 0, h - 0.026, 0));
  g.add(box(0.075, 0.022, 0.075, M.dark, 0, h - 0.002, 0));
  var pike = mesh(new THREE.ConeGeometry(0.03, 0.05, 12), M.dark); put(g, pike, 0, h + 0.036, 0);
  var lm = M.lamp;
  anims.push(function (t) { lm.emissiveIntensity = 0.5 + 0.15 * sin(t * 1.7 + (phase || 0)); });
  return g;
}

/* 空调外机：壳 + 格栅面 */
function acUnit(M, x, y, z, ry) {
  var g = grp();
  g.add(box(0.2, 0.14, 0.13, M.stone, 0, 0, 0));
  g.add(box(0.16, 0.1, 0.012, M.ink, 0, 0, 0.066));
  g.position.set(x, y, z);
  if (ry) g.rotation.y = ry;
  return g;
}

/* 木箱 / 红面凳 */
function crate(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.16 * s, 0.13 * s, 0.14 * s, M.wood, 0, 0.065 * s, 0));
  g.add(box(0.165 * s, 0.02 * s, 0.145 * s, M.woodD, 0, 0.06 * s, 0));
  g.add(box(0.165 * s, 0.02 * s, 0.145 * s, M.woodD, 0, 0.11 * s, 0));
  return g;
}
function stool(M) {
  var g = grp();
  g.add(box(0.11, 0.03, 0.1, M.vermi, 0, 0.115, 0));
  g.add(cyl(0.014, 0.018, 0.1, 12, M.woodD, 0, 0.05, 0));
  g.add(cyl(0.045, 0.05, 0.014, 12, M.woodD, 0, 0.008, 0));
  return g;
}

/* 灌丛 */
function bush(M, r, x, y, z) {
  var b = sph(r, M.grassD, x, y, z);
  b.scale.y = 0.82;
  return b;
}

/* 暖棕木瓦双坡顶（lv1，v2 +椽尾×6 + 脊木端头×2）：板垄坡面 + 圆木压脊 + 封檐山墙 */
function shingleRoof(M, o, parts) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), k;
  var eave = d / 2 + (o.over !== undefined ? o.over : 0.08);
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + 0.16, 0.03, len, k > 0 ? M.shingle : M.shingleS, 0, 0, k * len / 2));
    sg.add(box(w + 0.18, 0.05, 0.024, M.woodD, 0, -0.004, k * eave));
    if (k > 0) {                                              /* v2 檐下椽尾 ×6（前坡） */
      var ri;
      for (ri = 0; ri < 6; ri++) {
        sg.add(box(0.028, 0.024, 0.06, M.woodD, -w / 2 - 0.04 + ri * (w + 0.08) / 5, -0.02, k * (eave - 0.028)));
      }
      if (parts) parts.rafter = (parts.rafter || 0) + 6;
    }
  }
  var r1 = cyl(0.032, 0.032, w + 0.18, 12, M.woodD, 0, h + 0.022, 0); r1.rotation.z = PI / 2; g.add(r1);
  var r2 = cyl(0.024, 0.024, w + 0.02, 12, M.woodD, 0, h + 0.066, 0); r2.rotation.z = PI / 2; g.add(r2);
  var e1 = cyl(0.037, 0.037, 0.03, 12, M.woodD, w / 2 + 0.09, h + 0.022, 0); e1.rotation.z = PI / 2; g.add(e1);
  var e2 = cyl(0.037, 0.037, 0.03, 12, M.woodD, -(w / 2 + 0.09), h + 0.022, 0); e2.rotation.z = PI / 2; g.add(e2);
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  for (k = -1; k <= 1; k += 2) {
    var t = mesh(gg, M.plank); t.rotation.y = k * PI / 2;
    t.position.set(k * (w / 2 + 0.004), -0.02, k * 0.02); g.add(t);
  }
  return g;
}

/* 灰青瓦双坡顶（lv2，v2 +前坡筒瓦垄×7）：瓦垄坡面 + 正脊 + 翘端 */
function slateRoof(M, o, parts) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp(), k;
  var eave = d / 2 + (o.over !== undefined ? o.over : 0.08);
  var pitch = Math.atan2(h, eave);
  var len = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + 0.16, 0.03, len, k > 0 ? M.slate : M.slateS, 0, 0, k * len / 2));
    sg.add(box(w + 0.18, 0.045, 0.024, M.woodD, 0, -0.004, k * eave));
    if (k > 0 && o.rolls) {                                   /* v2 前坡筒瓦垄 */
      var rr = 0.015, n = o.rolls, i;
      var zStart = Math.max(0.07, (rr * 0.9 * cos(pitch) + 0.02) / sin(pitch));
      var zEnd = len - 0.03, rl = zEnd - zStart;
      if (rl > 0.08) {
        var span = w + 0.1, step = span / n;
        for (i = 0; i < n; i++) {
          var roll = cyl(rr, rr, rl, 12, M.slate, -span / 2 + (i + 0.5) * step, 0.02, zStart + rl / 2);
          roll.rotation.x = PI / 2; sg.add(roll);
        }
        if (parts) parts.roll = (parts.roll || 0) + n;
      }
    }
  }
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  for (k = -1; k <= 1; k += 2) {
    var t = mesh(gg, M.plaster); t.rotation.y = k * PI / 2;
    t.position.set(k * (w / 2 + 0.004), -0.02, k * 0.02); g.add(t);
  }
  g.add(box(w + 0.2, 0.055, 0.09, M.ink, 0, h + 0.025, 0));
  var f1 = box(0.06, 0.09, 0.08, M.ink, (w + 0.2) / 2 - 0.01, h + 0.09, 0); f1.rotation.z = 0.4; g.add(f1);
  var f2 = box(0.06, 0.09, 0.08, M.ink, -(w + 0.2) / 2 + 0.01, h + 0.09, 0); f2.rotation.z = -0.4; g.add(f2);
  return g;
}

/* 檐角卷尾钩（v2）：Torus 弧段回卷 + 卷尖珠（金） */
function curlEnd34(M, s) {
  var g = grp(); s = s || 1;
  var arc = PI * 1.15;
  var t = mesh(new THREE.TorusGeometry(0.018 * s, 0.007 * s, 8, 12, arc), M.gold);
  g.add(t);
  var endA = arc;
  g.add(sph(0.008 * s, M.gold, cos(endA) * 0.018 * s, sin(endA) * 0.018 * s, 0));
  return g;
}

/* 青绿釉瓦翘檐（lv4 层檐，v2：四坡歇山 + 前坡筒瓦垄 + 戗脊四出 + 檐角卷尾钩 +
 * 米金脊带端鞍座）；坡面组各自升到脊高、绕脊倾斜 */
function pagodaRoof(M, o, parts) {
  var w = o.w, d = o.d, h = o.h;
  var g = grp();
  var eaveF = d / 2 + 0.09, eaveS = w / 2 + 0.09;
  var pitchF = Math.atan2(h, eaveF), pitchS = Math.atan2(h, eaveS);
  var lenF = Math.sqrt(eaveF * eaveF + h * h) + 0.02;
  var lenS = Math.sqrt(eaveS * eaveS + h * h) + 0.02;
  var sgF = grp(); sgF.position.set(0, h, 0); sgF.rotation.x = pitchF; g.add(sgF);
  sgF.add(box(w * 0.7 + 0.16, 0.03, lenF, M.glaze, 0, 0, lenF / 2));
  sgF.add(box(w * 0.7 + 0.18, 0.05, 0.026, M.trim, 0, -0.004, eaveF));
  if (o.rolls) {                                              /* v2 前坡筒瓦垄 */
    var rr = 0.016, n = o.rolls, i;
    var zStart = Math.max(0.08, (rr * 0.9 * cos(pitchF) + 0.02) / sin(pitchF));
    var zEnd = lenF - 0.035, rl = zEnd - zStart;
    if (rl > 0.08) {
      var span = w * 0.7 + 0.12, step = span / n;
      for (i = 0; i < n; i++) {
        var roll = cyl(rr, rr, rl, 12, M.glaze, -span / 2 + (i + 0.5) * step, 0.02, zStart + rl / 2);
        roll.rotation.x = PI / 2; sgF.add(roll);
      }
      if (parts) parts.roll = (parts.roll || 0) + n;
    }
  }
  var sgB = grp(); sgB.position.set(0, h, 0); sgB.rotation.x = -pitchF; g.add(sgB);
  sgB.add(box(w * 0.7 + 0.16, 0.03, lenF, M.glazeS, 0, 0, -lenF / 2));
  var slR = grp(); slR.position.set(0, h, 0); slR.rotation.z = -pitchS; g.add(slR);
  slR.add(box(lenS, 0.03, d * 0.7 + 0.1, M.glazeS, lenS / 2, 0, 0));
  var slL = grp(); slL.position.set(0, h, 0); slL.rotation.z = pitchS; g.add(slL);
  slL.add(box(lenS, 0.03, d * 0.7 + 0.1, M.glazeS, -lenS / 2, 0, 0));
  /* v2 戗脊四出（米金，沿对角到檐角） */
  var corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  var diagH = Math.sqrt(eaveS * eaveS + eaveF * eaveF);
  var pitchD = Math.atan2(h, diagH);
  var lenD = Math.sqrt(diagH * diagH + h * h) + 0.02;
  for (i = 0; i < 4; i++) {
    var c = corners[i];
    var rg = grp(); rg.position.set(0, h, 0);
    rg.rotation.y = Math.atan2(c[0] * eaveS, c[1] * eaveF); g.add(rg);
    var rp = grp(); rp.rotation.x = pitchD; rg.add(rp);
    rp.add(box(0.02, 0.024, lenD - 0.04, M.trim, 0, 0.012, (lenD - 0.04) / 2 + 0.03));
  }
  /* 四角起翘 + 金卷尾钩（v2：托座 + Torus 回卷 + 卷尖珠；卷面落在径向竖直面内） */
  for (i = 0; i < 4; i++) {
    var c2 = corners[i];
    var lift = box(0.07, 0.045, 0.07, M.trim, c2[0] * (eaveS - 0.03), 0.055, c2[1] * (eaveF - 0.03));
    lift.rotation.z = -c2[0] * 0.62; g.add(lift);
    var hook = curlEnd34(M, 1.1);
    put(g, hook, c2[0] * (eaveS - 0.005), 0.11, c2[1] * (eaveF - 0.005), Math.atan2(c2[0], c2[1]) + PI / 2, 0, 0);
  }
  if (parts) parts.curl = (parts.curl || 0) + 4;
  /* 米金脊带（脊顶收口）+ v2 端鞍座 ×2 */
  g.add(box(w * 0.36, 0.05, d * 0.36 + 0.06, M.trim, 0, h - 0.005, 0));
  g.add(box(0.07, 0.04, d * 0.36 + 0.08, M.trim, w * 0.18, h + 0.012, 0));
  g.add(box(0.07, 0.04, d * 0.36 + 0.08, M.trim, -w * 0.18, h + 0.012, 0));
  return g;
}

/* 攒尖宝顶（lv4 crown，v2 +四棱米金脊条 + 串环加高 ×3 + 尖针）：
 * 方锥釉瓦（Cone 4 段=刻意方锥）+ 基环 + 角钩 + 高尖顶串环 */
function pagodaCrown(M, o, parts) {
  var w = o.w, h = o.h;
  var g = grp();
  var r = (w / 2 + 0.09) * 1.414;
  var pyr = mesh(new THREE.ConeGeometry(r, h, 4), M.glaze);
  pyr.rotation.y = PI / 4;
  pyr.position.y = h / 2;
  g.add(pyr);
  g.add(box(w + 0.12, 0.05, w + 0.12, M.trim, 0, 0.02, 0));
  /* v2 四棱米金脊条（自宝顶顶点沿方锥四条棱下到檐角） */
  var slant = Math.sqrt(r * r + h * h), i;
  for (i = 0; i < 4; i++) {
    var rg = grp(); rg.position.set(0, h, 0); rg.rotation.y = PI / 4 + i * PI / 2; g.add(rg);
    var rp = grp(); rp.rotation.x = Math.atan2(h, r); rg.add(rp);
    rp.add(box(0.018, 0.02, slant - 0.02, M.trim, 0, 0.008, (slant - 0.02) / 2 + 0.01));
  }
  var corners = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
  var e = w / 2 + 0.06;
  for (i = 0; i < 4; i++) {
    var hk = box(0.02, 0.05, 0.02, M.gold, corners[i][0] * e, 0.09, corners[i][1] * e);
    hk.rotation.z = -corners[i][0] * 0.5; g.add(hk);
  }
  /* 串环尖针（v2 加高：针 0.3 + 金环 ×3 + 顶珠 + 尖针） */
  g.add(cyl(0.012, 0.02, 0.3, 12, M.dark, 0, h + 0.14, 0));
  g.add(cyl(0.05, 0.05, 0.014, 12, M.gold, 0, h + 0.09, 0));
  g.add(cyl(0.038, 0.038, 0.012, 12, M.gold, 0, h + 0.17, 0));
  g.add(cyl(0.028, 0.028, 0.012, 12, M.gold, 0, h + 0.24, 0));
  g.add(sph(0.026, M.gold, 0, h + 0.32, 0));
  g.add(cyl(0.005, 0.005, 0.12, 12, M.dark, 0, h + 0.42, 0));
  if (parts) parts.crown = (parts.crown || 0) + 1;
  return g;
}

/* 木栏檐廊（lv2）：地栿 + 竖棂 + 扶手 */
function woodRail(M, w) {
  var g = grp();
  g.add(box(w, 0.032, 0.05, M.woodD, 0, 0, 0));
  var n = Math.max(5, Math.round(w / 0.13)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.018, 0.14, 0.015, M.wood, -w / 2 + i * (w / n), 0.088, 0.012));
  }
  g.add(box(w + 0.03, 0.026, 0.028, M.woodD, 0, 0.168, 0.012));
  return g;
}

/* 朱漆石栏平座（lv4，v2 +中枋）：座 + 望柱 + 中枋 + 寻杖 */
function stoneBalustrade(M, w) {
  var g = grp();
  g.add(box(w, 0.05, 0.045, M.stone, 0, 0.025, 0));
  var n = Math.max(4, Math.round(w / 0.26)), i;
  for (i = 0; i <= n; i++) {
    g.add(box(0.024, 0.13, 0.03, M.vermi, -w / 2 + i * (w / n), 0.105, 0));
  }
  g.add(box(w, 0.02, 0.024, M.stone, 0, 0.105, 0));           /* v2 中枋 */
  g.add(box(w, 0.024, 0.034, M.stone, 0, 0.178, 0));
  return g;
}

/* 朱漆圆柱（金箍 + 石础）；simple=单柱身省 mesh */
function vermiColumn(M, h, r, simple) {
  var g = grp();
  if (simple) {
    g.add(cyl(r, r, h, 12, M.vermi, 0, h / 2, 0));
    return g;
  }
  g.add(cyl(r * 1.4, r * 1.6, 0.04, 12, M.stoneD, 0, 0.02, 0));
  g.add(cyl(r, r, h, 12, M.vermi, 0, 0.04 + h / 2, 0));
  g.add(cyl(r * 1.2, r * 1.2, 0.026, 12, M.gold, 0, 0.04 + h * 0.85, 0));
  return g;
}

/* 朱漆钟鼓层拱窗（v2 新增）：Extrude 拱环框（外拱 - 内拱孔）+ 暗龛 + 金钥石 + 米金窗台 */
function archWin(M, w, h1, parts) {
  var g = grp();
  var W = w, H1 = h1, Wi = w * 0.62, Hi = h1 * 0.62;
  function archShape(hw, hh) {
    var s = new THREE.Shape();
    s.moveTo(-hw, 0);
    s.lineTo(-hw, hh);
    s.absarc(0, hh, hw, PI, 0, true);
    s.lineTo(hw, 0);
    s.closePath();
    return s;
  }
  var outer = archShape(W / 2, H1);
  outer.holes.push(archShape(Wi / 2, Hi));
  var frame = mesh(new THREE.ExtrudeGeometry(outer, { depth: 0.03, bevelEnabled: false, curveSegments: 12 }), M.vermiD);
  g.add(frame);
  var rec = box(Wi * 0.92, Hi + Wi / 2 * 0.9, 0.012, M.ink, 0, (Hi + Wi / 2 * 0.9) / 2 - 0.005, 0.012);
  g.add(rec);                                                  /* 暗龛 */
  var key = box(0.032, 0.05, 0.014, M.gold, 0, H1 + W / 2 + 0.012, 0.034);
  g.add(key);                                                  /* 金钥石 */
  g.add(box(W + 0.06, 0.02, 0.05, M.trim, 0, -0.01, 0.012));   /* 米金窗台 */
  if (parts) parts.arch = (parts.arch || 0) + 1;
  return g;
}

/* 石台基踏步组（v2：级缘踏步 + 两侧垂带斜石）：
 * n 级踏步自 z0（最前一级中心）向 -z 升到台明 top；垂带随坡斜置、尾端插入台基 */
function stoneSteps(M, w, n, x, z0, top, parts) {
  var g = grp(), i;
  var rise = top / (n + 1), tread = 0.1, pitchZ = 0.105;
  for (i = 0; i < n; i++) {
    var th = rise * (i + 1);                                     /* 该级顶面高 */
    var tz = z0 - i * pitchZ;
    g.add(box(w, th, tread, M.stoneD, 0, th / 2, tz));
    g.add(box(w + 0.02, 0.014, 0.024, M.stone, 0, th + 0.003, tz + tread / 2 - 0.012));   /* 级缘石 */
  }
  /* 垂带斜石 ×2（随踏步坡度，前低后高） */
  var run = n * pitchZ + 0.05;
  var lenH = Math.sqrt(run * run + top * top);
  var pitchA = Math.atan2(top, run);
  for (i = -1; i <= 1; i += 2) {
    var pier = box(0.06, 0.05, lenH, M.stone, i * (w / 2 + 0.035), top / 2 + 0.026, z0 + tread / 2 - run / 2);
    pier.rotation.x = pitchA;
    g.add(pier);
  }
  g.position.set(x, 0, 0);
  if (parts) parts.pier = (parts.pier || 0) + 2;
  return g;
}

/* 石狮（lv4 门狮） */
function stoneLion(M, s) {
  var g = grp(); s = s || 1;
  g.add(box(0.12 * s, 0.03 * s, 0.12 * s, M.stoneD, 0, 0.015 * s, 0));
  var body = sph(0.052 * s, M.stone, 0, 0.08 * s, 0); body.scale.set(1, 0.92, 1.3); g.add(body);
  g.add(sph(0.04 * s, M.stone, 0, 0.14 * s, 0.05 * s));
  var e1 = mesh(new THREE.ConeGeometry(0.015 * s, 0.032 * s, 12), M.stone); put(g, e1, 0.024 * s, 0.18 * s, 0.05 * s, 0, 0, -0.3);
  var e2 = mesh(new THREE.ConeGeometry(0.015 * s, 0.032 * s, 12), M.stone); put(g, e2, -0.024 * s, 0.18 * s, 0.05 * s, 0, 0, 0.3);
  return g;
}

/* ================= 4. 四阶生长（interaction 阶段挂钩 userData.anim） ================= */

/* ---- lv1 小屋：暖棕木瓦棚屋（apex≈0.95，天线至≈1.2） ---- */
function level1(M, anims, parts) {
  var g = grp();
  /* 地坪（草地 + 石板径）+ 灌丛 */
  g.add(padUnit(M, 2.3, 2.3, true));
  g.add(bush(M, 0.11, 0.95, 0.14, 0.72));
  g.add(bush(M, 0.07, -1.0, 0.11, -0.75));
  /* 台基 + 竖板墙 + 角柱 */
  g.add(box(1.36, 0.07, 1.02, M.stoneD, 0, 0.035, -0.02));
  g.add(box(1.22, 0.52, 0.88, M.plank, 0, 0.33, -0.02));
  [[-0.63, -0.48], [0.63, -0.48], [-0.63, 0.44], [0.63, 0.44]].forEach(function (c) {
    g.add(box(0.055, 0.52, 0.055, M.woodD, c[0], 0.33, c[1]));
  });
  /* 板条门（v2 +斜撑）+ 门侧壁灯（暖光呼吸） */
  g.add(box(0.3, 0.44, 0.04, M.ink, -0.26, 0.29, 0.43));
  g.add(box(0.26, 0.4, 0.045, M.wood, -0.26, 0.27, 0.435));
  g.add(box(0.26, 0.03, 0.05, M.woodD, -0.26, 0.38, 0.44));
  var brace1 = box(0.2, 0.026, 0.052, M.woodD, -0.26, 0.28, 0.448);
  brace1.rotation.z = 0.55; g.add(brace1);                    /* v2 门斜撑 */
  g.add(box(0.07, 0.1, 0.05, M.dark, 0.02, 0.5, 0.43));
  g.add(sph(0.045, M.lamp, 0.02, 0.42, 0.47));
  anims.push(function (t) { M.lamp.emissiveIntensity = 0.5 + 0.14 * sin(t * 1.9); });
  /* 门口踏步（v2 双级） */
  g.add(box(0.34, 0.045, 0.2, M.stoneD, -0.26, 0.09, 0.5));
  g.add(box(0.3, 0.03, 0.12, M.stoneD, -0.26, 0.04, 0.62));
  /* 径上踏石（v2 +2） */
  g.add(box(0.34, 0.014, 0.24, M.paving, -0.1, 0.048, 0.86));
  g.add(box(0.3, 0.014, 0.2, M.paving, -0.52, 0.048, 0.95));
  /* 披檐小窗（右前 + 右山墙；v2 warmWindow 自带窗台） */
  var win = warmWindow(M, 0.24, 0.24); put(g, win, 0.3, 0.38, 0.43);
  var aw1 = box(0.36, 0.02, 0.18, M.shingle, 0.3, 0.53, 0.5); aw1.rotation.x = 0.35; g.add(aw1);
  var win2 = warmWindow(M, 0.2, 0.2); win2.rotation.y = PI / 2; put(g, win2, 0.63, 0.4, -0.2);
  var aw2 = box(0.02, 0.02, 0.3, M.shingle, 0.65, 0.55, -0.2); aw2.rotation.z = -0.35; g.add(aw2);
  /* 暖棕木瓦双坡顶（v2 椽尾 + 脊端头） */
  var roof = shingleRoof(M, { w: 1.28, d: 0.92, h: 0.3 }, parts);
  put(g, roof, 0, 0.62, -0.02);
  /* 鱼骨天线 ×2（脊上） */
  put(g, antenna(M, 0.16, 0.9), -0.3, 0.97, -0.1);
  put(g, antenna(M, 0.14, 0.9), 0.34, 0.97, -0.02, 0.5);
  /* 街具：木箱 ×2 + 石缸 */
  put(g, crate(M, 1.0), 0.86, 0.06, 0.62);
  put(g, crate(M, 0.8), -0.92, 0.06, 0.5);
  g.add(cyl(0.07, 0.09, 0.14, 12, M.stoneD, -0.88, 0.13, -0.5));
  /* 暖光窗呼吸 */
  var wm = M.glow;
  anims.push(function (t) { wm.emissiveIntensity = 0.2 + 0.08 * sin(t * 1.1); });
  return g;
}

/* ---- lv2 洋房：红扇贝披棚铺面 + 木栏檐廊 + 灰瓦坡顶/草天台（h≈1.62） ---- */
function level2(M, anims, parts) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.2, false));
  /* 主构（tan 木构）：GFA 0.05-0.67，2F 0.72-1.2 */
  g.add(box(1.66, 0.06, 1.0, M.stoneD, -0.12, 0.03, -0.05));
  g.add(box(1.56, 0.58, 0.94, M.wood, -0.12, 0.35, -0.05));
  g.add(box(1.64, 0.05, 1.0, M.woodD, -0.12, 0.665, -0.05));
  g.add(box(1.48, 0.46, 0.88, M.plank, -0.12, 0.935, -0.05));
  /* GFA 门脸：暖光橱窗 ×2 + 木门 */
  put(g, warmWindow(M, 0.34, 0.3), -0.62, 0.32, 0.44);
  put(g, warmWindow(M, 0.34, 0.3), -0.18, 0.32, 0.44);
  g.add(box(0.3, 0.44, 0.04, M.ink, 0.32, 0.27, 0.44));
  g.add(box(0.26, 0.4, 0.045, M.woodD, 0.32, 0.25, 0.445));
  /* 红条纹扇贝披棚（包前角；v2 布褶） */
  g.add(awning(M, 1.54, 0.42, M.stripe, M.scallop, -0.12, 0.72, 0.42));
  g.add(awning(M, 0.9, 0.34, M.stripe, M.scallop, 0.68, 0.72, -0.12, PI / 2));
  /* 街具：红面凳 ×2 + 木箱 + 檐下灯笼 */
  put(g, stool(M), -0.6, 0.05, 0.72);
  put(g, stool(M), -0.32, 0.05, 0.78);
  put(g, crate(M, 0.9), 0.86, 0.05, 0.6);
  put(g, lantern(M, 0.62, anims, 0.8), -0.88, 0.64, 0.56);
  /* 2F：木栏檐廊 + 暖光窗 + 木滑门 + 垂灯笼 */
  put(g, woodRail(M, 1.3), -0.24, 0.695, 0.44);
  put(g, warmWindow(M, 0.28, 0.26), -0.52, 0.94, 0.415);
  put(g, warmWindow(M, 0.28, 0.26), -0.1, 0.94, 0.415);
  g.add(box(0.24, 0.32, 0.04, M.woodD, 0.28, 0.92, 0.415));
  put(g, lantern(M, 0.55, anims, 2.1), 0.02, 1.13, 0.46);
  put(g, lantern(M, 0.55, anims, 3.4), -0.7, 1.13, 0.46);
  /* 墙挂空调外机 ×2（v2 修复右墙外机外露） */
  g.add(acUnit(M, 0.5, 0.52, 0.42));
  g.add(acUnit(M, 0.66, 1.0, -0.36, PI / 2));
  /* 灰瓦坡顶（前 2/3；v2 前坡筒瓦垄 ×7）+ 后草天台（栏 + 天线） */
  put(g, slateRoof(M, { w: 1.44, d: 0.62, h: 0.24, rolls: 7 }, parts), -0.12, 1.2, 0.08);
  g.add(box(1.5, 0.04, 0.3, M.woodD, -0.12, 1.215, -0.35));
  g.add(box(1.46, 0.03, 0.05, M.woodD, -0.12, 1.26, -0.48));
  g.add(box(0.05, 0.03, 0.3, M.woodD, -0.85, 1.26, -0.35));
  g.add(box(0.05, 0.03, 0.3, M.woodD, 0.61, 1.26, -0.35));
  /* v2 天台矮栏竖柱 ×4 */
  [[-0.78], [-0.38], [0.14], [0.54]].forEach(function (x) {
    g.add(box(0.028, 0.09, 0.028, M.woodD, x[0], 1.3, -0.48));
  });
  g.add(box(1.36, 0.02, 0.24, M.grass, -0.12, 1.24, -0.35));
  put(g, antenna(M, 0.3, 0.9), -0.5, 1.23, -0.38);
  put(g, antenna(M, 0.24, 0.8), 0.24, 1.23, -0.4, 0.7);
  put(g, antenna(M, 0.18, 0.7), 0.52, 1.22, -0.3, 1.2);       /* v2 第三天线 */
  g.add(cyl(0.014, 0.018, 0.4, 12, M.dark, -0.12, 1.42, -0.42));
  /* 红金竖灯箱（右壁托臂，板面朝 +X；托臂插入墙内） */
  g.add(signBox(M, anims, 0.5, 0.7, 0.8, 1.12, 0.62, PI / 2));
  /* 黑柱暖头街灯（左前；v2 石座铜箍灯檐） */
  var sl = streetLamp(M, anims, 1.2, 0.95); sl.position.set(-1.08, 0.05, 0.66); g.add(sl);
  /* 暖光窗呼吸 */
  var wm = M.glow;
  anims.push(function (t) { wm.emissiveIntensity = 0.2 + 0.08 * sin(t * 1.1 + 0.5); });
  return g;
}

/* ---- lv3 大厦：六层奶油唐楼 + 屋顶梯屋铁棚群（h≈2.28） ---- */
function level3(M, anims, parts) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.35, false));
  /* 主体：GFA 0.06-0.6 + 5 层 ×0.26 → 顶 1.9 */
  g.add(box(1.6, 0.07, 1.06, M.stoneD, 0, 0.035, -0.02));
  g.add(box(1.5, 0.53, 0.98, M.plaster, 0, 0.33, -0.02));
  var fl, y0 = 0.6;
  for (fl = 0; fl < 5; fl++) {
    g.add(box(1.56, 0.035, 1.02, M.trim, 0, y0 + 0.017, -0.02));
    g.add(box(1.5, 0.225, 0.98, M.plaster, 0, y0 + 0.13, -0.02));
    y0 += 0.26;
  }
  /* v2 阴阳面分档：前阳墙板（奶油）+ 左次阳（米灰）+ 右/后阴面（灰褐），
   * 出挑 ≥0.02 无共面 */
  g.add(box(1.44, 1.835, 0.03, M.plaster, 0, 0.98, 0.48));
  g.add(box(0.03, 1.835, 0.98, M.plasterM, -0.755, 0.98, -0.02));
  g.add(box(0.03, 1.835, 0.98, M.plasterS, 0.755, 0.98, -0.02));
  g.add(box(1.5, 1.835, 0.03, M.plasterS, 0, 0.98, -0.53));
  parts.shade = (parts.shade || 0) + 3;
  /* 2F 青绿墙板带（出挑于阳面板之前） */
  g.add(box(1.44, 0.2, 0.04, M.canSlate, 0, 0.86, 0.5));
  /* GFA 门脸：橱窗 ×2 + 门 + 黄绿帆布棚包角 + 灯笼（v2 立面统一进至 z=0.505） */
  put(g, warmWindow(M, 0.36, 0.3), -0.48, 0.3, 0.505);
  put(g, warmWindow(M, 0.36, 0.3), 0.06, 0.3, 0.505);
  g.add(box(0.28, 0.4, 0.04, M.ink, 0.48, 0.26, 0.505));
  g.add(box(0.24, 0.36, 0.045, M.woodD, 0.48, 0.24, 0.51));
  g.add(awning(M, 1.7, 0.44, M.lime, M.lime, 0, 0.6, 0.485));
  g.add(awning(M, 1.0, 0.36, M.lime, M.lime, 0.68, 0.6, -0.1, PI / 2));
  put(g, lantern(M, 0.55, anims, 0.9), -0.78, 0.5, 0.6);
  put(g, lantern(M, 0.55, anims, 2.4), 0.62, 0.5, 0.6);
  /* 4 层暖光窗对 + 灰蓝窗棚 */
  var fw = [0.87, 1.13, 1.39, 1.65], fi;
  for (fi = 0; fi < fw.length; fi++) {
    put(g, warmWindow(M, 0.26, 0.22), -0.32, fw[fi], 0.505);
    put(g, warmWindow(M, 0.26, 0.22), 0.3, fw[fi], 0.505);
    g.add(awning(M, 0.86, 0.2, M.canSlate, M.canSlate, -0.01, fw[fi] + 0.16, 0.49));
  }
  /* v2 侧面窗 ×2（左次阳面） */
  var sw1 = warmWindow(M, 0.22, 0.2); sw1.rotation.y = -PI / 2; put(g, sw1, -0.775, 1.13, 0.14);
  var sw2 = warmWindow(M, 0.22, 0.2); sw2.rotation.y = -PI / 2; put(g, sw2, -0.775, 1.65, 0.3);
  /* 墙挂空调外机 ×3（v2 修复：前置两台原埋入墙体内不可见） */
  g.add(acUnit(M, 0.62, 1.05, 0.53));
  g.add(acUnit(M, 0.62, 1.55, 0.53));
  g.add(acUnit(M, -0.78, 1.32, 0.1, PI / 2));
  /* 屋顶：收口檐 + 女儿墙 + 草皮 */
  g.add(box(1.6, 0.06, 1.06, M.trim, 0, 1.92, -0.02));
  g.add(box(1.52, 0.05, 0.05, M.plasterS, 0, 1.955, -0.5));
  g.add(box(0.05, 0.05, 1.0, M.plasterS, 0.76, 1.955, -0.02));
  g.add(box(0.05, 0.05, 1.0, M.plasterS, -0.76, 1.955, -0.02));
  g.add(box(1.42, 0.02, 0.9, M.grass, 0, 1.935, -0.05));
  /* 屋顶群：混凝土梯屋（v2 +门 + 顶平台栏杆）+ 锈色铁棚（v2 +斜撑）+ 竖管 */
  g.add(box(0.5, 0.2, 0.42, M.plasterS, -0.42, 2.03, -0.28));
  g.add(box(0.54, 0.03, 0.46, M.trim, -0.42, 2.145, -0.28));
  g.add(box(0.14, 0.12, 0.016, M.ink, -0.42, 1.99, -0.06));       /* 梯屋门（出墙 0.018） */
  g.add(box(0.02, 0.1, 0.016, M.dark, -0.63, 2.21, -0.07));       /* v2 顶平台栏杆柱 ×2 */
  g.add(box(0.02, 0.1, 0.016, M.dark, -0.21, 2.21, -0.07));
  g.add(box(0.44, 0.016, 0.02, M.dark, -0.42, 2.25, -0.07));      /* v2 栏杆横档 ×2 */
  g.add(box(0.44, 0.016, 0.02, M.dark, -0.42, 2.2, -0.07));
  g.add(box(0.4, 0.12, 0.4, M.rust, 0.3, 1.99, -0.2));
  var shed = box(0.46, 0.02, 0.46, M.rust, 0.3, 2.06, -0.2); shed.rotation.x = 0.12; g.add(shed);
  var st1 = box(0.018, 0.14, 0.018, M.dark, 0.52, 2.0, -0.02); st1.rotation.x = -0.5; g.add(st1);
  var st2 = box(0.018, 0.14, 0.018, M.dark, 0.52, 2.0, -0.38); st2.rotation.x = 0.5; g.add(st2);
  g.add(cyl(0.016, 0.016, 0.28, 12, M.dark, 0.55, 2.09, -0.44));  /* v2 竖管 */
  g.add(box(0.05, 0.02, 0.05, M.dark, 0.55, 2.235, -0.44));
  parts.pipe = (parts.pipe || 0) + 1;
  /* 天线 ×2 + 避雷针（总高 ≤2.3） */
  put(g, antenna(M, 0.15, 0.9), -0.1, 2.05, -0.4);
  put(g, antenna(M, 0.12, 0.85), 0.5, 2.08, -0.42, 0.8);
  g.add(cyl(0.008, 0.012, 0.1, 12, M.dark, -0.42, 2.2, -0.28));
  /* 红金竖灯箱（右壁托臂，板面朝 +X；中段） */
  g.add(signBox(M, anims, 1.4, 0.84, 0.9, 1.25, 0.4, PI / 2));
  /* 小绿吊牌（右墙） */
  g.add(box(0.02, 0.22, 0.16, M.vermiD, 0.79, 0.62, 0.05));
  var gp = mesh(new THREE.PlaneGeometry(0.12, 0.17), M.lime); put(g, gp, 0.775, 0.62, 0.05, PI / 2);
  /* 红消防栓（右前） + 街灯（左前；v2） + 木箱 */
  var hy = grp();
  hy.add(cyl(0.032, 0.04, 0.09, 12, M.vermi, 0, 0.045, 0));
  hy.add(sph(0.03, M.vermi, 0, 0.1, 0));
  hy.add(box(0.09, 0.024, 0.024, M.vermiD, 0, 0.06, 0));
  put(g, hy, 1.02, 0.06, 0.86);
  var sl = streetLamp(M, anims, 2.0, 1.05); sl.position.set(-1.1, 0.05, 0.78); g.add(sl);
  put(g, crate(M, 0.9), 0.9, 0.05, 0.72);
  /* 暖光窗呼吸 */
  var wm = M.glow;
  anims.push(function (t) { wm.emissiveIntensity = 0.2 + 0.08 * sin(t * 1.15 + 0.8); });
  return g;
}

/* ---- lv4 地标：尖沙咀钟楼塔式建筑群（h≈2.69） ---- */
function level4(M, anims, parts) {
  var g = grp();
  /* 地坪 + 石台基 + 双阶踏步（v2 垂带 + 级缘）+ 门狮 */
  g.add(padUnit(M, 2.5, 2.36, false));
  g.add(box(2.12, 0.06, 1.66, M.stoneD, 0, 0.03, -0.02));
  g.add(box(2.04, 0.1, 1.58, M.stone, 0, 0.11, -0.02));
  g.add(stoneSteps(M, 0.48, 2, -0.24, 0.92, 0.16, parts));
  g.add(stoneSteps(M, 0.48, 2, 0.38, 0.92, 0.16, parts));
  put(g, stoneLion(M, 1.1), -0.72, 0.16, 0.72);
  /* GFA 红柱廊（0.16-0.72）：tan 墙 + 橙红楞纹棚包角 + 暖光店面 + 金匾木门 +
   * v2 额枋彩画 + 门簪 ×2 */
  g.add(box(1.78, 0.56, 1.14, M.wood, 0, 0.44, -0.06));
  g.add(box(1.86, 0.05, 1.2, M.vermiD, 0, 0.735, -0.06));
  g.add(box(1.86, 0.045, 0.05, M.vermiD, 0, 0.7, 0.55));       /* v2 额枋 */
  g.add(box(1.86, 0.014, 0.052, M.gold, 0, 0.672, 0.552));     /* v2 彩画枋金条 */
  put(g, vermiColumn(M, 0.5, 0.036), -0.72, 0.16, 0.52);
  put(g, vermiColumn(M, 0.5, 0.036, true), -0.26, 0.16, 0.58);
  put(g, vermiColumn(M, 0.5, 0.036, true), 0.26, 0.16, 0.58);
  put(g, vermiColumn(M, 0.5, 0.036), 0.72, 0.16, 0.52);
  g.add(awning(M, 1.9, 0.46, M.orange, M.orange, 0, 0.77, 0.44));
  g.add(awning(M, 1.06, 0.36, M.orange, M.orange, 0.82, 0.77, -0.1, PI / 2));
  put(g, warmWindow(M, 0.38, 0.3), -0.5, 0.36, 0.55);
  put(g, warmWindow(M, 0.38, 0.3), 0.42, 0.36, 0.55);
  g.add(box(0.3, 0.44, 0.04, M.ink, -0.02, 0.4, 0.56));
  g.add(box(0.26, 0.4, 0.045, M.vermiD, -0.02, 0.38, 0.565));
  g.add(box(0.2, 0.07, 0.02, M.gold, -0.02, 0.52, 0.565));
  g.add(cyl(0.012, 0.012, 0.03, 12, M.gold, -0.07, 0.585, 0.575));  /* v2 门簪 ×2 */
  g.add(cyl(0.012, 0.012, 0.03, 12, M.gold, 0.03, 0.585, 0.575));
  put(g, lantern(M, 0.6, anims, 0.4), -0.88, 0.66, 0.6);
  put(g, lantern(M, 0.6, anims, 1.8), 0.84, 0.66, 0.6);
  /* 平座 0：GFA 顶朱栏（v2 +中枋） */
  put(g, stoneBalustrade(M, 1.8), 0, 0.76, 0.52);
  /* 一层退台（0.76-1.14）：奶油墙（v2 阴阳面分档：右阴/左次阳；下沿补齐至平座顶）+ 暖窗 ×3 + 朱柱 */
  g.add(box(1.5, 0.38, 0.98, M.plaster, 0, 0.95, -0.1));
  g.add(box(0.03, 0.38, 0.94, M.plasterS, 0.755, 0.95, -0.1));
  g.add(box(0.03, 0.38, 0.94, M.plasterM, -0.755, 0.95, -0.1));
  parts.shade = (parts.shade || 0) + 2;
  put(g, warmWindow(M, 0.24, 0.22), -0.42, 0.96, 0.4);
  put(g, warmWindow(M, 0.24, 0.22), 0, 0.96, 0.4);
  put(g, warmWindow(M, 0.24, 0.22), 0.42, 0.96, 0.4);
  put(g, vermiColumn(M, 0.34, 0.03, true), -0.68, 0.78, 0.42);
  put(g, vermiColumn(M, 0.34, 0.03, true), 0.68, 0.78, 0.42);
  /* 一层翘檐（eave 1.14 → apex≈1.36，v2 筒瓦垄 + 戗脊 + 卷尾钩） */
  put(g, pagodaRoof(M, { w: 1.42, d: 0.92, h: 0.22, rolls: 7 }, parts), 0, 1.14, -0.1);
  /* 平座 1 + 朱栏 */
  g.add(box(1.56, 0.045, 1.02, M.stone, 0, 1.16, -0.1));
  put(g, stoneBalustrade(M, 1.5), 0, 1.185, 0.39);
  /* 二层退台（1.18-1.5）：tan 墙 + 暖窗 ×2 + 青绿窗帽 */
  g.add(box(1.18, 0.32, 0.82, M.wood, 0, 1.34, -0.12));
  put(g, warmWindow(M, 0.22, 0.2), -0.26, 1.34, 0.3);
  put(g, warmWindow(M, 0.22, 0.2), 0.26, 1.34, 0.3);
  g.add(awning(M, 0.34, 0.14, M.canSlate, M.canSlate, -0.26, 1.48, 0.29));
  g.add(awning(M, 0.34, 0.14, M.canSlate, M.canSlate, 0.26, 1.48, 0.29));
  put(g, vermiColumn(M, 0.3, 0.028, true), -0.52, 1.2, 0.32);
  put(g, vermiColumn(M, 0.3, 0.028, true), 0.52, 1.2, 0.32);
  /* 二层翘檐（eave 1.52 → apex≈1.72，插入鼓壁生根；v2 筒瓦垄 + 戗脊 + 卷尾钩） */
  put(g, pagodaRoof(M, { w: 1.1, d: 0.76, h: 0.2, rolls: 6 }, parts), 0, 1.52, -0.12);
  /* 平座 2 + 朱栏（让位鼓壁外凸） */
  g.add(box(1.2, 0.04, 0.86, M.stone, 0, 1.535, -0.12));
  put(g, stoneBalustrade(M, 1.14), 0, 1.56, 0.24);
  /* 钟鼓层（1.55-1.91）：朱漆鼓壁 + 金箍带 ×2 + 拱窗 ×4 + 钟面 + 走针机构 + 双灯笼 */
  g.add(cyl(0.42, 0.44, 0.36, 12, M.vermi, 0, 1.73, -0.12));
  g.add(cyl(0.462, 0.462, 0.014, 14, M.gold, 0, 1.585, -0.12));   /* v2 金箍带下 */
  g.add(cyl(0.458, 0.458, 0.014, 14, M.gold, 0, 1.875, -0.12));   /* v2 金箍带上 */
  /* v2 拱窗 ×4（十字分布避开钟面） */
  var aw = [1.05, -1.05, 2.35, -2.35], ai;
  for (ai = 0; ai < aw.length; ai++) {
    var wg = archWin(M, 0.2, 0.12, parts);
    wg.position.set(sin(aw[ai]) * 0.418, 1.72, -0.12 + cos(aw[ai]) * 0.418);
    wg.rotation.y = aw[ai];
    g.add(wg);
  }
  var faceGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.05, 20);
  var clockTex = getTex('clock', texClock);
  var faceSide = MAT('p34clockSide', function () { return std('#c03028', { rough: 0.5 }); });
  var faceCap = MAT('p34clockCap', function () { return std('#ffffff', { map: clockTex, rough: 0.5 }); });
  var face = new THREE.Mesh(faceGeo, [faceSide, faceCap, faceCap]);
  face.castShadow = true; face.receiveShadow = true;
  face.rotation.x = PI / 2;
  face.position.set(0, 1.75, 0.325);
  g.add(face);
  var bezel = mesh(new THREE.TorusGeometry(0.27, 0.024, 10, 20), M.gold);
  bezel.position.set(0, 1.75, 0.3); g.add(bezel);
  /* 走针机构（v2：时针/分针 + 锚尾配重 + 金帽轴心；≈10:10 起步缓动） */
  var hands = grp(); hands.position.set(0, 1.75, 0.36); g.add(hands);
  var hourPivot = grp(), minPivot = grp();
  hourPivot.name = 'p34hourHand'; minPivot.name = 'p34minHand';
  hourPivot.add(box(0.03, 0.13, 0.012, M.dark, 0, 0.05, 0));
  hourPivot.add(box(0.024, 0.05, 0.01, M.dark, 0, -0.035, 0));     /* v2 时针锚尾 */
  minPivot.add(box(0.024, 0.19, 0.012, M.dark, 0, 0.08, 0));
  minPivot.add(box(0.018, 0.06, 0.01, M.dark, 0, -0.04, 0));       /* v2 分针锚尾 */
  hands.add(hourPivot); hands.add(minPivot);
  hourPivot.rotation.z = -1.05; minPivot.rotation.z = 0.55;
  anims.push(function (t) {                                        /* 走针：分针 0.052rad/s、时针 1/12 */
    minPivot.rotation.z = 0.55 - t * 0.052;
    hourPivot.rotation.z = -1.05 - t * 0.0043;
  });
  g.add(cyl(0.015, 0.015, 0.022, 12, M.gold, 0, 1.75, 0.365));     /* v2 金帽轴心 */
  parts.clockHands = 2;
  put(g, lantern(M, 0.52, anims, 2.6), -0.3, 1.84, 0.16);
  put(g, lantern(M, 0.52, anims, 3.8), 0.3, 1.84, 0.16);
  /* 攒尖宝顶（坐在鼓顶 1.91 上：v2 脊条 + 串环加高，尖顶至≈2.63） */
  put(g, pagodaCrown(M, { w: 0.94, h: 0.3 }, parts), 0, 1.91, -0.12);
  /* 前角红金竖灯箱（对，托臂插入 GFA 墙身，板面朝左右外；v2 灯座 + 灯点） */
  g.add(signBox(M, anims, 0.8, 0.6, 0.92, 0.4, 0.62, PI / 2));
  g.add(signBox(M, anims, 2.2, 0.6, -0.92, 0.4, 0.62, -PI / 2));
  /* 墙挂空调 + 小碟天线 */
  g.add(acUnit(M, 0.6, 1.02, 0.42));
  var dish = mesh(new THREE.SphereGeometry(0.07, 16, 12, 0, PI * 2, 0, PI / 2), M.stone);
  put(g, dish, 0.85, 0.52, 0.2, 0, -0.9, 0.4);
  /* 街灯 ×2（天星码头灯柱；v2） + 灌丛 */
  var sl1 = streetLamp(M, anims, 0.7, 1.1); sl1.position.set(-1.16, 0.05, 0.92); g.add(sl1);
  var sl2 = streetLamp(M, anims, 2.9, 1.02); sl2.position.set(1.14, 0.05, 0.95); g.add(sl2);
  g.add(bush(M, 0.09, -1.06, 0.12, 0.4));
  g.add(bush(M, 0.08, 1.05, 0.11, 0.5));
  /* 暖光窗呼吸 */
  var wm = M.glow;
  anims.push(function (t) { wm.emissiveIntensity = 0.2 + 0.08 * sin(t * 1.05 + 1.3); });
  return g;
}

/* ================= 5. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[34] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var parts = {};
  var g = BUILDERS[lv - 1](M, anims, parts);
  g.name = 'prop_34_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 34;
  g.userData.level = lv;
  g.userData.region = 'g7';
  g.userData.parts = parts;              /* v2：专项部件计数（smoke 断言用） */
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
