/* =====================================================================================
 * 大富翁 · 富贵人生 —— 精细角色：糖糖 tang（img2threejs 管线产出）
 * -------------------------------------------------------------------------------------
 * 参考图：refs/char_tang.png（三视图：正/侧/背）+ char_tang-landmarks.png（地标网格）。
 * 形象：元气少女 —— 橙色双马尾（炭黑发圈×2、发梢羽状尖层次）+ 顶天呆毛 +
 *       中分锯齿刘海 + 大琥珀眼(双高光/上睫线) + 张嘴笑(上齿带/暗口腔) + 腮红 +
 *       珊瑚红oversized连帽卫衣裙(袋鼠兜/抽绳+金属绳头/罗纹下摆/罗纹袖口/后背帽垂布) +
 *       裸腿 + 珊瑚红堆堆袜 + 厚底白橙运动鞋(深色牙边/鞋带带/橙侧贴/橙后跟提环)。
 *
 * 装配契约（view3d.js animToken 按此驱动，勿改关节位置）：
 *   根 Group 正面朝 +Z；userData.parts = { head, torso, armL, armR, legL, legR }
 *   legL/legR (±0.14,0.5,0) 腿网格 y≈-0.22 鞋底 -0.5；torso (0,0.52,0) 躯干主体 y≈+0.32；
 *   armL/armR (±0.31,1.0,0) 臂网格 y≈-0.15~-0.32（手掌）；head (0,1.1,0) 颅心 y≈+0.28。
 *   总身高 ≈1.74（外部再乘 1.08）；脚底贴地 y≈0。
 * 注：view3d 每帧覆写六关节 rotation/position，故默认姿态烘进关节内网格；
 *     userData.anim 只用未被覆写的通道（torso.rotation / 网格 scale /
 *     双马尾 pivot / 呆毛 pivot / 抽绳 pivot 自转）。
 * 依赖：全局 THREE r147。经典脚本，无模块。纹理仅程序化 Canvas（≤256px）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[chars3d/tang] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

window.Char3D = window.Char3D || {};

window.Char3D.tang = function () {

  /* ---------------- 0. 工具（颜色 sRGB→Linear，与 buildings3d.std 同约定） ---------------- */
  var PI = Math.PI, sin = Math.sin, cos = Math.cos;
  function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function std(hex, o) {
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: C(hex),
      roughness: (o.rough !== undefined ? o.rough : 0.85),
      metalness: (o.metal || 0),
      flatShading: (o.flat !== undefined ? o.flat : false)
    });
    if (o.envInt) m.envMapIntensity = o.envInt;
    if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
    return m;
  }
  function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
  function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function sph(r, ws, hs, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, ws, hs), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function torus(r, t, mat, x, y, z) { var o = mesh(new THREE.TorusGeometry(r, t, 8, 18), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function grp() { return new THREE.Group(); }
  /* 程序化 Canvas 纹理（≤256px，无外部资源） */
  function canvasTex(w, h, draw, rx, ry) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 4;
    return t;
  }

  var g = grp(); g.name = 'tang';

  /* ---------------- 1. 材质（色值取自参考图分区取样；头发 flatShading 出刻面感） ---------------- */
  var skinM  = std('#f2c4a0', { rough: 0.62 });
  var skinD  = std('#e2ab80', { rough: 0.66 });
  var hairM  = std('#ee7a2e', { rough: 0.72, flat: true });   /* 主发色：刻面哑光 */
  var hairIn = std('#d96a26', { rough: 0.75, flat: true });   /* 发梢/内层暗面 */
  var hoodM  = std('#e05648', { rough: 0.85 });               /* 卫衣珊瑚红 */
  var hoodD  = std('#cc4838', { rough: 0.88 });               /* 罗纹/内衬暗珊瑚 */
  var charM  = std('#4a4a52', { rough: 0.8 });                /* 炭黑发圈/抽绳 */
  var sockM  = std('#e88b80', { rough: 0.85 });               /* 堆堆袜 */
  var shoeM  = std('#f2f0ec', { rough: 0.62 });               /* 鞋身米白 */
  var soleM  = std('#7a7068', { rough: 0.72 });               /* 深鞋底 */
  var laceM  = std('#ece2d0', { rough: 0.75 });               /* 米色鞋带 */
  var eyeWM  = std('#fcfaf6', { rough: 0.25 });               /* 眼白/高光 */
  var irisM  = std('#a05a28', { rough: 0.3 });                /* 琥珀虹膜 */
  var pupM   = std('#2a1c14', { rough: 0.28 });               /* 瞳孔/睫线 */
  var mouthM = std('#7a2e2c', { rough: 0.6 });                /* 口腔暗红 */
  var teethM = std('#faf6f0', { rough: 0.45 });               /* 上齿带 */
  var blushM = std('#f49e84', { rough: 0.75 });               /* 腮红 */

  /* 罗纹竖条纹（下摆/袖口，64px 平铺；与裙身同珊瑚色系，仅深浅沟） */
  var ribTex = canvasTex(64, 64, function (ctx) {
    ctx.fillStyle = '#e05648'; ctx.fillRect(0, 0, 64, 64);
    for (var i = 0; i < 8; i++) {
      ctx.fillStyle = '#c8443a';
      ctx.fillRect(i * 8, 0, 3, 64);
      ctx.fillStyle = '#ea6254';
      ctx.fillRect(i * 8 + 4, 0, 2, 64);
    }
  }, 14, 1);
  var ribM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: ribTex, roughness: 0.88 });

  /* ---------------- 2. 躯干（torso 关节 @ (0,0.52,0)；卫衣裙世界 0.575→1.065） ---------------- */
  var torso = grp(); torso.position.set(0, 0.52, 0); torso.name = 'torso'; g.add(torso);

  /* 裙内暗档（下摆与腿根之间遮蔽，暗珊瑚=裙内阴影） */
  var filler = sph(0.27, 16, 10, hoodD, 0, 0.075, 0);
  filler.scale.set(0.95, 0.34, 0.78); torso.add(filler);

  /* 卫衣裙主体：Lathe 梯形裙剖面（下摆宽、上收肩），世界 0.575→1.065，肚峰 y≈0.84 */
  var dressPts = [
    new THREE.Vector2(0.001, 0.055), new THREE.Vector2(0.24, 0.058), new THREE.Vector2(0.295, 0.075),
    new THREE.Vector2(0.30, 0.11),   new THREE.Vector2(0.285, 0.17), new THREE.Vector2(0.265, 0.24),
    new THREE.Vector2(0.245, 0.31),  new THREE.Vector2(0.228, 0.38), new THREE.Vector2(0.212, 0.45),
    new THREE.Vector2(0.196, 0.50),  new THREE.Vector2(0.172, 0.535), new THREE.Vector2(0.001, 0.545)
  ];
  var dress = mesh(new THREE.LatheGeometry(dressPts, 24), hoodM);
  dress.scale.z = 0.82; torso.add(dress);

  /* 罗纹下摆带（世界 0.575→0.63） */
  var hemPts = [
    new THREE.Vector2(0.288, 0.055), new THREE.Vector2(0.302, 0.075),
    new THREE.Vector2(0.302, 0.105), new THREE.Vector2(0.286, 0.112), new THREE.Vector2(0.001, 0.113)
  ];
  var hem = mesh(new THREE.LatheGeometry(hemPts, 24), ribM);
  hem.scale.z = 0.82; torso.add(hem);

  /* 袋鼠兜：中央兜体（贴椭圆裙面，微倾）+ 两翼斜开口 + 暗缝线 */
  var pkt = box(0.26, 0.145, 0.05, hoodM, 0, 0.155, 0.205);
  pkt.rotation.x = 0.1; torso.add(pkt);
  var wingL = box(0.07, 0.10, 0.045, hoodM, -0.152, 0.20, 0.19);
  wingL.rotation.z = 0.62; wingL.rotation.x = 0.1; torso.add(wingL);
  var wingR = box(0.07, 0.10, 0.045, hoodM, 0.152, 0.20, 0.19);
  wingR.rotation.z = -0.62; wingR.rotation.x = 0.1; torso.add(wingR);
  torso.add(box(0.27, 0.014, 0.012, hoodD, 0, 0.086, 0.229));
  var seamL = box(0.014, 0.095, 0.012, hoodD, -0.128, 0.202, 0.218);
  seamL.rotation.z = 0.6; torso.add(seamL);
  var seamR = box(0.014, 0.095, 0.012, hoodD, 0.128, 0.202, 0.218);
  seamR.rotation.z = -0.6; torso.add(seamR);

  /* 抽绳 ×2：自帽领前缘穿出，垂绳 + 金属绳头（pivot 在领口，待机微摆） */
  function drawString(s) {
    var pv = grp(); pv.position.set(0.058 * s, 0.545, 0.17); torso.add(pv);
    pv.add(sph(0.016, 8, 6, charM, 0, 0, 0));
    var cord = cyl(0.012, 0.011, 0.175, 8, charM, 0.006 * s, -0.088, 0.022);
    cord.rotation.x = -0.18; cord.rotation.z = -0.06 * s; pv.add(cord);
    var ag = cyl(0.015, 0.015, 0.04, 8, charM, 0.012 * s, -0.185, 0.049);
    ag.rotation.x = -0.18; ag.rotation.z = -0.06 * s; pv.add(ag);
    return pv;
  }
  var stringL = drawString(1), stringR = drawString(-1);

  /* 兜帽卷领：领环（后颈/两侧），帽垂布贴背（侧视不隆起）+ 下垂尖 */
  var collar = torus(0.128, 0.042, hoodM, 0, 0.565, -0.004);
  collar.rotation.x = PI / 2 - 0.12; torso.add(collar);
  var hood = sph(0.17, 14, 10, hoodM, 0, 0.30, -0.225);
  hood.scale.set(1.25, 1.1, 0.45); torso.add(hood);
  var hoodTip = cone(0.05, 0.14, 8, hoodM, 0, 0.185, -0.26);
  hoodTip.rotation.x = PI - 0.2; torso.add(hoodTip);

  /* 脖颈（被卷领半掩，细颈） */
  torso.add(cyl(0.075, 0.085, 0.10, 12, skinM, 0, 0.578, 0.005));

  /* ---------------- 3. 头（head 关节 @ (0,1.1,0)；颅心局部 (0,0.30) → 世界 1.40） ---------------- */
  var head = grp(); head.position.set(0, 1.1, 0); head.name = 'head'; g.add(head);

  var skull = sph(0.24, 22, 16, skinM, 0, 0.30, 0);
  skull.scale.set(1.04, 0.92, 0.98); head.add(skull);
  /* 腮帮 + 圆下巴（chibi 下移五官） */
  var chkL = sph(0.062, 12, 9, skinM, -0.165, 0.235, 0.125); chkL.scale.set(1, 0.9, 0.85); head.add(chkL);
  var chkR = sph(0.062, 12, 9, skinM, 0.165, 0.235, 0.125); chkR.scale.set(1, 0.9, 0.85); head.add(chkR);
  var jaw = sph(0.095, 12, 9, skinM, 0, 0.155, 0.10);
  jaw.scale.set(1.3, 0.6, 0.95); head.add(jaw);

  /* 耳朵（小、贴侧，被侧发/发圈半掩） */
  var earL = sph(0.045, 10, 8, skinM, -0.245, 0.29, -0.01); earL.scale.set(0.5, 1.0, 0.8); head.add(earL);
  var earR = sph(0.045, 10, 8, skinM, 0.245, 0.29, -0.01); earR.scale.set(0.5, 1.0, 0.8); head.add(earR);

  /* 大琥珀眼（眼白+虹膜+瞳孔+双高光+上睫线+外角睫尖），眼线 0.34（chibi 下移）；贴面不外凸 */
  var s;
  for (s = -1; s <= 1; s += 2) {
    var white = sph(0.055, 12, 10, eyeWM, 0.115 * s, 0.34, 0.212);
    white.scale.set(0.95, 1.28, 0.38); head.add(white);
    var iris = sph(0.047, 12, 10, irisM, 0.117 * s, 0.335, 0.227);
    iris.scale.set(1, 1.18, 0.28); head.add(iris);
    head.add(sph(0.022, 10, 8, pupM, 0.117 * s, 0.333, 0.237));
    /* 双高光：大上(偏画面左) + 小下(偏画面右) —— 参考图两眼同构 */
    head.add(sph(0.014, 8, 6, eyeWM, 0.104 * s, 0.355, 0.246));
    head.add(sph(0.007, 6, 5, eyeWM, 0.132 * s, 0.317, 0.248));
    /* 上睫线：贴眼顶深色细缘 */
    var lash = sph(0.052, 12, 8, pupM, 0.115 * s, 0.378, 0.214);
    lash.scale.set(0.98, 0.22, 0.42); head.add(lash);
    /* 外角睫尖小锥 */
    var lspk = cone(0.01, 0.04, 6, pupM, 0.166 * s, 0.386, 0.21);
    lspk.rotation.z = -1.9 * s; head.add(lspk);
    /* 细橙眉（发际线下，被刘海尖半掩） */
    var brow = box(0.10, 0.014, 0.018, hairM, 0.10 * s, 0.428, 0.208);
    brow.rotation.z = -0.12 * s; brow.rotation.x = 0.15; head.add(brow);
  }

  /* 小鼻点 + 张嘴笑（暗口腔 + 上齿带）+ 腮红 */
  head.add(sph(0.014, 8, 6, skinD, 0, 0.288, 0.242));
  var mouth = sph(0.052, 12, 9, mouthM, 0, 0.195, 0.202);
  mouth.scale.set(1.35, 0.82, 0.42); head.add(mouth);
  var teeth = box(0.08, 0.018, 0.012, teethM, 0, 0.222, 0.232);
  teeth.rotation.x = 0.05; head.add(teeth);
  var blL = sph(0.042, 10, 8, blushM, -0.175, 0.24, 0.175); blL.scale.set(1.15, 0.65, 0.4); head.add(blL);
  var blR = sph(0.042, 10, 8, blushM, 0.175, 0.24, 0.175); blR.scale.set(1.15, 0.65, 0.4); head.add(blR);

  /* ---------------- 4. 发系（先颅后发；刻面哑光 + 发梢羽状尖；发际线局部 y≈0.43） ---------------- */
  /* 颅顶壳：截断半球盖（0.38π），帽沿止步于发际线，不压眉眼 */
  var cap = mesh(new THREE.SphereGeometry(0.26, 20, 12, 0, PI * 2, 0, PI * 0.38), hairM);
  cap.position.set(0, 0.315, -0.008); cap.scale.set(1.06, 1.02, 1.04); head.add(cap);
  /* 后脑体量 + 颈后发（大块平滑，消除堆叠棱） */
  var back1 = sph(0.175, 16, 12, hairM, 0, 0.36, -0.135); back1.scale.set(1.5, 1.0, 0.85); head.add(back1);
  var back2 = sph(0.14, 14, 10, hairM, 0, 0.17, -0.12); back2.scale.set(1.4, 0.85, 0.8); head.add(back2);
  var nape = sph(0.105, 10, 8, hairIn, 0, 0.10, -0.095); nape.scale.set(1.35, 0.7, 0.8); head.add(nape);
  /* 侧发掠（耳上补块，衔接颅顶壳与鬓发） */
  var sideL = sph(0.10, 12, 9, hairM, -0.235, 0.36, 0.03); sideL.scale.set(0.5, 1.2, 1.0); head.add(sideL);
  var sideR = sph(0.10, 12, 9, hairM, 0.235, 0.36, 0.03); sideR.scale.set(0.5, 1.2, 1.0); head.add(sideR);

  /* 中分锯齿刘海：贴前额坡面（瓣心 z≈0.16-0.19），每侧 3 瓣 + 中缝 2 瓣 + 锥尖垂至眉线 */
  var fringe = [
    /* [x, y, z, r] */
    [0.028, 0.492, 0.165, 0.065],
    [0.092, 0.482, 0.172, 0.060],
    [0.150, 0.465, 0.162, 0.054]
  ];
  for (s = -1; s <= 1; s += 2) {
    for (var fi = 0; fi < fringe.length; fi++) {
      var F = fringe[fi];
      var lobe = sph(F[3], 10, 8, hairM, F[0] * s, F[1], F[2]);
      lobe.scale.set(0.9, 1.5, 0.7); lobe.rotation.z = (-0.12 - 0.14 * fi) * s; head.add(lobe);
      var tip = cone(F[3] * 0.4, 0.1, 6, hairIn, (F[0] + 0.008) * s, F[1] - 0.1, F[2] + 0.035);
      tip.rotation.x = PI; tip.rotation.z = (-0.18 - 0.16 * fi) * s; head.add(tip);
    }
    /* 中缝两瓣（贴分缝线，向两侧倒） */
    var cLobe = sph(0.05, 9, 7, hairM, 0.02 * s, 0.50, 0.165);
    cLobe.scale.set(0.8, 1.4, 0.62); cLobe.rotation.z = -0.16 * s; head.add(cLobe);
    var cTip = cone(0.02, 0.07, 6, hairIn, 0.028 * s, 0.418, 0.192);
    cTip.rotation.x = PI; cTip.rotation.z = -0.2 * s; head.add(cTip);
  }

  /* 鬓侧发（耳前垂束，锥尖下收） */
  for (s = -1; s <= 1; s += 2) {
    var sl = sph(0.05, 9, 7, hairM, 0.245 * s, 0.285, 0.09);
    sl.scale.set(0.75, 1.5, 0.8); sl.rotation.z = -0.1 * s; head.add(sl);
    var slTip = cone(0.024, 0.09, 6, hairIn, 0.258 * s, 0.15, 0.085);
    slTip.rotation.x = PI; slTip.rotation.z = -0.18 * s; head.add(slTip);
  }

  /* 双马尾：pivot 挂在颅侧上方位（发圈处），整束可摆；4 节渐垂发束 + 羽状锥尖，尾梢至世界 ≈0.9 */
  function tail(s) {
    var pv = grp(); pv.position.set(0.21 * s, 0.475, -0.03); head.add(pv);
    /* 炭黑发圈 ×2（环叠） */
    var t1 = torus(0.048, 0.019, charM, 0, 0, 0);
    t1.rotation.x = PI / 2; t1.rotation.z = 0.35 * s; pv.add(t1);
    var t2 = torus(0.044, 0.017, charM, 0.008 * s, -0.032, 0.004);
    t2.rotation.x = PI / 2; t2.rotation.z = 0.35 * s; pv.add(t2);
    /* 发束 4 节：外扩→后漂→渐细，相互重叠成整块波状体量 */
    var segs = [
      [0.020 * s, -0.045, -0.012, 0.092, 1.0],
      [0.040 * s, -0.14, -0.045, 0.122, 1.05],
      [0.060 * s, -0.275, -0.09, 0.112, 1.05],
      [0.062 * s, -0.41, -0.13, 0.092, 1.05],
      [0.055 * s, -0.49, -0.155, 0.070, 1.05]
    ];
    for (var i = 0; i < segs.length; i++) {
      var sg = segs[i];
      var lb = sph(sg[3], 12, 9, i === 3 ? hairIn : hairM, sg[0], sg[1], sg[2]);
      lb.scale.set(1.12, sg[4], 0.95); lb.rotation.z = -0.04 * s * i; pv.add(lb);
    }
    /* 羽状锥尖：下两节各 2 枚（层次发梢） */
    var tips = [
      [0.052 * s, -0.505, -0.10, 0.03, 0.115, -0.34],
      [0.088 * s, -0.495, -0.125, 0.026, 0.10, 0.3],
      [0.048 * s, -0.455, -0.09, 0.026, 0.10, -0.3],
      [0.084 * s, -0.44, -0.115, 0.022, 0.085, 0.34]
    ];
    for (var k = 0; k < tips.length; k++) {
      var tp = tips[k];
      var cn = cone(tp[3], tp[4], 6, hairIn, tp[0], tp[1], tp[2]);
      cn.rotation.x = PI - 0.15; cn.rotation.z = tp[5] * s; pv.add(cn);
    }
    return pv;
  }
  var tailL = tail(1), tailR = tail(-1);

  /* 顶天呆毛：弧形 3 球 + 锥尖（钩状剪影，向角色左弯；总高控制在 1.75 内） */
  var ahoge = grp(); ahoge.position.set(0.03, 0.548, 0.02); head.add(ahoge);
  ahoge.add(sph(0.03, 8, 6, hairM, 0.012, 0.012, 0));
  ahoge.add(sph(0.024, 8, 6, hairM, 0.046, 0.03, 0.008));
  ahoge.add(sph(0.018, 8, 6, hairM, 0.072, 0.044, 0.012));
  var aTip = cone(0.014, 0.05, 6, hairIn, 0.09, 0.068, 0.016);
  aTip.rotation.z = -0.55; ahoge.add(aTip);

  /* ---------------- 5. 手臂（armL @ (0.31,1.0,0)，armR @ (-0.31,1.0,0)；外八垂坠烘进网格） ---------------- */
  function buildArm(s) {
    var pv = grp(); pv.position.set(0.31 * s, 1.0, 0); pv.name = s > 0 ? 'armL' : 'armR'; g.add(pv);
    pv.add(sph(0.082, 12, 9, hoodM, 0.012 * s, -0.045, 0));
    var slv = cyl(0.072, 0.068, 0.20, 12, hoodM, 0.02 * s, -0.16, 0.004);
    slv.rotation.z = -0.09 * s; pv.add(slv);
    var cuff = cyl(0.07, 0.065, 0.055, 12, ribM, 0.026 * s, -0.253, 0.007);
    cuff.rotation.z = -0.09 * s; pv.add(cuff);
    var hand = sph(0.05, 10, 8, skinM, 0.032 * s, -0.30, 0.012);
    hand.scale.set(0.85, 1.05, 0.8); pv.add(hand);
    return pv;
  }
  var armL = buildArm(1), armR = buildArm(-1);

  /* ---------------- 6. 腿（镜像：legL s=+1，legR s=-1；鞋尖外八 0.14rad，鞋底 -0.5 → 世界 0） ---------------- */
  function buildLeg(s) {
    var pv = grp(); pv.position.set(0.14 * s, 0.5, 0); pv.name = s > 0 ? 'legL' : 'legR'; g.add(pv);
    var leg = mesh(new THREE.CapsuleGeometry(0.052, 0.30, 4, 10), skinM);
    leg.position.y = -0.22; pv.add(leg);
    /* 堆堆袜：厚袜筒 + 顶部堆褶环（小腿下段） */
    var sock = cyl(0.062, 0.057, 0.15, 10, sockM, 0, -0.405, 0); pv.add(sock);
    var fold = torus(0.058, 0.02, sockM, 0, -0.335, 0);
    fold.rotation.x = PI / 2; pv.add(fold);
    /* 运动鞋（厚底白橙：白中底 + 深牙子 + 厚鞋身 + 鞋带带 + 橙贴） */
    var shoe = grp(); shoe.position.set(0.008 * s, 0, 0.008); shoe.rotation.y = 0.14 * s; pv.add(shoe);
    shoe.add(box(0.13, 0.034, 0.24, shoeM, 0, -0.477, 0.018));
    shoe.add(box(0.132, 0.014, 0.242, soleM, 0, -0.493, 0.018));
    shoe.add(box(0.115, 0.08, 0.195, shoeM, 0, -0.425, 0.012));
    var toe = sph(0.055, 12, 9, shoeM, 0, -0.448, 0.098);
    toe.scale.set(1.05, 0.6, 1.2); shoe.add(toe);
    shoe.add(box(0.095, 0.028, 0.03, soleM, 0, -0.468, 0.128));
    var lace = box(0.08, 0.022, 0.105, laceM, 0, -0.396, 0.052);
    lace.rotation.x = 0.35; shoe.add(lace);
    var tongue = box(0.062, 0.05, 0.02, shoeM, 0, -0.378, 0.002);
    tongue.rotation.x = 0.3; shoe.add(tongue);
    shoe.add(box(0.045, 0.035, 0.016, hairM, 0, -0.42, -0.088));
    shoe.add(box(0.012, 0.042, 0.075, hairM, 0.059 * s, -0.435, 0.025));
    return pv;
  }
  var legL = buildLeg(1), legR = buildLeg(-1);

  /* ---------------- 7. 装配契约 + 待机动画 ---------------- */
  g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };

  /* 待机：元气呼吸（卫衣裙 xz 微缩放）+ 重心微晃 + 双马尾交错摆 + 呆毛颤 + 抽绳轻荡。
   * 只用 view3d.animToken 不覆写的通道（torso.rotation / 网格 scale / 子 pivot 旋转）。 */
  g.userData.anim = [function (t, dt) {
    var br = sin(t * 1.9);
    dress.scale.x = 1 + br * 0.012; dress.scale.z = 0.82 * (1 + br * 0.014);
    hem.scale.x = 1 + br * 0.012; hem.scale.z = 0.82 * (1 + br * 0.014);
    torso.rotation.z = sin(t * 0.8) * 0.02;
    torso.rotation.x = sin(t * 1.9) * 0.008;
    tailL.rotation.z = sin(t * 1.35) * 0.055;
    tailL.rotation.x = sin(t * 1.35 + 1.1) * 0.04;
    tailR.rotation.z = -sin(t * 1.35 + 0.5) * 0.055;
    tailR.rotation.x = sin(t * 1.35 + 1.7) * 0.04;
    ahoge.rotation.z = sin(t * 2.3) * 0.07;
    ahoge.rotation.x = sin(t * 1.9 + 0.8) * 0.03;
    stringL.rotation.x = sin(t * 1.9 + 0.5) * 0.07;
    stringR.rotation.x = sin(t * 1.9 + 0.9) * 0.07;
    return br;
  }];

  return g;
};

})();
