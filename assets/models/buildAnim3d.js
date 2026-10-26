/* =====================================================================================
 * 富贵人生 —— 建筑升级工地动画 v2（buildAnim3d.js）
 * -------------------------------------------------------------------------------------
 * 工艺基准：对齐 props3d（如 prop_1 的 stage4 用 118 行做台基/柱廊/门钉/匾额/窗棂/瓦垄/吻兽）。
 * v1 只有 16 块围挡板 + 9 个楼体盒子，属"示意模型"级别；本次按同一拆分粒度重写。
 *
 * 性能策略：所有部件都是单位立方体 + 矩阵缩放，按材质归入 Batch，每个 Batch 生成一个
 * InstancedMesh。细节能堆很密，drawCall 只随「批次数」增长，不随方块数增长。
 *
 * 动 / 静分离：
 *   · 围挡（四面各自成组）—— 升起时整组平移
 *   · 楼体（每层各自成组）—— 生长时整层 scale.y
 *   · 脚手架（每层各自成组）—— 按进度显隐整层
 *   · 塔吊 —— 独立 Group，可回转，吊钩独立升降
 *
 * 设计前提（与"过场动画"不同）：
 *   1) 地产格原地播放，不进独立场景、不遮 UI、不锁回合
 *   2) 镜头完全不动，玩家自己拖视角看
 *   3) fire-and-forget：不返回 Promise、不被 await
 *   4) 并发上限 2，超出排队
 *
 * 依赖：THREE r147；不依赖项目内其它模块。
 * ==================================================================================== */
(function () {
  'use strict';

  if (typeof THREE === 'undefined') {
    if (typeof console !== 'undefined') console.error('[buildAnim3d] THREE 未定义');
    return;
  }

  /* ================= 参数 ================= */
  var CFG = {
    duration: 12.0,          // 总时长（细节变多后略延长，节拍更从容）
    maxConcurrent: 2,
    lotHalf: 1.16,           // 场地半宽（地产格 2.5，留边防穿模）
    layerH: 0.34,            // 标准层高
    pitDepth: 0.62,          // 基坑深度
    fenceH: 0.42,            // 围挡总高：0.58 时会把 0.33 高的工人整体挡住，降到 0.42 露出人
    craneH: 2.9              // 塔吊高度
  };

  /* 时间轴（占总时长比例） */
  var T = {
    fenceStart: 0.02, fenceSpan: 0.16,
    pitStart: 0.16, pitEnd: 0.36,
    craneStart: 0.30, craneRise: 0.14,
    bodyStart: 0.36, bodyEnd: 0.74,
    scafStart: 0.38, scafRise: 0.42,
    scafDownStart: 0.84, scafDownEnd: 0.95,
    hookStart: 0.42, hookEnd: 0.80,
    settleEnd: 1.0
  };

  /* ================= 基础工具 ================= */
  var PI = Math.PI;
  function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function clamp01(x) { return x < 0 ? 0 : (x > 1 ? 1 : x); }
  function easeInOutLocal(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function easyOut(k) { return 1 - (1 - k) * (1 - k); }
  function easyInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }

  function stdMat(hex, o) {
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: C(hex),
      roughness: o.rough != null ? o.rough : 0.85,
      metalness: o.metal != null ? o.metal : 0.06,
      transparent: !!o.transparent,
      opacity: o.opacity != null ? o.opacity : 1,
      side: o.side || THREE.FrontSide
    });
    if (o.emi) { m.emissive = C(o.emi); m.emissiveIntensity = o.emiI != null ? o.emiI : 1; }
    return m;
  }

  /* ================= 材质库（全局共享，只创建一次） ================= */
  var MATS = null;
  function mats() {
    if (MATS) return MATS;
    MATS = {
      concrete: stdMat('#cfd3d6', { rough: 0.92, metal: 0.02 }),
      concreteDark: stdMat('#a6acb1', { rough: 0.95, metal: 0.02 }),
      steel: stdMat('#b9c2c9', { rough: 0.42, metal: 0.62 }),
      steelDark: stdMat('#7f8a92', { rough: 0.5, metal: 0.6 }),
      fenceBlue: stdMat('#2f6fb3', { rough: 0.62, metal: 0.1 }),
      fenceWhite: stdMat('#e6ebf0', { rough: 0.68, metal: 0.06 }),
      fencePost: stdMat('#3a4a56', { rough: 0.55, metal: 0.35 }),
      warn: stdMat('#e8a91f', { rough: 0.6, metal: 0.12 }),
      warnDark: stdMat('#26282b', { rough: 0.7, metal: 0.1 }),
      soil: stdMat('#7a5a3e', { rough: 0.98, metal: 0 }),
      soilDark: stdMat('#5b422c', { rough: 0.99, metal: 0 }),
      scaffold: stdMat('#c85a2a', { rough: 0.55, metal: 0.4 }),
      plank: stdMat('#b08a52', { rough: 0.9, metal: 0.02 }),
      net: stdMat('#2f8f5b', { rough: 0.8, metal: 0.05, transparent: true, opacity: 0.24, side: THREE.DoubleSide }),
      glassDark: stdMat('#3d4d5a', { rough: 0.3, metal: 0.4 }),
      lamp: stdMat('#ffb020', { rough: 0.35, metal: 0.15, emi: '#ffb020', emiI: 1.8 }),
      /* 工程机械配色 */
      machYellow: stdMat('#e0a51c', { rough: 0.55, metal: 0.25 }),   // 挖机/装载机涂装
      machRed: stdMat('#b83a2a', { rough: 0.6, metal: 0.2 }),       // 渣土车头
      rubber: stdMat('#1e2124', { rough: 0.95, metal: 0.02 }),      // 履带/轮胎
      hyd: stdMat('#c9d2d8', { rough: 0.28, metal: 0.85 }),         // 液压杆
      vest: stdMat('#e8631a', { rough: 0.7, metal: 0.05 }),         // 工人反光背心
      helmet: stdMat('#f2c327', { rough: 0.5, metal: 0.1 }),        // 安全帽
      skin: stdMat('#d9a87c', { rough: 0.8, metal: 0.02 }),
      cloth: stdMat('#2f4a63', { rough: 0.85, metal: 0.02 })        // 工装
    };
    return MATS;
  }

  /* ================= 几何批处理（方块 / 圆柱 / 球体）=================
   * 全是方块会显得棱角重、像体素积木。这里把 Batch 扩成「同材质 × 同几何类型」分组：
   *   box  → BoxGeometry(1,1,1)         靠 scale(w,h,d)
   *   cyl  → CylinderGeometry(1,1,1,14) 靠 scale(r,h,r)，14 段保证轮廓圆
   *   sph  → SphereGeometry(1,14,10)    靠 scale(r,r,r)
   * 每组一个 InstancedMesh，drawCall 仍只随「材质×类型」增长。 */
  var GEO = null;
  function geoLib() {
    if (GEO) return GEO;
    GEO = {
      box: new THREE.BoxGeometry(1, 1, 1),
      cyl: new THREE.CylinderGeometry(1, 1, 1, 14, 1),
      sph: new THREE.SphereGeometry(1, 14, 10),
      cone: new THREE.ConeGeometry(1, 1, 12, 1)
    };
    return GEO;
  }

  function Batch(mat, opts) {
    this.mat = mat;
    this.g = { box: [], cyl: [], sph: [], cone: [] };
    this.cast = !opts || opts.cast !== false;
    this.receive = !opts || opts.receive !== false;
    this.meshes = [];
  }
  Batch.prototype._push = function (type, o) {
    this.g[type].push(o);
    return this;
  };
  /* 方块 */
  Batch.prototype.box = function (w, h, d, x, y, z, o) {
    return this._push('box', {
      w: w, h: h, d: d, x: x, y: y, z: z,
      rx: (o && o.rx) || 0, ry: (o && o.ry) || 0, rz: (o && o.rz) || 0,
      color: (o && o.color) || null
    });
  };
  /* 圆柱：半径 r（可为数组 [rx, rz] 做椭圆截面），高 h */
  Batch.prototype.cyl = function (r, h, x, y, z, o) {
    var rx = Array.isArray(r) ? r[0] : r;
    var rz = Array.isArray(r) ? r[1] : r;
    return this._push('cyl', {
      w: rx * 2, h: h, d: rz * 2, x: x, y: y, z: z,
      rx: (o && o.rx) || 0, ry: (o && o.ry) || 0, rz: (o && o.rz) || 0,
      color: (o && o.color) || null
    });
  };
  /* 球 / 椭球 */
  Batch.prototype.sph = function (r, x, y, z, o) {
    var rx = Array.isArray(r) ? r[0] : r;
    var ry = Array.isArray(r) ? r[1] : r;
    var rz = Array.isArray(r) ? r[2] : r;
    return this._push('sph', {
      w: rx * 2, h: ry * 2, d: rz * 2, x: x, y: y, z: z,
      rx: (o && o.rx) || 0, ry: (o && o.ry) || 0, rz: (o && o.rz) || 0,
      color: (o && o.color) || null
    });
  };
  /* 圆锥（用于光锥、尖顶等） */
  Batch.prototype.cone = function (r, h, x, y, z, o) {
    return this._push('cone', {
      w: r * 2, h: h, d: r * 2, x: x, y: y, z: z,
      rx: (o && o.rx) || 0, ry: (o && o.ry) || 0, rz: (o && o.rz) || 0,
      color: (o && o.color) || null
    });
  };

  Batch.prototype.build = function (parent) {
    var L = geoLib();
    var self = this;
    var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    var v = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
    var out = [];
    ['box', 'cyl', 'sph', 'cone'].forEach(function (type) {
      var list = self.g[type];
      if (!list.length) return;
      var mesh = new THREE.InstancedMesh(L[type], self.mat, list.length);
      mesh.castShadow = self.cast;
      mesh.receiveShadow = self.receive;
      for (var i = 0; i < list.length; i++) {
        var it = list[i];
        e.set(it.rx, it.ry, it.rz);
        q.setFromEuler(e);
        v.set(it.x, it.y, it.z);
        sc.set(it.w, it.h, it.d);
        m4.compose(v, q, sc);
        mesh.setMatrixAt(i, m4);
        if (it.color) { col.set(it.color); mesh.setColorAt(i, col); }
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      if (parent) parent.add(mesh);
      out.push(mesh);
    });
    this.meshes = out;
    return out.length ? out[0] : null;
  };
  Batch.prototype.dispose = function () {
    this.meshes.forEach(function (m) { try { m.dispose(); } catch (e) { /* ignore */ } });
    this.meshes = [];
    this.g.box.length = 0; this.g.cyl.length = 0; this.g.sph.length = 0; this.g.cone.length = 0;
  };

  /* =====================================================================================
   * 部件工厂 —— 按 props3d 的拆分粒度
   * ==================================================================================== */

  /* ---------- 围挡单面 ----------
   * 构成：混凝土基座（含分段缝）/ 立柱（柱帽 + 柱脚套）/ 蓝白面板（上下两段）/ 中横档
   *      / 段内斜撑 / 顶部压条 / 底部黄黑反光条（0.18 节距交替） */
  function buildFenceSide(L, H, B) {
    B.concrete.box(L, 0.13, 0.12, 0, 0.065, 0);
    var segN = Math.round(L / 0.46);
    for (var s = 1; s < segN; s++) {
      B.concreteDark.box(0.012, 0.13, 0.125, -L / 2 + (L / segN) * s, 0.065, 0);
    }

    var posts = Math.max(2, Math.round(L / 0.55) + 1);
    for (var p = 0; p < posts; p++) {
      var px = -L / 2 + (L / (posts - 1)) * p;
      B.fencePost.box(0.075, H, 0.075, px, H / 2 + 0.13, 0);
      B.fencePost.box(0.095, 0.028, 0.095, px, H + 0.145, 0);
      B.fencePost.box(0.09, 0.04, 0.09, px, 0.15, 0);
    }

    var bay = L / (posts - 1);
    for (var b = 0; b < posts - 1; b++) {
      var cx = -L / 2 + bay * (b + 0.5);
      var mb = (b % 2 === 0) ? B.fenceBlue : B.fenceWhite;
      var pw = bay - 0.075;
      /* 上下两块面板，各自加「凹框」：四条细边压条 + 四角铆钉，远看有板材分块感 */
      [[0.24, 0.44], [0.70, 0.42]].forEach(function (pb) {
        var py = 0.13 + H * pb[0], ph = H * pb[1];
        mb.box(pw, ph, 0.035, cx, py, 0);
        var fw = pw - 0.035, fh = ph - 0.035;
        B.fencePost.box(fw, 0.011, 0.042, cx, py + ph / 2 - 0.008, 0.004);
        B.fencePost.box(fw, 0.011, 0.042, cx, py - ph / 2 + 0.008, 0.004);
        B.fencePost.box(0.011, fh, 0.042, cx - pw / 2 + 0.009, py, 0.004);
        B.fencePost.box(0.011, fh, 0.042, cx + pw / 2 - 0.009, py, 0.004);
        /* 四角铆钉 */
        [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(function (q) {
          B.warnDark.box(0.013, 0.013, 0.046, cx + q[0] * (pw / 2 - 0.022), py + q[1] * (ph / 2 - 0.022), 0.004);
        });
      });
      /* 中横档 + 段内斜撑（下段） */
      B.fencePost.box(bay - 0.06, 0.022, 0.05, cx, 0.13 + H * 0.475, 0);
      var diagLen = Math.sqrt(Math.pow(bay - 0.12, 2) + Math.pow(H * 0.42, 2));
      B.fencePost.box(diagLen, 0.016, 0.03, cx, 0.13 + H * 0.26, 0.032,
        { rz: Math.atan2(H * 0.42, bay - 0.12) });
    }
    /* 立柱顶灯罩（小方帽 + 灯面），夜间循环时是第二个暖光点 */
    for (var pl = 0; pl < posts; pl++) {
      var plx = -L / 2 + (L / (posts - 1)) * pl;
      B.fencePost.box(0.055, 0.03, 0.055, plx, 0.13 + H + 0.048, 0);
      B.warn.box(0.03, 0.014, 0.058, plx, 0.13 + H + 0.032, 0.002);
    }
    /* 警示标语牌：每面两块，蓝底白框，挂在面板中部 */
    [-L * 0.26, L * 0.26].forEach(function (sx2) {
      B.fenceWhite.box(0.24, 0.135, 0.012, sx2, 0.13 + H * 0.47, 0.045);
      B.fenceBlue.box(0.212, 0.108, 0.014, sx2, 0.13 + H * 0.47, 0.048);
      for (var tl = 0; tl < 3; tl++) {
        B.fenceWhite.box(0.15, 0.012, 0.016, sx2, 0.13 + H * 0.47 + (tl - 1) * 0.028, 0.052);
      }
    });

    B.concreteDark.box(L, 0.035, 0.07, 0, 0.13 + H + 0.017, 0);

    var refN = Math.floor(L / 0.18);
    for (var r = 0; r < refN; r++) {
      var rx = -L / 2 + 0.09 + r * 0.18;
      ((r % 2 === 0) ? B.warn : B.warnDark).box(0.17, 0.055, 0.014, rx, 0.185, 0.062);
    }
  }

  /* ---------- 围挡大门（双开 + 门柱 + 门楣 + 标语牌）---------- */
  function buildGate(B, L) {
    var gw = 0.66, gh = 0.8;
    [-1, 1].forEach(function (s) {
      B.fencePost.box(0.1, gh + 0.16, 0.1, s * gw / 2, (gh + 0.16) / 2, 0);
      B.fencePost.box(0.13, 0.035, 0.13, s * gw / 2, gh + 0.18, 0);
      B.concreteDark.box(0.16, 0.05, 0.16, s * gw / 2, 0.025, 0);
    });
    B.fencePost.box(gw + 0.2, 0.075, 0.09, 0, gh + 0.13, 0);
    /* 门楣标语牌：白底 + 上下蓝边 + 四段"字"块 */
    B.fenceWhite.box(gw + 0.02, 0.19, 0.02, 0, gh + 0.26, 0.02);
    B.fenceBlue.box(gw + 0.06, 0.022, 0.026, 0, gh + 0.35, 0.022);
    B.fenceBlue.box(gw + 0.06, 0.022, 0.026, 0, gh + 0.17, 0.022);
    for (var i = 0; i < 4; i++) B.fenceBlue.box(0.055, 0.09, 0.028, -0.21 + i * 0.14, gh + 0.26, 0.024);
    /* 双开门扇：整片 + 内衬 + 3 道横撑 + 斜撑 */
    [-1, 1].forEach(function (s) {
      var w = gw / 2 - 0.015;
      var cx = s * (gw / 4);
      B.fenceBlue.box(w, 0.62, 0.03, cx, 0.46, 0);
      B.fenceWhite.box(w - 0.03, 0.56, 0.012, cx, 0.46, 0.022);
      for (var k = 0; k < 3; k++) B.fenceBlue.box(w - 0.03, 0.028, 0.016, cx, 0.27 + k * 0.19, 0.03);
      B.fenceBlue.box(Math.sqrt(w * w + 0.25) * 0.92, 0.022, 0.016, cx, 0.46, 0.03,
        { rz: s * Math.atan2(0.5, w) });
    });
  }

  /* ---------- 楼体单层（柱网 + 梁 + 楼板 + 外墙窗洞 + 核心筒）---------- */
  function buildFloor(B, half, y, isTop, opt) {
    opt = opt || {};
    var tierW = opt.tierW != null ? opt.tierW : 1;
    var tierOff = opt.tierOff || 0;
    var inner = half * 0.82 * tierW;   // 原 1.06 几乎占满格子，机械无处可放；tierW 用于裙楼退台
    var slabT = 0.05;
    /* 楼板 + 边缘挑檐 */
    B.concrete.box(inner, slabT, inner, 0, y, 0);
    B.concreteDark.box(inner + 0.06, 0.018, inner + 0.06, 0, y - slabT / 2, 0);

    /* 柱网：4 角 + 4 边中 */
    var colR = inner / 2 - 0.075;
    var positions = [
      [-colR, -colR], [colR, -colR], [-colR, colR], [colR, colR],
      [0, -colR], [0, colR], [-colR, 0], [colR, 0]
    ];
    var colH = CFG.layerH - slabT;
    for (var i = 0; i < positions.length; i++) {
      var pp = positions[i];
      B.concrete.box(0.085, colH, 0.085, pp[0], y + colH / 2, pp[1]);
      B.concreteDark.box(0.1, 0.02, 0.1, pp[0], y + colH - 0.01, pp[1]);
    }

    /* 梁：四边主梁 + 一道次梁 */
    var beamY = y + colH - 0.035;
    B.concreteDark.box(inner, 0.055, 0.06, 0, beamY, -colR);
    B.concreteDark.box(inner, 0.055, 0.06, 0, beamY, colR);
    B.concreteDark.box(0.06, 0.055, inner, -colR, beamY, 0);
    B.concreteDark.box(0.06, 0.055, inner, colR, beamY, 0);
    B.concreteDark.box(inner * 0.92, 0.04, 0.045, 0, beamY, 0);

    /* 外墙：四边各开 2 个窗洞（窗间墙 + 窗台 + 过梁 + 竖梃） */
    var wallT = 0.035;
    var winW = inner * 0.26, winH = colH * 0.46;
    for (var side = 0; side < 4; side++) {
      var ang = side * PI / 2;
      var sx = Math.sin(ang) * (inner / 2);
      var sz = Math.cos(ang) * (inner / 2);
      B.concreteDark.box(inner, colH * 0.96, wallT, sx, y + colH * 0.5, sz, { ry: ang });
      for (var w = -1; w <= 1; w += 2) {
        var ox = sx + Math.cos(ang) * (winW * 0.62) * w;
        var oz = sz - Math.sin(ang) * (winW * 0.62) * w;
        B.glassDark.box(winW, winH, 0.02, ox, y + colH * 0.5, oz, { ry: ang });
        for (var mull = -1; mull <= 1; mull++) {
          B.fencePost.box(0.012, winH, 0.024,
            ox + Math.cos(ang) * (winW / 3) * mull,
            y + colH * 0.5,
            oz - Math.sin(ang) * (winW / 3) * mull, { ry: ang });
        }
        B.concrete.box(winW + 0.05, 0.022, 0.05, ox, y + colH * 0.5 - winH / 2 - 0.011, oz, { ry: ang });
        B.concrete.box(winW + 0.05, 0.026, 0.045, ox, y + colH * 0.5 + winH / 2 + 0.013, oz, { ry: ang });
      }
    }

    /* 核心筒 */
    B.concreteDark.box(inner * 0.3, colH, inner * 0.3, 0, y + colH / 2, 0);

    /* 四角竖向角柱：外凸一道，让楼层之间有"贯通骨架"的连续感 */
    var ac = inner / 2 + 0.012;
    [[ac, ac], [ac, -ac], [-ac, ac], [-ac, -ac]].forEach(function (q) {
      B.concreteDark.box(0.062, colH, 0.062, q[0], y + colH / 2, q[1]);
    });

    /* 腰线：层顶一圈外凸压顶（横向分缝，远看有楼层带） */
    var wl = inner + 0.1;
    B.concrete.box(wl, 0.026, 0.04, 0, y + colH + 0.012, -inner / 2, {});
    B.concrete.box(wl, 0.026, 0.04, 0, y + colH + 0.012, inner / 2, {});
    B.concrete.box(0.04, 0.026, wl, -inner / 2, y + colH + 0.012, 0, {});
    B.concrete.box(0.04, 0.026, wl, inner / 2, y + colH + 0.012, 0, {});

    /* 外挂管道：一根竖向落水管贴在一角，带 3 个管卡 */
    var ppx = inner / 2 + 0.035, ppz = inner / 2 - 0.05;
    B.steel.box(0.028, colH, 0.028, ppx, y + colH / 2, ppz);
    for (var pcl = 0; pcl < 3; pcl++) {
      B.concreteDark.box(0.05, 0.018, 0.05, ppx, y + colH * (0.2 + pcl * 0.3), ppz);
    }

    /* 模板支撑：混凝土外墙外侧的竖向背楞 + 两道横向围檩（在建楼的标志性构造） */
    for (var side2 = 0; side2 < 4; side2++) {
      var ang2 = side2 * PI / 2;
      var ox2 = Math.sin(ang2) * (inner / 2 + 0.028);
      var oz2 = Math.cos(ang2) * (inner / 2 + 0.028);
      var nRib = 4;
      for (var rb2 = 0; rb2 < nRib; rb2++) {
        var t2 = (rb2 / (nRib - 1) - 0.5) * inner * 0.82;
        B.plank.box(0.022, colH * 0.9, 0.022,
          ox2 + Math.cos(ang2) * t2, y + colH * 0.47, oz2 - Math.sin(ang2) * t2, { ry: ang2 });
      }
      /* 横向围檩 2 道 */
      B.plank.box(inner * 0.9, 0.024, 0.026, ox2, y + colH * 0.28, oz2, { ry: ang2 });
      B.plank.box(inner * 0.9, 0.024, 0.026, ox2, y + colH * 0.66, oz2, { ry: ang2 });
    }
    /* 若为最高层：竖起的钢筋束（伸出的预留钢筋，封顶前的典型形态） */
    if (isTop) {
      for (var sr = 0; sr < 8; sr++) {
        var sa = (sr / 8) * PI * 2;
        var srr = inner * 0.34;
        B.steelDark.box(0.009, 0.075, 0.009,
          Math.cos(sa) * srr, y + colH + 0.037, Math.sin(sa) * srr);
      }
    }

    /* 屋顶设备（仅顶层）：空调机组 + 水箱 + 电梯机房 + 女儿墙 */
    if (isTop) {
      var ry = y + colH;
      /* 女儿墙四面 */
      var pr = inner / 2 - 0.02, ph2 = 0.085;
      B.concreteDark.box(inner, ph2, 0.035, 0, ry + ph2 / 2, -pr);
      B.concreteDark.box(inner, ph2, 0.035, 0, ry + ph2 / 2, pr);
      B.concreteDark.box(0.035, ph2, inner, -pr, ry + ph2 / 2, 0);
      B.concreteDark.box(0.035, ph2, inner, pr, ry + ph2 / 2, 0);
      /* 电梯机房 */
      B.concrete.box(inner * 0.3, 0.16, inner * 0.3, 0, ry + 0.08, -inner * 0.16);
      B.concreteDark.box(inner * 0.32, 0.02, inner * 0.32, 0, ry + 0.17, -inner * 0.16);
      /* 空调机组：外壳 + 顶部格栅条 */
      for (var ac2 = 0; ac2 < 2; ac2++) {
        var ax = (ac2 ? 1 : -1) * inner * 0.24, az = inner * 0.18;
        B.steel.box(0.14, 0.09, 0.1, ax, ry + 0.045, az);
        for (var gr = 0; gr < 3; gr++) {
          B.steelDark.box(0.13, 0.008, 0.012, ax, ry + 0.095, az - 0.03 + gr * 0.03);
        }
      }
      /* 水箱：方块拼的圆罐 + 支腿 */
      var wx2 = inner * 0.22, wz2 = -inner * 0.22;
      for (var wt = 0; wt < 4; wt++) {
        B.steel.box(0.055, 0.1, 0.055, wx2 + (wt % 2 ? 0.05 : -0.05), ry + 0.05, wz2 + (wt < 2 ? 0.05 : -0.05));
      }
      B.steel.box(0.16, 0.13, 0.16, wx2, ry + 0.16, wz2);
      B.steelDark.box(0.17, 0.016, 0.17, wx2, ry + 0.228, wz2);
    }
  }

  /* ---------- 脚手架单层（立杆 + 横杆 + 斜撑 + 扣件 + 脚手板 + 安全网）---------- */
  function buildScafFloor(Bscaf, Bplank, Bnet, scafOff, layerH) {
    var postW = 0.032;
    var ps = [
      [-scafOff, -scafOff], [scafOff, -scafOff], [-scafOff, scafOff], [scafOff, scafOff],
      [0, -scafOff], [0, scafOff], [-scafOff, 0], [scafOff, 0]
    ];
    for (var i = 0; i < ps.length; i++) {
      Bscaf.box(postW, layerH, postW, ps[i][0], layerH / 2, ps[i][1]);
      Bscaf.box(postW + 0.018, 0.02, postW + 0.018, ps[i][0], layerH, ps[i][1]);
      Bscaf.box(postW + 0.018, 0.02, postW + 0.018, ps[i][0], 0, ps[i][1]);
    }
    for (var s = 0; s < 4; s++) {
      var ang = s * PI / 2;
      var sx = Math.sin(ang) * scafOff, sz = Math.cos(ang) * scafOff;
      [0.14, 0.86].forEach(function (f) {
        Bscaf.box(scafOff * 2 + 0.03, 0.026, 0.026, sx, layerH * f, sz, { ry: ang });
      });
      var diag = Math.sqrt(4 * scafOff * scafOff + Math.pow(layerH * 0.72, 2));
      Bscaf.box(diag, 0.02, 0.02, sx, layerH * 0.5, sz,
        { ry: ang, rz: (s % 2 ? 1 : -1) * Math.atan2(layerH * 0.72, scafOff * 2) });
      /* 安全网只挂到层高 55%，露出上部梁柱与窗洞，避免整栋糊成绿色 */
      Bnet.box(scafOff * 2, layerH * 0.55, 0.008, sx * 1.03, layerH * 0.30, sz * 1.03, { ry: ang });
    }
    [-1, 1].forEach(function (sd) {
      for (var k = 0; k < 3; k++) {
        Bplank.box(0.16, 0.016, scafOff * 1.7, sd * (scafOff - 0.1), 0.012, (k - 1) * 0.2);
      }
    });
  }

  /* ---------- 基坑（坑底 + 分层坑壁 + 支护桩 + 冠梁 + 排水沟 + 坡道）---------- */
  function buildPit(B, half, depth) {
    B.soilDark.box(half * 1.9, 0.06, half * 1.9, 0, -depth, 0);
    for (var s = 0; s < 4; s++) {
      var ang = s * PI / 2;
      var sx = Math.sin(ang) * (half * 0.95), sz = Math.cos(ang) * (half * 0.95);
      B.soil.box(half * 1.9, depth * 0.45, 0.06, sx, -depth * 0.78, sz, { ry: ang });
      B.soilDark.box(half * 1.9, depth * 0.55, 0.06, sx, -depth * 0.28, sz, { ry: ang });
      B.concreteDark.box(half * 1.96, 0.05, 0.1, sx, -0.025, sz, { ry: ang });
      for (var p = 0; p < 5; p++) {
        var t = (p / 4 - 0.5) * half * 1.7;
        B.concrete.box(0.055, depth * 0.5, 0.055,
          sx + Math.cos(ang) * t, -depth * 0.3, sz - Math.sin(ang) * t, { ry: ang });
      }
    }
    B.concreteDark.box(half * 1.5, 0.035, 0.05, 0, -depth + 0.05, -half * 0.72);
    for (var st = 0; st < 5; st++) {
      B.soil.box(0.34, depth / 5 + 0.012, 0.5, half * 0.62,
        -depth + (st + 0.5) * (depth / 5), half * (0.34 - st * 0.09));
    }
  }

  /* ---------- 塔吊（桁架塔身 + 回转 + 吊臂 + 配重 + 吊钩）---------- */
  function buildCrane(Bst, Bdk, H) {
    var g = new THREE.Group();
    var segH = 0.42, segs = Math.max(4, Math.round(H / segH));
    var w = 0.16;
    for (var s = 0; s < segs; s++) {
      var y0 = s * segH;
      var corners = [[-w, -w], [w, -w], [-w, w], [w, w]];
      for (var c = 0; c < 4; c++) Bst.box(0.022, segH, 0.022, corners[c][0], y0 + segH / 2, corners[c][1]);
      Bst.box(w * 2, 0.016, 0.016, 0, y0 + segH, -w);
      Bst.box(w * 2, 0.016, 0.016, 0, y0 + segH, w);
      Bst.box(0.016, 0.016, w * 2, -w, y0 + segH, 0);
      Bst.box(0.016, 0.016, w * 2, w, y0 + segH, 0);
      var dl = Math.sqrt(4 * w * w + segH * segH);
      Bst.box(dl * 0.96, 0.014, 0.014, 0, y0 + segH / 2, (s % 2 ? w : -w),
        { rz: (s % 2 ? 1 : -1) * Math.atan2(w * 2, segH) });
    }
    var topY = segs * segH;

    Bdk.box(0.34, 0.05, 0.34, 0, topY + 0.025, 0);
    Bdk.box(0.28, 0.03, 0.28, 0, topY + 0.055, 0);
    Bst.box(0.14, 0.12, 0.12, 0.16, topY + 0.12, 0);
    Bdk.box(0.15, 0.02, 0.13, 0.16, topY + 0.185, 0);

    var jibL = 0.95, jibY = topY + 0.10;
    Bst.box(0.03, 0.03, jibL, 0, jibY + 0.045, jibL / 2);
    Bst.box(0.03, 0.03, jibL, 0, jibY - 0.045, jibL / 2);
    Bst.box(0.03, 0.03, jibL, 0.05, jibY, jibL / 2);
    Bst.box(0.03, 0.03, jibL, -0.05, jibY, jibL / 2);
    for (var j = 1; j < 7; j++) {
      var jz = (jibL / 7) * j;
      Bst.box(0.012, 0.1, 0.012, 0, jibY, jz);
      Bst.box(0.06, 0.012, 0.012, 0, jibY + 0.045, jz);
    }
    var cjL = 0.42;
    Bst.box(0.035, 0.035, cjL, 0, jibY, -cjL / 2);
    Bst.box(0.035, 0.035, cjL, 0.05, jibY - 0.05, -cjL / 2);
    for (var cw = 0; cw < 3; cw++) Bdk.box(0.13, 0.075, 0.06, 0, jibY - 0.09, -cjL + 0.09 + cw * 0.08);
    Bst.box(0.03, 0.22, 0.03, 0, topY + 0.16, 0);
    Bst.box(0.012, 0.012, jibL * 0.9, 0, topY + 0.26, jibL * 0.45, { rx: 0.16 });
    Bst.box(0.012, 0.012, cjL * 0.9, 0, topY + 0.26, -cjL * 0.45, { rx: -0.36 });

    Bst.build(g);
    Bdk.build(g);

    /* 吊臂探照灯：灯体 + 浅黄光锥（低多边形锥面，模拟夜间照明） */
    var lampGroup = new THREE.Group();
    var lampMB = new Batch(mats().lamp, { cast: false, receive: false });
    lampMB.box(0.045, 0.03, 0.045, 0, 0, 0);
    lampMB.build(lampGroup);
    var coneGeo = new THREE.ConeGeometry(0.11, 0.34, 8, 1, true);
    var coneMat = new THREE.MeshBasicMaterial({
      color: 0xffe0a0, transparent: true, opacity: 0.16,
      side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending
    });
    var cone = new THREE.Mesh(coneGeo, coneMat);
    cone.position.y = -0.18;
    cone.rotation.x = Math.PI;
    lampGroup.add(cone);
    lampGroup.position.set(0, jibY - 0.02, jibL * 0.62);
    g.add(lampGroup);

    /* 吊钩（独立组，随动） */
    var hook = new THREE.Group();
    var hkB = new Batch(mats().steelDark);
    hkB.box(0.008, 0.34, 0.008, 0, -0.17, 0);
    hkB.box(0.05, 0.05, 0.03, 0, -0.36, 0);
    hkB.box(0.03, 0.03, 0.03, 0, -0.40, 0);
    hkB.build(hook);
    hook.position.set(0, jibY - 0.05, jibL * 0.78);
    g.add(hook);

    return { group: g, hook: hook, lamp: lampGroup, cone: cone, topY: topY, jibY: jibY, jibL: jibL };
  }

  /* ---------- 履带式挖掘机 v2（圆润版）----------
   * 圆润化手法：驱动轮/导向轮/液压缸/排气管全部换圆柱；
   * 驾驶室四角用椭球补圆；铲斗侧板改成圆柱过渡；履带端部加半圆滚轮。
   * 结构仍为 车体 / armPivot（绕肩）/ elbowPivot（绕肘）三级。 */
  function buildExcavator() {
    var M = mats();
    var g = new THREE.Group();

    var body = new THREE.Group();
    body.position.y = 0.19;
    var bc = {
      machYellow: new Batch(M.machYellow), steelDark: new Batch(M.steelDark),
      rubber: new Batch(M.rubber), glassDark: new Batch(M.glassDark),
      warn: new Batch(M.warn), hyd: new Batch(M.hyd)
    };

    /* ===== 履带：底板 + 履带纹 + 4 个圆滚轮（圆柱横置） ===== */
    [-1, 1].forEach(function (sd) {
      var tx = sd * 0.152;
      bc.rubber.box(0.072, 0.05, 0.34, tx, 0.032, 0);
      for (var t = 0; t < 5; t++) bc.rubber.box(0.081, 0.014, 0.032, tx, 0.06, -0.13 + t * 0.065);
      /* 驱动轮 / 导向轮 / 2 个支重轮：圆柱横放（rz=90°） */
      [0.155, 0.06, -0.06, -0.155].forEach(function (wz, wi) {
        var r = (wi === 0 || wi === 3) ? 0.032 : 0.026;
        bc.rubber.cyl(r, 0.06, tx, 0.036, wz, { rz: Math.PI / 2 });
        bc.steelDark.cyl(r * 0.5, 0.064, tx, 0.036, wz, { rz: Math.PI / 2 });
      });
      bc.steelDark.box(0.028, 0.026, 0.29, tx, 0.068, 0);
    });

    /* ===== 底盘 + 回转齿圈 ===== */
    bc.steelDark.box(0.29, 0.032, 0.25, 0, 0.082, 0);
    bc.machYellow.box(0.315, 0.068, 0.275, 0, 0.128, 0);
    bc.steelDark.cyl(0.058, 0.03, 0, 0.172, 0);                    // 回转齿圈（圆柱）

    /* ===== 上车体：机舱（带圆角）+ 配重（半圆尾）+ 格栅 ===== */
    bc.machYellow.box(0.25, 0.115, 0.21, -0.03, 0.058, 0);
    /* 机舱四角补圆（椭球） */
    [[-0.155, 0.105], [0.095, 0.105], [-0.155, -0.105], [0.095, -0.105]].forEach(function (q) {
      bc.machYellow.cyl(0.018, 0.115, -0.03 + q[0], 0.058, q[1]);
    });
    /* 尾部配重：半圆柱（用圆柱横放 + 只露半截） */
    bc.machYellow.cyl(0.062, 0.19, -0.155, 0.058, 0, { rz: Math.PI / 2 });
    bc.steelDark.cyl(0.064, 0.05, -0.155, 0.108, 0, { rz: Math.PI / 2 });
    /* 散热格栅 */
    for (var gr = 0; gr < 4; gr++) bc.steelDark.box(0.006, 0.068, 0.17, 0.072 + gr * 0.008, 0.058, 0);

    /* ===== 驾驶室：圆角箱 + 三面玻璃 + 顶盖 + 顶灯 + 排气 ===== */
    bc.machYellow.box(0.112, 0.132, 0.126, 0.052, 0.074, 0.072);
    [[0.108, 0.135], [0.108, 0.009], [-0.004, 0.135], [-0.004, 0.009]].forEach(function (q) {
      bc.machYellow.cyl(0.014, 0.132, q[0], 0.074, q[1]);
    });
    bc.glassDark.box(0.092, 0.1, 0.01, 0.052, 0.08, 0.137);
    bc.glassDark.box(0.01, 0.1, 0.096, 0.109, 0.08, 0.072);
    bc.glassDark.box(0.01, 0.086, 0.086, -0.005, 0.08, 0.072);
    bc.steelDark.box(0.12, 0.012, 0.134, 0.052, 0.145, 0.072);
    bc.warn.cyl(0.011, 0.016, 0.016, 0.158, 0.086);                // 顶灯（圆柱）
    bc.steelDark.cyl(0.009, 0.05, 0.052, 0.175, 0.048);            // 排气管（圆柱）

    Object.keys(bc).forEach(function (k) { bc[k].build(body); });
    g.add(body);

    /* ===== 大臂（绕肩）===== */
    var armPivot = new THREE.Group();
    armPivot.position.set(0.018, 0.232, 0.058);
    var ab = { machYellow: new Batch(M.machYellow), steelDark: new Batch(M.steelDark), hyd: new Batch(M.hyd) };
    /* 大臂：主段 + 折线段，圆角用椭球过渡 */
    ab.machYellow.box(0.046, 0.05, 0.185, 0, 0.018, 0.088, { rx: -0.62 });
    ab.machYellow.cyl([0.025, 0.024], 0.08, 0, 0.055, 0.135, { rx: -0.62 });
    ab.machYellow.box(0.042, 0.046, 0.145, 0, 0.112, 0.212, { rx: 0.22 });
    ab.steelDark.cyl(0.026, 0.05, 0, 0.018, 0.088, { rx: -0.62 });
    /* 液压缸：缸体（粗圆柱）+ 活塞杆（细圆柱） */
    ab.hyd.cyl(0.011, 0.115, 0.028, 0.058, 0.088, { rx: -0.55 });
    ab.hyd.cyl(0.0065, 0.095, 0.028, 0.122, 0.188, { rx: 0.2 });
    Object.keys(ab).forEach(function (k) { ab[k].build(armPivot); });

    /* ===== 小臂 + 铲斗（绕肘）===== */
    var elbowPivot = new THREE.Group();
    elbowPivot.position.set(0, 0.138, 0.232);
    var sb = { machYellow: new Batch(M.machYellow), steelDark: new Batch(M.steelDark), hyd: new Batch(M.hyd) };
    sb.machYellow.cyl([0.021, 0.021], 0.195, 0, -0.058, 0.088, { rx: 0.5 });
    sb.hyd.cyl(0.008, 0.075, 0.024, -0.02, 0.058, { rx: 0.5 });
    /* 铲斗：斗体（圆底）+ 侧板（圆柱）+ 4 斗齿 */
    sb.steelDark.box(0.104, 0.078, 0.07, 0, -0.128, 0.188);
    sb.steelDark.cyl(0.035, 0.104, 0, -0.162, 0.205, { rz: Math.PI / 2 });   // 斗底圆弧
    sb.steelDark.box(0.1, 0.018, 0.028, 0, -0.172, 0.24, { rx: 0.5 });
    for (var bt = 0; bt < 4; bt++) sb.steelDark.cyl(0.008, 0.026, -0.036 + bt * 0.024, -0.178, 0.256, { rx: 0.5 });
    sb.steelDark.cyl(0.03, 0.01, 0.052, -0.128, 0.188, { rz: Math.PI / 2 });
    sb.steelDark.cyl(0.03, 0.01, -0.052, -0.128, 0.188, { rz: Math.PI / 2 });
    Object.keys(sb).forEach(function (k) { sb[k].build(elbowPivot); });

    armPivot.add(elbowPivot);
    body.add(armPivot);
    g.add(body);

    return { group: g, body: body, armPivot: armPivot, elbowPivot: elbowPivot, batches: [bc, ab, sb] };
  }

  /* ---------- 自卸渣土车 ---------- */
  function buildDumpTruck() {
    var M = mats();
    var g = new THREE.Group();
    var tb = {
      machRed: new Batch(M.machRed), steelDark: new Batch(M.steelDark),
      rubber: new Batch(M.rubber), glassDark: new Batch(M.glassDark),
      warn: new Batch(M.warn), soil: new Batch(M.soil)
    };

    /* 车架 */
    tb.steelDark.box(0.16, 0.035, 0.62, 0, 0.075, 0);
    /* 驾驶室 + 前挡 + 双侧窗 + 车顶 + 顶灯 */
    tb.machRed.box(0.146, 0.138, 0.146, 0, 0.165, 0.22);
    [[0.072, 0.292], [0.072, 0.148], [-0.072, 0.292], [-0.072, 0.148]].forEach(function (q) {
      tb.machRed.cyl(0.016, 0.138, q[0], 0.165, q[1]);
    });
    tb.glassDark.box(0.125, 0.075, 0.012, 0, 0.185, 0.297);
    tb.glassDark.box(0.012, 0.065, 0.1, 0.077, 0.185, 0.22);
    tb.glassDark.box(0.012, 0.065, 0.1, -0.077, 0.185, 0.22);
    tb.machRed.box(0.155, 0.016, 0.16, 0, 0.243, 0.22);
    tb.warn.cyl(0.014, 0.02, 0, 0.256, 0.19);
    /* 引擎盖 + 格栅 + 双大灯 + 保险杠 */
    tb.machRed.box(0.14, 0.09, 0.1, 0, 0.135, 0.33);
    for (var cg = 0; cg < 3; cg++) tb.steelDark.box(0.12, 0.008, 0.012, 0, 0.15 + cg * 0.022, 0.382);
    tb.warn.cyl(0.015, 0.014, -0.05, 0.12, 0.383, { rx: Math.PI / 2 });
    tb.warn.cyl(0.015, 0.014, 0.05, 0.12, 0.383, { rx: Math.PI / 2 });
    tb.steelDark.box(0.155, 0.026, 0.02, 0, 0.085, 0.39);

    /* 6 轮（前 1 轴 2 轮，后 2 轴 4 轮）+ 轮毂 + 挡泥板 */
    /* 6 轮：橡胶胎用圆柱横放（rz=90°），轮毂再叠一层小圆柱，比方块轮胎真实得多 */
    [0.27, -0.13, -0.24].forEach(function (wz) {
      [-1, 1].forEach(function (sd) {
        var wx = sd * 0.092;
        tb.rubber.cyl(0.044, 0.036, wx, 0.044, wz, { rz: Math.PI / 2 });
        tb.steelDark.cyl(0.024, 0.04, wx, 0.044, wz, { rz: Math.PI / 2 });
        /* 轮辐 3 根（细圆柱横放） */
        for (var sp = 0; sp < 3; sp++) {
          tb.steelDark.box(0.042, 0.006, 0.006, wx, 0.044, wz, { rx: sp * 1.05 });
        }
      });
    });
    [-0.13, -0.24].forEach(function (wz) { tb.steelDark.box(0.2, 0.012, 0.1, 0, 0.098, wz); });

    Object.keys(tb).forEach(function (k) { tb[k].build(g); });

    /* 车厢（可后倾）：底 + 四壁 + 6 道竖肋 + 顶梁 + 车内土堆 */
    var bed = new THREE.Group();
    bed.position.set(0, 0.11, -0.1);
    var bb = { machRed: new Batch(M.machRed), steelDark: new Batch(M.steelDark), soil: new Batch(M.soil) };
    bb.machRed.box(0.19, 0.012, 0.34, 0, 0.006, 0);
    bb.machRed.box(0.19, 0.13, 0.012, 0, 0.07, -0.17);
    bb.machRed.box(0.012, 0.13, 0.34, 0.089, 0.07, 0);
    bb.machRed.box(0.012, 0.13, 0.34, -0.089, 0.07, 0);
    bb.machRed.box(0.19, 0.13, 0.012, 0, 0.07, 0.17);
    for (var rb = 0; rb < 3; rb++) {
      bb.steelDark.box(0.014, 0.13, 0.014, 0.092, 0.07, -0.11 + rb * 0.11);
      bb.steelDark.box(0.014, 0.13, 0.014, -0.092, 0.07, -0.11 + rb * 0.11);
    }
    bb.steelDark.box(0.195, 0.014, 0.35, 0, 0.137, 0);
    for (var sf = 0; sf < 5; sf++) {
      bb.soil.box(0.055 + (sf % 3) * 0.012, 0.04, 0.06,
        -0.06 + (sf % 3) * 0.06, 0.075 + (sf % 2) * 0.012, -0.1 + Math.floor(sf / 3) * 0.09);
    }
    Object.keys(bb).forEach(function (k) { bb[k].build(bed); });
    g.add(bed);

    return { group: g, bed: bed, batches: [tb, bb] };
  }

  /* ---------- 工人 v2（圆润版）----------
   * v1 全是方块：头是方盒、四肢是方条，像积木人。
   * v2 换几何：头/手/靴用球体（椭球），躯干/四肢用圆柱（14 段），安全帽用扁球 + 扁圆帽檐。
   * 关节仍拆 pivot，姿态逻辑不变。 */
  function buildWorker(pose) {
    var M = mats();
    var g = new THREE.Group();

    var B = {
      helmet: new Batch(M.helmet), skin: new Batch(M.skin),
      vest: new Batch(M.vest), cloth: new Batch(M.cloth),
      rubber: new Batch(M.rubber), steelDark: new Batch(M.steelDark)
    };

    var legH = 0.056, torsoH = 0.060, headR = 0.020;

    /* 躯干：椭圆截面圆柱（前后略扁，符合人体） */
    var ty = legH + torsoH / 2;
    B.vest.cyl([0.027, 0.017], torsoH, 0, ty, 0);
    /* 反光条：两道薄圆环（略大于躯干半径） */
    B.steelDark.cyl([0.0278, 0.0178], 0.007, 0, ty + torsoH * 0.20, 0);
    B.steelDark.cyl([0.0278, 0.0178], 0.007, 0, ty - torsoH * 0.14, 0);
    /* 腰带 */
    B.cloth.cyl([0.0275, 0.0175], 0.008, 0, legH + 0.004, 0);
    /* 肩部圆角（两颗小球，让肩线不那么直角） */
    B.vest.sph(0.0125, 0.024, legH + torsoH - 0.006, 0);
    B.vest.sph(0.0125, -0.024, legH + torsoH - 0.006, 0);

    /* 头：椭球 + 下巴收窄；安全帽：扁球 + 扁圆帽檐 + 帽脊 */
    var hy = legH + torsoH + headR + 0.002;
    B.skin.sph([0.0175, 0.0195, 0.0175], 0, hy, 0);
    B.skin.sph([0.012, 0.010, 0.012], 0, hy - 0.017, 0.002);          // 下巴
    B.helmet.sph([0.0195, 0.0135, 0.0195], 0, hy + 0.010, 0);          // 帽壳
    B.helmet.cyl([0.0225, 0.0225], 0.0035, 0, hy + 0.005, 0.008);      // 帽檐（扁圆）
    B.helmet.box(0.007, 0.005, 0.032, 0, hy + 0.018, 0);               // 帽脊

    B.helmet.build(g); B.skin.build(g); B.vest.build(g);
    B.cloth.build(g); B.rubber.build(g); B.steelDark.build(g);

    /* 手臂 pivot：肩点略向内收，圆柱肢体 + 球形手 */
    function makeArm(sd) {
      var pv = new THREE.Group();
      pv.position.set(sd * 0.026, legH + torsoH - 0.010, 0);
      var ab = { cloth: new Batch(M.cloth), skin: new Batch(M.skin), vest: new Batch(M.vest) };
      ab.vest.sph(0.0105, 0, 0, 0);                                     // 肩头球（补圆）
      ab.cloth.cyl(0.0078, 0.048, 0, -0.026, 0);                        // 上臂+前臂一体
      ab.skin.sph(0.0085, 0, -0.052, 0);                                // 手
      Object.keys(ab).forEach(function (k) { ab[k].build(pv); });
      g.add(pv);
      return pv;
    }
    var armL = makeArm(-1), armR = makeArm(1);

    /* 腿 pivot：圆柱腿 + 椭球靴 */
    function makeLeg(sd) {
      var pv = new THREE.Group();
      pv.position.set(sd * 0.013, legH, 0);
      var lb = { cloth: new Batch(M.cloth), rubber: new Batch(M.rubber) };
      lb.cloth.cyl(0.0095, legH, 0, -legH / 2, 0);
      lb.rubber.sph([0.0115, 0.0075, 0.017], 0, -legH + 0.007, 0.004); // 靴
      Object.keys(lb).forEach(function (k) { lb[k].build(pv); });
      g.add(pv);
      return pv;
    }
    var legL = makeLeg(-1), legR = makeLeg(1);

    /* 姿态（与 v1 一致，只是几何圆润了） */
    var P = {
      bind:   { armL: -1.1, armR: -1.1, legBend: 0.9, crouch: -0.055 },
      carry:  { armL: -1.5, armR: -1.5, legBend: 0, crouch: 0 },
      signal: { armL: 0.2, armR: -2.6, legBend: 0, crouch: 0 },
      work:   { armL: -0.8, armR: -1.2, legBend: 0.3, crouch: -0.02 },
      patrol: { armL: 0.3, armR: -0.3, legBend: 0, crouch: 0 }
    }[pose] || { armL: 0, armR: 0, legBend: 0, crouch: 0 };

    armL.rotation.x = P.armL;
    armR.rotation.x = P.armR;
    g.position.y = P.crouch;
    g.userData.pose = pose || 'patrol';
    g.userData.baseY = P.crouch;
    g.userData.legBend = P.legBend;

    return { group: g, armL: armL, armR: armR, legL: legL, legR: legR, H: legH + torsoH + headR * 2 };
  }

  /* ---------- 尘土粒子（Points + 自定义 shader，1 drawCall）---------- */
  function buildDust(count, spread, height) {
    var geo = new THREE.BufferGeometry();
    var pos = new Float32Array(count * 3);
    var phase = new Float32Array(count);
    var size = new Float32Array(count);
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2;
      var r = Math.sqrt(Math.random()) * spread;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.random() * height * 0.2;
      pos[i * 3 + 2] = Math.sin(a) * r;
      phase[i] = Math.random();
      size[i] = 0.6 + Math.random() * 1.4;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));

    var mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uHeight: { value: height },
        uColor: { value: new THREE.Color('#b9a389') },
        uOpacity: { value: 0.5 }
      },
      vertexShader: [
        'attribute float aPhase;',
        'attribute float aSize;',
        'uniform float uTime;',
        'uniform float uHeight;',
        'varying float vAlpha;',
        'void main() {',
        '  vec3 p = position;',
        '  float t = fract(uTime * 0.18 + aPhase);',
        '  p.y += t * uHeight;',
        '  p.x += sin(uTime * 0.8 + aPhase * 12.0) * 0.05 * t;',
        '  p.z += cos(uTime * 0.7 + aPhase * 9.0) * 0.05 * t;',
        '  vAlpha = (1.0 - t) * smoothstep(0.0, 0.12, t);',
        '  vec4 mv = modelViewMatrix * vec4(p, 1.0);',
        '  gl_PointSize = aSize * 38.0 / max(0.15, -mv.z);',
        '  gl_Position = projectionMatrix * mv;',
        '}'
      ].join('\n'),
      fragmentShader: [
        'uniform vec3 uColor;',
        'uniform float uOpacity;',
        'varying float vAlpha;',
        'void main() {',
        '  vec2 d = gl_PointCoord - vec2(0.5);',
        '  float m = 1.0 - smoothstep(0.25, 0.5, length(d));',
        '  if (m <= 0.01) discard;',
        '  gl_FragColor = vec4(uColor, m * vAlpha * uOpacity);',
        '}'
      ].join('\n'),
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });

    var pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    return { points: pts, mat: mat, geo: geo };
  }

  /* =====================================================================================
   * 动画实例
   * ==================================================================================== */
  function createInstance(opts) {
    var M = mats();
    var half = CFG.lotHalf;
    var targetH = opts.targetHeight || 3.0;
    var layers = Math.max(4, Math.round(targetH / CFG.layerH));

    var root = new THREE.Group();
    root.position.set(opts.x, opts.y || 0, opts.z);
    root.rotation.y = opts.rot || 0;

    /* ---- 地面（含碎砖土堆） ---- */
    var groundB = new Batch(M.soil, { cast: false });
    groundB.box(half * 2, 0.1, half * 2, 0, -0.05, 0);
    for (var d = 0; d < 9; d++) {
      var ang0 = d * 0.7, rad = half * (0.72 + (d % 3) * 0.09);
      groundB.box(0.07 + (d % 3) * 0.02, 0.05 + (d % 2) * 0.02, 0.06,
        Math.sin(ang0) * rad, 0.02, Math.cos(ang0) * rad, { ry: ang0 });
    }
    var groundMesh = groundB.build(root);

    /* ---- 基坑（四种材质，各自成批） ---- */
    var pitG = new THREE.Group();
    var pitB = {
      soil: new Batch(M.soil, { cast: false }),
      soilDark: new Batch(M.soilDark, { cast: false }),
      concrete: new Batch(M.concrete),
      concreteDark: new Batch(M.concreteDark)
    };
    buildPit(pitB, half, CFG.pitDepth);
    Object.keys(pitB).forEach(function (k) { pitB[k].build(pitG); });
    pitG.visible = false;
    root.add(pitG);
    var pitMesh = pitG;

    /* ---- 围挡四面 ---- */
    var fenceSideLen = half * 2 - 0.02;
    var fenceGroups = [];
    for (var fs = 0; fs < 4; fs++) {
      var fg = new THREE.Group();
      var fB = {
        concrete: new Batch(M.concrete), concreteDark: new Batch(M.concreteDark),
        fenceBlue: new Batch(M.fenceBlue), fenceWhite: new Batch(M.fenceWhite),
        fencePost: new Batch(M.fencePost), warn: new Batch(M.warn), warnDark: new Batch(M.warnDark)
      };
      buildFenceSide(fenceSideLen, CFG.fenceH, fB);
      if (fs === 0) buildGate(fB, fenceSideLen);
      /* 关键：四面围挡要在原点沿 ±X 建，再**平移到各自边缘**，否则四面叠在中心成十字。
       * 用内层 Group 承担"推到边缘"，外层 Group 只负责升起位移，互不干扰。 */
      var inner = new THREE.Group();
      Object.keys(fB).forEach(function (k) { fB[k].build(inner); });
      inner.position.z = half - 0.012;
      fg.add(inner);
      fg.position.set(0, -CFG.fenceH * 1.6, 0);
      fg.rotation.y = fs * PI / 2;
      fg.visible = false;
      root.add(fg);
      fenceGroups.push({ g: fg, b: fB });
    }

    /* ---- 楼体逐层 ---- */
    var floorGroups = [];
    for (var li = 0; li < layers; li++) {
      var lg = new THREE.Group();
      var lB = {
        concrete: new Batch(M.concrete), concreteDark: new Batch(M.concreteDark),
        glassDark: new Batch(M.glassDark), fencePost: new Batch(M.fencePost),
        steel: new Batch(M.steel), steelDark: new Batch(M.steelDark),
        plank: new Batch(M.plank)
      };
      /* 裙楼退台：低 3 层为裙楼（宽），上部塔楼收窄到 76%，制造体量层次 */
      var isPodium = li < Math.min(3, layers - 3);
      buildFloor(lB, half, 0, li === layers - 1, { tierW: isPodium ? 1.0 : 0.76 });
      Object.keys(lB).forEach(function (k) { lB[k].build(lg); });
      lg.position.y = li * CFG.layerH;
      lg.scale.y = 0.001;
      lg.visible = false;
      root.add(lg);
      floorGroups.push({ g: lg, b: lB });
    }

    /* ---- 脚手架逐层 ---- */
    var scafGroups = [];
    var scafOff = half * 0.82 / 2 + 0.13;
    for (var si = 0; si < layers; si++) {
      var sg = new THREE.Group();
      var sB = {
        scaffold: new Batch(M.scaffold, { cast: false }),
        plank: new Batch(M.plank, { cast: false }),
        net: new Batch(M.net, { cast: false, receive: false })
      };
      buildScafFloor(sB.scaffold, sB.plank, sB.net, scafOff, CFG.layerH);
      Object.keys(sB).forEach(function (k) { sB[k].build(sg); });
      sg.position.y = si * CFG.layerH;
      sg.visible = false;
      root.add(sg);
      scafGroups.push({ g: sg, b: sB });
    }

    /* ---- 塔吊 ---- */
    var crane = buildCrane(new Batch(M.steel), new Batch(M.steelDark), CFG.craneH);
    crane.group.position.set(-half * 0.82, 0, -half * 0.82);
    crane.group.scale.y = 0.001;
    crane.group.visible = false;
    root.add(crane.group);

    /* ---- 尘土：挖掘点 / 卸料点 / 场地弥漫，各 1 个 Points ---- */
    var dusts = [];
    function addDust(x, z, cnt, spread, hgt) {
      var d = buildDust(cnt, spread, hgt);
      d.points.position.set(x, 0.02, z);
      d.points.visible = false;
      root.add(d.points);
      dusts.push(d);
    }
    addDust(half * 0.55, half * 0.40, 46, 0.28, 0.62);    // 挖机作业扬尘
    addDust(-half * 0.60, half * 0.34, 34, 0.22, 0.5);    // 渣土车卸料
    addDust(0, 0, 40, half * 0.85, 0.85);                 // 场地低空浮尘

    /* ---- 警示灯 ---- */
    var lampB = new Batch(M.lamp, { cast: false, receive: false });
    /* 警示灯在四角（原来是四边中点，会落在门楣正上方） */
    var lc = half - 0.05;
    [[lc, lc], [lc, -lc], [-lc, lc], [-lc, -lc]].forEach(function (q) {
      lampB.box(0.045, 0.045, 0.045, q[0], 0.13 + CFG.fenceH + 0.055, q[1]);
    });
    var lampMesh = lampB.build(root);
    if (lampMesh) lampMesh.visible = false;

    return {
      root: root, opts: opts || {}, t: 0, dur: CFG.duration,
      layers: layers, targetH: layers * CFG.layerH, done: false,
      h: {
        layers: layers,
        groundMesh: groundMesh, pitMesh: pitMesh,
        fenceGroups: fenceGroups, floorGroups: floorGroups, scafGroups: scafGroups,
        crane: crane, lampMesh: lampMesh, dusts: dusts,
        batches: { ground: groundB, pit: pitB, lamp: lampB }
      }
    };
  }

  /* =====================================================================================
   * 逐帧
   * ==================================================================================== */
  var worldT = 0;

  function tickInstance(inst, dt) {
    inst.t += dt;
    var p = clamp01(inst.t / inst.dur);
    var h = inst.h;

    /* 围挡四面依次升起 */
    if (p >= T.fenceStart) {
      var fp = clamp01((p - T.fenceStart) / T.fenceSpan);
      for (var i = 0; i < 4; i++) {
        var fg = h.fenceGroups[i];
        var local = clamp01((fp - i * 0.11) / 0.62);
        if (local > 0) {
          if (!fg.g.visible) fg.g.visible = true;
          fg.g.position.y = -CFG.fenceH * 1.6 * (1 - easyOut(local));
        }
      }
    }

    /* 基坑下陷 */
    var pitP = clamp01((p - T.pitStart) / (T.pitEnd - T.pitStart));
    if (pitP > 0) {
      var pe = easyInOut(pitP);
      if (h.groundMesh) h.groundMesh.position.y = -CFG.pitDepth * pe;
      if (h.pitMesh) {
        if (!h.pitMesh.visible && pe > 0.04) h.pitMesh.visible = true;
        h.pitMesh.position.y = -CFG.pitDepth * pe * 0.12;
      }
    }

    /* 塔吊升起 */
    var crP = clamp01((p - T.craneStart) / T.craneRise);
    if (crP > 0 && h.crane) {
      if (!h.crane.group.visible) h.crane.group.visible = true;
      h.crane.group.scale.y = Math.max(0.001, easyOut(crP));
    }

    /* 楼体逐层生长 */
    if (p >= T.bodyStart) {
      var bp = clamp01((p - T.bodyStart) / (T.bodyEnd - T.bodyStart));
      var total = h.layers * bp;
      for (var li = 0; li < h.layers; li++) {
        var fgr = h.floorGroups[li];
        var grow = clamp01(total - li);
        if (grow > 0.001) {
          if (!fgr.g.visible) fgr.g.visible = true;
          fgr.g.scale.y = Math.max(0.001, easyOut(grow));
          fgr.g.position.y = li * CFG.layerH;
        }
      }
    }

    /* 脚手架：层数跟随楼体，末段自下而上拆 */
    if (p >= T.scafStart) {
      var scafTop = h.layers * clamp01((p - T.scafStart) / T.scafRise);
      var downP = clamp01((p - T.scafDownStart) / (T.scafDownEnd - T.scafDownStart));
      var scafFloor = downP * h.layers;
      for (var si = 0; si < h.layers; si++) {
        var on = (si < scafTop - 0.02) && (si >= scafFloor - 0.02);
        if (h.scafGroups[si].g.visible !== on) h.scafGroups[si].g.visible = on;
      }
    }

    /* 塔吊回转 + 吊钩升降 */
    if (h.crane && h.crane.group.visible) {
      h.crane.group.rotation.y = Math.sin(clamp01((p - T.craneStart) / 0.62) * PI * 1.6) * 0.95;
      var hkP = clamp01((p - T.hookStart) / (T.hookEnd - T.hookStart));
      h.crane.hook.position.y = h.crane.jibY - 0.05 - Math.sin(hkP * PI) * 0.78;
    }

    /* 尘土：作业段最浓，收尾渐淡 */
    if (h.dusts) {
      var dustOn = p > 0.18 && p < 0.94;
      var dustAmt = dustOn ? (0.55 + 0.45 * Math.sin(worldT * 1.6)) : 0;
      for (var di = 0; di < h.dusts.length; di++) {
        var dd = h.dusts[di];
        if (dd.points.visible !== dustOn) dd.points.visible = dustOn;
        if (dustOn) {
          dd.mat.uniforms.uTime.value = worldT;
          dd.mat.uniforms.uOpacity.value = 0.34 + dustAmt * 0.30;
        }
      }
    }

    /* 警示灯闪烁 */
    if (h.lampMesh) {
      var lampOn = p >= T.fenceStart + T.fenceSpan * 0.6 && p < T.scafDownEnd;
      if (h.lampMesh.visible !== lampOn) h.lampMesh.visible = lampOn;
      if (lampOn) h.lampMesh.material.emissiveIntensity = 0.6 + (0.5 + 0.5 * Math.sin(worldT * 8)) * 1.9;
    }

    if (p >= 1) inst.done = true;
  }

  /* =====================================================================================
   * 调度
   * ==================================================================================== */
  var live = [], queue = [], sceneRef = null, enabled = true;

  function disposeInstance(inst) {
    if (!inst) return;
    if (inst.root.parent) inst.root.parent.remove(inst.root);
    inst.root.traverse(function (o) { if (o.isInstancedMesh) { try { o.dispose(); } catch (e) { /* ignore */ } } });
    var arrs = inst.h.fenceGroups.concat(inst.h.floorGroups, inst.h.scafGroups);
    arrs.forEach(function (x) { Object.keys(x.b).forEach(function (k) { if (x.b[k] && x.b[k].dispose) x.b[k].dispose(); }); });
    var bb = inst.h.batches;
    Object.keys(bb).forEach(function (k) {
      var v = bb[k];
      if (!v) return;
      if (typeof v.dispose === 'function') v.dispose();
      else Object.keys(v).forEach(function (kk) { if (v[kk] && v[kk].dispose) v[kk].dispose(); });
    });
  }

  function attach(inst) {
    if (!sceneRef) return;
    sceneRef.add(inst.root);
    live.push(inst);
    if (inst.opts.onStart) { try { inst.opts.onStart(); } catch (e) { /* ignore */ } }
  }

  function play(opts) {
    if (!enabled || !sceneRef) return null;
    opts = opts || {};
    for (var i = live.length - 1; i >= 0; i--) {
      if (live[i].opts.tileIdx === opts.tileIdx) { disposeInstance(live[i]); live.splice(i, 1); }
    }
    var inst = createInstance(opts);
    inst.opts = opts;
    if (live.length >= CFG.maxConcurrent) { queue.push(inst); return inst; }
    attach(inst);
    return inst;
  }

  function tick(dt) {
    if (!enabled) return;
    worldT += dt;
    for (var i = live.length - 1; i >= 0; i--) {
      var inst = live[i];
      try { tickInstance(inst, dt); }
      catch (e) {
        inst.done = true;
        try { window.__errs && window.__errs.push('buildAnim tick: ' + (e && e.message)); } catch (_) { }
        try { console.warn('[buildAnim3d] tick 异常，动画已终止', e); } catch (_) { }
      }
      if (inst.done) {
        if (inst.opts.onDone) { try { inst.opts.onDone(); } catch (e) { /* ignore */ } }
        disposeInstance(inst);
        live.splice(i, 1);
        if (queue.length) attach(queue.shift());
      }
    }
  }

  function cancelAll() {
    live.forEach(disposeInstance); queue.forEach(disposeInstance);
    live.length = 0; queue.length = 0;
  }
  function stats() { return { live: live.length, queued: queue.length, enabled: enabled }; }
  function setScene(s) { sceneRef = s; }
  function setEnabled(v) { enabled = !!v; if (!enabled) cancelAll(); }
  function isEnabled() { return enabled; }

  window.BuildAnim3D = {
    play: play, tick: tick, cancelAll: cancelAll,
    setScene: setScene, setEnabled: setEnabled, isEnabled: isEnabled,
    stats: stats, CFG: CFG
  };

  try {
    if (new URLSearchParams(location.search).get('anim') === '0') enabled = false;
  } catch (e) { /* ignore */ }
})();
