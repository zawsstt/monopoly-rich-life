/* ============================================================
 * 音乐模块：主界面 / 对局双场景 mp3 播放列表（独立于系统音效开关）
 *  - 主界面：bgm_menu.mp3 单曲循环（首屏加载器已预取成 blob，起播零等待）
 *  - 对局：bgm_game1→4 顺序循环，切歌空 2.6s
 *  - 开关持久化 localStorage.df_bgm；自动播放被浏览器拦截时，在首个手势 / 页面可见时补一次播放
 *  - 幂等：正在播放时任何点击 / 按键 / 重复 setMode 都不会重头播放
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
  function onGesture() { tryResume(); }
  document.addEventListener('pointerdown', onGesture, true);
  document.addEventListener('keydown', onGesture, true);
  document.addEventListener('touchstart', onGesture, { passive: true, capture: true });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) tryResume(); });

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
    debug() { return { mode, on, playing: !!audio && !audio.paused, ended: !!audio && audio.ended, t: audio ? audio.currentTime : 0, src: audio ? audio.src : '' }; },
  };
})();
