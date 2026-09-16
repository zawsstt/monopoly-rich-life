/* ============================================================
 * 音效引擎：Kenney CC0 采样 + WebAudio 合成音 + 轻量 BGM
 * ============================================================ */
'use strict';

const SFX = (() => {
  let ctx = null;
  let master = null;
  let sampleGain = null;
  let bgmGain = null;
  const buffers = {};
  let enabled = (function () { try { return localStorage.getItem('df_sfx') !== '0'; } catch (e) { return true; } })();
  let bgmOn = false;
  let bgmTimer = null;

  function ensure() {
    if (ctx) return ctx;
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { return null; }
    master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
    sampleGain = ctx.createGain(); sampleGain.gain.value = 0.9; sampleGain.connect(master);
    bgmGain = ctx.createGain(); bgmGain.gain.value = 0.16; bgmGain.connect(master);
    return ctx;
  }

  async function loadSamples() {
    const c = ensure(); if (!c) return;
    const files = {
      dice: 'assets/sfx/dieThrow1.ogg',
      shuffle: 'assets/sfx/dieShuffle1.ogg',
      cardSlide: 'assets/sfx/cardSlide1.ogg',
      cardPlace: 'assets/sfx/cardPlace3.ogg',
      chips: 'assets/sfx/chipsCollide1.ogg',
      chips2: 'assets/sfx/chipsCollide2.ogg',
    };
    for (const [k, url] of Object.entries(files)) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        buffers[k] = await c.decodeAudioData(await res.arrayBuffer());
      } catch (e) { /* file:// 下静默失败，合成音兜底 */ }
    }
  }

  function playSample(k, vol = 1, rate = 1) {
    const c = ensure(); if (!c || !buffers[k] || !enabled) return;
    const src = c.createBufferSource();
    src.buffer = buffers[k]; src.playbackRate.value = rate;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(g); g.connect(sampleGain);
    src.start();
  }

  /* --- 幂等的 context 恢复 / 挂起（移动端手势解锁 + 页面可见性） -----------
   * - 只在对应状态下调用 resume()/suspend()：已 running / suspended 时重复
   *   事件不会产生第二次调用（幂等、可重入）。
   * - iOS 部分场景（某些 WebView、快速点按）只把 touchend 算作合法手势，故在
   *   main.js 各按钮 pointerdown/click 之外补充 touchend 解锁路径。
   * - iOS 静音键（响铃/静音拨片）同样没有任何网页 API 可检测，WebAudio 输出
   *   也受其影响——属平台限制而非 bug，如实接受，不做伪检测、不做绕过。 */
  function resumeCtx() {
    const c = ctx;   /* 不在此创建 ctx：创建只发生在 ensure() 的解锁/首播路径 */
    if (c && (c.state === 'suspended' || c.state === 'interrupted')) {
      try { const p = c.resume(); if (p && p.catch) p.catch(() => { /* ignore */ }); } catch (e) { /* ignore */ }
      return true;
    }
    return false;
  }
  function suspendCtx() {
    const c = ctx;
    if (c && c.state === 'running') {
      try { const p = c.suspend(); if (p && p.catch) p.catch(() => { /* ignore */ }); } catch (e) { /* ignore */ }
      return true;
    }
    return false;
  }
  /* 手势兜底：iOS 某些场景只有 touchend 被算作用户手势（running 时 no-op，幂等） */
  document.addEventListener('touchend', () => { const c = ensure(); if (c) resumeCtx(); }, { passive: true, capture: true });
  /* 页面隐藏挂起 ctx（省电 + 规避 iOS 后台抢占），回前台恢复；两者皆幂等 */
  document.addEventListener('visibilitychange', () => { if (document.hidden) suspendCtx(); else resumeCtx(); });

  /* --- 合成音 --- */
  function tone(freq, dur, { type = 'sine', vol = 0.2, when = 0, slide = 0 } = {}) {
    const c = ensure(); if (!c || !enabled) return;
    const t0 = c.currentTime + when;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }

  let hopFlip = false;
  const api = {
    unlock() { const c = ensure(); if (c) resumeCtx(); },
    loadSamples,
    setEnabled(v) { enabled = v; try { localStorage.setItem('df_sfx', v ? '1' : '0'); } catch (e) { /* ignore */ } if (bgmGain) bgmGain.gain.value = v ? 0.16 : 0; if (!v) api.bgmStop(); },
    isEnabled() { return enabled; },

    click()   { tone(760, 0.06, { type:'triangle', vol:0.15 }); },
    hover()   { tone(520, 0.04, { type:'sine', vol:0.06 }); },
    tick()    { tone(1250, 0.025, { type:'sine', vol:0.045 }); },
    hop()     { hopFlip = !hopFlip; tone(hopFlip ? 620 : 560, 0.07, { type:'square', vol:0.07 }); },
    dice()    { playSample('dice', 0.9) || tone(220, 0.25, { type:'square', vol:0.1, slide:-120 }); },
    card()    { playSample('cardSlide', 0.8); setTimeout(() => playSample('cardPlace', 0.7), 260); },
    cash()    { tone(880, 0.1, { vol:0.16 }); tone(1318, 0.16, { vol:0.16, when:0.09 }); playSample('chips', 0.5); },
    pay()     { tone(590, 0.1, { vol:0.15 }); tone(415, 0.16, { vol:0.15, when:0.09 }); },
    buy()     { tone(523, 0.12, { vol:0.15 }); tone(659, 0.12, { when:0.09, vol:0.15 }); tone(784, 0.2, { when:0.18, vol:0.16 }); playSample('chips2', 0.6); },
    build()   { tone(330, 0.08, { type:'triangle', vol:0.16 }); tone(440, 0.1, { when:0.08, type:'triangle', vol:0.16 }); tone(550, 0.14, { when:0.16, type:'triangle', vol:0.16 }); },
    jail()    { tone(150, 0.3, { type:'sawtooth', vol:0.14 }); tone(120, 0.35, { when:0.25, type:'sawtooth', vol:0.12 }); },
    bad()     { tone(300, 0.2, { type:'sawtooth', vol:0.1, slide:-140 }); },
    boom()    { playSample('shuffle', 0.9, 0.7) || tone(90, 0.4, { type:'sawtooth', vol:0.2, slide:-50 }); },
    /* 警笛：双音交替 */
    siren()   { for (let i = 0; i < 5; i++) { tone(660, 0.16, { type:'triangle', vol:0.1, when: i * 0.3 }); tone(880, 0.16, { type:'triangle', vol:0.1, when: i * 0.3 + 0.15 }); } },
    /* 飞机呼啸：带通扫频噪声 */
    whoosh()  {
      const c = ensure(); if (!c || !enabled) return;
      const dur = 0.8;
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      const src = c.createBufferSource(); src.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 1.1;
      bp.frequency.setValueAtTime(260, c.currentTime);
      bp.frequency.exponentialRampToValueAtTime(2400, c.currentTime + dur * 0.6);
      bp.frequency.exponentialRampToValueAtTime(320, c.currentTime + dur);
      const g = c.createGain(); g.gain.value = 0.3;
      src.connect(bp); bp.connect(g); g.connect(master);
      src.start();
    },
    /* 拍卖落槌 */
    gavel()   { tone(190, 0.09, { type:'square', vol:0.22 }); tone(140, 0.14, { when:0.1, type:'square', vol:0.18 }); tone(190, 0.09, { when:0.3, type:'square', vol:0.2 }); },
    win()     { [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.32, { when: i * 0.13, vol: 0.18 })); },
    lose()    { [440, 349, 293, 220].forEach((f, i) => tone(f, 0.3, { when: i * 0.15, vol: 0.14 })); },

    /* --- BGM：C 大调五声音阶轻快琶音循环 --- */
    bgmStart() {
      const c = ensure(); if (!c || bgmTimer) return;
      bgmOn = true;
      const step = 60 / 96 / 2;             // 96bpm 八分音符
      const bass = [130.8, 130.8, 174.6, 174.6, 196.0, 196.0, 164.8, 164.8];
      const mel  = [523.3, 659.3, 784.0, 659.3, 587.3, 698.5, 880.0, 784.0,
                    523.3, 587.3, 659.3, 784.0, 698.5, 587.3, 523.3, 493.9];
      let next = c.currentTime + 0.1, i = 0;
      const tick = () => {
        if (!bgmOn) return;
        while (next < c.currentTime + 0.4) {
          const bar = Math.floor(i / 16) % 4;
          const b = bass[Math.floor(i / 2) % 8];
          if (i % 2 === 0) this._pluck(b / 2, next, step * 1.8, 0.5);
          const m = mel[i % 16];
          const v = bar === 3 && i % 16 >= 12 ? 0.4 : 1;
          this._pluck(m, next, step * 0.9, 0.32 * v);
          next += step; i++;
        }
        bgmTimer = setTimeout(tick, 120);
      };
      tick();
    },
    bgmStop() { bgmOn = false; if (bgmTimer) { clearTimeout(bgmTimer); bgmTimer = null; } },
    _pluck(freq, t0, dur, vol) {
      const c = ctx;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'triangle'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.5 * vol, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g); g.connect(bgmGain);
      o.start(t0); o.stop(t0 + dur + 0.05);
    },
  };
  return api;
})();
