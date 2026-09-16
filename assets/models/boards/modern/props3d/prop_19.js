/* 大富翁·现代写实棋盘 格 19「春熙路」—— 成都商业核心（春熙路/IFS）现代写实 v2 精修
 * 视觉基准 refs/modern/prop_19.png 四象限（渲染机位同参考：45° 航拍，画面左=+z 面、画面右=+x 面、近角=(+x,+z)）。
 * 构图：L 形商场主翼(x −0.9..0.6 × z −0.92..0.25)+右后翼；玻璃转角中庭在裙楼近角(0.26,−0.09)（与 lv1 转角圆楼同位演进）；
 *   喷泉/环形铺装广场包住近角；塔群全部自后排升起（不挡商场沿街立面）；lv3 LED 在右翼削角立面、海报在中庭弧面；
 *   lv4 双 LED（前 +z / 左 −x）+ IFS 爬墙熊猫攀附 +x 削角立面近角。
 * 年代特征：lv1 周边式商住楼群（转角圆楼巨幅彩绘广告/灰天面水箱天线楼梯间/店招色条/雨棚/内院棚屋/杆旗亭子）
 *   → lv2 米石商场+弧形玻璃中庭+竖幅时尚海报+顶部玻璃带+保留老楼+米石灰塔+蓝玻璃圆冠塔+广场喷泉
 *   → lv3 前立面全幕墙白横带竖梃+右翼巨幅 LED+屋顶绿化修剪球+格栅冠主塔+五塔 → lv4 白石竖壁分缝立面+双 LED
 *   +爬墙熊猫（头过檐口）+屋顶空中花园树阵/格栅架/玻璃栏杆+七塔+豪华玻璃雨棚+环形广场铺装。
 * 材质工艺：中性 Canvas（抹灰噪点/雨渍、铺装分缝/麻点/缝沿高光、石板分缝/风化、幕墙分格、草坪）+顶点色分区染色；
 *   贴图材质 color=白+previewColor 主色（overlay 语义）；LED/店招 emissiveMap；roughness 分区 玻璃.18/钢.35/石.7-.95/水.12；
 *   boxUV 世界尺寸烘焙（BU/W）；零 Math.random（LCG 种子）；动画 ≤2（LED 呼吸 + 店招/路灯暖光呼吸）。
 * R1 变更：结构重构——「白盒商场+四角塔」改 L 形主翼+近角转角中庭+后排塔群（参考同机位构图归位）；lv1 改周边式围合
 *   8 体量+内院棚屋；广场/喷泉移近角 (+x,+z)；LED/熊猫/海报按象限归位；塔改蓝玻幕墙主体+细白层间带+三式塔冠。
 * R2 变更：lv2 屋顶改天窗带（草坪留 lv3+）；熊猫黑肩带/耳/眼斑/四肢放大；lv4 放射线广场；四侧深色人行道带；lv3 LED 提亮；
 *   屋顶杂物增变（双坡棚屋/双水箱）；旗幅杆×3、花箱、底层小店招；喷泉分级（lv1 缩小）。
 * R3 变更：行道树按参考比例缩小（树冠占街区 9%→4%）；幕墙面板 boxUV + 贴图加深蓝色、lv3 横带/竖梃减薄；lv1 围合闭合
 *   （右排+前排右楼）、楼高 3→4-5 层、广告位正对镜头；后部抬升体量（阶梯屋面）+顶部天窗/机房；lv3/4 屋顶树阵+球篱+格栅架；
 *   lv2 石材腰线×3/分缝加深；小球体 detail 分级控三角预算（lv1 8.6k / lv2 9.9k / lv3 12.8k / lv4 17.3k）。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_19] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
var _mc = {};
function M(h, o) { /* 静态材质缓存：map/vc 时 color=白、previewColor 记主色（overlay 语义） */
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + (o.map ? o.map.uuid : '') + '|' + (o.vc ? 1 : 0);
  if (_mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(o.map || o.vc ? '#ffffff' : h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, vertexColors: true });
  if (o.map) m.map = o.map; if (o.map || o.vc) m.userData.previewColor = h; return (_mc[k] = m);
}
function MF(h, o) { /* 发光材质：每次全新实例（动画材质不跨实例共享）；emap=emissiveMap */
  o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, vertexColors: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; } if (o.map) m.map = o.map; if (o.emap) m.emissiveMap = o.emap; return m;
}
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function spk(g, S, R, n, a, b, mw, mh) { for (var i = 0; i < n; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect((R() * S) | 0, (R() * S) | 0, 1 + ((R() * mw) | 0), 1 + ((R() * mh) | 0)); } }
var _t = {};
function texPlaster() { /* 中性抹灰(顶点色染)：底色 → 噪点 → 雨渍竖痕 → 风化斑 → 踢脚污带 */
  if (_t.pl) return _t.pl; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1911), i;
  g.fillStyle = '#e9e4da'; g.fillRect(0, 0, S, S);
  spk(g, S, R, 260, 'rgba(255,255,255,0.35)', 'rgba(122,110,94,0.13)', 3, 3);
  for (i = 0; i < 10; i++) { g.fillStyle = 'rgba(112,102,88,' + (0.05 + R() * 0.08) + ')'; g.fillRect(R() * S, R() * 24, 2 + R() * 3, 20 + R() * 80); }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(90,80,66,' + (0.05 + R() * 0.07) + ')'; g.beginPath(); g.arc(R() * S, R() * S, 4 + R() * 10, 0, PI * 2); g.fill(); }
  g.fillStyle = 'rgba(82,72,60,0.14)'; g.fillRect(0, S - 9, S, 9);
  return (_t.pl = TX(c)); }
function texPave() { /* 花岗石铺装：底色 → 分块明暗 → 分缝 → 缝沿高光 → 麻点 */
  if (_t.pv) return _t.pv; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1912), i, x, y;
  g.fillStyle = '#b7b3a9'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 32) for (x = 0; x < S; x += 32) { var v = 0.9 + R() * 0.2; g.fillStyle = 'rgb(' + (183 * v | 0) + ',' + (179 * v | 0) + ',' + (169 * v | 0) + ')'; g.fillRect(x + 1, y + 1, 30, 30); g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x + 1, y + 1, 30, 1); g.fillRect(x + 1, y + 1, 1, 30); }
  g.strokeStyle = 'rgba(72,68,62,0.45)'; g.lineWidth = 1.5; for (i = 0; i <= S; i += 32) { g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke(); g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke(); }
  spk(g, S, R, 170, 'rgba(255,255,255,0.18)', 'rgba(60,56,50,0.16)', 3, 2);
  return (_t.pv = TX(c)); }
function texPanel(k, base, pw, ph, jt) { /* 石板/白石板：底色 → 分块明暗 → 分缝 → 缝沿高光 → 麻点 → 雨渍 */
  if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1913 + k.length * 7), x, y, i;
  g.fillStyle = base; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += ph) for (x = 0; x < S; x += pw) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,' + (0.03 + R() * 0.07) + ')' : 'rgba(52,48,42,' + (0.02 + R() * 0.06) + ')'; g.fillRect(x, y, pw, ph); g.fillStyle = jt; g.fillRect(x, y, pw, 2); g.fillRect(x, y, 2, ph); g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(x + 2, y + 2, pw - 3, 1); }
  spk(g, S, R, 110, 'rgba(255,255,255,0.15)', 'rgba(60,56,50,0.11)', 2, 2);
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(72,68,62,' + (0.04 + R() * 0.06) + ')'; g.fillRect(R() * S, ((R() * S / ph) | 0) * ph + 2, 1 + R() * 2, 8 + R() * 18); }
  return (_t[k] = TX(c)); }
function texCurtain() { /* 玻璃幕墙：蓝灰渐变 → 分格面板明暗(天空反光/室内暖光) → 竖梃横梃高光线 */
  if (_t.cw) return _t.cw; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1916), x, y;
  var gr = g.createLinearGradient(0, 0, 0, S); gr.addColorStop(0, '#86abbd'); gr.addColorStop(1, '#3d6076'); g.fillStyle = gr; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 32) { var r = R(); g.fillStyle = r > 0.88 ? 'rgba(255,226,170,0.42)' : r > 0.55 ? 'rgba(215,232,244,' + (0.08 + R() * 0.14) + ')' : 'rgba(10,28,46,' + (0.12 + R() * 0.26) + ')'; g.fillRect(x + 2, y + 2, 28, 12); }
  g.fillStyle = 'rgba(238,242,244,0.75)'; for (y = 0; y < S; y += 16) g.fillRect(0, y, S, 2); for (x = 0; x < S; x += 32) g.fillRect(x, 0, 2, S);
  return (_t.cw = TX(c)); }
function texLawn() { /* 草坪：底色 → 噪点 → 修剪横纹 */
  if (_t.ln) return _t.ln; var S = 64, c = cv(S, S), g = c.getContext('2d'), R = lcg(1917), i;
  g.fillStyle = '#6f8f3e'; g.fillRect(0, 0, S, S); spk(g, S, R, 200, 'rgba(255,255,255,0.22)', 'rgba(20,50,10,0.3)', 3, 2);
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(30,70,20,0.12)'; g.fillRect(0, i * 8, S, 3); }
  return (_t.ln = TX(c)); }
function texPoster(v) { var k = 'p' + v; if (_t[k]) return _t[k]; var c = cv(128, 256), g = c.getContext('2d'), R = lcg(1918 + v), i;
  if (v === 0) { /* 1990s 转角彩绘广告：米白底 → 蓝裙人形 → 肤色/发色 → 题字条 → 亮面斜反光 → 边角风化 */
    g.fillStyle = '#eef0ee'; g.fillRect(0, 0, 128, 256);
    g.fillStyle = '#2c63b8'; g.beginPath(); g.moveTo(44, 240); g.quadraticCurveTo(30, 160, 54, 124); g.lineTo(80, 124); g.quadraticCurveTo(100, 160, 88, 240); g.closePath(); g.fill();
    g.fillStyle = '#f0d0b8'; g.beginPath(); g.arc(66, 104, 19, 0, PI * 2); g.fill();
    g.fillStyle = '#26221e'; g.beginPath(); g.arc(66, 94, 19, PI, 0); g.fill(); g.fillRect(47, 94, 38, 10);
    g.fillStyle = '#b8342a'; g.fillRect(20, 244, 88, 5); g.fillStyle = '#2c63b8'; g.fillRect(28, 16, 72, 6);
  } else { /* 2000s 时尚海报：品红底 → 顶/底色带 → 人形剪影 → 文字条 */
    g.fillStyle = '#c05a96'; g.fillRect(0, 0, 128, 256);
    g.fillStyle = '#e8b8d4'; g.fillRect(0, 0, 128, 40); g.fillStyle = '#8c3468'; g.fillRect(0, 226, 128, 30);
    g.fillStyle = '#f2e2ec'; g.beginPath(); g.arc(64, 96, 24, 0, PI * 2); g.fill();
    g.beginPath(); g.moveTo(42, 230); g.quadraticCurveTo(32, 150, 54, 120); g.lineTo(76, 120); g.quadraticCurveTo(96, 150, 86, 230); g.closePath(); g.fill();
    g.fillStyle = '#5a1e44'; g.fillRect(20, 234, 88, 4); g.fillStyle = '#f2e2ec'; g.fillRect(30, 14, 68, 6); }
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(0, 60); g.lineTo(128, 18); g.lineTo(128, 52); g.lineTo(0, 94); g.closePath(); g.fill();
  for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(50,24,36,' + (0.07 + R() * 0.09) + ')'; g.fillRect(R() > 0.5 ? R() * 12 : 116 + R() * 12, R() * 256, 3 + R() * 6, 4 + R() * 12); }
  return (_t[k] = TX(c)); }
function texLED() { /* LED 屏内容：暗底 → 渐变 → 品红光斑横带 → 亮闪点 → 扫描线像素格 */
  if (_t.e) return _t.e; var c = cv(128, 96), g = c.getContext('2d'), R = lcg(1903), i;
  g.fillStyle = '#181222'; g.fillRect(0, 0, 128, 96); g.fillStyle = 'rgba(90,40,120,0.35)'; g.fillRect(0, 0, 128, 30); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, 70, 128, 26);
  for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(240,90,180,' + (0.25 + R() * 0.5) + ')'; g.fillRect(8 + R() * 60, 10 + R() * 60, 20 + R() * 40, 6 + R() * 14); }
  for (i = 0; i < 12; i++) { g.fillStyle = 'rgba(255,220,245,' + (0.3 + R() * 0.5) + ')'; g.fillRect(R() * 128, R() * 96, 2 + R() * 4, 2); }
  for (i = 0; i < 96; i += 3) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, i, 128, 1); } for (i = 0; i < 128; i += 4) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(i, 0, 1, 96); }
  return (_t.e = TX(c)); }
function signTex(txt, bg, fg) { var c = cv(256, 64), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, 256, 20); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34); return TX(c); }
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh（顶点色分区染色）；W = boxUV 世界尺寸烘焙 ---- */
var BK, TINT = null, WHITE = new THREE.Color(1, 1, 1);
function tn(h) { TINT = h ? C(h) : null; }
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function BU(g, w, h, d, per) { var uv = g.attributes.uv, fs = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], f, v, i; for (f = 0; f < 6; f++) for (v = 0; v < 4; v++) { i = f * 4 + v; uv.setXY(i, uv.getX(i) * fs[f][0] / per, uv.getY(i) * fs[f][1] / per); } return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [], ts: [] }); b.gs.push(g); b.ts.push(TINT); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function W(m, w, h, d, x, y, z, per, rx, ry, rz) { put(m, xf(BU(new THREE.BoxGeometry(w, h, d), w, h, d, per), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function YO(m, r, h, s, x, y, z) { put(m, xf(new THREE.CylinderGeometry(r, r, h, s, 1, true), x, y, z)); }
function YS(m, r, h, s, ts, tl, x, y, z) { put(m, xf(new THREE.CylinderGeometry(r, r, h, s, 1, true, ts, tl), x, y, z)); }
function YU(m, r, h, s, x, y, z, per) { var g = new THREE.CylinderGeometry(r, r, h, s, 1, true), uv = g.attributes.uv, i, cf = 2 * PI * r / per; for (i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * cf, uv.getY(i) * h / per); put(m, xf(g, x, y, z)); }
function O(m, r, x, y, z, rx, ry, rz, sx, sy, sz) { put(m, xf(new THREE.IcosahedronGeometry(r, r < 0.05 ? 0 : 1), x, y, z, rx || 0, ry || 0, rz || 0, sx || 1, sy || 1, sz || 1)); }
function OS(m, r, x, y, z, rx, ry, rz, sx, sy, sz) { put(m, xf(new THREE.SphereGeometry(r, 16, 12), x, y, z, rx || 0, ry || 0, rz || 0, sx || 1, sy || 1, sz || 1)); }
function flush(g) { for (var k in BK) { var b = BK[k], gs = b.gs, ts = b.ts, P = 0, i, j;
  for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
  var pa = new Float32Array(P), na = new Float32Array(P), ca = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
  for (i = 0; i < gs.length; i++) { var pp = gs[i].attributes.position.array, t = ts[i] || WHITE; pa.set(pp, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2);
    for (j = 0; j < pp.length; j += 3) { ca[o + j] = t.r; ca[o + j + 1] = t.g; ca[o + j + 2] = t.b; } o += pp.length; }
  var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
  var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms); } }
/* ---- 部件 ---- */
var SIGN = ['#b83a2a', '#2c58a0', '#d19a3a', '#2f7f78', '#e8e4d8', '#3d8a48'];
function PB(hex, w, h, d, x, y, z, rx, ry, rz) { tn(hex); B(A0.plaster, w, h, d, x, y, z, rx, ry, rz); tn(null); }
function SB(hex, w, h, d, x, y, z, rx, ry, rz) { tn(hex); B(A0.sign, w, h, d, x, y, z, rx, ry, rz); tn(null); }
function RB(hex, w, h, d, x, y, z, rx, ry, rz) { tn(hex); B(A0.rough, w, h, d, x, y, z, rx, ry, rz); tn(null); }
function tree(A, x, z, r, full, y0) { /* 行道树：干 + 双/三瓣层叠树冠（双色顶点染；lv3+ 三瓣） */
  y0 = y0 || 0.06; var h = r * 1.7;
  RB('#5a4632', 0.028, h, 0.028, x, y0 + h / 2, z);
  tn('#4f7a34'); O(A.leaf, r, x, y0 + h + r * 0.7, z); tn('#6a9440'); O(A.leaf, r * 0.62, x + r * 0.5, y0 + h + r * 1.02, z + r * 0.25);
  if (full) { tn('#446c2e'); O(A.leaf, r * 0.55, x - r * 0.45, y0 + h + r * 0.92, z - r * 0.3); } tn(null); }
function lamp(A, x, z, L, nx, nz) { /* 路灯：lv1/2 单头杆 → lv3+ 双头暖光 */
  var y0 = 0.06, h = L >= 3 ? 0.42 : 0.33;
  Y(A.steel, 0.007, 0.009, h, 12, x, y0 + h / 2, z);
  B(A.steel, nx ? 0.1 : 0.012, 0.008, nz ? 0.1 : 0.012, x + nx * 0.045, y0 + h - 0.012, z + nz * 0.045);
  if (L >= 3) { B(A.steel, nx ? 0.1 : 0.012, 0.008, nz ? 0.1 : 0.012, x - nx * 0.045, y0 + h - 0.012, z - nz * 0.045);
    B(A.lamp, 0.032, 0.014, 0.032, x + nx * 0.085, y0 + h - 0.024, z + nz * 0.085); B(A.lamp, 0.032, 0.014, 0.032, x - nx * 0.085, y0 + h - 0.024, z - nz * 0.085); }
  else B(A.mull, 0.03, 0.018, 0.03, x + nx * 0.085, y0 + h - 0.022, z + nz * 0.085); }
function zebra(A, cx, cz, ax) { /* 斑马线：条带平行车道方向 */
  for (var k = 0; k < 5; k++) { var t = -0.11 + k * 0.055; tn('#e6e6df'); if (ax) B(A.rough, 0.3, 0.003, 0.028, cx, 0.053, cz + t); else B(A.rough, 0.028, 0.003, 0.3, cx + t, 0.053, cz); tn(null); } }
function rc(A, x, z, w, d, top, seed) { /* 屋顶杂物：水箱(奇偶双箱)/楼梯间或双坡棚屋/空调外机/电视天线 */
  var R = lcg(seed), bx = x + (R() - 0.5) * w * 0.4, bz = z + (R() - 0.5) * d * 0.4;
  Y(A.mull, 0.028, 0.028, 0.055, 12, x + (R() - 0.5) * w * 0.5, top + 0.028, z + (R() - 0.5) * d * 0.5);
  if (seed % 3 === 0) Y(A.mull, 0.024, 0.024, 0.05, 12, x - w * 0.3, top + 0.025, z - d * 0.3);
  if (seed % 2) { PB('#b9b3a4', 0.13, 0.055, 0.1, bx, top + 0.028, bz); PB('#7b7873', 0.15, 0.006, 0.062, bx, top + 0.07, bz + 0.028, 0.42, 0, 0); PB('#7b7873', 0.15, 0.006, 0.062, bx, top + 0.07, bz - 0.028, -0.42, 0, 0); }
  else PB('#b9b3a4', 0.11, 0.075, 0.09, bx, top + 0.038, bz);
  B(A.mull, 0.042, 0.028, 0.03, x - w * 0.25, top + 0.014, z + d * 0.2); B(A.mull, 0.03, 0.024, 0.03, x + w * 0.28, top + 0.012, z - d * 0.22);
  B(A.steel, 0.005, 0.13, 0.005, x + w * 0.3, top + 0.065, z + d * 0.3); B(A.steel, 0.05, 0.004, 0.004, x + w * 0.3, top + 0.118, z + d * 0.3); }
function ob(A, x, z, w, d, h, hex, fc, seed, gf) { /* 1990s 商住楼：抹灰墙(顶点染)+灰天面+女儿墙+深窗/通长窗台/外挂空调+底层店招色条/橱窗/雨棚 */
  var y0 = 0.06, top = y0 + h, i, j, k, rows = Math.max(1, Math.round((h - 0.22) / 0.15)), fd = [[0, 1], [-1, 0], [1, 0], [0, -1]];
  gf = gf === undefined ? fc : gf;
  PB(hex, w, h - 0.012, d, x, y0 + (h - 0.012) / 2, z);
  PB('#7d7a73', w - 0.02, 0.012, d - 0.02, x, top - 0.006, z);
  PB(hex, w + 0.016, 0.034, 0.016, x, top + 0.017, z + d / 2); PB(hex, w + 0.016, 0.034, 0.016, x, top + 0.017, z - d / 2);
  PB(hex, 0.016, 0.034, d, x - w / 2, top + 0.017, z); PB(hex, 0.016, 0.034, d, x + w / 2, top + 0.017, z);
  for (k = 0; k < 4; k++) { if (!(fc & (1 << k))) continue; var nx = fd[k][0], nz = fd[k][1], ln = (nx ? d : w) - 0.07, n = Math.max(2, Math.round(ln / 0.13));
    for (i = 0; i < rows; i++) { var wy = y0 + 0.34 + i * 0.15;
      tn('#ded8ca'); B(A.mull, nx ? 0.014 : ln, 0.008, nx ? ln : 0.014, x + nx * (w / 2 + 0.007), wy - 0.048, z + nz * (d / 2 + 0.007));
      for (j = 0; j < n; j++) { var tt = -ln / 2 + (j + 0.5) * ln / n, wx = nx ? x + nx * (w / 2 + 0.006) : x + tt, wz = nx ? z + tt : z + nz * (d / 2 + 0.006);
        B(A.dark, nx ? 0.012 : 0.05, 0.078, nx ? 0.05 : 0.012, wx, wy, wz);
        if ((i * 7 + j * 3 + k + seed) % 6 === 0) B(A.mull, nx ? 0.022 : 0.036, 0.024, nx ? 0.036 : 0.022, wx + nx * 0.017, wy - 0.052, wz + nz * 0.017); }
      tn(null); }
    if (gf & (1 << k)) { var segs = Math.max(1, Math.round(ln / 0.24));
      for (j = 0; j < segs; j++) { var t2 = -ln / 2 + (j + 0.5) * ln / segs, hx = SIGN[(seed + j + k) % SIGN.length], sx = nx ? x + nx * (w / 2 + 0.008) : x + t2, sz = nx ? z + t2 : z + nz * (d / 2 + 0.008);
        tn(hx); B(A.sign, nx ? 0.016 : ln / segs - 0.014, 0.066, nx ? ln / segs - 0.014 : 0.016, sx, y0 + 0.215, sz);
        B(A.dark, nx ? 0.012 : ln / segs - 0.05, 0.068, nx ? ln / segs - 0.05 : 0.012, sx, y0 + 0.075, sz); tn(null);
        if ((seed + j) % 3 === 0) { tn(hx); if (nx) B(A.sign, 0.075, 0.007, ln / segs - 0.06, sx + nx * 0.033, y0 + 0.265, sz, 0, 0, -0.3 * nx); else B(A.sign, ln / segs - 0.06, 0.007, 0.075, sx, y0 + 0.265, sz + nz * 0.033, 0.3 * nz, 0, 0); tn(null); } } } }
  rc(A, x, z, w, d, top, seed); }
function aptTower(A, x, z, w, d, h, hex) { /* 米石/抹灰高层：四面窗格+通长窗台线+步进顶+桅杆 */
  var y0 = 0.06, top = y0 + h, i, j, k, rows = Math.max(2, Math.round((h - 0.22) / 0.15)), fd = [[0, 1], [-1, 0], [1, 0], [0, -1]];
  PB(hex, w, h, d, x, y0 + h / 2, z);
  for (k = 0; k < 4; k++) { var nx = fd[k][0], nz = fd[k][1], ln = (nx ? d : w) - 0.06, n = Math.max(2, Math.round(ln / 0.11));
    for (i = 0; i < rows; i++) { var wy = y0 + 0.18 + i * 0.14;
      tn('#d8d2c4'); B(A.mull, nx ? 0.014 : ln, 0.008, nx ? ln : 0.014, x + nx * (w / 2 + 0.007), wy - 0.048, z + nz * (d / 2 + 0.007));
      for (j = 0; j < n; j++) { var tt = -ln / 2 + (j + 0.5) * ln / n; B(A.dark, nx ? 0.01 : 0.046, 0.076, nx ? 0.046 : 0.01, nx ? x + nx * (w / 2 + 0.005) : x + tt, wy, nx ? z + tt : z + nz * (d / 2 + 0.005)); }
      tn(null); } }
  PB(hex, w + 0.02, 0.03, d + 0.02, x, top + 0.015, z); PB(hex, w * 0.7, 0.1, d * 0.7, x, top + 0.08, z); PB(hex, w * 0.4, 0.06, d * 0.4, x, top + 0.16, z);
  Y(A.steel, 0.005, 0.005, 0.12, 12, x, top + 0.25, z); }
function tower(A, x, z, w, d, h, crown) { /* 玻璃塔：幕墙贴图+细白层间带+角梃；塔冠三式：0 平顶机房 / 1 格栅冠+桅杆 / 2 圆冠鼓座+穹顶 */
  var y0 = 0.06, top = y0 + h, i, n = Math.round(h / 0.13);
  W(A.glass, w, h, d, x, y0 + h / 2, z, 0.56);
  for (i = 1; i < n; i++) B(A.mull, w + 0.014, 0.008, d + 0.014, x, y0 + i * h / n, z);
  for (i = 0; i < 4; i++) B(A.mull, 0.016, h, 0.016, x + (i % 2 ? 1 : -1) * (w / 2 + 0.004), y0 + h / 2, z + (i < 2 ? 1 : -1) * (d / 2 + 0.004));
  B(A.mull, w + 0.028, 0.026, d + 0.028, x, top + 0.013, z);
  if (crown === 1) { for (i = 0; i < 4; i++) B(A.mull, 0.028, 0.2, 0.028, x + (i % 2 ? 1 : -1) * (w / 2 - 0.028), top + 0.14, z + (i < 2 ? 1 : -1) * (d / 2 - 0.028));
    B(A.mull, w - 0.02, 0.022, 0.028, x, top + 0.25, z + d / 2 - 0.028); B(A.mull, w - 0.02, 0.022, 0.028, x, top + 0.25, z - d / 2 + 0.028);
    B(A.mull, 0.028, 0.022, d - 0.02, x + w / 2 - 0.028, top + 0.25, z); B(A.mull, 0.028, 0.022, d - 0.02, x - w / 2 + 0.028, top + 0.25, z);
    B(A.glass, w - 0.14, 0.17, d - 0.14, x, top + 0.125, z); Y(A.steel, 0.005, 0.005, 0.15, 12, x, top + 0.335, z); return top + 0.41; }
  if (crown === 2) { Y(A.glass, w * 0.38, w * 0.46, 0.1, 16, x, top + 0.075, z); O(A.glass, w * 0.3, x, top + 0.135, z, 0, 0, 0, 1, 0.5, 1); Y(A.steel, 0.004, 0.004, 0.1, 12, x, top + 0.2, z); return top + 0.25; }
  B(A.steel, w * 0.5, 0.05, d * 0.5, x, top + 0.05, z); B(A.mull, w * 0.24, 0.035, d * 0.2, x, top + 0.09, z); return top + 0.11; }
function fascia(A, cx, cz, w, d, y) { B(A.mull, w + 0.03, 0.04, 0.03, cx, y, cz + d / 2); B(A.mull, w + 0.03, 0.04, 0.03, cx, y, cz - d / 2); B(A.mull, 0.03, 0.04, d, cx - w / 2, y, cz); B(A.mull, 0.03, 0.04, d, cx + w / 2, y, cz); }
function rotunda(A, L, pt) { /* 玻璃转角中庭(近角)：弧面幕墙贴图+竖梃+层间环+底层柱廊+环檐+钢冠环(+lv4 穹顶)；lv2/3 弧面海报 */
  var y0 = 0.06, cx = 0.26, cz = -0.09, r = 0.34, H = pt - y0 + 0.2, top = y0 + H, i, a;
  YU(A.glass, r, H, 24, cx, y0 + H / 2, cz, 0.56);
  for (i = 0; i < 16; i++) { a = i * PI / 8; B(A.mull, 0.014, H, 0.014, cx + Math.sin(a) * (r + 0.005), y0 + H / 2, cz + Math.cos(a) * (r + 0.005), 0, a, 0); }
  for (i = 1; i <= 4; i++) Y(A.mull, r + 0.012, r + 0.012, 0.016, 24, cx, y0 + i * H / 5, cz);
  for (i = 0; i < 8; i++) { a = i * PI / 4 + PI / 8; B(A.mull, 0.035, 0.155, 0.035, cx + Math.sin(a) * (r + 0.02), y0 + 0.078, cz + Math.cos(a) * (r + 0.02), 0, a, 0); }
  Y(A.mull, r + 0.07, r + 0.07, 0.018, 24, cx, y0 + 0.175, cz);
  Y(A.steel, r + 0.03, r + 0.03, 0.045, 24, cx, top + 0.022, cz);
  Y(A.mull, r + 0.008, r + 0.008, 0.02, 24, cx, top + 0.055, cz);
  if (L >= 4) O(A.glass, r * 0.5, cx, top + 0.07, cz, 0, 0, 0, 1, 0.45, 1);
  if (L <= 3) YS(A.poster, r + 0.022, 0.46, 12, PI / 4 - 0.42, 0.84, cx, y0 + 0.52, cz); }
function roundBld(A) { /* 1990s 转角圆楼(与中庭同位演进)：抹灰圆墙+弧面窗(避让广告位)+弧形店招/橱窗+巨幅彩绘广告+灰天面女儿墙 */
  var y0 = 0.06, cx = 0.26, cz = -0.09, r = 0.32, h = 0.76, top = y0 + h, i, k, a, a0 = PI / 4, ap = a0 - 0.35;
  YU(A.plaster, r, h, 24, cx, y0 + h / 2, cz, 0.5);
  tn('#7d7a73'); Y(A.plaster, r - 0.015, r - 0.015, 0.012, 24, cx, top - 0.006, cz); tn(null);
  YO(A.plaster, r + 0.012, 0.035, 24, cx, top + 0.0175, cz);
  for (i = 0; i < 3; i++) { var wy = y0 + 0.34 + i * 0.15;
    tn('#ded8ca'); for (k = 0; k < 9; k++) { a = a0 - 1.36 + k * 0.34; if (i > 0 && Math.abs(a - ap) < 0.5) continue;
      B(A.mull, 0.05, 0.008, 0.008, cx + Math.sin(a) * (r + 0.006), wy - 0.048, cz + Math.cos(a) * (r + 0.006), 0, a, 0);
      B(A.dark, 0.05, 0.078, 0.012, cx + Math.sin(a) * (r + 0.006), wy, cz + Math.cos(a) * (r + 0.006), 0, a, 0); }
    tn(null); }
  tn('#3f6f9f'); YS(A.sign, r + 0.012, 0.07, 12, a0 - 1.3, 0.7, cx, y0 + 0.215, cz); YS(A.sign, r + 0.012, 0.07, 12, a0 + 0.55, 0.6, cx, y0 + 0.215, cz); tn(null);
  YS(A.dark, r + 0.008, 0.07, 12, a0 - 0.55, 1.0, cx, y0 + 0.075, cz);
  YS(A.poster, r + 0.022, 0.4, 12, ap - 0.46, 0.92, cx, y0 + 0.52, cz);
  rc(A, cx, cz, r * 1.2, r * 1.2, top + 0.035, 77); }
function podium(A, L, pt, zb, scr) { /* L 形商场主翼：主翼(x −0.9..0.6)+右后翼(lv3+)；深色基座+柱廊橱窗(暖光)+通长雨棚檐+檐口/女儿墙+屋面；上段按年代 */
  var y0 = 0.06, zf = 0.25, i, D = zf - zb, zc = (zf + zb) / 2, wm = L === 4 ? A.wallW : A.wallC, sf = L >= 3 ? A.lamp : A.glass;
  W(wm, 1.5, pt - y0, D, -0.15, (pt + y0) / 2, zc, 0.6);
  if (L >= 3) W(wm, 0.3, pt - y0, -0.45 - zb, 0.75, (pt + y0) / 2, (-0.45 + zb) / 2, 0.6);
  tn('#54565a'); B(A.rough, 1.82, 0.05, D + 0.04, -0.15, y0 + 0.025, zc); tn(null);
  B(sf, 1.42, 0.115, 0.02, -0.19, y0 + 0.1175, zf + 0.008);
  B(sf, 0.02, 0.115, D - 0.18, -0.908, y0 + 0.1175, zc); B(sf, 0.02, 0.115, 0.6, 0.608, y0 + 0.1175, -0.15);
  for (i = 0; i <= 5; i++) B(A.mull, 0.05, 0.16, 0.05, -0.86 + i * 0.29, y0 + 0.08, zf + 0.018);
  for (i = 0; i < 3; i++) { B(A.mull, 0.05, 0.16, 0.05, -0.908, y0 + 0.08, zc - D / 2 + 0.14 + i * (D - 0.28) / 2); B(A.mull, 0.05, 0.16, 0.05, 0.608, y0 + 0.08, -0.38 + i * 0.24); }
  B(A.mull, 1.56, 0.018, 0.1, -0.15, y0 + 0.185, zf + 0.045); B(A.mull, 0.1, 0.018, D, -0.92, y0 + 0.185, zc); B(A.mull, 0.1, 0.018, 0.64, 0.62, y0 + 0.185, -0.15);
  for (i = 0; i < 5; i++) SB(SIGN[(i + L) % 6], 0.16, 0.036, 0.012, -0.78 + i * 0.18, y0 + 0.207, zf + 0.018);
  B(A.mull, 1.54, 0.04, D + 0.04, -0.15, pt + 0.02, zc);
  if (L >= 3) B(A.mull, 0.34, 0.04, -0.45 - zb + 0.04, 0.75, pt + 0.02, (-0.45 + zb) / 2);
  tn('#b3b0a8'); B(A.rough, 1.46, 0.012, D - 0.06, -0.15, pt + 0.046, zc); if (L >= 3) B(A.rough, 0.26, 0.012, -0.48 - zb, 0.75, pt + 0.046, (-0.45 + zb) / 2); tn(null);
  fascia(A, -0.15, zc, 1.5, D, pt + 0.045); if (L >= 3) fascia(A, 0.75, (-0.45 + zb) / 2, 0.3, -0.45 - zb, pt + 0.045);
  var rb = L === 2 ? [-0.5, -0.305, 0.7, 0.45] : [-0.475, (zb - 0.33) / 2, 0.75, -0.35 - zb - 0.02];   /* 后部抬升体量（阶梯屋面）：cx, cz, w, d */
  W(wm, rb[2], 0.14, rb[3], rb[0], pt + 0.07, rb[1], 0.6); W(A.glass, rb[2] + 0.01, 0.05, rb[3] + 0.01, rb[0], pt + 0.1, rb[1], 0.28); B(A.mull, rb[2] + 0.03, 0.025, rb[3] + 0.03, rb[0], pt + 0.152, rb[1]);
  B(A.glass, 0.3, 0.025, 0.12, -0.3, pt + 0.176, rb[1]);
  if (L === 2) { W(A.glass, 1.52, 0.08, D + 0.01, -0.15, pt - 0.06, zc, 0.28); for (i = 0; i < 3; i++) B(A.mull, 1.53, 0.012, D + 0.015, -0.15, y0 + 0.3 + i * 0.14, zc);
    B(A.poster, 0.28, 0.44, 0.02, -0.3, 0.5, zf + 0.012); B(A.poster, 0.24, 0.4, 0.02, -0.72, 0.5, zf + 0.012); B(A.poster, 0.02, 0.44, 0.28, -0.912, 0.5, -0.42); B(A.poster, 0.02, 0.44, 0.28, 0.608, 0.5, -0.42); }
  if (L === 3) { W(A.glass, 0.84, pt - y0 - 0.26, 0.02, -0.48, (pt + y0 + 0.26) / 2, zf + 0.01, 0.28);
    for (i = 0; i < 5; i++) B(A.mull, 0.86, 0.011, 0.03, -0.48, y0 + 0.26 + i * (pt - y0 - 0.3) / 4, zf + 0.018);
    for (i = 0; i < 6; i++) B(A.mull, 0.008, pt - y0 - 0.26, 0.028, -0.86 + i * 0.155, (pt + y0 + 0.26) / 2, zf + 0.018);
    B(A.band, 0.035, 0.58, 0.76, 0.608, 0.5, -0.17); B(scr, 0.05, 0.52, 0.68, 0.615, 0.5, -0.17);
    B(A.poster, 0.24, 0.4, 0.02, -0.13, 0.5, zf + 0.028); }
  if (L === 4) { for (i = 0; i < 6; i++) W(wm, 0.07, pt - y0 - 0.24, 0.05, -0.83 + i * 0.145, (pt + y0 + 0.24) / 2, zf + 0.02, 0.5);
    W(A.glass, 0.84, pt - y0 - 0.26, 0.015, -0.48, (pt + y0 + 0.26) / 2, zf + 0.005, 0.28);
    for (i = 0; i < 3; i++) B(A.mull, 0.84, 0.02, 0.04, -0.48, y0 + 0.32 + i * 0.19, zf + 0.02);
    W(A.glass, 0.015, pt - y0 - 0.26, 0.36, 0.605, (pt + y0 + 0.26) / 2, -0.3, 0.28);
    for (i = 0; i < 4; i++) W(wm, 0.05, pt - y0 - 0.24, 0.07, 0.62, (pt + y0 + 0.24) / 2, -0.46 + i * 0.11, 0.5);
    B(A.band, 0.7, 0.52, 0.05, -0.45, 0.55, zf + 0.035); B(scr, 0.63, 0.45, 0.055, -0.45, 0.55, zf + 0.038);
    B(A.band, 0.03, 0.52, 0.72, -0.915, 0.55, -0.3); B(scr, 0.04, 0.45, 0.64, -0.922, 0.55, -0.3);
    B(A.poster, 0.02, 0.36, 0.24, 0.912, 0.55, -0.66); } }
function roofGarden(A, L, pt) { /* 屋顶：抬升体量顶部机房+水箱；lv2 前屋面天窗带×2；lv3+ 草坪块+修剪球篱+玻璃栏杆；lv4 右翼草坪+格栅架花园 */
  var i, ry = pt + 0.164, rz = L === 2 ? -0.45 : L === 3 ? -0.66 : -0.7, mx = L === 2 ? -0.7 : -0.15, tx = L === 2 ? -0.3 : -0.45;
  tn('#b8b4ac'); B(A.rough, 0.14, 0.055, 0.1, mx, ry + 0.028, rz); tn(null); Y(A.mull, 0.03, 0.03, 0.06, 12, tx, ry + 0.03, rz);
  if (L === 2) { B(A.glass, 0.62, 0.025, 0.12, -0.45, pt + 0.055, 0.1); B(A.glass, 0.5, 0.025, 0.12, -0.5, pt + 0.055, -0.0); return; }
  W(A.lawn, 0.68, 0.014, 0.2, -0.47, pt + 0.062, 0.1, 0.4); W(A.lawn, 0.68, 0.014, 0.18, -0.47, pt + 0.062, -0.14, 0.4);
  for (i = 0; i < 5; i++) O(A.leaf, 0.032, -0.75 + i * 0.15, pt + 0.098, 0.02, 0, 0, 0, 1, 0.7, 1);
  for (i = 0; i < 4; i++) O(A.leaf, 0.028, -0.48 + i * 0.12, pt + 0.096, -0.26, 0, 0, 0, 1, 0.7, 1);
  B(A.glass, 1.4, 0.05, 0.012, -0.18, pt + 0.09, 0.235);
  for (i = 0; i < 8; i++) B(A.steel, 0.01, 0.05, 0.01, -0.84 + i * 0.19, pt + 0.075, 0.235);
  if (L >= 4) { W(A.lawn, 0.24, 0.014, 0.34, 0.75, pt + 0.062, -0.68, 0.4); W(A.lawn, 0.3, 0.014, 0.16, -0.3, ry + 0.007, -0.45, 0.4);
    B(A.steel, 0.014, 0.09, 0.014, -0.44, ry + 0.045, -0.52); B(A.steel, 0.014, 0.09, 0.014, -0.16, ry + 0.045, -0.52); B(A.steel, 0.014, 0.09, 0.014, -0.44, ry + 0.045, -0.38); B(A.steel, 0.014, 0.09, 0.014, -0.16, ry + 0.045, -0.38);
    B(A.mull, 0.32, 0.012, 0.03, -0.3, ry + 0.095, -0.52); B(A.mull, 0.32, 0.012, 0.03, -0.3, ry + 0.095, -0.38);
    for (i = 0; i < 5; i++) B(A.mull, 0.03, 0.01, 0.18, -0.42 + i * 0.06, ry + 0.107, -0.45); } }
function fountain(A, L) { /* 喷泉：石砌三层盘 + 双水面 + 主涌泉/环状斜喷(lv3+)；lv1 缩小 */
  var i, fx = 0.5, fz = 0.64, y0 = 0.06, s = L === 1 ? 0.6 : 1;
  tn('#a9a396'); Y(A.rough, 0.3 * s, 0.32 * s, 0.075 * s, 24, fx, y0 + 0.038 * s, fz); Y(A.rough, 0.028 * s, 0.036 * s, 0.17 * s, 12, fx, y0 + 0.21 * s, fz);
  if (L >= 2) { Y(A.rough, 0.11, 0.13, 0.05, 16, fx, y0 + 0.1, fz); Y(A.rough, 0.09, 0.1, 0.022, 16, fx, y0 + 0.305, fz); } tn(null);
  if (L >= 2) Y(A.waterF, 0.075, 0.075, 0.014, 16, fx, y0 + 0.322, fz);
  Y(A.waterF, 0.285 * s, 0.285 * s, 0.018, 24, fx, y0 + 0.085 * s, fz);
  if (L >= 3) { Y(A.waterF, 0.004, 0.012, 0.16, 12, fx, y0 + 0.41, fz);
    for (i = 0; i < 6; i++) { var a = i * PI / 3; Y(A.waterF, 0.003, 0.008, 0.11, 12, fx + Math.sin(a) * 0.17, y0 + 0.09, fz + Math.cos(a) * 0.17, Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5); } } }
function plaza(A, L) { /* 近角广场：环形铺装(lv2+)/放射线(lv4)/喷泉+坐凳+花箱/花坛草坪(lv3+)/旗幅杆(lv3+)/lv1 亭子+杆旗+花坛 */
  var i, fx = 0.5, fz = 0.64;
  if (L >= 2) { tn('#98948a'); Y(A.pav, 0.37, 0.37, 0.006, 28, fx, 0.062, fz); tn('#d6d2c6'); Y(A.pav, 0.33, 0.33, 0.007, 28, fx, 0.0665, fz); if (L >= 3) { tn('#98948a'); Y(A.pav, 0.29, 0.29, 0.008, 28, fx, 0.07, fz); } tn(null);
    if (L >= 4) for (i = 0; i < 12; i++) { var sa = i * PI / 6; RB('#dedad0', 0.09, 0.003, 0.012, fx + Math.sin(sa) * 0.335, 0.0745, fz + Math.cos(sa) * 0.335, 0, sa, 0); } }
  fountain(A, L);
  if (L >= 2) { for (i = 0; i < 3; i++) { var bx = [-0.1, 0.02, 0.14][i], bz = [0.28, 0.96, 0.64][i]; RB('#7a5a3c', 0.14, 0.012, 0.05, bx, 0.075, bz); RB('#3c3c3c', 0.12, 0.014, 0.012, bx, 0.062, bz); }
    for (i = 0; i < 2; i++) { var qx = [-0.12, 0.88][i]; tn('#b5aa98'); Y(A.rough, 0.05, 0.06, 0.05, 12, qx, 0.085, 0.62); tn('#4f7a34'); O(A.leaf, 0.048, qx, 0.15, 0.62); tn(null); }
    if (L >= 3) { W(A.lawn, 0.3, 0.012, 0.15, -0.28, 0.066, 0.42, 0.4); W(A.lawn, 0.3, 0.012, 0.15, -0.28, 0.066, 0.9, 0.4); W(A.lawn, 0.16, 0.012, 0.3, 0.88, 0.066, 0.42, 0.4); W(A.lawn, 0.16, 0.012, 0.3, 0.88, 0.066, 0.9, 0.4);
      for (i = 0; i < 3; i++) { var qz = -0.02 + i * 0.16; Y(A.steel, 0.005, 0.005, 0.36, 12, qz, 0.24, 0.36); SB(SIGN[(i * 2 + 1) % 6], 0.05, 0.14, 0.006, qz + 0.028, 0.34, 0.36); } } }
  if (L === 1) { PB('#c8bfae', 0.16, 0.13, 0.12, -0.15, 0.125, 0.7); SB('#b83a2a', 0.18, 0.008, 0.14, -0.15, 0.195, 0.7);
    PB('#c8bfae', 0.14, 0.11, 0.12, 0.16, 0.115, 0.86); SB('#2c58a0', 0.16, 0.008, 0.14, 0.16, 0.175, 0.86);
    Y(A.steel, 0.005, 0.005, 0.4, 12, 0.32, 0.26, 0.58); SB('#b83a2a', 0.07, 0.045, 0.004, 0.36, 0.43, 0.58);
    for (i = 0; i < 2; i++) { var px = [-0.55, 0.05][i]; tn('#b5aa98'); Y(A.rough, 0.05, 0.06, 0.05, 12, px, 0.085, 0.5); tn('#4f7a34'); O(A.leaf, 0.045, px, 0.15, 0.5); tn(null); } } }
function panda(A, pt) { /* IFS 爬墙熊猫：攀附 +x 削角立面近角，头过檐口；白身/头 + 黑肩背带/耳/眼斑/鼻/四肢 */
  var x = 0.72, y = 0.95, z = 0.05;
  OS(A.pandaW, 0.15, x, y, z, 0.15, 0, 0, 0.8, 1.2, 0.85);
  OS(A.pandaB, 0.152, x, y + 0.075, z, 0.15, 0, 0, 0.8, 0.32, 0.86);
  OS(A.pandaW, 0.105, x + 0.04, y + 0.175, z + 0.01);
  OS(A.pandaB, 0.046, x + 0.0, y + 0.27, z - 0.065); OS(A.pandaB, 0.046, x + 0.0, y + 0.27, z + 0.085);
  OS(A.pandaB, 0.036, x + 0.125, y + 0.185, z - 0.038, 0, 0, 0, 0.85, 1.15, 0.5); OS(A.pandaB, 0.036, x + 0.125, y + 0.185, z + 0.058, 0, 0, 0, 0.85, 1.15, 0.5);
  OS(A.pandaB, 0.017, x + 0.14, y + 0.14, z + 0.01);
  Y(A.pandaB, 0.038, 0.044, 0.26, 12, x - 0.05, y + 0.12, z - 0.06, 0, 0, 0.55);
  Y(A.pandaB, 0.038, 0.044, 0.26, 12, x - 0.05, y + 0.12, z + 0.1, 0, 0, 0.55);
  Y(A.pandaB, 0.042, 0.046, 0.24, 12, x - 0.05, y - 0.14, z - 0.05, 0, 0, 0.5);
  Y(A.pandaB, 0.042, 0.046, 0.24, 12, x - 0.05, y - 0.14, z + 0.07, 0, 0, 0.5); }
function ground(A, L) { /* 地面：花岗石基面 + 四侧深色人行道铺装带 + 四向沥青环路 + 路缘石 + 车道中线 + 斑马线 */
  var i;
  W(A.pav, 2.04, 0.06, 2.04, 0, 0.03, 0, 0.5);
  tn('#a39f95'); W(A.pav, 2.04, 0.004, 0.12, 0, 0.062, 0.96, 0.5); W(A.pav, 2.04, 0.004, 0.12, 0, 0.062, -0.96, 0.5); W(A.pav, 0.12, 0.004, 1.8, -0.96, 0.062, 0, 0.5); W(A.pav, 0.12, 0.004, 1.8, 0.96, 0.062, 0, 0.5); tn(null);
  B(A.asph, 2.6, 0.05, 0.28, 0, 0.025, 1.16); B(A.asph, 2.6, 0.05, 0.28, 0, 0.025, -1.16);
  B(A.asph, 0.28, 0.05, 2.04, -1.16, 0.025, 0); B(A.asph, 0.28, 0.05, 2.04, 1.16, 0.025, 0);
  tn('#c9c5ba'); B(A.rough, 2.04, 0.07, 0.02, 0, 0.035, 1.03); B(A.rough, 2.04, 0.07, 0.02, 0, 0.035, -1.03); B(A.rough, 0.02, 0.07, 2.08, -1.03, 0.035, 0); B(A.rough, 0.02, 0.07, 2.08, 1.03, 0.035, 0);
  tn('#e6e6df');
  for (i = 0; i < 4; i++) { var p = -0.5 + i * 0.33; B(A.rough, 0.14, 0.003, 0.016, p, 0.052, 1.16); B(A.rough, 0.14, 0.003, 0.016, p, 0.052, -1.16); B(A.rough, 0.016, 0.003, 0.14, -1.16, 0.052, p); B(A.rough, 0.016, 0.003, 0.14, 1.16, 0.052, p); }
  tn(null);
  zebra(A, -0.8, 1.16, 1); zebra(A, 0.8, 1.16, 1); zebra(A, 1.16, -0.8, 0); zebra(A, 1.16, 0.8, 0);
  if (L >= 2) { zebra(A, 0, 1.16, 1); zebra(A, -0.8, -1.16, 1); zebra(A, 0.8, -1.16, 1); zebra(A, -1.16, -0.8, 0); zebra(A, -1.16, 0.8, 0); } }
function streets(A, L) { /* 四向行道树(层叠树冠，逐年代加密) + 路灯(单头→双头暖光) */
  var i, tr = [0.068, 0.074, 0.08, 0.084][L - 1], F = L >= 3;
  var fx = L === 1 ? [-0.7, -0.25, 0.3, 0.75] : [-0.75, -0.5, -0.25, 0.25, 0.5, 0.75];
  for (i = 0; i < fx.length; i++) tree(A, fx[i], 0.94, tr, F);
  var sz = L === 1 ? [-0.7, -0.2, 0.3] : L === 2 ? [-0.85, -0.51, -0.17, 0.17, 0.51, 0.85] : [-0.85, -0.57, -0.29, 0, 0.29, 0.57, 0.85];
  for (i = 0; i < sz.length; i++) { tree(A, -0.94, sz[i], tr, F); if (L >= 2 || i % 2) tree(A, 0.94, sz[i], tr, F); }
  var bx = L === 1 ? [-0.7, -0.2, 0.3] : [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];
  for (i = 0; i < bx.length; i++) tree(A, bx[i], -0.94, tr, F);
  var fl = L === 1 ? [-0.5, 0.1] : [-0.62, -0.12, 0.38, 0.88];
  for (i = 0; i < fl.length; i++) lamp(A, fl[i], 0.99, L, 0, 1);
  if (L >= 2) { var s2 = [-0.5, 0.4];
    for (i = 0; i < s2.length; i++) { lamp(A, -0.99, s2[i], L, 1, 0); lamp(A, 0.99, s2[i], L, -1, 0); }
    lamp(A, -0.4, -0.99, L, 0, -1); lamp(A, 0.4, -0.99, L, 0, -1); }
  if (L >= 3) { lamp(A, 0.12, 0.5, L, 0, -1); lamp(A, 0.88, 0.5, L, 0, -1); } }
function courtyard(A) { /* lv1 内院：矮棚屋双坡顶 + 杂物 + 院树 */
  PB('#bfb8a8', 0.44, 0.2, 0.22, -0.18, 0.16, -0.35); PB('#7d7a73', 0.42, 0.012, 0.2, -0.18, 0.266, -0.35);
  PB('#d8d2c4', 0.46, 0.006, 0.1, -0.18, 0.276, -0.31, 0.35, 0, 0); PB('#d8d2c4', 0.46, 0.006, 0.1, -0.18, 0.276, -0.39, -0.35, 0, 0);
  rc(A, -0.18, -0.35, 0.3, 0.16, 0.272, 91);
  PB('#c4bca8', 0.2, 0.16, 0.16, 0.28, 0.14, -0.49); PB('#7d7a73', 0.18, 0.012, 0.14, 0.28, 0.246, -0.49);
  tree(A, -0.42, -0.3, 0.06, false); tree(A, 0.08, -0.44, 0.055, false); }
/* ================= 四阶（1990s → 2020s） ================= */
var A0;
function block19(L) {
  var g = new THREE.Group(); g.name = 'prop_19_lv' + L;
  g.userData = { kind: 'property', propIdx: 19, level: L, anim: [] };
  BK = {}; TINT = null;
  var pt = [0, 0.78, 0.86, 0.92][L - 1], zb = [0, -0.55, -0.75, -0.92][L - 1], i;
  var A = A0 = { /* 色板取自参考图；分区 roughness：玻璃.18/钢.35/白石.7/米石.78/水.12/路.95 */
    asph: M('#3b3e43', { rg: 0.95 }), pav: M('#b7b3a9', { map: texPave(), rg: 0.95 }),
    rough: M('#9e988a', { rg: 0.9, vc: 1 }), leaf: M('#4f7a34', { rg: 0.95, vc: 1 }),
    mull: M('#d8d8d2', { rg: 0.5 }), dark: M('#30393d', { rg: 0.5, mt: 0.2 }), steel: M('#8a9599', { rg: 0.35, mt: 0.7 }),
    band: M('#3e474c', { rg: 0.4, mt: 0.4 }), glass: M('#7ea3b4', { map: texCurtain(), rg: 0.18, mt: 0.45 }),
    waterF: M('#7fb0ab', { rg: 0.12, mt: 0.55 }), lawn: M('#6f8f3e', { map: texLawn(), rg: 0.95 }),
    plaster: M('#c9b79b', { map: texPlaster(), rg: 0.9 }), sign: M('#b83a2a', { rg: 0.62, vc: 1 }),
    poster: M('#a8708e', { map: texPoster(1), rg: 0.55 }), poster0: M('#5b7fc0', { map: texPoster(0), rg: 0.6 }),
    wallC: M('#d2c3a8', { map: texPanel('bg', '#d2c3a8', 32, 32, 'rgba(80,70,54,0.7)'), rg: 0.78 }),
    wallW: M('#e4e2dc', { map: texPanel('wh', '#e4e2dc', 32, 32, 'rgba(120,118,112,0.45)'), rg: 0.7 }),
    pandaW: M('#f4f4f0', { rg: 0.45 }), pandaB: M('#17171b', { rg: 0.5 }) };
  if (L === 1) A.poster = A.poster0;
  var scr = L >= 3 ? MF(L >= 4 ? '#1a1220' : '#141426', { rg: 0.32, em: L >= 4 ? '#ff4fae' : '#8a7ff0', ei: L >= 4 ? 0.85 : 0.7, emap: texLED() }) : null;
  var stx = L >= 3 ? signTex('春熙路', '#232a31', '#ffd98c') : null;
  var signM = stx ? MF('#f2ead8', { rg: 0.5, map: stx, emap: stx, em: '#ffcf8e', ei: 0.5 }) : null;
  var lampM = L >= 3 ? MF('#e8d4a8', { rg: 0.35, mt: 0.15, em: '#ffd9a0', ei: 0.5 }) : null;
  A.lamp = lampM;
  ground(A, L); plaza(A, L);
  if (L === 1) {
    ob(A, -0.7, 0.03, 0.4, 0.44, 0.66, '#c9b79b', 3, 11);
    ob(A, -0.27, 0.03, 0.42, 0.44, 0.52, '#b9b3a8', 1, 12);
    ob(A, 0.74, 0.03, 0.32, 0.44, 0.66, '#c4ad8e', 5, 13);
    ob(A, -0.7, -0.38, 0.4, 0.36, 0.52, '#cfc3ad', 2, 14);
    ob(A, -0.7, -0.755, 0.4, 0.33, 0.66, '#c6ada0', 10, 15);
    ob(A, -0.22, -0.75, 0.44, 0.34, 0.52, '#c9b79b', 8, 16);
    ob(A, 0.22, -0.75, 0.42, 0.34, 0.66, '#bdb6a6', 8, 17);
    ob(A, 0.7, -0.335, 0.4, 0.29, 0.52, '#c0b39e', 4, 18);
    aptTower(A, 0.68, -0.7, 0.44, 0.4, 1.12, '#c8b892');
    roundBld(A); courtyard(A);
    B(A.band, 0.3, 0.09, 0.03, 0.68, 0.105, -0.49); B(A.glass, 0.26, 0.07, 0.02, 0.68, 0.095, -0.475);
  } else {
    podium(A, L, pt, zb, scr); rotunda(A, L, pt);
    B(A.glass, 0.7, 0.02, 0.32, -0.45, 0.38, 0.42); B(A.steel, 0.74, 0.014, 0.36, -0.45, 0.392, 0.42);
    B(A.steel, 0.016, 0.34, 0.016, -0.76, 0.23, 0.56); B(A.steel, 0.016, 0.34, 0.016, -0.14, 0.23, 0.56);
    if (signM) { B(signM, 0.4, 0.1, 0.03, -0.08, 0.34, 0.27); }
    roofGarden(A, L, pt);
    if (L === 2) { ob(A, -0.7, -0.74, 0.36, 0.3, 0.5, '#c6ada0', 10, 21, 8);
      ob(A, 0.16, -0.75, 0.36, 0.26, 0.44, '#c9b79b', 10, 22, 8);
      aptTower(A, -0.24, -0.73, 0.4, 0.3, 1.26, '#c8b58f');
      tower(A, 0.68, -0.74, 0.42, 0.34, 1.66, 2); }
    if (L === 3) { aptTower(A, -0.68, -0.4, 0.3, 0.36, 1.0, '#cfc5b0'); aptTower(A, 0.74, -0.58, 0.3, 0.32, 0.96, '#d6cbb4');
      tower(A, 0.18, -0.55, 0.44, 0.4, 2.02, 1); tower(A, -0.55, -0.86, 0.36, 0.26, 1.5, 0); tower(A, 0.66, -0.86, 0.34, 0.24, 1.35, 0); }
    if (L >= 4) { tower(A, 0.18, -0.55, 0.48, 0.44, 2.42, 1); tower(A, -0.68, -0.76, 0.38, 0.32, 2.05, 0);
      tower(A, 0.72, -0.8, 0.36, 0.28, 2.25, 2); tower(A, -0.68, -0.3, 0.3, 0.36, 1.75, 0);
      tower(A, 0.76, -0.28, 0.26, 0.3, 1.55, 0); tower(A, -0.2, -0.84, 0.34, 0.16, 1.4, 0); tower(A, 0.45, -0.86, 0.26, 0.14, 1.2, 0);
      panda(A, pt); }
  }
  streets(A, L);
  if (L >= 2) { var pz = [[-0.65, 0.45], [-0.85, 0.45], [-0.3, 0.5], [0.88, 0.08], [0.88, -0.25]];
    for (i = 0; i < pz.length; i++) tree(A, pz[i][0], pz[i][1], [0, 0.066, 0.07, 0.075][L - 1], L >= 3); }
  if (L >= 4) { var rt = [[-0.72, 0.1], [-0.5, 0.1], [-0.28, 0.1], [-0.3, -0.2], [-0.2, -0.56, 1]];
    for (i = 0; i < rt.length; i++) tree(A, rt[i][0], rt[i][1], 0.042, true, rt[i][2] ? pt + 0.164 : pt + 0.068); }
  if (L === 3) { var r3 = [-0.72, -0.5, -0.28];
    for (i = 0; i < r3.length; i++) tree(A, r3[i], 0.1, 0.045, true, pt + 0.068); }
  flush(g);
  var e0 = L >= 4 ? 0.85 : 0.7;
  g.userData.anim.push(function (t) { if (scr) scr.emissiveIntensity = e0 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.4)); });
  if (L >= 3) g.userData.anim.push(function (t) { var s = 0.5 + 0.5 * Math.sin(t * 1.1); if (signM) signM.emissiveIntensity = 0.4 + 0.18 * s; if (lampM) lampM.emissiveIntensity = 0.45 + 0.12 * s; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[19] = function (level) { return block19(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
