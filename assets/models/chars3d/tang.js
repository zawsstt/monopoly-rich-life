/* =====================================================================================
 * 大富翁 · 富贵人生 —— 精细角色：糖糖 tang（v3 深度精修版，基于 v2 三次迭代）
 * -------------------------------------------------------------------------------------
 * 参考图：refs/char_tang.png（三视图：正/侧/背）+ assets/img/full3_tang.png（正面全身立绘）
 *        + pose_tang_cheer/hit.png（表情神态）。v3 在 v2 已验收形态上做细节加厚，不改轮廓/配色/契约。
 *
 * v3 深度精修清单（面部 / 手部四肢 优先；对照差距清单 T1-T15）：
 *   T1  张嘴笑加粉舌（立绘/pose 图口内可见舌）+ 下唇线
 *   T2  睫毛由 1 根外角锥 → 3 根扇形外角睫（长→短渐变）+ 双眼皮褶线（上睫上方细弧）
 *   T3  虹膜下缘亮弧（浅琥珀，瞳孔下方通透感 = 立绘大眼渐变）
 *   T4  眉毛加深（发色深一档 #c8561c）、加粗、改 2 段拱形，位置下移至刘海齿谷可见
 *   T5  刘海瓣球纵向略收（1.45→1.32）、锥尖上提 0.014 → 齿尖止于眉线上方，露出眉/眼上缘
 *   T6  双马尾节间填谷球 ×3/侧（消除"糖葫芦"节缝，剪影连续如立绘 S 形发束）
 *   T7  手部：手掌下沿 4 指柱（并拢微分）+ 拇指前侧，手长触及下摆（立绘手至裙边）
 *   T8  袖子肘弯褶环（肩接缝环视觉贡献小，为全局预算撤除）
 *   T9  裙身 6 道竖向褶脊（前侧 ×2/侧 ×2/后侧 ×2，避开袋鼠兜与帽垂布）
 *   T10 帽垂布横向叠褶 ×2（参考图帽后 2-3 道堆叠褶）
 *   T11 领后帽兜内衬暗档 + 帽兜后立沿（半环，立绘颈后可见帽口边）
 *   T12 球鞋：鞋带交叉 1 组 → 3 组（前/中/后）+ 顶部蝴蝶结（双耳环+结心+2 垂带）+ 鞋眼点 ×2
 *   T13 后跟提环改灰（立绘为灰色织带，橙色仅后跟贴片）
 *   T14 膝盖微凸球（裸腿直筒 → 有膝点）
 *   预算：v2 184 mesh → v3 248（≤260）；※ 全局 smoke_perf_budget allmax 场景基线 3994/4000
 *   已无余量，本轮细节增量必然越线（详见交付报告，阈值归属项目方决策）
 *
 * v2 记录（保留）：
 * 形象：元气少女 —— 橙色双马尾（炭黑发圈×2、四节渐垂发束+双层羽状锥尖+发束间嵴）+
 *       顶天呆毛（弧形钩状+倒刺分支）+ 中分锯齿刘海（4瓣/侧+齿谷锥+发际线锯齿）+
 *       大琥珀眼(虹膜描边/双高光/上睫线) + 张嘴笑(上齿带/暗口腔) + 腮红 +
 *       珊瑚红oversized连帽卫衣裙(立体袋鼠兜+开口暗档+双道缝线/金属气眼抽绳+金属绳头/
 *       罗纹下摆+腰缝线/罗纹袖口/后背帽垂布三道缝线) +
 *       裸腿 + 珊瑚罗纹堆堆袜(双堆褶+袜口带) + 厚底白橙运动鞋(交叉鞋带/鞋头缝线/后跟提环)。
 *
 * v2 精修清偿（对照 v1 报告遗留 + 参考图差距）：
 *   1) 双马尾 4节渐垂+羽状梢 8枚/侧（v1 仅4枚）+ 内层暗部 2 束/侧 + 束间嵴锥 2/侧
 *   2) 呆毛放大为弧形钩状主梢+倒刺分支（v1 过小不显眼）
 *   3) 锯齿刘海每侧 3→4 瓣，新增齿谷填充锥（锯齿发际线）+ 中央分缝尖
 *   4) 袋鼠兜由贴片盒改为立体囊袋（椭球凸起）+ 开口暗档 + 双道缝线
 *   5) 抽绳新增金属气眼环 + 双段 J 形垂绳 + 金属绳头（v1 单段贴片）
 *   6) 罗纹下摆加密（128px 纹理/16 段）+ 新增腰缝线环；袖口双罗纹环
 *   7) 堆堆袜罗纹纹理 + 双堆褶环 + 袜口带（v1 单褶无纹理）
 *   8) 运动鞋新增交叉鞋带×2 / 鞋头缝线 / 后跟提环（v1 平贴单鞋带）
 *
 * 装配契约（view3d.js animToken 按此驱动，勿改关节位置）：
 *   根 Group 正面朝 +Z；userData.parts = { head, torso, armL, armR, legL, legR }
 *   legL/legR (±0.14,0.5,0) 腿网格 y≈-0.22 鞋底 -0.5；torso (0,0.52,0) 躯干主体 y≈+0.32；
 *   armL/armR (±0.31,1.0,0) 臂网格 y≈-0.15~-0.32（手掌）；head (0,1.1,0) 颅心 y≈+0.28。
 *   总身高 ≈1.71（外部再乘 1.08）；脚底贴地 y≈0。
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
  var hoodM  = std('#e05648', { rough: 0.85 });               /* 卫衣珊瑚红（v2 织物微纹理） */
  var hoodD  = std('#cc4838', { rough: 0.88 });               /* 罗纹/内衬暗珊瑚 */
  var pktInM = std('#8f332e', { rough: 0.92 });               /* 兜口暗档（口袋开口阴影） */
  var charM  = std('#4a4a52', { rough: 0.8 });                /* 炭黑发圈/抽绳 */
  var metalM = std('#9aa0aa', { rough: 0.35, metal: 0.75 });  /* 金属气眼/绳头（v2 新增） */
  var sockM  = std('#e88b80', { rough: 0.85 });               /* 堆堆袜（v2 罗纹纹理） */
  var sockHi = std('#f2a29a', { rough: 0.85 });               /* 袜口带亮珊瑚 */
  var shoeM  = std('#f2f0ec', { rough: 0.62 });               /* 鞋身米白 */
  var soleM  = std('#7a7068', { rough: 0.72 });               /* 深鞋底/缝线 */
  var laceM  = std('#ece2d0', { rough: 0.75 });               /* 米色鞋带 */
  var eyeWM  = std('#fcfaf6', { rough: 0.25 });               /* 眼白/高光 */
  var irisM  = std('#a05a28', { rough: 0.28 });               /* 琥珀虹膜 */
  var pupM   = std('#2a1c14', { rough: 0.28 });               /* 瞳孔/睫线/虹膜描边 */
  var mouthM = std('#7a2e2c', { rough: 0.6 });                /* 口腔暗红 */
  var teethM = std('#faf6f0', { rough: 0.45 });               /* 上齿带 */
  var blushM = std('#f49e84', { rough: 0.75 });               /* 腮红 */
  var browM  = std('#c8561c', { rough: 0.75 });               /* v3 眉（比发色深一档，刘海下可辨） */
  var tongueM= std('#e06a5a', { rough: 0.50 });               /* v3 舌 */
  var lipM   = std('#d9836e', { rough: 0.60 });               /* v3 下唇线 */
  var irisHi = std('#d08a3c', { rough: 0.28 });               /* v3 虹膜下缘亮弧 */
  var tabM   = std('#8a8f99', { rough: 0.70 });               /* v3 后跟提环灰织带 */
  var hoodL  = std('#ea6458', { rough: 0.85 });               /* v3 裙褶脊（略亮一档） */

  /* 卫衣织物微纹理（128px 平铺，白底细织纹 × 珊瑚色 → 保留原色只添织感） */
  var fabricTex = canvasTex(128, 128, function (ctx) {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 128, 128);
    ctx.fillStyle = 'rgba(0,0,0,0.045)';
    for (var y = 0; y < 128; y += 4) ctx.fillRect(0, y, 128, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.03)';
    for (var x = 0; x < 128; x += 4) ctx.fillRect(x, 0, 1, 128);
  }, 3, 3);
  hoodM.map = fabricTex; hoodM.needsUpdate = true;

  /* 罗纹竖条纹（下摆 128px/12 沟 ×16 平铺；袖口同纹理独立 repeat） */
  function ribCanvas() {
    return canvasTex(128, 128, function (ctx) {
      ctx.fillStyle = '#e05648'; ctx.fillRect(0, 0, 128, 128);
      for (var i = 0; i < 12; i++) {
        ctx.fillStyle = '#c8443a';
        ctx.fillRect(i * 10.67, 0, 4.5, 128);
        ctx.fillStyle = '#ea6254';
        ctx.fillRect(i * 10.67 + 6, 0, 3, 128);
      }
    }, 16, 1);
  }
  var ribHemM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: ribCanvas(), roughness: 0.88 });
  var ribCuffM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: ribCanvas(), roughness: 0.88 });
  ribCuffM.map.repeat.set(7, 1);
  /* 袜罗纹（珊瑚色系，密沟） */
  var sockRibTex = canvasTex(64, 64, function (ctx) {
    ctx.fillStyle = '#e88b80'; ctx.fillRect(0, 0, 64, 64);
    for (var i = 0; i < 8; i++) {
      ctx.fillStyle = '#d97a70';
      ctx.fillRect(i * 8, 0, 3, 64);
      ctx.fillStyle = '#f09a90';
      ctx.fillRect(i * 8 + 4, 0, 2, 64);
    }
  }, 9, 1);
  var sockRibM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: sockRibTex, roughness: 0.86 });

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
  var hem = mesh(new THREE.LatheGeometry(hemPts, 24), ribHemM);
  hem.scale.z = 0.82; torso.add(hem);

  /* 腰缝线环（下摆带与裙身接缝凹槽，v2 新增） */
  var waistSeam = torus(0.29, 0.008, hoodD, 0, 0.128, 0);
  waistSeam.rotation.x = PI / 2; waistSeam.scale.y = 0.82; torso.add(waistSeam);

  /* 袋鼠兜 v2：立体囊袋（椭球凸出裙面 0.03）+ 兜口暗档 + 双道缝线 + 两翼斜开口 + 翼缝线
   * （囊面随高度内收：各贴线均按所在高度囊面外移 ≤0.008，杜绝沉面/共面闪烁） */
  var pouch = sph(0.13, 14, 10, hoodM, 0, 0.14, 0.215);
  pouch.scale.set(1.06, 0.64, 0.42); pouch.rotation.x = 0.06; torso.add(pouch);
  var pktSlot = box(0.225, 0.016, 0.03, pktInM, 0, 0.196, 0.248);
  pktSlot.rotation.x = 0.06; torso.add(pktSlot);
  /* 兜口双道缝线（参考图袋口双针迹） */
  torso.add(box(0.235, 0.008, 0.012, hoodD, 0, 0.212, 0.242));
  torso.add(box(0.235, 0.008, 0.012, hoodD, 0, 0.180, 0.262));
  /* 兜底缝线 */
  torso.add(box(0.24, 0.010, 0.012, hoodD, 0, 0.075, 0.248));
  var wingL = box(0.07, 0.10, 0.045, hoodM, -0.152, 0.20, 0.19);
  wingL.rotation.z = 0.62; wingL.rotation.x = 0.1; torso.add(wingL);
  var wingR = box(0.07, 0.10, 0.045, hoodM, 0.152, 0.20, 0.19);
  wingR.rotation.z = -0.62; wingR.rotation.x = 0.1; torso.add(wingR);
  var seamL = box(0.014, 0.095, 0.012, hoodD, -0.128, 0.202, 0.218);
  seamL.rotation.z = 0.6; torso.add(seamL);
  var seamR = box(0.014, 0.095, 0.012, hoodD, 0.128, 0.202, 0.218);
  seamR.rotation.z = -0.6; torso.add(seamR);

  /* 抽绳 v2 ×2：金属气眼环（帽领前缘）+ 双段 J 形垂绳 + 金属绳头（pivot 在领口，待机微摆） */
  function drawString(s) {
    var pv = grp(); pv.position.set(0.062 * s, 0.548, 0.17); torso.add(pv);
    var gr = torus(0.015, 0.006, metalM, 0, -0.002, 0.006);
    gr.rotation.x = -0.15; pv.add(gr);
    var c1 = cyl(0.011, 0.010, 0.075, 8, charM, 0.004 * s, -0.040, 0.006);
    c1.rotation.x = -0.15; c1.rotation.z = -0.10 * s; pv.add(c1);
    var c2 = cyl(0.010, 0.0095, 0.115, 8, charM, 0.010 * s, -0.128, 0.020);
    c2.rotation.x = -0.22; c2.rotation.z = -0.04 * s; pv.add(c2);
    var ag = cyl(0.013, 0.013, 0.042, 8, metalM, 0.013 * s, -0.200, 0.033);
    ag.rotation.x = -0.22; ag.rotation.z = -0.04 * s; pv.add(ag);
    return pv;
  }
  var stringL = drawString(1), stringR = drawString(-1);

  /* 兜帽卷领：领环（后颈/两侧），帽垂布贴背（侧视不隆起）+ 下垂尖 + 背面三道缝线（v2） */
  var collar = torus(0.128, 0.042, hoodM, 0, 0.565, -0.004);
  collar.rotation.x = PI / 2 - 0.12; torso.add(collar);
  var hood = sph(0.17, 14, 10, hoodM, 0, 0.30, -0.225);
  hood.scale.set(1.25, 1.1, 0.45); torso.add(hood);
  torso.add(box(0.008, 0.17, 0.012, hoodD, 0, 0.295, -0.300));
  var hsmL = box(0.008, 0.15, 0.012, hoodD, -0.07, 0.30, -0.296);
  hsmL.rotation.y = 0.3; torso.add(hsmL);
  var hsmR = box(0.008, 0.15, 0.012, hoodD, 0.07, 0.30, -0.296);
  hsmR.rotation.y = -0.3; torso.add(hsmR);
  var hoodTip = cone(0.05, 0.14, 8, hoodM, 0, 0.185, -0.26);
  hoodTip.rotation.x = PI - 0.2; torso.add(hoodTip);
  /* v3 T10 帽垂布横向叠褶 ×2（扁长椭球贴帽背曲面，中央出面 ≈0.006，两端收进面内；
   * z 略深于三道缝线 0.002-0.004，避免共面） */
  var hf1 = sph(0.02, 12, 8, hoodM, 0, 0.36, -0.258); hf1.scale.set(8.0, 0.55, 2.5); torso.add(hf1);
  var hf2 = sph(0.02, 12, 8, hoodM, 0, 0.26, -0.260); hf2.scale.set(8.0, 0.55, 2.5); torso.add(hf2);
  /* v3 T11 帽兜内衬暗档（颈后深珊瑚带，背视于领环与帽口沿之间可见）+ 帽兜后立沿
   * （半环立于领后，比后脑发更靠后 → 背视可见帽口边缘，正视被头遮） */
  var hoodIn = sph(0.10, 14, 10, pktInM, 0, 0.60, -0.15); hoodIn.scale.set(1.6, 0.5, 0.45); torso.add(hoodIn);
  var hoodRim = mesh(new THREE.TorusGeometry(0.165, 0.030, 8, 18, PI), hoodM);
  hoodRim.position.set(0, 0.583, -0.05); hoodRim.rotation.x = -PI / 2 + 0.25; torso.add(hoodRim);
  /* v3 T9 裙身竖向褶脊 ×6：贴 Lathe 裙面（含 scale.z 0.82 椭圆修正），随裙面坡度前倾 0.27；
   * 角度避开袋鼠兜（|θ|<0.5）与帽垂布（|θ|>2.3） */
  var pleatTh = [0.62, -0.62, 1.30, -1.30, 2.05, -2.05];
  for (var pi3 = 0; pi3 < pleatTh.length; pi3++) {
    var th = pleatTh[pi3];
    var pg = grp(); pg.rotation.y = th; torso.add(pg);
    var dR = 0.273 / Math.sqrt(sin(th) * sin(th) + cos(th) * cos(th) / (0.82 * 0.82)) + 0.004;
    var ridge = sph(0.012, 10, 8, hoodL, 0, 0.21, dR);
    ridge.scale.set(1.0, 7.5, 0.7); ridge.rotation.x = -0.27; pg.add(ridge);
  }

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

  /* 大琥珀眼 v3（眼白+虹膜+深色描边+瞳孔+双高光+上睫线+3 根扇形外角睫+双眼皮褶+虹膜下缘亮弧），
   * 眼线 0.34（chibi 下移） */
  var s;
  for (s = -1; s <= 1; s += 2) {
    var white = sph(0.055, 12, 10, eyeWM, 0.115 * s, 0.34, 0.212);
    white.scale.set(0.95, 1.28, 0.38); head.add(white);
    var rim = sph(0.049, 12, 10, pupM, 0.117 * s, 0.335, 0.224);
    rim.scale.set(1.04, 1.24, 0.20); head.add(rim);
    var iris = sph(0.047, 12, 10, irisM, 0.117 * s, 0.335, 0.228);
    iris.scale.set(1, 1.18, 0.28); head.add(iris);
    /* v3 T3 虹膜下缘亮弧（浅琥珀，瞳下通透） */
    var iArc = sph(0.030, 10, 8, irisHi, 0.117 * s, 0.316, 0.236);
    iArc.scale.set(0.9, 0.45, 0.25); head.add(iArc);
    head.add(sph(0.022, 10, 8, pupM, 0.117 * s, 0.333, 0.240));
    /* 双高光：大上(偏画面左) + 小下(偏画面右) —— 参考图两眼同构 */
    head.add(sph(0.014, 8, 6, eyeWM, 0.104 * s, 0.355, 0.249));
    head.add(sph(0.007, 6, 5, eyeWM, 0.132 * s, 0.317, 0.251));
    /* 上睫线：贴眼顶深色细缘 */
    var lash = sph(0.052, 12, 8, pupM, 0.115 * s, 0.378, 0.214);
    lash.scale.set(0.98, 0.22, 0.42); head.add(lash);
    /* v3 T2 外角睫 ×3 扇形（长→短、由上翘到外平） */
    var lspk = cone(0.010, 0.040, 6, pupM, 0.166 * s, 0.386, 0.210);
    lspk.rotation.z = -1.9 * s; head.add(lspk);
    var lspk2 = cone(0.009, 0.034, 6, pupM, 0.170 * s, 0.372, 0.212);
    lspk2.rotation.z = -2.2 * s; head.add(lspk2);
    var lspk3 = cone(0.008, 0.028, 6, pupM, 0.172 * s, 0.357, 0.214);
    lspk3.rotation.z = -2.5 * s; head.add(lspk3);
    /* v3 T2 双眼皮褶线（上睫上方细弧，肤暗色） */
    var fold = sph(0.048, 12, 8, skinD, 0.115 * s, 0.397, 0.206);
    fold.scale.set(0.90, 0.09, 0.30); head.add(fold);
    /* v3 T4 眉：2 段拱形（内段上扬、外段下收），加深加粗，下移至刘海齿谷可见 */
    var browI = box(0.062, 0.017, 0.018, browM, 0.072 * s, 0.417, 0.212);
    browI.rotation.z = 0.22 * s; browI.rotation.x = 0.15; head.add(browI);
    var browO = box(0.062, 0.016, 0.018, browM, 0.128 * s, 0.421, 0.206);
    browO.rotation.z = -0.28 * s; browO.rotation.x = 0.15; head.add(browO);
  }

  /* 小鼻点 + 张嘴笑（暗口腔 + 上齿带 + v3 粉舌 + 下唇线）+ 腮红 */
  head.add(sph(0.014, 8, 6, skinD, 0, 0.288, 0.242));
  var mouth = sph(0.052, 12, 9, mouthM, 0, 0.195, 0.202);
  mouth.scale.set(1.35, 0.82, 0.42); head.add(mouth);
  var teeth = box(0.08, 0.018, 0.012, teethM, 0, 0.222, 0.232);
  teeth.rotation.x = 0.05; head.add(teeth);
  var tongue = sph(0.026, 12, 9, tongueM, 0, 0.172, 0.222);
  tongue.scale.set(1.15, 0.60, 0.50); head.add(tongue);
  var lipLo = sph(0.045, 12, 8, lipM, 0, 0.152, 0.213);
  lipLo.scale.set(1.45, 0.16, 0.40); head.add(lipLo);
  var blL = sph(0.042, 10, 8, blushM, -0.175, 0.24, 0.175); blL.scale.set(1.15, 0.65, 0.4); head.add(blL);
  var blR = sph(0.042, 10, 8, blushM, 0.175, 0.24, 0.175); blR.scale.set(1.15, 0.65, 0.4); head.add(blR);

  /* ---------------- 4. 发系（先颅后发；刻面哑光 + 羽状发梢；发际线局部 y≈0.43） ---------------- */
  /* 颅顶壳：截断半球盖（0.38π），帽沿止步于发际线，不压眉眼 */
  var cap = mesh(new THREE.SphereGeometry(0.26, 24, 14, 0, PI * 2, 0, PI * 0.38), hairM);
  cap.position.set(0, 0.315, -0.008); cap.scale.set(1.06, 1.02, 1.04); head.add(cap);
  /* 后脑体量 + 颈后发（大块平滑，消除堆叠棱）+ 颈后发梢三尖（v2 背视图锯齿发缘） */
  var back1 = sph(0.175, 16, 12, hairM, 0, 0.36, -0.135); back1.scale.set(1.5, 1.0, 0.85); head.add(back1);
  var back2 = sph(0.14, 14, 10, hairM, 0, 0.17, -0.12); back2.scale.set(1.4, 0.85, 0.8); head.add(back2);
  var nape = sph(0.105, 10, 8, hairIn, 0, 0.10, -0.095); nape.scale.set(1.35, 0.7, 0.8); head.add(nape);
  var napeTips = [[-0.06, 0.045, -0.148], [0, 0.03, -0.162], [0.06, 0.045, -0.148]];
  for (var ni = 0; ni < 3; ni++) {
    var np = napeTips[ni];
    var nTip = cone(0.02, 0.09, 6, hairIn, np[0], np[1], np[2]);
    nTip.rotation.x = PI + 0.15; head.add(nTip);
  }
  /* 侧发掠（耳上补块，衔接颅顶壳与鬓发） */
  var sideL = sph(0.10, 12, 9, hairM, -0.235, 0.36, 0.03); sideL.scale.set(0.5, 1.2, 1.0); head.add(sideL);
  var sideR = sph(0.10, 12, 9, hairM, 0.235, 0.36, 0.03); sideR.scale.set(0.5, 1.2, 1.0); head.add(sideR);

  /* 中分锯齿刘海 v2：贴前额坡面，每侧 4 瓣渐矮 + 4 锥尖垂至眉线 + 2 齿谷锥（锯齿发际线） */
  var fringe = [
    /* [x, y, z, r] */
    [0.030, 0.495, 0.168, 0.062],
    [0.090, 0.486, 0.175, 0.058],
    [0.144, 0.470, 0.166, 0.052],
    [0.192, 0.452, 0.150, 0.046]
  ];
  var notches = [
    /* 瓣间齿谷（填充 V 口，形成连续锯齿发缘）[x, y, z, r, h] */
    [0.060, 0.498, 0.172, 0.030, 0.075],
    [0.118, 0.486, 0.170, 0.027, 0.068]
  ];
  for (s = -1; s <= 1; s += 2) {
    for (var fi = 0; fi < fringe.length; fi++) {
      var F = fringe[fi];
      var lobe = sph(F[3], 10, 8, hairM, F[0] * s, F[1], F[2]);
      /* v3 T5：瓣球横向收窄 0.92→0.84、纵向 1.45→1.32，锥尖加宽上提 → 锯齿尖读感更强、齿尖止于睫线 */
      lobe.scale.set(0.84, 1.32, 0.68); lobe.rotation.z = (-0.10 - 0.13 * fi) * s; lobe.rotation.x = 0.06; head.add(lobe);
      var tip = cone(F[3] * 0.48, 0.092 - fi * 0.006, 8, hairIn, (F[0] + 0.006) * s, F[1] - 0.070 - fi * 0.005, F[2] + 0.032);
      tip.rotation.x = PI; tip.rotation.z = (-0.16 - 0.15 * fi) * s; head.add(tip);
    }
    for (var gj = 0; gj < notches.length; gj++) {
      var N = notches[gj];
      var notch = cone(N[3], N[4], 6, hairM, N[0] * s, N[1], N[2]);
      notch.rotation.x = PI; notch.rotation.z = -0.08 * s; head.add(notch);
    }
    /* 中缝两瓣（贴分缝线，向两侧倒） */
    var cLobe = sph(0.05, 9, 7, hairM, 0.02 * s, 0.50, 0.165);
    cLobe.scale.set(0.8, 1.4, 0.62); cLobe.rotation.z = -0.16 * s; head.add(cLobe);
    var cTip = cone(0.02, 0.07, 6, hairIn, 0.028 * s, 0.418, 0.192);
    cTip.rotation.x = PI; cTip.rotation.z = -0.2 * s; head.add(cTip);
  }
  /* 中央分缝尖（中缝 V 谷最低一齿，v2） */
  var cNotch = cone(0.024, 0.06, 6, hairM, 0, 0.470, 0.178);
  cNotch.rotation.x = PI; head.add(cNotch);

  /* 鬓侧发（耳前垂束，锥尖下收） */
  for (s = -1; s <= 1; s += 2) {
    var sl = sph(0.05, 9, 7, hairM, 0.245 * s, 0.285, 0.09);
    sl.scale.set(0.75, 1.5, 0.8); sl.rotation.z = -0.1 * s; head.add(sl);
    var slTip = cone(0.024, 0.09, 6, hairIn, 0.258 * s, 0.15, 0.085);
    slTip.rotation.x = PI; slTip.rotation.z = -0.18 * s; head.add(slTip);
  }

  /* 双马尾 v2：pivot 挂颅侧上方位（发圈处），整束可摆。
   * 结构：发圈×2 → 根部鼓 → 四节渐垂主束（外扩→后漂→渐细）→ 内层暗束×2（纵深）
   *       → 束间嵴锥×2（发丝分缕）→ 羽状锥尖×8（双排交错，梢至世界 ≈0.95）。 */
  function tail(s) {
    var pv = grp(); pv.position.set(0.21 * s, 0.475, -0.03); head.add(pv);
    /* 炭黑发圈 ×2（环叠） */
    var t1 = torus(0.048, 0.019, charM, 0, 0, 0);
    t1.rotation.x = PI / 2; t1.rotation.z = 0.35 * s; pv.add(t1);
    var t2 = torus(0.044, 0.017, charM, 0.008 * s, -0.032, 0.004);
    t2.rotation.x = PI / 2; t2.rotation.z = 0.35 * s; pv.add(t2);
    /* 根部鼓（填实发圈下口） */
    var root = sph(0.072, 10, 8, hairM, 0.006 * s, -0.055, -0.002);
    root.scale.set(1.05, 0.9, 0.95); pv.add(root);
    /* 主束四节渐垂 */
    var segs = [
      [0.016 * s, -0.115, -0.018, 0.092, hairM],
      [0.036 * s, -0.235, -0.048, 0.116, hairM],
      [0.054 * s, -0.355, -0.088, 0.104, hairM],
      [0.056 * s, -0.465, -0.125, 0.086, hairIn]
    ];
    for (var i = 0; i < segs.length; i++) {
      var sg = segs[i];
      var lb = sph(sg[3], 12, 9, sg[4], sg[0], sg[1], sg[2]);
      lb.scale.set(1.12, 1.08, 0.96); lb.rotation.z = -0.05 * s * i; pv.add(lb);
    }
    /* v3 T6 节间填谷球 ×3（取相邻两节中点、半径≈较小节 0.92，抹平"糖葫芦"节缝 → 连续 S 形发束） */
    var fills = [
      [0.026 * s, -0.175, -0.033, 0.098, hairM],
      [0.045 * s, -0.295, -0.068, 0.104, hairM],
      [0.055 * s, -0.410, -0.106, 0.088, hairM]
    ];
    for (var fq = 0; fq < fills.length; fq++) {
      var fl = fills[fq];
      var fb = sph(fl[3], 12, 9, fl[4], fl[0], fl[1], fl[2]);
      fb.scale.set(1.08, 1.0, 0.92); pv.add(fb);
    }
    /* 内层暗束 ×2（节间阴影，出层深） */
    var unds = [
      [0.030 * s, -0.300, -0.105, 0.078],
      [0.044 * s, -0.415, -0.145, 0.068]
    ];
    for (var u = 0; u < unds.length; u++) {
      var ud = unds[u];
      var ulb = sph(ud[3], 10, 8, hairIn, ud[0], ud[1], ud[2]);
      ulb.scale.set(1.0, 1.18, 0.85); pv.add(ulb);
    }
    /* 束间嵴锥 ×2（侧面分缕小尖，参考图发束沟壑） */
    var strands = [
      [0.098 * s, -0.280, -0.030, 0.020, 0.085, 0.42],
      [0.108 * s, -0.385, -0.062, 0.018, 0.075, 0.50]
    ];
    for (var k = 0; k < strands.length; k++) {
      var st = strands[k];
      var sc = cone(st[3], st[4], 6, hairIn, st[0], st[1], st[2]);
      sc.rotation.x = PI - 0.1; sc.rotation.z = st[5] * s; pv.add(sc);
    }
    /* 羽状锥尖 ×8：下两节周边双排交错（外长内短，梢尖下勾微外飘） */
    var tips = [
      [0.040 * s, -0.545, -0.095, 0.030, 0.125, -0.30, hairIn],
      [0.080 * s, -0.530, -0.115, 0.027, 0.112, 0.30, hairM],
      [0.030 * s, -0.510, -0.150, 0.026, 0.105, -0.16, hairIn],
      [0.070 * s, -0.495, -0.165, 0.024, 0.098, 0.18, hairM],
      [0.058 * s, -0.565, -0.118, 0.024, 0.115, 0.00, hairIn],
      [0.095 * s, -0.470, -0.135, 0.022, 0.088, 0.42, hairIn],
      [0.014 * s, -0.480, -0.115, 0.022, 0.085, -0.38, hairM],
      [0.052 * s, -0.505, -0.055, 0.020, 0.080, 0.10, hairIn]
    ];
    for (var q = 0; q < tips.length; q++) {
      var tp = tips[q];
      var cn = cone(tp[3], tp[4], 6, tp[6], tp[0], tp[1], tp[2]);
      cn.rotation.x = PI - 0.12; cn.rotation.z = tp[5] * s; pv.add(cn);
    }
    return pv;
  }
  var tailL = tail(1), tailR = tail(-1);

  /* 顶天呆毛 v2：弧形钩状主梢（3 球渐小）+ 主锥尖 + 倒刺分支（钩状剪影，向角色左弯；
   * 顶点控制在 1.75 内：呆毛最高点 ≈1.71） */
  var ahoge = grp(); ahoge.position.set(0.025, 0.535, 0.015); head.add(ahoge);
  ahoge.add(sph(0.036, 8, 6, hairM, 0.010, 0.016, 0));
  ahoge.add(sph(0.030, 8, 6, hairM, 0.052, 0.040, 0.004));
  ahoge.add(sph(0.023, 8, 6, hairM, 0.088, 0.050, 0.006));
  var aTip = cone(0.016, 0.062, 6, hairIn, 0.112, 0.056, 0.008);
  aTip.rotation.z = -0.85; ahoge.add(aTip);
  var aBarb = cone(0.012, 0.036, 6, hairIn, 0.058, 0.060, 0.008);
  aBarb.rotation.z = -0.64; ahoge.add(aBarb);

  /* ---------------- 5. 手臂（armL @ (0.31,1.0,0)，armR @ (-0.31,1.0,0)；外八垂坠烘进网格） ---------------- */
  function buildArm(s) {
    var pv = grp(); pv.position.set(0.31 * s, 1.0, 0); pv.name = s > 0 ? 'armL' : 'armR'; g.add(pv);
    pv.add(sph(0.082, 12, 9, hoodM, 0.012 * s, -0.045, 0));
    var slv = cyl(0.072, 0.068, 0.20, 12, hoodM, 0.02 * s, -0.16, 0.004);
    slv.rotation.z = -0.09 * s; pv.add(slv);
    /* v3 T8 肘弯褶环（暗珊瑚细环，出袖面 ≈0.008；肩接缝环视觉贡献小，为全局 mesh 预算撤除） */
    var elbow = torus(0.0705, 0.007, hoodD, 0.017 * s, -0.198, 0.005);
    elbow.rotation.x = PI / 2; elbow.rotation.z = -0.09 * s; pv.add(elbow);
    /* 双罗纹袖口（v2：主环 + 副环） */
    var cuff = cyl(0.07, 0.065, 0.055, 12, ribCuffM, 0.026 * s, -0.253, 0.007);
    cuff.rotation.z = -0.09 * s; pv.add(cuff);
    var cuff2 = cyl(0.0685, 0.066, 0.02, 12, ribCuffM, 0.025 * s, -0.220, 0.006);
    cuff2.rotation.z = -0.09 * s; pv.add(cuff2);
    var hand = sph(0.05, 10, 8, skinM, 0.032 * s, -0.30, 0.012);
    hand.scale.set(0.85, 1.05, 0.8); pv.add(hand);
    /* v3 T7 手指：掌下沿 4 指柱并拢微分（中指最长）+ 拇指前内侧斜出；指尖世界 y≈0.62 触及下摆 */
    var fx = [-0.021, -0.007, 0.007, 0.021], fh = [0.026, 0.032, 0.030, 0.024];
    for (var fk = 0; fk < 4; fk++) {
      var fg = cyl(0.0088, 0.0080, fh[fk], 12, skinM, 0.032 * s + fx[fk], -0.352 - fh[fk] * 0.5 + 0.006, 0.014);
      fg.rotation.x = 0.10; pv.add(fg);
    }
    var thumb = cyl(0.0095, 0.0085, 0.032, 12, skinM, 0.004 * s, -0.318, 0.040);
    thumb.rotation.x = -0.75; thumb.rotation.z = -0.30 * s; pv.add(thumb);
    return pv;
  }
  var armL = buildArm(1), armR = buildArm(-1);

  /* ---------------- 6. 腿（镜像：legL s=+1，legR s=-1；鞋尖外八 0.14rad，鞋底 -0.5 → 世界 0） ---------------- */
  function buildLeg(s) {
    var pv = grp(); pv.position.set(0.14 * s, 0.5, 0); pv.name = s > 0 ? 'legL' : 'legR'; g.add(pv);
    var leg = mesh(new THREE.CapsuleGeometry(0.052, 0.30, 4, 10), skinM);
    leg.position.y = -0.22; pv.add(leg);
    /* v3 T14 膝盖微凸球（仅前侧出腿面 ≈0.005，侧/后收进腿内 → 有膝点而非"箍环"） */
    var knee = sph(0.050, 12, 9, skinM, 0, -0.268, 0.012); knee.scale.set(0.90, 0.75, 0.90); pv.add(knee);
    /* 堆堆袜 v2：罗纹厚袜筒 + 袜口带 + 双堆褶环（小腿下段，堆叠感） */
    var sock = cyl(0.064, 0.058, 0.14, 12, sockRibM, 0, -0.400, 0); pv.add(sock);
    var band = cyl(0.0655, 0.064, 0.026, 12, sockHi, 0, -0.334, 0); pv.add(band);
    var fold1 = torus(0.060, 0.020, sockRibM, 0, -0.356, 0);
    fold1.rotation.x = PI / 2; pv.add(fold1);
    var fold2 = torus(0.058, 0.017, sockRibM, 0, -0.394, 0);
    fold2.rotation.x = PI / 2; pv.add(fold2);
    /* 运动鞋 v3（厚底白橙：白中底 + 深牙子 + 厚鞋身 + 鞋头缝线 + 交叉鞋带×3 组 + 蝴蝶结 +
     * 鞋眼点 + 鞋舌 + 灰后跟提环 + 橙后跟贴 + 橙侧条） */
    var shoe = grp(); shoe.position.set(0.008 * s, 0, 0.008); shoe.rotation.y = 0.14 * s; pv.add(shoe);
    shoe.add(box(0.13, 0.034, 0.24, shoeM, 0, -0.477, 0.018));
    shoe.add(box(0.132, 0.014, 0.242, soleM, 0, -0.493, 0.018));
    shoe.add(box(0.115, 0.08, 0.195, shoeM, 0, -0.425, 0.012));
    var toe = sph(0.055, 12, 9, shoeM, 0, -0.448, 0.098);
    toe.scale.set(1.05, 0.6, 1.2); shoe.add(toe);
    shoe.add(box(0.095, 0.028, 0.03, soleM, 0, -0.468, 0.128));
    /* 中底围条缝线（v2：鞋面/中底接缝暗色围线，四周探出 0.002 可见） */
    shoe.add(box(0.134, 0.006, 0.244, soleM, 0, -0.4595, 0.018));
    /* 鞋带底带（倾斜 0.35 的鞋带面板）+ v3 T12 交叉鞋带 ×3 组（沿面板前→后，各贴面板顶面 +0.004） */
    var lace = box(0.08, 0.022, 0.105, laceM, 0, -0.396, 0.052);
    lace.rotation.x = 0.35; shoe.add(lace);
    var xs = [[-0.388, 0.070, 0.38], [-0.393, 0.082, -0.38], [-0.377, 0.040, 0.38],
              [-0.382, 0.052, -0.38], [-0.366, 0.010, 0.38], [-0.371, 0.022, -0.38]];
    for (var xi = 0; xi < xs.length; xi++) {
      var xl = box(0.078, 0.010, 0.012, laceM, 0, xs[xi][0], xs[xi][1]);
      xl.rotation.x = 0.35; xl.rotation.z = xs[xi][2]; shoe.add(xl);
    }
    /* v3 T12 蝴蝶结：双耳环（左右外撇）+ 结心 + 2 垂带；鞋眼点 ×2（面板两侧） */
    var bowL = torus(0.011, 0.0035, laceM, -0.016, -0.354, 0.006);
    bowL.rotation.y = 0.55; bowL.rotation.x = 0.35; shoe.add(bowL);
    var bowR = torus(0.011, 0.0035, laceM, 0.016, -0.354, 0.006);
    bowR.rotation.y = -0.55; bowR.rotation.x = 0.35; shoe.add(bowR);
    shoe.add(sph(0.0065, 8, 6, laceM, 0, -0.355, 0.012));
    var endL = cyl(0.003, 0.0025, 0.028, 12, laceM, -0.013, -0.372, 0.016);
    endL.rotation.z = 0.35; endL.rotation.x = 0.2; shoe.add(endL);
    var endR = cyl(0.003, 0.0025, 0.028, 12, laceM, 0.013, -0.372, 0.016);
    endR.rotation.z = -0.35; endR.rotation.x = 0.2; shoe.add(endR);
    shoe.add(sph(0.0045, 8, 6, soleM, -0.038, -0.384, 0.046));
    shoe.add(sph(0.0045, 8, 6, soleM, 0.038, -0.384, 0.046));
    var tongue = box(0.062, 0.05, 0.02, shoeM, 0, -0.378, 0.002);
    tongue.rotation.x = 0.3; shoe.add(tongue);
    /* 后跟提环（v3 T13 改灰织带）+ 橙后跟贴 + 橙侧条 */
    shoe.add(box(0.020, 0.034, 0.012, tabM, 0, -0.366, -0.082));
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
    tailL.rotation.z = sin(t * 1.35) * 0.06;
    tailL.rotation.x = sin(t * 1.35 + 1.1) * 0.045;
    tailR.rotation.z = -sin(t * 1.35 + 0.5) * 0.06;
    tailR.rotation.x = sin(t * 1.35 + 1.7) * 0.045;
    ahoge.rotation.z = sin(t * 2.3) * 0.08;
    ahoge.rotation.x = sin(t * 1.9 + 0.8) * 0.035;
    stringL.rotation.x = sin(t * 1.9 + 0.5) * 0.07;
    stringR.rotation.x = sin(t * 1.9 + 0.9) * 0.07;
    return br;
  }];

  return g;
};

})();
