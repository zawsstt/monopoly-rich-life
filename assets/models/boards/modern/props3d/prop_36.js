/* 大富翁·现代写实棋盘 格 36「兰桂坊」—— 陡坡转角酒吧街：前排 5 栋唐楼街墙（转角主楼）+ 后排 4 栋/玻璃塔 + 霓虹灯牌群 四年代（1990s→2020s）
 * 视觉基准 refs/modern/prop_36.png 四象限（左上 1990s / 右上 2000s / 左下 2010s / 右下 2020s 同一街角 40 年演进）。
 * 布局：渲染 45° 机位在 +x+z，故转角主楼置于前右 x0.4..1.0 / z-0.46..0.18（切角→弧角玻璃幕），街墙向 -x 后退，与参考「转角楼最近、街道纵深远去」构图同构；正面 +z 为街道。
 *   台地沿 x 缓坡（右低 y0.08 → 左高 y0.22）+ 前街双黄线 + 铁栏杆（外侧/内侧/转角）+ 弯臂街灯 + 消防栓 + 护柱 + 行道树；后排 4 栋（唐楼→玻璃塔+LED 媒体墙）。
 * 年代（结构性演进）：lv1 1990s 主楼斑驳白灰泥+绿釉瓦裙+红白条纹篷+天台水箱/天线/树，白底红字招牌，白天冷清；
 *   lv2 2000s 主楼翻新米色+炭黑玻璃店面暖光+天台凉棚，粉/青霓虹竖牌+蓝灯箱，住户窗暖光，后排加高；
 *   lv3 2010s 主楼整体玻璃幕（楼板带+竖梃）+天台玻璃酒吧亭+种植槽，紫/红霓虹增至 4，后排玻璃塔 9 层，湿路反光；
 *   lv4 2020s 主楼弧角玻璃+天台温室木格栅花园+沿口花槽，后排双玻璃塔（12 层尖顶+LED 冠带）+LED 媒体墙，霓虹 6+外摆+盆栽+街灯满配。
 * 契约：window.Props3DModern[36](level 1..4) → 每次全新 Group；占地 ≤2.6×2.6、底面 y=0、正面 +z；每级 mesh ≤55（桶=材质参数，同桶顶点色合并 + 世界尺寸 boxUV）；
 *   三角 lv1≤9k / lv2≤13k / lv3≤18k / lv4≤24k；Canvas ≤256px；零 Math.random（LCG）；动画 2 项（霓虹脉动 / 暖窗呼吸）；
 *   高度带 lv1[0.8,1.4] lv2[1.2,1.8] lv3[1.6,2.3] lv4[2.0,2.9]。
 * 材质：近白 overlay Canvas（斑驳灰泥/净灰泥/石板/柏油/窗玻璃/幕墙格/暖光幕墙/塔幕墙/百叶/条纹篷/布/木/叶/拉丝金属/釉瓦/LED）×顶点色分区；发光件独立桶+emissiveMap。
 * 本轮 R1（结构重建，原 3 盒唐楼+平贴图 → 桶系统全重写）：转角主楼 Shape 挤出体（切角/弧角）+ 逐层楼板带；逐窗单元（框/玻璃/中梃/窗台/空调外机）；阳台栏杆；
 *   店面（橱窗/壁柱/楣板/门/雨篷/台阶/招牌）；天台套件（梯间房/水箱/电视天线/碟形天线/天台树/花槽/太阳能/凉棚/玻璃亭/温室）；后排唐楼与玻璃塔；街道家具全套。
 * 本轮 R2（对照参考图清偿 12 条）：①lv1 转角楼白灰泥提亮冷调 + 深翠绿釉砖裙（粗糙度降呈釉面）+ 绿窗框楣板深绿；②灰泥纹理雨水渍/霉斑/裂纹加密（1990s 斑驳感）；
 *   ③lv1 白底红/蓝字竖招 ×2（金行/藥房）成排 + 转角红白条纹篷加宽加深 + 条纹垂幔 + 撑杆；④lv3/4 后排玻璃塔顶点色改深蓝玻璃；
 *   ⑤LED 媒体墙纹理重做（彩色内容块+标题条+扫描线）面板加大至 0.78w×0.56H、ei 0.62；⑥lv3+ 湿路霓虹倒影条 ×3（粉/青/紫，透明发光桶）；
 *   ⑦主楼玻璃幕竖梃 4→正面 5 根 + 侧面 4 根 + 弧角梃；⑧lv2+ 暖窗比例/亮度上调（litP 0.58-0.68、eiG 0.72、光色更暖）；
 *   ⑨lv2+ 垃圾桶 ×2、lv3+ 路缘花箱 ×2（灌木）；⑩lv3+ 二层蓝色灯箱 + 托架；⑪绿釉砖纹理改釉面高光+深缝；⑫台地/唐楼群 lv1 顶点色整体去黄提冷。
 * 本轮 R3（残余差距收尾）：lv4 街墙第 2 栋 + 右后唐楼改炭灰翻新立面（浅框/玻璃色窗/阳台 2-4-6 层）对应参考右下深色翻新楼宇；lv1 白底竖牌加大
 *   （0.075×0.26）；湿路倒影加强（op 0.55 / ei 0.5）；台地基座加深；lv4 夜總會/右店雨棚改深炭色玻璃篷（2020s 语言）；lv2 主楼天台改凉棚。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_36] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TX = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function F(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function RA(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')'; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? RA(255, 255, 255, a) : RA(24, 22, 18, a), R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
function TX(c, rep) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
/* ---- 近白 overlay 纹理（顶点色承载主色）+ 自着色 幕墙格/暖光幕墙/塔幕墙/条纹篷/LED ---- */
var TXF = {
  p: function (g, w, h, R) { F(g, '#e6e2d9', 0, 0, w, h); var i, x; for (i = 0; i < 46; i++) { x = R() * w; F(g, RA(60, 56, 50, 0.12 + R() * 0.22), x, R() * 20, 2 + R() * 4, 40 + R() * 110); } for (i = 0; i < 20; i++) F(g, RA(88, 82, 72, 0.1 + R() * 0.14), R() * w, R() * h, 8 + R() * 28, 4 + R() * 16); for (i = 0; i < 9; i++) F(g, RA(52, 58, 48, 0.14 + R() * 0.16), R() * w, h * (0.55 + R() * 0.4), 4 + R() * 12, 5 + R() * 12); for (i = 0; i < 4; i++) F(g, RA(76, 70, 62, 0.18), 0, i * 32 + 30, w, 1); F(g, RA(64, 58, 50, 0.24), 0, h - 14, w, 14); g.strokeStyle = RA(52, 48, 42, 0.32); g.lineWidth = 1; for (i = 0; i < 6; i++) { var x0 = R() * w, y0 = R() * h; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (R() - 0.5) * 30, y0 + 20 + R() * 40); g.stroke(); } SPK(g, w, h, 240, 0.1, R); },
  q: function (g, w, h, R) { F(g, '#f6f3ec', 0, 0, w, h); var i; for (i = 0; i < 8; i++) F(g, RA(110, 100, 86, 0.04 + R() * 0.05), R() * w, R() * h, 10 + R() * 30, 6 + R() * 16); for (i = 0; i <= 2; i++) { F(g, RA(90, 84, 74, 0.1), 0, i * 48 + 46, w, 1); F(g, RA(255, 255, 255, 0.3), 0, i * 48 + 47, w, 1); } SPK(g, w, h, 90, 0.05, R); },
  s: function (g, w, h, R) { F(g, '#ece9e2', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 32) for (x = 0; x < w; x += 32) { F(g, R() > 0.5 ? RA(255, 255, 255, 0.12) : RA(80, 76, 68, 0.1), x + 2, y + 2, 28, 28); F(g, RA(60, 56, 50, 0.5), x, y, 32, 2); F(g, RA(60, 56, 50, 0.45), x, y, 2, 32); F(g, RA(255, 255, 255, 0.3), x + 2, y + 2, 28, 1); } SPK(g, w, h, 180, 0.07, R); },
  a: function (g, w, h, R) { F(g, '#ecebe9', 0, 0, w, h); var i; for (i = 0; i < 380; i++) F(g, i % 3 ? RA(30, 30, 32, 0.12 + R() * 0.1) : RA(255, 255, 255, 0.14), R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); F(g, RA(40, 40, 42, 0.12), 20, 60, 50, 30); g.strokeStyle = RA(30, 30, 30, 0.3); g.lineWidth = 1; for (i = 0; i < 2; i++) { g.beginPath(); g.moveTo(R() * w, 0); g.lineTo(R() * w, h); g.stroke(); } },
  y: function (g, w, h, R) { F(g, '#e9eef1', 0, 0, w, h); var i; for (i = 0; i < 5; i++) F(g, RA(255, 255, 255, 0.15 + R() * 0.2), R() * w, 0, 2 + R() * 4, h); F(g, RA(30, 40, 52, 0.35), 0, 0, w, 3); F(g, RA(30, 40, 52, 0.25), 0, h - 3, w, 3); F(g, RA(30, 40, 52, 0.3), w / 2 - 1, 0, 2, h); SPK(g, w, h, 20, 0.08, R); },
  g: function (g, w, h, R) { F(g, '#e6eef2', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 32) for (x = 0; x < w; x += 32) { var v = R(); F(g, v > 0.7 ? RA(20, 34, 50, 0.32) : v < 0.25 ? RA(255, 255, 255, 0.28) : RA(60, 90, 120, 0.06 + R() * 0.1), x + 2, y + 2, 28, 28); } for (x = 0; x < w; x += 32) { F(g, RA(24, 30, 38, 0.6), x, 0, 3, h); F(g, RA(24, 30, 38, 0.6), 0, x, w, 3); } for (x = 0; x < 3; x++) F(g, RA(255, 255, 255, 0.16), R() * w, 0, 3 + R() * 5, h); SPK(g, w, h, 30, 0.06, R); },
  gw: function (g, w, h, R) { F(g, '#ffdfb0', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 16) for (x = 0; x < w; x += 16) { var v = R(); if (v > 0.72) F(g, RA(46, 38, 32, 0.55), x + 1, y + 1, 14, 14); else if (v < 0.2) F(g, RA(255, 250, 235, 0.3), x + 1, y + 1, 14, 14); else F(g, RA(255, 190, 120, 0.1 + R() * 0.1), x + 1, y + 1, 14, 14); if (v > 0.45 && v < 0.6) F(g, RA(90, 60, 30, 0.3), x + 2, y + 9, 5 + R() * 8, 3); } for (x = 0; x < w; x += 16) { F(g, RA(30, 30, 34, 0.55), x, 0, 2, h); F(g, RA(30, 30, 34, 0.5), 0, x, w, 2); } for (y = 0; y < h; y += 64) F(g, RA(24, 24, 28, 0.75), 0, y, w, 5); for (x = 0; x < 3; x++) F(g, RA(255, 255, 255, 0.1), R() * w, 0, 3 + R() * 5, h); },
  gt: function (g, w, h, R) { F(g, '#4e6c86', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 16) for (x = 0; x < w; x += 16) { var v = R(); if (v > 0.82) F(g, RA(255, 215, 160, 0.8), x + 1, y + 1, 14, 14); else if (v > 0.55) F(g, RA(8, 20, 38, 0.45), x + 1, y + 1, 14, 14); else F(g, RA(190, 215, 235, 0.07 + R() * 0.08), x + 1, y + 1, 14, 14); } for (x = 0; x < w; x += 16) { F(g, RA(8, 16, 30, 0.6), x, 0, 2, h); F(g, RA(8, 16, 30, 0.55), 0, x, w, 2); } for (x = 0; x < 3; x++) F(g, RA(255, 255, 255, 0.12), R() * w, 0, 4 + R() * 6, h); },
  v: function (g, w, h) { F(g, '#dfe3e6', 0, 0, w, h); var y; for (y = 1; y < h; y += 4) F(g, '#4a5056', 0, y, w, 2); },
  fs: function (g, w, h, R) { F(g, '#f6f2ea', 0, 0, w, h); var x; for (x = 0; x < w; x += 16) F(g, '#c8382c', x, 0, 8, h); for (x = 0; x < h; x += 3) F(g, RA(80, 70, 60, 0.05), 0, x, w, 1); },
  f: function (g, w, h, R) { F(g, '#f4f1ea', 0, 0, w, h); var i; for (i = 0; i < w; i += 3) { F(g, RA(90, 84, 72, 0.08), i, 0, 1, h); F(g, RA(255, 255, 250, 0.1), 0, i, w, 1); } },
  w: function (g, w, h, R) { F(g, '#f3e8d8', 0, 0, w, h); var x; for (x = 0; x < w; x += 5) F(g, RA(70, 40, 20, 0.12 + R() * 0.12), x + R() * 2, 0, 1, h); SPK(g, w, h, 20, 0.05, R); },
  l: function (g, w, h, R) { F(g, '#eef3e6', 0, 0, w, h); var i; for (i = 0; i < 40; i++) { g.fillStyle = i % 2 ? RA(30, 60, 20, 0.3) : RA(255, 255, 240, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } },
  m: function (g, w, h, R) { F(g, '#eceef0', 0, 0, w, h); var i; for (i = 0; i < 8; i++) F(g, i % 2 ? RA(255, 255, 255, 0.25) : RA(40, 44, 50, 0.12), 0, i * 8, w, 4); SPK(g, w, h, 60, 0.06, R); },
  t: function (g, w, h, R) { F(g, '#eef2ee', 0, 0, w, h); var x, y; for (y = 0; y < h; y += 8) for (x = 0; x < w; x += 8) { var v = R(); F(g, v > 0.82 ? RA(6, 26, 18, 0.3) : v < 0.2 ? RA(210, 235, 220, 0.3) : RA(18, 38, 28, 0.12), x + 1, y + 1, 6, 6); F(g, RA(255, 255, 255, 0.5), x + 1, y + 1, 6, 2); F(g, RA(255, 255, 255, 0.28), x + 1, y + 1, 2, 6); } for (x = 0; x < w; x += 8) { F(g, RA(12, 22, 18, 0.55), x, 0, 1, h); F(g, RA(12, 22, 18, 0.55), 0, x, w, 1); } for (y = 4; y < h; y += 16) F(g, RA(235, 245, 240, 0.2), 0, y, w, 1); },
  led: function (g, w, h, R) { F(g, '#0a0d14', 0, 0, w, h); var x, y, i, gr2 = g.createLinearGradient(0, 0, 0, h); gr2.addColorStop(0, 'rgba(40,80,200,0.5)'); gr2.addColorStop(0.4, 'rgba(220,60,150,0.42)'); gr2.addColorStop(0.72, 'rgba(255,140,50,0.4)'); gr2.addColorStop(1, 'rgba(90,40,180,0.45)'); g.fillStyle = gr2; g.fillRect(0, 0, w, h); var cs = ['#ff4fa8', '#3fd8e8', '#ffd24a', '#7a5cff', '#38b8ff', '#ff8a3c']; for (i = 0; i < 7; i++) { g.fillStyle = cs[(R() * 6) | 0]; g.globalAlpha = 0.5 + R() * 0.4; g.fillRect(R() * w * 0.8, R() * h * 0.8, 18 + R() * 46, 12 + R() * 30); } g.globalAlpha = 1; F(g, RA(255, 255, 255, 0.92), 16, 18, 96, 13); F(g, RA(20, 30, 60, 0.9), 24, 22, 72, 5); F(g, RA(255, 240, 200, 0.8), 16, 40, 70, 8); F(g, RA(180, 240, 255, 0.75), 16, 54, 84, 6); for (y = 3; y < h; y += 6) for (x = 3; x < w; x += 6) { var v = R(); g.fillStyle = v > 0.6 ? RA(255, 210, 120, 0.85) : v > 0.3 ? RA(120, 200, 255, 0.6) : RA(50, 40, 70, 0.55); g.beginPath(); g.arc(x, y, 1.7, 0, 6.283); g.fill(); } g.fillStyle = RA(0, 0, 0, 0.3); for (x = 0; x < w; x += 6) g.fillRect(x, 0, 1, h); for (y = 0; y < h; y += 6) g.fillRect(0, y, w, 1); F(g, RA(255, 240, 200, 0.5), 20, 56, 88, 12); F(g, RA(16, 14, 18, 0.9), 0, 0, w, 4); F(g, RA(16, 14, 18, 0.9), 0, h - 4, w, 4); F(g, RA(16, 14, 18, 0.9), 0, 0, 4, h); F(g, RA(16, 14, 18, 0.9), w - 4, 0, 4, h); }
};
var TDIM = { p: [128, 128], q: [128, 128], s: [128, 128], a: [128, 128], y: [64, 64], g: [128, 128], gw: [128, 128], gt: [128, 128], v: [32, 32], fs: [64, 64], f: [64, 64], w: [64, 64], l: [64, 64], m: [64, 64], t: [64, 64], led: [128, 128] };
function tex(id) { if (_TX[id]) return _TX[id]; var d = TDIM[id], c = cv(d[0], d[1]); TXF[id](c.getContext('2d'), c.width, c.height, lcg(3600 + id.charCodeAt(0) * 13 + id.length * 7)); return (_TX[id] = TX(c, true)); }
/* ---- 招牌贴图（缓存）：竖牌 64×256（霓虹/白底红字）/ 横牌 256×64 ---- */
function vSign(txt, col, bg, glow) { var key = 'v' + txt + col + bg; if (_TX[key]) return _TX[key]; var c = cv(64, 256), g = c.getContext('2d'), i, n = txt.length, st = 236 / n; F(g, bg, 0, 0, 64, 256); g.strokeStyle = col; g.lineWidth = 3; g.strokeRect(5, 5, 54, 246); if (glow) { g.globalAlpha = 0.22; F(g, col, 9, 9, 46, 238); g.globalAlpha = 1; g.shadowColor = col; g.shadowBlur = 14; } g.textAlign = 'center'; g.textBaseline = 'middle'; for (i = 0; i < n; i++) { g.font = 'bold ' + Math.round(Math.min(44, st * 0.78)) + 'px "Microsoft YaHei",sans-serif'; g.fillStyle = col; g.fillText(txt.charAt(i), 32, 10 + st * (i + 0.5)); if (glow) { g.font = 'bold ' + Math.round(Math.min(34, st * 0.62)) + 'px "Microsoft YaHei",sans-serif'; g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillText(txt.charAt(i), 32, 10 + st * (i + 0.5)); } } g.shadowBlur = 0; return (_TX[key] = TX(c, false)); }
function hSign(txt, bg, fg, glow) { var key = 'h' + txt + bg; if (_TX[key]) return _TX[key]; var c = cv(256, 64), g = c.getContext('2d'); F(g, bg, 0, 0, 256, 64); g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(4, 4, 248, 56); g.textAlign = 'center'; g.textBaseline = 'middle'; if (glow) { g.shadowColor = fg; g.shadowBlur = 12; } g.font = 'bold 30px "Microsoft YaHei",Arial,sans-serif'; g.fillStyle = fg; g.fillText(txt, 128, 33); if (glow) { g.font = 'bold 26px "Microsoft YaHei",Arial,sans-serif'; g.fillStyle = 'rgba(255,255,255,0.8)'; g.fillText(txt, 128, 33); } g.shadowBlur = 0; F(g, RA(255, 255, 255, 0.1), 0, 8, 256, 6); return (_TX[key] = TX(c, false)); }
/* ---- 桶系统：桶=材质参数；MS 返回 {b:桶,c:线性顶点色}；flush 同桶合并 + 世界尺寸 boxUV ---- */
var BK, g_, signMs;
function MS(h, rg, mt, tx, ws, em, ei, op) { var k = rg + '|' + (mt || 0) + '|' + (tx || '') + '|' + (ws || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (op || 0); var b = BK[k] || (BK[k] = { rg: rg, mt: mt || 0, tx: tx || '', ws: ws || 0, em: em || '', ei: ei || 0, op: op || 0, gs: [], cs: [] }); return { b: b, c: V(h) }; }
function CL(m, h) { return { b: m.b, c: V(h) }; }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(m, g) { m.b.gs.push(g); m.b.cs.push(m.c); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function PL(m, w, h, x, y, z, ry, rx) { put(m, xf(new THREE.PlaneGeometry(w, h), x, y, z, rx || 0, ry || 0, 0)); }
function PRISM(m, sh, h, y0) { var geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 10 }); geo.rotateX(-PI / 2); geo.translate(0, y0, 0); put(m, geo); }
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i, j; if (!gs.length) continue;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ca = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) {
      var p = gs[i].attributes.position.array; pa.set(p, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2);
      for (j = 0; j < p.length; j += 3) { ca[o + j] = b.cs[i][0]; ca[o + j + 1] = b.cs[i][1]; ca[o + j + 2] = b.cs[i][2]; } o += p.length;
    }
    if (b.ws) for (i = 0; i < P; i += 9) { var ax = pa[i + 3] - pa[i], ay = pa[i + 4] - pa[i + 1], az = pa[i + 5] - pa[i + 2], bx = pa[i + 6] - pa[i], by = pa[i + 7] - pa[i + 1], bz = pa[i + 8] - pa[i + 2]; var nx = Math.abs(ay * bz - az * by), ny = Math.abs(az * bx - ax * bz), nz = Math.abs(ax * by - ay * bx), s2 = 1 / b.ws;
      for (j = 0; j < 3; j++) { var q = i + j * 3, u = i / 9 * 6 + j * 2; if (ny >= nx && ny >= nz) { ua[u] = pa[q] * s2; ua[u + 1] = pa[q + 2] * s2; } else if (nx >= nz) { ua[u] = pa[q + 2] * s2; ua[u + 1] = pa[q + 1] * s2; } else { ua[u] = pa[q] * s2; ua[u + 1] = pa[q + 1] * s2; } } }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt });
    if (b.tx) m.map = tex(b.tx); if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tx) m.emissiveMap = m.map; } if (b.op) { m.transparent = true; m.opacity = b.op; }
    b.m = m; var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function EI(m, v) { if (m && m.b && m.b.m) m.b.m.emissiveIntensity = v; }
function SIGN(t, w, h, x, y, z, ry, ei) { var m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, metalness: 0.05, emissive: C('#ffffff'), emissiveMap: t, emissiveIntensity: ei, side: THREE.DoubleSide }); var ms = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); ms.position.set(x, y, z); ms.rotation.y = ry || 0; ms.castShadow = ms.receiveShadow = true; g_.add(ms); signMs.push(m); return m; }
function heroShape(x0, x1, z0, z1, arc, c) { var s = new THREE.Shape(); s.moveTo(x0, -z0); s.lineTo(x1, -z0); s.lineTo(x1, -(z1 - c)); if (arc) s.absarc(x1 - c, c - z1, c, 0, -PI / 2, true); else s.lineTo(x1 - c, -z1); s.lineTo(x0, -z1); s.closePath(); return s; }
/* ================= 四阶（1990s→2020s 生长） ================= */
function build(lv) {
  var g = new THREE.Group(); g.name = 'prop_36_lv' + lv; g.userData.kind = 'property'; g.userData.propIdx = 36; g.userData.level = lv; g.userData.region = 'g7';
  BK = {}; signMs = []; g_ = g;
  var G0 = 0.08, RISE = 0.14, TH = Math.atan2(RISE, 2.56), wet = lv >= 3, i, k2, i2;
  function gr(x) { return G0 + (1.28 - x) / 2.56 * RISE; }
  var eiS = [0.08, 0.5, 0.55, 0.6][lv - 1], eiG = [0.1, 0.58, 0.68, 0.72][lv - 1], eiL = [0.1, 0.46, 0.54, 0.58][lv - 1];
  var litP = [0.08, 0.58, 0.64, 0.68][lv - 1], acP = [0.5, 0.42, 0.32, 0.26][lv - 1];
  var A = {
    base: MS('#8e8a82', 0.92, 0, 's', 0.9),
    pave: MS(wet ? '#a9a59c' : '#c9c4b7', wet ? 0.5 : 0.9, wet ? 0.12 : 0, 's', 0.42),
    road: MS(wet ? '#4a4d53' : '#5c5e62', wet ? 0.28 : 0.95, wet ? 0.22 : 0, 'a', 0.6),
    curb: MS('#d6d1c4', 0.88, 0, 'q', 0.5),
    mark: MS('#e0be42', 0.7, 0, '', 0),
    wallW: MS('#d8d5cb', 0.9, 0, 'p', 0.55), wallC: MS('#e8e2d4', 0.88, 0, 'q', 0.6),
    wallD: MS('#2a2a2c', 0.75, 0.05, 'q', 0.6),
    trim: MS('#ece8de', 0.86, 0, '', 0),
    frame: MS('#3f5f52', 0.6, 0.2, '', 0),
    win: MS('#3a444e', 0.14, 0.6, 'y', 0.25),
    glow: MS('#8a7458', 0.3, 0, '', 0, '#ffc878', eiG),
    lit: MS('#ffffff', 0.12, 0.35, 'gw', 0.3, '#ffffff', eiL),
    cur: MS('#7fa4bc', 0.1, 0.7, 'g', 0.4),
    twr: MS('#ffffff', 0.1, 0.5, 'gt', 0.28, '#ffffff', [0.14, 0.2, 0.26, 0.3][lv - 1]),
    metal: MS('#9aa0a6', 0.45, 0.7, 'm', 0.2),
    dark: MS('#3b3e42', 0.6, 0.45, '', 0),
    tile: MS('#1f5c44', 0.3, 0.2, 't', 0.25),
    awnS: MS('#ffffff', 0.9, 0, 'fs', 0.35), awn: MS('#c0392b', 0.9, 0, 'f', 0.35),
    roof: MS('#7a7975', 0.85, 0.05, 'q', 0.6),
    leaf: MS('#5b7a3a', 0.95, 0, 'l', 0.3), wood: MS('#8a6a44', 0.75, 0, 'w', 0.3),
    louv: MS('#d8dcdf', 0.6, 0.3, 'v', 0.1),
    ledm: MS('#ffffff', 0.4, 0.1, 'led', 0.3, '#ffffff', 0.62),
    red: MS('#c8322a', 0.5, 0.2, '', 0),
    neonP: MS('#ff4fa8', 0.4, 0, '', 0, '#ff4fa8', 0.8), neonC: MS('#3fd8e8', 0.4, 0, '', 0, '#3fd8e8', 0.8),
    neonR: MS('#ff3b30', 0.4, 0, '', 0, '#ff3b30', 0.8), neonV: MS('#b45cff', 0.4, 0, '', 0, '#b45cff', 0.8),
    lamp: MS('#fff0c0', 0.3, 0, '', 0, '#ffd88a', lv >= 2 ? 0.7 : 0.12)
  };
  function SL(m, L, t, D, xc, zc, dy) { B(m, L, t, D, xc, gr(xc) + dy - t / 2, zc, 0, 0, -TH); }
  function WIN(x, y, z, ry, fr, lit, w, h, ac, wc) {
    var sn = Math.sin(ry), cs = Math.cos(ry);
    PL(CL(A.frame, fr), w, h, x + sn * 0.004, y, z + cs * 0.004, ry);
    PL(lit ? A.glow : CL(A.win, wc || '#3a444e'), w - 0.018, h - 0.018, x + sn * 0.007, y, z + cs * 0.007, ry);
    PL(CL(A.frame, fr), 0.006, h - 0.018, x + sn * 0.009, y, z + cs * 0.009, ry);
    B(CL(A.trim, '#d9d5ca'), w + 0.024, 0.01, 0.026, x + sn * 0.012, y - h / 2 - 0.006, z + cs * 0.012, 0, ry, 0);
    if (ac) { B(A.metal, 0.052, 0.04, 0.044, x + sn * 0.03 + cs * 0.014, y - h / 2 - 0.036, z + cs * 0.03 - sn * 0.014, 0, ry, 0); PL(A.louv, 0.042, 0.03, x + sn * 0.053 + cs * 0.014, y - h / 2 - 0.036, z + cs * 0.053 - sn * 0.014, ry); }
  }
  function BALC(xc, y, zf, w, fr) {
    B(CL(A.trim, '#cfcbc0'), w, 0.016, 0.1, xc, y + 0.008, zf + 0.05);
    for (k2 = 0; k2 <= 4; k2++) B(CL(A.dark, fr), 0.006, 0.07, 0.006, xc - w / 2 + k2 * w / 4, y + 0.05, zf + 0.096);
    B(CL(A.dark, fr), w + 0.006, 0.008, 0.008, xc, y + 0.088, zf + 0.096);
    B(CL(A.dark, fr), 0.006, 0.008, 0.1, xc - w / 2, y + 0.088, zf + 0.05); B(CL(A.dark, fr), 0.006, 0.008, 0.1, xc + w / 2, y + 0.088, zf + 0.05);
  }
  function SHOP(xc, yb, zf, w, s) {
    var GH = 0.24;
    PL(s.lit ? A.lit : CL(A.win, '#2c343c'), w * 0.84, 0.19, xc, yb + 0.125, zf + 0.004);
    PL(CL(A.dark, s.fr || '#44464a'), 0.006, 0.19, xc - w * 0.2, yb + 0.125, zf + 0.006); PL(CL(A.dark, s.fr || '#44464a'), 0.006, 0.19, xc + w * 0.2, yb + 0.125, zf + 0.006);
    B(s.pil, 0.05, GH, 0.03, xc - w / 2 + 0.03, yb + GH / 2, zf + 0.012); B(s.pil, 0.05, GH, 0.03, xc + w / 2 - 0.03, yb + GH / 2, zf + 0.012);
    B(s.fasc, w * 0.94, 0.05, 0.022, xc, yb + GH - 0.028, zf + 0.011);
    PL(CL(A.dark, '#1a1b1e'), 0.08, 0.17, xc + w * 0.32, yb + 0.087, zf + 0.008);
    if (s.awn) B(s.awn, w * 0.56, 0.01, 0.13, xc - w * 0.12, yb + 0.168, zf + 0.072, 0.45, 0, 0);
    else B(CL(A.dark, '#5a5d60'), 0.14, 0.008, 0.07, xc + w * 0.32, yb + 0.19, zf + 0.04);
    B(A.curb, w * 0.62, 0.016, 0.05, xc, yb + 0.008, zf + 0.026);
    if (s.sign) SIGN(s.sign, w * 0.86, 0.05, xc, yb + GH - 0.028, zf + 0.032, 0, eiS);
  }
  function ROOFKIT(xc, zc, w, d, yt, kit, wall) {
    var j2;
    for (i2 = 0; i2 < kit.length; i2++) {
      var it = kit[i2];
      if (it === 'hut') { B(wall, w * 0.34, 0.1, d * 0.38, xc - w * 0.22, yt + 0.05, zc - d * 0.16); B(CL(A.roof, '#54534f'), w * 0.34 + 0.03, 0.012, d * 0.38 + 0.03, xc - w * 0.22, yt + 0.106, zc - d * 0.16); PL(CL(A.dark, '#26272a'), 0.05, 0.08, xc - w * 0.22, yt + 0.04, zc - d * 0.16 + d * 0.19 + 0.004); }
      else if (it === 'tank') { Y(A.metal, 0.044, 0.044, 0.09, 12, xc + w * 0.26, yt + 0.085, zc - d * 0.2); B(A.dark, 0.07, 0.03, 0.07, xc + w * 0.26, yt + 0.015, zc - d * 0.2); }
      else if (it === 'ant') { Y(A.dark, 0.004, 0.005, 0.2, 12, xc + w * 0.32, yt + 0.1, zc + d * 0.08); for (j2 = 0; j2 < 3; j2++) B(A.dark, 0.09 - j2 * 0.025, 0.005, 0.005, xc + w * 0.32, yt + 0.18 - j2 * 0.045, zc + d * 0.08); }
      else if (it === 'dish') { Y(A.metal, 0.032, 0.032, 0.006, 12, xc - w * 0.3, yt + 0.075, zc + d * 0.22, -1.1, 0, 0); B(A.dark, 0.006, 0.06, 0.006, xc - w * 0.3, yt + 0.035, zc + d * 0.22); }
      else if (it === 'tree') { B(CL(A.wood, '#7a5c3a'), 0.12, 0.05, 0.12, xc + w * 0.18, yt + 0.025, zc + d * 0.12); Y(CL(A.wood, '#6e543c'), 0.012, 0.018, 0.22, 12, xc + w * 0.18, yt + 0.16, zc + d * 0.12); O(A.leaf, 0.075, xc + w * 0.18, yt + 0.3, zc + d * 0.12); O(CL(A.leaf, '#6f8f47'), 0.05, xc + w * 0.24, yt + 0.36, zc + d * 0.08); }
      else if (it === 'shrub') { B(CL(A.wood, '#7a5c3a'), w * 0.44, 0.04, 0.055, xc, yt + 0.02, zc + d * 0.32); O(A.leaf, 0.032, xc - w * 0.16, yt + 0.062, zc + d * 0.32); O(CL(A.leaf, '#6f8f47'), 0.028, xc + w * 0.1, yt + 0.06, zc + d * 0.32); O(A.leaf, 0.026, xc + w * 0.06, yt + 0.056, zc + d * 0.3); }
      else if (it === 'ac') { for (j2 = 0; j2 < 2; j2++) { B(A.metal, 0.058, 0.045, 0.05, xc + w * 0.18 + j2 * 0.07, yt + 0.023, zc + d * 0.02); PL(A.louv, 0.05, 0.034, xc + w * 0.18 + j2 * 0.07, yt + 0.023, zc + d * 0.02 + 0.026); } }
      else if (it === 'solar') { B(CL(A.dark, '#24364a'), w * 0.34, 0.008, d * 0.26, xc - w * 0.18, yt + 0.055, zc + d * 0.12, -0.45, 0, 0); B(A.dark, 0.01, 0.03, 0.01, xc - w * 0.28, yt + 0.02, zc + d * 0.08); B(A.dark, 0.01, 0.03, 0.01, xc - w * 0.08, yt + 0.02, zc + d * 0.16); }
      else if (it === 'pergola') { for (j2 = 0; j2 < 4; j2++) B(A.dark, 0.012, 0.14, 0.012, xc - w * 0.24 + (j2 % 2) * w * 0.48, yt + 0.07, zc + d * 0.04 + Math.floor(j2 / 2) * d * 0.24); B(CL(A.roof, '#4a4a48'), w * 0.58, 0.012, d * 0.42, xc, yt + 0.146, zc + d * 0.16); }
      else if (it === 'pav') { B(A.cur, w * 0.4, 0.15, d * 0.34, xc - w * 0.2, yt + 0.095, zc - d * 0.14); B(CL(A.roof, '#3a3d40'), w * 0.44, 0.012, d * 0.38, xc - w * 0.2, yt + 0.176, zc - d * 0.14); B(A.lit, w * 0.36, 0.1, 0.012, xc - w * 0.2, yt + 0.09, zc - d * 0.14 + d * 0.17); }
      else if (it === 'ghouse') { B(A.cur, w * 0.46, 0.16, d * 0.38, xc - w * 0.2, yt + 0.1, zc - d * 0.14); B(CL(A.wood, '#8a6a44'), w * 0.5, 0.012, d * 0.42, xc - w * 0.2, yt + 0.186, zc - d * 0.14); for (j2 = 0; j2 < 5; j2++) B(CL(A.wood, '#9a7a50'), w * 0.48, 0.01, 0.02, xc - w * 0.2, yt + 0.2, zc - d * 0.3 + j2 * d * 0.08); }
    }
  }
  /* ---- 唐楼单元：逐层楼板带 + 逐窗 + 阳台 + 店面 + 天台 ---- */
  function TONG(o) {
    var xc = o.xc, w = o.w, d = o.d, zc = o.zc, n = o.nF, GH = 0.24, FH = 0.19, H = GH + (n - 1) * FH, zf = zc + d / 2, yb = gr(xc + w / 2), yt = yb + H, wall = o.wall, R2 = lcg(o.seed);
    var ns = Math.max(1, Math.round(d / 0.17)), nw = Math.max(2, Math.round(w / 0.15)), ww = Math.min(0.1, w / nw * 0.62), wx;
    B(wall, w, H + 0.04, d, xc, yb - 0.04 + (H + 0.04) / 2, zc);
    B(A.roof, w - 0.02, 0.014, d - 0.02, xc, yt + 0.007, zc);
    B(wall, w + 0.02, 0.05, 0.03, xc, yt + 0.025, zf - 0.004); B(wall, w + 0.02, 0.05, 0.03, xc, yt + 0.025, zc - d / 2 + 0.004);
    B(wall, 0.03, 0.05, d, xc - w / 2 + 0.004, yt + 0.025, zc); B(wall, 0.03, 0.05, d, xc + w / 2 - 0.004, yt + 0.025, zc);
    B(CL(A.trim, o.cap || '#cfcbc0'), w + 0.04, 0.012, 0.05, xc, yt + 0.056, zf - 0.004); B(CL(A.trim, o.cap || '#cfcbc0'), 0.05, 0.012, d + 0.04, xc + w / 2 - 0.004, yt + 0.056, zc);
    for (i2 = 1; i2 < n; i2++) {
      var fy = yb + GH + (i2 - 1) * FH, wy = fy + FH * 0.56;
      B(CL(A.trim, o.band || '#c9c5ba'), w + 0.024, 0.018, 0.028, xc, fy + 0.006, zf + 0.002);
      if (o.side) B(CL(A.trim, o.band || '#c9c5ba'), 0.028, 0.018, d + 0.024, xc + o.side * (w / 2 + 0.002), fy + 0.006, zc);
      if (o.balc && o.balc.indexOf(i2) >= 0) BALC(xc, fy, zf, w * 0.6, o.fr);
      for (k2 = 0; k2 < nw; k2++) { wx = xc - w / 2 + (k2 + 0.5) * w / nw; WIN(wx, wy, zf, 0, o.fr, R2() < o.lit, ww, 0.115, R2() < o.ac, o.wc); }
      if (o.side) for (k2 = 0; k2 < ns; k2++) WIN(xc + o.side * w / 2, wy, zc - d / 2 + (k2 + 0.5) * d / ns, o.side > 0 ? PI / 2 : -PI / 2, o.fr, R2() < o.lit * 0.6, ww, 0.115, R2() < o.ac * 0.5, o.wc);
    }
    if (o.shop) SHOP(xc, yb, zf, w, o.shop);
    else { B(CL(A.trim, o.band || '#c9c5ba'), w + 0.024, 0.018, 0.028, xc, yb + GH - 0.008, zf + 0.002); WIN(xc - w * 0.2, yb + 0.14, zf, 0, o.fr, R2() < o.lit, ww, 0.115, false, o.wc); PL(CL(A.dark, '#1a1b1e'), 0.08, 0.18, xc + w * 0.24, yb + 0.09, zf + 0.006); }
    if (o.roof) ROOFKIT(xc, zc, w, d, yt, o.roof, wall);
    if (o.pipe) B(CL(A.metal, '#b5b8ba'), 0.012, H - GH, 0.012, xc - w / 2 + 0.028, yb + GH + (H - GH) / 2, zf + 0.021);
    return yt;
  }
  /* ---- 转角主楼（切角 1990s → 弧角玻璃幕 2010s+） ---- */
  function HERO() {
    var x0 = 0.4, x1 = 1.0, z0 = -0.46, z1 = 0.18, yb = gr(x1), GH = 0.24, FH = 0.19, n = 4, H = GH + 3 * FH, yt = yb + H, glass = lv >= 3, c = glass ? 0.22 : 0.13;
    var wallB = lv === 1 ? CL(A.wallW, '#d4d2c9') : CL(A.wallC, '#e2dbcb'), fr = lv === 1 ? '#3f5f52' : lv === 2 ? '#8c9096' : '#2e3033', RH = lcg(53);
    function SH(o) { return heroShape(x0 - o, x1 + o, z0 - o, z1 + o, glass, glass ? c + o : c); }
    var fl = x1 - c - x0, sl = z1 - c - z0, xm = x1 - c / 2, zm = z1 - c / 2, rf;
    if (!glass) {
      PRISM(wallB, SH(0), H + 0.04, yb - 0.04);
      var gb = lv === 1 ? A.tile : CL(A.wallD, '#2a2a2c'), fb = lv === 1 ? CL(A.wallD, '#1c4f3a') : CL(A.wallD, '#232325');
      B(gb, fl, GH, 0.014, x0 + fl / 2, yb + GH / 2, z1 + 0.006); B(gb, 0.014, GH, sl, x1 + 0.006, yb + GH / 2, z0 + sl / 2); B(gb, c * 1.42, GH, 0.014, xm + 0.0045, yb + GH / 2, zm + 0.0045, 0, PI / 4, 0);
      PL(CL(A.win, lv === 1 ? '#2c3a38' : '#22262c'), fl * 0.72, 0.16, x0 + fl * 0.38, yb + 0.11, z1 + 0.015); PL(CL(A.win, lv === 1 ? '#2c3a38' : '#22262c'), sl * 0.66, 0.16, x1 + 0.015, yb + 0.11, z0 + sl * 0.36, PI / 2);
      PL(CL(A.dark, '#1c2422'), 0.1, 0.18, xm + 0.014, yb + 0.09, zm + 0.014, PI / 4);
      B(fb, fl, 0.05, 0.024, x0 + fl / 2, yb + GH - 0.028, z1 + 0.012); B(fb, 0.024, 0.05, sl, x1 + 0.012, yb + GH - 0.028, z0 + sl / 2); B(fb, c * 1.42, 0.05, 0.024, xm + 0.0085, yb + GH - 0.028, zm + 0.0085, 0, PI / 4, 0);
      B(A.awnS, fl * 0.56, 0.012, 0.16, x0 + fl * 0.34, yb + 0.168, z1 + 0.09, 0.45, 0, 0);
      B(A.awnS, fl * 0.56, 0.024, 0.012, x0 + fl * 0.34, yb + 0.126, z1 + 0.164, 0.45, 0, 0);
      B(A.dark, 0.008, 0.11, 0.008, x0 + fl * 0.12, yb + 0.115, z1 + 0.162); B(A.dark, 0.008, 0.11, 0.008, x0 + fl * 0.56, yb + 0.115, z1 + 0.162);
      if (lv === 2) { B(CL(A.awn, '#2c2c2e'), fl * 0.38, 0.01, 0.13, x0 + fl * 0.68, yb + 0.17, z1 + 0.077, 0.45, 0, 0); B(CL(A.awn, '#2c2c2e'), 0.13, 0.01, sl * 0.55, x1 + 0.077, yb + 0.17, z0 + sl * 0.34, 0, 0, -0.45); }
      SIGN(lv === 1 ? hSign('金冠酒家', '#f2eee4', '#c8322a', false) : hSign('LAN KWAI FONG', '#1a1418', '#ffb84a', true), 0.3, 0.05, x0 + fl * 0.38, yb + GH - 0.028, z1 + 0.034, 0, eiS);
      for (i2 = 1; i2 < n; i2++) { var wy = yb + GH + (i2 - 1) * FH + FH * 0.56;
        for (k2 = 0; k2 < 3; k2++) WIN(x0 + fl * (k2 + 0.5) / 3, wy, z1, 0, fr, RH() < litP, 0.1, 0.115, RH() < acP);
        for (k2 = 0; k2 < 3; k2++) WIN(x1, wy, z0 + sl * (k2 + 0.5) / 3, PI / 2, fr, RH() < litP, 0.1, 0.115, RH() < acP);
        WIN(xm, wy, zm, PI / 4, fr, RH() < litP, 0.09, 0.115, false); }
      /* 楼板带 + 檐口 + 天台女儿墙 */
      for (i2 = 1; i2 < n; i2++) PRISM(CL(A.trim, lv === 1 ? '#c8c4b9' : '#e9e5da'), SH(0.014), 0.02, yb + GH + (i2 - 1) * FH - 0.004);
      PRISM(CL(A.trim, '#cfcbc0'), SH(0.016), 0.03, yt);
      B(wallB, fl + 0.02, 0.045, 0.03, x0 + fl / 2, yt + 0.052, z1 - 0.015); B(wallB, 0.03, 0.045, sl + 0.02, x1 - 0.015, yt + 0.052, z0 + sl / 2);
      B(wallB, c * 1.42, 0.045, 0.03, xm - 0.011, yt + 0.052, zm - 0.011, 0, PI / 4, 0);
      B(wallB, x1 - x0, 0.045, 0.03, (x0 + x1) / 2, yt + 0.052, z0 + 0.015); B(wallB, 0.03, 0.045, z1 - z0, x0 + 0.015, yt + 0.052, (z0 + z1) / 2);
      PRISM(CL(A.roof, '#767570'), SH(-0.032), 0.004, yt + 0.03);
      rf = yt + 0.034;
      ROOFKIT(x0 + 0.3, z0 + 0.3, 0.5, 0.5, rf, lv === 2 ? ['hut', 'tank', 'pergola'] : ['hut', 'tank', 'ant'], wallB);
      B(CL(A.wood, '#7a5c3a'), 0.13, 0.05, 0.13, x1 - 0.24, rf + 0.025, z1 - 0.24); Y(CL(A.wood, '#6e543c'), 0.012, 0.017, 0.2, 12, x1 - 0.24, rf + 0.16, z1 - 0.24); O(A.leaf, 0.078, x1 - 0.24, rf + 0.29, z1 - 0.24); O(CL(A.leaf, '#6f8f47'), 0.05, x1 - 0.18, rf + 0.34, z1 - 0.2);
    } else {
      PRISM(CL(A.wallD, '#26272a'), SH(0), GH + 0.04, yb - 0.04);
      PRISM(A.lit, SH(0), H - GH, yb + GH);
      B(CL(A.dark, '#35373a'), 0.014, H - GH + 0.05, 0.014, x0 + 0.05, yb + GH + (H - GH) / 2, z1 + 0.011);
      for (i2 = 1; i2 < 5; i2++) B(CL(A.dark, '#35373a'), 0.014, H - GH + 0.05, 0.014, x0 + fl * i2 / 5, yb + GH + (H - GH) / 2, z1 + 0.011);
      for (i2 = 1; i2 < 4; i2++) B(CL(A.dark, '#35373a'), 0.014, H - GH + 0.05, 0.014, x1 + 0.011, yb + GH + (H - GH) / 2, z0 + sl * i2 / 4);
      B(CL(A.dark, '#35373a'), 0.014, H - GH + 0.05, 0.014, xm + 0.011, yb + GH + (H - GH) / 2, zm + 0.011, 0, PI / 4, 0);
      PL(A.lit, fl * 0.8, 0.17, x0 + fl * 0.42, yb + 0.115, z1 + 0.006); PL(A.lit, sl * 0.7, 0.17, x1 + 0.006, yb + 0.115, z0 + sl * 0.4, PI / 2);
      PL(CL(A.dark, '#17181a'), 0.1, 0.19, x0 + fl * 0.76, yb + 0.095, z1 + 0.007);
      SIGN(hSign(lv === 3 ? 'LKF BAR' : '蘭桂坊 1 號', '#1a1418', lv >= 4 ? '#ff4fa8' : '#ffb84a', true), 0.34, 0.05, x0 + fl * 0.4, yb + GH - 0.028, z1 + 0.026, 0, eiS);
      for (i2 = 1; i2 < n; i2++) PRISM(CL(A.trim, '#d8d6d0'), SH(0.014), 0.02, yb + GH + (i2 - 1) * FH - 0.004);
      PRISM(CL(A.trim, '#dcdad4'), SH(0.016), 0.045, yt);
      PRISM(CL(A.roof, '#8a8c88'), SH(-0.032), 0.004, yt + 0.045);
      rf = yt + 0.049;
    }
    if (glass) {
      ROOFKIT(x0 + 0.3, z0 + 0.3, 0.5, 0.5, rf, lv >= 4 ? ['ghouse', 'shrub', 'ac'] : ['pav', 'shrub', 'ac'], wallB);
      for (i2 = 0; i2 <= 6; i2++) B(CL(A.dark, '#4a4d50'), 0.007, 0.075, 0.007, x0 + 0.06 + i2 * (fl - 0.12) / 6, rf + 0.038, z1 - 0.012);
      B(CL(A.dark, '#4a4d50'), fl - 0.06, 0.008, 0.008, x0 + fl / 2, rf + 0.078, z1 - 0.012);
      for (i2 = 0; i2 <= 4; i2++) B(CL(A.dark, '#4a4d50'), 0.007, 0.075, 0.007, x1 - 0.012, rf + 0.038, z0 + 0.08 + i2 * (sl - 0.16) / 4);
      B(CL(A.dark, '#4a4d50'), 0.008, 0.008, sl - 0.08, x1 - 0.012, rf + 0.078, z0 + sl / 2);
      if (lv >= 4) { O(A.leaf, 0.028, x0 + fl * 0.2, rf + 0.058, z1 - 0.03); O(CL(A.leaf, '#6f8f47'), 0.026, x0 + fl * 0.62, rf + 0.058, z1 - 0.03); O(A.leaf, 0.024, x1 - 0.03, rf + 0.058, z0 + sl * 0.4); O(CL(A.leaf, '#6f8f47'), 0.024, x1 - 0.03, rf + 0.058, z0 + sl * 0.75); }
      else { B(CL(A.wood, '#7a5c3a'), 0.1, 0.045, 0.1, x0 + fl * 0.3, rf + 0.024, z1 - 0.09); O(A.leaf, 0.03, x0 + fl * 0.3, rf + 0.062, z1 - 0.09); }
    }
    return rf;
  }
  /* ---- 玻璃塔（lv3+ 后排） ---- */
  function TOWER(xc, zc, w, d, nF, led, neonEdge, spire) {
    var FH = 0.2, H = nF * FH, yb = gr(xc + w / 2), yt = yb + H, tb = lv === 3 ? '#9db3c4' : '#8399ac';
    B(CL(A.twr, tb), w, H, d, xc, yb + H / 2, zc);
    for (i2 = 1; i2 < nF; i2++) B(CL(A.trim, '#b8bec4'), w + 0.016, 0.014, d + 0.016, xc, yb + i2 * FH, zc);
    for (i2 = 0; i2 < 4; i2++) B(CL(A.dark, '#3c4045'), 0.012, H, 0.012, xc - w / 2 + (i2 + 1) * w / 5, yb + H / 2, zc + d / 2 + 0.008);
    B(CL(A.dark, '#3c4045'), 0.012, H, 0.012, xc + w / 2 + 0.008, yb + H / 2, zc - d / 4); B(CL(A.dark, '#3c4045'), 0.012, H, 0.012, xc + w / 2 + 0.008, yb + H / 2, zc + d / 4);
    B(CL(A.trim, '#9aa2a8'), w + 0.02, 0.05, d + 0.02, xc, yt + 0.025, zc);
    B(A.metal, w * 0.4, 0.07, d * 0.4, xc - w * 0.15, yt + 0.085, zc - d * 0.1);
    if (neonEdge) B(A.neonC, 0.024, H * 0.66, 0.024, xc + w / 2 + 0.012, yb + H * 0.45, zc + d / 2 + 0.012);
    if (led) { B(A.ledm, w * 0.78, H * 0.56, 0.02, xc, yb + H * 0.6, zc + d / 2 + 0.014); B(A.neonP, w + 0.04, 0.022, d + 0.04, xc, yt - 0.03, zc); }
    if (spire) { Y(A.dark, 0.005, 0.011, 0.16, 12, xc, yt + 0.15, zc); O(A.red, 0.012, xc, yt + 0.24, zc); }
    return yt + (spire ? 0.26 : 0.12);
  }
  /* ---- 地形 + 街道 ---- */
  B(A.base, 2.56, 0.05, 2.56, 0, 0.025, 0);
  var wd = new THREE.Shape(); wd.moveTo(-1.28, 0); wd.lineTo(1.28, 0); wd.lineTo(1.28, 0.01); wd.lineTo(-1.28, 0.01 + RISE); wd.closePath();
  put(A.base, (function () { var geo = new THREE.ExtrudeGeometry(wd, { depth: 2.56, bevelEnabled: false }); geo.translate(0, 0.05, -1.28); return geo; })());
  SL(A.pave, 2.56, 0.02, 0.24, 0, 0.3, 0); SL(A.pave, 2.56, 0.02, 0.3, 0, 1.13, 0); SL(A.pave, 0.28, 0.02, 1.7, 1.14, -0.43, 0);
  SL(A.road, 2.56, 0.02, 0.56, 0, 0.7, -0.014); SL(A.road, 2.56, 0.02, 0.1, 0, -0.51, -0.004);
  SL(A.curb, 2.56, 0.024, 0.03, 0, 0.415, 0.002); SL(A.curb, 2.56, 0.024, 0.03, 0, 0.99, 0.002); SL(A.curb, 0.03, 0.024, 0.24, 1.115, 0.3, 0.002);
  SL(A.mark, 2.56, 0.004, 0.012, 0, 0.448, -0.011); SL(A.mark, 2.56, 0.004, 0.012, 0, 0.468, -0.011); SL(A.mark, 2.56, 0.004, 0.012, 0, 0.952, -0.011);
  if (lv >= 2) { Y(A.dark, 0.032, 0.032, 0.005, 12, 0.35, gr(0.35) - 0.008, 0.72); B(A.dark, 0.12, 0.012, 0.08, -0.6, gr(-0.6) - 0.004, 0.42); }
  function RAILX(x0, x1, z, n) { var j2, x, L = (x1 - x0) / Math.cos(TH); for (j2 = 0; j2 <= n; j2++) { x = x0 + (x1 - x0) * j2 / n; B(CL(A.dark, '#43464a'), 0.011, 0.09, 0.011, x, gr(x) + 0.045, z); } B(CL(A.dark, '#43464a'), L, 0.01, 0.01, (x0 + x1) / 2, gr((x0 + x1) / 2) + 0.092, z, 0, 0, -TH); B(CL(A.dark, '#43464a'), L, 0.008, 0.008, (x0 + x1) / 2, gr((x0 + x1) / 2) + 0.05, z, 0, 0, -TH); }
  function RAILZ(x, z0, z1, n) { var j2; for (j2 = 0; j2 <= n; j2++) B(CL(A.dark, '#43464a'), 0.011, 0.09, 0.011, x, gr(x) + 0.045, z0 + (z1 - z0) * j2 / n); B(CL(A.dark, '#43464a'), 0.01, 0.01, Math.abs(z1 - z0) + 0.01, x, gr(x) + 0.092, (z0 + z1) / 2); B(CL(A.dark, '#43464a'), 0.008, 0.008, Math.abs(z1 - z0) + 0.01, x, gr(x) + 0.05, (z0 + z1) / 2); }
  RAILX(-1.26, 1.26, 1.19, 16); RAILX(-1.2, 0.92, 0.45, 12); RAILZ(1.23, -0.42, 0.38, 6);
  if (lv >= 3) { var reflP = MS('#ffffff', 0.2, 0.35, '', 0, '#ff4fa8', 0.5, 0.55), reflC = MS('#ffffff', 0.2, 0.35, '', 0, '#3fd8e8', 0.48, 0.52), reflV = MS('#ffffff', 0.2, 0.35, '', 0, '#b45cff', 0.48, 0.52);
    B(reflP, 0.065, 0.005, 0.32, 0.34, gr(0.34) - 0.011, 0.58); B(reflC, 0.055, 0.005, 0.28, -0.44, gr(-0.44) - 0.011, 0.56); B(reflV, 0.055, 0.005, 0.28, -0.88, gr(-0.88) - 0.011, 0.56); }
  if (lv >= 2) { Y(A.dark, 0.02, 0.023, 0.052, 12, -0.95, gr(-0.95) + 0.026, 1.06); Y(A.dark, 0.024, 0.024, 0.008, 12, -0.95, gr(-0.95) + 0.058, 1.06); Y(CL(A.dark, '#2e4034'), 0.02, 0.023, 0.052, 12, 0.95, gr(0.95) + 0.026, 1.06); Y(A.dark, 0.024, 0.024, 0.008, 12, 0.95, gr(0.95) + 0.058, 1.06); }
  if (lv >= 3) { for (i = 0; i < 2; i++) { var fx = -0.62 + i * 0.74; B(CL(A.wood, '#7a5c3a'), 0.2, 0.032, 0.05, fx, gr(fx) + 0.016, 0.38); O(A.leaf, 0.026, fx - 0.05, gr(fx) + 0.05, 0.38); O(CL(A.leaf, '#6f8f47'), 0.024, fx + 0.05, gr(fx) + 0.048, 0.38); } }
  function LAMP(x, z, dir) { var yb2 = gr(x); Y(A.dark, 0.01, 0.013, 0.42, 12, x, yb2 + 0.21, z); B(A.dark, 0.012, 0.012, 0.17, x, yb2 + 0.415, z - 0.08 * dir); B(A.dark, 0.05, 0.02, 0.07, x, yb2 + 0.408, z - 0.155 * dir); B(A.lamp, 0.038, 0.012, 0.055, x, yb2 + 0.392, z - 0.155 * dir); }
  LAMP(-0.7, 1.08, 1); LAMP(0.6, 1.08, 1); if (lv >= 2) LAMP(-0.18, 0.31, -1); if (lv >= 3) LAMP(1.12, 0.24, -1);
  Y(A.red, 0.018, 0.018, 0.07, 12, 1.16, gr(1.16) + 0.035, 0.3); B(A.red, 0.05, 0.014, 0.014, 1.16, gr(1.16) + 0.045, 0.3); Y(A.red, 0.014, 0.014, 0.014, 12, 1.16, gr(1.16) + 0.077, 0.3);
  for (i = 0; i < 3; i++) Y(A.dark, 0.011, 0.013, 0.07, 12, 1.06 + i * 0.09, gr(1.06 + i * 0.09) + 0.035, 0.44);
  function TREE(x, z, s) { var yb2 = gr(x); B(A.dark, 0.1 * s, 0.008, 0.1 * s, x, yb2 + 0.004, z); Y(CL(A.wood, '#6e543c'), 0.014 * s, 0.022 * s, 0.3 * s, 12, x, yb2 + 0.16 * s, z); O(A.leaf, 0.12 * s, x, yb2 + 0.36 * s, z); O(CL(A.leaf, '#6f8f47'), 0.09 * s, x + 0.06 * s, yb2 + 0.3 * s, z + 0.03 * s); O(CL(A.leaf, '#4e6a32'), 0.08 * s, x - 0.05 * s, yb2 + 0.44 * s, z - 0.02 * s); }
  if (lv >= 2) TREE(-1.12, 1.1, 0.75); if (lv >= 3) TREE(-0.35, 1.12, 0.7); if (lv >= 4) TREE(0.45, 1.12, 0.65);
  /* ---- 前排唐楼街墙（转角主楼 + 4 栋） ---- */
  HERO();
  var FR = [{ xc: 0.16, w: 0.42, seed: 11 }, { xc: -0.29, w: 0.44, seed: 23 }, { xc: -0.72, w: 0.38, seed: 37 }, { xc: -1.1, w: 0.36, seed: 41 }];
  var NF = [5, 5, 5, 4]; if (lv === 2) NF = [6, 6, 6, 5]; if (lv >= 3) NF = [6, 6, 7, 5];
  var WCL = lv === 1 ? ['#cfccc2', '#c5c2b8', '#ccc1ab', '#b9b6ac'] : lv === 2 ? ['#d8d1c1', '#c6c3b9', '#d3c0bc', '#c3c0b6'] : lv === 3 ? ['#dcd6c6', '#c8c5bb', '#d0bdb9', '#c6c3b9'] : ['#dcd6c6', '#6e7074', '#d0bdb9', '#c6c3b9'];
  var WT = lv === 1 ? ['p', 'p', 'p', 'p'] : lv === 2 ? ['q', 'p', 'p', 'p'] : lv === 3 ? ['q', 'p', 'p', 'p'] : ['q', 'd', 'p', 'p'];
  var balc = lv <= 2 ? [[2, 4], [], [2, 4], [2]] : [[2, 4], [3], [2, 4], [2]];
  var shops = [
    lv === 1 ? { pil: CL(A.wallW, '#ccc9bf'), fasc: CL(A.wallD, '#e8e4d8'), fr: '#5a5c5e', awn: A.awnS, lit: false, sign: hSign('得如茶樓', '#f2eee4', '#1c3a6a', false) } : { pil: CL(A.wallD, '#26272a'), fasc: CL(A.wallD, '#232325'), fr: '#8c9096', awn: CL(A.awn, '#3a5a8a'), lit: true, sign: lv >= 4 ? hSign('KTV・酒吧', '#241430', '#ff6fc0', true) : hSign('BAR & GRILL', '#1a1418', '#ffb84a', true) },
    lv === 1 ? { pil: CL(A.wallW, '#ccc9bf'), fasc: CL(A.wallD, '#ece8dc'), fr: '#4a4c4e', awn: CL(A.awn, '#b03228'), lit: false } : { pil: CL(A.wallC, '#d8d2c2'), fasc: CL(A.wallD, '#3a2a4a'), fr: '#8c9096', awn: lv >= 4 ? CL(A.awn, '#2c2c2e') : CL(A.awn, '#8a3a6a'), lit: true, sign: hSign('夜總會', '#2a1436', '#d86fe8', true) },
    lv === 1 ? { pil: CL(A.wallW, '#ccc9bf'), fasc: CL(A.wallD, '#e8e4d8'), fr: '#5a5c5e', awn: null, lit: false, sign: hSign('永安百貨', '#f2eee4', '#c8322a', false) } : { pil: CL(A.wallW, '#ccc9bf'), fasc: CL(A.wallD, '#2a3a5a'), fr: '#8c9096', awn: CL(A.awn, '#3a5a8a'), lit: true },
    lv === 1 ? { pil: CL(A.wallW, '#c6c3b9'), fasc: CL(A.wallD, '#e4e0d4'), fr: '#4a4c4e', awn: null, lit: false } : { pil: CL(A.wallW, '#c6c3b9'), fasc: CL(A.wallD, '#5a2a2a'), fr: '#8c9096', awn: lv >= 4 ? CL(A.awn, '#2c2c2e') : CL(A.awn, '#b03228'), lit: true }];
  var roofsF = lv >= 3 ? [['hut', 'tank', 'solar'], ['tank', 'ant', 'shrub'], ['hut', 'dish', 'solar'], ['tank', 'ac', 'shrub']] : [['hut', 'tank', 'dish'], ['tank', 'ant', 'ac'], ['hut', 'dish', 'tank'], ['tank', 'ac', 'shrub']];
  for (i = 0; i < 4; i++) TONG({ xc: FR[i].xc, w: FR[i].w, d: 0.64, zc: -0.14, nF: NF[i], seed: FR[i].seed, wall: { b: (WT[i] === 'p' ? A.wallW : WT[i] === 'd' ? A.wallD : A.wallC).b, c: V(WCL[i]) }, fr: WT[i] === 'd' ? '#c9ccd0' : shops[i].fr, balc: balc[i], lit: litP, ac: WT[i] === 'd' ? 0.1 : acP, shop: shops[i], roof: roofsF[i], pipe: WT[i] === 'p' && i !== 1, wc: WT[i] === 'd' ? '#2c3640' : '#3a444e', band: WT[i] === 'd' ? '#9a9ca0' : lv === 1 ? '#c9c5ba' : '#dcd8cc', cap: WT[i] === 'd' ? '#a4a6aa' : lv === 1 ? '#c4c0b5' : '#dcd8cc' });
  /* ---- 后排（唐楼 → 玻璃塔 + LED 媒体墙） ---- */
  var BR = [{ xc: 0.85, w: 0.72, seed: 61 }, { xc: 0.18, w: 0.56, seed: 73 }, { xc: -0.45, w: 0.62, seed: 89 }, { xc: -1.03, w: 0.5, seed: 97 }];
  if (lv <= 2) {
    var NFB = lv === 1 ? [5, 5, 5, 4] : [6, 7, 6, 5];
    var WBCL = lv === 1 ? ['#c8c5bb', '#cecbc1', '#c1beb4', '#c9c6bc'] : ['#d2cbb9', '#d8d1c1', '#c6c3b9', '#cdcac0'];
    var roofB = [['tank', 'ac', 'dish'], ['hut', 'ant'], ['hut', 'dish', 'tank'], ['tank', 'hut', 'ac']];
    for (i = 0; i < 4; i++) TONG({ xc: BR[i].xc, w: BR[i].w, d: 0.7, zc: -0.91, nF: NFB[i], seed: BR[i].seed, wall: { b: A.wallW.b, c: V(WBCL[i]) }, fr: '#4a4c4e', balc: i === 1 ? [2] : [], lit: litP, ac: acP * 0.7, shop: null, roof: roofB[i], side: i === 0 ? 1 : 0, pipe: i !== 1, wc: '#3a444e', band: '#c9c5ba', cap: '#c4c0b5' });
  } else {
    TONG(lv >= 4 ? { xc: BR[0].xc, w: BR[0].w, d: 0.7, zc: -0.91, nF: 8, seed: 61, wall: { b: A.wallD.b, c: V('#6b6d72') }, fr: '#c9ccd0', balc: [2, 4, 6], lit: litP, ac: 0.12, shop: null, roof: ['tank', 'ac', 'ant'], side: 1, wc: '#2c3640', band: '#9a9ca0', cap: '#a4a6aa' }
      : { xc: BR[0].xc, w: BR[0].w, d: 0.7, zc: -0.91, nF: 7, seed: 61, wall: { b: A.wallC.b, c: V('#e2dbcb') }, fr: '#8c9096', balc: [2], lit: litP, ac: 0.2, shop: null, roof: ['tank', 'ac', 'ant'], side: 1, wc: '#3a444e', band: '#dcd8cc', cap: '#d8d4c8' });
    TONG({ xc: BR[3].xc, w: BR[3].w, d: 0.7, zc: -0.91, nF: lv >= 4 ? 8 : 6, seed: 97, wall: { b: A.wallW.b, c: V('#d5d2c8') }, fr: '#4a4c4e', balc: [3], lit: litP, ac: 0.3, shop: null, roof: ['tank', 'hut'], pipe: true, wc: '#3a444e', band: '#c9c5ba', cap: '#c4c0b5' });
    if (lv >= 4) TOWER(BR[2].xc, -0.91, BR[2].w, 0.62, 12, false, false, true); else TOWER(BR[2].xc, -0.91, BR[2].w, 0.62, 9, false, false, false);
    TOWER(BR[1].xc, -0.91, BR[1].w, 0.6, lv >= 4 ? 10 : 8, lv >= 4, lv >= 4, false);
  }
  /* ---- 霓虹 / 招牌 ---- */
  var yb2g = gr(0.37), yb3g = gr(-0.07), yb4g = gr(-0.53), yb5g = gr(-0.92);
  if (lv >= 2) {
    var VNEON = function (txt, col, bk, x, y) { SIGN(vSign(txt, col, '#16121c', true), 0.082, 0.3, x, y, 0.248, PI / 2, eiS); B(A.dark, 0.008, 0.008, 0.11, x, y + 0.14, 0.235); B(A.dark, 0.008, 0.008, 0.11, x, y - 0.14, 0.235); B(bk, 0.011, 0.31, 0.011, x, y, 0.3); if (lv >= 3) { B(bk, 0.011, 0.011, 0.095, x, y + 0.155, 0.2525); B(bk, 0.011, 0.011, 0.095, x, y - 0.155, 0.2525); } };
    VNEON('蘭桂坊', '#ff4fa8', A.neonP, 0.34, yb2g + 0.86); VNEON('酒吧', '#3fd8e8', A.neonC, -0.44, yb3g + 0.86);
    if (lv >= 3) { VNEON('夜總會', '#b45cff', A.neonV, -0.88, yb4g + 0.98); VNEON('CLUB', '#ff3b30', A.neonR, -1.22, yb5g + 0.78); B(MS('#ffffff', 0.3, 0, '', 0, '#4fa8ff', 0.55), 0.085, 0.045, 0.016, -0.13, yb3g + 0.55, 0.194); B(A.dark, 0.095, 0.006, 0.022, -0.13, yb3g + 0.522, 0.193); }
    if (lv >= 4) { VNEON('KTV', '#3fd8e8', A.neonC, 0.34, yb2g + 0.42); VNEON('酒廊', '#ff4fa8', A.neonP, -0.56, yb4g + 0.56); }
    SIGN(hSign('啤酒屋', '#10306a', '#8ec8ff', true), 0.24, 0.062, -0.29, yb3g + 0.62, 0.235, 0, eiS); B(A.dark, 0.008, 0.008, 0.06, -0.4, yb3g + 0.62, 0.21); B(A.dark, 0.008, 0.008, 0.06, -0.18, yb3g + 0.62, 0.21);
    B(A.neonR, 0.3, 0.009, 0.009, 0.16, yb2g + 0.232, 0.206); if (lv >= 4) B(A.neonC, 0.34, 0.009, 0.009, -0.29, yb3g + 0.232, 0.206);
    if (lv >= 3) { B(A.neonP, 0.56, 0.01, 0.01, -0.72, yb4g + 0.232, 0.206); B(A.neonV, 0.01, 0.5, 0.01, -0.365, yb3g + 0.49, 0.2); }
  } else {
    SIGN(vSign('大押', '#c8322a', '#f2eee4', false), 0.08, 0.28, -0.44, yb3g + 0.88, 0.226, PI / 2, 0.06); B(A.dark, 0.008, 0.008, 0.08, -0.44, yb3g + 0.73, 0.21); B(A.dark, 0.008, 0.008, 0.08, -0.44, yb3g + 1.03, 0.21);
    SIGN(vSign('金行', '#c8322a', '#f6f2e8', false), 0.075, 0.26, 0.05, yb2g + 0.84, 0.226, PI / 2, 0.06); B(A.dark, 0.008, 0.008, 0.08, 0.05, yb2g + 0.7, 0.21); B(A.dark, 0.008, 0.008, 0.08, 0.05, yb2g + 0.98, 0.21);
    SIGN(vSign('藥房', '#1c3a6a', '#f6f2e8', false), 0.075, 0.26, -0.78, yb4g + 0.92, 0.226, PI / 2, 0.06); B(A.dark, 0.008, 0.008, 0.08, -0.78, yb4g + 0.78, 0.21); B(A.dark, 0.008, 0.008, 0.08, -0.78, yb4g + 1.06, 0.21);
  }
  /* ---- lv4 外摆 + 盆栽 ---- */
  if (lv >= 4) {
    for (i = 0; i < 3; i++) { var tx = 0.62 - i * 0.24, ty = gr(tx); Y(A.dark, 0.032, 0.032, 0.007, 12, tx, ty + 0.05, 0.31); B(A.dark, 0.008, 0.05, 0.008, tx, ty + 0.025, 0.31); B(CL(A.wood, '#8a6a44'), 0.035, 0.035, 0.035, tx + 0.06, ty + 0.025, 0.3 + (i % 2) * 0.05); B(CL(A.wood, '#8a6a44'), 0.035, 0.035, 0.035, tx - 0.06, ty + 0.025, 0.3 - (i % 2) * 0.05); }
    for (i = 0; i < 2; i++) { var px = 0.92 + i * 0.1, py = gr(px); Y(CL(A.wallD, '#3a3b3e'), 0.024, 0.03, 0.05, 12, px, py + 0.025, 0.26); O(A.leaf, 0.034, px, py + 0.065, 0.26); }
  }
  flush(g);
  g.userData.anim = [
    function (t) { var s = 0.5 + 0.5 * Math.sin(t * 2.2), j2; EI(A.neonP, 0.65 + 0.22 * s); EI(A.neonC, 0.9 - 0.22 * s); EI(A.neonR, 0.7 + 0.2 * Math.sin(t * 3.1)); EI(A.neonV, 0.75 + 0.2 * Math.sin(t * 2.6 + 1)); for (j2 = 0; j2 < signMs.length; j2++) signMs[j2].emissiveIntensity = eiS + 0.1 * (0.5 + 0.5 * Math.sin(t * 2.2 + j2 * 1.3)); },
    function (t) { EI(A.glow, eiG + 0.1 * (0.5 + 0.5 * Math.sin(t * 1.3))); EI(A.lit, eiL + 0.08 * (0.5 + 0.5 * Math.sin(t * 1.1 + 1))); }];
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[36] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
