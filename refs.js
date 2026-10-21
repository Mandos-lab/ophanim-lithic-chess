/* refs.js - turns key names in the page text into blue links.
   To add a term, add one line to the list below. Nothing else needs changing.
   w = Wikipedia article title (opens in a new tab)
   s = Wikipedia search (use when unsure of the exact article title)
   p = page on this site (opens in the same tab)
   Only the first mention in each section is linked, and at most twice per page. */
(function () {
  var W = 'https://en.wikipedia.org/wiki/';
  var S = 'https://en.wikipedia.org/wiki/Special:Search?search=';
  var LIST = [
    /* ---- Wikipedia ---- */
    { t: 'Elder Futhark', w: 'Elder_Futhark' },
    { t: 'Younger Futhark', w: 'Younger_Futhark' },
    { t: 'Old Norse', w: 'Old_Norse' },
    { t: 'Hnefatafl', w: 'Hnefatafl' },
    { t: 'Tablut', w: 'Tablut' },
    { t: 'Brandubh', w: 'Brandubh' },
    { t: 'Tawlbwrdd', w: 'Tawlbwrdd' },
    { t: 'Alea Evangelii', w: 'Alea_evangelii' },
    { t: 'Lindisfarne', w: 'Lindisfarne' },
    { t: 'Birka', w: 'Birka' },
    { t: 'Gokstad', w: 'Gokstad_ship' },
    { t: 'Ballinderry', s: 'Ballinderry game board' },
    { t: 'Carl Linnaeus', w: 'Carl_Linnaeus' },
    { t: 'Linnaeus', w: 'Carl_Linnaeus' },
    { t: 'Iter Lapponicum', s: 'Iter Lapponicum Linnaeus' },
    { t: 'Orkneyinga', w: 'Orkneyinga_saga' },
    { t: 'Hervarar', w: 'Hervarar_saga' },
    { t: 'Poetic Edda', w: 'Poetic_Edda' },
    { t: 'Gestumblindi', s: 'Gestumblindi' },
    { t: 'Kali Kolsson', s: 'Rognvald Kali Kolsson' },
    { t: 'Hywel Dda', w: 'Hywel_Dda' },
    { t: 'Kylver', w: 'Kylver_Stone' },
    { t: 'Gotland', w: 'Gotland' },
    { t: 'Odin', w: 'Odin' },
    { t: 'Freyr', w: 'Freyr' },
    { t: 'Tyr', w: 'T%C3%BDr' },
    { t: 'Sámi', w: 'S%C3%A1mi_people' },
    { t: 'Nine Men’s Morris', w: 'Nine_men%27s_morris' },
    { t: 'Nine Men\'s Morris', w: 'Nine_men%27s_morris' },
    { t: 'Thurisaz', w: 'Thurisaz' },
    { t: 'Tiwaz', w: 'Tiwaz' },
    { t: 'Ragnar', s: 'Ragnar Lodbrok' },
    /* ---- Pages on this site ---- */
    { t: 'Phonetic Archaeology', p: 'about.html' },
    { t: 'Petteia', p: 'petteia-codex.html' },
    { t: 'Senet', p: 'senet-codex.html' },
    { t: 'Royal Game of Ur', p: 'royal-game-of-ur-codex.html' },
    { t: 'Tavli', p: 'tavli-codex.html' },
    { t: 'Backgammon', p: 'tavli-codex.html' }
  ];

  var css = document.createElement('style');
  css.textContent =
    'a.ref{color:#6fb1ff;text-decoration:underline dotted;text-underline-offset:3px;cursor:pointer}' +
    'a.ref:hover,a.ref:focus{color:#9ccbff;text-decoration:underline solid}' +
    'a.ref.in{text-decoration:underline solid}';
  document.head.appendChild(css);

  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  LIST.sort(function (a, b) { return b.t.length - a.t.length; });
  var byText = {};
  LIST.forEach(function (e) { byText[e.t] = e; });
  var re = new RegExp('(^|[^A-Za-zÀ-ɏ])(' + LIST.map(function (e) { return esc(e.t); }).join('|') + ')(?![A-Za-zÀ-ɏ])', 'g');

  var SKIP = /^(A|BUTTON|SELECT|OPTION|TEXTAREA|INPUT|SCRIPT|STYLE|SVG|CANVAS|H1|H2|H3|H4|CODE|PRE|LABEL|SUMMARY|TITLE)$/;

  function skip(el) {
    for (; el && el !== document.body; el = el.parentNode) {
      if (el.nodeType !== 1) continue;
      if (SKIP.test(el.nodeName.toUpperCase())) return true;
      if (el.getAttribute('data-noref') !== null || el.classList.contains('noref')) return true;
      if (el.id === 'runeOut' || el.id === 'runeIn' || el.hasAttribute('data-narrate-note')) return true;
      if (el.classList.contains('title') || el.classList.contains('narr-note')) return true;
    }
    return false;
  }

  function run() {
    if (/[?&]embed=1/.test(location.search)) return;
    var total = {};
    var done = new WeakMap();
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (node) {
      var txt = node.nodeValue;
      if (!txt || txt.length < 4) return;
      var par = node.parentNode;
      if (!par || skip(par)) return;
      var scope = par.closest ? (par.closest('section') || document.body) : document.body;
      var seen = done.get(scope);
      if (!seen) { seen = {}; done.set(scope, seen); }
      re.lastIndex = 0;
      var m, last = 0, frag = null;
      while ((m = re.exec(txt))) {
        var term = m[2], e = byText[term];
        var key = e.w || e.s || e.p;
        if (seen[key] || (total[key] || 0) >= 2) continue;
        seen[key] = 1;
        total[key] = (total[key] || 0) + 1;
        if (!frag) frag = document.createDocumentFragment();
        var start = m.index + m[1].length;
        frag.appendChild(document.createTextNode(txt.slice(last, start)));
        var a = document.createElement('a');
        a.className = 'ref';
        a.textContent = term;
        if (e.p) {
          a.href = e.p; a.className += ' in';
          a.title = 'On this site: ' + term;
        } else {
          a.href = e.w ? W + e.w : S + encodeURIComponent(e.s);
          a.target = '_blank'; a.rel = 'noopener noreferrer';
          a.title = 'Wikipedia: ' + term + ' (opens in a new tab)';
        }
        frag.appendChild(a);
        last = start + term.length;
      }
      if (frag) {
        frag.appendChild(document.createTextNode(txt.slice(last)));
        par.replaceChild(frag, node);
      }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
