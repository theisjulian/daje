'use strict';
/*
 * Klassenlink: Lehrkräfte geben die Unterrichtsmappe der Klasse frei.
 *  - Mit daje-Konto (konto.js): Die Sitzung liegt auf dem Server (Tabelle daje_lessons) und hat eine kurze,
 *    nicht erratbare Kennung (?k=…). Der QR-Code bleibt klein, auch mit vielen und eigenen Übungen.
 *    Lernende geben beim Öffnen ihren Namen ein; ihr Stand geht an die Lehrkraft (Übersicht „Klassensitzungen“).
 *  - Ohne Konto: Link ohne Namen und ohne Übersicht (Titel und Übungskennungen im Link, ?aufgabe=…).
 * Frühere Links (?aufgabe=…) funktionieren weiter. Die Hausaufgaben-Funktion gibt es nicht mehr.
 */
const HW_INBOX = 'daje-aufgaben-v1';
const KL_KEY = 'daje-klasse-v1';
let hwCurrent = null; // Link ohne Konto: { code, t, i }
let klCur = null; // Klassensitzung der Lernenden: { code, title, items, language, participant, secret, name }
let klTeach = null; // geöffnete Sitzung in der Übersicht der Lehrkraft (Kennung)
let klActive = null; // Aufgabe aus der Liste geöffnet: „Nächste Aufgabe“ nach der Korrektur

/* ---------- Link ohne Konto ---------- */
function hwEncode(a) {
  const bytes = new TextEncoder().encode(JSON.stringify(a));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function hwDecode(code) {
  try {
    const bin = atob(String(code).replace(/-/g, '+').replace(/_/g, '/'));
    const j = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
    if (!j || !Array.isArray(j.i)) return null;
    const items = j.i.filter(k => typeof k === 'string' && /^[lvg]:[\w.-]{1,120}$/.test(k)).slice(0, 40);
    return items.length ? { code, t: String(j.t || '').slice(0, 120), i: items } : null;
  } catch {
    return null;
  }
}
function hwURL(a) {
  const u = new URL(location.href);
  u.search = '';
  u.hash = '';
  u.searchParams.set('aufgabe', hwEncode({ t: a.title || a.t, i: a.items || a.i }));
  return u.href;
}
function hwResolve(key) {
  const kind = key[0] === 'l' ? 'listening' : key[0] === 'g' ? 'grammar' : 'vocabulary';
  const x = kind === 'vocabulary' ? contentList('vocabulary').find(y => y.id === key.slice(2)) : findTask(key.slice(2));
  return x ? { key, kind, x } : null;
}
const HW_KIND = { listening: 'Hörübung', grammar: 'Grammatik', vocabulary: 'Wortliste' };
function hwDone(r) {
  if (r.kind === 'listening' || r.kind === 'grammar') return lessonStatus(r.x).done;
  const seen = r.x.entries.filter(w => records[r.x.id + '-' + w.id]).length;
  return seen >= Math.ceil(r.x.entries.length * 0.8);
}
/* Eigene Übungen, die mit einem Link oder einer Sitzung kommen, wie „Mit Klasse teilen“ speichern. */
function klStorePackages(list) {
  const got = (Array.isArray(list) ? list : []).map(x => TheisContent.validatePackage(x)).filter(v => v.ok).map(v => v.value);
  if (!got.length) return;
  const ids = new Set(got.map(p => p.id));
  const keep = read('daje-geteilt-v1', []).filter(x => !ids.has(x.payload?.id));
  save('daje-geteilt-v1', [...got.map(p => ({ payload: p, at: new Date().toISOString() })), ...keep].slice(0, 60));
}
function hwInbox() {
  return read(HW_INBOX, []);
}
function hwReceive(a) {
  const list = hwInbox().filter(x => x.code !== a.code);
  list.unshift({ code: a.code, t: a.t, i: a.i, at: new Date().toISOString() });
  save(HW_INBOX, list.slice(0, 12));
}
const hwStatus = a => {
  const rows = a.i.map(hwResolve).filter(Boolean);
  return { rows, done: rows.filter(hwDone).length };
};
function hwShow(code) {
  const a = hwDecode(code);
  if (!a) return toast('Dieser Link ist unvollständig.');
  hwCurrent = a;
  klCur = null;
  nav('aufgabe');
}
/* Kompatibilität: Knöpfe „Zur Hausaufgabe“ gibt es nicht mehr; gesammelt wird in der Unterrichtsmappe. */
const hwButton = () => '';

/* ---------- Aufgabenliste (Lernende) ---------- */
function taskListHTML(rows, { title, name, extra = '' }) {
  const done = rows.filter(hwDone).length;
  return `<div class="page">
    <header class="page-head"><div class="eyebrow">${name ? 'Klassensitzung · ' + esc(name) : 'Aufgaben für die Stunde'}</div><h1>${esc(title || 'Deine Aufgaben')}</h1><p>${done} von ${rows.length} erledigt.</p>
    <div class="lcard-progress" aria-hidden="true"><i style="width:${rows.length ? Math.round((100 * done) / rows.length) : 0}%"></i></div></header>
    ${extra}
    <ol class="hw-tasks">${rows
      .map(r => {
        const ok = hwDone(r);
        const action =
          r.kind !== 'vocabulary'
            ? `<button class="button ${ok ? 'secondary' : 'primary'}" data-lesson="${esc(r.x.id)}">${ok ? 'Noch einmal' : r.kind === 'grammar' ? 'Üben' : 'Anhören'}</button>`
            : `<button class="button ${ok ? 'secondary' : 'primary'}" data-vocab-set="${esc(r.x.id)}">${ok ? 'Wiederholen' : 'Üben'}</button>`;
        return `<li class="${ok ? 'is-done' : ''}"><span class="hw-check" aria-hidden="true">${ok ? '✓' : ''}</span><span class="hw-text"><b>${esc(r.x.title)}</b><small><span>${HW_KIND[r.kind]}</span> · ${esc(portalLang(r.x.language))} · ${esc(r.x.level)}${ok ? ' · <span>erledigt</span>' : ''}</small></span>${action}</li>`;
      })
      .join('')}</ol>
  </div>`;
}
function hwPage() {
  const a = hwCurrent;
  if (!a) return nav('start');
  $('breadcrumb').textContent = 'Aufgaben';
  const { rows } = hwStatus(a);
  $('main').innerHTML = taskListHTML(rows, { title: a.t, extra: rows.length < a.i.length ? '<p class="muted">Einige Inhalte gibt es in dieser Version nicht mehr.</p>' : '' });
}

/* ---------- Klassensitzung (Lernende) ---------- */
const klStore = () => read(KL_KEY, { sessions: {} });
const klSaveStore = s => save(KL_KEY, s);
async function klOpen(code) {
  code = String(code || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20);
  $('breadcrumb').textContent = 'Klassensitzung';
  const mine = klStore().sessions[code];
  $('main').innerHTML = '<div class="page"><p class="muted">Sitzung wird geladen …</p></div>';
  let lesson = null;
  try {
    if (!sb) throw new Error('offline');
    const { data, error } = await sb.rpc('daje_lesson_get', { p_code: code });
    if (error) throw error;
    lesson = data;
  } catch (e) {
    if (mine) lesson = { title: mine.title, items: mine.items, language: mine.language, offline: true };
  }
  if (!lesson) {
    $('main').innerHTML = `<div class="page"><header class="page-head"><div class="eyebrow">Klassensitzung</div><h1>Sitzung nicht gefunden.</h1><p>Der Link ist abgelaufen, beendet oder es gibt gerade keine Internetverbindung. Frag deine Lehrkraft nach einem neuen Link.</p></header><button class="button secondary" data-nav="start">Zur Startseite</button></div>`;
    return;
  }
  klStorePackages(lesson.packages);
  klCur = { code, title: lesson.title, items: lesson.items || [], language: lesson.language, ...(mine || {}) };
  hwCurrent = null;
  view = 'klasse';
  klPage();
}
function klPage() {
  if (!klCur) return nav('start');
  $('breadcrumb').textContent = 'Klassensitzung';
  if (!klCur.participant) {
    $('main').innerHTML = `<div class="page kl-join"><header class="page-head"><div class="eyebrow">Klassensitzung</div><h1>${esc(klCur.title || 'Aufgaben für die Stunde')}</h1><p><span>${plural(klCur.items.length, 'Aufgabe', 'Aufgaben')}${klCur.language ? ' · ' + esc(portalLang(klCur.language)) : ''}</span><br><span>Trag deinen Namen ein, damit deine Lehrkraft sieht, wie weit du bist.</span></p></header>
      <form id="kl-join" class="kl-form glass" novalidate>
        <label class="field">Dein Name<input id="kl-first" autocomplete="name" maxlength="40" required></label>
        <button class="button primary large" type="submit">Los geht’s</button>
        <p class="small muted">Gespeichert werden nur dein Name und deine Ergebnisse in dieser Sitzung, für deine Lehrkraft. Nach 30 Tagen ist die Sitzung abgelaufen.</p>
        <p class="small" id="kl-msg" role="status"></p>
      </form></div>`;
    return;
  }
  const rows = klCur.items.map(hwResolve).filter(Boolean);
  $('main').innerHTML = taskListHTML(rows, { title: klCur.title, name: klCur.name, extra: klCur.offline ? '<p class="muted small">Gerade keine Verbindung: Ergebnisse werden gesendet, sobald du wieder online bist.</p>' : '' });
}
async function klJoin() {
  const first = $('kl-first').value.trim().replace(/\s+/g, ' ');
  const msg = $('kl-msg');
  if (!first) return (msg.textContent = 'Bitte deinen Namen eintragen.');
  msg.textContent = 'Einen Moment …';
  try {
    const { data, error } = await sb.rpc('daje_lesson_join', { p_code: klCur.code, p_name: first });
    if (error) throw error;
    Object.assign(klCur, { participant: data.participant, secret: data.secret, name: data.name, reported: {} });
    const s = klStore();
    s.sessions[klCur.code] = { participant: data.participant, secret: data.secret, name: data.name, title: klCur.title, items: klCur.items, language: klCur.language, reported: {}, at: new Date().toISOString() };
    klSaveStore(s);
    klPage();
  } catch (e) {
    msg.textContent = /lesson_not_found/.test(e.message || '') ? 'Diese Sitzung ist beendet.' : /lesson_full/.test(e.message || '') ? 'Diese Sitzung ist voll.' : 'Keine Verbindung. Bitte noch einmal versuchen.';
  }
}
/* Ergebnis an die Lehrkraft melden (nach jeder Korrektur, und „begonnen“ beim ersten Öffnen). */
const klQueue = () => read('daje-klasse-queue-v1', []);
async function klReport(taskId, done) {
  if (!klCur?.participant || !klCur.items.some(k => k.slice(2) === taskId)) return;
  const x = findTask(taskId);
  if (!x) return;
  const st = portalProfile().listening[taskId] || {};
  const graded = x.questions.filter(GRADED);
  const per = {};
  graded.forEach(q => {
    per[q.id] = { ok: !!TheisContent.assessAnswer(q, st.answers?.[q.id]), a: String(st.answers?.[q.id] ?? '').slice(0, 300) };
  });
  const body = {
    p_participant: klCur.participant,
    p_secret: klCur.secret,
    p_task: taskId,
    p_correct: done ? st.lastResult?.correct || 0 : 0,
    p_total: graded.length,
    p_answers: done ? per : {},
    p_done: !!done
  };
  const send = async b => {
    const { error } = await sb.rpc('daje_lesson_report', b);
    if (error) throw error;
  };
  try {
    await send(body);
    // Nachholen, was offline nicht ging
    const q = klQueue();
    if (q.length) {
      save('daje-klasse-queue-v1', []);
      for (const b of q) await send(b).catch(() => {});
    }
  } catch (e) {
    save('daje-klasse-queue-v1', [...klQueue().filter(b => !(b.p_task === body.p_task && b.p_participant === body.p_participant)), body].slice(-60));
  }
}

/* ---------- Lehrkraft: Klassenlink aus der Unterrichtsmappe ---------- */
let klOverride = null; // { ids, title }: Klassenlink für eine feste Auswahl (z. B. CILS-Prüfung), Mappe bleibt unberührt
function klKeysFromSheet() {
  return (klOverride ? klOverride.ids : wsAll())
    .map(id => findTask(id))
    .filter(Boolean)
    .map(x => (x.kind === 'grammar' ? 'g:' : 'l:') + x.id)
    .slice(0, 40);
}
function klOwnPackages(keys) {
  return keys.map(k => editorState.items.find(i => edId(i) === k.slice(2))?.payload).filter(Boolean).concat(
    keys.map(k => sharedPackages().find(p => p.id === k.slice(2))).filter(Boolean)
  );
}
function klDialog() {
  let d = $('kl-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'kl-dialog';
    d.className = 'kl-dialog';
    d.setAttribute('aria-labelledby', 'kl-title');
    document.body.append(d);
  }
  return d;
}
function klLinkDialog(ids, title0) {
  klOverride = Array.isArray(ids) ? { ids, title: title0 } : null;
  const keys = klKeysFromSheet();
  if (!keys.length) return toast('Die Mappe ist noch leer.');
  const d = klDialog();
  const langs = [...new Set(keys.map(k => findTask(k.slice(2))?.language).filter(Boolean))];
  const title = klOverride?.title || wsDraft.title || 'Aufgaben für die Stunde';
  const head = `<div class="dialog-head"><h2 id="kl-title">Klassenlink</h2><button class="button secondary" data-close="kl-dialog">Schließen</button></div>
    <p><b>${esc(title)}</b> · ${plural(keys.length, 'Aufgabe', 'Aufgaben')} · ${langs.map(l => esc(portalLang(l))).join(', ')}${langs.length > 1 ? ' <span class="kl-warn">(mehrere Sprachen)</span>' : ''}</p>`;
  if (typeof ACC !== 'undefined' && ACC.user && sb) {
    d.innerHTML =
      head +
      `<p class="muted small">Lernende öffnen den Link oder scannen den QR-Code am iPad, tragen ihren Namen ein und arbeiten die Aufgaben ab. Du siehst in der Übersicht, wer wie weit ist. Die Sitzung läuft 30 Tage.</p>
      <div class="kl-actions"><button class="button primary large" data-kl="create">Sitzung starten</button></div><p class="small" id="kl-msg" role="status"></p>`;
  } else {
    const url = hwURL({ title, items: keys });
    const own = klOwnPackages(keys).length;
    d.innerHTML =
      head +
      `<div class="kl-login"><b>Mit Anmeldung:</b> kurzer QR-Code (auch mit vielen und eigenen Übungen), Namenseingabe und Übersicht, wer wie weit ist. <button class="button primary" data-acc-open>Anmelden</button></div>
      <h3>Ohne Anmeldung</h3><p class="muted small">Link ohne Namen und ohne Übersicht.${own ? ' Eigene Übungen sind darin nicht enthalten.' : ''}</p>
      ${url.length <= 1800 ? `<div class="qr-card hw-qr">${qrSVG(url, 'QR-Code zu den Aufgaben')}</div>` : '<p class="hw-long">Der Link ist für einen QR-Code zu lang. Melde dich an (kurzer QR-Code) oder teile den Link per AirDrop, Mail oder Lernplattform.</p>'}
      <div class="hw-actions"><button class="button secondary" data-qr-copy="${esc(url)}">Link kopieren</button></div>`;
  }
  if (!d.open) d.showModal();
}
async function klCreate() {
  const keys = klKeysFromSheet();
  const msg = $('kl-msg');
  msg.textContent = 'Sitzung wird angelegt …';
  const langs = [...new Set(keys.map(k => findTask(k.slice(2))?.language).filter(Boolean))];
  const { data, error } = await sb
    .from('daje_lessons')
    .insert({ title: klOverride?.title || wsDraft.title || 'Aufgaben für die Stunde', language: langs.length === 1 ? langs[0] : null, items: keys, packages: klOwnPackages(keys) })
    .select('code')
    .single();
  if (error) return (msg.textContent = 'Nicht angelegt: ' + (/Failed to fetch/i.test(error.message) ? 'keine Verbindung.' : error.message));
  // Direkt in die Übersicht; dort stehen QR-Code und Link für die Klasse
  $('kl-dialog')?.close();
  $('ws-dialog')?.close();
  klTeach = data.code;
  nav('sitzung');
}
const klLink = code => location.origin + location.pathname + '?k=' + code;
function klShowCode(code, title, n) {
  const d = klDialog();
  const url = klLink(code);
  d.innerHTML = `<div class="dialog-head"><h2 id="kl-title">Klassenlink</h2><button class="button secondary" data-close="kl-dialog">Schließen</button></div>
    <p><b>${esc(title)}</b> · ${plural(n, 'Aufgabe', 'Aufgaben')} · Code <b class="kl-code">${esc(code)}</b></p>
    <div class="qr-card hw-qr">${qrSVG(url, 'QR-Code zur Klassensitzung')}</div>
    <div class="hw-actions"><button class="button primary" data-kl-beamer="${esc(code)}">Groß zeigen (Beamer)</button><button class="button secondary" data-qr-copy="${esc(url)}">Link kopieren</button><button class="button secondary" data-kl-dash="${esc(code)}">Übersicht öffnen</button></div>`;
  if (!d.open) d.showModal();
}
function klBeamer(code) {
  const url = klLink(code);
  let d = $('hw-beamer');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'hw-beamer';
    d.className = 'hw-beamer';
    document.body.append(d);
  }
  d.innerHTML = `<div class="hw-beamer-in"><h2>Aufgaben für heute</h2><p>QR-Code mit dem iPad scannen · oder <b>${esc(location.host + location.pathname)}?k=${esc(code)}</b></p><div class="hw-beamer-qr">${qrSVG(url, 'QR-Code zur Klassensitzung')}</div><button class="button secondary" data-close="hw-beamer">Schließen</button></div>`;
  document.querySelectorAll('dialog[open]').forEach(x => x !== d && x.close());
  d.showModal();
}

/* ---------- Lehrkraft: Übersicht ---------- */
let klTimer = null;
async function klSessionsPage() {
  $('breadcrumb').textContent = 'Klassensitzungen';
  if (!sb || !ACC.user) {
    $('main').innerHTML = `<div class="page"><header class="page-head"><div class="eyebrow">Klassensitzungen</div><h1>Wer arbeitet woran?</h1><p>Mit einem daje-Konto startest du aus der Unterrichtsmappe Klassensitzungen und siehst hier den Stand deiner Klasse.</p></header><button class="button primary" data-acc-open>Anmelden</button></div>`;
    return;
  }
  $('main').innerHTML = '<div class="page"><p class="muted">Wird geladen …</p></div>';
  const { data, error } = await sb.from('daje_lessons').select('id, code, title, language, items, created_at, expires_at, closed, daje_participants(count)').order('created_at', { ascending: false }).limit(50);
  if (view !== 'klassen') return;
  if (error) {
    $('main').innerHTML = '<div class="page"><p>Gerade keine Verbindung zum Konto.</p></div>';
    return;
  }
  const now = Date.now();
  $('main').innerHTML = `<div class="page kl-page"><header class="page-head"><div class="eyebrow">Klassensitzungen</div><h1>Deine Sitzungen.</h1><p>Neue Sitzung: Übungen in die Unterrichtsmappe legen, dann „Klassenlink“.</p></header>
    <div class="kl-list">${
      data
        .map(l => {
          const n = l.daje_participants?.[0]?.count || 0;
          const off = l.closed || new Date(l.expires_at).getTime() < now;
          return `<article class="kl-row glass${off ? ' is-off' : ''}"><div><b>${esc(l.title || 'Sitzung')}</b><small>${new Date(l.created_at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })} · ${plural(l.items.length, 'Aufgabe', 'Aufgaben')} · ${plural(n, 'Person', 'Personen')}${off ? ' · beendet' : ''}</small></div><div class="kl-row-act"><button class="button primary" data-kl-dash="${esc(l.code)}">Übersicht</button>${off ? '' : `<button class="button secondary" data-kl-show="${esc(l.code)}" data-n="${l.items.length}" data-title="${esc(l.title)}">QR-Code</button>`}</div></article>`;
        })
        .join('') || '<p class="muted">Noch keine Sitzungen.</p>'
    }</div></div>`;
}
async function klDashPage() {
  clearTimeout(klTimer);
  const code = klTeach;
  $('breadcrumb').textContent = 'Klassensitzung · Übersicht';
  if (!sb || !ACC.user) return klSessionsPage();
  const { data: l, error } = await sb.from('daje_lessons').select('id, code, title, items, packages, expires_at, closed').eq('code', code).maybeSingle();
  if (view !== 'sitzung' || klTeach !== code) return;
  if (error || !l) {
    $('main').innerHTML = '<div class="page"><p>Sitzung nicht gefunden.</p><button class="button secondary" data-nav="klassen">Alle Sitzungen</button></div>';
    return;
  }
  klStorePackages(l.packages);
  const { data: ps } = await sb.from('daje_participants').select('id, name, joined_at, last_seen, daje_results(task_id, correct, total, done, answers, attempts, updated_at)').eq('lesson_id', l.id).order('name');
  if (view !== 'sitzung' || klTeach !== code) return;
  const tasks = l.items.map(k => ({ key: k, id: k.slice(2), x: findTask(k.slice(2)) }));
  const people = ps || [];
  const cell = (p, t) => {
    const r = (p.daje_results || []).find(z => z.task_id === t.id);
    if (!r) return '<td class="kl-c none">–</td>';
    if (!r.done) return '<td class="kl-c started" title="begonnen">…</td>';
    const pc = r.total ? Math.round((100 * r.correct) / r.total) : 0;
    return `<td class="kl-c ${pc >= 80 ? 'good' : pc >= 50 ? 'mid' : 'low'}" title="${r.attempts} Versuch(e)">${r.correct}/${r.total}</td>`;
  };
  const ago = t => {
    const m = Math.round((Date.now() - new Date(t).getTime()) / 60000);
    return m < 1 ? 'gerade eben' : m < 60 ? `vor ${m} Min.` : new Date(t).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' });
  };
  // Je Aufgabe: erledigt, Durchschnitt und die schwierigsten Teilaufgaben mit häufigen falschen Antworten
  const sum = tasks.map(t => {
    const rs = people.map(p => (p.daje_results || []).find(z => z.task_id === t.id)).filter(r => r && r.done);
    const avg = rs.length ? Math.round((100 * rs.reduce((s, r) => s + (r.total ? r.correct / r.total : 0), 0)) / rs.length) : null;
    const qs = {};
    rs.forEach(r =>
      Object.entries(r.answers || {}).forEach(([q, v]) => {
        const o = (qs[q] ||= { n: 0, ok: 0, wrong: {} });
        o.n++;
        if (v.ok) o.ok++;
        else if (v.a) o.wrong[v.a] = (o.wrong[v.a] || 0) + 1;
      })
    );
    return { t, done: rs.length, avg, qs };
  });
  const hard = [];
  sum.forEach(s =>
    Object.entries(s.qs).forEach(([q, o]) => {
      if (o.n >= 2 && o.ok / o.n < 0.6) hard.push({ s, q, rate: o.ok / o.n, o });
    })
  );
  hard.sort((a, b) => a.rate - b.rate);
  const qLabel = (t, qid) => {
    const i = t.x ? t.x.questions.findIndex(q => q.id === qid) : -1;
    return i >= 0 ? `Aufgabe ${i + 1}: ${esc(String(t.x.questions[i].prompt).slice(0, 80))}` : esc(qid);
  };
  const wrongList = o =>
    Object.entries(o.wrong)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([a, n]) => `<code>${esc(a.length > 60 ? a.slice(0, 60) + '…' : a)}</code>${n > 1 ? ' ×' + n : ''}`)
      .join(' · ');
  const off = l.closed || new Date(l.expires_at).getTime() < Date.now();
  $('main').innerHTML = `<div class="page kl-page">
    <button class="quiet back-link" data-nav="klassen">Alle Sitzungen</button>
    <header class="page-head"><div class="eyebrow">Klassensitzung · Code ${esc(l.code)}</div><h1>${esc(l.title || 'Sitzung')}</h1><p>${plural(people.length, 'Person', 'Personen')} · aktualisiert ${new Date().toLocaleTimeString('de-DE', { timeStyle: 'short' })}${off ? ' · beendet' : ''}</p>
    ${off ? '' : `<details class="kl-joinbox glass" ${people.length ? '' : 'open'}><summary>So treten Lernende bei</summary><div class="kl-joinbox-in"><div class="kl-joinqr">${qrSVG(klLink(l.code), 'QR-Code zur Klassensitzung')}</div><div><p>QR-Code mit dem iPad scannen oder Adresse eingeben:</p><p class="kl-url"><b>${esc(klLink(l.code).replace(/^https?:\/\//, ''))}</b></p><div class="kl-row-act"><button class="button primary" data-kl-beamer="${esc(l.code)}">Groß zeigen (Beamer)</button><button class="button secondary" data-qr-copy="${esc(klLink(l.code))}">Link kopieren</button></div></div></div></details>`}
    <div class="kl-row-act"><button class="button secondary" data-kl-refresh>Aktualisieren</button>${off ? '' : '<button class="button secondary" data-kl-close>Sitzung beenden</button>'}<button class="quiet danger" data-kl-delete>Sitzung und Ergebnisse löschen</button></div></header>
    ${
      people.length
        ? `<div class="kl-table-wrap"><table class="kl-table"><thead><tr><th>Name</th>${tasks.map((t, i) => `<th title="${esc(t.x?.title || t.id)}">${i + 1}</th>`).join('')}<th>Zuletzt aktiv</th></tr></thead><tbody>${people
            .map(p => {
              const done = (p.daje_results || []).filter(r => r.done && l.items.some(k => k.slice(2) === r.task_id)).length;
              return `<tr><th>${esc(p.name)}<small>${done} von ${tasks.length} erledigt</small></th>${tasks.map(t => cell(p, t)).join('')}<td class="kl-seen">${ago(p.last_seen)}</td></tr>`;
            })
            .join('')}</tbody><tfoot><tr><th>Klasse</th>${sum.map(s => `<td class="kl-c">${s.done}${s.avg !== null ? `<small>${s.avg} %</small>` : ''}</td>`).join('')}<td></td></tr></tfoot></table></div>
      <ol class="kl-legend">${tasks.map((t, i) => `<li><b>${i + 1}</b> ${esc(t.x?.title || t.id)}</li>`).join('')}</ol>
      <section class="kl-hard"><h2>Hier gab es die meisten Fehler</h2>${
        hard.length
          ? `<ul>${hard
              .slice(0, 8)
              .map(h => `<li><b>${esc(h.s.t.x?.title || h.s.t.id)}</b> · ${qLabel(h.s.t, h.q)}<br><span class="muted small">${Math.round(h.rate * 100)} % richtig (${h.o.n} Antworten)${Object.keys(h.o.wrong).length ? ' · häufig falsch: ' + wrongList(h.o) : ''}</span></li>`)
              .join('')}</ul>`
          : '<p class="muted small">Noch keine auffälligen Fehler (gezeigt ab zwei Antworten, wenn weniger als 60 % richtig sind).</p>'
      }<p class="muted small">Beobachtete Antworten dieser Sitzung, keine Note und keine Leistungsdiagnose.</p></section>`
        : `<p class="muted">Noch niemand beigetreten. Zeig den QR-Code oder teile den Link: <b>${esc(klLink(l.code))}</b></p>`
    }
  </div>`;
  // Während die Übersicht offen ist, alle 20 Sekunden neu laden
  klTimer = setTimeout(() => view === 'sitzung' && klTeach === code && document.visibilityState === 'visible' && klDashPage(), 20000);
}

/* ---------- Lehrkräfte-Dashboard: Kennzahlen und laufende Sitzungen (Startseite) ---------- */
let tdashBusy = false;
async function tdashLoad() {
  if (tdashBusy || !sb || !ACC.user || !$('tdash-live')) return;
  tdashBusy = true;
  try {
    const now = new Date();
    const { data, error } = await sb
      .from('daje_lessons')
      .select('id, code, title, items, created_at, expires_at, closed, daje_participants(id, name, last_seen, daje_results(task_id, done, correct, total, updated_at))')
      .eq('closed', false)
      .gt('expires_at', now.toISOString())
      .order('created_at', { ascending: false })
      .limit(6);
    const live = $('tdash-live'), kpis = $('tdash-kpis');
    if (!live) return;
    if (error) {
      live.innerHTML = '<p class="muted small">Gerade keine Verbindung zum Konto.</p>';
      return;
    }
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const isToday = t => t && new Date(t).getTime() >= day;
    let active = 0, doneToday = 0, sumPc = 0, nPc = 0;
    data.forEach(l =>
      (l.daje_participants || []).forEach(p => {
        if (isToday(p.last_seen)) active++;
        (p.daje_results || []).forEach(r => {
          if (r.done && isToday(r.updated_at)) {
            doneToday++;
            if (r.total) (sumPc += r.correct / r.total), nPc++;
          }
        });
      })
    );
    if (kpis)
      kpis.innerHTML = [
        [data.length, 'Laufende Sitzungen'],
        [active, 'Heute aktiv'],
        [doneToday, 'Heute erledigt'],
        [nPc ? Math.round((100 * sumPc) / nPc) + ' %' : '–', 'Richtig im Schnitt']
      ]
        .map(([v, l]) => `<div class="kpi"><b>${v}</b><span>${l}</span></div>`)
        .join('');
    const seen = t => {
      const m = Math.round((Date.now() - new Date(t).getTime()) / 60000);
      return m < 2;
    };
    live.innerHTML = data.length
      ? data
          .map(l => {
            const ps = l.daje_participants || [];
            const n = l.items.length;
            const doneOf = p => (p.daje_results || []).filter(r => r.done && l.items.some(k => k.slice(2) === r.task_id)).length;
            const total = ps.length * n;
            const done = ps.reduce((s, p) => s + doneOf(p), 0);
            const pc = total ? Math.round((100 * done) / total) : 0;
            const people = ps
              .slice()
              .sort((a, b) => doneOf(b) - doneOf(a) || a.name.localeCompare(b.name))
              .slice(0, 12)
              .map(p => {
                const d = doneOf(p);
                return `<li class="${d >= n ? 'is-done' : d ? 'is-busy' : ''}${seen(p.last_seen) ? ' is-online' : ''}" title="${esc(p.name)}: ${d} von ${n}"><span class="tp-av">${esc(p.name.trim().charAt(0).toUpperCase())}</span><span class="tp-name">${esc(p.name)}</span><span class="tp-n">${d}/${n}</span></li>`;
              })
              .join('');
            return `<div class="tlive"><div class="tlive-head"><div><b>${esc(l.title || 'Sitzung')}</b><small>${plural(ps.length, 'Person', 'Personen')} · ${plural(n, 'Aufgabe', 'Aufgaben')} · Code ${esc(l.code)}</small></div><div class="tlive-act"><button class="button secondary" data-kl-beamer="${esc(l.code)}" title="QR-Code groß zeigen">QR</button><button class="button primary" data-kl-dash="${esc(l.code)}">Übersicht</button></div></div>
              <div class="tlive-bar" role="img" aria-label="${pc} Prozent erledigt"><i style="width:${pc}%"></i></div><small class="tlive-pc">${ps.length ? pc + ' % der Aufgaben erledigt' : 'Noch niemand beigetreten'}</small>
              ${people ? `<ul class="tpeople">${people}</ul>${ps.length > 12 ? `<p class="muted small">und ${ps.length - 12} weitere</p>` : ''}` : ''}</div>`;
          })
          .join('')
      : '<div class="tlive-empty"><p>Keine laufende Sitzung.</p><p class="muted small">Übungen in die Mappe legen, dann „Klasse starten“: Die Lernenden scannen den QR-Code und tragen ihren Namen ein.</p><button class="button primary" data-ws-open="1">Stunde planen</button></div>';
    // Während das Dashboard offen ist, regelmäßig auffrischen
    clearTimeout(tdashLoad.t);
    tdashLoad.t = setTimeout(() => view === 'start' && isTeacher() && document.visibilityState === 'visible' && tdashLoad(), 30000);
  } finally {
    tdashBusy = false;
  }
}

/* ---------- Einbindung ---------- */
{
  const baseRender = render;
  render = function () {
    if (!session && view === 'aufgabe') return hwPage();
    if (!session && view === 'klasse') return klPage();
    if (!session && view === 'klassen') return klSessionsPage();
    if (!session && view === 'sitzung') return klDashPage();
    return baseRender.apply(this, arguments);
  };
  // Lernende: Klassensitzung bzw. Link als Karte auf der Startseite
  const baseHome = learnerHome;
  learnerHome = function () {
    return klHomeCard() + baseHome.apply(this, arguments);
  };
  const baseCheck = checkListening;
  checkListening = function () {
    const r = baseCheck.apply(this, arguments);
    if (klCur?.participant) klReport(openedListening, true);
    return r;
  };
  const baseOpen = openListening;
  openListening = function (id) {
    const r = baseOpen.apply(this, arguments);
    if (klCur?.participant && klCur.items.some(k => k.slice(2) === id)) {
      const s = klStore();
      const me = s.sessions[klCur.code];
      if (me && !me.reported?.[id] && !lessonStatus(findTask(id) || { questions: [{}] }).done) {
        me.reported = { ...(me.reported || {}), [id]: 1 };
        klSaveStore(s);
        klReport(id, false);
      }
    }
    return r;
  };
  // „Nächste Aufgabe“ nach der Korrektur, wenn die Übung aus der Liste geöffnet wurde
  const baseBanner = resultBanner;
  resultBanner = function (x) {
    const html = baseBanner.apply(this, arguments);
    const list = klActive === 'klasse' && klCur ? klCur.items : klActive === 'aufgabe' && hwCurrent ? hwCurrent.i : null;
    if (!html || !list) return html;
    const rows = list.map(hwResolve).filter(Boolean);
    const i = rows.findIndex(r => r.x.id === x.id);
    if (i < 0) return html;
    const next = rows.slice(i + 1).concat(rows.slice(0, i)).find(r => !hwDone(r));
    const btn = next ? (next.kind === 'vocabulary' ? `<button class="button primary" data-vocab-set="${esc(next.x.id)}">Nächste Aufgabe</button>` : `<button class="button primary" data-lesson="${esc(next.x.id)}">Nächste Aufgabe</button>`) : '';
    return html.replace('</section>', `<div class="hw-next"><span>${rows.filter(hwDone).length} von ${rows.length} erledigt</span>${btn}<button class="button secondary" data-kl-list>Zur Aufgabenliste</button></div></section>`);
  };
  // Rückweg aus einer Übung der Klassensitzung: zur Aufgabenliste statt zum Katalog
  const baseListen = renderListening;
  renderListening = function () {
    const r = baseListen.apply(this, arguments);
    if (klActive && (klCur || hwCurrent)) {
      const back = document.querySelector('.lesson-page > .back-link');
      if (back) {
        back.outerHTML = '<button class="quiet back-link" data-kl-list>Zur Aufgabenliste</button>';
      }
    }
    return r;
  };
}
function klHomeCard() {
  if (isTeacher()) return '';
  const s = klStore().sessions;
  const last = Object.entries(s).sort((a, b) => String(b[1].at).localeCompare(String(a[1].at)))[0];
  if (last) {
    const [code, me] = last;
    const rows = (me.items || []).map(hwResolve).filter(Boolean);
    const done = rows.filter(hwDone).length;
    if (rows.length && done < rows.length) return `<button class="hw-home" data-kl-go="${esc(code)}"><span class="eyebrow">Klassensitzung</span><b>${esc(me.title || 'Aufgaben für die Stunde')}</b><small>${done} von ${rows.length} erledigt</small></button>`;
  }
  const open = hwInbox()
    .map(a => ({ a, s: hwStatus(a) }))
    .filter(({ s }) => s.rows.length && s.done < s.rows.length);
  if (!open.length) return '';
  const { a, s: st } = open[0];
  return `<button class="hw-home" data-hw-show="${esc(a.code)}"><span class="eyebrow">Aufgaben</span><b>${esc(a.t || 'Deine Aufgaben')}</b><small>${st.done} von ${st.rows.length} erledigt</small></button>`;
}
document.addEventListener(
  'click',
  e => {
    const b = e.target.closest('[data-lesson],[data-vocab-set]');
    if (!b) return;
    // aus der Aufgabenliste bzw. „Nächste Aufgabe“: Liste merken; sonst normaler Katalog
    if (b.closest('.hw-tasks')) klActive = view === 'klasse' ? 'klasse' : view === 'aufgabe' ? 'aufgabe' : null;
    else if (!b.closest('.hw-next')) klActive = null;
  },
  true
);
document.addEventListener('click', async e => {
  const b = e.target.closest('[data-hw-show],[data-kl],[data-kl-dash],[data-kl-show],[data-kl-beamer],[data-kl-refresh],[data-kl-close],[data-kl-delete],[data-kl-list],[data-kl-go],[data-ws-link]');
  if (!b) return;
  if (b.dataset.hwShow) return hwShow(b.dataset.hwShow);
  if (b.hasAttribute('data-ws-link')) return klLinkDialog();
  if (b.dataset.kl === 'create') return klCreate();
  if (b.dataset.klDash) {
    $('kl-dialog')?.close();
    klTeach = b.dataset.klDash;
    return nav('sitzung');
  }
  if (b.dataset.klShow) return klShowCode(b.dataset.klShow, b.dataset.title || '', Number(b.dataset.n) || 0);
  if (b.dataset.klBeamer) return klBeamer(b.dataset.klBeamer);
  if (b.hasAttribute('data-kl-refresh')) return klDashPage();
  if (b.dataset.klGo) return klOpen(b.dataset.klGo);
  if (b.hasAttribute('data-kl-list')) {
    if (klActive === 'klasse' && klCur) {
      view = 'klasse';
      return nav('klasse');
    }
    if (hwCurrent) return nav('aufgabe');
    return nav('start');
  }
  if (b.hasAttribute('data-kl-close') || b.hasAttribute('data-kl-delete')) {
    const del = b.hasAttribute('data-kl-delete');
    if (!confirm(del ? 'Sitzung mit allen Namen und Ergebnissen endgültig löschen?' : 'Sitzung beenden? Lernende können danach nichts mehr eintragen; die Ergebnisse bleiben sichtbar.')) return;
    const q = sb.from('daje_lessons');
    const { error } = del ? await q.delete().eq('code', klTeach) : await q.update({ closed: true }).eq('code', klTeach);
    if (error) return toast('Nicht möglich: ' + error.message);
    toast(del ? 'Sitzung gelöscht.' : 'Sitzung beendet.');
    return del ? nav('klassen') : klDashPage();
  }
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'kl-join') return;
  e.preventDefault();
  klJoin();
});
/* Beim Laden: ?k=… (Klassensitzung), ?sitzung=… (Übersicht der Lehrkraft), ?aufgabe=… (Link ohne Konto) */
if (params.get('k')) klOpen(params.get('k'));
else if (params.get('sitzung')) {
  klTeach = params.get('sitzung');
  setTimeout(() => nav('sitzung'), 300);
} else if (params.get('aufgabe')) {
  const a = hwDecode(params.get('aufgabe'));
  if (a) {
    hwReceive(a);
    hwCurrent = a;
    nav('aufgabe');
  } else toast('Dieser Link ist unvollständig.');
}
if (params.get('eigene')) receiveShared(params.get('eigene'));
if (params.get('einreichung')) receiveSubmission(params.get('einreichung'));
// Offline gebliebene Ergebnisse nachsenden, sobald wieder Netz da ist
addEventListener('online', () => {
  const q = klQueue();
  if (!q.length || !sb) return;
  save('daje-klasse-queue-v1', []);
  q.forEach(b => sb.rpc('daje_lesson_report', b).then(({ error }) => error && save('daje-klasse-queue-v1', [...klQueue(), b])));
});

/* Lernende: Beendet die Lehrkraft die Sitzung, erscheint das nach wenigen Sekunden (Abfrage alle 10 s). */
let klEnded = false;
async function klCheckOpen() {
  if (!klCur?.participant || klEnded || !sb || document.visibilityState !== 'visible') return;
  if (view !== 'klasse' && !(view === 'hoeruebung' && klActive === 'klasse')) return;
  try {
    const { data, error } = await sb.rpc('daje_lesson_get', { p_code: klCur.code });
    if (error || data) return;
  } catch (e) {
    return; // offline: nicht als beendet werten
  }
  klEnded = true;
  klCur.closed = true;
  const s = klStore();
  delete s.sessions[klCur.code];
  klSaveStore(s);
  let d = $('kl-ended');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'kl-ended';
    document.body.append(d);
  }
  d.innerHTML = `<div class="dialog-head"><h2>Sitzung beendet</h2></div><p><b>${esc(klCur.title || '')}</b></p><p>Deine Lehrkraft hat die Klassensitzung beendet. Deine Ergebnisse sind gespeichert. Du kannst die Übungen allein weiter üben.</p><button class="button primary" data-close="kl-ended" data-nav="start">Zur Startseite</button>`;
  document.querySelectorAll('dialog[open]').forEach(x => x !== d && x.close());
  d.showModal();
  klActive = null;
}
setInterval(klCheckOpen, 10000);
document.addEventListener('visibilitychange', klCheckOpen);
