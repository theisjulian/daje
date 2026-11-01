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
  const by = (map, level) => map[level] ?? map['*'];
  const opts = { A1: 3, A2: 3, '*': 4 };
  const domande = { A1: 4, A2: 4, B1: 6, B2: 6, C1: 7, C2: 8 };
  const lungo = { A1: '100–140', A2: '150–200', B1: '250–350', B2: '350–450', C1: '450–600', C2: '600–750' };
  const info = { B1: [10, 5], B2: [12, 6], C1: [12, 6], C2: [14, 7] };
  const TEMPI = {
    A1: 'presente indicativo, anche verbi irregolari frequenti (essere, avere, andare, fare, volere, potere, dovere, sapere, dire, venire, uscire)',
    A2: 'passato prossimo (scelta dell’ausiliare, accordo del participio, verbi riflessivi); qualche imperfetto in forme frequenti',
    B1: 'passato prossimo, imperfetto, trapassato prossimo, futuro semplice, condizionale presente, imperativo; congiuntivo presente solo in forme frequenti',
    B2: 'tutti i tempi dell’indicativo, condizionale presente e passato, congiuntivo presente, passato e imperfetto, periodo ipotetico',
    C1: 'tutti i tempi e modi, anche congiuntivo trapassato, concordanza dei tempi, forme implicite (gerundio, participio, infinito passato), forma passiva',
    C2: 'tutti i tempi e modi, anche passato remoto e trapassato remoto, forme implicite e passive, concordanza complessa, registro formale e letterario'
  };

  /*
   * Katalog der Aufgabentypen. levels: für welche Niveaus der Typ in den CILS-Heften vorkommt.
   * spec(level): Vorgaben, die in den Auftrag an die KI wandern (eine Quelle für alle Zahlen).
   * media: Hörtext kommt von der Lehrkraft (Transkript Pflicht).
   */
  const TYPES = [
    {
      id: 'asc-scelta', part: 'ascolto', media: true, levels: LEVELS,
      it: 'Scelta multipla', de: 'Fragen mit Auswahlantworten zum gehörten Text',
      spec: l => ({ esercizi: 1, domande: by(domande, l), opzioni: by(opts, l) })
    },
    {
      id: 'asc-info', part: 'ascolto', media: true, levels: ['B1', 'B2', 'C1', 'C2'],
      it: 'Individuare le informazioni presenti', de: 'Aus einer Liste die Aussagen wählen, die im Hörtext vorkommen',
      spec: l => ({ esercizi: 1, affermazioni: info[l][0], presenti: info[l][1] })
    },
    {
      id: 'asc-completa', part: 'ascolto', media: true, levels: ['A1', 'A2'],
      it: 'Completare il testo', de: 'Lückentext zum Gehörten: einzelne, gut hörbare Wörter ergänzen',
      spec: l => ({ esercizi: 1, lacune: l === 'A1' ? 10 : 14 })
    },
    {
      id: 'asc-brevi', part: 'ascolto', media: true, levels: ['A1', 'A2'],
      it: 'Testi brevi', de: 'Mehrere kurze Hörtexte, zu jedem genau eine zutreffende Aussage',
      spec: () => ({ esercizi: 1, opzioni: 3 })
    },
    {
      id: 'let-scelta', part: 'lettura', levels: LEVELS,
      it: 'Testo con domande a scelta multipla', de: 'Lesetext mit Auswahlfragen',
      spec: l => ({ parole: by(lungo, l), domande: by(domande, l), opzioni: by(opts, l) })
    },
    {
      id: 'let-info', part: 'lettura', levels: ['B1', 'B2', 'C1', 'C2'],
      it: 'Individuare le informazioni presenti', de: 'Aus einer Liste die Aussagen wählen, die im Text stehen',
      spec: l => ({ parole: by(lungo, l), affermazioni: info[l][0], presenti: info[l][1] })
    },
    {
      id: 'let-ricostruisci', part: 'lettura', levels: ['B1', 'B2', 'C1', 'C2'],
      it: 'Ricostruzione del testo', de: 'Textabschnitte in die richtige Reihenfolge bringen',
      spec: l => ({ parole: by(lungo, l), parti: { B1: 6, B2: 7, C1: 8, C2: 8 }[l] })
    },
    {
      id: 'let-brevi', part: 'lettura', levels: ['A1', 'A2'],
      it: 'Testi brevi', de: 'Vier kurze Gebrauchstexte, zu jedem genau eine zutreffende Aussage',
      spec: () => ({ testi: 4, parole: '25–45 per testo', opzioni: 3 })
    },
    {
      id: 'let-abbina', part: 'lettura', levels: ['A1', 'A2'],
      it: 'Inizi e fini', de: 'Vier Textanfänge, acht Fortsetzungen: die passenden zuordnen',
      spec: () => ({ inizi: 4, fini: 8 })
    },
    {
      id: 'str-articoli', part: 'strutture', levels: ['A1'],
      it: 'Articoli determinativi', de: 'Lückentext mit bestimmten Artikeln',
      spec: () => ({ lacune: 10 })
    },
    {
      id: 'str-aggettivi', part: 'strutture', levels: ['A2'],
      it: 'Accordo degli aggettivi', de: 'Adjektive in der richtigen Form (Grundform in Klammern)',
      spec: () => ({ lacune: 10 })
    },
    {
      id: 'str-verbi', part: 'strutture', levels: LEVELS,
      it: 'Forme verbali', de: 'Verben in der passenden Zeit und im passenden Modus (Infinitiv in Klammern)',
      spec: l => ({ lacune: { A1: 10, A2: 10, B1: 12, B2: 12, C1: 14, C2: 15 }[l], tempi: TEMPI[l] })
    },
    {
      id: 'str-scelta', part: 'strutture', levels: LEVELS,
      it: 'Completamento a scelta multipla', de: 'Lückentext, je Lücke eine von mehreren Möglichkeiten',
      spec: l => ({ lacune: { A1: 8, A2: 9, B1: 10, B2: 12, C1: 14, C2: 15 }[l], opzioni: by(opts, l) })
    },
    {
      id: 'str-parola', part: 'strutture', levels: ['B1', 'B2', 'C1', 'C2'],
      it: 'Completare con la parola mancante', de: 'Offener Lückentext: Präpositionen, Pronomen, Artikel, Konnektoren',
      spec: l => ({ lacune: { B1: 10, B2: 12, C1: 14, C2: 15 }[l] })
    },
    {
      id: 'str-pronomi', part: 'strutture', levels: ['A2', 'B1', 'B2'],
      it: 'Pronomi', de: 'Pronomen ergänzen (direkt, indirekt, kombiniert, ci und ne, Relativpronomen)',
      spec: l => ({ lacune: { A2: 8, B1: 10, B2: 12 }[l] })
    },
    {
      id: 'str-situazioni', part: 'strutture', levels: ['B1', 'B2', 'C1', 'C2'],
      it: 'Espressioni e situazioni comunicative', de: 'Zu jeder Äußerung die passende Gesprächssituation wählen',
      spec: l => ({ espressioni: { B1: 6, B2: 8, C1: 8, C2: 10 }[l], opzioni: 4 })
    },
    {
      id: 'str-trasforma', part: 'strutture', levels: ['B2', 'C1', 'C2'],
      it: 'Trasformazione di frasi', de: 'Sätze umformen (Passiv, indirekte Rede, implizit/explizit, Nominalisierung)',
      spec: l => ({ frasi: { B2: 6, C1: 8, C2: 10 }[l] })
    },
    {
      id: 'str-registro', part: 'strutture', levels: ['C1', 'C2'],
      it: 'Lessico e registro', de: 'Ausdruck durch gleichbedeutenden ersetzen (Synonyme, formelles Register)',
      spec: l => ({ frasi: { C1: 8, C2: 10 }[l], opzioni: 4 })
    },
    {
      id: 'scr-testo', part: 'scrittura', levels: LEVELS,
      it: 'Testo descrittivo, narrativo o argomentativo', de: 'Schreibaufgabe 1: beschreiben, erzählen, ab B2 auch argumentieren',
      spec: l => ({ compiti: '1–3', parole: { A1: '30–50', A2: '50–70', B1: '100–120', B2: '120–180', C1: '180–220', C2: '250–300' }[l] })
    },
    {
      id: 'scr-lettera', part: 'scrittura', levels: LEVELS,
      it: 'Lettera, e-mail o messaggio', de: 'Schreibaufgabe 2: Nachricht, Mail oder Brief (ab B2 auch formell)',
      spec: l => ({ compiti: '1–3', parole: { A1: '20–40', A2: '35–50', B1: '50–80', B2: '80–100', C1: '120–150', C2: '150–200' }[l], registro: ['A1', 'A2', 'B1'].includes(l) ? 'informale' : 'informale o formale' })
    },
    {
      id: 'ora-dialogo', part: 'orale', levels: LEVELS,
      it: 'Conversazione e gioco di ruolo', de: 'Situationen für das Gespräch mit der Lehrkraft, mit Redemitteln',
      spec: () => ({ situazioni: 3, spunti: '4–6' })
    },
    {
      id: 'ora-monologo', part: 'orale', levels: LEVELS,
      it: 'Monologo', de: 'Kurzvortrag zu einem Thema oder Impuls, mit Leitfragen',
      spec: l => ({ argomenti: 3, spunti: '4–6', durata: ['A1', 'A2'].includes(l) ? '1–2 minuti' : ['B1', 'B2'].includes(l) ? '2–3 minuti' : '3–4 minuti' })
    }
  ];
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
  function infoQ(list, verb) {
    const a = arr(list).map(x => ({ text: tidy(x.testo || x), on: x.presente === true }));
    need(a.length >= 4 && a.length <= 14, 'Bitte 4 bis 14 Aussagen (affermazioni).');
    const right = a.filter(x => x.on).length;
    need(right >= 1 && right < a.length, 'Mindestens eine Aussage muss im Text vorkommen und mindestens eine nicht.');
    const options = a.map((x, i) => ({ id: 'o' + (i + 1), text: x.text }));
    return {
      id: 'q1',
      type: 'multiple_choice',
      prompt: `${verb} Scegli le ${right} informazioni presenti nel testo.`,
      promptHelp: `Wähle die ${right} Aussagen, die im Text vorkommen.`,
      options,
      correctOptionIds: options.filter((o, i) => a[i].on).map(o => o.id)
    };
  }
  function openGaps(x, c, help) {
    const g = gaps(x.testo, 'fill', c.seed);
    return { questions: [{ id: 'q1', type: 'gap_fill', prompt: tidy(x.consegna || 'Completa il testo.'), promptHelp: help, text: g.text, gaps: g.gaps }] };
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
          prompt: s(`${tidy(y.consegna)} (${words} parole)`, 1000),
          modelAnswer: s(tidy(y.modello), 2000),
          lines: Math.min(15, Math.max(6, Math.round((parseInt(words.split('–').pop(), 10) || 80) / 10)))
        };
        if (arr(y.criteri).length) q.explanation = s('Controlla: ' + arr(y.criteri).map(tidy).join(' · '), 1500);
        return help1(q, i, 'Schreibe den Text. Vergleiche danach mit dem Mustertext und der Checkliste.');
      })
    };
  }

  // Baustein je Typ: aus einer Übung der KI-Antwort die Felder des Pakets
  const BUILD = {
    'asc-scelta': x => ({ questions: mcList(x.domande, 'Hör den Text. Wähle jeweils die richtige Antwort.') }),
    'asc-info': x => ({ questions: [infoQ(x.affermazioni, 'Ascolta il testo.')] }),
    'asc-completa': (x, c) => {
      const g = gaps(x.testo, 'fill', c.seed);
      return { questions: [{ id: 'q1', type: 'gap_fill', prompt: tidy(x.consegna || 'Ascolta il testo e completa con le parole che mancano.'), promptHelp: 'Hör den Text. Ergänze die fehlenden Wörter.', text: g.text, gaps: g.gaps }] };
    },
    'asc-brevi': x => {
      const t = arr(x.testi);
      need(t.length >= 2, 'Bitte mindestens zwei Kurztexte (testi).');
      return { questions: t.map((y, i) => help1(choice('q' + (i + 1), `Testo ${y.numero || i + 1}: scegli l’informazione presente nel testo.`, y.opzioni, y.giusta), i, 'Wähle zu jedem Text die Information, die vorkommt.')) };
    },
    'let-scelta': x => ({ reading: { title: tidy(x.titolo), text: tidy(x.testo) }, questions: mcList(x.domande, 'Lies den Text. Wähle jeweils die richtige Antwort.') }),
    'let-info': x => ({ reading: { title: tidy(x.titolo), text: tidy(x.testo) }, questions: [infoQ(x.affermazioni, 'Leggi il testo.')] }),
    'let-ricostruisci': x => {
      const p = arr(x.parti).map(tidy).filter(Boolean);
      need(p.length >= 3 && p.length <= 8, 'Bitte 3 bis 8 Textabschnitte (parti).');
      return {
        questions: [{ id: 'q1', type: 'ordering', prompt: tidy(x.consegna || 'Ricostruisci il testo: metti le parti nell’ordine giusto.') + (x.titolo ? ` (${tidy(x.titolo)})` : ''), promptHelp: 'Bring die Textabschnitte in die richtige Reihenfolge.', items: p.map((t, i) => ({ id: 'p' + (i + 1), text: s(t, 300) })) }]
      };
    },
    'let-brevi': x => {
      const t = arr(x.testi);
      need(t.length >= 2, 'Bitte mindestens zwei Kurztexte (testi).');
      return {
        reading: { title: tidy(x.titolo || ''), text: t.map((y, i) => `${i + 1}. ${tidy(y.titolo)}\n${tidy(y.testo)}`).join('\n\n') },
        questions: t.map((y, i) => help1(choice('q' + (i + 1), `Testo ${i + 1}${y.titolo ? ' · ' + tidy(y.titolo) : ''}: scegli l’informazione presente nel testo.`, y.opzioni, y.giusta), i, 'Wähle zu jedem Text die Information, die darin steht.'))
      };
    },
    'let-abbina': x => {
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
        questions: [{ id: 'q1', type: 'matching', prompt: ('Leggi i testi. Scegli la parte che completa ogni testo. ' + (distractors.length ? distractors.length + ' parti non servono.' : '')).trim(), promptHelp: 'Ordne jedem Textanfang die passende Fortsetzung zu. Einige Fortsetzungen bleiben übrig.', pairs, distractors }]
      };
    },
    'str-articoli': (x, c) => openGaps(x, c, 'Ergänze die bestimmten Artikel.'),
    'str-aggettivi': (x, c) => openGaps(x, c, 'Ergänze die Adjektive in der richtigen Form.'),
    'str-verbi': (x, c) => openGaps(x, c, 'Ergänze die Verben in der passenden Form.'),
    'str-parola': (x, c) => openGaps(x, c, 'Ergänze jeweils ein passendes Wort.'),
    'str-pronomi': (x, c) => openGaps(x, c, 'Ergänze die passenden Pronomen.'),
    'str-scelta': (x, c) => {
      const g = gaps(x.testo, 'choice', c.seed);
      return { questions: [{ id: 'q1', type: 'gap_choice', prompt: tidy(x.consegna || 'Completa il testo. Scegli una delle proposte.'), promptHelp: 'Ergänze den Text. Wähle jeweils die passende Möglichkeit.', text: g.text, gaps: g.gaps }] };
    },
    'str-situazioni': x => {
      const e = arr(x.espressioni);
      need(e.length, 'Keine Äußerungen (espressioni) gefunden.');
      return { questions: e.map((y, i) => help1(choice('q' + (i + 1), `«${tidy(y.espressione).replace(/^[«"“]+|[»"”]+$/g, '')}»`, y.opzioni, y.giusta), i, 'In welcher Situation sagt man das? Wähle die passende Situation.')) };
    },
    'str-trasforma': x => {
      const f = arr(x.frasi);
      need(f.length, 'Keine Sätze (frasi) gefunden.');
      return {
        questions: f.map((y, i) => {
          const sol = arr(y.soluzioni).map(tidy).filter(Boolean);
          need(sol.length, `Satz ${i + 1}: Lösung (soluzioni) fehlt.`);
          return help1({ id: 'q' + (i + 1), type: 'short_answer', prompt: s(`${tidy(y.istruzione)}: ${tidy(y.frase)}`, 1000), acceptedAnswers: sol.slice(0, 8), modelAnswer: sol[0] }, i, 'Forme den Satz wie angegeben um.');
        })
      };
    },
    'str-registro': x => {
      const f = arr(x.frasi);
      need(f.length, 'Keine Sätze (frasi) gefunden.');
      return { questions: f.map((y, i) => help1(choice('q' + (i + 1), tidy(y.frase).replace(/\*([^*]+)\*/g, '«$1»'), y.opzioni, y.giusta), i, 'Wähle den Ausdruck, der den markierten am besten ersetzt.')) };
    },
    'scr-testo': writing,
    'scr-lettera': writing,
    'ora-dialogo': x => {
      const t = arr(x.situazioni);
      need(t.length, 'Keine Situationen (situazioni) gefunden.');
      return { questions: t.slice(0, 4).map((y, i) => help1({ id: 'q' + (i + 1), type: 'open_answer', prompt: s(`Situazione ${i + 1}: ${tidy(y.situazione || y)}`, 1000), modelAnswer: s(arr(y.spunti).map(tidy).join('\n'), 2000), lines: 4 }, i, 'Rollenspiel: Die Lehrkraft übernimmt die andere Rolle.')) };
    },
    'ora-monologo': (x, c) => {
      const t = arr(x.argomenti);
      need(t.length, 'Keine Themen (argomenti) gefunden.');
      return { questions: t.slice(0, 4).map((y, i) => help1({ id: 'q' + (i + 1), type: 'open_answer', prompt: s(`Argomento ${i + 1}: ${tidy(y.argomento || y)}${y.stimolo ? '\n' + tidy(y.stimolo) : ''}\nParla per ${c.spec.durata}.`, 1000), modelAnswer: s(arr(y.spunti).map(tidy).join('\n'), 2000), lines: 4 }, i, 'Kurzvortrag: Bereite dich mit den Leitfragen vor und sprich frei.')) };
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
    const items = list.map((x, n) => {
      x = x && typeof x === 'object' ? x : {};
      const fields = BUILD[type.id](x, { level, spec, seed: set + type.id + n });
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
          }
        ],
        catalog: { origin: 'own', cefr: level, tags: ['cils', 'cils-' + level.toLowerCase(), type.part, type.id], textbook: { series: 'CILS', volume: level, unit: EXAM[level], section: part.label } },
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
    return { level, type: type.id, tema, items };
  }

  /* command: allgemeine Kommandodatei, typeCommand: Datei des Aufgabentyps */
  function promptFor(command, typeCommand, inp) {
    const type = typeById(inp.type);
    const level = inp.level;
    const spec = type.spec(level);
    const many = !type.media && !['scrittura', 'orale'].includes(type.part);
    return [
      String(command).trim(),
      '',
      String(typeCommand).trim(),
      '',
      '## Eingaben',
      '',
      `- Prüfung und Niveau: ${EXAM[level]} (GER ${level})`,
      `- Aufgabentyp: ${type.id} · ${type.it} (${PARTS[type.part].label})`,
      `- Zielgruppe: ${inp.audience === 'adulti' ? 'Erwachsene' : 'Jugendliche von 12 bis 17 Jahren (Adolescenti)'}`,
      '- Vorgaben für dieses Niveau:',
      Object.entries(spec)
        .map(([k, v]) => `  - ${k}: ${v}`)
        .join('\n'),
      many ? `- Anzahl Übungen in „esercizi“: ${Math.min(3, Math.max(1, Number(inp.count) || 1))}` : null,
      type.media ? null : '- Themenwunsch: ' + (String(inp.theme || '').trim() || 'frei wählen, abwechslungsreich'),
      inp.note ? '- Hinweise der Lehrkraft: ' + String(inp.note).trim() : null,
      type.media ? '\n## Transkript der Aufnahme (von der Lehrkraft, nicht verändern)\n\n' + String((inp.media && inp.media.transcript) || '').trim() : null
    ]
      .filter(x => x !== null)
      .join('\n');
  }

  const api = { LEVELS, EXAM, PARTS, TYPES, typeById, typesFor, build, promptFor, gaps, spoken, mediaFrom };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DajeCILS = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* ---------- Oberfläche (nur im Browser) ---------- */
if (typeof document !== 'undefined') {
  const CILS_KEY = 'daje-cils-v1';
  const FORM0 = { level: 'B1', type: 'let-scelta', audience: 'adolescenti', count: 1, theme: '', note: '', answer: '', source: 'youtube', url: '', transcript: '' };
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
  const cilsPartName = id => {
    const x = findTask(id);
    return x ? cilsStrip(x.title) : id;
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
        return `<article class="cils-set glass"><div class="cils-set-head"><span class="cils-badge">${esc(st.level)}</span><div><b>${esc(head)}</b><small>${t ? esc(DajeCILS.PARTS[t.part].de + ' · ' + t.it) + ' · ' : ''}${new Date(st.created).toLocaleDateString('de-DE', { dateStyle: 'medium' })} · ${plural(ids.length, 'Übung', 'Übungen')}</small></div></div>
          <ol class="cils-parts">${ids.map(id => `<li><button class="quiet" data-lesson="${esc(id)}">${esc(cilsPartName(id))}</button></li>`).join('')}</ol>
          <div class="cils-set-act"><button class="button primary" data-cils-mappe="${esc(st.id)}">Drucken</button><button class="button secondary" data-cils-klasse="${esc(st.id)}">Klassensitzung</button><button class="quiet danger" data-cils-del="${esc(st.id)}">Löschen</button></div></article>`;
      })
      .join('')}</div>`;
  }

  function cilsTypesHTML(f) {
    const list = DajeCILS.typesFor(f.level);
    return Object.entries(DajeCILS.PARTS)
      .map(([k, p]) => {
        const ts = list.filter(t => t.part === k);
        if (!ts.length) return '';
        return `<div class="cils-group"><h3>${esc(p.de)} <small>${esc(p.label)}</small></h3><div class="cils-types">${ts
          .map(t => `<button type="button" class="cils-type" data-cils-type="${t.id}" aria-pressed="${f.type === t.id}"><b>${esc(t.it)}</b><small>${esc(t.de)}</small>${t.media ? '<i class="cils-own">eigene Aufnahme</i>' : ''}</button>`)
          .join('')}</div></div>`;
      })
      .join('');
  }

  function cilsDetailsHTML(f, t) {
    const spec = Object.entries(t.spec(f.level))
      .filter(([k]) => k !== 'esercizi')
      .map(([k, v]) => `<li><b>${esc(k)}</b> ${esc(String(v))}</li>`)
      .join('');
    const many = !t.media && !['scrittura', 'orale'].includes(t.part);
    if (t.media)
      return `<p class="cils-hint">Für das Hörverstehen schreibt die KI <b>keine Hörtexte</b>. Du bringst deine Aufnahme mit (Video, Audio oder ein Transkript, das du vorlesen lässt); die KI erstellt nur die Aufgaben dazu.</p>
        <div class="pills" role="radiogroup" aria-label="Aufnahme">${[['youtube', 'YouTube-Video'], ['audio', 'Audiodatei (Link)'], ['speech', 'Transkript vorlesen lassen']].map(([v, l]) => `<button type="button" class="pill" data-cils-source="${v}" aria-pressed="${f.source === v}">${l}</button>`).join('')}</div>
        ${f.source === 'speech' ? '' : `<label class="field">${f.source === 'youtube' ? 'Link zum Video (Startzeit mit ?t=… möglich)' : 'https-Link zur Audiodatei (mp3, m4a)'}<input data-cils-f="url" value="${esc(f.url)}" placeholder="${f.source === 'youtube' ? 'https://www.youtube.com/watch?v=…' : 'https://…/aufnahme.mp3'}" inputmode="url"></label>`}
        <label class="field">Transkript der Aufnahme<textarea data-cils-f="transcript" rows="6" placeholder="Den gesprochenen Text hier einfügen. Bei mehreren Kurztexten: Testo 1, Testo 2 … jeweils davor schreiben.">${esc(f.transcript)}</textarea></label>
        <ul class="cils-spec">${spec}</ul>`;
    return `${many ? `<div class="cils-row"><span>Übungen</span><div class="pills">${[1, 2, 3].map(n => `<button type="button" class="pill" data-cils-count="${n}" aria-pressed="${Number(f.count) === n}">${n}</button>`).join('')}</div></div>` : ''}
      <label class="field">Thema (optional)<input data-cils-f="theme" value="${esc(f.theme)}" placeholder="z. B. Schule und Freizeit, Umwelt, Arbeit und Studium"></label>
      <label class="field">Hinweise für die KI (optional)<input data-cils-f="note" value="${esc(f.note)}" placeholder="z. B. Wortschatz aus Lektion 4, besonders congiuntivo üben"></label>
      <ul class="cils-spec">${spec}</ul>`;
  }

  function cilsPage() {
    CILS = CILS || cilsState();
    const f = CILS.form;
    const t = DajeCILS.typeById(f.type);
    $('breadcrumb').textContent = 'CILS-Training';
    $('main').innerHTML = `<div class="page cils-page">
      <button class="quiet back-link" data-nav="start">Mein Unterricht</button>
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
      <p class="small muted cils-note">Aufbau nach den veröffentlichten Prüfungsheften der CILS (Università per Stranieri di Siena). Längen und Anzahlen sind Richtwerte. Alle Texte sind neu und keine Originalaufgaben.</p>
    </div>`;
  }

  const cilsInput = () => {
    const f = CILS.form;
    return { level: f.level, type: f.type, audience: f.audience, count: f.count, theme: f.theme, note: f.note, media: { source: f.source, url: f.url, transcript: f.transcript } };
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
      return DajeCILS.promptFor(a, b, cilsInput());
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
      CILS.sets.unshift({ id: setId, level: r.level, type: r.type, tema: r.tema, created: now, ids });
      CILS.form.answer = '';
      cilsSave();
      cilsPage();
      toast(`${plural(ids.length - bad.length, 'Übung', 'Übungen')} erstellt${bad.length ? `, ${bad.length} als Entwurf (bitte in „Eigene Übungen“ prüfen)` : ''}.`);
      if (bad.length) $('cils-result').innerHTML = `<div class="validation-errors"><b>Noch zu prüfen</b><ul>${bad.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`;
    } catch (err) {
      out.innerHTML = `<div class="validation-errors"><b>Noch nicht übernommen</b><p>${esc(err.message)}</p></div>`;
    }
  }

  // Druck: alle Übungen eines Satzes als ein Heft (Aufgaben, Lösungen mit Transkripten oder Kurzschlüssel)
  function cilsPrint(st, sol) {
    const ids = cilsLive(st);
    docCurrent = { kind: 'cils', solutions: sol, set: st.id };
    const t = st.type && DajeCILS.typeById(st.type);
    const title = (DajeCILS.EXAM[st.level] || 'CILS ' + st.level) + (t ? ' · ' + t.it : '') + (st.tema ? ' · ' + st.tema : '');
    const texts =
      sol === 1
        ? ids
            .map(id => findTask(id))
            .filter(x => x && (x.transcript || x.media?.type === 'speech'))
            .map(x => `<section class="hb-tr"><h3>Trascrizione · ${esc(cilsStrip(x.title))}</h3>${String(x.transcript || x.media.text).split(/\n+/).map(l => `<p>${esc(l)}</p>`).join('')}</section>`)
            .join('')
        : '';
    const side =
      dlgBlock('Ausgabe', dlgSeg('data-cils-mode', 'cils-mode', [[0, 'Aufgaben'], [1, 'Lösungen und Transkripte'], [2, 'Kurzer Schlüssel']], sol)) +
      dlgBlock('Sprache der Anweisungen', dlgSeg('data-instr="pref"', 'instr', [['target', 'Zielsprache'], ['de', 'Deutsch']], instrPref)) +
      dlgBlock('Design', dlgDesigns()) + dlgBlock('Schrift', dlgFonts()) + dlgBlock('Farbe', dlgAccents());
    dlgShow({ title, side, paper: wsSheetHTML([ids], sol, { title, rule: false }).replace(/(<\/div>)\s*$/, texts + '$1') });
  }

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
