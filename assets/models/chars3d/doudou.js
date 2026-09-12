/* =====================================================================================
 * doudou 豆豆（AI 投资人机器人）—— img2threejs 精细重建（对照 refs/char_doudou.png 三视图转台）
 * 设计权威: D:/minimax/f1/doudou_pipe/object-sculpt-spec.json（strict-quality 校验通过）
 *           比例/配色取自参考图像素实测（doudou_pipe/measure3.py + 三视图放大裁片）
 *
 * 装配契约（view3d.js animToken 按此硬驱动，位置必须精确）:
 *   根 Group，正面朝 +z，Y 上，角色自身左侧 = +x
 *   g.userData.parts = { head, torso, armL, armR, legL, legR }  全部为 Group 关节:
 *     legL/legR (±0.16, 0.5, 0)   torso (0, 0.52, 0)
 *     armL/armR (±0.35, 1.0, 0)   head  (0, 1.1, 0)
 *   整体身高 ≈ 1.745（天线球顶点；外部再乘 1.08）
 *   g.userData.anim = [fn(t, dt), ...] —— 只动契约关节之外的内节点
 *   （view3d 每帧覆写六关节 rotation/position，故静姿外张角烘在关节内子枢轴 shoulderPivot）
 *
 * 形象要点（对照参考图前视像素实测）: Q 版机器人 ~2.9 头身；方圆 squircle 大头（0.60w，
 * 契约归一化后占身高 ~30%，参考原始 34%）；黑色玻璃面屏凸出颅面（几何求交生成蓝色包边
 * 读感）+ 青色竖椭圆发光双眼（泛光晕 + 白热高光点）+ 青色微笑弧；顶部锥座 + 锥形杆 +
 * 蓝球天线（1.75 身高预算内较参考缩短，spec compromises 已记录）；两侧银色耳环舱（插座/
 * 银环/同心环/银盖四层）；胸甲蓝壳 + 银色圆角边框内青色发光屏（白热核心 + 扫描线 Canvas）
 * + 边框四角螺钉 + 右下状态指示灯；深灰枪色机械关节（肩球/上臂/肘球/腕环）+ 亮蓝前臂舱
 * （外侧碟形螺栓）+ 三指深灰手套；深灰裤裆块 + 蓝髋球 + 侧碟钉；短腿蓝膝球 + 大蓝靴
 * （外踝碟钉 + 鞋跟条 + 鞋头缝弧 + 深灰鞋底踏板，鞋底精确到关节内 y=-0.4985≈-0.5 触地）。
 * ===================================================================================== */
(function () {
  'use strict';
  window.Char3D = window.Char3D || {};

  function std(hex, o) {
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex).convertSRGBToLinear(),
      roughness: o.rough !== undefined ? o.rough : 0.5,
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
  function tor(R, tube, mat, arc) { return MS(new THREE.TorusGeometry(R, tube, 8, 24, arc || Math.PI * 2), mat, 0, 0, 0); }
  function grp(parent, x, y, z) {
    var g = new THREE.Group();
    g.position.set(x || 0, y || 0, z || 0);
    parent.add(g);
    return g;
  }

  /* 超椭圆壳（squircle）: 单位球顶点按 |x/a|^n+|y/b|^n+|z/c|^n=1 重映射，
   * n=2.4~3.4 给出参考图的玩具方圆轮廓（纯椭球太圆，盒体太方） */
  function squircle(a, b, c, n, ws, hs, mat, x, y, z) {
    var geo = new THREE.SphereGeometry(1, ws || 26, hs || 20);
    var pos = geo.attributes.position;
    var e = 2 / n;
    for (var i = 0; i < pos.count; i++) {
      var vx = pos.getX(i), vy = pos.getY(i), vz = pos.getZ(i);
      pos.setXYZ(i,
        a * Math.sign(vx) * Math.pow(Math.abs(vx), e),
        b * Math.sign(vy) * Math.pow(Math.abs(vy), e),
        c * Math.sign(vz) * Math.pow(Math.abs(vz), e));
    }
    geo.computeVertexNormals();
    var m = new THREE.Mesh(geo, mat);
    m.position.set(x || 0, y || 0, z || 0);
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  /* 超椭球面上取点（方向 d 投影到壳面再外扩 k），用于贴合壳体的缝线管 */
  function surfPt(a, b, c, n, dx, dy, dz, k) {
    var e = 2 / n, ax = Math.abs(dx), ay = Math.abs(dy), az = Math.abs(dz);
    return new THREE.Vector3(
      a * Math.sign(dx) * Math.pow(ax, e) * k,
      b * Math.sign(dy) * Math.pow(ay, e) * k,
      c * Math.sign(dz) * Math.pow(az, e) * k);
  }
  /* 面板缝线: 贴壳面管（CatmullRom + Tube），dirs 为单位球方向控制点 */
  function seamTube(a, b, c, n, dirs, mat, k) {
    var pts = [];
    for (var i = 0; i < dirs.length; i++) {
      pts.push(surfPt(a, b, c, n, dirs[i][0], dirs[i][1], dirs[i][2], k || 1.006));
    }
    var geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 12, 0.0042, 6, false);
    var m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  }

  /* 胸屏扫描线纹理（64x64 Canvas 程序化，节点环境自动降级为纯色） */
  function screenTexture() {
    try {
      var cv = document.createElement('canvas');
      cv.width = 64; cv.height = 64;
      var ctx = cv.getContext('2d');
      if (!ctx || !ctx.fillRect) return null;
      var grd = ctx.createRadialGradient(32, 30, 4, 32, 32, 40);
      grd.addColorStop(0, '#eaffff');
      grd.addColorStop(0.55, '#7df6ff');
      grd.addColorStop(1, '#18c9de');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillStyle = 'rgba(10,90,110,0.35)';
      for (var y = 3; y < 64; y += 5) ctx.fillRect(0, y, 64, 1);
      return new THREE.CanvasTexture(cv);
    } catch (e) { return null; }
  }

  window.Char3D.doudou = function () {
    var g = new THREE.Group();
    g.name = 'doudou';

    /* ---------------- 材质（调色板取自参考图像素采样，全部 convertSRGBToLinear） ---------------- */
    var M = {
      shell: std('#3a78c8', { rough: 0.32, metal: 0.25 }),     /* 头/胸甲壳蓝 */
      limb: std('#4790dd', { rough: 0.32, metal: 0.25 }),      /* 四肢亮蓝 */
      ball: std('#57a2ea', { rough: 0.28, metal: 0.25 }),      /* 天线球 */
      dark: std('#3a4250', { rough: 0.42, metal: 0.62 }),      /* 枪色关节 */
      sole: std('#2e3742', { rough: 0.5, metal: 0.55 }),       /* 深灰底座/缝线 */
      silver: std('#c3cdd8', { rough: 0.32, metal: 0.6 }),     /* 银环/边框 */
      glass: std('#0d1118', { rough: 0.14, metal: 0.3 }),      /* 面屏黑玻璃 */
      glow: std('#0a3a44', { rough: 0.35, emissive: '#46f2ff', ei: 1.8 }),   /* 青色发光 */
      hot: std('#203038', { rough: 0.3, emissive: '#e4ffff', ei: 2.1 })      /* 白热核心 */
    };
    var screenMat = std('#18c9de', { rough: 0.25, emissive: '#46f2ff', ei: 1.7 });
    var screenTex = screenTexture();
    if (screenTex) screenMat.map = screenTex;
    var haloMat = std('#46f2ff', { rough: 0.4, emissive: '#46f2ff', ei: 1.2, opacity: 0.22 });

    /* =================================================================================
     * BLOCKOUT —— 六关节骨架（契约位置）；静姿角全部烘在关节内子枢轴
     * ================================================================================= */
    var legL = grp(g, 0.16, 0.5, 0); legL.name = 'legL';
    var legR = grp(g, -0.16, 0.5, 0); legR.name = 'legR';
    var torso = grp(g, 0, 0.52, 0); torso.name = 'torso';
    var armL = grp(g, 0.35, 1.0, 0); armL.name = 'armL';
    var armR = grp(g, -0.35, 1.0, 0); armR.name = 'armR';
    var head = grp(g, 0, 1.1, 0); head.name = 'head';

    /* =================================================================================
     * STRUCTURE / FORM —— 头部（head 局部，世界 = 局部 + 1.1; 颅心 ≈ 局部 0.262）
     * 参考实测: 颅宽/颅高 1.22，面屏可见宽 ≈0.41u 居中，双眼 ±0.102，微笑弧居中偏下
     * ================================================================================= */
    var A = 0.315, B = 0.248, C = 0.29, N = 2.6;   /* 颅壳超椭球参数（缝线共用） */
    head.add(squircle(A, B, C, N, 28, 22, M.shell, 0, 0.262, 0.005));
    /* 冠部面板缝线（贴壳面管: 前左/前右越过头顶角落，后左/后右对称） */
    head.add(seamTube(A, B, C, N, [[0.06, 0.99, 0.28], [0.30, 0.88, 0.42], [0.60, 0.62, 0.50], [0.78, 0.30, 0.46]], M.sole));
    head.add(seamTube(A, B, C, N, [[-0.06, 0.99, 0.28], [-0.30, 0.88, 0.42], [-0.60, 0.62, 0.50], [-0.78, 0.30, 0.46]], M.sole));
    head.add(seamTube(A, B, C, N, [[0.06, 0.99, -0.24], [0.30, 0.88, -0.40], [0.58, 0.60, -0.52], [0.76, 0.28, -0.56]], M.sole));
    head.add(seamTube(A, B, C, N, [[-0.06, 0.99, -0.24], [-0.30, 0.88, -0.40], [-0.58, 0.60, -0.52], [-0.76, 0.28, -0.56]], M.sole));
    /* 面屏: 黑玻璃超椭球凸出颅面 0.02 → 与蓝壳求交生成内嵌 + 蓝色包边读感 */
    head.add(squircle(0.195, 0.14, 0.06, 3.2, 26, 18, M.glass, 0, 0.268, 0.252));
    /* 双眼: 青色竖椭圆发光体贴屏面 + 泛光晕壳 + 白热高光点（镜像对: 仅取反 x） */
    var eyeDefs = [];
    [[1], [-1]].forEach(function (s) {
      var eye = sph(0.048, 14, 12, M.glow, 0.106 * s[0], 0.30, 0.312);
      eye.scale.set(0.8, 1.12, 0.28);
      head.add(eye);
      var halo = sph(0.055, 12, 10, haloMat, 0.108 * s[0], 0.30, 0.31);
      halo.scale.set(0.9, 1.25, 0.22);
      head.add(halo);
      var spark = sph(0.011, 8, 6, M.hot, 0.106 * s[0] + 0.013 * s[0], 0.32, 0.326);
      head.add(spark);
      eyeDefs.push({ m: eye, base: 1.12 }, { m: halo, base: 1.25 });
    });
    /* 微笑弧（青色发光圆环弧，开口向上，贴屏面） */
    var mouth = tor(0.052, 0.0085, M.glow, 1.05);
    mouth.rotation.x = -0.12;
    mouth.rotation.z = -Math.PI / 2 - 0.525;
    mouth.position.set(0, 0.262, 0.313);
    head.add(mouth);
    /* 面屏右上高光斜条（玻璃反射读感） */
    var sheen = sph(0.02, 8, 6, std('#e8f4ff', { rough: 0.2, opacity: 0.75 }), 0.055, 0.36, 0.312);
    sheen.scale.set(1.7, 0.5, 0.3);
    sheen.rotation.z = 0.4;
    head.add(sheen);
    /* 两侧耳舱: 深色插座 + 银环 + 同心深环 + 银盖（轴 X 堆叠，镜像对） */
    [[1], [-1]].forEach(function (s) {
      var socket = cyl(0.11, 0.11, 0.055, 20, M.dark, 0.315 * s[0], 0.262, 0.005);
      socket.rotation.z = Math.PI / 2;
      head.add(socket);
      var ring = tor(0.078, 0.027, M.silver);
      ring.rotation.y = Math.PI / 2;
      ring.position.set(0.348 * s[0], 0.262, 0.005);
      head.add(ring);
      var ring2 = tor(0.048, 0.010, M.sole);
      ring2.rotation.y = Math.PI / 2;
      ring2.position.set(0.368 * s[0], 0.262, 0.005);
      head.add(ring2);
      var cap = cyl(0.054, 0.054, 0.016, 16, M.silver, 0.369 * s[0], 0.262, 0.005);
      cap.rotation.z = Math.PI / 2;
      head.add(cap);
    });
    /* 天线: 深灰锥座 + 锥形杆 + 领环 + 蓝球（球顶世界 1.745 = 身高预算顶）
     * 参考天线比例被 1.75 身高上限压缩（spec compromises 已记录） */
    head.add(cyl(0.024, 0.052, 0.042, 12, M.dark, 0, 0.529, -0.01));
    var stem = cyl(0.011, 0.017, 0.062, 10, M.dark, 0, 0.576, -0.01);
    head.add(stem);
    var collar = tor(0.019, 0.006, M.sole);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.556, -0.01);
    head.add(collar);
    var ballMesh = sph(0.044, 16, 12, M.ball, 0, 0.601, -0.01);
    head.add(ballMesh);
    var ballSpot = sph(0.011, 8, 6, std('#dceeff', { rough: 0.25 }), 0.016, 0.617, 0.022);
    head.add(ballSpot);

    /* =================================================================================
     * STRUCTURE / FORM —— 躯干（torso 局部，世界 = 局部 + 0.52）
     * 胸甲 squircle 0.47w @世界0.82; 银框 + 青屏 + 白热核心 + 螺钉 + 状态灯;
     * 深灰裤裆块 + 蓝髋球 + 侧碟钉; 背板衬圈 + 圆角面板 + 三槽阵列
     * ================================================================================= */
    torso.add(cyl(0.078, 0.084, 0.13, 14, M.dark, 0, 0.545, 0.005));          /* 颈柱 */
    var collarRing = tor(0.082, 0.011, M.sole);
    collarRing.rotation.x = Math.PI / 2;
    collarRing.position.set(0, 0.492, 0.005);
    torso.add(collarRing);
    var chest = squircle(0.235, 0.225, 0.205, 2.8, 26, 20, M.shell, 0, 0.30, 0);
    torso.add(chest);
    /* 胸屏: 银色圆角边框（中心略凸 0.002 露出屏玻璃）+ 扫描线青屏 + 白热核心 + 四角螺钉 */
    torso.add(squircle(0.158, 0.128, 0.05, 3.0, 22, 16, M.silver, 0, 0.335, 0.168));
    torso.add(squircle(0.132, 0.106, 0.036, 3.2, 22, 16, screenMat, 0, 0.335, 0.186));
    var core = sph(0.075, 14, 10, M.hot, 0, 0.338, 0.205);
    core.scale.set(1.12, 0.78, 0.28);
    torso.add(core);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
      var screw = cyl(0.011, 0.011, 0.014, 8, M.silver, 0.105 * q[0], 0.335 + 0.09 * q[1], 0.202);
      screw.rotation.x = Math.PI / 2;
      torso.add(screw);
    });
    /* 状态指示灯（右下，周期闪烁）+ 银色底圈 */
    var dot = sph(0.016, 10, 8, std('#0a3a44', { rough: 0.35, emissive: '#46f2ff', ei: 1.9 }), 0.15, 0.208, 0.183);
    torso.add(dot);
    var dotRing = tor(0.021, 0.005, M.silver);
    dotRing.position.set(0.15, 0.208, 0.176);
    torso.add(dotRing);
    /* 深灰裤裆块（上缘槽线）+ 蓝髋球 + 侧碟钉 */
    torso.add(squircle(0.185, 0.112, 0.16, 2.9, 22, 16, M.dark, 0, 0.118, -0.005));
    torso.add(box(0.21, 0.013, 0.02, M.sole, 0, 0.185, 0.152));
    torso.add(sph(0.009, 8, 6, M.silver, 0.062, 0.095, 0.152));
    torso.add(sph(0.009, 8, 6, M.silver, -0.062, 0.095, 0.152));
    [[1], [-1]].forEach(function (s) {
      torso.add(sph(0.072, 14, 10, M.limb, 0.165 * s[0], 0.155, 0));
      var hipBolt = cyl(0.026, 0.026, 0.012, 10, M.sole, 0.216 * s[0], 0.155, 0);
      hipBolt.rotation.z = Math.PI / 2;
      torso.add(hipBolt);
    });
    /* 背板: 深灰衬圈（细边读感）+ 蓝色圆角面板 + 三槽阵列（背部细节，参考背视图） */
    torso.add(squircle(0.163, 0.133, 0.03, 3.0, 20, 16, M.sole, 0, 0.30, -0.180));
    torso.add(squircle(0.152, 0.122, 0.026, 3.0, 20, 16, M.shell, 0, 0.30, -0.186));
    [-0.055, 0, 0.055].forEach(function (vx) {
      torso.add(box(0.032, 0.018, 0.012, M.sole, vx, 0.152, -0.196));
    });

    /* =================================================================================
     * FORM —— 手臂（肩球→枪色上臂→肘球→亮蓝前臂舱→三指手套）
     * 静姿外张角烘在 shoulderPivot（view3d 每帧覆写关节 rotation，不能放关节上）
     * 掌缘 ≈ 关节内 -0.345（契约 ≈ -0.32），指尖到 -0.42
     * ================================================================================= */
    function buildArm(s) {
      var pivot = grp(this, 0, 0, 0);
      pivot.name = 'shoulderPivot';
      pivot.rotation.z = 0.14 * s;
      pivot.add(sph(0.09, 16, 12, M.limb, 0, -0.03, 0));
      var shoulderBolt = cyl(0.03, 0.03, 0.014, 10, M.silver, 0.084 * s, -0.03, 0);
      shoulderBolt.rotation.z = Math.PI / 2;
      pivot.add(shoulderBolt);
      pivot.add(MS(new THREE.CapsuleGeometry(0.056, 0.06, 4, 12), M.dark, 0, -0.098, 0));
      var groove = tor(0.052, 0.0075, M.sole);
      groove.rotation.x = Math.PI / 2;
      groove.position.set(0, -0.1, 0);
      pivot.add(groove);
      pivot.add(sph(0.062, 14, 10, M.dark, 0, -0.165, 0));
      var cuff = tor(0.078, 0.009, M.dark);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.set(0, -0.172, 0.004);
      pivot.add(cuff);
      pivot.add(squircle(0.092, 0.078, 0.088, 2.7, 20, 16, M.limb, 0, -0.235, 0.004));
      var disc = cyl(0.032, 0.032, 0.014, 10, M.sole, 0.09 * s, -0.222, 0.014);
      disc.rotation.z = Math.PI / 2;
      pivot.add(disc);
      var wrist = tor(0.058, 0.0085, M.sole);
      wrist.rotation.x = Math.PI / 2;
      wrist.position.set(0, -0.315, 0.004);
      pivot.add(wrist);
      pivot.add(squircle(0.063, 0.047, 0.057, 2.4, 16, 12, M.dark, 0, -0.35, 0.008));
      [-0.029, 0, 0.029].forEach(function (fx) {
        pivot.add(MS(new THREE.CapsuleGeometry(0.015, 0.032, 3, 8), M.dark, fx, -0.402, 0.012));
      });
      var thumb = MS(new THREE.CapsuleGeometry(0.014, 0.028, 3, 8), M.dark, -0.054 * s, -0.357, 0.026);
      thumb.rotation.z = 0.55 * s;
      thumb.rotation.x = 0.25;
      pivot.add(thumb);
      return pivot;
    }
    buildArm.call(armL, 1);
    buildArm.call(armR, -1);

    /* =================================================================================
     * FORM —— 腿（蓝髋球→枪色大腿→蓝膝球→大蓝靴→深灰鞋底 y≈-0.5 触地）
     * 参考实测: 靴宽 0.26 深 0.33 高 0.245，膝球大而醒目
     * ================================================================================= */
    function buildLeg(s) {
      var leg = this;
      leg.add(sph(0.08, 14, 10, M.limb, 0, -0.015, 0));
      leg.add(MS(new THREE.CapsuleGeometry(0.06, 0.03, 4, 12), M.dark, 0, -0.09, 0));
      leg.add(sph(0.095, 16, 12, M.limb, 0, -0.185, 0));
      leg.add(squircle(0.142, 0.115, 0.172, 2.8, 22, 16, M.limb, 0, -0.345, 0.015));
      var toe = sph(0.1, 16, 12, M.limb, 0, -0.418, 0.098);
      toe.scale.set(1.05, 0.58, 1.0);
      leg.add(toe);
      /* 鞋头缝线弧 + 外踝碟钉 + 内踝螺栓 + 鞋跟条 */
      var toeSeam = tor(0.09, 0.005, M.sole, Math.PI * 0.85);
      toeSeam.rotation.x = 1.35;
      toeSeam.position.set(0, -0.396, 0.102);
      leg.add(toeSeam);
      var ankleDisc = cyl(0.036, 0.036, 0.016, 10, M.sole, 0.132 * s, -0.318, 0.02);
      ankleDisc.rotation.z = Math.PI / 2;
      leg.add(ankleDisc);
      var ankleBolt = cyl(0.022, 0.022, 0.012, 8, M.sole, -0.132 * s, -0.318, 0.02);
      ankleBolt.rotation.z = Math.PI / 2;
      leg.add(ankleBolt);
      leg.add(box(0.168, 0.045, 0.028, M.sole, 0, -0.446, -0.118));
      /* 鞋底踏板（底面 -0.499 ≈ -0.5 触地）+ 两道踏纹 */
      leg.add(squircle(0.14, 0.0295, 0.175, 3.4, 20, 10, M.sole, 0, -0.4695, 0.015));
      [-0.034, 0.05].forEach(function (tx) {
        leg.add(box(0.032, 0.014, 0.255, M.dark, tx, -0.485, 0.015));
      });
    }
    buildLeg.call(legL, 1);
    buildLeg.call(legR, -1);

    /* =================================================================================
     * INTERACTION —— 待机动画（只动内节点，六关节留给 view3d.animToken）
     * ================================================================================= */
    var chestBaseX = chest.scale.x, chestBaseY = chest.scale.y, chestBaseZ = chest.scale.z;
    var dotBaseEi = dot.material.emissiveIntensity;
    g.userData.anim = [
      /* 胸屏呼吸脉冲 + 白热核心同步（AI 算力感） */
      function (t) {
        var b = 0.5 + 0.5 * Math.sin(t * 1.4);
        screenMat.emissiveIntensity = 1.45 + b * 0.55;
        M.hot.emissiveIntensity = 1.9 + b * 0.45;
      },
      /* 眼部呼吸灯 + 约 4.6s 一次的双目快眨（scale.y 压扁，泛光晕同步） */
      (function () {
        var period = 4.6, close = 0.14;
        return function (t) {
          M.glow.emissiveIntensity = 1.62 + Math.sin(t * 2.1) * 0.32;
          var ph = t % period;
          var k = ph < close ? Math.sin(ph / close * Math.PI) : 0;
          for (var i = 0; i < eyeDefs.length; i++) {
            eyeDefs[i].m.scale.y = eyeDefs[i].base * (1 - 0.92 * k);
          }
        };
      })(),
      /* 天线球浮动 + 杆部迟滞摆动（雷达扫描感，幅度克制） */
      function (t) {
        var sway = Math.sin(t * 2.4 + 0.6) * 0.05;
        ballMesh.position.y = 0.601 + Math.sin(t * 2.4) * 0.006;
        ballMesh.position.x = sway * 0.08;
        ballSpot.position.y = ballMesh.position.y + 0.016;
        ballSpot.position.x = ballMesh.position.x + 0.016;
        stem.rotation.z = sway;
        collar.rotation.z = sway * 0.6;
      },
      /* 状态指示灯周期闪烁（短亮长灭） */
      function (t) {
        var ph = t % 2.4;
        dot.material.emissiveIntensity = ph < 0.12 ? dotBaseEi : (ph < 0.24 ? dotBaseEi * (0.24 - ph) / 0.12 * 0.5 : dotBaseEi * 0.12);
      },
      /* 胸甲微呼吸（scale ±0.4%，不触关节） */
      function (t) {
        var b = Math.sin(t * 1.9) * 0.004;
        chest.scale.set(chestBaseX * (1 + b), chestBaseY * (1 + b), chestBaseZ * (1 + b * 0.6));
      }
    ];

    g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };
    return g;
  };
})();
