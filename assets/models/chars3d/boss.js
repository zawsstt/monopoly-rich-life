/* =====================================================================================
 * 大富翁 · 富贵人生 —— 精细角色：富老板 boss（img2threejs 管线产出）
 * -------------------------------------------------------------------------------------
 * 参考图：refs/char_boss.png（三视图：正/侧/背）。
 * 形象：梨形身材地产大亨 —— 圆肚金马甲（暗纹）+ 白衬衫 + 深棕领带金领带针 + 胸袋巾 +
 *       怀表链 + 背后调节带 + 浓眉小眼 + 大圆鼻 + 上翘八字胡 + 后梳蓬帕杜发型 +
 *       竖条纹深色裤 + 漆皮鞋 + 金头手杖（右手拄地、左手叉腰）。
 *
 * 装配契约（view3d.js animToken 按此驱动，勿改关节位置）：
 *   根 Group 正面朝 +Z；userData.parts = { head, torso, armL, armR, legL, legR }
 *   legL/legR (±0.17,0.5,0) 腿网格 y≈-0.22 鞋底 -0.5；torso (0,0.52,0) 躯干 y≈+0.32；
 *   armL/armR (±0.39,1.0,0) 臂网格 y≈-0.15~-0.32；head (0,1.1,0) 颅心 y≈+0.28。
 *   总身高 ≈1.72（外部再乘 1.08）。
 * 注：view3d 每帧覆写六关节 rotation/position，故默认姿态烘进关节内网格；
 *     userData.anim 只用未被覆写的通道（躯干 rotation / 呼吸缩放 / 手杖微摆）。
 * 依赖：全局 THREE r147。经典脚本，无模块。
 * ==================================================================================== */
(function(){
'use strict';

if (typeof THREE === 'undefined'){
  if (typeof console !== 'undefined') console.error('[chars3d/boss] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

window.Char3D = window.Char3D || {};

window.Char3D.boss = function () {

  /* ---------------- 0. 工具（颜色 sRGB→Linear，与 buildings3d.std 同约定） ---------------- */
  var PI = Math.PI, sin = Math.sin, cos = Math.cos;
  function C(hex){ return new THREE.Color(hex).convertSRGBToLinear(); }
  function std(hex, o){
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: C(hex),
      roughness: (o.rough !== undefined ? o.rough : 0.85),
      metalness: (o.metal || 0),
      flatShading: (o.flat !== undefined ? o.flat : false)
    });
    if (o.envInt) m.envMapIntensity = o.envInt;
    if (o.emissive){ m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.6); }
    return m;
  }
  function mesh(geo, mat){ var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
  function box(w,h,d,mat,x,y,z){ var o=mesh(new THREE.BoxGeometry(w,h,d),mat); o.position.set(x||0,y||0,z||0); return o; }
  function cyl(rt,rb,h,seg,mat,x,y,z){ var o=mesh(new THREE.CylinderGeometry(rt,rb,h,seg),mat); o.position.set(x||0,y||0,z||0); return o; }
  function sph(r,ws,hs,mat,x,y,z){ var o=mesh(new THREE.SphereGeometry(r,ws,hs),mat); o.position.set(x||0,y||0,z||0); return o; }
  function grp(){ return new THREE.Group(); }
  /* 程序化 Canvas 纹理（≤256px，无外部资源） */
  function canvasTex(w,h,draw,rx,ry){
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    t.encoding = THREE.sRGBEncoding;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(rx || 1, ry || 1);
    t.anisotropy = 4;
    return t;
  }

  var g = grp(); g.name = 'boss';

  /* ---------------- 1. 材质（色值取自参考图分区取样） ---------------- */
  var skinM   = std('#f3cdb0', { rough: 0.62 });
  var skinD   = std('#e2a980', { rough: 0.68 });
  var hairM   = std('#523a28', { rough: 0.58 });
  var shirtM  = std('#f4f2ec', { rough: 0.82 });
  var shirtHi = std('#faf8f1', { rough: 0.68 });
  var tieM    = std('#54341f', { rough: 0.72 });
  var shoeM   = std('#1d1712', { rough: 0.2, metal: 0.1, envInt: 1.3 });
  var goldM   = std('#d9a948', { rough: 0.34, metal: 0.8, envInt: 1.2 });
  var irisM   = std('#403026', { rough: 0.4 });
  var pupilM  = std('#14100e', { rough: 0.3 });
  var vestTrim= std('#a87c26', { rough: 0.55, metal: 0.35, envInt: 1.0 });

  /* 金马甲暗纹：近素色 + 极淡同色系涡纹（参考图为近纯色缎面光泽） */
  var vestTex = canvasTex(256, 256, function(ctx){
    ctx.fillStyle = '#c8962e'; ctx.fillRect(0, 0, 256, 256);
    var i, j;
    for (i = 0; i < 5; i++){
      for (j = 0; j < 5; j++){
        var cx = 26 + i * 52, cy = 26 + j * 52;
        ctx.strokeStyle = 'rgba(150, 104, 28, 0.24)';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 9, 0.5, PI - 0.5); ctx.stroke();
        ctx.fillStyle = 'rgba(232, 196, 104, 0.3)';
        ctx.beginPath(); ctx.arc(cx + 18, cy + 18, 1.8, 0, PI * 2); ctx.fill();
      }
    }
  }, 3, 2);
  var vestM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: vestTex,
    roughness: 0.42, metalness: 0.5, envMapIntensity: 1.15 });

  /* 深裤竖条纹（pinstripe，64px 平铺） */
  var pinTex = canvasTex(64, 64, function(ctx){
    ctx.fillStyle = '#241f1a'; ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#332b23';
    ctx.fillRect(0, 0, 2, 64); ctx.fillRect(32, 0, 2, 64);
  }, 12, 2);
  var pantsM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: pinTex, roughness: 0.88 });

  /* ---------------- 2. 躯干（torso 关节 @ (0,0.52,0)；局部 y→世界 +0.52） ---------------- */
  var torso = grp(); torso.position.set(0, 0.52, 0); torso.name = 'torso'; g.add(torso);

  /* 臀部裤腰（腿根填充满档，下坠盖过腿根） */
  var hips = sph(0.345, 18, 12, pantsM, 0, 0.085, 0); hips.scale.set(1.0, 0.7, 0.82); torso.add(hips);

  /* 衬衫躯干：Lathe 梨形剖面（世界 0.54→1.17，肚峰 y≈0.84） */
  var shirtPts = [
    new THREE.Vector2(0.001, 0.02), new THREE.Vector2(0.20, 0.04), new THREE.Vector2(0.30, 0.10),
    new THREE.Vector2(0.355, 0.20), new THREE.Vector2(0.375, 0.32), new THREE.Vector2(0.36, 0.44),
    new THREE.Vector2(0.30, 0.54),  new THREE.Vector2(0.27, 0.60),  new THREE.Vector2(0.24, 0.635),
    new THREE.Vector2(0.001, 0.65)
  ];
  var shirt = mesh(new THREE.LatheGeometry(shirtPts, 22), shirtM);
  shirt.position.y = 0; shirt.scale.z = 0.86; torso.add(shirt);

  /* 金马甲：略大的 Lathe 壳（世界 0.535→1.065） */
  var vestPts = [
    new THREE.Vector2(0.001, 0.015), new THREE.Vector2(0.28, 0.03),  new THREE.Vector2(0.345, 0.08),
    new THREE.Vector2(0.372, 0.20),  new THREE.Vector2(0.388, 0.32), new THREE.Vector2(0.372, 0.42),
    new THREE.Vector2(0.335, 0.50),  new THREE.Vector2(0.298, 0.545)
  ];
  var vest = mesh(new THREE.LatheGeometry(vestPts, 22), vestM);
  vest.scale.z = 0.86; torso.add(vest);

  /* 胸口 V 领衬衫兜兜（马甲开口处的白衬衫） */
  var bibShape = new THREE.Shape();
  bibShape.moveTo(-0.16, 0); bibShape.lineTo(0.16, 0); bibShape.lineTo(0, 0.27); bibShape.closePath();
  var bib = mesh(new THREE.ExtrudeGeometry(bibShape, { depth: 0.02, bevelEnabled: true,
    bevelThickness: 0.006, bevelSize: 0.008, bevelSegments: 2 }), shirtM);
  bib.position.set(0, 0.30, 0.296); bib.rotation.x = -0.30; torso.add(bib);
  /* 马甲驳头（沿 V 两缘的深金窄条） */
  var lapL = box(0.04, 0.27, 0.016, vestTrim, -0.077, 0.432, 0.312);
  lapL.rotation.z = 0.52; lapL.rotation.x = -0.30; torso.add(lapL);
  var lapR = box(0.04, 0.27, 0.016, vestTrim, 0.077, 0.432, 0.312);
  lapR.rotation.z = -0.52; lapR.rotation.x = -0.30; torso.add(lapR);

  /* 领带：结 + 菱截面帔身 + 金领带针 */
  var knot = sph(0.032, 10, 8, tieM, 0, 0.565, 0.272); knot.scale.set(1, 0.85, 0.8); torso.add(knot);
  var blade = cyl(0.012, 0.026, 0.22, 4, tieM, 0, 0.445, 0.302);
  blade.rotation.y = PI / 4; blade.rotation.x = -0.30; blade.scale.z = 0.5; torso.add(blade);
  torso.add(sph(0.016, 8, 6, goldM, 0, 0.55, 0.298));

  /* 衬衫领口：环 + 领尖 */
  var collar = mesh(new THREE.TorusGeometry(0.115, 0.028, 8, 16), shirtHi);
  collar.position.set(0, 0.665, 0.008); collar.rotation.x = PI / 2 - 0.06; torso.add(collar);
  var cptL = box(0.06, 0.05, 0.018, shirtHi, -0.052, 0.63, 0.215);
  cptL.rotation.x = -0.4; cptL.rotation.z = 0.3; torso.add(cptL);
  var cptR = box(0.06, 0.05, 0.018, shirtHi, 0.052, 0.63, 0.215);
  cptR.rotation.x = -0.4; cptR.rotation.z = -0.3; torso.add(cptR);

  /* 马甲扣 ×3（下缘中线） */
  torso.add(sph(0.02, 8, 6, goldM, 0, 0.27, 0.326));
  torso.add(sph(0.02, 8, 6, goldM, 0, 0.18, 0.318));
  torso.add(sph(0.02, 8, 6, goldM, 0, 0.09, 0.298));

  /* 两个暗袋袋唇 + 胸袋巾 */
  var pktL = box(0.10, 0.022, 0.01, vestTrim, -0.19, 0.125, 0.25);
  pktL.rotation.z = 0.26; pktL.rotation.y = 0.5; torso.add(pktL);
  var pktR = box(0.10, 0.022, 0.01, vestTrim, 0.19, 0.125, 0.25);
  pktR.rotation.z = -0.26; pktR.rotation.y = -0.5; torso.add(pktR);
  var pSquare = cyl(0.034, 0.034, 0.014, 3, shirtHi, 0.148, 0.472, 0.25);
  pSquare.rotation.x = PI / 2; pSquare.rotation.z = 0.2; torso.add(pSquare);
  torso.add(box(0.075, 0.012, 0.01, vestTrim, 0.148, 0.456, 0.242));

  /* 怀表链：猫垂曲线 Tube + 两端锚扣 */
  var chainCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, 0.155, 0.248), new THREE.Vector3(-0.12, 0.10, 0.30),
    new THREE.Vector3(0, 0.078, 0.315),     new THREE.Vector3(0.12, 0.10, 0.30),
    new THREE.Vector3(0.24, 0.155, 0.248)
  ]);
  torso.add(mesh(new THREE.TubeGeometry(chainCurve, 20, 0.008, 6, false), goldM));
  torso.add(sph(0.013, 6, 5, goldM, -0.24, 0.158, 0.244));
  torso.add(sph(0.013, 6, 5, goldM, 0.24, 0.158, 0.244));

  /* 背后调节带 + 金扣（背视图识别件） */
  torso.add(box(0.34, 0.05, 0.018, vestTrim, 0, 0.36, -0.325));
  torso.add(box(0.055, 0.04, 0.022, goldM, 0, 0.36, -0.334));
  /* 后裤袋金扣 ×2（背视图识别件） */
  torso.add(box(0.10, 0.012, 0.008, vestTrim, -0.12, -0.03, -0.272));
  torso.add(box(0.10, 0.012, 0.008, vestTrim, 0.12, -0.03, -0.272));
  torso.add(sph(0.011, 6, 5, goldM, -0.12, -0.05, -0.272));
  torso.add(sph(0.011, 6, 5, goldM, 0.12, -0.05, -0.272));

  /* 脖颈 */
  var neck = cyl(0.105, 0.125, 0.12, 12, skinM, 0, 0.64, 0.005); torso.add(neck);

  /* ---------------- 3. 头（head 关节 @ (0,1.1,0)；颅心局部 (0,0.28) → 世界 1.38） ---------------- */
  var head = grp(); head.position.set(0, 1.1, 0); head.name = 'head'; g.add(head);

  var skull = sph(0.295, 22, 16, skinM, 0, 0.28, 0); skull.scale.set(1.0, 0.96, 0.94); head.add(skull);
  /* 腮帮（梨形下半脸） */
  var chkL = sph(0.088, 12, 9, skinM, -0.185, 0.205, 0.155); chkL.scale.set(1, 0.9, 0.85); head.add(chkL);
  var chkR = sph(0.088, 12, 9, skinM, 0.185, 0.205, 0.155); chkR.scale.set(1, 0.9, 0.85); head.add(chkR);
  /* 下巴（圆厚，压住领口 → 双下巴观感） */
  var jaw = sph(0.10, 12, 9, skinM, 0, 0.115, 0.115); jaw.scale.set(1.15, 0.75, 0.95); head.add(jaw);

  /* 耳朵（小、贴发） */
  var earL = sph(0.048, 10, 8, skinM, -0.282, 0.285, -0.005); earL.scale.set(0.5, 1.0, 0.8); head.add(earL);
  var earR = sph(0.048, 10, 8, skinM, 0.282, 0.285, -0.005); earR.scale.set(0.5, 1.0, 0.8); head.add(earR);
  var earinL = sph(0.03, 8, 6, skinD, -0.296, 0.285, 0.008); earinL.scale.set(0.38, 0.66, 0.5); head.add(earinL);
  var earinR = sph(0.03, 8, 6, skinD, 0.296, 0.285, 0.008); earinR.scale.set(0.38, 0.66, 0.5); head.add(earinR);

  /* 大圆鼻 + 鼻梁 */
  head.add(sph(0.066, 12, 9, skinM, 0, 0.252, 0.283));
  var bridge = sph(0.038, 8, 6, skinM, 0, 0.31, 0.258); bridge.scale.set(0.8, 1.3, 0.8); head.add(bridge);

  /* 小豆眼（近距、重睫 → 精明小眼）：眼白极小 + 上睑皮盖压 */
  var s;
  for (s = -1; s <= 1; s += 2){
    var white = sph(0.032, 10, 8, shirtHi, 0.082 * s, 0.314, 0.252);
    white.scale.set(1.0, 0.68, 0.4); head.add(white);
    var iris = sph(0.024, 10, 8, irisM, 0.084 * s, 0.312, 0.266);
    iris.scale.set(1, 1, 0.35); head.add(iris);
    head.add(sph(0.012, 8, 6, pupilM, 0.084 * s, 0.312, 0.274));
    head.add(sph(0.005, 6, 4, shirtHi, 0.071 * s, 0.322, 0.277));
    var lid = sph(0.031, 8, 6, skinM, 0.082 * s, 0.325, 0.252);
    lid.scale.set(1.0, 0.42, 0.5); head.add(lid);
    /* 浓眉（粗黑、压发际、内低外高 → 自信皱眉） */
    var brow = box(0.15, 0.042, 0.032, hairM, 0.11 * s, 0.402, 0.25);
    brow.rotation.z = -0.12 * s; brow.rotation.x = 0.18; head.add(brow);
  }

  /* 上翘八字胡：中瓣 + 每侧 4 瓣渐小上卷（成一体厚胡） */
  var mo = sph(0.048, 10, 8, hairM, 0, 0.19, 0.26); mo.scale.set(1.5, 0.6, 0.75); head.add(mo);
  var moLobes = [
    [0.075, 0.186, 0.256, 0.044, 1.25, 0.6, 0.75, 0],
    [0.135, 0.20, 0.24, 0.038, 1.2, 0.6, 0.75, -0.3],
    [0.185, 0.228, 0.214, 0.031, 1.15, 0.6, 0.7, -0.6],
    [0.222, 0.262, 0.18, 0.025, 1.05, 0.62, 0.65, -0.95]
  ];
  for (s = -1; s <= 1; s += 2){
    for (var mi = 0; mi < moLobes.length; mi++){
      var L = moLobes[mi];
      var lb = sph(L[3], 9, 7, hairM, L[0] * s, L[1], L[2]);
      lb.scale.set(L[4], L[5], L[6]); lb.rotation.z = L[7] * s;
      head.add(lb);
    }
  }
  /* 嘴隐藏于胡下（参考图不可见），不再单独建模 */

  /* 后梳蓬帕杜发型：高位半球盖 + 前倾刘海压沿 + M 额发 + 顶区后掠瓣 + 侧扫 + 脑后波纹 */
  var cap = mesh(new THREE.SphereGeometry(0.305, 22, 12, 0, PI * 2, 0, PI * 0.35), hairM);
  cap.position.set(0, 0.28, -0.005); cap.scale.set(1.07, 1.02, 1.07); head.add(cap);
  var quiff = sph(0.115, 12, 9, hairM, 0, 0.458, 0.155); quiff.scale.set(1.45, 0.5, 0.85); head.add(quiff);
  var peak = sph(0.03, 8, 6, hairM, 0, 0.402, 0.252); peak.scale.set(1.5, 0.75, 0.7); head.add(peak);
  head.add(sph(0.032, 8, 6, hairM, -0.08, 0.425, 0.24));
  head.add(sph(0.032, 8, 6, hairM, 0.08, 0.425, 0.24));
  var pom = [
    [0, 0.465, 0.05, 0.160, 1.5, 0.62, 1.05],
    [0, 0.49, -0.08, 0.165, 1.42, 0.68, 1.1],
    [0, 0.455, -0.20, 0.160, 1.35, 0.68, 1.05],
    [0, 0.44, 0.16, 0.140, 1.3, 0.52, 0.8]
  ];
  for (var pi = 0; pi < pom.length; pi++){
    var P = pom[pi];
    var lobe = sph(P[3], 14, 10, hairM, P[0], P[1], P[2]);
    lobe.scale.set(P[4], P[5], P[6]); head.add(lobe);
  }
  var sideL = sph(0.115, 10, 8, hairM, -0.26, 0.35, -0.03); sideL.scale.set(0.6, 1.35, 1.5); head.add(sideL);
  var sideR = sph(0.115, 10, 8, hairM, 0.26, 0.35, -0.03); sideR.scale.set(0.6, 1.35, 1.5); head.add(sideR);
  /* 太阳穴补块：圆化半球盖直边，衔接侧发 */
  var tmpL = sph(0.048, 8, 6, hairM, -0.225, 0.408, 0.175); tmpL.scale.set(0.7, 0.85, 0.75); head.add(tmpL);
  var tmpR = sph(0.048, 8, 6, hairM, 0.225, 0.408, 0.175); tmpR.scale.set(0.7, 0.85, 0.75); head.add(tmpR);
  var sbnL = sph(0.05, 8, 6, hairM, -0.278, 0.205, 0.095); sbnL.scale.set(0.42, 1.05, 0.75); head.add(sbnL);
  var sbnR = sph(0.05, 8, 6, hairM, 0.278, 0.205, 0.095); sbnR.scale.set(0.42, 1.05, 0.75); head.add(sbnR);
  var back1 = sph(0.15, 12, 8, hairM, 0, 0.36, -0.26); back1.scale.set(1.55, 0.78, 0.9); head.add(back1);
  var back2 = sph(0.135, 12, 8, hairM, 0, 0.235, -0.245); back2.scale.set(1.45, 0.7, 0.85); head.add(back2);
  var nape = sph(0.105, 10, 8, hairM, 0, 0.12, -0.185); nape.scale.set(1.3, 0.78, 0.75); head.add(nape);

  /* ---------------- 4. 手臂 ---------------- */
  /* 右臂（x=-0.39）：持杖前伸拄地 —— 姿态烘进网格（view3d 会覆写关节旋转） */
  var armR = grp(); armR.position.set(-0.39, 1.0, 0); armR.name = 'armR'; g.add(armR);
  armR.add(sph(0.076, 12, 9, shirtM, 0.01, -0.05, 0));
  var ruR = cyl(0.074, 0.058, 0.19, 12, shirtM, 0.012, -0.135, 0.006); ruR.rotation.x = 0.10; armR.add(ruR);
  armR.add(sph(0.054, 10, 8, shirtM, 0, -0.215, 0.022));
  var rfR = cyl(0.05, 0.042, 0.13, 12, shirtM, 0.002, -0.27, 0.042); rfR.rotation.x = 0.18; armR.add(rfR);
  var cfR = cyl(0.048, 0.048, 0.034, 12, shirtHi, 0.006, -0.315, 0.056); cfR.rotation.x = 0.18; armR.add(cfR);
  var handR = sph(0.05, 10, 8, skinM, 0.008, -0.345, 0.078); handR.scale.set(0.72, 0.98, 0.82); armR.add(handR);
  armR.add(sph(0.019, 8, 6, skinM, -0.016, -0.332, 0.098));

  /* 手杖：金柄头 + 双金环 + 深色杖身 + 金箍尖（杖尖落地 y≈0.02，前伸 z≈0.14） */
  var cane = grp(); cane.position.set(0.008, -0.35, 0.08); cane.rotation.x = 0.10; armR.add(cane);
  var grip = cyl(0.022, 0.022, 0.10, 10, goldM, 0, 0.03, 0); cane.add(grip);
  cane.add(sph(0.048, 12, 9, goldM, 0, 0.108, 0));
  var ring1 = mesh(new THREE.TorusGeometry(0.025, 0.006, 6, 12), goldM);
  ring1.position.y = 0.068; ring1.rotation.x = PI / 2; cane.add(ring1);
  var ring2 = mesh(new THREE.TorusGeometry(0.025, 0.006, 6, 12), goldM);
  ring2.position.y = 0.088; ring2.rotation.x = PI / 2; cane.add(ring2);
  cane.add(cyl(0.018, 0.013, 0.58, 10, shoeM, 0, -0.28, 0));
  cane.add(cyl(0.014, 0.014, 0.05, 8, goldM, 0, -0.595, 0));
  cane.add(sph(0.014, 8, 6, goldM, 0, -0.622, 0));

  /* 左臂（x=+0.39）：叉腰 —— 肩→肘外张，肘→腕收向髋 */
  var armL = grp(); armL.position.set(0.39, 1.0, 0); armL.name = 'armL'; g.add(armL);
  armL.add(sph(0.076, 12, 9, shirtM, -0.01, -0.05, 0));
  var ruL = cyl(0.074, 0.056, 0.19, 12, shirtM, -0.012, -0.125, -0.002); ruL.rotation.z = -0.56; armL.add(ruL);
  armL.add(sph(0.054, 10, 8, shirtM, 0.1, -0.20, -0.005));
  var rfL = cyl(0.05, 0.04, 0.15, 12, shirtM, 0.046, -0.252, 0.01);
  rfL.rotation.z = 0.66; rfL.rotation.x = 0.12; armL.add(rfL);
  var cfL = cyl(0.046, 0.046, 0.034, 12, shirtHi, 0.005, -0.302, 0.03); cfL.rotation.z = 0.66; armL.add(cfL);
  var handL = sph(0.05, 10, 8, skinM, -0.006, -0.318, 0.048);
  handL.scale.set(0.78, 1.0, 0.88); armL.add(handL);

  /* ---------------- 5. 腿（镜像：legL s=+1，legR s=-1） ---------------- */
  function buildLeg(s){
    var pv = grp(); pv.position.set(0.17 * s, 0.5, 0); pv.name = s > 0 ? 'legL' : 'legR'; g.add(pv);
    var th = cyl(0.128, 0.104, 0.26, 12, pantsM, 0.02 * s, -0.155, 0);
    th.rotation.z = 0.10 * s; pv.add(th);
    var ca = cyl(0.10, 0.075, 0.22, 12, pantsM, 0.035 * s, -0.395, 0.005);
    ca.rotation.z = 0.06 * s; pv.add(ca);
    var cuff = cyl(0.08, 0.08, 0.06, 12, pantsM, 0.042 * s, -0.465, 0.005); pv.add(cuff);
    /* 鞋（脚尖外八 0.14rad，鞋底正好 -0.5 → 世界 0） */
    var shoeG = grp(); shoeG.position.set(0.04 * s, 0, 0.02); shoeG.rotation.y = 0.14 * s; pv.add(shoeG);
    shoeG.add(box(0.155, 0.026, 0.25, shoeM, 0.005 * s, -0.484, 0.025));
    shoeG.add(box(0.145, 0.058, 0.22, shoeM, 0.005 * s, -0.442, 0.02));
    var toe = sph(0.058, 12, 9, shoeM, 0.005 * s, -0.458, 0.115);
    toe.scale.set(1.05, 0.6, 1.2); shoeG.add(toe);
    shoeG.add(box(0.115, 0.05, 0.08, shoeM, 0.005 * s, -0.456, -0.08));
    shoeG.add(box(0.028, 0.022, 0.012, goldM, 0.064 * s, -0.442, 0.035));
    return pv;
  }
  var legL = buildLeg(1), legR = buildLeg(-1);

  /* ---------------- 6. 装配契约 + 待机动画 ---------------- */
  g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };

  /* 待机：肚腩呼吸（马甲/衬衫 xz 缩放）+ 重心微晃 + 手杖随呼吸轻点。
   * 只用 view3d.animToken 不覆写的通道（torso.rotation、网格 scale、cane.rotation）。 */
  var breath = 0;
  g.userData.anim = [function (t, dt){
    breath = sin(t * 1.7) * 0.014;
    shirt.scale.x = 1 + breath * 0.55; shirt.scale.z = 0.86 * (1 + breath);
    vest.scale.x = 1 + breath * 0.55; vest.scale.z = 0.86 * (1 + breath);
    torso.rotation.z = sin(t * 0.8) * 0.02;
    torso.rotation.x = sin(t * 1.7) * 0.008;
    cane.rotation.x = 0.10 + sin(t * 1.7 + 0.6) * 0.025;
    return breath;
  }];

  return g;
};

})();
