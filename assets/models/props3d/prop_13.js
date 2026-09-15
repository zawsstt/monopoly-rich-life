/* =====================================================================================
 * 大富翁 · 富贵人生 —— props3d/prop_13.js（v2 精修版）
 * -------------------------------------------------------------------------------------
 * 格 13「北京路」(g3 岭南骑楼) 独属建筑：广州骑楼四阶生长史
 * 视觉基准：refs/prop_13.png（四阶一体参考图，唯一视觉真源）。
 *
 * —— v1 → v2 精修摘要（对照参考图逐项清偿；整体轮廓/配色/布局/朝向契约不变） ————
 *   1) 拱券石分环：Shape+absarc 挤出拱洞外，新增半环 voussoir 扇环（放射砖缝 Canvas，
 *      UV=形状坐标 clamp 映射）+ 凸出楔心石 keystone + 春线 impost 石带（lv2-4）。
 *   2) 奶油灰泥阴阳面分档：front 亮/side 暗保留；新增层间束腰阴影带（stuccoShade）+
 *      转角隅石改长短皮交替咬合（alternating quoins ×4 块/角）+ 窗间壁柱（lv3-4）。
 *   3) 彩色百叶窗百叶逐片：百叶由贴图平面改为实体百叶（背板 + 逐片斜置板条 n 片），
 *      窗改拱顶（半圆玻璃 + 拱框环），花箱改陶箱 + 花球 + 叶球；lv4 逐层板条数递减控预算。
 *   4) 红白条纹挑棚垂边波浪：挑棚布改逐幅分档（红白实体幅条交替，取消贴图条纹），
 *      垂边改逐幅半圆瓦楞波浪（scallop 半管），+ 挂杆 + 端斜撑 + 侧垂片；垂边整体摇曳。
 *   5) 绿琉璃攒尖金冠宝顶：宝顶改四件套（琉璃座 + 金球 + 金环 + 金尖 + 顶珠），四角
 *      翘角 + 金珠保留；lv4 山花前移（参考图白山花盾徽浮雕：rim + 圆盾 + 饰带）。
 *   6) 竖招字体与托架：招牌整板 Canvas 256×512 重绘（金字描边 + 双线金边 + 印章），
 *      托架改铁艺挑臂 + 浴卷垫环 + 顶环，保留摇曳。
 *   7) 铸铁路灯灯罩：灯头改玻璃灯罩（暖光玻璃 + 四根铁棂 + 灯盘 + 锥顶 + 金顶珠）。
 *   8) 其余：lv1 加坡檐滚瓦 + 木百叶小窗 + 第二盏灯笼 + 货担果堆加密；lv2 加铸铁路灯
 *      + 木瓶栏阳台 + 荷兰山墙顶盖瓦球 + 阁楼窗；lv3 加屋顶平座石瓶栏 + 陶罐；陶柱础
 *      苔绿浸带；圆柱 ≥12 段 / 球 16×12；纹理上限放宽（实际 64–512px）。
 *
 * 风格族谱（同一块地的同一种生长 —— 参考图从左到右四栋即四阶，形态不变）：
 *   lv1 小屋   木板市集棚屋 + 暖棕瓦坡顶 + 奶油帆布挑棚 + 果摊货担 + 红灯笼（h≈1.06）
 *   lv2 洋房   两层小楼：双拱骑楼廊 + 绿帆布挑棚 + 百叶窗 + 荷兰弧山墙瓦顶 + 木瓶栏
 *   lv3 大厦   三层骑楼：三拱连廊 + 红白条纹挑棚 + 百叶窗×6 + 弧形巴洛克山花 + 平座
 *              + 竖招「北京路」+ 铸铁路灯
 *   lv4 地标   四层骑楼总会：四拱连廊 + 红挑棚 + 百叶窗×12 + 平座石瓶栏 + 白山花盾徽
 *              + 绿琉璃攒尖翘檐金冠宝顶 + 横匾
 *
 * 经典 script（无 import/export），THREE r147 全局；挂载：
 *   window.Props3D = window.Props3D || {}; window.Props3D[13] = function (level) {...};
 * 约定：1 格 = 3 世界单位；占地 ≤2.6×2.6；原点=格心、底面贴 y=0；正面朝 +Z。
 * 材质全部 MeshStandardMaterial + convertSRGBToLinear；纹理全部 Canvas 程序化（≤512px）。
 * 预算：每级 mesh ≤350；userData.anim = [fn(t, dt)]（旋转 ≤0.3rad、emissive 波动 ≤0.25）。
 * ==================================================================================== */
(function () {
'use strict';

if (typeof THREE === 'undefined') {
  if (typeof console !== 'undefined') console.error('[prop_13] THREE 未定义，请先加载 three.min.js (r147)');
  return;
}

/* ================= 0. 颜色 / 材质基元（std: sRGB→Linear，同 buildings3d） ================= */
var PI = Math.PI, sin = Math.sin, cos = Math.cos;
function C(hex) { return new THREE.Color(hex).convertSRGBToLinear(); }
function std(hex, o) {
  o = o || {};
  var m = new THREE.MeshStandardMaterial({
    color: C(hex), roughness: (o.rough !== undefined ? o.rough : 0.85), metalness: (o.metal || 0),
    flatShading: (o.flat !== undefined ? o.flat : true)
  });
  if (o.emissive) { m.emissive = C(o.emissive); m.emissiveIntensity = (o.ei !== undefined ? o.ei : 0.5); }
  if (o.map) m.map = o.map;
  if (o.bump) { m.bumpMap = o.bump; m.bumpScale = (o.bumpScale !== undefined ? o.bumpScale : 0.012); }
  return m;
}
/* 材质缓存（同进程复用；view3d.disposeGroup 只释放 geometry，不释放材质） */
var _mc = {};
function MAT(id, make) { if (!_mc[id]) _mc[id] = make(); return _mc[id]; }

function mesh(geo, mat) { var o = new THREE.Mesh(geo, mat); o.castShadow = true; o.receiveShadow = true; return o; }
function box(w, h, d, mat, x, y, z) { var o = mesh(new THREE.BoxGeometry(w, h, d), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cyl(rt, rb, h, seg, mat, x, y, z) { var o = mesh(new THREE.CylinderGeometry(rt, rb, h, Math.max(12, seg)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function sph(r, mat, x, y, z) { var o = mesh(new THREE.SphereGeometry(r, 16, 12), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function cone(r, h, seg, mat, x, y, z) { var o = mesh(new THREE.ConeGeometry(r, h, Math.max(12, seg)), mat); o.position.set(x || 0, y || 0, z || 0); return o; }
function grp() { return new THREE.Group(); }
function put(parent, o, x, y, z, ry, rx, rz) {
  o.position.set(x || 0, y || 0, z || 0);
  if (ry) o.rotation.y = ry; if (rx) o.rotation.x = rx; if (rz) o.rotation.z = rz;
  parent.add(o); return o;
}
/* 种子随机（仅纹理噪点；布局一律固定值） */
function rng13(seed) {
  var s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    var x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
/* 两点间斜梁（lookAt 使 +Z 指向终点；几何长度沿 Z） */
function beam(ax, ay, az, bx, by, bz, thick, mat) {
  var dx = bx - ax, dy = by - ay, dz = bz - az;
  var len = Math.sqrt(dx * dx + dy * dy + dz * dz);
  var o = mesh(new THREE.BoxGeometry(thick, thick, len), mat);
  o.position.set((ax + bx) / 2, (ay + by) / 2, (az + bz) / 2);
  o.lookAt(new THREE.Vector3(bx, by, bz));
  return o;
}

/* ================= 1. 程序化 Canvas 纹理（≤512px，零外部资源） ================= */
function mkCanvas(w, h) { var cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; }
function toTex(cv, srgb) {
  var t = new THREE.CanvasTexture(cv);
  if (srgb && THREE.sRGBEncoding !== undefined) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = 4;
  return t;
}

/* 奶油灰泥：细噪 + 抹痕 + 分格缝 + 底部渍色（lv2-4 墙面，256px） */
function texPlaster() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng13(1301);
  g.fillStyle = '#e6ddc4'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 260; i++) {
    var v = R();
    g.fillStyle = v > 0.66 ? 'rgba(255,255,255,0.07)' : (v > 0.33 ? 'rgba(140,126,96,0.05)' : 'rgba(120,104,76,0.05)');
    g.fillRect(R() * S, R() * S, 3 + R() * 4, 2);
  }
  /* 水平抹缝（灰泥分格） */
  g.fillStyle = 'rgba(120,104,76,0.10)';
  g.fillRect(0, 84, S, 2); g.fillRect(0, 170, S, 2);
  g.fillStyle = 'rgba(120,104,76,0.06)';
  g.fillRect(0, 40, S, 1); g.fillRect(0, 128, S, 1); g.fillRect(0, 212, S, 1);
  /* 底部返碱渍带 */
  g.fillStyle = 'rgba(110,124,88,0.12)';
  g.fillRect(0, S - 14, S, 14);
  return toTex(cv, true);
}
/* 暗陶瓦垄：垄行明暗 + 竖向搭缝 + 陶面噪点（lv1-3 暗陶，256px，map+bump 同源） */
function texTile() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng13(1302);
  g.fillStyle = '#5a544e'; g.fillRect(0, 0, S, S);
  var rows = 12, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#6a635a' : '#57514a';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#413c36'; g.fillRect(0, y + rh - 4, S, 4);
    g.fillStyle = '#7a7368'; g.fillRect(0, y + 1, S, 3);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 6; k++) {
      var x = (off + k * (S / 6)) % S;
      g.fillStyle = 'rgba(44,40,34,0.5)'; g.fillRect(x, y, 2, rh - 4);
      g.fillStyle = 'rgba(150,142,128,0.18)'; g.fillRect(x + 3, y + 2, 2, rh - 6);
    }
  }
  for (i = 0; i < 320; i++) {
    g.fillStyle = (i % 3) ? 'rgba(255,255,255,0.05)' : 'rgba(20,18,14,0.09)';
    g.fillRect(R() * S, R() * S, 2, 2);
  }
  return toTex(cv, true);
}
/* 绿琉璃瓦垄：垄行 + 釉面高光斑 + 檐口滴水点（lv4 宝顶，256px） */
function texTileGreen() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng13(1303);
  g.fillStyle = '#3e7a52'; g.fillRect(0, 0, S, S);
  var rows = 10, rh = S / rows, i, k;
  for (i = 0; i < rows; i++) {
    var y = i * rh;
    g.fillStyle = (i % 2) ? '#4c8a60' : '#3a7250';
    g.fillRect(0, y, S, rh);
    g.fillStyle = '#2b5a3e'; g.fillRect(0, y + rh - 4, S, 4);
    g.fillStyle = '#69aa7c'; g.fillRect(0, y + 1, S, 3);
    var off = (i % 2) ? rh : 0;
    for (k = 0; k < 6; k++) {
      var x = (off + k * (S / 6)) % S;
      g.fillStyle = 'rgba(24,52,36,0.55)'; g.fillRect(x, y, 2, rh - 4);
      g.fillStyle = 'rgba(190,230,200,0.22)'; g.fillRect(x + 4, y + 2, 3, rh - 8);
    }
  }
  for (i = 0; i < 150; i++) {
    g.fillStyle = 'rgba(210,240,215,0.12)';
    g.fillRect(R() * S, R() * S, 2, 1);
  }
  return toTex(cv, true);
}
/* 拱券 voussoir 扇环：放射砖缝 + 楔心石高亮（UV=形状坐标，128px） */
var _fanCanvas = null, _fanMats = {};
function fanMat(Rr) {
  var k = Math.round(Rr * 50);
  if (_fanMats[k]) return _fanMats[k];
  if (!_fanCanvas) {
    var S = 128, cv = mkCanvas(S, S / 2), g = cv.getContext('2d');
    g.fillStyle = '#d8cfb8'; g.fillRect(0, 0, S, S / 2);
    g.strokeStyle = 'rgba(96,86,66,0.6)'; g.lineWidth = 2;
    var angs = [18, 42, 65, 90, 115, 138, 162], i;
    for (i = 0; i < angs.length; i++) {
      var a = angs[i] * PI / 180;
      g.beginPath();
      g.moveTo(S * (0.5 + 0.5 * 0.5 * cos(a)), S / 2 * (1 - 0.5 * sin(a)));
      g.lineTo(S * (0.5 + 0.5 * 0.99 * cos(a)), S / 2 * (1 - 0.99 * sin(a)));
      g.stroke();
    }
    /* 楔心石高亮带（中央上凸） */
    g.fillStyle = 'rgba(240,234,218,0.9)';
    g.beginPath();
    g.moveTo(S * 0.5 - 7, 2);
    g.lineTo(S * 0.5 + 7, 2);
    g.lineTo(S * 0.5 + 2, S / 2 * 0.46);
    g.lineTo(S * 0.5 - 2, S / 2 * 0.46);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(96,86,66,0.55)'; g.stroke();
    for (i = 0; i < 60; i++) {
      g.fillStyle = 'rgba(110,100,80,0.10)';
      g.fillRect((i * 37) % S, (i * 53) % (S / 2), 2, 1);
    }
    _fanCanvas = cv;
  }
  var t = toTex(_fanCanvas, true).clone(); t.needsUpdate = true;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.repeat.set(1 / (2 * Rr), 1 / Rr); t.offset.set(0.5, 0);
  var m = std('#ffffff', { map: t, rough: 0.84 });
  _fanMats[k] = m; return m;
}
/* 百叶背板：水平板条阴影（板条实体后面的衬底，64px） */
function texLouver() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d');
  g.fillStyle = '#888888'; g.fillRect(0, 0, S, S);
  var n = 6, i;
  for (i = 0; i < n; i++) {
    var y = i * (S / n);
    g.fillStyle = 'rgba(255,255,255,0.28)'; g.fillRect(0, y, S, 2);
    g.fillStyle = 'rgba(0,0,0,0.32)'; g.fillRect(0, y + S / n - 3, S, 3);
  }
  return toTex(cv, true);
}
/* 花箱花球：绿叶底 + 红/粉蕊点（64px） */
function texFlower() {
  var S = 64, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng13(1305);
  g.fillStyle = '#4e7a3c'; g.fillRect(0, 0, S, S);
  var i;
  for (i = 0; i < 26; i++) {
    g.fillStyle = 'rgba(96,140,70,0.8)';
    g.fillRect(R() * S, R() * S, 4, 3);
  }
  for (i = 0; i < 22; i++) {
    g.fillStyle = (i % 3 === 0) ? '#d84a58' : (i % 3 === 1 ? '#e86a5a' : '#e89ab0');
    g.fillRect(R() * S, R() * S, 3, 3);
  }
  return toTex(cv, true);
}
/* 石板路（格心坪）：大板缝 + 值域斑驳 + 边角苔渍（256px） */
function texPave() {
  var S = 256, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng13(1306);
  g.fillStyle = '#c9c2ae'; g.fillRect(0, 0, S, S);
  var rows = 4, rh = S / rows, cols = 4, cw = S / cols, i, k;
  for (i = 0; i < rows; i++) {
    for (k = 0; k < cols; k++) {
      g.fillStyle = ((i + k) % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(90,82,64,0.10)';
      g.fillRect(k * cw + 2, i * rh + 2, cw - 4, rh - 4);
      g.strokeStyle = 'rgba(70,64,50,0.55)'; g.lineWidth = 2;
      g.strokeRect(k * cw + 1, i * rh + 1, cw - 2, rh - 2);
    }
  }
  for (i = 0; i < 60; i++) {
    g.fillStyle = 'rgba(110,130,80,0.14)';
    g.fillRect(R() * S, R() * S, 3, 2);
  }
  return toTex(cv, true);
}
/* 木板墙（lv1）：竖板缝 + 木纹值域 + 钉点（128px） */
function texPlank() {
  var S = 128, cv = mkCanvas(S, S), g = cv.getContext('2d'), R = rng13(1307);
  g.fillStyle = '#8a6a48'; g.fillRect(0, 0, S, S);
  var n = 8, i, k;
  for (i = 0; i < n; i++) {
    var x = i * (S / n);
    g.fillStyle = (i % 2) ? 'rgba(255,255,255,0.06)' : 'rgba(40,26,14,0.12)';
    g.fillRect(x, 0, S / n, S);
    g.fillStyle = 'rgba(30,20,10,0.6)'; g.fillRect(x, 0, 2, S);
    for (k = 0; k < 4; k++) {
      g.fillStyle = 'rgba(60,42,24,0.25)';
      g.fillRect(x + 3 + R() * 10, R() * S, 1, 8);
    }
    g.fillStyle = 'rgba(28,20,10,0.55)';
    g.fillRect(x + S / n / 2 - 1, 5, 2, 2); g.fillRect(x + S / n / 2 - 1, S - 7, 2, 2);
  }
  return toTex(cv, true);
}
/* 竖招「北京路」v2：256×512 黑漆金边 + 描边金字竖排 + 底印（lv3+） */
function texSignV() {
  var w = 256, h = 512, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#241505'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 10; g.strokeRect(10, 10, w - 20, h - 20);
  g.strokeStyle = '#8a6420'; g.lineWidth = 4; g.strokeRect(24, 24, w - 48, h - 48);
  /* 角钉 */
  g.fillStyle = '#e7c56a';
  [[26, 26], [w - 26, 26], [26, h - 26], [w - 26, h - 26]].forEach(function (p) {
    g.beginPath(); g.arc(p[0], p[1], 6, 0, PI * 2); g.fill();
  });
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 118px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.lineWidth = 8; g.strokeStyle = '#5a3c10';
  var s = '北京路', i;
  for (i = 0; i < 3; i++) {
    var cy = 118 + i * 136;
    g.strokeText(s[i], w / 2, cy);
    g.fillStyle = '#e7c56a'; g.fillText(s[i], w / 2, cy);
    g.fillStyle = '#f6e2a0';
    g.fillRect(w / 2 - 30, cy + 44, 60, 4);
  }
  /* 底部朱印 */
  g.fillStyle = '#a03428'; g.fillRect(w / 2 - 26, h - 84, 52, 52);
  g.fillStyle = '#e8d8b0';
  g.font = 'bold 30px "KaiTi","SimSun",serif';
  g.fillText('市', w / 2, h - 58);
  return toTex(cv, true);
}
/* 横匾「北京路」v2：512×128 金漆描边（lv4 门楣） */
function texPlaqueH() {
  var w = 512, h = 128, cv = mkCanvas(w, h), g = cv.getContext('2d');
  g.fillStyle = '#26180c'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#d8a63c'; g.lineWidth = 8; g.strokeRect(8, 8, w - 16, h - 16);
  g.strokeStyle = '#8a6420'; g.lineWidth = 3; g.strokeRect(20, 20, w - 40, h - 40);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = 'bold 76px "KaiTi","STKaiti","SimSun","Microsoft YaHei",serif';
  g.lineWidth = 6; g.strokeStyle = '#5a3c10';
  g.strokeText('北 京 路', w / 2, h / 2 + 4);
  g.fillStyle = '#e7c56a'; g.fillText('北 京 路', w / 2, h / 2 + 4);
  return toTex(cv, true);
}
var TEX = {};
function getTex(id, make) { if (!TEX[id]) { TEX[id] = make(); TEX[id].name = 'p13tex_' + id; } return TEX[id]; }

/* ================= 共享材质库（四级统一色板 = 参考图逐区采样） ================= */
function Mats() {
  return {
    /* 墙面：front 提亮 / side 压暗（同贴图不同 tint，参考图阴阳面） */
    wallF:     MAT('p13wallF', function () { var t = getTex('plaster', texPlaster); return std('#ffffff', { map: t, rough: 0.88 }); }),
    wallS:     MAT('p13wallS', function () { var t = getTex('plaster', texPlaster); return std('#cfc6ac', { map: t, rough: 0.9 }); }),
    stuccoShd: MAT('p13stuccoShd', function () { return std('#cfc4a6', { rough: 0.9 }); }),
    wallTrim:  MAT('p13wallTrim', function () { return std('#efe8d6', { rough: 0.82 }); }),
    plinth:    MAT('p13plinth', function () { return std('#c9bfa6', { rough: 0.92 }); }),
    stone:     MAT('p13stone', function () { return std('#d8cfb8', { rough: 0.86 }); }),
    stoneD:    MAT('p13stoneD', function () { return std('#c4bba4', { rough: 0.9 }); }),
    moss:      MAT('p13moss', function () { return std('#5e7a4a', { rough: 0.95 }); }),
    /* 瓦顶：阳面 / 阴面（同 texTile tint 分档） */
    tileSun:   MAT('p13tileSun', function () { var t = getTex('tile', texTile); return std('#ffffff', { map: t, bump: t, bumpScale: 0.014, rough: 0.7 }); }),
    tileShade: MAT('p13tileShd', function () { var t = getTex('tile', texTile); return std('#a9a29a', { map: t, bump: t, bumpScale: 0.014, rough: 0.76 }); }),
    tileWarm:  MAT('p13tileWarm', function () { var t = getTex('tile', texTile); return std('#d8c0a0', { map: t, bump: t, bumpScale: 0.014, rough: 0.72 }); }),
    tileWarmD: MAT('p13tileWrmD', function () { var t = getTex('tile', texTile); return std('#b09a80', { map: t, bump: t, bumpScale: 0.014, rough: 0.78 }); }),
    ridge:     MAT('p13ridge', function () { return std('#3a3630', { rough: 0.8 }); }),
    /* 绿琉璃（lv4 宝顶） */
    glazeSun:  MAT('p13glazeSun', function () { var t = getTex('tileG', texTileGreen); return std('#ffffff', { map: t, bump: t, bumpScale: 0.012, rough: 0.4, metal: 0.05 }); }),
    glazeShd:  MAT('p13glazeShd', function () { var t = getTex('tileG', texTileGreen); return std('#8fa8a0', { map: t, bump: t, bumpScale: 0.012, rough: 0.46, metal: 0.05 }); }),
    glazeRidge: MAT('p13glazeRdg', function () { return std('#2e5e40', { rough: 0.5 }); }),
    /* 百叶窗五色（参考图轮换）：背板带百叶影 / 板条纯色 */
    shutter: [
      MAT('p13shG', function () { var t = getTex('louver', texLouver); return std('#3e8e5a', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); }),
      MAT('p13shO', function () { var t = getTex('louver', texLouver); return std('#d89c3c', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); }),
      MAT('p13shR', function () { var t = getTex('louver', texLouver); return std('#c04434', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); }),
      MAT('p13shT', function () { var t = getTex('louver', texLouver); return std('#3a8a96', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); }),
      MAT('p13shB', function () { var t = getTex('louver', texLouver); return std('#4a7ab0', { map: t, bump: t, bumpScale: 0.01, rough: 0.58 }); })],
    slat: [
      MAT('p13slG', function () { return std('#3e8e5a', { rough: 0.55 }); }),
      MAT('p13slO', function () { return std('#d89c3c', { rough: 0.55 }); }),
      MAT('p13slR', function () { return std('#c04434', { rough: 0.55 }); }),
      MAT('p13slT', function () { return std('#3a8a96', { rough: 0.55 }); }),
      MAT('p13slB', function () { return std('#4a7ab0', { rough: 0.55 }); })],
    frameW:    MAT('p13frameW', function () { return std('#f4eee0', { rough: 0.7 }); }),
    openD:     MAT('p13openD', function () { return std('#4a4038', { rough: 0.85 }); }),
    glow:      MAT('p13glow', function () { return std('#e8c890', { rough: 0.6, emissive: '#ffb45c', ei: 0.18 }); }),
    planter:   MAT('p13planter', function () { return std('#b0653c', { rough: 0.8 }); }),
    flower:    MAT('p13flower', function () { return std('#ffffff', { map: getTex('flower', texFlower), rough: 0.85 }); }),
    /* 挑棚色阶（幅条逐档交替） */
    canvasC:   MAT('p13canvasC', function () { return std('#e8ddc0', { rough: 0.94 }); }),
    canvasCD:  MAT('p13canvasCD', function () { return std('#ddd0ae', { rough: 0.94 }); }),
    canvasG:   MAT('p13canvasG', function () { return std('#3f8f5f', { rough: 0.92 }); }),
    canvasGD:  MAT('p13canvasGD', function () { return std('#357a50', { rough: 0.92 }); }),
    canvasR:   MAT('p13canvasR', function () { return std('#c03830', { rough: 0.92 }); }),
    canvasRD:  MAT('p13canvasRD', function () { return std('#a82c26', { rough: 0.92 }); }),
    stripeW:   MAT('p13stripeW', function () { return std('#e8e4d8', { rough: 0.92 }); }),
    stripeR:   MAT('p13stripeR', function () { return std('#c03830', { rough: 0.92 }); }),
    /* 木作 / 铁 / 金 / 灯笼 */
    plank:     MAT('p13plank', function () { return std('#ffffff', { map: getTex('plank', texPlank), bump: getTex('plank', texPlank), bumpScale: 0.01, rough: 0.82 }); }),
    wood:      MAT('p13wood', function () { return std('#8a6a48', { rough: 0.8 }); }),
    woodD:     MAT('p13woodD', function () { return std('#6e5438', { rough: 0.86 }); }),
    iron:      MAT('p13iron', function () { return std('#2e3238', { rough: 0.6, metal: 0.3 }); }),
    lampGlow:  MAT('p13lampGlow', function () { return std('#e8d0a0', { rough: 0.4, emissive: '#ffcf7a', ei: 0.5 }); }),
    gold:      MAT('p13gold', function () { return std('#d4a83c', { rough: 0.35, metal: 0.75 }); }),
    glint:     MAT('p13glint', function () { return std('#e8c468', { rough: 0.28, metal: 0.8, emissive: '#ffd98a', ei: 0.15 }); }),
    lantM:     MAT('p13lant', function () { return std('#d0402e', { rough: 0.5, emissive: '#ff7a3c', ei: 0.5 }); }),
    lacqDk:    MAT('p13lacqDk', function () { return std('#5a3018', { rough: 0.6 }); }),
    /* 地坪 */
    pave:      MAT('p13pave', function () { return std('#ffffff', { map: getTex('pave', texPave), rough: 0.92 }); }),
    paveB:     MAT('p13paveB', function () { return std('#a8a08c', { rough: 0.94 }); }),
    grass:     MAT('p13grass', function () { return std('#7ca85b', { rough: 0.95 }); }),
    grassD:    MAT('p13grassD', function () { return std('#698f4c', { rough: 0.95 }); })
  };
}

/* ================= 2. 预制件（骑楼独有语汇） ================= */

/* 骑楼拱廊墙：Shape + 半圆拱洞（absarc）一次挤出 —— 1 mesh 承载整排拱 */
function archWall(M, w, h, t, arches, mat, zf) {
  var shape = new THREE.Shape();
  shape.moveTo(-w / 2, 0); shape.lineTo(w / 2, 0);
  shape.lineTo(w / 2, h); shape.lineTo(-w / 2, h); shape.closePath();
  var i;
  for (i = 0; i < arches.length; i++) {
    var a = arches[i], r = a.w / 2;
    var p = new THREE.Path();
    p.moveTo(a.cx - r, 0);
    p.lineTo(a.cx - r, a.spring);
    p.absarc(a.cx, a.spring, r, PI, 0, true);
    p.lineTo(a.cx + r, 0);
    p.closePath();
    shape.holes.push(p);
  }
  var geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
  var m = mesh(geo, mat);
  m.position.z = zf - t;                          /* 墙前皮对齐 zf */
  return m;
}

/* 拱券石分环（v2）：半环 voussoir 扇环挤出 + 凸出楔心石 —— 2 mesh / 拱 */
function archFan(M, a, zf) {
  var r = a.w / 2, R = r + 0.055;
  var g = grp();
  var s = new THREE.Shape();
  s.absarc(a.cx, a.spring, R, 0, PI, false);
  s.absarc(a.cx, a.spring, r - 0.008, PI, 0, true);
  s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 12 });
  var fan = mesh(geo, fanMat(R));
  fan.position.z = zf + 0.02;                     /* 与墙面留 0.02 缝隙，前皮 zf+0.04 */
  g.add(fan);
  g.add(box(0.05, 0.115, 0.045, M.stone, a.cx, a.spring + R * 0.62, zf + 0.03));   /* keystone */
  return g;
}

/* 石柱 v2：柱础 + 苔绿浸带 + 柱身 + 柱头（骑楼廊柱，4 mesh） */
function columnRound(M, h, r) {
  var g = grp();
  g.add(box(r * 2.6, 0.05, r * 2.6, M.stoneD, 0, 0.025, 0));
  g.add(box(r * 2.35, 0.02, r * 2.35, M.moss, 0, 0.058, 0));
  g.add(cyl(r, r * 1.06, h, 12, M.stone, 0, 0.05 + h / 2, 0));
  g.add(box(r * 2.5, 0.04, r * 2.5, M.stoneD, 0, 0.05 + h + 0.02, 0));
  return g;
}

/* 瓶栏瓶柱几何（Lathe 旋成面 12 段，木/石共用） */
var _vaseGeo = null;
function vaseGeo() {
  if (!_vaseGeo) {
    var pts = [
      new THREE.Vector2(0.005, 0), new THREE.Vector2(0.016, 0.004), new THREE.Vector2(0.018, 0.013),
      new THREE.Vector2(0.011, 0.032), new THREE.Vector2(0.010, 0.048), new THREE.Vector2(0.015, 0.064),
      new THREE.Vector2(0.017, 0.078), new THREE.Vector2(0.016, 0.090), new THREE.Vector2(0.011, 0.100),
      new THREE.Vector2(0.014, 0.108), new THREE.Vector2(0.016, 0.112)
    ];
    _vaseGeo = new THREE.LatheGeometry(pts, 12);
  }
  return _vaseGeo;
}
/* 瓶栏跑（木阳台 / 石平座）：地栿 + n 瓶柱 + 扶手 —— n+2 mesh */
function balustradeRun(M, w, n, mat) {
  var g = grp();
  g.add(box(w, 0.022, 0.04, mat, 0, 0.011, 0));
  var i;
  for (i = 0; i < n; i++) {
    var v = mesh(vaseGeo(), mat);
    v.position.set(-w / 2 + (i + 0.5) * (w / n), 0.02, 0);
    g.add(v);
  }
  g.add(box(w + 0.03, 0.024, 0.05, mat, 0, 0.148, 0));
  return g;
}

/* 百叶窗单元 v2：白框 + 暗腔 + 暖光腔 + 拱顶玻璃 + 成对百叶（背板+逐片板条）+
   石窗台 + 花箱（花球+叶球）—— 8 + 2n + (archF?1:0) mesh */
function shutterWindow(M, w, h, cIdx, o) {
  o = o || {};
  var n = o.slats || 4;
  var g = grp();
  var ci = cIdx % M.shutter.length;
  g.add(box(w + 0.05, h + 0.05, 0.035, M.frameW));                                   /* 框 */
  g.add(box(w, h, 0.03, M.openD, 0, 0, 0.004));                                      /* 暗腔 */
  g.add(box(w * 0.9, h * 0.66, 0.022, M.glow, 0, -h * 0.15, 0.012));                 /* 暖光玻璃 */
  var ag = new THREE.CylinderGeometry(w * 0.36, w * 0.36, 0.022, 12, 1, false, 0, PI);
  ag.rotateX(PI / 2); ag.rotateZ(PI / 2);
  var agm = mesh(ag, M.glow); agm.position.set(0, h * 0.18, 0.012); g.add(agm);      /* 拱顶玻璃 */
  if (o.archF) {
    var af = new THREE.CylinderGeometry(w * 0.36 + 0.022, w * 0.36 + 0.022, 0.03, 12, 1, false, 0, PI);
    af.rotateX(PI / 2); af.rotateZ(PI / 2);
    var afm = mesh(af, M.frameW); afm.position.set(0, h * 0.18, 0.008); g.add(afm);  /* 拱框环 */
  }
  /* 成对百叶：背板（百叶影贴图）+ 逐片斜置板条 */
  var sd, i;
  for (sd = -1; sd <= 1; sd += 2) {
    g.add(box(w * 0.3, h * 1.04, 0.014, M.shutter[ci], sd * w * 0.335, 0, 0.026));
    for (i = 0; i < n; i++) {
      var sl = box(w * 0.26, 0.015, 0.022, M.slat[ci], sd * w * 0.335, 0, 0);
      sl.rotation.x = 0.45;
      sl.position.y = h * 0.46 - (i + 0.5) * (h * 0.92 / n);
      sl.position.z = 0.036;
      g.add(sl);
    }
  }
  g.add(box(w * 0.95, 0.035, 0.06, M.stone, 0, -h / 2 - 0.028, 0.018));              /* 石窗台 */
  g.add(box(w * 0.8, 0.055, 0.07, M.planter, 0, -h / 2 - 0.07, 0.024));              /* 花箱 */
  var fb = sph(0.028, M.flower, -w * 0.14, -h / 2 - 0.035, 0.032); fb.scale.y = 0.85; g.add(fb);
  var lb = sph(0.023, M.grassD, w * 0.14, -h / 2 - 0.04, 0.03); lb.scale.y = 0.85; g.add(lb);
  return g;
}

/* 挑棚 v2：逐幅分档棚布（matA/matB 交替）+ 波浪垂边（半圆瓦楞逐幅）+
   挂杆 + 端斜撑 + 侧垂片；val 整组供摇曳动画 */
var _scallopGeo = null;
function scallopGeo(len) {
  if (!_scallopGeo) {
    _scallopGeo = new THREE.CylinderGeometry(0.024, 0.024, 1, 12, 1, false, 0, PI);
    _scallopGeo.rotateZ(-PI / 2);                  /* 曲面向下悬挂，长度沿 X，后缩放 */
  }
  var g = _scallopGeo.clone(); g.scale(len, 1, 1); return g;
}
function awningUnit(M, w, out, matA, matB, y0, zf, segs) {
  var g = grp(), n = segs || 6, i;
  var drop = 0.16, slope = Math.atan2(drop, out);
  var len = Math.sqrt(out * out + drop * drop) + 0.02;
  for (i = 0; i < n; i++) {
    var seg = box(w / n + 0.004, 0.014, len, (i % 2) ? matB : matA);
    seg.rotation.x = slope;
    seg.position.set(-w / 2 + (i + 0.5) * (w / n), y0 - drop / 2, zf + out / 2);
    g.add(seg);
  }
  /* 波浪垂边（可摇组）：压条 + 逐幅半管瓦楞 */
  var val = grp(); val.position.set(0, y0 - drop, zf + out); g.add(val);
  val.add(box(w + 0.01, 0.04, 0.014, matA, 0, 0.012, 0));
  for (i = 0; i < n; i++) {
    var sc = mesh(scallopGeo(w / n * 0.96), (i % 2) ? matB : matA);
    sc.position.set(-w / 2 + (i + 0.5) * (w / n), -0.018, 0);
    val.add(sc);
  }
  /* 挂杆 + 端斜撑 + 侧垂片 */
  var rod = cyl(0.008, 0.008, w + 0.05, 12, M.iron, 0, 0.05, 0.012);
  rod.rotation.z = PI / 2; val.add(rod);
  for (i = -1; i <= 1; i += 2) {
    var br = box(0.02, 0.16, 0.02, M.woodD, i * (w / 2 - 0.04), 0.1, zf + out - 0.16);
    br.rotation.x = -0.55; g.add(br);
    var fp = box(0.016, 0.09, len * 0.45, matA, i * (w / 2 + 0.008), y0 - drop - 0.01, zf + out * 0.78);
    fp.rotation.x = slope + 0.12; fp.rotation.z = i * 0.1; g.add(fp);
  }
  return { g: g, val: val };
}

/* 双坡瓦顶 v2（lv1/lv2）：阳/阴坡 + 黑瓦脊 + 翘角 + 封檐板 +（坡檐滚瓦/脊头球） */
function tileRoof(M, o) {
  var w = o.w, d = o.d, h = o.h;
  var over = o.over !== undefined ? o.over : 0.09;
  var sun = o.warm ? M.tileWarm : M.tileSun;
  var shd = o.warm ? M.tileWarmD : M.tileShade;
  var g = grp(), i, k;
  var eave = d / 2 + over;
  var pitch = Math.atan2(h, eave);
  var slopeLen = Math.sqrt(eave * eave + h * h) + 0.02;
  for (k = -1; k <= 1; k += 2) {
    var sg = grp(); sg.position.set(0, h, 0); sg.rotation.x = pitch * k; g.add(sg);
    sg.add(box(w + over * 2, 0.034, slopeLen, k > 0 ? sun : shd, 0, 0, k * slopeLen / 2));
    for (i = 0; i < 3; i++) {
      sg.add(box(w + over * 2 - 0.04, 0.015, 0.028, M.ridge, 0, 0.024, k * (0.3 + i * 0.3) * eave));
    }
    sg.add(box(w + over * 2 + 0.02, 0.05, 0.024, M.ridge, 0, -0.004, k * eave));
    var c1 = box(0.07, 0.05, 0.07, M.ridge, (w + over * 2) / 2 - 0.01, 0.045, k * (eave - 0.015));
    c1.rotation.z = 0.55; sg.add(c1);
    var c2 = box(0.07, 0.05, 0.07, M.ridge, -(w + over * 2) / 2 + 0.01, 0.045, k * (eave - 0.015));
    c2.rotation.z = -0.55; sg.add(c2);
    if (o.hipRolls) {                              /* 坡檐滚瓦（参考图 lv1 卷脊） */
      var roll = cyl(0.02, 0.02, w + over * 2, 12, M.ridge, 0, 0.036, k * (eave - 0.04));
      roll.rotation.z = PI / 2; sg.add(roll);
    }
  }
  /* 山墙封板 */
  var gs = new THREE.Shape();
  gs.moveTo(-eave, 0); gs.lineTo(eave, 0); gs.lineTo(0, h); gs.closePath();
  var gg = new THREE.ExtrudeGeometry(gs, { depth: 0.04, bevelEnabled: false });
  var t1 = mesh(gg, M.wallTrim); t1.rotation.y = PI / 2;
  t1.position.set(w / 2 - 0.005, -0.02, -0.02); g.add(t1);
  var t2 = mesh(gg, M.wallTrim); t2.rotation.y = -PI / 2;
  t2.position.set(-(w / 2 - 0.005), -0.02, 0.02); g.add(t2);
  var rw = w + over * 2 + 0.04;
  g.add(box(rw, 0.055, 0.085, M.ridge, 0, h + 0.028, 0));
  var f1 = box(0.055, 0.09, 0.075, M.ridge, rw / 2 - 0.01, h + 0.09, 0); f1.rotation.z = 0.42; g.add(f1);
  var f2 = box(0.055, 0.09, 0.075, M.ridge, -rw / 2 + 0.01, h + 0.09, 0); f2.rotation.z = -0.42; g.add(f2);
  if (o.finialBalls) {                             /* 正脊端头宝球（lv2 荷兰山墙） */
    g.add(sph(0.028, M.stone, rw / 2 - 0.01, h + 0.125, 0));
    g.add(sph(0.028, M.stone, -(rw / 2 - 0.01), h + 0.125, 0));
  }
  return g;
}

/* 四坡攒尖顶 v2（lv3 暗陶 / lv4 绿琉璃）：4 棱锥 + 四条垂脊 + 翘角（+金珠）
 * + 宝顶（'gold'：琉璃座+金球+金环+金尖+顶珠 / 'tile'：脊枕+脊头）
 * 注：旋转烘焙进几何（geo.rotateY），避免 Cone AABB 方形包络在旋转后虚增 Box3。 */
function pyramidRoof(M, o) {
  var wx = o.w, wz = o.d, ch = o.h;
  var matSun = o.glaze ? M.glazeSun : M.tileSun;
  var matRdg = o.glaze ? M.glazeRidge : M.ridge;
  var g = grp();
  var r = (wx + 0.12) * 0.7071;
  var pyGeo = new THREE.ConeGeometry(r, ch, 4);
  pyGeo.rotateY(PI / 4);
  var py = mesh(pyGeo, matSun);
  py.scale.z = (wz + 0.12) / (wx + 0.12);
  py.position.y = ch / 2;
  g.add(py);
  /* 阴面：贴一片暗色前坡横带（近似值区分档，省 mesh） */
  if (!o.glaze) g.add(box(wx * 0.62, 0.02, 0.02, o.glaze ? M.glazeShd : M.tileShade, 0, ch * 0.32, wz / 2 + 0.02));
  /* 四条垂脊（apex → 四角） */
  var hx = wx / 2 + 0.02, hz = wz / 2 + 0.02, i;
  var corners = [[hx, hz], [hx, -hz], [-hx, hz], [-hx, -hz]];
  for (i = 0; i < 4; i++) {
    g.add(beam(0, ch, 0, corners[i][0] * 0.985, 0.012, corners[i][1] * 0.985, 0.036, matRdg));
  }
  /* 四角翘角（金珠标记 / 素翘角） */
  for (i = 0; i < 4; i++) {
    if (o.goldTips) {
      put(g, sph(0.024, M.gold), corners[i][0] * 1.02, 0.04, corners[i][1] * 1.02);
    } else {
      var lift = box(0.06, 0.04, 0.06, matRdg, corners[i][0] * 1.02, 0.018, corners[i][1] * 1.02);
      lift.rotation.z = -Math.sign(corners[i][0]) * 0.5;
      g.add(lift);
    }
  }
  /* 宝顶 */
  if (o.finial === 'gold') {
    g.add(cyl(0.052, 0.066, 0.042, 12, matRdg, 0, ch + 0.021, 0));                   /* 琉璃座 */
    g.add(sph(0.046, M.glint, 0, ch + 0.072, 0));                                    /* 金球 */
    var ring = mesh(new THREE.TorusGeometry(0.03, 0.011, 8, 14), M.gold);
    ring.rotation.x = PI / 2; ring.position.y = ch + 0.118; g.add(ring);             /* 金环 */
    g.add(cone(0.02, 0.062, 12, M.glint, 0, ch + 0.148, 0));                         /* 金尖 */
    g.add(sph(0.016, M.gold, 0, ch + 0.182, 0));                                     /* 顶珠 */
  } else {
    g.add(box(0.34, 0.05, 0.09, matRdg, 0, ch + 0.025, 0));
    var f1 = box(0.05, 0.07, 0.07, matRdg, 0.17, ch + 0.07, 0); f1.rotation.z = 0.4; g.add(f1);
    var f2 = box(0.05, 0.07, 0.07, matRdg, -0.17, ch + 0.07, 0); f2.rotation.z = -0.4; g.add(f2);
  }
  return g;
}

/* 弧形山花 v2：连续曲线轮廓挤出 +（顶盖瓦球 / 涡卷 / 盾徽，按 tier） */
function parapetGable(M, w, h, t, tier) {
  var s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h * 0.42);
  s.quadraticCurveTo(-w / 2, h * 0.88, -w * 0.22, h * 0.96);
  s.quadraticCurveTo(0, h * 1.06, w * 0.22, h * 0.96);
  s.quadraticCurveTo(w / 2, h * 0.88, w / 2, h * 0.42);
  s.lineTo(w / 2, 0);
  s.closePath();
  var geo = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 1, curveSegments: 14 });
  var m = mesh(geo, M.wallTrim);
  var g = grp(); g.add(m);
  var apex = h * 1.02;
  if (tier === 2) {
    /* lv2：阁楼暗窗 + 顶盖瓦球 */
    g.add(box(0.13, 0.11, 0.03, M.openD, 0, h * 0.4, t / 2 + 0.005));
    var aa = new THREE.CylinderGeometry(0.065, 0.065, 0.03, 12, 1, false, 0, PI);
    aa.rotateX(PI / 2); aa.rotateZ(PI / 2);
    var aaM = mesh(aa, M.openD); aaM.position.set(0, h * 0.4, t / 2 + 0.005); g.add(aaM);
    g.add(sph(0.024, M.stone, 0, apex + 0.02, t / 2));
    g.add(box(w * 0.2, h * 0.26, t + 0.012, M.stone, 0, h * 0.38, t / 2));
  } else if (tier === 3) {
    /* lv3：中央筒状饰 + 肩部涡卷 */
    var cart = cyl(0.055, 0.055, 0.02, 12, M.stone, 0, h * 0.5, t + 0.012);
    cart.rotation.x = PI / 2; cart.scale.y = 1.2; g.add(cart);
    g.add(sph(0.022, M.stoneD, 0, apex + 0.015, t / 2));
    for (var sd = -1; sd <= 1; sd += 2) {
      var vo = mesh(new THREE.TorusGeometry(0.032, 0.012, 8, 12, PI * 0.62), M.stone);
      vo.position.set(sd * w * 0.34, h * 0.55, t + 0.008);
      vo.rotation.z = sd > 0 ? -0.9 : PI + 0.9;
      g.add(vo);
    }
  } else {
    /* lv4：内圈凸线 rim + 圆盾徽 + 涡卷 */
    var rim = new THREE.ExtrudeGeometry(gableShape(w * 0.84, h * 0.86),
      { depth: t + 0.024, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 14 });
    g.add(mesh(rim, M.stone));
    var zp = t + 0.03;
    var disc = cyl(0.05, 0.05, 0.016, 12, M.stone, 0, h * 0.52, zp);
    disc.rotation.x = PI / 2; g.add(disc);
    g.add(sph(0.018, M.stoneD, 0, h * 0.52, zp + 0.012));
    for (var s2 = -1; s2 <= 1; s2 += 2) {
      var vo2 = mesh(new THREE.TorusGeometry(0.03, 0.011, 8, 12, PI * 0.62), M.stone);
      vo2.position.set(s2 * w * 0.38, h * 0.6, zp - 0.006);
      vo2.rotation.z = s2 > 0 ? -0.9 : PI + 0.9;
      g.add(vo2);
    }
  }
  return g;
}
function gableShape(w, h) {
  var s = new THREE.Shape();
  s.moveTo(-w / 2, 0);
  s.lineTo(-w / 2, h * 0.42);
  s.quadraticCurveTo(-w / 2, h * 0.88, -w * 0.22, h * 0.96);
  s.quadraticCurveTo(0, h * 1.06, w * 0.22, h * 0.96);
  s.quadraticCurveTo(w / 2, h * 0.88, w / 2, h * 0.42);
  s.lineTo(w / 2, 0);
  s.closePath();
  return s;
}

/* 红灯笼 v2（金盖金底 + 红壳 + 穗，呼吸随 phase；4 mesh） */
function lanternUnit(M, s, phase) {
  var g = grp(); s = s || 1;
  var bm = M.lantM;
  g.add(cyl(0.034 * s, 0.048 * s, 0.033 * s, 12, M.gold, 0, 0.11 * s, 0));
  var body = sph(0.082 * s, bm, 0, 0, 0); body.scale.y = 0.84; g.add(body);
  g.add(cyl(0.048 * s, 0.034 * s, 0.033 * s, 12, M.gold, 0, -0.1 * s, 0));
  g.add(cyl(0.008 * s, 0.008 * s, 0.07 * s, 12, M.lacqDk, 0, -0.158 * s, 0));
  return g;
}

/* 铸铁路灯 v2：基座 + 锥柱 + 领圈 + 灯盘 + 玻璃灯罩（四根铁棂）+ 锥顶 + 金顶珠 */
function lampPost(M, h) {
  var g = grp();
  var y0 = 0.05;
  g.add(cyl(0.055, 0.07, 0.06, 12, M.iron, 0, 0.03, 0));
  g.add(cyl(0.022, 0.034, h, 12, M.iron, 0, 0.06 + h / 2, 0));
  g.add(cyl(0.036, 0.036, 0.02, 12, M.iron, 0, y0 + h * 0.86, 0));
  var yT = y0 + h + 0.02;
  g.add(cyl(0.052, 0.036, 0.022, 12, M.iron, 0, yT - 0.011, 0));                     /* 灯盘 */
  g.add(box(0.078, 0.092, 0.078, M.lampGlow, 0, yT + 0.046, 0));                     /* 玻璃罩 */
  for (var i = -1; i <= 1; i += 2) {
    g.add(box(0.013, 0.104, 0.013, M.iron, i * 0.033, yT + 0.046, 0.033));
    g.add(box(0.013, 0.104, 0.013, M.iron, i * 0.033, yT + 0.046, -0.033));
  }
  var cap = cone(0.06, 0.058, 12, M.iron, 0, yT + 0.122, 0); cap.rotation.y = PI / 4; g.add(cap);
  g.add(sph(0.016, M.gold, 0, yT + 0.16, 0));
  return g;
}

/* 竖招「北京路」v2：铁艺挑臂 + 浴卷垫环 + 整板纹理招帽 + 顶环（sway 动画） */
function signBoard(M, h) {
  var g = grp();
  g.add(box(0.028, 0.028, 0.3, M.iron, 0, 0, 0.15));                /* 挑臂（+Z 挑出） */
  var scroll = mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 14, PI * 1.2), M.iron);
  scroll.position.set(0, -0.03, 0.24); scroll.rotation.y = PI / 2; scroll.rotation.z = 0.4;
  g.add(scroll);                                                    /* 浴卷垫环 */
  g.add(cyl(0.012, 0.012, 0.05, 12, M.iron, 0, -0.02, 0.28));
  var bd = grp(); bd.position.set(0, -h / 2 - 0.02, 0.28); g.add(bd);
  bd.add(box(0.17, h, 0.035, std('#241505', { map: getTex('signV', texSignV), rough: 0.5, metal: 0.08 })));
  bd.add(box(0.19, 0.03, 0.045, M.gold, 0, h / 2 + 0.015, 0));      /* 金帽 */
  return { g: g, bd: bd };
}

/* 陶罐望柱头（lv4 平座）：罐身 + 罐口 */
function urnMini(M, s) {
  var g = grp(); s = s || 1;
  var b = sph(0.05 * s, M.planter, 0, 0.05 * s, 0); b.scale.y = 1.15; g.add(b);
  g.add(cyl(0.036 * s, 0.024 * s, 0.03 * s, 12, M.stoneD, 0, 0.115 * s, 0));
  return g;
}

/* 果摊 v2（lv1/lv3/lv4）：案 + 侧板 + 果堆×4 + 提篮 + 木箱（9 mesh） */
function marketStall(M, w) {
  var g = grp();
  g.add(box(w, 0.03, 0.3, M.wood, 0, 0.26, 0));
  g.add(box(0.03, 0.24, 0.26, M.woodD, -w / 2 + 0.04, 0.13, 0));
  g.add(box(0.03, 0.24, 0.26, M.woodD, w / 2 - 0.04, 0.13, 0));
  var fr = mesh(new THREE.IcosahedronGeometry(0.048, 1), MAT('p13orange', function () { return std('#e08a30', { rough: 0.7 }); }));
  put(g, fr, -w * 0.26, 0.305, 0.02); fr.scale.y = 0.7;
  var fg = mesh(new THREE.IcosahedronGeometry(0.046, 1), M.grass);
  put(g, fg, 0.02, 0.3, -0.05); fg.scale.y = 0.68;
  var fg2 = mesh(new THREE.IcosahedronGeometry(0.038, 1), MAT('p13greens', function () { return std('#8fae52', { rough: 0.75 }); }));
  put(g, fg2, 0.13, 0.29, 0.03); fg2.scale.y = 0.68;
  var frd = mesh(new THREE.IcosahedronGeometry(0.042, 1), MAT('p13red2', function () { return std('#c04a38', { rough: 0.7 }); }));
  put(g, frd, w * 0.26, 0.295, 0); frd.scale.y = 0.7;
  var bk = cyl(0.05, 0.038, 0.07, 12, M.planter, -w * 0.3, 0.075, 0.14); g.add(bk);  /* 提篮（地面） */
  g.add(box(0.13, 0.1, 0.12, M.woodD, w * 0.34, 0.05, 0.2));                           /* 木箱 */
  return g;
}

/* 地坪 v2：石板坪 + 路缘 + 灌丛 + 草丛（5 mesh） */
function padUnit(M, size, depth) {
  var g = grp();
  var d = depth || size;
  g.add(box(size, 0.05, d, M.pave, 0, 0.028, 0));
  g.add(box(size + 0.05, 0.028, d + 0.05, M.paveB, 0, 0.012, 0));
  var bush = mesh(new THREE.IcosahedronGeometry(0.085, 1), M.grassD);
  put(g, bush, -size / 2 + 0.24, 0.1, d / 2 - 0.26); bush.scale.y = 0.8;
  var bush2 = mesh(new THREE.IcosahedronGeometry(0.065, 1), M.grass);
  put(g, bush2, size / 2 - 0.3, 0.09, -d / 2 + 0.3); bush2.scale.y = 0.8;
  var t1 = mesh(new THREE.IcosahedronGeometry(0.032, 0), M.grass);
  put(g, t1, size / 2 - 0.42, 0.085, d / 2 - 0.2); t1.scale.y = 1.4;
  return g;
}
/* 陶盆红花（3 mesh） */
function potMini(M, s) {
  var g = grp(); s = s || 1;
  g.add(cyl(0.048 * s, 0.06 * s, 0.085 * s, 12, M.planter, 0, 0.042 * s, 0));
  var f = sph(0.044 * s, M.flower, 0, 0.105 * s, 0); f.scale.y = 0.85; g.add(f);
  var l = sph(0.03 * s, M.grass, 0.028 * s, 0.09 * s, 0.02 * s); g.add(l);
  return g;
}

/* ================= 3. 四阶生长（blockout→structure→form→material→interaction） ================= */

/* ---- lv1 小屋：木板市集棚屋（h≈1.06） ---- */
function level1(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.3, 2.1));
  /* 棚屋主体：木板墙 + 角柱 + 暗陶双坡瓦顶 */
  g.add(box(1.15, 0.55, 0.85, M.plank, 0, 0.335, -0.12));
  [[-0.55, -0.5], [0.55, -0.5], [-0.55, 0.26], [0.55, 0.26]].forEach(function (c) {
    g.add(box(0.055, 0.58, 0.055, M.woodD, c[0], 0.35, c[1]));
  });
  /* 门洞 + 门口石阶 + 百叶小窗（参考图右前木百叶窗） */
  g.add(box(0.28, 0.4, 0.05, M.openD, -0.32, 0.26, 0.315));
  g.add(box(0.2, 0.03, 0.06, M.wood, -0.32, 0.47, 0.318));
  g.add(box(0.34, 0.045, 0.18, M.stoneD, -0.32, 0.083, 0.42));
  var mw = shutterWindow(M, 0.16, 0.17, 3, { slats: 2 });
  put(g, mw, 0.24, 0.42, 0.315);
  /* 暖棕瓦顶（apex≈0.95）+ 坡檐滚瓦 + 脊头球 */
  var roof = tileRoof(M, { w: 1.16, d: 0.9, h: 0.3, over: 0.1, warm: true, hipRolls: true, finialBalls: true });
  put(g, roof, 0, 0.615, -0.12);
  /* 奶油帆布挑棚（左前，逐幅 + 波浪垂边，摇曳） */
  var aw = awningUnit(M, 0.95, 0.52, M.canvasC, M.canvasCD, 0.44, 0.24, 4);
  put(g, aw.g, -0.25, 0, 0);
  g.add(box(0.03, 0.42, 0.03, M.woodD, -0.68, 0.23, 0.72));
  g.add(box(0.03, 0.42, 0.03, M.woodD, 0.18, 0.23, 0.72));
  anims.push(function (t) { aw.val.rotation.x = sin(t * 1.4) * 0.05; });
  /* 果摊（棚下）+ 货箱（右前）+ 提篮 */
  var st = marketStall(M, 0.85); put(g, st, -0.3, 0.05, 0.58);
  g.add(box(0.16, 0.12, 0.14, M.woodD, 0.62, 0.11, 0.52));
  g.add(cyl(0.05, 0.038, 0.07, 12, M.planter, 0.4, 0.085, 0.66));
  /* 红灯笼 ×2（右门柱挑出 + 左棚柱，摇曳 + 呼吸） */
  var lt = grp(); lt.position.set(0.55, 0.56, 0.3); g.add(lt);
  lt.add(box(0.2, 0.025, 0.025, M.woodD, 0.1, 0, 0));
  var ltSwing = grp(); ltSwing.position.set(0.18, -0.02, 0); lt.add(ltSwing);
  ltSwing.add(lanternUnit(M, 0.72, 0));
  var lt2 = grp(); lt2.position.set(-0.68, 0.47, 0.72); g.add(lt2);
  lt2.add(lanternUnit(M, 0.6, 1));
  anims.push(function (t) {
    ltSwing.rotation.z = sin(t * 1.25 + 0.4) * 0.055;
    lt2.rotation.z = sin(t * 1.1 + 2.2) * 0.05;
    M.lantM.emissiveIntensity = 0.5 + 0.18 * sin(t * 2.1);
  });
  return g;
}

/* ---- lv2 洋房：两层双拱骑楼小楼 + 荷兰弧山墙（h≈1.65） ---- */
function level2(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.2));
  var zf = 0.56;                                   /* 立面前皮 */
  /* 台基 + 主体（0.10-1.26） */
  g.add(box(1.86, 0.1, 1.12, M.stoneD, 0, 0.05, 0));
  g.add(box(1.72, 1.16, 1.0, M.wallF, 0, 0.68, -0.06));
  g.add(box(1.72, 1.16, 0.02, M.wallS, 0, 0.68, -0.57));
  /* 骑楼廊：双拱墙 + 拱券分环 + 石柱 ×2 + 走廊板（0.10-0.74） */
  var arches = [
    { cx: -0.42, w: 0.46, spring: 0.4 },
    { cx: 0.42, w: 0.46, spring: 0.4 }
  ];
  g.add(archWall(M, 1.66, 0.66, 0.07, arches, M.wallF, zf));
  arches.forEach(function (a) { g.add(archFan(M, a, zf)); });
  g.add(box(1.7, 0.035, 0.03, M.stone, 0, 0.375, zf + 0.015));                      /* impost 带 */
  arches.forEach(function (a) {
    var c = columnRound(M, 0.56, 0.038); put(g, c, a.cx, 0.1, 0.62);
  });
  g.add(box(1.78, 0.05, 0.24, M.stoneD, 0, 0.075, 0.6));
  /* 店脸（廊内）：门 + 货堆 + 木箱 */
  g.add(box(0.4, 0.44, 0.04, M.woodD, -0.44, 0.32, 0.31));
  g.add(box(0.42, 0.05, 0.1, M.wood, -0.44, 0.56, 0.31));
  g.add(box(0.3, 0.2, 0.16, M.woodD, 0.4, 0.2, 0.3));
  g.add(cyl(0.05, 0.04, 0.06, 12, M.planter, 0.12, 0.13, 0.32));
  /* 绿挑棚（横贯廊口，逐幅 + 波浪垂边，摇曳） */
  var aw = awningUnit(M, 1.6, 0.42, M.canvasG, M.canvasGD, 0.78, zf + 0.02, 5);
  put(g, aw.g, 0, 0, 0);
  anims.push(function (t) { aw.val.rotation.x = sin(t * 1.3 + 0.7) * 0.045; });
  /* 二层：拱顶百叶窗 ×2（绿/赭，左窗带木瓶栏阳台）+ 层间腰线 + 阴影带 */
  var w1 = shutterWindow(M, 0.3, 0.32, 0, { slats: 4, archF: true }); put(g, w1, -0.42, 1.0, zf - 0.01);
  var w2 = shutterWindow(M, 0.3, 0.32, 1, { slats: 4 }); put(g, w2, 0.42, 1.0, zf - 0.01);
  var balc = balustradeRun(M, 0.52, 4, M.wood); put(g, balc, -0.42, 0.8, zf + 0.1);
  g.add(box(1.78, 0.05, 0.06, M.stone, 0, 0.755, zf + 0.01));
  g.add(box(1.78, 0.03, 0.04, M.stuccoShd, 0, 0.72, zf + 0.008));
  /* 荷兰弧山墙（阁楼窗 + 顶球）+ 暗陶瓦顶（apex≈1.65） */
  var pg = parapetGable(M, 1.7, 0.16, 0.05, 2); put(g, pg, 0, 1.26, zf + 0.015);
  var roof = tileRoof(M, { w: 1.6, d: 1.0, h: 0.24, over: 0.08, warm: false, finialBalls: true });
  put(g, roof, 0, 1.27, -0.06);
  /* 隅石（长短皮交替 ×4/角） */
  var qi;
  for (qi = 0; qi < 4; qi++) {
    g.add(box(0.1, 0.28, 0.045, (qi % 2) ? M.wallTrim : M.stone, -0.83, 0.26 + qi * 0.28, zf - 0.028));
    g.add(box(0.1, 0.28, 0.045, (qi % 2) ? M.stone : M.wallTrim, 0.83, 0.26 + qi * 0.28, zf - 0.028));
  }
  /* 铸铁路灯（右前，flicker）+ 陶盆红花 ×2 */
  var lp = lampPost(M, 0.56); put(g, lp, 1.02, 0.05, 0.8);
  anims.push(function (t) { M.lampGlow.emissiveIntensity = 0.5 + 0.14 * sin(t * 3.1 + 1.4); });
  var p1 = potMini(M, 1); put(g, p1, -1.0, 0.06, 0.62);
  var p2 = potMini(M, 0.85); put(g, p2, 1.0, 0.06, 0.5);
  /* 窗光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.18 + 0.07 * sin(t * 1.05 + 0.3); });
  return g;
}

/* ---- lv3 大厦：三层三拱骑楼 + 山花 + 平座 + 攒尖瓦顶 + 竖招 + 路灯（h≈2.29） ---- */
function level3(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.5, 2.3));
  var zf = 0.6;
  /* 台基 + 主体（0.10-1.96） */
  g.add(box(2.06, 0.1, 1.16, M.stoneD, 0, 0.05, -0.03));
  g.add(box(1.92, 1.86, 1.04, M.wallF, 0, 1.03, -0.08));
  g.add(box(1.92, 1.86, 0.02, M.wallS, 0, 1.03, -0.61));
  /* 骑楼廊：三拱墙 + 拱券分环 + 石柱 ×3 + 走廊板（0.10-0.78） */
  var arches = [
    { cx: -0.62, w: 0.44, spring: 0.42 },
    { cx: 0, w: 0.44, spring: 0.42 },
    { cx: 0.62, w: 0.44, spring: 0.42 }
  ];
  g.add(archWall(M, 1.86, 0.7, 0.07, arches, M.wallF, zf));
  arches.forEach(function (a) { g.add(archFan(M, a, zf)); });
  g.add(box(1.9, 0.035, 0.03, M.stone, 0, 0.395, zf + 0.015));
  arches.forEach(function (a) {
    var c = columnRound(M, 0.6, 0.036); put(g, c, a.cx, 0.1, 0.66);
  });
  g.add(box(1.98, 0.05, 0.24, M.stoneD, 0, 0.075, 0.64));
  /* 店脸：门 + 柜面 + 货箱 + 果摊 */
  g.add(box(0.38, 0.46, 0.04, M.woodD, -0.62, 0.33, 0.34));
  g.add(box(0.62, 0.05, 0.1, M.wood, 0.05, 0.58, 0.34));
  g.add(box(0.34, 0.2, 0.16, M.woodD, 0.5, 0.2, 0.32));
  var st = marketStall(M, 0.7); put(g, st, -0.05, 0.05, 0.62);
  /* 红白条纹挑棚（逐幅红白交替 + 波浪垂边，摇曳） */
  var aw = awningUnit(M, 1.78, 0.44, M.stripeR, M.stripeW, 0.82, zf + 0.02, 6);
  put(g, aw.g, 0, 0, 0);
  anims.push(function (t) { aw.val.rotation.x = sin(t * 1.35 + 1.1) * 0.045; });
  /* 层间腰线 ×2 + 阴影带 ×2 + 转角隅石 ×8 + 窗间壁柱 ×2 */
  g.add(box(1.98, 0.045, 0.06, M.stone, 0, 0.795, zf + 0.01));
  g.add(box(1.98, 0.045, 0.06, M.stone, 0, 1.29, zf - 0.01));
  g.add(box(1.98, 0.028, 0.04, M.stuccoShd, 0, 0.855, zf + 0.008));
  g.add(box(1.98, 0.028, 0.04, M.stuccoShd, 0, 1.35, zf - 0.012));
  var qi;
  for (qi = 0; qi < 4; qi++) {
    g.add(box(0.09, 0.46, 0.04, (qi % 2) ? M.wallTrim : M.stone, -0.92, 0.32 + qi * 0.46, zf - 0.028));
    g.add(box(0.09, 0.46, 0.04, (qi % 2) ? M.stone : M.wallTrim, 0.92, 0.32 + qi * 0.46, zf - 0.028));
  }
  g.add(box(0.05, 1.0, 0.035, M.stuccoShd, -0.29, 1.5, zf - 0.022));
  g.add(box(0.05, 1.0, 0.035, M.stuccoShd, 0.38, 1.5, zf - 0.022));
  /* 二/三层拱顶百叶窗 ×6（红/赭/青 轮换，逐片板条） */
  var idxs = [[-0.6, 1.13, 2], [0.05, 1.13, 1], [0.68, 1.13, 4],
              [-0.6, 1.63, 3], [0.05, 1.63, 0], [0.68, 1.63, 2]];
  idxs.forEach(function (u) {
    var win = shutterWindow(M, 0.28, 0.3, u[2], { slats: 4 });
    put(g, win, u[0], u[1], zf - 0.015);
  });
  /* 三层中央木瓶栏阳台 + 侧窗台 ×2 */
  var balc = balustradeRun(M, 0.5, 4, M.wood); put(g, balc, 0.05, 1.44, zf + 0.09);
  g.add(box(0.4, 0.045, 0.05, M.stone, -0.6, 1.44, zf + 0.005));
  g.add(box(0.4, 0.045, 0.05, M.stone, 0.68, 1.44, zf + 0.005));
  /* 弧形山花（涡卷 + 筒状饰）+ 屋顶平座（石瓶栏 + 陶罐 ×2）+ 暗陶四坡顶（apex≈2.29） */
  var pg = parapetGable(M, 1.86, 0.24, 0.06, 3); put(g, pg, 0, 1.96, zf + 0.015);
  g.add(box(1.86, 0.06, 1.14, M.stone, 0, 1.99, -0.06));
  var br1 = balustradeRun(M, 1.7, 5, M.stone); put(g, br1, 0, 2.02, 0.46);
  var u1 = urnMini(M, 1.05); put(g, u1, -0.74, 2.02, 0.36);
  var u2 = urnMini(M, 1.05); put(g, u2, 0.74, 2.02, 0.36);
  var roof = pyramidRoof(M, { w: 2.0, d: 1.24, h: 0.24, glaze: false, finial: 'tile' });
  put(g, roof, 0, 1.94, -0.08);
  /* 竖招「北京路」v2（右前，挑臂涡卷托架，摇曳） */
  var sb = signBoard(M, 0.62); put(g, sb.g, 0.88, 1.62, zf + 0.02);
  anims.push(function (t) { sb.bd.rotation.z = sin(t * 1.2 + 0.9) * 0.045; });
  /* 灯笼 ×2（挑棚垂边下，呼吸） */
  var l1 = lanternUnit(M, 0.6, 0); put(g, l1, -0.86, 0.74, 1.0);
  var l2 = lanternUnit(M, 0.6, 0); put(g, l2, 0.86, 0.74, 1.0);
  anims.push(function (t) { M.lantM.emissiveIntensity = 0.5 + 0.18 * sin(t * 2.2 + 0.7); });
  /* 铸铁路灯（右前，玻璃灯罩，flicker）+ 陶盆 */
  var lp = lampPost(M, 0.72); put(g, lp, 1.02, 0.05, 0.78);
  anims.push(function (t) { M.lampGlow.emissiveIntensity = 0.5 + 0.14 * sin(t * 3.1 + 1.4); });
  var p3 = potMini(M, 1); put(g, p3, -1.08, 0.06, 0.68);
  /* 窗光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.18 + 0.07 * sin(t * 1.1 + 0.6); });
  return g;
}

/* ---- lv4 地标：四层四拱骑楼总会 + 白山花盾徽 + 绿琉璃翘檐金冠（h≈2.95） ---- */
function level4(M, anims) {
  var g = grp();
  g.add(padUnit(M, 2.55, 2.4));
  var zf = 0.62;
  /* 台基 + 主体（0.10-2.44） + 阴面 */
  g.add(box(2.26, 0.1, 1.26, M.stoneD, 0, 0.05, -0.04));
  g.add(box(2.12, 2.34, 1.12, M.wallF, 0, 1.27, -0.1));
  g.add(box(2.12, 2.34, 0.02, M.wallS, 0, 1.27, -0.67));
  /* 石阶 + 门楣横匾「北京路」 */
  g.add(box(0.66, 0.06, 0.2, M.stoneD, 0, 0.13, 0.72));
  g.add(box(0.5, 0.125, 0.035, std('#26180c', { map: getTex('plaqueH', texPlaqueH), rough: 0.55, metalness: 0.08 }), 0, 0.95, zf + 0.02));
  /* 骑楼廊：四拱墙 + 拱券分环 + 石柱 ×4 + 走廊板（0.10-0.82） */
  var arches = [
    { cx: -0.78, w: 0.42, spring: 0.46 },
    { cx: -0.26, w: 0.42, spring: 0.46 },
    { cx: 0.26, w: 0.42, spring: 0.46 },
    { cx: 0.78, w: 0.42, spring: 0.46 }
  ];
  g.add(archWall(M, 2.06, 0.74, 0.07, arches, M.wallF, zf));
  arches.forEach(function (a) { g.add(archFan(M, a, zf)); });
  g.add(box(2.1, 0.035, 0.03, M.stone, 0, 0.435, zf + 0.015));
  arches.forEach(function (a) {
    var c = columnRound(M, 0.64, 0.034); put(g, c, a.cx, 0.1, 0.68);
  });
  g.add(box(2.18, 0.05, 0.24, M.stoneD, 0, 0.075, 0.66));
  /* 店脸：门 + 柜面 + 货堆 ×2 + 果摊 + 木箱 */
  g.add(box(0.38, 0.48, 0.04, M.woodD, -0.26, 0.34, 0.38));
  g.add(box(0.7, 0.05, 0.1, M.wood, 0.5, 0.6, 0.38));
  g.add(box(0.3, 0.18, 0.14, M.woodD, 0.24, 0.19, 0.36));
  g.add(box(0.24, 0.14, 0.12, M.woodD, -0.78, 0.17, 0.38));
  var st = marketStall(M, 0.66); put(g, st, 0.62, 0.05, 0.66);
  /* 红挑棚（逐幅 + 波浪垂边，摇曳） */
  var aw = awningUnit(M, 1.96, 0.46, M.canvasR, M.canvasRD, 0.86, zf + 0.02, 6);
  put(g, aw.g, 0, 0, 0);
  anims.push(function (t) { aw.val.rotation.x = sin(t * 1.3 + 1.6) * 0.04; });
  /* 层间腰线 ×3 + 阴影带 + 转角隅石 ×8 + 窗间壁柱 ×2 */
  var bands = [0.835, 1.36, 1.885], bi;
  for (bi = 0; bi < bands.length; bi++) {
    g.add(box(2.18, 0.045, 0.06, M.stone, 0, bands[bi], zf + 0.01));
  }
  g.add(box(2.18, 0.028, 0.04, M.stuccoShd, 0, 0.895, zf + 0.008));
  g.add(box(2.18, 0.028, 0.04, M.stuccoShd, 0, 1.42, zf + 0.008));
  var qi;
  for (qi = 0; qi < 4; qi++) {
    g.add(box(0.09, 0.56, 0.04, (qi % 2) ? M.wallTrim : M.stone, -1.02, 0.3 + qi * 0.56, zf - 0.028));
    g.add(box(0.09, 0.56, 0.04, (qi % 2) ? M.stone : M.wallTrim, 1.02, 0.3 + qi * 0.56, zf - 0.028));
  }
  g.add(box(0.05, 1.34, 0.035, M.stuccoShd, -0.52, 1.73, zf - 0.022));
  g.add(box(0.05, 1.34, 0.035, M.stuccoShd, 0.52, 1.73, zf - 0.022));
  /* 二/三/四层拱顶百叶窗 ×12（五色轮换，逐片板条，板条数逐层递减控预算） */
  var shutColors = [1, 2, 3, 0, 4, 1, 2, 0, 3, 1, 4, 2];
  var slatByFloor = [3, 3, 2];
  for (var fi = 0; fi < 3; fi++) {
    var fy = 1.06 + fi * 0.525;
    for (var an = 0; an < 4; an++) {
      var win = shutterWindow(M, fi === 2 ? 0.26 : 0.28, fi === 2 ? 0.28 : 0.3,
        shutColors[fi * 4 + an], { slats: slatByFloor[fi] });
      put(g, win, -0.78 + an * 0.52, fy + 0.14, zf - 0.015);
    }
  }
  /* 二层中央木瓶栏阳台 + 四层窗下小栏板 ×2（中央两跨） */
  var balc = balustradeRun(M, 0.46, 4, M.wood); put(g, balc, -0.26, 1.08, zf + 0.09);
  g.add(box(0.38, 0.045, 0.04, M.stone, -0.26, 2.28, zf + 0.005));
  g.add(box(0.38, 0.045, 0.04, M.stone, 0.26, 2.28, zf + 0.005));
  /* 平座（退台）：座板 + 石瓶栏跑 ×3 + 陶罐 ×4（h 至 2.485） */
  g.add(box(1.7, 0.09, 1.06, M.stone, 0, 2.44, -0.12));
  var br1 = balustradeRun(M, 1.66, 5, M.stone); put(g, br1, 0, 2.485, zf - 0.06);
  var br2 = balustradeRun(M, 0.98, 3, M.stone); br2.rotation.y = PI / 2; put(g, br2, 0.81, 2.485, -0.12);
  var br3 = balustradeRun(M, 0.98, 3, M.stone); br3.rotation.y = PI / 2; put(g, br3, -0.81, 2.485, -0.12);
  [[-0.79, 0.4], [0.79, 0.4]].forEach(function (q) {
    put(g, urnMini(M, 1.15), q[0], 2.485, q[1]);
  });
  /* 白山花盾徽（前顶，rim + 圆盾 + 涡卷）+ 绿琉璃攒尖翘檐金冠宝顶（apex≈2.93） */
  var pg = parapetGable(M, 1.06, 0.3, 0.06, 4); put(g, pg, 0, 2.44, zf + 0.01);
  var crown = pyramidRoof(M, { w: 1.56, d: 0.98, h: 0.3, glaze: true, finial: 'gold', goldTips: true });
  put(g, crown, 0, 2.485, -0.12);
  /* 金冠 glint 呼吸（finial 材质） */
  anims.push(function (t) { M.glint.emissiveIntensity = 0.15 + 0.12 * sin(t * 1.6 + 0.2); });
  /* 灯笼 ×2（挑棚垂边下）+ 铸铁路灯 + 竖招（终阶全语汇） */
  var l1 = lanternUnit(M, 0.6, 0); put(g, l1, -0.95, 0.78, 1.04);
  var l2 = lanternUnit(M, 0.6, 0); put(g, l2, 0.95, 0.78, 1.04);
  anims.push(function (t) { M.lantM.emissiveIntensity = 0.5 + 0.18 * sin(t * 2.2 + 0.7); });
  var lp = lampPost(M, 0.76); put(g, lp, 1.06, 0.05, 0.82);
  anims.push(function (t) { M.lampGlow.emissiveIntensity = 0.5 + 0.14 * sin(t * 3.1 + 1.4); });
  var sb = signBoard(M, 0.62); put(g, sb.g, -0.92, 1.66, zf + 0.02);
  anims.push(function (t) { sb.bd.rotation.z = sin(t * 1.2 + 2.1) * 0.045; });
  /* 陶盆红花 + 货箱 */
  var p4 = potMini(M, 1); put(g, p4, -1.14, 0.06, 0.72);
  g.add(box(0.2, 0.14, 0.14, M.woodD, 0.86, 0.12, 0.86));
  /* 窗光呼吸 */
  var gm = M.glow;
  anims.push(function (t) { gm.emissiveIntensity = 0.18 + 0.07 * sin(t * 1.05 + 1.1); });
  return g;
}

/* ================= 4. 工厂入口 ================= */
var BUILDERS = [level1, level2, level3, level4];

window.Props3D = window.Props3D || {};
window.Props3D[13] = function (level) {
  var lv = Math.max(1, Math.min(4, level | 0 || 1));
  var M = Mats();
  var anims = [];
  var g = BUILDERS[lv - 1](M, anims);
  g.name = 'prop_13_lv' + lv;
  g.userData.kind = 'property';
  g.userData.propIdx = 13;
  g.userData.level = lv;
  g.userData.region = 'g3';
  g.userData.anim = anims;               /* 契约：group.userData.anim = [fn(t, dt)] */
  return g;
};

})();
