const fs = require('node:fs'),
  assert = require('node:assert/strict');
const KI = require('../dist/ki.js');
const { validatePackage } = require('../dist/content-contract.js');

// Chat-Antwort mit Begleittext, Codeblock und abschließenden Kommas wird gelesen.
const ai = KI.extractJSON(fs.readFileSync(__dirname + '/fixtures/ki-antwort.txt', 'utf8'));
assert.equal(ai.questions.length, 5);
assert.throws(() => KI.extractJSON('Leider kann ich das Video nicht ansehen.'), /kein JSON/);

const transcript = '[00:01] Buongiorno! Vorrei un cappuccino e un cornetto, per favore.\n[00:06] Ecco a lei. Pago in contanti, ecco cinque euro. Grazie, arrivederci.';
const r = KI.buildPackage(ai, { language: 'it', level: 'A2', mediaUrl: 'https://youtu.be/dK9KAT5BDBM?t=3', transcript }, validatePackage);
assert.equal(r.result.ok, true, JSON.stringify(r.result.errors));
assert.equal(r.pkg.media.videoId, 'dK9KAT5BDBM');
assert.equal(r.pkg.vocabulary[0].id, 'w1');
assert.deepEqual(
  r.evidence.map(e => e.status),
  ['vorab', 'ok', 'ok', 'ok', 'fehlt'],
  JSON.stringify(r.evidence)
);
assert.match(r.warnings.join(' '), /Aufgabe 5/);
// Leicht abweichendes Zitat (Satzzeichen, Groß/klein, Apostroph) zählt als gefunden.
assert.equal(KI.evidenceStatus('vorrei un Cappuccino, e un cornetto', transcript), 'ok');
assert.equal(KI.evidenceStatus('vorrei un cappuccino e un cornetto per piacere', transcript), 'fast');
// Abbruch der KI wird verständlich gemeldet.
assert.throws(() => KI.buildPackage({ abbruch: 'Kein Transkript' }, { mediaUrl: 'https://youtu.be/dK9KAT5BDBM' }), /abgebrochen/);
// Der Chat-Auftrag enthält Kommandodatei, Eingaben und Transkript.
const cmd = fs.readFileSync(__dirname + '/../dist/imports/KI-Kommandodatei.md', 'utf8');
const prompt = KI.promptFor(cmd, { language: 'it', level: 'A2', mediaUrl: 'https://youtu.be/x', transcript });
assert.match(prompt, /## Eingaben[\s\S]*Zielniveau: A2[\s\S]*Vorrei un cappuccino/);
console.log('KI-Import: Antwort lesen, Paket ergänzen, Belege prüfen passed.');

// Wortschatz aus einem Text: Grundform, Doppelungen, Fundstellen im Text, Paket gültig
{
  const text = 'Negli ultimi anni le librerie hanno preso piede in città, in ogni quartiere del centro.';
  const ai = KI.extractJSON(fs.readFileSync(__dirname + '/fixtures/ki-wortschatz.txt', 'utf8'));
  const r = KI.buildVocabulary(ai, { language: 'it', level: 'B2', mode: 'text', text, collection: 'Oberstufe', section: 'Lettura 3', grade: 11 }, validatePackage);
  assert.ok(r.result.ok, JSON.stringify(r.result.errors));
  const v = r.result.value;
  assert.equal(v.entries.length, 4, 'Doppelung zusammengefasst');
  assert.deepEqual(v.entries[2].translations, ['das Viertel', 'der Stadtteil']);
  assert.equal(v.entries[1].grammar.gender, 'feminine');
  assert.deepEqual(r.evidence.map(e => e.status), ['ok', 'ok', 'ok', 'fehlt']);
  assert.equal(v.catalog.grade, 11);
  assert.equal(v.collection, 'Oberstufe');
  assert.ok(!('evidence' in v.entries[0]));
  // Buchseiten: Lehrwerk und Seiten in Quelle und Katalog, Nutzung im Unterricht erlaubt
  const b = KI.buildVocabulary(ai, { language: 'it', level: 'A2', mode: 'buch', collection: 'Corso daje 2', section: 'Unità 3 · 3a', pages: '170-171' }, validatePackage);
  assert.ok(b.result.ok, JSON.stringify(b.result.errors));
  assert.equal(b.result.value.sources[0].rights, 'cleared');
  assert.equal(b.result.value.catalog.textbook.pages, '170-171');
  assert.equal(b.evidence.length, 0);
  // Lehrwerk wie im Grundstock (Reihe + Band), dritte Spalte, Schrägstrich-Formen, Sprechform nur zum Eintrag
  const e3 = KI.buildVocabulary(
    { entries: [
      { target: "l'intellettuale", translations: ['der/die Intellektuelle'], partOfSpeech: 'noun', example: 'Molti intellettuali scrivono.', definition: 'Una persona che pensa e scrive.', say: "l'intellettuale, il collega, la collega", synonyms: 'il pensatore', antonyms: '', family: "l'intelletto", related: 'E intellectual; F intellectuel' },
      { target: 'lo spettatore', translations: ['der/die Zuschauer/in'], say: '' },
      { target: 'grazie a qc', translations: ['dank etw.'], say: 'grazie a qualcosa' }
    ] },
    { language: 'it', level: 'B1', mode: 'buch', collection: 'Corso 3 daje', unit: 'Unità 1', pages: '166-170', publisher: 'Verlag X' },
    validatePackage
  );
  assert.ok(e3.result.ok, JSON.stringify(e3.result.errors));
  const v3 = e3.result.value;
  assert.deepEqual(v3.catalog.textbook, { publisher: 'Verlag X', series: 'Corso daje', volume: '3', unit: 'Unità 1', pages: '166-170' });
  assert.equal(v3.title, 'Corso daje 3 · Unità 1');
  assert.deepEqual(v3.entries[0].translations, ['der/die Intellektuelle']);
  assert.deepEqual(v3.entries[1].translations, ['der/die Zuschauer/in']);
  assert.ok(!('say' in v3.entries[0]), 'kopiertes Muster entfernt');
  assert.equal(v3.entries[2].say, 'grazie a qualcosa');
  assert.equal(v3.entries[0].synonyms, 'il pensatore');
  assert.equal(v3.entries[0].family, "l'intelletto");
  assert.equal(v3.entries[0].related, 'E intellectual; F intellectuel');
  const cmd = fs.readFileSync(__dirname + '/../dist/imports/KI-Wortschatz.md', 'utf8');
  const pt = KI.promptForVocab(cmd, { language: 'it', level: 'B2', mode: 'text', text, count: 20 });
  assert.match(pt, /### Text\n\nNegli ultimi anni/);
  assert.match(KI.promptForVocab(cmd, { language: 'it', level: 'A2', mode: 'buch', pages: '34' }), /Fotos sind angehängt[\s\S]*Seiten: 34/);
  assert.throws(() => KI.buildVocabulary({ abbruch: 'Keine Fotos' }, { mode: 'buch' }), /abgebrochen/);
  // Sprechform „say“ wird übernommen und bleibt im gültigen Paket erhalten.
  const sv = KI.buildVocabulary({ title: 'T', entries: [{ target: 'bello/-a', translations: ['schön'], say: 'bello, bella' }] }, { language: 'it', level: 'A1', mode: 'buch', collection: 'X' }, validatePackage);
  assert.equal(sv.result.value.entries[0].say, 'bello, bella');
  console.log('KI Wortschatz passed.');
}

// Grammatik: eine Antwort → mehrere Übungen zu einem Thema; „genau“ bleibt privat (origin original).
{
  const ai = {
    topic: { title: 'Der bestimmte Artikel', rule: '| | m | f\n| Sg. | il | la' },
    exercises: [
      { title: 'il oder la?', difficulty: 'leicht', questions: [{ type: 'gap_choice', prompt: 'Scegli.', text: '[[g1]] ragazzo\n[[g2]] ragazza', gaps: [{ id: 'g1', options: ['il', 'la'], answer: 'il' }, { id: 'g2', options: ['il', 'la'], answer: 'la' }], evidence: 'x' }] },
      { title: 'Ergänze', difficulty: 'mega', questions: [{ id: 'q1', type: 'gap_fill', prompt: 'Completa.', text: '[[g1]] amico', gaps: [{ id: 'g1', acceptedAnswers: ["l'"] }] }] }
    ],
    reviewNotes: ['Übung 5 weggelassen']
  };
  let n = 0;
  const inp = { language: 'it', level: 'A1', mode: 'eigen', series: 'Corso daje', volume: '1', publisher: 'Verlag X', unit: 'Unità 1', pages: '20', grade: '8', id: () => 'eigen-test-' + ++n };
  const r = KI.buildGrammar(ai, inp, validatePackage);
  assert.equal(r.pkgs.length, 2);
  assert.ok(r.pkgs.every(p => p.result.ok), JSON.stringify(r.warnings));
  const [a, b] = r.pkgs.map(p => p.result.value);
  assert.equal(a.kind, 'grammar');
  assert.equal(a.grammar.topic, b.grammar.topic);
  assert.equal(a.grammar.origin, 'adapted');
  assert.equal(a.grammar.rule.split('\n').length, 2);
  assert.ok(!b.grammar.rule, 'Merkkasten nur einmal je Thema');
  assert.equal(b.grammar.difficulty, 'mittel', 'unbekannte Stufe → mittel');
  assert.ok(!('evidence' in a.questions[0]));
  assert.equal(a.catalog.textbook.unit, 'Unità 1');
  assert.equal(a.catalog.grade, 8);
  const g = KI.buildGrammar(ai, { ...inp, mode: 'genau', topicId: 'ecco1-artikel-sg' }, validatePackage).pkgs[0].result.value;
  assert.equal(g.grammar.origin, 'original');
  assert.equal(g.grammar.topic, 'ecco1-artikel-sg');
  assert.match(g.sources[0].citation, /unverändert/);
  assert.equal(KI.buildGrammar(ai, { ...inp, mode: 'thema', series: '' }).pkgs[0].pkg.grammar.origin, 'own');
  assert.throws(() => KI.buildGrammar({ exercises: [] }, inp), /keine Übungen/);
  assert.throws(() => KI.buildGrammar({ abbruch: 'unscharf' }, inp), /abgebrochen/);
  const cmd = fs.readFileSync(__dirname + '/../dist/imports/KI-Grammatik.md', 'utf8');
  const pt = KI.promptForGrammar(cmd, { ...inp, mode: 'genau', levels: ['leicht'] });
  assert.match(pt, /Modus: GENAU/);
  assert.doesNotMatch(pt, /- Stufen:/);
  assert.doesNotMatch(pt, /\n\n- Seiten/);
  assert.match(KI.promptForGrammar(cmd, { ...inp, levels: ['leicht', 'schwer'], perLevel: '3' }), /Stufen: leicht, schwer · je Stufe 3/);
  // Lückentext aus einem Text: Auftrag enthält Art und Text; fremder Text bleibt privat, eigener nicht.
  const text = 'Ieri il governo ha approvato la nuova legge sulla scuola. '.repeat(8);
  const tp = KI.promptForGrammar(cmd, { ...inp, mode: 'text', cloze: 'phaen', phaen: 'verbi', bank: 'nein', sourceText: text, sourceName: 'Il Fatto Quotidiano' });
  assert.match(tp, /Modus: TEXT/);
  assert.match(tp, /SCHWERPUNKT .*Grundform steht in Klammern/);
  assert.match(tp, /## Text\n\nIeri il governo/);
  assert.doesNotMatch(tp, /Stufen:/);
  assert.match(KI.promptForGrammar(cmd, { ...inp, mode: 'text', cloze: 'nth', nth: '7', sourceText: text }), /JEDES 7\. WORT/);
  assert.match(KI.promptForGrammar(cmd, { ...inp, mode: 'text', cloze: 'ctest', sourceText: text }), /C-TEST/);
  const tf = KI.buildGrammar(ai, { ...inp, mode: 'text', textRights: 'fremd', sourceName: 'Il Fatto Quotidiano' }).pkgs[0].pkg;
  assert.equal(tf.grammar.origin, 'original');
  assert.match(tf.sources[0].citation, /Il Fatto Quotidiano.*nicht zur Veröffentlichung/);
  assert.equal(KI.buildGrammar(ai, { ...inp, mode: 'text', textRights: 'eigen' }).pkgs[0].pkg.grammar.origin, 'own');
  console.log('KI Grammatik passed.');
}
