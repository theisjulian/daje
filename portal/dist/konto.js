'use strict';
/*
 * daje-Konto (optional) über Supabase: Üben geht immer ohne Konto. Mit Konto
 *  - wird der Lernstand gespeichert und auf allen Geräten abgeglichen (Tabelle daje_progress),
 *  - können Lehrkräfte Klassensitzungen mit kurzem Link anlegen und den Stand sehen (klasse.js),
 *  - können Administratoren jede Übung sofort für alle bearbeiten oder entfernen (Tabelle daje_overrides).
 * Datenbank: Supabase-Projekt „forza“, eigene Tabellen mit Präfix daje_ (Zugriffsregeln siehe UEBERGABE-OPUS.md).
 * Ohne Netz oder ohne Supabase-Bibliothek läuft alles wie bisher lokal weiter.
 */
const SB_URL = 'https://holpayuwppblpupcgulo.supabase.co';
const SB_KEY = 'sb_publishable_XTGeidk-j1CEWZT6cxpR2w_QVwoYAbo'; // öffentlicher Schlüssel (nur mit Zugriffsregeln nutzbar)
const ACC = { user: null, admin: false, syncing: false, lastSync: null, error: '' };
let sb = null;
try {
  if (window.supabase && !EMBED)
    sb = window.supabase.createClient(SB_URL, SB_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'daje-auth-v1' }
    });
} catch (e) {
  sb = null;
}
const accName = () => (ACC.user?.email || '').replace(/@.*/, '');

/* ---------- Lernstand abgleichen ---------- */
// Diese Einträge im Browser bilden den Lernstand (Profile, Karteikarten, eigene Übungen, Mappe, Trainer).
const SYNC_KEYS = ['sprachtrainer-profiles-v2', 'ecco-progress-v1', 'ripassa-editor-v1', 'daje-arbeitsblatt-v1', 'daje-geteilt-v1', 'daje-verben-fehler-v1', 'daje-zahlen-v1', 'daje-wuerfel-v1', 'daje-klasse-v1'];
const SYNC_META = 'daje-sync-v1';
const syncMeta = () => {
  try {
    return JSON.parse(localStorage.getItem(SYNC_META) || '{}') || {};
  } catch (e) {
    return {};
  }
};
const syncMetaSave = m => {
  try {
    Storage.prototype.setItem.call(localStorage, SYNC_META, JSON.stringify(m));
  } catch (e) {}
};
function syncSnapshot() {
  const data = {};
  SYNC_KEYS.forEach(k => {
    const v = localStorage.getItem(k);
    if (v !== null) data[k] = v;
  });
  return data;
}
const hasLocalProgress = () => {
  const d = syncSnapshot();
  return Object.keys(d).some(k => k !== 'daje-wuerfel-v1' && d[k] && d[k].length > 30);
};
/* Jede Änderung am Lernstand merken und kurz danach hochladen. */
{
  const set = Storage.prototype.setItem;
  let timer = null;
  Storage.prototype.setItem = function (k, v) {
    set.call(this, k, v);
    if (this === localStorage && SYNC_KEYS.includes(k) && ACC.user) {
      const m = syncMeta();
      if (!m.dirty) syncMetaSave({ ...m, dirty: true });
      clearTimeout(timer);
      timer = setTimeout(syncPush, 4000);
    }
  };
}
async function syncPush() {
  if (!sb || !ACC.user) return;
  const updated_at = new Date().toISOString();
  ACC.syncing = true;
  const { error } = await sb.from('daje_progress').upsert({ user_id: ACC.user.id, data: syncSnapshot(), updated_at });
  ACC.syncing = false;
  if (error) {
    ACC.error = 'Speichern im Konto gerade nicht möglich. Dein Lernstand bleibt auf diesem Gerät.';
    return accRefresh();
  }
  ACC.error = '';
  ACC.lastSync = updated_at;
  syncMetaSave({ user: ACC.user.id, at: updated_at, dirty: false });
  accRefresh();
}
function syncApply(data) {
  const set = Storage.prototype.setItem;
  SYNC_KEYS.forEach(k => {
    if (typeof data[k] === 'string') set.call(localStorage, k, data[k]);
    else localStorage.removeItem(k);
  });
}
/* Nach dem Anmelden: Konto und Gerät zusammenführen, ohne etwas ungefragt zu überschreiben. */
async function syncPull({ interactive = false } = {}) {
  if (!sb || !ACC.user) return;
  const { data: row, error } = await sb.from('daje_progress').select('data, updated_at').eq('user_id', ACC.user.id).maybeSingle();
  if (error) {
    ACC.error = 'Konto gerade nicht erreichbar. Du übst lokal weiter.';
    return accRefresh();
  }
  const m = syncMeta();
  const sameUser = m.user === ACC.user.id;
  if (!row) return syncPush(); // erstes Mal: dieses Gerät ins Konto
  const cloudNewer = !sameUser || !m.at || row.updated_at > m.at;
  if (!cloudNewer) {
    if (m.dirty) syncPush();
    return accRefresh();
  }
  const localChanged = sameUser ? !!m.dirty : hasLocalProgress();
  if (!localChanged) {
    syncApply(row.data || {});
    syncMetaSave({ user: ACC.user.id, at: row.updated_at, dirty: false });
    location.reload();
    return;
  }
  // Beides hat sich geändert: nachfragen.
  syncChoose(row, interactive);
}
function syncChoose(row) {
  const d = accDialog();
  d.innerHTML = `<div class="dialog-head"><h2 id="acc-title">Welchen Lernstand behalten?</h2></div>
    <p>In deinem Konto liegt ein Lernstand von ${new Date(row.updated_at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}. Auf diesem Gerät gibt es auch einen.</p>
    <div class="acc-choice"><button class="button primary" data-acc="take-cloud">Lernstand aus dem Konto laden</button><small>ersetzt den Stand auf diesem Gerät</small></div>
    <div class="acc-choice"><button class="button secondary" data-acc="take-device">Diesen Geräte-Stand ins Konto übernehmen</button><small>ersetzt den Stand im Konto</small></div>`;
  d._row = row;
  if (!d.open) d.showModal();
}

/* ---------- Übungen bearbeiten (Administratoren): Überschreibungen für alle ---------- */
const OVR_CACHE = 'daje-overrides-cache-v1';
let ovrApplied = new Map();
function ovrApply(rows) {
  let changed = false;
  (rows || []).forEach(r => {
    const key = r.id + '|' + r.updated_at;
    if (ovrApplied.get(r.id) === key) return;
    ovrApplied.set(r.id, key);
    changed = true;
    const i = STOCK_PACKAGES.findIndex(x => x.id === r.id);
    const ri = STOCK_REMOVED.indexOf(r.id);
    if (r.removed) {
      if (ri < 0) STOCK_REMOVED.push(r.id);
      return;
    }
    if (ri >= 0) STOCK_REMOVED.splice(ri, 1);
    const v = TheisContent.validatePackage(r.payload);
    if (!v.ok) return;
    if (i >= 0) STOCK_PACKAGES[i] = v.value;
    else STOCK_PACKAGES.push(v.value);
  });
  return changed;
}
function ovrLoadCache() {
  try {
    ovrApply(JSON.parse(localStorage.getItem(OVR_CACHE) || '[]'));
  } catch (e) {}
}
async function ovrFetch() {
  if (!sb) return;
  const { data, error } = await sb.from('daje_overrides').select('id, kind, payload, removed, updated_at');
  if (error || !data) return;
  try {
    localStorage.setItem(OVR_CACHE, JSON.stringify(data));
  } catch (e) {}
  if (ovrApply(data)) accRerender();
}
/* Aktuelle Ansicht neu zeichnen, ohne Eingaben zu verlieren (Antworten liegen im Lernstand). */
function accRerender() {
  if (session || view === 'redaktion') return;
  if (view === 'hoeruebung' && currentLesson()) return renderListening();
  render();
}
async function ovrSave(pkg, removed = false) {
  const row = { id: pkg.id, kind: pkg.kind, payload: removed ? null : pkg, removed, updated_at: new Date().toISOString(), updated_by: ACC.user.id };
  const { error } = await sb.from('daje_overrides').upsert(row);
  if (error) throw new Error(error.message);
  ovrApply([row]);
  try {
    const list = JSON.parse(localStorage.getItem(OVR_CACHE) || '[]').filter(x => x.id !== row.id);
    list.push(row);
    localStorage.setItem(OVR_CACHE, JSON.stringify(list));
  } catch (e) {}
}
async function ovrReset(id) {
  const { error } = await sb.from('daje_overrides').delete().eq('id', id);
  if (error) throw new Error(error.message);
  try {
    localStorage.setItem(OVR_CACHE, JSON.stringify(JSON.parse(localStorage.getItem(OVR_CACHE) || '[]').filter(x => x.id !== id)));
  } catch (e) {}
  location.reload();
}
const ovrHas = id => ovrApplied.has(id);
/* Im Editor: „Sofort für alle speichern“ (nur Administratoren, angemeldet) */
{
  const baseForm = editorFormHTML;
  editorFormHTML = function (item) {
    const html = baseForm(item);
    if (!ACC.admin) return html;
    const id = edId(item);
    return (
      `<section class="publish-box sb-live ed-box" id="sb-live"><h3>Für alle veröffentlichen</h3>
      <p class="small muted">Du bist als Administrator angemeldet. Änderungen gelten sofort für alle, ohne neuen Seiten-Build.</p>
      <div class="ki-actions"><button class="button primary" type="button" data-sb-live="save">Sofort für alle speichern</button>${liveIsPublic(id) || ovrHas(id) ? '<button class="button secondary danger" type="button" data-sb-live="remove">Für alle entfernen</button>' : ''}${ovrHas(id) ? '<button class="quiet" type="button" data-sb-live="reset">Zur ursprünglichen Fassung zurück</button>' : ''}</div>
      <p class="small" id="sb-live-msg" role="status"></p></section>` + html
    );
  };
}
async function sbLive(action) {
  const msg = $('sb-live-msg');
  const item = edItem();
  if (!item || !ACC.admin) return;
  try {
    if (action === 'reset') {
      if (!confirm('Die bearbeitete Fassung verwerfen und wieder die ursprüngliche zeigen?')) return;
      return ovrReset(edId(item));
    }
    if (action === 'remove') {
      const x = item.payload || item.draft;
      if (!confirm('„' + x.title + '“ für alle aus dem Katalog nehmen? Deine Fassung in der Redaktion bleibt.')) return;
      msg.textContent = 'Wird entfernt …';
      await ovrSave(x, true);
      msg.textContent = 'Entfernt ✓ Die Übung ist für alle aus dem Katalog verschwunden.';
      return;
    }
    const v = edCommit();
    if (!v.ok) return (msg.textContent = 'Die Übung ist noch nicht fertig: Bitte die Punkte oben unter „noch offen“ ergänzen.');
    if (item.payload.grammar?.origin === 'original') return (msg.textContent = 'Unverändert übernommene Buchübungen und fremde Texte bleiben privat.');
    msg.textContent = 'Wird gespeichert …';
    await ovrSave(item.payload);
    if (item.status !== 'published') {
      item.status = 'published';
      saveEditorState();
    }
    msg.textContent = 'Gespeichert ✓ Alle sehen jetzt diese Fassung.';
  } catch (e) {
    msg.textContent = 'Nicht gespeichert: ' + e.message;
  }
}
/* Bearbeiten-Knopf bei jeder Übung (Administratoren), auch in der Ansicht für Lernende. */
{
  const baseListen = renderListening;
  renderListening = function () {
    const r = baseListen.apply(this, arguments);
    const x = currentLesson();
    if (ACC.admin && x && !/^wf-/.test(x.id) && !isTeacher()) {
      document.querySelector('.lesson-head')?.insertAdjacentHTML('beforeend', `<button class="button secondary acc-edit" data-live-edit="${esc(x.id)}">Bearbeiten</button>`);
    }
    return r;
  };
}

/* ---------- Anmelden, Registrieren, Konto ---------- */
function accDialog() {
  let d = $('acc-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'acc-dialog';
    d.className = 'acc-dialog';
    d.setAttribute('aria-labelledby', 'acc-title');
    document.body.append(d);
  }
  return d;
}
let accMode = 'login';
function showTheisAccountSb() {
  const d = accDialog();
  const head = t => `<div class="dialog-head"><h2 id="acc-title">${t}</h2><button class="button secondary" data-close="acc-dialog">Schließen</button></div>`;
  if (!sb) {
    d.innerHTML = head('Dein daje-Konto') + '<p>Die Anmeldung ist gerade nicht erreichbar. Du kannst wie gewohnt ohne Konto üben; dein Lernstand bleibt auf diesem Gerät.</p><button class="button secondary" data-extra="export">Lernstand als Datei sichern</button>';
  } else if (ACC.user) {
    const at = ACC.lastSync || syncMeta().at;
    d.innerHTML =
      head('Dein daje-Konto') +
      `<p class="acc-who"><b>${esc(ACC.user.email)}</b>${ACC.admin ? '<span class="chip-solid">Administrator</span>' : ''}</p>
      <p class="acc-sync">${ACC.error ? esc(ACC.error) : ACC.syncing ? 'Wird gespeichert …' : at ? 'Lernstand gespeichert ✓ ' + new Date(at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'Lernstand wird gespeichert.'}</p>
      <div class="acc-actions"><button class="button primary" data-acc="sync">Jetzt speichern</button><button class="button secondary" data-nav="fortschritt" data-close="acc-dialog">Stärken und Schwächen</button>${isTeacher() ? '<button class="button secondary" data-nav="klassen" data-close="acc-dialog">Meine Klassensitzungen</button>' : ''}</div>
      <details class="acc-more"><summary>Abmelden</summary>
        <label class="dlg-check"><input type="checkbox" id="acc-wipe"><span>Lernstand von diesem Gerät entfernen (z. B. auf einem geteilten iPad)</span></label>
        <button class="button secondary" data-acc="logout">Abmelden</button>
        <p class="small muted">Lernstand im Konto löschen: <button class="quiet danger" data-acc="delete-progress">Gespeicherten Lernstand löschen</button></p>
      </details>`;
  } else {
    const reg = accMode === 'register';
    const reset = accMode === 'reset';
    const newpw = accMode === 'newpw';
    d.innerHTML =
      head(newpw ? 'Neues Passwort' : reset ? 'Passwort vergessen' : reg ? 'Konto anlegen' : 'Anmelden') +
      `<p class="small muted">${newpw ? 'Lege ein neues Passwort fest.' : 'Üben geht auch ohne Konto. Mit Konto wird dein Lernstand gespeichert, du übst auf allen Geräten weiter und siehst deine Stärken und Schwächen. Lehrkräfte legen damit Klassensitzungen an.'}</p>
      <form id="acc-form" class="acc-form" novalidate>
        ${newpw ? '' : '<label class="field">E-Mail<input id="acc-mail" type="email" autocomplete="email" required></label>'}
        ${reset ? '' : `<label class="field">${newpw ? 'Neues Passwort' : 'Passwort'}<input id="acc-pw" type="password" autocomplete="${reg || newpw ? 'new-password' : 'current-password'}" minlength="8" required></label>`}
        ${reg ? '<p class="small muted">Mindestens 8 Zeichen. Du bekommst eine E-Mail zur Bestätigung.</p>' : ''}
        <button class="button primary" type="submit">${newpw ? 'Passwort speichern' : reset ? 'Link zum Zurücksetzen senden' : reg ? 'Konto anlegen' : 'Anmelden'}</button>
        <p class="small" id="acc-msg" role="status"></p>
      </form>
      ${newpw ? '' : `<div class="acc-links">${reg || reset ? '<button class="quiet" data-acc-mode="login">Ich habe schon ein Konto</button>' : '<button class="quiet" data-acc-mode="register">Neues Konto anlegen</button><button class="quiet" data-acc-mode="reset">Passwort vergessen?</button>'}</div>`}
      <p class="small muted acc-privacy">Gespeichert werden nur E-Mail-Adresse und Lernstand, auf Servern in der EU. Du kannst den Lernstand jederzeit löschen.</p>`;
  }
  if (!d.open) d.showModal();
}
async function accSubmit() {
  const msg = $('acc-msg');
  const mail = $('acc-mail')?.value.trim();
  const pw = $('acc-pw')?.value || '';
  const redirectTo = location.origin + location.pathname;
  try {
    if (accMode !== 'newpw' && !/^\S+@\S+\.\S+$/.test(mail || '')) throw new Error('Bitte eine gültige E-Mail-Adresse eingeben.');
    if (accMode !== 'reset' && pw.length < 8) throw new Error('Das Passwort braucht mindestens 8 Zeichen.');
    msg.textContent = 'Einen Moment …';
    if (accMode === 'register') {
      const { data, error } = await sb.auth.signUp({ email: mail, password: pw, options: { emailRedirectTo: redirectTo } });
      if (error) throw error;
      msg.textContent = data.session ? 'Konto angelegt ✓' : 'Fast geschafft: Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben. Danach anmelden.';
    } else if (accMode === 'reset') {
      const { error } = await sb.auth.resetPasswordForEmail(mail, { redirectTo });
      if (error) throw error;
      msg.textContent = 'Wenn es ein Konto mit dieser Adresse gibt, kommt gleich eine E-Mail mit einem Link.';
    } else if (accMode === 'newpw') {
      const { error } = await sb.auth.updateUser({ password: pw });
      if (error) throw error;
      accMode = 'login';
      toast('Neues Passwort gespeichert.');
      showTheisAccountSb();
    } else {
      const { error } = await sb.auth.signInWithPassword({ email: mail, password: pw });
      if (error) throw error;
      $('acc-dialog')?.close();
      toast('Angemeldet. Dein Lernstand wird gespeichert.');
    }
  } catch (e) {
    const m = String(e.message || e);
    msg.textContent = /Invalid login/i.test(m)
      ? 'E-Mail oder Passwort stimmen nicht.'
      : /Email not confirmed/i.test(m)
        ? 'Bitte zuerst die E-Mail-Adresse über den Link in der Bestätigungs-E-Mail bestätigen.'
        : /already registered/i.test(m)
          ? 'Für diese Adresse gibt es schon ein Konto. Bitte anmelden.'
          : /Failed to fetch|NetworkError/i.test(m)
            ? 'Keine Verbindung. Bitte später noch einmal versuchen.'
            : m;
  }
}
async function accAfterLogin(user) {
  ACC.user = user;
  ACC.admin = false;
  try {
    const { data } = await sb.rpc('daje_is_admin');
    ACC.admin = data === true;
  } catch (e) {}
  accRefresh();
  syncPull();
  accRerender();
}
/* Kleiner Hinweis am Konto-Knopf: angemeldet bzw. Administrator */
function accRefresh() {
  document.documentElement.dataset.account = ACC.user ? (ACC.admin ? 'admin' : 'user') : '';
  // Konto-Knopf in der Kopfzeile (neben Lernprofil, Teilen, Darstellung)
  let btn = $('acc-open');
  const actions = document.querySelector('.top-actions');
  if (!btn && actions && sb) {
    btn = document.createElement('button');
    btn.id = 'acc-open';
    btn.className = 'button secondary top-btn acc-btn';
    btn.dataset.accOpen = '';
    actions.prepend(btn);
  }
  if (btn) {
    btn.innerHTML = icon('account') + `<span class="acc-label">${ACC.user ? esc(accName().slice(0, 14)) : 'Anmelden'}</span>`;
    btn.setAttribute('aria-label', ACC.user ? 'Dein Konto: ' + ACC.user.email : 'Anmelden (optional)');
    btn.classList.toggle('is-signed', !!ACC.user);
  }
  document.querySelectorAll('[data-portal="account"]').forEach(b => {
    b.classList.toggle('is-signed', !!ACC.user);
    b.title = ACC.user ? 'Angemeldet: ' + ACC.user.email : 'Anmelden (optional)';
  });
  if ($('acc-dialog')?.open && !$('acc-form')) showTheisAccountSb();
}
showTheisAccount = showTheisAccountSb;
document.addEventListener('submit', e => {
  if (e.target.id !== 'acc-form') return;
  e.preventDefault();
  accSubmit();
});
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-acc],[data-acc-mode],[data-sb-live],[data-acc-open]');
  if (!b) return;
  if (b.dataset.accOpen !== undefined) return showTheisAccountSb();
  if (b.dataset.accMode) {
    accMode = b.dataset.accMode;
    return showTheisAccountSb();
  }
  if (b.dataset.sbLive) return sbLive(b.dataset.sbLive);
  const a = b.dataset.acc;
  if (a === 'sync') return syncPush();
  if (a === 'logout') {
    const wipe = $('acc-wipe')?.checked;
    await syncPush();
    await sb.auth.signOut();
    if (wipe) {
      SYNC_KEYS.forEach(k => localStorage.removeItem(k));
      localStorage.removeItem(SYNC_META);
      location.reload();
    }
    return;
  }
  if (a === 'delete-progress') {
    if (!confirm('Den im Konto gespeicherten Lernstand löschen? Der Stand auf diesem Gerät bleibt.')) return;
    await sb.from('daje_progress').delete().eq('user_id', ACC.user.id);
    syncMetaSave({});
    toast('Gespeicherter Lernstand im Konto gelöscht.');
    return;
  }
  if (a === 'take-cloud') {
    const row = $('acc-dialog')._row;
    syncApply(row.data || {});
    syncMetaSave({ user: ACC.user.id, at: row.updated_at, dirty: false });
    location.reload();
  }
  if (a === 'take-device') {
    $('acc-dialog').close();
    syncPush();
  }
});

/* ---------- Start ---------- */
ovrLoadCache(); // vor dem ersten Aufbau: bearbeitete Übungen aus dem letzten Besuch
// Der Rest braucht die App-Helfer (app.js, später geladen): erst nach dem Laden aller Skripte.
addEventListener('DOMContentLoaded', () => {
if (sb) {
  sb.auth.onAuthStateChange((event, s) => {
    if (event === 'PASSWORD_RECOVERY') {
      accMode = 'newpw';
      setTimeout(showTheisAccountSb, 0);
    }
    const u = s?.user || null;
    if (u && ACC.user?.id !== u.id) setTimeout(() => accAfterLogin(u), 0);
    if (!u && ACC.user) {
      ACC.user = null;
      ACC.admin = false;
      accRefresh();
      accRerender();
    }
  });
  ovrFetch();
  // Beim Zurückkehren in den Tab: Änderungen anderer Geräte holen
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && ACC.user && !syncMeta().dirty) syncPull();
  });
}
accRefresh();
});

/* ---------- Stärken und Schwächen (Mein Fortschritt) ---------- */
/* Aus den eigenen Ergebnissen: je Grammatikthema der Anteil richtiger Antworten der zuletzt geprüften Übungen,
   Hörverstehen gesamt, Verben mit Fehlern. Beschreibt Ergebnisse, keine Note. */
function skillsData() {
  const L = portalProfile().listening || {};
  const topics = typeof grTopics === 'function' ? grTopics() : [];
  const gram = topics
    .map(t => {
      const rs = t.items.map(x => L[x.id]?.lastResult).filter(r => r && r.total);
      if (!rs.length) return null;
      const pc = Math.round((100 * rs.reduce((s, r) => s + r.correct / r.total, 0)) / rs.length);
      const open = t.items.filter(x => !L[x.id]?.lastResult);
      return { t, pc, n: rs.length, total: t.items.length, next: open[0] || t.items[0] };
    })
    .filter(Boolean);
  const listen = contentList('listening')
    .map(x => L[x.id]?.lastResult)
    .filter(r => r && r.total);
  const lpc = listen.length ? Math.round((100 * listen.reduce((s, r) => s + r.correct / r.total, 0)) / listen.length) : null;
  const verbs = typeof vbErr !== 'undefined' ? Object.entries(vbErr).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([v]) => v) : [];
  return {
    strong: gram.filter(g => g.pc >= 80).sort((a, b) => b.pc - a.pc),
    weak: gram.filter(g => g.pc < 60).sort((a, b) => a.pc - b.pc),
    middle: gram.filter(g => g.pc >= 60 && g.pc < 80),
    gram,
    lpc,
    lcount: listen.length,
    verbs
  };
}
function skillsHTML() {
  const d = skillsData();
  const row = g => `<li><span><b lang="it">${esc(g.t.title)}</b><small>${g.n} von ${g.total} Übungen geprüft · ${g.pc} % richtig</small></span><div class="skill-bar" aria-hidden="true"><i style="width:${g.pc}%"></i></div><button class="button secondary" data-lesson="${esc(g.next.id)}">Üben</button></li>`;
  const empty = !d.gram.length && !d.lcount && !d.verbs.length;
  return `<section class="panel glass skills"><div class="eyebrow">STÄRKEN UND SCHWÄCHEN</div><h2>${empty ? 'Dein Überblick wächst mit jeder Übung.' : 'Das kannst du schon, hier lohnt sich Üben.'}</h2>
    ${typeof ACC !== 'undefined' && ACC.user ? '<p class="small muted">Gespeichert in deinem Konto, auf allen Geräten gleich.</p>' : '<p class="small muted">Gespeichert auf diesem Gerät. Mit einem Konto (optional) auf allen Geräten: <button class="quiet" data-acc-open>Anmelden</button></p>'}
    ${empty ? '<p class="muted">Löse ein paar Grammatik- oder Hörübungen und prüfe sie. Danach siehst du hier, was schon sitzt und was du wiederholen solltest.</p>' : ''}
    ${d.weak.length ? `<h3>Noch üben</h3><ul class="skill-list weak">${d.weak.slice(0, 6).map(row).join('')}</ul>` : ''}
    ${d.middle.length ? `<h3>Auf gutem Weg</h3><ul class="skill-list mid">${d.middle.slice(0, 6).map(row).join('')}</ul>` : ''}
    ${d.strong.length ? `<h3>Sitzt schon</h3><ul class="skill-list strong">${d.strong.slice(0, 8).map(row).join('')}</ul>` : ''}
    ${d.lcount ? `<h3>Hörverstehen</h3><p>${plural(d.lcount, 'Hörübung', 'Hörübungen')} geprüft · im Schnitt ${d.lpc} % richtig erkannt.</p>` : ''}
    ${d.verbs.length ? `<h3>Verben, die noch haken</h3><p lang="it">${d.verbs.map(esc).join(', ')}</p><button class="button secondary" data-nav="verben">Verben üben</button>` : ''}
    <p class="small muted">Grundlage sind deine letzten Ergebnisse, keine Note.</p>
  </section>`;
}
{
  const baseProgress = progressV2;
  progressV2 = function () {
    const r = baseProgress.apply(this, arguments);
    const main = $('main');
    const anchor = main.querySelector('.progress-layout');
    if (anchor) anchor.insertAdjacentHTML('beforebegin', skillsHTML());
    else main.querySelector('.page, div')?.insertAdjacentHTML('beforeend', skillsHTML());
    return r;
  };
}
