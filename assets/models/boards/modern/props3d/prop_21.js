/* 大富翁·现代写实棋盘（苏）格 21「平江路」—— 苏州水乡：窄巷侧河 / 小石拱桥 / 枕河民居 / 评弹馆，四年代演进
 * 契约：window.Props3DModern[21](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z（河埠头广场在前）；
 * 构图与格 23 山塘街差异化：河道沿 +X 侧纵贯（窄巷贴河）、双排枕河民居朝巷开门、小拱桥跨河居中前段、对岸细堤垂柳、无木船。每级 mesh ≤55（合并 BufferGeometry）；Canvas ≤256；零 Math.random；动画 ≤2。
 * 年代特征：lv1 斑驳灰白墙+素青瓦+素石驳岸+小拱桥+木板门 → lv2 粉刷白墙+披屋+绿布篷+河埠头石阶+望柱条栏+灯笼+评弹馆匾额 → lv3 木格栅+白伞咖啡座+花箱+街灯+露台木架 → lv4 玻璃茶室暖光+屋顶玻璃亭+桥头灯柱+垂柳最茂+发光店招
 * 材质工艺（二轮精修，对标 specials3d/tile29_water.js）：贴图材质 color=白 + userData.previewColor 记录主色（overlay 语义）；多层 Canvas（底色/噪点/风化/分缝/高光/雨渍）；
 *   灯笼·匾额·橱窗 emissiveMap；水面低粗糙高金属反光；瓦/粉墙/条石/木构/树皮分区 roughness；boxUV 世界尺寸烘焙。 */
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
function tree(A, x, z, r, willow, lean) { /* 垂柳/香樟：柳冠下垂拉长；lean=临水柳冠向 -x 倾出河道 */ Y(A.trunk, r * 0.15, r * 0.22, r * 2.6, 6, x, 0.06 + r * 1.3, z);
  if (willow && lean) { O(A.leaf2, r, x - 0.6 * r, 0.06 + r * 2.9, z, 0.85, 1.35, 1.1); O(A.leaf2, r * 0.55, x - 1.15 * r, 0.06 + r * 2.2, z + r * 0.3, 1, 1.7, 1); O(A.leaf2, r * 0.5, x - 0.9 * r, 0.06 + r * 2.1, z - r * 0.3, 1, 1.7, 1); }
  else if (willow) { O(A.leaf2, r, x, 0.06 + r * 2.9, z, 1.1, 1.35, 1.1); O(A.leaf2, r * 0.55, x + r * 0.65, 0.06 + r * 2.2, z + r * 0.3, 1, 1.7, 1); O(A.leaf2, r * 0.55, x - r * 0.6, 0.06 + r * 2.1, z - r * 0.3, 1, 1.7, 1); }
  else { O(A.leaf, r, x, 0.06 + r * 3.1, z); O(A.leaf2, r * 0.68, x + r * 0.5, 0.06 + r * 3.4, z + r * 0.2); O(A.leaf, r * 0.55, x - r * 0.5, 0.06 + r * 3.0, z - r * 0.25); }
}
function arch(L2, r, top, sh) { /* 拱桥侧面轮廓：底边挖半圆拱 + 抛物线桥面 */ var s = new THREE.Shape(); s.moveTo(-L2, 0); s.lineTo(-r, 0); s.absarc(0, 0, r, PI, 0, true); s.lineTo(L2, 0); s.lineTo(L2, sh);
  for (var i = 1; i <= 8; i++) { var t = L2 - i * L2 / 4; s.lineTo(t, top - (top - sh) * (t / L2) * (t / L2)); } s.closePath(); return s; }
function house(A, L, xc, z, w, d, h, mt, front, flat) { /* 枕河民居：粉墙 + 小青瓦坡脊（脊沿 z，坡面朝巷/后）+ 马头墙 + 巷门面 */
  var ang = 0.58, rise = d / 2 * Math.tan(ang), sl = d / 2 / Math.cos(ang) + 0.06, i, e, n, zk;
  var zf = xc + d / 2 + 0.006;
  W(A.wall, d, h, w, xc, h / 2, z, 0.8);
  if (flat) { B(A.wall, 0.03, 0.05, w + 0.02, xc + d / 2, h + 0.025, z); B(A.wall, 0.03, 0.05, w + 0.02, xc - d / 2, h + 0.025, z); B(A.wall, d, 0.05, 0.03, xc, h + 0.025, z + w / 2); B(A.wall, d, 0.05, 0.03, xc, h + 0.025, z - w / 2); }
  else {
    W(A.roof, sl, 0.024, w + 0.06, xc + d / 4, h + rise / 2 - 0.01, z, 0.35, 0, 0, -ang); W(A.roof, sl, 0.024, w + 0.06, xc - d / 4, h + rise / 2 - 0.01, z, 0.35, 0, 0, ang);
    Y(A.roof, 0.02, 0.02, w + 0.06, 6, xc, h + rise + 0.005, z, PI / 2, 0, 0);
    TRI(A.wall, d, rise, 0.02, xc, h, z + w / 2 - 0.02); TRI(A.wall, d, rise, 0.02, xc, h, z - w / 2);
    for (i = 0; i < mt; i++) for (e = -1; e <= 1; e += 2) { var tw = d * (1 - i * 0.42), th = h + rise * (0.55 + i * 0.5) + 0.04, ez = z + e * (w / 2 - 0.012);
      W(A.wall, tw, th, 0.045, xc, th / 2, ez, 0.8); W(A.roof, tw + 0.05, 0.024, 0.09, xc, th + 0.012, ez, 0.35); }
  }
  n = Math.max(2, Math.round(w / 0.17));
  for (i = 0; i < n; i++) { zk = z - w / 2 + (i + 0.5) * w / n; B(L >= 3 ? A.glass : A.wood, 0.02, 0.12, 0.09, zf, h * 0.72, zk); if (L >= 3) B(A.wood, 0.024, 0.02, 0.11, zf + 0.004, h * 0.72, zk); }
  if (!front) return;
  if (L === 1) { B(A.wood, 0.02, 0.28, w * 0.82, zf, 0.2, z); B(A.dark, 0.024, 0.25, 0.11, zf + 0.003, 0.185, z + w * 0.24); }
  else {
    B(A.glow, 0.02, 0.22, w * (L === 4 ? 0.62 : 0.4), zf, 0.21, z - (L === 4 ? 0 : w * 0.14));
    B(A.wood, 0.024, 0.26, w * 0.26, zf + 0.002, 0.19, z + w * 0.3);
    B(A.awn, 0.015, 0.14, w * 0.86, zf + 0.07, 0.39, z, 0, 0, -0.4); B(A.awn, 0.02, 0.035, w * 0.86, zf + 0.14, 0.355, z);
    if (L >= 3) B(A.wood, 0.026, 0.04, w * 0.9, zf + 0.006, 0.36, z);
  }
  var nl = L === 1 ? 2 : (L >= 3 ? 4 : 3);
  for (i = 0; i < nl; i++) O(A.lan, 0.026, zf + 0.05, h - 0.05, z - w / 2 + (i + 0.5) * w / nl);
}
function block21(L) {
  var g = new THREE.Group(); g.name = 'prop_21_lv' + L; g.userData = { kind: 'property', propIdx: 21, level: L, anim: [] };
  BK = {}; var i, k, e, wh = ['#6d8a80', '#66908a', '#5e928c', '#58948e'][L - 1], wl = L === 1 ? '#cfcac0' : '#ebe7de';
  var A = { /* 材质分区：水面 rg.15/mt.45 反光；玻璃 rg.22；木构 rg.7；条石 rg.9-.92；磨光石栏 rg.55；瓦 rg.8 */
    water: M(wh, { map: texWater(wh), rg: 0.15, mt: 0.45 }),
    quay: M('#a49e92', { map: texStone('#a49e92'), rg: 0.92 }), lane: M('#b0aa9e', { map: texStone('#b0aa9e'), rg: 0.9 }), bank: M('#968f82', { map: texStone('#968f82'), rg: 0.92 }),
    wall: M(wl, { map: texWall(wl), rg: 0.9 }), roof: M('#4a4e55', { map: texTile('#4a4e55'), rg: 0.8 }),
    wood: M('#5a4634', { map: texWood('#5a4634'), rg: 0.7 }), dark: M('#2e3438', { rg: 0.9 }), stone: M('#c4beb2', { map: texStone('#c4beb2'), rg: 0.9 }), rail: M('#d9d4c8', { rg: 0.55 }),
    leaf: M('#566c42', { rg: 0.95 }), leaf2: M('#6f8752', { rg: 0.95 }), trunk: M('#4f3f2c', { map: texWood('#4f3f2c'), rg: 0.88 }),
    glass: M('#33404a', { rg: 0.22, mt: 0.25 }), sky: M('#8fa6b4', { rg: 0.15, mt: 0.3, op: 0.6 }), steel: M('#6e757b', { rg: 0.45, mt: 0.6 }),
    awn: M(L >= 2 ? '#4f7050' : '#8a8478', { rg: 0.9 }), umb: M('#e4dccb', { rg: 0.9 }),
    lan: MF('#b8261f', { rg: 0.6, map: texLan(), em: '#ff5a3c', ei: [0.25, 0.4, 0.55, 0.8][L - 1], emap: texLan() }),
    glow: MF('#5a4a3a', { rg: 0.4, map: texPane(), em: '#ffbe70', ei: L === 1 ? 0.12 : 0.42, emap: texPane() }),
    lamp: MF('#ffe6b0', { rg: 0.4, em: '#ffd9a0', ei: 0.65 })
  };
  var st = L >= 2 ? signTex('评弹馆', '#2b2f33', '#ffd98c') : null, signM = st ? MF('#f2ead8', { map: st, emap: st, em: '#ffcf8e', ei: L >= 4 ? 0.8 : 0.16, rg: 0.5 }) : null;
  /* 地面：街巷地坪(x -1.3..0.72) + 窄巷条石带 + 驳岸缘石 + 河道(x .74..1.24) + 对岸细堤(1.2..1.3) —— boxUV 世界周期 条石 .5 / 水面 .9 */
  W(A.quay, 2.02, 0.06, 2.6, -0.29, 0.03, 0, 0.5); W(A.lane, 0.3, 0.064, 2.6, 0.53, 0.032, 0, 0.5); W(A.stone, 0.07, 0.1, 2.6, 0.705, 0.05, 0, 0.5);
  W(A.water, 0.5, 0.05, 2.6, 0.99, 0.024, 0, 0.9); W(A.bank, 0.1, 0.1, 2.6, 1.25, 0.05, 0, 0.5);
  /* 临河石栏：lv1 素石矮墙 / lv2+ 望柱条栏（桥口 z .26..0.64 留空），lv4 桥头灯柱 */
  if (L === 1) { W(A.stone, 0.05, 0.06, 2.6, 0.71, 0.13, 0, 0.5); W(A.stone, 0.04, 0.05, 2.6, 1.27, 0.125, 0, 0.5); }
  else for (k = 0; k < 13; k++) { var pz = -1.2 + k * 0.2; if (pz < 0.24 || pz > 0.66) { B(A.rail, 0.035, 0.11, 0.035, 0.705, 0.155, pz); B(A.rail, 0.035, 0.09, 0.035, 1.265, 0.145, pz); }
    if (k < 12 && (pz < 0.22 || pz > 0.66)) { B(A.rail, 0.02, 0.02, 0.2, 0.705, 0.215, pz + 0.1); B(A.rail, 0.02, 0.02, 0.2, 1.265, 0.195, pz + 0.1); } }
  /* 小石拱桥：跨侧河 x .71..1.29 @ z .3..0.6（侧河身份特征） */
  EX(A.stone, arch(0.29, 0.15, 0.25, 0.09), 0.3, 1.0, 0, 0.3, 0);
  B(A.dark, 0.2, 0.16, 0.28, 1.0, 0.08, 0.45);
  var fd = function (u) { return 0.25 - 0.16 * (u / 0.29) * (u / 0.29); };
  for (k = -3; k <= 3; k++) { var t = k * 0.09; for (e = -1; e <= 1; e += 2) B(A.rail, 0.028, 0.1, 0.028, 1.0 + t, fd(t) + 0.05, 0.45 + e * 0.135);
    if (k < 3) { var y0 = fd(t), y1 = fd(t + 0.09), an = Math.atan2(y1 - y0, 0.09); for (e = -1; e <= 1; e += 2) B(A.rail, 0.1, 0.02, 0.02, 1.0 + t + 0.045, (y0 + y1) / 2 + 0.105, 0.45 + e * 0.135, 0, 0, an); } }
  W(A.stone, 0.14, 0.05, 0.36, 0.64, 0.06, 0.45, 0.5); W(A.stone, 0.1, 0.06, 0.36, 1.24, 0.09, 0.45, 0.5);
  if (L >= 4) for (e = -1; e <= 1; e += 2) { Y(A.steel, 0.012, 0.016, 0.26, 6, 0.64, 0.21, 0.45 + e * 0.14); B(A.lamp, 0.045, 0.045, 0.045, 0.64, 0.36, 0.45 + e * 0.14); }
  /* 河埠头下河石阶（lv2+，桥南 z -0.2） */
  if (L >= 2) for (i = 0; i < 3; i++) W(A.stone, 0.09, 0.03, 0.2, 0.76 + i * 0.09, 0.062 - i * 0.021, -0.2, 0.5);
  /* 前排枕河民居 ×4（朝窄巷开门，脊沿 z）：末座评弹馆（lv4 改玻璃茶室） */
  house(A, L, -0.05, -1.0, 0.46, 0.56, 0.52, 0, true);
  house(A, L, -0.05, -0.49, 0.5, 0.56, 0.5, 1, true);
  house(A, L, -0.05, 0.09, 0.58, 0.56, 0.72, 2, true);
  if (signM) { B(signM, 0.03, 0.09, 0.34, 0.245, 0.5, 0.09); B(A.wood, 0.035, 0.014, 0.36, 0.247, 0.55, 0.09); }
  house(A, L, -0.05, 0.67, 0.5, 0.56, L >= 4 ? 0.56 : 0.5, 0, true);
  if (L >= 4) { /* 通高玻璃茶室：暖光内景 + 钢框玻璃山墙 + 屋顶露台 */
    B(A.sky, 0.02, 0.42, 0.42, 0.235, 0.28, 0.67); B(A.glow, 0.014, 0.36, 0.36, 0.228, 0.27, 0.67);
    for (i = -1; i <= 1; i += 2) B(A.steel, 0.018, 0.44, 0.018, 0.238, 0.28, 0.67 + i * 0.2);
    B(A.steel, 0.02, 0.02, 0.46, 0.238, 0.52, 0.67); B(A.rail, 0.014, 0.07, 0.44, 0.16, 0.6, 0.67);
    O(A.leaf2, 0.045, -0.1, 0.65, 0.78); O(A.leaf2, 0.04, -0.02, 0.64, 0.56);
  }
  /* 中排 ×3（lv3+ 中座改平顶露台；lv2 屋顶披屋 / lv3+ 露台木架盆栽） */
  house(A, L, -0.75, -0.95, 0.6, 0.52, 0.66, 2, false);
  house(A, L, -0.75, -0.32, 0.55, 0.52, L >= 3 ? 0.56 : 0.6, 0, false, L >= 3);
  house(A, L, -0.75, 0.32, 0.62, 0.52, 0.62, 1, false);
  if (L === 2) { W(A.wall, 0.22, 0.13, 0.18, -0.75, 0.7, -0.32, 0.8); Y(A.roof, 0.02, 0.18, 0.08, 4, -0.75, 0.8, -0.32, 0, PI / 4, 0); }
  if (L >= 3) { for (k = 0; k < 4; k++) B(A.wood, 0.03, 0.02, 0.4, -0.92 + k * 0.11, 0.75, -0.32); for (e = -1; e <= 1; e += 2) B(A.wood, 0.46, 0.02, 0.03, -0.75, 0.73, -0.32 + e * 0.19);
    O(A.leaf2, 0.05, -0.6, 0.66, -0.18); O(A.leaf, 0.045, -0.9, 0.66, -0.46); if (L >= 4) { B(A.sky, 0.24, 0.16, 0.2, -0.75, 0.85, -0.32); B(A.steel, 0.27, 0.014, 0.23, -0.75, 0.94, -0.32); } }
  /* 后排矮屋 ×2 + 后院角树 */
  house(A, L, -1.1, -0.55, 0.42, 0.3, 0.4, 0, false, true);
  house(A, L, -1.1, 0.18, 0.46, 0.3, 0.44, 0, false);
  /* 树：对岸垂柳列（贴水倾出）+ 巷口香樟 + 后院角树，逐年代增大增密 */
  var tr = [0.2, 0.24, 0.26, 0.3][L - 1];
  tree(A, 1.22, -0.85, tr, true, true); tree(A, 1.22, 0.02, tr * 0.92, true, true); tree(A, 1.22, 0.92, tr * 0.96, true, true);
  tree(A, 0.53, -0.78, tr * 0.62, false); if (L >= 2) { tree(A, -1.02, -0.98, tr * 0.6, false); tree(A, 0.53, 0.02, tr * 0.5, true); }
  if (L >= 3) { tree(A, 0.53, 1.0, tr * 0.55, true); tree(A, -0.35, -1.06, tr * 0.5, false); }
  if (L >= 4) tree(A, -0.42, 1.04, tr * 0.5, true);
  /* 前端河埠头小广场：灯笼柱(lv2+)/白伞咖啡座+花箱(lv3+)/座椅 */
  if (L >= 2) { Y(A.steel, 0.014, 0.018, 0.34, 6, -0.62, 0.25, 1.06); B(A.lamp, 0.05, 0.05, 0.05, -0.62, 0.44, 1.06); }
  if (L >= 3) for (i = 0; i < 2; i++) { var ux = -0.3 + i * 0.55;
    Y(A.wood, 0.008, 0.008, 0.4, 5, ux, 0.28, 1.0 + i * 0.1); Y(A.umb, 0, 0.17, 0.09, 8, ux, 0.5, 1.0 + i * 0.1);
    B(A.wood, 0.09, 0.03, 0.09, ux, 0.16, 1.0 + i * 0.1); Y(A.wood, 0.012, 0.012, 0.1, 5, ux, 0.11, 1.0 + i * 0.1);
    B(A.wood, 0.16, 0.07, 0.09, ux - 0.24, 0.1, 0.78 + i * 0.34); O(A.leaf2, 0.04, ux - 0.24, 0.17, 0.78 + i * 0.34); }
  flush(g);
  var lan = A.lan, glow = A.glow, lamp = A.lamp, e0 = lan.emissiveIntensity;
  g.userData.anim.push(function (tt) { lan.emissiveIntensity = e0 + 0.15 * (0.5 + 0.5 * Math.sin(tt * 1.7)); });
  if (L >= 2) g.userData.anim.push(function (tt) { var s = 0.5 + 0.5 * Math.sin(tt * 1.1); glow.emissiveIntensity = 0.3 + 0.18 * s; lamp.emissiveIntensity = 0.5 + 0.2 * s; if (signM) signM.emissiveIntensity = (L >= 4 ? 0.65 : 0.12) + 0.2 * s; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[21] = function (level) { return block21(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
