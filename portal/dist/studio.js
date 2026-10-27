'use strict';
/*
 * Redaktion · „Eigene Übungen“ für Lehrkräfte.
 * Hörübungen und Wortlisten anlegen, bearbeiten, in der Vorschau prüfen und per Link mit der
 * Klasse teilen (?eigene=…). Ohne Server: Entwürfe bleiben in diesem Browser (ripassa-editor-v1),
 * geteilte Inhalte reisen vollständig im Link. Unfertige Entwürfe werden als draft mitgespeichert.
 */
// Alle Aufgabentypen in der Reihenfolge der Gruppen (portal.js: FORMAT_GROUPS); Bezeichnung für die Redaktion.
// Erst bei Bedarf: portal.js (FORMAT_GROUPS) wird nach studio.js geladen.
const edTypes = () => FORMAT_GROUPS.flatMap(([, list]) => list.map(([t]) => [t, t === 'matching' ? 'Zuordnen' : LISTENING_FORMAT_LABELS[t]]));
const edTypeLabel = t => (edTypes().find(e => e[0] === t) || [t, t])[1];
const ED_PROMPT_HINT = {
  true_false_ng: 'z. B. Luca ha fame.',
  word_select: 'z. B. Quali parole senti?',
  gap_choice: 'z. B. Scegli la parola giusta.',
  note_fill: 'z. B. Completa gli appunti.',
  table_fill: 'z. B. Completa la tabella.',
  error_correction: 'z. B. Nel riassunto ci sono tre errori. Correggili.',
  speaker_match: 'z. B. Chi lo dice?',
  categorize: 'z. B. Vantaggi o svantaggi?',
  open_answer: 'z. B. E tu? Scrivi due o tre frasi.',
  sentence_completion: 'z. B. Completa le frasi.',
  multiple_choice: 'z. B. Quali attività vengono nominate? (più risposte)',
  gap_fill: 'z. B. Completa con le parole del testo.',
  matching: 'z. B. Chi dice che cosa? Abbina.',
  ordering: 'z. B. Metti in ordine le fasi del dialogo.'
};
const ED_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
let edWork = null, // Arbeitskopie des gewählten Inhalts (Paketform)
  edTimer = null,
  kiOpen = false;

function downloadJSON(data, name) {
  const u = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    ),
    a = document.createElement('a');
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
function saveEditorState() {
  return save('ripassa-editor-v1', editorState);
}
const edReviewIds = () => new Set(LISTENING_REVIEW_SEEDS.map(x => x.id));
const edItem = () =>
  editorState.items.find(x => (x.payload?.id || x.draft?.id) === studioSelection);
const edId = item => item.payload?.id || item.draft?.id;
const edNewId = () => 'eigen-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

/* ---------- Neu anlegen ---------- */

function edBlank(kind) {
  const base = {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind,
    id: edNewId(),
    title: kind === 'listening' ? 'Neue Hörübung' : 'Neue Wortliste',
    language: 'it',
    level: 'A1',
    description: kind === 'listening' ? 'Eigene Hörübung.' : 'Eigene Wortliste.',
    topics: ['eigene Übung'],
    sources: [{ kind: 'own', citation: 'Eigene Übung der Lehrkraft.', rights: 'own' }],
    reviewNotes: []
  };
  return kind === 'listening'
    ? {
        ...base,
        estimatedMinutes: 10,
        media: { type: 'youtube', videoId: '' },
        transcript: '',
        questions: [edQuestion('single_choice', 1)]
      }
    : {
        ...base,
        translationLanguage: 'de',
        collection: 'Eigene Listen',
        section: 'Neue Wortliste',
        entries: []
      };
}
function edQuestion(type, n) {
  const q = { id: 'q' + n, type, prompt: '', explanation: '' };
  if (type === 'single_choice')
    Object.assign(q, {
      options: ['a', 'b', 'c'].map(id => ({ id, text: '' })),
      correctOptionId: 'a'
    });
  if (type === 'multiple_choice')
    Object.assign(q, { options: ['a', 'b', 'c', 'd'].map(id => ({ id, text: '' })), correctOptionIds: [] });
  if (type === 'true_false') q.answer = true;
  if (type === 'short_answer') Object.assign(q, { acceptedAnswers: [], modelAnswer: '' });
  if (type === 'gap_fill') Object.assign(q, { text: '', gaps: [] });
  if (type === 'matching') Object.assign(q, { pairs: [], distractors: [] });
  if (type === 'ordering') q.items = [];
  if (type === 'true_false_ng') q.answer = 'true';
  if (type === 'word_select') Object.assign(q, { options: [], correctOptionIds: [] });
  if (type === 'gap_choice' || type === 'note_fill') Object.assign(q, { text: '', gaps: [] });
  if (type === 'error_correction') Object.assign(q, { text: '', errors: [] });
  if (type === 'table_fill') Object.assign(q, { columns: [], rows: [] });
  if (type === 'speaker_match' || type === 'categorize') Object.assign(q, { categories: [], items: [] });
  if (type === 'open_answer') Object.assign(q, { modelAnswer: '', lines: 4 });
  if (type === 'sentence_completion') q.items = [];
  return q;
}
function edCreate(payload, message) {
  if (editorState.items.length >= 100) return toast('Höchstens 100 eigene Inhalte.');
  editorState.items.unshift({
    payload: null,
    draft: payload,
    status: 'draft',
    updatedAt: new Date().toISOString()
  });
  studioSelection = payload.id;
  edWork = null;
  edCommit();
  if (view !== 'redaktion') nav('redaktion');
  else renderStudio();
  if (message) toast(message);
}
/* Katalogübung als Vorlage: Kopie mit neuer ID, Rechteangabe bleibt erhalten. */
function edCopyFrom(id) {
  const x = contentList('listening').find(y => y.id === id);
  if (!x) return;
  const copy = JSON.parse(JSON.stringify(x));
  copy.id = edNewId();
  copy.title = (x.title + ' (eigene Fassung)').slice(0, 120);
  delete copy.series;
  edCreate(copy, 'Kopie angelegt. Du kannst sie jetzt anpassen.');
}

/* ---------- Speichern und Prüfen ---------- */

function edFriendlyErrors(x) {
  const e = [];
  if (!x.title.trim()) e.push('Titel fehlt.');
  if (x.kind === 'listening') {
    const m = x.media;
    if (m.type === 'youtube' && !/^[A-Za-z0-9_-]{11}$/.test(m.videoId || ''))
      e.push('YouTube-Link fehlt oder ist nicht erkennbar.');
    if (m.type === 'audio' && !/^https:\/\//.test(m.url || ''))
      e.push('Audio-Adresse muss mit https:// beginnen.');
    if (m.type === 'speech' && !(m.text || '').trim()) e.push('Text zum Vorlesen fehlt.');
    if (!x.questions.length) e.push('Mindestens eine Aufgabe anlegen.');
    x.questions.forEach((q, i) => {
      const n = 'Aufgabe ' + (i + 1) + ': ';
      if (!promptPhase(q.prompt)[2].trim()) e.push(n + 'Aufgabenstellung fehlt.');
      if (q.type === 'single_choice' && q.options.filter(o => o.text.trim()).length < 2)
        e.push(n + 'mindestens zwei Antworten eintragen.');
      if (
        q.type === 'single_choice' &&
        !q.options.find(o => o.id === q.correctOptionId)?.text.trim()
      )
        e.push(n + 'richtige Antwort markieren.');
      if (q.type === 'short_answer' && !q.acceptedAnswers.length)
        e.push(n + 'mindestens eine richtige Lösung eintragen.');
      if (q.type === 'multiple_choice') {
        const filled = q.options.filter(o => o.text.trim());
        const right = filled.filter(o => (q.correctOptionIds || []).includes(o.id));
        if (filled.length < 3) e.push(n + 'mindestens drei Antworten eintragen.');
        else if (!right.length) e.push(n + 'mindestens eine richtige Antwort ankreuzen.');
        else if (right.length === filled.length) e.push(n + 'mindestens eine Antwort muss falsch sein.');
      }
      if (q.type === 'gap_fill' && !q.gaps.length) e.push(n + 'Lösungen in eckige Klammern setzen, z. B. [sette].');
      if (q.type === 'matching') {
        if (q.pairs.some(p => !p.left || !p.right)) e.push(n + 'jedes Paar braucht links und rechts etwas („links = rechts“).');
        else if (q.pairs.length < 2) e.push(n + 'mindestens zwei Paare eintragen.');
      }
      if (q.type === 'ordering' && q.items.length < 3) e.push(n + 'mindestens drei Elemente eintragen.');
      if (q.type === 'sentence_completion') {
        if (!q.items.length) e.push(n + 'mindestens einen Satz der Form „Satzanfang = Lösung“ eintragen.');
        else if (q.items.some(it => !it.start || !it.acceptedAnswers.length)) e.push(n + 'jeder Satz braucht einen Anfang und nach „=“ eine Lösung.');
      }
      if (q.type === 'word_select') {
        const r = q.correctOptionIds.length;
        if (q.options.length < 4) e.push(n + 'zusammen mindestens vier Wörter eintragen.');
        else if (!r) e.push(n + 'mindestens ein Wort eintragen, das vorkommt.');
        else if (r === q.options.length) e.push(n + 'mindestens ein Wort eintragen, das nicht vorkommt.');
      }
      if (q.type === 'gap_choice' && !q.gaps.length) e.push(n + 'Auswahl in eckige Klammern setzen, z. B. [quattro | tre | cinque].');
      if (q.type === 'note_fill' && !q.gaps.length) e.push(n + 'Lösungen in eckige Klammern setzen, z. B. [Castello].');
      if (q.type === 'error_correction' && !q.errors.length) e.push(n + 'Fehler so markieren: [falsch > richtig].');
      if (q.type === 'table_fill') {
        if (q.columns.filter(Boolean).length < 2) e.push(n + 'erste Zeile: mindestens zwei Spaltenköpfe, mit „|“ getrennt.');
        else if (!q.rows.flat().some(c => typeof c === 'object')) e.push(n + 'mindestens eine Zelle zum Ergänzen in [ ] setzen.');
      }
      if (q.type === 'speaker_match' || q.type === 'categorize') {
        if (q.categories.length < 2) e.push(n + 'mindestens zwei ' + (q.type === 'speaker_match' ? 'Personen' : 'Kategorien') + ' eintragen.');
        else if (q.items.length < 2) e.push(n + 'mindestens zwei Einträge der Form „Text = ' + (q.type === 'speaker_match' ? 'Person' : 'Kategorie') + '“.');
        else if (q.items.some(it => !it.category)) e.push(n + 'nach „=“ genau einen der Namen aus der Liste darüber schreiben.');
      }
    });
  } else if (!x.entries.length) e.push('Mindestens ein Wort eintragen.');
  return e;
}
function edClean(x) {
  const y = JSON.parse(JSON.stringify(x));
  y.title = y.title.trim();
  y.description =
    y.description.trim() || (y.kind === 'listening' ? 'Eigene Hörübung.' : 'Eigene Wortliste.');
  if (!y.topics.length) y.topics = ['eigene Übung'];
  y.sources = y.sources.map(s => ({
    ...s,
    citation: s.citation.trim() || 'Eigene Übung der Lehrkraft.'
  }));
  if (y.kind === 'listening') {
    y.questions = y.questions.map(q => {
      if (q.type === 'multiple_choice') {
        const options = q.options.filter(o => o.text.trim());
        return { ...q, options, correctOptionIds: (q.correctOptionIds || []).filter(id => options.some(o => o.id === id)) };
      }
      if (q.type !== 'single_choice') return q;
      return { ...q, options: q.options.filter(o => o.text.trim()) };
    });
    y.questions.forEach(q => {
      if (!q.explanation.trim()) delete q.explanation;
    });
    if (!y.transcript) delete y.transcript;
    if (y.media.type === 'youtube')
      ['start', 'end'].forEach(k => y.media[k] === undefined && delete y.media[k]);
  } else y.section = y.title;
  return y;
}
/* Arbeitsstand sichern: der Entwurf bleibt immer erhalten, das Paket nur, wenn es gültig ist. */
function edCommit() {
  const item = edItem();
  if (!item) return { ok: false, errors: [] };
  const work = edWork || item.draft || item.payload;
  const friendly = edFriendlyErrors(work);
  const v = friendly.length ? { ok: false } : TheisContent.validatePackage(edClean(work));
  item.draft = work;
  item.updatedAt = new Date().toISOString();
  if (v.ok) item.payload = v.value;
  else if (item.status === 'published') item.status = 'draft';
  saveEditorState();
  const status = $('ed-status');
  if (status)
    status.innerHTML = v.ok
      ? '<span class="ok">Gespeichert · bereit zum Teilen</span>'
      : `<span class="warn">Gespeichert als Entwurf · noch offen:</span><ul>${(friendly.length
          ? friendly
          : v.errors
        )
          .slice(0, 6)
          .map(t => `<li>${esc(t)}</li>`)
          .join('')}</ul>`;
  document.querySelectorAll('[data-ed-needs-valid]').forEach(b => (b.disabled = !v.ok));
  return v;
}
function edSoon() {
  clearTimeout(edTimer);
  edTimer = setTimeout(edCommit, 400);
}

/* ---------- Teilen per Link ---------- */

async function edPack(payload) {
  const json = new TextEncoder().encode(JSON.stringify(payload));
  let bytes = json,
    tag = 'j';
  if (typeof CompressionStream === 'function') {
    const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    tag = 'z';
  }
  let bin = '';
  bytes.forEach(b => (bin += String.fromCharCode(b)));
  return tag + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
async function edUnpack(code) {
  const tag = code[0];
  const bin = atob(code.slice(1).replace(/-/g, '+').replace(/_/g, '/'));
  let bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
  if (tag === 'z') {
    if (typeof DecompressionStream !== 'function') throw new Error('Browser zu alt');
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  } else if (tag !== 'j') throw new Error('unbekannt');
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function edShare() {
  const item = edItem();
  const v = edCommit();
  if (!v.ok) return toast('Bitte zuerst die offenen Punkte ergänzen.');
  if (item.payload.sources.some(s => s.rights === 'needs_review'))
    return toast(
      'Rechte am Medium und an den Texten bitte erst klären (Abschnitt „Quelle und Rechte“).'
    );
  const u = new URL(location.href);
  u.search = '';
  u.hash = '';
  u.searchParams.set('eigene', await edPack(item.payload));
  const url = u.href;
  let d = $('ed-share-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'ed-share-dialog';
    d.setAttribute('aria-labelledby', 'ed-share-title');
    document.body.append(d);
  }
  const qr = url.length <= 2200 ? qrSVG(url, 'QR-Code zur eigenen Übung') : '';
  d.innerHTML = `<div class="dialog-head"><h2 id="ed-share-title">Mit der Klasse teilen</h2><button class="button secondary" data-close="ed-share-dialog">Schließen</button></div>
    <p>Der Link enthält die ganze Übung. Lernende brauchen keine Anmeldung; die Übung erscheint bei ihnen unter „Von deiner Lehrkraft“.</p>
    ${qr ? `<div class="qr-card hw-qr">${qr}</div>` : '<p class="muted small">Für einen QR-Code ist diese Übung zu umfangreich. Teile den Link, z. B. in mebis oder per Nachricht.</p>'}
    <div class="hw-actions"><button class="button primary" data-qr-copy="${esc(url)}">Link kopieren</button><a class="button secondary" href="${esc(url)}" target="_blank" rel="noopener">So sehen es Lernende</a></div>
    <p class="muted small">Änderst du die Übung später, teile den neuen Link. Lernende mit dem alten Link behalten die alte Fassung.</p>`;
  d.showModal();
}

/* ---------- An daje schicken ----------
   Kolleginnen und Kollegen schlagen eine Übung für den öffentlichen Katalog vor: E-Mail an hallo@theisapps.de
   mit einem Link, der die ganze Übung enthält (?einreichung=…). Zu lang für eine E-Mail: als Datei anhängen. */
const DAJE_MAIL = 'hallo@theisapps.de';
const SUBMIT_NAME_KEY = 'daje-einreichen-name';
function edSubmissionPackage(payload, name) {
  const p = JSON.parse(JSON.stringify(payload));
  const who = name.trim();
  p.reviewNotes = [...(p.reviewNotes || []), `Eingereicht${who ? ' von ' + who : ''} am ${new Date().toLocaleDateString('de-DE')}; Einverständnis zur Veröffentlichung im daje-Katalog erteilt.`].slice(-20);
  if (who && p.sources.length < 12) p.sources = [...p.sources, { kind: 'own', citation: (p.kind === 'listening' ? 'Aufgaben: ' : 'Liste: ') + who, rights: 'own' }];
  return p;
}
function edSubmit() {
  const v = edCommit();
  if (!v.ok) return toast('Bitte zuerst die offenen Punkte ergänzen.');
  const x = edItem().payload;
  let d = $('ed-submit-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'ed-submit-dialog';
    d.setAttribute('aria-labelledby', 'ed-submit-title');
    document.body.append(d);
  }
  d.innerHTML = `<div class="dialog-head"><h2 id="ed-submit-title">An daje schicken</h2><button class="button secondary" data-close="ed-submit-dialog">Schließen</button></div>
    <p>Eine gelungene Übung? Schick sie an <b>${DAJE_MAIL}</b>. Nach einer Prüfung kann sie in den öffentlichen daje-Katalog aufgenommen werden und steht dann allen zur Verfügung.</p>
    <p class="muted small">„${esc(x.title)}“ · ${x.kind === 'listening' ? plural(x.questions.length, 'Aufgabe', 'Aufgaben') : plural(x.entries.length, 'Wort', 'Wörter')} · ${esc(portalLang(x.language))} · ${esc(x.level)}</p>
    <label class="field">Dein Name für die Quellenangabe (optional)<input id="submit-name" autocomplete="name" value="${esc(read(SUBMIT_NAME_KEY, ''))}" placeholder="z. B. M. Rossi, Gymnasium Musterstadt"></label>
    <label class="dlg-check"><input type="checkbox" id="submit-ok"><span>Ich bin einverstanden, dass die Übung nach Prüfung im daje-Katalog veröffentlicht wird. Medien und Texte darf ich dafür verwenden.</span></label>
    <div class="hw-actions"><button class="button primary" data-submit="mail">E-Mail öffnen</button><button class="button secondary" data-submit="file">Als Datei teilen</button></div>
    <p class="small" id="submit-status" role="status"></p>`;
  d.showModal();
}
async function edSubmitSend(how) {
  const status = $('submit-status');
  if (!$('submit-ok').checked) return (status.textContent = 'Bitte zuerst das Einverständnis bestätigen.');
  const name = $('submit-name').value;
  save(SUBMIT_NAME_KEY, name.trim());
  const p = edSubmissionPackage(edItem().payload, name);
  const fileName = 'daje-' + p.id + '.json';
  const file = () => new File([JSON.stringify(p, null, 2)], fileName, { type: 'application/json' });
  const subject = 'daje · Vorschlag für den Katalog: ' + p.title;
  const intro = `Hallo,\n\nich schlage diese ${p.kind === 'listening' ? 'Hörübung' : 'Wortliste'} für den daje-Katalog vor.\n\nTitel: ${p.title}\nSprache und Niveau: ${portalLang(p.language)} · ${p.level}\n${name.trim() ? 'Von: ' + name.trim() + '\n' : ''}Einverständnis: Die Übung darf nach Prüfung im daje-Katalog veröffentlicht werden.\n\n`;
  if (how === 'file') {
    const f = file();
    if (navigator.canShare && navigator.canShare({ files: [f] })) {
      try {
        await navigator.share({ files: [f], title: subject, text: intro + 'Bitte an ' + DAJE_MAIL + ' senden.' });
        return (status.textContent = 'Geteilt. Als Empfänger bitte ' + DAJE_MAIL + ' eintragen.');
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    downloadJSON(p, fileName);
    return (status.textContent = `Datei „${fileName}“ gespeichert. Bitte an eine E-Mail an ${DAJE_MAIL} anhängen.`);
  }
  const u = new URL(location.href);
  u.search = '';
  u.hash = '';
  u.searchParams.set('einreichung', await edPack(p));
  let body = intro + 'Übung öffnen (der Link enthält die ganze Übung):\n' + u.href + '\n\nViele Grüße';
  let mail = `mailto:${DAJE_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // Manche Mailprogramme kürzen sehr lange Links: dann die Übung als Datei anhängen.
  if (mail.length > 7000) {
    downloadJSON(p, fileName);
    body = intro + `Die Übung hängt als Datei an (${fileName}).\n\nViele Grüße`;
    mail = `mailto:${DAJE_MAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = `Die Übung ist zu umfangreich für einen Link. Datei „${fileName}“ wurde gespeichert: Bitte an die E-Mail anhängen.`;
  } else status.textContent = 'Dein Mailprogramm öffnet sich mit einer fertigen Nachricht. Nur noch absenden.';
  location.href = mail;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-submit]');
  if (b) edSubmitSend(b.dataset.submit);
});

/* Betreiber: eingereichte Übung aus dem E-Mail-Link ansehen und in die Redaktion übernehmen. */
async function receiveSubmission(code) {
  try {
    const v = TheisContent.validatePackage(await edUnpack(code));
    if (!v.ok) throw new Error('ungültig');
    const p = v.value;
    let d = $('ed-received-dialog');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'ed-received-dialog';
      d.setAttribute('aria-labelledby', 'ed-received-title');
      document.body.append(d);
    }
    const note = (p.reviewNotes || []).filter(n => n.startsWith('Eingereicht')).pop() || '';
    d.innerHTML = `<div class="dialog-head"><h2 id="ed-received-title">Eingereichte Übung</h2><button class="button secondary" data-close="ed-received-dialog">Schließen</button></div>
      <h3>${esc(p.title)}</h3>
      <p>${p.kind === 'listening' ? 'Hörübung · ' + plural(p.questions.length, 'Aufgabe', 'Aufgaben') : 'Wortliste · ' + plural(p.entries.length, 'Wort', 'Wörter')} · ${esc(portalLang(p.language))} · ${esc(p.level)}</p>
      ${note ? `<p class="muted small">${esc(note)}</p>` : ''}
      <p>In der Redaktion prüfen, bei Bedarf bearbeiten und dann mit „Live stellen“ in den öffentlichen Katalog aufnehmen.</p>
      <div class="hw-actions"><button class="button primary" data-received="take">In die Redaktion übernehmen</button></div>`;
    d._pkg = p;
    d.showModal();
  } catch (err) {
    toast('Dieser Einreichungs-Link ist unvollständig. Bitte um die Datei bitten.');
  }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-received="take"]');
  if (!b) return;
  const d = $('ed-received-dialog'), p = JSON.parse(JSON.stringify(d._pkg));
  d.close();
  if (editorState.items.some(i => edId(i) === p.id)) p.id = edNewId();
  if (!isTeacher()) {
    save('daje-lehrkraft-ok', true);
    setPortalAudience('teach');
    refreshAudience();
  }
  edCreate(p, 'Übernommen. Jetzt prüfen und mit „Live stellen“ veröffentlichen.');
});

/* Lernende: geteilte Übung aus dem Link übernehmen und öffnen. */
function sharedPackages() {
  return read('daje-geteilt-v1', [])
    .map(x => TheisContent.validatePackage(x.payload))
    .filter(v => v.ok)
    .map(v => ({
      ...v.value,
      collection: v.value.kind === 'vocabulary' ? 'Von deiner Lehrkraft' : v.value.collection
    }));
}
async function receiveShared(code) {
  try {
    const v = TheisContent.validatePackage(await edUnpack(code));
    if (!v.ok) throw new Error('ungültig');
    const list = read('daje-geteilt-v1', []).filter(x => x.payload?.id !== v.value.id);
    list.unshift({ payload: v.value, at: new Date().toISOString() });
    save('daje-geteilt-v1', list.slice(0, 40));
    if (v.value.kind === 'listening') openListening(v.value.id);
    else {
      nav('vokabeln');
      showVocabularySet(v.value.id);
    }
    toast('Übung von deiner Lehrkraft gespeichert.');
  } catch (err) {
    toast(
      err.message === 'Browser zu alt'
        ? 'Dein Browser kann diesen Link nicht öffnen. Bitte aktualisiere ihn.'
        : 'Dieser Link ist unvollständig. Bitte die Lehrkraft um einen neuen.'
    );
  }
}

/* ---------- Ansicht ---------- */

function renderStudio() {
  const teacher = isTeacher();
  if (!teacher) {
    $('main').innerHTML =
      `<div class="page"><header class="page-head"><div class="eyebrow">Redaktion</div><h1>Für Lehrkräfte</h1><p>Hier erstellen Lehrkräfte eigene Übungen für ihre Klasse.</p></header><button class="button primary" data-audience="teach">Zur Ansicht für Lehrkräfte</button></div>`;
    return;
  }
  const review = edReviewIds();
  const own = editorState.items.filter(x => !review.has(edId(x)));
  const catalog = editorState.items.filter(x => review.has(edId(x)));
  const item = edItem();
  if (item && (!edWork || edWork.id !== edId(item)))
    edWork = JSON.parse(JSON.stringify(item.draft || item.payload));
  const card = x => {
    const p = x.draft || x.payload;
    const state =
      x.payload && (!x.draft || x.payload.title === x.draft.title)
        ? x.status === 'published'
          ? 'Im Katalog sichtbar'
          : 'Fertig'
        : 'Entwurf';
    return `<button class="ed-card ${edId(x) === studioSelection ? 'active' : ''}" data-ed-open="${esc(edId(x))}"><span class="badge">${p.kind === 'listening' ? 'Hören' : 'Wörter'} · ${esc(p.level)}</span><b>${esc(p.title)}</b><small>${esc(portalLang(p.language))} · ${state}</small></button>`;
  };
  $('main').innerHTML = `<div class="page studio">
    <header class="page-head"><div class="eyebrow">Redaktion</div><h1>Eigene Übungen</h1><p>Erstelle Hörübungen und Wortlisten für deine Klasse. Alles bleibt in diesem Browser, bis du es als Link teilst.</p></header>
    <div class="ed-new">
      <button class="button primary" data-ki-open aria-expanded="${kiOpen}">Hörübung mit KI erstellen</button>
      <button class="button primary" data-vk-open aria-expanded="${vkOpen}">Wortliste mit KI erstellen</button>
      <button class="button secondary" data-ed-new="listening">Leere Hörübung</button>
      <button class="button secondary" data-ed-new="vocabulary">Leere Wortliste</button>
      <button class="quiet" data-portal="studio-load">Datei importieren</button><input id="studio-file" type="file" accept=".json,application/json" hidden>
    </div>
    ${kiOpen ? kiPanelHTML() : ''}
    ${vkOpen ? vkPanelHTML() : ''}
    <div class="ed-layout">
      <nav class="ed-list" aria-label="Eigene Inhalte">
        ${own.map(card).join('') || '<p class="hw-empty">Noch keine eigenen Übungen. Lege oben eine an oder öffne eine Hörübung im Katalog und wähle „Als eigene Übung bearbeiten“.</p>'}
        ${catalog.length ? `<details class="ed-catalog"><summary>Katalog-Arbeitsfassungen (${catalog.length})</summary>${catalog.map(card).join('')}</details>` : ''}
      </nav>
      <section class="ed-editor">${item ? editorFormHTML(item) : own.length ? '<div class="studio-empty"><h2>Wähle eine Übung aus der Liste</h2><p class="muted">oder lege eine neue an. Änderungen werden automatisch gespeichert.</p></div>' : ''}</section>
    </div>
  </div>`;
  if (item) edCommit();
}
function edField(label, html, hint = '') {
  return `<label class="field">${label}${html}${hint ? `<small class="muted">${hint}</small>` : ''}</label>`;
}
const edSel = (key, value, list) =>
  `<select data-ed="${key}">${list.map(([k, t]) => `<option value="${esc(k)}" ${k === value ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
const edTime = s =>
  s === undefined || s === '' ? '' : Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

function editorFormHTML(item) {
  const x = edWork || item.draft || item.payload;
  const langs = Object.entries(TheisContent.LANGUAGES);
  const head = `<div class="ed-toolbar">
      <button class="button secondary" data-ed-act="preview" data-ed-needs-valid>Vorschau</button>
      <button class="button primary" data-ed-act="share" data-ed-needs-valid>Mit Klasse teilen</button>
      <button class="button secondary" data-ed-act="submit" data-ed-needs-valid>An daje schicken</button>
      <button class="button secondary" data-ed-act="catalog" data-ed-needs-valid aria-pressed="${item.status === 'published'}">${item.status === 'published' ? 'Im Katalog sichtbar' : 'Im eigenen Katalog zeigen'}</button>
      <button class="quiet" data-ed-act="export" data-ed-needs-valid>Als Datei sichern</button>
      <button class="quiet danger" data-ed-act="delete">Löschen</button>
    </div>
    <div id="ed-status" class="ed-status" role="status"></div>
    <div class="ed-grid">
      ${edField('Titel', `<input data-ed="title" maxlength="120" value="${esc(x.title)}">`)}
      ${edField('Kurzbeschreibung', `<input data-ed="description" maxlength="600" value="${esc(x.description)}">`)}
      ${edField('Sprache', edSel('language', x.language, langs))}
      ${edField(
        'Niveau',
        edSel(
          'level',
          x.level,
          ED_LEVELS.map(l => [l, l])
        )
      )}
    </div>`;
  const rights = `<details class="ed-box"><summary>Quelle und Rechte</summary>
      ${edField('Herkunft', `<textarea data-ed="citation" rows="2" maxlength="1000">${esc(x.sources[0]?.citation || '')}</textarea>`, 'z. B. „Eigener Text“ oder „Video von …, YouTube“')}
      ${edField(
        'Nutzungsrechte',
        edSel('rights', x.sources[0]?.rights || 'own', [
          ['own', 'Eigener Inhalt'],
          ['cleared', 'Nutzung geklärt'],
          ['needs_review', 'Noch zu prüfen (nicht teilbar)']
        ])
      )}
    </details>`;
  if (x.kind === 'vocabulary') {
    const lines = x.entries
      .map(
        w => w.target + ' = ' + w.translations.join(' / ') + (w.example ? ' | ' + w.example : '')
      )
      .join('\n');
    return `${head}<section class="ed-box"><h3>Wörter</h3>
      <p class="small muted">Eine Zeile pro Eintrag: <code>Wort = Übersetzung | Beispielsatz</code>. Mehrere Übersetzungen mit „/“ trennen; der Beispielsatz ist freiwillig.</p>
      <textarea data-ed="lines" class="ed-lines" rows="14" spellcheck="false" placeholder="la stazione = der Bahnhof | Il treno parte dalla stazione.">${esc(lines)}</textarea>
      <p class="small muted" id="ed-count">${plural(x.entries.length, 'Eintrag', 'Einträge')}</p></section>${rights}`;
  }
  const m = x.media;
  const mediaFields =
    m.type === 'youtube'
      ? `${edField('YouTube-Link', `<input data-ed="youtube" inputmode="url" value="${m.videoId ? 'https://youtu.be/' + esc(m.videoId) : ''}" placeholder="https://www.youtube.com/watch?v=…">`)}
         <div class="ed-grid">${edField('Beginn (mm:ss, optional)', `<input data-ed="start" inputmode="numeric" value="${edTime(m.start)}" placeholder="0:00">`)}${edField('Ende (mm:ss, optional)', `<input data-ed="end" inputmode="numeric" value="${edTime(m.end)}" placeholder="2:30">`)}</div>`
      : m.type === 'audio'
        ? edField(
            'Adresse der Audiodatei',
            `<input data-ed="audio" inputmode="url" value="${esc(m.url || '')}" placeholder="https://…/aufnahme.mp3">`,
            'Die Datei muss öffentlich erreichbar sein (https).'
          )
        : m.type === 'speech'
          ? edField(
              'Text, den der Browser vorliest',
              `<textarea data-ed="speech" rows="5" maxlength="4000">${esc(m.text || '')}</textarea>`
            )
          : `<p class="small muted">Dieses Medium (${esc(m.type)}) lässt sich im Bereich „Alles bearbeiten (JSON)“ ändern.</p>`;
  const qs = x.questions.map((q, i) => edQuestionHTML(q, i, x.questions.length)).join('');
  return `${head}
    <section class="ed-box"><h3>Medium</h3>
      ${edField('Art', edSel('mediaType', ['youtube', 'audio', 'speech'].includes(m.type) ? m.type : m.type, [['youtube', 'YouTube-Video'], ['audio', 'Audiodatei (Link)'], ['speech', 'Text vorlesen lassen'], ...(['youtube', 'audio', 'speech'].includes(m.type) ? [] : [[m.type, m.type]])]))}
      ${mediaFields}
      <details><summary>Transkript (optional)</summary>${edField('', `<textarea data-ed="transcript" rows="6" maxlength="40000">${esc(x.transcript || '')}</textarea>`, 'Lernende können es als Hilfe öffnen. Liedtexte nur, wenn du sie verwenden darfst.')}</details>
    </section>
    <section class="ed-box"><h3>Aufgaben <span class="muted">(${x.questions.length})</span></h3>${qs}
      <p class="ed-add-h">Aufgabe hinzufügen</p>
      ${FORMAT_GROUPS.map(([g, list]) => `<p class="ed-add-g">${esc(g)}</p><div class="ed-add">${list.map(([t, d]) => `<button class="button secondary" data-ed-add="${t}" title="${esc(d)}">+&nbsp;${esc(edTypeLabel(t))}</button>`).join('')}</div>`).join('')}
    </section>${rights}`;
}
/* Schnelleingabe als Text: Lücken in eckigen Klammern, Paare mit „=“, Reihenfolge zeilenweise. */
function edGapText(q) {
  let i = 0;
  return String(q.text || '').replace(/\[\[([a-z0-9-]+)\]\]/g, (m, id) => {
    const g = q.gaps.find(x => x.id === id) || q.gaps[i];
    i++;
    return '[' + (g ? g.acceptedAnswers.join(' / ') : '') + ']';
  });
}
function edParseGaps(q, raw) {
  q.gaps = [];
  q.text = raw.replace(/\[([^\[\]]*)\]/g, (m, inner) => {
    const answers = inner.split('/').map(a => a.trim()).filter(Boolean);
    if (!answers.length) return m;
    const id = 'g' + (q.gaps.length + 1);
    q.gaps.push({ id, acceptedAnswers: answers });
    return '[[' + id + ']]';
  });
}
/* Lückentext mit Auswahl: [richtig | falsch | falsch] */
function edChoiceText(q) {
  let i = 0;
  return String(q.text || '').replace(/\[\[([a-z0-9-]+)\]\]/g, (m, id) => {
    const g = q.gaps.find(x => x.id === id) || q.gaps[i];
    i++;
    return g ? '[' + [g.answer, ...g.options.filter(o => o !== g.answer)].join(' | ') + ']' : '[]';
  });
}
function edParseChoice(q, raw) {
  q.gaps = [];
  q.text = raw.replace(/\[([^\[\]]*)\]/g, (m, inner) => {
    const opts = inner.split('|').map(a => a.trim()).filter(Boolean);
    if (opts.length < 2) return m;
    const id = 'g' + (q.gaps.length + 1);
    q.gaps.push({ id, options: [...new Set(opts)], answer: opts[0] });
    return '[[' + id + ']]';
  });
}
/* Fehler korrigieren: [falsch > richtig / Variante] */
function edErrorText(q) {
  let i = 0;
  return String(q.text || '').replace(/\[\[([a-z0-9-]+)\]\]/g, (m, id) => {
    const e = q.errors.find(x => x.id === id) || q.errors[i];
    i++;
    return e ? '[' + e.wrong + ' > ' + e.acceptedAnswers.join(' / ') + ']' : '[]';
  });
}
function edParseErrors(q, raw) {
  q.errors = [];
  q.text = raw.replace(/\[([^\[\]]*)\]/g, (m, inner) => {
    const [wrong, right = ''] = inner.split('>');
    const answers = right.split('/').map(a => a.trim()).filter(Boolean);
    if (!wrong.trim() || !answers.length) return m;
    const id = 'e' + (q.errors.length + 1);
    q.errors.push({ id, wrong: wrong.trim(), acceptedAnswers: answers });
    return '[[' + id + ']]';
  });
}
/* Tabelle: erste Zeile Spaltenköpfe, dann Zeilen; Zellen mit „|“ getrennt, Lösungen in [ ]. */
function edTableText(q) {
  return [q.columns.join(' | '), ...q.rows.map(r => r.map(c => (typeof c === 'string' ? c : '[' + c.acceptedAnswers.join(' / ') + ']')).join(' | '))].join('\n');
}
function edParseTable(q, raw) {
  const lines = edLinesOf(raw);
  q.columns = (lines[0] || '').split('|').map(c => c.trim()).slice(0, 5);
  let n = 0;
  q.rows = lines.slice(1, 13).map(l => {
    const cells = l.split('|').map(c => c.trim());
    while (cells.length < q.columns.length) cells.push('');
    return cells.slice(0, q.columns.length).map(c => {
      const m = c.match(/^\[(.*)\]$/);
      if (!m) return c;
      const answers = m[1].split('/').map(a => a.trim()).filter(Boolean);
      return answers.length ? { id: 't' + ++n, acceptedAnswers: answers } : c;
    });
  });
}
/* Zuordnen in Gruppen: Kategorien zeilenweise, Elemente „Text = Kategorie“. */
function edParseCats(q, catsRaw, itemsRaw) {
  if (catsRaw !== null) q.categories = edLinesOf(catsRaw).slice(0, 5).map((label, j) => ({ id: 'k' + (j + 1), label }));
  if (itemsRaw !== null)
    q.items = edLinesOf(itemsRaw).slice(0, 12).map((l, j) => {
      const k = l.lastIndexOf('=');
      const text = (k < 0 ? l : l.slice(0, k)).trim(), cat = k < 0 ? '' : l.slice(k + 1).trim().toLowerCase();
      return { id: 's' + (j + 1), text, category: (q.categories.find(c => c.label.toLowerCase() === cat) || {}).id || '', _cat: cat };
    });
  else q.items.forEach(it => (it.category = (q.categories.find(c => c.label.toLowerCase() === it._cat) || q.categories.find(c => c.id === it.category) || {}).id || ''));
}
const edLinesOf = v => String(v).split('\n').map(l => l.trim()).filter(Boolean);
function edQuestionHTML(q, i, n) {
  const tools = `<span class="ed-qtools"><button class="quiet" data-ed-qmove="${i}" data-dir="-1" aria-label="Nach oben" ${i === 0 ? 'disabled' : ''}>↑</button><button class="quiet" data-ed-qmove="${i}" data-dir="1" aria-label="Nach unten" ${i === n - 1 ? 'disabled' : ''}>↓</button><button class="quiet" data-ed-qdel="${i}" aria-label="Aufgabe löschen">✕</button></span>`;
  const editable = edTypes().some(([t]) => t === q.type);
  let body = '';
  if (!editable)
    body = `<p class="small muted">${esc(LISTENING_FORMAT_LABELS[q.type] || q.type)}: Diese Aufgabe lässt sich im Bereich „Alles bearbeiten (JSON)“ ändern.</p>`;
  else if (q.type === 'single_choice')
    body =
      `<div class="ed-options">${q.options
        .map(
          o =>
            `<label class="ed-option"><input type="radio" name="ed-c-${i}" data-ed-q="${i}" data-k="correct" value="${esc(o.id)}" ${o.id === q.correctOptionId ? 'checked' : ''} aria-label="Richtige Antwort"><input data-ed-q="${i}" data-k="option" data-o="${esc(o.id)}" value="${esc(o.text)}" maxlength="500" placeholder="Antwort"></label>`
        )
        .join('')}</div>` +
      (q.options.length < 6 ? `<button class="quiet" data-ed-opt="${i}">+ Antwort</button>` : '') +
      '<small class="muted">Kreis = richtige Antwort. Leere Antworten werden ignoriert.</small>';
  else if (q.type === 'multiple_choice')
    body =
      `<div class="ed-options">${q.options
        .map(
          o =>
            `<label class="ed-option"><input type="checkbox" data-ed-q="${i}" data-k="correctMulti" value="${esc(o.id)}" ${(q.correctOptionIds || []).includes(o.id) ? 'checked' : ''} aria-label="Richtige Antwort"><input data-ed-q="${i}" data-k="option" data-o="${esc(o.id)}" value="${esc(o.text)}" maxlength="500" placeholder="Antwort"></label>`
        )
        .join('')}</div>` +
      (q.options.length < 8 ? `<button class="quiet" data-ed-opt="${i}">+ Antwort</button>` : '') +
      '<small class="muted">Häkchen = richtig. Mindestens eine Antwort muss falsch sein. Leere Antworten werden ignoriert.</small>';
  else if (q.type === 'gap_fill')
    body =
      edField(
        'Text mit Lücken',
        `<textarea data-ed-q="${i}" data-k="gaptext" rows="${Math.min(10, Math.max(3, Math.ceil(edGapText(q).length / 70)))}" placeholder="Il treno parte alle [sette / 7] dal binario [tre / 3].">${esc(edGapText(q))}</textarea>`,
        'Lösung in eckige Klammern setzen. Mehrere richtige Schreibweisen mit „/“ trennen. Auch längere Texte mit bis zu 15 Lücken.'
      ) +
      `<label class="dlg-check"><input type="checkbox" data-ed-q="${i}" data-k="wordBank" ${q.wordBank ? 'checked' : ''}><span>Wortkasten anzeigen (Lösungswörter zum Auswählen)</span></label>` +
      (q.wordBank ? edField('Zusätzliche Wörter im Wortkasten (optional)', `<textarea data-ed-q="${i}" data-k="extraWords" rows="2" placeholder="eine Zeile pro Wort">${esc((q.extraWords || []).join('\n'))}</textarea>`, 'Ablenker, die nicht in den Text gehören. Höchstens 8.') : '');
  else if (q.type === 'sentence_completion')
    body = edField(
      'Sätze · „Satzanfang = Lösung / Variante“',
      `<textarea data-ed-q="${i}" data-k="scItems" rows="4" placeholder="Sofia e Luca si incontrano = in Piazza Castello / in piazza\nDopo il gelato vanno = al parco / nel parco">${esc(q.items.map(it => it.start + ' = ' + it.acceptedAnswers.join(' / ')).join('\n'))}</textarea>`,
      'Eine Zeile pro Satz. Als richtig gilt, wenn die Ergänzung eine der Lösungen enthält; kurze Schlüsselwörter genügen. 1 bis 8 Sätze.'
    );
  else if (q.type === 'matching')
    body =
      edField(
        'Paare · eine Zeile pro Paar',
        `<textarea data-ed-q="${i}" data-k="pairs" rows="4" placeholder="Giulia = invita Paolo al cinema\nPaolo = ha l’allenamento">${esc(q.pairs.map(p => p.left + ' = ' + p.right).join('\n'))}</textarea>`,
        'Links = rechts. Die rechte Seite wird für die Lernenden gemischt. 2 bis 8 Paare.'
      ) +
      edField(
        'Zusätzliche falsche Antworten (optional)',
        `<textarea data-ed-q="${i}" data-k="distractors" rows="2" placeholder="eine pro Zeile">${esc((q.distractors || []).join('\n'))}</textarea>`,
        'Erscheinen rechts mit, passen aber zu nichts. Höchstens 4.'
      );
  else if (q.type === 'ordering')
    body = edField(
      'Elemente in der richtigen Reihenfolge · eine Zeile pro Element',
      `<textarea data-ed-q="${i}" data-k="items" rows="4" placeholder="Giulia telefona a Paolo\nPaolo chiede l’orario\nPaolo rifiuta">${esc(q.items.map(x => x.text).join('\n'))}</textarea>`,
      'Die App mischt die Elemente. 3 bis 8 Elemente.'
    );
  else if (q.type === 'true_false_ng')
    body = edField(
      'Die Aussage ist …',
      `<select data-ed-q="${i}" data-k="tfng">${[['true', 'richtig'], ['false', 'falsch'], ['not_given', 'nicht im Text']].map(([v, l]) => `<option value="${v}" ${q.answer === v ? 'selected' : ''}>${l}</option>`).join('')}</select>`
    );
  else if (q.type === 'word_select') {
    const right = q.options.filter(o => q.correctOptionIds.includes(o.id)).map(o => o.text);
    const wrong = q.options.filter(o => !q.correctOptionIds.includes(o.id)).map(o => o.text);
    body =
      edField('Wörter, die vorkommen · eine Zeile pro Wort', `<textarea data-ed-q="${i}" data-k="wsRight" rows="4">${esc(right.join('\n'))}</textarea>`) +
      edField('Wörter, die nicht vorkommen · eine Zeile pro Wort', `<textarea data-ed-q="${i}" data-k="wsWrong" rows="3">${esc(wrong.join('\n'))}</textarea>`, 'Die App mischt beide Listen alphabetisch. Zusammen 4 bis 24 Wörter.');
  } else if (q.type === 'gap_choice')
    body = edField(
      'Text mit Auswahl-Lücken',
      `<textarea data-ed-q="${i}" data-k="choicetext" rows="3" placeholder="Sofia incontra Luca alle [quattro | tre | cinque].">${esc(edChoiceText(q))}</textarea>`,
      'In eckigen Klammern zuerst das richtige Wort, dann die falschen, getrennt mit „|“. Die App mischt die Reihenfolge.'
    );
  else if (q.type === 'note_fill')
    body = edField(
      'Notizen · eine Zeile pro Stichpunkt',
      `<textarea data-ed-q="${i}" data-k="gaptext" rows="4" placeholder="Treffpunkt: Piazza [Castello]\nUhrzeit: alle [quattro / 4]">${esc(edGapText(q))}</textarea>`,
      'Lösungen in eckige Klammern, Varianten mit „/“.'
    );
  else if (q.type === 'error_correction')
    body = edField(
      'Text mit Fehlern',
      `<textarea data-ed-q="${i}" data-k="errortext" rows="3" placeholder="Sofia abita a [Milano > Torino].">${esc(edErrorText(q))}</textarea>`,
      'Jeden Fehler so schreiben: [falsches Wort > richtiges Wort]. Varianten mit „/“.'
    );
  else if (q.type === 'table_fill')
    body = edField(
      'Tabelle',
      `<textarea data-ed-q="${i}" data-k="table" rows="5" spellcheck="false" placeholder="Persona | Gelato | Ora\nSofia | [limone] | [alle sei / 6]\nLuca | [cioccolato] | –">${esc(q.columns.length ? edTableText(q) : '')}</textarea>`,
      'Erste Zeile: Spaltenköpfe. Danach eine Zeile pro Tabellenzeile, Zellen mit „|“ trennen. Zu ergänzende Zellen in [ ], Varianten mit „/“. 2 bis 5 Spalten.'
    );
  else if (q.type === 'speaker_match' || q.type === 'categorize') {
    const who = q.type === 'speaker_match';
    body =
      edField(who ? 'Personen · eine pro Zeile' : 'Kategorien · eine pro Zeile', `<textarea data-ed-q="${i}" data-k="cats" rows="2" placeholder="${who ? 'Sofia\nLuca' : 'vantaggi\nsvantaggi'}">${esc(q.categories.map(c => c.label).join('\n'))}</textarea>`, '2 bis 5.') +
      edField(who ? 'Aussagen · „Aussage = Person“' : 'Begriffe · „Begriff = Kategorie“', `<textarea data-ed-q="${i}" data-k="catItems" rows="4" placeholder="${who ? 'Io ho fame. = Luca' : 'si risparmia tempo = vantaggi'}">${esc(q.items.map(it => it.text + ' = ' + ((q.categories.find(c => c.id === it.category) || {}).label || it._cat || '')).join('\n'))}</textarea>`, who ? 'In der Reihenfolge, in der sie im Hörtext vorkommen. 2 bis 12.' : 'Die App mischt die Begriffe. 2 bis 12.');
  } else if (q.type === 'open_answer')
    body =
      edField('Mögliche Lösung (Erwartungshorizont)', `<textarea data-ed-q="${i}" data-k="model" rows="3">${esc(q.modelAnswer || '')}</textarea>`, 'Lernende sehen sie nach der Korrektur zum Vergleich. Keine automatische Bewertung.') +
      `<div class="ed-grid">${edField('Schreibzeilen im Aufgabenblatt', `<select data-ed-q="${i}" data-k="lines">${[2, 3, 4, 6, 8, 10].map(n => `<option ${n === (q.lines || 4) ? 'selected' : ''}>${n}</option>`).join('')}</select>`)}${edField('Punkte', `<select data-ed-q="${i}" data-k="points">${[1, 2, 3, 4, 5, 6, 8, 10].map(n => `<option ${n === (q.points || 2) ? 'selected' : ''}>${n}</option>`).join('')}</select>`)}</div>`;
  else if (q.type === 'true_false')
    body = edField(
      'Die Aussage ist …',
      `<select data-ed-q="${i}" data-k="tf"><option value="true" ${q.answer ? 'selected' : ''}>richtig</option><option value="false" ${q.answer ? '' : 'selected'}>falsch</option></select>`
    );
  else
    body = edField(
      'Richtige Lösungen · eine pro Zeile',
      `<textarea data-ed-q="${i}" data-k="answers" rows="3">${esc((q.acceptedAnswers || []).join('\n'))}</textarea>`,
      'Groß-/Kleinschreibung und kleine Tippfehler werden toleriert.'
    );
  return `<div class="ed-q"><div class="ed-qhead"><b>${i + 1}</b>${editable ? `<select data-ed-q="${i}" data-k="type">${FORMAT_GROUPS.map(([g, list]) => `<optgroup label="${esc(g)}">${list.map(([t]) => `<option value="${t}" ${t === q.type ? 'selected' : ''}>${esc(edTypeLabel(t))}</option>`).join('')}</optgroup>`).join('')}</select>` : ''}${tools}</div>
    ${edField('Abschnitt', `<select data-ed-q="${i}" data-k="phase"><option value="">ohne Abschnitt</option>${PHASE_LABELS.map(([k, l]) => `<option value="${k}" ${promptPhase(q.prompt)[0] === k ? 'selected' : ''}>${l}</option>`).join('')}</select>`)}
    ${edField(['true_false', 'true_false_ng'].includes(q.type) ? 'Aussage' : ['single_choice', 'multiple_choice', 'short_answer', 'open_answer'].includes(q.type) ? 'Frage' : 'Arbeitsanweisung', `<input data-ed-q="${i}" data-k="prompt" maxlength="1000" value="${esc(promptPhase(q.prompt)[2])}" placeholder="${esc(ED_PROMPT_HINT[q.type] || '')}">`)}
    ${body}
    ${q.evidence ? edEvidenceHTML(q) : ''}
    ${editable ? edField('Erklärung nach der Korrektur (optional)', `<input data-ed-q="${i}" data-k="explanation" maxlength="1500" value="${esc(q.explanation || '')}">`) : ''}
  </div>`;
}
/* Belegzitat der KI: grün, wenn es im Transkript steht; sonst zur Prüfung markiert. */
function edEvidenceHTML(q) {
  const st = edWork?.transcript
    ? DajeKI.evidenceStatus(q.evidence, edWork.transcript)
    : 'ohne-transkript';
  const label =
    {
      ok: 'Beleg im Transkript gefunden',
      fast: 'Beleg fast wörtlich gefunden',
      fehlt: 'Beleg nicht im Transkript gefunden, bitte prüfen',
      'ohne-transkript': 'Beleg (kein Transkript gespeichert)'
    }[st] || 'Beleg';
  return `<p class="ed-evidence ${st}"><b>${label}:</b> „${esc(q.evidence)}“</p>`;
}
function validationHTML() {
  if (!lastValidation) return '';
  const r = lastValidation;
  if (!r.result.ok)
    return (
      '<div class="validation-errors"><b>Bitte zuerst korrigieren</b><ul>' +
      r.result.errors
        .slice(0, 30)
        .map(x => `<li>${esc(x)}</li>`)
        .join('') +
      '</ul></div>'
    );
  const x = r.result.value;
  return `<div class="validation-success"><b>Gültig: ${esc(x.title)}</b><p>${x.kind === 'listening' ? x.questions.length + ' Aufgaben' : x.entries.length + ' Wörter'} · ${portalLang(x.language)} · ${x.level}</p><button class="button primary" data-portal="studio-import">Als eigene Übung übernehmen</button></div>`;
}

/* ---------- Import (Datei oder eingefügt) ---------- */

async function importContentFile(file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) return toast('Höchstens 2 MB pro Datei.');
  edValidateText(await file.text());
  kiOpen = true;
  renderStudio();
  const details = document.querySelector('.ki-advanced');
  if (details) details.open = true;
}
function edValidateText(text) {
  kiOpen = true;
  try {
    lastValidation = { raw: text, result: TheisContent.validatePackage(JSON.parse(text)) };
  } catch {
    lastValidation = {
      raw: text,
      result: {
        ok: false,
        errors: ['Das ist kein lesbares JSON. Prüfe Kommas und Anführungszeichen.']
      }
    };
  }
  renderStudio();
}
function validateEditorText() {
  edValidateText($('studio-json').value);
}
function acceptEditorImport() {
  if (!lastValidation?.result.ok) return;
  const payload = lastValidation.result.value;
  if (
    contentList(payload.kind).some(x => x.id === payload.id) ||
    editorState.items.some(x => edId(x) === payload.id)
  )
    payload.id = edNewId();
  lastValidation = null;
  edCreate(payload, 'Übernommen. Bitte prüfen und bei Bedarf anpassen.');
}
/* Ältere Aufrufe aus portal.js */
function saveEditorForm() {
  edCommit();
}
function publishEditorItem() {
  edToggleCatalog();
}
function edToggleCatalog() {
  const item = edItem();
  if (!item || !edCommit().ok) return;
  if (item.status !== 'published' && item.payload.sources.some(s => s.rights === 'needs_review'))
    return toast('Erst die Rechte klären (Abschnitt „Quelle und Rechte“).');
  item.status = item.status === 'published' ? 'draft' : 'published';
  saveEditorState();
  renderStudio();
  toast(
    item.status === 'published'
      ? 'Erscheint jetzt in deinem Katalog (nur auf diesem Gerät).'
      : 'Nicht mehr im Katalog.'
  );
}

/* ---------- Eingaben ---------- */

function edParseTime(v) {
  const m = String(v)
    .trim()
    .match(/^(\d{1,3})(?::(\d{1,2}))?$/);
  if (!m) return undefined;
  return m[2] === undefined ? Number(m[1]) : Number(m[1]) * 60 + Number(m[2]);
}
function edYouTubeId(v) {
  const s = String(v).trim();
  const m =
    s.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/) ||
    s.match(/^([A-Za-z0-9_-]{11})$/);
  return m ? m[1] : '';
}
function edLines(text) {
  const old = edWork.entries;
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .slice(0, 1000)
    .map((l, i) => {
      const [main, example] = l.split('|').map(s => s.trim());
      const [target, tr] = main.split(/\s*=\s*/);
      const prev = old[i] && old[i].target === (target || '').trim() ? old[i] : {};
      const w = {
        ...prev,
        id: prev.id || 'w' + (i + 1) + '-' + Math.random().toString(36).slice(2, 6),
        target: (target || '').trim(),
        translations: (tr || '')
          .split('/')
          .map(s => s.trim())
          .filter(Boolean)
      };
      if (example) w.example = example;
      else delete w.example;
      if (!w.translations.length) w.translations = ['?'];
      return w;
    })
    .filter(w => w.target);
}
document.addEventListener('input', e => {
  const t = e.target;
  if (!edWork || !t.closest?.('.ed-editor')) return;
  const k = t.dataset.ed;
  const x = edWork;
  if (k === 'title' || k === 'description') x[k] = t.value;
  else if (k === 'citation') x.sources[0].citation = t.value;
  else if (k === 'youtube') x.media.videoId = edYouTubeId(t.value);
  else if (k === 'start' || k === 'end') {
    const s = edParseTime(t.value);
    if (s === undefined) delete x.media[k];
    else x.media[k] = s;
  } else if (k === 'audio') x.media.url = t.value.trim();
  else if (k === 'speech') x.media.text = t.value;
  else if (k === 'transcript') x.transcript = t.value;
  else if (k === 'lines') {
    x.entries = edLines(t.value);
    const c = $('ed-count');
    if (c) c.textContent = plural(x.entries.length, 'Eintrag', 'Einträge');
  } else if (t.dataset.edQ !== undefined) {
    const q = x.questions[Number(t.dataset.edQ)];
    const f = t.dataset.k;
    if (f === 'prompt') q.prompt = promptPhase(q.prompt)[1] + t.value;
    else if (f === 'explanation') q.explanation = t.value;
    else if (f === 'scItems')
      q.items = edLinesOf(t.value).slice(0, 8).map((l, j) => {
        const k = l.lastIndexOf('=');
        const answers = (k < 0 ? '' : l.slice(k + 1)).split('/').map(a => a.trim()).filter(Boolean);
        return { id: 'z' + (j + 1), start: (k < 0 ? l : l.slice(0, k)).trim(), acceptedAnswers: answers, modelAnswer: answers[0] || '' };
      });
    else if (f === 'extraWords') q.extraWords = edLinesOf(t.value).slice(0, 8);
    else if (f === 'option') q.options.find(o => o.id === t.dataset.o).text = t.value;
    else if (f === 'gaptext') edParseGaps(q, t.value);
    else if (f === 'pairs')
      q.pairs = edLinesOf(t.value).slice(0, 8).map((l, j) => {
        const [left, ...rest] = l.split('=');
        return { id: 'p' + (j + 1), left: left.trim(), right: rest.join('=').trim() };
      });
    else if (f === 'distractors') q.distractors = edLinesOf(t.value).slice(0, 4);
    else if (f === 'items') q.items = edLinesOf(t.value).slice(0, 8).map((text, j) => ({ id: 'i' + (j + 1), text }));
    else if (f === 'choicetext') edParseChoice(q, t.value);
    else if (f === 'errortext') edParseErrors(q, t.value);
    else if (f === 'table') edParseTable(q, t.value);
    else if (f === 'cats') edParseCats(q, t.value, null);
    else if (f === 'catItems') edParseCats(q, null, t.value);
    else if (f === 'model') q.modelAnswer = t.value;
    else if (f === 'wsRight' || f === 'wsWrong') {
      const box = t.closest('.ed-q');
      const right = edLinesOf(box.querySelector('[data-k="wsRight"]').value), wrong = edLinesOf(box.querySelector('[data-k="wsWrong"]').value);
      const all = [...new Set([...right, ...wrong])].slice(0, 24).sort((a, b) => a.localeCompare(b));
      q.options = all.map((text, j) => ({ id: 'w' + (j + 1), text }));
      q.correctOptionIds = q.options.filter(o => right.includes(o.text)).map(o => o.id);
    }
    else if (f === 'answers') {
      q.acceptedAnswers = t.value
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      q.modelAnswer = q.acceptedAnswers[0] || '';
    } else return;
  } else return;
  edSoon();
});
document.addEventListener('change', e => {
  const t = e.target;
  if (!edWork || !t.closest?.('.ed-editor')) return;
  const x = edWork;
  const k = t.dataset.ed;
  if (k === 'language' || k === 'level') x[k] = t.value;
  else if (k === 'rights') x.sources[0].rights = t.value;
  else if (k === 'mediaType') {
    x.media =
      t.value === 'youtube'
        ? { type: 'youtube', videoId: '' }
        : t.value === 'audio'
          ? { type: 'audio', url: '' }
          : { type: 'speech', text: '' };
    edCommit();
    return renderStudio();
  } else if (t.dataset.edQ !== undefined) {
    const i = Number(t.dataset.edQ),
      q = x.questions[i];
    if (t.dataset.k === 'correct') q.correctOptionId = t.value;
    else if (t.dataset.k === 'tfng') q.answer = t.value;
    else if (t.dataset.k === 'phase') {
      const L = PHASES[x.language] || PHASES.it;
      q.prompt = (t.value ? L[t.value] + ': ' : '') + promptPhase(q.prompt)[2];
    } else if (t.dataset.k === 'wordBank') {
      if (t.checked) q.wordBank = true;
      else delete q.wordBank;
      edCommit();
      return renderStudio();
    }
    else if (t.dataset.k === 'lines') q.lines = Number(t.value);
    else if (t.dataset.k === 'points') q.points = Number(t.value);
    else if (t.dataset.k === 'correctMulti') {
      const set = new Set(q.correctOptionIds || []);
      if (t.checked) set.add(t.value);
      else set.delete(t.value);
      q.correctOptionIds = q.options.map(o => o.id).filter(id => set.has(id));
    }
    else if (t.dataset.k === 'tf') q.answer = t.value === 'true';
    else if (t.dataset.k === 'type') {
      const fresh = edQuestion(t.value, 0);
      const choice = ['single_choice', 'multiple_choice'];
      if (choice.includes(q.type) && choice.includes(t.value)) {
        const opts = q.options.length >= (t.value === 'multiple_choice' ? 3 : 2) ? q.options : fresh.options;
        if (t.value === 'multiple_choice') Object.assign(fresh, { options: opts, correctOptionIds: q.correctOptionId ? [q.correctOptionId] : [] });
        else Object.assign(fresh, { options: opts.slice(0, 6), correctOptionId: (q.correctOptionIds || [])[0] || 'a' });
      }
      x.questions[i] = { ...fresh, id: q.id, prompt: q.prompt, explanation: q.explanation || '' };
      edCommit();
      return renderStudio();
    } else return;
  } else return;
  edCommit();
});
document.addEventListener('click', e => {
  const b = e.target.closest(
    '[data-ed-new],[data-ed-open],[data-ed-act],[data-ed-add],[data-ed-qmove],[data-ed-qdel],[data-ed-opt],[data-ed-copy],[data-ed-edit]'
  );
  if (!b) return;
  if (b.dataset.edNew) return edCreate(edBlank(b.dataset.edNew));
  if (b.dataset.edCopy) return edCopyFrom(b.dataset.edCopy);
  if (b.dataset.edEdit) {
    studioSelection = b.dataset.edEdit;
    edWork = null;
    return nav('redaktion');
  }
  if (b.dataset.edOpen) {
    if (edWork) edCommit();
    studioSelection = b.dataset.edOpen;
    edWork = null;
    renderStudio();
    return document.querySelector('.ed-editor')?.scrollIntoView({ block: 'start' });
  }
  const x = edWork;
  if (!x) return;
  if (b.dataset.edAdd) {
    const n =
      Math.max(0, ...x.questions.map(q => Number(String(q.id).replace(/\D/g, '')) || 0)) + 1;
    const fresh = edQuestion(b.dataset.edAdd, n);
    const prev = x.questions[x.questions.length - 1];
    if (prev) fresh.prompt = promptPhase(prev.prompt)[1];
    x.questions.push(fresh);
    edCommit();
    renderStudio();
    return document
      .querySelectorAll('.ed-q')
      [x.questions.length - 1]?.querySelector('[data-k="prompt"]')
      ?.focus();
  }
  if (b.dataset.edQmove !== undefined) {
    const i = Number(b.dataset.edQmove),
      j = i + Number(b.dataset.dir);
    [x.questions[i], x.questions[j]] = [x.questions[j], x.questions[i]];
    edCommit();
    return renderStudio();
  }
  if (b.dataset.edQdel !== undefined) {
    if (!confirm('Diese Aufgabe löschen?')) return;
    x.questions.splice(Number(b.dataset.edQdel), 1);
    edCommit();
    return renderStudio();
  }
  if (b.dataset.edOpt !== undefined) {
    const q = x.questions[Number(b.dataset.edOpt)];
    const id = 'abcdefgh'.split('').find(c => !q.options.some(o => o.id === c));
    q.options.push({ id, text: '' });
    edCommit();
    return renderStudio();
  }
  const a = b.dataset.edAct;
  const item = edItem();
  if (a === 'preview' && edCommit().ok) {
    if (item.payload.kind === 'listening') return openListening(item.payload.id, true);
    return edPreviewWords(item.payload);
  }
  if (a === 'share') return edShare();
  if (a === 'submit') return edSubmit();
  if (a === 'catalog') return edToggleCatalog();
  if (a === 'export' && edCommit().ok) return downloadJSON(item.payload, item.payload.id + '.json');
  if (
    a === 'delete' &&
    confirm('„' + x.title + '“ endgültig löschen? Das lässt sich nicht rückgängig machen.')
  ) {
    editorState.items = editorState.items.filter(y => y !== item);
    saveEditorState();
    studioSelection = null;
    edWork = null;
    renderStudio();
  }
});
function edPreviewWords(p) {
  let d = $('ed-preview-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'ed-preview-dialog';
    document.body.append(d);
  }
  d.innerHTML = `<div class="dialog-head"><h2>${esc(p.title)}</h2><button class="button secondary" data-close="ed-preview-dialog">Schließen</button></div>${p.entries.map(w => `<p><b>${esc(w.target)}</b> · ${esc(w.translations.join(' / '))}${w.example ? `<br><small class="muted">${esc(w.example)}</small>` : ''}</p>`).join('')}`;
  d.showModal();
}

/* ---------- Schnellweg: Hörübung mit KI (Chat ohne API-Schlüssel) ----------
   1 Medium + Transkript eintragen → 2 Auftrag kopieren und im Chat (Gemini, ChatGPT, Claude) einfügen →
   3 Antwort hier einfügen → daje ergänzt Technik, prüft Belege und legt die Übung an.
   Die Eingaben bleiben gespeichert, auch wenn das iPad beim Wechsel in die Chat-App die Seite neu lädt. */
const KI_KEY = 'daje-ki-entwurf-v1';
const KI_DEFAULT = {
  url: '',
  language: 'it',
  level: 'A2',
  kind: 'video',
  count: '12',
  start: '',
  end: '',
  transcript: '',
  wishes: '',
  answer: '',
  showTranscript: true,
  structure: 'durchgaenge'
};
let kiForm = null; // erst bei Bedarf laden (read/save stehen in app.js, das später geladen wird)
const kiState = () => (kiForm ??= Object.assign({}, KI_DEFAULT, read(KI_KEY, {})));
const KI_CHATS = [
  ['Gemini', 'https://gemini.google.com/app'],
  ['ChatGPT', 'https://chatgpt.com/'],
  ['Claude', 'https://claude.ai/new']
];
function kiPanelHTML() {
  const f = kiState();
  const langs = Object.entries(TheisContent.LANGUAGES);
  const sel = (k, list) =>
    `<select data-ki="${k}">${list.map(([v, t]) => `<option value="${esc(v)}" ${String(f[k]) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  return `<section class="ed-ki" aria-label="Hörübung mit KI erstellen">
    <div class="ki-step"><span class="ki-n">1</span><div>
      <h3>Medium und Transkript</h3>
      <div class="ed-grid">
        <label class="field">YouTube-Link oder Audio-Adresse<input data-ki="url" inputmode="url" value="${esc(f.url)}" placeholder="https://www.youtube.com/watch?v=…"></label>
        <label class="field">Sprache${sel('language', langs)}</label>
        <label class="field">Niveau${sel(
          'level',
          ED_LEVELS.map(l => [l, l])
        )}</label>
        <label class="field">Art${sel('kind', [
          ['video', 'Video / Beitrag'],
          ['audio', 'Audio'],
          ['lied', 'Lied'],
          ['film', 'Filmszene']
        ])}</label>
        <label class="field">Aufgaben${sel('count', [
          ['8', 'kurz · etwa 8'],
          ['12', 'normal · etwa 12'],
          ['16', 'ausführlich · etwa 16']
        ])}</label>
        <label class="field">Aufbau${sel('structure', [
          ['durchgaenge', '1., 2., 3. Hören (global → Detail)'],
          ['phasen', 'vor / während / nach dem Hören']
        ])}</label>
        <label class="field">Ausschnitt (optional)<span class="ki-range"><input data-ki="start" inputmode="numeric" value="${esc(f.start)}" placeholder="von 0:00"><input data-ki="end" inputmode="numeric" value="${esc(f.end)}" placeholder="bis 2:30"></span></label>
      </div>
      <label class="field">Transkript<textarea data-ki="transcript" rows="7" placeholder="Transkript hier einfügen …">${esc(f.transcript)}</textarea></label>
      <details class="ki-help"><summary>So kopierst du das Transkript bei YouTube</summary><p>Unter dem Video auf „… mehr“ tippen, dann „Transkript anzeigen“. Im Transkript-Fenster den Text markieren und kopieren (am Computer: hineinklicken, Strg/⌘ + A, Strg/⌘ + C). Zeitmarken dürfen mitkopiert werden. Ohne Transkript kann nur Gemini das Video selbst anhören, das ist aber weniger zuverlässig.</p></details>
      <label class="field">Wünsche (optional)<input data-ki="wishes" value="${esc(f.wishes)}" placeholder="z. B. Schwerpunkt Wortschatz Essen, Klasse 9"></label>
      <label class="dlg-check"><input type="checkbox" data-ki="showTranscript" ${f.showTranscript ? 'checked' : ''}><span>Transkript in der Übung als Hilfe anzeigen (bei Liedern und Filmen aus)</span></label>
    </div></div>
    <div class="ki-step"><span class="ki-n">2</span><div>
      <h3>Auftrag an die KI</h3>
      <p class="muted small">Kopiert die Anleitung und deine Angaben in einem Stück. Im Chat einfügen und absenden.</p>
      <div class="ki-actions"><button class="button primary" data-ki-copy>Auftrag kopieren</button>${KI_CHATS.map(([n, u]) => `<a class="button secondary" href="${u}" target="_blank" rel="noopener">${n} öffnen</a>`).join('')}</div>
      <p class="small" id="ki-copy-status" role="status"></p>
    </div></div>
    <div class="ki-step"><span class="ki-n">3</span><div>
      <h3>Antwort der KI einfügen</h3>
      <label class="field"><textarea data-ki="answer" rows="6" spellcheck="false" placeholder="Die ganze Antwort hier einfügen, auch mit Text davor oder danach.">${esc(f.answer)}</textarea></label>
      <div class="ki-actions"><button class="button primary" data-ki-build>Übung anlegen</button><button class="quiet" data-ki-reset>Formular leeren</button></div>
      <div id="ki-result" role="status"></div>
    </div></div>
    <details class="ed-box ki-advanced"><summary>Fertiges Paket importieren (JSON, für Fortgeschrittene)</summary>
      <div class="studio-downloads"><a class="button secondary" href="imports/KI-Kommandodatei.md" download>KI-Kommandodatei</a><a class="button secondary" href="imports/KI-Wortschatz.md" download>Kommandodatei Wortschatz</a><button class="button secondary" data-portal="studio-load">Datei auswählen</button></div>
      <label class="field">JSON einfügen<textarea id="studio-json" rows="5" maxlength="2000000" spellcheck="false" placeholder="{ ... }">${esc(lastValidation?.raw || '')}</textarea></label>
      <button class="button secondary" data-portal="studio-validate">Prüfen</button>
      <div id="studio-validation" role="status">${validationHTML()}</div>
    </details>
  </section>`;
}
function kiInputs() {
  const f = kiState();
  const t = v => (String(v).trim() ? edParseTime(v) : undefined);
  return {
    mediaUrl: f.url.trim(),
    language: f.language,
    level: f.level,
    kind: f.kind,
    count: f.count,
    start: t(f.start),
    end: t(f.end),
    startText: f.start,
    endText: f.end,
    transcript: f.transcript,
    wishes: f.wishes,
    structure: f.structure,
    keepTranscript: f.showTranscript && !['lied', 'film'].includes(f.kind),
    transcriptOrigin: /\d:\d\d/.test(f.transcript) ? 'provider' : 'own'
  };
}
let kiCommand = null;
async function kiCopy() {
  const status = $('ki-copy-status');
  try {
    if (!kiForm.url.trim())
      throw new Error('Bitte zuerst den Link zum Video oder Audio eintragen.');
    if (!kiForm.transcript.trim())
      status.textContent =
        'Hinweis: Ohne Transkript kann nur Gemini das Video selbst anhören. Mit Transkript wird es deutlich besser.';
    if (!kiCommand) {
      const r = await fetch('imports/KI-Kommandodatei.md', { cache: 'no-cache' });
      if (!r.ok) throw new Error('Die Kommandodatei konnte nicht geladen werden.');
      kiCommand = await r.text();
    }
    const text = DajeKI.promptFor(kiCommand, kiInputs());
    try {
      await navigator.clipboard.writeText(text);
      status.textContent =
        (status.textContent ? status.textContent + ' ' : '') +
        'Auftrag kopiert (' +
        Math.round(text.length / 1000) +
        '000 Zeichen). Jetzt im Chat einfügen und absenden.';
    } catch {
      status.innerHTML =
        'Kopieren wurde blockiert. Bitte hier markieren und kopieren:<textarea class="ki-fallback" rows="5" readonly>' +
        esc(text) +
        '</textarea>';
      status.querySelector('textarea').select();
    }
  } catch (err) {
    status.textContent = err.message;
  }
}
function kiBuild() {
  const out = $('ki-result');
  try {
    const ai = DajeKI.extractJSON(kiForm.answer);
    const r = DajeKI.buildPackage(ai, kiInputs(), TheisContent.validatePackage);
    const pkg = r.result && r.result.ok ? r.result.value : r.pkg;
    const found = r.evidence.filter(e => e.status === 'ok' || e.status === 'fast').length;
    const need = r.evidence.filter(e => e.status !== 'vorab').length;
    const msg = `${plural(pkg.questions.length, 'Aufgabe', 'Aufgaben')} angelegt. ${kiForm.transcript.trim() ? `Belege im Transkript gefunden: ${found} von ${need}.` : 'Ohne Transkript konnten die Belege nicht geprüft werden.'}`;
    kiOpen = false;
    kiForm.answer = '';
    save(KI_KEY, kiForm);
    edCreate(pkg, msg);
    if (r.warnings.length || !r.result?.ok) toast(msg + ' Bitte die markierten Aufgaben prüfen.');
  } catch (err) {
    out.innerHTML = `<div class="validation-errors"><b>Noch nicht übernommen</b><p>${esc(err.message)}</p></div>`;
  }
}
document.addEventListener('input', e => {
  const k = e.target.dataset?.ki;
  if (!k) return;
  kiState();
  kiForm[k] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  if (k === 'kind' && ['lied', 'film'].includes(kiForm.kind)) {
    kiForm.showTranscript = false;
    const c = document.querySelector('[data-ki="showTranscript"]');
    if (c) c.checked = false;
  }
  save(KI_KEY, kiForm);
});
document.addEventListener('change', e => {
  if (e.target.dataset?.ki) e.target.dispatchEvent(new Event('input', { bubbles: true }));
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ki-open],[data-ki-copy],[data-ki-build],[data-ki-reset]');
  if (!b) return;
  if (b.hasAttribute('data-ki-open')) {
    kiOpen = !kiOpen;
    if (kiOpen) vkOpen = false;
    renderStudio();
    if (kiOpen) document.querySelector('.ed-ki')?.scrollIntoView({ block: 'start' });
  } else if (b.hasAttribute('data-ki-copy')) kiCopy();
  else if (b.hasAttribute('data-ki-build')) kiBuild();
  else if (confirm('Alle Eingaben im Formular löschen?')) {
    kiForm = { ...kiForm, url: '', start: '', end: '', transcript: '', wishes: '', answer: '' };
    save(KI_KEY, kiForm);
    renderStudio();
  }
});

/* ---------- Schnellweg: Wortliste mit KI ----------
   Quelle Buchseiten (Fotos im Chat anhängen) oder ein Text (z. B. Oberstufe ohne Vokabelteil).
   Ablauf wie bei der Hörübung: Angaben → Auftrag kopieren → Antwort einfügen → Liste prüfen. */
const VK_KEY = 'daje-ki-wortschatz-v1';
const VK_DEFAULT = { mode: 'buch', language: 'it', level: 'A2', collection: '', section: '', pages: '', grade: '', count: '25', text: '', wishes: '', answer: '' };
let vkOpen = false,
  vkForm = null,
  vkCommand = null;
const vkState = () => (vkForm ??= Object.assign({}, VK_DEFAULT, read(VK_KEY, {})));
function vkPanelHTML() {
  const f = vkState();
  const book = f.mode === 'buch';
  const sel = (k, list) =>
    `<select data-vk="${k}">${list.map(([v, t]) => `<option value="${esc(v)}" ${String(f[k]) === String(v) ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
  const inp = (k, label, ph, extra = '') => `<label class="field">${label}<input data-vk="${k}" value="${esc(f[k])}" placeholder="${esc(ph)}" ${extra}></label>`;
  return `<section class="ed-ki" aria-label="Wortliste mit KI erstellen">
    <div class="ki-step"><span class="ki-n">1</span><div>
      <h3>Woher kommen die Wörter?</h3>
      <div class="dlg-seg ki-mode">${[['buch', 'Schulbuchseiten (Fotos)'], ['text', 'Aus einem Text']].map(([v, l]) => `<label><input type="radio" name="vk-mode" data-vk="mode" value="${v}" ${f.mode === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>
      <div class="ed-grid">
        <label class="field">Sprache${sel('language', Object.entries(TheisContent.LANGUAGES))}</label>
        <label class="field">Niveau${sel('level', ED_LEVELS.map(l => [l, l]))}</label>
        ${inp('collection', book ? 'Lehrwerk' : 'Sammlung', book ? 'z. B. Ecco più 2' : 'z. B. Oberstufe Q11')}
        ${inp('section', book ? 'Abschnitt' : 'Titel der Liste', book ? 'z. B. Unità 3 · 3a' : 'z. B. Lettura: Le città invisibili')}
        ${book ? inp('pages', 'Seiten', 'z. B. 170–171', 'inputmode="numeric"') : `<label class="field">Umfang${sel('count', [['15', 'knapp · etwa 15'], ['25', 'normal · etwa 25'], ['40', 'ausführlich · etwa 40']])}</label>`}
        <label class="field">Klassenstufe (optional)${sel('grade', [['', '–'], ...[5, 6, 7, 8, 9, 10, 11, 12, 13].map(n => [String(n), String(n)])])}</label>
      </div>
      ${book ? '<p class="ki-help">Die Fotos der Vokabelseiten hängst du in Schritt 2 direkt im Chat an (Büroklammer oder Plus-Zeichen). Gut lesbar, gerade fotografiert, eine Doppelseite pro Foto.</p>' : `<label class="field">Text<textarea data-vk="text" rows="8" placeholder="Text hier einfügen …">${esc(f.text)}</textarea></label>`}
      <label class="field">Wünsche (optional)<input data-vk="wishes" value="${esc(f.wishes)}" placeholder="${book ? 'z. B. nur Abschnitt 3a' : 'z. B. Schwerpunkt Verben mit Präposition'}"></label>
    </div></div>
    <div class="ki-step"><span class="ki-n">2</span><div>
      <h3>Auftrag an die KI</h3>
      <p class="muted small">${book ? 'Auftrag kopieren, im Chat die Fotos anhängen, Auftrag einfügen und absenden.' : 'Auftrag kopieren, im Chat einfügen und absenden. Der Text ist schon enthalten.'}</p>
      <div class="ki-actions"><button class="button primary" data-vk-copy>Auftrag kopieren</button>${KI_CHATS.map(([n, u]) => `<a class="button secondary" href="${u}" target="_blank" rel="noopener">${n} öffnen</a>`).join('')}</div>
      <p class="small" id="vk-copy-status" role="status"></p>
    </div></div>
    <div class="ki-step"><span class="ki-n">3</span><div>
      <h3>Antwort der KI einfügen</h3>
      <label class="field"><textarea data-vk="answer" rows="6" spellcheck="false" placeholder="Die ganze Antwort hier einfügen, auch mit Text davor oder danach.">${esc(f.answer)}</textarea></label>
      <div class="ki-actions"><button class="button primary" data-vk-build>Wortliste anlegen</button><button class="quiet" data-vk-reset>Formular leeren</button></div>
      <div id="vk-result" role="status"></div>
    </div></div>
  </section>`;
}
function vkInputs() {
  const f = vkState();
  return { ...f, collection: f.collection.trim(), section: f.section.trim(), pages: f.pages.trim() };
}
async function vkCopy() {
  const status = $('vk-copy-status');
  try {
    if (vkForm.mode === 'text' && !vkForm.text.trim()) throw new Error('Bitte zuerst den Text einfügen.');
    if (!vkCommand) {
      const r = await fetch('imports/KI-Wortschatz.md', { cache: 'no-cache' });
      if (!r.ok) throw new Error('Die Kommandodatei konnte nicht geladen werden.');
      vkCommand = await r.text();
    }
    const text = DajeKI.promptForVocab(vkCommand, vkInputs());
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = vkForm.mode === 'buch' ? 'Auftrag kopiert. Im Chat zuerst die Fotos anhängen, dann den Auftrag einfügen und absenden.' : 'Auftrag kopiert. Jetzt im Chat einfügen und absenden.';
    } catch {
      status.innerHTML = 'Kopieren wurde blockiert. Bitte hier markieren und kopieren:<textarea class="ki-fallback" rows="5" readonly>' + esc(text) + '</textarea>';
      status.querySelector('textarea').select();
    }
  } catch (err) {
    status.textContent = err.message;
  }
}
function vkBuild() {
  const out = $('vk-result');
  try {
    const ai = DajeKI.extractJSON(vkForm.answer);
    const r = DajeKI.buildVocabulary(ai, { ...vkInputs(), id: edNewId() }, TheisContent.validatePackage);
    const pkg = r.result && r.result.ok ? r.result.value : r.pkg;
    const found = r.evidence.filter(e => e.status === 'ok' || e.status === 'fast').length;
    const msg = `${plural(pkg.entries.length, 'Wort', 'Wörter')} angelegt.${r.evidence.length ? ` Im Text gefunden: ${found} von ${r.evidence.length}.` : ''}`;
    vkOpen = false;
    vkForm.answer = '';
    save(VK_KEY, vkForm);
    edCreate(pkg, msg);
    if (r.warnings.length || !r.result?.ok) toast(msg + ' ' + r.warnings.join(' '));
  } catch (err) {
    out.innerHTML = `<div class="validation-errors"><b>Noch nicht übernommen</b><p>${esc(err.message)}</p></div>`;
  }
}
document.addEventListener('input', e => {
  const k = e.target.dataset?.vk;
  if (!k) return;
  vkState();
  vkForm[k] = e.target.value;
  save(VK_KEY, vkForm);
  if (k === 'mode') renderStudio();
});
document.addEventListener('change', e => {
  if (e.target.dataset?.vk && e.target.tagName === 'SELECT') e.target.dispatchEvent(new Event('input', { bubbles: true }));
});
document.addEventListener('click', e => {
  const b = e.target.closest('[data-vk-open],[data-vk-copy],[data-vk-build],[data-vk-reset]');
  if (!b) return;
  if (b.hasAttribute('data-vk-open')) {
    vkOpen = !vkOpen;
    if (vkOpen) kiOpen = false;
    renderStudio();
    if (vkOpen) document.querySelector('.ed-ki')?.scrollIntoView({ block: 'start' });
  } else if (b.hasAttribute('data-vk-copy')) vkCopy();
  else if (b.hasAttribute('data-vk-build')) vkBuild();
  else if (confirm('Alle Eingaben im Formular löschen?')) {
    vkForm = { ...vkForm, section: '', pages: '', text: '', wishes: '', answer: '' };
    save(VK_KEY, vkForm);
    renderStudio();
  }
});
