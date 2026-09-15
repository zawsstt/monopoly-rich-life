/* =====================================================================================
 * 大富翁 · 富贵人生 —— 载具 3D · 出租车（taxi.js）
 * -------------------------------------------------------------------------------------
 * img2threejs 高保真复刻：refs/asset_taxi.png（低模黄色出租车 正侧 3/4 视图）
 * 与"出差"事件卡关联（view3d 静态道具 B.props.taxi 的旧粗糙模型由本文件替代，接线由主控完成）。
 *
 * 实现要点（对照参考图逐条落件）：
 *   1) 黄色三盒式轿车车身：引擎盖三段下溜 + 脊线/双侧棱线 + 前鼻板；
 *      前后翼子板肩块；后备箱盖后倾 + 侧缝线 + 尾 deck 条
 *   2) 座舱：顶板双侧倒角 + 风挡/后窗窗楣 + 侧壁上半内倾（tumblehome）+ A/B/C 柱 ×6
 *      + 大倾角风挡（≈37°）+ 侧窗下沿深色窗台线 ×2
 *   3) NYC 标志性棋盘格腰线（Canvas 程序纹理，各段按长度缩放 UV 保证格子恒为正方形）：
 *      自前轮拱后沿低走车门 ×2 → 后门末端斜向上扬 ×2 → 沿后翼子板顶部水平至尾灯 ×2
 *      → 车尾横带 ×1（与参考图条纹走向一致）
 *   4) 车顶出租车顶灯：真梯形截面挤出体（顶窄底宽）+ 贴合斜面的前后棋盘面片（发光动画）
 *      + 端板 ×2 / 顶盖 / 基座，落于车顶前 1/3 处
 *   5) 前脸：宽幅黑格栅（背板+边框+5 横条交错深度+双竖隔条）+ 双大矩形大灯（暖光）
 *      + 杠角琥珀示宽灯 ×2 + 前牌照（杠面）
 *   6) 车尾：竖置红尾灯 ×2 + 下琥珀灯 ×2 + 后牌照（杠面安装，不被尾杠遮挡）+ 尾杠
 *   7) 车轮 ×4：胎 18 段（顶点相位校准精确触地）+ 暗钢辋环 + 大直径螺栓圈纹理轮毂盖
 *      + 中心盖（轮面分层凸出 0.005/0.011/0.015，侧视轮毂清晰可见）+ 轮拱饰板/拱唇
 *   8) 细件：外后视镜 ×2、门把手 ×4、门缝 ×6、内饰剪影（仪表台/计价器 Canvas
 *      显示屏/方向盘/前后座椅）、排气尾管
 *
 * 合并策略（r147 无 BufferGeometryUtils，手写合并）：
 *   Kit 按材质分桶收集图元（变换烘焙进顶点），flush 时每桶产出 1 个 BufferGeometry
 *   ——142 个图元合并为 17 个 mesh（≤130 预算，细节密度不降）。
 *
 * 导出契约：
 *   window.Special3D.taxi() → THREE.Group（每次调用全新实例：几何/材质全部在工厂内创建，
 *   材质不共享可变状态；纹理 Canvas 不可变可共享）
 *   原点 = 车底中心（四轮触地 y=0），车头朝 +Z，车辆自身左侧为 +X。
 *   整车长 2.396 / 宽 1.060 / 高 1.029（与 police_car 同体系，fitRide 按 Box3 归一化）。
 *
 * 动画（group.userData.anim = [fn(t, dt)]，1 项函数驱动 3 组材质，emissive 波动 ≤0.25）：
 *   1) 顶灯棋盘面暖光呼吸 + 大灯暖光微呼吸 + 尾灯同相微光（兼容 view3d runAnims(t,dt)）
 *
 * 技术约束：经典 script（无模块）；THREE r147 全局；MeshStandardMaterial
 *           （颜色 convertSRGBToLinear）；纹理仅程序化 Canvas ≤256px；
 *           圆柱段数 ≥12；四轮落地；零随机布局（禁用随机数 API）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[taxi] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ---------- 0. 工具 ---------- */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex),
    roughness: (o.rough !== undefined ? o.rough : 0.5),
    metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.map) { m.map = o.map; }
  if (o.opacity !== undefined) { m.transparent = true; m.opacity = o.opacity; }
  return m;
}

/* ---------- 1. Canvas 程序化纹理（≤256px，零外部资源；模块级缓存，纹理不可变可共享） ---------- */
var _texCache = {};
function canvasTex(key, w, h, draw) {
  if (_texCache[key]) return _texCache[key];
  var cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  var g = cv.getContext('2d');
  draw(g, w, h);
  var tex = new THREE.CanvasTexture(cv);
  tex.encoding = THREE.sRGBEncoding;
  _texCache[key] = tex;
  return tex;
}
/* NYC 棋盘格腰线：黑 × 赭黄方格两行（240×20；车身上格 ≈0.066×0.0575 近方形） */
function texChecker() {
  return canvasTex('taxiChecker', 240, 20, function (g, w, h) {
    g.fillStyle = '#c79a26'; g.fillRect(0, 0, w, h);
    var cols = 24, cell = w / cols, r, c;
    g.fillStyle = '#17181b';
    for (r = 0; r < 2; r++) {
      for (c = 0; c < cols; c++) {
        if ((c + r) % 2 === 0) g.fillRect(Math.floor(c * cell), r * 10, Math.ceil(cell), 10);
      }
    }
  });
}
/* 顶灯棋盘面：黄底 + 深色边框 + 中央 4×2 黑格（参考图顶灯仅棋盘无文字） */
function texSign() {
  return canvasTex('taxiSign', 128, 64, function (g, w, h) {
    g.fillStyle = '#f2b02c'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#202226'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6);
    var cols = 4, rows = 2, cw = 22, chh = 22;
    var x0 = (w - cols * cw) / 2, y0 = (h - rows * chh) / 2;
    g.fillStyle = '#202226';
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        if ((c + r) % 2 === 0) g.fillRect(Math.floor(x0 + c * cw), Math.floor(y0 + r * chh), cw, chh);
      }
    }
  });
}
/* 车牌：浅底 + 深蓝字 "8T·8021" + 左上角 TAXI 小标（远处读感清晰） */
function texPlate() {
  return canvasTex('taxiPlate', 192, 64, function (g, w, h) {
    g.fillStyle = '#eef0ea'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#2a2f36'; g.lineWidth = 5; g.strokeRect(4, 4, w - 8, h - 8);
    g.fillStyle = '#20305e';
    g.font = 'bold 15px Arial'; g.textAlign = 'left'; g.textBaseline = 'top';
    g.fillText('TAXI', 14, 8);
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 34px Arial';
    g.fillText('8T·8021', w / 2, h / 2 + 8);
  });
}
/* 计价器显示屏：暗底 + 琥珀 FARE + 绿色金额（透过风挡可见的座舱细节） */
function texMeter() {
  return canvasTex('taxiMeter', 96, 64, function (g, w, h) {
    g.fillStyle = '#141619'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#3a3e44'; g.lineWidth = 4; g.strokeRect(2, 2, w - 4, h - 4);
    g.fillStyle = '#e8a23c';
    g.font = 'bold 14px Arial'; g.textAlign = 'center'; g.textBaseline = 'top';
    g.fillText('FARE', w / 2, 6);
    g.fillStyle = '#8cf7a8';
    g.font = 'bold 26px Arial';
    g.fillText('23.5', w / 2, 26);
    g.fillStyle = '#d0d4da';
    g.font = 'bold 11px Arial';
    g.fillText('EXTRA', w / 2, 48);
  });
}
/* 轮毂盖端面：灰底 + 外暗环带 + 4 螺栓 + 中心方盖（参考图钢圈 + 灰盖读感；端帽两面同显） */
function texHub() {
  return canvasTex('taxiHub', 96, 96, function (g, w, h) {
    var cx = w / 2, cy = h / 2, i, a;
    g.fillStyle = '#5a5e64'; g.fillRect(0, 0, w, h);      /* 外暗环带（圆柱端面外圈） */
    g.fillStyle = '#8d9298';
    g.beginPath(); g.arc(cx, cy, 39, 0, PI * 2); g.fill();  /* 灰色盖面 */
    g.fillStyle = '#7a7f85';
    g.beginPath(); g.arc(cx, cy, 30, 0, PI * 2); g.fill();  /* 内侧微暗环 */
    g.fillStyle = '#8d9298';
    g.beginPath(); g.arc(cx, cy, 25, 0, PI * 2); g.fill();
    g.fillStyle = '#33373d';                                /* 4 螺栓 + 中心方盖 */
    for (i = 0; i < 4; i++) {
      a = -PI / 2 + i * PI / 2;
      g.beginPath(); g.arc(cx + cos(a) * 17, cy + sin(a) * 17, 4, 0, PI * 2); g.fill();
    }
    g.fillRect(cx - 7, cy - 7, 14, 14);
    g.fillStyle = 'rgba(226,230,235,0.6)';
    g.beginPath(); g.arc(cx - 2, cy - 2, 2.5, 0, PI * 2); g.fill();
  });
}
/* 座舱玻璃内侧微噪（极弱确定性散点，避免玻璃读成纯平面） */
function texGlass() {
  return canvasTex('taxiGlass', 64, 64, function (g, w, h) {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    var i, x, y;
    for (i = 0; i < 90; i++) {
      x = (i * 37) % w; y = (i * 23) % h;
      g.fillStyle = (i % 3) ? 'rgba(190,205,225,0.10)' : 'rgba(120,140,170,0.12)';
      g.fillRect(x, y, 2, 1);
    }
  });
}

/* ---------- 2. Kit：同材质静态件合并管线（手写 BufferGeometry 合并） ---------- */
var ONE = new THREE.Vector3(1, 1, 1);
function Kit() { this.bk = {}; this.parts = 0; this.tally = {}; }
Kit.prototype._push = function (mat, geo, name) {
  var b = this.bk[mat.uuid];
  if (!b) b = this.bk[mat.uuid] = { mat: mat, pos: [], nrm: [], uv: [] };
  var g = geo.index ? geo.toNonIndexed() : geo;
  var P = g.attributes.position.array;
  var N = g.attributes.normal ? g.attributes.normal.array : null;
  var U = g.attributes.uv ? g.attributes.uv.array : null;
  var i;
  for (i = 0; i < P.length; i++) b.pos.push(P[i]);
  if (N) { for (i = 0; i < N.length; i++) b.nrm.push(N[i]); }
  else { for (i = 0; i < P.length; i++) b.nrm.push(0); }
  if (U) { for (i = 0; i < U.length; i++) b.uv.push(U[i]); }
  else { for (i = 0; i < P.length / 3 * 2; i++) b.uv.push(0); }
  this.parts++;
  if (name) this.tally[name] = (this.tally[name] || 0) + 1;
};
/* add(mat, geo, x,y,z, rx,ry,rz, name)：烘焙欧拉旋转 + 平移进顶点后入桶（geo 所有权移交） */
Kit.prototype.add = function (mat, geo, x, y, z, rx, ry, rz, name) {
  if (x || y || z || rx || ry || rz) {
    var m = new THREE.Matrix4();
    var q = new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0));
    m.compose(new THREE.Vector3(x || 0, y || 0, z || 0), q, ONE);
    geo.applyMatrix4(m);
  }
  this._push(mat, geo, name);
};
Kit.prototype.box = function (mat, w, h, d, x, y, z, rx, ry, rz, name) {
  this.add(mat, new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz, name);
};
Kit.prototype.cyl = function (mat, rt, rb, h, seg, x, y, z, rx, ry, rz, name) {
  this.add(mat, new THREE.CylinderGeometry(rt, rb, h, seg), x, y, z, rx, ry, rz, name);
};
Kit.prototype.torus = function (mat, r, tube, rs, ts, arc, x, y, z, rx, ry, rz, name) {
  this.add(mat, new THREE.TorusGeometry(r, tube, rs, ts, arc), x, y, z, rx, ry, rz, name);
};
Kit.prototype.plane = function (mat, w, h, x, y, z, rx, ry, rz, name) {
  this.add(mat, new THREE.PlaneGeometry(w, h), x, y, z, rx, ry, rz, name);
};
/* raw(mat, geo, name)：已自行烘焙变换的几何（如 Extrude/Torus 链式 rotate/translate）直接入桶 */
Kit.prototype.raw = function (mat, geo, name) { this._push(mat, geo, name); };
/* flush：每材质桶产出 1 个 Mesh */
Kit.prototype.flush = function (parent) {
  var n = 0;
  for (var k in this.bk) {
    var b = this.bk[k];
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(b.nrm, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2));
    var mesh = new THREE.Mesh(geo, b.mat);
    mesh.castShadow = true;
    parent.add(mesh);
    n++;
  }
  return n;
};

/* ---------- 3. 工厂主函数（每次调用全新几何/材质实例） ---------- */
window.Special3D = window.Special3D || {};
window.Special3D.taxi = function () {
  var g = new THREE.Group();
  g.name = 'prop_taxi_hifi';

  /* ======== 材质（工厂内创建，实例间零共享） ======== */
  var M = {
    paintY:  std('#f6b62e', { rough: 0.42, metal: 0.05 }),               /* 出租车黄（参考图亮金黄） */
    bandK:   std('#33353a', { rough: 0.55, metal: 0.12 }),               /* 保险杠/深灰装饰 */
    grilleK: std('#17181c', { rough: 0.6,  metal: 0.1 }),                /* 格栅/边框黑 */
    seamK:   std('#26292f', { rough: 0.55 }),                            /* 缝线/把手 */
    glass:   std('#3d4f66', { rough: 0.12, metal: 0.1, opacity: 0.82, map: texGlass() }),
    innerK:  std('#23262b', { rough: 0.9 }),                             /* 内饰剪影 */
    rubber:  std('#1c1e21', { rough: 0.92 }),                            /* 轮胎橡胶 */
    hubDark: std('#3f4247', { rough: 0.5,  metal: 0.5 }),                /* 轮辋筒/制动背板 */
    hubCap:  std('#8d9298', { rough: 0.42, metal: 0.65, map: texHub() }),/* 螺栓圈轮毂盖 */
    chrome:  std('#4a4e55', { rough: 0.4,  metal: 0.8 }),                /* 排气暗钢 */
    amber:   std('#e2952f', { rough: 0.35 }),                            /* 琥珀转向/示宽 */
    checker: std('#ffffff', { rough: 0.5,  map: texChecker() }),         /* 棋盘腰线 */
    sign:    std('#f2b02c', { rough: 0.4,  map: texSign(), emissive: '#ffd873', ei: 0.14 }), /* 顶灯棋盘面 */
    plate:   std('#eef0ea', { rough: 0.5,  map: texPlate() }),           /* 牌照 */
    meter:   std('#ffffff', { rough: 0.4,  map: texMeter() })            /* 计价器屏 */
  };
  /* 发光材质（动画驱动） */
  var headM = std('#f2ead2', { rough: 0.3,  emissive: '#ffedb0', ei: 0.5 });   /* 大灯暖光 */
  var tailM = std('#a3241c', { rough: 0.3,  emissive: '#ff2418', ei: 0.16 });  /* 尾灯红 */
  var signM = M.sign;

  var kit = new Kit();

  /* ======== body-tub：车身体块（主质量 + 下裙围板） ======== */
  kit.box(M.paintY, 0.95, 0.34, 2.14, 0, 0.32, 0, 0, 0, 0, 'tub-main');
  kit.box(M.bandK, 0.86, 0.09, 1.98, 0, 0.115, 0, 0, 0, 0, 'underbody-shroud');

  /* ======== hood-panel：引擎盖三段下溜 + 脊线 + 双侧棱线 + 前鼻板 ======== */
  kit.box(M.paintY, 0.72, 0.024, 0.26, 0, 0.515, 0.70, 0.075, 0, 0, 'hood-plate');
  kit.box(M.paintY, 0.75, 0.024, 0.26, 0, 0.509, 0.46, 0.085, 0, 0, 'hood-plate');
  kit.box(M.paintY, 0.78, 0.024, 0.26, 0, 0.503, 0.20, 0.09, 0, 0, 'hood-plate');
  kit.box(M.paintY, 0.88, 0.028, 0.24, 0, 0.481, 0.975, 0.12, 0, 0, 'hood-nose-cap');
  kit.box(M.paintY, 0.05, 0.012, 0.60, 0, 0.530, 0.46, 0.083, 0, 0, 'hood-spine');
  kit.box(M.paintY, 0.014, 0.012, 0.58, 0.25, 0.527, 0.45, 0.083, 0, 0, 'hood-crease');
  kit.box(M.paintY, 0.014, 0.012, 0.58, -0.25, 0.527, 0.45, 0.083, 0, 0, 'hood-crease');

  /* ======== shoulders：前后翼子板肩块（轮拱上方薄隆起，外沿 0.4875 < 棋盘带面 0.491） ======== */
  kit.box(M.paintY, 0.02, 0.14, 0.58, 0.4775, 0.42, 0.68, 0.09, 0, 0, 'fender-shoulder');
  kit.box(M.paintY, 0.02, 0.14, 0.58, -0.4775, 0.42, 0.68, 0.09, 0, 0, 'fender-shoulder');
  kit.box(M.paintY, 0.02, 0.13, 0.54, 0.4775, 0.425, -0.70, -0.05, 0, 0, 'quarter-shoulder');
  kit.box(M.paintY, 0.02, 0.13, 0.54, -0.4775, 0.425, -0.70, -0.05, 0, 0, 'quarter-shoulder');

  /* ======== trunk-lid：后备箱盖（后倾）+ 侧缝线 + 尾 deck 条 ======== */
  kit.box(M.paintY, 0.76, 0.024, 0.38, 0, 0.505, -0.76, -0.05, 0, 0, 'trunk-inset');
  kit.box(M.seamK, 0.012, 0.008, 0.40, 0.382, 0.509, -0.76, -0.05, 0, 0, 'trunk-seam');
  kit.box(M.seamK, 0.012, 0.008, 0.40, -0.382, 0.509, -0.76, -0.05, 0, 0, 'trunk-seam');
  kit.box(M.bandK, 0.78, 0.018, 0.03, 0, 0.49, -1.0, 0, 0, 0, 'trunk-deck-edge');

  /* ======== greenhouse：座舱（顶板 + 倒角 / 窗楣 / 分段侧壁内倾 / A·B·C 柱） ======== */
  var slopeF = -Math.atan2(0.26, 0.34);                       /* 风挡后倾（≈ -0.653，参考图大倾角风挡） */
  var slopeR = Math.atan2(0.17, 0.34);                        /* 后窗前倾（≈ +0.462） */
  kit.box(M.paintY, 0.80, 0.034, 0.76, 0, 0.895, -0.25, 0, 0, 0, 'roof-slab');
  kit.box(M.paintY, 0.075, 0.024, 0.77, 0.376, 0.893, -0.25, 0, 0, -0.55, 'roof-chamfer');
  kit.box(M.paintY, 0.075, 0.024, 0.77, -0.376, 0.893, -0.25, 0, 0, 0.55, 'roof-chamfer');
  kit.box(M.paintY, 0.82, 0.034, 0.06, 0, 0.885, 0.10, 0, 0, 0, 'windshield-header');   /* 覆盖风挡顶缘 (z 0.117, y 0.87) */
  kit.box(M.paintY, 0.78, 0.034, 0.06, 0, 0.885, -0.435, 0, 0, 0, 'rear-window-header');
  kit.box(M.paintY, 0.02, 0.18, 0.76, 0.405, 0.585, -0.26, 0, 0, 0, 'cabin-side-wall-lower');
  kit.box(M.paintY, 0.02, 0.18, 0.76, -0.405, 0.585, -0.26, 0, 0, 0, 'cabin-side-wall-lower');
  kit.box(M.paintY, 0.02, 0.20, 0.76, 0.393, 0.775, -0.26, 0, 0, -0.15, 'cabin-side-wall-upper');
  kit.box(M.paintY, 0.02, 0.20, 0.76, -0.393, 0.775, -0.26, 0, 0, 0.15, 'cabin-side-wall-upper');
  kit.box(M.paintY, 0.05, 0.42, 0.06, 0.415, 0.70, 0.245, slopeF, 0, 0, 'a-pillar');
  kit.box(M.paintY, 0.05, 0.42, 0.06, -0.415, 0.70, 0.245, slopeF, 0, 0, 'a-pillar');
  kit.box(M.paintY, 0.05, 0.38, 0.05, 0.412, 0.70, -0.08, 0, 0, 0, 'b-pillar');
  kit.box(M.paintY, 0.05, 0.38, 0.05, -0.412, 0.70, -0.08, 0, 0, 0, 'b-pillar');
  kit.box(M.paintY, 0.05, 0.40, 0.06, 0.40, 0.70, -0.52, slopeR, 0, 0, 'c-pillar');
  kit.box(M.paintY, 0.05, 0.40, 0.06, -0.40, 0.70, -0.52, slopeR, 0, 0, 'c-pillar');
  kit.box(M.grilleK, 0.80, 0.03, 0.05, 0, 0.515, 0.36, 0, 0, 0, 'cowl-vent');
  kit.box(M.paintY, 0.80, 0.05, 0.03, 0, 0.515, -0.66, 0, 0, 0, 'rear-cabin-seal');

  /* ======== glass：风挡 / 后窗 / 侧窗 ×4（斜置薄盒，微透） ======== */
  kit.box(M.glass, 0.82, 0.44, 0.02, 0, 0.695, 0.245, slopeF, 0, 0, 'windshield-glass');
  kit.box(M.glass, 0.78, 0.40, 0.02, 0, 0.695, -0.52, slopeR, 0, 0, 'rear-glass-panel');
  kit.box(M.glass, 0.016, 0.26, 0.28, 0.40, 0.715, 0.14, 0, 0, -0.14, 'door-glass');
  kit.box(M.glass, 0.016, 0.26, 0.28, -0.40, 0.715, 0.14, 0, 0, 0.14, 'door-glass');
  kit.box(M.glass, 0.016, 0.26, 0.42, 0.40, 0.715, -0.30, 0, 0, -0.14, 'door-glass');
  kit.box(M.glass, 0.016, 0.26, 0.42, -0.40, 0.715, -0.30, 0, 0, 0.14, 'door-glass');
  /* 侧窗下沿深色窗台线（参考图门顶黑色腰线读感） */
  kit.box(M.seamK, 0.03, 0.016, 0.80, 0.412, 0.583, -0.26, 0, 0, 0, 'beltline-trim');
  kit.box(M.seamK, 0.03, 0.016, 0.80, -0.412, 0.583, -0.26, 0, 0, 0, 'beltline-trim');

  /* ======== interior-hint：内饰剪影 + 计价器（透过微透玻璃的座舱读感） ======== */
  kit.box(M.innerK, 0.70, 0.10, 0.12, 0, 0.56, 0.26, 0, 0, 0, 'dashboard');
  kit.box(M.meter, 0.10, 0.05, 0.04, -0.10, 0.63, 0.245, 0, 0, 0, 'fare-meter');   /* 计价器（屏面朝 +Z） */
  kit.box(M.innerK, 0.22, 0.28, 0.10, 0.17, 0.66, -0.12, 0, 0, 0, 'seat-front');
  kit.box(M.innerK, 0.22, 0.28, 0.10, -0.17, 0.66, -0.12, 0, 0, 0, 'seat-front');
  kit.box(M.innerK, 0.13, 0.07, 0.06, 0.17, 0.83, -0.15, 0, 0, 0, 'headrest');
  kit.box(M.innerK, 0.13, 0.07, 0.06, -0.17, 0.83, -0.15, 0, 0, 0, 'headrest');
  kit.box(M.innerK, 0.60, 0.24, 0.12, 0, 0.63, -0.42, 0, 0, 0, 'rear-bench');
  kit.raw(M.innerK, new THREE.TorusGeometry(0.07, 0.012, 6, 12)
    .rotateX(-1.1).translate(0.17, 0.65, 0.19), 'steering-wheel');

  /* ======== checker-band：NYC 棋盘格腰线 ========
   * 参考图走向：低走车门 → 后门末端斜向上扬 → 沿后翼子板顶部（轮拱之上）水平至尾灯 → 绕至车尾。
   * 各段按长度缩放 UV 的 u 分量（纹理 24 格），保证格子在车身上恒为 ≈0.065 正方形。 */
  var CELL = 0.065;
  function checkerBox(w, h, d, x, y, z, rx, name) {
    var geo = new THREE.BoxGeometry(w, h, d);
    var along = (w > d) ? w : d;                              /* 带的走向长度 */
    var k = (along / CELL) / 24;                              /* u 缩放：实际格数 / 纹理格数 */
    var uv = geo.attributes.uv, i;
    for (i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * k);
    kit.add(M.checker, geo, x, y, z, rx, 0, 0, name);
  }
  var BX = 0.485;                                             /* 带中心 x（面 0.491，略突出肩块 0.4875） */
  for (var cs = -1; cs <= 1; cs += 2) {
    checkerBox(0.012, 0.13, 1.05, cs * BX, 0.325, 0.075, 0, 'checker-side');             /* 门带 z 0.60 → -0.45（自前轮拱后沿起，同参考图） */
    checkerBox(0.012, 0.13, 0.20, cs * BX, 0.375, -0.535, 0.53, 'checker-quarter');      /* 上扬段（≈30°） */
    checkerBox(0.012, 0.13, 0.45, cs * BX, 0.425, -0.845, 0, 'checker-quarter');         /* 后翼顶部水平段 → 尾角 */
  }
  checkerBox(0.70, 0.13, 0.012, 0, 0.425, -1.076, 0, 'checker-rear');                    /* 车尾横带（尾灯之间） */

  /* ======== wheels ×4 + wheel-arches：胎 / 轮辋环 / 大直径轮毂盖 / 中心盖 + 拱饰板 / 拱唇 ========
   * 轮面分层凸出（胎面 → 辋环 +0.005 → 轮毂盖 +0.011 → 中心盖 +0.015），
   * 保证侧视轮毂盖纹理可见（封闭胎端面不遮挡），层间 ≥0.004 无 z-fighting。 */
  var wheelPos = [[0.44, 0.62], [-0.44, 0.62], [0.44, -0.62], [-0.44, -0.62]];
  for (var wi = 0; wi < wheelPos.length; wi++) {
    var wx = wheelPos[wi][0], wz = wheelPos[wi][1], ax = (wx > 0 ? 1 : -1);
    /* thetaStart=PI/18：18 棱柱顶点相位校准，底棱精确触地（minY=0） */
    kit.add(M.rubber, new THREE.CylinderGeometry(0.205, 0.205, 0.15, 18, 1, false, PI / 18), wx, 0.205, wz, 0, 0, PI / 2, 'tire');
    kit.cyl(M.hubDark, 0.14, 0.14, 0.16, 18, wx, 0.205, wz, 0, 0, PI / 2, 'rim-barrel');         /* 暗钢辋环 */
    kit.cyl(M.hubCap, 0.105, 0.105, 0.172, 18, wx, 0.205, wz, 0, 0, PI / 2, 'hubcap-boltring');  /* 参考图大灰钢圈盖 */
    kit.cyl(M.grilleK, 0.022, 0.022, 0.18, 12, wx, 0.205, wz, 0, 0, PI / 2, 'hub-center-cap');
    kit.box(M.bandK, 0.008, 0.30, 0.40, ax * 0.494, 0.245, wz, 0, 0, 0, 'arch-panel');
    kit.torus(M.bandK, 0.225, 0.022, 6, 14, PI, ax * 0.498, 0.205, wz, 0, PI / 2, 0, 'arch-lip');
  }

  /* ======== roof-sign：出租车顶灯（真梯形截面挤出体 + 贴合斜面的前后棋盘面 + 端板/顶盖/基座） ======== */
  var SIGN_Z = -0.06, SIGN_Y0 = 0.932;                        /* 顶灯：车顶前 1/3 处（基座 -0.165..0.045 全落于顶板 -0.63..0.13） */
  var SIGN_H = 0.085, SIGN_ZB = 0.095, SIGN_ZT = 0.065;       /* 高 / 底半深 / 顶半深（顶窄底宽） */
  var signShape = new THREE.Shape();                          /* 截面（shape-x → 车 z，shape-y → 车 y） */
  signShape.moveTo(-SIGN_ZB, 0); signShape.lineTo(SIGN_ZB, 0);
  signShape.lineTo(SIGN_ZT, SIGN_H); signShape.lineTo(-SIGN_ZT, SIGN_H); signShape.closePath();
  var signCore = new THREE.ExtrudeGeometry(signShape, { depth: 0.32, bevelEnabled: false });
  signCore.rotateY(PI / 2).translate(-0.16, SIGN_Y0, SIGN_Z);  /* 沿车宽挤出并居中 */
  kit.raw(M.paintY, signCore, 'sign-core');
  var signSlope = Math.atan2(SIGN_ZB - SIGN_ZT, SIGN_H);      /* 斜面倾角 ≈0.339 */
  var faceZ = (SIGN_ZB + SIGN_ZT) / 2, faceY = SIGN_Y0 + SIGN_H / 2;
  var offN = 0.007, offY = offN * sin(signSlope), offZ = offN * cos(signSlope);
  kit.box(signM, 0.28, 0.076, 0.012, 0, faceY + offY, SIGN_Z + faceZ + offZ, -signSlope, 0, 0, 'sign-face');  /* 前棋盘面（贴斜面） */
  kit.box(signM, 0.28, 0.076, 0.012, 0, faceY + offY, SIGN_Z - faceZ - offZ, signSlope, 0, 0, 'sign-face');   /* 后棋盘面 */
  kit.box(M.paintY, 0.008, 0.07, 0.15, 0.164, faceY, SIGN_Z, 0, 0, 0, 'sign-endcap');                          /* 端板 ×2 */
  kit.box(M.paintY, 0.008, 0.07, 0.15, -0.164, faceY, SIGN_Z, 0, 0, 0, 'sign-endcap');
  kit.box(M.paintY, 0.30, 0.012, 0.12, 0, SIGN_Y0 + SIGN_H + 0.006, SIGN_Z, 0, 0, 0, 'sign-top-cap');        /* 顶盖 */
  kit.box(M.paintY, 0.34, 0.02, 0.21, 0, 0.922, SIGN_Z, 0, 0, 0, 'sign-base');                                /* 基座 */

  /* ======== front-fascia：宽幅格栅（背板+边框+5 横条+双竖隔）+ 大灯 + 杠角示宽灯 ======== */
  kit.box(M.grilleK, 0.46, 0.17, 0.02, 0, 0.40, 1.072, 0, 0, 0, 'grille-backing');
  kit.box(M.grilleK, 0.48, 0.02, 0.04, 0, 0.492, 1.085, 0, 0, 0, 'grille-bezel-top');
  kit.box(M.grilleK, 0.48, 0.02, 0.04, 0, 0.308, 1.085, 0, 0, 0, 'grille-bezel-bottom');
  kit.box(M.grilleK, 0.02, 0.145, 0.04, 0.23, 0.40, 1.085, 0, 0, 0, 'grille-bezel-l');
  kit.box(M.grilleK, 0.02, 0.145, 0.04, -0.23, 0.40, 1.085, 0, 0, 0, 'grille-bezel-r');
  for (var si = 0; si < 5; si++) {
    kit.box(M.bandK, 0.42, 0.018, 0.014, 0, 0.335 + si * 0.0325, (si % 2) ? 1.096 : 1.088, 0, 0, 0, 'grille-slat');
  }
  kit.box(M.bandK, 0.012, 0.15, 0.012, 0.115, 0.40, 1.098, 0, 0, 0, 'grille-divider');
  kit.box(M.bandK, 0.012, 0.15, 0.012, -0.115, 0.40, 1.098, 0, 0, 0, 'grille-divider');
  kit.box(M.grilleK, 0.19, 0.14, 0.03, 0.34, 0.41, 1.072, 0, 0, 0, 'headlamp-bezel');    /* 参考图大矩形灯 */
  kit.box(M.grilleK, 0.19, 0.14, 0.03, -0.34, 0.41, 1.072, 0, 0, 0, 'headlamp-bezel');
  kit.box(headM, 0.16, 0.11, 0.014, 0.34, 0.41, 1.099, 0, 0, 0, 'headlamp-lens');
  kit.box(headM, 0.16, 0.11, 0.014, -0.34, 0.41, 1.099, 0, 0, 0, 'headlamp-lens');
  kit.box(M.amber, 0.09, 0.075, 0.02, 0.415, 0.28, 1.182, 0, 0, 0, 'corner-marker');
  kit.box(M.amber, 0.09, 0.075, 0.02, -0.415, 0.28, 1.182, 0, 0, 0, 'corner-marker');
  kit.plane(M.plate, 0.28, 0.09, 0, 0.24, 1.215, 0, 0, 0, 'front-plate');

  /* ======== rear-fascia：竖置红尾灯 ×2 + 下琥珀灯 ×2 + 后牌照（杠面） ======== */
  kit.box(tailM, 0.055, 0.16, 0.024, 0.42, 0.44, -1.078, 0, 0, 0, 'tail-lens');
  kit.box(tailM, 0.055, 0.16, 0.024, -0.42, 0.44, -1.078, 0, 0, 0, 'tail-lens');
  kit.box(M.amber, 0.055, 0.05, 0.024, 0.42, 0.36, -1.078, 0, 0, 0, 'tail-amber-cell');
  kit.box(M.amber, 0.055, 0.05, 0.024, -0.42, 0.36, -1.078, 0, 0, 0, 'tail-amber-cell');
  kit.plane(M.plate, 0.30, 0.10, 0, 0.24, -1.181, 0, PI, 0, 'rear-plate');

  /* ======== bumpers：前杠 + 下唇 + 包角 ×2；后杠 + 下唇 + 包角 ×2 ======== */
  kit.box(M.bandK, 1.00, 0.15, 0.14, 0, 0.24, 1.135, 0, 0, 0, 'bumper-front');
  kit.box(M.bandK, 0.96, 0.05, 0.10, 0, 0.14, 1.145, 0, 0, 0, 'bumper-front-lip');
  kit.box(M.bandK, 0.10, 0.17, 0.16, 0.46, 0.24, 1.10, 0, 0, 0, 'bumper-front-corner');
  kit.box(M.bandK, 0.10, 0.17, 0.16, -0.46, 0.24, 1.10, 0, 0, 0, 'bumper-front-corner');
  kit.box(M.bandK, 0.99, 0.15, 0.12, 0, 0.24, -1.115, 0, 0, 0, 'bumper-rear');
  kit.box(M.bandK, 0.95, 0.05, 0.09, 0, 0.14, -1.105, 0, 0, 0, 'bumper-rear-lip');
  kit.box(M.bandK, 0.10, 0.17, 0.14, 0.46, 0.24, -1.09, 0, 0, 0, 'bumper-rear-corner');
  kit.box(M.bandK, 0.10, 0.17, 0.14, -0.46, 0.24, -1.09, 0, 0, 0, 'bumper-rear-corner');

  /* ======== mirrors：外后视镜 ×2（斜臂 + 黑壳 + 后向镜面） ======== */
  kit.box(M.grilleK, 0.045, 0.02, 0.03, 0.43, 0.645, 0.30, 0, 0, -0.2, 'mirror-arm');
  kit.box(M.grilleK, 0.045, 0.02, 0.03, -0.43, 0.645, 0.30, 0, 0, 0.2, 'mirror-arm');
  kit.box(M.grilleK, 0.05, 0.065, 0.05, 0.455, 0.66, 0.30, 0, 0, 0, 'mirror-head');
  kit.box(M.grilleK, 0.05, 0.065, 0.05, -0.455, 0.66, 0.30, 0, 0, 0, 'mirror-head');
  kit.box(M.hubDark, 0.044, 0.05, 0.008, 0.455, 0.66, 0.272, 0, 0, 0, 'mirror-face');
  kit.box(M.hubDark, 0.044, 0.05, 0.008, -0.455, 0.66, 0.272, 0, 0, 0, 'mirror-face');

  /* ======== door-trim：门把手 ×4 + 门缝 ×6 ======== */
  var handleZ = [0.16, -0.22];
  for (var s = -1; s <= 1; s += 2) {
    for (var hi = 0; hi < handleZ.length; hi++) {
      kit.box(M.seamK, 0.02, 0.012, 0.11, s * 0.483, 0.44, handleZ[hi], 0, 0, 0, 'door-handle-base');
      kit.box(M.seamK, 0.016, 0.02, 0.095, s * 0.492, 0.452, handleZ[hi], 0, 0, 0, 'door-handle-grip');
    }
    var seamZ = [0.36, -0.05, -0.40];
    for (var di = 0; di < seamZ.length; di++) {
      kit.box(M.seamK, 0.012, 0.26, 0.012, s * 0.4795, 0.36, seamZ[di], 0, 0, 0, 'door-seam');
    }
  }

  /* ======== exhaust：排气管（左后横管 + 尾口） ======== */
  kit.cyl(M.chrome, 0.02, 0.02, 0.40, 12, -0.30, 0.125, -0.88, PI / 2, 0, 0, 'exhaust-pipe');
  kit.cyl(M.chrome, 0.025, 0.025, 0.08, 12, -0.30, 0.125, -1.11, PI / 2, 0, 0, 'exhaust-tip');

  /* ======== 合并落地：每材质桶 → 1 Mesh ======== */
  var meshCount = kit.flush(g);

  /* ======== interaction：顶灯/大灯/尾灯发光动画（波动 ≤0.25，240 帧无 NaN） ======== */
  g.userData.anim = [
    function (t) {
      var pulse = 0.5 + 0.5 * sin(t * 2.2);
      signM.emissiveIntensity = 0.12 + 0.22 * pulse;             /* 顶灯暖光呼吸 */
      headM.emissiveIntensity = 0.5 + 0.12 * sin(t * 1.3);       /* 大灯微呼吸 */
      tailM.emissiveIntensity = 0.14 + 0.12 * pulse;             /* 尾灯同相微光 */
    }
  ];

  /* ======== 元数据：部件清点（smoke 断言用） ======== */
  g.userData.stats = kit.tally;
  g.userData.stats.__parts = kit.parts;
  g.userData.stats.__meshes = meshCount;

  return g;
};
})();
