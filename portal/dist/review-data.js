'use strict';
// Owner-private working catalogue.
const LISTENING_REVIEW_SEEDS = [
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'it-a2-hobby-interviste',
    title: 'Le attività dei ragazzi',
    language: 'it',
    level: 'A2',
    description: 'Brevi risposte sulle attività del tempo libero e sui loro vantaggi.',
    topics: ['vita quotidiana', 'tempo libero'],
    cover: 'wave',
    estimatedMinutes: 5,
    media: {
      type: 'youtube',
      videoId: 'DRzHA4LuFC0'
    },
    transcript:
      '[00:01] Come passi il tempo libero? Faccio sport o sto su internet, oppure guardo la televisione.\n[00:10] Facendo judo, uscendo con le amiche e facendo teatro.\n[00:15] Dove e per quante ore fai questa attività? Allo sport 5 ore a settimana, su internet e televisione 2 o 3 ore.\n[00:30] Al judo dedico più o meno 3 ore alla settimana, mentre per teatro le dedico 2 ore alla settimana.\n[00:39] Cioè, secondo te il tuo hobby oltre che piacevole è anche utile?\n[00:48] Lo sport può essere utile per migliorare la propria forma fisica, invece il computer e la televisione dipende per quale motivo, per quale scopo le usi.\n[01:00] Vabbè, certo, sono molto utili perché il judo è sempre un esercizio fisico, ti aiuta magari a superare le paure, a combattere, mentre il teatro ti fa perdere [01:19] eh... la paura di mostrarti di fronte ad altra gente.',
    sources: [
      {
        kind: 'external',
        citation:
          'Video auf YouTube',
        url: 'https://www.youtube.com/watch?v=DRzHA4LuFC0',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Redaktioneller Entwurf. Nicht am Audio geprüft. Transkript, Aufgabenlösungen, Zeitmarken, Medienlänge und Sprecherwechsel vor Freigabe überprüfen.',
      'GER A2 ist eine redaktionell noch zu prüfende Einschätzung. estimatedMinutes ist geschätzte Übungsdauer, keine gemessene Videolänge.',
      'Nutzungsrechte von Video und Transkript sowie Originalanbieter und Einbettbarkeit offen. needs_review verhindert die lokale Freigabe.',
      'Ausschnitt 00:58–01:20 laut Transkript.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Quale argomento viene affrontato nelle risposte?',
        options: [
          {
            id: 'a',
            text: 'I programmi per le vacanze.'
          },
          {
            id: 'b',
            text: 'Gli hobby e i loro vantaggi.'
          },
          {
            id: 'c',
            text: 'Le regole della scuola.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'Es geht um Freizeitaktivitäten, wie viel Zeit sie kosten und was sie bringen.'
      },
      {
        id: 'q2',
        type: 'short_answer',
        prompt: 'Quante ore alla settimana vengono dedicate al judo?',
        acceptedAnswers: [
          'tre',
          '3',
          'tre ore',
          '3 ore',
          'tre ore alla settimana',
          '3 ore alla settimana'
        ],
        modelAnswer: 'tre',
        explanation:
          'Etwa drei Stunden pro Woche. Die Zahl reicht als Antwort.'
      },
      {
        id: 'q3',
        type: 'true_false',
        prompt: 'Secondo una delle persone intervistate, il teatro aiuta a superare una paura.',
        answer: true,
        explanation:
          'Theater hilft gegen die Angst, sich vor anderen zu zeigen.'
      },
      {
        type: 'short_answer',
        prompt: 'Quante ore alla settimana vengono dedicate al teatro?',
        acceptedAnswers: ['due', '2', 'due ore', '2 ore'],
        modelAnswer: 'due',
        explanation:
          'Genannt werden zwei Stunden Theater pro Woche.',
        id: 'q4'
      },
      {
        type: 'true_false',
        prompt:
          'Secondo una delle persone, computer e televisione sono sempre utili, qualunque sia il loro uso.',
        answer: false,
        explanation:
          'Die Person schränkt ein, dass der Nutzen vom Zweck der Nutzung abhängt.',
        id: 'q5'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'it-a2-ordine-al-bar',
    title: 'Una richiesta in più',
    language: 'it',
    level: 'A2',
    description:
      'Un cliente ordina e precisa quello che desidera.',
    topics: ['al bar'],
    cover: 'wave',
    estimatedMinutes: 5,
    media: {
      type: 'youtube',
      videoId: 'wPkbySTrndI'
    },
    transcript:
      '[00:00] Buongiorno. Buongiorno. Un caffè per favore.\n[00:10] Ecco il caffè. Non bevo il caffè qui, prendo il caffè e vado via.\n[00:16] Ah, ho capito, vuole un caffè da portare via?\n[00:20] Sì, un caffè da portare via, per favore.\n[00:35] Prego.\n[00:38] Per favore, vorrei anche una...\n[00:43] una...\n[00:51] Ha una bustina di zucchero? Sì, una bustina di zucchero.',
    sources: [
      {
        kind: 'external',
        citation:
          'Video auf YouTube',
        url: 'https://www.youtube.com/watch?v=wPkbySTrndI',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Redaktioneller Entwurf. Nicht am Audio geprüft. Transkript, Aufgabenlösungen, Zeitmarken, Medienlänge und Sprecherwechsel vor Freigabe überprüfen.',
      'GER A2 ist eine redaktionell noch zu prüfende Einschätzung. estimatedMinutes ist geschätzte Übungsdauer, keine gemessene Videolänge.',
      'Nutzungsrechte von Video und Transkript sowie Originalanbieter und Einbettbarkeit offen. needs_review verhindert die lokale Freigabe.',
      'Ausschnitt 00:58–01:20 laut Transkript.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Che cosa vuole fare il cliente?',
        options: [
          {
            id: 'a',
            text: 'Bere il caffè al banco.'
          },
          {
            id: 'b',
            text: 'Portare via il caffè.'
          },
          {
            id: 'c',
            text: 'Cambiare il caffè con un tè.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'Die Person sagt „un caffè da portare via“.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'Il cliente vuole bere il caffè nel locale.',
        answer: false,
        explanation:
          'Im Dialog heißt es: „Non bevo il caffè qui“.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt: 'Che cosa viene nominato alla fine del dialogo?',
        acceptedAnswers: ['una bustina di zucchero', 'bustina di zucchero', 'una bustina'],
        modelAnswer: 'una bustina di zucchero',
        explanation:
          'Am Ende wird ein Zuckerpäckchen genannt.'
      },
      {
        type: 'short_answer',
        prompt: 'Quale bevanda ordina il cliente?',
        acceptedAnswers: ['un caffè', 'caffè', 'un caffe', 'caffe'],
        modelAnswer: 'un caffè',
        explanation:
          'Bestellt wird ein Kaffee. Auch „caffe“ ohne Akzent zählt hier.',
        id: 'q4'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'it-a2-tempo-libero-cinema',
    title: 'Una proposta per il pomeriggio',
    language: 'it',
    level: 'A2',
    description:
      'Un invito tra amici e un impegno da rispettare.',
    topics: ['vita quotidiana', 'tempo libero'],
    cover: 'wave',
    estimatedMinutes: 5,
    media: {
      type: 'youtube',
      videoId: 'DFo5qBbF_TU'
    },
    transcript:
      "Pronto? Ciao Paolo, sono Giulia. Ciao, come va? Bene, bene. Senti, vieni al cinema con noi oggi? Oggi? Noi chi? Siamo tutti noi: io, Alessia, Dino, e viene anche la nuova, Chiara. È simpatica, no? Sì, molto. Ma senti, che film è? L'ultimo con Orlando Bloom. Allora, vieni o no? A che ora comincia? Alle 6:00. Ahia! E quando finisce? Ma intorno alle 8:15. Perché? Non dirmi che hai allenamento anche oggi! Purtroppo sì. Ma come, non è anche oggi? Ormai lo sapete: sabato l'allenamento e domenica c'è la partita. Comunque io oggi finisco alle 7:30. Perché non andiamo al prossimo spettacolo alle 8:30? È tardi! Non puoi non andare per questa volta? Sì, per Orlando Bloom! Non per lui, per noi! Ma chi non va all'ultimo allenamento di solito non gioca alla partita! Dai, Giulia, un'altra volta. Scusa, sì. Va bene, ciao.",
    sources: [
      {
        kind: 'external',
        citation:
          'Video auf YouTube',
        url: 'https://www.youtube.com/watch?v=DFo5qBbF_TU',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Redaktioneller Entwurf. Nicht am Audio geprüft. Transkript, Aufgabenlösungen, Zeitmarken, Medienlänge und Sprecherwechsel vor Freigabe überprüfen.',
      'GER A2 ist eine redaktionell noch zu prüfende Einschätzung. estimatedMinutes ist geschätzte Übungsdauer, keine gemessene Videolänge.',
      'Nutzungsrechte von Video und Transkript sowie Originalanbieter und Einbettbarkeit offen. needs_review verhindert die lokale Freigabe.',
      'Ausschnitt 00:58–01:20 laut Transkript.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Che cosa propone Giulia a Paolo?',
        options: [
          {
            id: 'a',
            text: 'Andare al cinema con gli amici.'
          },
          {
            id: 'b',
            text: 'Preparare insieme un esame.'
          },
          {
            id: 'c',
            text: 'Guardare una partita alla televisione.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          'Die Einladung lautet: „vieni al cinema con noi oggi?“'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'Paolo ha un allenamento quel giorno.',
        answer: true,
        explanation:
          'Paolo bestätigt das Training.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt: 'Quale attore viene nominato?',
        acceptedAnswers: ['Orlando Bloom'],
        modelAnswer: 'Orlando Bloom',
        explanation:
          'Genannt wird Orlando Bloom.'
      },
      {
        type: 'short_answer',
        prompt: 'A che ora comincia il primo spettacolo proposto?',
        acceptedAnswers: ['alle sei', 'alle 18', 'alle 18:00', 'alle 6', '18', '18:00', '6', 'sei'],
        modelAnswer: 'alle sei',
        explanation:
          'Der erste Filmtermin ist um sechs Uhr am Abend.',
        id: 'q4'
      },
      {
        type: 'single_choice',
        prompt: 'Perché Paolo non vuole saltare l’ultimo allenamento?',
        options: [
          {
            id: 'a',
            text: 'Perché deve allenare gli amici.'
          },
          {
            id: 'b',
            text: 'Perché altrimenti di solito non gioca la partita.'
          },
          {
            id: 'c',
            text: 'Perché Giulia gli ha chiesto di allenarsi.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'Wer das letzte Training auslässt, spielt normalerweise nicht.',
        id: 'q5'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.2',
    kind: 'listening',
    id: 'it-a2-weekend-scena-tre',
    title: 'Un fine settimana in compagnia',
    language: 'it',
    level: 'A2',
    description:
      'Una persona racconta il proprio fine settimana. Solo scena 3, da 00:58 a 01:18 secondo i dati forniti; il lettore mostra il video intero.',
    topics: ['vita quotidiana', 'tempo libero'],
    cover: 'wave',
    estimatedMinutes: 4,
    media: {
      type: 'youtube',
      videoId: 'oLfYx4cgTMg',
      start: 58,
      end: 80
    },
    transcript:
      "[00:58] Come trascorre il fine settimana?\n[01:03] Frequento le amiche, usciamo insieme a cena, chiacchieriamo, beviamo del buon vino e ci divertiamo così. E poi, quando ho tempo, faccio anche un po' di sport:\n[01:14] corro e vado in bicicletta.",
    sources: [
      {
        kind: 'external',
        citation:
          'Video auf YouTube',
        url: 'https://www.youtube.com/watch?v=oLfYx4cgTMg',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Redaktioneller Entwurf. Nicht am Audio geprüft. Transkript, Aufgabenlösungen, Zeitmarken, Medienlänge und Sprecherwechsel vor Freigabe überprüfen.',
      'GER A2 ist eine redaktionell noch zu prüfende Einschätzung. estimatedMinutes ist geschätzte Übungsdauer, keine gemessene Videolänge.',
      'Nutzungsrechte von Video und Transkript sowie Originalanbieter und Einbettbarkeit offen. needs_review verhindert die lokale Freigabe.',
      'Ausschnitt 00:58–01:20 laut Transkript.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Come passa il fine settimana la persona che risponde?',
        options: [
          {
            id: 'a',
            text: 'Studia sempre da sola.'
          },
          {
            id: 'b',
            text: 'Lavora in un ristorante.'
          },
          {
            id: 'c',
            text: 'Esce con le amiche e, se ha tempo, fa sport.'
          }
        ],
        correctOptionId: 'c',
        explanation:
          'Genannt werden Freundinnen und Sport, wenn Zeit ist.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'Con le amiche esce a cena.',
        answer: true,
        explanation:
          'Im Text heißt es: „usciamo insieme a cena“.'
      },
      {
        id: 'q3',
        type: 'single_choice',
        prompt: 'Quali attività sportive vengono nominate?',
        options: [
          {
            id: 'a',
            text: 'Nuoto e tennis.'
          },
          {
            id: 'b',
            text: 'Corsa e bicicletta.'
          },
          {
            id: 'c',
            text: 'Calcio e pallavolo.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'Im Text heißt es: „corro e vado in bicicletta“.'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'it-a2-cucina-tiramisu',
    title: 'La spesa per il tiramisù',
    language: 'it',
    level: 'A2',
    description:
      'Zwei Personen planen ein Abendessen und kaufen die passenden Zutaten im Geschäft ein.',
    topics: ['cucina', 'alimentazione', 'acquisti'],
    cover: 'wave',
    estimatedMinutes: 7,
    media: {
      type: 'youtube',
      videoId: 'pW8Fuo1Oh-g'
    },
    transcript:
      "[00:07] In quanti siamo a cena?\n[00:09] Tu, io, Roberto, Marta e due amici di Roberto. Siamo in sei.\n[00:17] Cosa facciamo?\n[00:19] Antipasto, primo, secondo, dolce, una tipica cena italiana.\n[00:23] No, dai, quello che abbiamo deciso ieri: un piatto principale, un dolce. Entriamo.\n[00:35] Buongiorno. Buongiorno, cosa desiderate?\n[00:38] Vorremmo un chilo di farina, una scatola di pomodori e due mozzarelle,\n[00:48] anche un po' di lievito\n[00:53] e una bottiglia da mezzo litro di olio.\n[01:01] Vi occorre altro?\n[01:03] Sì, vorrei 6 uova e un chilo di zucchero,\n[01:12] poi un pacchetto di caffè, un po' di mascarpone.\n[01:23] Quanto mascarpone volete? Mezzo chilo per favore.\n[01:29] Nient'altro?\n[01:30] No grazie e basta così. Aspettate, abbiamo bisogno anche di un pacchetto di biscotti.\n[01:38] Quali volete? Vi piacciono questi biscotti? Vanno bene per il tiramisù?\n[01:39] Meglio questi, sono più spugnosi. Ah, anche un litro di latte per favore.\n[01:50] Quante sono? [Wortlaut unsicher] 23 euro e 15 centesimi in tutto.\n[01:59] Ecco 50 euro. Benissimo.\n[02:05] Ecco il resto, sono 26 euro e 85 centesimi. Grazie. Grazie a lei.\n[02:22] Arrivederci. Arrivederci. Buona giornata.",
    sources: [
      {
        kind: 'external',
        citation:
          'Loescher Editore video: Italiano per stranieri – Ti piace la cucina italiana? (YouTube)',
        url: 'https://www.youtube.com/watch?v=pW8Fuo1Oh-g',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Entwurf für die private Redaktionsvorschau. Transkript, Zeitmarken, Sprecherbezug und jede Lösung sind noch am Originalmedium zu prüfen.',
      'Nutzungsrechte von Medium und Transkript sowie Originalanbieter und Einbettbarkeit offen. Keine Freigabe.',
      'Niveau redaktionell vorläufig eingeschätzt; Übungsdauer geschätzt, keine gemessene Videodauer.',
      'Transkriptstelle „Quante sono?“ prüfen; keine stille Korrektur. Laut Gemini wechselnde manuelle und automatische Untertitel, genaue Herkunft offen.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Che cosa vogliono preparare i protagonisti per cena?',
        options: [
          {
            id: 'a',
            text: 'Una pizza e una bibita.'
          },
          {
            id: 'b',
            text: 'Un piatto principale e un dolce.'
          },
          {
            id: 'c',
            text: 'Solo un antipasto veloce.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'Im Gespräch wird vereinbart: „un piatto principale e un dolce“.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'Le persone a cena sono in sei in totale.',
        answer: true,
        explanation:
          'Es wird aufgezählt: Du, ich, Roberto, Marta und zwei Freunde, also insgesamt sechs Personen.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt: 'Quanto mascarpone comprano i ragazzi?',
        acceptedAnswers: [
          'mezzo chilo',
          'mezzo chilo per favore',
          'un mezzo chilo',
          '500 grammi',
          'cinquecento grammi',
          'mezzo chilo di mascarpone',
          '500 g',
          '0,5 kg',
          '0.5 kg'
        ],
        modelAnswer: 'mezzo chilo',
        explanation:
          'Auf die Frage der Verkäuferin antworten sie: „Mezzo chilo per favore“.'
      },
      {
        type: 'short_answer',
        prompt: 'Quante uova comprano?',
        acceptedAnswers: ['sei', '6', 'sei uova', '6 uova'],
        modelAnswer: 'sei',
        explanation:
          'Bestellt werden sechs Eier.',
        id: 'q4'
      },
      {
        type: 'true_false',
        prompt: 'I primi biscotti proposti vanno bene per il tiramisù.',
        answer: false,
        explanation:
          'Empfohlen wird stattdessen eine andere, saugfähigere Sorte.',
        id: 'q5'
      },
      {
        type: 'single_choice',
        prompt: 'Con quale banconota pagano?',
        options: [
          {
            id: 'a',
            text: 'Con una banconota da 20 euro.'
          },
          {
            id: 'b',
            text: 'Con una banconota da 100 euro.'
          },
          {
            id: 'c',
            text: 'Con una banconota da 50 euro.'
          }
        ],
        correctOptionId: 'c',
        explanation: 'Es heißt: „Ecco 50 euro“.',
        id: 'q6'
      },
      {
        type: 'short_answer',
        prompt: 'Quanto costa la spesa in tutto?',
        acceptedAnswers: [
          '23 euro e 15 centesimi',
          '23,15',
          '23.15',
          '23,15 euro',
          '23.15 euro',
          'ventitré euro e quindici centesimi'
        ],
        modelAnswer: '23 euro e 15 centesimi',
        explanation:
          'Der Gesamtbetrag ist 23 Euro und 15 Cent.',
        id: 'q7'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'it-a2-conoscere-italia',
    title: 'Città e luoghi da conoscere',
    language: 'it',
    level: 'B1',
    description:
      'Interviste su città e luoghi italiani.',
    topics: ['italia', 'viaggi', 'biografia'],
    cover: 'wave',
    estimatedMinutes: 5,
    media: {
      type: 'youtube',
      videoId: 'dK9KAT5BDBM', start: 0, end: 90
    },
    transcript:
      "[00:04] Quali sono secondo te le città più famose d'Italia all'estero? Beh, Roma, Venezia, Milano e Napoli credo, e anche Firenze.\n[00:12] Io, che sono una che gira parecchio all'estero, mi dicono sempre che le due città principali sono Venezia e Roma.\n[00:18] Però vedo che adesso sta cominciando a prendere piede anche la zona di Napoli e Pompei, e anche Torino a seguito delle Olimpiadi invernali.\n[00:30] Portofino. Sicuramente sì, Portofino, qualcosa in Toscana... tipo, vabbè, la Toscana la pianti [Wortlaut unsicher], sì, Siena.\n[00:42] E poi, secondo me, non è così, poi qualcosa della Sicilia... Ah, no, anche un po'... no, la Puglia, dov'è? La Casa [Wortlaut unsicher], Ostuni, Alberobello.\n[00:48] Io amo la parte amalfitana, dove c'è Amalfi, Positano, è veramente bella, tutte le spiagge con i sassi.\n[01:00] Sì, è una graziosa città ad esempio Udine, Verona, Parma.\n[01:08] Per gli studenti magari in Umbria, Perugia, Urbino, queste città dell'Italia centrale, i piccoli centri.\n[01:21] Si va in Umbria, in Toscana, in queste regioni un po' belle dove si mangia bene, ci sono questa storia bella, i paesaggi.\n[01:26] Quindi da Gubbio, la zona intorno al Lago Trasimeno...\n[01:30] Siena, Volterra, San Gimignano.",
    sources: [
      {
        kind: 'external',
        citation:
          "Loescher Editore video: Cosa conosci dell'Italia? (YouTube)",
        url: 'https://www.youtube.com/watch?v=dK9KAT5BDBM',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Entwurf für die private Redaktionsvorschau. Transkript, Zeitmarken, Sprecherbezug und jede Lösung sind noch am Originalmedium zu prüfen.',
      'Nutzungsrechte von Medium und Transkript sowie Originalanbieter und Einbettbarkeit offen. Keine Freigabe.',
      'Niveau redaktionell vorläufig eingeschätzt; Übungsdauer geschätzt, keine gemessene Videodauer.',
      'Ausschnitt (Beginn/Ende im Player gesetzt) stammt aus automatischen Zeitmarken: am Original prüfen.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Di che cosa parlano soprattutto le persone?',
        options: [
          {
            id: 'a',
            text: 'Di città e luoghi italiani conosciuti o consigliati.'
          },
          {
            id: 'b',
            text: 'Di come trovare un lavoro.'
          },
          {
            id: 'c',
            text: 'Di come preparare una cena.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          'Genannt werden bekannte Städte und Reiseziele.'
      },
      {
        id: 'q2',
        type: 'single_choice',
        prompt: 'Quali due città vengono indicate come principali all’estero?',
        options: [
          {
            id: 'a',
            text: 'Torino e Genova.'
          },
          {
            id: 'b',
            text: 'Venezia e Roma.'
          },
          {
            id: 'c',
            text: 'Bologna e Palermo.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'Bei 00:12: „le due città principali sono Venezia e Roma“.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt: 'Quale evento viene collegato alla notorietà di Torino?',
        acceptedAnswers: [
          'le Olimpiadi invernali',
          'Olimpiadi invernali',
          'i Giochi olimpici invernali'
        ],
        modelAnswer: 'le Olimpiadi invernali',
        explanation:
          'Bei 00:18 werden die Olympischen Winterspiele genannt.'
      },
      {
        type: 'single_choice',
        prompt: 'Quale zona dice di amare una delle persone intervistate?',
        options: [
          {
            id: 'a',
            text: 'La costa amalfitana.'
          },
          {
            id: 'b',
            text: 'Le Dolomiti.'
          },
          {
            id: 'c',
            text: 'La pianura padana.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          'Genannt wird die Gegend um Amalfi und Positano.',
        id: 'q4'
      },
      {
        type: 'true_false',
        prompt: 'Le persone parlano soltanto di grandi città, senza citare piccoli centri.',
        answer: false,
        explanation:
          'Genannt werden auch kleinere Orte wie Gubbio und Orte der Toskana.',
        id: 'q5'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'it-a2-vita-italia',
    title: 'Che cosa fai in Italia?',
    language: 'it',
    level: 'A2',
    description:
      'Persone diverse si presentano.',
    topics: ['vita quotidiana', 'lavoro', 'integrazione'],
    cover: 'wave',
    estimatedMinutes: 5,
    media: {
      type: 'youtube',
      videoId: '91fi6egFsyA', start: 30, end: 88
    },
    transcript:
      '[00:31] Mi chiamo di nome Mina. Sono marocchina di Casablanca. Sono arrivata in Italia nel 2000.\n[00:41] Mi chiamo Carola... ordenes [Wortlaut unsicher] di qua si dice Carola, ma da noi si dice Carola.\n[00:49] Io sono Santiago del Cile. [Wortlaut unsicher]\n[00:51] Mi chiamo Diamante, tutti mi chiamano così, però la vera pronuncia sarebbe [unverständlich], vengo da Lituania e il significato è sempre quello che è Diamante.\n[01:00] Mi chiamo Gislen F. [Wortlaut unsicher] del Marocco.\n[01:06] Quanti anni hai? Ho 28 anni.\n[01:09] Da quanto tempo sei in Italia? Sono qua dal 2009.\n[01:13] Che lavoro fai? Ho fatto sempre la badanti, adesso ho fatto due corsi, sono oss, operatore socio-sanitario.\n[01:22] Faccio lavori sporadici, sono più casalinga che mai.',
    sources: [
      {
        kind: 'external',
        citation:
          'Loescher Editore video: Che cosa fai in Italia? (YouTube)',
        url: 'https://www.youtube.com/watch?v=91fi6egFsyA',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Entwurf für die private Redaktionsvorschau. Transkript, Zeitmarken, Sprecherbezug und jede Lösung sind noch am Originalmedium zu prüfen.',
      'Nutzungsrechte von Medium und Transkript sowie Originalanbieter und Einbettbarkeit offen. Keine Freigabe.',
      'Niveau redaktionell vorläufig eingeschätzt; Übungsdauer geschätzt, keine gemessene Videodauer.',
      'Ausschnitt (Beginn/Ende im Player gesetzt) stammt aus automatischen Zeitmarken: am Original prüfen.',
      'Unklare Eigennamen und Sprecherwechsel. Altersfrage entfernt, da Person nicht zuverlässig identifiziert. Gesprochene Formen im Transkript nicht stillschweigend standardisieren.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Qual è il tema principale di questo estratto video?',
        options: [
          {
            id: 'a',
            text: 'La presentazione personale e la vita in Italia.'
          },
          {
            id: 'b',
            text: 'Come comprare un biglietto del treno.'
          },
          {
            id: 'c',
            text: "La storia dell'arte antica a Roma."
          }
        ],
        correctOptionId: 'a',
        explanation:
          'Die Personen stellen sich vor und berichten über ihr Leben und ihre Ankunft in Italien.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'Mina è arrivata in Italia nel 2000.',
        answer: true,
        explanation:
          'Mina sagt im Video: „sono arrivata in Italia nel 2000“.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt: 'Da quale città proviene Mina?',
        acceptedAnswers: ['Casablanca', 'da Casablanca', 'è di Casablanca', 'viene da Casablanca'],
        modelAnswer: 'Casablanca',
        explanation:
          'Mina stellt sich als Marokkanerin aus Casablanca vor.'
      },
      {
        type: 'short_answer',
        prompt: 'Quale anno viene citato nella risposta a «Da quanto tempo sei in Italia?»',
        acceptedAnswers: ['2009', 'dal 2009', 'duemilanove', 'dal duemilanove'],
        modelAnswer: 'dal 2009',
        explanation:
          'Nach dieser Frage heißt es: „Sono qua dal 2009“.',
        id: 'q4'
      },
      {
        type: 'single_choice',
        prompt: 'Quale qualifica professionale viene nominata nell’estratto?',
        options: [
          {
            id: 'a',
            text: 'Insegnante di scuola primaria.'
          },
          {
            id: 'b',
            text: 'Operatore socio-sanitario.'
          },
          {
            id: 'c',
            text: 'Guida turistica.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'OSS steht für operatore socio-sanitario.',
        id: 'q5'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'it-a2-roma-citta',
    title: 'Una passeggiata tra i monumenti',
    language: 'it',
    level: 'B1',
    description:
      'Un percorso tra alcuni monumenti di Roma.',
    topics: ['roma', 'viaggi', 'città'],
    cover: 'wave',
    estimatedMinutes: 7,
    media: {
      type: 'youtube',
      videoId: 'FaS5AIuXw_E', start: 0, end: 105
    },
    transcript:
      "[00:02] La monumentale scalinata di Trinità dei Monti, con i suoi 135 gradini, collega una delle piazze principali di Roma, Piazza di Spagna, con la chiesa francescana di Trinità dei Monti.\n[00:35] Dall'alto della chiesa di Trinità dei Monti si possono ammirare le affollate vie centrali della città, le fontane di Piazza di Spagna, le numerose cupole, i tetti e gli alti balconi.\n[00:53] Uno dei simboli di Roma: la settecentesca Fontana di Trevi, che unisce classicismo e barocco, è stata recentemente restaurata.\n[01:10] La leggenda dice che se un turista lancia una moneta voltato di spalle, ritornerà di sicuro a visitare la città eterna.\n[01:22] Il più bel resto dell'antichità romana è il Pantheon.\n[01:39] Piazza Navona è una delle più celebri piazze della città.",
    sources: [
      {
        kind: 'external',
        citation:
          'Loescher Editore video: Roma (YouTube)',
        url: 'https://www.youtube.com/watch?v=FaS5AIuXw_E',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Entwurf für die private Redaktionsvorschau. Transkript, Zeitmarken, Sprecherbezug und jede Lösung sind noch am Originalmedium zu prüfen.',
      'Nutzungsrechte von Medium und Transkript sowie Originalanbieter und Einbettbarkeit offen. Keine Freigabe.',
      'Niveau redaktionell vorläufig eingeschätzt; Übungsdauer geschätzt, keine gemessene Videodauer.',
      'Ausschnitt (Beginn/Ende im Player gesetzt) stammt aus automatischen Zeitmarken: am Original prüfen.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Che tipo di percorso presenta il testo?',
        options: [
          {
            id: 'a',
            text: 'Un giro tra monumenti e piazze.'
          },
          {
            id: 'b',
            text: 'Una visita a negozi di abbigliamento.'
          },
          {
            id: 'c',
            text: 'Un viaggio in treno fuori città.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          'Beschrieben werden mehrere Denkmäler und Plätze.'
      },
      {
        id: 'q2',
        type: 'short_answer',
        prompt: 'Quanti gradini ha la scalinata descritta?',
        acceptedAnswers: ['135', 'centotrentacinque', '135 gradini', 'centotrentacinque gradini'],
        modelAnswer: '135',
        explanation: 'Bei 00:02 werden 135 Stufen genannt.'
      },
      {
        id: 'q3',
        type: 'true_false',
        prompt: 'Secondo la leggenda, chi lancia una moneta nella fontana tornerà a Roma.',
        answer: true,
        explanation: 'Bei 01:10 wird die Legende von der Rückkehr nach Rom erklärt.'
      },
      {
        id: 'q4',
        type: 'short_answer',
        prompt: 'Quale monumento antico viene nominato dopo la Fontana di Trevi?',
        acceptedAnswers: ['il Pantheon', 'Pantheon'],
        modelAnswer: 'il Pantheon',
        explanation: 'Bei 01:22 folgt das Pantheon.'
      },
      {
        type: 'short_answer',
        prompt: 'Quale piazza collega la scalinata alla chiesa di Trinità dei Monti?',
        acceptedAnswers: ['Piazza di Spagna', 'la Piazza di Spagna', 'piazza Spagna'],
        modelAnswer: 'Piazza di Spagna',
        explanation: 'Genannt wird die Piazza di Spagna.',
        id: 'q5'
      },
      {
        type: 'true_false',
        prompt:
          'Secondo la leggenda, il turista lancia la moneta guardando direttamente la fontana.',
        answer: false,
        explanation:
          'Die Münze wirft man mit dem Rücken zur Fontana di Trevi.',
        id: 'q6'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'it-a2-informazioni-strada',
    title: 'Chiedere informazioni per strada',
    language: 'it',
    level: 'A2',
    description:
      'Kurzer, authentischer Dialog zum Thema Orientierung und Wegbeschreibung im städtischen Raum.',
    topics: ['orientamento', 'città', 'interazione'],
    cover: 'wave',
    estimatedMinutes: 2,
    media: {
      type: 'youtube',
      videoId: '-DpfIOInJfY'
    },
    transcript:
      "[00:00] Scusa, potresti dirmi dov'è la stazione per favore?\n[00:05] Certo, vai dritto e poi gira a sinistra.",
    sources: [
      {
        kind: 'external',
        citation:
          'Colibrì Corsi di lingua italiana: Chiedere informazioni per strada (YouTube)',
        url: 'https://www.youtube.com/watch?v=-DpfIOInJfY',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'Entwurf für die private Redaktionsvorschau. Transkript, Zeitmarken, Sprecherbezug und jede Lösung sind noch am Originalmedium zu prüfen.',
      'Nutzungsrechte von Medium und Transkript sowie Originalanbieter und Einbettbarkeit offen. Keine Freigabe.',
      'Niveau redaktionell vorläufig eingeschätzt; Übungsdauer geschätzt, keine gemessene Videodauer.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: "Che cosa chiede la persona all'inizio del video?",
        options: [
          {
            id: 'a',
            text: "Dov'è la stazione."
          },
          {
            id: 'b',
            text: 'Che ore sono.'
          },
          {
            id: 'c',
            text: 'Quanto costa un caffè.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          "Die Person fragt nach dem Weg zum Bahnhof („dov'è la stazione“)."
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'La risposta indica di andare prima dritto e poi a sinistra.',
        answer: true,
        explanation:
          'Die Anweisung lautet: „vai dritto e poi gira a sinistra“.'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'en-b1-carbon-footprint',
    title: 'Your Carbon Footprint Explained',
    language: 'en',
    level: 'B1',
    description:
      'Ein anschaulicher BBC-Erklärbeitrag zu den Ursachen des CO2-Fußabdrucks und Möglichkeiten zur Reduzierung im Alltag.',
    topics: ['environment', 'climate_change', 'lifestyle'],
    cover: 'wave',
    estimatedMinutes: 7,
    media: {
      type: 'youtube',
      videoId: 'a9yO-K8mwL0'
    },
    transcript:
      "[00:00:00] you know you should probably reduce it but what exactly is your carbon footprint\n[00:00:09] a carbon footprint refers to the total amount of greenhouse gases released into the earth's atmosphere as a result of the activities of an individual or an organization remember greenhouse gases trap heat inside the atmosphere and that's overheating the planet so if you want to work out your own carbon footprint you need to know the amount of greenhouse gases like carbon dioxide you're responsible for creating it's a difficult thing to measure precisely and there are different definitions about how best to calculate it but roughly speaking there's the direct impact of using energy when we travel or to power our homes and there's the indirect impact of the energy that's used to create all the things we use or consume in the developed world in particular transport is a big part of your carbon footprint cutting down on the use of petrol or diesel cars and taking fewer flights is one of the most effective ways of reducing it the place you live also contributes to your personal footprint it's important to make sure your home is heated or cooled efficiently and is well insulated the more you can use sustainable energy like solar or wind power the more you cut your emissions the stuff you use at home also adds to the problem all that plastic metal and cardboard takes a lot of energy to produce and dispose of so recycling can help reducing your carbon footprint but not as much as how you travel or heat and cool your home then there's your diet above all red meat makes your carbon footprint bigger because cows produce so much methane another greenhouse gas and huge numbers of trees are cut down to create pastures on which cattle can graze in the developing world polluting stoves are a real problem too so it's important to try to replace them with more efficient methods of cooking but overall people in poorer countries produce far smaller amounts of greenhouse gases than people in richer countries do so if you look at just what a country produces the average amount of carbon dioxide emissions per person in the united states is about 16.1 tonnes per year in china it's 7.1 tonnes and in the uk it's about 5.5 tonnes but in the democratic republic of congo it's only naught point nought three tonnes while in qatar which has a really small population but produces so much oil and gas it's 38.6 tonnes now that's just production it doesn't take account of all the other things we've talked about how much you consume but obviously the more money you have the more you tend to consume so if people in richer countries really want to reduce their carbon footprint they need to make huge changes in their lifestyles it can be done and new technologies to make things greener are coming on stream all the time but it is a reminder that the declared aim in many countries of going carbon neutral by the middle of this century means a revolution in the way we live",
    sources: [
      {
        kind: 'external',
        citation:
          'BBC News: Climate Change – Your carbon footprint explained (YouTube)',
        url: 'https://www.youtube.com/watch?v=a9yO-K8mwL0',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'In die private Arbeitsvorschau aufgenommen. Nicht unabhängig am Audio geprüft; Lösungen, Niveau, Zeitmarken, Quelle und Einbettbarkeit noch zu prüfen.',
      'Nutzungsrechte von Video und Transkript offen. Keine fachliche Freigabe. Die Quellen- und Prüfbehauptungen der Gemini-Ausgabe sind nicht unabhängig bestätigt.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'What is a carbon footprint according to the video?',
        options: [
          {
            id: 'a',
            text: 'The total amount of greenhouse gases released by an individual or organization.'
          },
          {
            id: 'b',
            text: 'The amount of electricity used by large factories overnight.'
          },
          {
            id: 'c',
            text: 'The physical space a person takes up on earth.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          'Der Beitrag definiert den Begriff zu Beginn als die Gesamtemissionen von Treibhausgasen durch Aktivitäten.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt:
          "Transport, such as driving petrol cars or taking flights, is a major part of a person's carbon footprint.",
        answer: true,
        explanation:
          'Im Beitrag wird genannt, dass der Verkehrsbereich und weniger Flüge eine der effektivsten Stellschrauben sind.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt:
          'Which specific type of meat is mentioned as having a particularly big impact on the carbon footprint?',
        acceptedAnswers: ['red meat', 'Red meat'],
        modelAnswer: 'red meat',
        explanation:
          'Der Beitrag hebt hervor, dass rotes Fleisch („red meat“) durch Methanemissionen der Kühe den Fußabdruck vergrößert.'
      },
      {
        type: 'single_choice',
        prompt: 'What is an indirect contribution to a carbon footprint?',
        options: [
          {
            id: 'a',
            text: 'The energy used to manufacture things we buy.'
          },
          {
            id: 'b',
            text: 'Only the fuel burned in our own car.'
          },
          {
            id: 'c',
            text: 'Only the electricity recorded on our own meter.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          'The talk distinguishes energy used to make products from energy we use directly.',
        id: 'q4'
      },
      {
        type: 'true_false',
        prompt:
          'The video says recycling reduces emissions more than changing how we travel and heat our homes.',
        answer: false,
        explanation:
          'Transport and heating/cooling have a greater impact than recycling.',
        id: 'q5'
      },
      {
        type: 'short_answer',
        prompt: 'Which greenhouse gas do cows produce, according to the video?',
        acceptedAnswers: ['methane'],
        modelAnswer: 'methane',
        explanation: 'The gas named is methane.',
        id: 'q6'
      },
      {
        type: 'single_choice',
        prompt: 'Why can per-person production figures give an incomplete picture?',
        options: [
          {
            id: 'a',
            text: 'They already include every imported product.'
          },
          {
            id: 'b',
            text: 'They leave out the wider impact of what people consume.'
          },
          {
            id: 'c',
            text: 'They count only the emissions from aircraft.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'The talk distinguishes production figures from consumption.',
        id: 'q7'
      },
      {
        type: 'true_false',
        prompt:
          'The video presents carbon neutrality as a change that requires only minor adjustments to daily life.',
        answer: false,
        explanation: 'The ending describes major changes to lifestyles.',
        id: 'q8'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'en-b2-secrets-learning-language',
    title: 'The Secrets of Learning a New Language',
    language: 'en',
    level: 'B2',
    description:
      'Lýdia Machová teilt in diesem TED-Talk effektive Methoden und Prinzipien für das erfolgreiche Erlernen von Fremdsprachen.',
    topics: ['education', 'languages', 'psychology'],
    cover: 'wave',
    estimatedMinutes: 25,
    media: {
      type: 'youtube',
      videoId: 'o_XVt5rdpFY'
    },
    transcript:
      "[00:13] i love learning foreign languages in fact i love it so much that i like to learn a new language\n[00:19] every two years currently working on my eighth one when people find out about me they always ask me how\n[00:25] do you do that what's your secret and to be honest for many years my answer would be i don't\n[00:30] know i simply love learning languages but people were never happy with that answer they wanted to know why they\n[00:37] are spending years trying to learn even one language never achieving fluency and here i come learning one language after\n[00:43] another they wanted to know the secret of polyglots people who speak a lot of languages and that made me\n[00:49] wonder too how do actually other polyglots do it what do we have in common and what is it that\n[00:55] enables us to learn languages so much faster than other people i decided to meet other people like me and\n[01:01] find it out the best place to meet a lot of polyglots is an event where hundreds of language lovers\n[01:08] meet in one place to practice their languages there are several of such polyglot events organized all around the world\n[01:14] and so i decided to go there and ask polyglots about the methods that they use and so i met\n[01:19] benny from ireland who told me that his method is to start speaking from day one he learns a few\n[01:26] phrases from a travel facebook and goes to meet native speakers and starts having conversations with them right away he\n[01:33] doesn't mind making even 200 mistakes a day because that's how he learns based on the feedback and the best\n[01:39] thing is he doesn't even need to travel a lot today because you can easily easily have conversations with native\n[01:44] speakers from the comfort of your living room using websites i also met lucas from brazil who had a really\n[01:50] interesting method to learn russian he simply added a hundred random russian speakers on skype as friends and then seriously\n[02:00] and then he opened a chat window with one of them and wrote hi in russian and the person replied\n[02:06] hi how are you lucas copied this and put it into a text window with another person and the person\n[02:12] replied i'm fine thank you and how are you lucas copied this back to the first person and in this\n[02:19] way he had two strangers have a conversation with each other without knowing about it and soon he would start\n[02:25] typing himself because he had so many of these conversations that he figure out how the russian conversation usually starts\n[02:31] what an ingenious method right and then i met polyglots who always start by imitating sounds of the language and\n[02:39] others who always learn the 500 most frequent words of the language and yet others who always start by reading\n[02:45] about the grammar if i asked a hundred different polyglots i heard a hundred different approaches to learning languages everybody\n[02:54] seems to have a unique way how they learn a language and yet we all come to the same result\n[02:59] of speaking several languages fluently and as i was listening to these polyglots telling me about their methods it suddenly\n[03:06] dawned on me the one thing we all have in common is that we simply found ways how to enjoy\n[03:15] the language learning process all of these polyglots were talking about language learning as if it was great fun you\n[03:21] should have seen their faces when they were showing me their colorful grammar charts and their carefully handmade flashcards and\n[03:28] their statistics about learning vocabulary using apps or even how they love to cook based on recipes in a foreign\n[03:34] language all of them use different methods but they always make sure it's something that they personally enjoy i realized\n[03:42] that this is actually how i learn languages myself when i was learning spanish i was bored with the text\n[03:48] in the textbook i mean who wants to read about jose asking about the directions to the train station right\n[03:54] i wanted to read harry potter instead because that was my favorite book as a child and i had read\n[03:59] it many times so i got the spanish translation of harry potter and started reading and sure enough i didn't\n[04:05] understand almost anything at the beginning but i kept on reading because i loved the book and by the end\n[04:10] of the book i was able to follow it almost without any problems and the same thing happened when i\n[04:15] was learning german i decided to watch france my favorite sitcom in german and again at the beginning it was\n[04:22] all just gibberish i didn't know where one word finished and another one started but i kept on watching every\n[04:27] day because it's friends i can watch it in any language i love it so much and after the second\n[04:32] or third season seriously the dialogue started to make sense i only realized this after meeting other polyglots we are\n[04:40] now geniuses and we have no shortcut to learning languages we simply found ways how to enjoy the process how\n[04:48] to turn language learning from a boring school subject into a pleasant activity which you don't mind doing every day\n[04:55] if you don't like writing words down on paper you can always type them in an app if you don't\n[04:59] like listening to boring textbook material find interesting content on youtube or in podcasts for any language if you're a\n[05:06] more introverted person and you can't imagine speaking to native speakers right away you can apply the method of self-talk\n[05:13] you can talk to yourself in the comfort of your room describing your plans for the weekend how your day\n[05:18] has been or even take a random picture from your phone and describe the picture to your imaginary friend this\n[05:25] is how polyglots learn languages and the best news is it's available to anyone who's willing to take the learning\n[05:32] into their own hands so meeting other polyglots helped me realize that it is really crucial to find enjoyment in\n[05:39] the process of learning languages but also that joy in itself is not enough if you want to achieve fluency\n[05:47] in a foreign language you'll also need to apply three more principles first of all you'll need effective methods if\n[05:55] you try to memorize a list of words for a test tomorrow the words will be stored in your short-term\n[06:00] memory and you'll forget them after a few days if you however want to keep words long term you need\n[06:06] to revise them in the course of a few days repeatedly using the so-called space repetition you can use apps\n[06:12] which are based on this system such as anki or memorize or you can write lists of words in a\n[06:17] notebook using the goldlist method which is also very popular with many polyglots if you're not sure which methods are\n[06:23] effective and what is available out there just check out polyglot's youtube channels and websites and get inspiration from them\n[06:30] if it works for them it will most probably work for you too the third principle to follow is to\n[06:37] create a system in your learning we're all very busy and no one really has time to learn a language\n[06:42] today but we can create that time if we just plan a bit ahead can you wake up 15 minutes\n[06:49] earlier than you normally do or that would be the perfect time to revise some vocabulary can you listen to\n[06:55] a podcast on your way to work while driving well that would be great to get some listening experience there\n[07:01] are so many things we can do without even planning that extra time such as listening to podcasts on our\n[07:07] way to work or doing our household chores the important thing is to create a plan in the learning i\n[07:12] will practice speaking every tuesday and thursday with a friend for 20 minutes i will listen to a youtube video\n[07:20] while having breakfast if you create a system in your learning you don't need to find that extra time because\n[07:26] it will become a part of your everyday life and finally if you want to learn a language fluently you\n[07:33] need also a bit of patience it's not possible to learn a language within two months but it's definitely possible\n[07:40] to make a visible improvement in two months if you learn in small chunks every day in a way that\n[07:45] you enjoy and there is nothing that motivates us more than our own success i vividly remember the moment when\n[07:53] i understood the first joke in german when watching friends i was so happy and motivated that i just kept\n[07:59] on watching that day two more episodes and as i kept watching i had more and more of those moments\n[08:05] of understanding these little victories and step by step i got to a level where i could use the language\n[08:11] freely and fluently to express anything this is a wonderful feeling i can't get enough of that feeling and that's\n[08:18] why i learn a language every two years so this is the whole polyglot secret find effective methods which you\n[08:24] can use systematically over the period of some time in a way which you enjoy and this is how polyglots\n[08:31] learn languages within months not years now some of you may be thinking that's all very nice to enjoy language\n[08:38] learning but isn't the real secret that you polyglots are just super talented and most of us aren't well there's\n[08:45] one thing i haven't told you about benny and lucas benny had 11 years of irish gaelic and five years\n[08:53] of german at school couldn't speak them at all when graduating up to the age of 21 he thought he\n[09:00] didn't have the language gene and he could not speak another language then he started to look for his way\n[09:06] of learning languages which was speaking to native speakers and getting feedback from them and today benny can easily have\n[09:13] a conversation in 10 languages lucas tried to learn english at school for 10 years he was one of the\n[09:21] worst students in class his friends even made fun of him gave him a russian textbook as a joke because\n[09:27] they thought he would never learn that language or any language and then lucas started to experiment with methods looking\n[09:33] for his own way to learn for example by having skype chat conversations with strangers and after just 10 years\n[09:42] lucas is able to speak 11 languages fluently does that sound like a miracle well i see such miracles every\n[09:51] single day as a language mentor i help people learn languages by themselves and i see this every day people\n[09:58] struggled with language learning for 5 10 even 20 years and then they suddenly take the learning into their own\n[10:05] hands start using materials which they enjoy more effective methods or they start tracking their learning so that they can\n[10:11] appreciate their fee their own progress and that's when suddenly they magically find the language talent that they were missing\n[10:19] all their lives so if you've also tried to learn a language and you gave up thinking it's too difficult\n[10:26] or you don't have the language talent give it another try maybe you're also just one enjoyable method away from\n[10:32] learning that language fluently maybe you're just one method away from becoming a polyglot thank\n[10:44] you",
    sources: [
      {
        kind: 'external',
        citation:
          'TED: The secrets of learning a new language – Lýdia Machová (YouTube)',
        url: 'https://www.youtube.com/watch?v=o_XVt5rdpFY',
        rights: 'needs_review'
      }
    ],
    reviewNotes: [
      'In die private Arbeitsvorschau aufgenommen. Nicht unabhängig am Audio geprüft; Lösungen, Niveau, Zeitmarken, Quelle und Einbettbarkeit noch zu prüfen.',
      'Nutzungsrechte von Video und Transkript offen. Keine fachliche Freigabe. Die Quellen- und Prüfbehauptungen der Gemini-Ausgabe sind nicht unabhängig bestätigt.',
      'Gemini nennt 10:46 Minuten Videolänge; Übungszeit vorläufig auf 20 Minuten gesetzt. Rohtext mit mutmaßlichen Erkennungsfehlern: travel facebook/phrasebook; france/Friends; now/no geniuses; space/spaced repetition; memorize/Memrise. Nicht stillschweigend als geprüft korrigiert.'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: "What is the main message of the talk?",
        options: [
          {
            id: 'a',
            text: 'Anyone can learn a language successfully by finding enjoyable methods and taking responsibility.'
          },
          {
            id: 'b',
            text: 'You can only learn a language fluently if you live abroad.'
          },
          {
            id: 'c',
            text: 'Grammar books are the only tool needed for fluency.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          'Der Vortrag betont, dass Freude am Prozess und eigene Strategien der Schlüssel zum Erfolg sind.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt:
          'According to the speaker, successful language learners enjoy the methods they use.',
        answer: true,
        explanation:
          'Polyglotte Personen machen das Lernen zu einem Teil ihres täglichen Vergnügens.'
      },
      {
        type: 'single_choice',
        prompt: 'How does Benny begin learning a language?',
        options: [
          {
            id: 'a',
            text: 'By avoiding conversations until he is fluent.'
          },
          {
            id: 'b',
            text: 'By speaking from the first day and using feedback.'
          },
          {
            id: 'c',
            text: 'By memorising a complete dictionary first.'
          }
        ],
        correctOptionId: 'b',
        explanation:
          'Benny speaks from day one and does not mind making mistakes.',
        id: 'q3'
      },
      {
        type: 'single_choice',
        prompt: 'What did Lucas initially do with messages from Russian speakers?',
        options: [
          {
            id: 'a',
            text: 'He translated each message into his first language.'
          },
          {
            id: 'b',
            text: 'He sent the same textbook exercise to everyone.'
          },
          {
            id: 'c',
            text: 'He passed replies between separate conversations.'
          }
        ],
        correctOptionId: 'c',
        explanation:
          'Lucas copied messages between two chat conversations.',
        id: 'q4'
      },
      {
        type: 'short_answer',
        prompt: 'Which book did the speaker read in Spanish?',
        acceptedAnswers: [
          'Harry Potter',
          'a Harry Potter book',
          'the Spanish translation of Harry Potter'
        ],
        modelAnswer: 'Harry Potter',
        explanation: 'She read Harry Potter in Spanish.',
        id: 'q5'
      },
      {
        type: 'true_false',
        prompt: 'The speaker understood the German sitcom easily from the first episode.',
        answer: false,
        explanation:
          'At first she could not tell where one word ended and the next began.',
        id: 'q6'
      },
      {
        type: 'single_choice',
        prompt: 'Why does the talk contrast a vocabulary test tomorrow with repeated revision?',
        options: [
          {
            id: 'a',
            text: 'To contrast short-term recall with longer-term retention.'
          },
          {
            id: 'b',
            text: 'To show that vocabulary should never be tested.'
          },
          {
            id: 'c',
            text: 'To argue that writing is always ineffective.'
          }
        ],
        correctOptionId: 'a',
        explanation:
          'Cramming for tomorrow fades; revising over several days (spaced repetition) lasts.',
        id: 'q7'
      },
      {
        type: 'short_answer',
        prompt:
          'Which learning technique does she suggest for someone not ready to speak to others?',
        acceptedAnswers: ['self-talk', 'self talk', 'talking to yourself', 'speaking to yourself'],
        modelAnswer: 'self-talk',
        explanation: 'She recommends self-talk: speaking to yourself.',
        id: 'q8'
      },
      {
        type: 'true_false',
        prompt: 'The speaker says enjoyment alone is enough to achieve fluency.',
        answer: false,
        explanation:
          'Besides enjoyment: effective methods, a system and patience.',
        id: 'q9'
      },
      {
        type: 'single_choice',
        prompt: 'What is the role of the final stories about Benny and Lucas?',
        options: [
          {
            id: 'a',
            text: 'They suggest that only successful school students become polyglots.'
          },
          {
            id: 'b',
            text: 'They show that travel is the only effective method.'
          },
          {
            id: 'c',
            text: 'They challenge the idea that early school failure proves a lack of language talent.'
          }
        ],
        correctOptionId: 'c',
        explanation:
          'Both struggled with languages at school before finding their own way.',
        id: 'q10'
      }
    ]
  }
];
