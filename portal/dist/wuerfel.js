'use strict';
/*
 * Neu würfeln: Übungen, die bei jeder Runde neue Wörter ziehen. Grundlage sind die Wortlisten des Lernjahrs
 * (Nomen mit Artikel und Genus) und die Verbtabellen (verbs.js). Die Formen entstehen nach festen Regeln;
 * unsichere Fälle (Plural auf -co/-go/-io, Fremdwörter, Sprachen, Nomen mit Akzent am Ende) werden ausgelassen.
 * Eine Runde ist ein gewöhnliches Grammatikpaket (kind „grammar“, ID „wf-…“) und läuft über dieselbe Aufgabenansicht.
 * Die aktuelle Runde liegt im Browser (daje-wuerfel-v1), damit Neuladen und Zurück-Taste funktionieren.
 */
const WF_KEY = 'daje-wuerfel-v1';
const WF = Object.assign({ band: 1, upto: '', tense: 'pres', cur: null }, (() => {
  try {
    const x = JSON.parse(localStorage.getItem(WF_KEY) || '{}');
    return x && typeof x === 'object' ? x : {};
  } catch (e) {
    return {};
  }
})());
const wfSave = () => {
  try {
    localStorage.setItem(WF_KEY, JSON.stringify(WF));
  } catch (e) {}
};
const WF_N = 12; // Einheiten je Runde
const wfShuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
const wfPickN = (a, n) => wfShuffle(a).slice(0, n);
const APO = '’';

/* ---------- Wörter ---------- */
const WF_SKIP = new Set(['burro', 'calma', 'zucchero', 'sangue', 'oro', 'ferro', 'olio', 'riso', 'pazienza', 'fortuna', 'salute', 'aria', 'pace', 'storia', 'matematica', 'fisica', 'chimica', 'biologia', 'arte', 'ginnastica', 'religione', 'informatica', 'filosofia', 'economia', 'natura', 'moda', 'fame', 'sete', 'italiano', 'francese', 'tedesco', 'inglese', 'sardo', 'arabo', 'spagnolo', 'cinese', 'russo', 'latino', 'greco', 'portoghese', 'giapponese', 'turco', 'latte', 'gente', 'acqua', 'sale', 'pepe', 'carne', 'frutta', 'verdura', 'pasta', 'musica', 'pioggia', 'neve', 'fame', 'sete', 'paura']);
/* Lektionen eines Lernjahrs (aus den Wortlisten), in Buchreihenfolge */
function wfUnits(band) {
  const units = new Set();
  contentList('vocabulary').forEach(x => {
    const t = x.catalog?.textbook;
    if (t && isCourseSeries(t.series) && Number(t.volume || 1) === band && t.unit) units.add(t.unit);
  });
  return [...units].sort((a, b) => grUnitNo(a) - grUnitNo(b));
}
function wfNouns() {
  const out = new Map();
  contentList('vocabulary').forEach(x => {
    const t = x.catalog?.textbook;
    if (!t || !isCourseSeries(t.series)) return;
    const vol = Number(t.volume || 1);
    if (vol > WF.band) return;
    if (vol === WF.band && WF.upto && grUnitNo(t.unit || '') > grUnitNo(WF.upto)) return;
    (x.entries || []).forEach(e => {
      const g = e.grammar || {};
      if (g.partOfSpeech !== 'noun' || !['il', 'lo', 'la', "l'", 'l’'].includes(g.article)) return;
      const m = String(e.target).match(/^(il|lo|la|l['’])\s*(.+)$/);
      if (!m) return;
      const noun = m[2].trim();
      if (!noun || /[()/…;,.!?]|\d/.test(noun) || noun[0] !== noun[0].toLocaleLowerCase() || noun.split(' ').length > 3) return;
      const art = m[1].replace("'", APO);
      const gender = g.gender === 'feminine' ? 'f' : 'm';
      const de0 = (e.translations || [])[0] || '';
      // Deutsche Bedeutung ohne Artikel anzeigen (das deutsche Geschlecht führt sonst in die Irre)
      const de = de0.replace(/^(der|die|das)\s+/, '');
      // Plural nur bei zählbaren deutschen Entsprechungen mit Artikel, ohne Schulfächer
      const countable = /^(der|die|das)\s/.test(de0) && !/Schulfach/.test(de0);
      if (!out.has(noun)) out.set(noun, { noun, art, g: gender, de, countable });
    });
  });
  return [...out.values()];
}
const wfIndef = n => (n.art === 'lo' ? 'uno' : n.art === 'la' ? 'una' : n.art === 'l’' ? (n.g === 'f' ? 'un’' : 'un') : 'un');
/* Plural nur nach sicheren Regeln; sonst null */
function wfPlural(n) {
  const w = n.noun;
  // nur heimische, zählbare Wörter (keine Fremdwörter wie roulotte, sport, film)
  if (!n.countable || /\s/.test(w) || /[àèéìòù]$/.test(w) || /[kwyjx]|ou|oo|ee|th|sh/.test(w) || WF_SKIP.has(w)) return null;
  let pl = null;
  if (n.g === 'm') {
    if (/(co|go|io|ia)$/.test(w)) return null;
    if (/[oe]$/.test(w)) pl = w.slice(0, -1) + 'i';
  } else {
    if (/(cia|gia|ie)$/.test(w)) return null;
    if (/ca$/.test(w)) pl = w.slice(0, -2) + 'che';
    else if (/ga$/.test(w)) pl = w.slice(0, -2) + 'ghe';
    else if (/a$/.test(w)) pl = w.slice(0, -1) + 'e';
    else if (/e$/.test(w)) pl = w.slice(0, -1) + 'i';
  }
  if (!pl) return null;
  const art = n.g === 'f' ? 'le' : n.art === 'il' ? 'i' : 'gli';
  return { pl, art };
}
/* Adjektive: [m. Sg., f. Sg., m. Pl., f. Pl., Deutsch] – passen zu fast allen Nomen */
const WF_ADJ = [
  ['nuovo', 'nuova', 'nuovi', 'nuove', 'neu'],
  ['vecchio', 'vecchia', 'vecchi', 'vecchie', 'alt'],
  ['piccolo', 'piccola', 'piccoli', 'piccole', 'klein'],
  ['bello', 'bella', 'belli', 'belle', 'schön'],
  ['brutto', 'brutta', 'brutti', 'brutte', 'hässlich'],
  ['famoso', 'famosa', 'famosi', 'famose', 'berühmt'],
  ['moderno', 'moderna', 'moderni', 'moderne', 'modern'],
  ['antico', 'antica', 'antichi', 'antiche', 'alt, antik'],
  ['strano', 'strana', 'strani', 'strane', 'seltsam'],
  ['perfetto', 'perfetta', 'perfetti', 'perfette', 'perfekt'],
  ['italiano', 'italiana', 'italiani', 'italiane', 'italienisch'],
  ['grande', 'grande', 'grandi', 'grandi', 'groß'],
  ['importante', 'importante', 'importanti', 'importanti', 'wichtig'],
  ['interessante', 'interessante', 'interessanti', 'interessanti', 'interessant'],
  ['speciale', 'speciale', 'speciali', 'speciali', 'besonders'],
  ['elegante', 'elegante', 'eleganti', 'eleganti', 'elegant']
];

/* ---------- Übungen ---------- */
const WF_DRILLS = [
  {
    id: 'artikel',
    title: 'L’articolo determinativo',
    de: 'il, lo, la, l’ – mit Nomen aus deinem Wortschatz',
    rule: 'Maschile: **il** + consonante (_il libro_), **lo** + s + consonante, z, gn, ps (_lo zaino_), **l’** + vocale (_l’amico_).\nFemminile: **la** + consonante (_la casa_), **l’** + vocale (_l’amica_).',
    ruleHelp: 'Maskulin: **il** vor Konsonant, **lo** vor s + Konsonant, z, gn, ps, **l’** vor Vokal.\nFeminin: **la** vor Konsonant, **l’** vor Vokal.',
    ok: () => wfNouns().length >= 8,
    make(level) {
      const ns = wfPickN(wfNouns(), level === 'schwer' ? 8 : WF_N);
      if (level === 'leicht')
        return [wfChoice('Scegli l’articolo giusto.', 'Wähle den richtigen Artikel.', ns.map(n => [n.art, ['il', 'lo', 'la', 'l’'], ' ' + n.noun, n.de]), 'il, lo, la o l’? Guarda la prima lettera e il genere.', 'Achte auf den ersten Buchstaben und das Geschlecht.')];
      if (level === 'mittel')
        return [wfFill('Scrivi l’articolo determinativo.', 'Schreibe den bestimmten Artikel.', ns.map(n => ['', wfAlts(n.art), ' ' + n.noun + (n.de ? ` (${n.de})` : '')]), 'il, lo, la o l’: dipende dal genere e dalla prima lettera.', 'il, lo, la oder l’: Es kommt auf Geschlecht und Anfangsbuchstaben an.')];
      return [wfTable('Completa la tabella con l’articolo determinativo e indeterminativo.', 'Ergänze bestimmten und unbestimmten Artikel.', ['nome', 'determinativo', 'indeterminativo'], ns.map(n => [n.noun, wfAlts(n.art), wfAlts(wfIndef(n))]), 'lo → uno, l’ (femminile) → un’, l’ (maschile) → un.', 'lo → uno, l’ (feminin) → un’, l’ (maskulin) → un.')];
    }
  },
  {
    id: 'indet',
    title: 'L’articolo indeterminativo',
    de: 'un, uno, una, un’',
    rule: 'Maschile: **un** (_un libro, un amico_), **uno** + s + consonante, z, gn, ps (_uno zaino_).\nFemminile: **una** + consonante (_una casa_), **un’** + vocale (_un’amica_).',
    ruleHelp: 'Maskulin: **un**, vor s + Konsonant, z, gn, ps **uno**. Feminin: **una**, vor Vokal **un’**. Maskulin vor Vokal ohne Apostroph: _un amico_.',
    ok: () => wfNouns().length >= 8,
    make(level) {
      const ns = wfPickN(wfNouns(), WF_N);
      if (level === 'leicht')
        return [wfChoice('Scegli l’articolo giusto.', 'Wähle den richtigen Artikel.', ns.map(n => [wfIndef(n), ['un', 'uno', 'una', 'un’'], ' ' + n.noun, n.de]), 'Maschile davanti a vocale: un (senza apostrofo). Femminile: un’.', 'Maskulin vor Vokal: un (ohne Apostroph), feminin: un’.')];
      return [wfFill(level === 'schwer' ? 'Scrivi l’articolo indeterminativo. Attenzione all’apostrofo!' : 'Scrivi l’articolo indeterminativo.', 'Schreibe den unbestimmten Artikel.', ns.map(n => ['', wfAlts(wfIndef(n)), ' ' + n.noun + (level === 'schwer' ? '' : n.de ? ` (${n.de})` : '')]), 'un, uno, una o un’: come l’articolo determinativo, ma senza plurale.', 'un, uno, una oder un’: Die Regeln sind wie beim bestimmten Artikel.')];
    }
  },
  {
    id: 'plurale',
    title: 'Il plurale',
    de: 'Artikel und Nomen in den Plural setzen',
    rule: '- -o → **-i**: _il libro → i libri_\n- -a → **-e**: _la casa → le case_\n- -e → **-i**: _il ponte → i ponti, la chiave → le chiavi_\n- -ca / -ga → **-che / -ghe**: _l’amica → le amiche_\nArticoli: il → **i**, lo / l’ (m.) → **gli**, la / l’ (f.) → **le**.',
    ruleHelp: '-o → -i, -a → -e, -e → -i, -ca/-ga → -che/-ghe. Artikel: il → i, lo/l’ (m.) → gli, la/l’ (f.) → le.',
    ok: () => wfNouns().filter(wfPlural).length >= 8,
    make(level) {
      const ns = wfPickN(wfNouns().filter(wfPlural), WF_N);
      if (level === 'leicht')
        return [wfChoice('Scegli l’articolo plurale.', 'Wähle den Artikel im Plural.', ns.map(n => [wfPlural(n).art, ['i', 'gli', 'le'], ' ' + wfPlural(n).pl, n.de]), 'il → i, lo / l’ (maschile) → gli, la / l’ (femminile) → le.', 'il → i, lo/l’ (maskulin) → gli, la/l’ (feminin) → le.')];
      if (level === 'mittel')
        return [wfFill('Scrivi il plurale (articolo e nome).', 'Schreibe den Plural (Artikel und Nomen).', ns.map(n => [`${wfArt(n)} → `, [wfPlural(n).art + ' ' + wfPlural(n).pl], '']), 'Cambia l’articolo e la fine della parola.', 'Ändere den Artikel und die Endung.')];
      const half = Math.ceil(ns.length / 2);
      return [wfFill('Singolare o plurale? Scrivi l’altra forma con l’articolo.', 'Singular oder Plural? Schreibe die andere Form mit Artikel.', ns.map((n, i) => (i < half ? [`${wfArt(n)} → `, [wfPlural(n).art + ' ' + wfPlural(n).pl], ''] : [`${wfPlural(n).art} ${wfPlural(n).pl} → `, wfAlts(n.art).map(a => wfJoin(a, n.noun)), ''])), 'Plurale: il → i, lo → gli, la → le. Singolare: i → il, gli → lo / l’, le → la / l’.', 'Plural: il → i, lo → gli, la → le. Zurück in den Singular: i → il, gli → lo/l’, le → la/l’.')];
    }
  },
  {
    id: 'aggettivi',
    title: 'L’aggettivo: la concordanza',
    de: 'Adjektivendungen an das Nomen anpassen',
    rule: 'L’aggettivo concorda con il nome:\n| | maschile | femminile |\n| singolare | il libro **nuovo** | la casa **nuova** |\n| plurale | i libri **nuovi** | le case **nuove** |\nAggettivi in **-e**: _il ponte grande, la casa grande, i ponti grandi, le case grandi_.',
    ruleHelp: 'Das Adjektiv richtet sich nach Geschlecht und Zahl des Nomens: nuovo, nuova, nuovi, nuove. Adjektive auf -e haben nur zwei Formen: grande, grandi.',
    ok: () => wfNouns().filter(wfPlural).length >= 8,
    make(level) {
      const ns = wfPickN(wfNouns().filter(wfPlural), WF_N);
      const rows = ns.map((n, i) => {
        const a = WF_ADJ[Math.floor(Math.random() * WF_ADJ.length)];
        const pl = level !== 'leicht' && i % 2 === 1;
        const k = (n.g === 'f' ? 1 : 0) + (pl ? 2 : 0);
        const head = pl ? `${wfPlural(n).art} ${wfPlural(n).pl}` : wfArt(n);
        return { head, a, ans: a[k] };
      });
      if (level === 'leicht') return [wfChoice('Scegli la forma giusta dell’aggettivo.', 'Wähle die richtige Form des Adjektivs.', rows.map(r => [r.ans, [...new Set(r.a.slice(0, 4))], '', '', r.head + ' ']), 'L’aggettivo prende il genere del nome: -o (maschile), -a (femminile), -e (tutti e due).', 'Das Adjektiv übernimmt das Geschlecht des Nomens.')];
      return [wfFill('Scrivi l’aggettivo nella forma giusta.', 'Schreibe das Adjektiv in der richtigen Form.', rows.map(r => [r.head + ' ', [r.ans], ` (${r.a[0]})`]), 'Singolare e plurale, maschile e femminile: l’aggettivo cambia con il nome.', 'Das Adjektiv passt sich in Geschlecht und Zahl an.')];
    }
  },
  {
    id: 'verbi',
    title: 'I verbi',
    de: 'Verbformen in der gewählten Zeit',
    rule: 'Presente: parl**o**, parl**i**, parl**a**, parl**iamo**, parl**ate**, parl**ano** · prend**o**, … · dorm**o**, … · fin**isco**, …\nPassato prossimo: **avere / essere** + participio (_ho mangiato, sono andata_).',
    ruleHelp: 'Präsens: Endungen -o, -i, -a/-e, -iamo, -ate/-ete/-ite, -ano/-ono. Passato prossimo: avere oder essere + Partizip; mit essere passt sich das Partizip an.',
    ok: () => typeof VB_VERBS !== 'undefined',
    make(level) {
      const tenses = vbTensesFor(WF.band).map(t => t[0]).filter(t => !['imp', 'cong', 'congp', 'congi', 'congt'].includes(t));
      const verbs = VB_VERBS.filter(v => v.band <= WF.band);
      const items = [];
      for (let guard = 0; items.length < WF_N && guard < 200; guard++) {
        const v = verbs[Math.floor(Math.random() * verbs.length)];
        const t = level === 'schwer' ? tenses[Math.floor(Math.random() * tenses.length)] : level === 'leicht' ? 'pres' : tenses.includes(WF.tense) ? WF.tense : 'pres';
        if (!v.tenses[t]) continue;
        const p = Math.floor(Math.random() * 6);
        let forms = v.tenses[t][p];
        let who = VB_PERSONS[p];
        if (p === 2) {
          // lui oder lei: bei veränderlichem Partizip nur die passende Form
          const fem = Math.random() < 0.5;
          who = fem ? 'lei' : 'lui';
          if (forms.length === 2) forms = [forms[fem ? 1 : 0]];
        }
        if (items.some(x => x.v === v && x.t === t)) continue;
        items.push({ v, t, p, who, forms });
      }
      const tn = t => vbTenseName(t).toLowerCase();
      const AL = { pres: 'al presente', pp: 'al passato prossimo', impf: 'all’imperfetto', fut: 'al futuro', cond: 'al condizionale', ger: 'con stare + gerundio', trap: 'al trapassato prossimo', condp: 'al condizionale passato' };
      if (level === 'leicht')
        return [wfChoice('Scegli la forma giusta del verbo (presente).', 'Wähle die richtige Verbform (Präsens).', items.map(x => [x.forms[0], [...new Set([x.forms[0], ...wfPickN(x.v.tenses.pres.map(f => f[0]).filter(f => f !== x.forms[0]), 2)])], ` (${x.v.inf})`, '', `(${x.who}) `]), 'La persona decide la desinenza: io parlo, tu parli, lui parla …', 'Die Person bestimmt die Endung.')];
      return [wfFill(level === 'schwer' ? 'Scrivi il verbo nel tempo indicato.' : `Scrivi il verbo ${AL[items[0]?.t] || 'al presente'}.`, level === 'schwer' ? 'Schreibe das Verb in der angegebenen Zeit.' : 'Schreibe die Verbform.', items.map(x => [`(${x.who}) `, x.forms, ` (${x.v.inf}${level === 'schwer' ? ' · ' + tn(x.t) : ''})`]), 'Attenzione ai verbi irregolari e all’ausiliare essere.', 'Achte auf unregelmäßige Verben und das Hilfsverb essere.')];
    }
  }
];
const wfArt = n => wfJoin(n.art, n.noun);
const wfJoin = (a, w) => (/[’']$/.test(a) ? a + w : a + ' ' + w);
const wfAlts = a => (a.includes('’') ? [a, a.replace('’', "'")] : [a]);
/* rows: [Lösung, Möglichkeiten, Text danach, Deutsch, Text davor] */
function wfChoice(prompt, help, rows, expl, explHelp) {
  const gaps = [];
  const text = rows
    .map(([ans, opts, after, de, before], i) => {
      gaps.push({ id: 'g' + (i + 1), options: [...new Set(opts)], answer: ans });
      return `${before || ''}[[g${i + 1}]]${after || ''}${de ? ` (${de})` : ''}`;
    })
    .join('\n');
  return { id: 'q1', type: 'gap_choice', prompt, promptHelp: help, text, gaps, explanation: expl, explanationHelp: explHelp };
}
/* rows: [Text davor, Lösungen, Text danach] */
function wfFill(prompt, help, rows, expl, explHelp) {
  const gaps = [];
  const text = rows
    .map(([before, answers, after], i) => {
      gaps.push({ id: 'g' + (i + 1), acceptedAnswers: [...new Set(answers)] });
      return `${before}[[g${i + 1}]]${after}`;
    })
    .join('\n');
  return { id: 'q1', type: 'gap_fill', prompt, promptHelp: help, text, gaps, explanation: expl, explanationHelp: explHelp };
}
function wfTable(prompt, help, columns, rows, expl, explHelp) {
  let n = 0;
  return {
    id: 'q1',
    type: 'table_fill',
    prompt,
    promptHelp: help,
    columns,
    rows: rows.map(r => r.map(c => (typeof c === 'string' ? c : { id: 'c' + ++n, acceptedAnswers: c }))),
    explanation: expl,
    explanationHelp: explHelp
  };
}
const WF_LEVELS = [['leicht', 'einfach', 'antippen'], ['mittel', 'mittel', 'schreiben'], ['schwer', 'schwer', 'gemischt schreiben']];
function wfBuild(drillId, level) {
  const d = WF_DRILLS.find(x => x.id === drillId);
  const pkg = {
    format: 'theis-learning-package',
    schemaVersion: '1.2',
    kind: 'grammar',
    id: `wf-${d.id}-${level}`,
    title: d.title,
    language: 'it',
    level: WF.band >= 3 ? 'B1' : WF.band === 2 ? 'A2' : 'A1',
    description: d.de,
    topics: [d.title, 'Grammatik'],
    estimatedMinutes: 5,
    sources: [{ kind: 'own', citation: 'Automatisch zusammengestellte Übung aus dem Wortschatz (daje).', rights: 'own' }],
    reviewNotes: [],
    grammar: { topic: 'wf-' + d.id, topicTitle: d.title, difficulty: level, origin: 'own', rule: d.rule, ruleHelp: d.ruleHelp, order: 0 },
    questions: d.make(level)
  };
  const v = TheisContent.validatePackage(pkg);
  if (!v.ok) throw new Error(v.errors.join('; '));
  return v.value;
}

/* ---------- Einbindung ---------- */
{
  const baseFind = findTask;
  findTask = function (id) {
    return WF.cur && WF.cur.id === id ? WF.cur : baseFind(id);
  };
  const baseRender = render;
  render = function () {
    if (view === 'wuerfeln' && !session) return wfPage();
    return baseRender.apply(this, arguments);
  };
  const baseListen = renderListening;
  renderListening = function () {
    const r = baseListen.apply(this, arguments);
    const x = currentLesson();
    if (x && /^wf-/.test(x.id)) {
      document.querySelector('#listening-form')?.insertAdjacentHTML('beforebegin', `<div class="wf-bar"><button type="button" class="button primary" data-wf-roll>Neu würfeln</button><button type="button" class="button secondary" data-nav="wuerfeln">Andere Übung</button><span class="muted small">Jede Runde zieht neue Wörter.</span></div>`);
    }
    return r;
  };
  const baseBanner = resultBanner;
  resultBanner = function (x) {
    const html = baseBanner.apply(this, arguments);
    return html && /^wf-/.test(x.id) ? html.replace('</section>', '<div class="hw-next"><button type="button" class="button primary" data-wf-roll>Neu würfeln</button></div></section>') : html;
  };
}
function wfStart(drillId, level) {
  try {
    WF.cur = wfBuild(drillId, level);
  } catch (e) {
    return toast('Für diese Auswahl gibt es noch zu wenige Wörter. Wähle eine spätere Lektion.');
  }
  wfSave();
  openListening(WF.cur.id);
  const s = lessonProgress();
  s.answers = {};
  s.checked = false;
  delete s.lastResult;
  persistPortal();
  renderListening();
}
function wfPage() {
  $('breadcrumb').textContent = 'Grammatik · Neu würfeln';
  const units = wfUnits(WF.band);
  if (WF.upto && !units.includes(WF.upto)) WF.upto = '';
  const nouns = wfNouns().length;
  const tenses = vbTensesFor(WF.band).filter(t => !['imp', 'cong', 'congp', 'congi', 'congt'].includes(t[0]));
  const card = d => {
    const ok = d.ok();
    const extra = d.id === 'verbi' ? `<div class="chip-row" role="group" aria-label="Zeit">${tenses.map(([k, l]) => `<button type="button" class="chip" data-wf-tense="${k}" aria-pressed="${WF.tense === k}">${l}</button>`).join('')}</div><p class="small muted">Einfach: Presente · Mittel: gewählte Zeit · Schwer: alle Zeiten gemischt</p>` : '';
    return `<article class="wf-card${ok ? '' : ' is-off'}"><h3 lang="it">${esc(d.title)}</h3><p class="muted">${esc(d.de)}</p>${extra}<div class="wf-levels">${WF_LEVELS.map(([k, l, s]) => `<button type="button" class="button ${k === 'leicht' ? 'primary' : 'secondary'}" data-wf-go="${d.id}" data-level="${k}" ${ok ? '' : 'disabled'}><b>${l}</b><small>${s}</small></button>`).join('')}</div></article>`;
  };
  $('main').innerHTML = `<div class="page gr-page wf-page">
    <header class="page-head"><div class="eyebrow">Grammatik</div><h1>Neu würfeln.</h1><p>Jede Runde zieht neue Wörter aus deinem Wortschatz. So übst du Artikel, Endungen und Verbformen, so oft du willst.</p></header>
    <div class="ws-seg gr-band" role="tablist" aria-label="Lernjahr">${[1, 2, 3].map(b => `<button role="tab" aria-selected="${WF.band === b}" data-wf-band="${b}">${ANNO_NAMES[b]}</button>`).join('')}</div>
    <label class="field wf-upto">Wörter bis einschließlich<select data-wf-upto><option value="">alle Lektionen</option>${units.map(u => `<option value="${esc(u)}" ${u === WF.upto ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></label>
    <p class="small muted">${plural(nouns, 'Nomen', 'Nomen')} in der Auswahl.</p>
    <div class="wf-grid">${WF_DRILLS.map(card).join('')}</div>
  </div>`;
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-wf-go],[data-wf-roll],[data-wf-band],[data-wf-tense]');
  if (!b) return;
  if (b.dataset.wfGo) return wfStart(b.dataset.wfGo, b.dataset.level);
  if (b.hasAttribute('data-wf-roll') && WF.cur) {
    const [, drill, level] = WF.cur.id.match(/^wf-(\w+)-(\w+)$/) || [];
    if (drill) wfStart(drill, level);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  if (b.dataset.wfBand) {
    WF.band = Number(b.dataset.wfBand);
    WF.upto = '';
    wfSave();
    return wfPage();
  }
  if (b.dataset.wfTense) {
    WF.tense = b.dataset.wfTense;
    wfSave();
    return wfPage();
  }
});
document.addEventListener('change', e => {
  if (!e.target.matches?.('[data-wf-upto]')) return;
  WF.upto = e.target.value;
  wfSave();
  wfPage();
});
/* Neuladen mit ?hoeren=wf-…: die gespeicherte Runde wieder öffnen (app.js überlässt das hier). */
if (/^wf-/.test(params.get('hoeren') || '')) {
  if (WF.cur && WF.cur.id === params.get('hoeren')) openListening(WF.cur.id);
  else nav('wuerfeln');
}
