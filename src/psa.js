/* ============================================================
 * 净化心灵彩蛋（PSA）：触发判定 + 押送演出 + 影院模式视频管控 + 诚信档案
 * 设计文档：D:\minimax\f1\DESIGN_PSA_EGG.md（本文件 = 单机/同屏主链路 P0/P1/P3/P4；联机同步 P2 未含）
 *  - 触发：本局 G.stats[seat].jailCaused ≥ 3（归因计数由 game.js sendToJail 维护，本模块只做判定与演出）
 *          同局一次（G.stats[seat].psa 落锁），跨局可再触发；诬陷卡 / 路障逼停 32 号格均已由引擎归因
 *  - 演出：复用 ui.arrestCutscene → 警车押送到 32 拘留所格（不置 inJail，无服刑逻辑）→ 人物消失
 *  - 管控：触发者本机终端进入影院模式锁屏；管控期 PSA.shouldSkip(seat) 令 playTurn 自动跳过
 *          AI / 联机远程座位无本机终端可锁 → 公告 + skipNext 代替（规则完备性兜底）
 *  - 视频：串行 HEAD 探测 gongyi_movie/视频A..F.mp4（3s/个），全无则降级「文字净化」30s 倒计时
 *  - 铁律：任何故障都有限时出口 —— ended / 文字倒计时 / dur+45s 看门狗，玩家永不被永久锁死
 *  - 防逃避：遮罩存在期间 beforeunload/pagehide → localStorage.df_honor_v1.violated（含时间戳）+ dishonored
 *            下局 newGame 读 dishonored（一次性消费）→ 初始资金 −20%（取整百）+「失信人员」角标
 *  - 改过自新：管控后至结算 jailCaused 不再增长 → df_honor_v1.reformed++（成就 sp_reformed）
 *  - 信任模型：与 df_career_v1 同级（本机 localStorage 自觉模型，清缓存即消失，设计文档 §5.4 已声明）
 *  - 豁免：?psa=0 或 localStorage.df_psa_exempt='1' → 纯演出（押送 + 跳一回合，无视频无锁屏）
 * ============================================================ */
'use strict';

const PSA = (() => {
  /* ---------- 常量 ---------- */
  const HONOR_KEY = 'df_honor_v1';            // 诚信档案（localStorage）
  const LAST_KEY = 'df_psa_last';             // 上次播放的片源序号（sessionStorage，避免连续重复）
  const EXEMPT_KEY = 'df_psa_exempt';         // 教育豁免开关（'1' = 豁免）
  const MOVIE_BASES = ['gongyi_movie/', '../gongyi_movie/'];   // 仓库根 gongyi_movie/：同 Web 根优先，其次上级（serve 仓库根时页面位于 /monopoly/）
  const MOVIE_NAMES = ['视频A', '视频B', '视频C', '视频D', '视频E', '视频F'];   // 改名后的片源（规避原始标题）
  const MOVIE_COUNT = MOVIE_NAMES.length;     // 探测 视频A.mp4 .. 视频F.mp4
  const HEAD_TIMEOUT_MS = 3000;               // 单个 HEAD 超时
  const PROBE_BUDGET_MS = 15000;              // 探测总预算（超时即用已有结果）
  const CUSTODY_POS = 32;                     // 拘留所格（BOARD[32] gotojail）
  const THRESHOLD = 3;                        // 触发阈值：致他人入狱人次
  const TEXT_SEC = 30;                        // 无视频 → 文字净化 30s
  const TEXT_ON_VIDEO_FAIL_SEC = 60;          // 视频加载/解码失败 → 文字净化上限 60s
  const WATCHDOG_SLACK_SEC = 45;              // 看门狗：时长 + 45s 无条件解锁
  const UNKNOWN_VIDEO_SEC = 120;              // 元数据未知时的保守时长假设（硬上限）
  const READY_TIMEOUT_MS = 15000;             // readyState 15s 仍 <3 → 视为加载失败
  const PENDING_FALLBACK_MS = 18000;          // 待接入态超时：18s 内片源没接上 → 文字净化兜底
  const TEXT_ROTATE_MS = 10000;               // 文字净化文案轮播间隔
  const TEXT_PSAS = [
    { icon: '🕊️', t: '善意是最好的护身符', d: '你已让三位对手先后身陷囹圄。停止伤害，财富才有意义。' },
    { icon: '⚖️', t: '规则守护每一个人', d: '路障可以拦住对手，却拦不住失去信任的自己。' },
    { icon: '🌱', t: '改过自新，为时未晚', d: '接下来的对局里，不再让任何人因你入狱——你能做到。' },
  ];

  /* ---------- 状态 ---------- */
  let lock = null;                 // 当前影院锁 { el, kind, mode, released, release(), ... }
  const custody = new Set();       // 管控中的座位（shouldSkip 依据）
  const matches = new Map();       // seat -> { gid, baseline, reformed }（改过自新基线）
  let prewarmed = null;            // { gid, pick, video }（距阈值一步时预热的片源，触发后直接复用）
  const trace = { triggered: 0, released: 0, releasedBy: null, violations: 0, mode: null, prewarmed: null };   // 诊断/冒烟观测

  /* ---------- 小工具 ---------- */
  const sleepMs = ms => new Promise(r => setTimeout(r, ms));
  const $q = (s, el) => { try { return (el || document).querySelector(s); } catch (e) { return null; } };
  const fmtTime = s => { s = Math.max(0, Math.floor(s || 0)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
  function U() { return (typeof ui !== 'undefined' && ui) ? ui : null; }
  function nameOf(p) { try { return pname(p); } catch (e) { return '玩家' + (((p && p.idx) | 0) + 1); } }
  function localHuman(p) {
    if (!p || p.ai) return false;
    try { if (typeof NET !== 'undefined' && NET && NET.active && typeof NET.isRemoteSeat === 'function' && NET.isRemoteSeat(p.idx)) return false; } catch (e) { /* */ }
    return true;
  }
  function exempt() {
    try { const q = new URLSearchParams((typeof location !== 'undefined' && location.search) || ''); if (q.get('psa') === '0') return true; } catch (e) { /* */ }
    try { return localStorage.getItem(EXEMPT_KEY) === '1'; } catch (e) { return false; }
  }

  /* ================= 诚信档案 df_honor_v1 =================
   * { v, eggSeen, violated, violateAt, dishonored, reformed }
   *  eggSeen   本机触发彩蛋次数（成就 sp_purify）
   *  violated  逃避次数（管控遮罩存在期间页面终止）；violateAt 最近一次时间戳（成就 sp_dishonor）
   *  dishonored 待执行的失信惩戒（下一局开局消费：资金 −20% + 角标）
   *  reformed  改过自新次数（成就 sp_reformed） */
  function honorDefaults() { return { v: 1, eggSeen: 0, violated: 0, violateAt: 0, dishonored: false, reformed: 0 }; }
  function honorRead() {
    const d = honorDefaults();
    let raw = null;
    try { raw = JSON.parse(localStorage.getItem(HONOR_KEY) || 'null'); } catch (e) { raw = null; }
    if (raw && typeof raw === 'object') {
      ['eggSeen', 'violated', 'violateAt', 'reformed'].forEach(k => { const n = Number(raw[k]); if (isFinite(n) && n >= 0) d[k] = n; });
      d.dishonored = !!raw.dishonored;
    }
    return d;
  }
  function honorWrite(h) { try { localStorage.setItem(HONOR_KEY, JSON.stringify(h)); } catch (e) { /* 存储满/禁用：档案退化为本局内存态 */ } }
  function honorMark(key, n) { const h = honorRead(); h[key] = (h[key] | 0) + (n == null ? 1 : n); honorWrite(h); return h; }
  function recordViolation() {
    const h = honorRead();
    h.violated = (h.violated | 0) + 1;
    h.violateAt = Date.now();
    h.dishonored = true;
    honorWrite(h);
    trace.violations++;
    return h;
  }
  /* 新局开局消费失信标记（game.js newGame 调用）：返回惩戒参数或 null */
  function honorConsume() {
    const h = honorRead();
    if (!h.dishonored) return null;
    h.dishonored = false;
    honorWrite(h);
    return { penalty: true, factor: 0.8, tag: '失信人员', violateAt: h.violateAt };
  }
  /* 页面终止信号：只有影院遮罩存在时才算逃避（切窗/失焦不算，设计文档 §5.1）；同一次管控只记一次 */
  function onPageGone() {
    try {
      if (!lock || lock.released || lock.violationLogged) return;
      lock.violationLogged = true;
      recordViolation();
    } catch (e) { /* */ }
  }

  /* ================= 视频资产探测 =================
   * 串行 HEAD（同一序号先试同 Web 根、再试上级目录），3s/个；404 或异常 = 无该片；总预算内尽量多收 */
  function headOk(url) {
    return new Promise(res => {
      let done = false;
      let ctl = null;
      const fin = ok => { if (!done) { done = true; res(!!ok); } };
      const timer = setTimeout(() => { fin(false); try { if (ctl) ctl.abort(); } catch (e) { /* */ } }, HEAD_TIMEOUT_MS);
      try {
        if (typeof fetch !== 'function') { clearTimeout(timer); fin(false); return; }
        ctl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        fetch(url, { method: 'HEAD', cache: 'no-store', signal: ctl ? ctl.signal : undefined })
          .then(r => { clearTimeout(timer); fin(r && r.ok); })
          .catch(() => { clearTimeout(timer); fin(false); });
      } catch (e) { clearTimeout(timer); fin(false); }
    });
  }
  async function probeVideos(opts) {
    const bases = (opts && opts.bases) || MOVIE_BASES;
    const count = (opts && opts.count) || MOVIE_COUNT;
    const head = (opts && opts.head) || headOk;
    const budget = (opts && opts.budgetMs) || PROBE_BUDGET_MS;
    const found = [];
    const deadline = Date.now() + budget;
    outer: for (let n = 1; n <= count; n++) {
      for (const base of bases) {
        if (Date.now() > deadline) break outer;
        const url = base + encodeURIComponent(MOVIE_NAMES[n - 1]) + '.mp4';   // 中文名按 URL 编码请求
        let ok = false;
        try { ok = await head(url); } catch (e) { ok = false; }
        if (ok) { found.push({ n, url, dur: 0 }); break; }   // 同序号只认首个命中的 base
      }
    }
    return found;
  }
  function pickMovie(found) {
    if (!found || !found.length) return null;
    let last = -1;
    try { last = parseInt(sessionStorage.getItem(LAST_KEY) || '-1', 10); } catch (e) { last = -1; }
    let idx = Math.floor(Math.random() * found.length);
    if (found.length > 1 && found[idx].n === last) idx = (idx + 1) % found.length;
    try { sessionStorage.setItem(LAST_KEY, String(found[idx].n)); } catch (e) { /* */ }
    return found[idx];
  }

  /* ================= 影院锁（唯一的锁屏原语） =================
   * opts: { kind:'video'|'text', src, durSec, slackSec, onRelease(why) }
   *  - z-index 1000（css）：压住对局 UI / 过场 900 / 拍卖 900；触发必在对局中，不与 board-boot/boot 冲突
   *  - 出口只有三个：ended（视频播完 / 文字倒计时归零）、watchdog（时长+45s）、abort（回菜单/重开拆除，不计逃避）
   *  - 守卫：无 controls、自绘只读进度条、右键/拖拽/键盘 capture 拦截、seek 回拨、变速归 1、暂停即续播 */
  function _lock(opts) {
    if (lock && !lock.released) return lock;
    opts = opts || {};
    const kind = opts.kind === 'video' ? 'video' : (opts.kind === 'pending' ? 'pending' : 'text');
    const slack = (opts.slackSec != null) ? Math.max(0, +opts.slackSec) : WATCHDOG_SLACK_SEC;
    const onRelease = typeof opts.onRelease === 'function' ? opts.onRelease : null;

    const el = document.createElement('div');
    el.id = 'psa-lock';
    el.className = 'psa-' + kind;
    el.innerHTML =
      '<div class="psa-dim"></div>' +
      '<div class="psa-stage" role="dialog" aria-modal="true" aria-label="心灵净化">' +
        '<div class="psa-head">🕊️ 心灵净化 · 强制公益教育 <em>不可跳过</em></div>' +
        '<div class="psa-media"></div>' +
        '<div class="psa-progress" aria-hidden="true"><i></i></div>' +
        '<div class="psa-time"><span data-t1>00:00</span> / <span data-t2>--:--</span></div>' +
        '<div class="psa-hint"></div>' +
        '<div class="psa-foot">净化完成后自动回到对局 · 管控期间你的回合将被代为跳过 · 中途离开将记入失信档案</div>' +
      '</div>';
    document.body.appendChild(el);
    try { document.body.classList.add('psa-noscroll'); } catch (e) { /* */ }
    const raf = (typeof requestAnimationFrame === 'function') ? requestAnimationFrame : (f => setTimeout(f, 16));
    raf(() => { try { el.classList.add('show'); } catch (e) { /* */ } });

    const L = { el, kind, mode: kind, released: false, releasedBy: null, violationLogged: false,
      timeouts: [], intervals: [], cleanups: [], video: null, startedAt: Date.now(), totalSec: 0 };
    const later = (fn, ms) => { const t = setTimeout(fn, ms); L.timeouts.push(t); return t; };
    const every = (fn, ms) => { const t = setInterval(fn, ms); L.intervals.push(t); return t; };

    const release = why => {
      if (L.released) return;
      L.released = true;
      L.releasedBy = why || 'ended';
      L.timeouts.forEach(t => clearTimeout(t));
      L.intervals.forEach(t => clearInterval(t));
      L.cleanups.forEach(f => { try { f(); } catch (e) { /* */ } });
      if (L.video) {
        try { L.video.pause(); } catch (e) { /* */ }
        try { L.video.removeAttribute('src'); L.video.load(); } catch (e) { /* */ }
      }
      try { document.body.classList.remove('psa-noscroll'); } catch (e) { /* */ }
      try { el.classList.remove('show'); } catch (e) { /* */ }
      setTimeout(() => { try { el.remove(); } catch (e) { /* */ } }, 350);
      if (lock === L) lock = null;
      trace.released++;
      trace.releasedBy = L.releasedBy;
      if (why !== 'abort' && onRelease) { try { onRelease(L.releasedBy); } catch (e) { /* */ } }
    };
    L.release = release;
    lock = L;

    /* —— 指针 / 键盘拦截 —— */
    const stop = e => { try { e.preventDefault(); e.stopPropagation(); } catch (e2) { /* */ } };
    try { el.addEventListener('contextmenu', stop); el.addEventListener('dragstart', stop); el.addEventListener('selectstart', stop); } catch (e) { /* */ }
    /* 键盘 capture 全量拦截：空格/方向键/Tab 不能操作底层 UI；F12/Ctrl+W 等浏览器级快捷键不可防（设计文档 §4.3 务实边界） */
    const keyBlock = e => stop(e);
    try {
      document.addEventListener('keydown', keyBlock, true);
      document.addEventListener('keyup', keyBlock, true);
      L.cleanups.push(() => { document.removeEventListener('keydown', keyBlock, true); document.removeEventListener('keyup', keyBlock, true); });
    } catch (e) { /* */ }

    /* —— 只读进度 / 时间 / 提示 —— */
    const bar = $q('.psa-progress i', el), t1 = $q('[data-t1]', el), t2 = $q('[data-t2]', el), hint = $q('.psa-hint', el), media = $q('.psa-media', el);
    const setProgress = (cur, total) => {
      try {
        const pct = total > 0 ? Math.max(0, Math.min(100, cur / total * 100)) : 0;
        if (bar) bar.style.width = pct.toFixed(1) + '%';
        if (t1) t1.textContent = fmtTime(cur);
        if (t2) t2.textContent = total > 0 ? fmtTime(total) : '--:--';
      } catch (e) { /* */ }
    };
    const setHint = txt => { try { if (hint) hint.textContent = txt || ''; } catch (e) { /* */ } };

    /* —— 看门狗：时长 + slack 无条件解锁 —— */
    let watchdog = 0;
    const armWatchdog = sec => {
      if (watchdog) clearTimeout(watchdog);
      watchdog = later(() => release('watchdog'), Math.max(1, sec + slack) * 1000);
    };

    /* —— 文字净化（降级模式 / 视频失败兜底）—— */
    const startText = sec => {
      L.mode = 'text';
      const total = Math.max(1, +sec || TEXT_SEC);
      const t0 = Date.now();
      L.totalSec = total;
      try { if (media) media.innerHTML = '<div class="psa-text"><div class="psa-text-ico"></div><div class="psa-text-t"></div><div class="psa-text-d"></div></div>'; } catch (e) { /* */ }
      let k = Math.floor(Math.random() * TEXT_PSAS.length);
      const paint = () => {
        const c = TEXT_PSAS[k % TEXT_PSAS.length];
        try {
          const a = $q('.psa-text-ico', el), b = $q('.psa-text-t', el), d = $q('.psa-text-d', el);
          if (a) a.textContent = c.icon; if (b) b.textContent = c.t; if (d) d.textContent = c.d;
        } catch (e) { /* */ }
      };
      paint();
      every(() => { k++; paint(); }, TEXT_ROTATE_MS);
      setHint('📖 请阅读上方公益文案，倒计时结束后自动回到对局');
      setProgress(0, total);
      every(() => {
        const cur = (Date.now() - t0) / 1000;
        setProgress(Math.min(cur, total), total);
        if (cur >= total) release('ended');
      }, 250);
      armWatchdog(total);
    };

    /* —— 视频模式（kind==='video' 直接启动，或待接入态由 attach 启动）—— */
    let started = false;
    const startVideo = (src, knownDurIn, reuseEl) => {
      if (L.released || started) return;
      started = true;
      L.mode = 'video';
      let v = reuseEl || null;
      if (!v) { try { v = document.createElement('video'); } catch (e) { v = null; } }
      if (!v) { startText(TEXT_ON_VIDEO_FAIL_SEC); return; }
      L.video = v;
      try {
        v.setAttribute('playsinline', ''); v.setAttribute('webkit-playsinline', '');
        v.setAttribute('controlslist', 'nodownload noplaybackrate noremoteplayback');
        v.controls = false; v.preload = 'auto'; v.disablePictureInPicture = true;
        v.style.display = '';
        if (!reuseEl) v.src = src;
        if (media) media.appendChild(v);
      } catch (e) { /* */ }
      const knownDur = knownDurIn > 0 ? +knownDurIn : 0;
      let dur = knownDur || UNKNOWN_VIDEO_SEC;
      let lastTick = 0, retried = false, failed = false, playing = false;
      L.totalSec = knownDur;
      setProgress(0, knownDur);
      armWatchdog(dur);
      setHint('⏳ 片源加载中，请稍候…');   // 网页端首帧到达前有可见的加载态，不再是一片黑屏 + 00:00 / --:--
      const on = (type, fn) => { try { v.addEventListener(type, fn); } catch (e) { /* */ } };
      const play = () => { let p = null; try { p = v.play(); } catch (e) { p = null; } return (p && typeof p.then === 'function') ? p : Promise.resolve(); };
      const videoFailed = () => {
        if (failed || L.released) return;
        failed = true;
        try { v.pause(); } catch (e) { /* */ }
        try { v.remove(); } catch (e) { /* */ }
        L.video = null;
        startText(Math.min(knownDur > 0 ? knownDur : TEXT_ON_VIDEO_FAIL_SEC, TEXT_ON_VIDEO_FAIL_SEC));   // 内部重新武装看门狗
      };
      L.videoFailed = videoFailed;
      on('loadedmetadata', () => {
        const d = (isFinite(v.duration) && v.duration > 1) ? Math.min(v.duration, 600) : 0;
        if (d) { dur = d; L.totalSec = d; setProgress(v.currentTime || 0, d); armWatchdog(d); }
      });
      on('playing', () => { if (!playing) { playing = true; setHint(v.muted ? '🔇 静音中 · 点击画面可开启声音' : ''); } });
      on('waiting', () => { if (playing) setHint('⏳ 缓冲中…'); });
      on('timeupdate', () => {
        const t = v.currentTime || 0;
        if (t > lastTick + 0.75 && !v.seeking) { try { v.currentTime = lastTick; } catch (e) { /* */ } return; }   // 快进回拨
        if (t > lastTick) lastTick = t;
        setProgress(t, L.totalSec || dur);
        if (playing && hint && hint.textContent === '⏳ 缓冲中…') setHint(v.muted ? '🔇 静音中 · 点击画面可开启声音' : '');
      });
      on('seeking', () => { if ((v.currentTime || 0) > lastTick + 0.75) { try { v.currentTime = lastTick; } catch (e) { /* */ } } });
      on('ratechange', () => { if (v.playbackRate !== 1) { try { v.playbackRate = 1; } catch (e) { /* */ } } });
      on('pause', () => { if (!L.released && !failed && !v.ended) play().catch(() => { /* */ }); });   // 暂停无效
      on('ended', () => release('ended'));
      on('error', () => {
        if (!retried) { retried = true; lastTick = 0; try { v.load(); play().catch(() => { /* */ }); } catch (e) { videoFailed(); } }   // 重载源一次
        else videoFailed();
      });
      later(() => { if (!L.released && !failed && !(v.readyState >= 3)) videoFailed(); }, READY_TIMEOUT_MS);
      /* 起播链：有声 → 静音兜底（autoplay 策略）→ 手势按钮；三者都不改变「不可跳过」 */
      const showStartButton = () => {
        try {
          setHint('▶ 浏览器要求手动开始播放（开始后同样不可跳过）');
          const b = document.createElement('button');
          b.className = 'psa-start';
          b.textContent = '▶ 开始净化';
          b.addEventListener('click', () => { play().then(() => { setHint(v.muted ? '🔇 静音中 · 点击画面可开启声音' : ''); try { b.remove(); } catch (e) { /* */ } }).catch(() => { /* */ }); });
          if (media) media.appendChild(b);
        } catch (e) { /* */ }
      };
      try { v.muted = false; } catch (e) { /* */ }
      play().catch(() => {
        try { v.muted = true; } catch (e) { /* */ }
        setHint('🔇 浏览器限制了自动播放声音，已静音起播 · 点击画面可开启声音');
        play().catch(showStartButton);
      });
      /* 音量/静音不构成逃避：点击画面取消静音 */
      try {
        const stage = $q('.psa-stage', el);
        if (stage) stage.addEventListener('click', e => {
          if (e && e.target && e.target.classList && e.target.classList.contains('psa-start')) return;
          if (v.muted) { try { v.muted = false; setHint(''); } catch (e2) { /* */ } }
        });
      } catch (e) { /* */ }
    };

    /* —— 待接入态：遮罩先落（杜绝探测/排队期间的交互缝隙），片源就位后 attach；超时兜底文字净化 —— */
    let pendingTimer = 0;
    L.attach = o => {
      if (L.released || started) return;
      if (pendingTimer) { clearTimeout(pendingTimer); pendingTimer = 0; }
      if (o && o.kind === 'video' && o.src) startVideo(o.src, o.durSec > 0 ? o.durSec : 0, o.reuseEl || null);
      else { started = true; startText((o && o.durSec > 0) ? o.durSec : TEXT_SEC); }
    };
    if (kind === 'text') { started = true; startText(opts.durSec > 0 ? opts.durSec : TEXT_SEC); return L; }
    if (kind === 'video') { startVideo(opts.src, opts.durSec > 0 ? opts.durSec : 0, opts.reuseEl || null); return L; }
    L.mode = 'pending';
    setHint('📡 正在接入公益频道…');
    setProgress(0, 0);
    pendingTimer = later(() => { pendingTimer = 0; if (!L.released && !started) L.attach({ kind: 'text', durSec: TEXT_ON_VIDEO_FAIL_SEC }); }, PENDING_FALLBACK_MS);
    return L;
  }
  function isLocked() { return !!lock && !lock.released; }

  /* ================= 触发与演出 ================= */
  /* game.js sendToJail 归因计数后调用：阈值 ≥3 且本局未触发 → 落锁并演出（返回 Promise，演出失败不影响对局） */
  function notifyJailCaused(gid, seat) {
    try {
      if (seat == null || typeof G === 'undefined' || !G.stats || !G.stats[seat]) return Promise.resolve(false);
      if (gid !== G.gameId || G.over) return Promise.resolve(false);
      const st = G.stats[seat];
      if (st.psa) return Promise.resolve(false);                       // 同局一次
      /* 距阈值一步：后台预热片源（网页端 30MB 片源冷启动要等首帧，预取后触发即播） */
      if ((st.jailCaused | 0) === THRESHOLD - 1 && !exempt()) { try { if (localHuman(G.players[seat])) prewarmMovie(gid); } catch (e) { /* */ } }
      if ((st.jailCaused | 0) < THRESHOLD) return Promise.resolve(false);
      st.psa = 1;                                                       // 落锁：本局不再触发
      trace.triggered++;
      return (exempt() ? performExempt(gid, seat) : performPurify(gid, seat)).catch(() => false);
    } catch (e) { return Promise.resolve(false); }
  }

  /* 押送到 32 拘留所格：复用 sendToJail 的视觉路径（隐藏人物 → 警车 → 逐格快进），但不置 inJail / jailTurns / jailed */
  async function escortToCustody(gid, p) {
    const u = U();
    const N = (typeof BOARD !== 'undefined' && BOARD && BOARD.length) ? BOARD.length : 40;
    if (!u) { p.pos = CUSTODY_POS; return; }
    if (p.pos !== CUSTODY_POS) {
      try {
        u.setTokenHidden(p.idx, true);
        u.rideStart(p, 'police');
        let guard = 0;
        while (p.pos !== CUSTODY_POS && guard++ < N) {
          if (gid !== G.gameId) break;
          p.pos = (p.pos + 1) % N;
          await u.moveToken(p, true, { fast: true });
        }
        await sleepMs(400);
      } catch (e) { /* 演出异常不阻断管控 */ }
      try { u.rideEnd(p); } catch (e) { /* */ }
    }
    if (gid !== G.gameId) return;
    if (p.pos !== CUSTODY_POS) { p.pos = CUSTODY_POS; try { u.moveToken(p, false); } catch (e) { /* */ } }
    try { u.setTokenHidden(p.idx, true); } catch (e) { /* 人物消失（留在 32 号格） */ }
    try { u.updatePlayers(); } catch (e) { /* */ }
  }

  async function performPurify(gid, seat) {
    const p = G.players[seat];
    if (!p || !p.alive) return false;
    const u = U();
    const local = localHuman(p);
    if (u && u.arrestCutscene && !G.over) { try { await u.arrestCutscene(p, '🕵️ 净化心灵 · 屡次坑害他人，强制传唤'); } catch (e) { /* */ } }
    if (gid !== G.gameId || G.over || !p.alive) return false;
    if (u) {
      try { u.news(`🕊️ 突发：${nameOf(p)} 因屡次致人入狱，被强制带走“净化心灵”！`); } catch (e) { /* */ }
      try { u.log(`🕊️ ${nameOf(p)} 屡次致人入狱，被强制净化心灵`, 'bad'); } catch (e) { /* */ }
    }
    if (!local) {
      /* AI / 联机远程座位：无本机终端可锁 → 公告 + 跳一回合（当前 AI 路障策略实际不会触发，此分支为规则完备性兜底） */
      p.skipNext = (p.skipNext | 0) + 1;
      if (u) { try { u.toast(`🕊️ ${nameOf(p)} 被强制带走净化心灵，下回合暂停`, '🕊️'); } catch (e) { /* */ } }
      return true;
    }
    honorMark('eggSeen');
    await escortToCustody(gid, p);
    if (gid !== G.gameId || G.over) return false;
    p.custody = true;
    custody.add(seat);
    matches.set(seat, { gid, baseline: G.stats[seat].jailCaused | 0, reformed: null });
    if (u) {
      /* 若触发发生在本人回合的掷骰前（用诬陷卡/路障坑人后仍轮到自己掷），立即释放挂起的掷骰等待：
       * playTurn 收到 -1 直接返回、轮到下家；否则人已进拘留所还能掷骰走棋 */
      try { if (typeof u.cancelRollFor === 'function') u.cancelRollFor(p); } catch (e) { /* */ }
      try { u.updatePlayers(); } catch (e) { /* */ }
      try { u.toast(`🕊️ ${nameOf(p)} 被押往拘留所，接受心灵净化…`, '🕊️'); } catch (e) { /* */ }
    }
    runCustodyMedia(gid, seat);   // 异步：遮罩立即落下；引擎照常推进，其他玩家不受影响；管控期该座位回合由 shouldSkip 跳过
    return true;
  }

  /* ?psa=0 教育豁免：只演出，不锁屏 —— 押送 + 跳一回合 */
  async function performExempt(gid, seat) {
    const p = G.players[seat];
    if (!p || !p.alive) return false;
    const u = U();
    if (u && u.arrestCutscene && !G.over) { try { await u.arrestCutscene(p, '🕵️ 净化心灵 · 教育豁免模式（仅演出）'); } catch (e) { /* */ } }
    if (gid !== G.gameId || G.over || !p.alive) return false;
    if (localHuman(p)) honorMark('eggSeen');   // 彩蛋已触发（豁免只是不锁屏，成就照得）
    await escortToCustody(gid, p);
    if (gid !== G.gameId) return false;
    p.skipNext = (p.skipNext | 0) + 1;
    if (u) {
      try { u.setTokenHidden(seat, false); u.updatePlayers(); } catch (e) { /* */ }
      try { u.toast(`🕊️ ${nameOf(p)} 被押往拘留所接受教育（豁免模式：不锁屏，跳过一回合）`, '🕊️'); } catch (e) { /* */ }
    }
    return true;
  }

  /* 距阈值一步（jailCaused === THRESHOLD-1）：后台预热片源（隐藏 video 预取首段），触发时免探测免等首帧 */
  async function prewarmMovie(gid) {
    try {
      if (exempt() || typeof G === 'undefined' || gid !== G.gameId || prewarmed) return;
      const found = await probeVideos();
      const pick = pickMovie(found);
      if (!pick || typeof G === 'undefined' || gid !== G.gameId) return;
      let v = null;
      try {
        v = document.createElement('video');
        v.setAttribute('playsinline', '');
        v.muted = true; v.preload = 'auto';
        v.style.display = 'none';
        v.src = pick.url;
        (document.body || document.documentElement).appendChild(v);
        v.load();
      } catch (e) { v = null; }
      prewarmed = { gid, pick, video: v };
      trace.prewarmed = pick.n;
    } catch (e) { /* 预热失败不影响主链路 */ }
  }
  function dropPrewarm() {
    if (prewarmed && prewarmed.video) { try { prewarmed.video.pause(); prewarmed.video.removeAttribute('src'); prewarmed.video.remove(); } catch (e) { /* */ } }
    prewarmed = null;
  }

  /* 管控媒体：立即落锁（待接入态，杜绝探测/排队间隙还能操作游戏）→ 探测/复用预热片源 → attach 视频/文字 */
  async function runCustodyMedia(gid, seat) {
    while (isLocked()) { await sleepMs(250); if (gid !== G.gameId || !custody.has(seat)) return; }   // 同屏两人先后触发：串行
    if (typeof G === 'undefined' || gid !== G.gameId || !custody.has(seat)) return;
    const done = () => purifyFinish(gid, seat);
    const L = _lock({ kind: 'pending', onRelease: done });
    const pw = (prewarmed && prewarmed.gid === gid) ? prewarmed : null;
    prewarmed = null;
    let pick = pw ? pw.pick : null;
    if (!pick) { try { const found = await probeVideos(); if (found.length) pick = pickMovie(found); } catch (e) { pick = null; } }
    if (typeof G === 'undefined' || gid !== G.gameId || !custody.has(seat)) { try { L.release('abort'); } catch (e) { /* */ } return; }
    trace.mode = pick ? 'video' : 'text';
    if (pick) L.attach({ kind: 'video', src: pick.url, durSec: 0, reuseEl: pw ? pw.video : null });
    else { dropPrewarm(); L.attach({ kind: 'text', durSec: TEXT_SEC }); }
  }

  /* 管控结束：custody 解除、人物重现、公告（回合衔接由 playTurn 自然完成） */
  function purifyFinish(gid, seat) {
    custody.delete(seat);
    if (typeof G === 'undefined' || gid !== G.gameId) return;
    const p = G.players && G.players[seat];
    if (!p) return;
    p.custody = false;
    const u = U();
    if (u) {
      try { u.setTokenHidden(seat, false); } catch (e) { /* */ }
      try { u.updatePlayers(); } catch (e) { /* */ }
      try { u.toast(`🕊️ ${nameOf(p)} 净化完成，重新入局`, '🕊️'); } catch (e) { /* */ }
      try { u.log(`🕊️ ${nameOf(p)} 净化完成，重新入局`, 'info'); } catch (e) { /* */ }
    }
  }

  function shouldSkip(seat) { return custody.has(seat); }

  /* 回菜单 / 重开 / 回合异常兜底（ui.abortTransient 调用）：拆遮罩、清管控，不计逃避 */
  function abort() {
    custody.clear();
    matches.clear();
    dropPrewarm();
    try {
      if (typeof G !== 'undefined' && G.players) {
        G.players.forEach(p => { if (p && p.custody) { p.custody = false; const u = U(); if (u) { try { u.setTokenHidden(p.idx, false); } catch (e) { /* */ } } } });
      }
    } catch (e) { /* */ }
    if (lock) { const L = lock; lock = null; try { L.release('abort'); } catch (e) { /* */ } }
  }

  /* 结算前（uix.showGameOver 首行，先于 CAREER.commit）：改过自新判定 → df_honor_v1.reformed
   * 返回 { seats:[触发过彩蛋的本机座位], reformed:[改过自新的座位] } 供结算行展示 */
  function onMatchEnd() {
    const out = { seats: [], reformed: [] };
    try {
      if (typeof G === 'undefined' || !G.stats) return out;
      const gid = G.gameId;
      let newly = 0;
      matches.forEach((m, seat) => {
        if (m.gid !== gid) { matches.delete(seat); return; }
        out.seats.push(seat);
        const st = G.stats[seat];
        if (m.reformed == null) {   // 同局重复结算不重复计
          m.reformed = !!(st && st.psa && (st.jailCaused | 0) === (m.baseline | 0));
          if (m.reformed) newly++;
        }
        if (m.reformed) out.reformed.push(seat);
      });
      if (newly) honorMark('reformed', newly);
    } catch (e) { /* */ }
    return out;
  }

  function state() {
    return { locked: isLocked(), mode: lock ? lock.mode : null, custody: Array.from(custody),
      matches: Array.from(matches.entries()).map(([seat, m]) => ({ seat, gid: m.gid, baseline: m.baseline, reformed: m.reformed })),
      trace: Object.assign({}, trace), honor: honorRead() };
  }

  /* 页面终止信号：beforeunload 覆盖关页/刷新/跳转，pagehide 覆盖移动端与 bfcache */
  (function wire() {
    try {
      if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
      window.addEventListener('beforeunload', onPageGone);
      window.addEventListener('pagehide', onPageGone);
    } catch (e) { /* */ }
  })();

  return {
    notifyJailCaused, shouldSkip, isLocked, abort, honorConsume, onMatchEnd, exempt, state, honor: honorRead,
    /* 冒烟 / 诊断钩子（smoke_psa.js） */
    __test: {
      lock: _lock, current: () => lock, probeVideos, headOk, pickMovie, honorRead, honorWrite, recordViolation, onPageGone, purifyFinish,
      prewarmMovie, dropPrewarm, prewarmState: () => prewarmed,
      honorReset: () => { try { localStorage.removeItem(HONOR_KEY); } catch (e) { /* */ } },
      custody, matches, trace,
      C: { HONOR_KEY, MOVIE_BASES, MOVIE_COUNT, HEAD_TIMEOUT_MS, CUSTODY_POS, THRESHOLD, TEXT_SEC, TEXT_ON_VIDEO_FAIL_SEC, WATCHDOG_SLACK_SEC, UNKNOWN_VIDEO_SEC, READY_TIMEOUT_MS, PENDING_FALLBACK_MS },
    },
  };
})();
window.PSA = PSA;   // game.js / uix.js 经 window.PSA 判存后调用（psa.js 在加载清单中位于 game.js/uix.js 之后，避免词法绑定 TDZ）
