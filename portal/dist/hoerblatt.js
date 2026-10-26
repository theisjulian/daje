/* Hörblatt: Aufgabenblatt und Lösungen als A4-Dokument, Sprache der Anweisungen waehlbar */
const HB_TXT = {
  it: { lang: 'Italiano', min: n => `circa ${n} minuti`, sheet: 'Ascolto · scheda di lavoro', key: 'Ascolto · soluzioni', name: 'Nome', cls: 'Classe', date: 'Data', pts: 'Punti', pt: p => (p === 1 ? '1 punto' : p + ' punti'), listen: 'Leggi prima le domande, poi ascolta il testo.', online: 'Ascolto online', src: 'Fonte', tr: 'Trascrizione', demo: 'Testo di esempio letto da una voce sintetica.',
    ins: { single_choice: 'Segna l’unica risposta corretta.', multiple_choice: 'Segna tutte le risposte corrette.', true_false: 'Vero o falso? Segna la risposta giusta.', matching: 'Abbina: scrivi la lettera giusta accanto a ogni numero.', ordering: 'Metti in ordine: scrivi i numeri da 1 a {n}.', gap_fill: 'Completa gli spazi vuoti.', short_answer: 'Rispondi in breve.' }, T: 'Vero', F: 'Falso' },
  en: { lang: 'English', min: n => `about ${n} minutes`, sheet: 'Listening · worksheet', key: 'Listening · answer key', name: 'Name', cls: 'Class', date: 'Date', pts: 'Score', pt: p => (p === 1 ? '1 mark' : p + ' marks'), listen: 'Read the questions first, then listen to the recording.', online: 'Listen online', src: 'Source', tr: 'Transcript', demo: 'Sample text read by a synthetic voice.',
    ins: { single_choice: 'Tick the one correct answer.', multiple_choice: 'Tick all correct answers.', true_false: 'True or false? Tick the right answer.', matching: 'Match: write the correct letter next to each number.', ordering: 'Put in order: write the numbers 1 to {n}.', gap_fill: 'Fill in the gaps.', short_answer: 'Answer briefly.' }, T: 'True', F: 'False' },
  fr: { lang: 'Français', min: n => `environ ${n} minutes`, sheet: 'Écoute · fiche de travail', key: 'Écoute · corrigé', name: 'Nom', cls: 'Classe', date: 'Date', pts: 'Points', pt: p => (p === 1 ? '1 point' : p + ' points'), listen: 'Lis d’abord les questions, puis écoute l’enregistrement.', online: 'Écouter en ligne', src: 'Source', tr: 'Transcription', demo: 'Texte d’exemple lu par une voix de synthèse.',
    ins: { single_choice: 'Coche la seule réponse correcte.', multiple_choice: 'Coche toutes les réponses correctes.', true_false: 'Vrai ou faux ? Coche la bonne réponse.', matching: 'Associe : écris la bonne lettre à côté de chaque numéro.', ordering: 'Remets dans l’ordre : écris les numéros de 1 à {n}.', gap_fill: 'Complète les trous.', short_answer: 'Réponds brièvement.' }, T: 'Vrai', F: 'Faux' },
  es: { lang: 'Español', min: n => `unos ${n} minutos`, sheet: 'Comprensión auditiva · ficha', key: 'Comprensión auditiva · soluciones', name: 'Nombre', cls: 'Clase', date: 'Fecha', pts: 'Puntos', pt: p => (p === 1 ? '1 punto' : p + ' puntos'), listen: 'Lee primero las preguntas y después escucha la grabación.', online: 'Escuchar en línea', src: 'Fuente', tr: 'Transcripción', demo: 'Texto de ejemplo leído por una voz sintética.',
    ins: { single_choice: 'Marca la única respuesta correcta.', multiple_choice: 'Marca todas las respuestas correctas.', true_false: '¿Verdadero o falso? Marca la respuesta correcta.', matching: 'Relaciona: escribe la letra correcta junto a cada número.', ordering: 'Ordena: escribe los números del 1 al {n}.', gap_fill: 'Completa los huecos.', short_answer: 'Responde brevemente.' }, T: 'Verdadero', F: 'Falso' },
  de: { lang: null, min: n => `ca. ${n} Minuten`, sheet: 'Hörverstehen · Aufgabenblatt', key: 'Hörverstehen · Lösungsschlüssel', name: 'Name', cls: 'Klasse', date: 'Datum', pts: 'Punkte', pt: p => (p === 1 ? '1 Punkt' : p + ' Punkte'), listen: 'Lies zuerst die Aufgaben, dann hörst du den Text.', online: 'Online anhören', src: 'Quelle', tr: 'Transkript', demo: 'Beispieltext, gelesen mit synthetischer Stimme.',
    ins: { single_choice: 'Kreuze die eine richtige Antwort an.', multiple_choice: 'Kreuze alle richtigen Antworten an.', true_false: 'Richtig oder falsch? Kreuze an.', matching: 'Ordne zu: Schreibe den passenden Buchstaben neben jede Zahl.', ordering: 'Bringe in die richtige Reihenfolge: Schreibe die Zahlen 1 bis {n}.', gap_fill: 'Ergänze die Lücken.', short_answer: 'Antworte kurz.' }, T: 'Richtig', F: 'Falsch' }
};
let hbOpt = { link: true, transcript: false, solutions: false };
const hbLetters = 'ABCDEFGHIJ';
function hbPoints(q) {
  if (q.type === 'matching') return q.pairs.length;
  if (q.type === 'gap_fill') return q.gaps.length;
  return 1;
}
function hbBody(q, t, sol) {
  const o = txt => `<div class="hb-o"><i class="bx"></i><span>${esc(txt)}</span></div>`;
  switch (q.type) {
    case 'single_choice':
    case 'multiple_choice':
      return q.options.map((op, i) => `<div class="hb-o ${sol && (q.correctOptionId === op.id || (q.correctOptionIds || []).includes(op.id)) ? 'ok' : ''}"><i class="bx"></i><span><b>${hbLetters[i]}</b> ${esc(op.text)}</span></div>`).join('');
    case 'true_false':
      return `<div class="hb-tf"><div class="hb-o ${sol && q.answer ? 'ok' : ''}"><i class="bx"></i><span>${esc(t.T)}</span></div><div class="hb-o ${sol && !q.answer ? 'ok' : ''}"><i class="bx"></i><span>${esc(t.F)}</span></div></div>`;
    case 'matching': {
      const right = seededOrder([...q.pairs.map(p => ({ id: p.id, text: p.right })), ...q.distractors.map((d, i) => ({ id: 'x' + i, text: d }))], q.id);
      const letter = id => hbLetters[right.findIndex(r => r.id === id)];
      return `<div class="hb-match"><div>${q.pairs.map((p, i) => `<div class="hb-m"><b>${i + 1}</b><span>${esc(p.left)}</span><em class="${sol ? 'filled' : ''}">${sol ? letter(p.id) : ''}</em></div>`).join('')}</div><div>${right.map((r, i) => `<div class="hb-r"><b>${hbLetters[i]}</b><span>${esc(r.text)}</span></div>`).join('')}</div></div>`;
    }
    case 'ordering':
      return seededOrder(q.items, q.id).map(it => `<div class="hb-o"><i class="bx num ${sol ? 'filled' : ''}">${sol ? q.items.findIndex(z => z.id === it.id) + 1 : ''}</i><span>${esc(it.text)}</span></div>`).join('');
    case 'gap_fill': {
      let html = '', last = 0, n = 0;
      for (const m of q.text.matchAll(GAP_MARK)) {
        const g = q.gaps.find(v => v.id === m[1]);
        html += esc(q.text.slice(last, m.index)) + `<span class="gp ${sol ? 'filled' : ''}">${sol ? esc(g.acceptedAnswers[0]) : ''}</span>`;
        last = m.index + m[0].length;
        n++;
      }
      return `<p class="hb-gap">${html}${esc(q.text.slice(last))}</p>`;
    }
    default:
      return sol ? '' : '<div class="hb-line"></div><div class="hb-line"></div>';
  }
}
function hbHTML(x, sol) {
  const L = instrFor(x.language) === 'de' ? 'de' : x.language;
  const t = HB_TXT[L] || HB_TXT.de;
  const lang = t.lang || portalLang(x.language);
  const total = x.questions.reduce((s, q) => s + hbPoints(q), 0);
  const local = editorState.items.some(i => i.payload?.id === x.id) && !STOCK_PACKAGES.some(s => s.id === x.id);
  const link = location.origin + location.pathname + '?hoeren=' + encodeURIComponent(x.id);
  instrCtx = x.language;
  const qs = x.questions.map((q, i) => {
    const ins = (t.ins[q.type] || '').replace('{n}', q.items ? q.items.length : '');
    return `<li class="hb-q"><div class="hb-qh"><b class="n">${i + 1}</b><span class="hb-pt">${esc(t.pt(hbPoints(q)))}</span><div class="hb-ins">${esc(ins)}</div><div class="hb-p">${esc(q.prompt)}</div></div>${hbBody(q, t, sol)}${sol && q.explanation ? `<p class="hb-ex">${esc(q.explanation)}</p>` : ''}</li>`;
  }).join('');
  const speech = x.media.type === 'speech';
  return `<div class="hb"><header class="hb-top"><b>theis · ${DOC_BRAND}</b><span>${esc(sol ? t.key : t.sheet)}</span></header>
  <h1>${esc(x.title)}</h1>
  <div class="hb-meta"><span>${esc(lang)}</span><span>${esc(x.level)}</span><span>${esc(t.min(x.estimatedMinutes))}</span></div>
  ${sol ? '' : `<table class="hb-id"><tr><td>${esc(t.name)}</td><td>${esc(t.cls)}</td><td>${esc(t.date)}</td><td class="pts">${esc(t.pts)} &nbsp; / ${total}</td></tr></table>`}
  ${sol ? '' : `<div class="hb-box"><b>${esc(t.listen)}</b>${hbOpt.link && !local && !speech ? `<span>${esc(t.online)}: ${esc(link)}</span>${typeof qrSVG === 'function' ? `<i class="hb-qr">${qrSVG(link, 'QR')}</i>` : ''}` : ''}</div>`}
  <ol class="hb-list">${qs}</ol>
  ${sol && hbOpt.transcript && x.transcript ? `<section class="hb-tr"><h3>${esc(t.tr)}</h3><p>${esc(x.transcript).replace(/\n+/g, '<br>')}</p></section>` : ''}
  <footer class="hb-src"><b>${esc(t.src)}</b> ${x.sources.map(s => esc(s.citation)).join(' · ')}${speech ? ' · ' + esc(t.demo) : ''}</footer>
  ${docFooter()}</div>`;
}
printTeaching = function (solutions) {
  const x = contentList('listening').find(x => x.id === teacherLessonId);
  if (!x) return;
  hbOpt.solutions = !!solutions;
  docCurrent = { kind: 'listening', solutions: !!solutions };
  let sheet = $('teaching-print');
  if (!sheet) { sheet = document.createElement('section'); sheet.id = 'teaching-print'; document.body.append(sheet); }
  sheet.dataset.design = docState.design;
  sheet.classList.add('hb-mode');
  sheet.style.setProperty('--doc-ac', getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#1a6dff');
  const pick = `<label class="doc-design">Ausgabe <select data-hb="mode"><option value="0" ${solutions ? '' : 'selected'}>Aufgabenblatt</option><option value="1" ${solutions ? 'selected' : ''}>Lösungsschlüssel</option></select></label>
    <label class="doc-design">Anweisungen <select data-instr="pref"><option value="target" ${instrPref === 'target' ? 'selected' : ''}>in der Zielsprache</option><option value="de" ${instrPref === 'de' ? 'selected' : ''}>auf Deutsch</option></select></label>`;
  const opts = `<div class="doc-options"><label><input type="checkbox" data-hb-opt="link" ${hbOpt.link ? 'checked' : ''}>Link zum Anhören aufdrucken</label>${x.transcript ? `<label><input type="checkbox" data-hb-opt="transcript" ${hbOpt.transcript ? 'checked' : ''}>Transkript im Lösungsschlüssel</label>` : ''}</div>`;
  sheet.innerHTML = docControls(designPicker() + pick) + opts + hbHTML(x, !!solutions);
  if ($('teaching-dialog')?.open) $('teaching-dialog').close();
  document.body.classList.add('previewing-teaching');
};
document.addEventListener('change', e => {
    const o = e.target.closest('[data-hb-opt]');
  if (o) { hbOpt[o.dataset.hbOpt] = o.checked; printTeaching(hbOpt.solutions); }
});
