/* Philosophy From A Stone: the Mandos links (X, YouTube, Magnesia Reserve) at the foot of every page.
   Adds the row only if the page does not already carry it. Greek on lang="el" pages. */
(function () {
  'use strict';
  function go() {
    if (document.querySelector('a[href*="youtube.com/@philosophy_from_a_stone"]')) return;
    if (/magnesia-reserve\.html/.test(location.pathname)) return;
    var EL = /^el/i.test(document.documentElement.lang || '');
    var css = '#mdLinks{position:relative;z-index:1;text-align:center;padding:30px 16px 74px;font:12px/1.4 ui-monospace,Consolas,monospace;letter-spacing:.08em}' +
      '#mdLinks a{display:inline-block;margin:4px 5px;padding:7px 12px;color:#b4bec2;text-decoration:none;border:1px solid rgba(180,190,200,.32);border-radius:4px;background:rgba(4,8,12,.55)}' +
      '#mdLinks a:hover,#mdLinks a:focus-visible{color:#e8c375;border-color:#e8c375;outline:none}';
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var d = document.createElement('div'); d.id = 'mdLinks';
    d.innerHTML = '<a href="https://x.com/Mandos16" target="_blank" rel="noopener noreferrer">X &middot; @Mandos16</a>' +
      '<a href="https://www.youtube.com/@philosophy_from_a_stone" target="_blank" rel="noopener noreferrer">YouTube &middot; @philosophy_from_a_stone</a>' +
      '<a href="magnesia-reserve.html">' + (EL ? 'Δωρεά' : 'Donate') + ' &middot; Magnesia Reserve</a>';
    document.body.appendChild(d);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
