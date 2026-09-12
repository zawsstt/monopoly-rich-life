/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 12 监狱（tile12_jail.js）
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/sp_12.png（看守所/拘留所大门建筑群 正视图）
 *
 *   window.Special3D[12]() → THREE.Group（原点=格心，底面 y=0，正面朝 +Z）
 *
 * 复刻要点（以参考图为准）：
 *   - 院墙四围：白墙面 + 蓝压顶 + 蓝墙裙 + 竖缝长窗（recessed slit windows）
 *   - 大门：双灰石门柱（三层帽龛）+ 横梁 + 梁上警徽（金穗环/红底盘/金星）
 *   - 铁栅双开门：拱形门头 + 竖向铁条 + 中缝锁匣 + 外露合页
 *   - 双瞭望塔：塔身/开敞塔室/蓝四棱锥顶/顶针，随门柱成镜像对称
 *   - 主楼：三层白墙牢房 + 蓝雨篷铁栅窗 + 壁柱分隔 + 蓝灰四坡条缝屋顶
 *   - 沙盘加映（俯视可见）：门内红白横杆、警卫房、放风小院、探照灯、警灯红蓝交替
 *
 * 动画（group.userData.anim = [fn(t,dt)]）：
 *   1) 瞭望塔探照灯缓扫（pivot 轻摆 + 光锥呼吸）
 *   2) 横梁警灯红蓝交替发光（emissive 强度对相）
 *
 * 技术约束：经典 script；THREE r147 全局；MeshStandardMaterial（convertSRGBToLinear）；
 *           纹理全部 Canvas 程序化 ≤256px；mesh ≤420；球≥12 段、圆柱≥10 段。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[tile12_jail] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ---------- 0. 工具 ---------- */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
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
  if (o.opacity !== undefined) { m.transparent = true; m.opacity = o.opacity; }
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
function sph(r, mat, x, y, z) {
  var o = mesh(new THREE.SphereGeometry(r, 12, 10), mat);
  o.position.set(x || 0, y || 0, z || 0);
  return o;
}
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry) {
  if (x !== undefined || y !== undefined || z !== undefined) {
    o.position.set(x || 0, y || 0, z || 0);
  }
  if (ry) o.rotation.y = ry;
  parent.add(o);
  return o;
}
/* 确定性伪随机（砖缝/污渍用，禁止 Math.random 保证可复现） */
function mulberry32(seed) {
  var a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 1. Canvas 程序化纹理（≤256px，零外部资源） ---------- */
var _texCache = {};
function canvasTex(key, w, h, draw, repeatX, repeatY) {
  if (_texCache[key]) return _texCache[key];
  var cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  var g = cv.getContext('2d');
  draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  if (repeatX || repeatY) {
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(repeatX || 1, repeatY || 1);
  }
  _texCache[key] = tex;
  return tex;
}
/* 白色抹灰墙：灰污渍晕斑 + 顶部雨水垂痕 + 细噪点（参考图墙面细部） */
function texWall() {
  return canvasTex('wall', 128, 128, function (g, w, h) {
    g.fillStyle = '#e8e6e0'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(1201);
    var i, x, y, r;
    for (i = 0; i < 26; i++) {                       /* 大块灰晕 */
      x = rnd() * w; y = rnd() * h; r = 6 + rnd() * 16;
      g.fillStyle = 'rgba(160,156,146,' + (0.05 + rnd() * 0.06).toFixed(3) + ')';
      g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill();
    }
    for (i = 0; i < 9; i++) {                        /* 顶部雨水垂痕 */
      x = rnd() * w;
      g.fillStyle = 'rgba(150,146,136,' + (0.06 + rnd() * 0.08).toFixed(3) + ')';
      g.fillRect(x, 0, 1 + rnd() * 2, h * (0.25 + rnd() * 0.5));
    }
    for (i = 0; i < 240; i++) {                      /* 细噪点 */
      x = rnd() * w; y = rnd() * h;
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(120,116,106,0.05)';
      g.fillRect(x, y, 1, 1);
    }
  }, 2, 1);
}
/* 蓝灰屋面：竖向条缝（standing seam）+ 微噪 */
function texRoof() {
  return canvasTex('roof', 128, 128, function (g, w, h) {
    g.fillStyle = '#46598c'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(902);
    var i;
    for (i = 0; i < w; i += 16) {                    /* 条缝 */
      g.fillStyle = '#3a4c78'; g.fillRect(i, 0, 3, h);
      g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(i + 3, 0, 1, h);
    }
    for (i = 0; i < 160; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(10,16,34,0.05)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  }, 2, 1);
}
/* 院内铺装：浅石板 + 分缝格线 */
function texPave() {
  return canvasTex('pave', 64, 64, function (g, w, h) {
    g.fillStyle = '#c9c2b2'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(140,132,118,0.55)'; g.lineWidth = 1;
    g.strokeRect(0.5, 0.5, w - 1, h - 1);
    var rnd = mulberry32(77);
    for (var i = 0; i < 70; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(110,102,90,0.07)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  }, 6, 6);
}
/* 横杆红白条纹 */
function texBoom() {
  return canvasTex('boom', 64, 16, function (g, w, h) {
    var i;
    for (i = 0; i < w; i += 16) {
      g.fillStyle = '#c23b2e'; g.fillRect(i, 0, 8, h);
      g.fillStyle = '#f2f0ea'; g.fillRect(i + 8, 0, 8, h);
    }
  }, 3, 1);
}
/* 编号牌（12 号） */
function texPlate() {
  return canvasTex('plate', 64, 64, function (g, w, h) {
    g.fillStyle = '#27427e'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d9a83c'; g.lineWidth = 4; g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#f2f0ea';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 30px "Microsoft YaHei","Arial",sans-serif';
    g.fillText('12', w / 2, h / 2 + 2);
  });
}

/* ---------- 2. 材质库（共享，压缩材质数） ---------- */
var M = {
  wall:     std('#e8e6e0', { rough: 0.88, map: texWall() }),        /* 白抹灰墙面 */
  wallIn:   std('#d9d6cc', { rough: 0.9 }),                          /* 墙内侧面 */
  pier:     std('#b7b3a8', { rough: 0.85 }),                         /* 门柱灰石 */
  blue:     std('#33549e', { rough: 0.62 }),                         /* 蓝压顶/墙裙/雨篷 */
  blueD:    std('#27427e', { rough: 0.62 }),                         /* 深一档蓝（帽带/门牌底） */
  roof:     std('#46598c', { rough: 0.6, metal: 0.22, map: texRoof() }), /* 条缝屋面 */
  steelL:   std('#9aa0a6', { rough: 0.42, metal: 0.85 }),            /* 铁栅亮杆 */
  steelD:   std('#565d66', { rough: 0.48, metal: 0.8 }),             /* 门框/锁匣暗钢 */
  gold:     std('#d9a83c', { rough: 0.35, metal: 0.9 }),             /* 徽章金 */
  redEn:    std('#c23b2e', { rough: 0.4 }),                          /* 徽章红珐琅 */
  navy:     std('#2b3f66', { rough: 0.42 }),                         /* 窗框藏蓝 */
  glassD:   std('#232f4e', { rough: 0.3, metal: 0.1 }),              /* 暗玻璃 */
  ink:      std('#22262b', { rough: 0.7 }),                          /* 洞口/开口 */
  concrete: std('#cdc7b8', { rough: 0.94 }),                         /* 地坪 */
  asphalt:  std('#4c5058', { rough: 0.95 }),                         /* 门前路带 */
  pave:     std('#cfc8b8', { rough: 0.92, map: texPave() }),         /* 院内铺装 */
  finial:   std('#2e3440', { rough: 0.5, metal: 0.4 }),              /* 塔顶针 */
  whiteTrim: std('#f2f0ea', { rough: 0.6 })                          /* 檐口白 */
};
/* 发光材质（动画驱动，独立实例） */
var lampRedM  = std('#571712', { rough: 0.4, emissive: '#ff3524', ei: 0.25 });
var lampBlueM = std('#122050', { rough: 0.4, emissive: '#2e6bff', ei: 0.25 });
var lensM     = std('#ffe9b8', { rough: 0.35, emissive: '#ffd98a', ei: 0.9 });
var beamM = new THREE.MeshBasicMaterial({
  color: C('#ffe9b8'), transparent: true, opacity: 0.10,
  blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
});

/* ---------- 3. 预制组件 ---------- */
/* 带竖缝长窗的墙段：墙身 + 蓝压顶 + 蓝墙裙 + 3 竖缝窗 */
function wallRun(len, withSlits) {
  var g = grp();
  var body = box(len, 0.60, 0.12, M.wall, 0, 0.30, 0);
  g.add(body);
  g.add(box(len + 0.055, 0.055, 0.17, M.blue, 0, 0.6275, 0));   /* 压顶（挑出） */
  g.add(box(len + 0.02, 0.16, 0.135, M.blue, 0, 0.08, 0));      /* 墙裙 */
  if (withSlits) {
    var i;
    for (i = 0; i < 3; i++) {
      var sx = (i - 1) * len * 0.36;                            /* 3 缝沿段中部分布 */
      g.add(box(0.048, 0.30, 0.02, M.ink, sx, 0.36, 0.051));           /* 竖缝窗（凹陷读感） */
      g.add(box(0.064, 0.316, 0.012, M.wallIn, sx, 0.36, 0.044));
    }
  }
  return g;
}
/* 端头墙垛：垛身 + 白帽 + 蓝顶 */
function endPier() {
  var g = grp();
  put(g, box(0.16, 0.72, 0.16, M.pier, 0, 0.36, 0));
  put(g, box(0.20, 0.05, 0.20, M.whiteTrim, 0, 0.745, 0));
  put(g, box(0.23, 0.04, 0.23, M.blue, 0, 0.79, 0));
  return g;
}
/* 大门门柱：柱身 + 三层帽龛（灰缘带/白石板/蓝顶带） */
function gatePier() {
  var g = grp();
  put(g, box(0.28, 1.06, 0.28, M.pier, 0, 0.55, 0));
  put(g, box(0.34, 0.035, 0.34, M.pier, 0, 1.0775, 0));
  put(g, box(0.40, 0.075, 0.40, M.whiteTrim, 0, 1.1325, 0));
  put(g, box(0.44, 0.035, 0.44, M.blue, 0, 1.1875, 0));
  return g;
}
/* 铁栅门扇：边梃 + 拱形门头 + 竖铁条 + 双横撑 + 底槛（sign=±1 镜像） */
function gateLeaf(sign) {
  var g = grp();
  var W = 0.415, H = 0.86, x0 = sign * (W / 2);
  g.add(box(0.045, H, 0.034, M.steelD, x0, H / 2 + 0.04, 0));            /* 外边梃 */
  g.add(box(W, 0.05, 0.034, M.steelD, 0, 0.065, 0));                      /* 底槛 */
  g.add(box(W * 0.96, 0.028, 0.028, M.steelL, 0, H - 0.02, 0));           /* 拱脚横梁 */
  var arch = mesh(new THREE.TorusGeometry(W / 2, 0.016, 8, 20, PI), M.steelL);
  arch.position.set(0, H - 0.02, 0);
  g.add(arch);                                                             /* 拱形门头 */
  var i, bx;
  for (i = 0; i < 7; i++) {                                                /* 竖铁条（圆柱 ≥10 段） */
    bx = -W / 2 + 0.05 + i * (W - 0.10) / 6;
    g.add(cyl(0.0125, 0.0125, H - 0.09, 10, M.steelL, sign * Math.abs(bx), H / 2 - 0.005, 0));
  }
  g.add(box(W * 0.92, 0.02, 0.02, M.steelL, 0, 0.36, 0));                 /* 横撑下 */
  g.add(box(W * 0.92, 0.02, 0.02, M.steelL, 0, 0.60, 0));                 /* 横撑上 */
  /* 合页（外露，装在外边梃上） */
  g.add(box(0.05, 0.032, 0.05, M.steelD, sign * (W / 2 + 0.01), 0.24, 0));
  g.add(box(0.05, 0.032, 0.05, M.steelD, sign * (W / 2 + 0.01), 0.68, 0));
  return g;
}
/* 铁栅窗单元：藏蓝框 + 暗玻璃 + 双竖铁条 + 蓝雨篷 */
function windowUnit(w, h) {
  var g = grp();
  put(g, box(w + 0.05, h + 0.05, 0.03, M.navy, 0, 0, 0.015));
  put(g, box(w, h, 0.026, M.glassD, 0, 0, 0.022));
  put(g, box(0.016, h, 0.03, M.steelL, -w / 6, 0, 0.03));
  put(g, box(0.016, h, 0.03, M.steelL, w / 6, 0, 0.03));
  put(g, box(w, 0.014, 0.028, M.steelL, 0, 0, 0.03));
  var aw = box(w + 0.06, 0.024, 0.10, M.blue, 0, h / 2 + 0.055, 0.045);
  aw.rotation.x = 0.32;                                                    /* 雨篷前倾 */
  g.add(aw);
  return g;
}
/* 瞭望塔：塔身 + 塔室（角柱/开敞瞭望口）+ 蓝四棱锥顶 + 顶针 */
function turret(withSearchlight) {
  var g = grp();
  put(g, box(0.24, 1.02, 0.24, M.wall, 0, 0.53, 0));                       /* 塔身（入墙群） */
  put(g, box(0.40, 0.045, 0.40, M.whiteTrim, 0, 1.0625, 0));               /* 塔室底板 */
  var px = [1, -1];
  var i, sx, sz;
  for (i = 0; i < 2; i++) {
    for (var k = 0; k < 2; k++) {
      sx = px[i]; sz = px[k];
      put(g, box(0.045, 0.22, 0.045, M.wall, sx * 0.165, 1.195, sz * 0.165));  /* 角柱 */
    }
  }
  put(g, box(0.14, 0.11, 0.02, M.ink, 0, 1.20, 0.172));                    /* 瞭望口 +Z */
  put(g, box(0.14, 0.11, 0.02, M.ink, 0, 1.20, -0.172));                   /* 瞭望口 -Z */
  put(g, box(0.02, 0.11, 0.14, M.ink, 0.172, 1.20, 0));                    /* 瞭望口 +X */
  put(g, box(0.02, 0.11, 0.14, M.ink, -0.172, 1.20, 0));                   /* 瞭望口 -X */
  var roof = mesh(new THREE.ConeGeometry(0.315, 0.30, 4), M.roof);         /* 蓝四棱锥顶 */
  roof.geometry.rotateY(PI / 4);                                           /* 方位烘焙进几何，避免 AABB 膨胀 */
  roof.position.y = 1.46;
  g.add(roof);
  put(g, cyl(0.012, 0.02, 0.09, 10, M.finial, 0, 1.645, 0));               /* 顶针杆 */
  put(g, sph(0.022, M.finial, 0, 1.70, 0));                                /* 顶针球 */
  if (withSearchlight) {
    var pivot = grp();                                                     /* 探照灯摆动枢轴 */
    pivot.position.set(0, 1.16, -0.20);                                    /* 朝院内（-Z）照明 */
    var bodyL = mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.10, 10), M.steelD);
    bodyL.rotation.x = PI / 2; bodyL.position.z = -0.045;
    pivot.add(bodyL);
    var lens = mesh(new THREE.CylinderGeometry(0.046, 0.046, 0.016, 10), lensM);
    lens.rotation.x = PI / 2; lens.position.z = -0.10;
    lens.castShadow = false;
    pivot.add(lens);
    var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.20, 0.85, 12, 1, true), beamM);
    beam.rotation.x = PI / 2; beam.position.z = -0.53;                     /* 近小远大，指向院内 */
    beam.castShadow = false; beam.receiveShadow = false;
    pivot.add(beam);
    g.add(pivot);
    g.userData.searchlightPivot = pivot;
  }
  return g;
}
/* 四坡条缝屋顶（BufferGeometry：含短屋脊，UV 沿 x 供条缝纹理走向） */
function hipRoofGeo(w, d, h, ridge) {
  var hw = w / 2, hd = d / 2, rx = ridge / 2;
  /* 顶点：脊线两端 + 檐口四角 */
  var rA = [-rx, h, 0], rB = [rx, h, 0];
  var c = [[hw, 0, hd], [hw, 0, -hd], [-hw, 0, -hd], [-hw, 0, hd]]; /* +z, -z, -z, +z 角 */
  function quad(a, b, cc, d2) { return [a[0], a[1], a[2], b[0], b[1], b[2], cc[0], cc[1], cc[2], a[0], a[1], a[2], cc[0], cc[1], cc[2], d2[0], d2[1], d2[2]]; }
  var pos = [];
  pos = pos.concat(quad(rA, rB, c[0], c[3]));   /* 前坡 (+z) */
  pos = pos.concat(quad(rB, rA, c[1], c[2]));   /* 后坡 (-z) */
  pos = pos.concat(quad(rB, rA, c[0], c[1]));   /* 右坡 (+x) */
  pos = pos.concat(quad(rA, rB, c[2], c[3]));   /* 左坡 (-x) */
  var geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  var uv = [], n = pos.length / 3, i;
  for (i = 0; i < n; i++) { uv.push((pos[i * 3] + hw) / w * 2, (pos[i * 3 + 2] + hd) / d); }
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}
/* 警徽（金穗环 + 红底盘 + 金星 + 金横牌），z 轴朝 +Z */
function policeEmblem(r) {
  var g = grp();
  var disc = mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.92, r * 0.22, 20), M.redEn);
  disc.rotation.x = PI / 2;
  g.add(disc);
  var ring = mesh(new THREE.TorusGeometry(r * 0.95, r * 0.09, 8, 24), M.gold);
  g.add(ring);
  var i, side;
  for (side = -1; side <= 1; side += 2) {                                   /* 麦穗弧（环抱下半侧） */
    var ear = mesh(new THREE.TorusGeometry(r * 0.55, r * 0.085, 8, 18, PI * 0.85), M.gold);
    ear.position.set(side * r * 0.66, -r * 0.22, r * 0.16);
    ear.rotation.z = PI * 0.62;
    g.add(ear);
  }
  /* 金星（挤出五角星，居中醒目） */
  var sh = new THREE.Shape();
  for (i = 0; i < 10; i++) {
    var rad = (i % 2) ? r * 0.26 : r * 0.56;
    var a = -PI / 2 + i * PI / 5;
    var x = cos(a) * rad, y = sin(a) * rad;
    if (i === 0) sh.moveTo(x, y); else sh.lineTo(x, y);
  }
  sh.closePath();
  var star = mesh(new THREE.ExtrudeGeometry(sh, { depth: r * 0.14, bevelEnabled: false }), M.gold);
  star.position.set(0, r * 0.22, r * 0.16);
  g.add(star);
  put(g, box(r * 0.66, r * 0.17, r * 0.09, M.gold, 0, -r * 0.28, r * 0.14)); /* 下横牌 */
  return g;
}

/* ---------- 4. 工厂主函数 ---------- */
window.Special3D = window.Special3D || {};
window.Special3D[12] = function () {
  var g = grp();
  g.name = 'special_12_jail';

  /* ========== 地坪（底面贴 y=0） ========== */
  put(g, box(2.68, 0.04, 2.68, M.concrete, 0, 0.02, 0));
  put(g, box(1.30, 0.014, 0.10, M.asphalt, 0, 0.045, 1.295));              /* 门前路带 */
  put(g, box(2.34, 0.012, 2.20, M.pave, 0, 0.044, -0.10));                 /* 院内铺装 */

  /* ========== 院墙四围（墙外沿格边留 ~0.2 空隙） ========== */
  /* 前墙（门两侧短跑）z=1.22 */
  var wfL = wallRun(0.45, true);  put(g, wfL, 0.915, 0, 1.22);
  var wfR = wallRun(0.45, true);  put(g, wfR, -0.915, 0, 1.22);
  var epL = endPier(); put(g, epL, 1.22, 0, 1.22);
  var epR = endPier(); put(g, epR, -1.22, 0, 1.22);
  /* 侧墙 x=±1.26（从墙垛后到后角） */
  var wsL = wallRun(2.26, true);  wsL.rotation.y = PI / 2; put(g, wsL, 1.26, 0, 0.03);
  var wsR = wallRun(2.26, true);  wsR.rotation.y = PI / 2; put(g, wsR, -1.26, 0, 0.03);
  /* 后墙 z=-1.26 */
  var wr = wallRun(2.42, false);  put(g, wr, 0, 0, -1.26);

  /* ========== 大门（门柱 + 横梁 + 警徽 + 铁栅门 + 警灯 + 门牌） ========== */
  var gpL = gatePier(); put(g, gpL, 0.56, 0, 1.12);
  var gpR = gatePier(); put(g, gpR, -0.56, 0, 1.12);

  var header = grp(); put(g, header, 0, 0, 1.12);
  put(header, box(1.38, 0.24, 0.26, M.pier, 0, 1.18, 0));                  /* 横梁 */
  put(header, box(1.42, 0.03, 0.28, M.blue, 0, 1.315, 0));                 /* 蓝檐带 */
  put(header, box(1.46, 0.045, 0.30, M.whiteTrim, 0, 1.3525, 0));          /* 白顶板 */
  var emblem = policeEmblem(0.15); put(header, emblem, 0, 1.19, 0.15);     /* 警徽（+Z 面） */
  /* 警灯 ×2（红蓝交替 emissive 动画） */
  put(header, cyl(0.035, 0.045, 0.05, 10, M.steelD, 0.50, 1.02, 0.10));
  put(header, cyl(0.035, 0.045, 0.05, 10, M.steelD, -0.50, 1.02, 0.10));
  var lampL = sph(0.032, lampRedM, 0.50, 0.995, 0.10); lampL.castShadow = false; header.add(lampL);
  var lampR = sph(0.032, lampBlueM, -0.50, 0.995, 0.10); lampR.castShadow = false; header.add(lampR);

  /* 门牌（12 号，右门柱正面） */
  put(g, box(0.16, 0.11, 0.018, M.blueD, -0.56, 0.80, 1.268));
  var plate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.135, 0.09),
    new THREE.MeshStandardMaterial({ map: texPlate(), roughness: 0.5, metalness: 0.05, flatShading: true })
  );
  plate.position.set(-0.56, 0.80, 1.279);
  g.add(plate);

  /* 门洞内衬（灰石门颊 + 顶板） */
  put(g, box(0.06, 0.98, 0.24, M.pier, 0.40, 0.51, 1.13));
  put(g, box(0.06, 0.98, 0.24, M.pier, -0.40, 0.51, 1.13));
  put(g, box(0.84, 0.06, 0.24, M.pier, 0, 1.00, 1.13));
  put(g, box(0.84, 0.022, 0.20, M.ink, 0, 0.985, 1.14));                   /* 门洞内阴影顶（薄） */

  /* 铁栅双开门（拱形门头） */
  var leafL = gateLeaf(1);  put(g, leafL, 0.2075, 0.02, 1.22);
  var leafR = gateLeaf(-1); put(g, leafR, -0.2075, 0.02, 1.22);
  /* 中缝锁匣 + 插销 */
  put(g, box(0.085, 0.15, 0.05, M.steelD, 0, 0.56, 1.22));
  put(g, box(0.03, 0.10, 0.035, M.steelD, 0, 0.30, 1.225));
  put(g, box(0.03, 0.10, 0.035, M.steelD, 0, 0.42, 1.225));

  /* 门内红白横杆（警卫房横杆，透过栅门可见） */
  var boomPostL = box(0.03, 0.55, 0.03, M.steelD, 0.36, 0.32, 1.06); g.add(boomPostL);
  var boomPostR = box(0.03, 0.55, 0.03, M.steelD, -0.36, 0.32, 1.06); g.add(boomPostR);
  var boom = cyl(0.02, 0.02, 0.78, 10, std('#f2f0ea', { rough: 0.5, map: texBoom() }), 0, 0.57, 1.06);
  boom.rotation.z = PI / 2;
  g.add(boom);

  /* ========== 双瞭望塔（镜像对称；+x 塔带探照灯） ========== */
  var tL = turret(true);  put(g, tL, 0.72, 0, 1.04);
  var tR = turret(false); put(g, tR, -0.72, 0, 1.04);

  /* ========== 主楼（三层牢房 + 四坡条缝屋顶） ========== */
  put(g, box(1.72, 0.10, 0.98, M.pier, 0, 0.07, -0.55));                   /* 灰石台基 */
  put(g, box(1.68, 1.60, 0.94, M.wall, 0, 0.92, -0.55));                   /* 楼身 */
  put(g, box(1.76, 0.08, 1.00, M.whiteTrim, 0, 1.76, -0.55));              /* 白檐口 */
  put(g, box(1.78, 0.028, 1.02, M.blue, 0, 1.712, -0.55));                 /* 蓝檐带 */
  /* 壁柱分隔（前面 6 条 + 侧面 4 条） */
  var pilX = [0.825, 0.495, 0.165, -0.165, -0.495, -0.825];
  var i;
  for (i = 0; i < pilX.length; i++) put(g, box(0.05, 1.52, 0.016, M.whiteTrim, pilX[i], 0.94, -0.074));
  for (i = 0; i < 2; i++) {
    put(g, box(0.016, 1.52, 0.05, M.whiteTrim, 0.846, 0.94, -0.35 - i * 0.42));
    put(g, box(0.016, 1.52, 0.05, M.whiteTrim, -0.846, 0.94, -0.35 - i * 0.42));
  }
  /* 铁栅窗：正面 5 楹 × 3 层 */
  var rowY = [0.45, 0.90, 1.35];
  var colX = [-0.66, -0.33, 0, 0.33, 0.66];
  var r, c2;
  for (r = 0; r < 3; r++) {
    for (c2 = 0; c2 < 5; c2++) {
      var wu = windowUnit(0.24, 0.28);
      put(g, wu, colX[c2], rowY[r], -0.076);
    }
  }
  /* 侧面窗：每侧 2 楹 × 3 层 */
  for (r = 0; r < 3; r++) {
    for (i = 0; i < 2; i++) {
      var wz = windowUnit(0.22, 0.26);
      wz.rotation.y = PI / 2; put(g, wz, 0.846, rowY[r], -0.33 - i * 0.42);
      var wz2 = windowUnit(0.22, 0.26);
      wz2.rotation.y = -PI / 2; put(g, wz2, -0.846, rowY[r], -0.33 - i * 0.42);
    }
  }
  /* 四坡条缝屋顶 + 脊带 */
  var roof = mesh(hipRoofGeo(1.94, 1.16, 0.44, 0.60), M.roof);
  roof.position.set(0, 1.77, -0.55);
  g.add(roof);
  put(g, box(0.64, 0.035, 0.10, M.blueD, 0, 2.225, -0.55));                 /* 屋脊压顶 */

  /* ========== 院内加映（俯视/透门可见） ========== */
  /* 警卫房 */
  var booth = grp(); put(g, booth, 0.86, 0, 0.80);
  put(booth, box(0.26, 0.36, 0.22, M.wall, 0, 0.25, 0));
  put(booth, box(0.15, 0.11, 0.014, M.ink, 0, 0.30, 0.112));
  var bRoof = mesh(new THREE.ConeGeometry(0.21, 0.12, 4), M.blue);
  bRoof.geometry.rotateY(PI / 4); bRoof.position.y = 0.49;
  booth.add(bRoof);
  /* 放风小院围栏（后院角） */
  var pen = grp(); put(g, pen, -0.72, 0, -0.72);
  put(pen, box(0.56, 0.02, 0.03, M.steelL, 0, 0.30, -0.28));
  put(pen, box(0.03, 0.02, 0.56, M.steelL, -0.28, 0.30, 0));
  for (i = 0; i < 3; i++) {
    put(pen, box(0.03, 0.32, 0.03, M.steelD, -0.28 + i * 0.28, 0.16, -0.28));
    put(pen, box(0.03, 0.32, 0.03, M.steelD, -0.28, 0.16, -0.28 + i * 0.28));
  }
  put(pen, cyl(0.05, 0.06, 0.10, 10, M.steelD, 0.18, 0.05, 0.16));         /* 放风墩 */
  put(pen, sph(0.07, M.pave, 0.18, 0.10, 0.16));

  /* ========== 动画（探照灯缓扫 + 警灯红蓝交替） ========== */
  var pivot = tL.userData.searchlightPivot;
  g.userData.anim = [
    function (t) {                                   /* 1) 探照灯缓扫 + 光锥呼吸 */
      if (!pivot) return;
      pivot.rotation.y = sin(t * 0.5) * 0.6;
      pivot.rotation.x = -0.12 + sin(t * 0.33) * 0.05;
      beamM.opacity = 0.085 + 0.035 * (0.5 + 0.5 * sin(t * 1.7));
    },
    function (t) {                                   /* 2) 警灯红蓝交替（克制幅度） */
      var k = sin(t * 2.8);
      lampRedM.emissiveIntensity = 0.22 + 0.85 * Math.max(0, k);
      lampBlueM.emissiveIntensity = 0.22 + 0.85 * Math.max(0, -k);
    }
  ];

  return g;
};
})();