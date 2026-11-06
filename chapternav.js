/* Chapter dots: a small column of diamonds at the right edge. Tap or click one to jump to that chapter.
   Pages that already have <nav class="dots"> keep theirs (this file only makes it show on phones too);
   pages without one get a new column built from their sections or h2 headings. Nothing is sent anywhere. */
(function () {
  'use strict';
  var EL = /^el/i.test(document.documentElement.lang || '');
  var css = '' +
    '.dots,.cnav{position:fixed;right:18px;top:50%;transform:translateY(-50%);z-index:20;display:flex;flex-direction:column;gap:12px}' +
    '.dots a,.cnav a{width:9px;height:9px;border:1px solid rgba(70,227,240,.55);transform:rotate(45deg);display:block;transition:.25s;position:relative}' +
    '.dots a.on,.cnav a.on{background:#e8c375;border-color:#e8c375;box-shadow:0 0 10px #e8c375}' +
    '.dots a span,.cnav a span{position:absolute;right:20px;top:-6px;transform:rotate(-45deg);transform-origin:right;white-space:nowrap;font:10px ui-monospace,Menlo,Consolas,monospace;color:#b7c4cc;background:rgba(1,6,10,.88);padding:2px 6px;border-radius:3px;opacity:0;pointer-events:none;transition:.2s}' +
    '.dots a:hover span,.cnav a:hover span,.dots a.tip span,.cnav a.tip span{opacity:1}' +
    '@media(max-width:900px){.dots,.cnav{display:flex!important;right:5px;gap:10px}.dots a,.cnav a{width:7px;height:7px}.dots a span,.cnav a span{right:16px;font-size:11px}}' +
    '@media print{.dots,.cnav{display:none!important}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function slug(t, i) { return 'ch-' + i; }
  function clean(t) { return (t || '').replace(/\s+/g, ' ').replace(/^[IVXLC0-9]+[.)]?\s*[··\-–—]?\s*/, '').trim(); }
  function build() {
    if (document.querySelector('nav.dots')) return;                       // page has its own
    var main = document.querySelector('main') || document.body;
    var targets = [], secs = main.querySelectorAll(':scope > section, :scope > .wrap > section');
    if (secs.length < 3) secs = document.querySelectorAll('section');
    if (secs.length >= 3) {
      secs.forEach(function (s, i) {
        if (s.id === 'sharefoot' || s.classList.contains('sharefoot')) return;
        var h = s.querySelector('h2') || s.querySelector('h1');
        var lab = s.getAttribute('data-label') || (h ? clean(h.textContent) : '');
        if (!lab) { var k = s.querySelector('.kicker'); lab = k ? clean(k.textContent) : ''; }
        if (!lab) return;
        if (!s.id) s.id = slug(lab, i);
        targets.push({ el: s, id: s.id, label: lab.length > 26 ? lab.slice(0, 25) + '…' : lab });
      });
    }
    if (targets.length < 3) {
      targets = []; var hs = main.querySelectorAll('h2');
      hs.forEach(function (h, i) {
        var lab = clean(h.textContent); if (!lab) return; if (!h.id) h.id = slug(lab, i);
        targets.push({ el: h, id: h.id, label: lab.length > 26 ? lab.slice(0, 25) + '…' : lab });
      });
    }
    if (targets.length < 3) return;
    var nav = document.createElement('nav'); nav.className = 'cnav'; nav.setAttribute('aria-label', EL ? 'Κεφάλαια' : 'Chapters');
    targets.forEach(function (t) {
      var a = document.createElement('a'); a.href = '#' + t.id; a.setAttribute('aria-label', t.label);
      var sp = document.createElement('span'); sp.textContent = t.label; a.appendChild(sp); nav.appendChild(a); t.a = a;
    });
    document.body.appendChild(nav);
    var cur = -1;
    function mark() {
      var y = window.innerHeight * 0.35, best = 0;
      targets.forEach(function (t, i) { if (t.el.getBoundingClientRect().top <= y) best = i; });
      if (best !== cur) { if (cur >= 0) targets[cur].a.classList.remove('on'); targets[best].a.classList.add('on'); cur = best; }
    }
    window.addEventListener('scroll', mark, { passive: true }); window.addEventListener('resize', mark); mark();
  }
  function tipOnTap() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('.dots a, .cnav a'); if (!a) return;
      a.classList.add('tip'); setTimeout(function () { a.classList.remove('tip'); }, 1600);
      var id = (a.getAttribute('href') || '').slice(1), el = id && document.getElementById(id);
      if (el && a.closest('.cnav')) { e.preventDefault(); try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (_) { el.scrollIntoView(); } }
    });
  }
  function init() { build(); tipOnTap(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
