'use strict';
/*
 * Zahlen, Uhrzeit, Datum (Italienisch): Aufgaben werden erzeugt, Antworten mit Varianten geprüft.
 * Stufen: einfach (antippen, kleine Zahlen), mittel (tippen, bis 100), schwer (tippen, große Zahlen, jede Uhrzeit).
 * Bezug Primo anno: Zahlen 1–100 (Unità 2), Uhrzeit, Wochentage, Ordinalzahlen 1–10 (Unità 3), Datum, Monate (Unità 5);
 * große Zahlen und Ordinalzahlen über 10 wie im Anhang von Band 2.
 */
const NU_ONES = ['zero', 'uno', 'due', 'tre', 'quattro', 'cinque', 'sei', 'sette', 'otto', 'nove', 'dieci', 'undici', 'dodici', 'tredici', 'quattordici', 'quindici', 'sedici', 'diciassette', 'diciotto', 'diciannove'];
const NU_TENS = ['', '', 'venti', 'trenta', 'quaranta', 'cinquanta', 'sessanta', 'settanta', 'ottanta', 'novanta'];
const NU_DAYS = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
const NU_MONTHS = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const NU_ORD = ['', 'primo', 'secondo', 'terzo', 'quarto', 'quinto', 'sesto', 'settimo', 'ottavo', 'nono', 'decimo'];

/* Zahlwort 0 … 999 999 999; zweite Rückgabe: zulässige Varianten (centouno/centuno, centotto/centootto). */
function nuBelow100(n) {
  if (n < 20) return NU_ONES[n];
  const t = NU_TENS[Math.floor(n / 10)], u = n % 10;
  if (!u) return t;
  const unit = u === 3 ? 'tré' : NU_ONES[u];
  return (u === 1 || u === 8 ? t.slice(0, -1) : t) + unit;
}
function nuBelow1000(n) {
  const h = Math.floor(n / 100), r = n % 100;
  const head = h ? (h === 1 ? 'cento' : NU_ONES[h] + 'cento') : '';
  if (!r) return head || 'zero';
  const rest = nuBelow100(r);
  // centotto, centottanta: das o von cento entfällt vor otto/ottanta
  return head && /^o/.test(rest) ? head.slice(0, -1) + rest : head + rest;
}
function numIt(n) {
  if (n === 0) return 'zero';
  const parts = [];
  const mio = Math.floor(n / 1e6), th = Math.floor((n % 1e6) / 1000), r = n % 1000;
  if (mio) parts.push(mio === 1 ? 'un milione' : nuBelow1000(mio).replace(/tré$/, 'tre') + ' milioni');
  let tail = '';
  if (th) tail += th === 1 ? 'mille' : nuBelow1000(th).replace(/tré$/, 'tre') + 'mila';
  if (r) tail += nuBelow1000(r);
  if (tail) parts.push(tail);
  return parts.join(' ');
}
function numVariants(n) {
  const main = numIt(n);
  const v = new Set([main]);
  v.add(main.replace(/centotto/g, 'centootto').replace(/centottanta/g, 'centoottanta'));
  if (n % 100 === 1 && n > 100) v.add(main.replace(/centouno$/, 'centuno'));
  v.add(main.replace(/ /g, ''));
  return [...v];
}
function ordIt(n, fem = false) {
  let w;
  if (n <= 10) w = NU_ORD[n];
  else {
    const c = numIt(n).replace(/tré$/, 'tre');
    w = /tre$|sei$/.test(c) ? c + 'esimo' : c.slice(0, -1) + 'esimo';
  }
  return fem ? w.replace(/o$/, 'a') : w;
}

/* Uhrzeit umgangssprachlich und offiziell. h 0–23, m 0–59 (meist Fünferschritte). */
function timeIt(h, m) {
  const hourWord = x => {
    const k = x % 12;
    if (x === 0 || x === 24) return ['è mezzanotte'];
    if (x === 12) return ['è mezzogiorno', 'sono le dodici'];
    if (k === 1) return ["è l'una"];
    return ['sono le ' + numIt(k === 0 ? 12 : k)];
  };
  const out = new Set();
  const base = hourWord(h);
  const next = hourWord((h + 1) % 24);
  if (m === 0) base.forEach(b => out.add(b));
  else {
    const plus = [m === 15 ? 'e un quarto' : '', m === 30 ? 'e mezza' : '', m === 30 ? 'e mezzo' : '', 'e ' + numIt(m)].filter(Boolean);
    base.forEach(b => plus.forEach(p => out.add(b + ' ' + p)));
    if (m >= 35) {
      const minus = [m === 45 ? 'meno un quarto' : '', 'meno ' + numIt(60 - m)].filter(Boolean);
      next.forEach(b => minus.forEach(p => out.add(b + ' ' + p)));
    }
  }
  // offiziell (Bahnhof, Radio): „sono le quindici e trenta“
  if (h > 12) out.add('sono le ' + numIt(h) + (m ? ' e ' + numIt(m) : ''));
  const list = [...out];
  // bevorzugte Lösung: Viertel/halb, sonst „meno“ ab 35 Minuten
  const pref = list.find(x => / (un quarto|mezza)$/.test(x) && (m !== 45 || /meno/.test(x))) || (m >= 35 ? list.find(x => /meno/.test(x)) : null) || list[0];
  return [pref, ...list.filter(x => x !== pref)];
}
function dateIt(d, mo) {
  const day = d === 1 ? 'il primo' : d === 8 || d === 11 ? "l'" + numIt(d) : 'il ' + numIt(d);
  const v = [day + ' ' + NU_MONTHS[mo]];
  if (d === 1) v.push('il 1° ' + NU_MONTHS[mo], "l'uno " + NU_MONTHS[mo]);
  return v;
}

const NU_KEY = 'daje-zahlen-v1';
const NU_MODES = [
  ['num', 'Zahlen lesen', 'Ziffer → Zahlwort'],
  ['hear', 'Zahlen hören', 'Hören → Ziffer'],
  ['time', 'Uhrzeit', 'Che ore sono?'],
  ['date', 'Datum', 'Tag und Monat'],
  ['ord', 'Ordnungszahlen', 'primo, secondo …'],
  ['week', 'Tage und Monate', 'Reihenfolge kennen']
];
const NU_LEVELS = [['leicht', 'einfach'], ['mittel', 'mittel'], ['schwer', 'schwer']];
const NU_STATE = Object.assign({ mode: 'num', level: 'leicht', quiz: null }, (() => {
  try {
    const x = JSON.parse(localStorage.getItem(NU_KEY) || '{}');
    return { mode: NU_MODES.some(m => m[0] === x.mode) ? x.mode : 'num', level: ['leicht', 'mittel', 'schwer'].includes(x.level) ? x.level : 'leicht' };
  } catch (e) {
    return {};
  }
})());
const nuSave = () => {
  try {
    localStorage.setItem(NU_KEY, JSON.stringify({ mode: NU_STATE.mode, level: NU_STATE.level }));
  } catch (e) {}
};
const nuRand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const nuPick = a => a[Math.floor(Math.random() * a.length)];
const nuShuffle = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

/* Uhr als SVG: Zifferblatt mit Stunden- und Minutenzeiger */
function nuClock(h, m) {
  const ang = (v, max) => (v / max) * 2 * Math.PI - Math.PI / 2;
  const hA = ang((h % 12) + m / 60, 12), mA = ang(m, 60);
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = ang(i, 12);
    return `<line x1="${50 + 40 * Math.cos(a)}" y1="${50 + 40 * Math.sin(a)}" x2="${50 + 45 * Math.cos(a)}" y2="${50 + 45 * Math.sin(a)}" stroke-width="${i % 3 ? 1.5 : 3}"/>`;
  }).join('');
  return `<svg class="nu-clock" viewBox="0 0 100 100" role="img" aria-label="Uhr: ${h}:${String(m).padStart(2, '0')}"><circle cx="50" cy="50" r="47" class="nu-face"/>${`<g class="nu-ticks">${ticks}</g>`}<line class="nu-h" x1="50" y1="50" x2="${50 + 25 * Math.cos(hA)}" y2="${50 + 25 * Math.sin(hA)}"/><line class="nu-m" x1="50" y1="50" x2="${50 + 37 * Math.cos(mA)}" y2="${50 + 37 * Math.sin(mA)}"/><circle cx="50" cy="50" r="3" class="nu-dot"/></svg>`;
}

/* Eine Aufgabe: { q: HTML der Frage, say: Text zum Vorlesen, answers: [zulässige Antworten], options?: [für „einfach“], hint } */
function nuItem(mode, level) {
  const choice = level === 'leicht';
  const mk = (q, answers, distract, say, extra = {}) => {
    const o = choice ? nuShuffle([answers[0], ...nuShuffle(distract.filter(d => !answers.includes(d))).slice(0, 3)]) : null;
    return { q, answers, options: o, say, ...extra };
  };
  if (mode === 'num' || mode === 'hear') {
    const max = level === 'leicht' ? 20 : level === 'mittel' ? 100 : nuPick([1000, 10000, 1e6]);
    const n = nuRand(level === 'schwer' ? 21 : 0, max);
    const near = [n + 1, n - 1, n + 10, n - 10, n + 2, (n % 10) * 10 + Math.floor(n / 10)].filter(x => x >= 0 && x !== n);
    if (mode === 'hear')
      return { q: '<p class="nu-big" aria-hidden="true">🔊</p><p class="muted">Hör zu und schreib die Zahl in Ziffern.</p>', answers: [String(n)], options: choice ? nuShuffle([String(n), ...near.slice(0, 3).map(String)]) : null, say: numIt(n), digits: true, auto: true };
    return mk(`<p class="nu-big">${n.toLocaleString('de-DE')}</p>`, numVariants(n), near.map(numIt), numIt(n));
  }
  if (mode === 'time') {
    const step = level === 'schwer' ? 5 : 15;
    const h = level === 'schwer' ? nuRand(0, 23) : nuRand(1, 12);
    const m = nuRand(0, 59 / step | 0) * step;
    const ans = timeIt(h, m);
    const wrong = [timeIt((h + 1) % 24, m)[0], timeIt(h, (m + 15) % 60)[0], timeIt((h + 11) % 24, m)[0], timeIt(h, (60 - m) % 60)[0]];
    return mk(`${nuClock(h, m)}<p class="nu-digital">${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}</p><p class="muted">Che ore sono?</p>`, ans, wrong, ans[0], { prefix: true });
  }
  if (mode === 'date') {
    const mo = nuRand(0, 11), d = nuRand(1, 28);
    const ans = dateIt(d, mo);
    const wrong = [dateIt(d, (mo + 1) % 12)[0], dateIt(Math.max(1, d - 1), mo)[0], dateIt(d, (mo + 11) % 12)[0], dateIt(Math.min(28, d + 10), mo)[0]];
    return mk(`<p class="nu-big">${d}.${mo + 1}.</p><p class="muted">Oggi è …</p>`, ans, wrong, 'oggi è ' + ans[0]);
  }
  if (mode === 'ord') {
    const max = level === 'schwer' ? 30 : 10;
    const n = nuRand(1, max);
    const fem = level !== 'leicht' && Math.random() < 0.4;
    const ans = [ordIt(n, fem)];
    const wrong = [ordIt(n + 1, fem), ordIt(Math.max(1, n - 1), fem), ordIt(n, !fem), numIt(n)];
    return mk(`<p class="nu-big">${n}${fem ? 'ª' : 'º'}</p><p class="muted">${fem ? 'weiblich, z. B. la … volta' : 'männlich, z. B. il … piano'}</p>`, ans, wrong, ans[0]);
  }
  // Wochentage und Monate
  const months = Math.random() < 0.5;
  const list = months ? NU_MONTHS : NU_DAYS;
  const i = nuRand(0, list.length - 1);
  const kind = level === 'leicht' ? 'de' : nuPick(['next', 'prev', 'de']);
  const DE_D = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];
  const DE_M = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  const de = months ? DE_M : DE_D;
  const target = kind === 'next' ? (i + 1) % list.length : kind === 'prev' ? (i - 1 + list.length) % list.length : i;
  const q = kind === 'de' ? `<p class="nu-big nu-word">${de[i]}</p><p class="muted">Wie heißt das auf Italienisch?</p>` : `<p class="nu-big nu-word" lang="it">${list[i]}</p><p class="muted">${kind === 'next' ? 'Was kommt danach?' : 'Was kommt davor?'}</p>`;
  return mk(q, [list[target]], list.filter((_, j) => j !== target), list[target]);
}

const nuNorm = s => String(s).toLocaleLowerCase().normalize('NFC').replace(/[’‘`´]/g, "'").replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '').replace(/\.(?=\d{3})/g, '');
function nuJudge(item, raw) {
  let v = nuNorm(raw);
  if (!v) return 'empty';
  const forms = item.answers.map(nuNorm);
  // Uhrzeit: „le tre e mezza“ oder nur „tre e mezza“ genügt auch
  const alt = item.prefix ? forms.flatMap(f => [f, f.replace(/^(sono le|è l'|è) ?/, '').replace(/^una/, "l'una"), f.replace(/^sono /, '')]) : forms;
  if (alt.includes(v)) return 'ok';
  const plain = x => x.normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (alt.some(f => plain(f) === plain(v))) return 'accent';
  return 'wrong';
}
function nuSpeak(text) {
  if (!('speechSynthesis' in window) || !text) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'it-IT';
  u.voice = typeof pickVoice === 'function' ? pickVoice('it-IT') : null;
  u.rate = 0.9;
  speechSynthesis.speak(u);
}
function nuStart() {
  NU_STATE.quiz = { items: Array.from({ length: 10 }, () => nuItem(NU_STATE.mode, NU_STATE.level)), i: 0, good: 0, checked: false, answer: '', res: '' };
}
function numbersPage() {
  const q = NU_STATE.quiz;
  const modes = `<div class="vb-modes nu-modes" role="tablist" aria-label="Übung">${NU_MODES.map(([k, l, d]) => `<button role="tab" class="vb-mode-btn ${NU_STATE.mode === k ? 'on' : ''}" aria-selected="${NU_STATE.mode === k}" data-nu="mode" data-v="${k}"><b>${l}</b><small>${d}</small></button>`).join('')}</div>`;
  const levels = `<div class="ws-seg nu-level" role="tablist" aria-label="Stufe">${NU_LEVELS.map(([k, l]) => `<button role="tab" aria-selected="${NU_STATE.level === k}" data-nu="level" data-v="${k}">${l}</button>`).join('')}</div>`;
  let card;
  if (!q || q.done) {
    card = `<section class="vb-card glass vb-quiz nu-card"><div class="eyebrow">${NU_MODES.find(m => m[0] === NU_STATE.mode)[1]}</div><h2>Zehn Aufgaben.</h2><p class="muted">${NU_STATE.level === 'leicht' ? 'Du tippst die richtige Antwort an.' : 'Du schreibst die Antwort. Akzente kannst du mit den Tasten einfügen.'}</p>${q && q.done ? `<p class="vb-final"><b>${q.good} von ${q.items.length}</b> richtig${q.good === q.items.length ? ' · perfetto!' : ''}</p>` : ''}<button class="button primary large" data-nu="start">${q ? 'Neue Runde' : 'Los geht’s'}</button></section>`;
  } else {
    const it = q.items[q.i];
    const fb = q.checked ? `<div class="vb-fb ${q.res}" role="status">${q.res === 'ok' ? 'Richtig' : q.res === 'accent' ? 'Fast: Prüfe den Akzent. ' + esc(it.answers[0]) : 'Lösung: ' + esc(it.answers[0])}</div>` : '';
    const next = `<button type="button" class="button primary" data-nu="next">${q.i + 1 === q.items.length ? 'Ergebnis' : 'Weiter'}</button>`;
    const speak = `<button type="button" class="speak-btn" data-nu="speak" aria-label="Vorlesen">🔊</button>`;
    const answer = it.options
      ? `<div class="vb-opts">${it.options.map(o => `<button type="button" class="vb-opt ${q.checked ? (it.answers.includes(o) ? 'ok' : o === q.answer ? 'wrong' : '') : ''}" data-nu="pick" data-v="${esc(o)}" ${q.checked ? 'disabled' : ''} lang="${it.digits ? 'de' : 'it'}">${esc(o)}</button>`).join('')}</div><div class="vb-actions">${q.checked ? fb + next : ''}</div>`
      : `<form id="nu-form" novalidate><input class="vb-in vb-big" id="nu-in" ${it.digits ? 'inputmode="numeric"' : ''} autocomplete="off" autocapitalize="none" autocorrect="off" spellcheck="false" lang="it" value="${esc(q.answer)}" ${q.checked ? 'readonly' : ''} aria-label="Antwort">${q.checked || it.digits ? '' : vbKeys()}<div class="vb-actions">${q.checked ? fb + next : '<button class="button primary" type="submit">Prüfen</button>'}</div></form>`;
    card = `<section class="vb-card glass vb-quiz nu-card"><div class="progress-track" aria-hidden="true"><div class="progress-fill" style="width:${(100 * q.i) / q.items.length}%"></div></div><div class="nu-head"><div class="eyebrow">${NU_MODES.find(m => m[0] === NU_STATE.mode)[1]} · ${q.i + 1} / ${q.items.length}</div>${speak}</div><div class="nu-q" lang="it">${it.q}</div>${answer}</section>`;
  }
  $('main').innerHTML = `<div class="page nu-page"><button class="quiet back-link" data-nav="grammatik">Grammatik</button><header class="page-head"><div class="eyebrow">Zahlen, Uhrzeit, Datum</div><h1>Numeri e ore.</h1><p>Zahlen lesen und hören, Uhrzeiten und Daten sagen. Wähle eine Übung und eine Stufe.</p></header>${modes}${levels}${card}</div>`;
  const cur = q && !q.done ? q.items[q.i] : null;
  if (cur && !q.checked) {
    if (cur.auto && !q.spoken) {
      q.spoken = true;
      nuSpeak(cur.say);
    }
    if (autoFocusOK()) document.getElementById('nu-in')?.focus({ preventScroll: true });
  }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-nu]');
  if (!b || !document.querySelector('.nu-page')) return;
  const a = b.dataset.nu, v = b.dataset.v, q = NU_STATE.quiz;
  if (a === 'mode' || a === 'level') {
    NU_STATE[a] = v;
    NU_STATE.quiz = null;
    nuSave();
    return numbersPage();
  }
  if (a === 'start') {
    nuStart();
    numbersPage();
    return document.querySelector('.nu-card')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  if (!q) return;
  const it = q.items[q.i];
  if (a === 'speak') return nuSpeak(it.say);
  if (a === 'pick') {
    q.answer = v;
    q.res = it.answers.includes(v) ? 'ok' : 'wrong';
    if (q.res === 'ok') q.good++;
    q.checked = true;
    if (!it.digits) nuSpeak(it.say);
    return numbersPage();
  }
  if (a === 'next') {
    q.i++;
    Object.assign(q, { checked: false, answer: '', res: '', spoken: false });
    if (q.i >= q.items.length) q.done = true;
    return numbersPage();
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'nu-in' && NU_STATE.quiz) NU_STATE.quiz.answer = e.target.value;
});
document.addEventListener('submit', e => {
  if (e.target.id !== 'nu-form') return;
  e.preventDefault();
  const q = NU_STATE.quiz, it = q.items[q.i];
  q.answer = document.getElementById('nu-in').value;
  q.res = nuJudge(it, q.answer);
  if (q.res === 'empty') return;
  if (q.res === 'ok') q.good++;
  q.checked = true;
  if (!it.digits) nuSpeak(it.say);
  numbersPage();
});
if (typeof module !== 'undefined') module.exports = { numIt, numVariants, ordIt, timeIt, dateIt, nuJudge, nuItem };
