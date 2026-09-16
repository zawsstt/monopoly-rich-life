/* 大富翁·现代写实棋盘（杭）格 24「断桥烟雨」—— 西湖断桥：双拱长石桥 / 双檐岛亭(匾额/灯笼) / 前岸水榭大厅+抱厦+木栈道 / 石驳岸柳岸 / 湖面画舫，四年代演进
 * 契约：window.Props3DModern[24](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6（实测 2.55×2.32）；底面 y=0；正面 +Z（湖面在前、
 *   柳岸步道在左前、断桥斜跨至右后岛、双檐亭居右后岛上、水榭大厅 lv3+ 踞左前岸线）；每级 mesh ≤55（手写按材质合并，lv1..lv4=14/18/21/24）；
 *   三角 lv1..lv4≈7.4k/12.5k/16.1k/18.4k；高度 0.961/1.035/1.099/1.173（smoke_modern_st BANDS 内）；Canvas ≤128px；零 Math.random（LCG 种子噪点）；
 *   动画 ≤2 项（灯呼吸+水纹漂移 / lv4 灯笼+匾额）。
 * 视觉基准 refs/modern/prop_24.png（写实航拍 3/4 视角，四象限 = 同一块地 1990s→2020s）。
 * v3 R1（结构）：桥拱洞 0.12→大拱+涵洞双洞（洞下透水）；桥面拱起；桥栏重做（地袱/望柱×26/寻仗随坡/端部抱鼓石）；岛亭重建（石台基+踏步+红柱
 *   +美人靠+Lathe 双檐攒尖+宝顶+lv3+「断桥」匾额）；水榭重建为矩形大厅（水上石台木桩+6 红柱+暖光窗带+双坡瓦顶 正脊/脊吻/封檐/翘角）；
 *   垂柳改垂枝形；石砌驳岸 7 段随岸线+压顶+lv2+ 望柱扶手；桥头石平台踏步；画舫重建（船身/船楼/两坡瓦篷/桅灯）；lv1 木板道→lv2+ 方砖广场；
 *   占地收进 ±1.27（修基线 2.61 超限）。
 * v3 R2（体量/材质）：岛亭平面 fs 与竖向 s 解耦内收（台基不再悬水）、鼓身缩小；树冠主球 16×12 + 树径加大；水色去饱和取参考雾绿；
 *   Lathe 瓦面 uv u×4 显瓦垄；石灯 lv3+；岸边入水石阶 lv2+；岛树补株。
 * v3 R3（对照放大图逐项清偿）：攒尖剖面改为「顶陡檐缓 + 檐口反翘」CONE()，四条垂脊 HIP() 折线贴合曲面、末段上翘即翘角（替代悬空钩）；
 *   桥加长至 1.64、拱顶 0.25、栏板压低变细（望柱 0.022×0.075）、踏级横缝阴影线×25、双头桥灯；亭台基白石栏 lv3+；
 *   水榭增东侧抱厦小亭（伸入水面）+ 临水木栈道（木桩+白石栏）；树冠多瓣化（lv2+ 副冠）+ 橄榄绿调；删深水椭圆（侧壁成环线）；小船移栈道旁停泊；
 *   条石/青瓦增 roughnessMap（线性 128px：缝 255 最糙、面 175-232 微光）+ 瓦垄明暗对比加大。
 * 年代特征（四象限）：lv1 1990s 浑浊灰绿水+素石桥栏+素面小亭+木码头+树稀疏+木板道+无船；lv2 2000s 水稍清+双头桥灯+亭加美人靠+石板广场
 *   +树变密+岸栏+小木船；lv3 2010s 前岸水榭大厅+抱厦+栈道（暖光窗）+双头园灯+景石石凳+驳岸成+石灯+台基白栏+两艘游船+匾额；
 *   lv4 2020s 水最清+樱花点缀+带篷画舫+亭/水榭挂灯笼夜灯+花坛+树冠最茂+匾额夜光 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_24] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
var _mc = {};
function M(h, o) {
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + o.em + '|' + o.ei + '|' + (o.map ? o.map.uuid : '') + '|' + (o.rm ? o.rm.uuid : '') + '|' + (o.op || '');
  if (_mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) m.map = o.map; if (o.rm) m.roughnessMap = o.rm; if (o.op) { m.transparent = true; m.opacity = o.op; }
  m.userData.previewColor = h; return (_mc[k] = m);
}
function MF(h, o) { o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, flatShading: true }); if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; } if (o.map) m.map = o.map; m.userData.previewColor = h; return m; } /* 发光/动画件：每实例新建 */
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c, lin) { var t = new THREE.CanvasTexture(c); t.encoding = lin ? THREE.LinearEncoding : THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function gy(v) { v = Math.max(0, Math.min(255, v | 0)); return 'rgb(' + v + ',' + v + ',' + v + ')'; }
var _t = {};
function texStoneR() { /* 条石粗糙度图（线性）：缝 255 最糙、石面 190-232 微光、风化斑 */
  if (_t.sr) return _t.sr; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2413), x, y, i;
  g.fillStyle = gy(255); g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = (y / 16) % 2 ? 0 : 20; x < S + 40; x += 40) { g.fillStyle = gy(190 + R() * 42); g.fillRect(x - 38, y + 2, 36, 12); }
  for (i = 0; i < 40; i++) { g.fillStyle = gy(R() > 0.5 ? 170 : 245); g.fillRect(R() * S, R() * S, 3 + R() * 8, 2 + R() * 3); }
  return (_t.sr = TX(c, true)); }
function texTileR() { /* 青瓦粗糙度图（线性）：垄脊 175 亮滑 → 垄沟 250 糙、行口缝 255 */
  if (_t.tr) return _t.tr; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2411), x, y, i;
  g.fillStyle = gy(250); g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 12) { g.fillStyle = gy(175 + R() * 20); g.fillRect(x, 0, 5, S); g.fillStyle = gy(215); g.fillRect(x + 5, 0, 3, S); }
  for (y = 6; y < S; y += 18) { g.fillStyle = gy(255); g.fillRect(0, y, S, 3); }
  for (i = 0; i < 30; i++) { g.fillStyle = gy(R() > 0.5 ? 160 : 255); g.fillRect(R() * S, R() * S, 2 + R() * 5, 2 + R() * 4); }
  return (_t.tr = TX(c, true)); }
function texStone() { /* 条石：错缝双线（落影+倒角高光）+ 块内明度扰动 + 风化斑 */
  if (_t.s) return _t.s; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2403), x, y, i;
  g.fillStyle = '#e6e1d5'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 40) { g.fillStyle = 'rgba(255,255,255,' + (0.04 + R() * 0.08).toFixed(3) + ')'; g.fillRect(x + 2, y + 2, 38, 14); }
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(58,56,50,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(0, y + 2, S, 1);
    for (x = (y / 16) % 2 ? 0 : 20; x < S; x += 40) { g.fillStyle = 'rgba(58,56,50,0.5)'; g.fillRect(x, y, 2, 16); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(x + 2, y, 1, 16); } }
  for (i = 0; i < 54; i++) { g.fillStyle = R() > 0.5 ? 'rgba(88,84,76,0.16)' : 'rgba(255,254,248,0.24)'; g.fillRect(R() * S, R() * S, 3 + R() * 8, 2 + R() * 3); }
  return (_t.s = TX(c)); }
function texBrick2() { /* 方砖广场：网格缝落影 + 砖面明度扰动 + 砖口高光 */
  if (_t.b) return _t.b; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2406), x, y;
  g.fillStyle = '#e4dfd4'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 16) { g.fillStyle = 'rgba(255,255,255,' + (0.02 + R() * 0.1).toFixed(3) + ')'; g.fillRect(x + 2, y + 2, 13, 13); g.fillStyle = 'rgba(255,255,255,0.3)'; g.fillRect(x + 2, y + 2, 13, 1); }
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(64,60,54,0.45)'; g.fillRect(0, y, S, 2); g.fillRect(y, 0, 2, S); }
  return (_t.b = TX(c)); }
function texTile() { /* 小青瓦（高对比）：垄脊高光→垄沟落影渐变 + 瓦口压接缝 + 噪点 + 风化白斑/苔斑 */
  if (_t.t) return _t.t; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2401), x, y, i;
  g.fillStyle = '#dfe2e7'; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 12) { var gr = g.createLinearGradient(x, 0, x + 12, 0); gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(0.42, 'rgba(255,255,255,0.08)'); gr.addColorStop(0.6, 'rgba(10,12,16,0.66)'); gr.addColorStop(1, 'rgba(10,12,16,0.36)'); g.fillStyle = gr; g.fillRect(x, 0, 12, S); g.fillStyle = 'rgba(255,255,255,0.42)'; g.fillRect(x, 0, 1, S); }
  for (y = 6; y < S; y += 18) { g.fillStyle = 'rgba(8,10,14,0.62)'; g.fillRect(0, y, S, 3); g.fillStyle = 'rgba(255,255,255,0.34)'; g.fillRect(0, y + 3, S, 1); }
  for (i = 0; i < 46; i++) { g.fillStyle = R() > 0.5 ? 'rgba(12,14,18,0.3)' : 'rgba(235,238,242,0.3)'; g.fillRect(R() * S, R() * S, 2, 2); }
  for (i = 0; i < 12; i++) { g.fillStyle = R() > 0.55 ? 'rgba(230,236,242,0.2)' : 'rgba(52,72,44,0.16)'; g.beginPath(); g.arc(R() * S, R() * S, 3 + R() * 7, 0, PI * 2); g.fill(); }
  return (_t.t = TX(c)); }
function texFuzz() { /* 草地：深浅草斑 + 草丝短线 + 踩踏土斑 + 高光点 */
  if (_t.f) return _t.f; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2404), i;
  g.fillStyle = '#dfe4d6'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 90; i++) { g.fillStyle = R() > 0.5 ? 'rgba(70,84,52,0.2)' : 'rgba(240,244,224,0.16)'; g.beginPath(); g.arc(R() * S, R() * S, 3 + R() * 9, 0, PI * 2); g.fill(); }
  for (i = 0; i < 160; i++) { g.fillStyle = 'rgba(60,76,44,0.22)'; g.fillRect(R() * S, R() * S, 1, 2 + R() * 3); }
  for (i = 0; i < 8; i++) { g.fillStyle = 'rgba(150,132,104,0.16)'; g.beginPath(); g.arc(R() * S, R() * S, 5 + R() * 9, 0, PI * 2); g.fill(); }
  for (i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,240,0.28)'; g.fillRect(R() * S, R() * S, 1.5, 1.5); }
  return (_t.f = TX(c)); }
function texWater(fresh) { /* 湖面烟雨：长波亮纹 + 细碎暗波 + 雾气白斑 + 闪点；fresh=每实例新建（供 offset 漂移） */
  if (!fresh && _t.a) return _t.a; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2405), i;
  g.fillStyle = '#e0e8e8'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 44; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.12 + R() * 0.16).toFixed(3) + ')'; g.fillRect(R() * S, R() * S, 14 + R() * 36, 1.6); }
  for (i = 0; i < 56; i++) { g.fillStyle = 'rgba(46,66,66,0.12)'; g.fillRect(R() * S, R() * S, 6 + R() * 16, 1.2); }
  for (i = 0; i < 7; i++) { g.fillStyle = 'rgba(255,255,255,0.1)'; g.beginPath(); g.arc(R() * S, R() * S, 10 + R() * 18, 0, PI * 2); g.fill(); }
  for (i = 0; i < 22; i++) { g.fillStyle = 'rgba(255,255,255,0.36)'; g.fillRect(R() * S, R() * S, 1.6, 1.6); }
  var t = TX(c); if (!fresh) _t.a = t; return t; }
function texWood() { /* 木板：分缝（落影+板口高光）+ 木纹丝 + 节疤 */
  if (_t.o) return _t.o; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2407), y, i, yy;
  g.fillStyle = '#d8c9b4'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(56,40,24,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,244,224,0.3)'; g.fillRect(0, y + 2, S, 1);
    for (i = 0; i < 7; i++) { yy = y + 4 + R() * 10; g.strokeStyle = 'rgba(96,72,44,' + (0.1 + R() * 0.14).toFixed(3) + ')'; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(40, yy + (R() - 0.5) * 4, 88, yy + (R() - 0.5) * 4, S, yy + (R() - 0.5) * 2); g.stroke(); } }
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(74,52,30,0.4)'; g.fillRect(R() * S, R() * S, 4, 2); }
  return (_t.o = TX(c)); }
function signTex(txt, bg, fg) { /* 匾额面（128×48，按文本缓存） */
  var k = 's' + txt + bg + fg; if (_t[k]) return _t[k]; var c = cv(128, 48), g = c.getContext('2d');
  g.fillStyle = bg; g.fillRect(0, 0, 128, 48); g.strokeStyle = fg; g.lineWidth = 3; g.strokeRect(3, 3, 122, 42);
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 28px "Microsoft YaHei",sans-serif'; g.fillText(txt, 64, 26); return (_t[k] = TX(c)); }
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；UV 按世界尺寸烘焙 ---- */
var BK;
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz, ord) { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0, ord || 'XYZ')), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function boxUV(g, s) { /* 面法线选投影平面，UV=局部坐标/米 → 每 s 米一重复 */
  var p = g.attributes.position, n = g.attributes.normal, a = new Float32Array(p.count * 2), i;
  for (i = 0; i < p.count; i++) { var nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
    if (nx >= ny && nx >= nz) { a[i * 2] = p.getZ(i) / s; a[i * 2 + 1] = p.getY(i) / s; }
    else if (ny >= nz) { a[i * 2] = p.getX(i) / s; a[i * 2 + 1] = p.getZ(i) / s; }
    else { a[i * 2] = p.getX(i) / s; a[i * 2 + 1] = p.getY(i) / s; } }
  g.setAttribute('uv', new THREE.BufferAttribute(a, 2)); return g;
}
function uvD(g, s) { var a = g.attributes.uv, i; if (a) for (i = 0; i < a.count; i++) a.setXY(i, a.getX(i) / s, a.getY(i) / s); return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(boxUV(new THREE.BoxGeometry(w, h, d), 0.5), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z, sx, sy, sz) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z, 0, 0, 0, sx, sy, sz)); }
function S2(m, r, x, y, z, sx, sy, sz) { put(m, xf(new THREE.SphereGeometry(r, 16, 12), x, y, z, 0, 0, 0, sx, sy, sz)); }
function EX(m, sh, d, x, y, z, ry) { put(m, xf(uvD(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 10 }), 0.5), x, y, z, 0, ry || 0, 0)); }
function EXH(m, sh, d, x, y, z) { put(m, xf(uvD(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 10 }), 0.5), x, y, z, -PI / 2, 0, 0)); } /* 水平板块：shape(x,y)→世界(x,-z) */
function BR(m, w, h, d, x, y, z, pt, yw) { put(m, xf(boxUV(new THREE.BoxGeometry(w, h, d), 0.5), x, y, z, pt || 0, yw || 0, 0, 1, 1, 1, 'YXZ')); } /* 俯仰+偏航（栏杆段/游船） */
function HOOK(m, w, h, d, x, y, z, yw, rl) { put(m, xf(boxUV(new THREE.BoxGeometry(w, h, d), 0.5), x, y, z, 0, yw, rl, 1, 1, 1, 'YXZ')); } /* 翘角：先抬角后偏航 */
function LAT(m, pts, seg, x, y, z, ry, uu, vv) { var a = [], i; for (i = 0; i < pts.length; i++) a.push(new THREE.Vector2(pts[i][0], pts[i][1])); var g = new THREE.LatheGeometry(a, seg), u = g.attributes.uv; for (i = 0; i < u.count; i++) u.setXY(i, u.getX(i) * (uu || 4), u.getY(i) * (vv || 1)); put(m, xf(g, x, y, z, 0, ry || 0, 0)); } /* 攒尖顶：剖面点自檐口向顶（顶陡檐缓+檐口反翘）；uv u×4 显瓦垄 */
function HIP(m, x, y0, z, R, pts, w) { /* 垂脊：沿四条对角线的折线段贴合内凹曲面，末段上翘即翘角 */
  var e, f, i; for (e = -1; e <= 1; e += 2) for (f = -1; f <= 1; f += 2) for (i = 0; i < pts.length - 1; i++) {
    var r1 = pts[i][0] * R, r2 = pts[i + 1][0] * R, y1 = pts[i][1], y2 = pts[i + 1][1], dh = r2 - r1, dy = y2 - y1, ln = Math.sqrt(dh * dh + dy * dy), rm = (r1 + r2) / 2 * 0.7071;
    HOOK(m, ln + w * 0.6, w, w, x + e * rm, y0 + (y1 + y2) / 2, z + f * rm, Math.atan2(-f, e), Math.atan2(dy, dh)); } }
function CONE(R, yb, yt) { /* 攒尖剖面：y = yt - H·(r/R)^0.7（顶陡檐缓）+ 檐口 1.04R 反翘 */
  var H = yt - yb; return [[1.04 * R, yb + 0.03 * H], [R, yb], [0.97 * R, yb + 0.02 * H], [0.83 * R, yb + 0.12 * H], [0.63 * R, yb + 0.28 * H], [0.4 * R, yb + 0.47 * H], [0.17 * R, yb + 0.71 * H], [0.012, yt]]; }
function HIPP(yb, yt) { var H = yt - yb; return [[0.02, yt - 0.02 * H], [0.4, yb + 0.47 * H], [0.85, yb + 0.1 * H], [1.1, yb + 0.14 * H]]; }
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) { pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length; }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
    var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
/* ---- 部件 ---- */
function arch(L2, r1, ax1, r2, ax2, top, sh) { /* 桥侧面：低拱桥面 + 大拱洞 + 涵洞 */
  var s = new THREE.Shape(); s.moveTo(-L2, 0); s.lineTo(ax1 - r1, 0); s.absarc(ax1, 0, r1, PI, 0, true); s.lineTo(ax2 - r2, 0); s.absarc(ax2, 0, r2, PI, 0, true); s.lineTo(L2, 0); s.lineTo(L2, sh);
  for (var i = 1; i <= 16; i++) { var t = L2 - i * (2 * L2 / 16); s.lineTo(t, sh + (top - sh) * (1 - (t / L2) * (t / L2))); }
  s.closePath(); return s;
}
function tree(A, x, z, r, kind) { /* kind: 0 香樟 / 1 垂柳 / 2 樱花（主冠球 16×12 + 多瓣副冠二十面体；垂柳：顶扁冠+三束下垂枝近水面） */
  Y(A.trunk, r * 0.12, r * 0.18, r * 2.4, 6, x, r * 1.2, z);
  var m = kind === 2 ? A.bloom : (kind === 1 ? A.willow : A.leaf);
  if (kind === 1) {
    S2(m, r, x, r * 2.6, z, 1.1, 0.95, 1.1); O(A.leaf2, r * 0.34, x, r * 3.3, z, 1, 0.8, 1);
    O(m, r * 0.52, x + r * 0.72, r * 1.75, z + r * 0.1, 0.6, 1.75, 0.6);
    O(m, r * 0.5, x - r * 0.75, r * 1.9, z, 0.6, 1.9, 0.6);
    O(m, r * 0.44, x + r * 0.1, r * 1.6, z - r * 0.75, 0.6, 1.7, 0.6);
    if (A.lob) O(A.leaf2, r * 0.4, x - r * 0.5, r * 2.9, z + r * 0.5);
  } else if (kind === 2) { S2(m, r * 0.95, x, r * 2.7, z); O(m, r * 0.55, x + r * 0.5, r * 3.05, z + r * 0.15); O(A.leaf, r * 0.4, x - r * 0.5, r * 2.5, z - r * 0.1); }
  else { S2(m, r, x, r * 2.8, z); O(A.leaf2, r * 0.62, x + r * 0.5, r * 3.1, z + r * 0.2); O(m, r * 0.5, x - r * 0.55, r * 2.55, z - r * 0.25);
    if (A.lob) { O(m, r * 0.45, x + r * 0.1, r * 2.3, z + r * 0.6); O(A.leaf2, r * 0.4, x - r * 0.5, r * 3.0, z + r * 0.35); } }
}
function pav(A, L, x, z, s, fs, hang, plq) { /* 双檐攒尖亭（岛面 y0=0.085 起；竖向×s 平面×fs）：石台基+踏步+红柱+美人靠+Lathe 内凹双檐（檐口下勾/四角起翘）+宝顶+匾额+灯笼 */
  var e, f, y0 = 0.085, R1 = 0.31 * fs, R2 = 0.21 * fs;
  B(A.stone, 0.46 * fs, 0.05, 0.42 * fs, x, y0 + 0.025, z); B(A.stone, 0.4 * fs, 0.04, 0.36 * fs, x, y0 + 0.07, z);
  B(A.stone, 0.18 * fs, 0.03, 0.08, x, y0 + 0.075, z + 0.25 * fs); B(A.stone, 0.13 * fs, 0.026, 0.06, x, y0 + 0.1, z + 0.28 * fs);
  for (e = -1; e <= 1; e += 2) for (f = -1; f <= 1; f += 2) Y(A.wood, 0.018 * fs, 0.021 * fs, 0.3 * s, 8, x + e * 0.13 * fs, y0 + 0.09 + 0.15 * s, z + f * 0.115 * fs);
  if (L >= 2) for (e = -1; e <= 1; e += 2) { B(A.wood, 0.26 * fs, 0.026 * s, 0.018, x, y0 + 0.09 + 0.13 * s, z + e * 0.115 * fs); B(A.wood, 0.018, 0.026 * s, 0.23 * fs, x + e * 0.13 * fs, y0 + 0.09 + 0.13 * s, z); }
  if (L >= 3) { /* 台基白石栏（后+两侧，前留踏步） */
    for (e = -1; e <= 1; e += 2) { for (f = -1; f <= 1; f++) B(A.rail, 0.018, 0.055, 0.018, x + e * 0.22 * fs, y0 + 0.0775, z + f * 0.2 * fs); B(A.rail, 0.016, 0.012, 0.42 * fs, x + e * 0.22 * fs, y0 + 0.1, z); B(A.rail, 0.018, 0.055, 0.018, x + e * 0.11 * fs, y0 + 0.0775, z - 0.2 * fs); }
    B(A.rail, 0.46 * fs, 0.012, 0.016, x, y0 + 0.1, z - 0.2 * fs); }
  LAT(A.roof, CONE(R1, 0.4 * s, 0.556 * s), 4, x, y0, z, PI / 4); HIP(A.ridge, x, y0, z, R1, HIPP(0.4 * s, 0.556 * s), 0.02 * s);
  B(A.wood, 0.17 * fs, 0.11 * s, 0.17 * fs, x, y0 + 0.611 * s, z);
  if (plq) B(plq, 0.13 * fs, 0.046 * s, 0.014, x, y0 + 0.618 * s, z + 0.085 * fs + 0.008);
  if (L >= 4) B(A.glowWin, 0.12 * fs, 0.05 * s, 0.012, x, y0 + 0.611 * s, z - 0.085 * fs - 0.007);
  LAT(A.roof, CONE(R2, 0.666 * s, 0.816 * s), 4, x, y0, z, PI / 4); HIP(A.ridge, x, y0, z, R2, HIPP(0.666 * s, 0.816 * s), 0.018 * s);
  Y(A.ridge, 0.011 * s, 0.019 * s, 0.06 * s, 8, x, y0 + 0.846 * s, z); O(A.ridge, 0.022 * s, x, y0 + 0.9 * s, z);
  if (hang) for (e = -1; e <= 1; e += 2) O(A.lan, 0.024, x + e * 0.16 * fs, y0 + 0.37 * s, z + 0.16 * fs);
}
function hall(A, L, x, z) { /* 水榭大厅：水上石台（6 木桩）+6 红柱+暖光窗带+双坡瓦顶（正脊/脊吻/封檐/四角起翘）+lv4 灯笼 */
  var w = 0.68, d = 0.38, e, i;
  B(A.stone, w, 0.05, d, x, 0.105, z);
  for (i = 0; i < 3; i++) for (e = -1; e <= 1; e += 2) Y(A.boat, 0.017, 0.017, 0.08, 6, x - 0.27 + i * 0.27, 0.04, z + e * (d / 2 - 0.04));
  for (i = 0; i < 3; i++) for (e = -1; e <= 1; e += 2) Y(A.wood, 0.016, 0.019, 0.24, 8, x - 0.27 + i * 0.27, 0.25, z + e * (d / 2 - 0.055));
  B(A.glowWin, w - 0.16, 0.095, 0.014, x, 0.255, z + d / 2 - 0.008);
  B(A.wood, w - 0.16, 0.115, 0.014, x, 0.25, z - d / 2 + 0.008);
  B(A.wood, 0.014, 0.115, d - 0.13, x - (w / 2 - 0.008), 0.25, z); B(A.wood, 0.014, 0.115, d - 0.13, x + (w / 2 - 0.008), 0.25, z);
  B(A.dark, 0.11, 0.155, 0.012, x + 0.21, 0.208, z + d / 2 - 0.006);
  var ang = Math.atan2(0.085, 0.235), pw = Math.sqrt(0.085 * 0.085 + 0.235 * 0.235) + 0.03;
  B(A.roof, w + 0.07, 0.018, pw, x, 0.4145, z + 0.1175, ang, 0, 0); B(A.roof, w + 0.07, 0.018, pw, x, 0.4145, z - 0.1175, -ang, 0, 0);
  B(A.ridge, w + 0.13, 0.042, 0.07, x, 0.462, z);
  B(A.ridge, 0.028, 0.05, 0.042, x - (w / 2 + 0.05), 0.478, z); B(A.ridge, 0.028, 0.05, 0.042, x + (w / 2 + 0.05), 0.478, z);
  B(A.ridge, w + 0.05, 0.038, 0.02, x, 0.383, z + d / 2 + 0.043); B(A.ridge, w + 0.05, 0.038, 0.02, x, 0.383, z - d / 2 - 0.043);
  HOOK(A.ridge, 0.05, 0.013, 0.022, x - (w / 2 + 0.03), 0.388, z + (d / 2 + 0.04), -2.356, 0.4); HOOK(A.ridge, 0.05, 0.013, 0.022, x + (w / 2 + 0.03), 0.388, z + (d / 2 + 0.04), -0.785, 0.4);
  HOOK(A.ridge, 0.05, 0.013, 0.022, x - (w / 2 + 0.03), 0.388, z - (d / 2 + 0.04), 2.356, 0.4); HOOK(A.ridge, 0.05, 0.013, 0.022, x + (w / 2 + 0.03), 0.388, z - (d / 2 + 0.04), 0.785, 0.4);
  if (L >= 4) { O(A.lan, 0.024, x - 0.28, 0.33, z + d / 2 - 0.02); O(A.lan, 0.024, x + 0.28, 0.33, z + d / 2 - 0.02); }
  /* 东侧抱厦小亭：伸入水面（木桩+4 红柱+美人靠+两坡小顶+翘角） */
  var wx = x + w / 2 + 0.12, wz = z + 0.02, ang2 = Math.atan2(0.06, 0.14), pw2 = Math.sqrt(0.06 * 0.06 + 0.14 * 0.14) + 0.02;
  B(A.stone, 0.24, 0.05, 0.24, wx, 0.105, wz);
  for (e = -1; e <= 1; e += 2) for (i = -1; i <= 1; i += 2) { Y(A.boat, 0.015, 0.015, 0.08, 6, wx + e * 0.09, 0.04, wz + i * 0.09); Y(A.wood, 0.014, 0.016, 0.2, 8, wx + e * 0.09, 0.23, wz + i * 0.09); }
  B(A.wood, 0.2, 0.026, 0.016, wx, 0.17, wz + 0.09); B(A.wood, 0.016, 0.026, 0.2, wx + 0.09, 0.17, wz); B(A.wood, 0.2, 0.026, 0.016, wx, 0.17, wz - 0.09);
  B(A.roof, 0.28, 0.016, pw2, wx, 0.36, wz + 0.07, ang2, 0, 0); B(A.roof, 0.28, 0.016, pw2, wx, 0.36, wz - 0.07, -ang2, 0, 0);
  B(A.ridge, 0.3, 0.03, 0.05, wx, 0.395, wz); B(A.ridge, 0.28, 0.03, 0.018, wx, 0.336, wz + 0.16); B(A.ridge, 0.28, 0.03, 0.018, wx, 0.336, wz - 0.16);
  HOOK(A.ridge, 0.045, 0.012, 0.02, wx - 0.15, 0.34, wz + 0.16, -2.356, 0.4); HOOK(A.ridge, 0.045, 0.012, 0.02, wx + 0.15, 0.34, wz + 0.16, -0.785, 0.4);
  HOOK(A.ridge, 0.045, 0.012, 0.02, wx - 0.15, 0.34, wz - 0.16, 2.356, 0.4); HOOK(A.ridge, 0.045, 0.012, 0.02, wx + 0.15, 0.34, wz - 0.16, 0.785, 0.4);
  /* 临水木栈道（大厅东前沿，木桩+白石栏；西端收在水面椭圆内） */
  B(A.plank, 0.7, 0.02, 0.14, x + 0.19, 0.1, z + d / 2 + 0.08);
  for (i = 0; i < 5; i++) { Y(A.boat, 0.014, 0.014, 0.08, 6, x - 0.12 + i * 0.16, 0.04, z + d / 2 + 0.12); B(A.rail, 0.016, 0.06, 0.016, x - 0.12 + i * 0.16, 0.14, z + d / 2 + 0.135); }
  B(A.rail, 0.66, 0.012, 0.014, x + 0.2, 0.165, z + d / 2 + 0.135);
}
function rocks(A, x, z, s) { /* 湖石组：三石堆叠 + lv3+ 石上苔草 */
  O(A.rock, 0.065 * s, x, 0.045 * s + 0.045, z, 1.25, 0.7, 1); O(A.rock, 0.05 * s, x + 0.1 * s, 0.035 * s + 0.035, z + 0.06 * s, 1, 0.65, 1.3);
  O(A.rock, 0.04 * s, x - 0.09 * s, 0.03 * s + 0.03, z + 0.03 * s, 1.2, 0.6, 0.9);
  if (s > 1) O(A.leaf2, 0.03 * s, x - 0.02 * s, 0.1 * s + 0.08, z);
}
function rowboat(A, x, z, yw) { /* 小木船：船身+首尾起翘+座板+桨 */
  var sn = Math.sin(yw), cs = Math.cos(yw);
  BR(A.boat, 0.3, 0.04, 0.11, x, 0.058, z, 0, yw);
  BR(A.boat, 0.09, 0.028, 0.055, x + cs * 0.17, 0.078, z - sn * 0.17, 0.35, yw);
  BR(A.boat, 0.09, 0.028, 0.055, x - cs * 0.17, 0.078, z + sn * 0.17, -0.35, yw);
  BR(A.wood, 0.02, 0.018, 0.1, x, 0.088, z, 0, yw);
  BR(A.wood, 0.16, 0.01, 0.018, x + cs * 0.05, 0.07, z - sn * 0.05, 0.5, yw);
}
function paof(A, x, z, yw) { /* 画舫：船身+首尾起翘+船楼（暖光窗）+两坡瓦篷+桅杆灯笼 */
  var sn = Math.sin(yw), cs = Math.cos(yw), dl = -0.05;
  BR(A.boat, 0.5, 0.05, 0.15, x, 0.06, z, 0, yw);
  BR(A.boat, 0.1, 0.032, 0.09, x + cs * 0.28, 0.08, z - sn * 0.28, 0.3, yw);
  BR(A.boat, 0.1, 0.032, 0.09, x - cs * 0.28, 0.08, z + sn * 0.28, -0.3, yw);
  BR(A.wood, 0.22, 0.09, 0.13, x + dl * cs, 0.13, z - dl * sn, 0, yw);
  BR(A.glowWin, 0.16, 0.05, 0.012, x + dl * cs + sn * 0.066, 0.135, z - dl * sn + cs * 0.066, 0, yw);
  BR(A.roof, 0.26, 0.016, 0.085, x + dl * cs + sn * 0.055, 0.195, z - dl * sn + cs * 0.055, 0.45, yw);
  BR(A.roof, 0.26, 0.016, 0.085, x + dl * cs - sn * 0.055, 0.195, z - dl * sn - cs * 0.055, -0.45, yw);
  BR(A.ridge, 0.28, 0.018, 0.02, x + dl * cs, 0.222, z - dl * sn, 0, yw);
  Y(A.steel, 0.006, 0.006, 0.14, 6, x + cs * 0.2, 0.16, z - sn * 0.2); O(A.lan, 0.018, x + cs * 0.2, 0.25, z - sn * 0.2);
  O(A.lan, 0.016, x - cs * 0.29, 0.12, z + sn * 0.29);
}
function lamp2(A, x, z, y0) { /* 双头园灯：座+杆+双层挑臂+四灯罩 */
  B(A.dark, 0.05, 0.025, 0.05, x, y0 + 0.012, z); Y(A.steel, 0.007, 0.011, 0.3, 6, x, y0 + 0.17, z);
  B(A.steel, 0.11, 0.011, 0.011, x, y0 + 0.325, z);
  B(A.lamp, 0.04, 0.032, 0.04, x - 0.05, y0 + 0.308, z); B(A.lamp, 0.04, 0.032, 0.04, x + 0.05, y0 + 0.308, z);
  B(A.steel, 0.08, 0.01, 0.01, x, y0 + 0.278, z);
  B(A.lamp, 0.032, 0.026, 0.032, x - 0.038, y0 + 0.264, z); B(A.lamp, 0.032, 0.026, 0.032, x + 0.038, y0 + 0.264, z);
}
/* ---- 断桥烟雨四年代 ---- */
function build(L) {
  var g = new THREE.Group(); g.name = 'prop_24_lv' + L; g.userData.kind = 'property'; g.userData.propIdx = 24; g.userData.level = L;
  BK = {}; var i, k, e, f, t, sn, cs, wat = texWater(true);
  var A = {
    water: MF(['#a0aca8', '#9aadac', '#95adb0', '#90adb2'][L - 1], { map: wat, rg: 0.1, mt: 0.5 }),
    waterHi: MF('#a9bcbc', { map: wat, rg: 0.05, mt: 0.55 }),
    grass: M('#5e7040', { map: texFuzz(), rg: 0.95 }), path: M('#b5ad9c', { map: texBrick2(), rg: 0.9 }), plank: M('#a98a68', { map: texWood(), rg: 0.85 }),
    stone: M('#beb8ac', { map: texStone(), rm: texStoneR(), rg: 1 }), rail: M('#d8d3c8', { rg: 0.82 }), roof: M('#3c424a', { map: texTile(), rm: texTileR(), rg: 0.95 }),
    wood: M('#8a4a36', { rg: 0.7 }), dark: M('#272c31', { rg: 0.85 }), ridge: M('#2c3238', { rg: 0.78 }), leaf: M('#526737', { rg: 0.95 }), leaf2: M('#6a8442', { rg: 0.95 }),
    willow: M('#7a954d', { rg: 0.95 }), bloom: M('#dfb3c6', { rg: 0.85 }), trunk: M('#5a4834', { rg: 0.9 }), steel: M('#757c82', { rg: 0.4, mt: 0.7 }), lob: L >= 2,
    rock: M('#8f8b80', { rg: 0.95 }), boat: M('#7c5c40', { map: texWood(), rg: 0.65 }),
    flower: M(['#b8574a', '#c0574a', '#cf6a8a', '#d97fa0'][L - 1], { rg: 0.8 }),
    lan: MF('#b8261f', { rg: 0.5, em: '#ff5a3c', ei: [0.2, 0.35, 0.5, 0.8][L - 1] }),
    lamp: MF('#ffe6b0', { rg: 0.3, em: '#ffd9a0', ei: [0.3, 0.55, 0.7, 0.9][L - 1] }),
    glowWin: L >= 3 ? MF('#5a4a3a', { rg: 0.35, em: '#ffbe70', ei: 0.45 }) : null,
    plq: L >= 3 ? MF('#e8dcbf', { map: signTex('断桥', '#26221a', L >= 4 ? '#ffd98c' : '#d8c290'), rg: 0.55, em: L >= 4 ? '#ffcf8e' : null, ei: 0.5 }) : null
  };
  /* 湖面：椭圆大湖（2.54×2.32）+ 桥影/雾光带（贴水面不改剪影）+ 前岸柳岸 + 右后湖心岛（EXH 局部 y→世界 -z） */
  (function () { var s = new THREE.Shape(); s.absellipse(0, 0, 1.27, 1.16, 0, PI * 2, false); EXH(A.water, s, 0.03, 0, 0, 0); })();
  B(A.waterHi, 1.5, 0.004, 0.2, -0.3, 0.034, -0.52, 0, 0.21, 0); B(A.waterHi, 1.0, 0.004, 0.16, 0.5, 0.034, 0.25, 0, -0.12, 0);
  (function () { var s = new THREE.Shape(); /* 前岸：岸线四段弧，外缘贴椭圆 150°→240° */
    s.moveTo(-0.635, -1.005); s.quadraticCurveTo(-0.2, -0.78, -0.35, -0.62); s.quadraticCurveTo(-0.6, -0.42, -0.5, -0.22); s.quadraticCurveTo(-0.3, -0.02, -0.4, 0.15); s.quadraticCurveTo(-0.55, 0.4, -0.7, 0.45); s.lineTo(-1.0999, 0.58); s.absellipse(0, 0, 1.27, 1.16, PI * 150 / 180, PI * 240 / 180, false); s.closePath(); EXH(A.grass, s, 0.09, 0, 0, 0); })();
  (function () { var s = new THREE.Shape(); /* 湖心岛：右后，外缘贴椭圆 75°→20° */
    s.moveTo(1.1935, 0.3967); s.quadraticCurveTo(1.02, 0.36, 0.9, 0.42); s.quadraticCurveTo(0.68, 0.46, 0.58, 0.62); s.quadraticCurveTo(0.48, 0.8, 0.45, 0.9); s.lineTo(0.329, 1.121); s.absellipse(0, 0, 1.27, 1.16, PI * 75 / 180, PI * 20 / 180, true); s.closePath(); EXH(A.grass, s, 0.085, 0, 0, 0); })();
  /* 步道广场：lv1 木板道 → lv2+ 方砖广场+沿岸步道（结构性演进） */
  if (L === 1) { B(A.plank, 0.72, 0.09, 0.5, -0.78, 0.045, -0.05); B(A.plank, 0.16, 0.09, 0.7, -0.99, 0.045, 0.18); }
  else { B(A.path, 0.72, 0.092, 0.5, -0.78, 0.046, -0.05); B(A.path, 0.16, 0.092, 0.7, -0.99, 0.046, 0.18); B(A.dark, 0.74, 0.094, 0.03, -0.78, 0.047, -0.31); B(A.dark, 0.74, 0.094, 0.03, -0.78, 0.047, 0.21); }
  /* 石砌驳岸：7 段随岸线转折 + 压顶石 + lv2+ 望柱扶手 */
  var EB = [[-0.38, -0.52], [-0.48, -0.3], [-0.44, -0.05], [-0.42, 0.14], [-0.52, 0.3], [-0.72, 0.44], [-0.9, 0.5], [-1.0999, 0.58]];
  for (k = 0; k < EB.length - 1; k++) { var x1 = EB[k][0], z1 = EB[k][1], x2 = EB[k + 1][0], z2 = EB[k + 1][1], dx = x2 - x1, dz = z2 - z1, ln = Math.sqrt(dx * dx + dz * dz), mx = (x1 + x2) / 2, mz = (z1 + z2) / 2, yw2 = Math.atan2(-dz, dx);
    B(A.stone, ln + 0.03, 0.08, 0.05, mx, 0.05, mz, 0, yw2); B(A.stone, ln + 0.03, 0.022, 0.07, mx, 0.096, mz, 0, yw2);
    if (L >= 2) { B(A.rail, 0.03, 0.09, 0.03, x1, 0.15, z1); if (k === EB.length - 2) B(A.rail, 0.03, 0.09, 0.03, x2, 0.15, z2); BR(A.rail, ln + 0.03, 0.02, 0.024, mx, 0.185, mz, 0, yw2); } }
  /* 断桥：西岸(-1.05,-0.11) → 岛台(0.55,-0.45)：大拱 r0.15+涵洞、拱顶 0.25、低而纤细的双层石栏（地袱/望柱/寻仗/抱鼓石）+ 踏级横缝 + 双头桥灯 lv2+ */
  sn = 0.2078; cs = 0.9782; var BX = -0.25, BZ = -0.28, BH = 0.818, RY = 0.2094;
  var bf = function (u) { return 0.1 + 0.15 * (1 - (u / BH) * (u / BH)); };
  EX(A.stone, arch(BH, 0.15, -0.08, 0.05, 0.45, 0.25, 0.1), 0.34, BX - sn * 0.17, 0, BZ - cs * 0.17, RY);
  for (k = 0; k <= 12; k++) { t = -BH + k * (2 * BH / 12); var wx = BX + cs * t, wz = BZ - sn * t, yt = bf(t);
    for (e = -1; e <= 1; e += 2) { B(A.rail, 0.022, 0.075, 0.022, wx + sn * e * 0.155, yt + 0.0375, wz + cs * e * 0.155);
      if (k < 12) { var t2 = t + 2 * BH / 12, pit = Math.atan2(bf(t2) - yt, 2 * BH / 12), mx = wx + cs * BH / 12, mz = wz - sn * BH / 12;
        BR(A.rail, 2 * BH / 12 + 0.01, 0.016, 0.02, mx + sn * e * 0.155, yt + 0.083 + (bf(t2) - yt) / 2, mz + cs * e * 0.155, pit, RY);
        BR(A.rail, 2 * BH / 12 + 0.01, 0.014, 0.026, mx + sn * e * 0.155, yt + 0.01 + (bf(t2) - yt) / 2, mz + cs * e * 0.155, pit, RY); } } }
  for (e = -1; e <= 1; e += 2) for (f = -1; f <= 1; f += 2) { var te = f * BH, we = BX + cs * te, ze = BZ - sn * te;
    B(A.rail, 0.03, 0.1, 0.03, we + sn * e * 0.155, bf(te) + 0.05, ze + cs * e * 0.155);
    O(A.rail, 0.028, we + sn * e * 0.19, bf(te) + 0.035, ze + cs * e * 0.19, 1, 0.7, 1); }
  for (k = 0; k <= 24; k++) { t = -BH + k * (2 * BH / 24); BR(A.ridge, 0.012, 0.005, 0.29, BX + cs * t, bf(t) + 0.0025, BZ - sn * t, 0, RY); } /* 踏级横缝（阴影线） */
  if (L >= 2) for (k = 0; k < 3; k++) { t = -0.45 + k * 0.45; e = k % 2 ? -1 : 1; lamp2(A, BX + cs * t + sn * e * 0.2, BZ - sn * t + cs * e * 0.2, bf(t)); }
  /* 桥头石平台两级踏步（岛端） */
  B(A.stone, 0.32, 0.024, 0.2, 0.63, 0.092, -0.47, 0, RY); B(A.stone, 0.26, 0.024, 0.14, 0.6, 0.076, -0.45, 0, RY);
  /* 岛亭（竖向 s 逐年代增、平面 fs 内收）+ 石灯 lv3+ + 岛上乔木 */
  pav(A, L, 0.9, -0.72, [0.95, 1.03, 1.1, 1.18][L - 1], [0.86, 0.9, 0.95, 1.0][L - 1], L >= 4, A.plq);
  if (L >= 3) { Y(A.stone, 0.03, 0.036, 0.03, 8, 0.6, 0.1, -0.6); Y(A.stone, 0.012, 0.014, 0.08, 8, 0.6, 0.155, -0.6); B(A.stone, 0.05, 0.04, 0.05, 0.6, 0.215, -0.6); Y(A.roof, 0.012, 0.045, 0.03, 4, 0.6, 0.25, -0.6, 0, PI / 4, 0); if (L >= 4) B(A.lamp, 0.03, 0.03, 0.03, 0.6, 0.215, -0.6); }
  var cr = [0.15, 0.165, 0.18, 0.2][L - 1];
  tree(A, -1.02, -0.78, cr, 0); tree(A, -0.62, -0.7, cr, 1); tree(A, -0.52, 0.1, cr * 0.9, 1); tree(A, -1.04, 0.12, cr * 0.95, 0);
  tree(A, 0.6, -0.88, cr * 1.05, 0); tree(A, 0.55, -0.72, cr * 0.9, 1);
  if (L >= 2) { tree(A, -0.56, -0.35, cr * 0.85, 1); tree(A, -0.88, 0.42, cr * 0.9, 0); tree(A, 1.06, -0.42, cr * 0.9, 0); tree(A, 0.85, -0.44, cr * 0.8, 1); tree(A, 0.7, -0.9, cr * 0.75, 1); }
  if (L >= 3) { tree(A, -0.52, -0.5, cr * 0.8, 1); tree(A, 0.5, -0.9, cr * 0.75, 0); }
  if (L >= 4) { tree(A, -0.5, -0.85, cr * 0.8, 2); tree(A, -1.08, 0.35, cr * 0.7, 2); }
  /* 岸边入水石阶 lv2+（小船停靠） */
  if (L >= 2) for (k = 0; k < 3; k++) B(A.stone, 0.14, 0.02, 0.05, -0.5 + k * 0.045, 0.084 - k * 0.018, -0.16, 0, 0.1);
  /* 临水建筑：lv1-2 木码头+素亭 → lv3+ 水榭大厅（伸入湖面、暖光窗） */
  if (L <= 2) { B(A.plank, 0.3, 0.022, 0.34, -0.44, 0.115, 0.5);
    for (k = 0; k < 4; k++) Y(A.boat, 0.016, 0.016, 0.1, 6, -0.54 + (k % 2) * 0.2, 0.05, 0.5 + (k < 2 ? -0.13 : 0.13));
    for (e = -1; e <= 1; e += 2) for (f = -1; f <= 1; f += 2) Y(A.wood, 0.013, 0.015, 0.17, 6, -0.44 + e * 0.1, 0.21, 0.5 + f * 0.11);
    LAT(A.roof, CONE(0.16, 0.3, 0.37), 4, -0.44, 0, 0.5, PI / 4); HIP(A.ridge, -0.44, 0, 0.5, 0.16, HIPP(0.3, 0.37), 0.014); }
  else hall(A, L, -0.78, 0.42);
  /* 景石组/石凳/花坛（lv3+ 逐年代增） */
  if (L >= 3) { rocks(A, -0.46, -0.6, 1); rocks(A, -0.72, -0.42, 0.9); rocks(A, -1.13, 0.3, 1.1);
    B(A.stone, 0.32, 0.035, 0.1, -0.95, 0.115, -0.24); B(A.stone, 0.04, 0.05, 0.09, -1.07, 0.075, -0.24); B(A.stone, 0.04, 0.05, 0.09, -0.83, 0.075, -0.24); }
  if (L >= 4) { for (k = 0; k < 2; k++) { var px = k ? -0.58 : -0.98; B(A.stone, 0.18, 0.05, 0.09, px, 0.117, 0.14); O(A.flower, 0.038, px - 0.04, 0.152, 0.14); O(A.flower, 0.034, px + 0.05, 0.15, 0.13); O(A.leaf2, 0.03, px, 0.152, 0.15); } }
  /* 双头园灯 lv3+（沿岸步道/广场） */
  if (L >= 3) { lamp2(A, -0.98, -0.02, 0.092); lamp2(A, -0.6, -0.02, 0.092); }
  if (L >= 4) lamp2(A, -1.13, 0.15, 0.09);
  /* 游船（lv2+ 递增：小木船 → 画舫） */
  if (L >= 2) rowboat(A, 0.62, 0.18, 0.5);
  if (L >= 3) { rowboat(A, 0.95, -0.15, -0.7); rowboat(A, -0.06, 0.66, 0.1); }
  if (L >= 4) paof(A, 0.35, -0.02, 0.35);
  flush(g);
  var lan = A.lan, lamp = A.lamp, gw = A.glowWin, pq = A.plq, e0 = [0.3, 0.55, 0.7, 0.9][L - 1];
  g.userData.anim = [function (tt) { var s = 0.5 + 0.5 * Math.sin(tt * 1.3); lamp.emissiveIntensity = e0 + 0.15 * s; if (gw) gw.emissiveIntensity = 0.35 + 0.2 * s; wat.offset.x = (tt * 0.012) % 1; wat.offset.y = (tt * 0.008) % 1; }]; /* 灯呼吸 + 暖窗 + 水纹漂移 */
  if (L >= 4) g.userData.anim.push(function (tt) { lan.emissiveIntensity = 0.65 + 0.2 * (0.5 + 0.5 * Math.sin(tt * 1.9)); if (pq && pq.emissive) pq.emissiveIntensity = 0.4 + 0.15 * (0.5 + 0.5 * Math.sin(tt * 1.6)); });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[24] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
