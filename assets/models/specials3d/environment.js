/* =====================================================================================
 * 大富翁 · 富贵人生 —— 模块 F · 书房桌面环境 v2（environment.js）
 * -------------------------------------------------------------------------------------
 * 接管钩子：view3d.buildStaticScene() 末尾调用
 *   window.Environment3D.replace({ THREE, scene, staticRoot })
 *
 * v2.1（穿模修复）：书脊实例矩阵重排——底面精确落板（row0=裙座顶 1.6，其余=层板顶
 *   0.7+pitch·k+0.2）、书界 x±13.35 / z[-4.46,3.83] 不再插搁板/侧板/背板/前沿压条；
 *   斜书仅限贴侧板端部且 ≤6°（绕底棱旋转，AABB 底缘仍在板面）；行内陈设先占带、
 *   书脊避让（v2 两者 x 随机互相穿插）；相邻书缝 0.015~0.03；书脊总数收敛 821 不变。
 *   另修：窗台陈设落窗台板顶面（原中心误放板底 y，半埋 0.9）；书立间装饰书改直立
 *   （原斜 0.16rad 绕中心旋转沉板）；窗台/书桌斜倚相框微抬 0.03 补倾斜底棱沉降。
 * v2 = 在 v1（已验收布局/契约）基础上对照 refs/scene_study_room.png 的全局精修：
 *   1) 窗（重点）：4×4 十字分格 + 中梃 + 内衬 stop liner + 窗台/窗楣线脚 + 托架 ×3；
 *      玻璃微透(透明 0.18) + 斜向反光高光条 ×2；窗外晚霞 512px Canvas 大板
 *      （橙紫→深蓝渐变 + 云带 + 星月）+ 双层城市剪影（远紫/近深 + 教堂尖塔 + 点点窗火）；
 *      窗灯火光 ×3 相位错开微闪；窗台花盆 + 书堆 + 斜倚小相框
 *   2) 墙（重点）：上半墙细条纹+暗纹壁纸（512 Canvas，整周期铺贴防错缝）；
 *      下半墙木护墙板（512 Canvas 凹凸面板分格）+ 踢脚线 + 顶饰条 + 挂画线 + 檐口线脚 ×4 墙
 *   3) 地球仪（重点）：大陆手绘贴图（512×256）+ 经纬线框覆层 + 黄铜子午圈 + 地平圈 +
 *      斜轴 + 顶针 + 三足弯腿底座 + 缓慢摇摆 anim
 *   4) 书架（重点）：书脊按「同色书群」生成（颜色/高矮/厚薄韵律）+ 端头斜书 + 横放书堆 +
 *      L 形书立 + 架内暗部阴影面 + 层板前沿压条 + 柜顶摆件（半身像/陶瓶/相框/瓷碗）
 *   5) 台灯：绿罩 banker lamp——底座双阶 + 灯颈/关节球 + 罩内暖光半球 + 黄铜罩口环 +
 *      拉绳开关（绳+坠珠）；壁挂灯笼油灯 ×2（挂架/链环/四柱笼/玻璃罩/火焰）火苗微闪
 *   6) 皮椅：铆钉 InstancedMesh 沿边 + 坐垫分块 + 前缘滚轴 + 靠背顶滚 + 木质扶手
 *   7) 木梯：平踏步 + 级缘防滑条 + 板式立柱 + 柱顶球帽 + 柱脚垫
 *   8) 盆栽：深浅两绿分层叶片 + 侧枝 + 陶盆条纹纹理 + 盆沿圈
 *   9) 地毯：512 Canvas 织物纹（中央 medallion + 多重边框带 + 菱格暗纹 + 四角章）
 *   10) 桌面陈设：书堆×2 + 墨水瓶与羽毛笔 + 黄铜烛台（火苗微闪）+ 小相框 —— 全部落在
 *       棋盘 plinth（±22.3×±16.3）之外的桌面边环
 *   11) 氛围：台灯 emissive 呼吸（±0.06）/ 窗外灯火闪烁 / 烛火·灯笼火苗摇曳 —— 全部
 *       userData.anim 零分配回调
 *
 * replace 做四件事：
 *   1) 清理：移除毛毡圆盘（CircleGeometry r≥60）与外圈 Ring（outerRadius≥60）；
 *      棋盘外围散件（staticRoot 直接子级 |x|>23.5 或 |z|>17.5）；
 *      保留 plinth/棋盘框架/40 格/中央陈设
 *   2) 搭建：v1 布局参数不变 —— 地板 ±120 / 墙距 ±100 高 62（无顶棚）/ 背墙落地窗 /
 *      书架 ×9 / 书桌 56×42 顶面 y=0.66（plinth 底 y=0 恰压桌）/ 地毯 / 皮椅 / 木梯 /
 *      盆栽 / 地球仪 / 台灯×2 / 灯笼×2 / 挂画×4 / 桌面小件
 *   3) 光照（幂等 __envTuned）：Hemi 0.22 / 主阳光 0.6（保棋盘照度）/ 顶部暖 Spot 1.15
 *      罩棋盘 / 台灯 PointLight×2 + 灯笼 PointLight×2；fog (150,380) 暖黑
 *   4) 兜底：幂等（__env3dDone 二次直接返回）、分段 try/catch、零 Math.random（种子 LCG）、
 *      每帧零新增对象；新灯光全部挂 staticRoot 子树（scene.children 前 4 根 root 不动）
 *
 * 网格预算：室内实测 629 mesh（v1=256；v2=623，v2.1 陈设占带重排后行内陈设抽样微变 +6；
 *   书脊 9 个 InstancedMesh 共 821 实例 + 椅铆钉 1 个 InstancedMesh 26 实例各计 1）≤ 900（硬上限）；
 *   全局 smoke_perf_budget 总量 3934/4000。
 * 顶棚：单面朝下 Plane（y=32）+ 5 根朝下单面横梁 —— 室内低机位见暖色顶棚，HOME/俯视机位
 *   （y>32）背面剔除自动消失、不挡棋盘；不投/接阴影，不影响主阳光照棋盘。
 * v1 遗留 bug 修复：背墙窗侧段中心误算为 ±36（两段合拢挡死窗洞），改为 ±64 → 窗景首次真正露出。
 * ==================================================================================== */
(function () {
'use strict';

var PI = Math.PI;

/* ---------- 确定性伪随机（mulberry32；全场景零 Math.random，截图/计数稳定） ---------- */
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

/* ---------- 布局常量（与 v1 一致，保证棋盘/机位契约不变） ---------- */
var FLOOR_Y = -30;            // 地板面高度
var ROOM_HALF = 100;          // 墙距中心
var WALL_H = 62;              // 墙高（-30 → 32，无顶棚保证俯视可见棋盘）
var DESK_TOP_Y = 0.66;        // 桌面顶面（plinth 底 y=0 沉入桌面 0.06）
var DESK_W = 56, DESK_D = 42, DESK_T = 2.5;
var WIN = { x0: -28, x1: 28, y0: -14, y1: 22 };   // 背墙窗洞

function define(THREE) {

  /* ================= 纹理工具（全部程序化 Canvas ≤512px） ================= */
  function ctex(cv, rx, ry) {
    var tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    if (rx) { tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(rx, ry || rx); }
    tex.anisotropy = 4;
    return tex;
  }
  function canv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  /* 书桌面木纹（512）：暖棕底 + 长纹 + 木节 + 缎面高光带 + 边缘暗角 */
  function texDeskWood() {
    var cv = canv(512, 512), c = cv.getContext('2d'), r = RNG(101);
    c.fillStyle = '#7c4a22'; c.fillRect(0, 0, 512, 512);
    for (var i = 0; i < 88; i++) {
      var y = r() * 512;
      c.strokeStyle = r() < 0.6 ? 'rgba(58,30,10,' + (0.05 + r() * 0.1).toFixed(3) + ')'
                                : 'rgba(240,190,120,' + (0.03 + r() * 0.05).toFixed(3) + ')';
      c.lineWidth = 0.6 + r() * 2.2;
      c.beginPath(); c.moveTo(0, y);
      c.bezierCurveTo(160, y + (r() - 0.5) * 18, 340, y + (r() - 0.5) * 18, 512, y + (r() - 0.5) * 10);
      c.stroke();
    }
    for (var k = 0; k < 5; k++) {
      var kx = 60 + r() * 392, ky = 60 + r() * 392;
      c.strokeStyle = 'rgba(52,26,8,.32)'; c.lineWidth = 1.2;
      for (var q = 1; q <= 3; q++) { c.beginPath(); c.ellipse(kx, ky, q * 6, q * 3.4, 0, 0, PI * 2); c.stroke(); }
    }
    /* 缎面斜向高光带（体现上漆桌面的暖反光） */
    var sh = c.createLinearGradient(0, 0, 512, 512);
    sh.addColorStop(0.32, 'rgba(255,220,160,0)');
    sh.addColorStop(0.5, 'rgba(255,220,160,0.07)');
    sh.addColorStop(0.68, 'rgba(255,220,160,0)');
    c.fillStyle = sh; c.fillRect(0, 0, 512, 512);
    var vg = c.createRadialGradient(256, 256, 180, 256, 256, 380);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,12,0,.36)');
    c.fillStyle = vg; c.fillRect(0, 0, 512, 512);
    return ctex(cv);
  }

  /* 木地板（512）：错缝条板 + 板面光泽变化 */
  function texFloor() {
    var cv = canv(512, 512), c = cv.getContext('2d'), r = RNG(202);
    for (var row = 0; row < 8; row++) {
      var l = 10 + r() * 14;
      c.fillStyle = 'rgb(' + Math.round(96 + l) + ',' + Math.round(62 + l * 0.7) + ',' + Math.round(34 + l * 0.4) + ')';
      c.fillRect(0, row * 64, 512, 64);
      c.strokeStyle = 'rgba(40,22,8,.55)'; c.lineWidth = 3;
      c.strokeRect(-2, row * 64, 516, 64);
      c.strokeStyle = 'rgba(255,220,170,.08)'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(0, row * 64 + 2.5); c.lineTo(512, row * 64 + 2.5); c.stroke();
      var joint = 40 + r() * 180;
      while (joint < 512) { c.fillRect(joint, row * 64 + 2, 3, 60); joint += 180 + r() * 180; }
      c.strokeStyle = 'rgba(50,28,10,.16)'; c.lineWidth = 1;
      for (var g = 0; g < 12; g++) { var gy = row * 64 + 6 + r() * 54; c.beginPath(); c.moveTo(0, gy); c.lineTo(512, gy + (r() - 0.5) * 7); c.stroke(); }
    }
    return ctex(cv, 11, 11);
  }

  /* 波斯地毯（512×388）：中央 medallion + 多重边框带 + 菱格暗纹 + 四角章 + 织物噪点 */
  function texRug() {
    var cv = canv(512, 388), c = cv.getContext('2d'), r = RNG(303);
    c.fillStyle = '#7c2f28'; c.fillRect(0, 0, 512, 388);
    /* 织物噪点 */
    for (var i = 0; i < 900; i++) {
      c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.10)' : 'rgba(255,210,160,.06)';
      c.fillRect(r() * 512, r() * 388, 1.6, 1.6);
    }
    /* 外框带：藏青 + 金线 */
    c.fillStyle = '#242b45'; c.fillRect(0, 0, 512, 20); c.fillRect(0, 368, 512, 20);
    c.fillRect(0, 0, 20, 388); c.fillRect(492, 0, 20, 388);
    c.strokeStyle = '#c9a04c'; c.lineWidth = 2.4;
    c.strokeRect(25, 25, 462, 338); c.strokeRect(31, 31, 450, 326);
    /* 护框带 + 小金章列 */
    c.fillStyle = '#9a5a34';
    c.fillRect(38, 38, 436, 20); c.fillRect(38, 330, 436, 20);
    c.fillRect(38, 38, 20, 312); c.fillRect(454, 38, 20, 312);
    c.fillStyle = '#c9a04c';
    for (var d = 0; d < 11; d++) {
      var dx = 66 + d * 38;
      [[dx, 48], [dx, 340]].forEach(function (p) {
        c.save(); c.translate(p[0], p[1]); c.rotate(PI / 4); c.fillRect(-4, -4, 8, 8); c.restore();
      });
    }
    /* 场地菱格暗纹 */
    c.strokeStyle = 'rgba(40,20,12,.20)'; c.lineWidth = 1.2;
    for (var L = -388; L < 512; L += 36) {
      c.beginPath(); c.moveTo(L, 66); c.lineTo(L + 312, 322); c.stroke();
      c.beginPath(); c.moveTo(L + 312, 66); c.lineTo(L, 322); c.stroke();
    }
    /* 四角章 */
    [[74, 88], [438, 88], [74, 300], [438, 300]].forEach(function (p) {
      c.save(); c.translate(p[0], p[1]); c.rotate(PI / 4);
      c.fillStyle = '#9a5a34'; c.fillRect(-17, -17, 34, 34);
      c.strokeStyle = '#c9a04c'; c.lineWidth = 2.4; c.strokeRect(-17, -17, 34, 34);
      c.restore();
    });
    /* 中央 medallion（层叠方 + 放射角） */
    c.save(); c.translate(256, 194);
    var layers = [[150, '#2c3a5c', 5], [112, '#7c2f28', 3], [74, '#9a5a34', 3], [36, '#2c3a5c', 2]];
    for (var li = 0; li < layers.length; li++) {
      c.save(); c.rotate(PI / 4);
      c.fillStyle = layers[li][1]; c.fillRect(-layers[li][0] / 2, -layers[li][0] / 2, layers[li][0], layers[li][0]);
      c.strokeStyle = '#c9a04c'; c.lineWidth = layers[li][2];
      c.strokeRect(-layers[li][0] / 2, -layers[li][0] / 2, layers[li][0], layers[li][0]);
      c.restore();
    }
    c.fillStyle = '#c9a04c';
    for (var a = 0; a < 8; a++) {
      c.save(); c.rotate(a * PI / 4);
      c.beginPath(); c.moveTo(0, -168); c.lineTo(9, -150); c.lineTo(-9, -150); c.closePath(); c.fill();
      c.restore();
    }
    c.restore();
    return ctex(cv);
  }

  /* 窗外晚霞（512×352）：窗洞可见 v∈[0.09,0.91]，暖色带压在窗格中部（v≈0.45-0.66）——
   * 顶部靛紫→粉紫→橙→地平亮黄带；云带 + 星月 + 地平霞光 + 双层城市剪影 + 教堂尖塔 + 窗火 */
  function texSky() {
    var cv = canv(512, 352), c = cv.getContext('2d'), r = RNG(404);
    var g = c.createLinearGradient(0, 0, 0, 352);
    g.addColorStop(0.0, '#2a2860'); g.addColorStop(0.14, '#4a3878');
    g.addColorStop(0.28, '#8a4e80'); g.addColorStop(0.42, '#c86a5c');
    g.addColorStop(0.52, '#e88a4e'); g.addColorStop(0.60, '#f7b466');
    g.addColorStop(0.68, '#fbd08a'); g.addColorStop(1.0, '#fbd08a');
    c.fillStyle = g; c.fillRect(0, 0, 512, 352);
    /* 地平霞光（中偏左，参考图落日余晖） */
    var sun = c.createRadialGradient(210, 206, 10, 210, 206, 190);
    sun.addColorStop(0, 'rgba(255,214,140,.55)'); sun.addColorStop(0.5, 'rgba(255,170,100,.18)'); sun.addColorStop(1, 'rgba(255,170,100,0)');
    c.fillStyle = sun; c.fillRect(0, 20, 512, 332);
    /* 星（高空） */
    for (var i = 0; i < 46; i++) {
      c.globalAlpha = 0.2 + r() * 0.55;
      c.fillStyle = '#ffffff'; c.fillRect(r() * 512, r() * 60, 1.4, 1.4);
    }
    c.globalAlpha = 1;
    /* 月 + 月晕 */
    var halo = c.createRadialGradient(430, 44, 6, 430, 44, 42);
    halo.addColorStop(0, 'rgba(244,233,196,.32)'); halo.addColorStop(1, 'rgba(244,233,196,0)');
    c.fillStyle = halo; c.fillRect(386, 2, 88, 88);
    c.fillStyle = '#f4e9c4'; c.beginPath(); c.arc(430, 44, 11, 0, PI * 2); c.fill();
    /* 晚霞云带（暗紫主体 + 下缘霞光） */
    for (var k = 0; k < 16; k++) {
      var y = 56 + r() * 120, w = 90 + r() * 190, h = 6 + r() * 13, x = r() * 512;
      c.fillStyle = 'rgba(70,42,96,' + (0.22 + r() * 0.3).toFixed(2) + ')';
      c.beginPath(); c.ellipse(x, y, w, h, 0, 0, PI * 2); c.fill();
      c.fillStyle = 'rgba(255,170,100,' + (0.12 + r() * 0.16).toFixed(2) + ')';
      c.beginPath(); c.ellipse(x, y + h * 0.8, w * 0.92, h * 0.4, 0, 0, PI * 2); c.fill();
    }
    /* 城市地平线 v=232（世界 y≈-3）：远景剪影层（紫，低矮） */
    var GND = 232;
    c.fillStyle = 'rgba(92,60,122,0.88)';
    var fx = 0;
    while (fx < 512) {
      var fw = 22 + r() * 40, fh = 18 + r() * 52;
      c.fillRect(fx, GND - fh, fw, fh + 40);
      if (r() < 0.25) c.fillRect(fx + fw * 0.34, GND - fh - 10, fw * 0.3, 12);
      fx += fw + 3 + r() * 8;
    }
    /* 教堂尖塔（右中部，地标轮廓） */
    c.fillRect(366, GND - 62, 30, 62);                                              /* 塔身 */
    c.beginPath(); c.moveTo(364, GND - 62); c.lineTo(381, GND - 140); c.lineTo(398, GND - 62); c.closePath(); c.fill();
    c.fillRect(379.5, GND - 158, 3, 20); c.fillRect(375, GND - 152, 12, 3);         /* 十字 */
    /* 近景剪影层（深，含老虎窗/水塔），一直铺到画板底部 */
    c.fillStyle = '#2a1d40';
    var bx = 0;
    while (bx < 512) {
      var bw = 22 + r() * 46, bh = 26 + r() * 92;
      c.fillRect(bx, GND - bh, bw, bh + (352 - GND));
      if (r() < 0.3) c.fillRect(bx + bw * 0.3, GND - bh - 12, bw * 0.36, 14);       /* 老虎窗 */
      if (r() < 0.18) { c.fillRect(bx + bw * 0.2, GND - bh - 22, 7, 22); }           /* 烟囱/水塔 */
      bx += bw + 2 + r() * 6;
    }
    /* 城市窗火（暖点） */
    for (var w = 0; w < 110; w++) {
      c.globalAlpha = 0.35 + r() * 0.6;
      c.fillStyle = '#ffc36b';
      c.fillRect(r() * 508, GND - 80 + r() * 78, 2.2, 2.8);
    }
    /* 三个闪烁灯位画亮窗簇（与窗外灯火 mesh 对位：世界 (-17,3)/(5,5.5)/(19,1.5)） */
    c.globalAlpha = 0.95; c.fillStyle = '#ffd98a';
    [[120, 184], [296, 164], [408, 196]].forEach(function (p) {
      c.fillRect(p[0] - 5, p[1] - 6, 4, 5); c.fillRect(p[0] + 1, p[1] - 4, 4, 4); c.fillRect(p[0] - 3, p[1], 4, 4);
    });
    c.globalAlpha = 1;
    return ctex(cv);
  }

  /* 地球仪贴图（512×256）：海洋渐变 + 手绘大陆剪影 + 沙漠/林地色斑 + 经纬细线 */
  function texGlobe() {
    var cv = canv(512, 256), c = cv.getContext('2d'), r = RNG(505);
    var og = c.createLinearGradient(0, 0, 0, 256);
    og.addColorStop(0, '#2c5c86'); og.addColorStop(0.5, '#3a6f9a'); og.addColorStop(1, '#28507a');
    c.fillStyle = og; c.fillRect(0, 0, 512, 256);
    /* 细波浪 */
    c.strokeStyle = 'rgba(220,240,255,.06)'; c.lineWidth = 1;
    for (var wv = 0; wv < 16; wv++) {
      var wy = 14 + wv * 16;
      c.beginPath(); c.moveTo(0, wy);
      c.bezierCurveTo(128, wy + 5, 384, wy - 5, 512, wy); c.stroke();
    }
    function land(pts, fill) {
      c.fillStyle = fill || '#63814a';
      c.beginPath();
      c.moveTo(pts[0][0], pts[0][1]);
      for (var i = 1; i < pts.length; i++) {
        var p = pts[i], pp = pts[i - 1];
        c.quadraticCurveTo(pp[0] + (p[0] - pp[0]) * 0.5 + (r() - 0.5) * 16, pp[1] + (p[1] - pp[1]) * 0.5 + (r() - 0.5) * 12, p[0], p[1]);
      }
      c.closePath(); c.fill();
    }
    /* 北美 + 中美 + 南美 */
    land([[40, 60], [96, 38], [150, 52], [168, 84], [140, 104], [150, 128], [136, 152], [122, 140], [104, 150], [96, 120], [60, 108], [30, 84]]);
    land([[150, 150], [166, 168], [158, 214], [140, 232], [132, 196], [138, 166]]);
    /* 格陵兰 */
    land([[196, 30], [226, 24], [232, 44], [204, 52]]);
    /* 欧洲 */
    land([[246, 56], [282, 44], [300, 62], [278, 82], [252, 78]]);
    /* 非洲 */
    land([[262, 96], [304, 92], [318, 128], [298, 178], [280, 208], [266, 176], [252, 128]]);
    /* 亚洲 */
    land([[310, 40], [420, 30], [478, 58], [458, 92], [398, 108], [348, 96], [312, 74]]);
    land([[336, 108], [352, 132], [340, 152], [326, 130]]);          /* 印度 */
    land([[396, 118], [420, 126], [408, 142], [392, 132]]);          /* 东南亚 */
    /* 澳大利亚 */
    land([[432, 182], [470, 176], [482, 200], [452, 212], [428, 202]]);
    /* 南极 */
    c.fillStyle = '#cfdcd8'; c.fillRect(0, 238, 512, 18);
    /* 沙漠/林地色斑 */
    c.fillStyle = 'rgba(178,158,98,.5)';
    [[270, 120, 20, 12], [350, 60, 30, 12], [120, 80, 24, 10], [446, 70, 18, 10]].forEach(function (b) {
      c.beginPath(); c.ellipse(b[0], b[1], b[2], b[3], r() * 3, 0, PI * 2); c.fill();
    });
    c.fillStyle = 'rgba(58,92,52,.45)';
    [[86, 62, 26, 14], [410, 84, 30, 14], [290, 106, 16, 9]].forEach(function (b) {
      c.beginPath(); c.ellipse(b[0], b[1], b[2], b[3], r() * 3, 0, PI * 2); c.fill();
    });
    /* 经纬细线 */
    c.strokeStyle = 'rgba(20,30,40,.14)'; c.lineWidth = 1;
    for (var gx = 0; gx <= 512; gx += 64) { c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, 256); c.stroke(); }
    for (var gy = 0; gy <= 256; gy += 64) { c.beginPath(); c.moveTo(0, gy); c.lineTo(512, gy); c.stroke(); }
    return ctex(cv);
  }

  /* 上半墙壁纸（512）：暖褐底 + 细竖条纹 + 暗纹菱格 + 噪点 */
  function texWallpaper() {
    var cv = canv(512, 512), c = cv.getContext('2d'), r = RNG(606);
    c.fillStyle = '#4d3a28'; c.fillRect(0, 0, 512, 512);
    for (var i = 0; i < 16; i++) {
      if (i % 2 === 0) { c.fillStyle = 'rgba(255,220,170,0.05)'; c.fillRect(i * 32, 0, 16, 512); }
      else { c.fillStyle = 'rgba(0,0,0,0.07)'; c.fillRect(i * 32, 0, 16, 512); }
    }
    c.fillStyle = 'rgba(222,182,120,0.07)';
    for (var gx = 0; gx < 8; gx++) {
      for (var gy = 0; gy < 8; gy++) {
        var cx = gx * 64 + 32, cy = gy * 64 + 32;
        c.save(); c.translate(cx, cy); c.rotate(PI / 4);
        c.fillRect(-6, -6, 12, 12); c.restore();
        c.fillStyle = 'rgba(255,230,180,0.05)'; c.fillRect(cx - 1.5, cy - 1.5, 3, 3);
        c.fillStyle = 'rgba(222,182,120,0.07)';
      }
    }
    for (var n = 0; n < 500; n++) {
      c.fillStyle = r() < 0.5 ? 'rgba(0,0,0,.05)' : 'rgba(255,230,190,.04)';
      c.fillRect(r() * 512, r() * 512, 1.5, 1.5);
    }
    return ctex(cv);
  }

  /* 下半墙护墙板（512×256 对应 16×9 单位）：三联凹凸面板 + 描边 + 木纹 */
  function texWainscot() {
    var cv = canv(512, 256), c = cv.getContext('2d'), r = RNG(707);
    c.fillStyle = '#33220f'; c.fillRect(0, 0, 512, 256);
    for (var i = 0; i < 60; i++) {
      c.strokeStyle = r() < 0.5 ? 'rgba(0,0,0,.10)' : 'rgba(200,150,90,.06)';
      c.lineWidth = 0.8 + r() * 1.6;
      var x = r() * 512;
      c.beginPath(); c.moveTo(x, 0); c.lineTo(x + (r() - 0.5) * 8, 256); c.stroke();
    }
    /* 顶横档 + 底横档 */
    c.fillStyle = '#3f2c15'; c.fillRect(0, 0, 512, 22);
    c.strokeStyle = 'rgba(255,220,170,.16)'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 2); c.lineTo(512, 2); c.stroke();
    c.fillStyle = '#241708'; c.fillRect(0, 234, 512, 22);
    c.strokeStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.moveTo(0, 234); c.lineTo(512, 234); c.stroke();
    /* 三联面板（凹槽 + 上亮下影描边） */
    for (var p = 0; p < 3; p++) {
      var px = p * 170.67 + 13, pw = 145, py = 40, ph = 176;
      c.fillStyle = '#2a1b0b'; c.fillRect(px, py, pw, ph);
      c.strokeStyle = 'rgba(0,0,0,.55)'; c.lineWidth = 5; c.strokeRect(px + 2.5, py + 2.5, pw - 5, ph - 5);
      c.strokeStyle = 'rgba(210,165,100,.20)'; c.lineWidth = 2.4; c.strokeRect(px + 7, py + 7, pw - 14, ph - 14);
      c.strokeStyle = 'rgba(190,145,85,.13)'; c.lineWidth = 1.4;
      c.strokeRect(px + 14, py + 14, pw - 28, ph - 28);
    }
    return ctex(cv);
  }

  /* 陶盆（256）：横纹条 + 噪点 */
  function texPot() {
    var cv = canv(256, 256), c = cv.getContext('2d'), r = RNG(808);
    c.fillStyle = '#9a5230'; c.fillRect(0, 0, 256, 256);
    for (var y = 18; y < 256; y += 34) {
      c.fillStyle = 'rgba(60,30,12,.28)'; c.fillRect(0, y, 256, 7);
      c.fillStyle = 'rgba(255,200,150,.12)'; c.fillRect(0, y + 7, 256, 3);
    }
    for (var i = 0; i < 260; i++) {
      c.fillStyle = r() < 0.5 ? 'rgba(40,18,6,.2)' : 'rgba(255,210,160,.08)';
      c.fillRect(r() * 256, r() * 256, 1.6, 1.6);
    }
    return ctex(cv);
  }

  /* 挂画：小幅风景（保留 v1 风格，加装裱卡纸） */
  function texPicture(seed) {
    var cv = canv(128, 96), c = cv.getContext('2d'), r = RNG(seed);
    c.fillStyle = '#d8c9a0'; c.fillRect(0, 0, 128, 96);
    var g = c.createLinearGradient(0, 8, 0, 88);
    g.addColorStop(0, '#8a94b8'); g.addColorStop(0.6, '#d8a878'); g.addColorStop(1, '#6a5038');
    c.fillStyle = g; c.fillRect(10, 10, 108, 76);
    c.fillStyle = '#4c5c38';
    c.beginPath(); c.moveTo(10, 64); c.lineTo(36, 34); c.lineTo(60, 64); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(46, 68); c.lineTo(78, 30); c.lineTo(110, 68); c.closePath(); c.fill();
    c.fillStyle = '#2e3a28'; c.fillRect(10, 64, 108, 22);
    c.fillStyle = 'rgba(255,235,180,.9)';
    c.beginPath(); c.arc(94, 24, 6.5, 0, PI * 2); c.fill();
    return ctex(cv);
  }

  /* ================= 共享材质 ================= */
  function lin(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
  function std(hex, o) {
    o = o || {};
    var m = new THREE.MeshStandardMaterial({
      color: lin(hex),
      roughness: o.rough !== undefined ? o.rough : 0.85,
      metalness: o.metal || 0,
    });
    if (o.map) m.map = o.map;
    if (o.emissive) { m.emissive = lin(o.emissive); m.emissiveIntensity = o.ei !== undefined ? o.ei : 1; }
    if (o.side) m.side = o.side;
    if (o.flat) m.flatShading = true;
    if (o.transparent) { m.transparent = true; m.opacity = o.opacity !== undefined ? o.opacity : 1; }
    if (o.depthWrite === false) m.depthWrite = false;
    return m;
  }

  var M = {};

  function buildMaterials() {
    /* 墙：壁纸贴图（v0.28 单周期=16/25 单位；整周期铺贴防段间错缝） */
    M.wallWide = std('#c8a878', { rough: 0.95, map: texWallpaper() });
    M.wallWide.map.repeat.set(8, 2.5);
    M.wallBack = std('#c8a878', { rough: 0.95, map: texWallpaper() });
    M.wallBack.map.repeat.set(3, 2.5);
    M.wallLow = std('#c8a878', { rough: 0.95, map: texWallpaper() });
    M.wallLow.map.repeat.set(2, 1);
    M.wainscot = std('#8a6a44', { rough: 0.9, map: texWainscot() });
    M.wainscot.map.repeat.set(12, 1);         /* 200 单位 ÷ 16.67 = 12 整周期 */
    M.woodDark = std('#3a2415', { rough: 0.82 });
    M.woodMid = std('#5f3a1c', { rough: 0.78 });
    M.woodDeep = std('#241505', { rough: 0.9 });
    M.brass = std('#c9963f', { rough: 0.35, metal: 0.75 });
    M.iron = std('#2a2a30', { rough: 0.6, metal: 0.55 });
    M.leather = std('#5a3226', { rough: 0.62 });
    M.leatherDark = std('#43241a', { rough: 0.7 });
    M.leaf = std('#3e6b38', { rough: 0.9, flat: true });
    M.leaf2 = std('#32603a', { rough: 0.9, flat: true });
    M.terracotta = std('#b06a40', { rough: 0.9, map: texPot() });
    M.soil = std('#2a1a10', { rough: 1 });
    M.trunk = std('#5a4028', { rough: 0.95 });
    M.book = std('#f2ead8', { rough: 0.88 });
    M.shelfDark = std('#170d05', { rough: 1 });
    M.marble = std('#cfc8bc', { rough: 0.5 });
    M.ceramic = std('#3c5a52', { rough: 0.35 });
    M.candle = std('#f2e8d0', { rough: 0.6 });
    M.glassDark = std('#1c2434', { rough: 0.2, metal: 0.2 });
    M.feather = std('#eae4d2', { rough: 0.9 });
    M.rivet = std('#b98a3c', { rough: 0.4, metal: 0.7 });
    /* 玻璃：微透 + 弱金属反射 */
    M.glass = std('#9db8d4', { rough: 0.08, metal: 0.5, transparent: true, opacity: 0.16, depthWrite: false });
    /* 台灯罩：外绿内暖 */
    M.shadeGreen = std('#1a7a4a', { rough: 0.5, emissive: '#2a6a3a', ei: 0.22, side: THREE.DoubleSide });
    M.shadeInner = std('#2a7a4a', { rough: 0.6, emissive: '#ffd9a0', ei: 1.1, side: THREE.BackSide });
    M.bulb = std('#ffdba8', { rough: 0.4, emissive: '#ffc27a', ei: 2.6 });
    M.flame = std('#ffb050', { rough: 0.5, emissive: '#ff9a3a', ei: 2.4 });
    M.flameCore = std('#fff2c8', { rough: 0.4, emissive: '#ffe9b0', ei: 3 });
  }

  function mesh(geo, mat, x, y, z, name) {
    var m = new THREE.Mesh(geo, mat);
    if (x !== undefined) m.position.set(x, y, z);
    if (name) m.name = name;
    return m;
  }
  function box(w, h, d, mat, x, y, z, name) {
    var m = mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, name);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  function cyl(rt, rb, h, seg, mat, x, y, z, name) {
    var m = mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z, name);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
  function sph(r, w, h, mat, x, y, z, name) {
    var m = mesh(new THREE.SphereGeometry(r, w, h), mat, x, y, z, name);
    m.castShadow = true;
    return m;
  }
  function addAnim(g, fn) {
    if (!g.userData.anim) g.userData.anim = [];
    g.userData.anim.push(fn);
  }

  /* ================= 清理：毛毡圆桌 + 外圈 Ring + 棋盘外围散件（v1 契约） ================= */
  function cleanup(staticRoot) {
    var removed = { felt: 0, scatter: 0 };
    var kids = staticRoot.children.slice();
    for (var i = 0; i < kids.length; i++) {
      var o = kids[i];
      var isFelt = false;
      if (o.isMesh && o.geometry) {
        var p = o.geometry.parameters || {};
        if (o.geometry.type === 'CircleGeometry' && (p.radius || 0) >= 60) isFelt = true;
        if (o.geometry.type === 'RingGeometry' && (p.outerRadius || 0) >= 60) isFelt = true;
      }
      if (isFelt) { staticRoot.remove(o); removed.felt++; continue; }
      if (Math.abs(o.position.x) > 23.5 || Math.abs(o.position.z) > 17.5) {
        staticRoot.remove(o); removed.scatter++;
      }
    }
    return removed;
  }

  /* ================= 光照 / 雾 / 背景适配（幂等：__envTuned 标记，与 v1 参数一致） ================= */
  function tuneAtmosphere(scene) {
    scene.traverse(function (o) {
      if (o.isLight && !o.userData.__envTuned) {
        o.userData.__envTuned = true;
        if (o.isHemisphereLight) {
          o.intensity = 0.22;
          o.color = lin('#8f8168');
          if (o.groundColor) o.groundColor = lin('#1a120a');
        } else if (o.isAmbientLight) {
          o.intensity = 0.10;
          o.color = lin('#ffd9a8');
        } else if (o.isDirectionalLight) {
          if (o.castShadow) { o.intensity = 0.6; o.color = lin('#ffe3b8'); }   // 主阳光：保棋盘照度
          else { o.intensity = 0.1; }                                          // 冷补光压暗
        }
      }
    });
    if (scene.fog) { scene.fog.near = 150; scene.fog.far = 380; scene.fog.color = lin('#0d0906'); }
    if (scene.background && scene.background.isColor) scene.background = lin('#0a0705');
  }

  /* ================= 地板 + 四面墙 + 护墙板/踢脚/饰条/檐口 ================= */
  function buildRoomChildren(room) {
    var floor = mesh(new THREE.PlaneGeometry(240, 240), std('#8a6a44', { rough: 0.9, map: texFloor() }), 0, FLOOR_Y, 0, 'env3d-floor');
    floor.rotation.x = -PI / 2;
    floor.receiveShadow = true;
    room.add(floor);

    /* 墙：单面 Plane 正面朝房内（相机飞出房间近墙背面自动剔除）；壁纸上墙 */
    function wall(name, w, h, x, y, z, rotY, mat) {
      var m = mesh(new THREE.PlaneGeometry(w, h), mat, x, y, z, name);
      m.rotation.y = rotY;
      m.receiveShadow = true;
      m.userData.envWall = name;
      room.add(m);
    }
    /* 背墙窗侧段：宽 72，中心 (-100+-28)/2=-64 → 覆盖 x∈[-100,-28]，窗洞 [-28,28] 真正露出
     *（v1 误写为 -ROOM_HALF/2 - WIN.x0/2 = -36 → 两段合拢挡死窗洞、±[72,100] 反而漏空） */
    var WS = WIN.x0 - (-ROOM_HALF);   // 72
    wall('env3d-wall-back-L', WS, WALL_H, (-ROOM_HALF + WIN.x0) / 2, FLOOR_Y + WALL_H / 2, -ROOM_HALF, 0, M.wallBack);
    wall('env3d-wall-back-R', WS, WALL_H, (ROOM_HALF + WIN.x1) / 2, FLOOR_Y + WALL_H / 2, -ROOM_HALF, 0, M.wallBack);
    wall('env3d-wall-back-T', WIN.x1 - WIN.x0, FLOOR_Y + WALL_H - WIN.y1, 0, (FLOOR_Y + WALL_H + WIN.y1) / 2, -ROOM_HALF, 0, M.wallLow);
    wall('env3d-wall-back-B', WIN.x1 - WIN.x0, WIN.y0 - FLOOR_Y, 0, (FLOOR_Y + WIN.y0) / 2, -ROOM_HALF, 0, M.wallLow);
    wall('env3d-wall-front', 200, WALL_H, 0, FLOOR_Y + WALL_H / 2, ROOM_HALF, PI, M.wallWide);
    wall('env3d-wall-left', 200, WALL_H, -ROOM_HALF, FLOOR_Y + WALL_H / 2, 0, PI / 2, M.wallWide);
    wall('env3d-wall-right', 200, WALL_H, ROOM_HALF, FLOOR_Y + WALL_H / 2, 0, -PI / 2, M.wallWide);

    /* 护墙板面（贴 Canvas 分格面板，离墙 0.18 防 z-fight；整周期 repeat 无段间错缝） */
    var wainsMat = M.wainscot;
    function wains(w, x, z, rotY) {
      var m = mesh(new THREE.PlaneGeometry(w, 9), wainsMat, x, FLOOR_Y + 4.5, z, 'env3d-wainscot');
      m.rotation.y = rotY;
      m.receiveShadow = true;
      room.add(m);
    }
    wains(200, 0, -ROOM_HALF + 0.18, 0);
    wains(200, 0, ROOM_HALF - 0.18, PI);
    wains(200, -ROOM_HALF + 0.18, 0, PI / 2);
    wains(200, ROOM_HALF - 0.18, 0, -PI / 2);

    /* 踢脚线 + 护墙顶饰条 + 挂画线 + 檐口线脚（四墙） */
    var trims = [];
    [[0, -ROOM_HALF + 0.5, 0], [0, ROOM_HALF - 0.5, 0], [-ROOM_HALF + 0.5, 0, 1], [ROOM_HALF - 0.5, 0, 1]].forEach(function (a) {
      var horiz = a[2] === 0;
      trims.push(horiz ? [200, 1.8, 1.0, a[0], FLOOR_Y + 0.9, a[1]] : [1.0, 1.8, 200, a[0], FLOOR_Y + 0.9, a[1]]);
      trims.push(horiz ? [200, 0.9, 1.2, a[0], FLOOR_Y + 9.35, a[1]] : [1.2, 0.9, 200, a[0], FLOOR_Y + 9.35, a[1]]);
      trims.push(horiz ? [200, 0.55, 0.85, a[0], FLOOR_Y + 13, a[1]] : [0.85, 0.55, 200, a[0], FLOOR_Y + 13, a[1]]);
      trims.push(horiz ? [200, 1.4, 1.2, a[0], FLOOR_Y + 61, a[1]] : [1.2, 1.4, 200, a[0], FLOOR_Y + 61, a[1]]);
    });
    trims.forEach(function (a, i) {
      var b = box(a[0], a[1], a[2], i % 4 === 3 ? M.woodDark : M.woodMid, a[3], a[4], a[5]);
      if (i % 4 === 3) b.name = 'env3d-crown';
      if (i % 4 === 1) b.name = 'env3d-wainsrail';
      room.add(b);
    });

    /* 天花板：单面朝下（法线 -y）—— 室内低机位看到暖色顶棚而非黑洞；相机升到 y>32 俯视时
     * 背面剔除自动消失，不挡棋盘；不投/不接阴影，不影响主阳光照棋盘 */
    var ceil = mesh(new THREE.PlaneGeometry(200, 200), std('#3a2818', { rough: 0.95 }), 0, FLOOR_Y + WALL_H, 0, 'env3d-ceiling');
    ceil.rotation.x = PI / 2;
    ceil.castShadow = ceil.receiveShadow = false;
    room.add(ceil);
    /* 顶棚横梁 ×5：同为朝下单面 Plane（若用 Box，相机升到顶棚之上俯视时梁顶面会成 5 条遮挡带） */
    for (var bi = -2; bi <= 2; bi++) {
      var beam = mesh(new THREE.PlaneGeometry(200, 2.6), M.woodDeep, 0, FLOOR_Y + WALL_H - 0.04, bi * 40, 'env3d-beam');
      beam.rotation.x = PI / 2;
      beam.castShadow = beam.receiveShadow = false;
      room.add(beam);
    }
  }

  /* ================= 落地窗：4×4 分格 + 线脚 + 玻璃反光 + 晚霞 + 灯火微闪 + 窗台陈设 ================= */
  function buildWindow(parent) {
    var g = new THREE.Group(); g.name = 'env3d-window';
    var wCx = (WIN.x0 + WIN.x1) / 2, wCy = (WIN.y0 + WIN.y1) / 2;
    var wW = WIN.x1 - WIN.x0, wH = WIN.y1 - WIN.y0;
    var ZF = -ROOM_HALF + 0.6;   // 窗框基准 z

    /* 外框（厚 2）+ 内衬 stop liner */
    g.add(box(1.6, wH + 3.2, 2, M.woodMid, WIN.x0 - 0.8, wCy, ZF));
    g.add(box(1.6, wH + 3.2, 2, M.woodMid, WIN.x1 + 0.8, wCy, ZF));
    g.add(box(wW + 4.8, 1.6, 2, M.woodMid, wCx, WIN.y1 + 0.8, ZF));
    g.add(box(wW + 4.8, 1.6, 2, M.woodMid, wCx, WIN.y0 - 0.8, ZF));
    g.add(box(0.5, wH + 0.5, 1.1, M.woodDark, WIN.x0 + 0.25, wCy, ZF + 0.2));
    g.add(box(0.5, wH + 0.5, 1.1, M.woodDark, WIN.x1 - 0.25, wCy, ZF + 0.2));
    g.add(box(wW - 0.5, 0.5, 1.1, M.woodDark, wCx, WIN.y1 - 0.25, ZF + 0.2));
    g.add(box(wW - 0.5, 0.5, 1.1, M.woodDark, wCx, WIN.y0 + 0.25, ZF + 0.2));

    /* 4×4 分格：3 竖梃 + 3 横梃（十字格） */
    [-14, 0, 14].forEach(function (x) { g.add(box(0.55, wH, 0.9, M.woodMid, wCx + x, wCy, -ROOM_HALF + 0.45)); });
    [-5, 4, 13].forEach(function (y) { g.add(box(wW, 0.55, 0.9, M.woodMid, wCx, wCy + y, -ROOM_HALF + 0.45)); });
    /* 梃芯（中梃小方柱，出格架立体感） */
    [-14, 0, 14].forEach(function (x) {
      [-5, 4, 13].forEach(function (y) {
        g.add(box(0.85, 0.85, 0.7, M.woodDark, wCx + x, wCy + y, -ROOM_HALF + 0.4));
      });
    });

    /* 玻璃（微透单片）+ 斜向反光高光条 ×2 */
    var glass = mesh(new THREE.PlaneGeometry(wW, wH), M.glass, wCx, wCy, -ROOM_HALF + 0.2, 'env3d-glass');
    g.add(glass);
    var hl1 = mesh(new THREE.PlaneGeometry(3.2, 26), new THREE.MeshBasicMaterial({ color: lin('#ffffff'), transparent: true, opacity: 0.10, depthWrite: false }), -13, 1, -ROOM_HALF + 0.42);
    hl1.rotation.z = 0.32;
    g.add(hl1);
    var hl2 = mesh(new THREE.PlaneGeometry(1.8, 18), new THREE.MeshBasicMaterial({ color: lin('#ffe8c8'), transparent: true, opacity: 0.08, depthWrite: false }), 16.5, -1, -ROOM_HALF + 0.42);
    hl2.rotation.z = 0.32;
    g.add(hl2);

    /* 晚霞夜景大板（MeshBasic 自发光，不受灯光/雾影响；位于墙后仅窗洞可见） */
    var sky = mesh(new THREE.PlaneGeometry(wW + 8, wH + 8), new THREE.MeshBasicMaterial({ map: texSky() }), wCx, wCy, -ROOM_HALF - 1.5, 'env3d-sky');
    g.add(sky);

    /* 窗外灯火 ×3：MeshBasic 小板 + 相位错开 opacity 微闪（零分配 anim）；位置对应贴图亮窗簇 */
    var TW = [[-17, 3, 0], [5, 5.5, 2.2], [19, 1.5, 4.4]];
    for (var ti = 0; ti < TW.length; ti++) {
      (function (k) {
        var tw = mesh(new THREE.PlaneGeometry(2.2, 2.8),
          new THREE.MeshBasicMaterial({ color: lin('#ffd98a'), transparent: true, opacity: 0.5, depthWrite: false }),
          TW[k][0], TW[k][1], -ROOM_HALF - 0.9, 'env3d-twinkle');
        var mat = tw.material, ph = TW[k][2];
        addAnim(g, function (t) { mat.opacity = 0.3 + 0.38 * (0.5 + 0.5 * Math.sin(t * 1.6 + ph)); });
        g.add(tw);
      })(ti);
    }

    /* 窗台板 + 沿口 + 下裙线脚 + 托架 ×3 + 窗楣 */
    g.add(box(wW + 5, 0.9, 3.8, M.woodMid, wCx, WIN.y0 - 1.5, -ROOM_HALF + 1.6));
    g.add(box(wW + 5.6, 0.5, 4.2, M.woodDark, wCx, WIN.y0 - 2.2, -ROOM_HALF + 1.8));
    g.add(box(wW + 4, 0.7, 1.2, M.woodMid, wCx, WIN.y0 - 3.1, -ROOM_HALF + 0.7));
    [-20, 0, 20].forEach(function (x) { g.add(box(1.3, 2.6, 1.5, M.woodDark, wCx + x, WIN.y0 - 4.1, -ROOM_HALF + 0.8)); });
    g.add(box(wW + 2.0, 1.1, 1.6, M.woodMid, wCx, WIN.y1 + 2.1, ZF + 0.1));   /* 审计#12：楣板收窄，不伸到两侧书架顶 */
    g.add(box(wW + 2.4, 0.6, 2.2, M.woodDark, wCx, WIN.y1 + 2.9, ZF + 0.2));   /* 审计#12：冠板收窄 */

    /* 窗台陈设：花盆（陶盆 + 五叶）+ 书堆 + 斜倚小相框
     * v2.1：sillY 原为 WIN.y0-1.95（窗台板底面）→ 陈设半埋台板 0.9；改取台板顶面
     *   （板中心 WIN.y0-1.5 + 半厚 0.45 = WIN.y0-1.05），底面精确落台 */
    var sillY = WIN.y0 - 1.05;
    var pot = new THREE.Group(); pot.position.set(-13, sillY, -ROOM_HALF + 2.1); pot.name = 'env3d-sill-plant';
    pot.add(cyl(0.95, 0.72, 1.5, 10, M.terracotta, 0, 0.75, 0));
    pot.add(cyl(1.02, 1.0, 0.22, 10, M.woodDark, 0, 1.55, 0));
    pot.add(cyl(0.88, 0.88, 0.12, 10, M.soil, 0, 1.56, 0));
    var pr = RNG(91);
    for (var pl = 0; pl < 5; pl++) {
      var leaf = sph(0.85 + pr() * 0.4, 8, 6, pl % 2 ? M.leaf : M.leaf2,
        (pr() - 0.5) * 1.7, 2.2 + pr() * 1.3, (pr() - 0.5) * 1.5);
      leaf.scale.set(1.25, 0.5, 0.85);
      leaf.rotation.z = (pr() - 0.5) * 0.9;
      pot.add(leaf);
    }
    g.add(pot);
    g.add(box(4.4, 0.62, 3.0, M.book, 7, sillY + 0.31, -ROOM_HALF + 2.2));
    g.add(box(3.9, 0.55, 2.7, M.leather, 7.2, sillY + 0.9, -ROOM_HALF + 2.1));
    /* 相框微抬 0.08：rotation.y 0.25 把 3.2 宽边转入 z 后再 rotation.x -0.12 俯仰，
     * 底角比组原点低 ≈(1.6·sin0.25+0.175·cos0.25)·sin0.12≈0.068，抬 0.08 防沉台 */
    var frame = new THREE.Group(); frame.position.set(-3.5, sillY + 0.08, -ROOM_HALF + 2.0); frame.rotation.y = 0.25; frame.rotation.x = -0.12;
    frame.add(box(3.2, 4.0, 0.35, M.woodMid, 0, 2.0, 0));
    frame.add(mesh(new THREE.PlaneGeometry(2.6, 3.4), new THREE.MeshStandardMaterial({ map: texPicture(92), roughness: 0.9 }), 0, 2.0, 0.2));
    g.add(frame);

    parent.add(g);
  }

  /* ================= 书架 ×9（同色书群韵律 + 书立 + 横放书堆 + 架内暗部 + 柜顶摆件） ================= */
  var BOOK_PALETTE = ['#8a2f23', '#2f4a6e', '#3c5a34', '#6e4a1f', '#5c3060', '#a06a2c',
                      '#274044', '#7c3a52', '#42518a', '#845c2e', '#93553a', '#33523e'];
  var BOOK_RUNS = [0, 1, 1, 2, 2, 3];   /* 同色书群长度权重（2-5 本一群） */
  var BOOK_TOTAL = 821;                 /* 书脊实例总数锚定 v2 规模（smoke ≥700 / 汇报 821） */

  function buildShelf(parent, cx, cz, rotY, seed, sink) {
    var g = new THREE.Group();
    g.name = 'env3d-shelf';
    g.position.set(cx, FLOOR_Y, cz);
    g.rotation.y = rotY;
    var w = 28, h = 52, d = 10, r = RNG(seed);

    /* 书架本体：背板 / 架内暗部 / 侧板 / 顶底 / 檐口 / 裙座 / 前沿立柱 */
    g.add(box(w, h, 0.5, M.woodDark, 0, h / 2, -d / 2 + 0.25));
    g.add(mesh(new THREE.PlaneGeometry(w - 1.2, h - 1.6), M.shelfDark, 0, h / 2, -d / 2 + 0.55));
    g.add(box(0.6, h, d, M.woodDark, -w / 2 + 0.3, h / 2, 0));
    g.add(box(0.6, h, d, M.woodDark, w / 2 - 0.3, h / 2, 0));
    g.add(box(w, 0.7, d, M.woodDark, 0, h - 0.35, 0));
    g.add(box(w, 0.7, d, M.woodDark, 0, 0.35, 0));
    g.add(box(w + 1.6, 1.2, d + 1.2, M.woodMid, 0, h + 0.6, 0));
    g.add(box(w + 2.2, 0.6, d + 1.8, M.woodDark, 0, h + 1.45, 0));
    g.add(box(w, 1.6, d + 0.6, M.woodDeep, 0, 0.8, 0.2));
    g.add(box(0.9, h, 0.7, M.woodMid, -w / 2 + 0.5, h / 2, d / 2 - 0.25));
    g.add(box(0.9, h, 0.7, M.woodMid, w / 2 - 0.5, h / 2, d / 2 - 0.25));

    /* 4 块层板（5 行）+ 层板前沿压条 */
    var ROWS = 5, pitch = (h - 1.4) / ROWS;
    for (var k = 1; k < ROWS; k++) {
      g.add(box(w - 1.2, 0.4, d - 1.6, M.woodMid, 0, 0.7 + pitch * k, 0));
      g.add(box(w - 1.2, 0.6, 0.35, M.woodDark, 0, 0.7 + pitch * k + 0.4, d / 2 - 0.95));
    }

    /* 书脊 + 行内陈设 v2.1（穿模修复）--------------------------------------
     * v2 根因：实例矩阵把 y0（层板顶）当书中心而非底面 → 整排书下沉 bh/2 插入搁板；
     *   斜书 x 偏 ±bh·0.45 捅穿侧板；书深 8.0 + z 抖动 ±0.7 捅穿背板/顶到前沿压条；
     *   行内陈设 x 随机放置，与书脊互相穿插。
     * v2.1 规则（书架局部坐标）：
     *   行支承面 tops：row0=裙座顶 1.6 · row k=层板顶 0.7+pitch·k+0.2
     *   直立书：底面≡支承面（中心 y0+bh/2）· 书界 x∈[IX0,IX1]（侧板内脸-0.05）
     *   · z∈[ZB,ZF]（背板内脸+0.04 → 前沿压条背面-0.045）· 相邻书缝 0.015~0.03
     *   贴板斜书：仅限贴侧板端部 · 倾角 0.055~0.1rad（≤5.7°）· 绕底棱旋转 →
     *             AABB 底缘≡支承面、外缘距板脸 0.02，按 AABB 让位不与邻书相交
     *   陈设先占带（书立 7.5 / 相框 4.4 / 书堆 4.8 / 陶罐 2.4，含 0.15~0.3 余量），
     *   14 次随机试放 + 最大空档兜底，书只铺剩余空档 → 书-板/书-书/书-陈设零相交 */
    var IX0 = -13.35, IX1 = 13.35, ZB = -4.46, ZF = 3.83;
    var tops = [], caps = [];
    for (var rr = 0; rr < ROWS; rr++) {
      tops.push(rr === 0 ? 1.6 : 0.7 + pitch * rr + 0.2);
      var ceilY = rr === ROWS - 1 ? h - 0.7 : 0.7 + pitch * (rr + 1) - 0.2;
      caps.push(Math.min(8.8, ceilY - 0.3 - tops[rr]));
    }
    var mats = [], cols = [], leanN = 0;
    var tmpM = new THREE.Matrix4(), q = new THREE.Quaternion(),
        e = new THREE.Euler(), pos = new THREE.Vector3(), scl = new THREE.Vector3(),
        col = new THREE.Color();

    function bandFree(bands, a2, b2) {
      for (var bi2 = 0; bi2 < bands.length; bi2++) if (bands[bi2][0] < b2 && a2 < bands[bi2][1]) return false;
      return true;
    }
    function freeSpans(bands) {
      var s2 = bands.slice().sort(function (u, v) { return u[0] - v[0]; }), out = [], cur = IX0;
      for (var i2 = 0; i2 < s2.length; i2++) {
        if (s2[i2][0] > cur) out.push([cur, Math.min(s2[i2][0], IX1)]);
        if (s2[i2][1] > cur) cur = s2[i2][1];
      }
      if (cur < IX1) out.push([cur, IX1]);
      return out;
    }
    function decoX(bands, width) {
      for (var t2 = 0; t2 < 14; t2++) {
        var c2 = IX0 + width / 2 + r() * (IX1 - IX0 - width);
        if (bandFree(bands, c2 - width / 2, c2 + width / 2)) return c2;
      }
      var iv = freeSpans(bands), best = iv[0] || [IX0, IX1];
      for (var j2 = 1; j2 < iv.length; j2++) if (iv[j2][1] - iv[j2][0] > best[1] - best[0]) best = iv[j2];
      return (best[0] + best[1]) / 2;
    }
    function pickZ(bd) {                       /* 贴前沿微随机，背限自动钳回 */
      var zc = ZF - bd / 2 - r() * 0.55, lo = ZB + bd / 2;
      return zc < lo ? lo : zc;
    }
    function pushBook(px, py, pz, bw2, bh2, bd2, rotZ, hex, sh2) {
      e.set(0, 0, rotZ); q.setFromEuler(e);
      pos.set(px, py, pz); scl.set(bw2, bh2, bd2);
      tmpM.compose(pos, q, scl); mats.push(tmpM.clone());
      col.set(hex).convertSRGBToLinear(); col.multiplyScalar(sh2); cols.push(col.clone());
    }

    for (var row = 0; row < ROWS; row++) {
      var y0 = tops[row], capH = caps[row];
      /* 1) 行内陈设（仅 1/3 行；先占带，书脊避让 → 不再互相穿插） */
      var bands = [];
      if (row === 1 || row === 3) {
        var dK = row === 1 ? 0 : 1;
        if (r() < 0.55) {                                     /* L 形书立 ×2 + 直立靠书 */
          var ex = decoX(bands, 7.5); bands.push([ex - 3.75, ex + 3.75]);
          [-1, 1].forEach(function (sd) {
            g.add(box(0.5, 3.4, 4.2, M.iron, ex + sd * 3.2, y0 + 1.7, 0.2));
            g.add(box(1.6, 0.4, 4.2, M.iron, ex + sd * 2.45, y0 + 0.2, 0.2));
          });
          g.add(box(1.4, 4.6, 4.0, M.book, ex, y0 + 2.3, 0.2));   /* v2 斜 0.16 沉板 → 直立 */
        }
        if (r() < 0.75) {                                     /* 立式相框（贴背板） */
          var fx = decoX(bands, 4.4); bands.push([fx - 2.2, fx + 2.2]);
          g.add(box(3.8, 4.8, 0.4, M.woodMid, fx, y0 + 2.4, -d / 2 + 1.2));
          g.add(mesh(new THREE.PlaneGeometry(3.1, 4.0), new THREE.MeshStandardMaterial({ map: texPicture(seed * 7 + dK), roughness: 0.9 }), fx, y0 + 2.4, -d / 2 + 1.45));
        }
        if (r() < 0.7) {                                      /* 横放书堆 2-4 本错位叠放 */
          var sx = decoX(bands, 4.8); bands.push([sx - 2.4, sx + 2.4]);
          var sy = y0, nStack = 2 + ((r() * 3) | 0);
          for (var si = 0; si < nStack; si++) {
            var sw = 3.9 - r() * 0.9, sh3 = 0.5 + r() * 0.16;
            var sb = box(sw, sh3, 4.6 + r() * 0.8, si % 2 ? M.book : M.leather, sx + (r() - 0.5) * 0.5, sy + sh3 / 2, (r() - 0.5) * 1.2);
            sb.rotation.y = (r() - 0.5) * 0.22;
            g.add(sb);
            sy += sh3;
          }
        }
        if (r() < 0.3) {                                      /* 小陶罐 */
          var px2 = decoX(bands, 2.4); bands.push([px2 - 1.2, px2 + 1.2]);
          g.add(sph(1.05, 10, 8, M.terracotta, px2, y0 + 1.05, 1.2));
        }
      }
      /* 2) 贴侧板端部斜书（≤5.7°，绕底棱旋转：AABB 底=板顶 · 外缘贴板脸 0.02） */
      var spans = freeSpans(bands);
      for (var sp2 = 0; sp2 < spans.length; sp2++) {
        var a = spans[sp2][0], b = spans[sp2][1];
        if (a <= IX0 + 1e-6 && b - a > 3.2 && r() < 0.3) {
          var th = 0.055 + r() * 0.045;
          var lw = 1.0 + r() * 0.4, lh = Math.min(capH - 0.4, 3.8 + r() * 2.2), ld = 5.6 + r() * 2.0;
          var ext = lw * Math.cos(th) + lh * Math.sin(th);
          pushBook(IX0 + 0.02 + ext / 2, y0 + (lh * Math.cos(th) + lw * Math.sin(th)) / 2,
            pickZ(ld), lw, lh, ld, th, BOOK_PALETTE[(r() * BOOK_PALETTE.length) | 0], 0.78 + r() * 0.4);
          leanN++;
          a = IX0 + 0.02 + ext + 0.12;
        }
        if (b >= IX1 - 1e-6 && b - a > 3.2 && r() < 0.3) {
          var th2 = 0.055 + r() * 0.045;
          var lw2 = 1.0 + r() * 0.4, lh2 = Math.min(capH - 0.4, 3.8 + r() * 2.2), ld2 = 5.6 + r() * 2.0;
          var ext2 = lw2 * Math.cos(th2) + lh2 * Math.sin(th2);
          pushBook(IX1 - 0.02 - ext2 / 2, y0 + (lh2 * Math.cos(th2) + lw2 * Math.sin(th2)) / 2,
            pickZ(ld2), lw2, lh2, ld2, -th2, BOOK_PALETTE[(r() * BOOK_PALETTE.length) | 0], 0.78 + r() * 0.4);
          leanN++;
          b = IX1 - 0.02 - ext2 - 0.12;
        }
        if (b - a < 1.2) continue;
        /* 3) 剩余空档铺同色书群（底面≡y0 · 相邻缝 0.015~0.03 · 群间呼吸 + 留空档） */
        var x = a;
        while (x < b - 0.6 && mats.length < 150) {
          if (r() < 0.03) { x += 0.65 + r() * 0.75; continue; }              // 留空档
          var run = BOOK_RUNS[(r() * BOOK_RUNS.length) | 0] + 1;
          var rc = BOOK_PALETTE[(r() * BOOK_PALETTE.length) | 0];
          var rh = 4.4 + r() * 2.0, put = 0;
          for (var bi = 0; bi < run && x < b - 0.6 && mats.length < 150; bi++) {
            if (r() < 0.05) { x += 0.5 + r() * 0.5; continue; }
            var bw = 0.53 + r() * 1.0;
            var bh = Math.min(capH, rh + (r() - 0.5) * 1.3);
            if (bh < 3.3) { x += 0.25; continue; }
            if (x + bw > b) break;
            var bd = 5.4 + r() * 2.6;
            pushBook(x + bw / 2, y0 + bh / 2, pickZ(bd), bw, bh, bd, 0, rc, 0.78 + r() * 0.4);
            x += bw + 0.015 + r() * 0.015;
            put++;
          }
          if (put) x += 0.04 + r() * 0.1;
        }
      }
    }
    if (sink) sink.push({ g: g, mats: mats, cols: cols, leanN: leanN });

    /* 柜顶摆件：半身像 / 陶瓶 / 相框 / 瓷碗（按种子确定性二选二） */
    var topY = h + 1.75;
    var kinds = ['bust', 'vase', 'frame', 'bowl'];
    var k1 = kinds[(r() * 4) | 0], k2 = kinds[(r() * 4) | 0];
    [k1, k2].forEach(function (kind, ki) {
      var ox = ki === 0 ? -w / 4 : w / 4;
      if (kind === 'bust') {
        g.add(box(2.0, 0.8, 2.0, M.woodDeep, ox, topY + 0.4, -d / 2 + 1.6));
        g.add(sph(0.78, 10, 8, M.marble, ox, topY + 1.5, -d / 2 + 1.6));
        g.children[g.children.length - 1].scale.set(1, 1.15, 0.9);
        g.add(sph(0.5, 10, 8, M.marble, ox, topY + 2.4, -d / 2 + 1.6));
      } else if (kind === 'vase') {
        var pts = [];
        [[0.02, 0], [0.62, 0.1], [0.78, 0.6], [0.5, 1.25], [0.36, 1.6], [0.44, 1.85]].forEach(function (p) { pts.push(new THREE.Vector2(p[0], p[1])); });
        g.add(mesh(new THREE.LatheGeometry(pts, 10), M.ceramic, ox, topY, -d / 2 + 1.6));
      } else if (kind === 'frame') {
        var fr = new THREE.Group();
        fr.position.set(ox, topY, -d / 2 + 1.5);
        fr.rotation.y = (r() - 0.5) * 0.5;
        fr.add(box(2.6, 3.3, 0.3, M.woodMid, 0, 1.65, 0));
        fr.add(mesh(new THREE.PlaneGeometry(2.1, 2.8), new THREE.MeshStandardMaterial({ map: texPicture(seed * 11 + ki), roughness: 0.9 }), 0, 1.65, 0.17));
        g.add(fr);
      } else {
        g.add(sph(1.0, 10, 8, M.ceramic, ox, topY + 0.35, -d / 2 + 1.6));
        g.children[g.children.length - 1].scale.set(1, 0.55, 1);
      }
    });

    parent.add(g);
    return g;
  }
  function buildShelves(parent) {
    var pending = [];
    buildShelf(parent, -44, -95, 0, 11, pending);      /* 背墙窗左 */
    buildShelf(parent, 44, -95, 0, 12, pending);       /* 背墙窗右 */
    buildShelf(parent, -95, -56, PI / 2, 21, pending); /* 左墙三座 */
    buildShelf(parent, -95, -20, PI / 2, 22, pending);
    buildShelf(parent, -95, 16, PI / 2, 23, pending);
    buildShelf(parent, 95, -56, -PI / 2, 31, pending); /* 右墙三座 */
    buildShelf(parent, 95, -20, -PI / 2, 32, pending);
    buildShelf(parent, 95, 16, -PI / 2, 33, pending);
    buildShelf(parent, -38, 95, PI, 41, pending);      /* 前墙一座 */
    /* 书脊总数收敛到 BOOK_TOTAL（821）：从最满书架的行尾逐本回退 → 留自然端空档，
     * 不挪格不改尺只减实例；InstancedMesh 每架 1 个（1 draw call / 架）最后成型 */
    var total = 0;
    pending.forEach(function (p) { total += p.mats.length; });
    while (total > BOOK_TOTAL) {
      var big = pending[0];
      for (var i = 1; i < pending.length; i++) if (pending[i].mats.length > big.mats.length) big = pending[i];
      if (!big.mats.length) break;
      big.mats.pop(); big.cols.pop(); total--;
    }
    pending.forEach(function (p) {
      if (!p.mats.length) return;
      var inst = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), M.book, p.mats.length);
      inst.name = 'env3d-books';
      for (var k = 0; k < p.mats.length; k++) { inst.setMatrixAt(k, p.mats[k]); inst.setColorAt(k, p.cols[k]); }
      inst.instanceMatrix.needsUpdate = true;
      if (inst.instanceColor) inst.instanceColor.needsUpdate = true;
      inst.frustumCulled = false;           /* 实例包围球不随实例更新，直接关剔除防整架消失 */
      inst.castShadow = false; inst.receiveShadow = false;
      p.g.add(inst);
    });
  }

  /* ================= 书桌（棋盘压在桌面上；v1 契约不变 + 边缘压条） ================= */
  function buildDesk(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-desk';

    /* 桌面：56×42×2.5，顶面 y=0.66；顶面木纹 Canvas */
    var topMat = std('#8a5a2c', { rough: 0.55, map: texDeskWood() });
    var top = new THREE.Mesh(new THREE.BoxGeometry(DESK_W, DESK_T, DESK_D),
      [M.woodMid, M.woodMid, topMat, M.woodMid, M.woodMid, M.woodMid]);
    top.name = 'env3d-desk-top';
    top.position.set(0, DESK_TOP_Y - DESK_T / 2, 0);
    top.castShadow = top.receiveShadow = true;
    g.add(top);

    /* 桌面四边压条（深色收边） */
    g.add(box(DESK_W + 0.8, 0.7, 0.7, M.woodDeep, 0, DESK_TOP_Y - 0.35, -DESK_D / 2 + 0.1));
    g.add(box(DESK_W + 0.8, 0.7, 0.7, M.woodDeep, 0, DESK_TOP_Y - 0.35, DESK_D / 2 - 0.1));
    g.add(box(0.7, 0.7, DESK_D + 0.8, M.woodDeep, -DESK_W / 2 + 0.1, DESK_TOP_Y - 0.35, 0));
    g.add(box(0.7, 0.7, DESK_D + 0.8, M.woodDeep, DESK_W / 2 - 0.1, DESK_TOP_Y - 0.35, 0));

    /* 裙板 */
    g.add(box(50, 4, 34, M.woodMid, 0, DESK_TOP_Y - DESK_T / 2 - 2.3, 0));

    /* 四条车削桌腿（Lathe 旋成体，FLOOR_Y → 桌底） */
    var prof = [[1.7, 0], [1.35, 0.9], [1.0, 2.2], [1.6, 4.6], [1.95, 7.2], [1.45, 9.4],
                [0.92, 11.2], [0.85, 14.6], [1.35, 17.4], [1.5, 19.6], [1.05, 22.4],
                [0.88, 24.8], [1.25, 27.2], [1.45, 28.16]];
    var pts = [];
    for (var i = 0; i < prof.length; i++) pts.push(new THREE.Vector2(prof[i][0], prof[i][1]));
    var legGeo = new THREE.LatheGeometry(pts, 12);
    [[-24, -17], [24, -17], [-24, 17], [24, 17]].forEach(function (p) {
      var leg = mesh(legGeo, M.woodMid, p[0], FLOOR_Y, p[1]);
      leg.castShadow = leg.receiveShadow = true;
      g.add(leg);
    });

    /* 前后抽屉面板 ×3 + 铜拉手 ×3（两长侧均做，360° 环视不穿帮） */
    [1, -1].forEach(function (sz) {
      for (var k = -1; k <= 1; k++) {
        g.add(box(13.6, 2.7, 0.55, M.woodMid, k * 16.5, DESK_TOP_Y - DESK_T / 2 - 2.3, sz * 17.25));
        var knob = sph(0.42, 10, 8, M.brass, k * 16.5, DESK_TOP_Y - DESK_T / 2 - 2.3, sz * 17.65);
        g.add(knob);
      }
    });

    parent.add(g);
    return g;
  }

  /* ================= 地毯（织物 Canvas + 两端流苏） ================= */
  function buildRug(parent) {
    var rug = mesh(new THREE.PlaneGeometry(74, 56), std('#7c2f28', { rough: 0.96, map: texRug() }), 0, FLOOR_Y + 0.07, 2, 'env3d-rug');
    rug.rotation.x = -PI / 2;
    rug.receiveShadow = true;
    parent.add(rug);
    var frMat = std('#d8c9a8', { rough: 1 });
    [-37.2, 37.2].forEach(function (fx) {
      var fr = mesh(new THREE.PlaneGeometry(1.6, 54), frMat, fx, FLOOR_Y + 0.06, 2);
      fr.rotation.x = -PI / 2;
      parent.add(fr);
    });
  }

  /* ================= 皮椅（铆钉 InstancedMesh + 坐垫分块 + 木质扶手） ================= */
  function buildChair(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-chair';
    g.position.set(0, FLOOR_Y, 37);
    /* 交叉脚 + 立柱 + 座面平台 */
    g.add(box(2, 1.2, 13, M.leatherDark, 0, 0.6, 0));
    g.add(box(13, 1.2, 2, M.leatherDark, 0, 1.22, 0));
    g.add(cyl(1.1, 1.5, 14.8, 10, M.leatherDark, 0, 8.6, 0));
    g.add(box(13.5, 1.4, 12.5, M.leatherDark, 0, 16.2, 0));
    /* 坐垫（分块：主垫 + 前缘滚轴） */
    g.add(box(12.6, 2.6, 9.6, M.leather, 0, 18.2, 1.0));
    var roll = cyl(1.3, 1.3, 12.6, 10, M.leather, 0, 18.2, -4.5);
    roll.rotation.z = PI / 2;
    g.add(roll);
    /* 靠背（微后仰）+ 顶滚 + 侧护柱 */
    var back = box(12.6, 17, 2.4, M.leather, 0, 29.3, 5.8);
    back.rotation.x = 0.09;
    g.add(back);
    var topRoll = cyl(1.2, 1.2, 12.6, 10, M.leather, 0, 37.6, 6.9);
    topRoll.rotation.z = PI / 2;
    g.add(topRoll);
    [-1, 1].forEach(function (sx) {
      var bol = cyl(0.95, 0.95, 15, 8, M.leatherDark, sx * 6.3, 28.4, 5.4);
      bol.rotation.x = 0.09;
      g.add(bol);
    });
    /* 木质扶手（木搁手 + 前支撑柱） */
    [-1, 1].forEach(function (sx) {
      g.add(box(2.2, 1.3, 11, M.woodMid, sx * 7.6, 25.0, 0.4));
      g.add(cyl(0.55, 0.7, 4.8, 8, M.woodMid, sx * 7.6, 22.0, -4.3));
      g.add(box(1.8, 5.0, 1.8, M.leatherDark, sx * 7.6, 21.4, 5.2));
    });
    /* 铆钉：InstancedMesh 一次成型（坐垫前沿 / 靠背前棱 / 扶手外沿） */
    var riv = [];
    for (var fx = -5.25; fx <= 5.3; fx += 1.5) riv.push([fx, 19.9, -5.9]);
    [-1, 1].forEach(function (sd) {
      for (var by = 21.5; by <= 34.5; by += 2.3) riv.push([sd * 6.45, by, 4.55]);
      riv.push([sd * 8.8, 25.0, -4.0]);
      riv.push([sd * 8.8, 25.0, 0]);
      riv.push([sd * 8.8, 25.0, 4.2]);
    });
    var rivets = new THREE.InstancedMesh(new THREE.SphereGeometry(0.18, 8, 6), M.rivet, riv.length);
    rivets.name = 'env3d-rivets';
    var tm = new THREE.Matrix4();
    for (var ri = 0; ri < riv.length; ri++) {
      tm.makeTranslation(riv[ri][0], riv[ri][1], riv[ri][2]);
      rivets.setMatrixAt(ri, tm);
    }
    rivets.instanceMatrix.needsUpdate = true;
    rivets.frustumCulled = false;
    rivets.castShadow = false;
    g.add(rivets);
    parent.add(g);
  }

  /* ================= 木梯（平踏步 + 级缘条 + 板式立柱 + 球帽柱脚） ================= */
  function buildLadder(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-ladder';
    g.position.set(-33, FLOOR_Y, -78.7);
    g.rotation.y = 0.1;
    g.rotation.x = -0.464;                   /* 右柱球帽恰贴书架前沿角柱脸（z≈-89.9，y≈-9）；v2.1 后移 1.1：
                                                原 z=-79.8 时右杆端+球帽嵌入角柱 0.3~0.9（分段体积 0.42） */
    [-2.1, 2.1].forEach(function (x) {
      var rail = box(0.9, 23.5, 0.55, M.woodMid, x, 11.75, 0);
      g.add(rail);
      var cap = sph(0.55, 8, 6, M.woodDark, x, 23.5, 0);
      cap.scale.set(1, 0.7, 1);
      g.add(cap);
      g.add(box(1.6, 0.6, 1.4, M.woodDeep, x, 0.3, 0));   /* 柱脚垫 */
    });
    for (var k = 0; k < 7; k++) {
      var y = 2.5 + k * 3.1;
      g.add(box(4.2, 0.34, 1.25, M.woodMid, 0, y, 0));
      g.add(box(4.2, 0.16, 0.3, M.woodDark, 0, y + 0.25, 0.55));   /* 级缘防滑条 */
    }
    parent.add(g);
  }

  /* ================= 盆栽（分层双绿叶片 + 陶盆纹理 + 盆沿圈） ================= */
  function buildPlant(parent, x, z, s, seed, name) {
    var g = new THREE.Group();
    g.name = name;
    g.position.set(x, FLOOR_Y, z);
    g.scale.setScalar(s);
    var r = RNG(seed);
    g.add(cyl(2.6, 1.9, 4.2, 12, M.terracotta, 0, 2.1, 0));
    var rim = mesh(new THREE.TorusGeometry(2.55, 0.22, 6, 14), M.terracotta, 0, 4.2, 0);
    rim.rotation.x = PI / 2;
    g.add(rim);
    g.add(cyl(2.3, 2.3, 0.3, 12, M.soil, 0, 4.15, 0));
    g.add(cyl(0.35, 0.5, 6.5, 8, M.trunk, 0, 7.2, 0));
    /* 侧枝 ×2 */
    [0.6, -0.7].forEach(function (tilt, bi) {
      var br = cyl(0.14, 0.22, 3.6, 6, M.trunk, tilt * 1.6, 10.2, (bi - 0.5) * 1.4);
      br.rotation.z = tilt;
      g.add(br);
    });
    /* 分层叶片：深浅两绿交错，上下两层 */
    for (var k = 0; k < 9; k++) {
      var ang = k * 2.399 + r() * 0.5;
      var rad = 1.6 + r() * 1.9;
      var leaf = sph(1.15 + r() * 0.55, 8, 6, k % 2 ? M.leaf : M.leaf2,
        Math.cos(ang) * rad, 10.6 + (k % 3) * 1.75 + r(), Math.sin(ang) * rad);
      leaf.scale.set(1.5, 0.5, 0.95);
      leaf.rotation.y = -ang;
      leaf.rotation.z = (r() - 0.5) * 0.55;
      g.add(leaf);
    }
    parent.add(g);
    return g;
  }
  function buildDeskPlant(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-desk-plant';
    g.position.set(-25.2, DESK_TOP_Y, 2.5);   /* 审计#11：原位叶球压相框，移至桌面左中空档 */
    g.add(cyl(0.95, 0.72, 1.5, 10, M.terracotta, 0, 0.75, 0));
    var rim = mesh(new THREE.TorusGeometry(0.94, 0.09, 6, 12), M.terracotta, 0, 1.52, 0);
    rim.rotation.x = PI / 2;
    g.add(rim);
    var r = RNG(81);
    for (var k = 0; k < 5; k++) {
      var leaf = sph(0.72 + r() * 0.3, 8, 6, k % 2 ? M.leaf : M.leaf2, (r() - 0.5) * 1.4, 2.1 + r() * 0.9, (r() - 0.5) * 1.2);
      leaf.scale.set(1.3, 0.5, 0.85);
      leaf.rotation.z = (r() - 0.5) * 0.8;
      g.add(leaf);
    }
    parent.add(g);
  }

  /* ================= 地球仪（大陆贴图 + 经纬线框 + 子午圈 + 三足弯腿底座） ================= */
  function buildGlobe(parent) {
    var g = new THREE.Group();
    g.name = 'env3d-globe';
    g.position.set(-25.3, DESK_TOP_Y, -18.0);   /* 外环角位：地平圈 r2.65 → x∈[-27.95,-22.65] 不压 plinth(±22.3) */
    /* 三足弯腿（120° 分布外撇）+ 铜足端 */
    for (var f = 0; f < 3; f++) {
      var ang = f * PI * 2 / 3;
      var ox = Math.cos(ang) * 1.05, oz = Math.sin(ang) * 1.05;
      var leg = cyl(0.13, 0.2, 1.9, 8, M.brass, ox, 0.95, oz);
      leg.rotation.z = -Math.cos(ang) * 0.5;
      leg.rotation.x = Math.sin(ang) * 0.5;
      g.add(leg);
      g.add(sph(0.22, 8, 6, M.brass, Math.cos(ang) * 1.85, 0.23, Math.sin(ang) * 1.85));   /* 球脚底 y=0.01 落桌（原 0.16 沉桌 0.06） */
    }
    g.add(sph(0.55, 10, 8, M.brass, 0, 1.8, 0));
    g.add(cyl(0.22, 0.3, 1.7, 10, M.brass, 0, 2.8, 0));
    var collar = mesh(new THREE.TorusGeometry(0.36, 0.08, 6, 12), M.brass, 0, 3.6, 0);
    collar.rotation.x = PI / 2;
    g.add(collar);
    /* 地平圈 + 四根撑杆 */
    var horizon = mesh(new THREE.TorusGeometry(2.65, 0.12, 8, 40), M.brass, 0, 4.9, 0);
    horizon.rotation.x = PI / 2;
    g.add(horizon);
    for (var s = 0; s < 4; s++) {
      var sang = s * PI / 2 + PI / 4;
      var strut = cyl(0.08, 0.1, 1.4, 6, M.brass, Math.cos(sang) * 1.15, 4.15, Math.sin(sang) * 1.15);
      strut.rotation.z = -Math.cos(sang) * 0.7;
      strut.rotation.x = Math.sin(sang) * 0.7;
      g.add(strut);
    }
    /* 球体（自转组：球 + 线框 + 子午圈 + 斜轴） */
    var spin = new THREE.Group();
    spin.name = 'env3d-globe-spin';
    spin.position.set(0, 4.9, 0);
    spin.rotation.z = 0.41;
    var ball = mesh(new THREE.SphereGeometry(2.2, 24, 18), new THREE.MeshStandardMaterial({ map: texGlobe(), roughness: 0.5 }), 0, 0, 0);
    ball.castShadow = true;
    spin.add(ball);
    var wire = mesh(new THREE.SphereGeometry(2.26, 20, 14),
      new THREE.MeshBasicMaterial({ color: lin('#caa25e'), wireframe: true, transparent: true, opacity: 0.3 }), 0, 0, 0, 'env3d-globe-wire');
    spin.add(wire);
    var meridian = mesh(new THREE.TorusGeometry(2.45, 0.1, 8, 36, PI), M.brass, 0, 0, 0);
    meridian.rotation.y = 0.4;
    spin.add(meridian);
    spin.add(cyl(0.07, 0.07, 5.5, 6, M.brass, 0, 0, 0));
    spin.add(sph(0.18, 8, 6, M.brass, 0, 2.8, 0));
    spin.add(sph(0.18, 8, 6, M.brass, 0, -2.8, 0));
    g.add(spin);
    /* 缓慢摇摆 anim（零分配；摆幅 ≤0.3rad） */
    addAnim(g, function (t) { spin.rotation.y = 0.28 * Math.sin(t * 0.4); });
    parent.add(g);
  }

  /* ================= 台灯 ×2（绿罩 banker lamp：关节灯臂 + 罩内暖光 + 拉绳 + 呼吸微闪） ================= */
  function buildLamp(parent, x, z, lightIntensity, phase) {
    var g = new THREE.Group();
    g.name = 'env3d-lamp';
    g.position.set(x, DESK_TOP_Y, z);
    g.rotation.y = phase;
    /* 底座双阶 + 灯颈 + 关节球 + 上节灯臂 */
    g.add(cyl(2.0, 2.3, 0.5, 14, M.brass, 0, 0.25, 0));
    g.add(cyl(1.45, 1.65, 0.5, 14, M.brass, 0, 0.72, 0));
    g.add(cyl(0.22, 0.28, 3.2, 10, M.brass, 0, 2.55, 0));
    var collar = mesh(new THREE.TorusGeometry(0.34, 0.09, 6, 14), M.brass, 0, 4.15, 0);
    collar.rotation.x = PI / 2;
    g.add(collar);
    g.add(sph(0.34, 10, 8, M.brass, 0, 4.42, 0));
    var arm = cyl(0.16, 0.2, 1.9, 8, M.brass, 0, 5.3, 0);
    arm.rotation.z = 0.12;
    g.add(arm);
    /* 灯泡 + 绿罩（外绿内暖，r2.3 → 桌角位不压 plinth）+ 罩口铜环 + 顶钮 */
    g.add(sph(0.5, 10, 8, M.bulb, 0, 6.05, 0));
    var shade = mesh(new THREE.SphereGeometry(2.3, 16, 10, 0, PI * 2, 0, PI / 2), M.shadeGreen, 0, 6.2, 0);
    shade.scale.y = 0.76;
    g.add(shade);
    var inner = mesh(new THREE.SphereGeometry(2.14, 14, 8, 0, PI * 2, 0, PI / 2), M.shadeInner, 0, 6.2, 0);
    inner.scale.y = 0.72;
    g.add(inner);
    var rim = mesh(new THREE.TorusGeometry(2.24, 0.13, 6, 20), M.brass, 0, 6.22, 0);
    rim.rotation.x = PI / 2;
    g.add(rim);
    g.add(sph(0.3, 8, 6, M.brass, 0, 7.98, 0));
    /* 拉绳开关：罩沿垂下细绳 + 坠珠 */
    g.add(cyl(0.035, 0.035, 1.3, 4, M.iron, 2.1, 5.4, 0));
    g.add(sph(0.12, 6, 5, M.brass, 2.1, 4.7, 0));
    /* 暖光 PointLight + 呼吸微闪（emissive ±0.06，零分配 anim） */
    var bulbMat = M.bulb, innerMat = M.shadeInner;
    if (lightIntensity > 0) {
      var pl = new THREE.PointLight(lin('#ffbe72'), lightIntensity, 65, 2);
      pl.position.set(0, 6.0, 0);
      g.add(pl);
      addAnim(g, function (t) {
        var k = Math.sin(t * 2.2 + phase);
        bulbMat.emissiveIntensity = 2.6 + 0.06 * k;
        innerMat.emissiveIntensity = 1.1 + 0.06 * k;
        pl.intensity = lightIntensity * (1 + 0.05 * k);
      });
    }
    parent.add(g);
    return g;
  }

  /* ================= 壁挂灯笼油灯 ×2（挂架 + 链环 + 四柱笼 + 玻璃罩 + 火苗微闪；整体 ×3.2 适配房间尺度 ≈ 书架高 1/6） ================= */
  function buildLantern(parent, x, seed) {
    var g = new THREE.Group();
    g.name = 'env3d-lantern';
    g.position.set(x, FLOOR_Y + 24, -ROOM_HALF + 1.6);
    g.scale.setScalar(3.2);
    /* 挂架：墙板 + 悬臂 + 两个链环 */
    g.add(box(1.2, 1.6, 0.3, M.iron, 0, 1.9, -1.35));
    g.add(box(0.4, 0.4, 2.5, M.iron, 0, 1.9, -0.15));
    [1.35, 0.95].forEach(function (ly) {
      var link = mesh(new THREE.TorusGeometry(0.16, 0.05, 5, 10), M.iron, 0, ly, 1.05);
      link.rotation.y = PI / 2;
      g.add(link);
    });
    /* 笼体：顶帽（四棱锥）+ 四角柱 + 收口盘 + 底托 */
    var cap = mesh(new THREE.ConeGeometry(1.15, 0.9, 4), M.iron, 0, 0.5, 1.05);
    cap.rotation.y = PI / 4;
    g.add(cap);
    g.add(sph(0.15, 6, 5, M.iron, 0, 1.0, 1.05));
    [-0.72, 0.72].forEach(function (cx2) {
      [-0.72, 0.72].forEach(function (cz2) {
        g.add(cyl(0.05, 0.05, 1.75, 6, M.iron, cx2, -0.4, 1.05 + cz2));
      });
    });
    var tray = mesh(new THREE.CylinderGeometry(0.95, 0.72, 0.3, 4), M.iron, 0, -1.32, 1.05);
    tray.rotation.y = PI / 4;
    g.add(tray);
    g.add(sph(0.14, 6, 5, M.iron, 0, -1.52, 1.05));
    /* 玻璃罩（暖透 + 自发光让整盏灯笼在远处也读得出）+ 火焰（双层：焰心 + 外焰） */
    g.add(cyl(0.7, 0.7, 1.55, 10, std('#ffc98a', { rough: 0.15, transparent: true, opacity: 0.32, depthWrite: false, emissive: '#ff9a40', ei: 0.7 }), 0, -0.4, 1.05));
    var flame = sph(0.28, 8, 6, M.flame, 0, -0.2, 1.05);
    flame.scale.set(1, 1.6, 1);
    flame.castShadow = false;
    g.add(flame);
    var core = sph(0.14, 6, 5, M.flameCore, 0, -0.24, 1.05);
    core.scale.set(1, 1.5, 1);
    core.castShadow = false;
    g.add(core);
    /* 灯火 PointLight + 火苗摇曳（零分配 anim）；组已 ×2.2，光照距离按世界单位给足 */
    var pl = new THREE.PointLight(lin('#ffb46a'), 2.0, 80, 2);
    pl.position.set(0, -0.3, 1.05);
    g.add(pl);
    var ph = seed * 1.7;
    addAnim(g, function (t) {
      var k = 0.5 + 0.5 * Math.sin(t * 9 + ph);
      var j = Math.sin(t * 23 + ph * 3) * 0.06;
      flame.scale.set(1, 1.35 + 0.5 * k + j, 1);
      core.scale.set(1, 1.2 + 0.5 * k, 1);
      pl.intensity = 2.0 * (0.8 + 0.2 * k + j);
    });
    parent.add(g);
  }

  /* ================= 顶部暖聚光（罩住棋盘，保照度；不投影；v1 契约不变） ================= */
  function buildKeySpot(parent) {
    var spot = new THREE.SpotLight(lin('#ffdfae'), 1.15, 0, 0.6, 0.5, 1);
    spot.name = 'env3d-key-spot';
    spot.position.set(0, 55, 5);
    spot.castShadow = false;
    spot.target.position.set(0, 0.7, 0);
    parent.add(spot);
    parent.add(spot.target);
  }

  /* ================= 桌面陈设（全部在棋盘 plinth ±22.3×±16.3 之外的边环） ================= */
  function buildDeskSet(parent) {
    /* 书堆一（三本） */
    var s1 = new THREE.Group();
    s1.name = 'env3d-desk-books';
    s1.position.set(-25, DESK_TOP_Y, 14.5);
    s1.rotation.y = 0.3;
    s1.add(box(4.6, 0.7, 3.2, M.book, 0, 0.35, 0));
    s1.add(box(4.0, 0.6, 2.9, M.leather, 0.15, 1.0, 0.05));
    s1.add(box(3.4, 0.55, 2.6, M.book, -0.1, 1.58, -0.05));
    parent.add(s1);
    /* 书堆二（两本 + 小木匣） */
    var s2 = new THREE.Group();
    s2.name = 'env3d-desk-books2';
    s2.position.set(25.8, DESK_TOP_Y, -9);
    s2.rotation.y = -0.2;
    s2.add(box(4.2, 0.6, 3.0, M.leather, 0, 0.3, 0));
    s2.add(box(3.7, 0.55, 2.7, M.book, 0.12, 0.88, 0.06));
    s2.add(box(2.2, 1.2, 1.6, M.woodMid, -0.3, 1.76, 0.1));
    parent.add(s2);
    /* 墨水瓶 + 羽毛笔 */
    var ink = new THREE.Group();
    ink.name = 'env3d-desk-ink';
    ink.position.set(-25.5, DESK_TOP_Y, 7.5);
    ink.add(cyl(0.62, 0.8, 0.9, 10, M.glassDark, 0, 0.45, 0));
    ink.add(cyl(0.3, 0.34, 0.3, 10, M.glassDark, 0, 1.05, 0));
    ink.add(mesh(new THREE.CircleGeometry(0.42, 10), std('#101828', { rough: 0.25 }), 0, 0.755, 0));
    ink.children[ink.children.length - 1].rotation.x = -PI / 2;
    ink.add(mesh(new THREE.TorusGeometry(0.32, 0.06, 5, 10), M.brass, 0, 1.2, 0));
    /* 羽毛笔 v2.1：笔杆改笔尖端贴桌、粗端微翘（原反向使粗端沉桌 0.03）；羽片锥尖接笔杆粗端、
     * 沿杆轴向外平铺，scale.x 压薄成水平薄片（原竖片且离杆端 1.7 悬空、底缘穿桌 0.22） */
    var quillShaft = cyl(0.05, 0.09, 3.0, 6, M.feather, -0.4, 0.15, 2.6);
    quillShaft.rotation.z = PI / 2 + 0.06;
    quillShaft.rotation.y = 0.55;
    ink.add(quillShaft);
    var feather = mesh(new THREE.ConeGeometry(0.4, 1.5, 6), M.feather, 1.52, 0.285, 1.43);
    feather.scale.x = 0.35;
    feather.rotation.z = PI / 2 + 0.06;
    feather.rotation.y = 0.55;
    ink.add(feather);
    parent.add(ink);
    /* 黄铜烛台（火苗微闪） */
    var candle = new THREE.Group();
    candle.name = 'env3d-desk-candle';
    candle.position.set(25.8, DESK_TOP_Y, 8.5);
    candle.add(cyl(1.0, 1.15, 0.35, 12, M.brass, 0, 0.18, 0));
    candle.add(cyl(0.26, 0.34, 1.5, 10, M.brass, 0, 1.1, 0));
    candle.add(cyl(0.55, 0.42, 0.35, 10, M.brass, 0, 1.98, 0));
    candle.add(cyl(0.38, 0.38, 2.0, 10, M.candle, 0, 3.1, 0));
    var flame = sph(0.16, 8, 6, M.flame, 0, 4.35, 0);
    flame.scale.set(1, 1.7, 1);
    flame.castShadow = false;
    candle.add(flame);
    var core = sph(0.08, 6, 5, M.flameCore, 0, 4.3, 0);
    core.scale.set(1, 1.5, 1);
    core.castShadow = false;
    candle.add(core);
    addAnim(candle, function (t) {
      var k = 0.5 + 0.5 * Math.sin(t * 10.5 + 1.3);
      flame.scale.set(1, 1.4 + 0.55 * k, 1);
      core.scale.set(1, 1.2 + 0.5 * k, 1);
    });
    parent.add(candle);
    /* 小相框 */
    var fr = new THREE.Group();
    fr.name = 'env3d-desk-frame';
    fr.position.set(25.8, DESK_TOP_Y + 0.08, 15.8);   /* +0.08：yaw -0.3 把 3.4 宽边转入 z 后俯仰 -0.1，底角低 ≈0.064 */
    fr.rotation.y = -0.3;
    fr.rotation.x = -0.1;
    fr.add(box(3.4, 4.2, 0.3, M.woodMid, 0, 2.1, 0));
    fr.add(mesh(new THREE.PlaneGeometry(2.9, 3.7), std('#d8cdb4', { rough: 0.95 }), 0, 2.1, 0.17));
    fr.add(mesh(new THREE.PlaneGeometry(2.4, 3.0), new THREE.MeshStandardMaterial({ map: texPicture(93), roughness: 0.9 }), 0, 2.1, 0.19));
    parent.add(fr);
  }

  /* ================= 墙面挂画 ×4（画框 + 卡纸 + 画芯） ================= */
  function buildPictures(parent) {
    function picture(x, y, z, rotY, seed) {
      var g = new THREE.Group();
      g.position.set(x, y, z);
      g.rotation.y = rotY;
      g.add(box(7, 9, 0.5, M.woodMid, 0, 0, 0));
      g.add(mesh(new THREE.PlaneGeometry(6.2, 8.2), std('#d8cdb4', { rough: 0.95 }), 0, 0, 0.27));
      g.add(mesh(new THREE.PlaneGeometry(5.4, 7.4), new THREE.MeshStandardMaterial({ map: texPicture(seed), roughness: 0.9 }), 0, 0, 0.29));
      parent.add(g);
    }
    picture(-ROOM_HALF + 0.4, FLOOR_Y + 24, 60, PI / 2, 61);    /* 左墙 → 朝 +x */
    picture(ROOM_HALF - 0.4, FLOOR_Y + 24, 60, -PI / 2, 62);    /* 右墙 → 朝 -x */
    picture(35, FLOOR_Y + 24, ROOM_HALF - 0.4, PI, 63);         /* 前墙 → 朝 -z */
    picture(-80, FLOOR_Y + 24, -ROOM_HALF + 0.4, 0, 64);        /* 背墙 → 朝 +z */
  }

  /* ================= replace 主入口（幂等契约与 v1 一致） ================= */
  function replace(env) {
    var THREE2 = env && env.THREE, scene = env && env.scene, staticRoot = env && env.staticRoot;
    if (!THREE2 || !scene || !staticRoot) return;
    if (staticRoot.userData && staticRoot.userData.__env3dDone) return;   /* 幂等：二次调用直接返回 */

    var removed = cleanup(staticRoot);            /* 1) 清理毛毡/外圈/散件 */
    tuneAtmosphere(scene);                        /* 3) 光照/雾/背景（先行生效，__envTuned 幂等） */
    buildMaterials();

    var room = new THREE.Group();
    room.name = 'env3d-room';
    staticRoot.add(room);

    /* 2) 搭建书房（分段 try：单项失败不影响其余陈设与游戏） */
    var steps = [
      function () { buildRoomChildren(room); },
      function () { buildWindow(room); },
      function () { buildShelves(room); },
      function () { buildDesk(room); },
      function () { buildRug(room); },
      function () { buildChair(room); },
      function () { buildLadder(room); },
      function () { buildPlant(room, 63.5, -86, 1.0, 71, 'env3d-plant-tall'); },   /* 审计#10：外移+缩比，叶球不再插书架#12 结构板 */
      function () { buildPlant(room, -86, 52, 0.95, 72, 'env3d-plant-corner'); },
      function () { buildDeskPlant(room); },
      function () { buildGlobe(room); },
      function () { buildLamp(room, 25.4, -18.2, 1.0, 0.8); },
      function () { buildLamp(room, -25.4, 18.2, 0.75, 2.6); },
      function () { buildKeySpot(room); },
      function () { buildDeskSet(room); },
      function () { buildLantern(room, -72, 3); },
      function () { buildLantern(room, 72, 5); },
      function () { buildPictures(room); },
    ];
    var failed = [];
    for (var i = 0; i < steps.length; i++) {
      try { steps[i](); } catch (e) { failed.push(i + ': ' + (e && e.message)); }
    }

    /* 统计（供冒烟测试/汇报） */
    var meshes = 0, instanced = 0, anims = 0;
    scene.traverse(function (o) {
      if (o.isMesh) { meshes++; if (o.isInstancedMesh) instanced++; }
      if (o.userData && o.userData.anim) anims += o.userData.anim.length;
    });

    if (!staticRoot.userData) staticRoot.userData = {};
    staticRoot.userData.__env3dDone = true;       /* 建造完成才置位，失败可重入 */
    staticRoot.userData.__env3dInfo = { removed: removed, meshes: meshes, instanced: instanced, anims: anims, failed: failed };
    try {
      console.log('[Environment3D] 书房 v2 接管完成 · 移除毛毡 ' + removed.felt + ' / 散件 ' + removed.scatter +
        ' · 场景 mesh ' + meshes + '（InstancedMesh ' + instanced + ' · anim ' + anims + '）' +
        (failed.length ? ' · 失败项 ' + failed.join(';') : ''));
    } catch (e) { /* ignore */ }
  }

  return { replace: replace };
}

/* ---------- 导出（THREE 就绪后才组装；重复加载保留先注册者） ---------- */
if (typeof window !== 'undefined' && typeof THREE !== 'undefined') {
  if (!(window.Environment3D && window.Environment3D.replace)) {
    window.Environment3D = define(THREE);
  }
}
})();
