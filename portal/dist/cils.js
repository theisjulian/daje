/*
 * CILS-Training: einzelne Aufgabentypen der CILS-Prüfungen A1 bis C2 mit KI erstellen.
 * Ablauf: Lehrkraft wählt Niveau und genau einen Aufgabentyp → Auftrag (imports/cils/KI-CILS.md + Datei des Typs
 * + Vorgaben des Niveaus) kopieren → Antwort der KI einfügen → daje baut daraus Übungen mit Lösungen.
 * Hörverstehen nur mit eigener Aufnahme der Lehrkraft (YouTube, Audiodatei oder Vorlesen des eigenen Transkripts);
 * die KI schreibt dort nur die Aufgaben zum vorhandenen Transkript, nie den Hörtext.
 * Kern (DajeCILS.build, promptFor, TYPES) läuft auch in Node (Tests).
 */
(function (root) {
  'use strict';
  const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const EXAM = { A1: 'CILS A1', A2: 'CILS A2', B1: 'CILS UNO-B1', B2: 'CILS DUE-B2', C1: 'CILS TRE-C1', C2: 'CILS QUATTRO-C2' };
  const PARTS = {
    ascolto: { label: 'Ascolto', de: 'Hörverstehen' },
    lettura: { label: 'Comprensione della lettura', de: 'Leseverstehen' },
    strutture: { label: 'Analisi delle strutture di comunicazione', de: 'Sprachstrukturen' },
    scrittura: { label: 'Produzione scritta', de: 'Schreiben' },
    orale: { label: 'Produzione orale', de: 'Sprechen' }
  };
  const SHORT = { ascolto: 'Ascolto', lettura: 'Lettura', strutture: 'Strutture', scrittura: 'Scrittura', orale: 'Orale' };
  // Alle Angaben nach den Prüfungsheften: A1 Adolescenti (2017), A2 Adolescenti (Prototipo), UNO-B1 Adolescenti (2016),
  // DUE-B2 Adolescenti (2024), TRE-C1 (2023), QUATTRO-C2 (2017) samt Produzione orale. Schreibaufgaben: Heft TRE-C1;
  // für die übrigen Niveaus lagen keine Schreibbögen vor (Richtwerte, in der Oberfläche markiert).
  const HEFT = LEVELS;
  const SCRITTA_HEFT = ['C1'];
  const C = {
    ascT: 'Ascolta il testo.',
    tre: 'Poi completa le frasi. Scegli una delle tre proposte di completamento.',
    quattro: 'Poi completa le frasi. Scegli una delle quattro proposte di completamento.'
  };
  const TEMI = ['viaggi e vacanze', 'sport e benessere', 'musica e concerti', 'cinema e serie TV', 'cucina e alimentazione', 'ambiente e natura', 'animali', 'tecnologia e internet', 'social network', 'volontariato', 'feste e tradizioni italiane', 'arte e musei', 'lavoro e orientamento', 'scienza e scoperte', 'città e quartieri', 'moda', 'lettura e libri', 'scambi e studio all’estero', 'salute', 'trasporti e mobilità', 'teatro', 'fotografia', 'giochi e videogiochi', 'patrimonio culturale italiano'];
  const TEMPI = {
    A1: 'presente indicativo (anche irregolari: essere, avere, andare, fare, volere, potere, dovere, sapere, dire, venire, uscire)',
    A2: 'passato prossimo con essere e avere, accordo del participio, verbi riflessivi; qualche imperfetto e presente',
    B1: 'presente, passato prossimo (anche riflessivi: si sono conosciuti, si è laureata), imperfetto e il loro contrasto in un racconto',
    B2: 'indicativo (passato prossimo, imperfetto, trapassato), condizionale passato (sarebbe diventata), congiuntivo presente (possa), infinito passato (aver sfruttato), alternanza passato prossimo/imperfetto',
    C1: 'tutti i tempi e modi: passato remoto, congiuntivo imperfetto e trapassato, condizionale passato, passivo (fu pubblicato, venne), forme implicite (gerundio, participio, infinito), concordanza dei tempi',
    C2: 'tutti i tempi e modi, anche in registro letterario e forme rare: congiuntivo trapassato, condizionale passato, passivo, forme implicite, periodo ipotetico, concordanza complessa'
  };
  const V = (ids, cfg) => Object.fromEntries(ids.map(l => [l, cfg]));
  const pick = (map, l) => map[l];

  /*
   * Katalog: je Typ und Niveau die Prova im Heft, die Originalanweisung (consegna) und die Anzahlen.
   * Die consegna setzt daje selbst ein; die KI liefert nur Texte und Aufgaben.
   */
  const TYPES = [
    { id: 'asc-completa', part: 'ascolto', media: true, it: 'Completare il testo', de: 'Lückentext zum Gehörten: einzelne, gut hörbare Wörter ergänzen',
      cfg: { A1: { prova: 1, lacune: 10 }, A2: { prova: 1, lacune: 14 }, B1: { prova: 1, lacune: 28 } },
      consegna: () => 'Ascolta il testo. Completa il testo e scrivi le parole che mancano.' },
    { id: 'asc-scelta', part: 'ascolto', media: true, it: 'Completa le frasi (scelta multipla)', de: 'Satzanfänge, je 3 (A1/A2) oder 4 Fortsetzungen zum Gehörten',
      cfg: { A1: { prova: 2, frasi: 4, opzioni: 3 }, A2: { prova: 2, frasi: 4, opzioni: 3 }, B1: { prova: 2, frasi: 7, opzioni: 4 }, B2: { prova: '1 (7 testi brevi, una frase per testo) o 2 (un testo)', frasi: 7, opzioni: 4 }, ...V(['C1', 'C2'], { prova: '1 o 2', frasi: 7, opzioni: 4 }) },
      consegna: (l, x) => (x && x.piuTesti ? 'Ascolta i testi.' : C.ascT) + ' ' + (['A1', 'A2'].includes(l) ? C.tre : C.quattro) },
    { id: 'asc-brevi', part: 'ascolto', media: true, it: 'Testi brevi (una informazione per testo)', de: 'Vier kurze Hörtexte, zu jedem genau eine zutreffende Aussage',
      cfg: V(['A1', 'A2'], { prova: 3, testi: 4, opzioni: 3 }),
      consegna: l => (l === 'A1' ? 'Ascolta i testi. Poi leggi le informazioni. Scegli le informazioni presenti nel testo (una per testo).' : 'Ascolta i testi. Poi leggi le informazioni. Scegli le informazioni presenti nei testi (1 informazione per testo).') },
    { id: 'asc-info', part: 'ascolto', media: true, it: 'Informazioni presenti', de: 'B1/B2: vero oder falso zu 12 Aussagen; C1/C2: die 6 zutreffenden von 15 Aussagen (A–O) wählen',
      cfg: { B1: { prova: 3, affermazioni: 12, formato: 'vero/falso', vere: 'circa la metà' }, B2: { prova: 3, affermazioni: 12, formato: 'vero/falso', vere: 'circa la metà' }, ...V(['C1', 'C2'], { prova: 3, affermazioni: 15, formato: 'scegli le presenti (A–O)', presenti: 6 }) },
      consegna: l => ({ B1: 'Ascolta i testi. Poi leggi le informazioni. Scegli le informazioni presenti nei testi.', B2: 'Ascolta il testo. Poi leggi le informazioni. Indica se le informazioni sono vere o false.', C1: 'Ascolta il testo. Poi leggi le informazioni. Scegli le 6 informazioni (da A a O) presenti nel testo.', C2: 'Ascolta i testi. Poi leggi le informazioni. Scegli le 6 informazioni (da A a O) presenti nei testi.' })[l] },
    { id: 'let-scelta', part: 'lettura', it: 'Testo e completa le frasi', de: 'Lesetext mit Satzanfängen und 3 (A1/A2) bzw. 4 Fortsetzungen',
      cfg: { A1: { prova: 1, parole: '90–130', frasi: 4, opzioni: 3, genere: 'avviso o testo informativo per ragazzi' }, A2: { prova: 1, parole: '150–200', frasi: 4, opzioni: 3, genere: 'intervista breve o testo informativo' }, B1: { prova: 1, parole: '380–420', frasi: 7, opzioni: 4, genere: 'articolo di giornale' }, B2: { prova: 1, parole: '450–500', frasi: 7, opzioni: 4, genere: 'intervista o articolo' }, C1: { prova: 1, parole: '600–700', frasi: 7, opzioni: 4, genere: 'intervista o saggio giornalistico' }, C2: { prova: 1, parole: '800–950', frasi: 7, opzioni: 4, genere: 'articolo di approfondimento o saggio' } },
      consegna: l => (['A1', 'A2'].includes(l) ? 'Leggi il testo. Poi completa le frasi. Scegli una delle tre proposte di completamento.' : ['B1', 'B2'].includes(l) ? 'Completa le frasi. Scegli una delle quattro proposte di completamento.' : 'Completa le seguenti frasi. Scegli una delle quattro proposte di completamento che ti diamo per ogni frase.') },
    { id: 'let-info', part: 'lettura', it: 'Informazioni presenti', de: 'B1/B2: vero oder falso zu 14 Aussagen; C1/C2: die 7 zutreffenden von 15 Aussagen (A–O) wählen',
      cfg: { B1: { prova: 2, parole: '330–380', affermazioni: 14, formato: 'vero/falso', genere: 'presentazione di un festival, concorso o iniziativa' }, B2: { prova: 2, parole: '400–450', affermazioni: 14, formato: 'vero/falso', genere: 'regolamento (articoli numerati)' }, C1: { prova: 2, parole: '650–750', affermazioni: 15, presenti: 7, formato: 'scegli le presenti (A–O)', genere: 'bando o regolamento ufficiale con sezioni' }, C2: { prova: 2, parole: '800–950', affermazioni: 15, presenti: 7, formato: 'scegli le presenti (A–O)', genere: 'bando ufficiale con sezioni ed elenchi' } },
      consegna: l => ({ B1: 'Leggi le seguenti informazioni. Scegli le informazioni presenti nel testo.', B2: 'Leggi le informazioni. Indica se le informazioni sono vere o false.', C1: 'Leggi le informazioni. Scegli le 7 informazioni (da A a O) presenti nel testo che hai letto.', C2: 'Leggi le informazioni. Scegli le 7 informazioni (da A a O) presenti nel testo.' })[l] },
    { id: 'let-ricostruisci', part: 'lettura', it: 'Ricostruzione del testo', de: 'Text in 11 (B1/B2) bzw. 16 Teilen (C1/C2), A ist der Anfang: Nummer der Position neben jeden Teil schreiben',
      cfg: { ...V(['B1', 'B2'], { prova: 3, parti: 11, 'parole per parte': '15–35' }), ...V(['C1', 'C2'], { prova: 3, parti: 16, 'parole per parte': '20–40' }) },
      consegna: (l, x, n) => `Leggi il testo. Il testo è diviso in ${n} parti. Le parti non sono in ordine. Ricostruisci il testo. Scrivi il numero d’ordine accanto a ciascuna parte.` },
    { id: 'let-brevi', part: 'lettura', it: 'Testi brevi (una informazione per testo)', de: 'Vier kurze Gebrauchstexte mit Überschrift, je genau eine zutreffende Aussage',
      cfg: { A1: { prova: 2, testi: 4, parole: '20–40 per testo', opzioni: 3 }, A2: { prova: 2, testi: 4, parole: '30–50 per testo', opzioni: 3 } },
      consegna: l => (l === 'A1' ? 'Leggi i testi. Poi leggi le informazioni. Scegli le informazioni presenti nei testi (una per testo).' : 'Leggi i testi. Poi leggi le informazioni. Scegli le informazioni presenti nei testi (1 informazione per testo).') },
    { id: 'let-abbina', part: 'lettura', it: 'Testi da completare (A–H)', de: 'Vier Textanfänge, acht Fortsetzungen A–H: die vier passenden wählen',
      cfg: V(['A1', 'A2'], { prova: 3, testi: 4, completamenti: 8 }),
      consegna: () => 'Leggi i testi. Scegli tra i testi da A ad H i quattro che completano i testi da 1 a 4.' },
    { id: 'str-articoli', part: 'strutture', it: 'Articoli (e preposizioni articolate)', de: 'A1: bestimmte Artikel (10); B1: Artikel und Präpositionen mit Artikel, Präposition in Klammern (20)',
      cfg: { A1: { prova: 1, lacune: 10, forme: 'il, lo, la, l’, i, gli, le' }, B1: { prova: 1, lacune: 20, forme: 'articoli determinativi e indeterminativi; preposizioni articolate con la preposizione semplice tra parentesi: (di) [[della]]' } },
      consegna: l => (l === 'A1' ? 'Completa il testo con gli articoli determinativi (il, lo, la, l’, i, gli, le).' : 'Completa il testo con gli articoli e le preposizioni articolate: utilizza le preposizioni fra parentesi.') },
    { id: 'str-aggettivi', part: 'strutture', it: 'Aggettivi', de: 'Adjektive in der richtigen Form (Grundform in Klammern)',
      cfg: { A2: { prova: 1, lacune: 10 } },
      consegna: () => 'Completa il testo con le forme giuste degli aggettivi che sono tra parentesi.' },
    { id: 'str-pronomi', part: 'strutture', it: 'Aggettivi e pronomi', de: 'Offener Lückentext: Possessiva, Demonstrativa, Indefinita, Pronomen (20)',
      cfg: { B2: { prova: 1, lacune: 20, forme: 'possessivi (nostri, suo/proprio), dimostrativi (questo, quello, coloro), indefiniti (tutto, ogni, alcuni, qualcuno, nessuno, tanto, altro), pronomi personali e relativi (che, chi, cui)' } },
      consegna: () => 'Completa il testo con gli aggettivi e i pronomi.' },
    { id: 'str-parola', part: 'strutture', it: 'Completa il testo', de: 'Offener Lückentext: Konnektoren, Präpositionen, Relativ- und andere Pronomen (20)',
      cfg: V(['C1', 'C2'], { prova: 1, lacune: 20, forme: 'connettivi e congiunzioni (ma, benché, affinché, sebbene, dunque, infatti, mentre, poiché), preposizioni e locuzioni (fino a, a causa di, in modo da), pronomi relativi e personali, avverbi' }),
      consegna: () => 'Completa il testo.' },
    { id: 'str-verbi', part: 'strutture', it: 'Verbi', de: 'Verben in der passenden Form; Infinitiv in Klammern (A1/A2: 10, ab B1: 20)',
      cfg: { A1: { prova: 2, lacune: 10, tempi: TEMPI.A1 }, A2: { prova: 2, lacune: 10, tempi: TEMPI.A2 }, B1: { prova: 2, lacune: 20, tempi: TEMPI.B1 }, B2: { prova: 2, lacune: 20, tempi: TEMPI.B2 }, C1: { prova: 2, lacune: 20, tempi: TEMPI.C1 }, C2: { prova: 2, lacune: 20, tempi: TEMPI.C2 } },
      consegna: l => (l === 'A1' ? 'Completa il testo con le forme al presente indicativo dei verbi che sono tra parentesi.' : ['C1', 'C2'].includes(l) ? 'Completa il testo. Inserisci i verbi.' : 'Completa il testo con le forme giuste dei verbi che sono tra parentesi.') },
    { id: 'str-scelta', part: 'strutture', it: 'Completa il testo (scelta multipla)', de: 'Lückentext mit Auswahltabelle: A1/A2 8 Lücken mit A–C, ab B1 15 Lücken mit A–D (vor allem Wortschatz)',
      cfg: { A1: { prova: 3, lacune: 8, opzioni: 3 }, A2: { prova: 3, lacune: 8, opzioni: 3 }, ...V(['B1', 'B2', 'C1', 'C2'], { prova: 3, lacune: 15, opzioni: 4 }) },
      consegna: l => (l === 'A1' ? 'Completa il testo. Scegli una delle tre proposte di completamento.' : l === 'C2' ? 'Completa il testo. Scegli una delle proposte di completamento.' : 'Completa il testo. Scegli una delle proposte di completamento che ti diamo.') },
    { id: 'str-situazioni', part: 'strutture', it: 'Espressioni e situazioni di comunicazione', de: 'Zu jeder Äußerung die passende von vier Situationen wählen (10)',
      cfg: V(['B1', 'B2'], { prova: 4, espressioni: 10, opzioni: 4 }),
      consegna: () => 'Scegli per ogni espressione una delle quattro situazioni di comunicazione che ti diamo.' },
    { id: 'str-trasforma', part: 'strutture', it: 'Riscrivi le frasi', de: 'Sätze eines Regelwerks umformen; der Satzanfang ist vorgegeben, die Bedeutung bleibt gleich (6)',
      cfg: V(['C1', 'C2'], { prova: 4, frasi: 6, genere: 'regolamento o bando (frasi da 25–50 parole)' }),
      consegna: () => 'Riscrivi le frasi. Inizia dalle parole che ti diamo e cambia la struttura sintattica. Se necessario, usa anche parole non presenti nel testo. Ogni frase deve avere lo stesso significato della frase corrispondente nel testo.' },
    { id: 'scr-testo', part: 'scrittura', it: 'Produzione scritta · Prova 1', de: 'Zwei Themen zur Wahl; C1: Stellungnahme 160–180 Wörter',
      cfg: { A1: { prova: 1, argomenti: 2, parole: '30–50' }, A2: { prova: 1, argomenti: 2, parole: '50–70' }, B1: { prova: 1, argomenti: 2, parole: '100–120' }, B2: { prova: 1, argomenti: 2, parole: '120–150' }, C1: { prova: 1, argomenti: 2, parole: '160–180', genere: 'testo argomentativo: considerazioni, vantaggi e svantaggi, punto di vista' }, C2: { prova: 1, argomenti: 2, parole: '200–250', genere: 'testo argomentativo' } },
      consegna: (l, x, n, c) => `Puoi scegliere di trattare uno dei seguenti argomenti. Devi scrivere da ${String(c.parole).split('–')[0]} a ${String(c.parole).split('–')[1]} parole.` },
    { id: 'scr-lettera', part: 'scrittura', it: 'Produzione scritta · Prova 2', de: 'Zwei Situationen zur Wahl: Mail oder Brief; C1: formelle Mail 100–120 Wörter',
      cfg: { A1: { prova: 2, argomenti: 2, parole: '20–40', registro: 'informale' }, A2: { prova: 2, argomenti: 2, parole: '35–50', registro: 'informale' }, B1: { prova: 2, argomenti: 2, parole: '50–80', registro: 'informale' }, B2: { prova: 2, argomenti: 2, parole: '80–100', registro: 'informale o formale' }, C1: { prova: 2, argomenti: 2, parole: '100–120', registro: 'email formale (reclamo, proposta, richiesta)' }, C2: { prova: 2, argomenti: 2, parole: '120–150', registro: 'formale' } },
      consegna: (l, x, n, c) => `Puoi scegliere di trattare uno dei seguenti argomenti. Devi scrivere da ${String(c.parole).split('–')[0]} a ${String(c.parole).split('–')[1]} parole.` },
    { id: 'ora-dialogo', part: 'orale', it: 'Produzione orale · Prova 1', de: 'A1/A2: zwei Rollenspiele; B1/B2: vier Gesprächsthemen; C1: vier Rollen; C2: vier Diskussionsthemen',
      cfg: { A1: { prova: 1, situazioni: 2, durata: '2–3 minuti circa', forma: 'gioco di ruolo semplice' }, A2: { prova: 1, situazioni: 2, durata: '2–3 minuti circa', forma: 'gioco di ruolo semplice' }, ...V(['B1', 'B2'], { prova: 1, situazioni: 4, durata: '2–3 minuti circa', forma: 'argomento di conversazione con domande' }), C1: { prova: 1, situazioni: 4, durata: '3–4 minuti circa', forma: 'situazione complessa in cui assumere un ruolo' }, C2: { prova: 1, situazioni: 4, durata: '3–4 minuti circa', forma: 'tesi da discutere («Esprimi la tua opinione.»)' } },
      consegna: l => ({ A1: 'Il candidato dovrà dimostrare di saper interagire in una delle seguenti situazioni:', A2: 'Il candidato dovrà dimostrare di saper interagire in una delle seguenti situazioni:', B1: 'L’esaminatore dovrà fare un dialogo con il candidato su uno dei seguenti argomenti:', B2: 'Il somministratore dovrà fare un dialogo con il candidato su uno dei seguenti argomenti:', C1: 'Il candidato dovrà dimostrare di saper assumere il ruolo richiesto in una delle seguenti situazioni:', C2: 'Il candidato dovrà sostenere una discussione con l’esaminatore, esprimendo le proprie opinioni in proposito, su uno dei seguenti argomenti:' })[l] },
    { id: 'ora-monologo', part: 'orale', it: 'Produzione orale · Prova 2', de: 'Monolog zu einem Thema: A1/A2 drei, ab B1 vier Themen (im Heft teils Bilder, in daje als Text)',
      cfg: { ...V(['A1', 'A2'], { prova: 2, argomenti: 3, durata: '1 minuto e mezzo circa' }), ...V(['B1', 'B2'], { prova: 2, argomenti: 4, durata: '1 minuto e mezzo circa' }), C1: { prova: 2, argomenti: 4, durata: '2–3 minuti circa', forma: 'spunto con dati o affermazione + domanda («Che cosa ne pensi?»)' }, C2: { prova: 2, argomenti: 4, durata: '2–3 minuti circa', forma: 'spunto argomentativo («Esprimi la tua opinione.»)' } },
      consegna: l => (['A1', 'A2', 'B1', 'B2'].includes(l) ? 'L’esaminatore inviterà il candidato a parlare su uno dei seguenti argomenti:' : l === 'C1' ? 'Il candidato dovrà fare una breve esposizione ed esprimere le opinioni personali su uno dei seguenti temi:' : 'Il candidato dovrà dimostrare di essere in grado di fare un’esposizione sintetica, ma caratterizzata da completezza, su uno dei seguenti argomenti:') }
  ];
  TYPES.forEach(t => {
    t.levels = LEVELS.filter(l => t.cfg[l]);
    t.spec = l => ({ ...t.cfg[l] });
  });
  // Typen mit Lese- bzw. Lückentext, für die ein echter Ausgangstext aus dem Netz taugt
  const TEXTO = ['let-scelta', 'let-info', 'let-ricostruisci', 'str-articoli', 'str-aggettivi', 'str-pronomi', 'str-parola', 'str-verbi', 'str-scelta', 'str-trasforma'];
  const typeById = id => TYPES.find(t => t.id === id);
  const typesFor = level => TYPES.filter(t => t.levels.includes(level));

  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const arr = v => (Array.isArray(v) ? v : v ? [v] : []);
  const s = (v, n = 6000) => String(v ?? '').trim().slice(0, n);
  const tidy = t => s(t, 8000).replace(/'/g, '’');
  const need = (ok, msg) => {
    if (!ok) throw new Error(msg);
  };
  // promptHelp nur bei der ersten Teilaufgabe
  const help1 = (q, i, text) => (i === 0 && text ? { ...q, promptHelp: text } : q);

  function hash(str) {
    let h = 2166136261;
    for (const ch of String(str)) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return h;
  }
  function shuffle(list, seed) {
    let h = hash(seed);
    const rnd = () => (h = (Math.imul(h, 1664525) + 1013904223) >>> 0) / 4294967296;
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /* „… [[anni]] …“ → Text mit [[g1]] und Lücken; mode 'choice': [[richtig|falsch|falsch]] */
  function gaps(text, mode, seed) {
    const list = [];
    let n = 0;
    const out = tidy(text).replace(/\[\[([^\]]+)\]\]/g, (m, inner) => {
      const id = 'g' + ++n;
      if (mode === 'choice') {
        const o = inner.split('|').map(x => x.trim()).filter(Boolean);
        need(o.length >= 2, 'Auswahl-Lücke ohne Alternativen: ' + inner);
        need(new Set(o.map(x => x.toLowerCase())).size === o.length, 'Auswahl-Lücke mit doppelter Option: ' + inner);
        list.push({ id, answer: o[0], options: shuffle(o, seed + id) });
      } else list.push({ id, acceptedAnswers: [...new Set(inner.split('/').map(x => x.trim()).filter(Boolean))] });
      return '[[' + id + ']]';
    });
    need(list.length, 'Im Text fehlen die Lücken [[…]].');
    return { text: out, gaps: list };
  }
  // Gesprochene Fassung: Lösungen einsetzen, Klammern weg
  const spoken = text => tidy(text).replace(/\[\[([^\]|/]+)[^\]]*\]\]/g, '$1');

  function choice(id, prompt, options, right) {
    const o = arr(options).slice(0, 6).map((t, i) => ({ id: 'o' + (i + 1), text: tidy(t) }));
    const k = LETTERS.indexOf(String(right || '').trim().toUpperCase());
    const label = '„' + String(prompt).slice(0, 40) + '“';
    need(o.length >= 2 && k >= 0 && k < o.length, 'Auswahlfrage ' + label + ': Optionen oder Lösung fehlen.');
    need(new Set(o.map(x => x.text.toLowerCase())).size === o.length, 'Auswahlfrage ' + label + ': zwei gleiche Optionen.');
    return { id, type: 'single_choice', prompt: tidy(prompt), options: o, correctOptionId: o[k].id };
  }
  const mcList = (list, help) => {
    const qs = arr(list).map((d, i) => help1(choice('q' + (i + 1), d.domanda || d.inizio, d.opzioni, d.giusta), i, help));
    need(qs.length, 'Keine Fragen (domande) gefunden.');
    return qs;
  };
  // Informazioni presenti: wie im Heft je Aussage vero/falso
  function vfQs(list, help) {
    const a = arr(list).map(x => ({ text: tidy(x.testo || x), on: x.presente === true || x.vero === true }));
    need(a.length >= 4 && a.length <= 20, 'Bitte 4 bis 20 Aussagen (affermazioni).');
    const right = a.filter(x => x.on).length;
    need(right >= 1 && right < a.length, 'Mindestens eine Aussage muss stimmen und mindestens eine nicht.');
    return a.map((x, i) => help1({ id: 'q' + (i + 1), type: 'true_false', prompt: x.text, answer: x.on }, i, help));
  }
  // B1/B2: je Aussage vero/falso; C1/C2: aus 15 Aussagen (A–O) genau die vorgegebene Zahl wählen
  function infoQs(x, c, help) {
    if (!c.spec.presenti) return vfQs(x.affermazioni, help);
    const a = arr(x.affermazioni).map(y => ({ text: tidy(y.testo || y), on: y.presente === true || y.vero === true }));
    need(a.length === c.spec.affermazioni, `Bitte genau ${c.spec.affermazioni} Aussagen (A–O), geliefert: ${a.length}.`);
    need(a.filter(y => y.on).length === c.spec.presenti, `Genau ${c.spec.presenti} Aussagen müssen im Text stehen, geliefert: ${a.filter(y => y.on).length}.`);
    const L = 'ABCDEFGHIJKLMNO';
    const options = a.map((y, i) => ({ id: 'o' + (i + 1), text: `${L[i]}. ${y.text}` }));
    return [{ id: 'q1', type: 'multiple_choice', prompt: c.consegna, promptHelp: help, options, correctOptionIds: options.filter((o, i) => a[i].on).map(o => o.id) }];
  }
  // Anweisung wie im Heft, auf Wunsch mit Beispiel (0)
  const head = (c, x) => s(c.consegna + (x && x.esempio ? '\nEsempio: (0) ' + tidy(x.esempio) : ''), 1000);
  function openGaps(x, c, help) {
    const g = gaps(x.testo, 'fill', c.seed);
    need(!c.spec.lacune || g.gaps.length === c.spec.lacune, `Der Text hat ${g.gaps.length} Lücken, verlangt sind ${c.spec.lacune}.`);
    return { questions: [{ id: 'q1', type: 'gap_fill', prompt: head(c, x), promptHelp: help, text: g.text, gaps: g.gaps }] };
  }
  function writing(x, c) {
    const w = arr(x.compiti);
    need(w.length, 'Keine Schreibaufgabe (compiti) gefunden.');
    return {
      questions: w.slice(0, 3).map((y, i) => {
        const words = String(y.parole || c.spec.parole).replace('-', '–');
        const q = {
          id: 'q' + (i + 1),
          type: 'open_answer',
          prompt: s(`${i === 0 ? c.consegna + '\n\n' : ''}Argomento ${i + 1}: ${tidy(y.consegna)}`, 1000),
          modelAnswer: s(tidy(y.modello), 2000),
          lines: Math.min(15, Math.max(6, Math.round((parseInt(words.split('–').pop(), 10) || 80) / 10)))
        };
        if (arr(y.criteri).length) q.explanation = s('Controlla: ' + arr(y.criteri).map(tidy).join(' · '), 1500);
        return help1(q, i, `Wähle eines der Themen und schreib ${words} Wörter. Vergleiche danach mit dem Mustertext und der Checkliste.`);
      })
    };
  }

  // Die erste Teilaufgabe trägt die Anweisung des Hefts; Einzelfragen behalten ihren Satzanfang
  const first = (qs, c) => qs.map((q, i) => (i === 0 && q.type !== 'multiple_choice' ? { ...q, prompt: s(c.consegna + '\n\n' + q.prompt, 1000) } : q));

  // Baustein je Typ: aus einer Übung der KI-Antwort die Felder des Pakets
  const BUILD = {
    'asc-scelta': (x, c) => ({ questions: first(mcList(x.domande, 'Hör den Text. Wähle jeweils die richtige Fortsetzung.'), c) }),
    'asc-info': (x, c) => ({ questions: first(infoQs(x, c, c.spec.presenti ? `Hör den Text. Kreuze die ${c.spec.presenti} Aussagen an, die im Text vorkommen.` : 'Hör den Text. Stimmt die Aussage (vero) oder nicht (falso)?'), c) }),
    'asc-completa': (x, c) => openGaps(x, c, 'Hör den Text. Ergänze die fehlenden Wörter.'),
    'asc-brevi': (x, c) => {
      const t = arr(x.testi);
      need(t.length >= 2, 'Bitte mindestens zwei Kurztexte (testi).');
      return { questions: first(t.map((y, i) => help1(choice('q' + (i + 1), `Testo ${y.numero || i + 1}`, y.opzioni, y.giusta), i, 'Wähle zu jedem Text die Information, die vorkommt.')), c) };
    },
    'let-scelta': (x, c) => ({ reading: { title: tidy(x.titolo), text: tidy(x.testo) }, questions: first(mcList(x.domande, 'Lies den Text. Wähle jeweils die richtige Fortsetzung.'), c) }),
    'let-info': (x, c) => ({ reading: { title: tidy(x.titolo), text: tidy(x.testo) }, questions: first(infoQs(x, c, c.spec.presenti ? `Lies den Text. Kreuze die ${c.spec.presenti} Aussagen an, die im Text stehen.` : 'Lies den Text. Stimmt die Aussage (vero) oder nicht (falso)?'), c) }),
    'let-ricostruisci': (x, c) => {
      const p = arr(x.parti).map(tidy).filter(Boolean);
      need(p.length === c.spec.parti, `Bitte genau ${c.spec.parti} Textteile (parti), geliefert: ${p.length}.`);
      // wie im Heft: A ist der Anfang (Position 1), die übrigen Teile tragen gemischte Buchstaben B, C, …;
      // neben jeden Buchstaben kommt die Nummer seiner Position
      const rest = shuffle(p.slice(1).map((t, i) => ({ t, pos: i + 2 })), c.seed);
      const L = 'ABCDEFGHIJKLMNOP';
      rest.forEach((r, i) => (r.letter = L[i + 1]));
      rest.sort((u, v) => u.letter.localeCompare(v.letter));
      return {
        reading: { title: tidy(x.titolo || ''), text: [`A. ${p[0]}`, ...rest.map(r => `${r.letter}. ${r.t}`)].join('\n\n') },
        questions: [
          {
            id: 'q1',
            type: 'gap_fill',
            prompt: c.consegna,
            promptHelp: `Teil A ist der Anfang (1). Schreib neben jeden Buchstaben die Nummer seiner Position (2 bis ${p.length}).`,
            text: ['A = 1', ...rest.map(r => `${r.letter} = [[${r.letter.toLowerCase()}]]`)].join(' · '),
            gaps: rest.map(r => ({ id: r.letter.toLowerCase(), acceptedAnswers: [String(r.pos)] }))
          }
        ]
      };
    },
    'let-brevi': (x, c) => {
      const t = arr(x.testi);
      need(t.length >= 2, 'Bitte mindestens zwei Kurztexte (testi).');
      return {
        reading: { title: tidy(x.titolo || ''), text: t.map((y, i) => `${i + 1}. ${tidy(y.titolo)}\n${tidy(y.testo)}`).join('\n\n') },
        questions: first(t.map((y, i) => help1(choice('q' + (i + 1), `Testo ${i + 1}${y.titolo ? ' · ' + tidy(y.titolo) : ''}`, y.opzioni, y.giusta), i, 'Wähle zu jedem Text die Information, die darin steht.')), c)
      };
    },
    'let-abbina': (x, c) => {
      const fini = x.fini || {};
      const used = new Set();
      const pairs = arr(x.inizi).map((y, i) => {
        const k = String(y.fine || '').trim().toUpperCase();
        need(fini[k], 'Fortsetzung „' + k + '“ fehlt.');
        need(!used.has(k), 'Fortsetzung „' + k + '“ ist doppelt vergeben.');
        used.add(k);
        return { id: 'p' + (i + 1), left: s(`${y.titolo ? tidy(y.titolo) + ': ' : ''}${tidy(y.testo)}`, 300), right: s(tidy(fini[k]), 300) };
      });
      need(pairs.length >= 2, 'Bitte mindestens zwei Textanfänge (inizi).');
      const distractors = Object.keys(fini).filter(k => !used.has(k)).slice(0, 4).map(k => s(tidy(fini[k]), 300));
      return {
        questions: [{ id: 'q1', type: 'matching', prompt: c.consegna, promptHelp: 'Ordne jedem Textanfang die passende Fortsetzung zu. Einige Fortsetzungen bleiben übrig.', pairs, distractors }]
      };
    },
    'str-articoli': (x, c) => openGaps(x, c, c.level === 'A1' ? 'Ergänze die bestimmten Artikel.' : 'Ergänze Artikel und Präpositionen mit Artikel (Präposition in Klammern).'),
    'str-aggettivi': (x, c) => openGaps(x, c, 'Ergänze die Adjektive in der richtigen Form.'),
    'str-verbi': (x, c) => openGaps(x, c, 'Ergänze die Verben in der passenden Form.'),
    'str-parola': (x, c) => openGaps(x, c, 'Ergänze jeweils ein passendes Wort.'),
    'str-pronomi': (x, c) => openGaps(x, c, 'Ergänze die passenden Pronomen.'),
    'str-scelta': (x, c) => {
      const g = gaps(x.testo, 'choice', c.seed);
      need(g.gaps.length === c.spec.lacune, `Der Text hat ${g.gaps.length} Lücken, verlangt sind ${c.spec.lacune}.`);
      need(g.gaps.every(y => y.options.length === c.spec.opzioni), `Jede Lücke braucht genau ${c.spec.opzioni} Möglichkeiten.`);
      return { questions: [{ id: 'q1', type: 'gap_choice', prompt: head(c, x), promptHelp: 'Ergänze den Text. Wähle jeweils die passende Möglichkeit.', text: g.text, gaps: g.gaps }] };
    },
    'str-situazioni': (x, c) => {
      const e = arr(x.espressioni);
      need(e.length, 'Keine Äußerungen (espressioni) gefunden.');
      return { questions: first(e.map((y, i) => help1(choice('q' + (i + 1), `«${tidy(y.espressione).replace(/^[«"“]+|[»"”]+$/g, '')}»`, y.opzioni, y.giusta), i, 'In welcher Situation sagt man das? Wähle die passende Situation.')), c) };
    },
    'str-trasforma': (x, c) => {
      const f = arr(x.frasi);
      need(f.length, 'Keine Sätze (frasi) gefunden.');
      return {
        questions: first(
          f.map((y, i) => {
            const start = tidy(y.inizio).replace(/[\s.…]+$/, '');
            need(start, `Satz ${i + 1}: Satzanfang (inizio) fehlt.`);
            // Lösungen ohne den vorgegebenen Anfang; wer ihn mitschreibt, wird trotzdem richtig bewertet
            const cut = t => (t.toLowerCase().startsWith(start.toLowerCase()) ? t.slice(start.length).trim() : t);
            const sol = [...new Set(arr(y.soluzioni).map(tidy).filter(Boolean).flatMap(t => [cut(t), start + ' ' + cut(t)]))];
            need(sol.length, `Satz ${i + 1}: Lösung (soluzioni) fehlt.`);
            return help1({ id: 'q' + (i + 1), type: 'short_answer', prompt: s(`${i + 1}. ${tidy(y.frase)}\n→ ${start.toUpperCase()} …`, 1000), acceptedAnswers: sol.slice(0, 8), modelAnswer: start + ' ' + cut(sol[0]) }, i, 'Schreib den Satz mit dem vorgegebenen Anfang weiter. Die Bedeutung bleibt gleich.');
          }),
          c
        )
      };
    },
    'scr-testo': writing,
    'scr-lettera': writing,
    'ora-dialogo': (x, c) => {
      const t = arr(x.situazioni);
      need(t.length, 'Keine Situationen (situazioni) gefunden.');
      return { questions: t.slice(0, 4).map((y, i) => help1({ id: 'q' + (i + 1), type: 'open_answer', prompt: s(`${i === 0 ? c.consegna + '\n\n' : ''}${i + 1}. ${tidy(y.situazione || y)}`, 1000), modelAnswer: s(arr(y.spunti).map(tidy).join('\n'), 2000), lines: 4 }, i, `Wähle eine Situation (${c.spec.durata.replace(' circa', '').replace('minuti', 'Minuten')}). Die Lehrkraft übernimmt die andere Rolle.`)) };
    },
    'ora-monologo': (x, c) => {
      const t = arr(x.argomenti);
      need(t.length, 'Keine Themen (argomenti) gefunden.');
      return { questions: t.slice(0, 4).map((y, i) => help1({ id: 'q' + (i + 1), type: 'open_answer', prompt: s(`${i === 0 ? c.consegna + '\n\n' : ''}${i + 1}. ${tidy(y.argomento || y)}${y.stimolo ? '\n' + tidy(y.stimolo) : ''}`, 1000), modelAnswer: s(arr(y.spunti).map(tidy).join('\n'), 2000), lines: 4 }, i, `Wähle ein Thema und sprich frei (${c.spec.durata.replace(' circa', '').replace('minuti', 'Minuten').replace('1 minuto e mezzo', 'anderthalb Minuten')}).`)) };
    }
  };

  // Medium für Hörtypen aus den Angaben der Lehrkraft
  function mediaFrom(m) {
    m = m || {};
    const transcript = s(m.transcript, 16000);
    need(transcript.length >= 40, 'Für das Hörverstehen bitte das Transkript der eigenen Aufnahme einfügen.');
    const url = s(m.url, 500);
    let media;
    if (m.source === 'youtube') {
      const yt = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
      need(yt, 'Bitte einen gültigen YouTube-Link angeben.');
      media = { type: 'youtube', videoId: yt[1] };
      const t = url.match(/[?&](?:t|start)=(\d+)/);
      if (t) media.start = Number(t[1]);
    } else if (m.source === 'audio') {
      need(/^https:\/\/\S+$/.test(url), 'Bitte einen https-Link zur Audiodatei angeben.');
      media = { type: 'audio', url };
    } else media = { type: 'speech', text: transcript };
    return { media, transcript, transcriptOrigin: 'own' };
  }

  /*
   * ai: Antwort der KI. inp: { level, type, id: () => string, set, media: { source, url, transcript } }
   * Ergebnis: { level, type, tema, items: [{ part, label, pkg }] }
   */
  function build(ai, inp) {
    need(ai && typeof ai === 'object', 'Die Antwort ist kein JSON-Objekt.');
    if (ai.abbruch) throw new Error('Die KI hat abgebrochen: ' + ai.abbruch);
    const type = typeById(inp.type || ai.tipo);
    need(type, 'Unbekannter Aufgabentyp. Bitte zuerst einen Typ wählen.');
    need(!ai.tipo || ai.tipo === type.id, `Die Antwort gehört zum Typ „${ai.tipo}“, gewählt ist „${type.id}“.`);
    const level = LEVELS.includes(inp.level) ? inp.level : LEVELS.includes(ai.livello) ? ai.livello : type.levels[0];
    need(type.levels.includes(level), `Den Typ „${type.it}“ gibt es nicht auf Niveau ${level}.`);
    const spec = type.spec(level);
    const set = inp.set || 'cils';
    const tema = s(ai.tema, 80);
    const media = type.media ? mediaFrom(inp.media) : null;
    let list = arr(ai.esercizi);
    need(list.length, 'In der Antwort fehlt „esercizi“ mit mindestens einer Übung.');
    list = list.slice(0, type.media || type.part === 'scrittura' || type.part === 'orale' ? 1 : 3);
    const notes = arr(ai.noteDocente).map(x => s(x, 300)).filter(Boolean).slice(0, 10);
    const part = PARTS[type.part];
    // Adaptierter Text aus dem Netz: Quelle festhalten, Rechte gelten als ungeprüft
    const f = ai.fonte && typeof ai.fonte === 'object' ? ai.fonte : null;
    const furl = f && /^https:\/\/\S+$/.test(String(f.url || '').trim()) ? String(f.url).trim().slice(0, 500) : '';
    const fonte =
      f && (f.testata || f.titolo || furl)
        ? {
            kind: 'external',
            citation: s(`Testo adattato da: ${[f.autore, f.titolo ? '«' + f.titolo + '»' : '', f.testata, f.data].map(v => s(v, 200)).filter(Boolean).join(', ')}. Kürzung und Bearbeitung für daje.`, 1000),
            ...(furl ? { url: furl } : {}),
            rights: 'needs_review',
            meta: Object.fromEntries([['url', furl], ['author', s(f.autore, 300)], ['title', s(f.titolo, 300)], ['site', s(f.testata, 300)], ['date', s(f.data, 300)]].filter(([, v]) => v))
          }
        : null;
    const items = list.map((x, n) => {
      x = x && typeof x === 'object' ? x : {};
      const fields = BUILD[type.id](x, { level, spec, seed: set + type.id + n, consegna: type.consegna(level, x, spec.parti, spec) });
      const title = tidy(x.titolo || '');
      const pkg = {
        format: 'theis-learning-package',
        schemaVersion: '1.2',
        kind: type.media ? 'listening' : 'grammar',
        id: inp.id(),
        title: s(`${EXAM[level]} · ${SHORT[type.part]} · ${type.it}${title ? ' · ' + title : list.length > 1 ? ' ' + (n + 1) : ''}`, 120),
        language: 'it',
        level,
        description: s(`Allenamento ${EXAM[level]} · ${part.label} · ${type.it}${tema ? ' · ' + tema : ''}.`, 600),
        topics: ['CILS', EXAM[level], part.de],
        estimatedMinutes: 10,
        sources: [
          {
            kind: 'own',
            citation: type.media
              ? 'Aufnahme und Transkript von der Lehrkraft; Aufgaben im Format ' + EXAM[level] + ' mit KI-Unterstützung für daje erstellt. Keine Originalaufgabe der Università per Stranieri di Siena.'
              : 'Übung im Format ' + EXAM[level] + ', mit KI-Unterstützung für daje erstellt. Keine Originalaufgabe der Università per Stranieri di Siena.',
            rights: 'own'
          },
          ...(fonte ? [fonte] : [])
        ],
        catalog: { origin: fonte ? 'media' : 'own', cefr: level, tags: ['cils', 'cils-' + level.toLowerCase(), type.part, type.id], textbook: { series: 'CILS', volume: level, unit: EXAM[level], section: part.label } },
        ...(media || {}),
        ...fields
      };
      if (!pkg.reading || !pkg.reading.text) delete pkg.reading;
      else if (!pkg.reading.title) delete pkg.reading.title;
      if (!type.media)
        pkg.grammar = {
          topic: 'cils-' + level.toLowerCase() + '-' + type.part,
          topicTitle: EXAM[level] + ' · ' + part.label,
          difficulty: ['A1', 'A2'].includes(level) ? 'mittel' : 'schwer',
          origin: 'own',
          order: (Object.keys(PARTS).indexOf(type.part) + 1) * 10 + TYPES.filter(t => t.part === type.part).indexOf(type)
        };
      if (notes.length) pkg.teacherNotes = { tips: notes };
      return { part: type.part, label: `${part.label} · ${type.it}`, pkg };
    });
    return { level, type: type.id, tema, fonte: fonte ? fonte.citation : '', items };
  }

  /* command: allgemeine Kommandodatei, typeCommand: Datei des Aufgabentyps */
  function promptFor(command, typeCommand, inp) {
    const type = typeById(inp.type);
    const level = inp.level;
    const spec = type.spec(level);
    const many = !type.media && !['scrittura', 'orale'].includes(type.part);
    // Ohne Themenwunsch: zufällig aus einer breiten Liste, damit nicht jedes Mal Schule herauskommt
    const pool = TEMI.filter(t => !(inp.recent || []).includes(t));
    const own = String(inp.theme || '').trim() && !inp.themeAuto;
    const theme = String(inp.theme || '').trim() || pool[Math.floor((inp.random ?? Math.random()) * pool.length)] || TEMI[0];
    const reading = !type.media && TEXTO.includes(type.id);
    const src = reading ? inp.textSource || 'web' : null;
    return [
      String(command).trim(),
      '',
      String(typeCommand).trim(),
      '',
      '## Eingaben',
      '',
      `- Prüfung und Niveau: ${EXAM[level]} (GER ${level}). Halte Wortschatz und Grammatik genau auf diesem Niveau (Abschnitt 4).`,
      `- Prova im Heft: ${PARTS[type.part].label}, Prova n. ${spec.prova}`,
      `- Anweisung im Heft (setzt daje selbst ein, nicht ausgeben): ${type.consegna(level, null, spec.parti, spec)}`,
      `- Aufgabentyp: ${type.id} · ${type.it} (${PARTS[type.part].label})`,
      `- Zielgruppe: ${inp.audience === 'adulti' ? 'Erwachsene' : 'Jugendliche von 12 bis 17 Jahren (Adolescenti)'}`,
      '- Vorgaben für dieses Niveau:',
      Object.entries(spec)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n'),
      many ? `- Anzahl Übungen in „esercizi“: ${Math.min(3, Math.max(1, Number(inp.count) || 1))}` : null,
      type.media ? null : '- Thema: ' + theme + (own ? '' : ' (zufällig gewählt; nicht Schule, außer es passt ausdrücklich)'),
      src === 'web'
        ? '- Textgrundlage: Suche im Internet einen echten, aktuellen italienischen Text zum Thema (Zeitung, Zeitschrift, Institution, Kulturportal) und adaptiere ihn wie die CILS-Autoren: kürzen, vereinfachen, auf Niveau und Länge bringen, Aufgaben dazu schreiben. Gib die Quelle in „fonte“ an (Abschnitt 2). Findest du keinen passenden Text, schreib einen eigenen und lass „fonte“ weg.'
        : src === 'eigen'
          ? '- Textgrundlage: der Text unten von der Lehrkraft. Kürze und adaptiere ihn auf Niveau und Länge; gib in „fonte“ die Quelle an, soweit bekannt.'
          : src === 'frei'
            ? '- Textgrundlage: eigener, neu geschriebener Text (kein „fonte“).'
            : null,
      inp.note ? '- Hinweise der Lehrkraft: ' + String(inp.note).trim() : null,
      src === 'eigen' ? '\n## Text der Lehrkraft (Grundlage)\n\n' + (inp.sourceUrl ? 'Quelle: ' + String(inp.sourceUrl).trim() + '\n\n' : '') + String(inp.sourceText || '').trim() : null,
      type.media ? '\n## Transkript der Aufnahme (von der Lehrkraft, nicht verändern)\n\n' + String((inp.media && inp.media.transcript) || '').trim() : null
    ]
      .filter(x => x !== null)
      .join('\n');
  }

  const api = { LEVELS, EXAM, PARTS, TYPES, HEFT, SCRITTA_HEFT, TEMI, TEXTO, typeById, typesFor, build, promptFor, gaps, spoken, mediaFrom };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DajeCILS = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* ---------- Oberfläche (nur im Browser) ---------- */
if (typeof document !== 'undefined') {
  const CILS_KEY = 'daje-cils-v1';
  const FORM0 = { level: 'B1', type: 'let-scelta', audience: 'adolescenti', count: 1, theme: '', note: '', answer: '', source: 'youtube', url: '', transcript: '', textSource: 'web', sourceText: '', sourceUrl: '' };
  const cilsState = () => {
    const d = read(CILS_KEY, null);
    const st = d && Array.isArray(d.sets) ? d : { sets: [] };
    st.form = { ...FORM0, ...(st.form || {}) };
    if (!DajeCILS.LEVELS.includes(st.form.level)) st.form.level = FORM0.level;
    if (!DajeCILS.typesFor(st.form.level).some(t => t.id === st.form.type)) st.form.type = DajeCILS.typesFor(st.form.level)[0].id;
    delete st.form.parts;
    return st;
  };
  let CILS = null;
  const cilsCmd = {};
  const cilsSave = () => save(CILS_KEY, CILS);
  const cilsLive = set => set.ids.filter(id => findTask(id));
  const cilsStrip = t => String(t).replace(/^CILS [^·]+ · /, '');
  // Name einer Übung im Satz: ohne Prüfung, Teil und Typ (stehen schon im Kopf der Karte)
  const cilsPartName = (id, i) => {
    const x = findTask(id);
    if (!x) return id;
    const t = DajeCILS.TYPES.find(y => x.catalog?.tags?.includes(y.id));
    let n = cilsStrip(x.title).replace(/^[^·]+ · /, '');
    if (t && n.startsWith(t.it)) n = n.slice(t.it.length).replace(/^ · /, '').trim();
    return n || 'Übung ' + (i + 1);
  };
  const cilsTypeFile = id => 'imports/cils/' + id + '.md';

  function cilsSetsHTML(limit) {
    const sets = CILS.sets.filter(st => cilsLive(st).length).slice(0, limit || 50);
    if (!sets.length) return '';
    return `<div class="cils-sets">${sets
      .map(st => {
        const ids = cilsLive(st);
        const t = st.type && DajeCILS.typeById(st.type);
        const head = st.tema || (t ? t.it : 'Übungsprüfung');
        const prova = t && t.cfg[st.level] ? ' · Prova ' + String(t.cfg[st.level].prova).replace(/ \(.*$/, '').replace(' o ', '/') : '';
        return `<article class="cils-set glass"><div class="cils-set-head"><span class="cils-badge">${esc(st.level)}</span><div><b>${esc(head)}</b><small>${t ? esc(DajeCILS.PARTS[t.part].de + prova + ' · ' + t.it) + ' · ' : ''}${new Date(st.created).toLocaleDateString('de-DE', { dateStyle: 'medium' })} · ${plural(ids.length, 'Übung', 'Übungen')}</small></div></div>
          <div class="cils-parts">${ids.map((id, i) => `<button class="cils-part" data-lesson="${esc(id)}"><span class="cils-pn">${i + 1}</span><span>${esc(cilsPartName(id, i))}</span></button>`).join('')}</div>
          <div class="cils-set-act"><button class="button primary" data-cils-mappe="${esc(st.id)}">Drucken</button><button class="button secondary" data-cils-klasse="${esc(st.id)}">Klassensitzung</button>${typeof ACC !== 'undefined' && ACC.admin ? `<button class="button secondary" data-cils-publish="${esc(st.id)}">Für alle freigeben</button>` : ''}<button class="quiet danger" data-cils-del="${esc(st.id)}">Löschen</button></div></article>`;
      })
      .join('')}</div>`;
  }

  // Kurzbeschreibung für das gewählte Niveau: Prova und Umfang wie im Heft
  function cilsSummary(t, l) {
    const c = t.cfg[l];
    const n = [];
    const pv = String(c.prova).replace(/ \(.*$/, '').replace(' o ', ' oder ');
    if (c.lacune) n.push(`${c.lacune} Lücken${c.opzioni ? ' mit ' + 'ABCD'.slice(0, c.opzioni).split('').join('/') : ''}`);
    if (c.frasi && t.id !== 'str-trasforma') n.push(`${c.frasi} Sätze mit je ${c.opzioni} Fortsetzungen`);
    if (t.id === 'str-trasforma') n.push(`${c.frasi} Sätze umformen, Anfang vorgegeben`);
    if (c.testi) n.push(`${c.testi} kurze Texte${c.completamenti ? ', ' + c.completamenti + ' Fortsetzungen A–H' : ', je 3 Informationen'}`);
    if (c.affermazioni) n.push(c.presenti ? `${c.presenti} von ${c.affermazioni} Aussagen (A–O) wählen` : `${c.affermazioni} Aussagen vero/falso`);
    if (c.parti) n.push(`${c.parti} Textteile ordnen`);
    if (c.espressioni) n.push(`${c.espressioni} Äußerungen, je 4 Situationen`);
    if (c.parole && t.part === 'scrittura') n.push(`2 Themen zur Wahl, ${c.parole} Wörter`);
    else if (c.parole && t.part === 'lettura' && !c.testi) n.push(`Text mit ${c.parole} Wörtern`);
    if (c.situazioni) n.push(`${c.situazioni} ${l === 'A1' || l === 'A2' || l === 'C1' ? 'Rollenspiele' : 'Gesprächsthemen'}, ${c.durata.replace(' circa', '').replace('minuti', 'Min.')}`);
    if (c.argomenti && t.part === 'orale') n.push(`${c.argomenti} Themen zur Wahl, ${c.durata.replace(' circa', '').replace('1 minuto e mezzo', '1,5 Min.').replace('minuti', 'Min.')}`);
    return `Prova ${pv} · ${n.join(' · ')}`;
  }

  function cilsTypesHTML(f) {
    const list = DajeCILS.typesFor(f.level);
    return Object.entries(DajeCILS.PARTS)
      .map(([k, p]) => {
        const ts = list.filter(t => t.part === k);
        if (!ts.length) return '';
        return `<div class="cils-group"><h3>${esc(p.de)} <small>${esc(p.label)}</small></h3><div class="cils-types">${ts
          .map(t => `<button type="button" class="cils-type" data-cils-type="${t.id}" aria-pressed="${f.type === t.id}"><b>${esc(t.it)}</b><small>${esc(cilsSummary(t, f.level))}</small>${t.media ? '<i class="cils-own">eigene Aufnahme</i>' : ''}</button>`)
          .join('')}</div></div>`;
      })
      .join('');
  }

  function cilsDetailsHTML(f, t) {
    const c = t.spec(f.level);
    const LBL = { prova: 'Prova n.', lacune: 'Lücken', frasi: 'Sätze', opzioni: 'Möglichkeiten', testi: 'Texte', affermazioni: 'Aussagen', presenti: 'davon zutreffend', vere: 'zutreffend', formato: 'Form', parole: 'Wörter', genere: 'Textsorte', parti: 'Teile', 'parole per parte': 'Wörter je Teil', completamenti: 'Fortsetzungen', forme: 'Formen', tempi: 'Zeiten und Modi', espressioni: 'Äußerungen', argomenti: 'Themen zur Wahl', registro: 'Register', situazioni: 'Situationen', durata: 'Dauer', forma: 'Form' };
    const spec =
      `<li class="cils-cons"><b>Anweisung im Heft</b> <i lang="it">${esc(t.consegna(f.level, null, c.parti, c))}</i></li>` +
      Object.entries(c)
        .map(([k, v]) => `<li><b>${esc(LBL[k] || k)}</b> ${esc(String(v))}</li>`)
        .join('') +
      (t.part === 'scrittura' && !DajeCILS.SCRITTA_HEFT.includes(f.level) ? '<li><b>Hinweis</b> Wortzahl als Richtwert (Schreibbogen dieses Niveaus lag nicht vor)</li>' : '');
    const textSrc = DajeCILS.TEXTO.includes(t.id)
      ? `<div class="cils-row"><span>Text</span><div class="pills">${[['web', 'Echter Text aus dem Netz'], ['eigen', 'Eigener Text oder Link'], ['frei', 'Frei geschrieben']].map(([v, l]) => `<button type="button" class="pill" data-cils-tsrc="${v}" aria-pressed="${f.textSource === v}">${l}</button>`).join('')}</div></div>
        <p class="small muted cils-tsrc-hint">${
          f.textSource === 'web'
            ? 'Wie bei den CILS-Autoren: Die KI sucht einen echten Artikel zum Thema, kürzt und adaptiert ihn und nennt die Quelle. Das klappt nur mit Websuche (z. B. ChatGPT mit Suche, Gemini, Claude mit Websuche). Für den Unterricht in Ordnung; vor „Für alle freigeben“ Rechte prüfen.'
            : f.textSource === 'eigen'
              ? 'Füge einen Text oder Ausschnitt ein, den die KI kürzt und auf Niveau bringt.'
              : 'Die KI schreibt einen eigenen, neuen Text.'
        }</p>
        ${f.textSource === 'eigen' ? `<label class="field">Ausgangstext<textarea data-cils-f="sourceText" rows="5" placeholder="Artikel oder Ausschnitt hier einfügen">${esc(f.sourceText)}</textarea></label><label class="field">Quelle (Link, optional)<input data-cils-f="sourceUrl" value="${esc(f.sourceUrl)}" placeholder="https://…" inputmode="url"></label>` : ''}`
      : '';
    const many = !t.media && !['scrittura', 'orale'].includes(t.part);
    if (t.media)
      return `<p class="cils-hint">Für das Hörverstehen schreibt die KI <b>keine Hörtexte</b>. Du bringst deine Aufnahme mit (Video, Audio oder ein Transkript, das du vorlesen lässt); die KI erstellt nur die Aufgaben dazu.</p>
        <div class="pills" role="radiogroup" aria-label="Aufnahme">${[['youtube', 'YouTube-Video'], ['audio', 'Audiodatei (Link)'], ['speech', 'Transkript vorlesen lassen']].map(([v, l]) => `<button type="button" class="pill" data-cils-source="${v}" aria-pressed="${f.source === v}">${l}</button>`).join('')}</div>
        ${f.source === 'speech' ? '' : `<label class="field">${f.source === 'youtube' ? 'Link zum Video (Startzeit mit ?t=… möglich)' : 'https-Link zur Audiodatei (mp3, m4a)'}<input data-cils-f="url" value="${esc(f.url)}" placeholder="${f.source === 'youtube' ? 'https://www.youtube.com/watch?v=…' : 'https://…/aufnahme.mp3'}" inputmode="url"></label>`}
        <label class="field">Transkript der Aufnahme<textarea data-cils-f="transcript" rows="6" placeholder="Den gesprochenen Text hier einfügen. Bei mehreren Kurztexten: Testo 1, Testo 2 … jeweils davor schreiben.">${esc(f.transcript)}</textarea></label>
        <ul class="cils-spec">${spec}</ul>`;
    return `${many ? `<div class="cils-row"><span>Übungen</span><div class="pills">${[1, 2, 3].map(n => `<button type="button" class="pill" data-cils-count="${n}" aria-pressed="${Number(f.count) === n}">${n}</button>`).join('')}</div></div>` : ''}
      <label class="field">Thema (optional)<input data-cils-f="theme" value="${esc(f.theme)}" placeholder="leer lassen: daje wählt jedes Mal ein anderes Thema"></label>
      ${textSrc}
      <label class="field">Hinweise für die KI (optional)<input data-cils-f="note" value="${esc(f.note)}" placeholder="z. B. Wortschatz aus Lektion 4, besonders congiuntivo üben"></label>
      <ul class="cils-spec">${spec}</ul>`;
  }

  function cilsPage() {
    CILS = CILS || cilsState();
    const f = CILS.form;
    const t = DajeCILS.typeById(f.type);
    $('breadcrumb').textContent = 'CILS-Training';
    $('main').innerHTML = `<div class="page cils-page">
      <button class="quiet back-link" data-nav="pruefung">Prüfungstraining</button>
      <header class="page-head"><div class="eyebrow">Prüfungsvorbereitung</div><h1>CILS-Training</h1><p>Wähle Niveau und einen Aufgabentyp der CILS-Prüfung. Die KI schreibt neue Übungen genau in diesem Format; daje macht daraus Übungen mit Lösungen, Druckfassung und Klassenlink.</p></header>
      <section class="cils-builder glass">
        <div class="cils-step"><span class="cils-n">1</span><div><h2>Niveau</h2>
          <div class="cils-levels" role="tablist" aria-label="Niveau">${DajeCILS.LEVELS.map(l => `<button role="tab" aria-selected="${f.level === l}" data-cils-level="${l}"><b>${l}</b><small>${esc(DajeCILS.EXAM[l].replace('CILS ', '').replace(/-?[ABC]\d$/, '') || 'CILS')}</small></button>`).join('')}</div>
          <div class="cils-row"><span>Zielgruppe</span><div class="pills">${[['adolescenti', 'Jugendliche'], ['adulti', 'Erwachsene']].map(([v, l]) => `<button type="button" class="pill" data-cils-aud="${v}" aria-pressed="${f.audience === v}">${l}</button>`).join('')}</div></div>
        </div></div>
        <div class="cils-step"><span class="cils-n">2</span><div><h2>Aufgabentyp</h2>${cilsTypesHTML(f)}</div></div>
        <div class="cils-step"><span class="cils-n">3</span><div><h2>${esc(t.it)} <small class="muted">${esc(DajeCILS.EXAM[f.level])}</small></h2>${cilsDetailsHTML(f, t)}</div></div>
        <div class="cils-step"><span class="cils-n">4</span><div><h2>Auftrag an die KI</h2><p class="muted">Kopieren und in ChatGPT, Claude oder Gemini einfügen. Der Auftrag enthält die Grundregeln, die Kommandodatei dieses Aufgabentyps und die Vorgaben für ${esc(f.level)}.</p>
          <div class="studio-actions"><button class="button primary" data-cils-copy>Auftrag kopieren</button><a class="button secondary" href="${cilsTypeFile(t.id)}" target="_blank" rel="noopener">Kommandodatei ansehen</a></div><p class="small muted" id="cils-copy-status" role="status"></p></div></div>
        <div class="cils-step"><span class="cils-n">5</span><div><h2>Antwort einfügen</h2>
          <textarea class="cils-answer" data-cils-f="answer" rows="6" placeholder="Antwort der KI hier einfügen ({ … })">${esc(f.answer)}</textarea>
          <div class="studio-actions"><button class="button primary" data-cils-build>Übungen erstellen</button></div><div id="cils-result"></div></div></div>
      </section>
      ${CILS.sets.some(st => cilsLive(st).length) ? `<h2 class="cils-h">Deine CILS-Übungen</h2>${cilsSetsHTML()}` : ''}
      <p class="small muted cils-note">Aufbau, Anweisungen und Anzahlen nach den Prüfungsheften der CILS (A1 und A2 Adolescenti, UNO-B1 und DUE-B2 Adolescenti, TRE-C1, QUATTRO-C2). Schreibaufgaben: Wortzahlen nach TRE-C1, auf den anderen Niveaus Richtwerte. Keine Originalaufgaben der Università per Stranieri di Siena.</p>
    </div>`;
  }

  const cilsInput = () => {
    const f = CILS.form;
    return { level: f.level, type: f.type, audience: f.audience, count: f.count, theme: f.theme, note: f.note, textSource: f.textSource, sourceText: f.sourceText, sourceUrl: f.sourceUrl, media: { source: f.source, url: f.url, transcript: f.transcript } };
  };

  async function cilsCopy() {
    const st = $('cils-copy-status');
    const f = CILS.form;
    const t = DajeCILS.typeById(f.type);
    if (t.media) {
      try {
        DajeCILS.mediaFrom(cilsInput().media);
      } catch (err) {
        st.textContent = err.message;
        return;
      }
    }
    const job = Promise.all([kiLoad('imports/cils/KI-CILS.md', cilsCmd.base), kiLoad(cilsTypeFile(t.id), cilsCmd[t.id])]).then(([a, b]) => {
      cilsCmd.base = a;
      cilsCmd[t.id] = b;
      // Ohne Themenwunsch: ein Thema, das zuletzt nicht dran war
      const inp = cilsInput();
      if (!String(f.theme).trim()) {
        const recent = CILS.recent || [];
        const pool = DajeCILS.TEMI.filter(x => !recent.includes(x));
        inp.theme = pool[Math.floor(Math.random() * pool.length)];
        inp.themeAuto = true;
        CILS.recent = [inp.theme, ...recent].slice(0, 8);
        cilsSave();
      }
      return DajeCILS.promptFor(a, b, inp);
    });
    const ok = await copyLater(job);
    const text = await job;
    if (ok) st.textContent = 'Auftrag kopiert. Jetzt im Chat einfügen und absenden, danach die Antwort unten einfügen.';
    else {
      st.innerHTML = 'Kopieren wurde blockiert. Bitte hier markieren und kopieren:<textarea class="ki-fallback" rows="5" readonly>' + esc(text) + '</textarea>';
      st.querySelector('textarea').select();
    }
  }

  function cilsBuild() {
    const out = $('cils-result');
    try {
      const ai = DajeKI.extractJSON(CILS.form.answer);
      const setId = 'cils-' + Date.now().toString(36);
      const r = DajeCILS.build(ai, { ...cilsInput(), id: edNewId, set: setId });
      if (editorState.items.length + r.items.length > 100) throw new Error('Höchstens 100 eigene Inhalte. Bitte zuerst alte löschen.');
      const bad = [];
      const now = new Date().toISOString();
      const ids = [];
      r.items.forEach(({ pkg, label }) => {
        const v = TheisContent.validatePackage(pkg);
        if (!v.ok) bad.push(label + ': ' + v.errors.slice(0, 2).map(e => e.path + ' ' + e.message).join('; '));
        editorState.items.unshift({ payload: v.ok ? v.value : null, draft: pkg, status: v.ok ? 'published' : 'draft', updatedAt: now });
        ids.push(pkg.id);
      });
      saveEditorState();
      CILS.sets.unshift({ id: setId, level: r.level, type: r.type, tema: r.tema, fonte: r.fonte || '', created: now, ids });
      CILS.form.answer = '';
      cilsSave();
      cilsPage();
      toast(`${plural(ids.length - bad.length, 'Übung', 'Übungen')} erstellt${bad.length ? `, ${bad.length} als Entwurf (bitte in „Eigene Übungen“ prüfen)` : ''}.`);
      if (bad.length) $('cils-result').innerHTML = `<div class="validation-errors"><b>Noch zu prüfen</b><ul>${bad.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`;
    } catch (err) {
      out.innerHTML = `<div class="validation-errors"><b>Noch nicht übernommen</b><p>${esc(err.message)}</p></div>`;
    }
  }

  /*
   * Druck im Aufbau der CILS-Hefte: Kopf „Sezione – Prova n. X“ mit Linie, Anweisung fett und kursiv,
   * Lesetext im grauen Kasten mit Titel in Großbuchstaben, Aufgaben je Prova neu nummeriert.
   * sol 0: Aufgaben, 1: Lösungen und Transkripte, 2: kurzer Schlüssel.
   */
  function cilsSheetHTML(ids, sol, title) {
    const xs = ids.map(id => findTask(id)).filter(Boolean);
    if (!xs.length) return '<div class="hb"><p>Keine Übungen.</p></div>';
    const t = HB_TXT.it;
    const de = instrFor('it') === 'de';
    instrCtx = 'it';
    const keys = [];
    const body = xs
      .map(x => {
        const ty = DajeCILS.TYPES.find(y => x.catalog?.tags?.includes(y.id));
        const lvl = x.level;
        const cfg = ty && ty.cfg[lvl];
        const prova = cfg ? String(cfg.prova).replace(/ \(.*$/, '').replace(' o ', '/') : '';
        const cons = ty ? ty.consegna(lvl, null, cfg.parti, cfg) : '';
        const first = x.questions[0];
        const ex = (first.prompt.match(/\nEsempio: \(0\) .*/) || [''])[0].trim();
        const strip = p => (cons && p.startsWith(cons) ? p.slice(cons.length).replace(/^\s*(Esempio: \(0\) [^\n]*)?\s*/, '') : p);
        const instr = de ? first.promptHelp || cons : cons;
        let n = 0;
        const qs = x.questions
          .map(q => {
            n++;
            q = q.type === 'multiple_choice' ? { ...q, options: q.options.map(o => ({ ...o, text: o.text.replace(/^[A-O]\. /, '') })) } : q;
            if (sol === 2) {
              keys.push(`<tr><td>${esc(prova ? ty.part.slice(0, 3).toUpperCase() + ' ' + prova : '')}</td><td>${n}</td><td>${hbAnswer(q, t)}</td></tr>`);
              return '';
            }
            const p = strip(q.prompt).trim();
            const one = x.questions.length === 1;
            return `<li class="cs-q${one ? ' one' : ''}">${one ? '' : `<b class="cs-n">${n}</b>`}<div>${p ? `<p class="cs-p">${esc(p).replace(/\n/g, '<br>')}</p>` : ''}${hbBody(q, t, !!sol)}</div></li>`;
          })
          .join('');
        if (sol === 2) return '';
        const reading = x.reading
          ? `<div class="cs-text">${x.reading.title ? `<h3>${esc(x.reading.title)}</h3>` : ''}${String(x.reading.text).split(/\n{2,}/).map(p => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')}</div>`
          : '';
        const link = x.kind === 'listening' && x.media?.type !== 'speech' ? `<p class="cs-link">Ascolto online: ${esc(location.origin + location.pathname + '?hoeren=' + encodeURIComponent(x.id))}</p>` : '';
        const tr = sol === 1 && (x.transcript || x.media?.type === 'speech') ? `<div class="cs-tr"><b>Trascrizione</b>${String(x.transcript || x.media.text).split(/\n+/).map(l => `<p>${esc(l)}</p>`).join('')}</div>` : '';
        const src = (x.sources || []).filter(z => z.kind === 'external').map(z => `<p class="cs-src">${esc(visibleText(z.citation))}</p>`).join('');
        return `<section class="cs-prova"><header class="cs-h">${esc(ty ? DajeCILS.PARTS[ty.part].label : 'CILS')}${prova ? ` – Prova n. ${esc(prova)}` : ''}</header>
          <p class="cs-cons">${esc(instr)}</p>${ex && !de ? `<p class="cs-ex">${esc(ex)}</p>` : ''}${link}${reading}${src}<ol class="cs-qs">${qs}</ol>${tr}</section>`;
      })
      .join('');
    const lv = [...new Set(xs.map(x => x.level))];
    return `<div class="hb cs${sol === 2 ? ' hb-compact' : ''}"><header class="hb-top"><b>theis · ${DOC_BRAND}</b><span>${esc(sol ? 'Chiavi' : 'Allenamento CILS')}</span></header>
      <h1>${esc(title)}</h1>
      <div class="hb-meta"><span>${esc(lv.map(l => DajeCILS.EXAM[l]).join(', '))}</span><span>Esercitazione · non è una prova ufficiale</span></div>
      ${sol ? '' : `<table class="hb-id"><tr><td>${esc(t.name)}</td><td>${esc(t.cls)}</td><td>${esc(t.date)}</td></tr></table>`}
      ${sol === 2 ? `<table class="hb-key"><thead><tr><th>Prova</th><th>${esc(t.kNo)}</th><th>${esc(t.kAns)}</th></tr></thead><tbody>${keys.join('')}</tbody></table>` : body}
      ${docFooter()}</div>`;
  }

  function cilsPrint(st, sol) {
    const ids = cilsLive(st);
    docCurrent = { kind: 'cils', solutions: sol, set: st.id };
    const t = st.type && DajeCILS.typeById(st.type);
    const title = (DajeCILS.EXAM[st.level] || 'CILS ' + st.level) + (t ? ' · ' + t.it : '') + (st.tema ? ' · ' + st.tema : '');
    const side =
      dlgBlock('Ausgabe', dlgSeg('data-cils-mode', 'cils-mode', [[0, 'Aufgaben'], [1, 'Lösungen und Transkripte'], [2, 'Kurzer Schlüssel']], sol)) +
      dlgBlock('Sprache der Anweisungen', dlgSeg('data-instr="pref"', 'instr', [['target', 'Italienisch (wie im Heft)'], ['de', 'Deutsch']], instrPref)) +
      dlgBlock('Design', dlgDesigns()) + dlgBlock('Schrift', dlgFonts()) + dlgBlock('Farbe', dlgAccents());
    dlgShow({ title, side, paper: cilsSheetHTML(ids, sol, title) });
  }
  window.cilsSheetHTML = cilsSheetHTML;

  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b || !CILS) return;
    const f = CILS.form;
    const set = (k, v) => {
      f[k] = v;
      cilsSave();
      cilsPage();
    };
    if (b.dataset.cilsLevel) {
      f.level = b.dataset.cilsLevel;
      if (!DajeCILS.typesFor(f.level).some(t => t.id === f.type)) f.type = DajeCILS.typesFor(f.level)[0].id;
      return set('level', f.level);
    }
    if (b.dataset.cilsType) return set('type', b.dataset.cilsType);
    if (b.dataset.cilsAud) return set('audience', b.dataset.cilsAud);
    if (b.dataset.cilsCount) return set('count', Number(b.dataset.cilsCount));
    if (b.dataset.cilsSource) return set('source', b.dataset.cilsSource);
    if (b.dataset.cilsTsrc) return set('textSource', b.dataset.cilsTsrc);
    if (b.hasAttribute('data-cils-copy')) return cilsCopy();
    if (b.hasAttribute('data-cils-build')) return cilsBuild();
    const st = id => CILS.sets.find(x => x.id === id);
    if (b.dataset.cilsMappe) return cilsPrint(st(b.dataset.cilsMappe), 0);
    if (b.dataset.cilsKlasse) {
      const s = st(b.dataset.cilsKlasse);
      const t = s.type && DajeCILS.typeById(s.type);
      if (typeof klLinkDialog === 'function') return klLinkDialog(cilsLive(s), 'CILS ' + s.level + (t ? ' · ' + t.it : '') + (s.tema ? ' · ' + s.tema : ''));
    }
    if (b.dataset.cilsDel) {
      if (!confirm('Diese CILS-Übungen löschen?')) return;
      const s = st(b.dataset.cilsDel);
      editorState.items = editorState.items.filter(i => !s.ids.includes(edId(i)));
      saveEditorState();
      CILS.sets = CILS.sets.filter(x => x !== s);
      cilsSave();
      return view === 'cils' ? cilsPage() : render();
    }
  });
  document.addEventListener('change', e => {
    if (docCurrent?.kind === 'cils' && CILS && (e.target.matches('input[data-cils-mode]') || e.target.matches('input[data-instr="pref"]'))) {
      const s = CILS.sets.find(x => x.id === docCurrent.set);
      if (s) setTimeout(() => cilsPrint(s, e.target.matches('[data-cils-mode]') ? Number(e.target.value) : docCurrent.solutions), 0);
    }
  });
  document.addEventListener('input', e => {
    const k = e.target.dataset?.cilsF;
    if (!k || !CILS) return;
    CILS.form[k] = e.target.value;
    cilsSave();
  });

  {
    const relayout = dlgRelayout;
    dlgRelayout = function () {
      const s = docCurrent?.kind === 'cils' && CILS && CILS.sets.find(x => x.id === docCurrent.set);
      return s ? cilsPrint(s, docCurrent.solutions) : relayout.apply(this, arguments);
    };
    const baseRender = render;
    render = function () {
      if (!session && view === 'cils') return cilsPage();
      return baseRender.apply(this, arguments);
    };
  }
  window.cilsSetsHTML = limit => ((CILS = CILS || cilsState()), cilsSetsHTML(limit));
}
