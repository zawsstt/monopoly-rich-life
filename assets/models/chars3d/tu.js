/* =====================================================================================
 * 大富翁 · 富贵人生 —— 精细角色：土老财 tu（img2threejs 管线产出 · v2 精修迭代）
 * -------------------------------------------------------------------------------------
 * 参考图：refs/char_tu.png（三视图转台：正/侧/背）。视觉唯一基准。
 * 形象：笑呵呵的乡下地主 —— 矮胖梨形身材 + 宽檐草帽（512px 编织纹/波浪檐缘/密集檐须/
 *       棕帽箍+箍底缝线/帽顶集顶）+ 雪白浓眉(4 段球簇拱) + 大圆黑褐眼(双高光) +
 *       大圆鼻 + 红晕腮 + 下垂八字胡(主体+阴影层+外侧垂尖) +
 *       全罩式白胡须(垂胸/中层须束 5 束/阴影须纹 4 沟/底缘分尖) + 帽檐两侧/脑后白发 +
 *       米白亚麻衬衫(双环卷袖翻边+翻折鼓包) + 绿背带裤(大肚/胸兜贴袋明线+袋口缝线+
 *       铆钉/前带铜扣底座+穹面/肩桥/背后 X 交叉带/后贴袋四边明线+角铆钉) +
 *       浅绿双层卷裤脚 + 圆头棕布鞋(鞋头圆钝/沿条/鞋面缝线)。
 *       ※ 设定文案提示瓜皮帽/烟斗/算盘，参考图实测为宽檐草帽、双手空 —— 以图为准。
 *
 * v2 → v3 深度精修记录（用户评分 80 = 全项目标杆；本轮只加细节、零减法；对齐 full3_tu.png 立绘 + 转台）：
 *   H1 大笑的嘴：v2 无嘴（须全罩）→ 立绘为张口爽朗大笑：胡唇檐 + 暗红口腔 + 5 颗上牙（弧排）+
 *      红舌 + 下唇 + 嘴角颊垫 ×2 + 法令笑纹 ×2（全部叠在须面之前，须体几何不变）
 *   H2 竖大拇指（右手 armR）：v2 双手空垂 → 立绘右手握拳竖拇指举至胸前：前臂从卷袖口折起
 *      (肘枢轴 rot.x 0.62 / 内收 0.22)，握拳 + 四指分节卷曲 + 指关节 ×4 + 拇指两节 + 指甲
 *   H3 左手手指：手掌球 + 含混拇指 → 四指分节卷曲 + 拇指两节（松握垂于髋侧）
 *   H4 帽檐底暗面：立绘/转台檐底为深棕阴影 → 新增贴檐底的暗草色 Lathe 内衬（随波浪檐缘位移）
 *   H5 帽箍：单色箍 → 加箍顶缝线环 + 箍中双色条纹
 *   H6 编织纹：512px 席纹加斜向交叉纤维 + 束间深缝（对比略提升，色相不变）
 *   H7 面部立体：眼袋 ×2 + 鱼尾笑纹 ×4 + 颧骨提亮凸 ×2（贴颅面 0.005~0.012 浮出）
 *   H8 白胡须胸前提亮：前层亮色须束 ×3 + 侧缕 ×2（分缕层次）
 *   H9 背带五金：铜扣上方加滑扣方框 ×2；裤身后中缝线
 *   H10 布鞋：圆钝鞋跟包 ×2 + 鞋口滚边环 ×2 + 鞋头第二道缝弧 ×2
 *   H11 材质：新增口腔/舌/牙/唇/须亮/檐底暗草/指甲 7 个分区材质
 *   H12 动画：原 1 条待机函数语义不变，追加嘴部大笑微颤 + 拇指微动（仅子网格通道）
 *   预算：177 → ≤260（实测见 smoke）；六关节契约、身高、贴地、朝向不变
 *
 * v1 → v2 精修记录（对照 REFINE_SPEC.md，差距清单逐条清偿）：
 *   G1 檐缘须边过稀（6 短锥）→ 18 根长短渐变锥刺 + 檐缘三波波浪起伏（顶点位移）
 *   G2 编织纹精度不足（128px 平铺）→ 512px 席纹（草束+绑定缝线+纤维丝）+ 帽顶集顶盘
 *   G3 八字胡/垂胸须分层不足 → 胡主体+中层 5 须束+4 阴影须纹+底缘 3 尖+2 侧尖；
 *      八字胡加阴影底瓣与外侧垂尖
 *   G4 浓眉细弱（box+小球）→ 每侧 4 球簇拱形粗眉，外端上扬没入帽檐
 *   G5 背带裤五金不全 → 铜扣改 底座+穹面 双件；前后贴袋角铆钉 ×6；胸兜袋口缝线；
 *      后贴袋四边明线；前带明线
 *   G6 卷袖翻边太简单 → 双环翻边（衬衫色差）+ 2 翻折鼓包
 *   G7 侧发/脑后白发太弱 → 每侧 4 球簇 + 脑后 3 层
 *   G8 布鞋太方 → 圆钝鞋头（球拉伸）+ 沿条 + 鞋面缝线
 *   G9 材质分区 → 全体粒度更细：草编/丹宁/亚麻 3 张程序纹理（≤512px）+
 *      roughness 分区（皮肤0.6/布0.85/黄铜0.35/鞋0.55/铆钉0.45）
 *
 * 管线阶段（img2threejs: blockout→structure→form→material→lighting→interaction→optimization）
 *   blockout  : 帽椭圆/颅球/蛋形躯干/短腿五段剪影，总宽高比 ≈0.60（spec 实测）—— 保持
 *   structure : 六关节装配（下方契约），所有 -l/-r 对经单一 s=±1 代码路径镜像（仅取反 x）
 *   form      : v1 转台复检通过形体保留；v2 增量全部贴参考图出处（见 G1-G9）
 *   material  : 全 MeshStandardMaterial + convertSRGBToLinear；程序化 Canvas ≤512px ×3
 *   lighting  : roughness/metalness 分区加密（新增 铆钉/铜扣底座/帽箍缝线 分区）
 *   interaction: userData.anim 只用 view3d.animToken 不覆写的通道（torso.rotation/网格
 *               scale/胡须+帽檐子组微动）；六关节 rotation/position 留给 view3d
 *   optimization: v2 ~177 mesh → v3 ~231 mesh（≤260 预算；增量全部为可见细节）≪ 600；球段 ≥16×12、柱段 ≥12
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
  /* 程序化 Canvas 纹理（v2 放宽到 512px，无外部资源） */
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

  /* ---------------- 1. 材质（色值取自参考图分区取样；v2 分区加密） ---------------- */
  var skinM  = std('#f2be9e', { rough: 0.60 });   /* 红润皮肤 */
  var skinD  = std('#eaa183', { rough: 0.66 });   /* 皮肤暗部/耳窝/鼻孔 */
  var noseM  = std('#edad8d', { rough: 0.58 });   /* 大圆鼻（略粉） */
  var blushM = std('#f09e82', { rough: 0.80 });   /* 腮红 */
  var beardM = std('#f4efe2', { rough: 0.85 });   /* 胡须/眉/白发 主体 */
  var beardS = std('#ddd5c0', { rough: 0.88 });   /* 胡须阴影/须纹 */
  var greenM = std('#7ba35b', { rough: 0.86 });   /* 背带裤绿（+丹宁纹） */
  var greenD = std('#5d8444', { rough: 0.88 });   /* 裤缝/腰线暗绿 */
  var cuffM  = std('#93b06b', { rough: 0.84 });   /* 卷脚口/明线浅绿 */
  var brassM = std('#c99544', { rough: 0.35, metal: 0.8, envInt: 1.15 }); /* 铜扣穹面 */
  var brassD = std('#a87a2e', { rough: 0.45, metal: 0.85, envInt: 1.0 }); /* 铜扣底座/铆钉 */
  var shoeM  = std('#8a5a36', { rough: 0.55 });   /* 棕鞋 */
  var shoeDk = std('#6e4526', { rough: 0.62 });   /* 鞋舌/鞋领/缝线 */
  var soleM  = std('#4e3826', { rough: 0.90 });   /* 深色鞋底/沿条 */
  var irisM  = std('#4a2b18', { rough: 0.40 });   /* 虹膜深褐 */
  var pupilM = std('#1a0f08', { rough: 0.30 });   /* 瞳孔 */
  var dotM   = std('#ffffff', { rough: 0.35 });   /* 眼白/高光 */
  /* v3 新增分区材质（H11） */
  var mouthM = std('#4a1612', { rough: 0.72 });   /* 口腔暗红褐（立绘取样 #4c150d） */
  var tongueM = std('#cc5e48', { rough: 0.52 });  /* 红舌（立绘 #cf6a52） */
  var toothM = std('#f7f2e6', { rough: 0.32 });   /* 上牙 */
  var lipM   = std('#e29a7e', { rough: 0.62 });   /* 下唇/笑纹边缘 */
  var skinHi = std('#f7c9ad', { rough: 0.56 });   /* 颧骨提亮 */
  var beardHi = std('#fbf8f0', { rough: 0.80 });  /* 须束提亮（胸前） */
  var nailM  = std('#f6d6c4', { rough: 0.42 });   /* 指甲 */

  /* 草帽编织纹 v2：512px 席纹 —— 横向草束交错叠压 + 竖向绑定缝点 + 束内纤维丝 */
  var strawTex = canvasTex(512, 512, function (ctx) {
    var W = 512, rows = 8, rh = W / rows, cols = 8, cw = W / cols, i, j;
    ctx.fillStyle = '#d8a54e'; ctx.fillRect(0, 0, W, W);
    for (j = 0; j < rows; j++) {
      for (i = 0; i < cols; i++) {
        var off = (j % 2) * cw * 0.5;
        var x0 = i * cw + off - cw * 0.5, y0 = j * rh;
        /* 草束主体（交错亮暗 = 叠压感） */
        ctx.fillStyle = (i + j) % 2 ? '#d3a04a' : '#eec276';
        ctx.fillRect(x0 + 2, y0 + 3, cw - 5, rh - 8);
        /* 束顶高光 / 束底投影（立体圆条感） */
        ctx.fillStyle = 'rgba(250, 224, 156, 0.75)';
        ctx.fillRect(x0 + 2, y0 + 3, cw - 5, 5);
        ctx.fillStyle = 'rgba(246, 214, 140, 0.4)';
        ctx.fillRect(x0 + 2, y0 + 9, cw - 5, 3);
        ctx.fillStyle = 'rgba(150, 106, 38, 0.5)';
        ctx.fillRect(x0 + 2, y0 + rh - 11, cw - 5, 5);
        /* 束内纤维丝（4 根细丝） */
        ctx.strokeStyle = 'rgba(255, 232, 170, 0.30)'; ctx.lineWidth = 1.4;
        for (var f = 0; f < 4; f++) {
          var fy = y0 + 10 + f * (rh - 20) / 4;
          ctx.beginPath(); ctx.moveTo(x0 + 6, fy);
          ctx.quadraticCurveTo(x0 + cw * 0.5, fy - 3, x0 + cw - 8, fy + 1); ctx.stroke();
        }
        /* 竖向绑定缝点（编结压点） */
        ctx.fillStyle = 'rgba(140, 98, 34, 0.55)';
        ctx.fillRect(x0 + cw * 0.5 - 2.5, y0 + rh * 0.5 - 5, 5, 10);
        ctx.fillStyle = 'rgba(250, 226, 160, 0.45)';
        ctx.fillRect(x0 + cw * 0.5 - 2.5, y0 + rh * 0.5 - 5, 5, 3);
        /* v3 H6：束间深缝（束底一道更深的接缝线）+ 束端斜向交叉纤维（编织叠压读感） */
        ctx.fillStyle = 'rgba(96, 62, 18, 0.42)';
        ctx.fillRect(x0 + 2, y0 + rh - 6, cw - 5, 2);
        ctx.strokeStyle = 'rgba(120, 82, 28, 0.28)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x0 + 2, y0 + 4); ctx.lineTo(x0 + 12, y0 + rh - 8); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0 + cw - 3, y0 + 4); ctx.lineTo(x0 + cw - 13, y0 + rh - 8); ctx.stroke();
        ctx.strokeStyle = 'rgba(255, 236, 180, 0.22)';
        ctx.beginPath(); ctx.moveTo(x0 + 4, y0 + 5); ctx.lineTo(x0 + 14, y0 + rh - 7); ctx.stroke();
      }
    }
    /* v3 H6：全幅斜向细纤维（两向），低对比，让席纹在远处仍有交叉编织感 */
    ctx.strokeStyle = 'rgba(110, 74, 24, 0.10)'; ctx.lineWidth = 1;
    for (var dk = -W; dk < W * 2; dk += 22) {
      ctx.beginPath(); ctx.moveTo(dk, 0); ctx.lineTo(dk + W * 0.35, W); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(dk, W); ctx.lineTo(dk + W * 0.35, 0); ctx.stroke();
    }
  }, 6, 2);
  var strawM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: strawTex, roughness: 0.82 });
  var strawTex2 = strawTex.clone(); strawTex2.needsUpdate = true; strawTex2.repeat.set(3, 1.6);
  var strawM2 = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: strawTex2, roughness: 0.82 });
  var bandM  = std('#7c4a28', { rough: 0.72 });   /* 棕帽箍 */
  var bandStM = std('#5a3a20', { rough: 0.75 });  /* 帽箍底缝线 */
  var bandHi = std('#9a6438', { rough: 0.70 });   /* v3 H5 帽箍中条纹（略亮棕） */
  /* v3 H4 檐底暗草（立绘/转台檐底深棕阴影 #82461e~#6e3214 取中；双面渲染贴檐底） */
  var strawUnder = new THREE.MeshStandardMaterial({ color: C('#8c5a2c'), roughness: 0.92, side: THREE.DoubleSide });

  /* 丹宁斜纹（背带裤绿，v2 新增，低对比） */
  var denimTex = canvasTex(256, 256, function (ctx) {
    ctx.fillStyle = '#7ba35b'; ctx.fillRect(0, 0, 256, 256);
    var k;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'; ctx.lineWidth = 2;
    for (k = -256; k < 512; k += 12) {
      ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + 256, 256); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(30, 50, 20, 0.06)';
    for (k = -256; k < 512; k += 12) {
      ctx.beginPath(); ctx.moveTo(k + 6, 0); ctx.lineTo(k + 262, 256); ctx.stroke();
    }
  }, 5, 4);
  var denimM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: denimTex, roughness: 0.86 });

  /* 亚麻平纹（米白衬衫，v2 新增，极低对比） */
  var linenTex = canvasTex(256, 256, function (ctx) {
    ctx.fillStyle = '#efe9d8'; ctx.fillRect(0, 0, 256, 256);
    var k;
    ctx.fillStyle = 'rgba(190, 175, 140, 0.10)';
    for (k = 0; k < 256; k += 8) ctx.fillRect(k, 0, 3, 256);
    for (k = 0; k < 256; k += 8) ctx.fillRect(0, k, 256, 3);
  }, 4, 3);
  var shirtM = new THREE.MeshStandardMaterial({ color: C('#ffffff'), map: linenTex, roughness: 0.84 }); /* 米白衬衫 */
  var shirtHi = std('#f6f1e2', { rough: 0.78 });   /* 衬衫卷袖亮面 */

  /* 檐缘波浪（确定性函数：檐缘三点主波 + 五点细波；帽檐顶点与檐须共用，保证贴合） */
  function brimWave(th) { return sin(th * 3 + 0.4) * 0.010 + sin(th * 7 + 2.1) * 0.004; }

  /* ---------------- 2. 躯干（torso 关节 @ (0,0.52,0)；局部 y→世界 +0.52） ---------------- */
  var torso = grp(); torso.position.set(0, 0.52, 0); torso.name = 'torso'; g.add(torso);

  /* 臀裆填充（绿，填满两腿根之间） */
  var hips = sph(0.33, 16, 12, denimM, 0, 0.06, 0); hips.scale.set(1.05, 0.75, 0.9); torso.add(hips);

  /* 衬衫上躯干：Lathe（世界 0.90→1.18，肩带以上露白；袖肩宽度由臂关节三角肌补） */
  var shirtPts = [
    new THREE.Vector2(0.001, 0.375), new THREE.Vector2(0.26, 0.382), new THREE.Vector2(0.315, 0.405),
    new THREE.Vector2(0.348, 0.45),  new THREE.Vector2(0.352, 0.50),  new THREE.Vector2(0.325, 0.565),
    new THREE.Vector2(0.275, 0.615), new THREE.Vector2(0.238, 0.645), new THREE.Vector2(0.001, 0.66)
  ];
  var shirt = mesh(new THREE.LatheGeometry(shirtPts, 24), shirtM);
  shirt.name = 'shirt'; shirt.scale.z = 0.92; torso.add(shirt);

  /* 背带裤裤身（含大肚）：Lathe（世界 0.52→0.995，肚峰 r0.412 @ 局部 0.25） */
  var ovPts = [
    new THREE.Vector2(0.001, 0.015), new THREE.Vector2(0.30, 0.04),  new THREE.Vector2(0.378, 0.10),
    new THREE.Vector2(0.406, 0.18),  new THREE.Vector2(0.412, 0.25), new THREE.Vector2(0.398, 0.33),
    new THREE.Vector2(0.372, 0.41),  new THREE.Vector2(0.342, 0.472)
  ];
  var overall = mesh(new THREE.LatheGeometry(ovPts, 24), denimM);
  overall.name = 'overall'; overall.scale.z = 0.92; torso.add(overall);

  /* 裤腰缝线（世界 ≈0.99，微凸暗绿细环） */
  var waistband = mesh(new THREE.TorusGeometry(0.344, 0.009, 8, 26), greenD);
  waistband.name = 'waistband';
  waistband.position.set(0, 0.468, 0); waistband.rotation.x = PI / 2;
  waistband.scale.z = 0.92; torso.add(waistband);

  /* 胸兜组（微后仰贴肚面）：兜板 + 贴袋 + 袋口缝线 + 四边明线 + 角铆钉 */
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
    bevelThickness: 0.005, bevelSize: 0.008, bevelSegments: 2 }), denimM);
  bib.name = 'bib';
  bib.position.set(0, 0.555, 0.300); bib.rotation.x = 0.10; bibG.add(bib);
  /* 兜：贴袋（丹宁）+ 袋口翻线（暗绿双线索引参考图袋口缝）+ 四边明线（浅绿） */
  var pkt = box(0.20, 0.128, 0.016, denimM, 0, 0.465, 0.330); pkt.name = 'pocket'; bibG.add(pkt);
  bibG.add(box(0.204, 0.010, 0.004, cuffM, 0, 0.528, 0.338));
  bibG.add(box(0.204, 0.010, 0.004, cuffM, 0, 0.402, 0.338));
  bibG.add(box(0.010, 0.130, 0.004, cuffM, -0.098, 0.465, 0.338));
  bibG.add(box(0.010, 0.130, 0.004, cuffM, 0.098, 0.465, 0.338));
  var pktHem = box(0.202, 0.013, 0.006, greenD, 0, 0.508, 0.340); pktHem.name = 'pocketHem'; bibG.add(pktHem);
  /* 贴袋角铆钉 ×2（v2 五金；小黄铜球，钉在袋面） */
  var rvF0 = sph(0.009, 16, 12, brassD, -0.088, 0.517, 0.342); rvF0.name = 'rivetFPocketL'; bibG.add(rvF0);
  var rvF = sph(0.009, 16, 12, brassD, 0.088, 0.517, 0.342); rvF.name = 'rivetFPocketR'; bibG.add(rvF);

  /* 前背带 ×2（兜顶→肩顶，+带面明线）+ 肩桥（翻过肩线接背带） */
  var sb;
  for (sb = -1; sb <= 1; sb += 2) {
    var sf = box(0.075, 0.17, 0.028, denimM, 0.16 * sb, 0.655, 0.20);
    sf.rotation.x = -0.75; sf.name = sb > 0 ? 'strapFrontL' : 'strapFrontR';
    torso.add(sf);
    sf.add(box(0.050, 0.146, 0.005, cuffM, 0, 0, 0.017));           /* 带面明线（随带转） */
    torso.add(box(0.075, 0.045, 0.30, denimM, 0.16 * sb, 0.662, 0.0)); /* 肩桥 */
  }
  /* 后 X 交叉背带 ×2（背视图识别件，宽臂大 X 交叉入腰） */
  for (sb = -1; sb <= 1; sb += 2) {
    var xb = box(0.075, 0.44, 0.026, denimM, 0.065 * sb, 0.47, -0.322);
    xb.rotation.z = 0.72 * sb; xb.rotation.x = -0.08; xb.name = sb > 0 ? 'strapBackL' : 'strapBackR';
    torso.add(xb);
  }
  /* 前带铜扣 ×2（v2：底座 + 穹面双件，兜顶两角，胡须外缘可见） */
  for (sb = -1; sb <= 1; sb += 2) {
    var bb0 = cyl(0.031, 0.033, 0.012, 14, brassD, 0.19 * sb, 0.70, 0.318);
    bb0.rotation.x = PI / 2; bb0.name = sb > 0 ? 'btnBaseL' : 'btnBaseR'; bibG.add(bb0);
    var bd = sph(0.027, 16, 12, brassM, 0.19 * sb, 0.70, 0.326);
    bd.name = sb > 0 ? 'btnDomeL' : 'btnDomeR'; bibG.add(bd);
  }
  /* 后贴袋 ×2 + 四边明线 + 角铆钉（背视图识别件，臀位；明线/铆钉挂袋体随转） */
  for (sb = -1; sb <= 1; sb += 2) {
    var bp = box(0.15, 0.13, 0.014, denimM, 0.145 * sb, 0.20, -0.352);
    bp.rotation.x = 0.25; bp.rotation.y = -0.39 * sb; bp.name = sb > 0 ? 'backPocketL' : 'backPocketR';
    torso.add(bp);
    bp.add(box(0.138, 0.008, 0.004, cuffM, 0, 0.056, 0.010));        /* 上明线 */
    bp.add(box(0.138, 0.008, 0.004, cuffM, 0, -0.056, 0.010));       /* 下明线 */
    bp.add(box(0.008, 0.104, 0.004, cuffM, -0.066, 0, 0.010));       /* 侧明线 L */
    bp.add(box(0.008, 0.104, 0.004, cuffM, 0.066, 0, 0.010));        /* 侧明线 R */
    var r1 = sph(0.008, 16, 12, brassD, -0.058, 0.048, 0.012); r1.name = 'rivetB' + (sb > 0 ? 'L' : 'R') + '0'; bp.add(r1);
    var r2 = sph(0.008, 16, 12, brassD, 0.058, 0.048, 0.012); r2.name = 'rivetB' + (sb > 0 ? 'L' : 'R') + '1'; bp.add(r2);
  }
  /* 裆中线缝（前视下腹识别线） */
  torso.add(box(0.012, 0.17, 0.008, greenD, 0, 0.135, 0.372));
  /* v3 H9：裤身后中缝线（背视识别，后贴袋之间）+ 肩带滑扣方框 ×2（肩桥前端的铜色滑扣，穿带露丹宁） */
  var backSeam = box(0.012, 0.16, 0.008, greenD, 0, 0.13, -0.368); backSeam.name = 'backSeam'; torso.add(backSeam);
  for (sb = -1; sb <= 1; sb += 2) {
    var slider = box(0.088, 0.016, 0.040, brassD, 0.16 * sb, 0.688, 0.095);
    slider.name = sb > 0 ? 'strapSliderL' : 'strapSliderR'; torso.add(slider);
    slider.add(box(0.058, 0.006, 0.024, denimM, 0, 0.006, 0));   /* 滑扣中穿带 */
  }

  /* 脖颈（被胡/白发遮大半） */
  torso.add(cyl(0.10, 0.118, 0.14, 12, skinM, 0, 0.655, 0.005));

  /* ---------------- 3. 头（head 关节 @ (0,1.1,0)；颅心局部 (0,0.28) → 世界 1.38） ---------------- */
  var head = grp(); head.position.set(0, 1.1, 0); head.name = 'head'; g.add(head);

  var skull = sph(0.29, 26, 18, skinM, 0, 0.28, 0); skull.scale.set(0.98, 0.95, 0.96); head.add(skull);
  /* 腮帮（下半脸加宽） */
  var chkL = sph(0.095, 16, 12, skinM, -0.155, 0.185, 0.115); chkL.scale.set(1, 0.85, 0.9); head.add(chkL);
  var chkR = sph(0.095, 16, 12, skinM, 0.155, 0.185, 0.115); chkR.scale.set(1, 0.85, 0.9); head.add(chkR);

  /* 耳朵（大圆招风） */
  var s2;
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var ear = sph(0.075, 16, 12, skinM, 0.272 * s2, 0.27, -0.01);
    ear.scale.set(0.5, 1.1, 0.85); head.add(ear);
    var earin = sph(0.048, 16, 12, skinD, 0.29 * s2, 0.27, 0.008);
    earin.scale.set(0.3, 0.8, 0.6); head.add(earin);
  }

  /* 白发 v2：帽檐两侧各 4 球簇（蓬起没入檐底）+ 脑后 3 层厚发带（背视图识别件） */
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var h1 = sph(0.046, 16, 12, beardM, 0.245 * s2, 0.395, 0.01); h1.scale.set(0.5, 1.05, 0.9); head.add(h1);
    var h2 = sph(0.042, 16, 12, beardM, 0.262 * s2, 0.33, 0.03); h2.scale.set(0.45, 0.9, 0.8); head.add(h2);
    var h3 = sph(0.040, 16, 12, beardM, 0.256 * s2, 0.265, 0.0); h3.scale.set(0.45, 0.85, 0.8); head.add(h3);
    var h4 = sph(0.036, 16, 12, beardM, 0.242 * s2, 0.418, -0.02); h4.scale.set(0.5, 0.8, 0.8); head.add(h4);
  }
  var nape1 = sph(0.12, 16, 12, beardM, 0, 0.13, -0.205); nape1.scale.set(1.85, 0.85, 0.5); head.add(nape1);
  var nape2 = sph(0.13, 16, 12, beardM, 0, 0.30, -0.23); nape2.scale.set(1.9, 0.95, 0.5); head.add(nape2);
  var nape3 = sph(0.115, 16, 12, beardM, 0, 0.415, -0.215); nape3.scale.set(1.75, 0.7, 0.45); head.add(nape3);

  /* 眼（大圆黑褐，前缘出颅面；主高光左上 + 副高光右下 + 上睑皮） */
  var s3;
  for (s3 = -1; s3 <= 1; s3 += 2) {
    var white = sph(0.044, 16, 12, dotM, 0.098 * s3, 0.313, 0.262);
    white.scale.set(1.0, 1.12, 0.5); head.add(white);
    var iris = sph(0.036, 16, 12, irisM, 0.098 * s3, 0.313, 0.2765);
    iris.scale.set(1, 1, 0.38); head.add(iris);
    head.add(sph(0.019, 16, 12, pupilM, 0.098 * s3, 0.312, 0.2825));
    head.add(sph(0.009, 16, 12, dotM, 0.098 * s3 - 0.011, 0.324, 0.287));
    head.add(sph(0.005, 16, 12, dotM, 0.098 * s3 + 0.010, 0.302, 0.286));  /* 副高光 */
    var lid = sph(0.045, 16, 12, skinM, 0.098 * s3, 0.335, 0.262);
    lid.scale.set(1.05, 0.5, 0.5); head.add(lid);
    /* v3 H7 面部立体：眼袋（眼下暗部薄椭球）+ 外眼角鱼尾笑纹 ×2 + 颧骨提亮凸（贴颅面浮出 ≤0.012） */
    var bag = sph(0.034, 16, 12, skinD, 0.098 * s3, 0.262, 0.266);
    bag.scale.set(1.1, 0.34, 0.4); bag.name = s3 > 0 ? 'eyeBagL' : 'eyeBagR'; head.add(bag);
    var cf1 = sph(0.016, 16, 12, skinD, 0.150 * s3, 0.322, 0.240);
    cf1.scale.set(0.30, 1.1, 0.36); cf1.rotation.z = 0.55 * s3; cf1.name = 'crowFoot' + (s3 > 0 ? 'L' : 'R') + '0'; head.add(cf1);
    var cf2 = sph(0.016, 16, 12, skinD, 0.156 * s3, 0.302, 0.238);
    cf2.scale.set(0.30, 1.1, 0.36); cf2.rotation.z = -0.35 * s3; cf2.name = 'crowFoot' + (s3 > 0 ? 'L' : 'R') + '1'; head.add(cf2);
    var cheekbone = sph(0.05, 16, 12, skinHi, 0.16 * s3, 0.255, 0.212);
    cheekbone.scale.set(1.0, 0.6, 0.45); cheekbone.name = s3 > 0 ? 'cheekboneL' : 'cheekboneR'; head.add(cheekbone);
  }

  /* 雪白浓眉 v2：每侧 4 球簇拼拱形粗眉（内低外高、蓬密、外端没入帽檐） */
  var brows = [
    [0.048, 0.396, 0.276, 0.040, 1.00, 0.85, 0.80, 0.10],
    [0.104, 0.412, 0.270, 0.046, 1.00, 0.90, 0.85, 0.16],
    [0.160, 0.420, 0.252, 0.040, 1.05, 0.85, 0.80, 0.24],
    [0.198, 0.424, 0.232, 0.030, 1.30, 0.70, 0.70, 0.30]
  ];
  for (s2 = -1; s2 <= 1; s2 += 2) {
    for (var bi = 0; bi < brows.length; bi++) {
      var B = brows[bi];
      var bt = sph(B[3], 16, 12, beardM, B[0] * s2, B[1], B[2]);
      bt.scale.set(B[4], B[5], B[6]); bt.rotation.z = B[7] * s2;
      bt.name = 'browTuft' + (s2 > 0 ? 'L' : 'R') + bi;
      head.add(bt);
    }
  }

  /* 大圆鼻（前凸超越面）+ 鼻梁 + 鼻孔 */
  var nose = sph(0.08, 16, 12, noseM, 0, 0.272, 0.295); nose.scale.set(1.02, 0.95, 1.0);
  nose.name = 'nose'; head.add(nose);
  var bridge = sph(0.045, 16, 12, skinM, 0, 0.325, 0.283); bridge.scale.set(0.85, 1.3, 0.8); head.add(bridge);
  head.add(sph(0.018, 16, 12, skinD, -0.034, 0.238, 0.352));
  head.add(sph(0.018, 16, 12, skinD, 0.034, 0.238, 0.352));

  /* 腮红（脸颊前侧，不出脸缘） */
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var bl = sph(0.048, 16, 12, blushM, 0.15 * s2, 0.215, 0.262);
    bl.scale.set(1.2, 0.65, 0.4); head.add(bl);
  }

  /* 八字胡 v2（主体+阴影底瓣+每侧 3 瓣渐小急垂+外侧垂尖；压鼻下覆盖嘴位） */
  var mo = sph(0.055, 16, 12, beardM, 0, 0.19, 0.305); mo.scale.set(1.6, 0.6, 0.72);
  mo.name = 'mustache'; head.add(mo);
  var moShadow = sph(0.05, 16, 12, beardS, 0, 0.148, 0.30); moShadow.scale.set(1.55, 0.5, 0.7);
  moShadow.name = 'mustacheShadow'; head.add(moShadow);
  var moLobes = [
    [0.085, 0.18, 0.30, 0.048, 1.6, 0.6, 0.7, -0.3],
    [0.15, 0.155, 0.278, 0.043, 1.5, 0.58, 0.66, -0.65],
    [0.20, 0.115, 0.245, 0.035, 1.3, 0.55, 0.6, -1.0]
  ];
  var s4;
  for (s4 = -1; s4 <= 1; s4 += 2) {
    for (var mi = 0; mi < moLobes.length; mi++) {
      var L = moLobes[mi];
      var lb = sph(L[3], 16, 12, beardM, L[0] * s4, L[1], L[2]);
      lb.scale.set(L[4], L[5], L[6]); lb.rotation.z = L[7] * s4;
      head.add(lb);
    }
    var mt = sph(0.026, 16, 12, beardM, 0.235 * s4, 0.082, 0.222);   /* 外侧垂尖 */
    mt.scale.set(1.25, 0.55, 0.6); mt.rotation.z = -1.25 * s4;
    mt.name = s4 > 0 ? 'moTipL' : 'moTipR'; head.add(mt);
  }

  /* v3 H1 大笑的嘴（立绘：胡下张口大笑，暗腔 + 上牙 + 红舌，两侧露颊皮与法令纹）。
   * 全部叠在须面（z≈0.30~0.33）之前 0.01~0.03，须体几何零改动；胡唇檐从上方压住口腔顶缘。 */
  var mouthG = grp(); mouthG.name = 'mouthG'; mouthG.position.set(0, 0, 0); head.add(mouthG);
  var moLip = sph(0.06, 16, 12, beardM, 0, 0.153, 0.336);
  moLip.scale.set(1.45, 0.32, 0.5); moLip.name = 'moLipShelf'; mouthG.add(moLip);   /* 胡唇檐 */
  var cavity = sph(0.068, 18, 14, mouthM, 0, 0.108, 0.338);
  cavity.scale.set(1.1, 0.48, 0.25); cavity.name = 'mouthCavity'; mouthG.add(cavity);
  var toothX = [-0.044, -0.022, 0, 0.022, 0.044];
  for (var ti = 0; ti < toothX.length; ti++) {
    var tx = toothX[ti];
    var tzf = Math.sqrt(Math.max(0.05, 1 - (tx / 0.0748) * (tx / 0.0748) - 0.305));
    var tooth = box(0.019, 0.016, 0.012, toothM, tx, 0.122, 0.338 + 0.017 * tzf + 0.004);
    tooth.rotation.y = -tx * 8; tooth.name = 'tooth' + ti; mouthG.add(tooth);
  }
  var tongue = sph(0.036, 16, 12, tongueM, 0, 0.090, 0.340);
  tongue.scale.set(1.15, 0.5, 0.45); tongue.name = 'tongue'; mouthG.add(tongue);
  var lowerLip = sph(0.078, 16, 12, lipM, 0, 0.070, 0.338);
  lowerLip.scale.set(1.0, 0.2, 0.28); lowerLip.name = 'lowerLip'; mouthG.add(lowerLip);
  for (s4 = -1; s4 <= 1; s4 += 2) {
    var pad = sph(0.032, 16, 12, skinM, 0.090 * s4, 0.106, 0.330);
    pad.scale.set(0.95, 0.9, 0.4); pad.name = s4 > 0 ? 'cheekPadL' : 'cheekPadR'; mouthG.add(pad);
    var crease = sph(0.02, 16, 12, skinD, 0.118 * s4, 0.112, 0.340);
    crease.scale.set(0.28, 1.3, 0.3); crease.rotation.z = -0.35 * s4;
    crease.name = s4 > 0 ? 'laughLineL' : 'laughLineR'; mouthG.add(crease);
  }

  /* 白胡须组 v2（垂胸大胡：主体 + 中层 5 束须 + 4 沟阴影纹 + 底缘 3 尖 + 两侧尖；
   * 前凸罩住下巴嘴；挂 head 关节随头动） */
  var beardG = grp(); beardG.name = 'beardG'; head.add(beardG);
  var beardMain = sph(0.17, 18, 14, beardM, 0, 0.045, 0.19);
  beardMain.scale.set(1.16, 1.5, 0.78); beardMain.name = 'beardMain'; beardG.add(beardMain);
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var bc = sph(0.082, 16, 12, beardM, 0.16 * s2, 0.165, 0.16);
    bc.scale.set(0.95, 1.5, 0.85); bc.name = s2 > 0 ? 'beardCheekL' : 'beardCheekR'; beardG.add(bc);
  }
  /* 中层须束（贴须面微凸 0.010、束宽近贴成连续蓬松纹理，做流苏分层） */
  function beardZ(x) { return 0.19 + 0.1326 * Math.sqrt(Math.max(0, 1 - (x / 0.197) * (x / 0.197))); }
  var strandX = [-0.125, -0.0625, 0, 0.0625, 0.125];
  for (var si = 0; si < strandX.length; si++) {
    var sx = strandX[si];
    var st = sph(0.036, 16, 12, beardM, sx, 0.02 - 0.012 * abs(sx) / 0.0625, beardZ(sx) - 0.006);
    st.scale.set(1.15, 2.3, 0.38);
    st.name = 'beardStrand' + si; beardG.add(st);
  }
  /* 阴影须纹（束间 4 沟，暗色薄椭球；藏于束后 0.004） */
  var grooveX = [[-0.094, 0.0], [-0.031, 0.015], [0.031, 0.015], [0.094, 0.0]];
  for (var gi = 0; gi < grooveX.length; gi++) {
    var gx = grooveX[gi][0];
    var gr = sph(0.012, 16, 12, beardS, gx, grooveX[gi][1], beardZ(gx) - 0.006);
    gr.scale.set(0.42, 3.1, 0.45);
    gr.name = 'beardGroove' + gi; beardG.add(gr);
  }
  /* v3 H8：胸前提亮须束 ×3（亮色薄椭球，叠在束面前 0.004，非对称分布更自然）+ 侧缕 ×2（颊须外缘下垂缕） */
  var hiX = [-0.078, 0.012, 0.096];
  for (var hi = 0; hi < hiX.length; hi++) {
    var hx = hiX[hi];
    var hs = sph(0.02, 16, 12, beardHi, hx, 0.035 - 0.02 * hi, beardZ(hx) + 0.004);
    hs.scale.set(0.6, 2.4 - 0.2 * hi, 0.35); hs.rotation.z = (hi - 1) * 0.06;
    hs.name = 'beardHi' + hi; beardG.add(hs);
  }
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var sideStrand = sph(0.03, 16, 12, beardM, 0.185 * s2, 0.085, 0.165);
    sideStrand.scale.set(0.7, 1.9, 0.6); sideStrand.rotation.z = 0.28 * s2;
    sideStrand.name = s2 > 0 ? 'beardSideL' : 'beardSideR'; beardG.add(sideStrand);
  }
  /* 底缘分尖（中 3 尖 + 两侧尖 → 参考图须底波浪） */
  var tip1 = sph(0.088, 16, 12, beardM, 0, -0.105, 0.20); tip1.scale.set(1.32, 0.85, 0.72); beardG.add(tip1);
  var tip2 = sph(0.062, 16, 12, beardM, 0, -0.14, 0.205); tip2.scale.set(1.1, 0.72, 0.66); beardG.add(tip2);
  var tip3 = sph(0.045, 16, 12, beardM, 0, -0.158, 0.205); tip3.scale.set(0.85, 0.6, 0.6);
  tip3.name = 'beardTipC'; beardG.add(tip3);
  for (s2 = -1; s2 <= 1; s2 += 2) {
    var btp = sph(0.05, 16, 12, beardM, 0.088 * s2, -0.12, 0.185);
    btp.scale.set(0.9, 1.05, 0.7); btp.rotation.z = -0.22 * s2;
    btp.name = s2 > 0 ? 'beardTipL' : 'beardTipR'; beardG.add(btp);
  }

  /* ---------------- 草帽 v2（宽檐波浪缘 + 512px 编织纹 + 棕箍+底缝线 + 密集檐须 + 帽顶集顶） ---------------- */
  var hatG = grp(); hatG.name = 'hatG'; hatG.rotation.x = 0.02; head.add(hatG);
  var brimPts = [
    new THREE.Vector2(0.16, 0.012), new THREE.Vector2(0.24, 0.005), new THREE.Vector2(0.32, -0.007),
    new THREE.Vector2(0.395, -0.019), new THREE.Vector2(0.424, -0.026), new THREE.Vector2(0.428, -0.035),
    new THREE.Vector2(0.414, -0.04), new THREE.Vector2(0.355, -0.032), new THREE.Vector2(0.275, -0.019),
    new THREE.Vector2(0.20, -0.009), new THREE.Vector2(0.16, -0.007)
  ];
  var brim = mesh(new THREE.LatheGeometry(brimPts, 40), strawM);
  brim.name = 'hatBrim'; brim.position.set(0, 0.448, 0); brim.scale.z = 0.99; hatG.add(brim);
  /* 檐缘波浪起伏（顶点位移：外缘全幅、内缘收敛；再算法线，缝连续） */
  (function () {
    var pos = brim.geometry.attributes.position, vi;
    for (vi = 0; vi < pos.count; vi++) {
      var vx = pos.getX(vi), vz = pos.getZ(vi);
      var rr = Math.sqrt(vx * vx + vz * vz);
      var wt = (rr - 0.16) / (0.428 - 0.16); wt = wt < 0 ? 0 : (wt > 1 ? 1 : wt);
      pos.setY(vi, pos.getY(vi) + brimWave(Math.atan2(vz, vx)) * wt);
    }
    pos.needsUpdate = true;
    brim.geometry.computeVertexNormals();
  })();
  /* v3 H4：檐底暗草内衬（沿檐下轮廓外偏 0.004~0.006 的开口 Lathe，施加同一波浪位移，双面材质；
   * 参考图檐底呈深棕阴影，v2 檐底与檐面同纹理导致仰视/侧视檐底发亮） */
  var underPts = [
    new THREE.Vector2(0.168, -0.012), new THREE.Vector2(0.20, -0.014), new THREE.Vector2(0.275, -0.024),
    new THREE.Vector2(0.355, -0.037), new THREE.Vector2(0.405, -0.045), new THREE.Vector2(0.418, -0.046)
  ];
  var brimUnder = mesh(new THREE.LatheGeometry(underPts, 40), strawUnder);
  brimUnder.name = 'hatBrimUnder'; brimUnder.position.set(0, 0.448, 0); brimUnder.scale.z = 0.99; hatG.add(brimUnder);
  (function () {
    var pos = brimUnder.geometry.attributes.position, vi;
    for (vi = 0; vi < pos.count; vi++) {
      var vx = pos.getX(vi), vz = pos.getZ(vi);
      var rr = Math.sqrt(vx * vx + vz * vz);
      var wt = (rr - 0.16) / (0.428 - 0.16); wt = wt < 0 ? 0 : (wt > 1 ? 1 : wt);
      pos.setY(vi, pos.getY(vi) + brimWave(Math.atan2(vz, vx)) * wt);
    }
    pos.needsUpdate = true;
    brimUnder.geometry.computeVertexNormals();
  })();
  /* 檐须 v2：18 根长短渐变锥刺（sin 确定性变化，贴波浪檐缘外撇下垂） */
  for (var fi = 0; fi < 18; fi++) {
    var th = fi / 18 * PI * 2 + 0.09;
    var flen = 0.055 + 0.02 * sin(fi * 2.7);
    var fr = mesh(new THREE.ConeGeometry(0.0085, flen, 5), strawM2);
    fr.name = 'hatFray' + fi;
    var droop = 0.27 + sin(fi * 1.9) * 0.09;
    fr.position.set(cos(th) * 0.430, 0.418 + brimWave(th), sin(th) * 0.430);
    fr.rotation.z = -(PI / 2 - droop) * cos(th);
    fr.rotation.x = (PI / 2 - droop) * sin(th);
    hatG.add(fr);
  }
  var crownPts = [
    new THREE.Vector2(0.001, 0.0), new THREE.Vector2(0.15, 0.002), new THREE.Vector2(0.172, 0.03),
    new THREE.Vector2(0.185, 0.09), new THREE.Vector2(0.18, 0.145), new THREE.Vector2(0.152, 0.176),
    new THREE.Vector2(0.10, 0.188), new THREE.Vector2(0.001, 0.19)
  ];
  var crown = mesh(new THREE.LatheGeometry(crownPts, 26), strawM2);
  crown.name = 'hatCrown'; crown.position.set(0, 0.448, 0); hatG.add(crown);
  /* 帽顶集顶盘（v2：编织收顶小圆盘，参考图帽顶旋聚纹） */
  var topknot = sph(0.05, 16, 12, strawM2, 0, 0.634, 0); topknot.scale.set(1, 0.14, 1);
  topknot.name = 'hatTopknot'; hatG.add(topknot);
  var band = cyl(0.181, 0.176, 0.062, 22, bandM, 0, 0.478, 0);
  band.name = 'hatBand'; hatG.add(band);
  /* 帽箍底缝线环（v2 细节） */
  var bandSt = mesh(new THREE.TorusGeometry(0.1795, 0.0035, 6, 26), bandStM);
  bandSt.name = 'hatBandStitch'; bandSt.position.set(0, 0.4525, 0); bandSt.rotation.x = PI / 2; hatG.add(bandSt);
  /* v3 H5：帽箍顶缝线环 + 箍中略亮双色条纹（转台侧视帽箍有上下两道明暗分界） */
  var bandStTop = mesh(new THREE.TorusGeometry(0.1815, 0.003, 6, 26), bandStM);
  bandStTop.name = 'hatBandStitchTop'; bandStTop.position.set(0, 0.506, 0); bandStTop.rotation.x = PI / 2; hatG.add(bandStTop);
  var bandStripe = mesh(new THREE.TorusGeometry(0.1795, 0.0045, 6, 26), bandHi);
  bandStripe.name = 'hatBandStripe'; bandStripe.position.set(0, 0.480, 0); bandStripe.rotation.x = PI / 2; hatG.add(bandStripe);

  /* ---------------- 4. 手臂（镜像：armL s=+1，armR s=-1；姿态烘进网格偏移） ---------------- */
  function buildArm(s) {
    var pv = grp(); pv.position.set(0.40 * s, 1.0, 0); pv.name = s > 0 ? 'armL' : 'armR'; g.add(pv);
    pv.add(sph(0.088, 16, 12, shirtM, 0.005 * s, -0.045, 0));            /* 三角肌泡袖 */
    var slv = cyl(0.078, 0.068, 0.17, 14, shirtM, 0.012 * s, -0.145, 0.008);
    slv.rotation.x = -0.06; pv.add(slv);                                 /* 泡袖筒（手下前） */
    /* 卷袖翻边 v2：双环（外环衬衫主色 + 内环亮面）+ 2 翻折鼓包 */
    var cuff = cyl(0.080, 0.0765, 0.030, 14, shirtM, 0.014 * s, -0.230, 0.010);
    cuff.rotation.x = -0.06; cuff.name = s > 0 ? 'armCuffL' : 'armCuffR'; pv.add(cuff);
    var roll = cyl(0.0765, 0.0725, 0.026, 14, shirtHi, 0.015 * s, -0.257, 0.011);
    roll.rotation.x = -0.06; roll.name = s > 0 ? 'armRollL' : 'armRollR'; pv.add(roll);
    var fb1 = sph(0.017, 16, 12, shirtHi, 0.014 * s - 0.052, -0.236, 0.056);
    fb1.scale.set(1.15, 0.8, 0.65); pv.add(fb1);
    var fb2 = sph(0.017, 16, 12, shirtHi, 0.014 * s + 0.052, -0.244, 0.050);
    fb2.scale.set(1.15, 0.8, 0.65); pv.add(fb2);
    var handName = s > 0 ? 'handL' : 'handR';
    if (s > 0) {
      /* v3 H3 左手（角色左侧，垂于髋侧松握）：裸前臂 + 手掌 + 四指两节卷曲 + 拇指两节 */
      var fam = cyl(0.058, 0.052, 0.115, 12, skinM, 0.022 * s, -0.305, 0.017);
      fam.rotation.x = -0.05; fam.name = 'forearmL'; pv.add(fam);          /* 裸前臂 */
      var hand = sph(0.055, 16, 12, skinM, 0.03 * s, -0.352, 0.022);
      hand.scale.set(0.85, 1.05, 0.9); hand.name = handName; pv.add(hand);
      for (var fi = 0; fi < 4; fi++) {
        var fx = 0.03 * s + (fi - 1.5) * 0.021 * s;
        var fz = 0.034 - abs(fi - 1.5) * 0.004;
        var prox = mesh(new THREE.CapsuleGeometry(0.0115 - fi * 0.0005, 0.026, 3, 10), skinM);
        prox.position.set(fx, -0.404, fz); prox.rotation.x = -0.5;
        prox.name = 'fingerL' + fi + 'a'; pv.add(prox);                     /* 近节（自掌底垂下） */
        var dist = mesh(new THREE.CapsuleGeometry(0.0105 - fi * 0.0005, 0.02, 3, 10), skinM);
        dist.position.set(fx, -0.432, fz + 0.028); dist.rotation.x = -1.2;
        dist.name = 'fingerL' + fi + 'b'; pv.add(dist);                     /* 远节（向掌心卷） */
      }
      var thumbBase = sph(0.02, 16, 12, skinM, -0.01 * s, -0.335, 0.042);
      thumbBase.name = 'thumbBaseL'; pv.add(thumbBase);                     /* 拇指根（v2 件保留） */
      var thumbTip = mesh(new THREE.CapsuleGeometry(0.013, 0.026, 3, 10), skinM);
      thumbTip.position.set(0.0, -0.365, 0.066); thumbTip.rotation.x = -0.85; thumbTip.rotation.z = 0.35 * s;
      thumbTip.name = 'thumbTipL'; pv.add(thumbTip);                        /* 拇指末节（搭在指前） */
    } else {
      /* v3 H2 右手竖大拇指（立绘：右手握拳举至胸前，拇指竖起）：
       * 肘枢轴在卷袖口下缘，前臂沿 +Y 向前上折起（rot.x 0.62）并内收（rot.z 0.22·s），拳至胸前须底；
       * 拳 + 四指横向卷曲叠 4 层 + 指关节 ×4 + 拇指两节 + 指甲。view3d 只驱动 armR 关节 rotation，
       * 折臂整体随肩摆动，语义不变。 */
      var elbowG = grp(); elbowG.position.set(0.016 * s, -0.255, 0.03);
      elbowG.rotation.set(0.62, 0, 0.22 * s); elbowG.name = 'elbowR'; pv.add(elbowG);
      var elbow = sph(0.05, 16, 12, skinM, 0, 0, 0); elbow.scale.set(1, 0.9, 1); elbow.name = 'elbowBallR'; elbowG.add(elbow);
      var fore = cyl(0.050, 0.057, 0.15, 12, skinM, 0, 0.075, 0); fore.name = 'forearmR'; elbowG.add(fore);
      var fist = sph(0.058, 16, 12, skinM, 0, 0.172, 0.004);
      fist.scale.set(0.95, 0.88, 0.9); fist.name = handName; elbowG.add(fist);
      for (var fj = 0; fj < 4; fj++) {
        var fy = 0.135 + fj * 0.0215;
        var fcap = mesh(new THREE.CapsuleGeometry(0.0125 - fj * 0.0006, 0.034 - fj * 0.003, 3, 10), skinM);
        fcap.position.set(-0.004 * s, fy, 0.047 - fj * 0.004); fcap.rotation.z = PI / 2; fcap.rotation.y = 0.18 * s;
        fcap.name = 'fingerR' + fj; elbowG.add(fcap);                       /* 卷曲四指（横向胶囊） */
        var knuckle = sph(0.0105, 12, 10, skinD, 0.038 * s, fy, 0.040 - fj * 0.004);
        knuckle.name = 'knuckleR' + fj; elbowG.add(knuckle);                /* 指关节（拳外侧） */
      }
      var thBase = mesh(new THREE.CapsuleGeometry(0.017, 0.038, 3, 10), skinM);
      thBase.position.set(0.012 * s, 0.232, -0.006); thBase.rotation.x = -0.12;
      thBase.name = 'thumbBaseR'; elbowG.add(thBase);                       /* 拇指近节（自拳顶竖起） */
      var thTip = mesh(new THREE.CapsuleGeometry(0.0155, 0.032, 3, 10), skinM);
      thTip.position.set(0.014 * s, 0.272, -0.018); thTip.rotation.x = -0.32;
      thTip.name = 'thumbTipR'; elbowG.add(thTip);                          /* 拇指末节（略后仰） */
      var nail = sph(0.009, 12, 10, nailM, 0.014 * s, 0.288, -0.006);
      nail.scale.set(1.1, 1.3, 0.45); nail.rotation.x = -0.32; nail.name = 'thumbNailR'; elbowG.add(nail);
      pv.userData.thumbTip = thTip;
    }
    return pv;
  }
  var armL = buildArm(1), armR = buildArm(-1);

  /* ---------------- 5. 腿（镜像：legL s=+1，legR s=-1） ---------------- */
  function buildLeg(s) {
    var pv = grp(); pv.position.set(0.18 * s, 0.5, 0); pv.name = s > 0 ? 'legL' : 'legR'; g.add(pv);
    var th = cyl(0.118, 0.104, 0.23, 14, denimM, 0.012 * s, -0.15, 0);
    th.rotation.z = 0.06 * s; pv.add(th);
    var sn = cyl(0.098, 0.088, 0.19, 14, denimM, 0.022 * s, -0.36, 0.004);
    sn.rotation.z = 0.03 * s; pv.add(sn);
    pv.add(box(0.012, 0.30, 0.008, greenD, 0.028 * s, -0.28, 0.085));    /* 前裤缝 */
    pv.add(cyl(0.095, 0.092, 0.045, 14, cuffM, 0.023 * s, -0.432, 0.004)); /* 卷脚 ×2 */
    pv.add(cyl(0.092, 0.089, 0.04, 14, cuffM, 0.023 * s, -0.465, 0.004));
    /* 鞋 v2（脚尖外八 0.12rad；圆钝鞋头 + 沿条 + 鞋面缝线；鞋底正好 -0.5 → 世界 0） */
    var shoeG = grp(); shoeG.position.set(0.024 * s, 0, 0.01); shoeG.rotation.y = 0.12 * s; pv.add(shoeG);
    shoeG.add(box(0.15, 0.028, 0.24, soleM, 0, -0.486, 0.03));
    shoeG.add(box(0.158, 0.018, 0.248, soleM, 0, -0.477, 0.03));         /* 沿条（微宽出体） */
    shoeG.add(box(0.14, 0.05, 0.19, shoeM, 0, -0.445, 0.02));
    var toe = sph(0.058, 16, 12, shoeM, 0, -0.455, 0.100); toe.scale.set(1.02, 0.64, 1.18); shoeG.add(toe);
    shoeG.add(box(0.106, 0.012, 0.010, shoeDk, 0, -0.436, 0.055));       /* 鞋面缝线 */
    shoeG.add(box(0.12, 0.048, 0.07, shoeM, 0, -0.452, -0.075));
    shoeG.add(box(0.10, 0.032, 0.06, shoeDk, 0, -0.412, -0.005));        /* 鞋领/舌 */
    /* v3 H10：圆钝鞋跟包（后跟圆化）+ 鞋口滚边环 + 鞋头第二道缝弧（贴鞋头球面前缘） */
    var heelCap = sph(0.06, 16, 12, shoeM, 0, -0.442, -0.078);
    heelCap.scale.set(1.06, 0.52, 0.5); heelCap.name = 'heelCap'; shoeG.add(heelCap);
    var collarRim = mesh(new THREE.TorusGeometry(0.048, 0.008, 8, 20), shoeDk);
    collarRim.position.set(0, -0.398, -0.005); collarRim.rotation.x = PI / 2; collarRim.scale.set(1.15, 1, 0.75);
    collarRim.name = 'shoeCollarRim'; shoeG.add(collarRim);
    var toeArc = mesh(new THREE.TorusGeometry(0.054, 0.0032, 6, 22, 2.4), shoeDk);
    toeArc.position.set(0, -0.43, 0.102); toeArc.rotation.set(PI / 2, 0, PI / 2 - 1.2);
    toeArc.name = 'toeStitchArc'; shoeG.add(toeArc);
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
    beardG.scale.y = 1 + sin(t * 1.6 + 0.9) * 0.012;
    hatG.rotation.z = sin(t * 0.9) * 0.012;
    /* v3 H12：大笑微颤（口腔/舌 y 缩放 ≤4%，与呼吸同频）+ 竖拇指末节微动（rot.x ±0.04） */
    cavity.scale.y = 0.48 * (1 + sin(t * 1.6 + 1.2) * 0.03);
    tongue.scale.y = 0.5 * (1 + sin(t * 1.6 + 1.5) * 0.04);
    if (armR.userData.thumbTip) armR.userData.thumbTip.rotation.x = -0.32 + sin(t * 2.2) * 0.04;
    return breath;
  }];

  return g;
};

})();
