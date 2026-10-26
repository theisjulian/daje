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
      status: q.evidence
        ? evidenceStatus(q.evidence, text)
        : /^(prima dell|before|vor dem|avant|antes)/i.test(q.prompt || '')
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
          rights: inp.rights || 'needs_review'
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

  const api = {
    extractJSON,
    norm,
    evidenceStatus,
    checkEvidence,
    buildPackage,
    promptFor,
    mediaFrom
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DajeKI = api;
})(typeof window !== 'undefined' ? window : globalThis);
