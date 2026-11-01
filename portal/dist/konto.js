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
const accName = () => ACC.user?.user_metadata?.first_name || (ACC.user?.email || '').replace(/@.*/, '');

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
/* Lernprofile auf diesem Gerät (mehrere Lernende an einem geteilten iPad, ohne Konto) */
const accProfilesHTML = () => {
  const p = typeof activeProfile === 'function' ? activeProfile() : null;
  return `<section class="acc-local"><h3>Lernprofil auf diesem Gerät</h3><p class="small muted">${p ? `Aktiv: <b>${esc(p.name)}</b>. ` : ''}Mehrere Profile helfen, wenn sich mehrere Lernende ein Gerät teilen. Mit Konto wird das aktive Profil gespeichert.</p><button class="button secondary" data-extra="profiles" data-close="acc-dialog">Profile verwalten, sichern oder wechseln</button></section>`;
};
const AUTH_PERKS = ['Lernstand auf allen Geräten', 'Stärken und Schwächen im Blick', 'Für Lehrkräfte: Klassensitzungen mit Live-Übersicht'];
let accSentTo = '';
const accMeta = () => ACC.user?.user_metadata || {};
const accFullName = () => [accMeta().first_name, accMeta().last_name].filter(Boolean).join(' ');
function accPwStrength(pw) {
  let n = 0;
  if (pw.length >= 8) n++;
  if (pw.length >= 12) n++;
  if (/[a-zäöüß]/.test(pw) && /[A-ZÄÖÜ]/.test(pw)) n++;
  if (/\d/.test(pw)) n++;
  if (/[^\wäöüßÄÖÜ]/.test(pw)) n++;
  return Math.min(4, n);
}
function showTheisAccountSb() {
  const d = accDialog();
  const close = '<button class="auth-x" data-close="acc-dialog" aria-label="Schließen">×</button>';
  const head = t => `<div class="dialog-head"><h2 id="acc-title">${t}</h2><button class="button secondary" data-close="acc-dialog">Schließen</button></div>`;
  d.classList.toggle('is-auth', !!sb && !ACC.user);
  if (!sb) {
    d.innerHTML = head('Dein daje-Konto') + '<p>Die Anmeldung ist gerade nicht erreichbar. Du kannst wie gewohnt ohne Konto üben; dein Lernstand bleibt auf diesem Gerät.</p><button class="button secondary" data-extra="export">Lernstand als Datei sichern</button>';
  } else if (ACC.user) {
    const at = ACC.lastSync || syncMeta().at;
    const md = accMeta();
    const ini = ((md.first_name || ACC.user.email).charAt(0) + (md.last_name || '').charAt(0)).toUpperCase();
    d.innerHTML =
      head('Dein daje-Konto') +
      `<div class="acc-card"><div class="set-avatar" aria-hidden="true">${esc(ini)}</div><div class="set-who"><b>${esc(accFullName() || accName())}</b><small>${esc(ACC.user.email)}${md.role === 'teach' ? ' · Lehrkraft' : ''}</small></div>${ACC.admin ? '<span class="chip-solid">Administrator</span>' : ''}</div>
      <p class="acc-sync">${ACC.error ? esc(ACC.error) : ACC.syncing ? 'Wird gespeichert …' : at ? 'Lernstand gespeichert ✓ ' + new Date(at).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' }) : 'Lernstand wird gespeichert.'}</p>
      <div class="acc-actions"><button class="button primary" data-acc="sync">Jetzt speichern</button><button class="button secondary" data-nav="fortschritt" data-close="acc-dialog">Stärken und Schwächen</button>${isTeacher() ? '<button class="button secondary" data-nav="klassen" data-close="acc-dialog">Meine Klassensitzungen</button>' : ''}</div>
      <details class="acc-more"><summary>Name ändern</summary>
        <form id="acc-name-form" class="auth-grid2" novalidate><label class="field">Vorname<input id="acc-first" autocomplete="given-name" maxlength="40" value="${esc(md.first_name || '')}" required></label><label class="field">Nachname<input id="acc-last" autocomplete="family-name" maxlength="60" value="${esc(md.last_name || '')}" required></label><button class="button secondary" type="submit">Speichern</button></form>
      </details>
      <details class="acc-more"><summary>Abmelden</summary>
        <label class="dlg-check"><input type="checkbox" id="acc-wipe"><span>Lernstand von diesem Gerät entfernen (z. B. auf einem geteilten iPad)</span></label>
        <button class="button secondary" data-acc="logout">Abmelden</button>
        <p class="small muted">Lernstand im Konto löschen: <button class="quiet danger" data-acc="delete-progress">Gespeicherten Lernstand löschen</button></p>
      </details>${accProfilesHTML()}`;
  } else if (accMode === 'sent') {
    d.innerHTML = `<div class="auth auth-done">${close}<div class="auth-mail" aria-hidden="true"><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="11" width="36" height="26" rx="5"/><path d="m8 14 16 12 16-12"/></svg></div>
      <h2 id="acc-title">Fast geschafft!</h2><p>Wir haben dir eine E-Mail an <b>${esc(accSentTo)}</b> geschickt. Tippe auf <b>„E-Mail bestätigen“</b>, dann ist dein Konto bereit.</p>
      <p class="small muted">Nichts angekommen? Schau im Spam-Ordner nach oder lass dir die E-Mail noch einmal schicken.</p>
      <div class="auth-done-act"><button class="button secondary" data-acc="resend">E-Mail erneut senden</button><button class="button primary" data-acc-mode="login">Zur Anmeldung</button></div><p class="small" id="acc-msg" role="status"></p></div>`;
  } else {
    const reg = accMode === 'register';
    const reset = accMode === 'reset';
    const newpw = accMode === 'newpw';
    const title = newpw ? 'Neues Passwort' : reset ? 'Passwort vergessen?' : reg ? 'Konto erstellen' : 'Willkommen zurück';
    const sub = newpw ? 'Lege ein neues Passwort für dein Konto fest.' : reset ? 'Gib deine E-Mail-Adresse ein. Wir schicken dir einen Link zum Zurücksetzen.' : reg ? 'Kostenlos. Üben geht auch ohne Konto.' : 'Melde dich an, um deinen Lernstand zu speichern.';
    d.innerHTML = `<div class="auth">${close}
      <aside class="auth-side"><div class="auth-brand">${DAJE_MARK}<span>daje</span></div><h3>Sprachen lernen.<br>Auf allen Geräten.</h3><ul>${AUTH_PERKS.map(t => `<li>${esc(t)}</li>`).join('')}</ul><p class="auth-side-foot">Server in der EU · kein Tracking · jederzeit löschbar</p></aside>
      <div class="auth-main">
        ${newpw || reset ? '' : `<div class="auth-tabs" role="tablist"><button role="tab" aria-selected="${!reg}" data-acc-mode="login">Anmelden</button><button role="tab" aria-selected="${reg}" data-acc-mode="register">Registrieren</button></div>`}
        <h2 id="acc-title">${title}</h2><p class="auth-sub">${sub}</p>
        <form id="acc-form" class="acc-form" novalidate>
          ${reg ? '<div class="auth-grid2"><label class="field">Vorname<input id="acc-first" autocomplete="given-name" maxlength="40" required></label><label class="field">Nachname<input id="acc-last" autocomplete="family-name" maxlength="60" required></label></div>' : ''}
          ${newpw ? '' : '<label class="field">E-Mail-Adresse<input id="acc-mail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" required></label>'}
          ${reset ? '' : `<label class="field">${newpw ? 'Neues Passwort' : 'Passwort'}<span class="auth-pw"><input id="acc-pw" type="password" autocomplete="${reg || newpw ? 'new-password' : 'current-password'}" minlength="8" required><button type="button" class="auth-eye" data-acc="eye" aria-label="Passwort zeigen">Zeigen</button></span></label>`}
          ${reg || newpw ? '<div class="auth-meter" aria-hidden="true"><i></i><i></i><i></i><i></i></div><p class="small muted auth-hint" id="acc-pw-hint">Mindestens 8 Zeichen. Länger ist sicherer.</p>' : ''}
          ${reg ? `<fieldset class="auth-role"><legend>Ich nutze daje als</legend><label><input type="radio" name="acc-role" value="learn" checked><span>Lernende*r</span></label><label><input type="radio" name="acc-role" value="teach"><span>Lehrkraft</span></label></fieldset>
            <label class="dlg-check auth-consent"><input type="checkbox" id="acc-consent"><span>Ich bin einverstanden, dass daje Name, E-Mail-Adresse und Lernstand speichert, damit ich auf allen Geräten weiterüben kann. Löschen ist jederzeit möglich.</span></label>` : ''}
          <button class="button primary large auth-submit" type="submit">${newpw ? 'Passwort speichern' : reset ? 'Link senden' : reg ? 'Konto erstellen' : 'Anmelden'}</button>
          <p class="small" id="acc-msg" role="status"></p>
        </form>
        ${newpw ? '' : `<div class="acc-links">${reg ? '' : reset ? '<button class="quiet" data-acc-mode="login">Zurück zur Anmeldung</button>' : '<button class="quiet" data-acc-mode="reset">Passwort vergessen?</button>'}</div>`}
        ${newpw || reg ? '' : accProfilesHTML()}
      </div></div>`;
  }
  if (!d.open) d.showModal();
}
async function accSubmit() {
  const msg = $('acc-msg');
  const mail = $('acc-mail')?.value.trim();
  const pw = $('acc-pw')?.value || '';
  const redirectTo = location.origin + location.pathname;
  try {
    if (accMode === 'register') {
      const first = $('acc-first').value.trim(), last = $('acc-last').value.trim();
      if (!first || !last) throw new Error('Bitte Vor- und Nachnamen eintragen.');
    }
    if (accMode !== 'newpw' && !/^\S+@\S+\.\S+$/.test(mail || '')) throw new Error('Bitte eine gültige E-Mail-Adresse eingeben.');
    if (accMode !== 'reset' && pw.length < 8) throw new Error('Das Passwort braucht mindestens 8 Zeichen.');
    if (accMode === 'register' && !$('acc-consent').checked) throw new Error('Bitte bestätige, dass deine Angaben gespeichert werden dürfen.');
    msg.textContent = 'Einen Moment …';
    if (accMode === 'register') {
      const first = $('acc-first').value.trim(), last = $('acc-last').value.trim();
      const role = document.querySelector('input[name="acc-role"]:checked')?.value || 'learn';
      const lang = (typeof uiLocale === 'string' ? uiLocale : 'de').split('-')[0];
      const { data, error } = await sb.auth.signUp({
        email: mail,
        password: pw,
        options: { emailRedirectTo: redirectTo, data: { first_name: first, last_name: last, full_name: first + ' ' + last, role, lang } }
      });
      if (error) throw error;
      // Supabase meldet bei schon registrierter Adresse keinen Fehler, aber ohne Identitäten
      if (data.user && Array.isArray(data.user.identities) && !data.user.identities.length) throw new Error('already registered');
      if (data.session) {
        $('acc-dialog')?.close();
        toast('Willkommen bei daje, ' + first + '!');
      } else {
        accSentTo = mail;
        accMode = 'sent';
        showTheisAccountSb();
      }
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
          : /rate limit|too many/i.test(m)
            ? 'Gerade zu viele Versuche. Bitte in ein paar Minuten noch einmal.'
            : /Failed to fetch|NetworkError/i.test(m)
              ? 'Keine Verbindung. Bitte später noch einmal versuchen.'
              : m;
  }
}
async function accAfterLogin(user) {
  ACC.user = user;
  if (user.user_metadata?.role === 'teach' && !read('daje-lehrkraft-ok', false)) {
    save('daje-lehrkraft-ok', true);
    if (typeof setPortalAudience === 'function') setPortalAudience('teach');
  }
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
document.addEventListener('input', e => {
  if (e.target.id !== 'acc-pw' || !document.querySelector('.auth-meter')) return;
  const n = accPwStrength(e.target.value);
  document.querySelector('.auth-meter').dataset.n = e.target.value ? n : 0;
  $('acc-pw-hint').textContent = !e.target.value ? 'Mindestens 8 Zeichen. Länger ist sicherer.' : e.target.value.length < 8 ? 'Noch ' + (8 - e.target.value.length) + ' Zeichen.' : ['Schwach', 'Schwach', 'In Ordnung', 'Gut', 'Sehr gut'][n] + '.';
});
document.addEventListener('submit', async e => {
  if (e.target.id !== 'acc-name-form') return;
  e.preventDefault();
  const first = $('acc-first').value.trim(), last = $('acc-last').value.trim();
  if (!first || !last) return toast('Bitte Vor- und Nachnamen eintragen.');
  const { data, error } = await sb.auth.updateUser({ data: { first_name: first, last_name: last, full_name: first + ' ' + last } });
  if (error) return toast('Nicht gespeichert: ' + error.message);
  ACC.user = data.user;
  accRefresh();
  showTheisAccountSb();
  toast('Name gespeichert.');
});
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
  if (a === 'eye') {
    const f = $('acc-pw');
    const show = f.type === 'password';
    f.type = show ? 'text' : 'password';
    b.textContent = show ? 'Verbergen' : 'Zeigen';
    return;
  }
  if (a === 'resend') {
    const msg = $('acc-msg');
    b.disabled = true;
    const { error } = await sb.auth.resend({ type: 'signup', email: accSentTo, options: { emailRedirectTo: location.origin + location.pathname } });
    msg.textContent = error ? (/rate|seconds/i.test(error.message) ? 'Bitte kurz warten und dann noch einmal versuchen.' : error.message) : 'Neue E-Mail ist unterwegs.';
    setTimeout(() => (b.disabled = false), 30000);
    return;
  }
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
