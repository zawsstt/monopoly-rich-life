/* 大富翁·现代写实棋盘（西安）格 30「大唐不夜城」—— 大雁塔 + 唐风金顶宫殿群 + 轴线灯光秀水景（满格 2.56²），四年代结构性演进
 * 契约：window.Props3DModern[30](level 1..4) → Group，每次全新实例；占地 ≤2.6×2.6；底面 y=0；正面 +Z；每级 mesh ≤55（同材质手写合并）；
 *   Canvas ≤256px；零 Math.random（LCG）；圆柱段 ≥12；动画 ≤2 项（窗/金顶泛光呼吸 / lv4 水面漂移+LED 脉冲）。
 * 年代特征（refs/modern/prop_30.png 四象限）：lv1 1990s 灰黑瓦民居院落群（18 座）+素土大雁塔+黑瓦山门+土院墙+素广场；lv2 2000s 前排金顶殿初建
 *   （东侧先建）+红墙+轴线树阵绿带+后排玻璃高楼初现+鎏金匾；lv3 2010s 双重檐金顶宫殿群两翼成型+红灯笼+花坛+高楼成排；lv4 2020s 金顶泛光+
 *   轴线全长发光水池链+喷泉+大 LED 屏+店面暖光带+高楼亮窗+夜景。
 * R1 精修（对照参考四象限 12 条差距）：①庑殿顶重写为真实四坡面片（FG 平面世界 UV）+檐底封板+封檐板+正脊+鸱吻+角部翘起，废除斜板伞骨
 *   ②侧翼改 3 排×2 列院落（lv3-4 每侧 6 殿共 12 殿）+院墙，密度对齐参考 ③lv1 密集灰瓦民居+土院墙+素土空地 ④大雁塔重制：双层台院+围廊墙+
 *   7 层收分塔身+层檐+拱窗+攒尖顶+塔刹（H≈1.32，带内）⑤山门 4 柱 3 间+横枋+门垛+鎏金匾 ⑥轴线 lv2 树阵绿带→lv4 全长发光水池链+喷泉
 *   ⑦背景高楼移后缘两翼不遮塔（lv2 两栋→lv3 四栋→lv4 亮窗带+屋顶机房）⑧树改三团簇冠，沿街/侧缘/轴线三级布置 ⑨九种程序贴图分区
 *   （石板/条带铺装/金瓦/灰瓦/塔砖/抹灰×2/幕墙/水/LED）boxUV 按世界周期烘焙 ⑩配色取自参考（赭金顶/朱红墙/灰黑瓦/土黄塔/灰白民居）。
 * R2 精修（R1 渲染对照差距 12 条清偿）：①前街中央 3 树移除不遮山门 ②轴线加宽 .5 + 水池链加宽 .42 提亮 ei.7 + 喷泉加高 ③雁塔层檐/攒尖改暖褐 peave
 *   ④殿身窗带加高 hb×.24 + lv4 ei.55 + LED 殿门扇暖光 ⑤轴线树阵 r.07 每侧 5 棵 lv3+ 三团簇 ⑥lv1 补素土块+两座披屋 ⑦lv4 山门金顶配深色正脊（rk 覆盖）
 *   ⑧LED 补量：门垛小屏×2 + PB1 ⑨高楼压顶带+竖向柱线 ⑩lv3+ 轴前花箱+长凳 ⑪金顶 lv3 #dcaa3e / lv4 #e2ac46 ⑫塔身侧窗 lv3+（lv1-2 仅正面，年代合理）。
 * R3 精修：山门缩体量 w1.5→1.1（檐宽占格 68%→51%，参考约 45%）+ 门扇改暗红缩小 + 下枋上移；殿门缩小暗红 + 额枋；列间院墙外移 x.76 露于殿间；
 *   雁塔台前三级踏步；lv1 广场暖灰 #bdb5a2；水池链前移贴山门（z .56/.27/-.02/-.3）。
 * 实测：bbox 2.56×2.56 · H 1.320/1.320/1.320/1.358 · mesh 19/27/27/30 · tris 4.9k/10.4k/14.4k/14.5k · anim 1/1/1/2 · Canvas ≤128²（LED 128×64）。
 * 材质工艺（对标 tile29_water / prop_21）：贴图材质 color=白 + userData.previewColor 记主色；k=1/per 世界周期烘焙 UV（冒烟核验 |Δuv|/|Δxyz|≈k）；
 *   琉璃金 rg.42/mt.3、鎏金饰 rg.35/mt.7、幕墙 rg.28/mt.55、抹灰 rg.9、水面 rg.18 自着色 previewColor；发光/动画件独立 MF 每实例新建。 */
(function () {
'use strict';
if (typeof THREE === 'undefined') { if (typeof console !== 'undefined') console.error('[modern prop_30] THREE 未定义'); return; }
var PI = Math.PI;
function C(h) { return new THREE.Color(h).convertSRGBToLinear(); }
function lcg(s) { s >>>= 0; return function () { s = (s + 0x6D2B79F5) >>> 0; var x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function TX(c) { var t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
var _t = {};
function tStone(h) { /* 石板广场：板块色差+十字缝+缝沿高光+噪点+风化渍 */
  var k = 's' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1330), x, y, i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 32) for (x = 0; x < S; x += 32) {
    g.fillStyle = R() > 0.5 ? 'rgba(255,252,242,' + (0.04 + R() * 0.08).toFixed(2) + ')' : 'rgba(70,66,58,' + (0.04 + R() * 0.08).toFixed(2) + ')'; g.fillRect(x + 2, y + 2, 28, 28);
    g.fillStyle = 'rgba(60,56,50,0.4)'; g.fillRect(x, y, 32, 2); g.fillRect(x, y, 2, 32);
    g.fillStyle = 'rgba(255,252,246,0.3)'; g.fillRect(x + 2, y + 2, 28, 1); g.fillRect(x + 2, y + 2, 1, 28); }
  for (i = 0; i < 50; i++) { g.fillStyle = R() > 0.5 ? 'rgba(60,56,50,0.14)' : 'rgba(255,252,246,0.26)'; g.fillRect(R() * S, R() * S, 2 + R() * 4, 2); }
  return (_t[k] = TX(c));
}
function tBand(h) { /* 轴线拼花铺装：明暗横条+细缝+中央饰带 */
  var k = 'b' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1342), y, i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) { g.fillStyle = (y / 16) % 2 ? 'rgba(255,255,248,0.2)' : 'rgba(90,84,72,0.14)'; g.fillRect(0, y, S, 16);
    g.fillStyle = 'rgba(70,64,54,0.35)'; g.fillRect(0, y, S, 2); }
  for (i = 0; i < 30; i++) { g.fillStyle = R() > 0.5 ? 'rgba(255,255,246,0.18)' : 'rgba(80,74,62,0.16)'; g.fillRect(R() * S, R() * S, 3 + R() * 6, 2); }
  return (_t[k] = TX(c));
}
function tTile(h, dark) { /* 琉璃瓦/布瓦：竖瓦垄+行缝+垄脊高光+碎屑 */
  var k = 't' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1354), x, y, i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (x = 0; x < S; x += 10) {
    g.fillStyle = dark ? 'rgba(12,14,18,0.42)' : 'rgba(140,88,20,0.38)'; g.fillRect(x + 5, 0, 3, S);
    g.fillStyle = dark ? 'rgba(210,220,232,0.16)' : 'rgba(255,244,208,0.4)'; g.fillRect(x + 1, 0, 2, S);
    g.fillStyle = dark ? 'rgba(6,8,10,0.3)' : 'rgba(120,74,16,0.26)'; g.fillRect(x + 9, 0, 1, S); }
  for (y = 6; y < S; y += 18) { g.fillStyle = dark ? 'rgba(10,12,14,0.4)' : 'rgba(130,80,16,0.3)'; g.fillRect(0, y, S, 2);
    g.fillStyle = dark ? 'rgba(200,210,220,0.1)' : 'rgba(255,248,224,0.2)'; g.fillRect(0, y + 2, S, 1); }
  for (i = 0; i < 26; i++) { g.fillStyle = dark ? (R() > 0.5 ? 'rgba(220,226,234,0.16)' : 'rgba(8,10,12,0.3)') : (R() > 0.5 ? 'rgba(255,250,232,0.34)' : 'rgba(120,76,18,0.26)'); g.fillRect(R() * S, R() * S, 2, 2); }
  return (_t[k] = TX(c));
}
function tBrick(h) { /* 塔身砖：错缝砌层+砖块色差+风化竖渍 */
  var k = 'r' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1366), x, y, i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = (y / 16) % 2 ? 0 : 16; x < S + 16; x += 32) {
    g.fillStyle = R() > 0.5 ? 'rgba(255,244,220,' + (0.04 + R() * 0.1).toFixed(2) + ')' : 'rgba(96,68,34,' + (0.05 + R() * 0.1).toFixed(2) + ')'; g.fillRect(x - 14, y + 2, 28, 12);
    g.fillStyle = 'rgba(90,64,32,0.42)'; g.fillRect(x - 16, y, 32, 2); g.fillRect(x - 16, y, 2, 16);
    g.fillStyle = 'rgba(255,248,230,0.2)'; g.fillRect(x - 14, y + 2, 28, 1); }
  for (i = 0; i < 7; i++) { g.fillStyle = 'rgba(80,58,30,0.07)'; g.fillRect(R() * S, R() * S * 0.5, 3 + R() * 4, 30 + R() * 40); }
  return (_t[k] = TX(c));
}
function tPlas(h) { /* 抹灰墙/路面：噪点+雨渍+斑渍 */
  var k = 'p' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1378), i;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (i = 0; i < 150; i++) { g.fillStyle = R() > 0.5 ? 'rgba(60,52,44,0.13)' : 'rgba(255,255,248,0.15)'; g.fillRect(R() * S, R() * S, 1 + R() * 3, 1 + R() * 2); }
  for (i = 0; i < 6; i++) { g.fillStyle = 'rgba(56,50,42,0.06)'; g.fillRect(R() * S, 0, 1 + R() * 2, 24 + R() * 70); g.fillStyle = 'rgba(56,50,42,0.05)'; g.fillRect(R() * S, R() * S, 12 + R() * 18, 7 + R() * 11); }
  return (_t[k] = TX(c));
}
function tGlass(h) { /* 幕墙：分格暗线+随机亮暗窗格+竖向高光 */
  var k = 'g' + h; if (_t[k]) return _t[k]; var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1382), x, y;
  g.fillStyle = h; g.fillRect(0, 0, S, S);
  for (y = 0; y < S; y += 16) for (x = 0; x < S; x += 16) { g.fillStyle = R() > 0.72 ? 'rgba(255,255,255,0.26)' : R() > 0.45 ? 'rgba(46,58,72,0.2)' : 'rgba(0,0,0,0)'; g.fillRect(x + 2, y + 2, 12, 12); }
  for (x = 0; x < S; x += 16) { g.fillStyle = 'rgba(48,56,66,0.5)'; g.fillRect(x, 0, 2, S); g.fillRect(0, x, S, 2); }
  g.fillStyle = 'rgba(255,255,255,0.14)'; g.fillRect(44, 0, 5, S);
  return (_t[k] = TX(c));
}
function tWater() { /* 灯光秀水面（每实例新建供 offset 漂移）：浅青底+波光长纹+白色碎波 */
  var S = 128, c = cv(S, S), g = c.getContext('2d'), R = lcg(1394), i, j;
  g.fillStyle = '#9adcec'; g.fillRect(0, 0, S, S);
  for (i = 0; i < 8; i++) { g.strokeStyle = 'rgba(255,255,255,0.4)'; g.lineWidth = 2; g.beginPath();
    for (j = 0; j <= 8; j++) { var x = j * 16, y = i * 17 + 6 * Math.sin(j * 1.2 + i); if (j) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); }
  for (i = 0; i < 24; i++) { g.fillStyle = 'rgba(255,255,255,' + (0.2 + R() * 0.3).toFixed(2) + ')'; g.fillRect(R() * S, R() * S, 3 + R() * 6, 1.5); }
  for (i = 0; i < 5; i++) { g.fillStyle = 'rgba(40,120,150,0.16)'; g.fillRect(R() * S, R() * S, 10 + R() * 10, 4 + R() * 5); }
  return TX(c);
}
function texLED() { /* 灯光秀大屏（每实例新建）：品红/紫/青渐变+扫描线+高亮字幕条 */
  var c = cv(128, 64), g = c.getContext('2d'), gr = g.createLinearGradient(0, 0, 128, 64), i;
  gr.addColorStop(0, '#ff4e9b'); gr.addColorStop(0.5, '#7a4ee8'); gr.addColorStop(1, '#3fc6ff');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 64);
  for (i = 0; i < 64; i += 4) { g.fillStyle = 'rgba(0,0,30,0.12)'; g.fillRect(0, i, 128, 1); }
  g.fillStyle = 'rgba(255,255,255,0.5)'; g.fillRect(10, 14, 34, 8); g.fillRect(58, 36, 46, 8);
  return TX(c);
}
function tPlq() { /* 「大唐不夜城」鎏金匾：黑底金字金框 */
  if (_t.q) return _t.q; var c = cv(128, 32), g = c.getContext('2d');
  g.fillStyle = '#1c1814'; g.fillRect(0, 0, 128, 32);
  g.strokeStyle = '#d8b25c'; g.lineWidth = 3; g.strokeRect(2, 2, 124, 28);
  g.fillStyle = '#f2d488'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = 'bold 20px "Microsoft YaHei",serif'; g.fillText('大唐不夜城', 64, 17);
  return (_t.q = TX(c));
}
/* ---- 材质：M 静态缓存（map→color 白+previewColor+userData.k=1/per 世界周期）；MF 发光/动画每实例新建 ---- */
var _mc = {};
function M(h, o) {
  o = o || {}; var k = h + '|' + o.rg + '|' + o.mt + '|' + (o.map ? o.map.uuid : '') + '|' + (o.per || '');
  if (_mc[k]) return _mc[k];
  var m = new THREE.MeshStandardMaterial({ color: C(o.map ? '#ffffff' : h), roughness: o.rg !== undefined ? o.rg : 0.88, metalness: o.mt || 0, flatShading: true });
  if (o.map) { m.map = o.map; m.userData.previewColor = h; if (o.per) m.userData.k = 1 / o.per; }
  return (_mc[k] = m);
}
function MF(h, o) {
  o = o || {}; var m = new THREE.MeshStandardMaterial({ color: C(o.map ? '#ffffff' : h), roughness: o.rg !== undefined ? o.rg : 0.7, metalness: o.mt || 0, flatShading: true });
  if (o.em) { m.emissive = C(o.em); m.emissiveIntensity = o.ei || 0.4; }
  if (o.map) { m.map = o.map; m.userData.previewColor = o.pc || h; if (o.per) m.userData.k = 1 / o.per; }
  return m;
}
/* ---- 手写合并构建器：同材质几何收集 → 单一 BufferGeometry/Mesh；W=boxUV 世界周期烘焙；FG=平面多边形（庑殿坡面）世界 UV ---- */
var BK;
function xf(g, x, y, z, rx, ry, rz, sx, sy, sz) { g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1))); return g; }
function put(m, g) { var b = BK[m.uuid] || (BK[m.uuid] = { m: m, gs: [] }); b.gs.push(g); }
function B(m, w, h, d, x, y, z, rx, ry, rz) { put(m, xf(new THREE.BoxGeometry(w, h, d), x, y, z, rx, ry, rz)); }
function W(m, w, h, d, x, y, z, rx, ry, rz) { /* boxUV 世界周期（六面 ±x,±y,±z） */
  var per = m.userData.k ? 1 / m.userData.k : 0.5, g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv, F = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]], f, v, i;
  for (f = 0; f < 6; f++) for (v = 0; v < 4; v++) { i = f * 4 + v; uv.setXY(i, uv.getX(i) * F[f][0] / per, uv.getY(i) * F[f][1] / per); }
  put(m, xf(g, x, y, z, rx, ry, rz));
}
function Y(m, r1, r2, h, s, x, y, z, rx, ry, rz) { put(m, xf(new THREE.CylinderGeometry(r1, r2, h, s), x, y, z, rx, ry, rz)); }
function O(m, r, x, y, z, sx, sy, sz) { put(m, xf(new THREE.IcosahedronGeometry(r, 1), x, y, z, 0, 0, 0, sx || 1, sy || 1, sz || 1)); }
function FG(m, pts, x, y, z) { /* 平面多边形（CCW 外视）→ 三角扇，UV 沿面内正交基按世界周期 */
  var P = [], i, n = pts.length, per = m.userData.k ? 1 / m.userData.k : 0.5, kk = 1 / per, pos = [], nor = [], uv = [];
  for (i = 0; i < n; i++) P.push([pts[i][0] + (x || 0), pts[i][1] + (y || 0), pts[i][2] + (z || 0)]);
  function tri(a, b, c) {
    var e1x = b[0] - a[0], e1y = b[1] - a[1], e1z = b[2] - a[2], e2x = c[0] - a[0], e2y = c[1] - a[1], e2z = c[2] - a[2];
    var nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x, nl = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
    nx /= nl; ny /= nl; nz /= nl;
    var l1 = Math.sqrt(e1x * e1x + e1y * e1y + e1z * e1z) || 1, ux = e1x / l1, uy = e1y / l1, uz = e1z / l1;
    var wx = ny * uz - nz * uy, wy = nz * ux - nx * uz, wz = nx * uy - ny * ux, q = [a, b, c], j;
    for (j = 0; j < 3; j++) { pos.push(q[j][0], q[j][1], q[j][2]); nor.push(nx, ny, nz);
      var dx = q[j][0] - a[0], dy = q[j][1] - a[1], dz = q[j][2] - a[2];
      uv.push((dx * ux + dy * uy + dz * uz) * kk, (dx * wx + dy * wy + dz * wz) * kk); }
  }
  for (i = 1; i < n - 1; i++) tri(P[0], P[i], P[i + 1]);
  var g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(nor), 3));
  g.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
  put(m, g);
}
function HIPR(A, kind, x, y, z, w, d, hR, ov, o) { /* 庑殿顶：四坡面片 + 檐底封板 + 封檐板 + 正脊鸱吻 + 角部翘起 */
  o = o || {};
  var rm = kind === 'g' ? A.gold : kind === 'p' ? A.peave : A.darkR, km = o.rk || (kind === 'g' ? A.trim : A.ridg), dm = A.eave;
  var EW = w + 2 * ov, ED = d + 2 * ov, rl = Math.max(0.04, (w - d) / 2 + 0.02);
  var c = [[-EW / 2, 0, ED / 2], [EW / 2, 0, ED / 2], [EW / 2, 0, -ED / 2], [-EW / 2, 0, -ED / 2]], r0 = [-rl, hR, 0], r1 = [rl, hR, 0];
  FG(rm, [c[0], c[1], r1, r0], x, y, z); FG(rm, [c[2], c[3], r0, r1], x, y, z);
  FG(rm, [c[1], c[2], r1], x, y, z); FG(rm, [c[3], c[0], r0], x, y, z);
  if (o.sof !== 0) B(dm, EW - 0.02, 0.012, ED - 0.02, x, y - 0.006, z);
  if (o.fas) { W(dm, EW, 0.018, 0.018, x, y + 0.002, z + ED / 2 - 0.008); W(dm, EW, 0.018, 0.018, x, y + 0.002, z - ED / 2 + 0.008);
    W(dm, 0.018, 0.018, ED - 0.036, x + EW / 2 - 0.008, y + 0.002, z); W(dm, 0.018, 0.018, ED - 0.036, x - EW / 2 + 0.008, y + 0.002, z); }
  if (o.orn) { B(km, rl * 2 + 0.05, 0.016, 0.026, x, y + hR + 0.004, z);
    B(km, 0.02, 0.038, 0.024, x - rl - 0.008, y + hR + 0.028, z); B(km, 0.02, 0.038, 0.024, x + rl + 0.008, y + hR + 0.028, z); }
  if (o.hook) for (var hx = -1; hx <= 1; hx += 2) for (var hz = -1; hz <= 1; hz += 2)
    B(km, 0.05, 0.009, 0.02, x + hx * (EW / 2 - 0.028), y + 0.014, z + hz * (ED / 2 - 0.02), 0, 0, -hx * 0.55);
}
function house(A, x, z, w, d, h, ch) { /* 1990s 灰瓦民居：体量+庑殿灰顶+檐底封板+门+窗 */
  var eY = 0.062 + h;
  W(A.grey, w, h, d, x, 0.062 + h / 2, z);
  HIPR(A, 'd', x, eY, z, w, d, Math.min(0.075, d * 0.42), 0.04, {});
  B(A.door, w * 0.28, h * 0.5, 0.014, x - w * 0.18, 0.062 + h * 0.26, z + d / 2 + 0.008);
  B(A.door, w * 0.2, h * 0.34, 0.014, x + w * 0.2, 0.062 + h * 0.4, z + d / 2 + 0.008);
  if (ch) B(A.grey, 0.035, 0.05, 0.035, x + w * 0.24, eY + 0.045, z - d * 0.18);
}
function flush(g) {
  for (var k in BK) {
    var b = BK[k], gs = b.gs, P = 0, i;
    for (i = 0; i < gs.length; i++) { if (gs[i].index) gs[i] = gs[i].toNonIndexed(); P += gs[i].attributes.position.array.length; }
    var pa = new Float32Array(P), na = new Float32Array(P), ua = new Float32Array(P / 3 * 2), o = 0;
    for (i = 0; i < gs.length; i++) { pa.set(gs[i].attributes.position.array, o); na.set(gs[i].attributes.normal.array, o); if (gs[i].attributes.uv) ua.set(gs[i].attributes.uv.array, o / 3 * 2); o += gs[i].attributes.position.array.length; }
    var geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pa, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(na, 3)); geo.setAttribute('uv', new THREE.BufferAttribute(ua, 2));
    var ms = new THREE.Mesh(geo, b.m); ms.castShadow = ms.receiveShadow = true; g.add(ms);
  }
}
function build(L) {
  var g = new THREE.Group(); g.name = 'prop_30_lv' + L;
  g.userData = { kind: 'property', propIdx: 30, level: L, anim: [] };
  BK = {}; var i, s, c, gz = 0.92;
  var goldHex = L >= 4 ? '#e2ac46' : L === 3 ? '#dcaa3e' : '#cfa04a';
  var A = {
    plaza: M(L === 1 ? '#bdb5a2' : '#c6bfae', { map: tStone(L === 1 ? '#bdb5a2' : '#c6bfae'), rg: 0.92, per: 0.85 }),
    axis: M('#d9d3c3', { map: tBand('#d9d3c3'), rg: 0.9, per: 0.55 }),
    road: M('#83878d', { map: tPlas('#83878d'), rg: 0.95, per: 0.8 }),
    curb: M('#d8d2c4', { rg: 0.85 }), stoneW: M('#e2dccc', { rg: 0.72 }),
    stone: M('#cdc6b6', { map: tStone('#cdc6b6'), rg: 0.9, per: 0.5 }),
    red: M(L >= 2 ? '#a63a28' : '#9a5140', { map: tPlas(L >= 2 ? '#a63a28' : '#9a5140'), rg: 0.9, per: 0.9 }),
    redP: M('#a03426', { rg: 0.55, mt: 0.08 }),
    grey: M('#c9c3b4', { map: tPlas('#c9c3b4'), rg: 0.92, per: 0.9 }),
    gold: (L >= 4 ? MF : M)(goldHex, { map: tTile(goldHex, 0), rg: 0.42, mt: 0.3, em: '#ffbe50', ei: 0.22, per: 0.34 }),
    darkR: M('#4a4e54', { map: tTile('#4a4e54', 1), rg: 0.8, per: 0.34 }),
    brick: M('#c8a878', { map: tBrick('#c8a878'), rg: 0.9, per: 0.6 }),
    trim: M('#c9a030', { rg: 0.35, mt: 0.7 }), ridg: M('#3e4148', { rg: 0.8 }), eave: M('#63382a', { rg: 0.85 }), peave: M('#665845', { rg: 0.82 }),
    glass: M('#b0bdc9', { map: tGlass('#b0bdc9'), rg: 0.28, mt: 0.55, per: 0.45 }),
    glass2: M('#9dadb9', { map: tGlass('#9dadb9'), rg: 0.3, mt: 0.5, per: 0.5 }),
    door: M('#33261c', { rg: 0.85 }), doorR: M('#5a2a1e', { rg: 0.8 }), dirt: M('#b39c74', { map: tPlas('#b39c74'), rg: 0.95, per: 0.7 }),
    green: M('#6d8a46', { map: tPlas('#6d8a46'), rg: 0.95, per: 0.6 }),
    trunk: M('#5f4a34', { rg: 0.9 }), leaf: M('#5e7c3c', { rg: 0.95 }), leaf2: M('#75924b', { rg: 0.95 }),
    steel: M('#62666c', { rg: 0.5, mt: 0.55 }),
    win: MF('#6a5a44', { em: '#ffd27a', ei: [0.05, 0.12, 0.22, 0.55][L - 1], rg: 0.35, mt: 0.2 }),
    lan: L >= 3 ? MF('#c23222', { em: '#ff5a3a', ei: 0.4, rg: 0.5 }) : null,
    led: L >= 4 ? MF('#ffffff', { map: texLED(), em: '#ff5fa8', ei: 0.7, rg: 0.35 }) : null,
    wat: L >= 4 ? MF('#ffffff', { map: tWater(), rg: 0.18, mt: 0.1, em: '#9fe8ff', ei: 0.75, pc: '#8fd8e8' }) : null,
    glow: L >= 4 ? MF('#ffdca8', { em: '#ffb860', ei: 0.45 }) : null
  };
  var cour = L === 1 ? A.grey : A.red, courCap = L === 1 ? A.darkR : A.gold;
  function palace(x, z, w, d, hb, o) { /* 唐风殿：双层石台基+红墙+檐柱/壁柱+门+暖窗带+(lv3 重檐)+金庑殿+正脊鸱吻翘角+灯笼/LED/店暖光 */
    var py = 0.12, eY = py + hb, j;
    W(A.stone, w + 0.18, 0.06, d + 0.18, x, 0.09, z);
    W(A.stoneW, w + 0.24, 0.018, d + 0.24, x, 0.129, z);
    W(A.red, w, hb, d, x, py + hb / 2, z);
    var nc = o.cols ? 4 : 2;
    for (j = 0; j < nc; j++) { var cx = x + (nc === 4 ? (j - 1.5) * (w - 0.12) / 3 : (j ? 1 : -1) * w * 0.28);
      if (o.cols) Y(A.redP, 0.013, 0.015, hb - 0.03, 12, cx, py + (hb - 0.03) / 2, z + d / 2 + 0.02);
      else B(A.redP, 0.03, hb - 0.03, 0.03, cx, py + (hb - 0.03) / 2, z + d / 2 + 0.012); }
    B((L >= 4 && o.led) ? A.win : A.doorR, w * 0.42, hb * 0.46, 0.018, x, py + hb * 0.24, z + d / 2 + 0.012);
    B(A.redP, w + 0.02, 0.028, 0.03, x, eY - 0.015, z + d / 2 + 0.02);
    B(A.win, w * 0.78, hb * 0.24, 0.014, x, eY - hb * 0.16, z + d / 2 + 0.011);
    if (o.dbl && L >= 3) HIPR(A, 'g', x, eY - hb * 0.4, z, w + 0.12, d + 0.12, 0.045, 0.06, { fas: 1 });
    HIPR(A, 'g', x, eY, z, w, d, Math.min(0.19, d * 0.5), w > 0.34 ? 0.085 : 0.06, { fas: 1, orn: 1, hook: w > 0.34 ? 1 : 0 });
    if (o.lan && L >= 3) for (j = -1; j <= 1; j += 2) { B(A.trim, 0.012, 0.02, 0.012, x + j * w * 0.3, eY - 0.03, z + d / 2 + 0.05); O(A.lan, 0.028, x + j * w * 0.3, eY - 0.07, z + d / 2 + 0.05); }
    if (o.led && L >= 4) { B(A.led, 0.3, 0.17, 0.016, x, py + hb * 0.52, z + d / 2 + 0.02); if (w > 0.34) B(A.glow, w * 0.7, 0.05, 0.012, x, py + 0.05, z + d / 2 + 0.014); }
  }
  /* ---- 地面：石板广场+轴线拼花+三向道路+路缘+斑马线 / lv1 素土空地 ---- */
  W(A.plaza, 2.56, 0.06, 2.56, 0, 0.03, 0);
  W(A.axis, 0.5, 0.012, 1.64, 0, 0.066, 0.3);
  W(A.road, 2.56, 0.012, 0.16, 0, 0.066, 1.2);
  W(A.road, 0.16, 0.012, 2.4, -1.2, 0.066, -0.08); W(A.road, 0.16, 0.012, 2.4, 1.2, 0.066, -0.08);
  W(A.curb, 2.22, 0.014, 0.02, 0, 0.067, 1.105); W(A.curb, 0.02, 0.014, 2.4, -1.105, 0.067, -0.08); W(A.curb, 0.02, 0.014, 2.4, 1.105, 0.067, -0.08);
  if (L >= 2) for (i = 0; i < 4; i++) B(A.stoneW, 0.06, 0.013, 0.13, -0.45 + i * 0.3, 0.0725, 1.2);
  if (L === 1) { W(A.dirt, 0.42, 0.012, 0.3, 0.66, 0.072, 0.05); W(A.dirt, 0.34, 0.012, 0.28, -0.68, 0.072, -0.57); W(A.dirt, 0.3, 0.012, 0.24, 0.95, 0.072, -0.13); house(A, 0.98, 0.78, 0.18, 0.16, 0.1, 1); house(A, -0.98, 0.78, 0.18, 0.16, 0.1, 0); }
  /* ---- 山门：台基+4 柱 3 间+双层横枋+黑/金庑殿顶+门垛+鎏金匾+lv3 灯笼 ---- */
  W(A.stone, 1.3, 0.05, 0.44, 0, 0.085, gz);
  var gcx = [-0.46, -0.155, 0.155, 0.46];
  for (i = 0; i < 4; i++) Y(A.redP, 0.02, 0.024, 0.44, 12, gcx[i], 0.33, gz);
  B(A.redP, 1.06, 0.06, 0.18, 0, 0.545, gz); B(A.redP, 1.06, 0.04, 0.16, 0, 0.41, gz);
  B(A.doorR, 0.2, 0.26, 0.02, -0.31, 0.24, gz + 0.09); B(A.doorR, 0.22, 0.28, 0.02, 0, 0.25, gz + 0.09); B(A.doorR, 0.2, 0.26, 0.02, 0.31, 0.24, gz + 0.09);
  HIPR(A, L >= 4 ? 'g' : 'd', 0, 0.575, gz, 1.1, 0.34, 0.15, 0.1, { fas: 1, orn: 1, hook: 1, rk: A.ridg });
  if (L >= 2) { var pq = L >= 4 ? MF('#f2d488', { map: tPlq(), em: '#ffd88a', ei: 0.55, rg: 0.5 }) : M('#f2d488', { map: tPlq(), rg: 0.5 });
    B(pq, 0.26, 0.07, 0.014, 0, 0.47, gz + 0.09); }
  for (s = -1; s <= 1; s += 2) { W(cour, 0.3, 0.2, 0.14, s * 0.78, 0.165, gz); W(courCap, 0.34, 0.016, 0.18, s * 0.78, 0.273, gz);
    if (L >= 4) B(A.led, 0.18, 0.1, 0.014, s * 0.78, 0.19, gz + 0.08); }
  if (L >= 3) for (s = -1; s <= 1; s += 2) { B(A.trim, 0.012, 0.02, 0.012, s * 0.3, 0.5, 1.02); O(A.lan, 0.03, s * 0.3, 0.46, 1.02); }
  /* ---- 两翼院落 3 排×2 列：lv 阈值前为灰瓦民居群，建成后为唐风金顶殿；院墙连通 ---- */
  var cells = [
    { x: 0.52, z: 0.44, w: 0.42, d: 0.28, hb: 0.26, lv: 2, dbl: 1, led: 1, cols: 1 },
    { x: 0.92, z: 0.44, w: 0.26, d: 0.24, hb: 0.2, lv: 3 },
    { x: 0.52, z: -0.02, w: 0.5, d: 0.36, hb: 0.34, lv: 2, dbl: 1, led: 1, cols: 1, lan: 1 },
    { x: 0.92, z: -0.02, w: 0.24, d: 0.3, hb: 0.22, lv: 3 },
    { x: 0.52, z: -0.55, w: 0.36, d: 0.26, hb: 0.24, lv: 3, cols: 1, led: 1 },
    { x: 0.92, z: -0.55, w: 0.26, d: 0.24, hb: 0.2, lv: 3 }
  ];
  for (s = -1; s <= 1; s += 2) {
    for (c = 0; c < cells.length; c++) {
      var ce = cells[c], lv = ce.lv === 2 && ce.z < 0 && s < 0 ? 3 : ce.lv; /* 2000s 仅东侧先建主殿 */
      if (L >= lv) palace(s * ce.x, ce.z, ce.w, ce.d, ce.hb, ce);
      else { var h0 = 0.12 + (c % 2) * 0.025;
        house(A, s * ce.x - ce.w * 0.28, ce.z, ce.w * 0.3, ce.d * 0.85, h0, c === 1);
        house(A, s * ce.x + ce.w * 0.05, ce.z + (c % 2 ? 0.02 : -0.02), ce.w * 0.32, ce.d * 0.8, h0 - 0.02, 0);
        house(A, s * ce.x + ce.w * 0.34, ce.z, ce.w * 0.26, ce.d * 0.85, h0 - 0.01, 0); }
    }
    if (L >= 2) { /* 院墙+金瓦压顶：排间+列间 */
      W(cour, 0.3, 0.1, 0.04, s * 0.72, 0.17, 0.21); W(courCap, 0.34, 0.015, 0.08, s * 0.72, 0.228, 0.21);
      W(cour, 0.3, 0.1, 0.04, s * 0.72, 0.17, -0.285); W(courCap, 0.34, 0.015, 0.08, s * 0.72, 0.228, -0.285);
      W(cour, 0.04, 0.1, 0.24, s * 0.76, 0.17, 0.47); W(courCap, 0.08, 0.015, 0.28, s * 0.76, 0.228, 0.47);
    } else { W(cour, 0.3, 0.09, 0.04, s * 0.72, 0.165, 0.21); W(cour, 0.3, 0.09, 0.04, s * 0.72, 0.165, -0.285); W(cour, 0.04, 0.09, 0.24, s * 0.76, 0.165, 0.47); }
  }
  /* ---- 大雁塔：双层台院+围廊墙（前门垛留口）+七层收分+层檐+拱窗+攒尖顶+塔刹（H≈1.32 带内） ---- */
  W(A.stone, 0.84, 0.07, 0.84, 0, 0.095, -0.85);
  W(A.stone, 0.68, 0.05, 0.68, 0, 0.155, -0.85);
  W(cour, 0.05, 0.1, 0.78, -0.405, 0.23, -0.85); W(cour, 0.05, 0.1, 0.78, 0.405, 0.23, -0.85);
  W(cour, 0.86, 0.1, 0.05, 0, 0.23, -1.235);
  W(cour, 0.16, 0.1, 0.05, -0.32, 0.23, -0.44); W(cour, 0.16, 0.1, 0.05, 0.32, 0.23, -0.44);
  W(courCap, 0.09, 0.016, 0.82, -0.405, 0.288, -0.85); W(courCap, 0.09, 0.016, 0.82, 0.405, 0.288, -0.85);
  W(courCap, 0.9, 0.016, 0.09, 0, 0.288, -1.235); W(courCap, 0.2, 0.016, 0.09, -0.32, 0.288, -0.44); W(courCap, 0.2, 0.016, 0.09, 0.32, 0.288, -0.44);
  for (i = 0; i < 3; i++) W(A.stone, 0.26 - i * 0.02, 0.03, 0.05, 0, 0.075 + i * 0.03, -0.405 + i * 0.05);
  var tw = 0.44, ty = 0.18;
  for (i = 0; i < 7; i++) {
    W(A.brick, tw, 0.1, tw, 0, ty + 0.05, -0.85);
    B(A.door, tw * 0.24, 0.058, 0.016, 0, ty + 0.05, -0.85 + tw / 2 + 0.008);
    if (L >= 3) { B(A.door, 0.016, 0.058, tw * 0.24, -tw / 2 - 0.008, ty + 0.05, -0.85); B(A.door, 0.016, 0.058, tw * 0.24, tw / 2 + 0.008, ty + 0.05, -0.85); }
    HIPR(A, 'p', 0, ty + 0.1, -0.85, tw, tw, 0.026, 0.045, { sof: 0 });
    ty += 0.125; tw *= 0.9;
  }
  HIPR(A, 'p', 0, ty, -0.85, tw, tw, 0.09, 0.035, { sof: 0 });
  Y(A.trim, 0.008, 0.013, 0.15, 12, 0, ty + 0.16, -0.85);
  O(A.trim, 0.02, 0, ty + 0.245, -0.85);
  if (L >= 4) { O(A.trim, 0.015, 0, ty + 0.272, -0.85); O(A.win, 0.011, 0, ty + 0.292, -0.85); }
  if (L >= 2) for (s = -1; s <= 1; s += 2) { /* 台院角亭 lv2+ */
    W(A.red, 0.14, 0.16, 0.14, s * 0.3, 0.26, -1.06); B(A.door, 0.08, 0.09, 0.014, s * 0.3, 0.21, -0.984);
    HIPR(A, 'd', s * 0.3, 0.34, -1.06, 0.14, 0.14, 0.05, 0.04, { sof: 0 }); Y(A.trim, 0.006, 0.009, 0.05, 12, s * 0.3, 0.415, -1.06); }
  /* ---- 背景玻璃高楼：后缘两翼不遮塔，lv2 两栋→lv3 四栋→lv4 加高+亮窗带+屋顶机房设备 ---- */
  var twr = [[-0.95, 0.58, 0.26], [-0.6, 0.76, 0.2], [0.6, 0.54, 0.2], [0.95, 0.8, 0.26]], tn = L === 1 ? 0 : L === 2 ? 2 : 4;
  for (i = 0; i < tn; i++) { var T = twr[i], tH = T[1] + (L >= 4 ? 0.04 : 0);
    W(i % 2 ? A.glass : A.glass2, T[2], tH, 0.2, T[0], 0.1 + tH / 2, -1.14);
    W(A.stone, T[2] + 0.06, 0.04, 0.26, T[0], 0.08, -1.14);
    B(A.ridg, T[2] * 0.44, 0.045, 0.1, T[0], 0.1 + tH + 0.023, -1.14);
    if (L >= 3) { B(A.steel, T[2] * 0.22, 0.02, 0.06, T[0] - T[2] * 0.18, 0.1 + tH + 0.01, -1.1); W(A.ridg, T[2] + 0.02, 0.016, 0.22, T[0], 0.1 + tH + 0.008, -1.14);
      B(A.ridg, 0.014, tH, 0.014, T[0] - T[2] / 2 + 0.008, 0.1 + tH / 2, -1.048); B(A.ridg, 0.014, tH, 0.014, T[0] + T[2] / 2 - 0.008, 0.1 + tH / 2, -1.048); }
    if (L >= 4) { B(A.win, T[2] * 0.8, 0.028, 0.014, T[0], 0.1 + tH * 0.45, -1.036); B(A.win, T[2] * 0.8, 0.028, 0.014, T[0], 0.1 + tH * 0.75, -1.036); }
  }
  /* ---- 三级树列（三团簇冠）：沿前街 / 两翼侧缘 / lv2+ 轴线树阵 / 雁塔双树 ---- */
  function tree(x, z, r, n2) {
    Y(A.trunk, r * 0.1, r * 0.15, r * 2.3, 12, x, 0.06 + r * 1.15, z);
    O(A.leaf, r, x, 0.06 + r * 2.55, z, 1, 0.88, 1);
    if (n2) { O(A.leaf2, r * 0.6, x + r * 0.55, 0.06 + r * 2.9, z + r * 0.25); O(A.leaf, r * 0.52, x - r * 0.5, 0.06 + r * 2.75, z - r * 0.3); }
  }
  var trF = [-1.06, -0.71, -0.355, 0, 0.355, 0.71, 1.06];
  for (i = 0; i < 7; i++) { if (i > 1 && i < 5) continue; if (L === 1 && (i === 1 || i === 5)) continue; tree(trF[i], 1.14, 0.095, 1); }
  var trS = [0.72, 0.24, -0.28, -0.82];
  for (s = -1; s <= 1; s += 2) for (i = 0; i < 4; i++) { if (L === 1 && i % 2) continue; tree(s * 1.16, trS[i], 0.08, L >= 2 ? 1 : 0); }
  if (L >= 2) for (s = -1; s <= 1; s += 2) for (i = 0; i < 5; i++) tree(s * 0.3, 0.72 - i * 0.29, 0.07, L >= 3 ? 1 : 0);
  tree(-0.46, -0.9, 0.1, 1); tree(0.46, -0.9, 0.1, 1);
  /* ---- 轴线：lv2-3 绿带花坛+灌木 → lv4 灯光秀水池链（白沿石+发光水面+双喷泉）；lv2+ 路灯 ---- */
  if (L >= 2 && L <= 3) for (s = -1; s <= 1; s += 2) {
    W(A.green, 0.12, 0.032, 1.56, s * 0.27, 0.078, 0.28);
    for (i = 0; i < 4; i++) O(A.leaf2, 0.04, s * 0.27, 0.115, 0.72 - i * 0.3);
  }
  if (L >= 4) { var pz = [0.56, 0.27, -0.02, -0.3];
    for (i = 0; i < 4; i++) { W(A.stoneW, 0.42, 0.045, 0.28, 0, 0.084, pz[i]); W(A.wat, 0.36, 0.02, 0.22, 0, 0.1, pz[i]);
      if (i === 1 || i === 2) for (s = -1; s <= 1; s += 2) Y(A.wat, 0.004, 0.008, 0.12, 12, s * 0.08, 0.16, pz[i]); } }
  if (L >= 3) for (s = -1; s <= 1; s += 2) { W(A.green, 0.14, 0.03, 0.09, s * 0.31, 0.078, 0.88); O(A.leaf2, 0.032, s * 0.31, 0.108, 0.88);
    B(A.eave, 0.16, 0.018, 0.05, s * 0.31, 0.1, 1.0); B(A.eave, 0.02, 0.05, 0.05, s * 0.31 - 0.06, 0.075, 1.0); B(A.eave, 0.02, 0.05, 0.05, s * 0.31 + 0.06, 0.075, 1.0); }
  if (L >= 2) for (s = -1; s <= 1; s += 2) { Y(A.steel, 0.008, 0.012, 0.34, 12, s * 0.98, 0.23, 1.08);
    B(A.win, 0.04, 0.022, 0.04, s * 0.98, 0.415, 1.08); B(A.steel, 0.05, 0.01, 0.05, s * 0.98, 0.432, 1.08); }
  flush(g);
  var win = A.win, gold = A.gold, ei0 = win.emissiveIntensity;
  g.userData.anim.push(function (t) { /* 窗暖光/金顶泛光/灯笼呼吸 */
    win.emissiveIntensity = ei0 * (0.75 + 0.25 * Math.sin(t * 1.2));
    if (gold.emissive && gold.emissive.r + gold.emissive.g + gold.emissive.b > 0.01) gold.emissiveIntensity = 0.18 + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.9));
    if (A.lan) A.lan.emissiveIntensity = 0.32 + 0.18 * (0.5 + 0.5 * Math.sin(t * 1.5));
  });
  if (L >= 4) { var wt = A.wat, led = A.led, glo = A.glow, wtx = wt.map;
    g.userData.anim.push(function (t) { /* 水面漂移+发光 / LED 脉冲 */
      wt.emissiveIntensity = 0.7 + 0.28 * (0.5 + 0.5 * Math.sin(t * 1.7)); wtx.offset.set((t * 0.02) % 1, (t * 0.014) % 1);
      led.emissiveIntensity = 0.55 + 0.3 * (0.5 + 0.5 * Math.sin(t * 0.8));
      if (glo) glo.emissiveIntensity = 0.35 + 0.15 * (0.5 + 0.5 * Math.sin(t * 1.1)); });
  }
  return g;
}
window.Props3DModern = window.Props3DModern || {};
window.Props3DModern[30] = function (level) { return build(Math.max(1, Math.min(4, level | 0 || 1))); };
})();
