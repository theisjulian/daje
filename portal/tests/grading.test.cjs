const assert = require('node:assert/strict'),
  fs = require('node:fs');
const dir = fs.existsSync('dist/grading.js') ? 'dist' : 'docs';
const { compare } = require('../' + dir + '/grading.js');
const w = {
  target: 'il gelato',
  language: 'it',
  translations: ['das Eis'],
  grammar: { partOfSpeech: 'noun', gender: 'masculine' },
  answerPolicy: { article: 'required', typo: 'hint' }
};
assert.equal(compare(w, ' IL GELATO! ').status, 'correct');
assert.equal(compare(w, 'gelato').kind, 'article');
assert.equal(compare(w, 'la gelato').kind, 'gender');
assert.equal(compare(w, 'gelata').kind, 'gender');
assert.notEqual(compare(w, 'gelata').status, 'correct');
assert.equal(
  compare({ ...w, answerPolicy: { article: 'optional', typo: 'hint' } }, 'gelato').status,
  'correct'
);
assert.equal(compare(w, 'gelatto').kind, 'typo');
assert.equal(
  compare({ ...w, answerPolicy: { article: 'required', typo: 'strict' } }, 'gelatto').status,
  'wrong'
);
assert.equal(
  compare({ target: 'il papà', language: 'it', translations: ['der Vater'] }, 'il papa').kind,
  'accent'
);
assert.equal(
  compare({ target: 'cosa', language: 'it', translations: ['was'] }, 'casa').status,
  'wrong'
);
assert.equal(compare({ ...w, acceptedAnswers: ['un gelato'] }, 'un gelato').status, 'correct');
assert.equal(compare(w, 'das Eis', true).status, 'correct');
console.log(
  'Article policies, gender hints, accent differences and conservative typo hints passed.'
);

{
  const { hint } = require('../' + dir + '/grading.js');
  const cb = { target: 'Ciao, bella!', language: 'it', translations: ['Hallo Schöne!'] };
  assert.equal(compare(cb, 'ciao bella').status, 'correct');
  assert.equal(compare(cb, 'Ciao, bella').status, 'correct');
  assert.equal(compare(cb, 'ciao bela').kind, 'typo');
  const sg = { target: 'la signora / il signore', language: 'it', translations: ['die Frau;die Dame'] };
  assert.equal(compare(sg, 'la signora').status, 'correct');
  assert.equal(compare(sg, 'il signore').status, 'correct');
  const vw = { target: 'la vasca (da bagno)', language: 'it', translations: ['die (Bade-)Wanne'] };
  assert.equal(compare(vw, 'la vasca').status, 'correct');
  assert.equal(compare(vw, 'die Wanne', true).status, 'correct');
  assert.equal(compare(vw, 'Wanne', true).status, 'correct');
  assert.match(hint(cb, undefined, false, 1), /2 Wörter.*„Ci…“/);
  assert.match(hint(cb, undefined, true, 1), /Beginnt mit „Ha…“/);
}
console.log('Toleranz und Hinweise passed.');
