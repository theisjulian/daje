'use strict';
/*
 * Grammatik: Übersicht nach Lehrwerk (Ecco più 1–3) → Unità → Thema; Themenseite mit Merkkasten und
 * Übungen in den Stufen einfach, mittel, schwer. Die Übungen selbst sind Pakete (kind „grammar“) und
 * laufen über dieselbe Aufgabenansicht wie die Hörübungen (renderListening), nur ohne Player.
 * Dazu die Trainer: Verben (verbs.js) und Zahlen, Uhrzeit, Datum (zahlen.js).
 */
const GR_KEY = 'daje-grammatik-v1';
const GR_STATE = Object.assign({ band: 1, level: 'alle', topic: null }, (() => {
  try {
    const x = JSON.parse(localStorage.getItem(GR_KEY) || '{}');
    return { band: [0, 1, 2, 3].includes(x.band) ? x.band : 1, level: ['alle', 'leicht', 'mittel', 'schwer'].includes(x.level) ? x.level : 'alle' };
  } catch (e) {
    return {};
  }
})());
const grSave = () => {
  try {
    localStorage.setItem(GR_KEY, JSON.stringify({ band: GR_STATE.band, level: GR_STATE.level }));
  } catch (e) {}
};
/* Für verlauf.js: geöffnetes Thema lesen und beim Zurückgehen wiederherstellen. */
const grRoute = { keep: false, get: () => GR_STATE.topic, set: t => (GR_STATE.topic = t || null) };
/* Thema öffnen bzw. zur Übersicht: über nav, damit Verlauf (Zurück-Taste) und Markierung stimmen. */
function grGo(topic) {
  GR_STATE.topic = topic || null;
  grRoute.keep = true;
  try {
    nav('grammatik');
  } finally {
    grRoute.keep = false;
  }
}

const GR_UNITS = {
  'Ecco più 1': { 'Ciao!': 'Ciao!', 'Unità 1': 'Benvenuti a Torino', 'Unità 2': 'Il mio mondo', 'Unità 3': 'A scuola', 'Unità 4': 'Il tempo libero', 'Unità 5': 'La mia famiglia', 'Unità 6': '', 'Unità 7': '' },
  'Ecco più 3': { 'Unità 1': 'Tradizione – benedizione o maledizione?', 'Unità 2': 'Ampliare gli orizzonti', 'Unità 3': 'Le sfide alla società', 'Unità 4': 'Tra Nord e Sud' }
};
const GR_LEVELS = [['leicht', 'einfach'], ['mittel', 'mittel'], ['schwer', 'schwer']];
const grBand = x => {
  const t = x.catalog?.textbook || {};
  return /ecco/i.test(t.series || '') ? Number(t.volume) || 0 : 0;
};
const grUnitKey = x => x.catalog?.textbook?.unit || 'Weitere Themen';
const grUnitNo = u => (/^ciao/i.test(u) ? 0 : Number((u.match(/\d+/) || [99])[0]));

/* Themen aus allen Grammatikpaketen: { id, title, band, unit, section, order, rule, items: [Pakete] } */
function grTopics() {
  const map = new Map();
  for (const x of contentList('grammar')) {
    const g = x.grammar;
    if (!map.has(g.topic))
      map.set(g.topic, { id: g.topic, title: g.topicTitle, band: grBand(x), unit: grUnitKey(x), section: x.catalog?.textbook?.section || '', series: x.catalog?.textbook?.series || '', order: g.order ?? 9999, rule: '', lang: x.language, items: [] });
    const t = map.get(g.topic);
    t.items.push(x);
    if (!t.rule && g.rule) t.rule = g.rule;
    t.order = Math.min(t.order, g.order ?? 9999);
  }
  const lv = { leicht: 0, mittel: 1, schwer: 2 };
  map.forEach(t => t.items.sort((a, b) => lv[a.grammar.difficulty] - lv[b.grammar.difficulty] || (a.grammar.order ?? 0) - (b.grammar.order ?? 0) || a.title.localeCompare(b.title)));
  return [...map.values()].sort((a, b) => a.band - b.band || grUnitNo(a.unit) - grUnitNo(b.unit) || a.order - b.order || a.title.localeCompare(b.title));
}
const grDone = items => items.filter(x => lessonStatus(x).done).length;
const grBar = (n, d) => `<div class="lcard-progress" aria-hidden="true"><i style="width:${n ? Math.round((100 * d) / n) : 0}%"></i></div>`;

function grTrainers() {
  return `<section class="gr-trainers">
    <button class="gr-trainer" data-nav="verben">${icon('verben')}<span><b>Verben</b><small>Alle Zeiten, gestaffelt nach Band</small></span></button>
    <button class="gr-trainer" data-nav="zahlen">${icon('zahlen')}<span><b>Zahlen, Uhrzeit, Datum</b><small>Hören, lesen, schreiben</small></span></button>
  </section>`;
}

function grOverview() {
  const all = grTopics();
  const bands = [...new Set(all.map(t => t.band))];
  if (!bands.includes(GR_STATE.band) && bands.length) GR_STATE.band = bands.includes(1) ? 1 : bands[0];
  const shown = all.filter(t => t.band === GR_STATE.band);
  const units = [];
  shown.forEach(t => {
    let u = units.find(z => z.key === t.unit);
    if (!u) units.push((u = { key: t.unit, series: t.series, topics: [] }));
    u.topics.push(t);
  });
  const lvl = GR_STATE.level;
  const card = t => {
    const items = lvl === 'alle' ? t.items : t.items.filter(x => x.grammar.difficulty === lvl);
    if (!items.length) return '';
    const counts = GR_LEVELS.map(([k, l]) => [l, t.items.filter(x => x.grammar.difficulty === k).length, k]).filter(c => c[1]);
    const done = grDone(items);
    return `<button class="gr-topic" data-gr-topic="${esc(t.id)}"><span class="gr-sec">${esc(t.section || t.unit)}</span><b>${esc(t.title)}</b><span class="gr-counts">${counts.map(([l, n, k]) => `<span class="gr-level gr-${k}">${l} ${n}</span>`).join('')}</span>${grBar(items.length, done)}<span class="gr-state">${done} von ${items.length} geübt</span></button>`;
  };
  const bandSeg = `<div class="ws-seg gr-band" role="tablist" aria-label="Lehrwerk">${[1, 2, 3, 0].filter(b => bands.includes(b) || b === 1).map(b => `<button role="tab" aria-selected="${GR_STATE.band === b}" data-gr-band="${b}">${b ? 'Ecco più ' + b : 'Weitere'}</button>`).join('')}</div>`;
  const lvlChips = `<div class="chip-row gr-filter" role="group" aria-label="Stufe">${[['alle', 'Alle Stufen'], ...GR_LEVELS].map(([k, l]) => `<button class="chip" data-gr-level="${k}" aria-pressed="${lvl === k}">${l}</button>`).join('')}</div>`;
  const body = units.length
    ? units
        .map(u => {
          const cards = u.topics.map(card).join('');
          if (!cards) return '';
          const title = (GR_UNITS[u.series] || {})[u.key];
          return `<section class="gr-unit">${sectionHead('', u.key + (title ? ' · ' + title : ''))}<div class="gr-topics">${cards}</div></section>`;
        })
        .join('') || '<p class="muted">In dieser Stufe gibt es hier noch keine Übungen.</p>'
    : `<p class="muted">${GR_STATE.band === 2 || GR_STATE.band === 3 ? 'Für diesen Band kommen die Grammatikübungen als Nächstes. Verben und Zahlen kannst du schon üben.' : 'Noch keine Übungen.'}</p>`;
  $('main').innerHTML = `<div class="page gr-page">
    <header class="page-head"><div class="eyebrow">Grammatik</div><h1>Regeln verstehen, Formen sicher anwenden.</h1><p>Zu jedem Thema ein kurzer Merkkasten und Übungen in drei Stufen. Fang einfach an und steigere dich.</p></header>
    ${grTrainers()}
    ${bandSeg}${lvlChips}
    ${body}
  </div>`;
}

function grTopicPage() {
  const t = grTopics().find(z => z.id === GR_STATE.topic);
  if (!t) {
    GR_STATE.topic = null;
    return grOverview();
  }
  const teacher = isTeacher();
  const row = x => {
    const st = lessonStatus(x);
    const state = st.done ? `${st.progress.lastResult.correct} von ${st.progress.lastResult.total} richtig` : st.answered ? 'Angefangen' : 'Noch nicht geübt';
    return `<li class="gr-ex ${st.done ? 'is-done' : ''}"><span class="gr-ex-text"><b>${esc(x.title)}</b><small>${plural(x.questions.length, 'Aufgabe', 'Aufgaben')} · ${x.estimatedMinutes} Min. · ${esc(state)}</small></span><span class="gr-ex-actions">${teacher && typeof hwButton === 'function' ? hwButton('g:' + x.id) : ''}${teacher && typeof wsButton === 'function' ? wsButton(x.id) : ''}${teacher && typeof liveEditButton === 'function' ? liveEditButton(x.id, 'quiet') : ''}${teacher && editorState.items.some(i => edId(i) === x.id) ? `<button class="quiet" data-ed-edit="${esc(x.id)}">Bearbeiten</button>` : ''}<button class="button ${st.done ? 'secondary' : 'primary'}" data-lesson="${esc(x.id)}">${st.done ? 'Noch einmal' : 'Üben'}</button></span></li>`;
  };
  const levels = GR_LEVELS.map(([k, l]) => {
    const items = t.items.filter(x => x.grammar.difficulty === k);
    return items.length ? `<section class="gr-lvl"><h2><span class="gr-level gr-${k}">${l}</span></h2><ol class="gr-list">${items.map(row).join('')}</ol></section>` : '';
  }).join('');
  const title = (GR_UNITS[t.series] || {})[t.unit];
  $('main').innerHTML = `<div class="page gr-page">
    <button class="quiet back-link" data-gr-home>Grammatik</button>
    <header class="page-head"><div class="eyebrow">${esc([t.series && t.band ? t.series : '', t.unit + (title ? ' · ' + title : ''), t.section].filter(Boolean).join(' · '))}</div><h1>${esc(t.title)}</h1></header>
    ${t.rule ? `<section class="rule-card is-page"><div class="eyebrow">Merkkasten</div><div class="rule-body">${ruleHTML(t.rule, t.lang)}</div></section>` : ''}
    ${levels}
  </div>`;
}

function grammarPage() {
  if (GR_STATE.topic) grTopicPage();
  else grOverview();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-gr-topic],[data-gr-home],[data-gr-band],[data-gr-level]');
  if (!b) return;
  if (b.dataset.grTopic) return grGo(b.dataset.grTopic);
  if (b.hasAttribute('data-gr-home')) return grGo(null);
  if (b.dataset.grBand) GR_STATE.band = Number(b.dataset.grBand);
  if (b.dataset.grLevel) GR_STATE.level = b.dataset.grLevel;
  grSave();
  grammarPage();
});
