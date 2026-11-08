/* workbench.js: one compact workbench on the sphere pages. Sphere pinned on the left, tools in tabs on the right. */
(function () {
  var calc = document.getElementById('calc'), read = document.getElementById('read'), words = document.getElementById('words');
  if (!calc || !document.getElementById('hycalc')) return;
  var el = (document.documentElement.lang || '').slice(0, 2) === 'el';
  var L = el ? { calc: 'Αριθμομηχανή', find: 'Βρες λέξη', dict: 'Λεξικό', texts: 'Κείμενα', mine: 'Οι λέξεις μου', list: 'Λίστα λέξεων', help: 'Βοήθεια' }
             : { calc: 'Calculator', find: 'Find a word', dict: 'Dictionary', texts: 'Texts', mine: 'My words', list: 'Word list', help: 'Help' };
  var css = document.createElement('style');
  css.textContent =
    '#calc{padding:70px 16px 24px !important;min-height:0 !important}#read-old,#words{display:none !important}.dots{display:none !important}' +
    '#bench{display:grid;grid-template-columns:minmax(340px,47%) 1fr;gap:20px;max-width:1500px;margin:0 auto;align-items:start}' +
    '#bench .bl{position:sticky;top:64px;max-height:min(calc(100vh - 84px),860px);overflow:auto;padding-right:4px}' +
    '#bench .bl .hyrow{justify-content:center;margin:0 0 12px}#bench .bl canvas{width:100%;height:min(54vh,620px);display:block}' +
    '#bench .hyr{display:block;position:static}#bench .hycap{position:static !important;text-align:center;font-size:15px;margin:4px 0 12px}' +
    '#bench .br{min-width:0}' +
    '#bench .tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;position:sticky;top:56px;z-index:5;background:var(--bg);padding:6px 0}' +
    '#bench .tabs button{font:600 15px "Noto Sans",sans-serif;padding:9px 12px;border-radius:8px;border:1px solid rgba(232,195,117,.4);background:none;color:var(--ink);cursor:pointer}' +
    '#bench .tabs a.eng{font:600 15px "Noto Sans",sans-serif;padding:9px 12px;border-radius:8px;border:1px solid rgba(70,227,240,.55);color:var(--cyan,#46e3f0);text-decoration:none;margin-left:auto}' +
    '#bench .tabs button.on{background:rgba(232,195,117,.2);color:var(--gold);border-color:var(--gold)}' +
    '#bench .pane{display:none;max-height:min(calc(100vh - 170px),780px);overflow:auto;padding-right:6px}#bench .pane.on{display:block}' +
    '#bench .pane .reveal{opacity:1 !important;transform:none !important}' +
    '#bench .pane .kicker{display:none}#bench .pane h2{font-size:24px;margin:0 0 8px}' +
    '#bench .links a{display:inline-block;margin:0 18px 6px 0}#bench .pane .rt-box,#bench #mywords{margin:0 0 14px}' +
    '#bench .pane p,#bench .pane li,#bench .pane .dim{max-width:none;font-size:18px !important;line-height:1.55}#bench .pane h3{font-size:22px}' +
    '@media(max-width:900px){#bench{display:block}#bench .bl{position:static;max-height:none}#bench .pane{max-height:none}#bench .tabs{top:48px}}';
  document.head.appendChild(css);

  var bench = document.createElement('div'); bench.id = 'bench';
  var bl = document.createElement('div'); bl.className = 'bl';
  var br = document.createElement('div'); br.className = 'br';
  if (read) read.id = 'read-old'; br.id = 'read'; /* finders and styles look for #read */
  var tabs = document.createElement('div'); tabs.className = 'tabs'; tabs.setAttribute('role', 'tablist');
  br.appendChild(tabs); bench.appendChild(bl); bench.appendChild(br);
  var panes = {};
  function pane(k) { if (panes[k]) return panes[k]; var d = document.createElement('div'); d.className = 'pane'; d.id = 'pane-' + k; br.appendChild(d); panes[k] = d; return d; }
  function mv(k, n) { if (n) { pane(k).appendChild(n); } }

  var hyr = calc.querySelector('.hyr'), hyl = calc.querySelector('.hyl');
  function take(sel) { var n = calc.querySelector(sel); if (n && n.parentNode) n.parentNode.removeChild(n); return n; }
  /* left: sphere + the answer */
  var out = take('#hyout'), tot = take('.hytot'), facts = take('#hyfacts'), pre = take('.hypre'), note = take('#hynote');
  var row = take('.hyrow');
  bl.appendChild(hyr); if (row) bl.appendChild(row); mv('calc', hyl);
  [tot, out, facts].forEach(function (n) { if (n) bl.appendChild(n); });
  /* right: tabs */
  var calcLabel = hyl && hyl.querySelector('.hylab:last-of-type');
  if (pre) { var wl = pre.previousElementSibling; if (wl) pane('calc').appendChild(wl); pane('calc').appendChild(pre); }
  if (note) pane('calc').appendChild(note);
  var intro = calc.querySelector('.wrap > .reveal');
  var find = document.getElementById('sfbox'); mv('find', find);
  var dictIn = read && read.querySelector('.rt-form input'), dict = dictIn && dictIn.closest('.rt-box'); mv('dict', dict);
  if (read) { [].slice.call(read.querySelectorAll('.rt-box')).forEach(function (b) { if (b.parentNode && !b.querySelector('ol')) mv('texts', b); }); }
  var spdb = document.getElementById('spdb'); mv('list', spdb);
  /* help: all leftover explanation */
  if (intro) mv('help', intro);
  if (read) { [].slice.call(read.querySelectorAll('.wrap > *')).forEach(function (n) { mv('help', n); }); }
  if (words) { [].slice.call(words.querySelectorAll('.wrap > *')).forEach(function (n) { mv('help', n); }); }
  calc.querySelector('.wrap').innerHTML = ''; calc.querySelector('.wrap').appendChild(bench);

  function show(k) { if (panes[k]) panes[k].scrollTop = 0;  Object.keys(panes).forEach(function (j) { panes[j].classList.toggle('on', j === k); }); [].forEach.call(tabs.children, function (b) { b.classList.toggle('on', b.getAttribute('data-k') === k); }); try { sessionStorage.setItem('ophbench', k); } catch (e) { } window.dispatchEvent(new Event('resize')); }
  function addTab(k) { if (!panes[k]) return; var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-k', k); b.setAttribute('role', 'tab'); b.textContent = L[k]; b.onclick = function () { show(k); }; tabs.appendChild(b); }
  var order = ['calc', 'find', 'dict', 'texts', 'mine', 'list', 'help'];
  var engA = null;
  if (/greek-sphere|hebrew-sphere/.test(location.pathname)) { engA = document.createElement('a'); engA.className = 'eng'; engA.target = '_blank'; engA.rel = 'noopener'; engA.href = 'research-engine/'; engA.textContent = el ? 'Μηχανή έρευνας ↗' : 'Research Engine ↗'; }
  function build() { tabs.innerHTML = ''; order.forEach(addTab); if (engA) tabs.appendChild(engA); var s = null; try { s = sessionStorage.getItem('ophbench'); } catch (e) { } show(panes[s] ? s : 'calc'); }
  /* the My words panel is added by mywords.js a little later */
  var tries = 0, tm = setInterval(function () { var mw = document.getElementById('mywords'); tries++; if (mw && !pane('mine').contains(mw)) { pane('mine').appendChild(mw); var cur = tabs.querySelector('.on'); build(); if (cur) show(cur.getAttribute('data-k')); } if (tries > 40 || (mw && pane('mine').contains(mw))) clearInterval(tm); }, 250);
  build();
  /* one word everywhere: the word on the sphere is carried into the dictionary box and the My words form */
  (function () {
    var hy = document.getElementById('hyin'); if (!hy) return;
    var last = null;
    function conv(v) { var C = window.SPHERE_CFG; v = v.trim(); return C && C.dictWord ? C.dictWord(v) : v; }
    function put(inp, v, force) { if (!inp) return; var cur = inp.value.trim(); if (force || cur === '' || cur === last) { inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); var f = inp.closest && inp.closest('form'); if (f) f.dispatchEvent(new Event('rt-fill')); } }
    function sync(first) {
      var v = conv(hy.value); if (v === last) return;
      if (engA) engA.href = 'research-engine/' + (v ? '#q=' + encodeURIComponent(v.split(/\s+/)[0]) : ''); put(dictIn, v, first); put(document.getElementById('mwW'), v, false); last = v;
    }
    sync(true); setInterval(function () { sync(false); }, 400);
  })();
  /* results sent onward from Find a word: switch to the tab that received them */
  if (find) find.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button[data-a]'); if (!b) return; var a = b.getAttribute('data-a'); if (a === 'dic') show('dict'); else if (a === 'lxx') { show('texts'); var lb = document.getElementById('lxxbox'); if (lb) setTimeout(function () { lb.scrollIntoView({ block: 'start' }); }, 50); } }, true);
  /* other pages send people here with #calc: open the calculator tab */
  window.addEventListener('hashchange', function () { if (location.hash === '#calc') show('calc'); });
  /* when a word is sent to the sphere from another tab, show the sphere result (it is always visible on the left) */
  window.addEventListener('load', function () { window.dispatchEvent(new Event('resize')); });
})();
