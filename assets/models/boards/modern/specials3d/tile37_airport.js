/* =====================================================================================
 * 大富翁·富贵人生 —— 现代写实风棋盘 boards/modern/specials3d/tile37_airport.js  格 37「国际机场」
 * -------------------------------------------------------------------------------------
 * 视觉基准：refs/modern/special_37.png（2020s 单象限，写实航拍 3/4 视角现代国际机场）：
 *   航站楼    ：全长波浪形银白金属屋面（沿纵向 4.0 个波形起伏 + 真实波谷处深色天窗带 ×4 通长
 *               + 屋面天窗盒 ×2/空调机组 ×2 + 前后白色波浪檐口封边 + 山墙顶随波白色封边），檐口下
 *               通高明亮蓝灰玻璃幕墙（两侧面，顶部随波形起伏，密竖梃/横档贴图 + 浅色铝竖梃 ×15）
 *               + 两端玻璃山墙（白边框 + 竖梃 ×3）+ 深色入口门樘 ×3 + 幕墙内暖光候机厅
 *   陆侧(+z)  ：加宽入口雨棚（1.52 白板 + 白柱列 ×5 +「国际机场」站名牌）+ 浅色石板广场
 *               + 弧形落客弯道（7 段弧盒 + 双弧路缘 + 东西直线引道 + 随弧斑马线 + 沿弧出租车 ×4
 *               + 机场大巴）+ open 式两层停车楼（白板 + 柱列 ×6 + 女儿墙 + 顶层车 ×5/二层车 ×2
 *               + 自西引道起坡的接坡 + 坡墩 ×2）+ 行道树 ×15 + 绿篱/灌木 + 路灯 ×2
 *   空侧(−z)  ：大范围混凝土停机坪（板缝 + 轮痕）+ 三机位标线（黄中线直段 + 切向二次弯引沿线
 *               ×3 汇入贯通滑行道转弯弧线 / 红停止线 ×3 / 白机位框角 ×12）+ 设备限制红线 + 服务道
 *               边线 + 封闭式登机桥 ×4（玻璃隧道 + 白顶 + 环梁箍带 ×3 + 双支撑柱 + 行走轮架 +
 *               端头登机车 + 加高 rotunda）+ 停场客机（加粗机身 + 白身蓝尾 + 驾驶舱窗 + 客窗带
 *               + 蓝腹线 + 两段后掠翼 + 翼梢小翼 + 双发（进气唇环 + 风扇盘）+ 起落架）
 *               + 地面车辆 ×19（摆渡/牵引+拖板列 ×3 组/客梯/加油/装卸/餐车/工作车）+ 环形灯盘高杆灯 ×5
 *   东端      ：现役塔台（加宽裙座 + 竖罗纹细身 + 收腰外扩过渡锥 + 上宽深色玻璃驾驶室 + 竖分格
 *               白梃 ×6 + 外挑白圆盘 + 锥顶 + 天线桅杆 + 红色信标）+ 塔台裙房（竖条窗 + 平顶）
 *
 * 注册：window.Special3DModern[37]() → THREE.Group（每次调用全新实例）
 * 契约：占地 ≤2.7×2.7（实测 2.68×2.68，高 1.48 塔台信标顶）；底面 y=0；正面 +z（航站楼陆侧/
 *       落客区朝 +z，停机坪与客机在 −z 空侧）；draw call ≤60；三角 ≤28k；Canvas 纹理 ≤256px；
 *       源码零 Math.random（mulberry32 种子流）；
 *       动画 2 项：塔台信标/机腹信标红色闪烁 + 候机厅暖光呼吸（≤2 项封顶，幅度 ≤0.25）。
 *
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils，对齐已验收范例
 *       tile5_station.js / tile15_hsr_station.js / tile25_ferry_harbor.js）——静态件全部合并为
 *       每材质 1 个 mesh（23 材质桶 + 站名牌/内景暖光 ×2/信标 ×3 = 29 draw call，三角 ≈17.8k）；
 *       波浪屋面/波形幕墙/檐口/山墙用通用参数化曲面 surfGeo（nu×nv 网格，UV 按世界坐标烘焙）；
 *       波谷天窗带位置由波形函数差分变号求极小点确定（确定性）；弧形标线/弧形车道用小盒分段拼弧；
 *       接坡用两点定位分段盒（对齐 tile15 seg）；文件结构对齐 boards/modern/specials3d/tile15_hsr_station.js。
 *
 * 本轮 R1→R2 变更摘要（对照 r1 渲染与参考图差距清单逐条清偿）：
 *   ①波谷天窗带加宽 0.05→0.062、脊帽收窄降高（深色带露出，参考波谷深色带清晰）
 *   ②幕墙玻璃贴图提亮 + 透明度 0.5→0.6 + 内衬提亮为深蓝灰 'liner'，暖光内景加宽提亮
 *   ③塔身改专用竖罗纹贴图 texRib（消除横向环纹）+ 塔身加高 0.778→0.808、驾驶室加高
 *     0.088→0.10、上下檐圈加厚、锥顶/桅杆/信标随升（塔顶 ≈1.47）
 *   ④停车楼降高 0.30→0.248（两层）改 open 式：白色薄板 + 明露柱列 ×6 + 前后矮女儿墙
 *     + 顶层车 ×3 / 二层车 ×2（透过柱列可见）+ 竖窗背板
 *   ⑤停机坪标线加密：双机位（主位 + 备位机位框）、引沿线加宽 0.018、机头后红色警戒线
 *     + 前沿黄色边界线
 *   ⑥波形 3.5→4.0、波幅 0.05→0.06（贴近参考 4 波显著起伏）
 *   ⑦屋面加天窗盒 ×2（陆侧半区，随坡斜置）
 *   ⑧山墙端部补竖梃 ×3（随坡变高）
 *   ⑨登机桥 4 端头退至 z −0.55（对准 L1 舱门，不再越过机头）
 *   ⑩高杆灯灯头加大加厚、出租车 3→4 辆
 * R2→R3（对照 r2 渲染再校）：⑪波谷天窗带延长至满进深 0.54→0.64 并修正斜置参数（rz=波面切线角、
 *   rx=泄水坡角，此前误传入 rx 且未跟随 z 向坡度）⑫幕墙竖梃改浅色铝梃 'rail'（参考竖梃浅色，
 *   原钢灰偏暗）⑬雨棚柱列由车道中央移至路缘岛 z 0.635 ⑭内景暖光 0.55→0.62
 *   ⑮脊帽/天窗带长度收至 0.58/0.56（此前 0.66 端头刺出檐口）⑯高杆灯减细降高 0.72→0.66
 *   ⑰雨棚 1.46×0.30→1.20×0.26、柱 5→4、站名牌 0.54→0.48（入口不再压满立面）。
 * 第二轮精修 R3→R4（用户复评未到 90，以参考图重新逐部位找差距 15 条并清偿）：
 *   ①修复波谷求极值 bug（旧法把每个上升采样点都收入，4 条天窗带全挤在屋面西端）→ 差分变号求极小点，
 *     天窗带真正落位 4 个波谷 ②幕墙玻璃贴图 128→256 提亮 + 密竖梃(24px)/层间横档/斜向天空反光
 *   ③屋面/玻璃材质参数重调、屋面贴图提亮 ④停机坪/广场地面基色改冷调浅灰 ⑤波幅 0.06→0.065、屋面
 *     细分 48×4→64×6、幕墙 48→56（剪影更圆润）⑥山墙顶加随波白色封边 ⑦波谷天窗带加宽 0.062→0.078
 *   ⑧塔台重做：加宽裙座 + 细身 + 收腰外扩过渡锥 + 上宽外扩驾驶室 + 外挑白圆盘 + 锥顶 + 桅杆
 *   ⑨登机桥加結構感：环梁箍带 ×3 + 每桥双支撑柱 + 端头行走轮架 + rotunda 加高加窗带 + 登机车加大
 *   ⑩客机重做：机身 r0.045→0.048、驾驶舱窗收小、两段后掠翼 + 翼梢小翼、发动机加大、尾翼加大、轮胎贴地
 *   ⑪引沿线改弧形 ⑫高杆灯改环形灯盘（灯头 ×4 + 反光盘）⑬新增加油车/客梯车/桥 2 拖板列/沿楼工作车 ×2
 *   ⑭雨棚 1.20→1.52 横贯入口、柱 4→5 ⑮行道树 9→15（停车楼两翼后排树阵）+ 接坡加中墩。
 * R4→R5（对照 r4 渲染再找 8 条残余差距清偿）：
 *   ①屋面金属度 0.52→0.2（无环境反射时高金属度发灰读作灰瓦，参考为亮银白）+ 波谷脊帽 0.052→0.034 露出
 *     深色带 ②幕墙 metalness 0.42→0.15 / opacity 0.5 / 内衬 #39424c→#5c6d7a 提亮通透 + 暖光 0.62→0.82
 *   ③发动机进气唇环收窄 + 加风扇盘（侧视不再是黑洞）④尾翼 0.27→0.23 收敛比例 + 机腹信标移至机腹下
 *   ⑤机位白框角加粗 0.012→0.016 ⑥引沿线改「中线直段 + 起点切向二次弯」+ 新增贯通滑行道转弯弧线
 *     + 第 3 机位（对准桥 1）标线/停止线/框角 ⑦陆侧落客车道改弧形弯道（圆心 (0,1.90) R1.16，7 段弧盒 +
 *     双弧路缘 + 东西直线引道 + 随弧斑马线 + 沿弧出租车/大巴），接坡改自西引道起坡，树阵/路灯/雨棚柱避让
 *   ⑧塔台驾驶室加竖分格白梃 ×6；另补客机旁餐车/左翼后拖板列/场边工作车/机位 3 牵引车、停车楼顶层 +2 车。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[boards/modern/specials3d/tile37_airport] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

window.Special3DModern = window.Special3DModern || {};

var PI = Math.PI;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }

/* ================= 0. 确定性伪随机（mulberry32，全文件零 Math.random） ================= */
function RNG(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================= 1. Canvas 程序纹理（≤512px；懒建单例） ================= */
var _tex = {};
function cvTex(key, w, h, draw, linear) {
  if (_tex[key]) return _tex[key];
  var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  draw(cv.getContext('2d'), w, h, RNG(key.length * 1013 + w * 7 + h * 31));
  var t = new THREE.CanvasTexture(cv);
  t.encoding = linear ? THREE.LinearEncoding : THREE.sRGBEncoding;
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  _tex[key] = t; return t;
}
function speckle(g, w, h, rnd, n, dark, light, mw, mh) {
  for (var i = 0; i < n; i++) {
    g.fillStyle = i % 2 ? dark : light;
    g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 1 + ((rnd() * mw) | 0), 1 + ((rnd() * mh) | 0));
  }
}
/* 停机坪混凝土：浅灰大板 + 十字分缝 + 轮胎擦痕 + 油斑 + 伸缩缝 */
function texApron() {
  return cvTex('s37apron', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#b9bcb9'; g.fillRect(0, 0, w, h);
    var r, c, s = 64;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.92 + rnd() * 0.16, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(201 * v) + ',' + Math.round(202 * v) + ',' + Math.round(197 * v) + ')';
      g.fillRect(x + 3, y + 3, s - 6, s - 6);
      g.fillStyle = 'rgba(250,250,244,0.22)'; g.fillRect(x + 3, y + 3, s - 6, 2); g.fillRect(x + 3, y + 3, 2, s - 6);
      g.fillStyle = 'rgba(72,72,66,0.24)'; g.fillRect(x + 3, y + s - 5, s - 6, 2); g.fillRect(x + s - 5, y + 3, 2, s - 6);
    }
    for (var i = 0; i < 7; i++) {                                                         /* 轮胎擦痕 */
      g.strokeStyle = 'rgba(60,60,58,' + (0.10 + rnd() * 0.12).toFixed(2) + ')'; g.lineWidth = 3 + ((rnd() * 5) | 0);
      g.beginPath(); g.moveTo(rnd() * w, rnd() * h); g.lineTo(rnd() * w, rnd() * h); g.stroke();
    }
    for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(96,94,84,0.14)'; g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 10 + ((rnd() * 26) | 0), 8 + ((rnd() * 16) | 0)); }
    speckle(g, w, h, rnd, 150, 'rgba(96,94,88,0.16)', 'rgba(236,236,230,0.18)', 8, 5);
  });
}
/* 广场石板：浅暖灰大板 + 十字分缝 + 受光/阴影边 + 色差斑 */
function texPave() {
  return cvTex('s37pave', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#c0c2bb'; g.fillRect(0, 0, w, h);
    var r, c, s = 64;
    for (r = 0; r < 4; r++) for (c = 0; c < 4; c++) {
      var v = 0.93 + rnd() * 0.14, x = c * s, y = r * s;
      g.fillStyle = 'rgb(' + Math.round(212 * v) + ',' + Math.round(213 * v) + ',' + Math.round(206 * v) + ')';
      g.fillRect(x + 3, y + 3, s - 6, s - 6);
      g.fillStyle = 'rgba(255,253,246,0.32)'; g.fillRect(x + 3, y + 3, s - 6, 2); g.fillRect(x + 3, y + 3, 2, s - 6);
      g.fillStyle = 'rgba(88,84,74,0.22)'; g.fillRect(x + 3, y + s - 5, s - 6, 2); g.fillRect(x + s - 5, y + 3, 2, s - 6);
      if (rnd() < 0.3) { g.fillStyle = 'rgba(130,126,112,0.14)'; g.fillRect(x + 8 + ((rnd() * 24) | 0), y + 8 + ((rnd() * 24) | 0), 12 + ((rnd() * 22) | 0), 7 + ((rnd() * 14) | 0)); }
    }
    speckle(g, w, h, rnd, 120, 'rgba(110,106,96,0.15)', 'rgba(242,240,232,0.18)', 12, 6);
  });
}
/* 沥青车道：深灰底 + 碎斑 + 中间白虚线（u 沿路长）+ 两侧边缘实线 */
function texRoad() {
  return cvTex('s37road', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#54585c'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 150, 'rgba(30,32,36,0.3)', 'rgba(120,124,128,0.24)', 4, 3);
    g.fillStyle = '#e8e6e0';
    for (var x = 6; x < w; x += 42) g.fillRect(x, 62, 22, 4);
    g.fillStyle = 'rgba(232,230,224,0.7)'; g.fillRect(0, 10, w, 3); g.fillRect(0, h - 13, w, 3);
  });
}
/* 金属板：银白直立锁边（细缝双线 + 板面亮色差 + 淡横向咬口）——屋面/塔身罗纹共用 */
function texVault() {
  return cvTex('s37vault', 256, 256, function (g, w, h, rnd) {
    g.fillStyle = '#d2d9de'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 16; i++) {
      var x = i * 16, v = 0.97 + rnd() * 0.09;
      g.fillStyle = 'rgb(' + Math.round(219 * v) + ',' + Math.round(226 * v) + ',' + Math.round(233 * v) + ')';
      g.fillRect(x + 2, 0, 14, h);
      g.fillStyle = 'rgba(252,253,255,0.65)'; g.fillRect(x + 4, 0, 2, h);
      g.fillStyle = 'rgba(130,140,150,0.32)'; g.fillRect(x, 0, 1, h);
      g.fillStyle = 'rgba(162,172,182,0.25)'; g.fillRect(x + 15, 0, 1, h);
    }
    g.fillStyle = 'rgba(140,150,160,0.12)';
    for (i = 0; i < 8; i++) g.fillRect(0, i * 32 + 30, w, 2);
    speckle(g, w, h, rnd, 60, 'rgba(140,150,160,0.12)', 'rgba(252,253,255,0.24)', 6, 3);
  });
}
/* 浅色混凝土/铝板墙：板缝 + 色斑 + 竖向雨水痕 + 根部污带 */
function texConc() {
  return cvTex('s37conc', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#d8d6ce'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 110, 'rgba(150,148,140,0.2)', 'rgba(246,244,238,0.24)', 4, 3);
    g.fillStyle = 'rgba(96,96,92,0.2)'; g.fillRect(0, 63, w, 2); g.fillRect(63, 0, 2, h);
    for (var i = 0; i < 4; i++) { g.fillStyle = 'rgba(140,140,134,0.15)'; g.fillRect((rnd() * w) | 0, 0, 2 + ((rnd() * 3) | 0), 30 + ((rnd() * 60) | 0)); }
    g.fillStyle = 'rgba(100,98,92,0.16)'; g.fillRect(0, h - 12, w, 12);
  });
}
/* 竖条窗带（停车楼/裙房）：白墙 + 窄竖向玻璃条 + 窗台影 + 横向层间梁 */
function texWin() {
  return cvTex('s37win', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#e8e6de'; g.fillRect(0, 0, w, h);
    speckle(g, w, h, rnd, 50, 'rgba(176,174,164,0.2)', 'rgba(250,248,242,0.2)', 8, 5);
    var i;
    for (i = 0; i < 4; i++) {
      var x = i * 32;
      g.fillStyle = '#46607a'; g.fillRect(x + 11, 8, 11, 106);
      g.fillStyle = 'rgba(205,226,238,0.6)'; g.fillRect(x + 12, 10, 3, 102);
      g.fillStyle = 'rgba(28,44,58,0.55)'; g.fillRect(x + 19, 8, 3, 106);
      g.fillStyle = 'rgba(244,242,234,0.95)'; g.fillRect(x + 9, 114, 15, 3);
      g.fillStyle = 'rgba(70,70,66,0.3)'; g.fillRect(x + 9, 117, 15, 2);
    }
    g.fillStyle = 'rgba(100,102,100,0.25)';
    for (i = 0; i < 3; i++) g.fillRect(0, 8 + i * 38, w, 2);
  });
}
/* 幕墙玻璃：明亮蓝灰天空反射竖向渐变 + 密竖梃 + 横档 + 斜高光带（参考玻璃亮、通透、梃密） */
function texGlass() {
  return cvTex('s37glass', 256, 256, function (g, w, h) {
    var x, y;
    for (x = 0; x < w; x++) {
      var t = x / w, v = 0.94 + 0.14 * Math.sin(t * 6.283 * 1.35 + 0.4) + 0.05 * Math.sin(t * 44);
      g.fillStyle = 'rgb(' + Math.round(178 * v) + ',' + Math.round(210 * v) + ',' + Math.round(230 * v) + ')';
      g.fillRect(x, 0, 1, h);
    }
    g.fillStyle = 'rgba(255,255,255,0.20)';                                             /* 斜向天空反光 */
    for (y = -w; y < h; y += 96) { g.beginPath(); g.moveTo(0, y + 24); g.lineTo(w, y); g.lineTo(w, y + 34); g.lineTo(0, y + 58); g.fill(); }
    g.fillStyle = 'rgba(255,255,255,0.55)'; g.fillRect(30, 0, 10, h); g.fillRect(150, 0, 5, h); g.fillRect(216, 0, 7, h);
    g.fillStyle = 'rgba(38,58,72,0.16)';                                                /* 横档（层间） */
    for (y = 0; y < h; y += 42) g.fillRect(0, y, w, 3);
    g.strokeStyle = 'rgba(236,244,250,0.6)'; g.lineWidth = 2;                           /* 密竖梃 */
    for (x = 0; x <= w; x += 24) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  });
}
/* 塔身竖罗纹：白底 + 竖向双线凹槽（无横向线，避免环纹感） */
function texRib() {
  return cvTex('s37rib', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#d4d9de'; g.fillRect(0, 0, w, h);
    var i;
    for (i = 0; i < 8; i++) {
      var x = i * 16, v = 0.97 + rnd() * 0.06;
      g.fillStyle = 'rgb(' + Math.round(222 * v) + ',' + Math.round(227 * v) + ',' + Math.round(232 * v) + ')';
      g.fillRect(x + 3, 0, 12, h);
      g.fillStyle = 'rgba(255,255,255,0.7)'; g.fillRect(x + 5, 0, 2, h);
      g.fillStyle = 'rgba(120,130,140,0.4)'; g.fillRect(x + 2, 0, 1, h);
      g.fillStyle = 'rgba(150,160,170,0.3)'; g.fillRect(x + 14, 0, 1, h);
    }
    speckle(g, w, h, rnd, 40, 'rgba(150,158,166,0.12)', 'rgba(252,253,255,0.2)', 5, 4);
  });
}
/* 树冠叶斑（三层明暗叶簇） */
function texLeaf() {
  return cvTex('s37leaf', 128, 128, function (g, w, h, rnd) {
    g.fillStyle = '#7f9c5e'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 90; i++) {
      var v = rnd();
      g.fillStyle = v < 0.5 ? 'rgba(46,78,34,0.42)' : v < 0.8 ? 'rgba(150,186,100,0.5)' : 'rgba(200,216,140,0.35)';
      g.fillRect((rnd() * w) | 0, (rnd() * h) | 0, 4 + ((rnd() * 12) | 0), 3 + ((rnd() * 8) | 0));
    }
  });
}
/* 候机厅内景（map + emissiveMap）：暖光地面/立柱/旅客/吊顶灯带/值机岛 */
function texHall() {
  return cvTex('s37hall', 256, 128, function (g, w, h, rnd) {
    g.fillStyle = '#f7dfae'; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(214,166,96,0.5)'; g.fillRect(0, 86, w, 42);
    var i;
    for (i = 0; i < 7; i++) {
      var x = 14 + i * 36 + ((rnd() * 6) | 0);
      g.fillStyle = 'rgba(130,100,58,0.5)'; g.fillRect(x, 14, 7, 76);
      g.fillStyle = 'rgba(255,244,208,0.55)'; g.fillRect(x + 1, 14, 2, 76);
    }
    for (i = 0; i < 22; i++) {
      g.fillStyle = i % 3 ? 'rgba(96,64,32,0.5)' : 'rgba(54,86,118,0.45)';
      g.fillRect(8 + ((rnd() * (w - 20)) | 0), 90 + ((rnd() * 26) | 0), 4 + ((rnd() * 4) | 0), 6 + ((rnd() * 5) | 0));
    }
    g.fillStyle = 'rgba(255,250,232,0.95)';
    for (i = 0; i < 8; i++) g.fillRect(10 + i * 31, 4, 18, 4);
    g.fillStyle = 'rgba(255,218,156,0.55)'; g.fillRect(0, 0, w, 10);
  });
}

/* ================= 2. 材质（静态件模块级单例；发光件每实例新建） ================= */
function M(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0)
  });
  if (o.map) m.map = o.map;
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.tr !== undefined) { m.transparent = true; m.opacity = o.tr; }
  if (o.ds) m.side = THREE.DoubleSide;
  return m;
}
var MATS = null;
function mats() {
  if (MATS) return MATS;
  MATS = {
    apron:   M('#ffffff', { map: texApron(), rough: 0.96 }),
    pave:    M('#ffffff', { map: texPave(), rough: 0.95 }),
    road:    M('#ffffff', { map: texRoad(), rough: 0.97 }),
    vault:   M('#ffffff', { map: texVault(), rough: 0.38, metal: 0.2, ds: true }),
    rib:     M('#ffffff', { map: texRib(), rough: 0.45, metal: 0.3, ds: true }),
    glass:   M('#ffffff', { map: texGlass(), rough: 0.05, metal: 0.15, tr: 0.5, ds: true }),
    cglass:  M('#243a48', { rough: 0.12, metal: 0.6, ds: true }),
    liner:   M('#5c6d7a', { rough: 0.75 }),
    conc:    M('#ffffff', { map: texConc(), rough: 0.9, ds: true }),
    winWall: M('#ffffff', { map: texWin(), rough: 0.8, ds: true }),
    white:   M('#f0efe9', { rough: 0.6 }),
    twhite:  M('#f4f6f7', { rough: 0.32, metal: 0.12 }),
    steel:   M('#828c94', { rough: 0.45, metal: 0.7 }),
    dark:    M('#2b3034', { rough: 0.6, metal: 0.2 }),
    rail:    M('#aab2b8', { rough: 0.3, metal: 0.85 }),
    blue:    M('#2e5f9c', { rough: 0.42, metal: 0.15 }),
    silver:  M('#b8bfc4', { rough: 0.35, metal: 0.6 }),
    yellow:  M('#d9b93a', { rough: 0.55 }),
    red:     M('#b03a2e', { rough: 0.55 }),
    green:   M('#ffffff', { map: texLeaf(), rough: 0.95 }),
    green2:  M('#a9b894', { map: texLeaf(), rough: 0.95 }),
    hedge:   M('#5d7a3f', { rough: 1 }),
    trunk:   M('#8c7050', { rough: 0.9 })
  };
  return MATS;
}

/* ================= 3. 按材质分桶合并（r147 无 BufferGeometryUtils，手写） ================= */
function Bag() { this.b = {}; }
Bag.prototype.put = function (key, geo, m) {
  var g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (m) g.applyMatrix4(m);
  (this.b[key] || (this.b[key] = [])).push(g);
};
Bag.prototype.build = function (group) {
  var Ms = mats(), n = 0;
  for (var k in this.b) {
    var geos = this.b[k], mat = Ms[k]; if (!geos.length || !mat) continue;
    var pos = [], nor = [], uv = [];
    for (var i = 0; i < geos.length; i++) {
      var g = geos[i];
      var p = g.attributes.position.array, nr = g.attributes.normal.array;
      var u = g.attributes.uv ? g.attributes.uv.array : null;
      for (var j = 0; j < p.length; j++) pos.push(p[j]);
      for (j = 0; j < nr.length; j++) nor.push(nr[j]);
      if (u) for (j = 0; j < u.length; j++) uv.push(u[j]);
      else for (j = 0; j < p.length / 3 * 2; j++) uv.push(0);
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    var mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true; mesh.receiveShadow = true;
    group.add(mesh); n++;
  }
  return n;
};

/* ---------- 变换 & 图元（UV 按实际尺寸烘焙，保证合并后贴图密度一致） ---------- */
var _e = new THREE.Euler(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _sv = new THREE.Vector3();
function m4(x, y, z, rx, ry, rz, sx, sy, sz, order) {
  _e.set(rx || 0, ry || 0, rz || 0, order || 'XYZ'); _q.setFromEuler(_e);
  _p.set(x || 0, y || 0, z || 0);
  _sv.set(sx === undefined ? 1 : sx, sy === undefined ? 1 : sy, sz === undefined ? 1 : sz);
  return new THREE.Matrix4().compose(_p, _q, _sv);
}
function boxUV(g, w, h, d, sc) {
  var uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (var f = 0; f < 6; f++) for (var v = 0; v < 4; v++) {
    var i = f * 4 + v;
    uv.setXY(i, uv.getX(i) * dims[f][0] * sc, uv.getY(i) * dims[f][1] * sc);
  }
}
var SC = { apron: 2.2, pave: 0.85, road: 3.3, conc: 1.3, win: 1.6, vault: 1.0, glass: 1.2 };
Bag.prototype.box = function (key, w, h, d, x, y, z, rx, ry, rz, sc) {
  var g = new THREE.BoxGeometry(w, h, d);
  boxUV(g, w, h, d, sc !== undefined ? sc : SC.conc);
  this.put(key, g, m4(x, y, z, rx, ry, rz));
};
Bag.prototype.cyl = function (key, rt, rb, h, x, y, z, rx, ry, rz, seg) {
  this.put(key, new THREE.CylinderGeometry(rt, rb, h, seg || 12), m4(x, y, z, rx, ry, rz));
};
Bag.prototype.sph = function (key, r, x, y, z, sx, sy, sz, ws, hs) {
  var g = new THREE.SphereGeometry(r, ws || 16, hs || 12);
  if (sx !== undefined) g.scale(sx, sy === undefined ? sx : sy, sz === undefined ? sx : sz);
  this.put(key, g, m4(x, y, z));
};
Bag.prototype.plane = function (key, w, h, x, y, z, rx, ry, rz) {
  this.put(key, new THREE.PlaneGeometry(w, h), m4(x, y, z, rx, ry, rz));
};
/* 两点定位杆件（栏杆/拉杆/天线横桁）：截面 th 的方杆 */
Bag.prototype.bar = function (key, th, x0, y0, z0, x1, y1, z1) {
  var dir = new THREE.Vector3(x1 - x0, y1 - y0, z1 - z0), L = dir.length(); dir.normalize();
  var g = new THREE.BoxGeometry(th, th, L);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir));
  this.put(key, g, m4((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2));
};
/* 通用参数化曲面（波浪屋面/波形幕墙/檐口/山墙）：u,v ∈[0,1]；fn(u,v)→[x,y,z]；uvf(p)→[u,v] */
function surfGeo(nu, nv, fn, uvf) {
  var pos = [], uv = [], idx = [], i, j, p;
  for (i = 0; i <= nu; i++) for (j = 0; j <= nv; j++) {
    p = fn(i / nu, j / nv);
    pos.push(p[0], p[1], p[2]);
    uv.push(uvf(p)[0], uvf(p)[1]);
  }
  for (i = 0; i < nu; i++) for (j = 0; j < nv; j++) {
    var a = i * (nv + 1) + j, b = a + nv + 1;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}
Bag.prototype.surf = function (key, nu, nv, fn, uvf) {
  this.put(key, surfGeo(nu, nv, fn, uvf), null);
};
/* 两点定位分段盒（接坡/斜面）：长沿 x，截面 w(x)×h(y)，路宽 d(z)；对齐 tile15 seg 约定 */
Bag.prototype.seg = function (key, L, h, d, sc, offZ, yOff, p0, y0, p1, y1) {
  var dx = p1.x - p0.x, dz = p1.z - p0.z, hl = Math.sqrt(dx * dx + dz * dz);
  var yaw = -Math.atan2(dz, dx), pitch = Math.atan2(y1 - y0, hl);
  var g = new THREE.BoxGeometry(L, h, d);
  boxUV(g, L, h, d, sc);
  g.translate(0, yOff, offZ);
  g.rotateZ(pitch);
  g.rotateY(yaw);
  g.translate((p0.x + p1.x) / 2, (y0 + y1) / 2, (p0.z + p1.z) / 2);
  this.put(key, g, null);
};

/* ================= 4. 站名牌（Canvas 纹理，独立小 mesh） ================= */
function signMesh(text, w, h) {
  var cv = document.createElement('canvas'); cv.width = 256; cv.height = 64;
  var g = cv.getContext('2d');
  g.fillStyle = '#16324e'; g.fillRect(0, 0, 256, 64);
  for (var si = 0; si < 20; si++) { g.fillStyle = si % 2 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.16)'; g.fillRect((si * 41) % 256, (si * 29) % 64, 3 + (si % 4), 2); }
  g.strokeStyle = '#c8d2da'; g.lineWidth = 5; g.strokeRect(4, 4, 248, 56);
  g.fillStyle = '#f2f6f8'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 36px "Microsoft YaHei","PingFang SC",sans-serif';
  g.fillText(text, 128, 34);
  var tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding;
  var m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45, metalness: 0.1, emissive: C('#8aa8bd'), emissiveIntensity: 0.25 });
  var mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.castShadow = true;
  return mesh;
}

/* ================= 5. 预制构件 ================= */
/* 行道树（干 + 双球冠） */
function tree(bag, x, z, s) {
  bag.cyl('trunk', 0.02 * s, 0.028 * s, 0.26 * s, x, 0.062 + 0.13 * s, z, 0, 0, 0, 10);
  bag.sph('green', 0.15 * s, x, 0.062 + 0.32 * s, z, undefined, undefined, undefined, 12, 9);
  bag.sph('green2', 0.105 * s, x + 0.07 * s, 0.062 + 0.24 * s, z + 0.04 * s, undefined, undefined, undefined, 10, 8);
}
function shrub(bag, x, z, s) {
  bag.sph('hedge', s, x, 0.062 + s * 0.7, z, undefined, undefined, undefined, 10, 8);
}
/* 路灯（钢杆 + 悬挑 + 灯头；dir=灯臂朝向 ±1） */
function lampPost(bag, x, z, dir) {
  bag.cyl('steel', 0.008, 0.011, 0.34, x, 0.062 + 0.17, z, 0, 0, 0, 10);
  bag.box('steel', 0.1 * dir, 0.014, 0.014, x + 0.05 * dir, 0.397, z);
  bag.box('white', 0.045, 0.018, 0.03, x + 0.095 * dir, 0.384, z);
}
/* 停机坪高杆灯（细锥杆 + 顶部环形灯盘 + 灯头 ×4 + 反光盘；参考为环形灯盘） */
function mastPole(bag, x, z, ry) {
  bag.cyl('steel', 0.006, 0.010, 0.60, x, 0.062 + 0.30, z, 0, 0, 0, 12);
  bag.cyl('steel', 0.052, 0.052, 0.007, x, 0.666, z, 0, 0, 0, 14);                      /* 灯盘环 */
  var a;
  for (a = 0; a < 4; a++) {
    var an = ry + a * PI / 2;
    bag.box('white', 0.03, 0.013, 0.02, x + Math.cos(an) * 0.042, 0.657, z + Math.sin(an) * 0.042, 0, -an, 0);
  }
  bag.cyl('dark', 0.047, 0.047, 0.008, x, 0.648, z, 0, 0, 0, 14);                       /* 反光盘 */
}
/* 空调机组（机壳 + 风扇盘） */
function acUnit(bag, x, y, z) {
  bag.box('steel', 0.09, 0.05, 0.05, x, y, z);
  bag.cyl('dark', 0.017, 0.017, 0.012, x + 0.028, y, z, 0, PI / 2, 0, 12);
  bag.box('dark', 0.012, 0.03, 0.04, x - 0.05, y - 0.02, z);
}
/* 出租车（黄身 + 深色窗带 + 顶灯；gy=地面标高，ry=车头朝向） */
function taxi(bag, x, z, gy, ry) {
  var y0 = gy || 0.0645; ry = ry || 0;
  var ox = -0.004 * Math.cos(ry), oz = 0.004 * Math.sin(ry);
  bag.box('dark', 0.08, 0.014, 0.046, x, y0 + 0.0065, z, 0, ry, 0);
  bag.box('yellow', 0.095, 0.024, 0.044, x, y0 + 0.025, z, 0, ry, 0);
  bag.box('yellow', 0.052, 0.022, 0.04, x + ox, y0 + 0.046, z + oz, 0, ry, 0);
  bag.box('dark', 0.054, 0.011, 0.042, x + ox, y0 + 0.046, z + oz, 0, ry, 0);
  bag.box('yellow', 0.014, 0.008, 0.014, x + ox, y0 + 0.061, z + oz, 0, ry, 0);
}
/* 机场大巴/摆渡车（白身 + 深色长窗带 + 裙边；ry=车身朝向，0=沿 x、PI/2=沿 z） */
function coach(bag, x, z, ry, L, W) {
  L = L || 0.21; W = W || 0.062;
  var H = 0.072;
  bag.box('dark', L, 0.016, W - 0.006, x, 0.078, z, 0, ry, 0);
  bag.box('white', L, H, W, x, 0.106, z, 0, ry, 0);
  bag.box('dark', L - 0.008, 0.022, W + 0.004, x, 0.126, z, 0, ry, 0);
  bag.box('dark', L - 0.02, 0.014, W - 0.014, x, 0.082, z, 0, ry, 0);
}
/* 行李牵引车（深灰底盘 + 黄顶棚） */
function tug(bag, x, z, ry) {
  bag.box('dark', 0.05, 0.022, 0.034, x, 0.078, z, 0, ry, 0);
  bag.box('yellow', 0.024, 0.02, 0.03, x - 0.012, 0.096, z, 0, ry, 0);
  bag.box('dark', 0.02, 0.012, 0.028, x + 0.014, 0.094, z, 0, ry, 0);
}
/* 行李平板车（白板 + 蓝苫布 + 牵引杆） */
function cart(bag, x, z, ry) {
  bag.box('white', 0.062, 0.014, 0.045, x, 0.076, z, 0, ry, 0);
  bag.box('blue', 0.05, 0.012, 0.04, x, 0.088, z, 0, ry, 0);
  bag.bar('dark', 0.005, x, 0.072, z, x - 0.035, 0.072, z);
}
/* 货物装卸车（黄箱 + 深色底盘 + 升降臂） */
function loader(bag, x, z, ry) {
  bag.box('yellow', 0.055, 0.03, 0.05, x, 0.09, z, 0, ry, 0);
  bag.box('dark', 0.058, 0.014, 0.052, x, 0.07, z, 0, ry, 0);
  bag.bar('steel', 0.008, x + 0.02, 0.09, z + 0.01, x + 0.05, 0.11, z + 0.01);
}
/* 白色工作车（van：白厢 + 深色驾驶窗） */
function van(bag, x, z, ry) {
  bag.box('white', 0.075, 0.034, 0.042, x, 0.084, z, 0, ry, 0);
  bag.box('dark', 0.02, 0.014, 0.04, x + 0.028, 0.09, z, 0, ry, 0);
}
/* 加油车（银色卧式油罐 + 深色底盘 + 白驾驶室） */
function tanker(bag, x, z, ry) {
  var cx = Math.cos(ry), cz = Math.sin(ry);
  bag.box('dark', 0.11, 0.014, 0.05, x, 0.072, z, 0, ry, 0);
  bag.cyl('silver', 0.024, 0.024, 0.085, x, 0.097, z, 0, ry, PI / 2, 12);
  bag.box('white', 0.024, 0.028, 0.046, x + cx * 0.062, 0.086, z + cz * 0.062, 0, ry, 0);
}
/* 客梯车（白车体 + 驾驶室 + 上斜深色客梯） */
function stairTruck(bag, x, z, ry) {
  bag.box('white', 0.06, 0.03, 0.046, x, 0.082, z, 0, ry, 0);
  bag.box('dark', 0.02, 0.016, 0.04, x + 0.032, 0.09, z, 0, ry, 0);
  bag.box('dark', 0.075, 0.008, 0.034, x - 0.03, 0.105, z, 0, ry, 0.5);
}
/* 停车楼停放小车（车头朝向 ry；gy=楼板面标高） */
function dcar(bag, x, z, ry, key, gy) {
  bag.box(key, 0.088, 0.02, 0.04, x, gy + 0.02, z, 0, ry, 0, SC.conc);
  bag.box(key, 0.05, 0.015, 0.037, x - 0.004, gy + 0.034, z, 0, ry, 0, SC.conc);
  bag.box('dark', 0.052, 0.009, 0.039, x - 0.004, gy + 0.035, z, 0, ry, 0);
  bag.box('dark', 0.082, 0.012, 0.037, x, gy + 0.013, z, 0, ry, 0);
}

/* ================= 6. 工厂 ================= */
window.Special3DModern[37] = function () {
  var g = new THREE.Group();
  g.name = 'special37m_intl_airport';
  var bag = new Bag();
  var i, sx, k;

  /* —— 航站楼几何常量：波浪屋面（沿 x 4.0 波）/ 檐口 / 幕墙 —— */
  var TX0 = -1.24, TX1 = 0.70, TLEN = 1.94;     /* 屋面 x 范围 */
  var NW = 4.0, PH0 = 0.35;                     /* 波数 / 初相 */
  var WBASE = 0.80, WAMP = 0.065;               /* 波幅基线 / 振幅（波顶 ≈0.865 / 波谷 ≈0.735） */
  var PITCH = 0.05;                             /* 屋面向陆侧泄水坡（z +0.10→+0.50 降 0.05） */
  var RZ0 = -0.10, RZ1 = 0.50;                  /* 屋面 z 范围（前后出挑） */
  function wfn(x) { return WBASE + WAMP * Math.sin((x - TX0) / TLEN * PI * 2 * NW + PH0); }
  function roofY(x, z) { return wfn(x) - PITCH * (z - RZ0) / (RZ1 - RZ0); }
  var GZ_A = -0.062, GZ_L = 0.462;              /* 空侧 / 陆侧幕墙 z */
  function gTopA(x) { return roofY(x, GZ_A) - 0.002; }   /* 空侧幕墙顶（随波形） */
  function gTopL(x) { return roofY(x, GZ_L) - 0.002; }   /* 陆侧幕墙顶 */
  var WALL_Y0 = 0.16;                           /* 幕墙底（台基顶） */
  var GVX = 1.1;                                /* 曲面 UV 世界密度 */

  /* 数值求波谷位置（天窗带 ×4，确定性）：差分变号（降→升）才是极小点，此前误把所有上升点都收入 */
  var valleys = [];
  (function () {
    var N = 240, d = (TX1 - TX0) / N, p2 = wfn(TX0), p1 = wfn(TX0 + d), cur, dp, dc;
    for (var n = 2; n <= N; n++) {
      var x = TX0 + d * n; cur = wfn(x);
      dp = p1 - p2; dc = cur - p1;
      if (dp < 0 && dc >= 0) valleys.push(x - d);
      p2 = p1; p1 = cur;
    }
  })();

  var FLOOR = 0.16;                             /* 航站楼台面标高 */

  /* ========== 6.1 沙盘基座：停机坪(−z) + 陆侧广场(+z) ========== */
  bag.box('apron', 2.68, 0.05, 2.68, 0, 0.025, 0, 0, 0, 0, SC.apron);                   /* 基底 */
  bag.box('apron', 2.68, 0.013, 1.36, 0, 0.0565, -0.65, 0, 0, 0, SC.apron);             /* 空侧停机坪 z −1.33..0.03 */
  bag.box('pave', 2.68, 0.013, 1.30, 0, 0.0565, 0.685, 0, 0, 0, SC.pave);               /* 陆侧广场 z 0.035..1.335 */
  bag.box('hedge', 2.58, 0.02, 0.05, 0, 0.073, 1.31);                                   /* 后沿绿篱 */

  /* ========== 6.2 航站楼：台基/勒脚 + 主体 + 通高波形幕墙 + 波浪金属屋面 ========== */
  bag.box('conc', 2.00, 0.09, 0.58, -0.27, 0.115, 0.20, 0, 0, 0, SC.conc);              /* 台基 z −0.09..0.49 */
  bag.box('dark', 2.02, 0.032, 0.60, -0.27, 0.08, 0.20);                                /* 勒脚 */
  bag.box('conc', 1.92, 0.56, 0.46, -0.27, 0.44, 0.20, 0, 0, 0, SC.conc);               /* 主体 y0.16..0.72, z −0.03..0.43 */
  bag.box('liner', 1.90, 0.54, 0.012, -0.27, 0.43, -0.045);                             /* 空侧深蓝灰内衬 */
  bag.box('liner', 1.90, 0.54, 0.012, -0.27, 0.43, 0.445);                              /* 陆侧深蓝灰内衬 */
  /* 通高波形玻璃幕墙：空侧 / 陆侧（顶边随波形起伏，UV 按世界坐标） */
  bag.surf('glass', 56, 1, function (u, v) {
    var x = TX0 + (TX1 - TX0) * u, t = WALL_Y0 + (gTopA(x) - WALL_Y0) * v;
    return [x, t, GZ_A];
  }, function (p) { return [p[0] * GVX, p[1] * 1.2]; });
  bag.surf('glass', 56, 1, function (u, v) {
    var x = TX0 + (TX1 - TX0) * u, t = WALL_Y0 + (gTopL(x) - WALL_Y0) * v;
    return [x, t, GZ_L];
  }, function (p) { return [p[0] * GVX, p[1] * 1.2]; });
  /* 钢竖梃随波变高（空侧 / 陆侧 ×15，浅色铝梃贴参考） */
  for (i = 0; i < 15; i++) {
    var mx = TX0 + 0.03 + i * (TX1 - TX0 - 0.06) / 14;
    bag.box('rail', 0.015, gTopA(mx) - WALL_Y0, 0.02, mx, (gTopA(mx) + WALL_Y0) / 2, GZ_A - 0.008);
    bag.box('rail', 0.015, gTopL(mx) - WALL_Y0, 0.02, mx, (gTopL(mx) + WALL_Y0) / 2, GZ_L + 0.008);
  }
  /* 波浪金属屋面（前后出挑、向陆侧微泄水）+ 前后白色波浪檐口封边 */
  bag.surf('vault', 64, 6, function (u, v) {
    var x = TX0 + (TX1 - TX0) * u, z = RZ0 + (RZ1 - RZ0) * v;
    return [x, roofY(x, z), z];
  }, function (p) { return [p[0] * SC.vault, p[2] * SC.vault]; });
  bag.surf('white', 48, 1, function (u, v) {                                            /* 空侧檐口 */
    var x = TX0 + (TX1 - TX0) * u, yT = roofY(x, -0.095);
    return [x, yT - 0.036 + 0.036 * v, -0.095];
  }, function (p) { return [p[0] * 1.1, p[1] * 3]; });
  bag.surf('white', 48, 1, function (u, v) {                                            /* 陆侧檐口 */
    var x = TX0 + (TX1 - TX0) * u, yT = roofY(x, 0.498);
    return [x, yT - 0.035 + 0.035 * v, 0.498];
  }, function (p) { return [p[0] * 1.1, p[1] * 3]; });
  /* 两端山墙封板（玻璃 + 白边框 + 白色随波顶封边 + 竖梃 ×3，随屋面坡） */
  for (sx = -1; sx <= 1; sx += 2) {
    var xe = sx < 0 ? TX0 - 0.012 : TX1 + 0.012;
    (function (xec, sgn) {
      bag.surf('glass', 8, 1, function (u, v) {
        var z = RZ0 + (RZ1 - RZ0) * u, yT = roofY(xec, z) - 0.004;
        return [xec, 0.15 + (yT - 0.15) * v, z];
      }, function (p) { return [p[2] * GVX, p[1] * 1.2]; });
      bag.surf('white', 16, 1, function (u, v) {                                        /* 山墙顶随波白色封边 */
        var z = RZ0 + (RZ1 - RZ0) * u, yT = roofY(xec, z);
        return [xec + sgn * 0.012, yT - 0.018 + 0.018 * v, z];
      }, function (p) { return [p[2] * 3, p[1] * 4]; });
      bag.box('white', 0.02, roofY(xec, RZ0) - 0.14, 0.03, xec + sgn * 0.008, (roofY(xec, RZ0) + 0.14) / 2, RZ0 + 0.005);
      bag.box('white', 0.02, roofY(xec, RZ1) - 0.14, 0.03, xec + sgn * 0.008, (roofY(xec, RZ1) + 0.14) / 2, RZ1 - 0.005);
      var mz;
      for (k = 1; k <= 3; k++) {
        mz = RZ0 + (RZ1 - RZ0) * k / 4;
        bag.box('steel', 0.016, roofY(xec, mz) - 0.155, 0.018, xec + sgn * 0.014, (roofY(xec, mz) + 0.155) / 2, mz);
      }
    })(xe, sx);
  }
  /* 波谷天窗带 ×4（深色玻璃条 + 窄白脊帽；rz=波面切线角、rx=屋面泄水坡角，贴合曲面通长） */
  var RXP = Math.atan2(PITCH, RZ1 - RZ0);
  for (i = 0; i < valleys.length && i < 4; i++) {
    var xv = valleys[i], dEps = 0.05;
    var slope = Math.atan2(wfn(xv + dEps) - wfn(xv - dEps), 2 * dEps);
    var yV = roofY(xv, 0.20);
    bag.box('cglass', 0.078, 0.014, 0.58, xv, yV + 0.004, 0.20, RXP, 0, slope);
    bag.box('white', 0.034, 0.012, 0.60, xv, yV + 0.014, 0.20, RXP, 0, slope);
  }
  /* 屋面天窗盒 ×2 + 空调机组 ×2（陆侧半区，随坡斜置） */
  var skx2 = [-0.62, 0.06];
  for (i = 0; i < 2; i++) {
    var xS = skx2[i], slS = Math.atan2(wfn(xS + 0.05) - wfn(xS - 0.05), 0.1);
    var yS = roofY(xS, 0.34);
    bag.box('glass', 0.11, 0.022, 0.34, xS, yS + 0.009, 0.34, RXP, 0, slS, SC.glass);
    bag.box('white', 0.13, 0.014, 0.36, xS, yS + 0.027, 0.34, RXP, 0, slS);
  }
  acUnit(bag, -0.92, roofY(-0.92, 0.36) + 0.024, 0.36);
  acUnit(bag, 0.42, roofY(0.42, 0.36) + 0.024, 0.36);

  /* ========== 6.3 陆侧入口：雨棚 + 站名牌 + 玻璃门 + 台阶 ========== */
  bag.box('white', 1.52, 0.018, 0.26, -0.27, 0.545, 0.595);                             /* 雨棚板（加宽横贯入口）z 0.465..0.725 */
  bag.box('white', 1.52, 0.062, 0.012, -0.27, 0.521, 0.728);                            /* 檐口板 */
  bag.box('steel', 1.52, 0.010, 0.014, -0.27, 0.487, 0.728);
  for (i = 0; i < 5; i++) bag.cyl('white', 0.012, 0.012, 0.383, -0.91 + i * 0.32, 0.2535, 0.612, 0, 0, 0, 12); /* 柱列 ×5 落于路缘岛（弯道外侧） */
  bag.box('conc', 1.30, 0.02, 0.06, -0.27, 0.113, 0.525, 0, 0, 0, SC.pave);             /* 台阶 ×2 */
  bag.box('conc', 1.30, 0.01, 0.05, -0.27, 0.108, 0.585, 0, 0, 0, SC.pave);
  for (i = 0; i < 3; i++) bag.box('dark', 0.19, 0.40, 0.010, -0.415 + i * 0.145, 0.36, GZ_L + 0.004); /* 入口玻璃门 ×3 */

  /* ========== 6.4 东端塔台：裙房 + 竖罗纹渐放塔身 + 深色玻璃驾驶室 + 天线/信标 ========== */
  var TWX = 1.02, TWZ = 0.28;
  bag.box('conc', 0.46, 0.22, 0.36, 0.99, 0.18, TWZ, 0, 0, 0, SC.conc);                 /* 裙房 y0.07..0.29 */
  bag.box('winWall', 0.42, 0.15, 0.012, 0.99, 0.20, TWZ + 0.183, 0, 0, 0, SC.win);      /* 裙房竖窗(+z) */
  bag.box('winWall', 0.012, 0.15, 0.32, 1.213, 0.20, TWZ, 0, 0, 0, SC.win);             /* 裙房竖窗(+x) */
  bag.box('white', 0.48, 0.016, 0.38, 0.99, 0.298, TWZ);                                /* 裙房顶板 */
  bag.cyl('rib', 0.096, 0.082, 0.05, TWX, 0.327, TWZ, 0, 0, 0, 20);                     /* 塔底加宽裙座 y0.302..0.352 */
  bag.cyl('rib', 0.050, 0.060, 0.70, TWX, 0.702, TWZ, 0, 0, 0, 20);                     /* 竖罗纹渐放塔身 y0.352..1.052 */
  bag.cyl('white', 0.098, 0.054, 0.06, TWX, 1.092, TWZ, 0, 0, 0, 20);                   /* 收腰外扩过渡锥 */
  bag.cyl('white', 0.104, 0.104, 0.012, TWX, 1.128, TWZ, 0, 0, 0, 20);                  /* 驾驶室下檐圈 */
  bag.cyl('cglass', 0.116, 0.102, 0.10, TWX, 1.184, TWZ, 0, 0, 0, 20);                  /* 深色玻璃驾驶室（上宽外扩） */
  for (i = 0; i < 6; i++) {                                                             /* 驾驶室玻璃竖分格白梃 ×6 */
    var ca = PI / 6 + i * PI / 3;
    bag.box('white', 0.006, 0.096, 0.010, TWX + Math.cos(ca) * 0.112, 1.184, TWZ + Math.sin(ca) * 0.112, 0, PI / 2 - ca, 0);
  }
  bag.cyl('white', 0.124, 0.124, 0.018, TWX, 1.243, TWZ, 0, 0, 0, 20);                  /* 顶部白色外挑圆盘 */
  bag.cyl('white', 0.030, 0.085, 0.042, TWX, 1.274, TWZ, 0, 0, 0, 16);                  /* 锥顶 */
  bag.cyl('steel', 0.004, 0.004, 0.16, TWX, 1.375, TWZ, 0, 0, 0, 8);                    /* 天线桅杆 */
  bag.bar('steel', 0.006, TWX - 0.045, 1.42, TWZ, TWX + 0.045, 1.42, TWZ);              /* 横桁 ×2 */
  bag.bar('steel', 0.006, TWX, 1.40, TWZ - 0.035, TWX, 1.40, TWZ + 0.035);

  /* ========== 6.5 空侧停机坪：标线 + 登机桥 ×4 + 客机 + 地面车辆 + 高杆灯 ========== */
  /* 机位标线：弧形黄色引沿线 ×2（参考为大弧度导入线）+ 红色停止线 + 白色机位框 ×2 + 红色警戒线 + 滑行中线虚线 + 边界线 */
  function leadArc(x0, z0, x1, z1, mode, bz, key) {                                    /* 弧形标线：9 段小盒拼弧；mode 'q'=起点切向沿 z 的二次弯（引沿线），数字=起点 x 侧偏；bz=中段 z 隆起 */
    var s, t0, t1, pa, pb; bz = bz || 0; key = key || 'yellow';
    var pt = function (t) {
      var u = 1 - t, x = (mode === 'q') ? x0 + (x1 - x0) * t * t : x0 + (x1 - x0) * t + mode * u * u;
      return [x, z0 + (z1 - z0) * t + bz * Math.sin(PI * t)];
    };
    for (s = 0; s < 9; s++) {
      t0 = s / 9; t1 = (s + 1) / 9;
      pa = pt(t0); pb = pt(t1);
      bag.box(key, Math.sqrt((pb[0] - pa[0]) * (pb[0] - pa[0]) + (pb[1] - pa[1]) * (pb[1] - pa[1])) + 0.015, 0.0016, 0.015,
        (pa[0] + pb[0]) / 2, 0.063, (pa[1] + pb[1]) / 2, 0, -Math.atan2(pb[1] - pa[1], pb[0] - pa[0]), 0, 1);
    }
  }
  bag.box('yellow', 0.016, 0.0016, 0.42, 0.30, 0.063, -0.80, 0, 0, 0, 1);               /* 主位中线直段 */
  leadArc(0.30, -1.00, 0.62, -1.29, 'q');                                               /* 主位：切向弯出至滑行道 */
  bag.box('yellow', 0.016, 0.0016, 0.40, -0.14, 0.063, -0.79, 0, 0, 0, 1);              /* 备位中线直段 */
  leadArc(-0.14, -0.98, -0.46, -1.23, 'q');                                             /* 备位：反向弯出 */
  bag.box('yellow', 0.016, 0.0016, 0.40, -0.86, 0.063, -0.79, 0, 0, 0, 1);              /* 机位 3 中线（对准桥 1） */
  leadArc(-0.86, -0.98, -1.10, -1.27, 'q');
  leadArc(-1.18, -1.30, 0.70, -1.29, 0, 0.10);                                          /* 滑行道转弯弧线（贯通西端，接三条引沿线尾端） */
  bag.box('red', 0.12, 0.0016, 0.012, 0.30, 0.063, -0.53, 0, 0, 0, 1);                  /* 停止线 ×3 */
  bag.box('red', 0.12, 0.0016, 0.012, -0.14, 0.063, -0.53, 0, 0, 0, 1);
  bag.box('red', 0.12, 0.0016, 0.012, -0.86, 0.063, -0.53, 0, 0, 0, 1);
  var brk = [[0.19, -0.56], [0.41, -0.56], [0.19, -1.18], [0.41, -1.18],
             [-0.25, -0.56], [-0.03, -0.56], [-0.25, -1.14], [-0.03, -1.14],
             [-0.97, -0.56], [-0.75, -0.56], [-0.97, -1.14], [-0.75, -1.14]];
  for (i = 0; i < brk.length; i++) {                                                    /* 机位白框角 ×12（加粗） */
    bag.box('white', 0.06, 0.0016, 0.016, brk[i][0], 0.063, brk[i][1], 0, 0, 0, 1);
    bag.box('white', 0.016, 0.0016, 0.06, brk[i][0], 0.063, brk[i][1], 0, 0, 0, 1);
  }
  bag.box('red', 2.50, 0.0016, 0.012, -0.05, 0.063, -0.20, 0, 0, 0, 1);                 /* 设备限制红线（沿航站楼） */
  bag.box('yellow', 2.56, 0.0016, 0.014, 0, 0.063, -1.08, 0, 0, 0, 1);                  /* 服务道边线 */
  bag.box('yellow', 2.60, 0.0016, 0.014, 0, 0.063, -1.315, 0, 0, 0, 1);                 /* 前沿边界线 */
  /* 封闭式登机桥 ×4：玻璃隧道 + 白顶 + 环梁箍带 ×3 + 双支撑柱 + 行走轮架 + 端头登机车 + rotunda */
  var JB = [-0.90, -0.52, -0.14, 0.345];
  for (i = 0; i < 4; i++) {
    var bx = JB[i], head = (i === 3) ? -0.55 : -0.415;
    var tz = (GZ_A - 0.05 + head) / 2, tl = Math.abs(head - (GZ_A - 0.05));
    bag.box('glass', 0.10, 0.082, tl, bx, 0.235, tz, 0, 0, 0, SC.glass);                /* 玻璃隧道 */
    bag.box('white', 0.115, 0.014, tl + 0.02, bx, 0.283, tz);                           /* 白顶 */
    bag.box('dark', 0.105, 0.014, tl + 0.01, bx, 0.187, tz);                            /* 裙底 */
    bag.box('white', 0.118, 0.012, 0.016, bx, 0.235, tz - tl * 0.3);                    /* 环梁箍带 ×3 */
    bag.box('white', 0.118, 0.012, 0.016, bx, 0.235, tz);
    bag.box('white', 0.118, 0.012, 0.016, bx, 0.235, tz + tl * 0.3);
    bag.box('white', 0.13, 0.10, 0.055, bx, 0.235, head + 0.022);                       /* 端头登机车 */
    bag.box('dark', 0.136, 0.034, 0.058, bx, 0.25, head + 0.022);                       /* 端头窗带 */
    bag.box('dark', 0.09, 0.024, 0.036, bx, 0.168, head + 0.03);                        /* 端头行走轮架 */
    bag.cyl('steel', 0.012, 0.015, 0.115, bx, 0.12, head + 0.05, 0, 0, 0, 12);          /* 端支撑柱 */
    bag.cyl('steel', 0.011, 0.014, 0.115, bx - 0.028, 0.12, tz + tl * 0.22, 0, 0, 0, 12);/* 中段斜撑柱 */
    bag.cyl('steel', 0.052, 0.052, 0.115, bx, 0.235, GZ_A - 0.02, 0, 0, 0, 12);         /* rotunda 加高 */
    bag.box('dark', 0.108, 0.024, 0.054, bx, 0.272, GZ_A - 0.02);                       /* rotunda 顶窗带 */
    bag.cyl('steel', 0.012, 0.012, 0.10, bx, 0.112, tz - tl * 0.28, 0, 0, 0, 12);       /* 中段支撑柱 ×2 */
    bag.cyl('steel', 0.012, 0.012, 0.10, bx, 0.112, tz + tl * 0.28, 0, 0, 0, 12);
  }
  /* 停场客机：白身蓝尾（机头朝陆侧 +z），驾驶舱窗/客窗带/蓝腹线/后掠翼+翼梢小翼/双发/起落架 */
  var PX = 0.30;
  bag.cyl('twhite', 0.048, 0.048, 0.60, PX, 0.168, -0.94, PI / 2, 0, 0, 16);            /* 机身（加粗） */
  bag.sph('twhite', 0.048, PX, 0.168, -0.64, 1, 1, 1.5, 16, 12);                        /* 机头 */
  bag.sph('twhite', 0.048, PX, 0.178, -1.24, 0.85, 0.72, 2.0, 14, 10);                  /* 尾锥 */
  bag.box('dark', 0.062, 0.013, 0.042, PX, 0.198, -0.615);                              /* 驾驶舱窗 */
  bag.box('dark', 0.098, 0.011, 0.52, PX, 0.181, -0.90);                                /* 客窗带 */
  bag.box('blue', 0.096, 0.02, 0.58, PX, 0.135, -0.90);                                 /* 蓝腹线 */
  bag.box('blue', 0.098, 0.006, 0.58, PX, 0.152, -0.90);                                /* 腰线 */
  for (sx = -1; sx <= 1; sx += 2) {                                                     /* 后掠翼（内/外翼 + 翼梢小翼） */
    bag.box('twhite', 0.20, 0.008, 0.13, PX + sx * 0.12, 0.146, -0.88, 0, sx * 0.22, sx * 0.05);
    bag.box('twhite', 0.17, 0.007, 0.09, PX + sx * 0.27, 0.16, -0.825, 0, sx * 0.42, sx * 0.09);
    bag.box('blue', 0.012, 0.05, 0.04, PX + sx * 0.35, 0.19, -0.86, 0, sx * 0.42, sx * 0.15);
  }
  bag.box('blue', 0.018, 0.07, 0.11, PX, 0.245, -1.13, -0.2, 0, 0);                     /* 尾翼根整流段 */
  bag.box('blue', 0.018, 0.23, 0.125, PX, 0.31, -1.15, -0.38, 0, 0);                    /* 蓝尾翼（后掠） */
  bag.box('twhite', 0.27, 0.006, 0.085, PX, 0.208, -1.17, 0, 0, 0);                     /* 平尾 */
  bag.cyl('silver', 0.032, 0.032, 0.13, PX + 0.16, 0.112, -0.78, PI / 2, 0, 0, 14);     /* 发 ×2（加大） */
  bag.cyl('silver', 0.032, 0.032, 0.13, PX - 0.16, 0.112, -0.78, PI / 2, 0, 0, 14);
  bag.cyl('dark', 0.030, 0.030, 0.010, PX + 0.16, 0.112, -0.712, PI / 2, 0, 0, 14);     /* 进气唇环（收窄） */
  bag.cyl('dark', 0.030, 0.030, 0.010, PX - 0.16, 0.112, -0.712, PI / 2, 0, 0, 14);
  bag.cyl('silver', 0.024, 0.024, 0.006, PX + 0.16, 0.112, -0.714, PI / 2, 0, 0, 14);   /* 风扇盘 */
  bag.cyl('silver', 0.024, 0.024, 0.006, PX - 0.16, 0.112, -0.714, PI / 2, 0, 0, 14);
  bag.box('twhite', 0.014, 0.032, 0.055, PX + 0.16, 0.132, -0.74);                      /* 吊架 ×2 */
  bag.box('twhite', 0.014, 0.032, 0.055, PX - 0.16, 0.132, -0.74);
  bag.cyl('dark', 0.006, 0.006, 0.055, PX, 0.0955, -0.60, 0, 0, 0, 8);                  /* 前起落架 */
  bag.cyl('dark', 0.02, 0.02, 0.014, PX, 0.083, -0.60, 0, 0, PI / 2, 10);
  for (sx = -1; sx <= 1; sx += 2) {                                                     /* 主起落架 ×2 */
    bag.cyl('dark', 0.006, 0.006, 0.055, PX + sx * 0.03, 0.0955, -0.85, 0, 0, 0, 8);
    bag.cyl('dark', 0.02, 0.02, 0.028, PX + sx * 0.03, 0.083, -0.85, 0, 0, PI / 2, 10);
  }
  /* 地面车辆 ×19（按机位成组：摆渡/牵引+拖板列 ×3 组/客梯/加油/装卸/餐车/工作车） */
  coach(bag, -0.62, -0.70, 0, 0.20, 0.062);                                             /* 摆渡车 */
  tug(bag, 0.52, -0.98, 0.4);                                                           /* 主位拖板列（右） */
  cart(bag, 0.60, -1.03, 0.4); cart(bag, 0.67, -1.075, 0.4);
  tug(bag, -0.05, -0.97, 0.3); cart(bag, 0.02, -1.00, 0.3); cart(bag, 0.09, -1.03, 0.3); /* 主位拖板列（左翼后） */
  loader(bag, 0.74, -0.62, -0.3);                                                       /* 装卸车 */
  van(bag, 0.48, -0.66, 1.57);                                                          /* 餐车（机身右前） */
  van(bag, -0.28, -1.05, 0.2);                                                          /* 工作车 */
  coach(bag, -1.02, -0.44, PI / 2, 0.17, 0.055);                                        /* 机组车 */
  tanker(bag, 0.72, -0.90, 0.5);                                                        /* 加油车 */
  stairTruck(bag, -0.10, -0.62, 1.3);                                                   /* 客梯车 */
  tug(bag, -0.48, -0.52, 0.2); cart(bag, -0.40, -0.48, 0.2); cart(bag, -0.33, -0.44, 0.2); /* 桥 2 拖板列 */
  van(bag, -0.80, -0.17, 1.57); van(bag, 0.12, -0.17, 1.57);                            /* 沿航站楼工作车 ×2 */
  van(bag, 1.05, -1.00, 0.3); tug(bag, -1.10, -0.95, -0.5);                             /* 场边工作车 / 机位 3 牵引车 */
  /* 高杆灯 ×5（横臂朝不同方向） */
  mastPole(bag, -1.15, -1.15, 0.5);
  mastPole(bag, -0.35, -1.18, 0.2);
  mastPole(bag, 0.62, -1.16, -0.4);
  mastPole(bag, 1.18, -0.86, -1.2);
  mastPole(bag, 1.24, -0.22, -1.6);

  /* ========== 6.6 陆侧广场：弧形落客弯道 + 斑马线 + 车辆 + 停车楼 + 接坡 + 绿化 ========== */
  /* 弧形落客弯道（参考为弧形弯道）：圆心 (0,1.90) 半径 1.16、θ∈[−0.55,0.55]（中段贴近入口），两端直线引道接地块边 */
  var RCZ = 1.90, RR = 1.16;
  function rpos(th, rad) { return [rad * Math.sin(th), RCZ - rad * Math.cos(th)]; }
  function roadSeg(ax, az, bx2, bz2, w) {                                              /* 路面 + 双侧路缘 */
    var dx = bx2 - ax, dz = bz2 - az, L2 = Math.sqrt(dx * dx + dz * dz), nx = -dz / L2, nz = dx / L2;
    var yaw = -Math.atan2(dz, dx), cx = (ax + bx2) / 2, cz = (az + bz2) / 2, off = w / 2 + 0.006;
    bag.box('road', L2 + 0.008, 0.005, w, cx, 0.0645, cz, 0, yaw, 0, SC.road);
    bag.box('white', L2 + 0.008, 0.008, 0.012, cx + nx * off, 0.068, cz + nz * off, 0, yaw, 0);
    bag.box('white', L2 + 0.008, 0.008, 0.012, cx - nx * off, 0.068, cz - nz * off, 0, yaw, 0);
  }
  var NA = 7, pa2, pb2;
  for (i = 0; i < NA; i++) {
    pa2 = rpos(-0.55 + 1.10 * i / NA, RR); pb2 = rpos(-0.55 + 1.10 * (i + 1) / NA, RR);
    roadSeg(pa2[0], pa2[1], pb2[0], pb2[1], 0.16);
  }
  pa2 = rpos(-0.55, RR); roadSeg(pa2[0], pa2[1], -1.30, 1.02, 0.16);                    /* 西引道 */
  pa2 = rpos(0.55, RR); roadSeg(pa2[0], pa2[1], 1.32, 0.87, 0.16);                      /* 东引道 */
  var thC = Math.asin(-0.27 / RR), pc = rpos(thC, RR), tcx = Math.cos(thC), tcz = Math.sin(thC);
  for (i = -2; i <= 2; i++)                                                             /* 斑马线（入口轴线，垂直弧向） */
    bag.box('white', 0.15, 0.0022, 0.028, pc[0] + tcx * 0.072 * i, 0.0675, pc[1] + tcz * 0.072 * i, 0, -Math.atan2(tcx, -tcz), 0, 1);
  var TH = [0.10, 0.22, 0.34, 0.46];
  for (i = 0; i < 4; i++) { pa2 = rpos(TH[i], RR); taxi(bag, pa2[0], pa2[1], 0.0645, -TH[i]); } /* 出租车 ×4 沿弧 */
  pa2 = rpos(-0.40, RR); coach(bag, pa2[0], pa2[1], 0.40, 0.22, 0.064);                 /* 机场大巴 */
  lampPost(bag, -1.16, 1.14, 1); lampPost(bag, 0.98, 1.06, -1);                         /* 路灯 ×2 */
  /* open 式两层停车楼（白色薄板 ×2 + 明露柱列 ×6 + 矮女儿墙 + 顶层车 ×3 / 二层车 ×2 + 竖窗背板） */
  var PKX = -0.18, PKZ = 1.205, PK1 = 0.146, PK2 = 0.242;                               /* 板中心 y */
  bag.box('white', 1.04, 0.012, 0.20, PKX, PK1, PKZ);                                   /* 二层板 top0.152 */
  bag.box('white', 1.04, 0.012, 0.20, PKX, PK2, PKZ);                                   /* 顶板 top0.248 */
  for (i = 0; i < 6; i++) bag.cyl('conc', 0.011, 0.011, 0.18, PKX - 0.44 + (i % 3) * 0.44, 0.152, PKZ - 0.07 + ((i / 3) | 0) * 0.14, 0, 0, 0, 10);
  bag.box('white', 1.04, 0.045, 0.012, PKX, 0.27, PKZ + 0.094);                         /* 顶层女儿墙（后） */
  bag.box('white', 1.04, 0.03, 0.012, PKX, 0.263, PKZ - 0.094);                         /* 顶层女儿墙（前，矮） */
  bag.box('white', 0.012, 0.03, 0.20, PKX - 0.514, 0.263, PKZ);                         /* 侧女儿墙 ×2 */
  bag.box('white', 0.012, 0.03, 0.20, PKX + 0.514, 0.263, PKZ);
  bag.box('winWall', 1.0, 0.075, 0.012, PKX, 0.10, PKZ + 0.09, 0, 0, 0, SC.win);        /* 底层竖窗背板 */
  bag.box('white', 1.04, 0.02, 0.012, PKX, 0.16, PKZ - 0.094);                          /* 二层板前檐 */
  dcar(bag, PKX - 0.30, PKZ, 0.15, 'silver', 0.248); dcar(bag, PKX + 0.02, PKZ, -0.1, 'white', 0.248); dcar(bag, PKX + 0.32, PKZ, 0.05, 'blue', 0.248);
  dcar(bag, PKX - 0.44, PKZ + 0.02, 0.1, 'red', 0.248); dcar(bag, PKX + 0.46, PKZ - 0.02, -0.05, 'silver', 0.248); /* 顶层 +2 */
  dcar(bag, PKX - 0.12, PKZ - 0.01, 0.05, 'white', 0.152); dcar(bag, PKX + 0.20, PKZ + 0.01, -0.08, 'red', 0.152);
  /* 停车楼接坡（自西引道起坡，4 段直坡 + 栏杆 + 墩 ×2，坡顶接顶板西南角） */
  var RP0 = { x: -1.05, z: 0.985 }, RP1 = { x: -0.72, z: 1.16 };
  for (i = 0; i < 4; i++) {
    var t0 = i / 4, t1 = (i + 1) / 4;
    var pa = { x: RP0.x + (RP1.x - RP0.x) * t0, z: RP0.z + (RP1.z - RP0.z) * t0 };
    var pb = { x: RP0.x + (RP1.x - RP0.x) * t1, z: RP0.z + (RP1.z - RP0.z) * t1 };
    var ya = 0.067 + (0.248 - 0.067) * t0, yb = 0.067 + (0.248 - 0.067) * t1;
    bag.seg('conc', 0.105, 0.026, 0.11, SC.conc, 0, 0, pa, ya, pb, yb);
    bag.seg('rail', 0.095, 0.008, 0.008, 1, 0.052, pa, ya + 0.013, pb, yb + 0.013);
    bag.seg('rail', 0.095, 0.008, 0.008, 1, -0.052, pa, ya + 0.013, pb, yb + 0.013);
  }
  bag.cyl('conc', 0.018, 0.022, 0.06, -0.935, 0.095, 1.046, 0, 0, 0, 12);               /* 坡墩 ×2 */
  bag.cyl('conc', 0.018, 0.022, 0.125, -0.819, 0.127, 1.108, 0, 0, 0, 12);
  /* 绿化：行道树 ×15 + 灌木 ×6（弯道与停车楼之间成排 + 后排树阵 + 两翼 + 塔台旁） */
  tree(bag, -0.60, 1.02, 0.55); tree(bag, -0.35, 1.01, 0.58); tree(bag, -0.10, 1.005, 0.55);
  tree(bag, 0.15, 1.005, 0.58); tree(bag, 0.40, 1.01, 0.55);
  tree(bag, -1.05, 0.50, 0.55); tree(bag, 0.62, 0.52, 0.55);
  tree(bag, 1.24, 0.58, 0.5); tree(bag, 1.18, 1.14, 0.5);
  tree(bag, -1.14, 1.24, 0.42); tree(bag, -0.92, 1.25, 0.4); tree(bag, 0.62, 1.24, 0.42); /* 停车楼两翼后排树阵 */
  tree(bag, 0.86, 1.25, 0.4); tree(bag, 1.10, 1.24, 0.42); tree(bag, -1.28, 1.22, 0.42);
  shrub(bag, -0.56, 0.60, 0.032); shrub(bag, 0.02, 0.60, 0.03); shrub(bag, 0.50, 0.62, 0.034);
  shrub(bag, 0.80, 0.44, 0.036); shrub(bag, -1.20, 1.20, 0.034); shrub(bag, 0.70, 1.16, 0.03);

  /* ========== 6.7 合并落地 ========== */
  bag.build(g);

  /* ========== 6.8 发光件（每实例新建）+ 动画 ≤2 项 ========== */
  var glowMat = new THREE.MeshStandardMaterial({
    color: C('#ffffff'), map: texHall(), emissive: C('#ffbe72'), emissiveMap: texHall(),
    emissiveIntensity: 0.82, roughness: 0.6
  });
  var hallGlowA = new THREE.Mesh(new THREE.PlaneGeometry(1.88, 0.52), glowMat);          /* 空侧候机厅内景 */
  hallGlowA.position.set(-0.27, 0.43, -0.052); g.add(hallGlowA);
  var hallGlowL = new THREE.Mesh(new THREE.PlaneGeometry(1.88, 0.52), glowMat);          /* 陆侧值机厅内景 */
  hallGlowL.position.set(-0.27, 0.43, 0.452); hallGlowL.rotation.y = PI; g.add(hallGlowL);
  /* 信标/航行灯（塔台顶 + 机腹上红信标 + 左翼尖红灯，同一材质脉冲） */
  var navMat = new THREE.MeshStandardMaterial({ color: C('#c23330'), emissive: C('#ff4438'), emissiveIntensity: 0.55, roughness: 0.4 });
  var beacon1 = new THREE.Mesh(new THREE.SphereGeometry(0.013, 16, 12), navMat);
  beacon1.position.set(TWX, 1.468, TWZ); g.add(beacon1);
  var beacon2 = new THREE.Mesh(new THREE.SphereGeometry(0.009, 16, 12), navMat);
  beacon2.position.set(PX, 0.118, -0.90); g.add(beacon2);
  var beacon3 = new THREE.Mesh(new THREE.SphereGeometry(0.007, 16, 12), navMat);
  beacon3.position.set(PX + 0.35, 0.20, -0.86); g.add(beacon3);
  var sign = signMesh('国际机场', 0.48, 0.074);
  sign.position.set(-0.27, 0.521, 0.736); g.add(sign);

  g.userData.anim = [
    function (t) {                                                                       /* 1) 塔台/机腹信标闪烁 */
      navMat.emissiveIntensity = 0.55 + 0.22 * Math.sin(t * 2.6);
    },
    function (t) {                                                                       /* 2) 候机厅暖光呼吸（幅度 0.18 ≤0.25） */
      glowMat.emissiveIntensity = 0.82 + 0.18 * Math.sin(t * 1.5 + 0.6);
    }
  ];
  g.userData.specialId = 37;
  g.userData.parts = { navMat: navMat, glowMat: glowMat, sign: sign };
  return g;
};

})();
