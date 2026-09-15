/* ============================================================
 * V3D —— 大富翁 · 富贵人生 3D 渲染引擎 v3（Three.js r147）
 * ------------------------------------------------------------
 * 全部视觉资产来自 window.Building3D 工厂（buildings3d.js）：
 *   9 栋特殊建筑 / 22×4 地产进化 / 6 位 Q 版角色 / 道具模型。
 * 本文件负责：
 *   - 场景载体（深绿毛毡圆桌 + 木质棋盘 + 边缘马路环 + 40 格奶油地砖）
 *   - 中央区（海报桌面 / 奖池金币 / 机会命运牌堆 / 3D 骰子）
 *   - 角色（逐格跳跃 / 行走摆臂 / 待机呼吸 / 骑乘 / 惊慌）
 *   - 相机（45° 俯瞰 + 轨道控制 + 跟随 + 骰子特写）
 *   - 特效（闪光 / 缴租红光 / 购地横幅 / 升级烟花 / 金钱飘字）
 *   - 拾取（Raycaster 点击格子 → 地契弹窗）
 *   - 与 ui（uix.js）自动桥接：游戏引擎零改动切换到 3D 渲染层
 * 导出接口与 v2 保持兼容，并补齐 ui 层全部渲染接口。
 * ============================================================ */
'use strict';

const V3D = (() => {

  /* ================= 常量 ================= */
  const TILE = 3, COLS = 13, ROWS = 9;
  const TILE_TOP = 1.25;                 // 地砖顶面世界高度
  const CHAR_SCALE = 1.08;               // 角色缩放（工厂高约 1.75 → 1.9）
  const HOME_CAM = { pos: [0, 28.5, 24.5], target: [0, 0.4, 1.0] };
  /* ---------- fit-to-view：HOME 机位距离按容器宽高比动态计算 ----------
   * 棋盘外框 44.6×32.6（半径 22.3/16.3）必须完整入画（每边留 ≥6% 边距，fov=45°）。
   * 只改 HOME_CAM.pos 的距离分量，俯仰方向恒为 normalize(0,28.5,24.5)（49.33°）。
   * 公式：对四角 C、机点 T、t=tan(fov/2)、m=0.94、upY=(0,dir.z,−dir.y)：
   *   D = max_C( (C−T)·dir + max(|C.x−T.x|/(m·aspect·t), |(C−T)·upY|/(m·t)) )
   *   HOME_CAM.pos = T + dir·D                                                */
  const BOARD_HALF_W = 22.3, BOARD_HALF_D = 16.3;
  /* ---------- 边缘马路环（模块E · refs/scene_road_ring.png 转译）----------
   * 框带实测：tile 外沿 ±19.47/±13.47（tile 盒 2.94，半 1.47）；木框顶面 y=1.25，
   * 内沿 ±19.7/±13.7、外沿 ±21.4/±15.4；框顶金线 trim 顶面 y=1.295；plinth 外沿 ±22.3/±16.3（顶 y=0.72）。
   * 环中心线 = tile 中心线向外 ROAD_OFF=2.435 → 半宽/半深 (±20.435, ±14.435)；
   * 路面总宽 ROAD_W=1.88（沥青 1.64 + 两侧路缘 0.12）：内沿 19.495/13.495（离砖 0.025），
   * 外沿 21.375/15.375（离框外沿 0.025）——完整落在框带顶面上（不压地砖 / 不悬空）。
   * 路面 y=ROAD_TOP_Y=1.30 微抬：高于金线 trim（1.295）与地砖顶（1.25），杜绝 z-fight/穿模。
   * 圆角（中心线）半径 ROAD_RC=1.0：内缘半径 0.06，对角内切 0.06·(1−√½)≈0.018 < 0.025 仍不与砖相交。 */
  const ROAD_OFF = 2.435, ROAD_W = 1.88, ROAD_CURB = 0.12, ROAD_RC = 1.0;
  const ROAD_A = 18 + ROAD_OFF, ROAD_B = 12 + ROAD_OFF;
  const ROAD_TOP_Y = TILE_TOP + 0.05;    // 沥青路面世界高度（角色/警车行走层）
  /* 自由视角参数（两种模式都支持 360° 拖拽 + 自由缩放）：
   *   global：绕棋盘中心 yaw 无限制，pitch 8°–85°（避免贴地/顶视穿帮），缩放 14–130
   *   follow：绕被跟随角色 yaw/pitch 自由，缩放 2.6–60（近距贴身），相机最低高度 3.3（> 沿途建筑最高 ~3.0） */
  const CAM_MIN_DIST = 14, CAM_MAX_DIST = 130;      /* global 缩放范围（与轨道控制 min/maxDistance 一致） */
  const CAM_MIN_POLAR = 8 * Math.PI / 180, CAM_MAX_POLAR = 85 * Math.PI / 180;
  const FOLLOW_MIN_DIST = 2.6, FOLLOW_MAX_DIST = 60;
  const FOLLOW_MIN_Y = 3.3;          /* 跟随/骑乘时相机最低高度，杜绝切进建筑内部 */
  const ORBIT_RESUME_MS = 4000;      /* 跟随模式用户停手 4s 后平滑回到标准跟随机位 */
  const HOME_DIR = new THREE.Vector3(0, 28.5, 24.5).normalize();
  const CAM_UPY = new THREE.Vector3(0, HOME_DIR.z, -HOME_DIR.y);   /* lookAt 竖直基向量 */
  function homeDistFor(aspect) {
    if (!isFinite(aspect) || aspect <= 0) aspect = 16 / 9;
    const fov = (camera && camera.fov) || 45;
    const t = Math.tan(fov / 2 * Math.PI / 180);
    /* NDC 上限 0.94（每边留 ≥6% 边距）再收 0.5% 浮点余量，保证投影严格 < 0.94 */
    const MARGIN = 0.935;
    const tx = HOME_CAM.target[0], ty = HOME_CAM.target[1], tz = HOME_CAM.target[2];
    let need = 0;
    for (let sx = -1; sx <= 1; sx += 2) for (let sz = -1; sz <= 1; sz += 2) {
      const vx = BOARD_HALF_W * sx - tx, vy = -ty, vz = BOARD_HALF_D * sz - tz;
      const d0 = vx * HOME_DIR.x + vy * HOME_DIR.y + vz * HOME_DIR.z;   /* depth(C) = D − d0 */
      const yC = vx * CAM_UPY.x + vy * CAM_UPY.y + vz * CAM_UPY.z;      /* 与 D 无关（基向量⊥dir） */
      need = Math.max(need, d0 + Math.max(
        Math.abs(vx) / (MARGIN * aspect * t),      /* 水平约束（右基向量 = (1,0,0)） */
        Math.abs(yC) / (MARGIN * t)));             /* 竖直约束 */
    }
    return Math.min(CAM_MAX_DIST, Math.max(CAM_MIN_DIST, need));
  }
  function refreshHomeCam() {
    const aspect = (camera && camera.aspect) ? camera.aspect : (16 / 9);
    const D = homeDistFor(aspect);
    HOME_CAM.pos[0] = HOME_CAM.target[0] + HOME_DIR.x * D;
    HOME_CAM.pos[1] = HOME_CAM.target[1] + HOME_DIR.y * D;
    HOME_CAM.pos[2] = HOME_CAM.target[2] + HOME_DIR.z * D;
  }
  /* 双视角模式：'global' 固定全局机位（默认，杜绝漂移） / 'follow' 低机位跟随行动角色走棋盘 */
  let camMode = 'global';
  let camBtn = null;
  const camFw1 = new THREE.Vector3();
  const camFw2 = new THREE.Vector3();
  const CAM_UP2 = new THREE.Vector3();
  function setCamMode(m) {
    camMode = (m === 'follow') ? 'follow' : 'global';
    if (camBtn) camBtn.textContent = camMode === 'global' ? '🎥 全局视角' : '🚶 跟随视角';
    try { document.body.classList.toggle('v3d-follow', camMode === 'follow'); } catch (e) { /* ignore */ }
    applyOrbitLimits();
    if (camMode === 'global') focusDefault(0.9);
    else { userOrbiting = false; markUserOrbit(); }
  }
  const DICE_HOME = { x: 5.2, z: 6.2 };  // 骰子落位（中央毡面前侧）
  const FW_COLORS = [0xffd76a, 0xff6b6b, 0x7ce8a6, 0x9fd8ff, 0xe79bff, 0xf0a818];

  /* ================= 状态 ================= */
  let renderer = null, scene = null, camera = null, controls = null;
  let container = null, clock = null;
  let running = false, rafId = 0, ready = false;
  let staticRoot = null, dynRoot = null, tokenRoot = null, fxRoot = null;
  let worldT = 0, camLocks = 0;

  const tileMeshes = [];        // i -> pickable tile box
  const tileTops = [];          // i -> {canvas,ctx,texture,mat}
  const buildings = [];         // i -> {group, level} | null
  const flags = [];             // i -> {group, pivot, owner} | null
  const specials = {};          // i -> group
  const tokens = new Map();     // playerIdx -> rig
  const rides = new Map();      // playerIdx -> {group, kind, mountY}
  const blockMeshes = new Map();
  const flashList = [];         // {mat, t, dur, color, peak}
  const anims = [];             // tween 队列
  const pendingTiles = new Set();

  let dice = null, diceRolling = false;
  let activeRing = null, activeIdx = -1;
  let luckyRing = null, luckyIdx = -2;
  let potPile = null, potScaleCur = 1, potScaleTgt = 1;
  let fountainTile = -1;

  let onTileClickExternal = null;
  let downPos = null, hoverIdx = -1, prevHoverIdx = -1, lastHoverCast = 0;
  let followIdx = -1, lastMoveT = 0, userOrbiting = false;
  let lastUserOrbitT = 0;              // 最近一次用户拖拽/滚轮时刻（跟随模式 4s 无操作回归计时）
  let curPhase = '';

  /* ---------- 用户接管相机（两种模式统一入口） ----------
   * beginUserOrbit：从相机现状续接球坐标（MiniOrbit 的 cur/des 在跟随驱动期间已过期，
   * 不同步会把相机顶回旧机位——正是"拖拽弹回预设位"的根因），随后用户增量即可持续生效 */
  function markUserOrbit() { lastUserOrbitT = performance.now(); }
  function beginUserOrbit() {
    userOrbiting = true;
    markUserOrbit();
    if (controls && typeof controls.syncFromCamera === 'function') controls.syncFromCamera();
  }
  /* 按模式套用轨道距离范围（global 14–130 / follow 2.6–60） */
  function applyOrbitLimits() {
    if (!controls) return;
    const follow = camMode === 'follow';
    controls.minDistance = follow ? FOLLOW_MIN_DIST : CAM_MIN_DIST;
    controls.maxDistance = follow ? FOLLOW_MAX_DIST : CAM_MAX_DIST;
  }

  /* 键盘辅助镜头（WASD/方向键）：global=平移推拉镜头；follow=环绕+缩放。
   * 弹窗/拍卖厅/过场期间禁用；与拖拽接管（userOrbiting）互不冲突。 */
  const v3dKeys = {};
  function applyKeyboardCam(dt) {
    if (!controls || camLocks > 0) return;
    try {
      /* 只拦“可见”的覆盖层：#cutscene/#reconnect 结束后仅剩隐藏残骸时不该禁掉键位（用户报告键位全灭的防御性修复） */
      if (document.querySelector('#auction-hall:not(.ah-closing),.modal-mask.show,#cutscene.show,#reconnect.show')) return;
    } catch (e) { /* ignore */ }
    const up = v3dKeys.KeyW || v3dKeys.ArrowUp, down = v3dKeys.KeyS || v3dKeys.ArrowDown;
    const left = v3dKeys.KeyA || v3dKeys.ArrowLeft, right = v3dKeys.KeyD || v3dKeys.ArrowRight;
    if (!up && !down && !left && !right) return;
    const dx = (right ? 1 : 0) - (left ? 1 : 0);
    const dz = (up ? 1 : 0) - (down ? 1 : 0);
    if (camMode === 'follow') {
      if (followIdx < 0) return;
      const yaw = dx * 1.6 * dt, pit = dz * 1.1 * dt;
      controls.orbitDrag(-yaw, pit);
      userOrbiting = true; markUserOrbit();
    } else {
      const dist = camera.position.distanceTo(controls.target);
      const spd = Math.min(60, Math.max(14, dist * 0.75)) * dt;
      const fwd = new THREE.Vector3(controls.target.x - camera.position.x, 0, controls.target.z - camera.position.z);
      if (fwd.lengthSq() < 1e-6) fwd.set(0, 0, -1);
      fwd.normalize();
      const rgt = new THREE.Vector3(-fwd.z, 0, fwd.x);
      const mv = new THREE.Vector3().addScaledVector(fwd, dz * spd).addScaledVector(rgt, dx * spd);
      const nx = controls.target.x + mv.x, nz = controls.target.z + mv.z;
      if (Math.abs(nx) > 46 || Math.abs(nz) > 34) return;   /* 别推出桌面太远 */
      controls.target.x = nx; controls.target.z = nz;
      camera.position.x += mv.x; camera.position.z += mv.z;
      camera.lookAt(controls.target);
      userOrbiting = true; markUserOrbit();
    }
  }
  /* ================= 基础工具 ================= */
  function worldOf(i) {
    const g = GRID_POS(i);
    return { x: (g.c - (COLS + 1) / 2) * TILE, z: (g.r - (ROWS + 1) / 2) * TILE };
  }
  function outwardOf(i) {
    const g = GRID_POS(i);
    if (g.side === 'bottom') return { x: 0, z: 1 };
    if (g.side === 'top') return { x: 0, z: -1 };
    if (g.side === 'left') return { x: -1, z: 0 };
    if (g.side === 'right') return { x: 1, z: 0 };
    const w = worldOf(i), l = Math.hypot(w.x, w.z) || 1;
    return { x: w.x / l, z: w.z / l };
  }
  /* 格 i 在马路环中心线上的行走点（模块E）：直段 = 格中心沿外法线投影到环线；
   * 拐角格 = 45° 圆角弧点；附带环线切向（多人沿切向排开仍贴合环线）。 */
  function roadPointOf(i) {
    const g = GRID_POS(i), w = worldOf(i);
    const sw = ROAD_A - ROAD_RC, sd = ROAD_B - ROAD_RC;
    const S2 = Math.SQRT1_2;
    const cx = Math.max(-sw, Math.min(sw, w.x)), cz = Math.max(-sd, Math.min(sd, w.z));
    if (g.side === 'bottom') return { x: cx, z: ROAD_B, tx: 1, tz: 0 };
    if (g.side === 'top') return { x: cx, z: -ROAD_B, tx: 1, tz: 0 };
    if (g.side === 'left') return { x: -ROAD_A, z: cz, tx: 0, tz: 1 };
    if (g.side === 'right') return { x: ROAD_A, z: cz, tx: 0, tz: 1 };
    const sx = w.x >= 0 ? 1 : -1, sz = w.z >= 0 ? 1 : -1;
    return { x: sx * (sw + ROAD_RC * S2), z: sz * (sd + ROAD_RC * S2), tx: -sz * S2, tz: sx * S2 };
  }
  function standOf(i, k, n) {
    /* 角色站位：马路环中心线（模块E）——角色走在路面上，杜绝与建筑/地砖穿模；
     * 多人沿环线切向排开（沿切向偏移不偏离环线） */
    const rp = roadPointOf(i), o = outwardOf(i);
    const off = n > 1 ? (k - (n - 1) / 2) * 1.12 : 0;   /* ≥最宽角色 1.08（审计 P1：0.66 会人叠人） */
    return {
      x: rp.x + rp.tx * off,
      z: rp.z + rp.tz * off,
      rot: Math.atan2(o.x, o.z),
    };
  }
  function sideRotY(i) {
    /* 全部吸附四向：入口统一朝棋盘外（朝玩家一侧）；拐角就近贴上下边，不再 45° 斜转 */
    const g = GRID_POS(i), w = worldOf(i);
    if (g.side === 'bottom') return 0;
    if (g.side === 'top') return Math.PI;
    if (g.side === 'left') return -Math.PI / 2;
    if (g.side === 'right') return Math.PI / 2;
    return (w.z > 0) ? 0 : Math.PI;   /* corner */
  }
  /* 个别特殊工厂前脸若建在 -z，可在此按格号追加 π 翻正（截图校准用） */
  const SPECIAL_YAW = { 11: 0, 12: 0, 15: 0, 20: 0, 22: 0, 25: 0, 29: 0, 32: 0, 37: 0 };
  function lerp(a, b, k) { return a + (b - a) * k; }
  function easeInOut(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function spd() { return (typeof G !== 'undefined' && G && G.speed) ? G.speed : 1; }
  function tween(dur, cb) {
    return new Promise(res => { anims.push({ t: 0, dur: Math.max(0.01, dur), cb, res }); });
  }
  /* 与 buildings3d 调色一致的材质（sRGB→Linear） */
  function matStd(hex, o) {
    o = o || {};
    const m = new THREE.MeshStandardMaterial({
      color: new THREE.Color(hex).convertSRGBToLinear(),
      roughness: o.rough !== undefined ? o.rough : 0.85,
      metalness: o.metal || 0,
    });
    if (o.emissive) { m.emissive = new THREE.Color(o.emissive).convertSRGBToLinear(); m.emissiveIntensity = o.ei || 0.5; }
    if (o.opacity !== undefined) { m.transparent = true; m.opacity = o.opacity; }
    return m;
  }
  function canvasTexture(cv) {
    const tex = new THREE.CanvasTexture(cv);
    tex.encoding = THREE.sRGBEncoding;
    if (renderer && renderer.capabilities && renderer.capabilities.getMaxAnisotropy) {
      tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    }
    return tex;
  }
  function disposeGroup(g) {
    g.traverse(o => {
      if (o.isMesh && o.geometry) { try { o.geometry.dispose(); } catch (e) { /* ignore */ } }
      if (o.isSprite && o.material && o.material.map) { try { o.material.map.dispose(); } catch (e) { /* ignore */ }
        try { o.material.dispose(); } catch (e) { /* ignore */ } }
    });
    if (g.parent) g.parent.remove(g);
  }
  /* 深释放（几何 + 材质 + 贴图）：只用于「资产完全私有」的对象——Char3D 精修角色每次实例化都新建材质与 2~4 张 canvas 贴图
   * （boss：衬衫/马甲/马甲粗糙度/胸针），此前 disposeGroup 只释放几何 → 每次重开泄漏 ~10 张纹理（浏览器 E2E 实测 +9~10/局）。
   * 不能用于建筑/骑乘车辆/buildings3d 回退角色：它们的工厂有模块级材质或纹理缓存（police_car _texCache、buildings3d _matCache），
   * 释放后下一次实例化会拿到已销毁的贴图。 */
  const TEX_SLOTS = ['map', 'emissiveMap', 'roughnessMap', 'metalnessMap', 'normalMap', 'alphaMap', 'bumpMap', 'aoMap', 'lightMap', 'specularMap'];
  function disposeDeep(g) {
    if (!g) return;
    const mats = new Set();
    g.traverse(o => {
      if (o.isMesh && o.geometry) { try { o.geometry.dispose(); } catch (e) { /* ignore */ } }
      if ((o.isMesh || o.isSprite) && o.material) {
        if (Array.isArray(o.material)) o.material.forEach(m => mats.add(m)); else mats.add(o.material);
      }
    });
    mats.forEach(m => {
      TEX_SLOTS.forEach(k => { const t = m[k]; if (t && t.isTexture) { try { t.dispose(); } catch (e) { /* ignore */ } } });
      try { m.dispose(); } catch (e) { /* ignore */ }
    });
    if (g.parent) g.parent.remove(g);
  }
  function disposeRig(rig) {
    if (!rig || !rig.group) return;
    if (rig.privateAssets) disposeDeep(rig.group); else disposeGroup(rig.group);
  }
  function shadowDirty() {
    if (renderer && renderer.shadowMap) renderer.shadowMap.needsUpdate = true;
  }

  /* ---------- 轻量轨道控制（js/lib/OrbitControls 未被 index.html 引入时的兜底） ---------- */
  function MiniOrbit(cam, dom) {
    const self = this;
    this.target = new THREE.Vector3(0, 0.4, 0);
    this.enabled = true;
    this.minDistance = CAM_MIN_DIST; this.maxDistance = CAM_MAX_DIST;
    this.minPolarAngle = CAM_MIN_POLAR; this.maxPolarAngle = CAM_MAX_POLAR;
    this.dampingFactor = 0.09;
    let cur = { r: 50, phi: 0.78, theta: 0 };
    let des = { r: 50, phi: 0.78, theta: 0 };
    let dragging = false, lx = 0, ly = 0;
    const lastPos = new THREE.Vector3();

    this.syncFromCamera = function () {
      const off = cam.position.clone().sub(self.target);
      const r = Math.max(0.001, off.length());
      const phi = Math.acos(Math.min(1, Math.max(-1, off.y / r)));
      const theta = Math.atan2(off.x, off.z);
      cur = { r, phi, theta }; des = { r, phi, theta };
    };
    /* 测试/程序化自由视角统一接口：拖拽增量（弧度）+ 缩放倍率 */
    this.orbitDrag = function (dTheta, dPhi) {
      des.theta -= dTheta;
      des.phi = Math.min(self.maxPolarAngle, Math.max(self.minPolarAngle, des.phi - dPhi));
    };
    this.orbitZoom = function (f) {
      des.r = Math.min(self.maxDistance, Math.max(self.minDistance, des.r * f));
    };
    this.update = function (dt) {
      if (!self.enabled) return;
      /* 相机被程序外部移动（follow 跟随 lerp / 运镜收尾）时，从相机现状续接球坐标，
       * 避免旧 cur/des 每帧把相机拽回旧机位 —— 与 OrbitControls 每帧读相机的语义一致 */
      if (!dragging && lastPos.lengthSq() > 0 && cam.position.distanceToSquared(lastPos) > 1e-8) {
        self.syncFromCamera();
      }
      const k = 1 - Math.pow(1 - self.dampingFactor, Math.min(3, (dt || 0.016) * 60));
      cur.r += (des.r - cur.r) * k;
      cur.phi += (des.phi - cur.phi) * k;
      cur.theta += (des.theta - cur.theta) * k;
      const phi = Math.min(self.maxPolarAngle, Math.max(self.minPolarAngle, cur.phi));
      const r = Math.min(self.maxDistance, Math.max(self.minDistance, cur.r));
      cam.position.set(
        self.target.x + r * Math.sin(phi) * Math.sin(cur.theta),
        self.target.y + r * Math.cos(phi),
        self.target.z + r * Math.sin(phi) * Math.cos(cur.theta));
      cam.lookAt(self.target);
      lastPos.copy(cam.position);
    };
    dom.addEventListener('pointerdown', e => { if (e.button === 0) { dragging = true; lx = e.clientX; ly = e.clientY; } });
    window.addEventListener('pointerup', () => { dragging = false; });
    window.addEventListener('pointermove', e => {
      if (!dragging || !self.enabled) return;
      des.theta -= (e.clientX - lx) * 0.0052;
      des.phi = Math.min(self.maxPolarAngle, Math.max(self.minPolarAngle, des.phi - (e.clientY - ly) * 0.0038));
      lx = e.clientX; ly = e.clientY;
    });
    dom.addEventListener('wheel', e => {
      e.preventDefault();
      des.r = Math.min(self.maxDistance, Math.max(self.minDistance, des.r * (1 + e.deltaY * 0.0011)));
    }, { passive: false });
  }

  function makeControls() {
    if (typeof THREE.OrbitControls === 'function') {
      const c = new THREE.OrbitControls(camera, renderer.domElement);
      /* damping 关闭：带 damping 时用户拖拽停止后 sphericalDelta 指数衰减但永不清零，
       * 会造成 global 机位残余漂移；关闭后松手即停，运镜收尾靠 syncFromCamera 续接 */
      c.enableDamping = false;
      c.minDistance = CAM_MIN_DIST; c.maxDistance = CAM_MAX_DIST;
      c.minPolarAngle = CAM_MIN_POLAR; c.maxPolarAngle = CAM_MAX_POLAR;
      c.target.set(HOME_CAM.target[0], HOME_CAM.target[1], HOME_CAM.target[2]);
      c.syncFromCamera = function () { /* OrbitControls.update 每帧从相机反推，无需同步 */ };
      /* 与 MiniOrbit 一致的程序化自由视角接口（绕 target 直接转相机，update 每帧反推不冲突） */
      c.orbitDrag = function (dTheta, dPhi) {
        const sph = new THREE.Spherical().setFromVector3(camera.position.clone().sub(c.target));
        sph.theta -= dTheta;
        sph.phi = Math.min(c.maxPolarAngle, Math.max(c.minPolarAngle, sph.phi - dPhi));
        camera.position.copy(c.target).add(new THREE.Vector3().setFromSpherical(sph));
        camera.lookAt(c.target);
      };
      c.orbitZoom = function (f) {
        const off = camera.position.clone().sub(c.target);
        off.multiplyScalar(Math.min(c.maxDistance, Math.max(c.minDistance, off.length() * f)) / off.length());
        camera.position.copy(c.target).add(off);
        camera.lookAt(c.target);
      };
      return c;
    }
    return new MiniOrbit(camera, renderer.domElement);
  }

  /* ================= 初始化渲染器 ================= */
  function init(boardWrapEl) {
    container = boardWrapEl || document.getElementById('board-wrap');
    if (!container || typeof THREE === 'undefined') return false;
    if (!renderer) {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.shadowMap.autoUpdate = false;      // 静态场景：仅运动时刷新阴影
      renderer.outputEncoding = THREE.sRGBEncoding;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.06;
      const el = renderer.domElement;
      el.id = 'gl-canvas';
      el.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;z-index:10;display:block;touch-action:none;';
      container.insertBefore(el, container.firstChild);
      bindPointer(el);
    /* 键盘辅助视角：WASD/方向键（模块复盘） */
    window.addEventListener('keydown', e => {
      const t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const c = e.code;
      if (c === 'KeyW' || c === 'ArrowUp' || c === 'KeyA' || c === 'ArrowLeft' ||
          c === 'KeyS' || c === 'ArrowDown' || c === 'KeyD' || c === 'ArrowRight') {
        if (!document.body.classList.contains('v3d-on')) return;
        v3dKeys[c] = true;
        if (c.indexOf('Arrow') === 0) e.preventDefault();
      }
    });
    window.addEventListener('keyup', e => { v3dKeys[e.code] = false; });
    window.addEventListener('blur', () => { for (const k in v3dKeys) v3dKeys[k] = false; });
      window.addEventListener('resize', resize);
    }
    return true;
  }

  function show(v) {
    running = v;
    if (v) startLoop();
    else if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    if (renderer) renderer.domElement.style.display = v ? 'block' : 'none';
    if (v) resize();
  }

  /* ================= 场景静态构建（一次） ================= */
  function buildStaticScene() {
    if (scene) return;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x081511);
    scene.fog = new THREE.Fog(0x081511, 95, 215);

    camera = camera || new THREE.PerspectiveCamera(45, 16 / 9, 0.3, 340);
    camera.position.set(30, 15, 52);
    camera.lookAt(0, 0, 0);

    controls = makeControls();
    refreshHomeCam();   /* 按初始宽高比算出 fit 机位，flyover/focusDefault/nofly 全部消费该值 */

    staticRoot = new THREE.Group(); scene.add(staticRoot);
    dynRoot = new THREE.Group(); scene.add(dynRoot);
    tokenRoot = new THREE.Group(); scene.add(tokenRoot);
    fxRoot = new THREE.Group(); scene.add(fxRoot);

    /* --- 灯光 --- */
    scene.add(new THREE.HemisphereLight(0xf2f7ea, 0x0d211a, 0.52));
    scene.add(new THREE.AmbientLight(0xffffff, 0.2));
    const sun = new THREE.DirectionalLight(0xfff1d6, 1.12);
    sun.position.set(26, 44, 18);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -38; sun.shadow.camera.right = 38;
    sun.shadow.camera.top = 38; sun.shadow.camera.bottom = -38;
    sun.shadow.camera.near = 8; sun.shadow.camera.far = 120;
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xbfd8ff, 0.22);
    fill.position.set(-26, 20, -16);
    scene.add(fill);

    buildTable();
    buildBoardFrame();
    buildRoadRing();
    buildTiles();
    buildCenterFelt();
    buildCenterDecor();
    buildDice();
    buildTableScatter();
    buildActiveRing();
    buildLuckyRing();

    /* 书房环境接管（assets/models/specials3d/environment.js，可选增强：移除毛毡圆桌与散件，搭建书房+书桌场景） */
    try {
      if (window.Environment3D && typeof window.Environment3D.replace === 'function') {
        window.Environment3D.replace({ THREE: THREE, scene: scene, staticRoot: staticRoot });
      }
    } catch (e) { window.__errs && window.__errs.push('env3d: ' + e.message); }
  }

  /* ---------- 深绿毛毡圆桌（半径 70） ---------- */
  function buildTable() {
    const felt = new THREE.Mesh(
      new THREE.CircleGeometry(70, 72),
      matStd('#12503a', { rough: 0.97 }));
    felt.rotation.x = -Math.PI / 2;
    felt.receiveShadow = true;
    staticRoot.add(felt);

    const rim = new THREE.Mesh(
      new THREE.RingGeometry(66.5, 70, 72),
      matStd('#0c3a29', { rough: 0.96 }));
    rim.rotation.x = -Math.PI / 2;
    rim.position.y = 0.012;
    rim.receiveShadow = true;
    staticRoot.add(rim);
  }

  /* ---------- 木质棋盘框架 + 深棕底座 ---------- */
  function buildBoardFrame() {
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(44.6, 0.72, 32.6),
      matStd('#4e2f13', { rough: 0.82 }));
    plinth.position.y = 0.36;
    plinth.castShadow = plinth.receiveShadow = true;
    staticRoot.add(plinth);

    const wood = matStd('#6b431f', { rough: 0.68 });
    const mk = (w, h, d, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wood);
      m.position.set(x, y, z);
      m.castShadow = m.receiveShadow = true;
      staticRoot.add(m);
      return m;
    };
    /* 框架厚 0.6：顶面与地砖齐平 (y 0.65 → 1.25) */
    mk(42.8, 0.6, 1.7, 0, 0.95, -14.55);
    mk(42.8, 0.6, 1.7, 0, 0.95, 14.55);
    mk(1.7, 0.6, 30.8, -20.55, 0.95, 0);
    mk(1.7, 0.6, 30.8, 20.55, 0.95, 0);
    /* 框顶金线 */
    const gold = matStd('#c9a04c', { rough: 0.35, metal: 0.65 });
    const trim = (w, d, x, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), gold);
      m.position.set(x, 1.27, z);
      staticRoot.add(m);
    };
    trim(42.8, 0.14, 0, -13.76); trim(42.8, 0.14, 0, 13.76);
    trim(0.14, 27.4, -19.76, 0); trim(0.14, 27.4, 19.76, 0);
  }

  /* ================= 边缘马路环（模块E · 圆角矩形沥青环道） =================
   * 参考图转译：暖深灰沥青 + 白色虚线中心线 + 两侧米色分段路缘 + 四角斑马线 + 井盖。
   * 全部手搓 BufferGeometry（环带缝合/quad 合批）+ 共享材质，共 8 个 mesh（≪60）。
   * 无逐帧动画（井盖保持静止，克制处理）。 */
  let roadRing = null;

  /* 圆角矩形偏移环采样：off 为相对环中心线的外偏（内负外正）。
   * 偏移环仍是圆角矩形：半宽/半深 ±off，圆角半径 RC±off（内缘钳 ≥0.02 防退化）。
   * 相同分段数的两圈按点缝合即可得到等宽环带（俯视顺时针）。 */
  function roadLoopPts(off, nStraight, nArc) {
    const hw = ROAD_A + off, hd = ROAD_B + off;
    const r = Math.max(0.02, ROAD_RC + off);
    const sx = hw - r, sz = hd - r;
    const pts = [];
    const seg = (x0, z0, x1, z1) => {
      for (let k = 1; k <= nStraight; k++) pts.push({ x: lerp(x0, x1, k / nStraight), z: lerp(z0, z1, k / nStraight) });
    };
    const arc = (cx, cz, a0, a1) => {
      for (let k = 1; k <= nArc; k++) {
        const a = lerp(a0, a1, k / nArc);
        pts.push({ x: cx + Math.cos(a) * r, z: cz + Math.sin(a) * r });
      }
    };
    seg(-sx, hd, sx, hd);                 /* 底边 −x→+x */
    arc(sx, sz, Math.PI / 2, 0);          /* 右下角 */
    seg(hw, sz, hw, -sz);                 /* 右边 +z→−z */
    arc(sx, -sz, 0, -Math.PI / 2);        /* 右上角 */
    seg(sx, -hd, -sx, -hd);               /* 顶边 +x→−x */
    arc(-sx, -sz, -Math.PI / 2, -Math.PI);/* 左上角 */
    seg(-hw, -sz, -hw, sz);               /* 左边 −z→+z */
    arc(-sx, sz, Math.PI, Math.PI / 2);   /* 左下角 */
    return pts;
  }

  /* [offA,offB] 外偏区间的环带（封闭三角带），u=弧长/uPeriod 供贴图沿环重复 */
  function roadBandGeometry(offA, offB, y, uPeriod) {
    const la = roadLoopPts(offA, 30, 12), lb = roadLoopPts(offB, 30, 12);
    const n = la.length;
    const pos = new Float32Array(n * 6), nor = new Float32Array(n * 6);
    const uv = new Float32Array(n * 4), idx = [];
    let acc = 0;
    for (let k = 0; k < n; k++) {
      if (k) acc += Math.hypot(la[k].x - la[k - 1].x, la[k].z - la[k - 1].z);
      pos.set([la[k].x, y, la[k].z], k * 6);
      pos.set([lb[k].x, y, lb[k].z], k * 6 + 3);
      nor.set([0, 1, 0], k * 6); nor.set([0, 1, 0], k * 6 + 3);
      uv.set([acc / uPeriod, 0], k * 4); uv.set([acc / uPeriod, 1], k * 4 + 2);
    }
    for (let k = 0; k < n; k++) {
      const a = k * 2, b = ((k + 1) % n) * 2;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  }

  /* ---- 环中心线弧长参数化（行走插值沿环线 · 四角圆角过渡的数据基础） ---- */
  const RING_WALK = (() => {
    const pts = roadLoopPts(0, 300, 48);
    const n = pts.length;
    const xs = new Float64Array(n), zs = new Float64Array(n), S = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      xs[k] = pts[k].x; zs[k] = pts[k].z;
      if (k) S[k] = S[k - 1] + Math.hypot(xs[k] - xs[k - 1], zs[k] - zs[k - 1]);
    }
    const L = S[n - 1] + Math.hypot(xs[0] - xs[n - 1], zs[0] - zs[n - 1]);
    return { xs, zs, S, n, L };
  })();
  function ringPointAt(s) {
    const W = RING_WALK;
    s = ((s % W.L) + W.L) % W.L;
    let lo = 1, hi = W.n - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (W.S[mid] < s) lo = mid + 1; else hi = mid; }
    const t = (s - W.S[lo - 1]) / Math.max(1e-9, W.S[lo] - W.S[lo - 1]);
    return { x: lerp(W.xs[lo - 1], W.xs[lo], t), z: lerp(W.zs[lo - 1], W.zs[lo], t) };
  }
  function nearestRingS(x, z) {
    const W = RING_WALK;
    let best = 0, bd = Infinity;
    const scan = k => {
      const d = (W.xs[k] - x) * (W.xs[k] - x) + (W.zs[k] - z) * (W.zs[k] - z);
      if (d < bd) { bd = d; best = k; }
    };
    for (let k = 0; k < W.n; k += 4) scan(k);
    for (let k = Math.max(0, best - 4); k <= Math.min(W.n - 1, best + 4); k++) scan(k);
    return W.S[best];
  }
  /* 环上 A→B 的行走折线（自动取短弧方向）：端点保持原值，中途按 ~0.75 步长采样
   * （直段采样共线 → 折线退化为直线，与原逐格直线跳跃完全一致；跨四角时走圆角弧） */
  function ringPath(ax, az, bx, bz) {
    const sa = nearestRingS(ax, az), sb = nearestRingS(bx, bz);
    let d = sb - sa;
    if (d > RING_WALK.L / 2) d -= RING_WALK.L;
    if (d < -RING_WALK.L / 2) d += RING_WALK.L;
    const steps = Math.max(1, Math.ceil(Math.abs(d) / 0.75));
    const pts = [{ x: ax, z: az }];
    for (let k = 1; k < steps; k++) pts.push(ringPointAt(sa + d * k / steps));
    pts.push({ x: bx, z: bz });
    return pts;
  }

  /* 四角斑马线中心的弧长位置（沿环序：底边直段→右下角→右边→右上角→…累加），
   * 供斑马线定位与中心虚线避让 */
  const ROAD_CORNER_MIDS = (() => {
    const sw = 2 * (ROAD_A - ROAD_RC), sd = 2 * (ROAD_B - ROAD_RC), arc = Math.PI * ROAD_RC / 2;
    const mids = [];
    let s = 0;
    for (let k = 0; k < 4; k++) { s += (k % 2 === 0 ? sw : sd) + arc; mids.push(s - arc / 2); }
    return mids;
  })();

  function buildRoadRing() {
    if (roadRing) return;
    roadRing = new THREE.Group();
    roadRing.name = 'roadRing';
    roadRing.userData.roadRing = true;
    const asphaltHalf = ROAD_W / 2 - ROAD_CURB;      // 0.82 沥青半宽
    const curbHalf = ROAD_W / 2;                     // 0.94 路缘外沿
    const paintY = ROAD_TOP_Y + 0.006;

    /* 沥青路面（暖深灰 #4a4a4f 系 + 噪点纹理，粗糙 0.95） */
    const aCv = document.createElement('canvas');
    aCv.width = aCv.height = 128;
    const ac = aCv.getContext('2d');
    ac.fillStyle = '#4a4a4f'; ac.fillRect(0, 0, 128, 128);
    for (let k = 0; k < 850; k++) {
      const v = 56 + Math.floor(Math.random() * 30);
      ac.fillStyle = 'rgba(' + v + ',' + v + ',' + (v + 4) + ',' + (0.10 + Math.random() * 0.22).toFixed(2) + ')';
      ac.fillRect(Math.random() * 128, Math.random() * 128, 1.5, 1.5);
    }
    const aTex = canvasTexture(aCv);
    aTex.wrapS = aTex.wrapT = THREE.RepeatWrapping;
    const asphalt = new THREE.Mesh(
      roadBandGeometry(-asphaltHalf, asphaltHalf, ROAD_TOP_Y, 3),
      new THREE.MeshStandardMaterial({ map: aTex, roughness: 0.95, side: THREE.DoubleSide }));
    asphalt.receiveShadow = true;
    roadRing.add(asphalt);

    /* 两侧米色石材路缘（窄条 + 分段缝贴图：每 2.4 单位一道缝） */
    const cCv = document.createElement('canvas');
    cCv.width = cCv.height = 128;
    const cc = cCv.getContext('2d');
    cc.fillStyle = '#d9cfb4'; cc.fillRect(0, 0, 128, 128);
    cc.fillStyle = 'rgba(0,0,0,.18)'; cc.fillRect(0, 0, 4, 128);
    cc.fillStyle = 'rgba(255,255,255,.30)'; cc.fillRect(4, 0, 3, 128);
    for (let k = 0; k < 240; k++) {
      cc.fillStyle = 'rgba(120,105,78,' + (0.06 + Math.random() * 0.12).toFixed(2) + ')';
      cc.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
    }
    const cTex = canvasTexture(cCv);
    cTex.wrapS = cTex.wrapT = THREE.RepeatWrapping;
    const curbMat = new THREE.MeshStandardMaterial({ map: cTex, roughness: 0.85, side: THREE.DoubleSide });
    const curbO = new THREE.Mesh(roadBandGeometry(asphaltHalf, curbHalf, ROAD_TOP_Y + 0.045, 2.4), curbMat);
    const curbI = new THREE.Mesh(roadBandGeometry(-curbHalf, -asphaltHalf, ROAD_TOP_Y + 0.045, 2.4), curbMat);
    curbO.receiveShadow = curbI.receiveShadow = true;
    roadRing.add(curbO); roadRing.add(curbI);

    /* 白色虚线中心线：沿环线均布短段（条数取整保证接缝均匀），四角斑马线区避让 */
    const paintMat = new THREE.MeshStandardMaterial({ color: 0xf2f1e6, roughness: 0.7, side: THREE.DoubleSide });
    const dashLen = 0.85, halfW = 0.05, crossHalf = 1.78;
    const period = RING_WALK.L / Math.max(1, Math.round(RING_WALK.L / 1.7));
    const inCross = s => ROAD_CORNER_MIDS.some(m => Math.abs(s - m) < crossHalf);
    const dp = [], di = [];
    let dv = 0;
    for (let s0 = 0; s0 < RING_WALK.L - 0.01; s0 += period) {
      if (inCross(s0 - 0.12) || inCross(s0 + dashLen + 0.12)) continue;
      const a = ringPointAt(s0), b = ringPointAt(s0 + dashLen / 2), c = ringPointAt(s0 + dashLen);
      let nx = -(c.z - a.z), nz = c.x - a.x;
      const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
      dp.push(
        a.x + nx * halfW, paintY, a.z + nz * halfW,
        a.x - nx * halfW, paintY, a.z - nz * halfW,
        c.x + nx * halfW, paintY, c.z + nz * halfW,
        c.x - nx * halfW, paintY, c.z - nz * halfW);
      di.push(dv, dv + 2, dv + 1, dv + 1, dv + 2, dv + 3);
      dv += 4;
    }
    const dashGeo = new THREE.BufferGeometry();
    dashGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(dp), 3));
    dashGeo.setIndex(di);
    dashGeo.computeVertexNormals();
    roadRing.add(new THREE.Mesh(dashGeo, paintMat));

    /* 四角斑马线：每角 5 条白色横条（0.42 长 × 1.44 宽，间距 0.24） */
    const zp = [], zi = [];
    let zv = 0;
    const stripeLen = 0.42, stripePitch = 0.66, zHalf = 0.72;
    ROAD_CORNER_MIDS.forEach(mid => {
      for (let j = -2; j <= 2; j++) {
        const sC = mid + j * stripePitch;
        const a = ringPointAt(sC - stripeLen / 2), b = ringPointAt(sC + stripeLen / 2);
        let nx = -(b.z - a.z), nz = b.x - a.x;
        const nl = Math.hypot(nx, nz) || 1; nx /= nl; nz /= nl;
        zp.push(
          a.x + nx * zHalf, paintY, a.z + nz * zHalf,
          a.x - nx * zHalf, paintY, a.z - nz * zHalf,
          b.x + nx * zHalf, paintY, b.z + nz * zHalf,
          b.x - nx * zHalf, paintY, b.z - nz * zHalf);
        zi.push(zv, zv + 2, zv + 1, zv + 1, zv + 2, zv + 3);
        zv += 4;
      }
    });
    const zebraGeo = new THREE.BufferGeometry();
    zebraGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(zp), 3));
    zebraGeo.setIndex(zi);
    zebraGeo.computeVertexNormals();
    roadRing.add(new THREE.Mesh(zebraGeo, paintMat));

    /* 井盖 ×3（底/顶/右边直段各一，圆形铸铁纹圆片，静止） */
    const mCv = document.createElement('canvas');
    mCv.width = mCv.height = 128;
    const mc = mCv.getContext('2d');
    mc.fillStyle = '#55585e'; mc.fillRect(0, 0, 128, 128);
    mc.fillStyle = '#43464c'; mc.beginPath(); mc.arc(64, 64, 52, 0, Math.PI * 2); mc.fill();
    mc.strokeStyle = '#6a6e75'; mc.lineWidth = 7;
    mc.beginPath(); mc.arc(64, 64, 48, 0, Math.PI * 2); mc.stroke();
    mc.fillStyle = '#3a3d43';
    for (let r = 0; r < 3; r++) {
      const cnt = 8 + r * 4;
      for (let k = 0; k < cnt; k++) {
        const a = k / cnt * Math.PI * 2 + r * 0.35, rr = 13 + r * 13;
        mc.beginPath(); mc.arc(64 + Math.cos(a) * rr, 64 + Math.sin(a) * rr, 3.2, 0, Math.PI * 2); mc.fill();
      }
    }
    const mhTex = canvasTexture(mCv);
    const mhGeo = new THREE.CircleGeometry(0.36, 24);
    const mhMat = new THREE.MeshStandardMaterial({ map: mhTex, roughness: 0.55, metalness: 0.35 });
    [[-9.5, ROAD_B], [7.5, -ROAD_B], [ROAD_A, 4.5]].forEach(p => {
      const mh = new THREE.Mesh(mhGeo, mhMat);
      mh.rotation.x = -Math.PI / 2;
      mh.position.set(p[0], ROAD_TOP_Y + 0.012, p[1]);
      mh.receiveShadow = true;
      roadRing.add(mh);
    });

    staticRoot.add(roadRing);
  }

  /* ---------- 40 格地砖（奶油色 + Canvas 纹理） ---------- */
  function buildTiles() {
    const side = matStd('#e6dcc0', { rough: 0.9 });
    for (let i = 0; i < BOARD.length; i++) {
      const { x, z } = worldOf(i);
      const cv = document.createElement('canvas');
      cv.width = cv.height = 256;
      const ctx = cv.getContext('2d');
      drawTileCanvas(ctx, i, null);
      const tex = canvasTexture(cv);
      const topMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88 });
      topMat.color = new THREE.Color(0xffffff);
      const box = new THREE.Mesh(new THREE.BoxGeometry(2.94, 0.55, 2.94),
        [side, side, topMat, side, side, side]);
      box.position.set(x, TILE_TOP - 0.275, z);
      box.castShadow = box.receiveShadow = true;
      box.userData.tileIdx = i;
      staticRoot.add(box);
      tileMeshes[i] = box;
      tileTops[i] = { canvas: cv, ctx, texture: tex, mat: topMat };
      buildings[i] = null;
      flags[i] = null;
    }
  }

  function drawTileCanvas(ctx, i, ownerColor) {
    const t = BOARD[i];
    ctx.clearRect(0, 0, 256, 256);
    ctx.fillStyle = '#f8f1de';
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(122,102,70,.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, 3, 250, 250);
    if (t.group) {                       // 地域色带：位于朝向棋盘中心的一侧
      /* 盒体顶面 UV：画布上方 → -Z，画布右方 → +X */
      const g = GRID_POS(i), B = 48;
      ctx.fillStyle = GROUPS[t.group].color;
      if (g.side === 'bottom') {         // 中心在 -Z → 画布上方
        ctx.fillRect(4, 4, 248, B);
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.fillRect(4, 4 + B, 248, 4);
      } else if (g.side === 'top') {     // 中心在 +Z → 画布下方
        ctx.fillRect(4, 252 - B, 248, B);
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.fillRect(4, 248 - B, 248, 4);
      } else if (g.side === 'left') {    // 中心在 +X → 画布右方
        ctx.fillRect(252 - B, 4, B, 248);
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.fillRect(248 - B, 4, 4, 248);
      } else {                           // right：中心在 -X → 画布左方
        ctx.fillRect(4, 4, B, 248);
        ctx.fillStyle = 'rgba(0,0,0,.18)';
        ctx.fillRect(4 + B, 4, 4, 248);
      }
    }
    if (ownerColor) {
      ctx.strokeStyle = ownerColor;
      ctx.lineWidth = 10;
      ctx.strokeRect(9, 9, 238, 238);
    }
    ctx.fillStyle = '#3a2d1c';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const nameFont = '700 42px "Microsoft YaHei","PingFang SC",sans-serif';
    if (t.type === 'prop') {
      ctx.font = nameFont;
      drawWrapped(ctx, t.name, 128, 116, 234, 48);
      ctx.fillStyle = '#8a7654';
      ctx.font = '600 30px "Microsoft YaHei",sans-serif';
      ctx.fillText(fmt(t.price), 128, 214);
    } else if (t.type === 'station' || t.type === 'utility') {
      ctx.font = '80px sans-serif';
      ctx.fillText(t.type === 'station' ? '🚆' : (t.icon || '⚡'), 128, 82);
      ctx.fillStyle = '#3a2d1c';
      ctx.font = nameFont;
      drawWrapped(ctx, t.name, 128, 162, 234, 44);
      ctx.fillStyle = '#8a7654';
      ctx.font = '600 28px "Microsoft YaHei",sans-serif';
      ctx.fillText(fmt(t.price), 128, 222);
    } else {
      ctx.font = '92px sans-serif';
      ctx.fillText(t.icon || '', 128, 92);
      ctx.fillStyle = '#3a2d1c';
      ctx.font = '700 44px "Microsoft YaHei","PingFang SC",sans-serif';
      drawWrapped(ctx, t.name, 128, 198, 234, 48);
    }
  }
  function drawWrapped(ctx, text, cx, cy, maxW, lh) {
    const chars = String(text).split('');
    const lines = [];
    let line = '';
    for (const ch of chars) {
      if (ctx.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch; }
      else line += ch;
    }
    if (line) lines.push(line);
    const y0 = cy - ((lines.length - 1) * lh) / 2;
    lines.forEach((l, k) => ctx.fillText(l, cx, y0 + k * lh));
  }

  /* ---------- 中央毛毡区（11×7 格） ---------- */
  function buildCenterFelt() {
    /* 毛毡顶面＝海报画布（先纯色，图载入后 cover 重绘）：海报即桌面本身，
     * 不再叠任何共面贴片（旧版海报片+0.06/logo 片+0.09/金环+0.012 三层近共面是中央边缘闪烁的根源）。
     * 画布 1536x980 与毡面 33.2x21.2 同比例，全铺覆盖（用户要求）。 */
    const FELT_C = '#0d4d39';
    const cv = document.createElement('canvas');
    cv.width = 1536; cv.height = Math.round(1536 * 21.2 / 33.2);
    const c = cv.getContext('2d');
    c.fillStyle = FELT_C; c.fillRect(0, 0, cv.width, cv.height);
    const feltTex = new THREE.CanvasTexture(cv);
    feltTex.encoding = THREE.sRGBEncoding;
    if (typeof Image === 'function') {          /* node 冒烟桩无 Image：保持纯色顶面即可 */
      const img = new Image();
      img.onload = function () {
        const ia = img.width / img.height;
        const dw = Math.max(cv.width, cv.height * ia), dh = dw / ia;
        c.drawImage(img, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh);
        feltTex.needsUpdate = true;
      };
      img.src = 'assets/img/scene_poster.jpg';
    }
    const feltSide = matStd(FELT_C, { rough: 0.96 });
    const felt = new THREE.Mesh(
      new THREE.BoxGeometry(33.2, 0.12, 21.2),
      [feltSide, feltSide, new THREE.MeshStandardMaterial({ map: feltTex, roughness: 0.9 }), feltSide, feltSide, feltSide]);
    felt.position.y = TILE_TOP - 0.06;
    felt.receiveShadow = true;
    staticRoot.add(felt);
  }

  /* ---------- 中央陈设：logo / 奖池金币 / 牌堆 ---------- */
  function buildCenterDecor() {
    /* 海报已烘入毛毡顶面（buildCenterFelt）；桌面平贴 3D 标题已移除——
     * 平贴文字在 360° 自由视角下绝大多数角度不可读（用户反馈），品牌标识由 HUD 顶栏承载。
     * 金币堆/牌堆原位保留（均坐落在 TILE_TOP＝毡面顶）。 */

    /* 奖池金币堆 */
    potPile = new THREE.Group();
    const goldMat = matStd('#e8b64c', { rough: 0.3, metal: 0.8 });
    const goldMat2 = matStd('#d89e34', { rough: 0.34, metal: 0.75 });
    const coinGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.11, 18);
    const stack = (sx, sz, n) => {
      for (let k = 0; k < n; k++) {
        const coin = new THREE.Mesh(coinGeo, k % 2 ? goldMat2 : goldMat);
        coin.position.set(sx + (Math.random() - 0.5) * 0.06, 0.056 + k * 0.115, sz + (Math.random() - 0.5) * 0.06);
        coin.rotation.y = Math.random() * Math.PI;
        coin.castShadow = coin.receiveShadow = true;
        potPile.add(coin);
      }
    };
    stack(0, 0, 6); stack(-1.0, 0.5, 4); stack(0.95, -0.4, 3); stack(0.35, 0.9, 2);
    for (let k = 0; k < 7; k++) {
      const coin = new THREE.Mesh(coinGeo, k % 2 ? goldMat : goldMat2);
      const a = Math.random() * Math.PI * 2, r = 1.6 + Math.random() * 1.6;
      coin.position.set(Math.cos(a) * r, 0.056, Math.sin(a) * r);
      coin.rotation.y = Math.random() * Math.PI;
      coin.castShadow = true;
      potPile.add(coin);
    }
    potPile.position.set(0, TILE_TOP, 0.4);
    staticRoot.add(potPile);

    /* 机会 / 命运两叠牌堆 */
    buildDeck(-9.6, 2.2, 'chance', '#c23a2a', '❓');
    buildDeck(9.6, 2.2, 'destiny', '#28538f', '📰');
  }

  function buildDeck(x, z, kind, bg, ico) {
    const g = new THREE.Group();
    const cardGeo = new THREE.BoxGeometry(1.62, 0.05, 2.3);
    const backMat = matStd(bg, { rough: 0.7 });
    const creamMat = matStd('#efe6cc', { rough: 0.85 });
    for (let k = 0; k < 8; k++) {
      const card = new THREE.Mesh(cardGeo, k === 7 ? creamMat : backMat);
      card.position.set((Math.random() - 0.5) * 0.05, 0.026 + k * 0.052, (Math.random() - 0.5) * 0.05);
      card.rotation.y = (Math.random() - 0.5) * 0.09;
      card.castShadow = card.receiveShadow = true;
      g.add(card);
    }
    /* 顶面卡背图案 */
    const cv = document.createElement('canvas');
    cv.width = 160; cv.height = 224;
    const c = cv.getContext('2d');
    c.fillStyle = bg; c.fillRect(0, 0, 160, 224);
    c.strokeStyle = 'rgba(255,236,180,.85)'; c.lineWidth = 6;
    c.strokeRect(9, 9, 142, 206);
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.font = '110px sans-serif';
    c.fillText(ico, 80, 96);
    c.font = '700 30px "Microsoft YaHei",sans-serif';
    c.fillStyle = '#ffe9a8';
    c.fillText(kind === 'chance' ? '机 会' : '命 运', 80, 182);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 2.1),
      new THREE.MeshBasicMaterial({ map: canvasTexture(cv) }));
    face.rotation.x = -Math.PI / 2;
    face.position.y = 0.054 * 8 + 0.004;
    face.rotation.z = (Math.random() - 0.5) * 0.06;
    g.add(face);
    g.position.set(x, TILE_TOP, z);
    g.rotation.y = x < 0 ? 0.16 : -0.16;
    staticRoot.add(g);
  }

  /* ---------- 3D 骰子（白色立方体 + 黑点数，六面 Canvas） ---------- */
  const DICE_FACE_MAT = { 3: 0, 4: 1, 1: 2, 6: 3, 2: 4, 5: 5 };   // value → 材质槽 [+x,-x,+y,-y,+z,-z]
  const FACE_NORMAL = { 1: [0, 1, 0], 6: [0, -1, 0], 3: [1, 0, 0], 4: [-1, 0, 0], 2: [0, 0, 1], 5: [0, 0, -1] };
  function buildDice() {
    const mats = [];
    /* 按 DICE_FACE_MAT 槽位放置（1 顶 / 6 底 / 3 +x / 4 -x / 2 +z / 5 -z，对面和为 7），
     * 与 rollDice 的 FACE_NORMAL 转正逻辑配套 —— 顺序 push 会导致点数与转正面错位 */
    mats.length = 6;
    for (let v = 1; v <= 6; v++) {
      const cv = document.createElement('canvas');
      cv.width = cv.height = 128;
      const c = cv.getContext('2d');
      c.fillStyle = '#fbfaf3';
      c.fillRect(0, 0, 128, 128);
      const P = {
        1: [[64, 64]], 2: [[38, 38], [90, 90]], 3: [[34, 34], [64, 64], [94, 94]],
        4: [[40, 40], [88, 40], [40, 88], [88, 88]],
        5: [[38, 38], [90, 38], [64, 64], [38, 90], [90, 90]],
        6: [[40, 32], [88, 32], [40, 64], [88, 64], [40, 96], [88, 96]],
      }[v];
      c.fillStyle = '#1c1c22';
      P.forEach(p => { c.beginPath(); c.arc(p[0], p[1], 10.5, 0, Math.PI * 2); c.fill(); });
      mats[DICE_FACE_MAT[v]] = new THREE.MeshStandardMaterial({ map: canvasTexture(cv), roughness: 0.32 });
    }
    dice = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 1.3), mats);
    dice.castShadow = dice.receiveShadow = true;
    dice.position.set(DICE_HOME.x, TILE_TOP + 0.65, DICE_HOME.z);
    staticRoot.add(dice);
  }

  /* ---------- 桌面散件：蓝图纸 / 骰子 / 金币 / 出租车与飞机摆件 ---------- */
  function buildTableScatter() {
    /* 蓝图纸 ×2 */
    const blueprint = (w, h, x, z, ry) => {
      const cv = document.createElement('canvas');
      cv.width = 512; cv.height = Math.round(512 * h / w);
      const c = cv.getContext('2d');
      c.fillStyle = '#cfe2f0'; c.fillRect(0, 0, cv.width, cv.height);
      c.strokeStyle = 'rgba(90,130,160,.55)'; c.lineWidth = 1;
      for (let gx = 0; gx <= cv.width; gx += 32) { c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, cv.height); c.stroke(); }
      for (let gy = 0; gy <= cv.height; gy += 32) { c.beginPath(); c.moveTo(0, gy); c.lineTo(cv.width, gy); c.stroke(); }
      c.strokeStyle = '#c25a3a'; c.lineWidth = 4; c.setLineDash([14, 9]);
      c.strokeRect(70, 60, 220, 150);
      c.beginPath(); c.arc(380, 170, 62, 0, Math.PI * 2); c.stroke();
      c.beginPath(); c.moveTo(70, 260); c.lineTo(440, 300); c.stroke();
      c.setLineDash([]);
      const paper = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshStandardMaterial({ map: canvasTexture(cv), roughness: 0.9 }));
      paper.rotation.x = -Math.PI / 2;
      paper.rotation.z = ry;
      paper.position.set(x, 0.04, z);
      paper.receiveShadow = true;
      staticRoot.add(paper);
    };
    blueprint(10, 7, -31, 10, 0.5);
    blueprint(6.5, 4.6, -28, -13, -0.45);

    /* 散落骰子 */
    const looseDice = (s, x, z, ry) => {
      const d = new THREE.Mesh(new THREE.BoxGeometry(s, s, s),
        matStd('#f4f2ea', { rough: 0.4 }));
      d.position.set(x, s / 2, z);
      d.rotation.y = ry;
      d.castShadow = d.receiveShadow = true;
      staticRoot.add(d);
    };
    looseDice(1.2, 30.5, 9.5, 0.7);
    looseDice(0.9, 32.5, 11.5, -0.4);
    looseDice(0.9, -26.5, 5.5, 0.3);

    /* 金币散堆 */
    const goldMat = matStd('#e0b052', { rough: 0.32, metal: 0.78 });
    const coinGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.13, 18);
    const coinStack = (x, z, n, ry) => {
      for (let k = 0; k < n; k++) {
        const coin = new THREE.Mesh(coinGeo, goldMat);
        coin.position.set(x + Math.sin(ry) * k * 0.08, 0.065 + k * 0.14, z);
        coin.rotation.y = ry + k * 0.4;
        coin.castShadow = coin.receiveShadow = true;
        staticRoot.add(coin);
      }
    };
    coinStack(28.5, -9.5, 5, 0.4);
    coinStack(30.4, -11.6, 3, -0.8);
    coinStack(-30, 14.5, 4, 0.9);

    /* 道具摆件：出租车 + 私人飞机（Building3D 工厂） */
    try {
      const B = window.Building3D;
      if (B && B.props && B.props.taxi) {
        const taxi = B.props.taxi();
        taxi.scale.setScalar(2.6);
        taxi.position.set(-27.5, 0.02, -3.5);
        taxi.rotation.y = 0.75;
        taxi.traverse(o => { if (o.isMesh) o.castShadow = true; });
        staticRoot.add(taxi);
      }
      if (B && B.props && B.props.jet) {
        const jet = B.props.jet();
        jet.scale.setScalar(3.0);
        jet.position.set(25.5, 0.02, -15.5);
        jet.rotation.y = -2.3;
        jet.traverse(o => { if (o.isMesh) o.castShadow = true; });
        staticRoot.add(jet);
      }
      if (B && B.props && B.props.roadblock) {
        const rb = B.props.roadblock();
        rb.position.set(-32, 0.02, -7);
        rb.rotation.y = -0.6;
        rb.traverse(o => { if (o.isMesh) o.castShadow = true; });
        staticRoot.add(rb);
      }
    } catch (e) { window.__errs && window.__errs.push('view3d scatter: ' + e.message); }
  }

  /* ---------- 9 栋特殊建筑 ---------- */
  const SPECIAL_FACTORY = {
    5: 'station',     // 中央车站
    12: 'detention',  // 监狱
    15: 'station',    // 高铁虹桥站
    20: 'fountain',   // 中央公园喷泉
    22: 'shop',       // 道具商店
    25: 'ferry',      // 轮渡码头
    29: 'water',      // 自来水厂
    11: 'power',      // 电力公司
    32: 'gate',       // 拘留所
    37: 'airport',    // 国际机场
  };
  function buildSpecials() {
    BOARD.forEach((t, i) => {
      const fk = SPECIAL_FACTORY[i];
      if (specials[i] || !fk) return;
      const B = window.Building3D;
      try {
        /* img2threejs 精细特建优先（Special3D[格号]），回退 buildings3d 工厂 */
        let g = null;
        if (window.Special3D && typeof window.Special3D[i] === 'function') {
          try { g = window.Special3D[i](); } catch (e) { g = null; }
        }
        if (!g && B && typeof B[fk] === 'function') g = B[fk]();
        if (!g) return;
        const { x, z } = worldOf(i);
        g.position.set(x, TILE_TOP, z);
        g.rotation.y = sideRotY(i) + (SPECIAL_YAW[i] || 0);
        g.userData.tileIdx = i;
        g.traverse(o => { if (o.isMesh && o.castShadow === undefined) o.castShadow = true; });
        staticRoot.add(g);
        specials[i] = g;
        if (fk === 'fountain') fountainTile = i;
      } catch (e) { window.__errs && window.__errs.push('view3d special ' + i + ': ' + e.message); }
    });
    shadowDirty();
  }

  /* ---------- 高亮环 / 幸运环 ---------- */
  function buildActiveRing() {
    activeRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.78, 0.07, 10, 36),
      new THREE.MeshBasicMaterial({ color: 0xffd76a, transparent: true, opacity: 0.92 }));
    activeRing.rotation.x = -Math.PI / 2;
    activeRing.visible = false;
    dynRoot.add(activeRing);
  }
  function buildLuckyRing() {
    luckyRing = new THREE.Group();
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.08, 0.08, 10, 40),
      new THREE.MeshBasicMaterial({ color: 0xffd23c, transparent: true, opacity: 0.9 }));
    ring.rotation.x = -Math.PI / 2;
    luckyRing.add(ring);
    const glow = new THREE.Mesh(
      new THREE.CircleGeometry(1.02, 32),
      new THREE.MeshBasicMaterial({ color: 0xffe9a8, transparent: true, opacity: 0.22, depthWrite: false }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.y = 0.012;
    luckyRing.add(glow);
    luckyRing.visible = false;
    dynRoot.add(luckyRing);
  }

  /* ================= 归属旗 / 地产建筑 同步 ================= */
  function charOfSafe(p) {
    try { if (typeof charOf === 'function' && p) return charOf(p); } catch (e) { /* ignore */ }
    return null;
  }
  function playerColorOf(idx) {
    try {
      if (typeof playerColor === 'function' && G.players[idx]) return playerColor(G.players[idx]);
    } catch (e) { /* ignore */ }
    return '#ffffff';
  }
  /* 归属旗避位用的建筑外包盒缓存（key = 格号:等级；建筑重建即换 key，无需失效） */
  const _flagFp = {};
  function flagFootprint(i) {
    const bld = buildings[i];
    if (!bld) return null;
    const lv = (typeof G !== 'undefined' && G.tiles && G.tiles[i]) ? (G.tiles[i].level | 0) : 0;
    const key = i + ':' + lv;
    if (_flagFp[key] !== undefined) return _flagFp[key];
    let out = null;
    try {
      const box = new THREE.Box3().setFromObject(bld);
      out = { minX: box.min.x, maxX: box.max.x, minZ: box.min.z, maxZ: box.max.z };
    } catch (e) { out = null; }
    _flagFp[key] = out;
    return out;
  }
  function syncFlag(i, st) {
    if (st.owner == null) {
      if (flags[i]) { disposeGroup(flags[i].group); flags[i] = null; }
      return;
    }
    const color = playerColorOf(st.owner);
    if (!flags[i]) {
      const o = outwardOf(i), w = worldOf(i);
      const lat = { x: o.z, z: -o.x };
      /* 旗杆避位（审计 P1：固定对角 1.02 在 11/22 格插进 lv4 大楼）：4 对角 × 2 半径候选，
       * 选距本格建筑 footprint 最远者（二维点到矩形距离；建筑外包盒按 格号:等级 缓存） */
      let bestX = o.x * 1.02 + lat.x * 1.02, bestZ = o.z * 1.02 + lat.z * 1.02, bestD = -1;
      const fp = flagFootprint(i);
      for (const sx of [1, -1]) for (const sz of [1, -1]) for (const r of [1.02, 1.34]) {
        const px = o.x * r * sx + lat.x * r * sz;
        const pz = o.z * r * sx + lat.z * r * sz;
        let d = 9;
        if (fp) {
          const dx = Math.max(fp.minX - (w.x + px), 0, (w.x + px) - fp.maxX);
          const dz = Math.max(fp.minZ - (w.z + pz), 0, (w.z + pz) - fp.maxZ);
          d = Math.hypot(dx, dz);
        }
        if (d > bestD) { bestD = d; bestX = px; bestZ = pz; }
      }
      const g = new THREE.Group();
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 1.15, 8),
        matStd('#d8c9a3', { rough: 0.5 }));
      pole.position.y = 0.575;
      pole.castShadow = true;
      g.add(pole);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.055, 10, 8),
        matStd('#e8b64c', { rough: 0.3, metal: 0.8 }));
      knob.position.y = 1.18;
      g.add(knob);
      const pivot = new THREE.Group();
      pivot.position.y = 1.0;
      const flagMat = matStd(color, { rough: 0.6, emissive: color, ei: 0.18 });
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.03), flagMat);
      flag.position.x = 0.3;
      flag.castShadow = true;
      pivot.add(flag);
      g.add(pivot);
      g.position.set(w.x + bestX, TILE_TOP, w.z + bestZ);
      g.userData.tileIdx = i;
      dynRoot.add(g);
      flags[i] = { group: g, pivot, owner: st.owner };
    } else if (flags[i].owner !== st.owner) {
      flags[i].owner = st.owner;
      flags[i].pivot.children[0].material = matStd(color, { rough: 0.6, emissive: color, ei: 0.18 });
    }
  }
  /* ---------- 静态合批（性能预算：22×lv4 精修建筑 ≈ 7,700 mesh → 每帧 1 万 draw call） ----------
   * 精修地产每级 ≤350 个小 mesh，但同一文件内材质经 _matCache 共享（每栋约 40 种材质）。
   * 引擎不驱动 dynRoot 的 userData.anim（主循环只 runAnims(staticRoot/fxRoot)），因此地产建筑
   * 在游戏内本就是纯静态：把「同材质 + 同属性签名 + 同阴影/渲染序」的 Mesh 烘焙进一个 Mesh，
   * draw call 与阴影 pass 同比例下降，三角形数与包围盒严格不变（smoke_perf_budget.js 断言）。
   * 保守规则：跳过 Instanced/Skinned/多材质/morph/透明/不可见 mesh；负行列式（镜像）翻转绕序；
   * 只在 dynRoot 地产建筑上使用（特建/角色带运行中动画，不合批）。?nomerge=1 可退回原始层级。 */
  const MERGE_STATIC = !(typeof location !== 'undefined' &&
    new URLSearchParams(location.search).get('nomerge') === '1');
  const _mInv = new THREE.Matrix4(), _mRel = new THREE.Matrix4(), _nrm = new THREE.Matrix3();
  const _v3 = new THREE.Vector3();
  function ancestorsVisible(o, root) {
    for (let p = o; p && p !== root; p = p.parent) { if (p.visible === false) return false; }
    return true;
  }
  function attrSig(g) {
    return Object.keys(g.attributes).sort().map(k => k + ':' + g.attributes[k].itemSize).join(',');
  }
  function mergeStaticGroup(root) {
    if (!root || !root.isObject3D) return root;
    root.updateMatrixWorld(true);
    _mInv.copy(root.matrixWorld).invert();
    const buckets = new Map();
    root.traverse(o => {
      if (o === root || !o.isMesh || o.isInstancedMesh || o.isSkinnedMesh) return;
      const g = o.geometry, m = o.material;
      if (!g || !g.isBufferGeometry || !g.attributes.position || Array.isArray(m) || !m) return;
      if (g.morphAttributes && Object.keys(g.morphAttributes).length) return;
      if (m.transparent || o.visible === false || !ancestorsVisible(o, root)) return;
      const key = m.uuid + '|' + attrSig(g) + '|' + (o.castShadow ? 1 : 0) + (o.receiveShadow ? 1 : 0) + '|' + o.renderOrder;
      let b = buckets.get(key);
      if (!b) { b = { mat: m, sig: attrSig(g), cast: o.castShadow, recv: o.receiveShadow, ro: o.renderOrder, items: [] }; buckets.set(key, b); }
      b.items.push(o);
    });
    let merged = 0, removed = 0;
    buckets.forEach(b => {
      if (b.items.length < 2) return;
      /* 统计非索引化后的顶点总数 */
      const srcs = b.items.map(o => {
        const g = o.geometry;
        const ng = g.index ? g.toNonIndexed() : g;
        return { o, g: ng, own: ng !== g, n: ng.attributes.position.count };
      });
      const total = srcs.reduce((s, x) => s + x.n, 0);
      const names = Object.keys(srcs[0].g.attributes);
      const out = new THREE.BufferGeometry();
      const arrays = {};
      names.forEach(k => { arrays[k] = new Float32Array(total * srcs[0].g.attributes[k].itemSize); });
      let off = 0;
      for (const s of srcs) {
        _mRel.multiplyMatrices(_mInv, s.o.matrixWorld);
        _nrm.getNormalMatrix(_mRel);
        const flip = _mRel.determinant() < 0;
        for (const k of names) {
          const a = s.g.attributes[k], isz = a.itemSize, dst = arrays[k];
          const base = off * isz;
          if (k === 'position') {
            for (let v = 0; v < s.n; v++) {
              _v3.fromBufferAttribute(a, v).applyMatrix4(_mRel);
              dst[base + v * 3] = _v3.x; dst[base + v * 3 + 1] = _v3.y; dst[base + v * 3 + 2] = _v3.z;
            }
          } else if (k === 'normal') {
            for (let v = 0; v < s.n; v++) {
              _v3.fromBufferAttribute(a, v).applyMatrix3(_nrm).normalize();
              dst[base + v * 3] = _v3.x; dst[base + v * 3 + 1] = _v3.y; dst[base + v * 3 + 2] = _v3.z;
            }
          } else if (a.array instanceof Float32Array && !a.normalized) {
            dst.set(a.array.subarray(0, s.n * isz), base);
          } else {
            for (let v = 0; v < s.n; v++) for (let c = 0; c < isz; c++) dst[base + v * isz + c] = a.getComponent(v, c);
          }
          if (flip) {
            /* 镜像变换：交换每个三角形第 2/3 顶点，保持正面朝外 */
            for (let tri = 0; tri + 2 < s.n; tri += 3) {
              const i1 = base + (tri + 1) * isz, i2 = base + (tri + 2) * isz;
              for (let c = 0; c < isz; c++) { const tmp = dst[i1 + c]; dst[i1 + c] = dst[i2 + c]; dst[i2 + c] = tmp; }
            }
          }
        }
        off += s.n;
        if (s.own) s.g.dispose();
      }
      names.forEach(k => out.setAttribute(k, new THREE.BufferAttribute(arrays[k], srcs[0].g.attributes[k].itemSize)));
      const mesh = new THREE.Mesh(out, b.mat);
      mesh.castShadow = b.cast; mesh.receiveShadow = b.recv; mesh.renderOrder = b.ro;
      mesh.name = 'merged';
      root.add(mesh);
      b.items.forEach(o => { if (o.parent) o.parent.remove(o); removed++; });
      merged++;
    });
    root.userData.merged = { buckets: merged, removed };
    return root;
  }

  function syncBuilding(i, st, t) {
    const wantLevel = (t.type === 'prop' && st.owner != null && st.level > 0) ? Math.min(4, st.level) : 0;
    const curB = buildings[i];
    if (curB && curB.level === wantLevel) return;
    if (curB) { disposeGroup(curB.group); buildings[i] = null; }
    if (!wantLevel) { shadowDirty(); return; }
    const B = window.Building3D;
    if (!B || typeof B.property !== 'function') return;
    try {
      /* img2threejs 个性化地产优先（Props3D[格号](level)），回退参数化工厂 */
      let g = null;
      if (window.Props3D && typeof window.Props3D[i] === 'function') {
        try { g = window.Props3D[i](wantLevel); } catch (e) { g = null; }
      }
      if (!g && B && typeof B.property === 'function') g = B.property(i, wantLevel);
      if (!g) { shadowDirty(); return; }
      if (MERGE_STATIC) { try { mergeStaticGroup(g); } catch (e) { window.__errs && window.__errs.push('v3d merge ' + i + ': ' + e.message); } }
      const { x, z } = worldOf(i);
      g.position.set(x, TILE_TOP, z);
      g.rotation.y = sideRotY(i) + (SPECIAL_YAW[i] || 0);
      g.userData.tileIdx = i;
      dynRoot.add(g);
      buildings[i] = { group: g, level: wantLevel };
    } catch (e) { window.__errs && window.__errs.push('view3d property ' + i + ': ' + e.message); }
    shadowDirty();
  }
  function syncLucky() {
    const idx = (typeof G !== 'undefined' && G) ? G.luckyTile : -1;
    if (idx === luckyIdx) return;
    luckyIdx = idx;
    if (idx == null || idx < 0 || !worldOf) { luckyRing.visible = false; return; }
    const w = worldOf(idx);
    luckyRing.position.set(w.x, TILE_TOP + 0.04, w.z);
    luckyRing.visible = true;
  }

  /* ================= 格子状态刷新 ================= */
  function updateTile(i) {
    if (!ready) { pendingTiles.add(i); return; }
    const st = G.tiles[i], t = BOARD[i];
    if (!st || !t) return;
    const top = tileTops[i];
    if (top) {
      drawTileCanvas(top.ctx, i, st.owner != null ? playerColorOf(st.owner) : null);
      top.texture.needsUpdate = true;
    }
    syncFlag(i, st);
    syncBuilding(i, st, t);
    syncLucky();
  }
  function updateTileAll() {
    if (!ready) { BOARD.forEach((_, i) => pendingTiles.add(i)); return; }
    BOARD.forEach((_, i) => updateTile(i));
  }
  function flushPending() {
    pendingTiles.forEach(i => updateTile(i));
    pendingTiles.clear();
  }

  /* ---------- 路障（img2threejs 精细模型 Special3D.roadblock 优先 → Building3D.props.roadblock 回退） ---------- */
  function rebuildBlocks() {
    if (!ready) return;
    blockMeshes.forEach(g => disposeGroup(g));
    blockMeshes.clear();
    const B = window.Building3D;
    if (!G.blocks) return;
    const hasHifi = window.Special3D && typeof window.Special3D.roadblock === 'function';
    if (!hasHifi && (!B || !B.props || !B.props.roadblock)) return;
    for (const k in G.blocks) {
      const idx = +k;
      try {
        /* 优先链：Special3D.roadblock（参考图复刻）→ 旧模板工厂回退 */
        let g = null;
        if (hasHifi) { try { g = window.Special3D.roadblock(); } catch (e) { g = null; } }
        if (!g && B && B.props && typeof B.props.roadblock === 'function') g = B.props.roadblock();
        if (!g) continue;
        const rp = roadPointOf(idx);   /* 面板立在行进向前方 0.9（角色停在面板之前，不再与站位同点穿模） */
        g.position.set(rp.x + rp.tx * 0.9, ROAD_TOP_Y, rp.z + rp.tz * 0.9);
        g.rotation.y = Math.atan2(rp.tx, rp.tz);   /* 模型 +z=行进向，面板自然横跨路面 */
        g.userData.tileIdx = idx;
        g.traverse(o => { if (o.isMesh) o.castShadow = true; });
        dynRoot.add(g);
        blockMeshes.set(idx, g);
      } catch (e) { /* 忽略单个路障失败 */ }
    }
    shadowDirty();
  }

  /* ================= 角色 ================= */
  function makeNameSprite(name, color) {
    const cv = document.createElement('canvas');
    cv.width = 256; cv.height = 64;
    const c = cv.getContext('2d');
    c.font = '800 40px "Microsoft YaHei",sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.lineWidth = 8; c.strokeStyle = 'rgba(0,0,0,.78)';
    c.strokeText(name, 128, 34);
    c.fillStyle = color || '#ffffff';
    c.fillText(name, 128, 34);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: canvasTexture(cv), transparent: true, depthWrite: false,
    }));
    sp.scale.set(2.4, 0.6, 1);
    sp.renderOrder = 8;
    return sp;
  }
  function fallbackCharacter(color) {
    /* Building3D 不可用时的极简 Q 版小人（保持 parts 命名） */
    const g = new THREE.Group();
    const mat = matStd(color, { rough: 0.7 });
    const mk = (geo, m, x, y, z, parent) => {
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(x, y, z);
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };
    const legL = new THREE.Group(); legL.position.set(0.1, 0.5, 0); g.add(legL);
    const legR = new THREE.Group(); legR.position.set(-0.1, 0.5, 0); g.add(legR);
    mk(new THREE.CapsuleGeometry(0.085, 0.24, 3, 8), mat, 0, -0.22, 0, legL);
    mk(new THREE.CapsuleGeometry(0.085, 0.24, 3, 8), mat, 0, -0.22, 0, legR);
    const torso = new THREE.Group(); torso.position.y = 0.52; g.add(torso);
    mk(new THREE.CapsuleGeometry(0.3, 0.3, 4, 10), mat, 0, 0.32, 0, torso);
    const armL = new THREE.Group(); armL.position.set(0.35, 1.0, 0); g.add(armL);
    const armR = new THREE.Group(); armR.position.set(-0.35, 1.0, 0); g.add(armR);
    mk(new THREE.CapsuleGeometry(0.06, 0.2, 3, 8), mat, 0, -0.15, 0, armL);
    mk(new THREE.CapsuleGeometry(0.06, 0.2, 3, 8), mat, 0, -0.15, 0, armR);
    const head = new THREE.Group(); head.position.y = 1.1; g.add(head);
    mk(new THREE.SphereGeometry(0.3, 14, 10), matStd('#f2c9a0', { rough: 0.65 }), 0, 0.28, 0, head);
    g.userData.parts = { head, torso, armL, armR, legL, legR };
    return g;
  }
  function buildTokens() {
    tokens.forEach(rig => disposeRig(rig));
    tokens.clear();
    if (typeof G === 'undefined' || !G.players) return;
    for (const p of G.players) {
      const c = charOfSafe(p);
      let model = null;
      let privateAssets = false;
      const B = window.Building3D;
      /* 精细角色优先（img2threejs 管线产物 Char3D），?legacychar=1 回退程序化角色 */
      const useLegacy = (typeof location !== 'undefined' &&
        new URLSearchParams(location.search).get('legacychar') === '1');
      if (!useLegacy) {
        try {
          const C3 = window.Char3D;
          if (C3 && typeof C3[p.charId] === 'function') { model = C3[p.charId](); privateAssets = !!model; }
        } catch (e) { model = null; privateAssets = false; }
      }
      if (!model) {
        try {
          if (B && B.characters && typeof B.characters[p.charId] === 'function') model = B.characters[p.charId]();
        } catch (e) { model = null; }
      }
      if (!model) model = fallbackCharacter(c ? c.color : '#cccccc');
      const group = new THREE.Group();
      group.userData.playerIdx = p.idx;   /* 模块E 测试钩子：场景内反查角色 rig */
      model.scale.setScalar(CHAR_SCALE);
      model.traverse(o => { if (o.isMesh) o.castShadow = true; });
      group.add(model);
      /* 玩家色底环 */
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.52, 0.07, 10, 28),
        matStd(c ? c.color : '#ffffff', { rough: 0.5, emissive: c ? c.color : '#ffffff', ei: 0.25 }));
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      group.add(ring);
      const nameSp = makeNameSprite(c ? c.name : '?', c ? c.color : '#fff');
      nameSp.position.y = 2.75;
      group.add(nameSp);
      const stand = standOf(p.pos, 0, 1);
      group.position.set(stand.x, ROAD_TOP_Y, stand.z);
      tokenRoot.add(group);
      const parts = (model.userData && model.userData.parts) || null;
      tokens.set(p.idx, {
        group, model, parts, privateAssets,
        mode: 'idle', phase: Math.random() * 6, targetRotY: stand.rot,
        panic: false, ride: null, dead: false,
      });
    }
    shadowDirty();
  }

  /* ---------- 角色逐帧动画（sin 驱动，parts: head/torso/armL/armR/legL/legR） ---------- */
  function animToken(rig, dt, t) {
    const P = rig.parts;
    if (!P || rig.dead) return;
    rig.group.rotation.y += (rig.targetRotY - rig.group.rotation.y) * Math.min(1, dt * 11);
    if (rig.panic) {
      /* 被捕惊慌：双手乱舞 + 腿蹬 + 摇头 */
      const w = t * 13;
      P.armL.rotation.x = -2.55 + Math.sin(w) * 0.35;
      P.armR.rotation.x = -2.55 - Math.sin(w) * 0.35;
      P.armL.rotation.z = 0.4 + Math.sin(w * 1.3) * 0.2;
      P.armR.rotation.z = -0.4 - Math.sin(w * 1.3) * 0.2;
      P.legL.rotation.x = Math.sin(w * 1.4) * 0.5;
      P.legR.rotation.x = -Math.sin(w * 1.4) * 0.5;
      if (P.head) P.head.rotation.z = Math.sin(w * 1.1) * 0.16;
      P.torso.position.y = 0.52 + Math.abs(Math.sin(w * 0.9)) * 0.035;
      if (P.head) P.head.position.y = 1.1 + P.torso.position.y - 0.52;
      return;
    }
    if (rig.mode === 'walk') {
      const ph = rig.phase;
      P.legL.rotation.x = Math.sin(ph) * 0.8;
      P.legR.rotation.x = -Math.sin(ph) * 0.8;
      P.armL.rotation.x = -Math.sin(ph) * 0.6;
      P.armR.rotation.x = Math.sin(ph) * 0.6;
      P.armL.rotation.z = 0; P.armR.rotation.z = 0;
      const bob = Math.abs(Math.sin(ph)) * 0.035;
      P.torso.position.y = 0.52 + bob;
      if (P.head) { P.head.position.y = 1.1 + bob; P.head.rotation.z = 0; }
    } else {
      /* 待机：轻微上下浮动 + 手臂微摆 + 偶尔转头 */
      const ph = rig.phase;
      const bob = Math.abs(Math.sin(ph)) * 0.014;
      P.torso.position.y = 0.52 + bob;
      P.armL.rotation.x = Math.sin(ph) * 0.07;
      P.armR.rotation.x = -Math.sin(ph) * 0.07;
      P.armL.rotation.z = 0; P.armR.rotation.z = 0;
      P.legL.rotation.x = Math.sin(ph) * 0.03;
      P.legR.rotation.x = -Math.sin(ph) * 0.03;
      if (P.head) { P.head.position.y = 1.1 + bob; P.head.rotation.y = Math.sin(t * 0.6) * 0.08; P.head.rotation.z = 0; }
    }
  }

  /* ---------- 移动（逐格跳跃：y 抛物线 + 沿马路环线的折线水平插值） ---------- */
  function baseYOf(rig) {
    return rig.ride ? rig.ride.group.position.y + rig.ride.mountY : ROAD_TOP_Y;
  }
  async function moveToken(p, animate, opts) {
    const rig = tokens.get(p.idx);
    if (!rig || rig.dead) return;
    const same = G.players.filter(q => q.alive && q.pos === p.pos);
    const k = Math.max(0, same.indexOf(p));
    const st = standOf(p.pos, k, Math.max(1, same.length));
    const fromX = rig.group.position.x, fromZ = rig.group.position.z;
    const dx = st.x - fromX, dz = st.z - fromZ;

    if (!animate) {
      rig.group.position.set(st.x, baseYOf(rig), st.z);
      rig.targetRotY = Math.abs(dx) + Math.abs(dz) > 0.01 ? Math.atan2(dx, dz) : st.rot;
      return;
    }
    rig.mode = 'walk';
    lastMoveT = performance.now();
    followIdx = p.idx;
    if (Math.abs(dx) + Math.abs(dz) > 0.01) {
      let d = Math.atan2(dx, dz) - rig.targetRotY;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      rig.targetRotY += d;
    }
    if (rig.ride) rig.ride.group.rotation.y = rig.targetRotY;
    const fast = opts && opts.fast;
    const dur = (fast ? 0.13 : 0.25) / spd();
    const y0 = baseYOf(rig);
    const hop = rig.ride ? 0.16 : 0.55;
    /* 行走点沿马路环线（模块E）：相邻同侧格 = 直线（与原行为一致）；
     * 跨四角 = 环线圆角折线（弧长匀速），跳跃抛物线只叠在 y 上不受影响 */
    const path = ringPath(fromX, fromZ, st.x, st.z);
    const segLen = [];
    let pathLen = 0;
    for (let k = 0; k < path.length - 1; k++) {
      const l = Math.hypot(path[k + 1].x - path[k].x, path[k + 1].z - path[k].z);
      segLen.push(l); pathLen += l;
    }
    await tween(dur, kk => {
      const d = kk * pathLen;
      let acc = 0, j = 0;
      while (j < segLen.length - 1 && acc + segLen[j] < d) { acc += segLen[j]; j++; }
      const t = segLen[j] > 1e-9 ? Math.min(1, (d - acc) / segLen[j]) : 1;
      rig.group.position.x = lerp(path[j].x, path[j + 1].x, t);
      rig.group.position.z = lerp(path[j].z, path[j + 1].z, t);
      rig.group.position.y = y0 + Math.sin(kk * Math.PI) * hop;
    });
    rig.group.position.set(st.x, baseYOf(rig), st.z);
    rig.mode = 'idle';
    shadowDirty();
  }
  function removeToken(p) {
    const rig = tokens.get(p.idx);
    if (!rig || rig.dead) return;
    rig.dead = true;
    if (rig.ride) { disposeGroup(rig.ride.group); rides.delete(p.idx); rig.ride = null; }
    /* 破产退场：倾倒 + 从路面沉入桌面（不改共享材质，避免全局淡出） */
    tween(0.9, kk => {
      rig.group.rotation.x = -kk * Math.PI / 2.2;
      rig.group.position.y = ROAD_TOP_Y * (1 - kk) - 0.55 * kk;
      const s = Math.max(0.001, 1 - kk * 0.85);
      rig.group.scale.setScalar(s);
    }).then(() => disposeRig(rig)).then(() => { if (tokens.get(p.idx) === rig) tokens.delete(p.idx); shadowDirty(); });
    shadowDirty();
  }

  /* ================= 骑乘（police / plane） ================= */
  function basicPolice() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.72), matStd('#f2f5f7', { rough: 0.4 }));
    body.position.y = 0.35;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.3, 0.62), matStd('#39536b', { rough: 0.5 }));
    cabin.position.set(-0.1, 0.62, 0);
    g.add(body, cabin);
    return g;
  }
  function basicJet() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(0.24, 1.6, 10), matStd('#e8ecf0', { rough: 0.4 }));
    body.rotation.x = Math.PI / 2;
    body.position.z = 0.3;
    g.add(body);
    return g;
  }
  /* ---------- 骑乘模型尺度归一化 ----------
   * 用 Box3 实测模型包围盒求 scale（替换写死的 2.6/2.5）：
   *   rawLen = max(size.x, size.z)——车/机身长轴（兼容 Special3D.jet +z 机头与旧工厂 +x 机头两种朝向）
   *   police：车长归一 3.2（≈1 条格子边，杜绝"压三格"），车轮贴马路路面（世界 minY≈ROAD_TOP_Y+0.04，
   *           与角色站位同层），mount = 车顶 max.y·s（车顶坐人 ≈ 车高）
   *   plane ：机身长归一 4.6，腹部离地 TILE_TOP+3.2 巡航——lv4 楼顶最高 y≈4.16，翼展 4.33
   *           半幅 2.16 扫过的格子必须整个从楼顶上方飞过（穿模审计 P0：原 +0.55 会削过 6/6 格 lv4） */
  const RIDE_TARGET_LEN = { police: 3.2, plane: 4.6 };
  const RIDE_GROUND_Y = ROAD_TOP_Y + 0.04;   /* 模块E：车轮从桌面层(0.04)抬到马路路面层 */
  const RIDE_FLY_BELLY = TILE_TOP + 3.2;
  function fitRide(g, isPolice) {
    const kind = isPolice ? 'police' : 'plane';
    let s = isPolice ? 2.6 : 2.5;                       // Box3 不可用时的兜底（旧行为）
    let baseY = isPolice ? 0.05 : 2.75, mountY = isPolice ? 0.95 : 0.92;
    try {
      const box = new THREE.Box3().setFromObject(g);
      const size = box.getSize(new THREE.Vector3());
      const rawLen = Math.max(size.x, size.z);
      if (isFinite(rawLen) && rawLen > 1e-4) {
        s = RIDE_TARGET_LEN[kind] / rawLen;
        g.scale.setScalar(s);
        const minY = box.min.y * s, maxY = box.max.y * s;
        if (isPolice) { baseY = RIDE_GROUND_Y - minY; mountY = maxY; }
        else { baseY = RIDE_FLY_BELLY - minY; mountY = (maxY - minY) * 0.6; }
      } else {
        g.scale.setScalar(s);
      }
    } catch (e) { g.scale.setScalar(s); }
    return { scale: s, baseY, mountY };
  }
  function rideStart(p, kind) {
    const rig = tokens.get(p.idx);
    if (!rig || rig.dead || rig.ride) return;
    const isPolice = kind !== 'plane';
    const key = isPolice ? 'police' : 'jet';
    let g = null;
    const B = window.Building3D;
    /* img2threejs 精细模型优先（Special3D.police / Special3D.jet——jet.js 未落地时 typeof 检查自然跳过），
     * 再回退 Building3D.props → PropFactories → basic 兜底 */
    if (window.Special3D && typeof window.Special3D[key] === 'function') {
      try { g = window.Special3D[key](); } catch (e) { g = null; }
    }
    if (!g) {
      try {
        if (B && B.props && typeof B.props[key] === 'function') g = B.props[key]();
      } catch (e) { g = null; }
    }
    if (!g && window.PropFactories && typeof window.PropFactories[key] === 'function') {
      try { g = window.PropFactories[key](); } catch (e) { g = null; }
    }
    if (!g) g = isPolice ? basicPolice() : basicJet();
    /* 工厂模型可能自带 userData.anim（如 Building3D.jet 的浮动动画每帧写绝对 position.y，
     * 会和主循环骑乘同步块互相顶飞、把载具拽回地面穿模）——骑乘位姿由同步块全权驱动，必须摘除 */
    if (g.userData) g.userData.anim = null;
    const fit = fitRide(g, isPolice);
    g.traverse(o => { if (o.isMesh) o.castShadow = true; });
    const baseY = fit.baseY, mountY = fit.mountY;
    g.position.set(rig.group.position.x, baseY, rig.group.position.z);
    g.rotation.y = rig.targetRotY;
    fxRoot.add(g);
    rig.ride = { group: g, kind: isPolice ? 'police' : 'plane', mountY, baseY };
    rides.set(p.idx, rig.ride);
    rig.panic = isPolice;             // 押送途中角色惊慌举手
    rig.group.position.y = baseY + mountY;
    /* 警车押送：车顶提示语「XX 收押中」（人物本体由 setTokenHidden 隐藏，只剩交通工具） */
    if (isPolice) {
      try {
        const c = charOfSafe(p);
        const nm = (typeof pname === 'function' ? pname(p) : (c ? c.name : '嫌疑犯'));
        const tag = makeNameSprite(nm + ' 收押中', '#ffd76a');
        tag.position.y = (mountY / fit.scale) + 0.55;   // 局部坐标 = 车顶(世界高/缩放) + 余量
        g.add(tag);
      } catch (e) { /* 提示语失败不影响押送 */ }
    }
    shadowDirty();
  }
  function rideEnd(p) {
    const rig = tokens.get(p.idx);
    if (!rig || !rig.ride) return;
    disposeGroup(rig.ride.group);
    rides.delete(p.idx);
    rig.ride = null;
    rig.panic = false;
    rig.group.position.y = ROAD_TOP_Y;
    shadowDirty();
  }
  /* ---------- token 显隐（羁押入狱 / 出狱 / 押送途中只展示交通工具） ----------
   * 只隐藏角色 rig.group（本体 + 名牌 + 底环），警车/专机挂在 fxRoot 上不受影响；
   * game.js 在入狱时隐藏、出狱时恢复（V3D.setTokenHidden 经 bridge 同步）。 */
  function setTokenHidden(idx, hidden) {
    const rig = tokens.get(idx);
    if (!rig || rig.dead) return;
    rig.group.visible = !hidden;
  }

  /* ================= 3D 骰子掷骰（多阶段手感） =================
   * 时序（均 / spd）：抬手摇晃 0.25 → 抛出翻滚 0.45（≥2 圈双轴复合、角速度衰减）
   *   → 落地弹跳 0.17（高 0.5）→ 弹跳 0.11（高 0.25）→ 定格收敛 0.07 → 结果停留 0.9。
   * 动画段合计 ~1.05/spd，加停留共 ~1.95/spd 后才 resolve（游戏引擎才开始移动角色）。
   * 终态硬约束：静止时 FACE_NORMAL[value] 精确朝上（最后一段 slerp 收敛到 q1 后强制 copy）。
   * 掷骰全程相机纹丝不动：不做骰子特写也不归位运镜（global 真静止 / follow 贴角色）。 */
  function sfxTick() {
    /* sfx.js 现成的短促点击音（view3d 单独加载时 SFX 未定义则静默跳过） */
    try { if (typeof SFX !== 'undefined' && SFX && typeof SFX.tick === 'function') SFX.tick(); } catch (e) { /* ignore */ }
  }
  async function rollDice(value) {
    if (!dice) return;
    diceRolling = true;
    const S = spd();
    const q0 = dice.quaternion.clone();
    const n = new THREE.Vector3(FACE_NORMAL[value][0], FACE_NORMAL[value][1], FACE_NORMAL[value][2]).normalize();
    const align = new THREE.Quaternion().setFromUnitVectors(n, new THREE.Vector3(0, 1, 0));
    const yawQ = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 1, 0), Math.random() * Math.PI * 2);
    const q1 = yawQ.multiply(align);
    const p0 = dice.position.clone();
    const p1 = new THREE.Vector3(
      DICE_HOME.x + (Math.random() - 0.5) * 1.0,
      TILE_TOP + 0.65,
      DICE_HOME.z + (Math.random() - 0.5) * 0.9);

    /* 两根近正交随机翻滚轴；segSpin 返回按进度增量旋转的驱动器（世界系 premultiply），
     * 角速度用 easeOutP 衰减（起手快、收尾慢），最终姿态不依赖此段（由定格段收敛） */
    const axisA = new THREE.Vector3(Math.random() - 0.5, 0.35 + Math.random() * 0.4, Math.random() - 0.5).normalize();
    const axisB = new THREE.Vector3().crossVectors(axisA, new THREE.Vector3(0.3, 0.7, -0.2)).normalize();
    const dqA = new THREE.Quaternion(), dqB = new THREE.Quaternion();
    const segSpin = (thetaA, thetaB) => {
      const easeOutP = k => 1 - (1 - k) * (1 - k);
      let prevK = 0;
      return k => {
        dqA.setFromAxisAngle(axisA, thetaA * (easeOutP(k) - easeOutP(prevK)));
        dqB.setFromAxisAngle(axisB, thetaB * (easeOutP(k) - easeOutP(prevK)));
        dice.quaternion.premultiply(dqA).premultiply(dqB);
        prevK = k;
      };
    };
    const V = (x, y, z) => new THREE.Vector3(x, y, z);

    /* ① 抬手摇晃：小幅高频抖动（~9 周期，包络两端归零），结束精确回到 p0/q0 */
    const shX = (Math.random() - 0.5) * 0.5, shZ = (Math.random() - 0.5) * 0.42;
    await tween(0.25 / S, k => {
      const w = k * Math.PI * 18;
      const env = Math.sin(k * Math.PI);
      dice.quaternion.copy(q0);
      dqA.setFromAxisAngle(axisA, Math.sin(w) * 0.17);
      dice.quaternion.premultiply(dqA);
      dice.position.set(
        p0.x + Math.sin(w) * 0.07 + shX * env,
        p0.y + Math.abs(Math.sin(w * 0.5)) * 0.12,
        p0.z + Math.cos(w * 1.3) * 0.05 + shZ * env);
      shadowDirty();
    });
    dice.position.copy(p0);
    dice.quaternion.copy(q0);

    /* ② 抛出高速翻滚：双轴合计 ≥2 圈，大抛物线飞向落点 */
    const spinFly = segSpin(Math.PI * 2 * 2.75, Math.PI * 2 * 1.9);
    await tween(0.45 / S, k => {
      spinFly(k);
      dice.position.lerpVectors(p0, p1, k);
      dice.position.y += Math.sin(k * Math.PI) * 2.1;
      shadowDirty();
    });

    /* ③ 落地弹跳 1：高度 0.5，弱旋转延续 */
    sfxTick();
    const b1To = V(p1.x + (Math.random() - 0.5) * 0.5, p1.y, p1.z + (Math.random() - 0.5) * 0.4);
    const spinB1 = segSpin(Math.PI * 1.1, Math.PI * 0.6);
    await tween(0.17 / S, k => {
      spinB1(k);
      dice.position.lerpVectors(p1, b1To, k);
      dice.position.y = p1.y + Math.sin(k * Math.PI) * 0.5;
      shadowDirty();
    });

    /* ④ 落地弹跳 2：高度 0.25 */
    sfxTick();
    const b2To = V(b1To.x + (b1To.x - p1.x) * 0.35, p1.y, b1To.z + (b1To.z - p1.z) * 0.35);
    const spinB2 = segSpin(Math.PI * 0.55, Math.PI * 0.3);
    await tween(0.11 / S, k => {
      spinB2(k);
      dice.position.lerpVectors(b1To, b2To, k);
      dice.position.y = p1.y + Math.sin(k * Math.PI) * 0.25;
      shadowDirty();
    });

    /* ⑤ 定格：最后一段 slerp 精确收敛到 q1（点数面朝上），随后 copy 兜底浮点误差 */
    sfxTick();
    const q2 = dice.quaternion.clone();
    await tween(0.07 / S, k => {
      const e = easeInOut(k);
      dice.quaternion.slerpQuaternions(q2, q1, e);
      dice.position.lerpVectors(b2To, p1, e);
      shadowDirty();
    });
    dice.quaternion.copy(q1);
    dice.position.copy(p1);
    diceRolling = false;

    /* ⑥ 结果停留 ≥0.9/spd：金色呼吸高亮保持醒目，停留结束才 resolve（角色才开始移动） */
    await tween(0.9 / S, k => {
      const pulse = (0.3 + Math.sin(k * Math.PI * 6) * 0.22) * (1 - k * 0.4);
      for (let i = 0; i < 6; i++) {
        const m = dice.material[i];
        if (m && m.emissive) { m.emissive.setRGB(1, 0.78, 0.32); m.emissiveIntensity = pulse; }
      }
    });
    for (let i = 0; i < 6; i++) {
      const m = dice.material[i];
      if (m && m.emissive) { m.emissive.setScalar(0); m.emissiveIntensity = 1; }
    }
    shadowDirty();
  }

  /* ================= 相机运镜 ================= */
  function lockControls() { camLocks++; if (controls) controls.enabled = false; }
  function unlockControls() {
    camLocks = Math.max(0, camLocks - 1);
    if (camLocks === 0 && controls) {
      controls.enabled = true;
      if (typeof controls.syncFromCamera === 'function') controls.syncFromCamera();
    }
  }
  function camT(dur, cb) {
    lockControls();
    return tween(dur, cb).then(unlockControls);
  }
  function focusOn(pos3, dist, dur) {
    if (!controls) return Promise.resolve();
    dist = dist || 14; dur = dur || 0.9;
    const t0 = controls.target.clone();
    const p0 = camera.position.clone();
    const t1 = new THREE.Vector3(pos3.x, pos3.y != null ? pos3.y : 1.4, pos3.z);
    const dir = p0.clone().sub(t0);
    if (dir.lengthSq() < 0.001) dir.set(0, 0.8, 1);
    dir.normalize();
    const p1 = t1.clone().add(dir.multiplyScalar(dist)).add(new THREE.Vector3(0, dist * 0.72, 0));
    return camT(dur, k => {
      const e = easeInOut(k);
      controls.target.lerpVectors(t0, t1, e);
      camera.position.lerpVectors(p0, p1, e);
      camera.lookAt(controls.target);
    });
  }
  function focusDefault(dur) {
    if (!controls) return Promise.resolve();
    dur = dur || 0.8;
    const t0 = controls.target.clone();
    const p0 = camera.position.clone();
    const t1 = new THREE.Vector3(HOME_CAM.target[0], HOME_CAM.target[1], HOME_CAM.target[2]);
    const p1 = new THREE.Vector3(HOME_CAM.pos[0], HOME_CAM.pos[1], HOME_CAM.pos[2]);
    return camT(dur, k => {
      const e = easeInOut(k);
      controls.target.lerpVectors(t0, t1, e);
      camera.position.lerpVectors(p0, p1, e);
      camera.lookAt(controls.target);
    });
  }
  function focusTile(idx, dist, dur) {
    const w = worldOf(idx);
    return focusOn({ x: w.x, z: w.z }, dist, dur);
  }
  function flyoverIntro() {
    if (!controls) return Promise.resolve();
    const p0 = new THREE.Vector3(30, 14, 52);
    const p1 = new THREE.Vector3(HOME_CAM.pos[0], HOME_CAM.pos[1], HOME_CAM.pos[2]);
    camera.position.copy(p0);
    const t0 = controls.target.clone();
    const t1 = new THREE.Vector3(HOME_CAM.target[0], HOME_CAM.target[1], HOME_CAM.target[2]);
    return camT(2.3, k => {
      const e = 1 - Math.pow(1 - k, 3);
      camera.position.lerpVectors(p0, p1, e);
      controls.target.lerpVectors(t0, t1, e);
      camera.lookAt(controls.target);
    });
  }

  /* ================= 高亮 / 闪光 / 格子特效 ================= */
  function setActive(idx) {
    activeIdx = idx;
    if (activeRing) activeRing.visible = idx >= 0 && tokens.has(idx);
  }
  function setPhase(phase, player) {
    curPhase = phase || '';
    /* 跟随视角只跟本地玩家自选角色：他人/AI 行动时镜头不切换（停在自选角色处） */
    if (player && player.idx != null && !player.ai &&
        !(typeof NET !== 'undefined' && NET && NET.active && NET.isRemoteSeat(player.idx))) {
      followIdx = player.idx;
    }
    if (phase === 'preroll') userOrbiting = false;
  }
  /* 本地人类玩家（跟随视角的固定跟踪对象） */
  function localHumanIdx() {
    if (typeof G === 'undefined' || !G || !G.players) return -1;
    for (const p of G.players) {
      if (!p.ai && !(typeof NET !== 'undefined' && NET && NET.active && NET.isRemoteSeat(p.idx))) return p.idx;
    }
    return -1;
  }
  function addFlash(i, color, dur, peak) {
    const top = tileTops[i];
    if (!top) return;
    flashList.push({ mat: top.mat, t: 0, dur, color: new THREE.Color(color), peak: peak || 0.6 });
  }
  function flashTile(i) { addFlash(i, 0xfff6d8, 0.7, 0.55); }
  /* 选格模式高亮（路障/拆迁令）：2D 格子在 v3d 下不可见，此前玩家看不到哪些格子可选 */
  let pickSet = null;
  function setPickable(list) {
    if (pickSet) pickSet.forEach(i => { const t = tileTops[i]; if (t && !flashList.some(f => f.mat === t.mat)) { t.mat.emissive.setScalar(0); t.mat.emissiveIntensity = 1; } });
    pickSet = (Array.isArray(list) && list.length) ? new Set(list) : null;
  }
  function tileFx(i, kind) {
    if (!ready) return;
    if (kind === 'firework') { fireworkAtTile(i); return; }
    if (kind === 'up' && buildings[i]) {
      const g = buildings[i].group;
      tween(0.55, k => {
        const sc = k < 0.65 ? 0.3 + (k / 0.65) * 0.92 : 1.22 - ((k - 0.65) / 0.35) * 0.22;
        g.scale.setScalar(Math.max(0.02, sc));
      }).then(() => g.scale.setScalar(1));
      ringBurst(i, 0xffd76a, 4.2);
    } else if (kind === 'down' && buildings[i]) {
      const g = buildings[i].group;
      const bx = g.position.x, bz = g.position.z;
      tween(0.55, k => {
        g.position.x = bx + Math.sin(k * 26) * 0.09 * (1 - k);
        g.position.z = bz + Math.cos(k * 19) * 0.07 * (1 - k);
      }).then(() => { g.position.x = bx; g.position.z = bz; });
      addFlash(i, 0xff8866, 0.5, 0.35);
    } else if (kind === 'buy' || kind === 'won') {
      bannerAtTile(i, kind === 'won' ? '🔨 竞 得' : '已 购 入');
      ringBurst(i, 0xffd76a, 4.2);
    } else if (kind === 'rent') {
      addFlash(i, 0xff3020, 0.65, 0.75);          // 缴租红光脉冲
      ringBurst(i, 0xff4030, 3.2);
    }
  }

  /* 格子上方金色横幅（DOM 不可见时的 3D 替代） */
  function bannerAtTile(i, text) {
    const cv = document.createElement('canvas');
    cv.width = 512; cv.height = 144;
    const c = cv.getContext('2d');
    const r = 34;
    c.beginPath();
    c.moveTo(r, 4); c.lineTo(512 - r, 4); c.quadraticCurveTo(508, 4, 508, 4 + r);
    c.lineTo(508, 140 - r); c.quadraticCurveTo(508, 140, 512 - r, 140);
    c.lineTo(r, 140); c.quadraticCurveTo(4, 140, 4, 140 - r);
    c.lineTo(4, 4 + r); c.quadraticCurveTo(4, 4, r, 4);
    c.closePath();
    const grad = c.createLinearGradient(0, 4, 0, 140);
    grad.addColorStop(0, '#ffe9a8'); grad.addColorStop(0.55, '#f0b429'); grad.addColorStop(1, '#c98a10');
    c.fillStyle = grad; c.fill();
    c.lineWidth = 6; c.strokeStyle = '#7a4c06'; c.stroke();
    c.font = '900 66px "Microsoft YaHei",sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#4a2c04';
    c.fillText(text, 256, 76);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: canvasTexture(cv), transparent: true, depthWrite: false }));
    sp.renderOrder = 9;
    const w = worldOf(i);
    sp.position.set(w.x, TILE_TOP + 2.6, w.z);
    sp.scale.set(0.6, 0.17, 1);
    fxRoot.add(sp);
    tween(1.15, k => {
      const pop = k < 0.22 ? 0.6 + (k / 0.22) * 0.62 : (k < 0.4 ? 1.22 - ((k - 0.22) / 0.18) * 0.12 : 1.1);
      sp.scale.set(5.4 * pop, 1.52 * pop, 1);
      sp.position.y = TILE_TOP + 2.6 + k * 1.1;
      sp.material.opacity = k > 0.7 ? 1 - (k - 0.7) / 0.3 : 1;
    }).then(() => {
      fxRoot.remove(sp);
      sp.material.map.dispose();
      sp.material.dispose();
    });
  }

  /* 金环扩散 */
  function ringBurst(i, color, maxR) {
    const w = worldOf(i);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.09, 8, 40),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.95, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(w.x, TILE_TOP + 0.09, w.z);
    fxRoot.add(ring);
    tween(0.7, k => {
      const s = 0.4 + k * (maxR || 4);
      ring.scale.set(s, s, 1);
      ring.material.opacity = 0.95 * (1 - k);
    }).then(() => {
      fxRoot.remove(ring);
      ring.geometry.dispose();
      ring.material.dispose();
    });
  }

  /* 升级烟花：26 粒彩色火花 + 金环扩散 */
  function fireworkAtTile(idx) {
    if (!ready || !scene) return;
    const w = worldOf(idx);
    const origin = new THREE.Vector3(w.x, TILE_TOP + 0.7, w.z);
    const N = 26;
    const pos = new Float32Array(N * 3);
    const vel = [];
    const col = new Float32Array(N * 3);
    for (let k = 0; k < N; k++) {
      pos[k * 3] = origin.x; pos[k * 3 + 1] = origin.y; pos[k * 3 + 2] = origin.z;
      const a = Math.random() * Math.PI * 2;
      const up = 0.45 + Math.random() * 0.75;
      const sp = 5.5 + Math.random() * 6.5;
      vel.push(new THREE.Vector3(Math.cos(a) * sp * (1 - up * 0.55), up * sp, Math.sin(a) * sp * (1 - up * 0.55)));
      const c = new THREE.Color(FW_COLORS[k % FW_COLORS.length]);
      col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.42, vertexColors: true, transparent: true,
      blending: THREE.AdditiveBlending, depthWrite: false });
    const pts = new THREE.Points(geo, mat);
    fxRoot.add(pts);
    ringBurst(idx, 0xffd76a, 5.6);
    tween(1.25, k => {
      const dt2 = 1 / 60;
      const arr = geo.attributes.position.array;
      for (let j = 0; j < N; j++) {
        vel[j].y -= 13.5 * dt2;
        arr[j * 3] += vel[j].x * dt2;
        arr[j * 3 + 1] += vel[j].y * dt2;
        arr[j * 3 + 2] += vel[j].z * dt2;
        if (arr[j * 3 + 1] < TILE_TOP) { arr[j * 3 + 1] = TILE_TOP; vel[j].set(0, 0, 0); }
      }
      geo.attributes.position.needsUpdate = true;
      mat.opacity = 1 - k;
    }).then(() => {
      fxRoot.remove(pts);
      geo.dispose();
      mat.dispose();
    });
  }

  /* ================= 金钱飘字 / 格子浮字（DOM 层） ================= */
  function floatText(x, y, text, color) {
    const d = document.createElement('div');
    d.className = 'float-txt';
    d.textContent = text;
    d.style.left = x + 'px';
    d.style.top = y + 'px';
    d.style.color = color;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1350);
  }
  function moneyFloat(p, delta) {
    if (!delta) return;
    const sp = tokenScreenPos(p);
    if (!sp) return;
    floatText(sp.x, sp.y - 8,
      (delta > 0 ? '+' : '-') + '$' + Math.abs(Math.round(delta)).toLocaleString('en-US'),
      delta > 0 ? '#3ddc84' : '#ff6b6b');
  }
  function floatAt(idx, text, color) {
    const sp = tileScreenPos(idx);
    if (!sp) return;
    floatText(sp.x, sp.y - 14, text, color || '#ffd166');
  }

  /* ================= 投影 ================= */
  function project(x, y, z) {
    if (!camera || !renderer) return null;
    const v = new THREE.Vector3(x, y, z);
    v.project(camera);
    const rect = renderer.domElement.getBoundingClientRect();
    return {
      x: rect.left + (v.x * 0.5 + 0.5) * rect.width,
      y: rect.top + (-v.y * 0.5 + 0.5) * rect.height,
      behind: v.z > 1,
    };
  }
  function tokenScreenPos(p) {
    const rig = tokens.get(p.idx);
    if (!rig) return null;
    return project(rig.group.position.x, 2.7, rig.group.position.z);
  }
  function tileScreenPos(i) {
    const w = worldOf(i);
    return project(w.x, TILE_TOP + 1.1, w.z);
  }

  /* ---------- 中央 DOM HUD 对位（#board-center 投影到 3D 中央区） ---------- */
  function centerOverlayRect() {
    const cs = [new THREE.Vector3(-16.6, TILE_TOP, -10.6), new THREE.Vector3(16.6, TILE_TOP, -10.6),
      new THREE.Vector3(16.6, TILE_TOP, 10.6), new THREE.Vector3(-16.6, TILE_TOP, 10.6)];
    let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
    for (const v of cs) {
      const p = project(v.x, v.y, v.z);
      if (!p) return null;
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    }
    return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
  }
  function updateCenterOverlay() {
    /* v3d 模式下 #board-center 由 CSS 定为全屏 HUD 容器（见 injectCss），无需逐帧投影 */
  }
  function prepareCenterDom() {
    const el = document.getElementById('board-center');
    if (!el || el.__v3dReady) return;
    el.__v3dReady = true;
    el.style.zIndex = '30';
    /* 视角切换按钮（全局固定 / 跟随角色） */
    const host = document.getElementById('board-wrap') || el.parentElement;
    if (host) {
      camBtn = document.createElement('button');
      camBtn.className = 'v3d-cam-btn';
      camBtn.textContent = '🎥 全局视角';
      camBtn.addEventListener('click', e => {
        e.stopPropagation();
        setCamMode(camMode === 'global' ? 'follow' : 'global');
      });
      host.appendChild(camBtn);
    }
  }
  function injectCss() {
    if (document.getElementById('v3d-style')) return;
    const st = document.createElement('style');
    st.id = 'v3d-style';
    st.textContent =
      'body.v3d-on #board{position:absolute!important;left:0!important;top:0!important;width:100%!important;height:100%!important;background:none!important;box-shadow:none!important;border-radius:0!important;pointer-events:none!important}' +
      'body.v3d-on #board::before{display:none!important}' +
      'body.v3d-on #board .tile{visibility:hidden!important}' +
      'body.v3d-on #table-decor,body.v3d-on #tokens,body.v3d-on #blocks{display:none!important}' +
      /* 中央区：3D 场景已有 logo/金币/牌堆，DOM 只保留功能 HUD（新闻/浮层/状态/掷骰）。
       * #dice-wrap（2D CSS 骰子）保留显示：与 3D 骰子并行摇→定格，保证点数在 HUD 可读 */
      'body.v3d-on #board-center{left:0!important;top:0!important;width:100%!important;height:100%!important;background:none!important;box-shadow:none!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:flex-start!important;gap:10px!important;padding:14px 0 22px!important;pointer-events:none!important}' +
      'body.v3d-on #board-center .ribbon-band,body.v3d-on #board-center .bc-brand,body.v3d-on #board-center .bc-decks{display:none!important}' +
      /* 2D CSS 骰子仅在跟随视角显示（全局视角用桌面 3D 骰子） */
      'body.v3d-on:not(.v3d-follow) #board-center #dice-wrap{display:none!important}' +
      'body.v3d-on #board-center #toasts{position:static!important;left:auto!important;bottom:auto!important;transform:none!important;margin:6px 0 0!important;max-width:70%!important}' +
      'body.v3d-on #board-center .bc-action{background:none!important;box-shadow:none!important;border:none!important;pointer-events:auto!important;align-items:center!important;margin-top:auto!important}' +
      'body.v3d-on #btn-roll{pointer-events:auto}' +
      'body.v3d-on #board-wrap{overflow:hidden}' +
      '.v3d-cam-btn{position:absolute;top:14px;right:14px;z-index:40;pointer-events:auto;padding:8px 14px;border-radius:10px;border:1px solid rgba(240,180,41,.55);background:linear-gradient(180deg,rgba(10,40,26,.92),rgba(6,26,16,.92));color:#ffe9a8;font:700 13px "Microsoft YaHei",sans-serif;letter-spacing:1px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.35)}' +
      '.v3d-cam-btn:hover{border-color:#f0b429;background:linear-gradient(180deg,rgba(24,66,42,.95),rgba(10,36,22,.95))}';
    document.head.appendChild(st);
  }

  /* ================= 拾取（Raycaster → 地契弹窗 / 选格） ================= */
  function bindPointer(el) {
    el.addEventListener('pointerdown', e => {
      downPos = { x: e.clientX, y: e.clientY };
      /* 用户接管相机：从当前机位续接球坐标（follow 模式借此暂停跟随驱动且不弹回预设位） */
      beginUserOrbit();
    });
    /* 拖拽中持续刷新"最后操作"计时（按住不动也不会被 4s 回归打断） */
    window.addEventListener('pointermove', e => {
      if (downPos) markUserOrbit();
    });
    window.addEventListener('pointerup', e => {
      if (!downPos) return;
      const moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
      const dp = downPos;
      downPos = null;
      markUserOrbit();
      if (moved > 6) return;
      if (e.target !== el) return;
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1);
      pickAt(ndc);
    });
    /* 滚轮缩放：两种模式即刻生效；follow 模式下从跟随驱动接管（否则 des.r 无帧驱动消费） */
    el.addEventListener('wheel', () => {
      if (camMode === 'follow') beginUserOrbit();
      else markUserOrbit();
    }, { passive: true });
    el.addEventListener('pointermove', e => {
      const now = performance.now();
      if (now - lastHoverCast < 60) return;
      lastHoverCast = now;
      const rect = el.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1);
      hoverIdx = castTile(ndc);
      el.style.cursor = hoverIdx >= 0 ? 'pointer' : 'grab';
    });
    el.addEventListener('pointerleave', () => { hoverIdx = -1; });
  }
  function castTile(ndc) {
    if (!camera || !scene) return -1;
    const rc = new THREE.Raycaster();
    rc.setFromCamera(ndc, camera);
    const roots = [];
    if (dynRoot) roots.push(dynRoot);
    if (staticRoot) roots.push(staticRoot);
    const hits = rc.intersectObjects(roots, true);
    for (const h of hits) {
      let o = h.object;
      while (o) {
        if (o.userData && o.userData.tileIdx != null) return o.userData.tileIdx;
        o = o.parent;
      }
    }
    return -1;
  }
  function pickAt(ndc) {
    const i = castTile(ndc);
    if (i < 0) return;
    if (onTileClickExternal) { onTileClickExternal(i); return; }
    /* 默认行为：转发给 DOM 格子（uix 的地契弹窗 / 选格逻辑原样生效） */
    const el = document.querySelector('.tile[data-idx="' + i + '"]');
    if (el) { try { el.click(); } catch (e) { /* ignore */ } }
  }

  /* ================= 奖池金币随奖池缩放 ================= */
  function refreshPot() {
    const pot = (typeof G !== 'undefined' && G) ? Math.max(0, G.pot || 0) : 0;
    potScaleTgt = 1 + Math.min(0.9, Math.sqrt(pot) / 130);
  }

  /* ================= 主循环 ================= */
  function startLoop() {
    if (running && rafId) return;
    running = true;
    clock = clock || new THREE.Clock();
    const loopFn = () => {
      if (!running) { rafId = 0; return; }
      rafId = requestAnimationFrame(loopFn);
      const dt = Math.min(0.05, clock.getDelta());
      if (!renderer || !container || container.offsetParent === null) return;  // 对局界面隐藏时休眠
      worldT += dt;

      /* tween 队列 */
      for (let i = anims.length - 1; i >= 0; i--) {
        const a = anims[i];
        a.t += dt;
        const k = Math.min(1, a.t / a.dur);
        try { a.cb(k); } catch (e) { window.__errs && window.__errs.push('v3d tween: ' + e.message); }
        if (k >= 1) { anims.splice(i, 1); a.res(); }
      }

      /* 角色 */
      for (const [, rig] of tokens) {
        if (!rig.dead) {
          rig.phase += dt * (rig.mode === 'walk' ? 13 * spd() : 2.2);
          animToken(rig, dt, worldT);
        }
      }
      /* 骑乘同步 */
      for (const [, rig] of tokens) {
        const ride = rig.ride;
        if (!ride) continue;
        ride.group.position.x = rig.group.position.x;
        ride.group.position.z = rig.group.position.z;
        ride.group.position.y = ride.baseY + (ride.kind === 'plane'
          ? Math.sin(worldT * 5) * 0.16 : Math.sin(worldT * 9) * 0.045);
        rig.group.position.y = ride.group.position.y + ride.mountY;
      }

      /* 归属旗迎风摆动 */
      for (let i = 0; i < flags.length; i++) {
        const f = flags[i];
        if (f && f.pivot) f.pivot.rotation.y = Math.sin(worldT * 2.6 + i * 1.3) * 0.26;
      }

      /* 幸运格金环脉冲 */
      if (luckyRing && luckyRing.visible) {
        const s = 1 + Math.sin(worldT * 4.2) * 0.09;
        luckyRing.scale.setScalar(s);
        luckyRing.children[0].material.opacity = 0.62 + Math.sin(worldT * 4.2) * 0.3;
      }
      /* 行动角色高亮 */
      if (activeRing && activeRing.visible) {
        const T = tokens.get(activeIdx);
        if (T && !T.dead) {
          activeRing.position.set(T.group.position.x, ROAD_TOP_Y + 0.04, T.group.position.z);
          activeRing.scale.setScalar(1 + Math.sin(worldT * 4) * 0.08);
        } else activeRing.visible = false;
      }

      /* 格子闪光衰减 + 悬停微亮 */
      for (let i = flashList.length - 1; i >= 0; i--) {
        const f = flashList[i];
        f.t += dt;
        const k = f.t / f.dur;
        if (k >= 1) { f.mat.emissive.setScalar(0); f.mat.emissiveIntensity = 1; flashList.splice(i, 1); continue; }
        f.mat.emissive.copy(f.color);
        f.mat.emissiveIntensity = Math.sin(k * Math.PI) * f.peak;
      }
      if (prevHoverIdx !== hoverIdx) {
        const pm = (prevHoverIdx >= 0 && tileTops[prevHoverIdx]) ? tileTops[prevHoverIdx].mat : null;
        if (pm && !flashList.some(f => f.mat === pm) && !(pickSet && pickSet.has(prevHoverIdx))) { pm.emissive.setScalar(0); pm.emissiveIntensity = 1; }
        prevHoverIdx = hoverIdx;
      }
      if (hoverIdx >= 0 && tileTops[hoverIdx] && !flashList.some(f => f.mat === tileTops[hoverIdx].mat)) {
        tileTops[hoverIdx].mat.emissive.setHex(0xfff2cc);
        tileTops[hoverIdx].mat.emissiveIntensity = 0.14;
      }
      /* 选格高亮：可选格金色脉冲（悬停格更亮） */
      if (pickSet) {
        const pulse = 0.22 + Math.sin(worldT * 5) * 0.1;
        pickSet.forEach(i => {
          const t = tileTops[i];
          if (!t || flashList.some(f => f.mat === t.mat)) return;
          t.mat.emissive.setHex(0xffd23c);
          t.mat.emissiveIntensity = i === hoverIdx ? 0.5 : pulse;
        });
      }

      /* 奖池金币呼吸 */
      if (potPile) {
        potScaleCur += (potScaleTgt - potScaleCur) * Math.min(1, dt * 3);
        potPile.scale.setScalar(potScaleCur);
      }

      /* 相机模式：'global' 固定全局机位（不漂移）；'follow' 低机位跟随行动角色走棋盘。
       * 拖拽即打断跟随（beginUserOrbit 从当前机位续接）；停手 4s 后平滑回归标准跟随机位 */
      const followActive = camMode === 'follow' && followIdx >= 0 && camLocks === 0;
      const followDriving = followActive && !userOrbiting;
      if (followActive && userOrbiting && performance.now() - lastUserOrbitT > ORBIT_RESUME_MS) {
        userOrbiting = false;    // 无操作超时 → 交还标准跟随（chase lerp 从当前机位平滑接管，不瞬移）
      }
      if (controls && followDriving) {
        const T = tokens.get(followIdx);
        if (T && !T.dead) {
          const tp = T.group.position;
          const fwd = new THREE.Vector3(Math.sin(T.targetRotY || 0), 0, Math.cos(T.targetRotY || 0));
          const chase = T.mode === 'walk' ? Math.min(1, dt * 4.5) : Math.min(1, dt * 3);
          /* 跟随机位：贴在角色身后上方，视线越过角色头顶看向前进方向 */
          camFw1.copy(tp).addScaledVector(fwd, -4.6).add(CAM_UP2.set(0, 3.4, 0));
          camFw2.copy(tp).addScaledVector(fwd, 3.2); camFw2.y = 1.2;
          camera.position.lerp(camFw1, chase);
          controls.target.lerp(camFw2, chase);
          camera.lookAt(controls.target);
        }
      } else if (controls && followActive && userOrbiting) {
        /* 用户自由轨道：目标点逐渐吸附到被跟随角色（保留用户 yaw/pitch/距离），角色行走时镜头随行 */
        const T = tokens.get(followIdx);
        if (T && !T.dead) {
          camFw1.set(T.group.position.x, T.group.position.y + 1.15, T.group.position.z);
          controls.target.lerp(camFw1, Math.min(1, dt * 4));
        }
      }

      /* 工厂内置动画（喷泉 / 时钟 / 霓虹 / 警灯…）+ 角色待机微动画（呼吸/眨眼/豆豆屏幕滚动…）。
       * 此前只驱动 staticRoot/fxRoot，tokenRoot 下角色的 userData.anim 从未执行（tu/doudou v3 交付时发现）。 */
      const B = window.Building3D;
      if (B && typeof B.runAnims === 'function') {
        B.runAnims(staticRoot, worldT, dt);
        B.runAnims(fxRoot, worldT, dt);
        B.runAnims(tokenRoot, worldT, dt);
      }

      /* 运动中的帧才刷新阴影贴图（静态场景性能优化） */
      let motion = diceRolling || rides.size > 0 || flashList.length > 0;
      if (!motion) { for (const [, rig] of tokens) { if (rig.mode === 'walk' && !rig.dead) { motion = true; break; } } }
      if (motion) shadowDirty();

      applyKeyboardCam(dt);   /* 键盘辅助镜头（WASD/方向键） */
      if (controls && !followDriving) controls.update(dt);
      /* 跟随/骑乘时相机最低高度 > 沿途建筑最高（~3.0）：低仰角自由轨道也不把镜头压进建筑/地砖内部 */
      if (followActive && camera.position.y < FOLLOW_MIN_Y) camera.position.y = FOLLOW_MIN_Y;
      renderer.render(scene, camera);
      updateCenterOverlay();
    };
    rafId = requestAnimationFrame(loopFn);
  }

  function resize() {
    if (!renderer || !container) return;
    const rect = container.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return;
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    refreshHomeCam();   /* 宽高比变化 → 重算 fit 机位（global 归位目标随之更新） */
    /* global 静止机位随宽高比直接吸附新 fit 位（瞬移、无运镜）；
     * 用户拖拽过视角 / 跟随模式 / 运镜进行中则不打扰，等下次 focusDefault 归位 */
    if (camera && controls && camMode === 'global' && !userOrbiting && camLocks === 0) {
      camera.position.set(HOME_CAM.pos[0], HOME_CAM.pos[1], HOME_CAM.pos[2]);
      controls.target.set(HOME_CAM.target[0], HOME_CAM.target[1], HOME_CAM.target[2]);
      camera.lookAt(controls.target);
      if (typeof controls.syncFromCamera === 'function') controls.syncFromCamera();
    }
  }

  /* ================= 对局场景初始化 / 重置 ================= */
  function abortTransient() {
    /* 挂起的 tween 直接丢弃、不 resolve：rollDice / flyoverIntro 是多段 await 链，若放行当前段，
     * 后续段会继续在新一局的共享对象（骰子/相机）上播放；被作废流程永久挂起是这里的正确语义 */
    anims.length = 0;
    camLocks = 0;
    diceRolling = false;
    rides.clear();
    followIdx = -1;
    flashList.length = 0;
    try { setPickable(null); } catch (e) { /* ignore */ }
    if (fxRoot) {
      /* 瞬态特效（横幅 Sprite 的 canvas 纹理 / 光环 / 粒子 / 骑乘车辆）中途打断也要释放 GPU 资源：此前只 remove 不 dispose */
      while (fxRoot.children.length) disposeGroup(fxRoot.children[0]);
    }
    if (controls) { controls.enabled = true; }
    if (dice) dice.position.set(DICE_HOME.x, TILE_TOP + 0.65, DICE_HOME.z);
  }
  /* 完全私有的小对象（高亮环/幸运环）：几何与材质都不与工厂共享，可一并释放 */
  function disposeOwned(g) {
    if (!g) return;
    g.traverse(o => {
      if (o.isMesh) {
        try { if (o.geometry) o.geometry.dispose(); } catch (e) { /* ignore */ }
        try { if (o.material && !Array.isArray(o.material)) o.material.dispose(); } catch (e) { /* ignore */ }
      }
    });
    if (g.parent) g.parent.remove(g);
  }
  function resetDynamic() {
    abortTransient();
    tokens.forEach(rig => disposeRig(rig));
    tokens.clear();
    for (let i = 0; i < buildings.length; i++) {
      if (buildings[i]) { disposeGroup(buildings[i].group); buildings[i] = null; }
    }
    for (let i = 0; i < flags.length; i++) {
      if (flags[i]) { disposeGroup(flags[i].group); flags[i] = null; }
    }
    blockMeshes.forEach(g => disposeGroup(g));
    blockMeshes.clear();
    /* 每局重建的常驻环此前只从 dynRoot 移除、从未 dispose → 每次重开泄漏 3 几何 + 3 材质 */
    disposeOwned(activeRing); activeRing = null;
    disposeOwned(luckyRing); luckyRing = null;
    if (dynRoot) while (dynRoot.children.length) dynRoot.remove(dynRoot.children[0]);
    if (tokenRoot) while (tokenRoot.children.length) tokenRoot.remove(tokenRoot.children[0]);
    /* dynRoot 清空后需重建常驻对象 */
    buildActiveRing();
    buildLuckyRing();
    luckyIdx = -2; activeIdx = -1; hoverIdx = -1; prevHoverIdx = -1;
    potScaleCur = 1; potScaleTgt = 1;
  }
  function initGameScene() {
    if (typeof THREE === 'undefined') return false;
    if (!init(document.getElementById('board-wrap'))) return false;
    injectCss();
    document.body.classList.add('v3d-on');
    buildStaticScene();
    prepareCenterDom();
    resetDynamic();
    buildSpecials();
    buildTokens();
    ready = true;
    updateTileAll();
    rebuildBlocks();
    refreshPot();
    resize();
    flushPending();
    shadowDirty();
    followIdx = localHumanIdx();   /* 跟随视角默认锁定自选角色 */
    startLoop();
    const skipFly = (typeof location !== 'undefined' &&
      new URLSearchParams(location.search).get('nofly') === '1');
    if (skipFly) {
      camera.position.set(HOME_CAM.pos[0], HOME_CAM.pos[1], HOME_CAM.pos[2]);
      controls.target.set(HOME_CAM.target[0], HOME_CAM.target[1], HOME_CAM.target[2]);
      camera.lookAt(controls.target);
    } else {
      Promise.resolve(flyoverIntro()).then(() => {
        try { console.info('[view3d] flyover done, cam=(' +
          camera.position.x.toFixed(1) + ',' + camera.position.y.toFixed(1) + ',' + camera.position.z.toFixed(1) + ')'); } catch (e) { /* ignore */ }
      });
    }
    return true;
  }

  /* ================= 导出（兼容 v2 接口 + ui 层接口） ================= */
  return {
    init, show,
    initGameScene, updateTileAll, flushPending,
    moveToken, removeToken, updateTile, rebuildBlocks, rollDice, resize,
    flashTile, tileFx, fireworkAtTile, setActive, setPhase,
    rideStart, rideEnd, setTokenHidden, moneyFloat, floatAt,
    focusOn, focusTile, focusDefault, flyoverIntro,
    tokenScreenPos, tileScreenPos, centerOverlayRect,
    refreshPot, abortTransient, worldOf,
    /* 静态合批（性能）：供 smoke_perf_budget.js 做三角形数/包围盒守恒断言 */
    mergeStaticGroup, setPickable,
    get mergeEnabled() { return MERGE_STATIC; },
    /* 模块E 只读测试钩子：马路环参数 / 环线行走点 / 环线折线 / 环组 */
    roadPointOf, ringPath,
    roadRingGroup: () => roadRing,
    set onTileClick(fn) { onTileClickExternal = fn; },
    get ready() { return ready; },
    get scene() { return scene; },
    get camera() { return camera; },
    get controls() { return controls; },
    /* 只读：renderer.info.memory（geometries/textures）供重开泄漏回归断言 */
    get renderer() { return renderer; },
  };
})();

/* ============================================================
 * 自动桥接：把 3D 渲染层挂到 ui（uix.js）上 —— 游戏引擎零改动。
 * 所有 ui.* 渲染调用同时驱动 3D 场景；DOM 部分（面板/日志/弹窗）
 * 保持原逻辑。任何 3D 异常都不会影响游戏流程。
 * ============================================================ */
(function () {
  /* uix.js 用顶层 const 导出（全局词法绑定，不挂 window），在无遮蔽的 IIFE 作用域先捕获 */
  const uiGlobal = (typeof window.ui === 'object' && window.ui) || (typeof ui !== 'undefined' ? ui : null);
  function bridge() {
    const ui = uiGlobal;
    if (!ui || typeof ui.initGameScene !== 'function' || ui.__v3dBridge) return;
    const errs = () => (window.__errs = window.__errs || []);
    ui.__v3dBridge = true;
    const wrapSync = (name, fn) => {
      const orig = ui[name];
      if (typeof orig !== 'function') return;
      ui[name] = function () {
        const r = orig.apply(this, arguments);
        try { fn.apply(this, arguments); } catch (e) { errs().push('v3d.' + name + ': ' + e.message); }
        return r;
      };
    };
    const wrapAsync = (name, fn) => {
      const orig = ui[name];
      if (typeof orig !== 'function') return;
      ui[name] = function () {
        const r = orig.apply(this, arguments);
        let extra;
        try { extra = fn.apply(this, arguments); } catch (e) { errs().push('v3d.' + name + ': ' + e.message); }
        if (extra && typeof extra.then === 'function') {
          return Promise.all([Promise.resolve(r), extra]).then(res => res[0]);
        }
        return r;
      };
    };
    wrapAsync('initGameScene', () => { V3D.initGameScene(); });
    wrapAsync('moveToken', (p, a, o) => V3D.moveToken(p, a, o));
    wrapSync('removeToken', p => V3D.removeToken(p));
    wrapSync('updateTile', i => V3D.updateTile(i));
    wrapSync('updateTileAll', () => V3D.updateTileAll());
    wrapSync('renderBlocks', () => V3D.rebuildBlocks());
    wrapSync('flashTile', i => V3D.flashTile(i));
    wrapSync('tileFx', (i, k) => { if (k !== 'firework') V3D.tileFx(i, k); });
    wrapSync('fireworkAtTile', i => V3D.fireworkAtTile(i));
    wrapSync('setActive', i => V3D.setActive(i));
    wrapSync('setPhase', (ph, p) => V3D.setPhase(ph, p));
    wrapAsync('rollDice', v => V3D.rollDice(v));
    wrapSync('rideStart', (p, k) => V3D.rideStart(p, k));
    wrapSync('rideEnd', p => V3D.rideEnd(p));
    wrapSync('setTokenHidden', (idx, hidden) => V3D.setTokenHidden(idx, hidden));
    wrapSync('moneyFloat', (p, d) => V3D.moneyFloat(p, d));
    wrapSync('floatAt', (i, t, c) => V3D.floatAt(i, t, c));
    wrapSync('updateHUD', () => V3D.refreshPot());
    wrapSync('showGameOver', () => { V3D.setPhase('over', null); V3D.focusDefault(1.6); });
    wrapSync('abortTransient', () => V3D.abortTransient());
    /* 选格模式（路障/拆迁令）→ 3D 可选格高亮 */
    try { ui.onPick = list => V3D.setPickable(list); } catch (e) { errs().push('v3d.onPick: ' + e.message); }
    try { console.info('[view3d] 3D 渲染层已接管（Three.js r147 + Building3D 工厂）'); } catch (e) { /* ignore */ }
  }
  if (typeof V3D !== 'undefined') bridge();
})();
