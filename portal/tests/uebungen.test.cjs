// Alle ausgelieferten Übungen: Musterlösung wird als richtig bewertet, typische Fehler nicht.
// (Grundstock, Hörpakete samt Erweiterungen, Arbeitskatalog)
const fs = require('node:fs'),
  vm = require('node:vm'),
  path = require('node:path'),
  assert = require('node:assert/strict');
const D = path.join(__dirname, '..', 'dist');
const { validatePackage, assessAnswer, scoreAnswer, normAnswer: N } = require(path.join(D, 'content-contract.js'));
const ctx = {};
vm.createContext(ctx);
for (const [f, g] of [
  ['stock-data.js', 'STOCK_PACKAGES'],
  ['listening-data.js', 'LISTENING_SEEDS'],
  ['review-data.js', 'LISTENING_REVIEW_SEEDS'],
  ['listening-extra.js', 'LISTENING_EXTRA']
])
  vm.runInContext(fs.readFileSync(path.join(D, f), 'utf8') + `;this.${g}=${g};`, ctx);
const all = [...ctx.STOCK_PACKAGES, ...ctx.LISTENING_SEEDS, ...ctx.LISTENING_REVIEW_SEEDS].map(p => structuredClone(p));
for (const p of all) {
  const e = ctx.LISTENING_EXTRA[p.id];
  if (e) p.questions = [...e.pre, ...p.questions, ...e.post];
}
const errors = [];
const seen = new Set();
let n = 0;
for (const raw of all) {
  if (seen.has(raw.id)) errors.push(raw.id + ': doppelte Paket-ID');
  seen.add(raw.id);
  const v = validatePackage(raw);
  if (!v.ok) {
    errors.push(raw.id + ': ungültig – ' + v.errors.slice(0, 2).join('; '));
    continue;
  }
  for (const q of v.value.questions || []) {
    n++;
    const bad = m => errors.push(`${raw.id} ${q.id} (${q.type}): ${m}`);
    const ok = r => assessAnswer(q, r);
    const obj = (list, val) => JSON.stringify(Object.fromEntries(list.map(x => [x.id, val(x)])));
    const dup = (list, what) => {
      const s = new Set();
      for (const x of list) {
        if (s.has(x)) bad(what + ' doppelt: ' + x);
        s.add(x);
      }
    };
    let right, wrong;
    switch (q.type) {
      case 'single_choice':
        right = q.correctOptionId;
        dup(q.options.map(o => N(o.text)), 'Option');
        for (const o of q.options) if (o.id !== q.correctOptionId && ok(o.id)) bad('falsche Option richtig');
        break;
      case 'multiple_choice':
      case 'word_select':
        right = q.correctOptionIds.join(',');
        dup(q.options.map(o => N(o.text)), 'Option');
        if (q.correctOptionIds.length > 1) wrong = q.correctOptionIds.slice(1).join(',');
        break;
      case 'true_false':
        right = String(q.answer);
        wrong = String(!q.answer);
        break;
      case 'true_false_ng':
        right = q.answer;
        break;
      case 'short_answer':
        right = q.acceptedAnswers[0];
        wrong = 'xyz';
        break;
      case 'matching':
        right = obj(q.pairs, x => x.id);
        dup(q.pairs.map(x => x.left), 'linke Seite');
        for (const d of q.distractors || []) if (q.pairs.some(x => N(x.right) === N(d))) bad('Ablenker ist eine Lösung: ' + d);
        break;
      case 'ordering':
        right = obj(q.items, x => q.items.indexOf(x) + 1);
        if (N(q.items[0].text) !== N(q.items[1].text))
          wrong = JSON.stringify({ ...JSON.parse(right), [q.items[0].id]: 2, [q.items[1].id]: 1 });
        break;
      case 'gap_fill':
      case 'note_fill':
        right = obj(q.gaps, g => g.acceptedAnswers[0]);
        break;
      case 'gap_choice':
        right = obj(q.gaps, g => g.answer);
        for (const g of q.gaps) dup(g.options, 'Auswahl ' + g.id);
        break;
      case 'error_correction':
        right = obj(q.errors, g => g.acceptedAnswers[0]);
        // Jeder Fehler einzeln unkorrigiert gelassen: darf nicht als richtig gelten.
        for (const g of q.errors)
          if (ok(JSON.stringify({ ...JSON.parse(right), [g.id]: g.wrong })) || scoreAnswer(q, JSON.stringify({ [g.id]: g.wrong })).got)
            bad('unkorrigierter Fehler gilt als richtig: ' + g.wrong);
        break;
      case 'table_fill':
        right = obj(q.rows.flat().filter(c => typeof c === 'object'), g => g.acceptedAnswers[0]);
        break;
      case 'categorize':
      case 'speaker_match':
        right = obj(q.items, x => x.category);
        break;
      case 'sentence_completion':
        right = obj(q.items, x => x.modelAnswer || x.acceptedAnswers[0]);
        break;
      case 'open_answer':
        continue;
    }
    if (!ok(right)) bad('Musterlösung wird als falsch bewertet');
    const sc = scoreAnswer(q, right);
    if (sc.got !== sc.max) bad(`Musterlösung bekommt nur ${sc.got}/${sc.max} Punkte`);
    if (scoreAnswer(q, '').got) bad('leere Antwort bekommt Punkte');
    if (wrong !== undefined && ok(wrong)) bad('falsche Antwort wird als richtig bewertet');
    if (ok('') || ok('{}')) bad('leere Antwort wird als richtig bewertet');
  }
}
assert.deepEqual(errors, [], errors.join('\n'));
console.log(`Übungen: ${all.length} Pakete, ${n} Aufgaben – Lösungen richtig, Fehler abgelehnt.`);
