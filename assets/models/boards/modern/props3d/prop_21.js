/* 大富翁·现代写实棋盘（苏）格 21「平江路」—— 苏州水乡：窄巷侧河 / 小石拱桥 / 双层枕河街屋 / 评弹馆，四年代演进
 * 契约：window.Props3DModern[21](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z（河埠头广场在前）；
 * 构图与格 23 山塘街差异化：河道沿 +X 侧纵贯（窄巷贴河）、双排枕河民居朝巷开门、小拱桥跨河居中前段、对岸细堤垂柳、无木船。每级 mesh ≤55（合并 BufferGeometry）；Canvas ≤256；零 Math.random；动画 ≤2。
 * 年代特征：lv1 斑驳灰白墙+素青瓦+素石驳岸+小拱桥+木板门 → lv2 粉刷白墙+披屋+绿布篷+河埠头石阶+望柱条栏+灯笼+评弹馆匾额+缆桩 → lv3 木格栅+白伞咖啡座+花箱+街灯+露台木架+天窗 → lv4 玻璃茶室暖光+屋顶玻璃亭+桥头灯柱+垂柳最茂+发光店招+水岸茶幌+光伏板
 * R1 精修（对照 refs/modern/prop_21.png 四象限）：①树冠由球团改柳形三层垂枝+斜枝，收窄横向占比 ②屋面两片直坡改三段凹曲+封檐板+四角翘+脊端收头 ③马头墙加高、盖顶出挑、端头座头 ④前排改双层街屋：层间腰檐+2F 格窗排+木栏杆阳台 ⑤窗改「窗洞+格芯+边梃+石窗台」组件 ⑥两岸直立驳岸壁+顶帽石+缆桩+多组下河踏步+岸线湿渍 ⑦拱桥加分步桥面+券脸贯石带+两端踏步引道 ⑧屋顶逐年代杂物（烟囱/水箱空调/天窗/光伏）⑨大块石板广场+长凳
 * R2 精修：柳冠下移拉长垂枝（主冠 3.1r 高 1.4 倍椭球 + 三层垂枝伸向河面）、斜枝改锚在顶帽石内侧（占地严守 2.6）、水色去饱和为灰绿、店面暖光按年代 .12/.22/.30/.40 递进、马头墙盖顶加宽出挑、匾额提亮；lv1 简窗/双灯笼控三角 ≤9k
 * R3 精修：垂枝加大加密（0.5r 椭球 sy 1.6）贴近水面；宽屋（评弹馆/中排大屋）-z 山墙加两组格窗（对街可见）；四级 bbox 2.600×2.600 · H .993/1.038/1.163/1.308 · mesh 14/19/22/23 · tris 7.9k/11.6k/13.0k/13.7k
 * 材质工艺（对标 specials3d/tile29_water.js）：贴图材质 color=白 + userData.previewColor 记录主色（overlay 语义）；多层 Canvas（底色/噪点/风化/分缝/高光/雨渍/麻点）；
 *   灯笼·匾额·橱窗·茶幌 emissiveMap；水面低粗糙高金属反光；瓦/粉墙/条石/木构/树皮分区 roughness；boxUV 世界尺寸烘焙。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_21] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
var _mc = {};
function M(h, o) { /* 静态材质（缓存）：有 map 时 color=白、previewColor=h（预览/审计取主色） */
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + (o.map ? o.map.uuid : '') + '|' + (o.op || '');
  if (_mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(o.map ? '#ffffff' : h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.map) { m.map = o.map; m.userData.previewColor = h; } if (o.op) { m.transparent = true; m.opacity = o.op; }
  return (_mc[k] = m);
}
function MF(h, o) { /* 动画/发光材质：每次全新实例；emap=emissiveMap */
  o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; } if (o.map) m.map = o.map; if (o.emap) m.emissiveMap = o.emap; return m;
}
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
var _t = {};
function texTile(h) { /* 小青瓦六层：底色 → 垄沟/压边 → 搭接横缝+缝下高光 → 整瓦明暗 → 噪点 → 檐口苔痕+雨渍竖痕 */
  var k = 't' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2101), x, y, i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 12) { g.fillStyle = 'rgba(255,255,255,0.16)'; g.fillRect(x + 1, 0, 2, S); g.fillStyle = 'rgba(10,12,16,0.5)'; g.fillRect(x + 5, 0, 4, S); g.fillStyle = 'rgba(10,12,16,0.35)'; g.fillRect(x + 11, 0, 1, S); }
  for (y = 8; y < S; y += 18) { g.fillStyle = 'rgba(10,12,16,0.4)'; g.fillRect(0, y, S, 2); g.fillStyle = 'rgba(255,255,255,0.08)'; g.fillRect(0, y + 2, S, 1); }
  for (i = 0; i < 30; i++) { g.fillStyle = R() > 0.5 ? 'rgba(240,242,244,0.09)' : 'rgba(8,10,12,0.12)'; g.fillRect(Math.floor(R() * 11) * 12 + 1, Math.floor(R() * 7) * 18 + 10, 10, 16); g.fillStyle = R() > 0.5 ? 'rgba(8,10,12,0.3)' : 'rgba(230,232,228,0.22)'; g.fillRect(R() * S, R() * S, 2, 2); g.fillRect(R() * S, R() * S, 2, 2); }
  for (i = 0; i < 16; i++) { g.fillStyle = 'rgba(78,98,58,' + (0.1 + R() * 0.16) + ')'; g.fillRect(R() * S, S - 8 - R() * 26, 3 + R() * 9, 2 + R() * 4); g.fillStyle = 'rgba(30,34,40,0.18)'; g.fillRect(R() * S, R() * 30, 2, 8 + R() * 20); }
  return (_t[k] = TX(c));
}
function texWall(h) { /* 粉墙六层：底色 → 斑驳灰块 → 雨渍竖痕 → 裂纹折线 → 墙脚水渍+苔点 → 高光颗粒 */
  var k = 'w' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2102), i, j, px, py;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (i = 0; i < 70; i++) { g.fillStyle = R() > 0.6 ? 'rgba(110,108,100,0.12)' : 'rgba(90,95,88,0.08)'; g.beginPath(); g.arc(R() * S, R() * S, 4 + R() * 14, 0, PI * 2); g.fill(); }
  for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(70,72,66,' + (0.05 + R() * 0.08) + ')'; g.fillRect(R() * S, 0, 1 + R() * 2, 20 + R() * 70); }
  g.strokeStyle = 'rgba(60,58,52,0.25)'; g.lineWidth = 1; for (i = 0; i < 5; i++) { px = R() * S; py = R() * S; g.beginPath(); g.moveTo(px, py); for (j = 0; j < 4; j++) { px += (R() - 0.5) * 18; py += 4 + R() * 10; g.lineTo(px, py); } g.stroke(); }
  g.fillStyle = 'rgba(70,72,68,0.2)'; g.fillRect(0, S - 14, S, 14); for (i = 0; i < 12; i++) { g.fillStyle = 'rgba(80,100,60,' + (0.1 + R() * 0.15) + ')'; g.fillRect(R() * S, S - 16 + R() * 12, 3 + R() * 6, 2 + R() * 3); g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(R() * S, R() * S, 1, 1); g.fillRect(R() * S, R() * S, 1, 1); g.fillRect(R() * S, R() * S, 1, 1); }
  return (_t[k] = TX(c));
}
function texStone(h) { /* 条石六层：底色 → 整石明暗 → 错缝勾缝 → 上沿磨光高光 → 麻点 → 缝隙泥渍 */
  var k = 's' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2103), x, y, i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) { var off = (y / 16) % 2 ? 0 : 20; for (x = off - 40; x < S; x += 40) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,' + (0.03 + R() * 0.07) + ')' : 'rgba(40,38,34,' + (0.03 + R() * 0.07) + ')'; g.fillRect(x, y, 40, 16); }
    g.fillStyle = 'rgba(60,58,52,0.35)'; g.fillRect(0, y, S, 2); for (x = off; x < S; x += 40) g.fillRect(x, y, 2, 16); g.fillStyle = 'rgba(255,255,255,0.12)'; g.fillRect(0, y + 2, S, 1); }
  for (i = 0; i < 60; i++) { g.fillStyle = R() > 0.5 ? 'rgba(80,78,70,0.15)' : 'rgba(255,253,245,0.2)'; g.fillRect(R() * S, R() * S, 4 + R() * 8, 3); if (i < 20) { g.fillStyle = 'rgba(50,48,42,' + (0.08 + R() * 0.12) + ')'; g.fillRect(R() * S, Math.floor(R() * 8) * 16 + 2, 2, 3 + R() * 6); } }
  return (_t[k] = TX(c));
}
function texWater(h) { /* 河面五层：底色 → 暗色涡区 → 细波长纹 → 碎波高光 → 微噪 */
  var k = 'a' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2104), i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (i = 0; i < 10; i++) { g.fillStyle = 'rgba(20,40,38,' + (0.06 + R() * 0.1) + ')'; g.beginPath(); g.ellipse(R() * S, R() * S, 10 + R() * 22, 4 + R() * 8, 0, 0, PI * 2); g.fill(); }
  for (i = 0; i < 90; i++) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,0.16)' : 'rgba(30,50,48,0.14)'; g.fillRect(R() * S, R() * S, 10 + R() * 30, 1.5); if (i < 30) { g.fillStyle = 'rgba(235,245,240,' + (0.2 + R() * 0.3) + ')'; g.fillRect(R() * S, R() * S, 2 + R() * 5, 1); } }
  return (_t[k] = TX(c));
}
function texWood(h) { /* 木构五层：底色 → 木纹长线 → 顺纹高光 → 节疤 → 风化灰化 */
  var k = 'd' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(2105), i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (i = 0; i < 40; i++) { g.fillStyle = 'rgba(40,24,10,' + (0.08 + R() * 0.18) + ')'; g.fillRect(0, R() * S, S, 1 + R() * 2); g.fillStyle = 'rgba(255,240,210,0.12)'; g.fillRect(0, R() * S, S, 1); }
  g.strokeStyle = 'rgba(40,24,10,0.35)'; g.lineWidth = 1; for (i = 0; i < 20; i++) { if (i < 4) { g.beginPath(); g.ellipse(R() * S, R() * S, 3 + R() * 4, 2 + R() * 3, 0, 0, PI * 2); g.stroke(); } g.fillStyle = 'rgba(200,200,190,0.1)'; g.fillRect(R() * S, R() * S, 8 + R() * 20, 1 + R() * 2); }
  return (_t[k] = TX(c));
}
function texLan() { /* 灯笼：竹骨竖棱 + 上下金箍 + 中部高光（map 与 emissiveMap 共用） */ if (_t.l) return _t.l; var c = cv(64, 64), g = c.getContext('2d'), i; g.fillStyle = '#f0e6dc'; g.fillRect(0, 0, 64, 64); for (i = 0; i < 64; i += 8) { g.fillStyle = 'rgba(60,20,10,0.35)'; g.fillRect(i, 0, 2, 64); } g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(0, 24, 64, 14); g.fillStyle = '#c9a24a'; g.fillRect(0, 0, 64, 6); g.fillRect(0, 58, 64, 6); return (_t.l = TX(c)); }
function texPane() { /* 暖光橱窗：木格窗棂分格（map 与 emissiveMap 共用） */ if (_t.p) return _t.p; var c = cv(64, 64), g = c.getContext('2d'), i; g.fillStyle = '#f4ead8'; g.fillRect(0, 0, 64, 64); g.fillStyle = 'rgba(50,30,15,0.85)'; for (i = 0; i <= 64; i += 16) { g.fillRect(i - 1, 0, 3, 64); g.fillRect(0, i - 1, 64, 3); } return (_t.p = TX(c)); }
function texBan() { /* 「水岸」茶幌：垂幡底+金边+竖排字（map 与 emissiveMap 共用） */ if (_t.b) return _t.b; var c = cv(64, 256), g = c.getContext('2d');
  g.fillStyle = '#7a2620'; g.fillRect(0, 0, 64, 256); g.fillStyle = 'rgba(255,255,255,0.09)'; g.fillRect(0, 0, 18, 256); g.fillStyle = 'rgba(20,8,6,0.3)'; g.fillRect(52, 0, 12, 256);
  g.strokeStyle = '#e0bc74'; g.lineWidth = 5; g.strokeRect(6, 8, 52, 240);
  g.fillStyle = '#f5e6c8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 84px "Microsoft YaHei",serif'; g.fillText('水', 32, 76); g.fillText('岸', 32, 182);
  return (_t.b = TX(c)); }
function signTex(txt, bg, fg) { var c = cv(256, 64), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, 256, 20); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",serif'; g.fillText(txt, 128, 34); return TX(c); }
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；W = boxUV 世界尺寸烘焙（per=纹理世界周期） ---- */
var BK;
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function BU(g, w, h, d, per) { var uv = g.attributes.uv, fs = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], f, v, i; for (f = 0; f < 6; f++) for (v = 0; v < 4; v++) { i = f * 4 + v; uv.setXY(i, uv.getX(i) * fs[f][0] / per, uv.getY(i) * fs[f][1] / per); } return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function W(m, w, h, d, x, y, z, per, rx, ry, rz) { put(m, xf(BU(new THREE.BoxGeometry(w, h, d), w, h, d, per), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z, sx, sy, sz) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z, 0, 0, 0, sx || 1, sy || 1, sz || 1)); }
function EX(m, s, d, x, y, z, ry) { put(m, xf(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false, curveSegments: 10 }), x, y, z, 0, ry || 0, 0)); }
function TRI(m, b, h, t, x, y, z) { var s = new THREE.Shape(); s.moveTo(-b / 2, 0); s.lineTo(b / 2, 0); s.lineTo(0, h); s.closePath(); EX(m, s, t, x, y, z, 0); } /* 山墙三角：底边沿 x，厚度沿 +z */
function flush(g) { for (var k in BK) { var b = BK[k], gs = b.gs, P = 0, i;
  for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
  var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
  for (i = 0; i < gs.length; i++) { pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length; }
  var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
  var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms); } }
/* ---- 部件 ---- */
function tree(A, x, z, r, willow, lean, L) { /* 垂柳/香樟：柳冠三层垂枝收窄横幅；lean=临水柳冠向 -x 倾出河道 */
  Y(A.trunk, r * 0.08, r * 0.14, r * 3.1, 12, x, 0.06 + r * 1.55, z);
  Y(A.trunk, r * 0.04, r * 0.07, r * 0.8, 8, x + (lean ? -0.1 : 0.22) * r, 0.06 + r * 2.6, z + r * 0.1, 0, 0, lean ? 0.85 : 0.6);
  if (willow && lean) { O(A.leaf2, r * 0.75, x - 0.28 * r, 0.06 + r * 3.1, z, 0.72, 1.4, 0.78);
    O(A.leaf, r * 0.5, x - 0.58 * r, 0.06 + r * 2.4, z + r * 0.22, 0.66, 1.6, 0.68); if (L > 1) O(A.leaf, r * 0.46, x - 0.52 * r, 0.06 + r * 2.25, z - r * 0.24, 0.64, 1.65, 0.66);
    if (L > 1) O(A.leaf2, r * 0.36, x - 0.82 * r, 0.06 + r * 1.8, z, 0.52, 1.5, 0.52); }
  else if (willow) { O(A.leaf2, r * 0.75, x, 0.06 + r * 3.3, z, 0.75, 1.25, 0.72);
    O(A.leaf, r * 0.48, x + r * 0.5, 0.06 + r * 2.55, z + r * 0.26, 0.66, 1.6, 0.68); O(A.leaf, r * 0.46, x - r * 0.48, 0.06 + r * 2.4, z - r * 0.28, 0.64, 1.65, 0.66); }
  else { O(A.leaf, r * 0.72, x, 0.06 + r * 3.1, z, 0.82, 1.2, 0.82); O(A.leaf2, r * 0.42, x + r * 0.45, 0.06 + r * 3.45, z + r * 0.2, 0.7, 0.75, 0.7); O(A.leaf2, r * 0.38, x - r * 0.42, 0.06 + r * 3.3, z - r * 0.22, 0.7, 0.75, 0.7); }
}
function wins(A, x, y, zk, n, wz, core, simple) { /* +x 朝向窗排：窗洞+格芯+边梃上下横+石窗台（simple=lv1 简窗） */
  var i, e;
  for (i = 0; i < n; i++) { var z0 = zk - wz / 2 + (i + 0.5) * wz / n;
    B(A.dark, 0.014, 0.1, 0.062, x + 0.004, y, z0); B(core, 0.014, 0.084, 0.046, x + 0.011, y, z0);
    if (!simple) { for (e = -1; e <= 1; e += 2) B(A.wood, 0.012, 0.104, 0.011, x + 0.015, y, z0 + e * 0.028);
      B(A.wood, 0.012, 0.011, 0.068, x + 0.015, y + 0.05, z0); B(A.wood, 0.012, 0.011, 0.068, x + 0.015, y - 0.05, z0); }
    B(A.stone, 0.024, 0.013, 0.082, x + 0.02, y - 0.063, z0); }
}
function roofC(A, xc, z, w, d, h) { /* 三段凹曲两坡顶：坡面+封檐板+四角翘+正脊+脊端+山墙；返回脊高 R */
  var angs = d < 0.4 ? [0.5, 0.36, 0.24] : [0.64, 0.46, 0.3], am = (d / 2 + 0.05) / 3, eY = h - 0.016, cum = 0, k, e, sx;
  for (k = 0; k < 3; k++) { var rk = Math.tan(angs[k]) * am, mx = d / 2 + 0.05 - (k + 0.5) * am, ln = am / Math.cos(angs[k]) + 0.024;
    for (sx = -1; sx <= 1; sx += 2) W(A.roof, ln, 0.022, w + 0.08, xc + sx * mx, eY + cum + rk / 2, z, 0.35, 0, 0, -sx * angs[k]);
    cum += rk; }
  for (sx = -1; sx <= 1; sx += 2) { B(A.wood, 0.022, 0.032, w + 0.09, xc + sx * (d / 2 + 0.055), eY + 0.002, z);
    for (e = -1; e <= 1; e += 2) B(A.roof, 0.06, 0.015, 0.028, xc + sx * (d / 2 + 0.015), eY + 0.05, z + e * (w / 2 + 0.028), 0, 0, sx * 0.55); }
  Y(A.roof, 0.017, 0.021, w + 0.1, 8, xc, eY + cum + 0.006, z, PI / 2, 0, 0);
  for (e = -1; e <= 1; e += 2) B(A.roof, 0.034, 0.022, 0.024, xc, eY + cum + 0.022, z + e * (w / 2 + 0.03));
  for (e = -1; e <= 1; e += 2) TRI(A.wall, d + 0.02, cum, 0.02, xc, eY, z + e * (w / 2 - 0.01));
  return cum;
}
function roofF(A, xc, z, w, d, h) { /* 平顶：四面女儿墙压顶 */
  var x0 = xc - d / 2 - 0.01, x1 = xc + d / 2 + 0.01, z0 = z - w / 2 - 0.01, z1 = z + w / 2 + 0.01;
  B(A.wall, 0.03, 0.05, z1 - z0, x1, h + 0.025, z); B(A.wall, 0.03, 0.05, z1 - z0, x0, h + 0.025, z);
  B(A.wall, x1 - x0, 0.05, 0.03, xc, h + 0.025, z1); B(A.wall, x1 - x0, 0.05, 0.03, xc, h + 0.025, z0);
}
function house(A, L, xc, z, w, d, h, mt, front, two, flat, cf, noShop) { /* 枕河民居：粉墙+凹曲坡脊+马头墙；front=巷开门面；two=双层；noShop=lv4 茶室替门 */
  var i, e, k, wf = xc + d / 2, xb2 = xc - d / 2 - 0.006, h1 = two ? h * 0.55 : h * 0.62, sx;
  W(A.wall, d, h, w, xc, h / 2, z, 0.8);
  var R = 0;
  if (flat) roofF(A, xc, z, w, d, h); else R = roofC(A, xc, z, w, d, h);
  var eY = flat ? h : h - 0.016;
  if (two) { /* 层间腰檐木线 */
    B(A.wall, 0.026, 0.03, w + 0.03, wf, h1, z); W(A.roof, 0.1, 0.018, w + 0.05, wf + 0.03, h1 + 0.014, z, 0.35); }
  for (e = -1; e <= 1; e += 2) { /* 背水面（院/巷向）小窗 */
    B(A.dark, 0.014, 0.085, 0.06, xb2, h * 0.55, z + e * w * 0.22); B(A.wood, 0.02, 0.012, 0.066, xb2 - 0.012, h * 0.55 - 0.052, z + e * w * 0.22); }
  for (i = 0; i < mt; i++) for (e = -1; e <= 1; e += 2) { /* 马头墙：多级白墙+出挑盖顶+端头座头 */
    var tw = d * (1 - i * 0.4), th = eY + R * (0.6 + i * 0.42) + 0.05, ez = z + e * (w / 2 - 0.014);
    W(A.wall, tw, th, 0.05, xc, th / 2, ez, 0.8); W(A.roof, tw + 0.1, 0.026, 0.11, xc, th + 0.013, ez, 0.35);
    if (i === mt - 1) for (sx = -1; sx <= 1; sx += 2) B(A.roof, 0.042, 0.018, 0.104, xc + sx * (tw / 2 + 0.014), th + 0.026, ez, 0, 0, -sx * 0.4); }
  if (!front) { /* 巷向门+小窗排 */
    B(A.wood, 0.018, 0.24, 0.14, wf + 0.006, 0.14, z + (cf % 2 ? w * 0.22 : -w * 0.22));
    wins(A, wf, h * 0.6, z + (cf % 2 ? -w * 0.2 : w * 0.2), 2, w * 0.42, L >= 3 ? A.glass : A.wood, L < 2); }
  else {
    var dw = w * (L === 1 ? 0.55 : 0.4), zd = z + w * 0.18;
    if (noShop) { /* lv4 玻璃茶室占据门面（本体在 block21 内建） */ }
    else if (L === 1) { /* 板门+小板窗 */
      B(A.wood, 0.02, 0.3, dw, wf + 0.006, 0.16, zd);
      for (i = -1; i <= 1; i++) B(A.dark, 0.024, 0.26, 0.012, wf + 0.014, 0.16, zd + i * dw * 0.28);
      B(A.wood, 0.026, 0.016, dw, wf + 0.014, 0.24, zd);
      wins(A, wf, h1 * 0.62, z - w * 0.26, 1, 0.13, A.wood, 1); wins(A, wf, h1 * 0.62, z + w * 0.42, 1, 0.13, A.wood, 1); }
    else { /* 店面：暖光橱窗+木棂条+柜台+侧门 */
      var sw = w * 0.5;
      B(A.glow, 0.018, 0.2, sw, wf + 0.008, 0.17, zd - w * 0.05);
      for (i = -1; i <= 1; i++) B(A.wood, 0.024, 0.21, 0.016, wf + 0.014, 0.17, zd - w * 0.05 + i * sw * 0.33);
      B(A.wood, 0.026, 0.05, sw + 0.02, wf + 0.016, 0.055, zd - w * 0.05);
      B(A.wood, 0.02, 0.26, 0.05, wf + 0.006, 0.15, zd + w * 0.26); B(A.dark, 0.024, 0.22, 0.02, wf + 0.013, 0.14, zd + w * 0.26); }
    if (two) { /* 2F 格窗排+木栏杆阳台 */
      var wy = h1 + (h - h1) * 0.44, core = L >= 3 ? A.glass : A.wood;
      if (w > 0.55) { wins(A, wf, wy, z - w * 0.28, 1, 0.15, L >= 3 ? A.glow : A.wood, L < 2); wins(A, wf, wy, z + w * 0.28, 1, 0.15, L >= 3 ? A.glow : A.wood, L < 2); }
      else wins(A, wf, wy, z, Math.max(2, Math.round(w / 0.17)), w * 0.8, core, L < 2);
      var nb = Math.max(3, Math.round(w / 0.13));
      for (i = 0; i <= nb; i++) B(A.wood, 0.012, 0.08, 0.012, wf + 0.03, h1 + 0.045, z - w / 2 + i * w / nb);
      B(A.wood, 0.03, 0.014, w + 0.03, wf + 0.03, h1 + 0.088, z); B(A.wood, 0.03, 0.01, w + 0.03, wf + 0.03, h1 + 0.024, z); }
    if (L >= 2) { /* 绿布篷+垂幌（lv4 加米色幌） */
      var aw = w * 0.84;
      B(A.awn, 0.016, 0.11, aw, wf + 0.07, h1 + 0.02, z, 0, 0, -0.42);
      B(A.awn, 0.02, 0.03, aw, wf + 0.125, h1 - 0.012, z);
      B(A.awn, 0.012, 0.17, 0.1, wf + 0.05, h1 - 0.1, z + w * 0.42);
      if (L >= 4) B(A.umb, 0.012, 0.17, 0.1, wf + 0.05, h1 - 0.1, z - w * 0.42); }
    if (L >= 3) B(A.steel, 0.04, 0.032, 0.05, wf + 0.02, h1 - 0.08, z - w * 0.32); /* 外墙空调外机 */
  }
  if (w > 0.55 && mt > 0) for (i = 0; i < 2; i++) { var gy = h * (0.42 + i * 0.3); /* 山墙面格窗（-z 对街） */
    B(A.dark, 0.1, 0.085, 0.014, xc, gy, z - w / 2 - 0.018); B(A.wood, 0.11, 0.012, 0.02, xc, gy, z - w / 2 - 0.026);
    B(A.wood, 0.012, 0.09, 0.02, xc, gy, z - w / 2 - 0.026); }
  var nl = front ? (L === 1 ? 2 : (w > 0.55 ? 4 : 3)) : 0; /* 檐下红灯笼 */
  for (i = 0; i < nl; i++) { var lz = z - w / 2 + (i + 0.5) * w / nl;
    B(A.dark, 0.006, 0.024, 0.006, wf + 0.03, eY - 0.012, lz); O(A.lan, 0.024, wf + 0.03, eY - 0.055, lz); }
  if (!flat && (cf & 1)) { /* 屋顶杂物 cf&1：烟囱(lv1-3)/光伏板(lv4) */
    if (L >= 4) { B(A.sky, 0.13, 0.008, 0.09, xc - d * 0.12, eY + R + 0.024, z - w * 0.14, 0.4); B(A.steel, 0.14, 0.006, 0.1, xc - d * 0.12, eY + R + 0.012, z - w * 0.14, 0.4); }
    else B(A.wall, 0.05, 0.07, 0.05, xc + d * 0.18, eY + R + 0.03, z + w * 0.18); }
  if ((cf & 2) && L >= 2) { /* 屋顶杂物 cf&2：水箱+空调机（lv3+ 加天窗） */
    if (L >= 3) { B(A.sky, 0.08, 0.018, 0.08, xc + d * 0.12, eY + R + 0.012, z - w * 0.12); B(A.sky, 0.08, 0.018, 0.08, xc - d * 0.1, eY + R + 0.012, z + w * 0.16); }
    Y(A.steel, 0.028, 0.028, 0.05, 10, xc - d * 0.2, eY + R + 0.045, z + w * 0.2); B(A.steel, 0.05, 0.03, 0.04, xc + d * 0.05, eY + R + 0.03, z - w * 0.22); }
  if (flat && L >= 2) { Y(A.steel, 0.026, 0.026, 0.045, 10, xc - d * 0.15, h + 0.075, z + w * 0.12); if (L >= 3) B(A.wood, 0.06, 0.026, 0.06, xc + d * 0.18, h + 0.065, z - w * 0.15); }
}
function arch(L2, r, top, sh) { /* 拱桥侧面轮廓：底边挖半圆拱 + 抛物线桥面 */ var s = new THREE.Shape(); s.moveTo(-L2, 0); s.lineTo(-r, 0); s.absarc(0, 0, r, PI, 0, true); s.lineTo(L2, 0); s.lineTo(L2, sh);
  for (var i = 1; i <= 8; i++) { var t = L2 - i * L2 / 4; s.lineTo(t, top - (top - sh) * (t / L2) * (t / L2)); } s.closePath(); return s; }
function block21(L) {
  var g = new THREE.Group(); g.name = 'prop_21_lv' + L; g.userData = { kind: 'property', propIdx: 21, level: L, anim: [] };
  BK = {}; var i, k, e, wh = ['#677d74', '#617f79', '#5a807a', '#548078'][L - 1], wl = L === 1 ? '#cfcac0' : '#efeadf';
  var A = { /* 材质分区：水面 rg.15/mt.45 反光；玻璃 rg.22；木构 rg.7；条石 rg.9-.92；磨光石栏 rg.55；瓦 rg.8 */
    water: M(wh, { map: texWater(wh), rg: 0.15, mt: 0.45 }),
    quay: M('#a49e92', { map: texStone('#a49e92'), rg: 0.92 }), lane: M('#b3ac9f', { map: texStone('#b3ac9f'), rg: 0.9 }), bank: M('#8f887b', { map: texStone('#8f887b'), rg: 0.92 }),
    wall: M(wl, { map: texWall(wl), rg: 0.9 }), roof: M('#474b53', { map: texTile('#474b53'), rg: 0.8 }),
    wood: M('#5a4634', { map: texWood('#5a4634'), rg: 0.7 }), dark: M('#2e3438', { rg: 0.9 }), stone: M('#c9c3b6', { map: texStone('#c9c3b6'), rg: 0.9 }), rail: M('#d9d4c8', { rg: 0.55 }),
    leaf: M('#566c42', { rg: 0.95 }), leaf2: M('#6f8752', { rg: 0.95 }), trunk: M('#4f3f2c', { map: texWood('#4f3f2c'), rg: 0.88 }),
    glass: M('#33404a', { rg: 0.22, mt: 0.25 }), sky: M('#8fa6b4', { rg: 0.15, mt: 0.3, op: 0.6 }), steel: M('#6e757b', { rg: 0.45, mt: 0.6 }),
    awn: M(L >= 2 ? '#4f7050' : '#8a8478', { rg: 0.9 }), umb: M('#e4dccb', { rg: 0.9 }),
    lan: MF('#b8261f', { rg: 0.6, map: texLan(), em: '#ff5a3c', ei: [0.25, 0.4, 0.55, 0.8][L - 1], emap: texLan() }),
    glow: MF('#5a4a3a', { rg: 0.4, map: texPane(), em: '#ffbe70', ei: [0.12, 0.22, 0.3, 0.4][L - 1], emap: texPane() }),
    lamp: MF('#ffe6b0', { rg: 0.4, em: '#ffd9a0', ei: 0.65 })
  };
  var st = L >= 2 ? signTex('评弹馆', '#2b2f33', '#ffd98c') : null, signM = st ? MF('#f2ead8', { map: st, emap: st, em: '#ffcf8e', ei: L >= 4 ? 0.8 : 0.28, rg: 0.5 }) : null;
  var bnM = L >= 4 ? MF('#8a2a20', { map: texBan(), emap: texBan(), em: '#ff9a5a', ei: 0.55, rg: 0.5 }) : null;
  /* 地面：主巷条石 + 大块石板广场 + 临水步道 + 两岸直立驳岸壁+顶帽石 + 河道 + 岸线湿渍暗边 —— boxUV 世界周期 条石 .5 / 广场 .95 / 水 .9 */
  W(A.quay, 2.02, 0.06, 2.6, -0.29, 0.03, 0, 0.5);
  W(A.lane, 1.05, 0.062, 1.75, -0.68, 0.031, 0.32, 0.95);
  W(A.lane, 0.3, 0.064, 2.6, 0.53, 0.032, 0, 0.5);
  W(A.bank, 0.055, 0.095, 2.6, 0.7175, 0.0475, 0, 0.35); W(A.stone, 0.085, 0.03, 2.6, 0.7125, 0.105, 0, 0.5);
  W(A.water, 0.5, 0.05, 2.6, 0.99, 0.024, 0, 0.9);
  W(A.bank, 0.055, 0.095, 2.6, 1.2125, 0.0475, 0, 0.35); W(A.stone, 0.075, 0.03, 2.6, 1.2625, 0.105, 0, 0.5);
  B(A.dark, 0.018, 0.056, 2.6, 0.752, 0.025, 0); B(A.dark, 0.018, 0.056, 2.6, 1.228, 0.025, 0);
  /* 临河石栏：lv1 素石矮墙 / lv2+ 望柱条栏（桥口 z .24..0.66 留空），lv2+ 缆桩 ×4 */
  if (L === 1) { W(A.stone, 0.05, 0.06, 2.6, 0.7125, 0.15, 0, 0.5); W(A.stone, 0.04, 0.05, 2.6, 1.2625, 0.145, 0, 0.5); }
  else for (k = 0; k < 13; k++) { var pz = -1.2 + k * 0.2; if (pz < 0.24 || pz > 0.66) { B(A.rail, 0.035, 0.11, 0.035, 0.7125, 0.155, pz); B(A.rail, 0.035, 0.09, 0.035, 1.2625, 0.145, pz); }
    if (k < 12 && (pz < 0.22 || pz > 0.66)) { B(A.rail, 0.02, 0.02, 0.2, 0.7125, 0.215, pz + 0.1); B(A.rail, 0.02, 0.02, 0.2, 1.2625, 0.195, pz + 0.1); } }
  if (L >= 2) for (k = 0; k < 4; k++) Y(A.dark, 0.013, 0.017, 0.06, 10, 0.7125, 0.135, [-1.05, -0.62, 0.82, 1.18][k]);
  /* 小石拱桥：跨侧河 x .71..1.29 @ z .3..0.6；分步桥面+券脸贯石带+两端踏步引道 */
  EX(A.stone, arch(0.29, 0.15, 0.25, 0.09), 0.3, 1.0, 0, 0.3, 0);
  B(A.dark, 0.2, 0.16, 0.28, 1.0, 0.08, 0.45);
  var fd = function (u) { return 0.25 - 0.16 * (u / 0.29) * (u / 0.29); };
  for (k = 0; k < 6; k++) { var t = -0.24 + k * 0.096; W(A.stone, 0.1, 0.014, 0.27, 1.0 + t, fd(t) + 0.006, 0.45, 0.4); }
  for (k = 0; k < 2; k++) { W(A.stone, 0.56, 0.02, 0.014, 1.0, 0.115 + k * 0.075, 0.293, 0.5); W(A.stone, 0.56, 0.02, 0.014, 1.0, 0.115 + k * 0.075, 0.607, 0.5); }
  for (k = -3; k <= 3; k++) { var t2 = k * 0.09; for (e = -1; e <= 1; e += 2) B(A.rail, 0.028, 0.1, 0.028, 1.0 + t2, fd(t2) + 0.05, 0.45 + e * 0.135);
    if (k < 3) { var y0 = fd(t2), y1 = fd(t2 + 0.09), an = Math.atan2(y1 - y0, 0.09); for (e = -1; e <= 1; e += 2) B(A.rail, 0.1, 0.02, 0.02, 1.0 + t2 + 0.045, (y0 + y1) / 2 + 0.105, 0.45 + e * 0.135, 0, 0, an); } }
  B(A.stone, 0.1, 0.05, 0.34, 0.66, 0.185, 0.45); B(A.stone, 0.1, 0.034, 0.36, 0.58, 0.15, 0.45); B(A.stone, 0.1, 0.02, 0.36, 0.5, 0.11, 0.45);
  B(A.stone, 0.09, 0.05, 0.34, 1.245, 0.19, 0.45); B(A.stone, 0.09, 0.034, 0.36, 1.19, 0.15, 0.45);
  if (L >= 4) for (e = -1; e <= 1; e += 2) { Y(A.steel, 0.012, 0.016, 0.26, 12, 0.64, 0.24, 0.45 + e * 0.14); B(A.lamp, 0.045, 0.045, 0.045, 0.64, 0.39, 0.45 + e * 0.14); B(A.steel, 0.06, 0.012, 0.06, 0.64, 0.42, 0.45 + e * 0.14); }
  /* 河埠头下河踏步：lv1 一组（桥南）→ lv2+ 门柱石 → lv3+ 第二组（桥北）→ lv4 对岸一组 */
  for (i = 0; i < (L === 1 ? 3 : 4); i++) W(A.stone, 0.2, 0.022, 0.2, 0.79 + i * 0.05, 0.098 - i * 0.023, -0.2, 0.5);
  if (L >= 2) { B(A.stone, 0.04, 0.075, 0.24, 0.77, 0.0825, -0.31); B(A.stone, 0.04, 0.075, 0.24, 0.77, 0.0825, -0.09); }
  if (L >= 3) for (i = 0; i < 4; i++) W(A.stone, 0.2, 0.022, 0.2, 0.79 + i * 0.05, 0.098 - i * 0.023, 0.95, 0.5);
  if (L >= 4) for (i = 0; i < 3; i++) W(A.stone, 0.2, 0.022, 0.2, 1.2 - i * 0.055, 0.09 - i * 0.024, -0.55, 0.5);
  /* 前排枕河街屋 ×4（双层，朝窄巷开店）：第 3 座评弹馆、末座 lv4 改玻璃茶室门面 */
  house(A, L, -0.05, -1.0, 0.46, 0.56, 0.6, 1, true, 1, 0, 1, 0);
  house(A, L, -0.05, -0.49, 0.5, 0.56, 0.58, 2, true, 1, 0, 2, 0);
  house(A, L, -0.05, 0.09, 0.58, 0.56, 0.74, 2, true, 1, 0, 1, 0);
  if (signM) { B(signM, 0.03, 0.1, 0.36, 0.245, 0.66, 0.09); B(A.wood, 0.035, 0.014, 0.38, 0.249, 0.722, 0.09); }
  house(A, L, -0.05, 0.67, 0.5, 0.56, 0.62, 1, true, 1, 0, 2, L >= 4 ? 1 : 0);
  if (L >= 4) { /* 玻璃茶室：通高暖光内景 + 钢框玻璃山墙 + 屋顶露台 */
    B(A.sky, 0.02, 0.44, 0.44, 0.245, 0.27, 0.67); B(A.glow, 0.014, 0.38, 0.38, 0.238, 0.26, 0.67);
    for (i = -1; i <= 1; i += 2) B(A.steel, 0.018, 0.46, 0.018, 0.25, 0.27, 0.67 + i * 0.21);
    B(A.steel, 0.02, 0.02, 0.46, 0.25, 0.52, 0.67); B(A.rail, 0.014, 0.07, 0.44, 0.16, 0.615, 0.67);
    O(A.leaf2, 0.045, -0.1, 0.66, 0.78); O(A.leaf2, 0.04, -0.02, 0.64, 0.56); }
  /* 中排 ×3（巷向门面；中座 lv3+ 平顶露台：lv2 屋顶披屋 / lv3+ 露台木架盆栽 / lv4 玻璃亭） */
  house(A, L, -0.75, -0.95, 0.6, 0.52, 0.68, 2, false, 1, 0, 3, 0);
  house(A, L, -0.75, -0.32, 0.55, 0.52, 0.6, 0, false, 0, L >= 3, 2, 0);
  house(A, L, -0.75, 0.32, 0.62, 0.52, 0.7, 2, false, 1, 0, 1, 0);
  if (L === 2) { W(A.wall, 0.22, 0.13, 0.18, -0.75, 0.75, -0.32, 0.8); Y(A.roof, 0.02, 0.18, 0.08, 4, -0.75, 0.845, -0.32, 0, PI / 4, 0); }
  if (L >= 3) { for (k = 0; k < 2; k++) for (e = -1; e <= 1; e += 2) B(A.wood, 0.022, 0.14, 0.022, -0.93 + k * 0.36, 0.72, -0.32 + e * 0.17);
    for (k = 0; k < 4; k++) B(A.wood, 0.03, 0.02, 0.4, -0.92 + k * 0.11, 0.78, -0.32); for (e = -1; e <= 1; e += 2) B(A.wood, 0.46, 0.02, 0.03, -0.75, 0.76, -0.32 + e * 0.19);
    O(A.leaf2, 0.05, -0.6, 0.7, -0.18); O(A.leaf, 0.045, -0.9, 0.7, -0.46); if (L >= 4) { B(A.sky, 0.22, 0.14, 0.18, -0.75, 0.85, -0.32); B(A.steel, 0.25, 0.012, 0.2, -0.75, 0.935, -0.32); } }
  /* 后排矮屋 ×2 */
  house(A, L, -1.08, -0.55, 0.42, 0.3, 0.42, 0, false, 0, 1, 0, 0);
  house(A, L, -1.08, 0.18, 0.46, 0.3, 0.46, 1, false, 0, 0, 2, 0);
  /* 树：对岸垂柳列（贴水倾出）+ 巷口行道树 + 后院角树，逐年代增大增密 */
  var tr = [0.21, 0.235, 0.265, 0.3][L - 1];
  tree(A, 1.22, -0.85, tr, 1, 1, L); tree(A, 1.22, 0.02, tr * 0.92, 1, 1, L); tree(A, 1.22, 0.92, tr * 0.96, 1, 1, L);
  tree(A, 0.53, -0.78, tr * 0.62, 0, 0, L); if (L >= 2) { tree(A, -1.02, -0.98, tr * 0.6, 0, 0, L); tree(A, 0.53, 0.05, tr * 0.5, 1, 0, L); }
  if (L >= 3) { tree(A, 0.53, 1.0, tr * 0.55, 1, 0, L); tree(A, -0.35, -1.06, tr * 0.5, 0, 0, L); }
  if (L >= 4) tree(A, -0.42, 1.05, tr * 0.5, 1, 0, L);
  /* 前端河埠头小广场：街灯+长凳(lv2+)/白伞咖啡座+花箱(lv3+) */
  if (L >= 2) { Y(A.steel, 0.014, 0.018, 0.4, 12, -0.62, 0.28, 1.06); B(A.lamp, 0.05, 0.05, 0.05, -0.62, 0.5, 1.06); B(A.steel, 0.07, 0.014, 0.07, -0.62, 0.535, 1.06);
    for (k = 0; k < 2; k++) { var bx = -0.44 + k * 0.44; B(A.wood, 0.3, 0.026, 0.07, bx + 0.12, 0.16, 1.18); B(A.wood, 0.02, 0.14, 0.02, bx, 0.08, 1.18); B(A.wood, 0.02, 0.14, 0.02, bx + 0.24, 0.08, 1.18); } }
  if (L >= 3) for (i = 0; i < 2; i++) { var ux = -0.28 + i * 0.6;
    Y(A.wood, 0.008, 0.008, 0.42, 8, ux, 0.29, 0.98 + i * 0.12); Y(A.umb, 0, 0.18, 0.09, 10, ux, 0.52, 0.98 + i * 0.12);
    B(A.wood, 0.1, 0.03, 0.1, ux, 0.17, 0.98 + i * 0.12); Y(A.wood, 0.012, 0.012, 0.12, 8, ux, 0.11, 0.98 + i * 0.12);
    B(A.wood, 0.17, 0.07, 0.09, ux - 0.26, 0.1, 0.76 + i * 0.38); O(A.leaf2, 0.04, ux - 0.26, 0.17, 0.76 + i * 0.38); }
  if (L >= 4 && bnM) B(bnM, 0.014, 0.26, 0.08, 0.27, 0.46, -0.13);
  flush(g);
  var lan = A.lan, glow = A.glow, lamp = A.lamp, e0 = lan.emissiveIntensity;
  g.userData.anim.push(function (tt) { lan.emissiveIntensity = e0 + 0.15 * (0.5 + 0.5 * Math.sin(tt * 1.7)); });
  if (L >= 2) g.userData.anim.push(function (tt) { var s = 0.5 + 0.5 * Math.sin(tt * 1.1); glow.emissiveIntensity = [0, 0.16, 0.24, 0.34][L - 1] + 0.14 * s; lamp.emissiveIntensity = 0.5 + 0.2 * s; if (signM) signM.emissiveIntensity = (L >= 4 ? 0.65 : 0.22) + 0.2 * s; if (bnM) bnM.emissiveIntensity = 0.4 + 0.15 * s; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[21] = function (level) { return block21(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
