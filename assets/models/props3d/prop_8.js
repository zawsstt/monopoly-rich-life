/* =====================================================================================
 * 大富翁 · 个性化地产 格 8 「田子坊」 —— 沪上弄堂商铺楼四阶演进（img2threejs 高保真重建）
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/prop_8.png（四阶一体参考图，唯一视觉真源）。
 * 格名：data.js BOARD[8] = 田子坊（g2 沪上风华组），参考图即上海弄堂/石库门商铺楼族谱，
 *       与格名完全匹配；本文件以参考图 + 输出契约（Props3D[8]）为准。
 *
 * —— img2threejs 雕刻 spec（摘要；完整 spec 见 .img2threejs/spec_prop8.json，
 *    validate_sculpt_spec.py --strict-quality 已 PASS） ——————————————————
 * 对象类别：object（微缩沙盘建筑群），complexity: complex。
 * 风格族谱：「沪上弄堂商铺楼」——红砖墙 + 淡灰绿石材隅石/壁柱/层间线（双色对比）、
 *   矩形木棂花格窗（暖黄内光、石窗台、木百叶）、弧肩荷兰式山墙（石压顶、涡卷肩）、
 *   山墙后暗蓝黑板瓦坡顶（pan-cover 瓦垄）、石库门拱门头（全程驻场：块石拱 + 浴卷肩 +
 *   藤蔓苔痕 + 石阶）、店面遮篷族谱（lv2 草橙直篷 + 青绿百叶 → lv3 乌黑扇贝篷 →
 *   lv4 朱红扇贝垂帘），终极阶起 Chinese 翘角板瓦层顶（鎏金卷角吻、朱红封檐板、
 *   红灯笼成串、「田子坊」鎏金匾）。
 * 身份定义特征（identity-defining，任一错误即 fail 该 pass）：
 *   1) 石库门拱门头：四阶均在，前右角，拱心石 + 弧肩脊 + 藤蔓 + 石阶
 *   2) 弧肩荷兰山墙：凹弧肩 + 石压顶 + 涡卷端（lv2-lv3；lv4 换翘角层顶）
 *   3) 遮篷族谱：草橙直布篷 → 乌黑扇贝篷 → 朱红扇贝垂帘（禁与 prop_6 鼠尾草绿混淆）
 *   4) 红砖 × 淡灰绿石材双色（隅石/壁柱/层间线）
 *   5) 矩形木棂窗（非拱窗！）+ 暖黄呼吸光 + 石窗台
 *   6) lv4 翘角板瓦层顶 + 鎏金卷角吻 + 红灯笼串
 * 四阶演进（同一块地同一风格的生长史）：
 *   lv1 小屋  H 0.8–1.2：weathered 板条棚屋 + 苔痕板皮人字顶 + 偏厦门廊 + 石库门头 + 石板地
 *   lv2 洋房  H 1.2–1.7：两层红砖商铺 + 草橙直篷 + 柜台开间 + 木栏阳台 + 首座弧肩山墙 +
 *             山墙后板瓦坡顶 + 石库门头，店窗呼吸 + 挂匾摇曳
 *   lv3 大厦  H 1.7–2.3：三层起台 + 乌黑扇贝篷 + 市摊货物 + 双层阳台 + 红灯笼初现 +
 *             山墙放大带老虎窗 + 侧翼披楼 + 「田子坊」木匾
 *   lv4 地标  H 2.3–3.0：完整地标：木装堂层 + 朱红垂帘店面 + 格窗阵列 + 三叠阳台 + 红灯笼串 +
 *             翘角板瓦双叠层顶（鎏金卷角吻/朱红封檐）+ 鎏金牌坊匾 + 侧翼楼
 * 材质：MeshStandardMaterial（convertSRGBToLinear）；Canvas 程序化纹理 ≤256px：
 *   砖墙 / 横板条 / 板瓦 pan-cover / 苔痕 shingle。禁止外部图片。
 * 光照：不添加灯光（场景级光照）；暖窗/灯笼/金匾用 emissive 克制表现。
 * 交互（userData.anim = [fn(t,dt)]，幅度克制）：lv1 窗光呼吸；lv2 店窗呼吸 + 挂匾摇；
 *   lv3 灯笼摇 + 匾额微光；lv4 双灯笼摇 + 金匾流辉 + 窗光呼吸。
 * 预算：每级 ≤220 mesh；占地 ≤2.6×2.6；原点=格心、底面 y=0；正面朝 +Z。
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
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z, seg) { var o = mesh(new THREE.SphereGeometry(r, seg || 12, Math.max(8, (seg || 12) - 4)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z) { o.position.set(x || 0, y || 0, z || 0); parent.add(o); return o; }
function anim(g, fn) { (g.userData.anim || (g.userData.anim = [])).push(fn); }

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

/* ============================ 2. Canvas 程序化纹理（≤256px） ============================ */
function cv2(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function toTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }

var _texBrick = null;
function texBrick() {  /* 红砖：灰浆横缝 + 竖错缝 + 噪点 */
  if (_texBrick) return _texBrick;
  var c = cv2(128, 128), g = c.getContext('2d');
  g.fillStyle = P8.brick; g.fillRect(0, 0, 128, 128);
  var row = 16;
  for (var y = 0; y < 128; y += row) {
    g.fillStyle = 'rgba(206,198,182,0.5)'; g.fillRect(0, y, 128, 2);
    var off = (y / row) % 2 ? 0 : 16;
    for (var x = off; x < 128; x += 32) { g.fillRect(x, y, 2, row); }
    for (var i = 0; i < 24; i++) {
      var bx = (x + Math.random() * 30) % 128, by = y + 3 + Math.random() * (row - 6);
      g.fillStyle = Math.random() > 0.5 ? 'rgba(58,26,18,0.16)' : 'rgba(226,146,106,0.15)';
      g.fillRect(bx, by, 3 + Math.random() * 4, 2);
    }
  }
  _texBrick = toTex(c); _texBrick.wrapS = _texBrick.wrapT = THREE.RepeatWrapping;
  return _texBrick;
}
var _texPlankH = null;
function texPlankH() {  /* lv1 横板条（参考图为横铺） + 银灰风化 */
  if (_texPlankH) return _texPlankH;
  var c = cv2(128, 128), g = c.getContext('2d');
  g.fillStyle = P8.plank; g.fillRect(0, 0, 128, 128);
  for (var y = 0; y < 128; y += 16) {
    g.fillStyle = 'rgba(38,30,20,0.55)'; g.fillRect(0, y, 128, 2);
    g.fillStyle = 'rgba(200,188,160,0.2)'; g.fillRect(0, y + 2, 128, 1);
    for (var i = 0; i < 7; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(56,46,32,0.28)' : 'rgba(196,182,150,0.2)';
      g.fillRect(Math.random() * 118, y + 3 + Math.random() * 10, 8 + Math.random() * 14, 1 + Math.random() * 2);
    }
  }
  _texPlankH = toTex(c); _texPlankH.wrapS = _texPlankH.wrapT = THREE.RepeatWrapping;
  return _texPlankH;
}
var _texSlate = null;
function texSlate() {  /* 板瓦 pan-cover：竖向盖瓦垄 + 横向叠瓦缝 */
  if (_texSlate) return _texSlate;
  var c = cv2(64, 64), g = c.getContext('2d');
  g.fillStyle = P8.slate; g.fillRect(0, 0, 64, 64);
  for (var x = 0; x < 64; x += 16) {
    g.fillStyle = P8.slateD; g.fillRect(x + 7, 0, 3, 64);          /* 盖瓦缝 */
    g.fillStyle = 'rgba(150,164,182,0.28)'; g.fillRect(x + 1, 0, 2, 64);  /* 瓦面高光 */
    g.fillStyle = 'rgba(30,40,52,0.35)'; g.fillRect(x + 11, 0, 2, 64);
  }
  g.fillStyle = 'rgba(20,28,38,0.42)';
  for (var y = 8; y < 64; y += 13) g.fillRect(0, y, 64, 2);        /* 叠瓦横缝 */
  _texSlate = toTex(c); _texSlate.wrapS = _texSlate.wrapT = THREE.RepeatWrapping;
  return _texSlate;
}
var _texShingle = null;
function texShingle() {  /* lv1 苔痕板皮：错缝 shingle + 苔斑 */
  if (_texShingle) return _texShingle;
  var c = cv2(128, 128), g = c.getContext('2d');
  g.fillStyle = P8.shing; g.fillRect(0, 0, 128, 128);
  for (var y = 0; y < 128; y += 14) {
    var off = (y / 14) % 2 ? 0 : 12;
    g.fillStyle = 'rgba(30,28,20,0.5)'; g.fillRect(0, y, 128, 2);
    for (var x = off; x < 128; x += 24) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(46,42,30,0.35)' : 'rgba(168,158,130,0.3)';
      g.fillRect(x, y + 2, 22, 10);
    }
  }
  for (var i = 0; i < 26; i++) {  /* 苔斑 */
    g.fillStyle = 'rgba(104,124,66,' + (0.14 + Math.random() * 0.2) + ')';
    g.beginPath();
    g.arc(Math.random() * 128, Math.random() * 128, 3 + Math.random() * 8, 0, PI * 2);
    g.fill();
  }
  _texShingle = toTex(c); _texShingle.wrapS = _texShingle.wrapT = THREE.RepeatWrapping;
  return _texShingle;
}
/* 匾额：深板 + 描金字（emissiveMap 微光可供动画） */
function textPlate8(text, w, h, o) {
  o = o || {};
  var cw = 128, ch = 48, c = cv2(cw, ch), g = c.getContext('2d');
  g.fillStyle = o.bg || P8.plaqueBg; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = o.border || '#6f6552'; g.lineWidth = 5; g.strokeRect(4, 4, cw - 8, ch - 8);
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
/* 淡石隅石条（角部双色，两块错缝；组原点在底面） */
function quoinStrip(h, x, z, s) {
  s = s || 1;
  var g = grp();
  g.add(box(0.085 * s, h, 0.055, MAT(P8.stone), 0, h / 2, 0.012));
  g.add(box(0.055, h, 0.085 * s, MAT(P8.stoneL), 0.014, h / 2, 0));
  g.position.set(x, 0, z);
  return g;
}
/* 矩形木棂花格窗（身份特征 #5，非拱窗）：木框 + 玻璃 + 3 棂 + 石窗台 (+木百叶) = 6~8 mesh */
function latticeWindow(w, h, o) {
  o = o || {};
  var g = grp(), fm = MAT(o.frame || P8.woodD), gl = o.glowMat || MAT(P8.glaz, { rough: 0.4, metal: 0.1 });
  g.add(box(w + 0.05, h + 0.05, 0.035, fm));
  g.add(box(w, h, 0.03, gl, 0, 0, 0.004));
  g.add(box(0.026, h, 0.04, fm, 0, 0, 0.009));                 /* 竖棂 */
  g.add(box(w, 0.024, 0.04, fm, 0, h * 0.22, 0.009));          /* 横棂 ×2 */
  g.add(box(w, 0.024, 0.04, fm, 0, -h * 0.2, 0.009));
  g.add(box(w + 0.14, 0.04, 0.07, MAT(P8.stoneL), 0, -h / 2 - 0.006, 0.014));  /* 石窗台 */
  if (o.shutter) {                                             /* 两侧木百叶 */
    var sm = MAT(o.shutterCol || P8.woodM);
    g.add(box(0.05, h * 0.92, 0.024, sm, -w / 2 - 0.055, 0, 0.006));
    g.add(box(0.05, h * 0.92, 0.024, sm, w / 2 + 0.055, 0, 0.006));
  }
  g.userData.glassMat = gl;
  return g;
}
/* 店面暖光橱窗（大玻璃 + 竖棂 + 柜沿 = 4 mesh） */
function shopGlow(w, h) {
  var g = grp();
  g.add(box(w + 0.06, h + 0.06, 0.04, MAT(P8.woodD)));
  var gm = std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.5 });
  g.add(box(w, h, 0.032, gm, 0, 0, 0.005));
  g.add(box(0.03, h, 0.042, MAT(P8.woodD), 0, 0, 0.009));
  g.add(box(w + 0.1, 0.1, 0.12, MAT(P8.woodM), 0, -h / 2 - 0.07, 0.03));
  g.userData.glowMat = gm;
  return g;
}
/* 板门 + 木内门 + 石笠（3 mesh） */
function boardDoor(w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.04, 0.035, MAT(P8.woodD)));
  g.add(box(w - 0.02, h - 0.03, 0.024, MAT(P8.woodM), 0, -0.01, 0.014));
  g.add(box(w + 0.14, 0.045, 0.07, MAT(P8.stoneL), 0, -h / 2 - 0.005, 0.014));
  return g;
}
/* 石库门拱门头（身份特征 #1）：双块石墩 + 半圆拱环 + 拱心石 + 弧肩脊 + 侧墙 + 藤蔓 + 石阶
 * w=净跨, h=墩高; lv3+ 加「田子坊」匾位, lv4 鎏金匾。~15 mesh */
function shikumenGate(w, h, lv) {
  var g = grp(), r = w / 2 + 0.04;
  var pm = MAT(P8.stone), pmL = MAT(P8.stoneL);
  g.add(box(0.15, h, 0.15, pm, -r - 0.05, h / 2, 0));           /* 左墩 */
  g.add(box(0.15, h, 0.15, pm, r + 0.05, h / 2, 0));            /* 右墩 */
  g.add(box(0.2, 0.045, 0.2, pmL, -r - 0.05, h + 0.022, 0));    /* 墩帽 ×2 */
  g.add(box(0.2, 0.045, 0.2, pmL, r + 0.05, h + 0.022, 0));
  var arc = mesh(new THREE.TorusGeometry(r, 0.055, 8, 16, PI), pmL);
  arc.position.y = h; g.add(arc);                               /* 拱环 */
  g.add(box(0.055, 0.1, 0.062, pm, 0, h + 0.02, 0.06));         /* 拱心石（凸出前脸） */
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
  var capG = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }), pmL);
  capG.position.y = capBase; g.add(capG);
  /* 侧墙（连到地块边界方向）+ 压顶 */
  g.add(box(0.2, h * 0.55, 0.11, MAT(P8.stoneF), r + 0.17, h * 0.275, 0));
  g.add(box(0.24, 0.035, 0.14, MAT(P8.stoneD), r + 0.17, h * 0.55 + 0.017, 0));
  /* 藤蔓（2 团绿 + 1 垂条） */
  var vm = MAT(P8.moss, { rough: 0.95 });
  var v1 = sph(0.055, vm, 0, 0, 0, 12); v1.scale.set(1.25, 0.8, 0.7); v1.position.set(-r * 0.55, h + 0.09, 0.075); g.add(v1);
  var v2 = sph(0.045, vm, 0, 0, 0, 12); v2.scale.set(1.1, 0.75, 0.65); v2.position.set(r * 0.62, h + 0.07, 0.07); g.add(v2);
  var v3 = box(0.02, 0.16, 0.014, vm, -r - 0.02, h - 0.14, 0.078); v3.rotation.z = 0.18; g.add(v3);
  /* 石阶 ×2 */
  g.add(box(w + 0.2, 0.035, 0.18, MAT(P8.stoneD), 0, 0.017, 0.14));
  g.add(box(w + 0.28, 0.035, 0.12, MAT(P8.stoneD), 0, 0.052, 0.22));
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
/* 弧肩荷兰山墙（身份特征 #2）：凹弧肩 + 涡卷端 + 石压顶 (+lv3 老虎窗) —— 5~7 mesh */
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
  var body = mesh(new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: true, bevelThickness: 0.007, bevelSize: 0.007, bevelSegments: 1 }),
    MAT(P8.brick, { rough: 0.88 }));
  g.add(body);
  /* 石压顶：沿轮廓顶缘的薄条（简化为弧肩上沿三段） */
  g.add(box(w * 0.42, 0.028, depth + 0.02, MAT(P8.stoneL), 0, h + 0.008, depth / 2));
  g.add(box(0.028, h * 0.3, depth + 0.02, MAT(P8.stoneL), -w2 + 0.014, h * 0.15 + h * 0.3, depth / 2));
  g.add(box(0.028, h * 0.3, depth + 0.02, MAT(P8.stoneL), w2 - 0.014, h * 0.15 + h * 0.3, depth / 2));
  /* 两端涡卷（小圆柱贴肩） */
  var v1 = cyl(0.032, 0.032, depth * 0.55, 12, MAT(P8.stone), -w2 * 0.62, h * 0.62, depth / 2);
  v1.rotation.x = PI / 2; g.add(v1);
  var v2 = cyl(0.032, 0.032, depth * 0.55, 12, MAT(P8.stone), w2 * 0.62, h * 0.62, depth / 2);
  v2.rotation.x = PI / 2; g.add(v2);
  /* 山墙中央小拱窗（lv2 实心浮雕 / lv3 拱窗亮光） */
  if (lv >= 3) {
    var aw = latticeWindow(0.11, 0.13, {});
    aw.position.set(0, h * 0.42, depth + 0.01); g.add(aw);
  } else {
    var em = box(0.12, 0.1, 0.02, MAT(P8.stone), 0, h * 0.42, depth + 0.006); g.add(em);
  }
  return g;
}
/* 山墙后板瓦两坡顶（2 坡 + 脊 + 2 封板 = 5 mesh；UV 沿坡向 → 瓦垄横纹） */
function slateGableRoof(w, rise, half) {
  var g = grp();
  var slope = Math.sqrt(rise * rise + half * half), ang = Math.atan2(rise, half);
  var rF = slateBox(w + 0.06, 0.03, slope, 2, 1); rF.rotation.x = ang; rF.position.set(0, rise / 2, half / 2); g.add(rF);
  var rB = slateBox(w + 0.06, 0.03, slope, 2, 1); rB.rotation.x = -ang; rB.position.set(0, rise / 2, -half / 2); g.add(rB);
  g.add(box(w + 0.1, 0.042, 0.06, MAT(P8.slateD), 0, rise + 0.012, 0));
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
/* 木栏阳台（deck + n+1 宝瓶栏 + 顶轨 + 2 边柱 = n+5 mesh） */
function balustrade(w, d, n, mat) {
  var g = grp();
  g.add(box(w, 0.035, d, mat, 0, 0, d / 2));
  for (var i = 0; i <= n; i++) {
    g.add(cyl(0.013, 0.019, 0.11, 10, mat, -w / 2 + i * (w / n), 0.07, d - 0.015));
  }
  g.add(box(w + 0.04, 0.028, 0.045, mat, 0, 0.145, d - 0.015));
  g.add(box(0.028, 0.15, d, mat, -w / 2, 0.07, d / 2));
  g.add(box(0.028, 0.15, d, mat, w / 2, 0.07, d / 2));
  return g;
}
/* 草橙直布篷（lv2）：4 幅布 + 2 杆 = 6 mesh */
function awningStraight(w, col) {
  var g = grp(), cm = MAT(col || P8.straw, { rough: 0.9 }), cm2 = MAT(col ? P8.strawD : P8.strawD, { rough: 0.9 });
  for (var i = 0; i < 4; i++) {
    var tt = i / 3, a = (18 + 34 * tt) * PI / 180;
    var seg = box(w, 0.018, 0.15, (i % 2) ? cm2 : cm);
    seg.position.set(0, -cos(a) * 0.26, sin(a) * 0.26);
    seg.rotation.x = -a * 0.5;
    g.add(seg);
  }
  var rod = cyl(0.009, 0.009, w + 0.06, 10, MAT(P8.woodD));
  rod.rotation.z = PI / 2;
  rod.position.set(0, -cos(52 * PI / 180) * 0.26, sin(52 * PI / 180) * 0.26);
  g.add(rod);
  var rod2 = cyl(0.009, 0.009, w + 0.06, 10, MAT(P8.woodD));
  rod2.rotation.z = PI / 2;
  rod2.position.set(0, -cos(18 * PI / 180) * 0.26, sin(18 * PI / 180) * 0.26);
  g.add(rod2);
  return g;
}
/* 扇贝篷（lv3 乌黑）：板 + 5 半圆扇贝 + 杆 = 7 mesh */
function awningScallop(w, col) {
  var g = grp();
  var cm = MAT(col || P8.awnDk, { rough: 0.88 });
  var bd = box(w, 0.02, 0.16, cm, 0, 0, 0.1); bd.rotation.x = -0.5; g.add(bd);
  var n = 5;
  for (var i = 0; i < n; i++) {
    var sc = mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.014, 12, 1, false, 0, PI), cm);
    sc.geometry.rotateX(PI / 2); sc.geometry.rotateZ(0);
    sc.rotation.z = 0;
    sc.position.set(-w / 2 + 0.06 + i * (w - 0.12) / (n - 1), -0.115, 0.19);
    sc.rotation.x = 0; 
    g.add(sc);
  }
  var rod = cyl(0.008, 0.008, w + 0.06, 10, MAT(P8.woodD));
  rod.rotation.z = PI / 2; rod.position.set(0, -0.09, 0.22); g.add(rod);
  return g;
}
/* 朱红扇贝垂帘（lv4）：垂帘板（Shape 锯贝底缘挤出）+ 上篷斜板 = 2 mesh */
function valanceRed(w, h) {
  var g = grp();
  var s = new THREE.Shape();
  var n = 6, seg = w / n;
  s.moveTo(-w / 2, 0);
  s.lineTo(w / 2, 0);
  s.lineTo(w / 2, -h * 0.45);
  for (var i = 0; i < n; i++) {
    var x1 = w / 2 - seg * i, x0 = x1 - seg;
    s.quadraticCurveTo((x0 + x1) / 2, -h, x0, -h * 0.45);
  }
  s.closePath();
  var val = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: false }), MAT(P8.redAwn, { rough: 0.85 }));
  g.add(val);
  var top = box(w, 0.016, 0.2, MAT(P8.redAwn2, { rough: 0.85 }), 0, 0.03, 0.1);
  top.rotation.x = -0.42; g.add(top);
  return g;
}
/* 红灯笼（身 + 上下盖 + 穗 + 钩 = 5 mesh；返回 sway 挂点组） */
function redLantern(s) {
  s = s || 1;
  var g = grp();
  var body = sph(0.05 * s, MAT(P8.lantern, { rough: 0.55, emissive: '#ff9a50', ei: 0.35 }), 0, 0, 0, 12);
  body.scale.y = 1.15; g.add(body);
  g.add(cyl(0.02 * s, 0.026 * s, 0.02 * s, 10, MAT(P8.gilt, { metal: 0.4, rough: 0.45 }), 0, 0.062 * s, 0));
  g.add(cyl(0.026 * s, 0.02 * s, 0.02 * s, 10, MAT(P8.gilt, { metal: 0.4, rough: 0.45 }), 0, -0.062 * s, 0));
  g.add(box(0.012 * s, 0.05 * s, 0.01 * s, MAT('#d8b04a', { rough: 0.8 }), 0, -0.095 * s, 0));
  g.add(cyl(0.006 * s, 0.006 * s, 0.03 * s, 10, MAT(P8.woodD), 0, 0.085 * s, 0));
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
/* 市摊货物（筐 ×2 + 货箱 = 4 mesh） */
function stallGoods() {
  var g = grp();
  var b1 = cyl(0.05, 0.038, 0.05, 10, MAT('#9c6a3e', { rough: 0.9 }), -0.08, 0.24, 0.02); g.add(b1);
  var f1 = sph(0.03, MAT('#c8903e', { rough: 0.85 }), -0.08, 0.275, 0.02, 12); f1.scale.y = 0.6; g.add(f1);
  var b2 = cyl(0.045, 0.034, 0.045, 10, MAT('#8a5a34', { rough: 0.9 }), 0.06, 0.235, -0.02); g.add(b2);
  g.add(box(0.09, 0.05, 0.09, MAT(P8.woodM), 0.0, 0.265, 0.06));
  return g;
}
/* 陶盆绿植（盆 + 2 绿团 = 3 mesh，球段 ≥12） */
function potPlant(s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.06 * s, 0.07 * s, 10, MAT('#9c5a38', { rough: 0.8 }), 0, 0.035 * s, 0));
  put(g, sph(0.05 * s, MAT('#5d7c3a', { rough: 0.95 }), 0, 0.1 * s, 0, 12), 0, 0.1 * s, 0);
  put(g, sph(0.032 * s, MAT('#7a9a4e', { rough: 0.95 }), 0.03 * s, 0.075 * s, 0.02 * s, 12), 0.03 * s, 0.075 * s, 0.02 * s);
  return g;
}
/* 花箱（箱 + 2 绿团 = 3 mesh） */
function planterBox(w) {
  var g = grp();
  g.add(box(w, 0.05, 0.07, MAT(P8.woodD), 0, 0, 0));
  put(g, sph(0.03, MAT('#6f8f44', { rough: 0.95 }), -w * 0.22, 0.042, 0, 12), -w * 0.22, 0.042, 0);
  put(g, sph(0.03, MAT('#7a9a4e', { rough: 0.95 }), w * 0.2, 0.04, 0.01, 12), w * 0.2, 0.04, 0.01);
  return g;
}
function bush8(s, col) {
  var b = sph(0.085 * (s || 1), MAT(col || '#6f8f44', { rough: 0.95 }), 0, 0, 0, 12);
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
/* 地坪：石板铺地 + 苔草（参考图基地为石板 + 苔缝，区别于 prop_6 草坪）= 2 + 4 + 2 mesh */
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
  return g;
}
/* 翘角板瓦层顶（身份特征 #6）：自定义几何 — 四坡 + 翘角上扬 + 鎏金卷角吻 + 朱红封檐 + 正脊
 * 参考 prop_6.cnRoofGeo 思路重写：更大垂脊起翘（skirt lift），前后坡 pan-cover 竖垄 UV */
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
/* 鎏金卷角吻（吻在外侧上翘卷起）：torus 弧 + 锥尖 + 底座 = 3 mesh */
function giltHorn(flip) {
  var g = grp();
  var bm = MAT(P8.gilt, { rough: 0.4, metal: 0.55, emissive: P8.giltD, ei: 0.12 });
  var arc = mesh(new THREE.TorusGeometry(0.052, 0.02, 8, 14, PI * 1.15), bm);
  arc.rotation.y = PI / 2;
  if (flip) arc.rotation.z = -PI * 0.35; else arc.rotation.z = PI * 0.2;
  g.add(arc);
  var tip = mesh(new THREE.ConeGeometry(0.02, 0.055, 10), bm);
  tip.position.set(0, flip ? -0.062 : 0.062, flip ? 0.05 : -0.045);
  tip.rotation.z = flip ? 0.5 : -0.5;
  g.add(tip);
  g.add(box(0.05, 0.05, 0.05, bm, 0, flip ? -0.02 : 0.02, 0));
  return g;
}
/* 翘角层顶总成：瓦面 + 4 朱红封檐 + 正脊 + 2 吻 + 中央鎏金顶 = ~13 mesh */
function flareRoof(w, d, h, big) {
  var g = grp();
  var ov = Math.min(w, d) * (big ? 0.16 : 0.13), cl = Math.min(w, d) * (big ? 0.1 : 0.085), lift = big ? 0.1 : 0.06;
  var t = texSlate().clone(); t.needsUpdate = true; t.repeat.set(2, 1);
  g.add(mesh(flareRoofGeo(w, d, h, ov, cl, lift), std('#ffffff', { map: t, rough: 0.6, side: THREE.DoubleSide })));
  var red = MAT(P8.redAwn, { rough: 0.75 });
  g.add(box(w * 0.86, 0.045, 0.02, red, 0, cl * 0.5, d / 2 + ov * 0.72));
  g.add(box(w * 0.86, 0.045, 0.02, red, 0, cl * 0.5, -(d / 2 + ov * 0.72)));
  g.add(box(0.02, 0.045, d * 0.84, red, w / 2 + ov * 0.72, cl * 0.5, 0));
  g.add(box(0.02, 0.045, d * 0.84, red, -(w / 2 + ov * 0.72), cl * 0.5, 0));
  var rs = MAT(P8.stoneD, { rough: 0.75 });
  g.add(box(w * 0.44, 0.05, 0.055, rs, 0, h + 0.018, 0));
  var h1 = giltHorn(false); h1.position.set(-w * 0.24, h + 0.03, 0); g.add(h1);
  var h2 = giltHorn(true); h2.position.set(w * 0.24, h + 0.03, 0); g.add(h2);
  if (big) {
    g.add(box(0.15, 0.045, 0.04, rs, 0, h + 0.062, 0));
    g.add(cyl(0.02, 0.026, 0.032, 10, MAT(P8.gilt, { metal: 0.5, rough: 0.4 }), 0, h + 0.095, 0));
  }
  return g;
}
/* 檐下挂灯笼点（钩 + 灯笼；返回 sway 挂点） */
function hangLantern(s) {
  var g = grp();
  g.add(cyl(0.007, 0.007, 0.035, 10, MAT(P8.woodD), 0, -0.017, 0));
  var l = redLantern(s || 1); l.position.y = -0.06 * (s || 1) - 0.03; g.add(l);
  return g;
}

/* ============================ 4. 四阶建筑（blockout→structure→form→material→lighting→interaction） ============================ */

/* ---------- lv1 小屋：板条棚屋 + 苔痕板皮顶 + 偏厦门廊 + 石库门头 + 石板地
   （~55 mesh, H≈0.98） ---------- */
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
  /* 左暗窗 + 右暖窗（矩形棂格） */
  var wDark = latticeWindow(0.22, 0.24, {}); wDark.position.set(0.22, 0.36, 0.392); B.add(wDark);
  var glowM = std('#e8b264', { rough: 0.45, emissive: P8.glow, ei: 0.25 });
  var wGlow = latticeWindow(0.2, 0.22, { glowMat: glowM }); wGlow.position.set(0.48, 0.36, 0.392); B.add(wGlow);
  /* 苔痕板皮人字顶（大挑檐） */
  var roof = grp(); roof.position.set(0, 0.57, 0); B.add(roof);
  var rise = 0.28, half = 0.7, slope = Math.sqrt(rise * rise + half * half) + 0.05, ang = Math.atan2(rise, half);
  var pF = shingleBox(1.3, 0.035, slope, 2, 1); pF.rotation.x = ang; pF.position.set(0, rise * 0.5, half * 0.5); roof.add(pF);
  var pB = shingleBox(1.3, 0.035, slope, 2, 1); pB.rotation.x = -ang; pB.position.set(0, rise * 0.5, -half * 0.5); roof.add(pB);
  roof.add(box(1.36, 0.045, 0.07, MAT(P8.plankD), 0, rise + 0.012, 0));
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
  shed.add(cyl(0.017, 0.021, 0.32, 10, MAT(P8.plankD), 0.22, 0.16, 0.24));
  shed.add(cyl(0.017, 0.021, 0.32, 10, MAT(P8.plankD), 0.22, 0.16, -0.24));
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
  /* 杂物桶 ×2（参考图门前杂物） */
  g.add(cyl(0.05, 0.055, 0.13, 10, MAT('#5a6a74', { rough: 0.7 }), 0.62, 0.14, 0.4));
  g.add(cyl(0.042, 0.048, 0.1, 10, MAT('#6a5a3a', { rough: 0.8 }), 0.74, 0.13, 0.52));

  /* anim：暖窗呼吸（克制） */
  anim(g, function (t) { glowM.emissiveIntensity = 0.25 + 0.1 * sin(t * 1.6); });
  return g;
}

/* ---------- lv2 洋房：两层红砖商铺 + 草橙直篷 + 柜台 + 木栏阳台 + 首座弧肩山墙 + 石库门头
   （~105 mesh, H≈1.5） ---------- */
function lv2() {
  var g = grp(); g.name = 'prop_8_lv2';
  g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = 2;
  g.add(pad8());

  var B = grp(); B.position.set(-0.02, 0.078, -0.2); g.add(B);
  B.add(box(1.6, 0.06, 1.0, MAT(P8.stoneD), 0, 0.03, 0));                          /* 勒脚 */
  var main = brickBox(1.5, 0.98, 0.9, 3, 2); main.position.set(0, 0.56, 0); B.add(main);
  [[-0.72, 0.42], [0.72, 0.42], [-0.72, -0.42], [0.72, -0.42]].forEach(function (c) {
    var q = quoinStrip(0.98, c[0], c[1], 1); q.position.y = 0.07; B.add(q);        /* 隅石 */
  });
  B.add(box(1.56, 0.04, 0.94, MAT(P8.stone), 0, 0.58, 0));                         /* 层间线 */
  B.add(box(1.58, 0.055, 0.96, MAT(P8.stoneL), 0, 1.07, 0));                       /* 顶檐口 */
  /* 一层店面：暖光橱窗 + 板门 + 草橙直篷 + 柜台 + 挂匾 */
  var shop = shopGlow(0.46, 0.34); shop.position.set(-0.4, 0.33, 0.458); B.add(shop);
  var dr = boardDoor(0.26, 0.42); dr.position.set(0.18, 0.32, 0.458); B.add(dr);
  var aw = awningStraight(1.24, P8.straw); aw.position.set(-0.06, 0.68, 0.56); B.add(aw);
  var sign = textPlate8('茶', 0.13, 0.13, { bg: '#26221a', fg: '#e2c274', ei: 0.16 });
  var hang = grp(); hang.position.set(0.52, 0.62, 0.5); hang.add(sign); B.add(hang);
  var ct = counter8(0.7); ct.position.set(-0.38, 0.09, 0.72); B.add(ct);           /* 门口柜台 */
  /* 二层：棂格窗 ×3（中窗青绿百叶）+ 木瓶栏阳台 + 花箱 */
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

/* ---------- lv3 大厦：三层起台 + 乌黑扇贝篷 + 市摊 + 双层阳台 + 红灯笼 + 大山墙老虎窗
   + 侧翼披楼 + 「田子坊」木匾（~165 mesh, H≈2.12） ---------- */
function lv3() {
  var g = grp(); g.name = 'prop_8_lv3';
  g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = 3;
  g.add(pad8());

  var B = grp(); B.position.set(0, 0.078, -0.16); g.add(B);
  B.add(box(1.54, 0.07, 1.02, MAT(P8.stoneD), 0, 0.035, 0));                       /* 勒脚 */
  var main = brickBox(1.42, 1.56, 0.95, 3, 3); main.position.set(0, 0.83, 0); B.add(main);
  [[-0.68, 0.45], [0.68, 0.45], [-0.68, -0.45], [0.68, -0.45]].forEach(function (c) {
    var q = quoinStrip(1.56, c[0], c[1], 1); q.position.y = 0.07; B.add(q);
  });
  B.add(box(1.48, 0.04, 0.98, MAT(P8.stone), 0, 0.58, 0));                         /* 层线 ×2 */
  B.add(box(1.48, 0.04, 0.98, MAT(P8.stone), 0, 1.1, 0));
  B.add(box(1.5, 0.055, 1.0, MAT(P8.stoneL), 0, 1.63, 0));                         /* 顶檐口 */
  /* 一层：板门 + 暖窗 + 乌黑扇贝篷 + 市摊货物 */
  var dr = boardDoor(0.26, 0.44); dr.position.set(-0.44, 0.31, 0.478); B.add(dr);
  var sw = latticeWindow(0.34, 0.34, { glowMat: std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.45 }) });
  sw.position.set(0.24, 0.33, 0.478); B.add(sw);
  var aw = awningScallop(1.2, P8.awnDk); aw.position.set(0.1, 0.62, 0.6); B.add(aw);
  var goods = stallGoods(); goods.position.set(0.34, 0.09, 0.72); B.add(goods);
  /* 二层：棂窗 ×3 + 木栏阳台 + 花箱 */
  var w21 = latticeWindow(0.24, 0.3, {}); w21.position.set(-0.46, 0.9, 0.478); B.add(w21);
  var w22 = latticeWindow(0.3, 0.34, { glowMat: std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.4 }) });
  w22.position.set(0.1, 0.9, 0.478); B.add(w22);
  var w23 = latticeWindow(0.24, 0.3, {}); w23.position.set(0.56, 0.9, 0.478); B.add(w23);
  var b2 = balustrade(0.94, 0.2, 5, MAT(P8.woodM)); b2.position.set(0.06, 0.66, 0.54); B.add(b2);
  var fb2 = planterBox(0.5); fb2.position.set(0.06, 0.73, 0.7); B.add(fb2);
  /* 三层：棂窗 ×3 + 石栏阳台 + 花箱 */
  var w31 = latticeWindow(0.22, 0.28, {}); w31.position.set(-0.46, 1.4, 0.478); B.add(w31);
  var w32 = latticeWindow(0.26, 0.3, { glowMat: std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.35 }) });
  w32.position.set(0.08, 1.4, 0.478); B.add(w32);
  var w33 = latticeWindow(0.22, 0.28, {}); w33.position.set(0.54, 1.4, 0.478); B.add(w33);
  var b3 = balustrade(0.94, 0.2, 5, MAT(P8.stoneL)); b3.position.set(0.04, 1.16, 0.54); B.add(b3);
  var fb3 = planterBox(0.46); fb3.position.set(0.04, 1.23, 0.7); B.add(fb3);
  /* 大弧肩山墙（带拱窗）+ 板瓦坡顶 */
  var ped = dutchGable(0.9, 0.38, 0.12, 3); ped.position.set(0.02, 1.66, 0.38); B.add(ped);
  var rg = slateGableRoof(1.0, 0.24, 0.48); rg.position.set(0.02, 1.66, -0.12); B.add(rg);
  /* 檐下红灯笼 ×1（sway 挂点） */
  var lan = hangLantern(0.9); lan.position.set(0.56, 0.66, 0.56); B.add(lan);

  /* 侧翼披楼（+x 两层，独栋小山墙） */
  var W = grp(); W.position.set(0.97, 0.078, -0.22); g.add(W);
  W.add(box(0.56, 0.05, 0.8, MAT(P8.stoneD), 0, 0.025, 0));
  var wb = brickBox(0.5, 0.86, 0.72, 2, 2); wb.position.set(0, 0.5, 0); W.add(wb);
  W.add(box(0.56, 0.045, 0.76, MAT(P8.stoneL), 0, 0.955, 0));
  var w41 = latticeWindow(0.17, 0.24, {}); w41.position.set(0, 0.4, 0.365); W.add(w41);
  var w42 = latticeWindow(0.17, 0.22, { glowMat: std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.3 }) });
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

  /* anim：红灯笼摇 + 匾额微光 */
  anim(g, function (t) { lan.rotation.z = sin(t * 1.3) * 0.09; lan.rotation.x = sin(t * 0.9 + 1) * 0.05; });
  var pm = gw.userData.plaqueMat;
  if (pm) anim(g, function (t) { pm.emissiveIntensity = 0.1 + 0.12 * (0.5 + 0.5 * sin(t * 1.1)); });
  return g;
}

/* ---------- lv4 地标：木装堂层 + 朱红垂帘店面 + 格窗阵列 + 三叠阳台 + 红灯笼串
   + 翘角板瓦双叠层顶（鎏金卷角吻）+ 鎏金牌坊匾 + 侧翼楼（~210 mesh, H≈2.68） ---------- */
function lv4() {
  var g = grp(); g.name = 'prop_8_lv4';
  g.userData.kind = 'property'; g.userData.propIdx = 8; g.userData.level = 4;
  g.add(pad8());

  var B = grp(); B.position.set(0.0, 0.078, -0.14); g.add(B);
  B.add(box(1.7, 0.09, 1.18, MAT(P8.stoneD), 0, 0.045, 0));                        /* 石勒脚 */
  /* 堂层（木装 + 石壁柱）：H 0.52 */
  var hall = plankBox(1.58, 0.52, 1.06, 3, 1); hall.position.set(0, 0.375, 0); B.add(hall);
  [[-0.76, 0.5], [0.76, 0.5], [-0.76, -0.5], [0.76, -0.5]].forEach(function (c) {
    B.add(box(0.09, 0.52, 0.06, MAT(P8.stone), c[0], 0.375, c[1]));                /* 角部壁柱 */
  });
  B.add(box(1.64, 0.05, 1.12, MAT(P8.stoneL), 0, 0.665, 0));                       /* 堂层檐 */
  /* 二/三层砖墙 */
  var main = brickBox(1.56, 1.1, 1.06, 3, 3); main.position.set(0, 1.24, 0); B.add(main);
  B.add(box(1.6, 0.04, 1.1, MAT(P8.stone), 0, 1.22, 0));                           /* 层线 */
  B.add(box(1.6, 0.045, 1.1, MAT(P8.stone), 0, 1.78, 0));
  B.add(box(1.64, 0.06, 1.14, MAT(P8.stoneL), 0, 1.94, 0));                        /* 顶横檐 */
  /* 堂层店面：朱红扇贝垂帘 + 暖光大橱窗 + 板门 + 货摊 + 「田子坊」金匾 */
  var val = valanceRed(1.3, 0.2); val.position.set(-0.14, 0.62, 0.58); B.add(val);
  var shop = shopGlow(0.5, 0.36); shop.position.set(-0.42, 0.36, 0.545); B.add(shop);
  var dr = boardDoor(0.28, 0.44); dr.position.set(0.26, 0.34, 0.545); B.add(dr);
  var goods = stallGoods(); goods.position.set(-0.1, 0.09, 0.74); B.add(goods);
  var plaque = textPlate8('田子坊', 0.4, 0.13, { bg: '#1d1a14', fg: '#e8c87a', border: '#8a6a30', ei: 0.16 });
  plaque.position.set(0.66, 0.62, 0.55); plaque.rotation.y = -0.1; B.add(plaque);
  /* 二层：棂窗 ×3 + 木栏阳台 + 花箱 + 灯笼 ×1 */
  var w21 = latticeWindow(0.24, 0.3, { shutter: true }); w21.position.set(-0.5, 0.95, 0.545); B.add(w21);
  var w22 = latticeWindow(0.3, 0.32, { glowMat: std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.45 }) });
  w22.position.set(0.04, 0.95, 0.545); B.add(w22);
  var w23 = latticeWindow(0.24, 0.3, { shutter: true }); w23.position.set(0.54, 0.95, 0.545); B.add(w23);
  var b2 = balustrade(1.0, 0.22, 5, MAT(P8.woodM)); b2.position.set(0.04, 0.7, 0.58); B.add(b2);
  var fb2 = planterBox(0.5); fb2.position.set(0.04, 0.77, 0.76); B.add(fb2);
  var lan1 = hangLantern(0.85); lan1.position.set(-0.5, 0.72, 0.6); B.add(lan1);
  /* 三层：棂窗 ×3 + 石栏阳台 + 花箱 + 灯笼 ×1 */
  var w31 = latticeWindow(0.22, 0.28, {}); w31.position.set(-0.5, 1.46, 0.545); B.add(w31);
  var w32 = latticeWindow(0.28, 0.3, { glowMat: std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.4 }) });
  w32.position.set(0.04, 1.46, 0.545); B.add(w32);
  var w33 = latticeWindow(0.22, 0.28, {}); w33.position.set(0.54, 1.46, 0.545); B.add(w33);
  var b3 = balustrade(1.0, 0.22, 5, MAT(P8.stoneL)); b3.position.set(0.04, 1.21, 0.58); B.add(b3);
  var fb3 = planterBox(0.48); fb3.position.set(0.04, 1.28, 0.76); B.add(fb3);
  var lan2 = hangLantern(0.8); lan2.position.set(0.56, 1.24, 0.6); B.add(lan2);
  /* 主翘角板瓦层顶（大）+ 上层小翘角顶（双叠） */
  var rf1 = flareRoof(1.56, 1.24, 0.3, true); rf1.position.set(0, 1.97, -0.04); B.add(rf1);
  var rf2 = flareRoof(1.0, 0.8, 0.22, false); rf2.position.set(0, 2.3, -0.04); B.add(rf2);
  /* 山墙弃用 → 背立面上小老虎窗（嵌屋坡） */
  var dm = latticeWindow(0.14, 0.16, {}); dm.position.set(0.32, 2.12, 0.42); dm.rotation.x = 0.5; B.add(dm);

  /* 侧翼楼（+x，三层收分 + 小披檐） */
  var W = grp(); W.position.set(0.98, 0.078, -0.2); g.add(W);
  W.add(box(0.56, 0.06, 0.86, MAT(P8.stoneD), 0, 0.03, 0));
  var wb = brickBox(0.5, 1.12, 0.78, 2, 2); wb.position.set(0, 0.62, 0); W.add(wb);
  W.add(box(0.56, 0.05, 0.82, MAT(P8.stoneL), 0, 1.215, 0));
  var w51 = latticeWindow(0.18, 0.26, {}); w51.position.set(0, 0.46, 0.395); W.add(w51);
  var w52 = latticeWindow(0.18, 0.24, { glowMat: std('#e8b264', { rough: 0.4, emissive: P8.glow, ei: 0.3 }) });
  w52.position.set(0, 0.98, 0.395); W.add(w52);
  var cap = grp(); cap.position.set(0, 1.26, 0.14); W.add(cap);
  var cs = slateBox(0.56, 0.026, 0.5, 1, 1); cs.rotation.x = 0.3; cap.add(cs);
  cap.add(cyl(0.015, 0.019, 0.24, 10, MAT(P8.woodD), 0.22, -0.13, 0.14));
  cap.add(cyl(0.015, 0.019, 0.24, 10, MAT(P8.woodD), -0.22, -0.13, 0.14));
  var wrail = balustrade(0.54, 0.16, 3, MAT(P8.stoneL)); wrail.position.set(0, 1.24, 0.34); W.add(wrail);

  /* 前院：鎏金匾石库门头 + 墙 + 台阶 + 径 + 绿植 */
  var gw = shikumenGate(0.5, 0.58, 4); gw.position.set(0.64, 0.078, 0.86); gw.rotation.y = -0.34; g.add(gw);
  var y1 = yardWall8(0.52, 1.15); y1.position.set(-0.5, 0.078, 0.98); g.add(y1);
  var y2 = yardWall8(0.36, 0.2); y2.position.set(1.04, 0.078, 0.38); g.add(y2);
  g.add(box(0.56, 0.03, 0.26, MAT(P8.stoneD), 0.64, 0.09, 0.62));                  /* 门阶 ×2 */
  g.add(box(0.56, 0.03, 0.2, MAT(P8.stoneD), 0.64, 0.062, 0.44));
  g.add(flagPath8(0.44, 0.94));
  var p1 = potPlant(1.1); p1.position.set(-0.2, 0.078, 0.6); g.add(p1);
  var p2 = potPlant(0.95); p2.position.set(0.32, 0.078, 0.64); g.add(p2);
  var p3 = potPlant(0.8); p3.position.set(-0.98, 0.078, 0.2); g.add(p3);
  var bs1 = bush8(1.1); bs1.position.set(1.06, 0.15, 0.02); g.add(bs1);
  var bs2 = bush8(0.8, '#5d7c3a'); bs2.position.set(-1.12, 0.13, -0.34); g.add(bs2);
  var bs3 = bush8(0.7, '#7a9a4e'); bs3.position.set(1.14, 0.12, -0.6); g.add(bs3);

  /* anim：双灯笼摇 + 金匾/鎏金流辉 + 窗光呼吸（均克制） */
  var pfm = plaque.userData.faceMat;
  var gmt = gw.userData.giltMat;
  anim(g, function (t) {
    lan1.rotation.z = sin(t * 1.25) * 0.09; lan1.rotation.x = sin(t * 0.85 + 0.7) * 0.05;
    lan2.rotation.z = sin(t * 1.45 + 1.4) * 0.08; lan2.rotation.x = sin(t * 0.95 + 2.0) * 0.05;
    if (pfm) pfm.emissiveIntensity = 0.16 + 0.12 * (0.5 + 0.5 * sin(t * 1.15));
    if (gmt) gmt.emissiveIntensity = 0.15 + 0.1 * (0.5 + 0.5 * sin(t * 0.9 + 1.2));
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
