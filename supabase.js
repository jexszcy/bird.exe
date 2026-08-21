// supabase.js — optional sync layer for bird.exe.
// Loads only when supabase-config.js has real values AND the Supabase
// CDN loaded; otherwise the game runs fully offline (localStorage only).
// Server is the source of truth for coins; writes queue in localStorage
// (`flappy-pending`) and flush FIFO, one in flight, retried on
// online/auth events. Equip ops coalesce (last wins per type).
(function () {
  'use strict';

  var cfg = window.SUPABASE_CONFIG;
  var hasSupabase = typeof window.supabase === 'object' && window.supabase !== null;
  var KEY = 'flappy-pending';
  var client = null;
  var busy = false;
  var status = 'offline';
  var userEmail = null;
  var pending = [];
  var suppressEquipEcho = false;
  try { pending = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { pending = []; }

  var $ = function (id) { return document.getElementById(id); };

  // Game globals (defined by game.js, which loads after this file): the
  // display funcs may not exist at boot, so guard every call.
  function refreshUI() {
    if (typeof updateCoinDisplays === 'function') updateCoinDisplays();
    if (typeof updateStartPreview === 'function') updateStartPreview();
    if (typeof updateSceneryPreview === 'function') updateSceneryPreview();
  }

  function setStatus(s) {
    status = s;
    var el = $('syncStatus');
    if (el) {
      el.textContent = s === 'offline' ? '☁ offline' :
        s === 'signedout' ? '☁ signed out' :
        s === 'syncing' ? '☁ syncing…' :
        (userEmail ? '☁ signed in as ' + userEmail : '☁ synced');
    }
    var box = $('authBox'), so = $('btnSignOut'), ub = $('userBox'), ue = $('userEmail');
    if (!box) return;
    if (s === 'offline') {
      box.style.display = 'none'; if (so) so.style.display = 'none';
      if (ub) ub.style.display = 'none';
    } else if (s === 'signedout') {
      box.style.display = 'block'; if (so) so.style.display = 'none';
      if (ub) ub.style.display = 'none';
    } else {
      box.style.display = 'none'; if (so) so.style.display = 'none';
      if (ub) ub.style.display = 'block';
      if (ue) ue.textContent = userEmail || '';
    }
  }

  // ── Offline queue ─────────────────────────────────────────────
  function savePending() { localStorage.setItem(KEY, JSON.stringify(pending)); }

  function enqueue(op) {
    if (op.type === 'equip') {
      pending = pending.filter(function (o) { return !(o.type === 'equip' && o.equipType === op.equipType); });
    }
    pending.push(op);
    savePending();
    flush();
  }

  // Apply whatever the RPC returned (shape-tolerant: single row, array,
  // or null). Only ever syncs server-side values back into the cache.
  function reconcile(res) {
    if (!res) return;
    var p = Array.isArray(res) ? res[0] : res;
    var apply = function (v, fn) { if (v !== undefined && v !== null && typeof fn === 'function') fn(v); };
    apply(p.coins, function (v) { totalCoins = v; storage.saveCoins(v); });
    apply(p.best_score, function (v) { bestScore = v; storage.saveBest(v); });
    // Equip fields intentionally NOT reconciled: RPC responses don't return
    // them, and re-asserting would stomp the user's in-session selection.
    refreshUI();
  }

  async function flush() {
    if (busy || !client || status === 'offline' || status === 'signedout') return;
    if (!pending.length) { setStatus('synced'); return; }
    var sess = (await client.auth.getSession()).data.session;
    if (!sess) { setStatus('signedout'); return; }
    busy = true;
    setStatus('syncing');
    var op = pending[0];
    try {
      if (op.type === 'run') {
        var run = await client.rpc('complete_run', { p_score: op.score, p_pickups: op.pickups });
        if (run.error) throw run.error;
        reconcile(run.data);
      } else if (op.type === 'purchase') {
        var buy = await client.rpc('purchase_item', { p_purchase_key: op.key, p_item_type: op.itemType, p_item_id: op.itemId });
        if (buy.error) throw buy.error;
        reconcile(buy.data);
      } else if (op.type === 'equip') {
        var col = op.equipType === 'bird' ? { equipped_bird: op.value } : { equipped_scenery: op.value };
        var up = await client.from('profiles').update(col).eq('user_id', sess.user.id);
        if (up.error) throw up.error;
      }
      pending.shift();      // success: drop the op
      savePending();
      busy = false;
      if (pending.length) flush(); else setStatus('synced');
    } catch (e) {
      // keep op in place; next flush (online/auth/next submit) retries it
      busy = false;
      setStatus('synced');
    }
  }

  // ── Auth ───────────────────────────────────────────────────────
  async function login(email, password) {
    var res = await client.auth.signInWithPassword({ email: email, password: password });
    if (res.error) throw new Error(res.error.message || 'Invalid credentials');
    location.reload(); // restart so the app boots with a session and fetches everything from Supabase
  }

  async function signup(email, password) {
    var res = await client.auth.signUp({ email: email, password: password });
    if (res.error) throw new Error(res.error.message || 'Signup failed');
    if (res.data.session) {
      location.reload(); // email confirmation disabled → restart with a session
    } else {
      // confirmation enabled (or already exists) - show a neutral message
      var el = $('authError');
      if (el) el.textContent = 'Account created. Check your email to confirm, then log in.';
    }
  }

  async function logout() {
    // Clear all local game data to prevent stale data on next login
    ['flappy-coins', 'flappy-best', 'flappy-owned', 'flappy-equipped',
     'flappy-scenery-owned', 'flappy-scenery-equipped', 'flappy-pending'
    ].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    pending = [];
    userEmail = null;
    var err = await client.auth.signOut();
    if (err.error) throw new Error('Sign out failed');
  }

  // Server is the ONLY source of truth when a session exists: fetch the
  // profile + owned items and write them back into the localStorage cache
  // so the game's synchronous storage reads get server data.
  // Union server-owned items with the local cache (dedupe, 'classic' always
  // present) so a restore never shrinks the player's owned set.
  function unionOwned(localArr, serverRows, itemType) {
    var out = localArr.slice();
    serverRows.forEach(function (o) {
      if (o.item_type === itemType && out.indexOf(o.item_id) === -1) out.push(o.item_id);
    });
    if (out.indexOf('classic') === -1) out.unshift('classic');
    return out;
  }

  async function restore() {
    try {
      var u = await client.auth.getUser();
      if (u.error || !u.data.user) { setStatus('signedout'); return false; }
      var prof = await client.from('profiles').select('*').eq('user_id', u.data.user.id).single();
      if (prof.error || !prof.data) throw prof.error || new Error('empty profile');
      var own = await client.from('owned_items').select('item_type,item_id').eq('user_id', u.data.user.id);
      if (own.error) throw own.error;
      var owned = own.data || [];
      // server wins → write into the local cache + game state. Only reached
      // when the fetches above succeeded, so failures keep local defaults.
      suppressEquipEcho = true;
      try {
        storage.saveCoins(prof.data.coins);
        storage.saveBest(prof.data.best_score);
        // Merge, don't replace: union server-owned with the local cache
        // (dedupe, 'classic' always present). An empty server list must
        // never wipe locally-owned items.
        storage.saveOwned(unionOwned(storage.owned(), owned, 'bird'));
        storage.saveSOwned(unionOwned(storage.sOwned(), owned, 'scenery'));
        // Local equip wins on the start screen. Only seed equip from the
        // server when the local value is missing/invalid; the equip queue
        // syncs server-side anyway.
        var eb = prof.data.equipped_bird, es = prof.data.equipped_scenery;
        if (eb && !storage.owned().includes(eb)) storage.saveEquipped(eb);
        if (es && !storage.sOwned().includes(es)) storage.saveSEquipped(es);
      } finally {
        suppressEquipEcho = false;
      }
      totalCoins = prof.data.coins || 0;   // game module-level lets
      bestScore = prof.data.best_score || 0;
      userEmail = u.data.user.email || u.data.user.id;
      setStatus('synced');
      refreshUI();
      return true;
    } catch (e) {
      setStatus('synced'); // degraded: keep local values, queue will retry
      return false;
    }
  }

  async function init(onRestored) {
    if (!cfg || !cfg.url || !cfg.anonKey || !hasSupabase) {
      setStatus('offline');
      if (onRestored) onRestored();
      return;
    }
    client = window.supabase.createClient(cfg.url, cfg.anonKey);
    var sess = await client.auth.getSession();
    if (sess.data.session) {
      await restore();
      if (onRestored) onRestored();
    } else {
      setStatus('signedout');
      if (onRestored) onRestored();
    }
    client.auth.onAuthStateChange(function (event) {
      if (event === 'SIGNED_IN') { restore(); flush(); }
      if (event === 'SIGNED_OUT') {
        // Clear all local game data to prevent stale data on next login
        ['flappy-coins', 'flappy-best', 'flappy-owned', 'flappy-equipped',
         'flappy-scenery-owned', 'flappy-scenery-equipped', 'flappy-pending'
        ].forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
        pending = [];
        userEmail = null;
        setStatus('signedout');
      }
    });
    window.addEventListener('online', flush);
  }

  // ── Game-facing API ────────────────────────────────────────────
  function submitRun(score, pickups) { enqueue({ type: 'run', score: score, pickups: pickups }); }
  var uid = function () { return crypto.randomUUID ? crypto.randomUUID() : Date.now() + '-' + Math.random().toString(36).slice(2); };
  function purchase(itemType, itemId) { enqueue({ type: 'purchase', key: uid(), itemType: itemType, itemId: itemId }); }

  // Top 10 by best_score with display_name
  async function fetchLeaderboard() {
    if (!client) throw new Error('offline');
    var sess = (await client.auth.getSession()).data.session;
    var rows = await client.from('profiles').select('user_id,best_score,display_name').order('best_score', { ascending: false }).limit(10);
    if (rows.error) throw rows.error;
    return {
      list: rows.data || [],
      currentUserId: sess ? sess.user.id : null,
    };
  }

  var debounceTimers = {};
  function onLocalChange(key, value) {
    if (key !== 'flappy-equipped' && key !== 'flappy-scenery-equipped') return;
    if (suppressEquipEcho) return;
    clearTimeout(debounceTimers[key]);
    debounceTimers[key] = setTimeout(function () {
      enqueue({ type: 'equip', equipType: key === 'flappy-equipped' ? 'bird' : 'scenery', value: value });
    }, 400);
  }

  // ── Login UI wiring ────────────────────────────────────────────
  function wireAuth() {
    var form = $('authForm'), email = $('authEmail'), password = $('authPassword');
    var submit = $('authSubmit'), toggle = $('authToggle'), errEl = $('authError');
    if (!form) return;
    var mode = 'login';
    toggle.onclick = function () {
      mode = mode === 'login' ? 'signup' : 'login';
      submit.textContent = mode === 'login' ? 'Log in' : 'Create account';
      toggle.textContent = mode === 'login' ? 'New here? Sign up' : 'Have an account? Log in';
      errEl.textContent = '';
    };
    form.onsubmit = async function (e) {
      e.preventDefault();
      errEl.textContent = '';
      submit.disabled = true;
      try {
        if (mode === 'login') await Sync.login(email.value, password.value);
        else await Sync.signup(email.value, password.value);
        password.value = '';
      } catch (err) { errEl.textContent = err.message || 'Something went wrong.'; }
      submit.disabled = false;
    };
    var so = $('btnSignOut');
    if (so) so.onclick = function () { Sync.logout(); };
    var lo = $('btnLogout');
    if (lo) lo.onclick = function () { Sync.logout(); };
  }

  window.Sync = {
    init: init, login: login, signup: signup, logout: logout,
    restore: restore, submitRun: submitRun, purchase: purchase, onLocalChange: onLocalChange,
    fetchLeaderboard: fetchLeaderboard,
    get status() { return status; },
  };
  wireAuth();
})();
