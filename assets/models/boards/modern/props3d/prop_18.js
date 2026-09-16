/* 大富翁·现代写实棋盘（蓉）格 18「锦里古街」 v3 结构精修 R1+R2+R3
 * 视觉基准 refs/modern/prop_18.png（四象限 1990s→2020s 同一街坊 40 年演进）：长条形地块（1.7×2.5），
 * 纵贯石板主街 + 两侧连排川西铺面街墙（灰瓦卷檐双坡顶脊平行主街连绵成片、白墙灰塑山花、木构格栅门面、木廊柱），
 * 街口大牌坊（石础抱鼓 + 石柱雀替 + 横匾「锦里」+ 层顶吻饰 + 垂挂灯笼串）、前沿石台基两级踏步、行道树冠出屋面、满街红灯笼。
 * 年代演进（对照四象限）：lv1 1990s 素朴——单层铺面木板门脸、坊灯 4 盏、双树、转角塔楼单层重檐；
 * lv2 2000s——跨街串灯、暖光格栅门脸、红底店招、脊端吻饰、坊顶金葫芦加高、亮瓦、树 4 株；
 * lv3 2010s——临街铺面长高两层（木栏杆阳台+格窗+外侧披檐）、牌坊双层檐顶、转角塔楼加高、屋顶凉亭、酒旗成对、街灯、路缘花箱、第二道串灯、檐灯成对；
 * lv4 2020s——坊顶再加高、满街灯笼、白伞茶座外摆+花箱、街边茶桌、玻璃茶座、八树成荫、第三道串灯。
 * R1：整体重构——散点小盒 → 长条街坊（两排 8 间连排 + 纵贯主街 + 坊前广场 + 台基踏步 + 前沿花圃/外摆）。
 * R2：铺面屋脊改为平行主街（EAVE 增 ry 参数）连续脊线 + 吻饰；牌坊顶转正、石柱加粗、抱鼓石/雀替、匾额入枋间；
 *     外侧墙加格窗/壁柱/披檐；树冠放大三层；瓦面贴图对比加强；街内花箱/茶桌；塔楼各级重檐。
 * R3：牌坊吻饰缩小、卷檐翘角收敛；lv3+ 檐灯成对；主街石板提亮；bbox 收口（树位/坊顶）至 1.95×2.54。
 * 契约：window.Props3DModern[18](level 1..4) → 全新 Group；占地 ≤2.6×2.6（实际约 1.95×2.54）；底面 y=0；正面 +Z；
 * 每级 mesh ≤55（实际 12/14/16/18）；高度带 lv1..4 = 1.04-1.24 / 1.1-1.3 / 1.32-1.52 / 1.4-1.62（实测 1.168/1.269/1.446/1.541）；
 * Canvas ≤256px；零 Math.random（mulberry32）；圆柱 ≥12 段；动画 2 项（暖光窗呼吸 / 灯笼·牌匾·街灯 emissive 呼吸）。
 * 工程：桶 = roughness|metalness|tex|ws|emissive|opacity，同桶手写合并 BufferGeometry + boxUV 世界尺寸烘焙（跨件无缝）；
 * 顶点色承载主色调、材质 color=白；卷檐断面 quadratic 曲线 ExtrudeGeometry 沿脊挤出；山花 TRI 棱柱；同桶不同顶点色（瓦面/正脊、条石/石柱合桶）。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_18] THREE 未定义'); return; }
var PI = Math.PI, _PC = {}, _TX = {};
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function V(h) { var c = _PC[h]; if (!c) { var q = C(h); c = _PC[h] = [q.r, q.g, q.b]; } return c; }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function F(g, c, x, y, w, h) { g.fillStyle = c; g.fillRect(x, y, w, h); }
function RA(r, g, b, a) { return 'rgba(' + r + ',' + g + ',' + b + ',' + a.toFixed(2) + ')'; }
function SPK(g, w, h, n, a, R) { for (var i = 0; i < n; i++) F(g, i % 2 ? RA(255, 255, 255, a) : RA(24, 22, 18, a), R() * w, R() * h, 1 + R() * 2.5, 1 + R() * 2); } /* 噪点层 */
function MOSS(g, w, h, n, y0, R) { for (var i = 0; i < n; i++) F(g, RA(96, 124, 58, 0.1 + R() * 0.16), R() * w, y0 + R() * (h - y0), 2 + R() * 6, 2 + R() * 3); } /* 苔痕层（下部） */
/* ---- 近白 overlay 纹理（顶点色承载主色）：各 ≥5 层 = 基色 + 块面风化 + 分缝 + 高光 + 噪点 + 苔痕 ---- */
var TXF = {
  s: function (g, w, h, R) { F(g, '#f0ece5', 0, 0, w, h); for (var y = 0; y < h; y += 32) { var o = (y / 32) % 2 ? 32 : 0; F(g, RA(80, 74, 64, 0.5), 0, y, w, 2); /* 石板：错缝分块+块差+磨光 */
    for (var x = o - 64; x < w; x += 64) { F(g, RA(80, 74, 64, 0.4), x, y, 2, 32); F(g, R() > 0.5 ? RA(255, 255, 250, 0.12) : RA(70, 64, 52, 0.1), x + 3, y + 3, 59, 27); F(g, RA(255, 255, 255, 0.22), x + 6, y + 4, 30 + R() * 24, 2); } }
    SPK(g, w, h, 80, 0.06, R); MOSS(g, w, h, 10, 0, R); },
  t: function (g, w, h, R) { F(g, '#e8ebea', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, RA(24, 30, 38, 0.62), x + 10, 0, 5, h); F(g, RA(255, 255, 255, 0.7), x + 2, 0, 3, h); F(g, RA(90, 96, 100, 0.18), x + 5, 0, 5, h); } /* 灰瓦：垄沟+釉光+行缝+瓦面风化 */
    for (var y = 10; y < h; y += 22) { F(g, RA(16, 22, 30, 0.5), 0, y, w, 2); F(g, RA(255, 255, 255, 0.25), 0, y + 2, w, 1); for (var i = 0; i < 4; i++) F(g, RA(60, 66, 70, 0.05 + R() * 0.1), R() * w, y + 3, 12, 17); } SPK(g, w, h, 60, 0.06, R); MOSS(g, w, h, 12, 70, R); },
  w: function (g, w, h, R) { F(g, '#f5ebdf', 0, 0, w, h); for (var x = 0; x < w; x += 5) F(g, RA(70, 40, 20, 0.14 + R() * 0.14), x + R() * 2, 0, 1, h); /* 木构：直纹+节疤+顺纹高光 */
    for (var i = 0; i < 3; i++) { g.fillStyle = RA(70, 40, 20, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 3 + R() * 3, 0, 6.283); g.fill(); } for (x = 6; x < w; x += 28) F(g, RA(255, 255, 255, 0.32), x, 0, 2, h); SPK(g, w, h, 40, 0.05, R); },
  p: function (g, w, h, R) { F(g, '#f8f4ec', 0, 0, w, h); for (var i = 0; i < 9; i++) F(g, RA(120, 110, 88, 0.05 + R() * 0.07), R() * w, R() * 30, 2 + R() * 5, 40 + R() * 80); /* 灰泥：雨渍+裂纹+泛潮+噪点+苔 */
    for (i = 0; i < 4; i++) { var x0 = R() * w; g.strokeStyle = RA(110, 100, 80, 0.18); g.lineWidth = 1; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + (R() - 0.5) * 14, h); g.stroke(); } F(g, RA(90, 84, 66, 0.1), 0, 108, w, 20); SPK(g, w, h, 100, 0.05, R); MOSS(g, w, h, 8, 100, R); },
  l: function (g, w, h, R) { F(g, '#f1f5ea', 0, 0, w, h); for (var i = 0; i < 34; i++) { g.fillStyle = i % 2 ? RA(34, 66, 24, 0.28) : RA(255, 255, 240, 0.3); g.beginPath(); g.arc(R() * w, R() * h, 2 + R() * 4, 0, 6.283); g.fill(); } }, /* 树冠：明暗叶斑 */
  n: function (g, w, h, R) { F(g, '#ffffff', 0, 0, w, h); for (var x = 0; x < w; x += 16) { F(g, RA(120, 20, 10, 0.35), x + 6, 0, 3, h); F(g, RA(255, 240, 220, 0.4), x + 12, 0, 2, h); } F(g, RA(120, 60, 10, 0.3), 0, 0, w, 6); F(g, RA(120, 60, 10, 0.3), 0, h - 6, w, 6); SPK(g, w, h, 20, 0.04, R); }, /* 灯笼纸：竹骨+纸纹（map+emissiveMap） */
  g: function (g, w, h) { F(g, '#8a2318', 0, 0, w, h); g.strokeStyle = '#ffd98c'; g.lineWidth = 4; g.strokeRect(5, 5, w - 10, h - 10); g.fillStyle = '#ffd98c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 42px "Microsoft YaHei",sans-serif'; g.fillText('锦里', w / 2, h / 2 + 2); } /* 红底金字大牌匾 256×64 */
};
function tex(id) { if (_TX[id]) return _TX[id]; var c = id === 'g' ? cv(256, 64) : cv(128, 128); TXF[id](c.getContext('2d'), c.width, c.height, lcg(1800 + id.charCodeAt(0))); var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return (_TX[id] = t); }
/* ---- 桶系统：桶 = 材质参数；MS() 返回 {b:桶, c:线性顶点色}；flush 同桶合并 + 顶点色 + boxUV（ws=每重复米数，0=保留原 UV） ---- */
var BK;
function MS(h, rg, mt, tx, ws, em, ei, op) { var k = rg + '|' + (mt || 0) + '|' + (tx || '') + '|' + (ws || 0) + '|' + (em || '') + '|' + (ei || 0) + '|' + (op || 0); var b = BK[k] || (BK[k] = { rg: rg, mt: mt || 0, tx: tx || '', ws: ws || 0, em: em || '', ei: ei || 0, op: op || 0, gs: [], cs: [] }); return { b: b, c: V(h) }; }
function xf(g, x, y, z, rx, ry, rz) { if (x || y || z || rx || ry || rz) g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(1, 1, 1))); return g; }
function put(m, g) { m.b.gs.push(g); m.b.cs.push(m.c); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z)); }
function A2(m, geo, x, y, z, ry) { put(m, xf(geo, x, y, z, 0, ry || 0, 0)); }
function TRI(m, w, h, d, x, y, z) { var s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.closePath(); A2(m, new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), x, y, z); }
function EAVE(m, w, h, t, tip, d, x, y, z, ry) { /* 卷檐坡屋顶：quadratic 翘檐断面沿脊挤出。w=檩向跨度（檐到檐）、d=脊长；ry 缺省 PI/2 → 脊沿 x；ry=0 → 脊沿 z */
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
    var b = BK[k], gs = b.gs, P = 0, i, j; if (!gs.length) continue; /* 空桶不出 mesh */
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ca = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) {
      var p = gs[i].attributes.position.array, c = b.cs[i]; pa.set(p, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2);
      for (j = 0; j < p.length; j += 3) { ca[o + j] = c[0]; ca[o + j + 1] = c[1]; ca[o + j + 2] = c[2]; } o += p.length;
    }
    if (b.ws) for (i = 0; i < P; i += 9) { /* boxUV：三角面主法线轴投影 × 1/ws（世界尺寸烘焙，跨件无缝） */
      var ax = pa[i + 3] - pa[i], ay = pa[i + 4] - pa[i + 1], az = pa[i + 5] - pa[i + 2], bx = pa[i + 6] - pa[i], by = pa[i + 7] - pa[i + 1], bz = pa[i + 8] - pa[i + 2];
      var nx = Math.abs(ay * bz - az * by), ny = Math.abs(az * bx - ax * bz), nz = Math.abs(ax * by - ay * bx), s = 1 / b.ws;
      for (j = 0; j < 3; j++) { var q = i + j * 3, u = i / 9 * 6 + j * 2; if (ny >= nx && ny >= nz) { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 2] * s; } else if (nx >= nz) { ua[u] = pa[q + 2] * s; ua[u + 1] = pa[q + 1] * s; } else { ua[u] = pa[q] * s; ua[u + 1] = pa[q + 1] * s; } }
    }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2)); geo.setAttribute('color', new THREE.BufferAttribute(ca, 3));
    var m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: b.rg, metalness: b.mt, flatShading: true });
    if (b.tx) m.map = tex(b.tx); if (b.em) { m.emissive = C(b.em); m.emissiveIntensity = b.ei; if (b.tx) m.emissiveMap = m.map; } if (b.op) { m.transparent = true; m.opacity = b.op; }
    b.m = m; var ms = new THREE.Mesh(geo, m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function EI(m, v) { if (m && m.b.m) m.b.m.emissiveIntensity = v; }
function build(level) {
  var g = new THREE.Group(); g.name = 'prop_18_lv' + level; g.userData.kind = 'property'; g.userData.propIdx = 18; g.userData.level = level;
  BK = {};
  var Y0 = 0.09, i; /* Y0 = 石台基顶面（室内地坪） */
  var A = { /* 材质分区（桶）：石板/主街/条石/灰泥/白灰/瓦/木/树干/窗玻璃/叶/金/铁线/红布/钢/玻璃棚 —— 同桶不同顶点色 */
    stone: MS(['#7e766a', '#837b6f', '#88806f', '#847c6d'][level - 1], 0.92, 0, 's', 0.6),
    lane: MS(['#867e70', '#8c8474', '#928a7a', '#8e8676'][level - 1], 0.92, 0, 's', 0.6),
    stone2: MS('#a39a88', 0.9, 0, 's', 0.4),
    plast: MS(['#cbc2ae', '#d6cdb9', '#e2dbc9', '#e0d8c5'][level - 1], 0.85, 0, 'p', 0.8),
    white: MS('#ddd6c6', 0.85, 0, 'p', 0.8),
    roof: MS(['#3e413c', '#42453f', '#474a43', '#454847'][level - 1], 0.7, 0, 't', 0.35),
    wood: MS(level >= 4 ? '#54381e' : '#4a3018', 0.72, 0, 'w', 0.3), trunk: MS('#4e3624', 0.9, 0, 'w', 0.3),
    win: MS('#262c30', 0.15, 0.6),
    leaf: MS(['#6c7d42', '#71824a', '#78894c', '#7c8d50'][level - 1], 0.95, 0, 'l', 0.3), leaf2: MS('#80904f', 0.95, 0, 'l', 0.3),
    gold: MS('#c9a04a', 0.35, 0.8), wire: MS('#3d3b38', 0.8), flagR: MS('#a5352a', 0.85),
    steel: MS('#7d848a', 0.45, 0.7), sky: MS('#354049', 0.12, 0.5, '', 0, '', 0, 0.55)
  };
  var roofD = { b: A.roof.b, c: V('#2c2f2b') }, roofL = { b: A.roof.b, c: V('#767a74') }, woodD = { b: A.wood.b, c: V('#33200e') }; /* 正脊深色 / 檐口瓦当亮线 / 深色板缝：同桶异顶点色 */
  var glow = MS('#5a4636', 0.2, 0, '', 0, '#ffbd66', 0.14); /* 暖光店内景：低 rough */
  var lant = MS('#b03828', 0.6, 0, 'n', 0.12, '#ff5a2a', level >= 2 ? 0.3 : 0.05); /* 灯笼纸：map+emissiveMap（lv1 微光） */
  var signM = MS('#ffffff', 0.5, 0, 'g', 0, '#ffcf8e', level >= 4 ? 0.55 : 0.12); /* 锦里红匾：map+emissiveMap */
  var lampM = level >= 3 ? MS('#ffe6b0', 0.4, 0, '', 0, '#ffd9a0', 0.7) : null; /* 街灯灯头 */
  var umbM = level >= 4 ? MS('#efece2', 0.6, 0, '', 0) : null; /* 茶座白伞 */
  /* ---- 小件语汇 ---- */
  function lan(x, yTop, z, s) { s = s || 1; /* 挂笼：吊线+金盖+红纸笼+金穗（全 12 段圆柱） */
    Y(A.wire, 0.003, 0.003, 0.05 * s, 12, x, yTop - 0.025 * s, z);
    Y(A.gold, 0.012 * s, 0.012 * s, 0.018 * s, 12, x, yTop - 0.059 * s, z);
    Y(lant, 0.032 * s, 0.04 * s, 0.055 * s, 12, x, yTop - 0.095 * s, z);
    Y(A.gold, 0.006 * s, 0.004 * s, 0.024 * s, 12, x, yTop - 0.134 * s, z);
  }
  function cstr(z, y, n) { B(A.wire, 0.46, 0.005, 0.005, 0, y, z); for (var k = 0; k < n; k++) lan(-0.15 + k * 0.15, y - 0.005, z, 0.8); } /* 跨街串灯 */
  function tree(x, z, th, cr, third) { var by = z > 1.05 ? 0.028 : Y0; /* 行道树：干+双/三层冠，出屋面 */
    Y(A.trunk, 0.02, 0.032, th, 12, x, by + th / 2, z);
    O(A.leaf, cr, x, by + th + cr * 0.5, z);
    O(A.leaf2, cr * 0.6, x + cr * 0.45, by + th + cr * 0.85, z + cr * 0.3);
    if (third) O(A.leaf, cr * 0.4, x - cr * 0.4, by + th + cr * 1.05, z - cr * 0.2);
  }
  function lamp2(x, z) { Y(A.steel, 0.008, 0.011, 0.40, 12, x, Y0 + 0.20, z); B(A.steel, 0.09, 0.01, 0.01, x + (x < 0 ? 0.045 : -0.045), Y0 + 0.405, z); B(lampM, 0.05, 0.016, 0.035, x + (x < 0 ? 0.085 : -0.085), Y0 + 0.396, z); }
  function umbr(x, z) { var b = 0.028; Y(A.wood, 0.005, 0.005, 0.32, 12, x, b + 0.16, z); Y(umbM, 0.135, 0.012, 0.075, 12, x, b + 0.345, z); Y(A.gold, 0.004, 0.004, 0.025, 12, x, b + 0.395, z); }
  /* ---- 铺面单元：fx 体心 x，f 朝向街面（左排 +1 / 右排 -1），zc/len 沿街长，wh 墙高；脊沿 z 连绵，坡向 ±x ---- */
  function shop(fx, f, zc, len, wh, o) {
    var yw = Y0 + wh, front = fx + f * 0.29, fx2 = front + f * 0.013, back = fx - f * 0.29, bx2 = back - f * 0.008, pr = wh > 0.5 ? 0.13 : 0.12, ry = yw + 0.01 + pr + 0.032, i;
    B(A.stone2, 0.60, 0.06, len + 0.02, fx, Y0 + 0.03, zc); /* 台基条石 */
    B(A.plast, 0.58, wh, len, fx, Y0 + wh / 2, zc); /* 墙体（白墙灰塑） */
    for (i = -1; i <= 1; i += 2) { B(A.wood, 0.05, wh, 0.05, front - f * 0.02, Y0 + wh / 2, zc + i * (len / 2 - 0.045)); B(A.wood, 0.04, wh, 0.04, back + f * 0.018, Y0 + wh / 2, zc + i * (len / 2 - 0.04)); } /* 前廊柱 / 后壁柱 */
    B(A.wood, 0.06, 0.035, len * 0.9, front - f * 0.02, yw - 0.018, zc); /* 额枋 */
    B(A.wood, 0.02, 0.03, len * 0.96, back - f * 0.005, yw - 0.016, zc); /* 后檐板 */
    EAVE(A.roof, 0.68, pr, 0.024, 0.03, len + 0.10, fx, yw + 0.01, zc, 0); /* 卷檐双坡顶（脊沿街，瓦垄 boxUV） */
    for (i = -1; i <= 1; i += 2) B(roofL, 0.022, 0.018, len + 0.10, fx + i * 0.335, yw + 0.052, zc); /* 檐口瓦当亮线 */
    B(roofD, 0.035, 0.026, len + 0.06, fx, ry, zc); /* 正脊（相邻单元搭接成连续脊线） */
    if (level >= 2) for (i = -1; i <= 1; i += 2) B(roofD, 0.04, 0.035, 0.05, fx, ry + 0.014, zc + i * (len / 2 + 0.02), i * 0.45, 0, 0); /* 脊端吻饰翘起 */
    if (o.gab) { /* 白灰山花（悬山端头）+ lv2 增博风一步 */
      var ze = zc + o.gab * len / 2, zd = o.gab > 0 ? -0.048 : 0;
      TRI(A.white, 0.46, pr * 0.8, 0.048, fx, yw - 0.008, ze + zd);
      if (level >= 2) B(A.white, 0.30, 0.04, 0.05, fx, yw + pr * 0.8 + 0.012, ze + zd + 0.024);
    }
    if (level === 1) { /* 1990s 木板门脸（排门板缝）+ 柜台 + 遮板后暗窗 */
      B(A.wood, 0.02, wh * 0.55, len * 0.52, fx2, Y0 + wh * 0.28, zc);
      for (i = -1; i <= 1; i++) B(woodD, 0.006, wh * 0.5, 0.012, fx2 + f * 0.011, Y0 + wh * 0.28, zc + i * len * 0.13);
      B(A.wood, 0.045, 0.045, len * 0.46, front + f * 0.038, Y0 + 0.155, zc - len * 0.06);
      for (i = -1; i <= 1; i += 2) B(A.win, 0.012, 0.065, 0.09, front + f * 0.004, yw - 0.10, zc + i * len * 0.18);
    } else { /* 2000s+ 暖光店内景 + 木格栅门脸 */
      B(glow, 0.014, wh * 0.42, len * 0.5, front + f * 0.004, Y0 + wh * 0.30, zc);
      for (i = -1; i <= 1; i++) B(A.wood, 0.017, wh * 0.5, 0.02, fx2, Y0 + wh * 0.30, zc + i * len * 0.155);
      B(A.wood, 0.017, 0.016, len * 0.53, fx2, Y0 + wh * 0.525, zc);
      B(A.wood, 0.017, 0.02, len * 0.53, fx2, Y0 + wh * 0.09, zc);
    }
    B(A.wood, 0.016, wh * 0.6, 0.115, fx2, Y0 + wh * 0.30, zc + (o.door || 1) * len * 0.315); /* 木门 */
    if (level >= 2) B(A.flagR, 0.013, 0.05, len * 0.4, front + f * 0.022, yw - 0.062, zc); /* 红底店招 */
    for (i = -1; i <= 1; i += 2) { B(A.win, 0.012, 0.085, 0.10, bx2, Y0 + wh * 0.56, zc + i * len * 0.22); B(A.wood, 0.024, 0.012, 0.115, back - f * 0.014, Y0 + wh * 0.56 - 0.05, zc + i * len * 0.22); } /* 后墙格窗+窗台 */
    if (wh > 0.42) B(A.roof, 0.15, 0.016, len + 0.04, back - f * 0.06, Y0 + wh * 0.52, zc, 0, 0, f * 0.5); /* 高墙外侧披檐 */
    if (o.balc) { /* lv3+ 二层：木栏杆阳台 + 格窗（窗框+窗台+楣） */
      var by = Y0 + wh * 0.52;
      B(A.wood, 0.14, 0.018, len * 0.72, fx + f * 0.35, by, zc);
      B(A.wood, 0.014, 0.014, len * 0.72, fx + f * 0.415, by + 0.096, zc);
      for (i = -1; i <= 1; i++) B(A.wood, 0.012, 0.09, 0.012, fx + f * 0.415, by + 0.049, zc + i * len * 0.23);
      for (i = -1; i <= 1; i += 2) {
        B(A.win, 0.012, 0.115, 0.10, front + f * 0.004, Y0 + wh * 0.76, zc + i * 0.125);
        B(A.wood, 0.028, 0.012, 0.115, front + f * 0.014, Y0 + wh * 0.76 - 0.067, zc + i * 0.125);
        B(A.wood, 0.024, 0.012, 0.115, front + f * 0.012, Y0 + wh * 0.76 + 0.064, zc + i * 0.125);
      }
    }
    if (o.lan) { lan(front + f * 0.035, yw - 0.04, zc, 0.72); /* 檐下挂笼，lv3+ 成对 */ if (level >= 3) lan(front + f * 0.035, yw - 0.04, zc - (o.door || 1) * len * 0.24, 0.66); }
    if (o.ban) { /* 酒旗：挑杆+红幡+金缚 */
      B(A.wood, 0.10, 0.012, 0.012, front + f * 0.06, yw - 0.012, zc + len * 0.16);
      B(A.flagR, 0.05, 0.21, 0.011, front + f * 0.105, yw - 0.125, zc + len * 0.16);
      B(A.gold, 0.052, 0.02, 0.012, front + f * 0.105, yw - 0.032, zc + len * 0.16);
    }
  }
  /* ---- 地面：石台基（两级踏步下到前街沿）+ 主街石板 + 坊前小广场 + 路缘 ---- */
  B(A.stone, 1.70, 0.09, 2.31, 0, 0.045, -0.095);
  B(A.stone2, 1.00, 0.055, 0.10, 0, 0.0275, 1.11);
  B(A.lane, 1.70, 0.028, 0.09, 0, 0.014, 1.205);
  B(A.lane, 0.50, 0.012, 1.99, 0, Y0 + 0.006, -0.245);
  B(A.lane, 0.86, 0.012, 0.30, 0, Y0 + 0.006, 0.90);
  B(A.stone2, 0.035, 0.016, 1.99, -0.265, Y0 + 0.006, -0.245);
  B(A.stone2, 0.035, 0.016, 1.99, 0.265, Y0 + 0.006, -0.245);
  /* ---- 两侧连排铺面（左排朝东 / 右排朝西，脊平行主街；前两间等高 → 连续脊线，后两间逐级抬高） ---- */
  var wh3 = level >= 3 ? 0.56 : 0.34, wh4 = level >= 3 ? 0.62 : (level === 2 ? 0.50 : 0.44);
  shop(-0.53, 1, 0.52, 0.44, 0.31, { gab: 1, lan: level >= 2, door: 1 });
  shop(-0.53, 1, 0.22, 0.60, 0.31, { lan: 1, ban: level >= 3, door: -1 });
  shop(-0.53, 1, -0.38, 0.60, wh3, { balc: level >= 3, lan: level >= 3, door: 1 });
  shop(-0.53, 1, -0.95, 0.54, 0.38, { gab: -1, lan: level >= 4, door: -1 });
  shop(0.53, -1, 0.50, 0.44, 0.32, { gab: 1, lan: level >= 2, door: -1 });
  shop(0.53, -1, 0.18, 0.60, 0.32, { lan: 1, door: 1 });
  shop(0.53, -1, -0.42, 0.60, wh3 + 0.02, { balc: level >= 3, lan: level >= 3, ban: level >= 3, door: -1 });
  shop(0.53, -1, -0.97, 0.50, wh4, { gab: -1, lan: level >= 4, door: 1 });
  /* ---- 屋面点缀：lv2+ 亮瓦（贴坡） ---- */
  if (level >= 2) { B(A.win, 0.10, 0.012, 0.09, -0.38, Y0 + 0.31 + 0.075, 0.30, 0, 0, -0.5); B(A.win, 0.10, 0.012, 0.09, 0.38, Y0 + 0.32 + 0.075, 0.05, 0, 0, 0.5); }
  /* ---- 转角塔楼（右后）：各级重檐小顶（lv1 即有，随墙高抬升） ---- */
  var t4 = Y0 + wh4 + 0.01 + (wh4 > 0.5 ? 0.13 : 0.12) + 0.024;
  B(A.wood, 0.30, 0.016, 0.26, 0.53, t4 + 0.008, -0.97);
  for (i = -1; i <= 1; i += 2) { Y(A.wood, 0.010, 0.010, 0.06, 12, 0.53 + i * 0.115, t4 + 0.046, -0.97 + i * 0.095); Y(A.wood, 0.010, 0.010, 0.06, 12, 0.53 + i * 0.115, t4 + 0.046, -0.97 - i * 0.095); }
  EAVE(A.roof, 0.30, 0.09, 0.016, 0.03, 0.34, 0.53, t4 + 0.076, -0.97);
  B(roofD, 0.28, 0.02, 0.024, 0.53, t4 + 0.176, -0.97);
  Y(A.gold, 0.009, 0.013, 0.045, 12, 0.53, t4 + 0.205, -0.97);
  /* ---- 锦里大牌坊：石础抱鼓 + 石柱 + 雀替 + 额枋两层 + 「锦里」横匾 + 卷檐层顶（脊沿 x）+ 吻饰 + 垂笼 ---- */
  var hp = level >= 4 ? 0.62 : 0.56, pt = Y0 + 0.14 + hp, gzc = 0.86, pil = { b: A.stone2.b, c: V('#948c7c') };
  for (i = -1; i <= 1; i += 2) {
    B(A.stone2, 0.22, 0.14, 0.24, i * 0.30, Y0 + 0.07, gzc);
    Y(A.stone2, 0.035, 0.035, 0.05, 12, i * 0.30, Y0 + 0.175, gzc + 0.15, 0, 0, PI / 2); Y(A.stone2, 0.035, 0.035, 0.05, 12, i * 0.30, Y0 + 0.175, gzc - 0.15, 0, 0, PI / 2);
    B(pil, 0.11, hp, 0.11, i * 0.30, Y0 + 0.14 + hp / 2, gzc);
    B(A.wood, 0.10, 0.03, 0.06, i * 0.20, pt - 0.014, gzc);
    lan(i * 0.30, pt - 0.02, gzc + 0.10, 1);
  }
  B(A.wood, 0.86, 0.05, 0.10, 0, pt + 0.025, gzc);
  B(A.wood, 0.76, 0.035, 0.08, 0, pt + 0.066, gzc);
  B(signM, 0.34, 0.15, 0.026, 0, pt - 0.085, gzc + 0.06);
  var lb = level >= 2 ? 0.96 : 0.90, lt;
  EAVE(A.roof, 0.46, 0.15, 0.026, 0.035, 0.94, 0, lb, gzc);
  B(roofD, 0.86, 0.026, 0.03, 0, lb + 0.19, gzc);
  for (i = -1; i <= 1; i += 2) B(roofL, 0.94, 0.018, 0.022, 0, lb + 0.055, gzc + i * 0.225); /* 坊顶檐口瓦当 */
  /* 坊左瓦顶矮墙（连接花圃转角，参考前左侧连墙） */
  B(A.stone2, 0.46, 0.05, 0.08, -0.625, Y0 + 0.025, gzc); B(A.plast, 0.44, 0.17, 0.05, -0.625, Y0 + 0.135, gzc);
  B(A.roof, 0.48, 0.02, 0.11, -0.625, Y0 + 0.23, gzc); B(roofD, 0.48, 0.016, 0.022, -0.625, Y0 + 0.247, gzc);
  if (level >= 3) { B(A.gold, 0.03, 0.038, 0.026, -0.43, lb + 0.20, gzc, 0, 0, 0.3); B(A.gold, 0.03, 0.038, 0.026, 0.43, lb + 0.20, gzc, 0, 0, -0.3); }
  lt = lb + 0.176;
  if (level >= 3) { /* lv3+ 双层檐顶 */
    B(A.wood, 0.50, 0.02, 0.20, 0, lt + 0.03, gzc);
    var ub = level >= 4 ? 1.236 : 1.162;
    for (i = -1; i <= 1; i += 2) { Y(A.wood, 0.013, 0.013, ub - lt, 12, i * 0.20, (lt + ub) / 2, gzc - 0.06); Y(A.wood, 0.013, 0.013, ub - lt, 12, i * 0.20, (lt + ub) / 2, gzc + 0.06); }
    EAVE(A.roof, 0.30, 0.13, 0.02, 0.04, 0.60, 0, ub, gzc);
    B(roofD, 0.52, 0.022, 0.026, 0, ub + 0.16, gzc);
    Y(A.gold, 0.018, 0.028, level >= 4 ? 0.13 : 0.11, 12, 0, ub + 0.15 + (level >= 4 ? 0.065 : 0.055), gzc);
    Y(A.gold, 0.012, 0.012, 0.024, 12, 0, ub + 0.15 + (level >= 4 ? 0.143 : 0.122), gzc);
  } else {
    Y(A.gold, 0.016, 0.026, level >= 2 ? 0.11 : 0.07, 12, 0, lt + (level >= 2 ? 0.055 : 0.035), gzc);
    Y(A.gold, 0.011, 0.011, 0.022, 12, 0, lt + (level >= 2 ? 0.122 : 0.081), gzc);
  }
  if (level >= 2) { /* 坊间垂挂灯笼串（额枋后侧） */
    B(A.wire, 0.44, 0.005, 0.005, 0, pt - 0.10, gzc - 0.07);
    for (i = -1; i <= 1; i += 2) { Y(A.wire, 0.0025, 0.0025, 0.20, 12, i * 0.14, pt - 0.22, gzc - 0.07); lan(i * 0.14, pt - 0.12, gzc - 0.07, 0.8); lan(i * 0.14, pt - 0.32, gzc - 0.07, 0.8); }
  }
  /* ---- 跨街灯笼串（逐年代加密）+ 街灯（lv3+） ---- */
  if (level >= 2) cstr(0.36, 0.44, 3);
  if (level >= 3) { cstr(-0.38, 0.62, 3); lamp2(-0.27, -0.06); lamp2(0.27, -0.66); }
  if (level >= 4) cstr(-0.95, 0.50, 3);
  /* ---- 屋顶加建：lv3+ 凉亭（左后屋顶）· lv4 玻璃茶座（右中屋顶） ---- */
  if (level >= 3) {
    var p4 = Y0 + 0.38 + 0.01 + 0.12 + 0.024;
    B(A.wood, 0.26, 0.018, 0.26, -0.53, p4 + 0.009, -0.95);
    for (i = -1; i <= 1; i += 2) { Y(A.wood, 0.011, 0.011, 0.075, 12, -0.53 + i * 0.10, p4 + 0.0555, -0.95 + i * 0.09); Y(A.wood, 0.011, 0.011, 0.075, 12, -0.53 + i * 0.10, p4 + 0.0555, -0.95 - i * 0.09); }
    EAVE(A.roof, 0.28, 0.085, 0.016, 0.03, 0.30, -0.53, p4 + 0.093, -0.95);
    Y(A.gold, 0.008, 0.012, 0.04, 12, -0.53, p4 + 0.19, -0.95);
  }
  if (level >= 4) {
    B(A.sky, 0.30, 0.15, 0.26, 0.53, Y0 + 0.32 + 0.01 + 0.144 + 0.065, 0.18);
    B(A.steel, 0.34, 0.012, 0.30, 0.53, Y0 + 0.32 + 0.01 + 0.144 + 0.146, 0.18);
    Y(A.steel, 0.005, 0.005, 0.05, 12, 0.62, Y0 + 0.544, 0.12); Y(A.gold, 0.008, 0.008, 0.014, 12, 0.62, Y0 + 0.576, 0.12);
  }
  /* ---- 街内配套：lv3+ 路缘花箱 · lv4 街边茶桌凳 ---- */
  if (level >= 3) for (i = 0; i < 4; i++) { var qx = (i % 2 ? 1 : -1) * 0.215, qz = [0.62, -0.20, 0.08, -0.72][i]; B(A.stone2, 0.06, 0.05, 0.14, qx, Y0 + 0.037, qz); O(A.leaf2, 0.038, qx, Y0 + 0.085, qz); }
  if (level >= 4) for (i = 0; i < 2; i++) { var tx = i ? 0.15 : -0.15, tz = i ? -0.56 : 0.02; Y(A.wood, 0.036, 0.036, 0.014, 12, tx, Y0 + 0.13, tz); Y(A.wood, 0.007, 0.007, 0.12, 12, tx, Y0 + 0.065, tz); Y(A.wood, 0.022, 0.022, 0.05, 12, tx, Y0 + 0.037, tz + 0.085); Y(A.wood, 0.022, 0.022, 0.05, 12, tx, Y0 + 0.037, tz - 0.085); }
  /* ---- 前沿：左矮墙花圃（石缸/盆栽）+ 右外摆区（lv1-3 长凳盆栽 → lv4 白伞茶座+花箱） ---- */
  B(A.stone2, 0.50, 0.11, 0.045, -0.59, 0.028 + 0.055, 1.225);
  B(A.white, 0.52, 0.016, 0.055, -0.59, 0.028 + 0.118, 1.225);
  B(A.stone2, 0.14, 0.07, 0.13, -0.42, 0.028 + 0.035, 1.13);
  O(A.leaf2, 0.055, -0.42, 0.028 + 0.10, 1.13);
  Y(A.stone2, 0.055, 0.042, 0.10, 12, -0.74, 0.028 + 0.05, 1.10);
  if (level >= 4) {
    umbr(0.40, 1.10); umbr(0.66, 1.13);
    Y(A.wood, 0.048, 0.048, 0.016, 12, 0.40, 0.028 + 0.155, 1.10); Y(A.wood, 0.008, 0.008, 0.125, 12, 0.40, 0.028 + 0.0625, 1.10);
    Y(A.wood, 0.032, 0.032, 0.014, 12, 0.66, 0.028 + 0.13, 1.13); Y(A.wood, 0.007, 0.007, 0.115, 12, 0.66, 0.028 + 0.0575, 1.13);
    Y(A.wood, 0.026, 0.026, 0.055, 12, 0.29, 0.028 + 0.0275, 1.10); Y(A.wood, 0.026, 0.026, 0.055, 12, 0.51, 0.028 + 0.0275, 1.10);
    Y(A.wood, 0.026, 0.026, 0.055, 12, 0.56, 0.028 + 0.0275, 1.13); Y(A.wood, 0.026, 0.026, 0.055, 12, 0.76, 0.028 + 0.0275, 1.13);
    B(A.stone2, 0.16, 0.07, 0.12, -0.20, 0.028 + 0.035, 1.10); O(A.leaf2, 0.05, -0.20, 0.028 + 0.095, 1.10);
  } else {
    B(A.wood, 0.30, 0.024, 0.09, 0.55, 0.028 + 0.072, 1.19);
    B(A.wood, 0.02, 0.06, 0.08, 0.44, 0.028 + 0.03, 1.19); B(A.wood, 0.02, 0.06, 0.08, 0.66, 0.028 + 0.03, 1.19);
    B(A.stone2, 0.15, 0.06, 0.12, -0.30, 0.028 + 0.03, 1.12); O(A.leaf2, 0.05, -0.30, 0.028 + 0.085, 1.12);
  }
  /* ---- 古街乔木：逐年代增多长高，树冠出屋面（左前株 lv3+ 入花圃） ---- */
  var TR = [[-0.72, -1.04, 0.44, 0.22, 0], [0.74, -0.42, 0.42, 0.21, 0]];
  if (level >= 2) TR.push([-0.75, -0.20, 0.42, 0.20, 1], [0.76, 0.26, 0.40, 0.19, 1]);
  if (level >= 3) TR.push([-0.62, 1.12, 0.26, 0.13, 1], [0.76, -1.04, 0.48, 0.23, 1]);
  if (level >= 4) TR.push([0.68, 1.12, 0.24, 0.11, 1], [-0.36, -1.08, 0.42, 0.19, 1]);
  for (i = 0; i < TR.length; i++) tree(TR[i][0], TR[i][1], TR[i][2], TR[i][3], TR[i][4]);
  flush(g);
  g.userData.anim = [function (t) { EI(glow, (level >= 2 ? 0.5 : 0.12) + 0.14 * (0.5 + 0.5 * Math.sin(t * 1.4))); }];
  if (level >= 2) g.userData.anim.push(function (t) {
    var s = 0.5 + 0.5 * Math.sin(t * 1.8);
    EI(lant, (level >= 4 ? 0.62 : 0.26) + 0.18 * s); EI(signM, (level >= 4 ? 0.55 : 0.12) + 0.12 * s);
    if (lampM) EI(lampM, 0.62 + 0.1 * s);
  });
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[18] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
