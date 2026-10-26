/* Shared import contract. Pure validation: safe to reuse on a server. */
(function (root) {
  'use strict';
  const LANGUAGES = { it: 'Italienisch', en: 'Englisch', fr: 'Französisch', es: 'Spanisch' };
  const isObj = x => x && typeof x === 'object' && !Array.isArray(x);
  function validatePackage(input) {
    const errors = [];
    const fail = (path, text) => errors.push(path + ': ' + text);
    function obj(x, path) {
      if (!isObj(x)) {
        fail(path, 'Objekt erwartet');
        return {};
      }
      return x;
    }
    function str(x, path, max = 500, optional = false) {
      if (optional && (x === undefined || x === '')) return '';
      if (typeof x !== 'string' || !x.trim() || x.length > max) {
        fail(path, 'Text mit 1 bis ' + max + ' Zeichen erwartet');
        return '';
      }
      return x.trim();
    }
    function id(x, path) {
      const s = str(x, path, 40);
      if (
        s &&
        (!/^[a-z0-9][a-z0-9-]*$/.test(s) || ['constructor', 'prototype', '__proto__'].includes(s))
      )
        fail(path, 'nur Kleinbuchstaben, Ziffern und Bindestriche');
      return s;
    }
    function arr(x, path, min = 0, max = 100) {
      if (!Array.isArray(x) || x.length < min || x.length > max) {
        fail(path, min + ' bis ' + max + ' Einträge erwartet');
        return [];
      }
      return x;
    }
    function url(x, path) {
      const s = str(x, path, 2000);
      try {
        const u = new URL(s);
        if (u.protocol !== 'https:' || u.username || u.password) throw Error();
        return u.href;
      } catch {
        fail(path, 'gültige HTTPS-Adresse ohne Zugangsdaten erwartet');
        return '';
      }
    }
    function strings(x, path, maxItems = 20) {
      return arr(x, path, 1, maxItems).map((s, i) => str(s, path + '[' + i + ']', 500));
    }
    const a = obj(input, 'Paket');
    if (a.format !== 'theis-learning-package') fail('format', 'theis-learning-package erwartet');
    if (!['1.0', '1.1', '1.2'].includes(a.schemaVersion))
      fail('schemaVersion', 'Version 1.0, 1.1 oder 1.2 erwartet');
    if (!['listening', 'vocabulary'].includes(a.kind))
      fail('kind', 'listening oder vocabulary erwartet');
    const out = {
      format: 'theis-learning-package',
      schemaVersion: a.schemaVersion,
      kind: a.kind,
      id: id(a.id, 'id'),
      title: str(a.title, 'title', 120),
      language: a.language,
      level: a.level,
      description: str(a.description, 'description', 600),
      topics: strings(a.topics, 'topics', 8),
      sources: []
    };
    if (!Object.hasOwn(LANGUAGES, a.language)) fail('language', 'it, en, fr oder es erwartet');
    if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(a.level))
      fail('level', 'GER-Stufe A1 bis C2 erwartet');
    out.sources = arr(a.sources, 'sources', 1, 12).map((s, i) => {
      s = obj(s, 'sources[' + i + ']');
      if (!['own', 'provided', 'external'].includes(s.kind))
        fail('sources[' + i + '].kind', 'own, provided oder external erwartet');
      if (!['own', 'cleared', 'needs_review'].includes(s.rights))
        fail('sources[' + i + '].rights', 'own, cleared oder needs_review erwartet');
      return {
        kind: s.kind,
        citation: str(s.citation, 'sources[' + i + '].citation', 1000),
        url: s.url ? url(s.url, 'sources[' + i + '].url') : '',
        rights: s.rights
      };
    });
    out.reviewNotes =
      a.reviewNotes === undefined
        ? []
        : arr(a.reviewNotes, 'reviewNotes', 0, 20).map((s, i) =>
            str(s, 'reviewNotes[' + i + ']', 1000)
          );
    out.cover = ['torino', 'gelato', 'gatto'].includes(a.cover) ? a.cover : 'wave';
    if (a.catalog !== undefined) {
      const c = obj(a.catalog, 'catalog'),
        k = {};
      if (c.origin !== undefined) {
        if (!['textbook', 'topic', 'media', 'own'].includes(c.origin))
          fail('catalog.origin', 'textbook, topic, media oder own erwartet');
        else k.origin = c.origin;
      }
      if (c.textbook !== undefined) {
        const t = obj(c.textbook, 'catalog.textbook');
        k.textbook = {};
        for (const [f, n] of [['publisher', 80], ['series', 80], ['volume', 20], ['edition', 80], ['unit', 40], ['section', 60], ['pages', 30]])
          if (t[f] !== undefined && t[f] !== '') k.textbook[f] = str(t[f], 'catalog.textbook.' + f, n);
      }
      if (c.grade !== undefined) {
        if (!Number.isInteger(c.grade) || c.grade < 5 || c.grade > 13) fail('catalog.grade', 'Jahrgangsstufe 5 bis 13 erwartet');
        else k.grade = c.grade;
      }
      if (c.foreignLanguageNo !== undefined) {
        if (![1, 2, 3].includes(c.foreignLanguageNo)) fail('catalog.foreignLanguageNo', '1, 2 oder 3 erwartet');
        else k.foreignLanguageNo = c.foreignLanguageNo;
      }
      if (c.cefr !== undefined) {
        if (!['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].includes(c.cefr)) fail('catalog.cefr', 'A1 bis C2 erwartet');
        else k.cefr = c.cefr;
      }
      if (c.themes !== undefined) k.themes = strings(c.themes, 'catalog.themes', 8);
      if (c.tags !== undefined) k.tags = strings(c.tags, 'catalog.tags', 12);
      if (c.curriculum !== undefined) k.curriculum = str(c.curriculum, 'catalog.curriculum', 200);
      out.catalog = k;
    }
    if (a.kind === 'listening') {
      out.estimatedMinutes = a.estimatedMinutes;
      if (
        !Number.isInteger(a.estimatedMinutes) ||
        a.estimatedMinutes < 1 ||
        a.estimatedMinutes > 90
      )
        fail('estimatedMinutes', 'ganze Zahl von 1 bis 90 erwartet');
      const m = obj(a.media, 'media');
      out.media = { type: m.type };
      if (!['speech', 'audio', 'youtube', 'film', 'link'].includes(m.type))
        fail('media.type', 'speech, audio, youtube, film oder link erwartet');
      if (m.type === 'link') {
        out.media.url = url(m.url, 'media.url');
        if (m.provider !== undefined) out.media.provider = str(m.provider, 'media.provider', 40);
      }
      if (m.type === 'film') {
        out.media.title = str(m.title, 'media.title', 120);
        if (m.year !== undefined) {
          if (!Number.isInteger(m.year) || m.year < 1890 || m.year > 2100) fail('media.year', 'Jahr erwartet');
          else out.media.year = m.year;
        }
        if (m.scene !== undefined) out.media.scene = str(m.scene, 'media.scene', 300);
        if (m.trailerVideoId !== undefined) {
          if (typeof m.trailerVideoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(m.trailerVideoId))
            fail('media.trailerVideoId', 'elfstellige YouTube-Video-ID erwartet');
          else out.media.trailerVideoId = m.trailerVideoId;
        }
      }
      if (m.type === 'speech') out.media.text = str(m.text, 'media.text', 12000);
      else if (m.type === 'audio') out.media.url = url(m.url, 'media.url');
      else if (m.type === 'youtube') {
        if (typeof m.videoId !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(m.videoId))
          fail('media.videoId', 'elfstellige YouTube-Video-ID erwartet');
        out.media.videoId = typeof m.videoId === 'string' ? m.videoId : '';
        for (const f of ['start', 'end'])
          if (m[f] !== undefined) {
            if (!Number.isInteger(m[f]) || m[f] < 0 || m[f] > 86400) fail('media.' + f, 'ganze Sekunden erwartet');
            else out.media[f] = m[f];
          }
        if (out.media.end !== undefined && out.media.start !== undefined && out.media.end <= out.media.start)
          fail('media.end', 'muss nach media.start liegen');
      }
      out.transcript = str(a.transcript, 'transcript', 16000, true);
      if (a.series !== undefined) out.series = id(a.series, 'series');
      if (a.seriesTitle !== undefined) out.seriesTitle = str(a.seriesTitle, 'seriesTitle', 80);
      if (a.levelLabel !== undefined) out.levelLabel = str(a.levelLabel, 'levelLabel', 40);
      if (a.teacherNotes !== undefined) {
        const t = obj(a.teacherNotes, 'teacherNotes');
        out.teacherNotes = {};
        if (t.warmup !== undefined) out.teacherNotes.warmup = strings(t.warmup, 'teacherNotes.warmup', 6);
        for (const f of ['steps', 'tips', 'followUp'])
          if (t[f] !== undefined) out.teacherNotes[f] = strings(t[f], 'teacherNotes.' + f, 10);
      }
      if (a.coverImage !== undefined) {
        if (
          typeof a.coverImage !== 'string' ||
          !(
            /^assets\/covers\/[a-z0-9][a-z0-9-]*\.(jpg|jpeg|png|webp)$/.test(a.coverImage) ||
            (a.coverImage.length < 400000 &&
              /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/.test(a.coverImage))
          )
        )
          fail('coverImage', 'Pfad assets/covers/<id>.jpg oder eingebettetes Bild erwartet');
        else out.coverImage = a.coverImage;
      }
      if (a.coverQuery !== undefined) out.coverQuery = str(a.coverQuery, 'coverQuery', 120);
      if (a.coverCredit !== undefined) out.coverCredit = str(a.coverCredit, 'coverCredit', 1000);
      if (a.transcriptOrigin !== undefined) {
        if (!['provider', 'auto', 'own', 'reviewed'].includes(a.transcriptOrigin))
          fail('transcriptOrigin', 'provider, auto, own oder reviewed erwartet');
        else out.transcriptOrigin = a.transcriptOrigin;
      }
      out.vocabularyIds =
        a.vocabularyIds === undefined
          ? []
          : arr(a.vocabularyIds, 'vocabularyIds', 0, 100).map((s, i) =>
              id(s, 'vocabularyIds[' + i + ']')
            );
      const seen = new Set();
      out.questions = arr(a.questions, 'questions', 1, 40).map((q, i) => {
        const path = 'questions[' + i + ']';
        q = obj(q, path);
        const z = {
          id: id(q.id, path + '.id'),
          type: q.type,
          prompt: str(q.prompt, path + '.prompt', 1000),
          explanation: str(q.explanation, path + '.explanation', 1500, true)
        };
        if (q.evidenceAt !== undefined) {
          if (!Number.isInteger(q.evidenceAt) || q.evidenceAt < 0 || q.evidenceAt > 86400)
            fail(path + '.evidenceAt', 'ganze Sekunden erwartet');
          else z.evidenceAt = q.evidenceAt;
        }
        if (seen.has(z.id)) fail(path + '.id', 'doppelte Frage-ID');
        seen.add(z.id);
        const options = (min, max) => {
          const ids = new Set();
          const list = arr(q.options, path + '.options', min, max).map((v, j) => {
            v = obj(v, path + '.options[' + j + ']');
            const o = {
              id: id(v.id, path + '.options[' + j + '].id'),
              text: str(v.text, path + '.options[' + j + '].text', 500)
            };
            if (ids.has(o.id)) fail(path + '.options', 'doppelte Antwort-ID');
            ids.add(o.id);
            return o;
          });
          return [list, ids];
        };
        if (q.type === 'single_choice') {
          let ids;
          [z.options, ids] = options(2, 6);
          z.correctOptionId = id(q.correctOptionId, path + '.correctOptionId');
          if (!ids.has(z.correctOptionId))
            fail(path + '.correctOptionId', 'verweist auf keine Antwort');
        } else if (q.type === 'multiple_choice') {
          let ids;
          [z.options, ids] = options(3, 8);
          z.correctOptionIds = arr(q.correctOptionIds, path + '.correctOptionIds', 1, 7).map(
            (v, j) => id(v, path + '.correctOptionIds[' + j + ']')
          );
          if (new Set(z.correctOptionIds).size !== z.correctOptionIds.length)
            fail(path + '.correctOptionIds', 'doppelte Einträge');
          if (z.correctOptionIds.some(v => !ids.has(v)))
            fail(path + '.correctOptionIds', 'verweist auf keine Antwort');
          if (z.correctOptionIds.length >= z.options.length)
            fail(path + '.correctOptionIds', 'mindestens eine Antwort muss falsch sein');
        } else if (q.type === 'matching') {
          const ids = new Set();
          z.pairs = arr(q.pairs, path + '.pairs', 2, 8).map((v, j) => {
            v = obj(v, path + '.pairs[' + j + ']');
            const p = {
              id: id(v.id, path + '.pairs[' + j + '].id'),
              left: str(v.left, path + '.pairs[' + j + '].left', 300),
              right: str(v.right, path + '.pairs[' + j + '].right', 300)
            };
            if (ids.has(p.id)) fail(path + '.pairs', 'doppelte Paar-ID');
            ids.add(p.id);
            return p;
          });
          z.distractors =
            q.distractors === undefined
              ? []
              : arr(q.distractors, path + '.distractors', 0, 4).map((v, j) =>
                  str(v, path + '.distractors[' + j + ']', 300)
                );
        } else if (q.type === 'ordering') {
          const ids = new Set();
          z.items = arr(q.items, path + '.items', 3, 8).map((v, j) => {
            v = obj(v, path + '.items[' + j + ']');
            const o = {
              id: id(v.id, path + '.items[' + j + '].id'),
              text: str(v.text, path + '.items[' + j + '].text', 300)
            };
            if (ids.has(o.id)) fail(path + '.items', 'doppelte Element-ID');
            ids.add(o.id);
            return o;
          });
        } else if (q.type === 'gap_fill') {
          z.text = str(q.text, path + '.text', 2000);
          const ids = new Set();
          z.gaps = arr(q.gaps, path + '.gaps', 1, 10).map((v, j) => {
            v = obj(v, path + '.gaps[' + j + ']');
            const g = {
              id: id(v.id, path + '.gaps[' + j + '].id'),
              acceptedAnswers: strings(v.acceptedAnswers, path + '.gaps[' + j + '].acceptedAnswers')
            };
            if (ids.has(g.id)) fail(path + '.gaps', 'doppelte Lücken-ID');
            ids.add(g.id);
            return g;
          });
          const marks = [...z.text.matchAll(/\[\[([a-z0-9-]+)\]\]/g)].map(m => m[1]);
          if (
            marks.length !== ids.size ||
            marks.some(m => !ids.has(m)) ||
            new Set(marks).size !== marks.length
          )
            fail(path + '.text', 'jede Lücke genau einmal als [[id]] im Text markieren');
        } else if (q.type === 'true_false') {
          z.answer = q.answer;
          if (typeof q.answer !== 'boolean') fail(path + '.answer', 'true oder false erwartet');
        } else if (q.type === 'short_answer') {
          z.acceptedAnswers = strings(q.acceptedAnswers, path + '.acceptedAnswers');
          z.modelAnswer = str(q.modelAnswer, path + '.modelAnswer', 1000);
        } else
          fail(
            path + '.type',
            'single_choice, multiple_choice, true_false, short_answer, matching, ordering oder gap_fill erwartet'
          );
        return z;
      });
    } else if (a.kind === 'vocabulary') {
      out.translationLanguage = a.translationLanguage;
      if (a.translationLanguage !== 'de')
        fail('translationLanguage', 'Version 1 unterstützt Deutsch als Übersetzungssprache');
      out.collection = str(a.collection, 'collection', 160);
      out.section = str(a.section, 'section', 120);
      const seen = new Set();
      out.entries = arr(a.entries, 'entries', 1, 1000).map((w, i) => {
        const path = 'entries[' + i + ']';
        w = obj(w, path);
        const z = {
          id: id(w.id, path + '.id'),
          target: str(w.target, path + '.target', 300),
          translations: strings(w.translations, path + '.translations'),
          acceptedAnswers:
            w.acceptedAnswers === undefined
              ? []
              : arr(w.acceptedAnswers, path + '.acceptedAnswers', 0, 20).map((s, j) =>
                  str(s, path + '.acceptedAnswers[' + j + ']', 500)
                ),
          example: str(w.example, path + '.example', 1000, true),
          definition: str(w.definition, path + '.definition', 1000, true)
        };
        if (w.usage !== undefined && w.usage !== '') z.usage = str(w.usage, path + '.usage', 500);
        if (w.contrast !== undefined && w.contrast !== '') z.contrast = str(w.contrast, path + '.contrast', 500);
        if (w.tags !== undefined) z.tags = strings(w.tags, path + '.tags', 8);
        if (w.page !== undefined && w.page !== '') z.page = str(w.page, path + '.page', 30);
        if (w.related !== undefined && w.related !== '') z.related = str(w.related, path + '.related', 300);
        if (w.ipa !== undefined && w.ipa !== '') z.ipa = str(w.ipa, path + '.ipa', 120);
        if (w.audio !== undefined && w.audio !== '') {
          if (typeof w.audio !== 'string' || !/^assets\/audio\/[a-z0-9][a-z0-9/_-]*\.(mp3|m4a|ogg|wav)$/.test(w.audio))
            fail(path + '.audio', 'Pfad der Form assets/audio/<name>.mp3 erwartet');
          else z.audio = w.audio;
        }
        if (w.image !== undefined && w.image !== '') {
          if (
            typeof w.image !== 'string' ||
            !(
              /^assets\/words\/[a-z0-9][a-z0-9/_-]*\.(jpg|jpeg|png|webp)$/.test(w.image) ||
              (w.image.length < 200000 && /^data:image\/(jpeg|webp|png);base64,[A-Za-z0-9+/=]+$/.test(w.image))
            )
          )
            fail(path + '.image', 'Pfad assets/words/<name>.jpg oder eingebettetes Bild erwartet');
          else z.image = w.image;
          if (w.imageCredit !== undefined) z.imageCredit = str(w.imageCredit, path + '.imageCredit', 300, true);
        }
        if (w.grammar !== undefined) {
          const g = obj(w.grammar, path + '.grammar');
          if (!['noun', 'verb', 'adjective', 'phrase', 'other'].includes(g.partOfSpeech))
            fail(
              path + '.grammar.partOfSpeech',
              'noun, verb, adjective, phrase oder other erwartet'
            );
          z.grammar = { partOfSpeech: g.partOfSpeech };
          if (g.gender !== undefined) {
            if (!['masculine', 'feminine', 'neuter', 'common', 'unknown'].includes(g.gender))
              fail(path + '.grammar.gender', 'ungültiges Genus');
            z.grammar.gender = g.gender;
          }
          if (g.article !== undefined)
            z.grammar.article = str(g.article, path + '.grammar.article', 20, true);
        }
        if (w.answerPolicy !== undefined) {
          const ap = obj(w.answerPolicy, path + '.answerPolicy');
          if (!['required', 'optional'].includes(ap.article))
            fail(path + '.answerPolicy.article', 'required oder optional erwartet');
          if (!['hint', 'strict'].includes(ap.typo))
            fail(path + '.answerPolicy.typo', 'hint oder strict erwartet');
          z.answerPolicy = { article: ap.article, typo: ap.typo };
        }
        if (seen.has(z.id)) fail(path + '.id', 'doppelte Wort-ID');
        seen.add(z.id);
        return z;
      });
    }
    if (a.kind === 'listening' && a.vocabulary !== undefined) {
      if (!['1.1', '1.2'].includes(a.schemaVersion))
        fail('vocabulary', 'integrierter Wortschatz benötigt schemaVersion 1.1 oder 1.2');
      const entries = arr(a.vocabulary, 'vocabulary', 1, 60);
      const v = validatePackage({
        ...out,
        kind: 'vocabulary',
        translationLanguage: 'de',
        collection: 'Hörverstehen',
        section: out.title,
        entries
      });
      if (!v.ok) errors.push(...v.errors.map(e => e.replace(/^entries/, 'vocabulary')));
      else out.vocabulary = v.value.entries;
    }
    return { ok: errors.length === 0, errors, value: errors.length ? null : out };
  }
  function assessAnswer(q, raw) {
    const norm = x =>
      String(x ?? '')
        .normalize('NFC')
        .toLocaleLowerCase()
        .replace(/[’‘]/g, "'")
        .trim()
        .replace(/[.!?]+$/g, '')
        .trim()
        .replace(/\s+/g, ' ');
    if (q.type === 'single_choice') return raw === q.correctOptionId;
    if (q.type === 'true_false') return raw === (q.answer ? 'true' : 'false');
    const parts = () => {
      try {
        const v = JSON.parse(raw);
        return v && typeof v === 'object' && !Array.isArray(v) ? v : {};
      } catch {
        return {};
      }
    };
    const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);
    if (q.type === 'multiple_choice') {
      const given = String(raw ?? '')
        .split(',')
        .filter(Boolean)
        .sort();
      const want = [...q.correctOptionIds].sort();
      return given.length === want.length && given.every((v, i) => v === want[i]);
    }
    if (q.type === 'matching') {
      const v = parts();
      return q.pairs.every(p => has(v, p.id) && v[p.id] === p.id);
    }
    if (q.type === 'ordering') {
      const v = parts();
      return q.items.every((it, i) => has(v, it.id) && Number(v[it.id]) === i + 1);
    }
    if (q.type === 'gap_fill') {
      const v = parts();
      return q.gaps.every(
        g => has(v, g.id) && g.acceptedAnswers.some(a => norm(a) === norm(v[g.id]))
      );
    }
    return q.acceptedAnswers.some(a => norm(a) === norm(raw));
  }
  const api = { validatePackage, assessAnswer, LANGUAGES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TheisContent = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
