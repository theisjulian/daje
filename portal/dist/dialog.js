/* Dokumentdialog: Einstellungen links, A4-Vorschau rechts (wie in Orario und Gruppen) */
function dlgSeg(attr, name, opts, cur) {
  return `<div class="dlg-seg">${opts.map(([v, l]) => `<label><input type="radio" name="${name}" ${attr} value="${v}" ${String(cur) === String(v) ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
}
function dlgDesigns() {
  return `<div class="dlg-designs">${DOC_DESIGNS.map(([k, l, d]) => `<label class="dlg-design dz-${k}"><input type="radio" name="dz" data-doc="design" value="${k}" ${docState.design === k ? 'checked' : ''}><i><u></u><u></u><u></u></i><b>${l}</b><small>${d}</small></label>`).join('')}</div>`;
}
function dlgShow({ title, side, paper }) {
  let sheet = $('teaching-print');
  if (!sheet) { sheet = document.createElement('section'); sheet.id = 'teaching-print'; document.body.append(sheet); }
  sheet.className = 'dlg-mode';
  sheet.dataset.design = docState.design;
  sheet.style.setProperty('--doc-ac', getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#1a6dff');
  const keepScroll = sheet.querySelector('.dlg-prev')?.scrollTop || 0;
  sheet.innerHTML = `<div class="dlg-head"><button class="dlg-link" data-portal="close-print">Abbrechen</button><b>${esc(title)}</b><span class="dlg-acts"><button class="dlg-link" data-doc="word">Word-Datei</button><button class="dlg-link strong" data-portal="do-print">Als PDF speichern</button></span></div>
  <div class="dlg-grid"><aside class="dlg-side">${side}</aside><div class="dlg-prev"><div class="paper">${paper}</div></div></div>`;
  document.body.classList.add('previewing-teaching');
  dlgFit();
  const pv = sheet.querySelector('.dlg-prev');
  if (pv) pv.scrollTop = keepScroll;
}
function dlgFit() {
  const pv = document.querySelector('#teaching-print .dlg-prev'), p = pv && pv.querySelector('.paper');
  if (!p) return;
  p.style.zoom = Math.min(1.15, Math.max(0.35, (pv.clientWidth - 28) / 794));
}
window.addEventListener('resize', dlgFit);
const dlgBlock = (h, inner) => `<section class="dlg-block"><h4>${h}</h4>${inner}</section>`;

renderVocabDoc = function () {
  const x = contentList('vocabulary').find(x => x.id === docCurrent.id);
  const avail = docColumnsFor(x);
  const L = portalLang(x.language);
  const side =
    dlgBlock('Spalten', avail.map(([k, l]) => `<label class="dlg-check"><input type="checkbox" data-doc-col="${k}" ${docState.cols.includes(k) || k === 'target' ? 'checked' : ''} ${k === 'target' ? 'disabled' : ''}><span>${l}</span></label>`).join('')) +
    dlgBlock('Aufbau', dlgSeg('data-doc-layout', 'doc-layout', [['list', 'Wortliste'], ['test-de', `Test: ${L}`], ['test-it', 'Test: Deutsch']], docState.layout)) +
    dlgBlock('Design', dlgDesigns());
  dlgShow({ title: x.title.replace(/^Wortschatz · /, ''), side, paper: vocabDocHTML(x) });
};
printTeaching = function (solutions) {
  const x = contentList('listening').find(x => x.id === teacherLessonId);
  if (!x) return;
  hbOpt.solutions = !!solutions;
  docCurrent = { kind: 'listening', solutions: !!solutions };
  const side =
    dlgBlock('Ausgabe', dlgSeg('data-hb="mode"', 'hb-mode', [[0, 'Aufgabenblatt'], [1, 'Lösungen']], solutions ? 1 : 0)) +
    dlgBlock('Sprache der Anweisungen', dlgSeg('data-instr="pref"', 'instr', [['target', 'Zielsprache'], ['de', 'Deutsch']], instrPref)) +
    dlgBlock('Design', dlgDesigns()) +
    dlgBlock('Zusätze', `<label class="dlg-check"><input type="checkbox" data-hb-opt="link" ${hbOpt.link ? 'checked' : ''}><span>Link zum Anhören aufdrucken</span></label>${x.transcript ? `<label class="dlg-check"><input type="checkbox" data-hb-opt="transcript" ${hbOpt.transcript ? 'checked' : ''}><span>Transkript bei den Lösungen</span></label>` : ''}`);
  if ($('teaching-dialog')?.open) $('teaching-dialog').close();
  dlgShow({ title: x.title, side, paper: hbHTML(x, !!solutions) });
};
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('input[data-doc="design"]')) {
    docState.design = t.value; saveDocState();
    $('teaching-print').dataset.design = t.value;
  } else if (t.matches('input[data-hb="mode"]')) printTeaching(t.value === '1');
  else if (t.matches('input[data-instr="pref"]')) { setInstrPref(t.value); printTeaching(docCurrent && docCurrent.solutions); }
});
