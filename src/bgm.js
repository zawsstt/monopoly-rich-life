/* ============================================================
 * 音乐模块：主界面 / 对局双场景 mp3 播放列表（独立于系统音效开关）
 *  - 主界面：bgm_menu.mp3 单曲循环（首屏加载器已预取成 blob，起播零等待）
 *  - 对局：bgm_game1→4 顺序循环，切歌空 2.6s
 *  - 开关持久化 localStorage.df_bgm；自动播放被浏览器拦截时，在首个手势 / 页面可见时补一次播放
 *  - 幂等：正在播放时任何点击 / 按键 / 重复 setMode 都不会重头播放
 *  - 移动端页面可见性：hidden/pagehide 暂停（保留元素与进度），回可见从原进度续播
 *    （不重头、不计逃避）；曲间空档计时器随隐藏冻结，回前台以短空档续排下一曲
 *  - iOS 静音键（响铃/静音拨片）没有任何网页 API 可检测：HTMLAudio 走系统播放
 *    通道，静音键拨到静音时 BGM 自然无声——这是平台限制而非 bug，按设计决策
 *    D7 接受（符合 iOS 用户预期），不做伪检测、不做 WebAudio 绕过
 * ============================================================ */
'use strict';

const BGM = (() => {
  const MENU_SRC = 'assets/audio/bgm_menu.mp3';
  const MENU = [(window.__preloaded && window.__preloaded[MENU_SRC]) || MENU_SRC];
  const GAME = ['assets/audio/bgm_game1.mp3', 'assets/audio/bgm_game2.mp3', 'assets/audio/bgm_game3.mp3', 'assets/audio/bgm_game4.mp3'];
  let audio = null;
  let mode = null;          // 'menu' | 'game' | null
  let idx = 0;
  let gapTimer = 0;         // 对局切歌空档计时器（空档期内不允许手势把已结束的曲目重播）
  let on = (function () { try { return localStorage.getItem('df_bgm') !== '0'; } catch (e) { return true; } })();

  function stop() {
    if (gapTimer) { clearTimeout(gapTimer); gapTimer = 0; }
    if (audio) {
      try { audio.pause(); } catch (e) { /* ignore */ }
      audio.onended = null;
      try { audio.src = ''; } catch (e) { /* ignore */ }
      audio = null;
    }
  }
  function attempt() {
    if (!audio) return;
    const p = audio.play();
    if (p && p.catch) p.catch(() => { /* 自动播放被拦截：等手势 */ });
  }

  function play() {
    if (!on || !mode) return;
    stop();
    const list = mode === 'menu' ? MENU : GAME;
    audio = new Audio();
    audio.src = list[idx % list.length];
    audio.volume = 0.35;
    audio.loop = (mode === 'menu');
    if (mode !== 'menu') {
      audio.addEventListener('ended', () => { gapTimer = setTimeout(() => { gapTimer = 0; idx++; play(); }, 2600); });
    }
    attempt();
  }

  /* 只在“有曲目却因拦截而暂停”时补一次 play；正在播放、曲间空档、已结束一律不动 */
  function tryResume() {
    if (!on || !mode) return;
    if (!audio) { play(); return; }
    if (audio.paused && !audio.ended && !gapTimer) attempt();
  }
  /* --- 移动端页面可见性策略 -----------------------------------------------
   * iOS Safari / 微信 WebView 切后台、锁屏会掐断 HTMLAudio：这里在
   * visibilitychange(hidden) 与 pagehide 时主动 pause（保留 audio 元素与播放
   * 进度，不 stop()、不销毁、不重置 src），回到可见时走 tryResume() 从原进度
   * 续播。对局曲间 2.6s 空档计时器一并冻结，回前台以 600ms 短空档续排下一曲。
   * 幂等可重入：hidden/visible/pagehide 重复到达只生效一次——pause 只在
   * 「正在播」时调用，resume 只消费一次 hiddenPaused/gapFrozen 标志。
   * 不计逃避：BGM 模块不写诚信档案，任何隐藏/恢复都不产生逃避记录（防逃避
   * 是 PSA 模块的独立逻辑，互不相干）。
   * iOS 静音键：网页无任何 API 能检测响铃/静音拨片（no way to detect），且
   * HTMLAudio 走系统播放通道——静音键静音时 BGM 自然无声。按设计决策 D7
   * 接受该平台行为，不做伪检测、不做 WebAudio 绕过。 */
  let hiddenPaused = false;   /* 因页面隐藏而暂停 → 回前台要续播 */
  let gapFrozen = false;      /* 曲间空档计时器被冻结 → 回前台要续排 */
  function pauseForHidden() {
    if (gapTimer) { clearTimeout(gapTimer); gapTimer = 0; gapFrozen = true; }
    if (audio && !audio.paused && !audio.ended) {
      try { audio.pause(); } catch (e) { /* ignore */ }
      hiddenPaused = true;
    }
  }
  function resumeFromHidden() {
    hiddenPaused = false;
    if (gapFrozen) { gapFrozen = false; gapTimer = setTimeout(() => { gapTimer = 0; idx++; play(); }, 600); }
    tryResume();   /* 有暂停曲目 → 原进度续播；空档期 / 未解锁 / 已结束自然不动 */
  }
  function onGesture() { tryResume(); }
  document.addEventListener('pointerdown', onGesture, true);
  document.addEventListener('keydown', onGesture, true);
  document.addEventListener('touchstart', onGesture, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseForHidden(); else resumeFromHidden(); });
  window.addEventListener('pagehide', pauseForHidden);   /* iOS 切后台 / 页面跳转兜底，同 hidden 处理 */
  window.addEventListener('pageshow', e => { if (e && e.persisted) resumeFromHidden(); });   /* bfcache 回退兜底（幂等） */

  return {
    setMode(m) {
      const next = m || null;
      if (!next) { mode = null; stop(); return; }
      if (next !== mode) { mode = next; idx = 0; if (on) play(); else stop(); return; }
      if (on) tryResume();   /* 同模式重复调用：确保在播，但绝不重头 */
    },
    setEnabled(v) {
      on = !!v;
      try { localStorage.setItem('df_bgm', on ? '1' : '0'); } catch (e) { /* ignore */ }
      if (!on) stop();
      else if (mode) tryResume();
    },
    isEnabled() { return on; },
    getMode() { return mode; },
    debug() { return { mode, on, playing: !!audio && !audio.paused, ended: !!audio && audio.ended, t: audio ? audio.currentTime : 0, src: audio ? audio.src : '', hiddenPaused, gapFrozen }; },
  };
})();
