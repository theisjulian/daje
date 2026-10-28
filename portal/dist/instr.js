/* Anweisungssprache: Aufgabenblätter und Übungen in Zielsprache (Standard) oder Deutsch */
const INSTR_KEY = 'daje-instr-v1';
const INSTR = {
  de: {},
  it: { 'Frage': 'Domanda', 'Richtig': 'Vero', 'Falsch': 'Falso', 'Mehrere Antworten sind richtig.': 'Più risposte sono corrette.', 'Wähle für jeden Schritt die Position.': 'Scegli la posizione di ogni passaggio.', 'Wählen': 'Scegli', 'Deine Antwort': 'La tua risposta', 'Kurz antworten': 'Rispondi in breve', 'Richtig erkannt': 'Risposta corretta', 'Noch nicht erkannt': 'Non ancora corretta', 'Noch keine Antwort': 'Nessuna risposta', 'Lösung:': 'Soluzione:', 'Andere passende Formulierungen sind möglich. Vergleiche selbst mit der Musterlösung.': 'Sono possibili altre formulazioni. Confronta con la risposta modello.', 'Weitere Varianten:': 'Altre varianti:', 'Weitere hinterlegte Varianten:': 'Altre varianti:', 'Aufgabenblatt': 'Scheda di lavoro', 'Lösungsschlüssel': 'Soluzioni', 'Name:': 'Nome:', 'Datum:': 'Data:', 'Medium und Quelle': 'Fonte', 'Reihenfolge:': 'Ordine:', 'Minuten Übungszeit': 'minuti di lavoro', 'ca.': 'circa', 'Nicht im Text': 'Non detto', 'Wähle alle Wörter, die du hörst.': 'Scegli tutte le parole che senti.', 'Die durchgestrichenen Wörter sind falsch. Schreibe das richtige Wort.': 'Le parole barrate sono sbagliate. Scrivi la parola giusta.', 'Mögliche Lösung': 'Possibile soluzione', 'Vergleiche deine Antwort selbst mit der möglichen Lösung.': 'Confronta la tua risposta con la possibile soluzione.', fmt: { sentence_completion: 'Completa le frasi', true_false_ng: 'Vero / Falso / Non detto', word_select: 'Parole ascoltate', gap_choice: 'Completamento a scelta', note_fill: 'Appunti', table_fill: 'Tabella', error_correction: 'Correggi gli errori', speaker_match: 'Chi lo dice?', categorize: 'Classificazione', open_answer: 'Risposta aperta', single_choice: 'Scelta singola', true_false: 'Vero / Falso', short_answer: 'Risposta breve', multiple_choice: 'Scelta multipla', matching: 'Abbinamento', ordering: 'Riordino', gap_fill: 'Completamento' } },
  en: { 'Frage': 'Question', 'Richtig': 'True', 'Falsch': 'False', 'Mehrere Antworten sind richtig.': 'More than one answer is correct.', 'Wähle für jeden Schritt die Position.': 'Choose the position of each step.', 'Wählen': 'Choose', 'Deine Antwort': 'Your answer', 'Kurz antworten': 'Answer briefly', 'Richtig erkannt': 'Correct', 'Noch nicht erkannt': 'Not quite yet', 'Noch keine Antwort': 'No answer yet', 'Lösung:': 'Solution:', 'Andere passende Formulierungen sind möglich. Vergleiche selbst mit der Musterlösung.': 'Other wordings are possible. Compare with the model answer.', 'Weitere Varianten:': 'Other variants:', 'Weitere hinterlegte Varianten:': 'Other variants:', 'Aufgabenblatt': 'Worksheet', 'Lösungsschlüssel': 'Answer key', 'Name:': 'Name:', 'Datum:': 'Date:', 'Medium und Quelle': 'Source', 'Reihenfolge:': 'Order:', 'Minuten Übungszeit': 'minutes', 'ca.': 'about', 'Nicht im Text': 'Not given', 'Wähle alle Wörter, die du hörst.': 'Choose all the words you hear.', 'Die durchgestrichenen Wörter sind falsch. Schreibe das richtige Wort.': 'The crossed-out words are wrong. Write the correct word.', 'Mögliche Lösung': 'Possible answer', 'Vergleiche deine Antwort selbst mit der möglichen Lösung.': 'Compare your answer with the possible answer.', fmt: { sentence_completion: 'Sentence completion', true_false_ng: 'True / False / Not given', word_select: 'Words you hear', gap_choice: 'Choose the word', note_fill: 'Complete the notes', table_fill: 'Complete the table', error_correction: 'Correct the mistakes', speaker_match: 'Who says what?', categorize: 'Sort into groups', open_answer: 'Open answer', single_choice: 'Single choice', true_false: 'True / False', short_answer: 'Short answer', multiple_choice: 'Multiple choice', matching: 'Matching', ordering: 'Put in order', gap_fill: 'Fill in the gaps' } },
  fr: { 'Frage': 'Question', 'Richtig': 'Vrai', 'Falsch': 'Faux', 'Mehrere Antworten sind richtig.': 'Plusieurs réponses sont correctes.', 'Wähle für jeden Schritt die Position.': 'Choisis la position de chaque étape.', 'Wählen': 'Choisir', 'Deine Antwort': 'Ta réponse', 'Kurz antworten': 'Réponds brièvement', 'Richtig erkannt': 'Bonne réponse', 'Noch nicht erkannt': 'Pas encore juste', 'Noch keine Antwort': 'Pas de réponse', 'Lösung:': 'Solution :', 'Andere passende Formulierungen sind möglich. Vergleiche selbst mit der Musterlösung.': 'D’autres formulations sont possibles. Compare avec la réponse modèle.', 'Weitere Varianten:': 'Autres variantes :', 'Weitere hinterlegte Varianten:': 'Autres variantes :', 'Aufgabenblatt': 'Fiche de travail', 'Lösungsschlüssel': 'Corrigé', 'Name:': 'Nom :', 'Datum:': 'Date :', 'Medium und Quelle': 'Source', 'Reihenfolge:': 'Ordre :', 'Minuten Übungszeit': 'minutes', 'ca.': 'environ', 'Nicht im Text': 'Non mentionné', 'Wähle alle Wörter, die du hörst.': 'Choisis tous les mots que tu entends.', 'Die durchgestrichenen Wörter sind falsch. Schreibe das richtige Wort.': 'Les mots barrés sont faux. Écris le bon mot.', 'Mögliche Lösung': 'Réponse possible', 'Vergleiche deine Antwort selbst mit der möglichen Lösung.': 'Compare ta réponse avec la réponse possible.', fmt: { sentence_completion: 'Phrases à compléter', true_false_ng: 'Vrai / Faux / Non mentionné', word_select: 'Mots entendus', gap_choice: 'Texte à choix', note_fill: 'Prise de notes', table_fill: 'Tableau', error_correction: 'Corrige les erreurs', speaker_match: 'Qui dit quoi ?', categorize: 'Classement', open_answer: 'Réponse libre', single_choice: 'Choix unique', true_false: 'Vrai / Faux', short_answer: 'Réponse courte', multiple_choice: 'Choix multiple', matching: 'Association', ordering: 'Remettre dans l’ordre', gap_fill: 'Texte à trous' } },
  es: { 'Frage': 'Pregunta', 'Richtig': 'Verdadero', 'Falsch': 'Falso', 'Mehrere Antworten sind richtig.': 'Hay más de una respuesta correcta.', 'Wähle für jeden Schritt die Position.': 'Elige la posición de cada paso.', 'Wählen': 'Elegir', 'Deine Antwort': 'Tu respuesta', 'Kurz antworten': 'Responde brevemente', 'Richtig erkannt': 'Correcto', 'Noch nicht erkannt': 'Aún no es correcto', 'Noch keine Antwort': 'Sin respuesta', 'Lösung:': 'Solución:', 'Andere passende Formulierungen sind möglich. Vergleiche selbst mit der Musterlösung.': 'Son posibles otras formulaciones. Compara con la respuesta modelo.', 'Weitere Varianten:': 'Otras variantes:', 'Weitere hinterlegte Varianten:': 'Otras variantes:', 'Aufgabenblatt': 'Hoja de trabajo', 'Lösungsschlüssel': 'Soluciones', 'Name:': 'Nombre:', 'Datum:': 'Fecha:', 'Medium und Quelle': 'Fuente', 'Reihenfolge:': 'Orden:', 'Minuten Übungszeit': 'minutos', 'ca.': 'unos', 'Nicht im Text': 'No se menciona', 'Wähle alle Wörter, die du hörst.': 'Elige todas las palabras que oyes.', 'Die durchgestrichenen Wörter sind falsch. Schreibe das richtige Wort.': 'Las palabras tachadas son incorrectas. Escribe la palabra correcta.', 'Mögliche Lösung': 'Respuesta posible', 'Vergleiche deine Antwort selbst mit der möglichen Lösung.': 'Compara tu respuesta con la respuesta posible.', fmt: { sentence_completion: 'Completa las frases', true_false_ng: 'Verdadero / Falso / No se menciona', word_select: 'Palabras que oyes', gap_choice: 'Elige la palabra', note_fill: 'Completa las notas', table_fill: 'Completa la tabla', error_correction: 'Corrige los errores', speaker_match: '¿Quién dice qué?', categorize: 'Clasifica', open_answer: 'Respuesta abierta', single_choice: 'Elección única', true_false: 'Verdadero / Falso', short_answer: 'Respuesta corta', multiple_choice: 'Elección múltiple', matching: 'Emparejar', ordering: 'Ordenar', gap_fill: 'Completar' } }
};
let instrPref = (() => { try { return localStorage.getItem(INSTR_KEY) === 'de' ? 'de' : 'target'; } catch (e) { return 'target'; } })();
let instrCtx = 'de';
function setInstrPref(v) { instrPref = v === 'de' ? 'de' : 'target'; try { localStorage.setItem(INSTR_KEY, instrPref); } catch (e) {} }
function instrFor(lang) { return instrPref === 'de' ? 'de' : INSTR[lang] ? lang : 'de'; }
function instrApply(html, lang) {
  const L = instrFor(lang);
  if (L === 'de') return html;
  const t = INSTR[L];
  let out = html;
  // Reihenfolge: lange Schluessel zuerst, nur exakt zwischen Tags bzw. als Textfragment ersetzen
  Object.keys(t).filter(k => k !== 'fmt').sort((a, b) => b.length - a.length).forEach(k => {
    const esc1 = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp('(>|\\s|^|“|„)' + esc1 + '(?=<|\\s|$|&nbsp;|:)', 'g'), (m, p) => p + t[k]);
  });
  Object.keys(LISTENING_FORMAT_LABELS).forEach(k => { out = out.split('>' + LISTENING_FORMAT_LABELS[k] + '<').join('>' + t.fmt[k] + '<'); });
  return out;
}
{
  const baseQ = questionHTML;
  questionHTML = function (x, q, i, st) {
    instrCtx = x.language;
    return instrApply(baseQ(x, q, i, st), x.language).replace(/placeholder="Kurz antworten"/, 'placeholder="' + (instrFor(x.language) === 'de' ? 'Kurz antworten' : INSTR[instrFor(x.language)]['Kurz antworten']) + '"');
  };
  const baseS = solutionText;
  solutionText = function (q) {
    if (q.type === 'true_false') { const t = INSTR[instrFor(instrCtx)] || {}; return q.answer ? t['Richtig'] || 'Richtig' : t['Falsch'] || 'Falsch'; }
    return baseS(q);
  };
  const baseP = printTeaching;
  printTeaching = function (solutions) {
    const x = findTask(teacherLessonId);
    instrCtx = x ? x.language : 'de';
    baseP(solutions);
    const sheet = $('teaching-print');
    if (!sheet || !x) return;
    const body = [...sheet.children].filter(n => !n.classList.contains('print-controls'));
    body.forEach(n => { if (n.tagName !== 'OL' && !n.classList.contains('doc-foot')) n.innerHTML = instrApply(n.innerHTML, x.language); });
    sheet.querySelectorAll('ol li').forEach(li => { li.innerHTML = instrApply(li.innerHTML, x.language); });
    sheet.querySelectorAll('footer h3').forEach(h => { h.innerHTML = instrApply(h.innerHTML, x.language); });
    const pick = sheet.querySelector('.doc-actions');
    if (pick && !pick.querySelector('[data-instr]'))
      pick.insertAdjacentHTML('afterbegin', `<label class="doc-design">Anweisungen <select data-instr="pref"><option value="target" ${instrPref === 'target' ? 'selected' : ''}>in der Zielsprache</option><option value="de" ${instrPref === 'de' ? 'selected' : ''}>auf Deutsch</option></select></label>`);
  };
  document.addEventListener('change', e => {
    const s = e.target.closest('select[data-instr]');
    if (!s) return;
    setInstrPref(s.value);
    if (docCurrent && docCurrent.kind === 'listening') printTeaching(docCurrent.solutions);
    else if (typeof renderListening === 'function' && document.getElementById('listening-form')) renderListening();
  });
}
