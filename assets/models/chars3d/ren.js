/* 丧彪 ren — img2threejs 精细重建（chars3d 契约版）
 * 参考：refs/char_ren.png（三视图，519px 身高锚定 → 模型 H 1.72）
 * 契约：view3d.js animToken 驱动 parts 六关节（位置精确）；
 *       正面朝 +z；MeshStandardMaterial + convertSRGBToLinear（同 buildings3d std()）；
 *       纹理零依赖（纯几何 + 平色板，参考图为无纹理平涂风格）。
 * 身高：兜帽尖 1.72 → 鞋底 0.0（外部 ×1.08 缩放）。
 */
(function () {
  'use strict';

  window.Char3D = window.Char3D || {};
  window.Char3D.ren = function () {

    /* ---------------- 基础工具（对齐 buildings3d.js 做法） ---------------- */
    function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
    function std(hex, o) {
      o = o || {};
      var m = new THREE.MeshStandardMaterial({
        color: C(hex),
        roughness: o.rough !== undefined ? o.rough : 0.85,
        metalness: o.metal || 0,
        side: o.side || THREE.FrontSide
      });
      if (o.emissive) {
        m.emissive = C(o.emissive);
        m.emissiveIntensity = o.ei !== undefined ? o.ei : 1;
      }
      return m;
    }
    function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
    function put(parent, o, x, y, z) { o.position.set(x || 0, y || 0, z || 0); parent.add(o); return o; }
    function grp(parent, x, y, z) { var g = new THREE.Group(); if (parent) put(parent, g, x, y, z); return g; }

    /* ---------------- 材质表（取色均来自参考图像素测量） ---------------- */
    var M = {
      cloth:  std('#46536f', { rough: 0.88, side: THREE.DoubleSide }),  // 兜帽+斗篷 主 slate-navy
      clothD: std('#38425a', { rough: 0.90, side: THREE.DoubleSide }),  // 下摆碎裂/背层
      hoodIn: std('#131a24', { rough: 0.95 }),                          // 兜帽内阴影
      skin:   std('#7aa86a', { rough: 0.70 }),                          // 绿皮肤（脸/手/脚）
      eye:    std('#6ff7e8', { rough: 0.30, emissive: '#6ff7e8', ei: 1.3 }), // 无瞳发光眼
      dark:   std('#16211b', { rough: 0.80 }),                          // 眼窝/嘴缝/破洞
      bone:   std('#ddd2ba', { rough: 0.60 }),                          // 骷髅扣
      rope:   std('#7d4a50', { rough: 0.90 }),                          // 绳腰带
      tunic:  std('#5c4a50', { rough: 0.92, side: THREE.DoubleSide }),  // 内衬衣
      ribbon: std('#4a5a74', { rough: 0.85 }),                          // 扣坠丝带
      legDark: std('#2c2830', { rough: 0.92 })                          // 斗篷下的腿（几乎不可见）
    };

    var g = grp();
    g.name = 'ren';

    /* ======================================================================
     *  HEAD 关节 @(0,1.1,0) —— 颅骨 + 脸 + 兜帽（兜帽随头转动）
     * ====================================================================== */
    var head = grp(g, 0, 1.1, 0);
    head.name = 'head';

    /* 颅骨：竖长椭球（chibi 大头，脸从兜帽窗口露出） */
    var skull = mesh(new THREE.SphereGeometry(0.26, 16, 12), M.skin);
    skull.position.set(0, 0.20, 0.02);        // abs y 1.30
    skull.scale.set(1.0, 1.22, 0.94);
    head.add(skull);

    /* 脸面辅助：颅骨椭球表面 z（head 关节坐标，用于嘴缝贴面） */
    function skullZ(x, y) {
      var dx = x / 0.26, dy = (0.20 - y) / (0.26 * 1.22);
      var t = 1 - dx * dx - dy * dy;
      return t <= 0 ? null : 0.02 + 0.244 * Math.sqrt(t);
    }

    /* 眼窝背板 + 发光眼（无瞳，d0.124，中心 ±0.141，abs y 1.16） */
    var eyeGeo = new THREE.SphereGeometry(0.062, 12, 10);
    var backGeo = new THREE.SphereGeometry(0.075, 12, 8);
    [-1, 1].forEach(function (s) {
      var back = mesh(backGeo, M.dark);
      back.position.set(0.141 * s, 0.058, 0.168);
      back.scale.set(1, 1, 0.42);
      head.add(back);
      var eye = mesh(eyeGeo, M.eye);
      eye.position.set(0.141 * s, 0.06, 0.208);
      eye.scale.set(1, 1, 0.62);
      head.add(eye);
    });

    /* 缝合嘴：横缝 5 段贴面 + 5 根竖缝线（identity 特征） */
    var seamGeo = new THREE.BoxGeometry(0.056, 0.016, 0.012);
    var stitchGeo = new THREE.BoxGeometry(0.013, 0.056, 0.012);
    for (var mi = -2; mi <= 2; mi++) {
      var mx = mi * 0.043;
      var my = -0.085;                          // abs 1.015
      var mz = skullZ(mx, my);
      if (mz === null) mz = 0.1;
      var seg = mesh(seamGeo, M.dark);
      seg.position.set(mx, my, mz - 0.001);
      seg.rotation.z = mx * 0.6;                // 微随面弯
      head.add(seg);
      var st = mesh(stitchGeo, M.dark);
      st.position.set(mx, my, Math.min(mz + 0.016, mz - 0.001 + 0.02));
      head.add(st);
    }

    /* ---------------- 兜帽（随头转）：冠顶帽 + 开窗裙环 + 面框 + 侧垂片 + 尖 ---------------- */
    var hood = grp(head, 0, 0, 0);
    hood.name = 'hood';

    /* 冠顶：球壳帽，覆盖头顶到眉线（abs 1.32） */
    var crown = mesh(new THREE.SphereGeometry(0.39, 18, 10, 0, Math.PI * 2, 0, 1.52), M.cloth);
    put(hood, crown, 0, 0.20, 0.0);           // 球心 abs 1.30
    crown.scale.set(1.0, 1.0, 0.94);

    /* 下段裙环：lathe 带前开口（phi 缺口朝 +z），从眉线收到肩（关节局部 y） */
    var hoodProf = [
      new THREE.Vector2(0.389, 0.22),
      new THREE.Vector2(0.398, 0.12),
      new THREE.Vector2(0.406, 0.02),
      new THREE.Vector2(0.409, -0.015),
      new THREE.Vector2(0.392, -0.10),
      new THREE.Vector2(0.342, -0.15)
    ];
    var band = mesh(new THREE.LatheGeometry(hoodProf, 20, 0.52, Math.PI * 2 - 1.04), M.cloth);
    band.position.set(0, 0, 0.005);
    band.scale.set(1, 1, 0.94);
    hood.add(band);

    /* 面框：环绕脸窗口的弧形 torus（缺口朝下） */
    var rim = mesh(new THREE.TorusGeometry(0.30, 0.042, 10, 26, 4.9), M.cloth);
    put(hood, rim, 0, 0.13, 0.145);
    rim.rotation.z = -0.88;
    rim.scale.set(1, 1.08, 1);

    /* 兜帽内阴影球：脸后的暗腔读数（后移+收窄避免盖住下巴/嘴） */
    var inner = mesh(new THREE.SphereGeometry(0.30, 14, 10), M.hoodIn);
    put(hood, inner, 0, 0.13, -0.06);
    inner.scale.set(0.92, 1.02, 0.75);

    /* 侧垂片：两片布檐压到肩 */
    var flapGeo = new THREE.ConeGeometry(0.09, 0.26, 8);
    [-1, 1].forEach(function (s) {
      var flap = mesh(flapGeo, M.cloth);
      flap.position.set(0.315 * s, -0.09, 0.02);
      flap.rotation.z = -0.42 * s;
      hood.add(flap);
    });

    /* 兜帽尖：向后上卷（apex abs (0, 1.72, -0.19)，全模最高点） */
    var tip = grp(hood, 0, 0, 0);
    tip.name = 'hoodTip';
    var tipSpGeo = [new THREE.SphereGeometry(0.092, 10, 8), new THREE.SphereGeometry(0.068, 10, 8), new THREE.SphereGeometry(0.048, 10, 8)];
    [[0, 0.50, -0.045], [0, 0.545, -0.085], [0, 0.575, -0.125]].forEach(function (p, i) {
      var s = mesh(tipSpGeo[i], M.cloth);
      put(tip, s, p[0], p[1], p[2]);
    });
    var tipCone = mesh(new THREE.ConeGeometry(0.035, 0.11, 8), M.cloth);
    put(tip, tipCone, 0, 0.578, -0.152);
    tipCone.rotation.x = -0.7;                 // 尖朝后上（apex≈abs1.72）

    /* 兜帽背脊：竖向折缝（背面钻石折痕读数） */
    var ridge = mesh(new THREE.SphereGeometry(0.5, 10, 8), M.clothD);
    put(hood, ridge, 0, 0.36, -0.345);
    ridge.scale.set(0.09, 0.5, 0.06);
    ridge.rotation.x = 0.1;

    /* ======================================================================
     *  TORSO 关节 @(0,0.52,0) —— 内衬 + 斗篷（主体积） + 腰带 + 骷髅扣
     * ====================================================================== */
    var torso = grp(g, 0, 0.52, 0);
    torso.name = 'torso';

    /* 内衬胸 */
    var chest = mesh(new THREE.CapsuleGeometry(0.205, 0.16, 4, 12), M.tunic);
    chest.position.set(0, 0.28, 0.01);        // abs 0.80
    chest.scale.set(1, 1, 0.85);
    torso.add(chest);

    /* 内衬裙（开锥，透过斗篷前缝可见；下摆盖住暗腿） */
    var skirt = mesh(new THREE.CylinderGeometry(0.225, 0.34, 0.56, 14, 1, true), M.tunic);
    skirt.position.set(0, 0.16, 0.01);        // abs 0.40-0.96
    skirt.scale.set(1, 1, 0.85);
    torso.add(skirt);

    /* 斗篷肩轭：压扁椭球，肩头圆润 */
    var yoke = mesh(new THREE.SphereGeometry(0.335, 16, 10), M.cloth);
    yoke.position.set(0, 0.44, 0.005);        // abs 0.96
    yoke.scale.set(1.05, 0.5, 0.9);
    torso.add(yoke);

    /* 斗篷主体：lathe 开壳 + 前缝（phi 缺口朝 +z 约 52°） */
    var cloakProf = [
      new THREE.Vector2(0.315, 0.47),
      new THREE.Vector2(0.335, 0.42),
      new THREE.Vector2(0.30, 0.38),
      new THREE.Vector2(0.29, 0.20),
      new THREE.Vector2(0.33, 0.10),
      new THREE.Vector2(0.43, -0.02),
      new THREE.Vector2(0.468, -0.18),
      new THREE.Vector2(0.45, -0.26),
      new THREE.Vector2(0.43, -0.32)
    ];
    var cloak = mesh(new THREE.LatheGeometry(cloakProf, 24, 0.37, Math.PI * 2 - 0.74), M.cloth);
    cloak.position.set(0, 0, 0.005);
    cloak.scale.set(1, 1, 0.80);
    torso.add(cloak);

    /* 背面褶皱：三条竖向浅折痕（参考图背面布褶读数） */
    var foldGeo = new THREE.SphereGeometry(1, 8, 6);
    [Math.PI - 0.35, Math.PI, Math.PI + 0.35].forEach(function (phi) {
      var fold = mesh(foldGeo, M.clothD);
      fold.position.set(Math.sin(phi) * 0.435, -0.07, Math.cos(phi) * 0.435 * 0.8 + 0.005);
      fold.rotation.y = phi;
      fold.scale.set(0.026, 0.30, 0.012);
      torso.add(fold);
    });

    /* 碎裂下摆：一圈交替长短的 V 形挂点（自定义扇面，abs 0.13-0.21） */
    var hem = grp(torso, 0, 0, 0);
    hem.name = 'hem';
    (function () {
      var N = 16, rTop = 0.428, zScale = 0.80;
      var pos = [], idx = [];
      for (var i = 0; i < N; i++) {
        var a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
        var am = (a0 + a1) / 2;
        var len = (i % 2 === 0 ? 0.075 : 0.045) + (i % 3 === 0 ? 0.012 : 0);
        var yBot = -0.32 - len;               // torso 关节内：abs 0.20-len
        // 顶点：top0, top1（微入斗篷内），bottom（中点下垂尖）
        pos.push(Math.sin(a0) * rTop, -0.315, Math.cos(a0) * rTop * zScale + 0.005);
        pos.push(Math.sin(a1) * rTop, -0.315, Math.cos(a1) * rTop * zScale + 0.005);
        pos.push(Math.sin(am) * (rTop - 0.012), yBot, Math.cos(am) * (rTop - 0.012) * zScale + 0.005);
        var b = i * 3;
        idx.push(b, b + 1, b + 2);
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      geo.setIndex(idx);
      geo.computeVertexNormals();
      var fan = mesh(geo, M.clothD);
      fan.castShadow = true;
      hem.add(fan);
    })();

    /* 斗篷破洞：3 个近黑小椭圆贴面（前左下） */
    var holeGeo = new THREE.SphereGeometry(1, 8, 6);
    [[-2.25, 0.40, 0.026], [-2.6, 0.35, 0.02], [-1.95, 0.30, 0.017]].forEach(function (h) {
      var phi = h[0], yy = h[1], rr = h[2];
      // 半径取斗篷该高度 profile 近似值
      var bodyR = yy > 0.34 ? 0.44 : (yy > 0.30 ? 0.455 : 0.45);
      var hole = mesh(holeGeo, M.dark);
      hole.position.set(Math.sin(phi) * bodyR, yy - 0.52, Math.cos(phi) * bodyR * 0.8 + 0.005);
      hole.scale.set(rr, rr * 0.75, rr * 0.5);
      hole.rotation.y = phi;
      torso.add(hole);
    });

    /* 绳腰带：环 + 结 + 两根垂端（abs 0.44） */
    var belt = mesh(new THREE.TorusGeometry(0.245, 0.028, 10, 22), M.rope);
    belt.position.set(0, -0.08, 0.012);       // abs 0.44
    belt.rotation.x = Math.PI / 2;
    belt.scale.set(1, 0.92, 1);
    torso.add(belt);
    var knotA = mesh(new THREE.SphereGeometry(0.032, 8, 6), M.rope);
    put(torso, knotA, 0.045, -0.078, 0.222);
    knotA.scale.set(1.25, 0.9, 0.8);
    var knotB = mesh(new THREE.SphereGeometry(0.026, 8, 6), M.rope);
    put(torso, knotB, 0.095, -0.085, 0.205);
    var endGeo = new THREE.BoxGeometry(0.03, 0.14, 0.018);
    var endA = mesh(endGeo, M.rope);
    put(torso, endA, 0.03, -0.145, 0.223);
    endA.rotation.z = 0.1;
    var endB = mesh(endGeo, M.rope);
    put(torso, endB, 0.082, -0.15, 0.212);
    endB.rotation.z = -0.14;

    /* 骷髅扣：小颅骨 + 眼点 + 颌 + 双丝带（abs 0.83） */
    var clasp = grp(torso, 0, 0.31, 0.245);
    clasp.name = 'clasp';
    var cHead = mesh(new THREE.SphereGeometry(0.052, 12, 9), M.bone);
    cHead.scale.set(1, 0.92, 0.85);
    clasp.add(cHead);
    var cJaw = mesh(new THREE.BoxGeometry(0.07, 0.028, 0.05), M.bone);
    put(clasp, cJaw, 0, -0.052, 0.004);
    var dotGeo = new THREE.SphereGeometry(0.011, 6, 5);
    [-1, 1].forEach(function (s) {
      var dot = mesh(dotGeo, M.dark);
      put(clasp, dot, 0.02 * s, 0.008, 0.044);
    });
    var ribGeo = new THREE.BoxGeometry(0.035, 0.13, 0.012);
    var ribbons = [];
    [-1, 1].forEach(function (s) {
      var rib = mesh(ribGeo, M.ribbon);
      rib.position.set(0.028 * s, -0.088, -0.006);
      rib.rotation.z = -0.09 * s;
      clasp.add(rib);
      ribbons.push(rib);
    });

    /* ======================================================================
     *  ARM 关节 @(±0.32,1.0,0) —— 袖（藏）+ 垂袖口 + 绿手 + 三指
     * ====================================================================== */
    function arm(side) {                       // side: +1 左 / -1 右
      var a = grp(g, 0.32 * side, 1.0, 0);
      a.name = side > 0 ? 'armL' : 'armR';
      var sleeve = mesh(new THREE.CapsuleGeometry(0.075, 0.14, 4, 10), M.cloth);
      sleeve.position.set(0.01 * side, -0.15, 0);
      a.add(sleeve);
      var cuff = mesh(new THREE.CylinderGeometry(0.085, 0.105, 0.17, 12, 1, true), M.cloth);
      cuff.position.set(0.04 * side, -0.36, 0);
      a.add(cuff);
      var hand = mesh(new THREE.SphereGeometry(0.072, 12, 9), M.skin);
      hand.position.set(0.055 * side, -0.52, -0.015);
      hand.scale.set(0.95, 1.08, 0.9);
      a.add(hand);
      var fGeo = new THREE.CapsuleGeometry(0.02, 0.05, 3, 8);
      for (var i = -1; i <= 1; i++) {
        var f = mesh(fGeo, M.skin);
        f.position.set((0.055 + i * 0.031) * side, -0.585, -0.012);
        f.rotation.z = i * 0.12;
        a.add(f);
      }
      return a;
    }
    var armL = arm(1), armR = arm(-1);

    /* ======================================================================
     *  LEG 关节 @(±0.14,0.5,0) —— 暗腿（藏于斗篷）+ 三趾绿足（趾底 = -0.5）
     * ====================================================================== */
    function leg(side) {
      var l = grp(g, 0.14 * side, 0.5, 0);
      l.name = side > 0 ? 'legL' : 'legR';
      var thigh = mesh(new THREE.CapsuleGeometry(0.065, 0.24, 3, 8), M.legDark);
      thigh.position.y = -0.22;
      l.add(thigh);
      var foot = mesh(new THREE.SphereGeometry(0.095, 12, 8), M.skin);
      foot.position.set(0.015 * side, -0.448, 0.055);
      foot.scale.set(1.15, 0.52, 1.5);
      l.add(foot);
      var toeGeo = new THREE.SphereGeometry(0.03, 8, 6);
      for (var i = -1; i <= 1; i++) {
        var toe = mesh(toeGeo, M.skin);
        toe.position.set((0.015 + i * 0.038) * side, -0.47, 0.185);
        toe.scale.set(1, 0.85, 1.2);
        l.add(toe);
      }
      return l;
    }
    var legL = leg(1), legR = leg(-1);

    /* ---------------- 装配契约 ---------------- */
    g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };

    /* ---------------- 待机动画（不触碰六关节——view3d 独占它们） ----------------
     * 1) 眼光呼吸  2) 兜帽尖轻摆  3) 下摆碎布飘  4) 扣坠丝带微晃 */
    g.userData.anim = [
      function (t) {
        M.eye.emissiveIntensity = 1.25 + 0.4 * Math.sin(t * 2.3);
        tip.rotation.x = Math.sin(t * 1.1) * 0.05;
        tip.rotation.z = Math.sin(t * 0.7 + 1.2) * 0.04;
        hem.rotation.y = Math.sin(t * 0.9) * 0.03;
        ribbons[0].rotation.x = Math.sin(t * 1.6) * 0.1;
        ribbons[1].rotation.x = Math.sin(t * 1.6 + 0.9) * 0.1;
      }
    ];

    return g;
  };
})();
