/* =====================================================================================
 * qian 钱掌柜 —— img2threejs 精细重建 v2（对照 refs/char_qian.png 三视图转台精修）
 * v1 已验收基调全保留（形态/配色/布局/朝向/导出契约不变），本轮清偿细节差距:
 *   1) 紫西装缝线系统: 公主线(taperedLock 曲面贴附) + 背中缝 + 背腰省 + 门襟双止口线 +
 *      袋盖止口 + 袖口扣 + 纽眼下带扣眼线
 *   2) 翻领结构化: 领座护翼(后领→前领口) + 上/下翻领 + 折线缘 + 内嵌止口线 + 缺口
 *   3) 计算器按键浮雕: 每键 = 凹陷键座 + 凸起键帽两层; LCD 升级 128x64 七段数码管屏显
 *      (幽灵段 + "63400" 显示) + 太阳能充电条 + 屏幕凹槽边圈
 *   4) 珍珠项链光泽分层: 主珠 + 每珠高光帽 + 珠间隔珠; 耳钉同加高光帽
 *   5) 发髻丝缕走向: 髻身 6 条锥形发缕螺旋缠绕 + 副瓣 2 条 + 顶心旋涡加深刻痕 +
 *      冠部 4 条从分线流向发髻的贴发缕 + 刘海/侧发伴生细缕 + 2 条碎发
 *   6) 裙后开衩几何化: v1 暗色贴片实际被埋在裙体内(不可见 bug) → v2 双叠门襟襟片
 *      (下摆张开) + 衩内暗衬 + 襟缘折线; 侧缝曲线缝线
 *   7) 高跟鞋细节: 鞋口滚边 + 跗面围口线 + 鞋跟尾梢帽 + 跟阜 + 鞋底沿边
 *   8) 段数合规: 圆柱 ≥12 段; 半径 ≥0.02 球体 ≥16x12
 *
 * 装配契约（view3d.js animToken 按此硬驱动，位置必须精确）:
 *   根 Group，正面朝 +z，Y 上，角色自身左侧 = +x
 *   g.userData.parts = { head, torso, armL, armR, legL, legR }  全部为 Group 关节:
 *     legL/legR (±0.15, 0.5, 0)   torso (0, 0.52, 0)
 *     armL/armR (±0.33, 1.0, 0)   head  (0, 1.1, 0)
 *   整体身高 ≈ 1.70（外部再乘 1.08）
 *   g.userData.anim = [fn(t, dt), ...] —— 只动契约关节之外的内节点（呼吸/眨眼/发髻/计算器）
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
   * pts: Vector3 中心线控制点; w0/w1: 根/梢半宽; bulge: 中段鼓胀; dScale: 厚/宽比
   * v2 复用: 发缕 / 曲面贴附缝线（w 恒定小值即为沿曲线缝线） */
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
  /* 曲面缝线: 沿 CatmullRom 曲线的恒宽暗色细带（略嵌入曲面, 外露 ~0.004） */
  function seamStrip(pts, mat, w) {
    return taperedLock(pts, w || 0.0045, w || 0.0045, 0, 0.6, mat, 5, 10);
  }

  /* LCD 七段数码管纹理（128x64 Canvas 程序化: 扫描线 + 幽灵段 + "63400" 显示，
   * 节点环境自动降级为纯色）。512px 上限内。 */
  function lcdTexture() {
    try {
      var cv = document.createElement('canvas');
      cv.width = 128; cv.height = 64;
      var ctx = cv.getContext('2d');
      if (!ctx || !ctx.fillRect) return null;
      /* 底色 + 渐暗边 */
      ctx.fillStyle = '#a3b586';
      ctx.fillRect(0, 0, 128, 64);
      ctx.fillStyle = 'rgba(52,62,40,0.35)';
      ctx.fillRect(0, 0, 128, 3); ctx.fillRect(0, 61, 128, 3);
      ctx.fillRect(0, 0, 3, 64); ctx.fillRect(125, 0, 3, 64);
      /* 扫描线 */
      ctx.fillStyle = 'rgba(60,72,48,0.4)';
      for (var y = 4; y < 60; y += 4) ctx.fillRect(3, y, 122, 1);
      /* 七段管 */
      var SEG = { /* x, y, w, h（相对 14x24 字格） */
        a: [1, 0, 12, 3], b: [11, 1, 3, 10], c: [11, 13, 3, 10],
        d: [1, 21, 12, 3], e: [0, 13, 3, 10], f: [0, 1, 3, 10], g: [1, 11, 12, 3]
      };
      var DIG = {
        0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc',
        5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg'
      };
      function drawDigit(ch, x0, ghost) {
        ctx.fillStyle = ghost ? 'rgba(40,50,32,0.13)' : 'rgba(38,47,30,0.92)';
        var segs = DIG[ch], k;
        for (k = 0; k < segs.length; k++) {
          var s = SEG[segs[k]];
          ctx.fillRect(x0 + s[0], 20 + s[1], s[2], s[3]);
        }
      }
      var text = '63400', i;
      for (i = 0; i < 5; i++) drawDigit('8', 9 + i * 22, true);        /* 幽灵段 */
      for (i = 0; i < 5; i++) drawDigit(text.charAt(i), 9 + i * 22, false); /* 实显 */
      /* 右下小数点 + 左上单位格 */
      ctx.fillStyle = 'rgba(38,47,30,0.92)';
      ctx.fillRect(118, 41, 4, 4);
      ctx.fillStyle = 'rgba(40,50,32,0.5)';
      ctx.fillRect(9, 8, 30, 7);
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
      whiteShade: std('#d9d1d5', { rough: 0.74 }),
      pearl: std('#f2ece6', { rough: 0.22, metal: 0.05 }),
      glint: std('#ffffff', { rough: 0.12, metal: 0.08 }),
      shoe: std('#4e3168', { rough: 0.5, metal: 0.05 }),
      shoeDark: std('#38224e', { rough: 0.55 }),
      calc: std('#26282e', { rough: 0.6 }),
      calcLight: std('#3a3e46', { rough: 0.55 }),
      calcDark: std('#1b1d23', { rough: 0.66 }),
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
     * STRUCTURE / FORM —— 躯干: 西装 (Lathe 连续壳) + 白 V + 结构化翻领 + 缝线系统
     * torso 局部 (世界 = 局部 + 0.52); 腰 0.296 宽 @0.78, 臀 0.37 宽 @0.62
     * ================================================================================= */
    torso.add(cyl(0.05, 0.055, 0.15, 12, M.skin, 0, 0.5, 0.012));
    var blazerPts = [
      new THREE.Vector2(0.128, 0.055), new THREE.Vector2(0.150, 0.075),
      new THREE.Vector2(0.176, 0.105), new THREE.Vector2(0.163, 0.16),
      new THREE.Vector2(0.144, 0.255), new THREE.Vector2(0.146, 0.305),
      new THREE.Vector2(0.158, 0.375), new THREE.Vector2(0.149, 0.44),
      new THREE.Vector2(0.144, 0.485), new THREE.Vector2(0.122, 0.52),
      new THREE.Vector2(0.072, 0.545), new THREE.Vector2(0.0, 0.552)
    ];
    var blazer = MS(new THREE.LatheGeometry(blazerPts, 26), M.suit, 0, 0, 0);
    blazer.scale.set(1, 1, 0.82);
    torso.add(blazer);
    /* 落肩补量（斜坡桥接到契约臂关节 ±0.33） */
    [[1], [-1]].forEach(function (s) {
      var pad = sph(0.09, 16, 12, M.suit, 0.215 * s[0], 0.468, -0.005);
      pad.scale.set(1.35, 0.55, 0.85);
      torso.add(pad);
    });
    /* 后领座 */
    torso.add(cyl(0.068, 0.082, 0.045, 16, M.suitDark, 0, 0.538, -0.008));
    /* 白 V 内衬 + 垂褶纹（两道浅色阴影条） */
    var vShape = new THREE.Shape();
    vShape.moveTo(-0.048, 0);
    vShape.lineTo(0.048, 0);
    vShape.lineTo(0, -0.135);
    vShape.closePath();
    torso.add(MS(new THREE.ExtrudeGeometry(vShape, { depth: 0.016, bevelEnabled: false }), M.white, 0, 0.475, 0.10));
    [[1], [-1]].forEach(function (s) {
      var fold = box(0.007, 0.1, 0.005, M.whiteShade, 0.015 * s[0], 0.415, 0.117);
      fold.rotation.z = 0.12 * s[0];
      fold.rotation.x = 0.1;
      torso.add(fold);
    });

    /* ---------------- 翻领结构（v2）: 领座护翼 + 上/下翻领 + 折线缘 + 止口线 + 缺口 ------- */
    [[1], [-1]].forEach(function (s) {
      /* 领座护翼: 从后领绕到前领口, 与上翻领顶端相接 */
      var wing = box(0.05, 0.058, 0.013, M.suit, 0.05 * s[0], 0.503, 0.096);
      wing.rotation.x = -0.62;
      wing.rotation.z = -0.62 * s[0];
      wing.rotation.y = 0.2 * s[0];
      torso.add(wing);
      /* 上翻领 */
      var up = box(0.056, 0.125, 0.012, M.suit, 0.044 * s[0], 0.435, 0.122);
      up.rotation.z = -0.30 * s[0]; up.rotation.y = 0.12 * s[0];
      torso.add(up);
      /* 下翻领（驳头） */
      var lo = box(0.044, 0.08, 0.012, M.suit, 0.024 * s[0], 0.335, 0.128);
      lo.rotation.z = 0.52 * s[0];
      torso.add(lo);
      /* 外缘折线（暗色缘边） */
      var edge = box(0.011, 0.125, 0.015, M.lapelEdge, 0.068 * s[0], 0.442, 0.120);
      edge.rotation.z = -0.30 * s[0]; edge.rotation.y = 0.12 * s[0];
      torso.add(edge);
      /* 内嵌止口缝线（细, 靠内 0.014） */
      var stitch = box(0.004, 0.112, 0.007, M.suitDark, 0.052 * s[0], 0.433, 0.13);
      stitch.rotation.z = -0.30 * s[0]; stitch.rotation.y = 0.12 * s[0];
      torso.add(stitch);
      /* 领嘴缺口 */
      var notch = box(0.02, 0.013, 0.016, M.lapelEdge, 0.078 * s[0], 0.484, 0.112);
      notch.rotation.z = -0.75 * s[0];
      torso.add(notch);
    });

    /* 双扣 + 扣眼线 + 前中缝 + 门襟双止口线 */
    torso.add(cyl(0.011, 0.011, 0.01, 12, M.calc, 0, 0.21, 0.136));
    torso.add(cyl(0.011, 0.011, 0.01, 12, M.calc, 0, 0.16, 0.138));
    torso.add(box(0.006, 0.016, 0.005, M.calcDark, 0, 0.224, 0.139));
    torso.add(box(0.006, 0.016, 0.005, M.calcDark, 0, 0.174, 0.141));
    torso.add(box(0.007, 0.2, 0.007, M.suitDark, 0, 0.225, 0.134));
    [[1], [-1]].forEach(function (s) {
      torso.add(box(0.0035, 0.2, 0.005, M.suitDark, 0.012 * s[0], 0.215, 0.1352));
    });

    /* 公主线（曲面贴附曲线缝线, 左右各一条, 肩胛 → 腰线） */
    [[1], [-1]].forEach(function (s) {
      var px = 0.088 * s[0];
      torso.add(seamStrip([
        V3(px, 0.165, s[0] * 0.1132), V3(px, 0.2, s[0] * 0.1064),
        V3(px, 0.235, s[0] * 0.0993), V3(px, 0.27, s[0] * 0.0958),
        V3(px, 0.305, s[0] * 0.0971)
      ], M.suitDark, 0.004));
    });

    /* 口袋盖 + 盖下止口线 */
    [[1], [-1]].forEach(function (s) {
      var flap = box(0.085, 0.024, 0.011, M.suitDark, 0.104 * s[0], 0.10, 0.124);
      flap.rotation.z = -0.06 * s[0];
      torso.add(flap);
      var fst = box(0.078, 0.005, 0.008, M.lapelEdge, 0.104 * s[0], 0.085, 0.126);
      fst.rotation.z = -0.06 * s[0];
      torso.add(fst);
    });

    /* 背中缝 + 背腰省（曲面贴附） */
    torso.add(seamStrip([
      V3(0, 0.14, -0.1185), V3(0, 0.22, -0.1192),
      V3(0, 0.32, -0.1195), V3(0, 0.42, -0.1185), V3(0, 0.47, -0.117)
    ], M.suitDark, 0.005));
    [[1], [-1]].forEach(function (s) {
      torso.add(seamStrip([
        V3(0.058 * s[0], 0.245, -0.1103), V3(0.05 * s[0], 0.2, -0.122),
        V3(0.042 * s[0], 0.16, -0.1306)
      ], M.suitDark, 0.004));
    });

    /* ---------------- 珍珠项链 v2: 弧线 cord + 9 主珠(大小韵律) + 高光帽 + 8 隔珠 ------- */
    var necklace = grp(torso, 0, 0.545, 0.05);
    necklace.rotation.x = 1.22;
    var cord = MS(new THREE.TorusGeometry(0.082, 0.0035, 6, 24, Math.PI * 1.5), M.pearl);
    cord.rotation.z = Math.PI * 0.75;
    necklace.add(cord);
    var pearlR = [1.0, 0.92, 1.05, 0.95, 1.08, 0.95, 1.05, 0.92, 1.0];
    var pearlPos = [];
    for (var i = 0; i < 9; i++) {
      var a = -Math.PI * 0.75 + (i / 8) * Math.PI * 1.5;
      var px2 = Math.cos(a) * 0.082, py2 = Math.sin(a) * 0.082;
      pearlPos.push([px2, py2]);
      necklace.add(sph(0.0115 * pearlR[i], 12, 10, M.pearl, px2, py2, 0));
    }
    pearlPos.forEach(function (p) {
      /* 高光帽: 向前上方偏移的镜点（nacre 光泽分层） */
      necklace.add(sph(0.0034, 10, 8, M.glint, p[0] + 0.0025, p[1] + 0.0038, 0.0072));
    });
    for (i = 0; i < 8; i++) {
      var am = -Math.PI * 0.75 + ((i + 0.5) / 8) * Math.PI * 1.5;
      necklace.add(sph(0.004, 10, 8, M.pearl, Math.cos(am) * 0.082, Math.sin(am) * 0.082, 0));
    }

    /* ---------------- 筒裙: 腰 0.158 → 臀 0.192 → 膝上 0.445(世界) + 几何化后开衩 ------- */
    var skirtPts = [
      new THREE.Vector2(0.138, -0.075), new THREE.Vector2(0.152, -0.03),
      new THREE.Vector2(0.172, 0.03), new THREE.Vector2(0.178, 0.09),
      new THREE.Vector2(0.172, 0.14), new THREE.Vector2(0.162, 0.165)
    ];
    var skirt = MS(new THREE.LatheGeometry(skirtPts, 24), M.skirt, 0, 0, 0);
    skirt.scale.set(1, 1, 0.85);
    torso.add(skirt);
    /* 后开衩: 左右叠襟（Group 旋转, 下摆外张）+ 襟缘折线 + 衩内暗衬 */
    [[-1, -0.22], [1, 0.22]].forEach(function (cfg) {
      var sg = grp(torso, 0.024 * cfg[0], -0.028, -0.1335);
      sg.rotation.x = -0.25;
      sg.rotation.y = cfg[1];
      sg.add(box(0.048, 0.105, 0.009, M.skirt, 0, 0, 0));
      sg.add(box(0.048, 0.007, 0.011, M.suitDark, 0, -0.052, 0.001));
    });
    var ventLiner = box(0.012, 0.106, 0.006, M.suitDark, 0, -0.028, -0.1295);
    ventLiner.rotation.x = -0.25;
    torso.add(ventLiner);
    /* 裙侧缝线（曲面贴附） */
    [[1], [-1]].forEach(function (s) {
      torso.add(seamStrip([
        V3(0.146 * s[0], -0.055, 0), V3(0.159 * s[0], -0.015, 0),
        V3(0.174 * s[0], 0.03, 0), V3(0.18 * s[0], 0.09, 0),
        V3(0.174 * s[0], 0.14, 0)
      ], M.suitDark, 0.004));
    });

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
    /* 耳 + 珍珠耳钉（+高光帽） */
    [[1], [-1]].forEach(function (s) {
      var ear = sph(0.03, 16, 12, M.skin, 0.122 * s[0], 0.21, -0.005);
      ear.scale.set(0.5, 1.05, 0.75);
      head.add(ear);
      head.add(sph(0.010, 10, 8, M.pearl, 0.131 * s[0], 0.175, 0.018));
      head.add(sph(0.0032, 10, 8, M.glint, 0.133 * s[0], 0.178, 0.023));
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
    /* 眼: 眼白 + 虹膜 + 瞳孔 + 双高光 + 上睫毛 + 下睫毛线 + 可眨眼睑（眼线 1.203 → 局部 0.103） */
    var lids = [];
    [[1], [-1]].forEach(function (s) {
      var eye = grp(head, 0.066 * s[0], 0.103, 0.10);
      var white = sph(0.05, 16, 12, M.eyeWhite, 0, 0, 0);
      white.scale.set(1, 1.05, 0.5);
      eye.add(white);
      var rim = sph(0.033, 16, 12, M.irisRim, 0.002 * s[0], -0.002, 0.024);
      rim.scale.set(1, 1.05, 0.32);
      eye.add(rim);
      var iris = sph(0.031, 16, 12, M.iris, 0.002 * s[0], -0.002, 0.028);
      iris.scale.set(1, 1.05, 0.32);
      eye.add(iris);
      var pupil = sph(0.016, 12, 9, M.pupil, 0.002 * s[0], -0.002, 0.040);
      pupil.scale.set(1, 1.05, 0.3);
      eye.add(pupil);
      eye.add(sph(0.0095, 10, 8, M.eyeWhite, 0.013 * s[0], 0.016, 0.048));
      eye.add(sph(0.0048, 10, 8, M.eyeWhite, -0.010 * s[0], -0.014, 0.05));
      /* 上睫毛带 + 外眼角小翼 */
      var lashBand = sph(0.052, 16, 12, M.lash, 0, 0.022, 0.002);
      lashBand.scale.set(1.08, 0.4, 0.5);
      eye.add(lashBand);
      var wing = sph(0.013, 10, 8, M.lash, 0.052 * s[0], 0.03, 0.004);
      wing.scale.set(1.5, 0.7, 0.6);
      wing.rotation.z = -0.5 * s[0];
      eye.add(wing);
      /* v2 下睫毛细线 */
      var lowLash = box(0.032, 0.0045, 0.006, M.lash, 0, -0.041, 0.011);
      lowLash.rotation.z = 0.18 * s[0];
      eye.add(lowLash);
      /* 眼睑（眨眼: y 0.068 → 0.003） */
      var lid = sph(0.055, 16, 12, M.skinDark, 0, 0.068, -0.002);
      lid.scale.set(1.08, 0.72, 0.55);
      eye.add(lid);
      lids.push(lid);
    });
    /* 鼻 */
    var nose = sph(0.014, 12, 9, M.skin, 0, 0.05, 0.132);
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
    head.add(sph(0.006, 10, 8, M.lip, 0.025, -0.031, 0.112));
    head.add(sph(0.006, 10, 8, M.lip, -0.025, -0.031, 0.112));
    /* 腮红 */
    [[1], [-1]].forEach(function (s) {
      var c = sph(0.028, 16, 12, M.blush, 0.088 * s[0], 0.045, 0.104);
      c.scale.set(1, 0.55, 0.25);
      head.add(c);
    });

    /* ---------------- 头发系统 v2（clustered-lock + 丝缕走向，宽 0.40，bun 顶 1.70） ------- */
    var hair = grp(head, 0, 0, 0);
    /* 发冠整体壳：满球体靠后上放置，与颅骨求交自然形成发际线（无旋转 → 包围盒精确）；
     * 参考图发量整体偏角色左（+x），加宽右倾 */
    var cap = sph(0.185, 26, 20, M.hair, 0.02, 0.27, -0.03);
    cap.scale.set(1.2, 1.05, 1.0);
    hair.add(cap);
    /* 侧盖（连接发冠与后脑壳，盖耳上；角色左更饱满） */
    [[-0.145, 0.058, 0.9], [0.155, 0.07, 0.95]].forEach(function (q) {
      var side = sph(q[1], 16, 12, M.hair, q[0], 0.315, -0.025);
      side.scale.set(q[2], 1.1, 0.95);
      hair.add(side);
    });
    /* 后发脚发缕 v2（替换 v1 波浪环: 环侧向伸出脑后呈天线状 → 贴颈锥形缕两丝） */
    hair.add(taperedLock(
      [V3(0.105, 0.22, -0.085), V3(0.07, 0.13, -0.128), V3(0.025, 0.05, -0.102), V3(0.015, 0.0, -0.078)],
      0.014, 0.004, 0.3, 0.8, M.hair, 6, 12));
    hair.add(taperedLock(
      [V3(-0.09, 0.215, -0.075), V3(-0.055, 0.14, -0.112), V3(-0.02, 0.06, -0.088)],
      0.012, 0.004, 0.3, 0.8, M.hair, 6, 10));
    /* 双瓣盘发髻（identity 特征，参考图发髻偏角色左）+ 旋涡槽 + 高光条 */
    var bun = grp(hair, 0.04, 0.45, -0.012);
    var lobe1 = sph(0.085, 18, 14, M.hair, 0, 0.008, 0);
    lobe1.scale.set(1.12, 0.85, 0.96);
    bun.add(lobe1);
    var lobe2 = sph(0.066, 16, 12, M.hair, 0.022, 0.086, -0.004);
    lobe2.scale.set(1.06, 0.8, 0.92);
    bun.add(lobe2);
    /* 髻根填充 v2（弥合发髻与发冠之间的折痕） */
    hair.add(sph(0.048, 16, 12, M.hair, 0.045, 0.492, -0.01));
    var swirl1 = MS(new THREE.TorusGeometry(0.055, 0.0065, 6, 18), M.hairDark, 0, 0.012, 0.018);
    swirl1.rotation.x = 1.15; swirl1.rotation.y = 0.3;
    bun.add(swirl1);
    var swirl2 = MS(new THREE.TorusGeometry(0.034, 0.005, 6, 16), M.hairDark, 0.022, 0.088, 0.012);
    swirl2.rotation.x = 1.05; swirl2.rotation.y = -0.25;
    bun.add(swirl2);
    /* 顶心旋涡刻痕 v2（小环 + 暗色芯，世界 ≈1.633） */
    var whorl = MS(new THREE.TorusGeometry(0.018, 0.004, 6, 14), M.hairDark, 0.023, 0.081, 0.016);
    whorl.rotation.x = 1.35;
    bun.add(whorl);
    bun.add(sph(0.010, 12, 9, M.hairDark, 0.023, 0.083, 0.02));
    /* 髻身丝缕缠绕 v2: 4 条主缕绕主瓣 + 2 条绕副瓣（方向 = 参考图后→前→上旋） */
    function bunWrap(cx, cy, cz, rx, rz, yAmp, th0, thLen, w0, ptsN) {
      var pts = [];
      for (var k = 0; k <= ptsN; k++) {
        var th = th0 + (k / ptsN) * thLen;
        pts.push(V3(cx + Math.cos(th) * rx, cy + Math.sin(th) * yAmp, cz + Math.sin(th) * rz));
      }
      return taperedLock(pts, w0, 0.0035, 0.12, 0.8, M.hair, 6, 12);
    }
    [[0.0, 4.2], [1.6, 4.2], [3.2, 4.2], [4.8, 4.0]].forEach(function (q) {
      bun.add(bunWrap(0, 0.008, 0, 0.096, 0.084, 0.022, q[0], q[1], 0.011, 5));
    });
    [[0.8, 3.8], [2.6, 3.6]].forEach(function (q) {
      bun.add(bunWrap(0.022, 0.094, -0.004, 0.058, 0.05, 0.015, q[0], q[1], 0.008, 4));
    });
    /* 髻身高光条（v1 保留） */
    [[-0.028, 0.035, 0.032, 0.5], [0.038, 0.055, 0.028, -0.4], [0.006, 0.098, 0.026, 0.25]].forEach(function (q) {
      var streak = box(0.008, 0.048, 0.011, M.hairSheen, q[0], q[1], q[2]);
      streak.rotation.z = q[3];
      streak.rotation.x = 0.35;
      bun.add(streak);
    });
    /* 冠部贴发缕 v2: 分线(角色右上) → 后流 → 汇入发髻, 4 条 */
    hair.add(taperedLock(
      [V3(0.105, 0.335, 0.06), V3(0.075, 0.398, 0.02), V3(0.052, 0.435, -0.02), V3(0.048, 0.455, -0.036)],
      0.017, 0.004, 0.1, 0.7, M.hair, 6, 12));
    hair.add(taperedLock(
      [V3(0.125, 0.32, 0.0), V3(0.092, 0.39, -0.02), V3(0.07, 0.435, -0.036), V3(0.062, 0.452, -0.04)],
      0.014, 0.004, 0.1, 0.7, M.hair, 6, 10));
    hair.add(taperedLock(
      [V3(-0.06, 0.345, 0.07), V3(-0.02, 0.405, 0.0), V3(0.012, 0.442, -0.03), V3(0.032, 0.455, -0.04)],
      0.015, 0.004, 0.1, 0.7, M.hair, 6, 12));
    hair.add(taperedLock(
      [V3(-0.05, 0.375, -0.05), V3(0.0, 0.425, -0.052), V3(0.03, 0.452, -0.046)],
      0.013, 0.004, 0.1, 0.7, M.hair, 6, 10));
    /* 冠部顺流高光弧 v2（两条, 跟随丝缕走向） */
    [[0.045, 0.30, 0.28], [-0.035, 0.30, -0.22]].forEach(function (q) {
      var sh = MS(new THREE.TorusGeometry(0.105, 0.005, 6, 16, 1.1), M.hairSheen, 0.035, q[0], -0.012);
      sh.rotation.x = 1.32; sh.rotation.y = q[2];
      hair.add(sh);
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
    /* 刘海伴生细缕 v2（2 条, 强化丝缕走向） */
    hair.add(taperedLock(
      [V3(0.098, 0.352, 0.056), V3(0.042, 0.33, 0.1), V3(-0.04, 0.282, 0.114), V3(-0.082, 0.212, 0.094)],
      0.013, 0.004, 0.2, 0.5, M.hair, 6, 12));
    hair.add(taperedLock(
      [V3(0.108, 0.338, 0.02), V3(0.072, 0.288, 0.07), V3(0.03, 0.232, 0.09), V3(0.008, 0.192, 0.082)],
      0.011, 0.0035, 0.2, 0.5, M.hair, 6, 10));
    /* 鬓角小盖片（补帽缘与耳朵之间的缝，藏在发际线上方） */
    [[1], [-1]].forEach(function (s) {
      var tuft = sph(0.035, 16, 12, M.hair, 0.132 * s[0], 0.365, 0.035);
      tuft.scale.set(0.7, 0.85, 0.8);
      hair.add(tuft);
    });
    /* 垂落侧发（角色左长锁沿发缘卷到颈侧，角色右短锁掖进发后）+ 伴生细缕 v2 */
    var lockL = taperedLock(
      [V3(0.155, 0.19, 0.008), V3(0.165, 0.06, 0.022), V3(0.155, -0.07, 0.04), V3(0.125, -0.175, 0.055)],
      0.028, 0.01, 0.5, 0.8, M.hair, 7, 14);
    hair.add(lockL);
    hair.add(sph(0.012, 10, 8, M.hair, 0.123, -0.188, 0.058));
    hair.add(taperedLock(
      [V3(0.141, 0.18, 0.014), V3(0.15, 0.06, 0.028), V3(0.142, -0.06, 0.045), V3(0.117, -0.16, 0.058)],
      0.013, 0.004, 0.4, 0.8, M.hair, 6, 12));
    var lockR = taperedLock(
      [V3(-0.135, 0.18, 0), V3(-0.148, 0.075, 0.012), V3(-0.135, -0.005, 0.02)],
      0.018, 0.006, 0.4, 0.8, M.hair, 7, 12);
    hair.add(lockR);
    hair.add(taperedLock(
      [V3(-0.126, 0.17, 0.006), V3(-0.138, 0.08, 0.016), V3(-0.127, 0.0, 0.026)],
      0.01, 0.004, 0.3, 0.8, M.hair, 6, 10));
    /* 髻顶碎发 v2（2 条, 顶端 ≤ 局部 0.60 → 世界 ≤1.70） */
    hair.add(taperedLock(
      [V3(0.052, 0.528, 0.0), V3(0.082, 0.562, 0.012), V3(0.096, 0.592, 0.014)],
      0.005, 0.002, 0, 0.8, M.hair, 5, 8));
    hair.add(taperedLock(
      [V3(0.0, 0.535, -0.014), V3(-0.036, 0.568, -0.002), V3(-0.055, 0.598, 0.004)],
      0.005, 0.002, 0, 0.8, M.hair, 5, 8));

    /* =================================================================================
     * FORM —— 手臂（姿势烘入关节内的子枢轴，animToken 摆动时整体跟随）
     * armL 叉腰: 肩出 0.35 + 肘折 -1.68;  armR 内收 0.25 + 肘前折 -2.0 举计算器
     * v2: 袖口环 + 袖口扣
     * ================================================================================= */
    function buildArm(pose) {
      var upper = grp(this, 0, 0, 0);
      upper.rotation.z = pose.upperZ;
      upper.rotation.x = pose.upperX || 0;
      var ua = MS(new THREE.CapsuleGeometry(pose.uaR, pose.uaLen - pose.uaR * 2 + 0.02, 5, 12), M.suit, 0, -pose.uaLen * 0.5, 0);
      upper.add(ua);
      upper.add(cyl(pose.uaR + 0.005, pose.uaR + 0.005, 0.02, 12, M.suitDark, 0, -pose.uaLen + 0.012, 0));
      var elbow = grp(upper, 0, -pose.uaLen, 0);
      elbow.rotation.z = pose.elbowZ || 0;
      elbow.rotation.x = pose.elbowX || 0;
      var fa = MS(new THREE.CapsuleGeometry(pose.faR, pose.faLen - pose.faR * 2 + 0.02, 5, 12), M.suit, 0, -pose.faLen * 0.48, 0);
      elbow.add(fa);
      elbow.add(cyl(pose.faR - 0.002, pose.faR - 0.006, 0.025, 12, M.skin, 0, -pose.faLen + 0.022, 0));
      /* 袖口扣（袖口环外侧小圆扣） */
      var cb = cyl(0.0055, 0.0055, 0.006, 12, M.calc, 0, 0, 0);
      cb.rotation.z = Math.PI / 2;
      cb.position.set((pose.faR + 0.004) * pose.side, -pose.faLen + 0.035, 0.012);
      elbow.add(cb);
      var hand = sph(pose.handR, 16, 12, M.skin, 0, -pose.faLen - 0.008, 0);
      hand.scale.set(1.05, 0.8, 0.9);
      elbow.add(hand);
      return { upper: upper, elbow: elbow, hand: hand };
    }
    /* 左手叉腰（上臂内收贴合参考，肘仍在关节内侧形成叉腰三角） */
    var armLL = buildArm.call(armL, { upperZ: -0.28, uaR: 0.05, uaLen: 0.23, elbowZ: -0.664, faR: 0.042, faLen: 0.20, handR: 0.042, side: 1 });
    armLL.hand.scale.set(1.3, 0.55, 1.0);
    armLL.hand.position.set(0, -0.175, 0.02);
    /* 右手举计算器（肘前折 -2.0 → 计算器抬到脸侧，参考位 y≈0.93..1.03） */
    var armRR = buildArm.call(armR, { upperZ: 0.42, upperX: -0.10, uaR: 0.05, uaLen: 0.20, elbowX: -2.0, faR: 0.042, faLen: 0.20, handR: 0.042, side: -1 });
    armRR.hand.position.set(0, -0.20, 0.018);

    /* ---------------- 计算器 v2（identity 道具）: 深灰机身 + 凹槽屏 + 七段屏显 +
     * 太阳能条 + 4x3 浮雕按键（键座凹陷 + 键帽凸起, 第 3 列橙色） ---------------- */
    var calcG = grp(armRR.elbow, 0.015, -0.262, 0.05);
    calcG.rotation.x = -1.05;
    calcG.rotation.z = -0.22;
    calcG.add(box(0.148, 0.195, 0.038, M.calc, 0, 0, 0));
    calcG.add(box(0.156, 0.205, 0.012, M.calcLight, 0, 0, -0.020));
    /* 屏幕凹槽边圈 + LCD（128x64 七段屏显纹理）+ 太阳能充电条 */
    calcG.add(box(0.114, 0.048, 0.006, M.calcDark, 0, 0.056, 0.0225));
    calcG.add(box(0.102, 0.038, 0.008, M.lcd, 0, 0.056, 0.026));
    calcG.add(box(0.013, 0.038, 0.006, M.calcDark, -0.067, 0.056, 0.024));
    /* 浮雕按键: 键座(凹) + 键帽(凸) */
    var rows = [-0.002, -0.036, -0.070, -0.104];
    var cols = [-0.043, 0, 0.043];
    for (var r = 0; r < rows.length; r++) {
      for (var c = 0; c < 3; c++) {
        var mButton = (c === 2) ? M.btnOrange : ((r + c) % 2 ? M.btnGrey : M.btnLight);
        calcG.add(box(0.030, 0.026, 0.005, M.calcDark, cols[c], rows[r], 0.0205));
        calcG.add(box(0.024, 0.020, 0.013, mButton, cols[c], rows[r], 0.0245));
      }
    }

    /* =================================================================================
     * FORM —— 腿: 纤细裸腿（关节内强内倾向参考的并拢腿位）+ 紫色细跟高跟鞋 v2
     * 鞋底到关节 -0.5; v2 鞋口滚边/围口线/跟梢帽/跟阜/底沿
     * ================================================================================= */
    [[legL, 1, 0.12], [legR, -1, -0.12]].forEach(function (cfg) {
      var leg = cfg[0], s = cfg[1], toeOut = cfg[2];
      var dx = -0.105 * s;    /* 大腿中心 → 世界 ±0.045 */
      var dx2 = -0.125 * s;   /* 膝/小腿 → 世界 ±0.025 */
      var dx3 = -0.14 * s;    /* 踝/足 → 世界 ±0.01 */
      var thigh = MS(new THREE.CapsuleGeometry(0.045, 0.15, 5, 12), M.skin, dx, -0.125, 0);
      leg.add(thigh);
      leg.add(sph(0.038, 16, 12, M.skin, dx2, -0.222, 0.004));
      var calf = MS(new THREE.CapsuleGeometry(0.034, 0.12, 5, 12), M.skin, dx2, -0.30, -0.004);
      leg.add(calf);
      var calfBulge = sph(0.033, 16, 12, M.skin, dx2, -0.295, -0.018);
      calfBulge.scale.set(1, 1.5, 1.05);
      leg.add(calfBulge);
      leg.add(sph(0.023, 16, 12, M.skin, dx3 + 0.006 * s, -0.418, 0.002));
      /* 高跟鞋（指向 +z 外旋 toeOut） */
      var pump = grp(leg, dx3, 0, 0);
      pump.rotation.y = toeOut;
      var foot = sph(0.04, 16, 12, M.shoe, 0, -0.468, 0.04);
      foot.scale.set(0.85, 0.5, 1.6);
      pump.add(foot);
      var toe = MS(new THREE.ConeGeometry(0.032, 0.1, 12), M.shoe, 0, -0.47, 0.115);
      toe.rotation.x = Math.PI / 2;
      toe.scale.set(1, 1, 0.72);
      pump.add(toe);
      pump.add(box(0.05, 0.018, 0.08, M.shoe, 0, -0.44, 0.04));
      /* v2 鞋口滚边 + 跗面围口线 */
      var topline = MS(new THREE.TorusGeometry(0.017, 0.0032, 6, 12, 1.5), M.shoeDark, 0, -0.4255, -0.008);
      topline.rotation.x = 1.45;
      pump.add(topline);
      var throat = MS(new THREE.TorusGeometry(0.024, 0.0038, 6, 14, 1.7), M.shoeDark, 0, -0.4435, 0.062);
      throat.rotation.x = 1.25;
      pump.add(throat);
      /* 细跟（缩短让位梢帽, 前移贴足弓）+ 梢帽 + 跟阜（加宽桥接足弓） */
      pump.add(cyl(0.008, 0.0095, 0.066, 12, M.shoe, 0, -0.452, -0.048));
      pump.add(cyl(0.008, 0.006, 0.016, 12, M.shoeDark, 0, -0.492, -0.048));
      var breast = box(0.02, 0.032, 0.016, M.shoe, 0, -0.468, -0.034);
      breast.rotation.x = 0.55;
      pump.add(breast);
      pump.add(sph(0.015, 12, 9, M.shoe, 0, -0.436, -0.046));
      /* 鞋底 + 底沿（深色沿边, 略宽于底） */
      pump.add(box(0.046, 0.009, 0.14, M.shoe, 0, -0.494, 0.035));
      pump.add(box(0.052, 0.006, 0.146, M.shoeDark, 0, -0.4955, 0.033));
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
      /* 发髻微晃（迟滞弹簧感）+ 发冠整壳随动（幅度克制 ≤0.3rad） */
      function (t) {
        bun.rotation.x = Math.sin(t * 1.9 + 0.55) * 0.032;
        bun.rotation.z = Math.sin(t * 1.35 + 0.2) * 0.02;
        lobe2.position.y = 0.086 + Math.sin(t * 1.9 + 0.7) * 0.0015;
        hair.rotation.x = Math.sin(t * 1.9 + 0.4) * 0.012;
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
      /* 计算器随手部微浮 + LCD 辉光呼吸（≤0.06）+ 侧发摆 */
      function (t) {
        calcG.position.y = -0.262 + Math.sin(t * 1.9 + 0.3) * 0.004;
        calcG.rotation.z = -0.22 + Math.sin(t * 1.9 + 0.5) * 0.012;
        M.lcd.emissiveIntensity = 0.15 + (Math.sin(t * 2.3) * 0.5 + 0.5) * 0.06;
        lockL.rotation.x = Math.sin(t * 1.15) * 0.045;
        lockR.rotation.x = Math.sin(t * 1.15 + 0.8) * 0.03;
      }
    ];

    g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };
    return g;
  };
})();
