const assert = require('node:assert/strict');
const { speakable } = require('../dist/speech.js');

// Wörterbuch-Schreibweisen werden vor der Sprachausgabe sprechbar gemacht.
const cases = [
  ['è', 'it', 'e'],
  ['bello/-a', 'it', 'bello, bella'],
  ['rosso/-a/-i/-e', 'it', 'rosso, rossa, rossi, rosse'],
  ['l’amico/-a', 'it', 'l’amico, l’amica'],
  ['dottore/-essa', 'it', 'dottore, dottoressa'],
  ['attore/-trice', 'it', 'attore, attrice'],
  ['il/la ragazzo/-a', 'it', 'il, la ragazzo, ragazza'],
  ['costruire (-sc-)', 'it', 'costruire'],
  ['andare (vado)', 'it', 'andare, vado'],
  ['pieno/-a di qs/qn', 'it', 'pieno, piena di qualcosa, qualcuno'],
  ['la vasca (da bagno)', 'it', 'la vasca da bagno'],
  ['Mi scusi, (non) è colpa mia.', 'it', 'Mi scusi, non è colpa mia.'],
  ['Tutto bene?/!', 'it', 'Tutto bene?'],
  ['Come si dice …?', 'it', 'Come si dice?'],
  ['petit/-e', 'fr', 'petit, petite'],
  ['heureux, -euse', 'fr', 'heureux, heureuse'],
  ['y', 'fr', 'i'],
  ['look after sb', 'en', 'look after somebody'],
  ['la città', 'it', 'la città']
];
for (const [input, lang, want] of cases) assert.equal(speakable(input, lang), want, input);
console.log('Sprachausgabe: Schreibweisen sprechbar passed.');
