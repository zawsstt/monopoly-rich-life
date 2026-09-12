/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 15 虹桥高铁站（tile15_station.js）
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/sp_15.png（大跨度弧形屋顶 + 玻璃幕墙 + 站台雨棚 + CRH）
 * spec: .img2threejs/spec_station15.json（validate PASS + --strict-quality PASS, 4/8 轮）
 *
 *   window.Special3D[15]() → THREE.Group（原点=格心，底面 y=0，正面朝 +Z）
 *
 * 复刻要点（以参考图为准，裁剪证据 .img2threejs/crops_sp15/）：
 *   - 主站房：整面蓝玻璃幕墙（灰檩条网格 + 逐格明暗抖动 + 斜向反光带），
 *     山墙三角玻璃直抵屋面；奶油色弧形屋面（凹坡 + 檐角起翘 + 厚封檐板），短屋脊压顶
 *   - 门廊：第二层小弧形雨棚 + 朱红弓形弧梁 + 明亮内凹入口（灰白衬框 + 踏步）
 *   - 柱列：朱红圆柱 + 奶油斗拱帽 + 金棕两层柱础 + 檐下额枋
 *   - 右侧站台：抬高一档石站台（黄警戒线 + 钢护栏 + 长椅）+ 红柱低雨棚（翘檐 + 露明红椽）
 *     + 轨道（钢轨 / 混凝土轨枕 / 道床）+ CRH 车头（蓝腰线扫至鼻尖 / 环绕风挡 / 头灯）
 *   - 左翼：低矮玻璃耳房 + 翘檐披檐；台基条石；广场小绿地 / 售票亭 / 灯柱
 *
 * 动画（group.userData.anim = [fn(t,dt)]）：
 *   1) 站钟秒针 sweep + 分针缓行
 *   2) 站名牌灯箱呼吸（emissive 呼吸，幅度克制）
 *   3) CRH 头灯待发脉冲（emissive，幅度克制）
 *
 * 技术约束：经典 script；THREE r147 全局；MeshStandardMaterial（convertSRGBToLinear）；
 *           纹理全部 Canvas 程序化 ≤256px；mesh ≤420；球≥12 段、圆柱≥10 段；
 *           占地 ≤2.7×2.7，高 1.2–2.4；零 Math.random（mulberry32 确定性）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[tile15_station] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 工具 ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs, pow = Math.pow;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex),
    roughness: (o.rough !== undefined ? o.rough : 0.85),
    metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
  if (o.map) { m.map = o.map; }
  if (o.side) { m.side = o.side; }
  return m;
}
function mesh(geo, mat) {
  var o = new THREE.Mesh(geo, mat);
  o.castShadow = true; o.receiveShadow = true;
  return o;
}
function box(w, h, d, mat, x, y, z) {
  var o = mesh(new THREE.BoxGeometry(w, h, d), mat);
  o.position.set(x || 0, y || 0, z || 0);
  return o;
}
function cyl(rt, rb, h, seg, mat, x, y, z) {
  var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  o.position.set(x || 0, y || 0, z || 0);
  return o;
}
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z) {
  if (x !== undefined) o.position.set(x, y || 0, z || 0);
  parent.add(o);
  return o;
}
/* 确定性伪随机（禁 Math.random） */
function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
/* 合并簇：把若干已变换好的 BufferGeometry 缝成 1 个 mesh（optimization 关键） */
function mergeGeos(list) {
  var pos = [], nrm = [], uv = [], i, j, g, g2, p, n, u;
  for (i = 0; i < list.length; i++) {
    g = list[i];
    g2 = g.index ? g.toNonIndexed() : g;
    p = g2.attributes.position.array;
    n = g2.attributes.normal ? g2.attributes.normal.array : null;
    u = g2.attributes.uv ? g2.attributes.uv.array : null;
    for (j = 0; j < p.length; j++) pos.push(p[j]);
    if (n) { for (j = 0; j < n.length; j++) nrm.push(n[j]); }
    if (u) { for (j = 0; j < u.length; j++) uv.push(u[j]); }
  }
  var out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  if (nrm.length) out.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
  if (uv.length) out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  return out;
}
function tbox(w, h, d, x, y, z) {
  var geo = new THREE.BoxGeometry(w, h, d);
  geo.translate(x, y, z);
  return geo;
}
function tcyl(r, h, seg, x, y, z) {
  var geo = new THREE.CylinderGeometry(r, r, h, seg);
  geo.translate(x, y, z);
  return geo;
}

/* ================= 1. Canvas 程序化纹理（≤256px，零外部资源） ================= */
var _texCache = {};
function canvasTex(key, w, h, draw, rx, ry) {
  if (_texCache[key]) return _texCache[key];
  var cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  var g = cv.getContext('2d');
  draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  if (rx || ry) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(rx || 1, ry || 1);
  }
  _texCache[key] = tex;
  return tex;
}
/* 玻璃幕墙：4×4 格一贴，灰檩条 + 逐格明暗抖动 + 斜向反光带（gable_glass 裁剪） */
function texGlass() {
  return canvasTex('glass15', 256, 256, function (g, w, h) {
    var rnd = mulberry32(1509);
    var cell = w / 4, i, j;
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 4; j++) {
        var k = rnd();
        g.fillStyle = k > 0.72 ? '#7cc2d6' : (k > 0.3 ? '#4c9db6' : '#4189a4');
        g.fillRect(i * cell, j * cell, cell, cell);
        g.fillStyle = 'rgba(255,255,255,0.22)';
        g.fillRect(i * cell + 2, j * cell + 2, cell - 4, 5);
      }
    }
    g.globalAlpha = 0.15;
    g.fillStyle = '#dff4f8';
    for (i = -1; i < 6; i++) {
      g.beginPath();
      g.moveTo(i * 64, h); g.lineTo(i * 64 + 64, h);
      g.lineTo(i * 64 + 124, 0); g.lineTo(i * 64 + 60, 0);
      g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
    g.strokeStyle = '#93a8b2';
    g.lineWidth = 5;
    for (i = 0; i <= 4; i++) {
      g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, h); g.stroke();
      g.beginPath(); g.moveTo(0, i * cell); g.lineTo(w, i * cell); g.stroke();
    }
    g.strokeStyle = 'rgba(60,80,90,0.55)';
    g.lineWidth = 1.5;
    for (i = 0; i <= 4; i++) {
      g.beginPath(); g.moveTo(i * cell + 3, 0); g.lineTo(i * cell + 3, h); g.stroke();
    }
  });
}
/* 屋面：奶油底 + 沿坡向板缝 + 微噪 */
function texRoof() {
  return canvasTex('roof15', 128, 128, function (g, w, h) {
    g.fillStyle = '#ded8c8'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(1511);
    var i;
    for (i = 0; i < w; i += 32) {
      g.fillStyle = 'rgba(150,144,128,0.5)'; g.fillRect(i, 0, 2, h);
      g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(i + 2, 0, 1, h);
    }
    g.fillStyle = 'rgba(150,144,128,0.28)';
    g.fillRect(0, h / 2 - 1, w, 2);
    for (i = 0; i < 150; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(120,112,96,0.05)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  }, 3, 1);
}
/* 广场石板分缝 */
function texPlaza() {
  return canvasTex('plaza15', 128, 128, function (g, w, h) {
    g.fillStyle = '#c6bfae'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(140,132,116,0.6)'; g.lineWidth = 2;
    var i;
    for (i = 0; i <= 2; i++) {
      g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke();
      g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke();
    }
    var rnd = mulberry32(1513);
    for (i = 0; i < 200; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(110,102,88,0.07)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  }, 8, 8);
}
/* 道床碎石 */
function texBallast() {
  return canvasTex('ballast15', 128, 128, function (g, w, h) {
    g.fillStyle = '#8e887c'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(1517), i, x, y, r;
    for (i = 0; i < 320; i++) {
      x = rnd() * w; y = rnd() * h; r = 1 + rnd() * 2.4;
      g.fillStyle = rnd() > 0.5 ? 'rgba(178,172,158,0.5)' : 'rgba(94,88,78,0.5)';
      g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill();
    }
  }, 1, 6);
}
/* CRH 侧墙 livery：u=绕周（两侧 0.25/0.75），v=沿车长；蓝腰线 + 窗带 + 门缝 */
function texTrainSide() {
  return canvasTex('train15', 256, 256, function (g, w, h) {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(1519), i, side, x0;
    for (side = 0; side < 2; side++) {
      x0 = side === 0 ? w * 0.25 : w * 0.75;
      g.fillStyle = '#2f6fc4';                        /* 蓝腰线沿全长 */
      g.fillRect(x0 - 5, 0, 10, h);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(x0 - 5, 0, 3, h);
      g.fillStyle = '#2a2e33';                        /* 窗带 */
      g.fillRect(x0 - 26, h * 0.10, 52, h * 0.52);
      g.fillStyle = '#f2f0ea';
      for (i = 0; i < 8; i++) g.fillRect(x0 - 24, h * (0.10 + 0.065 * i), 48, 4);
      g.strokeStyle = 'rgba(120,124,130,0.8)'; g.lineWidth = 2;
      g.beginPath(); g.moveTo(x0 - 30, h * 0.06); g.lineTo(x0 - 30, h * 0.94); g.stroke();
      g.beginPath(); g.moveTo(x0 + 30, h * 0.06); g.lineTo(x0 + 30, h * 0.94); g.stroke();
      g.fillStyle = '#2a2e33';
      g.fillRect(x0 - 8, h * 0.10, 16, h * 0.52);     /* 车门窗 */
    }
    g.fillStyle = '#d8d4ca';                          /* 裙摆 */
    g.fillRect(0, h * 0.86, w, h * 0.14);
    for (i = 0; i < 90; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(90,94,100,0.04)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  });
}
/* 站名牌：藏蓝底 + 金字「虹桥高铁站」 */
function texSign() {
  return canvasTex('sign15', 256, 64, function (g, w, h) {
    g.fillStyle = '#223b5e'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e8c268'; g.lineWidth = 4;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#f0d488';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 40px "Microsoft YaHei","PingFang SC",sans-serif';
    g.fillText('虹桥高铁站', w / 2, h / 2 + 2);
  });
}
/* 售票亭牌 */
function texTicket() {
  return canvasTex('ticket15', 128, 64, function (g, w, h) {
    g.fillStyle = '#c84a2b'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#fdf6e8';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 40px "Microsoft YaHei","PingFang SC",sans-serif';
    g.fillText('售票', w / 2, h / 2 + 2);
  });
}
/* 草坪割草条纹 */
function texLawn() {
  return canvasTex('lawn15', 128, 128, function (g, w, h) {
    var i;
    for (i = 0; i < 4; i++) {
      g.fillStyle = i % 2 ? '#7fa05a' : '#8fb068';
      g.fillRect(0, i * 32, w, 32);
    }
    var rnd = mulberry32(1523);
    for (i = 0; i < 160; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(60,90,40,0.08)';
      g.fillRect(rnd() * w, rnd() * h, 1, 2);
    }
  }, 2, 2);
}

/* ================= 2. 材质库（共享实例） ================= */
var M = {
  roof:     std('#ded8c8', { rough: 0.72, map: texRoof(), side: THREE.DoubleSide }),
  fascia:   std('#e3ddcd', { rough: 0.7 }),
  ridge:    std('#cfc9b7', { rough: 0.72 }),
  mullion:  std('#93a8b2', { rough: 0.45, metal: 0.55 }),
  colRed:   std('#c84a2b', { rough: 0.5 }),
  cream:    std('#e3dcc8', { rough: 0.66 }),
  gold:     std('#c9a666', { rough: 0.55, metal: 0.25 }),
  plaza:    std('#c6bfae', { rough: 0.88, map: texPlaza() }),
  stoneD:   std('#b2aa98', { rough: 0.86 }),
  stoneM:   std('#c1b9a7', { rough: 0.88 }),
  white:    std('#edebe4', { rough: 0.7 }),
  ink:      std('#22262b', { rough: 0.78 }),
  rail:     std('#8d949c', { rough: 0.35, metal: 0.85 }),
  sleeper:  std('#9a948a', { rough: 0.92 }),
  ballast:  std('#8e887c', { rough: 0.95, map: texBallast() }),
  train:    std('#f2f0ea', { rough: 0.32, metal: 0.1 }),
  trainGlass: std('#2e3338', { rough: 0.18, metal: 0.3 }),
  trainDark: std('#33363b', { rough: 0.8, metal: 0.25 }),
  warn:     std('#d9b23c', { rough: 0.7 }),
  lawn:     std('#7fa05a', { rough: 0.94, map: texLawn() }),
  foliage:  std('#6e9450', { rough: 0.9 }),
  trunk:    std('#7a5a40', { rough: 0.9 }),
  lamp:     std('#e8e4d8', { rough: 0.6, metal: 0.15 }),
  clockFace: std('#f4f2ea', { rough: 0.5 }),
  navy:     std('#223b5e', { rough: 0.5 }),
  stripeBlue: std('#2f6fc4', { rough: 0.35 })
};
/* 发光材质（动画驱动，独立实例） */
var signMat = std('#223b5e', { rough: 0.5, emissive: '#e8c268', ei: 0.35 });
var lampGlowM = std('#ffe9b8', { rough: 0.4, emissive: '#ffd98a', ei: 0.55 });
var headlampM = std('#fff4d8', { rough: 0.25, emissive: '#ffedb8', ei: 0.6 });
var portalGlowM = std('#d9d6cc', { rough: 0.6, emissive: '#f6f4ee', ei: 0.85 });

/* 玻璃幕墙材质工厂：共享 canvas，各面独立 repeat */
function glassMat(rx, ry) {
  var t = texGlass().clone();
  t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rx, ry);
  return new THREE.MeshStandardMaterial({
    color: C('#cfe0e6'), map: t,
    roughness: 0.2, metalness: 0.2, flatShading: true
  });
}

/* ================= 3. 组件预制（form 阶段核心） ================= */
/* —— 3.1 弧形屋面 sweepRoof：凹坡 + 檐角起翘 + 厚封檐（参考图 identity 特征）
 *   返回 { top, skirt }；y=0 为檐口平面，脊在 +rise。 */
function sweepRoof(span, depth, rise, opt) {
  opt = opt || {};
  var hx = span / 2, hz = depth / 2;
  var rlx = hx * (opt.ridgeRatio !== undefined ? opt.ridgeRatio : 0.42);
  var rows = opt.rows || 8, perim = opt.perim || 48;
  var up = opt.upturn !== undefined ? opt.upturn : 0.08;
  function perimPoint(s) {
    var L = 2 * (span + depth) * s, x, z, L2;
    if (L < span) { x = -hx + L; z = hz; }
    else {
      L2 = L - span;
      if (L2 < depth) { x = hx; z = hz - L2; }
      else {
        L2 -= depth;
        if (L2 < span) { x = hx - L2; z = -hz; }
        else { L2 -= span; x = -hx; z = -hz + L2; }
      }
    }
    return { x: x, z: z };
  }
  var i, v, P = [];
  for (i = 0; i < perim; i++) P.push(perimPoint(i / perim));
  var pos = [], uv = [];
  function surfPt(E, vv) {
    var rx = Math.max(-rlx, Math.min(rlx, E.x));
    var t = pow(vv, 1.45);                           /* 凹坡：下段陡 */
    var x = rx + (E.x - rx) * vv;
    var z = E.z * vv;
    var corner = 0.35 + 0.65 * pow(abs(E.x) / hx, 4);
    var y = rise - rise * t + up * pow(vv, 6) * corner;
    return [x, y, z];
  }
  for (i = 0; i < perim; i++) {
    var A = P[i], B = P[(i + 1) % perim];
    for (v = 0; v < rows; v++) {
      var v0 = v / rows, v1 = (v + 1) / rows;
      var a0 = surfPt(A, v0), a1 = surfPt(A, v1);
      var b0 = surfPt(B, v0), b1 = surfPt(B, v1);
      pos.push(a0[0], a0[1], a0[2], b0[0], b0[1], b0[2], b1[0], b1[1], b1[2]);
      pos.push(a0[0], a0[1], a0[2], b1[0], b1[1], b1[2], a1[0], a1[1], a1[2]);
      uv.push(i / perim, v0, (i + 1) / perim, v0, (i + 1) / perim, v1);
      uv.push(i / perim, v0, (i + 1) / perim, v1, i / perim, v1);
    }
  }
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  /* 封檐裙边：檐口一圈竖板（外扩 0.006） */
  var sp = [], suv = [], TH = opt.fasciaH || 0.032, OUT = 0.006;
  for (i = 0; i < perim; i++) {
    var A2 = P[i], B2 = P[(i + 1) % perim];
    var at = surfPt(A2, 1), bt = surfPt(B2, 1);
    var al = Math.sqrt(at[0] * at[0] + at[2] * at[2]) || 1;
    var bl = Math.sqrt(bt[0] * bt[0] + bt[2] * bt[2]) || 1;
    at = [at[0] + at[0] / al * OUT, at[1], at[2] + at[2] / al * OUT];
    bt = [bt[0] + bt[0] / bl * OUT, bt[1], bt[2] + bt[2] / bl * OUT];
    var ab = [at[0], at[1] - TH, at[2]], bb = [bt[0], bt[1] - TH, bt[2]];
    sp.push(at[0], at[1], at[2], bt[0], bt[1], bt[2], bb[0], bb[1], bb[2]);
    sp.push(at[0], at[1], at[2], bb[0], bb[1], bb[2], ab[0], ab[1], ab[2]);
    suv.push(i / perim, 0, (i + 1) / perim, 0, (i + 1) / perim, 1);
    suv.push(i / perim, 0, (i + 1) / perim, 1, i / perim, 1);
  }
  var skirt = new THREE.BufferGeometry();
  skirt.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
  skirt.setAttribute('uv', new THREE.Float32BufferAttribute(suv, 2));
  skirt.computeVertexNormals();
  return { top: geo, skirt: skirt };
}
/* 屋顶组件；zLong=true：先沿 x 建 span 再转 90°（长边落 z 轴） */
function roofUnit(span, depth, rise, opt) {
  var g = grp();
  var s = sweepRoof(span, depth, rise, opt);
  g.add(mesh(s.top, M.roof));
  g.add(mesh(s.skirt, M.fascia));
  if (opt && opt.zLong) g.rotation.y = PI / 2;
  return g;
}
/* —— 3.2 立柱簇（合并几何：轴/础/帽/斗拱各自成 1 mesh）
 *   pts: [[x,z],...] 世界坐标；shaftTop: 柱顶 y；baseY: 柱础底 y */
function buildColumns(pts, shaftTop, opt) {
  opt = opt || {};
  var r = opt.r || 0.03;
  var baseY = opt.baseY !== undefined ? opt.baseY : 0.155;
  var shafts = [], bases = [], caps = [], arms = [], i, pt, x, z;
  var shH = shaftTop - 0.055 - (baseY + 0.056);
  for (i = 0; i < pts.length; i++) {
    pt = pts[i]; x = pt[0]; z = pt[1];
    shafts.push(tcyl(r, shH, 12, x, baseY + 0.056 + shH / 2, z));
    bases.push(tbox(r * 3.1, 0.026, r * 3.1, x, baseY + 0.013, z));
    bases.push(tbox(r * 2.6, 0.030, r * 2.6, x, baseY + 0.041, z));
    caps.push(tbox(r * 3.4, 0.030, r * 3.4, x, shaftTop - 0.040, z));
    arms.push(tbox(r * 4.4, 0.022, r * 2.2, x, shaftTop - 0.014, z));
    arms.push(tbox(r * 2.2, 0.020, r * 4.0, x, shaftTop + 0.004, z));
  }
  var g = grp();
  g.add(mesh(mergeGeos(shafts), M.colRed));
  g.add(mesh(mergeGeos(bases), M.gold));
  g.add(mesh(mergeGeos(caps), M.cream));
  g.add(mesh(mergeGeos(arms), M.colRed));
  return g;
}

/* ================= 4. 工厂主函数 ================= */
window.Special3D = window.Special3D || {};
window.Special3D[15] = function () {
  var g = grp();
  g.name = 'special_15_hsrc_station';

  /* 布局常量（格心原点，正面 +Z；包络 x -1.34..1.33，z -1.34..1.30） */
  var HALL_X = -0.24;          /* 站房轴线 */
  var TRACK_X = 1.225;         /* 轨道中心 */
  var PLZ = 0.095;             /* 广场面 */

  /* ========== [blockout] 地坪 ========== */
  put(g, box(2.68, 0.06, 2.68, M.stoneD, 0, 0.03, 0));               /* 条石台基 */
  put(g, box(2.60, 0.035, 2.60, M.plaza, 0, 0.0775, 0));             /* 广场石板 */
  put(g, box(0.25, 0.05, 2.50, M.ballast, TRACK_X, 0.055, 0.075));   /* 道床（顶 y=0.08） */

  /* ========== [blockout] 站房主体 ========== */
  var hall = grp(); put(g, hall, HALL_X, PLZ, -0.72);
  put(hall, box(2.04, 0.06, 0.98, M.stoneM, 0, 0.03, 0));            /* 站房台基 */
  put(hall, box(1.98, 0.83, 0.90, M.white, 0, 0.475, 0));            /* 站房体（local 顶 0.89） */
  /* 玻璃幕墙四面 */
  var glassF = mesh(new THREE.PlaneGeometry(1.94, 0.79), glassMat(4.4, 1.8));
  glassF.position.set(0, 0.475, 0.456); hall.add(glassF);
  var glassB = mesh(new THREE.PlaneGeometry(1.94, 0.79), glassMat(4.4, 1.8));
  glassB.position.set(0, 0.475, -0.456); glassB.rotation.y = PI; hall.add(glassB);
  var glassL = mesh(new THREE.PlaneGeometry(0.86, 0.79), glassMat(2.0, 1.8));
  glassL.position.set(-0.992, 0.475, 0); glassL.rotation.y = -PI / 2; hall.add(glassL);
  var glassR = mesh(new THREE.PlaneGeometry(0.86, 0.79), glassMat(2.0, 1.8));
  glassR.position.set(0.992, 0.475, 0); glassR.rotation.y = PI / 2; hall.add(glassR);
  /* 竖向玻璃肋 */
  var finGeo = [], fi;
  for (fi = -4; fi <= 4; fi++) finGeo.push(tbox(0.014, 0.80, 0.02, fi * 0.215, 0.475, 0.468));
  hall.add(mesh(mergeGeos(finGeo), M.mullion));
  /* 檐口带 + 阴影缝 */
  put(hall, box(2.06, 0.05, 0.98, M.cream, 0, 0.905, 0));
  put(hall, box(2.02, 0.028, 0.94, M.stoneD, 0, 0.875, 0));

  /* —— [form] 山墙三角玻璃（直抵屋面） */
  var gShape = new THREE.Shape();
  gShape.moveTo(-0.96, 0);
  gShape.lineTo(0.96, 0);
  gShape.lineTo(0.96, 0.10);
  gShape.lineTo(0.06, 0.46);
  gShape.lineTo(-0.06, 0.46);
  gShape.lineTo(-0.96, 0.10);
  gShape.closePath();
  var gableGeo = new THREE.ShapeGeometry(gShape);
  var gPos = gableGeo.attributes.position, gUV = [], gi;
  for (gi = 0; gi < gPos.count; gi++) {
    gUV.push((gPos.getX(gi) + 0.96) / 0.44, gPos.getY(gi) / 0.44);
  }
  gableGeo.setAttribute('uv', new THREE.Float32BufferAttribute(gUV, 2));
  var gable = mesh(gableGeo, glassMat(1, 1));
  gable.position.set(0, 0.90, 0.452);
  hall.add(gable);
  put(hall, box(0.035, 0.44, 0.016, M.mullion, 0, 1.12, 0.446));     /* 山墙中挺 */

  /* ========== [blockout] 主屋顶（弧形 sweep，y=0 即檐口平面） ========== */
  var mainRoof = roofUnit(2.20, 1.22, 0.48, { ridgeRatio: 0.5, upturn: 0.085, fasciaH: 0.04, rows: 9, perim: 56 });
  put(g, mainRoof, HALL_X, 1.24, -0.72);                             /* 檐 y1.24 · 脊 y1.72 */
  put(g, box(1.24, 0.05, 0.13, M.ridge, HALL_X, 1.725, -0.72));      /* 屋脊压顶 */
  var reL = mesh(new THREE.BoxGeometry(0.10, 0.045, 0.13), M.ridge);
  reL.position.set(HALL_X - 0.64, 1.745, -0.72); reL.rotation.z = 0.28; g.add(reL);
  var reR = mesh(new THREE.BoxGeometry(0.10, 0.045, 0.13), M.ridge);
  reR.position.set(HALL_X + 0.64, 1.745, -0.72); reR.rotation.z = -0.28; g.add(reR);

  /* ========== [structure] 前柱列 + 额枋 ========== */
  var colPts = [], cxs = [-0.90, -0.65, -0.40, -0.30, 0.30, 0.40, 0.65, 0.90], ci;
  for (ci = 0; ci < cxs.length; ci++) colPts.push([HALL_X + cxs[ci], -0.155]);
  g.add(buildColumns(colPts, 1.02, { baseY: 0.155, r: 0.030 }));
  put(g, box(1.94, 0.055, 0.075, M.cream, HALL_X, 1.048, -0.155));   /* 额枋 */
  put(g, box(2.00, 0.026, 0.09, M.cream, HALL_X, 1.088, -0.155));    /* 枋上压板 */

  /* ========== [structure] 门廊：雨棚 + 朱红弓梁 + 玻璃横披 + 入口 ========== */
  var porch = roofUnit(1.06, 0.50, 0.13, { ridgeRatio: 0.45, upturn: 0.06, fasciaH: 0.032, rows: 8, perim: 44 });
  put(g, porch, HALL_X, 1.02, -0.02);                                /* 檐 y1.02 · 脊 y1.15 */
  var arc = mesh(new THREE.TorusGeometry(0.45, 0.032, 10, 24, PI), M.colRed);
  arc.position.set(HALL_X, 0.90, -0.02);
  arc.scale.y = 0.32;                                                /* 弓形压扁 */
  g.add(arc);
  var transom = mesh(new THREE.PlaneGeometry(0.88, 0.13), glassMat(2.0, 0.4));
  transom.position.set(HALL_X, 1.0, -0.058);
  g.add(transom);                                                    /* 弓梁上玻璃横披 */
  /* 入口：白衬框 + 明亮开洞 + 灰过梁 + 踏步 */
  put(g, box(0.56, 0.62, 0.10, M.white, HALL_X, 0.475, -0.24));
  put(g, box(0.40, 0.52, 0.06, portalGlowM, HALL_X, 0.415, -0.215));
  put(g, box(0.46, 0.045, 0.09, M.stoneM, HALL_X, 0.675, -0.225));
  put(g, box(0.055, 0.52, 0.08, M.stoneM, HALL_X - 0.225, 0.415, -0.225));
  put(g, box(0.055, 0.52, 0.08, M.stoneM, HALL_X + 0.225, 0.415, -0.225));
  var stepGeo = [], si;
  for (si = 0; si < 3; si++) {
    stepGeo.push(tbox(0.70, 0.032, 0.16, HALL_X, 0.016 + si * 0.032 + PLZ, 0.02 + 0.08 + (2 - si) * 0.16));
  }
  g.add(mesh(mergeGeos(stepGeo), M.stoneM));
  put(g, box(0.70, 0.035, 0.20, M.stoneM, HALL_X, PLZ + 0.0175, 0.10));

  /* ========== [interaction] 站名牌 + 大钟 ========== */
  var signBoard = box(0.66, 0.115, 0.03, signMat, HALL_X, 1.135, -0.262);
  g.add(signBoard);
  var signFace = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.095),
    new THREE.MeshStandardMaterial({
      map: texSign(), roughness: 0.5, metalness: 0.05,
      emissive: C('#8a6a30'), emissiveIntensity: 0.3, flatShading: true
    }));
  signFace.position.set(HALL_X, 1.135, -0.246);
  g.add(signFace);

  var clockG = grp(); clockG.position.set(HALL_X, 0.965, 0.238); g.add(clockG); /* 吊挂于门廊雨棚额下 */
  var face = cyl(0.075, 0.075, 0.02, 20, M.clockFace, 0, 0, 0);
  face.rotation.x = PI / 2; clockG.add(face);
  var bezel = mesh(new THREE.TorusGeometry(0.078, 0.010, 8, 24), M.navy);
  clockG.add(bezel);
  put(clockG, box(0.010, 0.052, 0.006, M.ink, 0, 0.014, 0.014));     /* 分针 */
  var hourHand = box(0.013, 0.036, 0.006, M.ink, 0, 0.010, 0.012);
  hourHand.geometry.translate(0, 0.008, 0);
  clockG.add(hourHand);
  var secHand = box(0.004, 0.070, 0.005, std('#c8402a', { rough: 0.4 }), 0, 0, 0.016);
  secHand.geometry.translate(0, 0.021, 0);                            /* 支点在钟心 */
  clockG.add(secHand);
  put(clockG, cyl(0.008, 0.008, 0.012, 10, M.gold, 0, 0, 0.018));

  /* ========== [blockout/structure] 站台 + 雨棚 + 柱列 ========== */
  var platform = grp(); put(g, platform, 0.98, 0, -0.35);
  put(platform, box(0.26, 0.165, 1.90, M.stoneM, 0, 0.1775, 0));     /* 站台（顶 y0.26） */
  put(platform, box(0.275, 0.03, 1.90, M.plaza, 0, 0.245, 0));
  put(platform, box(0.05, 0.008, 1.86, M.warn, -0.098, 0.263, 0));   /* 黄警戒线 */
  var railParts = [], ri;
  for (ri = 0; ri < 9; ri++) railParts.push(tbox(0.016, 0.16, 0.016, -0.105, 0.343, -0.85 + ri * 0.21));
  railParts.push(tbox(0.02, 0.016, 1.72, -0.105, 0.415, 0));
  railParts.push(tbox(0.02, 0.016, 1.72, -0.105, 0.37, 0));
  platform.add(mesh(mergeGeos(railParts), M.rail));                  /* 护栏簇 */
  var benchGeo = [
    tbox(0.07, 0.022, 0.5, -0.02, 0.30, -0.5),
    tbox(0.05, 0.10, 0.04, -0.02, 0.25, -0.72),
    tbox(0.05, 0.10, 0.04, -0.02, 0.25, -0.28),
    tbox(0.07, 0.022, 0.5, -0.02, 0.30, 0.35),
    tbox(0.05, 0.10, 0.04, -0.02, 0.25, 0.13),
    tbox(0.05, 0.10, 0.04, -0.02, 0.25, 0.57)
  ];
  platform.add(mesh(mergeGeos(benchGeo), M.trunk));                  /* 站台长椅 */
  var pPts = [[0.92, -1.05], [0.92, -0.55], [0.92, -0.05], [0.92, 0.45]];
  g.add(buildColumns(pPts, 1.03, { baseY: 0.26, r: 0.026 }));
  var tieGeo = [], ti;
  for (ti = 0; ti < 3; ti++) tieGeo.push(tbox(0.05, 0.03, 0.50, 0.92, 0.955, -0.80 + ti * 0.50));
  g.add(mesh(mergeGeos(tieGeo), M.colRed));                          /* 柱间联系枋 */
  var rafterGeo = [];
  for (ti = 0; ti < 8; ti++) rafterGeo.push(tbox(0.42, 0.022, 0.03, 1.06, 1.035, -1.10 + ti * 0.24));
  g.add(mesh(mergeGeos(rafterGeo), M.colRed));                       /* 露明红椽 */
  var pCanopy = roofUnit(2.0, 0.58, 0.10, { ridgeRatio: 0.5, upturn: 0.05, fasciaH: 0.03, rows: 7, perim: 48, zLong: true });
  put(g, pCanopy, 1.03, 1.07, -0.32);                                /* 站台雨棚（沿 z，檐 y1.07） */

  /* ========== [structure] 轨道 ========== */
  put(g, box(0.016, 0.03, 2.45, M.rail, TRACK_X - 0.072, 0.105, 0.075));
  put(g, box(0.016, 0.03, 2.45, M.rail, TRACK_X + 0.072, 0.105, 0.075));
  var sleepers = [], si2;
  for (si2 = 0; si2 < 26; si2++) sleepers.push(tbox(0.24, 0.024, 0.075, TRACK_X, 0.088, -1.12 + si2 * 0.092));
  g.add(mesh(mergeGeos(sleepers), M.sleeper));

  /* ========== [form] CRH 车头（nose 朝 +Z） ========== */
  var train = grp(); put(g, train, TRACK_X, 0, 0.2);
  var bodyMat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: texTrainSide(), roughness: 0.32, metalness: 0.1, flatShading: true
  });
  var body = cyl(0.105, 0.105, 1.06, 16, bodyMat, 0, 0.255, 0);
  body.rotation.x = PI / 2;
  train.add(body);
  var nose = mesh(new THREE.SphereGeometry(0.105, 16, 12), M.train);
  nose.scale.set(1, 0.94, 3.1);
  nose.position.set(0, 0.252, 0.53);
  train.add(nose);
  var tail = mesh(new THREE.SphereGeometry(0.105, 14, 10), M.train);
  tail.position.set(0, 0.255, -0.53);
  train.add(tail);
  /* 环绕风挡（压扁球冠贴鼻） */
  var shield = mesh(new THREE.SphereGeometry(0.075, 14, 10, 0, PI * 2, 0, PI * 0.42), M.trainGlass);
  shield.scale.set(1.15, 0.72, 1.5);
  shield.position.set(0, 0.302, 0.435);
  shield.rotation.x = 0.42;
  train.add(shield);
  /* 腰线上鼻扫角 ×2（镜像） */
  var stripeCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.104, 0.235, 0.30),
    new THREE.Vector3(-0.088, 0.222, 0.52),
    new THREE.Vector3(-0.052, 0.208, 0.72),
    new THREE.Vector3(-0.012, 0.200, 0.835)
  ]);
  var noseStripe = mesh(new THREE.TubeGeometry(stripeCurve, 12, 0.008, 8), M.stripeBlue);
  train.add(noseStripe);
  var noseStripe2 = mesh(new THREE.TubeGeometry(stripeCurve, 12, 0.008, 8), M.stripeBlue);
  noseStripe2.scale.x = -1;
  train.add(noseStripe2);
  /* 头灯 ×2（emissive 动画） */
  var lampL = mesh(new THREE.SphereGeometry(0.016, 12, 10), headlampM);
  lampL.position.set(-0.062, 0.212, 0.752); lampL.castShadow = false;
  train.add(lampL);
  var lampR = mesh(new THREE.SphereGeometry(0.016, 12, 10), headlampM);
  lampR.position.set(0.062, 0.212, 0.752); lampR.castShadow = false;
  train.add(lampR);
  /* 裙摆/转向架 + 受电弓（合并簇） */
  train.add(mesh(mergeGeos([
    tbox(0.19, 0.055, 0.90, 0, 0.155, -0.05),
    tbox(0.17, 0.05, 0.16, 0, 0.15, 0.42),
    tbox(0.05, 0.075, 0.30, 0, 0.145, -0.42)
  ]), M.trainDark));
  train.add(mesh(mergeGeos([
    tbox(0.10, 0.008, 0.20, 0, 0.415, -0.28),
    tbox(0.008, 0.09, 0.008, -0.04, 0.372, -0.33),
    tbox(0.008, 0.09, 0.008, 0.04, 0.372, -0.23),
    tbox(0.07, 0.008, 0.012, 0, 0.335, -0.28)
  ]), M.trainDark));

  /* ========== [form] 左翼耳房 + 右连接块 ========== */
  var wing = grp(); put(g, wing, -1.14, PLZ, -0.66);
  put(wing, box(0.28, 0.66, 0.82, M.white, 0, 0.33, 0));
  var wGlass = mesh(new THREE.PlaneGeometry(0.78, 0.64), glassMat(1.8, 1.5));
  wGlass.position.set(0.142, 0.33, 0); wGlass.rotation.y = PI / 2; wing.add(wGlass);
  var wRoof = roofUnit(0.80, 0.38, 0.07, { ridgeRatio: 0.5, upturn: 0.04, fasciaH: 0.026, rows: 7, perim: 40, zLong: true });
  put(wing, wRoof, 0, 0.78, 0);
  /* 站房与站台之间的连接块 */
  put(g, box(0.24, 0.60, 0.86, M.white, 0.84, PLZ + 0.30, -0.72));
  var rGlass = mesh(new THREE.PlaneGeometry(0.82, 0.54), glassMat(1.9, 1.3));
  rGlass.position.set(0.84, PLZ + 0.32, -0.285); g.add(rGlass);
  var rCap = roofUnit(1.0, 0.34, 0.055, { ridgeRatio: 0.5, upturn: 0.035, fasciaH: 0.024, rows: 6, perim: 36, zLong: true });
  put(g, rCap, 0.84, PLZ + 0.62, -0.72);

  /* ========== [form] 广场：绿地 / 售票亭 / 灯柱 ========== */
  put(g, box(0.84, 0.026, 0.66, M.lawn, -0.86, PLZ + 0.013, 0.92));
  put(g, cyl(0.02, 0.026, 0.16, 10, M.trunk, -1.18, PLZ + 0.08, 1.06));
  var treeTop = mesh(new THREE.SphereGeometry(0.09, 12, 10), M.foliage);
  put(g, treeTop, -1.18, PLZ + 0.24, 1.06);
  var bushList = [
    new THREE.SphereGeometry(0.045, 12, 10), new THREE.SphereGeometry(0.038, 12, 10),
    new THREE.SphereGeometry(0.050, 12, 10), new THREE.SphereGeometry(0.034, 12, 10)
  ];
  var bushT = [
    [-0.62, PLZ + 0.030, 1.10], [-0.52, PLZ + 0.026, 0.86],
    [-1.02, PLZ + 0.028, 0.68], [-0.72, PLZ + 0.024, 0.66]
  ];
  var bi;
  for (bi = 0; bi < 4; bi++) bushList[bi].translate(bushT[bi][0], bushT[bi][1], bushT[bi][2]);
  g.add(mesh(mergeGeos(bushList), M.foliage));
  /* 售票亭 */
  var booth = grp(); put(g, booth, 0.38, PLZ, 0.88);
  put(booth, box(0.26, 0.30, 0.22, M.white, 0, 0.15, 0));
  var bWin = mesh(new THREE.PlaneGeometry(0.14, 0.12), M.trainGlass);
  bWin.position.set(0, 0.18, 0.112); booth.add(bWin);
  var bSign = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.07),
    new THREE.MeshStandardMaterial({ map: texTicket(), roughness: 0.55, flatShading: true }));
  bSign.position.set(0, 0.295, 0.112); booth.add(bSign);
  var bRoof = roofUnit(0.34, 0.30, 0.05, { ridgeRatio: 0.45, upturn: 0.03, fasciaH: 0.02, rows: 6, perim: 32 });
  put(booth, bRoof, 0, 0.315, 0);
  /* 灯柱 ×2（合并簇）+ 暖光透镜 */
  g.add(mesh(mergeGeos([
    tcyl(0.011, 0.42, 10, -0.30, PLZ + 0.21, 1.20),
    tbox(0.075, 0.02, 0.05, -0.30, PLZ + 0.425, 1.20),
    tcyl(0.011, 0.42, 10, 0.66, PLZ + 0.21, 1.20),
    tbox(0.075, 0.02, 0.05, 0.66, PLZ + 0.425, 1.20)
  ]), M.lamp));
  g.add(mesh(mergeGeos([
    tbox(0.055, 0.012, 0.035, -0.30, PLZ + 0.414, 1.20),
    tbox(0.055, 0.012, 0.035, 0.66, PLZ + 0.414, 1.20)
  ]), lampGlowM));

  /* ========== [interaction] 动画（秒针 / 名牌呼吸 / 头灯脉冲） ========== */
  var signEmissive = signFace.material;
  g.userData.anim = [
    function (t) {                                   /* 1) 站钟：秒针 sweep + 分针缓行 */
      secHand.rotation.z = -t * (PI / 30);
      hourHand.rotation.z = -t * 0.0021;
    },
    function (t) {                                   /* 2) 站名牌灯箱呼吸（克制） */
      var k = 0.35 + 0.22 * sin(t * 1.6);
      signMat.emissiveIntensity = k;
      signEmissive.emissiveIntensity = k * 0.9;
    },
    function (t) {                                   /* 3) CRH 头灯待发脉冲 */
      headlampM.emissiveIntensity = 0.55 + 0.3 * sin(t * 2.2);
    }
  ];

  return g;
};
})();
