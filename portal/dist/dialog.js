/* Dokumentdialog: Einstellungen links, A4-Vorschau rechts (wie in Orario und Gruppen) */
function dlgSeg(attr, name, opts, cur) {
  return `<div class="dlg-seg">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" ${attr} value="${v}" ${String(cur) === String(v) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
}
function dlgDesigns() {
  return `<div class="dlg-chips">${DOC_DESIGNS.map(([k, l, d]) => `<label class="dlg-chip" title="${d}"><input type="radio" name="dz" data-doc="design" value="${k}" ${docState.design === k ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
}
function dlgFonts() {
  return `<div class="dlg-fonts">${DOC_FONTS.map(([k, l, f]) => `<label class="dlg-font"><input type="radio" name="dfont" data-doc="font" value="${k}" ${docState.font === k ? 'checked' : ''}><span style="font-family:${k === 'auto' ? 'var(--ui)' : f}">${l}</span></label>`).join('')}</div>`;
}
function dlgAccents() {
  return `<div class="dlg-accents">${DOC_ACCENTS.map(([k, l, c]) => `<label class="dlg-acc" title="${l}"><input type="radio" name="dacc" data-doc="accent" value="${k}" ${docState.accent === k ? 'checked' : ''}><i style="background:${c || 'var(--blue)'}"></i><small>${l}</small></label>`).join('')}</div>`;
}
function dlgStyle(sheet) {
  sheet.dataset.design = docState.design;
  sheet.dataset.font = docState.font;
  const f = DOC_FONTS.find(z => z[0] === docState.font);
  if (f && docState.font !== 'auto') sheet.style.setProperty('--doc-font', f[2]); else sheet.style.removeProperty('--doc-font');
  const a = DOC_ACCENTS.find(z => z[0] === docState.accent);
  sheet.style.setProperty('--doc-ac', (a && a[2]) || getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#1a6dff');
}
function dlgShow({ title, side, paper }) {
  let sheet = $('teaching-print');
  if (!sheet) { sheet = document.createElement('section'); sheet.id = 'teaching-print'; document.body.append(sheet); }
  sheet.className = 'dlg-mode';
  dlgStyle(sheet);
  const keepScroll = sheet.querySelector('.dlg-prev')?.scrollTop || 0;
  sheet.innerHTML = `<div class="dlg-head"><button class="dlg-link" data-portal="close-print">Abbrechen</button><b>${esc(title)}</b><span class="dlg-acts"><button class="dlg-link dlg-tune" data-dlg-side aria-expanded="false">Anpassen</button><button class="dlg-link" data-doc="word">Word<span class="hide-m">-Datei</span></button><button class="dlg-link strong" data-portal="do-print">PDF<span class="hide-m"> speichern</span></button></span></div>
  <div class="dlg-grid"><aside class="dlg-side">${side}</aside><div class="dlg-prev"><div class="pages"><div class="paper">${paper}</div></div></div>`;
  document.body.classList.add('previewing-teaching');
  dlgPaginate();
  dlgFit();
  const pv = sheet.querySelector('.dlg-prev');
  if (pv) pv.scrollTop = keepScroll;
}
function dlgFit() {
  const pv = document.querySelector('#teaching-print .dlg-prev'), p = pv && pv.querySelector('.pages');
  if (!p) return;
  p.style.zoom = Math.min(1.15, Math.max(0.35, (pv.clientWidth - 28) / 794));
}
/* Wortlisten werden in echte A4-Seiten geteilt: Tabellenkopf auf jeder Seite, Abschnittstitel nie allein am Seitenende */
function dlgPaginate() {
  const sheet = $('teaching-print'), paper = sheet && sheet.querySelector('.pages > .paper'), table = paper && paper.querySelector('.doc-table');
  if (!table) return;
  const pages = paper.parentElement;
  pages.style.zoom = 1;
  const cs = getComputedStyle(paper), padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
  // Druckfläche: A4 297 mm minus @page-Rand 16 + 14 mm = 267 mm = 1009 px; Breite 180 mm = 680 px entspricht
  // genau der Bildschirmseite (794 px minus 2 × 15 mm), daher stimmen die gemessenen Zeilenhöhen. 10 px Reserve.
  const inner = Math.floor((267 * 96) / 25.4) - 10;
  void padY;
  const foot = paper.querySelector('.doc-foot'), thead = table.tHead;
  const footH = (foot ? foot.offsetHeight : 0) + 30;
  const topH = table.getBoundingClientRect().top - paper.getBoundingClientRect().top - parseFloat(cs.paddingTop);
  const headH = thead.offsetHeight;
  const rows = [...table.tBodies[0].rows], hs = rows.map(r => r.offsetHeight);
  const chunks = [];
  let cur = [], used = 0, cap = inner - topH - headH - footH;
  rows.forEach((r, i) => {
    if (used + hs[i] > cap && cur.length) {
      const last = cur[cur.length - 1];
      const moved = last.classList.contains('doc-sec') ? [cur.pop()] : [];
      chunks.push(cur);
      cur = moved;
      used = moved.reduce((s, m) => s + m.offsetHeight, 0);
      cap = inner - headH - footH;
    }
    cur.push(r);
    used += hs[i];
  });
  if (cur.length) chunks.push(cur);
  const tops = [...paper.children].filter(c => c !== table && c !== foot);
  const out = chunks.map((rs, n) => {
    const pg = document.createElement('div');
    pg.className = 'paper pg';
    if (n === 0) tops.forEach(t => pg.append(t.cloneNode(true)));
    const t = table.cloneNode(false);
    t.append(thead.cloneNode(true));
    const tb = document.createElement('tbody');
    rs.forEach(r => tb.append(r.cloneNode(true)));
    t.append(tb);
    pg.append(t);
    if (foot) {
      const f = foot.cloneNode(true);
      f.insertAdjacentHTML('afterbegin', `<span class="doc-pn">Seite ${n + 1} von ${chunks.length}</span>`);
      pg.append(f);
    }
    return pg;
  });
  pages.replaceChildren(...out);
}
window.addEventListener('resize', dlgFit);
document.addEventListener('click', e => {
  const b = e.target.closest('[data-dlg-side]');
  const sheet = document.getElementById('teaching-print');
  if (b && sheet) { const on = sheet.classList.toggle('side-open'); b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Fertig' : 'Anpassen'; setTimeout(dlgFit, 50); }
});
const dlgBlock = (h, inner) => `<section class="dlg-block"><h4>${h}</h4>${inner}</section>`;

renderVocabDoc = function () {
  const x = contentList('vocabulary').find(x => x.id === docCurrent.id);
  const avail = docColumnsFor(x);
  const L = portalLang(x.language);
  const side =
    dlgBlock('Spalten', avail.map(([k, l]) => `<label class="dlg-check"><input type="checkbox" data-doc-col="${k}" ${docState.cols.includes(k) || k === 'target' ? 'checked' : ''} ${k === 'target' ? 'disabled' : ''}><span>${l}</span></label>`).join('')) +
    dlgBlock('Design', dlgDesigns()) + dlgBlock('Schrift', dlgFonts()) + dlgBlock('Farbe', dlgAccents());
  dlgShow({ title: x.title.replace(/^Wortschatz · /, ''), side, paper: vocabDocHTML(x) });
};
printTeaching = function (solutions) {
  const x = contentList('listening').find(x => x.id === teacherLessonId);
  if (!x) return;
  hbOpt.solutions = !!solutions;
  hbOpt.compact = solutions === 2;
  docCurrent = { kind: 'listening', solutions };
  const side =
    dlgBlock('Ausgabe', dlgSeg('data-hb="mode"', 'hb-mode', [[0, 'Aufgabenblatt'], [1, 'Lösungen'], [2, 'Kurzer Schlüssel']], solutions === 2 ? 2 : solutions ? 1 : 0)) +
    dlgBlock('Sprache der Anweisungen', dlgSeg('data-instr="pref"', 'instr', [['target', 'Zielsprache'], ['de', 'Deutsch']], instrPref)) +
    dlgBlock('Design', dlgDesigns()) + dlgBlock('Schrift', dlgFonts()) + dlgBlock('Farbe', dlgAccents()) +
    dlgBlock('Zusätze', `<label class="dlg-check"><input type="checkbox" data-hb-opt="link" ${hbOpt.link ? 'checked' : ''}><span>Link zum Anhören aufdrucken</span></label>${x.transcript ? `<label class="dlg-check"><input type="checkbox" data-hb-opt="transcript" ${hbOpt.transcript ? 'checked' : ''}><span>Transkript bei den Lösungen</span></label>` : ''}`);
  if ($('teaching-dialog')?.open) $('teaching-dialog').close();
  dlgShow({ title: x.title, side, paper: hbHTML(x, !!solutions) });
};
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('input[data-doc="design"]')) {
    docState.design = t.value; saveDocState(); dlgStyle($('teaching-print'));
  } else if (t.matches('input[data-doc="font"]')) {
    docState.font = t.value; saveDocState(); dlgStyle($('teaching-print'));
  } else if (t.matches('input[data-doc="accent"]')) {
    docState.accent = t.value; saveDocState(); dlgStyle($('teaching-print'));
  } else if (t.matches('input[data-hb="mode"]')) printTeaching(Number(t.value));
  else if (t.matches('input[data-instr="pref"]')) { setInstrPref(t.value); printTeaching(docCurrent && docCurrent.solutions); }
});
