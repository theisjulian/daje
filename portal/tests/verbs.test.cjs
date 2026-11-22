const assert = require('node:assert/strict');
global.document = { addEventListener() {} };
global.localStorage = { getItem: () => null, setItem() {} };
const { VB_VERBS, VB_SENT, VB_STATE, vbJudge, vbOptions, vbItems, vbGenderForms, vbAuxOk } = require('../dist/verbs.js');
const g = n => VB_VERBS.find(v => v.inf === n).tenses;
assert.equal(g('parlare').fut[0][0], 'parlerò');
assert.equal(g('cercare').pres[1][0], 'cerchi');
assert.equal(g('mangiare').cond[2][0], 'mangerebbe');
assert.equal(g('studiare').fut[3][0], 'studieremo');
assert.equal(g('andare').pp[0][0], 'sono andato');
assert.equal(g('fare').impf[3][0], 'facevamo');
assert.equal(g('chiamarsi').pres[0][0], 'mi chiamo');
assert.equal(vbJudge(['è'], 'e'), 'accent');
assert.equal(vbJudge(['sono andato', 'sono andata'], 'Sono andata'), 'ok');
assert.equal(vbJudge(['parlo'], ''), 'empty');
// Neue Zeiten (Lernjahr 2 und 3)
assert.equal(g('andare').cong[0][0], 'vada');
assert.equal(g('cercare').cong[5][0], 'cerchino');
assert.equal(g('finire').cong[5][0], 'finiscano');
assert.deepEqual(g('dovere').cong[0], ['debba', 'deva']);
assert.equal(g('morire').cong[0][0], 'muoia');
assert.equal(g('fare').congi[3][0], 'facessimo');
assert.equal(g('essere').congi[2][0], 'fosse');
assert.equal(g('produrre').congi[0][0], 'producessi');
assert.equal(g('prendere').imp[1][0], 'prenda');
assert.deepEqual(g('andare').imp[0], ["va'", 'vai']);
assert.equal(g('alzarsi').imp[3][0], 'alzatevi');
assert.equal(g('fare').ger[1][0], 'stai facendo');
assert.equal(g('lavarsi').ger[0][0], 'mi sto lavando');
assert.equal(g('mangiare').trap[0][0], 'avevo mangiato');
assert.equal(g('partire').congp[2][1], 'sia partita');
assert.equal(g('sapere').congt[0][0], 'avessi saputo');
assert.equal(g('arrivare').condp[2][0], 'sarebbe arrivato');
assert.equal(g('impiegare').pres[1][0], 'impieghi');
assert.ok(!g('potere').imp, 'kein Imperativ bei Modalverben');
// Gestaffelt: Band und Sätze
assert.equal(VB_VERBS.find(v => v.inf === 'proporre').band, 3);
assert.equal(VB_VERBS.find(v => v.inf === 'scegliere').band, 2);
VB_SENT.forEach(([b, t, inf, p, text]) => {
  const v = VB_VERBS.find(x => x.inf === inf);
  assert.ok(v && v.tenses[t] && v.tenses[t][p], 'Satz ohne Form: ' + text);
  assert.ok(text.includes('___'), 'Satz ohne Lücke: ' + text);
  assert.ok(v.band <= b, 'Verb erst später: ' + text);
});
// Weitere Verben und Futur der Verben auf -iare
assert.equal(g('svegliarsi').fut[0][0], 'mi sveglierò');
assert.equal(g('annoiarsi').fut[3][0], 'ci annoieremo');
assert.equal(g('viaggiare').fut[0][0], 'viaggerò');
assert.equal(g('lasciare').pres[1][0], 'lasci');
assert.equal(g('spiegare').pres[3][0], 'spieghiamo');
assert.equal(g('spegnere').pres[5][0], 'spengono');
assert.equal(g('sedersi').pres[0][0], 'mi siedo');
assert.equal(g('sedersi').imp[0][0], 'siediti');
assert.equal(g('trasferirsi').pres[0][0], 'mi trasferisco');
assert.equal(g('scendere').pp[2][1], 'è scesa');
assert.equal(g('tradurre').fut[0][0], 'tradurrò');
assert.equal(VB_VERBS.find(v => v.inf === 'vincere').band, 2);
assert.ok(VB_VERBS.filter(v => v.band === 1).length >= 80, 'Primo anno: viele Verben');
// Geschlecht des Subjekts: Giulia è scesa, Anna è andata, Laura sia partita – nur die passende Form zählt
const vb = n => VB_VERBS.find(v => v.inf === n);
const sent = part => VB_SENT.find(s => s[4].includes(part));
const sentForms = s => vbGenderForms(vb(s[2]), vb(s[2]).tenses[s[1]][s[3]], s[5]);
assert.deepEqual(sentForms(sent('Giulia ___ dall')), ['è scesa']);
assert.deepEqual(sentForms(sent('Anna ___ al cinema')), ['è andata']);
assert.deepEqual(sentForms(sent('Laura ___ ieri')), ['sia partita']);
assert.deepEqual(sentForms(sent('Luca ___ a casa')), ['è tornato']);
assert.deepEqual(sentForms(sent('ieri sera, Luca')), ['ti sei addormentato']);
assert.deepEqual(sentForms(sent('I miei genitori ___ per Roma')), ['sono partiti']);
assert.deepEqual(sentForms(sent('Stamattina (io) ___ tardi')), ['mi sono svegliato', 'mi sono svegliata'], 'offenes Geschlecht: beide Formen');
assert.deepEqual(sentForms(sent('A che ora ___ (voi) a scuola')), ['siete arrivati', 'siete arrivate']);
const COMPOUND = ['pp', 'trap', 'congp', 'congt', 'condp'];
const FEM = /^(Giulia|Anna|Laura|Sara|Mia nonna|La |Le |Ieri le ragazze)\b|\b(Giulia|Anna|Laura|Sara) ___/;
VB_SENT.forEach(s => {
  const [, t, inf, p, text, g] = s;
  assert.ok(g === undefined || g === 'm' || g === 'f', 'Geschlecht nur m oder f: ' + text);
  const all = vb(inf).tenses[t][p];
  const gendered = COMPOUND.includes(t) && all.some(f => vb(inf).fg[f]);
  if (g) assert.ok(gendered, 'Geschlechtsangabe ohne veränderliches Partizip: ' + text);
  // weibliches Subjekt vor der Lücke: Der Satz muss gekennzeichnet sein und nur feminine Formen zulassen
  if (gendered && FEM.test(text)) {
    assert.equal(g, 'f', 'weibliches Subjekt ohne Kennzeichen: ' + text);
    assert.ok(sentForms(s).every(f => vb(inf).fg[f] !== 'm'), 'maskuline Form bei weiblichem Subjekt: ' + text);
  }
  assert.ok(sentForms(s).length >= 1, 'keine Form übrig: ' + text);
});
// Welche Form?: richtige Möglichkeit im passenden Geschlecht; die andere Form ist nie falscher Ablenker
VB_STATE.band = 3;
VB_STATE.tense = 'mix';
for (let round = 0; round < 60; round++) {
  vbItems('choice').forEach(c => {
    const opts = vbOptions(c);
    const all = c.verb.tenses[c.tense][c.p];
    assert.equal(opts.filter(o => c.forms.includes(o)).length, 1, 'genau eine richtige Möglichkeit: ' + c.text + ' ' + opts.join(', '));
    assert.equal(opts.filter(o => all.includes(o)).length, 1, 'andere Form derselben Person als Ablenker: ' + c.text + ' ' + opts.join(', '));
    if (c.g === 'f') assert.ok(opts.every(o => c.verb.fg[o] !== 'm'), 'maskuline Möglichkeit bei weiblichem Subjekt: ' + c.text + ' ' + opts.join(', '));
    if (c.text.includes('Giulia ___ dall')) assert.ok(opts.includes('è scesa') && !opts.includes('è sceso'));
  });
  vbItems('sent').forEach(c => {
    if (c.text.includes('Anna ___ al cinema')) {
      assert.equal(vbJudge(c.forms, 'è andata'), 'ok');
      assert.equal(vbJudge(c.forms, 'è andato'), 'wrong');
    }
  });
}
// Zwei Hilfsverben: vivere, appartenere; servire mit avere
assert.ok(vbAuxOk(vb('vivere'), 'avere') && vbAuxOk(vb('vivere'), 'essere'));
assert.ok(vbAuxOk(vb('appartenere'), 'avere') && vbAuxOk(vb('appartenere'), 'essere'));
assert.ok(vbAuxOk(vb('parlare'), 'avere') && !vbAuxOk(vb('parlare'), 'essere'));
assert.ok(vbAuxOk(vb('andare'), 'essere') && !vbAuxOk(vb('andare'), 'avere'));
assert.deepEqual(g('vivere').pp[2], ['ha vissuto', 'è vissuto', 'è vissuta']);
assert.deepEqual(g('appartenere').pp[5], ['sono appartenuti', 'sono appartenute', 'hanno appartenuto']);
assert.deepEqual(vbGenderForms(vb('vivere'), g('vivere').pp[2], 'f'), ['ha vissuto', 'è vissuta']);
assert.equal(vb('servire').aux, 'avere');
assert.equal(vb('servire').de, 'servieren, bedienen');
// Nebenformen: perso / perduto, mi siederò, debbo / debbono
assert.deepEqual(g('perdere').pp[0], ['ho perso', 'ho perduto']);
assert.deepEqual(vb('perdere').pps, ['perso', 'perduto']);
assert.equal(vbJudge(g('perdere').trap[3], 'avevamo perduto'), 'ok');
assert.deepEqual(g('sedersi').fut[0], ['mi sederò', 'mi siederò']);
assert.deepEqual(g('sedersi').cond[0], ['mi sederei', 'mi siederei']);
assert.deepEqual(g('dovere').pres[0], ['devo', 'debbo']);
assert.deepEqual(g('dovere').pres[5], ['devono', 'debbono']);
assert.deepEqual(g('dovere').pres[1], ['devi']);
assert.equal(g('dovere').cond[0][0], 'dovrei');
// chiamarsi: weder Imperativ noch stare + Gerundio
assert.ok(!g('chiamarsi').imp && !g('chiamarsi').ger, 'chiamarsi ohne Imperativ und Gerundio');
assert.equal(g('chiamarsi').pp[0][1], 'mi sono chiamata');
assert.ok(g('alzarsi').imp && g('alzarsi').ger);
// Imperativ-Kurzformen: va’ / vai, Apostroph gerade oder typografisch
[['andare', 'va', 'vai'], ['fare', 'fa', 'fai'], ['stare', 'sta', 'stai'], ['dare', 'da', 'dai']].forEach(([inf, short, long]) => {
  const f = g(inf).imp[0];
  assert.equal(vbJudge(f, long), 'ok', long);
  assert.equal(vbJudge(f, short + "'"), 'ok', short + "'");
  assert.equal(vbJudge(f, short + '’'), 'ok', short + '’');
});
assert.equal(vbJudge(g('dire').imp[0], 'di’'), 'ok');
assert.ok(VB_SENT.some(s => s[4].includes('lo Stato')) && !VB_SENT.some(s => s[4].includes('lo stato')));
// Jede Form bleibt eine nicht leere Liste von Zeichenketten
VB_VERBS.forEach(v => Object.entries(v.tenses).forEach(([t, rows]) => rows.forEach(f => assert.ok(Array.isArray(f) && f.length && f.every(x => typeof x === 'string' && x && !/undefined/.test(x)), v.inf + ' ' + t))));
console.log('Verben passed.');
