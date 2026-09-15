/* =====================================================================================
 * 大富翁 · 个性化地产 格 8 「田子坊」 —— 沪上弄堂商铺楼四阶演进（v2 精修版）
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/prop_8.png（四阶一体参考图，唯一视觉真源）。
 * 格名：data.js BOARD[8] = 田子坊（g2 沪上风华组），参考图即上海弄堂/石库门商铺楼族谱，
 *       与格名完全匹配；本文件以参考图 + 输出契约（Props3D[8]）为准。
 *
 * —— v1 → v2 精修摘要（对照参考图逐项清偿；整体形态/配色/布局/朝向契约不变） ————
 *   1) 石库门门头：整根光滑 torus 拱环 → 9 块块石拱券逐块放射砌筑（voussoirs）+
 *      雕饰拱心石（主石 + 凿刻凹槽 + lv4 鎏金嵌钉）+ 弧肩脊肩部双涡卷 + 门阶三级。
 *   2) 红砖：128px → 256px 逐皮错缝贴图（每皮半砖错缝、接缝包裹无缝、逐砖色差、
 *      皮底落影/皮顶高光）；噪声随机改种子化（mulberry32，确定性输出）。
 *   3) 乌黑扇贝篷：5 片扁半圆拼贴 → 整片波浪垂边（Shape 波浪底缘挤出，连续无缝）
 *      + 两侧垂片 + 斜撑杆；lv4 朱红垂帘波浪加密 + 鎏金压条 + 侧垂尾。
 *   4) lv4 木装堂层：板缝贴图升级（竖向错缝板缝）+ 4 根几何板缝条 + 木踢脚裙板。
 *   5) 格窗：棂条 1 竖 2 横 → 2 竖 3 横（可调密度 vx/hx）；lv4 主立面 3 排 ×4 樘
 *      格窗阵列；窗框加下亮钩棂。
 *   6) 栏杆：直圆台柱 → LatheGeometry 宝瓶柱（12 段旋成面）+ 望柱 + 球顶；
 *      lv4 主立面三叠阳台（0.70 / 1.16 / 1.62，层线随中线微调 +0.04~0.07）。
 *   7) 灯笼串：新增 lanternString（挂线 + 金属挂环 + 牛腿支架 metalness 0.7 +
 *      成串多灯）；lv4 双串 + 檐角单灯，lv3 双挂灯；灯笼身加竹篾箍带 2 道。
 *   8) 翘角板瓦层顶：几何瓦垄（顺坡半圆垄条，大顶 5×2 坡）+ 4 条垂脊 + 正脊脊座
 *      + 鎏金卷角吻升级（双段卷曲 + 吻尾鳍板 + 底座）。
 *   9) lv2 草橙直篷：4 幅宽条 → 7 幅细条纹（草橙 × 米白）+ 前沿垂边 + 双撑杆；
 *      lv1 板皮顶增挂瓦搭接条 + 苔斑团；隅石改长短皮交替咬合。
 *  其余：动画保持并增强（lv3+ 增窗光呼吸；lv4 灯笼串摇），幅值克制
 *  （旋转 ≤0.1rad、emissive 波动 ≤0.14）；圆柱段 ≥12、球段 16×12 全线对齐规范；
 *  纹理 ≤512px（实际 64–256px）；MeshStandardMaterial + convertSRGBToLinear。
 *
 * —— 身份定义特征（identity-defining，任一错误即 fail 该 pass） ————————
 *   1) 石库门拱门头：四阶均在，前右角，块石拱券 + 拱心石 + 弧肩脊 + 藤蔓 + 石阶
 *   2) 弧肩荷兰山墙：凹弧肩 + 石压顶 + 涡卷端（lv2-lv3；lv4 换翘角层顶）
 *   3) 遮篷族谱：草橙直布篷 → 乌黑波浪扇贝篷 → 朱红扇贝垂帘（禁与 prop_6 鼠尾草绿混淆）
 *   4) 红砖 × 淡灰绿石材双色（隅石/壁柱/层间线）
 *   5) 矩形木棂窗（非拱窗！）+ 暖黄呼吸光 + 石窗台
 *   6) lv4 翘角板瓦双叠层顶 + 鎏金卷角吻 + 红灯笼串
 * 四阶演进（同一块地同一风格的生长史，v1 已验收形态不变）：
 *   lv1 小屋  H 0.8–1.2：weathered 板条棚屋 + 苔痕板皮人字顶 + 偏厦门廊 + 石库门头 + 石板地
 *   lv2 洋房  H 1.2–1.7：两层红砖商铺 + 草橙直篷 + 柜台开间 + 木瓶栏阳台 + 首座弧肩山墙 +
 *             山墙后板瓦坡顶 + 石库门头，店窗呼吸 + 挂匾摇曳
 *   lv3 大厦  H 1.7–2.3：三层起台 + 乌黑波浪篷 + 市摊货物 + 双层宝瓶栏阳台 + 红灯笼 ×2 +
 *             山墙放大带拱窗 + 侧翼披楼 + 「田子坊」木匾
 *   lv4 地标  H 2.3–3.0：完整地标：木装堂层 + 朱红垂帘店面 + 格窗阵列 + 三叠宝瓶栏阳台 +
 *             灯笼串 + 翘角板瓦双叠层顶（几何瓦垄/鎏金卷角吻/朱红封檐）+ 鎏金牌坊匾 + 侧翼楼
 * 材质：MeshStandardMaterial（convertSRGBToLinear）；Canvas 程序化纹理 ≤512px。
 * 光照：不添加灯光（场景级光照）；暖窗/灯笼/金匾用 emissive 克制表现。
 * 交互（userData.anim = [fn(t,dt)]，幅度克制）：lv1 窗光呼吸；lv2 店窗呼吸 + 挂匾摇；
 *   lv3 灯笼摇 ×2 + 匾额微光 + 窗光呼吸；lv4 灯笼串摇 + 金匾/鎏金流辉 + 窗光呼吸。
 * 预算：每级 ≤350 mesh；占地 ≤2.6×2.6；原点=格心、底面 y=0；正面朝 +Z。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_8] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ============================ 0. 基础件（blockout 层） ============================ */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
  if (o.map) { m.map = o.map; }
  if (o.opacity !== undefined) { m.transparent = true; m.opacity = o.opacity; }
  if (o.envInt) m.envMapIntensity = o.envInt;
  if (o.side) m.side = o.side;
  return m;
}
/* 材质缓存（同参数共享；需独立动画的材质务必单独 std() 创建） */
var _mc = {};
function MAT(hex, o) {
  o = o || {};
  var k = hex + '|' + o.rough + '|' + o.metal + '|' + o.emissive + '|' + (o.map ? o.map.uuid : '');
  if (_mc[k]) return _mc[k];
  var m = std(hex, o); _mc[k] = m; return m;
}
function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z) { o.position.set(x || 0, y || 0, z || 0); parent.add(o); return o; }
function anim(g, fn) { (g.userData.anim || (g.userData.anim = [])).push(fn); }
/* 种子化随机（mulberry32）：贴图噪声确定性输出，禁 Math.random */
function rng32(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* 顺坡构件（垄条/垂脊）：a→b 两点间放置圆柱 */
var _up = new THREE.Vector3(0, 1, 0);
function slopePart(g, mat, a, b, r) {
  var va = new THREE.Vector3(a[0], a[1], a[2]), vb = new THREE.Vector3(b[0], b[1], b[2]);
  var d = vb.clone().sub(va), L = d.length();
  var p = cyl(r, r, L, 12, mat);
  p.position.copy(va).addScaledVector(d, 0.5);
  p.quaternion.setFromUnitVectors(_up, d.normalize());
  g.add(p);
  return p;
}

/* ============================ 1. 风格色板（逐区采样自参考图） ============================ */
var P8 = {
  brick:   '#a8614a',   /* 红砖主面 */
  brickD:  '#8c4f3c',   /* 砖暗部/脚线 */
  stone:   '#b3b0a2',   /* 淡灰绿石材（隅石/拱门） */
  stoneL:  '#c4c1b2',   /* 石亮部（压顶） */
  stoneD:  '#969488',   /* 石暗部（勒脚/台阶） */
  stoneF:  '#a19b8a',   /* 围墙石 */
  slate:   '#3f4a56',   /* 板瓦亮面 */
  slateD:  '#333d48',   /* 板瓦暗缝 */
  plank:   '#8a7a5e',   /* lv1 银灰板条 */
  plankD:  '#6e6a58',
  shing:   '#75705e',   /* lv1 苔痕 shingle */
  woodD:   '#4e3a26',   /* 深木框/门 */
  woodM:   '#7a5a38',   /* 中木（栏/柜台） */
  glow:    '#f4b968',   /* 暖黄窗光 */
  glaz:    '#2c3138',   /* 暗玻璃 */
  straw:   '#c8813f',   /* lv2 草橙篷 */
  strawD:  '#a86a34',
  cream:   '#d9c8a4',   /* lv2 篷米白条纹 */
  teal:    '#4d7a70',   /* lv2 青绿百叶 */
  awnDk:   '#3a3f46',   /* lv3 乌黑篷 */
  awnDk2:  '#2c3138',
  redAwn:  '#a63a30',   /* lv4 朱红垂帘/封檐 */
  redAwn2: '#c05a48',
  lantern: '#c8402e',   /* 红灯笼 */
  gilt:    '#c9973f',   /* 鎏金 */
  giltD:   '#8a5a20',
  moss:    '#7d9052',   /* 苔痕/草 */
  grass:   '#93a45a',
  pave:    '#b8b2a0',   /* 石板地 */
  paveD:   '#a19b8a',
  plaqueBg:'#26221a',   /* 匾底 */
  plaqueFg:'#e2c274'    /* 匾字 */
};

/* ============================ 2. Canvas 程序化纹理（≤512px，种子化确定性） ============================ */
function cv2(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function toTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }

var _texBrick = null;
function texBrick() {  /* 红砖 v2：256px 逐皮错缝（每皮半砖错位 + 逐砖色差 + 皮底落影/皮顶高光） */
  if (_texBrick) return _texBrick;
  var S = 256, row = 21, bw = 42, jt = 2;
  var c = cv2(S, S), g = c.getContext('2d');
  g.fillStyle = '#cfc6b2'; g.fillRect(0, 0, S, S);            /* 灰浆底（露出即砖缝） */
  var rnd = rng32(20808081);
  var tints = ['#a8614a', '#a05a44', '#b06a50', '#9c563f', '#aa654e'];
  for (var y = 0, r = 0; y < S; y += row, r++) {
    var off = (r % 2) ? Math.floor(bw / 2) : 0;               /* 逐皮半砖错缝 */
    for (var x = -bw + off; x < S; x += bw) {
      g.fillStyle = tints[Math.floor(rnd() * tints.length)];
      g.fillRect(x + jt, y + jt, bw - jt * 2, row - jt * 2);
      g.fillStyle = 'rgba(58,26,18,0.2)';                     /* 皮底落影 */
      g.fillRect(x + jt, y + row - jt - 2, bw - jt * 2, 2);
      g.fillStyle = 'rgba(238,178,138,0.18)';                 /* 皮顶高光 */
      g.fillRect(x + jt, y + jt, bw - jt * 2, 1);
      for (var i = 0; i < 5; i++) {                           /* 逐砖斑驳 */
        g.fillStyle = rnd() > 0.5 ? 'rgba(58,26,18,0.14)' : 'rgba(226,146,106,0.13)';
        g.fillRect(x + jt + rnd() * (bw - 10), y + jt + 3 + rnd() * (row - 9), 3 + rnd() * 5, 2);
      }
    }
  }
  for (var n = 0; n < 130; n++) {                             /* 全幅风化噪点 */
    g.fillStyle = rnd() > 0.5 ? 'rgba(40,20,14,0.08)' : 'rgba(220,200,170,0.07)';
    g.fillRect(rnd() * S, rnd() * S, 2 + rnd() * 4, 1 + rnd() * 2);
  }
  _texBrick = toTex(c); _texBrick.wrapS = _texBrick.wrapT = THREE.RepeatWrapping;
  return _texBrick;
}
var _texPlankH = null;
function texPlankH() {  /* 木板 v2：256px 横板 + 竖向错缝板缝（lv1 棚屋 / lv4 堂层） */
  if (_texPlankH) return _texPlankH;
  var S = 256, row = 26;
  var c = cv2(S, S), g = c.getContext('2d');
  g.fillStyle = P8.plank; g.fillRect(0, 0, S, S);
  var rnd = rng32(8082323);
  for (var y = 0, r = 0; y < S; y += row, r++) {
    g.fillStyle = 'rgba(38,30,20,0.55)'; g.fillRect(0, y, S, 2);
    g.fillStyle = 'rgba(200,188,160,0.2)'; g.fillRect(0, y + 2, S, 1);
    var bx = 30 + Math.floor(rnd() * 90);                     /* 每皮 1~2 道竖向板缝（错缝） */
    g.fillStyle = 'rgba(38,30,20,0.5)';
    g.fillRect(bx, y, 2, row);
    if (rnd() > 0.45) g.fillRect((bx + 128) % S, y, 2, row);
    for (var i = 0; i < 10; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(56,46,32,0.26)' : 'rgba(196,182,150,0.2)';
      g.fillRect(rnd() * 240, y + 4 + rnd() * 18, 8 + rnd() * 16, 1 + rnd() * 2);
    }
  }
  _texPlankH = toTex(c); _texPlankH.wrapS = _texPlankH.wrapT = THREE.RepeatWrapping;
  return _texPlankH;
}
var _texSlate = null;
function texSlate() {  /* 板瓦 pan-cover：竖向盖瓦垄 + 横向叠瓦缝 */
  if (_texSlate) return _texSlate;
  var S = 96;
  var c = cv2(S, S), g = c.getContext('2d');
  g.fillStyle = P8.slate; g.fillRect(0, 0, S, S);
  for (var x = 0; x < S; x += 24) {
    g.fillStyle = P8.slateD; g.fillRect(x + 11, 0, 4, S);           /* 盖瓦缝 */
    g.fillStyle = 'rgba(150,164,182,0.3)'; g.fillRect(x + 1, 0, 3, S);  /* 瓦面高光 */
    g.fillStyle = 'rgba(30,40,52,0.35)'; g.fillRect(x + 17, 0, 3, S);
  }
  g.fillStyle = 'rgba(20,28,38,0.42)';
  for (var y = 10; y < S; y += 20) g.fillRect(0, y, S, 3);          /* 叠瓦横缝 */
  _texSlate = toTex(c); _texSlate.wrapS = _texSlate.wrapT = THREE.RepeatWrapping;
  return _texSlate;
}
var _texShingle = null;
function texShingle() {  /* lv1 苔痕板皮：错缝 shingle + 苔斑 */
  if (_texShingle) return _texShingle;
  var S = 256;
  var c = cv2(S, S), g = c.getContext('2d');
  g.fillStyle = P8.shing; g.fillRect(0, 0, S, S);
  var rnd = rng32(11408);
  for (var y = 0; y < S; y += 26) {
    var off = (y / 26) % 2 ? 0 : 22;
    g.fillStyle = 'rgba(30,28,20,0.5)'; g.fillRect(0, y, S, 3);
    for (var x = off; x < S; x += 46) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(46,42,30,0.35)' : 'rgba(168,158,130,0.3)';
      g.fillRect(x, y + 3, 44, 20);
      g.fillStyle = 'rgba(210,198,168,0.16)';
      g.fillRect(x, y + 3, 44, 2);
    }
  }
  for (var i = 0; i < 34; i++) {  /* 苔斑 */
    g.fillStyle = 'rgba(104,124,66,' + (0.14 + rnd() * 0.2).toFixed(3) + ')';
    g.beginPath();
    g.arc(rnd() * S, rnd() * S, 4 + rnd() * 12, 0, PI * 2);
    g.fill();
  }
  _texShingle = toTex(c); _texShingle.wrapS = _texShingle.wrapT = THREE.RepeatWrapping;
  return _texShingle;
}
/* 匾额：深板 + 描金字（emissiveMap 微光可供动画） */
function textPlate8(text, w, h, o) {
  o = o || {};
  var cw = 160, ch = 56, c = cv2(cw, ch), g = c.getContext('2d');
  g.fillStyle = o.bg || P8.plaqueBg; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = o.border || '#6f6552'; g.lineWidth = 6; g.strokeRect(5, 5, cw - 10, ch - 10);
  g.fillStyle = o.fg || P8.plaqueFg; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold ' + Math.round(ch * 0.6) + 'px "Microsoft YaHei","PingFang SC","SimHei",sans-serif';
  g.fillText(text, cw / 2, ch / 2 + 2);
  var tex = toTex(c);
  var g8 = grp();
  g8.add(box(w, h, 0.035, o.backMat || MAT(P8.woodD)));
  var face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.86),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.1, flatShading: true,
      emissive: C(o.fg || P8.plaqueFg), emissiveIntensity: o.ei !== undefined ? o.ei : 0.12, emissiveMap: tex }));
  face.position.z = 0.024; g8.add(face);
  g8.userData.faceMat = face.material;
  return g8;
}

/* ============================ 3. Kit 预制件（structure/form 层） ============================ */
/* 砖墙块（六面砖纹，按尺寸设 repeat） */
function brickBox(w, h, d, rx, ry) {
  var t = texBrick().clone(); t.needsUpdate = true; t.repeat.set(rx || 2, ry || 2);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.9 }));
}
function plankBox(w, h, d, rx, ry) {
  var t = texPlankH().clone(); t.needsUpdate = true; t.repeat.set(rx || 1, ry || 1);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.92 }));
}
function shingleBox(w, h, d, rx, ry) {
  var t = texShingle().clone(); t.needsUpdate = true; t.repeat.set(rx || 1, ry || 1);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.95 }));
}
function slateBox(w, h, d, rx, ry) {
  var t = texSlate().clone(); t.needsUpdate = true; t.repeat.set(rx || 2, ry || 1);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.6 }));
}
/* 淡石隅石 v2：长短皮交替咬合（4 段，长皮外凸） */
function quoinStrip(h, x, z) {
  var g = grp();
  var n = 4, ch = h / n;
  for (var i = 0; i < n; i++) {
    var longP = (i % 2) === 0;
    g.add(box(longP ? 0.095 : 0.062, ch + 0.002, 0.058, longP ? MAT(P8.stoneL) : MAT(P8.stone),
      0, ch * (i + 0.5), longP ? 0.014 : 0.002));
  }
  g.position.set(x, 0, z);
  return g;
}
/* 矩形木棂花格窗 v2（身份特征 #5，非拱窗）：木框 + 玻璃 + 密棂（vx 竖 × hx 横）
 * + 石窗台 (+木百叶) = 3+vx+hx(+2) mesh；默认 2 竖 3 横 */
function latticeWindow(w, h, o) {
  o = o || {};
  var vx = o.vx !== undefined ? o.vx : 2, hx = o.hx !== undefined ? o.hx : 3;
  var g = grp(), fm = MAT(o.frame || P8.woodD), gl = o.glowMat || MAT(P8.glaz, { rough: 0.4, metal: 0.1 });
  g.add(box(w + 0.05, h + 0.05, 0.035, fm));
  g.add(box(w, h, 0.03, gl, 0, 0, 0.004));
  for (var i = 0; i < vx; i++) {
    g.add(box(0.024, h, 0.04, fm, -w / 2 + w * (i + 1) / (vx + 1), 0, 0.009));
  }
  for (var j = 0; j < hx; j++) {
    g.add(box(w, 0.022, 0.04, fm, 0, -h / 2 + h * (j + 1) / (hx + 1), 0.009));
  }
  g.add(box(w + 0.14, 0.04, 0.07, MAT(P8.stoneL), 0, -h / 2 - 0.006, 0.014));  /* 石窗台 */
  if (o.shutter) {                                             /* 两侧木百叶 */
    var sm = MAT(o.shutterCol || P8.woodM);
    g.add(box(0.05, h * 0.92, 0.024, sm, -w / 2 - 0.055, 0, 0.006));
    g.add(box(0.05, h * 0.92, 0.024, sm, w / 2 + 0.055, 0, 0.006));
  }
  g.userData.glassMat = gl;
  return g;
}
/* 店面暖光橱窗 v2：大玻璃 + 十字棂 + 边梃 + 木裙板 + 柜沿 = 8 mesh */
function shopGlow(w, h) {
  var g = grp();
  g.add(box(w + 0.06, h + 0.06, 0.04, MAT(P8.woodD)));
  var gm = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.5 });
  g.add(box(w, h, 0.032, gm, 0, 0, 0.005));
  g.add(box(0.03, h, 0.042, MAT(P8.woodD), 0, 0, 0.009));
  g.add(box(w, 0.026, 0.042, MAT(P8.woodD), 0, h * 0.18, 0.009));
  g.add(box(0.04, h, 0.036, MAT(P8.woodD), -w / 2 - 0.035, 0, 0.004));
  g.add(box(0.04, h, 0.036, MAT(P8.woodD), w / 2 + 0.035, 0, 0.004));
  var sk = plankBox(w + 0.06, 0.14, 0.08, 2, 1); put(g, sk, 0, -h / 2 - 0.115, 0.018);  /* 木裙板 */
  g.add(box(w + 0.1, 0.03, 0.12, MAT(P8.woodM), 0, -h / 2 - 0.045, 0.035));            /* 柜台沿 */
  g.userData.glowMat = gm;
  return g;
}
/* 板门 v2：门框 + 木内门 + 2 横板缝 + 铜门环 + 石槛 = 6 mesh */
function boardDoor(w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.04, 0.035, MAT(P8.woodD)));
  g.add(box(w - 0.02, h - 0.03, 0.024, MAT(P8.woodM), 0, -0.01, 0.014));
  g.add(box(w - 0.02, 0.018, 0.03, MAT(P8.woodD), 0, -0.01 + h * 0.22, 0.02));
  g.add(box(w - 0.02, 0.018, 0.03, MAT(P8.woodD), 0, -0.01 - h * 0.2, 0.02));
  var ring = mesh(new THREE.TorusGeometry(0.018, 0.005, 8, 12), MAT(P8.gilt, { metal: 0.6, rough: 0.45 }));
  ring.position.set(w * 0.28, -0.02, 0.03); g.add(ring);       /* 铜门环（金属件） */
  g.add(box(w + 0.14, 0.045, 0.07, MAT(P8.stoneL), 0, -h / 2 - 0.005, 0.014));
  return g;
}
/* 石库门拱门头 v2（身份特征 #1）：双块石墩 + 墩帽 + 块石拱券（9 块 voussoirs 放射砌筑）
 * + 雕饰拱心石（凿刻凹槽，lv4 鎏金嵌钉）+ 弧肩脊 + 肩部涡卷 + 侧墙 + 藤蔓 + 石阶
 * w=净跨, h=墩高; lv3 加「田子坊」木匾, lv4 鎏金匾。~29-33 mesh */
function shikumenGate(w, h, lv) {
  var g = grp(); g.name = 'p8_gate';
  var r = w / 2 + 0.04;
  var pm = MAT(P8.stone), pmL = MAT(P8.stoneL);
  g.add(box(0.15, h, 0.15, pm, -r - 0.05, h / 2, 0));           /* 左墩 */
  g.add(box(0.15, h, 0.15, pm, r + 0.05, h / 2, 0));            /* 右墩 */
  g.add(box(0.2, 0.045, 0.2, pmL, -r - 0.05, h + 0.022, 0));    /* 墩帽 ×2 */
  g.add(box(0.2, 0.045, 0.2, pmL, r + 0.05, h + 0.022, 0));
  /* 拱背衬带（细弧） */
  var band = mesh(new THREE.TorusGeometry(r - 0.028, 0.03, 8, 18, PI), pm);
  band.position.y = h; g.add(band);
  /* 块石拱券：9 块 voussoirs（顶位 i=4 换雕饰拱心石），放射砌筑逐块错缝 */
  var N = 8;
  for (var i = 0; i <= N; i++) {
    if (i === 4) continue;
    var th = PI * i / N;
    var v = box(0.052, 0.062, 0.125, (i % 2) ? pmL : pm,
      Math.cos(th) * r, h + Math.sin(th) * r, 0);
    v.rotation.z = th - PI / 2;
    g.add(v);
  }
  /* 拱心石（雕饰）：主石楔形 + 凿刻凹槽 ×2 + lv4 鎏金嵌钉 */
  var ks = grp(); ks.position.set(0, h + r + 0.012, 0); g.add(ks);
  var kShape = new THREE.Shape();
  kShape.moveTo(-0.032, -0.055); kShape.lineTo(0.032, -0.055);
  kShape.lineTo(0.02, 0.062); kShape.lineTo(-0.02, 0.062);
  kShape.closePath();
  var kBody = mesh(new THREE.ExtrudeGeometry(kShape, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1 }), pmL);
  kBody.position.z = -0.065; ks.add(kBody);
  ks.add(box(0.028, 0.012, 0.014, MAT(P8.stoneD), 0, 0.028, 0.072));   /* 凿刻凹槽 ×2 */
  ks.add(box(0.028, 0.012, 0.014, MAT(P8.stoneD), 0, -0.006, 0.072));
  if (lv >= 4) {
    var pin = cyl(0.011, 0.011, 0.016, 12, MAT(P8.gilt, { metal: 0.6, rough: 0.4, emissive: P8.giltD, ei: 0.12 }), 0, -0.038, 0.076);
    pin.rotation.x = PI / 2; ks.add(pin);                      /* 鎏金嵌钉 */
  }
  /* 弧肩脊（小曲线压顶，冠于拱上——石库门门头） */
  var s = new THREE.Shape();
  var cw = w + 0.42, cw2 = cw / 2, chh = 0.12 + w * 0.1, capBase = h + r + 0.02;
  s.moveTo(-cw2, 0);
  s.lineTo(-cw2, chh * 0.36);
  s.quadraticCurveTo(-cw2, chh * 0.72, -cw2 * 0.44, chh * 0.88);
  s.quadraticCurveTo(0, chh * 1.04, cw2 * 0.44, chh * 0.88);
  s.quadraticCurveTo(cw2, chh * 0.72, cw2, chh * 0.36);
  s.lineTo(cw2, 0);
  s.closePath();
  var capG = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 10 }), pmL);
  capG.position.y = capBase; g.add(capG);
  /* 肩部涡卷 ×2（四分之一环，v2 由圆柱升级） */
  [-1, 1].forEach(function (sd) {
    var vo = mesh(new THREE.TorusGeometry(0.036, 0.014, 8, 12, PI * 0.65), pm);
    vo.position.set(sd * cw2 * 0.72, capBase + chh * 0.34, 0.05);
    vo.rotation.z = sd > 0 ? -PI * 0.82 : PI * 0.82; g.add(vo);
  });
  /* 侧墙（连到地块边界方向）+ 压顶 */
  g.add(box(0.2, h * 0.55, 0.11, MAT(P8.stoneF), r + 0.17, h * 0.275, 0));
  g.add(box(0.24, 0.035, 0.14, MAT(P8.stoneD), r + 0.17, h * 0.55 + 0.017, 0));
  /* 藤蔓（2 团绿 + 1 垂条） */
  var vm = MAT(P8.moss, { rough: 0.95 });
  var v1 = sph(0.055, vm, -r * 0.55, h + 0.09, 0.075); v1.scale.set(1.25, 0.8, 0.7); g.add(v1);
  var v2 = sph(0.045, vm, r * 0.62, h + 0.07, 0.07); v2.scale.set(1.1, 0.75, 0.65); g.add(v2);
  var v3 = box(0.02, 0.16, 0.014, vm, -r - 0.02, h - 0.14, 0.078); v3.rotation.z = 0.18; g.add(v3);
  /* 石阶 ×2 */
  g.add(box(w + 0.2, 0.032, 0.16, MAT(P8.stoneD), 0, 0.016, 0.12));
  g.add(box(w + 0.28, 0.032, 0.12, MAT(P8.stoneD), 0, 0.048, 0.2));
  /* 匾位：lv3 木匾 / lv4 鎏金匾 */
  if (lv >= 4) {
    var giltM = std(P8.gilt, { rough: 0.4, metal: 0.5, emissive: P8.giltD, ei: 0.15 });
    var pl = textPlate8('田子坊', 0.3, 0.1, { bg: '#1d1a14', fg: '#e8c87a', border: '#8a6a30', ei: 0.16 });
    pl.position.set(0, capBase + chh * 0.5, 0.062); g.add(pl);
    g.add(box(0.34, 0.115, 0.014, giltM, 0, capBase + chh * 0.5, 0.05));
    g.userData.giltMat = giltM;
    g.userData.plaqueMat = pl.userData.faceMat;
  } else if (lv === 3) {
    var pl3 = textPlate8('田子坊', 0.28, 0.095, { bg: '#26221a', fg: '#d8b86a', ei: 0.1 });
    pl3.position.set(0, capBase + chh * 0.5, 0.058); g.add(pl3);
    g.userData.plaqueMat = pl3.userData.faceMat;
  }
  return g;
}
/* 弧肩荷兰山墙 v2（身份特征 #2）：凹弧肩 + 涡卷端（四分之一环）+ 石压顶
 * (+lv3 拱窗) —— 6~14 mesh */
function dutchGable(w, h, depth, lv) {
  var g = grp(), w2 = w / 2;
  var s = new THREE.Shape();
  s.moveTo(-w2, 0);
  s.lineTo(-w2, h * 0.3);
  s.quadraticCurveTo(-w2, h * 0.66, -w2 * 0.55, h * 0.82);
  s.quadraticCurveTo(-w2 * 0.24, h * 0.94, 0, h);
  s.quadraticCurveTo(w2 * 0.24, h * 0.94, w2 * 0.55, h * 0.82);
  s.quadraticCurveTo(w2, h * 0.66, w2, h * 0.3);
  s.lineTo(w2, 0);
  s.closePath();
  var body = mesh(new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.007, bevelSegments: 1, curveSegments: 12 }),
    MAT(P8.brick, { rough: 0.88 }));
  g.add(body);
  /* 石压顶：沿轮廓顶缘的三段 */
  g.add(box(w * 0.42, 0.028, depth + 0.02, MAT(P8.stoneL), 0, h + 0.008, depth / 2));
  g.add(box(0.028, h * 0.3, depth + 0.02, MAT(P8.stoneL), -w2 + 0.014, h * 0.15 + h * 0.3, depth / 2));
  g.add(box(0.028, h * 0.3, depth + 0.02, MAT(P8.stoneL), w2 - 0.014, h * 0.15 + h * 0.3, depth / 2));
  /* 两端涡卷（四分之一圆环贴肩） */
  [-1, 1].forEach(function (sd) {
    var vo = mesh(new THREE.TorusGeometry(0.045, 0.017, 8, 12, PI * 0.62), MAT(P8.stone));
    vo.position.set(sd * w2 * 0.94, h * 0.34, depth + 0.02);
    vo.rotation.z = sd > 0 ? -0.9 : PI + 0.9;
    g.add(vo);
  });
  /* 山墙中央小拱窗（lv2 实心浮雕 / lv3 密棂小窗） */
  if (lv >= 3) {
    var aw = latticeWindow(0.11, 0.13, { vx: 1, hx: 2 });
    aw.position.set(0, h * 0.42, depth + 0.01); g.add(aw);
  } else {
    g.add(box(0.12, 0.1, 0.02, MAT(P8.stone), 0, h * 0.42, depth + 0.006));
    g.add(box(0.07, 0.055, 0.014, MAT(P8.stoneL), 0, h * 0.42, depth + 0.018));  /* 浮雕芯 */
  }
  return g;
}
/* 山墙后板瓦两坡顶 v2：2 坡 + 正脊 + 滚瓦 + 2 山花封板 + 挂瓦条 ×4 = 11 mesh */
function slateGableRoof(w, rise, half) {
  var g = grp();
  var slope = Math.sqrt(rise * rise + half * half), ang = Math.atan2(rise, half);
  var rF = slateBox(w + 0.06, 0.03, slope, 2, 1); rF.rotation.x = ang; rF.position.set(0, rise / 2, half / 2); g.add(rF);
  var rB = slateBox(w + 0.06, 0.03, slope, 2, 1); rB.rotation.x = -ang; rB.position.set(0, rise / 2, -half / 2); g.add(rB);
  g.add(box(w + 0.1, 0.042, 0.06, MAT(P8.slateD), 0, rise + 0.012, 0));
  var roll = cyl(0.02, 0.02, w + 0.08, 12, MAT(P8.slateD), 0, rise + 0.045, 0);  /* 正脊滚瓦 */
  roll.rotation.z = PI / 2; g.add(roll);
  for (var bt = 0; bt < 2; bt++) {                             /* 挂瓦条 ×2/坡 */
    var u = 0.34 + bt * 0.34;
    g.add(box(w + 0.02, 0.014, 0.02, MAT(P8.slateD), 0, rise * u + 0.024, half * u + 0.008));
    g.add(box(w + 0.02, 0.014, 0.02, MAT(P8.slateD), 0, rise * u + 0.024, -half * u - 0.008));
  }
  var sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.026, bevelEnabled: false });
  for (var sd = -1; sd <= 1; sd += 2) {
    var tp = mesh(tg, MAT(P8.brickD));
    tp.rotation.y = PI / 2 * sd; tp.position.set(sd * (w / 2 + 0.004), 0, 0);
    g.add(tp);
  }
  return g;
}
/* 宝瓶柱旋成面（LatheGeometry 12 段；prop_8 专属瓶身曲线，与 prop_6 区分） */
var _vase8 = null;
function vase8Geo() {
  if (_vase8) return _vase8;
  var pts = [
    new THREE.Vector2(0.005, 0), new THREE.Vector2(0.02, 0.004), new THREE.Vector2(0.022, 0.014),
    new THREE.Vector2(0.015, 0.03), new THREE.Vector2(0.011, 0.046), new THREE.Vector2(0.017, 0.062),
    new THREE.Vector2(0.021, 0.074), new THREE.Vector2(0.02, 0.082), new THREE.Vector2(0.012, 0.094),
    new THREE.Vector2(0.012, 0.104), new THREE.Vector2(0.018, 0.114)
  ];
  _vase8 = new THREE.LatheGeometry(pts, 12);
  return _vase8;
}
/* 木/石宝瓶栏阳台 v2：deck + (n+1) 宝瓶柱 + 顶轨 + 2 望柱 + 2 球顶 = n+7 mesh */
function balustrade(w, d, n, mat) {
  var g = grp(); g.name = 'p8_balc';
  g.add(box(w, 0.035, d, mat, 0, 0, d / 2));
  for (var i = 0; i <= n; i++) {
    var v = mesh(vase8Geo(), mat);
    v.position.set(-w / 2 + i * (w / n), 0.035, d - 0.015);
    g.add(v);
  }
  g.add(box(w + 0.04, 0.028, 0.045, mat, 0, 0.15, d - 0.015));
  [-w / 2, w / 2].forEach(function (x) {                       /* 望柱 + 球顶 */
    g.add(box(0.036, 0.17, 0.048, mat, x, 0.085, d - 0.015));
    g.add(sph(0.02, mat, x, 0.185, d - 0.015));
  });
  return g;
}
/* 草橙直布篷 v2（lv2）：7 幅细条纹（草橙×米白）+ 前沿垂边 + 双撑杆 = 10 mesh */
function awningStraight(w) {
  var g = grp();
  var cm = MAT(P8.straw, { rough: 0.9 }), cm2 = MAT(P8.cream, { rough: 0.9 });
  var n = 7;
  for (var i = 0; i < n; i++) {
    var tt = i / (n - 1), a = (18 + 34 * tt) * PI / 180;
    var seg = box(w, 0.016, 0.15, (i % 2) ? cm2 : cm);
    seg.position.set(0, -cos(a) * 0.26, sin(a) * 0.26);
    seg.rotation.x = -a * 0.5;
    g.add(seg);
  }
  var val = box(w, 0.045, 0.014, MAT(P8.strawD, { rough: 0.9 }), 0, -cos(18 * PI / 180) * 0.26 - 0.05, sin(18 * PI / 180) * 0.26 + 0.01);
  g.add(val);                                                  /* 前沿垂边 */
  var rod = cyl(0.009, 0.009, w + 0.06, 12, MAT(P8.woodD));
  rod.rotation.z = PI / 2;
  rod.position.set(0, -cos(52 * PI / 180) * 0.26, sin(52 * PI / 180) * 0.26);
  g.add(rod);
  var rod2 = cyl(0.009, 0.009, w + 0.06, 12, MAT(P8.woodD));
  rod2.rotation.z = PI / 2;
  rod2.position.set(0, -cos(18 * PI / 180) * 0.26, sin(18 * PI / 180) * 0.26);
  g.add(rod2);
  return g;
}
/* 波浪垂边 Shape（底缘 n 波连续无缝，遮篷族谱共用） */
function waveValanceShape(w, h, n) {
  var s = new THREE.Shape();
  var seg = w / n;
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, -h * 0.42);
  for (var i = 0; i < n; i++) {
    var x1 = w / 2 - seg * i, x0 = x1 - seg;
    s.quadraticCurveTo((x0 + x1) / 2, -h, x0, -h * 0.42);
  }
  s.closePath();
  return s;
}
/* 乌黑波浪扇贝篷 v2（lv3）：斜篷板 + 波浪垂边（整片挤出）+ 两侧垂片 + 斜撑杆 = 5 mesh */
function awningScallop(w, col) {
  var g = grp();
  var cm = MAT(col || P8.awnDk, { rough: 0.88 });
  var bd = box(w, 0.02, 0.16, cm, 0, 0, 0.1); bd.rotation.x = -0.5; g.add(bd);
  var val = mesh(new THREE.ExtrudeGeometry(waveValanceShape(w, 0.15, 7), { depth: 0.016, bevelEnabled: false }), cm);
  val.position.set(0, -0.062, 0.182); g.add(val);              /* 波浪垂边 */
  [-1, 1].forEach(function (sd) {                              /* 两侧垂片 */
    var fs = new THREE.Shape();
    fs.moveTo(0, 0); fs.lineTo(sd * 0.1, 0); fs.lineTo(sd * 0.055, -0.085); fs.closePath();
    var fp = mesh(new THREE.ExtrudeGeometry(fs, { depth: 0.014, bevelEnabled: false }), cm);
    fp.position.set(sd * w / 2, -0.055, 0.176); g.add(fp);
  });
  var rod = cyl(0.008, 0.008, w + 0.06, 12, MAT(P8.woodD));
  rod.rotation.z = PI / 2; rod.position.set(0, -0.09, 0.22); g.add(rod);
  return g;
}
/* 朱红扇贝垂帘 v2（lv4）：波浪垂帘（8 波）+ 上篷斜板 + 鎏金压条 = 4 mesh */
function valanceRed(w, h) {
  var g = grp();
  var val = mesh(new THREE.ExtrudeGeometry(waveValanceShape(w, h, 8), { depth: 0.02, bevelEnabled: false }), MAT(P8.redAwn, { rough: 0.85 }));
  g.add(val);
  var top = box(w, 0.016, 0.2, MAT(P8.redAwn2, { rough: 0.85 }), 0, 0.03, 0.1);
  top.rotation.x = -0.42; g.add(top);
  g.add(box(w * 0.98, 0.012, 0.012, MAT(P8.gilt, { metal: 0.5, rough: 0.45 }), 0, 0.012, 0.168));  /* 鎏金压条 */
  return g;
}
/* 红灯笼 v2：身(16×12) + 竹篾箍带 ×2 + 上下盖 + 穗 + 挂钩 = 7 mesh（串上小灯 lite=5） */
function redLantern(s, lite) {
  s = s || 1;
  var g = grp();
  var body = sph(0.05 * s, MAT(P8.lantern, { rough: 0.55, emissive: '#ff9a50', ei: 0.35 }), 0, 0, 0);
  body.scale.y = 1.15; g.add(body);
  if (!lite) {
    var ribm = MAT('#8a2a1c', { rough: 0.6 });
    var r1 = mesh(new THREE.TorusGeometry(0.045 * s, 0.004 * s, 8, 14), ribm);
    r1.rotation.x = PI / 2; r1.position.y = 0.014 * s; g.add(r1);
    var r2 = mesh(new THREE.TorusGeometry(0.045 * s, 0.004 * s, 8, 14), ribm);
    r2.rotation.x = PI / 2; r2.position.y = -0.014 * s; g.add(r2);
  }
  g.add(cyl(0.02 * s, 0.026 * s, 0.02 * s, 12, MAT(P8.gilt, { metal: 0.4, rough: 0.45 }), 0, 0.062 * s, 0));
  g.add(cyl(0.026 * s, 0.02 * s, 0.02 * s, 12, MAT(P8.gilt, { metal: 0.4, rough: 0.45 }), 0, -0.062 * s, 0));
  g.add(box(0.012 * s, 0.05 * s, 0.01 * s, MAT('#d8b04a', { rough: 0.8 }), 0, -0.095 * s, 0));
  g.add(cyl(0.006 * s, 0.006 * s, 0.03 * s, 12, MAT(P8.woodD), 0, 0.085 * s, 0));
  return g;
}
/* 檐下挂灯笼点（钩 + 金属环 + 灯笼；返回 sway 挂点） */
function hangLantern(s, lite) {
  var g = grp();
  g.add(cyl(0.007, 0.007, 0.035, 12, MAT(P8.woodD), 0, -0.017, 0));
  var ring = mesh(new THREE.TorusGeometry(0.008, 0.003, 8, 12), MAT(P8.gilt, { metal: 0.7, rough: 0.4 }));
  ring.position.y = -0.04; g.add(ring);                        /* 金属挂环 */
  var l = redLantern(s || 1, lite); l.position.y = -0.075 * (s || 1) - 0.045; g.add(l);
  return g;
}
/* 灯笼串 v2（金属件）：牛腿支架 + 挂线 2 段 + n 灯（各带金属挂环）= 4 + n×7 mesh
 * 组原点=墙面锚点，整串绕锚点微摇（userData.anim 由调用方接） */
function lanternString(n, s, len) {
  var g = grp(); g.name = 'p8_string';
  s = s || 1;
  var met = MAT(P8.gilt, { metal: 0.7, rough: 0.4 });
  g.add(box(0.018, 0.018, 0.09, met, 0, 0, 0.045));            /* 牛腿支架 */
  var oring = mesh(new THREE.TorusGeometry(0.009, 0.003, 8, 12), met);
  oring.position.set(0, -0.012, 0.09); g.add(oring);           /* 锚点金属环 */
  var wire = MAT(P8.woodD, { rough: 0.7 });
  var L = len || 0.3;
  slopePart(g, wire, [0, -0.02, 0.09], [0.02 * s, -L * 0.55, 0.075], 0.0035);
  slopePart(g, wire, [0.02 * s, -L * 0.55, 0.075], [0.035 * s, -L, 0.06], 0.0035);
  for (var i = 0; i < n; i++) {
    var u = (i + 0.5) / n;
    var lx = 0.035 * s * u, ly = -0.02 - L * u * 0.96, lz = 0.09 - 0.03 * u;
    var ring = mesh(new THREE.TorusGeometry(0.007, 0.0025, 8, 12), met);
    ring.position.set(lx, ly + 0.1, lz); g.add(ring);          /* 灯上金属挂环 */
    var l = redLantern(Math.max(0.7, s - i * 0.12), true);     /* 串上小灯（lite 省箍带） */
    l.position.set(lx, ly, lz); g.add(l);
  }
  return g;
}
/* 柜台（面 + 2 侧板 + 前沿 = 3 mesh） */
function counter8(w) {
  var g = grp();
  g.add(box(w, 0.035, 0.22, MAT(P8.woodM), 0, 0.2, 0));
  g.add(box(0.035, 0.18, 0.2, MAT(P8.woodD), -w / 2 + 0.03, 0.09, 0));
  g.add(box(0.035, 0.18, 0.2, MAT(P8.woodD), w / 2 - 0.03, 0.09, 0));
  return g;
}
/* 市摊货物（筐 ×2 + 货团 + 货箱 = 5 mesh） */
function stallGoods() {
  var g = grp();
  var b1 = cyl(0.05, 0.038, 0.05, 12, MAT('#9c6a3e', { rough: 0.9 }), -0.08, 0.24, 0.02); g.add(b1);
  var f1 = sph(0.03, MAT('#c8903e', { rough: 0.85 }), -0.08, 0.275, 0.02); f1.scale.y = 0.6; g.add(f1);
  var b2 = cyl(0.045, 0.034, 0.045, 12, MAT('#8a5a34', { rough: 0.9 }), 0.06, 0.235, -0.02); g.add(b2);
  g.add(box(0.09, 0.05, 0.09, MAT(P8.woodM), 0.0, 0.265, 0.06));
  return g;
}
/* 陶盆绿植（盆 + 2 绿团 = 3 mesh，球 16×12） */
function potPlant(s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.06 * s, 0.07 * s, 12, MAT('#9c5a38', { rough: 0.8 }), 0, 0.035 * s, 0));
  put(g, sph(0.05 * s, MAT('#5d7c3a', { rough: 0.95 }), 0, 0.1 * s, 0), 0, 0.1 * s, 0);
  put(g, sph(0.032 * s, MAT('#7a9a4e', { rough: 0.95 }), 0.03 * s, 0.075 * s, 0.02 * s), 0.03 * s, 0.075 * s, 0.02 * s);
  return g;
}
/* 花箱（箱 + 2 绿团 = 3 mesh） */
function planterBox(w) {
  var g = grp();
  g.add(box(w, 0.05, 0.07, MAT(P8.woodD), 0, 0, 0));
  put(g, sph(0.03, MAT('#6f8f44', { rough: 0.95 }), -w * 0.22, 0.042, 0), -w * 0.22, 0.042, 0);
  put(g, sph(0.03, MAT('#7a9a4e', { rough: 0.95 }), w * 0.2, 0.04, 0.01), w * 0.2, 0.04, 0.01);
  return g;
}
function bush8(s, col) {
  var b = sph(0.085 * (s || 1), MAT(col || '#6f8f44', { rough: 0.95 }), 0, 0, 0);
  b.scale.y = 0.8; return b;
}
/* 矮石墙 + 压顶（2 mesh） */
function yardWall8(len, ry) {
  var g = grp();
  g.add(box(len, 0.15, 0.07, MAT(P8.stoneF), 0, 0.075, 0));
  g.add(box(len + 0.04, 0.032, 0.1, MAT(P8.stoneD), 0, 0.166, 0));
  if (ry) g.rotation.y = ry;
  return g;
}
/* 石板小径（3 块错缝） */
function flagPath8(z0, z1) {
  var g = grp();
  for (var i = 0; i < 3; i++) {
    var u = i / 2;
    var s = box(0.28 - u * 0.05, 0.016, 0.15 + u * 0.05, MAT(P8.pave, { rough: 0.95 }), (i % 2 ? 0.05 : -0.04), 0.07, z0 + (z1 - z0) * u);
    s.rotation.y = (i % 2 ? 0.08 : -0.06);
    g.add(s);
  }
  return g;
}
/* 地坪：石板铺地 + 苔草 + 卵石（参考图基地为石板 + 苔缝，区别于 prop_6 草坪）= 10 mesh */
function pad8() {
  var g = grp();
  g.add(box(2.6, 0.06, 2.6, MAT(P8.paveD, { rough: 0.95 }), 0, 0.03, 0));      /* 基座 */
  g.add(box(2.42, 0.02, 2.42, MAT(P8.pave, { rough: 0.95 }), 0, 0.068, 0));    /* 石板面 */
  var m = MAT(P8.moss, { rough: 0.95 });
  [[-0.7, 0.8], [0.85, 0.55], [-0.95, -0.4], [0.7, -0.9]].forEach(function (p, i) {
    var t = box(0.3 + (i % 2) * 0.12, 0.008, 0.22 + (i % 3) * 0.06, m, p[0], 0.079, p[1]);
    t.rotation.y = i * 0.6;
    g.add(t);
  });
  [[-0.45, 0.95], [0.5, 0.98]].forEach(function (p) {
    g.add(box(0.13, 0.01, 0.1, MAT(P8.grass, { rough: 0.95 }), p[0], 0.08, p[1]));
  });
  [[-1.05, -0.85, 0.05]].forEach(function (p) {                                /* 卵石 */
    var pe = sph(p[2], MAT(P8.stoneD, { rough: 0.95 }), p[0], 0.082, p[1]);
    pe.scale.y = 0.45; g.add(pe);
  });
  return g;
}
/* 翘角板瓦层顶几何（身份特征 #6）：四坡 + 翘角上扬；前后坡 pan-cover 竖垄 UV */
function flareRoofGeo(w, d, h, ov, cl, lift) {
  var hw = w / 2, hd = d / 2, rw = hw * 0.42;
  var A = [-rw, h, 0], B = [rw, h, 0];
  var Cfr = [hw + ov, cl, hd + ov], Cfl = [-hw - ov, cl, hd + ov];
  var Cbr = [hw + ov, cl, -hd - ov], Cbl = [-hw - ov, cl, -hd - ov];
  var Mf = [0, cl + lift * 0.35, hd + ov + lift * 0.28], Mb = [0, cl + lift * 0.35, -hd - ov - lift * 0.28];
  var Ml = [-hw - ov - lift * 0.28, cl + lift * 0.35, 0], Mr = [hw + ov + lift * 0.28, cl + lift * 0.35, 0];
  var pos = [], uvs = [], vh = Math.max(0.001, h - cl);
  function tri(a, b, c, mode) {
    [a, b, c].forEach(function (p) {
      pos.push(p[0], p[1], p[2]);
      if (mode === 'x') uvs.push((p[2] + hd + ov) / (d + 2 * ov), (p[1] - cl) / vh);
      else uvs.push((p[0] + hw + ov) / (w + 2 * ov), (p[1] - cl) / vh);
    });
  }
  tri(A, Cfl, Mf, 'z'); tri(A, Mf, Cfr, 'z'); tri(A, Cfr, B, 'z');
  tri(A, Cbl, Mb, 'z'); tri(A, Mb, Cbr, 'z'); tri(A, Cbr, B, 'z');
  tri(A, Cbl, Ml, 'x'); tri(A, Ml, Cfl, 'x');
  tri(B, Mr, Cbr, 'x'); tri(B, Cfr, Mr, 'x');
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}
/* 鎏金卷角吻 v2（双段卷曲 + 吻尾鳍板 + 底座 = 5 mesh） */
function giltHorn(flip) {
  var g = grp();
  var bm = MAT(P8.gilt, { rough: 0.4, metal: 0.55, emissive: P8.giltD, ei: 0.12 });
  var arc = mesh(new THREE.TorusGeometry(0.05, 0.018, 8, 14, PI * 1.1), bm);
  arc.rotation.y = PI / 2;
  if (flip) arc.rotation.z = -PI * 0.35; else arc.rotation.z = PI * 0.2;
  g.add(arc);
  var arc2 = mesh(new THREE.TorusGeometry(0.026, 0.013, 8, 12, PI * 0.9), bm);  /* 内卷小段 */
  arc2.rotation.y = PI / 2;
  arc2.rotation.z = flip ? -PI * 0.62 : PI * 0.52;
  arc2.position.set(0, flip ? -0.028 : 0.028, flip ? 0.022 : -0.02);
  g.add(arc2);
  var tip = mesh(new THREE.ConeGeometry(0.017, 0.05, 12), bm);
  tip.position.set(0, flip ? -0.062 : 0.062, flip ? 0.05 : -0.045);
  tip.rotation.z = flip ? 0.5 : -0.5;
  g.add(tip);
  var fin = box(0.012, 0.05, 0.03, bm, 0, flip ? 0.03 : -0.03, flip ? -0.03 : 0.026);  /* 吻尾鳍板 */
  fin.rotation.x = 0.5; g.add(fin);
  g.add(box(0.05, 0.045, 0.05, bm, 0, flip ? -0.02 : 0.02, 0));
  return g;
}
/* 翘角层顶总成 v2：瓦面 + 几何瓦垄（顺坡垄条）+ 4 朱红封檐 + 4 垂脊 + 正脊
 * + 2 吻 + （大顶）中央鎏金顶 —— 大顶 ~25 mesh / 小顶 ~19 mesh */
function flareRoof(w, d, h, big) {
  var g = grp();
  var ov = Math.min(w, d) * (big ? 0.16 : 0.13), cl = Math.min(w, d) * (big ? 0.1 : 0.085), lift = big ? 0.1 : 0.06;
  var hw = w / 2, hd = d / 2, rw = hw * 0.42;
  var t = texSlate().clone(); t.needsUpdate = true; t.repeat.set(2, 1);
  g.add(mesh(flareRoofGeo(w, d, h, ov, cl, lift), std('#ffffff', { map: t, rough: 0.6, side: THREE.DoubleSide })));
  var ribM = MAT(P8.slateD, { rough: 0.6 });
  var nR = big ? 4 : 3;                                        /* 几何瓦垄：前后坡顺坡垄条 */
  for (var i = 0; i < nR; i++) {
    var rx = -rw * 0.8 + i * (rw * 1.6 / (nR - 1));
    slopePart(g, ribM, [rx, h * 0.96, 0.05], [rx, cl * 1.04, hd + ov * 0.8], 0.013);
    slopePart(g, ribM, [rx, h * 0.96, -0.05], [rx, cl * 1.04, -(hd + ov * 0.8)], 0.013);
  }
  var red = MAT(P8.redAwn, { rough: 0.75 });
  g.add(box(w * 0.86, 0.045, 0.02, red, 0, cl * 0.5, d / 2 + ov * 0.72));
  g.add(box(w * 0.86, 0.045, 0.02, red, 0, cl * 0.5, -(d / 2 + ov * 0.72)));
  g.add(box(0.02, 0.045, d * 0.84, red, w / 2 + ov * 0.72, cl * 0.5, 0));
  g.add(box(0.02, 0.045, d * 0.84, red, -(w / 2 + ov * 0.72), cl * 0.5, 0));
  if (big) {
    [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {   /* 垂脊 ×4（大顶） */
      slopePart(g, MAT(P8.stoneD, { rough: 0.75 }),
        [c[0] * rw, h + 0.008, 0], [c[0] * (hw + ov * 0.7), cl * 1.06, c[1] * (hd + ov * 0.7)], 0.019);
    });
  }
  var rs = MAT(P8.stoneD, { rough: 0.75 });
  g.add(box(w * 0.44, 0.045, 0.05, rs, 0, h + 0.016, 0));      /* 正脊脊座 */
  g.add(box(w * 0.4, 0.028, 0.042, MAT(P8.slateD), 0, h + 0.052, 0));
  var h1 = giltHorn(false); h1.position.set(-w * 0.24, h + 0.03, 0); g.add(h1);
  var h2 = giltHorn(true); h2.position.set(w * 0.24, h + 0.03, 0); g.add(h2);
  if (big) {
    g.add(box(0.15, 0.045, 0.04, rs, 0, h + 0.062, 0));
    g.add(cyl(0.02, 0.026, 0.032, 12, MAT(P8.gilt, { metal: 0.5, rough: 0.4 }), 0, h + 0.095, 0));
  }
  return g;
}

/* ============================ 4. 四阶建筑（blockout→structure→form→material→lighting→interaction） ============================ */

/* ---------- lv1 小屋：板条棚屋 + 苔痕板皮顶(搭接条/苔斑) + 偏厦门廊 + 石库门头 + 石板地
   （~100 mesh, H≈0.98） ---------- */
function lv1() {
  var g = grp(); g.name = 'prop_8_lv1';
  g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = 1;
  g.add(pad8());

  /* 棚屋主体（参考图 lv1：横板条 + 角柱 + 小门小窗） */
  var B = grp(); B.position.set(-0.1, 0.078, -0.22); g.add(B);
  B.add(box(1.16, 0.05, 0.88, MAT(P8.stoneD), 0, 0.025, 0));                     /* 石勒脚 */
  var walls = plankBox(1.06, 0.5, 0.78, 2, 1); walls.position.set(0, 0.3, 0); B.add(walls);
  [[-0.5, -0.36], [0.5, -0.36], [-0.5, 0.36], [0.5, 0.36]].forEach(function (c) {
    B.add(box(0.06, 0.52, 0.06, MAT(P8.plankD), c[0], 0.31, c[1]));              /* 角柱 */
  });
  /* 正门（朝 +Z） */
  var dr = boardDoor(0.26, 0.38); dr.position.set(-0.24, 0.32, 0.392); B.add(dr);
  /* 左暗窗 + 右暖窗（矩形密棂格） */
  var wDark = latticeWindow(0.22, 0.24, { vx: 1, hx: 2 }); wDark.position.set(0.22, 0.36, 0.392); B.add(wDark);
  var glowM = std('#e8b264', { rough: 0.45, emissive: P8.glow, ei: 0.25 });
  var wGlow = latticeWindow(0.2, 0.22, { glowMat: glowM, vx: 1, hx: 2 }); wGlow.position.set(0.48, 0.36, 0.392); B.add(wGlow);
  /* 苔痕板皮人字顶（大挑檐 + 搭接条 + 苔斑团） */
  var roof = grp(); roof.position.set(0, 0.57, 0); B.add(roof);
  var rise = 0.28, half = 0.7, slope = Math.sqrt(rise * rise + half * half) + 0.05, ang = Math.atan2(rise, half);
  var pF = shingleBox(1.3, 0.035, slope, 2, 1); pF.rotation.x = ang; pF.position.set(0, rise * 0.5, half * 0.5); roof.add(pF);
  var pB = shingleBox(1.3, 0.035, slope, 2, 1); pB.rotation.x = -ang; pB.position.set(0, rise * 0.5, -half * 0.5); roof.add(pB);
  for (var bt = 0; bt < 4; bt++) {                                               /* 板皮搭接条 ×4（前坡贴坡） */
    var u = 0.22 + bt * 0.2;
    var bF = box(1.26, 0.018, 0.05, MAT(P8.plankD), 0, rise * u + 0.016, half * u);
    bF.rotation.x = ang; roof.add(bF);
  }
  roof.add(box(1.36, 0.045, 0.07, MAT(P8.plankD), 0, rise + 0.012, 0));
  var shm = MAT(P8.moss, { rough: 0.95 });
  [[-0.3, 0.14], [0.25, -0.1]].forEach(function (p) {                            /* 顶面苔斑 ×2 */
    var mp = sph(0.05, shm, p[0], rise * 0.72 + 0.026, p[1]);
    mp.scale.set(1.6, 0.3, 1.1); roof.add(mp);
  });
  var sh = new THREE.Shape();
  sh.moveTo(-0.38, 0); sh.lineTo(0.38, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
  for (var sd = -1; sd <= 1; sd += 2) {
    var tp = mesh(tg, MAT(P8.plankD));
    tp.rotation.y = PI / 2 * sd; tp.position.set(sd * 0.635, 0, 0);
    roof.add(tp);
  }
  /* 右侧偏厦门廊（open lean-to，参考图右前） */
  var shed = grp(); shed.position.set(0.72, 0.09, 0.06); B.add(shed);
  var slab = shingleBox(0.56, 0.03, 0.62, 1, 1); slab.rotation.z = -0.3; slab.rotation.x = 0.1; slab.position.set(0.05, 0.34, 0); shed.add(slab);
  shed.add(box(0.5, 0.018, 0.045, MAT(P8.plankD), 0.08, 0.22, 0.24));
  shed.add(cyl(0.017, 0.021, 0.32, 12, MAT(P8.plankD), 0.22, 0.16, 0.24));
  shed.add(cyl(0.017, 0.021, 0.32, 12, MAT(P8.plankD), 0.22, 0.16, -0.24));
  shed.add(box(0.04, 0.09, 0.46, MAT(P8.plankD), 0.28, 0.045, 0));
  shed.add(box(0.3, 0.03, 0.2, MAT(P8.woodM), 0.06, 0.12, 0.12));                /* 门廊木凳 */

  /* 石库门头（全程驻场，前右角）+ 矮墙 + 石板径 */
  var gw = shikumenGate(0.4, 0.46, 1); gw.position.set(0.68, 0.078, 0.78); gw.rotation.y = -0.3; g.add(gw);
  var yl = yardWall8(0.55, 1.32); yl.position.set(-0.28, 0.078, 0.9); g.add(yl);
  var yr = yardWall8(0.36, 0.3); yr.position.set(1.0, 0.078, 0.3); g.add(yr);
  g.add(flagPath8(0.42, 0.92));
  var p1 = potPlant(0.9); p1.position.set(0.28, 0.078, 0.62); g.add(p1);
  var b1 = bush8(1.1); b1.position.set(-0.85, 0.16, 0.3); g.add(b1);
  var b2 = bush8(0.8, '#5d7c3a'); b2.position.set(-0.95, 0.14, -0.5); g.add(b2);
  /* 杂物（参考图门前杂物）：桶 ×2 + 木箱 */
  g.add(cyl(0.05, 0.055, 0.13, 12, MAT('#5a6a74', { rough: 0.7 }), 0.62, 0.14, 0.4));
  g.add(cyl(0.042, 0.048, 0.1, 12, MAT('#6a5a3a', { rough: 0.8 }), 0.74, 0.13, 0.52));
  g.add(box(0.14, 0.1, 0.12, MAT(P8.woodM), -0.62, 0.13, 0.78));

  /* anim：暖窗呼吸（克制） */
  anim(g, function (t) { glowM.emissiveIntensity = 0.25 + 0.1 * sin(t * 1.6); });
  return g;
}

/* ---------- lv2 洋房：两层红砖商铺 + 草橙细条纹直篷 + 柜台 + 木瓶栏阳台 + 首座弧肩山墙
   + 石库门头（~172 mesh, H≈1.53） ---------- */
function lv2() {
  var g = grp(); g.name = 'prop_8_lv2';
  g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = 2;
  g.add(pad8());

  var B = grp(); B.position.set(-0.02, 0.078, -0.2); g.add(B);
  B.add(box(1.6, 0.06, 1.0, MAT(P8.stoneD), 0, 0.03, 0));                          /* 勒脚 */
  var main = brickBox(1.5, 0.98, 0.9, 3, 2); main.position.set(0, 0.56, 0); B.add(main);
  [[-0.72, 0.42], [0.72, 0.42], [-0.72, -0.42], [0.72, -0.42]].forEach(function (c) {
    var q = quoinStrip(0.98, c[0], c[1]); q.position.y = 0.07; B.add(q);           /* 隅石（长短皮） */
  });
  B.add(box(1.56, 0.04, 0.94, MAT(P8.stone), 0, 0.58, 0));                         /* 层间线 */
  B.add(box(1.58, 0.055, 0.96, MAT(P8.stoneL), 0, 1.07, 0));                       /* 顶檐口 */
  for (var dt = 0; dt < 5; dt++) {                                                 /* 檐下齿饰 ×5 */
    B.add(box(0.07, 0.035, 0.03, MAT(P8.stone), -0.56 + dt * 0.28, 1.03, 0.482));
  }
  /* 一层店面：暖光橱窗 + 板门 + 草橙细条纹直篷 + 柜台 + 挂匾 */
  var shop = shopGlow(0.46, 0.34); shop.position.set(-0.4, 0.33, 0.458); B.add(shop);
  var dr = boardDoor(0.26, 0.42); dr.position.set(0.18, 0.32, 0.458); B.add(dr);
  var aw = awningStraight(1.24); aw.position.set(-0.06, 0.68, 0.56); B.add(aw);
  var sign = textPlate8('茶', 0.13, 0.13, { bg: '#26221a', fg: '#e2c274', ei: 0.16 });
  var hang = grp(); hang.position.set(0.52, 0.62, 0.5); hang.add(sign); B.add(hang);
  var ct = counter8(0.7); ct.position.set(-0.38, 0.09, 0.72); B.add(ct);           /* 门口柜台 */
  var g1 = sph(0.03, MAT('#c8903e', { rough: 0.85 }), -0.5, 0.245, 0.7); g.add(g1);
  var g2 = sph(0.026, MAT('#b8763a', { rough: 0.85 }), -0.26, 0.243, 0.74); g.add(g2);
  /* 二层：密棂格窗 ×3（中窗青绿百叶）+ 木宝瓶栏阳台 + 花箱 */
  var w1 = latticeWindow(0.24, 0.3, { shutter: true, shutterCol: P8.teal }); w1.position.set(-0.48, 0.85, 0.458); B.add(w1);
  var w2 = latticeWindow(0.28, 0.32, {}); w2.position.set(0.04, 0.85, 0.458); B.add(w2);
  var w3 = latticeWindow(0.24, 0.3, { shutter: true, shutterCol: P8.teal }); w3.position.set(0.52, 0.85, 0.458); B.add(w3);
  var balc = balustrade(0.96, 0.2, 5, MAT(P8.woodM)); balc.position.set(0.04, 0.6, 0.52); B.add(balc);
  var fb = planterBox(0.5); fb.position.set(0.04, 0.67, 0.68); B.add(fb);
  /* 弧肩山墙（首座）+ 山墙后板瓦坡顶 */
  var ped = dutchGable(0.96, 0.32, 0.12, 2); ped.position.set(0.04, 1.1, 0.38); B.add(ped);
  var rg = slateGableRoof(1.06, 0.2, 0.5); rg.position.set(0.04, 1.1, -0.12); B.add(rg);

  /* 前院：石库门头 + 矮墙 + 径 + 盆栽 */
  var gw = shikumenGate(0.42, 0.5, 2); gw.position.set(0.64, 0.078, 0.84); gw.rotation.y = -0.3; g.add(gw);
  var yl = yardWall8(0.52, 1.15); yl.position.set(-0.42, 0.078, 0.94); g.add(yl);
  var yr = yardWall8(0.36, 0.2); yr.position.set(1.02, 0.078, 0.36); g.add(yr);
  g.add(flagPath8(0.4, 0.88));
  var p1 = potPlant(1); p1.position.set(-0.18, 0.078, 0.56); g.add(p1);
  var p2 = potPlant(0.85); p2.position.set(0.34, 0.078, 0.6); g.add(p2);
  var b3 = bush8(1); b3.position.set(1.0, 0.15, -0.1); g.add(b3);
  var b4 = bush8(0.75, '#5d7c3a'); b4.position.set(-1.05, 0.13, -0.55); g.add(b4);

  /* anim：店窗呼吸 + 挂匾摇曳 */
  var gm = shop.userData.glowMat;
  anim(g, function (t) { gm.emissiveIntensity = 0.5 + 0.14 * sin(t * 1.7); });
  anim(g, function (t) { hang.rotation.z = sin(t * 1.5) * 0.07; });
  return g;
}

/* ---------- lv3 大厦：三层起台 + 乌黑波浪篷 + 市摊 + 双层宝瓶栏阳台 + 红灯笼 ×2
   + 大山墙拱窗 + 侧翼披楼 + 「田子坊」木匾（~250 mesh, H≈2.16） ---------- */
function lv3() {
  var g = grp(); g.name = 'prop_8_lv3';
  g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = 3;
  g.add(pad8());

  var B = grp(); B.position.set(0, 0.078, -0.16); g.add(B);
  B.add(box(1.54, 0.07, 1.02, MAT(P8.stoneD), 0, 0.035, 0));                       /* 勒脚 */
  var main = brickBox(1.42, 1.56, 0.95, 3, 3); main.position.set(0, 0.83, 0); B.add(main);
  [[-0.68, 0.45], [0.68, 0.45], [-0.68, -0.45], [0.68, -0.45]].forEach(function (c) {
    var q = quoinStrip(1.56, c[0], c[1]); q.position.y = 0.07; B.add(q);
  });
  B.add(box(1.48, 0.04, 0.98, MAT(P8.stone), 0, 0.58, 0));                         /* 层线 ×2 */
  B.add(box(1.48, 0.04, 0.98, MAT(P8.stone), 0, 1.1, 0));
  B.add(box(1.5, 0.055, 1.0, MAT(P8.stoneL), 0, 1.63, 0));                         /* 顶檐口 */
  for (var dt = 0; dt < 5; dt++) {                                                 /* 檐下齿饰 ×5 */
    B.add(box(0.07, 0.035, 0.03, MAT(P8.stone), -0.52 + dt * 0.26, 1.595, 0.5));
  }
  /* 一层：板门 + 暖窗 + 乌黑波浪篷 + 市摊货物 */
  var dr = boardDoor(0.26, 0.44); dr.position.set(-0.44, 0.31, 0.478); B.add(dr);
  var glow1 = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.45 });
  var sw = latticeWindow(0.34, 0.34, { glowMat: glow1 });
  sw.position.set(0.24, 0.33, 0.478); B.add(sw);
  var aw = awningScallop(1.2, P8.awnDk); aw.position.set(0.1, 0.62, 0.6); B.add(aw);
  var goods = stallGoods(); goods.position.set(0.34, 0.09, 0.72); B.add(goods);
  /* 二层：密棂窗 ×3 + 木宝瓶栏阳台 + 花箱 */
  var w21 = latticeWindow(0.24, 0.3, {}); w21.position.set(-0.46, 0.9, 0.478); B.add(w21);
  var glow2 = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.4 });
  var w22 = latticeWindow(0.3, 0.34, { glowMat: glow2 });
  w22.position.set(0.1, 0.9, 0.478); B.add(w22);
  var w23 = latticeWindow(0.24, 0.3, {}); w23.position.set(0.56, 0.9, 0.478); B.add(w23);
  var b2 = balustrade(0.94, 0.2, 5, MAT(P8.woodM)); b2.position.set(0.06, 0.66, 0.54); B.add(b2);
  var fb2 = planterBox(0.5); fb2.position.set(0.06, 0.73, 0.7); B.add(fb2);
  /* 三层：密棂窗 ×3 + 石宝瓶栏阳台 + 花箱 */
  var w31 = latticeWindow(0.22, 0.28, {}); w31.position.set(-0.46, 1.4, 0.478); B.add(w31);
  var glow3 = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.35 });
  var w32 = latticeWindow(0.26, 0.3, { glowMat: glow3 });
  w32.position.set(0.08, 1.4, 0.478); B.add(w32);
  var w33 = latticeWindow(0.22, 0.28, {}); w33.position.set(0.54, 1.4, 0.478); B.add(w33);
  var b3 = balustrade(0.94, 0.2, 5, MAT(P8.stoneL)); b3.position.set(0.04, 1.16, 0.54); B.add(b3);
  var fb3 = planterBox(0.46); fb3.position.set(0.04, 1.23, 0.7); B.add(fb3);
  /* 大弧肩山墙（带拱窗）+ 板瓦坡顶（挂瓦条） */
  var ped = dutchGable(0.9, 0.38, 0.12, 3); ped.position.set(0.02, 1.66, 0.38); B.add(ped);
  var rg = slateGableRoof(1.0, 0.24, 0.48); rg.position.set(0.02, 1.66, -0.12); B.add(rg);
  /* 檐下红灯笼 ×2（主立面 + 侧翼，sway 挂点） */
  var lan = hangLantern(0.9); lan.position.set(0.56, 0.66, 0.56); B.add(lan);
  var lan2 = hangLantern(0.8); lan2.position.set(0.28, 0.99, 0.36); B.add(lan2);

  /* 侧翼披楼（+x 两层，独栋小山墙） */
  var W = grp(); W.position.set(0.97, 0.078, -0.22); g.add(W);
  W.add(box(0.56, 0.05, 0.8, MAT(P8.stoneD), 0, 0.025, 0));
  var wb = brickBox(0.5, 0.86, 0.72, 2, 2); wb.position.set(0, 0.5, 0); W.add(wb);
  W.add(box(0.56, 0.045, 0.76, MAT(P8.stoneL), 0, 0.955, 0));
  var w41 = latticeWindow(0.17, 0.24, { vx: 1, hx: 2 }); w41.position.set(0, 0.4, 0.365); W.add(w41);
  var glow4 = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.3 });
  var w42 = latticeWindow(0.17, 0.22, { glowMat: glow4, vx: 1, hx: 2 });
  w42.position.set(0, 0.82, 0.365); W.add(w42);
  var wrf = slateBox(0.6, 0.028, 0.78, 1, 1); wrf.rotation.x = 0.12; wrf.position.set(0, 1.02, -0.02); W.add(wrf);
  var wrail = balustrade(0.5, 0.14, 3, MAT(P8.stoneL)); wrail.position.set(0, 0.98, 0.32); W.add(wrail);

  /* 前院：石库门头（「田子坊」木匾）+ 墙 + 径 */
  var gw = shikumenGate(0.46, 0.54, 3); gw.position.set(0.64, 0.078, 0.86); gw.rotation.y = -0.3; g.add(gw);
  var y1 = yardWall8(0.5, 1.15); y1.position.set(-0.46, 0.078, 0.96); g.add(y1);
  var y2 = yardWall8(0.36, 0.2); y2.position.set(1.04, 0.078, 0.38); g.add(y2);
  g.add(flagPath8(0.42, 0.9));
  g.add(box(0.5, 0.025, 0.24, MAT(P8.stoneD), 0.7, 0.09, 0.6));                    /* 门阶 */
  var p1 = potPlant(1); p1.position.set(-0.2, 0.078, 0.58); g.add(p1);
  var p2 = potPlant(0.9); p2.position.set(0.3, 0.078, 0.62); g.add(p2);
  var bs1 = bush8(1); bs1.position.set(1.02, 0.15, 0.05); g.add(bs1);
  var bs2 = bush8(0.75, '#5d7c3a'); bs2.position.set(-1.08, 0.13, -0.4); g.add(bs2);

  /* anim：红灯笼摇 ×2 + 匾额微光 + 窗光呼吸（v2 增强） */
  anim(g, function (t) {
    lan.rotation.z = sin(t * 1.3) * 0.09; lan.rotation.x = sin(t * 0.9 + 1) * 0.05;
    lan2.rotation.z = sin(t * 1.5 + 2.1) * 0.08; lan2.rotation.x = sin(t * 0.8 + 0.5) * 0.05;
  });
  var pm = gw.userData.plaqueMat;
  if (pm) anim(g, function (t) { pm.emissiveIntensity = 0.1 + 0.12 * (0.5 + 0.5 * sin(t * 1.1)); });
  anim(g, function (t) {
    glow1.emissiveIntensity = 0.45 + 0.12 * sin(t * 1.5);
    glow2.emissiveIntensity = 0.4 + 0.11 * sin(t * 1.25 + 1.3);
    glow3.emissiveIntensity = 0.35 + 0.1 * sin(t * 1.4 + 2.6);
  });
  return g;
}

/* ---------- lv4 地标：木装堂层(板缝) + 朱红垂帘店面 + 格窗阵列 + 三叠宝瓶栏阳台
   + 灯笼串 + 翘角板瓦双叠层顶（几何瓦垄/鎏金卷角吻）+ 鎏金牌坊匾 + 侧翼楼
   （~345 mesh, H≈2.80） ---------- */
function lv4() {
  var g = grp(); g.name = 'prop_8_lv4';
  g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = 4;
  g.add(pad8());

  var B = grp(); B.position.set(0.0, 0.078, -0.14); g.add(B);
  B.add(box(1.7, 0.09, 1.18, MAT(P8.stoneD), 0, 0.045, 0));                        /* 石勒脚 */
  /* 堂层（木装 + 石壁柱 + 板缝条 + 踢脚裙板）：H 0.52 */
  var hall = plankBox(1.58, 0.52, 1.06, 3, 1); hall.position.set(0, 0.375, 0); B.add(hall);
  [[-0.76, 0.5], [0.76, 0.5], [-0.76, -0.5], [0.76, -0.5]].forEach(function (c) {
    B.add(box(0.09, 0.52, 0.06, MAT(P8.stone), c[0], 0.375, c[1]));                /* 角部壁柱 */
  });
  [-0.73, -0.02, 0.5, 0.7].forEach(function (x) {                                  /* 板缝条 ×4 */
    B.add(box(0.024, 0.48, 0.014, MAT(P8.plankD), x, 0.37, 0.537));
  });
  B.add(box(1.5, 0.075, 0.03, MAT(P8.woodD), 0, 0.115, 0.536));                    /* 木踢脚裙板 */
  B.add(box(1.64, 0.05, 1.12, MAT(P8.stoneL), 0, 0.665, 0));                       /* 堂层檐 */
  /* 二~四层砖墙（v2 拉高 0.16 容纳三叠阳台） */
  var main = brickBox(1.56, 1.26, 1.06, 3, 3); main.position.set(0, 1.32, 0); B.add(main);
  B.add(box(1.6, 0.04, 1.1, MAT(P8.stone), 0, 1.22, 0));                           /* 层线 */
  B.add(box(1.6, 0.04, 1.1, MAT(P8.stone), 0, 1.72, 0));
  B.add(box(1.64, 0.06, 1.14, MAT(P8.stoneL), 0, 1.98, 0));                        /* 顶横檐 */
  /* 堂层店面：朱红波浪垂帘 + 暖光大橱窗 + 板门 + 货摊 + 「田子坊」金匾 */
  var val = valanceRed(1.3, 0.2); val.position.set(-0.14, 0.62, 0.58); B.add(val);
  var shop = shopGlow(0.5, 0.36); shop.position.set(-0.42, 0.36, 0.545); B.add(shop);
  var dr = boardDoor(0.28, 0.44); dr.position.set(0.26, 0.34, 0.545); B.add(dr);
  var goods = stallGoods(); goods.position.set(-0.1, 0.09, 0.74); B.add(goods);
  var plaque = textPlate8('田子坊', 0.4, 0.13, { bg: '#1d1a14', fg: '#e8c87a', border: '#8a6a30', ei: 0.16 });
  plaque.position.set(0.66, 0.62, 0.55); plaque.rotation.y = -0.1; B.add(plaque);
  /* 二层：格窗 ×4（外窗百叶）+ 木宝瓶栏阳台 + 花箱 */
  var r2x = [-0.56, -0.16, 0.24, 0.6], r2w = [0.24, 0.28, 0.28, 0.24];
  var glowA = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.45 });
  for (var i2 = 0; i2 < 4; i2++) {
    var o2 = (i2 === 0 || i2 === 3) ? { shutter: true } : {};
    if (i2 === 1) o2.glowMat = glowA;
    var w2 = latticeWindow(r2w[i2], 0.3, o2);
    w2.position.set(r2x[i2], 0.95, 0.545); B.add(w2);
  }
  var b2 = balustrade(1.06, 0.22, 4, MAT(P8.woodM)); b2.position.set(0.02, 0.7, 0.58); B.add(b2);
  var fb2 = planterBox(0.5); fb2.position.set(0.02, 0.77, 0.76); B.add(fb2);
  /* 三层：格窗 ×4 + 石宝瓶栏阳台 + 花箱 */
  var r3x = [-0.56, -0.18, 0.2, 0.58];
  var glowB = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.4 });
  for (var i3 = 0; i3 < 4; i3++) {
    var o3 = (i3 === 1) ? { glowMat: glowB } : { vx: 1, hx: 2 };
    var w3 = latticeWindow(0.22, 0.28, o3);
    w3.position.set(r3x[i3], 1.44, 0.545); B.add(w3);
  }
  var b3 = balustrade(1.06, 0.22, 4, MAT(P8.stoneL)); b3.position.set(0.02, 1.16, 0.58); B.add(b3);
  var fb3 = planterBox(0.48); fb3.position.set(0.02, 1.23, 0.76); B.add(fb3);
  /* 四层（三叠顶栏）：格窗 ×4 + 石宝瓶栏阳台 */
  var r4x = [-0.56, -0.18, 0.2, 0.58];
  var glowC = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.38 });
  for (var i4 = 0; i4 < 4; i4++) {
    var o4 = (i4 === 2) ? { glowMat: glowC } : { vx: 1, hx: 2 };
    var w4 = latticeWindow(0.2, 0.26, o4);
    w4.position.set(r4x[i4], 1.82, 0.545); B.add(w4);
  }
  var b4 = balustrade(1.06, 0.22, 3, MAT(P8.stoneL)); b4.position.set(0.02, 1.62, 0.58); B.add(b4);
  /* 灯笼串 ×2（金属牛腿 + 金属挂环，整串微摇）+ 檐角单灯 */
  var str1 = lanternString(2, 1, 0.34); str1.position.set(-0.66, 1.24, 0.5); str1.rotation.y = -0.25; B.add(str1);
  var str2 = lanternString(2, 1.15, 0.36); str2.position.set(0.64, 1.7, 0.5); str2.rotation.y = 0.22; B.add(str2);
  var lan3 = hangLantern(0.8, true); lan3.position.set(0.66, 2.0, 0.56); B.add(lan3);
  /* 主翘角板瓦层顶（大，几何瓦垄 + 垂脊）+ 上层小翘角顶（双叠） */
  var rf1 = flareRoof(1.56, 1.24, 0.3, true); rf1.position.set(0, 2.01, -0.04); B.add(rf1);
  var rf2 = flareRoof(1.0, 0.8, 0.22, false); rf2.position.set(0, 2.34, -0.04); B.add(rf2);
  /* 背立面小老虎窗（嵌屋坡，密棂） */
  var dm = latticeWindow(0.14, 0.16, { vx: 1, hx: 2 }); dm.position.set(0.3, 2.2, 0.42); dm.rotation.x = 0.5; B.add(dm);

  /* 侧翼楼（+x，三层收分 + 小披檐） */
  var W = grp(); W.position.set(0.98, 0.078, -0.2); g.add(W);
  W.add(box(0.56, 0.06, 0.86, MAT(P8.stoneD), 0, 0.03, 0));
  var wb = brickBox(0.5, 1.12, 0.78, 2, 2); wb.position.set(0, 0.62, 0); W.add(wb);
  W.add(box(0.56, 0.05, 0.82, MAT(P8.stoneL), 0, 1.215, 0));
  var w51 = latticeWindow(0.18, 0.26, { vx: 1, hx: 2 }); w51.position.set(0, 0.46, 0.395); W.add(w51);
  var glowD = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.3 });
  var w52 = latticeWindow(0.18, 0.24, { glowMat: glowD, vx: 1, hx: 2 });
  w52.position.set(0, 0.98, 0.395); W.add(w52);
  var cap = grp(); cap.position.set(0, 1.26, 0.14); W.add(cap);
  var cs = slateBox(0.56, 0.026, 0.5, 1, 1); cs.rotation.x = 0.3; cap.add(cs);
  cap.add(cyl(0.015, 0.019, 0.24, 12, MAT(P8.woodD), 0.22, -0.13, 0.14));
  cap.add(cyl(0.015, 0.019, 0.24, 12, MAT(P8.woodD), -0.22, -0.13, 0.14));
  var wrail = balustrade(0.54, 0.16, 3, MAT(P8.stoneL)); wrail.position.set(0, 1.24, 0.34); W.add(wrail);

  /* 前院：鎏金匾石库门头 + 墙 + 台阶 + 径 + 绿植 */
  var gw = shikumenGate(0.5, 0.58, 4); gw.position.set(0.64, 0.078, 0.85); gw.rotation.y = -0.36; g.add(gw);
  var y1 = yardWall8(0.52, 1.15); y1.position.set(-0.5, 0.078, 0.98); g.add(y1);
  var y2 = yardWall8(0.36, 0.2); y2.position.set(1.04, 0.078, 0.38); g.add(y2);
  g.add(box(0.56, 0.03, 0.26, MAT(P8.stoneD), 0.64, 0.09, 0.62));                  /* 门阶 ×2 */
  g.add(box(0.56, 0.03, 0.2, MAT(P8.stoneD), 0.64, 0.062, 0.44));
  g.add(flagPath8(0.44, 0.94));
  var p1 = potPlant(1.1); p1.position.set(-0.2, 0.078, 0.6); g.add(p1);
  var p2 = potPlant(0.95); p2.position.set(0.32, 0.078, 0.64); g.add(p2);
  var bs1 = bush8(1.1); bs1.position.set(1.06, 0.15, 0.02); g.add(bs1);

  /* anim：灯笼串摇 + 檐角单灯 + 金匾/鎏金流辉 + 窗光呼吸（均克制） */
  var pfm = plaque.userData.faceMat;
  var gmt = gw.userData.giltMat;
  anim(g, function (t) {
    str1.rotation.z = sin(t * 1.2) * 0.07; str1.rotation.x = sin(t * 0.8 + 0.6) * 0.05;
    str2.rotation.z = sin(t * 1.45 + 1.4) * 0.07; str2.rotation.x = sin(t * 0.9 + 2.0) * 0.05;
    lan3.rotation.z = sin(t * 1.35 + 0.9) * 0.08;
  });
  anim(g, function (t) {
    if (pfm) pfm.emissiveIntensity = 0.16 + 0.12 * (0.5 + 0.5 * sin(t * 1.15));
    if (gmt) gmt.emissiveIntensity = 0.15 + 0.1 * (0.5 + 0.5 * sin(t * 0.9 + 1.2));
  });
  anim(g, function (t) {
    glowA.emissiveIntensity = 0.45 + 0.12 * sin(t * 1.5);
    glowB.emissiveIntensity = 0.4 + 0.11 * sin(t * 1.25 + 1.3);
    glowC.emissiveIntensity = 0.38 + 0.1 * sin(t * 1.4 + 2.6);
    glowD.emissiveIntensity = 0.3 + 0.09 * sin(t * 1.1 + 0.8);
  });
  return g;
}

/* ============================ 5. 导出：window.Props3D[8] ============================ */
window.Props3D = window.Props3D || {};
window.Props3D[8] = function (level) {
  level = Math.max(1, Math.min(4, level | 0 || 1));
  if (level === 1) return lv1();
  if (level === 2) return lv2();
  if (level === 3) return lv3();
  return lv4();
};

})();
