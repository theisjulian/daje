/*
 * CILS-Training: Übungsprüfungen im Format CILS A1/A2 Adolescenti mit KI erstellen.
 * Ablauf: Lehrkraft wählt Niveau, Teile und Thema → Auftrag (imports/KI-CILS.md + Eingaben) kopieren →
 * Antwort der KI einfügen → daje baut daraus normale Übungen (Hören mit Vorlesestimme, Lesen mit Lesetext,
 * Strukturen, Schreiben, Sprechen). Sie liegen bei den eigenen Übungen und lassen sich drucken, in die Mappe legen
 * oder als Klassensitzung starten. Kern (DajeCILS.build) läuft auch in Node (Tests).
 */
(function (root) {
  'use strict';
  const PARTS = {
    ascolto: { label: 'Ascolto', de: 'Hörverstehen', p: ['p1', 'p2', 'p3'] },
    lettura: { label: 'Comprensione della lettura', de: 'Leseverstehen', p: ['p1', 'p2', 'p3'] },
    strutture: { label: 'Analisi delle strutture di comunicazione', de: 'Sprachstrukturen', p: ['p1', 'p2', 'p3'] },
    scrittura: { label: 'Produzione scritta', de: 'Schreiben', p: [] },
    orale: { label: 'Produzione orale', de: 'Sprechen', p: [] }
  };
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  const arr = v => (Array.isArray(v) ? v : v ? [v] : []);
  const s = (v, n = 6000) => String(v ?? '').trim().slice(0, n);
  const tidy = t => s(t, 8000).replace(/'/g, '’');

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
        const opts = inner.split('|').map(x => x.trim()).filter(Boolean);
        if (opts.length < 2) throw new Error('Auswahl-Lücke ohne Alternativen: ' + inner);
        list.push({ id, answer: opts[0], options: shuffle(opts, seed + id) });
      } else list.push({ id, acceptedAnswers: [...new Set(inner.split('/').map(x => x.trim()).filter(Boolean))] });
      return '[[' + id + ']]';
    });
    if (!list.length) throw new Error('Im Text fehlen die Lücken [[…]].');
    return { text: out, gaps: list };
  }
  // Gesprochene Fassung: Lösungen einsetzen, Klammern weg
  const spoken = text => tidy(text).replace(/\[\[([^\]|/]+)[^\]]*\]\]/g, '$1');

  function choice(id, prompt, opts, right, help) {
    const o = arr(opts).slice(0, 4).map((t, i) => ({ id: 'o' + (i + 1), text: tidy(t) }));
    const k = LETTERS.indexOf(String(right || '').trim().toUpperCase());
    if (o.length < 2 || k < 0 || k >= o.length) throw new Error('Auswahlfrage „' + String(prompt).slice(0, 40) + '“: Optionen oder Lösung fehlen.');
    const q = { id, type: 'single_choice', prompt: tidy(prompt), options: o, correctOptionId: o[k].id };
    if (help) q.promptHelp = help;
    return q;
  }

  /*
   * ai: Antwort der KI. inp: { level: 'A1'|'A2', id: () => string, set: string }
   * Ergebnis: [{ part, label, pkg }]
   */
  function build(ai, inp) {
    if (ai && ai.abbruch) throw new Error('Die KI hat abgebrochen: ' + ai.abbruch);
    const level = ['A1', 'A2'].includes(inp.level) ? inp.level : ['A1', 'A2'].includes(ai.livello) ? ai.livello : 'A1';
    const set = inp.set || 'cils';
    const tema = s(ai.tema, 80);
    const out = [];
    const base = (kind, part, prova, title, extra) => {
      const label = PARTS[part].label + (prova ? ' · Prova ' + prova : '');
      const pkg = {
        format: 'theis-learning-package',
        schemaVersion: '1.2',
        kind,
        id: inp.id(),
        title: s(`CILS ${level} · ${PARTS[part].label.split(' ')[0] === 'Analisi' ? 'Strutture' : PARTS[part].label.replace('Comprensione della lettura', 'Lettura')}${prova ? ' ' + prova : ''}${title ? ' · ' + tidy(title) : ''}`, 120),
        language: 'it',
        level,
        description: s(`Allenamento CILS ${level} Adolescenti · ${label}${tema ? ' · ' + tema : ''}.`, 600),
        topics: ['CILS', 'CILS ' + level, PARTS[part].de],
        estimatedMinutes: 10,
        sources: [{ kind: 'own', citation: 'Übungsprüfung im Format CILS ' + level + ' Adolescenti, mit KI-Unterstützung für daje erstellt. Keine Originalaufgabe der Università per Stranieri di Siena.', rights: 'own' }],
        catalog: { origin: 'own', cefr: level, tags: ['cils', 'cils-' + level.toLowerCase(), part], textbook: { series: 'CILS', volume: level, unit: 'CILS ' + level + ' Adolescenti', section: PARTS[part].label } },
        ...extra
      };
      if (kind === 'grammar') pkg.grammar = { topic: 'cils-' + level.toLowerCase() + '-' + part, topicTitle: 'CILS ' + level + ' · ' + PARTS[part].label, difficulty: level === 'A1' ? 'mittel' : 'schwer', origin: 'own', order: (Object.keys(PARTS).indexOf(part) + 1) * 10 + (Number(prova) || 0) };
      pkg.set = set; // nur intern, fällt bei der Prüfung weg
      out.push({ part, prova, label, pkg });
      return pkg;
    };
    const A = ai.ascolto || {};
    if (A.p1) {
      const g = gaps(A.p1.testo, 'fill', set + 'a1');
      base('listening', 'ascolto', 1, A.p1.titolo, {
        media: { type: 'speech', text: spoken(A.p1.testo) },
        questions: [{ id: 'q1', type: 'gap_fill', prompt: 'Ascolta il testo. Completa il testo e scrivi le parole che mancano.', promptHelp: 'Hör den Text. Ergänze die fehlenden Wörter.', text: g.text, gaps: g.gaps }]
      });
    }
    if (A.p2) {
      const qs = arr(A.p2.domande).map((d, i) => choice('q' + (i + 1), d.inizio, d.opzioni, d.giusta));
      if (qs.length) qs[0].promptHelp = 'Hör den Text. Wähle für jeden Satz die richtige Fortsetzung.';
      base('listening', 'ascolto', 2, A.p2.titolo, { media: { type: 'speech', text: tidy(A.p2.testo) }, questions: qs });
    }
    if (A.p3) {
      const t = arr(A.p3.testi);
      base('listening', 'ascolto', 3, '', {
        media: { type: 'speech', text: t.map((x, i) => 'Testo ' + ['uno', 'due', 'tre', 'quattro', 'cinque'][i] + '.\n' + tidy(x.testo)).join('\n\n') },
        questions: t.map((x, i) => choice('q' + (i + 1), 'Testo ' + (i + 1) + ': scegli l’informazione presente nel testo.', x.opzioni, x.giusta, 'Text ' + (i + 1) + ': Wähle die Information, die im Text vorkommt.'))
      });
    }
    const L = ai.lettura || {};
    if (L.p1) {
      const qs = arr(L.p1.domande).map((d, i) => choice('q' + (i + 1), d.inizio, d.opzioni, d.giusta));
      if (qs.length) qs[0].promptHelp = 'Lies den Text. Wähle für jeden Satz die richtige Fortsetzung.';
      base('grammar', 'lettura', 1, L.p1.titolo, { reading: { title: tidy(L.p1.titolo), text: tidy(L.p1.testo) }, questions: qs });
    }
    if (L.p2) {
      const t = arr(L.p2.testi);
      base('grammar', 'lettura', 2, '', {
        reading: { text: t.map((x, i) => `${i + 1}. ${tidy(x.titolo)}\n${tidy(x.testo)}`).join('\n\n') },
        questions: t.map((x, i) => choice('q' + (i + 1), 'Testo ' + (i + 1) + (x.titolo ? ' · ' + tidy(x.titolo) : '') + ': scegli l’informazione presente nel testo.', x.opzioni, x.giusta, 'Text ' + (i + 1) + ': Wähle die Information, die im Text steht.'))
      });
    }
    if (L.p3) {
      const fini = L.p3.fini || {};
      const used = new Set();
      const pairs = arr(L.p3.inizi).map((x, i) => {
        const k = String(x.fine || '').trim().toUpperCase();
        if (!fini[k]) throw new Error('Lettura 3: Fortsetzung „' + k + '“ fehlt.');
        used.add(k);
        return { id: 'p' + (i + 1), left: s(`${tidy(x.titolo)}: ${tidy(x.testo)}`, 300), right: s(tidy(fini[k]), 300) };
      });
      const distractors = Object.keys(fini).filter(k => !used.has(k)).slice(0, 4).map(k => s(tidy(fini[k]), 300));
      base('grammar', 'lettura', 3, '', {
        questions: [{ id: 'q1', type: 'matching', prompt: 'Leggi i testi. Scegli le parti che completano i testi da 1 a 4. Quattro parti non servono.', promptHelp: 'Lies die Texte. Wähle die Fortsetzungen zu den Texten 1 bis 4. Vier Fortsetzungen passen nicht.', pairs, distractors }]
      });
    }
    const S = ai.strutture || {};
    ['p1', 'p2', 'p3'].forEach((p, i) => {
      if (!S[p]) return;
      const g = gaps(S[p].testo, p === 'p3' ? 'choice' : 'fill', set + 's' + p);
      const help = p === 'p3' ? 'Ergänze den Text. Wähle eines der drei Wörter.' : p === 'p2' ? 'Ergänze die Verben in der richtigen Form.' : 'Ergänze den Text.';
      base('grammar', 'strutture', i + 1, S[p].titolo, {
        questions: [{ id: 'q1', type: p === 'p3' ? 'gap_choice' : 'gap_fill', prompt: tidy(S[p].consegna || 'Completa il testo.'), promptHelp: help, text: g.text, gaps: g.gaps }]
      });
    });
    const W = arr(ai.scrittura);
    if (W.length)
      base('grammar', 'scrittura', 0, '', {
        questions: W.slice(0, 2).map((w, i) => ({ id: 'q' + (i + 1), type: 'open_answer', prompt: s(`Prova ${i + 1}: ${tidy(w.consegna)}${w.parole ? ` (${String(w.parole).replace('-', '–')} parole)` : ''}`, 1000), promptHelp: 'Schreibe einen kurzen Text. Vergleiche danach mit dem Mustertext.', modelAnswer: s(tidy(w.modello), 2000), lines: 8 }))
      });
    const O = ai.orale || {};
    if (O.p1 || O.p2) {
      const qs = [];
      if (O.p1)
        qs.push({ id: 'q1', type: 'open_answer', prompt: s('Prova 1 · Conversazione. Scegli una situazione e prepara il dialogo:\n' + arr(O.p1.situazioni).map((x, i) => `${i + 1}) ${tidy(x)}`).join('\n'), 1000), promptHelp: 'Rollenspiel: Wähle eine Situation. Die Lehrkraft spielt die andere Rolle.', modelAnswer: s(arr(O.p1.spunti).map(tidy).join('\n'), 2000), lines: 6 });
      if (O.p2)
        qs.push({ id: 'q2', type: 'open_answer', prompt: s('Prova 2 · Parla da solo/a. Scegli un argomento:\n' + arr(O.p2.argomenti).map((x, i) => `${i + 1}) ${tidy(x)}`).join('\n'), 1000), promptHelp: 'Kurzvortrag: Wähle ein Thema und sprich etwa anderthalb Minuten.', modelAnswer: s(arr(O.p2.spunti).map(tidy).join('\n'), 2000), lines: 6 });
      base('grammar', 'orale', 0, '', { questions: qs });
    }
    const notes = arr(ai.noteDocente).map(x => s(x, 300)).filter(Boolean).slice(0, 10);
    if (notes.length) out.forEach(o => (o.pkg.teacherNotes = { tips: notes }));
    if (!out.length) throw new Error('In der Antwort steht kein Prüfungsteil (ascolto, lettura, strutture, scrittura, orale).');
    return { level, tema, items: out };
  }

  function promptFor(command, inp) {
    const parts = Object.keys(PARTS).filter(k => inp.parts.includes(k));
    return [
      command.trim(),
      '',
      '## Eingaben',
      '',
      '- Niveau: ' + inp.level + ' Adolescenti',
      '- Prüfungsteile: ' + parts.map(k => k + ' (' + PARTS[k].de + ')').join(', '),
      '- Themenwunsch: ' + (String(inp.theme || '').trim() || 'frei wählen, abwechslungsreich'),
      inp.note ? '- Hinweise der Lehrkraft: ' + String(inp.note).trim() : null
    ]
      .filter(x => x !== null)
      .join('\n');
  }

  const api = { PARTS, build, promptFor, gaps, spoken };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.DajeCILS = api;
})(typeof window !== 'undefined' ? window : globalThis);

/* ---------- Oberfläche (nur im Browser) ---------- */
if (typeof document !== 'undefined') {
  const CILS_KEY = 'daje-cils-v1';
  const cilsState = () => {
    const d = read(CILS_KEY, null);
    return d && Array.isArray(d.sets) ? d : { form: { level: 'A1', parts: ['ascolto', 'lettura', 'strutture', 'scrittura', 'orale'], theme: '', note: '', answer: '' }, sets: [] };
  };
  let CILS = null;
  let cilsCommand = null;
  const cilsSave = () => save(CILS_KEY, CILS);
  const cilsLive = set => set.ids.filter(id => findTask(id));
  const cilsPartName = id => {
    const x = findTask(id);
    return x ? x.title.replace(/^CILS A\d · /, '') : id;
  };

  function cilsSetsHTML(limit) {
    const sets = CILS.sets.filter(st => cilsLive(st).length).slice(0, limit || 50);
    if (!sets.length) return '';
    return `<div class="cils-sets">${sets
      .map(st => {
        const ids = cilsLive(st);
        return `<article class="cils-set glass"><div class="cils-set-head"><span class="cils-badge">CILS ${esc(st.level)}</span><div><b>${esc(st.tema || 'Übungsprüfung')}</b><small>${new Date(st.created).toLocaleDateString('de-DE', { dateStyle: 'medium' })} · ${plural(ids.length, 'Teil', 'Teile')}</small></div></div>
          <ol class="cils-parts">${ids.map(id => `<li><button class="quiet" data-lesson="${esc(id)}">${esc(cilsPartName(id))}</button></li>`).join('')}</ol>
          <div class="cils-set-act"><button class="button primary" data-cils-mappe="${esc(st.id)}">Als Prüfungsheft drucken</button><button class="button secondary" data-cils-klasse="${esc(st.id)}">Klassensitzung starten</button><button class="quiet danger" data-cils-del="${esc(st.id)}">Löschen</button></div></article>`;
      })
      .join('')}</div>`;
  }

  function cilsPage() {
    CILS = CILS || cilsState();
    const f = CILS.form;
    $('breadcrumb').textContent = 'CILS-Training';
    const parts = Object.entries(DajeCILS.PARTS);
    $('main').innerHTML = `<div class="page cils-page">
      <button class="quiet back-link" data-nav="start">Mein Unterricht</button>
      <header class="page-head"><div class="eyebrow">Prüfungsvorbereitung</div><h1>CILS-Training</h1><p>Neue Übungsprüfungen im Format CILS A1 und A2 Adolescenti: Hören, Lesen, Strukturen, Schreiben und Sprechen. Die KI schreibt neue Texte im Prüfungsformat, daje macht daraus Übungen mit Lösungen, Vorlesestimme und Prüfungsheft.</p></header>
      <section class="cils-builder glass">
        <div class="cils-step"><span class="cils-n">1</span><div><h2>Prüfung zusammenstellen</h2>
          <div class="ws-seg" role="tablist" aria-label="Niveau">${['A1', 'A2'].map(l => `<button role="tab" aria-selected="${f.level === l}" data-cils-level="${l}">${l} Adolescenti</button>`).join('')}</div>
          <div class="cils-checks">${parts.map(([k, p]) => `<label class="cils-check"><input type="checkbox" data-cils-part="${k}" ${f.parts.includes(k) ? 'checked' : ''}><span><b>${esc(p.label)}</b><small>${esc(p.de)}${p.p.length ? ' · 3 Prove' : k === 'scrittura' ? ' · 2 Aufgaben' : ' · Rollenspiel und Kurzvortrag'}</small></span></label>`).join('')}</div>
          <label class="field">Thema (optional)<input data-cils-f="theme" value="${esc(f.theme)}" placeholder="z. B. Schule und Freizeit, Reisen, Feste in Italien"></label>
          <label class="field">Hinweise für die KI (optional)<input data-cils-f="note" value="${esc(f.note)}" placeholder="z. B. Wortschatz aus Lektion 4, kein passato prossimo"></label>
        </div></div>
        <div class="cils-step"><span class="cils-n">2</span><div><h2>Auftrag an die KI</h2><p class="muted">Kopieren und in ChatGPT, Claude oder Gemini einfügen. Die Kommandodatei beschreibt Aufbau, Umfang und Niveau jeder Prova.</p>
          <div class="studio-actions"><button class="button primary" data-cils-copy>Auftrag kopieren</button><a class="button secondary" href="imports/KI-CILS.md" target="_blank" rel="noopener">Kommandodatei ansehen</a></div><p class="small muted" id="cils-copy-status" role="status"></p></div></div>
        <div class="cils-step"><span class="cils-n">3</span><div><h2>Antwort einfügen</h2>
          <textarea class="cils-answer" data-cils-f="answer" rows="6" placeholder="Antwort der KI hier einfügen ({ … })">${esc(f.answer)}</textarea>
          <div class="studio-actions"><button class="button primary" data-cils-build>Übungen erstellen</button></div><div id="cils-result"></div></div></div>
      </section>
      ${CILS.sets.some(st => cilsLive(st).length) ? `<h2 class="cils-h">Deine Übungsprüfungen</h2>${cilsSetsHTML()}` : ''}
      <p class="small muted cils-note">Format nach veröffentlichten CILS-Heften A1/A2 Adolescenti (Università per Stranieri di Siena). Die Texte sind neu und keine Originalaufgaben; die Hörtexte liest die Stimme des Geräts vor.</p>
    </div>`;
  }

  async function cilsCopy() {
    const st = $('cils-copy-status');
    const f = CILS.form;
    if (!f.parts.length) return (st.textContent = 'Bitte mindestens einen Prüfungsteil wählen.');
    const job = kiLoad('imports/KI-CILS.md', cilsCommand).then(c => DajeCILS.promptFor((cilsCommand = c), f));
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
      const r = DajeCILS.build(ai, { level: CILS.form.level, id: edNewId, set: setId });
      if (editorState.items.length + r.items.length > 100) throw new Error('Höchstens 100 eigene Inhalte. Bitte zuerst alte löschen.');
      const bad = [];
      const now = new Date().toISOString();
      const ids = [];
      r.items.forEach(({ pkg, label }) => {
        delete pkg.set;
        const v = TheisContent.validatePackage(pkg);
        if (!v.ok) bad.push(label + ': ' + v.errors.slice(0, 2).map(e => e.path + ' ' + e.message).join('; '));
        editorState.items.unshift({ payload: v.ok ? v.value : null, draft: pkg, status: v.ok ? 'published' : 'draft', updatedAt: now });
        ids.push(pkg.id);
      });
      saveEditorState();
      CILS.sets.unshift({ id: setId, level: r.level, tema: r.tema, created: now, ids });
      CILS.form.answer = '';
      cilsSave();
      cilsPage();
      toast(`${plural(ids.length - bad.length, 'Teil', 'Teile')} erstellt${bad.length ? `, ${bad.length} als Entwurf (bitte in „Eigene Übungen“ prüfen)` : ''}.`);
      if (bad.length) $('cils-result').innerHTML = `<div class="validation-errors"><b>Noch zu prüfen</b><ul>${bad.map(b => `<li>${esc(b)}</li>`).join('')}</ul></div>`;
    } catch (err) {
      out.innerHTML = `<div class="validation-errors"><b>Noch nicht übernommen</b><p>${esc(err.message)}</p></div>`;
    }
  }

  // Prüfungsheft: alle Teile als ein Heft (Aufgaben, Lösungen mit Hörtexten oder Kurzschlüssel); die Mappe bleibt unberührt
  function cilsPrint(st, sol) {
    const ids = cilsLive(st);
    docCurrent = { kind: 'cils', solutions: sol, set: st.id };
    const title = 'CILS ' + st.level + ' Adolescenti' + (st.tema ? ' · ' + st.tema : '');
    const texts =
      sol === 1
        ? ids
            .map(id => findTask(id))
            .filter(x => x && x.media?.type === 'speech')
            .map(x => `<section class="hb-tr"><h3>Testo · ${esc(x.title.replace(/^CILS A\d · /, ''))}</h3>${x.media.text.split(/\n+/).map(l => `<p>${esc(l)}</p>`).join('')}</section>`)
            .join('')
        : '';
    const side =
      dlgBlock('Ausgabe', dlgSeg('data-cils-mode', 'cils-mode', [[0, 'Prüfungsheft'], [1, 'Lösungen und Hörtexte'], [2, 'Kurzer Schlüssel']], sol)) +
      dlgBlock('Sprache der Anweisungen', dlgSeg('data-instr="pref"', 'instr', [['target', 'Zielsprache'], ['de', 'Deutsch']], instrPref)) +
      dlgBlock('Design', dlgDesigns()) + dlgBlock('Schrift', dlgFonts()) + dlgBlock('Farbe', dlgAccents());
    dlgShow({ title, side, paper: wsSheetHTML([ids], sol, { title, rule: false }).replace(/(<\/div>)\s*$/, texts + '$1') });
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.cilsLevel) {
      CILS.form.level = b.dataset.cilsLevel;
      cilsSave();
      return cilsPage();
    }
    if (b.hasAttribute('data-cils-copy')) return cilsCopy();
    if (b.hasAttribute('data-cils-build')) return cilsBuild();
    const st = id => CILS.sets.find(x => x.id === id);
    if (b.dataset.cilsMappe) return cilsPrint(st(b.dataset.cilsMappe), 0);
    if (b.dataset.cilsKlasse) {
      const set = st(b.dataset.cilsKlasse);
      if (typeof klLinkDialog === 'function') return klLinkDialog(cilsLive(set), 'CILS ' + set.level + (set.tema ? ' · ' + set.tema : ''));
    }
    if (b.dataset.cilsDel) {
      if (!confirm('Diese Übungsprüfung mit allen Teilen löschen?')) return;
      const set = st(b.dataset.cilsDel);
      editorState.items = editorState.items.filter(i => !set.ids.includes(edId(i)));
      saveEditorState();
      CILS.sets = CILS.sets.filter(x => x !== set);
      cilsSave();
      return view === 'cils' ? cilsPage() : render();
    }
  });
  document.addEventListener('change', e => {
    if (docCurrent?.kind === 'cils' && (e.target.matches('input[data-cils-mode]') || e.target.matches('input[data-instr="pref"]'))) {
      const set = CILS.sets.find(x => x.id === docCurrent.set);
      if (set) setTimeout(() => cilsPrint(set, e.target.matches('[data-cils-mode]') ? Number(e.target.value) : docCurrent.solutions), 0);
      return;
    }
    const k = e.target.dataset?.cilsPart;
    if (!k) return;
    const p = new Set(CILS.form.parts);
    e.target.checked ? p.add(k) : p.delete(k);
    CILS.form.parts = Object.keys(DajeCILS.PARTS).filter(x => p.has(x));
    cilsSave();
  });
  document.addEventListener('input', e => {
    const k = e.target.dataset?.cilsF;
    if (!k) return;
    CILS.form[k] = e.target.value;
    cilsSave();
  });

  {
    const relayout = dlgRelayout;
    dlgRelayout = function () {
      const set = docCurrent?.kind === 'cils' && CILS.sets.find(x => x.id === docCurrent.set);
      return set ? cilsPrint(set, docCurrent.solutions) : relayout.apply(this, arguments);
    };
    const baseRender = render;
    render = function () {
      if (!session && view === 'cils') return cilsPage();
      return baseRender.apply(this, arguments);
    };
  }
  window.cilsSetsHTML = limit => ((CILS = CILS || cilsState()), cilsSetsHTML(limit));
}
