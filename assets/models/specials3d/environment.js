/* =====================================================================================
 * 大富翁 · 富贵人生 —— 模块 F · 书房桌面环境（environment.js）
 * -------------------------------------------------------------------------------------
 * 接管钩子：view3d.buildStaticScene() 末尾调用
 *   window.Environment3D.replace({ THREE, scene, staticRoot })
 *
 * 用户诉求：棋盘外原本是大片绿色毛毡 + 散件，改为「温馨复古书房」：
 *   深木书架墙 + 厚重书桌（棋盘摆放在桌面上）+ 暖黄台灯 + 落地窗夜景（城市剪影）
 *   + 地球仪 + 木梯 + 皮椅 + 盆栽 + 波斯地毯（布局参照 refs/scene_study_room.png）。
 *
 * replace 做四件事：
 *   1) 清理：移除毛毡圆盘（CircleGeometry r≥60）与外圈 Ring（outerRadius≥60）；
 *      棋盘外围散件（staticRoot 直接子级 |x|>23.5 或 |z|>17.5：蓝图纸/散骰/金币堆/车模/飞机/路障）；
 *      保留 plinth/棋盘框架/40 格/中央陈设（logo/海报/金币堆/牌堆/骰子）
 *   2) 搭建：木地板(±120 Canvas) + 四面墙(单面朝内, 踢脚线/墙裙) + 背墙落地窗(分格框+夜景 Canvas)
 *      + 书架 ×9(书脊 InstancedMesh) + 书桌(车削腿/抽屉/铜拉手/木纹 Canvas) + 地毯
 *      + 皮椅 + 木梯 + 落地盆栽×2 + 桌面小盆栽 + 地球仪 + 台灯×2(绿罩 banker lamp) + 挂画×4
 *   3) 光照：Hemisphere 0.52→0.22 / Ambient 0.2→0.10 / 主阳光 1.12→0.6(保棋盘照度) / 冷补光→0.1，
 *      新增顶部暖 Spot(罩住棋盘, 不投影) + 台灯 PointLight×2 —— 棋盘顶面照度 ≥ 原水平、四周氛围暗；
 *      fog (95,215)→(150,380) 并调暖黑（原深绿雾会把书架/窗景洗灰），背景同步暖黑
 *   4) 兜底：幂等（二次 replace 直接返回）、分段 try/catch、零 Math.random（种子 LCG）、
 *      每帧零新增对象/GC；新增灯光全部挂 staticRoot 子树（scene.children 前 4 根 root 不动）
 *
 * 布局参数：地板 y=-30（±120）；墙距 ±100、墙高 62（顶 y=32、无顶棚——俯视仍见棋盘）；
 *   窗洞背墙 x∈[-28,28] y∈[-14,22]；桌面 56×42×2.5 顶面 y=0.66（plinth 底 y=0 恰好压在桌面）；
 *   书架 28×52×10：背墙 x=±44、侧墙 z=-56/-20/+16、前墙 x=-38；地毯 74×56；皮椅 z=+37 面向书桌；
 *   木梯 (-33,z-79.8) 26.6° 倚背墙书架；桌角陈设：台灯(±24.5,∓17.5)、地球仪(-24.5,-17.5)、
 *   小盆栽(24.5,17.5)、书堆(-25,14.5) —— 全部落在桌面边环（棋盘 ±22.3/±16.3 之外）。
 * 网格预算：室内 ~240 mesh（书脊 9 个 InstancedMesh 共 ~800 实例）+ 原场景 ~110 ≤ 600。
 * ==================================================================================== */
(function () {
'use strict';

var PI = Math.PI;

/* ---------- 确定性伪随机（mulberry32；全场景零 Math.random，截图/计数稳定） ---------- */
function RNG(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------- 布局常量 ---------- */
var FLOOR_Y = -30;            // 地板面高度
var ROOM_HALF = 100;          // 墙距中心
var WALL_H = 62;              // 墙高（-30 → 32，无顶棚保证俯视可见棋盘）
var DESK_TOP_Y = 0.66;        // 桌面顶面（plinth 底 y=0 沉入桌面 0.06，视觉上恰好压在桌上）
var DESK_W = 56, DESK_D = 42, DESK_T = 2.5;
var WIN = { x0: -28, x1: 28, y0: -14, y1: 22 };   // 背墙窗洞

function define(THREE) {

  /* ================= 纹理工具（全部程序化 Canvas ≤256px） ================= */
  function ctex(cv, rx, ry) {
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    if (rx) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(rx, ry || rx); }
    tex.anisotropy = 4;
    return tex;
  }
  function canv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  /* 书桌面木纹：暖棕底 + 水平长纹 + 木节 + 边缘暗角 */
  function texDeskWood() {
    var cv = canv(256, 256), c = cv.getContext('2d'), r = RNG(101);
    c.fillStyle = '#7c4a22'; c.fillRect(0, 0, 256, 256);
    for (var i = 0; i < 46; i++) {
      var y = r() * 256;
      c.strokeStyle = r() < 0.6 ? 'rgba(58,30,10,' + (0.05 + r() * 0.1).toFixed(3) + ')'
                                : 'rgba(240,190,120,' + (0.03 + r() * 0.05).toFixed(3) + ')';
      c.lineWidth = 0.6 + r() * 1.8;
      c.beginPath(); c.moveTo(0, y);
      c.bezierCurveTo(80, y + (r() - 0.5) * 10, 170, y + (r() - 0.5) * 10, 256, y + (r() - 0.5) * 6);
      c.stroke();
    }
    for (var k = 0; k < 3; k++) {
      var kx = 40 + r() * 176, ky = 40 + r() * 176;
      c.strokeStyle = 'rgba(52,26,8,.3)'; c.lineWidth = 1;
      for (var q = 1; q <= 3; q++) { c.beginPath(); c.ellipse(kx, ky, q * 3.2, q * 1.8, 0, 0, PI * 2); c.stroke(); }
    }
    var vg = c.createRadialGradient(128, 128, 90, 128, 128, 190);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,12,0,.34)');
    c.fillStyle = vg; c.fillRect(0, 0, 256, 256);
    return ctex(cv);
  }

  /* 木地板：错缝条板 */
  function texFloor() {
    var cv = canv(256, 256), c = cv.getContext('2d'), r = RNG(202);
    for (var row = 0; row < 8; row++) {
      var l = 10 + r() * 14;
      c.fillStyle = 'rgb(' + Math.round(96 + l) + ',' + Math.round(62 + l * 0.7) + ',' + Math.round(34 + l * 0.4) + ')';
      c.fillRect(0, row * 32, 256, 32);
      c.strokeStyle = 'rgba(40,22,8,.55)'; c.lineWidth = 2;
      c.strokeRect(-2, row * 32, 260, 32);
      var joint = 40 + r() * 90;
      while (joint < 256) { c.fillRect(joint, row * 32 + 1, 2, 30); joint += 90 + r() * 90; }
      c.strokeStyle = 'rgba(50,28,10,.16)'; c.lineWidth = 1;
      for (var g = 0; g < 7; g++) { var gy = row * 32 + 3 + r() * 27; c.beginPath(); c.moveTo(0, gy); c.lineTo(256, gy + (r() - 0.5) * 4); c.stroke(); }
    }
    return ctex(cv, 11, 11);
  }

  /* 波斯地毯：绯红底 + 藏青边 + 金线菱形章 */
  function texRug() {
    var cv = canv(256, 256), c = cv.getContext('2d'), r = RNG(303);
    c.fillStyle = '#7c2f28'; c.fillRect(0, 0, 256, 256);
    c.fillStyle = '#242b45'; c.fillRect(0, 0, 256, 18); c.fillRect(0, 238, 256, 18);
    c.fillRect(0, 0, 18, 256); c.fillRect(238, 0, 18, 256);
    c.strokeStyle = '#c9a04c'; c.lineWidth = 3;
    c.strokeRect(24, 24, 208, 208); c.strokeRect(30, 30, 196, 196);
    c.save(); c.translate(128, 128); c.rotate(PI / 4);
    c.fillStyle = '#2c3a5c'; c.fillRect(-46, -46, 92, 92);
    c.strokeStyle = '#c9a04c'; c.lineWidth = 4; c.strokeRect(-46, -46, 92, 92);
    c.fillStyle = '#7c2f28'; c.fillRect(-20, -20, 40, 40);
    c.restore();
    [[64, 64], [192, 64], [64, 192], [192, 192]].forEach(function (p) {
      c.save(); c.translate(p[0], p[1]); c.rotate(PI / 4);
      c.fillStyle = '#9a5a34'; c.fillRect(-13, -13, 26, 26);
      c.strokeStyle = '#c9a04c'; c.lineWidth = 2; c.strokeRect(-13, -13, 26, 26);
      c.restore();
    });
    c.fillStyle = 'rgba(0,0,0,.12)';
    for (var i = 0; i < 300; i++) c.fillRect(r() * 256, r() * 256, 1.5, 1.5);
    return ctex(cv);
  }

  /* 窗外夜景：黄昏渐变 + 星月 + 城市剪影（MeshBasic 自发光板，不受灯光/雾影响） */
  function texSky() {
    var cv = canv(256, 192), c = cv.getContext('2d'), r = RNG(404);
    var g = c.createLinearGradient(0, 0, 0, 192);
    g.addColorStop(0, '#0b1030'); g.addColorStop(0.42, '#33235a');
    g.addColorStop(0.66, '#8a4a63'); g.addColorStop(0.82, '#d8764a'); g.addColorStop(1, '#f2a45c');
    c.fillStyle = g; c.fillRect(0, 0, 256, 192);
    for (var i = 0; i < 70; i++) { c.globalAlpha = 0.25 + r() * 0.7; c.fillStyle = '#ffffff'; c.fillRect(r() * 256, r() * 95, 1.4, 1.4); }
    c.globalAlpha = 1;
    c.fillStyle = 'rgba(244,233,196,.16)'; c.beginPath(); c.arc(196, 40, 22, 0, PI * 2); c.fill();
    c.fillStyle = '#f4e9c4'; c.beginPath(); c.arc(196, 40, 12, 0, PI * 2); c.fill();
    c.fillStyle = '#181028';
    var bx = 0;
    while (bx < 256) {
      var bw = 13 + r() * 20, bh = 20 + r() * 52;
      c.fillRect(bx, 162 - bh, bw, bh + 30);
      if (r() < 0.22) c.fillRect(bx + bw * 0.3, 162 - bh - 14, bw * 0.4, 16);
      bx += bw + 2 + r() * 5;
    }
    c.beginPath();
    c.moveTo(160, 162); c.lineTo(172, 64); c.lineTo(184, 162); c.closePath(); c.fill();
    c.fillStyle = '#ffc36b';
    for (var w = 0; w < 90; w++) { c.globalAlpha = 0.4 + r() * 0.6; c.fillRect(r() * 252, 118 + r() * 70, 2, 2.6); }
    c.globalAlpha = 1;
    return ctex(cv);
  }

  /* 地球仪贴图：海洋 + 大陆色块 */
  function texGlobe() {
    var cv = canv(128, 64), c = cv.getContext('2d'), r = RNG(505);
    c.fillStyle = '#2e5f8a'; c.fillRect(0, 0, 128, 64);
    c.fillStyle = '#4a7a46';
    [[16, 16, 14, 10], [40, 38, 10, 12], [58, 18, 16, 9], [92, 34, 14, 11], [110, 16, 10, 8], [74, 46, 8, 6]]
      .forEach(function (b) { c.beginPath(); c.ellipse(b[0], b[1], b[2], b[3], r() * 3, 0, PI * 2); c.fill(); });
    c.fillStyle = 'rgba(240,235,215,.85)';
    for (var i = 0; i < 40; i++) c.fillRect(r() * 128, r() * 64, 1, 1);
    return ctex(cv);
  }

  /* 挂画：小幅风景 */
  function texPicture(seed) {
    var cv = canv(128, 96), c = cv.getContext('2d'), r = RNG(seed);
    c.fillStyle = '#d8c9a0'; c.fillRect(0, 0, 128, 96);
    var g = c.createLinearGradient(0, 8, 0, 88);
    g.addColorStop(0, '#8a94b8'); g.addColorStop(0.6, '#d8a878'); g.addColorStop(1, '#6a5038');
    c.fillStyle = g; c.fillRect(6, 6, 116, 84);
    c.fillStyle = '#4c5c38';
    c.beginPath(); c.moveTo(6, 66); c.lineTo(34, 34); c.lineTo(60, 66); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(44, 70); c.lineTo(78, 30); c.lineTo(112, 70); c.closePath(); c.fill();
    c.fillStyle = '#2e3a28'; c.fillRect(6, 66, 116, 24);
    c.fillStyle = 'rgba(255,235,180,.9)';
    c.beginPath(); c.arc(96, 22, 7, 0, PI * 2); c.fill();
    return ctex(cv);
  }

  /* ================= 共享材质 ================= */
  function lin(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function std(hex, o) {
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: lin(hex),
      roughness: o.rough !== undefined ? o.rough : 0.85,
      metalness: o.metal || 0,
    });
    if (o.map) m.map = o.map;
    if (o.emissive) { m.emissive = lin(o.emissive); m.emissiveIntensity = o.ei !== undefined ? o.ei : 1; }
    if (o.side) m.side = o.side;
    if (o.flat) m.flatShading = true;
    return m;
  }

  var M = {};

  function buildMaterials() {
    M.wall = std('#5a4430', { rough: 0.94 });
    M.wainscot = std('#33220f', { rough: 0.88 });
    M.woodDark = std('#3a2415', { rough: 0.82 });
    M.woodMid = std('#5f3a1c', { rough: 0.78 });
    M.brass = std('#c9963f', { rough: 0.35, metal: 0.75 });
    M.leather = std('#5a3226', { rough: 0.62 });
    M.leatherDark = std('#43241a', { rough: 0.7 });
    M.leaf = std('#3e6b38', { rough: 0.9, flat: true });
    M.leaf2 = std('#32603a', { rough: 0.9, flat: true });
    M.terracotta = std('#9a5230', { rough: 0.9 });
    M.soil = std('#2a1a10', { rough: 1 });
    M.trunk = std('#5a4028', { rough: 0.95 });
    M.book = std('#f2ead8', { rough: 0.88 });
    M.shadeGreen = std('#1e6b40', { rough: 0.5, emissive: '#ff9a4a', ei: 0.25, side: THREE.DoubleSide });
    M.bulb = std('#ffdba8', { rough: 0.4, emissive: '#ffc27a', ei: 2.6 });
  }

  function mesh(geo, mat, x, y, z, name) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    if (name) m.name = name;
    return m;
  }
  function box(w, h, d, mat, x, y, z, name) {
    var m = mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, name);
    m.castShadow = m.receiveShadow = true;
    return m;
  }

  /* ================= 清理：毛毡圆桌 + 外圈 Ring + 棋盘外围散件 ================= */
  function cleanup(staticRoot) {
    var removed = { felt: 0, scatter: 0 };
    var kids = staticRoot.children.slice();
    for (var i = 0; i < kids.length; i++) {
      var o = kids[i];
      var isFelt = false;
      if (o.isMesh && o.geometry) {
        var p = o.geometry.parameters || {};
        if (o.geometry.type === 'CircleGeometry' && (p.radius || 0) >= 60) isFelt = true;
        if (o.geometry.type === 'RingGeometry' && (p.outerRadius || 0) >= 60) isFelt = true;
      }
      if (isFelt) { staticRoot.remove(o); removed.felt++; continue; }
      if (Math.abs(o.position.x) > 23.5 || Math.abs(o.position.z) > 17.5) {
        staticRoot.remove(o); removed.scatter++;
      }
    }
    return removed;
  }

  /* ================= 光照 / 雾 / 背景适配（幂等：__envTuned 标记） ================= */
  function tuneAtmosphere(scene) {
    scene.traverse(function (o) {
      if (o.isLight && !o.userData.__envTuned) {
        o.userData.__envTuned = true;
        if (o.isHemisphereLight) {
          o.intensity = 0.22;
          o.color = lin('#8f8168');
          if (o.groundColor) o.groundColor = lin('#1a120a');
        } else if (o.isAmbientLight) {
          o.intensity = 0.10;
          o.color = lin('#ffd9a8');
        } else if (o.isDirectionalLight) {
          if (o.castShadow) { o.intensity = 0.6; o.color = lin('#ffe3b8'); }   // 主阳光：保棋盘照度
          else { o.intensity = 0.1; }                                          // 冷补光压暗
        }
      }
    });
    if (scene.fog) { scene.fog.near = 150; scene.fog.far = 380; scene.fog.color = lin('#0d0906'); }
    if (scene.background && scene.background.isColor) scene.background = lin('#0a0705');
  }

  /* ================= 地板 + 四面墙 + 踢脚线/墙裙 ================= */
  function buildRoomChildren(room) {
    var floor = mesh(new THREE.PlaneGeometry(240, 240), std('#8a6a44', { rough: 0.9, map: texFloor() }), 0, FLOOR_Y, 0, 'env3d-floor');
    floor.rotation.x = -PI / 2;
    floor.receiveShadow = true;
    room.add(floor);

    /* 墙：单面 Plane 正面朝房内 —— 相机飞出房间时近墙背面自动剔除（透视不挡棋盘） */
    function wall(name, w, h, x, y, z, rotY) {
      var m = mesh(new THREE.PlaneGeometry(w, h), M.wall, x, y, z, name);
      m.rotation.y = rotY;
      m.receiveShadow = true;
      m.userData.envWall = name;
      room.add(m);
    }
    var WS = WIN.x0 - (-ROOM_HALF);   // 背墙窗侧段宽 72
    wall('env3d-wall-back-L', WS, WALL_H, -ROOM_HALF / 2 - WIN.x0 / 2, FLOOR_Y + WALL_H / 2, -ROOM_HALF, 0);
    wall('env3d-wall-back-R', WS, WALL_H, ROOM_HALF / 2 + WIN.x0 / 2, FLOOR_Y + WALL_H / 2, -ROOM_HALF, 0);
    wall('env3d-wall-back-T', WIN.x1 - WIN.x0, FLOOR_Y + WALL_H - WIN.y1, 0, (FLOOR_Y + WALL_H + WIN.y1) / 2, -ROOM_HALF, 0);
    wall('env3d-wall-back-B', WIN.x1 - WIN.x0, WIN.y0 - FLOOR_Y, 0, (FLOOR_Y + WIN.y0) / 2, -ROOM_HALF, 0);
    wall('env3d-wall-front', 200, WALL_H, 0, FLOOR_Y + WALL_H / 2, ROOM_HALF, PI);
    wall('env3d-wall-left', 200, WALL_H, -ROOM_HALF, FLOOR_Y + WALL_H / 2, 0, PI / 2);
    wall('env3d-wall-right', 200, WALL_H, ROOM_HALF, FLOOR_Y + WALL_H / 2, 0, -PI / 2);

    /* 踢脚线 + 墙裙 + 压条（四墙；内缩防 z-fight） */
    var skirt = [[200, 1.8, 0.9, 0, FLOOR_Y + 0.9, -ROOM_HALF + 0.45], [200, 1.8, 0.9, 0, FLOOR_Y + 0.9, ROOM_HALF - 0.45],
                 [0.9, 1.8, 200, -ROOM_HALF + 0.45, FLOOR_Y + 0.9, 0], [0.9, 1.8, 200, ROOM_HALF - 0.45, FLOOR_Y + 0.9, 0]];
    var wains = [[200, 6.5, 0.5, 0, FLOOR_Y + 5.55, -ROOM_HALF + 0.3], [200, 6.5, 0.5, 0, FLOOR_Y + 5.55, ROOM_HALF - 0.3],
                 [0.5, 6.5, 200, -ROOM_HALF + 0.3, FLOOR_Y + 5.55, 0], [0.5, 6.5, 200, ROOM_HALF - 0.3, FLOOR_Y + 5.55, 0]];
    var rails = [[200, 0.8, 1.0, 0, FLOOR_Y + 9.3, -ROOM_HALF + 0.5], [200, 0.8, 1.0, 0, FLOOR_Y + 9.3, ROOM_HALF - 0.5],
                 [1.0, 0.8, 200, -ROOM_HALF + 0.5, FLOOR_Y + 9.3, 0], [1.0, 0.8, 200, ROOM_HALF - 0.5, FLOOR_Y + 9.3, 0]];
    skirt.concat(wains, rails).forEach(function (a) { room.add(box(a[0], a[1], a[2], M.wainscot, a[3], a[4], a[5])); });
  }

  /* ================= 落地窗（窗框分格 + 夜景 + 窗台） ================= */
  function buildWindow(parent) {
    var g = new THREE.Group(); g.name = 'env3d-window';
    var wCx = (WIN.x0 + WIN.x1) / 2, wCy = (WIN.y0 + WIN.y1) / 2;
    var wW = WIN.x1 - WIN.x0, wH = WIN.y1 - WIN.y0;

    /* 窗框外圈（厚 2，凸进房内） */
    g.add(box(1.6, wH + 3.2, 2, M.woodMid, WIN.x0 - 0.8, wCy, -ROOM_HALF + 0.6));
    g.add(box(1.6, wH + 3.2, 2, M.woodMid, WIN.x1 + 0.8, wCy, -ROOM_HALF + 0.6));
    g.add(box(wW + 4.8, 1.6, 2, M.woodMid, wCx, WIN.y1 + 0.8, -ROOM_HALF + 0.6));
    g.add(box(wW + 4.8, 1.6, 2, M.woodMid, wCx, WIN.y0 - 0.8, -ROOM_HALF + 0.6));
    /* 分格：3 竖 2 横 */
    [-14, 0, 14].forEach(function (x) { g.add(box(0.55, wH, 0.9, M.woodMid, wCx + x, wCy, -ROOM_HALF + 0.55)); });
    [-2, 10].forEach(function (y) { g.add(box(wW, 0.55, 0.9, M.woodMid, wCx, wCy + y, -ROOM_HALF + 0.55)); });
    /* 窗台板（顶面 y = WIN.y0-1.05） */
    g.add(box(wW + 5, 0.9, 3.6, M.woodMid, wCx, WIN.y0 - 1.5, -ROOM_HALF + 1.5));

    /* 夜景自发光板（略大于窗洞，置于墙后，只有窗洞能看见） */
    var sky = mesh(new THREE.PlaneGeometry(wW + 4, wH + 4), new THREE.MeshBasicMaterial({ map: texSky() }), wCx, wCy, -ROOM_HALF - 1.2, 'env3d-sky');
    g.add(sky);

    /* 窗台一摞书（呼应参考图窗边陈设，坐在窗台板上） */
    g.add(box(4.2, 0.6, 2.8, M.book, wCx + 8, WIN.y0 - 0.75, -ROOM_HALF + 2.2));
    g.add(box(3.6, 0.55, 2.5, M.leather, wCx + 8, WIN.y0 - 0.2, -ROOM_HALF + 2.1));

    parent.add(g);
  }

  /* ================= 书架 ×9（分层格 + 书脊 InstancedMesh + 摆件） ================= */
  var BOOK_PALETTE = ['#8a2f23', '#2f4a6e', '#3c5a34', '#6e4a1f', '#5c3060', '#a06a2c',
                      '#274044', '#7c3a52', '#42518a', '#845c2e', '#93553a', '#33523e'];
  function buildShelf(parent, cx, cz, rotY, seed) {
    var g = new THREE.Group();
    g.position.set(cx, FLOOR_Y, cz);
    g.rotation.y = rotY;
    var w = 28, h = 52, d = 10, r = RNG(seed);

    /* 书架本体：背板/侧板/顶底/檐口 */
    g.add(box(w, h, 0.5, M.woodDark, 0, h / 2, -d / 2 + 0.25));
    g.add(box(0.6, h, d, M.woodDark, -w / 2 + 0.3, h / 2, 0));
    g.add(box(0.6, h, d, M.woodDark, w / 2 - 0.3, h / 2, 0));
    g.add(box(w, 0.7, d, M.woodDark, 0, h - 0.35, 0));
    g.add(box(w, 0.7, d, M.woodDark, 0, 0.35, 0));
    g.add(box(w + 1.6, 1.2, d + 1.2, M.woodMid, 0, h + 0.6, 0));

    /* 4 块层板（5 行） */
    var ROWS = 5, pitch = (h - 1.4) / ROWS;
    for (var k = 1; k < ROWS; k++) g.add(box(w - 1.2, 0.4, d - 1.6, M.woodMid, 0, 0.7 + pitch * k, 0));

    /* 书脊：先收集变换/颜色，再一次 InstancedMesh 成型（1 draw call / 架） */
    var mats = [], cols = [], tmpM = new THREE.Matrix4(), q = new THREE.Quaternion(),
        e = new THREE.Euler(), pos = new THREE.Vector3(), scl = new THREE.Vector3(), col = new THREE.Color();
    for (var row = 0; row < ROWS; row++) {
      var y0 = 0.7 + pitch * row + (row > 0 ? 0.2 : 0);
      var clear = pitch - (row > 0 ? 0.6 : 0.5);
      var x = -w / 2 + 1;
      var maxX = w / 2 - 1;
      while (x < maxX && mats.length < 130) {
        if (r() < 0.045) { x += 1.1 + r() * 1.2; continue; }            // 留空档
        var bw = 0.75 + r() * 1.25;
        var bh = Math.min(clear - 0.7, 4.6 + r() * Math.max(0.1, clear - 5.1));
        if (bh < 3.4) { x += bw; continue; }
        var lean = (r() < 0.055) ? (0.09 + r() * 0.08) * (r() < 0.5 ? 1 : -1) : 0;
        e.set(0, 0, lean); q.setFromEuler(e);
        pos.set(x + bw / 2 + (lean > 0 ? bh * 0.45 : lean < 0 ? -bh * 0.45 : 0), y0, (r() - 0.5) * 1.4);
        scl.set(bw, bh, 5.4 + r() * 2.6);
        tmpM.compose(pos, q, scl); mats.push(tmpM.clone());
        col.set(BOOK_PALETTE[(r() * BOOK_PALETTE.length) | 0]).convertSRGBToLinear();
        col.multiplyScalar(0.82 + r() * 0.36); cols.push(col.clone());
        x += bw + (Math.abs(lean) > 0 ? 0.9 : 0.06);
      }
    }
    if (mats.length) {
      var inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.book, mats.length);
      inst.name = 'env3d-books';
      for (var i = 0; i < mats.length; i++) { inst.setMatrixAt(i, mats[i]); inst.setColorAt(i, cols[i]); }
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      inst.frustumCulled = false;           /* 实例包围球不随实例更新，直接关剔除防整架消失 */
      inst.castShadow = false; inst.receiveShadow = false;
      g.add(inst);
    }

    /* 行内摆件：相框 / 平放书堆 / 小陶罐（确定性布置，面由组 rotY 定向） */
    [1, 3].forEach(function (rowK, dK) {
      var dy = 0.7 + pitch * rowK + (rowK > 0 ? 0.2 : 0);
      if (r() < 0.75) {
        var fx = (r() - 0.5) * (w - 12);
        g.add(box(3.8, 4.8, 0.4, M.woodMid, fx, dy + 2.4, -d / 2 + 1.2));
        g.add(mesh(new THREE.PlaneGeometry(3.1, 4.0), new THREE.MeshStandardMaterial({ map: texPicture(seed * 7 + dK), roughness: 0.9 }), fx, dy + 2.4, -d / 2 + 1.45));
      }
      if (r() < 0.6) {
        var sx = (r() - 0.5) * (w - 14);
        g.add(box(3.6, 0.6, 5.2, M.book, sx, dy + 0.3, (r() - 0.5) * 2));
        g.add(box(3.1, 0.55, 4.7, M.leather, sx + 0.2, dy + 0.86, (r() - 0.5) * 1.6));
      }
      if (r() < 0.3) {
        g.add(mesh(new THREE.SphereGeometry(1.05, 10, 8), M.terracotta, (r() - 0.5) * (w - 12), dy + 1.0, 1.2));
      }
    });
    parent.add(g);
    return g;
  }
  function buildShelves(parent) {
    buildShelf(parent, -44, -95, 0, 11);      /* 背墙窗左 */
    buildShelf(parent, 44, -95, 0, 12);       /* 背墙窗右 */
    buildShelf(parent, -95, -56, PI / 2, 21); /* 左墙三座 */
    buildShelf(parent, -95, -20, PI / 2, 22);
    buildShelf(parent, -95, 16, PI / 2, 23);
    buildShelf(parent, 95, -56, -PI / 2, 31); /* 右墙三座 */
    buildShelf(parent, 95, -20, -PI / 2, 32);
    buildShelf(parent, 95, 16, -PI / 2, 33);
    buildShelf(parent, -38, 95, PI, 41);      /* 前墙一座 */
  }

  /* ================= 书桌（棋盘压在桌面上） ================= */
  function buildDesk(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-desk';

    /* 桌面：56×42×2.5，顶面 y=0.66（plinth 底 y=0 恰压桌面）；顶面木纹 Canvas */
    var topMat = std('#8a5a2c', { rough: 0.62, map: texDeskWood() });
    var top = new THREE.Mesh(new THREE.BoxGeometry(DESK_W, DESK_T, DESK_D),
      [M.woodMid, M.woodMid, topMat, M.woodMid, M.woodMid, M.woodMid]);
    top.name = 'env3d-desk-top';
    top.position.set(0, DESK_TOP_Y - DESK_T / 2, 0);
    top.castShadow = top.receiveShadow = true;
    g.add(top);

    /* 裙板 */
    g.add(box(50, 4, 34, M.woodMid, 0, DESK_TOP_Y - DESK_T / 2 - 2.3, 0));

    /* 四条车削桌腿（Lathe 旋成体，FLOOR_Y → 桌底 -1.84） */
    var prof = [[1.7, 0], [1.35, 0.9], [1.0, 2.2], [1.6, 4.6], [1.95, 7.2], [1.45, 9.4],
                [0.92, 11.2], [0.85, 14.6], [1.35, 17.4], [1.5, 19.6], [1.05, 22.4],
                [0.88, 24.8], [1.25, 27.2], [1.45, 28.16]];
    var pts = [];
    for (var i = 0; i < prof.length; i++) pts.push(new THREE.Vector2(prof[i][0], prof[i][1]));
    var legGeo = new THREE.LatheGeometry(pts, 12);
    [[-24, -17], [24, -17], [-24, 17], [24, 17]].forEach(function (p) {
      var leg = mesh(legGeo, M.woodMid, p[0], FLOOR_Y, p[1]);
      leg.castShadow = leg.receiveShadow = true;
      g.add(leg);
    });

    /* 前后抽屉面板 ×3 + 铜拉手 ×3（两长侧均做，360° 环视不穿帮） */
    [1, -1].forEach(function (sz) {
      for (var k = -1; k <= 1; k++) {
        g.add(box(13.6, 2.7, 0.55, M.woodMid, k * 16.5, DESK_TOP_Y - DESK_T / 2 - 2.3, sz * 17.25));
        var knob = mesh(new THREE.SphereGeometry(0.42, 10, 8), M.brass, k * 16.5, DESK_TOP_Y - DESK_T / 2 - 2.3, sz * 17.65);
        knob.castShadow = true;
        g.add(knob);
      }
    });

    parent.add(g);
    return g;
  }

  /* ================= 地毯（桌面正下方地面上） ================= */
  function buildRug(parent) {
    var rug = mesh(new THREE.PlaneGeometry(74, 56), std('#7c2f28', { rough: 0.96, map: texRug() }), 0, FLOOR_Y + 0.07, 2, 'env3d-rug');
    rug.rotation.x = -PI / 2;
    rug.receiveShadow = true;
    parent.add(rug);
  }

  /* ================= 皮椅（面向书桌） ================= */
  function buildChair(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-chair';
    g.position.set(0, FLOOR_Y, 37);
    /* 交叉脚 + 立柱（1.2 → 16 接坐垫底） */
    g.add(box(2, 1.2, 13, M.leatherDark, 0, 0.6, 0));
    g.add(box(13, 1.2, 2, M.leatherDark, 0, 1.22, 0));
    g.add(mesh(new THREE.CylinderGeometry(1.1, 1.5, 14.8, 10), M.leatherDark, 0, 8.6, 0));
    /* 坐垫 + 靠背（微后仰）+ 扶手 */
    g.add(box(13, 2.4, 12, M.leather, 0, 17.2, 0));
    var back = box(12.5, 19, 2.2, M.leather, 0, 29.5, 5.6);
    back.rotation.x = 0.09;
    g.add(back);
    [-1, 1].forEach(function (sx) {
      g.add(box(2.2, 1.8, 10, M.leatherDark, sx * 7.4, 24.2, 0.8));
      g.add(box(1.8, 5.4, 1.8, M.leatherDark, sx * 7.4, 20.6, 3.6));
    });
    parent.add(g);
  }

  /* ================= 木梯（26.6° 倚背墙左书架前沿） ================= */
  function buildLadder(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-ladder';
    g.position.set(-33, FLOOR_Y, -79.8);
    g.rotation.y = 0.1;
    g.rotation.x = -0.464;                   /* 顶端落在书架前沿 (z≈-90, y≈20.5) */
    var railGeo = new THREE.CylinderGeometry(0.32, 0.32, 23, 8);
    [-2.1, 2.1].forEach(function (x) {
      var rail = mesh(railGeo, M.woodMid, x, 11.5, 0);
      rail.castShadow = true;
      g.add(rail);
    });
    for (var k = 0; k < 7; k++) {
      var rung = mesh(new THREE.CylinderGeometry(0.24, 0.24, 4.2, 8), M.woodMid, 0, 2.5 + k * 3.1, 0);
      rung.rotation.z = PI / 2;
      rung.castShadow = true;
      g.add(rung);
    }
    parent.add(g);
  }

  /* ================= 盆栽（落地大 ×2 + 桌面小 ×1） ================= */
  function buildPlant(parent, x, z, s, seed, name) {
    var g = new THREE.Group();
    g.name = name;
    g.position.set(x, FLOOR_Y, z);
    g.scale.setScalar(s);
    var r = RNG(seed);
    g.add(mesh(new THREE.CylinderGeometry(2.6, 1.9, 4.2, 12), M.terracotta, 0, 2.1, 0));
    g.add(mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.3, 12), M.soil, 0, 4.15, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.35, 0.5, 6.5, 8), M.trunk, 0, 7.2, 0));
    for (var k = 0; k < 4; k++) {
      var leaf = mesh(new THREE.IcosahedronGeometry(2.5 + r() * 1.1, 0), k % 2 ? M.leaf : M.leaf2,
        (r() - 0.5) * 4.2, 11 + k * 1.7 + r(), (r() - 0.5) * 4.2);
      leaf.castShadow = true;
      g.add(leaf);
    }
    parent.add(g);
    return g;
  }
  function buildDeskPlant(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-desk-plant';
    g.position.set(24.5, DESK_TOP_Y, 17.5);
    g.add(mesh(new THREE.CylinderGeometry(0.95, 0.72, 1.5, 10), M.terracotta, 0, 0.75, 0));
    var leaf = mesh(new THREE.IcosahedronGeometry(1.15, 0), M.leaf, 0, 2.2, 0);
    leaf.castShadow = true;
    g.add(leaf);
    parent.add(g);
  }

  /* ================= 地球仪（桌面左后角，黄铜半环支架） ================= */
  function buildGlobe(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-globe';
    g.position.set(-24.5, DESK_TOP_Y, -17.5);
    g.add(mesh(new THREE.CylinderGeometry(1.5, 1.8, 0.9, 12), M.brass, 0, 0.45, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.7, 8), M.brass, 0, 1.75, 0));
    var ball = mesh(new THREE.SphereGeometry(2.35, 18, 14), new THREE.MeshStandardMaterial({ map: texGlobe(), roughness: 0.55 }), 0, 4.7, 0);
    ball.castShadow = true;
    g.add(ball);
    g.add(mesh(new THREE.TorusGeometry(2.55, 0.11, 6, 28, PI), M.brass, 0, 4.7, 0));
    var axis = mesh(new THREE.CylinderGeometry(0.08, 0.08, 5.7, 6), M.brass, 0, 4.7, 0);
    axis.rotation.z = 0.41;
    g.add(axis);
    parent.add(g);
  }

  /* ================= 台灯 ×2（绿罩 banker lamp + 暖光 PointLight） ================= */
  function buildLamp(parent, x, z, lightIntensity) {
    var g = new THREE.Group();
    g.name = 'env3d-lamp';
    g.position.set(x, DESK_TOP_Y, z);
    g.add(mesh(new THREE.CylinderGeometry(1.7, 2.0, 0.6, 14), M.brass, 0, 0.3, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.26, 0.3, 5.6, 10), M.brass, 0, 3.1, 0));
    g.add(mesh(new THREE.SphereGeometry(0.55, 10, 8), M.bulb, 0, 5.7, 0));
    /* 半球灯罩（俯视/侧视都成立）+ 黄铜顶钮 */
    var shade = mesh(new THREE.SphereGeometry(2.5, 16, 10, 0, PI * 2, 0, PI / 2), M.shadeGreen, 0, 5.9, 0);
    shade.scale.y = 0.78;
    g.add(shade);
    g.add(mesh(new THREE.SphereGeometry(0.32, 8, 6), M.brass, 0, 8.0, 0));
    if (lightIntensity > 0) {
      var pl = new THREE.PointLight(lin('#ffbe72'), lightIntensity, 65, 2);
      pl.position.set(0, 6.0, 0);
      g.add(pl);
    }
    parent.add(g);
    return g;
  }

  /* ================= 顶部暖聚光（罩住棋盘，保照度；不投影不加阴影开销） ================= */
  function buildKeySpot(parent) {
    var spot = new THREE.SpotLight(lin('#ffdfae'), 1.15, 0, 0.6, 0.5, 1);
    spot.name = 'env3d-key-spot';
    spot.position.set(0, 55, 5);
    spot.castShadow = false;
    spot.target.position.set(0, 0.7, 0);
    parent.add(spot);
    parent.add(spot.target);
  }

  /* ================= 桌面书堆 + 墙面挂画 ================= */
  function buildDeskBooks(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-desk-books';
    g.position.set(-25, DESK_TOP_Y, 14.5);
    g.rotation.y = 0.3;
    g.add(box(4.6, 0.7, 3.2, M.book, 0, 0.35, 0));
    g.add(box(4.0, 0.6, 2.9, M.leather, 0.15, 1.0, 0.05));
    parent.add(g);
  }
  function buildPictures(parent) {
    /* 相框面恒朝组局部 +z，由 rotY 定向到房内 */
    function picture(x, y, z, rotY, seed) {
      var g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      g.add(box(7, 9, 0.5, M.woodMid, 0, 0, 0));
      g.add(mesh(new THREE.PlaneGeometry(6, 8), new THREE.MeshStandardMaterial({ map: texPicture(seed), roughness: 0.9 }), 0, 0, 0.28));
      parent.add(g);
    }
    picture(-ROOM_HALF + 0.4, FLOOR_Y + 24, 60, PI / 2, 61);    /* 左墙 → 朝 +x */
    picture(ROOM_HALF - 0.4, FLOOR_Y + 24, 60, -PI / 2, 62);    /* 右墙 → 朝 -x */
    picture(35, FLOOR_Y + 24, ROOM_HALF - 0.4, PI, 63);         /* 前墙 → 朝 -z */
    picture(-80, FLOOR_Y + 24, -ROOM_HALF + 0.4, 0, 64);        /* 背墙 → 朝 +z */
  }

  /* ================= replace 主入口 ================= */
  function replace(env) {
    var THREE2 = env && env.THREE, scene = env && env.scene, staticRoot = env && env.staticRoot;
    if (!THREE2 || !scene || !staticRoot) return;
    if (staticRoot.userData && staticRoot.userData.__env3dDone) return;   /* 幂等：二次调用直接返回 */

    var removed = cleanup(staticRoot);            /* 1) 清理毛毡/外圈/散件 */
    tuneAtmosphere(scene);                        /* 3) 光照/雾/背景（先行生效） */
    buildMaterials();

    var room = new THREE.Group();
    room.name = 'env3d-room';
    staticRoot.add(room);

    /* 2) 搭建书房（分段 try：单项失败不影响其余陈设与游戏） */
    var steps = [
      function () { buildRoomChildren(room); },
      function () { buildWindow(room); },
      function () { buildShelves(room); },
      function () { buildDesk(room); },
      function () { buildRug(room); },
      function () { buildChair(room); },
      function () { buildLadder(room); },
      function () { buildPlant(room, 60, -87, 1.15, 71, 'env3d-plant-tall'); },
      function () { buildPlant(room, -86, 52, 0.95, 72, 'env3d-plant-corner'); },
      function () { buildDeskPlant(room); },
      function () { buildGlobe(room); },
      function () { buildLamp(room, 24.5, -17.5, 1.0); },
      function () { buildLamp(room, -24.5, 17.5, 0.75); },
      function () { buildKeySpot(room); },
      function () { buildDeskBooks(room); },
      function () { buildPictures(room); },
    ];
    var failed = [];
    for (var i = 0; i < steps.length; i++) {
      try { steps[i](); } catch (e) { failed.push(i + ': ' + (e && e.message)); }
    }

    /* 统计（供冒烟测试/汇报） */
    var meshes = 0, instanced = 0;
    scene.traverse(function (o) { if (o.isMesh) { meshes++; if (o.isInstancedMesh) instanced++; } });

    if (!staticRoot.userData) staticRoot.userData = {};
    staticRoot.userData.__env3dDone = true;       /* 建造完成才置位，失败可重入 */
    staticRoot.userData.__env3dInfo = { removed: removed, meshes: meshes, instanced: instanced, failed: failed };
    try {
      console.log('[Environment3D] 书房接管完成 · 移除毛毡 ' + removed.felt + ' / 散件 ' + removed.scatter +
        ' · 场景 mesh ' + meshes + '（InstancedMesh ' + instanced + '）' +
        (failed.length ? ' · 失败项 ' + failed.join(';') : ''));
    } catch (e) { /* ignore */ }
  }

  return { replace: replace };
}

/* ---------- 导出（THREE 就绪后才组装；重复加载保留先注册者） ---------- */
if (typeof window !== 'undefined' && typeof THREE !== 'undefined') {
  if (!(window.Environment3D && window.Environment3D.replace)) {
    window.Environment3D = define(THREE);
  }
}
})();
