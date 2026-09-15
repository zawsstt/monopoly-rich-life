/* =====================================================================================
 * 大富翁 · 富贵人生 —— 特建 3D · 格 15 虹桥高铁站（tile15_station.js）· v2 精修版
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/sp_15.png（大跨度弧形屋顶 + 玻璃幕墙 + 站台雨棚 + CRH）
 * v2：对照参考图清偿 v1 差距清单（8 条），mesh 89 → 190（可见细节而非冗余）
 *
 *   window.Special3D[15]() → THREE.Group（原点=格心，底面 y=0，正面朝 +Z）
 *
 * v2 精修要点（对照 refs/sp_15.png）：
 *   - 弧形大屋顶：双层封檐板（layered fascia）+ 檐下分段弧梁（前后各 3 道同心）
 *     + 檐口露明红椽四面 + 椽上小斗 + 脊端翘钩 + 正脊宝顶 + 山墙披檐板
 *   - 玻璃幕墙：512px 分格纹理（6×5 格/贴 + 逐格明暗抖动 + 双向斜反光带），
 *     山墙真几何竖挺 ×13 + 横档 ×3、立面/背面横档 ×2、侧面竖挺、斜向反光带 ×2
 *   - 朱红柱列与斗拱层次：柱簇升级（两层柱础 / 栌斗帽 / 两层十字斗拱臂 + 臂端块 /
 *     收头枋板 + 柱顶收分）×3 簇；额枋下斗拱铺作带（红+奶油交错）
 *   - 站台雨棚：双排柱列（8 柱）+ 檐下圈梁 + 弧梁 + 椽条加密 + 雨棚天花板
 *     + 吊挂站屏「虹桥站」+ 脊端翘饰 + 站台端头踏步
 *   - 门廊/入口：第二层内弧梁 + 雨棚露明椽 + 双开玻璃门 + 门把手 + 门槛石
 *     + 大台阶垂带石/望柱护栏/副阶踏步/防滑条
 *   - 轨道：钢轨 + 扣件板 + 轨枕 + 道砟护肩 + 轨端车挡
 *   - CRH：蓝腰线上鼻扫角 + 环绕风挡 + 风挡框 + 头灯罩 + 尾灯 + 鼻身接缝环
 *     + 排障器 + 车顶空调设备脊
 *   - 广场/台基：台缘收边 + 绿地缘石/绿篱/花丛/双树双冠；站名牌金框托架；
 *     大钟真刻度盘面 + 托架顶饰；售票亭基座窗框
 *
 * 动画（group.userData.anim = [fn(t,dt)]）：
 *   1) 站钟秒针 sweep + 时针缓行
 *   2) 站名牌灯箱呼吸（emissive 呼吸，幅度克制）
 *   3) CRH 头灯待发脉冲（emissive，幅度克制）
 *
 * 技术约束：经典 script；THREE r147 全局；MeshStandardMaterial（convertSRGBToLinear）；
 *           纹理全部 Canvas 程序化 ≤512px；mesh ≤420；球≥12 段、圆柱≥10 段；
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
  if (o.transparent) { m.transparent = true; m.opacity = (o.opacity !== undefined ? o.opacity : 0.5); m.depthWrite = !!o.depthWrite; }
  if (o.polygonOffset) { m.polygonOffset = true; m.polygonOffsetFactor = -2; m.polygonOffsetUnits = -2; }
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
/* 弓形弧梁：压扁半环（XY 面内起拱，参考图门廊/雨棚 identity 特征）
 *   r: 半径  tube: 管径  sy: 压扁率 → 拱高 = r*sy */
function arcGeo(r, tube, x, y, z, sy) {
  var geo = new THREE.TorusGeometry(r, tube, 10, 28, PI);
  geo.scale(1, sy || 0.34, 1);
  geo.translate(x, y, z);
  return geo;
}

/* ================= 1. Canvas 程序化纹理（≤512px，零外部资源） ================= */
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
/* 玻璃幕墙 v2：512px · 6×5 格/贴 · 逐格明暗抖动 + 双向斜反光带 + 檩条双线 */
function texGlass() {
  return canvasTex('glass15b', 512, 512, function (g, w, h) {
    var rnd = mulberry32(1509);
    var COLS = 6, ROWS = 5, cw = w / COLS, ch = h / ROWS, i, j;
    for (i = 0; i < COLS; i++) {
      for (j = 0; j < ROWS; j++) {
        var k = rnd();
        g.fillStyle = k > 0.74 ? '#7cc6da' : (k > 0.42 ? '#4c9db6' : (k > 0.16 ? '#438ba6' : '#3b7d98'));
        g.fillRect(i * cw, j * ch, cw, ch);
        /* 逐格顶部高光 + 底部沉影（立体玻璃感） */
        g.fillStyle = 'rgba(255,255,255,0.26)';
        g.fillRect(i * cw + 3, j * ch + 3, cw - 6, Math.max(4, ch * 0.16));
        g.fillStyle = 'rgba(20,50,64,0.16)';
        g.fillRect(i * cw + 3, j * ch + ch - Math.max(3, ch * 0.12), cw - 6, Math.max(3, ch * 0.12));
        /* 少数格子斜向次反光 */
        if (rnd() > 0.72) {
          g.fillStyle = 'rgba(235,250,252,0.20)';
          g.beginPath();
          g.moveTo(i * cw + cw * 0.15, j * ch + ch);
          g.lineTo(i * cw + cw * 0.55, j * ch + ch);
          g.lineTo(i * cw + cw * 0.85, j * ch);
          g.lineTo(i * cw + cw * 0.45, j * ch);
          g.closePath(); g.fill();
        }
      }
    }
    /* 通长斜向反光带（两个角度，gable_glass 裁剪证据） */
    g.globalAlpha = 0.16;
    g.fillStyle = '#e2f5f9';
    for (i = -1; i < 7; i++) {
      g.beginPath();
      g.moveTo(i * 96, h); g.lineTo(i * 96 + 96, h);
      g.lineTo(i * 96 + 196, 0); g.lineTo(i * 96 + 100, 0);
      g.closePath(); g.fill();
    }
    g.globalAlpha = 0.10;
    g.fillStyle = '#ffffff';
    for (i = -1; i < 5; i++) {
      g.beginPath();
      g.moveTo(i * 150 + 40, 0); g.lineTo(i * 150 + 96, 0);
      g.lineTo(i * 150 - 10, h); g.lineTo(i * 150 - 66, h);
      g.closePath(); g.fill();
    }
    g.globalAlpha = 1;
    /* 檩条：主格线 + 内侧高光/阴影双线 */
    g.strokeStyle = '#9db2bc'; g.lineWidth = 9;
    for (i = 0; i <= COLS; i++) { g.beginPath(); g.moveTo(i * cw, 0); g.lineTo(i * cw, h); g.stroke(); }
    for (j = 0; j <= ROWS; j++) { g.beginPath(); g.moveTo(0, j * ch); g.lineTo(w, j * ch); g.stroke(); }
    g.strokeStyle = 'rgba(50,70,80,0.5)'; g.lineWidth = 2;
    for (i = 0; i <= COLS; i++) { g.beginPath(); g.moveTo(i * cw + 5, 0); g.lineTo(i * cw + 5, h); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.30)'; g.lineWidth = 2;
    for (i = 0; i <= COLS; i++) { g.beginPath(); g.moveTo(i * cw - 6, 0); g.lineTo(i * cw - 6, h); g.stroke(); }
  });
}
/* 屋面：奶油底 + 沿坡向板缝（加密）+ 微噪 */
function texRoof() {
  return canvasTex('roof15b', 256, 256, function (g, w, h) {
    g.fillStyle = '#ded8c8'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(1511);
    var i;
    for (i = 0; i < w; i += 22) {
      g.fillStyle = 'rgba(150,144,128,0.5)'; g.fillRect(i, 0, 2, h);
      g.fillStyle = 'rgba(255,255,255,0.30)'; g.fillRect(i + 2, 0, 1, h);
    }
    g.fillStyle = 'rgba(150,144,128,0.26)';
    g.fillRect(0, h * 0.33 - 1, w, 2);
    g.fillRect(0, h * 0.66 - 1, w, 2);
    for (i = 0; i < 260; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(120,112,96,0.05)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  }, 3, 1);
}
/* 广场石板分缝（256px 更细 + 交错缝） */
function texPlaza() {
  return canvasTex('plaza15b', 256, 256, function (g, w, h) {
    g.fillStyle = '#c6bfae'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(140,132,116,0.6)'; g.lineWidth = 3;
    var i, j;
    for (i = 0; i <= 4; i++) {
      g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke();
      g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke();
    }
    g.strokeStyle = 'rgba(140,132,116,0.35)'; g.lineWidth = 2;
    for (i = 0; i < 4; i++) {
      for (j = 0; j < 2; j++) {
        g.beginPath(); g.moveTo(i * 64 + 32, j * 128 + 64); g.lineTo(i * 64 + 32, j * 128 + 128); g.stroke();
      }
    }
    var rnd = mulberry32(1513);
    for (i = 0; i < 420; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(110,102,88,0.07)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  }, 8, 8);
}
/* 道床碎石 */
function texBallast() {
  return canvasTex('ballast15b', 256, 256, function (g, w, h) {
    g.fillStyle = '#8e887c'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(1517), i, x, y, r;
    for (i = 0; i < 640; i++) {
      x = rnd() * w; y = rnd() * h; r = 1 + rnd() * 2.6;
      g.fillStyle = rnd() > 0.5 ? 'rgba(178,172,158,0.5)' : 'rgba(94,88,78,0.5)';
      g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill();
    }
  }, 1, 6);
}
/* CRH 侧墙 livery：u=绕周（两侧 0.25/0.75），v=沿车长；蓝腰线 + 窗带 + 端门缝（512px） */
function texTrainSide() {
  return canvasTex('train15b', 512, 256, function (g, w, h) {
    g.fillStyle = '#f2f0ea'; g.fillRect(0, 0, w, h);
    var rnd = mulberry32(1519), i, side, x0;
    for (side = 0; side < 2; side++) {
      x0 = side === 0 ? w * 0.25 : w * 0.75;
      g.fillStyle = '#2f6fc4';                        /* 蓝腰线沿全长 */
      g.fillRect(x0 - 10, 0, 20, h);
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.fillRect(x0 - 10, 0, 6, h);
      g.fillStyle = 'rgba(20,40,80,0.35)';
      g.fillRect(x0 + 4, 0, 6, h);
      g.fillStyle = '#2a2e33';                        /* 窗带 */
      g.fillRect(x0 - 52, h * 0.10, 104, h * 0.52);
      g.fillStyle = '#f2f0ea';
      for (i = 0; i < 9; i++) g.fillRect(x0 - 49, h * (0.10 + 0.058 * i), 98, 4);
      /* 车门窗 + 门缝 */
      g.fillStyle = '#2a2e33';
      g.fillRect(x0 - 16, h * 0.10, 32, h * 0.52);
      g.strokeStyle = 'rgba(120,124,130,0.8)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(x0 - 60, h * 0.06); g.lineTo(x0 - 60, h * 0.94); g.stroke();
      g.beginPath(); g.moveTo(x0 + 60, h * 0.06); g.lineTo(x0 + 60, h * 0.94); g.stroke();
      /* 设备舱检修缝 */
      g.strokeStyle = 'rgba(120,124,130,0.4)';
      g.beginPath(); g.moveTo(x0 - 96, h * 0.03); g.lineTo(x0 - 96, h * 0.10); g.stroke();
      g.beginPath(); g.moveTo(x0 + 96, h * 0.03); g.lineTo(x0 + 96, h * 0.10); g.stroke();
    }
    g.fillStyle = '#d8d4ca';                          /* 裙摆 */
    g.fillRect(0, h * 0.86, w, h * 0.14);
    g.fillStyle = 'rgba(90,94,100,0.35)';             /* 裙摆上缘阴影线 */
    g.fillRect(0, h * 0.86, w, 3);
    for (i = 0; i < 160; i++) {
      g.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(90,94,100,0.04)';
      g.fillRect(rnd() * w, rnd() * h, 1, 1);
    }
  });
}
/* 站名牌：藏蓝底 + 金字「虹桥高铁站」+ 双线金框 */
function texSign() {
  return canvasTex('sign15b', 256, 64, function (g, w, h) {
    g.fillStyle = '#223b5e'; g.fillRect(0, 0, w, h);
    var grad = g.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1, 'rgba(0,0,0,0.18)');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#e8c268'; g.lineWidth = 4;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.strokeStyle = 'rgba(232,194,104,0.5)'; g.lineWidth = 1.5;
    g.strokeRect(9, 9, w - 18, h - 18);
    g.fillStyle = '#f0d488';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 38px "Microsoft YaHei","PingFang SC",sans-serif';
    g.fillText('虹桥高铁站', w / 2, h / 2 + 2);
  });
}
/* 售票亭牌 */
function texTicket() {
  return canvasTex('ticket15b', 128, 64, function (g, w, h) {
    g.fillStyle = '#c84a2b'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 3;
    g.strokeRect(3, 3, w - 6, h - 6);
    g.fillStyle = '#fdf6e8';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 40px "Microsoft YaHei","PingFang SC",sans-serif';
    g.fillText('售票', w / 2, h / 2 + 2);
  });
}
/* 大钟盘面：60 分刻度 + 12 时刻 + 内圈 + 4 数字（真刻度钟面） */
function texClock() {
  return canvasTex('clock15b', 256, 256, function (g, w) {
    var cx = w / 2, cy = w / 2, R = w / 2 - 6, i, a;
    g.fillStyle = '#f4f2ea'; g.fillRect(0, 0, w, w);
    g.strokeStyle = '#223b5e'; g.lineWidth = 5;
    g.beginPath(); g.arc(cx, cy, R - 4, 0, PI * 2); g.stroke();
    g.strokeStyle = 'rgba(34,59,94,0.35)'; g.lineWidth = 2;
    g.beginPath(); g.arc(cx, cy, R * 0.66, 0, PI * 2); g.stroke();
    for (i = 0; i < 60; i++) {
      a = i / 60 * PI * 2 - PI / 2;
      var maj = (i % 5 === 0);
      g.strokeStyle = maj ? '#223b5e' : 'rgba(34,59,94,0.55)';
      g.lineWidth = maj ? 7 : 2.5;
      var r1 = R * (maj ? 0.72 : 0.76), r2 = R * 0.88;
      g.beginPath();
      g.moveTo(cx + cos(a) * r1, cy + sin(a) * r1);
      g.lineTo(cx + cos(a) * r2, cy + sin(a) * r2);
      g.stroke();
    }
    g.fillStyle = '#223b5e';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 24px Georgia,serif';
    g.fillText('12', cx, cy - R * 0.47);
    g.fillText('3', cx + R * 0.47, cy);
    g.fillText('6', cx, cy + R * 0.47);
    g.fillText('9', cx - R * 0.47, cy);
  });
}
/* 草坪割草条纹 */
function texLawn() {
  return canvasTex('lawn15b', 256, 256, function (g, w, h) {
    var i;
    for (i = 0; i < 8; i++) {
      g.fillStyle = i % 2 ? '#7fa05a' : '#8fb068';
      g.fillRect(0, i * 32, w, 32);
    }
    var rnd = mulberry32(1523);
    for (i = 0; i < 320; i++) {
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
  foliage2: std('#7ba050', { rough: 0.9 }),
  trunk:    std('#7a5a40', { rough: 0.9 }),
  lamp:     std('#e8e4d8', { rough: 0.6, metal: 0.15 }),
  navy:     std('#223b5e', { rough: 0.5 }),
  stripeBlue: std('#2f6fc4', { rough: 0.35 }),
  doorGlass: std('#3a5a6e', { rough: 0.2, metal: 0.45 }),
  ceilCream: std('#ddd6c2', { rough: 0.8 }),
  clockFace: std('#f4f2ea', { rough: 0.5 })
};
/* 发光材质（动画驱动，独立实例） */
var signMat = std('#223b5e', { rough: 0.5, emissive: '#e8c268', ei: 0.35 });
var lampGlowM = std('#ffe9b8', { rough: 0.4, emissive: '#ffd98a', ei: 0.55 });
var headlampM = std('#fff4d8', { rough: 0.25, emissive: '#ffedb8', ei: 0.6 });
var portalGlowM = std('#d9d6cc', { rough: 0.6, emissive: '#f6f4ee', ei: 0.85 });
var tailLampM = std('#b8402e', { rough: 0.4, emissive: '#c8402a', ei: 0.4 });

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
/* 斜向反光带（透明叠片，物理高光条） */
function reflMat() {
  return new THREE.MeshStandardMaterial({
    color: C('#eef8fb'), transparent: true, opacity: 0.20,
    roughness: 0.12, metalness: 0.5, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    flatShading: true
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
/* —— 3.2 立柱簇 v2（合并几何，斗拱层次加密：参考图朱红柱 + 奶油斗拱 + 金棕础）
 *   pts: [[x,z],...] 世界坐标；shaftTop: 柱顶 y；baseY: 柱础底 y
 *   返回 5 mesh：柱身(+收分) / 两层柱础 / 栌斗帽 / 两层十字斗拱臂+臂端块 / 收头枋板 */
function buildColumns(pts, shaftTop, opt) {
  opt = opt || {};
  var r = opt.r || 0.03;
  var baseY = opt.baseY !== undefined ? opt.baseY : 0.155;
  var shafts = [], bases = [], caps = [], arms = [], plates = [], i, pt, x, z;
  var shH = shaftTop - 0.075 - (baseY + 0.056);
  for (i = 0; i < pts.length; i++) {
    pt = pts[i]; x = pt[0]; z = pt[1];
    /* 柱身 + 柱顶收分环 */
    shafts.push(tcyl(r, shH, 12, x, baseY + 0.056 + shH / 2, z));
    shafts.push(tcyl(r * 0.88, 0.02, 12, x, shaftTop - 0.065, z));
    /* 金棕两层柱础 */
    bases.push(tbox(r * 3.1, 0.026, r * 3.1, x, baseY + 0.013, z));
    bases.push(tbox(r * 2.6, 0.030, r * 2.6, x, baseY + 0.041, z));
    /* 奶油栌斗帽 */
    caps.push(tbox(r * 3.6, 0.030, r * 3.6, x, shaftTop - 0.050, z));
    /* 斗拱第一层：十字臂 + 四角臂端块（朱红） */
    arms.push(tbox(r * 4.6, 0.020, r * 2.4, x, shaftTop - 0.026, z));
    arms.push(tbox(r * 2.4, 0.020, r * 4.6, x, shaftTop - 0.026, z));
    arms.push(tbox(r * 0.9, 0.030, r * 0.9, x - r * 2.1, shaftTop - 0.021, z));
    arms.push(tbox(r * 0.9, 0.030, r * 0.9, x + r * 2.1, shaftTop - 0.021, z));
    arms.push(tbox(r * 0.9, 0.030, r * 0.9, x, shaftTop - 0.021, z - r * 2.1));
    arms.push(tbox(r * 0.9, 0.030, r * 0.9, x, shaftTop - 0.021, z + r * 2.1));
    /* 斗拱第二层：更长的十字臂（朱红） */
    arms.push(tbox(r * 5.4, 0.016, r * 2.2, x, shaftTop - 0.004, z));
    arms.push(tbox(r * 2.2, 0.016, r * 5.4, x, shaftTop - 0.004, z));
    /* 收头枋板（奶油，承托屋面） */
    plates.push(tbox(r * 5.9, 0.020, r * 5.9, x, shaftTop + 0.014, z));
    plates.push(tbox(r * 6.6, 0.014, r * 3.2, x, shaftTop + 0.030, z));
  }
  var g = grp();
  g.add(mesh(mergeGeos(shafts), M.colRed));
  g.add(mesh(mergeGeos(bases), M.gold));
  g.add(mesh(mergeGeos(caps), M.cream));
  g.add(mesh(mergeGeos(arms), M.colRed));
  g.add(mesh(mergeGeos(plates), M.cream));
  return g;
}

/* ================= 4. 工厂主函数 ================= */
window.Special3D = window.Special3D || {};
window.Special3D[15] = function () {
  var g = grp();
  g.name = 'special_15_hsrc_station';

  /* 布局常量（格心原点，正面 +Z；包络 x -1.35..1.35，z -1.35..1.33） */
  var HALL_X = -0.24;          /* 站房轴线 */
  var TRACK_X = 1.225;         /* 轨道中心 */
  var PLZ = 0.095;             /* 广场面 */

  /* ========== [blockout] 地坪 ========== */
  put(g, box(2.68, 0.06, 2.68, M.stoneD, 0, 0.03, 0));               /* 条石台基 */
  put(g, box(2.60, 0.035, 2.60, M.plaza, 0, 0.0775, 0));             /* 广场石板 */
  /* 台缘收边（参考图台基条石压边） */
  g.add(mesh(mergeGeos([
    tbox(2.66, 0.02, 0.05, 0, PLZ + 0.01, 1.305),
    tbox(2.66, 0.02, 0.05, 0, PLZ + 0.01, -1.305),
    tbox(0.05, 0.02, 2.56, -1.305, PLZ + 0.01, 0),
    tbox(0.05, 0.02, 2.56, 1.305, PLZ + 0.01, 0)
  ]), M.stoneM));
  /* 道床 + 两侧护肩（道砟断面，参考图轨道道砟） */
  put(g, box(0.25, 0.05, 2.50, M.ballast, TRACK_X, 0.055, 0.075));   /* 道床（顶 y=0.08） */
  var shL = box(0.05, 0.03, 2.50, M.ballast, TRACK_X - 0.09, 0.083, 0.075);
  shL.rotation.z = -0.35; g.add(shL);
  var shR = box(0.05, 0.03, 2.50, M.ballast, TRACK_X + 0.09, 0.083, 0.075);
  shR.rotation.z = 0.35; g.add(shR);

  /* ========== [blockout] 站房主体 ========== */
  var hall = grp(); put(g, hall, HALL_X, PLZ, -0.72);
  put(hall, box(2.04, 0.06, 0.98, M.stoneM, 0, 0.03, 0));            /* 站房台基 */
  put(hall, box(2.10, 0.028, 1.04, M.stoneD, 0, 0.074, 0));          /* 台基线脚（须弥座上枋） */
  put(hall, box(1.98, 0.83, 0.90, M.white, 0, 0.475, 0));            /* 站房体（local 顶 0.89） */
  /* 玻璃幕墙四面（512px 分格 · 6×5/贴） */
  var glassF = mesh(new THREE.PlaneGeometry(1.94, 0.79), glassMat(1.85, 1.0));
  glassF.position.set(0, 0.475, 0.456); hall.add(glassF);
  var glassB = mesh(new THREE.PlaneGeometry(1.94, 0.79), glassMat(1.85, 1.0));
  glassB.position.set(0, 0.475, -0.456); glassB.rotation.y = PI; hall.add(glassB);
  var glassL = mesh(new THREE.PlaneGeometry(0.86, 0.79), glassMat(0.85, 1.0));
  glassL.position.set(-0.992, 0.475, 0); glassL.rotation.y = -PI / 2; hall.add(glassL);
  var glassR = mesh(new THREE.PlaneGeometry(0.86, 0.79), glassMat(0.85, 1.0));
  glassR.position.set(0.992, 0.475, 0); glassR.rotation.y = PI / 2; hall.add(glassR);
  /* 竖向玻璃肋（加密 13 根） */
  var finGeo = [], fi;
  for (fi = -6; fi <= 6; fi++) finGeo.push(tbox(0.014, 0.80, 0.02, fi * 0.155, 0.475, 0.468));
  hall.add(mesh(mergeGeos(finGeo), M.mullion));
  /* 立面横档 ×2（真几何，参考图横向分格） */
  hall.add(mesh(mergeGeos([
    tbox(1.96, 0.014, 0.02, 0, 0.335, 0.466),
    tbox(1.96, 0.014, 0.02, 0, 0.615, 0.466)
  ]), M.mullion));
  /* 背面横档 ×2 */
  hall.add(mesh(mergeGeos([
    tbox(1.96, 0.014, 0.02, 0, 0.335, -0.466),
    tbox(1.96, 0.014, 0.02, 0, 0.615, -0.466)
  ]), M.mullion));
  /* 侧面竖挺 ×2 */
  hall.add(mesh(mergeGeos([
    tbox(0.02, 0.80, 0.014, -0.996, 0.475, -0.29),
    tbox(0.02, 0.80, 0.014, -0.996, 0.475, -0.145),
    tbox(0.02, 0.80, 0.014, -0.996, 0.475, 0.145),
    tbox(0.02, 0.80, 0.014, -0.996, 0.475, 0.29)
  ]), M.mullion));
  hall.add(mesh(mergeGeos([
    tbox(0.02, 0.80, 0.014, 0.996, 0.475, -0.29),
    tbox(0.02, 0.80, 0.014, 0.996, 0.475, -0.145),
    tbox(0.02, 0.80, 0.014, 0.996, 0.475, 0.145),
    tbox(0.02, 0.80, 0.014, 0.996, 0.475, 0.29)
  ]), M.mullion));
  /* 檐口带 + 阴影缝 */
  put(hall, box(2.06, 0.05, 0.98, M.cream, 0, 0.905, 0));
  put(hall, box(2.02, 0.028, 0.94, M.stoneD, 0, 0.875, 0));
  /* 四角竖向奶油护角（参考图墙角分色条） */
  hall.add(mesh(mergeGeos([
    tbox(0.035, 0.83, 0.035, -0.982, 0.475, 0.442),
    tbox(0.035, 0.83, 0.035, 0.982, 0.475, 0.442),
    tbox(0.035, 0.83, 0.035, -0.982, 0.475, -0.442),
    tbox(0.035, 0.83, 0.035, 0.982, 0.475, -0.442)
  ]), M.cream));

  /* —— [form] 山墙三角玻璃（直抵屋面）+ 真几何分格 */
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
    gUV.push((gPos.getX(gi) + 0.96) / 0.77, gPos.getY(gi) / 0.64);
  }
  gableGeo.setAttribute('uv', new THREE.Float32BufferAttribute(gUV, 2));
  var gable = mesh(gableGeo, glassMat(1, 1));
  gable.position.set(0, 0.90, 0.452);
  hall.add(gable);
  /* 山墙竖挺 ×13（随三角坡度变高，参考图密分格） */
  function gabH(x) {
    var ax = abs(x);
    return ax <= 0.06 ? 0.46 : Math.max(0.0, 0.46 - 0.4 * (ax - 0.06));
  }
  var gvGeo = [], gx;
  for (gx = -0.90; gx <= 0.905; gx += 0.15) {
    var gh = gabH(gx);
    if (gh > 0.03) gvGeo.push(tbox(0.013, gh, 0.018, gx, gh / 2, 0.452));
  }
  var gvMesh = mesh(mergeGeos(gvGeo), M.mullion);
  gvMesh.position.y = 0.902;
  hall.add(gvMesh);
  /* 山墙横档 ×3（随坡收窄） */
  var ghMesh = mesh(mergeGeos([
    tbox(1.74, 0.013, 0.018, 0, 0.14, 0.452),
    tbox(1.06, 0.013, 0.018, 0, 0.28, 0.452),
    tbox(0.40, 0.013, 0.018, 0, 0.41, 0.452)
  ]), M.mullion);
  ghMesh.position.y = 0.902;
  hall.add(ghMesh);
  /* 山墙披檐板（barge board 沿坡压条 ×2，参考图山墙缘头） */
  var bbL = box(1.00, 0.036, 0.020, M.cream, -0.52, 1.185, 0.456);
  bbL.rotation.z = 0.38; hall.add(bbL);
  var bbR = box(1.00, 0.036, 0.020, M.cream, 0.52, 1.185, 0.456);
  bbR.rotation.z = -0.38; hall.add(bbR);
  /* 山墙中挺 */
  put(hall, box(0.035, 0.44, 0.016, M.mullion, 0, 1.12, 0.446));
  /* 立面/山墙斜向反光带 ×2（透明叠片，参考图高光条） */
  var ribbonF = mesh(new THREE.PlaneGeometry(1.75, 0.10), reflMat());
  ribbonF.position.set(0.12, 0.52, 0.462);
  ribbonF.rotation.z = 0.55; hall.add(ribbonF);
  var ribbonG = mesh(new THREE.PlaneGeometry(1.20, 0.07), reflMat());
  ribbonG.position.set(0, 1.03, 0.458);
  ribbonG.rotation.z = 0.5; hall.add(ribbonG);

  /* ========== [blockout] 主屋顶（弧形 sweep，y=0 即檐口平面） ========== */
  var mainRoof = roofUnit(2.20, 1.22, 0.48, { ridgeRatio: 0.5, upturn: 0.085, fasciaH: 0.04, rows: 9, perim: 56 });
  put(g, mainRoof, HALL_X, 1.24, -0.72);                             /* 檐 y1.24 · 脊 y1.72 */
  /* 第二层封檐板（参考图檐口双层叠涩，下沉留的阴影缝） */
  var skirt2 = sweepRoof(2.20, 1.26, 0.016, { upturn: 0.015, fasciaH: 0.05, rows: 4, perim: 56 });
  put(g, mesh(skirt2.top, M.roof), HALL_X, 1.145, -0.72);
  put(g, mesh(skirt2.skirt, M.fascia), HALL_X, 1.145, -0.72);
  /* 檐下分段弧梁（前后各 3 道同心合并，参考图门廊弧梁语汇延伸至主檐） */
  g.add(mesh(mergeGeos([
    arcGeo(0.80, 0.014, HALL_X, 1.115, -0.20, 0.050),
    arcGeo(0.56, 0.012, HALL_X, 1.130, -0.22, 0.045),
    arcGeo(0.32, 0.011, HALL_X, 1.140, -0.24, 0.045)
  ]), M.colRed));
  g.add(mesh(mergeGeos([
    arcGeo(0.80, 0.014, HALL_X, 1.115, -1.24, 0.050),
    arcGeo(0.56, 0.012, HALL_X, 1.130, -1.22, 0.045),
    arcGeo(0.32, 0.011, HALL_X, 1.140, -1.20, 0.045)
  ]), M.colRed));
  /* 檐口露明红椽（前 18 / 后 18 / 左右各 9，参考图檐下椽条） */
  var rafF = [], rafB = [], rafL = [], rafR = [], ri2;
  for (ri2 = 0; ri2 < 18; ri2++) {
    rafF.push(tbox(0.016, 0.022, 0.21, HALL_X - 0.99 + ri2 * 0.117, 1.168, -0.185));
    rafB.push(tbox(0.016, 0.022, 0.12, HALL_X - 0.99 + ri2 * 0.117, 1.168, -1.28));
  }
  for (ri2 = 0; ri2 < 9; ri2++) {
    rafL.push(tbox(0.14, 0.022, 0.016, HALL_X - 1.02, 1.168, -0.28 - ri2 * 0.117));
    rafR.push(tbox(0.14, 0.022, 0.016, HALL_X + 1.02, 1.168, -0.28 - ri2 * 0.117));
  }
  g.add(mesh(mergeGeos(rafF), M.colRed));
  g.add(mesh(mergeGeos(rafB), M.colRed));
  g.add(mesh(mergeGeos(rafL), M.colRed));
  g.add(mesh(mergeGeos(rafR), M.colRed));
  /* 椽上小斗（奶油小块，檐下一圈装饰） */
  var denGeo = [], di2;
  for (di2 = 0; di2 < 18; di2++) {
    denGeo.push(tbox(0.022, 0.026, 0.022, HALL_X - 0.932 + di2 * 0.117, 1.19, -0.22));
  }
  g.add(mesh(mergeGeos(denGeo), M.cream));
  /* 屋脊压顶 + 脊端翘钩 + 正脊宝顶 */
  put(g, box(1.24, 0.05, 0.13, M.ridge, HALL_X, 1.725, -0.72));
  var reL = mesh(new THREE.BoxGeometry(0.10, 0.045, 0.13), M.ridge);
  reL.position.set(HALL_X - 0.64, 1.745, -0.72); reL.rotation.z = 0.28; g.add(reL);
  var reR = mesh(new THREE.BoxGeometry(0.10, 0.045, 0.13), M.ridge);
  reR.position.set(HALL_X + 0.64, 1.745, -0.72); reR.rotation.z = -0.28; g.add(reR);
  var hookL = box(0.035, 0.085, 0.055, M.ridge, HALL_X - 0.66, 1.795, -0.72);
  hookL.rotation.z = 0.5; g.add(hookL);
  var hookR = box(0.035, 0.085, 0.055, M.ridge, HALL_X + 0.66, 1.795, -0.72);
  hookR.rotation.z = -0.5; g.add(hookR);
  put(g, box(0.085, 0.035, 0.085, M.ridge, HALL_X, 1.762, -0.72));
  put(g, box(0.048, 0.05, 0.048, M.fascia, HALL_X, 1.802, -0.72));

  /* ========== [structure] 前柱列 + 额枋 + 斗拱铺作带 ========== */
  var colPts = [], cxs = [-0.96, -0.82, -0.58, -0.34, 0.34, 0.58, 0.82, 0.96], ci;
  for (ci = 0; ci < cxs.length; ci++) colPts.push([HALL_X + cxs[ci], -0.155]);
  g.add(buildColumns(colPts, 1.02, { baseY: 0.155, r: 0.030 }));
  put(g, box(1.94, 0.055, 0.075, M.cream, HALL_X, 1.048, -0.155));   /* 额枋 */
  put(g, box(2.00, 0.026, 0.09, M.cream, HALL_X, 1.088, -0.155));    /* 枋上压板 */
  /* 额枋下斗拱铺作带（红+奶油交错小斗，参考图柱间枋上斗拱） */
  var bdRed = [], bdCream = [], bi2;
  for (bi2 = 0; bi2 < 11; bi2++) {
    var bx = HALL_X - 0.80 + bi2 * 0.16;
    if (bi2 % 2 === 0) bdRed.push(tbox(0.030, 0.048, 0.055, bx, 1.002, -0.155));
    else bdCream.push(tbox(0.034, 0.044, 0.058, bx, 1.000, -0.155));
  }
  g.add(mesh(mergeGeos(bdRed), M.colRed));
  g.add(mesh(mergeGeos(bdCream), M.cream));
  /* 柱间低位实墙 ×2（参考图入口两侧裙墙） */
  put(g, box(0.15, 0.24, 0.055, M.stoneM, HALL_X - 0.70, PLZ + 0.12, -0.155));
  put(g, box(0.15, 0.24, 0.055, M.stoneM, HALL_X + 0.70, PLZ + 0.12, -0.155));
  put(g, box(0.19, 0.022, 0.075, M.cream, HALL_X - 0.70, PLZ + 0.251, -0.155));
  put(g, box(0.19, 0.022, 0.075, M.cream, HALL_X + 0.70, PLZ + 0.251, -0.155));

  /* ========== [structure] 门廊：雨棚 + 双层朱红弓梁 + 玻璃横披 + 入口 ========== */
  var porch = roofUnit(1.06, 0.50, 0.13, { ridgeRatio: 0.45, upturn: 0.06, fasciaH: 0.032, rows: 8, perim: 44 });
  put(g, porch, HALL_X, 1.02, -0.02);                                /* 檐 y1.02 · 脊 y1.15 */
  var arc = mesh(arcGeo(0.45, 0.032, HALL_X, 0.90, -0.02, 0.32), M.colRed);
  g.add(arc);
  g.add(mesh(arcGeo(0.36, 0.020, HALL_X, 0.92, -0.03, 0.24), M.colRed));  /* 第二层内弧 */
  var transom = mesh(new THREE.PlaneGeometry(0.88, 0.13), glassMat(2.0, 0.4));
  transom.position.set(HALL_X, 1.0, -0.058);
  g.add(transom);                                                    /* 弓梁上玻璃横披 */
  /* 雨棚露明椽（12 根合并） */
  var pRaf = [], pi2;
  for (pi2 = 0; pi2 < 12; pi2++) pRaf.push(tbox(0.014, 0.018, 0.16, HALL_X - 0.47 + pi2 * 0.0855, 1.005, 0.10));
  g.add(mesh(mergeGeos(pRaf), M.colRed));
  /* 门廊脊端翘饰 ×2 */
  var pHookL = box(0.028, 0.06, 0.045, M.ridge, HALL_X - 0.50, 1.17, -0.02);
  pHookL.rotation.z = 0.5; g.add(pHookL);
  var pHookR = box(0.028, 0.06, 0.045, M.ridge, HALL_X + 0.50, 1.17, -0.02);
  pHookR.rotation.z = -0.5; g.add(pHookR);
  /* 入口：白衬框 + 明亮开洞 + 灰过梁 + 双开玻璃门 + 门槛石 + 踏步 */
  put(g, box(0.56, 0.62, 0.10, M.white, HALL_X, 0.475, -0.24));
  put(g, box(0.40, 0.52, 0.06, portalGlowM, HALL_X, 0.415, -0.215));
  put(g, box(0.46, 0.045, 0.09, M.stoneM, HALL_X, 0.675, -0.225));
  put(g, box(0.055, 0.52, 0.08, M.stoneM, HALL_X - 0.225, 0.415, -0.225));
  put(g, box(0.055, 0.52, 0.08, M.stoneM, HALL_X + 0.225, 0.415, -0.225));
  var doorL = box(0.175, 0.46, 0.018, M.doorGlass, HALL_X - 0.095, 0.385, -0.192);
  g.add(doorL);
  var doorR = box(0.175, 0.46, 0.018, M.doorGlass, HALL_X + 0.095, 0.385, -0.192);
  g.add(doorR);
  put(g, box(0.05, 0.012, 0.03, M.lamp, HALL_X - 0.015, 0.385, -0.180));   /* 门把手 ×2 */
  put(g, box(0.05, 0.012, 0.03, M.lamp, HALL_X + 0.015, 0.385, -0.180));
  put(g, box(0.36, 0.02, 0.05, M.stoneD, HALL_X, PLZ + 0.01, -0.18));      /* 门槛石 */
  var stepGeo = [], si;
  for (si = 0; si < 4; si++) {
    stepGeo.push(tbox(0.78, 0.032, 0.14, HALL_X, 0.016 + si * 0.032 + PLZ, 0.02 + 0.07 + (3 - si) * 0.14));
  }
  g.add(mesh(mergeGeos(stepGeo), M.stoneM));
  put(g, box(0.78, 0.035, 0.18, M.stoneM, HALL_X, PLZ + 0.0175, 0.09));
  /* 踏步防滑条（金属嵌条合并） */
  var noses = [], ni;
  for (ni = 0; ni < 4; ni++) noses.push(tbox(0.78, 0.008, 0.014, HALL_X, 0.035 + ni * 0.032 + PLZ, 0.09 + (3 - ni) * 0.14));
  g.add(mesh(mergeGeos(noses), M.rail));

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
  /* 站名牌金框 + 托架（参考图藏蓝金框牌匾） */
  g.add(mesh(mergeGeos([
    tbox(0.68, 0.012, 0.034, HALL_X, 1.196, -0.262),
    tbox(0.68, 0.012, 0.034, HALL_X, 1.074, -0.262),
    tbox(0.012, 0.13, 0.034, HALL_X - 0.334, 1.135, -0.262),
    tbox(0.012, 0.13, 0.034, HALL_X + 0.334, 1.135, -0.262)
  ]), M.gold));
  g.add(mesh(mergeGeos([
    tbox(0.02, 0.05, 0.02, HALL_X - 0.28, 1.062, -0.268),
    tbox(0.02, 0.05, 0.02, HALL_X + 0.28, 1.062, -0.268)
  ]), M.colRed));

  var clockG = grp(); clockG.position.set(HALL_X, 0.965, 0.238); g.add(clockG); /* 吊挂于门廊雨棚额下 */
  var face = cyl(0.075, 0.075, 0.02, 20, M.clockFace, 0, 0, 0);
  face.rotation.x = PI / 2; clockG.add(face);
  /* 真刻度钟面（texClock） */
  var faceTex = mesh(new THREE.CircleGeometry(0.070, 24),
    new THREE.MeshStandardMaterial({ map: texClock(), roughness: 0.5, flatShading: true }));
  faceTex.position.z = 0.011; clockG.add(faceTex);
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
  /* 钟托架（斜撑双臂 + 底梁合并）+ 顶饰 */
  clockG.add(mesh(mergeGeos([
    tbox(0.016, 0.075, 0.012, -0.045, -0.085, 0),
    tbox(0.016, 0.075, 0.012, 0.045, -0.085, 0),
    tbox(0.12, 0.014, 0.014, 0, -0.125, 0)
  ]), M.colRed));
  put(clockG, box(0.035, 0.022, 0.02, M.gold, 0, 0.092, 0));

  /* ========== [blockout/structure] 站台 + 雨棚 + 双排柱列 ========== */
  var platform = grp(); put(g, platform, 0.98, 0, -0.35);
  put(platform, box(0.26, 0.165, 1.90, M.stoneM, 0, 0.1775, 0));     /* 站台（顶 y0.26） */
  put(platform, box(0.275, 0.03, 1.90, M.plaza, 0, 0.245, 0));
  put(platform, box(0.05, 0.008, 1.86, M.warn, -0.098, 0.263, 0));   /* 黄警戒线（轨道侧） */
  put(platform, box(0.05, 0.008, 1.86, M.white, 0.098, 0.263, 0));   /* 安全白线（外侧） */
  /* 盲道触点（双列圆点合并） */
  var studGeo = [], sti;
  for (sti = 0; sti < 12; sti++) {
    studGeo.push(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8).translate(0.04, 0.2625, -0.80 + sti * 0.145));
    studGeo.push(new THREE.CylinderGeometry(0.008, 0.008, 0.006, 8).translate(0.04, 0.2625, -0.7275 + sti * 0.145));
  }
  platform.add(mesh(mergeGeos(studGeo), M.warn));
  var railParts = [], ri3;
  for (ri3 = 0; ri3 < 9; ri3++) railParts.push(tbox(0.016, 0.16, 0.016, -0.105, 0.343, -0.85 + ri3 * 0.21));
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
  platform.add(mesh(mergeGeos([
    tbox(0.014, 0.10, 0.5, 0.005, 0.36, -0.5),
    tbox(0.014, 0.10, 0.5, 0.005, 0.36, 0.35)
  ]), M.trunk));                                                     /* 长椅靠背 */
  /* 站台端头踏步（参考图右端下客梯） */
  platform.add(mesh(mergeGeos([
    tbox(0.20, 0.055, 0.10, 0, 0.0275, 0.98),
    tbox(0.20, 0.115, 0.10, 0, 0.0575, 0.88),
    tbox(0.20, 0.175, 0.10, 0, 0.0875, 0.78)
  ]), M.stoneM));
  /* 双排雨棚柱列（前排 x0.92 + 后排 x1.06，参考图雨棚双柱进深） */
  var pPts = [], pz = [-1.05, -0.55, -0.05, 0.45], pzi;
  for (pzi = 0; pzi < pz.length; pzi++) {
    pPts.push([0.92, pz[pzi]]);
    pPts.push([1.06, pz[pzi]]);
  }
  g.add(buildColumns(pPts, 1.03, { baseY: 0.26, r: 0.026 }));
  /* 耳房角柱簇（左翼，参考图耳房朱红角柱；嵌墙角布置以控包络） */
  g.add(buildColumns([[-1.272, -0.28], [-1.272, -1.04], [-1.008, -0.28], [-1.008, -1.04]], 0.70, { baseY: 0.155, r: 0.022 }));
  /* 柱间联系枋 + 檐下圈梁 */
  var tieGeo = [], ti;
  for (ti = 0; ti < 3; ti++) tieGeo.push(tbox(0.05, 0.03, 0.50, 0.99, 0.955, -0.80 + ti * 0.50));
  g.add(mesh(mergeGeos(tieGeo), M.colRed));                          /* 柱间联系枋 */
  g.add(mesh(mergeGeos([
    tbox(0.05, 0.030, 1.92, 0.75, 0.985, -0.32),
    tbox(0.05, 0.030, 1.92, 1.31, 0.985, -0.32),
    tbox(0.60, 0.030, 0.05, 1.03, 0.985, 0.64),
    tbox(0.60, 0.030, 0.05, 1.03, 0.985, -1.28)
  ]), M.colRed));                                                    /* 檐下圈梁 */
  /* 雨棚弧梁 ×3（合并，参考图雨棚下朱红弯梁） */
  g.add(mesh(mergeGeos([
    arcGeo(0.26, 0.013, 1.03, 1.008, -0.72, 0.12),
    arcGeo(0.26, 0.013, 1.03, 1.008, -0.30, 0.12),
    arcGeo(0.26, 0.013, 1.03, 1.008, 0.14, 0.12)
  ]), M.colRed));
  /* 露明红椽（加密 16 根） */
  var rafterGeo = [];
  for (ti = 0; ti < 16; ti++) rafterGeo.push(tbox(0.44, 0.020, 0.024, 1.06, 1.038, -1.10 + ti * 0.1465));
  g.add(mesh(mergeGeos(rafterGeo), M.colRed));
  /* 檩条（纵向 2 道合并） */
  g.add(mesh(mergeGeos([
    tbox(0.026, 0.020, 1.90, 0.94, 1.055, -0.32),
    tbox(0.026, 0.020, 1.90, 1.18, 1.055, -0.32)
  ]), M.colRed));
  /* 雨棚天花板（仰视可见） */
  put(g, box(0.56, 0.008, 1.96, M.ceilCream, 1.03, 1.042, -0.32));
  var pCanopy = roofUnit(2.0, 0.58, 0.10, { ridgeRatio: 0.5, upturn: 0.05, fasciaH: 0.03, rows: 7, perim: 48, zLong: true });
  put(g, pCanopy, 1.03, 1.07, -0.32);                                /* 站台雨棚（沿 z，檐 y1.07） */
  /* 雨棚脊端翘饰 ×2 */
  var cHookL = box(0.026, 0.055, 0.04, M.ridge, 1.03, 1.20, -1.29);
  cHookL.rotation.x = -0.5; g.add(cHookL);
  var cHookR = box(0.026, 0.055, 0.04, M.ridge, 1.03, 1.20, 0.65);
  cHookR.rotation.x = 0.5; g.add(cHookR);
  /* 吊挂站屏（藏蓝「虹桥站」，参考图雨棚下标识） */
  put(g, box(0.22, 0.075, 0.022, M.navy, 0.86, 0.895, 0.10));
  var destFace = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.055),
    new THREE.MeshStandardMaterial({
      map: canvasTex('dest15', 128, 48, function (gc, w, h) {
        gc.fillStyle = '#223b5e'; gc.fillRect(0, 0, w, h);
        gc.strokeStyle = 'rgba(232,194,104,0.7)'; gc.lineWidth = 3;
        gc.strokeRect(2, 2, w - 4, h - 4);
        gc.fillStyle = '#f0d488';
        gc.textAlign = 'center'; gc.textBaseline = 'middle';
        gc.font = 'bold 30px "Microsoft YaHei","PingFang SC",sans-serif';
        gc.fillText('虹桥站', w / 2, h / 2 + 1);
      }), roughness: 0.5, flatShading: true, emissive: C('#5a4a20'), emissiveIntensity: 0.3
    }));
  destFace.position.set(0.86, 0.895, 0.125);
  g.add(destFace);
  put(g, box(0.012, 0.05, 0.012, M.rail, 0.86, 0.955, 0.085));
  put(g, box(0.012, 0.05, 0.012, M.rail, 0.86, 0.955, 0.115));

  /* ========== [structure] 轨道（钢轨 / 扣件 / 轨枕 / 车挡） ========== */
  put(g, box(0.016, 0.03, 2.45, M.rail, TRACK_X - 0.072, 0.105, 0.075));
  put(g, box(0.016, 0.03, 2.45, M.rail, TRACK_X + 0.072, 0.105, 0.075));
  var sleepers = [], si2;
  for (si2 = 0; si2 < 26; si2++) sleepers.push(tbox(0.24, 0.024, 0.075, TRACK_X, 0.088, -1.12 + si2 * 0.092));
  g.add(mesh(mergeGeos(sleepers), M.sleeper));
  /* 扣件板（每枕左右各一，合并） */
  var fastGeo = [], fi2;
  for (fi2 = 0; fi2 < 26; fi2++) {
    fastGeo.push(tbox(0.030, 0.006, 0.040, TRACK_X - 0.072, 0.101, -1.12 + fi2 * 0.092));
    fastGeo.push(tbox(0.030, 0.006, 0.040, TRACK_X + 0.072, 0.101, -1.12 + fi2 * 0.092));
  }
  g.add(mesh(mergeGeos(fastGeo), M.trainDark));
  /* 轨端车挡（z 正端，参考图轨端止挡） */
  g.add(mesh(mergeGeos([
    tbox(0.20, 0.030, 0.045, TRACK_X, 0.115, 1.28),
    tbox(0.030, 0.085, 0.035, TRACK_X, 0.145, 1.28),
    tbox(0.020, 0.020, 0.030, TRACK_X, 0.19, 1.28)
  ]), M.trainDark));

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
  /* 鼻身接缝环（工艺缝） */
  var seam = mesh(new THREE.TorusGeometry(0.101, 0.004, 6, 20), M.trainDark);
  seam.position.set(0, 0.253, 0.44);
  train.add(seam);
  /* 环绕风挡（压扁球冠贴鼻）+ 风挡框 */
  var shield = mesh(new THREE.SphereGeometry(0.075, 14, 10, 0, PI * 2, 0, PI * 0.42), M.trainGlass);
  shield.scale.set(1.15, 0.72, 1.5);
  shield.position.set(0, 0.302, 0.435);
  shield.rotation.x = 0.42;
  train.add(shield);
  var shieldRim = mesh(new THREE.TorusGeometry(0.068, 0.005, 6, 20), M.trainDark);
  shieldRim.scale.set(1.15, 0.9, 1.2);
  shieldRim.position.set(0, 0.293, 0.428);
  shieldRim.rotation.x = 0.42;
  train.add(shieldRim);
  /* 腰线上鼻扫角 ×2（镜像，直扫至鼻尖） */
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
  /* 头灯 ×2（emissive 动画）+ 灯罩（合并） */
  var lampL = mesh(new THREE.SphereGeometry(0.016, 12, 10), headlampM);
  lampL.position.set(-0.062, 0.212, 0.752); lampL.castShadow = false;
  train.add(lampL);
  var lampR = mesh(new THREE.SphereGeometry(0.016, 12, 10), headlampM);
  lampR.position.set(0.062, 0.212, 0.752); lampR.castShadow = false;
  train.add(lampR);
  train.add(mesh(mergeGeos([
    new THREE.CylinderGeometry(0.020, 0.024, 0.014, 12).rotateX(PI / 2).translate(-0.062, 0.212, 0.742),
    new THREE.CylinderGeometry(0.020, 0.024, 0.014, 12).rotateX(PI / 2).translate(0.062, 0.212, 0.742)
  ]), M.trainDark));
  /* 尾灯 ×2（红，合并） */
  train.add(mesh(mergeGeos([
    tbox(0.022, 0.012, 0.010, -0.052, 0.208, -0.60),
    tbox(0.022, 0.012, 0.010, 0.052, 0.208, -0.60)
  ]), tailLampM));
  /* 排障器（鼻下）+ 裙摆/转向架 + 受电弓（合并簇） */
  train.add(mesh(mergeGeos([
    tbox(0.14, 0.045, 0.10, 0, 0.130, 0.86),
    tbox(0.10, 0.022, 0.06, 0, 0.105, 0.885)
  ]), M.trainDark));
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
  /* 车顶空调/设备舱脊（3 段合并） */
  train.add(mesh(mergeGeos([
    tbox(0.12, 0.018, 0.22, 0, 0.362, -0.44),
    tbox(0.10, 0.014, 0.16, 0, 0.360, -0.12),
    tbox(0.10, 0.014, 0.12, 0, 0.360, 0.10)
  ]), M.train));

  /* ========== [form] 左翼耳房 + 右连接块 ========== */
  var wing = grp(); put(g, wing, -1.14, PLZ, -0.66);
  put(wing, box(0.28, 0.66, 0.82, M.white, 0, 0.33, 0));
  var wGlass = mesh(new THREE.PlaneGeometry(0.78, 0.64), glassMat(1.8, 1.5));
  wGlass.position.set(0.142, 0.33, 0); wGlass.rotation.y = PI / 2; wing.add(wGlass);
  /* 耳房窗框（横竖各一并合并） */
  wing.add(mesh(mergeGeos([
    tbox(0.012, 0.66, 0.014, 0.148, 0.33, -0.195),
    tbox(0.012, 0.66, 0.014, 0.148, 0.33, 0.195),
    tbox(0.012, 0.66, 0.014, 0.148, 0.33, 0),
    tbox(0.012, 0.012, 0.80, 0.148, 0.045, 0),
    tbox(0.012, 0.012, 0.80, 0.148, 0.33, 0),
    tbox(0.012, 0.012, 0.80, 0.148, 0.615, 0)
  ]), M.mullion));
  /* 耳房门框（前立面） */
  put(wing, box(0.014, 0.40, 0.14, M.white, -0.146, 0.20, 0.30));
  /* 耳房腰线披檐（重檐中层 band，参考图耳房双檐） */
  var wBand = roofUnit(0.92, 0.40, 0.05, { ridgeRatio: 0.5, upturn: 0.03, fasciaH: 0.022, rows: 5, perim: 36, zLong: true });
  put(wing, wBand, 0, 0.50, 0);
  var wRoof = roofUnit(0.80, 0.38, 0.07, { ridgeRatio: 0.5, upturn: 0.04, fasciaH: 0.026, rows: 7, perim: 40, zLong: true });
  put(wing, wRoof, 0, 0.78, 0);
  /* 耳房脊端翘饰 ×2 */
  var wHookL = box(0.022, 0.05, 0.035, M.ridge, 0, 0.885, -0.385);
  wHookL.rotation.x = -0.5; wing.add(wHookL);
  var wHookR = box(0.022, 0.05, 0.035, M.ridge, 0, 0.885, 0.385);
  wHookR.rotation.x = 0.5; wing.add(wHookR);
  /* 站房与站台之间的连接块 */
  put(g, box(0.24, 0.60, 0.86, M.white, 0.84, PLZ + 0.30, -0.72));
  var rGlass = mesh(new THREE.PlaneGeometry(0.82, 0.54), glassMat(1.9, 1.3));
  rGlass.position.set(0.84, PLZ + 0.32, -0.285); g.add(rGlass);
  /* 连接块玻璃分格 */
  g.add(mesh(mergeGeos([
    tbox(0.014, 0.56, 0.014, 0.84, PLZ + 0.32, -0.485),
    tbox(0.014, 0.56, 0.014, 0.84, PLZ + 0.32, -0.285),
    tbox(0.014, 0.56, 0.014, 0.84, PLZ + 0.32, -0.085),
    tbox(0.86, 0.012, 0.014, 0.84, PLZ + 0.32, -0.285)
  ]), M.mullion));
  var rCap = roofUnit(1.0, 0.34, 0.055, { ridgeRatio: 0.5, upturn: 0.035, fasciaH: 0.024, rows: 6, perim: 36, zLong: true });
  put(g, rCap, 0.84, PLZ + 0.62, -0.72);
  /* 连接块披檐露明椽 */
  var cRaf = [], cfi;
  for (cfi = 0; cfi < 7; cfi++) cRaf.push(tbox(0.34, 0.014, 0.016, 0.84, PLZ + 0.60, -1.06 + cfi * 0.115));
  g.add(mesh(mergeGeos(cRaf), M.colRed));

  /* ========== [form] 广场：大台阶/绿地/售票亭/灯柱 ========== */
  /* 台阶两侧垂带石 + 望柱护栏（参考图大台阶形制） */
  put(g, box(0.10, 0.24, 0.62, M.stoneD, HALL_X - 0.475, PLZ + 0.12, 0.16));
  put(g, box(0.10, 0.24, 0.62, M.stoneD, HALL_X + 0.475, PLZ + 0.12, 0.16));
  var postGeo = [], pgi;
  for (pgi = 0; pgi < 3; pgi++) {
    postGeo.push(tbox(0.03, 0.075, 0.03, HALL_X - 0.475, PLZ + 0.2775, 0.36 - pgi * 0.20));
    postGeo.push(tbox(0.03, 0.075, 0.03, HALL_X + 0.475, PLZ + 0.2775, 0.36 - pgi * 0.20));
  }
  g.add(mesh(mergeGeos(postGeo), M.stoneM));                         /* 望柱 */
  g.add(mesh(mergeGeos([
    tbox(0.055, 0.022, 0.46, HALL_X - 0.475, PLZ + 0.325, 0.16),
    tbox(0.055, 0.022, 0.46, HALL_X + 0.475, PLZ + 0.325, 0.16)
  ]), M.stoneM));                                                    /* 护栏扶手 */
  /* 两侧下副阶（参考图台基两端踏步） */
  g.add(mesh(mergeGeos([
    tbox(0.30, 0.045, 0.10, HALL_X - 0.86, 0.0225 + PLZ, 0.30),
    tbox(0.30, 0.045, 0.10, HALL_X - 0.86, 0.0225 + PLZ, 0.42),
    tbox(0.30, 0.0225, 0.10, HALL_X - 0.86, 0.011, 0.54)
  ]), M.stoneM));
  g.add(mesh(mergeGeos([
    tbox(0.30, 0.045, 0.10, HALL_X + 0.86, 0.0225 + PLZ, 0.30),
    tbox(0.30, 0.045, 0.10, HALL_X + 0.86, 0.0225 + PLZ, 0.42),
    tbox(0.30, 0.0225, 0.10, HALL_X + 0.86, 0.011, 0.54)
  ]), M.stoneM));
  /* 绿地 + 缘石 + 绿篱 + 花丛 + 双树双冠 */
  put(g, box(0.84, 0.026, 0.66, M.lawn, -0.86, PLZ + 0.013, 0.92));
  g.add(mesh(mergeGeos([
    tbox(0.88, 0.034, 0.035, -0.86, PLZ + 0.017, 1.245),
    tbox(0.88, 0.034, 0.035, -0.86, PLZ + 0.017, 0.595),
    tbox(0.035, 0.034, 0.62, -1.265, PLZ + 0.017, 0.92),
    tbox(0.035, 0.034, 0.62, -0.455, PLZ + 0.017, 0.92)
  ]), M.stoneM));                                                    /* 绿地缘石 */
  var hedgeGeo = [], hi;
  for (hi = 0; hi < 5; hi++) hedgeGeo.push(new THREE.SphereGeometry(0.040, 12, 10).translate(-1.16 + hi * 0.15, PLZ + 0.048, 0.63));
  g.add(mesh(mergeGeos(hedgeGeo), M.foliage));
  var flowerGeo = [], flo;
  var flowerT = [[-1.06, 1.14], [-0.92, 1.02], [-0.70, 1.16], [-0.58, 0.94], [-0.78, 0.78], [-1.14, 0.82]];
  for (flo = 0; flo < flowerT.length; flo++) {
    flowerGeo.push(new THREE.SphereGeometry(0.014, 10, 8).translate(flowerT[flo][0], PLZ + 0.045, flowerT[flo][1]));
  }
  g.add(mesh(mergeGeos(flowerGeo), std('#d4788a', { rough: 0.7 })));
  put(g, cyl(0.02, 0.026, 0.16, 10, M.trunk, -1.18, PLZ + 0.08, 1.06));
  var treeTop = mesh(new THREE.SphereGeometry(0.09, 12, 10), M.foliage);
  put(g, treeTop, -1.18, PLZ + 0.24, 1.06);
  var treeTop2 = mesh(new THREE.SphereGeometry(0.055, 12, 10), M.foliage2);
  put(g, treeTop2, -1.13, PLZ + 0.31, 1.02);                         /* 树冠第二球 */
  put(g, cyl(0.016, 0.022, 0.13, 10, M.trunk, -0.52, PLZ + 0.065, 1.08));
  var tree2Top = mesh(new THREE.SphereGeometry(0.07, 12, 10), M.foliage2);
  put(g, tree2Top, -0.52, PLZ + 0.20, 1.08);
  var bushList = [
    new THREE.SphereGeometry(0.045, 12, 10), new THREE.SphereGeometry(0.038, 12, 10),
    new THREE.SphereGeometry(0.050, 12, 10), new THREE.SphereGeometry(0.034, 12, 10)
  ];
  var bushT = [
    [-0.66, PLZ + 0.030, 0.76], [-0.58, PLZ + 0.026, 0.70],
    [-0.44, PLZ + 0.028, 0.78], [-0.50, PLZ + 0.024, 0.86]
  ];
  var bi;
  for (bi = 0; bi < 4; bi++) bushList[bi].translate(bushT[bi][0], bushT[bi][1], bushT[bi][2]);
  g.add(mesh(mergeGeos(bushList), M.foliage));
  /* 售票亭（+基座 +窗框） */
  var booth = grp(); put(g, booth, 0.38, PLZ, 0.88);
  put(booth, box(0.26, 0.30, 0.22, M.white, 0, 0.15, 0));
  put(booth, box(0.30, 0.03, 0.26, M.stoneM, 0, 0.015, 0));          /* 亭基座 */
  var bWin = mesh(new THREE.PlaneGeometry(0.14, 0.12), M.trainGlass);
  bWin.position.set(0, 0.18, 0.13); booth.add(bWin);
  var bFrame = mesh(mergeGeos([
    tbox(0.16, 0.012, 0.012, 0, 0.243, 0.13),
    tbox(0.16, 0.012, 0.012, 0, 0.117, 0.13),
    tbox(0.012, 0.126, 0.012, -0.074, 0.18, 0.13),
    tbox(0.012, 0.126, 0.012, 0.074, 0.18, 0.13)
  ]), M.colRed);                                                     /* 售票窗框 */
  booth.add(bFrame);
  var bSign = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 0.07),
    new THREE.MeshStandardMaterial({ map: texTicket(), roughness: 0.55, flatShading: true }));
  bSign.position.set(0, 0.295, 0.13); booth.add(bSign);
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
    function (t) {                                   /* 1) 站钟：秒针 sweep + 时针缓行 */
      secHand.rotation.z = -t * (PI / 30);
      hourHand.rotation.z = -t * 0.00035;
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
