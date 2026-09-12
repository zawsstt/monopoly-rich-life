/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_1.js  格 1「平江路」个性化地产
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真重建：参考图 refs/prop_1.png（江南四阶生长谱系）为唯一视觉基准。
 *
 *   window.Props3D[1](level 1..4) → THREE.Group（含草地沙盘地坪，底面贴 y=0，正面朝 +Z）
 *
 * 风格族谱（同一块地、同一语言的生长史，非四座无关建筑）：
 *   固定语汇 = 灰瓦曲坡顶(瓦垄/檐角起翘/正脊吻) + 白墙黛瓦木构架 + 月洞门院墙
 *              + 红灯笼 + 石板径 + 圆角草地沙盘基座
 *   lv1 小屋   ：木板壁单开间小铺，悬山瓦顶，矮院墙 + 月洞门，1 灯 1 树
 *   lv2 洋房   ：两层白墙小楼（下层店面 + 蓝布雨棚 + 挑廊），右侧披屋，庑殿顶起翘，3 灯
 *   lv3 大厦   ：三层主楼 + 中层挑廊 + 右耳房，大庑殿顶 + 角兽，匾额，4 灯，暖窗
 *   lv4 地标   ：三重檐红柱地标（金脊兽/宝顶），石狮/石阶/花树点缀，8 灯，完整院落
 *
 * 约束：占地 ≤2.6×2.6；高度 lv1 0.8-1.2 / lv2 1.2-1.7 / lv3 1.7-2.3 / lv4 2.3-3.0；
 *       每级 ≤220 mesh；纹理全部 Canvas 程序化（≤256px）；userData.anim=[fn(t,dt)]。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[props3d/prop_1] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

window.Props3D = window.Props3D || {};

/* ================= 0. 调色板 & 材质（sRGB→Linear，配合 sRGBEncoding 输出） ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }

function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.map) m.map = o.map;
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
  if (o.side) m.side = o.side;
  if (o.envInt) m.envMapIntensity = o.envInt;
  return m;
}
var _matCache = {};
function MAT(hex, o) {
  o = o || {};
  var k = hex + '|' + (o.map ? o.map.uuid : '') + '|' + o.rough + '|' + o.metal + '|' + o.emissive + '|' + o.ei + '|' + o.side;
  if (_matCache[k]) return _matCache[k];
  var m = std(hex, o); _matCache[k] = m; return m;
}

/* ================= 1. Canvas 程序化纹理（≤256px，懒建单例） ================= */
var _texCache = {};
function cvTex(key, w, h, draw) {
  if (_texCache[key]) return _texCache[key];
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h);
  var tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  _texCache[key] = tex; return tex;
}

/* 灰瓦垄：纵向瓦楞（顺坡）+ 横向仰瓦瓦行 */
var texTile = function () {
  return cvTex('tile', 128, 128, function (g, w, h) {
    g.fillStyle = '#3d4750'; g.fillRect(0, 0, w, h);
    for (var x = 0; x < w; x += 16) {
      g.fillStyle = '#4c5966'; g.fillRect(x + 2, 0, 10, h);
      g.fillStyle = '#57646f'; g.fillRect(x + 4, 0, 4, h);
      g.fillStyle = '#2c343d'; g.fillRect(x, 0, 2, h);
    }
    for (var y = 0; y < h; y += 22) {
      g.fillStyle = 'rgba(30,37,44,0.55)'; g.fillRect(0, y, w, 3);
      g.fillStyle = 'rgba(122,136,148,0.35)'; g.fillRect(0, y + 3, w, 2);
    }
  });
};
/* 白灰墙：斑驳 + 底部水渍 */
var texPlaster = function () {
  return cvTex('plaster', 128, 128, function (g, w, h) {
    g.fillStyle = '#edefe3'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 40; i++) {
      g.fillStyle = i % 2 ? 'rgba(210,213,196,0.5)' : 'rgba(245,247,238,0.6)';
      g.fillRect((i * 37) % w, (i * 53) % h, 10 + (i * 7) % 16, 6 + (i * 5) % 12);
    }
    for (i = 0; i < 6; i++) {
      g.fillStyle = 'rgba(160,162,146,0.28)';
      g.fillRect(8 + i * 20, 84 + (i % 3) * 8, 3, 44);
    }
    g.fillStyle = 'rgba(150,152,136,0.30)'; g.fillRect(0, h - 14, w, 14);
  });
};
/* 竖木板壁（lv1 小屋） */
var texPlank = function () {
  return cvTex('plank', 128, 128, function (g, w, h) {
    for (var x = 0; x < w; x += 16) {
      g.fillStyle = (x / 16) % 2 ? '#8a7a5f' : '#7f704f'; g.fillRect(x, 0, 16, h);
      g.fillStyle = 'rgba(52,42,26,0.75)'; g.fillRect(x, 0, 2, h);
      g.fillStyle = 'rgba(66,54,34,0.4)';
      for (var k = 0; k < 5; k++) g.fillRect(x + 4 + (k * 5) % 9, (k * 27 + x) % h, 2, 8 + (k * 7) % 14);
    }
  });
};
/* 院墙石砌块 */
var texStoneWall = function () {
  return cvTex('stonewall', 128, 128, function (g, w, h) {
    g.fillStyle = '#ccc6b5'; g.fillRect(0, 0, w, h);
    for (var r = 0; r < 6; r++) {
      var y = r * 22, off = (r % 2) * 16;
      g.fillStyle = 'rgba(120,114,100,0.6)'; g.fillRect(0, y + 20, w, 2);
      for (var x = -16; x < w; x += 32) {
        g.fillRect(x + off, y, 2, 20);
        if (((x + off + r) / 2 | 0) % 3 === 0) {
          g.fillStyle = 'rgba(148,142,126,0.45)'; g.fillRect(x + off + 2, y, 30, 20);
          g.fillStyle = 'rgba(120,114,100,0.6)';
        }
      }
    }
  });
};
/* 木格花窗：暗棂后微光 */
var texLattice = function () {
  return cvTex('lattice', 128, 128, function (g, w, h) {
    g.fillStyle = '#222b24'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,150,140,0.18)'; g.fillRect(10, 10, w - 20, h - 20);
    g.fillStyle = '#5a4632';
    var i;
    for (i = 0; i <= 4; i++) { g.fillRect(i * 32 - 3, 0, 6, h); g.fillRect(0, i * 32 - 3, w, 6); }
    g.fillStyle = '#4a3826';
    for (i = 1; i < 4; i++) {
      g.fillRect(i * 32 - 20, i * 32 - 2, 40, 4);
      g.fillRect(i * 32 - 2, i * 32 - 20, 4, 40);
    }
  });
};
/* 匾额：金字木底 */
function texPlaque(text) {
  return cvTex('plaque' + text, 256, 128, function (g, w, h) {
    g.fillStyle = '#2f2314'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#c8a13c'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
    g.strokeStyle = '#8a6a24'; g.lineWidth = 3; g.strokeRect(18, 18, w - 36, h - 36);
    g.fillStyle = '#e3bd58'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold ' + Math.round(h * 0.44) + 'px "Microsoft YaHei","PingFang SC",sans-serif';
    g.fillText(text, w / 2, h / 2 + 4);
  });
}
/* 草地：绿底深斑 */
var texGrass = function () {
  return cvTex('grass', 128, 128, function (g, w, h) {
    g.fillStyle = '#7ca25b'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 46; i++) {
      g.fillStyle = i % 3 ? 'rgba(96,138,66,0.5)' : 'rgba(140,172,104,0.5)';
      g.fillRect((i * 41) % w, (i * 61) % h, 8 + (i * 7) % 14, 6 + (i * 5) % 10);
    }
  });
};

/* ================= 2. Kit 层图元 ================= */
function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z, seg) { var o = mesh(new THREE.SphereGeometry(r, seg || 12, (seg || 12) - 3), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, seg || 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function anim(g, fn) { (g.userData.anim || (g.userData.anim = [])).push(fn); }

/* 圆角矩形 Shape（沙盘基座） */
function roundedRectShape(w, d, r) {
  var s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x + r, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
var GEO = {};  /* 共享几何缓存（同阶多实例复用，optimization pass） */

/* ================= 3. 预制构件（四阶共用 → 同源生长的关键） ================= */

/* 3.1 草地沙盘基座：石框 + 草皮（全阶段一致）；返回草皮顶面高度 */
function basePlatform(g) {
  if (!GEO.pad) {
    GEO.pad = new THREE.ExtrudeGeometry(roundedRectShape(2.5, 2.5, 0.3), { depth: 0.05, bevelEnabled: false });
    GEO.pad.rotateX(-PI / 2);
    GEO.grass = new THREE.ExtrudeGeometry(roundedRectShape(2.28, 2.28, 0.26), { depth: 0.05, bevelEnabled: false });
    GEO.grass.rotateX(-PI / 2);
    GEO.grass.computeVertexNormals();
  }
  var stone = mesh(GEO.pad, MAT('#c9c3b2', { rough: 0.92 }));
  var grass = mesh(GEO.grass, MAT('#7ca25b', { map: texGrass(), rough: 0.95 }));
  grass.position.y = 0.048;
  g.add(stone); g.add(grass);
  return 0.098;
}

/* 3.2 曲坡庑殿顶：凹曲屋面 + 檐角起翘 + 正脊吻兽（风格主签名） */
function hipRoofGeo(w, d, h, lift) {
  var hw = w / 2, hd = d / 2;
  var corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
  var ring = [], i, e, k, t;
  var SEG = 6;  /* 每边细分段数：面片更细 → 檐口曲线更顺、层体穿屋面交界更干净 */
  for (e = 0; e < 4; e++) {
    var a = corners[e], b = corners[(e + 1) % 4];
    for (k = (e === 0 ? 0 : 1); k <= SEG; k++) {
      t = k / SEG;
      var x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
      var y = (k === 0 || k === SEG) ? lift : lift * Math.pow(Math.abs(2 * t - 1), 1.7) * 0.55;
      ring.push([x, y, z]);
    }
  }
  var n = ring.length, u = [0], acc = 0;
  for (i = 1; i <= n; i++) {
    var p0 = ring[i - 1], p1 = ring[i % n];
    acc += Math.abs(p1[0] - p0[0]) + Math.abs(p1[2] - p0[2]);
    u.push(acc);
  }
  var slope = Math.sqrt(h * h + (w * 0.35) * (w * 0.35));
  var pos = [], uv = [], uScale = 2.0, vScale = 3.0;
  function vOf(y) { return (h - y) / slope * vScale; }
  var SKIRT = 0.045;  /* 檐口裙板高度：封闭檐口，随角部起翘 */
  for (i = 0; i < n; i++) {
    var pp = ring[i], qq = ring[(i + 1) % n];
    /* 顶点序 (apex, q, p) → 法线朝上外 */
    pos.push(0, h, 0, qq[0], qq[1], qq[2], pp[0], pp[1], pp[2]);
    uv.push(u[i + 1] * uScale, vOf(h), 0, u[i + 1] * uScale, vOf(qq[1]), 0, u[i] * uScale, vOf(pp[1]), 0);
    /* 檐口裙板（竖向封闭条带，随环线起伏） */
    var qyb = qq[1] - SKIRT, pyb = pp[1] - SKIRT;
    pos.push(qq[0], qq[1], qq[2], qq[0], qyb, qq[2], pp[0], pp[1], pp[2]);
    uv.push(u[i + 1] * uScale, 0.9, 0, u[i + 1] * uScale, 1.0, 0, u[i] * uScale, 0.9, 0);
    pos.push(qq[0], qyb, qq[2], pp[0], pyb, pp[2], pp[0], pp[1], pp[2]);
    uv.push(u[i + 1] * uScale, 1.0, 0, u[i] * uScale, 1.0, 0, u[i] * uScale, 0.9, 0);
    /* 檐底望板（水平封闭，消除仰视穿透） */
    pos.push(qq[0], qyb, qq[2], pp[0], pyb, pp[2], qq[0], qq[1], qq[2]);
    uv.push(0, 0, 0, 1, 0, 0, 1, 1, 0);
    pos.push(pp[0], pyb, pp[2], pp[0], pp[1], pp[2], qq[0], qq[1], qq[2]);
    uv.push(0, 0, 0, 1, 0, 0, 1, 1, 0);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 3));
  g.computeVertexNormals();
  return g;
}
function hipRoof(g, x, y, z, w, d, h, o) {
  o = o || {};
  var lift = (o.lift !== undefined ? o.lift : Math.min(w, d) * 0.11);
  var roofMat = o.roofMat || MAT('#45505c', { map: texTile(), rough: 0.72, side: THREE.DoubleSide });
  var ridgeMat = o.ridgeMat || MAT('#2e353d', { rough: 0.7 });
  var ornMat = o.ornMat || ridgeMat;
  var top = grp(); top.position.set(x, y, z);
  var key = 'hr_' + w + '_' + d + '_' + h + '_' + lift;
  if (!GEO[key]) GEO[key] = hipRoofGeo(w, d, h, lift);
  top.add(mesh(GEO[key], roofMat));
  /* 正脊 + 两端上翘脊吻 */
  var rl = Math.max(w - d, w * 0.34);
  top.add(box(rl, 0.055, 0.085, ridgeMat, 0, h + 0.02, 0));
  var f1 = box(0.06, 0.19, 0.08, ridgeMat, -rl / 2, h + 0.075, 0); f1.rotation.z = 0.55; top.add(f1);
  var f2 = box(0.06, 0.19, 0.08, ridgeMat, rl / 2, h + 0.075, 0); f2.rotation.z = -0.55; top.add(f2);
  if (o.gold) {
    top.add(sph(0.035, ornMat, -rl / 2, h + 0.115, 0, 8));
    top.add(sph(0.035, ornMat, rl / 2, h + 0.115, 0, 8));
    top.add(box(rl * 0.96, 0.02, 0.02, ornMat, 0, h + 0.055, 0));
  }
  if (o.beasts) {
    var n = o.beasts === 2 ? 2 : 4, bw = w / 2 - 0.04, bd = d / 2 - 0.04;
    var spots = n === 4 ? [[bw, bd], [-bw, bd], [bw, -bd], [-bw, -bd]] : [[bw, bd], [-bw, bd]];
    spots.forEach(function (s) {
      var beast = cone(0.035, 0.1, 6, ornMat, 0, 0, 0);
      beast.position.set(s[0], lift + 0.03, s[1]);
      beast.rotation.z = s[0] > 0 ? -0.5 : 0.5;
      top.add(beast);
    });
  }
  g.add(top);
  return top;
}

/* 3.3 人字双坡顶（lv1 小屋 / 披屋）：瓦面 + 悬山 + 脊吻 + 封山板 */
function gableRoof(g, x, y, z, w, d, h, o) {
  o = o || {};
  var roofMat = o.roofMat || MAT('#45505c', { map: texTile(), rough: 0.72 });
  var ridgeMat = o.ridgeMat || MAT('#2e353d', { rough: 0.7 });
  var gableMat = o.gableMat || MAT('#9a8a6a', { rough: 0.88 });
  var top = grp(); top.position.set(x, y, z);
  var slope = Math.sqrt(d * d * 0.25 + h * h) + 0.06, ang = Math.atan2(h, d * 0.5);
  var pF = box(w * 1.06, 0.04, slope, roofMat, 0, h * 0.5, d * 0.25); pF.rotation.x = ang; top.add(pF);
  var pB = box(w * 1.06, 0.04, slope, roofMat, 0, h * 0.5, -d * 0.25); pB.rotation.x = -ang; top.add(pB);
  top.add(box(w * 1.08, 0.05, 0.075, ridgeMat, 0, h, 0));
  var f1 = box(0.045, 0.13, 0.07, ridgeMat, -w * 0.54, h + 0.055, 0); f1.rotation.z = 0.5; top.add(f1);
  var f2 = box(0.045, 0.13, 0.07, ridgeMat, w * 0.54, h + 0.055, 0); f2.rotation.z = -0.5; top.add(f2);
  var key = 'gb_' + d + '_' + h;
  if (!GEO[key]) {
    var sh = new THREE.Shape();
    sh.moveTo(-d * 0.5 - 0.02, 0); sh.lineTo(d * 0.5 + 0.02, 0); sh.lineTo(0, h + 0.02); sh.closePath();
    GEO[key] = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
  }
  for (var s = -1; s <= 1; s += 2) {
    var tp = mesh(GEO[key], gableMat);
    tp.rotation.y = PI / 2 * s;
    tp.position.set(s * (w * 0.5 - 0.02), 0, 0);
    top.add(tp);
  }
  g.add(top);
  return top;
}

/* 3.4 月洞门院墙（正面 +z）：贯穿圆洞 + 石压顶 + 门框环 + 两侧回收 */
function courtWall(g, y, z, h, r, opts) {
  opts = opts || {};
  var w = opts.w || 2.2, back = opts.back || 0.4;
  var wallMat = opts.wallMat || MAT('#cfc9b8', { map: texStoneWall(), rough: 0.92 });
  var capMat = opts.capMat || MAT('#8f897b', { rough: 0.9 });
  var wall = grp(); wall.position.set(0, y, z);
  var sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h); sh.lineTo(-w / 2, h); sh.closePath();
  var hole = new THREE.Path();
  hole.absarc(0, r + 0.05, r, 0, PI * 2, true);
  sh.holes.push(hole);
  var key = 'mw_' + w + '_' + h + '_' + r;
  if (!GEO[key]) GEO[key] = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false });
  wall.add(mesh(GEO[key], wallMat));
  wall.add(box(w + 0.06, 0.045, 0.16, capMat, 0, h + 0.022, 0.02));
  wall.add(box(0.07, h + 0.03, 0.14, capMat, -w / 2 - 0.02, h / 2, 0.02));
  wall.add(box(0.07, h + 0.03, 0.14, capMat, w / 2 + 0.02, h / 2, 0.02));
  var rim = mesh(new THREE.TorusGeometry(r + 0.018, 0.02, 6, 24), capMat);
  rim.position.set(0, r + 0.05, 0.055); wall.add(rim);
  wall.add(box(r * 2.2, 0.035, 0.16, capMat, 0, 0.017, 0.02));  /* 门槛石 */
  g.add(wall);
  /* 两侧院墙回收（包住沙盘边） */
  wall.add(box(0.09, h, back, wallMat, -w / 2 - 0.045, h / 2, -back / 2 + 0.05));
  wall.add(box(0.09, h, back, wallMat, w / 2 + 0.045, h / 2, -back / 2 + 0.05));
  wall.add(box(0.16, 0.045, back + 0.08, capMat, -w / 2 - 0.045, h + 0.022, -back / 2 + 0.05));
  wall.add(box(0.16, 0.045, back + 0.08, capMat, w / 2 + 0.045, h + 0.022, -back / 2 + 0.05));
  return wall;
}

/* 3.5 木格花窗：格棂贴图 + 窗台（2 mesh） */
function latticeWindow(w, h, glowMat) {
  var win = grp();
  var back = mesh(new THREE.PlaneGeometry(w, h), glowMat || MAT('#31404c', { map: texLattice(), rough: 0.6 }));
  back.position.z = 0.006; win.add(back);
  win.add(box(w + 0.06, 0.045, 0.03, MAT('#5a4632', { rough: 0.8 }), 0, -h / 2 - 0.03, 0.008));
  return win;
}

/* 3.6 木门 + 门环（原点 = 门底） */
function entryDoor(w, h) {
  var d = grp();
  d.add(box(w, h, 0.045, MAT('#54402c', { rough: 0.82 }), 0, h / 2, 0));
  d.add(box(w * 0.42, h * 0.34, 0.02, MAT('#43321f', { rough: 0.85 }), 0, h * 0.32, 0.026));
  if (!GEO.ring) GEO.ring = new THREE.TorusGeometry(0.028, 0.008, 5, 12);
  for (var s = -1; s <= 1; s += 2) {
    var ring = mesh(GEO.ring, MAT('#3a3f45', { rough: 0.45, metal: 0.6 }));
    ring.position.set(s * w * 0.22, h * 0.52, 0.032);
    d.add(ring);
  }
  d.add(box(w + 0.1, 0.05, 0.055, MAT('#5a4632', { rough: 0.8 }), 0, h + 0.03, 0));
  return d;
}

/* 3.7 红灯笼：金盖金底红穗，呼吸发光 + 轻摆（挂点 = 组原点） */
function lantern(s, phase) {
  var g = grp(); s = s || 1;
  var bm = std('#d6402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.6 });
  g.add(cyl(0.05 * s, 0.062 * s, 0.032 * s, 10, MAT('#d8a63c', { rough: 0.35, metal: 0.75 }), 0, 0.016 * s, 0));
  var body = sph(0.09 * s, bm, 0, -0.07 * s, 0, 12); body.scale.y = 0.86; g.add(body);
  g.add(cyl(0.05 * s, 0.04 * s, 0.03 * s, 10, MAT('#d8a63c', { rough: 0.35, metal: 0.75 }), 0, -0.15 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.07 * s, 6, MAT('#a83b2a', { rough: 0.7 }), 0, -0.2 * s, 0));
  g.add(box(0.02 * s, 0.035 * s, 0.01 * s, MAT('#c8a13c', { rough: 0.6 }), 0, -0.25 * s, 0));
  anim(g, function (t) {
    bm.emissiveIntensity = 0.55 + 0.25 * sin(t * 2.2 + (phase || 0));
    g.rotation.z = 0.06 * sin(t * 1.5 + (phase || 0) * 1.3);
    g.rotation.x = 0.045 * sin(t * 1.2 + (phase || 0) * 2.1);
  });
  return g;
}

/* 3.8 石板径（共享板几何） */
function stonePath(g, y, z0, z1) {
  if (!GEO.slab) GEO.slab = new THREE.BoxGeometry(0.3, 0.024, 0.34);
  var m = MAT('#d5ccb4', { rough: 0.95 });
  var n = 4;
  for (var i = 0; i < n; i++) {
    var t = (i + 0.5) / n;
    var sl = mesh(GEO.slab, m);
    sl.position.set((i % 2 ? 0.05 : -0.04), y + 0.012, z0 + (z1 - z0) * t);
    sl.rotation.y = (i % 2 ? 1 : -1) * 0.06;
    g.add(sl);
  }
}

/* 3.9 绿化：小树 / 花树 / 灌丛 / 山石 / 盆栽 */
function treeSmall(g, x, z, s) {
  s = s || 1;
  var t = grp(); t.position.set(x, 0.098, z);
  t.add(cyl(0.035 * s, 0.05 * s, 0.3 * s, 8, MAT('#6b5138', { rough: 0.9 }), 0, 0.15 * s, 0));
  var cm = MAT('#6c9a52', { rough: 0.95 });
  t.add(sph(0.16 * s, cm, 0, 0.38 * s, 0, 10));
  t.add(sph(0.11 * s, cm, 0.1 * s, 0.3 * s, 0.06 * s, 10));
  t.add(sph(0.09 * s, cm, -0.1 * s, 0.32 * s, -0.05 * s, 10));
  g.add(t); return t;
}
function blossomTree(g, x, z, s) {
  s = s || 1;
  var t = grp(); t.position.set(x, 0.098, z);
  t.add(cyl(0.04 * s, 0.055 * s, 0.34 * s, 8, MAT('#5f4a34', { rough: 0.9 }), 0, 0.17 * s, 0));
  var pm = MAT('#e8a0c0', { rough: 0.9 });
  t.add(sph(0.19 * s, pm, 0.02 * s, 0.46 * s, 0, 10));
  t.add(sph(0.13 * s, pm, -0.13 * s, 0.36 * s, 0.06 * s, 10));
  t.add(sph(0.11 * s, pm, 0.14 * s, 0.35 * s, -0.08 * s, 10));
  t.add(sph(0.08 * s, MAT('#f2bdd6', { rough: 0.9 }), 0.08 * s, 0.55 * s, 0.05 * s, 8));
  g.add(t); return t;
}
function bushAt(g, x, z, s) {
  var b = sph(s, MAT('#557b40', { rough: 0.95 }), x, 0.098 + s * 0.6, z, 10);
  b.scale.y = 0.7; g.add(b); return b;
}
function rockAt(g, x, z, s) {
  if (!GEO.rock) GEO.rock = new THREE.IcosahedronGeometry(1, 0);
  var r = mesh(GEO.rock, MAT('#9a948a', { rough: 0.95 }));
  r.scale.setScalar(s); r.position.set(x, 0.098 + s * 0.5, z);
  g.add(r); return r;
}
function pottedPlant(g, x, z, s) {
  s = s || 1;
  var p = grp(); p.position.set(x, 0.098, z);
  p.add(cyl(0.05 * s, 0.038 * s, 0.08 * s, 10, MAT('#a3502e', { rough: 0.8 }), 0, 0.04 * s, 0));
  p.add(sph(0.06 * s, MAT('#6c9a52', { rough: 0.95 }), 0, 0.11 * s, 0, 8));
  g.add(p); return p;
}

/* 3.10 匾额 */
function plaque(text, w, h) {
  var p = grp();
  p.add(box(w, h, 0.028, MAT('#3a2c1c', { rough: 0.8 }), 0, 0, 0));
  var face = mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.86),
    new THREE.MeshStandardMaterial({ map: texPlaque(text), roughness: 0.6, metalness: 0.05, flatShading: true }));
  face.position.z = 0.016; p.add(face);
  return p;
}

/* 3.11 石狮（lv4 门前） */
function stoneLion(g, x, z, ry) {
  var l = grp(); l.position.set(x, 0.098, z); l.rotation.y = ry || 0;
  var m = MAT('#b5afa0', { rough: 0.9 });
  l.add(box(0.16, 0.05, 0.22, m, 0, 0.025, 0));
  l.add(sph(0.07, m, 0, 0.11, 0.02, 10));
  l.add(sph(0.055, m, 0, 0.2, 0.07, 10));
  l.add(sph(0.018, m, -0.045, 0.245, 0.07, 6));
  l.add(sph(0.018, m, 0.045, 0.245, 0.07, 6));
  g.add(l); return l;
}

/* 暖窗呼吸材质（interaction pass：lv3/lv4 上层住人暖光） */
function glowWindowMat(seedPhase, g) {
  var m = std('#31404c', { map: texLattice(), rough: 0.6, emissive: '#ffb95e', ei: 0.16 });
  anim(g, function (t) { m.emissiveIntensity = 0.16 + 0.14 * sin(t * 1.1 + seedPhase); });
  return m;
}

/* ================= 4. 阶段装配（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：单开间木板小铺（总高 ~1.0） ---- */
function stage1() {
  var g = grp(); g.name = 'prop_1_lv1';
  var ground = basePlatform(g);
  stonePath(g, ground, 1.1, 0.2);
  /* 木板壁小屋（座上落地，台基没入草皮） */
  var hut = grp(); hut.position.set(0, 0, -0.18); g.add(hut);
  hut.add(box(1.1, 0.09, 0.86, MAT('#b5afa0', { rough: 0.9 }), 0, 0.045, 0));
  hut.add(box(0.98, 0.5, 0.76, MAT('#8a7a5f', { map: texPlank(), rough: 0.88 }), 0, 0.34, 0));
  [[-0.49, -0.38], [0.49, -0.38], [-0.49, 0.38], [0.49, 0.38]].forEach(function (c) {
    hut.add(box(0.06, 0.52, 0.06, MAT('#5a4632', { rough: 0.85 }), c[0], 0.35, c[1]));
  });
  var door = entryDoor(0.26, 0.42); door.position.set(-0.16, 0.1, 0.385); hut.add(door);
  var win = latticeWindow(0.22, 0.2); win.position.set(0.3, 0.42, 0.385); hut.add(win);
  gableRoof(hut, 0, 0.62, 0, 1.16, 0.92, 0.28, {});
  /* 灯杆 + 灯笼 */
  var pole = grp(); pole.position.set(0.72, ground, 0.62); g.add(pole);
  pole.add(cyl(0.014, 0.02, 0.5, 8, MAT('#5a4632', { rough: 0.85 }), 0, 0.25, 0));
  pole.add(box(0.2, 0.025, 0.025, MAT('#5a4632', { rough: 0.85 }), -0.09, 0.5, 0));
  var l1 = lantern(0.85, 0.5); l1.position.set(-0.17, 0.49, 0); pole.add(l1);
  /* 月洞门院墙（矮） */
  courtWall(g, ground, 1.02, 0.36, 0.14, { w: 2.2, back: 0.4 });
  /* 绿化 */
  treeSmall(g, -0.86, -0.5, 1.0);
  bushAt(g, 0.8, -0.72, 0.1);
  pottedPlant(g, 0.52, 0.68, 0.9);
  return g;
}

/* ---- lv2 洋房：两层白墙小楼 + 披屋（总高 ~1.55） ---- */
function stage2() {
  var g = grp(); g.name = 'prop_1_lv2';
  var ground = basePlatform(g);
  stonePath(g, ground, 1.08, 0.22);
  var B = grp(); B.position.set(0, 0, -0.14); g.add(B);
  /* 台基 + 一层店面 */
  B.add(box(1.52, 0.1, 1.0, MAT('#b5afa0', { rough: 0.9 }), 0, 0.05, 0));
  B.add(box(1.44, 0.52, 0.92, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.36, 0));
  B.add(box(1.5, 0.07, 0.98, MAT('#8f897b', { rough: 0.9 }), 0, 0.135, 0));
  var w1 = latticeWindow(0.3, 0.28); w1.position.set(-0.34, 0.4, 0.465); B.add(w1);
  var w2 = latticeWindow(0.3, 0.28); w2.position.set(0.34, 0.4, 0.465); B.add(w2);
  B.add(box(0.9, 0.1, 0.12, MAT('#7a5f42', { rough: 0.85 }), 0, 0.21, 0.52));
  B.add(sph(0.05, MAT('#a3502e', { rough: 0.8 }), -0.28, 0.31, 0.52, 8));
  B.add(sph(0.04, MAT('#8a8478', { rough: 0.8 }), 0.25, 0.305, 0.52, 8));
  /* 蓝布雨棚 */
  var aw = box(1.06, 0.02, 0.3, MAT('#5b7f9c', { rough: 0.85 }), 0, 0.66, 0.6);
  aw.rotation.x = 0.42; B.add(aw);
  B.add(box(1.06, 0.05, 0.02, MAT('#4c6c86', { rough: 0.85 }), 0, 0.615, 0.74));
  /* 二层 + 挑廊 */
  B.add(box(1.38, 0.42, 0.88, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.83, -0.02));
  B.add(box(1.44, 0.05, 0.94, MAT('#6b5138', { rough: 0.85 }), 0, 0.645, 0));
  var rail = grp(); rail.position.set(0, 1.04, 0.46); B.add(rail);
  rail.add(box(1.2, 0.035, 0.035, MAT('#7a5f42', { rough: 0.85 }), 0, 0, 0));
  rail.add(box(1.2, 0.03, 0.03, MAT('#7a5f42', { rough: 0.85 }), 0, -0.14, 0));
  for (var i = -2; i <= 2; i++) rail.add(box(0.03, 0.15, 0.03, MAT('#7a5f42', { rough: 0.85 }), i * 0.28, -0.07, 0));
  var w3 = latticeWindow(0.26, 0.24); w3.position.set(0, 0.88, 0.425); B.add(w3);
  /* 主屋顶：庑殿起翘 */
  hipRoof(B, 0, 1.07, -0.02, 1.56, 1.02, 0.32, { lift: 0.09 });
  /* 右侧披屋 */
  var wing = grp(); wing.position.set(0.82, ground, -0.3); g.add(wing);
  wing.add(box(0.42, 0.4, 0.52, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.2, 0));
  var ww = latticeWindow(0.16, 0.16); ww.position.set(0, 0.24, 0.265); wing.add(ww);
  gableRoof(wing, 0, 0.4, 0, 0.5, 0.6, 0.16, { roofMat: MAT('#414b57', { map: texTile(), rough: 0.72 }) });
  /* 灯笼 ×3（檐下 ×2 + 门杆 ×1） */
  var la1 = lantern(0.9, 0.3); la1.position.set(-0.62, 1.02, 0.4); g.add(la1);
  var la2 = lantern(0.9, 2.1); la2.position.set(0.62, 1.02, 0.4); g.add(la2);
  var pole = grp(); pole.position.set(-0.86, ground, 0.72); g.add(pole);
  pole.add(cyl(0.014, 0.018, 0.52, 8, MAT('#5a4632', { rough: 0.85 }), 0, 0.26, 0));
  var la3 = lantern(0.8, 1.2); la3.position.set(0.05, 0.5, 0); pole.add(la3);
  /* 月洞门院墙（中） */
  courtWall(g, ground, 1.0, 0.44, 0.16, { w: 2.2, back: 0.4 });
  /* 绿化 */
  treeSmall(g, -0.9, -0.6, 1.05);
  pottedPlant(g, -0.52, 0.72, 0.9);
  pottedPlant(g, 0.5, 0.7, 0.8);
  bushAt(g, 0.88, -0.78, 0.09);
  return g;
}

/* ---- lv3 大厦：三层主楼 + 耳房 + 匾额（总高 ~2.05） ---- */
function stage3() {
  var g = grp(); g.name = 'prop_1_lv3';
  var ground = basePlatform(g);
  stonePath(g, ground, 1.06, 0.24);
  var B = grp(); B.position.set(0, 0, -0.1); g.add(B);
  var glowMat = glowWindowMat(0.8, g);
  /* 台基 + 一层门厅 */
  B.add(box(1.5, 0.1, 1.04, MAT('#b5afa0', { rough: 0.9 }), 0, 0.05, 0));
  B.add(box(1.44, 0.52, 0.96, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.36, 0));
  B.add(box(1.5, 0.07, 1.02, MAT('#8f897b', { rough: 0.9 }), 0, 0.135, 0));
  var door = entryDoor(0.3, 0.42); door.position.set(0, 0.1, 0.485); B.add(door);
  var plq = plaque('平江', 0.3, 0.11); plq.position.set(0, 0.64, 0.5); B.add(plq);
  var wA = latticeWindow(0.22, 0.2); wA.position.set(-0.42, 0.42, 0.485); B.add(wA);
  var wB = latticeWindow(0.22, 0.2); wB.position.set(0.42, 0.42, 0.485); B.add(wB);
  /* 二层：挑廊 + 暖格窗 */
  B.add(box(1.36, 0.44, 0.9, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.84, -0.03));
  var bal = grp(); bal.position.set(0, 0.66, 0.42); B.add(bal);
  bal.add(box(1.24, 0.04, 0.09, MAT('#6b5138', { rough: 0.85 }), 0, 0, 0));
  bal.add(box(1.24, 0.035, 0.035, MAT('#7a5f42', { rough: 0.85 }), 0, 0.16, 0.02));
  for (var i = -3; i <= 3; i++) bal.add(box(0.028, 0.14, 0.028, MAT('#7a5f42', { rough: 0.85 }), i * 0.19, 0.08, 0.02));
  var w2a = latticeWindow(0.24, 0.24, glowMat); w2a.position.set(-0.3, 0.88, 0.425); B.add(w2a);
  var w2b = latticeWindow(0.24, 0.24, glowMat); w2b.position.set(0.3, 0.88, 0.425); B.add(w2b);
  /* 三层 */
  B.add(box(1.34, 0.05, 0.9, MAT('#6b5138', { rough: 0.85 }), 0, 1.075, -0.03));
  B.add(box(1.28, 0.4, 0.84, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 1.3, -0.06));
  var w3a = latticeWindow(0.22, 0.22, glowMat); w3a.position.set(-0.26, 1.32, 0.365); B.add(w3a);
  var w3b = latticeWindow(0.22, 0.22, glowMat); w3b.position.set(0.26, 1.32, 0.365); B.add(w3b);
  /* 大庑殿顶 + 角兽 */
  hipRoof(B, 0, 1.51, -0.06, 1.62, 1.12, 0.38, { lift: 0.11, beasts: 1 });
  /* 右耳房 */
  var wing = grp(); wing.position.set(0.88, ground, -0.26); g.add(wing);
  wing.add(box(0.52, 0.05, 0.62, MAT('#8f897b', { rough: 0.9 }), 0, 0.025, 0));
  wing.add(box(0.46, 0.62, 0.56, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.36, 0));
  var ww1 = latticeWindow(0.18, 0.18); ww1.position.set(0, 0.44, 0.285); wing.add(ww1);
  var ww2 = latticeWindow(0.18, 0.18); ww2.position.set(0, 0.2, 0.285); wing.add(ww2);
  gableRoof(wing, 0, 0.67, 0, 0.54, 0.64, 0.18, { roofMat: MAT('#414b57', { map: texTile(), rough: 0.72 }) });
  /* 灯笼 ×4（两层檐下） */
  var l1 = lantern(0.85, 0.2); l1.position.set(-0.64, 1.4, 0.42); g.add(l1);
  var l2 = lantern(0.85, 1.7); l2.position.set(0.64, 1.4, 0.42); g.add(l2);
  var l3 = lantern(0.8, 3.1); l3.position.set(-0.5, 0.64, 0.5); g.add(l3);
  var l4 = lantern(0.8, 4.2); l4.position.set(0.5, 0.64, 0.5); g.add(l4);
  /* 月洞门院墙（高） */
  courtWall(g, ground, 0.98, 0.48, 0.17, { w: 2.2, back: 0.38 });
  /* 爬藤 + 绿化 */
  var vine = grp(); vine.position.set(-0.66, ground, 0.3); g.add(vine);
  vine.add(sph(0.09, MAT('#557b40', { rough: 0.95 }), -0.1, 0.3, 0, 8));
  vine.add(sph(0.07, MAT('#6c9a52', { rough: 0.95 }), 0.05, 0.42, 0.06, 8));
  pottedPlant(g, -0.5, 0.74, 1.0);
  pottedPlant(g, 0.46, 0.76, 0.9);
  bushAt(g, 0.92, -0.8, 0.1);
  bushAt(g, -0.94, -0.7, 0.08);
  return g;
}

/* ---- lv4 地标：三重檐红柱地标建筑群（总高 ~2.85） ---- */
function stage4() {
  var g = grp(); g.name = 'prop_1_lv4';
  var ground = basePlatform(g);
  stonePath(g, ground, 1.04, 0.26);
  var B = grp(); B.position.set(0, 0, -0.06); g.add(B);
  var red = MAT('#a83b2a', { rough: 0.45 });
  var gold = MAT('#d8a63c', { rough: 0.32, metal: 0.75 });
  var plaster = MAT('#edefe3', { map: texPlaster(), rough: 0.9 });
  if (!GEO.col) GEO.col = new THREE.CylinderGeometry(0.032, 0.038, 0.54, 12);
  var glowMat = glowWindowMat(1.4, g);
  /* 台基 + 门前石阶 */
  B.add(box(1.74, 0.12, 1.18, MAT('#b5afa0', { rough: 0.9 }), 0, 0.06, 0));
  B.add(box(1.66, 0.06, 1.1, MAT('#8f897b', { rough: 0.9 }), 0, 0.15, 0));
  B.add(box(0.94, 0.05, 0.16, MAT('#c9c3b2', { rough: 0.92 }), 0, 0.185, 0.62));
  B.add(box(0.94, 0.05, 0.16, MAT('#c9c3b2', { rough: 0.92 }), 0, 0.135, 0.74));
  B.add(box(0.94, 0.05, 0.16, MAT('#c9c3b2', { rough: 0.92 }), 0, 0.085, 0.86));
  /* 一层：白墙 + 红柱廊（0.17..0.77，下沉入屋面防穿缝） */
  B.add(box(1.56, 0.6, 1.0, plaster, 0, 0.47, -0.04));
  var colX = [-0.62, -0.21, 0.21, 0.62];
  colX.forEach(function (x) {
    var c = mesh(GEO.col, red); c.position.set(x, 0.46, 0.47); B.add(c);
    B.add(box(0.075, 0.05, 0.075, gold, x, 0.75, 0.47));
  });
  var door = entryDoor(0.34, 0.46); door.position.set(0, 0.18, 0.475); B.add(door);
  var plq = plaque('平江府', 0.4, 0.13); plq.position.set(0, 0.71, 0.5); B.add(plq);
  var wa1 = latticeWindow(0.2, 0.22, glowMat); wa1.position.set(-0.5, 0.5, 0.468); B.add(wa1);
  var wa2 = latticeWindow(0.2, 0.22, glowMat); wa2.position.set(0.5, 0.5, 0.468); B.add(wa2);
  var wa3 = latticeWindow(0.2, 0.22, glowMat); wa3.position.set(-0.785, 0.5, -0.04); wa3.rotation.y = PI / 2; B.add(wa3);
  var wa4 = latticeWindow(0.2, 0.22, glowMat); wa4.position.set(0.785, 0.5, -0.04); wa4.rotation.y = -PI / 2; B.add(wa4);
  /* 一重檐（金脊兽） */
  hipRoof(B, 0, 0.78, -0.04, 1.8, 1.24, 0.3, { lift: 0.12, gold: true, beasts: 2, ornMat: gold });
  /* 二层：红柱平座 + 栏杆（0.82..1.40，底沉入一重檐屋面） */
  B.add(box(1.3, 0.58, 0.94, plaster, 0, 1.11, -0.05));
  [-0.5, -0.17, 0.17, 0.5].forEach(function (x) {
    var c = mesh(GEO.col, red); c.scale.set(0.9, 0.8, 0.9);
    c.position.set(x, 1.16, 0.42); B.add(c);
    B.add(box(0.065, 0.045, 0.065, gold, x, 1.41, 0.42));
  });
  var rail2 = grp(); rail2.position.set(0, 0.99, 0.46); B.add(rail2);
  rail2.add(box(1.34, 0.035, 0.035, red, 0, 0, 0));
  rail2.add(box(1.34, 0.028, 0.028, red, 0, -0.12, 0));
  for (var i = -3; i <= 3; i++) rail2.add(box(0.026, 0.12, 0.026, red, i * 0.2, -0.06, 0));
  var w2a = latticeWindow(0.22, 0.22, glowMat); w2a.position.set(-0.28, 1.2, 0.425); B.add(w2a);
  var w2b = latticeWindow(0.22, 0.22, glowMat); w2b.position.set(0.28, 1.2, 0.425); B.add(w2b);
  /* 二重檐 */
  hipRoof(B, 0, 1.43, -0.05, 1.42, 1.0, 0.28, { lift: 0.1, gold: true, beasts: 2, ornMat: gold });
  /* 三层（1.40..1.96，底沉入二重檐屋面） */
  B.add(box(0.96, 0.56, 0.74, plaster, 0, 1.68, -0.05));
  [-0.34, 0.34].forEach(function (x) {
    var c = mesh(GEO.col, red); c.scale.set(0.85, 0.68, 0.85);
    c.position.set(x, 1.76, 0.33); B.add(c);
    B.add(box(0.06, 0.04, 0.06, gold, x, 1.96, 0.33));
  });
  var w3a = latticeWindow(0.2, 0.2, glowMat); w3a.position.set(0, 1.8, 0.335); B.add(w3a);
  /* 三重檐 + 金宝顶 */
  hipRoof(B, 0, 1.98, -0.05, 1.06, 0.8, 0.3, { lift: 0.1, gold: true, beasts: 1, ornMat: gold });
  B.add(cyl(0.012, 0.012, 0.14, 8, gold, 0, 2.34, -0.05));
  B.add(sph(0.05, gold, 0, 2.43, -0.05, 12));
  B.add(cone(0.035, 0.07, 10, gold, 0, 2.5, -0.05));
  /* 灯笼 ×8（三重檐下 ×6 + 院门 ×2） */
  [[-0.8, 0.66, 0.56, 0.2], [0.8, 0.66, 0.56, 1.4], [-0.62, 1.32, 0.48, 2.6], [0.62, 1.32, 0.48, 3.5],
   [-0.44, 1.88, 0.4, 4.6], [0.44, 1.88, 0.4, 0.9]].forEach(function (p) {
    var l = lantern(0.8, p[3]); l.position.set(p[0], p[1], p[2]); g.add(l);
  });
  var lg1 = lantern(0.9, 2.0); lg1.position.set(-1.0, 0.72, 0.94); g.add(lg1);
  var lg2 = lantern(0.9, 3.3); lg2.position.set(1.0, 0.72, 0.94); g.add(lg2);
  /* 月洞门院墙（地标级） */
  courtWall(g, ground, 0.96, 0.52, 0.18, { w: 2.16, back: 0.36 });
  /* 石狮 */
  stoneLion(g, -0.42, 0.76, 0.5);
  stoneLion(g, 0.42, 0.76, -0.5);
  /* 花树 + 绿化 + 山石 */
  blossomTree(g, 0.92, -0.62, 1.15);
  bushAt(g, -0.94, -0.6, 0.11);
  bushAt(g, 0.6, 0.78, 0.08);
  bushAt(g, -0.88, 0.42, 0.09);
  rockAt(g, -1.02, -0.78, 0.07);
  rockAt(g, 1.06, -0.3, 0.055);
  pottedPlant(g, -0.5, 0.66, 1.0);
  pottedPlant(g, 0.55, 0.68, 0.85);
  return g;
}

/* ================= 5. 出口 ================= */
window.Props3D[1] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0));
  var g;
  if (lv === 1) g = stage1();
  else if (lv === 2) g = stage2();
  else if (lv === 3) g = stage3();
  else g = stage4();
  g.userData.propId = 1;
  g.userData.level = lv;
  return g;
};

})();
