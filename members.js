/* members.js: real member accounts (email and password) for the whole site, through the same Supabase back room as the game lounge.
   It is loaded by account.js on every page, but it does nothing and contacts nobody until either (a) this browser already holds a member
   sign-in, or (b) the visitor opens the Join / Sign in form. The key below is the PUBLIC key: it is meant to sit in a web page, and the
   database rules (row level security) decide what it may do. Guests who play online use anonymous sessions: those are NOT members.
   API: window.OphanimMember = { ready(), user(), handle(), email(), signUp(email, pw), signIn(email, pw), signOut(), reset(email),
          setPassword(pw), setHandle(h), words.list(), words.put(en, forms), words.del(id), onchange(fn) }
   Event: document 'ophanim:member' fires whenever the member state changes. */
(function () {
  'use strict';
  if (window.OphanimMember) return;
  var URL = 'https://pbhtnlxvouwxxnwatynp.supabase.co';
  var KEY = 'sb_publishable_J2G1HqqRw0ii4s49O8OFNw_X3UrU_Rz';
  var LIB = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
  var TOKEN = 'sb-pbhtnlxvouwxxnwatynp-auth-token';
  var sb = null, loading = null, me = null, hnd = null, subs = [], readyP = null, REC = /type=recovery/.test(location.href);

  function fire() {
    try { document.dispatchEvent(new CustomEvent('ophanim:member', { detail: { user: me, handle: hnd } })); } catch (e) { }
    subs.forEach(function (f) { try { f(me); } catch (e) { } });
  }
  function lib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve();
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = LIB; s.async = true;
      s.onload = function () { res(); }; s.onerror = function () { rej(new Error('lib')); };
      document.head.appendChild(s);
    });
  }
  function readHandle(u) {
    return sb.from('profiles').select('handle').eq('id', u.id).single().then(function (r) { hnd = (r && r.data && r.data.handle) || null; }, function () { hnd = null; });
  }
  function apply(u) {
    var m = u && !u.is_anonymous ? u : null;
    if (!m) { me = null; hnd = null; fire(); return Promise.resolve(); }
    me = m; return readHandle(m).then(fire);
  }
  function client() {
    if (sb) return Promise.resolve(sb);
    if (loading) return loading;
    loading = lib().then(function () {
      sb = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
      sb.auth.onAuthStateChange(function (ev, s) { setTimeout(function () { apply(s && s.user); }, 0); });
      return sb;
    }, function (e) { loading = null; throw e; });
    return loading;
  }
  function stored() { try { return localStorage.getItem(TOKEN) !== null; } catch (e) { return false; } }
  function returning() { return /[#&?](access_token|code|error_description)=/.test(location.href); }

  function init() {
    if (readyP) return readyP;
    if (!stored() && !returning()) { readyP = Promise.resolve(null); return readyP; }
    readyP = client().then(function (c) { return c.auth.getSession(); }).then(function (r) { return apply(r && r.data && r.data.session && r.data.session.user); }).then(function () { return me; }, function () { return null; });
    return readyP;
  }
  /* turns a back-room error into a sentence a person can act on */
  function say(e) {
    var m = String((e && (e.message || e.error_description || e.code)) || e || '').toLowerCase();
    if (/invalid login|invalid credentials/.test(m)) return 'Wrong email or password.';
    if (/already registered|already been registered|exists/.test(m)) return 'That email already has an account. Use Sign in instead.';
    if (/email not confirmed/.test(m)) return 'Please confirm your email first: open the link in the message we sent you.';
    if (/rate limit|too many|429|security purposes/.test(m)) return 'Too many tries just now. Wait a few minutes and try again.';
    if (/password/.test(m) && /(short|least|characters|weak)/.test(m)) return 'That password is too weak. Use at least 8 characters.';
    if (/valid email|invalid email|email address/.test(m)) return 'That does not look like a valid email address.';
    if (/signups not allowed|disabled/.test(m)) return 'Sign-ups are closed at the moment.';
    if (/lib|network|fetch|failed/.test(m)) return 'Could not reach the sign-in service. Check your connection and try again.';
    return 'Something went wrong. Please try again.';
  }
  function okMail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s); }
  function clean(n) { return String(n || '').replace(/\s+/g, ' ').trim(); }
  function validHandle(n) { try { return /^[\p{L}\p{N}_.\- ]{2,24}$/u.test(n); } catch (e) { return /^[A-Za-z0-9_.\- ]{2,24}$/.test(n); } }
  function back() { return location.origin + '/dashboard.html'; }

  var words = {
    list: function () {
      return client().then(function (c) { return c.from('member_words').select('id,en,forms,created_at').order('created_at', { ascending: true }); })
        .then(function (r) { if (r.error) throw r.error; return r.data || []; });
    },
    /* adds or updates the English word en with the per-script forms object. Returns the saved row. */
    put: function (en, forms) {
      en = clean(en);
      return client().then(function (c) {
        return c.from('member_words').select('id,forms').ilike('en', en.replace(/[\\%_]/g, '\\$&')).then(function (r) {
          if (r.error) throw r.error;
          var row = (r.data || []).filter(function (x) { return true; })[0];
          if (row) { var merged = Object.assign({}, row.forms || {}, forms); return c.from('member_words').update({ forms: merged }).eq('id', row.id).select('id,en,forms').single(); }
          return c.from('member_words').insert({ en: en, forms: forms }).select('id,en,forms').single();
        });
      }).then(function (r) { if (r.error) throw r.error; return r.data; });
    },
    del: function (id) { return client().then(function (c) { return c.from('member_words').delete().eq('id', id); }).then(function (r) { if (r.error) throw r.error; return true; }); }
  };

  window.OphanimMember = {
    ready: init,
    user: function () { return me; },
    handle: function () { return hnd; },
    email: function () { return me && me.email || ''; },
    onchange: function (f) { if (typeof f === 'function') subs.push(f); },
    signUp: function (email, pw) {
      email = clean(email);
      if (!okMail(email)) return Promise.resolve({ ok: false, error: 'That does not look like a valid email address.' });
      if (String(pw || '').length < 8) return Promise.resolve({ ok: false, error: 'Use at least 8 characters for the password.' });
      return client().then(function (c) { return c.auth.signUp({ email: email, password: pw, options: { emailRedirectTo: back() } }); }).then(function (r) {
        if (r.error) return { ok: false, error: say(r.error) };
        var u = r.data && r.data.user;
        if (u && u.identities && u.identities.length === 0) return { ok: false, error: say('already registered') };
        return { ok: true, needsConfirm: !(r.data && r.data.session) };
      }, function (e) { return { ok: false, error: say(e) }; });
    },
    signIn: function (email, pw) {
      email = clean(email);
      if (!okMail(email)) return Promise.resolve({ ok: false, error: 'That does not look like a valid email address.' });
      return client().then(function (c) { return c.auth.signInWithPassword({ email: email, password: pw || '' }); }).then(function (r) {
        if (r.error) return { ok: false, error: say(r.error) };
        return apply(r.data && r.data.user).then(function () { return { ok: true }; });
      }, function (e) { return { ok: false, error: say(e) }; });
    },
    signOut: function () {
      return client().then(function (c) { return c.auth.signOut(); }).then(function () { me = null; hnd = null; fire(); return true; }, function () { me = null; hnd = null; fire(); return true; });
    },
    reset: function (email) {
      email = clean(email);
      if (!okMail(email)) return Promise.resolve({ ok: false, error: 'That does not look like a valid email address.' });
      return client().then(function (c) { return c.auth.resetPasswordForEmail(email, { redirectTo: back() }); }).then(function (r) { return r.error ? { ok: false, error: say(r.error) } : { ok: true }; }, function (e) { return { ok: false, error: say(e) }; });
    },
    setPassword: function (pw) {
      if (String(pw || '').length < 8) return Promise.resolve({ ok: false, error: 'Use at least 8 characters for the password.' });
      return client().then(function (c) { return c.auth.updateUser({ password: pw }); }).then(function (r) { return r.error ? { ok: false, error: say(r.error) } : { ok: true }; }, function (e) { return { ok: false, error: say(e) }; });
    },
    setHandle: function (raw) {
      var n = clean(raw);
      if (!validHandle(n)) return Promise.resolve({ ok: false, error: 'Use 2 to 24 letters, numbers, spaces, dots, dashes or underscores.' });
      if (!me) return Promise.resolve({ ok: false, error: 'Sign in first.' });
      return client().then(function (c) { return c.from('profiles').update({ handle: n }).eq('id', me.id).select('handle'); }).then(function (r) {
        if (r.error) return { ok: false, error: r.error.code === '23505' ? 'Somebody already uses that name.' : 'Could not save the name.' };
        if (!r.data || !r.data.length) return { ok: false, error: 'Could not save the name.' };
        hnd = r.data[0].handle; fire(); return { ok: true, handle: hnd };
      }, function (e) { return { ok: false, error: say(e) }; });
    },
    recovering: function () { return REC; },
    words: words
  };
  init();
})();
