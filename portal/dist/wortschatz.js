/* Wortschatz: Übersicht nach Büchern und Themenlisten, darin „Nach Lektion“ oder „Nach Seiten“.
   Neue Bücher oder einzelne Listen (z. B. „Politik Oberstufe“) erscheinen automatisch als eigene Karte. */
let wsSynth = null;
{
  const ws = { coll: null, mode: 'lesson', sel: new Set(), from: '', to: '', cum: true, opt: true };
  const baseContentList = contentList;
  contentList = function (kind) {
    const list = baseContentList(kind);
    return kind === 'vocabulary' && wsSynth ? [...list, wsSynth] : list;
  };

  const pageSpan = s => {
    const m = String(s || '').match(/(\d+)\D+(\d+)|(\d+)/);
    if (!m) return null;
    return m[3] ? [Number(m[3]), Number(m[3])] : [Number(m[1]), Number(m[2])];
  };
  const pagesText = p => (p ? (p[0] === p[1] ? 'S. ' + p[0] : 'S. ' + p[0] + '–' + p[1]) : '');
  const BASE_PAGES = { ciao: [167, 167], approccio: [168, 168], '1a': [169, 170], '1b': [170, 171] };

  function collectionOf(x) {
    const t = x.catalog && x.catalog.textbook;
    if (t && t.series) {
      const vol = Number(t.volume) || 0;
      return { id: 'tb:' + t.series + ':' + vol, title: t.series + (vol ? ' ' + vol : ''), kind: 'Lehrwerk', sub: t.publisher || '', series: t.series, volume: vol };
    }
    const name = x.collection || 'Weitere Listen';
    return name === 'Hörverstehen'
      ? { id: 'c:hoeren', title: 'Aus Hörübungen', kind: 'Automatisch', sub: 'Wörter aus den Hörübungen', volume: 0 }
      : { id: 'c:' + name, title: name, kind: 'Themenliste', sub: '', volume: 0 };
  }

  function sections() {
    const map = new Map();
    const add = (c, s) => {
      if (!map.has(c.id)) map.set(c.id, { ...c, secs: [] });
      map.get(c.id).secs.push({ ...s, order: map.get(c.id).secs.length });
    };
    const bookId = 'tb:Ecco più:1';
    const eccoIn = contentList('vocabulary').some(x => collectionOf(x).id === bookId);
    const baseColl = { id: bookId, title: 'Ecco più 1', kind: 'Lehrwerk', sub: 'Cornelsen', series: 'Ecco più', volume: 1 };
    GROUPS.forEach(([g, , label]) => {
      const ws0 = WORDS.filter(w => w.group === g);
      add(baseColl, { key: 'base:' + g, base: g, title: label, unit: 'Ciao! und Unità 1', pages: BASE_PAGES[g] || null, n: ws0.length, seen: ws0.filter(w => records[w.id]).length });
    });
    void eccoIn;
    contentList('vocabulary').forEach(x => {
      if (x.id === 'ws-auswahl') return;
      const t = (x.catalog && x.catalog.textbook) || {};
      add(collectionOf(x), {
        key: x.id, id: x.id,
        title: String(x.section || x.title).replace(/^Ecco più \d+ · /, '').replace(/^Wortschatz · /, ''),
        unit: t.unit || '',
        pages: pageSpan(t.pages),
        n: x.entries.length,
        seen: x.entries.filter(w => records[x.id + '-' + w.id]).length
      });
    });
    map.forEach(c => {
      c.secs.sort((a, b) => (a.pages ? a.pages[0] : 1e6) - (b.pages ? b.pages[0] : 1e6) || a.order - b.order);
      c.n = c.secs.reduce((s, z) => s + z.n, 0);
      c.seen = c.secs.reduce((s, z) => s + z.seen, 0);
    });
    return [...map.values()].sort((a, b) => (a.kind === 'Lehrwerk' ? 0 : a.kind === 'Themenliste' ? 1 : 2) - (b.kind === 'Lehrwerk' ? 0 : b.kind === 'Themenliste' ? 1 : 2) || (a.series || '').localeCompare(b.series || '') || a.volume - b.volume || a.title.localeCompare(b.title));
  }

  const bar = (n, seen) => `<div class="lcard-progress" aria-hidden="true"><i style="width:${n ? Math.round((100 * seen) / n) : 0}%"></i></div>`;

  function home() {
    const all = sections();
    const teacher = isTeacher();
    const due = dueWordCount();
    const day = activeProfile().history[nowDate()];
    const goal = activeProfile().goal || 10;
    const done = day?.ids.length || 0;
    const lead = teacher
      ? ''
      : `<section class="feature-card"><div><div class="eyebrow">Heute</div><h2>${due ? plural(due, 'Wort wartet', 'Wörter warten') + ' auf ein Wiedersehen.' : 'Eine kleine Runde passt immer.'}</h2><p>${done} von ${goal} Wörtern heute geübt.</p>${bar(goal, Math.min(goal, done))}</div><button class="button primary large" data-extra="recommend">${due ? 'Jetzt wiederholen' : 'Runde starten'}</button></section>`;
    const group = (title, kinds) => {
      const cs = all.filter(c => kinds.includes(c.kind));
      return cs.length
        ? `${sectionHead('', title)}<div class="cards-grid ws-colls">${cs.map(c => `<button class="ws-coll" data-ws="open" data-coll="${esc(c.id)}"><span class="ws-kind">${esc(c.kind)}${c.sub ? ' · ' + esc(c.sub) : ''}</span><b>${esc(c.title)}</b><span class="ws-meta">${plural(c.secs.length, 'Abschnitt', 'Abschnitte')} · ${plural(c.n, 'Wort', 'Wörter')}</span>${bar(c.n, c.seen)}<span class="ws-state">${c.seen} von ${c.n} schon geübt</span></button>`).join('')}</div>`
        : '';
    };
    $('main').innerHTML = `<div class="page">
      <header class="page-head"><div class="eyebrow">Wortschatz</div><h1>Wörter, die bleiben.</h1><p>Wähle ein Buch oder eine Liste. Dort suchst du dir Lektionen oder Seiten aus und übst.</p></header>
      ${lead}
      ${group('Bücher', ['Lehrwerk'])}${group('Themenlisten', ['Themenliste'])}${group('Automatisch erzeugt', ['Automatisch'])}
      <section class="lookup-grid">
        <article class="lookup-card"><div><h3>Wortliste nachschlagen</h3><p class="muted">Den Ecco-Auszug durchsuchen und einzelne Wörter direkt üben.</p></div><button class="button secondary" data-nav="wortschatz">Öffnen</button></article>
        <article class="lookup-card"><div><h3>Verben im Presente</h3><p class="muted">Formen üben und überprüfen.</p></div><button class="button secondary" data-nav="verben">Öffnen</button></article>
      </section>
    </div>`;
  }

  const current = () => sections().find(c => c.id === ws.coll);

  function chosen(c) {
    const out = [];
    if (ws.mode === 'page') {
      const a = Number(ws.from) || 0, b = Number(ws.to) || 1e6;
      c.secs.forEach(s => s.pages && s.pages[1] >= a && s.pages[0] <= b && out.push(s));
      return out;
    }
    c.secs.forEach(s => ws.sel.has(s.key) && out.push(s));
    return out;
  }
  function priorVolumes(c) {
    if (!c.series || c.volume < 2) return [];
    return sections().filter(z => z.series === c.series && z.volume && z.volume < c.volume);
  }
  function earlierVolumes(c) {
    return ws.cum ? priorVolumes(c) : [];
  }

  function collection() {
    const c = current();
    if (!c) { ws.coll = null; return home(); }
    const pages = c.secs.filter(s => s.pages).flatMap(s => s.pages);
    const pMin = pages.length ? Math.min(...pages) : 0, pMax = pages.length ? Math.max(...pages) : 0;
    if (!ws.from) ws.from = pMin || '';
    if (!ws.to) ws.to = pMax || '';
    const hasPages = pages.length > 0;
    if (!hasPages) ws.mode = 'lesson';
    const units = [];
    c.secs.forEach(s => {
      let u = units.find(z => z.name === s.unit);
      if (!u) units.push((u = { name: s.unit, items: [] }));
      u.items.push(s);
    });
    const row = s => `<div class="ws-row"><label class="ws-pick"><input type="checkbox" data-ws="pick" data-key="${esc(s.key)}" ${ws.sel.has(s.key) ? 'checked' : ''}><span><b>${esc(s.title)}</b><small>${[pagesText(s.pages), plural(s.n, 'Wort', 'Wörter')].filter(Boolean).join(' · ')}</small></span></label>${bar(s.n, s.seen)}<button class="button secondary" data-ws="one" data-key="${esc(s.key)}">Üben</button></div>`;
    const lessonView = `<div class="ws-tools"><label>Alles bis einschließlich <select data-ws="upto"><option value="">–</option>${c.secs.map(s => `<option value="${esc(s.key)}">${esc((s.unit ? s.unit + ' · ' : '') + s.title)}</option>`).join('')}</select></label><button class="quiet" data-ws="all">Alle</button><button class="quiet" data-ws="none">Keine</button></div>${units.map(u => `<section class="ws-unit">${u.name ? `<h3>${esc(u.name)}</h3>` : ''}${u.items.map(row).join('')}</section>`).join('')}`;
    const inRange = chosen(c);
    const pageView = `<div class="ws-tools"><label>von Seite <input type="number" inputmode="numeric" data-ws="from" min="${pMin}" max="${pMax}" value="${esc(String(ws.from))}"></label><label>bis einschließlich Seite <input type="number" inputmode="numeric" data-ws="to" min="${pMin}" max="${pMax}" value="${esc(String(ws.to))}"></label><button class="quiet" data-ws="allpages">Ganzes Buch</button></div><p class="muted small">Seitenzahlen beziehen sich auf die Lista cronologica im Anhang des Buchs. Abschnitte, die den Bereich berühren, sind enthalten.</p>${inRange.map(s => `<div class="ws-row"><span class="ws-pick"><span><b>${esc(s.title)}</b><small>${[s.unit, pagesText(s.pages), plural(s.n, 'Wort', 'Wörter')].filter(Boolean).join(' · ')}</small></span></span></div>`).join('') || '<p class="muted">In diesem Bereich liegt noch kein Abschnitt.</p>'}`;
    const prior = earlierVolumes(c);
    const cumBox = c.volume > 1 && priorVolumes(c).length ? `<label class="ws-cum"><input type="checkbox" data-ws="cum" ${ws.cum ? 'checked' : ''}> <b>${esc(priorVolumes(c).map(z => z.title).join(', '))}</b> <span>als bekannt voraussetzen und mitrechnen</span></label>` : '';
    const sel = chosen(c);
    const words = [...prior.flatMap(z => z.secs), ...sel].reduce((s, z) => s + secWords(z).length, 0);
    const optBox = c.secs.some(z => z.id && (contentList('vocabulary').find(x => x.id === z.id) || { entries: [] }).entries.some(w => (w.tags || []).includes('fakultativ'))) ? `<label class="ws-cum"><input type="checkbox" data-ws="opt" ${ws.opt ? 'checked' : ''}> Fakultativen Wortschatz (im Buch kursiv) einbeziehen</label>` : '';
    $('main').innerHTML = `<div class="page ws-page">
      <button class="quiet" data-ws="home">← Wortschatz</button>
      <header class="page-head"><div class="eyebrow">${esc(c.kind)}${c.sub ? ' · ' + esc(c.sub) : ''}</div><h1>${esc(c.title)}</h1><p>${plural(c.secs.length, 'Abschnitt', 'Abschnitte')} · ${plural(c.n, 'Wort', 'Wörter')} · ${c.seen} geübt</p></header>
      ${hasPages ? `<div class="ws-seg" role="tablist"><button role="tab" aria-selected="${ws.mode === 'lesson'}" data-ws="mode" data-wsmode="lesson">Nach Lektion</button><button role="tab" aria-selected="${ws.mode === 'page'}" data-ws="mode" data-wsmode="page">Nach Seiten</button></div>` : ''}
      ${cumBox}
      ${optBox}
      ${ws.mode === 'page' ? pageView : lessonView}
      <div class="ws-action ${words ? 'on' : ''}"><span><b>${plural(words, 'Wort', 'Wörter')}</b> · ${plural(sel.length + prior.reduce((n, z) => n + z.secs.length, 0), 'Abschnitt', 'Abschnitte')} ausgewählt</span><span class="ws-btns"><button class="button primary" data-ws="train" ${words ? '' : 'disabled'}>Auswahl üben</button>${isTeacher() ? `<button class="button secondary" data-ws="print" ${words ? '' : 'disabled'}>Drucken / Word</button>` : ''}</span></div>
    </div>`;
  }

  function render() {
    if (ws.coll) collection(); else home();
  }

  const secWords = s => {
    if (s.base) return WORDS.filter(w => w.group === s.base);
    const x = contentList('vocabulary').find(z => z.id === s.id);
    return x
      ? x.entries.filter(w => ws.opt || !(w.tags || []).includes('fakultativ')).map(w => ({ id: x.id + '-' + w.id, target: w.target, translations: w.translations, acceptedAnswers: w.acceptedAnswers, grammar: w.grammar, answerPolicy: w.answerPolicy, language: x.language, label: x.title, def: w.definition, example: w.example, related: w.related, usage: w.usage, ipa: w.ipa, audio: w.audio, image: w.image }))
      : [];
  };
  const allSecs = c => [...earlierVolumes(c).flatMap(z => z.secs), ...chosen(c)];

  function trainDialog(secs, label) {
    const n = secs.reduce((s, z) => s + z.n, 0);
    let d = $('ws-train-dialog');
    if (!d) { d = document.createElement('dialog'); d.id = 'ws-train-dialog'; document.body.append(d); }
    d._secs = secs;
    d.innerHTML = `<div class="dialog-head"><h2>${esc(label)}</h2><button class="button secondary" data-close="ws-train-dialog">Schließen</button></div><p>${plural(n, 'Wort', 'Wörter')} · ${plural(secs.length, 'Abschnitt', 'Abschnitte')}</p><label class="field">Abfragerichtung<select id="ws-direction"><option value="de-it">Deutsch → Italienisch</option><option value="it-de">Italienisch → Deutsch</option></select></label><div class="mode-list">${[['cards', 'Karten', 'Erinnern und selbst einschätzen'], ['write', 'Schreiben', 'Antworten selbst eingeben'], ['match', 'Zuordnen', 'Wörter wiedererkennen'], ['definition', 'Erklärungen', 'Begriffe aus Beschreibungen finden']].map(([m, t, s]) => `<button class="mode" data-ws="go" data-training-mode="${m}"><b>${t}</b><small>${s}</small></button>`).join('')}</div><p class="small muted">Runden enthalten bis zu ${config.count} Einträge.</p>`;
    d.showModal();
  }

  function go(mode) {
    const d = $('ws-train-dialog');
    const words = d._secs.flatMap(secWords);
    config.language = 'it';
    config.direction = $('ws-direction')?.value || 'de-it';
    config.mode = mode;
    d.close();
    start(mode === 'definition' ? words.filter(w => w.def) : words, mode);
    view = 'lernen';
    markPortalNav('vokabeln');
  }

  function printSel(c) {
    const secs = allSecs(c);
    const entries = secs.flatMap(s =>
      secWords(s).map((w, i) => ({
        id: s.key + '-' + i,
        target: w.target || w.it,
        translations: w.translations || w.de,
        ...(w.definition || w.def ? { definition: w.definition || w.def } : {}),
        ...(w.example ? { example: w.example } : {}),
        ...(w.related ? { related: w.related } : {}),
        ...(w.usage ? { usage: w.usage } : {}),
        group: s.title + (s.pages ? ' · ' + pagesText(s.pages) : '')
      }))
    );
    wsSynth = { format: 'theis-learning-package', schemaVersion: '1.2', kind: 'vocabulary', id: 'ws-auswahl', title: c.title + ' · Auswahl', language: 'it', translationLanguage: 'de', level: 'A1', description: '', topics: [], collection: c.title, section: 'Auswahl', sources: [], entries };
    openVocabDoc('ws-auswahl');
  }

  vocabularyLibrary = render;

  document.addEventListener('click', e => {
    const closer = e.target.closest('[data-portal="close-print"]');
    if (closer && wsSynth) setTimeout(() => (wsSynth = null), 0);
    const b = e.target.closest('[data-ws]');
    if (!b || b.tagName === 'INPUT' || b.tagName === 'SELECT') return;
    const a = b.dataset.ws;
    if (a === 'open') { ws.coll = b.dataset.coll; ws.mode = 'lesson'; ws.sel = new Set(); ws.from = ws.to = ''; return render(); }
    if (a === 'home') { ws.coll = null; return render(); }
    if (a === 'mode') { ws.mode = b.dataset.wsmode; return render(); }
    if (a === 'all') { current().secs.forEach(s => ws.sel.add(s.key)); return render(); }
    if (a === 'none') { ws.sel = new Set(); return render(); }
    if (a === 'allpages') { ws.from = ws.to = ''; return render(); }
    const c = current();
    if (!c) return;
    if (a === 'one') {
      const s = c.secs.find(z => z.key === b.dataset.key);
      if (s.base) { return nav('lernen'); }
      return showVocabularySet(s.id);
    }
    if (a === 'train') return trainDialog(allSecs(c), c.title);
    if (a === 'print') return printSel(c);
    if (a === 'go') return go(b.dataset.trainingMode);
  });
  document.addEventListener('change', e => {
    const t = e.target.closest && e.target.closest('[data-ws]');
    if (!t) return;
    const a = t.dataset.ws;
    if (a === 'pick') { t.checked ? ws.sel.add(t.dataset.key) : ws.sel.delete(t.dataset.key); return render(); }
    if (a === 'cum') { ws.cum = t.checked; return render(); }
    if (a === 'opt') { ws.opt = t.checked; return render(); }
    if (a === 'from' || a === 'to') { ws[a] = t.value; return render(); }
    if (a === 'upto' && t.value) {
      const c = current(), i = c.secs.findIndex(s => s.key === t.value);
      ws.sel = new Set(c.secs.slice(0, i + 1).map(s => s.key));
      return render();
    }
  });
}
