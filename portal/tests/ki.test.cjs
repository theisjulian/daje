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
  // Buchseiten: Lehrwerk und Seiten in Quelle und Katalog, Rechte offen
  const b = KI.buildVocabulary(ai, { language: 'it', level: 'A2', mode: 'buch', collection: 'Ecco più 2', section: 'Unità 3 · 3a', pages: '170-171' }, validatePackage);
  assert.ok(b.result.ok, JSON.stringify(b.result.errors));
  assert.equal(b.result.value.sources[0].rights, 'needs_review');
  assert.equal(b.result.value.catalog.textbook.pages, '170-171');
  assert.equal(b.evidence.length, 0);
  const cmd = fs.readFileSync(__dirname + '/../dist/imports/KI-Wortschatz.md', 'utf8');
  const pt = KI.promptForVocab(cmd, { language: 'it', level: 'B2', mode: 'text', text, count: 20 });
  assert.match(pt, /### Text\n\nNegli ultimi anni/);
  assert.match(KI.promptForVocab(cmd, { language: 'it', level: 'A2', mode: 'buch', pages: '34' }), /Fotos sind angehängt[\s\S]*Seiten: 34/);
  assert.throws(() => KI.buildVocabulary({ abbruch: 'Keine Fotos' }, { mode: 'buch' }), /abgebrochen/);
  console.log('KI Wortschatz passed.');
}
