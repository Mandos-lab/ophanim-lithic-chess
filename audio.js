/* Philosophy From A Stone: sounds and read-aloud narration, one shared file.
   1. OphanimSound: short sounds made in the browser (no audio files): stone tap, clatter, chime, thud, water, win; plus an optional low drone.
   2. OphanimNarrate: a "Listen" bar for long articles. Mark a section with data-narrate. If it also has data-audio="audio/name.mp3"
      and that file exists, the recording is offered. Otherwise a "Read aloud" button uses the browser's own voice, paragraph by paragraph.
   Nothing here contacts any website. */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- sounds ---------------- */
  var ctx = null, master = null, on = get('ophanim.sound') === '1', droneOn = false, drone = null;
  function ac() {
    if (ctx) return ctx;
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { ctx = new C(); master = ctx.createGain(); master.gain.value = 0.8; master.connect(ctx.destination); } catch (e) { ctx = null; }
    return ctx;
  }
  function unlock() { var c = ac(); if (c && c.state === 'suspended') c.resume(); }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) { window.addEventListener(ev, unlock, { once: false, passive: true }); });
  function noise(dur) {
    var n = Math.floor(ctx.sampleRate * dur), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    var s = ctx.createBufferSource(); s.buffer = b; return s;
  }
  function env(g, t, a, peak, d) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function tap() { /* the stone-on-stone knock was removed on request: pieces now land silently */ }
  function tapOld(t, pitch, vol) {                                   // stone on stone: a click of filtered noise plus a short low knock
    t = t || ctx.currentTime; pitch = pitch || 1; vol = vol || 1;
    var n = noise(0.08), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = 'bandpass'; f.frequency.value = 1500 * pitch; f.Q.value = 1.2;
    env(g, t, 0.002, 0.55 * vol, 0.06); n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.1);
    var o = ctx.createOscillator(), g2 = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(190 * pitch, t); o.frequency.exponentialRampToValueAtTime(95 * pitch, t + 0.07);
    env(g2, t, 0.002, 0.5 * vol, 0.09); o.connect(g2); g2.connect(master); o.start(t); o.stop(t + 0.12);
  }
  function tone(freq, t, dur, vol, type) {
    var o = ctx.createOscillator(), g = ctx.createGain(); o.type = type || 'sine'; o.frequency.value = freq;
    env(g, t, 0.01, vol, dur); o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  var SOUNDS = {
    tap: function (t) { tap(t, 1, 1); },
    swap: function (t) { tap(t, 1.1, 0.9); tap(t + 0.12, 0.85, 0.9); },
    clatter: function (t) { for (var i = 0; i < 6; i++) tap(t + i * 0.055 + Math.random() * 0.03, 0.8 + Math.random() * 0.7, 0.5 + Math.random() * 0.5); },
    chime: function (t) { tone(784, t, 1.1, 0.16); tone(1175, t + 0.02, 1.0, 0.1); tone(1568, t + 0.04, 0.8, 0.05); },
    capture: function (t) { tap(t, 0.6, 1.2); var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(330, t + 0.03); o.frequency.exponentialRampToValueAtTime(110, t + 0.4); env(g, t + 0.03, 0.01, 0.2, 0.4); o.connect(g); g.connect(master); o.start(t + 0.03); o.stop(t + 0.5); },
    water: function (t) {
      var n = noise(0.8), f = ctx.createBiquadFilter(), g = ctx.createGain(); f.type = 'lowpass'; f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(220, t + 0.7); f.Q.value = 3;
      env(g, t, 0.05, 0.3, 0.7); n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 0.85);
      var o = ctx.createOscillator(), g2 = ctx.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(520, t); o.frequency.exponentialRampToValueAtTime(130, t + 0.6); env(g2, t, 0.02, 0.12, 0.6); o.connect(g2); g2.connect(master); o.start(t); o.stop(t + 0.7);
    },
    off: function (t) { tone(523, t, 0.5, 0.14); tone(659, t + 0.09, 0.6, 0.13); },
    win: function (t) { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, t + i * 0.14, 1.2, 0.15); }); }
  };
  function play(name) {
    if (!on) return; var c = ac(); if (!c) return; if (c.state === 'suspended') c.resume();
    var fn = SOUNDS[name]; if (fn) try { fn(c.currentTime + 0.01); } catch (e) {}
  }
  function startDrone() {                                          // low, slowly breathing chord: A1, E2, A2 with a gentle filter sweep
    var c = ac(); if (!c || drone) return;
    var g = c.createGain(); g.gain.value = 0.0001; g.gain.exponentialRampToValueAtTime(0.07, c.currentTime + 4);
    var f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420; f.Q.value = 0.8;
    var lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 0.07; lg.gain.value = 160; lfo.connect(lg); lg.connect(f.frequency);
    var oscs = [55, 55.35, 82.4, 110.2, 164.8].map(function (fr, i) { var o = c.createOscillator(); o.type = i % 2 ? 'sine' : 'triangle'; o.frequency.value = fr; var og = c.createGain(); og.gain.value = [0.5, 0.4, 0.35, 0.25, 0.1][i]; o.connect(og); og.connect(f); o.start(); return o; });
    lfo.start(); f.connect(g); g.connect(master); drone = { g: g, oscs: oscs, lfo: lfo };
  }
  function stopDrone() {
    if (!drone) return; var d = drone, c = ctx; drone = null;
    d.g.gain.cancelScheduledValues(c.currentTime); d.g.gain.setValueAtTime(Math.max(d.g.gain.value, 0.0001), c.currentTime); d.g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 1.2);
    setTimeout(function () { d.oscs.forEach(function (o) { try { o.stop(); } catch (e) {} }); try { d.lfo.stop(); } catch (e) {} }, 1400);
  }
  function label() {
    var b = $('btnSound'), d = $('btnDrone');
    if (b) { b.textContent = 'Sound: ' + (on ? 'on' : 'off'); b.setAttribute('aria-pressed', on); }
    if (d) { d.textContent = 'Drone: ' + (droneOn ? 'on' : 'off'); d.setAttribute('aria-pressed', droneOn); }
  }
  window.OphanimSound = { play: play };

  /* ---------------- narration ---------------- */
  var CSS = '.narr{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;margin:8px 0 14px;padding:8px 10px;border:1px solid var(--line,#1a2638);border-radius:4px;background:var(--panel,#0a0f17);font:500 12px var(--f-mono,monospace);color:var(--muted,#7f95a6)}' +
    '.narr button,.narr select{font:500 12px var(--f-mono,monospace);color:var(--fg,#d6e4ec);background:var(--panel2,#0e1521);border:1px solid var(--line,#1a2638);border-radius:3px;padding:6px 10px;cursor:pointer}' +
    '.narr button:hover{border-color:var(--cyan,#00f0ff)}.narr audio{height:34px;max-width:100%}' +
    '.narr .nn{flex-basis:100%;font-weight:400;font-size:11px}' +
    '.narr-now{background:rgba(70,227,240,.10);box-shadow:-6px 0 0 rgba(70,227,240,.10),6px 0 0 rgba(70,227,240,.10);border-radius:2px}';
  var speaking = null;
  function stopSpeak() { try { speechSynthesis.cancel(); } catch (e) {} if (speaking) { speaking.stop = true; speaking = null; } document.querySelectorAll('.narr-now').forEach(function (e) { e.classList.remove('narr-now'); }); document.querySelectorAll('.narr [data-say]').forEach(function (b) { b.textContent = 'Read aloud'; }); }
  function pickVoice() {
    var vs = []; try { vs = speechSynthesis.getVoices() || []; } catch (e) {}
    var lang = (document.documentElement.lang || 'en').toLowerCase().slice(0, 2);
    var local = vs.filter(function (v) { return v.localService && v.lang && v.lang.toLowerCase().indexOf(lang) === 0; });
    return local[0] || null;                                       // prefer voices that run on this device, not online ones
  }
  function chunks(text) {
    var out = [], parts = text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?;:])\s+/), cur = '';
    parts.forEach(function (p) { if ((cur + ' ' + p).length > 220 && cur) { out.push(cur); cur = p; } else cur = cur ? cur + ' ' + p : p; });
    if (cur) out.push(cur); return out;
  }
  function speakSection(sec, rate, btn) {
    stopSpeak();
    var nodes = Array.prototype.slice.call(sec.querySelectorAll('h2,h3,p,li')).filter(function (n) { return !n.closest('.narr') && !n.closest('table') && !n.classList.contains('src') && n.textContent.trim().length > 1; });
    var token = { stop: false }; speaking = token; btn.textContent = 'Stop';
    var i = 0, voice = pickVoice();
    function nextNode() {
      if (token.stop || i >= nodes.length) { if (!token.stop) stopSpeak(); return; }
      var n = nodes[i++]; document.querySelectorAll('.narr-now').forEach(function (e) { e.classList.remove('narr-now'); }); n.classList.add('narr-now');
      try { n.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' }); } catch (e) {}
      var cs = chunks(n.textContent), j = 0;
      (function nextChunk() {
        if (token.stop) return; if (j >= cs.length) { nextNode(); return; }
        var u = new SpeechSynthesisUtterance(cs[j++]); u.rate = rate(); if (voice) u.voice = voice; u.lang = voice ? voice.lang : (document.documentElement.lang || 'en');
        u.onend = nextChunk; u.onerror = function () { if (!token.stop) nextChunk(); };
        speechSynthesis.speak(u);
      })();
    }
    nextNode();
  }
  function initNarrate() {
    var secs = document.querySelectorAll('[data-narrate]'); if (!secs.length) return;
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var canTTS = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
    secs.forEach(function (sec) {
      var bar = document.createElement('div'); bar.className = 'narr'; bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Listen to this section');
      var audioSrc = sec.getAttribute('data-audio');
      var slot = document.createElement('span'); bar.appendChild(slot);
      var tts = null;
      if (canTTS) {
        tts = document.createElement('span');
        tts.innerHTML = '<button type="button" data-say>Read aloud</button> <label>Speed <select aria-label="Reading speed"><option value="0.85">Slow</option><option value="1" selected>Normal</option><option value="1.2">Fast</option></select></label>';
        bar.appendChild(tts);
        var btn = tts.querySelector('button'), sel = tts.querySelector('select');
        btn.addEventListener('click', function () { if (speaking) stopSpeak(); else speakSection(sec, function () { return parseFloat(sel.value); }, btn); });
      }
      var note = document.createElement('span'); note.className = 'nn';
      note.textContent = canTTS ? 'Computer voice. It may skip or mispronounce Greek and Armenian words; a recording is better for those.' : 'Read aloud is not available in this browser.';
      bar.appendChild(note);
      var h = sec.querySelector('h2'); if (h && h.nextSibling) h.parentNode.insertBefore(bar, h.nextSibling); else sec.insertBefore(bar, sec.firstChild);
      if (audioSrc) {                                                // offer the recording only if the file really exists
        fetch(audioSrc, { method: 'HEAD' }).then(function (r) {
          if (!r.ok) return;
          var a = document.createElement('audio'); a.controls = true; a.preload = 'none'; a.src = audioSrc; a.setAttribute('aria-label', 'Recording of this section');
          a.addEventListener('play', stopSpeak); slot.appendChild(a);
          note.textContent = 'Recording by the author. The computer voice is also available.';
        }).catch(function () {});
      }
    });
    window.addEventListener('pagehide', stopSpeak);
  }

  function init() {
    var b = $('btnSound'), d = $('btnDrone');
    if (b) b.addEventListener('click', function () { on = !on; set('ophanim.sound', on ? '1' : '0'); label(); if (on) { unlock(); play('chime'); } else if (drone) { droneOn = false; stopDrone(); label(); } });
    if (d) d.addEventListener('click', function () { droneOn = !droneOn; if (droneOn) { if (!on) { on = true; set('ophanim.sound', '1'); } unlock(); startDrone(); } else stopDrone(); label(); });
    label(); initNarrate();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
