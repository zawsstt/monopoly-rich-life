/* =====================================================================================
 * 大富翁 · 富贵人生 —— 精细角色：土老财 tu（img2threejs 管线产出）
 * -------------------------------------------------------------------------------------
 * 参考图：refs/char_tu.png（三视图转台：正/侧/背）。
 * 形象：笑呵呵的乡下地主 —— 矮胖梨形身材 + 宽檐草帽（编织纹/棕帽箍/帽檐须边）+
 *       雪白浓眉 + 大圆黑褐眼(高光) + 大圆鼻 + 红晕腮 + 下垂八字胡 +
 *       全罩式白胡须(垂胸/竖纹) + 帽檐两侧/脑后白发 + 米白卷袖衬衫 +
 *       绿背带裤(大肚/胸兜贴袋明线/前带铜扣/肩桥/背后 X 交叉带/后贴袋/后腰缝线) +
 *       浅绿双层卷裤脚 + 圆头棕布鞋。
 *       ※ 设定文案提示瓜皮帽/烟斗/算盘，参考图实测为宽檐草帽、双手空 —— 以图为准。
 *
 * 管线阶段（img2threejs: blockout→structure→form→material→lighting→interaction→optimization）
 *   blockout  : 帽椭圆/颅球/蛋形躯干/短腿五段剪影，总宽高比 ≈0.60（spec 实测）
 *   structure : 六关节装配（下方契约），所有 -l/-r 对经单一 s=±1 代码路径镜像（仅取反 x）
 *   form R1   : 五官 z 沉入颅面（眼球前缘 0.260 < 颅表 0.276 只剩瞳点）、胡须落后于面
 *               （侧视鼻在前胡在后）、X 背带过短过高、铜扣被胡吞 —— 判 FAIL
 *   form R2   : 五官前移出颅面(眼/眉/鼻/胡前缘 0.28~0.38)、胡主体 z 0.19 前凸超越鼻下巴、
 *               背带改 前带→肩桥→背 X 三段、加后贴袋明线、须边/鬓发收敛 —— 本轮通过转台复检
 *   material  : 全 MeshStandardMaterial + convertSRGBToLinear；仅程序化 Canvas(≤256) 编织纹
 *   lighting  : roughness 分区（皮肤 0.6 光润 / 布料 0.85 亚光 / 黄铜 0.35+metal0.8 / 鞋 0.55）
 *   interaction: userData.anim 只用 view3d.animToken 不覆写的通道（torso.rotation/网格 scale/
 *               胡须+帽檐子组微动）；六关节 rotation/position 留给 view3d
 *   optimization: ~125 mesh ≪ 400；Lathe 段数 20-26、球 8-16 段；纹理 128px×2
 *
 * 装配契约（view3d.js animToken 按此硬驱动，位置必须精确）：
 *   根 Group name='tu'，正面朝 +Z；userData.parts = { head, torso, armL, armR, legL, legR }
 *   legL/legR (±0.18, 0.5, 0) 腿网格关节内 y≈-0.22 鞋底 -0.5；torso (0,0.52,0) 躯干主体 y≈+0.32；
 *   armL/armR (±0.40, 1.0, 0) 臂网格 y≈-0.15~-0.32(手掌)；head (0,1.1,0) 颅心 y≈+0.28。
 *   总身高 ≈1.74（外部再乘 1.08）；脚底贴地 y≈0。
 *   默认姿态烘进关节内网格偏移（view3d 每帧覆写关节旋转）。
 * 依赖：全局 THREE r147。经典脚本，无模块，无外部资源。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[chars3d/tu] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

window.Char3D = window.Char3D || {};

window.Char3D.tu = function () {

  /* ---------------- 0. 工具（色值 sRGB→Linear，与 buildings3d.std 同约定） ---------------- */
  var PI = Math.PI, sin = Math.sin, cos = Math.cos, abs = Math.abs;
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
    return m;
  }
  function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
  function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function sph(r, ws, hs, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, ws, hs), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
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

  var g = grp(); g.name = 'tu';

  /* ---------------- 1. 材质（色值取自参考图分区取样） ---------------- */
  var skinM  = std('#f2be9e', { rough: 0.60 });   /* 红润皮肤 */
  var skinD  = std('#eaa183', { rough: 0.66 });   /* 皮肤暗部/耳窝/鼻孔 */
  var noseM  = std('#edad8d', { rough: 0.58 });   /* 大圆鼻（略粉） */
  var blushM = std('#f09e82', { rough: 0.80 });   /* 腮红 */
  var beardM = std('#f4efe2', { rough: 0.85 });   /* 胡须/眉/白发 主体 */
  var beardS = std('#ddd5c0', { rough: 0.88 });   /* 胡须阴影/须纹 */
  var shirtM = std('#efe9d8', { rough: 0.84 });   /* 米白衬衫 */
  var shirtHi= std('#f6f1e2', { rough: 0.78 });   /* 衬衫卷袖亮面 */
  var greenM = std('#7ba35b', { rough: 0.86 });   /* 背带裤绿 */
  var greenD = std('#5d8444', { rough: 0.88 });   /* 裤缝/腰线暗绿 */
  var cuffM  = std('#93b06b', { rough: 0.84 });   /* 卷脚口浅绿 */
  var brassM = std('#c99544', { rough: 0.35, metal: 0.8, envInt: 1.15 }); /* 背带铜扣 */
  var shoeM  = std('#8a5a36', { rough: 0.55 });   /* 棕鞋 */
  var shoeDk = std('#6e4526', { rough: 0.62 });   /* 鞋舌/鞋领 */
  var soleM  = std('#4e3826', { rough: 0.90 });   /* 深色鞋底 */
  var irisM  = std('#4a2b18', { rough: 0.40 });   /* 虹膜深褐 */
  var pupilM = std('#1a0f08', { rough: 0.30 });   /* 瞳孔 */
  var dotM   = std('#ffffff', { rough: 0.35 });   /* 眼白/高光 */

  /* 草帽编织纹：错缝席纹（128px 平铺） */
  var strawTex = canvasTex(128, 128, function (ctx) {
    ctx.fillStyle = '#e2ae56'; ctx.fillRect(0, 0, 128, 128);
    var i, j;
    for (j = 0; j < 8; j++) {
      for (i = 0; i < 8; i++) {
        var off = (j % 2) * 8;
        ctx.fillStyle = (i + j) % 2 ? '#d3a04a' : '#eec276';
        ctx.fillRect(i * 16 + off - 8, j * 16 + 1, 14, 6);
        ctx.fillStyle = 'rgba(160, 116, 44, 0.35)';
        ctx.fillRect(i * 16 + off - 8, j * 16 + 7, 14, 1.6);
        ctx.fillStyle = 'rgba(246, 214, 140, 0.5)';
        ctx.fillRect(i * 16 + off - 8, j * 16 + 1, 14, 1.4);
      }
    }
  }, 7, 2);
  var strawM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: strawTex, roughness: 0.82 });
  var strawTex2 = strawTex.clone(); strawTex2.needsUpdate = true; strawTex2.repeat.set(3, 1.6);
  var strawM2 = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: strawTex2, roughness: 0.82 });
  var bandM  = std('#7c4a28', { rough: 0.72 });   /* 棕帽箍 */

  /* ---------------- 2. 躯干（torso 关节 @ (0,0.52,0)；局部 y→世界 +0.52） ---------------- */
  var torso = grp(); torso.position.set(0, 0.52, 0); torso.name = 'torso'; g.add(torso);

  /* 臀裆填充（绿，填满两腿根之间） */
  var hips = sph(0.33, 16, 12, greenM, 0, 0.06, 0); hips.scale.set(1.05, 0.75, 0.9); torso.add(hips);

  /* 衬衫上躯干：Lathe（世界 0.90→1.18，肩带以上露白；袖肩宽度由臂关节三角肌补） */
  var shirtPts = [
    new THREE.Vector2(0.001, 0.375), new THREE.Vector2(0.26, 0.382), new THREE.Vector2(0.315, 0.405),
    new THREE.Vector2(0.348, 0.45),  new THREE.Vector2(0.352, 0.50),  new THREE.Vector2(0.325, 0.565),
    new THREE.Vector2(0.275, 0.615), new THREE.Vector2(0.238, 0.645), new THREE.Vector2(0.001, 0.66)
  ];
  var shirt = mesh(new THREE.LatheGeometry(shirtPts, 22), shirtM);
  shirt.name = 'shirt'; shirt.scale.z = 0.92; torso.add(shirt);

  /* 背带裤裤身（含大肚）：Lathe（世界 0.52→0.995，肚峰 r0.412 @ 局部 0.25） */
  var ovPts = [
    new THREE.Vector2(0.001, 0.015), new THREE.Vector2(0.30, 0.04),  new THREE.Vector2(0.378, 0.10),
    new THREE.Vector2(0.406, 0.18),  new THREE.Vector2(0.412, 0.25), new THREE.Vector2(0.398, 0.33),
    new THREE.Vector2(0.372, 0.41),  new THREE.Vector2(0.342, 0.472)
  ];
  var overall = mesh(new THREE.LatheGeometry(ovPts, 22), greenM);
  overall.name = 'overall'; overall.scale.z = 0.92; torso.add(overall);

  /* 裤腰缝线（世界 ≈0.99，微凸暗绿细环） */
  var waistband = mesh(new THREE.TorusGeometry(0.344, 0.009, 8, 26), greenD);
  waistband.name = 'waistband';
  waistband.position.set(0, 0.468, 0); waistband.rotation.x = PI / 2;
  waistband.scale.z = 0.92; torso.add(waistband);

  /* 胸兜组（微后仰贴肚面）：兜板 + 四边明线 */
  var bibG = grp(); bibG.rotation.x = -0.10; torso.add(bibG);
  var bibShape = new THREE.Shape();
  (function (s, w, h, r) {
    s.moveTo(-w + r, -h);
    s.lineTo(w - r, -h); s.quadraticCurveTo(w, -h, w, -h + r);
    s.lineTo(w, h - r);  s.quadraticCurveTo(w, h, w - r, h);
    s.lineTo(-w + r, h); s.quadraticCurveTo(-w, h, -w, h - r);
    s.lineTo(-w, -h + r); s.quadraticCurveTo(-w, -h, -w + r, -h);
  })(bibShape, 0.18, 0.14, 0.035);
  var bib = mesh(new THREE.ExtrudeGeometry(bibShape, { depth: 0.022, bevelEnabled: true,
    bevelThickness: 0.005, bevelSize: 0.008, bevelSegments: 2 }), greenM);
  bib.name = 'bib';
  bib.position.set(0, 0.555, 0.300); bib.rotation.x = 0.10; bibG.add(bib);
  /* 兜：贴袋 + 明线四条（浅绿，参考图口袋描线） */
  var pkt = box(0.20, 0.128, 0.016, greenM, 0, 0.465, 0.330); pkt.name = 'pocket'; bibG.add(pkt);
  bibG.add(box(0.204, 0.010, 0.004, cuffM, 0, 0.528, 0.338));
  bibG.add(box(0.204, 0.010, 0.004, cuffM, 0, 0.402, 0.338));
  bibG.add(box(0.010, 0.130, 0.004, cuffM, -0.098, 0.465, 0.338));
  bibG.add(box(0.010, 0.130, 0.004, cuffM, 0.098, 0.465, 0.338));

  /* 前背带 ×2（兜顶→肩顶）+ 肩桥（翻过肩线接背带） */
  var sb;
  for (sb = -1; sb <= 1; sb += 2) {
    var sf = box(0.075, 0.17, 0.028, greenM, 0.16 * sb, 0.655, 0.20);
    sf.rotation.x = -0.75; sf.name = sb > 0 ? 'strapFrontL' : 'strapFrontR';
    torso.add(sf);
    torso.add(box(0.075, 0.045, 0.30, greenM, 0.16 * sb, 0.662, 0.0)); /* 肩桥 */
  }
  /* 后 X 交叉背带 ×2（背视图识别件，宽臂大 X 交叉入腰） */
  for (sb = -1; sb <= 1; sb += 2) {
    var xb = box(0.075, 0.44, 0.026, greenM, 0.065 * sb, 0.47, -0.322);
    xb.rotation.z = 0.72 * sb; xb.rotation.x = -0.08; xb.name = sb > 0 ? 'strapBackL' : 'strapBackR';
    torso.add(xb);
  }
  /* 前带铜扣 ×2（兜顶两角，胡须外缘可见） */
  bibG.add(sph(0.026, 10, 8, brassM, -0.19, 0.70, 0.322));
  bibG.add(sph(0.026, 10, 8, brassM, 0.19, 0.70, 0.322));
  /* 后贴袋 ×2 + 明线（背视图识别件，臀位） */
  for (sb = -1; sb <= 1; sb += 2) {
    var bp = box(0.15, 0.13, 0.014, greenM, 0.145 * sb, 0.20, -0.352);
    bp.rotation.x = 0.25; bp.rotation.y = -0.39 * sb; bp.name = sb > 0 ? 'backPocketL' : 'backPocketR';
    torso.add(bp);
    var bs1 = box(0.152, 0.009, 0.004, cuffM, 0.145 * sb, 0.262, -0.372);
    bs1.rotation.x = 0.25; bs1.rotation.y = -0.39 * sb; torso.add(bs1);
  }
  /* 裆中线缝（前视下腹识别线） */
  torso.add(box(0.012, 0.17, 0.008, greenD, 0, 0.135, 0.372));

  /* 脖颈（被胡/白发遮大半） */
  torso.add(cyl(0.10, 0.118, 0.14, 12, skinM, 0, 0.655, 0.005));

  /* ---------------- 3. 头（head 关节 @ (0,1.1,0)；颅心局部 (0,0.28) → 世界 1.38） ---------------- */
  var head = grp(); head.position.set(0, 1.1, 0); head.name = 'head'; g.add(head);

  var skull = sph(0.29, 22, 16, skinM, 0, 0.28, 0); skull.scale.set(0.98, 0.95, 0.96); head.add(skull);
  /* 腮帮（下半脸加宽） */
  var chkL = sph(0.095, 12, 9, skinM, -0.155, 0.185, 0.115); chkL.scale.set(1, 0.85, 0.9); head.add(chkL);
  var chkR = sph(0.095, 12, 9, skinM, 0.155, 0.185, 0.115); chkR.scale.set(1, 0.85, 0.9); head.add(chkR);

  /* 耳朵（大圆招风） */
  var s2;
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var ear = sph(0.075, 12, 9, skinM, 0.272 * s2, 0.27, -0.01);
    ear.scale.set(0.5, 1.1, 0.85); head.add(ear);
    var earin = sph(0.048, 8, 6, skinD, 0.29 * s2, 0.27, 0.008);
    earin.scale.set(0.3, 0.8, 0.6); head.add(earin);
  }

  /* 白发：帽檐两侧鬓角（小撮）+ 脑后扁发带（背视图识别件） */
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var h1 = sph(0.045, 10, 8, beardM, 0.245 * s2, 0.395, 0.01); h1.scale.set(0.5, 1.05, 0.9); head.add(h1);
    var h2 = sph(0.04, 10, 8, beardM, 0.262 * s2, 0.33, 0.03); h2.scale.set(0.45, 0.9, 0.8); head.add(h2);
  }
  var nape1 = sph(0.12, 14, 10, beardM, 0, 0.13, -0.205); nape1.scale.set(1.85, 0.85, 0.5); head.add(nape1);
  var nape2 = sph(0.13, 14, 10, beardM, 0, 0.30, -0.23); nape2.scale.set(1.9, 0.95, 0.5); head.add(nape2);

  /* 眼（大圆黑褐，前缘出颅面；高光左上 + 上睑皮） */
  var s3;
  for (s3 = -1; s3 <= 1; s3 += 2) {
    var white = sph(0.044, 12, 9, dotM, 0.098 * s3, 0.313, 0.262);
    white.scale.set(1.0, 1.12, 0.5); head.add(white);
    var iris = sph(0.036, 12, 9, irisM, 0.098 * s3, 0.313, 0.2765);
    iris.scale.set(1, 1, 0.38); head.add(iris);
    head.add(sph(0.019, 8, 6, pupilM, 0.098 * s3, 0.312, 0.2825));
    head.add(sph(0.009, 6, 5, dotM, 0.098 * s3 - 0.011, 0.324, 0.287));
    var lid = sph(0.045, 8, 6, skinM, 0.098 * s3, 0.335, 0.262);
    lid.scale.set(1.05, 0.5, 0.5); head.add(lid);
  }

  /* 雪白浓眉（粗拱、前缘出面、内低外高；压帽檐下仍可见） */
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var brow = box(0.15, 0.06, 0.05, beardM, 0.105 * s2, 0.402, 0.268);
    brow.rotation.z = 0.15 * s2; brow.rotation.x = 0.12; head.add(brow);
    var bush = sph(0.038, 8, 6, beardM, 0.16 * s2, 0.418, 0.25); bush.scale.set(1, 0.9, 0.9); head.add(bush);
  }

  /* 大圆鼻（前凸超越面）+ 鼻梁 + 鼻孔 */
  var nose = sph(0.08, 14, 10, noseM, 0, 0.272, 0.295); nose.scale.set(1.02, 0.95, 1.0);
  nose.name = 'nose'; head.add(nose);
  var bridge = sph(0.045, 8, 6, skinM, 0, 0.325, 0.283); bridge.scale.set(0.85, 1.3, 0.8); head.add(bridge);
  head.add(sph(0.018, 6, 5, skinD, -0.034, 0.238, 0.352));
  head.add(sph(0.018, 6, 5, skinD, 0.034, 0.238, 0.352));

  /* 腮红（脸颊前侧，不出脸缘） */
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var bl = sph(0.048, 8, 6, blushM, 0.15 * s2, 0.215, 0.262);
    bl.scale.set(1.2, 0.65, 0.4); head.add(bl);
  }

  /* 八字胡（中瓣+每侧 3 瓣渐小急垂，压鼻下覆盖嘴位，不与胡成环） */
  var mo = sph(0.055, 10, 8, beardM, 0, 0.19, 0.305); mo.scale.set(1.6, 0.6, 0.72);
  mo.name = 'mustache'; head.add(mo);
  var moLobes = [
    [0.085, 0.18, 0.30, 0.048, 1.6, 0.6, 0.7, -0.3],
    [0.15, 0.155, 0.278, 0.043, 1.5, 0.58, 0.66, -0.65],
    [0.20, 0.115, 0.245, 0.035, 1.3, 0.55, 0.6, -1.0]
  ];
  var s4;
  for (s4 = -1; s4 <= 1; s4 += 2) {
    for (var mi = 0; mi < moLobes.length; mi++) {
      var L = moLobes[mi];
      var lb = sph(L[3], 9, 7, beardM, L[0] * s4, L[1], L[2]);
      lb.scale.set(L[4], L[5], L[6]); lb.rotation.z = L[7] * s4;
      head.add(lb);
    }
  }

  /* 白胡须组（垂胸大胡：上宽框腮、下收圆尖、前凸罩住下巴嘴；挂 head 关节随头动） */
  var beardG = grp(); beardG.name = 'beardG'; head.add(beardG);
  var beardMain = sph(0.17, 16, 12, beardM, 0, 0.045, 0.19);
  beardMain.scale.set(1.16, 1.5, 0.78); beardMain.name = 'beardMain'; beardG.add(beardMain);
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var bc = sph(0.082, 10, 8, beardM, 0.16 * s2, 0.165, 0.16);
    bc.scale.set(0.95, 1.5, 0.85); bc.name = s2 > 0 ? 'beardCheekL' : 'beardCheekR'; beardG.add(bc);
  }
  var tip1 = sph(0.088, 12, 9, beardM, 0, -0.105, 0.20); tip1.scale.set(1.32, 0.85, 0.72); beardG.add(tip1);
  var tip2 = sph(0.062, 10, 8, beardM, 0, -0.14, 0.205); tip2.scale.set(1.1, 0.72, 0.66); beardG.add(tip2);
  /* 须纹（竖向浅阴影，参考图 beard 沟纹） */
  var cr;
  for (var ci = -1; ci <= 1; ci++) {
    cr = sph(0.012, 6, 5, beardS, 0.07 * ci, 0.05 + 0.01 * (1 - abs(ci)), 0.326);
    cr.scale.set(0.6, 3.4 + 0.2 * (1 - abs(ci)), 0.4);
    beardG.add(cr);
  }

  /* ---------------- 草帽（宽檐 + 编织纹 + 棕箍 + 檐须；无顶珠——以图为准） ---------------- */
  var hatG = grp(); hatG.name = 'hatG'; hatG.rotation.x = 0.02; head.add(hatG);
  var brimPts = [
    new THREE.Vector2(0.16, 0.012), new THREE.Vector2(0.24, 0.005), new THREE.Vector2(0.32, -0.007),
    new THREE.Vector2(0.395, -0.019), new THREE.Vector2(0.424, -0.026), new THREE.Vector2(0.428, -0.035),
    new THREE.Vector2(0.414, -0.04), new THREE.Vector2(0.355, -0.032), new THREE.Vector2(0.275, -0.019),
    new THREE.Vector2(0.20, -0.009), new THREE.Vector2(0.16, -0.007)
  ];
  var brim = mesh(new THREE.LatheGeometry(brimPts, 26), strawM);
  brim.name = 'hatBrim'; brim.position.set(0, 0.448, 0); brim.scale.z = 0.99; hatG.add(brim);
  /* 檐须（编织毛边小锥刺，参考图帽缘乱丝，非对称布点） */
  var frays = [
    [0.62, 0.028], [1.85, 0.024], [2.55, 0.03], [3.6, 0.022], [4.45, 0.028], [5.5, 0.024]
  ];
  for (var fi = 0; fi < frays.length; fi++) {
    var F = frays[fi];
    var fr = mesh(new THREE.ConeGeometry(0.009, 0.05, 5), strawM2);
    fr.name = 'hatFray' + fi;
    fr.position.set(cos(F[0]) * 0.425, 0.4415 + F[1], sin(F[0]) * 0.425);
    fr.rotation.z = -(PI / 2 - 0.21) * cos(F[0]);
    fr.rotation.x = (PI / 2 - 0.21) * sin(F[0]);
    hatG.add(fr);
  }
  var crownPts = [
    new THREE.Vector2(0.001, 0.0), new THREE.Vector2(0.15, 0.002), new THREE.Vector2(0.172, 0.03),
    new THREE.Vector2(0.185, 0.09), new THREE.Vector2(0.18, 0.145), new THREE.Vector2(0.152, 0.176),
    new THREE.Vector2(0.10, 0.188), new THREE.Vector2(0.001, 0.19)
  ];
  var crown = mesh(new THREE.LatheGeometry(crownPts, 22), strawM2);
  crown.name = 'hatCrown'; crown.position.set(0, 0.448, 0); hatG.add(crown);
  var band = cyl(0.181, 0.176, 0.062, 22, bandM, 0, 0.478, 0);
  band.name = 'hatBand'; hatG.add(band);

  /* ---------------- 4. 手臂（镜像：armL s=+1，armR s=-1；姿态烘进网格偏移） ---------------- */
  function buildArm(s) {
    var pv = grp(); pv.position.set(0.40 * s, 1.0, 0); pv.name = s > 0 ? 'armL' : 'armR'; g.add(pv);
    pv.add(sph(0.088, 12, 9, shirtM, 0.005 * s, -0.045, 0));            /* 三角肌泡袖 */
    var slv = cyl(0.078, 0.068, 0.17, 12, shirtM, 0.012 * s, -0.145, 0.008);
    slv.rotation.x = -0.06; pv.add(slv);                                 /* 泡袖筒（手下前） */
    var cuff = cyl(0.074, 0.071, 0.045, 12, shirtHi, 0.014 * s, -0.238, 0.012);
    cuff.rotation.x = -0.06; cuff.name = s > 0 ? 'armCuffL' : 'armCuffR'; pv.add(cuff); /* 卷袖 */
    var fam = cyl(0.058, 0.052, 0.115, 12, skinM, 0.022 * s, -0.305, 0.017);
    fam.rotation.x = -0.05; pv.add(fam);                                 /* 裸前臂 */
    var hand = sph(0.055, 12, 9, skinM, 0.03 * s, -0.352, 0.022);
    hand.scale.set(0.85, 1.05, 0.9); hand.name = s > 0 ? 'handL' : 'handR'; pv.add(hand);
    pv.add(sph(0.02, 8, 6, skinM, -0.01 * s, -0.335, 0.042));            /* 拇指含混 */
    return pv;
  }
  var armL = buildArm(1), armR = buildArm(-1);

  /* ---------------- 5. 腿（镜像：legL s=+1，legR s=-1） ---------------- */
  function buildLeg(s) {
    var pv = grp(); pv.position.set(0.18 * s, 0.5, 0); pv.name = s > 0 ? 'legL' : 'legR'; g.add(pv);
    var th = cyl(0.118, 0.104, 0.23, 12, greenM, 0.012 * s, -0.15, 0);
    th.rotation.z = 0.06 * s; pv.add(th);
    var sn = cyl(0.098, 0.088, 0.19, 12, greenM, 0.022 * s, -0.36, 0.004);
    sn.rotation.z = 0.03 * s; pv.add(sn);
    pv.add(box(0.012, 0.30, 0.008, greenD, 0.028 * s, -0.28, 0.085));    /* 前裤缝 */
    pv.add(cyl(0.095, 0.092, 0.045, 12, cuffM, 0.023 * s, -0.432, 0.004)); /* 卷脚 ×2 */
    pv.add(cyl(0.092, 0.089, 0.04, 12, cuffM, 0.023 * s, -0.465, 0.004));
    /* 鞋（脚尖外八 0.12rad，鞋底正好 -0.5 → 世界 0） */
    var shoeG = grp(); shoeG.position.set(0.024 * s, 0, 0.01); shoeG.rotation.y = 0.12 * s; pv.add(shoeG);
    shoeG.add(box(0.15, 0.028, 0.24, soleM, 0, -0.486, 0.03));
    shoeG.add(box(0.14, 0.05, 0.19, shoeM, 0, -0.445, 0.02));
    var toe = sph(0.055, 12, 9, shoeM, 0, -0.458, 0.105); toe.scale.set(1.0, 0.62, 1.15); shoeG.add(toe);
    shoeG.add(box(0.12, 0.048, 0.07, shoeM, 0, -0.452, -0.075));
    shoeG.add(box(0.10, 0.032, 0.06, shoeDk, 0, -0.412, -0.005));        /* 鞋领/舌 */
    return pv;
  }
  var legL = buildLeg(1), legR = buildLeg(-1);

  /* ---------------- 6. 装配契约 + 待机动画 ---------------- */
  g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };

  /* 待机：肚腩呼吸（衬衫/裤身 xz 缩放）+ 重心微晃 + 胡须轻颤 + 帽檐微摆。
   * 只用 view3d.animToken 不覆写的通道（torso.rotation、网格 scale、beardG/hatG 子组）。 */
  var breath = 0;
  g.userData.anim = [function (t, dt) {
    breath = sin(t * 1.6) * 0.014;
    shirt.scale.x = 1 + breath * 0.5; shirt.scale.z = 0.92 * (1 + breath);
    overall.scale.x = 1 + breath * 0.62; overall.scale.z = 0.92 * (1 + breath);
    torso.rotation.z = sin(t * 0.7) * 0.02;
    torso.rotation.x = sin(t * 1.6) * 0.008;
    beardG.rotation.x = sin(t * 1.6 + 0.5) * 0.018;
    beardG.scale.x = 1 + breath * 0.3;
    hatG.rotation.z = sin(t * 0.9) * 0.012;
    return breath;
  }];

  return g;
};

})();
