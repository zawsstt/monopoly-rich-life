/* =====================================================================================
 * qian 钱掌柜 —— img2threejs 精细重建（对照 refs/char_qian.png 三视图转台）
 * 设计权威: D:/minimax/f1/qian_pipe/object-sculpt-spec.json（strict-quality 校验通过，
 *           第 2 轮 form 迭代按参考图像素实测收紧头身比例）
 *
 * 装配契约（view3d.js animToken 按此硬驱动，位置必须精确）:
 *   根 Group，正面朝 +z，Y 上，角色自身左侧 = +x
 *   g.userData.parts = { head, torso, armL, armR, legL, legR }  全部为 Group 关节:
 *     legL/legR (±0.15, 0.5, 0)   torso (0, 0.52, 0)
 *     armL/armR (±0.33, 1.0, 0)   head  (0, 1.1, 0)
 *   整体身高 ≈ 1.69（外部再乘 1.08）
 *   g.userData.anim = [fn(t, dt), ...] —— 只动契约关节之外的内节点（呼吸/眨眼/发髻/计算器）
 *
 * 形象要点（对照参考图前视剪影 IoU 迭代）: Q 版 2.7 头身女强人；头+发髻宽 0.40、
 * 高 0.64（头顶 1.69）；黑色双瓣盘发髻 + 右上→左下 S 形斜刘海 + 两条垂落侧发；珍珠
 * 耳钉 + 九珠项链；紫色西装（枪领/双扣/口袋盖/白 V 内衬，腰 0.30/臀 0.38）+ 筒裙；
 * 纤细裸腿（并拢，关节内偏轴内倾）+ 紫色细跟高跟鞋；右手举计算器（绿 LCD + 橙色按键
 * 列），左手叉腰。
 * ===================================================================================== */
(function () {
  'use strict';
  window.Char3D = window.Char3D || {};

  function std(hex, o) {
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex).convertSRGBToLinear(),
      roughness: o.rough !== undefined ? o.rough : 0.8,
      metalness: o.metal || 0
    });
    if (o.emissive) {
      m.emissive = new THREE.Color(o.emissive).convertSRGBToLinear();
      m.emissiveIntensity = o.ei !== undefined ? o.ei : 1;
    }
    if (o.opacity !== undefined && o.opacity < 1) { m.transparent = true; m.opacity = o.opacity; }
    return m;
  }
  function MS(geo, mat, x, y, z) {
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }
  function sph(r, ws, hs, mat, x, y, z) { return MS(new THREE.SphereGeometry(r, ws, hs), mat, x, y, z); }
  function box(w, h, d, mat, x, y, z) { return MS(new THREE.BoxGeometry(w, h, d), mat, x, y, z); }
  function cyl(rt, rb, h, seg, mat, x, y, z) { return MS(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z); }
  function grp(parent, x, y, z) {
    var g = new THREE.Group();
    g.position.set(x || 0, y || 0, z || 0);
    parent.add(g);
    return g;
  }

  /* 锥形管锁（stylized_hair_threejs: 椭圆截面逐段缩放的自定义 BufferGeometry）
   * pts: Vector3 中心线控制点; w0/w1: 根/梢半宽; bulge: 中段鼓胀; dScale: 厚/宽比 */
  function taperedLock(pts, w0, w1, bulge, dScale, mat, radial, segs) {
    radial = radial || 6;
    segs = segs || 12;
    var curve = new THREE.CatmullRomCurve3(pts);
    var frames = curve.computeFrenetFrames(segs, false);
    var P = [], N = [], UV = [], I = [];
    for (var i = 0; i <= segs; i++) {
      var t = i / segs;
      var p = curve.getPoint(t);
      var nrm = frames.normals[i], bin = frames.binormals[i];
      var w = w0 + (w1 - w0) * t + bulge * Math.sin(t * Math.PI) * (w0 - w1 + 0.012);
      if (w < 0.003) w = 0.003;
      var d = w * dScale;
      for (var j = 0; j <= radial; j++) {
        var a = j / radial * Math.PI * 2;
        var ca = Math.cos(a), sa = Math.sin(a);
        var rx = ca * w, ry = sa * d;
        P.push(p.x + nrm.x * rx + bin.x * ry,
               p.y + nrm.y * rx + bin.y * ry,
               p.z + nrm.z * rx + bin.z * ry);
        N.push(nrm.x * ca + bin.x * sa,
               nrm.y * ca + bin.y * sa,
               nrm.z * ca + bin.z * sa);
        UV.push(j / radial, t);
      }
    }
    for (i = 0; i < segs; i++) {
      for (j = 0; j < radial; j++) {
        var a0 = i * (radial + 1) + j, b0 = a0 + radial + 1;
        I.push(a0, b0, a0 + 1, b0, b0 + 1, a0 + 1);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
    g.setIndex(I);
    var mesh = new THREE.Mesh(g, mat);
    mesh.castShadow = true;
    return mesh;
  }
  function V3(x, y, z) { return new THREE.Vector3(x, y, z); }

  /* LCD 扫描线小纹理（64x32 Canvas 程序化，节点环境自动降级为纯色） */
  function lcdTexture() {
    try {
      var cv = document.createElement('canvas');
      cv.width = 64; cv.height = 32;
      var ctx = cv.getContext('2d');
      if (!ctx || !ctx.fillRect) return null;
      ctx.fillStyle = '#9fb283';
      ctx.fillRect(0, 0, 64, 32);
      ctx.fillStyle = 'rgba(60,72,48,0.5)';
      for (var y = 2; y < 32; y += 4) ctx.fillRect(0, y, 64, 1);
      ctx.fillStyle = 'rgba(40,50,32,0.85)';
      ctx.fillRect(4, 6, 30, 3); ctx.fillRect(4, 12, 22, 3);
      return new THREE.CanvasTexture(cv);
    } catch (e) { return null; }
  }

  window.Char3D.qian = function () {
    var g = new THREE.Group();
    g.name = 'qian';

    /* ---------------- 材质（调色板取自参考图像素采样 + PBR 证据提取） ---------------- */
    var M = {
      skin: std('#f6c8a6', { rough: 0.6 }),
      skinDark: std('#e2a17c', { rough: 0.62 }),
      lip: std('#cf6a55', { rough: 0.45 }),
      blush: std('#f0a08a', { rough: 0.75, opacity: 0.9 }),
      iris: std('#5a3a20', { rough: 0.3 }),
      irisRim: std('#3a2412', { rough: 0.3 }),
      pupil: std('#201209', { rough: 0.25 }),
      eyeWhite: std('#f8f4f0', { rough: 0.35 }),
      lash: std('#241a16', { rough: 0.4 }),
      brow: std('#3a2a28', { rough: 0.5 }),
      hair: std('#241d22', { rough: 0.42 }),
      hairDark: std('#171216', { rough: 0.5 }),
      hairSheen: std('#4a4148', { rough: 0.3 }),
      suit: std('#5c3a80', { rough: 0.8 }),
      suitDark: std('#452a60', { rough: 0.82 }),
      lapelEdge: std('#3f254f', { rough: 0.8 }),
      skirt: std('#523475', { rough: 0.85 }),
      white: std('#f2eff0', { rough: 0.7 }),
      pearl: std('#f2ece6', { rough: 0.22, metal: 0.05 }),
      shoe: std('#4e3168', { rough: 0.5, metal: 0.05 }),
      calc: std('#26282e', { rough: 0.6 }),
      calcLight: std('#3a3e46', { rough: 0.55 }),
      btnGrey: std('#8c898c', { rough: 0.5 }),
      btnLight: std('#d8d8d4', { rough: 0.5 }),
      btnOrange: std('#d88830', { rough: 0.45 }),
      lcd: (function () {
        var m = std('#9fb283', { rough: 0.35, emissive: '#9fb283', ei: 0.15 });
        var tex = lcdTexture();
        if (tex) m.map = tex;
        return m;
      })()
    };

    /* =================================================================================
     * BLOCKOUT —— 六关节骨架（契约位置）
     * ================================================================================= */
    var legL = grp(g, 0.15, 0.5, 0); legL.name = 'legL';
    var legR = grp(g, -0.15, 0.5, 0); legR.name = 'legR';
    var torso = grp(g, 0, 0.52, 0); torso.name = 'torso';
    var armL = grp(g, 0.33, 1.0, 0); armL.name = 'armL';
    var armR = grp(g, -0.33, 1.0, 0); armR.name = 'armR';
    var head = grp(g, 0, 1.1, 0); head.name = 'head';

    /* =================================================================================
     * STRUCTURE / FORM —— 躯干: 西装 (Lathe 连续壳) + 白 V + 枪领 + 饰品 + 筒裙
     * torso 局部 (世界 = 局部 + 0.52); 腰 0.296 宽 @0.78, 臀 0.37 宽 @0.62
     * ================================================================================= */
    torso.add(cyl(0.05, 0.055, 0.15, 10, M.skin, 0, 0.5, 0.012));
    var blazerPts = [
      new THREE.Vector2(0.128, 0.055), new THREE.Vector2(0.150, 0.075),
      new THREE.Vector2(0.176, 0.105), new THREE.Vector2(0.163, 0.16),
      new THREE.Vector2(0.144, 0.255), new THREE.Vector2(0.146, 0.305),
      new THREE.Vector2(0.158, 0.375), new THREE.Vector2(0.149, 0.44),
      new THREE.Vector2(0.144, 0.485), new THREE.Vector2(0.122, 0.52),
      new THREE.Vector2(0.072, 0.545), new THREE.Vector2(0.0, 0.552)
    ];
    var blazer = MS(new THREE.LatheGeometry(blazerPts, 22), M.suit, 0, 0, 0);
    blazer.scale.set(1, 1, 0.82);
    torso.add(blazer);
    /* 落肩补量（斜坡桥接到契约臂关节 ±0.33） */
    [[1], [-1]].forEach(function (s) {
      var pad = sph(0.09, 12, 8, M.suit, 0.215 * s[0], 0.468, -0.005);
      pad.scale.set(1.35, 0.55, 0.85);
      torso.add(pad);
    });
    /* 后领座 */
    torso.add(cyl(0.068, 0.082, 0.045, 14, M.suitDark, 0, 0.538, -0.008));
    /* 白 V 内衬 */
    var vShape = new THREE.Shape();
    vShape.moveTo(-0.048, 0);
    vShape.lineTo(0.048, 0);
    vShape.lineTo(0, -0.135);
    vShape.closePath();
    torso.add(MS(new THREE.ExtrudeGeometry(vShape, { depth: 0.016, bevelEnabled: false }), M.white, 0, 0.475, 0.10));
    /* 枪领（左右各上下两段 + 暗色缘线 + 领嘴缺口） */
    [[1], [-1]].forEach(function (s) {
      var up = box(0.056, 0.125, 0.012, M.suit, 0.044 * s[0], 0.435, 0.122);
      up.rotation.z = -0.30 * s[0]; up.rotation.y = 0.12 * s[0];
      torso.add(up);
      var lo = box(0.044, 0.08, 0.012, M.suit, 0.024 * s[0], 0.335, 0.128);
      lo.rotation.z = 0.52 * s[0];
      torso.add(lo);
      var edge = box(0.011, 0.125, 0.015, M.lapelEdge, 0.068 * s[0], 0.442, 0.120);
      edge.rotation.z = -0.30 * s[0]; edge.rotation.y = 0.12 * s[0];
      torso.add(edge);
      var notch = box(0.02, 0.013, 0.016, M.lapelEdge, 0.078 * s[0], 0.484, 0.112);
      notch.rotation.z = -0.75 * s[0];
      torso.add(notch);
    });
    /* 双扣 + 前中缝 */
    torso.add(cyl(0.011, 0.011, 0.01, 10, M.calc, 0, 0.21, 0.136));
    torso.add(cyl(0.011, 0.011, 0.01, 10, M.calc, 0, 0.16, 0.138));
    torso.add(box(0.007, 0.2, 0.007, M.suitDark, 0, 0.225, 0.134));
    /* 口袋盖 */
    [[1], [-1]].forEach(function (s) {
      var flap = box(0.085, 0.024, 0.011, M.suitDark, 0.104 * s[0], 0.10, 0.124);
      flap.rotation.z = -0.06 * s[0];
      torso.add(flap);
    });

    /* 珍珠项链: 弧线 cord + 9 珠（等距弧阵列，最低珠在颈前） */
    var necklace = grp(torso, 0, 0.545, 0.05);
    necklace.rotation.x = 1.22;
    var cord = MS(new THREE.TorusGeometry(0.082, 0.0035, 6, 24, Math.PI * 1.5), M.pearl);
    cord.rotation.z = Math.PI * 0.75;
    necklace.add(cord);
    for (var i = 0; i < 9; i++) {
      var a = -Math.PI * 0.75 + (i / 8) * Math.PI * 1.5;
      necklace.add(sph(0.0115, 10, 8, M.pearl, Math.cos(a) * 0.082, Math.sin(a) * 0.082, 0));
    }

    /* 筒裙: 腰 0.158 → 臀 0.192 → 膝上 0.445(世界)，后开衩 */
    var skirtPts = [
      new THREE.Vector2(0.138, -0.075), new THREE.Vector2(0.152, -0.03),
      new THREE.Vector2(0.172, 0.03), new THREE.Vector2(0.178, 0.09),
      new THREE.Vector2(0.172, 0.14), new THREE.Vector2(0.162, 0.165)
    ];
    var skirt = MS(new THREE.LatheGeometry(skirtPts, 20), M.skirt, 0, 0, 0);
    skirt.scale.set(1, 1, 0.85);
    torso.add(skirt);
    var vent = box(0.022, 0.075, 0.011, M.suitDark, 0, -0.05, -0.125);
    vent.rotation.x = -0.06;
    torso.add(vent);

    /* =================================================================================
     * FORM —— 头部（参考实测: 颅 0.253w x 0.47h, 眼线 1.203, 下颌 1.05, 发际 1.51）
     * head 局部 (世界 = 局部 + 1.1)
     * ================================================================================= */
    var skull = sph(0.16, 26, 20, M.skin, 0, 0.185, 0.01);
    skull.scale.set(0.79, 1.46, 0.84);
    head.add(skull);
    var jaw = sph(0.095, 16, 12, M.skin, 0, 0.012, 0.035);
    jaw.scale.set(1.32, 0.72, 1.02);
    head.add(jaw);
    /* 耳 + 珍珠耳钉 */
    [[1], [-1]].forEach(function (s) {
      var ear = sph(0.03, 10, 8, M.skin, 0.122 * s[0], 0.21, -0.005);
      ear.scale.set(0.5, 1.05, 0.75);
      head.add(ear);
      head.add(sph(0.010, 8, 6, M.pearl, 0.131 * s[0], 0.175, 0.018));
    });
    /* 眉（细高拱，两段） */
    [[1], [-1]].forEach(function (s) {
      var b1 = box(0.03, 0.009, 0.012, M.brow, 0.040 * s[0], 0.185, 0.108);
      b1.rotation.z = -0.30 * s[0];
      head.add(b1);
      var b2 = box(0.028, 0.008, 0.012, M.brow, 0.082 * s[0], 0.196, 0.098);
      b2.rotation.z = 0.22 * s[0];
      head.add(b2);
    });
    /* 眼: 眼白 + 虹膜 + 瞳孔 + 双高光 + 上睫毛 + 可眨眼睑（眼线 1.203 → 局部 0.103） */
    var lids = [];
    [[1], [-1]].forEach(function (s) {
      var eye = grp(head, 0.066 * s[0], 0.103, 0.10);
      var white = sph(0.05, 14, 10, M.eyeWhite, 0, 0, 0);
      white.scale.set(1, 1.05, 0.5);
      eye.add(white);
      var rim = sph(0.033, 12, 10, M.irisRim, 0.002 * s[0], -0.002, 0.024);
      rim.scale.set(1, 1.05, 0.32);
      eye.add(rim);
      var iris = sph(0.031, 12, 10, M.iris, 0.002 * s[0], -0.002, 0.028);
      iris.scale.set(1, 1.05, 0.32);
      eye.add(iris);
      var pupil = sph(0.016, 10, 8, M.pupil, 0.002 * s[0], -0.002, 0.040);
      pupil.scale.set(1, 1.05, 0.3);
      eye.add(pupil);
      eye.add(sph(0.0095, 8, 6, M.eyeWhite, 0.013 * s[0], 0.016, 0.048));
      eye.add(sph(0.0048, 6, 5, M.eyeWhite, -0.010 * s[0], -0.014, 0.05));
      /* 上睫毛带 + 外眼角小翼 */
      var lashBand = sph(0.052, 14, 10, M.lash, 0, 0.022, 0.002);
      lashBand.scale.set(1.08, 0.4, 0.5);
      eye.add(lashBand);
      var wing = sph(0.013, 8, 6, M.lash, 0.052 * s[0], 0.03, 0.004);
      wing.scale.set(1.5, 0.7, 0.6);
      wing.rotation.z = -0.5 * s[0];
      eye.add(wing);
      /* 眼睑（眨眼: y 0.068 → 0.003） */
      var lid = sph(0.055, 14, 10, M.skinDark, 0, 0.068, -0.002);
      lid.scale.set(1.08, 0.72, 0.55);
      eye.add(lid);
      lids.push(lid);
    });
    /* 鼻 */
    var nose = sph(0.014, 10, 8, M.skin, 0, 0.05, 0.132);
    nose.scale.set(1, 0.85, 0.9);
    head.add(nose);
    /* 唇: 上唇弓 + 下唇弧 + 两侧笑角（嘴线 1.062 → 局部 -0.038） */
    var lowerLip = MS(new THREE.TorusGeometry(0.024, 0.0065, 8, 16, Math.PI * 0.95), M.lip, 0, -0.038, 0.116);
    lowerLip.rotation.x = -0.55;
    lowerLip.rotation.z = Math.PI * 1.025;
    head.add(lowerLip);
    var upperLip = box(0.044, 0.008, 0.011, M.lip, 0, -0.026, 0.114);
    upperLip.rotation.x = 0.18;
    head.add(upperLip);
    head.add(sph(0.006, 8, 6, M.lip, 0.025, -0.031, 0.112));
    head.add(sph(0.006, 8, 6, M.lip, -0.025, -0.031, 0.112));
    /* 腮红 */
    [[1], [-1]].forEach(function (s) {
      var c = sph(0.028, 10, 8, M.blush, 0.088 * s[0], 0.045, 0.104);
      c.scale.set(1, 0.55, 0.25);
      head.add(c);
    });

    /* ---------------- 头发系统（clustered-lock，宽 0.40，bun 顶 1.69） ---------------- */
    var hair = grp(head, 0, 0, 0);
    /* 发冠整体壳：满球体靠后上放置，与颅骨求交自然形成发际线（无旋转 → 包围盒精确）；
     * 参考图发量整体偏角色左（+x），加宽右倾 */
    var cap = sph(0.185, 26, 20, M.hair, 0.02, 0.27, -0.03);
    cap.scale.set(1.2, 1.05, 1.0);
    hair.add(cap);
    /* 侧盖（连接发冠与后脑壳，盖耳上；角色左更饱满） */
    [[-0.145, 0.058, 0.9], [0.155, 0.07, 0.95]].forEach(function (q) {
      var side = sph(q[1], 12, 10, M.hair, q[0], 0.315, -0.025);
      side.scale.set(q[2], 1.1, 0.95);
      hair.add(side);
    });
    /* 后发脚波浪（几何自身烘焙旋转的背侧弧脊，只留脑后） */
    [[0.14, -0.125, 0.14], [0.04, -0.095, 0.125]].forEach(function (q) {
      var rg = new THREE.TorusGeometry(q[2], 0.008, 6, 18, Math.PI * 0.75);
      rg.rotateZ(Math.PI * 1.125);
      rg.rotateX(1.45);
      hair.add(MS(rg, M.hairDark, 0, q[0], q[1]));
    });
    /* 双瓣盘发髻（identity 特征，参考图发髻偏角色左）+ 旋涡槽 + 高光条 */
    var bun = grp(hair, 0.04, 0.45, -0.012);
    var lobe1 = sph(0.085, 18, 14, M.hair, 0, 0.008, 0);
    lobe1.scale.set(1.12, 0.85, 0.96);
    bun.add(lobe1);
    var lobe2 = sph(0.066, 16, 12, M.hair, 0.022, 0.086, -0.004);
    lobe2.scale.set(1.06, 0.8, 0.92);
    bun.add(lobe2);
    var swirl1 = MS(new THREE.TorusGeometry(0.055, 0.0065, 6, 18), M.hairDark, 0, 0.012, 0.018);
    swirl1.rotation.x = 1.15; swirl1.rotation.y = 0.3;
    bun.add(swirl1);
    var swirl2 = MS(new THREE.TorusGeometry(0.034, 0.005, 6, 16), M.hairDark, 0.022, 0.088, 0.012);
    swirl2.rotation.x = 1.05; swirl2.rotation.y = -0.25;
    bun.add(swirl2);
    [[-0.028, 0.035, 0.032, 0.5], [0.038, 0.055, 0.028, -0.4], [0.006, 0.098, 0.026, 0.25]].forEach(function (q) {
      var streak = box(0.008, 0.048, 0.011, M.hairSheen, q[0], q[1], q[2]);
      streak.rotation.z = q[3];
      streak.rotation.x = 0.35;
      bun.add(streak);
    });
    /* S 形斜刘海（分线在角色右上 → 梢部左眉上，绝不盖双眼） */
    hair.add(taperedLock(
      [V3(0.09, 0.36, 0.05), V3(0.03, 0.34, 0.095), V3(-0.05, 0.29, 0.11), V3(-0.095, 0.215, 0.09)],
      0.048, 0.007, 0.35, 0.5, M.hair, 7, 14));
    hair.add(taperedLock(
      [V3(0.10, 0.345, 0.025), V3(0.065, 0.295, 0.075), V3(0.025, 0.24, 0.095), V3(0.004, 0.20, 0.085)],
      0.03, 0.005, 0.3, 0.5, M.hair, 6, 12));
    hair.add(taperedLock(
      [V3(-0.085, 0.355, 0.04), V3(-0.115, 0.295, 0.08), V3(-0.135, 0.235, 0.075)],
      0.024, 0.005, 0.25, 0.55, M.hair, 6, 10));
    /* 鬓角小盖片（补帽缘与耳朵之间的缝，藏在发际线上方） */
    [[1], [-1]].forEach(function (s) {
      var tuft = sph(0.035, 10, 8, M.hair, 0.132 * s[0], 0.365, 0.035);
      tuft.scale.set(0.7, 0.85, 0.8);
      hair.add(tuft);
    });
    /* 垂落侧发（角色左长锁沿发缘卷到颈侧，角色右短锁掖进发后） */
    var lockL = taperedLock(
      [V3(0.155, 0.19, 0.008), V3(0.165, 0.06, 0.022), V3(0.155, -0.07, 0.04), V3(0.125, -0.175, 0.055)],
      0.028, 0.01, 0.5, 0.8, M.hair, 7, 14);
    hair.add(lockL);
    hair.add(sph(0.012, 8, 6, M.hair, 0.123, -0.188, 0.058));
    var lockR = taperedLock(
      [V3(-0.135, 0.18, 0), V3(-0.148, 0.075, 0.012), V3(-0.135, -0.005, 0.02)],
      0.018, 0.006, 0.4, 0.8, M.hair, 7, 12);
    hair.add(lockR);

    /* =================================================================================
     * FORM —— 手臂（姿势烘入关节内的子枢轴，animToken 摆动时整体跟随）
     * armL 叉腰: 肩出 0.35 + 肘折 -1.68;  armR 内收 0.25 + 肘前折 -1.62 举计算器
     * ================================================================================= */
    function buildArm(pose) {
      var upper = grp(this, 0, 0, 0);
      upper.rotation.z = pose.upperZ;
      upper.rotation.x = pose.upperX || 0;
      var ua = MS(new THREE.CapsuleGeometry(pose.uaR, pose.uaLen - pose.uaR * 2 + 0.02, 4, 10), M.suit, 0, -pose.uaLen * 0.5, 0);
      upper.add(ua);
      upper.add(cyl(pose.uaR + 0.005, pose.uaR + 0.005, 0.02, 12, M.suitDark, 0, -pose.uaLen + 0.012, 0));
      var elbow = grp(upper, 0, -pose.uaLen, 0);
      elbow.rotation.z = pose.elbowZ || 0;
      elbow.rotation.x = pose.elbowX || 0;
      var fa = MS(new THREE.CapsuleGeometry(pose.faR, pose.faLen - pose.faR * 2 + 0.02, 4, 10), M.suit, 0, -pose.faLen * 0.48, 0);
      elbow.add(fa);
      elbow.add(cyl(pose.faR - 0.002, pose.faR - 0.006, 0.025, 10, M.skin, 0, -pose.faLen + 0.022, 0));
      var hand = sph(pose.handR, 12, 10, M.skin, 0, -pose.faLen - 0.008, 0);
      hand.scale.set(1.05, 0.8, 0.9);
      elbow.add(hand);
      return { upper: upper, elbow: elbow, hand: hand };
    }
    /* 左手叉腰（上臂内收贴合参考，肘仍在关节内侧形成叉腰三角） */
    var armLL = buildArm.call(armL, { upperZ: -0.28, uaR: 0.05, uaLen: 0.23, elbowZ: -0.664, faR: 0.042, faLen: 0.20, handR: 0.042 });
    armLL.hand.scale.set(1.3, 0.55, 1.0);
    armLL.hand.position.set(0, -0.175, 0.02);
    /* 右手举计算器（肘前折 -2.0 → 计算器抬到脸侧，参考位 y≈0.93..1.03） */
    var armRR = buildArm.call(armR, { upperZ: 0.42, upperX: -0.10, uaR: 0.05, uaLen: 0.20, elbowX: -2.0, faR: 0.042, faLen: 0.20, handR: 0.042 });
    armRR.hand.position.set(0, -0.20, 0.018);

    /* 计算器（identity 道具）: 深灰机身 + 绿 LCD + 4x3 按键（第 3 列橙色） */
    var calcG = grp(armRR.elbow, 0.015, -0.262, 0.05);
    calcG.rotation.x = -1.05;
    calcG.rotation.z = -0.22;
    calcG.add(box(0.148, 0.195, 0.038, M.calc, 0, 0, 0));
    calcG.add(box(0.156, 0.205, 0.012, M.calcLight, 0, 0, -0.020));
    calcG.add(box(0.118, 0.052, 0.008, M.calc, 0, 0.056, 0.021));
    calcG.add(box(0.102, 0.038, 0.008, M.lcd, 0, 0.056, 0.026));
    var rows = [-0.002, -0.036, -0.070, -0.104];
    var cols = [-0.043, 0, 0.043];
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < 3; c++) {
        var mButton = (c === 2) ? M.btnOrange : ((r + c) % 2 ? M.btnGrey : M.btnLight);
        calcG.add(box(0.026, 0.022, 0.014, mButton, cols[c], rows[r], 0.023));
      }
    }

    /* =================================================================================
     * FORM —— 腿: 纤细裸腿（关节内强内倾向参考的并拢腿位）+ 紫色细跟高跟鞋
     * 鞋底到关节 -0.5
     * ================================================================================= */
    [[legL, 1, 0.12], [legR, -1, -0.12]].forEach(function (cfg) {
      var leg = cfg[0], s = cfg[1], toeOut = cfg[2];
      var dx = -0.105 * s;    /* 大腿中心 → 世界 ±0.045 */
      var dx2 = -0.125 * s;   /* 膝/小腿 → 世界 ±0.025 */
      var dx3 = -0.14 * s;    /* 踝/足 → 世界 ±0.01 */
      var thigh = MS(new THREE.CapsuleGeometry(0.045, 0.15, 4, 12), M.skin, dx, -0.125, 0);
      leg.add(thigh);
      leg.add(sph(0.038, 12, 10, M.skin, dx2, -0.222, 0.004));
      var calf = MS(new THREE.CapsuleGeometry(0.034, 0.12, 4, 12), M.skin, dx2, -0.30, -0.004);
      leg.add(calf);
      var calfBulge = sph(0.033, 10, 8, M.skin, dx2, -0.295, -0.018);
      calfBulge.scale.set(1, 1.5, 1.05);
      leg.add(calfBulge);
      leg.add(sph(0.023, 10, 8, M.skin, dx3 + 0.006 * s, -0.418, 0.002));
      /* 高跟鞋（指向 +z 外旋 toeOut） */
      var pump = grp(leg, dx3, 0, 0);
      pump.rotation.y = toeOut;
      var foot = sph(0.04, 12, 10, M.shoe, 0, -0.468, 0.04);
      foot.scale.set(0.85, 0.5, 1.6);
      pump.add(foot);
      var toe = MS(new THREE.ConeGeometry(0.032, 0.1, 12), M.shoe, 0, -0.47, 0.115);
      toe.rotation.x = Math.PI / 2;
      toe.scale.set(1, 1, 0.72);
      pump.add(toe);
      pump.add(box(0.05, 0.018, 0.08, M.shoe, 0, -0.44, 0.04));
      pump.add(cyl(0.008, 0.0095, 0.08, 8, M.shoe, 0, -0.458, -0.052));
      pump.add(sph(0.012, 8, 6, M.shoe, 0, -0.421, -0.052));
      var sole = box(0.046, 0.009, 0.14, M.shoe, 0, -0.494, 0.035);
      pump.add(sole);
    });

    /* =================================================================================
     * INTERACTION —— 待机动画（只动内节点，六关节留给 view3d.animToken）
     * ================================================================================= */
    g.userData.anim = [
      /* 呼吸: 胸腔微缩放 + 项链随浮 */
      (function () {
        var baseSX = blazer.scale.x, baseSY = blazer.scale.y, baseSZ = blazer.scale.z;
        return function (t) {
          var b = Math.sin(t * 1.9);
          blazer.scale.set(baseSX + b * 0.006, baseSY + b * 0.008, baseSZ + b * 0.005);
          necklace.position.y = 0.545 + b * 0.003;
        };
      })(),
      /* 发髻微晃（迟滞弹簧感） */
      function (t) {
        bun.rotation.x = Math.sin(t * 1.9 + 0.55) * 0.032;
        bun.rotation.z = Math.sin(t * 1.35 + 0.2) * 0.02;
        lobe2.position.y = 0.086 + Math.sin(t * 1.9 + 0.7) * 0.0015;
      },
      /* 眨眼（3.2~4.8s 一次，闭合 0.13s） */
      (function () {
        var next = 2.2;
        return function (t, dt) {
          var phase = t % next;
          if (phase < 0.13) {
            var k = Math.sin(phase / 0.13 * Math.PI);
            for (var li = 0; li < lids.length; li++) lids[li].position.y = 0.068 - 0.065 * k;
          } else {
            for (var lj = 0; lj < lids.length; lj++) lids[lj].position.y = 0.068;
          }
          if (phase < dt) next = 3.2 + (t * 7919 % 1.6);
        };
      })(),
      /* 计算器随手部微浮 + 侧发摆 */
      function (t) {
        calcG.position.y = -0.262 + Math.sin(t * 1.9 + 0.3) * 0.004;
        calcG.rotation.z = -0.22 + Math.sin(t * 1.9 + 0.5) * 0.012;
        lockL.rotation.x = Math.sin(t * 1.15) * 0.045;
        lockR.rotation.x = Math.sin(t * 1.15 + 0.8) * 0.03;
      }
    ];

    g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };
    return g;
  };
})();
