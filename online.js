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
        if (u) return readProfile(u);
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
        return c.from('profiles').update({ handle: n }).eq('id', u.id).select('handle').then(function (r) {
          if (r.error) return { ok: false, error: r.error.code === '23505' ? 'taken' : 'fail' };
          if (!r.data || !r.data.length) return { ok: false, error: 'fail' };
          nick = r.data[0].handle; known = true; failed = false; say();
          return { ok: true, handle: nick };
        });
      });
    }).catch(function () { return { ok: false, error: 'fail' }; });
  }
  window.OphanimOnline = { init: init, handle: function () { return nick; }, ready: function () { return known; }, failed: function () { return failed; }, claim: claim };
})();
