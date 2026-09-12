/* ============================================================
 * 音乐模块：主界面 / 对局双场景 mp3 播放列表（独立于系统音效开关）
 *  - 主界面：bgm_menu.mp3 单曲循环
 *  - 对局：bgm_game1→2→3 顺序循环
 *  - 开关持久化 localStorage.df_bgm；首次用户手势后自动起播（浏览器自动播放策略）
 * ============================================================ */
'use strict';

const BGM = (() => {
  const MENU = ['assets/audio/bgm_menu.mp3'];
  const GAME = ['assets/audio/bgm_game1.mp3', 'assets/audio/bgm_game2.mp3', 'assets/audio/bgm_game3.mp3', 'assets/audio/bgm_game4.mp3'];
  let audio = null;
  let mode = null;          // 'menu' | 'game' | null
  let idx = 0;
  let on = (function () { try { return localStorage.getItem('df_bgm') !== '0'; } catch (e) { return true; } })();
  let unlocked = false;

  function stop() {
    if (audio) {
      try { audio.pause(); } catch (e) { /* ignore */ }
      audio.onended = null;
      try { audio.src = ''; } catch (e) { /* ignore */ }
      audio = null;
    }
  }

  function play() {
    if (!on || !mode || !unlocked) return;
    stop();
    const list = mode === 'menu' ? MENU : GAME;
    audio = new Audio();
    audio.src = list[idx % list.length];
    audio.volume = 0.35;
    audio.loop = (mode === 'menu');
    if (mode !== 'menu') {
      audio.addEventListener('ended', () => { setTimeout(() => { idx++; play(); }, 2600); });   /* 切歌空 2.6s，不突兀 */
    }
    const p = audio.play();
    if (p && p.catch) p.catch(() => { /* 自动播放被拦截：等手势 */ });
  }

  /* 首次任意点击解锁（浏览器要求用户手势后才能出声） */
  document.addEventListener('pointerdown', function unlock() {
    unlocked = true;
    document.removeEventListener('pointerdown', unlock, true);
    if (mode && on) play();
  }, true);

  return {
    setMode(m) {
      const changed = (m !== mode);
      mode = m || null;
      if (mode === 'menu') idx = 0;
      if (!mode) { stop(); return; }
      if (changed) { idx = 0; if (on) play(); }
      else if (on) play();
    },
    setEnabled(v) {
      on = !!v;
      try { localStorage.setItem('df_bgm', on ? '1' : '0'); } catch (e) { /* ignore */ }
      if (!on) stop(); else if (mode) play();
    },
    isEnabled() { return on; },
    getMode() { return mode; },
  };
})();
