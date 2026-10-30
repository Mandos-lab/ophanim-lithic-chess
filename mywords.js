/* mywords.js: "My words" panel for the five sphere pages (Greek, Hebrew, Arabic, Armenian, Futhark).
   Look up an English word, paste the word in this script, see its value on the sphere, save it.
   Saved words live in this browser only (localStorage) and are shared by all five sphere pages, so a word saved on one sphere
   shows on the others with a link to add or open its form there. Nothing is sent anywhere; the dictionary buttons are plain links. */
(function () {
  'use strict';
  var host = document.getElementById('spdb'); if (!host) return;
  var KEYS = { 'greek-sphere': 'gr', 'hebrew-sphere': 'he', 'arabic-sphere': 'ar', 'armenian-sphere': 'hy', 'futhark-sphere': 'fu' };
  var file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var ME = KEYS[file]; if (!ME) return;
  var SC = {
    gr: { n: 'Greek', f: 'greek-sphere.html', gt: 'el' },
    he: { n: 'Hebrew', f: 'hebrew-sphere.html', gt: 'iw' },
    ar: { n: 'Arabic', f: 'arabic-sphere.html', gt: 'ar' },
    hy: { n: 'Armenian', f: 'armenian-sphere.html', gt: 'hy' },
    fu: { n: 'Old Norse (runes)', sh: 'Runes', f: 'futhark-sphere.html', gt: '' }
  };
  var ORDER = ['gr', 'he', 'ar', 'hy', 'fu'], SK = 'ophanim.mywords.v1';
  var CFG = window.SPHERE_CFG || { lang: 'en', dir: 'ltr' };

  var mem = null;
  function load() {
    try { var r = localStorage.getItem(SK); if (r) { var a = JSON.parse(r); if (Array.isArray(a)) return a; } } catch (e) { }
    return mem || [];
  }
  function store(a) { mem = a; try { localStorage.setItem(SK, JSON.stringify(a)); return true; } catch (e) { return false; } }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function $(id) { return document.getElementById(id); }
  function nid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  var css = document.createElement('style');
  css.textContent =
    '#mywords{margin:0 0 34px;padding:22px;border:1px solid rgba(232,195,117,.35);background:rgba(10,24,32,.55);border-radius:10px}' +
    '#mywords h3{margin:0 0 6px;font-size:22px}#mywords h4{font:500 13px var(--mono,monospace);letter-spacing:.14em;text-transform:uppercase;color:var(--cyan,#46e3f0);margin:22px 0 8px}' +
    '#mywords p{margin:0 0 10px}#mywords .mwd{font-size:15px;opacity:.8}' +
    '#mywords .mwst{font:12px var(--mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:rgb(232,195,117);margin:16px 0 6px}' +
    '#mywords .mwrow{display:flex;flex-wrap:wrap;gap:10px;align-items:center}' +
    '#mywords input[type=text]{flex:1;min-width:200px;font:inherit;font-size:20px;padding:9px 12px;background:rgba(255,255,255,.03);border:1px solid rgba(232,195,117,.4);color:inherit;border-radius:8px}' +
    '#mywords .mwb,#mywords a.mwb{font:13px var(--mono,monospace);letter-spacing:.06em;color:rgb(232,195,117);background:none;border:1px solid rgba(232,195,117,.45);border-radius:6px;padding:9px 13px;cursor:pointer;text-decoration:none;display:inline-block}' +
    '#mywords .mwb:hover{background:rgba(232,195,117,.1)}#mywords .mwb.pri{background:rgba(232,195,117,.16)}' +
    '#mywords .mwro{margin:10px 0 0;padding:10px 12px;border:1px dashed rgba(70,227,240,.35);border-radius:8px;min-height:2.6em;font-size:16px}' +
    '#mywords .mwro b{color:var(--cyan,#46e3f0)}#mywords .mwm{min-height:1.4em;margin-top:8px;font-size:15px;color:rgb(232,195,117)}' +
    '#mywords .mwscroll{overflow-x:auto}#mywords table{width:100%;border-collapse:collapse;font-size:16px}' +
    '#mywords th{font:12px var(--mono,monospace);letter-spacing:.1em;text-transform:uppercase;text-align:left;padding:8px;opacity:.7;font-weight:400}' +
    '#mywords td{padding:8px;border-top:1px solid rgba(255,255,255,.1);vertical-align:top}' +
    '#mywords .mww{font-size:22px;color:rgb(232,195,117)}#mywords .mwv{color:var(--cyan,#46e3f0);font-weight:600;margin-inline-start:6px}' +
    '#mywords .mwx{display:inline-block;margin:2px 6px 2px 0;padding:2px 8px;border:1px solid rgba(70,227,240,.35);border-radius:99px;font-size:14px;color:inherit;text-decoration:none}' +
    '#mywords .mwx.add{border-style:dashed;opacity:.75}#mywords .mwx:hover{border-color:rgb(232,195,117)}' +
    '#mywords .mws{font-size:13px;opacity:.75}';
  document.head.appendChild(css);

  var panel = document.createElement('div'); panel.id = 'mywords';
  var sc = SC[ME], hasBuiltIn = !!$('sfbox');
  panel.innerHTML =
    '<h3>My words: look up, test and save</h3>' +
    '<p class="mwd">Add a word you are learning. Find it from English, paste the ' + esc(sc.n) + ' form, see its value and pitch on this sphere, and save it. Your saved words stay in this browser and show on all five spheres, so you can carry a word from one script to another.</p>' +
    '<div class="mwst">1 &middot; The English word</div>' +
    '<div class="mwrow"><input type="text" id="mwEn" lang="en" placeholder="e.g. light" autocomplete="off" spellcheck="false" aria-label="English word"></div>' +
    '<div class="mwrow" id="mwLinks" style="margin-top:10px"></div>' +
    '<p class="mwd" style="margin-top:8px">The dictionary buttons open other websites in a new tab with your word already filled in. Machine translation is often wrong for single words and phrases, so check any form you find in a second source.</p>' +
    '<div class="mwst">2 &middot; The ' + esc(sc.n) + ' word</div>' +
    '<div class="mwrow"><input type="text" id="mwW" lang="' + esc(CFG.lang) + '" dir="' + esc(CFG.dir) + '" placeholder="Paste or type the ' + esc(sc.n) + ' word" autocomplete="off" spellcheck="false" aria-label="' + esc(sc.n) + ' word"></div>' +
    '<div class="mwrow" style="margin-top:8px"><input type="text" id="mwS" lang="en" placeholder="How it sounds in Latin letters (optional)" autocomplete="off" spellcheck="false" aria-label="Latin spelling" style="font-size:16px"></div>' +
    '<div class="mwro" id="mwRo" aria-live="polite">Type the word above and its value appears here.</div>' +
    '<div class="mwst">3 &middot; Test it and keep it</div>' +
    '<div class="mwrow"><button type="button" class="mwb" id="mwPut">Put it on the sphere</button><button type="button" class="mwb pri" id="mwSave">Save to My words</button></div>' +
    '<div class="mwm" id="mwMsg" aria-live="polite"></div>' +
    '<h4>My saved words</h4><div id="mwList"></div>' +
    '<div class="mwrow" style="margin-top:12px"><button type="button" class="mwb" id="mwCopy">Copy lines for the word file</button><button type="button" class="mwb" id="mwDl">Download my words</button><button type="button" class="mwb" id="mwUp">Load words from a file</button><input type="file" id="mwFile" accept=".json,application/json" hidden></div>' +
    '<p class="mwd" style="margin-top:10px">Saved words are kept on this device only. &ldquo;Download&rdquo; and &ldquo;Load&rdquo; move them to another device. &ldquo;Copy lines&rdquo; gives you rows to paste into this sphere&rsquo;s word file if you want a word on the site for everyone. Every word starts as &ldquo;unchecked&rdquo; until you tick it yourself.</p>';
  host.parentNode.insertBefore(panel, host);

  var en = $('mwEn'), wi = $('mwW'), si = $('mwS'), ro = $('mwRo'), msg = $('mwMsg');
  function say(t) { msg.textContent = t; }

  function links() {
    var q = en.value.trim(), box = $('mwLinks'), e = encodeURIComponent(q), h = '';
    if (!q) { box.innerHTML = '<span class="mwd">Type the English word to get the dictionary buttons.</span>'; return; }
    if (hasBuiltIn) h += '<button type="button" class="mwb pri" id="mwBuilt">Search the built-in dictionary</button>';
    h += '<a class="mwb" target="_blank" rel="noopener noreferrer" href="https://en.wiktionary.org/wiki/' + e + '#Translations">Wiktionary translations</a>';
    if (sc.gt) h += '<a class="mwb" target="_blank" rel="noopener noreferrer" href="https://translate.google.com/?sl=en&tl=' + sc.gt + '&text=' + e + '&op=translate">Google Translate</a>';
    box.innerHTML = h;
    var b = $('mwBuilt');
    if (b) b.onclick = function () {
      var f = document.querySelector('#sfbox .sf-form'), i = f && f.querySelector('input[type=text]');
      if (!i) return; i.value = q; try { f.requestSubmit ? f.requestSubmit() : f.dispatchEvent(new Event('submit', { cancelable: true })); } catch (x) { }
      $('sfbox').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }
  function info(w) { try { return window.SPHERE ? SPHERE.info(w) : null; } catch (e) { return null; } }
  function readout() {
    var w = wi.value.trim();
    if (!w) { ro.innerHTML = 'Type the word above and its value appears here.'; return; }
    var i = info(w);
    if (!i) { ro.textContent = 'The sphere is still loading. Try again in a moment.'; return; }
    if (!i.total) { ro.innerHTML = 'No ' + esc(sc.n) + ' letters found. Check that you pasted the word in this script.'; return; }
    ro.innerHTML = '<b>' + i.total + '</b> &middot; bearing ' + i.bearing + '&deg; &middot; sector ' + i.sector + ' (<span lang="' + esc(CFG.lang) + '">' + esc(i.letter) + '</span>) &middot; ' + i.hzLow + ' to ' + i.hzHigh + ' Hz';
  }
  en.addEventListener('input', links); wi.addEventListener('input', readout);
  window.addEventListener('sphere-mode', function () { readout(); draw(); });

  $('mwPut').onclick = function () {
    var w = wi.value.trim(); if (!w) { say('Type the word first.'); return; }
    if (!window.SPHERE) { say('The sphere is still loading.'); return; }
    SPHERE.load(w); var c = $('calc'); if (c) c.scrollIntoView({ behavior: 'smooth' });
  };
  $('mwSave').onclick = function () {
    var q = en.value.trim(), w = wi.value.trim(), i = info(w);
    if (!q) { say('Add the English word in step 1.'); return; }
    if (!w) { say('Add the ' + sc.n + ' word in step 2.'); return; }
    if (!i || !i.total) { say('That is not a ' + sc.n + ' word the sphere can read.'); return; }
    var s = si.value.trim();
    if (!s && CFG.translit) { try { s = CFG.translit(i.letters, [], {}); } catch (e) { s = ''; } }
    var a = load(), ent = null;
    a.forEach(function (x) { if (x.en.toLowerCase() === q.toLowerCase()) ent = x; });
    if (!ent) { ent = { id: nid(), en: q, f: {}, t: Date.now() }; a.push(ent); }
    ent.f[ME] = { w: w, s: s || '', ok: false };
    if (!store(a)) say('Saved for this visit only: your browser would not keep it.'); else say('Saved. It is marked unchecked until you tick it.');
    draw();
  };

  function others(ent) {
    var h = '';
    ORDER.forEach(function (k) {
      if (k === ME) return; var s = SC[k];
      if (ent.f[k]) h += '<a class="mwx" href="' + s.f + '?w=' + encodeURIComponent(ent.f[k].w) + '&en=' + encodeURIComponent(ent.en) + '#calc" title="Open on the ' + esc(s.n) + ' sphere"><span lang="">' + esc((s.sh||s.n.split(' ')[0])) + '</span> <span>' + esc(ent.f[k].w) + '</span></a>';
      else h += '<a class="mwx add" href="' + s.f + '?en=' + encodeURIComponent(ent.en) + '#mywords" title="Add the ' + esc(s.n) + ' form">+ ' + esc((s.sh||s.n.split(' ')[0])) + '</a>';
    });
    return h;
  }
  function draw() {
    var a = load(), box = $('mwList');
    if (!a.length) { box.innerHTML = '<p class="mwd">Nothing saved yet.</p>'; return; }
    var h = '<div class="mwscroll"><table><thead><tr><th>English</th><th>' + esc(sc.n) + '</th><th>On other spheres</th><th>Check</th><th></th></tr></thead><tbody>';
    a.forEach(function (ent, ix) {
      var f = ent.f[ME], c1;
      if (f) { var i = info(f.w); c1 = '<span class="mww" lang="' + esc(CFG.lang) + '" dir="' + esc(CFG.dir) + '">' + esc(f.w) + '</span>' + (i && i.total ? '<span class="mwv">' + i.total + '</span>' : '') + (f.s ? '<div class="mws">' + esc(f.s) + '</div>' : '') + '<div><button type="button" class="mwb" data-a="go" data-i="' + ix + '" style="padding:3px 9px">&#9654; Sphere</button></div>'; }
      else c1 = '<button type="button" class="mwb" data-a="add" data-i="' + ix + '" style="padding:3px 9px">+ Add the ' + esc((sc.sh||sc.n.split(' ')[0])) + ' form</button>';
      var chk = f ? '<label><input type="checkbox" data-a="ok" data-i="' + ix + '"' + (f.ok ? ' checked' : '') + '> checked by me</label>' : '<span class="mws">-</span>';
      h += '<tr><td>' + esc(ent.en) + '</td><td>' + c1 + '</td><td>' + others(ent) + '</td><td>' + chk + '</td><td><button type="button" class="mwb" data-a="del" data-i="' + ix + '" style="padding:3px 9px" aria-label="Remove this word">Remove</button></td></tr>';
    });
    box.innerHTML = h + '</tbody></table></div>';
  }
  $('mwList').addEventListener('click', function (e) {
    var b = e.target.closest('[data-a]'); if (!b) return; var a = load(), ix = +b.dataset.i, ent = a[ix]; if (!ent) return;
    var act = b.dataset.a;
    if (act === 'go') { var f = ent.f[ME]; if (f && window.SPHERE) { wi.value = f.w; readout(); SPHERE.load(f.w); var c = $('calc'); if (c) c.scrollIntoView({ behavior: 'smooth' }); } }
    else if (act === 'add') { en.value = ent.en; links(); wi.value = ''; si.value = ''; readout(); wi.focus(); panel.scrollIntoView({ behavior: 'smooth' }); }
    else if (act === 'del') { if (b.dataset.sure) { a.splice(ix, 1); store(a); draw(); } else { b.dataset.sure = '1'; b.textContent = 'Sure?'; setTimeout(function () { if (b.isConnected) { delete b.dataset.sure; b.textContent = 'Remove'; } }, 3000); } }
    else if (act === 'ok') { if (ent.f[ME]) { ent.f[ME].ok = b.checked; store(a); } }
  });

  function copyText(t, okMsg) {
    function fb() { var ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); say(okMsg); } catch (x) { say('Press Ctrl+C to copy.'); } ta.remove(); }
    try { navigator.clipboard.writeText(t).then(function () { say(okMsg); }, fb); } catch (e) { fb(); }
  }
  $('mwCopy').onclick = function () {
    var lines = load().filter(function (x) { return x.f[ME]; }).map(function (x) {
      var f = x.f[ME]; return "['" + f.w.replace(/'/g, "\\'") + "','" + (f.s || '').replace(/'/g, "\\'") + "','" + x.en.replace(/'/g, "\\'") + "','My words'],";
    });
    if (!lines.length) { say('No ' + sc.n + ' words saved yet.'); return; }
    copyText(lines.join('\n'), lines.length + ' line(s) copied. Paste them into the list in this sphere’s word file.');
  };
  $('mwDl').onclick = function () {
    var a = load(); if (!a.length) { say('Nothing to download yet.'); return; }
    var bl = new Blob([JSON.stringify(a, null, 1)], { type: 'application/json' }), u = URL.createObjectURL(bl), l = document.createElement('a');
    l.href = u; l.download = 'my-words.json'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
  };
  $('mwUp').onclick = function () { $('mwFile').click(); };
  $('mwFile').onchange = function () {
    var f = this.files && this.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () {
      try {
        var inc = JSON.parse(r.result), a = load(), n = 0; if (!Array.isArray(inc)) throw 0;
        inc.forEach(function (x) {
          if (!x || typeof x.en !== 'string' || typeof x.f !== 'object') return;
          var ent = null; a.forEach(function (y) { if (y.en.toLowerCase() === x.en.toLowerCase()) ent = y; });
          if (!ent) { ent = { id: nid(), en: x.en, f: {}, t: Date.now() }; a.push(ent); }
          ORDER.forEach(function (k) { if (x.f[k] && typeof x.f[k].w === 'string' && !ent.f[k]) { ent.f[k] = { w: x.f[k].w, s: String(x.f[k].s || ''), ok: !!x.f[k].ok }; n++; } });
        });
        store(a); draw(); say(n + ' form(s) added from the file.');
      } catch (e) { say('That file is not a My words file.'); }
    };
    r.readAsText(f); this.value = '';
  };

  /* arrive from another sphere: ?w=word (open it here) and ?en=English meaning */
  function arrive() {
    var p; try { p = new URLSearchParams(location.search); } catch (e) { return; }
    var e1 = p.get('en'), w1 = p.get('w');
    if (e1) { en.value = e1; links(); }
    if (w1 && window.SPHERE) {
      var i = info(w1);
      if (i && i.total) { wi.value = w1; readout(); var inp = $('hyin'); if (inp) { inp.value = w1; inp.dispatchEvent(new Event('input')); } }
      else { say('That word is written in another script. Add the ' + sc.n + ' form below.'); }
    }
    if (e1 && !w1) setTimeout(function () { panel.scrollIntoView({ behavior: 'smooth' }); }, 400);
  }
  links(); draw();
  if (window.SPHERE) arrive(); else window.addEventListener('sphere-ready', function () { readout(); draw(); arrive(); });
})();
