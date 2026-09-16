/* 大富翁·现代写实棋盘（港）格 33「铜锣湾」—— 港岛商厦转角路口 · 崇光白盒 + 弧形 LED 媒体塔 + 双层巴士街景 四年代（1990s→2020s）
 * 视觉真源 refs/modern/prop_33.png 四象限（左上1990s/右上2000s/左下2010s/右下2020s 同一块地 40 年演进）：
 * 转角地双街交汇（正前横街 + 右侧纵街，转角人行道 + 路缘石 + 黄斑马线两组 + 双黄线/车道虚线 lv2+）；弧角媒体大厦居路口
 * （两层通高暖光橱窗裙楼 + 弧面柱廊；lv1 瓷砖楼+肖像海报+红横幅 / lv2+ 玻璃化+弧形 LED 巨幕+弧顶玻璃雨棚），身后蓝绿媒体塔
 * （最高：两级退台玻璃冠 + 侧向 LED 环带 + 天线阵）、右后金铜幕墙塔（深色层间带）、左中白蓝玻璃塔（lv3+ 竖格栅）、崇光白盒
 * （深框大 logo 面朝右街 + 入口玻璃雨棚 + 暖光橱窗 + 屋顶立体字块，lv2+）、沿街商铺连排（骑柱廊 + 暖光橱窗 + 店招灯带 +
 * 布篷/竖招 + 立面空调阵 + 天台广告龙门架）、后巷唐楼（lv4 拆建细高玻璃塔）+ 服务裙楼；全部塔楼女儿墙 + 水箱/空调/太阳能/天线。
 * 年代演进（结构性）：lv1 1990s 米瓷砖楼群+海报+凸出招牌盒+布篷+淡斑马+稀树 4 车；lv2 2000s 三塔玻璃化+崇光+弧形 LED+
 *   巨幅广告+霓虹竖招+双黄线+护栏/巴士站亭/红绿灯+7 车；lv3 2010s 媒体塔长高+橱窗暖光+格栅塔+地铁亭+花箱+太阳能+彩涂巴士
 *   +10 车；lv4 2020s 最高媒体塔+天线阵+后巷拆建玻璃塔+满配街景 12 车 7 树。
 * 契约：window.Props3DModern[33](level 1..4) → 每次全新 Group；占地 ≤2.6×2.6（含一切凸出物，实测 2.56）；底面 y=0；正面 +z；
 * 高度带 lv1[0.8,1.4] lv2[1.2,1.8] lv3[1.6,2.3] lv4[2.0,2.9]（实测 1.33/1.63/2.00/2.57）；每级 mesh ≤55（同材质桶=1 mesh，
 * 实测 22/32/33/33）；三角 lv1≤9k/lv4≤24k（实测 ≈5.9k/8.2k/10.5k/12k）；Canvas ≤256px 程序纹理 19 张；零 Math.random（LCG
 * 种子流）；动画 2 项（LED/海报呼吸、橱窗+冠带+招牌呼吸）。
 * R1 变更（结构重构）：单直街 → L 转角双街交汇+人行道+黄斑马线+双黄线；后排通长矮墙 → 9 独立体量错落；主角弧角楼半径
 *   0.2→0.28+两层裙楼；立面平色 → 近白多层 overlay（窗带/幕墙分格/铜梃/铺装/叶斑）×顶点色主调×世界尺寸 boxUV（叉积法线
 *   主轴投影）；行道树列（高干三层冠）/路灯/布篷/骑柱廊/店招灯带/竖招/巨幅广告；车辆 6→12（红桶独立且全部前街 z≥0.9）。
 * R2 变更（清偿 12 条差距）：媒体塔冠部改两级退台+侧向 LED 环（去"青帽"）；裙楼南面通高暖光橱窗+弧面柱廊+雨棚檐带；玻璃
 *   提亮偏蓝+弧面梃 5 根/层；树移路缘并抬高冠底露出店招；全部塔楼女儿墙+屋顶设备阵；崇光放大 0.46×0.6+深框 logo+入口雨棚
 *   +屋顶字块；金塔金色+深色层间带+太阳能板；白蓝塔加高前移+6 根格栅；路缘石/铁护栏/巴士站亭/红绿灯/花箱/垃圾桶/井盖；
 *   lv1 媒体槽 7 层主导+立面空调阵+天台棚屋（去玻璃雨棚）；路灯变细、金属降金属度；后巷 B2 lv4 拆建玻璃塔；1990s 招牌盒。
 * R3 变更（收尾）：商铺连排 lv3+ 布篷 → 通长玻璃入口雨棚+立柱（2010s 语言）；主角楼玻璃顶点色再提亮偏蓝；头注实测数据回填。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_33] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TX = {}, BK;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function F(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? 'rgba(255,255,255,' + a + ')' : 'rgba(24,22,20,' + a * 0.8 + ')', R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
/* ---- 近白 overlay 纹理（顶点色承载主色） ---- */
var TXF = {
  t: function (g, w, h, R) { /* 瓷砖窗带（1 重复 = 1 层高 × 2 窗）：窗框+玻璃+窗台+层缝+空调影 */
    F(g, '#f4efe4', 0, 0, w, h); F(g, 'rgba(70,60,50,0.5)', 0, 0, w, 3); F(g, 'rgba(255,255,255,0.5)', 0, 3, w, 1);
    for (var i = 0; i < 8; i++) F(g, 'rgba(120,110,96,0.12)', i * 16 + 8, 10, 1, h - 14);
    for (var k = 0; k < 2; k++) { var x0 = k * 64 + 12; F(g, 'rgba(40,50,58,0.72)', x0, 14, 40, 30); F(g, 'rgba(210,228,238,0.5)', x0, 14, 40, 6); F(g, 'rgba(255,255,255,0.35)', x0 + 3, 22, 8, 18);
      F(g, 'rgba(58,64,70,0.6)', x0 - 3, 12, 46, 3); F(g, 'rgba(58,64,70,0.6)', x0 - 3, 44, 46, 3); F(g, 'rgba(58,64,70,0.5)', x0 - 3, 12, 3, 35); F(g, 'rgba(58,64,70,0.5)', x0 + 43, 12, 3, 35);
      F(g, 'rgba(255,255,255,0.55)', x0 - 5, 47, 50, 3); if (R() > 0.45) F(g, 'rgba(60,56,50,0.35)', x0 + 4, 4, 32, 8); }
    SPK(g, w, h, 60, 0.06, R); for (var s = 0; s < 4; s++) F(g, 'rgba(90,80,66,0.1)', R() * w, 0, 2 + R() * 3, h * (0.4 + R() * 0.5)); },
  c: function (g, w, h, R) { /* 混凝土/米石：分缝+噪点+污渍 */
    F(g, '#efece5', 0, 0, w, h); for (var y = 0; y < h; y += 32) { F(g, 'rgba(80,74,64,0.35)', 0, y, w, 2); F(g, 'rgba(255,255,255,0.3)', 0, y + 2, w, 1); }
    SPK(g, w, h, 90, 0.06, R); for (var i = 0; i < 7; i++) F(g, 'rgba(100,92,78,0.1)', R() * w, R() * h, 4 + R() * 8, 3 + R() * 7); },
  g: function (g, w, h, R) { /* 蓝绿玻璃幕墙分格：窗格明暗+斜反射带+竖梃横梃 */
    F(g, '#eef3f5', 0, 0, w, h); for (var y = 0; y < h; y += 32) for (var x = 0; x < w; x += 32) { var v = R(); F(g, v > 0.7 ? 'rgba(30,52,74,0.5)' : v < 0.22 ? 'rgba(255,255,255,0.5)' : 'rgba(96,128,150,0.3)', x + 3, y + 3, 26, 26); }
    g.fillStyle = 'rgba(255,255,255,0.32)'; for (var i = 0; i < 5; i++) { var x0 = R() * w; for (var y2 = 0; y2 < h; y2 += 2) g.fillRect((x0 + y2 * 0.7) % w, y2, 4, 2); }
    F(g, 'rgba(40,52,62,0.55)', 0, 0, w, 2); F(g, 'rgba(40,52,62,0.55)', 0, 30, w, 2); F(g, 'rgba(40,52,62,0.5)', 0, 62, w, 2); F(g, 'rgba(40,52,62,0.5)', 0, 94, w, 2);
    for (x = 0; x <= w; x += 32) F(g, 'rgba(52,64,74,0.5)', x - 1, 0, 2, h); SPK(g, w, h, 30, 0.05, R); },
  b: function (g, w, h, R) { /* 白蓝玻璃塔：层间白带+淡蓝窗格+细梃 */
    F(g, '#f2f6f7', 0, 0, w, h); F(g, 'rgba(255,255,255,0.75)', 0, 0, w, 10); F(g, 'rgba(150,160,168,0.4)', 0, 10, w, 2);
    for (var x = 0; x < w; x += 16) F(g, R() > 0.6 ? 'rgba(70,110,140,0.42)' : 'rgba(150,180,198,0.3)', x + 2, 13, 13, 17);
    for (x = 0; x <= w; x += 16) F(g, 'rgba(120,134,146,0.4)', x - 1, 12, 1, 20); F(g, 'rgba(255,255,255,0.4)', 4, 18, 10, 8); SPK(g, w, h, 24, 0.05, R); },
  o: function (g, w, h, R) { /* 金铜幕墙：密竖铜梃+琥珀窗格+斜光带 */
    F(g, '#f6f1e4', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, 'rgba(120,86,40,0.55)', x, 0, 3, h); F(g, 'rgba(255,236,200,0.4)', x + 3, 0, 1, h); F(g, R() > 0.6 ? 'rgba(150,104,44,0.4)' : 'rgba(226,182,110,0.34)', x + 4, 0, 12, h); }
    g.fillStyle = 'rgba(255,244,214,0.28)'; for (var i = 0; i < 4; i++) { var x0 = R() * w; for (var y = 0; y < h; y += 2) g.fillRect((x0 + y * 0.5) % w, y, 5, 2); } SPK(g, w, h, 24, 0.04, R); },
  a: function (g, w, h, R) { /* 柏油（暖灰）：骨料+轮迹+裂纹+补丁 */
    F(g, '#d9d6d0', 0, 0, w, h); SPK(g, w, h, 220, 0.1, R); F(g, 'rgba(60,58,56,0.14)', 0, 30, w, 14); F(g, 'rgba(60,58,56,0.14)', 0, 84, w, 14);
    for (var i = 0; i < 5; i++) { g.fillStyle = 'rgba(40,40,42,0.3)'; g.fillRect(R() * w, R() * h, 1, 8 + R() * 24); } F(g, 'rgba(120,112,100,0.12)', R() * w, R() * h, 20 + R() * 20, 8 + R() * 10); },
  p: function (g, w, h, R) { /* 人行道连锁砖：错缝块+缝+磨光 */
    F(g, '#f1ebe2', 0, 0, w, h); for (var y = 0; y < h; y += 32) { var o = (y / 32) % 2 ? 16 : 0; F(g, 'rgba(90,80,68,0.5)', 0, y, w, 2); for (var x = o - 32; x < w; x += 32) { F(g, 'rgba(90,80,68,0.45)', x, y, 2, 32); F(g, R() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(110,96,80,0.1)', x + 3, y + 3, 28, 27); } }
    SPK(g, w, h, 60, 0.05, R); },
  l: function (g, w, h, R) { /* 树冠叶斑 */
    F(g, '#f2f5ea', 0, 0, w, h); for (var i = 0; i < 40; i++) { g.fillStyle = i % 2 ? 'rgba(40,74,28,0.3)' : 'rgba(255,255,240,0.34)'; g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } },
  w: function (g, w, h, R) { /* 暖光橱窗 map+emissiveMap：窗格密度+局部暗窗 */
    F(g, '#fdf4de', 0, 0, w, h); for (var y = 0; y < h; y += 16) for (var x = 0; x < w; x += 16) if (R() > 0.68) F(g, 'rgba(90,56,20,0.5)', x + 2, y + 2, 12, 12);
    F(g, 'rgba(60,36,12,0.5)', 0, 0, w, 2); for (x = 0; x <= w; x += 16) F(g, 'rgba(60,36,12,0.45)', x - 1, 0, 2, h); },
  n: function (g, w, h, R) { /* 布篷条纹（近白，顶点色分红/绿） */
    F(g, '#f6f6f4', 0, 0, w, h); for (var x = 0; x < w; x += 16) F(g, 'rgba(255,255,255,0.5)', x, 0, 8, h); for (var y = 0; y < h; y += 3) F(g, 'rgba(0,0,0,0.07)', 0, y, w, 1); SPK(g, w, h, 26, 0.05, R); }
};
function tex(id) { if (_TX[id]) return _TX[id]; var sz = { t: [128, 64], w: [64, 64], n: [64, 64] }[id] || [128, 128];
  var c = cv(sz[0], sz[1]); TXF[id](c.getContext('2d'), c.width, c.height, lcg(3300 + id.charCodeAt(0) * 7));
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return (_TX[id] = t); }
/* ---- 文字/广告 Canvas（独立招牌面） ---- */
function TXD(id) { if (_TX[id]) return _TX[id]; var c, g, R = lcg(770 + id.length * 13), i, x, y;
  if (id === 'led') { c = cv(256, 128); g = c.getContext('2d'); F(g, '#0f2547', 0, 0, 256, 128); F(g, '#1d4472', 0, 86, 256, 42);
    F(g, '#c86ad4', 148, 12, 70, 86); F(g, '#f4dcc4', 164, 24, 34, 30); F(g, '#b85a84', 154, 58, 58, 40); F(g, '#e8569c', 148, 12, 70, 6);
    F(g, '#ffffff', 16, 22, 100, 13); F(g, '#cfe4ff', 16, 44, 74, 8); F(g, '#ffffff', 16, 60, 88, 8); F(g, '#ffd24a', 16, 92, 56, 15); F(g, '#4fd8f0', 82, 95, 42, 10);
    for (i = 0; i < 36; i++) { g.fillStyle = R() > 0.5 ? 'rgba(255,90,200,0.24)' : 'rgba(80,220,255,0.22)'; g.fillRect(R() * 256, R() * 128, 3 + R() * 6, 2 + R() * 3); }
    g.fillStyle = 'rgba(0,0,0,0.34)'; for (x = 0; x < 256; x += 6) g.fillRect(x, 0, 1, 128); for (y = 0; y < 128; y += 6) g.fillRect(0, y, 256, 1);
    g.fillStyle = 'rgba(255,255,255,0.5)'; for (i = 0; i < 26; i++) g.fillRect(R() * 256, R() * 128, 2, 2); }
  else if (id === 'post') { c = cv(128, 256); g = c.getContext('2d'); F(g, '#ecd4da', 0, 0, 128, 256); F(g, '#d8aebd', 8, 8, 112, 240);
    F(g, '#58362c', 36, 34, 56, 24); F(g, '#f4e4d8', 42, 56, 44, 44); F(g, '#58362c', 30, 56, 14, 88); F(g, '#58362c', 84, 56, 14, 88);
    F(g, '#d8627a', 42, 148, 44, 66); F(g, '#a23448', 18, 226, 92, 14); F(g, '#ffffff', 26, 230, 40, 7);
    for (i = 0; i < 60; i++) { g.fillStyle = R() > 0.5 ? 'rgba(70,34,34,0.12)' : 'rgba(255,255,255,0.2)'; g.fillRect(R() * 128, R() * 256, 2, 2); }
    g.fillStyle = 'rgba(255,244,224,0.4)'; g.fillRect(0, 0, 128, 12); g.fillRect(0, 0, 10, 256); }
  else if (id === 'sogo') { c = cv(256, 128); g = c.getContext('2d'); F(g, '#f6f8fa', 0, 0, 256, 128); F(g, '#1f5ccc', 0, 0, 256, 8); F(g, '#1f5ccc', 0, 120, 256, 8);
    g.strokeStyle = '#1f5ccc'; g.lineWidth = 7; g.beginPath(); g.arc(52, 62, 30, 0, 6.283); g.stroke();
    g.fillStyle = '#1f5ccc'; for (i = 0; i < 5; i++) { g.beginPath(); g.moveTo(52, 62); g.arc(52, 62, 26, i * 1.257 + 0.12, i * 1.257 + 1.05); g.closePath(); g.fill(); }
    g.font = 'bold 44px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('SOGO', 158, 48); g.font = 'bold 30px "Microsoft YaHei",sans-serif'; g.fillText('崇光百貨', 158, 94); }
  else if (id === 'sband') { c = cv(256, 64); g = c.getContext('2d'); var cs = ['#c03028', '#d8982c', '#2c8a8a', '#8a4aa8', '#c05028', '#3068b8'], tx = ['金行', '藥房', '茶餐廳', '地產', '錶行', '化妝'];
    for (i = 0; i < 6; i++) { F(g, cs[i], i * 42.6, 6, 40, 52); g.fillStyle = '#ffe9c0'; g.font = 'bold 22px "Microsoft YaHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tx[i], i * 42.6 + 20, 33); }
    F(g, 'rgba(255,255,255,0.3)', 0, 6, 256, 3); F(g, 'rgba(0,0,0,0.2)', 0, 56, 256, 4); }
  else if (id === 'neon1' || id === 'neon2') { c = cv(64, 128); g = c.getContext('2d'); var pk = id === 'neon1';
    F(g, pk ? '#3a1030' : '#0c2c34', 0, 0, 64, 128); g.strokeStyle = pk ? '#ff9ad0' : '#8ce8f4'; g.lineWidth = 4; g.strokeRect(4, 4, 56, 120);
    g.fillStyle = pk ? '#ffd2ec' : '#d8f8ff'; g.font = 'bold 30px "Microsoft YaHei",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(pk ? '珠' : '藥', 32, 40); g.fillText(pk ? '寶' : '房', 32, 86); }
  else if (id === 'bill1') { c = cv(128, 256); g = c.getContext('2d'); var gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#e85898'); gr.addColorStop(1, '#702878');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 256); F(g, '#f8d8e8', 52, 96, 24, 92); F(g, '#d8b8c8', 58, 76, 12, 20); F(g, '#ffffff', 58, 106, 5, 70);
    for (i = 0; i < 16; i++) { g.fillStyle = 'rgba(255,240,250,0.7)'; g.fillRect(R() * 128, R() * 256, 2 + R() * 3, 2 + R() * 3); }
    F(g, '#ffffff', 14, 26, 72, 12); F(g, '#ffd8f0', 14, 46, 52, 8); F(g, '#ffe9a8', 14, 226, 66, 12); }
  else if (id === 'bill2') { c = cv(128, 256); g = c.getContext('2d'); var gr2 = g.createLinearGradient(0, 0, 0, 256); gr2.addColorStop(0, '#38a8d8'); gr2.addColorStop(1, '#1c48a0');
    g.fillStyle = gr2; g.fillRect(0, 0, 128, 256); F(g, '#282838', 42, 92, 44, 40); F(g, '#3c3c50', 34, 128, 60, 78); F(g, '#f0c8a8', 50, 100, 28, 26);
    for (i = 0; i < 9; i++) F(g, 'rgba(255,255,255,0.24)', 0, 20 + i * 26, 128, 3);
    F(g, '#ffffff', 16, 30, 60, 13); F(g, '#b8e8ff', 16, 52, 44, 8); F(g, '#ffe070', 16, 226, 58, 12); }
  else { c = cv(128, 64); g = c.getContext('2d'); F(g, '#f4f4f2', 0, 0, 128, 64); F(g, '#c8203c', 0, 0, 128, 8); F(g, '#c8203c', 0, 56, 128, 8);
    g.strokeStyle = '#c8203c'; g.lineWidth = 6; g.beginPath(); g.arc(30, 32, 18, 0, 6.283); g.stroke();
    g.fillStyle = '#c8203c'; g.font = 'bold 30px Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('M', 30, 33);
    g.font = 'bold 24px "Microsoft YaHei",sans-serif'; g.fillStyle = '#33383e'; g.fillText('銅鑼灣', 82, 33); }
  var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return (_TX[id] = t); }
/* ---- 桶系统：桶=材质参数（同桶=1 mesh）；MS()→{b:桶,c:顶点色}；flush 合并+顶点色+boxUV（ws=每重复米数） ---- */
function MS(h, rg, mt, tx, ws, em, ei) { var k = rg + '|' + (mt || 0) + '|' + (tx || '') + '|' + (ws || 0) + '|' + (em || '') + '|' + (ei || 0);
  var b = BK[k] || (BK[k] = { rg: rg, mt: mt || 0, tx: tx || '', ws: ws || 0, em: em || '', ei: ei || 0, gs: [], cs: [] }); return { b: b, c: V(h) }; }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(m, g) { m.b.gs.push(g); m.b.cs.push(m.c); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function A2(m, geo, x, y, z, rx, ry) { put(m, xf(geo, x, y, z, rx || 0, ry || 0, 0)); }
function ARCQ(r, h, s) { return new THREE.CylinderGeometry(r, r, h, s, 1, true, 0, PI / 2); }
function flush(g) {
  for (var k in BK) { var b = BK[k], gs = b.gs, P = 0, i, j; if (!gs.length) continue;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ca = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) { var p = gs[i].attributes.position.array, c = b.cs[i]; pa.set(p, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2);
      for (j = 0; j < p.length; j += 3) { ca[o + j] = c[0]; ca[o + j + 1] = c[1]; ca[o + j + 2] = c[2]; } o += p.length; }
    if (b.ws) for (i = 0; i < P; i += 9) { /* boxUV：三角面叉积法线主轴投影 × 1/ws（世界尺寸烘焙，跨件无缝） */
      var ex = pa[i + 3] - pa[i], ey = pa[i + 4] - pa[i + 1], ez = pa[i + 5] - pa[i + 2], fx = pa[i + 6] - pa[i], fy = pa[i + 7] - pa[i + 1], fz = pa[i + 8] - pa[i + 2];
      var nx = Math.abs(ey * fz - ez * fy), ny = Math.abs(ez * fx - ex * fz), nz = Math.abs(ex * fy - ey * fx), s = 1 / b.ws;
      for (j = 0; j < 3; j++) { var q = i + j * 3, u = i / 9 * 6 + j * 2; if (ny >= nx && ny >= nz) { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 2] * s; } else if (nx >= nz) { ua[u] = pa[q + 2] * s; ua[u + 1] = pa[q + 1] * s; } else { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 1] * s; } } }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true });
    if (b.tx) m.map = tex(b.tx); if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tx) m.emissiveMap = m.map; }
    b.m = m; var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function EI(m, v) { if (m && m.b && m.b.m) m.b.m.emissiveIntensity = v; }
/* ---------- 主构建 ---------- */
function build(level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var g = new THREE.Group(); g.name = 'prop_33_lv' + lv; g.userData = { kind: 'property', propIdx: 33, level: lv, hotM: {} };
  BK = {}; var sg = [], i, j, k;
  /* 材质分区：铺装/柏油高粗糙颗粒；瓷砖窗带 0.8；幕墙低粗高金属；橱窗暖光 emissiveMap；红车漆独立桶（冒烟红桶断言） */
  var A = {
    pav: MS('#c4b39a', 0.92, 0, 'p', 0.35), asph: MS('#6e6a64', 0.95, 0, 'a', 0.55), conc: MS('#b8b2a6', 0.9, 0, 'c', 0.5),
    mkY: MS(lv === 1 ? '#cfc29a' : '#e3b93c', 0.62, 0, '', 0), mkW: MS('#e8e6dc', 0.62, 0, '', 0),
    tile: MS('#e9e1cd', 0.8, 0, 't', 0.16), tile2: MS('#d8ccb4', 0.8, 0, 't', 0.16), tile3: MS('#c8b49a', 0.8, 0, 't', 0.16),
    glass: MS('#a6cce0', 0.14, 0.4, 'g', 0.16), bluew: MS('#b8d0dc', 0.16, 0.35, 'b', 0.16), goldf: MS('#dcb86c', 0.2, 0.45, 'o', 0.32),
    band: MS('#f2ecdc', 0.82, 0, 'c', 0.5), dark: MS('#33383f', 0.4, 0.3, '', 0), metal: MS('#b8bec4', 0.4, 0.3, 'c', 0.4),
    glow: MS('#f4e8cc', 0.42, 0, 'w', 0.3, '#ffbd66', lv >= 3 ? 0.5 : 0.16), leaf: MS('#5c7c3a', 0.95, 0, 'l', 0.45), trunk: MS('#6a4e32', 0.9, 0, 'c', 0.4),
    busR: MS('#c22a1c', 0.5, 0.1, '', 0), taxiR: MS('#c83020', 0.36, 0.3, '', 0), carW: MS('#c9cbc6', 0.3, 0.35, '', 0),
    carD: MS('#3a4048', 0.28, 0.35, '', 0), carB: MS('#7c98ac', 0.32, 0.35, '', 0), tire: MS('#26282c', 0.92, 0, '', 0),
    sogo: MS('#f4f6f8', 0.7, 0, 'c', 0.5), blue: MS('#2858b8', 0.5, 0, '', 0), ledc: MS('#8ad8f0', 0.4, 0, '', 0, '#49c8f0', 0.6),
    awnR: MS('#c03830', 0.88, 0, 'n', 0.25), awnG: MS('#3f7a5e', 0.88, 0, 'n', 0.25), banner: MS('#c83850', 0.7, 0, '', 0), cream: MS('#efe8d8', 0.85, 0, 'c', 0.5)
  };
  var GB = 0.124; /* 建筑室内地坪（基座顶） */
  /* ---- 1 地面：基座 + 转角双街 + 人行道 + 黄斑马线 + 双黄线（lv2+） ---- */
  B(A.conc, 2.56, 0.1, 2.56, 0, 0.05, 0);
  B(A.asph, 2.12, 0.014, 0.44, -0.22, 0.107, 1.06); B(A.asph, 0.44, 0.014, 2.12, 1.06, 0.107, -0.22); B(A.asph, 0.44, 0.014, 0.44, 1.06, 0.107, 1.06);
  B(A.pav, 2.12, 0.024, 0.2, -0.22, 0.112, 0.74); B(A.pav, 0.2, 0.024, 2.12, 0.74, 0.112, -0.22); B(A.pav, 0.2, 0.024, 0.2, 0.74, 0.112, 0.74);
  for (i = 0; i < 4; i++) { B(A.mkY, 0.075, 0.006, 0.44, -0.74 + i * 0.15, 0.117, 1.06); B(A.mkY, 0.44, 0.006, 0.075, 1.06, 0.117, -0.74 + i * 0.15); }
  if (lv >= 2) { for (i = 0; i < 7; i++) { B(A.mkW, 0.14, 0.006, 0.03, -1.2 + i * 0.26, 0.117, 1.2); B(A.mkW, 0.03, 0.006, 0.14, 1.2, 0.117, -1.2 + i * 0.26); }
    for (j = -1; j <= 1; j += 2) { B(A.mkY, 0.44, 0.006, 0.014, -0.32, 0.117, 1.06 + j * 0.035); B(A.mkY, 0.34, 0.006, 0.014, -1.02, 0.117, 1.06 + j * 0.035);
      B(A.mkY, 0.014, 0.006, 0.44, 1.06 + j * 0.035, 0.117, -0.32); B(A.mkY, 0.014, 0.006, 0.34, 1.06 + j * 0.035, 0.117, -1.02); } }
  function band(w, d, x, y, z) { B(A.band, w, 0.014, d, x, y, z); }
  function mull(w, d, x, z, h0, h1) { B(A.dark, w, h1 - h0, d, x, (h0 + h1) / 2, z); }
  function TANK(x, y, z) { Y(A.metal, 0.036, 0.036, 0.08, 12, x, y, z); Y(A.metal, 0.042, 0.042, 0.012, 12, x, y + 0.045, z); }
  function ACU(x, y, z, ryy) { B(A.metal, 0.11, 0.075, 0.05, x, y, z, 0, ryy || 0, 0); B(A.dark, 0.09, 0.05, 0.012, x + (ryy ? 0.026 : 0), y, z + (ryy ? 0 : 0.026), 0, ryy || 0, 0); }
  function SIGN(id, w, h, x, y, z, ry, ei) { var t = TXD(id), m = new THREE.MeshStandardMaterial({ vertexColors: true, map: t, roughness: 0.5, metalness: 0.08, emissive: C('#ffffff'), emissiveMap: t, emissiveIntensity: ei || 0.1 });
    var geo = new THREE.PlaneGeometry(w, h), n = geo.attributes.position.count, ca = new Float32Array(n * 3);
    for (i = 0; i < n * 3; i++) ca[i] = 1; geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var ms = new THREE.Mesh(geo, m); ms.position.set(x, y, z); ms.rotation.y = ry || 0; ms.castShadow = ms.receiveShadow = true; g.add(ms); sg.push(m); return m; }
  function TREE(x, z, s) { s = s || 1; Y(A.trunk, 0.015 * s, 0.024 * s, 0.56 * s, 12, x, GB + 0.28 * s, z); /* 高干修剪行道树：冠底高于店招 */
    O(A.leaf, 0.12 * s, x, GB + 0.64 * s, z); O(A.leaf, 0.085 * s, x + 0.09 * s, GB + 0.56 * s, z + 0.04 * s); O(A.leaf, 0.07 * s, x - 0.08 * s, GB + 0.74 * s, z - 0.03 * s); }
  function LAMP(x, z, dx, dz) { Y(A.metal, 0.008, 0.011, 0.5, 12, x, GB + 0.25, z); B(A.metal, dx ? 0.12 : 0.01, 0.01, dz ? 0.12 : 0.01, x + 0.055 * dx, GB + 0.5, z + 0.055 * dz); B(A.ledc, 0.06, 0.016, 0.045, x + 0.1 * dx, GB + 0.49, z + 0.1 * dz); }
  function PARA(w, d, x, y, z) { B(A.band, w + 0.02, 0.03, 0.02, x, y, z + d / 2); B(A.band, w + 0.02, 0.03, 0.02, x, y, z - d / 2); B(A.band, 0.02, 0.03, d, x + w / 2, y, z); B(A.band, 0.02, 0.03, d, x - w / 2, y, z); } /* 女儿墙 */
  function RAIL(x0, x1, z, vert) { var L = x1 - x0, n = Math.max(2, Math.round(L / 0.1)), m; /* 人行道铁护栏：横杆+立柱 */
    if (vert) { B(A.metal, 0.008, 0.008, L, z, GB + 0.08, (x0 + x1) / 2); B(A.metal, 0.008, 0.008, L, z, GB + 0.05, (x0 + x1) / 2); for (m = 0; m <= n; m++) B(A.metal, 0.01, 0.09, 0.01, z, GB + 0.045, x0 + m * L / n); }
    else { B(A.metal, L, 0.008, 0.008, (x0 + x1) / 2, GB + 0.08, z); B(A.metal, L, 0.008, 0.008, (x0 + x1) / 2, GB + 0.05, z); for (m = 0; m <= n; m++) B(A.metal, 0.01, 0.09, 0.01, x0 + m * L / n, GB + 0.045, z); } }
  function PLANTER(x, z) { B(A.cream, 0.12, 0.06, 0.09, x, GB + 0.03, z); O(A.leaf, 0.045, x - 0.03, GB + 0.085, z); O(A.leaf, 0.04, x + 0.035, GB + 0.08, z + 0.01); }
  function BIN(x, z) { Y(A.dark, 0.018, 0.016, 0.06, 12, x, GB + 0.03, z); }
  /* ---- 2 主角媒体大厦（路口转角）：直段两盒+1/4 圆弧；两层玻璃裙楼（柱廊+暖光橱窗）；楼身 lv1 瓷砖+海报 / lv2+ 玻璃+弧形 LED；弧顶雨棚 ---- */
  var xa = -0.01, x1 = 0.61, za = -0.02, z1 = 0.54, r = 0.28, ax = x1 - r, az = z1 - r;
  var hgl = lv === 1 ? { b: A.tile.b, c: V('#e6d8bc') } : { b: A.glass.b, c: V('#a8d0e6') };
  var HFL = [3, 4, 5, 6][lv - 1], fh = 0.17, hy = GB + 0.3, yc;
  B(A.cream, x1 - xa, 0.3, az - za, (xa + x1) / 2, GB + 0.15, (za + az) / 2);
  B(A.cream, ax - xa, 0.3, z1 - az, (xa + ax) / 2, GB + 0.15, (az + z1) / 2);
  A2(A.glow, ARCQ(r, 0.3, 12), ax, GB + 0.15, az);
  B(A.glow, ax - xa - 0.04, 0.26, 0.03, (xa + ax) / 2, GB + 0.15, z1 - 0.012); /* 南面两层通高暖光橱窗 */
  for (i = 0; i < 3; i++) B(A.dark, 0.035, 0.3, 0.035, xa + 0.05 + i * 0.14, GB + 0.15, z1 + 0.012);
  for (k = 1; k < 4; k++) { var ca0 = k * PI / 8; B(A.dark, 0.035, 0.3, 0.035, ax + Math.cos(ca0) * (r + 0.012), GB + 0.15, az + Math.sin(ca0) * (r + 0.012)); } /* 弧面柱廊 */
  B(A.band, ax - xa + 0.06, 0.02, 0.09, (xa + ax) / 2, GB + 0.19, z1 + 0.03); /* 一层雨棚檐带 */
  B(A.band, x1 - xa + 0.03, 0.035, az - za + 0.03, (xa + x1) / 2, hy, (za + az) / 2);
  B(A.band, ax - xa + 0.03, 0.035, z1 - az + 0.03, (xa + ax) / 2, hy, (az + z1) / 2);
  A2(A.band, ARCQ(r + 0.02, 0.035, 12), ax, hy, az);
  for (i = 0; i < HFL; i++) {
    yc = hy + i * fh + fh / 2;
    B(hgl, x1 - xa, fh - 0.015, az - za, (xa + x1) / 2, yc, (za + az) / 2);
    B(hgl, ax - xa, fh - 0.015, z1 - az, (xa + ax) / 2, yc, (az + z1) / 2);
    A2(hgl, ARCQ(r, fh - 0.015, 12), ax, yc, az);
    B(A.band, x1 - xa + 0.025, 0.016, az - za + 0.025, (xa + x1) / 2, hy + (i + 1) * fh, (za + az) / 2);
    B(A.band, ax - xa + 0.025, 0.016, z1 - az + 0.025, (xa + ax) / 2, hy + (i + 1) * fh, (az + z1) / 2);
    A2(A.band, ARCQ(r + 0.015, 0.016, 10), ax, hy + (i + 1) * fh, az);
    for (k = 1; k < 3; k++) mull(0.012, 0.012, xa + k * 0.11, z1 + 0.008, yc - fh / 2 + 0.02, yc + fh / 2 - 0.02);
    for (k = 1; k < 6; k++) { var an = k * PI / 12; B(lv === 1 ? A.dark : A.metal, 0.012, fh - 0.04, 0.012, ax + Math.cos(an) * (r + 0.007), yc, az + Math.sin(an) * (r + 0.007)); }
  }
  var htop = hy + HFL * fh;
  if (lv === 1) { SIGN('post', 0.34, 0.52, ax + Math.cos(PI / 4) * (r + 0.012), hy + 1.4 * fh, az + Math.sin(PI / 4) * (r + 0.012), PI / 4, 0.16);
    B(A.banner, ax - xa - 0.06, 0.05, 0.014, (xa + ax) / 2, GB + 0.36, z1 + 0.008); }
  else { var LEDH = [0.3, 0.5, 0.68][lv - 2];
    var lm = new THREE.MeshStandardMaterial({ map: TXD('led'), roughness: 0.35, metalness: 0.1, emissive: C('#ffffff'), emissiveMap: TXD('led'), emissiveIntensity: 0.55, side: THREE.DoubleSide });
    var ledo = new THREE.Mesh(ARCQ(r + 0.022, LEDH, 14), lm); ledo.position.set(ax, hy + 0.24 + LEDH / 2, az); ledo.castShadow = ledo.receiveShadow = true; g.add(ledo); g.userData.hotM.led = lm; }
  if (lv <= 2) SIGN('sband', 0.3, 0.08, (xa + ax) / 2, GB + 0.26, z1 + 0.014, 0, 0.12); /* 1990s-2000s 转角楼裙楼店招 */
  PARA(x1 - xa, az - za, (xa + x1) / 2, htop + 0.015, (za + az) / 2); PARA(ax - xa, z1 - az, (xa + ax) / 2, htop + 0.015, (az + z1) / 2);
  if (lv >= 2) { A2(A.glass, new THREE.RingGeometry(0.07, r + 0.03, 12, 1, -PI / 2, PI / 2), ax, htop + 0.015, az, -PI / 2, 0); /* 弧顶玻璃雨棚（2000s+） */
    Y(A.metal, 0.012, 0.012, 0.09, 12, ax + r * 0.5, htop + 0.03, az + r * 0.5); Y(A.metal, 0.012, 0.012, 0.09, 12, ax + r * 0.95, htop + 0.03, az + r * 0.12); }
  else { B(A.tile2, 0.14, 0.1, 0.12, ax - 0.02, htop + 0.05, az - 0.02); TANK(ax + 0.1, htop + 0.05, az - 0.12); } /* 1990s 天台棚屋+水箱 */
  B(A.conc, x1 - xa - 0.1, 0.04, az - za - 0.1, (xa + x1) / 2, htop + 0.02, (za + az) / 2); ACU((xa + x1) / 2 - 0.22, htop + 0.06, za + 0.08); TANK((xa + x1) / 2 + 0.05, htop + 0.06, za + 0.16);
  if (lv >= 3) Y(A.metal, 0.008, 0.008, 0.2, 12, (xa + x1) / 2 - 0.12, htop + 0.14, za + 0.16);
  /* ---- 3 媒体塔（身后最高，lv1 混凝土瓷砖 → lv2+ 蓝绿玻璃+退台冠部+冠带+天线阵） ---- */
  var mx = -0.24, mz = -0.98, mw = 0.54, md = 0.5, MFL = [7, 7, 9, 12][lv - 1], mfh = [0.15, 0.16, 0.165, 0.16][lv - 1], mh = MFL * mfh;
  var mgl = lv === 1 ? { b: A.tile.b, c: V('#d8d2c2') } : { b: A.glass.b, c: V('#8cc2ca') };
  B(mgl, mw, mh, md, mx, GB + mh / 2, mz);
  for (i = 2; i <= MFL; i += 2) band(mw + 0.02, md + 0.02, mx, GB + i * mfh, mz);
  mull(0.014, 0.014, mx - mw / 2 + 0.09, mz + md / 2 + 0.007, GB, GB + mh); mull(0.014, 0.014, mx + 0.09, mz + md / 2 + 0.007, GB, GB + mh); mull(0.014, 0.014, mx + mw / 2 - 0.09, mz + md / 2 + 0.007, GB, GB + mh);
  mull(0.014, 0.014, mx + mw / 2 + 0.007, mz - md / 2 + 0.09, GB, GB + mh); mull(0.014, 0.014, mx + mw / 2 + 0.007, mz + 0.09, GB, GB + mh);
  PARA(mw, md, mx, GB + mh + 0.015, mz);
  if (lv === 1) { TANK(mx + 0.14, GB + mh + 0.05, mz + 0.1); ACU(mx - 0.15, GB + mh + 0.04, mz - 0.1); Y(A.metal, 0.007, 0.002, 0.16, 12, mx, GB + mh + 0.08, mz);
    for (i = 0; i < 3; i++) ACU(mx - 0.16 + i * 0.16, GB + mh - 0.55 + (i % 2) * 0.3, mz + md / 2 + 0.03); } /* 1990s 立面空调阵 */
  else { var mcw = mw * 0.72, mcd = md * 0.72, mch = lv >= 4 ? 0.18 : 0.12; /* 两级退台冠：玻璃机房 + 侧向 LED 环带 + 混凝土顶盖 + 天线阵 */
    B({ b: A.glass.b, c: V('#8cc2ca') }, mcw, mch, mcd, mx, GB + mh + mch / 2, mz);
    B(A.ledc, mcw + 0.012, 0.025, 0.012, mx, GB + mh + mch - 0.03, mz + mcd / 2 + 0.006); B(A.ledc, mcw + 0.012, 0.025, 0.012, mx, GB + mh + mch - 0.03, mz - mcd / 2 - 0.006);
    B(A.ledc, 0.012, 0.025, mcd + 0.012, mx + mcw / 2 + 0.006, GB + mh + mch - 0.03, mz); B(A.ledc, 0.012, 0.025, mcd + 0.012, mx - mcw / 2 - 0.006, GB + mh + mch - 0.03, mz);
    B(A.conc, mcw * 0.7, 0.05, mcd * 0.7, mx, GB + mh + mch + 0.025, mz);
    Y(A.metal, 0.006, 0.002, lv >= 4 ? 0.3 : 0.22, 12, mx, GB + mh + mch + 0.05 + (lv >= 4 ? 0.15 : 0.11), mz);
    if (lv >= 4) for (k = -1; k <= 1; k += 2) { Y(A.metal, 0.005, 0.002, 0.16, 12, mx + k * 0.08, GB + mh + mch + 0.13, mz + k * 0.06); B(A.metal, 0.09, 0.008, 0.008, mx + k * 0.08, GB + mh + mch + 0.18, mz + k * 0.06); } }
  /* ---- 4 金铜幕墙塔（右后） / 白蓝玻璃塔（左中，lv3+ 竖格栅） ---- */
  var gx = 0.34, gz = -1.04, gw = 0.5, gd = 0.44, GFL = [4, 6, 7, 9][lv - 1], gh = GFL * 0.15;
  var ggl = lv === 1 ? { b: A.tile3.b, c: V('#c8ac8c') } : { b: A.goldf.b, c: V('#e0be74') };
  B(ggl, gw, gh, gd, gx, GB + gh / 2, gz);
  if (lv === 1) for (i = 2; i <= GFL; i += 2) band(gw + 0.015, gd + 0.015, gx, GB + i * 0.15, gz);
  else for (i = 1; i <= GFL; i++) { B(A.dark, gw + 0.012, 0.012, gd + 0.012, gx, GB + i * 0.15, gz); } /* 金塔深色层间带（铜框幕墙） */
  PARA(gw, gd, gx, GB + gh + 0.015, gz);
  if (lv >= 2) { B({ b: A.goldf.b, c: V('#e0be74') }, gw * 0.5, 0.09, gd * 0.5, gx, GB + gh + 0.045, gz); Y(A.metal, 0.006, 0.002, 0.14, 12, gx, GB + gh + 0.16, gz);
    ACU(gx + 0.12, GB + gh + 0.05, gz + 0.1, PI / 2); B(A.dark, 0.16, 0.012, 0.1, gx - 0.12, GB + gh + 0.05, gz - 0.1, 0, 0, -0.35); } /* 屋顶太阳能板 */
  else { TANK(gx + 0.1, GB + gh + 0.05, gz); ACU(gx - 0.1, GB + gh - 0.3, gz + gd / 2 + 0.03); ACU(gx + 0.1, GB + gh - 0.45, gz + gd / 2 + 0.03); }
  var bx = -0.86, bz = -0.36, bw = 0.5, bd = 0.48, BFL = [5, 7, 8, 9][lv - 1], bh = BFL * 0.17;
  var bgl = lv === 1 ? { b: A.tile2.b, c: V('#e2dac6') } : { b: A.bluew.b, c: V('#bcd4e0') };
  B(bgl, bw, bh, bd, bx, GB + bh / 2, bz);
  for (i = 1; i <= BFL; i += 2) band(bw + 0.015, bd + 0.015, bx, GB + i * 0.17, bz);
  if (lv >= 3) for (i = 0; i < 6; i++) B(A.metal, 0.012, bh - 0.05, 0.024, bx - bw / 2 + 0.06 + i * 0.076, GB + bh / 2, bz + bd / 2 + 0.01); /* 2010s+ 竖格栅饰面 */
  PARA(bw, bd, bx, GB + bh + 0.015, bz);
  if (lv === 1) { TANK(bx - 0.12, GB + bh + 0.05, bz + 0.08); ACU(bx + 0.14, GB + bh + 0.04, bz - 0.1); for (i = 0; i < 3; i++) ACU(bx - 0.16 + i * 0.16, GB + bh - 0.4 + (i % 2) * 0.25, bz + bd / 2 + 0.03); }
  else { B(A.metal, 0.14, 0.05, 0.12, bx + 0.08, GB + bh + 0.025, bz - 0.06); Y(A.metal, 0.006, 0.002, 0.14, 12, bx - 0.12, GB + bh + 0.1, bz + 0.08);
    if (lv >= 4) for (i = 0; i < 3; i++) B(A.ledc, 0.016, 0.02, 0.016, bx - 0.15 + i * 0.15, GB + bh + 0.012, bz + 0.14); }
  /* ---- 5 沿街商铺连排（前排左）：骑柱廊+暖光橱窗+布篷+店招灯带+竖招+双栋楼身+巨幅广告+水箱龙门架 ---- */
  var sx = -0.66, sz = 0.39, sw = 1.2, sd = 0.5;
  B(A.cream, sw, 0.3, sd, sx, GB + 0.15, sz);
  B(A.glow, sw - 0.16, 0.2, 0.03, sx, GB + 0.15, sz + sd / 2 - 0.045);
  for (i = 0; i < 7; i++) B(A.dark, 0.045, 0.3, 0.045, sx - sw / 2 + 0.09 + i * 0.19, GB + 0.15, sz + sd / 2 + 0.012);
  var awnN = lv <= 2 ? 4 : 0; /* 1990s-2000s 布篷 → 2010s+ 玻璃入口雨棚 */
  for (i = 0; i < awnN; i++) B(i % 2 ? A.awnG : A.awnR, 0.15, 0.012, 0.13, sx - 0.42 + i * 0.28, GB + 0.325, sz + sd / 2 + 0.06, -0.45, 0, 0);
  if (lv >= 3) { B(A.glass, sw - 0.08, 0.014, 0.17, sx, GB + 0.33, sz + sd / 2 + 0.07); B(A.dark, 0.014, 0.2, 0.014, sx - sw / 2 + 0.06, GB + 0.23, sz + sd / 2 + 0.14); B(A.dark, 0.014, 0.2, 0.014, sx + sw / 2 - 0.06, GB + 0.23, sz + sd / 2 + 0.14); } /* 2010s+ 玻璃入口雨棚 */
  SIGN('sband', 1.08, 0.085, sx, GB + 0.35, sz + sd / 2 + 0.016, 0, lv >= 3 ? 0.35 : 0.12);
  if (lv >= 2) { SIGN('neon1', 0.07, 0.2, sx - 0.36, GB + 0.45, sz + sd / 2 + 0.02, 0, 0.5); SIGN('neon2', 0.07, 0.2, sx + 0.28, GB + 0.45, sz + sd / 2 + 0.02, 0, 0.5); }
  var SA = [4, 5, 6, 7][lv - 1], SB = [3, 4, 5, 6][lv - 1], sah = SA * 0.15, sbh = SB * 0.15;
  B(A.tile, 0.71, sah, sd - 0.06, -0.905, GB + 0.3 + sah / 2, sz - 0.02);
  B(A.tile2, 0.47, sbh, sd - 0.06, -0.295, GB + 0.3 + sbh / 2, sz - 0.02);
  for (i = 1; i <= SA; i++) band(0.72, sd - 0.04, -0.905, GB + 0.3 + i * 0.15, sz - 0.02);
  for (i = 1; i <= SB; i++) band(0.48, sd - 0.04, -0.295, GB + 0.3 + i * 0.15, sz - 0.02);
  mull(0.012, 0.012, -1.1, sz + sd / 2 - 0.02, GB + 0.3, GB + 0.3 + sah); mull(0.012, 0.012, -0.68, sz + sd / 2 - 0.02, GB + 0.3, GB + 0.3 + sah);
  mull(0.012, 0.012, -0.4, sz + sd / 2 - 0.02, GB + 0.3, GB + 0.3 + sbh); mull(0.012, 0.012, -0.18, sz + sd / 2 - 0.02, GB + 0.3, GB + 0.3 + sbh);
  ACU(-1.02, GB + 0.3 + sah * 0.55, sz + sd / 2 - 0.025); ACU(-0.58, GB + 0.3 + sah * 0.25, sz + sd / 2 - 0.025); ACU(-0.34, GB + 0.3 + sbh * 0.35, sz + sd / 2 - 0.025);
  ACU(-0.8, GB + 0.3 + sah * 0.8, sz + sd / 2 - 0.025); ACU(-0.16, GB + 0.3 + sbh * 0.7, sz + sd / 2 - 0.025); /* 立面空调机阵（港式） */
  var saTop = GB + 0.3 + sah, sbTop = GB + 0.3 + sbh;
  PARA(0.71, sd - 0.06, -0.905, saTop + 0.015, sz - 0.02); PARA(0.47, sd - 0.06, -0.295, sbTop + 0.015, sz - 0.02);
  TANK(-1.05, saTop + 0.05, sz - 0.12); TANK(-0.2, sbTop + 0.05, sz - 0.14); ACU(-0.4, sbTop + 0.04, sz - 0.02, PI / 2); Y(A.metal, 0.008, 0.008, 0.1, 12, -0.82, saTop + 0.05, sz - 0.18);
  var fr = lv >= 2 ? 0.42 : 0.24; /* 天台广告龙门架（1990s 矮架 / 2000s+ 高架） */
  B(A.metal, 0.5, 0.014, 0.02, -0.905, saTop + fr - 0.01, sz + 0.21); B(A.metal, 0.02, fr, 0.02, -1.14, saTop + fr / 2, sz + 0.21); B(A.metal, 0.02, fr, 0.02, -0.67, saTop + fr / 2, sz + 0.21);
  if (lv >= 3) B(A.dark, 0.2, 0.012, 0.12, -0.7, saTop + 0.06, sz - 0.1, 0, 0, -0.35); /* 太阳能板 */
  if (lv >= 2) SIGN('bill1', 0.4, 0.36, -0.905, saTop + 0.22, sz + 0.222, 0, 0.2);
  if (lv >= 3) { B(A.metal, 0.02, 0.48, 0.02, -0.44, sbTop + 0.24, sz + 0.21); B(A.metal, 0.02, 0.48, 0.02, -0.15, sbTop + 0.24, sz + 0.21); SIGN('bill2', 0.3, 0.42, -0.295, sbTop + 0.26, sz + 0.222, 0, 0.2); }
  /* ---- 6 后巷矮楼 ×2 + 崇光白盒（lv2+：蓝 logo+入口雨棚+屋顶绿化 lv3+） ---- */
  var C2 = [3, 3, 6, 10][lv - 1], c2h = [0.14, 0.14, 0.15, 0.16][lv - 1], b2h = C2 * c2h; /* 后巷 B2：唐楼 → lv3 加层 → lv4 拆建细高玻璃塔（2020s） */
  B(lv >= 4 ? { b: A.glass.b, c: V('#9cc4d8') } : { b: A.tile2.b, c: V('#d8ccb4') }, 0.44, b2h, 0.4, -1.02, GB + b2h / 2, -1.04);
  for (i = 2; i <= C2; i += 2) band(0.46, 0.42, -1.02, GB + i * c2h, -1.04);
  TANK(-1.12, GB + b2h + 0.05, -1.14); PARA(0.44, 0.4, -1.02, GB + b2h + 0.015, -1.04);
  ACU(-0.9, GB + b2h + 0.04, -0.98); if (lv >= 3) B(A.dark, 0.16, 0.012, 0.1, -1.0, GB + b2h + 0.05, -0.9, 0, 0, -0.35); if (lv >= 4) Y(A.metal, 0.006, 0.002, 0.14, 12, -1.02, GB + b2h + 0.1, -1.04);
  if (lv <= 2) for (i = 0; i < 4; i++) B([A.banner, A.blue, A.mkY, A.banner][i], 0.1, 0.05, 0.03, [-1.1, -0.85, -0.45, -0.2][i], GB + 0.55 + (i % 2) * 0.15, sz + sd / 2 - 0.02); /* 1990s-2000s 凸出招牌盒 */
  if (lv <= 2) { B(A.blue, 0.1, 0.05, 0.03, 0.1, GB + 0.5, z1 + 0.012); B(A.mkY, 0.1, 0.05, 0.03, 0.25, GB + 0.66, z1 + 0.012); }
  var C3 = [2, 2, 3, 3][lv - 1]; B(A.tile3, 0.4, C3 * 0.14, 0.36, -0.28, GB + C3 * 0.07, -0.3); ACU(-0.28, GB + C3 * 0.14 + 0.04, -0.3); Y(A.metal, 0.01, 0.01, 0.1, 12, -0.14, GB + C3 * 0.14 + 0.05, -0.36);
  PARA(0.4, 0.36, -0.28, GB + C3 * 0.14 + 0.015, -0.3); Y(A.metal, 0.03, 0.03, 0.05, 12, -0.38, GB + C3 * 0.14 + 0.03, -0.22);
  if (lv >= 2) { /* 崇光百货白盒：石材白盒 + 蓝檐带 + 大 logo 面（右街）+ 入口玻璃雨棚 + 屋顶立体字块 + 设备 + 绿化（lv3+） */
    B(A.sogo, 0.46, 0.6, 0.44, 0.36, GB + 0.3, -0.25); B(A.blue, 0.47, 0.045, 0.45, 0.36, GB + 0.58, -0.25);
    B(A.dark, 0.012, 0.42, 0.45, 0.595, GB + 0.36, -0.25); /* logo 深框 */
    SIGN('sogo', 0.4, 0.4, 0.605, GB + 0.36, -0.25, PI / 2, 0.22);
    B(A.glass, 0.09, 0.02, 0.36, 0.635, GB + 0.3, -0.25); B(A.dark, 0.02, 0.28, 0.02, 0.66, GB + 0.15, -0.41); B(A.dark, 0.02, 0.28, 0.02, 0.66, GB + 0.15, -0.09);
    B(A.glow, 0.012, 0.13, 0.3, 0.598, GB + 0.075, -0.25); /* 入口暖光橱窗 */
    for (i = 0; i < 4; i++) B(A.blue, 0.02, 0.07, 0.05, 0.59, GB + 0.64, -0.37 + i * 0.08); /* 屋顶 SOGO 立体字块（右街可见） */
    ACU(0.3, GB + 0.64, -0.36, PI / 2); if (lv >= 3) { B(A.leaf, 0.32, 0.02, 0.14, 0.36, GB + 0.615, -0.12); O(A.leaf, 0.04, 0.24, GB + 0.65, -0.36); } if (lv >= 4) TANK(0.48, GB + 0.65, -0.4);
  }
  function TL(x, z, dx, dz) { Y(A.metal, 0.008, 0.01, 0.3, 12, x, GB + 0.15, z); B(A.metal, dx ? 0.18 : 0.012, 0.01, dz ? 0.18 : 0.012, x + 0.09 * dx, GB + 0.3, z + 0.09 * dz); /* 转角红绿灯：杆+横臂+灯箱+红/绿灯珠 */
    B(A.dark, 0.03, 0.07, 0.03, x + 0.17 * dx, GB + 0.265, z + 0.17 * dz); B(A.banner, 0.014, 0.014, 0.014, x + 0.17 * dx - 0.012 * dz, GB + 0.285, z + 0.17 * dz - 0.012 * dx); B(A.leaf, 0.014, 0.014, 0.014, x + 0.17 * dx - 0.012 * dz, GB + 0.25, z + 0.17 * dz - 0.012 * dx); }
  /* ---- 7 街道家具：路缘石 / 行道树列 / 路灯 / 护栏（lv2+）/ 巴士站亭（lv2+）/ 红绿灯（lv2+）/ 地铁亭（lv3+）/ 花箱（lv3+）/ 垃圾桶 / 井盖 ---- */
  B(A.cream, 2.12, 0.03, 0.02, -0.22, 0.121, 0.85); B(A.cream, 0.02, 0.03, 2.12, 0.85, 0.121, -0.22); B(A.cream, 0.2, 0.03, 0.02, 0.74, 0.121, 0.85); B(A.cream, 0.02, 0.03, 0.2, 0.85, 0.121, 0.74);
  var TP = [[-1.12, 0.79], [-0.72, 0.79], [-0.3, 0.79], [0.14, 0.79], [0.79, 0.14], [0.79, -0.36], [0.79, -0.9]];
  for (i = 0; i < [4, 5, 6, 7][lv - 1]; i++) TREE(TP[i][0], TP[i][1], 0.84 + (i % 3) * 0.07);
  LAMP(-0.92, 0.79, 0, 1); if (lv >= 2) { LAMP(0.36, 0.79, 0, 1); LAMP(0.79, -0.62, 1, 0); } if (lv >= 4) LAMP(0.79, -1.14, 1, 0);
  if (lv >= 2) { RAIL(-1.24, -0.88, 0.835, false); RAIL(-0.2, 0.34, 0.835, false); RAIL(-1.24, -0.72, 0.835, true); RAIL(-0.24, 0.3, 0.835, true);
    B(A.metal, 0.012, 0.22, 0.012, -0.5, GB + 0.11, 0.7); B(A.metal, 0.012, 0.22, 0.012, -0.28, GB + 0.11, 0.7); B(A.glass, 0.28, 0.012, 0.1, -0.39, GB + 0.23, 0.72); B(A.glass, 0.26, 0.16, 0.01, -0.39, GB + 0.13, 0.665); /* 巴士站亭 */
    TL(0.62, 0.8, 0, 1); TL(0.8, 0.62, 1, 0); }
  if (lv >= 3) { B(A.dark, 0.17, 0.13, 0.15, 0.74, GB + 0.065, 0.74); B(A.glass, 0.15, 0.1, 0.13, 0.74, GB + 0.07, 0.74); SIGN('mtr', 0.11, 0.055, 0.74, GB + 0.31, 0.74, PI / 4, 0.3); Y(A.metal, 0.008, 0.008, 0.24, 12, 0.74, GB + 0.19, 0.74);
    PLANTER(-0.64, 0.69); PLANTER(0.0, 0.69); PLANTER(0.69, -0.14); }
  BIN(-0.08, 0.7); if (lv >= 2) BIN(0.7, -0.5);
  B(A.dark, 0.09, 0.012, 0.07, -0.5, GB + 0.006, 0.7); if (lv >= 2) B(A.dark, 0.07, 0.012, 0.09, 0.7, GB + 0.006, -0.9); Y(A.dark, 0.03, 0.03, 0.006, 12, -0.9, 0.117, 1.18);
  /* ---- 8 车流：双层巴士 / 红的士 / 私家车（红桶全部前街 z≥0.9，冒烟红桶断言） ---- */
  function WHEEL(x, z, vz) { Y(A.tire, 0.024, 0.024, 0.02, 12, x, 0.148, z, vz ? 0 : PI / 2, 0, vz ? PI / 2 : 0); } /* vz=沿 z 行驶：轴沿 x */
  function BUS(x, z, ry, pm) { var ca = Math.cos(ry), sa = Math.sin(ry), vz = Math.abs(sa) > 0.5; pm = pm || A.busR;
    B(pm, 0.4, 0.1, 0.15, x, 0.199, z, 0, ry, 0); B(A.cream, 0.4, 0.085, 0.14, x, 0.291, z, 0, ry, 0);
    B(A.dark, 0.4, 0.032, 0.152, x, 0.199, z, 0, ry, 0); B(A.dark, 0.4, 0.028, 0.148, x, 0.286, z, 0, ry, 0);
    B(A.cream, 0.4, 0.014, 0.14, x, 0.34, z, 0, ry, 0);
    for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) WHEEL(x + a * 0.13 * ca + b * 0.062 * sa, z - a * 0.13 * sa + b * 0.062 * ca, vz); }
  function TAXI(x, z, ry) { var ca = Math.cos(ry), sa = Math.sin(ry), vz = Math.abs(sa) > 0.5;
    B(A.taxiR, 0.2, 0.05, 0.095, x, 0.16, z, 0, ry, 0); B(A.taxiR, 0.11, 0.042, 0.088, x - 0.012 * ca, 0.203, z + 0.012 * sa, 0, ry, 0);
    B(A.dark, 0.1, 0.03, 0.09, x - 0.012 * ca, 0.203, z + 0.012 * sa, 0, ry, 0);
    for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) WHEEL(x + a * 0.06 * ca + b * 0.042 * sa, z - a * 0.06 * sa + b * 0.042 * ca, vz); }
  function CAR(x, z, m, ry) { var ca = Math.cos(ry), sa = Math.sin(ry), vz = Math.abs(sa) > 0.5;
    B(m, 0.19, 0.045, 0.09, x, 0.152, z, 0, ry, 0); B(m, 0.1, 0.038, 0.084, x - 0.014 * ca, 0.192, z + 0.014 * sa, 0, ry, 0);
    B(A.dark, 0.095, 0.026, 0.086, x - 0.014 * ca, 0.193, z + 0.014 * sa, 0, ry, 0);
    for (var a = -1; a <= 1; a += 2) for (var b = -1; b <= 1; b += 2) WHEEL(x + a * 0.055 * ca + b * 0.04 * sa, z - a * 0.055 * sa + b * 0.04 * ca, vz); }
  BUS(-0.62, 1.0, 0); TAXI(-0.02, 1.17, 0); TAXI(0.4, 0.95, 0); CAR(-1.04, 1.13, A.carW, 0);
  if (lv >= 2) { BUS(0.52, 1.13, PI); TAXI(-1.1, 0.97, 0); CAR(0.88, 1.0, A.carD, PI); }
  if (lv >= 3) { CAR(1.06, 0.5, A.carB, PI / 2); CAR(1.0, -0.72, A.carW, PI / 2); BUS(-0.12, 0.93, PI, A.carB); } /* 2010s 彩涂巴士 */
  if (lv >= 4) { TAXI(0.72, 1.18, 0); CAR(1.06, 0.08, A.carD, PI / 2); }
  flush(g);
  /* ---- 动画 2 项：LED/海报呼吸 / 橱窗+冠带+招牌呼吸 ---- */
  var hm = g.userData.hotM;
  g.userData.anim = [
    function (t) { if (hm.led) hm.led.emissiveIntensity = 0.55 + 0.25 * (0.5 + 0.5 * Math.sin(t * 2.1));
      else if (sg[0]) sg[0].emissiveIntensity = 0.16 + 0.06 * (0.5 + 0.5 * Math.sin(t * 1.6)); },
    function (t) { EI(A.glow, (lv >= 3 ? 0.5 : 0.16) + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.3 + 1.1)));
      EI(A.ledc, 0.6 + 0.2 * (0.5 + 0.5 * Math.sin(t * 1.7)));
      for (var s2 = 2; s2 < sg.length; s2++) sg[s2].emissiveIntensity = 0.24 + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.9 + s2)); }];
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[33] = function (level) { return build(level); };
})();
