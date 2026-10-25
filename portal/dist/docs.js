'use strict';
/*
 * Dokumente: Wortlisten und Aufgabenblätter als PDF (Browserdruck) oder Word-Datei,
 * mit wählbaren Spalten und Dokument-Designs.
 */
const DOC_BRAND = 'daje';
const DOC_DESIGNS = [
  ['schlicht', 'Schlicht', 'Nüchtern, schwarz-weiß'],
  ['modern', 'Modern', 'Akzentfarbe deines Designs'],
  ['klassisch', 'Klassisch', 'Schwarz-weiß, sparsam im Druck'],
  ['heft', 'Heft', 'Linien und Marker'],
  ['kontrast', 'Kontrast', 'Kräftig, gut lesbar'],
  ['schulbuch', 'Schulbuch', 'Klare Bänder, nüchtern'],
  ['pastell', 'Pastell', 'Weiche Kärtchen'],
  ['elegant', 'Elegant', 'Zentriert, feine Linien'],
  ['minimal', 'Minimal', 'Sparsam, tintensparend']
];
const DOC_FONTS = [
  ['auto', 'Passend zum Design', 'inherit'],
  ['app', 'Schrift der App', 'var(--ui)'],
  ['arial', 'Arial', 'Arial, Helvetica, sans-serif'],
  ['verdana', 'Verdana', 'Verdana, Geneva, sans-serif'],
  ['trebuchet', 'Trebuchet', '"Trebuchet MS", Tahoma, sans-serif'],
  ['georgia', 'Georgia', 'Georgia, "Times New Roman", serif'],
  ['palatino', 'Palatino', '"Palatino Linotype", Palatino, "Book Antiqua", serif'],
  ['schreib', 'Schreibmaschine', '"Courier New", Courier, monospace'],
  ['hand', 'Handschriftlich', '"Chalkboard SE", "Comic Sans MS", "Marker Felt", cursive']
];
const DOC_ACCENTS = [
  ['auto', 'Wie die App', ''],
  ['blau', 'Blau', '#1a6dff'],
  ['gruen', 'Grün', '#1f8a5b'],
  ['koralle', 'Koralle', '#e5533f'],
  ['violett', 'Violett', '#7a4fd6'],
  ['orange', 'Orange', '#d97a00'],
  ['schwarz', 'Schwarz', '#111111']
];
const DOC_COLUMNS = [
  ['target', 'Zielsprache'],
  ['de', 'Deutsch'],
  ['ipa', 'Lautschrift'],
  ['definition', 'Erklärung'],
  ['example', 'Beispiel'],
  ['usage', 'Hinweis'],
  ['related', 'Verwandte Wörter'],
  ['image', 'Bild']
];
let docState = { design: 'schlicht', font: 'auto', accent: 'schwarz', layout: 'list', cols: ['target', 'de'] };
try {
  Object.assign(docState, JSON.parse(localStorage.getItem('ripassa-doc-v1') || '{}'));
} catch {
  /* ohne Speicher */
}
docState.layout = 'list';
const saveDocState = () => {
  try {
    localStorage.setItem('ripassa-doc-v1', JSON.stringify(docState));
  } catch {
    /* ohne Speicher */
  }
};

function docFooter() {
  const logo = $('brand-logo')?.innerHTML || 'theis';
  return `<footer class="doc-foot"><span>© 2026</span><span class="doc-logo">${logo}</span></footer>`;
}
function docColumnsFor(x) {
  const has = k =>
    k === 'target' || k === 'de' || x.entries.some(w => (k === 'definition' ? w.definition : k === 'example' ? w.example : w[k]));
  return DOC_COLUMNS.filter(([k]) => has(k)).map(([k, l]) => (k === 'target' ? [k, portalLang(x.language)] : [k, l]));
}
function docCell(w, k, layout) {
  const t = layout === 'test-de' ? 'target' : layout === 'test-it' ? 'de' : null;
  if (k === t) return '<td class="blank"></td>';
  switch (k) {
    case 'target':
      return `<td class="t">${esc(w.target)}</td>`;
    case 'de':
      return `<td>${esc(w.translations.join(' / '))}</td>`;
    case 'image':
      return `<td class="img">${w.image ? `<img src="${esc(w.image)}" alt="">` : ''}</td>`;
    case 'related':
      return `<td class="rel">${esc(String(w.related || '').replace(/;\s*/g, ' · '))}</td>`;
    default:
      return `<td>${esc(w[k] || '')}</td>`;
  }
}
function vocabDocHTML(x) {
  const cols = docColumnsFor(x).filter(([k]) => docState.cols.includes(k) || k === 'target');
  const order = cols.length ? cols : [['target', portalLang(x.language)], ['de', 'Deutsch']];
  const layout = docState.layout;
  const head = order.map(([, l]) => `<th>${esc(l)}</th>`).join('');
  let last = null;
  const rows = x.entries
    .map(w => {
      const sec = w.group && w.group !== last ? `<tr class="doc-sec"><th colspan="${order.length}">${esc(w.group)}</th></tr>` : '';
      last = w.group || last;
      return sec + `<tr>${order.map(([k]) => docCell(w, k, layout)).join('')}</tr>`;
    })
    .join('');
  const book = x.catalog?.textbook?.series ? ' · ' + esc(x.catalog.textbook.series) + (x.catalog.textbook.volume ? ' ' + esc(x.catalog.textbook.volume) : '') : '';
  const test = layout === 'test-de' ? 'Test: auf ' + portalLang(x.language) + ' schreiben' : layout === 'test-it' ? 'Test: auf Deutsch schreiben' : '';
  return `<h1>${esc(x.title.replace(/^Wortschatz · /, ''))}</h1>
  <p class="doc-meta">${esc(portalLang(x.language))}${x.level && x.level !== 'A1' ? ' · ' + esc(x.level) : ''} · ${x.entries.length} Einträge${book}${test ? ' · ' + esc(test) : ''}</p>
  ${layout !== 'list' ? '<p class="doc-name">Name: ______________________________ &nbsp; Datum: ______________</p>' : ''}
  <table class="doc-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table>
  ${docFooter()}`;
}
function docControls(extra = '') {
  return `<div class="print-controls"><button class="button secondary" data-portal="close-print">Zurück</button><span class="doc-actions">${extra}<button class="button secondary" data-doc="word">Word-Datei</button><button class="button primary" data-portal="do-print">Drucken / als PDF</button></span></div>`;
}
function designPicker() {
  return `<label class="doc-design">Design <select data-doc="design">${DOC_DESIGNS.map(([k, l]) => `<option value="${k}" ${docState.design === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
}
function showDoc(inner, extraControls) {
  let sheet = $('teaching-print');
  if (!sheet) {
    sheet = document.createElement('section');
    sheet.id = 'teaching-print';
    document.body.append(sheet);
  }
  sheet.dataset.design = docState.design;
  sheet.style.setProperty('--doc-ac', getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#1a6dff');
  sheet.innerHTML = docControls(designPicker() + (extraControls || '')) + `<div class="doc-body">${inner}</div>`;
  document.body.classList.add('previewing-teaching');
  window.scrollTo({ top: 0, behavior: 'instant' });
}
let docCurrent = null;
function openVocabDoc(id) {
  const x = contentList('vocabulary').find(x => x.id === id);
  if (!x) return;
  docCurrent = { kind: 'vocab', id };
  renderVocabDoc();
}
function renderVocabDoc() {
  const x = contentList('vocabulary').find(x => x.id === docCurrent.id);
  const avail = docColumnsFor(x);
  const options = `<div class="doc-options"><div class="doc-opt-group"><b>Spalten</b>${avail
    .map(([k, l]) => `<label><input type="checkbox" data-doc-col="${k}" ${docState.cols.includes(k) ? 'checked' : ''} ${k === 'target' ? 'disabled checked' : ''}>${l}</label>`)
    .join('')}</div><div class="doc-opt-group"><b>Aufbau</b>${[
    ['list', 'Wortliste'],
    ['test-de', 'Test: Italienisch ausfüllen'],
    ['test-it', 'Test: Deutsch ausfüllen']
  ]
    .map(([k, l]) => `<label><input type="radio" name="doc-layout" data-doc-layout="${k}" ${docState.layout === k ? 'checked' : ''}>${l}</label>`)
    .join('')}</div></div>`;
  showDoc(vocabDocHTML(x), '');
  $('teaching-print').querySelector('.print-controls').insertAdjacentHTML('afterend', options);
}
/* Aufgabenblatt: Design und Word ergänzen */
{
  const base = printTeaching;
  printTeaching = function (solutions) {
    base(solutions);
    const sheet = $('teaching-print');
    if (!sheet) return;
    docCurrent = { kind: 'listening', solutions };
    sheet.dataset.design = docState.design;
    sheet.style.setProperty('--doc-ac', getComputedStyle(document.documentElement).getPropertyValue('--blue').trim() || '#1a6dff');
    const controls = sheet.querySelector('.print-controls');
    controls.innerHTML = docControls(designPicker()).replace(/^<div class="print-controls">|<\/div>$/g, '');
    if (!sheet.querySelector('.doc-foot')) sheet.insertAdjacentHTML('beforeend', docFooter());
  };
}
function docWordFile() {
  const sheet = $('teaching-print').cloneNode(true);
  sheet.querySelectorAll('.paper').forEach(p => (p.style.zoom = ''));
  sheet.querySelectorAll('.print-controls,.doc-options,.dlg-head,.dlg-side,img,.doc-pn').forEach(n => n.remove());
  const pgs = [...sheet.querySelectorAll('.pg')];
  if (pgs.length > 1) {
    const tb = pgs[0].querySelector('tbody');
    pgs.slice(1).forEach((p, i) => {
      p.querySelectorAll('tbody tr').forEach(r => tb.append(r));
      if (i < pgs.length - 2) p.remove();
    });
    pgs[0].querySelector('.doc-foot')?.remove();
    pgs[pgs.length - 1].querySelectorAll('.doc-table').forEach(t => t.remove());
  }
  sheet.querySelectorAll('.doc-logo').forEach(n => (n.textContent = 'theis'));
  const ac = sheet.style.getPropertyValue('--doc-ac') || '#1a6dff';
  const wf = (getComputedStyle($('teaching-print').querySelector('.paper') || document.body).fontFamily || 'Calibri, Arial, sans-serif').replace(/"/g, "'");
  const css = `body{font-family:${wf};font-size:11pt;color:#111}h1{font-size:22pt;color:${ac}}h3{font-size:12pt;margin:0}table{border-collapse:collapse;width:100%}th{background:#eef2f8;text-align:left;border:1px solid #bbb;padding:6px}td{border:1px solid #ccc;padding:6px}td.blank{height:26pt}header{border-bottom:2px solid ${ac};margin-bottom:12pt}footer{border-top:1px solid #bbb;margin-top:18pt;padding-top:6pt;font-size:9pt}li{margin:12pt 0}`;
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Dokument</title><style>${css}</style></head><body>${sheet.innerHTML}</body></html>`;
  const title = (sheet.querySelector('h1')?.textContent || 'Dokument').replace(/[^\p{L}\p{N} _-]+/gu, '').trim().slice(0, 60);
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿', html], { type: 'application/msword' }));
  a.download = title + '.doc';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
document.addEventListener('click', e => {
  const open = e.target.closest('[data-doc-open]');
  if (open) {
    $('vocabulary-set-dialog')?.close();
    openVocabDoc(open.dataset.id);
    return;
  }
  const w = e.target.closest('[data-doc="word"]');
  if (w) docWordFile();
  const col = e.target.closest('[data-doc-col]');
  if (col) {
    const k = col.dataset.docCol;
    docState.cols = col.checked ? [...new Set([...docState.cols, k])] : docState.cols.filter(c => c !== k);
    saveDocState();
    renderVocabDoc();
  }
  const lay = e.target.closest('input[data-doc-layout]');
  if (lay) {
    docState.layout = lay.value || lay.dataset.docLayout;
    saveDocState();
    renderVocabDoc();
  }
});
document.addEventListener('change', e => {
  const d = e.target.closest('select[data-doc="design"]');
  if (!d) return;
  docState.design = d.value;
  saveDocState();
  $('teaching-print').dataset.design = d.value;
});
{
  const base = showVocabularySet;
  showVocabularySet = function (id) {
    base(id);
    $('vocabulary-set-dialog')
      ?.querySelector('.mode-list')
      ?.insertAdjacentHTML('afterend', `<button class="button secondary" data-doc-open="vocab" data-id="${esc(id)}">Als Liste drucken oder Word</button>`);
  };
}
