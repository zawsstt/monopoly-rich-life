/* =====================================================================================
 * 大富翁 · 个性化地产 格 6 「武康路」 —— 民国砖石洋楼四阶演进（v2 精修版）
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/prop_6.png（四阶一体参考图，唯一视觉真源）。
 * 注：任务文中名称为「断桥烟雨」，但 data.js BOARD[6] = 武康路（g2 沪上组），且 prop_6.png
 *     内容即民国砖石洋楼族谱，与武康路匹配；本文件以参考图 + 输出契约（Props3D[6]）为准。
 *
 * —— v1 → v2 精修摘要（对照参考图逐项清偿，布局/配色/朝向契约不变） ————————
 *   1) 红砖逐皮分区：texBrick 增加顶皮斗砖色带（band 变体），repeat.y=层数 → 每层砖
 *      壁出现深色束腰带皮；隅石改为长短皮交替咬合（alternating quoins）。
 *   2) 弧形石山花：内圈凸起线脚 rim（双层轮廓）+ 表面凿刻纹 Canvas（chisel field）+
 *      肩部涡卷改四分之一圆环；lv4 增冠顶宝瓶饰。
 *   3) 拱顶窗：新增石拱券 voussoir 扇环（UV 空间画放射砖缝 + 楔心石高亮）+ 凸出
 *      keystone 主/key 石 + 窗台端头耳石（ears）。
 *   4) 花瓶栏杆：LatheGeometry 瓶状曲线柱身（12 段旋成面）+ 两端望柱（newel）+ 球顶。
 *   5) 鼠尾草绿波浪篷：每板条下缘半圆瓦楞垂边（scalloped valance）+ 端头侧垂片 + 斜撑。
 *   6) 蓝瓦歇山顶：瓦垄纹理加密（筒瓦+板瓦+檐口瓦当点）+ 四条垂脊 + 垂脊小兽 ×4 +
 *      檐口椽头（红/青交替）+ 正脊小兽 ×2；红封檐板保留。
 *   7) 老虎窗层次：lv4 前坡双虎窗（大+小、大者带二层小顶）。
 *   8) 石牌坊：梁枋彩绘带（lv2 素石 → lv3 青绿彩绘（降饱和）→ lv4 朱红鎏金彩绘）+
 *      雀替块 + 柱础 + 压顶二皮 + 顶珠；lv4 鎏金牌/红漆侧镶保留。
 *   其余：店面加木裙板（stallriser）、挂匾/暖窗/金匾/圆窗动画保留并克制、
 *   纹理上限放宽至 512px（实际用 64–256px）、圆柱段 ≥12、球 16×12。
 *
 * 身份定义特征（identity-defining，任一错误即 fail 该 pass）：
 *   1) 弧形石山花轮廓（凹弧起翘 + 浴卷肩 + 压顶）
 *   2) 红砖 vs 淡石材的双色对比（隅石/勒脚/线脚）
 *   3) 拱顶窗（半圆玻璃 + 石拱券 + keystone + 石窗台 + 木框）
 *   4) 阳台花瓶栏杆（lv2 木 / lv3+ 石）+ 望柱
 *   5) 前院独立石牌坊（曲线压顶，lv3 石匾「武康」，lv4 鎏金饰板 + 彩绘带）
 *   6) lv4 蓝瓦歇山顶：瓦垄纹理、翘角、正脊/垂脊脊兽、红封檐板、白山花圆窗、老虎窗
 * 四阶演进（同一块地同一风格的生长史，v1 已验收形态不变）：
 *   lv1 小屋  H 0.8–1.2：木板小屋 + 板皮人字顶（挂瓦条/封檐板）+ 侧披屋 + 矮石墙院
 *   lv2 洋房  H 1.2–1.7：两层红砖商铺 + 绿波浪篷（垂边）+ 木瓶栏阳台 + 首座弧形山花
 *   lv3 大厦  H 1.7–2.3：三层楼阁 + 双层石瓶栏阳台 + 山花升级 + 侧翼楼 + 「武康」匾
 *   lv4 地标  H 2.3–3.0：四层地标：白雕花山花（圆窗+浮雕+冠顶）+ 蓝瓦歇山（垂脊/脊兽/
 *             椽头/双虎窗）+ 三叠石栏阳台 + 「武康路」金匾 + 鎏金牌坊（彩绘带）
 * 材质：MeshStandardMaterial（std() convertSRGBToLinear）；Canvas 程序化纹理 ≤512px。
 * 光照：不添加灯光（场景级光照），暖窗/金匾用 emissive 克制表现。
 * 交互（userData.anim = [fn(t,dt)]，旋转 ≤0.3rad、emissive 波动 ≤0.25）：
 *   lv1 窗光呼吸；lv2 店窗呼吸 + 挂匾摇；lv3 匾额微光；lv4 金匾微光 + 鎏金流辉 + 圆窗夜光。
 * 预算：每级 ≤350 mesh；占地 ≤2.6×2.6；原点=格心、底面 y=0；正面朝 +Z。
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
function sph(r, seg, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z) { o.position.set(x || 0, y || 0, z || 0); parent.add(o); return o; }
function anim(g, fn) { (g.userData.anim || (g.userData.anim = [])).push(fn); }
/* 种子随机（纹理噪点专用，杜绝布局随机） */
function rng6(seed) {
  var s = seed >>> 0;
  return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

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
  teal:    '#3e6b5c',
  gilt:    '#c08c48',
  grass:   '#93a45a',
  lawn:    '#a3ad68',
  path:    '#c2b494',
  plank:   '#8f7a58',
  plankD:  '#6f6350',
  glaz:    '#2c3138'
};

/* ============================ 2. Canvas 程序化纹理（≤512px） ============================ */
function cv2(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function toTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; return t; }

var _texBrick = null, _texBrickB = null;
function texBrick(band) {  /* 红砖：灰浆横缝 + 竖错缝 + 噪点；band 变体顶部加斗砖色带（逐皮分区） */
  if (band && _texBrickB) return _texBrickB;
  if (!band && _texBrick) return _texBrick;
  var S = 128, c = cv2(S, S), g = c.getContext('2d'), R = rng6(band ? 607 : 606);
  g.fillStyle = P6.brick; g.fillRect(0, 0, S, S);
  var row = 16;
  for (var y = 0; y < S; y += row) {
    g.fillStyle = 'rgba(214,200,180,0.55)'; g.fillRect(0, y, S, 2);
    var off = (y / row) % 2 ? 0 : 16;
    for (var x = off; x < S; x += 32) { g.fillRect(x, y, 2, row); }
    for (var i = 0; i < 30; i++) {
      var bx = (x + R() * 30) % S, by = y + 3 + R() * (row - 6);
      g.fillStyle = R() > 0.5 ? 'rgba(60,30,20,0.16)' : 'rgba(230,150,110,0.14)';
      g.fillRect(bx, by, 3 + R() * 4, 2);
    }
  }
  if (band) {  /* 顶皮斗砖带：深色竖缝密排 → 层间束腰读感 */
    g.fillStyle = 'rgba(70,36,26,0.42)'; g.fillRect(0, 0, S, 7);
    g.fillStyle = 'rgba(190,120,90,0.30)';
    for (var bx2 = 2; bx2 < S; bx2 += 10) g.fillRect(bx2, 1, 4, 5);
    g.fillStyle = 'rgba(20,10,6,0.35)'; g.fillRect(0, 7, S, 2);
  }
  var t = toTex(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (band) _texBrickB = t; else _texBrick = t;
  return t;
}
var _texPlank = null;
function texPlank() {  /* lv1 竖木板 + 钉点 */
  if (_texPlank) return _texPlank;
  var c = cv2(128, 128), g = c.getContext('2d'), R = rng6(612);
  g.fillStyle = P6.plank; g.fillRect(0, 0, 128, 128);
  for (var x = 0; x < 128; x += 18) {
    g.fillStyle = 'rgba(40,28,16,0.5)'; g.fillRect(x, 0, 2, 128);
    for (var i = 0; i < 6; i++) {
      g.fillStyle = R() > 0.5 ? 'rgba(60,44,26,0.25)' : 'rgba(190,165,120,0.18)';
      g.fillRect(x + 3 + R() * 12, R() * 124, 2, 6 + R() * 14);
    }
    g.fillStyle = 'rgba(30,22,12,0.6)';
    g.fillRect(x + 8, 6, 2, 2); g.fillRect(x + 8, 118, 2, 2);
  }
  _texPlank = toTex(c); _texPlank.wrapS = _texPlank.wrapT = THREE.RepeatWrapping;
  return _texPlank;
}
var _texTile = null;
function texTile() {  /* 蓝瓦垄 v2：筒瓦垄 + 板瓦底 + 檐口瓦当点 + 横向检缝 */
  if (_texTile) return _texTile;
  var S = 128, c = cv2(S, S), g = c.getContext('2d'), R = rng6(618);
  g.fillStyle = P6.tileB; g.fillRect(0, 0, S, S);           /* 板瓦底 */
  var rib = 21;
  for (var x = 0; x < S; x += rib) {
    g.fillStyle = P6.tileB2; g.fillRect(x, 0, S, S);        /* 底色统一 */
    /* 板瓦面微亮 */
    g.fillStyle = 'rgba(150,172,196,0.20)'; g.fillRect(x + 8, 0, 13, S);
    /* 筒瓦垄：暗影-亮脊-暗影 */
    g.fillStyle = 'rgba(16,24,34,0.62)'; g.fillRect(x + 5, 0, 3, S);
    g.fillStyle = 'rgba(168,190,214,0.38)'; g.fillRect(x + 8, 0, 4, S);
    g.fillStyle = 'rgba(16,24,34,0.55)'; g.fillRect(x + 13, 0, 3, S);
    g.fillStyle = 'rgba(120,142,166,0.30)'; g.fillRect(x + 16, 0, 4, S);
    g.fillStyle = 'rgba(14,20,30,0.5)'; g.fillRect(x, 0, 1, S);
  }
  /* 横向检缝（上下皮搭接） */
  g.fillStyle = 'rgba(14,20,30,0.42)';
  for (var y = 12; y < S; y += 24) g.fillRect(0, y, S, 2);
  /* 檐口瓦当点（canvas 底 = UV v0 = 檐口） */
  for (var cx = 10; cx < S; cx += rib) {
    g.fillStyle = 'rgba(178,198,220,0.5)';
    g.beginPath(); g.arc(cx, S - 5, 4.5, 0, PI * 2); g.fill();
    g.fillStyle = 'rgba(16,24,34,0.5)';
    g.beginPath(); g.arc(cx, S - 5, 2, 0, PI * 2); g.fill();
  }
  for (var i = 0; i < 40; i++) {
    g.fillStyle = R() > 0.5 ? 'rgba(12,18,26,0.25)' : 'rgba(170,190,210,0.16)';
    g.fillRect(R() * S, R() * S, 2, 2);
  }
  _texTile = toTex(c); _texTile.wrapS = _texTile.wrapT = THREE.RepeatWrapping;
  return _texTile;
}
var _texStone = null;
function texStone() {  /* 砌石：横缝 + 竖错缝 + 凿痕（牌坊/柱/勒脚） */
  if (_texStone) return _texStone;
  var S = 128, c = cv2(S, S), g = c.getContext('2d'), R = rng6(624);
  g.fillStyle = P6.stone; g.fillRect(0, 0, S, S);
  for (var y = 0; y < S; y += 32) {
    g.fillStyle = 'rgba(78,70,56,0.5)'; g.fillRect(0, y, S, 2);
    var off = (y / 32) % 2 ? 0 : 32;
    for (var x = off; x < S; x += 64) { g.fillStyle = 'rgba(78,70,56,0.42)'; g.fillRect(x, y, 2, 32); }
    g.fillStyle = 'rgba(224,218,204,0.35)'; g.fillRect(0, y + 2, S, 2);
  }
  for (var i = 0; i < 90; i++) {
    g.fillStyle = R() > 0.5 ? 'rgba(90,82,66,0.20)' : 'rgba(228,222,208,0.20)';
    g.fillRect(R() * S, R() * S, 2 + R() * 3, 1);
  }
  _texStone = toTex(c); _texStone.wrapS = _texStone.wrapT = THREE.RepeatWrapping;
  return _texStone;
}
var _texPaint = null;
function texPaint() {  /* 梁枋彩绘带：青绿底 + 朱红团窠 + 鎏金边/卷草 */
  if (_texPaint) return _texPaint;
  var W = 256, H = 64, c = cv2(W, H), g = c.getContext('2d');
  g.fillStyle = '#2e4a3e'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#c8a052'; g.fillRect(0, 2, W, 5); g.fillRect(0, H - 7, W, 5);
  g.fillStyle = 'rgba(20,16,8,0.5)'; g.fillRect(0, 7, W, 2); g.fillRect(0, H - 9, W, 2);
  for (var u = 0; u < 4; u++) {
    var cx = 32 + u * 64;
    g.fillStyle = '#9c3a28';                              /* 朱红团窠 */
    g.beginPath(); g.arc(cx, H / 2, 15, 0, PI * 2); g.fill();
    g.strokeStyle = '#d8b268'; g.lineWidth = 3;
    g.beginPath(); g.arc(cx, H / 2, 15, 0, PI * 2); g.stroke();
    g.beginPath(); g.arc(cx, H / 2, 8, 0, PI * 2); g.stroke();
    g.fillStyle = '#7fae8e';
    for (var p = 0; p < 4; p++) {
      var a = p * PI / 2 + PI / 4;
      g.beginPath(); g.arc(cx + cos(a) * 11, H / 2 + sin(a) * 11, 3, 0, PI * 2); g.fill();
    }
    var sx = cx + 32;                                      /* 青绿卷草 */
    g.strokeStyle = '#8fc09a'; g.lineWidth = 2.5;
    g.beginPath(); g.arc(sx - 6, H / 2, 8, PI * 0.5, PI * 1.5); g.stroke();
    g.beginPath(); g.arc(sx + 6, H / 2, 8, PI * 1.5, PI * 2.5); g.stroke();
    g.fillStyle = '#d8b268';
    g.beginPath(); g.arc(sx, H / 2, 3, 0, PI * 2); g.fill();
  }
  _texPaint = toTex(c); _texPaint.wrapS = _texPaint.wrapT = THREE.RepeatWrapping;
  return _texPaint;
}
var _carveCanvas = null;
function carveTex(w, h) {  /* 山花凿刻底纹（UV=形状坐标系 → repeat/offset 适配） */
  if (!_carveCanvas) {
    var S = 128, c = cv2(S, S), g = c.getContext('2d'), R = rng6(630);
    g.fillStyle = P6.stoneL; g.fillRect(0, 0, S, S);
    for (var i = 0; i < 260; i++) {
      g.fillStyle = R() > 0.5 ? 'rgba(96,86,66,0.14)' : 'rgba(238,232,218,0.16)';
      g.fillRect(R() * S, R() * S, 1 + R() * 3, 1);
    }
    _carveCanvas = c;
  }
  var t = toTex(_carveCanvas).clone(); t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(1 / w, 1 / h); t.offset.set(0.5, 0);
  return t;
}
var _fanCanvas = null, _fanMats = {};
function fanMat(R) {  /* 拱券 voussoir 扇环材质：UV=形状坐标，放射砖缝 + 楔心石高亮 */
  var k = Math.round(R * 50);
  if (_fanMats[k]) return _fanMats[k];
  if (!_fanCanvas) {
    var S = 128, c = cv2(S, S / 2), g = c.getContext('2d');
    g.fillStyle = P6.stoneL; g.fillRect(0, 0, S, S / 2);
    g.strokeStyle = 'rgba(86,76,60,0.6)'; g.lineWidth = 2;
    var angs = [22, 47, 68, 90, 112, 133, 158];
    for (var i = 0; i < angs.length; i++) {
      var a = angs[i] * PI / 180;
      g.beginPath();
      g.moveTo(S * (0.5 + 0.5 * 0.52 * cos(a)), S / 2 * (1 - 0.52 * sin(a)));
      g.lineTo(S * (0.5 + 0.5 * 0.99 * cos(a)), S / 2 * (1 - 0.99 * sin(a)));
      g.stroke();
    }
    g.fillStyle = 'rgba(236,230,216,0.85)';               /* 楔心石 */
    g.beginPath();
    g.moveTo(S * (0.5 - 0.085), S / 2 * (1 - 0.90));
    g.lineTo(S * (0.5 + 0.085), S / 2 * (1 - 0.90));
    g.lineTo(S * 0.5 + 1, -2);
    g.lineTo(S * 0.5 - 1, -2);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(86,76,60,0.55)'; g.stroke();
    _fanCanvas = c;
  }
  var t = toTex(_fanCanvas).clone(); t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(1 / (2 * R), 1 / R); t.offset.set(0.5, 0);
  var m = std('#ffffff', { map: t, rough: 0.8 });
  _fanMats[k] = m; return m;
}

/* 匾额：深板 + 描金字（emissiveMap 微光可供动画） */
function textPlate6(text, w, h, o) {
  o = o || {};
  var cw = 256, ch = 96, c = cv2(cw, ch), g = c.getContext('2d');
  g.fillStyle = o.bg || '#26301f'; g.fillRect(0, 0, cw, ch);
  g.strokeStyle = o.border || '#8f8570'; g.lineWidth = 10; g.strokeRect(8, 8, cw - 16, ch - 16);
  g.fillStyle = o.fg || '#e2c274'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold ' + Math.round(ch * 0.6) + 'px "Microsoft YaHei","PingFang SC","SimHei",sans-serif';
  g.fillText(text, cw / 2, ch / 2 + 4);
  var tex = toTex(c);
  var g6 = grp();
  g6.add(box(w, h, 0.035, o.backMat || MAT(P6.woodD)));
  var face = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.86),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, metalness: 0.1, flatShading: true,
      emissive: C(o.fg || '#e2c274'), emissiveIntensity: o.ei !== undefined ? o.ei : 0.12, emissiveMap: tex }));
  face.position.z = 0.028; g6.add(face);
  g6.userData.faceMat = face.material;
  return g6;
}

/* ============================ 3. Kit 预制件（structure/form 层） ============================ */
/* 砖墙块：band=true 用顶皮斗砖带纹理，repeat.y 传层数 → 逐皮分区 */
function brickBox(w, h, d, rx, ry, band) {
  var t = texBrick(band).clone(); t.needsUpdate = true; t.repeat.set(rx || 2, ry || 2);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.9 }));
}
function plankBox(w, h, d, rx, ry) {
  var t = texPlank().clone(); t.needsUpdate = true; t.repeat.set(rx || 1, ry || 1);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.92 }));
}
function stoneBox(w, h, d, rx, ry) {
  var t = texStone().clone(); t.needsUpdate = true; t.repeat.set(rx || 1, ry || 1);
  return box(w, h, d, std('#ffffff', { map: t, rough: 0.88 }));
}
/* 淡石隅石 v2：长短皮交替咬合（alternating quoins），组原点在角部底面 */
function quoin(h, x, z, ch) {
  ch = ch || 0.16;
  var g = grp(), n = Math.max(4, Math.round(h / ch)), hh = h / n;
  var sx = (x < 0 ? 1 : -1);
  for (var i = 0; i < n; i++) {
    var y = (i + 0.5) * hh;
    if (i % 2 === 0) g.add(box(0.2, hh, 0.07, MAT(P6.stoneL, { rough: 0.82 }), sx * 0.065, y, 0.014));
    else g.add(box(0.075, hh, 0.16, MAT(P6.stone, { rough: 0.85 }), sx * 0.008, y, -0.028));
  }
  g.position.set(x, 0, z);
  return g;
}
/* 拱窗 v2：木框 + 暗玻璃 + 半圆 + 石窗台(+耳石) + 石拱券扇环 + keystone —— 9~11 mesh */
function archWindow(w, h, o) {
  o = o || {};
  var g = grp(), fm = MAT(o.frame || P6.woodD), gl = o.glowMat || MAT(P6.glaz, { rough: 0.35, metal: 0.12 });
  g.add(box(w + 0.05, h + 0.05, 0.035, fm));
  g.add(box(w, h, 0.03, gl, 0, 0, 0.004));
  var ag = new THREE.CylinderGeometry(w / 2, w / 2, 0.03, 14, 1, false, 0, PI);
  ag.rotateX(PI / 2); ag.rotateZ(PI / 2);
  g.add(mesh(ag, gl));
  var af = new THREE.CylinderGeometry(w / 2 + 0.026, w / 2 + 0.026, 0.032, 14, 1, false, 0, PI);
  af.rotateX(PI / 2); af.rotateZ(PI / 2);
  var afm = mesh(af, fm); afm.position.y = h / 2; g.add(afm);
  g.add(box(w + 0.13, 0.04, 0.07, MAT(P6.stoneL), 0, -h / 2 - 0.005, 0.012));
  if (o.ears) {
    g.add(box(0.045, 0.055, 0.05, MAT(P6.stoneL), -(w + 0.13) / 2 + 0.012, -h / 2 + 0.012, 0.01));
    g.add(box(0.045, 0.055, 0.05, MAT(P6.stoneL), (w + 0.13) / 2 - 0.012, -h / 2 + 0.012, 0.01));
  }
  /* 石拱券 voussoir 扇环（放射缝 + 楔心石高亮由纹理给出） */
  var R = w / 2 + 0.105;
  var s = new THREE.Shape();
  s.absarc(0, 0, R, 0, PI, false);
  s.absarc(0, 0, w / 2 + 0.044, PI, 0, true);
  s.closePath();
  var fanGeo = new THREE.ExtrudeGeometry(s,
    { depth: 0.028, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 1, curveSegments: 12 });
  var fan = mesh(fanGeo, fanMat(R));
  fan.position.set(0, h / 2, 0.008);
  g.add(fan);
  /* keystone 主石（凸出前脸） */
  g.add(box(0.055, 0.135, 0.046, MAT(P6.stoneL, { rough: 0.75 }), 0, h / 2 + R * 0.74, 0.026));
  return g;
}
/* 拱顶落地窗（法式）+ 木棂 */
function frenchWindow(w, h, o) {
  var g = archWindow(w, h, o);
  var fm = MAT(o.frame || P6.woodD);
  g.add(box(0.028, h, 0.04, fm, 0, 0, 0.008));
  g.add(box(w, 0.026, 0.04, fm, 0, h * 0.18, 0.008));
  g.add(box(w, 0.026, 0.04, fm, 0, -h * 0.22, 0.008));
  return g;
}
/* 店窗暖光 v2：+ 木裙板 + 柜台沿（供 lv2 动画）—— 8 mesh */
function shopGlow(w, h) {
  var g = grp();
  g.add(box(w + 0.05, h + 0.05, 0.035, MAT(P6.woodD)));
  var gm = std('#e8b264', { rough: 0.4, emissive: P6.glow, ei: 0.5 });
  g.add(box(w, h, 0.03, gm, 0, 0, 0.004));
  g.add(box(0.03, h, 0.036, MAT(P6.woodD), 0, 0, 0.008));
  g.add(box(0.04, h, 0.036, MAT(P6.woodD), -w / 2 - 0.035, 0, 0.004));   /* 边梃 */
  g.add(box(0.04, h, 0.036, MAT(P6.woodD), w / 2 + 0.035, 0, 0.004));
  g.add(plankBox(w + 0.06, 0.16, 0.09, 2, 1));                            /* 木裙板 */
  g.children[g.children.length - 1].position.set(0, -h / 2 - 0.13, 0.02);
  g.add(box(w + 0.1, 0.03, 0.12, MAT(P6.woodM), 0, -h / 2 - 0.045, 0.035)); /* 柜台沿 */
  put(g, sph(0.035, 12, MAT('#b8432e', { rough: 0.6 })), -w * 0.2, -h / 2 + 0.02, 0.05);
  put(g, sph(0.035, 12, MAT('#c8a040', { rough: 0.6 })), w * 0.16, -h / 2 + 0.02, 0.05);
  g.userData.glowMat = gm;
  return g;
}
/* 花瓶栏杆（Lathe 瓶状曲线柱身 12 段）+ 望柱球顶 —— slab + (n+1) 瓶柱 + 顶轨 + 2 望柱×2 */
var _vaseGeo = null;
function vaseGeo() {
  if (_vaseGeo) return _vaseGeo;
  var pts = [
    new THREE.Vector2(0.006, 0), new THREE.Vector2(0.019, 0.003), new THREE.Vector2(0.021, 0.012),
    new THREE.Vector2(0.014, 0.028), new THREE.Vector2(0.011, 0.042), new THREE.Vector2(0.016, 0.056),
    new THREE.Vector2(0.020, 0.068), new THREE.Vector2(0.020, 0.076), new THREE.Vector2(0.013, 0.090),
    new THREE.Vector2(0.011, 0.098), new THREE.Vector2(0.016, 0.108), new THREE.Vector2(0.018, 0.113)
  ];
  _vaseGeo = new THREE.LatheGeometry(pts, 12);
  return _vaseGeo;
}
function balustrade(w, d, n, mat) {
  var g = grp();
  g.add(box(w, 0.035, d, mat, 0, 0, d / 2));
  for (var i = 0; i <= n; i++) {
    var v = mesh(vaseGeo(), mat);
    v.position.set(-w / 2 + i * (w / n), 0.035, d - 0.015);
    g.add(v);
  }
  g.add(box(w + 0.04, 0.03, 0.05, mat, 0, 0.163, d - 0.015));
  [-w / 2, w / 2].forEach(function (x) {                     /* 望柱 + 球顶 */
    g.add(box(0.038, 0.165, 0.05, mat, x, 0.082, d - 0.015));
    g.add(sph(0.021, 12, mat, x, 0.178, d - 0.015));
  });
  return g;
}
/* 阳台花箱 v2：箱 + 2 绿团 + 垂藤 2 团 = 5 mesh */
function flowerBox(w) {
  var g = grp();
  g.add(box(w, 0.05, 0.07, MAT(P6.stoneD), 0, 0, 0));
  put(g, sph(0.032, 12, MAT('#6f8f44', { rough: 0.9 })), -w * 0.22, 0.045, 0);
  put(g, sph(0.032, 12, MAT('#8a5a3a', { rough: 0.9 })), w * 0.22, 0.045, 0.01);
  put(g, sph(0.022, 10, MAT('#5d7c3a', { rough: 0.9 })), -w * 0.1, -0.02, 0.035);
  put(g, sph(0.02, 10, MAT('#7a9a4e', { rough: 0.9 })), w * 0.12, -0.026, 0.033);
  return g;
}
/* 弧形石山花 v2：凸起内 rim + 凿刻底纹 + 四分之一环涡卷肩；lv4 圆窗+浮雕+冠顶宝瓶 */
function pedShape(w2, h) {
  var s = new THREE.Shape();
  s.moveTo(-w2, 0);
  s.lineTo(-w2, h * 0.30);
  s.quadraticCurveTo(-w2, h * 0.64, -w2 * 0.56, h * 0.80);
  s.quadraticCurveTo(-w2 * 0.26, h * 0.92, 0, h);
  s.quadraticCurveTo(w2 * 0.26, h * 0.92, w2 * 0.56, h * 0.80);
  s.quadraticCurveTo(w2, h * 0.64, w2, h * 0.30);
  s.lineTo(w2, 0);
  s.closePath();
  return s;
}
function curvedPediment(w, h, depth, lv) {
  var g = grp(), w2 = w / 2;
  var geo = new THREE.ExtrudeGeometry(pedShape(w2, h),
    { depth: depth, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1, curveSegments: 16 });
  g.add(mesh(geo, std('#ffffff', { map: carveTex(w, h), rough: 0.82 })));
  /* 内圈凸起线脚 rim（双层轮廓 → 压顶读感） */
  var rim = new THREE.ExtrudeGeometry(pedShape(w2 * 0.84, h * 0.86),
    { depth: depth + 0.03, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 1, curveSegments: 16 });
  g.add(mesh(rim, MAT(P6.stone, { rough: 0.8 })));
  /* 肩部涡卷：四分之一圆环（位于主面肩部，rim 之外） */
  [-1, 1].forEach(function (sd) {
    var vo = mesh(new THREE.TorusGeometry(0.045, 0.017, 8, 12, PI * 0.62), MAT(P6.stone));
    vo.position.set(sd * w2 * 0.94, h * 0.34, depth + 0.02);
    vo.rotation.z = sd > 0 ? -0.9 : PI + 0.9;
    g.add(vo);
  });
  var zp = depth + 0.046;                                    /* rim 前脸 ≈ depth+0.035，饰件微凸其上 */
  if (lv >= 4) {
    var ring = mesh(new THREE.TorusGeometry(0.075, 0.018, 8, 20), MAT(P6.stone));
    ring.position.set(0, h * 0.52, zp + 0.002); g.add(ring);
    var glassM = std('#39434f', { rough: 0.3, emissive: '#8aa8c8', ei: 0.18 });
    var disc = cyl(0.072, 0.072, 0.02, 16, glassM, 0, h * 0.52, zp - 0.006); disc.rotation.x = PI / 2; g.add(disc);
    for (var k = 0; k < 4; k++) {
      var sp = box(0.11, 0.012, 0.012, MAT(P6.stone), 0, h * 0.52, zp + 0.008);
      sp.rotation.z = k * PI / 4; g.add(sp);
    }
    g.userData.roundWinMat = glassM;
    [-1, 1].forEach(function (sd) {                          /* 侧浮雕带 + 玫瑰饰 */
      var sg = box(0.13, 0.05, 0.018, MAT('#8a5a44', { rough: 0.75 }), sd * w2 * 0.44, h * 0.46, zp);
      sg.rotation.z = sd * 0.5; g.add(sg);
      g.add(cyl(0.026, 0.026, 0.014, 12, MAT(P6.stone), sd * w2 * 0.44, h * 0.6, zp));
    });
    var urnY = h * 0.9;                                      /* 冠顶宝瓶（rim 顶 ≈ 0.86h） */
    g.add(cyl(0.02, 0.028, 0.045, 12, MAT(P6.stoneL), 0, urnY, depth * 0.5));
    g.add(sph(0.022, 12, MAT(P6.stone), 0, urnY + 0.038, depth * 0.5));
  } else if (lv === 3) {
    var cart = cyl(0.055, 0.055, 0.02, 12, MAT(P6.stone), 0, h * 0.52, zp);
    cart.rotation.x = PI / 2; cart.scale.y = 1.25; g.add(cart);
    g.add(box(0.1, 0.03, 0.014, MAT('#8a5a44', { rough: 0.75 }), 0, h * 0.26, zp));
    [-1, 1].forEach(function (sd) {
      g.add(cyl(0.022, 0.022, 0.012, 12, MAT(P6.stone), sd * w2 * 0.4, h * 0.5, zp));
    });
  } else {
    var em = cyl(0.045, 0.045, 0.016, 12, MAT(P6.stone), 0, h * 0.55, zp);
    em.rotation.x = PI / 2; g.add(em);
  }
  return g;
}
/* 鼠尾草绿波浪篷 v2：6 板条 + 半圆瓦楞垂边 + 端侧垂片 + 杆 + 斜撑 ≈ 17 mesh */
var _scallopGeo = null;
function scallopGeo(len) {
  if (!_scallopGeo) {
    _scallopGeo = new THREE.CylinderGeometry(0.026, 0.026, len * 0.92, 12, 1, false, 0, PI);
    _scallopGeo.rotateZ(-PI / 2);                            /* 曲面向下悬挂 */
  }
  return _scallopGeo;
}
function awn6(w, r) {
  var g = grp(), n = 6;
  for (var i = 0; i < n; i++) {
    var tt = i / (n - 1), a = (16 + 54 * tt) * PI / 180;
    var m = (i % 2) ? MAT(P6.awnD) : MAT(P6.awn);
    var seg = box(w, 0.016, 0.12, m);
    seg.position.set(0, -cos(a) * r, sin(a) * r);
    seg.rotation.x = -a * 0.55;
    g.add(seg);
    var hold = grp();                                        /* 波浪垂边 */
    hold.position.copy(seg.position); hold.rotation.x = seg.rotation.x;
    var sc = mesh(scallopGeo(w / n), m);
    sc.position.set(0, -0.012, 0.058);
    hold.add(sc); g.add(hold);
  }
  [-1, 1].forEach(function (sd) {                            /* 端侧垂片 */
    var fp = box(0.05, 0.02, 0.14, MAT(P6.awn));
    fp.position.set(sd * (w / 2 - 0.02), -cos(20 * PI / 180) * r - 0.05, sin(20 * PI / 180) * r);
    fp.rotation.x = -0.35; fp.rotation.z = sd * 0.28;
    g.add(fp);
  });
  var rod = cyl(0.01, 0.01, w + 0.05, 12, MAT(P6.woodD));
  rod.rotation.z = PI / 2;
  rod.position.set(0, -cos(70 * PI / 180) * r, sin(70 * PI / 180) * r);
  g.add(rod);
  [-1, 1].forEach(function (sd) {                            /* 斜撑 */
    var br = box(0.018, 0.16, 0.018, MAT(P6.woodD), sd * (w / 2 - 0.03), 0.1, 0.16);
    br.rotation.x = -0.5;
    g.add(br);
  });
  return g;
}
/* 前院独立石牌坊 v2：砌石柱 + 柱础 + 拱 + keystone + 双皮曲线压顶 + 顶珠 +
   梁枋彩绘带（lv2 素石 / lv3 彩绘降饱和 / lv4 朱红鎏金）+ 雀替；lv4 鎏金牌 + 红漆侧镶 */
function stoneGateway(w, h, lv) {
  var g = grp(), yA = h + w / 2;                                    /* 拱肩顶 */
  [-1, 1].forEach(function (sd) {
    var xo = sd * (w / 2 + 0.045);
    var col = stoneBox(0.13, h, 0.13, 1, h / 0.2);
    col.position.set(xo, h / 2, 0);
    g.add(col);
    g.add(box(0.19, 0.05, 0.19, MAT(P6.stoneD, { rough: 0.9 }), xo, 0.025, 0));   /* 柱础 */
    g.add(box(0.2, 0.045, 0.2, MAT(P6.stoneL), xo, h + 0.02, 0));                 /* 柱头 */
    g.add(box(0.075, 0.045, 0.09, MAT(P6.stoneL), sd * (w / 2 + 0.02), yA - 0.1, 0.03)); /* 雀替 */
  });
  var arc = mesh(new THREE.TorusGeometry(w / 2, 0.052, 10, 18, PI), MAT(P6.stoneL));
  arc.position.y = h; g.add(arc);
  g.add(box(0.05, 0.09, 0.06, MAT(P6.stone), 0, yA - 0.02, 0.058));  /* 拱心石（凸出前脸） */
  /* 梁枋带（彩绘/素石） */
  var band;
  if (lv >= 4) {
    band = box(w + 0.34, 0.088, 0.16, std('#ffffff', { map: texPaint(), rough: 0.65 }), 0, yA + 0.012, 0);
  } else if (lv === 3) {
    band = box(w + 0.34, 0.088, 0.16, std('#b9b4a4', { map: texPaint().clone(), rough: 0.7 }), 0, yA + 0.012, 0);
  } else {
    band = box(w + 0.34, 0.088, 0.16, MAT(P6.stone), 0, yA + 0.012, 0);
  }
  g.add(band);
  /* 曲线压顶（双皮）+ 顶珠 */
  var cw = w + 0.34, cw2 = cw / 2, chh = 0.13 + w * 0.08, capBase = yA + 0.052;
  function capGeo(sc, dp) {
    return new THREE.ExtrudeGeometry(capShape2(cw2 * sc, chh * sc),
      { depth: dp, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.006, bevelSegments: 1, curveSegments: 12 });
  }
  var capG = mesh(capGeo(1, 0.1), MAT(P6.stoneL));
  capG.position.set(0, capBase, -0.05); g.add(capG);
  var cap2 = mesh(capGeo(0.8, 0.12), MAT(P6.stone));
  cap2.position.set(0, capBase + chh * 0.16, -0.044); g.add(cap2);
  g.add(sph(0.024, 12, MAT(P6.stoneL), 0, capBase + chh * 1.06, 0.016));           /* 顶珠 */
  if (lv >= 4) {
    var giltM = std(P6.gilt, { rough: 0.4, metal: 0.5, emissive: '#8a5a20', ei: 0.15 });
    g.add(box(0.16, 0.085, 0.024, giltM, 0, capBase + chh * 0.62, 0.058));
    [-1, 1].forEach(function (sd) {
      g.add(box(0.035, h * 0.5, 0.02, MAT('#8f3b2a', { rough: 0.6 }), sd * (w / 2 + 0.045), h * 0.5, 0.072));
    });
    g.userData.giltMat = giltM;
  } else if (lv === 3) {
    var pl = textPlate6('武康', 0.24, 0.1, { bg: '#2c3426', fg: '#d8b86a', ei: 0.1 });
    put(g, pl, 0, capBase + chh * 0.62, 0.052);
    g.userData.plaqueMat = pl.userData.faceMat;
  } else {
    g.add(box(0.16, 0.075, 0.02, MAT(P6.stone), 0, capBase + chh * 0.62, 0.052));
  }
  return g;
}
function capShape2(w2, chh) {
  var s = new THREE.Shape();
  s.moveTo(-w2, 0); s.lineTo(-w2, chh * 0.34);
  s.quadraticCurveTo(-w2, chh * 0.7, -w2 * 0.45, chh * 0.86);
  s.quadraticCurveTo(0, chh * 1.02, w2 * 0.45, chh * 0.86);
  s.quadraticCurveTo(w2, chh * 0.7, w2, chh * 0.34);
  s.lineTo(w2, 0);
  s.closePath();
  return s;
}
/* 蓝瓦歇山翘角顶 v2：瓦垄纹理 + 垂脊×4 + 垂脊小兽×4 + 檐口椽头（红/青交替）+
   正脊双兽 + 小兽×2 + 红封檐板 ×4 */
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
  /* 红封檐板 ×4 */
  var red = MAT(P6.eaveRed, { rough: 0.7 });
  g.add(box(w * 0.92, 0.05, 0.022, red, 0, cl * 0.42, d / 2 + ov * 0.82));
  g.add(box(w * 0.92, 0.05, 0.022, red, 0, cl * 0.42, -(d / 2 + ov * 0.82)));
  g.add(box(0.022, 0.05, d * 0.9, red, w / 2 + ov * 0.82, cl * 0.42, 0));
  g.add(box(0.022, 0.05, d * 0.9, red, -(w / 2 + ov * 0.82), cl * 0.42, 0));
  /* 檐口椽头（红/青交替）：前脸 + 两侧 */
  var nR = 11, teal = MAT(P6.teal, { rough: 0.72 });
  for (var i = 0; i < nR; i++) {
    var rx = -w * 0.46 + i * (w * 0.92 / (nR - 1));
    g.add(box(0.026, 0.026, 0.055, (i % 2) ? teal : red, rx, cl * 0.16, d / 2 + ov * 0.62));
  }
  [-1, 1].forEach(function (sd) {
    for (var j = 0; j < 5; j++) {
      var rz = -d * 0.38 + j * (d * 0.76 / 4);
      g.add(box(0.055, 0.026, 0.026, (j % 2) ? teal : red, sd * (w / 2 + ov * 0.62), cl * 0.16, rz));
    }
  });
  /* 正脊（石灰色）+ 两端脊兽 + 中央脊饰 + 鎏金顶 */
  var rw2 = w * 0.25;
  var rs = MAT(P6.ridgeS, { rough: 0.75 });
  g.add(box(rw2 * 2 + 0.05, 0.035, 0.075, rs, 0, h + 0.012, 0));   /* 脊座 */
  g.add(box(rw2 * 2, 0.055, 0.06, rs, 0, h + 0.05, 0));
  [-rw2, rw2].forEach(function (x) {
    var beast = grp(); beast.position.set(x, h + 0.09, 0);
    beast.add(box(0.055, 0.075, 0.04, rs));
    var head = mesh(new THREE.ConeGeometry(0.024, 0.06, 12), rs);
    head.rotation.z = x > 0 ? -1.25 : 1.25; head.position.set(x > 0 ? 0.045 : -0.045, 0.01, 0);
    beast.add(head);
    beast.add(box(0.016, 0.05, 0.012, rs, x > 0 ? -0.03 : 0.03, 0.05, 0));
    g.add(beast);
    [-1, 1].forEach(function (sd2) {                          /* 正脊小兽 ×2 */
      var mb = box(0.026, 0.03, 0.024, rs, x * 0.55 + sd2 * 0.03, h + 0.1, 0);
      g.add(mb);
    });
  });
  g.add(box(0.17, 0.05, 0.045, rs, 0, h + 0.095, 0));
  g.add(cyl(0.024, 0.03, 0.035, 12, MAT(P6.gilt), 0, h + 0.13, 0));
  /* 垂脊 ×4 + 垂脊小兽 ×4 */
  var hw = w / 2, hd = d / 2;
  var v3 = new THREE.Vector3();
  [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(function (c) {
    var sxp = c[0], szp = c[1];
    var P1 = new THREE.Vector3(sxp * rw2, h + 0.05, 0);
    var P2 = new THREE.Vector3(sxp * (hw + ov * 0.86), cl + 0.05, szp * (hd + ov * 0.86));
    var dir = v3.copy(P2).sub(P1);
    var L = dir.length();
    var hip = box(L * 0.98, 0.042, 0.052, rs, 0, 0, 0);
    hip.position.copy(P1).addScaledVector(dir, 0.5);
    hip.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir.clone().normalize());
    g.add(hip);
    var hb = grp(); hb.position.copy(P2);
    hb.add(box(0.038, 0.05, 0.032, rs, 0, 0.01, 0));
    var hc = mesh(new THREE.ConeGeometry(0.016, 0.04, 12), rs);
    hc.position.set(0, 0.05, 0); hb.add(hc);
    g.add(hb);
  });
  return g;
}
/* 老虎窗 v2：身 + 双侧颊 + 玻璃 + 棂 + 窗台 + 四棱小顶 + 顶珠（tier 再加二层小顶） */
function dormer(sc, tier) {
  sc = sc || 1;
  var g = grp();
  g.add(box(0.16 * sc, 0.14 * sc, 0.12 * sc, MAT(P6.stone), 0, 0.07 * sc, 0));
  [-1, 1].forEach(function (sd) {
    g.add(box(0.02 * sc, 0.15 * sc, 0.13 * sc, MAT(P6.stoneD), sd * 0.085 * sc, 0.07 * sc, -0.005 * sc));
  });
  g.add(box(0.1 * sc, 0.08 * sc, 0.02, MAT(P6.glaz, { rough: 0.35 }), 0, 0.07 * sc, 0.062 * sc));
  g.add(box(0.02 * sc, 0.08 * sc, 0.022, MAT(P6.woodD), 0, 0.07 * sc, 0.066 * sc));
  g.add(box(0.14 * sc, 0.022, 0.06 * sc, MAT(P6.stoneL), 0, 0.012 * sc, 0.06 * sc));
  var rf = mesh(new THREE.ConeGeometry(0.125 * sc, 0.08 * sc, 4).rotateY(PI / 4), MAT(P6.tileB2));
  rf.position.y = 0.18 * sc; g.add(rf);
  g.add(sph(0.014 * sc, 12, MAT(P6.stoneL), 0, 0.23 * sc, 0));
  if (tier) {                                                /* 二层小顶（层次） */
    var t2 = mesh(new THREE.ConeGeometry(0.07 * sc, 0.05 * sc, 4).rotateY(PI / 4), MAT(P6.tileB));
    t2.position.y = 0.26 * sc; g.add(t2);
  }
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
  g.add(sph(0.024, 12, MAT(P6.stoneL), 0, h + 0.055, 0));
  return g;
}
/* 石板小径 v2：3 块错缝 + 4 卵石 */
function flagPath(z0, z1) {
  var g = grp();
  for (var i = 0; i < 3; i++) {
    var u = i / 2;
    var s = box(0.3 - u * 0.06, 0.018, 0.16 + u * 0.05, MAT(P6.path, { rough: 0.95 }), (i % 2 ? 0.05 : -0.04), 0.072, z0 + (z1 - z0) * u);
    s.rotation.y = (i % 2 ? 0.08 : -0.06);
    g.add(s);
  }
  [[0.22, 0.3, 0.045], [-0.2, 0.55, 0.035], [0.24, 0.72, 0.04], [-0.22, 0.9, 0.03]].forEach(function (p) {
    var pe = sph(p[2], 12, MAT(P6.stoneD, { rough: 0.95 }), p[0], 0.072, p[1]);
    pe.scale.y = 0.45;
    g.add(pe);
  });
  return g;
}
/* 陶盆绿植（3 mesh） */
function potPlant(s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.05 * s, 0.062 * s, 0.07 * s, 12, MAT('#9c5a38', { rough: 0.8 }), 0, 0.035 * s, 0));
  put(g, sph(0.055 * s, 14, MAT('#5d7c3a', { rough: 0.9 })), 0, 0.1 * s, 0);
  put(g, sph(0.035 * s, 12, MAT('#7a9a4e', { rough: 0.9 })), 0.03 * s, 0.08 * s, 0.02 * s);
  return g;
}
function bush6(s, col) {
  var b = mesh(new THREE.IcosahedronGeometry(0.085 * (s || 1), 1), MAT(col || '#6f8f44', { rough: 0.95 }));
  b.scale.y = 0.85; return b;
}
/* 地坪：2.6×2.6（≤ 占地上限），草地双层 + 卵石/草丛点缀 */
function pad6() {
  var g = grp();
  g.add(box(2.6, 0.06, 2.6, MAT(P6.lawn, { rough: 0.95 }), 0, 0.03, 0));
  g.add(box(2.42, 0.02, 2.42, MAT(P6.grass, { rough: 0.95 }), 0, 0.068, 0));
  [[-1.12, -0.9, 0.05], [1.05, -1.05, 0.04], [-1.0, 1.05, 0.045], [1.18, 0.62, 0.035]].forEach(function (p) {
    var pe = sph(p[2], 12, MAT(P6.stoneD, { rough: 0.95 }), p[0], 0.082, p[1]);
    pe.scale.y = 0.4;
    g.add(pe);
  });
  [[-0.9, -1.08], [1.14, -0.6], [-1.18, 0.72]].forEach(function (p) {
    var tf = mesh(new THREE.IcosahedronGeometry(0.035, 0), MAT('#7a9a4e', { rough: 0.95 }));
    tf.position.set(p[0], 0.09, p[1]); tf.scale.y = 1.35;
    g.add(tf);
  });
  return g;
}
/* 小青瓦人字坡（山花后小顶，lv2/lv3）：瓦面×2 + 正脊 + 滚瓦×2 + 山花封板×2 + 博风板×2 */
function miniGable(w, rise, half) {
  var g = grp();
  var slope = Math.sqrt(rise * rise + half * half), ang = Math.atan2(rise, half);
  var t = texTile().clone(); t.needsUpdate = true; t.repeat.set(w * 3, slope * 3);
  var tm = std('#ffffff', { map: t, rough: 0.66 });
  var rF = box(w, 0.035, slope, tm); rF.rotation.x = ang; rF.position.set(0, rise / 2, half / 2); g.add(rF);
  var rB = box(w, 0.035, slope, tm); rB.rotation.x = -ang; rB.position.set(0, rise / 2, -half / 2); g.add(rB);
  g.add(box(w + 0.04, 0.04, 0.06, MAT(P6.tileB2), 0, rise + 0.015, 0));
  var roll = cyl(0.02, 0.02, w + 0.04, 12, MAT(P6.tileB), 0, rise + 0.045, 0);     /* 正脊滚瓦 */
  roll.rotation.z = PI / 2; g.add(roll);
  var sh = new THREE.Shape();
  sh.moveTo(-half, 0); sh.lineTo(half, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.026, bevelEnabled: false });
  for (var sd2 = -1; sd2 <= 1; sd2 += 2) {
    var tp = mesh(tg, MAT(P6.brickD));
    tp.rotation.y = PI / 2 * sd2; tp.position.set(sd2 * (w / 2 - 0.026), 0, 0);
    g.add(tp);
    var bb = box(0.022, 0.045, slope, MAT(P6.tileB2), sd2 * (w / 2 + 0.012), rise / 2, half / 2);  /* 博风板 */
    bb.rotation.x = ang;
    g.add(bb);
  }
  return g;
}

/* ============================ 4. 四阶建筑（blockout→structure→form→material） ============================ */

/* ---------- lv1 小屋：木板屋 + 板皮人字顶(挂瓦条/封檐板) + 侧披屋 + 矮石墙院（~85 mesh, H≈0.97） ---------- */
function lv1() {
  var g = grp(); g.name = 'prop_6_lv1';
  g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = 1;
  g.add(pad6());

  var B = grp(); B.position.set(0, 0.078, -0.18); g.add(B);
  B.add(box(1.2, 0.05, 0.9, MAT(P6.stoneD), 0, 0.025, 0));                        /* 石勒脚 */
  B.add(box(1.24, 0.02, 0.94, MAT(P6.stone), 0, 0.055, 0));                       /* 勒脚压顶 */
  var walls = plankBox(1.08, 0.5, 0.78, 2, 1); walls.position.set(0, 0.3, 0); B.add(walls);
  [[-0.51, -0.36], [0.51, -0.36], [-0.51, 0.36], [0.51, 0.36]].forEach(function (c) {
    B.add(box(0.06, 0.5, 0.06, MAT(P6.plankD), c[0], 0.3, c[1]));                 /* 角柱 */
  });
  /* 正门（朝 +Z）+ 门楣 + 台阶 */
  B.add(box(0.3, 0.4, 0.03, MAT(P6.woodD), 0, 0.26, 0.39));
  B.add(box(0.24, 0.34, 0.02, MAT(P6.woodM), 0, 0.24, 0.4));
  B.add(box(0.38, 0.05, 0.06, MAT(P6.stoneL), 0, 0.5, 0.4));
  B.add(box(0.34, 0.03, 0.14, MAT(P6.stoneD), 0, 0.093, 0.46));
  /* 两侧木框小窗 + 木百叶挡板（右窗暖光 → 动画） */
  var glowM = std('#7a6248', { rough: 0.45, emissive: P6.glow, ei: 0.22 });
  [-0.32, 0.32].forEach(function (x, i) {
    B.add(box(0.26, 0.26, 0.035, MAT(P6.woodD), x, 0.34, 0.39));
    B.add(box(0.2, 0.2, 0.03, i ? glowM : MAT(P6.glaz, { rough: 0.4 }), x, 0.34, 0.396));
    B.add(box(0.22, 0.024, 0.036, MAT(P6.woodD), x, 0.34, 0.402));
    B.add(box(0.024, 0.2, 0.036, MAT(P6.woodD), x, 0.34, 0.402));
    B.add(box(0.32, 0.035, 0.06, MAT(P6.stoneL), x, 0.2, 0.4));
    [-1, 1].forEach(function (sd) {
      var sh2 = plankBox(0.06, 0.24, 0.016, 1, 1);
      sh2.position.set(x + sd * 0.165, 0.34, 0.408);
      sh2.rotation.y = sd * 0.35;
      B.add(sh2);
    });
  });
  /* 板皮人字顶（大挑檐）+ 挂瓦条 + 封檐板 + 脊头 */
  var roof = grp(); roof.position.set(0, 0.55, 0); B.add(roof);
  var rise = 0.3, half = 0.72, slope = Math.sqrt(rise * rise + half * half) + 0.06, ang = Math.atan2(rise, half);
  var pF = plankBox(1.34, 0.035, slope, 3, 1); pF.rotation.x = ang; pF.position.set(0, rise * 0.5, half * 0.5); roof.add(pF);
  var pB = plankBox(1.34, 0.035, slope, 3, 1); pB.rotation.x = -ang; pB.position.set(0, rise * 0.5, -half * 0.5); roof.add(pB);
  for (var bt = 0; bt < 4; bt++) {                                                /* 挂瓦条 ×4/坡 */
    var u = 0.2 + bt * 0.2;
    var bF = box(1.3, 0.014, 0.02, MAT(P6.plankD), 0, rise * u + 0.026, half * u + 0.01);
    bF.rotation.x = ang; roof.add(bF);
    var bB = box(1.3, 0.014, 0.02, MAT(P6.plankD), 0, rise * u + 0.026, -half * u - 0.01);
    bB.rotation.x = -ang; roof.add(bB);
  }
  roof.add(box(1.4, 0.045, 0.07, MAT(P6.plankD), 0, rise + 0.01, 0));
  [-1, 1].forEach(function (sd) {                                                 /* 封檐板（博风） */
    var rk = box(0.03, 0.05, slope, MAT(P6.plankD), sd * 0.665, rise * 0.5, half * 0.5);
    rk.rotation.x = ang;
    roof.add(rk);
    roof.add(box(0.05, 0.05, 0.05, MAT(P6.plankD), sd * 0.665, rise + 0.02, 0));  /* 脊头 */
  });
  var sh = new THREE.Shape();
  sh.moveTo(-0.39, 0); sh.lineTo(0.39, 0); sh.lineTo(0, rise); sh.closePath();
  var tg = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
  for (var sd = -1; sd <= 1; sd += 2) {
    var tp = mesh(tg, MAT(P6.plankD));
    tp.rotation.y = PI / 2 * sd; tp.position.set(sd * 0.655, 0, 0);
    roof.add(tp);
  }
  /* 右侧披屋（open shed）+ 垫石台 + 柴堆 */
  var shed = grp(); shed.position.set(0.78, 0.12, -0.1); B.add(shed);
  var slab = plankBox(0.5, 0.03, 0.66, 1, 1); slab.rotation.z = -0.32; slab.position.set(0.08, 0.36, 0); shed.add(slab);
  shed.add(cyl(0.018, 0.022, 0.34, 12, MAT(P6.plankD), 0.24, 0.17, 0.26));
  shed.add(cyl(0.018, 0.022, 0.34, 12, MAT(P6.plankD), 0.24, 0.17, -0.26));
  shed.add(box(0.04, 0.1, 0.5, MAT(P6.plankD), 0.3, 0.05, 0));
  B.add(box(0.46, 0.04, 0.6, MAT(P6.stoneD), 0.84, 0.02, -0.1));                  /* 垫石台 */
  var fw = grp(); fw.position.set(-1.02, 0.09, 0.3); g.add(fw);                   /* 柴堆 */
  [0, 1, 2].forEach(function (i) {
    var log = cyl(0.028, 0.028, 0.24, 12, MAT(P6.plankD), (i % 2) * 0.05 - 0.02, 0.03 + Math.floor(i / 2) * 0.05, (i % 2) * 0.04);
    log.rotation.z = PI / 2;
    fw.add(log);
  });
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
  g.add(cyl(0.045, 0.05, 0.12, 12, MAT('#5a6a74', { rough: 0.7 }), 0.95, 0.14, -0.42));
  g.add(cyl(0.04, 0.045, 0.1, 12, MAT('#6a5a3a', { rough: 0.8 }), 1.05, 0.13, -0.3));

  /* anim：暖窗呼吸（幅度克制） */
  anim(g, function (t) { glowM.emissiveIntensity = 0.22 + 0.1 * sin(t * 1.6); });
  return g;
}

/* ---------- lv2 洋房：两层红砖商铺 + 绿波浪篷(垂边) + 木瓶栏阳台 + 首座弧形山花 + 石牌坊
   （~160 mesh, H≈1.5） ---------- */
function lv2() {
  var g = grp(); g.name = 'prop_6_lv2';
  g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = 2;
  g.add(pad6());

  var B = grp(); B.position.set(0, 0.078, -0.2); g.add(B);
  B.add(box(1.6, 0.06, 1.0, MAT(P6.stoneD), 0, 0.03, 0));                          /* 勒脚 */
  var pc2 = stoneBox(1.64, 0.03, 1.04, 4, 1); pc2.position.y = 0.065; B.add(pc2);  /* 勒脚压顶 */
  var main = brickBox(1.5, 0.92, 0.9, 3, 2, true); main.position.set(0, 0.55, 0); B.add(main);
  [[-0.72, 0.42], [0.72, 0.42], [-0.72, -0.42], [0.72, -0.42]].forEach(function (c) {
    var q = quoin(0.92, c[0], c[1], 0.15); q.position.y = 0.09; B.add(q);
  });
  B.add(box(1.56, 0.045, 0.94, MAT(P6.stone), 0, 0.56, 0));                        /* 层间线脚 */
  B.add(box(1.58, 0.06, 0.96, MAT(P6.stoneL), 0, 1.03, 0));                        /* 顶檐口 */
  /* 一层店面：暖光橱窗(裙板/柜台) + 木门 + 绿波浪篷(垂边) + 挂匾 */
  var shop = shopGlow(0.5, 0.36); shop.position.set(-0.42, 0.32, 0.458); B.add(shop);
  B.add(box(0.28, 0.44, 0.035, MAT(P6.woodD), 0.16, 0.29, 0.458));
  B.add(box(0.22, 0.38, 0.024, MAT(P6.woodM), 0.16, 0.27, 0.472));
  B.add(cyl(0.012, 0.012, 0.2, 12, MAT(P6.woodD), 0.33, 0.42, 0.47));              /* 门拉手柱 */
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

/* ---------- lv3 大厦：三层楼阁 + 双层石瓶栏阳台 + 山花升级 + 侧翼楼 + 「武康」石匾
   （~260 mesh, H≈2.2） ---------- */
function lv3() {
  var g = grp(); g.name = 'prop_6_lv3';
  g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = 3;
  g.add(pad6());

  var B = grp(); B.position.set(0.05, 0.078, -0.16); g.add(B);
  B.add(box(1.52, 0.07, 1.02, MAT(P6.stoneD), 0, 0.035, 0));                       /* 勒脚 */
  var pc3 = stoneBox(1.56, 0.03, 1.06, 4, 1); pc3.position.y = 0.075; B.add(pc3);  /* 勒脚压顶 */
  var main = brickBox(1.4, 1.56, 0.95, 3, 3, true); main.position.set(0, 0.85, 0); B.add(main);
  [[-0.67, 0.45], [0.67, 0.45], [-0.67, -0.45], [0.67, -0.45]].forEach(function (c) {
    var q = quoin(1.56, c[0], c[1], 0.15); q.position.y = 0.07; B.add(q);
  });
  B.add(box(1.46, 0.04, 0.98, MAT(P6.stone), 0, 0.6, 0));                          /* 层线脚 ×2 */
  B.add(box(1.46, 0.04, 0.98, MAT(P6.stone), 0, 1.1, 0));
  B.add(box(1.48, 0.06, 1.0, MAT(P6.stoneL), 0, 1.65, 0));                         /* 顶檐口 */
  /* 一层：木门 + 拱窗 ×2(耳石) + 门篷 */
  B.add(box(0.3, 0.46, 0.035, MAT(P6.woodD), 0, 0.3, 0.478));
  B.add(box(0.24, 0.4, 0.024, MAT(P6.woodM), 0, 0.28, 0.492));
  var dArc = new THREE.CylinderGeometry(0.15, 0.15, 0.032, 14, 1, false, 0, PI);
  dArc.rotateX(PI / 2); dArc.rotateZ(PI / 2);
  var da = mesh(dArc, MAT(P6.woodD)); da.position.set(0, 0.53, 0.478); B.add(da);
  var s1 = archWindow(0.22, 0.3, { ears: true }); s1.position.set(-0.44, 0.36, 0.478); B.add(s1);
  var s2 = archWindow(0.22, 0.3, { ears: true }); s2.position.set(0.44, 0.36, 0.478); B.add(s2);
  var aw = awn6(0.72, 0.22); aw.position.set(0, 0.66, 0.54); B.add(aw);
  /* 二层：法式窗 + 石瓶栏阳台 + 拱窗 ×2 */
  var f2 = frenchWindow(0.32, 0.42, { key: true }); f2.position.set(0, 0.88, 0.478); B.add(f2);
  var w21 = archWindow(0.22, 0.32); w21.position.set(-0.44, 0.88, 0.478); B.add(w21);
  var w22 = archWindow(0.22, 0.32); w22.position.set(0.44, 0.88, 0.478); B.add(w22);
  var b2 = balustrade(0.9, 0.2, 6, MAT(P6.stoneL)); b2.position.set(0, 0.65, 0.52); B.add(b2);
  var fb2 = flowerBox(0.46); fb2.position.set(0, 0.72, 0.68); B.add(fb2);
  /* 三层：法式窗 + 石瓶栏阳台 + 拱窗 ×2 */
  var f3 = frenchWindow(0.32, 0.4, { key: true }); f3.position.set(0, 1.38, 0.478); B.add(f3);
  var w31 = archWindow(0.22, 0.3); w31.position.set(-0.44, 1.38, 0.478); B.add(w31);
  var w32 = archWindow(0.22, 0.3); w32.position.set(0.44, 1.38, 0.478); B.add(w32);
  var b3b = balustrade(0.9, 0.2, 6, MAT(P6.stoneL)); b3b.position.set(0, 1.15, 0.52); B.add(b3b);
  var fb3 = flowerBox(0.46); fb3.position.set(0, 1.22, 0.68); B.add(fb3);
  /* 山花（贴记升级）+ 山花后青瓦小坡顶 */
  var ped = curvedPediment(0.86, 0.4, 0.12, 3); ped.position.set(0, 1.68, 0.4); B.add(ped);
  var mg = miniGable(0.96, 0.24, 0.46); mg.position.set(0, 1.68, -0.1); B.add(mg);
  /* 侧翼楼（+x，两层）+ 角亭小青瓦顶 + 遮阳篷 */
  var W = grp(); W.position.set(0.95, 0.078, -0.2); g.add(W);
  W.add(box(0.56, 0.05, 0.8, MAT(P6.stoneD), 0, 0.025, 0));
  var wb = brickBox(0.5, 0.88, 0.72, 2, 2, true); wb.position.set(0, 0.51, 0); W.add(wb);
  W.add(box(0.56, 0.05, 0.76, MAT(P6.stoneL), 0, 0.98, 0));
  var w41 = archWindow(0.16, 0.24); w41.position.set(0, 0.42, 0.365); W.add(w41);
  var w42 = archWindow(0.16, 0.22); w42.position.set(0, 0.85, 0.365); W.add(w42);
  var wrf = box(0.6, 0.03, 0.8, MAT(P6.tileB2), 0, 1.04, -0.02); wrf.rotation.x = 0.12; W.add(wrf);
  var hip = mesh(new THREE.ConeGeometry(0.3, 0.12, 4).rotateY(PI / 4), MAT(P6.tileB2));  /* 角亭四棱瓦顶（烘旋保 bbox） */
  hip.position.set(0, 1.12, -0.02); W.add(hip);
  W.add(sph(0.02, 12, MAT(P6.stoneL), 0, 1.2, -0.02));
  var wrail = balustrade(0.5, 0.14, 4, MAT(P6.stoneL)); wrail.position.set(0, 1.0, 0.32); W.add(wrail);
  /* 前院：大牌坊（彩绘带降饱和 + 「武康」匾）+ 墙 + 径 */
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

/* ---------- lv4 地标：四层完整洋楼 + 白雕花山花圆窗冠顶 + 蓝瓦歇山(垂脊/脊兽/椽头/双虎窗)
   + 鎏金彩绘牌坊（~335 mesh, H≈2.6） ---------- */
function lv4() {
  var g = grp(); g.name = 'prop_6_lv4';
  g.userData.kind = 'property'; g.userData.propIdx = 6; g.userData.level = 4;
  g.add(pad6());

  var B = grp(); B.position.set(0.02, 0.078, -0.14); g.add(B);
  B.add(box(1.68, 0.09, 1.18, MAT(P6.stoneD), 0, 0.045, 0));                       /* 石勒脚 */
  var pc4 = stoneBox(1.72, 0.03, 1.22, 5, 1); pc4.position.y = 0.1; B.add(pc4);    /* 勒脚压顶 */
  var main = brickBox(1.56, 1.84, 1.06, 3, 4, true); main.position.set(0, 1.01, 0); B.add(main);
  [[-0.75, 0.5, 0.012], [0.75, 0.5, 0.012], [-0.75, -0.5, -0.012], [0.75, -0.5, -0.012]].forEach(function (c) {
    B.add(box(0.1, 1.84, 0.07, MAT(P6.stone), c[0], 1.01, c[1] + c[2]));           /* 通高壁柱 */
  });
  B.add(box(1.6, 0.045, 1.1, MAT(P6.stone), 0, 0.64, 0));                          /* 层线脚 ×3 */
  B.add(box(1.6, 0.045, 1.1, MAT(P6.stone), 0, 1.12, 0));
  B.add(box(1.6, 0.045, 1.1, MAT(P6.stone), 0, 1.6, 0));
  B.add(box(1.64, 0.07, 1.14, MAT(P6.stoneL), 0, 1.945, 0));                       /* 顶横檐 */
  /* 一层：双柱拱门 + 「武康路」金匾 + 拱窗 ×2(耳石) */
  B.add(box(0.36, 0.52, 0.04, MAT(P6.woodD), 0, 0.33, 0.545));
  B.add(box(0.3, 0.46, 0.028, MAT(P6.woodM), 0, 0.31, 0.562));
  var dArc = new THREE.CylinderGeometry(0.18, 0.18, 0.038, 14, 1, false, 0, PI);
  dArc.rotateX(PI / 2); dArc.rotateZ(PI / 2);
  var da = mesh(dArc, MAT(P6.stoneL)); da.position.set(0, 0.59, 0.545); B.add(da);
  [-0.3, 0.3].forEach(function (x) {
    B.add(cyl(0.035, 0.042, 0.5, 12, MAT(P6.stoneL), x, 0.33, 0.6));
    B.add(cyl(0.05, 0.05, 0.03, 12, MAT(P6.stone), x, 0.6, 0.6));
    B.add(box(0.09, 0.04, 0.09, MAT(P6.stoneD), x, 0.05, 0.6));                    /* 柱础 */
  });
  var plaque = textPlate6('武康路', 0.44, 0.14, { bg: '#26301f', fg: '#e8c87a', ei: 0.15 });
  plaque.position.set(0, 0.72, 0.565); B.add(plaque);
  var s1 = archWindow(0.2, 0.28, { ears: true }); s1.position.set(-0.52, 0.36, 0.545); B.add(s1);
  var s2 = archWindow(0.2, 0.28, { ears: true }); s2.position.set(0.52, 0.36, 0.545); B.add(s2);
  /* 二层：法式窗 + 石瓶栏阳台 + 拱窗 ×2 */
  var f2 = frenchWindow(0.34, 0.44, { key: true }); f2.position.set(0, 0.9, 0.545); B.add(f2);
  var w21 = archWindow(0.2, 0.3); w21.position.set(-0.52, 0.9, 0.545); B.add(w21);
  var w22 = archWindow(0.2, 0.3); w22.position.set(0.52, 0.9, 0.545); B.add(w22);
  var b2 = balustrade(1.0, 0.22, 5, MAT(P6.stoneL)); b2.position.set(0, 0.66, 0.58); B.add(b2);
  var fb2 = flowerBox(0.5); fb2.position.set(0, 0.735, 0.75); B.add(fb2);
  /* 三层：三联拱窗 + 石瓶栏阳台 */
  var w31 = archWindow(0.18, 0.28); w31.position.set(-0.5, 1.38, 0.545); B.add(w31);
  var f3 = frenchWindow(0.3, 0.42, { key: true }); f3.position.set(0, 1.38, 0.545); B.add(f3);
  var w32 = archWindow(0.18, 0.28); w32.position.set(0.5, 1.38, 0.545); B.add(w32);
  var b3 = balustrade(1.0, 0.22, 5, MAT(P6.stoneL)); b3.position.set(0, 1.14, 0.58); B.add(b3);
  var fb3 = flowerBox(0.5); fb3.position.set(0, 1.215, 0.75); B.add(fb3);
  /* 四层：三联拱窗（砖柱间）+ 石瓶栏阳台 */
  var w41 = archWindow(0.18, 0.26); w41.position.set(-0.5, 1.85, 0.545); B.add(w41);
  var f4 = frenchWindow(0.3, 0.4, { key: true }); f4.position.set(0, 1.85, 0.545); B.add(f4);
  var w42 = archWindow(0.18, 0.26); w42.position.set(0.5, 1.85, 0.545); B.add(w42);
  B.add(box(0.07, 0.52, 0.05, MAT(P6.brickD), -0.26, 1.86, 0.55));
  B.add(box(0.07, 0.52, 0.05, MAT(P6.brickD), 0.26, 1.86, 0.55));
  var b4 = balustrade(1.06, 0.22, 5, MAT(P6.stoneL)); b4.position.set(0, 1.62, 0.58); B.add(b4);
  var fb4 = flowerBox(0.5); fb4.position.set(0, 1.695, 0.75); B.add(fb4);
  /* 白雕花山花：圆窗 + 浮雕 + 冠顶宝瓶（身份特征顶点） */
  var ped = curvedPediment(0.95, 0.46, 0.12, 4); ped.position.set(0, 1.98, 0.46); B.add(ped);
  /* 蓝瓦歇山翘角顶（身份特征顶点）+ 双老虎窗（层次） */
  var roof = cnRoof(1.6, 1.3, 0.36); roof.position.set(0, 1.98, -0.06); B.add(roof);
  var dm1 = dormer(1.25, true); dm1.position.set(0.34, 2.13, 0.3); B.add(dm1);     /* 底部嵌入屋坡 */
  var dm2 = dormer(0.85, false); dm2.position.set(-0.36, 2.19, 0.24); B.add(dm2);
  /* 侧翼楼（+x）+ 木披檐 + 角亭青瓦顶 */
  var W = grp(); W.position.set(0.98, 0.078, -0.18); g.add(W);
  W.add(box(0.6, 0.06, 0.86, MAT(P6.stoneD), 0, 0.03, 0));
  var wb = brickBox(0.54, 1.1, 0.78, 2, 2, true); wb.position.set(0, 0.61, 0); W.add(wb);
  W.add(box(0.6, 0.05, 0.82, MAT(P6.stoneL), 0, 1.19, 0));
  var w51 = archWindow(0.18, 0.28); w51.position.set(0, 0.5, 0.395); W.add(w51);
  var w52 = archWindow(0.18, 0.26); w52.position.set(0, 1.0, 0.395); W.add(w52);
  var cap = grp(); cap.position.set(0, 1.22, 0.14); W.add(cap);
  var cs = plankBox(0.6, 0.025, 0.5, 2, 1); cs.rotation.x = 0.28; cap.add(cs);
  cap.add(cyl(0.016, 0.02, 0.26, 12, MAT(P6.woodD), 0.24, -0.14, 0.16));
  cap.add(cyl(0.016, 0.02, 0.26, 12, MAT(P6.woodD), -0.24, -0.14, 0.16));
  cap.add(box(0.62, 0.03, 0.06, MAT(P6.eaveRed, { rough: 0.7 }), 0, 0.05, 0.26));  /* 披檐封板 */
  var whip = mesh(new THREE.ConeGeometry(0.24, 0.1, 4).rotateY(PI / 4), MAT(P6.tileB2));  /* 角亭四棱瓦顶（烘旋保 bbox） */
  whip.position.set(0, 1.3, -0.16); W.add(whip);
  W.add(sph(0.018, 12, MAT(P6.stoneL), 0, 1.37, -0.16));
  var wrail = balustrade(0.54, 0.16, 3, MAT(P6.stoneL)); wrail.position.set(0, 1.21, 0.34); W.add(wrail);
  /* 前院：鎏金牌坊（朱红鎏金彩绘带）+ 墙 + 台阶 + 径 */
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
