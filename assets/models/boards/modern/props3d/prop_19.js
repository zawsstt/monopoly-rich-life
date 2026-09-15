/* 大富翁·现代写实棋盘（川）格 19「春熙路」—— 成都商业核心：购物商场 + 玻璃塔群 + LED 大屏 + IFS 爬墙熊猫，四年代演进
 * 契约：window.Props3DModern[19](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z（临街广场+喷泉+入口雨棚）；
 * 构图（对齐参考图机位）：弧形中庭在前左角(-x,+z)、LED/海报在左立面(-x)、广场喷泉在前(+z)、塔群环绕四角自裙楼升起。
 * 每级 mesh ≤55（手写合并 BufferGeometry：同材质合一 mesh）；Canvas ≤256px；零 Math.random（LCG 种子）；动画 ≤2 项。
 * 年代特征（refs/modern/prop_19.png）：lv1 周边式灰旧商住楼+灰天面水箱+后右板式天线塔+店招色条+转角楼彩绘广告牌 → lv2 整体米石商场+弧形玻璃中庭+立式海报+天窗带+蓝玻璃塔/米色裙房+广场喷泉+斑马线
 *   → lv3 全玻璃幕墙白横带+巨幅暗屏 LED+塔群×5+屋顶绿化+街灯 → lv4 IFS 爬墙熊猫（前立面右端）+双发光 LED+冠顶主塔/塔群×7+屋顶空中花园+豪华雨棚+环形广场铺装
 * 材质工艺（二轮精修，对标 specials3d/tile29_water.js）：贴图材质 color=白 + userData.previewColor 记录主色（overlay 语义）；多层 Canvas（底色/分块明暗/麻点/分缝/缝沿高光/风化/雨渍）；
 *   LED·店招 emissiveMap；喷泉水低粗糙高金属反光；玻璃/钢/石材/抹灰分区 roughness；boxUV 世界尺寸烘焙。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_19] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
var _mc = {};
function M(h, o) { /* 静态材质（缓存）：有 map 时 color=白、previewColor=h（预览/审计取主色） */
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + (o.map ? o.map.uuid : '');
  if (_mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(o.map ? '#ffffff' : h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.map) { m.map = o.map; m.userData.previewColor = h; } return (_mc[k] = m);
}
function MF(h, o) { /* 动画/发光材质：每次全新实例（避免跨实例共享状态）；emap=emissiveMap */
  o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; } if (o.map) m.map = o.map; if (o.emap) m.emissiveMap = o.emap; return m;
}
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
var _t = {};
function texGranite(h) { /* 花岗石/米石七层：底色 → 分块明暗 → 麻点 → 分缝 → 缝沿高光 → 风化污斑 → 雨渍竖痕 */
  var k = 'g' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1901), i, x, y;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 32) for (x = 0; x < S; x += 32) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,' + (0.02 + R() * 0.06) + ')' : 'rgba(40,38,34,' + (0.02 + R() * 0.06) + ')'; g.fillRect(x, y, 32, 32); }
  for (i = 0; i < 220; i++) { g.fillStyle = R() > 0.5 ? 'rgba(110,108,100,0.16)' : 'rgba(250,248,242,0.2)'; g.fillRect(R() * S, R() * S, 1 + R() * 2, 1 + R() * 2); }
  g.strokeStyle = 'rgba(96,94,88,0.35)'; g.lineWidth = 2; for (i = 0; i <= S; i += 32) { g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke(); g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke(); }
  g.fillStyle = 'rgba(255,255,255,0.12)'; for (i = 0; i < S; i += 32) g.fillRect(0, i + 1, S, 1);
  for (i = 0; i < 12; i++) { g.fillStyle = 'rgba(70,66,58,' + (0.05 + R() * 0.08) + ')'; g.beginPath(); g.arc(R() * S, R() * S, 5 + R() * 12, 0, PI * 2); g.fill(); }
  for (i = 0; i < 10; i++) { g.fillStyle = 'rgba(60,58,52,' + (0.05 + R() * 0.07) + ')'; g.fillRect(R() * S, Math.floor(R() * 4) * 32 + 2, 1 + R() * 2, 10 + R() * 28); }
  return (_t[k] = TX(c));
}
function texPoster() { /* 时尚海报竖幅六层：品红底 → 顶/底色带 → 人形剪影 → 文字条 → 亮面反光带 → 边角风化 */
  if (_t.p) return _t.p; var c = cv(128, 256), g = c.getContext('2d'), R = lcg(1902), i;
  g.fillStyle = '#c05a96'; g.fillRect(0, 0, 128, 256);
  g.fillStyle = '#e8b8d4'; g.fillRect(0, 0, 128, 40); g.fillStyle = '#8c3468'; g.fillRect(0, 226, 128, 30);
  g.fillStyle = '#f2e2ec'; g.beginPath(); g.arc(64, 96, 26, 0, PI * 2); g.fill();
  g.beginPath(); g.moveTo(40, 230); g.quadraticCurveTo(30, 150, 52, 118); g.lineTo(76, 118); g.quadraticCurveTo(98, 150, 88, 230); g.closePath(); g.fill();
  g.fillStyle = '#5a1e44'; g.fillRect(18, 236, 92, 4); g.fillStyle = '#f2e2ec'; g.fillRect(30, 14, 68, 6);
  g.fillStyle = 'rgba(255,255,255,0.12)'; g.beginPath(); g.moveTo(0, 60); g.lineTo(128, 20); g.lineTo(128, 50); g.lineTo(0, 90); g.closePath(); g.fill();
  for (i = 0; i < 16; i++) { g.fillStyle = 'rgba(60,20,40,' + (0.08 + R() * 0.1) + ')'; g.fillRect(R() > 0.5 ? R() * 12 : 116 + R() * 12, R() * 256, 3 + R() * 6, 4 + R() * 12); }
  return (_t.p = TX(c));
}
function texLED() { /* LED 屏内容五层：暗底 → 上下渐变 → 品红光斑横带 → 亮闪点 → 扫描线像素格 */
  if (_t.e) return _t.e; var c = cv(128, 96), g = c.getContext('2d'), R = lcg(1903), i;
  g.fillStyle = '#181222'; g.fillRect(0, 0, 128, 96); g.fillStyle = 'rgba(90,40,120,0.35)'; g.fillRect(0, 0, 128, 30); g.fillStyle = 'rgba(0,0,0,0.3)'; g.fillRect(0, 70, 128, 26);
  for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(240,90,180,' + (0.25 + R() * 0.5) + ')'; g.fillRect(8 + R() * 60, 10 + R() * 60, 20 + R() * 40, 6 + R() * 14); }
  for (i = 0; i < 12; i++) { g.fillStyle = 'rgba(255,220,245,' + (0.3 + R() * 0.5) + ')'; g.fillRect(R() * 128, R() * 96, 2 + R() * 4, 2); }
  for (i = 0; i < 96; i += 3) { g.fillStyle = 'rgba(0,0,0,0.25)'; g.fillRect(0, i, 128, 1); } for (i = 0; i < 128; i += 4) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(i, 0, 1, 96); }
  return (_t.e = TX(c));
}
function signTex(txt, bg, fg) { var c = cv(256, 64), g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, 256, 64); g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(0, 0, 256, 20); g.strokeStyle = fg; g.lineWidth = 4; g.strokeRect(5, 5, 246, 54); g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 34); return TX(c); }
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；W = boxUV 世界尺寸烘焙（per=纹理世界周期） ---- */
var BK;
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function BU(g, w, h, d, per) { var uv = g.attributes.uv, fs = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], f, v, i; for (f = 0; f < 6; f++) for (v = 0; v < 4; v++) { i = f * 4 + v; uv.setXY(i, uv.getX(i) * fs[f][0] / per, uv.getY(i) * fs[f][1] / per); } return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function W(m, w, h, d, x, y, z, per, rx, ry, rz) { put(m, xf(BU(new THREE.BoxGeometry(w, h, d), w, h, d, per), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z, rx, ry, rz, sx, sy, sz) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z, rx || 0, ry || 0, rz || 0, sx || 1, sy || 1, sz || 1)); }
function flush(g) { for (var k in BK) { var b = BK[k], gs = b.gs, P = 0, i;
  for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
  var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
  for (i = 0; i < gs.length; i++) { pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length; }
  var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
  var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms); } }
/* ---- 部件 ---- */
function tree(A, x, z, r) { Y(A.trunk, 0.024, 0.04, 0.3, 6, x, 0.21, z); O(A.leaf, r, x, 0.38 + r * 0.9, z); O(A.leaf2, r * 0.62, x + r * 0.45, 0.38 + r * 1.15, z + r * 0.2); O(A.leaf, r * 0.5, x - r * 0.4, 0.4 + r * 1.25, z - r * 0.18); }
function tower(A, x, z, w, d, h) { /* 玻璃塔：幕墙 + 白横带竖缝 + 冠顶机房（自地面 y=.1 升起，底部被裙楼包裹） */
  B(A.glass, w, h, d, x, 0.1 + h / 2, z);
  var n = Math.max(3, Math.round(h / 0.3)), i;
  for (i = 1; i <= n; i++) B(A.mull, w + 0.018, 0.02, d + 0.018, x, 0.1 + i * h / n, z);
  for (i = -1; i <= 1; i += 2) { B(A.mull, 0.018, h, d + 0.018, x + i * (w / 2 - 0.009), 0.1 + h / 2, z); B(A.mull, w + 0.018, h, 0.018, x, 0.1 + h / 2, z + i * (d / 2 - 0.009)); }
  B(A.mull, w + 0.05, 0.045, d + 0.05, x, 0.1 + h + 0.018, z);
  B(A.band, w * 0.55, 0.06, d * 0.55, x, 0.1 + h + 0.07, z);
  return 0.1 + h + 0.1;
}
function midrise(A, x, z, w, d, h) { /* 米色中层裙房：石材（boxUV）+ 深色窗带 */
  W(A.wallC, w, h, d, x, 0.1 + h / 2, z, 0.8); var n = Math.round(h / 0.2), i;
  for (i = 0; i < n; i++) { B(A.band, w + 0.012, 0.06, d + 0.012, x, 0.22 + i * 0.2, z); }
  B(A.mull, w + 0.03, 0.03, d + 0.03, x, 0.1 + h + 0.012, z);
}
function podium(A, L, ph) { /* 商场主体：x ±0.9，z -0.92..0.5，高 ph；lv2 米石+顶部玻璃带 / lv3+ 全幕墙白横带 */
  W(A.wallC, 1.8, ph - 0.1, 1.42, 0, 0.08 + ph / 2, -0.21, 0.8);
  B(A.band, 1.84, 0.09, 1.46, 0, 0.125, -0.21);
  if (L === 2) { B(A.glass, 1.8, 0.1, 1.42, 0, ph - 0.03, -0.21); W(A.wallC, 1.84, 0.035, 1.46, 0, ph + 0.035, -0.21, 0.8); }
  else {
    B(A.glass, 1.76, ph - 0.28, 1.38, 0, 0.1 + ph / 2, -0.21);
    for (var i = 0; i < 5; i++) B(A.mull, 1.82, 0.018, 1.44, 0, 0.26 + i * (ph - 0.34) / 4, -0.21);
    B(A.mull, 1.84, 0.035, 1.46, 0, ph + 0.035, -0.21);
  }
}
function atrium(A, ph) { /* 弧形玻璃中庭（前左转角，高出裙楼） */
  Y(A.glass, 0.36, 0.36, ph + 0.22, 14, -0.58, 0.08 + (ph + 0.22) / 2, 0.26);
  for (var i = 0; i < 3; i++) Y(A.mull, 0.372, 0.372, 0.03, 14, -0.58, 0.24 + i * (ph - 0.1) / 2, 0.26);
  Y(A.mull, 0.372, 0.372, 0.04, 14, -0.58, ph + 0.3, 0.26);
}
function fountain(A, L) { Y(A.stone, 0.3, 0.35, 0.1, 12, 0.02, 0.09, 0.78); Y(A.waterF, 0.27, 0.27, 0.045, 12, 0.02, 0.125, 0.78); Y(A.stone, 0.035, 0.05, 0.18, 8, 0.02, 0.2, 0.78); if (L >= 3) Y(A.waterF, 0.002, 0.02, 0.1, 6, 0.02, 0.3, 0.78); }
function block19(L) {
  var g = new THREE.Group(); g.name = 'prop_19_lv' + L; g.userData = { kind: 'property', propIdx: 19, level: L, anim: [] };
  BK = {}; var i, k, ph = [0, 0.72, 0.8, 0.86][L - 1];
  var A = { /* 色板按参考图 HSV 直方图校准；分区：石材 rg.92-.95 / 抹灰 .92 / 米石 .78 / 玻璃 .16+mt.45 / 深玻璃带 .4+mt.4 / 钢 .35+mt.7 / 喷泉水 .12+mt.55 */
    asph: M('#3a3d42', { rg: 0.95 }), pav: M('#9d988e', { map: texGranite('#9d988e'), rg: 0.95 }), pavD: M('#86817a', { map: texGranite('#86817a'), rg: 0.95 }), line: M('#e2e2db', { rg: 0.9 }),
    plasterA: M('#b89f8c', { rg: 0.92 }), plasterB: M('#a4a88c', { rg: 0.92 }), roofC: M('#8c8880', { rg: 0.85 }), dark: M('#2c3639', { rg: 0.9 }), wallC: M('#c8b0a0', { map: texGranite('#c8b0a0'), rg: 0.78 }),
    band: M('#485458', { rg: 0.4, mt: 0.4 }), glass: M('#7ea3b4', { rg: 0.16, mt: 0.45 }), mull: M('#cfcfca', { rg: 0.5 }), steel: M('#8a9599', { rg: 0.35, mt: 0.7 }),
    poster: M('#a8708e', { map: texPoster(), rg: 0.55 }), roofG: M('#7a8c48', { rg: 0.95 }), stone: M('#9e988a', { rg: 0.9 }), waterF: M('#7fb0ab', { rg: 0.12, mt: 0.55 }),
    trunk: M('#54432f', { rg: 0.9 }), leaf: M('#66763c', { rg: 0.95 }), leaf2: M('#7a8a46', { rg: 0.95 }), awnW: M('#d6d0c2', { rg: 0.9 }),
    red: M('#a8402c', { rg: 0.8 }), teal: M('#3f6f8f', { rg: 0.8 }), gold: M('#c8973f', { rg: 0.8 }),
    pandaW: M('#f4f4f0', { rg: 0.45 }), pandaB: M('#17171b', { rg: 0.5 })
  };
  var scrM = L === 2 ? null : MF(L >= 4 ? '#1c1220' : '#141824', { rg: 0.35, em: L >= 4 ? '#ff5fb0' : '#3c5aa0', ei: L >= 4 ? 0.6 : 0.24, emap: L >= 4 ? texLED() : null });
  var st = L >= 3 ? signTex('春熙路', '#232a31', '#ffd98c') : null, signM = st ? MF('#f2ead8', { map: st, emap: st, em: '#ffcf8e', ei: L >= 4 ? 0.75 : 0.18, rg: 0.5 }) : null;
  var lampM = L >= 3 ? MF('#ffe2ac', { rg: 0.4, em: '#ffd9a0', ei: 0.6 }) : null;
  /* 地面：花岗石基面（boxUV 周期 .6）+ 四周沥青环路(±1.02..1.3) + 前广场；lv2+ 斑马线，lv4 环形广场铺装 */
  W(A.pav, 2.6, 0.055, 2.6, 0, 0.0275, 0, 0.6);
  B(A.asph, 2.6, 0.064, 0.28, 0, 0.032, 1.16); B(A.asph, 2.6, 0.064, 0.28, 0, 0.032, -1.16);
  B(A.asph, 0.28, 0.064, 2.04, -1.16, 0.032, 0); B(A.asph, 0.28, 0.064, 2.04, 1.16, 0.032, 0);
  if (L >= 2) for (i = 0; i < 7; i++) B(A.line, 0.09, 0.006, 0.24, -0.9 + i * 0.3, 0.066, 1.16);
  if (L >= 3) for (i = 0; i < 7; i++) B(A.line, 0.24, 0.006, 0.09, -1.16, 0.066, -0.9 + i * 0.3);
  if (L >= 4) { Y(A.pavD, 0.46, 0.46, 0.008, 20, 0.02, 0.06, 0.78); Y(A.pav, 0.36, 0.36, 0.01, 20, 0.02, 0.064, 0.78); }
  if (L === 1) { /* 1990s：周边式商住楼（灰天面+水箱，四角围合）+ 后右板式天线塔 + 前左转角楼广告牌 */
    var SH = [[0.64, 0.5, A.plasterA, A.red], [0.12, 0.46, A.plasterB, A.teal], [-0.4, 0.5, A.plasterA, A.gold]];
    for (k = 0; k < 3; k++) { var s = SH[k];
      B(s[2], s[1], 0.5, 0.5, s[0], 0.31, 0.28); B(A.roofC, s[1] + 0.03, 0.025, 0.53, s[0], 0.57, 0.28);
      B(s[3], s[1] * 0.8, 0.09, 0.03, s[0], 0.13, 0.538);
      for (i = 0; i < 3; i++) { B(A.dark, 0.09, 0.11, 0.02, s[0] - s[1] * 0.28 + i * s[1] * 0.28, 0.33, 0.536); B(A.dark, 0.09, 0.1, 0.02, s[0] - s[1] * 0.28 + i * s[1] * 0.28, 0.49, 0.536); }
      B(A.plasterB, 0.1, 0.07, 0.09, s[0] - s[1] * 0.2, 0.61, 0.24); Y(A.mull, 0.045, 0.045, 0.09, 8, s[0] + s[1] * 0.24, 0.61, 0.3);
    }
    B(A.plasterB, 0.56, 0.62, 0.98, 0.6, 0.34, -0.42); B(A.roofC, 0.59, 0.02, 1.01, 0.6, 0.66, -0.42);
    for (i = 0; i < 4; i++) B(A.dark, 0.02, 0.1, 0.12, 0.882, 0.3 + (i % 2) * 0.22, -0.75 + Math.floor(i / 2) * 0.34);
    B(A.plasterB, 0.86, 0.42, 0.46, -0.3, 0.24, -0.72); B(A.roofC, 0.89, 0.02, 0.49, -0.3, 0.46, -0.72); Y(A.mull, 0.05, 0.05, 0.1, 8, -0.55, 0.49, -0.74);
    B(A.plasterA, 0.36, 0.56, 0.6, -0.7, 0.34, -0.22); B(A.roofC, 0.39, 0.02, 0.63, -0.7, 0.63, -0.22); for (i = 0; i < 4; i++) B(A.dark, 0.02, 0.1, 0.1, -0.882, 0.3 + (i % 2) * 0.2, -0.36 + Math.floor(i / 2) * 0.26);
    B(A.plasterA, 0.34, 0.6, 0.3, -0.72, 0.36, -0.78); B(A.roofC, 0.37, 0.02, 0.33, -0.72, 0.67, -0.78);
    B(A.plasterB, 0.32, 0.55, 0.32, 0.7, 0.335, 0.78); B(A.roofC, 0.35, 0.02, 0.35, 0.7, 0.62, 0.78); for (i = 0; i < 3; i++) B(A.dark, 0.07, 0.1, 0.02, 0.61 + i * 0.09, 0.4, 0.942);
    Y(A.plasterA, 0.3, 0.3, 0.62, 12, -0.58, 0.37, 0.24); Y(A.band, 0.32, 0, 0.12, 12, -0.58, 0.74, 0.24);
    B(A.poster, 0.32, 0.26, 0.02, -0.58, 0.43, 0.552);
    B(A.plasterA, 0.4, 1.1, 0.44, 0.66, 0.63, -0.7);
    for (i = 0; i < 10; i++) { B(A.dark, 0.075, 0.1, 0.02, 0.54 + (i % 3) * 0.12, 0.28 + Math.floor(i / 3) * 0.24, -0.476); B(A.dark, 0.02, 0.1, 0.075, 0.862, 0.28 + Math.floor(i / 3) * 0.24, -0.82 + (i % 3) * 0.12); }
    B(A.plasterB, 0.22, 0.09, 0.2, 0.66, 1.22, -0.7); Y(A.steel, 0.008, 0.008, 0.16, 5, 0.66, 1.34, -0.7); Y(A.mull, 0.05, 0.05, 0.1, 8, 0.54, 1.22, -0.8);
  } else { /* 2000s+：商场裙楼 + 前左弧形中庭；lv3+ 幕墙化 / lv4 二层体量+空中花园 */
    podium(A, L, ph); atrium(A, ph);
    B(A.awnW, 0.56, 0.035, 0.26, 0.2, 0.42, 0.63); for (i = -1; i <= 1; i += 2) B(A.steel, 0.02, 0.02, 0.14, 0.2 + i * 0.24, 0.47, 0.56);
    if (L === 2) { B(A.poster, 0.02, 0.44, 0.3, -0.912, ph * 0.55, -0.2); B(A.poster, 0.02, 0.44, 0.3, -0.912, ph * 0.55, -0.62); B(A.poster, 0.3, 0.44, 0.02, 0.55, ph * 0.55, 0.512);
      B(A.glass, 1.1, 0.05, 0.3, -0.12, ph + 0.07, -0.3); for (i = 0; i < 3; i++) B(A.mull, 0.14, 0.08, 0.12, -0.55 + i * 0.3, ph + 0.05, -0.7); }
    if (L >= 3) {
      B(A.band, 0.03, 0.56, 0.86, -0.912, ph * 0.56, -0.32); B(scrM, 0.045, 0.5, 0.8, -0.932, ph * 0.56, -0.32);
      if (L === 3) { B(A.poster, 0.3, 0.44, 0.02, 0.55, ph * 0.55, 0.512); for (i = 0; i < 2; i++) B(A.mull, 0.16, 0.08, 0.14, -0.3 + i * 0.4, ph + 0.05, -0.78); }
      for (i = 0; i < 2; i++) B(A.roofG, 0.6, 0.028, 0.4, -0.5 + i * 0.7, ph + 0.037, -0.6 + i * 0.16);
      W(A.pav, 1.3, 0.012, 0.1, -0.15, ph + 0.035, -0.35, 0.6);
      for (i = 0; i < 2; i++) { Y(A.steel, 0.012, 0.016, 0.4, 6, -0.6 + i * 1.24, 0.28, 0.9); B(lampM, 0.09, 0.03, 0.05, -0.6 + i * 1.24, 0.5, 0.9); }
    }
    if (L >= 4) {
      W(A.wallC, 1.2, 0.22, 0.56, -0.12, ph + 0.13, -0.5, 0.8); B(A.glass, 1.2, 0.07, 0.56, -0.12, ph + 0.21, -0.5); B(A.mull, 1.24, 0.03, 0.6, -0.12, ph + 0.26, -0.5);
      B(A.roofG, 0.5, 0.026, 0.38, 0.25, ph + 0.033, 0.2); W(A.pav, 0.9, 0.014, 0.12, -0.05, ph + 0.035, 0.0, 0.6); B(A.roofG, 0.3, 0.026, 0.22, -0.25, ph + 0.033, 0.3);
      for (i = 0; i < 3; i++) { Y(A.trunk, 0.014, 0.02, 0.14, 5, -0.5 + i * 0.16, ph + 0.31, -0.4); O(A.leaf, 0.06, -0.5 + i * 0.16, ph + 0.41, -0.4); }
      B(A.awnW, 0.9, 0.05, 0.34, 0.2, 0.5, 0.7); for (i = -1; i <= 1; i += 2) Y(A.steel, 0.016, 0.016, 0.3, 6, 0.2 + i * 0.4, 0.35, 0.78);
      B(A.band, 0.76, 0.6, 0.035, 0.5, ph * 0.56, 0.505); B(scrM, 0.7, 0.54, 0.05, 0.5, ph * 0.56, 0.518);
    }
    if (L >= 2 && signM) { B(signM, 0.42, 0.12, 0.04, -0.05, 0.6, 0.52); B(A.band, 0.46, 0.025, 0.05, -0.05, 0.675, 0.52); }
  }
  /* 塔群 + 中层裙房（环绕四角自裙楼升起：左后角/后排/右后角/右前角）：lv2 双塔+四裙房 → lv3 五塔+两裙房 → lv4 主塔冠顶+七塔+裙房 */
  if (L === 2) { tower(A, 0.55, -0.72, 0.38, 0.38, 1.62); tower(A, -0.58, -0.7, 0.34, 0.34, 1.3); tower(A, 0.72, 0.78, 0.3, 0.3, 1.25); midrise(A, -0.62, -0.2, 0.3, 0.4, 1.0); midrise(A, 0.0, -0.95, 0.5, 0.26, 0.6); midrise(A, 0.72, -0.1, 0.28, 0.36, 0.8); }
  if (L === 3) { tower(A, 0.25, -0.62, 0.42, 0.42, 2.2); tower(A, -0.64, -0.75, 0.36, 0.36, 2.0); tower(A, 0.68, -0.85, 0.32, 0.32, 2.05); tower(A, 0.72, 0.78, 0.3, 0.3, 1.8); tower(A, 0.7, -0.15, 0.28, 0.3, 1.7); midrise(A, -0.62, -0.2, 0.3, 0.36, 1.1); midrise(A, -0.1, -0.95, 0.4, 0.26, 0.85); }
  if (L >= 4) { var th = tower(A, 0.2, -0.6, 0.46, 0.46, 2.4); Y(A.glass, 0.2, 0.24, 0.12, 10, 0.2, th + 0.02, -0.6); Y(A.steel, 0.002, 0.014, 0.2, 6, 0.2, th + 0.16, -0.6);
    tower(A, -0.66, -0.78, 0.38, 0.38, 2.2); tower(A, -0.62, -0.25, 0.3, 0.36, 2.0); tower(A, 0.68, -0.85, 0.36, 0.36, 2.4); tower(A, 0.72, 0.78, 0.32, 0.32, 2.1); tower(A, 0.72, -0.15, 0.28, 0.34, 1.9); tower(A, -0.15, -0.95, 0.34, 0.26, 1.5); midrise(A, 0.4, -0.95, 0.3, 0.26, 0.9); }
  /* IFS 爬墙熊猫（lv4 识别特征）：攀附裙楼 +z 前立面右端转角（主视角可见） */
  if (L >= 4) { var py = ph + 0.14;
    O(A.pandaW, 0.085, 0.8, py, 0.56, 0.5, 0, 0, 0.85, 1.2, 0.85);
    O(A.pandaW, 0.062, 0.84, py + 0.17, 0.6); O(A.pandaB, 0.024, 0.8, py + 0.22, 0.58); O(A.pandaB, 0.024, 0.88, py + 0.21, 0.58);
    O(A.pandaB, 0.028, 0.84, py + 0.15, 0.655, 0, 0, 0, 0.7, 1, 0.5);
    B(A.pandaB, 0.035, 0.15, 0.035, 0.9, py + 0.06, 0.55, 0, 0, -0.4); B(A.pandaB, 0.035, 0.14, 0.035, 0.7, py + 0.12, 0.55, 0, 0, 0.45);
    B(A.pandaB, 0.038, 0.13, 0.038, 0.73, py - 0.12, 0.54, 0, 0, 0.5); B(A.pandaB, 0.038, 0.12, 0.038, 0.88, py - 0.15, 0.54, 0, 0, -0.35);
  }
  fountain(A, L);
  /* 四周行道树阵（人行道 ±0.96，逐年代加密增大）+ 广场树池 */
  var tr = [0.09, 0.105, 0.12, 0.13][L - 1], tn = [4, 5, 6, 7][L - 1], sn = [2, 3, 4, 4][L - 1], bn = [0, 2, 3, 4][L - 1];
  for (i = 0; i < tn; i++) tree(A, -0.9 + i * 1.25 / (tn - 1), 0.93, tr);
  for (i = 0; i < sn; i++) { tree(A, -0.96, -0.85 + i * 1.1 / Math.max(1, sn - 1), tr * 0.95); if (L >= 2 || i < 1) tree(A, 0.96, -0.85 + i * 1.1 / Math.max(1, sn - 1), tr * 0.9); }
  for (i = 0; i < bn; i++) tree(A, -0.75 + i * 1.5 / Math.max(1, bn - 1), -0.96, tr * 0.9);
  if (L >= 3) tree(A, -0.72, 0.7, tr * 0.85); if (L >= 4) tree(A, 0.36, 0.6, tr * 0.8);
  flush(g);
  var e0 = scrM ? scrM.emissiveIntensity : 0;
  g.userData.anim.push(function (t) { if (scrM) scrM.emissiveIntensity = e0 + 0.3 * (0.5 + 0.5 * Math.sin(t * 1.4)); });
  if (L >= 3) g.userData.anim.push(function (t) { var s = 0.5 + 0.5 * Math.sin(t * 1.1); if (signM) signM.emissiveIntensity = (L >= 4 ? 0.6 : 0.14) + 0.2 * s; if (lampM) lampM.emissiveIntensity = 0.5 + 0.2 * s; });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[19] = function (level) { return block19(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
