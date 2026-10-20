/* Ophanim depth background: dots, diamonds and rings travelling along serpentine (boustrophedon) lanes at three depths.
   Drop-in for pages with a transparent 3D stage. Adds its own canvas and a small "Background motion" switch.
   Preference: localStorage "ophanim.bg" ("1" or "0"); off by default for visitors who ask their system for reduced motion. */
(function () {
  'use strict';
  var st = document.createElement('style');
  st.textContent = 'html{background:#06080d}body{background:transparent!important}' +
    '#depthbg{position:fixed;left:0;top:0;width:100vw;height:100vh;z-index:-1;pointer-events:none}' +
    '.stage{background:radial-gradient(120% 90% at 50% 0%,rgba(13,22,34,.5) 0%,rgba(6,8,13,.3) 72%)!important}' +
    '#depthbgsw{position:fixed;right:12px;bottom:12px;z-index:50;background:rgba(6,8,13,.85);border:1px solid #1a2638;border-radius:4px;padding:6px 10px;font:500 11px ui-monospace,Consolas,monospace;letter-spacing:.06em;text-transform:uppercase;color:#9fb3c4;display:flex;gap:6px;align-items:center;cursor:pointer}';
  document.head.appendChild(st);
  var cv = document.createElement('canvas'); cv.id = 'depthbg'; cv.setAttribute('aria-hidden', 'true'); document.body.insertBefore(cv, document.body.firstChild);
  var sw = document.createElement('label'); sw.id = 'depthbgsw'; sw.innerHTML = '<input type="checkbox"> Background motion'; document.body.appendChild(sw);
  var chk = sw.querySelector('input'), cx = cv.getContext('2d'), W = 0, H = 0, on = false, raf = 0, t0 = 0;
  var layers = [
    { lanes: 15, n: 80, size: 1.6, speed: 9,  a: .35, kind: 'dot',  col: '255,255,255' },
    { lanes: 8,  n: 26, size: 4.5, speed: 20, a: .28, kind: 'dia',  col: '0,240,255' },
    { lanes: 8,  n: 18, size: 5,   speed: 17, a: .25, kind: 'dia',  col: '255,183,0' },
    { lanes: 4,  n: 8,  size: 12,  speed: 38, a: .16, kind: 'ring', col: '0,240,255' },
    { lanes: 4,  n: 6,  size: 14,  speed: 32, a: .14, kind: 'ring', col: '255,183,0' }
  ];
  function fit() { var d = Math.min(2, window.devicePixelRatio || 1); W = window.innerWidth; H = window.innerHeight; cv.width = W * d; cv.height = H * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  function pos(L, u) {
    var m = 24, gap = (H - 2 * m) / (L.lanes - 1), seg = W + gap, total = L.lanes * W + (L.lanes - 1) * gap;
    u = ((u % total) + total) % total;
    var k = Math.min(L.lanes - 1, Math.floor(u / seg)), r = u - k * seg, y = m + k * gap, x;
    if (r < W) x = k % 2 ? W - r : r; else { x = k % 2 ? 0 : W; y += r - W; }
    return [x, y, total];
  }
  function draw(ts) {
    var t = (ts - t0) / 1000; cx.clearRect(0, 0, W, H);
    layers.forEach(function (L, li) {
      var total = pos(L, 0)[2];
      for (var i = 0; i < L.n; i++) {
        var p = pos(L, i * total / L.n + t * L.speed + li * 37), x = p[0], y = p[1], s = L.size;
        cx.globalAlpha = L.a * (L.kind === 'dot' ? .55 + .45 * Math.sin(t * 1.3 + i * 1.7) : 1);
        cx.strokeStyle = cx.fillStyle = 'rgb(' + L.col + ')';
        if (L.kind === 'dot') { cx.beginPath(); cx.arc(x, y, s, 0, 6.2832); cx.fill(); }
        else {
          cx.save(); cx.translate(x, y); cx.rotate(Math.PI / 4 + (L.kind === 'ring' ? t * .15 + i : 0));
          if (L.kind === 'dia') cx.fillRect(-s, -s, 2 * s, 2 * s);
          else { cx.lineWidth = 1.2; cx.strokeRect(-s, -s, 2 * s, 2 * s); cx.strokeRect(-s * .55, -s * .55, s * 1.1, s * 1.1); }
          cx.restore();
        }
      }
    });
    cx.globalAlpha = 1; if (on) raf = requestAnimationFrame(draw);
  }
  function set(v, save) {
    on = v; chk.checked = v; cancelAnimationFrame(raf);
    if (v) { t0 = performance.now(); raf = requestAnimationFrame(draw); } else { draw(performance.now()); cancelAnimationFrame(raf); cx.globalAlpha = 1; }
    if (save) { try { localStorage.setItem('ophanim.bg', v ? '1' : '0'); } catch (e) {} }
  }
  chk.addEventListener('change', function () { set(chk.checked, true); });
  window.addEventListener('resize', function () { fit(); if (!on) draw(performance.now()); });
  fit();
  var pref = null; try { pref = localStorage.getItem('ophanim.bg'); } catch (e) {}
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  set(pref === null ? !reduce : pref === '1', false);
})();
