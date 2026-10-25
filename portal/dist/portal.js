'use strict';
let portalFilters = { language: 'all', level: 'all', media: 'all', hideWorking: false, query: '' },
  openedListening = null,
  studioSelection = null,
  studioTab = 'all',
  editorMessage = '',
  lastValidation = null;
let editorState = { items: [] },
  speechActive = false,
  portalAudience = 'learn',
  teacherLessonId = null;
const portalLang = l => TheisContent.LANGUAGES[l] || l;
function portalProfile() {
  const p = activeProfile();
  if (!p.portal)
    p.portal = { favorites: [], history: [], listening: {}, notes: {}, recordHistory: true };
  return p.portal;
}
function persistPortal() {
  return persistProfiles();
}
function withExtra(x) {
  const e = typeof LISTENING_EXTRA !== 'undefined' && LISTENING_EXTRA[x.id];
  if (!e) return x;
  const have = new Set((x.questions || []).map(q => q.id));
  const add = [...e.pre, ...e.post].filter(q => !have.has(q.id));
  return {
    ...x,
    questions: [...e.pre.filter(q => !have.has(q.id)), ...(x.questions || []), ...e.post.filter(q => !have.has(q.id))],
    teacherNotes: x.teacherNotes || e.teacherNotes,
    levelLabel: x.levelLabel || e.levelLabel,
    estimatedMinutes: Math.max(x.estimatedMinutes || 0, Math.round((x.questions.length + add.length) * 1.2))
  };
}
function contentList(kind) {
  const reviewIds = new Set(LISTENING_REVIEW_SEEDS.map(x => x.id));
  const seeds =
    kind === 'listening'
      ? [
          ...[...LISTENING_SEEDS, ...LISTENING_REVIEW_SEEDS].map(withExtra),
          ...STOCK_PACKAGES.filter(x => x.kind === 'listening')
        ]
      : kind === 'vocabulary'
        ? [
            ...contentList('listening')
              .filter(x => x.vocabulary?.length)
              .map(activityVocabularyPackage),
            ...STOCK_PACKAGES.filter(x => x.kind === 'vocabulary')
          ]
        : [];
  const local = editorState.items
    .filter(
      x =>
        x.payload.kind === kind &&
        (x.status === 'published' || (kind === 'listening' && reviewIds.has(x.payload.id)))
    )
    .map(x => x.payload);
  const overridden = new Set(local.map(x => x.id));
  return [...seeds.filter(x => !overridden.has(x.id)), ...local];
}
function activityVocabularyPackage(x) {
  return {
    format: 'theis-learning-package',
    schemaVersion: '1.1',
    kind: 'vocabulary',
    id: x.id,
    title: 'Wortschatz · ' + x.title,
    language: x.language,
    translationLanguage: 'de',
    level: x.level,
    description: 'Wörter und Wendungen aus dieser Hörübung.',
    topics: x.topics,
    cover: x.cover || 'wave',
    collection: 'Hörverstehen',
    section: x.title,
    sources: x.sources,
    reviewNotes: x.reviewNotes || [],
    entries: x.vocabulary || []
  };
}
function isWorkingLesson(x) {
  return (
    LISTENING_REVIEW_SEEDS.some(item => item.id === x.id) ||
    x.sources.some(source => source.rights === 'needs_review')
  );
}
function workingLessonNotice(x) {
  return isWorkingLesson(x)
    ? '<div class="editor-banner"><b>Arbeitsfassung · Prüfung offen.</b> Aufgaben, Transkript, Zeitmarken und Nutzungsrechte sind noch nicht abschließend geprüft. ' +
        (!x.transcript && !x.series ? 'Das vollständige Transkript fehlt noch. ' : '') +
        '<button class="quiet" data-nav="redaktion">In der Redaktion bearbeiten</button></div>'
    : '';
}
function currentLesson() {
  return (
    contentList('listening').find(x => x.id === openedListening) ||
    editorState.items.find(x => x.payload.id === openedListening)?.payload
  );
}
function favoriteKey(kind, id) {
  return kind + ':' + id;
}
function isFavorite(kind, id) {
  return portalProfile().favorites.includes(favoriteKey(kind, id));
}
function favoriteButton(kind, id) {
  return `<button class="save-content ${isFavorite(kind, id) ? 'saved' : ''}" data-favorite-kind="${kind}" data-favorite-id="${esc(id)}" aria-label="${isFavorite(kind, id) ? 'Aus Merkliste entfernen' : 'In Merkliste speichern'}" aria-pressed="${isFavorite(kind, id)}">${isFavorite(kind, id) ? 'Gemerkt' : 'Merken'}</button>`;
}
function waveHTML() {
  return (
    '<div class="sound-art" aria-hidden="true">' +
    Array.from(
      { length: 27 },
      (_, i) => `<i style="--wave:${18 + Math.round(Math.abs(Math.sin(i * 0.61)) * 65)}%"></i>`
    ).join('') +
    '</div>'
  );
}
function transcriptForDisplay(text) {
  return String(text || '')
    .replace(
      /^\[(?:Übermittelte|Übermittelter|Von Gemini|Automatische YouTube|Automatische Untertitel)[^\]]*\]\s*/s,
      ''
    )
    .replace(/^(?:Ausschnitt[^\n]*|\[Sprecherwechsel ungesichert\])\n?/, '')
    .replace(/\[(\d{2}:\d{2}); laut Gemini\]/g, '[$1]')
    .replace(/\[Wortlaut zu prüfen\]/g, '[Wortlaut unsicher]')
    .trim();
}
function lessonCoverHTML(x) {
  const own = !!x.coverImage,
    video = x.media.type === 'youtube' && !own,
    src = own
      ? x.coverImage
      : video
        ? LOCAL_VIDEO_THUMBNAILS[x.media.videoId] ||
          'https://img.youtube.com/vi/' + x.media.videoId + '/hqdefault.jpg'
        : PHOTOS[x.cover]?.file || 'assets/listening-cover.svg',
    alt = own
      ? 'Titelbild: ' + esc(x.title)
      : video
        ? 'Videovorschau: ' + esc(x.title)
        : PHOTOS[x.cover]
          ? esc(PHOTOS[x.cover].alt)
          : 'Illustration mit Kopfhörern und einem offenen Buch';
  return `<img src="${esc(src)}" alt="${alt}" loading="lazy" decoding="async" ${video ? 'data-video-cover="' + x.media.videoId + '" referrerpolicy="no-referrer"' : ''}>`;
}
const LISTENING_FORMAT_LABELS = {
  single_choice: 'Einfachauswahl',
  multiple_choice: 'Mehrfachauswahl',
  true_false: 'Richtig / Falsch',
  short_answer: 'Kurzantwort',
  matching: 'Zuordnung',
  ordering: 'Reihenfolge',
  gap_fill: 'Lückentext'
};
function lessonFormats(x) {
  return [...new Set(x.questions.map(q => LISTENING_FORMAT_LABELS[q.type]))].join(' · ');
}
function listeningFormatGuide() {
  return `<details class="format-guide glass"><summary>Welche Aufgabenformen gibt es?</summary><div class="format-grid"><section><h3>Einfachauswahl</h3><p>Wähle eine richtige Antwort. Prüft Hauptaussagen, Details oder Schlussfolgerungen.</p></section><section><h3>Richtig / Falsch</h3><p>Vergleiche eine Aussage mit dem Gehörten. Achte auf Einschränkungen und veränderte Details.</p></section><section><h3>Kurzantwort</h3><p>Schreibe zum Beispiel einen Ort, eine Zahl oder eine kurze Formulierung. Hinterlegte richtige Varianten werden berücksichtigt.</p></section></div><p class="small muted">Weitere mögliche Formate für den Ausbau: Mehrfachauswahl, Zuordnung, Reihenfolge, Lückentext und Notizen ergänzen. Diese sind bei Hörübungen noch nicht implementiert. Die Aufgaben folgen möglichst dem Weg vom Globalverstehen zu ausgewählten Details und Zusammenhängen.</p></details>`;
}
function openListening(id, preview = false) {
  stopListening();
  const x =
    contentList('listening').find(x => x.id === id) ||
    (preview ? editorState.items.find(x => x.payload.id === id)?.payload : null);
  if (!x) {
    nav('hoeren');
    return toast('Diese Hörübung ist hier nicht verfügbar.');
  }
  openedListening = id;
  view = 'hoeruebung';
  session = null;
  if (!preview) {
    const p = portalProfile();
    if (p.recordHistory)
      p.history = [
        { id, at: new Date().toISOString() },
        ...p.history.filter(h => h.id !== id)
      ].slice(0, 60);
    persistPortal();
  }
  markPortalNav('hoeren');
  renderListening(preview);
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function markPortalNav(route) {
  markNav(route);
}
function lessonProgress() {
  const p = portalProfile();
  if (!p.listening[openedListening])
    p.listening[openedListening] = { answers: {}, checked: false, transcriptOpened: false };
  return p.listening[openedListening];
}
function stopListening() {
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  speechActive = false;
  document.querySelectorAll('audio,video').forEach(a => a.pause());
}
function playSpeech() {
  if (!('speechSynthesis' in window)) {
    return toast(
      'Dieser Browser unterstützt die Sprachausgabe nicht. Das Transkript ist verfügbar.'
    );
  }
  const x = currentLesson();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(x.media.text);
  u.lang = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', es: 'es-ES' }[x.language];
  u.rate = Number($('listen-speed').value);
  const voices = window.speechSynthesis.getVoices();
  u.voice =
    voices.find(v => v.lang.toLowerCase() === u.lang.toLowerCase()) ||
    voices.find(v => v.lang.toLowerCase().startsWith(x.language)) ||
    null;
  u.onstart = () => {
    speechActive = true;
    if ($('audio-status')) $('audio-status').textContent = 'Wird vorgelesen …';
  };
  u.onend = () => {
    speechActive = false;
    if ($('audio-status'))
      $('audio-status').textContent = 'Zu Ende. Du kannst den Hörtext erneut abspielen.';
  };
  u.onerror = () => {
    speechActive = false;
    if ($('audio-status'))
      $('audio-status').textContent =
        'Sprachausgabe nicht verfügbar. Du kannst das Transkript öffnen.';
  };
  $('audio-status').textContent = 'Sprachausgabe wird gestartet …';
  window.speechSynthesis.speak(u);
}
function checkListening() {
  const x = currentLesson(),
    s = lessonProgress();
  s.checked = true;
  const correct = x.questions.filter(q => TheisContent.assessAnswer(q, s.answers[q.id])).length;
  s.lastResult = {
    correct,
    total: x.questions.length,
    at: new Date().toISOString(),
    assisted: !!s.usedTranscript
  };
  s.attempts = (s.attempts || 0) + 1;
  const ok = persistPortal();
  renderListening();
  toast(
    ok
      ? `${correct} von ${x.questions.length} Antworten erkannt. Ergebnis lokal gespeichert.`
      : 'Speichern fehlgeschlagen. Sichere dein Profil.'
  );
}
function favoritePage() {
  const p = portalProfile(),
    items = contentList('listening').filter(x => isFavorite('listening', x.id)),
    vocab = contentList('vocabulary').filter(x => isFavorite('vocabulary', x.id));
  $('main').innerHTML =
    `<div class="page-title"><div class="eyebrow">DEINE SAMMLUNG</div><h1>${portalAudience === 'teach' ? 'Gutes Material wiederfinden.' : 'Für später. Für dich.'}</h1><p>Deine gemerkten Hörübungen und Wortschatzlisten an einem Ort. Aktuell im lokalen Lernprofil.</p></div>${!p.favorites.length ? emptyPortal('Hier beginnt deine Sammlung.', 'Merke dir eine Hörübung oder Vokabelliste. Du findest sie dann hier wieder.') : `<div class="lesson-grid">${items.map(lessonCard).join('')}${isFavorite('vocabulary', 'ecco-piu-1') ? baseVocabCard() : ''}${vocab.map(vocabCard).join('')}</div>${!items.length && !vocab.length && !isFavorite('vocabulary', 'ecco-piu-1') ? '<p class="muted">Gemerkte Inhalte sind in diesem Browser nicht mehr verfügbar. Importierte Inhalte müssen hier ebenfalls vorhanden sein.</p>' : ''}`}`;
}
function historyPage() {
  const p = portalProfile(),
    list = contentList('listening');
  $('main').innerHTML =
    `<div class="page-title"><div class="eyebrow">DEIN VERLAUF</div><h1>Hier warst du zuletzt.</h1><p>Geöffnete Hörübungen, nach dem letzten Besuch sortiert. Öffnen bedeutet noch nicht: bearbeitet oder verstanden.</p></div><label class="history-toggle glass"><input id="record-history" type="checkbox" ${p.recordHistory ? 'checked' : ''}> Besuche in diesem Lernprofil merken</label><div class="history-list">${
      p.history
        .map(h => {
          const x = list.find(x => x.id === h.id);
          if (!x) return '';
          return `<article class="history-row glass"><div><span class="eyebrow">${portalLang(x.language)} · ${x.level}</span><h3>${esc(x.title)}</h3><small>${new Date(h.at).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}</small></div><button class="button secondary" data-lesson="${x.id}">Öffnen</button></article>`;
        })
        .join('') ||
      emptyPortal(
        'Noch keine besuchten Hörübungen.',
        'Dein Verlauf füllt sich, sobald du eine Hörübung öffnest.'
      )
    }</div>${p.history.length ? '<button class="quiet small" data-portal="clear-history">Verlauf leeren</button>' : ''}`;
}
function startVocabularySet(id, mode = 'write') {
  const x = contentList('vocabulary').find(x => x.id === id);
  if (!x) return;
  config.language = x.language;
  config.direction = $('set-direction')?.value || 'de-it';
  config.mode = mode;
  const words = x.entries.map(w => ({
    id: x.id + '-' + w.id,
    target: w.target,
    translations: w.translations,
    acceptedAnswers: w.acceptedAnswers,
    grammar: w.grammar,
    answerPolicy: w.answerPolicy,
    language: x.language,
    label: x.section === x.title ? x.title : x.title + ' · ' + x.section,
    def: w.definition,
    example: w.example,
    ipa: w.ipa,
    audio: w.audio,
    image: w.image
  }));
  if ($('vocabulary-set-dialog')?.open) $('vocabulary-set-dialog').close();
  start(mode === 'definition' ? words.filter(w => w.def) : words, mode);
  view = 'lernen';
  markPortalNav('vokabeln');
}
function showTheisAccount() {
  let dialog = $('theis-account-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'theis-account-dialog';
    dialog.setAttribute('aria-labelledby', 'theis-account-title');
    document.body.append(dialog);
  }
  dialog.innerHTML =
    '<div class="dialog-head"><h2 id="theis-account-title">Dein theis-Konto</h2><button class="button secondary" data-close="theis-account-dialog">Schließen</button></div><div class="account-symbol">theis</div><h3>Ein Konto. Deine Lernwege.</h3><p>Geplant sind Lernstände, Merkliste und Notizen auf mehreren Geräten – später auch Online-Backups für weitere Theis-Apps.</p><div class="editor-banner">Noch nicht verbunden</div><p>Diese Vorschau hat keine Registrierung und überträgt keine Lernstände an Supabase. Nutze aktuell dein lokales Lernprofil und sichere es als Datei.</p><button class="button primary" data-extra="export">Lokales Lernprofil sichern</button>';
  dialog.showModal();
}
function portalProgressSummary() {
  const p = portalProfile(),
    checked = Object.entries(p.listening).filter(([, s]) => s.lastResult);
  return `<section class="panel glass portal-spacing"><div class="eyebrow">HÖRVERSTEHEN</div><h2>${checked.length} Hörübungen geprüft.</h2><p class="small muted">Ergebnisse zeigen erkannte Antworten dieser Aufgaben. Sie messen keine GER-Stufe. Ein geöffnetes Transkript wird als Hilfestellung vermerkt.</p><div class="listening-results">${
    checked
      .map(([id, s]) => {
        const x = contentList('listening').find(x => x.id === id);
        return x
          ? `<div><button class="quiet" data-lesson="${id}">${esc(x.title)}</button><span>${s.lastResult.correct} / ${s.lastResult.total}${s.lastResult.assisted ? ' · mit Transkript' : ''}</span></div>`
          : '';
      })
      .join('') ||
    '<p class="small muted">Deine erste Rückmeldung wartet nach einer Hörübung auf dich.</p>'
  }</div></section>`;
}
function setPortalAudience(value) {
  portalAudience = value === 'teach' ? 'teach' : 'learn';
  portalProfile().audience = portalAudience;
  persistPortal();
  applyAudienceLabels();
}
function applyAudienceLabels() {
  const teacher = portalAudience === 'teach';
  const titles = {
    start: teacher ? 'Mein Unterricht' : 'Mein Lernbereich',
    hoeren: teacher ? 'Hörmaterial' : 'Hörverstehen',
    sammlung: teacher ? 'Meine Sammlung' : 'Merkliste',
    verlauf: teacher ? 'Zuletzt angesehen' : 'Verlauf',
    fortschritt: teacher ? 'Lernübersicht' : 'Mein Fortschritt'
  };
  document.querySelectorAll('.nav-list [data-nav]').forEach(b => {
    const label = b.querySelector('.nav-label');
    if (label && titles[b.dataset.nav]) label.textContent = titles[b.dataset.nav];
  });
  const tabTitles = {
    start: teacher ? 'Unterricht' : 'Start',
    hoeren: 'Hören',
    vokabeln: 'Wortschatz',
    sammlung: teacher ? 'Sammlung' : 'Merkliste'
  };
  document.querySelectorAll('.tabbar [data-nav]').forEach(b => {
    const label = b.querySelector('.nav-label');
    if (label && tabTitles[b.dataset.nav]) label.textContent = tabTitles[b.dataset.nav];
  });
  document.querySelectorAll('[data-audience]').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.audience === portalAudience));
  });
  document.documentElement.dataset.audience = portalAudience;
}
function setupPortal() {
  document.addEventListener(
    'error',
    e => {
      const img = e.target;
      if (
        !(img instanceof HTMLImageElement) ||
        !img.closest('.lcard-media, .player-poster, .step-media, .lesson-cover')
      )
        return;
      if (img.dataset.videoCover && !img.dataset.coverRetry) {
        img.dataset.coverRetry = '1';
        img.src = 'https://img.youtube.com/vi/' + img.dataset.videoCover + '/mqdefault.jpg';
        return;
      }
      if (!img.dataset.coverFallback) {
        img.dataset.coverFallback = '1';
        img.removeAttribute('data-video-cover');
        img.src = 'assets/listening-cover.svg';
        img.alt = 'Illustration mit Kopfhörern und einem offenen Buch';
      }
    },
    true
  );

  const raw = read('ripassa-editor-v1', null);
  if (raw && Array.isArray(raw.items)) {
    editorState.items = raw.items.slice(0, 100).flatMap(x => {
      const v = TheisContent.validatePackage(x.payload);
      return v.ok
        ? [
            {
              payload: v.value,
              status: x.status === 'published' ? 'published' : 'draft',
              updatedAt: typeof x.updatedAt === 'string' ? x.updatedAt : new Date().toISOString()
            }
          ]
        : [];
    });
  }
  const latestSeeds = new Map(LISTENING_REVIEW_SEEDS.map(x => [x.id, x]));
  for (const item of editorState.items) {
    if (item.updatedAt === '2026-10-25T00:00:00.000Z' && latestSeeds.has(item.payload.id))
      item.payload = JSON.parse(JSON.stringify(latestSeeds.get(item.payload.id)));
  }
  const present = new Set(editorState.items.map(x => x.payload.id));
  for (const payload of LISTENING_REVIEW_SEEDS) {
    if (!present.has(payload.id) && editorState.items.length < 100) {
      const v = TheisContent.validatePackage(payload);
      if (v.ok)
        editorState.items.push({
          payload: v.value,
          status: 'draft',
          updatedAt: '2026-10-25T00:00:00.000Z'
        });
    }
  }
  for (const item of editorState.items) {
    if (item.payload.kind === 'listening')
      item.payload.transcript = transcriptForDisplay(item.payload.transcript);
  }
  document.querySelector('.appname small').textContent = 'Hören und Wortschatz';
  document.querySelector('.wordmark').dataset.nav = 'start';
  document.querySelector('.wordmark').href = '#start';
  document
    .querySelector('.foot')
    .insertAdjacentHTML(
      'beforeend',
      '<button class="quiet" data-nav="redaktion">Redaktion</button>'
    );
  document.querySelector('.foot>span').textContent =
    'daje · Hörverstehen und Wortschatz · private Vorschau';
  portalAudience = portalProfile().audience === 'teach' ? 'teach' : 'learn';
  applyAudienceLabels();
  document.addEventListener('click', portalClick);
  const saveAnswer = q => {
    const ok = persistPortal();
    updateListeningProgress();
    if (!ok) toast('Antwort konnte nicht dauerhaft gespeichert werden.');
  };
  const storePart = el => {
    const st = lessonProgress();
    const cur = Object.assign(
      Object.create(null),
      answerParts(st.answers[el.dataset.listenPart] || '')
    );
    if (el.value === '') delete cur[el.dataset.part];
    else cur[el.dataset.part] = el.value;
    st.answers[el.dataset.listenPart] = Object.keys(cur).length ? JSON.stringify(cur) : '';
    st.checked = false;
    saveAnswer();
  };
  document.addEventListener('input', e => {
    if (e.target.dataset.listenPart && e.target.tagName === 'INPUT') storePart(e.target);
    if (e.target.id === 'listen-search') {
      portalFilters.query = e.target.value.trim();
      refreshCatalog();
    }
    if (e.target.dataset.listenAnswer) {
      lessonProgress().answers[e.target.dataset.listenAnswer] = e.target.value;
      lessonProgress().checked = false;
      const ok = persistPortal();
      updateListeningProgress();
      if (!ok) toast('Antwort konnte nicht dauerhaft gespeichert werden.');
    }
    if (e.target.id === 'listening-note') {
      portalProfile().notes[openedListening] = e.target.value;
      $('note-status').textContent = persistPortal()
        ? 'Notiz lokal gespeichert.'
        : 'Notiz konnte nicht gespeichert werden.';
    }
  });
  document.addEventListener('change', e => {
    if (e.target.dataset.listenPart && e.target.tagName === 'SELECT') storePart(e.target);
    if (e.target.dataset.listenMulti) {
      const st = lessonProgress();
      st.answers[e.target.dataset.listenMulti] = [
        ...document.querySelectorAll(
          'input[data-listen-multi="' + e.target.dataset.listenMulti + '"]:checked'
        )
      ]
        .map(i => i.value)
        .sort()
        .join(',');
      st.checked = false;
      saveAnswer();
    }
    if (e.target.id === 'hide-working') {
      portalFilters.hideWorking = e.target.checked;
      refreshCatalog();
    }
    if (e.target.id === 'record-history') {
      portalProfile().recordHistory = e.target.checked;
      persistPortal();
    }
    if (e.target.id === 'listen-speed' && $('listening-audio'))
      $('listening-audio').playbackRate = Number(e.target.value);
    if (e.target.id === 'studio-file') importContentFile(e.target.files[0]);
  });
  document.addEventListener('submit', e => {
    if (e.target.dataset.homeSearch !== undefined) {
      e.preventDefault();
      portalFilters = { ...portalFilters, query: $('home-search').value.trim() };
      return nav('hoeren');
    }
    if (e.target.id === 'listening-form') {
      e.preventDefault();
      checkListening();
    }
    if (e.target.id === 'studio-edit-form') {
      e.preventDefault();
      saveEditorForm();
    }
  });
}
function portalClick(e) {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.audience) {
    setPortalAudience(b.dataset.audience);
    return refreshAudience();
  }
  if (b.dataset.teaching) return showTeaching(b.dataset.teaching);
  if (b.dataset.lesson) return openListening(b.dataset.lesson);
  if (b.dataset.vocabSet) return showVocabularySet(b.dataset.vocabSet);
  if (b.dataset.vocabTrain) return startVocabularySet(b.dataset.vocabTrain, b.dataset.trainingMode);
  if (b.dataset.favoriteId) {
    const p = portalProfile(),
      k = favoriteKey(b.dataset.favoriteKind, b.dataset.favoriteId);
    p.favorites = p.favorites.includes(k)
      ? p.favorites.filter(x => x !== k)
      : [k, ...p.favorites].slice(0, 300);
    persistPortal();
    if (view === 'hoeruebung') renderListening();
    else render();
    return;
  }
  const a = b.dataset.portal;
  if (a === 'audience') {
    setPortalAudience(portalAudience === 'teach' ? 'learn' : 'teach');
    return refreshAudience();
  }
  if (a === 'filter-set') {
    portalFilters[b.dataset.key] = b.dataset.value;
    return refreshCatalog();
  }
  if (a === 'home-level') {
    portalFilters = { ...portalFilters, level: b.dataset.value, query: '' };
    return nav('hoeren');
  }
  if (a === 'toggle-key') {
    teacherKeyVisible = !teacherKeyVisible;
    return renderListening();
  }
  if (a === 'close-print') {
    document.body.classList.remove('previewing-teaching');
    return;
  }
  if (a === 'do-print') {
    document.body.classList.add('printing-teaching');
    window.print();
    document.body.classList.remove('printing-teaching');
    return;
  }
  if (a === 'print-questions') printTeaching(false);
  if (a === 'print-solutions') printTeaching(true);
  if (a === 'back-lesson') {
    const dialog = $('teaching-dialog');
    if (dialog) dialog.close();
    openListening(teacherLessonId);
  }
  if (a === 'play-audio') {
    const audio = $('listening-audio');
    if (audio.paused) {
      audio
        .play()
        .then(() => {
          b.textContent = 'Wiedergabe pausieren';
        })
        .catch(() => {
          $('audio-status').textContent = 'Wiedergabe nicht möglich. Prüfe die Quelle.';
        });
    } else {
      audio.pause();
      b.textContent = 'Aufnahme fortsetzen';
    }
  }
  if (a === 'series-clear') { portalFilters.series = ''; refreshCatalog(); }
  if (a === 'copy-embed') {
    const x = currentLesson();
    const url =
      location.origin + location.pathname + '?hoeren=' + encodeURIComponent(x.id) + '&embed=1';
    const code = `<iframe src="${url}" title="${esc(x.title)}" width="100%" height="1000" style="border:0" allow="fullscreen" loading="lazy"></iframe>`;
    (navigator.clipboard?.writeText(code) || Promise.reject())
      .then(() => toast('Einbett-Code kopiert. Direktlink: ' + url))
      .catch(() => prompt('Einbett-Code zum Kopieren:', code));
  }
  if (a === 'account') showTheisAccount();
  if (a === 'play-speech') playSpeech();
  if (a === 'stop-speech') {
    stopListening();
    if ($('audio-status')) $('audio-status').textContent = 'Gestoppt. Du kannst von vorn beginnen.';
  }
  if (a === 'load-youtube') {
    const x = currentLesson();
    $('youtube-container').innerHTML =
      `<iframe title="${esc(x.title)}" src="https://www.youtube-nocookie.com/embed/${x.media.videoId}?rel=0${x.media.start ? '&start=' + x.media.start : ''}${x.media.end ? '&end=' + x.media.end : ''}" allow="fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  }
  if (a === 'reset-listening') {
    if (
      confirm(
        'Eine neue Runde beginnen? Das letzte Ergebnis bleibt gespeichert; die aktuellen Antworten werden geleert.'
      )
    ) {
      const s = lessonProgress();
      s.answers = {};
      s.checked = false;
      s.transcriptOpened = false;
      s.usedTranscript = false;
      persistPortal();
      renderListening();
    }
  }
  if (a === 'related-words') {
    const x = currentLesson();
    if (x.vocabulary?.length) {
      stopListening();
      return showVocabularySet(x.id);
    }
    const words =
      x.language === 'it'
        ? WORDS.filter(
            w =>
              x.vocabularyIds.includes(w.id) ||
              (x.media.type === 'speech' &&
                x.media.text
                  .toLocaleLowerCase()
                  .includes(w.target.replace(/^(il |la |lo |l’)/, '').toLocaleLowerCase()) &&
                w.target.length > 5)
          )
        : [];
    if (words.length) {
      config.language = x.language;
      config.direction = 'de-it';
      stopListening();
      start(words, 'cards');
      view = 'lernen';
    } else {
      nav('vokabeln');
      toast('Noch keine passende Liste verknüpft. Hier findest du den verfügbaren Wortschatz.');
    }
  }
  if (a === 'clear-history' && confirm('Den Verlauf in diesem lokalen Lernprofil leeren?')) {
    portalProfile().history = [];
    persistPortal();
    historyPage();
  }
  if (a === 'studio-load') {
    $('studio-file').value = '';
    $('studio-file').click();
  }
  if (a === 'studio-validate') validateEditorText();
  if (a === 'studio-import') acceptEditorImport();
  if (b.dataset.studioId) {
    studioSelection = b.dataset.studioId;
    editorMessage = '';
    renderStudio();
  }
  if (b.dataset.studioTab) {
    studioTab = b.dataset.studioTab;
    renderStudio();
  }
  if (a === 'studio-preview') {
    const x = editorState.items.find(x => x.payload.id === studioSelection);
    if (x?.payload.kind === 'listening') openListening(studioSelection, true);
    else if (x) {
      $('studio-preview').innerHTML = `<h3>${esc(x.payload.title)}</h3>${x.payload.entries
        .slice(0, 12)
        .map(w => `<p><b>${esc(w.target)}</b> · ${esc(w.translations.join(' / '))}</p>`)
        .join('')}`;
    }
  }
  if (a === 'studio-publish') publishEditorItem();
  if (a === 'studio-withdraw') {
    const x = editorState.items.find(x => x.payload.id === studioSelection);
    if (x) {
      x.status = 'draft';
      saveEditorState();
      renderStudio();
    }
  }
  if (a === 'studio-export') {
    const x = editorState.items.find(x => x.payload.id === studioSelection);
    if (x) downloadJSON(x.payload, x.payload.id + '.json');
  }
}
function teacherWelcomeHTML() {
  return '<section class="teacher-welcome glass"><div><div class="eyebrow">FÜR LEHRKRÄFTE</div><h2>Passendes Material. Schnell im Blick.</h2><p>Nach Sprache und Niveau auswählen, Aufgaben prüfen und ein Arbeitsblatt oder den Lösungsschlüssel ausgeben.</p></div><div class="teacher-tags"><span>Unterricht vorbereiten</span><span>Prüfungsmaterial sichten</span><span>Link zum Selbstüben teilen</span></div></section>';
}
function showTeaching(id) {
  stopListening();
  const x = contentList('listening').find(x => x.id === id);
  if (!x) return;
  teacherLessonId = id;
  const pp = portalProfile();
  if (pp.recordHistory) {
    pp.history = [
      { id, at: new Date().toISOString() },
      ...pp.history.filter(h => h.id !== id)
    ].slice(0, 60);
    persistPortal();
  }
  let dialog = $('teaching-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'teaching-dialog';
    dialog.setAttribute('aria-labelledby', 'teaching-title');
    document.body.append(dialog);
  }
  const formats = [...new Set(x.questions.map(q => LISTENING_FORMAT_LABELS[q.type]))];
  dialog.innerHTML = `<div class="dialog-head"><h2 id="teaching-title">Für deinen Unterricht</h2><button class="button secondary" data-close="teaching-dialog">Schließen</button></div><div class="eyebrow">${portalLang(x.language)} · ${x.level}</div><h3>${esc(x.title)}</h3><div class="teaching-facts"><div><b>${x.estimatedMinutes} Minuten</b><span>geschätzte Übungszeit</span></div><div><b>${x.questions.length} Aufgaben</b><span>${formats.join(' · ')}</span></div></div><p>${esc(x.description)}</p>${workingLessonNotice(x)}${x.media.type === 'speech' ? '<div class="editor-banner">Demomaterial mit synthetischer Browserstimme. Keine redaktionell freigegebene authentische Prüfungsaufnahme.</div>' : ''}<h3>Material vorbereiten</h3><p>Öffne die Druckansicht und speichere sie bei Bedarf über den Browser als PDF. Aufgaben und Lösungen werden getrennt ausgegeben.</p><div class="studio-actions"><button class="button primary" data-portal="print-questions">Aufgaben drucken / PDF</button><button class="button secondary" data-portal="print-solutions">Lösungsschlüssel drucken / PDF</button></div><h3>Für eine Prüfung prüfen</h3><p>Passt das Niveau zu deiner Lerngruppe? Sind Aufgaben, Länge und Wiedergabebedingungen geeignet? Darfst du das Medium einsetzen? Öffentliche Aufgaben und Lösungen sind Lernenden zugänglich; diese Selbstlernseite führt keine geschützte Onlineprüfung durch.</p><button class="button secondary" data-portal="back-lesson">Hörübung ansehen und Link teilen</button>`;
  dialog.showModal();
}
function printTeaching(solutions) {
  const x = contentList('listening').find(x => x.id === teacherLessonId);
  if (!x) return;
  let sheet = $('teaching-print');
  if (!sheet) {
    sheet = document.createElement('section');
    sheet.id = 'teaching-print';
    document.body.append(sheet);
  }
  sheet.innerHTML = `<div class="print-controls"><button class="button secondary" data-portal="close-print">Zurück zur Hörübung</button><button class="button primary" data-portal="do-print">Drucken / als PDF speichern</button></div><header><b>theis · daje</b><span>${solutions ? 'Lösungsschlüssel' : 'Aufgabenblatt'}</span></header><h1>${esc(x.title)}</h1><p>${portalLang(x.language)} · ${x.level} · ca. ${x.estimatedMinutes} Minuten Übungszeit</p>${!solutions ? '<p>Name: ______________________________ &nbsp; Datum: ______________</p>' : ''}${x.media.type === 'speech' ? '<p class="print-demo">Demo mit synthetischer Browserstimme; keine authentische Aufnahme.</p>' : ''}<ol>${x.questions
    .map(q => {
      const answer = solutionText(q);
      return `<li><h3>${esc(q.prompt)}</h3>${solutions ? `<p><b>${esc(answer)}</b></p><p>${esc(q.explanation)}</p>${q.type === 'short_answer' ? `<p>Weitere hinterlegte Varianten: ${esc(q.acceptedAnswers.join(' / '))}</p>` : ''}` : printBody(q)}</li>`;
    })
    .join(
      ''
    )}</ol><footer><h3>Medium und Quelle</h3>${x.sources.map(s => `<p>${esc(s.citation)}${s.url ? '<br>' + esc(s.url) : ''}</p>`).join('')}<p>${x.media.type === 'audio' ? esc(x.media.url) : x.media.type === 'youtube' ? 'https://www.youtube.com/watch?v=' + x.media.videoId : x.media.type === 'film' ? 'Film: ' + x.media.title + (x.media.year ? ' (' + x.media.year + ')' : '') + ' – Szene wird im Unterricht gezeigt.' : 'Browser-Sprachausgabe des eigenen Übungstextes im Portal.'}</p></footer>`;
  if ($('teaching-dialog')?.open) $('teaching-dialog').close();
  document.body.classList.add('previewing-teaching');
  window.scrollTo({ top: 0, behavior: 'instant' });
}

function showVocabularySet(id) {
  const x = contentList('vocabulary').find(x => x.id === id);
  if (!x) return;
  let dialog = $('vocabulary-set-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'vocabulary-set-dialog';
    dialog.setAttribute('aria-labelledby', 'vocabulary-set-title');
    document.body.append(dialog);
  }
  dialog.innerHTML = `<div class="dialog-head"><h2 id="vocabulary-set-title">${esc(x.title)}</h2><button class="button secondary" data-close="vocabulary-set-dialog">Schließen</button></div><p>${portalLang(x.language)} · ${x.level} · ${x.entries.length} Wörter</p><details class="activity-word-preview"><summary>Wörter ansehen</summary>${x.entries.map(w => `<p><b>${esc(w.target)}</b><span>${esc(w.translations.join(' / '))}</span></p>`).join('')}</details><label class="field">Abfragerichtung<select id="set-direction"><option value="de-it">Deutsch → ${portalLang(x.language)}</option><option value="it-de">${portalLang(x.language)} → Deutsch</option></select></label><div class="mode-list">${[
    ['cards', 'Karten', 'Erinnern und selbst einschätzen'],
    ['write', 'Schreiben', 'Antworten selbst eingeben'],
    ['match', 'Zuordnen', 'Wörter wiedererkennen'],
    ['definition', 'Erklärungen', 'Begriffe aus Beschreibungen finden']
  ]
    .map(
      ([mode, title, desc]) =>
        `<button class="mode" data-vocab-train="${id}" data-training-mode="${mode}" ${mode === 'definition' && !x.entries.some(w => w.definition) ? 'disabled' : ''}><b>${title}</b><small>${desc}</small></button>`
    )
    .join(
      ''
    )}</div><p class="small muted">Runden enthalten bis zu ${config.count} Einträge. Bildkarten sind nur bei redaktionell zugeordneten Bildern verfügbar.</p>`;
  dialog.showModal();
}

function allTrainingWords() {
  return [
    ...WORDS,
    ...contentList('vocabulary').flatMap(x =>
      x.entries.map(w => ({
        id: x.id + '-' + w.id,
        target: w.target,
        translations: w.translations,
        acceptedAnswers: w.acceptedAnswers,
        grammar: w.grammar,
        answerPolicy: w.answerPolicy,
        language: x.language,
        label: x.section === x.title ? x.title : x.title + ' · ' + x.section,
        def: w.definition,
        example: w.example,
        related: w.related,
        usage: w.usage,
        ipa: w.ipa,
        audio: w.audio,
        image: w.image
      }))
    )
  ];
}
