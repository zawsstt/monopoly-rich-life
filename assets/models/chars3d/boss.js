/* =====================================================================================
 * 大富翁 · 富贵人生 —— 精细角色：富老板 boss（img2threejs 管线产出 · v3 深度精修）
 * -------------------------------------------------------------------------------------
 * 参考图：refs/char_boss.png（三视图：正/侧/背）+ assets/img/full3_boss.png（正面全身立绘）
 *        + pose_boss_cheer/hit.png（表情神态）。视觉唯一基准；v3 在 v2 已验收形态上做细节加厚，
 *        不改整体轮廓/配色/关节契约。
 * ※ 立绘实测为后梳蓬帕杜全发（非秃顶），"顶部反光"以发胶高光带实现（见 v3-5）。
 *
 * v3 深度精修清单（面部 / 手部四肢 优先；对照差距清单 B1-B14）：
 *   B1  眼放大（眼白 r0.032→0.040、虹膜 0.024→0.029）+ 重上睑压虹膜上缘 + 上睫深线 +
 *       双眼皮褶线 + 下睑 + 卧蚕 + 主/副双高光 → 半睁自信 smirk 眼神
 *   B2  眉由 3 段方盒改为 4 段拉长椭球沿弧切向排布（相邻重叠≥40% → 连续粗眉，内粗低→中拱→外细收），
 *       左眉微抬（挑眉神态）
 *   B3  胡下新增不对称微笑细缝（右角上翘 smirk）+ 肉感下唇 + 颏沟下移归位
 *       （试做颊侧笑窝小球，3/4 视角读作痣，已撤）
 *   B4  鼻头强高光球（立绘鼻尖白点）
 *   B5  蓬帕杜发胶高光带 ×3（顶脊/前额发浪/后顶）+ 后脑中缝暗线；发材质更油亮（rough 0.58→0.50）
 *   B6  侧发块缩小后移（原"耳罩"状遮耳），耳朵前移外露；鬓角贴脸
 *   B7  手部：右手握杖 4 指环握（横向指节柱 ×4 绕杖前缘）+ 拇指压顶；左手叉腰 4 指前伸贴髋
 *       + 拇指后扣；手掌收窄成握形
 *   B8  手杖柄下金流苏（吊绳 + 结球 + 3 丝穗），待机微摆
 *   B9  怀表链左端加表坠（金圆坠 + 表冠）
 *   B10 马甲前门襟缝线 ×2（扣间）
 *   B11 颈部肉褶 —— 不可几何化（本比例下颈部完全被领环/颅底遮蔽），记录遗留
 *   B12 裤腿膝部折痕环 ×2 + 前裤线（大腿/小腿各 1）×4
 *   B13 皮鞋 vamp 包头缝线环（每鞋 1；后跟 counter 环暗叠暗不可辨，为全局预算撤除）
 *   B14 八字胡改油亮材质（立绘 glossy）
 *   预算：v2 177 mesh → v3 218（≤260）；※ 全局 smoke_perf_budget allmax 场景基线 3994/4000
 *   已无余量，本轮细节增量必然越线（详见交付报告，阈值归属项目方决策）
 *
 * v2 精修记录（保留）：
 * 形象：梨形身材地产大亨 —— 圆肚金马甲（织锦暗纹）+ 白衬衫 + 深棕领带金领带针 + 胸袋巾 +
 *       双垂弧怀表链 + 背后活络调节带 + 浓眉小眼微表情 + 大圆鼻 + 上翘八字胡 +
 *       后梳蓬帕杜发型（脑后发卷分层）+ 竖条纹深色裤 + 漆皮浅口鞋（鞋扣/沿条/低跟）+
 *       金头手杖（雕花柄头+缠线握柄，右手拄地、左手叉腰）。
 *
 * v2 精修清单（对照参考图）：
 *   1) 马甲织锦暗纹加密：512px 织锦 Canvas（缎面光带+菱形格 trellis+涡草 medallion）
 *      + 同 UV roughnessMap（花纹处更光滑，缎面分区）；马甲下缘收边环。
 *   2) 面部微表情分层：眉毛 3 段收细挑弧（内低外高）、下眼睑+卧蚕眼袋、鼻翼+鼻孔、
 *      腮红、颊侧笑纹、下巴球+颏沟。
 *   3) 手杖金饰与握柄：蛋形柄头+顶针+喇叭颈+双箍环差异化+缠线握柄（3 道金丝）+
 *      杖身接箍+双层杖尖；右手加拇指扣握。
 *   4) 衬衫衣褶：肩泡下褶环、肘部堆褶、腕口布褶小球（双臂）。
 *   5) 袖口翻边：外翻双层袖头（band+fold）+ 金袖扣（球+环）双臂对称。
 *   6) 鞋型精修：鞋楦椭球+专利皮包头+后跟弧壳+薄底板+低跟块+沿条线+金色侧鞋扣。
 *   7) 怀表链双垂弧（参考图 garland 双 swag）+ 链坠珠。
 *   8) 背后调节带：金属方扣（框+针）+ 皮带环 + 带尾。
 *   9) 后脑发型卷：背视 2+3 分层发卷（finger-wave 读感）。
 *
 * 装配契约（view3d.js animToken 按此驱动，勿改关节位置）：
 *   根 Group 正面朝 +Z；userData.parts = { head, torso, armL, armR, legL, legR }
 *   legL/legR (±0.17,0.5,0) 腿网格 y≈-0.22 鞋底 -0.5；torso (0,0.52,0) 躯干 y≈+0.32；
 *   armL/armR (±0.39,1.0,0) 臂网格 y≈-0.15~-0.32；head (0,1.1,0) 颅心 y≈+0.28。
 *   总身高 ≈1.71（外部再乘 1.08）。
 * 注：view3d 每帧覆写六关节 rotation/position，故默认姿态烘进关节内网格；
 *     userData.anim 只用未被覆写的通道（躯干 rotation / 呼吸缩放 / 手杖微摆 /
 *     表链微摆 / 金件光泽）。
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
  /* v2：球一律 ≥16×12（规范下限），主形体另行加大 */
  function sph(r,mat,x,y,z){ var o=mesh(new THREE.SphereGeometry(r,16,12),mat); o.position.set(x||0,y||0,z||0); return o; }
  function sphS(r,ws,hs,mat,x,y,z){ var o=mesh(new THREE.SphereGeometry(r,ws,hs),mat); o.position.set(x||0,y||0,z||0); return o; }
  function grp(){ return new THREE.Group(); }
  /* 程序化 Canvas 纹理（≤512px，无外部资源） */
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
  var skinD   = std('#e2a980', { rough: 0.68 });   /* 阴影皮色：鼻孔/耳内/卧蚕/笑纹 */
  var blushM  = std('#eda084', { rough: 0.75 });   /* v2 腮红 */
  var hairM   = std('#523a28', { rough: 0.50 });   /* v3 发胶油亮（0.58→0.50） */
  var hairD   = std('#3a281a', { rough: 0.55 });   /* v3 后脑中缝暗线 */
  var hairSh  = std('#7b5b41', { rough: 0.28, envInt: 1.2 });   /* v3 发胶高光带 */
  var moM     = std('#4a3222', { rough: 0.42 });   /* v3 八字胡（立绘 glossy） */
  var mouthM  = std('#5e332a', { rough: 0.60 });   /* v3 胡下嘴缝 */
  var lipM    = std('#e8b49a', { rough: 0.55 });   /* v3 下唇 */
  var hiM     = std('#fff8f0', { rough: 0.25 });   /* v3 鼻头/眼高光 */
  var tasselM = std('#c9952e', { rough: 0.60, metal: 0.2 });   /* v3 手杖流苏丝穗 */
  var creaseM = std('#3a3128', { rough: 0.85 });   /* v3 前裤线（与条纹亮线同色） */
  var tieM    = std('#54341f', { rough: 0.72 });
  var shoeM   = std('#1d1712', { rough: 0.2, metal: 0.1, envInt: 1.3 });   /* 漆皮鞋身 */
  var shoeHi  = std('#241c15', { rough: 0.12, metal: 0.15, envInt: 1.6 }); /* v2 专利皮包头 */
  var soleM   = std('#120e0a', { rough: 0.4, metal: 0.05 });               /* v2 底板/鞋跟 */
  var caneM   = std('#2b1d12', { rough: 0.5, metal: 0.05 });               /* v2 手杖缠线握柄 */
  var goldM   = std('#d9a948', { rough: 0.34, metal: 0.8, envInt: 1.2, emissive: '#3a2400', ei: 0.18 });
  var irisM   = std('#403026', { rough: 0.4 });
  var pupilM  = std('#14100e', { rough: 0.3 });
  var vestTrim= std('#a87c26', { rough: 0.55, metal: 0.35, envInt: 1.0 });

  /* 白衬衫：256px 细织纹（极淡经纬线，保留近白读感） */
  var shirtTex = canvasTex(256, 256, function(ctx){
    ctx.fillStyle = '#f4f2ec'; ctx.fillRect(0, 0, 256, 256);
    var i;
    ctx.strokeStyle = 'rgba(188,182,166,0.15)'; ctx.lineWidth = 1;
    for (i = 0; i < 256; i += 8){ ctx.beginPath(); ctx.moveTo(0, i + 0.5); ctx.lineTo(256, i + 0.5); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(198,192,176,0.10)';
    for (i = 0; i < 256; i += 8){ ctx.beginPath(); ctx.moveTo(i + 0.5, 0); ctx.lineTo(i + 0.5, 256); ctx.stroke(); }
  }, 3, 2);
  var shirtM  = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: shirtTex, roughness: 0.82 });
  var shirtHi = std('#faf8f1', { rough: 0.68 });   /* 领口/袖口翻边（更挺括） */

  /* 金马甲织锦暗纹（v2 加密）：512px —— 缎面光带 + 菱形格 trellis + 涡草 medallion */
  var vestTex = canvasTex(512, 512, function(ctx){
    ctx.fillStyle = '#c8962e'; ctx.fillRect(0, 0, 512, 512);
    var i, j, k;
    /* 缎面竖向光带 */
    for (i = 0; i < 8; i++){
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(255,226,150,0.05)' : 'rgba(122,82,18,0.05)';
      ctx.fillRect(i * 64, 0, 32, 512);
    }
    /* 菱形格 trellis（对角线网格） */
    ctx.strokeStyle = 'rgba(146,100,24,0.20)'; ctx.lineWidth = 2;
    for (i = -8; i <= 8; i++){
      ctx.beginPath(); ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64 + 512, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i * 64, 512); ctx.lineTo(i * 64 + 512, 0); ctx.stroke();
    }
    /* 涡草 medallion：8 瓣卷草 + 双环 + 芯点 */
    function medallion(cx, cy, s){
      var a, px, py;
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(238,204,120,0.45)';
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.30, 0, PI * 2); ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(138,92,18,0.36)';
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.44, 0.35, PI * 2 - 0.35); ctx.stroke();
      ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(238,204,120,0.42)';
      for (k = 0; k < 8; k++){
        a = k * PI / 4 + PI / 8;
        px = cx + cos(a) * s * 0.30; py = cy + sin(a) * s * 0.30;
        ctx.beginPath(); ctx.arc(px, py, s * 0.14, a - 1.9, a + 1.0); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(148,102,26,0.4)';
      for (k = 0; k < 8; k++){
        a = k * PI / 4;
        ctx.beginPath(); ctx.arc(cx + cos(a) * s * 0.46, cy + sin(a) * s * 0.46, s * 0.05, 0, PI * 2); ctx.fill();
      }
      ctx.fillStyle = 'rgba(242,212,132,0.55)';
      ctx.beginPath(); ctx.arc(cx, cy, s * 0.08, 0, PI * 2); ctx.fill();
    }
    for (i = 0; i < 4; i++){
      for (j = 0; j < 4; j++){
        medallion(64 + i * 128 + (j % 2) * 64, 64 + j * 128, 54);
      }
    }
    /* 交叉点小菱形填花 */
    ctx.fillStyle = 'rgba(160,112,28,0.25)';
    for (i = 0; i < 4; i++){
      for (j = 0; j < 4; j++){
        var mx = i * 128, my = j * 128;
        ctx.beginPath(); ctx.moveTo(mx, my - 7); ctx.lineTo(mx + 7, my); ctx.lineTo(mx, my + 7); ctx.lineTo(mx - 7, my); ctx.closePath(); ctx.fill();
      }
    }
  }, 2, 2);
  /* 同 UV 粗糙度分区：花纹丝线更光滑（数值越低越亮），缎面底略涩 */
  var vestRoughT = canvasTex(512, 512, function(ctx){
    ctx.fillStyle = '#6e6e6e'; ctx.fillRect(0, 0, 512, 512);
    var i, j, k;
    ctx.strokeStyle = '#585858'; ctx.lineWidth = 2;
    for (i = -8; i <= 8; i++){
      ctx.beginPath(); ctx.moveTo(i * 64, 0); ctx.lineTo(i * 64 + 512, 512); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(i * 64, 512); ctx.lineTo(i * 64 + 512, 0); ctx.stroke();
    }
    ctx.strokeStyle = '#4a4a4a'; ctx.lineWidth = 3;
    for (i = 0; i < 4; i++){
      for (j = 0; j < 4; j++){
        var cx = 64 + i * 128 + (j % 2) * 64, cy = 64 + j * 128, s = 54, a, px, py;
        ctx.beginPath(); ctx.arc(cx, cy, s * 0.30, 0, PI * 2); ctx.stroke();
        ctx.lineWidth = 2;
        for (k = 0; k < 8; k++){
          a = k * PI / 4 + PI / 8;
          px = cx + cos(a) * s * 0.30; py = cy + sin(a) * s * 0.30;
          ctx.beginPath(); ctx.arc(px, py, s * 0.14, a - 1.9, a + 1.0); ctx.stroke();
        }
        ctx.lineWidth = 3;
      }
    }
  }, 2, 2);
  var vestM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: vestTex,
    roughness: 1.0, roughnessMap: vestRoughT, metalness: 0.5, envMapIntensity: 1.15 });

  /* 深裤竖条纹（pinstripe，128px 平铺 + 布面微噪） */
  var pinTex = canvasTex(128, 128, function(ctx){
    ctx.fillStyle = '#241f1a'; ctx.fillRect(0, 0, 128, 128);
    var i, j;
    ctx.fillStyle = '#3a3128';
    ctx.fillRect(0, 0, 3, 128); ctx.fillRect(64, 0, 3, 128);
    ctx.fillStyle = 'rgba(16,12,8,0.22)';
    for (i = 0; i < 8; i++){
      for (j = 0; j < 8; j++){
        if ((i * 7 + j * 13) % 5 === 0) ctx.fillRect(i * 16 + ((j * 5) % 8), j * 16 + ((i * 3) % 8), 7, 5);
      }
    }
  }, 10, 2);
  var pantsM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: pinTex, roughness: 0.88 });

  /* ---------------- 2. 躯干（torso 关节 @ (0,0.52,0)；局部 y→世界 +0.52） ---------------- */
  var torso = grp(); torso.position.set(0, 0.52, 0); torso.name = 'torso'; g.add(torso);

  /* 臀部裤腰（腿根填充满档，下坠盖过腿根） */
  var hips = sphS(0.345, 18, 12, pantsM, 0, 0.085, 0); hips.scale.set(1.0, 0.7, 0.82); torso.add(hips);

  /* 衬衫躯干：Lathe 梨形剖面（世界 0.54→1.17，肚峰 y≈0.84） */
  var shirtPts = [
    new THREE.Vector2(0.001, 0.02), new THREE.Vector2(0.20, 0.04), new THREE.Vector2(0.30, 0.10),
    new THREE.Vector2(0.355, 0.20), new THREE.Vector2(0.375, 0.32), new THREE.Vector2(0.36, 0.44),
    new THREE.Vector2(0.30, 0.54),  new THREE.Vector2(0.27, 0.60),  new THREE.Vector2(0.24, 0.635),
    new THREE.Vector2(0.001, 0.65)
  ];
  var shirt = mesh(new THREE.LatheGeometry(shirtPts, 26), shirtM);
  shirt.position.y = 0; shirt.scale.z = 0.86; torso.add(shirt);

  /* 金马甲：略大的 Lathe 壳（世界 0.535→1.065）+ 织锦暗纹 */
  var vestPts = [
    new THREE.Vector2(0.001, 0.015), new THREE.Vector2(0.28, 0.03),  new THREE.Vector2(0.345, 0.08),
    new THREE.Vector2(0.372, 0.20),  new THREE.Vector2(0.388, 0.32), new THREE.Vector2(0.372, 0.42),
    new THREE.Vector2(0.335, 0.50),  new THREE.Vector2(0.298, 0.545)
  ];
  var vest = mesh(new THREE.LatheGeometry(vestPts, 26), vestM);
  vest.scale.z = 0.86; torso.add(vest);
  /* v2 马甲下摆收边环（参考图底缘翻边折线） */
  var hem = mesh(new THREE.TorusGeometry(0.300, 0.013, 8, 26), vestTrim);
  hem.position.set(0, 0.545, 0); hem.rotation.x = PI / 2; hem.scale.set(1, 0.86, 1); torso.add(hem);

  /* 胸口 V 领区 v2：白衬衫弧形衬片 + 领带（Lathe 楔片贴着马甲曲面 +0.010/+0.019，
   * 修复 v1 平板 bib/帔身沉入马甲壳内不可见的问题） */
  var shirtVPts = [
    new THREE.Vector2(0.3973, 0.30), new THREE.Vector2(0.3936, 0.36), new THREE.Vector2(0.384, 0.42),
    new THREE.Vector2(0.3609, 0.47), new THREE.Vector2(0.3347, 0.515), new THREE.Vector2(0.310, 0.545)
  ];
  var shirtV = mesh(new THREE.LatheGeometry(shirtVPts, 10, -0.18, 0.36), shirtM);
  shirtV.scale.z = 0.86; torso.add(shirtV);
  var tieVPts = [
    new THREE.Vector2(0.4104, 0.32), new THREE.Vector2(0.4036, 0.36), new THREE.Vector2(0.394, 0.42),
    new THREE.Vector2(0.3709, 0.47), new THREE.Vector2(0.3447, 0.515), new THREE.Vector2(0.320, 0.545)
  ];
  var tieV = mesh(new THREE.LatheGeometry(tieVPts, 8, -0.06, 0.12), tieM);
  tieV.scale.z = 0.86; torso.add(tieV);
  /* 马甲驳头（沿 V 两缘的深金窄条，收窄上移贴合 v2 V 区） */
  var lapL = box(0.036, 0.21, 0.016, vestTrim, -0.088, 0.462, 0.306);
  lapL.rotation.z = 0.40; lapL.rotation.x = -0.24; torso.add(lapL);
  var lapR = box(0.036, 0.21, 0.016, vestTrim, 0.088, 0.462, 0.306);
  lapR.rotation.z = -0.40; lapR.rotation.x = -0.24; torso.add(lapR);

  /* 领带：结 + 金领带针（帔身由 tieV 弧形楔片承担） */
  var knot = sph(0.032, tieM, 0, 0.562, 0.282); knot.scale.set(1, 0.85, 0.8); torso.add(knot);
  torso.add(sph(0.016, goldM, 0, 0.546, 0.30));

  /* 衬衫领口：环 + 领尖 */
  var collar = mesh(new THREE.TorusGeometry(0.115, 0.028, 8, 18), shirtHi);
  collar.position.set(0, 0.665, 0.008); collar.rotation.x = PI / 2 - 0.06; torso.add(collar);
  var cptL = box(0.06, 0.05, 0.018, shirtHi, -0.052, 0.63, 0.215);
  cptL.rotation.x = -0.4; cptL.rotation.z = 0.3; torso.add(cptL);
  var cptR = box(0.06, 0.05, 0.018, shirtHi, 0.052, 0.63, 0.215);
  cptR.rotation.x = -0.4; cptR.rotation.z = -0.3; torso.add(cptR);

  /* 马甲扣 ×3 + v2 扣环描边（下缘中线） */
  var btnY = [0.27, 0.18, 0.09], btnZ = [0.326, 0.318, 0.298], btnRx = [-0.10, -0.20, -0.30];
  for (var bi = 0; bi < 3; bi++){
    torso.add(sph(0.02, goldM, 0, btnY[bi], btnZ[bi]));
    var rim = mesh(new THREE.TorusGeometry(0.021, 0.005, 6, 14), vestTrim);
    rim.position.set(0, btnY[bi], btnZ[bi]); rim.rotation.x = btnRx[bi]; torso.add(rim);
  }
  /* v3 B10 马甲前门襟缝线（扣间 ×2，贴马甲曲面 +0.004；顶扣上方一段藏于领带尖后，撤除） */
  torso.add(box(0.010, 0.050, 0.008, vestTrim, 0, 0.225, 0.3265));
  torso.add(box(0.010, 0.050, 0.008, vestTrim, 0, 0.135, 0.312));

  /* 两个暗袋袋唇 + 胸袋巾（v2 双折角巾） */
  var pktL = box(0.10, 0.022, 0.01, vestTrim, -0.19, 0.125, 0.25);
  pktL.rotation.z = 0.26; pktL.rotation.y = 0.5; torso.add(pktL);
  var pktR = box(0.10, 0.022, 0.01, vestTrim, 0.19, 0.125, 0.25);
  pktR.rotation.z = -0.26; pktR.rotation.y = -0.5; torso.add(pktR);
  /* 胸袋巾 v2（双折角巾合拢成一方折叠丝巾，贴袋唇） */
  var sqShape = new THREE.Shape();
  sqShape.moveTo(-0.030, 0); sqShape.lineTo(0.030, 0); sqShape.lineTo(0.006, 0.048); sqShape.closePath();
  var psqA = mesh(new THREE.ExtrudeGeometry(sqShape, { depth: 0.012, bevelEnabled: true,
    bevelThickness: 0.003, bevelSize: 0.004, bevelSegments: 1 }), shirtHi);
  psqA.geometry.translate(0, 0, -0.006);
  psqA.position.set(0.128, 0.470, 0.268); psqA.rotation.x = -0.20; psqA.rotation.z = 0.10; torso.add(psqA);
  var psqB = mesh(new THREE.ExtrudeGeometry(sqShape, { depth: 0.012, bevelEnabled: true,
    bevelThickness: 0.003, bevelSize: 0.004, bevelSegments: 1 }), shirtHi);
  psqB.geometry.translate(0, 0, -0.006);
  psqB.position.set(0.150, 0.464, 0.262); psqB.rotation.x = -0.20; psqB.rotation.z = -0.20;
  psqB.scale.set(0.82, 0.78, 1); torso.add(psqB);
  torso.add(box(0.075, 0.012, 0.01, vestTrim, 0.140, 0.456, 0.262));

  /* 怀表链 v2：双垂弧 swag（外弧深垂 + 内弧浅垂交错，参考图 garland 读感）+ 链坠珠 */
  var chainGrp = grp(); chainGrp.position.set(0, 0, 0); torso.add(chainGrp);
  var chainCurveA = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, 0.155, 0.248), new THREE.Vector3(-0.12, 0.10, 0.30),
    new THREE.Vector3(0, 0.078, 0.315),     new THREE.Vector3(0.12, 0.10, 0.30),
    new THREE.Vector3(0.24, 0.155, 0.248)
  ]);
  chainGrp.add(mesh(new THREE.TubeGeometry(chainCurveA, 20, 0.008, 8, false), goldM));
  var chainCurveB = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.15, 0.27, 0.302), new THREE.Vector3(-0.08, 0.185, 0.320),
    new THREE.Vector3(0, 0.135, 0.328),    new THREE.Vector3(0.08, 0.185, 0.320),
    new THREE.Vector3(0.15, 0.27, 0.302)
  ]);
  chainGrp.add(mesh(new THREE.TubeGeometry(chainCurveB, 20, 0.0065, 8, false), goldM));
  chainGrp.add(sph(0.013, goldM, -0.24, 0.158, 0.244));
  chainGrp.add(sph(0.013, goldM, 0.24, 0.158, 0.244));
  chainGrp.add(sph(0.013, goldM, -0.15, 0.272, 0.302));
  chainGrp.add(sph(0.013, goldM, 0.15, 0.272, 0.302));
  chainGrp.add(sph(0.014, goldM, 0, 0.068, 0.318));   /* 链坠珠（外弧最低点） */
  /* v3 B9 表坠：左端珠下挂金圆坠（圆柱面朝前）+ 表冠小球（参考图链端接袋处的表体） */
  var fob = cyl(0.020, 0.020, 0.010, 16, goldM, -0.240, 0.128, 0.238);
  fob.rotation.x = PI / 2; chainGrp.add(fob);
  chainGrp.add(sph(0.006, goldM, -0.240, 0.152, 0.240));

  /* 背后调节带 v2：带身 + 金属方扣（框×4 + 针）+ 皮带环 + 带尾（背视图识别件） */
  torso.add(box(0.36, 0.05, 0.018, vestTrim, 0, 0.36, -0.328));
  torso.add(box(0.012, 0.064, 0.024, goldM, -0.033, 0.36, -0.338));
  torso.add(box(0.012, 0.064, 0.024, goldM, 0.033, 0.36, -0.338));
  torso.add(box(0.078, 0.012, 0.024, goldM, 0, 0.394, -0.338));
  torso.add(box(0.078, 0.012, 0.024, goldM, 0, 0.326, -0.338));
  torso.add(box(0.007, 0.052, 0.016, goldM, 0, 0.36, -0.344));      /* 扣针 */
  torso.add(box(0.086, 0.02, 0.026, vestTrim, 0, 0.30, -0.334));    /* 皮带环 keeper */
  torso.add(box(0.075, 0.03, 0.014, vestTrim, 0, 0.245, -0.330));   /* 带尾 */
  /* 后裤袋金扣 ×2（背视图识别件） */
  torso.add(box(0.10, 0.012, 0.008, vestTrim, -0.12, -0.03, -0.272));
  torso.add(box(0.10, 0.012, 0.008, vestTrim, 0.12, -0.03, -0.272));
  torso.add(sph(0.011, goldM, -0.12, -0.05, -0.272));
  torso.add(sph(0.011, goldM, 0.12, -0.05, -0.272));

  /* 脖颈 */
  var neck = cyl(0.105, 0.125, 0.12, 12, skinM, 0, 0.64, 0.005); torso.add(neck);

  /* ---------------- 3. 头（head 关节 @ (0,1.1,0)；颅心局部 (0,0.28) → 世界 1.38） ---------------- */
  var head = grp(); head.position.set(0, 1.1, 0); head.name = 'head'; g.add(head);

  var skull = sphS(0.295, 24, 18, skinM, 0, 0.28, 0); skull.scale.set(1.0, 0.96, 0.94); head.add(skull);
  /* 腮帮（梨形下半脸） */
  var chkL = sph(0.088, skinM, -0.185, 0.205, 0.155); chkL.scale.set(1, 0.9, 0.85); head.add(chkL);
  var chkR = sph(0.088, skinM, 0.185, 0.205, 0.155); chkR.scale.set(1, 0.9, 0.85); head.add(chkR);
  /* 下巴（圆厚，压住领口 → 双下巴观感）+ v2 下巴球 + v3 颏沟下移至唇下（原位被新嘴缝占用） */
  var jaw = sph(0.10, skinM, 0, 0.115, 0.115); jaw.scale.set(1.15, 0.75, 0.95); head.add(jaw);
  var chin = sph(0.052, skinM, 0, 0.085, 0.185); chin.scale.set(0.9, 0.7, 0.8); head.add(chin);
  var chinC = box(0.07, 0.012, 0.01, skinD, 0, 0.106, 0.236); chinC.rotation.x = 0.3; head.add(chinC);

  /* 耳朵 v3（前移外露：侧发缩小后耳廓从鬓后探出，参考图三视耳可见） */
  var earL = sph(0.048, skinM, -0.292, 0.29, 0.03); earL.scale.set(0.5, 1.0, 0.8); head.add(earL);
  var earR = sph(0.048, skinM, 0.292, 0.29, 0.03); earR.scale.set(0.5, 1.0, 0.8); head.add(earR);
  var earinL = sph(0.03, skinD, -0.306, 0.29, 0.042); earinL.scale.set(0.38, 0.66, 0.5); head.add(earinL);
  var earinR = sph(0.03, skinD, 0.306, 0.29, 0.042); earinR.scale.set(0.38, 0.66, 0.5); head.add(earinR);

  /* 大圆鼻 + 鼻梁（v2 梁更宽矮，与额融合）+ 鼻翼/鼻孔 + v3 鼻头高光 */
  head.add(sph(0.066, skinM, 0, 0.252, 0.283));
  var bridge = sph(0.038, skinM, 0, 0.316, 0.256); bridge.scale.set(0.9, 1.15, 0.75); head.add(bridge);
  var wingL = sph(0.024, skinM, -0.052, 0.222, 0.288); wingL.scale.set(0.95, 0.7, 0.8); head.add(wingL);
  var wingR = sph(0.024, skinM, 0.052, 0.222, 0.288); wingR.scale.set(0.95, 0.7, 0.8); head.add(wingR);
  head.add(sph(0.012, skinD, -0.032, 0.210, 0.322));
  head.add(sph(0.012, skinD, 0.032, 0.210, 0.322));
  var noseHi = sph(0.008, hiM, -0.021, 0.274, 0.341); noseHi.scale.set(1.2, 0.8, 0.5); head.add(noseHi);

  /* 眼 v3（B1：放大 + 重上睑压虹膜 + 上睫深线 + 双眼皮褶 + 下睑/卧蚕 + 双高光 → 半睁自信眼神）
   * 层序（z 由后到前）：眼白 0.254 < 睑/褶 0.262 < 虹膜 0.265 < 睫线 0.270 < 瞳 0.276 < 高光 0.288 */
  var s;
  for (s = -1; s <= 1; s += 2){
    var white = sph(0.040, shirtHi, 0.084 * s, 0.314, 0.254);
    white.scale.set(1.0, 0.70, 0.40); head.add(white);
    var iris = sph(0.029, irisM, 0.086 * s, 0.311, 0.265);
    iris.scale.set(1, 1, 0.40); head.add(iris);
    head.add(sph(0.014, pupilM, 0.086 * s, 0.311, 0.276));
    head.add(sph(0.007, hiM, 0.074 * s, 0.322, 0.288));           /* 主高光（左上） */
    head.add(sph(0.004, hiM, 0.096 * s, 0.302, 0.288));           /* 副高光（右下） */
    var lidU = sph(0.041, skinM, 0.084 * s, 0.338, 0.262);        /* 重上睑（压住虹膜上缘） */
    lidU.scale.set(1.02, 0.40, 0.55); head.add(lidU);
    var lash = sph(0.040, hairM, 0.084 * s, 0.323, 0.270);        /* 上睫线（睑缘深色，盖住瞳顶） */
    lash.scale.set(1.0, 0.10, 0.45); head.add(lash);
    var fold = sph(0.038, skinD, 0.084 * s, 0.355, 0.262);        /* 双眼皮褶线 */
    fold.scale.set(0.95, 0.07, 0.40); head.add(fold);
    var lidL = sph(0.036, skinM, 0.084 * s, 0.293, 0.262);        /* 下睑 */
    lidL.scale.set(1.0, 0.28, 0.45); head.add(lidL);
    var bag = sph(0.026, skinD, 0.088 * s, 0.276, 0.262);         /* 卧蚕眼袋 */
    bag.scale.set(1.0, 0.30, 0.40); head.add(bag);
    /* v3 B2 浓眉 4 段拉长椭球沿弧切向排布（相邻重叠 ≥40%，读作一条连续粗眉：
     * 内粗低 → 中拱 → 外细收上挑；左眉 +0.007 微挑 = smirk） */
    var browArc = [
      [0.052, 0.370, 0.252, 0.032, 2.0, 0.78, 0.70,  0.30],
      [0.104, 0.386, 0.234, 0.034, 2.0, 0.80, 0.70,  0.12],
      [0.150, 0.390, 0.208, 0.030, 2.0, 0.74, 0.70, -0.06],
      [0.190, 0.382, 0.181, 0.022, 2.0, 0.62, 0.70, -0.30]
    ];
    var raise = (s > 0) ? 0.007 : 0;
    for (var bi2 = 0; bi2 < browArc.length; bi2++){
      var B = browArc[bi2];
      var bt = sph(B[3], hairM, B[0] * s, B[1] + raise, B[2]);
      bt.scale.set(B[4], B[5], B[6]); bt.rotation.z = B[7] * s; bt.rotation.y = 0.35 * s; head.add(bt);
    }
    /* v2 腮红（中颊，低饱和） */
    var bl = sph(0.032, blushM, 0.19 * s, 0.172, 0.222);
    bl.scale.set(1.1, 0.65, 0.4); head.add(bl);
  }

  /* 上翘八字胡 v3：油亮材质（B14）；中瓣 + 每侧 4 瓣渐小上卷；v3 瓣间重叠加大（3/4 视角不再断裂） */
  var mo = sph(0.048, moM, 0, 0.19, 0.26); mo.scale.set(1.5, 0.6, 0.75); head.add(mo);
  var moLobes = [
    [0.075, 0.186, 0.256, 0.044, 1.25, 0.6, 0.75, 0],
    [0.135, 0.200, 0.240, 0.038, 1.2, 0.6, 0.75, -0.3],
    [0.176, 0.218, 0.222, 0.036, 1.15, 0.6, 0.70, -0.6],
    [0.206, 0.246, 0.196, 0.030, 1.10, 0.66, 0.65, -0.95]
  ];
  for (s = -1; s <= 1; s += 2){
    for (var mi = 0; mi < moLobes.length; mi++){
      var L = moLobes[mi];
      var lb = sph(L[3], moM, L[0] * s, L[1], L[2]);
      lb.scale.set(L[4], L[5], L[6]); lb.rotation.z = L[7] * s;
      head.add(lb);
    }
  }
  /* v3 B3 胡下嘴：不对称微笑细缝（右角上翘 smirk，rotation.z 0.10）+ 肉感下唇（薄贴，侧视不外凸） */
  var mouth = sph(0.036, mouthM, 0.004, 0.146, 0.246);
  mouth.scale.set(1.6, 0.15, 0.25); mouth.rotation.z = 0.10; head.add(mouth);
  var lip = sph(0.027, lipM, 0.002, 0.128, 0.244);
  lip.scale.set(1.5, 0.34, 0.38); lip.rotation.z = 0.06; head.add(lip);

  /* 后梳蓬帕杜发型：高位半球盖 + 前倾刘海压沿 + M 额发 + 顶区后掠瓣 + 侧扫 + 脑后波纹
   * v2：脑后追加 2+3 分层发卷（背视 finger-wave 读感，参考图识别件） */
  var cap = mesh(new THREE.SphereGeometry(0.305, 24, 14, 0, PI * 2, 0, PI * 0.35), hairM);
  cap.position.set(0, 0.28, -0.005); cap.scale.set(1.07, 1.02, 1.07); head.add(cap);
  var quiff = sph(0.115, hairM, 0, 0.462, 0.155); quiff.scale.set(1.45, 0.46, 0.85); head.add(quiff);
  /* v3：M 额发/额峰上提 0.006-0.011，让出眉上额头（参考图眉与发际间有肤色带） */
  var peak = sph(0.03, hairM, 0, 0.424, 0.244); peak.scale.set(1.5, 0.75, 0.7); head.add(peak);
  head.add(sph(0.032, hairM, -0.08, 0.444, 0.240));
  head.add(sph(0.032, hairM, 0.08, 0.444, 0.240));
  var pom = [
    [0, 0.465, 0.05, 0.160, 1.5, 0.62, 1.05],
    [0, 0.49, -0.08, 0.165, 1.42, 0.68, 1.1],
    [0, 0.455, -0.20, 0.160, 1.35, 0.68, 1.05],
    [0, 0.44, 0.16, 0.140, 1.3, 0.52, 0.8]
  ];
  for (var pi2 = 0; pi2 < pom.length; pi2++){
    var P = pom[pi2];
    var lobe = sph(P[3], hairM, P[0], P[1], P[2]);
    lobe.scale.set(P[4], P[5], P[6]); head.add(lobe);
  }
  /* v3 B5 发胶高光带 ×3（薄扁椭球贴发浪顶脊，露出 0.003-0.006 → 亮带；立绘顶部白色反光） */
  var shine1 = sph(0.06, hairSh, 0, 0.593, -0.02); shine1.scale.set(2.2, 0.15, 0.9); head.add(shine1);
  var shine2 = sph(0.05, hairSh, 0, 0.512, 0.16); shine2.scale.set(2.0, 0.14, 0.8); head.add(shine2);
  var shine3 = sph(0.045, hairSh, 0, 0.554, -0.26); shine3.scale.set(1.9, 0.14, 0.8); head.add(shine3);
  /* v3 B6 侧发块缩小后移（v2 (0.6,1.35,1.8)@-0.26 呈耳罩状遮耳 → 贴颅后掠，耳廓外露） */
  var sideL = sph(0.115, hairM, -0.255, 0.365, -0.085); sideL.scale.set(0.5, 1.2, 1.55); head.add(sideL);
  var sideR = sph(0.115, hairM, 0.255, 0.365, -0.085); sideR.scale.set(0.5, 1.2, 1.55); head.add(sideR);
  /* v2 颞后补块：填平侧发/背发/发盖之间的露肤缝 */
  var tbL = sph(0.09, hairM, -0.19, 0.335, -0.19); tbL.scale.set(0.9, 1.2, 1.1); head.add(tbL);
  var tbR = sph(0.09, hairM, 0.19, 0.335, -0.19); tbR.scale.set(0.9, 1.2, 1.1); head.add(tbR);
  /* 太阳穴补块：圆化半球盖直边，衔接侧发 */
  var tmpL = sph(0.048, hairM, -0.225, 0.408, 0.175); tmpL.scale.set(0.7, 0.85, 0.75); head.add(tmpL);
  var tmpR = sph(0.048, hairM, 0.225, 0.408, 0.175); tmpR.scale.set(0.7, 0.85, 0.75); head.add(tmpR);
  /* 鬓角 v3：上提至颞侧耳前（v2 位于颊中读作深色斑块），收小贴脸，耳廓在其后外露 */
  var sbnL = sph(0.05, hairM, -0.268, 0.262, 0.112); sbnL.scale.set(0.36, 0.85, 0.60); head.add(sbnL);
  var sbnR = sph(0.05, hairM, 0.268, 0.262, 0.112); sbnR.scale.set(0.36, 0.85, 0.60); head.add(sbnR);
  var back1 = sph(0.15, hairM, 0, 0.365, -0.26); back1.scale.set(1.7, 0.85, 0.9); head.add(back1);
  var back2 = sph(0.135, hairM, 0, 0.235, -0.245); back2.scale.set(1.55, 0.7, 0.85); head.add(back2);
  var nape = sph(0.105, hairM, 0, 0.12, -0.185); nape.scale.set(1.3, 0.78, 0.75); head.add(nape);
  /* v3 B5 后脑中缝暗线（背视识别件：后梳发的中分沟） */
  head.add(box(0.008, 0.09, 0.016, hairD, 0, 0.452, -0.365));
  /* v2 脑后发卷（上排 3 + 下排 3，S 形分层） */
  var rolls = [
    [0, 0.372, -0.362, 0.072, 1.5, 0.55, 0.62, 0],
    [-0.148, 0.352, -0.330, 0.070, 1.15, 0.55, 0.6, -0.15],
    [0.148, 0.352, -0.330, 0.070, 1.15, 0.55, 0.6, 0.15],
    [-0.08, 0.262, -0.330, 0.068, 1.2, 0.55, 0.6, 0.12],
    [0.08, 0.262, -0.330, 0.068, 1.2, 0.55, 0.6, -0.12],
    [0, 0.243, -0.345, 0.070, 1.3, 0.55, 0.6, 0]
  ];
  for (var ri = 0; ri < rolls.length; ri++){
    var R = rolls[ri];
    var roll = sph(R[3], hairM, R[0], R[1], R[2]);
    roll.scale.set(R[4], R[5], R[6]); roll.rotation.z = R[7];
    head.add(roll);
  }

  /* ---------------- 4. 手臂 ---------------- */
  /* 右臂（x=-0.39）：持杖前伸拄地 —— 姿态烘进网格（view3d 会覆写关节旋转）
   * v2：肩泡下褶环 + 肘部堆褶 torus ×2 + 腕口布褶 + 外翻双层袖头 + 金袖扣 + 拇指扣握 */
  var armR = grp(); armR.position.set(-0.39, 1.0, 0); armR.name = 'armR'; g.add(armR);
  var shR = sph(0.076, shirtM, 0.01, -0.05, 0); armR.add(shR);
  var ruR = cyl(0.074, 0.058, 0.19, 12, shirtM, 0.012, -0.135, 0.006); ruR.rotation.x = 0.10; armR.add(ruR);
  var foldShR = sph(0.062, shirtM, 0.011, -0.085, 0.003); foldShR.scale.set(1, 0.55, 0.9); armR.add(foldShR);
  var elR = sph(0.054, shirtM, 0, -0.215, 0.022); armR.add(elR);
  var efR1 = mesh(new THREE.TorusGeometry(0.052, 0.010, 8, 14), shirtM);
  efR1.position.set(0, -0.205, 0.028); efR1.rotation.x = PI / 2 + 0.18; armR.add(efR1);
  var efR2 = mesh(new THREE.TorusGeometry(0.055, 0.009, 8, 14), shirtM);
  efR2.position.set(0, -0.185, 0.033); efR2.rotation.x = PI / 2 + 0.18; armR.add(efR2);
  var rfR = cyl(0.05, 0.042, 0.13, 12, shirtM, 0.002, -0.27, 0.042); rfR.rotation.x = 0.18; armR.add(rfR);
  var bunchR = sph(0.05, shirtM, 0.004, -0.285, 0.052); bunchR.scale.set(1.05, 0.6, 1.0); armR.add(bunchR);
  /* 外翻袖头：band（袖口环）+ fold（翻折层，略宽）+ 金袖扣（球+环） */
  var bandR = cyl(0.049, 0.046, 0.032, 12, shirtHi, 0.006, -0.318, 0.058); bandR.rotation.x = 0.18; armR.add(bandR);
  var foldcR = cyl(0.052, 0.048, 0.022, 12, shirtHi, 0.007, -0.342, 0.063); foldcR.rotation.x = 0.18; armR.add(foldcR);
  armR.add(sph(0.011, goldM, -0.044, -0.342, 0.058));
  var rimcR = mesh(new THREE.TorusGeometry(0.013, 0.004, 6, 12), vestTrim);
  rimcR.position.set(-0.044, -0.342, 0.058); rimcR.rotation.y = PI / 2; armR.add(rimcR);
  var handR = sph(0.05, skinM, 0.008, -0.345, 0.078); handR.scale.set(0.72, 0.98, 0.72); armR.add(handR);
  /* v3 B7 右手握杖：4 指横向指节柱绕杖前缘（自上而下渐短）+ 拇指压顶扣握 */
  var fyR = [-0.318, -0.336, -0.354, -0.372], fwR = [0.052, 0.054, 0.050, 0.044];
  for (var fi = 0; fi < 4; fi++){
    var fR = cyl(0.0115, 0.0115, fwR[fi], 12, skinM, 0.008, fyR[fi], 0.116);
    fR.rotation.z = PI / 2; armR.add(fR);
  }
  var thumbR = cyl(0.013, 0.016, 0.048, 12, skinM, -0.010, -0.312, 0.104);
  thumbR.rotation.x = PI / 2; thumbR.rotation.y = 0.3; armR.add(thumbR);

  /* 手杖 v2：蛋形金柄头 + 顶针 + 喇叭颈 + 双箍环 + 缠线握柄（3 道金丝）+ 接箍 + 深色杖身 + 双层杖尖
   * （杖尖落地 y≈0.01，前伸 z≈0.14） */
  var cane = grp(); cane.position.set(0.008, -0.35, 0.08); cane.rotation.x = 0.10; armR.add(cane);
  var knob = sph(0.050, goldM, 0, 0.112, 0); knob.scale.set(0.94, 1.04, 0.94); cane.add(knob);
  cane.add(sph(0.013, goldM, 0, 0.168, 0));                                   /* 顶针 finial */
  cane.add(cyl(0.016, 0.026, 0.020, 12, goldM, 0, 0.077, 0));                 /* 喇叭颈 */
  var ring1 = mesh(new THREE.TorusGeometry(0.027, 0.007, 8, 14), goldM);
  ring1.position.y = 0.060; ring1.rotation.x = PI / 2; cane.add(ring1);
  var ring2 = mesh(new THREE.TorusGeometry(0.024, 0.005, 8, 14), goldM);
  ring2.position.y = 0.045; ring2.rotation.x = PI / 2; cane.add(ring2);
  cane.add(cyl(0.020, 0.021, 0.075, 12, caneM, 0, 0.002, 0));                 /* 缠线握柄基底 */
  cane.add(cyl(0.019, 0.019, 0.016, 12, goldM, 0, -0.042, 0));                /* 柄-身接箍 */
  var wy = [0.020, -0.002, -0.024];
  for (var wi = 0; wi < 3; wi++){
    var wrap = mesh(new THREE.TorusGeometry(0.0205, 0.003, 6, 12), goldM);
    wrap.position.y = wy[wi]; wrap.rotation.x = PI / 2; cane.add(wrap);
  }
  cane.add(cyl(0.018, 0.013, 0.56, 12, shoeM, 0, -0.315, 0));                 /* 杖身 */
  cane.add(cyl(0.0155, 0.0135, 0.045, 12, goldM, 0, -0.612, 0));              /* 杖尖金箍 */
  cane.add(sph(0.0145, goldM, 0, -0.638, 0));                                 /* 杖尖帽 */
  /* v3 B8 柄下金流苏（挂箍环外侧，远离握手一侧可见）：吊绳 + 结球 + 3 丝穗；待机随呼吸微摆 */
  var tassel = grp(); tassel.position.set(-0.027, 0.058, 0); cane.add(tassel);
  var tCord = cyl(0.003, 0.003, 0.0525, 12, goldM, -0.017, -0.020, 0); tCord.rotation.z = -0.70; tassel.add(tCord);
  tassel.add(sph(0.011, tasselM, -0.034, -0.042, 0));                          /* 结球（与袖口外缘相切） */
  var tStr = [[-0.040, -0.072, 0.000, 0.16], [-0.030, -0.073, 0.007, -0.12], [-0.032, -0.071, -0.008, 0.02]];
  for (var ti = 0; ti < 3; ti++){
    var st = cyl(0.0035, 0.0028, 0.042, 12, tasselM, tStr[ti][0], tStr[ti][1], tStr[ti][2]);
    st.rotation.z = tStr[ti][3]; tassel.add(st);
  }

  /* 左臂（x=+0.39）：叉腰 —— 肩→肘外张，肘→腕收向髋
   * v2：肩泡下褶 + 肘部堆褶 puff ×2 + 腕口布褶 + 外翻双层袖头 + 金袖扣 */
  var armL = grp(); armL.position.set(0.39, 1.0, 0); armL.name = 'armL'; g.add(armL);
  var shL = sph(0.076, shirtM, -0.01, -0.05, 0); armL.add(shL);
  var ruL = cyl(0.074, 0.056, 0.19, 12, shirtM, -0.012, -0.125, -0.002); ruL.rotation.z = -0.56; armL.add(ruL);
  var foldShL = sph(0.062, shirtM, -0.02, -0.085, -0.002); foldShL.scale.set(1, 0.55, 0.9); armL.add(foldShL);
  var elL = sph(0.054, shirtM, 0.1, -0.20, -0.005); armL.add(elL);
  var rfL = cyl(0.05, 0.04, 0.15, 12, shirtM, 0.046, -0.252, 0.01);
  rfL.rotation.z = 0.66; rfL.rotation.x = 0.12; armL.add(rfL);
  var bunchL = sph(0.042, shirtM, 0.024, -0.286, 0.024); bunchL.scale.set(1.0, 0.6, 0.9); armL.add(bunchL);
  var bandL = cyl(0.049, 0.046, 0.032, 12, shirtHi, 0.005, -0.302, 0.03);
  bandL.rotation.z = 0.66; bandL.rotation.x = 0.12; armL.add(bandL);
  var foldcL = cyl(0.052, 0.048, 0.022, 12, shirtHi, 0.001, -0.322, 0.036);
  foldcL.rotation.z = 0.66; foldcL.rotation.x = 0.12; armL.add(foldcL);
  armL.add(sph(0.011, goldM, 0.052, -0.316, 0.028));                          /* 外侧金袖扣 */
  var cuffGrpL = grp(); cuffGrpL.position.set(0.001, -0.316, 0.034);
  cuffGrpL.rotation.z = 0.66; cuffGrpL.rotation.x = 0.12; armL.add(cuffGrpL);
  var rimcL = mesh(new THREE.TorusGeometry(0.013, 0.004, 6, 12), vestTrim);
  rimcL.position.set(0.052, 0, -0.006); rimcL.rotation.x = PI / 2; cuffGrpL.add(rimcL);
  var handL = sph(0.05, skinM, -0.006, -0.318, 0.048);
  handL.scale.set(0.70, 1.0, 0.88); armL.add(handL);
  /* v3 B7 左手叉腰：掌面贴髋，4 指纵向叠排前伸并向体侧微弯（rotation.y -0.35 = 指尖搭肚侧），
   * 拇指后扣（指向 -z）；指柱前端出掌面 0.009-0.012 可辨 */
  var fyL = [-0.296, -0.312, -0.328, -0.344], flL = [0.044, 0.048, 0.046, 0.040];
  for (var fj = 0; fj < 4; fj++){
    var fL = cyl(0.0105, 0.0095, flL[fj], 12, skinM, -0.012, fyL[fj], 0.082);
    fL.rotation.x = PI / 2; fL.rotation.y = -0.35; armL.add(fL);
  }
  var thumbL = cyl(0.011, 0.013, 0.040, 12, skinM, -0.010, -0.288, 0.006);
  thumbL.rotation.x = PI / 2; thumbL.rotation.y = 0.25; armL.add(thumbL);

  /* ---------------- 5. 腿（镜像：legL s=+1，legR s=-1） ---------------- */
  function buildLeg(s){
    var pv = grp(); pv.position.set(0.17 * s, 0.5, 0); pv.name = s > 0 ? 'legL' : 'legR'; g.add(pv);
    var th = cyl(0.128, 0.104, 0.26, 12, pantsM, 0.02 * s, -0.155, 0);
    th.rotation.z = 0.10 * s; pv.add(th);
    var ca = cyl(0.10, 0.075, 0.22, 12, pantsM, 0.035 * s, -0.395, 0.005);
    ca.rotation.z = 0.06 * s; pv.add(ca);
    var cuff = cyl(0.08, 0.08, 0.06, 12, pantsM, 0.042 * s, -0.465, 0.005); pv.add(cuff);
    /* v2 裤脚堆褶环（裤线压鞋口的 break 读感） */
    var crease = mesh(new THREE.TorusGeometry(0.081, 0.007, 6, 14), pantsM);
    crease.position.set(0.042 * s, -0.440, 0.005); crease.rotation.x = PI / 2; pv.add(crease);
    /* v3 B12 膝部折痕环（大腿/小腿接缝处布料堆叠）+ 前裤线（大腿段/小腿段各一，随锥度前倾贴面） */
    var knee = mesh(new THREE.TorusGeometry(0.104, 0.008, 8, 16), pantsM);
    knee.position.set(0.030 * s, -0.285, 0.003); knee.rotation.x = PI / 2; pv.add(knee);
    var crTh = box(0.007, 0.20, 0.006, creaseM, 0.020 * s, -0.155, 0.118);
    crTh.rotation.x = 0.092; crTh.rotation.z = 0.10 * s; pv.add(crTh);
    var crCa = box(0.007, 0.17, 0.006, creaseM, 0.035 * s, -0.395, 0.094);
    crCa.rotation.x = 0.113; crCa.rotation.z = 0.06 * s; pv.add(crCa);
    /* 鞋 v2（脚尖外八 0.14rad）：鞋楦椭球 + 专利皮包头 + 后跟弧壳 + 薄底板 + 低跟块
     * + 沿条线 + 金色侧鞋扣；鞋底正好 -0.5 → 世界 0 */
    var shoeG = grp(); shoeG.position.set(0.04 * s, 0, 0.02); shoeG.rotation.y = 0.14 * s; pv.add(shoeG);
    shoeG.add(box(0.165, 0.014, 0.265, soleM, 0.005 * s, -0.493, 0.030));           /* 底板（贴地） */
    var lastM = sph(0.085, shoeM, 0.005 * s, -0.438, 0.015);
    lastM.scale.set(0.95, 0.62, 1.45); shoeG.add(lastM);                            /* 鞋楦 */
    var toe = sph(0.056, shoeHi, 0.005 * s, -0.455, 0.105);
    toe.scale.set(1.0, 0.60, 1.0); shoeG.add(toe);                                  /* 包头 */
    shoeG.add(box(0.125, 0.06, 0.085, shoeM, 0.005 * s, -0.442, -0.070));           /* 后跟弧壳 */
    shoeG.add(box(0.075, 0.030, 0.055, soleM, 0.005 * s, -0.485, -0.075));          /* 低跟块 */
    shoeG.add(box(0.170, 0.010, 0.270, soleM, 0.005 * s, -0.479, 0.030));           /* 沿条线 */
    var buckle = mesh(new THREE.TorusGeometry(0.017, 0.0045, 8, 12), goldM);
    buckle.position.set(0.079 * s, -0.440, 0.040); buckle.rotation.y = PI / 2; shoeG.add(buckle);
    /* v3 B13 鞋面缝线环：包头 vamp 缝（贴鞋楦 z=0.052 截面），椭圆截面与楦体同比（scale.y 0.66），
     * 仅上半弧出面 ≈0.005 → 深色细线（后跟 counter 环因暗色叠暗色不可辨，为全局 mesh 预算撤除） */
    var vamp = mesh(new THREE.TorusGeometry(0.076, 0.005, 8, 20), soleM);
    vamp.position.set(0.005 * s, -0.438, 0.052); vamp.scale.set(1, 0.66, 1); shoeG.add(vamp);
    return pv;
  }
  var legL = buildLeg(1), legR = buildLeg(-1);

  /* ---------------- 6. 装配契约 + 待机动画 ---------------- */
  g.userData.parts = { head: head, torso: torso, armL: armL, armR: armR, legL: legL, legR: legR };

  /* 待机：肚腩呼吸（马甲/衬衫 xz 缩放）+ 重心微晃 + 手杖随呼吸轻点
   * + v2 表链微摆 + 金件光泽呼吸。
   * 只用 view3d.animToken 不覆写的通道（torso.rotation、网格 scale/rotation、cane.rotation）。 */
  var breath = 0;
  g.userData.anim = [function (t, dt){
    breath = sin(t * 1.7) * 0.014;
    shirt.scale.x = 1 + breath * 0.55; shirt.scale.z = 0.86 * (1 + breath);
    vest.scale.x = 1 + breath * 0.55; vest.scale.z = 0.86 * (1 + breath);
    torso.rotation.z = sin(t * 0.8) * 0.02;
    torso.rotation.x = sin(t * 1.7) * 0.008;
    cane.rotation.x = 0.10 + sin(t * 1.7 + 0.6) * 0.025;
    tassel.rotation.z = sin(t * 2.1 + 0.4) * 0.07;              /* v3 流苏随杖微荡（≤0.3rad） */
    tassel.rotation.x = sin(t * 1.7 + 1.3) * 0.05;
    chainGrp.rotation.x = sin(t * 1.7 + 0.9) * 0.03;      /* 表链贴胸微荡 */
    goldM.emissiveIntensity = 0.18 + sin(t * 1.1) * 0.12; /* 金件光泽呼吸（≤0.25） */
    return breath;
  }];

  return g;
};

})();
