/* miniplayer.js - a small floating control for recorded talks and videos.
   When a talk or video is playing (or paused part-way) and its own player has
   scrolled out of view, a slim bar appears under the top bar with Pause/Play,
   Stop, "Go to player" and Close. No settings needed. */
(function () {
  var cur = null, bar, ttl, bPlay, started = false, dismissed = false, inView = true, io;
  var css = document.createElement('style');
  css.textContent =
    '#mp{position:fixed;top:60px;left:50%;transform:translateX(-50%);z-index:60;display:none;align-items:center;gap:8px;' +
    'width:calc(100% - 24px);max-width:560px;box-sizing:border-box;background:rgba(11,12,16,.94);border:1px solid rgba(232,195,117,.5);' +
    'padding:8px 10px;font-family:"JetBrains Mono",ui-monospace,monospace;font-size:12px;letter-spacing:.06em;color:#cfc7b0;backdrop-filter:blur(6px)}' +
    '#mp.on{display:flex}#mp .mt{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}' +
    '#mp button{background:none;border:1px solid rgba(232,195,117,.45);color:#e8c375;font:inherit;padding:6px 10px;cursor:pointer;min-width:38px}' +
    '#mp button:hover,#mp button:focus{border-color:#46e3f0;color:#46e3f0}';
  document.head.appendChild(css);
  function btn(label, title, fn) {
    var b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.title = title; b.setAttribute('aria-label', title);
    b.addEventListener('click', fn); return b;
  }
  function build() {
    if (bar) return;
    bar = document.createElement('div'); bar.id = 'mp'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Now playing');
    ttl = document.createElement('span'); ttl.className = 'mt';
    bPlay = btn('❚❚', 'Pause or play', function () { if (!cur) return; if (cur.paused) cur.play(); else cur.pause(); });
    bar.appendChild(ttl); bar.appendChild(bPlay);
    bar.appendChild(btn('■', 'Stop', function () { if (!cur) return; cur.pause(); cur.currentTime = 0; started = false; refresh(); }));
    bar.appendChild(btn('▲', 'Go to the player', function () { if (cur) cur.scrollIntoView({ behavior: 'smooth', block: 'center' }); }));
    bar.appendChild(btn('✕', 'Close this bar', function () { dismissed = true; refresh(); }));
    document.body.appendChild(bar);
  }
  function title(m) {
    var t = m.getAttribute('data-title');
    if (!t) { var s = m.closest('section,figure'); var h = s && s.querySelector('h2'); t = h ? h.textContent : (m.tagName === 'VIDEO' ? 'Video' : 'Recorded talk'); }
    return t.replace(/\s+/g, ' ').trim();
  }
  function refresh() {
    build();
    var show = cur && started && !dismissed && !inView;
    bar.classList.toggle('on', !!show);
    if (cur) { ttl.textContent = title(cur); bPlay.textContent = cur.paused ? '▶' : '❚❚'; }
  }
  function watch(m) {
    if (io) io.disconnect();
    io = new IntersectionObserver(function (es) { inView = es[0].isIntersecting; refresh(); }, { threshold: 0.1 });
    io.observe(m);
  }
  document.addEventListener('play', function (e) {
    var m = e.target; if (!m || !/^(AUDIO|VIDEO)$/.test(m.tagName)) return;
    document.querySelectorAll('audio,video').forEach(function (o) { if (o !== m && !o.paused) o.pause(); });
    if (cur !== m) { cur = m; inView = true; watch(m); }
    started = true; dismissed = false; refresh();
  }, true);
  document.addEventListener('pause', function (e) { if (e.target === cur) refresh(); }, true);
  document.addEventListener('ended', function (e) { if (e.target === cur) { started = false; refresh(); } }, true);
})();
