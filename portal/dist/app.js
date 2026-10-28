'use strict';
const $ = id => document.getElementById(id);
const esc = s =>
  String(s).replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]
  );
const read = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    toast(
      'Dein Browser erlaubt gerade keine dauerhafte Speicherung. Bitte exportiere deinen Lernstand.'
    );
    return false;
  }
};
const params = new URLSearchParams(location.search);
let config = {
  language: 'it',
  bookId: 'ecco-piu-1-9783060229062',
  chapter: ['ciao', '1', 'approccio', '1a', '1b'].includes(params.get('kapitel'))
    ? params.get('kapitel')
    : '1',
  scope: params.get('umfang') === 'bis' ? 'bis' : 'nur',
  mode: ['cards', 'write', 'photo', 'definition', 'match'].includes(params.get('modus'))
    ? params.get('modus')
    : 'cards',
  direction: params.get('richtung') === 'it-de' ? 'it-de' : 'de-it',
  count: [5, 10, 20].includes(Number(params.get('anzahl'))) ? Number(params.get('anzahl')) : 10
};
let prefs = {
    font: 'standard',
    ...read('ecco-look-v1', { skin: 'daje', appearance: 'system', phase: 'auto' })
  },
  records = read('ecco-progress-v1', {}),
  view = 'lernen',
  session = null;
// Bewusst wenige Möglichkeiten (Oktober 2026). Frühere Auswahl wird auf die nächste passende abgebildet.
const fontList = [
  ['standard', 'Standard'],
  ['atkinson', 'Atkinson · leicht lesbar'],
  ['lora', 'Lora · wie im Buch']
];
const themeList = [
  ['daje', 'daje', 'linear-gradient(135deg, #f8e3f0, #f6f5fb 55%, #e6e2ff)', '#5136d6'],
  ['pop', 'Pop', 'linear-gradient(135deg, #ff9fd0, #b9a2ff 50%, #8ff0c4)', '#ff2e93'],
  ['heft', 'Heft', '#f4efe2', '#2c4a9a'],
  ['graphit', 'Graphit', '#ffffff', '#0040d0'],
  ['wald', 'Wald', '#e8f3e9', '#2c8851'],
  ['tag', 'Tageslicht', '#fbe6cd', '#a45c3b']
];
const RETIRED_SKINS = { salbei: 'wald', laguna: 'wald', apple: 'graphit', klar: 'graphit' };
if (!themeList.some(t => t[0] === prefs.skin)) prefs.skin = RETIRED_SKINS[prefs.skin] || 'daje';
if (!fontList.some(f => f[0] === prefs.font)) prefs.font = 'standard';
const modeNames = {
  cards: 'Vokabelkarten',
  write: 'Schreiben',
  photo: 'Bildimpulse',
  definition: 'Erklärungen',
  match: 'Zuordnen'
};
const chapterName = () =>
  config.chapter === '1' ? 'Unità 1' : GROUPS.find(g => g[0] === config.chapter)?.[2] || 'Unità 1';
const dateKey = d =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const nowDate = () => dateKey(new Date());
const afterDays = n => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
function pool() {
  let p = WORDS.filter(w => w.language === config.language && w.bookId === config.bookId).filter(
    w =>
      config.chapter === '1'
        ? config.scope === 'bis' || w.order > 0
        : config.scope === 'bis'
          ? w.order <= (GROUPS.find(g => g[0] === config.chapter)?.[1] ?? 3)
          : w.group === config.chapter
  );
  return p;
}
function available() {
  let p = pool();
  return config.mode === 'photo'
    ? p.filter(w => w.photo)
    : config.mode === 'definition'
      ? p.filter(w => w.def)
      : config.mode === 'match'
        ? matchingPool(p)
        : p;
}
function shuffle(a) {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}
let toastTimer;
function toast(s) {
  if (typeof uiTranslateText === 'function') {
    const m = String(s).match(/^(Einbett-Code kopiert\. Direktlink:) (.*)$/);
    s = m ? uiTranslateText(m[1]) + ' ' + m[2] : uiTranslateText(String(s));
  }
  $('toast').textContent = s;
  $('toast').hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($('toast').hidden = true), 4000);
}
function applyLook() {
  const root = document.documentElement;
  root.dataset.skin = prefs.skin;
  root.dataset.font = fontList.some(f => f[0] === prefs.font) ? prefs.font : 'standard';
  root.dataset.theme =
    prefs.appearance === 'system'
      ? matchMedia('(prefers-color-scheme:dark)').matches
        ? 'dark'
        : 'light'
      : prefs.appearance;
  const hour = new Date().getHours();
  root.dataset.phase =
    prefs.phase === 'auto'
      ? hour < 6
        ? 'nacht'
        : hour < 9
          ? 'morgen'
          : hour < 12
            ? 'vormittag'
            : hour < 15
              ? 'mittag'
              : hour < 18
                ? 'nachmittag'
                : hour < 21
                  ? 'abend'
                  : 'nacht'
      : prefs.phase;
  $('appearance').value = prefs.appearance;
  $('appearance').disabled = prefs.skin === 'tag';
  $('phase').value = prefs.phase;
  $('phase-field').hidden = prefs.skin !== 'tag';
  $('theme-grid').innerHTML = themeList
    .map(
      ([key, name, bg, accent]) =>
        `<button class="theme-choice" data-skin="${key}" aria-pressed="${prefs.skin === key}"><span class="theme-swatch" style="--sample:${bg};--sample-accent:${accent}"></span>${name}</button>`
    )
    .join('');
  $('font-grid').innerHTML = fontList
    .map(
      ([key, name]) =>
        `<button class="font-choice" data-font="${key}" aria-pressed="${root.dataset.font === key}"><b>Aa</b><span>${name}</span></button>`
    )
    .join('');
}
applyLook();
matchMedia('(prefers-color-scheme:dark)').addEventListener('change', () => applyLook());
function nav(next) {
  stopListening();
  view = next;
  session = null;
  markNav(next);
  $('breadcrumb').textContent =
    {
      start: 'Dein Lernbereich',
      hoeren: 'Hörverstehen',
      vokabeln: 'Wortschatz',
      sammlung: 'Deine Merkliste',
      verlauf: 'Dein Verlauf',
      redaktion: 'Eigene Übungen',
      lernen: 'Wortschatz trainieren',
      wortschatz: 'Dein Wortschatz',
      fortschritt: 'Dein Fortschritt',
      verben: 'Verben',
      grammatik: 'Grammatik',
      zahlen: 'Zahlen, Uhrzeit, Datum',
      quellen: 'Quellen und Bildnachweise',
      hilfe: 'Hilfe · Lerntipps'
    }[next] || 'Dein Lernbereich';
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function render() {
  document.body.classList.toggle('in-session', !!session);
  if (session) return renderSession();
  (
    ({
      start: portalHome,
      hoeren: listeningCatalog,
      vokabeln: vocabularyLibrary,
      sammlung: favoritePage,
      verlauf: historyPage,
      redaktion: renderStudio,
      lernen: home,
      wortschatz: collection,
      fortschritt: progress,
      quellen: sources,
      verben: () => verbsPage(),
      grammatik: () => grammarPage(),
      zahlen: () => numbersPage(),
      hilfe: help
    })[view] || home
  )();
}
function home() {
  config.language = 'it';
  config.bookId = 'ecco-piu-1-9783060229062';
  const total = pool().length,
    eligible = available().length;
  $('main').innerHTML =
    `<header class="page-head"><div class="eyebrow">Wortschatz</div><h1>Heute üben</h1></header>
 ${recommendationHTML()}<div class="training-layout"><section class="panel glass"><h3>Dein Lernstoff</h3><label class="field language-picker">Sprache<select id="target-language" aria-label="Zielsprache"><option value="it">Italienisch · Material verfügbar</option value="fr" disabled>Französisch · in Vorbereitung</option><option value="en" disabled>Englisch · in Vorbereitung</option><option value="es" disabled>Spanisch · in Vorbereitung</option></select></label><div class="book-row" aria-label="Band"><button aria-pressed="true">Primo anno</button><button disabled>Secondo anno</button><button disabled>Terzo anno</button></div><button class="chapter-choice chapter-row ${config.chapter === 'ciao' ? 'selected' : ''}" data-chapter="ciao" aria-pressed="${config.chapter === 'ciao'}"><span class="chapter-num">Ciao</span><span><b>Die ersten Worte</b><small>Ciao! · ${WORDS.filter(w => w.group === 'ciao').length} Einträge</small></span><span class="chapter-check" aria-hidden="true"></span></button><button class="chapter-choice chapter-row ${config.chapter !== 'ciao' ? 'selected' : ''}" data-chapter="1" aria-pressed="${config.chapter !== 'ciao'}"><span class="chapter-num">1</span><span><b>Benvenuti a Torino</b><small>Unità 1 · ${WORDS.filter(w => w.order > 0).length} Einträge</small></span><span class="chapter-check" aria-hidden="true"></span></button><div class="subchapters" aria-label="Teilkapitel">${[
   ['1', 'Gesamt'],
   ['approccio', 'Approccio'],
   ['1a', '1A'],
   ['1b', '1B']
 ]
   .map(
     ([v, l]) => `<button data-chapter="${v}" aria-pressed="${config.chapter === v}">${l}</button>`
   )
   .join(
     ''
   )}</div><div class="seg" aria-label="Lernumfang"><button data-scope="nur" aria-pressed="${config.scope === 'nur'}">Nur diese Auswahl</button><button data-scope="bis" aria-pressed="${config.scope === 'bis'}">Alles bis hier</button></div><p class="selection-note">${esc(chapterName())} · ${total} Einträge${config.scope === 'bis' ? ' einschließlich der vorherigen Abschnitte' : ''}</p></section>
 <section class="panel glass"><h3>So möchtest du lernen</h3><div class="mode-list">${[
   ['cards', 'Karten', 'Denken, umdrehen, einschätzen'],
   ['write', 'Schreiben', 'Aus dem Gedächtnis eingeben'],
   ['photo', 'Mit Bildern', 'Das passende Wort finden'],
   ['definition', 'Auf Italienisch', 'Erklärungen verstehen'],
   ['match', 'Zuordnen', 'Wörter und Bedeutungen verbinden']
 ]
   .map(
     ([v, l, t]) =>
       `<button class="mode" data-mode="${v}" aria-pressed="${config.mode === v}"><b>${l}</b><small>${t}</small></button>`
   )
   .join(
     ''
   )}</div><div class="settings-row"><label class="field">Runde<select id="round-count">${[5, 10, 20].map(n => `<option value="${n}" ${config.count === n ? 'selected' : ''}>${n} Wörter</option>`).join('')}</select></label><label class="field">Richtung<select id="direction" ${['photo', 'definition', 'match'].includes(config.mode) ? 'disabled' : ''}><option value="de-it" ${config.direction === 'de-it' ? 'selected' : ''}>Deutsch → Italienisch</option><option value="it-de" ${config.direction === 'it-de' ? 'selected' : ''}>Italienisch → Deutsch</option></select></label></div><button class="button primary full large" data-action="start" ${eligible ? '' : 'disabled'}>Runde starten · ${Math.min(config.count, eligible)} Wörter</button><p class="learn-help">${config.mode === 'match' ? 'Paare verbinden, dann ohne Auswahl erinnern. Dieser Modus verändert deine Wiederholungsstufen nicht.' : config.mode === 'photo' ? `${eligible} passende Bildkarten in dieser Auswahl.` : config.mode === 'definition' ? `${eligible} eigene italienische Erklärungen in dieser Auswahl.` : 'Ohne Anmeldung. Dein Fortschritt bleibt auf diesem Gerät.'}</p></section></div>
<p class="load-note">Wortschatz des ersten Lernjahres. <button class="quiet" data-nav="hilfe">Wie lerne ich sinnvoll?</button></p>`;
}
/* Wörter nachschlagen: Suche über alle Wortlisten (Lehrwerke, Themenlisten, eigene). */
function collection(query = '') {
  const norm = t => String(t).toLocaleLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const q = norm(query.trim());
  const lists = contentList('vocabulary');
  const total = lists.reduce((n, x) => n + x.entries.length, 0);
  const hits = [];
  if (q.length >= 2)
    for (const x of lists) {
      for (const w of x.entries)
        if (norm(w.target + ' ' + w.translations.join(' ')).includes(q)) hits.push({ x, w });
      if (hits.length >= 80) break;
    }
  const results = !q
    ? '<p class="muted">Tippe mindestens zwei Buchstaben, auf Italienisch, Englisch oder Deutsch.</p>'
    : q.length < 2
      ? ''
      : hits
          .map(
            ({ x, w }) =>
              `<article class="word-item glass"><div><b lang="${esc(x.language)}">${esc(w.target)}</b><small>${esc(w.translations.join(' / '))}</small><small>${esc(x.title)}</small></div><button class="quiet" data-vocab-set="${esc(x.id)}">Liste üben</button></article>`
          )
          .join('') || '<p class="muted">Kein passender Eintrag gefunden.</p>';
  if (view === 'wortschatz' && $('word-results')) {
    $('word-results').innerHTML = results;
    return;
  }
  $('main').innerHTML = `<div class="page"><header class="page-head"><div class="eyebrow">Wortschatz</div><h1>Wörter nachschlagen</h1><p>${total} Einträge aus ${lists.length} Listen.</p></header><div class="collection-tools"><input class="search" id="word-search" type="search" aria-label="Wortschatz durchsuchen" placeholder="z. B. stazione oder Bahnhof" value="${esc(query)}" autocomplete="off" autocapitalize="none" spellcheck="false"></div><div class="word-list" id="word-results">${results}</div></div>`;
}
function progress() {
  progressV2();
}
function sources() {
  $('main').innerHTML =
    `<div class="page-title"><div class="eyebrow">TRANSPARENT DOKUMENTIERT</div><h1>Quellen und Bildnachweise.</h1><p>Hier findest du Bildquellen, Schriften und Hinweise zu den Inhalten.</p></div>${Object.entries(
      PHOTOS
    )
      .map(
        ([id, x]) =>
          `<article class="source-item glass" id="source-${id}"><img src="${x.file}" alt="${x.alt}"><div><h3>${esc(x.title)}</h3><p>${esc(x.author)} · ${x.platform} · ${x.license}</p><p>${x.changes} Recherche und Abruf: 24. Oktober 2026.</p><div class="source-links"><a href="${x.source}" target="_blank" rel="noopener">Original und Urheber</a><a href="${x.licenseUrl}" target="_blank" rel="noopener">Lizenzbedingungen</a></div></div></article>`
      )
      .join(
        ''
      )}<section class="source-text glass"><h3>Vorschaubilder der Hörübungen</h3><p>Die Titelbilder der Hörübungen sind für daje gestaltet: Schrift und Farbe, keine Fotos. Vorschaubilder werden nicht von YouTube geladen; eine Verbindung zum Anbieter entsteht erst beim Abspielen. Einige Videos zeigen im Player ein Standbild des Originalvideos. Originalquelle und Anbieter stehen bei jeder Hörübung unter Quelle und Hinweise.</p></section><section class="source-text glass"><h3>Wortschatz und Grammatik</h3><p>Die Wortlisten und Grammatikübungen sind nach Lernjahren gegliedert (Primo, Secondo, Terzo anno) und orientieren sich am Lehrplan für Italienisch als dritte Fremdsprache. Erklärungen, Beispielsätze und Übungen sind eigene Formulierungen für daje.</p></section><section class="source-text glass"><h3>Gestaltung und Schrift</h3><p>Eigene Farbwelt daje und vier weitere Farbwelten. Schriften: Inter (Rasmus Andersson), Schibsted Grotesk (Bakken & Bæck), Atkinson Hyperlegible (Braille Institute) und Lora (Cyreal), alle unter der SIL Open Font License.</p><div class="source-links"><a href="https://github.com/google/fonts/tree/main/ofl/schibstedgrotesk" target="_blank" rel="noopener">Schibsted Grotesk und Lizenz</a><a href="https://rsms.me/inter/" target="_blank" rel="noopener">Inter und Lizenz</a><button class="quiet" data-nav="hilfe">Wissenschaftliche Quellen der Lerntipps</button></div></section>`;
}
function verbs() {
  const v = $('verb-select')?.value || 'essere';
  $('main').innerHTML =
    `<div class="page-title"><div class="eyebrow">ERWEITERUNG ZUM AUSPROBIEREN</div><h1>Verbi al presente.</h1><p>Ein erster Einblick in den Verbentrainer mit fünf Verben. Die vollständige Verknüpfung mit allen Lernabschnitten folgt später.</p></div><section class="panel glass"><div class="verb-selects"><label class="field">Verb<select id="verb-select">${Object.keys(
      VERBS
    )
      .map(x => `<option ${x === v ? 'selected' : ''}>${x}</option>`)
      .join(
        ''
      )}</select></label><label class="field">Zeit<select disabled><option>Presente</option></select></label></div><form id="verb-form"><table class="verb-table" aria-label="Verbformen eingeben"><tbody>${['io', 'tu', 'lui / lei', 'noi', 'voi', 'loro'].map((person, i) => `<tr><td><label for="verb-${i}">${person}</label></td><td><input id="verb-${i}" name="verb-${i}" autocomplete="off" autocapitalize="none" spellcheck="false" lang="${config.language}" aria-label="${person} ${v}"><span class="verb-result" id="verb-result-${i}" aria-live="polite"></span></td></tr>`).join('')}</tbody></table><button class="button primary" type="submit">Formen prüfen</button><button class="button secondary" type="reset">Noch einmal</button></form></section>`;
}
function help() {
  helpV2();
}
function start(custom, mode) {
  if ((mode || config.mode) === 'match') return startMatching(custom || available());
  const words = custom || available();
  if (!words.length) {
    toast('Für diesen Modus ist in der Auswahl noch kein Eintrag vorhanden.');
    return;
  }
  session = {
    words: shuffle(words).slice(0, Math.min(config.count, words.length)),
    index: 0,
    mode: mode || config.mode,
    flipped: false,
    checked: false,
    correct: false,
    feedback: '',
    hint: '',
    draft: '',
    usedHint: false,
    assisted: 0,
    good: 0,
    missed: []
  };
  renderSession();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function renderSession() {
  const s = session;
  document.body.classList.toggle('in-session', !!s);
  if (!s) return;
  if (s.mode === 'match') return renderMatching();
  if (s.index >= s.words.length) return finish();
  const w = s.words[s.index];
  config.language = w.language || config.language;
  const reverse = config.direction === 'it-de',
    photo = s.mode === 'photo',
    def = s.mode === 'definition',
    cards = s.mode === 'cards',
    prompt = def ? w.def : reverse ? w.target : w.translations[0],
    answer = photo || def || !reverse ? w.target : w.translations.join(' / ');
  $('breadcrumb').textContent = `${modeNames[s.mode]} · ${w.label}`;
  const feedback = s.checked
    ? `<div class="feedback ${s.correct ? 'good' : 'bad'}" role="status">${esc(s.feedback)}${!s.correct ? `<br><b>${esc(answer)}</b>` : ''}</div>`
    : s.hint
      ? `<div class="feedback hint" role="status">${esc(s.hint)}</div>`
      : '';
  const form =
    !cards && !s.checked
      ? `<form class="answer-form" id="answer-form"><label class="small muted" for="answer">${photo || def || !reverse ? 'Auf ' + portalLang(config.language) + ', mit Artikel' : 'Auf Deutsch'}</label><input class="answer-input" id="answer" autocomplete="off" autocapitalize="none" spellcheck="false" lang="${photo || def || !reverse ? config.language : 'de'}" placeholder="Deine Antwort" enterkeyhint="done" value="${esc(s.draft || '')}" required><button class="button primary" type="submit">Prüfen</button><button class="button secondary" type="button" data-action="word-hint">Tipp</button></form>`
      : '';
  const content = photo
    ? `<div class="flashcard photo-card"><img src="${PHOTOS[w.photo].file}" alt="${PHOTOS[w.photo].alt}"><div class="photo-content"><div class="eyebrow">Auf Italienisch?</div>${s.checked ? `<div class="word-display" lang="${config.language}">${esc(answer)}</div>${speakHTML(w)}` : ''}${form}${feedback}</div></div>`
    : `<div class="flashcard ${cards && !s.flipped ? 'tappable' : ''}" ${cards && !s.flipped ? 'data-action="flip" role="button" tabindex="0" aria-label="Karte umdrehen"' : ''}><div class="eyebrow">${def ? 'Welcher Begriff?' : s.flipped ? 'Lösung' : reverse ? portalLang(config.language) : 'Deutsch'}</div>${w.image && !(cards && s.flipped) ? `<img class="card-image" src="${esc(w.image)}" alt="">` : ''}<div class="word-display ${def ? 'is-definition' : ''}" ${s.flipped || reverse || def ? `lang="${config.language}"` : ''}>${esc(cards && s.flipped ? answer : prompt).replace(/\//g, '/<wbr>')}</div>${cards && s.flipped ? speakHTML(w) : ''}${cards && s.flipped && w.example ? `<p class="card-example" lang="${config.language}">${esc(w.example)}</p>` : ''}${cards && s.flipped && w.contrast ? `<p class="card-contrast"><b>Unterscheide</b><span lang="${config.language}">${esc(w.contrast)}</span></p>` : ''}${cards && s.flipped ? wordLinksHTML(w, config.language) : ''}${cards && s.flipped && w.related ? relatedHTML(w.related) : ''}${cards ? '' : form + feedback}</div>`;
  const actions = cards
    ? s.flipped
      ? '<button class="button secondary large" data-rate="no">Nochmal</button><button class="button primary large" data-rate="yes">Gewusst</button>'
      : '<button class="button primary large" data-action="flip">Lösung zeigen</button>'
    : s.checked
      ? '<button class="button primary large" data-action="next">Weiter</button>'
      : '<button class="quiet" data-action="reveal">Weiß ich nicht</button>';
  $('main').innerHTML =
    `<div class="session-top"><button class="close-btn" data-action="end" aria-label="Runde beenden"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button><div class="progress-track" role="progressbar" aria-label="${modeNames[s.mode]}: bearbeitete Karten" aria-valuemin="0" aria-valuemax="${s.words.length}" aria-valuenow="${s.index}"><div class="progress-fill" style="width:${(100 * s.index) / s.words.length}%"></div></div><span class="session-count">${s.index + 1} / ${s.words.length}</span></div><section class="session">${content}<div class="session-actions">${actions}</div></section>`;
}
function speakHTML(w) {
  if (!w.ipa && !w.audio && !('speechSynthesis' in window)) return '';
  return `<div class="speak-row">${w.ipa ? `<span class="ipa">/${esc(w.ipa.replace(/^\/|\/$/g, ''))}/</span>` : ''}<button class="speak-btn" data-action="speak" aria-label="Aussprache anhören" type="button"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg></button></div>`;
}
function speakWord() {
  const w = session?.words[session.index];
  if (!w) return;
  if (w.audio) {
    new Audio(w.audio).play().catch(() => {});
    return;
  }
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  // Wörterbuch-Schreibweisen (bello/-a, qn, (-sc-), einzelnes „è“) sprechbar machen (speech.js).
  const lang = w.language || config.language;
  const u = new SpeechSynthesisUtterance(w.say || speakable(w.target, lang));
  u.lang = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR', es: 'es-ES' }[lang] || 'it-IT';
  u.voice = pickVoice(u.lang);
  u.rate = 0.9;
  speechSynthesis.speak(u);
}
const normalize = t =>
  t
    .normalize('NFC')
    .toLocaleLowerCase()
    .replace(/[’‘`´]/g, "'")
    .trim()
    .replace(/[.!?]+$/g, '')
    .trim()
    .replace(/\s+/g, ' ');
const noAccent = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
let synCache = { sig: '', map: null };
const synKey = t => TheisGrading.norm(String(t).replace(/\s*\([^)]*\)/g, '').replace(/^hier:\s*/i, ''));
// Gleichbedeutende Wörter: andere Einträge, die dieselbe (erste) Übersetzung teilen, z. B. adesso/ora = jetzt.
function siblingsOf(w) {
  const all = allTrainingWords(),
    sig = all.length + ':' + w.language;
  if (synCache.sig !== sig) {
    const map = new Map();
    all.forEach(x =>
      (x.translations || []).forEach((t, i) => {
        const k = synKey(t);
        if (k.length < 3) return;
        if (!map.has(k)) map.set(k, []);
        map.get(k).push({ w: x, first: i === 0 });
      })
    );
    synCache = { sig, map };
  }
  const out = new Map(),
    noun = x => x.grammar?.partOfSpeech === 'noun';
  (w.translations || []).forEach((t, i) =>
    (synCache.map.get(synKey(t)) || []).forEach(e => {
      if (e.w.id === w.id || e.w.language !== w.language || noun(e.w) !== noun(w)) return;
      if (!(i === 0 || e.first)) return;
      if (TheisGrading.norm(e.w.target) === TheisGrading.norm(w.target)) return;
      out.set(e.w.id, e.w.target);
    })
  );
  return [...out.values()];
}
// Synonyme, Gegenteil, Wortfamilie (wie die dritte Spalte im Schulbuch)
function wordLinksHTML(w, lang) {
  const rows = [['≈', 'Synonym', w.synonyms], ['↔', 'Gegenteil', w.antonyms], ['→', 'Wortfamilie', w.family]].filter(r => r[2]);
  return rows.length
    ? `<p class="card-links">${rows.map(([sym, name, v]) => `<span class="lnk" title="${name}"><b aria-label="${name}">${sym}</b> <span lang="${lang}">${esc(v)}</span></span>`).join('')}</p>`
    : '';
}
// "E: inhabitant; F: l’habitant; L: …" als kleine Chips
function relatedHTML(r) {
  const names = { E: 'Englisch', F: 'Französisch', L: 'Latein', S: 'Spanisch', D: 'Deutsch' };
  const chips = String(r)
    .split(/\s*[;·]\s*/)
    .filter(Boolean)
    .map(p => {
      const m = p.match(/^([EFLSD])\s*:?\s+(.+)$/);
      return m ? `<span class="rel" title="${names[m[1]]}"><b>${m[1]}</b> ${esc(m[2])}</span>` : `<span class="rel">${esc(p)}</span>`;
    })
    .join('');
  return `<p class="card-related" aria-label="Verwandte Wörter">${chips}</p>`;
}
function checkAnswer() {
  const s = session,
    w = s.words[s.index],
    raw = $('answer').value.trim();
  if (!raw) return;
  s.draft = raw;
  const rev = !(s.mode === 'photo' || s.mode === 'definition' || config.direction === 'de-it');
  const result = TheisGrading.compare(w, raw, rev, rev ? [] : siblingsOf(w));
  if (result.status === 'hint') {
    s.usedHint = true;
    s.hint = TheisGrading.hint(w, result.kind, !(s.mode === 'photo' || s.mode === 'definition' || config.direction === 'de-it'));
    renderSession();
    return;
  }
  s.correct = result.status === 'correct';
  s.feedback = s.correct
    ? s.usedHint
      ? 'Richtig – mit Hilfestellung.'
      : 'Richtig. Gut erinnert!'
    : 'Noch nicht erkannt. Vergleiche mit der Lösung.';
  if (result.kind === 'article_optional')
    s.feedback = 'Das Wort stimmt. In dieser Liste ist der Artikel optional.';
  if (result.kind === 'article_indef') s.feedback = 'Richtig. Im Buch steht: ' + w.target;
  if (result.kind === 'synonym') s.feedback = 'Auch richtig! Im Buch steht: ' + w.target;
  s.checked = true;
  s.hint = '';
  s.hintLevel = 0;
  if (s.correct && s.usedHint) {
    rateAssistedWord(w);
    s.assisted++;
  } else rateWord(w, s.correct, 'checked');
  if (s.correct) s.good++;
  else s.missed.push(w);
  renderSession();
}
function rateAssistedWord(w) {
  const old = records[w.id] || { step: 0 };
  records[w.id] = {
    step: old.step,
    difficult: old.difficult || false,
    due: afterDays(1),
    lastDay: nowDate(),
    method: 'assisted',
    attempts: (old.attempts || 0) + 1
  };
  addActivity(w, true, 'checked');
}
function rateWord(w, good, method) {
  const old = records[w.id] || { step: 0 };
  const step = good
    ? old.lastDay === nowDate()
      ? Math.max(1, old.step)
      : Math.min(4, old.step + 1)
    : 0;
  records[w.id] = {
    step,
    difficult: !good,
    due: afterDays([1, 1, 3, 7, 14][step]),
    lastDay: nowDate(),
    method,
    attempts: (old.attempts || 0) + 1
  };
  addActivity(w, good, method);
}
function finish() {
  const s = session;
  $('main').innerHTML =
    `<section class="round-result glass" style="border-radius:26px"><div class="eyebrow">RUNDE ABGESCHLOSSEN</div><div class="result-number">${s.good} / ${s.words.length}</div><h1>Un passo avanti.</h1><p class="muted">${s.mode === 'cards' ? 'So viele Antworten hast du als gekonnt eingeschätzt.' : s.mode === 'match' ? 'So viele Paare hast du beim ersten Versuch verbunden. Zuordnen trainiert das Wiedererkennen und verändert deine Wiederholungsstufen nicht.' : 'So viele Antworten hast du richtig eingegeben.'} ${s.mode === 'match' ? 'Probiere danach Schreiben: Findest du die Wörter auch ohne Auswahl?' : 'Dein Lernprofil wird in diesem Browser gespeichert. Sichere es für den Gerätewechsel.'}</p>${s.assisted ? `<p class="small muted">${s.assisted} Antworten mit Hilfestellung. Dafür steigt die Wiederholungsstufe nicht.</p>` : ''}${roundReviewHTML(s)}<div class="session-actions">${s.missed.length ? '<button class="button primary" data-action="retry">Schwierige Wörter noch einmal</button>' : ''}${s.mode === 'match' ? '<button class="button primary" data-extra="match-write">Diese Wörter schreiben</button>' : ''}<button class="button secondary" data-nav="lernen">Zur Auswahl</button><button class="button secondary" data-nav="fortschritt">Mein Fortschritt</button></div><button class="quiet small" data-nav="hilfe">Wann sollte ich wiederholen?</button></section>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('button,[data-nav],[data-action=flip]');
  if (!b) return;
  const a = b.dataset.action;
  if (b.dataset.nav) {
    e.preventDefault();
    return nav(b.dataset.nav);
  }
  if (b.dataset.close) {
    $(b.dataset.close).close();
    return;
  }
  if (b.dataset.font) {
    prefs.font = b.dataset.font;
    applyLook();
    save('ecco-look-v1', prefs);
    return;
  }
  if (b.dataset.skin) {
    prefs.skin = b.dataset.skin;
    applyLook();
    save('ecco-look-v1', prefs);
    return;
  }
  if (b.dataset.chapter) {
    config.chapter = b.dataset.chapter;
    return home();
  }
  if (b.dataset.scope) {
    config.scope = b.dataset.scope;
    return home();
  }
  if (b.dataset.mode) {
    config.mode = b.dataset.mode;
    return home();
  }
  if (b.dataset.photo) {
    config.chapter = '1';
    config.mode = 'photo';
    const w = WORDS.find(w => w.photo === b.dataset.photo);
    return start([w], 'photo');
  }
  if (b.dataset.word) {
    const w = WORDS.find(w => w.id === b.dataset.word);
    return start([w], 'cards');
  }
  if (b.dataset.rate) {
    const good = b.dataset.rate === 'yes',
      w = session.words[session.index];
    rateWord(w, good, 'self');
    if (good) session.good++;
    else session.missed.push(w);
    session.index++;
    session.flipped = false;
    return renderSession();
  }
  if (a === 'word-hint') {
    session.draft = $('answer')?.value || '';
    session.usedHint = true;
    if (session.hintFor !== session.index) {
      session.hintFor = session.index;
      session.hintLevel = 0;
    }
    session.hintLevel += 1;
    session.hint = TheisGrading.hint(
      session.words[session.index],
      undefined,
      !(session.mode === 'photo' || session.mode === 'definition' || config.direction === 'de-it'),
      session.hintLevel
    );
    return renderSession();
  }
  if (a === 'start') return start();
  if (a === 'allphotos') {
    config.chapter = '1';
    config.mode = 'photo';
    return start(
      WORDS.filter(w => w.photo),
      'photo'
    );
  }
  if (a === 'speak') speakWord();
  if (a === 'flip') {
    session.flipped = true;
    return renderSession();
  }
  if (a === 'end') {
    session = null;
    return nav('lernen');
  }
  if (a === 'next') {
    session.index++;
    session.flipped = false;
    session.checked = false;
    session.usedHint = false;
    session.hint = '';
    session.draft = '';
    return renderSession();
  }
  if (a === 'reveal') {
    const w = session.words[session.index];
    session.checked = true;
    session.correct = false;
    session.feedback = 'Das übst du noch. Die Lösung lautet:';
    rateWord(w, false, 'checked');
    session.missed.push(w);
    return renderSession();
  }
  if (a === 'retry') return start(session.missed, session.mode);
  if (a === 'due')
    return start(
      allTrainingWords().filter(w => records[w.id]?.due <= nowDate()),
      'cards'
    );
  if (a === 'difficult')
    return start(
      allTrainingWords().filter(w => records[w.id]?.difficult),
      'cards'
    );
  if (a === 'reset-progress') {
    if (
      confirm('Den Lernstand im aktuellen Profil zurücksetzen? Andere Profile bleiben erhalten.')
    ) {
      records = {};
      activeProfile().records = records;
      activeProfile().history = {};
      persistProfiles();
      progress();
      toast('Dieses Lernprofil wurde zurückgesetzt.');
    }
    return;
  }
  if (b.id === 'look-open') $('look-dialog').showModal();
  if (b.id === 'share') {
    if (view === 'hoeruebung') {
      const u = new URL(location.href);
      u.search = '';
      u.hash = '';
      u.searchParams.set('hoeren', openedListening);
      $('share-url').value = u.href;
      $('copy-result').textContent =
        'Der Link öffnet diese Hörübung. Persönliche Antworten und Notizen werden nicht geteilt.';
      const sq = $('share-qr');
      sq.innerHTML = typeof qrSVG === 'function' ? qrSVG(u.href, 'QR-Code zur Hörübung') : '';
      sq.hidden = !sq.innerHTML;
      $('share-dialog').showModal();
      return;
    }
    const u = new URL(location.href);
    u.search = '';
    u.hash = '';
    u.searchParams.set('kapitel', config.chapter);
    u.searchParams.set('umfang', config.scope);
    u.searchParams.set('modus', config.mode);
    u.searchParams.set('richtung', config.direction);
    u.searchParams.set('anzahl', config.count);
    $('share-url').value = u.href;
    $('copy-result').textContent = '';
    if ($('share-qr')) $('share-qr').hidden = true;
    $('share-dialog').showModal();
  }
  if (b.id === 'copy-link') {
    navigator.clipboard
      .writeText($('share-url').value)
      .then(() => ($('copy-result').textContent = 'Link kopiert.'))
      .catch(() => {
        $('share-url').select();
        $('copy-result').textContent = 'Bitte den markierten Link kopieren.';
      });
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'round-count') config.count = Number(el.value);
  if (el.id === 'direction') config.direction = el.value;
  if (['round-count', 'direction'].includes(el.id)) home();
  if (el.id === 'appearance') {
    prefs.appearance = el.value;
    applyLook();
    save('ecco-look-v1', prefs);
  }
  if (el.id === 'phase') {
    prefs.phase = el.value;
    applyLook();
    save('ecco-look-v1', prefs);
  }
  if (el.id === 'verb-select') verbs();
});
document.addEventListener('input', e => {
  if (e.target.id === 'answer' && session) session.draft = e.target.value;
  if (e.target.id === 'word-search') collection(e.target.value);
});
document.addEventListener('submit', e => {
  if (e.target.id === 'answer-form') {
    e.preventDefault();
    checkAnswer();
  }
});
fetch('assets/theis.svg')
  .then(r => r.text())
  .then(s => {
    if (s.startsWith('<svg')) {
      $('brand-logo').innerHTML = s;
      if ($('brand-logo-m')) $('brand-logo-m').innerHTML = s;
    }
  })
  .catch(() => ($('brand-logo').textContent = 'theis'));
setupExtras();
setupPortal();
setupShell();
setupI18n();
mirrorLanguageSelect();
applyLook();
// Gewürfelte Runden (wf-…) öffnet wuerfel.js, das später geladen wird.
if (params.get('hoeren') && !/^wf-/.test(params.get('hoeren'))) openListening(params.get('hoeren'));
else if (params.get('reihe')) openSeries(params.get('reihe'));
else nav(params.has('kapitel') ? 'lernen' : 'start');
setInterval(() => {
  if (prefs.skin === 'tag' && prefs.phase === 'auto') applyLook();
}, 60000);
