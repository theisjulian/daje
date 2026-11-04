const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { validatePackage, assessAnswer } = require('../dist/content-contract.js');
const C = require('../dist/cils.js');

let n = 0;
const id = () => 'cils-test-' + ++n;
const L4 = ['A', 'B', 'C', 'D'];
const mc = (k = 4, i = 0) => ({ domanda: 'Marco chiama Giulia ' + i, opzioni: ['per invitarla.', 'per un libro.', 'per un appuntamento.', 'per un viaggio.'].slice(0, k), giusta: L4[i % k] });
const transcript = 'Marco: Ciao Giulia, senti, domani non posso venire alle cinque. Possiamo vederci alle sei?\nGiulia: Va bene, alle sei davanti alla biblioteca.';
const aff = (n, on) => Array.from({ length: n }, (_, i) => ({ testo: 'Affermazione numero ' + (i + 1) + '.', presente: i < on }));
const fill = k => Array.from({ length: k }, (_, i) => `Frase ${i + 1} con [[parola${i + 1}]].`).join(' ');
const choiceText = (k, o) => Array.from({ length: k }, (_, i) => `Frase ${i + 1} [[${['giusta', 'sbagliata', 'altra', 'quarta'].slice(0, o).map(w => w + i).join('|')}]].`).join(' ');

// Beispielantwort der KI für Typ und Niveau, genau mit den Zahlen aus dem Heft
function sample(t, level) {
  const c = t.spec(level);
  switch (t.id) {
    case 'asc-scelta':
    case 'let-scelta':
      return { titolo: 'Un’estate da volontari', testo: 'Primo paragrafo.\n\nSecondo paragrafo.', domande: Array.from({ length: c.frasi }, (_, i) => mc(c.opzioni, i)) };
    case 'asc-info':
    case 'let-info':
      return { titolo: 'Il bando', testo: 'Testo lungo.', affermazioni: aff(c.affermazioni, c.presenti || 6) };
    case 'asc-completa':
    case 'str-articoli':
    case 'str-aggettivi':
    case 'str-verbi':
    case 'str-pronomi':
    case 'str-parola':
      return { testo: fill(c.lacune), esempio: '(essere) è' };
    case 'asc-brevi':
    case 'let-brevi':
      return { testi: [1, 2, 3, 4].map(i => ({ numero: i, titolo: 'Avviso ' + i, testo: 'Testo breve ' + i + '.', opzioni: ['x' + i, 'y' + i, 'z' + i], giusta: L4[i % 3] })) };
    case 'let-ricostruisci':
      return { titolo: 'Il viaggio', parti: Array.from({ length: c.parti }, (_, i) => 'Parte numero ' + (i + 1) + ' del racconto.') };
    case 'let-abbina':
      return { inizi: [{ titolo: 'Festa', testo: 'Sabato facciamo una festa.', fine: 'E' }, { titolo: 'Gita', testo: 'Lunedì andiamo al mare.', fine: 'A' }, { titolo: 'Sport', testo: 'Corso di nuoto.', fine: 'C' }, { titolo: 'Libri', testo: 'Scambio di libri.', fine: 'H' }], fini: { A: 'Porta il costume!', B: 'b', C: 'Iscriviti in piscina.', D: 'd', E: 'Porta qualcosa da mangiare!', F: 'f', G: 'g', H: 'Porta un libro.' } };
    case 'str-scelta':
      return { testo: choiceText(c.lacune, c.opzioni) };
    case 'str-situazioni':
      return { espressioni: Array.from({ length: 10 }, (_, i) => ({ espressione: 'Mi scusi, potrebbe ripetere? ' + i, opzioni: ['Studente e professore.', 'Due amici.', 'Un cliente.', 'Una madre.'], giusta: L4[i % 4] })) };
    case 'str-trasforma':
      return { frasi: Array.from({ length: 6 }, (_, i) => ({ frase: 'Il comune ha chiuso la piscina ' + i + '.', inizio: 'La piscina', soluzioni: ['La piscina è stata chiusa dal comune ' + i + '.'] })) };
    case 'scr-testo':
    case 'scr-lettera':
      return { compiti: [{ consegna: 'Racconta una gita.', modello: 'Testo modello.', criteri: ['ordine cronologico'] }, { consegna: 'Scrivi un’e-mail.', modello: 'Gentile direttrice, …' }] };
    case 'ora-dialogo':
      return { situazioni: Array.from({ length: c.situazioni }, (_, i) => ({ situazione: 'Sei in un negozio ' + i + '.', spunti: ['Buongiorno, vorrei …'] })) };
    case 'ora-monologo':
      return { argomenti: Array.from({ length: c.argomenti }, (_, i) => ({ argomento: 'I social network ' + i, spunti: ['Quanto tempo passi sui social?'] })) };
  }
}
const make = (type, level, x, extra = {}) => C.build({ livello: level, tipo: type, esercizi: [x || sample(C.typeById(type), level)], ...extra }, { level, type, id, set: 's', media: { source: 'speech', transcript } });

// Jeder Typ hat Kommandodatei; jedes Paket besteht die Prüfung; die erste Aufgabe trägt die Heft-Anweisung
for (const t of C.TYPES) {
  assert.ok(fs.existsSync(path.join(__dirname, '../dist/imports/cils', t.id + '.md')), 'Kommandodatei fehlt: ' + t.id);
  for (const level of t.levels) {
    const r = make(t.id, level, null, { noteDocente: ['Hinweis'] });
    assert.equal(r.items.length, 1);
    const pkg = r.items[0].pkg;
    const v = validatePackage(pkg);
    assert.ok(v.ok, t.id + ' ' + level + ': ' + JSON.stringify(v.errors));
    assert.equal(pkg.kind, t.media ? 'listening' : 'grammar');
    const consegna = t.consegna(level, null, t.spec(level).parti, t.spec(level));
    assert.ok(pkg.questions[0].prompt.startsWith(consegna), t.id + ' ' + level + ': Anweisung fehlt');
    assert.ok(Number(String(t.spec(level).prova)[0]) >= 1, 'Prova-Nummer');
  }
}

// Katalog nach den Heften A1–C2
const ids = l => C.typesFor(l).map(t => t.id);
assert.deepEqual(ids('A1').filter(i => i.startsWith('str')), ['str-articoli', 'str-verbi', 'str-scelta']);
assert.deepEqual(ids('A2').filter(i => i.startsWith('str')), ['str-aggettivi', 'str-verbi', 'str-scelta']);
assert.deepEqual(ids('B1').filter(i => i.startsWith('str')), ['str-articoli', 'str-verbi', 'str-scelta', 'str-situazioni']);
assert.deepEqual(ids('B2').filter(i => i.startsWith('str')), ['str-pronomi', 'str-verbi', 'str-scelta', 'str-situazioni']);
assert.deepEqual(ids('C1').filter(i => i.startsWith('str')), ['str-parola', 'str-verbi', 'str-scelta', 'str-trasforma']);
assert.ok(!C.typeById('str-registro'));
assert.ok(!ids('B2').includes('asc-completa') && ids('B1').includes('asc-completa'));
assert.equal(C.typeById('asc-completa').spec('A2').lacune, 14);
assert.equal(C.typeById('asc-completa').spec('B1').lacune, 28);
assert.equal(C.typeById('str-scelta').spec('A1').lacune, 8);
assert.equal(C.typeById('str-scelta').spec('C2').lacune, 15);
assert.equal(C.typeById('let-ricostruisci').spec('C1').parti, 16);
assert.equal(C.typeById('scr-testo').spec('C1').parole, '160–180');
assert.equal(C.typeById('scr-lettera').spec('C1').parole, '100–120');
assert.match(C.typeById('scr-testo').consegna('C1', null, 0, C.typeById('scr-testo').spec('C1')), /Devi scrivere da 160 a 180 parole\.$/);
assert.equal(C.typeById('str-verbi').consegna('A1'), 'Completa il testo con le forme al presente indicativo dei verbi che sono tra parentesi.');
assert.equal(C.typeById('asc-info').consegna('B2'), 'Ascolta il testo. Poi leggi le informazioni. Indica se le informazioni sono vere o false.');

// Informazioni presenti: B1/B2 vero/falso; C1/C2 die 6 bzw. 7 aus A–O
const info = make('let-info', 'B1').items[0].pkg.questions;
assert.equal(info.length, 14);
assert.equal(info[0].type, 'true_false');
assert.ok(assessAnswer(info[0], 'true') && !assessAnswer(info[13], 'true'));
const c1 = make('let-info', 'C1', { testo: 'x', affermazioni: aff(15, 7) }).items[0].pkg.questions;
assert.equal(c1.length, 1);
assert.equal(c1[0].type, 'multiple_choice');
assert.equal(c1[0].options.length, 15);
assert.equal(c1[0].options[14].text.slice(0, 2), 'O.');
assert.equal(c1[0].correctOptionIds.length, 7);
assert.throws(() => make('let-info', 'C1', { testo: 'x', affermazioni: aff(15, 6) }), /Genau 7/);
assert.throws(() => make('asc-info', 'C2', { affermazioni: aff(12, 6) }), /genau 15/);

// Ricostruzione: A = 1, die übrigen Buchstaben gemischt; neben jeden Buchstaben die Positionsnummer
const ric = make('let-ricostruisci', 'B2').items[0].pkg;
const q = ric.questions[0];
assert.equal(q.gaps.length, 10);
assert.ok(ric.reading.text.startsWith('A. Parte numero 1 '));
assert.ok(q.text.startsWith('A = 1 · B = [[b]]'));
const blocks = Object.fromEntries(ric.reading.text.split('\n\n').map(b => [b[0], b]));
q.gaps.forEach(g => assert.ok(blocks[g.id.toUpperCase()].includes('numero ' + g.acceptedAnswers[0] + ' '), 'Nummer passt zum Teil'));
assert.notDeepEqual(q.gaps.map(g => g.acceptedAnswers[0]), ['2', '3', '4', '5', '6', '7', '8', '9', '10', '11']);
assert.throws(() => make('let-ricostruisci', 'C1', { parti: ['a', 'b', 'c'] }), /genau 16/);

// Lücken: Anzahl genau wie im Heft, Beispiel (0) in der Anweisung
assert.throws(() => make('str-verbi', 'B1', { testo: fill(12) }), /verlangt sind 20/);
// Kleine Abweichung (±10 %) wird angenommen und gemeldet
const tol = make('str-verbi', 'B1', { testo: fill(19) });
assert.equal(tol.items[0].pkg.questions[0].gaps.length, 19);
assert.ok(tol.warnings.some(w => /19 statt 20/.test(w)));
assert.throws(() => make('str-verbi', 'B1', { testo: fill(17) }), /18 bis 22/);
assert.equal(make('str-verbi', 'B1').warnings.length, 0);
// Titel: Prüfung · Teil und Prova · Typ · Thema; Teilname als „titolo“ wird übergangen
const named = C.build({ tema: 'Lo sport', esercizi: [{ ...sample(C.typeById('str-verbi'), 'C1'), titolo: 'Analisi delle strutture di comunicazione' }] }, { level: 'C1', type: 'str-verbi', id }).items[0].pkg;
assert.equal(named.title, 'CILS TRE-C1 · Strutture 2 · Verbi · Lo sport');
const ex = make('str-verbi', 'A2').items[0].pkg.questions[0];
assert.ok(ex.prompt.includes('Esempio: (0) (essere) è'));
assert.throws(() => make('str-scelta', 'A1', { testo: choiceText(8, 4) }), /genau 3 Möglichkeiten/);
assert.throws(() => C.build({ esercizi: [{ testo: 'a [[uno|uno|due]] b' }] }, { level: 'B1', type: 'str-scelta', id }), /doppelt/);

// Riscrivi: Satzanfang vorgegeben, mit oder ohne Anfang richtig
const tr = make('str-trasforma', 'C1').items[0].pkg.questions[1];
assert.ok(tr.prompt.includes('→ LA PISCINA …'));
assert.ok(assessAnswer(tr, 'è stata chiusa dal comune 1.') && assessAnswer(tr, 'La piscina è stata chiusa dal comune 1.'));

// Schreiben: zwei Themen zur Wahl, Anweisung mit Wortzahl
const w = make('scr-testo', 'C1').items[0].pkg.questions;
assert.equal(w.length, 2);
assert.ok(w[0].prompt.startsWith('Puoi scegliere di trattare uno dei seguenti argomenti. Devi scrivere da 160 a 180 parole.'));

// Hören: Medium aus Angaben der Lehrkraft, Transkript bleibt erhalten
const yt = C.build({ esercizi: [sample(C.typeById('asc-scelta'), 'B1')] }, { level: 'B1', type: 'asc-scelta', id, media: { source: 'youtube', url: 'https://youtu.be/dQw4w9WgXcQ?t=42', transcript } }).items[0].pkg;
assert.deepEqual(yt.media, { type: 'youtube', videoId: 'dQw4w9WgXcQ', start: 42 });
assert.equal(yt.transcript, transcript);
assert.ok(validatePackage(yt).ok);
assert.throws(() => C.build({ esercizi: [{}] }, { level: 'A1', type: 'asc-scelta', id, media: { source: 'speech', transcript: 'kurz' } }), /Transkript/);
assert.throws(() => C.build({ esercizi: [{}] }, { level: 'A1', type: 'asc-scelta', id, media: { source: 'youtube', url: 'https://example.org', transcript } }), /YouTube/);

// Echter Ausgangstext: Quelle wird als externe Quelle mit ungeprüften Rechten gespeichert
const web = make('let-scelta', 'B1', null, { fonte: { titolo: 'Il ritorno dei treni notturni', testata: 'Esempio Magazine', data: '2026-03-01', url: 'https://example.org/treni' } });
const src = web.items[0].pkg.sources[1];
assert.equal(src.kind, 'external');
assert.equal(src.rights, 'needs_review');
assert.ok(src.citation.includes('Esempio Magazine') && src.url === 'https://example.org/treni');
assert.ok(validatePackage(web.items[0].pkg).ok);
assert.ok(web.fonte);

// Niveau und Typ müssen zusammenpassen; Abbruch und falscher Typ werden gemeldet
assert.throws(() => C.build({ esercizi: [{}] }, { level: 'B2', type: 'str-articoli', id }), /nicht auf Niveau/);
assert.throws(() => C.build({ abbruch: 'zu kurz' }, { level: 'A1', type: 'let-scelta', id }), /abgebrochen/);
assert.throws(() => C.build({ tipo: 'let-info', esercizi: [{}] }, { level: 'B1', type: 'let-scelta', id }), /gehört zum Typ/);

// Auftrag: Grundregeln, Typdatei, Vorgaben, Heft-Anweisung; Thema ohne Wunsch zufällig, nicht immer Schule
const p = C.promptFor('# Grundregeln', '# Typ', { level: 'B2', type: 'str-verbi', count: 2, theme: 'sport', audience: 'adulti', textSource: 'frei' });
assert.ok(p.includes('CILS DUE-B2') && p.includes('congiuntivo') && p.includes('Anzahl Übungen in „esercizi“: 2') && p.includes('Thema: sport') && p.includes('Erwachsene') && p.includes('Prova n. 2'));
const themes = new Set([0, 0.2, 0.4, 0.6, 0.8, 0.99].map(r => C.promptFor('', '', { level: 'B1', type: 'let-scelta', random: r }).match(/- Thema: ([^(\n]+)/)[1].trim()));
assert.ok(themes.size >= 5, 'Themen wechseln');
assert.ok(C.promptFor('', '', { level: 'B1', type: 'let-scelta' }).includes('Suche im Internet'));
const pe = C.promptFor('', '', { level: 'B1', type: 'let-scelta', textSource: 'eigen', sourceText: 'Il mio testo.', sourceUrl: 'https://example.org' });
assert.ok(pe.includes('Il mio testo.') && pe.includes('Quelle: https://example.org'));
const pa = C.promptFor('# Grundregeln', '# Typ', { level: 'A2', type: 'asc-completa', media: { transcript } });
assert.ok(pa.includes('lacune: 14') && pa.includes('Giulia: Va bene') && !pa.includes('- Thema:'));
console.log('CILS passed.');
