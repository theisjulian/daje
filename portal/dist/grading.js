(function (root) {
  'use strict';
  const norm = x =>
    String(x ?? '')
      .normalize('NFC')
      .toLocaleLowerCase()
      .replace(/[’‘`´]/g, "'")
      .trim()
      .replace(/[.!?]+$/g, '')
      .trim()
      .replace(/\s+/g, ' ');
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
  function compare(word, raw, reverse = false) {
    const value = norm(raw),
      answers = (reverse ? word.translations : [word.target, ...(word.acceptedAnswers || [])]).map(
        norm
      ),
      lang = reverse ? 'de' : word.language || 'it';
    if (answers.includes(value)) return { status: 'correct', kind: 'exact' };
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
  function hint(word, kind) {
    if (kind === 'article') return 'Das Wort stimmt. Welcher Artikel gehört dazu?';
    if (kind === 'gender')
      return 'Prüfe Genus, Artikel und Wortendung. Ist das Substantiv männlich oder weiblich?';
    if (kind === 'accent') return 'Fast: Prüfe die Akzente. Sie können die Bedeutung verändern.';
    if (kind === 'typo')
      return 'Möglicher Tippfehler: Prüfe die Buchstaben noch einmal. Noch nicht als richtig gewertet.';
    if (word.grammar?.partOfSpeech === 'noun')
      return 'Welches Genus hat das Substantiv? Welcher Artikel passt dazu?';
    if (word.def || word.definition) return word.def || word.definition;
    return 'Denke an einen Beispielsatz mit diesem Wort. Prüfe dann Schreibweise und mögliche Akzente.';
  }
  const api = { compare, hint, norm, oneEdit };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TheisGrading = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
