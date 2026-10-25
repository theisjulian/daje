'use strict';
/*
 * Verbentrainer: Formen werden aus Regeln erzeugt, Ausnahmen stehen ausdrücklich in der Liste.
 * Zeiten: Presente, Passato prossimo, Imperfetto, Futuro semplice, Condizionale presente.
 * Die Formen entsprechen den Tabellen im Anhang von Ecco più (Seite 186–197 in Band 2).
 */
const VB_PERSONS = ['io', 'tu', 'lui / lei', 'noi', 'voi', 'loro'];
const VB_TENSES = [
  ['pres', 'Presente'],
  ['pp', 'Passato prossimo'],
  ['impf', 'Imperfetto'],
  ['fut', 'Futuro'],
  ['cond', 'Condizionale']
];
const VB_GROUPS = [
  ['reg', 'Regelmäßig'],
  ['aux', 'Hilfs- und Modalverben'],
  ['irr', 'Unregelmäßig'],
  ['refl', 'Reflexiv'],
  ['all', 'Alle']
];
/* [Infinitiv, Deutsch, Gruppe, Klasse, Besonderheiten] – Klasse: are | ere | ire | isc */
const VB_DATA = [
  ['parlare', 'sprechen', 'reg', 'are', {}],
  ['abitare', 'wohnen', 'reg', 'are', {}],
  ['lavorare', 'arbeiten', 'reg', 'are', {}],
  ['comprare', 'kaufen', 'reg', 'are', {}],
  ['guardare', 'ansehen', 'reg', 'are', {}],
  ['ascoltare', 'zuhören', 'reg', 'are', {}],
  ['studiare', 'lernen, studieren', 'reg', 'are', { fut: 'studier' }],
  ['mangiare', 'essen', 'reg', 'are', {}],
  ['cominciare', 'beginnen', 'reg', 'are', {}],
  ['cercare', 'suchen', 'reg', 'are', {}],
  ['giocare', 'spielen', 'reg', 'are', {}],
  ['pagare', 'bezahlen', 'reg', 'are', {}],
  ['arrivare', 'ankommen', 'reg', 'are', { aux: 'essere' }],
  ['tornare', 'zurückkehren', 'reg', 'are', { aux: 'essere' }],
  ['vendere', 'verkaufen', 'reg', 'ere', {}],
  ['prendere', 'nehmen', 'reg', 'ere', { pp: 'preso' }],
  ['scrivere', 'schreiben', 'reg', 'ere', { pp: 'scritto' }],
  ['leggere', 'lesen', 'reg', 'ere', { pp: 'letto' }],
  ['chiedere', 'fragen', 'reg', 'ere', { pp: 'chiesto' }],
  ['mettere', 'stellen, legen', 'reg', 'ere', { pp: 'messo' }],
  ['rispondere', 'antworten', 'reg', 'ere', { pp: 'risposto' }],
  ['vedere', 'sehen', 'reg', 'ere', { pp: 'visto', fut: 'vedr' }],
  ['vivere', 'leben', 'reg', 'ere', { pp: 'vissuto', fut: 'vivr' }],
  ['conoscere', 'kennen', 'reg', 'ere', { pp: 'conosciuto', pres: ['conosco', 'conosci', 'conosce', 'conosciamo', 'conoscete', 'conoscono'] }],
  ['sentire', 'hören, fühlen', 'reg', 'ire', {}],
  ['dormire', 'schlafen', 'reg', 'ire', {}],
  ['partire', 'abfahren', 'reg', 'ire', { aux: 'essere' }],
  ['aprire', 'öffnen', 'reg', 'ire', { pp: 'aperto' }],
  ['offrire', 'anbieten', 'reg', 'ire', { pp: 'offerto' }],
  ['capire', 'verstehen', 'reg', 'isc', {}],
  ['finire', 'beenden', 'reg', 'isc', {}],
  ['preferire', 'vorziehen', 'reg', 'isc', {}],
  ['pulire', 'putzen', 'reg', 'isc', {}],
  ['essere', 'sein', 'aux', 'ere', {
    aux: 'essere', pp: 'stato', pres: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
    impf: ['ero', 'eri', 'era', 'eravamo', 'eravate', 'erano'], fut: 'sar'
  }],
  ['avere', 'haben', 'aux', 'ere', {
    pp: 'avuto', pres: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno'], fut: 'avr'
  }],
  ['potere', 'können', 'aux', 'ere', {
    pp: 'potuto', pres: ['posso', 'puoi', 'può', 'possiamo', 'potete', 'possono'], fut: 'potr'
  }],
  ['volere', 'wollen', 'aux', 'ere', {
    pp: 'voluto', pres: ['voglio', 'vuoi', 'vuole', 'vogliamo', 'volete', 'vogliono'], fut: 'vorr'
  }],
  ['dovere', 'müssen', 'aux', 'ere', {
    pp: 'dovuto', pres: ['devo', 'devi', 'deve', 'dobbiamo', 'dovete', 'devono'], fut: 'dovr'
  }],
  ['sapere', 'wissen, können', 'aux', 'ere', {
    pp: 'saputo', pres: ['so', 'sai', 'sa', 'sappiamo', 'sapete', 'sanno'], fut: 'sapr'
  }],
  ['andare', 'gehen, fahren', 'irr', 'are', {
    aux: 'essere', pres: ['vado', 'vai', 'va', 'andiamo', 'andate', 'vanno'], fut: 'andr'
  }],
  ['venire', 'kommen', 'irr', 'ire', {
    aux: 'essere', pp: 'venuto', pres: ['vengo', 'vieni', 'viene', 'veniamo', 'venite', 'vengono'], fut: 'verr'
  }],
  ['fare', 'machen, tun', 'irr', 'are', {
    pp: 'fatto', pres: ['faccio', 'fai', 'fa', 'facciamo', 'fate', 'fanno'], impf: 'facev', fut: 'far'
  }],
  ['dare', 'geben', 'irr', 'are', {
    pp: 'dato', pres: ['do', 'dai', 'dà', 'diamo', 'date', 'danno'], fut: 'dar'
  }],
  ['stare', 'sein, bleiben, sich befinden', 'irr', 'are', {
    aux: 'essere', pres: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'], fut: 'star'
  }],
  ['dire', 'sagen', 'irr', 'ire', {
    pp: 'detto', pres: ['dico', 'dici', 'dice', 'diciamo', 'dite', 'dicono'], impf: 'dicev', fut: 'dir'
  }],
  ['uscire', 'ausgehen, hinausgehen', 'irr', 'ire', {
    aux: 'essere', pres: ['esco', 'esci', 'esce', 'usciamo', 'uscite', 'escono']
  }],
  ['bere', 'trinken', 'irr', 'ere', {
    pp: 'bevuto', pres: ['bevo', 'bevi', 'beve', 'beviamo', 'bevete', 'bevono'], impf: 'bevev', fut: 'berr'
  }],
  ['scegliere', 'wählen', 'irr', 'ere', {
    pp: 'scelto', pres: ['scelgo', 'scegli', 'sceglie', 'scegliamo', 'scegliete', 'scelgono']
  }],
  ['tenere', 'halten', 'irr', 'ere', {
    pp: 'tenuto', pres: ['tengo', 'tieni', 'tiene', 'teniamo', 'tenete', 'tengono'], fut: 'terr'
  }],
  ['rimanere', 'bleiben', 'irr', 'ere', {
    aux: 'essere', pp: 'rimasto', pres: ['rimango', 'rimani', 'rimane', 'rimaniamo', 'rimanete', 'rimangono'], fut: 'rimarr'
  }],
  ['salire', 'hinaufgehen, einsteigen', 'irr', 'ire', {
    aux: 'essere', pres: ['salgo', 'sali', 'sale', 'saliamo', 'salite', 'salgono']
  }],
  ['piacere', 'gefallen', 'irr', 'ere', {
    aux: 'essere', pp: 'piaciuto', pres: ['piaccio', 'piaci', 'piace', 'piacciamo', 'piacete', 'piacciono']
  }],
  ['togliere', 'entfernen, ausziehen', 'irr', 'ere', {
    pp: 'tolto', pres: ['tolgo', 'togli', 'toglie', 'togliamo', 'togliete', 'tolgono']
  }],
  ['raccogliere', 'sammeln, aufheben', 'irr', 'ere', {
    pp: 'raccolto', pres: ['raccolgo', 'raccogli', 'raccoglie', 'raccogliamo', 'raccogliete', 'raccolgono']
  }],
  ['cadere', 'fallen', 'irr', 'ere', {
    aux: 'essere', pp: 'caduto', fut: 'cadr'
  }],
  ['valere', 'gelten, wert sein', 'irr', 'ere', {
    aux: 'essere', pp: 'valso', pres: ['valgo', 'vali', 'vale', 'valiamo', 'valete', 'valgono'], fut: 'varr'
  }],
  ['porre', 'legen, stellen', 'irr', 'ere', {
    pp: 'posto', pres: ['pongo', 'poni', 'pone', 'poniamo', 'ponete', 'pongono'], impf: 'ponev', fut: 'porr'
  }],
  ['chiamarsi', 'heißen', 'refl', 'are', {}],
  ['alzarsi', 'aufstehen', 'refl', 'are', {}],
  ['lavarsi', 'sich waschen', 'refl', 'are', {}],
  ['svegliarsi', 'aufwachen', 'refl', 'are', {}],
  ['vestirsi', 'sich anziehen', 'refl', 'ire', {}],
  ['divertirsi', 'sich amüsieren', 'refl', 'ire', {}],
  ['sentirsi', 'sich fühlen', 'refl', 'ire', {}],
  ['mettersi', 'sich (etw.) anziehen, sich setzen', 'refl', 'ere', { pp: 'messo' }]
];
const VB_REFL = ['mi', 'ti', 'si', 'ci', 'vi', 'si'];
const VB_ENDINGS = {
  are: ['o', 'i', 'a', 'iamo', 'ate', 'ano'],
  ere: ['o', 'i', 'e', 'iamo', 'ete', 'ono'],
  ire: ['o', 'i', 'e', 'iamo', 'ite', 'ono'],
  isc: ['isco', 'isci', 'isce', 'iamo', 'ite', 'iscono']
};
const VB_AUX = {
  essere: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
  avere: ['ho', 'hai', 'ha', 'abbiamo', 'avete', 'hanno']
};

/* Verbliste mit fertigen Formen: { inf, de, group, tenses: { pres: [[Varianten] × 6], ... } } */
function vbBuild([inf, de, group, cls, o]) {
  const refl = inf.endsWith('si');
  const base = refl ? inf.slice(0, -2) + 'e' : inf;
  let stem = base.slice(0, -3);
  const ends = VB_ENDINGS[cls];
  const join = (s, e) => (s.endsWith('i') && e.startsWith('i') ? s + e.slice(1) : s + e);
  // -care/-gare: h vor e/i
  const hard = /[cg]$/.test(stem) && cls === 'are';
  const pres = o.pres || ends.map((e, i) => (hard && /^[ie]/.test(e) ? stem + 'h' + e : join(stem, e)));
  const impfStem = typeof o.impf === 'string' ? o.impf : stem + (cls === 'are' ? 'av' : cls === 'ere' ? 'ev' : 'iv');
  const impf = Array.isArray(o.impf) ? o.impf : ['o', 'i', 'a', 'amo', 'ate', 'ano'].map((e, i) => impfStem + (i < 3 ? ['o', 'i', 'a'][i] : ['amo', 'ate', 'ano'][i - 3]));
  let fs = o.fut;
  if (!fs) {
    if (cls === 'are') fs = (hard ? stem + 'h' : /[cg]i$/.test(stem) ? stem.slice(0, -1) : /i$/.test(stem) && !o.keepI ? stem.slice(0, -1) : stem) + 'er';
    else fs = stem + (cls === 'ere' ? 'er' : 'ir');
    if (cls === 'are' && /[cg]$/.test(stem) && !hard) fs = stem + 'er';
  }
  const fut = ['ò', 'ai', 'à', 'emo', 'ete', 'anno'].map(e => fs + e);
  const cond = ['ei', 'esti', 'ebbe', 'emmo', 'este', 'ebbero'].map(e => fs + e);
  const aux = o.aux || 'avere';
  const pp = o.pp || stem + (cls === 'are' ? 'ato' : cls === 'ere' ? 'uto' : 'ito');
  const ppForms = person => {
    if (aux !== 'essere' && !refl) return [pp];
    const m = pp.replace(/o$/, '');
    return person < 3 ? [m + 'o', m + 'a'] : [m + 'i', m + 'e'];
  };
  const ppT = VB_PERSONS.map((_, i) => {
    const a = refl ? VB_AUX.essere[i] : VB_AUX[aux][i];
    const forms = ppForms(i).map(p => a + ' ' + p);
    return forms;
  });
  const tenses = {
    pres: pres.map(x => [x]),
    pp: ppT,
    impf: impf.map(x => [x]),
    fut: fut.map(x => [x]),
    cond: cond.map(x => [x])
  };
  if (refl) {
    Object.keys(tenses).forEach(k => {
      tenses[k] = tenses[k].map((forms, i) => forms.map(f => VB_REFL[i] + ' ' + f));
    });
  }
  return { inf, de, group, tenses, aux: refl ? 'essere' : aux };
}
const VB_VERBS = VB_DATA.map(vbBuild);
const VB_STATE = { group: 'reg', tense: 'pres', verb: 'parlare', mode: 'table', quiz: null, checked: false };
const vbNorm = x => String(x).normalize('NFC').toLocaleLowerCase().replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim().replace(/[.!?,;]+$/, '');
const vbPlain = x => vbNorm(x).normalize('NFD').replace(/[̀-ͯ]/g, '');
function vbJudge(forms, raw) {
  const v = vbNorm(raw);
  if (!v) return 'empty';
  if (forms.some(f => vbNorm(f) === v)) return 'ok';
  if (forms.some(f => vbPlain(f) === vbPlain(v))) return 'accent';
  return 'wrong';
}
const vbList = () => VB_VERBS.filter(v => VB_STATE.group === 'all' || v.group === VB_STATE.group);
const vbCurrent = () => VB_VERBS.find(v => v.inf === VB_STATE.verb) || VB_VERBS[0];
function vbCtrl() {
  const g = VB_GROUPS.map(([k, l]) => `<button type="button" class="vb-chip ${VB_STATE.group === k ? 'on' : ''}" data-vb="group" data-v="${k}">${l}</button>`).join('');
  const t = VB_TENSES.map(([k, l]) => `<button type="button" class="vb-chip ${VB_STATE.tense === k ? 'on' : ''}" data-vb="tense" data-v="${k}">${l}</button>`).join('');
  const v = vbList().map(x => `<button type="button" class="vb-verb ${VB_STATE.verb === x.inf ? 'on' : ''}" data-vb="verb" data-v="${x.inf}">${x.inf}</button>`).join('');
  return `<section class="vb-ctrl glass"><div class="vb-row"><span class="vb-label">Gruppe</span><div class="vb-chips">${g}</div></div><div class="vb-row"><span class="vb-label">Zeit</span><div class="vb-chips">${t}</div></div><div class="vb-row"><span class="vb-label">Verb</span><div class="vb-chips vb-verbs">${v}</div></div></section>`;
}
function vbTable() {
  const v = vbCurrent(),
    forms = v.tenses[VB_STATE.tense];
  const rows = VB_PERSONS.map((p, i) => {
    const st = VB_STATE.checked ? vbJudge(forms[i], VB_STATE.answers[i] || '') : '';
    const msg = !VB_STATE.checked ? '' : st === 'ok' ? 'Richtig' : st === 'accent' ? 'Fast: Prüfe den Akzent. ' + forms[i][0] : 'Lösung: ' + forms[i].join(' / ');
    return `<tr class="vb-r ${st}"><th scope="row">${p}</th><td><input class="vb-in" data-vb-in="${i}" autocomplete="off" autocapitalize="none" spellcheck="false" lang="it" value="${esc(VB_STATE.answers[i] || '')}" ${VB_STATE.checked ? 'readonly' : ''} aria-label="${p}"></td><td class="vb-fb" role="status">${esc(msg)}</td></tr>`;
  }).join('');
  const ok = VB_STATE.checked ? VB_PERSONS.filter((_, i) => vbJudge(forms[i], VB_STATE.answers[i] || '') === 'ok').length : 0;
  return `<section class="vb-card glass"><div class="vb-head"><div><div class="eyebrow">${VB_TENSES.find(t => t[0] === VB_STATE.tense)[1]}</div><h2 lang="it">${v.inf}</h2><p class="muted">${v.de}${v.aux === 'essere' && VB_STATE.tense === 'pp' ? ' · mit essere' : VB_STATE.tense === 'pp' ? ' · mit avere' : ''}</p></div><button type="button" class="speak-btn" data-vb="speak" aria-label="Aussprache anhören">🔊</button></div>
  <form id="vb-form" novalidate><table class="vb-table"><tbody>${rows}</tbody></table>
  <div class="vb-actions">${VB_STATE.checked ? `<div class="vb-score" role="status"><b>${ok} von 6</b> richtig</div><button type="button" class="button primary" data-vb="next">Nächstes Verb</button><button type="button" class="button secondary" data-vb="again">Noch einmal</button>` : '<button class="button primary" type="submit">Formen prüfen</button><button type="button" class="button secondary" data-vb="reveal">Lösung zeigen</button>'}</div></form></section>`;
}
function vbQuiz() {
  const q = VB_STATE.quiz;
  if (!q || q.done) {
    const r = q ? `<p class="vb-final"><b>${q.good} von ${q.total}</b> richtig</p>` : '';
    return `<section class="vb-card glass vb-quiz"><div class="eyebrow">Blitzrunde</div><h2>Zehn Formen, ein Ziel.</h2><p class="muted">Du bekommst Verb, Person und Zeit aus deiner Auswahl und tippst die passende Form.</p>${r}<button type="button" class="button primary large" data-vb="quiz-start">${q ? 'Neue Runde' : 'Runde starten'}</button></section>`;
  }
  const c = q.items[q.i];
  const st = q.checked ? q.res : '';
  return `<section class="vb-card glass vb-quiz"><div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${(100 * q.i) / q.total}%"></div></div><div class="eyebrow">${VB_TENSES.find(t => t[0] === c.tense)[1]} · ${q.i + 1} / ${q.total}</div><h2 lang="it">${c.verb.inf}</h2><p class="muted">${c.verb.de}</p><div class="vb-person">${VB_PERSONS[c.p]}</div><form id="vb-qform" novalidate><input class="vb-in vb-big" id="vb-q" autocomplete="off" autocapitalize="none" spellcheck="false" lang="it" value="${esc(q.answer || '')}" ${q.checked ? 'readonly' : ''} aria-label="Form"><div class="vb-actions">${q.checked ? `<div class="vb-fb ${st}" role="status">${st === 'ok' ? 'Richtig' : st === 'accent' ? 'Fast: Prüfe den Akzent. ' + c.forms[0] : 'Lösung: ' + c.forms.join(' / ')}</div><button type="button" class="button primary" data-vb="quiz-next">${q.i + 1 === q.total ? 'Ergebnis' : 'Weiter'}</button>` : '<button class="button primary" type="submit">Prüfen</button>'}</div></form></section>`;
}
function verbsPage() {
  VB_STATE.answers = VB_STATE.answers || [];
  if (!vbList().some(v => v.inf === VB_STATE.verb)) VB_STATE.verb = vbList()[0].inf;
  $('main').innerHTML = `<div class="page vb-page"><header class="page-head"><div class="eyebrow">VERBEN</div><h1>Verbi.</h1><p>Wähle Gruppe, Zeit und Verb. Dann tippst du die Formen. Die Zeiten folgen den Verbtabellen im Anhang von Ecco più.</p></header>
  ${vbCtrl()}
  <div class="ws-seg vb-mode" role="tablist"><button role="tab" aria-selected="${VB_STATE.mode === 'table'}" data-vb="mode" data-v="table">Tabelle</button><button role="tab" aria-selected="${VB_STATE.mode === 'quiz'}" data-vb="mode" data-v="quiz">Blitzrunde</button></div>
  ${VB_STATE.mode === 'table' ? vbTable() : vbQuiz()}</div>`;
  if (!VB_STATE.checked && VB_STATE.mode === 'table') document.querySelector('[data-vb-in="0"]')?.focus({ preventScroll: true });
  if (VB_STATE.mode === 'quiz' && VB_STATE.quiz && !VB_STATE.quiz.done && !VB_STATE.quiz.checked) document.getElementById('vb-q')?.focus({ preventScroll: true });
}
function vbQuizStart() {
  const pool = vbList(),
    items = [];
  for (let i = 0; i < 10; i++) {
    const verb = pool[Math.floor(Math.random() * pool.length)],
      p = Math.floor(Math.random() * 6),
      tense = VB_STATE.tense;
    items.push({ verb, p, tense, forms: verb.tenses[tense][p] });
  }
  VB_STATE.quiz = { items, i: 0, good: 0, total: items.length, checked: false, answer: '', done: false };
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-vb]');
  if (!b || !document.querySelector('.vb-page')) return;
  const a = b.dataset.vb,
    v = b.dataset.v;
  const redraw = () => {
    VB_STATE.answers = [];
    VB_STATE.checked = false;
    verbsPage();
  };
  if (a === 'group') { VB_STATE.group = v; VB_STATE.verb = vbList()[0].inf; return redraw(); }
  if (a === 'tense') { VB_STATE.tense = v; VB_STATE.quiz = null; return redraw(); }
  if (a === 'verb') { VB_STATE.verb = v; return redraw(); }
  if (a === 'mode') { VB_STATE.mode = v; return redraw(); }
  if (a === 'speak') {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(VB_STATE.verb.replace(/si$/, 'si'));
    u.lang = 'it-IT'; u.rate = 0.9; speechSynthesis.speak(u);
    return;
  }
  if (a === 'again') return redraw();
  if (a === 'next') {
    const l = vbList(), i = l.findIndex(x => x.inf === VB_STATE.verb);
    VB_STATE.verb = l[(i + 1) % l.length].inf;
    return redraw();
  }
  if (a === 'reveal') {
    VB_STATE.answers = vbCurrent().tenses[VB_STATE.tense].map(f => f[0]);
    VB_STATE.checked = true;
    return verbsPage();
  }
  if (a === 'quiz-start') { vbQuizStart(); return verbsPage(); }
  if (a === 'quiz-next') {
    const q = VB_STATE.quiz;
    q.i++; q.checked = false; q.answer = '';
    if (q.i >= q.total) q.done = true;
    return verbsPage();
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches?.('[data-vb-in]')) VB_STATE.answers[Number(t.dataset.vbIn)] = t.value;
  if (t.id === 'vb-q' && VB_STATE.quiz) VB_STATE.quiz.answer = t.value;
});
document.addEventListener('submit', e => {
  if (e.target.id === 'vb-form') {
    e.preventDefault();
    document.querySelectorAll('[data-vb-in]').forEach(i => (VB_STATE.answers[Number(i.dataset.vbIn)] = i.value));
    VB_STATE.checked = true;
    verbsPage();
  }
  if (e.target.id === 'vb-qform') {
    e.preventDefault();
    const q = VB_STATE.quiz, c = q.items[q.i];
    q.answer = document.getElementById('vb-q').value;
    q.res = vbJudge(c.forms, q.answer);
    if (q.res === 'empty') return;
    if (q.res === 'ok') q.good++;
    q.checked = true;
    verbsPage();
  }
});
if (typeof module !== 'undefined') module.exports = { VB_VERBS, vbJudge };
