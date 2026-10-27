/*
 * Sprachausgabe: Wörterbuch-Schreibweisen in sprechbaren Text umwandeln, bevor die Stimme des Geräts liest.
 *   bello/-a → „bello, bella“ · rosso/-a/-i/-e → „rosso, rossa, rossi, rosse“ · il/la → „il, la“
 *   costruire (-sc-) → „costruire“ · andare (vado) → „andare, vado“ · la vasca (da bagno) → „la vasca da bagno“
 *   qn/qc/qs → „qualcuno/qualcosa“ (je Sprache) · „…“ entfällt · ein einzelnes „è“ wird nicht buchstabiert.
 */
(function (root) {
  'use strict';
  const ABBR = {
    it: { qc: 'qualcosa', qs: 'qualcosa', qn: 'qualcuno', ecc: 'eccetera' },
    fr: { qc: 'quelque chose', qch: 'quelque chose', qn: 'quelqu’un', qqn: 'quelqu’un', qqch: 'quelque chose' },
    en: { sb: 'somebody', sth: 'something', smb: 'somebody', smth: 'something' },
    es: { algn: 'alguien', alg: 'algo' }
  };
  const VOWEL = /[aeiouàèéìíòóùú]$/i;

  /* Endung anhängen oder ersetzen: bello + a → bella, dottore + essa → dottoressa, petit + e → petite. */
  function withEnding(word, suffix) {
    if (suffix.length > 1) {
      const tail = word.length - 5;
      const i = word.lastIndexOf(suffix[0]);
      if (i > 0 && i >= tail) return word.slice(0, i) + suffix;
    }
    return VOWEL.test(word) ? word.slice(0, -1) + suffix : word + suffix;
  }

  function speakable(text, lang) {
    let s = String(text || '').normalize('NFC');
    // Grammatikhinweise in Klammern („(-sc-)“, „(+ inf.)“) entfallen; andere Klammern werden aufgelöst.
    s = s.replace(/\s*\(\s*[-+][^)]*\)/g, '');
    s = s.replace(/(\p{L})\(([^)]*)\)/gu, '$1$2'); // prof(essore) → professore
    // Klammer am Ende mit einer Form („andare (vado)“): kurze Pause davor; sonst Inhalt einfach mitlesen.
    s = s.replace(/\s*\(([^)]*)\)\s*$/, (m, inner) => (/^[\p{L}’']+$/u.test(inner.trim()) ? ', ' + inner.trim() : ' ' + inner.trim()));
    s = s.replace(/\s*\(([^)]*)\)\s*/g, (m, inner) => ' ' + inner.trim() + ' ');
    // Endungen: Wort/-a/-i oder Wort, -a
    s = s.replace(/(\p{L}[\p{L}’']*)((?:\s*[/,]\s*-\p{L}+)+)/gu, (m, word, rest) => {
      const forms = rest
        .split(/[/,]/)
        .map(x => x.trim())
        .filter(x => x.startsWith('-'))
        .map(x => withEnding(word, x.slice(1)))
        .filter(f => !/(\p{L})\1\1/u.test(f)); // unklare Kurzschreibung lieber weglassen als falsch vorlesen
      return [word, ...forms].join(', ');
    });
    // Abkürzungen der Sprache
    const ab = ABBR[lang] || {};
    s = s.replace(/\b(\p{L}+)\b\.?/gu, (m, w) => (ab[w.toLowerCase()] ? ab[w.toLowerCase()] : m));
    // Auslassungspunkte, Schrägstriche als kurze Pause
    s = s.replace(/…|\.\.\./g, ' ');
    s = s.replace(/([?!.])\s*\/\s*[?!.]/g, '$1').replace(/\s*\/\s*(?=[?!.])/g, '');
    s = s.replace(/\s*\/\s*/g, ', ');
    s = s.replace(/\s+([,?!.])/g, '$1').replace(/,\s*,/g, ',').replace(/\s{2,}/g, ' ').replace(/^[,\s]+|[,\s]+$/g, '').trim();
    // Einzelner Buchstabe (z. B. „è“, „à“, „y“): Stimmen buchstabieren ihn sonst („e accento grave“).
    // Der Buchstabenname des Grundvokals klingt wie das Wort.
    if (/^\p{L}$/u.test(s)) {
      const base = s.normalize('NFD').replace(/[̀-ͯ]/g, '');
      s = (lang === 'fr' || lang === 'es') && base.toLowerCase() === 'y' ? 'i' : base;
    }
    return s;
  }

  /* Beste verfügbare Stimme für die Sprache: hochwertige Stimmen zuerst, sonst die erste passende. */
  function pickVoice(langTag) {
    if (typeof speechSynthesis === 'undefined') return null;
    const voices = speechSynthesis.getVoices();
    const tag = langTag.toLowerCase(), base = tag.slice(0, 2);
    const fits = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(base));
    const good = v => /premium|enhanced|neural|natural|google|siri/i.test(v.name);
    return (
      fits.find(v => v.lang.toLowerCase().replace('_', '-') === tag && good(v)) ||
      fits.find(good) ||
      fits.find(v => v.lang.toLowerCase().replace('_', '-') === tag) ||
      fits[0] ||
      null
    );
  }

  const api = { speakable, pickVoice };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, { speakable, pickVoice });
})(typeof window !== 'undefined' ? window : globalThis);
