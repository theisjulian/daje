'use strict';
/*
 * Redaktion · „Eigene Übungen“ für Lehrkräfte.
 * Hörübungen und Wortlisten anlegen, bearbeiten, in der Vorschau prüfen und per Link mit der
 * Klasse teilen (?eigene=…). Ohne Server: Entwürfe bleiben in diesem Browser (ripassa-editor-v1),
 * geteilte Inhalte reisen vollständig im Link. Unfertige Entwürfe werden als draft mitgespeichert.
 */
const ED_TYPES = [
  ['single_choice', 'Einfachauswahl'],
  ['true_false', 'Richtig / Falsch'],
  ['short_answer', 'Kurzantwort']
];
const ED_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
let edWork = null, // Arbeitskopie des gewählten Inhalts (Paketform)
  edTimer = null;

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
  if (type === 'true_false') q.answer = true;
  if (type === 'short_answer') Object.assign(q, { acceptedAnswers: [], modelAnswer: '' });
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
      if (!q.prompt.trim()) e.push(n + 'Frage fehlt.');
      if (q.type === 'single_choice' && q.options.filter(o => o.text.trim()).length < 2)
        e.push(n + 'mindestens zwei Antworten eintragen.');
      if (
        q.type === 'single_choice' &&
        !q.options.find(o => o.id === q.correctOptionId)?.text.trim()
      )
        e.push(n + 'richtige Antwort markieren.');
      if (q.type === 'short_answer' && !q.acceptedAnswers.length)
        e.push(n + 'mindestens eine richtige Lösung eintragen.');
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
      <button class="button primary" data-ed-new="listening">Neue Hörübung</button>
      <button class="button secondary" data-ed-new="vocabulary">Neue Wortliste</button>
      <button class="button secondary" data-portal="studio-load">Datei importieren</button>
      <input id="studio-file" type="file" accept=".json,application/json" hidden>
    </div>
    <details class="ed-ai" ${lastValidation ? 'open' : ''}><summary>Mit KI erstellen oder JSON einfügen</summary>
      <p class="small muted">Gib einer KI dein Material, die Kommandodatei und ein Beispiel. Die erzeugte Datei hier einfügen oder importieren. Danach wie jede eigene Übung prüfen und bearbeiten.</p>
      <div class="studio-downloads"><a class="button secondary" href="imports/KI-Kommandodatei.md" download>KI-Kommandodatei</a><a class="button secondary" href="imports/Vokabel-Kommandodatei-Schulbuch.md" download>Kommandodatei Wortschatz</a><a class="button secondary" href="examples/listening-all-task-types.json" download>Beispiel Hörübung</a><a class="button secondary" href="examples/vocabulary-example.json" download>Beispiel Wortliste</a></div>
      <label class="field">JSON einfügen<textarea id="studio-json" rows="6" maxlength="2000000" spellcheck="false" placeholder="{ ... }">${esc(lastValidation?.raw || '')}</textarea></label>
      <button class="button secondary" data-portal="studio-validate">Prüfen</button>
      <div id="studio-validation" role="status">${validationHTML()}</div>
    </details>
    <div class="ed-layout">
      <nav class="ed-list" aria-label="Eigene Inhalte">
        ${own.map(card).join('') || '<p class="hw-empty">Noch keine eigenen Übungen. Lege oben eine an oder öffne eine Hörübung im Katalog und wähle „Als eigene Übung bearbeiten“.</p>'}
        ${catalog.length ? `<details class="ed-catalog"><summary>Katalog-Arbeitsfassungen (${catalog.length})</summary>${catalog.map(card).join('')}</details>` : ''}
      </nav>
      <section class="ed-editor">${item ? editorFormHTML(item) : '<div class="studio-empty"><h2>Wähle links eine Übung</h2><p class="muted">oder lege eine neue an. Änderungen werden automatisch gespeichert.</p></div>'}</section>
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
      <div class="ed-add">${ED_TYPES.map(([t, l]) => `<button class="button secondary" data-ed-add="${t}">+ ${l}</button>`).join('')}</div>
    </section>${rights}`;
}
function edQuestionHTML(q, i, n) {
  const tools = `<span class="ed-qtools"><button class="quiet" data-ed-qmove="${i}" data-dir="-1" aria-label="Nach oben" ${i === 0 ? 'disabled' : ''}>↑</button><button class="quiet" data-ed-qmove="${i}" data-dir="1" aria-label="Nach unten" ${i === n - 1 ? 'disabled' : ''}>↓</button><button class="quiet" data-ed-qdel="${i}" aria-label="Aufgabe löschen">✕</button></span>`;
  const editable = ED_TYPES.some(([t]) => t === q.type);
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
  return `<div class="ed-q"><div class="ed-qhead"><b>${i + 1}</b>${editable ? `<select data-ed-q="${i}" data-k="type">${ED_TYPES.map(([t, l]) => `<option value="${t}" ${t === q.type ? 'selected' : ''}>${l}</option>`).join('')}</select>` : ''}${tools}</div>
    ${edField(q.type === 'true_false' ? 'Aussage' : 'Frage', `<input data-ed-q="${i}" data-k="prompt" maxlength="1000" value="${esc(q.prompt)}">`)}
    ${body}
    ${editable ? edField('Erklärung nach der Korrektur (optional)', `<input data-ed-q="${i}" data-k="explanation" maxlength="1500" value="${esc(q.explanation || '')}">`) : ''}
  </div>`;
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
  const details = document.querySelector('.ed-ai');
  if (details) details.open = true;
}
function edValidateText(text) {
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
    if (f === 'prompt' || f === 'explanation') q[f] = t.value;
    else if (f === 'option') q.options.find(o => o.id === t.dataset.o).text = t.value;
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
    else if (t.dataset.k === 'tf') q.answer = t.value === 'true';
    else if (t.dataset.k === 'type') {
      const fresh = edQuestion(t.value, 0);
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
    x.questions.push(edQuestion(b.dataset.edAdd, n));
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
    const id = 'abcdef'.split('').find(c => !q.options.some(o => o.id === c));
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
