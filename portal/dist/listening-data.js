const LISTENING_SEEDS = [
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    id: 'en-voa-welcome',
    title: 'Nice to meet you, Anna',
    language: 'en',
    level: 'A1',
    description:
      'Ein kurzer Lerndialog mit echten Stimmen: Anna trifft Pete vor ihrer neuen Wohnung.',
    estimatedMinutes: 4,
    topics: ['introductions', 'spelling'],
    cover: 'wave',
    media: {
      type: 'audio',
      url: 'https://voa-audio.voanews.eu/vle/2016/02/08/49485bf8-4277-47f6-9abe-617ee2473f8c.mp3'
    },
    localMedia: 'assets/voa-welcome.mp3',
    transcript:
      'Pete: Hi! Are you Anna?\nAnna: Yes! Hi there! Are you Pete?\nPete: I am Pete.\nAnna: Nice to meet you.\nAnna: Let’s try that again. I’m Anna. Nice to meet you.\nPete: I’m Pete. “Anna” Is that A-N-A?\nAnna: No. A-N-N-A.\nPete: Well, Anna with two “n’s” ... Welcome to ... 1400 Irving Street!\nAnna: My new apartment! Yes!',
    vocabularyIds: [],
    sources: [
      {
        kind: 'external',
        citation:
          'VOA Learning English, Let’s Learn English Level 1, Lesson 1 Welcome, Conversation, 8. Februar 2016. Unveränderte Original-MP3, ca. 29 Sekunden. VOA nennt ausschließlich selbst produzierte Text-, Audio- und Videoinhalte Public Domain. Quellencredit: Voice of America / learningenglish.voanews.com. Aufgaben von Theis.',
        url: 'https://learningenglish.voanews.com/a/lets-learn-english-lesson-one/3111026.html',
        rights: 'cleared'
      }
    ],
    reviewNotes: [
      'Didaktisierter Lerndialog, kein spontanes Alltagsgespräch. A1 ist eine redaktionelle Einschätzung. Die Quelle nennt den Kurs Level 1.',
      'Nutzungsbedingungen: https://learningenglish.voanews.com/p/6021.html'
    ],
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Who does Anna meet?',
        options: [
          {
            id: 'a',
            text: 'Pete'
          },
          {
            id: 'b',
            text: 'Paul'
          },
          {
            id: 'c',
            text: 'Alex'
          }
        ],
        correctOptionId: 'a',
        explanation: 'The man introduces himself as Pete.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'Anna spells her name with two n’s.',
        answer: true,
        explanation: 'Anna spells her name A-N-N-A.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt: 'What is the house number?',
        acceptedAnswers: ['1400', 'fourteen hundred', 'one thousand four hundred'],
        modelAnswer: '1400',
        explanation: 'Pete welcomes Anna to 1400 Irving Street.'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.1',
    kind: 'listening',
    language: 'it',
    level: 'A1',
    estimatedMinutes: 5,
    sources: [
      {
        kind: 'own',
        citation:
          'Eigener Übungstext für die ripassà-Vorschau. Synthetische Wiedergabe durch die Browser-Sprachausgabe; keine authentische Aufnahme.',
        rights: 'own'
      }
    ],
    reviewNotes: [
      'Niveau ist eine redaktionelle Einschätzung. Browserstimmen unterscheiden sich nach Gerät.'
    ],
    vocabularyIds: [],
    id: 'it-torino-demo',
    title: 'Un pomeriggio a Torino',
    description:
      'Ein Treffpunkt, ein kleiner Umweg und ein Eis. Hör genau hin, was Sofia und Luca vorhaben.',
    cover: 'torino',
    topics: ['città', 'tempo libero'],
    media: {
      type: 'speech',
      text: 'Ciao, sono Sofia e abito a Torino. Oggi incontro il mio amico Luca in centro. Ci vediamo alle quattro in Piazza Castello. Prima andiamo in gelateria. Io prendo un gelato al limone e Luca un gelato al cioccolato. Poi andiamo al parco, vicino al fiume. Non prendiamo l’autobus: andiamo a piedi. Torno a casa alle sei.'
    },
    transcript:
      'Ciao, sono Sofia e abito a Torino. Oggi incontro il mio amico Luca in centro. Ci vediamo alle quattro in Piazza Castello. Prima andiamo in gelateria. Io prendo un gelato al limone e Luca un gelato al cioccolato. Poi andiamo al parco, vicino al fiume. Non prendiamo l’autobus: andiamo a piedi. Torno a casa alle sei.',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Dove si incontrano Sofia e Luca?',
        options: [
          {
            id: 'a',
            text: 'A scuola'
          },
          {
            id: 'b',
            text: 'In Piazza Castello'
          },
          {
            id: 'c',
            text: 'Alla stazione'
          }
        ],
        correctOptionId: 'b',
        explanation: 'Sofia dice: Ci vediamo alle quattro in Piazza Castello.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'Luca prende un gelato al limone.',
        answer: false,
        explanation: 'Sofia sceglie il limone; Luca sceglie il cioccolato.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt: 'A che ora torna a casa Sofia?',
        acceptedAnswers: ['alle sei', 'alle 18', 'alle 18:00', 'alle sei di sera'],
        modelAnswer: 'alle sei',
        explanation: 'Sofia conclude: Torno a casa alle sei.'
      },
      {
        id: 'q4',
        type: 'single_choice',
        prompt: 'Come vanno al parco?',
        options: [
          {
            id: 'a',
            text: 'A piedi'
          },
          {
            id: 'b',
            text: 'In autobus'
          },
          {
            id: 'c',
            text: 'In bicicletta'
          }
        ],
        correctOptionId: 'a',
        explanation: 'Sofia dice che non prendono l’autobus e vanno a piedi.'
      }
    ],
    vocabulary: [
      {
        id: 'incontrare',
        target: 'incontrare',
        translations: ['treffen', 'begegnen'],
        example: 'Oggi incontro un amico.',
        definition: 'Vedere una persona e passare del tempo con lei.'
      },
      {
        id: 'centro',
        target: 'il centro',
        translations: ['das Zentrum', 'die Innenstadt'],
        example: 'Ci vediamo in centro.',
        definition: 'La parte centrale di una città.',
        grammar: {
          partOfSpeech: 'noun',
          gender: 'masculine',
          article: 'il'
        },
        answerPolicy: {
          article: 'required',
          typo: 'hint'
        }
      },
      {
        id: 'gelateria',
        target: 'la gelateria',
        translations: ['die Eisdiele'],
        example: 'Andiamo in gelateria.',
        definition: 'Un negozio dove si compra il gelato.',
        grammar: {
          partOfSpeech: 'noun',
          gender: 'feminine',
          article: 'la'
        },
        answerPolicy: {
          article: 'required',
          typo: 'hint'
        }
      },
      {
        id: 'vicino',
        target: 'vicino a',
        translations: ['in der Nähe von', 'nahe bei'],
        example: 'Il parco è vicino al fiume.',
        definition: 'A poca distanza da un luogo.'
      },
      {
        id: 'fiume',
        target: 'il fiume',
        translations: ['der Fluss'],
        example: 'Il fiume attraversa la città.',
        definition: 'Un corso d’acqua naturale.',
        grammar: {
          partOfSpeech: 'noun',
          gender: 'masculine',
          article: 'il'
        },
        answerPolicy: {
          article: 'required',
          typo: 'hint'
        }
      },
      {
        id: 'a-piedi',
        target: 'a piedi',
        translations: ['zu Fuß'],
        example: 'Andiamo al parco a piedi.',
        definition: 'Camminando, senza usare un mezzo di trasporto.'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    language: 'it',
    level: 'A1',
    estimatedMinutes: 5,
    sources: [
      {
        kind: 'own',
        citation:
          'Eigener Übungstext für die ripassà-Vorschau. Synthetische Wiedergabe durch die Browser-Sprachausgabe; keine authentische Aufnahme.',
        rights: 'own'
      }
    ],
    reviewNotes: [
      'Niveau ist eine redaktionelle Einschätzung. Browserstimmen unterscheiden sich nach Gerät.'
    ],
    vocabularyIds: [],
    id: 'it-gelateria-demo',
    title: 'Due gusti, per favore',
    description: 'Was wird bestellt? Eine kurze Alltagssituation rund um eine gelateria.',
    cover: 'gelato',
    topics: ['cibo', 'acquisti'],
    media: {
      type: 'speech',
      text: 'Buongiorno! Vorrei un gelato piccolo con due gusti: fragola e cioccolato. Per mia sorella, invece, una coppetta al limone. Non vuole il cono. Quanto costa tutto? Sono cinque euro. Ecco dieci euro. Grazie, ecco il resto. Arrivederci!'
    },
    transcript:
      'Buongiorno! Vorrei un gelato piccolo con due gusti: fragola e cioccolato. Per mia sorella, invece, una coppetta al limone. Non vuole il cono. Quanto costa tutto? Sono cinque euro. Ecco dieci euro. Grazie, ecco il resto. Arrivederci!',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Quanti gusti vuole la prima persona?',
        options: [
          {
            id: 'a',
            text: 'Uno'
          },
          {
            id: 'b',
            text: 'Due'
          },
          {
            id: 'c',
            text: 'Tre'
          }
        ],
        correctOptionId: 'b',
        explanation: 'Chiede un gelato piccolo con due gusti.'
      },
      {
        id: 'q2',
        type: 'true_false',
        prompt: 'La sorella vuole un cono.',
        answer: false,
        explanation: 'La sorella vuole una coppetta e non il cono.'
      },
      {
        id: 'q3',
        type: 'short_answer',
        prompt: 'Quanto costa tutto?',
        acceptedAnswers: ['cinque euro', '5 euro', 'cinque', '5'],
        modelAnswer: 'cinque euro',
        explanation: 'Il totale indicato è di cinque euro.'
      }
    ]
  },
  {
    format: 'theis-learning-package',
    schemaVersion: '1.0',
    kind: 'listening',
    language: 'en',
    level: 'A2',
    estimatedMinutes: 5,
    sources: [
      {
        kind: 'own',
        citation:
          'Eigener Übungstext für die ripassà-Vorschau. Synthetische Wiedergabe durch die Browser-Sprachausgabe; keine authentische Aufnahme.',
        rights: 'own'
      }
    ],
    reviewNotes: [
      'Niveau ist eine redaktionelle Einschätzung. Browserstimmen unterscheiden sich nach Gerät.'
    ],
    vocabularyIds: [],
    id: 'en-weekend-demo',
    title: 'A change of plans',
    description: 'A weekend plan changes. Find out where the friends go and what they take.',
    cover: 'wave',
    topics: ['weekend', 'plans'],
    media: {
      type: 'speech',
      text: 'Hi, I’m Alex. On Saturday, my friend Jamie and I want to ride our bikes to the lake. But in the morning it starts to rain. We decide to visit the city museum instead. We meet at the bus stop at ten thirty. Jamie brings two sandwiches and I bring some water. After the museum, we call our friend Sam. Sam is at home and joins us for lunch.'
    },
    transcript:
      'Hi, I’m Alex. On Saturday, my friend Jamie and I want to ride our bikes to the lake. But in the morning it starts to rain. We decide to visit the city museum instead. We meet at the bus stop at ten thirty. Jamie brings two sandwiches and I bring some water. After the museum, we call our friend Sam. Sam is at home and joins us for lunch.',
    questions: [
      {
        id: 'q1',
        type: 'single_choice',
        prompt: 'Where do Alex and Jamie go?',
        options: [
          {
            id: 'a',
            text: 'To the lake'
          },
          {
            id: 'b',
            text: 'To the city museum'
          },
          {
            id: 'c',
            text: 'To Sam’s house'
          }
        ],
        correctOptionId: 'b',
        explanation: 'Because it rains, they visit the city museum instead.'
      },
      {
        id: 'q2',
        type: 'short_answer',
        prompt: 'What does Alex bring?',
        acceptedAnswers: ['water', 'some water'],
        modelAnswer: 'water',
        explanation: 'Jamie brings sandwiches; Alex brings water.'
      },
      {
        id: 'q3',
        type: 'true_false',
        prompt: 'Sam visits the museum with them.',
        answer: false,
        explanation: 'They call Sam after the museum. Sam joins them for lunch.'
      }
    ]
  }
];
