/* =====================================================================================
 * doudou 豆豆（AI 投资人机器人）—— v3 深度精修（对齐 full3_doudou.png 立绘 + refs/char_doudou.png 转台）
 * v2 → v3 差距清单与清偿（用户评分 75 → 目标 95；立绘为对齐基准，转台为结构基准）：
 *   [G1] 面屏尺寸：v2 0.39×0.28 ＜ 立绘 0.55×0.45 / 转台 0.50×0.35 → 放大到 0.45×0.32（仍嵌于颅壳内）
 *        + 立绘可见的银白色屏框（squircle 内嵌，边缘出壳 ≈0.02 形成银框读感）
 *   [G2] 眼睛辉光：v2 小竖椭圆 + 单层光晕球 → 眼核放大 (0.104×0.127) + 径向渐变 alphaMap 光晕圆盘
 *        (128px Canvas, 眼间距 ±0.106→±0.118) + 光晕壳 + 白热高光 + 暗青瞳心（立绘环状眼读感）；眨眼同步
 *   [G3] 眉弧：立绘面屏上方有两道青色眉弧 → 新增发光 torus 弧 ×2（内低外高微挑）
 *   [G4] 天线球发光：立绘球体带辉光、杆底有青色光点 → 球材质加蓝色自发光 + 透明光晕球 + 杆底青色光环
 *   [G5] 胸屏内容：v2 静态浮雕 + 白热核心遮住屏心 → 512px 周期化行情纹理（8 行滚动数字 ¥/% + 柱图 +
 *        扫描线，offset.y 动画滚动，repeat.x=2 让整幅落在正面）；白热核心改为挤出心形（同材质同脉冲）
 *   [G6] 躯干银白色：立绘躯干为银白壳 → 新增银白色前胸甲板（嵌于蓝壳前面，边缘齐平），
 *        屏组件整体前移 0.02 落在甲板之上；蓝壳/背板保留（背视仍为转台的蓝色）
 *   [G7] 关节银色环缝：上臂/袖口/腕 + 膝 + 靴口 + 髋销 各加银色细环（每侧 6 道）
 *   [G8] 手指分节：三指各加远节 + 指关节球，拇指加远节（指尖 -0.402 → -0.42，仍在契约带外收）
 *   [G9] 脚部：足底青色发光条（沿鞋底上缘）+ 银色鞋底沿板 + 后跟滚轮 + 银轴
 *   [G10] 颈部：立绘头底为宽银白环 + 颈部青光 → 头底银白 torus 环 + 颈青色发光环
 *   [G11] 外壳高光过渡：壳/四肢/球 roughness 0.32→0.26 + 256px 竖向明暗渐变贴图（顶亮底暗 22%）
 *   [G12] 耳舱：舱心加青色指示灯 ×2
 *   动画 6 → 9 条（新增 屏幕滚动 / 天线球辉光呼吸 / 足底光条呼吸，emissive 波动 ≤0.25）
 *   预算 141 → ≤240（实测见 smoke）；六关节契约、身高 ≤1.75、贴地、朝向不变
 *
 * v1 → v2 精修清单（差距逐条清偿，见任务书第五节汇报）:
 *   [F1] 冠部缝线 v1 缺颅心 +0.262 偏移整体埋入壳内不可见 → 修正偏移，缝线上浮贴壳；
 *        并按参考图补左右侧横缝 + 后脑横缝（7 道缝线管全周覆盖）
 *   [F2] 耳环舱四层堆叠精修: 银色法兰+银圆弧缘 → 枪色台阶环 → 枪色舱盖 → 深色凹心，
 *        法兰面 4 银色球螺栓（参考侧视/前视的四层同心读感）
 *   [F3] 肩/肘/腕环关节分段环: 上臂双波纹环 + 肘领环 + 腕双环（参考上臂 2-3 道波纹）
 *   [F4] 胸屏边框分层与图标浮雕: 银框外台级 → 暗色内衬环(scaled torus) → 玻璃屏内收 →
 *        白热核心；256px Canvas 浮雕图标（柱状图 + 仪表环 + 状态条，明暗双描边）
 *   [F5] 脚底踏纹: v1 踏纹盒被鞋底实体包住不可见 → 三道横踏纹凸出鞋底底面 0.0075，
 *        踏纹底面精确 y=-0.5 触地
 *   [F6] 天线节点: 基座法兰盘 + 杆部双领环（枪色/银色）+ 球下颈环，球顶仍 1.745 预算内
 *   [F7] 背板细边与卡槽: 面板四段内嵌回字细边 + 中央卡槽（槽体+双银导轨）+
 *        通风槽阵列上移贴板（v1 槽位悬空盆部高度一并修复）
 *   [F8] 靴筒竖缝线管（贴靴面曲线 Tube，参考靴筒正面竖缝）
 *   [F9] 胸屏四角螺钉 z 上浮出框（v1 螺钉埋进银框不可见）
 *   [F10] 手部收紧进契约带: 掌心 -0.335 / 指尖 -0.402（v1 -0.35/-0.433）
 *   动画 5 → 6 条（新增天线球信标呼吸，emissive 波动 ≤0.22）
 *
 * 装配契约（view3d.js animToken 按此硬驱动，位置必须精确）:
 *   根 Group，正面朝 +z，Y 上，角色自身左侧 = +x
 *   g.userData.parts = { head, torso, armL, armR, legL, legR }  全部为 Group 关节:
 *     legL/legR (±0.16, 0.5, 0)   torso (0, 0.52, 0)
 *     armL/armR (±0.35, 1.0, 0)   head  (0, 1.1, 0)
 *   整体身高 ≈ 1.745（天线球顶点；光晕壳随球浮动仍 ≤1.75；外部再乘 1.08）
 *   g.userData.anim = [fn(t, dt), ...] —— 只动契约关节之外的内节点（v3 共 9 条）
 *
 * 形象要点: Q 版 ~2.9 头身；squircle 大头 + 银白屏框 + 黑玻璃大面屏（0.45×0.32）+ 青色辉光大眼
 * （eye 核 + 径向光晕盘 + 晕壳）/ 眉弧 / 微笑；银色耳环舱四层堆叠 + 青色舱灯；锥座+法兰+锥形杆+
 * 双领环+青光环+自发光蓝球天线（光晕壳）；头底银白环；银白前胸甲板 + 银框滚动行情屏（心形热核 +
 * 四角螺钉 + 状态灯）+ 颈青光环；枪色机械关节 + 银色环缝（上臂/袖口/腕/膝/靴口/髋）+ 亮蓝前臂舱
 * （凹座螺栓）+ 三指分节手套（指关节球 + 前卷远节 + 两节拇指）；深灰裤裆（U 形槽线）+ 蓝髋球 + 外露
 * 碟钉；大蓝靴（竖缝+鞋头缝弧+踝碟钉+鞋跟条+踏纹鞋底）+ 足底青色光条 + 银色沿板 + 后跟滚轮。
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

  /* 超椭球面上取点（方向 d 投影到壳面再外扩 k） */
  function surfPt(a, b, c, n, dx, dy, dz, k) {
    var e = 2 / n, ax = Math.abs(dx), ay = Math.abs(dy), az = Math.abs(dz);
    return new THREE.Vector3(
      a * Math.sign(dx) * Math.pow(ax, e) * k,
      b * Math.sign(dy) * Math.pow(ay, e) * k,
      c * Math.sign(dz) * Math.pow(az, e) * k);
  }
  /* 任意曲线管（贴壳缝线共用） */
  function curveTube(pts, mat, r, seg) {
    var geo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg || 12, r || 0.0042, 6, false);
    var m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  }
  /* 壳面缝线: dirs 为单位球方向控制点，(oy,oz) 为壳心偏移（v2 修复: 颅心 +0.262/+0.005） */
  function seamTube(a, b, c, n, dirs, mat, k, oy, oz) {
    var pts = [];
    for (var i = 0; i < dirs.length; i++) {
      var p = surfPt(a, b, c, n, dirs[i][0], dirs[i][1], dirs[i][2], k || 1.006);
      p.y += oy || 0; p.z += oz || 0;
      pts.push(p);
    }
    return curveTube(pts, mat, 0.0042, 14);
  }

  /* 胸屏 Canvas 纹理 v3 [G5]: 512px 周期化"行情屏"——横向渐变底 + 32 道扫描线(16px 周期) +
   * 8 行滚动数字（¥ 金额 / ± 百分比，行距 64px 周期）+ 左下柱状图（浮雕明暗双描边）。
   * 纵向全周期 → texture.offset.y 连续滚动无缝；repeat.x=2 使整幅落在 squircle 正面 (u 0~0.5)。 */
  function screenTexture() {
    try {
      var cv = document.createElement('canvas');
      cv.width = 512; cv.height = 512;
      var ctx = cv.getContext('2d');
      if (!ctx || !ctx.fillRect) return null;
      var grd = ctx.createLinearGradient(0, 0, 512, 0);
      grd.addColorStop(0, '#d9ffff');
      grd.addColorStop(0.45, '#7df6ff');
      grd.addColorStop(1, '#18c9de');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 512, 512);
      ctx.fillStyle = 'rgba(10,90,110,0.30)';
      for (var y = 0; y < 512; y += 16) ctx.fillRect(0, y + 6, 512, 4);
      /* 浮雕辅助: 暗描边(右下) → 亮描边(左上) → 主面 */
      function emboss(fn) {
        ctx.fillStyle = 'rgba(6,70,90,0.50)'; fn(2, 2);
        ctx.fillStyle = 'rgba(240,255,255,0.55)'; fn(-2, -2);
        ctx.fillStyle = 'rgba(8,60,80,0.82)'; fn(0, 0);
      }
      /* 8 行行情数字（周期 64px），左列金额 / 右列涨跌，字号 30px 等宽 */
      var rows = ['\u00a5 12,800', '+8.6%', '\u00a5 9,450', '-2.1%', '\u00a5 21,000', '+15.2%', '\u00a5 6,320', '+3.8%'];
      if (ctx.fillText) {
        ctx.font = 'bold 30px monospace';
        ctx.textBaseline = 'middle';
        for (var r = 0; r < 8; r++) {
          (function (txt, cy) {
            emboss(function (dx, dy) { ctx.fillText(txt, 236 + dx, cy + dy); });
          })(rows[r], r * 64 + 32);
        }
      }
      /* 左下柱状图（4 柱递增，落在行 4~7 之间，周期内） */
      [[40, 20], [76, 34], [112, 48], [148, 62]].forEach(function (b) {
        emboss(function (dx, dy) { ctx.fillRect(b[0] + dx, 300 - b[1] + dy, 24, b[1]); });
      });
      /* 左上小仪表环（周期内，行 0~2） */
      ctx.lineWidth = 9;
      ctx.strokeStyle = 'rgba(6,70,90,0.5)'; ctx.beginPath(); ctx.arc(112, 92, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(240,255,255,0.55)'; ctx.beginPath(); ctx.arc(108, 88, 34, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = 'rgba(8,60,80,0.8)'; ctx.beginPath(); ctx.arc(110, 90, 34, Math.PI * 0.75, Math.PI * 2.1); ctx.stroke();
      var tex = new THREE.CanvasTexture(cv);
      tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 1);
      return tex;
    } catch (e) { return null; }
  }
  /* [G2] 眼部光晕 alphaMap：128px 径向渐变（中心 1 → 边缘 0），用于 CircleGeometry 辉光盘 */
  function glowAlphaTexture() {
    try {
      var cv = document.createElement('canvas');
      cv.width = 128; cv.height = 128;
      var ctx = cv.getContext('2d');
      if (!ctx || !ctx.fillRect) return null;
      var g = ctx.createRadialGradient(64, 64, 6, 64, 64, 62);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.35, '#b0b0b0');
      g.addColorStop(0.7, '#3a3a3a');
      g.addColorStop(1, '#000000');
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, 128, 128);
      ctx.fillStyle = g; ctx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(cv);
    } catch (e) { return null; }
  }
  /* [G11] 外壳竖向明暗渐变（顶亮 → 底暗 22%），叠乘在壳色上给圆润外壳一个稳定的顶光高光过渡 */
  function shellGradientTexture() {
    try {
      var cv = document.createElement('canvas');
      cv.width = 64; cv.height = 256;
      var ctx = cv.getContext('2d');
      if (!ctx || !ctx.fillRect) return null;
      var g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, '#ffffff');
      g.addColorStop(0.35, '#f4f7fb');
      g.addColorStop(0.75, '#d9dfe8');
      g.addColorStop(1, '#c7ced9');
      ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 256);
      var tex = new THREE.CanvasTexture(cv);
      tex.wrapS = THREE.RepeatWrapping; tex.wrapT = THREE.ClampToEdgeWrapping;
      return tex;
    } catch (e) { return null; }
  }
  /* [G5] 心形轮廓（挤出用），size 为半宽 */
  function heartShape(sz) {
    var s = new THREE.Shape();
    s.moveTo(0, -sz * 0.95);
    s.bezierCurveTo(0, -sz * 0.95, -sz * 1.15, -sz * 0.25, -sz * 1.15, sz * 0.25);
    s.bezierCurveTo(-sz * 1.15, sz * 0.72, -sz * 0.55, sz * 0.95, 0, sz * 0.45);
    s.bezierCurveTo(sz * 0.55, sz * 0.95, sz * 1.15, sz * 0.72, sz * 1.15, sz * 0.25);
    s.bezierCurveTo(sz * 1.15, -sz * 0.25, 0, -sz * 0.95, 0, -sz * 0.95);
    return s;
  }

  window.Char3D.doudou = function () {
    var g = new THREE.Group();
    g.name = 'doudou';

    /* ---------------- 材质（调色板取自参考图像素采样，全部 convertSRGBToLinear；v3 [G11] 壳类 roughness 0.32→0.26 + 渐变贴图） ---------------- */
    var M = {
      shell: std('#3a78c8', { rough: 0.26, metal: 0.22 }),     /* 头/胸甲壳蓝 */
      limb: std('#4790dd', { rough: 0.26, metal: 0.22 }),      /* 四肢亮蓝 */
      ball: std('#57a2ea', { rough: 0.24, metal: 0.2, emissive: '#2a7fe0', ei: 0.35 }),   /* 天线球（[G4] 蓝色自发光） */
      dark: std('#3a4250', { rough: 0.42, metal: 0.62 }),      /* 枪色关节 */
      sole: std('#2e3742', { rough: 0.5, metal: 0.55 }),       /* 深灰底座/缝线 */
      silver: std('#c3cdd8', { rough: 0.32, metal: 0.6 }),     /* 银环/边框 */
      silverHi: std('#e4e9f0', { rough: 0.26, metal: 0.5 }),   /* [G1/G6/G7] 银白甲板/屏框/头底环/环缝（立绘躯干取样 #dbdde1~#f8f8f8） */
      glass: std('#0d1118', { rough: 0.14, metal: 0.3 }),      /* 面屏黑玻璃 */
      glow: std('#0a3a44', { rough: 0.35, emissive: '#46f2ff', ei: 1.8 }),   /* 青色发光 */
      hot: std('#203038', { rough: 0.3, emissive: '#e4ffff', ei: 2.1 }),     /* 白热核心（v3 心形） */
      strip: std('#0a3a44', { rough: 0.35, emissive: '#46f2ff', ei: 1.5 })  /* [G9/G10/G12] 足底光条/颈环/耳灯/天线光环 */
    };
    var shellTex = shellGradientTexture();
    if (shellTex) { M.shell.map = shellTex; M.limb.map = shellTex; M.ball.map = shellTex; }
    var screenMat = std('#18c9de', { rough: 0.25, emissive: '#46f2ff', ei: 1.7 });
    var screenTex = screenTexture();
    if (screenTex) screenMat.map = screenTex;
    var haloMat = std('#46f2ff', { rough: 0.4, emissive: '#46f2ff', ei: 1.2, opacity: 0.22 });
    var beaconMat = std('#dceeff', { rough: 0.25, emissive: '#bff4ff', ei: 0.9 });  /* 天线信标高光 */
    /* [G2] 眼部辉光盘材质：径向 alphaMap，不写深度；alphaTest 让阴影贴图沿渐变裁切（view3d 全网格 castShadow） */
    var glowTex = glowAlphaTexture();
    var eyeGlowMat = std('#46f2ff', { rough: 0.5, emissive: '#46f2ff', ei: 1.3, opacity: 0.78 });
    if (glowTex) eyeGlowMat.alphaMap = glowTex;
    eyeGlowMat.depthWrite = false; eyeGlowMat.alphaTest = 0.05;
    var pupilMat = std('#0b5566', { rough: 0.3, emissive: '#1fb8cc', ei: 0.7 });   /* [G2] 瞳心暗青（环状眼读感） */
    /* [G4] 天线球光晕壳（透明，不写深度） */
    var ballHaloMat = std('#5ab0ff', { rough: 0.5, emissive: '#3d8cff', ei: 0.9, opacity: 0.16 });
    ballHaloMat.depthWrite = false;

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
    /* [F1] 面板缝线 v2（修正颅心偏移后贴壳可见）: 前左/前右越顶角 + 后左/后右 */
    head.add(seamTube(A, B, C, N, [[0.06, 0.99, 0.28], [0.30, 0.88, 0.42], [0.60, 0.62, 0.50], [0.78, 0.30, 0.46]], M.sole, 1.006, 0.262, 0.005));
    head.add(seamTube(A, B, C, N, [[-0.06, 0.99, 0.28], [-0.30, 0.88, 0.42], [-0.60, 0.62, 0.50], [-0.78, 0.30, 0.46]], M.sole, 1.006, 0.262, 0.005));
    head.add(seamTube(A, B, C, N, [[0.06, 0.99, -0.24], [0.30, 0.88, -0.40], [0.58, 0.60, -0.52], [0.76, 0.28, -0.56]], M.sole, 1.006, 0.262, 0.005));
    head.add(seamTube(A, B, C, N, [[-0.06, 0.99, -0.24], [-0.30, 0.88, -0.40], [-0.58, 0.60, -0.52], [-0.76, 0.28, -0.56]], M.sole, 1.006, 0.262, 0.005));
    /* [F1] 侧横缝（耳舱上方弧线，参考侧视）+ 后脑横缝（左右贯穿） */
    head.add(seamTube(A, B, C, N, [[0.80, 0.55, 0.30], [0.98, 0.30, -0.05], [0.82, 0.42, -0.45]], M.sole, 1.006, 0.262, 0.005));
    head.add(seamTube(A, B, C, N, [[-0.80, 0.55, 0.30], [-0.98, 0.30, -0.05], [-0.82, 0.42, -0.45]], M.sole, 1.006, 0.262, 0.005));
    head.add(seamTube(A, B, C, N, [[0.52, 0.50, -0.70], [0, 0.44, -0.90], [-0.52, 0.50, -0.70]], M.sole, 1.006, 0.262, 0.005));
    /* [G1] 面屏 v3: 银白屏框 squircle（边缘出壳 ≈0.02 形成立绘的银框）→ 黑玻璃 squircle 放大到 0.45×0.32，
     *   两者中心后移使边缘仍嵌于颅壳内（x=0.225 处壳面 z≈0.241 > 玻璃缘 0.238） */
    head.add(squircle(0.245, 0.18, 0.068, 3.2, 26, 18, M.silverHi, 0, 0.268, 0.226));
    head.add(squircle(0.225, 0.16, 0.072, 3.2, 26, 18, M.glass, 0, 0.268, 0.238));
    /* [G2] 双眼 v3: 青色竖椭圆发光核（放大、间距 ±0.118）+ 径向 alphaMap 辉光盘 + 泛光晕壳 + 白热高光点 */
    var eyeDefs = [];
    var glowGeo = new THREE.CircleGeometry(0.082, 24);
    [[1], [-1]].forEach(function (s) {
      var eye = sph(0.055, 16, 12, M.glow, 0.118 * s[0], 0.30, 0.316);
      eye.scale.set(0.95, 1.15, 0.3);
      eye.name = s[0] > 0 ? 'eyeL' : 'eyeR';
      head.add(eye);
      var glowDisc = MS(glowGeo, eyeGlowMat, 0.118 * s[0], 0.30, 0.3125);
      glowDisc.scale.set(0.95, 1.2, 1); glowDisc.name = s[0] > 0 ? 'eyeGlowL' : 'eyeGlowR';
      glowDisc.castShadow = false;
      head.add(glowDisc);
      var halo = sph(0.062, 12, 10, haloMat, 0.12 * s[0], 0.30, 0.314);
      halo.scale.set(0.95, 1.28, 0.22);
      head.add(halo);
      var spark = sph(0.012, 8, 6, M.hot, 0.118 * s[0] + 0.015 * s[0], 0.324, 0.334);
      head.add(spark);
      /* [G2] 瞳心：立绘眼为青色环 + 略暗中心（镜头读感），暗青扁球叠在眼核前 */
      var pupil = sph(0.021, 12, 10, pupilMat, 0.118 * s[0], 0.294, 0.3335);
      pupil.scale.set(0.9, 1.1, 0.3); pupil.name = s[0] > 0 ? 'pupilL' : 'pupilR';
      head.add(pupil);
      eyeDefs.push({ m: eye, base: 1.15 }, { m: halo, base: 1.28 }, { m: glowDisc, base: 1.2 }, { m: pupil, base: 1.1 });
      /* [G3] 眉弧：青色发光 torus 弧，内低外高微挑（立绘面屏上方两道短弧） */
      var brow = tor(0.03, 0.0045, M.glow, 1.5);
      brow.rotation.z = Math.PI / 2 - 0.75 + 0.18 * s[0];
      brow.position.set(0.118 * s[0], 0.392, 0.318);
      brow.name = s[0] > 0 ? 'browL' : 'browR';
      head.add(brow);
    });
    /* 微笑弧（青色发光圆环弧，开口向上，贴屏面） */
    var mouth = tor(0.052, 0.0085, M.glow, 1.05);
    mouth.rotation.x = -0.12;
    mouth.rotation.z = -Math.PI / 2 - 0.525;
    mouth.position.set(0, 0.258, 0.314);
    head.add(mouth);
    /* 面屏右上高光斜条（玻璃反射读感，随屏放大外移） */
    var sheen = sph(0.022, 8, 6, std('#e8f4ff', { rough: 0.2, opacity: 0.75 }), 0.14, 0.40, 0.314);
    sheen.scale.set(1.8, 0.5, 0.3);
    sheen.rotation.z = 0.4;
    head.add(sheen);

    /* [F2] 两侧耳舱四层堆叠（轴 X，镜像对）:
     *   L1 银法兰 + 银圆弧缘 → L2 枪色台阶环 → L3 枪色舱盖 → L4 深色凹心，法兰 4 球螺栓 */
    [[1], [-1]].forEach(function (s) {
      var socket = cyl(0.112, 0.112, 0.05, 20, M.dark, 0.317 * s[0], 0.262, 0.005);   /* 壳内插座 */
      socket.rotation.z = Math.PI / 2;
      head.add(socket);
      var flange = cyl(0.096, 0.096, 0.016, 24, M.silver, 0.348 * s[0], 0.262, 0.005); /* L1 银法兰 */
      flange.rotation.z = Math.PI / 2;
      head.add(flange);
      var rim = tor(0.077, 0.02, M.silver);                                            /* L1 圆弧缘 */
      rim.rotation.y = Math.PI / 2;
      rim.position.set(0.356 * s[0], 0.262, 0.005);
      head.add(rim);
      var step = cyl(0.06, 0.064, 0.018, 20, M.dark, 0.364 * s[0], 0.262, 0.005);      /* L2 台阶环 */
      step.rotation.z = Math.PI / 2;
      head.add(step);
      var cap = cyl(0.052, 0.052, 0.014, 18, M.dark, 0.376 * s[0], 0.262, 0.005);      /* L3 舱盖 */
      cap.rotation.z = Math.PI / 2;
      head.add(cap);
      var recess = cyl(0.03, 0.03, 0.01, 14, M.sole, 0.381 * s[0], 0.262, 0.005);      /* L4 凹心 */
      recess.rotation.z = Math.PI / 2;
      head.add(recess);
      var earLed = sph(0.012, 10, 8, M.strip, 0.389 * s[0], 0.262, 0.005);            /* [G12] 舱心青色指示灯 */
      earLed.name = s[0] > 0 ? 'earLedL' : 'earLedR';
      head.add(earLed);
      [-0.785, 0.785, 2.356, -2.356].forEach(function (ang) {                          /* 法兰螺栓 ×4 */
        head.add(sph(0.0085, 8, 6, M.silver,
          0.356 * s[0], 0.262 + 0.077 * Math.sin(ang), 0.005 + 0.077 * Math.cos(ang)));
      });
    });
    /* [G10] 头底银白宽环（立绘头壳下缘一圈银白 #bcc8d1，贴壳 y=0.072 处截面 (0.241, 0.222)，管径出壳 0.011） */
    var chinRim = tor(0.238, 0.011, M.silverHi);
    chinRim.rotation.x = Math.PI / 2;
    chinRim.scale.set(1, 0.92, 1);
    chinRim.position.set(0, 0.072, 0.005);
    chinRim.name = 'chinRim';
    head.add(chinRim);

    /* [F6] 天线: 深灰锥座 + 法兰盘 + 锥形杆 + 双领环节点 + 蓝球（球顶世界 1.745 = 身高预算顶） */
    head.add(cyl(0.024, 0.052, 0.042, 12, M.dark, 0, 0.529, -0.01));
    head.add(cyl(0.058, 0.058, 0.012, 14, M.sole, 0, 0.512, -0.01));                   /* 法兰盘 */
    var stem = cyl(0.011, 0.017, 0.062, 10, M.dark, 0, 0.576, -0.01);
    head.add(stem);
    var collar = tor(0.021, 0.0055, M.sole);                                           /* 领环节点 1 */
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.552, -0.01);
    head.add(collar);
    var collar2 = tor(0.0165, 0.005, M.silver);                                        /* 领环节点 2（银） */
    collar2.rotation.x = Math.PI / 2;
    collar2.position.set(0, 0.564, -0.01);
    head.add(collar2);
    var ballMesh = sph(0.044, 16, 12, M.ball, 0, 0.601, -0.01);
    head.add(ballMesh);
    var ballSpot = sph(0.011, 8, 6, beaconMat, 0.016, 0.617, 0.022);
    head.add(ballSpot);
    /* [G4] 天线球辉光壳（透明，随球浮动，顶点 ≤1.75）+ 杆底青色光环（立绘杆底光点 #a0fcfd） */
    var ballHalo = sph(0.042, 16, 12, ballHaloMat, 0, 0.601, -0.01);
    ballHalo.scale.set(1.25, 1.0, 1.25); ballHalo.name = 'ballHalo';
    head.add(ballHalo);
    var stemRing = tor(0.034, 0.005, M.strip);
    stemRing.rotation.x = Math.PI / 2;
    stemRing.position.set(0, 0.542, -0.01);
    stemRing.name = 'stemRing';
    head.add(stemRing);

    /* =================================================================================
     * STRUCTURE / FORM —— 躯干（torso 局部，世界 = 局部 + 0.52）
     * 胸甲 squircle 0.47w @世界0.82; 银框+暗衬环+青屏+浮雕图标+白热核心+螺钉+状态灯;
     * 深灰裤裆 U 形槽 + 蓝髋球 + 侧碟钉; 背板衬圈 + 圆角面板 + 回字细边 + 卡槽 + 通风槽
     * ================================================================================= */
    torso.add(cyl(0.078, 0.084, 0.13, 14, M.dark, 0, 0.545, 0.005));          /* 颈柱 */
    var collarRing = tor(0.082, 0.011, M.sole);
    collarRing.rotation.x = Math.PI / 2;
    collarRing.position.set(0, 0.492, 0.005);
    torso.add(collarRing);
    var neckGlow = tor(0.087, 0.0055, M.strip);                                 /* [G10] 颈青色发光环 */
    neckGlow.rotation.x = Math.PI / 2;
    neckGlow.position.set(0, 0.508, 0.005);
    neckGlow.name = 'neckGlow';
    torso.add(neckGlow);
    var chest = squircle(0.235, 0.225, 0.205, 2.8, 26, 20, M.shell, 0, 0.30, 0);
    torso.add(chest);
    /* [G6] 银白前胸甲板：嵌于蓝壳前面（边缘 z=0.16 与壳面 ≈0.154 齐平），前面 0.22 出壳 0.015；
     *   立绘躯干正面为银白壳，背/侧仍为转台蓝壳 */
    var chestPlate = squircle(0.19, 0.18, 0.06, 3.0, 24, 18, M.silverHi, 0, 0.30, 0.16);
    chestPlate.name = 'chestPlate';
    torso.add(chestPlate);
    /* [F4] 胸屏三层边框（v3 整体前移 +0.02 落在甲板之上）: 银色圆角外框 → 暗色内衬环 → 玻璃屏内收 */
    torso.add(squircle(0.158, 0.128, 0.05, 3.0, 22, 16, M.silver, 0, 0.335, 0.19));
    var bezelChannel = tor(0.118, 0.01, M.sole);
    bezelChannel.scale.set(1.13, 0.9, 1);
    bezelChannel.position.set(0, 0.335, 0.236);
    torso.add(bezelChannel);
    var screenMesh = squircle(0.118, 0.094, 0.036, 3.2, 22, 16, screenMat, 0, 0.335, 0.206);
    screenMesh.name = 'chestScreen';
    torso.add(screenMesh);
    /* [G5] 白热核心 → 挤出心形（同 M.hot 材质与脉冲；置于屏左半，右半留给滚动数字） */
    var core = MS(new THREE.ExtrudeGeometry(heartShape(0.026), { depth: 0.012, bevelEnabled: true,
      bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 2 }), M.hot, -0.056, 0.352, 0.234);
    core.name = 'heartCore';
    torso.add(core);
    /* [F9] 四角螺钉（v3 z 0.238，浮出银框面） */
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) {
      var screw = cyl(0.011, 0.011, 0.014, 8, M.silver, 0.105 * q[0], 0.335 + 0.09 * q[1], 0.238);
      screw.rotation.x = Math.PI / 2;
      torso.add(screw);
    });
    /* 状态指示灯（右下，周期闪烁）+ 银色底圈（v3 随甲板前移） */
    var dot = sph(0.016, 10, 8, std('#0a3a44', { rough: 0.35, emissive: '#46f2ff', ei: 1.9 }), 0.15, 0.208, 0.207);
    torso.add(dot);
    var dotRing = tor(0.021, 0.005, M.silver);
    dotRing.position.set(0.15, 0.208, 0.206);
    torso.add(dotRing);
    /* 深灰裤裆块 + [F7→前] U 形槽线（参考盆部倒 U 凹槽，替代 v1 直槽）+ 蓝髋球 + 侧碟钉 */
    torso.add(squircle(0.185, 0.112, 0.16, 2.9, 22, 16, M.dark, 0, 0.118, -0.005));
    var pelvisArc = tor(0.055, 0.0075, M.sole, Math.PI * 0.95);
    pelvisArc.scale.set(1.3, 0.8, 1);
    pelvisArc.position.set(0, 0.15, 0.152);
    torso.add(pelvisArc);
    torso.add(sph(0.009, 8, 6, M.silver, 0.062, 0.095, 0.152));
    torso.add(sph(0.009, 8, 6, M.silver, -0.062, 0.095, 0.152));
    [[1], [-1]].forEach(function (s) {
      torso.add(sph(0.072, 14, 10, M.limb, 0.165 * s[0], 0.155, 0));
      /* 髋侧碟钉（v3 外移到球面 x=0.238 使其露出；v2 0.216 埋于髋球内不可见）+ [G7] 银色环缝 */
      var hipBolt = cyl(0.026, 0.026, 0.012, 10, M.sole, 0.238 * s[0], 0.155, 0);
      hipBolt.rotation.z = Math.PI / 2;
      torso.add(hipBolt);
      var hipRing = tor(0.031, 0.004, M.silverHi);
      hipRing.rotation.y = Math.PI / 2;
      hipRing.position.set(0.236 * s[0], 0.155, 0);
      hipRing.name = s[0] > 0 ? 'hipRingL' : 'hipRingR';
      torso.add(hipRing);
    });
    /* [F7] 背板 v2: 深灰衬圈 + 蓝色圆角面板 + 面板内嵌回字细边(4 段) + 中央卡槽(槽体+双银导轨)
     *   + 面板下缘通风槽 ×3（v1 槽位悬空盆部高度 → 全部收进面板投影内） */
    torso.add(squircle(0.163, 0.133, 0.026, 3.0, 20, 16, M.sole, 0, 0.30, -0.178));
    torso.add(squircle(0.152, 0.122, 0.028, 3.0, 20, 16, M.shell, 0, 0.30, -0.193));
    torso.add(box(0.19, 0.008, 0.008, M.sole, 0, 0.395, -0.211));             /* 回字细边 上 */
    torso.add(box(0.19, 0.008, 0.008, M.sole, 0, 0.205, -0.211));             /* 回字细边 下 */
    torso.add(box(0.008, 0.182, 0.008, M.sole, 0.115, 0.30, -0.211));         /* 回字细边 右 */
    torso.add(box(0.008, 0.182, 0.008, M.sole, -0.115, 0.30, -0.211));        /* 回字细边 左 */
    torso.add(box(0.078, 0.022, 0.01, M.sole, 0, 0.30, -0.2105));             /* 卡槽槽体 */
    torso.add(box(0.012, 0.026, 0.014, M.silver, 0.05, 0.30, -0.211));        /* 银导轨 右 */
    torso.add(box(0.012, 0.026, 0.014, M.silver, -0.05, 0.30, -0.211));       /* 银导轨 左 */
    [-0.05, 0, 0.05].forEach(function (vx) {
      torso.add(box(0.032, 0.018, 0.012, M.sole, vx, 0.245, -0.211));         /* 通风槽 ×3 */
    });

    /* =================================================================================
     * FORM —— 手臂（肩球→枪色双环上臂→肘领环→肘球→亮蓝前臂舱（凹座螺栓）→双环腕→三指手套）
     * 静姿外张角烘在 shoulderPivot（view3d 每帧覆写关节 rotation，不能放关节上）
     * [F10] 掌缘 ≈ 关节内 -0.335，指尖到 -0.402（契约带 -0.15~-0.32 ±0.06 内收紧）
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
      /* [F3] 上臂双波纹环 */
      var groove = tor(0.052, 0.0075, M.sole);
      groove.rotation.x = Math.PI / 2;
      groove.position.set(0, -0.096, 0);
      pivot.add(groove);
      var groove2 = tor(0.05, 0.006, M.sole);
      groove2.rotation.x = Math.PI / 2;
      groove2.position.set(0, -0.126, 0);
      pivot.add(groove2);
      var armRing = tor(0.057, 0.0035, M.silverHi);                                   /* [G7] 上臂银色环缝 */
      armRing.rotation.x = Math.PI / 2;
      armRing.position.set(0, -0.111, 0);
      armRing.name = 'armRing';
      pivot.add(armRing);
      /* [F3] 肘领环 + 肘球 */
      var elbowCollar = tor(0.056, 0.0065, M.sole);
      elbowCollar.rotation.x = Math.PI / 2;
      elbowCollar.position.set(0, -0.148, 0);
      pivot.add(elbowCollar);
      pivot.add(sph(0.062, 14, 10, M.dark, 0, -0.168, 0));
      var cuff = tor(0.078, 0.009, M.dark);
      cuff.rotation.x = Math.PI / 2;
      cuff.position.set(0, -0.176, 0.004);
      pivot.add(cuff);
      var cuffRing = tor(0.081, 0.004, M.silverHi);                                  /* [G7] 袖口银色环缝 */
      cuffRing.rotation.x = Math.PI / 2;
      cuffRing.position.set(0, -0.189, 0.004);
      cuffRing.name = 'cuffRing';
      pivot.add(cuffRing);
      pivot.add(squircle(0.092, 0.078, 0.088, 2.7, 20, 16, M.limb, 0, -0.238, 0.004));
      /* [F3] 前臂舱外凹座螺栓: 暗色凹环 + 枪色内碟（v1 平贴碟片 → 凹座两层读感） */
      var podRecess = tor(0.026, 0.0055, M.sole);
      podRecess.rotation.y = Math.PI / 2;
      podRecess.position.set(0.088 * s, -0.226, 0.012);
      pivot.add(podRecess);
      var disc = cyl(0.022, 0.022, 0.012, 10, M.dark, 0.086 * s, -0.226, 0.012);
      disc.rotation.z = Math.PI / 2;
      pivot.add(disc);
      /* [F3] 腕双环 */
      var wrist = tor(0.058, 0.0085, M.sole);
      wrist.rotation.x = Math.PI / 2;
      wrist.position.set(0, -0.302, 0.004);
      pivot.add(wrist);
      var wrist2 = tor(0.062, 0.007, M.dark);
      wrist2.rotation.x = Math.PI / 2;
      wrist2.position.set(0, -0.318, 0.004);
      pivot.add(wrist2);
      var wristRing = tor(0.064, 0.0035, M.silverHi);                                /* [G7] 腕下银色环缝 */
      wristRing.rotation.x = Math.PI / 2;
      wristRing.position.set(0, -0.327, 0.006);
      wristRing.name = 'wristRing';
      pivot.add(wristRing);
      pivot.add(squircle(0.063, 0.047, 0.057, 2.4, 16, 12, M.dark, 0, -0.335, 0.008));
      /* [G8] 三指分节：近节胶囊 + 指关节球 + 远节前卷（指尖 ≈ -0.446） */
      [-0.029, 0, 0.029].forEach(function (fx, i) {
        pivot.add(MS(new THREE.CapsuleGeometry(0.015, 0.03, 3, 8), M.dark, fx, -0.372, 0.012));
        var kn = sph(0.0155, 10, 8, M.sole, fx, -0.402, 0.013);
        kn.name = 'knuckle' + i;
        pivot.add(kn);
        var dist = MS(new THREE.CapsuleGeometry(0.013, 0.022, 3, 8), M.dark, fx, -0.424, 0.0224);
        dist.rotation.x = -0.4;
        dist.name = 'fingerDist' + i;
        pivot.add(dist);
      });
      var thumb = MS(new THREE.CapsuleGeometry(0.014, 0.028, 3, 8), M.dark, -0.052 * s, -0.342, 0.026);
      thumb.rotation.z = 0.55 * s;
      thumb.rotation.x = 0.25;
      pivot.add(thumb);
      var thumbKn = sph(0.0135, 10, 8, M.sole, -0.062 * s, -0.360, 0.036);          /* [G8] 拇指关节 + 远节 */
      thumbKn.name = 'thumbKnuckle';
      pivot.add(thumbKn);
      var thumbDist = MS(new THREE.CapsuleGeometry(0.012, 0.02, 3, 8), M.dark, -0.068 * s, -0.377, 0.047);
      thumbDist.rotation.z = 0.9 * s;
      thumbDist.rotation.x = 0.55;
      thumbDist.name = 'thumbDist';
      pivot.add(thumbDist);
      return pivot;
    }
    buildArm.call(armL, 1);
    buildArm.call(armR, -1);

    /* =================================================================================
     * FORM —— 腿（蓝髋球→枪色大腿→蓝膝球→大蓝靴（竖缝+鞋头缝弧）→踏纹鞋底 y≈-0.5 触地）
     * 参考实测: 靴宽 0.26 深 0.33 高 0.245，膝球大而醒目
     * ================================================================================= */
    function buildLeg(s) {
      var leg = this;
      leg.add(sph(0.08, 14, 10, M.limb, 0, -0.015, 0));
      leg.add(MS(new THREE.CapsuleGeometry(0.06, 0.03, 4, 12), M.dark, 0, -0.09, 0));
      leg.add(sph(0.095, 16, 12, M.limb, 0, -0.185, 0));
      var kneeRing = tor(0.07, 0.004, M.silverHi);                                   /* [G7] 膝上银色环缝 */
      kneeRing.rotation.x = Math.PI / 2;
      kneeRing.position.set(0, -0.115, 0);
      kneeRing.name = 'kneeRing';
      leg.add(kneeRing);
      leg.add(squircle(0.142, 0.115, 0.172, 2.8, 22, 16, M.limb, 0, -0.345, 0.015));
      var bootCollar = tor(0.09, 0.006, M.silverHi);                                 /* [G7] 靴口银色环 */
      bootCollar.rotation.x = Math.PI / 2;
      bootCollar.scale.set(1.1, 1.3, 1);
      bootCollar.position.set(0, -0.238, 0.015);
      bootCollar.name = 'bootCollar';
      leg.add(bootCollar);
      var toe = sph(0.1, 16, 12, M.limb, 0, -0.418, 0.098);
      toe.scale.set(1.05, 0.58, 1.0);
      leg.add(toe);
      /* [F8] 靴筒正面竖缝线（贴靴面曲线管，跟随 squircle 靴型）+ 鞋头缝线弧 */
      var bootPts = [];
      [[0, 0.5, 0.87], [0, 0.15, 0.99], [0, -0.2, 0.98], [0, -0.5, 0.87]].forEach(function (d) {
        var p = surfPt(0.142, 0.115, 0.172, 2.8, d[0], d[1], d[2], 1.006);
        p.y -= 0.345; p.z += 0.015;
        bootPts.push(p);
      });
      leg.add(curveTube(bootPts, M.sole, 0.0045, 10));
      var toeSeam = tor(0.09, 0.005, M.sole, Math.PI * 0.85);
      toeSeam.rotation.x = 1.35;
      toeSeam.position.set(0, -0.396, 0.102);
      leg.add(toeSeam);
      /* 外踝碟钉 + 内踝螺栓 + 鞋跟条 */
      var ankleDisc = cyl(0.036, 0.036, 0.016, 10, M.sole, 0.132 * s, -0.318, 0.02);
      ankleDisc.rotation.z = Math.PI / 2;
      leg.add(ankleDisc);
      var ankleBolt = cyl(0.022, 0.022, 0.012, 8, M.sole, -0.132 * s, -0.318, 0.02);
      ankleBolt.rotation.z = Math.PI / 2;
      leg.add(ankleBolt);
      leg.add(box(0.168, 0.045, 0.028, M.sole, 0, -0.446, -0.118));
      /* [F5] 鞋底踏板（底面 -0.4925）+ 三道横向踏纹（凸出底面 0.0075，踏纹底 -0.5 触地；
       *    v1 踏纹盒被鞋底实体包住不可见 → v2 修正外露） */
      leg.add(squircle(0.14, 0.0295, 0.175, 3.4, 20, 10, M.sole, 0, -0.463, 0.015));
      [-0.085, 0.02, 0.125].forEach(function (tz) {
        leg.add(box(0.21, 0.013, 0.026, M.dark, 0, -0.4935, tz));
      });
      /* [G9] 足底青色发光条（沿靴/底交界一圈，前缘出鞋头 0.01）+ 银色鞋底沿板 + 后跟滚轮 + 银轴 */
      var soleGlow = tor(0.13, 0.006, M.strip);
      soleGlow.rotation.x = Math.PI / 2;
      soleGlow.scale.set(1.08, 1.45, 1);
      soleGlow.position.set(0, -0.428, 0.015);
      soleGlow.name = 'soleGlow';
      leg.add(soleGlow);
      var soleRim = squircle(0.146, 0.006, 0.181, 3.4, 20, 8, M.silverHi, 0, -0.4465, 0.015);
      soleRim.name = 'soleRim';
      leg.add(soleRim);
      var wheel = cyl(0.03, 0.03, 0.022, 16, M.dark, 0, -0.47, -0.15);
      wheel.rotation.z = Math.PI / 2;
      wheel.name = 'heelWheel';
      leg.add(wheel);
      var axle = cyl(0.007, 0.007, 0.07, 8, M.silverHi, 0, -0.47, -0.15);
      axle.rotation.z = Math.PI / 2;
      axle.name = 'heelAxle';
      leg.add(axle);
    }
    buildLeg.call(legL, 1);
    buildLeg.call(legR, -1);

    /* =================================================================================
     * INTERACTION —— 待机动画（只动内节点，六关节留给 view3d.animToken）
     * ================================================================================= */
    var chestBaseX = chest.scale.x, chestBaseY = chest.scale.y, chestBaseZ = chest.scale.z;
    var dotBaseEi = dot.material.emissiveIntensity;
    var beaconBaseEi = beaconMat.emissiveIntensity;
    g.userData.anim = [
      /* 胸屏呼吸脉冲（浮雕图标随屏同明暗）+ 白热核心同步（AI 算力感） */
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
      /* 天线球浮动 + 杆部迟滞摆动 + 双领环随动（雷达扫描感，幅度克制）；v3 光晕壳随球 */
      function (t) {
        var sway = Math.sin(t * 2.4 + 0.6) * 0.05;
        ballMesh.position.y = 0.601 + Math.sin(t * 2.4) * 0.005;   /* v3: 浮幅 0.006→0.005，峰值 1.750 不越界 */
        ballMesh.position.x = sway * 0.08;
        ballSpot.position.y = ballMesh.position.y + 0.016;
        ballSpot.position.x = ballMesh.position.x + 0.016;
        ballHalo.position.x = ballMesh.position.x;
        ballHalo.position.y = ballMesh.position.y;
        stem.rotation.z = sway;
        collar.rotation.z = sway * 0.6;
        collar2.rotation.z = -sway * 0.4;
      },
      /* [F6] 天线球信标呼吸（emissive 波动 ±0.22 ≤ 0.25 上限） */
      function (t) {
        beaconMat.emissiveIntensity = beaconBaseEi + Math.sin(t * 3.2) * 0.22;
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
      },
      /* [G5] 胸屏行情滚动（纹理 offset.y 连续滚动，纹理纵向周期化无缝；无贴图时空转） */
      function (t) {
        if (screenTex) screenTex.offset.y = (t * 0.045) % 1;
      },
      /* [G4] 天线球辉光呼吸（球材质 emissive 0.35±0.15，光晕壳 opacity 0.16±0.05） */
      function (t) {
        M.ball.emissiveIntensity = 0.35 + Math.sin(t * 2.4 + 0.3) * 0.15;
        ballHaloMat.opacity = 0.16 + Math.sin(t * 2.4 + 0.3) * 0.05;
      },
      /* [G9/G10] 足底光条 / 颈环 / 耳灯 共用材质呼吸（1.5±0.2 ≤ 0.25） */
      function (t) {
        M.strip.emissiveIntensity = 1.5 + Math.sin(t * 3.0 + 1.1) * 0.2;
      }
    ];

    g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };
    return g;
  };
})();
