'use strict';
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
function renderStudio() {
  const selected = editorState.items.find(x => x.payload.id === studioSelection),
    items = editorState.items.filter(x => studioTab === 'all' || x.payload.kind === studioTab);
  $('main').innerHTML =
    `<div class="page-title"><div class="eyebrow">REDAKTION · LOKALE IMPORTDEMO</div><h1>Deine Inhalte. Ein klarer Ablauf.</h1><p>Hörübungen und Wortschatzlisten importieren, prüfen und bearbeiten.</p></div><div class="editor-banner"><b>Dies ist noch kein geschütztes Backend.</b> Entwürfe und Freigaben bleiben in diesem Browser. Es werden keine Inhalte für andere Nutzer veröffentlicht. Vertrauliche Daten gehören nicht in diese Demo.</div><section class="panel glass portal-spacing"><h2>Deine 14 Videokandidaten sind vorbereitet.</h2><p>Links einen Entwurf auswählen und über Vorschau Video, Aufgaben und Transkript prüfen. Texte aus Gemini sind noch nicht am Audio verifiziert. Eigene Änderungen bleiben in diesem Browser.</p><a class="button secondary" href="imports/Gemini-Folgeprompt.md" download>Neuen Gemini-Prompt herunterladen</a></section><section class="studio-import glass"><div><span class="step-label">01 · VORBEREITEN</span><h2>Aus deinem Material wird ein Lernpaket.</h2><p>Gib einer KI dein Material, die Kommandodatei und ein passendes JSON-Beispiel. Lies die erzeugte Datei hier ein.</p><div class="studio-downloads"><a class="button secondary" href="imports/KI-Kommandodatei.md" download>KI-Kommandodatei</a><a class="button secondary" href="imports/Vokabel-Kommandodatei-Schulbuch.md" download>Vokabel-Kommandodatei (Schulbuch)</a><a class="button secondary" href="examples/listening-example.json" download>Hörbeispiel</a><a class="button secondary" href="examples/listening-with-vocabulary.json" download>Hören mit Wortschatz</a><a class="button secondary" href="examples/listening-all-task-types.json" download>Alle Aufgabentypen</a><a class="button secondary" href="examples/vocabulary-example.json" download>Vokabelbeispiel</a><a class="button secondary" href="examples/vocabulary-catalog-example.json" download>Vokabeln mit Katalog</a></div></div><div class="studio-drop"><span class="step-label">02 · IMPORTIEREN</span><button class="button primary large" data-portal="studio-load">JSON-Datei auswählen</button><small>Eine Datei · maximal 2 MB<br>Wird erst nach Prüfung übernommen</small><input id="studio-file" type="file" accept=".json,application/json" hidden></div></section><details class="studio-paste glass" ${lastValidation ? 'open' : ''}><summary>Oder JSON direkt einfügen</summary><label class="field">Inhalt der KI-Ausgabedatei<textarea id="studio-json" rows="7" maxlength="2000000" spellcheck="false" placeholder="{ ... }">${esc(lastValidation?.raw || '')}</textarea></label><button class="button secondary" data-portal="studio-validate">Datei prüfen</button><div id="studio-validation" role="status">${validationHTML()}</div></details><div class="studio-tabs">${[
      ['all', 'Alle Inhalte'],
      ['listening', 'Hörverstehen'],
      ['vocabulary', 'Wortschatz']
    ]
      .map(
        ([k, v]) =>
          `<button class="button secondary" data-studio-tab="${k}" aria-pressed="${studioTab === k}">${v}</button>`
      )
      .join(
        ''
      )}</div><div class="studio-layout"><section class="studio-inventory glass"><h2>Deine Entwürfe</h2>${items.map(x => `<button class="studio-item ${x.payload.id === studioSelection ? 'active' : ''}" data-studio-id="${esc(x.payload.id)}"><span class="badge">${x.payload.kind === 'listening' ? 'Hören' : 'Wörter'} · ${x.payload.level}</span><b>${esc(x.payload.title)}</b><small>${portalLang(x.payload.language)} · ${x.status === 'published' ? 'In diesem Browser freigegeben' : 'Entwurf'}</small></button>`).join('') || '<p class="small muted">Hier erscheinen deine importierten Inhalte. Die Startbeispiele werden nicht als Entwurf bearbeitet.</p>'}</section><section class="studio-editor glass">${selected ? editorFormHTML(selected) : '<div class="studio-empty"><span class="step-label">03 · PRÜFEN UND BEARBEITEN</span><h2>Gutes Material braucht deinen Blick.</h2><p>Nach dem Import bearbeitest du hier Titel, Niveau, Fragen, Antworten und Wortschatz. Eine Vorschau zeigt, was Lernende später sehen.</p></div>'}</section></div><section class="panel glass portal-spacing"><h2>So wird daraus dein echtes Backend.</h2><p class="small muted">Ein geschützter theis-Redaktionszugang ersetzt diese lokale Demo. Supabase verwaltet Inhalte, Versionen und Berechtigungen. Nur geprüfte, freigegebene Inhalte erscheinen im öffentlichen Katalog.</p><a class="button secondary" href="imports/Backend-Konzept.md" download>Backend-Konzept für Claude</a></section>`;
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
  return `<div class="validation-success"><b>Struktur gültig: ${esc(x.title)}</b><p>${x.kind === 'listening' ? x.questions.length + ' Aufgaben' : x.entries.length + ' Wörter'} · ${portalLang(x.language)} · ${x.level}</p><p>Die Strukturprüfung bestätigt weder fachliche Richtigkeit noch Nutzungsrechte. Import wird immer ein Entwurf.</p><button class="button primary" data-portal="studio-import">Als Entwurf übernehmen</button></div>`;
}
async function importContentFile(file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) return toast('Maximal 2 MB pro Datei.');
  const text = await file.text();
  try {
    lastValidation = { raw: text, result: TheisContent.validatePackage(JSON.parse(text)) };
  } catch {
    lastValidation = {
      raw: text,
      result: {
        ok: false,
        errors: ['JSON konnte nicht gelesen werden. Prüfe Kommas und Anführungszeichen.']
      }
    };
  }
  renderStudio();
}
function validateEditorText() {
  const text = $('studio-json').value;
  try {
    lastValidation = { raw: text, result: TheisContent.validatePackage(JSON.parse(text)) };
  } catch {
    lastValidation = {
      raw: text,
      result: {
        ok: false,
        errors: ['JSON konnte nicht gelesen werden. Prüfe Kommas und Anführungszeichen.']
      }
    };
  }
  renderStudio();
}
function acceptEditorImport() {
  if (!lastValidation?.result.ok) return;
  const payload = lastValidation.result.value;
  if (
    editorState.items.some(x => x.payload.id === payload.id) ||
    LISTENING_SEEDS.some(x => x.id === payload.id) ||
    STOCK_PACKAGES.some(x => x.id === payload.id)
  )
    return toast(
      'Diese Paket-ID gibt es schon. Bestehende Inhalte werden nicht überschrieben. Verwende für ein neues Paket eine neue ID.'
    );
  if (editorState.items.length >= 100) return toast('Maximal 100 lokale Pakete.');
  const next = {
    items: [...editorState.items, { payload, status: 'draft', updatedAt: new Date().toISOString() }]
  };
  if (!save('ripassa-editor-v1', next)) return;
  editorState = next;
  studioSelection = payload.id;
  lastValidation = null;
  renderStudio();
  toast('Als lokalen Entwurf übernommen.');
}
function editorFormHTML(item) {
  const x = item.payload,
    common = `<div class="studio-editor-heading"><div><span class="step-label">03 · REDAKTIONELL PRÜFEN</span><h2>${esc(x.title)}</h2></div><span class="badge">${item.status === 'published' ? 'Lokal freigegeben' : 'Entwurf'}</span></div><form id="studio-edit-form"><label class="field">Titel<input id="edit-title" maxlength="120" required value="${esc(x.title)}"></label><div class="editor-fields"><label class="field">Niveau<select id="edit-level">${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(v => `<option ${x.level === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label><label class="field">Themen · mit Komma trennen<input id="edit-topics" value="${esc(x.topics.join(', '))}" maxlength="1000" required></label></div><label class="field">Kurzbeschreibung<textarea id="edit-description" maxlength="600" required>${esc(x.description)}</textarea></label>`;
  const body =
    x.kind === 'listening'
      ? `<h3>Aufgaben und Lösungen</h3>${x.questions.map((q, i) => `<div class="editor-question"><label class="field">${i + 1} · Frage<input data-edit-question="${q.id}" value="${esc(q.prompt)}" maxlength="1000" required></label>${q.type === 'short_answer' ? `<label class="field">Zulässige Antworten · eine pro Zeile<textarea data-edit-answers="${q.id}" rows="3" required>${esc(q.acceptedAnswers.join('\n'))}</textarea></label>` : q.type === 'single_choice' ? `${q.options.map(o => `<label class="field">Antwortmöglichkeit ${o.id}<input data-edit-option="${q.id}-${o.id}" value="${esc(o.text)}" maxlength="500" required></label>`).join('')}<label class="field">Richtige Antwort<select data-edit-choice="${q.id}">${q.options.map(o => `<option value="${o.id}" ${o.id === q.correctOptionId ? 'selected' : ''}>${esc(o.text)}</option>`).join('')}</select></label>` : q.type === 'true_false' ? `<label class="field">Lösung<select data-edit-true="${q.id}"><option value="true" ${q.answer ? 'selected' : ''}>Richtig</option><option value="false" ${!q.answer ? 'selected' : ''}>Falsch</option></select></label>` : `<p class="small muted">Dieser Aufgabentyp (${q.type}) lässt sich unten über „Alles bearbeiten (JSON)“ ändern.</p>`}<label class="field">Erklärung<textarea data-edit-explanation="${q.id}" maxlength="1500" required>${esc(q.explanation)}</textarea></label></div>`).join('')}<details class="editor-media"><summary>Medium und Transkript</summary><p class="small muted">${x.media.type === 'speech' ? 'Browserstimme · eigener Text' : x.media.type === 'audio' ? 'Audiodatei · ' + esc(x.media.url) : 'YouTube · ' + esc(x.media.videoId)}</p>${x.media.type === 'speech' ? `<label class="field">Text für die Sprachausgabe<textarea id="edit-speech" rows="5" maxlength="12000" required>${esc(x.media.text)}</textarea></label>` : ''}${x.media.type === 'audio' ? `<label class="field">Adresse der Audiodatei<input id="edit-media-url" value="${esc(x.media.url)}" maxlength="2000" required></label>` : x.media.type === 'youtube' ? `<label class="field">YouTube-Video-ID<input id="edit-video-id" value="${esc(x.media.videoId)}" required></label>` : ''}<label class="field">Transkript<textarea id="edit-transcript" rows="5" maxlength="16000">${esc(x.transcript)}</textarea></label></details><details class="editor-media"><summary>Wortschatz zu dieser Hörübung · ${(x.vocabulary || []).length} Einträge</summary><p class="small muted">Wird mit der Hörübung importiert und direkt mit dem Trainer verknüpft.</p>${(x.vocabulary || []).map(w => `<div class="editor-word"><label class="field">Wort / Wendung<input data-activity-target="${w.id}" value="${esc(w.target)}" maxlength="300" required></label><label class="field">Übersetzungen · eine pro Zeile<textarea data-activity-translations="${w.id}" required>${esc(w.translations.join('\n'))}</textarea></label><label class="field">Zulässige Zielantworten · eine pro Zeile<textarea data-activity-answers="${w.id}">${esc((w.acceptedAnswers || []).join('\n'))}</textarea></label><label class="field">Beispiel<input data-activity-example="${w.id}" value="${esc(w.example || '')}" maxlength="1000"></label><label class="field">Erklärung in der Zielsprache<input data-activity-definition="${w.id}" value="${esc(w.definition || '')}" maxlength="1000"></label></div>`).join('') || '<p>Noch kein Wortschatz enthalten. Verwende das neue Importbeispiel, um ein Paket mit Wortschatz vorzubereiten.</p>'}</details>`
      : `<div class="editor-fields"><label class="field">Sammlung / Lehrwerk<input id="edit-collection" value="${esc(x.collection)}" maxlength="160" required></label><label class="field">Abschnitt<input id="edit-section" value="${esc(x.section)}" maxlength="120" required></label></div><h3>${x.entries.length} Wörter und Wendungen</h3>${x.entries
          .map(
            w =>
              `<div class="editor-word"><label class="field">Wort / Wendung<input data-edit-word="${w.id}" value="${esc(w.target)}" maxlength="300" required></label><label class="field">Übersetzungen · eine pro Zeile<textarea data-edit-translations="${w.id}" required>${esc(w.translations.join('\n'))}</textarea></label><label class="field">Zulässige Zielantworten · eine pro Zeile<textarea data-edit-target-answers="${w.id}">${esc(w.acceptedAnswers.join('\n'))}</textarea></label><label class="field">Beispielsatz<input data-edit-example="${w.id}" value="${esc(w.example)}" maxlength="1000"></label><details><summary>Antwortprüfung und Grammatik</summary><label class="field">Artikel beim Antworten<select data-edit-article-policy="${w.id}">${[
                ['required', 'Artikel mitlernen'],
                ['optional', 'Artikel optional']
              ]
                .map(
                  ([k, t]) =>
                    `<option value="${k}" ${(w.answerPolicy?.article || 'required') === k ? 'selected' : ''}>${t}</option>`
                )
                .join(
                  ''
                )}</select></label><label class="field">Tippfehler<select data-edit-typo-policy="${w.id}"><option value="hint" ${w.answerPolicy?.typo !== 'strict' ? 'selected' : ''}>Hinweis geben und erneut versuchen</option><option value="strict" ${w.answerPolicy?.typo === 'strict' ? 'selected' : ''}>Streng prüfen</option></select></label><label class="field">Wortart<select data-edit-pos="${w.id}">${[
                ['other', 'Nicht festgelegt'],
                ['noun', 'Substantiv'],
                ['verb', 'Verb'],
                ['adjective', 'Adjektiv'],
                ['phrase', 'Wendung']
              ]
                .map(
                  ([k, t]) =>
                    `<option value="${k}" ${(w.grammar?.partOfSpeech || 'other') === k ? 'selected' : ''}>${t}</option>`
                )
                .join(
                  ''
                )}</select></label><label class="field">Genus<select data-edit-gender="${w.id}">${[
                ['unknown', 'Nicht festgelegt'],
                ['masculine', 'Maskulin'],
                ['feminine', 'Feminin'],
                ['neuter', 'Neutrum'],
                ['common', 'Gemeinsames Genus']
              ]
                .map(
                  ([k, t]) =>
                    `<option value="${k}" ${(w.grammar?.gender || 'unknown') === k ? 'selected' : ''}>${t}</option>`
                )
                .join(
                  ''
                )}</select></label><label class="field">Artikel<input data-edit-grammar-article="${w.id}" maxlength="20" value="${esc(w.grammar?.article || '')}"></label><p class="small muted">Falsche Wortformen gehören nicht in die zulässigen Antworten. Hilfen führen zu einer erneuten Eingabe.</p></details></div>`
          )
          .join('')}`;
  return (
    common +
    body +
    `<details class="source-review"><summary>Quellen und offene Prüfpunkte</summary>${x.sources
      .map(
        (s, i) =>
          `<label class="field">Quelle ${i + 1}<textarea data-source-citation="${i}" maxlength="1000" required>${esc(s.citation)}</textarea></label><label class="field">Originalquelle · HTTPS<input data-source-url="${i}" value="${esc(s.url)}" maxlength="2000"></label><label class="field">Nutzungsrechte · nur nach eigener Prüfung ändern<select data-source-rights="${i}">${[
            ['needs_review', 'Noch zu prüfen'],
            ['own', 'Eigener Inhalt'],
            ['cleared', 'Nutzung geklärt']
          ]
            .map(
              ([k, t]) => `<option value="${k}" ${s.rights === k ? 'selected' : ''}>${t}</option>`
            )
            .join('')}</select></label>`
      )
      .join(
        ''
      )}${x.reviewNotes.map(t => `<p class="small">${esc(t)}</p>`).join('') || '<p class="small muted">Keine weiteren Prüfpunkte angegeben.</p>'}</details><button class="button primary" type="submit">Änderungen als Entwurf speichern</button></form><p class="small muted" role="status">${esc(editorMessage)}</p><div class="studio-actions"><button class="button secondary" data-portal="studio-preview">Vorschau</button><button class="button secondary" data-portal="studio-export">JSON exportieren</button>${item.status === 'published' ? '<button class="quiet" data-portal="studio-withdraw">Lokale Freigabe zurücknehmen</button>' : ''}</div><div id="studio-preview"></div><section class="publish-box"><span class="step-label">04 · LOKAL FREIGEBEN</span><p class="small muted">Zuerst Änderungen speichern. Prüfe jede Lösung am Originalmaterial. Quellen mit needs_review verhindern die Freigabe.</p><label><input id="publish-reviewed" type="checkbox"> Inhalt, Lösungen und Nutzungsrechte habe ich geprüft.</label><button class="button primary" data-portal="studio-publish">In diesem Browser freigeben</button></section>`
  );
}
function saveEditorForm() {
  const item = editorState.items.find(x => x.payload.id === studioSelection);
  if (!item) return;
  const x = JSON.parse(JSON.stringify(item.payload));
  x.title = $('edit-title').value;
  x.level = $('edit-level').value;
  x.topics = $('edit-topics')
    .value.split(',')
    .map(x => x.trim())
    .filter(Boolean);
  x.description = $('edit-description').value;
  if (x.kind === 'listening') {
    x.questions.forEach(q => {
      q.prompt = document.querySelector('[data-edit-question="' + q.id + '"]').value;
      q.explanation = document.querySelector('[data-edit-explanation="' + q.id + '"]').value;
      if (q.type === 'short_answer') {
        q.acceptedAnswers = document
          .querySelector('[data-edit-answers="' + q.id + '"]')
          .value.split('\n')
          .map(x => x.trim())
          .filter(Boolean);
        q.modelAnswer = q.acceptedAnswers[0] || '';
      }
      if (q.type === 'single_choice') {
        q.correctOptionId = document.querySelector('[data-edit-choice="' + q.id + '"]').value;
        q.options.forEach(
          o =>
            (o.text = document.querySelector(
              '[data-edit-option="' + q.id + '-' + o.id + '"]'
            ).value)
        );
      }
      if (q.type === 'true_false')
        q.answer = document.querySelector('[data-edit-true="' + q.id + '"]').value === 'true';
    });
    x.transcript = $('edit-transcript').value;
    (x.vocabulary || []).forEach(w => {
      w.target = document.querySelector('[data-activity-target="' + w.id + '"]').value;
      w.translations = document
        .querySelector('[data-activity-translations="' + w.id + '"]')
        .value.split('\n')
        .map(x => x.trim())
        .filter(Boolean);
      w.acceptedAnswers = document
        .querySelector('[data-activity-answers="' + w.id + '"]')
        .value.split('\n')
        .map(x => x.trim())
        .filter(Boolean);
      w.example = document.querySelector('[data-activity-example="' + w.id + '"]').value;
      w.definition = document.querySelector('[data-activity-definition="' + w.id + '"]').value;
    });
    if (x.media.type === 'speech') x.media.text = $('edit-speech').value;
    if (x.media.type === 'audio') x.media.url = $('edit-media-url').value;
    if (x.media.type === 'youtube') x.media.videoId = $('edit-video-id').value;
  } else {
    x.collection = $('edit-collection').value;
    x.section = $('edit-section').value;
    x.entries.forEach(w => {
      w.target = document.querySelector('[data-edit-word="' + w.id + '"]').value;
      w.translations = document
        .querySelector('[data-edit-translations="' + w.id + '"]')
        .value.split('\n')
        .map(x => x.trim())
        .filter(Boolean);
      w.acceptedAnswers = document
        .querySelector('[data-edit-target-answers="' + w.id + '"]')
        .value.split('\n')
        .map(x => x.trim())
        .filter(Boolean);
      delete w.acceptedAnswers;
      if (document.querySelector('[data-edit-target-answers="' + w.id + '"]').value.trim())
        w.acceptedAnswers = document
          .querySelector('[data-edit-target-answers="' + w.id + '"]')
          .value.split('\n')
          .map(x => x.trim())
          .filter(Boolean);
      w.example = document.querySelector('[data-edit-example="' + w.id + '"]').value;
      w.answerPolicy = {
        article: document.querySelector('[data-edit-article-policy="' + w.id + '"]').value,
        typo: document.querySelector('[data-edit-typo-policy="' + w.id + '"]').value
      };
      w.grammar = {
        partOfSpeech: document.querySelector('[data-edit-pos="' + w.id + '"]').value,
        gender: document.querySelector('[data-edit-gender="' + w.id + '"]').value,
        article: document.querySelector('[data-edit-grammar-article="' + w.id + '"]').value
      };
    });
  }
  x.sources.forEach((source, i) => {
    source.citation = document.querySelector('[data-source-citation="' + i + '"]').value;
    source.url = document.querySelector('[data-source-url="' + i + '"]').value;
    source.rights = document.querySelector('[data-source-rights="' + i + '"]').value;
  });
  const v = TheisContent.validatePackage(x);
  if (!v.ok) {
    editorMessage = v.errors.join(' · ');
    return renderStudio();
  }
  const old = { ...item };
  item.payload = v.value;
  item.status = 'draft';
  item.updatedAt = new Date().toISOString();
  if (!saveEditorState()) {
    Object.assign(item, old);
    return;
  }
  editorMessage = 'Änderungen lokal als Entwurf gespeichert. Freigabe erneut prüfen.';
  renderStudio();
}
function publishEditorItem() {
  const x = editorState.items.find(x => x.payload.id === studioSelection);
  if (!x) return;
  if (!$('publish-reviewed').checked) return toast('Bitte die redaktionelle Prüfung bestätigen.');
  if (x.payload.sources.some(s => s.rights === 'needs_review'))
    return toast(
      'Nutzungsrechte sind noch offen. Rechte am Original klären und ein korrigiertes Paket importieren.'
    );
  const old = x.status;
  x.status = 'published';
  if (!saveEditorState()) {
    x.status = old;
    return;
  }
  editorMessage = 'In diesem Browser freigegeben. Andere Nutzer sehen diese Änderung nicht.';
  renderStudio();
  toast('Lokale Freigabe gespeichert. Inhalt erscheint hier im Katalog.');
}
