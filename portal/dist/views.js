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
  /Gemini|Audioabgleich|am Audio prüfen|Abgleich mit der Aufnahme|Wiedergabe derzeit manuell|Grundlage: übermittelte Mitschrift|Rechte prüfen|übermittelt|Einbettbarkeit|incorporabilità|vor dem Einsatz|beleidigende Wörter/i;
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
      <div class="lcard-meta"><span>${plural(x.questions.length, 'Aufgabe', 'Aufgaben')}</span>${working ? '<span class="flag">Arbeitsfassung</span>' : ''}</div>
      <h3 ${hasPhotoCover(x) ? '' : 'class="sr-only"'}><button data-lesson="${esc(x.id)}">${esc(x.title)}</button></h3>
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
    <div class="eyebrow">Italienisch · 1. Lernjahr</div>
    <h3>Primo anno</h3>
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

/* Nächste Grammatikübungen: erstes Thema des gewählten Lernjahrs mit offenen Übungen, einfach zuerst. */
function nextGrammar(limit = 3) {
  if (typeof grTopics !== 'function' || lernSprache() !== 'it') return [];
  const band = typeof GR_STATE !== 'undefined' ? GR_STATE.band || 1 : 1;
  const order = { leicht: 0, mittel: 1, schwer: 2 };
  const out = [];
  for (const t of grTopics().filter(t => t.band === band)) {
    const open = t.items.filter(x => !lessonStatus(x).done).sort((a, b) => order[a.grammar.difficulty] - order[b.grammar.difficulty]);
    if (open.length) out.push(open[0]);
    if (out.length >= limit) break;
  }
  return out;
}
/* Kachel für einen Lernbereich */
const areaTile = (nav, title, text, extra = '') => `<button class="area" data-nav="${nav}">${icon(nav === 'wuerfeln' ? 'wuerfeln' : nav)}<span><b>${title}</b><small>${text}</small></span>${extra}</button>`;
function areaTiles(teacher) {
  const lang = lernSprache();
  const it = lang === 'it';
  const listen = contentList('listening').filter(x => x.language === lang).length;
  const topics = it && typeof grTopics === 'function' ? grTopics().length : 0;
  const due = dueWordCount();
  return `<div class="areas">
    ${it ? areaTile('grammatik', 'Grammatik', `${topics} Themen mit Merkkasten, drei Stufen`) : ''}
    ${it ? areaTile('vokabeln', 'Wortschatz', teacher ? 'Wortlisten nach Lernjahr, zum Üben und Drucken' : due ? plural(due, 'Wort wartet', 'Wörter warten') + ' auf dich' : 'Karten, Schreiben, Zuordnen') : ''}
    ${areaTile('hoeren', 'Hörverstehen', listen ? plural(listen, 'Übung', 'Übungen') + ' mit Video oder Audio' : 'In dieser Sprache noch im Aufbau')}
    ${it ? areaTile('verben', 'Verben', 'Alle Zeiten, gestaffelt nach Lernjahr') : ''}
    ${it ? areaTile('wuerfeln', 'Neu würfeln', 'Artikel, Plural, Endungen: jede Runde neue Wörter') : ''}
    ${it ? areaTile('zahlen', 'Zahlen und Uhrzeit', 'Hören, lesen, schreiben') : ''}
  </div>${it ? '' : `<p class="small muted">Grammatik, Wortschatz und Verben gibt es zurzeit für Italienisch.</p>`}`;
}
function learnerHome(list, p) {
  const lang = lernSprache();
  const inLang = list.filter(x => x.language === lang);
  // Zuletzt geöffnet: Hörübung oder Grammatik, solange noch nicht fertig
  const recent = p.history.map(h => findTask(h.id)).find(x => x && x.language === lang && !lessonStatus(x).done);
  const due = dueWordCount();
  const day = activeProfile().history[nowDate()];
  const goal = activeProfile().goal || 10;
  const doneToday = day?.ids.length || 0;
  const percent = Math.min(100, Math.round((100 * doneToday) / goal));
  const streak = learningStreak();
  const fresh = !p.history.length && !Object.keys(records).length;
  const gram = nextGrammar(3).filter(x => x !== recent);
  const more = nextLessons(inLang, 6).filter(x => x !== recent).slice(0, 6);
  const st = recent && lessonStatus(recent);
  const gramCard = x => `<button class="next-card" data-lesson="${esc(x.id)}"><span class="eyebrow">Grammatik · ${esc(GRAMMAR_LEVELS[x.grammar.difficulty] || '')}</span><b lang="${x.language}">${esc(x.grammar.topicTitle)}</b><small lang="${x.language}">${esc(x.title)}</small></button>`;
  return `<section class="today">
      <div class="today-copy">
        <div class="eyebrow">Mein Lernbereich</div>
        <h1>${fresh ? 'Sprachen lernen,<br><em>Schritt für Schritt.</em>' : 'Weiter geht’s.'}</h1>
        <p>${fresh ? 'Grammatik mit Merkkasten, Wortschatz, Verben und Hörverstehen. Mit Rückmeldung, in deinem Tempo, ohne Anmeldung.' : `<span>${doneToday} von ${goal} Wörtern heute geübt.</span>${due ? ` <span>${plural(due, 'Wort wartet', 'Wörter warten')} auf ein Wiedersehen.</span>` : ''}`}</p>
        ${lernSwitch()}
      </div>
      <div class="today-side">
        <button class="today-ring" data-nav="fortschritt" style="--p:${percent}" aria-label="Tagesziel: ${doneToday} von ${goal} Wörtern"><b>${doneToday}</b><small>von ${goal}</small></button>
        ${streak.n ? `<span class="streak" title="Lernserie"><b>${streak.n}</b> ${streak.n === 1 ? 'Tag' : 'Tage'} in Folge</span>` : ''}
      </div>
    </section>
    ${
      recent
        ? `<article class="resume">
      <button class="resume-media" data-lesson="${esc(recent.id)}" tabindex="-1" aria-hidden="true">${recent.kind === 'grammar' ? `<span class="resume-gram" lang="${recent.language}">${esc(recent.grammar.topicTitle)}</span>` : lessonCoverHTML(recent)}</button>
      <div class="resume-body">
        <div class="eyebrow">Weitermachen · ${recent.kind === 'grammar' ? 'Grammatik' : 'Hörverstehen'}</div>
        <h2>${esc(recent.title)}</h2>
        <p>${esc(portalLang(recent.language))} · ${esc(recent.level)} · ${plural(recent.questions.length, 'Aufgabe', 'Aufgaben')}</p>
        ${st.percent ? `<div class="lcard-progress" aria-hidden="true"><i style="width:${st.percent}%"></i></div>` : ''}
        <button class="button primary large" data-lesson="${esc(recent.id)}">Weitermachen</button>
      </div>
    </article>`
        : ''
    }
    ${sectionHead('', 'Was möchtest du üben?')}
    ${areaTiles(false)}
    ${gram.length ? sectionHead('', 'Als Nächstes in der Grammatik', 'grammatik', 'Alle Themen') + `<div class="next-grid">${gram.map(gramCard).join('')}</div>` : ''}
    ${more.length ? sectionHead('', 'Hörverstehen für dich', 'hoeren', 'Alle ansehen') + `<div class="cards-grid rail">${more.map(lessonCard).join('')}</div>` : ''}
    <div class="stat-row" aria-label="Dein Lernstand">
      <button data-nav="fortschritt"><b>Stärken und Schwächen</b><span>Dein Überblick${typeof ACC !== 'undefined' && ACC.user ? ' · im Konto gespeichert' : ''}</span></button>
      <button data-nav="sammlung"><b>${p.favorites.length}</b><span>in der Merkliste</span></button>
    </div>`;
}

/* Lehrkräfte: Dashboard. Oben Begrüßung und Schnellaktionen, dann Kennzahlen und laufende Klassensitzungen
   (live aus dem Konto, tdashLoad in aufgabe.js), daneben Mappe, CILS-Training, eigene Übungen und Material. */
function teacherHome(list, p) {
  const lang = lernSprache();
  const recent = p.history
    .map(h => findTask(h.id))
    .filter(x => x && x.language === lang)
    .slice(0, 4);
  const ids = typeof wsAll === 'function' ? wsAll() : [];
  const mappe = ids.map(id => findTask(id)).filter(Boolean);
  const own = typeof editorState !== 'undefined' ? editorState.items.length : 0;
  const user = typeof ACC !== 'undefined' ? ACC.user : null;
  const first = user?.user_metadata?.first_name || '';
  const h = new Date().getHours();
  const hello = h < 11 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera';
  const today = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });
  const cils = typeof cilsSetsHTML === 'function' ? cilsSetsHTML(1) : '';
  if (user) setTimeout(() => typeof tdashLoad === 'function' && tdashLoad(), 0);
  return `<section class="tdash">
    <header class="tdash-hero">
      <div class="tdash-hello"><div class="eyebrow">Mein Unterricht · ${esc(today)}</div><h1>${hello}${first ? ', ' + esc(first) : ''}.</h1><p>Stunde vorbereiten, Klasse starten, Ergebnisse im Blick.</p></div>
      <div class="tdash-quick">
        <button class="tq" data-ws-open="1">${icon('mappe')}<span><b>Stunde planen</b><small>Unterrichtsmappe</small></span></button>
        <button class="tq" data-ws-link>${icon('qr')}<span><b>Klasse starten</b><small>QR-Code für die iPads</small></span></button>
        <button class="tq" data-nav="cils">${icon('cils')}<span><b>CILS-Training</b><small>Aufgabentypen A1 bis C2</small></span></button>
        <button class="tq" data-nav="redaktion">${icon('ki')}<span><b>Übung erstellen</b><small>mit KI oder selbst</small></span></button>
      </div>
    </header>
    <div class="tdash-kpis" id="tdash-kpis">${
      user
        ? ['Laufende Sitzungen', 'Heute aktiv', 'Heute erledigt', 'Richtig im Schnitt'].map(l => `<div class="kpi is-loading"><b>–</b><span>${l}</span></div>`).join('')
        : `<div class="kpi kpi-login"><div><b>Klasse live verfolgen</b><span>Mit einem kostenlosen daje-Konto siehst du hier, wer gerade arbeitet, was erledigt ist und wo es hakt.</span></div><button class="button primary" data-acc-open>Anmelden oder registrieren</button></div>`
    }</div>
    <div class="tdash-grid">
      <article class="tdc tdc-live"><header><span class="tdc-ico">${icon('klassen')}</span><div><h2>Klassensitzungen</h2><small>Wer arbeitet woran?</small></div><button class="quiet" data-nav="klassen">Alle</button></header>
        <div id="tdash-live">${user ? '<p class="muted small">Wird geladen …</p>' : '<p class="muted small">Nach der Anmeldung erscheinen hier deine laufenden Sitzungen mit dem Stand jeder Schülerin und jedes Schülers.</p>'}</div></article>
      ${typeof ACC !== 'undefined' && ACC.admin ? `<article class="tdc tdc-admin"><header><span class="tdc-ico">${icon('account')}</span><div><h2>Lehrkräfte freischalten</h2><small id="tdash-admin-n">wird geladen …</small></div></header><div id="tdash-admin"></div></article>` : ''}
      ${user && !(typeof accIsTeacher === 'function' && accIsTeacher()) ? `<article class="tdc tdc-admin"><header><span class="tdc-ico">${icon('account')}</span><div><h2>Freischaltung als Lehrkraft</h2><small>${ACC.teacher === 'pending' ? 'Antrag liegt vor' : 'nötig für Klassensitzungen'}</small></div></header><p class="muted small">${ACC.teacher === 'pending' ? 'Sobald dein Konto freigeschaltet ist, kannst du Klassensitzungen starten. Alles andere funktioniert schon.' : 'Material, Mappe, Arbeitsblätter und CILS-Training kannst du sofort nutzen. Für Klassensitzungen schaltet die Redaktion dich einmal frei.'}</p>${ACC.teacher === 'pending' ? '' : '<div class="tdc-act"><button class="button primary" data-ws-link>Freischaltung beantragen</button></div>'}</article>` : ''}
      <article class="tdc tdc-mappe"><header><span class="tdc-ico">${icon('mappe')}</span><div><h2>Unterrichtsmappe</h2><small>${mappe.length ? plural(mappe.length, 'Übung', 'Übungen') : 'noch leer'}</small></div><button class="quiet" data-ws-open="1">Öffnen</button></header>
        ${mappe.length ? `<ol class="tlist">${mappe.slice(0, 4).map(x => `<li><button class="quiet" data-lesson="${esc(x.id)}"><b>${esc(x.title)}</b><small>${esc(portalLang(x.language))} · ${esc(x.level)}${x.kind === 'grammar' ? ' · ' + esc(x.grammar.topicTitle) : ''}</small></button></li>`).join('')}${mappe.length > 4 ? `<li class="muted small">und ${mappe.length - 4} weitere</li>` : ''}</ol>` : '<p class="muted small">Sammle Übungen mit „In die Mappe“ oder lass dir fünf passende zusammenstellen.</p>'}
        <div class="tdc-act">${mappe.length ? '<button class="button primary" data-ws-link>Klassenlink</button><button class="button secondary" data-ws-print="0">Arbeitsblatt</button>' : '<button class="button primary" data-ws-open="1">Fünf Übungen vorschlagen</button>'}</div></article>
      <article class="tdc tdc-cils"><header><span class="tdc-ico">${icon('cils')}</span><div><h2>CILS-Training</h2><small>Hören, Lesen, Strukturen, Schreiben, Sprechen</small></div><button class="quiet" data-nav="cils">Neu</button></header>
        ${cils || '<p class="muted small">Einzelne Aufgabentypen der CILS von A1 bis C2: Typ wählen, Auftrag an die KI kopieren, Antwort einfügen. Hörverstehen mit deiner eigenen Aufnahme.</p><div class="tdc-act"><button class="button primary" data-nav="cils">Übung erstellen</button></div>'}</article>
      <article class="tdc tdc-own"><header><span class="tdc-ico">${icon('ki')}</span><div><h2>Eigene Übungen</h2><small>${own ? plural(own, 'eigene Übung', 'eigene Übungen') : 'aus Text, Buchseite oder Video'}</small></div><button class="quiet" data-nav="redaktion">Alle</button></header>
        <div class="tdc-chips"><button class="chip" data-nav="redaktion">Grammatik mit KI</button><button class="chip" data-nav="redaktion">Wortliste mit KI</button><button class="chip" data-nav="redaktion">Hörübung mit KI</button></div></article>
      <article class="tdc tdc-material"><header><span class="tdc-ico">${icon('grammatik')}</span><div><h2>Material</h2><small>mit Lösungen und Druckfassung</small></div></header>
        <div class="tdc-body">${lernSwitch()}
        <form class="xsearch" data-home-search role="search"><input id="home-search" type="search" placeholder="Material suchen, zum Beispiel città" aria-label="Material suchen"><button class="button primary" type="submit">Suchen</button></form></div>
        <div class="tdc-chips"><button class="chip" data-nav="grammatik">Grammatik</button><button class="chip" data-nav="vokabeln">Wortschatz</button><button class="chip" data-nav="hoeren">Hörverstehen</button><button class="chip" data-nav="verben">Verben</button><button class="chip" data-nav="wuerfeln">Neu würfeln</button></div></article>
      ${
        recent.length
          ? `<article class="tdc tdc-recent"><header><span class="tdc-ico">${icon('verlauf')}</span><div><h2>Zuletzt angesehen</h2></div><button class="quiet" data-nav="verlauf">Verlauf</button></header><ol class="tlist">${recent.map(x => `<li><button class="quiet" data-lesson="${esc(x.id)}"><b>${esc(x.kind === 'grammar' ? x.grammar.topicTitle : x.title)}</b><small>${x.kind === 'grammar' ? esc(x.title) + ' · ' : ''}${esc(x.level)}</small></button></li>`).join('')}</ol></article>`
          : ''
      }
    </div>
  </section>`;
}

function portalHome() {
  $('breadcrumb').textContent = isTeacher() ? 'Mein Unterricht' : 'Mein Lernbereich';
  if (portalFilters.language !== 'all') portalFilters.language = lernSprache();
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

/* Lernsprache als deutlich sichtbarer Bereich: Italiano · English · Français · Español (im Katalog auch „Alle Sprachen“). */
function lernSwitch(langs, mode = 'home') {
  if (Object.keys(LERN_NAMES).length < 2) return '';
  const cur = mode === 'filter' ? portalFilters.language : lernSprache();
  const list = Object.keys(LERN_NAMES).filter(l => !langs || langs.includes(l));
  const btn = (v, t) => `<button class="lern-opt" data-portal="${mode === 'filter' ? 'filter-set' : 'lern-set'}" data-key="language" data-value="${v}" aria-pressed="${cur === v}"><span lang="${v}">${t}</span></button>`;
  return `<div class="lern-switch" role="group" aria-label="Lernsprache"><span class="lern-label">Ich lerne</span>${list.map(l => btn(l, LERN_NAMES[l])).join('')}${mode === 'filter' ? btn('all', 'Alle Sprachen') : ''}</div>`;
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
      ${lernSwitch(languages.map(([k]) => k), 'filter')}
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
          ${lessonCoverHTML(x)}<span class="player-play" aria-hidden="true"></span><span class="player-hint">Video abspielen</span>
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
    case 'note_fill':
      return q.gaps.map((g, i) => i + 1 + ': ' + g.acceptedAnswers[0]).join(' · ');
    case 'true_false_ng':
      return { true: 'Richtig', false: 'Falsch', not_given: 'Nicht im Text' }[q.answer];
    case 'word_select':
      return q.options.filter(o => q.correctOptionIds.includes(o.id)).map(o => o.text).join(' · ');
    case 'gap_choice':
      return q.gaps.map((g, i) => i + 1 + ': ' + g.answer).join(' · ');
    case 'error_correction':
      return q.errors.map(e => e.wrong + ' → ' + e.acceptedAnswers[0]).join(' · ');
    case 'table_fill':
      return q.rows.flat().filter(c => typeof c === 'object').map((g, i) => i + 1 + ': ' + g.acceptedAnswers[0]).join(' · ');
    case 'categorize':
    case 'speaker_match':
      return q.items.map(it => it.text + ' → ' + q.categories.find(c => c.id === it.category).label).join(' · ');
    case 'open_answer':
      return q.modelAnswer || '–';
    case 'sentence_completion':
      return q.items.map((it, i) => i + 1 + ': ' + (it.modelAnswer || it.acceptedAnswers[0])).join(' · ');
    default:
      return q.modelAnswer;
  }
}
/* Text mit [[id]]-Lücken: jede Lücke über fn(id, Nummer) darstellen (Lückentext, Notizen, Fehler, Auswahl). */
/* Lückenbreite nach der längsten Lösung; Endungen wie „-a“ bekommen ein schmales Feld. */
const gapSize = answers => {
  const n = Math.max(...answers.map(a => a.length));
  return n <= 3 ? 3 : Math.max(8, Math.min(24, n + 3));
};
function gapHTML(text, fn) {
  let html = '', last = 0, n = 0;
  for (const m of text.matchAll(GAP_MARK)) {
    html += esc(text.slice(last, m.index)) + fn(m[1], ++n);
    last = m.index + m[0].length;
  }
  return html + esc(text.slice(last));
}
const sameAnswer = (list, v) => list.some(a => TheisContent.normAnswer(a) === TheisContent.normAnswer(v));

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
      q.type === 'single_choice'
        ? id === q.correctOptionId
        : q.type === 'true_false_ng'
          ? id === q.answer
          : id === (q.answer ? 'true' : 'false');
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
  } else if (q.type === 'matching') field = ixMatchingHTML(x, q, parts, state);
  else if (q.type === 'ordering') field = ixOrderingHTML(x, q, parts, state);
  else if (q.type === 'gap_fill') {
    const gap = (id, n) => {
      const g = q.gaps.find(v => v.id === id);
      const val = ownPart(parts, id) ? parts[id] : '';
      const ok = sameAnswer(g.acceptedAnswers, val);
      return `<input class="gap${gapSize(g.acceptedAnswers) === 3 ? ' gap-short' : ''}${mark(ok)}" data-listen-part="${q.id}" data-part="${id}" value="${esc(val)}" maxlength="80" size="${gapSize(g.acceptedAnswers)}" lang="${x.language}" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Lücke ${n}">`;
    };
    let n = 0;
    let html = '';
    let last = 0;
    for (const m of q.text.matchAll(GAP_MARK)) {
      html += esc(q.text.slice(last, m.index)) + gap(m[1], ++n);
      last = m.index + m[0].length;
    }
    // Wortkasten: alle Lösungen (erste Schreibweise) und Zusatzwörter, alphabetisch.
    const bank = q.wordBank ? [...new Set([...q.gaps.map(g => g.acceptedAnswers[0]), ...(q.extraWords || [])])].sort((a, b) => a.localeCompare(b)) : [];
    field = `${bank.length ? `<p class="q-hint">Tippe ein Wort an oder ziehe es in die Lücke. Du kannst auch selbst schreiben.</p><div class="word-bank" lang="${x.language}">${bank.map(w => `<button type="button" class="wb-chip" data-ix-word="${esc(w)}">${esc(w)}</button>`).join('')}</div>` : ''}<p class="gap-text" lang="${x.language}">${html}${esc(q.text.slice(last))}</p>`;
  } else if (q.type === 'true_false_ng')
    field = option('true', 'Richtig') + option('false', 'Falsch') + option('not_given', 'Nicht im Text');
  else if (q.type === 'word_select') {
    const chosen = String(value).split(',').filter(Boolean);
    field =
      '<p class="q-hint">Wähle alle Wörter, die du hörst.</p><div class="word-chips">' +
      q.options
        .map(o => {
          const st = state.checked ? (q.correctOptionIds.includes(o.id) ? ' is-correct' : chosen.includes(o.id) ? ' is-wrong' : '') : '';
          return `<label class="chip-opt${st}"><input type="checkbox" name="${q.id}" value="${o.id}" data-listen-multi="${q.id}" ${chosen.includes(o.id) ? 'checked' : ''}><span lang="${x.language}">${esc(o.text)}</span></label>`;
        })
        .join('') +
      '</div>';
  } else if (q.type === 'gap_choice')
    field = `<p class="gap-text" lang="${x.language}">${gapHTML(q.text, (id, n) => {
      const g = q.gaps.find(v => v.id === id);
      const val = ownPart(parts, id) ? parts[id] : '';
      return ixChoiceGap(q, id, n, val, val === g.answer, state.checked);
    })}</p>`;
  else if (q.type === 'note_fill') {
    const html = gapHTML(q.text, (id, n) => {
      const g = q.gaps.find(v => v.id === id);
      const val = ownPart(parts, id) ? parts[id] : '';
      return `<input class="gap${gapSize(g.acceptedAnswers) === 3 ? ' gap-short' : ''}${mark(sameAnswer(g.acceptedAnswers, val))}" data-listen-part="${q.id}" data-part="${id}" value="${esc(val)}" maxlength="80" size="${gapSize(g.acceptedAnswers)}" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Lücke ${n}">`;
    });
    field = `<ul class="note-lines" lang="${x.language}">${html.split('\n').filter(l => l.trim()).map(l => `<li>${l}</li>`).join('')}</ul>`;
  } else if (q.type === 'error_correction')
    field =
      '<p class="q-hint">Die durchgestrichenen Wörter sind falsch. Schreibe das richtige Wort.</p>' +
      `<p class="gap-text ec-text" lang="${x.language}">${gapHTML(q.text, (id, n) => {
        const e = q.errors.find(v => v.id === id);
        const val = ownPart(parts, id) ? parts[id] : '';
        return `<span class="ec"><s>${esc(e.wrong)}</s> <input class="gap${mark(sameAnswer(e.acceptedAnswers, val))}" data-listen-part="${q.id}" data-part="${id}" value="${esc(val)}" maxlength="80" size="${Math.max(8, Math.min(22, Math.max(...e.acceptedAnswers.map(a => a.length)) + 3))}" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="Korrektur ${n}"></span>`;
      })}</p>`;
  else if (q.type === 'table_fill')
    field = `<div class="tbl-wrap"><table class="fill-table" lang="${x.language}"><thead><tr>${q.columns.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${q.rows
      .map(
        r =>
          `<tr>${r
            .map((c, k) => {
              if (typeof c === 'string') return `<td>${esc(c)}</td>`;
              const val = ownPart(parts, c.id) ? parts[c.id] : '';
              return `<td><input class="gap cell${mark(sameAnswer(c.acceptedAnswers, val))}" data-listen-part="${q.id}" data-part="${c.id}" value="${esc(val)}" maxlength="80" autocomplete="off" autocapitalize="none" spellcheck="false" aria-label="${esc(q.columns[k])}"></td>`;
            })
            .join('')}</tr>`
      )
      .join('')}</tbody></table></div>`;
  else if (q.type === 'categorize' || q.type === 'speaker_match')
    field = (q.type === 'categorize' ? seededOrder(q.items, q.id) : q.items)
      .map(it => {
        const val = ownPart(parts, it.id) ? parts[it.id] : '';
        return `<div class="cat-row${mark(val === it.category)}"><span class="cat-text" lang="${x.language}">${esc(it.text)}</span><span class="cat-opts">${q.categories
          .map(c => `<label class="cat-opt"><input type="radio" name="${q.id}-${it.id}" value="${c.id}" data-listen-part="${q.id}" data-part="${it.id}" ${val === c.id ? 'checked' : ''}><span>${esc(c.label)}</span></label>`)
          .join('')}</span></div>`;
      })
      .join('');
  else if (q.type === 'sentence_completion')
    field = q.items
      .map((it, n) => {
        const val = ownPart(parts, it.id) ? parts[it.id] : '';
        const loose = t => String(t).normalize('NFC').toLocaleLowerCase().replace(/[’‘]/g, "'").replace(/[.,!?;:…«»"]+/g, ' ').replace(/\s+/g, ' ').trim();
        const ok = loose(val) && it.acceptedAnswers.some(a => loose(val).includes(loose(a)));
        return `<label class="sc-row${mark(ok)}"><span class="sc-start" lang="${x.language}">${esc(it.start)}</span><input class="sc-input" data-listen-part="${q.id}" data-part="${it.id}" value="${esc(val)}" maxlength="200" lang="${x.language}" autocomplete="off" aria-label="Satz ${n + 1} ergänzen"></label>`;
      })
      .join('');
  else if (q.type === 'open_answer')
    field = `<label class="field answer-field"><span>Deine Antwort</span><textarea data-listen-answer="${q.id}" rows="${Math.min(8, Math.max(3, q.lines || 4))}" maxlength="3000" lang="${x.language}">${esc(value)}</textarea></label>`;
  else
    field = `<label class="field answer-field"><span>Deine Antwort</span><input data-listen-answer="${q.id}" value="${esc(value)}" maxlength="1000" lang="${x.language}" autocomplete="off" placeholder="Kurz antworten"></label>`;
  const key =
    isTeacher() && teacherKeyVisible
      ? `<div class="q-key"><b>Lösung:</b> ${esc(solutionText(q))}${q.type === 'short_answer' ? `<br><span class="muted">Weitere Varianten: ${esc(q.acceptedAnswers.join(' / '))}</span>` : ''}</div>`
      : '';
  const feedback = state.checked && q.type === 'open_answer'
    ? `<div class="listen-feedback open"><b>Mögliche Lösung</b>${q.modelAnswer ? `<p lang="${x.language}">${esc(q.modelAnswer)}</p>` : ''}<small>Vergleiche deine Antwort selbst mit der möglichen Lösung.</small>${q.explanation ? `<p>${timeLinks(esc(visibleText(q.explanation)))}</p>` : ''}${q.explanationHelp ? helpToggleHTML(q.explanationHelp) : ''}</div>`
    : state.checked
    ? `<div class="listen-feedback ${correct ? 'correct' : 'wrong'}"><b>${correct ? 'Richtig erkannt' : value ? 'Noch nicht erkannt' : 'Noch keine Antwort'}</b>${correct ? '' : `<div>Lösung: ${esc(solutionText(q))}</div>`}<p${q.explanationHelp ? ` lang="${x.language}"` : ''}>${timeLinks(esc(visibleText(q.explanation)))}</p>${q.explanationHelp ? helpToggleHTML(q.explanationHelp) : ''}${q.type === 'short_answer' && !correct ? '<small>Andere passende Formulierungen sind möglich. Vergleiche selbst mit der Musterlösung.</small>' : ''}</div>`
    : '';
  const phase = q.prompt.match(QUESTION_PHASE);
  const prompt = phase ? q.prompt.slice(phase[0].length) : q.prompt;
  return `<fieldset class="q${index === focusIndex ? ' is-current' : ''}" id="q-${esc(q.id)}" data-index="${index}"><legend class="sr-only">Frage ${index + 1}: ${esc(q.prompt)}</legend>
    <div class="q-head" aria-hidden="true"><span class="q-num">${index + 1}</span><div><div class="q-type">${phase ? `<span class="q-phase">${esc(phase[1])}</span>` : ''}${LISTENING_FORMAT_LABELS[q.type]}</div><div class="q-prompt">${esc(prompt)}</div></div></div>
    ${q.promptHelp ? helpToggleHTML(q.promptHelp) : ''}<div class="q-options">${field}</div>${key}${feedback}</fieldset>`;
}
/* Hilfe in der Muttersprache: Anweisung bzw. Merkkasten bleiben in der Zielsprache, ein Tipp zeigt die deutsche Fassung. */
function helpToggleHTML(text) {
  return `<div class="q-help-row"><button type="button" class="q-help-btn" data-help-toggle aria-expanded="false">Auf Deutsch</button><p class="q-help" lang="de" hidden>${esc(text)}</p></div>`;
}
function ruleBodyHTML(rule, ruleHelp, lang) {
  return ruleHelp
    ? `<div class="rule-langs" role="group" aria-label="Sprache des Merkkastens"><button type="button" class="chip" data-rule-lang="it" aria-pressed="true">Italiano</button><button type="button" class="chip" data-rule-lang="de" aria-pressed="false">Deutsch</button></div><div class="rule-body" data-rule-body="it" lang="${lang}">${ruleHTML(rule, lang)}</div><div class="rule-body" data-rule-body="de" lang="de" hidden>${ruleHTML(ruleHelp, lang)}</div>`
    : `<div class="rule-body">${ruleHTML(rule, lang)}</div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-help-toggle],[data-rule-lang]');
  if (!b) return;
  if (b.hasAttribute('data-help-toggle')) {
    const p = b.nextElementSibling;
    p.hidden = !p.hidden;
    b.setAttribute('aria-expanded', String(!p.hidden));
    b.textContent = p.hidden ? 'Auf Deutsch' : 'Ausblenden';
    return;
  }
  const box = b.closest('.rule-card');
  box.querySelectorAll('[data-rule-lang]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  box.querySelectorAll('[data-rule-body]').forEach(x => (x.hidden = x.dataset.ruleBody !== b.dataset.ruleLang));
});

/* Abschnitt am Anfang einer Aufgabe („Prima dell’ascolto: …“) wird als Etikett gezeigt. */
const QUESTION_PHASE =
  /^(Prima dell['’]ascolto|Prima del film|Primo ascolto|Secondo ascolto|Terzo ascolto|Durante l['’]ascolto|Dopo l['’]ascolto|Dopo il film|Lessico e lingua|Lessico|Before listening|First listening|Second listening|Third listening|While listening|After listening|Before watching|While watching|After watching|Vocabulary|Language|Vor dem Hören|Erstes Hören|Zweites Hören|Drittes Hören|Beim Hören|Nach dem Hören|Wortschatz vorab|Wortschatz|Avant l['’]écoute|Première écoute|Deuxième écoute|Troisième écoute|Pendant l['’]écoute|Après l['’]écoute|Lexique|Antes de escuchar|Primera escucha|Segunda escucha|Tercera escucha|Mientras escuchas|Después de escuchar|Léxico)\s*:\s*/;
/* Abschnitte einer Hörübung je Zielsprache. Zwei Aufbauten: nach Hördurchgängen (1. Hören global →
   2. Hören Details → 3. Hören genau) oder vor / während / nach dem Hören; Sprache und Nachbereitung in beiden. */
const PHASES = {
  it: { pre: 'Prima dell’ascolto', p1: 'Primo ascolto', p2: 'Secondo ascolto', p3: 'Terzo ascolto', during: 'Durante l’ascolto', lang: 'Lessico e lingua', post: 'Dopo l’ascolto' },
  en: { pre: 'Before listening', p1: 'First listening', p2: 'Second listening', p3: 'Third listening', during: 'While listening', lang: 'Language', post: 'After listening' },
  fr: { pre: 'Avant l’écoute', p1: 'Première écoute', p2: 'Deuxième écoute', p3: 'Troisième écoute', during: 'Pendant l’écoute', lang: 'Lexique', post: 'Après l’écoute' },
  es: { pre: 'Antes de escuchar', p1: 'Primera escucha', p2: 'Segunda escucha', p3: 'Tercera escucha', during: 'Mientras escuchas', lang: 'Léxico', post: 'Después de escuchar' }
};
const PHASE_LABELS = [
  ['pre', 'Vor dem Hören'],
  ['p1', '1. Hören · global'],
  ['p2', '2. Hören · Details'],
  ['p3', '3. Hören · genau'],
  ['during', 'Während des Hörens'],
  ['lang', 'Sprache und Wortschatz'],
  ['post', 'Nach dem Hören']
];
/* Abschnitt einer Aufgabe: [Schlüssel oder '', Präfix samt Doppelpunkt, Rest der Aufgabenstellung]. */
function promptPhase(prompt) {
  const m = String(prompt || '').match(QUESTION_PHASE);
  if (!m) return ['', '', String(prompt || '')];
  const norm = t => t.replace(/['’]/g, '’').toLowerCase();
  let key = '';
  for (const L of Object.values(PHASES)) for (const [k, v] of Object.entries(L)) if (norm(v) === norm(m[1])) key = k;
  return [key, m[0], prompt.slice(m[0].length)];
}

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
  if (autoFocusOK()) form?.querySelector('fieldset.is-current input:not([type=radio]):not([type=checkbox]), fieldset.is-current select')?.focus({ preventScroll: true });
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
/* Eingabetaste in einer Lücke: zur nächsten Lücke springen (auch in die nächste Aufgabe), nie abgeben.
   Nach der letzten Lücke schließt sich die Tastatur; abgegeben wird nur mit dem Knopf. */
const TEXT_INPUT = 'input:not([type=radio]):not([type=checkbox]):not([type=hidden]):not([readonly])';
document.addEventListener('keydown', e => {
  if (e.key !== 'Enter' || e.isComposing || !e.target.matches?.(TEXT_INPUT) || !e.target.closest('#listening-form')) return;
  e.preventDefault();
  const form = $('listening-form');
  const all = [...form.querySelectorAll(TEXT_INPUT)];
  const next = all[all.indexOf(e.target) + 1];
  if (!next) {
    e.target.blur();
    form.querySelector('.checkbar')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return;
  }
  const fs = next.closest('fieldset.q');
  if (form.classList.contains('focus') && fs && !fs.classList.contains('is-current')) showFocus(Number(fs.dataset.index));
  next.focus();
  next.select?.();
});
/* Tastatur-Taste beschriften: „Weiter“ bzw. bei der letzten Lücke „Fertig“. */
document.addEventListener('focusin', e => {
  if (!e.target.matches?.(TEXT_INPUT)) return;
  const form = e.target.closest('#listening-form');
  if (!form) return;
  const all = [...form.querySelectorAll(TEXT_INPUT)];
  e.target.enterKeyHint = all.indexOf(e.target) === all.length - 1 ? 'done' : 'next';
});
/* Automatisch ins Eingabefeld springen: am Computer immer; auf Tablet und Handy nur, wenn gerade getippt wurde
   (sonst öffnet sich die Bildschirmtastatur, z. B. beim Antippen einer Einstellung). */
let lastTyping = 0;
document.addEventListener('input', e => {
  if (e.target.matches?.('input,textarea')) lastTyping = Date.now();
});
document.addEventListener('keydown', e => {
  if (e.target.matches?.('input,textarea')) lastTyping = Date.now();
});
const autoFocusOK = () => matchMedia('(hover: hover) and (pointer: fine)').matches || Date.now() - lastTyping < 5000;
/* Bildschirmtastatur offen: Leisten am unteren Rand ausblenden, damit sie nicht über der Tastatur schweben. */
{
  const coarse = () => matchMedia('(pointer: coarse)').matches;
  document.addEventListener('focusin', e => {
    if (coarse() && e.target.matches?.('input:not([type=radio]):not([type=checkbox]):not([type=range]),textarea,[contenteditable]')) document.body.classList.add('kb-open');
  });
  document.addEventListener('focusout', () =>
    setTimeout(() => {
      if (!document.activeElement?.matches?.('input:not([type=radio]):not([type=checkbox]):not([type=range]),textarea,[contenteditable]')) document.body.classList.remove('kb-open');
    }, 120)
  );
}

function resultBanner(x, state) {
  if (!state.checked || !state.lastResult) return '';
  const r = state.lastResult;
  if (!r.total)
    return `<section class="result-banner" role="status"><div class="result-score"><b>✓</b><span>abgegeben</span></div><div><h2>Gespeichert.</h2><p>Offene Aufgaben bewertet daje nicht automatisch. Vergleiche deine Antworten mit den möglichen Lösungen und den Prüfpunkten.</p></div></section>`;
  return `<section class="result-banner" role="status"><div class="result-score"><b>${r.correct}</b><span>von ${r.total}</span></div><div><h2>${x.kind === 'grammar' ? (r.correct === r.total ? 'Alles richtig.' : r.correct >= r.total / 2 ? 'Gut gemacht.' : 'Schau dir den Merkkasten noch einmal an.') : r.correct === r.total ? 'Alles erkannt.' : r.correct >= r.total / 2 ? 'Gut gehört.' : 'Hör noch einmal hin.'}</h2><p>${r.assisted ? 'Du hast das Transkript als Hilfe geöffnet. ' : ''}Prüfe die Erklärungen unter den ${x.kind === 'grammar' ? 'Aufgaben' : 'Fragen'} und versuche es bei Bedarf in einer neuen Runde.</p></div></section>`;
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
  const hasWords = x.vocabulary?.length || x.vocabularyIds?.length || x.media?.type === 'speech';
  const label = transcriptLabel(x);
  const sources = x.sources
    .map(
      s =>
        `<p>${esc(teacher ? s.citation : visibleText(s.citation))}${s.url ? ` <a href="${esc(s.url)}" target="_blank" rel="noopener">Originalquelle</a>` : ''}${teacher && s.meta && !s.meta.manual && typeof DajeKI !== 'undefined' && DajeKI.apaCite(s.meta).missing.length ? `<br><small class="muted">Angaben fehlen: ${esc(DajeKI.apaCite(s.meta).missing.join(', '))}</small>` : ''}</p>`
    )
    .join('');
  // Leere Karten zeigen wir nicht: keine Wortliste, kein Transkript (für Lernende) → keine Karte.
  const words = hasWords
    ? `<section class="tool-card"><div class="eyebrow">Passend dazu</div><h3>Wörter zu dieser Übung</h3><p>Bereite dich mit Wortschatz vor oder wiederhole nach dem Hören.</p><button class="button secondary" data-portal="related-words">Wörter ansehen${x.vocabulary?.length ? ' · ' + x.vocabulary.length : ''}</button></section>`
    : '';
  const transcript =
    x.kind !== 'grammar' && (teacher || transcriptForDisplay(x.transcript))
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
  return t && t.warmup ? `<section class="learn-note"><b>${x.kind === 'grammar' ? 'Zum Einstieg' : 'Vor dem Hören'}</b>${noteList('', t.warmup)}</section>` : '';
}
function followHTML(x) {
  const t = x.teacherNotes;
  return t && t.followUp ? `<section class="learn-note"><b>Zum Weiterdenken</b>${noteList('', t.followUp)}<small>Mündlich oder schriftlich – ohne automatische Auswertung.</small></section>` : '';
}
/* Merkkasten einer Grammatikübung: Absätze, Listen („- “), Tabellen („| a | b |“), **fett**, _kursiv_. */
function ruleHTML(text, lang) {
  const inline = t => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])_(.+?)_(?=[\s.,;:)!?]|$)/g, '$1<i>$2</i>');
  // Zeilen nach Art gruppieren (Text, Liste, Tabelle), auch ohne Leerzeile dazwischen.
  const kind = l => (/^\s*\|/.test(l) ? 't' : /^\s*- /.test(l) ? 'l' : 'p');
  const blocks = [];
  String(text || '')
    .split('\n')
    .forEach(l => {
      if (!l.trim()) return blocks.push(null);
      const k = kind(l), last = blocks[blocks.length - 1];
      if (last && last.k === k) last.lines.push(l);
      else blocks.push({ k, lines: [l] });
    });
  return blocks
    .filter(Boolean)
    .map(({ lines }) => {
      if (lines.every(l => /^\s*\|/.test(l))) {
        const rows = lines.filter(l => !/^\s*\|[\s:|-]*-[\s:|-]*$/.test(l)).map(l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
        return `<table class="rule-table"><thead><tr>${rows[0].map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${rows.slice(1).map(r => `<tr>${r.map(c => `<td lang="${lang}">${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
      }
      if (lines.every(l => /^\s*- /.test(l))) return `<ul>${lines.map(l => `<li>${inline(l.replace(/^\s*- /, ''))}</li>`).join('')}</ul>`;
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    })
    .join('');
}
const GRAMMAR_LEVELS = { leicht: 'einfach', mittel: 'mittel', schwer: 'schwer' };
function readingHTML(x) {
  const r = x.reading;
  if (!r) return '';
  const paras = String(r.text)
    .split(/\n{2,}/)
    .map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
  return `<section class="reading-card" lang="${x.language}"><span class="eyebrow">Testo</span>${r.title ? `<h3>${esc(r.title)}</h3>` : ''}<div class="reading-body">${paras}</div></section>`;
}
function grammarSideHTML(x) {
  const g = x.grammar;
  return readingHTML(x) + (g.rule ? `<details class="rule-card" open><summary><span class="eyebrow">Merkkasten</span><b>${esc(g.topicTitle)}</b></summary>${ruleBodyHTML(g.rule, g.ruleHelp, x.language)}</details>` : '');
}
function renderListening(preview = false) {
  const x = currentLesson();
  if (!x) return nav('hoeren');
  preview = preview || !findTask(x.id);
  const state = lessonProgress();
  const teacher = isTeacher();
  const count = x.questions.filter(q => String(state.answers[q.id] ?? '').trim()).length;
  const gram = x.kind === 'grammar';
  const cils = !!x.catalog?.tags?.includes('cils');
  $('breadcrumb').textContent = (cils ? 'Prüfungstraining · ' : gram ? 'Grammatik · ' : 'Hörverstehen · ') + x.title;
  const working = teacher && isWorkingLesson(x);
  const focus = !teacher && focusMode() && x.questions.length > 1;
  if (focusLesson !== x.id) {
    focusLesson = x.id;
    focusIndex = 0;
  }
  focusIndex = Math.min(focusIndex, x.questions.length - 1);
  $('main').innerHTML = `<div class="page lesson-page">
    ${EMBED ? '' : cils ? `<button class="quiet back-link" data-pt-back="${esc(x.level)}">Prüfungstraining · ${esc(x.level)}</button>` : gram ? `<button class="quiet back-link" data-gr-topic="${esc(x.grammar.topic)}">${esc(x.grammar.topicTitle)}</button>` : '<button class="quiet back-link" data-nav="hoeren">Alle Hörübungen</button>'}
    ${working ? `<div class="draftbar"><b>Arbeitsfassung</b><span>${cils ? 'Der Text beruht auf einem Artikel aus dem Netz. Für den eigenen Unterricht in Ordnung; vor „Für alle freigeben“ bitte die Nutzungsrechte prüfen.' : `Aufgaben, Transkript und Nutzungsrechte sind noch nicht abschließend geprüft.${!gram && !x.transcript && !x.series ? ' Das Transkript fehlt noch.' : ''}`}</span>${teacher && editorState.items.some(i => edId(i) === x.id) ? `<button class="quiet" data-ed-edit="${esc(x.id)}">In der Redaktion bearbeiten</button>` : ''}</div>` : ''}
    ${preview ? '<div class="draftbar"><b>Entwurf</b><span>Lokaler Redaktionsentwurf, nicht freigegeben.</span></div>' : ''}
    <header class="lesson-head">
      <div>
        <div class="lesson-chips"><span class="chip-solid">${esc(portalLang(x.language))}</span>${levelPill(x.level)}${gram ? `<span class="chip-plain gr-level gr-${x.grammar.difficulty}">${GRAMMAR_LEVELS[x.grammar.difficulty]}</span>${cils ? `<span class="chip-plain">${esc(x.catalog.textbook.unit || 'CILS')}</span>` : x.catalog?.textbook?.series ? `<span class="chip-plain">${esc((isCourseSeries(x.catalog.textbook.series) && ANNO_NAMES[x.catalog.textbook.volume] ? ANNO_NAMES[x.catalog.textbook.volume] : x.catalog.textbook.series + ' ' + (x.catalog.textbook.volume || '')) + ' · ' + (x.catalog.textbook.unit || ''))}</span>` : ''}` : `<span class="chip-plain">${MEDIA_LABELS[mediaKind(x)]}</span>`}</div>
        <h1>${esc(x.title)}</h1>
        <p>${esc(visibleText(x.description))}</p>
      </div>
      ${favoriteButton('listening', x.id)}
    </header>
    ${seriesSwitcher(x)}
    <div class="listening-layout">
      <div class="l-side">
        ${gram ? grammarSideHTML(x) : `<section class="media-box">${playerHTML(x)}</section>${readingHTML(x)}`}
        ${warmupHTML(x)}
        <div class="l-tools">${toolsHTML(x, state, preview)}</div>
      </div>
      <section class="l-tasks">
        ${
          teacher && !preview
            ? `<section class="teacher-bar"><div><b>Für den Unterricht</b><span>Aufgabenblatt, Lösungsschlüssel und Link</span></div><div class="teacher-actions"><button class="button secondary" data-teaching="${esc(x.id)}">Material und Druck</button><button class="button secondary" data-qr-show="${esc(x.id)}">QR-Code zeigen</button>${typeof hwButton === 'function' ? hwButton((gram ? 'g:' : 'l:') + x.id) : ''}${typeof wsButton === 'function' ? wsButton(x.id) : ''}${editorState.items.some(i => edId(i) === x.id) ? `<button class="button secondary" data-ed-edit="${esc(x.id)}">In der Redaktion bearbeiten</button>` : `<button class="button secondary" data-ed-copy="${esc(x.id)}">Als eigene Übung bearbeiten</button>`}${typeof liveEditButton === 'function' ? liveEditButton(x.id) : ''}<button class="button secondary" data-portal="copy-embed">Einbett-Code kopieren</button><button class="button secondary" data-portal="toggle-key" aria-pressed="${teacherKeyVisible}">${teacherKeyVisible ? 'Lösungen ausblenden' : 'Lösungen einblenden'}</button></div></section>`
            : ''
        }
        ${teacher && !preview ? teacherNotesHTML(x) : ''}
        <div class="tasks-head"><h2>${teacher || gram ? 'Aufgaben' : 'Was hast du verstanden?'}</h2><span id="listen-answer-count">${count} / ${x.questions.length} beantwortet</span></div>
        ${!teacher && x.questions.length > 1 ? `<div class="view-switch" role="group" aria-label="Darstellung der Aufgaben"><button type="button" data-focus="on" aria-pressed="${focus}">Eine nach der anderen</button><button type="button" data-focus="off" aria-pressed="${!focus}">Alle auf einmal</button></div>` : ''}
        <div class="qsteps" id="qsteps" aria-hidden="true">${stepsHTML(x, state)}</div>
        ${resultBanner(x, state)}
        <form id="listening-form" class="${focus ? 'focus' : ''}${focus && focusIndex === x.questions.length - 1 ? ' at-end' : ''}" novalidate>
          ${(() => {
            // Zwischenüberschrift, sobald ein neuer Abschnitt beginnt (z. B. „Primo ascolto“), nicht im Fokus-Modus.
            let last = '';
            return x.questions
              .map((q, i) => {
                const m = q.prompt.match(QUESTION_PHASE);
                const head = !focus && m && m[1] !== last ? `<h3 class="q-section" lang="${x.language}">${esc(m[1])}</h3>` : '';
                if (m) last = m[1];
                return head + questionHTML(x, q, i, state);
              })
              .join('');
          })()}
          ${focus ? focusNavHTML(x) : ''}
          <div class="checkbar"><span id="check-hint">${state.checked ? 'Du kannst Antworten ändern und erneut prüfen.' : 'Lösungen erscheinen nach der Korrektur.'}</span><button class="button primary large" type="submit">${state.checked ? 'Erneut prüfen' : 'Antworten korrigieren'}</button></div>
        </form>
        ${followHTML(x)}
        <section class="note-card"><label class="field"><span>${teacher ? 'Notiz zur Unterrichtsplanung' : 'Deine Notiz zu dieser Übung'}</span><textarea id="listening-note" maxlength="2000" placeholder="Was möchtest du dir merken?">${esc(portalProfile().notes[x.id] || '')}</textarea></label><small id="note-status" role="status">Nur im aktuellen lokalen Lernprofil gespeichert.</small></section>
        <div class="session-actions"><button class="button secondary" data-portal="reset-listening">Neue Runde beginnen</button></div>
      </section>
    </div>
    ${EMBED ? `<footer class="embed-foot"><a class="brandmark" href="${esc(location.origin + location.pathname)}" target="_blank" rel="noopener">daje · © 2026 <span class="embed-logo">theisapps</span></a></footer>` : ''}
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
