/* Philosophy From A Stone - cookie and third-party content notice.
   One file, shared by every page. Load it as the first script in <head>.
   - Essential storage (your settings, saved in your own browser) needs no consent.
   - Third-party content (YouTube, Vimeo, X timeline, other embedded sites) is held back until the visitor allows it.
   - The choice is kept for 12 months in a cookie named "ophanim_consent" (and in localStorage as a backup).
   Nothing is sent anywhere by this file. */
(function () {
  'use strict';
  var KEY = 'ophanim_consent', DAYS = 365, VERSION = 1;
  var state = read(); // null = not chosen yet, else {v, media}

  function read() {
    var raw = null, m;
    try { m = document.cookie.match(new RegExp('(?:^|; )' + KEY + '=([^;]*)')); if (m) raw = decodeURIComponent(m[1]); } catch (e) {}
    if (!raw) { try { raw = localStorage.getItem(KEY); } catch (e) {} }
    if (!raw) return null;
    try { var o = JSON.parse(raw); return o && o.v === VERSION ? o : null; } catch (e) { return null; }
  }
  function save(media) {
    state = { v: VERSION, media: !!media, t: Date.now() };
    var s = JSON.stringify(state);
    try {
      document.cookie = KEY + '=' + encodeURIComponent(s) + '; max-age=' + (DAYS * 86400) + '; path=/; SameSite=Lax' + (location.protocol === 'https:' ? '; Secure' : '');
    } catch (e) {}
    try { localStorage.setItem(KEY, s); } catch (e) {}
  }
  function mediaOk() { return !!(state && state.media); }

  /* ---------- hold back third-party iframes ---------- */
  var busy = false;
  function isThirdParty(src) {
    if (!src) return false;
    try { var u = new URL(src, location.href); return /^https?:$/.test(u.protocol) && u.origin !== location.origin; } catch (e) { return false; }
  }
  var NOTE = '<body style="margin:0;display:flex;align-items:center;justify-content:center;height:100vh;background:#0b0f16;color:#9aa7b8;font:13px/1.5 system-ui,sans-serif;text-align:center;padding:12px;box-sizing:border-box">' +
    '<div>This frame loads content from another website.<br>Choose <b>Allow third-party content</b> in the Cookie settings (bottom-left of the page) to show it.</div></body>';
  function hold(f) {
    if (mediaOk() || busy) return;
    var src = f.getAttribute('src');
    if (!isThirdParty(src)) return;
    busy = true;
    f.setAttribute('data-consent-src', src);
    f.removeAttribute('src');
    f.setAttribute('srcdoc', NOTE);
    busy = false;
  }
  function release(f) {
    var src = f.getAttribute('data-consent-src');
    if (!src) return;
    busy = true;
    f.removeAttribute('data-consent-src');
    f.removeAttribute('srcdoc');
    f.setAttribute('src', src);
    busy = false;
  }
  function scan(root) {
    var list = (root.querySelectorAll ? root.querySelectorAll('iframe') : []);
    for (var i = 0; i < list.length; i++) hold(list[i]);
    if (root.tagName === 'IFRAME') hold(root);
  }
  function releaseAll() {
    var list = document.querySelectorAll('iframe[data-consent-src]');
    for (var i = 0; i < list.length; i++) release(list[i]);
  }
  try {
    new MutationObserver(function (muts) {
      if (busy) return;
      for (var i = 0; i < muts.length; i++) {
        var mu = muts[i];
        if (mu.type === 'attributes') { if (mu.target.tagName === 'IFRAME') hold(mu.target); }
        else for (var j = 0; j < mu.addedNodes.length; j++) if (mu.addedNodes[j].nodeType === 1) scan(mu.addedNodes[j]);
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
  } catch (e) {}

  /* ---------- banner and settings link ---------- */
  var css = '#ocBar{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483000;max-width:640px;background:#0b0f16;color:#e6edf6;border:1px solid #2a3647;border-radius:6px;padding:14px 16px;font:13px/1.55 system-ui,-apple-system,Segoe UI,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.55)}' +
    '#ocBar h2{margin:0 0 6px;font:700 14px system-ui,sans-serif;letter-spacing:.02em}' +
    '#ocBar p{margin:0 0 10px;color:#b5c0cf}#ocBar a{color:#5fd4ff}' +
    '#ocBar .ocRow{display:flex;flex-wrap:wrap;gap:8px}' +
    '#ocBar button,#ocSet{font:600 12px system-ui,sans-serif;border-radius:4px;padding:8px 12px;cursor:pointer;border:1px solid #2a3647;background:#141c28;color:#e6edf6}' +
    '#ocBar button.ocYes{background:#5fd4ff;color:#04121a;border-color:#5fd4ff}' +
    '#ocBar button:focus-visible,#ocSet:focus-visible{outline:2px solid #ffd24a;outline-offset:2px}' +
    '#ocSet{position:fixed;left:12px;bottom:12px;z-index:2147482000;padding:5px 9px;font-weight:500;font-size:11px;opacity:.8}#ocSet:hover{opacity:1}' +
    '@media (max-width:480px){#ocBar{left:8px;right:8px;bottom:8px}}';

  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; return e; }
  function closeBar() { var b = document.getElementById('ocBar'); if (b) b.remove(); var s = document.getElementById('ocSet'); if (s) s.hidden = false; }
  function choose(media) { save(media); if (media) releaseAll(); closeBar(); try { window.dispatchEvent(new Event('ophanim-consent')); } catch (e) {} }
  function openBar() {
    if (document.getElementById('ocBar')) return;
    var bar = el('div', { id: 'ocBar', role: 'dialog', 'aria-label': 'Cookie settings' },
      '<h2>Cookies and embedded content</h2>' +
      '<p>This site stores your settings in your own browser (needed for it to work). ' +
      'Some pages can also show videos and posts from YouTube, Vimeo and X. Those companies may set their own cookies and see your IP address, so they stay off unless you allow them. ' +
      '<a href="privacy.html">Read the privacy page</a>.</p>' +
      '<div class="ocRow"><button type="button" class="ocYes" id="ocAllow">Allow third-party content</button>' +
      '<button type="button" id="ocEss">Essential only</button></div>');
    document.body.appendChild(bar);
    document.getElementById('ocAllow').onclick = function () { choose(true); };
    document.getElementById('ocEss').onclick = function () { choose(false); };
    var s = document.getElementById('ocSet'); if (s) s.hidden = true;
    try { document.getElementById('ocAllow').focus(); } catch (e) {}
  }
  function init() {
    var st = el('style', {}); st.textContent = css; document.head.appendChild(st);
    var set = el('button', { id: 'ocSet', type: 'button', 'aria-label': 'Cookie settings' }, 'Cookie settings');
    set.onclick = openBar; document.body.appendChild(set);
    scan(document);
    if (state) set.hidden = false; else openBar();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  /* ---------- small public API for the pages ---------- */
  window.OphanimConsent = {
    media: mediaOk,
    open: openBar,
    reset: function () {
      state = null;
      try { document.cookie = KEY + '=; max-age=0; path=/'; } catch (e) {}
      try { localStorage.removeItem(KEY); } catch (e) {}
      openBar();
    }
  };
})();
