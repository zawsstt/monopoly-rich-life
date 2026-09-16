/* 大富翁·现代写实棋盘（西安）格 28「书院门」—— 青砖城台门楼 + 书画一条街（窄长街区）· v4 精修 R1-R3
 * 视觉基准 refs/modern/prop_28.png（四象限 1990s/2000s/2010s/2020s 同一街区 40 年演进）：
 *   前景青砖城台门楼（拱券门洞通透见街 + 券角条石 + 石拱券 + 门匾门簪 + 台顶白石栏杆 + 木构重檐城楼 + 垂脊吻饰宝顶 + 前踏步垂带 + 八字墩）；
 *   门洞内纵贯石板主街，两侧连排书画铺面（脊平行主街连续瓦垄双坡顶 + 山花博风 + 脊端吻饰 + 廊柱 + 额枋 + 外墙壁柱勒脚 + 门脸四代演进 + 招牌 + 檐下灯笼 + 挑杆布幌）；
 *   后排二层临街楼（木层间带 + 腰檐 + 窗框窗台 + 楼门 + 歇山垂脊）+ 右后转角重檐小楼；行道树出屋面/街尾树；lv3+ 路缘/花箱/街灯/竖幌/彩棚/幌旗，lv4 满街暖光橱窗 + 灯箱店招 + 城楼壁灯 + 门洞灯槽 + 外摆白伞茶座。
 * 年代演进（结构性）：lv1 1990s 素青砖 + 暗木匾 + 木板排门封闭门脸 + 深色布棚 + 木柱 + 灰瓦 + 树 2 株无灯；
 *   lv2 2000s 白石匾 + 门簪 + 红柱红招 + 檐下红灯笼 + 暖光格栅门脸 + 台顶石栏 + 跨街串灯 + 转角小楼 + 屋面亮瓦 + 布幌 + 树 4；
 *   lv3 2010s 青绿金字彩匾 + 玻璃橱窗 + 彩棚交替 + 竖幌 + 铺面加高 + 二层木栏挑廊 + 路缘 + 街灯 + 花箱 + 幌旗 + 出屋面高树；
 *   lv4 2020s 金正脊吻饰 + 灯箱店招 + 城楼壁灯 + 门洞暖光灯槽 + 第三道串灯 + 花箱成列 + 外摆白伞茶座 + 树 8。
 * R1（结构+材质整体重构）：门楼由贴面拱洞 → 通透城台（基座/墩壁/拱楣/券石/隧顶/过门石/八字墩/石栏/重檐城楼）；
 *   铺面由散点小四坡顶 → 每侧 2 间连排长屋（连续正脊 + 山花博风 + 吻饰 + 廊柱额枋 + 门脸四代 + 挑廊）；
 *   新增后排二层楼×2/转角小楼/踏步垂带/串灯/街灯/花箱/石缸/幌旗/外摆/树 8；材质改 prop_18 同款桶系统（近白 Canvas + 顶点色分区 + 世界尺寸 boxUV）。
 * R2（细节清偿）：城楼白灰墙 → 木板壁 + 大格扇窗（框/中挺/窗台/窗楣）+ 平座栏杆；隧顶减薄 + lv4 门洞内壁暖光灯槽；后排楼灰泥带 → 木层间带 + 腰檐；
 *   屋面亮瓦（贴坡，随墙高）；铺面檐下挑杆布幌（避让彩棚）；瓦纹垄沟对比增强；lv1 树冠放大。
 * R3（补分）：boxUV 坡面按坡向选轴 → 瓦垄恒顺坡向下（原铺面瓦垄平行正脊）；瓦面顶点色提亮使垄纹可辨；外墙石壁柱分间 + 深色勒脚；
 *   城台基座改深色条石；lv4 灯箱店招放大；前沿花箱对；石缸抬到广场面（原沉入铺装）；城楼两檐 + 后排楼歇山垂脊 ×12。
 * 契约：window.Props3DModern[28](level 1..4) → 全新 Group；占地 ≤2.6×2.6（实测 1.86×2.59，W≤1.9 D≥2.4）；底面 y=0；正面 +Z（max.z 1.29）；
 *   高度带 lv1..4 = [1.2,1.5]/[1.2,1.5]/[1.2,1.55]/[1.2,1.55]（实测 1.44/1.48/1.51/1.51）；每级 mesh ≤55（桶合并，实测 11/15/18/20）；
 *   三角 lv1..4 = 4.7k/7.7k/10.8k/12.6k（预算 9k/13k/18k/24k）；Canvas ≤256px；零 Math.random（mulberry32 LCG）；圆柱 ≥12 段；
 *   动画 2 项（橱窗暖光呼吸 / 灯笼·匾额·店招·街灯呼吸）。
 * 工程：桶 = rough|metal|tex|ws|em|ei；同桶手写合并 BufferGeometry + 三角法线主轴投影 boxUV（ws=每重复米数，userData.k=1/ws 供冒烟核验）；
 *   贴图件（匾/店招/竖幌/灯笼纸）与曲面件（树冠/树干）ws=0 保留原始 UV；Extrude 卷檐断面（竖直边三角命中烘焙校验）。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_28] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TX = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function F(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function RA(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')'; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? RA(255, 255, 255, a) : RA(24, 22, 18, a), R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); }
function MOSS(g, w, h, n, y0, R) { for (var i = 0; i < n; i++) F(g, RA(96, 124, 58, 0.1 + R() * 0.16), R() * w, y0 + R() * (h - y0), 2 + R() * 6, 2 + R() * 3); }
/* ---- 近白 overlay 纹理（顶点色承载主色）：各 ≥5 层 = 基色 + 块面风化 + 分缝 + 高光 + 噪点 + 苔痕 ---- */
var TXF = {
  s: function (g, w, h, R) { F(g, '#f0ece5', 0, 0, w, h); for (var y = 0; y < h; y += 32) { var o = (y / 32) % 2 ? 32 : 0; F(g, RA(80, 74, 64, 0.5), 0, y, w, 2); /* 石板：错缝分块+块差+磨光 */
    for (var x = o - 64; x < w; x += 64) { F(g, RA(80, 74, 64, 0.4), x, y, 2, 32); F(g, R() > 0.5 ? RA(255, 255, 250, 0.12) : RA(70, 64, 52, 0.1), x + 3, y + 3, 59, 27); F(g, RA(255, 255, 255, 0.22), x + 6, y + 4, 30 + R() * 24, 2); } }
    SPK(g, w, h, 80, 0.06, R); MOSS(g, w, h, 10, 0, R); },
  b: function (g, w, h, R) { F(g, '#efebe4', 0, 0, w, h); for (var y = 0; y < h; y += 14) { var o = (y / 14) % 2 ? 0 : 16; F(g, RA(58, 54, 48, 0.34), 0, y, w, 2); /* 青砖：顺丁砌缝+砖面色差+顶棱高光 */
    for (var x = o - 32; x < w; x += 32) { F(g, RA(58, 54, 48, 0.3), x, y, 2, 14); F(g, R() > 0.5 ? RA(80, 76, 70, 0.05 + R() * 0.08) : RA(255, 255, 255, 0.06 + R() * 0.1), x + 2, y + 2, 28, 10); F(g, RA(255, 255, 255, 0.25), x + 2, y + 2, 28, 1); } }
    SPK(g, w, h, 90, 0.06, R); MOSS(g, w, h, 12, 92, R); },
  t: function (g, w, h, R) { F(g, '#eceeed', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, RA(24, 30, 38, 0.62), x + 10, 0, 5, h); F(g, RA(255, 255, 255, 0.6), x + 2, 0, 3, h); F(g, RA(90, 96, 100, 0.16), x + 5, 0, 4, h); } /* 灰瓦：垄沟+釉光+行缝+风化 */
    for (var y = 10; y < h; y += 22) { F(g, RA(16, 22, 30, 0.45), 0, y, w, 2); F(g, RA(255, 255, 255, 0.2), 0, y + 2, w, 1); for (var i = 0; i < 4; i++) F(g, RA(60, 66, 70, 0.05 + R() * 0.1), R() * w, y + 3, 12, 17); } SPK(g, w, h, 60, 0.06, R); MOSS(g, w, h, 12, 70, R); },
  w: function (g, w, h, R) { F(g, '#f5ebdf', 0, 0, w, h); for (var x = 0; x < w; x += 5) F(g, RA(70, 40, 20, 0.14 + R() * 0.14), x + R() * 2, 0, 1, h); /* 木构：直纹+节疤+顺纹高光 */
    for (var i = 0; i < 3; i++) { g.fillStyle = RA(70, 40, 20, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 3 + R() * 3, 0, 6.283); g.fill(); } for (x = 6; x < w; x += 28) F(g, RA(255, 255, 255, 0.32), x, 0, 2, h); SPK(g, w, h, 40, 0.05, R); },
  p: function (g, w, h, R) { F(g, '#f8f4ec', 0, 0, w, h); for (var i = 0; i < 9; i++) F(g, RA(120, 110, 88, 0.05 + R() * 0.07), R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80); /* 灰泥：雨渍+裂纹+泛潮+噪点+苔 */
    for (i = 0; i < 4; i++) { var x0 = R() * w; g.strokeStyle = RA(110, 100, 80, 0.18); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); } F(g, RA(90, 84, 66, 0.1), 0, 108, w, 20); SPK(g, w, h, 100, 0.05, R); MOSS(g, w, h, 8, 100, R); },
  l: function (g, w, h, R) { F(g, '#f1f5ea', 0, 0, w, h); for (var i = 0; i < 34; i++) { g.fillStyle = i % 2 ? RA(34, 66, 24, 0.28) : RA(255, 255, 240, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } }, /* 树冠：明暗叶斑 */
  n: function (g, w, h, R) { F(g, '#ffffff', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, RA(120, 20, 10, 0.35), x + 6, 0, 3, h); F(g, RA(255, 240, 220, 0.4), x + 12, 0, 2, h); } F(g, RA(120, 60, 10, 0.3), 0, 0, w, 6); F(g, RA(120, 60, 10, 0.3), 0, h - 6, w, 6); SPK(g, w, h, 20, 0.04, R); } /* 灯笼纸：竹骨+纸纹（map+emissiveMap） */
};
function signTex(id, w, h, fn) { /* 匾额/店招/竖幌：Canvas 描边框 + 题字 */
  var c = cv(w, h); fn(c.getContext('2d'), w, h); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return (_TX[id] = t);
}
function tex(id) {
  if (_TX[id]) return _TX[id];
  if (id === 'g2') return signTex(id, 256, 64, function (g, w, h) { F(g, '#e9e4d6', 0, 0, w, h); g.strokeStyle = '#33363a'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#33363a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText('书院门', w / 2, h / 2 + 2); });
  if (id === 'g34') return signTex(id, 256, 64, function (g, w, h) { F(g, '#2c4a44', 0, 0, w, h); g.strokeStyle = '#e6c06a'; g.lineWidth = 5; g.strokeRect(5, 5, w - 10, h - 10); g.lineWidth = 1.5; g.strokeRect(11, 11, w - 22, h - 22); g.fillStyle = '#e6c06a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText('书院门', w / 2, h / 2 + 2); });
  if (id === 'd1') return signTex(id, 128, 64, function (g, w, h) { F(g, '#28527a', 0, 0, w, h); g.strokeStyle = '#f0e6c8'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#f0e6c8'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 38px "Microsoft YaHei",sans-serif'; g.fillText('書畵', w / 2, h / 2 + 2); });
  if (id === 'd2') return signTex(id, 128, 64, function (g, w, h) { F(g, '#7a3226', 0, 0, w, h); g.strokeStyle = '#f5d9a0'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#f5d9a0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 38px "Microsoft YaHei",sans-serif'; g.fillText('文房', w / 2, h / 2 + 2); });
  if (id === 'j') return signTex(id, 64, 128, function (g, w, h) { F(g, '#3e3a30', 0, 0, w, h); g.strokeStyle = '#e8c545'; g.lineWidth = 4; g.strokeRect(4, 4, w - 8, h - 8); g.fillStyle = '#f0e2b0'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 40px "Microsoft YaHei",sans-serif'; g.fillText('筆', w / 2, 40); g.fillText('墨', w / 2, 92); });
  var c = cv(128, 128); TXF[id](c.getContext('2d'), 128, 128, lcg(2800 + id.charCodeAt(0))); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return (_TX[id] = t);
}
/* ---- 桶系统：桶 = 材质参数；MS() 返回 {b:桶, c:线性顶点色}；flush 同桶合并 + 顶点色 + boxUV（ws=每重复米数，0=保留原 UV） ---- */
var BK;
function MS(h, rg, mt, tx, ws, em, ei) { var k = rg + '|' + (mt || 0) + '|' + (tx || '') + '|' + (ws || 0) + '|' + (em || '') + '|' + (ei || 0); var b = BK[k] || (BK[k] = { rg: rg, mt: mt || 0, tx: tx || '', ws: ws || 0, em: em || '', ei: ei || 0, gs: [], cs: [] }); return { b: b, c: V(h) }; }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(m, g) { m.b.gs.push(g); m.b.cs.push(m.c); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function A2(m, geo, x, y, z, ry) { put(m, xf(geo, x, y, z, 0, ry || 0, 0)); }
function TRI(m, w, h, d, x, y, z) { var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); A2(m, new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), x, y, z); }
function EAVE(m, w, h, t, tip, d, x, y, z, ry) { /* 卷檐坡屋顶：quadratic 翘檐断面沿脊挤出。ry 缺省 PI/2 → 脊沿 x；ry=0 → 脊沿 z */
  var hw = w / 2, s = new THREE.Shape();
  s.moveTo(0, h); s.lineTo(hw * 0.62, 0); s.quadraticCurveTo(hw * 0.86, 0, hw, tip);
  s.lineTo(hw, tip + t); s.quadraticCurveTo(hw * 0.86, t, hw * 0.62, t); s.lineTo(0, h + t);
  s.lineTo(-hw * 0.62, t); s.quadraticCurveTo(-hw * 0.86, t, -hw, tip + t); s.lineTo(-hw, tip);
  s.quadraticCurveTo(-hw * 0.86, 0, -hw * 0.62, 0); s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2);
  A2(m, geo, x, y, z, ry === undefined ? PI / 2 : ry);
}
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i, j; if (!gs.length) continue;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ca = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) {
      var p = gs[i].attributes.position.array, c = b.cs[i]; pa.set(p, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2);
      for (j = 0; j < p.length; j += 3) { ca[o + j] = c[0]; ca[o + j + 1] = c[1]; ca[o + j + 2] = c[2]; } o += p.length;
    }
    if (b.ws) for (i = 0; i < P; i += 9) { /* boxUV：三角面主法线轴投影 × 1/ws（世界尺寸烘焙，跨件无缝） */
      var ax = pa[i + 3] - pa[i], ay = pa[i + 4] - pa[i + 1], az = pa[i + 5] - pa[i + 2], bx = pa[i + 6] - pa[i], by = pa[i + 7] - pa[i + 1], bz = pa[i + 8] - pa[i + 2];
      var nx = Math.abs(ay * bz - az * by), ny = Math.abs(az * bx - ax * bz), nz = Math.abs(ax * by - ay * bx), s = 1 / b.ws;
      for (j = 0; j < 3; j++) { var q = i + j * 3, u = i / 9 * 6 + j * 2; if (ny >= nx && ny >= nz) { if (nx > nz) { ua[u] = pa[q + 2] * s; ua[u + 1] = pa[q] * s; } else { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 2] * s; } } else if (nx >= nz) { ua[u] = pa[q + 2] * s; ua[u + 1] = pa[q + 1] * s; } else { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 1] * s; } } /* 坡面按坡向选轴：瓦垄（纹理竖条）恒顺坡向下 */
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true });
    if (b.tx) m.map = tex(b.tx); if (b.ws) m.userData.k = 1 / b.ws;
    if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tx) m.emissiveMap = m.map; }
    b.m = m; var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function EI(m, v) { if (m && m.b.m) m.b.m.emissiveIntensity = v; }
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_28_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 28; g.userData.level = level;
  BK = {}; var Y0 = 0.09, i, j, PAL = {
    plaza: ['#8b8478', '#948d80', '#9e978a', '#a29c8f'][level - 1], lane: ['#938b7d', '#9c9486', '#a6a194', '#a9a497'][level - 1], trim: ['#a59d8d', '#aea79a', '#b6b1a3', '#bab5a8'][level - 1],
    brick: ['#7d837a', '#8a9086', '#949a90', '#9aa096'][level - 1], plast: ['#d6d0c1', '#ded8c9', '#e5e0d3', '#e7e3d7'][level - 1],
    roof: ['#565a5d', '#4c5054', '#454a4e', '#3c4045'][level - 1], ridge: ['#2e3134', '#2b2e32', '#282b30', '#c9a04a'][level - 1], roofL: '#84898b',
    lacq: ['#6b2a20', '#7c3226', '#84362a', '#87382c'][level - 1], leaf: ['#6c7d42', '#71824a', '#78894c', '#7c8d50'][level - 1], leaf2: ['#82945a', '#86985e', '#8b9d62', '#8fa166'][level - 1]
  };
  var WIN = MS('#232a2e', 0.12, 0.6), DK = MS('#2f3134', 0.85, 0.15), GD = MS('#c9a04a', 0.35, 0.75), STL = MS('#7d848a', 0.45, 0.7), TRK = MS('#4e3624', 0.9, 0, 'w', 0);
  var S = { /* 同桶异顶点色：石板/青砖/灰泥/瓦（近白 Canvas + 世界尺寸 boxUV） */
    plaza: MS(PAL.plaza, 0.92, 0, 's', 0.55), lane: MS(PAL.lane, 0.92, 0, 's', 0.55), trim: MS(PAL.trim, 0.92, 0, 's', 0.55),
    brick: MS(PAL.brick, 0.9, 0, 'b', 0.34), plast: MS(PAL.plast, 0.85, 0, 'p', 0.75),
    roof: MS(PAL.roof, 0.72, 0, 't', 0.5), roofD: MS(PAL.ridge, 0.72, 0, 't', 0.5), roofL: MS('#84898b', 0.72, 0, 't', 0.5),
    wood: MS('#4a3524', 0.78, 0, 'w', 0.4), woodD: MS('#332310', 0.78, 0, 'w', 0.4),
    lacq: MS(PAL.lacq, 0.5, 0.08), leaf: MS(PAL.leaf, 0.95, 0, 'l', 0), leaf2: MS(PAL.leaf2, 0.95, 0, 'l', 0)
  };
  function CB(h) { return { b: MS('#ffffff', 0.85, 0).b, c: V(h) }; }
  function WB(h) { return { b: S.wood.b, c: V(h) }; } /* 木桶异色：城楼板壁/腰檐木带 */
  var STD = { b: S.trim.b, c: V('#6f6a62') }; /* 深色条石：勒脚/城台基座 */
  var glow = MS('#584434', 0.2, 0, '', 0, '#ffbd66', [0.1, 0.2, 0.3, 0.45][level - 1]);
  var lant = MS('#b03828', 0.6, 0, 'n', 0, '#ff5a2a', [0.04, 0.28, 0.32, 0.5][level - 1]);
  var plaqueM = level >= 2 ? MS('#ffffff', 0.5, 0, level >= 3 ? 'g34' : 'g2', 0, '#fff2cc', level >= 4 ? 0.4 : level >= 3 ? 0.12 : 0.05) : null;
  var sign1 = level >= 3 ? MS('#ffffff', 0.55, 0, 'd1', 0, '#ffd98c', level >= 4 ? 0.4 : 0.06) : null;
  var sign2 = level >= 3 ? MS('#ffffff', 0.55, 0, 'd2', 0, '#ffd98c', level >= 4 ? 0.4 : 0.06) : null;
  var vhankM = level >= 3 ? MS('#ffffff', 0.6, 0, 'j', 0) : null;
  var lampM = level >= 3 ? MS('#ffe6b0', 0.4, 0, '', 0, '#ffd9a0', 0.7) : null;
  /* ---- 小件语汇 ---- */
  function lan(x, yTop, z, s) { Y(DK, 0.003, 0.003, 0.05 * s, 12, x, yTop - 0.025 * s, z); Y(GD, 0.011 * s, 0.011 * s, 0.016 * s, 12, x, yTop - 0.058 * s, z); Y(lant, 0.03 * s, 0.038 * s, 0.052 * s, 12, x, yTop - 0.092 * s, z); Y(GD, 0.005, 0.004, 0.022 * s, 12, x, yTop - 0.128 * s, z); }
  function cstr(z, y) { B(DK, 0.54, 0.004, 0.004, 0, y, z); for (var k = -1; k <= 1; k++) lan(k * 0.11, y - 0.003, z, 0.68); }
  function lamp2(x, z, dir) { Y(STL, 0.008, 0.011, 0.42, 12, x, Y0 + 0.21, z); B(STL, 0.09, 0.01, 0.01, x + dir * 0.045, Y0 + 0.415, z); if (lampM) B(lampM, 0.05, 0.015, 0.035, x + dir * 0.085, Y0 + 0.405, z); }
  function tree(x, z, th, cr, third) { Y(TRK, 0.018, 0.03, th, 12, x, Y0 + th / 2, z); O(S.leaf, cr, x, Y0 + th + cr * 0.5, z); O(S.leaf2, cr * 0.6, x + cr * 0.4, Y0 + th + cr * 0.8, z + cr * 0.25); if (third) O(S.leaf, cr * 0.42, x - cr * 0.38, Y0 + th + cr * 1.02, z - cr * 0.2); }
  function umbr(x, z) { Y(S.wood, 0.005, 0.005, 0.34, 12, x, Y0 + 0.17, z); Y(CB('#e8e4da'), 0.135, 0.012, 0.07, 12, x, Y0 + 0.365, z); Y(GD, 0.004, 0.004, 0.022, 12, x, Y0 + 0.41, z); }
  var VJM = { b: S.roof.b, c: V('#2a2d31') };
  function VJ(xe, y, z, h, hw) { /* 歇山垂脊：脊沿 x 的坡顶两端，沿直坡段各下一条（前后坡） */
    var run = 0.62 * hw, len = Math.sqrt(run * run + h * h), ang = Math.atan(h / run), k;
    for (k = -1; k <= 1; k += 2) B(VJM, 0.022, 0.016, len, xe, y + h + 0.02 - h / 2 + 0.006, z + k * run / 2, k * ang, 0, 0);
  }
  /* ---- 地面：石板广场（含门洞内主街）+ 步道 + 踏步垂带 ---- */
  B(S.plaza, 1.86, 0.09, 2.58, 0, 0.045, -0.01);
  B(S.lane, 0.56, 0.016, 1.90, 0, Y0 + 0.008, -0.33);
  if (level >= 3) { B(S.trim, 0.025, 0.018, 1.9, -0.29, Y0 + 0.009, -0.33); B(S.trim, 0.025, 0.018, 1.9, 0.29, Y0 + 0.009, -0.33); }
  B(S.trim, 1.00, 0.105, 0.06, 0, 0.0525, 1.25); B(S.trim, 1.00, 0.125, 0.06, 0, 0.0625, 1.19); B(S.trim, 1.00, 0.145, 0.06, 0, 0.0725, 1.13);
  B(S.trim, 0.06, 0.16, 0.20, -0.53, 0.08, 1.19); B(S.trim, 0.06, 0.16, 0.20, 0.53, 0.08, 1.19);
  /* ---- 青砖城台门楼（z 0.63..1.13，城台顶 0.69）：台基（中空过街）/墩壁/拱楣/券角条石/石拱券/隧顶/过门石/八字墩 ---- */
  var gz = 0.88;
  B(STD, 0.45, 0.06, 0.50, -0.395, 0.12, gz); B(STD, 0.45, 0.06, 0.50, 0.395, 0.12, gz); /* 城台基座（中空过街） */
  B(S.brick, 0.43, 0.54, 0.46, -0.385, 0.42, gz); B(S.brick, 0.43, 0.54, 0.46, 0.385, 0.42, gz);
  B(S.brick, 0.34, 0.27, 0.46, 0, 0.555, gz);
  B(S.trim, 0.035, 0.54, 0.48, -0.1875, 0.42, gz); B(S.trim, 0.035, 0.54, 0.48, 0.1875, 0.42, gz);
  A2(S.trim, (function () { var gg = new THREE.CylinderGeometry(0.185, 0.185, 0.48, 12, 1, false, 0, PI); gg.rotateZ(PI / 2); gg.rotateY(PI / 2); return gg; })(), 0, 0.27, gz);
  B(DK, 0.33, 0.015, 0.42, 0, 0.4325, gz);
  if (level >= 4) { B(glow, 0.012, 0.05, 0.12, -0.163, 0.31, gz); B(glow, 0.012, 0.05, 0.12, 0.163, 0.31, gz); } /* 门洞内壁暖光灯槽 */
  B(S.trim, 0.36, 0.045, 0.06, 0, 0.1125, 1.10);
  B(S.brick, 0.12, 0.50, 0.26, -0.65, 0.34, 0.99, 0, 0.4, 0); B(S.brick, 0.12, 0.50, 0.26, 0.65, 0.34, 0.99, 0, -0.4, 0);
  if (level >= 2) { Y(GD, 0.012, 0.012, 0.02, 12, -0.07, 0.50, 1.115); Y(GD, 0.012, 0.012, 0.02, 12, 0.07, 0.50, 1.115); }
  B(plaqueM || S.woodD, 0.42, 0.17, 0.035, 0, 0.585, 1.115);
  B(S.trim, 1.22, 0.045, 0.04, 0, 0.7125, 1.085); B(S.trim, 0.04, 0.045, 0.40, -0.59, 0.7125, 0.87); B(S.trim, 0.04, 0.045, 0.40, 0.59, 0.7125, 0.87); B(S.trim, 1.22, 0.045, 0.04, 0, 0.7125, 0.665);
  if (level >= 2) { for (i = -2; i <= 2; i++) B(S.trim, 0.022, 0.055, 0.022, i * 0.27, 0.7625, 1.085); B(S.trim, 1.16, 0.02, 0.03, 0, 0.7975, 1.085); }
  if (level >= 4) { B(lampM, 0.05, 0.024, 0.02, -0.42, 0.5, 1.115); B(lampM, 0.05, 0.024, 0.02, 0.42, 0.5, 1.115); }
  /* ---- 重檐城楼（台顶）：楼板/平座栏杆/朱柱/板壁/格扇门/格扇窗+窗台/大额枋/下檐/鼓座/上檐/正脊/吻饰/宝顶 ---- */
  B(S.wood, 0.80, 0.035, 0.44, 0, 0.7425, gz);
  B(S.wood, 0.014, 0.045, 0.014, -0.30, 0.7775, gz + 0.21); B(S.wood, 0.014, 0.045, 0.014, 0, 0.7775, gz + 0.21); B(S.wood, 0.014, 0.045, 0.014, 0.30, 0.7775, gz + 0.21);
  B(S.wood, 0.64, 0.014, 0.014, 0, 0.8025, gz + 0.21); B(S.wood, 0.014, 0.045, 0.014, -0.30, 0.7775, gz - 0.21); B(S.wood, 0.014, 0.045, 0.014, 0.30, 0.7775, gz - 0.21);
  for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) B(S.lacq, 0.032, 0.27, 0.032, i * 0.33, 0.895, gz + j * 0.18);
  B(WB('#8a7256'), 0.62, 0.27, 0.025, 0, 0.895, gz + 0.185); B(WB('#8a7256'), 0.62, 0.27, 0.025, 0, 0.895, gz - 0.185);
  B(WB('#8a7256'), 0.025, 0.27, 0.335, -0.335, 0.895, gz); B(WB('#8a7256'), 0.025, 0.27, 0.335, 0.335, 0.895, gz);
  B(S.woodD, 0.15, 0.21, 0.02, 0, 0.85, gz + 0.20);
  B(S.wood, 0.17, 0.014, 0.024, 0, 0.755, gz + 0.205);
  for (i = -1; i <= 1; i += 2) { B(WIN, 0.13, 0.13, 0.014, i * 0.20, 0.90, gz + 0.20); B(S.wood, 0.014, 0.15, 0.018, i * 0.20, 0.90, gz + 0.207); B(S.wood, 0.15, 0.014, 0.018, i * 0.20, 0.90, gz + 0.207); B(S.wood, 0.15, 0.012, 0.024, i * 0.20, 0.822, gz + 0.205); B(S.wood, 0.15, 0.012, 0.02, i * 0.20, 0.978, gz + 0.203); }
  B(S.wood, 0.72, 0.03, 0.40, 0, 1.045, gz);
  EAVE(S.roof, 0.66, 0.105, 0.022, 0.03, 0.98, 0, 1.06, gz); VJ(-0.47, 1.06, gz, 0.105, 0.33); VJ(0.47, 1.06, gz, 0.105, 0.33);
  if (level >= 2) for (i = -1; i <= 1; i += 2) B(S.roofL, 1.0, 0.015, 0.02, 0, 1.09, gz + i * 0.325);
  var dy = level >= 3 ? 1.155 : 1.145;
  for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) B(S.lacq, 0.028, 0.17, 0.028, i * 0.19, dy + 0.085, gz + j * 0.12);
  B(S.plast, 0.42, 0.17, 0.022, 0, dy + 0.085, gz + 0.125); B(S.plast, 0.42, 0.17, 0.022, 0, dy + 0.085, gz - 0.125);
  B(S.plast, 0.022, 0.17, 0.24, -0.20, dy + 0.085, gz); B(S.plast, 0.022, 0.17, 0.24, 0.20, dy + 0.085, gz);
  for (i = -1; i <= 1; i += 2) B(WIN, 0.06, 0.07, 0.012, i * 0.10, dy + 0.095, gz + 0.14);
  EAVE(S.roof, 0.46, 0.09, 0.02, 0.028, 0.74, 0, dy + 0.175, gz); VJ(-0.35, dy + 0.175, gz, 0.09, 0.23); VJ(0.35, dy + 0.175, gz, 0.09, 0.23);
  B(S.roofD, 0.76, 0.022, 0.026, 0, dy + 0.273, gz);
  if (level >= 2) for (i = -1; i <= 1; i += 2) B(level >= 4 ? GD : S.roofD, 0.03, 0.03, 0.038, i * 0.385, dy + 0.283, gz, 0, 0, i * -0.5);
  if (level >= 2) Y(GD, 0.011, 0.018, level >= 3 ? 0.075 : 0.055, 12, 0, dy + 0.305 + (level >= 3 ? 0.012 : 0), gz);
  /* ---- 两侧连排铺面 ×每侧2间：砖墙 + 廊柱额枋 + 卷檐连续双坡顶（脊沿街）+ 山花博风 + 吻饰 + 门脸四代演进 ---- */
  function shop(fx, f, zc, len, wh, o) {
    var yw = Y0 + wh, front = fx + f * 0.23, pr = wh > 0.42 ? 0.16 : 0.14, k, rg = yw + 0.01 + pr + 0.034;
    B(S.trim, 0.50, 0.02, len, fx, Y0 + 0.01, zc);
    B(S.brick, 0.46, wh, len, fx, Y0 + wh / 2, zc);
    B(STD, 0.47, 0.045, len + 0.006, fx - f * 0.008, Y0 + 0.0225, zc); /* 外墙勒脚（街面侧缩进避让门脸） */
    for (k = -1; k <= 1; k++) B(S.trim, 0.03, wh * 0.97, 0.045, fx - f * 0.238, Y0 + wh * 0.485, zc + k * (len / 2 - 0.03)); /* 外墙石壁柱分间 */
    for (k = -1; k <= 1; k += 2) {
      B(level >= 2 ? S.lacq : S.wood, 0.04, wh, 0.04, front - f * 0.018, Y0 + wh / 2, zc + k * (len / 2 - 0.05));
      B(WIN, 0.014, 0.08, 0.09, fx - f * 0.232, Y0 + wh * 0.58, zc + k * len * 0.2);
      B(S.wood, 0.024, 0.013, 0.105, fx - f * 0.24, Y0 + wh * 0.58 - 0.05, zc + k * len * 0.2);
    }
    B(S.wood, 0.046, 0.032, len * 0.92, front - f * 0.018, yw - 0.017, zc);
    EAVE(S.roof, 0.54, pr, 0.02, 0.028, len + 0.10, fx, yw + 0.01, zc, 0);
    for (k = -1; k <= 1; k += 2) B(S.roofL, 0.018, 0.015, len + 0.10, fx + k * 0.264, yw + 0.048, zc);
    B(S.roofD, 0.03, 0.023, len + 0.06, fx, rg, zc);
    if (level >= 2) for (k = -1; k <= 1; k += 2) B(S.roofD, 0.034, 0.032, 0.046, fx, rg + 0.012, zc + k * (len / 2 + 0.028), k * 0.45, 0, 0);
    if (o.gab) { TRI(S.plast, 0.46, pr * 0.8, 0.045, fx, yw - 0.008, zc + o.gab * (len / 2 + 0.02)); if (level >= 2) B(S.plast, 0.30, 0.035, 0.05, fx, yw + pr * 0.8 + 0.012, zc + o.gab * (len / 2 + 0.045)); }
    if (level === 1) {
      B(S.wood, 0.018, wh * 0.56, len * 0.5, front + f * 0.006, Y0 + wh * 0.28, zc);
      for (k = -1; k <= 1; k++) B(S.woodD, 0.006, wh * 0.52, 0.012, front + f * 0.013, Y0 + wh * 0.275, zc + k * len * 0.12);
      B(S.wood, 0.04, 0.04, len * 0.4, front + f * 0.026, Y0 + 0.06, zc);
      B(CB('#454540'), 0.09, 0.01, len * 0.55, front + f * 0.05, yw - 0.05, zc, 0, 0, -f * 0.3);
    } else if (level === 2) {
      B(glow, 0.012, wh * 0.36, len * 0.44, front - f * 0.006, Y0 + wh * 0.28, zc);
      for (k = -1; k <= 1; k++) B(S.wood, 0.016, wh * 0.40, 0.018, front + f * 0.002, Y0 + wh * 0.26, zc + (k - 1) * len * 0.14);
      B(S.wood, 0.016, 0.018, len * 0.48, front + f * 0.002, Y0 + wh * 0.48, zc);
      B(CB('#8e2f22'), 0.012, 0.05, len * 0.26, front + f * 0.012, yw - 0.068, zc);
      B(CB('#454540'), 0.09, 0.01, len * 0.55, front + f * 0.05, yw - 0.05, zc, 0, 0, -f * 0.3);
    } else {
      B(glow, 0.012, wh * 0.26, len * 0.44, front - f * 0.006, Y0 + wh * 0.24, zc);
      B(WIN, 0.014, wh * 0.30, len * 0.50, front + f * 0.004, Y0 + wh * 0.25, zc);
      B(S.wood, 0.018, 0.016, len * 0.52, front + f * 0.006, Y0 + wh * 0.41, zc);
      B(S.wood, 0.018, wh * 0.32, 0.016, front + f * 0.006, Y0 + wh * 0.25, zc);
      B(CB(fx > 0 ? '#8a6a42' : '#5c706b'), 0.15, 0.012, len * 0.58, front + f * 0.078, yw - 0.125, zc, 0, 0, -f * 0.35);
      for (k = -1; k <= 1; k += 2) B(STL, 0.012, 0.012, 0.05, front + f * 0.02, yw - 0.055, zc + k * len * 0.22);
      if (level >= 4) B(o.s1 ? sign1 : sign2, 0.014, 0.08, len * 0.32, front + f * 0.014, yw - 0.052, zc); /* 灯箱店招（底缘避让彩棚内沿） */
      if (vhankM) B(vhankM, 0.011, 0.16, 0.05, front + f * 0.038, yw - 0.165, zc + (o.door || 1) * len * 0.26);
    }
    B(S.wood, 0.016, wh * 0.5, 0.095, front + f * 0.004, Y0 + wh * 0.25, zc - (o.door || 1) * len * 0.3);
    if (level >= 2) lan(front + f * 0.035, yw - 0.045, zc + (o.door || 1) * len * 0.2, 0.75);
    if (level >= 3) lan(front + f * 0.035, yw - 0.045, zc - (o.door || 1) * len * 0.2, 0.68);
    if (level >= 2 && o.gab) { B(S.wood, 0.10, 0.008, 0.008, front + f * 0.075, yw + 0.002, zc - o.gab * len * 0.22); B(CB(o.s1 ? '#8e2f22' : '#5c706b'), 0.008, 0.095, 0.045, front + f * 0.12, yw - 0.048, zc - o.gab * len * 0.22); } /* 檐下挑杆布幌（避让彩棚） */
    if (o.balc) {
      var by = Y0 + wh * 0.55;
      B(S.wood, 0.13, 0.014, len * 0.66, fx + f * 0.29, by, zc);
      B(S.wood, 0.012, 0.045, len * 0.66, fx + f * 0.345, by + 0.028, zc);
      for (k = -1; k <= 1; k++) B(S.wood, 0.01, 0.026, 0.01, fx + f * 0.345, by + 0.014, zc + k * len * 0.28);
      for (k = -1; k <= 1; k += 2) { B(WIN, 0.012, 0.10, 0.09, front + f * 0.002, Y0 + wh * 0.78, zc + k * len * 0.2); B(S.wood, 0.024, 0.012, 0.105, front + f * 0.012, Y0 + wh * 0.78 - 0.062, zc + k * len * 0.2); }
    }
  }
  shop(-0.50, 1, 0.30, 0.58, 0.34, { gab: 1, door: 1, s1: 1 });
  shop(-0.50, 1, -0.36, 0.72, level >= 3 ? 0.46 : 0.40, { door: -1, balc: level >= 3, s1: 0 });
  shop(0.50, -1, 0.28, 0.58, 0.34, { gab: 1, door: -1, s1: 0 });
  shop(0.50, -1, -0.38, 0.72, level >= 3 ? 0.48 : 0.40, { door: 1, balc: level >= 3, s1: 1 });
  if (level >= 2) for (i = -1; i <= 1; i += 2) { /* 屋面亮瓦（贴坡，随铺面墙高变化） */
    var w2 = level >= 3 ? (i < 0 ? 0.46 : 0.48) : 0.40, p2 = w2 > 0.42 ? 0.16 : 0.14;
    B(WIN, 0.10, 0.008, 0.09, i * 0.61, Y0 + w2 + 0.03 + p2 - 0.11 * p2 / 0.167 + 0.004, i < 0 ? -0.20 : -0.55, 0, 0, -i * Math.atan(p2 / 0.167));
  }
  /* ---- 后排临街楼 ×2（层间板带/窗框窗台/楼门）+ lv2+ 转角重檐小楼 ---- */
  for (i = 0; i < 2; i++) {
    var hx = i ? 0.40 : -0.40, hh = i ? 0.72 : 0.66, bz = -1.10, fzb = bz + 0.155;
    B(S.brick, 0.72, hh, 0.28, hx, Y0 + hh / 2, bz);
    B(WB('#5c4328'), 0.74, 0.024, 0.30, hx, Y0 + hh * 0.52, bz);
    B(S.roof, 0.78, 0.012, 0.075, hx, Y0 + hh * 0.52 + 0.045, bz + 0.165, 0.5, 0, 0);
    for (j = -1; j <= 1; j += 2) {
      B(WIN, 0.12, 0.12, 0.014, hx + j * 0.16, Y0 + 0.20, fzb);
      B(S.wood, 0.14, 0.013, 0.028, hx + j * 0.16, Y0 + 0.128, fzb + 0.002);
      B(WIN, 0.10, 0.11, 0.014, hx + j * 0.16, Y0 + hh - 0.15, fzb);
      B(S.wood, 0.12, 0.013, 0.028, hx + j * 0.16, Y0 + hh - 0.22, fzb + 0.002);
    }
    B(S.wood, 0.11, 0.20, 0.014, hx, Y0 + 0.115, fzb);
    EAVE(S.roof, 0.34, i ? 0.13 : 0.12, 0.02, 0.028, 0.78, hx, Y0 + hh + 0.01, bz); VJ(hx - 0.37, Y0 + hh + 0.01, bz, i ? 0.13 : 0.12, 0.17); VJ(hx + 0.37, Y0 + hh + 0.01, bz, i ? 0.13 : 0.12, 0.17);
  }
  if (level >= 2) {
    B(S.wood, 0.26, 0.018, 0.24, 0.40, Y0 + 0.87, -1.10);
    for (i = -1; i <= 1; i += 2) for (j = -1; j <= 1; j += 2) Y(S.wood, 0.009, 0.009, 0.055, 12, 0.40 + i * 0.10, Y0 + 0.9065, -1.10 + j * 0.085);
    EAVE(S.roof, 0.28, 0.08, 0.016, 0.028, 0.30, 0.40, Y0 + 0.955, -1.10);
    Y(GD, 0.008, 0.012, 0.035, 12, 0.40, Y0 + 1.06, -1.10);
  }
  /* ---- 街内配套：跨街串灯（lv2+ 逐代加密）/ 街灯（lv3+）/ 花箱（lv3+）/ 石缸 / 幌旗（lv3+）/ lv4 外摆 ---- */
  if (level >= 2) cstr(0.30, 0.50);
  if (level >= 3) { cstr(-0.40, 0.56); lamp2(-0.24, -0.12, 1); lamp2(0.24, -0.72, -1); }
  if (level >= 4) cstr(-1.02, 0.50);
  if (level >= 3) for (i = 0; i < (level >= 4 ? 6 : 4); i++) {
    var qx = (i % 2 ? 1 : -1) * 0.24, qz = [0.10, -0.50, 0.10, -0.50, 0.55, -0.20][i];
    B(S.trim, 0.055, 0.05, 0.15, qx, Y0 + 0.025, qz); O(S.leaf2, 0.042, qx, Y0 + 0.078, qz);
  }
  Y(S.trim, 0.05, 0.042, 0.09, 12, -0.66, Y0 + 0.045, 1.16); O(S.leaf2, 0.05, -0.66, Y0 + 0.115, 1.16); /* 石缸盆栽（坐于广场面） */
  if (level >= 2) { Y(S.trim, 0.05, 0.042, 0.09, 12, 0.66, Y0 + 0.045, 1.18); O(S.leaf2, 0.05, 0.66, Y0 + 0.115, 1.18); }
  if (level >= 3) for (i = -1; i <= 1; i += 2) { B(S.trim, 0.06, 0.05, 0.16, i * 0.86, Y0 + 0.025, 1.18); O(S.leaf2, 0.045, i * 0.86, Y0 + 0.08, 1.18); } /* 前沿花箱对 */
  if (level >= 3) for (i = -1; i <= 1; i += 2) { Y(S.wood, 0.007, 0.009, 0.52, 12, i * 0.62, 0.35, 1.20); B(CB('#8e2f22'), 0.02, 0.15, 0.008, i * 0.62 - i * 0.03, 0.46, 1.20); }
  if (level >= 4) {
    umbr(0.66, 1.10);
    Y(S.wood, 0.034, 0.034, 0.014, 12, 0.60, Y0 + 0.13, 1.22); Y(S.wood, 0.006, 0.006, 0.115, 12, 0.60, Y0 + 0.062, 1.22);
    Y(S.wood, 0.024, 0.024, 0.05, 12, 0.52, Y0 + 0.025, 1.14); Y(S.wood, 0.024, 0.024, 0.05, 12, 0.68, Y0 + 0.025, 1.24);
  }
  /* ---- 行道树/街尾树：逐代增多，lv3+ 高树出屋面 ---- */
  var TR = [[0.80, -0.85, 0.30, 0.13, 1], [-0.80, 0.98, 0.24, 0.11, 0]];
  if (level >= 2) TR.push([0.80, 0.98, 0.24, 0.10, 1], [-0.80, -0.85, 0.34, 0.13, 1]);
  if (level >= 3) TR.push([-0.80, 0.40, 0.58, 0.13, 1], [0.83, 0.90, 0.26, 0.10, 1]);
  if (level >= 4) TR.push([0.80, 0.40, 0.58, 0.13, 1], [-0.83, 0.84, 0.24, 0.10, 1]);
  for (i = 0; i < TR.length; i++) tree(TR[i][0], TR[i][1], TR[i][2], TR[i][3], TR[i][4]);
  flush(g);
  g.userData.anim = [function (t) { EI(glow, [0.06, 0.14, 0.22, 0.34][level - 1] + 0.12 * (0.5 + 0.5 * Math.sin(t * 1.3))); }];
  if (level >= 2) g.userData.anim.push(function (t) {
    var s2 = 0.5 + 0.5 * Math.sin(t * 1.6 + 0.7);
    EI(lant, [0.1, 0.24, 0.28, 0.44][level - 1] + 0.14 * s2);
    if (plaqueM) EI(plaqueM, (level >= 4 ? 0.36 : level >= 3 ? 0.1 : 0.04) + 0.1 * s2);
    if (lampM) EI(lampM, 0.6 + 0.12 * s2);
    if (sign1) { EI(sign1, (level >= 4 ? 0.36 : 0.05) + 0.08 * s2); EI(sign2, (level >= 4 ? 0.36 : 0.05) + 0.08 * s2); }
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[28] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
