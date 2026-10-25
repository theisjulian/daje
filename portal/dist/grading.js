(function (root) {
  'use strict';
  const norm = x =>
    String(x ?? '')
      .normalize('NFC')
      .toLocaleLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/[.,;:!?¡¿"„“”«»()…~]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  const plain = x => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  function stripArticle(x, lang) {
    const patterns = {
      it: /^(?:il |lo |la |i |gli |le |un |uno |una |un'|l')/,
      fr: /^(?:le |la |les |un |une |des |l')/,
      es: /^(?:el |la |los |las |un |una |unos |unas )/,
      en: /^(?:the |an |a )/
    };
    return x.replace(patterns[lang] || /^$/, '');
  }
  function oneEdit(a, b) {
    if (Math.abs(a.length - b.length) > 1 || Math.min(a.length, b.length) < 5) return false;
    if (a === b) return false;
    let i = 0,
      j = 0,
      edits = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) {
        i++;
        j++;
        continue;
      }
      if (++edits > 1) return false;
      if (a.length > b.length) i++;
      else if (a.length < b.length) j++;
      else {
        if (a[i] === b[j + 1] && a[i + 1] === b[j]) {
          i += 2;
          j += 2;
        } else {
          i++;
          j++;
        }
      }
    }
    return edits + (a.length - i) + (b.length - j) <= 1;
  }
  // Aus einer gedruckten Angabe alle zulässigen Schreibweisen ableiten:
  // "la signora / il signore" -> beide Teile, "die (Bade-)Wanne" -> mit und ohne Klammer.
  function variantsOf(text) {
    const out = new Set([String(text)]);
    for (const t of [...out]) {
      const noParen = t.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ');
      if (noParen.trim()) out.add(noParen.trim());
    }
    for (const t of [...out]) if (/ \/ |;/.test(t)) t.split(/ \/ |;/).forEach(p => p.trim() && out.add(p.trim()));
    return [...out];
  }
  function compare(word, raw, reverse = false) {
    const value = norm(raw),
      base = reverse ? word.translations : [word.target, ...(word.acceptedAnswers || [])],
      answers = [...new Set(base.flatMap(variantsOf).map(norm))].filter(Boolean),
      lang = reverse ? 'de' : word.language || 'it';
    if (answers.includes(value)) return { status: 'correct', kind: 'exact' };
    if (reverse) {
      const g = x => x.replace(/^(?:der |die |das |ein |eine )/, '');
      if (answers.some(a => g(a) === g(value))) return { status: 'correct', kind: 'exact' };
    }
    if (!reverse) {
      const matching = answers.find(
        a => stripArticle(a, lang) !== a && stripArticle(a, lang) === value
      );
      if (matching)
        return word.answerPolicy?.article === 'optional'
          ? { status: 'correct', kind: 'article_optional' }
          : { status: 'hint', kind: 'article' };
      if (
        answers.some(
          a =>
            stripArticle(a, lang) === stripArticle(value, lang) &&
            stripArticle(value, lang) !== value
        )
      )
        return { status: 'hint', kind: 'gender' };
      const body = stripArticle(value, lang),
        target = stripArticle(answers[0], lang);
      if (
        word.grammar?.partOfSpeech === 'noun' &&
        word.grammar?.gender &&
        body !== target &&
        body.slice(0, -1) === target.slice(0, -1) &&
        /[oa]$/.test(body) &&
        /[oa]$/.test(target)
      )
        return { status: 'hint', kind: 'gender' };
    }
    if (answers.some(a => plain(a) === plain(value))) return { status: 'hint', kind: 'accent' };
    if (
      word.answerPolicy?.typo !== 'strict' &&
      answers.some(a => oneEdit(stripArticle(a, lang), stripArticle(value, lang)))
    )
      return { status: 'hint', kind: 'typo' };
    return { status: 'wrong', kind: 'unknown' };
  }
  function hint(word, kind, reverse = false, level = 1) {
    if (kind === 'article') return 'Das Wort stimmt. Welcher Artikel gehört dazu?';
    if (kind === 'gender')
      return 'Prüfe Genus, Artikel und Wortendung. Ist das Substantiv männlich oder weiblich?';
    if (kind === 'accent') return 'Fast: Prüfe die Akzente. Sie können die Bedeutung verändern.';
    if (kind === 'typo')
      return 'Möglicher Tippfehler: Prüfe die Buchstaben noch einmal. Noch nicht als richtig gewertet.';
    // Hilfe auf Knopfdruck: immer aus der gesuchten Lösung, steigend von grob zu fein.
    const sol = String((reverse ? word.translations?.[0] : word.target) || '').replace(/\s*\([^)]*\)/g, '');
    const words = sol.split(/\s+/).filter(Boolean);
    const letters = sol.replace(/[^\p{L}]/gu, '').length;
    const parts = [];
    if (!reverse && word.grammar?.partOfSpeech === 'noun' && word.grammar.gender)
      parts.push(word.grammar.gender === 'feminine' ? 'weiblich' : 'männlich');
    parts.push(words.length > 1 ? words.length + ' Wörter' : '1 Wort');
    parts.push(letters + ' Buchstaben');
    const n = Math.min(sol.length, Math.max(1, level + 1));
    return 'Hinweis: ' + parts.join(', ') + '. Beginnt mit „' + sol.slice(0, n) + '…“.';
  }
  const api = { compare, hint, norm, oneEdit, variantsOf };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TheisGrading = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
