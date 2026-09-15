/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 12 监狱（tile12_jail.js）  v2 精修版
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/sp_12.png（看守所/拘留所大门建筑群 正视图）
 *
 *   window.Special3D[12]() → THREE.Group（原点=格心，底面 y=0，正面朝 +Z）
 *
 * v1 → v2 精修内容（对照参考图逐项清偿，详见任务汇报）：
 *   1) 墙头铁丝网螺旋圈：五段院墙顶 +TubeGeometry 螺旋线圈 + 支柱（jail 标配）
 *   2) 瞭望塔探照灯完整结构：底板/回转云台/U 形支架/横轴/灯体/后盖/灯罩檐/镜片/手柄；
 *      另一塔加装配底板 + 接线盒对称
 *   3) 主楼屋面瓦垄与封檐：前后坡各 7 条物理瓦垄 + 四边封檐板 + 滚脊 + 脊端头
 *   4) 大门警卫房窗框（框/玻璃/横撑/侧门/基座/宝顶）+ 横杆机构
 *      （驱动立柱/曲柄轮/配重块/U 型托耳/杆端限位）
 *   5) 砖墙砖缝分区：512px 砌筑灰缝纹理 + 侧/后墙白色壁柱分区 + 主楼转角隅石
 *   6) 放风院沙盘小品：围栏双横档四角柱 + 长椅 + 旗杆旗帜 + 沙坑 + 皮球
 *      （v1 围栏穿入主楼，已迁至前院空地）
 *   7) 门内入口门楼：套框/暗开口/双开铁门/中缝/横闩/台步（参考图栅门后主楼入口）
 *   8) 修复 v1 缺陷：左侧外墙缝窗朝向反（朝院内）、侧壁柱与侧窗同面穿插、
 *      后墙无缝窗；全模型段数升级 cyl≥12 / sph 16×12 / torus≥24
 *   9) 动画幅度收敛至规范：扫摆 ≤0.3rad、警灯 emissive 波动 ≤0.25
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
 *   1) 瞭望塔探照灯缓扫（云台轻摆 + 光锥呼吸，旋转 ≤0.3rad）
 *   2) 横梁警灯红蓝交替发光（emissive 波动 ≤0.25）
 *
 * 技术约束：经典 script；THREE r147 全局；MeshStandardMaterial（convertSRGBToLinear）；
 *           纹理全部 Canvas 程序化 ≤512px；mesh ≤520；圆柱≥12 段、球≥16×12 段。
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
  var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat);
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

/* ---------- 1. Canvas 程序化纹理（≤512px，零外部资源） ---------- */
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
/* 白色抹灰墙（512px）：8 道砌筑灰缝（砖缝分区）+ 错缝竖断线 + 灰污渍 + 雨水垂痕 */
function texWall() {
  return canvasTex('wall', 512, 512, function (g, w, h) {
    g.fillStyle = '#e8e6e0'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(1201);
    var i, x, y, r;
    for (i = 0; i < 48; i++) {                       /* 大块灰晕 */
      x = rnd() * w; y = rnd() * h; r = 10 + rnd() * 34;
      g.fillStyle = 'rgba(160,156,146,' + (0.04 + rnd() * 0.06).toFixed(3) + ')';
      g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill();
    }
    var course = h / 8;                              /* 8 道水平灰缝（v2 砖缝分区） */
    for (i = 0; i <= 8; i++) {
      g.fillStyle = 'rgba(148,144,134,0.30)'; g.fillRect(0, i * course, w, 2);
      g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(0, i * course + 2, w, 1);
    }
    for (i = 0; i < 8; i++) {                        /* 错缝竖断线（低对比，砖砌读感） */
      var off = (i % 2) ? 0 : w / 8;
      for (var j = 0; j < 4; j++) {
        g.fillStyle = 'rgba(148,144,134,0.18)';
        g.fillRect(off + j * w / 4, i * course, 2, course);
      }
    }
    for (i = 0; i < 12; i++) {                       /* 顶部雨水垂痕 */
      x = rnd() * w;
      g.fillStyle = 'rgba(150,146,136,' + (0.06 + rnd() * 0.08).toFixed(3) + ')';
      g.fillRect(x, 0, 1 + rnd() * 2, h * (0.25 + rnd() * 0.5));
    }
    for (i = 0; i < 700; i++) {                      /* 细噪点 */
      x = rnd() * w; y = rnd() * h;
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(120,116,106,0.05)';
      g.fillRect(x, y, 1, 1);
    }
  }, 2, 1);
}
/* 蓝灰屋面（256px）：竖向条缝（standing seam）+ 横向瓦板缝 + 微噪 */
function texRoof() {
  return canvasTex('roof', 256, 256, function (g, w, h) {
    g.fillStyle = '#46598c'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(902);
    var i;
    for (i = 0; i < w; i += 24) {                    /* 条缝（瓦垄贴图底纹） */
      g.fillStyle = '#3a4c78'; g.fillRect(i, 0, 4, h);
      g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(i + 4, 0, 1, h);
      g.fillStyle = 'rgba(10,16,34,0.10)'; g.fillRect(i - 1, 0, 1, h);
    }
    for (i = 0; i < h; i += 42) {                    /* 横向搭接缝 */
      g.fillStyle = 'rgba(10,16,34,0.08)'; g.fillRect(0, i, w, 2);
    }
    for (i = 0; i < 300; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(10,16,34,0.05)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  }, 2, 1);
}
/* 院内铺装（256px）：4×4 石板 + 明度抖动 + 分缝格线 */
function texPave() {
  return canvasTex('pave', 256, 256, function (g, w, h) {
    g.fillStyle = '#c9c2b2'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(77);
    var i, j, cell = w / 4;
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 4; j++) {
        var v = rnd();
        g.fillStyle = v > 0.6 ? 'rgba(255,255,255,0.07)' : 'rgba(110,102,90,0.07)';
        g.fillRect(i * cell + 1, j * cell + 1, cell - 2, cell - 2);
      }
    }
    g.strokeStyle = 'rgba(140,132,118,0.60)'; g.lineWidth = 2;
    for (i = 0; i <= 4; i++) {
      g.beginPath(); g.moveTo(i * cell, 0); g.lineTo(i * cell, h); g.stroke();
      g.beginPath(); g.moveTo(0, i * cell); g.lineTo(w, i * cell); g.stroke();
    }
    for (i = 0; i < 260; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(110,102,90,0.07)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  }, 5, 5);
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
/* 编号牌（12 号，128px） */
function texPlate() {
  return canvasTex('plate', 128, 128, function (g, w, h) {
    g.fillStyle = '#27427e'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#d9a83c'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#f2f0ea';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 62px "Microsoft YaHei","Arial",sans-serif';
    g.fillText('12', w / 2, h / 2 + 4);
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
  whiteTrim: std('#f2f0ea', { rough: 0.6 }),                         /* 檐口白 */
  sand:     std('#d9c69b', { rough: 0.95 }),                         /* 沙坑（v2） */
  wood:     std('#8a6a48', { rough: 0.8 }),                          /* 木长椅（v2） */
  flag:     std('#c23b2e', { rough: 0.7 }),                          /* 旗帜红（v2） */
  boomBar:  std('#f2f0ea', { rough: 0.5, map: texBoom() })           /* 红白横杆 */
};
/* 发光材质（动画驱动，独立实例；初始值=动画基准，波动 ≤0.25） */
var lampRedM  = std('#571712', { rough: 0.4, emissive: '#ff3524', ei: 0.35 });
var lampBlueM = std('#122050', { rough: 0.4, emissive: '#2e6bff', ei: 0.35 });
var lensM     = std('#ffe9b8', { rough: 0.35, emissive: '#ffd98a', ei: 0.9 });
var beamM = new THREE.MeshBasicMaterial({
  color: C('#ffe9b8'), transparent: true, opacity: 0.10,
  blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
});

/* ---------- 3. 预制组件 ---------- */
/* 带竖缝长窗的墙段：墙身 + 蓝压顶 + 蓝墙裙 + 3 竖缝窗（藏蓝框）+ 壁柱分区（v2） */
function wallRun(len, withSlits, pilXs) {
  var g = grp();
  g.add(box(len, 0.60, 0.12, M.wall, 0, 0.30, 0));
  g.add(box(len + 0.055, 0.055, 0.17, M.blue, 0, 0.6275, 0));   /* 压顶（挑出） */
  g.add(box(len + 0.02, 0.16, 0.135, M.blue, 0, 0.08, 0));      /* 墙裙 */
  var i;
  if (withSlits) {
    for (i = 0; i < 3; i++) {
      var sx = (i - 1) * len * 0.36;                            /* 3 缝沿段中部分布 */
      g.add(box(0.070, 0.322, 0.016, M.navy, sx, 0.36, 0.062)); /* 藏蓝窗框（v2） */
      g.add(box(0.048, 0.30, 0.014, M.ink, sx, 0.36, 0.067));   /* 竖缝窗（凹陷读感） */
    }
  }
  if (pilXs) {                                                  /* 壁柱分区（v2 砖缝分区） */
    for (i = 0; i < pilXs.length; i++) {
      g.add(box(0.05, 0.418, 0.024, M.whiteTrim, pilXs[i], 0.389, 0.071));
      g.add(box(0.062, 0.022, 0.032, M.whiteTrim, pilXs[i], 0.588, 0.073));
    }
  }
  return g;
}
/* 墙头铁丝网螺旋圈（v2）：Tube 螺旋线圈 + 支柱，贴蓝压顶之上 */
function razorWire(len) {
  var g = grp(); g.name = 'razorWire';
  var turns = Math.max(4, Math.round(len / 0.075));
  var N = turns * 10;
  var pts = [], i;
  for (i = 0; i <= N; i++) {
    var t = i / N, th = t * turns * PI * 2;
    pts.push(new THREE.Vector3(-len / 2 + len * t, 0.683 + 0.024 * cos(th), 0.024 * sin(th)));
  }
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), N, 0.006, 6, false), M.steelL));
  var nPosts = Math.max(1, Math.round(len / 0.55));
  for (i = 0; i < nPosts; i++) {
    var px = (nPosts === 1) ? 0 : -len / 2 + (i + 0.5) * (len / nPosts);
    put(g, cyl(0.006, 0.008, 0.052, 12, M.steelD, px, 0.679, 0));
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
/* 铁栅门扇：边梃 + 拱形门头 + 竖铁条 + 双横撑 + 底槛 + 拱脚卷云饰（v2）（sign=±1 镜像） */
function gateLeaf(sign) {
  var g = grp();
  var W = 0.415, H = 0.86, x0 = sign * (W / 2);
  g.add(box(0.045, H, 0.034, M.steelD, x0, H / 2 + 0.04, 0));            /* 外边梃 */
  g.add(box(W, 0.05, 0.034, M.steelD, 0, 0.065, 0));                      /* 底槛 */
  g.add(box(W * 0.96, 0.028, 0.028, M.steelL, 0, H - 0.02, 0));           /* 拱脚横梁 */
  var arch = mesh(new THREE.TorusGeometry(W / 2, 0.016, 8, 24, PI), M.steelL);
  arch.position.set(0, H - 0.02, 0);
  g.add(arch);                                                             /* 拱形门头 */
  var scroll = cyl(0.02, 0.02, 0.026, 12, M.steelL, x0, H - 0.02, 0);     /* 卷云饰（v2） */
  scroll.rotation.x = PI / 2;
  g.add(scroll);
  var i, bx;
  for (i = 0; i < 7; i++) {                                                /* 竖铁条（圆柱 ≥12 段） */
    bx = -W / 2 + 0.05 + i * (W - 0.10) / 6;
    g.add(cyl(0.0125, 0.0125, H - 0.09, 12, M.steelL, sign * Math.abs(bx), H / 2 - 0.005, 0));
  }
  g.add(box(W * 0.92, 0.02, 0.02, M.steelL, 0, 0.36, 0));                 /* 横撑下 */
  g.add(box(W * 0.92, 0.02, 0.02, M.steelL, 0, 0.60, 0));                 /* 横撑上 */
  /* 合页（外露，装在外边梃上） */
  g.add(box(0.05, 0.032, 0.05, M.steelD, sign * (W / 2 + 0.01), 0.24, 0));
  g.add(box(0.05, 0.032, 0.05, M.steelD, sign * (W / 2 + 0.01), 0.68, 0));
  return g;
}
/* 铁栅窗单元：藏蓝框 + 暗玻璃 + 双竖铁条 + 横撑 + 蓝雨篷 */
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
/* 瞭望塔：塔身 + 塔室（角柱/开敞瞭望口/封檐板）+ 蓝四棱锥顶 + 顶针
 *   withSearchlight=true → 完整探照灯结构（底板/云台/U 支架/横轴/灯体/后盖/灯罩檐/镜片/手柄）
 *   false → 装配底板 + 接线盒（对称读感）                                    */
function turret(withSearchlight) {
  var g = grp();
  put(g, box(0.24, 1.02, 0.24, M.wall, 0, 0.53, 0));                       /* 塔身（入墙群） */
  put(g, box(0.40, 0.045, 0.40, M.whiteTrim, 0, 1.0625, 0));               /* 塔室底板 */
  put(g, box(0.38, 0.02, 0.38, M.whiteTrim, 0, 1.30, 0));                  /* 塔室封檐板（v2） */
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
  put(g, cyl(0.012, 0.02, 0.09, 12, M.finial, 0, 1.645, 0));               /* 顶针杆 */
  put(g, sph(0.022, M.finial, 0, 1.70, 0));                                /* 顶针球 */
  if (withSearchlight) {
    var pivot = grp();                                                     /* 探照灯摆动枢轴（云台） */
    pivot.name = 'searchlightPivot';
    pivot.position.set(0, 1.146, -0.10);                                   /* 塔室内，朝院内（-Z）照明 */
    put(pivot, box(0.11, 0.012, 0.11, M.steelD, 0, -0.055, 0));            /* 安装底板 */
    put(pivot, cyl(0.030, 0.038, 0.030, 12, M.steelD, 0, -0.034, 0));      /* 回转座 */
    put(pivot, box(0.012, 0.082, 0.018, M.steelD, 0.052, -0.006, 0));      /* U 形支架臂 +x */
    put(pivot, box(0.012, 0.082, 0.018, M.steelD, -0.052, -0.006, 0));     /* U 形支架臂 -x */
    var axle = cyl(0.007, 0.007, 0.116, 12, M.steelL, 0, 0.018, 0);        /* 俯仰横轴 */
    axle.rotation.z = PI / 2;
    pivot.add(axle);
    var bodyL = cyl(0.052, 0.060, 0.105, 12, M.steelD, 0, 0.018, -0.01);   /* 灯体 */
    bodyL.rotation.x = PI / 2;
    pivot.add(bodyL);
    put(pivot, sph(0.030, M.steelD, 0, 0.018, 0.048));                     /* 后盖 */
    var hood = cyl(0.066, 0.054, 0.022, 12, M.steelL, 0, 0.018, -0.074);   /* 灯罩檐（防眩） */
    hood.rotation.x = PI / 2;
    pivot.add(hood);
    var lens = cyl(0.046, 0.046, 0.014, 12, lensM, 0, 0.018, -0.086);      /* 镜片 */
    lens.rotation.x = PI / 2; lens.castShadow = false;
    pivot.add(lens);
    put(pivot, box(0.012, 0.026, 0.012, M.steelD, 0, 0.075, -0.005));      /* 调焦手柄 */
    var beam = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.16, 0.80, 12, 1, true), beamM);
    beam.rotation.x = PI / 2; beam.position.set(0, 0.018, -0.50);          /* 近小远大，指向院内 */
    beam.castShadow = false; beam.receiveShadow = false;
    pivot.add(beam);
    g.add(pivot);
    g.userData.searchlightPivot = pivot;
  } else {
    put(g, box(0.11, 0.012, 0.09, M.steelD, 0, 1.091, -0.10));             /* 装配底板（v2） */
    put(g, box(0.05, 0.06, 0.04, M.steelD, 0, 1.127, -0.10));              /* 接线盒（v2） */
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
/* 警卫房（v2 精修）：基座 + 房身 + 窗框/玻璃/横撑 + 侧门 + 檐板 + 四棱锥顶 + 宝顶 */
function guardBooth() {
  var g = grp(); g.name = 'guardBooth';
  put(g, box(0.30, 0.05, 0.26, M.pier, 0, 0.075, 0));                      /* 基座 */
  put(g, box(0.26, 0.34, 0.22, M.wall, 0, 0.27, 0));                       /* 房身 */
  put(g, box(0.17, 0.13, 0.02, M.navy, 0, 0.30, 0.113));                   /* 窗框 */
  put(g, box(0.13, 0.09, 0.016, M.glassD, 0, 0.30, 0.122));                /* 玻璃 */
  put(g, box(0.15, 0.014, 0.018, M.steelL, 0, 0.30, 0.126));               /* 窗横撑 */
  put(g, box(0.016, 0.26, 0.12, M.navy, 0.131, 0.23, 0));                  /* 侧门 */
  put(g, box(0.34, 0.02, 0.30, M.whiteTrim, 0, 0.45, 0));                  /* 檐板 */
  var bRoof = mesh(new THREE.ConeGeometry(0.20, 0.14, 4), M.blue);
  bRoof.geometry.rotateY(PI / 4); bRoof.position.y = 0.53;
  g.add(bRoof);
  put(g, sph(0.02, M.finial, 0, 0.615, 0));                                /* 宝顶 */
  return g;
}
/* 大门横杆机构（v2 精修）：驱动立柱 + 曲柄轮 + 配重 + U 型托 + 红白杆 + 杆端限位 */
function boomMech() {
  var g = grp(); g.name = 'boomMech';
  put(g, cyl(0.016, 0.020, 0.58, 12, M.steelD, -0.36, 0.31, 1.06));        /* 驱动立柱 */
  put(g, cyl(0.024, 0.024, 0.02, 12, M.steelD, -0.36, 0.61, 1.06));        /* 柱帽 */
  var crank = cyl(0.036, 0.036, 0.014, 12, M.steelL, -0.36, 0.57, 1.078);  /* 曲柄轮 */
  crank.rotation.x = PI / 2;
  g.add(crank);
  put(g, box(0.05, 0.075, 0.036, M.steelD, -0.36, 0.46, 1.06));            /* 配重块 */
  put(g, cyl(0.013, 0.017, 0.60, 12, M.steelD, 0.36, 0.32, 1.06));         /* 托柱 */
  put(g, box(0.018, 0.055, 0.018, M.steelD, 0.36, 0.585, 1.078));          /* U 型托耳 前 */
  put(g, box(0.018, 0.055, 0.018, M.steelD, 0.36, 0.585, 1.042));          /* U 型托耳 后 */
  var boom = cyl(0.018, 0.018, 0.70, 12, M.boomBar, 0, 0.57, 1.06);        /* 红白横杆 */
  boom.rotation.z = PI / 2;
  g.add(boom);
  put(g, box(0.026, 0.07, 0.026, M.redEn, 0.335, 0.535, 1.06));            /* 杆端限位 */
  return g;
}
/* 放风院沙盘小品（v2）：围栏双横档四角柱 + 长椅 + 旗杆旗帜 + 沙坑 + 皮球 */
function yardPen() {
  var g = grp(); g.name = 'yardPen';
  var i, j;
  for (i = 0; i < 2; i++) {                                                /* 双横档 */
    var ry2 = 0.14 + i * 0.12;
    put(g, box(0.56, 0.02, 0.02, M.steelL, 0, ry2, 0.28));
    put(g, box(0.56, 0.02, 0.02, M.steelL, 0, ry2, -0.28));
    put(g, box(0.02, 0.02, 0.56, M.steelL, 0.28, ry2, 0));
    put(g, box(0.02, 0.02, 0.56, M.steelL, -0.28, ry2, 0));
  }
  for (i = 0; i < 2; i++) {
    for (j = 0; j < 2; j++) {
      put(g, box(0.024, 0.30, 0.024, M.steelD, i * 0.56 - 0.28, 0.15, j * 0.56 - 0.28)); /* 角柱 */
    }
  }
  /* 长椅 */
  put(g, box(0.20, 0.016, 0.09, M.wood, -0.10, 0.168, 0.09));
  put(g, box(0.016, 0.11, 0.08, M.wood, -0.18, 0.105, 0.09));
  put(g, box(0.016, 0.11, 0.08, M.wood, -0.02, 0.105, 0.09));
  /* 旗杆 + 旗 */
  put(g, cyl(0.005, 0.007, 0.36, 12, M.steelL, 0.20, 0.23, -0.20));
  put(g, box(0.09, 0.055, 0.006, M.flag, 0.245, 0.375, -0.20));
  /* 沙坑（框 + 沙面） */
  put(g, box(0.20, 0.025, 0.03, M.wood, -0.05, 0.0625, -0.185));
  put(g, box(0.20, 0.025, 0.03, M.wood, -0.05, 0.0625, -0.015));
  put(g, box(0.03, 0.025, 0.20, M.wood, -0.135, 0.0625, -0.10));
  put(g, box(0.03, 0.025, 0.20, M.wood, 0.035, 0.0625, -0.10));
  put(g, box(0.17, 0.014, 0.17, M.sand, -0.05, 0.057, -0.10));
  /* 皮球 */
  put(g, sph(0.045, M.redEn, 0.12, 0.095, 0.14));
  return g;
}
/* 门内入口门楼（v2）：套框 + 暗开口 + 双开铁门 + 中缝立柱 + 横闩 + 台步 */
function entryPortal() {
  var g = grp(); g.name = 'entryPortal';
  put(g, box(0.52, 0.78, 0.04, M.pier, 0, 0.51, -0.062));                  /* 石套框 */
  put(g, box(0.40, 0.64, 0.03, M.ink, 0, 0.44, -0.073));                   /* 暗开口 */
  put(g, box(0.17, 0.60, 0.022, M.navy, 0.085, 0.42, -0.061));             /* 门扇 右 */
  put(g, box(0.17, 0.60, 0.022, M.navy, -0.085, 0.42, -0.061));            /* 门扇 左 */
  put(g, box(0.025, 0.62, 0.026, M.steelD, 0, 0.42, -0.058));              /* 中缝立柱 */
  put(g, box(0.32, 0.03, 0.024, M.steelL, 0, 0.52, -0.048));               /* 横闩 上 */
  put(g, box(0.32, 0.03, 0.024, M.steelL, 0, 0.28, -0.048));               /* 横闩 下 */
  put(g, box(0.66, 0.05, 0.16, M.pier, 0, 0.065, -0.02));                  /* 台步 */
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
  /* 侧墙 x=±1.26（v2 修正：左侧墙翻转朝向，缝窗朝外） */
  var wsL = wallRun(2.26, true, [-0.62, 0.62]);  wsL.rotation.y = PI / 2;  put(g, wsL, 1.26, 0, 0.03);
  var wsR = wallRun(2.26, true, [-0.62, 0.62]);  wsR.rotation.y = -PI / 2; put(g, wsR, -1.26, 0, 0.03);
  /* 后墙 z=-1.26（v2：补竖缝窗 + 壁柱分区） */
  var wr = wallRun(2.42, true, [-0.55, 0.55]);  put(g, wr, 0, 0, -1.26);
  /* 墙头铁丝网螺旋圈（v2，随各墙段敷设） */
  var wire;
  wire = razorWire(0.45); put(g, wire, 0.915, 0, 1.22);
  wire = razorWire(0.45); put(g, wire, -0.915, 0, 1.22);
  wire = razorWire(2.26); wire.rotation.y = PI / 2;  put(g, wire, 1.26, 0, 0.03);
  wire = razorWire(2.26); wire.rotation.y = -PI / 2; put(g, wire, -1.26, 0, 0.03);
  wire = razorWire(2.42); put(g, wire, 0, 0, -1.26);

  /* ========== 大门（门柱 + 横梁 + 警徽 + 铁栅门 + 警灯 + 门牌） ========== */
  var gpL = gatePier(); put(g, gpL, 0.56, 0, 1.12);
  var gpR = gatePier(); put(g, gpR, -0.56, 0, 1.12);

  var header = grp(); put(g, header, 0, 0, 1.12);
  put(header, box(1.38, 0.24, 0.26, M.pier, 0, 1.18, 0));                  /* 横梁 */
  put(header, box(1.42, 0.03, 0.28, M.blue, 0, 1.315, 0));                 /* 蓝檐带 */
  put(header, box(1.46, 0.045, 0.30, M.whiteTrim, 0, 1.3525, 0));          /* 白顶板 */
  var i;
  for (i = 0; i < 5; i++) {                                                /* 檐下齿饰（v2，header 局部坐标） */
    put(header, box(0.06, 0.045, 0.03, M.whiteTrim, -0.52 + i * 0.26, 1.0375, 0.142));
  }
  var emblem = policeEmblem(0.15); put(header, emblem, 0, 1.19, 0.15);     /* 警徽（+Z 面） */
  /* 警灯 ×2（红蓝交替 emissive 动画） */
  put(header, cyl(0.035, 0.045, 0.05, 12, M.steelD, 0.50, 1.02, 0.10));
  put(header, cyl(0.035, 0.045, 0.05, 12, M.steelD, -0.50, 1.02, 0.10));
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

  /* 铁栅双开门（拱形门头 + 卷云饰） */
  var leafL = gateLeaf(1);  put(g, leafL, 0.2075, 0.02, 1.22);
  var leafR = gateLeaf(-1); put(g, leafR, -0.2075, 0.02, 1.22);
  /* 中缝锁匣 + 插销 */
  put(g, box(0.085, 0.15, 0.05, M.steelD, 0, 0.56, 1.22));
  put(g, box(0.03, 0.10, 0.035, M.steelD, 0, 0.30, 1.225));
  put(g, box(0.03, 0.10, 0.035, M.steelD, 0, 0.42, 1.225));

  /* 门内横杆机构（v2：曲柄轮/配重/U 型托） */
  g.add(boomMech());

  /* ========== 双瞭望塔（镜像对称；+x 塔带完整探照灯结构） ========== */
  var tL = turret(true);  put(g, tL, 0.72, 0, 1.04);
  var tR = turret(false); put(g, tR, -0.72, 0, 1.04);

  /* ========== 主楼（三层牢房 + 四坡瓦垄屋顶 + 隅石） ========== */
  put(g, box(1.72, 0.10, 0.98, M.pier, 0, 0.07, -0.55));                   /* 灰石台基 */
  put(g, box(1.68, 1.60, 0.94, M.wall, 0, 0.92, -0.55));                   /* 楼身 */
  put(g, box(1.76, 0.08, 1.00, M.whiteTrim, 0, 1.76, -0.55));              /* 白檐口 */
  put(g, box(1.78, 0.028, 1.02, M.blue, 0, 1.712, -0.55));                 /* 蓝檐带 */
  /* 转角隅石（v2，四角竖向琢石） */
  put(g, box(0.05, 1.58, 0.05, M.whiteTrim, 0.845, 0.91, -0.075));
  put(g, box(0.05, 1.58, 0.05, M.whiteTrim, -0.845, 0.91, -0.075));
  put(g, box(0.05, 1.58, 0.05, M.whiteTrim, 0.845, 0.91, -1.025));
  put(g, box(0.05, 1.58, 0.05, M.whiteTrim, -0.845, 0.91, -1.025));
  /* 壁柱分隔（v2 修正：正面仅两根避让门楼；侧面移至窗间净位，消除 v1 穿窗缺陷） */
  put(g, box(0.038, 1.52, 0.016, M.whiteTrim, 0.495, 0.94, -0.064));
  put(g, box(0.038, 1.52, 0.016, M.whiteTrim, -0.495, 0.94, -0.064));
  put(g, box(0.016, 1.52, 0.038, M.whiteTrim, 0.846, 0.94, -0.54));
  put(g, box(0.016, 1.52, 0.038, M.whiteTrim, 0.846, 0.94, -0.95));
  put(g, box(0.016, 1.52, 0.038, M.whiteTrim, -0.846, 0.94, -0.54));
  put(g, box(0.016, 1.52, 0.038, M.whiteTrim, -0.846, 0.94, -0.95));
  /* 铁栅窗：正面 5 楹 × 3 层（中列下两层让位于门楼） */
  var rowY = [0.45, 0.90, 1.35];
  var colX = [-0.66, -0.33, 0, 0.33, 0.66];
  var r, c2;
  for (r = 0; r < 3; r++) {
    for (c2 = 0; c2 < 5; c2++) {
      if (c2 === 2 && r < 2) continue;                                     /* 门楼占位（v2） */
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
  /* 四坡瓦垄屋顶（v2：封檐板 + 物理瓦垄 + 滚脊 + 脊端头） */
  var mainRoof = grp(); mainRoof.name = 'mainRoof';
  mainRoof.position.set(0, 1.77, -0.55);
  g.add(mainRoof);
  mainRoof.add(mesh(hipRoofGeo(1.94, 1.16, 0.44, 0.60), M.roof));
  put(mainRoof, box(1.96, 0.05, 0.022, M.whiteTrim, 0, -0.005, 0.585));    /* 封檐板 前 */
  put(mainRoof, box(1.96, 0.05, 0.022, M.whiteTrim, 0, -0.005, -0.585));   /* 封檐板 后 */
  put(mainRoof, box(0.022, 0.05, 1.18, M.whiteTrim, 0.965, -0.005, 0));    /* 封檐板 右 */
  put(mainRoof, box(0.022, 0.05, 1.18, M.whiteTrim, -0.965, -0.005, 0));   /* 封檐板 左 */
  var ridgeRoll = cyl(0.02, 0.02, 0.64, 12, M.blueD, 0, 0.452, 0);         /* 滚脊 */
  ridgeRoll.rotation.z = PI / 2;
  mainRoof.add(ridgeRoll);
  put(mainRoof, box(0.06, 0.05, 0.05, M.blueD, 0.34, 0.428, 0));           /* 脊端头 ×2 */
  put(mainRoof, box(0.06, 0.05, 0.05, M.blueD, -0.34, 0.428, 0));
  var RIB_A = Math.atan2(0.44, 0.58);                                      /* 坡面角 */
  for (i = 0; i < 7; i++) {                                                /* 物理瓦垄 前后坡各 7 条（按斜脊裁长） */
    var rx = -0.6 + i * 0.2;
    var s = Math.max(0, (Math.abs(rx) - 0.3) / 0.67);                      /* 斜脊边界参数（脊端→檐角） */
    var y1 = 0.44 * (1 - s), z1 = 0.58 * s;                                /* 瓦垄上端（脊侧） */
    var len = Math.sqrt(y1 * y1 + (0.58 - z1) * (0.58 - z1)) + 0.02;       /* 沿坡长（微过盈嵌入） */
    var ribF = box(0.016, 0.018, len, M.blueD, rx, y1 / 2, (z1 + 0.58) / 2);
    ribF.rotation.x = RIB_A;
    mainRoof.add(ribF);
    var ribB = box(0.016, 0.018, len, M.blueD, rx, y1 / 2, -(z1 + 0.58) / 2);
    ribB.rotation.x = -RIB_A;
    mainRoof.add(ribB);
  }

  /* ========== 院内加映（俯视/透门可见） ========== */
  /* 警卫房（v2 精修：窗框/侧门/基座/宝顶） */
  var booth = guardBooth(); put(g, booth, 0.86, 0, 0.80);
  /* 门内入口门楼（v2，参考图栅门后主楼入口） */
  g.add(entryPortal());
  /* 放风院沙盘小品（v2：迁至前院空地，消除 v1 围栏穿楼） */
  var pen = yardPen(); put(g, pen, -0.80, 0, 0.42);

  /* ========== 动画（探照灯缓扫 + 警灯红蓝交替，幅度符合规范） ========== */
  var pivot = tL.userData.searchlightPivot;
  g.userData.anim = [
    function (t) {                                   /* 1) 探照灯缓扫（≤0.3rad）+ 光锥呼吸 */
      if (!pivot) return;
      pivot.rotation.y = sin(t * 0.5) * 0.28;
      pivot.rotation.x = -0.10 + sin(t * 0.31) * 0.05;
      beamM.opacity = 0.085 + 0.035 * (0.5 + 0.5 * sin(t * 1.6));
    },
    function (t) {                                   /* 2) 警灯红蓝交替（emissive 波动 ≤0.25） */
      var k = sin(t * 2.6);
      lampRedM.emissiveIntensity = 0.35 + 0.25 * Math.max(0, k);
      lampBlueM.emissiveIntensity = 0.35 + 0.25 * Math.max(0, -k);
    }
  ];

  return g;
};
})();
