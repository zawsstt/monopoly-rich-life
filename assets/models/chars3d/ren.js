/* =====================================================================================
 * 大富翁 · 富贵人生 —— 精细角色：丧彪 ren（v3 重做：以卡片立绘 full3_ren.png 为唯一视觉基准）
 * -------------------------------------------------------------------------------------
 * 基准图：assets/img/full3_ren.png（透明底全身立绘；卡片/头像同源）。refs/char_ren.png 仅作风格参照。
 * 形象：Q 版瘦高黑道大佬 —— 黑色长风衣（立领、A 字下摆、前襟敞开）+ 黑衬衫扣到领口 +
 *       黑皮带银扣 + 黑西裤 + 厚底圆头黑皮鞋（外八）+ 黑色蓬松短发（斜刘海、分缝、鬓角压耳）+
 *       黑框墨镜（wayfarer，遮双眼）+ 浓黑皱眉 + 冷峻抿嘴 + 双手插风衣兜（手肘外撑）。
 *
 * v2（兜帽骷髅绿皮巫师）→ v3 差距清单（与 full3_ren.png 逐条比对，全部需推翻重做）：
 *   G1 皮肤：绿皮（#7aa86a）→ 立绘为白皙肤色（实测 rgb 244,206,189）
 *   G2 头部：兜帽+无瞳发光眼 → 黑色蓬松短发 + 黑框墨镜（无可见眼睛）
 *   G3 面部：缝合嘴/额纹/颊斑 → 冷峻面无表情：浓黑皱眉、小鼻、抿直嘴、尖下巴、颧骨
 *   G4 上身：破斗篷+骷髅扣+绳腰带 → 黑色立领长风衣 + 黑衬衫扣列 + 黑皮带银扣
 *   G5 身形：矮胖 chibi 披风 → 瘦高（实测 w/h=0.336；头宽≈肩宽，手肘处最宽 0.31H，下摆 0.33H）
 *   G6 手臂：直垂+绿手三指 → 双手插兜（手肘外撑、小臂内收入兜，仅见袖口/手腕）
 *   G7 下肢：赤足绿脚+分块趾 → 黑西裤直筒 + 厚底圆头黑皮鞋（外八 0.15rad）
 *   G8 风衣结构：无 → 立领翻角、A 字垂坠、前襟敞开露衬衫/皮带/裤子、后开衩、下摆波浪、垂直褶
 *   G9 材质：flat 切面 low-poly → 平滑着色；墨镜镜片低粗糙高金属 + 反光条；皮鞋微光泽
 *   G10 配色：藏青/绿/骨白 → 全黑单色（风衣 #2b2929 / 裤 #131315 / 衬衫 #262529 / 发 #1b1b21）
 *
 * 立绘比例（H=总高，模型取 H≈1.73）：发顶 0% · 墨镜 20% · 下巴 29% · 肩线 36% · 手肘最宽 48%
 *   · 皮带 49% · 髋最窄 58% · 下摆 85% · 裤管 86-92% · 鞋 94-100%（鞋总宽 0.29H）
 *
 * v3 打磨记录（软渲染四视图 + 立绘并排对比，ren_render.js）：
 *   v3.1 头发改贴表面发绺（去放射尖刺）；墨镜放大到脸宽 90%；肩臂去肩甲感、袖管收细贴身；立领加高外翻
 *   v3.2 刘海上移露眉/搭镜框上缘；顶发翘起成锯齿轮廓；鞋加大加圆；双腿内收
 *   v3.3 刘海扫向镜像修正（立绘从观察者左上向右下扫）；立领翻角放大横展如翼；前襟敞口加宽（半角 0.45）；
 *        兜口贴边改斜置；西裤略宽；皮带扣加大
 *   v3.4 头发双层结构（冠面斜扫层 + 冠缘刘海）+ 耳朵外露；补有出处细节：衬衫顶扣/皮带扣环/后育克缝/
 *        兜底缝线/下摆内衬带/袖口搭扣+扣/鞋带孔/鼻孔；mesh 143(v2)→176
 *
 * 装配契约（view3d.animToken 硬驱动，位置必须精确）：
 *   根 Group name='ren'，正面朝 +Z；userData.parts = { head, torso, armL, armR, legL, legR }
 *   legL/legR (±0.17, 0.5, 0) · torso (0, 0.52, 0) · armL/armR (±0.35, 1.0, 0) · head (0, 1.1, 0)
 *   总身高 ≈1.73（外部再乘 1.08）；脚底贴地 y≈0。四肢网格在关节内做 x 向内偏移（rotation.x 摆动不受影响）。
 *   userData.anim = [fn(t, dt, state)]：待机呼吸/下摆微摆/发梢微动；state.mode==='walk' 时臂内层
 *   小幅摆动（手不离兜）+ 膝微屈；'jump' 时收腿+下摆上扬。六关节 rotation/position 留给 view3d。
 * 依赖：全局 THREE r147。经典脚本，无模块，无外部资源，布局全部确定性常量（不调用随机函数）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[chars3d/ren] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

window.Char3D = window.Char3D || {};

window.Char3D.ren = function () {

  /* ---------------- 0. 工具 ---------------- */
  var PI = Math.PI, sin = Math.sin, cos = Math.cos;
  var V3 = THREE.Vector3;
  var UP = new V3(0, 1, 0);
  function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function std(hex, o) {
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: C(hex),
      roughness: (o.rough !== undefined ? o.rough : 0.85),
      metalness: (o.metal || 0),
      side: (o.side || THREE.FrontSide)
    });
    if (o.envInt) m.envMapIntensity = o.envInt;
    if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 1); }
    return m;
  }
  function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
  function sph(r, mat, x, y, z, sx, sy, sz, ws, hs) {
    var o = mesh(new THREE.SphereGeometry(r, ws || 16, hs || 12), mat);
    o.position.set(x || 0, y || 0, z || 0);
    o.scale.set(sx || 1, sy || 1, sz || 1);
    return o;
  }
  function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function cyl(rt, rb, h, mat, x, y, z, seg) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, seg || 14), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
  function grp(x, y, z) { var g2 = new THREE.Group(); g2.position.set(x || 0, y || 0, z || 0); return g2; }
  /* 两点间定向圆柱：r0 在 a 端，r1 在 b 端 */
  function limb(mat, a, b, r0, r1, seg) {
    var d = new V3().subVectors(b, a), len = d.length();
    var m = mesh(new THREE.CylinderGeometry(r0, r1, len, seg || 14), mat);
    m.position.copy(a).lerp(b, 0.5);
    m.quaternion.setFromUnitVectors(UP, d.multiplyScalar(-1 / len));
    return m;
  }
  /* 沿 dir 轴的环（袖口翻边等） */
  function ringAt(mat, p, dir, R, tube) {
    var m = mesh(new THREE.TorusGeometry(R, tube, 12, 24), mat);
    m.position.copy(p);
    m.quaternion.setFromUnitVectors(new V3(0, 0, 1), dir.clone().normalize());
    return m;
  }
  function lathe(pts, seg, phi0, phiLen, mat) {
    var v = [];
    for (var i = 0; i < pts.length; i++) v.push(new THREE.Vector2(pts[i][0], pts[i][1]));
    return mesh(new THREE.LatheGeometry(v, seg, phi0 || 0, phiLen === undefined ? PI * 2 : phiLen), mat);
  }
  /* 圆角多边形 Shape（墨镜镜框/镜片） */
  function roundedShape(pts, r, target) {
    var s = target || new THREE.Shape(), n = pts.length;
    function toward(p, q, dist) { var dx = q[0] - p[0], dy = q[1] - p[1], L = Math.sqrt(dx * dx + dy * dy); return [p[0] + dx / L * dist, p[1] + dy / L * dist]; }
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
      var a = toward(p1, p0, r), b = toward(p1, p2, r);
      if (i === 0) s.moveTo(a[0], a[1]); else s.lineTo(a[0], a[1]);
      s.quadraticCurveTo(p1[0], p1[1], b[0], b[1]);
    }
    s.closePath();
    return s;
  }

  var g = grp(); g.name = 'ren';

  /* ---------------- 1. 材质（色值取自立绘像素采样；全黑系用明度/粗糙度分区区分层次） ---------------- */
  var M = {
    skin:    std('#f2d4c1', { rough: 0.62 }),                       /* 白皙皮肤（实测 244,206,189 受光） */
    skinD:   std('#d8ab95', { rough: 0.70 }),                       /* 耳窝/阴影 */
    blush:   std('#efb4a6', { rough: 0.80 }),                       /* 腮部淡红 */
    lip:     std('#cf8b7d', { rough: 0.70 }),                       /* 下唇 */
    mouth:   std('#6b4640', { rough: 0.80 }),                       /* 抿嘴线 */
    hair:    std('#1b1b21', { rough: 0.46, envInt: 1.2 }),          /* 黑发（蓝灰高光） */
    hair2:   std('#26262e', { rough: 0.50 }),                       /* 发梢层次 */
    hairD:   std('#0d0d11', { rough: 0.70 }),                       /* 分缝暗线 */
    brow:    std('#111115', { rough: 0.75 }),                       /* 浓黑眉 */
    frame:   std('#0a0a0d', { rough: 0.42 }),                       /* 墨镜镜框（哑光黑） */
    lens:    std('#0e1016', { rough: 0.12, metal: 0.55, envInt: 1.6 }), /* 镜片（高反射深色） */
    glint:   std('#e6ecf2', { rough: 0.30, emissive: '#c8d2dc', ei: 0.45 }), /* 镜片反光条 */
    coat:    std('#2b2929', { rough: 0.74, side: THREE.DoubleSide }), /* 风衣主体（双面，见内衬） */
    coatD:   std('#1a1919', { rough: 0.86, side: THREE.DoubleSide }), /* 风衣包边/开衩/袖口 */
    coatHi:  std('#3a3738', { rough: 0.70 }),                       /* 垂直褶受光棱 */
    shirt:   std('#262529', { rough: 0.82 }),                       /* 黑衬衫 */
    shirt2:  std('#262529', { rough: 0.82, side: THREE.DoubleSide }), /* 衬衫领（双面） */
    placket: std('#313035', { rough: 0.80 }),                       /* 门襟 */
    button:  std('#4a4a50', { rough: 0.40 }),                       /* 衬衫扣 */
    pants:   std('#131315', { rough: 0.84 }),                       /* 西裤（立绘纯黑） */
    crease:  std('#232327', { rough: 0.80 }),                       /* 裤线 */
    belt:    std('#191a1c', { rough: 0.45 }),                       /* 皮带 */
    buckle:  std('#aaaab0', { rough: 0.30, metal: 0.90, envInt: 1.2 }), /* 银扣 */
    buckleD: std('#4f5056', { rough: 0.50, metal: 0.60 }),          /* 扣芯 */
    shoe:    std('#1e1f24', { rough: 0.32, metal: 0.05, envInt: 1.1 }), /* 皮鞋（微光泽） */
    shoeD:   std('#15161a', { rough: 0.50 }),                       /* 鞋舌/沿条/缝线 */
    sole:    std('#111113', { rough: 0.90 }),                       /* 厚底 */
    lace:    std('#2d2d32', { rough: 0.70 })                        /* 鞋带 */
  };

  /* 关节内局部 y = 世界 y - 关节 y */
  function hy(y) { return y - 1.1; }
  function ty(y) { return y - 0.52; }
  function ay(y) { return y - 1.0; }
  function ly(y) { return y - 0.5; }

  /* =====================================================================
   * 2. 头（head 关节 @ (0,1.1,0)）—— 颅/颌/尖下巴 + 耳 + 皱眉 + 小鼻 + 抿嘴 + 墨镜 + 黑发
   * ===================================================================== */
  var head = grp(0, 1.1, 0); head.name = 'head'; g.add(head);

  /* 颈（被衬衫领/风衣领遮大半） */
  head.add(cyl(0.068, 0.08, 0.22, M.skin, 0, hy(1.22), 0.0, 16));
  /* 颅：略竖长椭球（颅心世界 1.395）；颌：宽扁球收成瘦削下颌；尖下巴 */
  head.add(sph(0.185, M.skin, 0, hy(1.395), 0, 0.95, 1.02, 0.92, 26, 18));
  head.add(sph(0.15, M.skin, 0, hy(1.31), 0.01, 0.90, 0.72, 0.9, 20, 14));
  var chin = sph(0.05, M.skin, 0, hy(1.215), 0.06, 1.15, 0.75, 0.9); chin.name = 'chin'; head.add(chin);
  /* 颧骨 ×2（面颊立体感）+ 腮部淡红 ×2 */
  var s;
  for (s = -1; s <= 1; s += 2) {
    head.add(sph(0.055, M.skin, 0.125 * s, hy(1.335), 0.085, 1.0, 0.7, 0.8));
    head.add(sph(0.04, M.blush, 0.115 * s, hy(1.30), 0.098, 1.2, 0.55, 0.35));
  }
  /* 小鼻（墨镜下缘露出）+ 鼻孔暗点 ×2 */
  var nose = sph(0.022, M.skin, 0, hy(1.335), 0.168, 0.78, 1.15, 0.85); nose.name = 'nose'; head.add(nose);
  head.add(sph(0.007, M.skinD, -0.011, hy(1.322), 0.176, 1, 0.7, 0.6));
  head.add(sph(0.007, M.skinD, 0.011, hy(1.322), 0.176, 1, 0.7, 0.6));
  /* 抿直的嘴线 + 下唇微凸（冷峻） */
  var mouth = box(0.05, 0.007, 0.006, M.mouth, 0, hy(1.262), 0.124); mouth.name = 'mouth'; head.add(mouth);
  head.add(sph(0.02, M.lip, 0, hy(1.251), 0.116, 1.3, 0.4, 0.5));
  /* 耳 ×2（外露明显，鬓角只压上缘——立绘双耳清晰外凸） */
  for (s = -1; s <= 1; s += 2) {
    head.add(sph(0.05, M.skin, 0.196 * s, hy(1.352), -0.008, 0.5, 1.05, 0.75));
    head.add(sph(0.03, M.skinD, 0.212 * s, hy(1.35), -0.002, 0.3, 0.75, 0.52));
  }
  /* 眉骨隆起 ×2 + 浓黑皱眉 ×2（内端压低、内粗外细；随颅面弧度转向；露在镜框上缘之上） */
  for (s = -1; s <= 1; s += 2) {
    head.add(sph(0.055, M.skin, 0.09 * s, hy(1.45), 0.135, 1.35, 0.45, 0.55));
    var bg = grp(0.088 * s, hy(1.432), 0.166);
    bg.rotation.y = -0.30 * s; bg.rotation.z = 0.26 * s; bg.name = s > 0 ? 'browL' : 'browR';
    bg.add(box(0.052, 0.024, 0.012, M.brow, -0.026 * s, 0, 0));
    bg.add(box(0.056, 0.016, 0.012, M.brow, 0.034 * s, 0.005, -0.005));
    head.add(bg);
  }

  /* ---- 墨镜（wayfarer，占脸宽约 90%）：镜框(带孔)+镜片+反光条+鼻梁+镜腿+铰链 ---- */
  var glassesG = grp(0, hy(1.362), 0); glassesG.name = 'glassesG'; head.add(glassesG);
  function lensShapes(sd) {
    var outer = [[-0.076 * sd, 0.046], [0.072 * sd, 0.053], [0.066 * sd, -0.047], [-0.068 * sd, -0.051]];
    var inner = outer.map(function (p) { return [p[0] * 0.82, p[1] * 0.80]; });
    var frame = roundedShape(outer, 0.014);
    frame.holes.push(roundedShape(inner, 0.010, new THREE.Path()));
    var lens = roundedShape(inner, 0.010);
    return { frame: frame, lens: lens };
  }
  for (s = -1; s <= 1; s += 2) {
    var lg = grp(0.083 * s, 0, 0.150); lg.rotation.y = 0.42 * s; lg.name = s > 0 ? 'lensL' : 'lensR';
    var shp = lensShapes(s);
    var fr = mesh(new THREE.ExtrudeGeometry(shp.frame, { depth: 0.013, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 2 }), M.frame);
    fr.name = 'glassFrame'; lg.add(fr);
    var ln = mesh(new THREE.ExtrudeGeometry(shp.lens, { depth: 0.008, bevelEnabled: false }), M.lens);
    ln.position.z = 0.005; ln.name = 'glassLens'; lg.add(ln);
    var gl = box(0.048, 0.005, 0.002, M.glint, 0.016, 0.016, 0.015); gl.rotation.z = -0.5; gl.name = 'glint'; lg.add(gl);
    lg.add(sph(0.0055, M.glint, -0.028, -0.02, 0.015, 1, 1, 0.3));
    glassesG.add(lg);
    /* 镜腿（从外上角向后沿颅侧到耳）+ 铰链 */
    var tp = box(0.011, 0.015, 0.17, M.frame, 0.172 * s, 0.014, 0.05); tp.rotation.y = -0.25 * s; tp.name = 'temple'; glassesG.add(tp);
    glassesG.add(box(0.016, 0.022, 0.016, M.frame, 0.163 * s, 0.014, 0.125));
  }
  glassesG.add(box(0.03, 0.012, 0.012, M.frame, 0, 0.016, 0.163));   /* 鼻梁桥 */

  /* ---- 黑发：冠壳（露前额/脸）+ 后脑体积 + 分缝线 + 38 束扁平发绺贴表面
   *      （冠面斜扫层 6 / 冠缘刘海 9 / 鬓角 4 / 顶蓬乱 7 / 侧后 8 / 后颈 4）---- */
  var hairG = grp(0, 0, 0); hairG.name = 'hairG'; head.add(hairG);
  var capC = new V3(0, hy(1.455), -0.01), capR = new V3(0.262, 0.253, 0.2455);
  var cap = mesh(new THREE.SphereGeometry(0.248, 26, 18, 0, PI * 2, 0, 1.36), M.hair);
  cap.position.copy(capC); cap.scale.set(1.055, 1.02, 0.99); cap.name = 'hairCap'; hairG.add(cap);
  var backHair = sph(0.215, M.hair, 0, hy(1.44), -0.06, 1.06, 0.90, 0.95, 20, 14); backHair.name = 'hairBack'; hairG.add(backHair);
  /* 分缝：沿子午线的暗色细弧（前额偏左 φ=+0.45 → 头顶；刘海向 -x 扫，与立绘一致） */
  var part = mesh(new THREE.TorusGeometry(0.254, 0.0045, 8, 30, 1.25), M.hairD);
  part.position.copy(capC); part.rotation.set(0, 0.45 + PI / 2, PI / 2); part.name = 'hairPart'; hairG.add(part);
  /* 发绺：尖头泪滴 lathe（压扁成发片），基部埋入冠壳 */
  var petalPts = [[0.001, 0], [0.30, 0.02], [0.46, 0.14], [0.50, 0.30], [0.44, 0.52], [0.28, 0.76], [0.10, 0.93], [0.001, 1.0]];
  var petalV = petalPts.map(function (p) { return new THREE.Vector2(p[0], p[1]); });
  var petalGeo = new THREE.LatheGeometry(petalV, 12);
  function capPt(theta, phi) { return new V3(capC.x + capR.x * sin(theta) * sin(phi), capC.y + capR.y * cos(theta), capC.z + capR.z * sin(theta) * cos(phi)); }
  function capN(theta, phi) { return new V3(sin(theta) * sin(phi), cos(theta), sin(theta) * cos(phi)); }
  var tuftFlat = 0.5;   /* 发片厚度比（后脑发片取 0.35 更扁） */
  function tuft(base, dir, len, w, mat, flat) {
    var m = mesh(petalGeo, mat || M.hair);
    var d = dir.clone().normalize();
    m.position.copy(base);
    m.quaternion.setFromUnitVectors(UP, d);
    m.scale.set(w, len, w * (flat || tuftFlat));
    hairG.add(m);
    return m;
  }
  /* 切向发绺：dir = 切向(沿球面指定方向) + lift·法向，基点内缩 0.025 */
  function lock(theta, phi, tangent, len, w, mat, lift) {
    var n = capN(theta, phi);
    var b = capPt(theta, phi).sub(n.clone().multiplyScalar(0.025));
    var t = new V3(tangent[0], tangent[1], tangent[2]);
    t.sub(n.clone().multiplyScalar(t.dot(n))).normalize();          /* 投影到切平面 */
    var d = t.add(n.multiplyScalar(lift === undefined ? -0.12 : lift));
    return tuft(b, d, len, w, mat);
  }
  /* 绝对方向发绺（刘海：从冠壳前缘向下/向内贴额头） */
  function bang(theta, phi, dir, len, w, mat) {
    var b = capPt(theta, phi).sub(capN(theta, phi).multiplyScalar(0.03));
    return tuft(b, new V3(dir[0], dir[1], dir[2]), len, w, mat);
  }
  /* 冠面斜扫层 6 束：从分缝(φ≈+0.45)高处贴冠面向 -x/向下扫到冠缘，构成"长刘海斜扫"的上半段（扁薄成发丝股） */
  tuftFlat = 0.32;
  lock(1.02, 0.95, [-0.75, -0.65, 0], 0.15, 0.08, M.hair2, -0.10);
  lock(1.05, 0.55, [-0.85, -0.55, 0], 0.16, 0.085, M.hair, -0.10);
  lock(1.08, 0.15, [-0.9, -0.5, 0], 0.16, 0.085, M.hair2, -0.10);
  lock(1.12, -0.25, [-0.9, -0.5, 0], 0.15, 0.08, M.hair, -0.10);
  lock(1.15, -0.65, [-0.8, -0.6, 0], 0.14, 0.075, M.hair2, -0.10);
  lock(0.95, -0.45, [-0.95, -0.3, 0], 0.13, 0.075, M.hair, -0.08);
  tuftFlat = 0.5;
  /* 冠缘刘海 9 束（世界 y≈1.50 起）：分缝侧短露前额；扫向侧渐长，尖端搭在观察者右侧镜框上缘；向内贴额 */
  bang(1.36, 1.00, [0.30, -1.0, -0.30], 0.10, 0.064, M.hair);
  bang(1.36, 0.72, [-0.10, -1.0, -0.45], 0.075, 0.066, M.hair2);
  bang(1.36, 0.45, [-0.50, -1.0, -0.50], 0.07, 0.07, M.hair);
  bang(1.36, 0.18, [-0.70, -1.0, -0.50], 0.085, 0.074, M.hair2);
  bang(1.36, -0.08, [-0.80, -0.95, -0.50], 0.11, 0.076, M.hair);
  bang(1.36, -0.34, [-0.85, -0.90, -0.48], 0.135, 0.076, M.hair2);
  bang(1.36, -0.60, [-0.75, -0.95, -0.45], 0.15, 0.072, M.hair);
  bang(1.36, -0.85, [-0.50, -1.0, -0.35], 0.15, 0.068, M.hair2);
  bang(1.36, -1.05, [-0.30, -1.0, -0.25], 0.13, 0.064, M.hair);
  /* 鬓角 2×2：从冠缘斜向内下垂到镜腿旁，只压耳上缘（耳外露） */
  for (s = -1; s <= 1; s += 2) {
    bang(1.36, 1.22 * s, [-0.30 * s, -1.0, -0.10], 0.11, 0.068, M.hair2);
    bang(1.36, 1.45 * s, [-0.20 * s, -1.0, -0.02], 0.10, 0.07, M.hair);
  }
  /* 顶部 7 束蓬乱：贴表面向后/向侧铺展，尾端翘起成锯齿轮廓（立绘顶发蓬松凌乱，峰偏观察者左侧） */
  lock(0.55, 0.9, [0.7, 0, -0.5], 0.15, 0.10, M.hair2, 0.28);
  lock(0.50, -0.7, [-0.8, 0, -0.4], 0.15, 0.10, M.hair, 0.30);
  lock(0.65, 2.9, [0, 0, -1.0], 0.14, 0.11, M.hair2, 0.14);
  lock(0.85, 2.1, [0.9, 0, -0.3], 0.14, 0.10, M.hair, 0.18);
  lock(0.80, -2.2, [-0.9, 0, -0.3], 0.14, 0.10, M.hair2, 0.18);
  lock(0.40, -0.1, [-0.6, 0, 0.8], 0.13, 0.09, M.hair, 0.32);
  lock(0.30, 2.5, [0.5, 0, -0.8], 0.13, 0.095, M.hair2, 0.25);
  /* 侧后 2×2 + 前侧上层 2×2 + 后颈 4 束：贴表面下垂，宽扁叠压成发量 */
  for (s = -1; s <= 1; s += 2) {
    tuftFlat = 0.35;
    lock(1.25, 1.85 * s, [0, -1.0, 0], 0.13, 0.10, M.hair2, 0.05);
    lock(1.40, 2.3 * s, [0, -1.0, 0], 0.13, 0.10, M.hair, 0.04);
    lock(0.90, 1.40 * s, [0.2 * s, -1.0, -0.3], 0.13, 0.09, M.hair2, 0.15);
    lock(0.35, 2.0 * s, [0.6 * s, 0, -0.8], 0.12, 0.09, M.hair, 0.25);
  }
  lock(1.45, 2.75, [0, -1.0, 0], 0.13, 0.105, M.hair2, 0.04);
  lock(1.48, PI, [0, -1.0, 0], 0.14, 0.11, M.hair, 0.04);
  lock(1.45, -2.75, [0, -1.0, 0], 0.13, 0.105, M.hair2, 0.04);
  lock(1.15, PI + 0.3, [0.3, -1.0, 0], 0.12, 0.10, M.hair, 0.06);
  tuftFlat = 0.5;

  /* =====================================================================
   * 3. 躯干（torso 关节 @ (0,0.52,0)）—— 衬衫/门襟/扣 + 皮带银扣 + 裤裆 + 风衣上身/立领/翻角 + A 字下摆
   * ===================================================================== */
  var torso = grp(0, 0.52, 0); torso.name = 'torso'; g.add(torso);

  /* 衬衫（前襟 V 口可见）+ 门襟 + 4 粒扣（扣到领口）+ 衬衫领 */
  var shirt = cyl(0.14, 0.145, 0.27, M.shirt, 0, ty(1.005), 0, 20); shirt.scale.z = 0.85; shirt.name = 'shirt'; torso.add(shirt);
  torso.add(box(0.028, 0.25, 0.006, M.placket, 0, ty(0.995), 0.125));
  torso.add(sph(0.009, M.button, 0, ty(0.925), 0.13));
  torso.add(sph(0.009, M.button, 0, ty(0.985), 0.13));
  torso.add(sph(0.009, M.button, 0, ty(1.045), 0.13));
  torso.add(sph(0.009, M.button, 0, ty(1.105), 0.118));
  var shirtCollar = lathe([[0.09, ty(1.12)], [0.10, ty(1.16)], [0.115, ty(1.185)]], 20, 0.40, PI * 2 - 0.80, M.shirt2);
  shirtCollar.name = 'shirtCollar'; torso.add(shirtCollar);

  /* 皮带（裤腰，透过前襟可见）+ 银扣（座/芯/针）+ 扣环 ×2 */
  var belt = mesh(new THREE.TorusGeometry(0.105, 0.017, 12, 28), M.belt);
  belt.position.set(0, ty(0.865), 0); belt.rotation.x = PI / 2; belt.scale.set(1.3, 0.95, 1); belt.name = 'belt'; torso.add(belt);
  var buckle = box(0.058, 0.048, 0.012, M.buckle, 0, ty(0.865), 0.124); buckle.name = 'buckle'; torso.add(buckle);
  torso.add(box(0.038, 0.028, 0.005, M.buckleD, 0, ty(0.865), 0.132));
  torso.add(box(0.006, 0.036, 0.004, M.buckle, 0, ty(0.865), 0.135));
  torso.add(box(0.012, 0.046, 0.010, M.crease, -0.062, ty(0.865), 0.117));
  torso.add(box(0.012, 0.046, 0.010, M.crease, 0.062, ty(0.865), 0.117));
  /* 裤裆/骨盆块（填满前襟开衩后方与两腿根之间） */
  var pelvis = cyl(0.135, 0.15, 0.40, M.pants, 0, ty(0.66), 0, 18); pelvis.scale.z = 0.82; pelvis.name = 'pelvis'; torso.add(pelvis);

  /* 风衣上身：lathe 前襟留口（φ 缺口朝 +z，半角 0.45，立绘前襟敞开较宽）；肩线世界 1.095 r0.176 */
  var GAP = 0.45;
  var coatTop = lathe([
    [0.105, ty(1.135)], [0.15, ty(1.12)], [0.176, ty(1.095)], [0.178, ty(1.06)],
    [0.164, ty(1.00)], [0.158, ty(0.93)], [0.156, ty(0.87)], [0.156, ty(0.855)]
  ], 28, GAP, PI * 2 - GAP * 2, M.coat);
  coatTop.scale.z = 0.78; coatTop.name = 'coatTop'; torso.add(coatTop);
  /* 肩缝线 ×2（结构化肩线）+ 后育克横缝 */
  for (s = -1; s <= 1; s += 2) torso.add(box(0.07, 0.006, 0.10, M.coatD, 0.155 * s, ty(1.09), 0.0));
  torso.add(box(0.24, 0.006, 0.008, M.coatD, 0, ty(1.03), -0.131));
  /* 翻折驳头 ×2（沿前襟边缘，外缘后折、上端外张，从领底到皮带） */
  for (s = -1; s <= 1; s += 2) {
    var lap = box(0.085, 0.30, 0.014, M.coat, 0.088 * s, ty(0.985), 0.122);
    lap.rotation.y = 0.75 * s; lap.rotation.z = -0.12 * s; lap.name = s > 0 ? 'lapelL' : 'lapelR'; torso.add(lap);
  }
  /* 立领（高立、外翻，环绕后颈/两侧，前端开口）+ 前翻角 ×2（宽大横展如翼，立绘"领角框住脸"） */
  var collar = lathe([[0.148, ty(1.10)], [0.165, ty(1.16)], [0.185, ty(1.21)], [0.20, ty(1.245)]], 24, 0.75, PI * 2 - 1.50, M.coat);
  collar.scale.z = 0.85; collar.name = 'collar'; torso.add(collar);
  for (s = -1; s <= 1; s += 2) {
    var tip = box(0.115, 0.15, 0.013, M.coat, 0.148 * s, ty(1.15), 0.112);
    tip.rotation.y = 0.62 * s; tip.rotation.z = -0.58 * s; tip.name = s > 0 ? 'collarTipL' : 'collarTipR'; torso.add(tip);
  }

  /* A 字下摆组（枢轴在腰，待机微摆）：lathe + 下摆波浪顶点位移 + 前襟包边 + 垂直褶 + 后开衩 + 后中缝 + 插手兜 */
  var skirtG = grp(0, ty(0.855), 0); skirtG.name = 'skirtG'; torso.add(skirtG);
  var SK_H = 0.60;   /* 腰 0.855 → 下摆 0.255 */
  var skirt = lathe([
    [0.158, 0.0], [0.168, -0.08], [0.185, -0.20], [0.212, -0.34], [0.245, -0.47], [0.272, -0.565], [0.282, -SK_H]
  ], 28, GAP, PI * 2 - GAP * 2, M.coat);
  skirt.scale.z = 0.78; skirt.name = 'coatSkirt'; skirtG.add(skirt);
  (function () {   /* 下摆布料波浪：幅度随深度平方增长，确定性正弦叠加 */
    var pos = skirt.geometry.attributes.position, i;
    for (i = 0; i < pos.count; i++) {
      var x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      var r = Math.sqrt(x * x + z * z); if (r < 1e-6) continue;
      var phi = Math.atan2(x, z);
      var t = Math.min(1, Math.max(0, -y / SK_H)), w = t * t;
      var nr = r + w * (0.012 * sin(phi * 5 + 0.6) + 0.006 * sin(phi * 9 + 2.0));
      pos.setXYZ(i, nr * sin(phi), y, nr * cos(phi));
    }
    pos.needsUpdate = true;
    skirt.geometry.computeVertexNormals();
  })();
  /* 前襟包边 ×2（沿开口边缘，随 A 字外张/前倾） */
  for (s = -1; s <= 1; s += 2) {
    var band = box(0.016, 0.60, 0.022, M.coatD, 0.096 * s, -0.30, 0.155);
    band.rotation.x = -0.144; band.rotation.z = 0.09 * s; band.name = s > 0 ? 'edgeBandL' : 'edgeBandR'; skirtG.add(band);
  }
  /* 垂直褶棱 ×4（受光面略亮） */
  [0.85, -0.85, 2.3, -2.3].forEach(function (phi) {
    var r = 0.221;
    var f = sph(1, M.coatHi, r * sin(phi), -0.36, r * cos(phi) * 0.78 + 0.002, 0.012, 0.24, 0.018);
    f.rotation.y = phi; f.rotation.z = -0.075 * Math.sign(sin(phi)); skirtG.add(f);
  });
  /* 后开衩 + 后中缝 + 下摆内衬带（敞口处可见的深色里衬） */
  var vent = box(0.012, 0.19, 0.02, M.coatD, 0, -0.505, -0.205); vent.rotation.x = 0.14; vent.name = 'vent'; skirtG.add(vent);
  var seam = box(0.006, 0.40, 0.008, M.coatD, 0, -0.20, -0.153); seam.rotation.x = 0.10; skirtG.add(seam);
  var lining = lathe([[0.252, -0.595], [0.258, -0.54]], 28, GAP, PI * 2 - GAP * 2, M.coatD);
  lining.scale.z = 0.78; lining.name = 'hemLining'; skirtG.add(lining);
  /* 插手兜 ×2（贴袋 + 斜兜口贴边 + 底缝线 + 手在兜内的鼓包）—— 手腕从上方入兜，立绘兜口为斜线 */
  for (s = -1; s <= 1; s += 2) {
    var pk = grp(0.148 * s, -0.15, 0.074); pk.rotation.y = 1.0 * s; pk.name = s > 0 ? 'pocketL' : 'pocketR';
    pk.add(box(0.12, 0.15, 0.024, M.coat, 0, 0, 0.012));
    var welt = box(0.115, 0.015, 0.03, M.coatD, 0.012, 0.062, 0.016);
    welt.rotation.z = 0.5 * s; pk.add(welt);
    pk.add(box(0.11, 0.005, 0.005, M.coatD, 0, -0.07, 0.026));
    pk.add(sph(0.045, M.coat, 0, 0.005, 0.02, 1.15, 1.2, 0.6));
    skirtG.add(pk);
  }

  /* =====================================================================
   * 4. 手臂（armL s=+1 / armR s=-1；关节 (±0.35,1.0,0)，网格向内偏移到肩点 x≈±0.20）
   *    姿态：上臂微外撑下垂 → 手肘外顶后靠 → 小臂内收前送入兜 → 袖口/手腕停在兜口
   * ===================================================================== */
  function buildArm(s) {
    var pv = grp(0.35 * s, 1.0, 0); pv.name = s > 0 ? 'armL' : 'armR'; g.add(pv);
    var inner = grp(); inner.name = s > 0 ? 'armInL' : 'armInR'; pv.add(inner);
    var S = new V3(-0.16 * s, ay(0.975), 0.0);
    var E = new V3(-0.135 * s, ay(0.835), -0.035);
    var W = new V3(-0.185 * s, ay(0.775), 0.095);
    var capM = sph(0.066, M.coat, -0.16 * s, ay(0.985), 0, 1.0, 0.9, 1.0, 18, 14); capM.name = 'shoulderCap'; inner.add(capM); /* 袖山（大半藏在风衣肩内） */
    var up = limb(M.coat, S, E, 0.062, 0.058); up.name = 'upperArm'; inner.add(up);
    inner.add(sph(0.058, M.coat, E.x, E.y, E.z));                                      /* 肘 */
    var cr = sph(0.018, M.coatD, E.x + 0.05 * s, E.y + 0.005, E.z - 0.025, 0.6, 1.4, 0.7); inner.add(cr); /* 肘外折痕 */
    var fo = limb(M.coat, E, W, 0.058, 0.052); fo.name = 'forearm'; inner.add(fo);
    var u = new V3().subVectors(E, W).normalize();                                     /* 腕→肘 单位向量 */
    var cuffMid = W.clone().addScaledVector(u, 0.03);
    var cuff = limb(M.coatD, W.clone().addScaledVector(u, 0.05), W.clone().addScaledVector(u, 0.008), 0.056, 0.056);
    cuff.name = 'cuff'; inner.add(cuff);
    inner.add(ringAt(M.coat, W.clone().addScaledVector(u, 0.05), u, 0.053, 0.008));    /* 袖口翻边环 */
    /* 袖口搭扣带 + 扣（风衣袖口细节，外侧） */
    var strap = box(0.012, 0.045, 0.052, M.coatD, cuffMid.x + 0.054 * s, cuffMid.y, cuffMid.z + 0.004);
    strap.quaternion.copy(cuff.quaternion); inner.add(strap);
    inner.add(sph(0.008, M.button, cuffMid.x + 0.061 * s, cuffMid.y + 0.004, cuffMid.z + 0.004));
    var fold = sph(0.016, M.coatD, E.x - 0.035 * s, E.y - 0.01, E.z + 0.04, 0.6, 1.2, 0.6); inner.add(fold); /* 肘内褶 */
    var wrist = limb(M.skin, W.clone().addScaledVector(u, 0.012), W.clone().addScaledVector(u, -0.016), 0.038, 0.036, 12);
    wrist.name = 'wrist'; inner.add(wrist);                                            /* 手腕：仅在袖口/兜口间露一线 */
    return pv;
  }
  var armL = buildArm(1), armR = buildArm(-1);

  /* =====================================================================
   * 5. 腿（legL s=+1 / legR s=-1；关节 (±0.17,0.5,0)，网格内移到 x≈±0.11）
   *    大腿藏在风衣内；膝组（可屈）：小腿直筒西裤 + 裤线 + 裤脚 + 厚底圆头皮鞋（外八）
   * ===================================================================== */
  function buildLeg(s) {
    var pv = grp(0.17 * s, 0.5, 0); pv.name = s > 0 ? 'legL' : 'legR'; g.add(pv);
    var X = -0.072 * s;
    pv.add(cyl(0.078, 0.072, 0.25, M.pants, X, ly(0.385), 0, 16));
    var knee = grp(X, ly(0.265), 0); knee.name = s > 0 ? 'kneeL' : 'kneeR'; pv.add(knee);
    knee.add(sph(0.073, M.pants, 0, 0, 0, 1, 0.8, 1));
    knee.add(cyl(0.072, 0.066, 0.17, M.pants, 0, -0.085, 0, 16));
    knee.add(box(0.006, 0.15, 0.006, M.crease, 0, -0.085, 0.068));                    /* 裤线 */
    knee.add(cyl(0.070, 0.072, 0.03, M.pants, 0, -0.155, 0, 16));                       /* 裤脚 */
    var shoeG = grp(0.008 * s, -0.165, 0.012); shoeG.rotation.y = 0.16 * s; shoeG.name = s > 0 ? 'shoeL' : 'shoeR'; knee.add(shoeG);
    shoeG.add(box(0.168, 0.034, 0.30, M.sole, 0, -0.083, 0.025));                       /* 厚底（底 y=0） */
    shoeG.add(box(0.174, 0.012, 0.306, M.shoeD, 0, -0.060, 0.025));                     /* 沿条 */
    shoeG.add(sph(0.078, M.shoe, 0, -0.040, 0.012, 1.0, 0.72, 1.55, 18, 14));           /* 鞋身（椭球，圆润） */
    shoeG.add(sph(0.07, M.shoe, 0, -0.048, 0.095, 1.0, 0.66, 1.15));                    /* 圆钝鞋头 */
    shoeG.add(box(0.11, 0.006, 0.006, M.shoeD, 0, -0.010, 0.07));                       /* 鞋头缝线 */
    shoeG.add(sph(0.072, M.shoe, 0, -0.036, -0.07, 1.0, 0.85, 0.9));                    /* 后跟壳 */
    shoeG.add(box(0.10, 0.04, 0.08, M.shoeD, 0, 0.012, -0.02));                         /* 鞋舌/鞋口 */
    shoeG.add(box(0.075, 0.006, 0.008, M.lace, 0, 0.004, 0.02));                        /* 鞋带 ×2 */
    shoeG.add(box(0.075, 0.006, 0.008, M.lace, 0, -0.002, 0.048));
    shoeG.add(sph(0.006, M.buckleD, -0.036, 0.004, 0.02));                              /* 鞋带孔 ×4 */
    shoeG.add(sph(0.006, M.buckleD, 0.036, 0.004, 0.02));
    shoeG.add(sph(0.006, M.buckleD, -0.036, -0.002, 0.048));
    shoeG.add(sph(0.006, M.buckleD, 0.036, -0.002, 0.048));
    return pv;
  }
  var legL = buildLeg(1), legR = buildLeg(-1);

  /* ---------------- 6. 装配契约 + 动画 ---------------- */
  g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };

  var armInL = armL.getObjectByName('armInL'), armInR = armR.getObjectByName('armInR');
  var kneeL = legL.getObjectByName('kneeL'), kneeR = legR.getObjectByName('kneeR');
  var collarTipL = torso.getObjectByName('collarTipL'), collarTipR = torso.getObjectByName('collarTipR');
  var tAcc = 0;
  /* fn(t, dt, state) —— 兼容 tu.js 的 (t, dt) 调用；若以 (dt, state) 形式调用则内部累计时间。
   * 只动内层子组（armIn/knee/skirtG/hairG/网格 scale/torso.rotation），六关节 rotation/position 留给 view3d。 */
  function anim(a, b, c) {
    var t, state = null;
    if (b && typeof b === 'object') { tAcc += (typeof a === 'number' && isFinite(a) ? a : 1 / 60); t = tAcc; state = b; }
    else { t = (typeof a === 'number' && isFinite(a)) ? a : 0; state = (c && typeof c === 'object') ? c : null; }
    var mode = state ? (state.mode || state.state || '') : '';
    var walk = (mode === 'walk' || mode === 'run') ? 1 : (state && typeof state.walk === 'number' ? Math.min(1, Math.max(0, state.walk)) : 0);
    var jump = (mode === 'jump') ? 1 : (state && typeof state.jump === 'number' ? Math.min(1, Math.max(0, state.jump)) : 0);
    var br = sin(t * 1.5);
    /* 待机：胸腔呼吸（衬衫/风衣上身 xz 微缩放）+ 重心微晃 + 下摆/发梢/领角微动 */
    shirt.scale.x = 1 + br * 0.008; shirt.scale.z = 0.85 * (1 + br * 0.012);
    coatTop.scale.x = 1 + br * 0.006; coatTop.scale.z = 0.78 * (1 + br * 0.010);
    torso.rotation.z = sin(t * 0.7) * 0.012;
    torso.rotation.x = sin(t * 1.5) * 0.006;
    skirtG.rotation.x = sin(t * 1.1) * 0.012 + walk * sin(t * 6.0) * 0.03 - jump * 0.12;
    skirtG.rotation.z = sin(t * 0.8 + 0.5) * 0.010 + walk * sin(t * 3.0) * 0.02;
    skirtG.scale.x = 1 + walk * 0.03 + jump * 0.02;
    hairG.rotation.z = sin(t * 1.3) * 0.010;
    hairG.rotation.x = sin(t * 1.7 + 0.4) * 0.008 + walk * sin(t * 6.0 + 1.0) * 0.02;
    collarTipL.rotation.x = sin(t * 1.9) * 0.03 + walk * sin(t * 6.0 + 0.5) * 0.05;
    collarTipR.rotation.x = sin(t * 1.9 + 0.8) * 0.03 + walk * sin(t * 6.0 + 1.3) * 0.05;
    /* 行走：臂内层小幅前后摆（手不离兜）；膝交替微屈。跳跃：双膝收腿。幅度 ≤0.3rad
     * 插兜补偿：view3d.animToken 行走时对 armL/armR 关节施加 ±0.6 摆臂，会把手甩出兜口；
     * 这里读取关节当前角，用内层反向抵消一半（上限 0.3rad），手留在兜内、肩部仍有摆动感；
     * 关节角 >0.65（被捕惊慌举手 -2.55）时补偿线性退出，不干扰惊慌姿态。不写六关节本身。 */
    function pocketHold(r) {
      var a = Math.abs(r); if (!(a > 1e-4)) return 0;
      var k = Math.min(0.5, 0.3 / a) * Math.min(1, Math.max(0, 1 - (a - 0.65) / 0.6));
      return -r * k;
    }
    var ph = t * 6.0;
    armInL.rotation.x = pocketHold(armL.rotation.x) + walk * sin(ph) * 0.12;
    armInR.rotation.x = pocketHold(armR.rotation.x) - walk * sin(ph) * 0.12;
    kneeL.rotation.x = walk * Math.max(0, sin(ph)) * 0.25 + jump * 0.30;
    kneeR.rotation.x = walk * Math.max(0, -sin(ph)) * 0.25 + jump * 0.30;
    return br;
  }
  g.userData.anim = [anim];

  return g;
};

})();
