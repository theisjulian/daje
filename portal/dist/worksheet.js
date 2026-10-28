'use strict';
/*
 * Arbeitsblatt-Mappe für Lehrkräfte: Übungen (Grammatik und Hören) sammeln, per Ziehen oder Pfeilen ordnen,
 * auf mehrere Blätter verteilen und als A4 drucken: Aufgabenblatt mit Kopf (Name, Klasse, Datum, Punkte),
 * durchgehender Nummerierung, auf Wunsch mit Merkkasten; dazu Lösungen oder kurzer Schlüssel.
 * Jedes Blatt beginnt auf einer neuen Seite (dialog.js: .hb-sheet). Gespeichert nur in diesem Browser.
 */
const WS_KEY = 'daje-arbeitsblatt-v1';
let wsDraft = (() => {
  try {
    const x = JSON.parse(localStorage.getItem(WS_KEY) || 'null');
    if (x && Array.isArray(x.sheets) && x.sheets.every(Array.isArray)) return { title: '', rule: true, ...x };
  } catch (e) {}
  return { title: '', sheets: [[]], rule: true };
})();
const WS_T = {
  it: ['Scheda di lavoro', 'Soluzioni', 'Foglio', 'Ascolta', 'Regola'],
  en: ['Worksheet', 'Answer key', 'Sheet', 'Listen', 'Rule'],
  fr: ['Fiche de travail', 'Corrigé', 'Feuille', 'Écoute', 'Règle'],
  es: ['Ficha de trabajo', 'Soluciones', 'Hoja', 'Escucha', 'Regla'],
  de: ['Arbeitsblatt', 'Lösungen', 'Blatt', 'Hören', 'Merkkasten']
};
function wsSave() {
  try {
    localStorage.setItem(WS_KEY, JSON.stringify(wsDraft));
  } catch (e) {}
  wsRefresh();
}
const wsAll = () => wsDraft.sheets.flat();

function wsButton(id) {
  if (!isTeacher() || EMBED) return '';
  const on = wsAll().includes(id);
  return `<button class="button secondary ws-add" data-ws-add="${esc(id)}" aria-pressed="${on}">${on ? 'Auf dem Arbeitsblatt' : 'Aufs Arbeitsblatt'}</button>`;
}
function wsToggle(id) {
  const at = wsDraft.sheets.findIndex(s => s.includes(id));
  if (at >= 0) wsDraft.sheets[at] = wsDraft.sheets[at].filter(x => x !== id);
  else {
    if (wsAll().length >= 40) return toast('Höchstens 40 Übungen pro Mappe.');
    wsDraft.sheets[wsDraft.sheets.length - 1].push(id);
  }
  wsSave();
  toast(at >= 0 ? 'Vom Arbeitsblatt entfernt.' : 'Aufs Arbeitsblatt gelegt.');
}
function wsRefresh() {
  document.querySelectorAll('[data-ws-add]').forEach(b => {
    const on = wsAll().includes(b.dataset.wsAdd);
    b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'Auf dem Arbeitsblatt' : 'Aufs Arbeitsblatt';
  });
  let pill = $('ws-pill');
  const n = wsAll().length;
  if (!isTeacher() || !n || EMBED) return pill?.remove();
  if (!pill) {
    pill = document.createElement('button');
    pill.id = 'ws-pill';
    pill.className = 'hw-pill ws-pill';
    pill.dataset.wsOpen = '1';
    document.body.append(pill);
  }
  pill.innerHTML = `Arbeitsblatt <b>${n}</b>`;
}

/* ---------- Zusammenstellen ---------- */
function wsComposer() {
  let d = $('ws-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'ws-dialog';
    d.className = 'ws-dialog';
    d.setAttribute('aria-labelledby', 'ws-title');
    document.body.append(d);
  }
  const keepScroll = d.querySelector('.ws-sheets')?.scrollTop || 0;
  const item = (id, k, i, len) => {
    const x = findTask(id);
    if (!x) return '';
    const kind = x.kind === 'grammar' ? 'Grammatik · ' + ({ leicht: 'einfach', mittel: 'mittel', schwer: 'schwer' }[x.grammar.difficulty] || '') : 'Hörübung';
    const move = wsDraft.sheets.length > 1 ? `<select class="ws-to" data-ws-to="${esc(id)}" aria-label="Auf Blatt verschieben">${wsDraft.sheets.map((_, j) => `<option value="${j}" ${j === k ? 'selected' : ''}>Blatt ${j + 1}</option>`).join('')}</select>` : '';
    return `<li class="ws-item" data-id="${esc(id)}"><span class="ws-grip" aria-hidden="true" title="Ziehen zum Verschieben">⠿</span><span class="ws-text"><b>${esc(x.title)}</b><small>${esc(kind)} · ${plural(x.questions.length, 'Aufgabe', 'Aufgaben')}${x.grammar ? ' · ' + esc(x.grammar.topicTitle) : ''}</small></span><span class="ws-acts">${move}<button class="quiet" data-ws-move="${esc(id)}" data-dir="-1" aria-label="Nach oben" ${i === 0 ? 'disabled' : ''}>↑</button><button class="quiet" data-ws-move="${esc(id)}" data-dir="1" aria-label="Nach unten" ${i === len - 1 ? 'disabled' : ''}>↓</button><button class="quiet" data-ws-add="${esc(id)}" aria-label="Entfernen">✕</button></span></li>`;
  };
  const sheets = wsDraft.sheets
    .map((s, k) => `<section class="ws-sheet"><div class="ws-sheet-h"><h3>Blatt ${k + 1}</h3><small>${plural(s.length, 'Übung', 'Übungen')}</small>${wsDraft.sheets.length > 1 && !s.length ? `<button class="quiet" data-ws-del="${k}">Blatt entfernen</button>` : ''}</div><ol class="ws-items" data-sheet="${k}">${s.map((id, i) => item(id, k, i, s.length)).join('') || '<li class="ws-empty">Leer. Ziehe Übungen hierher oder lege sie über „Aufs Arbeitsblatt“ ab.</li>'}</ol></section>`)
    .join('');
  const n = wsAll().length;
  d.innerHTML = `<div class="dialog-head"><h2 id="ws-title">Arbeitsblatt zusammenstellen</h2><button class="button secondary" data-close="ws-dialog">Schließen</button></div>
    <p class="muted small">Lege Übungen über „Aufs Arbeitsblatt“ ab (Grammatik und Hörverstehen). Hier ordnest du sie: am Griff ⠿ ziehen oder mit den Pfeilen. Jedes Blatt beginnt auf einer neuen Seite.</p>
    <div class="ws-opts"><label class="field">Titel<input id="ws-name" maxlength="120" value="${esc(wsDraft.title)}" placeholder="z. B. Wiederholung Unità 2"></label><label class="dlg-check"><input type="checkbox" id="ws-rule" ${wsDraft.rule ? 'checked' : ''}><span>Merkkästen mitdrucken</span></label></div>
    <div class="ws-sheets">${sheets}</div>
    <div class="ws-bar"><button class="button secondary" data-ws-new>+ Neues Blatt</button><span class="ws-sp"></span>${n ? '<button class="quiet danger" data-ws-clear>Alles leeren</button><button class="button secondary" data-ws-print="1">Lösungen</button><button class="button primary" data-ws-print="0">Vorschau und PDF</button>' : ''}</div>`;
  if (!d.open) d.showModal();
  d.querySelector('.ws-sheets').scrollTop = keepScroll;
}

/* Ziehen mit Maus, Stift oder Finger (Pointer Events): Platzhalter folgt, beim Loslassen wird gespeichert. */
{
  let drag = null;
  document.addEventListener('pointerdown', e => {
    const grip = e.target.closest('.ws-grip');
    if (!grip) return;
    const li = grip.closest('.ws-item');
    e.preventDefault();
    const r = li.getBoundingClientRect();
    const ghost = li.cloneNode(true);
    ghost.classList.add('ws-ghost');
    Object.assign(ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' });
    document.body.append(ghost);
    li.classList.add('ws-dragging');
    drag = { li, ghost, dy: e.clientY - r.top, id: li.dataset.id };
    grip.setPointerCapture?.(e.pointerId);
  });
  document.addEventListener('pointermove', e => {
    if (!drag) return;
    drag.ghost.style.top = e.clientY - drag.dy + 'px';
    drag.ghost.hidden = true;
    const under = document.elementFromPoint(e.clientX, e.clientY);
    drag.ghost.hidden = false;
    const list = under && under.closest('.ws-items');
    if (!list) return;
    const target = under.closest('.ws-item');
    list.querySelector('.ws-empty')?.remove();
    if (target && target !== drag.li) {
      const tr = target.getBoundingClientRect();
      list.insertBefore(drag.li, e.clientY < tr.top + tr.height / 2 ? target : target.nextSibling);
    } else if (!target) list.append(drag.li);
    // Am Rand der Liste mitscrollen
    const box = document.querySelector('.ws-sheets');
    if (box) {
      const b = box.getBoundingClientRect();
      if (e.clientY < b.top + 40) box.scrollTop -= 12;
      else if (e.clientY > b.bottom - 40) box.scrollTop += 12;
    }
  });
  const end = () => {
    if (!drag) return;
    drag.ghost.remove();
    drag.li.classList.remove('ws-dragging');
    wsDraft.sheets = [...document.querySelectorAll('#ws-dialog .ws-items')].map(l => [...l.querySelectorAll('.ws-item')].map(x => x.dataset.id));
    drag = null;
    wsSave();
    wsComposer();
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
}

document.addEventListener('click', e => {
  const t = e.target.closest('[data-ws-add],[data-ws-open],[data-ws-move],[data-ws-new],[data-ws-del],[data-ws-clear],[data-ws-print]');
  if (!t) return;
  if (t.dataset.wsAdd) {
    wsToggle(t.dataset.wsAdd);
    if ($('ws-dialog')?.open) wsComposer();
    return;
  }
  if (t.dataset.wsOpen) return wsComposer();
  if (t.dataset.wsMove) {
    const k = wsDraft.sheets.findIndex(s => s.includes(t.dataset.wsMove));
    const s = wsDraft.sheets[k], i = s.indexOf(t.dataset.wsMove), j = i + Number(t.dataset.dir);
    if (j < 0 || j >= s.length) return;
    [s[i], s[j]] = [s[j], s[i]];
    wsSave();
    return wsComposer();
  }
  if (t.hasAttribute('data-ws-new')) {
    wsDraft.sheets.push([]);
    wsSave();
    wsComposer();
    const box = document.querySelector('.ws-sheets');
    if (box) box.scrollTop = box.scrollHeight;
    return;
  }
  if (t.dataset.wsDel) {
    wsDraft.sheets.splice(Number(t.dataset.wsDel), 1);
    wsSave();
    return wsComposer();
  }
  if (t.hasAttribute('data-ws-clear')) {
    if (!confirm('Alle Übungen von der Mappe nehmen?')) return;
    wsDraft = { title: wsDraft.title, sheets: [[]], rule: wsDraft.rule };
    wsSave();
    return wsComposer();
  }
  if (t.dataset.wsPrint) {
    $('ws-dialog')?.close();
    return wsPrint(Number(t.dataset.wsPrint));
  }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches?.('[data-ws-to]')) {
    const id = t.dataset.wsTo;
    wsDraft.sheets = wsDraft.sheets.map(s => s.filter(x => x !== id));
    wsDraft.sheets[Number(t.value)].push(id);
    wsSave();
    wsComposer();
  }
  if (t.id === 'ws-rule') {
    wsDraft.rule = t.checked;
    wsSave();
  }
  if (t.matches?.('input[data-ws-mode]')) wsPrint(Number(t.value));
  if (t.matches?.('input[data-ws-opt="rule"]')) {
    wsDraft.rule = t.checked;
    wsSave();
    wsPrint(docCurrent.solutions);
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'ws-name') {
    wsDraft.title = e.target.value;
    try {
      localStorage.setItem(WS_KEY, JSON.stringify(wsDraft));
    } catch (err) {}
  }
});

/* ---------- Druck ---------- */
/* sheets: [[id, …], …]; sol: 0 Aufgabenblatt, 1 Lösungen, 2 kurzer Schlüssel */
function wsSheetHTML(sheets, sol, { title = '', rule = true } = {}) {
  const lists = sheets.map(s => s.map(id => (typeof id === 'string' ? findTask(id) : id)).filter(Boolean)).filter(s => s.length);
  const all = lists.flat();
  if (!all.length) return '<div class="hb"><p>Keine Übungen.</p></div>';
  const lang = all[0].language;
  const L = instrFor(lang) === 'de' ? 'de' : lang;
  const t = HB_TXT[L] || HB_TXT.de;
  const w = WS_T[L] || WS_T.de;
  instrCtx = lang;
  let no = 0, total = 0;
  const keyRows = [];
  const ruleShown = new Set();
  const body = lists
    .map((items, k) => {
      const head = lists.length > 1 ? `<li class="hb-phase hb-sheet">${esc(w[2])} ${k + 1}</li>` : '';
      return (
        head +
        items
          .map(x => {
            const sec = `<li class="hb-phase hb-ex-title">${esc(x.title)}${x.grammar ? `<small>${esc(x.grammar.topicTitle)}</small>` : ''}</li>`;
            const r = rule && x.grammar?.rule && sol !== 2 && !ruleShown.has(x.grammar.topic) && ruleShown.add(x.grammar.topic) ? `<li class="hb-rule"><b>${esc(w[4])}</b>${ruleHTML(x.grammar.rule, x.language)}</li>` : '';
            const link = x.kind === 'listening' && x.media?.type !== 'speech' ? `<li class="hb-note"><b>${esc(w[3])}:</b> ${esc(location.origin + location.pathname + '?hoeren=' + encodeURIComponent(x.id))}</li>` : '';
            const qs = x.questions
              .map(q => {
                no++;
                total += hbPoints(q);
                if (sol === 2) keyRows.push({ no, q });
                const ins = (t.ins[q.type] || '').replace('{n}', q.items ? q.items.length : '');
                const m = q.prompt.match(QUESTION_PHASE);
                const prompt = m ? q.prompt.slice(m[0].length) : q.prompt;
                return `<li class="hb-q"><div class="hb-qh"><b class="n">${no}</b><span class="hb-pt">${esc(t.pt(hbPoints(q)))}</span><div class="hb-ins">${esc(ins)}</div><div class="hb-p">${esc(prompt)}</div></div>${hbBody(q, t, !!sol)}${sol && q.explanation ? `<p class="hb-ex">${esc(visibleText(q.explanation))}</p>` : ''}</li>`;
              })
              .join('');
            return sol === 2 ? '' : sec + r + link + qs;
          })
          .join('')
      );
    })
    .join('');
  const key =
    sol === 2
      ? `<table class="hb-key"><thead><tr><th>${esc(t.kNo)}</th><th>${esc(t.kAns)}</th><th>${esc(t.kPts)}</th></tr></thead><tbody>${keyRows.map(({ no: n, q }) => `<tr><td>${n}</td><td>${hbAnswer(q, t)}</td><td>${hbPoints(q)}</td></tr>`).join('')}</tbody><tfoot><tr><td></td><td></td><td>${total}</td></tr></tfoot></table>`
      : '';
  const levels = [...new Set(all.map(x => x.level))].join(', ');
  const sources = [...new Set(all.flatMap(x => x.sources.map(s => visibleText(s.citation))).filter(Boolean))];
  return `<div class="hb${sol === 2 ? ' hb-compact' : ''}"><header class="hb-top"><b>theis · ${DOC_BRAND}</b><span>${esc(sol ? w[1] : w[0])}</span></header>
  <h1>${esc(title || (all.length === 1 ? all[0].title : w[0]))}</h1>
  <div class="hb-meta"><span>${esc(portalLang(lang))}</span><span>${esc(levels)}</span><span>${esc(t.min(all.reduce((s, x) => s + (x.estimatedMinutes || 0), 0)))}</span></div>
  ${sol ? '' : `<table class="hb-id"><tr><td>${esc(t.name)}</td><td>${esc(t.cls)}</td><td>${esc(t.date)}</td><td class="pts">${esc(t.pts)} &nbsp; / ${total}</td></tr></table>`}
  ${sol === 2 ? key : `<ol class="hb-list">${body}</ol>`}
  <footer class="hb-src"><b>${esc(t.src)}</b> ${sources.map(esc).join(' · ')}</footer>
  ${docFooter()}</div>`;
}
function wsPrint(sol) {
  if (!wsAll().length) return toast('Das Arbeitsblatt ist noch leer.');
  docCurrent = { kind: 'worksheet', solutions: sol };
  const side =
    dlgBlock('Ausgabe', dlgSeg('data-ws-mode', 'ws-mode', [[0, 'Aufgabenblatt'], [1, 'Lösungen'], [2, 'Kurzer Schlüssel']], sol)) +
    dlgBlock('Sprache der Anweisungen', dlgSeg('data-instr="pref"', 'instr', [['target', 'Zielsprache'], ['de', 'Deutsch']], instrPref)) +
    dlgBlock('Zusätze', `<label class="dlg-check"><input type="checkbox" data-ws-opt="rule" ${wsDraft.rule ? 'checked' : ''}><span>Merkkästen mitdrucken</span></label><button class="button secondary" data-ws-open="1">Zusammenstellung ändern</button>`) +
    dlgBlock('Design', dlgDesigns()) + dlgBlock('Schrift', dlgFonts()) + dlgBlock('Farbe', dlgAccents());
  dlgShow({ title: wsDraft.title || 'Arbeitsblatt', side, paper: wsSheetHTML(wsDraft.sheets, sol, { title: wsDraft.title, rule: wsDraft.rule }) });
}
/* Einzelne Grammatikübung (Material und Druck): gleiches Layout wie die Mappe. */
{
  const base = hbHTML;
  hbHTML = function (x, sol) {
    return x.kind === 'grammar' ? wsSheetHTML([[x]], hbOpt.compact ? 2 : sol ? 1 : 0, { title: x.title, rule: hbOpt.rule !== false }) : base(x, sol);
  };
  const relayout = dlgRelayout;
  dlgRelayout = function () {
    if (docCurrent && docCurrent.kind === 'worksheet') return wsPrint(docCurrent.solutions);
    return relayout();
  };
}
document.addEventListener('change', e => {
  // Anweisungssprache in der Mappe: neu aufbauen (die Listening-Variante übernimmt dialog.js)
  if (e.target.matches?.('input[data-instr="pref"]') && docCurrent && docCurrent.kind === 'worksheet') setTimeout(() => wsPrint(docCurrent.solutions), 0);
});
/* Knöpfe auch auf den Karten der Hörübungen; Mappen-Knopf beim Wechsel Lernende/Lehrkräfte aktualisieren. */
{
  const baseCard = lessonCard;
  lessonCard = function (x) {
    const html = baseCard.apply(this, arguments);
    return isTeacher() ? html.replace('<div class="lcard-foot">', '<div class="lcard-foot">' + wsButton(x.id)) : html;
  };
  const baseAudience = applyAudienceLabels;
  applyAudienceLabels = function () {
    const r = baseAudience.apply(this, arguments);
    wsRefresh();
    return r;
  };
}
wsRefresh();
