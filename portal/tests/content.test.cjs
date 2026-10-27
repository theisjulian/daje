const fs = require('node:fs'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const dir = fs.existsSync('dist/content-contract.js') ? 'dist' : 'docs';
const { validatePackage, assessAnswer } = require('../' + dir + '/content-contract.js');
const sample = JSON.parse(fs.readFileSync(dir + '/examples/listening-example.json', 'utf8'));
const vocab = JSON.parse(fs.readFileSync(dir + '/examples/vocabulary-example.json', 'utf8'));
assert.equal(validatePackage(sample).ok, true);
assert.equal(validatePackage(vocab).ok, true);
const c = {};
vm.createContext(c);
vm.runInContext(
  fs.readFileSync(dir + '/listening-data.js', 'utf8') + ';this.seeds=LISTENING_SEEDS;',
  c
);
for (const x of c.seeds) assert.equal(validatePackage(JSON.parse(JSON.stringify(x))).ok, true);
// Erweiterte Aufgaben: zusammengeführte Pakete müssen gültig sein.
const ex = {};
vm.createContext(ex);
vm.runInContext(fs.readFileSync(dir + '/listening-extra.js', 'utf8') + ';this.e=LISTENING_EXTRA;', ex);
for (const [id, e] of Object.entries(ex.e)) {
  const f = '../inhalte/' + id + '.json';
  if (!fs.existsSync(f)) continue;
  const base = JSON.parse(fs.readFileSync(f, 'utf8'));
  base.questions = [...e.pre, ...base.questions, ...e.post];
  base.teacherNotes = e.teacherNotes;
  const r = validatePackage(JSON.parse(JSON.stringify(base)));
  assert.equal(r.ok, true, id + ': ' + JSON.stringify(r.errors || r));
  assert.ok(base.questions.length >= 10 && base.questions.length <= 26, id + ' Aufgabenzahl');
  assert.equal(new Set(base.questions.map(q => q.id)).size, base.questions.length, id + ' doppelte IDs');
}
for (const change of [
  x => (x.schemaVersion = '2'),
  x => (x.id = 'constructor'),
  x => (x.id = 'too_long'.repeat(15)),
  x => (x.questions[0].correctOptionId = 'missing'),
  x => (x.questions[0].options[1].id = 'a'),
  x => (x.questions[1].id = x.questions[0].id),
  x => (x.media = { type: 'audio', url: 'javascript:alert(1)' }),
  x => (x.media = { type: 'audio', url: 'https://user:secret@example.com/a.mp3' }),
  x => (x.media = { type: 'youtube', videoId: '../../script' }),
  x => (x.questions[0].type = 'essay'),
  x => (x.language = 'de'),
  x => (x.sources = [])
]) {
  const x = structuredClone(sample);
  change(x);
  const old = JSON.stringify(x);
  assert.equal(validatePackage(x).ok, false);
  assert.equal(JSON.stringify(x), old, 'Validation must not mutate the input');
}
const x = structuredClone(vocab);
x.entries[1].id = x.entries[0].id;
assert.equal(validatePackage(x).ok, false);
assert.equal(assessAnswer(sample.questions[0], 'b'), true);
assert.equal(assessAnswer(sample.questions[1], 'false'), true);
assert.equal(assessAnswer(sample.questions[2], '  Alle sei! '), true);
assert.equal(assessAnswer(sample.questions[2], 'alle sette'), false);
const clean = validatePackage({ ...sample, published: true, role: 'admin' }).value;
assert.equal(clean.published, undefined);
assert.equal(clean.role, undefined);
console.log(
  'Import contracts, invalid references, duplicate IDs, unsafe media, field stripping and correction passed.'
);
const withWords = JSON.parse(
  fs.readFileSync(dir + '/examples/listening-with-vocabulary.json', 'utf8')
);
const linked = validatePackage(withWords);
assert.equal(linked.ok, true);
assert.equal(linked.value.vocabulary.length, 6);
assert.equal(linked.value.vocabulary[0].target, 'incontrare');
const oldSchema = structuredClone(withWords);
oldSchema.schemaVersion = '1.0';
assert.equal(validatePackage(oldSchema).ok, false);
const duplicateWord = structuredClone(withWords);
duplicateWord.vocabulary[1].id = duplicateWord.vocabulary[0].id;
assert.equal(validatePackage(duplicateWord).ok, false);
const invalidTranslation = structuredClone(withWords);
invalidTranslation.vocabulary[0].translations = [];
assert.equal(validatePackage(invalidTranslation).ok, false);
const excessiveWords = structuredClone(withWords);
excessiveWords.vocabulary = Array.from({ length: 61 }, (_, i) => ({
  ...withWords.vocabulary[0],
  id: 'word-' + i
}));
assert.equal(validatePackage(excessiveWords).ok, false);
console.log(
  'Schema 1.1 imports linked vocabulary atomically and rejects duplicates, empty translations, legacy mixed payloads and excess entries.'
);
const origin = structuredClone(withWords);
origin.transcriptOrigin = 'auto';
assert.equal(validatePackage(origin).value.transcriptOrigin, 'auto');
origin.transcriptOrigin = 'gemini';
assert.equal(validatePackage(origin).ok, false);
console.log('Optional transcriptOrigin is validated and kept.');
{
  const base = structuredClone(withWords);
  base.questions = [
    {
      id: 'm1',
      type: 'multiple_choice',
      prompt: 'Was kauft Luca?',
      explanation: 'x',
      options: [
        { id: 'a', text: 'Eis' },
        { id: 'b', text: 'Brot' },
        { id: 'c', text: 'Wasser' }
      ],
      correctOptionIds: ['a', 'c']
    },
    {
      id: 'z1',
      type: 'matching',
      prompt: 'Wer sagt was?',
      explanation: 'x',
      pairs: [
        { id: 'p1', left: 'Sofia', right: 'Ich bin müde.' },
        { id: 'p2', left: 'Luca', right: 'Ich habe Hunger.' }
      ],
      distractors: ['Ich gehe.']
    },
    {
      id: 'o1',
      type: 'ordering',
      prompt: 'Bringe in die richtige Reihenfolge.',
      explanation: 'x',
      items: [
        { id: 'i1', text: 'erst' },
        { id: 'i2', text: 'dann' },
        { id: 'i3', text: 'zuletzt' }
      ]
    },
    {
      id: 'g1',
      type: 'gap_fill',
      prompt: 'Ergänze.',
      explanation: 'x',
      text: 'Ci vediamo alle [[g1]] in [[g2]].',
      gaps: [
        { id: 'g1', acceptedAnswers: ['quattro'] },
        { id: 'g2', acceptedAnswers: ['Piazza Castello'] }
      ]
    }
  ];
  const r = validatePackage(base);
  assert.equal(r.ok, true, JSON.stringify(r.errors));
  const [m, z, o, g] = r.value.questions;
  assert.equal(assessAnswer(m, 'c,a'), true);
  assert.equal(assessAnswer(m, 'a'), false);
  assert.equal(assessAnswer(z, JSON.stringify({ p1: 'p1', p2: 'p2' })), true);
  assert.equal(assessAnswer(z, JSON.stringify({ p1: 'p2', p2: 'p1' })), false);
  assert.equal(assessAnswer(o, JSON.stringify({ i1: '1', i2: '2', i3: '3' })), true);
  assert.equal(assessAnswer(o, JSON.stringify({ i1: '2', i2: '1', i3: '3' })), false);
  assert.equal(assessAnswer(g, JSON.stringify({ g1: 'Quattro', g2: 'piazza castello' })), true);
  assert.equal(assessAnswer(g, 'kaputt'), false);
  for (const change of [
    x => (x.questions[0].correctOptionIds = ['a', 'b', 'c']),
    x => (x.questions[0].correctOptionIds = ['zz']),
    x => (x.questions[1].pairs[1].id = 'p1'),
    x => x.questions[2].items.pop(),
    x => (x.questions[3].text = 'Ci vediamo [[g1]].'),
    x => (x.coverImage = 'https://evil.example/x.jpg')
  ]) {
    const bad = structuredClone(base);
    change(bad);
    assert.equal(validatePackage(bad).ok, false);
  }
  const withCover = structuredClone(base);
  withCover.coverImage = 'assets/covers/it-demo.jpg';
  assert.equal(validatePackage(withCover).value.coverImage, 'assets/covers/it-demo.jpg');
  const vw = structuredClone(vocab);
  vw.entries[0].ipa = 'ˈtʃaːo';
  vw.entries[0].audio = 'assets/audio/ciao.mp3';
  vw.entries[0].image = 'assets/words/ciao.jpg';
  assert.equal(validatePackage(vw).ok, true);
  vw.entries[0].audio = 'https://evil.example/a.mp3';
  assert.equal(validatePackage(vw).ok, false);
  const embedded = structuredClone(base);
  embedded.coverImage = 'data:image/jpeg;base64,/9j/4AAQ';
  embedded.coverQuery = 'italian market';
  assert.equal(validatePackage(embedded).ok, true);
  embedded.coverImage = 'data:text/html;base64,AAAA';
  assert.equal(validatePackage(embedded).ok, false);
  console.log(
    'New task types (multiple choice, matching, ordering, gap fill) and coverImage are validated and graded.'
  );
}

// Weitere Aufgabentypen: Beispielpaket gültig, jede Lösung wird als richtig erkannt, Fehlerfälle abgewiesen
{
  const C = require('../dist/content-contract.js');
  const j = require('../dist/examples/listening-weitere-aufgabentypen.json');
  const v = C.validatePackage(j);
  if (!v.ok) throw new Error(v.errors.join('; '));
  const ans = { n1: 'true', n2: 'not_given', n3: 'a,c,d,f,h', n4: JSON.stringify({ g1: 'quattro', g2: 'limone' }), n5: JSON.stringify({ g1: 'castello', g2: '4', g3: 'parco' }), n6: JSON.stringify({ t1: 'Limone', t2: 'alle sei', t3: 'cioccolato' }), n7: JSON.stringify({ e1: 'Torino', e2: 'a piedi', e3: '6' }), n8: JSON.stringify({ s1: 'luca', s2: 'sofia', s3: 'luca', s4: 'sofia' }), n9: JSON.stringify({ c1: 'cibo', c2: 'luogo', c3: 'cibo', c4: 'luogo', c5: 'luogo' }), n10: 'Vado al cinema.', n11: JSON.stringify({ g1: 'Torino', g2: 'Castello', g3: 'fame', g4: 'gelateria' }), n12: JSON.stringify({ z1: 'in Piazza Castello', z2: 'al parco', z3: 'alle 6' }) };
  for (const q of v.value.questions) {
    if (!C.assessAnswer(q, ans[q.id])) throw new Error(q.id + ' richtig nicht erkannt');
    if (C.assessAnswer(q, '')) throw new Error(q.id + ' leer als richtig gewertet');
  }
  const bad = JSON.parse(JSON.stringify(j));
  bad.questions[3].gaps[0].answer = 'sette';
  bad.questions[5].rows[0].pop();
  bad.questions[6].items[0].category = 'nessuno';
  const r = C.validatePackage(bad);
  if (r.ok || r.errors.length < 3) throw new Error('Fehlerhafte neue Typen nicht abgewiesen: ' + r.errors.join('; '));
  console.log('Weitere Aufgabentypen: Prüfung und Bewertung passed.');
}
