/* account.js: local profile, language preference and the Sign In / Register / Guest modal.
   Shared by every page. Nothing leaves the browser: there is no server account yet.
   Keys (localStorage):
     ophanim.stone     the active profile {handle, since, avatar}   (same key the chess page's "Become a Stone" uses)
     ophanim.profiles  profiles created on this device [{handle, since, lang}]
     ophanim.prefs     {lang: 'en' | 'el'}
     ophanim.progress.<handle or _guest>   saved progress object
   API: window.OphanimAccount = { get(), lang(), save(key, value), load(key, fallback), open(), onchange(fn) } */
(function () {
  'use strict';
  if (window.OphanimAccount) return;
  var K = { stone: 'ophanim.stone', profiles: 'ophanim.profiles', prefs: 'ophanim.prefs', prog: 'ophanim.progress.' };
  function rd(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function rm(k) { try { localStorage.removeItem(k); } catch (e) {} }
  var listeners = [];
  function user() { var u = rd(K.stone, null); return u && u.handle ? u : null; }
  function prefs() { var p = rd(K.prefs, null); return p && typeof p === 'object' ? p : {}; }
  function lang() { var p = prefs().lang; return p === 'el' || p === 'en' ? p : (/^el/i.test(navigator.language || '') ? 'el' : 'en'); }
  function setLang(l) { var p = prefs(); p.lang = l; wr(K.prefs, p); fire(); }
  function fire() { listeners.forEach(function (f) { try { f(user(), lang()); } catch (e) {} }); try { document.dispatchEvent(new CustomEvent('ophanim:account', { detail: { user: user(), lang: lang() } })); } catch (e) {} paintBadge(); }
  function pid() { var u = user(); return K.prog + (u ? u.handle : '_guest'); }
  function clean(raw) {
    var h = String(raw || '').trim().replace(/^@/, '');
    try { h = h.replace(/[^\p{L}\p{N}_.\-]/gu, ''); } catch (e) { h = h.replace(/[^A-Za-z0-9_.\-]/g, ''); }
    return h.slice(0, 20);
  }

  var T = {
    en: { guest: 'Guest', signup: 'Sign up', title: 'Join the community', sub: 'Local profile. It lives in this browser only.',
      tabs: ['Sign in', 'Register', 'Guest'], none: 'No profile on this device yet. Register one, or carry on as a guest.',
      pick: 'Profile on this device', signin: 'Sign in', handle: 'Display name', handleHint: '2 to 20 letters or numbers. Not your real name unless you want it to be.',
      language: 'Language', create: 'Create profile', guestTxt: 'Browse and play without a profile. Your settings still save in this browser, but not against a name.',
      guestBtn: 'Continue as guest', note: 'No password and no email. This is a profile saved on this device, not a secure online account. Online accounts, matches between devices and sync come later.',
      hi: 'Signed in as', since: 'on this device since', out: 'Sign out', forget: 'Forget this profile and its saved progress', sure: 'Remove this profile and its saved progress from this device?',
      close: 'Close', tooShort: 'Use at least 2 letters or numbers.', greek: 'Open this page in Greek', english: 'Open this page in English', saved: 'Saved on this device' },
    el: { guest: 'Επισκέπτης', signup: 'Εγγραφή', title: 'Μπείτε στην κοινότητα', sub: 'Τοπικό προφίλ. Μένει μόνο σε αυτό το πρόγραμμα περιήγησης.',
      tabs: ['Σύνδεση', 'Εγγραφή', 'Επισκέπτης'], none: 'Δεν υπάρχει ακόμη προφίλ σε αυτή τη συσκευή. Κάντε εγγραφή ή συνεχίστε ως επισκέπτης.',
      pick: 'Προφίλ σε αυτή τη συσκευή', signin: 'Σύνδεση', handle: 'Εμφανιζόμενο όνομα', handleHint: '2 έως 20 γράμματα ή αριθμοί. Όχι το πραγματικό σας όνομα, εκτός αν το θέλετε.',
      language: 'Γλώσσα', create: 'Δημιουργία προφίλ', guestTxt: 'Περιηγηθείτε και παίξτε χωρίς προφίλ. Οι ρυθμίσεις σας αποθηκεύονται πάλι σε αυτό το πρόγραμμα περιήγησης, αλλά όχι σε όνομα.',
      guestBtn: 'Συνέχεια ως επισκέπτης', note: 'Χωρίς κωδικό και χωρίς email. Είναι προφίλ αποθηκευμένο σε αυτή τη συσκευή, όχι ασφαλής διαδικτυακός λογαριασμός. Διαδικτυακοί λογαριασμοί, αγώνες μεταξύ συσκευών και συγχρονισμός έρχονται αργότερα.',
      hi: 'Συνδεδεμένος ως', since: 'σε αυτή τη συσκευή από', out: 'Αποσύνδεση', forget: 'Διαγραφή αυτού του προφίλ και της αποθηκευμένης προόδου', sure: 'Να αφαιρεθεί αυτό το προφίλ και η αποθηκευμένη πρόοδος από τη συσκευή;',
      close: 'Κλείσιμο', tooShort: 'Χρησιμοποιήστε τουλάχιστον 2 γράμματα ή αριθμούς.', greek: 'Άνοιγμα της σελίδας στα ελληνικά', english: 'Open this page in English', saved: 'Αποθηκεύτηκε σε αυτή τη συσκευή' }
  };
  function t() { return T[lang()]; }

  var css = '.oa-badge{position:fixed;right:12px;bottom:12px;z-index:2147481000;display:flex;align-items:center;gap:7px;padding:7px 12px;font:600 11px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.08em;color:#e8c375;background:rgba(10,13,18,.92);border:1px solid rgba(232,195,117,.4);border-radius:999px;cursor:pointer;backdrop-filter:blur(4px)}' +
    '.oa-badge:hover,.oa-badge:focus-visible{border-color:#e8c375;background:rgba(232,195,117,.12);outline:none}' +
    '.oa-badge i{width:8px;height:8px;border-radius:50%;background:#7e8a9a;display:inline-block}.oa-badge.in i{background:#46e3f0;box-shadow:0 0 8px #46e3f0}' +
    '.oa-badge small{font:inherit;color:#8fa0b4;letter-spacing:.06em}' +
    '.oa-ov{position:fixed;inset:0;z-index:2147482500;display:none;align-items:center;justify-content:center;padding:16px;background:rgba(2,5,9,.78);backdrop-filter:blur(3px)}.oa-ov.on{display:flex}' +
    '.oa-box{width:100%;max-width:440px;max-height:92vh;overflow:auto;background:linear-gradient(160deg,#10151d,#0a0d12);border:1px solid rgba(232,195,117,.45);border-radius:8px;box-shadow:0 30px 80px rgba(0,0,0,.7);color:#d6dde7;font:16px/1.5 "EB Garamond",Georgia,serif;padding:20px 22px;position:relative}' +
    '.oa-box h2{font:500 22px "Cinzel",Georgia,serif;letter-spacing:.06em;color:#e8c375;margin:0 0 2px}.oa-box .sub{font:12px "JetBrains Mono",monospace;color:#8fa0b4;letter-spacing:.06em;margin:0 0 14px}' +
    '.oa-x{position:absolute;top:10px;right:12px;background:none;border:0;color:#8fa0b4;font-size:22px;cursor:pointer;line-height:1}.oa-x:hover{color:#e8c375}' +
    '.oa-tabs{display:flex;gap:6px;margin:0 0 14px;border-bottom:1px solid rgba(232,195,117,.25)}.oa-tabs button{flex:1;background:none;border:0;border-bottom:2px solid transparent;color:#8fa0b4;font:600 12px "JetBrains Mono",monospace;letter-spacing:.1em;text-transform:uppercase;padding:9px 4px;cursor:pointer}' +
    '.oa-tabs button[aria-selected=true]{color:#e8c375;border-bottom-color:#e8c375}' +
    '.oa-box label{display:block;font:11px "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase;color:#46e3f0;margin:12px 0 5px}' +
    '.oa-box input[type=text],.oa-box select{width:100%;box-sizing:border-box;background:#070a0f;border:1px solid rgba(232,195,117,.3);color:#e6edf6;font:16px "EB Garamond",Georgia,serif;padding:9px 10px;border-radius:4px}' +
    '.oa-box input:focus,.oa-box select:focus{outline:none;border-color:#e8c375}.oa-hint{font-size:13px;color:#8fa0b4;margin:5px 0 0}' +
    '.oa-go{display:block;width:100%;margin-top:16px;background:rgba(232,195,117,.14);border:1px solid #e8c375;color:#e8c375;font:600 12px "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;padding:11px;border-radius:4px;cursor:pointer}.oa-go:hover{background:rgba(232,195,117,.26)}' +
    '.oa-go.alt{background:none;border-color:rgba(232,195,117,.35);color:#c8b27a;margin-top:10px}' +
    '.oa-err{color:#ff8f8f;font-size:14px;min-height:1.2em;margin:8px 0 0}.oa-note{margin:16px 0 0;padding:10px 12px;border-left:2px solid #e8c375;background:rgba(232,195,117,.07);font-size:14px;color:#9eabbd}' +
    '.oa-lang{display:flex;gap:8px}.oa-lang button{flex:1;background:none;border:1px solid rgba(232,195,117,.3);color:#c8b27a;padding:8px;border-radius:4px;cursor:pointer;font:15px "EB Garamond",Georgia,serif}.oa-lang button[aria-pressed=true]{background:rgba(232,195,117,.2);color:#e8c375;border-color:#e8c375}' +
    '.oa-link{display:inline-block;margin-top:12px;color:#46e3f0;font-size:15px}.oa-who{font-size:18px;color:#e8c375}.oa-toast{position:fixed;left:50%;bottom:64px;transform:translateX(-50%);z-index:2147482600;background:#0a0d12;border:1px solid #e8c375;color:#e8c375;padding:8px 14px;border-radius:4px;font:12px "JetBrains Mono",monospace;letter-spacing:.06em}' +
    '@media(max-width:520px){.oa-badge{padding:6px 10px;bottom:10px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var badge = document.createElement('button'); badge.type = 'button'; badge.className = 'oa-badge'; badge.setAttribute('aria-haspopup', 'dialog');
  document.body.appendChild(badge);
  function paintBadge() {
    var u = user(), tx = t(); badge.className = 'oa-badge' + (u ? ' in' : '');
    badge.textContent = '';
    var dot = document.createElement('i'); badge.appendChild(dot);
    var s = document.createElement('span'); s.textContent = u ? '@' + u.handle : tx.guest; badge.appendChild(s);
    if (!u) { var sm = document.createElement('small'); sm.textContent = '· ' + tx.signup; badge.appendChild(sm); }
    badge.setAttribute('aria-label', (u ? tx.hi + ' ' + u.handle : tx.guest + ', ' + tx.signup));
  }

  var ov, box, tab = 0, lastFocus = null, sibling = null;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function siblingFile() {
    var f = (location.pathname.split('/').pop() || 'index.html');
    if (f === 'index.html') return 'el.html';
    if (f === 'el.html') return 'index.html';
    if (/-el\.html$/.test(f)) return f.replace(/-el\.html$/, '.html');
    return f.replace(/\.html$/, '-el.html');
  }
  function probe(cb) {
    if (sibling !== null) { cb(sibling); return; }
    var f = siblingFile();
    try { fetch(f, { method: 'HEAD' }).then(function (r) { sibling = r.ok ? f : false; cb(sibling); }, function () { sibling = false; cb(false); }); }
    catch (e) { sibling = false; cb(false); }
  }
  function render() {
    var tx = t(), u = user(); box.textContent = '';
    var x = el('button', 'oa-x', '×'); x.type = 'button'; x.setAttribute('aria-label', tx.close); x.addEventListener('click', close); box.appendChild(x);
    var h = el('h2', null, tx.title); h.id = 'oa-h'; box.appendChild(h); box.appendChild(el('p', 'sub', tx.sub));
    if (u) { signedView(tx, u); return; }
    var tabs = el('div', 'oa-tabs'); tabs.setAttribute('role', 'tablist');
    tx.tabs.forEach(function (n, i) { var b = el('button', null, n); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', String(i === tab)); b.addEventListener('click', function () { tab = i; render(); }); tabs.appendChild(b); });
    box.appendChild(tabs);
    if (tab === 0) {
      var ps = rd(K.profiles, []);
      if (!ps.length) { box.appendChild(el('p', 'oa-hint', tx.none)); }
      else {
        var l = el('label', null, tx.pick); l.setAttribute('for', 'oa-pick'); box.appendChild(l);
        var sel = el('select'); sel.id = 'oa-pick'; ps.forEach(function (p) { var o = el('option', null, '@' + p.handle); o.value = p.handle; sel.appendChild(o); }); box.appendChild(sel);
        var go = el('button', 'oa-go', tx.signin); go.type = 'button'; go.addEventListener('click', function () {
          var p = ps.filter(function (q) { return q.handle === sel.value; })[0]; if (!p) return;
          wr(K.stone, { handle: p.handle, since: p.since, avatar: p.avatar || 'q' }); if (p.lang) { var pf = prefs(); pf.lang = p.lang; wr(K.prefs, pf); } fire(); render();
        }); box.appendChild(go);
      }
    } else if (tab === 1) {
      var l1 = el('label', null, tx.handle); l1.setAttribute('for', 'oa-h1'); box.appendChild(l1);
      var inp = el('input'); inp.type = 'text'; inp.id = 'oa-h1'; inp.maxLength = 24; inp.autocomplete = 'off'; inp.autocapitalize = 'off'; inp.spellcheck = false; box.appendChild(inp);
      box.appendChild(el('p', 'oa-hint', tx.handleHint));
      box.appendChild(el('label', null, tx.language));
      var lg = el('div', 'oa-lang'), chosen = lang();
      [['en', 'English'], ['el', 'Ελληνικά']].forEach(function (a) { var b = el('button', null, a[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(chosen === a[0])); b.addEventListener('click', function () { chosen = a[0]; [].forEach.call(lg.children, function (c) { c.setAttribute('aria-pressed', String(c === b)); }); }); lg.appendChild(b); });
      box.appendChild(lg);
      var err = el('p', 'oa-err'); err.setAttribute('role', 'alert'); box.appendChild(err);
      var go2 = el('button', 'oa-go', tx.create); go2.type = 'button';
      function submit() {
        var hd = clean(inp.value); if (hd.length < 2) { err.textContent = tx.tooShort; return; }
        var ps2 = rd(K.profiles, []), ex = ps2.filter(function (q) { return q.handle === hd; })[0], since = ex ? ex.since : Date.now();
        if (!ex) ps2.push({ handle: hd, since: since, lang: chosen }); else ex.lang = chosen;
        wr(K.profiles, ps2); wr(K.stone, { handle: hd, since: since, avatar: 'q' }); var pf = prefs(); pf.lang = chosen; wr(K.prefs, pf); fire(); render();
      }
      go2.addEventListener('click', submit); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') submit(); }); box.appendChild(go2);
      setTimeout(function () { inp.focus(); }, 30);
    } else {
      box.appendChild(el('p', null, tx.guestTxt));
      var g = el('button', 'oa-go', tx.guestBtn); g.type = 'button'; g.addEventListener('click', close); box.appendChild(g);
    }
    box.appendChild(el('p', 'oa-note', tx.note));
    langLink(tx);
  }
  function langLink(tx) {
    probe(function (f) { if (!f || !ov.classList.contains('on')) return; var toEl = !/-el\.html$/.test(location.pathname) && location.pathname.split('/').pop() !== 'el.html'; var a = el('a', 'oa-link', toEl ? tx.greek : tx.english); a.href = f; a.addEventListener('click', function () { var p = prefs(); p.lang = toEl ? 'el' : 'en'; wr(K.prefs, p); }); box.appendChild(a); });
  }
  function signedView(tx, u) {
    var p = el('p'); p.appendChild(document.createTextNode(tx.hi + ' ')); var w = el('span', 'oa-who', '@' + u.handle); p.appendChild(w); box.appendChild(p);
    var d = new Date(u.since || Date.now()); box.appendChild(el('p', 'oa-hint', tx.since + ' ' + d.toLocaleDateString()));
    box.appendChild(el('label', null, tx.language));
    var lg = el('div', 'oa-lang'), cur = lang();
    [['en', 'English'], ['el', 'Ελληνικά']].forEach(function (a) { var b = el('button', null, a[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(cur === a[0])); b.addEventListener('click', function () { setLang(a[0]); var ps = rd(K.profiles, []); ps.forEach(function (q) { if (q.handle === u.handle) q.lang = a[0]; }); wr(K.profiles, ps); render(); }); lg.appendChild(b); });
    box.appendChild(lg);
    var out = el('button', 'oa-go', tx.out); out.type = 'button'; out.addEventListener('click', function () { wr(K.stone, null); fire(); render(); }); box.appendChild(out);
    var fg = el('button', 'oa-go alt', tx.forget); fg.type = 'button'; fg.addEventListener('click', function () {
      if (!confirm(tx.sure)) return; rm(K.prog + u.handle); wr(K.profiles, rd(K.profiles, []).filter(function (q) { return q.handle !== u.handle; })); wr(K.stone, null); fire(); render();
    }); box.appendChild(fg);
    box.appendChild(el('p', 'oa-note', tx.note)); langLink(tx);
  }
  function build() {
    if (ov) return; ov = el('div', 'oa-ov'); ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    box = el('div', 'oa-box'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'oa-h'); ov.appendChild(box); document.body.appendChild(ov);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) close(); });
  }
  function open(startTab) { build(); lastFocus = document.activeElement; tab = typeof startTab === 'number' ? startTab : (rd(K.profiles, []).length ? 0 : 1); render(); ov.classList.add('on'); }
  function close() { if (!ov) return; ov.classList.remove('on'); try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch (e) {} }
  badge.addEventListener('click', function () { open(); });

  window.OphanimAccount = {
    get: user, lang: lang, open: open,
    save: function (key, val) { var o = rd(pid(), {}); o[key] = val; return wr(pid(), o); },
    load: function (key, fb) { var o = rd(pid(), {}); return key in o ? o[key] : fb; },
    onchange: function (f) { if (typeof f === 'function') listeners.push(f); }
  };
  addEventListener('storage', function (e) { if (e.key === K.stone || e.key === K.prefs) paintBadge(); });
  paintBadge();

  /* a visitor who chose Greek is offered the Greek page once per tab session */
  try {
    var p0 = prefs();
    if (p0.lang === 'el' && !/-el\.html$/.test(location.pathname) && location.pathname.split('/').pop() !== 'el.html' && !sessionStorage.getItem('oa.offer')) {
      sessionStorage.setItem('oa.offer', '1');
      probe(function (f) { if (!f) return; var a = el('a', 'oa-toast', 'Ελληνικά ▸'); a.href = f; document.body.appendChild(a); setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 7000); });
    }
  } catch (e) {}
})();
