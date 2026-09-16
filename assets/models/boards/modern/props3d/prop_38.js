/* 大富翁·现代写实棋盘（台）格 38「士林夜市」—— 弧拱门招牌 + 低矢高长跨拱棚市场街 + 露天彩篷摊位阵列 + 老城杂院，四年代演进 · v3 结构+材质精修 R3
 * 视觉基准 refs/modern/prop_38.png（四象限 1990s→2020s，机位 +x+z 前右 3/4 俯视）：正面 +Z 拱门+广场；+X 侧彩篷摊位双排（近侧，色篷面朝外）；
 *   市场街低弧拱棚沿 Z 纵贯（门棚→大厅棚 T 字衔接，lv3/4 延伸至后缘）；-X 侧老楼群（远侧，左后楼 lv2+ 升为天际线）；-Z 后排（lv1-2 老公寓+水塔 / lv4 LED 塔楼）。
 * 年代特征：lv1 1990s 红铁皮半圆拱+红山墙彩绘招牌+八字红檐翼、铁皮矮棚杂院（灰绿/锈/白多色垄板+密集水塔空调）、3F 老公寓、彩篷摊稀疏；
 *   lv2 2000s 浅银灰锁边金属低弧长跨拱棚+钢肋+侧高窗+亮玻璃山墙月牙、霓虹招牌+竖招+灯串、摊位阵列成排+店招+翻新老楼；
 *   lv3 2010s 拱棚加大延伸+脊部采光带+左后楼顶钢架玻璃中庭、右侧玻璃钢架顶棚、金属板小楼、行道树成排+护柱；
 *   lv4 2020s 玻璃幕墙商厦（逐层暖光带）+LED 巨屏塔楼+双 pergola+天线、大跨弧形雨棚、暖窗角楼、树池行道树。
 * 工程要点：桶合并（材质参数为键，顶点色承载主色，世界尺寸 boxUV 烘焙）→ mesh lv1..4 = 17/20/20/23，tris ≈ 8.0k/10.8k/11.9k/10.3k；128px 多层 Canvas
 *   （铺装/灰泥/波纹铁皮/锁边金属/木板/篷布/灯箱/夜景幕墙/LED/树冠/竖招）；招牌 256×64 + LED/竖招独立网格（map+emissiveMap）；零 Math.random（LCG）；动画 2 项克制。
 * 契约：window.Props3DModern[38](level 1..4) → 每次全新 Group；占地 ≤2.6×2.6（实测 2.60）；底面 y=0；正面 +Z；高度 lv1..4 = 1.10/1.31/1.42/1.90（带内）。
 * R1 变更：全面重构 v2 骨架——拱门改筒拱+山墙字牌+双柱门架、市场街长跨拱棚、摊位重做（台身/台面/货品/灯箱/双柱/斜篷垂帘/菜单板）双排阵列、
 *   老楼群（窗+窗台/水塔/空调/天线/垄板坡顶）、广场铺装分区/路缘/灯柱/树池、lv4 塔楼 LED+竖招+pergola。
 * R2 变更：拱棚改低矢高弧拱（vaultGeo/arcGeo/gableGeo，矢高≈0.3 跨度）、屋面提亮浅银灰+钢肋减重、招牌前移至拱面外+加大字清、拱棚内壁暖光衬里+顶灯、
 *   +X 外排摊位改露天（色篷露出）+内排窄棚顶、lv1 杂院扩为 5 棚多色、广场加灌木花箱/长凳/护柱、树冠加大、lv4 角楼暖窗条、地面暖光减淡。
 * R3 变更：山墙辐条改竖梃（按弧公式取高，消"太阳射线"外露）、幕墙纹理改逐层暖光带、脊部采光带、摊位加密（间距 0.21）、lv3/4 拱棚延伸至后缘并
 *   把中庭/pergola/水塔/天线转移到升高的左后楼、侧翼店口灯带外露修正+彩色店招、檩下悬挂店招、拱面 32/40 段、山墙月牙改微发光玻璃。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_38] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TXC = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h), c2; c2 = [q.r, q.g, q.b]; _PC[h] = c2; return c2; } return c; }
function RG(s) { s = (s >>> 0) || 383; return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function mkTex(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; }
function TX(id, seed, draw) { if (_TXC[id]) return _TXC[id]; var c = cv(128, 128); draw(c.getContext('2d'), 128, 128, RG(seed)); return (_TXC[id] = mkTex(c)); }
function F(g, s, x, y, w, h) { g.fillStyle = s; g.fillRect(x, y, w, h); }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? 'rgba(255,255,255,' + a + ')' : 'rgba(22,20,16,' + a + ')', R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
function DOT(g, s, x, y, r) { g.fillStyle = s; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill(); }
/* ---- 弧拱几何（弦半宽 hw / 矢高 rise / 长 len；弦线在 y=0，顶点 y=rise） ---- */
function vaultGeo(hw, rise, len, seg) {
  var R = (hw * hw + rise * rise) / (2 * rise), th = Math.asin(Math.min(1, hw / R));
  return xf(new THREE.CylinderGeometry(R, R, len, seg, 1, true, -th, 2 * th), 0, rise - R, 0, -PI / 2);
}
function arcGeo(hw, rise, tube, seg) {
  var R = (hw * hw + rise * rise) / (2 * rise), th = Math.asin(Math.min(1, hw / R));
  return xf(new THREE.TorusGeometry(R, tube, 4, seg, 2 * th), 0, rise - R, 0, 0, 0, PI / 2 - th);
}
function gableGeo(hw, rise) {
  var R = (hw * hw + rise * rise) / (2 * rise), cy = rise - R, a0 = Math.atan2(-cy, hw), sh = new THREE.Shape();
  sh.moveTo(hw, 0); sh.absarc(0, cy, R, a0, PI - a0, false); sh.lineTo(-hw, 0); return new THREE.ShapeGeometry(sh, 24);
}
/* ---- 多层 Canvas（近白基色 × 顶点色 = 最终色；模块级缓存） ---- */
var TEX = {
  conc: function () { return TX('conc', 3801, function (g, w, h, R) { F(g, '#ece8df', 0, 0, w, h); var i, j;             /* 铺装：分格缝+错色+油渍+噪点 */
    for (i = 0; i < 4; i++) for (j = 0; j < 4; j++) F(g, (i + j) % 2 ? 'rgba(255,255,255,0.16)' : 'rgba(80,76,68,0.10)', j * 32 + 1, i * 32 + 1, 30, 30);
    for (i = 0; i <= 4; i++) { F(g, 'rgba(60,56,50,0.5)', i * 32 - 1, 0, 2, h); F(g, 'rgba(60,56,50,0.5)', 0, i * 32 - 1, w, 2); }
    for (i = 0; i < 8; i++) F(g, 'rgba(70,64,54,' + (0.05 + R() * 0.08).toFixed(2) + ')', R() * w, R() * h, 8 + R() * 24, 5 + R() * 14); SPK(g, w, h, 160, 0.06, R); }); },
  plas: function () { return TX('plas', 3802, function (g, w, h, R) { F(g, '#f5f1e8', 0, 0, w, h); var i, x0;         /* 灰泥墙：雨渍+发丝裂纹+底部泛潮+噪点 */
    for (i = 0; i < 9; i++) F(g, 'rgba(120,110,88,' + (0.05 + R() * 0.07).toFixed(2) + ')', R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80);
    for (i = 0; i < 4; i++) { x0 = R() * w; g.strokeStyle = 'rgba(110,100,80,0.18)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); }
    F(g, 'rgba(90,84,66,0.1)', 0, 108, w, 20); SPK(g, w, h, 120, 0.05, R); }); },
  corr: function () { return TX('corr', 3803, function (g, w, h, R) { F(g, '#f4f4f2', 0, 0, w, h); var i;             /* 波纹铁皮：垄沟高光/阴影+板缝+锈斑 */
    for (i = 0; i < w; i += 8) { F(g, 'rgba(255,255,255,0.5)', i + 1, 0, 2, h); F(g, 'rgba(30,32,36,0.32)', i + 4, 0, 3, h); }
    for (i = 0; i < h; i += 64) F(g, 'rgba(30,32,36,0.28)', 0, i, w, 2);
    for (i = 0; i < 16; i++) F(g, 'rgba(120,60,30,' + (0.12 + R() * 0.25).toFixed(2) + ')', R() * w, R() * h, 3 + R() * 9, 2 + R() * 6); SPK(g, w, h, 40, 0.08, R); }); },
  seam: function () { return TX('seam', 3809, function (g, w, h, R) { F(g, '#f4f6f7', 0, 0, w, h); var i;             /* 直立锁边金属：浅银灰长缝+板缝+污痕 */
    for (i = 0; i < w; i += 16) { F(g, 'rgba(46,56,66,0.3)', i, 0, 2, h); F(g, 'rgba(255,255,255,0.6)', i + 2, 0, 1, h); }
    for (i = 0; i < h; i += 64) F(g, 'rgba(46,56,66,0.16)', 0, i, w, 1);
    for (i = 0; i < 6; i++) F(g, 'rgba(80,92,102,' + (0.04 + R() * 0.05).toFixed(2) + ')', R() * w, 0, 3 + R() * 6, h); SPK(g, w, h, 40, 0.04, R); }); },
  wood: function () { return TX('wood', 3804, function (g, w, h, R) { F(g, '#f3ece0', 0, 0, w, h); var i;             /* 摊台木板：板缝+木纹+节疤 */
    for (i = 0; i < h; i += 21) F(g, 'rgba(70,44,22,0.5)', 0, i, w, 2);
    for (i = 0; i < 40; i++) F(g, 'rgba(90,60,30,' + (0.06 + R() * 0.1).toFixed(2) + ')', R() * w, R() * h, 10 + R() * 40, 1);
    for (i = 0; i < 5; i++) DOT(g, 'rgba(60,36,16,0.35)', R() * w, R() * h, 2 + R() * 2); }); },
  awn: function () { return TX('awn', 3805, function (g, w, h, R) { F(g, '#f6f6f4', 0, 0, w, h); var i;              /* 篷布：经纬织纹+折痕高光/阴影+下摆污渍 */
    for (i = 0; i < w; i += 4) { F(g, 'rgba(40,40,40,0.07)', i, 0, 1, h); F(g, 'rgba(40,40,40,0.07)', 0, i, w, 1); }
    for (i = 0; i < w; i += 32) { F(g, 'rgba(255,255,255,0.45)', i + 2, 0, 4, h); F(g, 'rgba(30,30,30,0.13)', i + 26, 0, 3, h); } F(g, 'rgba(80,70,50,0.1)', 0, 112, w, 16); SPK(g, w, h, 40, 0.04, R); }); },
  lbox: function () { return TX('lbox', 3806, function (g, w, h, R) { F(g, '#fff1d2', 0, 0, w, h); var i, j, x, L;    /* 摊位灯箱：菜单字行+顶部灯泡串（map+emissiveMap） */
    for (i = 14; i < h; i += 24) for (j = 0, x = 6; j < 5 && x < w - 8; j++) { L = 8 + R() * 18; F(g, 'rgba(70,32,10,0.6)', x, i, L, 8); x += L + 6; }
    for (i = 0; i < 8; i++) DOT(g, 'rgba(255,255,255,0.9)', 8 + i * 16, 5, 3); F(g, 'rgba(255,200,120,0.25)', 0, 0, w, h); }); },
  leaf: function () { return TX('leaf', 3807, function (g, w, h, R) { F(g, '#f0f6e6', 0, 0, w, h); var i;             /* 树冠：明暗叶斑 */
    for (i = 0; i < 34; i++) DOT(g, i % 2 ? 'rgba(34,66,24,0.28)' : 'rgba(255,255,240,0.3)', R() * w, R() * h, 2 + R() * 4); }); },
  led: function () { return TX('led', 3808, function (g, w, h, R) { var gr = g.createLinearGradient(0, 0, 0, h);      /* LED 大屏：夜景人物海报+字条+像素格（map+emissiveMap） */
    gr.addColorStop(0, '#1c3a7a'); gr.addColorStop(1, '#c04a8a'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    DOT(g, '#ffe9c8', 64, 48, 22); g.fillStyle = '#f3c9d4'; g.beginPath(); g.moveTo(64, 66); g.lineTo(96, 118); g.lineTo(32, 118); g.closePath(); g.fill();
    F(g, '#ffffff', 10, 12, 50, 8); F(g, '#ffd54a', 10, 24, 34, 6); F(g, '#5ec8ff', 84, 100, 34, 6);
    for (var i = 0; i < w; i += 4) { F(g, 'rgba(0,4,16,0.35)', i, 0, 1, h); F(g, 'rgba(0,4,16,0.35)', 0, i, w, 1); } }); },
  curt: function () { return TX('curt', 3810, function (g, w, h, R) { F(g, '#26333d', 0, 0, w, h); var i, j,          /* 夜景幕墙：逐层暖光带（16px 窄格）+层间暗梁+细竖梃（map+emissiveMap） */
    cs = ['#ffe6c2', '#ffd9a4', '#f6e7cf', '#eed6ae'];
    for (i = 0; i < 4; i++) { for (j = 0; j < 8; j++) { if (R() < 0.1) continue; F(g, cs[(R() * 4) | 0], j * 16 + 1, i * 32 + 2, 14, 21); } F(g, 'rgba(255,255,255,0.28)', 0, i * 32 + 2, w, 4); F(g, '#38454e', 0, i * 32 + 24, w, 8); F(g, 'rgba(255,255,255,0.15)', 0, i * 32 + 24, w, 1); }
    for (i = 0; i <= 8; i++) F(g, 'rgba(8,12,16,0.55)', i * 16 - 1, 0, 1, h); }); },
  bann: function () { return TX('bann', 3811, function (g, w, h, R) { F(g, '#8a1a12', 0, 0, w, h); var i;             /* 竖招：红底黄字（map+emissiveMap）；贴窄面横向 4× 预拉伸补偿 */
    g.strokeStyle = '#f0c060'; g.lineWidth = 3; g.strokeRect(2, 2, w - 4, h - 4);
    g.save(); g.scale(4, 1); g.fillStyle = '#ffd54a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 26px "Microsoft YaHei",sans-serif';
    var s2 = '夜市美食'; for (i = 0; i < 4; i++) g.fillText(s2[i], 16, 18 + i * 30); g.restore(); F(g, 'rgba(255,255,255,0.12)', 0, 0, w, 12); }); }
};
/* ---- 桶合并构建器：桶 = 材质参数(rg|mt|em|ei|tex|ws|ds|op)，顶点色承载主色调；flush 烘焙世界尺寸 boxUV ---- */
var BK;
function BKT(rg, mt, em, ei, tex, ws, ds, op) { var k = [rg, mt || 0, em || '', ei || 0, tex || '', ws || 1, ds || 0, op || 1].join('|'); return BK[k] || (BK[k] = { rg: rg, mt: mt || 0, em: em, ei: ei, tex: tex, ws: ws || 1, ds: ds, op: op || 1, gs: [], cs: [] }); }
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) { if (x || y || z || rx || ry || rz || sx || sy || sz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0, 'YXZ')), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function put(b, g, h) { b.gs.push(g); b.cs.push(V(h)); }
function B(b, h, w, ht, d, x, y, z, rx, ry, rz) { put(b, xf(new THREE.BoxGeometry(w, ht, d), x, y, z, rx, ry, rz), h); }
function Y(b, h, r1, r2, ht, s, x, y, z, rx, ry, rz) { put(b, xf(new THREE.CylinderGeometry(r1, r2, ht, s), x, y, z, rx, ry, rz), h); }
function O(b, h, r, x, y, z, ry) { put(b, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z, 0, ry || 0), h); }
function A2(b, h, geo, x, y, z, rx, ry, rz, sx, sy, sz) { put(b, xf(geo, x, y, z, rx, ry, rz, sx, sy, sz), h); }
function flush(g, hot) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i, j, q, r, u2;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.count; }
    if (!P) continue;
    var pa = new Float32Array(P * 3), na = new Float32Array(P * 3), ca = new Float32Array(P * 3), ua = new Float32Array(P * 2), o = 0, iv = 1 / b.ws;
    for (i = 0; i < gs.length; i++) {
      var cnt = gs[i].attributes.position.count, c = b.cs[i]; pa.set(gs[i].attributes.position.array, o * 3); na.set(gs[i].attributes.normal.array, o * 3);
      for (j = 0; j < cnt; j++) { ca[(o + j) * 3] = c[0]; ca[(o + j) * 3 + 1] = c[1]; ca[(o + j) * 3 + 2] = c[2]; } o += cnt;
    }
    for (i = 0; i < P; i += 3) {                                   /* 三角面法线主轴 → 世界坐标投影 UV（每 ws 米一重复） */
      q = i * 3; var e1x = pa[q + 3] - pa[q], e1y = pa[q + 4] - pa[q + 1], e1z = pa[q + 5] - pa[q + 2], e2x = pa[q + 6] - pa[q], e2y = pa[q + 7] - pa[q + 1], e2z = pa[q + 8] - pa[q + 2];
      var ax = Math.abs(e1y * e2z - e1z * e2y), ay = Math.abs(e1z * e2x - e1x * e2z), az = Math.abs(e1x * e2y - e1y * e2x);
      for (j = 0; j < 3; j++) { r = q + j * 3; u2 = (i + j) * 2; if (ay >= ax && ay >= az) { ua[u2] = pa[r] * iv; ua[u2 + 1] = pa[r + 2] * iv; } else if (ax >= az) { ua[u2] = pa[r + 2] * iv; ua[u2 + 1] = pa[r + 1] * iv; } else { ua[u2] = pa[r] * iv; ua[u2 + 1] = pa[r + 1] * iv; } }
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3));
    geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true, side: b.ds ? THREE.DoubleSide : THREE.FrontSide, transparent: b.op < 1, opacity: b.op });
    if (b.tex) m.map = TEX[b.tex]();
    if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tex) m.emissiveMap = m.map; hot[b.em] = m; }
    var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function signMesh(txt, w, h, d, bg, fg, ei, neon) {               /* 拱门招牌：Canvas 256×64 → map + emissiveMap（独立 mesh，原生盒 UV） */
  var c = cv(256, 64), g = c.getContext('2d'); F(g, bg, 0, 0, 256, 64);
  g.strokeStyle = neon ? '#565c62' : '#f0c060'; g.lineWidth = 3; g.strokeRect(3, 3, 250, 58);
  if (neon) { g.shadowColor = '#ff5a34'; g.shadowBlur = 7; }
  g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 50px "Microsoft YaHei",sans-serif'; g.fillText(txt, 128, 35);
  if (neon) g.fillText(txt, 128, 35);
  var t = mkTex(c), m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.45, emissive: C('#ffffff'), emissiveMap: t, emissiveIntensity: ei }); m.userData.previewColor = bg;
  var ms = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); ms.castShadow = ms.receiveShadow = true; return ms;
}
function texMesh(id, w, h, d, ei) {                                /* LED/竖招：Canvas → 独立盒网格（六面贴图） */
  var t = TEX[id](), m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.35, emissive: C('#ffffff'), emissiveMap: t, emissiveIntensity: ei });
  var ms = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); ms.castShadow = ms.receiveShadow = true; return ms;
}
/* ---- 士林夜市四年代 ---- */
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_38_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 38; g.userData.level = level;
  var hot = g.userData.hotM = {}; BK = {}; var L = level, i, j, k = 0, x, z, a, n;
  var pave = BKT(0.92, 0, '', 0, 'conc', 0.6), plas = BKT(0.9, 0, '', 0, 'plas', 0.8), corr = BKT(0.75, 0.2, '', 0, 'corr', 0.32, 1), seam = BKT(0.4, 0.55, '', 0, 'seam', 0.5, 1),
    wood = BKT(0.85, 0, '', 0, 'wood', 0.4), awn = BKT(0.9, 0, '', 0, 'awn', 0.3, 1), steel = BKT(0.45, 0.65), beam = BKT(0.5, 0.6), post = BKT(0.6, 0.4), metal = BKT(0.55, 0.45),
    glass = BKT(0.12, 0.7), gglass = BKT(0.15, 0.5, '#9fc4d4', 0.22), curt = BKT(0.2, 0.55, '#ffffff', 0.5, 'curt', 0.32), gcan = BKT(0.1, 0.6, '', 0, '', 1, 1, 0.4),
    glow = BKT(0.5, 0, '#ffb45c', 0.5, 'lbox', 0.25), lamp = BKT(0.4, 0, '#ffd9a0', 0.9), warm = BKT(0.6, 0, '#ffc784', 0.5), fglow = BKT(0.8, 0, '#ffb870', 0.12), ceil = BKT(0.9, 0, '#ffc27a', 0.3), leaf = BKT(0.95, 0, '', 0, 'leaf', 0.5);
  var ST = '#3f454c', BV = '#737b83', SL = '#6a7178', PC = L === 1 ? '#5e6a74' : '#3a4046', WHT = '#e9e5da', GLD = '#3d5a6a',
    AW = [['#2f8f8a', '#f0c132', '#c8362c', '#e8782c', '#2f5f9c', '#c2418a'], ['#3f8a4a', '#2f5f9c', '#c8362c', '#f0c132', '#e8782c', '#2f8f8a'],
    ['#c8362c', '#e8782c', '#f0c132', '#3f8a4a', '#2f5f9c', '#c2418a'], ['#c2418a', '#7a4a9c', '#f0c132', '#c8362c', '#3f8a4a', '#2f8f8a']][L - 1],
    GD = ['#d94a3a', '#f2c94c', '#4f9a5c', '#e6e2d8', '#3b6fb5'];
  /* 摊位：台身+台面+货品+摊口灯箱+双前柱+斜篷垂帘+背板菜单灯箱；ry=朝向（局部面朝 +z） */
  function stall(x, z, ry, kk, w, white) {
    var cs = Math.cos(ry), sn = Math.sin(ry), W = w || 0.2, tb = white ? plas : wood, th = white ? WHT : '#5c3e27', p;
    function P(lx, lz) { return [x + lx * cs + lz * sn, z - lx * sn + lz * cs]; }
    p = P(0, 0); B(tb, th, W, 0.14, 0.16, p[0], 0.11, p[1], 0, ry); B(plas, white ? '#f4f1ea' : '#8a6a4a', W + 0.02, 0.012, 0.18, p[0], 0.186, p[1], 0, ry);
    p = P(-W * 0.22, -0.01); B(metal, GD[kk % 5], 0.07, 0.05, 0.06, p[0], 0.216, p[1], 0, ry); p = P(W * 0.2, 0.02); B(metal, GD[(kk + 2) % 5], 0.06, 0.04, 0.05, p[0], 0.212, p[1], 0, ry);
    p = P(0, 0.085); B(glow, '#8a6a3a', W * 0.9, 0.05, 0.012, p[0], 0.165, p[1], 0, ry);
    p = P(-W / 2 + 0.012, 0.075); B(post, ST, 0.016, 0.36, 0.016, p[0], 0.22, p[1], 0, ry); p = P(W / 2 - 0.012, 0.075); B(post, ST, 0.016, 0.36, 0.016, p[0], 0.22, p[1], 0, ry);
    p = P(0, 0.05); B(awn, AW[kk % 6], W + 0.09, 0.014, 0.24, p[0], 0.42, p[1], 0.35, ry); p = P(0, 0.17); B(awn, AW[kk % 6], W + 0.09, 0.04, 0.01, p[0], 0.362, p[1], 0, ry);
    p = P(0, -0.072); B(wood, '#4a3524', W, 0.2, 0.012, p[0], 0.3, p[1], 0, ry); p = P(0, -0.065); B(glow, '#a08050', W * 0.8, 0.09, 0.006, p[0], 0.32, p[1], 0, ry);
  }
  function tree(x, z, s, pl) {
    if (pl) { B(plas, '#8d877b', 0.16 * s, 0.05, 0.16 * s, x, 0.065, z); B(leaf, '#4a6a34', 0.13 * s, 0.02, 0.13 * s, x, 0.095, z); }
    Y(wood, '#4e3d2a', 0.014 * s, 0.02 * s, 0.24 * s, 6, x, 0.04 + 0.12 * s, z);
    A2(leaf, '#35582b', new THREE.IcosahedronGeometry(0.11 * s, 1), x, 0.04 + 0.28 * s, z, 0, 0.4, 0);
    A2(leaf, '#4a7638', new THREE.IcosahedronGeometry(0.088 * s, 1), x + 0.042 * s, 0.04 + 0.36 * s, z - 0.03 * s, 0, 1.2, 0);
    A2(leaf, '#5d8a45', new THREE.IcosahedronGeometry(0.064 * s, 1), x - 0.035 * s, 0.04 + 0.42 * s, z + 0.03 * s, 0, 2.1, 0);
  }
  function lampPost(x, z, ry) {
    Y(post, ST, 0.012, 0.016, 0.42, 8, x, 0.25, z); B(post, ST, 0.13, 0.012, 0.012, x + Math.cos(ry) * 0.06, 0.455, z - Math.sin(ry) * 0.06, 0, ry);
    B(lamp, '#ffe2b0', 0.05, 0.028, 0.045, x + Math.cos(ry) * 0.115, 0.443, z - Math.sin(ry) * 0.115, 0, ry);
  }
  function winRow(ax, a0, a1, yy, c, cnt, litEvery) {              /* 窗行：ax='x' 沿 x 铺 / 'z' 沿 z 铺，c=墙面法向坐标 */
    for (var t = 0; t < cnt; t++) { var u = a0 + (t + 0.5) * (a1 - a0) / cnt, lit = litEvery && (t % litEvery === 1), hb = lit ? warm : glass, hc = lit ? '#ffd9a8' : '#26333d';
      if (ax === 'x') { B(hb, hc, 0.07, 0.09, 0.016, u, yy, c); B(plas, '#e8e2d4', 0.09, 0.014, 0.028, u, yy - 0.055, c); }
      else { B(hb, hc, 0.016, 0.09, 0.07, c, yy, u); B(plas, '#e8e2d4', 0.028, 0.014, 0.09, c, yy - 0.055, u); } }
  }
  function gable(b, hex, gx, gy, gz, w, d, rise, ry) {             /* 双坡垄板顶（脊向 ry） */
    var l = Math.sqrt(d * d / 4 + rise * rise), ang = Math.atan2(rise, d / 2), cs = Math.cos(ry), sn = Math.sin(ry), o = d / 4;
    B(b, hex, w + 0.05, 0.014, l + 0.02, gx + sn * o, gy + rise / 2, gz + cs * o, ang, ry, 0);
    B(b, hex, w + 0.05, 0.014, l + 0.02, gx - sn * o, gy + rise / 2, gz - cs * o, -ang, ry, 0);
    B(steel, ST, w + 0.05, 0.018, 0.03, gx, gy + rise, gz, 0, ry, 0);
  }
  function acTank(xx, zz, yy, s) {
    B(metal, '#b8bcc0', 0.075 * s, 0.05 * s, 0.05 * s, xx, yy, zz, 0, 0.4, 0); B(metal, '#9aa0a6', 0.05 * s, 0.02 * s, 0.05 * s, xx + 0.05 * s, yy, zz + 0.03 * s);
    Y(metal, '#a8a49c', 0.04 * s, 0.04 * s, 0.12 * s, 12, xx - 0.08 * s, yy + 0.06 * s, zz);
  }
  function bench(xx, zz) { B(wood, '#6a5a44', 0.26, 0.02, 0.09, xx, 0.09, zz); B(steel, ST, 0.02, 0.07, 0.08, xx - 0.1, 0.055, zz); B(steel, ST, 0.02, 0.07, 0.08, xx + 0.1, 0.055, zz); }
  function mullions(hw2, rs2, cxx, cy, zz, cnt) {                   /* 弧拱山墙竖梃：弦线→弧线，高度按弧公式取（不外露拱顶） */
    var R = (hw2 * hw2 + rs2 * rs2) / (2 * rs2), t, dx, hh;
    for (t = 1; t < cnt; t++) { dx = -hw2 + t * 2 * hw2 / cnt; hh = Math.sqrt(Math.max(0, R * R - dx * dx)) - (R - rs2); B(steel, ST, 0.012, hh, 0.012, cxx + dx, cy + hh / 2, zz); }
  }
  /* ===== 地面：广场铺装分区 + 前后路缘 ===== */
  B(pave, '#a8a294', 2.6, 0.04, 2.6, 0, 0.02, 0);
  B(pave, '#cbc4b5', 2.56, 0.012, 0.32, -0.02, 0.045, 1.02);       /* 前广场 */
  B(pave, '#7b7770', 2.6, 0.012, 0.11, 0, 0.045, 1.245);           /* 前人行道 */
  B(pave, '#7b7770', 0.11, 0.012, 2.36, 1.245, 0.045, -0.12);      /* 右人行道 */
  B(plas, '#d9d3c5', 2.6, 0.02, 0.018, 0, 0.056, 1.185); B(plas, '#d9d3c5', 0.018, 0.02, 2.36, 1.185, 0.056, -0.12);
  /* ===== 拱门：低弧筒拱 + 山墙字牌 + 双柱门架（+lv1 八字红檐翼） ===== */
  var cx = -0.2, gw = [0.44, 0.46, 0.5, 0.55][L - 1], grs = [0.4, 0.32, 0.3, 0.29][L - 1], gsp = [0.5, 0.6, 0.66, 0.76][L - 1], gz0 = 0.1, gz1 = 0.86, glen = gz1 - gz0, gzc = (gz0 + gz1) / 2;
  A2(L === 1 ? corr : seam, L === 1 ? '#b04434' : L === 4 ? '#bcc4c9' : '#b4bdc3', vaultGeo(gw, grs, glen, 32), cx, gsp, gzc);
  A2(ceil, '#ffe2c0', vaultGeo(gw - 0.012, grs - 0.012, glen - 0.02, 32), cx, gsp, gzc, 0, 0, 0, -1, 1, 1);
  B(beam, BV, 0.03, 0.02, glen, cx, gsp + grs, gzc);
  for (i = 0; i < 4; i++) A2(beam, BV, arcGeo(gw + 0.006, grs + 0.006, 0.01, 20), cx, gsp, gz0 + 0.08 + i * (glen - 0.16) / 3);
  for (i = 0; i < 4; i++) B(lamp, '#ffe2b0', 0.024, 0.02, 0.024, cx, gsp + grs - 0.05, gz0 + 0.14 + i * (glen - 0.28) / 3);
  for (i = -1; i <= 1; i += 2) B(beam, BV, 0.04, 0.04, glen, cx + i * gw, gsp - 0.02, gzc);
  for (i = -1; i <= 1; i += 2) {
    x = cx + i * (gw - 0.07);
    B(plas, '#8f8a80', 0.15, 0.06, 0.15, x, 0.07, 0.76); B(post, PC, 0.08, gsp - 0.09, 0.08, x, 0.1 + (gsp - 0.09) / 2, 0.76); B(steel, ST, 0.1, 0.03, 0.1, x, gsp - 0.015, 0.76);
  }
  B(steel, ST, 2 * gw - 0.06, 0.05, 0.06, cx, gsp - 0.04, 0.78);
  if (L === 1) {
    A2(plas, '#8a3020', gableGeo(gw - 0.01, grs - 0.01), cx, gsp, gz1 - 0.012);
    for (i = -1; i <= 1; i += 2) { B(corr, '#b04434', 0.38, 0.014, 0.52, cx + i * (gw + 0.17), gsp - 0.11, 0.6, 0, 0, -i * 0.45); Y(post, PC, 0.018, 0.018, gsp - 0.22, 8, cx + i * (gw + 0.32), 0.04 + (gsp - 0.22) / 2, 0.72); }
  } else {
    A2(beam, BV, arcGeo(gw - 0.03, grs - 0.03, 0.012, 20), cx, gsp, gz1 - 0.05);
    mullions(gw - 0.05, grs - 0.03, cx, gsp, gz1 - 0.05, 6);
  }
  var sg = signMesh('士林夜市', 2 * gw * 0.92, 0.24, 0.025, L === 1 ? '#8a2a1e' : '#1d1210', L === 1 ? '#ff6a48' : '#ff4030', [0.35, 0.85, 0.95, 1.05][L - 1], L > 1);
  sg.position.set(cx, gsp + grs * 0.5, gz1 - 0.02); g.add(sg); hot.sign = sg.material;
  if (L === 2 || L === 3) { B(steel, ST, 0.07, 0.012, 0.012, cx + gw - 0.02, 0.44, 0.76); var bn2 = texMesh('bann', 0.022, 0.3, 0.08, 0.5); bn2.position.set(cx + gw + 0.05, 0.42, 0.76); g.add(bn2); }
  for (i = 0; i < 3; i++) { stall(cx - gw + 0.2, 0.24 + i * 0.2, PI / 2, k += 1, 0.2, true); stall(cx + gw - 0.2, 0.24 + i * 0.2, -PI / 2, k += 1, 0.2, true); }
  B(fglow, '#ffd9a0', 2 * gw - 0.1, 0.006, glen, cx, 0.047, gzc);
  if (L >= 2) for (i = 0; i < 9; i++) B(lamp, '#ffe2b0', 0.022, 0.022, 0.022, cx - gw + 0.12 + i * (2 * gw - 0.24) / 8, gsp - 0.12 + 0.02 * Math.sin(i * 0.8), 0.8);
  /* ===== 市场街大厅：lv1 铁皮矮棚杂院 → lv2 低弧长跨拱棚 → lv3/4 拱棚延伸至后缘（钢肋/侧高窗/山墙月牙/店招） ===== */
  var hw = [0, 0.64, 0.68, 0.72][L - 1], hrs = [0, 0.4, 0.4, 0.4][L - 1], hsp = [0, 0.72, 0.8, 0.92][L - 1], hz0 = L >= 3 ? -1.22 : -1.0, hz1 = 0.1, hlen = hz1 - hz0, hzc = (hz0 + hz1) / 2;
  if (L === 1) {
    B(plas, '#a09a8c', 0.56, 0.4, 0.6, -0.6, 0.2, -0.68); gable(corr, '#6f7a6a', -0.6, 0.4, -0.68, 0.56, 0.6, 0.1, 0); acTank(-0.78, -0.5, 0.46, 0.8);
    B(plas, '#aaa397', 0.7, 0.5, 0.62, 0.16, 0.25, -0.68); gable(corr, '#8a5a3e', 0.16, 0.5, -0.68, 0.7, 0.62, 0.12, 0);
    B(plas, '#b5aa98', 0.24, 0.16, 0.2, 0.16, 0.58, -0.72); B(corr, '#c9c6bd', 0.28, 0.012, 0.24, 0.16, 0.665, -0.72, 0.05);
    B(plas, '#b3ada0', 0.7, 0.3, 0.4, -0.56, 0.15, -0.08); B(corr, '#cfcabf', 0.74, 0.014, 0.44, -0.56, 0.315, -0.08, 0.08);
    B(plas, '#9fa593', 0.62, 0.36, 0.4, 0.18, 0.18, -0.06); gable(corr, '#7d8a7a', 0.18, 0.36, -0.06, 0.62, 0.4, 0.08, 0);
    B(glow, '#a08050', 1.2, 0.07, 0.012, -0.22, 0.17, 0.135); B(plas, '#8f8a80', 0.05, 0.08, 0.05, -0.22, 0.28, -0.05);
    acTank(0.42, -0.4, 0.56, 0.9); acTank(-0.3, -0.24, 0.32, 0.6);
  } else {
    var nr = L >= 3 ? 6 : 5, nc = Math.round(hlen / 0.22), hbk = L === 4 ? curt : plas, hbc = L === 4 ? '#dfe6ea' : '#b0aa9e';
    A2(seam, L === 4 ? '#c0c8cd' : '#b9c2c8', vaultGeo(hw, hrs, hlen, 40), cx, hsp, hzc);
    A2(ceil, '#ffe2c0', vaultGeo(hw - 0.012, hrs - 0.012, hlen - 0.02, 40), cx, hsp, hzc, 0, 0, 0, -1, 1, 1);
    B(beam, BV, 0.04, 0.025, hlen, cx, hsp + hrs, hzc);
    if (L >= 3) for (i = 0; i < 4; i++) B(metal, SL, 0.1, 0.04, 0.13, cx, hsp + hrs + 0.02, hz0 + 0.3 + i * 0.3);
    for (i = 0; i < nr; i++) { A2(beam, BV, arcGeo(hw + 0.006, hrs + 0.006, 0.011, 24), cx, hsp, hz0 + 0.1 + i * (hlen - 0.2) / (nr - 1)); if (i % 2) B(lamp, '#ffe2b0', 0.024, 0.02, 0.024, cx, hsp + hrs - 0.05, hz0 + 0.1 + i * (hlen - 0.2) / (nr - 1)); }
    for (i = -1; i <= 1; i += 2) {
      x = cx + i * hw;
      B(beam, BV, 0.05, 0.05, hlen, x, hsp - 0.025, hzc);
      B(glass, GLD, 0.02, 0.24, hlen, x - i * 0.012, hsp - 0.17, hzc);
      for (j = 0; j <= nc; j++) B(steel, ST, 0.028, 0.26, 0.028, x, hsp - 0.17, hz0 + j * hlen / nc);
      if (L === 4) B(curt, '#dfe6ea', 0.05, hsp - 0.3, hlen, x - i * 0.022, (hsp - 0.3) / 2 + 0.01, hzc);
      else { B(plas, '#b8b2a6', 0.06, hsp - 0.3, hlen, x - i * 0.022, (hsp - 0.3) / 2 + 0.01, hzc); B(glow, '#a08050', 0.014, 0.075, hlen - 0.24, x + i * 0.012, 0.19, hzc);
        for (j = 0; j < 5; j++) B(metal, AW[(j + 1) % 6], 0.02, 0.06, 0.12, x + i * 0.02, hsp - 0.36, hz0 + 0.16 + j * (hlen - 0.32) / 4); }
    }
    A2(gglass, '#a9cad8', gableGeo(hw - 0.006, hrs - 0.006), cx, hsp, hz1 - 0.006);
    A2(beam, BV, arcGeo(hw - 0.02, hrs - 0.02, 0.012, 24), cx, hsp, hz1 - 0.02);
    mullions(hw - 0.04, hrs - 0.02, cx, hsp, hz1 - 0.02, 8);
    B(glass, '#8fb0c0', 0.16, 0.014, hlen - 0.3, cx, hsp + hrs - 0.002, hzc);                                  /* 脊部采光带 */
    for (i = 0; i < 2; i++) { stall(cx - 0.36, -0.06 - i * 0.24, PI / 2, k += 1, 0.2, true); stall(cx + 0.36, -0.06 - i * 0.24, -PI / 2, k += 1, 0.2, true); }
    A2(hbk, hbc, gableGeo(hw, hrs), cx, hsp, hz0 + 0.006, 0, PI);
    B(hbk, hbc, 2 * hw, hsp, 0.03, cx, hsp / 2, hz0 + 0.015);
    B(fglow, '#ffd9a0', 2 * hw - 0.3, 0.006, hlen - 0.1, cx, 0.047, hzc);
  }
  /* ===== 后排（lv1-2）：老公寓+水塔+天线 + 左后垄板附房；lv3/4 由延伸拱棚占据，屋顶钢架转移到左后高楼 ===== */
  if (L <= 2) {
    var bh = [0.8, 0.95][L - 1], bx = 0.08, bz = -1.14;
    B(plas, L === 1 ? '#9a9d98' : '#c6c1b6', 0.76, bh, 0.3, bx, bh / 2, bz); B(plas, '#8f8a80', 0.79, 0.03, 0.31, bx, bh + 0.015, bz);
    for (i = 0; i < 3; i++) {
      winRow('x', bx - 0.3, bx + 0.3, 0.16 + i * 0.24, bz + 0.16, 4, 3);
      B(L === 2 && i === 1 ? warm : glass, L === 2 && i === 1 ? '#ffd9a8' : '#26333d', 0.016, 0.09, 0.07, bx - 0.39, 0.16 + i * 0.24, bz);
    }
    B(metal, '#a8a49c', 0.11, 0.14, 0.11, bx + 0.22, bh + 0.1, bz);
    Y(metal, '#8d939b', 0.006, 0.006, [0.3, 0.36][L - 1], 5, bx - 0.26, bh + [0.3, 0.36][L - 1] / 2, bz);
    acTank(bx - 0.24, bz - 0.06, bh + 0.045, 0.8);
    B(plas, '#a8a296', 0.64, 0.38, 0.28, -0.64, 0.19, -1.14); B(corr, '#7d8a7a', 0.68, 0.014, 0.32, -0.64, 0.395, -1.14, 0.06); acTank(-0.88, -1.17, 0.42, 0.7);
  }
  /* ===== -X 侧老楼群（远侧；LX=-1.11，檐口外挑 ≤0.025 保占地）：左后楼 lv2+ 升高为天际线，lv3 顶钢架玻璃中庭 / lv4 顶 pergola ===== */
  var LX = -1.11, lh = [0.58, 0.9, 1.0, 1.1][L - 1], lhex = ['#9a9385', '#c4bfb2', '#b5b0a4', '#8a9298'][L - 1];
  B(plas, lhex, 0.32, lh, 0.7, LX, lh / 2, -0.92); B(plas, '#8f8a80', 0.35, 0.026, 0.73, LX, lh + 0.013, -0.92);
  if (L <= 2) gable(corr, L === 1 ? '#6b7a68' : '#5a8a62', LX, lh, -0.92, 0.32, 0.7, 0.09, 0);
  else {
    B(seam, '#9aa5ad', 0.36, 0.02, 0.74, LX, lh + 0.03, -0.92); B(metal, '#a8a49c', 0.1, 0.13, 0.1, LX + 0.08, lh + 0.1, -0.66);
    if (L === 3) {
      B(glass, '#5a7a8a', 0.22, 0.34, 0.44, LX, lh + 0.2, -0.95);
      for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) B(steel, ST, 0.02, 0.36, 0.02, LX + i * 0.12, lh + 0.18, -0.95 + j * 0.23);
      B(steel, ST, 0.27, 0.02, 0.49, LX, lh + 0.37, -0.95); Y(metal, '#8d939b', 0.006, 0.006, 0.42, 5, LX - 0.1, lh + 0.21, -1.2);
    } else {
      for (i = -1; i <= 1; i += 2) B(steel, ST, 0.02, 0.016, 0.62, LX + i * 0.11, lh + 0.22, -0.92);
      for (i = 0; i < 5; i++) B(steel, ST, 0.26, 0.014, 0.02, LX, lh + 0.21, -1.2 + i * 0.14);
      for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) B(steel, ST, 0.016, 0.2, 0.016, LX + i * 0.11, lh + 0.11, -0.92 + j * 0.28);
      B(metal, '#9aa0a6', 0.1, 0.08, 0.1, LX - 0.08, lh + 0.05, -0.64); Y(metal, '#8d939b', 0.006, 0.006, 0.5, 5, LX - 0.1, lh + 0.25, -1.2);
    }
  }
  for (i = 0; i < 2; i++) { winRow('z', -1.2, -0.68, 0.14 + i * 0.2, LX + 0.16, 3, L >= 3 ? 2 : 0); winRow('x', LX - 0.06, LX + 0.34, 0.14 + i * 0.2, -0.56, 2, 0); }
  if (L >= 2) for (i = 2; i < Math.floor(lh / 0.2); i++) { winRow('z', -1.2, -0.68, 0.14 + i * 0.2, LX + 0.16, 3, 2); winRow('x', LX - 0.06, LX + 0.34, 0.14 + i * 0.2, -0.56, 2, 2); }
  var fh = [0.44, 0.48, 0.6, 1.08][L - 1], fhex = ['#a89f8e', '#d8d3c6', '#7d8a94', '#7a5648'][L - 1];
  B(plas, fhex, 0.32, fh, 0.92, LX, fh / 2, -0.05);
  if (L === 1) B(corr, '#8a6a4a', 0.36, 0.014, 0.96, LX, fh + 0.022, -0.05, 0.1);
  else if (L === 2) gable(seam, '#4f8a5e', LX, fh, -0.05, 0.32, 0.92, 0.1, 0);
  else if (L === 3) { B(seam, '#9aa5ad', 0.36, 0.02, 0.96, LX, fh + 0.028, -0.05); B(glass, '#26333d', 0.3, 0.16, 0.02, LX, fh * 0.45, 0.42); }
  else {
    B(plas, '#7a5648', 0.34, 0.3, 0.94, LX, 0.15, -0.05); B(curt, '#e8ddd4', 0.3, fh - 0.3, 0.9, LX, 0.3 + (fh - 0.3) / 2, -0.05);
    B(seam, '#6a4a3c', 0.36, 0.02, 0.96, LX, fh + 0.028, -0.05); B(plas, '#8f8a80', 0.36, 0.02, 0.97, LX, fh + 0.045, -0.05);
    for (i = 0; i < 3; i++) B(warm, '#ffd9a8', 0.26, 0.07, 0.02, LX, 0.5 + i * 0.22, 0.42);
  }
  for (i = 0; i < 2; i++) winRow('z', -1.2, -0.68, 0.13 + i * 0.17, 0.41, 3, 2);
  if (L <= 3) { Y(metal, '#8d939b', 0.005, 0.005, 0.3, 5, LX + 0.08, fh + 0.03 + 0.15, -0.3); B(metal, '#8d939b', 0.09, 0.004, 0.004, LX + 0.08, fh + 0.3, -0.3); }
  if (L <= 2) acTank(LX - 0.02, -0.75, lh + 0.05, 0.55);
  if (L <= 2) { stall(-1.05, 1.0, 0, k += 1, 0.2); stall(-0.78, 1.0, 0, k += 1, 0.2); } else tree(LX, 0.66, 0.85, true);
  /* ===== +X 侧彩篷摊位双排：外排露天（色篷朝外），内排窄棚顶 ===== */
  var az0 = L === 4 ? -0.32 : -1.2, az1 = 0.62, alen = az1 - az0, azc = (az0 + az1) / 2;
  if (L <= 2) B(L === 1 ? corr : seam, L === 1 ? '#cfd2c9' : '#b4bec6', 0.34, 0.016, alen + 0.04, 0.71, 0.5, azc, 0, 0, -0.1);
  else {
    B(gcan, '#c8dbe4', 0.34, 0.01, alen + 0.04, 0.71, 0.5, azc, 0, 0, -0.1);
    n = Math.round(alen / 0.3); for (i = 0; i <= n; i++) B(beam, BV, 0.34, 0.02, 0.02, 0.71, 0.492, az0 + i * alen / n, 0, 0, -0.1);
  }
  B(beam, BV, 0.05, 0.04, alen, 0.55, 0.518, azc); B(beam, BV, 0.05, 0.04, alen, 0.885, 0.482, azc);
  n = Math.round(alen / 0.36); for (i = 0; i <= n; i++) Y(post, ST, 0.013, 0.013, 0.46, 8, 0.865, 0.25, az0 + i * alen / n);
  for (i = 0; i < n; i++) B(metal, AW[(i + 2) % 6], 0.016, 0.07, 0.1, 0.87, 0.41, az0 + (i + 0.5) * alen / n);                /* 檩下悬挂店招 */
  for (z = az0 + 0.13; z < az1 - 0.11; z += 0.21) { stall(0.98, z, PI / 2, k += 1, 0.2); stall(0.72, z, -PI / 2, k += 3, 0.2); }
  if (L <= 2) acTank(0.6, az0 + 0.2, 0.53, 0.7);
  if (L >= 2) { n = Math.round(alen / 0.12); for (i = 0; i < n; i++) B(lamp, '#ffe2b0', 0.02, 0.02, 0.02, 0.87, 0.462 + 0.015 * Math.sin(i * 0.9), az0 + 0.1 + i * 0.12); }
  /* ===== lv4 塔楼：LED 巨屏 + 竖招 + 屋顶钢架 ===== */
  if (L === 4) {
    B(curt, '#e8eef2', 0.7, 1.5, 0.84, 0.91, 0.75, -0.86);
    for (i = 1; i <= 4; i++) B(steel, SL, 0.72, 0.012, 0.86, 0.91, i * 0.28, -0.86);
    B(plas, '#8f8a80', 0.74, 0.03, 0.88, 0.91, 1.515, -0.86);
    B(plas, '#5a564e', 0.72, 0.3, 0.86, 0.91, 0.15, -0.86); B(glow, '#a08050', 0.62, 0.16, 0.014, 0.91, 0.17, -0.435);
    var ld1 = texMesh('led', 0.52, 0.44, 0.025, 0.95); ld1.position.set(1.272, 1.02, -0.86); ld1.rotation.y = PI / 2; g.add(ld1); hot.led = ld1.material;
    var ld2 = texMesh('led', 0.3, 0.26, 0.025, 0.8); ld2.position.set(0.75, 1.12, -0.432); g.add(ld2);
    var bn = texMesh('bann', 0.025, 0.34, 0.09, 0.5); bn.position.set(1.14, 0.62, -0.427); g.add(bn);
    for (i = -1; i <= 1; i += 2) B(steel, ST, 0.62, 0.016, 0.02, 0.91, 1.72, -0.86 + i * 0.3);
    for (i = 0; i < 5; i++) B(steel, ST, 0.02, 0.014, 0.62, 0.64 + i * 0.135, 1.71, -0.86);
    for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) B(steel, ST, 0.016, 0.19, 0.016, 0.91 + i * 0.28, 1.605, -0.86 + j * 0.3);
    B(metal, '#9aa0a6', 0.12, 0.09, 0.14, 0.7, 1.555, -1.0);
    Y(steel, ST, 0.007, 0.007, 0.34, 5, 1.12, 1.71, -1.1); B(lamp, '#ff5a4a', 0.02, 0.02, 0.02, 1.12, 1.895, -1.1);
  }
  /* ===== 广场：灯柱 / 树池层叠树冠 / 灌木花箱 / 长凳 / 护柱 ===== */
  lampPost(-1.2, 0.9, 0); lampPost(0.52, 1.06, PI / 2);
  if (L >= 2) { lampPost(1.2, 0.52, PI); if (L >= 3) lampPost(1.2, -0.55, PI); }
  tree(-1.19, 1.19, 0.8, L >= 3); tree(0.68, 1.19, 0.9, L >= 2); tree(0.98, 1.19, 0.85, L >= 2); tree(1.19, 1.19, 0.8, L >= 3);
  if (L === 3) { tree(1.19, 0.78, 0.75, true); tree(1.19, 0.24, 0.75, true); tree(1.19, -0.32, 0.8, true); tree(1.19, -0.9, 0.7, true); }
  if (L === 4) { tree(1.19, 0.78, 0.75, true); tree(1.19, 0.24, 0.75, true); }
  for (i = 0; i < 2; i++) { B(plas, '#8d877b', 0.3, 0.04, 0.12, -0.72 + i * 1.14, 0.07, 0.96); O(leaf, '#4a7a38', 0.05, -0.8 + i * 1.14, 0.12, 0.96); O(leaf, '#5d8a45', 0.042, -0.64 + i * 1.14, 0.115, 0.95); }
  bench(0.24, 1.02); if (L >= 2) bench(-0.62, 1.04);
  for (i = 0; i < 5; i++) Y(post, '#6a6f75', 0.012, 0.012, 0.05, 8, -1.05 + i * 0.5, 0.07, 1.19);
  flush(g, hot);
  g.userData.anim = [function (t) { var m = hot['#ffb45c']; if (m) m.emissiveIntensity = 0.38 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.6)); }];
  g.userData.anim.push(function (t) {
    var s = 0.5 + 0.5 * Math.sin(t * 1.1), m;
    if (hot.sign) hot.sign.emissiveIntensity = (L >= 2 ? 0.8 : 0.3) + 0.2 * s;
    if ((m = hot['#ffd9a0'])) m.emissiveIntensity = 0.75 + 0.25 * s; if ((m = hot['#ffffff'])) m.emissiveIntensity = 0.42 + 0.12 * s;
    if ((m = hot.led)) m.emissiveIntensity = 0.8 + 0.25 * s;
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[38] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
