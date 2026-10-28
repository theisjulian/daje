/*
 * KI-Antworten in daje-Pakete verwandeln. Gemeinsam für Redaktion (Browser) und Grundstock-Werkzeug (Node).
 * Die KI liefert nur Inhalte (KI-Kommandodatei.md, Abschnitt 3); Technik ergänzt daje hier:
 * ID, Format, Medium, Quellen, Transkript. Belegzitate (evidence) werden gegen das Transkript geprüft.
 */
(function (root) {
  'use strict';

  /* JSON aus einer Chat-Antwort lösen: Codeblock, Text davor/danach, abschließende Kommas. */
  function extractJSON(text) {
    let s = String(text || '')
      .replace(/^﻿/, '')
      .trim();
    const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) s = fence[1].trim();
    const a = s.indexOf('{'),
      b = s.lastIndexOf('}');
    if (a < 0 || b < a) throw new Error('In der Antwort steht kein JSON-Objekt.');
    s = s.slice(a, b + 1);
    try {
      return JSON.parse(s);
    } catch (e) {
      try {
        return JSON.parse(s.replace(/,\s*([}\]])/g, '$1'));
      } catch {
        throw new Error(
          'Die Antwort ist kein gültiges JSON (' +
            e.message +
            '). Bitte die KI um eine korrigierte Ausgabe bitten.'
        );
      }
    }
  }

  /* Vergleichsform: Kleinbuchstaben, einheitliche Apostrophe, ohne Zeitmarken, Satzzeichen und doppelte Leerzeichen. */
  function norm(t) {
    return String(t || '')
      .toLowerCase()
      .replace(/\[\d{1,2}:\d{2}(?::\d{2})?\]|\b\d{1,2}:\d{2}(?::\d{2})?\b/g, ' ')
      .replace(/[’‘`´]/g, "'")
      .normalize('NFC')
      .replace(/[^\p{L}\p{N}']+/gu, ' ')
      .trim();
  }

  /* Belegprüfung: wörtlich enthalten = ok; mindestens 80 % der Wörter in einem gleich langen Abschnitt = fast; sonst fehlt. */
  function evidenceStatus(evidence, transcript) {
    const e = norm(evidence),
      t = norm(transcript);
    if (!e) return 'leer';
    if (!t) return 'ohne-transkript';
    if (t.includes(e)) return 'ok';
    const ew = e.split(' '),
      tw = t.split(' ');
    const n = ew.length;
    let best = 0;
    for (let i = 0; i + 1 <= tw.length; i++) {
      const win = new Set(tw.slice(i, i + n + 2));
      let hit = 0;
      for (const w of ew) if (win.has(w)) hit++;
      if (hit > best) best = hit;
      if (best === n) break;
    }
    return best / n >= 0.8 ? 'fast' : 'fehlt';
  }
  function checkEvidence(pkg, transcript) {
    const text = transcript ?? pkg.transcript ?? '';
    return (pkg.questions || []).map((q, i) => ({
      n: i + 1,
      id: q.id,
      // Ohne Beleg in Ordnung: vor dem Hören, offene Antworten, „nicht im Text“ ('vorab' = kein Beleg nötig).
      status: q.evidence
        ? evidenceStatus(q.evidence, text)
        : /^(prima dell|before|vor dem|avant|antes)/i.test(q.prompt || '') ||
            q.type === 'open_answer' ||
            (q.type === 'true_false_ng' && q.answer === 'not_given')
          ? 'vorab'
          : 'leer'
    }));
  }

  function slug(s) {
    return (
      String(s || 'uebung')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 26) || 'uebung'
    );
  }
  function mediaFrom(url, start, end) {
    const s = String(url || '').trim();
    const yt =
      s.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([A-Za-z0-9_-]{11})/) ||
      s.match(/^([A-Za-z0-9_-]{11})$/);
    if (yt) {
      const m = { type: 'youtube', videoId: yt[1] };
      if (Number.isInteger(start) && start > 0) m.start = start;
      if (Number.isInteger(end) && end > (m.start || 0)) m.end = end;
      return m;
    }
    if (/^https:\/\//.test(s)) return { type: 'audio', url: s };
    return null;
  }
  const arr = v => (Array.isArray(v) ? v : v ? [v] : []);

  /*
   * ai: Objekt der KI. inp: { language, level, mediaUrl, start, end, transcript, id, citation, rights,
   *   transcriptOrigin, keepTranscript (Standard true), keepEvidence (Standard true) }
   * Ergebnis: { pkg, result (validatePackage), evidence, warnings }
   */
  function buildPackage(ai, inp, validate) {
    if (ai && ai.abbruch) throw new Error('Die KI hat abgebrochen: ' + ai.abbruch);
    const warnings = [];
    const media = mediaFrom(inp.mediaUrl, inp.start, inp.end);
    if (!media)
      throw new Error(
        'Medium fehlt: bitte einen YouTube-Link oder eine https-Audioadresse angeben.'
      );
    const qs = arr(ai.questions).map((q, i) => {
      const z = { ...q, id: /^[a-z0-9][a-z0-9-]*$/.test(q.id || '') ? q.id : 'q' + (i + 1) };
      if (!z.explanation) delete z.explanation;
      return z;
    });
    const ids = new Set();
    qs.forEach((q, i) => {
      if (ids.has(q.id)) q.id = 'q' + (i + 1) + '-' + i;
      ids.add(q.id);
    });
    const vocab = arr(ai.vocabulary)
      .filter(w => w && w.target)
      .map((w, i) => ({
        ...w,
        id: /^[a-z0-9][a-z0-9-]*$/.test(w.id || '') ? w.id : 'w' + (i + 1),
        translations: arr(w.translations).length ? arr(w.translations) : ['?']
      }));
    const transcript = String(inp.transcript || '').trim();
    const pkg = {
      format: 'theis-learning-package',
      schemaVersion: '1.2',
      kind: 'listening',
      id: inp.id || 'eigen-' + slug(ai.title) + '-' + Math.random().toString(36).slice(2, 6),
      title: String(ai.title || 'Hörverstehen').slice(0, 120),
      language: inp.language || ai.language,
      level: inp.level || ai.level,
      description: String(ai.description || 'Hörverstehen').slice(0, 600),
      topics: arr(ai.topics).slice(0, 8).map(String).filter(Boolean),
      estimatedMinutes: Math.max(5, Math.min(90, Math.round(qs.length * 1.3) + 3)),
      media,
      sources: [
        {
          kind: 'external',
          citation:
            inp.citation ||
            (media.type === 'youtube' ? 'Video auf YouTube' : 'Audioaufnahme') +
              '; Aufgaben erstellt mit KI-Unterstützung, redaktionell geprüft.',
          url:
            media.type === 'youtube'
              ? 'https://www.youtube.com/watch?v=' + media.videoId
              : media.url,
          rights: inp.rights || (media.type === 'youtube' ? 'cleared' : 'needs_review')
        }
      ],
      reviewNotes: arr(ai.reviewNotes).map(String).slice(0, 20),
      questions: qs
    };
    if (!pkg.topics.length) pkg.topics = ['Hörverstehen'];
    if (vocab.length) pkg.vocabulary = vocab.slice(0, 60);
    if (ai.teacherNotes && typeof ai.teacherNotes === 'object') pkg.teacherNotes = ai.teacherNotes;
    if (transcript && inp.keepTranscript !== false) {
      pkg.transcript = transcript.slice(0, 16000);
      pkg.transcriptOrigin = inp.transcriptOrigin || 'provider';
      if (transcript.length > 16000) warnings.push('Transkript auf 16.000 Zeichen gekürzt.');
    }
    const evidence = checkEvidence(pkg, transcript);
    // Bei Liedern und Filmen: Zitate nur zur Prüfung, nicht ins Paket (Rechte am Text).
    if (inp.keepEvidence === false) pkg.questions.forEach(q => delete q.evidence);
    const missing = evidence.filter(e => e.status === 'fehlt' || e.status === 'leer');
    if (missing.length)
      warnings.push(
        'Beleg nicht im Transkript gefunden: Aufgabe ' + missing.map(e => e.n).join(', ') + '.'
      );
    const result = validate ? validate(pkg) : null;
    return { pkg, result, evidence, warnings };
  }

  /* Vollständiger Auftrag für den Chat: Kommandodatei + Eingaben. */
  function promptFor(command, inp) {
    const lines = [
      command.trim(),
      '',
      '## Eingaben',
      '',
      '- Sprache: ' + inp.language,
      '- Zielniveau: ' + inp.level,
      '- Medium: ' + (inp.mediaUrl || 'siehe Transkript'),
      inp.start || inp.end
        ? '- Ausschnitt: ' +
          (inp.startText || inp.start || 0) +
          ' bis ' +
          (inp.endText || inp.end || 'Ende')
        : '',
      inp.count ? '- Gewünschte Aufgabenzahl: etwa ' + inp.count : '',
      inp.grade ? '- Klassenstufe: ' + inp.grade : '',
      inp.structure === 'phasen'
        ? '- Aufbau: B · vor, während, nach dem Hören'
        : inp.structure === 'durchgaenge'
          ? '- Aufbau: A · nach Hördurchgängen (1. Hören global, 2. Hören Details, bei Bedarf 3. Hören genau)'
          : '',
      inp.kind === 'lied'
        ? '- Art: Lied (Abschnitt 6 beachten)'
        : inp.kind === 'film'
          ? '- Art: Filmszene (Abschnitt 6 beachten)'
          : '',
      inp.wishes ? '- Wünsche der Lehrkraft: ' + inp.wishes : '',
      '',
      '### Transkript',
      '',
      String(inp.transcript || '(kein Transkript)').trim(),
      '',
      'Antworte jetzt mit genau einem JSON-Codeblock nach Abschnitt 3.'
    ];
    return lines.filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
  }

  /*
   * Wortschatz (KI-Wortschatz.md): ai = { title, description, level, topics, entries, reviewNotes }.
   * inp: { language, level, mode ('buch' | 'text'), text, id, collection, section, pages, grade }
   * Ergebnis wie buildPackage; evidence nur bei Quelle Text (Fundstelle im Text).
   */
  /* Sprechform nur übernehmen, wenn sie zum Wort gehört: Teile ohne gemeinsamen Wortanfang mit dem Eintrag
     (z. B. ein aus der Anleitung kopiertes Beispiel „il collega, la collega“) fallen weg, einzelne Wörter wie „qualcosa“ bleiben; bleibt nur das Wort selbst, ist sie überflüssig. */
  function cleanSay(say, target) {
    const norm = t => String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const stems = norm(target).split(/[^\p{L}]+/u).filter(x => x.length >= 3).map(x => x.slice(0, 3));
    const parts = String(say || '')
      .split(/\s*,\s*/)
      .map(x => x.trim())
      .filter(x => x && (!stems.length || !/\s/.test(x) || norm(x).split(/[^\p{L}]+/u).some(word => stems.some(st => word.startsWith(st)))));
    const out = parts.join(', ').slice(0, 300);
    return out && norm(out) !== norm(target) ? out : '';
  }
  const POS = ['noun', 'verb', 'adjective', 'phrase', 'other'];
  const GENDER = ['masculine', 'feminine', 'neuter', 'common', 'unknown'];
  function buildVocabulary(ai, inp, validate) {
    if (ai && ai.abbruch) throw new Error('Die KI hat abgebrochen: ' + ai.abbruch);
    const warnings = [];
    const book = inp.mode === 'buch';
    const seen = new Set();
    const raw = arr(ai.entries).filter(w => w && String(w.target || '').trim());
    const entries = [];
    const evidence = [];
    raw.forEach(w => {
      const target = String(w.target).trim();
      const k = target.toLowerCase();
      if (seen.has(k)) return;
      seen.add(k);
      // „das Viertel / der Stadtteil“ trennen, „der/die Intellektuelle“ aber zusammenlassen (Artikel vor dem Schrägstrich).
      const tr = arr(w.translations)
        .flatMap(t =>
          String(t)
            .split(/\s*\/\s*/)
            .reduce((out, part) => {
              const prev = out[out.length - 1];
              if (prev !== undefined && (/^(der|die|das|ein|eine|einer|jd|jdn|jdm|etw)\.?$/i.test(prev.trim()) || /^(in|innen|e|r|n)$/.test(part.trim())))
                out[out.length - 1] = prev.trim() + '/' + part.trim();
              else out.push(part);
              return out;
            }, [])
        )
        .map(t => t.trim())
        .filter(Boolean);
      const z = { id: 'w' + (entries.length + 1), target: target.slice(0, 300), translations: tr.length ? tr : ['?'] };
      for (const f of ['example', 'definition', 'usage', 'contrast', 'related', 'synonyms', 'antonyms', 'family'])
        if (w[f] && String(w[f]).trim()) z[f] = String(w[f]).trim().slice(0, ['example', 'definition'].includes(f) ? 1000 : f === 'usage' || f === 'contrast' ? 500 : 300);
      const say = cleanSay(w.say, target);
      if (say) z.say = say;
      if (book && w.page) z.page = String(w.page).slice(0, 30);
      if (POS.includes(w.partOfSpeech)) {
        z.grammar = { partOfSpeech: w.partOfSpeech };
        if (w.partOfSpeech === 'noun' && GENDER.includes(w.gender)) z.grammar.gender = w.gender;
      }
      if (!tr.length) warnings.push('Ohne Übersetzung: ' + target + '.');
      if (!book)
        evidence.push({ n: entries.length + 1, target, status: w.evidence ? evidenceStatus(w.evidence, inp.text) : 'leer' });
      entries.push(z);
    });
    if (raw.length > entries.length)
      warnings.push(raw.length - entries.length === 1 ? 'Ein doppelter Eintrag wurde zusammengefasst.' : raw.length - entries.length + ' doppelte Einträge wurden zusammengefasst.');
    if (!entries.length) throw new Error('In der Antwort stehen keine Wörter (entries).');
    const pages = String(inp.pages || '').trim();
    // Lehrwerk: Reihe + Band, Lektion, Abschnitt. Eingabe mit Band im Reihennamen („Reihe 3 …“) wird zerlegt.
    let series = String(inp.collection || '').trim();
    let volume = String(inp.volume || '').trim();
    if (book && !volume) {
      const m = series.match(/^(.*?)\s*\b(\d{1,2})\b\s*(.*)$/);
      if (m) {
        series = (m[1] + ' ' + m[3]).replace(/\s+/g, ' ').trim();
        volume = m[2];
      }
    }
    const publisher = String(inp.publisher || '').trim();
    const unit = String(inp.unit || '').trim();
    const part = String(inp.section || '').trim();
    const bookName = series + (volume ? ' ' + volume : '');
    const sectionLabel = book ? [unit, part].filter(Boolean).join(' · ') : part;
    const title = (book && bookName && sectionLabel ? bookName + ' · ' + sectionLabel : String(ai.title || part || 'Wortliste')).slice(0, 120);
    const collection = book ? (bookName ? bookName + (publisher ? ' (' + publisher + ')' : '') : 'Schulbuch') : series || 'Eigene Listen';
    const grade = Number(inp.grade);
    const pkg = {
      format: 'theis-learning-package',
      schemaVersion: '1.2',
      kind: 'vocabulary',
      id: inp.id || 'eigen-' + slug(title) + '-' + Math.random().toString(36).slice(2, 6),
      title,
      language: inp.language || ai.language,
      level: inp.level || ai.level,
      description: String(ai.description || 'Wortliste.').slice(0, 600),
      topics: arr(ai.topics).slice(0, 8).map(String).filter(Boolean),
      translationLanguage: 'de',
      collection: collection.slice(0, 160),
      section: (sectionLabel || title).slice(0, 120),
      catalog: { origin: book ? 'textbook' : 'own', cefr: inp.level || ai.level },
      sources: [
        book
          ? { kind: 'provided', citation: (bookName || 'Schulbuch') + (publisher ? ', ' + publisher : '') + (pages ? ', S. ' + pages : '') + ' (Vokabelteil); Beispielsätze und Erklärungen mit KI-Unterstützung eigens formuliert.', rights: 'cleared' }
          : { kind: 'own', citation: 'Wortliste zu einem Text, erstellt mit KI-Unterstützung.', rights: 'own' }
      ],
      reviewNotes: arr(ai.reviewNotes).map(String).slice(0, 20),
      entries
    };
    if (!pkg.topics.length) pkg.topics = ['Wortschatz'];
    if (book)
      pkg.catalog.textbook = {
        ...(publisher ? { publisher: publisher.slice(0, 60) } : {}),
        series: (series || 'Schulbuch').slice(0, 80),
        ...(volume ? { volume: volume.slice(0, 10) } : {}),
        ...(unit ? { unit: unit.slice(0, 60) } : {}),
        ...(part ? { section: part.slice(0, 60) } : {}),
        ...(pages ? { pages: pages.slice(0, 30) } : {})
      };
    if (Number.isInteger(grade) && grade >= 5 && grade <= 13) pkg.catalog.grade = grade;
    const missing = evidence.filter(e => e.status === 'fehlt' || e.status === 'leer');
    if (missing.length) warnings.push('Nicht im Text gefunden: ' + missing.map(e => e.target).join(', ') + '.');
    const result = validate ? validate(pkg) : null;
    return { pkg, result, evidence, warnings };
  }

  /* Auftrag Wortschatz: Kommandodatei + Eingaben. */
  function promptForVocab(command, inp) {
    const book = inp.mode === 'buch';
    const lines = [
      command.trim(),
      '',
      '## Eingaben',
      '',
      '- Sprache: ' + inp.language,
      '- Zielniveau: ' + inp.level,
      '- Quelle: ' + (book ? 'Buchseiten (Fotos sind angehängt)' : 'Text (siehe unten)'),
      inp.collection ? (book ? '- Lehrwerk: ' : '- Sammlung: ') + inp.collection + (book && inp.volume ? ' ' + inp.volume : '') + (book && inp.publisher ? ' (' + inp.publisher + ')' : '') : '',
      book && inp.unit ? '- Lektion: ' + inp.unit : '',
      inp.section ? '- Abschnitt: ' + inp.section : '',
      book && inp.pages ? '- Seiten: ' + inp.pages : '',
      inp.grade ? '- Klassenstufe: ' + inp.grade : '',
      !book && inp.count ? '- Gewünschte Anzahl: etwa ' + inp.count + ' Einträge' : '',
      inp.wishes ? '- Wünsche der Lehrkraft: ' + inp.wishes : '',
      '',
      book ? '' : '### Text',
      book ? '' : '',
      book ? '' : String(inp.text || '(kein Text)').trim(),
      '',
      'Antworte jetzt mit genau einem JSON-Codeblock nach Abschnitt 3.'
    ];
    return lines.filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');
  }

  /*
   * Grammatik (KI-Grammatik.md): ai = { topic: { title, rule }, exercises: [{ title, difficulty, questions }], reviewNotes }.
   * inp: { language, level, mode ('genau' | 'eigen' | 'thema'), series, volume, publisher, unit, section, pages, grade,
   *   topicId (bestehendes Thema, optional), topicTitle (optional), id: () => neue ID }
   * Ergebnis: { pkgs: [{ pkg, result }], warnings }. Eine Übung = ein Paket, alle mit demselben Thema.
   * genau → origin original (bleibt privat), eigen → adapted, thema → own.
   */
  function buildGrammar(ai, inp, validate) {
    if (ai && ai.abbruch) throw new Error('Die KI hat abgebrochen: ' + ai.abbruch);
    const topic = ai && typeof ai.topic === 'object' && ai.topic ? ai.topic : {};
    const exercises = arr(ai && ai.exercises).filter(e => e && arr(e.questions).length);
    if (!exercises.length) throw new Error('In der Antwort stehen keine Übungen („exercises“ fehlt oder ist leer).');
    const warnings = [];
    const origin = inp.mode === 'genau' ? 'original' : inp.mode === 'eigen' ? 'adapted' : 'own';
    const topicTitle = String(inp.topicTitle || topic.title || 'Grammatik').trim().slice(0, 120);
    const topicId = inp.topicId || ('eigen-' + slug(topicTitle).slice(0, 20) + '-' + Math.random().toString(36).slice(2, 6));
    const book = [inp.series, inp.volume].filter(Boolean).join(' ');
    const where = [book && book + (inp.publisher ? ' (' + inp.publisher + ')' : ''), inp.unit, inp.pages ? 'S. ' + inp.pages : ''].filter(Boolean).join(', ');
    const citation =
      origin === 'original'
        ? 'Übung aus ' + (where || 'einem Schulbuch') + ', unverändert übernommen. Nur für den eigenen Unterricht, nicht zur Veröffentlichung.'
        : origin === 'adapted'
          ? 'Eigene Übung auf Grundlage von ' + (where || 'Schulbuchübungen') + '.'
          : 'Eigene Übung.';
    const textbook = inp.series ? { series: String(inp.series).slice(0, 120) } : null;
    if (textbook) {
      if (inp.publisher) textbook.publisher = String(inp.publisher).slice(0, 120);
      if (inp.volume) textbook.volume = String(inp.volume).slice(0, 20);
      if (inp.unit) textbook.unit = String(inp.unit).slice(0, 120);
      if (inp.section) textbook.section = String(inp.section).slice(0, 120);
      if (inp.pages) textbook.pages = String(inp.pages).slice(0, 40);
    }
    const levels = ['leicht', 'mittel', 'schwer'];
    const pkgs = exercises.slice(0, 24).map((ex, n) => {
      const qs = arr(ex.questions).map((q, i) => {
        const z = { ...q, id: /^[a-z0-9][a-z0-9-]*$/.test(q.id || '') ? q.id : 'q' + (i + 1) };
        delete z.evidence;
        delete z.evidenceAt;
        if (!z.explanation) delete z.explanation;
        return z;
      });
      const seen = new Set();
      qs.forEach((q, i) => {
        if (seen.has(q.id)) q.id = 'q' + (i + 1) + '-' + i;
        seen.add(q.id);
      });
      const difficulty = levels.includes(ex.difficulty) ? ex.difficulty : 'mittel';
      const pkg = {
        format: 'theis-learning-package',
        schemaVersion: '1.2',
        kind: 'grammar',
        id: typeof inp.id === 'function' ? inp.id() : 'eigen-' + Math.random().toString(36).slice(2, 10),
        title: String(ex.title || topicTitle).slice(0, 120),
        language: inp.language || ai.language || 'it',
        level: inp.level || ai.level || 'A1',
        description: String(ex.description || topicTitle + ' · ' + { leicht: 'einfach', mittel: 'mittel', schwer: 'schwer' }[difficulty]).slice(0, 600),
        topics: [topicTitle, 'Grammatik'],
        estimatedMinutes: Math.max(3, Math.min(45, Math.round(qs.length * 3) + 2)),
        sources: [{ kind: origin === 'own' ? 'own' : 'external', citation, rights: origin === 'original' ? 'cleared' : 'own' }],
        reviewNotes: n ? [] : arr(ai.reviewNotes).map(String).slice(0, 20),
        grammar: { topic: topicId, topicTitle, difficulty, origin, order: n },
        questions: qs
      };
      if (topic.rule && !n) pkg.grammar.rule = String(topic.rule).slice(0, 4000);
      if (textbook) pkg.catalog = { origin: 'textbook', textbook: { ...textbook }, tags: ['grammatik'] };
      if (inp.grade && pkg.catalog) pkg.catalog.grade = Number(inp.grade);
      if (ex.teacherNotes && typeof ex.teacherNotes === 'object') pkg.teacherNotes = ex.teacherNotes;
      const result = validate ? validate(pkg) : null;
      if (result && !result.ok) warnings.push('„' + pkg.title + '“: ' + (result.errors || []).slice(0, 2).join('; '));
      return { pkg, result };
    });
    if (exercises.length > 24) warnings.push('Nur die ersten 24 Übungen übernommen.');
    return { pkgs, warnings };
  }

  /* Auftrag Grammatik: Kommandodatei + Eingaben. */
  function promptForGrammar(command, inp) {
    const book = [inp.series, inp.volume].filter(Boolean).join(' ');
    const per = inp.perLevel || '2';
    const lv = (inp.levels && inp.levels.length ? inp.levels : ['leicht', 'mittel', 'schwer']).join(', ');
    const lines = [
      command.trim(),
      '',
      '## Eingaben',
      '',
      '- Sprache: ' + inp.language,
      '- Zielniveau: ' + inp.level,
      inp.mode === 'genau'
        ? '- Modus: GENAU (Abschnitt 2 A): die Übungen auf den angehängten Fotos unverändert übernehmen'
        : inp.mode === 'eigen'
          ? '- Modus: EIGEN (Abschnitt 2 B): eigene Übungen auf Grundlage der angehängten Fotos'
          : '- Modus: THEMA (Abschnitt 2 C): eigene Übungen ohne Vorlage',
      inp.topicTitle ? '- Grammatikthema: ' + inp.topicTitle : null,
      book ? '- Lehrwerk: ' + book + (inp.publisher ? ' (' + inp.publisher + ')' : '') : null,
      inp.unit ? '- Lektion: ' + inp.unit : null,
      inp.section ? '- Abschnitt: ' + inp.section : null,
      inp.pages ? '- Seiten: ' + inp.pages : null,
      inp.grade ? '- Klassenstufe: ' + inp.grade : null,
      inp.mode === 'genau' ? null : '- Stufen: ' + lv + ' · je Stufe ' + per + ' Übungen',
      inp.wishes ? '- Wünsche der Lehrkraft: ' + inp.wishes : null,
      '',
      'Antworte jetzt mit genau einem JSON-Codeblock nach Abschnitt 3.'
    ];
    return lines.filter(l => l !== null).join('\n');
  }

  const api = {
    extractJSON,
    norm,
    evidenceStatus,
    checkEvidence,
    buildPackage,
    promptFor,
    mediaFrom,
    buildVocabulary,
    promptForVocab,
    buildGrammar,
    promptForGrammar
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DajeKI = api;
})(typeof window !== 'undefined' ? window : globalThis);
