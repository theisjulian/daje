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
  sheet.dataset.title = title;
  dlgStyle(sheet);
  const keepScroll = sheet.querySelector('.dlg-prev')?.scrollTop || 0;
  sheet.innerHTML = `<div class="dlg-head"><button class="dlg-link" data-portal="close-print">Abbrechen</button><b>${esc(title)}</b><span class="dlg-acts"><button class="dlg-link dlg-tune" data-dlg-side aria-expanded="false">Anpassen</button><button class="dlg-link" data-doc="word">Word<span class="hide-m">-Datei</span></button><button class="dlg-link" data-portal="do-print">Drucken</button><button class="dlg-link strong" data-dlg-pdf>PDF<span class="hide-m"> speichern</span></button></span></div>
  <div class="dlg-grid"><aside class="dlg-side">${side}</aside><div class="dlg-prev"><div class="pages"><div class="paper">${paper}</div></div></div>`;
  document.body.classList.add('previewing-teaching');
  dlgPaginate();
  hbPaginate();
  dlgFit();
  // Schriften laden nach: danach neu messen, sonst stimmt die Seitenaufteilung nicht.
  if (document.fonts && document.fonts.status === 'loading')
    document.fonts.ready.then(() => document.body.classList.contains('previewing-teaching') && dlgRelayout());
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
  // Druckfläche: sichere 235 mm (A4 297 mm minus @page-Rand, mit Reserve für Safari/iPad); Breite 180 mm = 680 px entspricht
  // genau der Bildschirmseite (794 px minus 2 × 15 mm), daher stimmen die gemessenen Zeilenhöhen. 10 px Reserve.
  const inner = Math.floor((235 * 96) / 25.4) - 10;
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
/* Hörblatt in echte A4-Seiten teilen, damit Vorschau und Druck übereinstimmen: Aufgaben werden nie geteilt,
   ein Abschnittstitel bleibt bei seiner ersten Aufgabe, die Quellenzeile bei der letzten. Ab Seite 2 steht eine
   schmale Kopfzeile, auf jeder Seite die Seitenzahl. Bliebe die letzte Seite fast leer, wird der Abstand
   verdichtet, sofern das eine Seite spart. */
let hbFlatHTML = '';
/* Teilbare Aufgabe: Zeilen eines Lückentexts, Zeilen von Tabellen und Satzlisten, Antwortzeilen.
   make(a, b) liefert eine Kopie mit den Zeilen a … b−1; Fortsetzungen ohne Kopf, Wortkasten und Erklärung. */
function hbSplitter(li) {
  // Lesetext: an Absatzgrenzen teilen; die Fortsetzung ohne Überschrift
  if (li.matches('.hb-reading')) {
    const n = li.querySelectorAll(':scope > p').length;
    if (n < 2) return null;
    const ps = [...li.querySelectorAll(':scope > p')];
    // Eine Zwischenüberschrift (Absatz nur aus Fettdruck, z. B. Interviewfrage) bleibt bei ihrem Absatz
    const head = p => p.children.length === 1 && p.firstElementChild.tagName === 'B' && p.textContent.trim() === p.firstElementChild.textContent.trim();
    return {
      n,
      bad: k => head(ps[k - 1]),
      make(a, b) {
        const c = li.cloneNode(true);
        [...c.querySelectorAll(':scope > p')].forEach((el, i) => (i < a || i >= b) && el.remove());
        if (a > 0) {
          c.classList.add('hb-reading-cont');
          c.querySelector(':scope > h3')?.remove();
        }
        return c;
      }
    };
  }
  const rowsOf = el => {
    if (el.matches('p.hb-gap')) return { kind: 'lines', n: el.innerHTML.split('\n').length };
    if (el.matches('table')) return { kind: 'rows', n: el.tBodies[0]?.rows.length || 0 };
    if (el.matches('.hb-sc, .hb-notes, .hb-opts')) return { kind: 'kids', n: el.children.length };
    return null;
  };
  const kids = [...li.children];
  let body = kids.find(el => rowsOf(el) && rowsOf(el).n > 1);
  let info = body && rowsOf(body);
  // Ordnen und Antwortzeilen: mehrere gleichartige Kinder direkt in der Aufgabe
  if (!body) {
    const run = kids.filter(el => el.matches('.hb-o, .hb-line'));
    if (run.length > 1) info = { kind: 'direct', n: run.length };
  }
  if (!info || info.n < 2) return null;
  const idx = body ? kids.indexOf(body) : -1;
  return {
    n: info.n,
    make(a, b) {
      const c = li.cloneNode(true);
      const ck = [...c.children];
      if (info.kind === 'direct') ck.filter(el => el.matches('.hb-o, .hb-line')).forEach((el, i) => (i < a || i >= b) && el.remove());
      else {
        const cb = ck[idx];
        if (info.kind === 'lines') cb.innerHTML = cb.innerHTML.split('\n').slice(a, b).join('\n');
        else if (info.kind === 'rows') [...cb.tBodies[0].rows].forEach((r, i) => (i < a || i >= b) && r.remove());
        else [...cb.children].forEach((r, i) => (i < a || i >= b) && r.remove());
      }
      if (a > 0) {
        c.classList.add('hb-q-cont');
        c.querySelectorAll(':scope > .hb-qh, :scope > .hb-bank').forEach(el => el.remove());
      }
      if (b < info.n) c.querySelectorAll(':scope > .hb-ex, :scope > .hb-sol').forEach(el => el.remove());
      return c;
    }
  };
}
function hbPaginate() {
  const sheet = $('teaching-print'), pages = sheet && sheet.querySelector('.pages');
  const paper = pages && pages.querySelector(':scope > .paper'), hb = paper && paper.querySelector(':scope > .hb');
  if (!hb) return;
  hbFlatHTML = paper.innerHTML;
  pages.style.zoom = 1;
  // Druckseite: 240 mm Inhalt (siehe app.css): passt auch bei den größeren Druckrändern von Safari; 6 px Reserve.
  const INNER = Math.floor((240 * 96) / 25.4) - 6;
  const y = el => el.getBoundingClientRect().top;
  const list = hb.querySelector(':scope > .hb-list'), key = hb.querySelector(':scope > .hb-key');
  const tr = hb.querySelector(':scope > .hb-tr'), src = hb.querySelector(':scope > .hb-src'), foot = hb.querySelector(':scope > .doc-foot');
  const body = list || key;
  if (!body) return;
  const head = [...hb.children].slice(0, [...hb.children].indexOf(body));
  const after = el => el.nextElementSibling || foot;
  const measure = () => {
    const u = [];
    if (list) [...list.children].forEach((li, i, a) => u.push({ box: 'list', node: li, h: y(a[i + 1] || after(list)) - y(li), glue: li.classList.contains('hb-phase'), brk: li.classList.contains('hb-sheet') }));
    if (key) {
      const rows = [...key.tBodies[0].rows], tf = key.tFoot;
      rows.forEach((r, i) => u.push({ box: 'key', node: r, h: y(rows[i + 1] || tf || after(key)) - y(r) }));
      if (tf) u.push({ box: 'keyfoot', node: tf, h: y(after(key)) - y(tf), stick: true });
    }
    if (tr) {
      const ps = [...tr.children];
      ps.forEach((p, i) => u.push({ box: 'tr', node: p, h: y(ps[i + 1] || after(tr)) - (i ? y(p) : y(tr)), glue: i === 0 }));
    }
    if (src) u.push({ box: 'flow', node: src, h: (foot ? y(foot) : src.getBoundingClientRect().bottom + 8) - y(src), stick: true });
    // Zusammengehöriges zu Blöcken: Titel mit Folgeelement, Quellenzeile/Tabellenfuß mit Vorgänger.
    const blocks = [];
    u.forEach((x, i) => {
      const prev = u[i - 1];
      if (blocks.length && (x.stick || (prev && prev.glue))) blocks[blocks.length - 1].push(x);
      else blocks.push([x]);
    });
    return { headH: y(body) - y(hb), blocks };
  };
  const probe = document.createElement('div');
  probe.className = 'hb-run';
  probe.innerHTML = '<span>x</span>';
  hb.prepend(probe);
  const runH = probe.offsetHeight + parseFloat(getComputedStyle(probe).marginBottom);
  probe.remove();
  const footH = (foot ? foot.offsetHeight : 30) + 10;
  // Höhe eines (abgetrennten) Aufgabenteils in der fortlaufenden Liste messen.
  const hOf = node => {
    const end = document.createElement('li');
    end.style.cssText = 'margin:0;padding:0;height:0;border:0;list-style:none';
    list.append(node, end);
    const h = y(end) - y(node);
    node.remove();
    end.remove();
    return h;
  };
  // Lange Aufgabe an Zeilengrenzen teilen, damit keine halbleeren Seiten entstehen.
  const splitQ = (u, room) => {
    const sp = hbSplitter(u.node);
    if (!sp || sp.n < 2) return null;
    let k = 0;
    for (let i = 1; i < sp.n; i++) {
      if (hOf(sp.make(0, i)) <= room) {
        if (!sp.bad?.(i)) k = i;
      } else break;
    }
    if (!k) return null;
    const a = sp.make(0, k), b = sp.make(k, sp.n);
    return [{ ...u, node: a, h: hOf(a) }, { ...u, node: b, h: hOf(b), glue: false }];
  };
  const split = ({ headH, blocks }) => {
    const out = [];
    let cur = [], used = 0, cap = INNER - footH - headH, phase = null;
    blocks = blocks.slice();
    for (let bi = 0; bi < blocks.length; bi++) {
      let b = blocks[bi];
      let bh = b.reduce((s, x) => s + x.h, 0);
      // Passt die Aufgabe nicht mehr, aber ist noch viel Platz (oder ist sie länger als eine Seite)? Dann teilen.
      const last = b[b.length - 1];
      if (list && used + bh > cap && last.box === 'list' && (last.node.classList?.contains('hb-q') || last.node.classList?.contains('hb-reading')) && !b[0].brk) {
        const pre = b.slice(0, -1).reduce((s, x) => s + x.h, 0);
        const room = cap - used - pre;
        if (room > Math.max(90, cap * 0.18) || bh > cap * 0.9) {
          const parts = splitQ(last, cur.length || used ? room : cap - pre);
          if (parts) {
            b = [...b.slice(0, -1), parts[0]];
            blocks.splice(bi + 1, 0, [parts[1]]);
            bh = b.reduce((s, x) => s + x.h, 0);
          }
        }
      }
      // Neues Blatt (Arbeitsblatt-Mappe) beginnt immer auf einer neuen Seite.
      if ((used + bh > cap || b[0].brk) && cur.length) {
        out.push(cur);
        cur = [];
        used = 0;
        cap = INNER - footH - runH;
        // Abschnitt läuft auf der neuen Seite weiter: Überschrift wiederholen.
        if (phase && b[0].box === 'list' && !b[0].glue && !b[0].brk) {
          cur.push({ ...phase, repeat: true });
          used += phase.h;
        }
      }
      // Auch auf einer frischen Seite zu lang (z. B. Überschrift + langer Lesetext): hier teilen,
      // sonst schiebt der Drucker den Block weiter und lässt eine fast leere Seite zurück.
      {
        const tail = b[b.length - 1];
        if (list && used + bh > cap && tail.box === 'list' && (tail.node.classList?.contains('hb-q') || tail.node.classList?.contains('hb-reading'))) {
          const pre = b.slice(0, -1).reduce((acc, x) => acc + x.h, 0);
          const parts = splitQ(tail, cap - used - pre);
          if (parts) {
            b = [...b.slice(0, -1), parts[0]];
            blocks.splice(bi + 1, 0, [parts[1]]);
            bh = b.reduce((acc, x) => acc + x.h, 0);
          }
        }
      }
      for (const x of b) if (x.box === 'list' && x.glue) phase = x;
      cur.push(...b);
      used += bh;
    }
    out.push(cur);
    return { out, fill: used / cap };
  };
  let plan = split(measure());
  if (plan.out.length > 1 && plan.fill < 0.35) {
    hb.classList.add('dense');
    const dense = split(measure());
    if (dense.out.length < plan.out.length) plan = dense;
    else hb.classList.remove('dense');
  }
  const title = esc(hb.querySelector('h1')?.textContent || '');
  const kind = esc(hb.querySelector('.hb-top span')?.textContent || '');
  const N = plan.out.length;
  const made = plan.out.map((units, n) => {
    const pg = document.createElement('div');
    pg.className = 'paper pg hbp';
    const h = hb.cloneNode(false);
    pg.append(h);
    if (n === 0) head.forEach(e => h.append(e.cloneNode(true)));
    else h.insertAdjacentHTML('beforeend', `<div class="hb-run"><span>${title}</span><span>${kind}</span></div>`);
    let box = '', cont = null, table = null;
    for (const x of units) {
      if (x.box === 'keyfoot') { table.append(x.node.cloneNode(true)); continue; }
      if (x.box !== box) {
        box = x.box;
        if (box === 'list') h.append((cont = list.cloneNode(false)));
        else if (box === 'key') {
          table = key.cloneNode(false);
          table.append(key.tHead.cloneNode(true), (cont = document.createElement('tbody')));
          h.append(table);
        } else if (box === 'tr') h.append((cont = tr.cloneNode(false)));
        else cont = h;
      }
      const c = x.node.cloneNode(true);
      if (x.repeat) c.classList.add('hb-cont');
      cont.append(c);
    }
    pg.insertAdjacentHTML('beforeend', docFooter());
    pg.lastElementChild.insertAdjacentHTML('afterbegin', `<span class="doc-pn">${n + 1} / ${N}</span>`);
    return pg;
  });
  pages.replaceChildren(...made);
}
window.addEventListener('resize', dlgFit);
document.addEventListener('click', e => {
  const b = e.target.closest('[data-dlg-side]');
  const sheet = document.getElementById('teaching-print');
  if (b && sheet) { const on = sheet.classList.toggle('side-open'); b.setAttribute('aria-expanded', String(on)); b.textContent = on ? 'Fertig' : 'Anpassen'; setTimeout(dlgFit, 50); }
});
/* Design und Schrift ändern Zeilenhöhen: Seiten neu aufteilen. */
function dlgRelayout() {
  if (docCurrent && docCurrent.kind === 'listening') printTeaching(docCurrent.solutions);
  else if (docCurrent && docCurrent.kind === 'vocab' && typeof renderVocabDoc === 'function') renderVocabDoc();
  else dlgStyle($('teaching-print'));
}
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
  const x = findTask(teacherLessonId);
  if (!x) return;
  hbOpt.solutions = !!solutions;
  hbOpt.compact = solutions === 2;
  docCurrent = { kind: 'listening', solutions };
  const side =
    dlgBlock('Ausgabe', dlgSeg('data-hb="mode"', 'hb-mode', [[0, 'Aufgabenblatt'], [1, 'Lösungen'], [2, 'Kurzer Schlüssel']], solutions === 2 ? 2 : solutions ? 1 : 0)) +
    dlgBlock('Sprache der Anweisungen', dlgSeg('data-instr="pref"', 'instr', [['target', 'Zielsprache'], ['de', 'Deutsch']], instrPref)) +
    dlgBlock('Design', dlgDesigns()) + dlgBlock('Schrift', dlgFonts()) + dlgBlock('Farbe', dlgAccents()) +
    dlgBlock('Zusätze', x.kind === 'grammar' ? `<label class="dlg-check"><input type="checkbox" data-hb-opt="rule" ${hbOpt.rule !== false ? 'checked' : ''}><span>Merkkasten mitdrucken</span></label>` : `<label class="dlg-check"><input type="checkbox" data-hb-opt="link" ${hbOpt.link ? 'checked' : ''}><span>Link zum Anhören aufdrucken</span></label>${x.transcript ? `<label class="dlg-check"><input type="checkbox" data-hb-opt="transcript" ${hbOpt.transcript ? 'checked' : ''}><span>Transkript bei den Lösungen</span></label>` : ''}`);
  if ($('teaching-dialog')?.open) $('teaching-dialog').close();
  dlgShow({ title: x.title, side, paper: hbHTML(x, !!solutions) });
};
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('input[data-doc="design"]')) {
    docState.design = t.value; saveDocState(); dlgRelayout();
  } else if (t.matches('input[data-doc="font"]')) {
    docState.font = t.value; saveDocState(); dlgRelayout();
  } else if (t.matches('input[data-doc="accent"]')) {
    docState.accent = t.value; saveDocState(); dlgStyle($('teaching-print'));
  } else if (t.matches('input[data-hb="mode"]')) printTeaching(Number(t.value));
  else if (t.matches('input[data-instr="pref"]')) { setInstrPref(t.value); printTeaching(docCurrent && docCurrent.solutions); }
});

/* Dateiname für PDF und Druck: „daje – Titel – Art.pdf“ (Art: Aufgabenblatt, Lösungen …) */
function dlgFileName() {
  const sheet = $('teaching-print');
  const title = (sheet?.dataset.title || 'Arbeitsblatt').trim();
  const kind = (sheet?.querySelector('.hb-top span, .doc-head span')?.textContent || '').trim();
  const name = ['daje', title, kind && !title.includes(kind) ? kind : ''].filter(Boolean).join(' - ');
  return name.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140);
}
const dlgLoad = src =>
  new Promise((ok, fail) => {
    if (document.querySelector(`script[data-lib="${src}"]`)) return ok();
    const s = document.createElement('script');
    s.src = src;
    s.dataset.lib = src;
    s.onload = ok;
    s.onerror = () => fail(new Error('Laden fehlgeschlagen: ' + src));
    document.head.append(s);
  });
/* PDF direkt speichern, ohne Druckdialog: jede A4-Seite der Vorschau wird als Bild in hoher Auflösung
   in eine PDF übernommen (gleiches Aussehen wie die Vorschau; Text nicht markierbar). */
async function dlgSavePdf(btn) {
  const sheet = $('teaching-print');
  const wrap = sheet && sheet.querySelector('.pages');
  if (!wrap) return;
  const label = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'PDF wird erstellt …';
  }
  const zoom = wrap.style.zoom;
  try {
    await Promise.all([dlgLoad('vendor/html2canvas-pro-2.4.5.min.js'), dlgLoad('vendor/jspdf-2.5.2.umd.min.js')]);
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    wrap.style.zoom = 1;
    const pdf = new window.jspdf.jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
    const papers = [...wrap.querySelectorAll(':scope > .paper')];
    const paged = papers.every(p => p.classList.contains('pg'));
    let first = true;
    const addCanvas = c => {
      if (!first) pdf.addPage();
      first = false;
      pdf.addImage(c.toDataURL('image/jpeg', 0.85), 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
    };
    for (const p of papers) {
      const c = await window.html2canvas(p, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
      if (paged) addCanvas(c);
      else {
        // Ohne Seitenaufteilung: in A4-hohe Abschnitte schneiden
        const pageH = Math.round((c.width * 297) / 210);
        for (let y = 0; y < c.height; y += pageH) {
          const part = document.createElement('canvas');
          part.width = c.width;
          part.height = pageH;
          const g = part.getContext('2d');
          g.fillStyle = '#fff';
          g.fillRect(0, 0, part.width, part.height);
          g.drawImage(c, 0, -y);
          addCanvas(part);
        }
      }
    }
    // Selbst speichern (fester Dateiname, auch in Safari und auf dem iPad)
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = dlgFileName() + '.pdf';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  } catch (err) {
    toast('PDF konnte nicht erstellt werden. Bitte „Drucken“ und dort „Als PDF sichern“ verwenden.');
    console.warn(err);
  } finally {
    wrap.style.zoom = zoom;
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = label;
    }
  }
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-dlg-pdf]');
  if (b) dlgSavePdf(b);
});
