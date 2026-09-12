/* =====================================================================================
 * 大富翁 · 个性化地产 格 6 「武康路」 —— 民国砖石洋楼四阶演进（img2threejs 高保真重建）
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/prop_6.png（四阶一体参考图，唯一视觉真源）。
 * 注：任务文中名称为「断桥烟雨」，但 data.js BOARD[6] = 武康路（g2 沪上组），且 prop_6.png
 *     内容即民国砖石洋楼族谱，与武康路匹配；本文件以参考图 + 输出契约（Props3D[6]）为准。
 *
 * —— img2threejs 雕刻 spec（摘要，按 SKILL.md 分阶段执行） ————————————————
 * 对象类别：object / installed-domain（微缩沙盘建筑），complexity: complex。
 * 风格族谱：「民国洋楼」——红砖墙 + 淡色石材隅石/壁柱、弧形石山花（观音兜式）、
 *   拱窗木框、石/木栏杆阳台、鼠尾草绿波浪篷、前院石牌坊、终极阶加蓝瓦歇山 Chinese roof
 *   （翘角、脊兽、红封檐板、白雕花山花圆窗）。
 * 身份定义特征（identity-defining，任一错误即 fail 该 pass）：
 *   1) 弧形石山花轮廓（凹弧起翘 + 浴卷肩 + 压顶）
 *   2) 红砖 vs 淡石材的双色对比（隅石/勒脚/线脚）
 *   3) 拱顶窗（半圆玻璃 + 石窗台 + 木框）
 *   4) 阳台花瓶栏杆（lv2 木 / lv3+ 石）
 *   5) 前院独立石牌坊（曲线压顶，lv3 石匾「武康」，lv4 鎏金饰板）
 *   6) lv4 蓝瓦歇山顶：瓦垄纹理、翘角、正脊脊兽、红封檐板、白山花圆窗、老虎窗
 * 四阶演进（同一块地同一风格的生长史）：
 *   lv1 小屋  H 0.8–1.2：木板小屋 + 板皮人字顶 + 侧披屋 + 矮石墙院，暖窗微光动画
 *   lv2 洋房  H 1.2–1.7：两层红砖商铺 + 绿波浪篷 + 木栏杆阳台 + 首座弧形山花 +
 *             山花后小青瓦坡顶 + 前院石牌坊，挂匾摇曳 + 店窗暖光
 *   lv3 大厦  H 1.7–2.3：三层楼阁起层 + 石栏杆双层阳台 + 山花升级（贴记浮雕）+
 *             侧翼楼 + 「武康」石匾微光
 *   lv4 地标  H 2.3–3.0：四层完整地标：白雕花山花（圆窗 + 浮雕）+ 蓝瓦歇山顶
 *             （翘角/脊兽/红封檐板/老虎窗）+ 三叠石栏阳台 + 「武康路」金匾 +
 *             鎏金牌坊（参考图即纯建筑地标）
 * 材质：MeshStandardMaterial（std() 做法同 buildings3d.js，convertSRGBToLinear）；
 *   Canvas 程序化纹理 ≤256px：砖墙 / 木板 / 蓝瓦垄。
 * 光照：不添加灯光（场景级光照），暖窗/金匾用 emissive 克制表现。
 * 交互（userData.anim = [fn(t,dt)]，幅度克制）：lv1 窗光呼吸；lv2 店窗呼吸 + 挂匾摇；
 *   lv3 匾额微光；lv4 金匾微光 + 鎏金饰板流辉 + 圆窗夜光。
 * 预算：每级 ≤220 mesh；占地 ≤2.6×2.6；原点=格心、底面 y=0；正面朝 +Z。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_6] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ============================ 0. 调色板 & 基础件（blockout 层） ============================ */
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
function sph(r, seg, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, seg || 8, (seg || 8) - 2), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z) { o.position.set(x || 0, y || 0, z || 0); parent.add(o); return o; }
function anim(g, fn) { (g.userData.anim || (g.userData.anim = [])).push(fn); }

/* ============================ 1. 风格色板（采样自参考图） ============================ */
var P6 = {
  brick:   '#a2624a',
  brickD:  '#8a5240',
  stone:   '#b4ac9c',
  stoneL:  '#c6bfb0',
  stoneD:  '#968e7e',
  woodD:   '#4c3624',
  woodM:   '#6b4a2c',
  awn:     '#93a077',
  awnD:    '#7f8c66',
  glow:    '#ffca7a',
  tileB:   '#4a5a6e',
  tileB2:  '#3e4d60',
  ridgeS:  '#8f897b',
  eaveRed: '#a05238',
  gilt:    '#c08c48',
  grass:   '#93a45a',
  lawn:    '#a3ad68',
  path:    '#c2b494',
  plank:   '#8f7a58',
  plankD:  '#6f6350',
  glaz:    '#2c3138'
};

/* ============================ 2. Canvas 程序化纹理（≤256px） ============================ */
function cv2(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function toTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }

var _texBrick = null;
function texBrick() {  /* 红砖 + 灰浆横缝 + 竖错缝 + 噪点 */
  if (_texBrick) return _texBrick;
  var c = cv2(128, 128), g = c.getContext('2d');
  g.fillStyle = P6.brick; g.fillRect(0, 0, 128, 128);
  var row = 16;
  for (var y = 0; y < 128; y += row) {
    g.fillStyle = 'rgba(214,200,180,0.55)'; g.fillRect(0, y, 128, 2);
    var off = (y / row) % 2 ? 0 : 16;
    for (var x = off; x < 128; x += 32) { g.fillRect(x, y, 2, row); }
    for (var i = 0; i < 26; i++) {
      var bx = (x + Math.random() * 30) % 128, by = y + 3 + Math.random() * (row - 6);
      g.fillStyle = Math.random() > 0.5 ? 'rgba(60,30,20,0.16)' : 'rgba(230,150,110,0.14)';
      g.fillRect(bx, by, 3 + Math.random() * 4, 2);
    }
  }
  _texBrick = toTex(c); _texBrick.wrapS = _texBrick.wrapT = THREE.RepeatWrapping;
  return _texBrick;
}
var _texPlank = null;
function texPlank() {  /* lv1 竖木板 */
  if (_texPlank) return _texPlank;
  var c = cv2(128, 128), g = c.getContext('2d');
  g.fillStyle = P6.plank; g.fillRect(0, 0, 128, 128);
  for (var x = 0; x < 128; x += 18) {
    g.fillStyle = 'rgba(40,28,16,0.5)'; g.fillRect(x, 0, 2, 128);
    for (var i = 0; i < 6; i++) {
      g.fillStyle = Math.random() > 0.5 ? 'rgba(60,44,26,0.25)' : 'rgba(190,165,120,0.18)';
      g.fillRect(x + 3 + Math.random() * 12, Math.random() * 124, 2, 6 + Math.random() * 14);
    }
  }
  _texPlank = toTex(c); _texPlank.wrapS = _texPlank.wrapT = THREE.RepeatWrapping;
  return _texPlank;
}
var _texTile = null;
function texTile() {  /* 蓝瓦垄：竖垄 + 暗横缝 */
  if (_texTile) return _texTile;
  var c = cv2(64, 64), g = c.getContext('2d');
  g.fillStyle = P6.tileB; g.fillRect(0, 0, 64, 64);
  for (var x = 0; x < 64; x += 16) {
    g.fillStyle = P6.tileB2; g.fillRect(x + 8, 0, 8, 64);
    g.fillStyle = 'rgba(16,24,34,0.6)'; g.fillRect(x + 7, 0, 1, 64); g.fillRect(x + 15, 0, 1, 64);
    g.fillStyle = 'rgba(150,170,190,0.25)'; g.fillRect(x + 1, 0, 2, 64);
  }
  g.fillStyle = 'rgba(14,20,30,0.4)';
  for (var y = 10; y < 64; y += 21) g.fillRect(0, y, 64, 2);
  _texTile = toTex(c); _texTile.wrapS = _texTile.wrapT = THREE.RepeatWrapping;
  return _texTile;
}
/* 匾额：深板 + 描金字（emissiveMap 微光可供动画） */
function textPlate6(text, w, h, o) {
  o = o || {};
  var cw = 128, ch = 48, c = cv2(cw, ch), g = c.getContext('2d');
  g.fillStyle = o.bg || '#26301f'; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = o.border || '#8f8570'; g.lineWidth = 5; g.strokeRect(4, 4, cw - 8, ch - 8);
  g.fillStyle = o.fg || '#e2c274'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold ' + Math.round(ch * 0.62) + 'px "Microsoft YaHei","PingFang SC","SimHei",sans-serif';
  g.fillText(text, cw / 2, ch / 2 + 2);
  var tex = toTex(c);
  var g6 = grp();
  g6.add(box(w, h, 0.035, o.backMat || MAT(P6.woodD)));
  var face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.86),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.1, flatShading: true,
      emissive: C(o.fg || '#e2c274'), emissiveIntensity: o.ei !== undefined ? o.ei : 0.12, emissiveMap: tex }));
  face.position.z = 0.024; g6.add(face);
  g6.userData.faceMat = face.material;
  return g6;
}

/* ============================ 3. Kit 预制件（structure/form 层） ============================ */
/* 砖墙块（六面同砖纹，按尺寸设 repeat） */
function brickBox(w, h, d, rx, ry) {
  var t = texBrick().clone(); t.needsUpdate = true; t.repeat.set(rx || 2, ry || 2);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.9 }));
}
function plankBox(w, h, d, rx, ry) {
  var t = texPlank().clone(); t.needsUpdate = true; t.repeat.set(rx || 1, ry || 1);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.92 }));
}
/* 淡石隅石（角部双色对比，两块错缝）；组原点在底面，调用方负责定位 */
function quoin(h, x, z) {
  var g = grp();
  g.add(box(0.09, h, 0.06, MAT(P6.stone), 0, h / 2, 0.012));
  g.add(box(0.06, h, 0.09, MAT(P6.stoneL), 0.015, h / 2, 0));
  g.position.set(x, 0, z);
  return g;
}
/* 拱窗：木框 + 暗玻璃 + 半圆 + 石窗台 (+ 键石) —— 5~6 mesh */
function archWindow(w, h, o) {
  o = o || {};
  var g = grp(), fm = MAT(o.frame || P6.woodD), gl = o.glowMat || MAT(P6.glaz, { rough: 0.35, metal: 0.12 });
  g.add(box(w + 0.05, h + 0.05, 0.035, fm));
  g.add(box(w, h, 0.03, gl, 0, 0, 0.004));
  var ag = new THREE.CylinderGeometry(w / 2, w / 2, 0.03, 12, 1, false, 0, PI);
  ag.rotateX(PI / 2); ag.rotateZ(PI / 2);
  g.add(mesh(ag, gl));
  var af = new THREE.CylinderGeometry(w / 2 + 0.026, w / 2 + 0.026, 0.032, 12, 1, false, 0, PI);
  af.rotateX(PI / 2); af.rotateZ(PI / 2);
  var afm = mesh(af, fm); afm.position.y = h / 2; g.add(afm);
  g.add(box(w + 0.13, 0.04, 0.07, MAT(P6.stoneL), 0, -h / 2 - 0.005, 0.012));
  if (o.key) g.add(box(0.045, 0.1, 0.042, MAT(P6.stoneL), 0, h / 2 + 0.03, 0.008));
  return g;
}
/* 拱顶落地窗（法式）+ 木棂 —— archWindow + 3 棂 */
function frenchWindow(w, h, o) {
  var g = archWindow(w, h, o);
  var fm = MAT(o.frame || P6.woodD);
  g.add(box(0.028, h, 0.04, fm, 0, 0, 0.008));
  g.add(box(w, 0.026, 0.04, fm, 0, h * 0.18, 0.008));
  g.add(box(w, 0.026, 0.04, fm, 0, -h * 0.22, 0.008));
  return g;
}
/* 店窗暖光（发光材质供 lv2 动画）—— 5 mesh */
function shopGlow(w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.035, MAT(P6.woodD)));
  var gm = std('#e8b264', { rough: 0.4, emissive: P6.glow, ei: 0.5 });
  g.add(box(w, h, 0.03, gm, 0, 0, 0.004));
  g.add(box(0.03, h, 0.036, MAT(P6.woodD), 0, 0, 0.008));
  g.add(box(w, 0.12, 0.1, MAT(P6.woodM), 0, -h / 2 - 0.06, 0.03));
  put(g, sph(0.035, 6, MAT('#b8432e', { rough: 0.6 })), -w * 0.2, -h / 2 + 0.02, 0.05);
  put(g, sph(0.035, 6, MAT('#c8a040', { rough: 0.6 })), w * 0.16, -h / 2 + 0.02, 0.05);
  g.userData.glowMat = gm;
  return g;
}
/* 花瓶栏杆阳台（lv2 木 / lv3+ 石）—— slab + (n+1) 栏杆 + 顶轨 + 2 边柱 */
function balustrade(w, d, n, mat) {
  var g = grp();
  g.add(box(w, 0.035, d, mat, 0, 0, d / 2));
  for (var i = 0; i <= n; i++) {
    g.add(cyl(0.014, 0.02, 0.11, 6, mat, -w / 2 + i * (w / n), 0.07, d - 0.015));
  }
  g.add(box(w + 0.04, 0.03, 0.045, mat, 0, 0.145, d - 0.015));
  g.add(box(0.03, 0.15, d, mat, -w / 2, 0.07, d / 2));
  g.add(box(0.03, 0.15, d, mat, w / 2, 0.07, d / 2));
  return g;
}
/* 阳台花箱（箱 + 2 绿团 = 3 mesh） */
function flowerBox(w) {
  var g = grp();
  g.add(box(w, 0.05, 0.07, MAT(P6.stoneD), 0, 0, 0));
  put(g, sph(0.032, 6, MAT('#6f8f44', { rough: 0.9 })), -w * 0.22, 0.045, 0);
  put(g, sph(0.032, 6, MAT('#8a5a3a', { rough: 0.9 })), w * 0.22, 0.045, 0.01);
  return g;
}
/* 弧形石山花（观音兜式轮廓——身份特征 #1）。lv4 加圆窗 + 浮雕 */
function curvedPediment(w, h, depth, lv) {
  var g = grp(), w2 = w / 2;
  var s = new THREE.Shape();
  s.moveTo(-w2, 0);
  s.lineTo(-w2, h * 0.30);
  s.quadraticCurveTo(-w2, h * 0.64, -w2 * 0.56, h * 0.80);
  s.quadraticCurveTo(-w2 * 0.26, h * 0.92, 0, h);
  s.quadraticCurveTo(w2 * 0.26, h * 0.92, w2 * 0.56, h * 0.80);
  s.quadraticCurveTo(w2, h * 0.64, w2, h * 0.30);
  s.lineTo(w2, 0);
  s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: depth, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 });
  g.add(mesh(geo, MAT(P6.stoneL, { rough: 0.8 })));
  var v1 = cyl(0.038, 0.038, depth * 0.6, 12, MAT(P6.stone), -w2 * 0.96, h * 0.32, depth / 2); v1.rotation.x = PI / 2; g.add(v1);
  var v2 = cyl(0.038, 0.038, depth * 0.6, 12, MAT(P6.stone), w2 * 0.96, h * 0.32, depth / 2); v2.rotation.x = PI / 2; g.add(v2);
  if (lv >= 4) {
    var ring = mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 20), MAT(P6.stone));
    ring.position.set(0, h * 0.52, depth + 0.012); g.add(ring);
    var glassM = std('#39434f', { rough: 0.3, emissive: '#8aa8c8', ei: 0.18 });
    var disc = cyl(0.072, 0.072, 0.02, 16, glassM, 0, h * 0.52, depth + 0.006); disc.rotation.x = PI / 2; g.add(disc);
    for (var k = 0; k < 4; k++) {
      var sp = box(0.11, 0.012, 0.012, MAT(P6.stone), 0, h * 0.52, depth + 0.018);
      sp.rotation.z = k * PI / 4; g.add(sp);
    }
    g.userData.roundWinMat = glassM;
    var sg1 = box(0.13, 0.055, 0.02, MAT('#8a5a44', { rough: 0.75 }), -w2 * 0.42, h * 0.5, depth + 0.014); sg1.rotation.z = 0.5; g.add(sg1);
    var sg2 = box(0.13, 0.055, 0.02, MAT('#8a5a44', { rough: 0.75 }), w2 * 0.42, h * 0.5, depth + 0.014); sg2.rotation.z = -0.5; g.add(sg2);
  } else if (lv === 3) {
    var cart = cyl(0.055, 0.055, 0.02, 12, MAT(P6.stone), 0, h * 0.52, depth + 0.008);
    cart.rotation.x = PI / 2; cart.scale.y = 1.25; g.add(cart);
    g.add(box(0.1, 0.03, 0.014, MAT('#8a5a44', { rough: 0.75 }), 0, h * 0.24, depth + 0.006));
  } else {
    var em = cyl(0.045, 0.045, 0.016, 12, MAT(P6.stone), 0, h * 0.55, depth + 0.006);
    em.rotation.x = PI / 2; g.add(em);
  }
  return g;
}
/* 鼠尾草绿波浪篷 —— 6 板条 + 杆 = 7 mesh */
function awn6(w, r) {
  var g = grp(), n = 6;
  for (var i = 0; i < n; i++) {
    var tt = i / (n - 1), a = (16 + 54 * tt) * PI / 180;
    var seg = box(w, 0.016, 0.12, (i % 2) ? MAT(P6.awnD) : MAT(P6.awn));
    seg.position.set(0, -cos(a) * r, sin(a) * r);
    seg.rotation.x = -a * 0.55;
    g.add(seg);
  }
  var rod = cyl(0.01, 0.01, w + 0.05, 6, MAT(P6.woodD));
  rod.rotation.z = PI / 2;
  rod.position.set(0, -cos(70 * PI / 180) * r, sin(70 * PI / 180) * r);
  g.add(rod);
  return g;
}
/* 前院独立石牌坊（身份特征 #5）。lv3 「武康」石匾 / lv4 鎏金饰板 + 红漆侧镶 */
function stoneGateway(w, h, lv) {
  var g = grp(), yA = h + w / 2;                                    /* 拱肩顶 */
  g.add(box(0.13, h, 0.13, MAT(P6.stone), -w / 2 - 0.045, h / 2, 0));
  g.add(box(0.13, h, 0.13, MAT(P6.stone), w / 2 + 0.045, h / 2, 0));
  g.add(box(0.2, 0.045, 0.2, MAT(P6.stoneL), -w / 2 - 0.045, h + 0.02, 0));
  g.add(box(0.2, 0.045, 0.2, MAT(P6.stoneL), w / 2 + 0.045, h + 0.02, 0));
  var arc = mesh(new THREE.TorusGeometry(w / 2, 0.052, 8, 16, PI), MAT(P6.stoneL));
  arc.position.y = h; g.add(arc);
  g.add(box(0.05, 0.09, 0.06, MAT(P6.stone), 0, yA - 0.02, 0.058));  /* 拱心石（凸出前脸） */
  /* 曲线压顶（小山花），冠于拱顶 */
  var s = new THREE.Shape();
  var cw = w + 0.34, cw2 = cw / 2, chh = 0.13 + w * 0.08, capBase = yA - 0.06;
  s.moveTo(-cw2, 0);
  s.lineTo(-cw2, chh * 0.34);
  s.quadraticCurveTo(-cw2, chh * 0.7, -cw2 * 0.45, chh * 0.86);
  s.quadraticCurveTo(0, chh * 1.02, cw2 * 0.45, chh * 0.86);
  s.quadraticCurveTo(cw2, chh * 0.7, cw2, chh * 0.34);
  s.lineTo(cw2, 0);
  s.closePath();
  var capG = mesh(new THREE.ExtrudeGeometry(s, { depth: 0.09, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1 }), MAT(P6.stoneL));
  capG.position.y = capBase; g.add(capG);
  if (lv >= 4) {
    var giltM = std(P6.gilt, { rough: 0.4, metal: 0.5, emissive: '#8a5a20', ei: 0.15 });
    g.add(box(0.16, 0.085, 0.024, giltM, 0, capBase + chh * 0.55, 0.055));
    g.add(box(0.035, h * 0.5, 0.02, MAT('#8f3b2a', { rough: 0.6 }), -w / 2 - 0.045, h * 0.5, 0.072));
    g.add(box(0.035, h * 0.5, 0.02, MAT('#8f3b2a', { rough: 0.6 }), w / 2 + 0.045, h * 0.5, 0.072));
    g.userData.giltMat = giltM;
  } else if (lv === 3) {
    var pl = textPlate6('武康', 0.24, 0.1, { bg: '#2c3426', fg: '#d8b86a', ei: 0.1 });
    put(g, pl, 0, capBase + chh * 0.55, 0.052);
    g.userData.plaqueMat = pl.userData.faceMat;
  } else {
    g.add(box(0.16, 0.075, 0.02, MAT(P6.stone), 0, capBase + chh * 0.55, 0.052));
  }
  return g;
}
/* 蓝瓦歇山翘角顶几何体（身份特征 #6）：翘角环 + 每面 UV 沿坡向（瓦垄竖纹） */
function cnRoofGeo(w, d, h, ov, cl) {
  var hw = w / 2, hd = d / 2, rw = hw * 0.5, l = cl * 0.25;
  var A = [-rw, h, 0], B = [rw, h, 0];
  var Cfr = [hw + ov, cl, hd + ov], Cfl = [-hw - ov, cl, hd + ov];
  var Cbr = [hw + ov, cl, -hd - ov], Cbl = [-hw - ov, cl, -hd - ov];
  var Mf = [0, l, hd + ov], Mb = [0, l, -hd - ov], Ml = [-hw - ov, l, 0], Mr = [hw + ov, l, 0];
  var pos = [], uvs = [], vh = Math.max(0.001, h - cl);
  function tri(a, b, c, mode) {
    [a, b, c].forEach(function (p) {
      pos.push(p[0], p[1], p[2]);
      if (mode === 'x') uvs.push((p[2] + hd + ov) / (d + 2 * ov), (p[1] - cl) / vh);
      else uvs.push((p[0] + hw + ov) / (w + 2 * ov), (p[1] - cl) / vh);
    });
  }
  tri(A, Cfl, Mf, 'z'); tri(A, Mf, Cfr, 'z'); tri(A, Cfr, B, 'z');   /* 前坡 */
  tri(A, Cbl, Mb, 'z'); tri(A, Mb, Cbr, 'z'); tri(A, Cbr, B, 'z');   /* 后坡 */
  tri(A, Cbl, Ml, 'x'); tri(A, Ml, Cfl, 'x');                        /* 左坡 */
  tri(B, Mr, Cbr, 'x'); tri(B, Cfr, Mr, 'x');                        /* 右坡 */
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.computeVertexNormals();
  return geo;
}
function cnRoof(w, d, h) {
  var g = grp();
  var ov = Math.min(w, d) * 0.13, cl = Math.min(w, d) * 0.085;
  var t = texTile().clone(); t.needsUpdate = true; t.repeat.set(2, 1);
  g.add(mesh(cnRoofGeo(w, d, h, ov, cl), std('#ffffff', { map: t, rough: 0.62, side: THREE.DoubleSide })));
  /* 红封檐板 ×4（位于翘角之间的直段） */
  var red = MAT(P6.eaveRed, { rough: 0.7 });
  g.add(box(w * 0.92, 0.05, 0.022, red, 0, cl * 0.42, d / 2 + ov * 0.82));
  g.add(box(w * 0.92, 0.05, 0.022, red, 0, cl * 0.42, -(d / 2 + ov * 0.82)));
  g.add(box(0.022, 0.05, d * 0.9, red, w / 2 + ov * 0.82, cl * 0.42, 0));
  g.add(box(0.022, 0.05, d * 0.9, red, -(w / 2 + ov * 0.82), cl * 0.42, 0));
  /* 正脊（石灰色）+ 两端脊兽 + 中央脊饰 + 鎏金顶 */
  var rw = w * 0.25;
  var rs = MAT(P6.ridgeS, { rough: 0.75 });
  g.add(box(rw * 2, 0.055, 0.06, rs, 0, h + 0.02, 0));
  [-rw, rw].forEach(function (x) {
    var beast = grp(); beast.position.set(x, h + 0.06, 0);
    beast.add(box(0.055, 0.075, 0.04, rs));
    var head = mesh(new THREE.ConeGeometry(0.024, 0.06, 6), rs);
    head.rotation.z = x > 0 ? -1.25 : 1.25; head.position.set(x > 0 ? 0.045 : -0.045, 0.01, 0);
    beast.add(head);
    beast.add(box(0.016, 0.05, 0.012, rs, x > 0 ? -0.03 : 0.03, 0.05, 0));
    g.add(beast);
  });
  g.add(box(0.17, 0.05, 0.045, rs, 0, h + 0.065, 0));
  g.add(cyl(0.024, 0.03, 0.035, 8, MAT(P6.gilt), 0, h + 0.1, 0));
  return g;
}
/* 脊下小老虎窗（lv4 前坡） */
function dormer() {
  var g = grp();
  g.add(box(0.16, 0.14, 0.12, MAT(P6.stone), 0, 0.07, 0));
  g.add(box(0.1, 0.08, 0.02, MAT(P6.glaz, { rough: 0.35 }), 0, 0.07, 0.062));
  var rf = mesh(new THREE.ConeGeometry(0.13, 0.08, 4), MAT(P6.tileB2));
  rf.rotation.y = PI / 4; rf.position.y = 0.18; g.add(rf);
  return g;
}
/* 矮石墙 + 压顶（2 mesh） */
function yardWall(len, ry) {
  var g = grp();
  g.add(box(len, 0.16, 0.07, MAT(P6.stoneD), 0, 0.08, 0));
  g.add(box(len + 0.04, 0.035, 0.11, MAT(P6.stone), 0, 0.175, 0));
  if (ry) g.rotation.y = ry;
  return g;
}
function gatePost(h) {
  var g = grp();
  g.add(box(0.09, h, 0.09, MAT(P6.stone), 0, h / 2, 0));
  g.add(box(0.13, 0.04, 0.13, MAT(P6.stoneL), 0, h + 0.02, 0));
  return g;
}
/* 石板小径（3 块错缝） */
function flagPath(z0, z1) {
  var g = grp();
  for (var i = 0; i < 3; i++) {
    var u = i / 2;
    var s = box(0.3 - u * 0.06, 0.018, 0.16 + u * 0.05, MAT(P6.path, { rough: 0.95 }), (i % 2 ? 0.05 : -0.04), 0.072, z0 + (z1 - z0) * u);
    s.rotation.y = (i % 2 ? 0.08 : -0.06);
    g.add(s);
  }
  return g;
}
/* 陶盆绿植（3 mesh） */
function potPlant(s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.07 * s, 8, MAT('#9c5a38', { rough: 0.8 }), 0, 0.035 * s, 0));
  put(g, sph(0.055 * s, 7, MAT('#5d7c3a', { rough: 0.9 })), 0, 0.1 * s, 0);
  put(g, sph(0.035 * s, 6, MAT('#7a9a4e', { rough: 0.9 })), 0.03 * s, 0.08 * s, 0.02 * s);
  return g;
}
function bush6(s, col) {
  var b = mesh(new THREE.IcosahedronGeometry(0.085 * (s || 1), 0), MAT(col || '#6f8f44', { rough: 0.95 }));
  b.scale.y = 0.85; return b;
}
/* 地坪：2.6×2.6（≤ 占地上限），草地双层 */
function pad6() {
  var g = grp();
  g.add(box(2.6, 0.06, 2.6, MAT(P6.lawn, { rough: 0.95 }), 0, 0.03, 0));
  g.add(box(2.42, 0.02, 2.42, MAT(P6.grass, { rough: 0.95 }), 0, 0.068, 0));
  return g;
}
/* 小青瓦人字坡（山花后小顶，lv2/lv3）：2 坡 + 脊 + 2 山花封板 = 5 mesh */
function miniGable(w, rise, half) {
  var g = grp();
  var slope = Math.sqrt(rise * rise + half * half), ang = Math.atan2(rise, half);
  var rF = box(w, 0.035, slope, MAT(P6.tileB2)); rF.rotation.x = ang; rF.position.set(0, rise / 2, half / 2); g.add(rF);
  var rB = box(w, 0.035, slope, MAT(P6.tileB2)); rB.rotation.x = -ang; rB.position.set(0, rise / 2, -half / 2); g.add(rB);
  g.add(box(w + 0.04, 0.04, 0.06, MAT(P6.tileB2), 0, rise + 0.015, 0));
  var sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.026, bevelEnabled: false });
  for (var sd = -1; sd <= 1; sd += 2) {
    var tp = mesh(tg, MAT(P6.brickD));
    tp.rotation.y = PI / 2 * sd; tp.position.set(sd * (w / 2 - 0.026), 0, 0);
    g.add(tp);
  }
  return g;
}

/* ============================ 4. 四阶建筑（blockout→structure→form→material） ============================ */

/* ---------- lv1 小屋：木板屋 + 板皮人字顶 + 侧披屋 + 矮石墙院（~48 mesh, H≈0.98） ---------- */
function lv1() {
  var g = grp(); g.name = 'prop_6_lv1';
  g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = 1;
  g.add(pad6());

  var B = grp(); B.position.set(0, 0.078, -0.18); g.add(B);
  B.add(box(1.2, 0.05, 0.9, MAT(P6.stoneD), 0, 0.025, 0));                        /* 石勒脚 */
  var walls = plankBox(1.08, 0.5, 0.78, 2, 1); walls.position.set(0, 0.3, 0); B.add(walls);
  [[-0.51, -0.36], [0.51, -0.36], [-0.51, 0.36], [0.51, 0.36]].forEach(function (c) {
    B.add(box(0.06, 0.5, 0.06, MAT(P6.plankD), c[0], 0.3, c[1]));                 /* 角柱 */
  });
  /* 正门（朝 +Z） */
  B.add(box(0.3, 0.4, 0.03, MAT(P6.woodD), 0, 0.26, 0.39));
  B.add(box(0.24, 0.34, 0.02, MAT(P6.woodM), 0, 0.24, 0.4));
  B.add(box(0.38, 0.05, 0.06, MAT(P6.stoneL), 0, 0.5, 0.4));
  /* 两侧木框小窗（右窗暖光 → 动画） */
  var glowM = std('#7a6248', { rough: 0.45, emissive: P6.glow, ei: 0.22 });
  [-0.32, 0.32].forEach(function (x, i) {
    B.add(box(0.26, 0.26, 0.035, MAT(P6.woodD), x, 0.34, 0.39));
    B.add(box(0.2, 0.2, 0.03, i ? glowM : MAT(P6.glaz, { rough: 0.4 }), x, 0.34, 0.396));
    B.add(box(0.22, 0.024, 0.036, MAT(P6.woodD), x, 0.34, 0.402));
    B.add(box(0.024, 0.2, 0.036, MAT(P6.woodD), x, 0.34, 0.402));
    B.add(box(0.32, 0.035, 0.06, MAT(P6.stoneL), x, 0.2, 0.4));
  });
  /* 板皮人字顶（大挑檐，山花朝左右） */
  var roof = grp(); roof.position.set(0, 0.55, 0); B.add(roof);
  var rise = 0.3, half = 0.72, slope = Math.sqrt(rise * rise + half * half) + 0.06, ang = Math.atan2(rise, half);
  var pF = plankBox(1.34, 0.035, slope, 3, 1); pF.rotation.x = ang; pF.position.set(0, rise * 0.5, half * 0.5); roof.add(pF);
  var pB = plankBox(1.34, 0.035, slope, 3, 1); pB.rotation.x = -ang; pB.position.set(0, rise * 0.5, -half * 0.5); roof.add(pB);
  roof.add(box(1.4, 0.045, 0.07, MAT(P6.plankD), 0, rise + 0.01, 0));
  var sh = new THREE.Shape();
  sh.moveTo(-0.39, 0); sh.lineTo(0.39, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
  for (var sd = -1; sd <= 1; sd += 2) {
    var tp = mesh(tg, MAT(P6.plankD));
    tp.rotation.y = PI / 2 * sd; tp.position.set(sd * 0.655, 0, 0);
    roof.add(tp);
  }
  /* 右侧披屋（open shed） */
  var shed = grp(); shed.position.set(0.78, 0.12, -0.1); B.add(shed);
  var slab = plankBox(0.5, 0.03, 0.66, 1, 1); slab.rotation.z = -0.32; slab.position.set(0.08, 0.36, 0); shed.add(slab);
  shed.add(cyl(0.018, 0.022, 0.34, 6, MAT(P6.plankD), 0.24, 0.17, 0.26));
  shed.add(cyl(0.018, 0.022, 0.34, 6, MAT(P6.plankD), 0.24, 0.17, -0.26));
  shed.add(box(0.04, 0.1, 0.5, MAT(P6.plankD), 0.3, 0.05, 0));
  /* 前院矮石墙 + 门柱 + 石板径 */
  var wl = yardWall(0.62, 0.42); wl.position.set(-0.72, 0.078, 0.62); g.add(wl);
  var wr = yardWall(0.62, -0.42); wr.position.set(0.72, 0.078, 0.62); g.add(wr);
  var gp1 = gatePost(0.3); gp1.position.set(-0.3, 0.078, 0.88); g.add(gp1);
  var gp2 = gatePost(0.3); gp2.position.set(0.3, 0.078, 0.88); g.add(gp2);
  g.add(flagPath(0.42, 0.98));
  var b1 = bush6(1.1); b1.position.set(-0.68, 0.14, 0.1); g.add(b1);
  var b2 = bush6(0.8, '#5d7c3a'); b2.position.set(0.95, 0.13, 0.42); g.add(b2);
  var pp = potPlant(0.9); pp.position.set(0.62, 0.078, 0.36); g.add(pp);
  /* 杂物桶（参考图右侧小物件群） */
  g.add(cyl(0.045, 0.05, 0.12, 8, MAT('#5a6a74', { rough: 0.7 }), 0.95, 0.14, -0.42));
  g.add(cyl(0.04, 0.045, 0.1, 8, MAT('#6a5a3a', { rough: 0.8 }), 1.05, 0.13, -0.3));

  /* anim：暖窗呼吸（幅度克制） */
  anim(g, function (t) { glowM.emissiveIntensity = 0.22 + 0.1 * sin(t * 1.6); });
  return g;
}

/* ---------- lv2 洋房：两层红砖商铺 + 绿波浪篷 + 木栏阳台 + 首座弧形山花 + 石牌坊
   （~101 mesh, H≈1.48） ---------- */
function lv2() {
  var g = grp(); g.name = 'prop_6_lv2';
  g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = 2;
  g.add(pad6());

  var B = grp(); B.position.set(0, 0.078, -0.2); g.add(B);
  B.add(box(1.6, 0.06, 1.0, MAT(P6.stoneD), 0, 0.03, 0));                          /* 勒脚 */
  var main = brickBox(1.5, 0.92, 0.9, 3, 2); main.position.set(0, 0.55, 0); B.add(main);
  [[-0.72, 0.42], [0.72, 0.42], [-0.72, -0.42], [0.72, -0.42]].forEach(function (c) {
    var q = quoin(0.92, c[0], c[1]); q.position.y = 0.09; B.add(q);
  });
  B.add(box(1.56, 0.045, 0.94, MAT(P6.stone), 0, 0.56, 0));                        /* 层间线脚 */
  B.add(box(1.58, 0.06, 0.96, MAT(P6.stoneL), 0, 1.03, 0));                        /* 顶檐口 */
  /* 一层店面：暖光橱窗 + 木门 + 绿波浪篷 + 挂匾 */
  var shop = shopGlow(0.5, 0.36); shop.position.set(-0.42, 0.32, 0.458); B.add(shop);
  B.add(box(0.28, 0.44, 0.035, MAT(P6.woodD), 0.16, 0.29, 0.458));
  B.add(box(0.22, 0.38, 0.024, MAT(P6.woodM), 0.16, 0.27, 0.472));
  var aw = awn6(1.3, 0.3); aw.position.set(0.05, 0.72, 0.52); B.add(aw);
  var sign = textPlate6('武', 0.13, 0.13, { bg: '#3a2c1c', fg: '#e2c274', ei: 0.16 });
  var hang = grp(); hang.position.set(0.55, 0.66, 0.5); hang.add(sign); B.add(hang);
  /* 二层：法式拱窗 + 双拱窗 + 木瓶栏阳台 */
  var fr = frenchWindow(0.34, 0.44, { key: true }); fr.position.set(0.05, 0.82, 0.458); B.add(fr);
  var w1 = archWindow(0.24, 0.34); w1.position.set(-0.5, 0.82, 0.458); B.add(w1);
  var w2 = archWindow(0.24, 0.34); w2.position.set(0.5, 0.82, 0.458); B.add(w2);
  var balc = balustrade(0.92, 0.2, 6, MAT(P6.woodM)); balc.position.set(0.05, 0.585, 0.5); B.add(balc);
  var fb = flowerBox(0.5); fb.position.set(0.05, 0.66, 0.66); B.add(fb);
  /* 弧形山花（首座）+ 山花后小青瓦坡顶 */
  var ped = curvedPediment(0.92, 0.34, 0.12, 2); ped.position.set(0.05, 1.06, 0.4); B.add(ped);
  var mg = miniGable(1.04, 0.2, 0.5); mg.position.set(0.05, 1.06, -0.08); B.add(mg);

  /* 前院：石牌坊 + 矮墙 + 径 + 盆栽 */
  var gw = stoneGateway(0.46, 0.52, 2); gw.position.set(-0.58, 0.078, 0.82); g.add(gw);
  var yl = yardWall(0.5, 1.05); yl.position.set(-1.02, 0.078, 0.5); g.add(yl);
  var yr = yardWall(0.72, 0); yr.position.set(0.5, 0.078, 0.98); g.add(yr);
  var gpt = gatePost(0.34); gpt.position.set(1.0, 0.078, 0.98); g.add(gpt);
  g.add(flagPath(0.36, 0.9));
  var p1 = potPlant(1); p1.position.set(-0.16, 0.078, 0.52); g.add(p1);
  var p2 = potPlant(0.85); p2.position.set(0.38, 0.078, 0.56); g.add(p2);
  var b3 = bush6(1.1); b3.position.set(0.95, 0.14, 0.2); g.add(b3);
  var b4 = bush6(0.8, '#5d7c3a'); b4.position.set(-1.05, 0.13, -0.5); g.add(b4);

  /* anim：店窗呼吸 + 挂匾摇曳 */
  var gm = shop.userData.glowMat;
  anim(g, function (t) { gm.emissiveIntensity = 0.5 + 0.14 * sin(t * 1.7); });
  anim(g, function (t) { hang.rotation.z = sin(t * 1.5) * 0.07; });
  return g;
}

/* ---------- lv3 大厦：三层楼阁 + 双层石栏阳台 + 山花升级 + 侧翼楼 + 「武康」石匾
   （~168 mesh, H≈2.18） ---------- */
function lv3() {
  var g = grp(); g.name = 'prop_6_lv3';
  g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = 3;
  g.add(pad6());

  var B = grp(); B.position.set(0.05, 0.078, -0.16); g.add(B);
  B.add(box(1.52, 0.07, 1.02, MAT(P6.stoneD), 0, 0.035, 0));                       /* 勒脚 */
  var main = brickBox(1.4, 1.56, 0.95, 3, 3); main.position.set(0, 0.85, 0); B.add(main);
  [[-0.67, 0.45], [0.67, 0.45], [-0.67, -0.45], [0.67, -0.45]].forEach(function (c) {
    var q = quoin(1.56, c[0], c[1]); q.position.y = 0.07; B.add(q);
  });
  B.add(box(1.46, 0.04, 0.98, MAT(P6.stone), 0, 0.6, 0));                          /* 层线脚 ×2 */
  B.add(box(1.46, 0.04, 0.98, MAT(P6.stone), 0, 1.1, 0));
  B.add(box(1.48, 0.06, 1.0, MAT(P6.stoneL), 0, 1.65, 0));                         /* 顶檐口 */
  /* 一层：木门 + 拱窗 ×2 + 门篷 */
  B.add(box(0.3, 0.46, 0.035, MAT(P6.woodD), 0, 0.3, 0.478));
  B.add(box(0.24, 0.4, 0.024, MAT(P6.woodM), 0, 0.28, 0.492));
  var dArc = new THREE.CylinderGeometry(0.15, 0.15, 0.032, 12, 1, false, 0, PI);
  dArc.rotateX(PI / 2); dArc.rotateZ(PI / 2);
  var da = mesh(dArc, MAT(P6.woodD)); da.position.set(0, 0.53, 0.478); B.add(da);
  var s1 = archWindow(0.22, 0.3); s1.position.set(-0.44, 0.36, 0.478); B.add(s1);
  var s2 = archWindow(0.22, 0.3); s2.position.set(0.44, 0.36, 0.478); B.add(s2);
  var aw = awn6(0.72, 0.22); aw.position.set(0, 0.66, 0.54); B.add(aw);
  /* 二层：法式窗 + 石栏阳台 + 拱窗 ×2 */
  var f2 = frenchWindow(0.32, 0.42, { key: true }); f2.position.set(0, 0.88, 0.478); B.add(f2);
  var w21 = archWindow(0.22, 0.32); w21.position.set(-0.44, 0.88, 0.478); B.add(w21);
  var w22 = archWindow(0.22, 0.32); w22.position.set(0.44, 0.88, 0.478); B.add(w22);
  var b2 = balustrade(0.9, 0.2, 6, MAT(P6.stoneL)); b2.position.set(0, 0.65, 0.52); B.add(b2);
  var fb2 = flowerBox(0.46); fb2.position.set(0, 0.72, 0.68); B.add(fb2);
  /* 三层：法式窗 + 石栏阳台 + 拱窗 ×2 */
  var f3 = frenchWindow(0.32, 0.4, { key: true }); f3.position.set(0, 1.38, 0.478); B.add(f3);
  var w31 = archWindow(0.22, 0.3); w31.position.set(-0.44, 1.38, 0.478); B.add(w31);
  var w32 = archWindow(0.22, 0.3); w32.position.set(0.44, 1.38, 0.478); B.add(w32);
  var b3b = balustrade(0.9, 0.2, 6, MAT(P6.stoneL)); b3b.position.set(0, 1.15, 0.52); B.add(b3b);
  var fb3 = flowerBox(0.46); fb3.position.set(0, 1.22, 0.68); B.add(fb3);
  /* 山花（贴记升级）+ 山花后青瓦小坡顶 */
  var ped = curvedPediment(0.86, 0.4, 0.12, 3); ped.position.set(0, 1.68, 0.4); B.add(ped);
  var mg = miniGable(0.96, 0.24, 0.46); mg.position.set(0, 1.68, -0.1); B.add(mg);
  /* 侧翼楼（+x，两层） */
  var W = grp(); W.position.set(0.95, 0.078, -0.2); g.add(W);
  W.add(box(0.56, 0.05, 0.8, MAT(P6.stoneD), 0, 0.025, 0));
  var wb = brickBox(0.5, 0.88, 0.72, 2, 2); wb.position.set(0, 0.51, 0); W.add(wb);
  W.add(box(0.56, 0.05, 0.76, MAT(P6.stoneL), 0, 0.98, 0));
  var w41 = archWindow(0.16, 0.24); w41.position.set(0, 0.42, 0.365); W.add(w41);
  var w42 = archWindow(0.16, 0.22); w42.position.set(0, 0.85, 0.365); W.add(w42);
  var wrf = box(0.6, 0.03, 0.8, MAT(P6.tileB2), 0, 1.04, -0.02); wrf.rotation.x = 0.12; W.add(wrf);
  var wrail = balustrade(0.5, 0.14, 4, MAT(P6.stoneL)); wrail.position.set(0, 1.0, 0.32); W.add(wrail);
  /* 前院：大牌坊（「武康」匾）+ 墙 + 径 */
  var gw = stoneGateway(0.52, 0.56, 3); gw.position.set(-0.62, 0.078, 0.84); g.add(gw);
  var y1 = yardWall(0.42, 1.05); y1.position.set(-1.06, 0.078, 0.52); g.add(y1);
  var y2 = yardWall(0.5, 0.5); y2.position.set(0.75, 0.078, 0.98); g.add(y2);
  var y3 = yardWall(0.5, -0.5); y3.position.set(0.96, 0.078, 0.58); g.add(y3);
  g.add(flagPath(0.4, 0.94));
  g.add(box(0.5, 0.025, 0.24, MAT(P6.stoneD), -0.62, 0.09, 0.58));                 /* 门阶 */
  var p1 = potPlant(1); p1.position.set(-0.2, 0.078, 0.55); g.add(p1);
  var p2 = potPlant(0.9); p2.position.set(0.32, 0.078, 0.6); g.add(p2);
  var p3 = potPlant(1.1); p3.position.set(-0.95, 0.078, 0.2); g.add(p3);
  var bs1 = bush6(1); bs1.position.set(1.0, 0.14, 0.05); g.add(bs1);
  var bs2 = bush6(0.75, '#5d7c3a'); bs2.position.set(-1.1, 0.13, -0.35); g.add(bs2);

  /* anim：匾额微光（克制） */
  var pm = gw.userData.plaqueMat;
  if (pm) anim(g, function (t) { pm.emissiveIntensity = 0.1 + 0.12 * (0.5 + 0.5 * sin(t * 1.1)); });
  return g;
}

/* ---------- lv4 地标：四层完整洋楼 + 白雕花山花圆窗 + 蓝瓦歇山翘角顶 + 鎏金牌坊
   （~207 mesh, H≈2.6） ---------- */
function lv4() {
  var g = grp(); g.name = 'prop_6_lv4';
  g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = 4;
  g.add(pad6());

  var B = grp(); B.position.set(0.02, 0.078, -0.14); g.add(B);
  B.add(box(1.68, 0.09, 1.18, MAT(P6.stoneD), 0, 0.045, 0));                       /* 石勒脚 */
  var main = brickBox(1.56, 1.84, 1.06, 3, 4); main.position.set(0, 1.01, 0); B.add(main);
  [[-0.75, 0.5, 0.012], [0.75, 0.5, 0.012], [-0.75, -0.5, -0.012], [0.75, -0.5, -0.012]].forEach(function (c) {
    B.add(box(0.1, 1.84, 0.07, MAT(P6.stone), c[0], 1.01, c[1] + c[2]));           /* 通高壁柱 */
  });
  B.add(box(1.6, 0.045, 1.1, MAT(P6.stone), 0, 0.64, 0));                          /* 层线脚 ×3 */
  B.add(box(1.6, 0.045, 1.1, MAT(P6.stone), 0, 1.12, 0));
  B.add(box(1.6, 0.045, 1.1, MAT(P6.stone), 0, 1.6, 0));
  B.add(box(1.64, 0.07, 1.14, MAT(P6.stoneL), 0, 1.945, 0));                       /* 顶横檐 */
  /* 一层：双柱拱门 + 「武康路」金匾 + 拱窗 ×2 */
  B.add(box(0.36, 0.52, 0.04, MAT(P6.woodD), 0, 0.33, 0.545));
  B.add(box(0.3, 0.46, 0.028, MAT(P6.woodM), 0, 0.31, 0.562));
  var dArc = new THREE.CylinderGeometry(0.18, 0.18, 0.038, 14, 1, false, 0, PI);
  dArc.rotateX(PI / 2); dArc.rotateZ(PI / 2);
  var da = mesh(dArc, MAT(P6.stoneL)); da.position.set(0, 0.59, 0.545); B.add(da);
  B.add(cyl(0.035, 0.042, 0.5, 10, MAT(P6.stoneL), -0.3, 0.33, 0.6));
  B.add(cyl(0.05, 0.05, 0.03, 10, MAT(P6.stone), -0.3, 0.6, 0.6));
  B.add(cyl(0.035, 0.042, 0.5, 10, MAT(P6.stoneL), 0.3, 0.33, 0.6));
  B.add(cyl(0.05, 0.05, 0.03, 10, MAT(P6.stone), 0.3, 0.6, 0.6));
  var plaque = textPlate6('武康路', 0.44, 0.14, { bg: '#26301f', fg: '#e8c87a', ei: 0.15 });
  plaque.position.set(0, 0.72, 0.565); B.add(plaque);
  var s1 = archWindow(0.2, 0.28); s1.position.set(-0.52, 0.36, 0.545); B.add(s1);
  var s2 = archWindow(0.2, 0.28); s2.position.set(0.52, 0.36, 0.545); B.add(s2);
  /* 二层：法式窗 + 石栏阳台 + 拱窗 ×2 */
  var f2 = frenchWindow(0.34, 0.44, { key: true }); f2.position.set(0, 0.9, 0.545); B.add(f2);
  var w21 = archWindow(0.2, 0.3); w21.position.set(-0.52, 0.9, 0.545); B.add(w21);
  var w22 = archWindow(0.2, 0.3); w22.position.set(0.52, 0.9, 0.545); B.add(w22);
  var b2 = balustrade(1.0, 0.22, 5, MAT(P6.stoneL)); b2.position.set(0, 0.66, 0.58); B.add(b2);
  var fb2 = flowerBox(0.5); fb2.position.set(0, 0.735, 0.75); B.add(fb2);
  /* 三层：三联拱窗 + 石栏阳台 */
  var w31 = archWindow(0.18, 0.28); w31.position.set(-0.5, 1.38, 0.545); B.add(w31);
  var f3 = frenchWindow(0.3, 0.42, { key: true }); f3.position.set(0, 1.38, 0.545); B.add(f3);
  var w32 = archWindow(0.18, 0.28); w32.position.set(0.5, 1.38, 0.545); B.add(w32);
  var b3 = balustrade(1.0, 0.22, 5, MAT(P6.stoneL)); b3.position.set(0, 1.14, 0.58); B.add(b3);
  var fb3 = flowerBox(0.5); fb3.position.set(0, 1.215, 0.75); B.add(fb3);
  /* 四层：三联拱窗（砖柱间）+ 石栏阳台 */
  var w41 = archWindow(0.18, 0.26); w41.position.set(-0.5, 1.85, 0.545); B.add(w41);
  var f4 = frenchWindow(0.3, 0.4, { key: true }); f4.position.set(0, 1.85, 0.545); B.add(f4);
  var w42 = archWindow(0.18, 0.26); w42.position.set(0.5, 1.85, 0.545); B.add(w42);
  B.add(box(0.07, 0.52, 0.05, MAT(P6.brickD), -0.26, 1.86, 0.55));
  B.add(box(0.07, 0.52, 0.05, MAT(P6.brickD), 0.26, 1.86, 0.55));
  var b4 = balustrade(1.06, 0.22, 5, MAT(P6.stoneL)); b4.position.set(0, 1.62, 0.58); B.add(b4);
  var fb4 = flowerBox(0.5); fb4.position.set(0, 1.695, 0.75); B.add(fb4);
  /* 白雕花山花：圆窗 + 浮雕（身份特征顶点） */
  var ped = curvedPediment(0.95, 0.46, 0.12, 4); ped.position.set(0, 1.98, 0.46); B.add(ped);
  /* 蓝瓦歇山翘角顶（身份特征顶点）+ 老虎窗 */
  var roof = cnRoof(1.6, 1.3, 0.36); roof.position.set(0, 1.98, -0.06); B.add(roof);
  var dm = dormer(); dm.position.set(0.34, 2.13, 0.3); B.add(dm);   /* 底部嵌入屋坡，杜绝悬空 */
  /* 侧翼楼（+x）+ 木披檐 */
  var W = grp(); W.position.set(0.98, 0.078, -0.18); g.add(W);
  W.add(box(0.6, 0.06, 0.86, MAT(P6.stoneD), 0, 0.03, 0));
  var wb = brickBox(0.54, 1.1, 0.78, 2, 2); wb.position.set(0, 0.61, 0); W.add(wb);
  W.add(box(0.6, 0.05, 0.82, MAT(P6.stoneL), 0, 1.19, 0));
  var w51 = archWindow(0.18, 0.28); w51.position.set(0, 0.5, 0.395); W.add(w51);
  var w52 = archWindow(0.18, 0.26); w52.position.set(0, 1.0, 0.395); W.add(w52);
  var cap = grp(); cap.position.set(0, 1.22, 0.14); W.add(cap);
  var cs = plankBox(0.6, 0.025, 0.5, 2, 1); cs.rotation.x = 0.28; cap.add(cs);
  cap.add(cyl(0.016, 0.02, 0.26, 6, MAT(P6.woodD), 0.24, -0.14, 0.16));
  cap.add(cyl(0.016, 0.02, 0.26, 6, MAT(P6.woodD), -0.24, -0.14, 0.16));
  var wrail = balustrade(0.54, 0.16, 3, MAT(P6.stoneL)); wrail.position.set(0, 1.21, 0.34); W.add(wrail);
  /* 前院：鎏金牌坊 + 墙 + 台阶 + 径 */
  var gw = stoneGateway(0.56, 0.6, 4); gw.position.set(-0.64, 0.078, 0.86); g.add(gw);
  var y1 = yardWall(0.46, 1.05); y1.position.set(-1.1, 0.078, 0.5); g.add(y1);
  var y2 = yardWall(0.5, 0.5); y2.position.set(0.72, 0.078, 1.0); g.add(y2);
  var y3 = yardWall(0.5, -0.5); y3.position.set(0.94, 0.078, 0.56); g.add(y3);
  g.add(box(0.56, 0.03, 0.26, MAT(P6.stoneD), -0.64, 0.09, 0.58));                 /* 门阶 ×2 */
  g.add(box(0.56, 0.03, 0.2, MAT(P6.stoneD), -0.64, 0.062, 0.4));
  g.add(flagPath(0.42, 0.96));
  var p1 = potPlant(1.1); p1.position.set(-0.22, 0.078, 0.58); g.add(p1);
  var p2 = potPlant(0.95); p2.position.set(0.34, 0.078, 0.62); g.add(p2);
  var bs1 = bush6(1.1); bs1.position.set(1.05, 0.14, 0.0); g.add(bs1);
  var bs2 = bush6(0.8, '#5d7c3a'); bs2.position.set(-1.15, 0.13, -0.3); g.add(bs2);
  var bs3 = bush6(0.7, '#7a9a4e'); bs3.position.set(1.12, 0.12, -0.55); g.add(bs3);

  /* anim：金匾微光 + 鎏金饰板流辉 + 山花圆窗夜光（均克制） */
  var pfm = plaque.userData.faceMat;
  var gmt = gw.userData.giltMat;
  var rwm = ped.userData.roundWinMat;
  anim(g, function (t) {
    if (pfm) pfm.emissiveIntensity = 0.15 + 0.13 * (0.5 + 0.5 * sin(t * 1.15));
    if (gmt) gmt.emissiveIntensity = 0.15 + 0.12 * (0.5 + 0.5 * sin(t * 0.9 + 1.2));
    if (rwm) rwm.emissiveIntensity = 0.18 + 0.1 * (0.5 + 0.5 * sin(t * 0.7 + 2.1));
  });
  return g;
}

/* ============================ 5. 导出：window.Props3D[6] ============================ */
window.Props3D = window.Props3D || {};
window.Props3D[6] = function (level) {
  level = Math.max(1, Math.min(4, level | 0 || 1));
  if (level === 1) return lv1();
  if (level === 2) return lv2();
  if (level === 3) return lv3();
  return lv4();
};

})();
