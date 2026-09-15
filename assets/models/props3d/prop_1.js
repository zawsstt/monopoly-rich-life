/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_1.js  格 1「南锣鼓巷」个性化地产（v2 精修版）
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/prop_1.png（京派胡同四阶生长谱系，取正面视角），在 v1 已验收的
 * 整体形态 / 配色 / 布局 / 契约基础上做二次精修，不推翻、不砍件。
 *
 *   window.Props3D[1](level 1..4) → THREE.Group（含草地沙盘地坪，底面贴 y=0，正面朝 +Z）
 *
 * v2 精修主线（对照 v1 差距清单逐条清偿）：
 *   1) 灰瓦瓦垄逐垄立体：新增 eaveBandGeo 檐口瓦垄带（单 BufferGeometry 半圆垄列），
 *      lv3/lv4 大屋面加中腰第二道瓦垄；屋顶贴图升级 512px，垄距与瓦垄带对齐。
 *   2) 正脊精修：两端吻兽改「吻座 + 昂首 + 卷尾」三段式（chiwen）；脊中加宝相中饰
 *      （ridgeFinial）；lv4 金脊吻兽 + 顶部金宝顶增环饰与顶珠。
 *   3) 院墙墙帽双层 + 瓦垄条；月洞门加石门框、门簪（cap/full）、门楼小披檐（cap/full）、
 *      门匾（lv4）。
 *   4) 木构架：各层转角木柱 + 檐枋 + 雀替榫卯节点（timberFrame）；lv4 用红柱。
 *   5) 木格窗棂：512px 分格加密（步步锦斜格）+ 3D 挤出边框 + 窗台。
 *   6) 石狮：双层须弥座 + 鬃毛卷 + 前腿 + 眉眼 + 尾卷（stoneLion v2）。
 *   7) 灯笼：挂环 + 三道经向骨架 + 上下金箍金盘 + 双股穗 + 坠珠（lantern v2）。
 *   8) 石板径：错缝变宽石板 + 板缝草簇 + 路缘卵石（固定表驱动，无随机）。
 *   9) 木门：上下抹头 + 门钉/门枕石（lv4）；全部圆柱 ≥12 段、球 ≥16×12 段。
 *
 * 风格族谱（同一块地、同一语言的生长史，与 v1 一致）：
 *   固定语汇 = 灰瓦曲坡顶(瓦垄/檐角起翘/正脊吻) + 白墙黛瓦木构架 + 月洞门院墙
 *              + 红灯笼 + 石板径 + 圆角草地沙盘基座
 *   lv1 小屋   ：木板壁单开间小铺，悬山瓦顶，矮院墙 + 月洞门，1 灯 1 树
 *   lv2 洋房   ：两层白墙小楼（下层店面 + 蓝布雨棚 + 挑廊），右侧披屋，庑殿顶起翘，3 灯
 *   lv3 大厦   ：三层主楼 + 中层挑廊 + 右耳房，大庑殿顶 + 角兽，匾额，4 灯，暖窗
 *   lv4 地标   ：三重檐红柱地标（金脊兽/宝顶），石狮/石阶/花树点缀，8 灯，完整院落
 *
 * 约束：占地 ≤2.6×2.6；高度 lv1 0.8-1.2 / lv2 1.2-1.7 / lv3 1.7-2.3 / lv4 2.3-3.0；
 *       每级 ≤350 mesh；纹理全部 Canvas 程序化（≤512px）；userData.anim=[fn(t,dt)]。
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

/* ================= 1. Canvas 程序化纹理（≤512px，懒建单例） ================= */
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

/* 灰瓦垄（512px）：纵向瓦楞（顺坡）+ 横向仰瓦瓦行；pitchPx 决定每重复单元的垄距 */
function texTile(pitchPx) {
  var key = 'tile' + pitchPx;
  return cvTex(key, 512, 512, function (g, w, h) {
    var p = pitchPx || 32;
    g.fillStyle = '#3f4a54'; g.fillRect(0, 0, w, h);
    var x;
    for (x = 0; x < w; x += p) {
      g.fillStyle = '#2b333b'; g.fillRect(x, 0, 3, h);                    /* 垄沟 */
      g.fillStyle = '#4b5865'; g.fillRect(x + 3, 0, p - 6, h);            /* 垄身 */
      g.fillStyle = '#5a6875'; g.fillRect(x + Math.round(p * 0.3), 0, 5, h); /* 受光 */
      g.fillStyle = '#39434d'; g.fillRect(x + p - 5, 0, 5, h);
    }
    var y;
    for (y = 0; y < h; y += 64) {                                          /* 瓦行搭接 */
      g.fillStyle = 'rgba(25,31,38,0.5)'; g.fillRect(0, y, w, 4);
      g.fillStyle = 'rgba(130,145,158,0.30)'; g.fillRect(0, y + 4, w, 3);
    }
    var i;
    for (i = 0; i < 70; i++) {                                             /* 风化斑 */
      g.fillStyle = i % 2 ? 'rgba(24,30,36,0.10)' : 'rgba(120,134,146,0.10)';
      g.fillRect((i * 83) % w, (i * 97) % h, 10 + (i * 13) % 26, 6 + (i * 7) % 16);
    }
  });
}
/* 白灰墙：斑驳 + 底部水渍（512px 细化） */
var texPlaster = function () {
  return cvTex('plaster', 512, 512, function (g, w, h) {
    g.fillStyle = '#edefe3'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 130; i++) {
      g.fillStyle = i % 2 ? 'rgba(210,213,196,0.45)' : 'rgba(245,247,238,0.55)';
      g.fillRect((i * 149) % w, (i * 211) % h, 16 + (i * 29) % 40, 10 + (i * 17) % 28);
    }
    for (i = 0; i < 10; i++) {
      g.fillStyle = 'rgba(160,162,146,0.25)';
      g.fillRect(20 + i * 48, 330 + (i % 4) * 22, 6, 90 + (i % 3) * 30);
    }
    g.fillStyle = 'rgba(150,152,136,0.30)'; g.fillRect(0, h - 40, w, 40);
  });
};
/* 竖木板壁（lv1 小屋，512px 木纹加密） */
var texPlank = function () {
  return cvTex('plank', 512, 512, function (g, w, h) {
    var x;
    for (x = 0; x < w; x += 64) {
      g.fillStyle = ((x / 64) % 2) ? '#8a7a5f' : '#7f704f'; g.fillRect(x, 0, 64, h);
      g.fillStyle = 'rgba(52,42,26,0.75)'; g.fillRect(x, 0, 3, h);
      g.fillStyle = 'rgba(66,54,34,0.4)';
      var k;
      for (k = 0; k < 14; k++) g.fillRect(x + 6 + (k * 17) % 50, (k * 61 + x) % h, 2, 12 + (k * 13) % 30);
      g.fillStyle = 'rgba(255,236,200,0.08)'; g.fillRect(x + 8, 0, 5, h);
    }
  });
};
/* 院墙石砌块（512px，灰砖错缝） */
var texStoneWall = function () {
  return cvTex('stonewall', 512, 512, function (g, w, h) {
    g.fillStyle = '#ccc6b5'; g.fillRect(0, 0, w, h);
    var r;
    for (r = 0; r < 8; r++) {
      var y = r * 64, off = (r % 2) * 32;
      g.fillStyle = 'rgba(120,114,100,0.6)'; g.fillRect(0, y + 62, w, 3);
      var x;
      for (x = -32; x < w; x += 64) {
        g.fillRect(x + off, y, 3, 62);
        if ((((x + off) / 8 | 0) + r) % 3 === 0) {
          g.fillStyle = 'rgba(148,142,126,0.4)'; g.fillRect(x + off + 3, y, 61, 62);
          g.fillStyle = 'rgba(120,114,100,0.6)';
        }
        if ((((x + off) / 16 | 0) + r) % 4 === 1) {
          g.fillStyle = 'rgba(104,100,90,0.22)'; g.fillRect(x + off + 10, y + 12, 26, 20);
          g.fillStyle = 'rgba(120,114,100,0.6)';
        }
      }
    }
  });
};
/* 木格花窗（512px 分格加密：步步锦斜格） */
var texLattice = function () {
  return cvTex('lattice', 512, 512, function (g, w, h) {
    g.fillStyle = '#1c231f'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(150,190,170,0.16)'; g.fillRect(16, 16, w - 32, h - 32);
    g.strokeStyle = '#4a3826'; g.lineWidth = 4;
    var i;
    for (i = 0; i < 10; i++) {                       /* 斜格（菱形）底层 */
      g.beginPath(); g.moveTo(i * 56 - 40, 0); g.lineTo(i * 56 + 216, h); g.stroke();
      g.beginPath(); g.moveTo(i * 56 + 216, 0); g.lineTo(i * 56 - 40, h); g.stroke();
    }
    g.fillStyle = '#55412d';                          /* 直棂井字格（面层） */
    for (i = 0; i <= 7; i++) g.fillRect(i * 64 - 4, 0, 8, h);
    for (i = 0; i <= 6; i++) g.fillRect(0, i * 78 + 30, w, 8);
    g.fillStyle = '#4a3826';                          /* 外框 */
    g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14);
    g.fillRect(0, 0, 14, h); g.fillRect(w - 14, 0, 14, h);
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
  return cvTex('grass', 256, 256, function (g, w, h) {
    g.fillStyle = '#7ca25b'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) {
      g.fillStyle = i % 3 ? 'rgba(96,138,66,0.5)' : 'rgba(140,172,104,0.5)';
      g.fillRect((i * 83) % w, (i * 127) % h, 10 + (i * 13) % 20, 8 + (i * 11) % 14);
    }
  });
};

/* ================= 2. Kit 层图元（段数下限：柱 12 / 球 16×12） ================= */
function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg || 12)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z, seg) { seg = Math.max(16, seg || 16); var o = mesh(new THREE.SphereGeometry(r, seg, Math.max(12, seg - 4)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, Math.max(12, seg || 12)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function anim(g, fn) { (g.userData.anim || (g.userData.anim = [])).push(fn); }

/* 圆角矩形 Shape（沙盘基座） */
function roundedRectShape(w, d, r) {
  var s = new THREE.Shape(), x = -w / 2, y = -d / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + d - r); s.quadraticCurveTo(x + w, y + d, x + w - r, y + d);
  s.lineTo(x, y + d); s.quadraticCurveTo(x, y + d, x, y + d - r);
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

/* 3.1b 檐口瓦垄带：沿檐口一周/一线的半圆瓦垄列（单 BufferGeometry → 逐垄立体只花 1 mesh）
 * pts  ：檐口折线顶点 [[x,y,z]...]（closed 时首尾自动闭合）
 * apex ：屋脊参考点 [x,y,z]；axis='x'|'z' 时屋脊为过 apex 的水平线（人字顶） */
function eaveBandGeo(pts, o) {
  o = o || {};
  var closed = o.closed !== false;
  var n = pts.length, segs = closed ? n : n - 1, i, j;
  var lens = [], per = 0;
  for (i = 0; i < segs; i++) {
    var a = pts[i], b = pts[(i + 1) % n];
    var dx = b[0] - a[0], dz = b[2] - a[2];
    var l = Math.sqrt(dx * dx + dz * dz);
    lens.push(l); per += l;
  }
  var lobes = Math.max(4, Math.round(per / (o.pitch || 0.075)));
  var M = Math.min(lobes * 3, 192);
  var apex = o.apex || [0, 1, 0];
  var axis = o.axis || null;
  var lift = (o.lift !== undefined ? o.lift : 0.014);
  var lobe = (o.lobe !== undefined ? o.lobe : 0.02);
  var s0 = -(o.hang !== undefined ? o.hang : 0.12), s1 = (o.len !== undefined ? o.len : 0.2);
  var pos = [], uv = [], idx = [];
  for (j = 0; j <= M; j++) {
    var u = j / M, target = u * per;
    var acc = 0, si = segs - 1, tl = lens[segs - 1];
    for (i = 0; i < segs; i++) {
      if (acc + lens[i] >= target) { si = i; tl = target - acc; break; }
      acc += lens[i];
    }
    var pa = pts[si], pb = pts[(si + 1) % n];
    var tt = lens[si] > 1e-6 ? tl / lens[si] : 0;
    var px = pa[0] + (pb[0] - pa[0]) * tt, py = pa[1] + (pb[1] - pa[1]) * tt, pz = pa[2] + (pb[2] - pa[2]) * tt;
    var ex = pb[0] - pa[0], ez = pb[2] - pa[2], el = Math.sqrt(ex * ex + ez * ez) || 1;
    var nx = ez / el, nz = -ex / el;
    if (nx * px + nz * pz < 0) { nx = -nx; nz = -nz; }         /* 法线朝外 */
    var rx = (axis === 'x') ? px : apex[0], rz = (axis === 'z') ? pz : apex[2];
    var dxx = rx - px, dzz = rz - pz, dl = Math.sqrt(dxx * dxx + dzz * dzz) || 1;
    dxx /= dl; dzz /= dl;                                       /* 上坡方向（水平） */
    var slopeY = Math.max(0.15, Math.min(2.4, (apex[1] - py) / dl));
    var ph = (u * lobes) % 1, prof = Math.sin(ph * PI);         /* 半圆垄剖面 */
    for (var r = 0; r < 2; r++) {
      var s = r ? s1 : s0;
      var off = lift + lobe * prof;
      pos.push(px + nx * off + dxx * s, py + 0.006 + slopeY * s + off * 0.35, pz + nz * off + dzz * s);
      uv.push(u * lobes / 16, r ? 1 : 0.8);                     /* 16 垄 / 贴图重复 */
    }
  }
  for (j = 0; j < M; j++) {
    var a0 = j * 2, b0 = j * 2 + 1, a1 = j * 2 + 2, b1 = j * 2 + 3;
    idx.push(a0, b0, a1, b0, b1, a1);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
var bandMat = null;
function getBandMat() {
  if (!bandMat) bandMat = MAT('#414c58', { map: texTile(32), rough: 0.72, side: THREE.DoubleSide });
  return bandMat;
}

/* 3.2 曲坡庑殿顶：凹曲屋面 + 檐角起翘 + 正脊吻兽 + 檐口瓦垄带（风格主签名） */
function hipRoofGeo(w, d, h, lift) {
  var hw = w / 2, hd = d / 2;
  var corners = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]];
  var ring = [], i, e, k, t;
  var SEG = 6;
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
  var pos = [], uv = [], uScale = acc * 0.8333, vScale = 3.0;   /* 垄距与瓦垄带对齐 */
  function vOf(y) { return (h - y) / slope * vScale; }
  var SKIRT = 0.045;
  for (i = 0; i < n; i++) {
    var pp = ring[i], qq = ring[(i + 1) % n];
    pos.push(0, h, 0, qq[0], qq[1], qq[2], pp[0], pp[1], pp[2]);
    uv.push(u[i + 1] * uScale, vOf(h), 0, u[i + 1] * uScale, vOf(qq[1]), 0, u[i] * uScale, vOf(pp[1]), 0);
    var qyb = qq[1] - SKIRT, pyb = pp[1] - SKIRT;
    pos.push(qq[0], qq[1], qq[2], qq[0], qyb, qq[2], pp[0], pp[1], pp[2]);
    uv.push(u[i + 1] * uScale, 0.9, 0, u[i + 1] * uScale, 1.0, 0, u[i] * uScale, 0.9, 0);
    pos.push(qq[0], qyb, qq[2], pp[0], pyb, pp[2], pp[0], pp[1], pp[2]);
    uv.push(u[i + 1] * uScale, 1.0, 0, u[i] * uScale, 1.0, 0, u[i] * uScale, 0.9, 0);
    pos.push(qq[0], qyb, qq[2], pp[0], pyb, pp[2], qq[0], qq[1], qq[2]);
    uv.push(0, 0, 0, 1, 0, 0, 1, 1, 0);
    pos.push(pp[0], pyb, pp[2], pp[0], pp[1], pp[2], qq[0], qq[1], qq[2]);
    uv.push(0, 0, 0, 1, 0, 0, 1, 1, 0);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 3));
  g.computeVertexNormals();
  return { geo: g, ring: ring };
}
/* 正脊吻兽（三段式：吻座 + 昂身 + 卷尾），dir=±1 控制朝向 */
function chiwen(mat, s, dir) {
  var c = grp();
  c.add(box(0.05 * s, 0.04 * s, 0.055 * s, mat, 0, 0.018 * s, 0));
  var body = cone(0.026 * s, 0.12 * s, 12, mat, 0, 0.085 * s, 0);
  body.rotation.z = -0.42 * dir; c.add(body);
  c.add(sph(0.023 * s, mat, 0.032 * s * dir, 0.125 * s, 0, 12));
  c.add(sph(0.014 * s, mat, 0.05 * s * dir, 0.098 * s, 0, 12));
  return c;
}
/* 脊中宝相中饰（底座 + 宝珠 + 相轮尖） */
function ridgeFinial(mat, s) {
  var f = grp();
  f.add(cyl(0.03 * s, 0.042 * s, 0.025 * s, 12, mat, 0, 0.012 * s, 0));
  f.add(sph(0.024 * s, mat, 0, 0.048 * s, 0, 12));
  f.add(cone(0.015 * s, 0.032 * s, 12, mat, 0, 0.082 * s, 0));
  return f;
}
function hipRoof(g, x, y, z, w, d, h, o) {
  o = o || {};
  var lift = (o.lift !== undefined ? o.lift : Math.min(w, d) * 0.11);
  var roofMat = o.roofMat || MAT('#45505c', { map: texTile(32), rough: 0.72, side: THREE.DoubleSide });
  var ridgeMat = o.ridgeMat || MAT('#2e353d', { rough: 0.7 });
  var ornMat = o.ornMat || ridgeMat;
  var top = grp(); top.position.set(x, y, z);
  var key = 'hr2_' + w + '_' + d + '_' + h + '_' + lift + '_' + (o.mid ? 1 : 0);
  if (!GEO[key]) {
    var built = hipRoofGeo(w, d, h, lift);
    var bandPts = built.ring.map(function (p) { return [p[0], p[1], p[2]]; });
    var item = { geo: built.geo, band: eaveBandGeo(bandPts, { closed: true, apex: [0, h, 0], len: 0.2, hang: 0.12, lobe: 0.02, lift: 0.014, pitch: 0.075 }) };
    if (o.mid) {
      var mid = built.ring.map(function (p) { return [p[0] * 0.5, p[1] + (h - p[1]) * 0.5, p[2] * 0.5]; });
      item.mid = eaveBandGeo(mid, { closed: true, apex: [0, h, 0], len: 0.16, hang: 0.05, lobe: 0.017, lift: 0.011, pitch: 0.075 });
    }
    GEO[key] = item;
  }
  var item = GEO[key];
  top.add(mesh(item.geo, roofMat));
  top.add(mesh(item.band, getBandMat()));
  if (item.mid) top.add(mesh(item.mid, getBandMat()));
  /* 正脊 + 两端三段式吻兽 + 脊中宝相 */
  var rl = Math.max(w - d, w * 0.34);
  top.add(box(rl, 0.055, 0.085, ridgeMat, 0, h + 0.02, 0));
  var cw1 = chiwen(ornMat, o.cw || 1, -1); cw1.position.set(-rl / 2, h + 0.045, 0); top.add(cw1);
  var cw2 = chiwen(ornMat, o.cw || 1, 1); cw2.position.set(rl / 2, h + 0.045, 0); top.add(cw2);
  var fin = ridgeFinial(ornMat, o.cw || 1); fin.position.set(0, h + 0.05, 0); top.add(fin);
  if (o.gold) {
    top.add(box(rl * 0.96, 0.02, 0.02, ornMat, 0, h + 0.055, 0));
  }
  if (o.beasts) {
    var nb = o.beasts === 2 ? 2 : 4, bw = w / 2 - 0.04, bd = d / 2 - 0.04;
    var spots = nb === 4 ? [[bw, bd], [-bw, bd], [bw, -bd], [-bw, -bd]] : [[bw, bd], [-bw, bd]];
    spots.forEach(function (s) {
      var beast = cone(0.033, 0.09, 12, ornMat, 0, 0, 0);
      beast.position.set(s[0], lift + 0.045, s[1]);
      beast.rotation.z = s[0] > 0 ? -0.5 : 0.5;
      top.add(beast);
      if (o.beastHead !== false) top.add(sph(0.014, ornMat, s[0] + (s[0] > 0 ? 0.02 : -0.02), lift + 0.09, s[1], 12));
    });
  }
  g.add(top);
  return top;
}

/* 3.3 人字双坡顶（lv1 小屋 / 披屋）：瓦面 + 檐口瓦垄带 + 吻兽 + 中饰 + 封山板 */
function gableRoof(g, x, y, z, w, d, h, o) {
  o = o || {};
  var roofMat = o.roofMat || MAT('#45505c', { map: texTile(32), rough: 0.72 });
  var ridgeMat = o.ridgeMat || MAT('#2e353d', { rough: 0.7 });
  var gableMat = o.gableMat || MAT('#9a8a6a', { rough: 0.88 });
  var ornMat = o.ornMat || ridgeMat;
  var top = grp(); top.position.set(x, y, z);
  var slope = Math.sqrt(d * d * 0.25 + h * h) + 0.06, ang = Math.atan2(h, d * 0.5);
  var pF = box(w * 1.06, 0.04, slope, roofMat, 0, h * 0.5, d * 0.25); pF.rotation.x = ang; top.add(pF);
  var pB = box(w * 1.06, 0.04, slope, roofMat, 0, h * 0.5, -d * 0.25); pB.rotation.x = -ang; top.add(pB);
  /* 檐口瓦垄带（前后两檐，各 1 mesh） */
  var key = 'gbb2_' + w + '_' + d + '_' + h;
  if (!GEO[key]) {
    var ze = d * 0.53, ye = -0.02, we = w * 0.53;
    GEO[key] = {
      f: eaveBandGeo([[-we, ye, ze], [we, ye, ze]], { closed: false, apex: [0, h, 0], axis: 'x', len: 0.18, hang: 0.1, lobe: 0.018, lift: 0.012, pitch: 0.075 }),
      b: eaveBandGeo([[-we, ye, -ze], [we, ye, -ze]], { closed: false, apex: [0, h, 0], axis: 'x', len: 0.18, hang: 0.1, lobe: 0.018, lift: 0.012, pitch: 0.075 })
    };
  }
  top.add(mesh(GEO[key].f, getBandMat()));
  top.add(mesh(GEO[key].b, getBandMat()));
  top.add(box(w * 1.08, 0.05, 0.075, ridgeMat, 0, h, 0));
  var cwS = o.cw || 0.85;
  var cw1 = chiwen(ornMat, cwS, -1); cw1.position.set(-w * 0.54, h + 0.03, 0); top.add(cw1);
  var cw2 = chiwen(ornMat, cwS, 1); cw2.position.set(w * 0.54, h + 0.03, 0); top.add(cw2);
  if (o.finial !== false) {
    var fin = ridgeFinial(ornMat, cwS * 0.9); fin.position.set(0, h + 0.028, 0); top.add(fin);
  }
  var key2 = 'gb_' + d + '_' + h;
  if (!GEO[key2]) {
    var sh = new THREE.Shape();
    sh.moveTo(-d * 0.5 - 0.02, 0); sh.lineTo(d * 0.5 + 0.02, 0); sh.lineTo(0, h + 0.02); sh.closePath();
    GEO[key2] = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
  }
  for (var s = -1; s <= 1; s += 2) {
    var tp = mesh(GEO[key2], gableMat);
    tp.rotation.y = PI / 2 * s;
    tp.position.set(s * (w * 0.5 - 0.02), 0, 0);
    top.add(tp);
  }
  g.add(top);
  return top;
}

/* 3.4 月洞门院墙（正面 +z）：贯穿圆洞 + 双层墙帽瓦垄条 + 石门框/门簪/门楼披檐
 * opts.gate = 'simple' | 'cap' | 'full' */
function courtWall(g, y, z, h, r, opts) {
  opts = opts || {};
  var w = opts.w || 2.2, back = opts.back || 0.4;
  var gate = opts.gate || 'simple';
  var wallMat = opts.wallMat || MAT('#cfc9b8', { map: texStoneWall(), rough: 0.92 });
  var capMat = opts.capMat || MAT('#8f897b', { rough: 0.9 });
  var capTileMat = MAT('#4a5560', { map: texTile(8), rough: 0.75 });
  var woodMat = MAT('#5a4632', { rough: 0.8 });
  var wall = grp(); wall.position.set(0, y, z);
  var sh = new THREE.Shape();
  sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2, h); sh.lineTo(-w / 2, h); sh.closePath();
  var hole = new THREE.Path();
  hole.absarc(0, r + 0.05, r, 0, PI * 2, true);
  sh.holes.push(hole);
  var key = 'mw_' + w + '_' + h + '_' + r;
  if (!GEO[key]) GEO[key] = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false });
  wall.add(mesh(GEO[key], wallMat));
  /* 石门框：洞口 proud 圈边 + 两侧门砧 */
  var rim = mesh(new THREE.TorusGeometry(r + 0.018, 0.02, 6, 24), capMat);
  rim.position.set(0, r + 0.05, 0.055); wall.add(rim);
  var rim2 = mesh(new THREE.TorusGeometry(r + 0.05, 0.02, 8, 28), capMat);
  rim2.position.set(0, r + 0.05, 0.095); wall.add(rim2);
  wall.add(box(0.07, r + 0.07, 0.06, capMat, -(r + 0.055), (r + 0.07) / 2, 0.08));
  wall.add(box(0.07, r + 0.07, 0.06, capMat, (r + 0.055), (r + 0.07) / 2, 0.08));
  wall.add(box(r * 2.2, 0.035, 0.16, capMat, 0, 0.017, 0.02));  /* 门槛石 */
  /* 双层墙帽 + 瓦垄条（京派墙帽语汇） */
  wall.add(box(w + 0.06, 0.045, 0.16, capMat, 0, h + 0.0225, 0.02));
  wall.add(box(w + 0.06, 0.035, 0.19, capTileMat, 0, h + 0.0645, 0.02));
  wall.add(box(w + 0.02, 0.018, 0.06, capMat, 0, h + 0.091, 0.02));
  /* 门簪（cap/full）：洞顶上方一对，圆柱销 + 方帽 */
  if (gate !== 'simple') {
    var pinsY = Math.min(h - 0.045, 2 * r + 0.05 + r * 0.75);
    for (var ps = -1; ps <= 1; ps += 2) {
      var pin = cyl(0.011, 0.011, 0.035, 12, woodMat, ps * r * 0.42, pinsY, 0.115);
      pin.rotation.x = PI / 2; wall.add(pin);
      wall.add(box(0.03, 0.03, 0.014, woodMat, ps * r * 0.42, pinsY, 0.132));
    }
  }
  /* 门楼小披檐（cap/full）：迷你双坡瓦顶 + 檐口瓦垄带 */
  if (gate !== 'simple') {
    var gw = r * 3.6, gt = grp(); gt.position.set(0, h + 0.105, 0.04);
    var ang = 0.55, sl = 0.17;
    var sF = box(gw, 0.018, sl, capTileMat, 0, 0.045, 0.055); sF.rotation.x = ang; gt.add(sF);
    var sB = box(gw, 0.018, sl, capTileMat, 0, 0.045, -0.055); sB.rotation.x = -ang; gt.add(sB);
    gt.add(box(0.035, 0.028, 0.15, capMat, 0, 0.105, 0));
    var gk = 'gateband_' + r;
    if (!GEO[gk]) {
      GEO[gk] = eaveBandGeo([[-gw / 2, 0.0, 0.1275], [gw / 2, 0.0, 0.1275]],
        { closed: false, apex: [0, 0.105, 0], axis: 'x', len: 0.08, hang: 0.06, lobe: 0.013, lift: 0.008, pitch: 0.06 });
    }
    gt.add(mesh(GEO[gk], getBandMat()));
    wall.add(gt);
  }
  /* 门匾（full + gatePlaque） */
  if (gate === 'full' && opts.gatePlaque) {
    var plqY = Math.min(h - 0.055, 2 * r + 0.05 + r * 0.35);
    var plq = plaque(opts.gatePlaque, 0.24, 0.085); plq.position.set(0, plqY, 0.108); wall.add(plq);
  }
  /* 两侧院墙回收（包住沙盘边）+ 回收段墙帽 */
  wall.add(box(0.09, h, back, wallMat, -w / 2 - 0.045, h / 2, -back / 2 + 0.05));
  wall.add(box(0.09, h, back, wallMat, w / 2 + 0.045, h / 2, -back / 2 + 0.05));
  wall.add(box(0.16, 0.045, back + 0.08, capMat, -w / 2 - 0.045, h + 0.022, -back / 2 + 0.05));
  wall.add(box(0.16, 0.045, back + 0.08, capMat, w / 2 + 0.045, h + 0.022, -back / 2 + 0.05));
  wall.add(box(0.1, 0.03, back + 0.02, capTileMat, -w / 2 - 0.045, h + 0.062, -back / 2 + 0.05));
  wall.add(box(0.1, 0.03, back + 0.02, capTileMat, w / 2 + 0.045, h + 0.062, -back / 2 + 0.05));
  g.add(wall);
  return wall;
}

/* 3.5 木格花窗：512px 加密格棂 + 3D 挤出边框 + 窗台（3 mesh） */
function latticeWindow(w, h, glowMat) {
  var win = grp();
  var key = 'lw_' + w + '_' + h;
  if (!GEO[key]) {
    var sh = new THREE.Shape();
    var hw = w / 2 + 0.025, hh = h / 2 + 0.025;
    sh.moveTo(-hw, -hh); sh.lineTo(hw, -hh); sh.lineTo(hw, hh); sh.lineTo(-hw, hh); sh.closePath();
    var hole = new THREE.Path();
    hole.moveTo(-w / 2, -h / 2); hole.lineTo(w / 2, -h / 2); hole.lineTo(w / 2, h / 2); hole.lineTo(-w / 2, h / 2); hole.closePath();
    sh.holes.push(hole);
    GEO[key] = new THREE.ExtrudeGeometry(sh, { depth: 0.035, bevelEnabled: false });
  }
  var frame = mesh(GEO[key], MAT('#5a4632', { rough: 0.8 }));
  frame.position.z = -0.005; win.add(frame);
  var back = mesh(new THREE.PlaneGeometry(w, h), glowMat || MAT('#31404c', { map: texLattice(), rough: 0.6 }));
  back.position.z = 0.012; win.add(back);
  win.add(box(w + 0.07, 0.045, 0.05, MAT('#5a4632', { rough: 0.8 }), 0, -h / 2 - 0.045, 0.012));
  return win;
}

/* 3.6 木门 + 门环 + 抹头（原点 = 门底）；opts.studs 门钉 / opts.pillow 门枕石 */
function entryDoor(w, h, opts) {
  opts = opts || {};
  var d = grp();
  d.add(box(w, h, 0.045, MAT('#54402c', { rough: 0.82 }), 0, h / 2, 0));
  d.add(box(w - 0.02, h * 0.1, 0.015, MAT('#43321f', { rough: 0.85 }), 0, h * 0.24, 0.031));
  d.add(box(w - 0.02, h * 0.1, 0.015, MAT('#43321f', { rough: 0.85 }), 0, h * 0.76, 0.031));
  if (opts.studs) {
    for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) {
      d.add(sph(0.008, MAT('#8f8577', { rough: 0.4, metal: 0.6 }), a * w * 0.3, h * 0.5 + b * h * 0.14, 0.033, 12));
    }
  }
  if (!GEO.ring) GEO.ring = new THREE.TorusGeometry(0.028, 0.008, 8, 16);
  for (var s = -1; s <= 1; s += 2) {
    var ring = mesh(GEO.ring, MAT('#3a3f45', { rough: 0.45, metal: 0.6 }));
    ring.position.set(s * w * 0.22, h * 0.52, 0.034);
    d.add(ring);
  }
  d.add(box(w + 0.1, 0.05, 0.055, MAT('#5a4632', { rough: 0.8 }), 0, h + 0.03, 0));
  if (opts.pillow) {
    d.add(box(0.055, 0.05, 0.1, MAT('#9a948a', { rough: 0.92 }), -(w / 2 + 0.045), 0.025, 0.01));
    d.add(box(0.055, 0.05, 0.1, MAT('#9a948a', { rough: 0.92 }), (w / 2 + 0.045), 0.025, 0.01));
  }
  return d;
}

/* 3.7 红灯笼 v2：挂环 + 金盖金盘 + 三道经向骨架 + 双股穗 + 坠珠（呼吸 + 轻摆） */
function lantern(s, phase) {
  var g = grp(); s = s || 1;
  var bm = std('#d6402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.6 });
  var gm = MAT('#d8a63c', { rough: 0.35, metal: 0.75 });
  if (!GEO.lhook) GEO.lhook = new THREE.TorusGeometry(0.014, 0.004, 6, 12);
  if (!GEO.lrimT) GEO.lrimT = new THREE.TorusGeometry(0.052, 0.005, 6, 12);
  if (!GEO.lrib) GEO.lrib = new THREE.TorusGeometry(0.082, 0.0035, 4, 16);
  var hook = mesh(GEO.lhook, gm); hook.position.set(0, 0.048 * s, 0); hook.scale.setScalar(s); g.add(hook);
  g.add(cyl(0.05 * s, 0.062 * s, 0.032 * s, 12, gm, 0, 0.016 * s, 0));
  var rimT = mesh(GEO.lrimT, gm); rimT.rotation.x = PI / 2; rimT.position.set(0, 0.031 * s, 0); rimT.scale.setScalar(s); g.add(rimT);
  var body = sph(0.09 * s, bm, 0, -0.07 * s, 0, 16); body.scale.y = 0.86; g.add(body);
  for (var i = 0; i < 3; i++) {                      /* 经向骨架 */
    var rib = mesh(GEO.lrib, MAT('#b0322a', { rough: 0.6 }));
    rib.position.set(0, -0.07 * s, 0); rib.scale.setScalar(s);
    rib.rotation.y = i * PI / 3; g.add(rib);
  }
  g.add(cyl(0.05 * s, 0.04 * s, 0.03 * s, 12, gm, 0, -0.15 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.05 * s, 12, MAT('#a83b2a', { rough: 0.7 }), 0, -0.19 * s, 0));
  for (var k = 0; k < 2; k++) {                      /* 双股穗 */
    var strand = cyl(0.004 * s, 0.003 * s, 0.055 * s, 12, MAT('#c8a13c', { rough: 0.65 }), (k ? 0.007 : -0.007) * s, -0.24 * s, 0);
    strand.rotation.z = (k ? 0.1 : -0.1); g.add(strand);
  }
  g.add(box(0.02 * s, 0.03 * s, 0.01 * s, MAT('#c8a13c', { rough: 0.6 }), 0, -0.285 * s, 0));
  anim(g, function (t) {
    bm.emissiveIntensity = 0.55 + 0.25 * sin(t * 2.2 + (phase || 0));
    g.rotation.z = 0.06 * sin(t * 1.5 + (phase || 0) * 1.3);
    g.rotation.x = 0.045 * sin(t * 1.2 + (phase || 0) * 2.1);
  });
  return g;
}

/* 3.8 石板径 v2：错缝变宽石板 + 板缝草簇 + 路缘卵石（固定表驱动） */
function stonePath(g, y, z0, z1) {
  if (!GEO.slab) GEO.slab = new THREE.BoxGeometry(0.3, 0.024, 0.34);
  var m = MAT('#d5ccb4', { rough: 0.95 });
  var n = 9, i;
  var xOff = [0, 0.05, -0.04, 0.02, -0.06, 0.04, -0.02, 0.05, -0.03];
  var wob = [0.06, -0.05, 0.04, -0.07, 0.05, -0.04, 0.07, -0.05, 0.04];
  for (i = 0; i < n; i++) {
    var t = (i + 0.5) / n;
    var sl = mesh(GEO.slab, m);
    sl.scale.set(0.84 + ((i * 7) % 4) * 0.09, 1, 0.9 + ((i * 5) % 3) * 0.12);
    sl.position.set(xOff[i], y + 0.012, z0 + (z1 - z0) * t);
    sl.rotation.y = wob[i] + (i % 2 ? 1 : -1) * 0.05;
    g.add(sl);
  }
  var tuftM = MAT('#6c9a52', { rough: 0.95 });
  var tZ = [0.18, 0.52, 0.86];
  for (i = 0; i < 3; i++) {
    g.add(cone(0.03, 0.06, 12, tuftM, 0.17, y + 0.03, z0 + (z1 - z0) * tZ[i]));
  }
  if (!GEO.pebble) GEO.pebble = new THREE.SphereGeometry(0.024, 12, 8);
  var pbM = MAT('#b5afa0', { rough: 0.95 });
  [[-0.2, 0.3], [0.21, 0.66]].forEach(function (p) {
    var pb = mesh(GEO.pebble, pbM);
    pb.position.set(p[0], y + 0.014, z0 + (z1 - z0) * p[1]);
    g.add(pb);
  });
}

/* 3.9 绿化：小树 / 花树 / 灌丛 / 山石 / 盆栽 */
function treeSmall(g, x, z, s) {
  s = s || 1;
  var t = grp(); t.position.set(x, 0.098, z);
  t.add(cyl(0.035 * s, 0.05 * s, 0.3 * s, 12, MAT('#6b5138', { rough: 0.9 }), 0, 0.15 * s, 0));
  var cm = MAT('#6c9a52', { rough: 0.95 });
  t.add(sph(0.16 * s, cm, 0, 0.38 * s, 0, 16));
  t.add(sph(0.11 * s, cm, 0.1 * s, 0.3 * s, 0.06 * s, 16));
  t.add(sph(0.09 * s, cm, -0.1 * s, 0.32 * s, -0.05 * s, 16));
  g.add(t); return t;
}
function blossomTree(g, x, z, s) {
  s = s || 1;
  var t = grp(); t.position.set(x, 0.098, z);
  t.add(cyl(0.04 * s, 0.055 * s, 0.34 * s, 12, MAT('#5f4a34', { rough: 0.9 }), 0, 0.17 * s, 0));
  var pm = MAT('#e8a0c0', { rough: 0.9 });
  t.add(sph(0.19 * s, pm, 0.02 * s, 0.46 * s, 0, 16));
  t.add(sph(0.13 * s, pm, -0.13 * s, 0.36 * s, 0.06 * s, 16));
  t.add(sph(0.11 * s, pm, 0.14 * s, 0.35 * s, -0.08 * s, 16));
  t.add(sph(0.08 * s, MAT('#f2bdd6', { rough: 0.9 }), 0.08 * s, 0.55 * s, 0.05 * s, 16));
  g.add(t); return t;
}
function bushAt(g, x, z, s) {
  var b = sph(s, MAT('#557b40', { rough: 0.95 }), x, 0.098 + s * 0.6, z, 16);
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
  p.add(cyl(0.05 * s, 0.038 * s, 0.08 * s, 12, MAT('#a3502e', { rough: 0.8 }), 0, 0.04 * s, 0));
  p.add(sph(0.06 * s, MAT('#6c9a52', { rough: 0.95 }), 0, 0.11 * s, 0, 16));
  g.add(p); return p;
}

/* 3.10 匾额（字面与木底分离 ≥0.02 防共面闪烁） */
function plaque(text, w, h) {
  var p = grp();
  p.add(box(w, h, 0.02, MAT('#3a2c1c', { rough: 0.8 }), 0, 0, 0));
  var face = mesh(new THREE.PlaneGeometry(w * 0.94, h * 0.86),
    new THREE.MeshStandardMaterial({ map: texPlaque(text), roughness: 0.6, metalness: 0.05, flatShading: true }));
  face.position.z = 0.031; p.add(face);
  return p;
}

/* 3.11 石狮 v2：双层须弥座 + 鬃毛卷 + 前腿 + 眉眼 + 尾卷（lv4 门前） */
function stoneLion(g, x, z, ry) {
  var l = grp(); l.position.set(x, 0.098, z); l.rotation.y = ry || 0;
  var m = MAT('#b5afa0', { rough: 0.9 });
  var dm = MAT('#3a3a38', { rough: 0.6 });
  /* 须弥座（双层 + 上枋） */
  l.add(box(0.2, 0.035, 0.26, m, 0, 0.0175, 0));
  l.add(box(0.16, 0.03, 0.2, m, 0, 0.05, 0));
  l.add(box(0.17, 0.012, 0.21, m, 0, 0.071, 0));
  /* 身躯 + 前腿 */
  l.add(sph(0.06, m, 0, 0.135, 0.03, 16));
  l.add(sph(0.055, m, 0, 0.13, -0.05, 16));
  l.add(cyl(0.018, 0.02, 0.08, 12, m, -0.03, 0.1, 0.055));
  l.add(cyl(0.018, 0.02, 0.08, 12, m, 0.03, 0.1, 0.055));
  /* 头 + 鬃毛卷 + 眉眼 + 吻 */
  l.add(sph(0.05, m, 0, 0.21, 0.05, 16));
  l.add(sph(0.022, m, -0.042, 0.225, 0.015, 12));
  l.add(sph(0.022, m, 0.042, 0.225, 0.015, 12));
  l.add(sph(0.019, m, -0.048, 0.195, 0.0, 12));
  l.add(sph(0.019, m, 0.048, 0.195, 0.0, 12));
  l.add(sph(0.008, dm, -0.02, 0.225, 0.09, 12));
  l.add(sph(0.008, dm, 0.02, 0.225, 0.09, 12));
  l.add(sph(0.02, m, 0, 0.198, 0.093, 12));
  /* 尾卷 */
  l.add(sph(0.016, m, 0, 0.16, -0.095, 12));
  l.add(sph(0.012, m, 0.012, 0.185, -0.088, 12));
  g.add(l); return l;
}

/* 3.12 木构架：转角柱 + 檐枋 + 雀替榫卯节点（挂白墙前的木作骨架） */
function timberFrame(parent, w, d, y0, y1, mat, cz) {
  var t = 0.042, x = w / 2 - t / 2, h = y1 - y0;
  cz = (cz !== undefined ? cz : 0);
  var zd = d / 2 - t / 2;
  [[-x, zd], [x, zd], [-x, -zd], [x, -zd]].forEach(function (c) {
    parent.add(box(t, h, t, mat, c[0], y0 + h / 2, c[1] + cz));
  });
  var by = y1 - 0.022;
  parent.add(box(w, 0.035, 0.028, mat, 0, by, zd + cz));           /* 前檐枋 */
  parent.add(box(0.07, 0.028, 0.05, mat, -x, by - 0.036, zd + cz)); /* 雀替 */
  parent.add(box(0.07, 0.028, 0.05, mat, x, by - 0.036, zd + cz));
}

/* 暖窗呼吸材质（interaction pass：lv3/lv4 上层住人暖光） */
function glowWindowMat(seedPhase, g) {
  var m = std('#31404c', { map: texLattice(), rough: 0.6, emissive: '#ffb95e', ei: 0.16 });
  anim(g, function (t) { m.emissiveIntensity = 0.16 + 0.14 * sin(t * 1.1 + seedPhase); });
  return m;
}

/* ================= 4. 阶段装配（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：单开间木板小铺（总高 ~1.08） ---- */
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
  /* 檐枋 + 雀替（榫卯节点） */
  hut.add(box(1.1, 0.035, 0.03, MAT('#5a4632', { rough: 0.85 }), 0, 0.565, 0.395));
  hut.add(box(0.07, 0.028, 0.05, MAT('#5a4632', { rough: 0.85 }), -0.46, 0.53, 0.395));
  hut.add(box(0.07, 0.028, 0.05, MAT('#5a4632', { rough: 0.85 }), 0.46, 0.53, 0.395));
  var door = entryDoor(0.26, 0.42); door.position.set(-0.16, 0.1, 0.385); hut.add(door);
  var win = latticeWindow(0.22, 0.2); win.position.set(0.3, 0.42, 0.385); hut.add(win);
  gableRoof(hut, 0, 0.62, 0, 1.16, 0.92, 0.28, { cw: 0.9 });
  /* 灯杆 + 灯笼 */
  var pole = grp(); pole.position.set(0.72, ground, 0.62); g.add(pole);
  pole.add(cyl(0.014, 0.02, 0.5, 12, MAT('#5a4632', { rough: 0.85 }), 0, 0.25, 0));
  pole.add(box(0.2, 0.025, 0.025, MAT('#5a4632', { rough: 0.85 }), -0.09, 0.5, 0));
  var l1 = lantern(0.85, 0.5); l1.position.set(-0.17, 0.49, 0); pole.add(l1);
  /* 月洞门院墙（矮，石门框） */
  courtWall(g, ground, 1.02, 0.36, 0.14, { w: 2.2, back: 0.4, gate: 'simple' });
  /* 绿化 */
  treeSmall(g, -0.86, -0.5, 1.0);
  bushAt(g, 0.8, -0.72, 0.1);
  bushAt(g, -0.72, 0.74, 0.075);
  pottedPlant(g, 0.52, 0.68, 0.9);
  return g;
}

/* ---- lv2 洋房：两层白墙小楼 + 披屋（总高 ~1.6） ---- */
function stage2() {
  var g = grp(); g.name = 'prop_1_lv2';
  var ground = basePlatform(g);
  stonePath(g, ground, 1.08, 0.22);
  var B = grp(); B.position.set(0, 0, -0.14); g.add(B);
  var wood = MAT('#5a4632', { rough: 0.85 });
  /* 台基 + 一层店面 */
  B.add(box(1.52, 0.1, 1.0, MAT('#b5afa0', { rough: 0.9 }), 0, 0.05, 0));
  B.add(box(1.44, 0.52, 0.92, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.36, 0));
  B.add(box(1.5, 0.07, 0.98, MAT('#8f897b', { rough: 0.9 }), 0, 0.135, 0));
  timberFrame(B, 1.46, 0.98, 0.1, 0.62, wood);
  var w1 = latticeWindow(0.3, 0.28); w1.position.set(-0.34, 0.4, 0.465); B.add(w1);
  var w2 = latticeWindow(0.3, 0.28); w2.position.set(0.34, 0.4, 0.465); B.add(w2);
  B.add(box(0.9, 0.1, 0.12, MAT('#7a5f42', { rough: 0.85 }), 0, 0.21, 0.52));
  B.add(sph(0.05, MAT('#a3502e', { rough: 0.8 }), -0.28, 0.31, 0.52, 16));
  B.add(sph(0.04, MAT('#8a8478', { rough: 0.8 }), 0.25, 0.305, 0.52, 16));
  /* 蓝布雨棚 */
  var aw = box(1.06, 0.02, 0.3, MAT('#5b7f9c', { rough: 0.85 }), 0, 0.66, 0.6);
  aw.rotation.x = 0.42; B.add(aw);
  B.add(box(1.06, 0.05, 0.02, MAT('#4c6c86', { rough: 0.85 }), 0, 0.615, 0.74));
  /* 二层 + 挑廊 */
  B.add(box(1.38, 0.42, 0.88, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.83, -0.02));
  B.add(box(1.44, 0.05, 0.94, MAT('#6b5138', { rough: 0.85 }), 0, 0.645, 0));
  timberFrame(B, 1.4, 0.94, 0.62, 1.04, wood, -0.02);
  var rail = grp(); rail.position.set(0, 1.04, 0.46); B.add(rail);
  rail.add(box(1.2, 0.035, 0.035, MAT('#7a5f42', { rough: 0.85 }), 0, 0, 0));
  rail.add(box(1.2, 0.03, 0.03, MAT('#7a5f42', { rough: 0.85 }), 0, -0.14, 0));
  for (var i = -2; i <= 2; i++) rail.add(box(0.03, 0.15, 0.03, MAT('#7a5f42', { rough: 0.85 }), i * 0.28, -0.07, 0));
  var w3 = latticeWindow(0.26, 0.24); w3.position.set(0, 0.88, 0.425); B.add(w3);
  /* 主屋顶：庑殿起翘 + 瓦垄带 */
  hipRoof(B, 0, 1.07, -0.02, 1.56, 1.02, 0.32, { lift: 0.09, cw: 0.9 });
  /* 右侧披屋 */
  var wing = grp(); wing.position.set(0.82, ground, -0.3); g.add(wing);
  wing.add(box(0.42, 0.4, 0.52, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.2, 0));
  var ww = latticeWindow(0.16, 0.16); ww.position.set(0, 0.24, 0.265); wing.add(ww);
  gableRoof(wing, 0, 0.4, 0, 0.5, 0.6, 0.16, { roofMat: MAT('#414b57', { map: texTile(32), rough: 0.72 }), cw: 0.7 });
  /* 灯笼 ×3（檐下 ×2 + 门杆 ×1） */
  var la1 = lantern(0.9, 0.3); la1.position.set(-0.62, 1.02, 0.4); g.add(la1);
  var la2 = lantern(0.9, 2.1); la2.position.set(0.62, 1.02, 0.4); g.add(la2);
  var pole = grp(); pole.position.set(-0.86, ground, 0.72); g.add(pole);
  pole.add(cyl(0.014, 0.018, 0.52, 12, MAT('#5a4632', { rough: 0.85 }), 0, 0.26, 0));
  var la3 = lantern(0.8, 1.2); la3.position.set(0.05, 0.5, 0); pole.add(la3);
  /* 月洞门院墙（中：门楼披檐 + 门簪） */
  courtWall(g, ground, 1.0, 0.44, 0.16, { w: 2.2, back: 0.4, gate: 'cap' });
  /* 绿化 */
  treeSmall(g, -0.9, -0.6, 1.05);
  pottedPlant(g, -0.52, 0.72, 0.9);
  pottedPlant(g, 0.5, 0.7, 0.8);
  bushAt(g, 0.88, -0.78, 0.09);
  bushAt(g, -0.62, 0.78, 0.07);
  return g;
}

/* ---- lv3 大厦：三层主楼 + 耳房 + 匾额（总高 ~2.1） ---- */
function stage3() {
  var g = grp(); g.name = 'prop_1_lv3';
  var ground = basePlatform(g);
  stonePath(g, ground, 1.06, 0.24);
  var B = grp(); B.position.set(0, 0, -0.1); g.add(B);
  var glowMat = glowWindowMat(0.8, g);
  var wood = MAT('#6b5138', { rough: 0.85 });
  /* 台基 + 一层门厅 */
  B.add(box(1.5, 0.1, 1.04, MAT('#b5afa0', { rough: 0.9 }), 0, 0.05, 0));
  B.add(box(1.44, 0.52, 0.96, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.36, 0));
  B.add(box(1.5, 0.07, 1.02, MAT('#8f897b', { rough: 0.9 }), 0, 0.135, 0));
  timberFrame(B, 1.46, 1.02, 0.1, 0.62, wood);
  var door = entryDoor(0.3, 0.42); door.position.set(0, 0.1, 0.485); B.add(door);
  var plq = plaque('南锣', 0.3, 0.11); plq.position.set(0, 0.64, 0.5); B.add(plq);
  var wA = latticeWindow(0.22, 0.2, glowMat); wA.position.set(-0.42, 0.42, 0.485); B.add(wA);
  var wB = latticeWindow(0.22, 0.2, glowMat); wB.position.set(0.42, 0.42, 0.485); B.add(wB);
  /* 二层：挑廊 + 暖格窗 */
  B.add(box(1.36, 0.44, 0.9, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.84, -0.03));
  var bal = grp(); bal.position.set(0, 0.66, 0.42); B.add(bal);
  bal.add(box(1.24, 0.04, 0.09, MAT('#6b5138', { rough: 0.85 }), 0, 0, 0));
  bal.add(box(1.24, 0.035, 0.035, MAT('#7a5f42', { rough: 0.85 }), 0, 0.16, 0.02));
  for (var i = -3; i <= 3; i++) bal.add(box(0.028, 0.14, 0.028, MAT('#7a5f42', { rough: 0.85 }), i * 0.19, 0.08, 0.02));
  timberFrame(B, 1.38, 0.96, 0.62, 1.06, wood, -0.03);
  var w2a = latticeWindow(0.24, 0.24, glowMat); w2a.position.set(-0.3, 0.88, 0.425); B.add(w2a);
  var w2b = latticeWindow(0.24, 0.24, glowMat); w2b.position.set(0.3, 0.88, 0.425); B.add(w2b);
  /* 三层 */
  B.add(box(1.34, 0.05, 0.9, MAT('#6b5138', { rough: 0.85 }), 0, 1.075, -0.03));
  B.add(box(1.28, 0.4, 0.84, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 1.3, -0.06));
  timberFrame(B, 1.3, 0.92, 1.06, 1.5, wood, -0.06);
  var w3a = latticeWindow(0.22, 0.22, glowMat); w3a.position.set(-0.26, 1.32, 0.365); B.add(w3a);
  var w3b = latticeWindow(0.22, 0.22, glowMat); w3b.position.set(0.26, 1.32, 0.365); B.add(w3b);
  /* 大庑殿顶 + 角兽 + 双道瓦垄 */
  hipRoof(B, 0, 1.51, -0.06, 1.62, 1.12, 0.38, { lift: 0.11, beasts: 1, mid: true, cw: 1 });
  /* 右耳房 */
  var wing = grp(); wing.position.set(0.88, ground, -0.26); g.add(wing);
  wing.add(box(0.52, 0.05, 0.62, MAT('#8f897b', { rough: 0.9 }), 0, 0.025, 0));
  wing.add(box(0.46, 0.62, 0.56, MAT('#edefe3', { map: texPlaster(), rough: 0.9 }), 0, 0.36, 0));
  var ww1 = latticeWindow(0.18, 0.18); ww1.position.set(0, 0.44, 0.285); wing.add(ww1);
  var ww2 = latticeWindow(0.18, 0.18); ww2.position.set(0, 0.2, 0.285); wing.add(ww2);
  gableRoof(wing, 0, 0.67, 0, 0.54, 0.64, 0.18, { roofMat: MAT('#414b57', { map: texTile(32), rough: 0.72 }), cw: 0.65 });
  /* 灯笼 ×4（两层檐下） */
  var l1 = lantern(0.85, 0.2); l1.position.set(-0.64, 1.4, 0.42); g.add(l1);
  var l2 = lantern(0.85, 1.7); l2.position.set(0.64, 1.4, 0.42); g.add(l2);
  var l3 = lantern(0.8, 3.1); l3.position.set(-0.5, 0.64, 0.5); g.add(l3);
  var l4 = lantern(0.8, 4.2); l4.position.set(0.5, 0.64, 0.5); g.add(l4);
  /* 月洞门院墙（高：门楼 + 门簪 + 石门框） */
  courtWall(g, ground, 0.98, 0.48, 0.17, { w: 2.2, back: 0.38, gate: 'full' });
  /* 爬藤 + 绿化 */
  var vine = grp(); vine.position.set(-0.66, ground, 0.3); g.add(vine);
  vine.add(sph(0.09, MAT('#557b40', { rough: 0.95 }), -0.1, 0.3, 0, 16));
  vine.add(sph(0.07, MAT('#6c9a52', { rough: 0.95 }), 0.05, 0.42, 0.06, 16));
  pottedPlant(g, -0.5, 0.74, 1.0);
  pottedPlant(g, 0.46, 0.76, 0.9);
  bushAt(g, 0.92, -0.8, 0.1);
  bushAt(g, -0.94, -0.7, 0.08);
  return g;
}

/* ---- lv4 地标：三重檐红柱地标建筑群（总高 ~2.6） ---- */
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
  /* 台基 + 门前石阶（带垂带石） */
  B.add(box(1.74, 0.12, 1.18, MAT('#b5afa0', { rough: 0.9 }), 0, 0.06, 0));
  B.add(box(1.66, 0.06, 1.1, MAT('#8f897b', { rough: 0.9 }), 0, 0.15, 0));
  B.add(box(0.94, 0.05, 0.16, MAT('#c9c3b2', { rough: 0.92 }), 0, 0.185, 0.62));
  B.add(box(0.94, 0.05, 0.16, MAT('#c9c3b2', { rough: 0.92 }), 0, 0.135, 0.74));
  B.add(box(0.94, 0.05, 0.16, MAT('#c9c3b2', { rough: 0.92 }), 0, 0.085, 0.86));
  B.add(box(0.06, 0.16, 0.36, MAT('#b5afa0', { rough: 0.92 }), -0.51, 0.13, 0.73));
  B.add(box(0.06, 0.16, 0.36, MAT('#b5afa0', { rough: 0.92 }), 0.51, 0.13, 0.73));
  /* 一层：白墙 + 红柱廊 + 木构架（0.17..0.77，下沉入屋面防穿缝） */
  B.add(box(1.56, 0.6, 1.0, plaster, 0, 0.47, -0.04));
  timberFrame(B, 1.56, 1.06, 0.17, 0.77, red, -0.04);
  var colX = [-0.62, -0.21, 0.21, 0.62];
  colX.forEach(function (x) {
    var c = mesh(GEO.col, red); c.position.set(x, 0.46, 0.47); B.add(c);
    B.add(box(0.075, 0.05, 0.075, gold, x, 0.75, 0.47));
  });
  var door = entryDoor(0.34, 0.46, { studs: true, pillow: true }); door.position.set(0, 0.18, 0.475); B.add(door);
  var plq = plaque('南锣巷', 0.4, 0.13); plq.position.set(0, 0.71, 0.5); B.add(plq);
  var wa1 = latticeWindow(0.2, 0.22, glowMat); wa1.position.set(-0.5, 0.5, 0.468); B.add(wa1);
  var wa2 = latticeWindow(0.2, 0.22, glowMat); wa2.position.set(0.5, 0.5, 0.468); B.add(wa2);
  var wa3 = latticeWindow(0.2, 0.22, glowMat); wa3.position.set(-0.785, 0.5, -0.04); wa3.rotation.y = PI / 2; B.add(wa3);
  var wa4 = latticeWindow(0.2, 0.22, glowMat); wa4.position.set(0.785, 0.5, -0.04); wa4.rotation.y = -PI / 2; B.add(wa4);
  /* 一重檐（金脊吻兽 + 双道瓦垄） */
  hipRoof(B, 0, 0.78, -0.04, 1.8, 1.24, 0.3, { lift: 0.12, gold: true, beasts: 2, ornMat: gold, mid: true, cw: 1.1 });
  /* 二层：红柱平座 + 栏杆 + 木构架（0.82..1.40，底沉入一重檐屋面） */
  B.add(box(1.3, 0.58, 0.94, plaster, 0, 1.11, -0.05));
  timberFrame(B, 1.3, 0.96, 0.82, 1.4, red, -0.05);
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
  hipRoof(B, 0, 1.43, -0.05, 1.42, 1.0, 0.28, { lift: 0.1, gold: true, beasts: 2, ornMat: gold, cw: 1 });
  /* 三层（1.40..1.96，底沉入二重檐屋面）+ 木构架 */
  B.add(box(0.96, 0.56, 0.74, plaster, 0, 1.68, -0.05));
  timberFrame(B, 0.96, 0.8, 1.4, 1.96, red, -0.05);
  [-0.34, 0.34].forEach(function (x) {
    var c = mesh(GEO.col, red); c.scale.set(0.85, 0.68, 0.85);
    c.position.set(x, 1.76, 0.33); B.add(c);
    B.add(box(0.06, 0.04, 0.06, gold, x, 1.96, 0.33));
  });
  var w3a = latticeWindow(0.2, 0.2, glowMat); w3a.position.set(0, 1.8, 0.335); B.add(w3a);
  /* 三重檐 + 金宝顶（环饰 + 顶珠）；顶檐不加中腰瓦垄、角兽省头（mesh 预算） */
  hipRoof(B, 0, 1.98, -0.05, 1.06, 0.8, 0.3, { lift: 0.1, gold: true, beasts: 1, ornMat: gold, cw: 0.9, beastHead: false });
  B.add(cyl(0.012, 0.012, 0.14, 12, gold, 0, 2.34, -0.05));
  if (!GEO.finialRing) GEO.finialRing = new THREE.TorusGeometry(0.032, 0.008, 8, 16);
  var fr = mesh(GEO.finialRing, gold); fr.rotation.x = PI / 2; fr.position.set(0, 2.285, -0.05); B.add(fr);
  B.add(sph(0.05, gold, 0, 2.43, -0.05, 16));
  B.add(cone(0.035, 0.07, 12, gold, 0, 2.5, -0.05));
  B.add(sph(0.014, gold, 0, 2.548, -0.05, 12));
  /* 灯笼 ×8（三重檐下 ×6 + 院门 ×2） */
  [[-0.8, 0.66, 0.56, 0.2], [0.8, 0.66, 0.56, 1.4], [-0.62, 1.32, 0.48, 2.6], [0.62, 1.32, 0.48, 3.5],
   [-0.44, 1.88, 0.4, 4.6], [0.44, 1.88, 0.4, 0.9]].forEach(function (p) {
    var l = lantern(0.8, p[3]); l.position.set(p[0], p[1], p[2]); g.add(l);
  });
  var lg1 = lantern(0.9, 2.0); lg1.position.set(-1.0, 0.72, 0.94); g.add(lg1);
  var lg2 = lantern(0.9, 3.3); lg2.position.set(1.0, 0.72, 0.94); g.add(lg2);
  /* 月洞门院墙（地标级：门楼 + 门簪 + 门匾） */
  courtWall(g, ground, 0.96, 0.52, 0.18, { w: 2.16, back: 0.36, gate: 'full', gatePlaque: '南锣巷' });
  /* 抱鼓石（院门两侧） */
  var drumM = MAT('#b5afa0', { rough: 0.9 });
  [[-0.44], [0.44]].forEach(function (px) {
    B2_add_drum(g, px[0], ground, drumM);
  });
  /* 石狮（v2：须弥座 + 鬃毛） */
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
/* 抱鼓石：座 + 鼓（面向路径） */
function B2_add_drum(g, x, y, m) {
  var d = grp(); d.position.set(x, y, 1.1);
  d.add(box(0.07, 0.03, 0.1, m, 0, 0.015, 0));
  var drum = cyl(0.038, 0.038, 0.05, 12, m, 0, 0.065, 0);
  drum.rotation.x = PI / 2; d.add(drum);
  g.add(d);
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
