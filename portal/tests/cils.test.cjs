const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validatePackage, assessAnswer } = require('../dist/content-contract.js');
const C = require('../dist/cils.js');

let n = 0;
const id = () => 'cils-test-' + ++n;
const mc = (k = 4) => ({ domanda: 'Perché Marco chiama Giulia?', opzioni: ['Per invitarla.', 'Per un libro.', 'Per un appuntamento.', 'Per un viaggio.'].slice(0, k), giusta: 'C' });
const transcript = 'Marco: Ciao Giulia, senti, domani non posso venire alle cinque. Possiamo vederci alle sei?\nGiulia: Va bene, alle sei davanti alla biblioteca.';
const aff = (n, on) => Array.from({ length: n }, (_, i) => ({ testo: 'Affermazione numero ' + (i + 1) + '.', presente: i < on }));
const SAMPLE = {
  'asc-scelta': { domande: [mc(3), mc(3)] },
  'asc-info': { affermazioni: aff(10, 5) },
  'asc-completa': { testo: 'Ciao Giulia, domani non posso venire alle [[cinque]]. Vediamoci davanti alla [[biblioteca]].' },
  'asc-brevi': { testi: [{ numero: 1, opzioni: ['a', 'b', 'c'], giusta: 'B' }, { numero: 2, opzioni: ['d', 'e', 'f'], giusta: 'A' }] },
  'let-scelta': { titolo: 'Un’estate da volontari', testo: 'Primo paragrafo.\n\nSecondo paragrafo.', domande: [mc(), mc()] },
  'let-info': { titolo: 'La biblioteca', testo: 'Testo lungo.', affermazioni: aff(12, 6) },
  'let-ricostruisci': { titolo: 'Il viaggio', parti: Array.from({ length: 11 }, (_, i) => 'Parte numero ' + (i + 1) + ' del racconto.') },
  'let-brevi': { testi: [1, 2, 3, 4].map(i => ({ titolo: 'Avviso ' + i, testo: 'Testo breve ' + i + '.', opzioni: ['x' + i, 'y' + i, 'z' + i], giusta: 'A' })) },
  'let-abbina': { inizi: [{ titolo: 'Festa', testo: 'Sabato facciamo una festa.', fine: 'E' }, { titolo: 'Gita', testo: 'Lunedì andiamo al mare.', fine: 'A' }], fini: { A: 'Porta il costume!', B: 'b', C: 'c', D: 'd', E: 'Porta qualcosa da mangiare!', F: 'f' } },
  'str-articoli': { testo: '[[La]] mia scuola è grande. [[Gli]] studenti (di) [[della]] classe. [[L’/L\']]aula è nuova.' },
  'str-aggettivi': { testo: 'Ho due amiche (simpatico) [[simpatiche]] e un cane (vivace) [[vivace]].' },
  'str-verbi': { testo: 'Quando (arrivare) [[sono arrivata/sono arrivato]] a Bologna, non (conoscere) [[conoscevo]] nessuno.' },
  'str-scelta': { testo: 'Sono partito [[nonostante|poiché|finché|dato che]] piovesse e [[sono|ho|era|avevo]] arrivato tardi.' },
  'str-pronomi': { testo: 'Ho letto [[tutta]] la storia. I libri? [[Li]] ho comprati usati. [[Chi]] legge molto impara.' },
  'str-situazioni': { espressioni: [{ espressione: 'Mi scusi, potrebbe ripetere?', opzioni: ['Studente e professore.', 'Due amici.', 'Un cliente.', 'Una madre.'], giusta: 'A' }] },
  'str-trasforma': { frasi: [{ istruzione: 'Volgi al passivo', frase: 'Il comune ha chiuso la piscina.', soluzioni: ['La piscina è stata chiusa dal comune.'] }] },
  'str-registro': { frasi: [{ frase: 'Il direttore ha *messo in evidenza* i risultati.', opzioni: ['sottolineato', 'sottratto', 'sottoscritto', 'sottoposto'], giusta: 'A' }] },
  'scr-testo': { compiti: [{ consegna: 'Racconta una gita.', parole: '100-120', modello: 'Testo modello.', criteri: ['ordine cronologico'] }] },
  'scr-lettera': { compiti: [{ consegna: 'Scrivi un’e-mail.', modello: 'Gentile direttrice, …' }] },
  'ora-dialogo': { situazioni: [{ situazione: 'Sei in un negozio.', spunti: ['Buongiorno, vorrei …'] }] },
  'ora-monologo': { argomenti: [{ argomento: 'I social network', stimolo: 'Una frase.', spunti: ['Quanto tempo passi sui social?'] }] }
};

// Jeder Typ hat Kommandodatei und Beispiel; jedes Paket besteht die Prüfung
for (const t of C.TYPES) {
  assert.ok(fs.existsSync(path.join(__dirname, '../dist/imports/cils', t.id + '.md')), 'Kommandodatei fehlt: ' + t.id);
  assert.ok(SAMPLE[t.id], 'Testbeispiel fehlt: ' + t.id);
  for (const level of t.levels) {
    const r = C.build({ livello: level, tipo: t.id, tema: 'Prova', esercizi: [SAMPLE[t.id]], noteDocente: ['Hinweis'] }, { level, type: t.id, id, set: 's', media: { source: 'speech', transcript } });
    assert.equal(r.items.length, 1);
    const v = validatePackage(r.items[0].pkg);
    assert.ok(v.ok, t.id + ' ' + level + ': ' + JSON.stringify(v.errors));
    assert.equal(r.items[0].pkg.kind, t.media ? 'listening' : 'grammar');
  }
}

// Hören: Medium aus Angaben der Lehrkraft, Transkript bleibt erhalten
const yt = C.build({ esercizi: [SAMPLE['asc-scelta']] }, { level: 'B1', type: 'asc-scelta', id, media: { source: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ?t=42', transcript } }).items[0].pkg;
assert.deepEqual(yt.media, { type: 'youtube', videoId: 'dQw4w9WgXcQ', start: 42 });
assert.equal(yt.transcript, transcript);
assert.equal(yt.transcriptOrigin, 'own');
assert.ok(validatePackage(yt).ok);
const au = C.build({ esercizi: [SAMPLE['asc-info']] }, { level: 'C1', type: 'asc-info', id, media: { source: 'audio', url: 'https://example.org/a.mp3', transcript } }).items[0].pkg;
assert.equal(au.media.type, 'audio');
assert.throws(() => C.build({ esercizi: [SAMPLE['asc-scelta']] }, { level: 'A1', type: 'asc-scelta', id, media: { source: 'speech', transcript: 'kurz' } }), /Transkript/);
assert.throws(() => C.build({ esercizi: [SAMPLE['asc-scelta']] }, { level: 'A1', type: 'asc-scelta', id, media: { source: 'youtube', url: 'https://example.org', transcript } }), /YouTube/);

// Informazioni presenti: wie im Heft je Aussage vero/falso
const info = C.build({ esercizi: [{ testo: 'x', affermazioni: aff(14, 7) }] }, { level: 'B1', type: 'let-info', id }).items[0].pkg.questions;
assert.equal(info.length, 14);
assert.equal(info[0].type, 'true_false');
assert.ok(assessAnswer(info[0], 'true') && !assessAnswer(info[13], 'true'));
assert.throws(() => C.build({ esercizi: [{ affermazioni: aff(6, 6) }] }, { level: 'B1', type: 'let-info', id }), /mindestens eine/);

// Ricostruzione mit 11 Teilen: A ist der Anfang, Buchstaben gemischt, Lesetext ohne Lösungsreihenfolge
const ric = C.build({ esercizi: [SAMPLE['let-ricostruisci']] }, { level: 'B2', type: 'let-ricostruisci', id, set: 'r' }).items[0].pkg;
assert.equal(ric.questions[0].gaps.length, 10);
assert.ok(ric.reading.text.startsWith('A. Parte numero 1 '));
const order = ric.questions[0].gaps.map(g => g.acceptedAnswers[0]);
assert.equal(new Set(order).size, 10);
assert.notDeepEqual(order, ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K']);
const L = Object.fromEntries(ric.reading.text.split('\n\n').map(b => [b[0], b]));
order.forEach((letter, i) => assert.ok(L[letter].includes('numero ' + (i + 2) + ' '), 'Buchstabe passt zur Position'));

// Zahlen nach den Heften UNO-B1 / DUE-B2
assert.equal(C.typeById('asc-completa').spec('B1').lacune, 28);
assert.equal(C.typeById('str-verbi').spec('B2').lacune, 20);
assert.equal(C.typeById('str-scelta').spec('B1').lacune, 15);
assert.equal(C.typeById('str-situazioni').spec('B2').espressioni, 10);
assert.equal(C.typeById('let-scelta').spec('B2').domande, 7);
assert.equal(C.typeById('str-articoli').spec('B1').lacune, 20);
assert.ok(C.HEFT.includes('B2') && !C.HEFT.includes('C1'));

// Auswahl-Lücken: richtige Lösung zuerst, gemischt; doppelte Optionen abgelehnt
const sc = C.build({ esercizi: [SAMPLE['str-scelta'], SAMPLE['str-scelta']] }, { level: 'B2', type: 'str-scelta', id }).items;
assert.equal(sc.length, 2, 'bis zu drei Übungen je Auftrag');
assert.equal(sc[0].pkg.questions[0].gaps[0].answer, 'nonostante');
assert.equal(sc[0].pkg.questions[0].gaps[0].options.length, 4);
assert.throws(() => C.build({ esercizi: [{ testo: 'a [[uno|uno|due]] b' }] }, { level: 'B1', type: 'str-scelta', id }), /doppelt/);

// Ordnen (bis 8 kurze Teile): richtige Reihenfolge wird erkannt
const ord = C.build({ esercizi: [{ parti: ['Prima parte.', 'Poi la seconda.', 'Infine la terza.', 'E la quarta.'] }] }, { level: 'B1', type: 'let-ricostruisci', id }).items[0].pkg.questions[0];
assert.ok(assessAnswer(ord, JSON.stringify({ p1: 1, p2: 2, p3: 3, p4: 4 })));

// Niveau und Typ müssen zusammenpassen; Abbruch und falscher Typ werden gemeldet
assert.throws(() => C.build({ esercizi: [SAMPLE['str-articoli']] }, { level: 'B2', type: 'str-articoli', id }), /nicht auf Niveau/);
assert.throws(() => C.build({ abbruch: 'zu kurz' }, { level: 'A1', type: 'let-scelta', id }), /abgebrochen/);
assert.throws(() => C.build({ tipo: 'let-info', esercizi: [{}] }, { level: 'B1', type: 'let-scelta', id }), /gehört zum Typ/);
assert.equal(C.typesFor('A1').some(t => t.id === 'let-info'), false);
assert.equal(C.typesFor('C2').some(t => t.id === 'str-registro'), true);

// Auftrag: Grundregeln, Typdatei, Vorgaben des Niveaus; Hören mit Transkript statt Thema
const p = C.promptFor('# Grundregeln', '# Typ', { level: 'B2', type: 'str-verbi', count: 2, theme: 'sport', audience: 'adulti' });
assert.ok(p.includes('CILS DUE-B2') && p.includes('congiuntivo') && p.includes('Anzahl Übungen in „esercizi“: 2') && p.includes('sport') && p.includes('Erwachsene'));
const pa = C.promptFor('# Grundregeln', '# Typ', { level: 'A2', type: 'asc-completa', media: { transcript } });
assert.ok(pa.includes('lacune: 14') && pa.includes('Giulia: Va bene') && !pa.includes('Themenwunsch'));
console.log('CILS passed.');
