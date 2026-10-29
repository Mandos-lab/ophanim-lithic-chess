/* lounge.js: the Game Lounge panel on the board-game pages.
   Pass & Play and Play Solo drive the page's own controls. "Challenge a friend" is a mock-up for now:
   it makes a room code and a share link, but there are no live rooms yet. Nothing is sent anywhere. */
(function () {
  'use strict';
  var file = (location.pathname.split('/').pop() || '').replace(/\.html$/, '');
  var G = {
    backgammon: { name: 'Tavli', sel: 'selOpp', two: '2p', hard: 'master', easy: 'apprentice' },
    tafl: { name: 'Tafl (Tufl)', sel: 'selSide', two: '2p', hard: 'def', easy: 'def', lvl: 'selLvl', lvlHard: 'jarl', lvlEasy: 'thrall' },
    ludus: { name: 'Ludus Latrunculorum', sel: 'selOpp', two: '2p', hard: 'vizier', easy: 'scribe' },
    petteia: { name: 'Petteia', sel: 'selOpp', two: '2p', hard: 'vizier', easy: 'scribe' },
    ur: { name: 'Royal Game of Ur', sel: 'selOpp', two: '2p', hard: 'vizier', easy: 'scribe' },
    senet: { name: 'Senet', sel: 'selOpp', two: '2p', hard: 'vizier', easy: 'scribe' },
    chess: { name: 'Chess', sel: 'mode', two: '2p', hard: 'cpu', easy: 'cpu' }
  }[file];
  if (!G) return;
  var AL = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var el = function (t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; };
  function lang() { try { return window.OphanimAccount ? window.OphanimAccount.lang() : 'en'; } catch (e) { return 'en'; } }
  var T = {
    en: { btn: 'Game Lounge', title: 'Game Lounge', room: 'Match room', lead: 'Choose how to play ', pp: 'Pass & Play', ppd: 'Two players, one screen. Take turns on this device.', solo: 'Play Solo', sod: 'Play against the engine.', strong: 'Stronger', easy: 'Easier',
      ch: 'Challenge a Friend', chd: 'Make a room code and a link to send.', make: 'Make a room', code: 'Room code', link: 'Share link', copyc: 'Copy code', copyl: 'Copy link', share: 'Share', copied: 'Copied',
      players: 'Players in this room', you: 'You', wait: 'Waiting for a friend to join', soon: 'Live rooms are not open yet. A code and link reserve nothing, and a friend who opens the link lands on this game with no live connection. Until online play is built, use Pass & Play on one screen, or play the engine.', invited: 'You were invited to room', started: 'New game started', close: 'Close',
      me: 'Playing as', nonick: 'Guest. No nickname yet.', nick: 'Nickname', save: 'Save', change: 'Change', hint: 'Other players will see your nickname. 2 to 24 letters or numbers. Nobody else can use the same one.', bad: 'Use 2 to 24 letters, numbers, spaces, dots, dashes or underscores.', taken: 'That nickname is taken. Try another.', fail: 'Could not reach the back room. Try again in a moment.', saved: 'Nickname saved', wait2: 'Saving…',
      joinb: 'Join game', over: 'That game is over. Make a new room to play again.', cancelr: 'Cancel room', liveinfo: 'Your room is open. Send the code or the link to a friend. The game starts as soon as they join.', nosuch: 'There is no room with that code.', full: 'That room already has two players.', toomany: 'You already have three open rooms. Cancel one first.', connfail: 'Could not reach the back room. Try again in a moment.', working: 'Working…' },
    el: { btn: 'Σαλόνι Παιχνιδιού', title: 'Σαλόνι Παιχνιδιού', room: 'Δωμάτιο αγώνα', lead: 'Επιλέξτε πώς θα παίξετε ', pp: 'Εναλλαγή στην ίδια οθόνη', ppd: 'Δύο παίκτες, μία οθόνη. Παίζετε εναλλάξ σε αυτή τη συσκευή.', solo: 'Μόνος', sod: 'Παίξτε εναντίον της μηχανής.', strong: 'Δυνατότερη', easy: 'Ευκολότερη',
      ch: 'Πρόκληση σε φίλο', chd: 'Φτιάξτε κωδικό δωματίου και σύνδεσμο για αποστολή.', make: 'Φτιάξτε δωμάτιο', code: 'Κωδικός δωματίου', link: 'Σύνδεσμος', copyc: 'Αντιγραφή κωδικού', copyl: 'Αντιγραφή συνδέσμου', share: 'Κοινοποίηση', copied: 'Αντιγράφηκε',
      players: 'Παίκτες στο δωμάτιο', you: 'Εσείς', wait: 'Αναμονή για φίλο', soon: 'Τα ζωντανά δωμάτια δεν έχουν ανοίξει ακόμη. Ο κωδικός και ο σύνδεσμος δεν δεσμεύουν τίποτα και ο φίλος που ανοίγει τον σύνδεσμο φτάνει σε αυτό το παιχνίδι χωρίς ζωντανή σύνδεση. Μέχρι να γίνει το διαδικτυακό παιχνίδι, χρησιμοποιήστε την εναλλαγή στην ίδια οθόνη ή παίξτε με τη μηχανή.', invited: 'Σας προσκάλεσαν στο δωμάτιο', started: 'Ξεκίνησε νέο παιχνίδι', close: 'Κλείσιμο',
      me: 'Παίζετε ως', nonick: 'Επισκέπτης. Χωρίς ψευδώνυμο ακόμη.', nick: 'Ψευδώνυμο', save: 'Αποθήκευση', change: 'Αλλαγή', hint: 'Οι άλλοι παίκτες θα βλέπουν το ψευδώνυμό σας. 2 έως 24 γράμματα ή αριθμοί. Κανείς άλλος δεν μπορεί να έχει το ίδιο.', bad: 'Χρησιμοποιήστε 2 έως 24 γράμματα, αριθμούς, κενά, τελείες, παύλες ή κάτω παύλες.', taken: 'Αυτό το ψευδώνυμο το έχει άλλος. Δοκιμάστε άλλο.', fail: 'Δεν έγινε σύνδεση. Δοκιμάστε ξανά σε λίγο.', saved: 'Το ψευδώνυμο αποθηκεύτηκε', wait2: 'Αποθήκευση…',
      joinb: 'Συμμετοχή στο παιχνίδι', over: 'Το παιχνίδι έχει τελειώσει. Φτιάξτε νέο δωμάτιο για να παίξετε ξανά.', cancelr: 'Ακύρωση δωματίου', liveinfo: 'Το δωμάτιό σας είναι ανοιχτό. Στείλτε τον κωδικό ή τον σύνδεσμο σε έναν φίλο. Το παιχνίδι ξεκινά μόλις συνδεθεί.', nosuch: 'Δεν υπάρχει δωμάτιο με αυτόν τον κωδικό.', full: 'Αυτό το δωμάτιο έχει ήδη δύο παίκτες.', toomany: 'Έχετε ήδη τρία ανοιχτά δωμάτια. Ακυρώστε ένα πρώτα.', connfail: 'Δεν έγινε σύνδεση. Δοκιμάστε ξανά σε λίγο.', working: 'Μια στιγμή…' }
  };
  function tx() { return T[lang()]; }
  var css = '.gl-btn{position:fixed;right:12px;bottom:62px;z-index:2147481000;padding:9px 16px;font:700 14px/1.2 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.04em;color:#fff;background:#3a1219;border:2px solid #ff4d5e;border-radius:999px;cursor:pointer;box-shadow:0 0 10px rgba(255,77,94,.35)}.gl-btn:hover,.gl-btn:focus-visible{background:#5a1c26;border-color:#ff8a94;outline:none}.gl-btn b{color:#ffd27a;font-weight:700}' +
    '.gl-ov{position:fixed;inset:0;z-index:2147482400;display:none;align-items:center;justify-content:center;padding:14px;background:rgba(2,5,9,.78);backdrop-filter:blur(3px)}.gl-ov.on{display:flex}' +
    '.gl-box{width:100%;max-width:520px;max-height:92vh;overflow:auto;position:relative;background:linear-gradient(160deg,#10151d,#0a0d12);border:1px solid rgba(232,195,117,.45);border-radius:8px;box-shadow:0 30px 80px rgba(0,0,0,.7);color:#d6dde7;font:16px/1.5 "EB Garamond",Georgia,serif;padding:20px 22px}' +
    '.gl-box h2{font:500 22px "Cinzel",Georgia,serif;letter-spacing:.06em;color:#e8c375;margin:0}.gl-box .k{font:11px "JetBrains Mono",monospace;letter-spacing:.14em;text-transform:uppercase;color:#46e3f0;margin:2px 0 12px}' +
    '.gl-x{position:absolute;top:10px;right:12px;background:none;border:0;color:#8fa0b4;font-size:22px;cursor:pointer;line-height:1}.gl-x:hover{color:#e8c375}' +
    '.gl-card{border:1px solid rgba(232,195,117,.3);border-radius:6px;padding:12px 14px;margin:0 0 10px;background:rgba(232,195,117,.05)}.gl-card h3{font:600 13px "JetBrains Mono",monospace;letter-spacing:.1em;text-transform:uppercase;color:#e8c375;margin:0 0 3px}.gl-card p{margin:0 0 8px;font-size:15px;color:#aeb9c8}' +
    '.gl-go{background:rgba(232,195,117,.14);border:1px solid #e8c375;color:#e8c375;font:600 12px "JetBrains Mono",monospace;letter-spacing:.12em;text-transform:uppercase;padding:9px 12px;border-radius:4px;cursor:pointer;margin:0 6px 6px 0}.gl-go:hover{background:rgba(232,195,117,.28)}.gl-go.c{border-color:#46e3f0;color:#46e3f0;background:rgba(70,227,240,.08)}' +
    '.gl-code{font:600 26px "JetBrains Mono",monospace;letter-spacing:.3em;color:#46e3f0;margin:2px 0 6px}.gl-in{width:100%;box-sizing:border-box;background:#070a0f;border:1px solid rgba(232,195,117,.3);color:#c9d3e0;font:13px "JetBrains Mono",monospace;padding:7px 8px;border-radius:4px;margin:0 0 8px}' +
    '.gl-pl{list-style:none;margin:0 0 8px;padding:0;font-size:15px}.gl-pl li{padding:5px 0;border-bottom:1px dashed rgba(232,195,117,.2)}.gl-pl .w{color:#8fa0b4;font-style:italic}.gl-note{margin:12px 0 0;padding:10px 12px;border-left:2px solid #e8c375;background:rgba(232,195,117,.07);font-size:14px;color:#9eabbd}' +
    '.gl-sw{display:inline-flex;gap:6px;margin:0 8px 6px 0}.gl-sw button{background:none;border:1px solid rgba(232,195,117,.3);color:#c8b27a;padding:7px 10px;border-radius:4px;cursor:pointer;font:600 11px "JetBrains Mono",monospace;letter-spacing:.08em;text-transform:uppercase}.gl-sw button[aria-pressed=true]{background:rgba(232,195,117,.2);color:#e8c375;border-color:#e8c375}' +
    '.gl-toast{position:fixed;left:50%;bottom:96px;transform:translateX(-50%);z-index:2147482600;background:#0a0d12;border:1px solid #e8c375;color:#e8c375;padding:8px 14px;border-radius:4px;font:12px "JetBrains Mono",monospace}@media(max-width:520px){.gl-btn{bottom:48px}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = el('button', 'gl-btn'); btn.type = 'button'; btn.setAttribute('aria-haspopup', 'dialog'); document.body.appendChild(btn);
  var ov, box, strong = true, code = null, invited = (new URLSearchParams(location.search).get('room') || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  function paintBtn() { btn.textContent = ''; btn.appendChild(document.createTextNode('⚔ ' + tx().btn)); if (invited) { var b = el('b', null, ' · ' + invited); btn.appendChild(b); } }
  function toast(m) { var e = el('div', 'gl-toast', m); document.body.appendChild(e); setTimeout(function () { if (e.parentNode) e.parentNode.removeChild(e); }, 2200); }
  function setSel(id, v) { var s = document.getElementById(id); if (!s) return false; var ok = [].some.call(s.options, function (o) { return o.value === v; }); if (!ok) return false; s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); return true; }
  function newGame() { var b = document.getElementById('btnNew') || document.getElementById('newGame') || document.getElementById('btnNewGame'); if (b) b.click(); }
  function play(kind) {
    var ok;
    if (kind === 'pp') ok = setSel(G.sel, G.two);
    else { ok = setSel(G.sel, strong ? G.hard : G.easy); if (G.lvl) setSel(G.lvl, strong ? G.lvlHard : G.lvlEasy); }
    newGame(); close(); toast(tx().started);
    try { if (window.OphanimAccount) window.OphanimAccount.save('lounge.' + file, { mode: kind, strong: strong, t: Date.now() }); } catch (e) {}
    try { var a = document.getElementById('board') || document.querySelector('canvas'); if (a && a.scrollIntoView) a.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (e) {}
  }
  function rand() { var s = '', i; try { var a = new Uint32Array(5); crypto.getRandomValues(a); for (i = 0; i < 5; i++) s += AL[a[i] % AL.length]; } catch (e) { for (i = 0; i < 5; i++) s += AL[Math.floor(Math.random() * AL.length)]; } return s; }
  function linkFor(c) { var u = new URL(location.href); u.search = ''; u.hash = ''; u.searchParams.set('room', c); return u.toString(); }
  function copy(text) { var d = tx().copied; try { navigator.clipboard.writeText(text).then(function () { toast(d); }, function () { prompt('', text); }); } catch (e) { prompt('', text); } }
  /* ---- Live rooms (chess only for now; the other games keep the mock-up) ---- */
  var live = null, liveMsg = '', liveBusy = false, stopLive = null;
  function liveOK() { return file === 'chess' && window.OphanimOnline && window.OphanimOnline.room && window.OphanimRoomHooks; }
  function errKey(e) { var m = String((e && e.message) || e || ''); if (/no such room/i.test(m)) return 'nosuch'; if (/full/i.test(m)) return 'full'; if (/too many/i.test(m)) return 'toomany'; return 'connfail'; }
  function enterGame(row) { if (stopLive) { stopLive(); stopLive = null; } live = null; liveMsg = ''; liveBusy = false; close(); window.OphanimRoomHooks.start(row); }
  function makeLive() {
    liveBusy = true; liveMsg = tx().working; render();
    window.OphanimOnline.room.create('chess').then(function (row) {
      liveBusy = false; liveMsg = ''; live = row;
      if (row.status === 'playing') { enterGame(row); return; }
      stopLive = window.OphanimOnline.room.watch(row.id, function (r) { if (r.status === 'playing') enterGame(r); else if (r.status === 'finished') { live = null; if (stopLive) { stopLive(); stopLive = null; } render(); } });
      render();
    }, function (e) { liveBusy = false; liveMsg = tx()[errKey(e)]; render(); });
  }
  function joinLive(code) {
    liveBusy = true; liveMsg = tx().working; render();
    window.OphanimOnline.room.join(code).then(function (row) {
      if (row.status === 'playing') enterGame(row); else if (row.status === 'finished') { window.OphanimOnline.room.forget(); invited = ''; paintBtn(); liveBusy = false; live = null; liveMsg = tx().over; render(); } else { liveBusy = false; live = row; liveMsg = ''; render(); }
    }, function (e) { liveBusy = false; liveMsg = tx()[errKey(e)]; render(); });
  }
  function cancelLive() {
    var id = live && live.id; if (stopLive) { stopLive(); stopLive = null; } live = null; liveMsg = '';
    if (id) window.OphanimOnline.room.cancel(id).then(render, render); else render();
  }
  function liveCard(c3, T0) {
    var O = window.OphanimOnline;
    if (live) {
      c3.appendChild(el('p', null, T0.liveinfo));
      c3.appendChild(el('div', 'gl-code', live.code));
      var li = el('input', 'gl-in'); li.readOnly = true; li.value = linkFor(live.code); li.setAttribute('aria-label', T0.link); li.addEventListener('focus', function () { li.select(); }); c3.appendChild(li);
      var cc = el('button', 'gl-go c', T0.copyc); cc.type = 'button'; cc.addEventListener('click', function () { copy(live.code); }); c3.appendChild(cc);
      var cl = el('button', 'gl-go c', T0.copyl); cl.type = 'button'; cl.addEventListener('click', function () { copy(linkFor(live.code)); }); c3.appendChild(cl);
      if (navigator.share) { var sh = el('button', 'gl-go c', T0.share); sh.type = 'button'; sh.addEventListener('click', function () { navigator.share({ title: G.name, text: G.name + ' · ' + live.code, url: linkFor(live.code) }).catch(function () {}); }); c3.appendChild(sh); }
      c3.appendChild(el('h3', null, T0.players));
      var ul = el('ul', 'gl-pl'); ul.appendChild(el('li', null, T0.you + ' · ' + (O.handle() || T0.nonick))); ul.appendChild(el('li', 'w', T0.wait + ' …')); c3.appendChild(ul);
      var cn = el('button', 'gl-go', T0.cancelr); cn.type = 'button'; cn.addEventListener('click', cancelLive); c3.appendChild(cn);
    } else {
      if (invited) {
        c3.appendChild(el('p', null, T0.invited + ' ' + invited + '.'));
        var jb = el('button', 'gl-go c', T0.joinb); jb.type = 'button'; jb.disabled = liveBusy; jb.addEventListener('click', function () { joinLive(invited); }); c3.appendChild(jb);
      } else {
        c3.appendChild(el('p', null, T0.chd));
        var mb = el('button', 'gl-go c', T0.make); mb.type = 'button'; mb.disabled = liveBusy; mb.addEventListener('click', makeLive); c3.appendChild(mb);
      }
    }
    if (liveMsg) { var m = el('p', null, liveMsg); m.style.cssText = 'color:#ff9a8a;margin:6px 0 0;font-size:14px'; c3.appendChild(m); }
  }
  var editing = false, nickMsg = '';
  function nickCard(T0) {
    var O = window.OphanimOnline, h = O.handle();
    var c = el('div', 'gl-card');
    c.appendChild(el('h3', null, T0.me));
    var row = el('p', null); row.style.cssText = 'font-size:18px;color:#e8c375;margin:0 0 6px';
    row.appendChild(document.createTextNode(h || T0.nonick)); c.appendChild(row);
    if (h && !editing) {
      var ch = el('button', 'gl-go c', T0.change); ch.type = 'button';
      ch.addEventListener('click', function () { editing = true; nickMsg = ''; render(); }); c.appendChild(ch);
    } else {
      var inp = el('input', 'gl-in'); inp.maxLength = 24; inp.placeholder = T0.nick; inp.autocomplete = 'off'; inp.setAttribute('aria-label', T0.nick);
      c.appendChild(inp);
      var sv = el('button', 'gl-go', T0.save); sv.type = 'button';
      function go() {
        sv.disabled = true; nickMsg = T0.wait2; msg.textContent = nickMsg;
        O.claim(inp.value).then(function (r) {
          sv.disabled = false;
          if (r.ok) { editing = false; nickMsg = ''; render(); toast(tx().saved); return; }
          nickMsg = T0[r.error] || T0.fail; msg.textContent = nickMsg;
        });
      }
      sv.addEventListener('click', go); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
      c.appendChild(sv);
      var msg = el('p', null, nickMsg); msg.style.cssText = 'color:#ff9a8a;margin:4px 0 0;font-size:14px'; c.appendChild(msg);
      c.appendChild(el('p', null, T0.hint));
      if (h) { var cn = el('button', 'gl-go c', T0.close); cn.type = 'button'; cn.addEventListener('click', function () { editing = false; nickMsg = ''; render(); }); c.appendChild(cn); }
    }
    return c;
  }
  function render() {
    var T0 = tx(); box.textContent = '';
    var x = el('button', 'gl-x', '×'); x.type = 'button'; x.setAttribute('aria-label', T0.close); x.addEventListener('click', close); box.appendChild(x);
    var h = el('h2', null, T0.title); h.id = 'gl-h'; box.appendChild(h); box.appendChild(el('div', 'k', T0.lead + G.name));
    if (window.OphanimOnline) box.appendChild(nickCard(T0));
    var c1 =el('div', 'gl-card'); c1.appendChild(el('h3', null, T0.pp)); c1.appendChild(el('p', null, T0.ppd));
    var b1 = el('button', 'gl-go', T0.pp); b1.type = 'button'; b1.addEventListener('click', function () { play('pp'); }); c1.appendChild(b1); box.appendChild(c1);
    var c2 = el('div', 'gl-card'); c2.appendChild(el('h3', null, T0.solo)); c2.appendChild(el('p', null, T0.sod));
    var sw = el('div', 'gl-sw'); [[true, T0.strong], [false, T0.easy]].forEach(function (a) { var b = el('button', null, a[1]); b.type = 'button'; b.setAttribute('aria-pressed', String(strong === a[0])); b.addEventListener('click', function () { strong = a[0]; [].forEach.call(sw.children, function (q) { q.setAttribute('aria-pressed', String(q === b)); }); }); sw.appendChild(b); });
    c2.appendChild(sw); var b2 = el('button', 'gl-go', T0.solo); b2.type = 'button'; b2.addEventListener('click', function () { play('solo'); }); c2.appendChild(b2); box.appendChild(c2);
    var c3 = el('div', 'gl-card'); c3.appendChild(el('h3', null, T0.ch));
    if (liveOK()) { liveCard(c3, T0); box.appendChild(c3); return; }
    if (invited) c3.appendChild(el('p', null, T0.invited + ' ' + invited + '.'));
    c3.appendChild(el('p', null, T0.chd));
    var rc = code || invited;
    if (!rc) { var b3 = el('button', 'gl-go c', T0.make); b3.type = 'button'; b3.addEventListener('click', function () { code = rand(); render(); }); c3.appendChild(b3); }
    else {
      c3.appendChild(el('div', 'gl-code', rc));
      var li = el('input', 'gl-in'); li.readOnly = true; li.value = linkFor(rc); li.setAttribute('aria-label', T0.link); li.addEventListener('focus', function () { li.select(); }); c3.appendChild(li);
      var cc = el('button', 'gl-go c', T0.copyc); cc.type = 'button'; cc.addEventListener('click', function () { copy(rc); }); c3.appendChild(cc);
      var cl = el('button', 'gl-go c', T0.copyl); cl.type = 'button'; cl.addEventListener('click', function () { copy(linkFor(rc)); }); c3.appendChild(cl);
      if (navigator.share) { var sh = el('button', 'gl-go c', T0.share); sh.type = 'button'; sh.addEventListener('click', function () { navigator.share({ title: G.name, text: G.name + ' · ' + rc, url: linkFor(rc) }).catch(function () {}); }); c3.appendChild(sh); }
      c3.appendChild(el('h3', null, T0.players));
      var ul = el('ul', 'gl-pl'); var me = window.OphanimAccount && window.OphanimAccount.get(); var on = window.OphanimOnline && window.OphanimOnline.handle(); ul.appendChild(el('li', null, T0.you + ' · ' + (on ? on : (me ? '@' + me.handle : 'Guest'))));
      ul.appendChild(el('li', 'w', T0.wait + ' …')); c3.appendChild(ul);
    }
    c3.appendChild(el('p', 'gl-note', T0.soon)); box.appendChild(c3);
  }
  function build() { if (ov) return; ov = el('div', 'gl-ov'); ov.addEventListener('click', function (e) { if (e.target === ov) close(); }); box = el('div', 'gl-box'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-labelledby', 'gl-h'); ov.appendChild(box); document.body.appendChild(ov); document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && ov.classList.contains('on')) close(); }); }
  function open() { build(); render(); ov.classList.add('on'); if (window.OphanimOnline) window.OphanimOnline.init(); }
  document.addEventListener('ophanim:online', function () { if (ov && ov.classList.contains('on') && !editing) render(); });
  function close() { if (ov) ov.classList.remove('on'); }
  btn.addEventListener('click', open); paintBtn();
  document.addEventListener('ophanim:account', function () { paintBtn(); if (ov && ov.classList.contains('on')) render(); });
  if (invited) setTimeout(open, 600);
})();
