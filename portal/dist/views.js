'use strict';
/*
 * Ansichten des Portals: Startseite, Hörkatalog, Übungsseite und Wortschatzbibliothek.
 * Wird nach portal.js geladen und nutzt dessen Zustand (portalAudience, portalFilters, contentList ...).
 * Die Markup-Bausteine sind klein gehalten, damit Änderungen am Design nachvollziehbar bleiben.
 */

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const MEDIA_LABELS = { video: 'Video', audio: 'Audio', speech: 'Stimme', film: 'Film', link: 'Weblink' };
const TRANSCRIPT_LABELS = {
  it: {
    auto: 'Trascrizione generata automaticamente',
    provider: 'Trascrizione del fornitore',
    own: 'Trascrizione propria',
    reviewed: 'Trascrizione verificata'
  },
  en: {
    auto: 'Automatically generated transcript',
    provider: 'Transcript from the provider',
    own: 'Our own transcript',
    reviewed: 'Verified transcript'
  },
  fr: {
    auto: 'Transcription générée automatiquement',
    provider: 'Transcription du fournisseur',
    own: 'Transcription propre',
    reviewed: 'Transcription vérifiée'
  },
  es: {
    auto: 'Transcripción generada automáticamente',
    provider: 'Transcripción del proveedor',
    own: 'Transcripción propia',
    reviewed: 'Transcripción verificada'
  }
};
let teacherKeyVisible = false;
const EMBED = new URLSearchParams(location.search).get('embed') === '1';
if (EMBED) document.documentElement.dataset.embed = '1';

const isTeacher = () => portalAudience === 'teach';
const mediaKind = x =>
  x.media.type === 'youtube' ? 'video' : x.media.type === 'audio' ? 'audio' : x.media.type === 'film' ? 'film' : x.media.type === 'link' ? 'link' : 'speech';
const levelClass = level => 'lvl-' + String(level || 'a1')[0].toLowerCase();
const levelPill = level => `<span class="lvl ${levelClass(level)}">${esc(level)}</span>`;
const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);

/* Interne Herkunfts- und Prüfhinweise gehören nicht in sichtbare Beschreibungen und Erklärungen. */
const INTERNAL_NOTE =
  /Gemini|Audioabgleich|am Audio prüfen|Abgleich mit der Aufnahme|Wiedergabe derzeit manuell|Grundlage: übermittelte Mitschrift|Rechte prüfen|übermittelt/i;
function visibleText(text) {
  const original = String(text || '').trim();
  const kept = original
    .split(/(?<=[.!?;])\s+/)
    .filter(sentence => !INTERNAL_NOTE.test(sentence))
    .join(' ')
    .trim();
  return kept || (INTERNAL_NOTE.test(original) ? '' : original);
}

/* Herkunft des Transkripts: eigenes Metadatum, nie Teil des Transkripttexts. */
function transcriptSource(x) {
  if (!x.transcript) return '';
  if (x.transcriptOrigin) return x.transcriptOrigin;
  return x.media.type === 'youtube' ? 'auto' : x.media.type === 'speech' ? 'own' : '';
}
function transcriptLabel(x) {
  const source = transcriptSource(x);
  return (TRANSCRIPT_LABELS[x.language] || TRANSCRIPT_LABELS.en)[source] || '';
}

function lessonStatus(x) {
  const progress = portalProfile().listening[x.id];
  const answered = Object.values(progress?.answers || {}).filter(v => String(v).trim()).length;
  return {
    progress,
    answered,
    done: !!progress?.lastResult,
    percent: progress?.lastResult
      ? Math.round((100 * progress.lastResult.correct) / progress.lastResult.total)
      : Math.round((100 * answered) / x.questions.length)
  };
}

/* ---------- Karten ---------- */

function lessonCard(x) {
  const st = lessonStatus(x);
  const teacher = isTeacher();
  const working = teacher && isWorkingLesson(x);
  const action = teacher
    ? 'Material ansehen'
    : st.done
      ? 'Erneut üben'
      : st.answered
        ? 'Weiterlernen'
        : 'Üben';
  const state = teacher
    ? plural(x.questions.length, 'Aufgabe', 'Aufgaben') + ' mit Lösungen'
    : st.done
      ? `${st.progress.lastResult.correct} von ${st.progress.lastResult.total} erkannt`
      : st.answered
        ? `${st.answered} von ${x.questions.length} beantwortet`
        : 'Noch nicht bearbeitet';
  return `<article class="lcard">
    <button class="lcard-media" data-lesson="${esc(x.id)}" data-cover aria-label="${esc(x.title)} öffnen">
      ${lessonCoverHTML(x)}
      <span class="lcard-chips"><span class="chip-solid">${esc(portalLang(x.language))}</span>${levelPill(x.level)}</span>
      <span class="lcard-kind">${MEDIA_LABELS[mediaKind(x)]}</span>
      <span class="lcard-play" aria-hidden="true"></span>
    </button>
    <div class="lcard-body">
      <div class="lcard-meta"><span>${x.estimatedMinutes} Min.</span><span>${plural(x.questions.length, 'Aufgabe', 'Aufgaben')}</span>${working ? '<span class="flag">Arbeitsfassung</span>' : ''}</div>
      <h3 ${x.coverImage || PHOTOS[x.cover] ? '' : 'class="sr-only"'}><button data-lesson="${esc(x.id)}">${esc(x.title)}</button></h3>
      <p>${esc(visibleText(x.description))}</p>
      ${teacher ? '' : `<div class="lcard-progress" aria-hidden="true"><i style="width:${st.percent}%"></i></div>`}
      <div class="lcard-state">${esc(state)}</div>
      <div class="lcard-foot">
        <button class="button primary" data-lesson="${esc(x.id)}">${action}</button>
        ${teacher ? `<button class="button secondary" data-teaching="${esc(x.id)}">Aufgabenblatt</button>` : ''}
        ${favoriteButton('listening', x.id)}
      </div>
    </div>
  </article>`;
}

function setCard(x, kind) {
  const seen = x.entries.filter(w => records[x.id + '-' + w.id]).length;
  return `<article class="set-card">
    <div class="eyebrow">${esc(portalLang(x.language))} · ${esc(x.level)}${kind === 'activity' && !(x.catalog && x.catalog.origin === 'textbook') ? ' · aus einer Hörübung' : ''}</div>
    <h3>${esc(x.title.replace(/^Wortschatz · /, ''))}</h3>
    <p>${plural(x.entries.length, 'Eintrag', 'Einträge')}</p>
    <div class="lcard-progress" role="progressbar" aria-label="Geübte Einträge" aria-valuemin="0" aria-valuemax="${x.entries.length}" aria-valuenow="${seen}"><i style="width:${Math.round((100 * seen) / x.entries.length)}%"></i></div>
    <div class="lcard-state">${seen} von ${x.entries.length} schon geübt</div>
    <div class="lcard-foot"><button class="button primary" data-vocab-set="${esc(x.id)}">Üben</button>${favoriteButton('vocabulary', x.id)}</div>
  </article>`;
}
const vocabCard = x => setCard(x, 'package');

function baseVocabCard() {
  const seen = WORDS.filter(w => records[w.id]).length;
  return `<article class="set-card">
    <div class="eyebrow">Italienisch · Lehrwerk</div>
    <h3>Ecco più 1</h3>
    <p>Ciao! und Unità 1 · ${WORDS.length} aufbereitete Einträge</p>
    <div class="lcard-progress" role="progressbar" aria-label="Geübte Einträge" aria-valuemin="0" aria-valuemax="${WORDS.length}" aria-valuenow="${seen}"><i style="width:${Math.round((100 * seen) / WORDS.length)}%"></i></div>
    <div class="lcard-state">${seen} von ${WORDS.length} schon geübt</div>
    <div class="lcard-foot"><button class="button primary" data-nav="lernen">Üben</button>${favoriteButton('vocabulary', 'ecco-piu-1')}</div>
  </article>`;
}

function sectionHead(eyebrow, title, linkNav, linkText) {
  return `<div class="sec-head"><div>${eyebrow ? `<div class="eyebrow">${eyebrow}</div>` : ''}<h2>${title}</h2></div>${linkNav ? `<button class="quiet" data-nav="${linkNav}">${linkText}</button>` : ''}</div>`;
}

/* ---------- Startseite ---------- */

function dueWordCount() {
  return allTrainingWords().filter(w => records[w.id]?.due <= nowDate()).length;
}

function nextLessons(list, limit) {
  const rank = x => (lessonStatus(x).done ? 1 : 0) * 100 + LEVELS.indexOf(x.level);
  return [...list].sort((a, b) => rank(a) - rank(b)).slice(0, limit);
}

function stepCard({ kicker, title, text, action, media, progress }) {
  return `<article class="step-card">
    ${media ? `<div class="step-media" data-cover>${media}</div>` : ''}
    <div class="step-body">
      <div class="eyebrow">${kicker}</div>
      <h3>${title}</h3>
      <p>${text}</p>
      ${progress === undefined ? '' : `<div class="lcard-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>`}
      ${action}
    </div>
  </article>`;
}

function learnerHome(list, p) {
  const recent = p.history.find(h => list.some(l => l.id === h.id));
  const resume = list.find(l => l.id === recent?.id && !lessonStatus(l).done);
  const due = dueWordCount();
  const day = activeProfile().history[nowDate()];
  const goal = activeProfile().goal || 10;
  const doneToday = day?.ids.length || 0;
  const percent = Math.min(100, Math.round((100 * doneToday) / goal));
  const streak = learningStreak();
  const suggestion = resume || nextLessons(list, 1)[0];
  const fresh = !p.history.length && !Object.keys(records).length;
  const checked = Object.values(p.listening).filter(s => s.lastResult).length;
  const more = nextLessons(list, 9).filter(x => x !== suggestion).slice(0, 8);
  const st = suggestion && lessonStatus(suggestion);
  return `<section class="today">
      <div class="today-copy">
        <div class="eyebrow">Mein Lernbereich</div>
        <h1>${fresh ? 'Hören, verstehen,<br><em>behalten.</em>' : 'Weiter geht’s.'}</h1>
        <p>${fresh ? 'Kurze Hörübungen mit Rückmeldung und der passende Wortschatz dazu, in deinem Tempo.' : `<span>${doneToday} von ${goal} Wörtern heute geübt.</span>${due ? ` <span>${plural(due, 'Wort wartet', 'Wörter warten')} auf ein Wiedersehen.</span>` : ''}`}</p>
      </div>
      <div class="today-side">
        <button class="today-ring" data-nav="fortschritt" style="--p:${percent}" aria-label="Tagesziel: ${doneToday} von ${goal} Wörtern"><b>${doneToday}</b><small>von ${goal}</small></button>
        ${streak.n ? `<span class="streak" title="Lernserie"><b>${streak.n}</b> ${streak.n === 1 ? 'Tag' : 'Tage'} in Folge</span>` : ''}
      </div>
    </section>
    ${
      suggestion
        ? `<article class="resume">
      <button class="resume-media" data-lesson="${esc(suggestion.id)}" tabindex="-1" aria-hidden="true">${lessonCoverHTML(suggestion)}</button>
      <div class="resume-body">
        <div class="eyebrow">${resume ? 'Weitermachen' : 'Zum Einstieg'}</div>
        <h2 ${suggestion.coverImage || PHOTOS[suggestion.cover] ? '' : 'class="sr-only"'}>${esc(suggestion.title)}</h2>
        <p>${esc(portalLang(suggestion.language))} · ${esc(suggestion.level)} · ${suggestion.estimatedMinutes} Min. · ${plural(suggestion.questions.length, 'Aufgabe', 'Aufgaben')}</p>
        ${st.percent ? `<div class="lcard-progress" aria-hidden="true"><i style="width:${st.percent}%"></i></div>` : ''}
        <button class="button primary large" data-lesson="${esc(suggestion.id)}">${resume ? 'Weiterhören' : 'Jetzt anhören'}</button>
      </div>
    </article>`
        : ''
    }
    <div class="quick">
      <button data-extra="recommend">${icon('vokabeln')}<b>${due ? plural(due, 'Wort', 'Wörter') + ' wiederholen' : 'Wörter üben'}</b><small>Karten, Schreiben, Zuordnen</small></button>
      <button data-nav="hoeren">${icon('hoeren')}<b>Alle Hörübungen</b><small>${plural(list.length, 'Übung', 'Übungen')} nach Sprache und Niveau</small></button>
      <button data-nav="verben">${icon('verben')}<b>Verben</b><small>Formen üben</small></button>
    </div>
    ${sectionHead('', 'Für dich', 'hoeren', 'Alle ansehen')}
    <div class="cards-grid rail">${more.map(lessonCard).join('')}</div>
    ${
      p.favorites.length || checked
        ? `<div class="stat-row" aria-label="Dein Lernstand">
      <button data-nav="sammlung"><b>${p.favorites.length}</b><span>in der Merkliste</span></button>
      <button data-nav="fortschritt"><b>${checked}</b><span>Hörübungen geprüft</span></button>
      <button data-nav="verlauf"><b>${p.history.length}</b><span>zuletzt geöffnet</span></button>
    </div>`
        : ''
    }`;
}

function teacherHome(list, p) {
  const recent = p.history
    .map(h => list.find(l => l.id === h.id))
    .filter(Boolean)
    .slice(0, 4);
  const levels = LEVELS.filter(l => list.some(x => x.level === l));
  return `<section class="xhero teach">
      <div class="xhero-copy">
        <div class="eyebrow">Mein Unterricht</div>
        <h1>Hörmaterial, das im<br>Unterricht <em>funktioniert.</em></h1>
        <p>Aufgaben mit Lösungen, Transkripte und druckfertige Blätter. Nach Sprache und Niveau gefunden.</p>
        <form class="xsearch" data-home-search role="search">
          <input id="home-search" type="search" placeholder="Thema oder Titel, zum Beispiel città" aria-label="Hörmaterial suchen">
          <button class="button primary" type="submit">Suchen</button>
        </form>
        <div class="chip-row" role="group" aria-label="Niveau wählen">
          ${levels.map(l => `<button class="chip" data-portal="home-level" data-value="${l}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="xhero-art"><img src="assets/torino.jpg" alt="Piazza Castello in Turin am Abend"><span class="xhero-cap">${plural(list.length, 'Hörübung', 'Hörübungen')} im Katalog</span></div>
    </section>
    <div class="steps three">
      ${stepCard({ kicker: '1', title: 'Material finden', text: 'Filtern nach Sprache, Niveau und Medium.', action: '<button class="button secondary" data-nav="hoeren">Katalog öffnen</button>' })}
      ${stepCard({ kicker: '2', title: 'Hausaufgabe geben', text: 'Bei Hörübungen und Wortlisten „Zur Hausaufgabe“ wählen, dann als Link oder QR-Code teilen.', action: '<button class="button secondary" data-hw-open="1">Hausaufgabe ansehen</button>' })}
      ${stepCard({ kicker: '3', title: 'Eigene Übungen', text: 'Eigene Hörübungen und Wortlisten erstellen oder Katalogübungen anpassen.', action: '<button class="button secondary" data-nav="redaktion">Eigene Übungen</button>' })}
    </div>
    ${sectionHead('', 'Neu im Katalog', 'hoeren', 'Alle ansehen')}
    <div class="cards-grid">${list.slice(-6).reverse().map(lessonCard).join('')}</div>
    ${
      recent.length
        ? sectionHead('', 'Zuletzt angesehen', 'verlauf', 'Verlauf') +
          `<div class="cards-grid">${recent.map(lessonCard).join('')}</div>`
        : ''
    }
    <div class="stat-row">
      <button data-nav="sammlung"><b>${p.favorites.length}</b><span>in meiner Sammlung</span></button>
      <button data-nav="vokabeln"><b>${contentList('vocabulary').length + 1}</b><span>Wortlisten</span></button>
    </div>`;
}

function portalHome() {
  $('breadcrumb').textContent = isTeacher() ? 'Mein Unterricht' : 'Mein Lernbereich';
  const list = contentList('listening'),
    p = portalProfile();
  $('main').innerHTML =
    `<div class="page">${isTeacher() ? teacherHome(list, p) : learnerHome(list, p)}</div>`;
}

/* ---------- Katalog ---------- */

function filteredLessons() {
  const f = portalFilters;
  return contentList('listening').filter(
    x =>
      (f.language === 'all' || x.language === f.language) &&
      (f.level === 'all' || x.level === f.level) &&
      (!f.media || f.media === 'all' || mediaKind(x) === f.media) &&
      (!f.series || x.series === f.series) &&
      !(f.hideWorking && isTeacher() && isWorkingLesson(x)) &&
      (x.title + ' ' + x.description + ' ' + x.topics.join(' '))
        .toLocaleLowerCase()
        .includes(f.query.toLocaleLowerCase())
  );
}

function chipRow(label, key, options) {
  return `<div class="filter-group"><span class="filter-label" id="fl-${key}">${label}</span><div class="chip-row" role="group" aria-labelledby="fl-${key}">${options
    .map(
      ([value, text, disabled]) =>
        `<button class="chip" data-portal="filter-set" data-key="${key}" data-value="${value}" aria-pressed="${(portalFilters[key] || 'all') === value}" ${disabled ? 'disabled' : ''}>${text}</button>`
    )
    .join('')}</div></div>`;
}

function refreshCatalog() {
  const list = filteredLessons();
  const grid = $('catalog-grid');
  if (!grid) return;
  grid.innerHTML =
    list.map(lessonCard).join('') ||
    emptyPortal(
      'Hier ist es noch ruhig.',
      'Für diese Auswahl gibt es noch keine Hörübung. Wähle eine andere Sprache oder ein anderes Niveau.'
    );
  $('catalog-count').innerHTML = esc(plural(list.length, 'Hörübung', 'Hörübungen')) +
    (portalFilters.series ? ` · <button class="quiet" data-portal="series-clear">Alle Hörübungen anzeigen</button>` : '');
  document.querySelectorAll('[data-portal="filter-set"]').forEach(b => {
    b.setAttribute(
      'aria-pressed',
      String((portalFilters[b.dataset.key] || 'all') === b.dataset.value)
    );
  });
}

function listeningCatalog() {
  const all = contentList('listening');
  const teacher = isTeacher();
  const languages = Object.entries(TheisContent.LANGUAGES).filter(([k]) =>
    all.some(x => x.language === k)
  );
  const working = isTeacher() ? all.filter(isWorkingLesson).length : 0;
  $('main').innerHTML = `<div class="page">
    <header class="page-head">
      <div class="eyebrow">${teacher ? 'Hörmaterial für den Unterricht' : 'Hörverstehen'}</div>
      <h1>${teacher ? 'Material finden.' : 'Was möchtest du hören?'}</h1>
      <p>${teacher ? 'Aufgaben, Lösungen und Transkripte. Filtern, ansehen, drucken oder als Link teilen.' : 'Wähle Sprache und Niveau und starte mit einer Übung.'}</p>
    </header>
    <section class="filters">
      <label class="searchbox"><span class="sr-only">Thema oder Titel</span><input id="listen-search" type="search" placeholder="Thema oder Titel, zum Beispiel città" value="${esc(portalFilters.query)}" autocomplete="off"></label>
      ${chipRow('Sprache', 'language', [['all', 'Alle'], ...languages.map(([k, v]) => [k, v])])}
      ${chipRow('Niveau', 'level', [['all', 'Alle'], ...LEVELS.map(l => [l, l, !all.some(x => x.level === l)])])}
      ${chipRow('Medium', 'media', [
        ['all', 'Alle'],
        ['video', 'Video'],
        ['audio', 'Audio'],
        ['speech', 'Stimme']
      ])}
      ${working ? `<label class="switch"><input id="hide-working" type="checkbox" ${portalFilters.hideWorking ? 'checked' : ''}><span>Arbeitsfassungen ausblenden (${working})</span></label>` : ''}
    </section>
    <div class="catalog-count" id="catalog-count" aria-live="polite"></div>
    <div class="cards-grid" id="catalog-grid"></div>
  </div>`;
  refreshCatalog();
}

function emptyPortal(title, text) {
  return `<section class="empty"><h2>${title}</h2><p>${text}</p><button class="button secondary" data-nav="hoeren">Hörverstehen entdecken</button></section>`;
}

/* ---------- Übungsseite ---------- */

function playerHTML(x) {
  if (x.media.type === 'link') {
    const host = (() => { try { return new URL(x.media.url).hostname.replace(/^www\./, ''); } catch (e) { return ''; } })();
    return `<div class="player-frame film"><div class="film-card"><span class="film-kicker">Weblink</span><b>${esc(x.media.provider || host)}</b><p>${esc(host)}</p></div></div><a class="button primary large" href="${esc(x.media.url)}" target="_blank" rel="noopener noreferrer">Beim Anbieter öffnen</a><p class="player-note">Das Medium läuft auf der Seite des Anbieters (z. B. BBC, NPR, TED) und wird nicht in daje eingebettet. Danach hierher zurückkehren und die Aufgaben lösen.</p>`;
  }
  if (x.media.type === 'film') {
    return `<div class="player-frame film"><div class="film-card"><span class="film-kicker">Film${x.media.year ? ' · ' + x.media.year : ''}</span><b>${esc(x.media.title)}</b>${x.media.scene ? `<p>${esc(x.media.scene)}</p>` : ''}</div></div><p class="player-note">Die Szene zeigt deine Lehrkraft im Unterricht. Die Aufgaben kannst du trotzdem schon ansehen und danach lösen.</p>${x.media.trailerVideoId ? `<p class="player-note"><a href="https://www.youtube.com/watch?v=${x.media.trailerVideoId}" target="_blank" rel="noopener">Trailer ansehen</a></p>` : ''}`;
  }
  if (x.media.type === 'youtube') {
    return `<div class="player-frame" id="youtube-container" data-cover>
        <button class="player-poster" data-portal="load-youtube" aria-label="Video laden und abspielen">
          ${lessonCoverHTML(x, { poster: true })}<span class="player-play" aria-hidden="true"></span><span class="player-hint">Video abspielen</span>
        </button>
      </div>
      <p class="player-note">Beim Abspielen wird eine Verbindung zu YouTube hergestellt. Falls das Video gesperrt ist: <a href="https://www.youtube.com/watch?v=${x.media.videoId}" target="_blank" rel="noopener">Originalquelle öffnen</a></p>`;
  }
  const art = x.coverImage
    ? `<div class="player-frame audio has-cover">${lessonCoverHTML(x)}</div>`
    : `<div class="player-frame audio">${waveHTML()}</div>`;
  if (x.media.type === 'speech') {
    return `${art}<div class="player-controls"><button class="button primary large" data-portal="play-speech">Anhören</button><button class="button secondary large" data-portal="stop-speech">Stoppen</button><label class="speed-control">Tempo<select id="listen-speed"><option value="0.8">Langsamer · 0,8×</option><option value="1" selected>Normal · 1×</option></select></label></div><p class="player-note" id="audio-status" role="status">Eigener Übungstext mit synthetischer Stimme. Sie hängt von deinem Browser und Gerät ab.</p>`;
  }
  return `${art}<div class="player-controls"><button class="button primary large audio-play-button" data-portal="play-audio">Aufnahme abspielen</button><label class="speed-control">Tempo<select id="listen-speed"><option value="0.8">Langsamer · 0,8×</option><option value="1" selected>Normal · 1×</option></select></label></div><audio id="listening-audio" controls preload="none" src="${esc(x.localMedia || x.media.url)}"></audio><p class="player-note" id="audio-status" role="status">${x.localMedia ? 'Originalaufnahme · VOA Learning English' : 'Audio wird vom angegebenen Anbieter geladen.'}</p>`;
}

/* Stabile Mischung je Aufgabe: gleiche Reihenfolge bei jedem Aufruf, aber nicht die Lösungsreihenfolge. */
function seededOrder(list, seed) {
  let h = 2166136261;
  for (const ch of String(seed)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => (h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 4294967296;
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  if (out.length > 1 && out.every((v, i) => v === list[i])) out.push(out.shift());
  return out;
}
function answerParts(value) {
  try {
    const v = JSON.parse(value);
    return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
  } catch {
    return {};
  }
}
const ownPart = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
const GAP_MARK = /\[\[([a-z0-9-]+)\]\]/g;

function solutionText(q) {
  switch (q.type) {
    case 'single_choice':
      return q.options.find(o => o.id === q.correctOptionId).text;
    case 'true_false':
      return q.answer ? 'Richtig' : 'Falsch';
    case 'multiple_choice':
      return q.options
        .filter(o => q.correctOptionIds.includes(o.id))
        .map(o => o.text)
        .join(' · ');
    case 'matching':
      return q.pairs.map(p => p.left + ' → ' + p.right).join(' · ');
    case 'ordering':
      return q.items.map((it, i) => i + 1 + '. ' + it.text).join(' · ');
    case 'gap_fill':
      return q.gaps.map((g, i) => i + 1 + ': ' + g.acceptedAnswers[0]).join(' · ');
    default:
      return q.modelAnswer;
  }
}

/* Leeres Aufgabenblatt für den Druck */
function printBody(q) {
  switch (q.type) {
    case 'single_choice':
    case 'multiple_choice':
      return q.options.map(o => `<p>□ ${esc(o.text)}</p>`).join('');
    case 'true_false':
      return '<p>□ Richtig &nbsp; □ Falsch</p>';
    case 'matching': {
      const right = seededOrder([...q.pairs.map(p => p.right), ...q.distractors], q.id);
      return `<p>${q.pairs.map((p, i) => `${i + 1}. ${esc(p.left)} → ____`).join('<br>')}</p><p>${right.map((t, i) => `${String.fromCharCode(65 + i)}) ${esc(t)}`).join('<br>')}</p>`;
    }
    case 'ordering':
      return `<p>${seededOrder(q.items, q.id)
        .map(it => `□ ${esc(it.text)}`)
        .join('<br>')}</p><p>Reihenfolge: ____ ____ ____</p>`;
    case 'gap_fill':
      return `<p>${esc(q.text).replace(GAP_MARK, '________')}</p>`;
    default:
      return '<div class="print-lines"></div>';
  }
}

function questionHTML(x, q, index, state) {
  const value = state.answers[q.id] ?? '';
  const correct = state.checked && TheisContent.assessAnswer(q, value);
  const optionState = id => {
    if (!state.checked) return '';
    const right =
      q.type === 'single_choice' ? id === q.correctOptionId : id === (q.answer ? 'true' : 'false');
    if (right) return 'is-correct';
    return value === id ? 'is-wrong' : '';
  };
  const option = (id, text) =>
    `<label class="opt ${optionState(id)}"><input type="radio" name="${q.id}" value="${id}" data-listen-answer="${q.id}" ${value === id ? 'checked' : ''}><span class="opt-mark" aria-hidden="true"></span><span class="opt-text">${esc(text)}</span></label>`;
  const parts = answerParts(value);
  const mark = ok => (state.checked ? (ok ? ' is-correct' : ' is-wrong') : '');
  let field;
  if (q.type === 'single_choice') field = q.options.map(o => option(o.id, o.text)).join('');
  else if (q.type === 'true_false') field = option('true', 'Richtig') + option('false', 'Falsch');
  else if (q.type === 'multiple_choice') {
    const chosen = String(value).split(',').filter(Boolean);
    field =
      '<p class="q-hint">Mehrere Antworten sind richtig.</p>' +
      q.options
        .map(o => {
          const st = state.checked
            ? q.correctOptionIds.includes(o.id)
              ? ' is-correct'
              : chosen.includes(o.id)
                ? ' is-wrong'
                : ''
            : '';
          return `<label class="opt${st}"><input type="checkbox" name="${q.id}" value="${o.id}" data-listen-multi="${q.id}" ${chosen.includes(o.id) ? 'checked' : ''}><span class="opt-mark box" aria-hidden="true"></span><span class="opt-text">${esc(o.text)}</span></label>`;
        })
        .join('');
  } else if (q.type === 'matching') {
    const rights = seededOrder(
      [
        ...q.pairs.map(p => ({ id: p.id, text: p.right })),
        ...q.distractors.map((t, i) => ({ id: 'x' + i, text: t }))
      ],
      q.id
    );
    field = q.pairs
      .map(
        p =>
          `<div class="pair-row${mark(parts[p.id] === p.id)}"><span class="pair-left">${esc(p.left)}</span><select data-listen-part="${q.id}" data-part="${p.id}" aria-label="Zu „${esc(p.left)}“ passend" lang="${x.language}"><option value="">Wählen</option>${rights.map(r => `<option value="${r.id}" ${ownPart(parts, p.id) && parts[p.id] === r.id ? 'selected' : ''}>${esc(r.text)}</option>`).join('')}</select></div>`
      )
      .join('');
  } else if (q.type === 'ordering') {
    field =
      '<p class="q-hint">Wähle für jeden Schritt die Position.</p>' +
      seededOrder(q.items, q.id)
        .map(
          it =>
            `<div class="pair-row${mark(ownPart(parts, it.id) && Number(parts[it.id]) === q.items.indexOf(it) + 1)}"><select class="pos" data-listen-part="${q.id}" data-part="${it.id}" aria-label="Position für „${esc(it.text)}“"><option value="">–</option>${q.items.map((_, i) => `<option value="${i + 1}" ${ownPart(parts, it.id) && Number(parts[it.id]) === i + 1 ? 'selected' : ''}>${i + 1}</option>`).join('')}</select><span class="pair-left" lang="${x.language}">${esc(it.text)}</span></div>`
        )
        .join('');
  } else if (q.type === 'gap_fill') {
    const gap = (id, n) => {
      const g = q.gaps.find(v => v.id === id);
      const val = ownPart(parts, id) ? parts[id] : '';
      const ok = g.acceptedAnswers.some(
        a => a.toLocaleLowerCase().trim() === String(val).toLocaleLowerCase().trim()
      );
      return `<input class="gap${mark(ok)}" data-listen-part="${q.id}" data-part="${id}" value="${esc(val)}" maxlength="80" size="${Math.max(8, Math.min(24, Math.max(...g.acceptedAnswers.map(a => a.length)) + 3))}" lang="${x.language}" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Lücke ${n}">`;
    };
    let n = 0;
    let html = '';
    let last = 0;
    for (const m of q.text.matchAll(GAP_MARK)) {
      html += esc(q.text.slice(last, m.index)) + gap(m[1], ++n);
      last = m.index + m[0].length;
    }
    field = `<p class="gap-text" lang="${x.language}">${html}${esc(q.text.slice(last))}</p>`;
  } else
    field = `<label class="field answer-field"><span>Deine Antwort</span><input data-listen-answer="${q.id}" value="${esc(value)}" maxlength="1000" lang="${x.language}" autocomplete="off" placeholder="Kurz antworten"></label>`;
  const key =
    isTeacher() && teacherKeyVisible
      ? `<div class="q-key"><b>Lösung:</b> ${esc(solutionText(q))}${q.type === 'short_answer' ? `<br><span class="muted">Weitere Varianten: ${esc(q.acceptedAnswers.join(' / '))}</span>` : ''}</div>`
      : '';
  const feedback = state.checked
    ? `<div class="listen-feedback ${correct ? 'correct' : 'wrong'}"><b>${correct ? 'Richtig erkannt' : value ? 'Noch nicht erkannt' : 'Noch keine Antwort'}</b>${correct ? '' : `<div>Lösung: ${esc(solutionText(q))}</div>`}<p>${timeLinks(esc(visibleText(q.explanation)))}</p>${q.type === 'short_answer' && !correct ? '<small>Andere passende Formulierungen sind möglich. Vergleiche selbst mit der Musterlösung.</small>' : ''}</div>`
    : '';
  const phase = q.prompt.match(QUESTION_PHASE);
  const prompt = phase ? q.prompt.slice(phase[0].length) : q.prompt;
  return `<fieldset class="q${index === focusIndex ? ' is-current' : ''}" id="q-${esc(q.id)}" data-index="${index}"><legend class="sr-only">Frage ${index + 1}: ${esc(q.prompt)}</legend>
    <div class="q-head" aria-hidden="true"><span class="q-num">${index + 1}</span><div><div class="q-type">${phase ? `<span class="q-phase">${esc(phase[1])}</span>` : ''}${LISTENING_FORMAT_LABELS[q.type]}</div><div class="q-prompt">${esc(prompt)}</div></div></div>
    <div class="q-options">${field}</div>${key}${feedback}</fieldset>`;
}

/* Abschnitt am Anfang einer Aufgabe („Prima dell’ascolto: …“) wird als Etikett gezeigt. */
const QUESTION_PHASE =
  /^(Prima dell’ascolto|Prima del film|Primo ascolto|Secondo ascolto|Durante l’ascolto|Dopo l’ascolto|Dopo il film|Lessico e lingua|Before listening|While listening|After listening|Language|Vor dem Hören|Beim Hören|Nach dem Hören|Wortschatz vorab|Wortschatz)\s*:\s*/;

/* Fokus-Modus: eine Aufgabe pro Bildschirm (Standard am Handy und iPad hochkant). */
let focusIndex = 0,
  focusLesson = null;
function focusMode() {
  try {
    const v = localStorage.getItem('daje-fokus-v1');
    if (v) return v === '1';
  } catch {}
  return matchMedia('(max-width: 899px)').matches;
}
function setFocusMode(on) {
  try {
    localStorage.setItem('daje-fokus-v1', on ? '1' : '0');
  } catch {}
}
function focusNavHTML(x) {
  const n = x.questions.length;
  const answers = lessonProgress().answers;
  const open = x.questions.findIndex(q => !String(answers[q.id] ?? '').trim());
  const openCount = x.questions.filter(q => !String(answers[q.id] ?? '').trim()).length;
  const hint =
    focusIndex === n - 1 && open >= 0 && open !== focusIndex
      ? `<button type="button" class="quiet focus-open" data-focus-go="${open}">${plural(openCount, 'Aufgabe', 'Aufgaben')} noch offen · zur ersten</button>`
      : '';
  return `${hint}<div class="focus-nav"><button type="button" class="button secondary" data-focus="prev" ${focusIndex === 0 ? 'disabled' : ''}>Zurück</button><span class="focus-count"><b>${focusIndex + 1}</b> / ${n}</span><button type="button" class="button primary" data-focus="next" ${focusIndex >= n - 1 ? 'hidden' : ''}>Weiter</button></div>`;
}
function refreshFocusNav(x) {
  const nav = document.querySelector('.focus-nav');
  if (!nav) return;
  document.querySelector('.focus-open')?.remove();
  nav.outerHTML = focusNavHTML(x);
}
function showFocus(i) {
  const x = currentLesson();
  if (!x) return;
  focusIndex = Math.max(0, Math.min(x.questions.length - 1, i));
  document.querySelectorAll('#listening-form fieldset.q').forEach(f =>
    f.classList.toggle('is-current', Number(f.dataset.index) === focusIndex)
  );
  refreshFocusNav(x);
  const form = $('listening-form');
  form?.classList.toggle('at-end', focusIndex === x.questions.length - 1);
  document.querySelectorAll('.qstep').forEach((a, k) => a.classList.toggle('is-current', k === focusIndex));
  const head = document.querySelector('.tasks-head');
  if (head && head.getBoundingClientRect().top < 0) head.scrollIntoView({ block: 'start' });
  form?.querySelector('fieldset.is-current input:not([type=radio]):not([type=checkbox]), fieldset.is-current select')?.focus({ preventScroll: true });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-focus]');
  if (b) {
    const a = b.dataset.focus;
    if (a === 'prev') return showFocus(focusIndex - 1);
    if (a === 'next') return showFocus(focusIndex + 1);
    setFocusMode(a === 'on');
    return renderListening();
  }
  const go = e.target.closest('[data-focus-go]');
  if (go) return showFocus(Number(go.dataset.focusGo));
  const step = e.target.closest('.qstep');
  if (step && $('listening-form')?.classList.contains('focus')) {
    e.preventDefault();
    showFocus([...document.querySelectorAll('.qstep')].indexOf(step));
  }
});
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || !e.target.closest?.('#listening-form.focus fieldset.is-current')) return;
  if (e.target.tagName !== 'INPUT' || e.target.type === 'radio' || e.target.type === 'checkbox') return;
  const x = currentLesson();
  if (x && focusIndex < x.questions.length - 1) {
    e.preventDefault();
    showFocus(focusIndex + 1);
  }
});

function resultBanner(x, state) {
  if (!state.checked || !state.lastResult) return '';
  const r = state.lastResult;
  return `<section class="result-banner" role="status"><div class="result-score"><b>${r.correct}</b><span>von ${r.total}</span></div><div><h2>${r.correct === r.total ? 'Alles erkannt.' : r.correct >= r.total / 2 ? 'Gut gehört.' : 'Hör noch einmal hin.'}</h2><p>${r.assisted ? 'Du hast das Transkript als Hilfe geöffnet. ' : ''}Prüfe die Erklärungen unter den Fragen und versuche es bei Bedarf in einer neuen Runde.</p></div></section>`;
}

function stepsHTML(x, state) {
  return x.questions
    .map(
      (q, i) =>
        `<a class="qstep ${String(state.answers[q.id] ?? '').trim() ? 'is-done' : ''}${i === focusIndex ? ' is-current' : ''}" href="#q-${esc(q.id)}" aria-label="Frage ${i + 1}"></a>`
    )
    .join('');
}

function toolsHTML(x, state, preview) {
  const teacher = isTeacher();
  const hasWords = x.vocabulary?.length || x.vocabularyIds?.length || x.media.type === 'speech';
  const label = transcriptLabel(x);
  const sources = x.sources
    .map(
      s =>
        `<p>${esc(teacher ? s.citation : visibleText(s.citation))}${s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">Originalquelle</a>` : ''}</p>`
    )
    .join('');
  // Leere Karten zeigen wir nicht: keine Wortliste, kein Transkript (für Lernende) → keine Karte.
  const words = hasWords
    ? `<section class="tool-card"><div class="eyebrow">Passend dazu</div><h3>Wörter zu dieser Übung</h3><p>Bereite dich mit Wortschatz vor oder wiederhole nach dem Hören.</p><button class="button secondary" data-portal="related-words">Wörter ansehen${x.vocabulary?.length ? ' · ' + x.vocabulary.length : ''}</button></section>`
    : '';
  const transcript =
    teacher || transcriptForDisplay(x.transcript)
      ? `<details class="tool-card listen-transcript" ${state.transcriptOpened || (teacher && x.transcript) ? 'open' : ''}><summary>Transkript</summary>
    ${label ? `<div class="origin-line"><span class="flag">${esc(label)}</span>${teacher && isWorkingLesson(x) ? '<span class="flag">Nicht am Audio geprüft</span>' : ''}</div>` : ''}
    <p class="transcript-text" lang="${x.language}">${esc(transcriptForDisplay(x.transcript) || 'Für diese Übung ist noch kein Transkript hinterlegt.')}</p></details>`
      : '';
  return `${words}${transcript}
  <details class="tool-card listen-sources"><summary>Quelle und Hinweise</summary>${sources}${teacher ? x.reviewNotes.map(t => `<p class="muted">${esc(t)}</p>`).join('') : ''}</details>`;
}

function seriesSwitcher(x) {
  if (!x.series || EMBED) return '';
  const sib = qrEntries(x);
  if (sib.length < 2) return '';
  return `<nav class="series-switch" aria-label="Stufe wählen"><span>${esc(x.seriesTitle || 'Stufen')}</span><div>${sib
    .map(y => `<button data-lesson="${esc(y.id)}" aria-pressed="${y.id === x.id}"><b>${esc(y.levelLabel || y.level)}</b><small>${esc(y.level)}</small></button>`)
    .join('')}</div></nav>`;
}
function noteList(h, a) {
  return a && a.length ? `<h4>${h}</h4><ul>${a.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : '';
}
function teacherNotesHTML(x) {
  const t = x.teacherNotes;
  if (!t || !(t.steps || t.tips)) return '';
  return `<details class="teacher-notes" open><summary><b>Unterrichtsidee</b><span>Ablauf und Tipps</span></summary>${noteList('Ablauf', t.steps)}${noteList('Tipps', t.tips)}</details>`;
}
function warmupHTML(x) {
  const t = x.teacherNotes;
  return t && t.warmup ? `<section class="learn-note"><b>Vor dem Hören</b>${noteList('', t.warmup)}</section>` : '';
}
function followHTML(x) {
  const t = x.teacherNotes;
  return t && t.followUp ? `<section class="learn-note"><b>Zum Weiterdenken</b>${noteList('', t.followUp)}<small>Mündlich oder schriftlich – ohne automatische Auswertung.</small></section>` : '';
}
function renderListening(preview = false) {
  const x = currentLesson();
  if (!x) return nav('hoeren');
  preview = preview || !contentList('listening').some(item => item.id === x.id);
  const state = lessonProgress();
  const teacher = isTeacher();
  const count = x.questions.filter(q => String(state.answers[q.id] ?? '').trim()).length;
  $('breadcrumb').textContent = 'Hörverstehen · ' + x.title;
  const working = teacher && isWorkingLesson(x);
  const focus = !teacher && focusMode() && x.questions.length > 1;
  if (focusLesson !== x.id) {
    focusLesson = x.id;
    focusIndex = 0;
  }
  focusIndex = Math.min(focusIndex, x.questions.length - 1);
  $('main').innerHTML = `<div class="page lesson-page">
    ${EMBED ? '' : '<button class="quiet back-link" data-nav="hoeren">Alle Hörübungen</button>'}
    ${working ? `<div class="draftbar"><b>Arbeitsfassung</b><span>Aufgaben, Transkript und Nutzungsrechte sind noch nicht abschließend geprüft.${!x.transcript && !x.series ? ' Das Transkript fehlt noch.' : ''}</span>${teacher && editorState.items.some(i => edId(i) === x.id) ? `<button class="quiet" data-ed-edit="${esc(x.id)}">In der Redaktion bearbeiten</button>` : ''}</div>` : ''}
    ${preview ? '<div class="draftbar"><b>Entwurf</b><span>Lokaler Redaktionsentwurf, nicht freigegeben.</span></div>' : ''}
    <header class="lesson-head">
      <div>
        <div class="lesson-chips"><span class="chip-solid">${esc(portalLang(x.language))}</span>${levelPill(x.level)}<span class="chip-plain">${x.estimatedMinutes} Min.</span><span class="chip-plain">${MEDIA_LABELS[mediaKind(x)]}</span></div>
        <h1>${esc(x.title)}</h1>
        <p>${esc(visibleText(x.description))}</p>
      </div>
      ${favoriteButton('listening', x.id)}
    </header>
    ${seriesSwitcher(x)}
    <div class="listening-layout">
      <div class="l-side">
        <section class="media-box">${playerHTML(x)}</section>
        ${warmupHTML(x)}
        <div class="l-tools">${toolsHTML(x, state, preview)}</div>
      </div>
      <section class="l-tasks">
        ${
          teacher && !preview
            ? `<section class="teacher-bar"><div><b>Für den Unterricht</b><span>Aufgabenblatt, Lösungsschlüssel und Link</span></div><div class="teacher-actions"><button class="button secondary" data-teaching="${esc(x.id)}">Material und Druck</button><button class="button secondary" data-qr-show="${esc(x.id)}">QR-Code zeigen</button>${typeof hwButton === 'function' ? hwButton('l:' + x.id) : ''}${editorState.items.some(i => edId(i) === x.id) ? `<button class="button secondary" data-ed-edit="${esc(x.id)}">In der Redaktion bearbeiten</button>` : `<button class="button secondary" data-ed-copy="${esc(x.id)}">Als eigene Übung bearbeiten</button>`}<button class="button secondary" data-portal="copy-embed">Einbett-Code kopieren</button><button class="button secondary" data-portal="toggle-key" aria-pressed="${teacherKeyVisible}">${teacherKeyVisible ? 'Lösungen ausblenden' : 'Lösungen einblenden'}</button></div></section>`
            : ''
        }
        ${teacher && !preview ? teacherNotesHTML(x) : ''}
        <div class="tasks-head"><h2>${teacher ? 'Aufgaben' : 'Was hast du verstanden?'}</h2><span id="listen-answer-count">${count} / ${x.questions.length} beantwortet</span></div>
        ${!teacher && x.questions.length > 1 ? `<div class="view-switch" role="group" aria-label="Darstellung der Aufgaben"><button type="button" data-focus="on" aria-pressed="${focus}">Eine nach der anderen</button><button type="button" data-focus="off" aria-pressed="${!focus}">Alle auf einmal</button></div>` : ''}
        <div class="qsteps" id="qsteps" aria-hidden="true">${stepsHTML(x, state)}</div>
        ${resultBanner(x, state)}
        <form id="listening-form" class="${focus ? 'focus' : ''}${focus && focusIndex === x.questions.length - 1 ? ' at-end' : ''}" novalidate>
          ${x.questions.map((q, i) => questionHTML(x, q, i, state)).join('')}
          ${focus ? focusNavHTML(x) : ''}
          <div class="checkbar"><span id="check-hint">${state.checked ? 'Du kannst Antworten ändern und erneut prüfen.' : 'Lösungen erscheinen nach der Korrektur.'}</span><button class="button primary large" type="submit">${state.checked ? 'Erneut prüfen' : 'Antworten korrigieren'}</button></div>
        </form>
        ${followHTML(x)}
        <section class="note-card"><label class="field"><span>${teacher ? 'Notiz zur Unterrichtsplanung' : 'Deine Notiz zu dieser Übung'}</span><textarea id="listening-note" maxlength="2000" placeholder="Was möchtest du dir merken?">${esc(portalProfile().notes[x.id] || '')}</textarea></label><small id="note-status" role="status">Nur im aktuellen lokalen Lernprofil gespeichert.</small></section>
        <div class="session-actions"><button class="button secondary" data-portal="reset-listening">Neue Runde beginnen</button></div>
      </section>
    </div>
    ${EMBED ? `<footer class="embed-foot"><a class="brandmark" href="${esc(location.origin + location.pathname)}" target="_blank" rel="noopener">daje · © 2026 <span class="embed-logo">theis</span></a></footer>` : ''}
  </div>`;
  const audio = $('listening-audio');
  if (audio) {
    audio.addEventListener('ended', () => {
      const b = document.querySelector('[data-portal="play-audio"]');
      if (b) b.textContent = 'Noch einmal abspielen';
    });
    audio.addEventListener('error', () => {
      $('audio-status').textContent =
        'Diese Aufnahme konnte nicht geladen werden. Bitte Quelle und Erreichbarkeit prüfen.';
    });
  }
  document.querySelector('.listen-transcript')?.addEventListener('toggle', e => {
    state.transcriptOpened = e.target.open;
    if (e.target.open && !teacher) state.usedTranscript = true;
    persistPortal();
  });
}

/* Antwort geändert: Zähler und Markierungen aktualisieren, ohne die Seite neu aufzubauen. */
function updateListeningProgress() {
  const x = currentLesson();
  if (!x) return;
  const state = lessonProgress();
  const count = x.questions.filter(q => String(state.answers[q.id] ?? '').trim()).length;
  $('listen-answer-count').textContent = count + ' / ' + x.questions.length + ' beantwortet';
  const steps = $('qsteps');
  if (steps) steps.innerHTML = stepsHTML(x, state);
  refreshFocusNav(x);
  document.querySelectorAll('.listen-feedback,.result-banner').forEach(el => el.remove());
  document
    .querySelectorAll('.is-correct,.is-wrong')
    .forEach(el => el.classList.remove('is-correct', 'is-wrong'));
  if ($('check-hint')) $('check-hint').textContent = 'Lösungen erscheinen nach der Korrektur.';
  const submit = document.querySelector('#listening-form [type=submit]');
  if (submit) submit.textContent = 'Antworten korrigieren';
}

/* ---------- Wortschatzbibliothek ---------- */

function vocabularyLibrary() {
  const extras = contentList('vocabulary');
  const teacher = isTeacher();
  const due = dueWordCount();
  const day = activeProfile().history[nowDate()];
  const goal = activeProfile().goal || 10;
  const done = day?.ids.length || 0;
  const lead = teacher
    ? `<section class="feature-card"><div><div class="eyebrow">Für den Unterricht</div><h2>Wortlisten zum Üben und Teilen</h2><p>Wähle eine Liste und teile den Link über die Schaltfläche Teilen oben. Lernende üben ohne Anmeldung.</p></div></section>`
    : `<section class="feature-card"><div><div class="eyebrow">Heute</div><h2>${due ? plural(due, 'Wort wartet', 'Wörter warten') + ' auf ein Wiedersehen.' : 'Eine kleine Runde passt immer.'}</h2><p>${done} von ${goal} Wörtern heute geübt.</p><div class="lcard-progress" aria-hidden="true"><i style="width:${Math.min(100, Math.round((100 * done) / goal))}%"></i></div></div><button class="button primary large" data-extra="recommend">${due ? 'Jetzt wiederholen' : 'Runde starten'}</button></section>`;
  $('main').innerHTML = `<div class="page">
    <header class="page-head"><div class="eyebrow">Wortschatz</div><h1>Wörter, die bleiben.</h1><p>Wähle eine Liste. Danach entscheidest du, wie du übst: Karten, Schreiben, Zuordnen oder Erklärungen.</p></header>
    ${lead}
    ${sectionHead('', 'Wortlisten')}
    <div class="cards-grid sets">${baseVocabCard()}${extras.map(x => setCard(x, 'activity')).join('')}</div>
    <section class="lookup-grid">
      <article class="lookup-card"><div><h3>Wörter nachschlagen</h3><p class="muted">In allen Listen suchen, auf Italienisch, Englisch oder Deutsch.</p></div><button class="button secondary" data-nav="wortschatz">Öffnen</button></article>
      <article class="lookup-card"><div><h3>Verben im Presente</h3><p class="muted">Formen üben und überprüfen.</p></div><button class="button secondary" data-nav="verben">Öffnen</button></article>
    </section>
  </div>`;
}
