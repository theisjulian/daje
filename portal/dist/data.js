/* Redaktionell aufbereiteter Grundwortschatz (Primo anno, Anfang).
   Kapitelzuordnung: Ciao! sowie Unità 1, Approccio, 1A und 1B.
   Zusätzliche Beispielsätze und Definitionen sind eigene Übungsformulierungen. */
const GROUPS = [
  [
    'ciao',
    0,
    'Ciao!',
    `Ciao!|Hallo!;Servus!
i ragazzi|die Jugendlichen
mi chiamo|ich heiße
sono|ich bin
di|aus (Herkunft)
parlo|ich spreche
l’italiano|Italienisch
il francese|Französisch
e|und
il tedesco|Deutsch
l’inglese|Englisch
Salve!|Hallo!;Servus!
il sardo|Sardisch
Buongiorno!|Guten Tag!;Grüß Gott!
l’arabo|Arabisch
tu|du
Chi?|Wer?;Wen?
Chi sei?|Wer bist du?
Come?|Wie?
Come ti chiami?|Wie heißt du?
Di dove?|Woher?
Di dove sei?|Woher bist du?
Che?|Was?
la lingua|die Sprache
parli|du sprichst
Che lingue parli?|Welche Sprachen sprichst du?`
  ],
  [
    'approccio',
    1,
    'Unità 1 · Approccio',
    `benvenuto|willkommen
Ecco …!|Hier ist …!;Da sind …!
la piazza|der Platz (in einer Stadt)
il centro|das Zentrum
di|von (Genitiv)
il fiume|der Fluss
con|mit
il ponte|die Brücke
l’industria|die Industrie
è|er ist;sie ist;es ist
importante|wichtig
per|für
la città|die Stadt
il parco|der Park
Bellissimo!|Sehr schön!
il simbolo|das Symbol
lo stadio|das Stadion
Forza!|Auf geht’s!;Nur Mut!
l’amico|der Freund
l’amica|die Freundin
in|in
la via|die Straße
passeggiare|spazieren gehen
qui|hier
Grande!|Großartig!
la gelateria|die Eisdiele
Che …!|Was für …!;Wie …!
Che buono!|Wie lecker!;Wie gut!
il gelato|das Eis;die Eiscreme`
  ],
  [
    '1a',
    2,
    'Unità 1 · 1A',
    `abitare|wohnen
a|in;an;bei
lì|da;dort
incontrare|treffen
il ragazzo|der Junge
la ragazza|das Mädchen
adesso|jetzt
sì|ja
essere|sein
Piacere!|Angenehm!
anche|auch
il gatto|die Katze
si chiama|er heißt;sie heißt;es heißt
Come si chiama?|Wie heißt er?;Wie heißt sie?
non|nicht
stare bene|es geht gut
stare male|es geht schlecht
bene|gut
male|schlecht
vero?|nicht wahr?
È vero!|Das stimmt!
arrivare|ankommen
Come va?|Wie geht’s?;Wie geht es?
Ciao, bella!|Hallo Schöne!
tutto|alles
Tutto bene?!|Alles in Ordnung?!
Come stai?|Wie geht es dir?;Wie geht’s dir?
grazie|danke
ma|aber
Dove?|Wo?
Senti!|Hör mal!
la scuola|die Schule
Boh!|Keine Ahnung!;Ist mir egal!
il liceo|das Gymnasium
no|nein
Che bello!|Wie schön!
forse|vielleicht
la classe|die Klasse
insieme|zusammen;gemeinsam`
  ],
  [
    '1b',
    3,
    'Unità 1 · 1B',
    `il giro|die Rundfahrt;der Spaziergang
il quartiere|das Wohnviertel
oggi|heute
prendere|nehmen
la bicicletta|das Fahrrad
visitare|besichtigen
c’è|es gibt (Singular);da ist
ci sono|es gibt (Plural);da sind
il negozio|das Geschäft;der Laden
il papà|der Papa
fantastico|fantastisch
vendere|verkaufen
lo sport|der Sport
il calciatore|der Fußballer;der Fußballspieler
guardare|ansehen;schauen
spesso|oft
la partita|die Partie;das Spiel (Ballsport)
dopo|danach;dann
passare per|durchfahren;durchgehen
il campo|das Feld;das Spielfeld
il campo sportivo|der Sportplatz
la pista di skateboard|die Skaterbahn
il campo di calcio|der Fußballplatz
il campo di basket|der Basketballplatz
ideale|ideal
pattinare inline|inlineskaten
vedere|sehen;wahrnehmen
i pattini in linea|die Inlineskates
già|schon;bereits
tornare|zurückkehren;zurückkommen
poi|dann;danach
l’attrazione|die Attraktion
l’edificio|das Gebäude
il palazzo|der Palast
Come no?|Warum nicht?
in fondo|hinten;im Hintergrund
da|bei (einer Person)
Dai!|Los!
Ciao a tutti!|Hallo alle zusammen!`
  ]
];
const DETAILS = {
  'il gelato': {
    photo: 'gelato',
    def: 'È freddo e dolce. Lo compri in gelateria.',
    example: 'Prendo un gelato al cioccolato.'
  },
  'il gatto': {
    photo: 'gatto',
    def: 'È un animale domestico. Fa «miao».',
    example: 'Il gatto si chiama Leo.'
  },
  'la piazza': {
    photo: 'torino',
    def: 'È uno spazio aperto in città, con edifici intorno.',
    example: 'Ci incontriamo in piazza.'
  },
  'la bicicletta': {
    def: 'Ha due ruote. La usi per andare in giro.',
    example: 'Oggi prendo la bicicletta.'
  },
  'la scuola': {
    def: 'È il posto dove studi con la tua classe.',
    example: 'La scuola è in centro.'
  },
  'il fiume': { def: 'Il Po è un esempio.', example: 'Il fiume è vicino al parco.' },
  'il ponte': {
    def: 'Lo attraversi per andare da una parte all’altra del fiume.',
    example: 'Il ponte è in centro.'
  },
  'la gelateria': {
    def: 'È il negozio dove compri un gelato.',
    example: 'La gelateria è in piazza.'
  },
  'il parco': { def: 'È uno spazio verde in città, con alberi.', example: 'Passeggio nel parco.' },
  'il negozio': {
    def: 'È un posto dove puoi comprare qualcosa.',
    example: 'Il negozio è in Via Roma.'
  },
  'il calciatore': {
    def: 'È una persona che gioca a calcio.',
    example: 'Il calciatore guarda la partita.'
  },
  oggi: { def: 'Non ieri e non domani.', example: 'Oggi sono a Torino.' },
  spesso: { def: 'Non una volta sola: molte volte.', example: 'Guardo spesso una partita.' },
  insieme: { def: 'Non da soli: con un’altra persona.', example: 'Andiamo a scuola insieme.' },
  adesso: { def: 'In questo momento.', example: 'Adesso sono a scuola.' },
  grazie: { def: 'Lo dici quando qualcuno fa qualcosa per te.', example: 'Un gelato, grazie!' },
  'la città': {
    def: 'Torino, Roma e Milano sono esempi.',
    example: 'Torino è una città italiana.'
  },
  'il liceo': {
    def: 'È una scuola secondaria. Può essere classico o scientifico.',
    example: 'Sono al liceo Gioberti.'
  },
  abitare: { def: 'Vivere in un posto.', example: 'Abito a Torino.' },
  tornare: { def: 'Andare di nuovo nel posto da cui sei partito.', example: 'Torno a casa.' }
};
const WORDS = GROUPS.flatMap(([group, order, label, text]) =>
  text.split('\n').map((line, i) => {
    const [it, de] = line.split('|');
    return {
      id: `e1-${group}-${i + 1}`,
      it,
      de: de.split(';'),
      group,
      order,
      label,
      ...(DETAILS[it] || {})
    };
  })
);
const PHOTOS = {
  torino: {
    file: 'assets/torino.jpg',
    alt: 'Blick auf die Piazza Castello in Turin am Abend',
    title: 'Piazza Castello, Torino',
    author: 'Alexander Schimmeck',
    platform: 'Unsplash',
    source:
      'https://unsplash.com/photos/a-group-of-people-walking-down-a-street-next-to-tall-buildings-HuLnGguFGmI',
    license: 'Unsplash License',
    licenseUrl: 'https://unsplash.com/license',
    changes: 'Für die Anzeige skaliert und je nach Ansicht beschnitten.'
  },
  gelato: {
    file: 'assets/gelato.jpg',
    alt: 'Ein Eis in einer Waffel vor hellem Hintergrund',
    title: 'Cream Ice Cream in Cone',
    author: 'Somben Chea',
    platform: 'Pexels',
    source: 'https://www.pexels.com/photo/cream-ice-cream-in-cone-1294943/',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    changes: 'Für die Anzeige skaliert und je nach Ansicht beschnitten.'
  },
  gatto: {
    file: 'assets/gatto.jpg',
    alt: 'Porträt einer rot getigerten Hauskatze',
    title: 'Close-Up Portrait of Orange Tabby Cat',
    author: 'Michał Robak',
    platform: 'Pexels',
    source: 'https://www.pexels.com/photo/close-up-portrait-of-orange-tabby-cat-29796597/',
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    changes: 'Für die Anzeige skaliert und je nach Ansicht beschnitten.'
  }
};
const VERBS = {
  essere: ['sono', 'sei', 'è', 'siamo', 'siete', 'sono'],
  stare: ['sto', 'stai', 'sta', 'stiamo', 'state', 'stanno'],
  prendere: ['prendo', 'prendi', 'prende', 'prendiamo', 'prendete', 'prendono'],
  abitare: ['abito', 'abiti', 'abita', 'abitiamo', 'abitate', 'abitano'],
  parlare: ['parlo', 'parli', 'parla', 'parliamo', 'parlate', 'parlano']
};

// Sprachübergreifender Katalog: vorhandene IDs bleiben für gespeicherte Lernstände stabil.
const CONTENT_CATALOG = {
  schemaVersion: 2,
  languages: [
    { id: 'it', name: 'Italienisch', available: true },
    { id: 'fr', name: 'Französisch', available: false },
    { id: 'en', name: 'Englisch', available: false },
    { id: 'es', name: 'Spanisch', available: false }
  ],
  books: [
    {
      id: 'ecco-piu-1-9783060229062',
      language: 'it',
      name: 'Primo anno',
      availableSections: ['ciao', 'approccio', '1a', '1b']
    }
  ]
};
WORDS.forEach(w => {
  w.language = 'it';
  w.translationLanguage = 'de';
  w.bookId = 'ecco-piu-1-9783060229062';
  w.target = w.it;
  w.translations = w.de;
});

// Explicit grammar metadata; no gender guessed from an unknown ending.
WORDS.forEach(w => {
  const article = w.target.match(/^(il|lo|la|gli|le|i) /)?.[1];
  if (article) {
    w.grammar = {
      partOfSpeech: 'noun',
      gender: ['la', 'le'].includes(article) ? 'feminine' : 'masculine',
      article
    };
  }
  w.answerPolicy = { article: 'required', typo: 'hint' };
});
