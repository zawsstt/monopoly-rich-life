/* 大富翁·现代写实棋盘（苏）格 23「山塘街」—— 苏州水乡：河道 / 石拱桥 / 枕河人家 / 木铺店面，四年代演进
 * 视觉基准：refs/modern/prop_23.png 四象限（左上 1990s / 右上 2000s / 左下 2010s / 右下 2020s，同机位航拍 3/4 视角）：
 * 沿河主街一排 2 层店屋 + 后两进进深院落屋面高低错落，石拱桥在左前方跨河为画面主角，对岸步道行道树成排，水面有倒影波光。
 * 契约：window.Props3DModern[23](level 1..4) → Group（每次全新实例）；占地 ≤2.6×2.6（x -1.3..1.26 / z -1.3..1.26）；
 * 底面 y=0；正面 +Z（河道在前、街屋在后、拱桥在左前）；每级 mesh ≤55（按材质合并桶 ≤30）；
 * Canvas 纹理 ≤256px；零 Math.random（LCG 种子流）；圆柱 ≥12 段、球 16×12；动画 ≤2 项。
 * 高度带（smoke_modern_st BANDS）：lv1 [0.85,1.0] lv2 [1.03,1.16] lv3 [1.1,1.24] lv4 [1.16,1.32]。
 * 年代特征：lv1 1990s 斑驳灰墙+木板门店面+素石矮墙+零星灯笼，树 3 棵，水浑浊；
 *   lv2 2000s 粉刷白墙+彩色布篷/橱窗+石栏望柱+行道树+灯笼成排+河埠头+中排屋顶小瓦亭；
 *   lv3 2010s 木格栅店面+暖光橱窗+街灯列+中排平顶露台/玻璃阳光房+木船+对岸垂柳；
 *   lv4 2020s 通高玻璃店面+发光店招「山塘街」+大玻璃亭+屋顶花架/太阳能板+驳岸灯带+带篷画舫+垂柳最茂。
 * 工程要点：手写按材质分桶合并 BufferGeometry（r147 无 BufferGeometryUtils）；boxUV 按世界尺寸烘焙（0.5m/重复）；
 * 屋面三角棱柱一次挤出成形（无斜板叠压 z-fight）+ 正脊/脊吻/马头墙阶梯收分/檐口封板；树冠 16×12 球 sin 域确定性形变；
 * 发光件（灯笼/橱窗/街灯/店招/灯带）独立 MF 材质每实例新建供呼吸动画；水面纹理每实例新建做 offset 漂移。
 * 本轮 R1 变更（65→结构+形精修）：进深重排 1.91→2.56（三排街屋 + 对岸步道/行道树/路缘）；
 * 屋面改三角棱柱一次挤出消灭斜板穿插，马头墙改阶梯收分+压顶条；石拱桥放大（半圆拱洞 r0.2/桥顶 0.5/两侧踏步/连续桥栏）；
 * 立面加窗框/窗台/格心/二层木栏杆阳台/檐口封板；新增河埠头下河石阶、对岸栏杆、形变树冠（垂柳下垂簇）、红灯笼成排；
 * lv2 屋顶披屋改小瓦亭；lv3/4 玻璃阳光房改透亮格构+露台木平台绿植；lv4 加太阳能板阵/画舫半圆篷/驳岸灯带/竖幌/空调外机。
 * R2 变更：修 canGeo 缓存被 xf 原地变换的累积缩放 bug（clone 后变换）；桥头留出开放小广场（大树移桥东不遮桥）；
 * 对岸增矮坡顶河房+小窗；水面倒影亮带/暗斑加强；后排三屋改错落高度；店面加分间竖梃+门楣+lv2 横匾；
 * 灯笼加大、lv3+ 金盖；广场铺装加密；桥踏步/船加大、画舫移水面中央。
 * R3 变更：屋面/脊改「贴图载色」消除双重压黑（瓦垄青灰可读）；桥身独立浅色条石材质；中排前坡加天窗×2（lv3+）；
 * 雨棚/太阳能板倾角改外沿下垂（修正旋转方向）；檐口封板改椽头纹理（零三角）；石栏改条石纹理压灰、望柱收细；
 * 近岸暗水带（驳岸阴影）；lv3+ 河街木花箱×3；lv4 桥头广场外摆桌凳×2；lv4 对岸垂柳加簇。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_23] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
var _mc = {};
function M(h, o) {
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + o.em + '|' + o.ei + '|' + (o.map ? o.map.uuid : '') + '|' + (o.op || '') + '|' + (o.fs === false ? 0 : 1);
  if (_mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: o.fs !== false });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) m.map = o.map; if (o.op) { m.transparent = true; m.opacity = o.op; }
  m.userData.previewColor = h; return (_mc[k] = m);
}
function MF(h, o) { /* 动画/发光材质：每次全新实例（呼吸不跨实例共享） */
  o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, flatShading: o.fs !== false });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; } if (o.map) m.map = o.map; m.userData.previewColor = h; return m;
}
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
var _t = {};
function texTile() { /* 小青瓦：垄脊受光/垄沟落影 + 横向搭接缝 + 噪点 + 风化白斑/苔斑 */
  if (_t.t) return _t.t; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2301), x, y, i;
  g.fillStyle = '#565c66'; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 20) { var gr = g.createLinearGradient(x, 0, x + 20, 0); gr.addColorStop(0, 'rgba(214,220,232,0.5)'); gr.addColorStop(0.4, 'rgba(130,136,148,0.12)'); gr.addColorStop(0.62, 'rgba(8,10,14,0.6)'); gr.addColorStop(1, 'rgba(8,10,14,0.32)'); g.fillStyle = gr; g.fillRect(x, 0, 20, S); g.fillStyle = 'rgba(232,238,248,0.4)'; g.fillRect(x, 0, 2, S); }
  for (y = 5; y < S; y += 17) { g.fillStyle = 'rgba(12,14,18,0.48)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(225,230,240,0.22)'; g.fillRect(0, y + 2, S, 1); }
  for (i = 0; i < 46; i++) { g.fillStyle = R() > 0.5 ? 'rgba(12,14,18,0.3)' : 'rgba(235,238,242,0.26)'; g.fillRect(R() * S, R() * S, 2, 2); }
  for (i = 0; i < 12; i++) { g.fillStyle = R() > 0.55 ? 'rgba(226,232,240,0.2)' : 'rgba(58,78,48,0.18)'; g.beginPath(); g.arc(R() * S, R() * S, 3 + R() * 7, 0, PI * 2); g.fill(); }
  return (_t.t = TX(c));
}
function texWall() { /* 粉墙：细粒噪 + 风化斑 + 发丝裂纹 + 墙脚返潮渐变 */
  if (_t.w) return _t.w; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2302), i, x0, y0;
  g.fillStyle = '#f0eee8'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 240; i++) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,0.2)' : 'rgba(96,100,96,0.08)'; g.fillRect(R() * S, R() * S, 1, 1); }
  for (i = 0; i < 26; i++) { g.fillStyle = R() > 0.5 ? 'rgba(148,144,134,0.12)' : 'rgba(120,126,118,0.1)'; g.beginPath(); g.arc(R() * S, R() * S, 5 + R() * 16, 0, PI * 2); g.fill(); }
  for (i = 0; i < 3; i++) { x0 = R() * S; y0 = R() * S * 0.7; g.strokeStyle = 'rgba(110,112,106,0.3)'; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + (R() - 0.5) * 10, y0 + 8 + R() * 14); g.lineTo(x0 + (R() - 0.5) * 16, y0 + 20 + R() * 18); g.stroke(); }
  var gr = g.createLinearGradient(0, S, 0, S - 26); gr.addColorStop(0, 'rgba(84,86,80,0.42)'); gr.addColorStop(1, 'rgba(84,86,80,0)'); g.fillStyle = gr; g.fillRect(0, S - 26, S, 26);
  return (_t.w = TX(c));
}
function texStone() { /* 条石：错缝双线（落影+倒角高光）+ 块内明度扰动 + 风化斑 */
  if (_t.s) return _t.s; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2303), x, y, i;
  g.fillStyle = '#e6e1d5'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 40) { g.fillStyle = 'rgba(255,255,255,' + (0.04 + R() * 0.08).toFixed(3) + ')'; g.fillRect(x + 2, y + 2, 38, 14); }
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(58,56,50,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(0, y + 2, S, 1);
    for (x = (y / 16) % 2 ? 0 : 20; x < S; x += 40) { g.fillStyle = 'rgba(58,56,50,0.5)'; g.fillRect(x, y, 2, 16); g.fillStyle = 'rgba(255,255,255,0.32)'; g.fillRect(x + 2, y, 1, 16); } }
  for (i = 0; i < 54; i++) { g.fillStyle = R() > 0.5 ? 'rgba(88,84,76,0.16)' : 'rgba(255,254,248,0.24)'; g.fillRect(R() * S, R() * S, 3 + R() * 8, 2 + R() * 3); }
  return (_t.s = TX(c));
}
function texWater() { /* 河面：建筑倒影竖向亮带 + 长波亮纹 + 细碎暗波 + 闪点；每实例新建（供 offset 漂移） */
  var S = 256, c = cv(S, S), g = c.getContext('2d'), R = lcg(2304), i;
  g.fillStyle = '#cfe0da'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 9; i++) { g.fillStyle = 'rgba(236,244,240,' + (0.1 + R() * 0.13).toFixed(3) + ')'; g.fillRect(R() * S, 0, 5 + R() * 14, S); }
  for (i = 0; i < 7; i++) { g.fillStyle = 'rgba(30,60,56,' + (0.08 + R() * 0.09).toFixed(3) + ')'; g.fillRect(R() * S, 0, 8 + R() * 18, S); }
  for (i = 0; i < 4; i++) { g.fillStyle = 'rgba(40,78,72,0.09)'; g.fillRect(R() * S, R() * S * 0.6, 30 + R() * 60, 14 + R() * 20); }
  for (i = 0; i < 90; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.14 + R() * 0.22).toFixed(3) + ')'; g.fillRect(R() * S, R() * S, 16 + R() * 60, 1.6); }
  for (i = 0; i < 80; i++) { g.fillStyle = 'rgba(26,52,48,' + (0.1 + R() * 0.12).toFixed(3) + ')'; g.fillRect(R() * S, R() * S, 8 + R() * 24, 1.2); }
  for (i = 0; i < 40; i++) { g.fillStyle = 'rgba(255,255,255,0.45)'; g.fillRect(R() * S, R() * S, 1.8, 1.8); }
  return TX(c);
}
function texWood() { /* 木板：分缝（落影+板口高光）+ 木纹丝 + 节疤 */
  if (_t.o) return _t.o; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2305), y, i, yy;
  g.fillStyle = '#d8c9b4'; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) { g.fillStyle = 'rgba(56,40,24,0.5)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,244,224,0.3)'; g.fillRect(0, y + 2, S, 1);
    for (i = 0; i < 7; i++) { yy = y + 4 + R() * 10; g.strokeStyle = 'rgba(96,72,44,' + (0.1 + R() * 0.14).toFixed(3) + ')'; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(40, yy + (R() - 0.5) * 4, 88, yy + (R() - 0.5) * 4, S, yy + (R() - 0.5) * 2); g.stroke(); } }
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(74,52,30,0.4)'; g.fillRect(R() * S, R() * S, 4, 2); }
  return (_t.o = TX(c));
}
function texLeaf() { /* 树冠叶斑：多层明暗叶簇 + 枝隙暗斑 */
  if (_t.l) return _t.l; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2306), i, v;
  g.fillStyle = '#7a985a'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 150; i++) { v = R(); g.fillStyle = v < 0.4 ? 'rgba(38,66,28,0.5)' : v < 0.7 ? 'rgba(146,184,96,0.5)' : v < 0.9 ? 'rgba(200,220,140,0.4)' : 'rgba(24,40,18,0.55)'; g.fillRect(R() * S, R() * S, 3 + R() * 10, 2 + R() * 7); }
  return (_t.l = TX(c));
}
function texEave() { /* 檐口椽头：暗封板 + 等距圆椽头（竖向通高，任意 v 偏移不破形） */
  if (_t.e) return _t.e; var c = cv(64, 16), g = c.getContext('2d'), x;
  g.fillStyle = '#463d33'; g.fillRect(0, 0, 64, 16);
  for (x = 0; x < 64; x += 8) { g.fillStyle = '#9a8666'; g.fillRect(x + 1.5, 0, 5, 16); g.fillStyle = 'rgba(255,240,210,0.35)'; g.fillRect(x + 2, 0, 1.5, 16); g.fillStyle = 'rgba(0,0,0,0.45)'; g.fillRect(x + 6, 0, 1, 16); }
  return (_t.e = TX(c));
}
function signTex(txt, bg, fg) { var c = cv(256, 64), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",serif'; g.fillText(txt, 128, 34); return TX(c); }
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；UV 按世界尺寸烘焙 ---- */
var BK;
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function boxUV(g, s, sv) { /* 面法线选投影平面，UV=世界坐标/米 → 每 s 米一重复（sv 可单独指定纵向） */
  var p = g.attributes.position, n = g.attributes.normal, a = new Float32Array(p.count * 2), i; sv = sv || s;
  for (i = 0; i < p.count; i++) { var nx = Math.abs(n.getX(i)), ny = Math.abs(n.getY(i)), nz = Math.abs(n.getZ(i));
    if (nx >= ny && nx >= nz) { a[i * 2] = p.getZ(i) / s; a[i * 2 + 1] = p.getY(i) / sv; }
    else if (ny >= nz) { a[i * 2] = p.getX(i) / s; a[i * 2 + 1] = p.getZ(i) / sv; }
    else { a[i * 2] = p.getX(i) / s; a[i * 2 + 1] = p.getY(i) / sv; } }
  g.setAttribute('uv', new THREE.BufferAttribute(a, 2)); return g;
}
function uvD(g, s) { var a = g.attributes.uv, i; if (a) for (i = 0; i < a.count; i++) a.setXY(i, a.getX(i) / s, a.getY(i) / s); return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz, s, sv) { put(m, xf(boxUV(new THREE.BoxGeometry(w, h, d), s || 0.5, sv), x, y, z, rx || 0, ry || 0, rz || 0)); }
function Y(m, r1, r2, h, x, y, z, seg) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, seg || 12), x, y, z)); }
function EX(m, sh, d, x, y, z, ry, s) { put(m, xf(uvD(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 12 }), s || 0.5), x, y, z, 0, ry || 0, 0)); }
function TRI(m, b, h, t, x, y, z) { var s = new THREE.Shape(); s.moveTo(-b / 2, 0); s.lineTo(b / 2, 0); s.lineTo(0, h); s.closePath(); EX(m, s, t, x, y, z, PI / 2, 0.6); } /* 白山墙三角 */
var _cg = {};
function canGeo(r, seed) { /* 树冠：16×12 球 sin 域确定性形变（接缝/极点无裂） */
  var key = r.toFixed(3) + '_' + seed; if (_cg[key]) return _cg[key];
  var g = new THREE.SphereGeometry(r, 16, 12), p = g.attributes.position, i;
  var s1 = (seed % 7) * 1.31, s2 = (seed % 11) * 0.87, s3 = (seed % 13) * 2.1;
  for (i = 0; i < p.count; i++) { var x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    var f = 1 + 0.11 * Math.sin(3.1 * x / r + s1) * Math.cos(2.7 * y / r + s2) + 0.07 * Math.sin(4.3 * z / r + s3);
    var yy = y < -r * 0.4 ? -r * 0.4 + (y + r * 0.4) * 0.6 : y;
    p.setXYZ(i, x * f, yy * f, z * f); }
  g.computeVertexNormals(); return (_cg[key] = g);
}
function SP(m, r, x, y, z, sx, sy, sz, seed) { put(m, xf(canGeo(r, seed || 3).clone(), x, y, z, 0, 0, 0, sx, sy, sz)); } /* 缓存几何须 clone 再变换 */
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
function tree(A, x, z, r, willow, full) { /* 香樟/垂柳：柳冠拉长下垂 */
  Y(A.trunk, r * 0.12, r * 0.2, r * 2.3, x, r * 1.15, z);
  if (willow) { SP(A.leaf, r, x, r * 2.55, z, 1.05, 1.5, 1.05, 3); SP(A.leaf2, r * 0.6, x + r * 0.75, r * 2.0, z + r * 0.2, 1, 1.9, 1, 5); if (full) SP(A.leaf2, r * 0.55, x - r * 0.7, r * 1.95, z - r * 0.25, 1, 1.8, 1, 7); }
  else { SP(A.leaf, r, x, r * 2.75, z, 1, 1.12, 1, 3); SP(A.leaf2, r * 0.7, x + r * 0.45, r * 3.1, z + r * 0.2, 1, 1, 1, 5); if (full) SP(A.leaf, r * 0.55, x - r * 0.5, r * 2.6, z - r * 0.3, 1, 1, 1, 7); }
}
function winF(A, x, y, z, w, h, lit) { /* 临河木框格窗：玻璃+竖格心+四框+窗台+（lv3+ 暖光芯） */
  B(A.glass, w, h, 0.012, x, y, z + 0.006); if (lit) B(A.glow, w - 0.02, h - 0.02, 0.006, x, y, z + 0.001);
  B(A.woodD, w + 0.04, 0.022, 0.026, x, y + h / 2 + 0.011, z + 0.01); B(A.woodD, w + 0.04, 0.022, 0.026, x, y - h / 2 - 0.011, z + 0.01);
  B(A.woodD, 0.022, h, 0.026, x - w / 2 - 0.011, y, z + 0.01); B(A.woodD, 0.022, h, 0.026, x + w / 2 + 0.011, y, z + 0.01);
  B(A.woodD, 0.014, h, 0.02, x, y, z + 0.012);
  B(A.stone, w + 0.06, 0.016, 0.04, x, y - h / 2 - 0.03, z + 0.014);
}
function winP(A, x, y, z, w, h) { /* 背立面小窗 */
  B(A.woodD, w, h, 0.012, x, y, z + 0.006); B(A.stone, w + 0.04, 0.014, 0.03, x, y - h / 2 - 0.026, z + 0.012);
}
function balc(A, x, y, z, w) { /* 二层木栏杆阳台 */
  var n = Math.max(3, Math.round(w / 0.11)), i;
  B(A.wood, w, 0.018, 0.02, x, y + 0.09, z + 0.03); B(A.wood, w, 0.016, 0.018, x, y, z + 0.03);
  for (i = 0; i <= n; i++) B(A.woodD, 0.012, 0.09, 0.012, x - w / 2 + i * w / n, y + 0.045, z + 0.03);
}
function awnBox(m, x, y, z, w) { /* 布雨棚：外沿下倾斜面 + 垂幔 */
  B(m, w, 0.014, 0.18, x, y, z + 0.08, 0.45); B(m, w, 0.05, 0.012, x, y - 0.064, z + 0.158);
}
function skyl(A, x, y, z) { /* 屋面天窗（顺前坡倾斜） */
  B(A.woodD, 0.14, 0.014, 0.12, x, y + 0.008, z, 0.54, 0, 0); B(A.glass, 0.12, 0.012, 0.1, x, y + 0.02, z, 0.54, 0, 0);
}
function lantern(A, x, y, z, gold) { /* 红灯笼：挂杆+灯体+上下盖（lv3+ 金盖） */
  B(A.dark, 0.007, 0.036, 0.007, x, y + 0.052, z);
  Y(A.lan, 0.03, 0.036, 0.056, x, y, z);
  B(gold ? A.gold : A.wood, 0.026, 0.01, 0.026, x, y + 0.032, z); B(A.wood, 0.022, 0.008, 0.022, x, y - 0.032, z);
}
function lampP(A, x, z) { /* 古典街灯：座+杆+托+发光灯头 */
  Y(A.steel, 0.028, 0.034, 0.02, x, 0.08, z); Y(A.steel, 0.008, 0.013, 0.4, x, 0.29, z);
  B(A.steel, 0.05, 0.014, 0.05, x, 0.5, z); B(A.lamp, 0.034, 0.042, 0.034, x, 0.468, z);
}
function acU(A, x, y, z) { /* 空调外机：壳+格栅面+支架 */
  B(A.steel, 0.11, 0.07, 0.042, x, y, z); B(A.dark, 0.09, 0.05, 0.01, x, y, z + 0.022);
  B(A.steel, 0.014, 0.05, 0.03, x - 0.042, y - 0.05, z - 0.005); B(A.steel, 0.014, 0.05, 0.03, x + 0.042, y - 0.05, z - 0.005);
}
function boat(A, x, z, cvd) { /* 木船 / 带篷画舫 */
  B(A.boat, 0.6, 0.055, 0.18, x, 0.055, z); B(A.boat, 0.11, 0.11, 0.15, x - 0.29, 0.08, z); B(A.boat, 0.1, 0.09, 0.14, x + 0.29, 0.075, z);
  B(A.dark, 0.5, 0.014, 0.14, x, 0.09, z);
  if (cvd) { put(A.canopyM, xf(new THREE.CylinderGeometry(0.095, 0.095, 0.36, 12, 1, false, -PI / 2, PI), 0, 0, 0, -PI / 2, 0, 0).applyMatrix4(new THREE.Matrix4().makeTranslation(x, 0.17, z)));
    Y(A.wood, 0.008, 0.008, 0.1, x - 0.16, 0.12, z); Y(A.wood, 0.008, 0.008, 0.1, x + 0.16, 0.12, z); }
  else { B(A.canopyM, 0.2, 0.02, 0.12, x + 0.02, 0.1, z); B(A.wood, 0.012, 0.012, 0.3, x - 0.2, 0.13, z + 0.06, 0.5, 0, 0); } /* 敞船：货箱 + 船桨 */
}
function quaySteps(A, x) { /* 河埠头：下河石阶 4 级 */
  B(A.stone, 0.34, 0.026, 0.09, x, 0.062, -0.005); B(A.stone, 0.34, 0.024, 0.09, x, 0.05, 0.075);
  B(A.stone, 0.34, 0.022, 0.09, x, 0.038, 0.155); B(A.stone, 0.34, 0.02, 0.1, x, 0.026, 0.24);
}
function planter(A, x, z, seed) { /* 木花箱 + 灌木 */
  B(A.woodD, 0.16, 0.07, 0.09, x, 0.09, z); B(A.wood, 0.15, 0.05, 0.08, x, 0.105, z); SP(A.leaf, 0.045, x, 0.16, z, 1.5, 0.8, 1, seed);
}
function cafe(A, x, z) { /* 外摆圆桌 + 双凳 */
  Y(A.steel, 0.06, 0.06, 0.012, x, 0.2, z); Y(A.steel, 0.008, 0.008, 0.14, x, 0.125, z);
  Y(A.wood, 0.03, 0.03, 0.012, x + 0.1, 0.14, z + 0.03); Y(A.wood, 0.03, 0.03, 0.012, x - 0.09, 0.14, z - 0.04);
}
function rails(A, z, L, gap0, gap1) { /* 石栏望柱列（桥头留口）；lv1 素石矮墙 */
  var k, px, qx;
  if (L === 1) { B(A.stone, 2.6, 0.04, 0.03, 0, 0.095, z); return; }
  for (k = 0; k < 16; k++) { px = -1.24 + k * 0.1653; if (px > gap0 && px < gap1) continue;
    B(A.rail, 0.026, 0.12, 0.026, px, 0.125, z);
    if (k < 15) { qx = px + 0.0827; if (qx > gap0 && qx < gap1) continue; B(A.rail, 0.165, 0.022, 0.02, qx, 0.182, z); B(A.rail, 0.165, 0.014, 0.014, qx, 0.088, z); } }
}
function house(A, L, x, w, z, d, h, mt, front, flat) { /* 枕河人家：粉墙+石基+棱柱瓦顶+正脊/脊吻/马头墙+ storefront */
  var zf = z + d / 2, bd = d + 0.14, rise = bd / 2 * 0.6, i, k, n, xk;
  B(A.wall, w, h, d, x, h / 2, z); B(A.base, w + 0.04, 0.07, d + 0.03, x, 0.035, z);
  if (flat) { /* 平顶露台：女儿墙 */
    B(A.wall, w + 0.03, 0.05, 0.035, x, h + 0.025, zf); B(A.wall, w + 0.03, 0.05, 0.035, x, h + 0.025, z - d / 2);
    B(A.wall, 0.035, 0.05, d, x - w / 2 - 0.012, h + 0.025, z); B(A.wall, 0.035, 0.05, d, x + w / 2 + 0.012, h + 0.025, z);
  } else {
    var rs = new THREE.Shape(); rs.moveTo(-bd / 2, 0); rs.lineTo(bd / 2, 0); rs.lineTo(0, rise); rs.closePath();
    EX(A.roof, rs, w + 0.1, x - (w + 0.1) / 2, h, z, PI / 2, 0.7);
    B(A.ridge, w + 0.1, 0.028, 0.05, x, h + rise + 0.006, z);
    for (i = -1; i <= 1; i += 2) {
      B(A.ridge, 0.032, 0.055, 0.032, x + i * (w / 2 + 0.045), h + rise + 0.012, z); /* 脊吻 */
      TRI(A.wall, bd - 0.06, rise - 0.01, 0.018, i < 0 ? x - w / 2 - 0.001 : x + w / 2 - 0.017, h + 0.004, z); /* 白山墙 */
      for (k = 0; k < mt; k++) { /* 马头墙：阶梯收分 + 瓦压顶 */
        var tt = h + rise * (1.25 - (mt - 1 - k) * 0.5) + 0.02, tw = bd * (1 - 0.3 * k), th = 0.028 + k * 0.012, xo = w / 2 + 0.02 + k * 0.007;
        B(A.wall, th, tt, tw, x + i * xo, tt / 2, z); B(A.ridge, th + 0.05, 0.024, tw + 0.03, x + i * xo, tt + 0.008, z);
      }
    }
  }
  if (!front) { /* 后两排背立面 */
    n = Math.max(2, Math.round(w / 0.2));
    for (i = 0; i < n; i++) { xk = x - w / 2 + (i + 0.5) * w / n; winP(A, xk, h * 0.62, zf, 0.1, 0.11); if (L >= 3 && i % 2) winP(A, xk, h * 0.3, zf, 0.09, 0.1); }
    return;
  }
  B(A.eave, w + 0.06, 0.032, 0.018, x, h + 0.012, zf + 0.062, 0, 0, 0, 0.5, 0.032); /* 檐口封板（椽头纹理） */
  n = Math.max(2, Math.round(w / 0.17));
  for (i = 0; i < n; i++) { xk = x - w / 2 + (i + 0.5) * w / n; winF(A, xk, h * 0.72, zf, 0.12, 0.13, L >= 3); }
  if (L >= 2) balc(A, x, h * 0.47, zf, w * 0.72);
  if (L === 1) { B(A.wood, w * 0.86, 0.26, 0.02, x - w * 0.05, 0.2, zf + 0.006); B(A.dark, 0.13, 0.25, 0.026, x + w * 0.3, 0.195, zf + 0.008); B(A.woodD, w * 0.9, 0.03, 0.03, x, 0.345, zf + 0.012);
    for (i = 0; i < 3; i++) B(A.woodD, 0.02, 0.26, 0.028, x - w * 0.42 + i * w * 0.28, 0.2, zf + 0.012); B(A.wood, w * 0.5, 0.05, 0.02, x - w * 0.08, 0.4, zf + 0.008); }
  else if (L === 2) { B(A.glow, w * 0.4, 0.24, 0.008, x - w * 0.2, 0.2, zf + 0.004); B(A.glass, w * 0.42, 0.25, 0.014, x - w * 0.2, 0.2, zf + 0.012); B(A.woodD, 0.12, 0.25, 0.024, x + w * 0.3, 0.195, zf + 0.008);
    B(A.woodD, w * 0.9, 0.03, 0.03, x, 0.345, zf + 0.012); B(A.woodD, 0.02, 0.26, 0.028, x + w * 0.05, 0.2, zf + 0.012); B(A.wood, w * 0.44, 0.05, 0.018, x - w * 0.2, 0.395, zf + 0.02); awnBox(A.awn, x - w * 0.18, 0.4, zf, w * 0.46); }
  else if (L === 3) { B(A.glow, w * 0.8, 0.26, 0.008, x, 0.2, zf + 0.004); for (i = 0; i < 7; i++) B(A.wood, 0.016, 0.26, 0.02, x - w * 0.36 + i * w * 0.12, 0.2, zf + 0.014); B(A.woodD, w * 0.8, 0.03, 0.03, x, 0.36, zf + 0.012); awnBox(A.awn, x, 0.42, zf, w * 0.8); }
  else { B(A.glow, w * 0.86, 0.3, 0.012, x, 0.215, zf + 0.006); B(A.steel, w * 0.9, 0.03, 0.03, x, 0.38, zf + 0.01); for (i = 0; i <= 4; i++) B(A.steel, 0.014, 0.3, 0.02, x - w * 0.43 + i * w * 0.215, 0.215, zf + 0.014); }
  var nl = L === 1 ? 2 : (L === 2 ? 3 : 4);
  for (i = 0; i < nl; i++) lantern(A, x - w * 0.36 + i * w * 0.72 / (nl - 1), h - 0.075, zf + 0.055, L >= 3);
}
function archProf() { /* 拱桥侧面轮廓：底边挖半圆拱 + 抛物线桥面 */
  var s = new THREE.Shape(); s.moveTo(-0.45, 0); s.lineTo(-0.2, 0); s.absarc(0, 0, 0.2, PI, 0, true); s.lineTo(0.45, 0); s.lineTo(0.45, 0.14);
  for (var i = 1; i <= 8; i++) { var t = 0.45 - i * 0.1125; s.lineTo(t, 0.5 - 0.36 * (t / 0.45) * (t / 0.45)); }
  s.closePath(); return s;
}
/* ---- 山塘街四年代 ---- */
function build(L) {
  var g = new THREE.Group(); g.name = 'prop_23_lv' + L; g.userData.kind = 'property'; g.userData.propIdx = 23; g.userData.level = L;
  BK = {}; var i, k, e, t, wat = texWater();
  var A = {
    water: MF(['#7f968c', '#7a9a90', '#759b94', '#6f9c96'][L - 1], { map: wat, rg: 0.12, mt: 0.45 }),
    quay: M('#a8a296', { map: texStone(), rg: 0.92 }), bank: M('#98917f', { map: texStone(), rg: 0.92 }),
    wall: M(L === 1 ? '#cdc7bb' : '#ece8df', { map: texWall(), rg: 0.9 }), base: M('#8f887a', { map: texStone(), rg: 0.94 }),
    roof: M('#e6eaf0', { map: texTile(), rg: 0.74 }), ridge: M('#7c828c', { map: texTile(), rg: 0.7 }),
    wood: M('#8a6c4c', { map: texWood(), rg: 0.72 }), woodD: M('#4c3a29', { rg: 0.78 }), dark: M('#2e3438', { rg: 0.9 }), gold: M('#c9a24e', { rg: 0.45, mt: 0.5 }),
    stone: M('#b5afa2', { map: texStone(), rg: 0.9 }), bstone: M('#d2ccbf', { map: texStone(), rg: 0.88 }),
    rail: M('#c9c3b4', { map: texStone(), rg: 0.9 }), eave: M('#ffffff', { map: texEave(), rg: 0.8 }),
    waterD: M('#5a7a74', { rg: 0.14, mt: 0.4 }),
    leaf: M('#ffffff', { map: texLeaf(), rg: 0.95, fs: false }), leaf2: M('#e4ecd0', { map: texLeaf(), rg: 0.95, fs: false }), trunk: M('#4f3f2c', { rg: 0.9 }),
    glass: M('#33404a', { rg: 0.12, mt: 0.55 }), sky: M('#b9cdd9', { rg: 0.08, mt: 0.4, op: 0.42 }),
    steel: M('#5f666d', { rg: 0.42, mt: 0.65 }), boat: M('#6b5138', { map: texWood(), rg: 0.65 }), canopyM: M('#e6dfcf', { rg: 0.85 }),
    solar: M('#24304e', { rg: 0.3, mt: 0.5 }), awn: M(['#a34a36', '#c0574a', '#7d3b31', '#2f3235'][L - 1], { rg: 0.9 }),
    lan: MF('#b8261f', { rg: 0.5, em: '#ff5a3c', ei: [0.25, 0.4, 0.55, 0.8][L - 1] }),
    glow: MF('#5a4a3a', { rg: 0.35, em: '#ffbe70', ei: L === 1 ? 0.12 : 0.4 }), lamp: MF('#ffe6b0', { rg: 0.3, em: '#ffd9a0', ei: 0.7 })
  };
  var signM = L >= 3 ? MF('#f2ead8', { map: signTex('山塘街', '#2b2f33', '#ffd98c'), em: '#ffcf8e', ei: L >= 4 ? 0.8 : 0.2, rg: 0.45 }) : null;
  var strip = L >= 4 ? MF('#3a2f28', { em: '#ffc27a', ei: 0.5, rg: 0.4 }) : null; /* 店招 / lv4 驳岸灯带 */
  /* 地面：街巷地坪(z -1.3..-0.04) + 河道(0.04 以下) + 对岸驳岸/步道(0.56..1.26)；UV 按世界尺寸烘焙 */
  B(A.quay, 2.6, 0.055, 1.26, 0, 0.0275, -0.67, 0, 0, 0, 0.42); B(A.stone, 2.6, 0.08, 0.05, 0, 0.04, -0.015);
  B(A.water, 2.6, 0.03, 0.6, 0, 0.015, 0.26, 0, 0, 0, 0.85); B(A.bank, 2.6, 0.1, 0.1, 0, 0.05, 0.61);
  B(A.waterD, 2.6, 0.012, 0.07, 0, 0.026, -0.005); B(A.waterD, 2.6, 0.012, 0.06, 0, 0.026, 0.53); /* 近岸暗水带（驳岸阴影） */
  B(A.quay, 2.6, 0.055, 0.6, 0, 0.0275, 0.96, 0, 0, 0, 0.42); B(A.stone, 2.6, 0.07, 0.05, 0, 0.035, 1.235);
  /* 临河栏：lv1 素石矮墙 / lv2+ 石栏望柱（桥头留口）；对岸同款 */
  rails(A, -0.02, L, -1.2, -0.7); rails(A, 1.235, L, 9, 10);
  if (L >= 4) B(strip, 2.4, 0.016, 0.014, 0, 0.045, -0.003); /* 驳岸夜灯带 */
  /* 石拱桥 bx=-0.95 跨河（跨 z -0.19..0.71，拱洞 r0.2，桥顶 0.5）+ 踏步 + 连续桥栏；桥头开放小广场 */
  var bx = -0.95, bz = 0.26, f = function (u) { return 0.5 - 0.36 * (u / 0.45) * (u / 0.45); };
  EX(A.bstone, archProf(), 0.36, bx - 0.18, 0, bz, PI / 2, 0.6);
  for (k = -4; k <= 4; k++) { t = k * 0.1; var yb = f(t);
    for (e = -1; e <= 1; e += 2) { B(A.rail, 0.03, 0.1, 0.03, bx + e * 0.155, yb + 0.045, bz + t);
      if (k < 4) { var y2 = f(t + 0.1), an = Math.atan2(y2 - yb, 0.1); B(A.rail, 0.02, 0.02, 0.108, bx + e * 0.155, (yb + y2) / 2 + 0.1, bz + t + 0.05, -an, 0, 0); } } }
  B(A.bstone, 0.36, 0.03, 0.1, bx, 0.125, bz - 0.5); B(A.bstone, 0.36, 0.024, 0.1, bx, 0.105, bz - 0.575);
  B(A.bstone, 0.36, 0.03, 0.1, bx, 0.125, bz + 0.5); B(A.bstone, 0.36, 0.024, 0.1, bx, 0.105, bz + 0.575);
  if (L >= 4) for (e = -1; e <= 1; e += 2) { B(A.lamp, 0.035, 0.035, 0.035, bx + e * 0.155, 0.56, bz); B(A.lamp, 0.03, 0.03, 0.03, bx + e * 0.155, 0.32, bz - 0.42); }
  quaySteps(A, 0.11); /* 河埠头 */
  /* 三排街屋：前排临河店屋 ×4（面河 +z）/ 中排 ×4（m3 为主角屋：lv3+ 平顶露台）/ 后排 ×3 */
  house(A, L, -0.46, 0.44, -0.4, 0.38, 0.56, 1, true, L >= 4); house(A, L, 0.0, 0.44, -0.4, 0.38, 0.5, 1, true);
  house(A, L, 0.47, 0.46, -0.4, 0.38, 0.6, 1, true); house(A, L, 0.97, 0.5, -0.4, 0.38, 0.62, 1, true);
  house(A, L, -0.96, 0.54, -0.78, 0.34, 0.66, 2, false); house(A, L, -0.4, 0.56, -0.78, 0.34, 0.6, 2, false);
  house(A, L, 0.2, 0.56, -0.78, 0.34, [0.72, 0.72, 0.84, 0.88][L - 1], 2, false, L >= 3);
  house(A, L, 0.86, 0.72, -0.78, 0.34, 0.64, 2, false);
  house(A, L, -0.9, 0.6, -1.1, 0.24, 0.56, 1, false); house(A, L, -0.2, 0.6, -1.1, 0.24, 0.64, 1, false); house(A, L, 0.62, 0.7, -1.1, 0.24, 0.52, 1, false);
  if (L === 2) { /* m3 屋顶小瓦亭 */
    var ps = new THREE.Shape(); ps.moveTo(-0.15, 0); ps.lineTo(0.15, 0); ps.lineTo(0, 0.05); ps.closePath();
    B(A.wall, 0.26, 0.13, 0.2, 0.2, 0.929, -0.78); EX(A.roof, ps, 0.3, 0.05, 0.994, -0.78, PI / 2, 0.55); B(A.ridge, 0.34, 0.02, 0.04, 0.2, 1.049, -0.78);
  }
  if (L >= 3) { /* m3 平顶：木平台 + 玻璃阳光房（透亮格构）+ 露台绿植 + 钢架 */
    var m3h = L === 4 ? 0.88 : 0.84, sh = L === 4 ? 0.3 : 0.24;
    B(A.wood, 0.5, 0.015, 0.3, 0.2, m3h + 0.008, -0.78);
    B(A.sky, 0.36, sh, 0.24, 0.2, m3h + 0.05 + sh / 2, -0.78);
    B(A.rail, 0.4, 0.015, 0.28, 0.2, m3h + 0.05 + sh + 0.007, -0.78);
    for (e = -1; e <= 1; e += 2) { B(A.rail, 0.014, sh, 0.014, 0.2 + e * 0.18, m3h + 0.05 + sh / 2, -0.655); B(A.rail, 0.014, sh, 0.014, 0.02, m3h + 0.05 + sh / 2, -0.78 + e * 0.115); }
    for (i = 0; i <= 3; i++) B(A.rail, 0.012, sh, 0.012, 0.02 + i * 0.12, m3h + 0.05 + sh / 2, -0.655);
    SP(A.leaf2, 0.05, -0.02, m3h + 0.07, -0.68, 1, 0.8, 1, 5); SP(A.leaf, 0.045, 0.42, m3h + 0.07, -0.68, 1, 0.8, 1, 7);
    if (L === 3) { for (i = 0; i < 4; i++) B(A.steel, 0.012, 0.12, 0.012, 0.02 + i * 0.12, m3h + 0.08, -0.655); B(A.steel, 0.5, 0.012, 0.012, 0.2, m3h + 0.14, -0.655); }
    skyl(A, -0.96, 0.732, -0.66); skyl(A, -0.4, 0.672, -0.66); /* 中排前坡天窗 */
  }
  if (L >= 4) { /* f1 平顶露台花架绿化 + m4 太阳能板阵 + f1 第二店招 + f2/f4 空调外机 + f2 竖幌 */
    for (k = 0; k < 5; k++) B(A.wood, 0.03, 0.02, 0.36, -0.6 + k * 0.07, 0.79, -0.4);
    for (e = -1; e <= 1; e += 2) { B(A.wood, 0.3, 0.02, 0.03, -0.46, 0.765, -0.4 + e * 0.15); Y(A.wood, 0.012, 0.012, 0.2, -0.46 + e * 0.13, 0.66, -0.4 + e * 0.13); }
    SP(A.leaf2, 0.055, -0.55, 0.83, -0.32, 1, 0.8, 1, 5); SP(A.leaf, 0.05, -0.37, 0.82, -0.48, 1, 0.75, 1, 7);
    for (k = 0; k < 3; k++) B(A.solar, 0.16, 0.012, 0.13, 0.68 + k * 0.18, 0.724, -0.66, 0.54, 0, 0);
    B(signM, 0.36, 0.09, 0.024, -0.46, 0.48, -0.193);
    acU(A, 0.0, 0.42, -0.196); acU(A, 0.97, 0.42, -0.196);
    B(A.awn, 0.05, 0.24, 0.012, 0.235, 0.42, -0.21);
  } else if (L === 3) { B(signM, 0.42, 0.1, 0.024, 0.47, 0.485, -0.193); acU(A, 0.0, 0.42, -0.196); }
  /* 树木：河街大树（桥东侧，不遮桥）+ 右前角 + 对岸行道树列逐年代增密（lv3+ 垂柳交替） */
  var cr = [0.13, 0.15, 0.17, 0.18][L - 1];
  tree(A, -0.86, -0.12, cr * 1.15, false, L >= 2); tree(A, 1.1, -0.1, cr * 0.85, false, L >= 2);
  tree(A, 0.3, 0.95, cr * 0.9, L >= 3, L >= 3);
  if (L >= 2) { tree(A, -0.9, 0.95, cr * 0.9, L >= 3, L >= 4); tree(A, -0.3, 0.95, cr * 0.9, false, true); tree(A, 0.95, 0.95, cr * 0.85, false, true); }
  if (L >= 3) { SP(A.leaf2, 0.06, 1.22, 0.12, 0.95, 1, 0.7, 1, 9); planter(A, 0.3, -0.12, 11); planter(A, 0.64, -0.12, 13); planter(A, -0.1, -0.12, 15); }
  if (L >= 4) { cafe(A, -1.15, -0.5); cafe(A, -1.14, -0.3); }
  if (L >= 2) { B(A.dark, 0.1, 0.008, 0.1, 1.1, 0.058, -0.1); B(A.dark, 0.12, 0.008, 0.12, -0.86, 0.058, -0.12); }
  if (L >= 2) { /* 对岸河房：矮坡顶小屋一段 + 两小窗 */
    var fs = new THREE.Shape(); fs.moveTo(-0.13, 0); fs.lineTo(0.13, 0); fs.lineTo(0, 0.07); fs.closePath();
    B(A.wall, 0.9, 0.2, 0.18, 0.6, 0.155, 1.12); EX(A.roof, fs, 0.96, 0.12, 0.255, 1.12, PI / 2, 0.7); B(A.ridge, 0.98, 0.02, 0.04, 0.6, 0.33, 1.12);
    winP(A, 0.35, 0.19, 1.21, 0.09, 0.08); winP(A, 0.85, 0.19, 1.21, 0.09, 0.08); B(A.woodD, 0.12, 0.14, 0.012, 0.6, 0.125, 1.216);
  }
  /* 街灯（lv2 1 盏 / lv3+ 河街 ×2 + 对岸 ×2）/ 河上木船（lv3，lv4 带篷画舫） */
  if (L >= 2) { lampP(A, 0.72, -0.09); if (L >= 3) { lampP(A, -0.32, -0.09); lampP(A, 0.15, 0.78); lampP(A, 0.8, 0.78); } }
  if (L >= 3) boat(A, 0.62, 0.3, false); if (L >= 4) boat(A, -0.02, 0.4, true);
  flush(g);
  var lan = A.lan, glow = A.glow, lamp = A.lamp, e0 = lan.emissiveIntensity;
  g.userData.anim = [function (tt) { lan.emissiveIntensity = e0 + 0.15 * (0.5 + 0.5 * Math.sin(tt * 1.7)); wat.offset.x = (tt * 0.02) % 1; wat.offset.y = (tt * 0.013) % 1; }]; /* 灯笼呼吸 + 水纹漂移 */
  if (L >= 2) g.userData.anim.push(function (tt) { var s = 0.5 + 0.5 * Math.sin(tt * 1.1);
    glow.emissiveIntensity = 0.3 + 0.2 * s; lamp.emissiveIntensity = 0.55 + 0.2 * s; if (signM) signM.emissiveIntensity = (L >= 4 ? 0.6 : 0.12) + 0.2 * s; if (strip) strip.emissiveIntensity = 0.4 + 0.25 * s; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[23] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
