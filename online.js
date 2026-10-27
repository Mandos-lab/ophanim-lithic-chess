/* online.js: the link between the site and its back room (Supabase).
   Loaded only on the six game pages. It never contacts the back room until a visitor opens the Game Lounge,
   and it makes a visitor record only when someone presses Save on a nickname. No page view creates anything.
   The key below is the PUBLIC key: it is designed to sit in a web page, and the database rules decide what it may do.
   API: window.OphanimOnline = { init(), handle(), ready(), claim(nick) -> Promise<{ok, handle, error}> } */
(function () {
  'use strict';
  if (window.OphanimOnline) return;
  var URL = 'https://pbhtnlxvouwxxnwatynp.supabase.co';
  var KEY = 'sb_publishable_J2G1HqqRw0ii4s49O8OFNw_X3UrU_Rz';
  var LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
  var sb = null, loading = null, nick = null, known = false, failed = false;

  function say() { try { document.dispatchEvent(new CustomEvent('ophanim:online', { detail: { handle: nick, failed: failed } })); } catch (e) {} }

  function lib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = LIB; s.async = true;
      s.onload = function () { res(); }; s.onerror = function () { rej(new Error('lib')); };
      document.head.appendChild(s);
    });
  }
  function client() {
    if (sb) return Promise.resolve(sb);
    return lib().then(function () { sb = window.supabase.createClient(URL, KEY); return sb; });
  }
  function readProfile(user) {
    return sb.from('profiles').select('handle,is_guest').eq('id', user.id).single().then(function (r) {
      if (r.error || !r.data) throw (r.error || new Error('none'));
      nick = r.data.handle; known = true; return nick;
    });
  }
  /* Looks for an existing visitor on this device. Never creates one. */
  function init() {
    if (loading) return loading;
    loading = client().then(function (c) {
      return c.auth.getSession().then(function (s) {
        var u = s && s.data && s.data.session && s.data.session.user;
        if (u) { uid = u.id; return readProfile(u); }
        return null;
      });
    }).then(function () { failed = false; say(); }, function () { failed = true; loading = null; say(); });
    return loading;
  }
  function clean(n) { return String(n || '').replace(/\s+/g, ' ').trim(); }
  function valid(n) { try { return /^[\p{L}\p{N}_.\- ]{2,24}$/u.test(n); } catch (e) { return /^[A-Za-z0-9_.\- ]{2,24}$/.test(n); } }
  /* Makes the visitor if needed, then saves the nickname. */
  function claim(raw) {
    var n = clean(raw);
    if (!valid(n)) return Promise.resolve({ ok: false, error: 'bad' });
    return client().then(function (c) {
      return c.auth.getSession().then(function (s) {
        var u = s && s.data && s.data.session && s.data.session.user;
        if (u) return u;
        return c.auth.signInAnonymously().then(function (r) { if (r.error) throw r.error; return r.data.user; });
      }).then(function (u) {
        uid = u.id;
        return c.from('profiles').update({ handle: n }).eq('id', u.id).select('handle').then(function (r) {
          if (r.error) return { ok: false, error: r.error.code === '23505' ? 'taken' : 'fail' };
          if (!r.data || !r.data.length) return { ok: false, error: 'fail' };
          nick = r.data[0].handle; known = true; failed = false; say();
          return { ok: true, handle: nick };
        });
      });
    }).catch(function () { return { ok: false, error: 'fail' }; });
  }
  /* ---------- Live rooms ---------- */
  var RK = 'ophanim.room', uid = null;
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function sess() { return client().then(function (c) { return c.auth.getSession(); }).then(function (s) { var u = s && s.data && s.data.session && s.data.session.user; if (u) uid = u.id; return u || null; }); }
  function ensureUser() {
    return sess().then(function (u) {
      if (u) return u;
      return sb.auth.signInAnonymously().then(function (r) { if (r.error) throw r.error; uid = r.data.user.id; return r.data.user; });
    });
  }
  function rpc(name, args) { return sb.rpc(name, args).then(function (r) { if (r.error) throw r.error; return r.data; }); }
  function getRoom(id) { return client().then(function () { return sb.from('rooms').select('*').eq('id', id).single(); }).then(function (r) { if (r.error) throw r.error; return r.data; }); }
  var room = {
    create: function (game) { return ensureUser().then(function () { return rpc('create_room', { p_game: game }); }).then(function (r) { ls(RK, r.id); return r; }); },
    join: function (code) { return ensureUser().then(function () { return rpc('join_room', { p_code: code }); }).then(function (r) { ls(RK, r.id); return r; }); },
    get: getRoom,
    me: function () { return uid; },
    move: function (id, san, len, result) { return rpc('post_move', { p_room: id, p_san: san, p_len: len, p_result: result || null }); },
    resign: function (id) { return rpc('resign_room', { p_room: id }); },
    cancel: function (id) { return rpc('cancel_room', { p_room: id }).then(function () { ls(RK, null); }); },
    forget: function () { ls(RK, null); },
    /* Picks up a room this device was in (refresh, or coming back later). Never creates a visitor. */
    resume: function () {
      var id = ls(RK); if (!id) return Promise.resolve(null);
      return sess().then(function (u) {
        if (!u) return null;
        return getRoom(id).then(function (r) { if (!r || r.status === 'finished') { ls(RK, null); return null; } return r; });
      }).catch(function () { return null; });
    },
    names: function (ids) {
      ids = ids.filter(Boolean);
      if (!ids.length) return Promise.resolve({});
      return client().then(function () { return sb.from('profiles').select('id,handle').in('id', ids); }).then(function (r) {
        var m = {}; ((r && r.data) || []).forEach(function (p) { m[p.id] = p.handle; }); return m;
      }).catch(function () { return {}; });
    },
    /* Chat between the two players of a room. */
    say: function (id, body) { return rpc('post_message', { p_room: id, p_body: body }); },
    chat: function (id, cb) {
      var stopped = false, ch = null, timer = null, last = 0, busy = false;
      function pull() {
        if (stopped || busy || !sb) return; busy = true;
        sb.from('room_messages').select('id,sender,body,created_at').eq('room', id).gt('id', last).order('id', { ascending: true }).limit(200).then(function (r) {
          busy = false; if (stopped || !r || r.error || !r.data || !r.data.length) return;
          r.data.forEach(function (m) { if (m.id > last) last = m.id; });
          cb(r.data);
        }, function () { busy = false; });
      }
      client().then(function (c) {
        if (stopped) return;
        try { ch = c.channel('chat-' + id).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'room_messages', filter: 'room=eq.' + id }, function () { pull(); }).subscribe(); } catch (e) {}
        pull();
      });
      timer = setInterval(pull, 4000);
      return { stop: function () { stopped = true; clearInterval(timer); try { if (ch && sb) sb.removeChannel(ch); } catch (e) {} }, pull: pull };
    },
    /* Live updates, with a slow check every 4 seconds as a safety net. Returns a stop function. */
    watch: function (id, cb) {
      var stopped = false, ch = null, timer = null, last = '';
      function push(row) {
        if (stopped || !row) return;
        var k = row.updated_at + '|' + ((row.moves || []).length) + '|' + row.status;
        if (k === last) return; last = k; cb(row);
      }
      client().then(function (c) {
        if (stopped) return;
        try { ch = c.channel('room-' + id).on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter: 'id=eq.' + id }, function (p) { push(p.new); }).subscribe(); } catch (e) {}
        getRoom(id).then(push, function () {});
      });
      timer = setInterval(function () { if (sb) getRoom(id).then(push, function () {}); }, 4000);
      return function () { stopped = true; clearInterval(timer); try { if (ch && sb) sb.removeChannel(ch); } catch (e) {} };
    }
  };
  window.OphanimOnline = { init: init, handle: function () { return nick; }, ready: function () { return known; }, failed: function () { return failed; }, claim: claim, room: room };
})();
