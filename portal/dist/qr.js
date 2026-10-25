/* QR-Codes für Direktlinks: Lehrkraft zeigt den Code, Lernende landen sofort auf der Aufgabe. */
function qrLessonURL(id) {
  const u = new URL(location.href);
  u.search = ''; u.hash = '';
  u.searchParams.set('hoeren', id);
  return u.href;
}
function qrSeriesURL(series) {
  const u = new URL(location.href);
  u.search = ''; u.hash = '';
  u.searchParams.set('reihe', series);
  return u.href;
}
function qrSVG(text, label) {
  try {
    const q = qrcode(0, 'M');
    q.addData(text);
    q.make();
    const n = q.getModuleCount(), pad = 2;
    let d = '';
    for (let r = 0; r < n; r++)
      for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c + pad} ${r + pad}h1v1h-1z`;
    const s = n + pad * 2;
    return `<svg class="qr-svg" viewBox="0 0 ${s} ${s}" role="img" aria-label="${esc(label || 'QR-Code')}" shape-rendering="crispEdges"><rect width="${s}" height="${s}" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
  } catch {
    return '';
  }
}
let qrState = null;
function qrEntries(x) {
  const sib = x.series ? contentList('listening').filter(y => y.series === x.series) : [x];
  const order = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  sib.sort((a, b) => order.indexOf(a.level) - order.indexOf(b.level) || a.title.localeCompare(b.title));
  return sib;
}
function showQR(id, pick) {
  const x = contentList('listening').find(y => y.id === id);
  if (!x) return;
  const sib = qrEntries(x);
  const cur = sib.find(y => y.id === (pick || id)) || x;
  qrState = { id: x.id, pick: cur.id };
  let d = document.getElementById('qr-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'qr-dialog';
    d.setAttribute('aria-labelledby', 'qr-title');
    document.body.append(d);
  }
  const url = qrLessonURL(cur.id);
  const tabs = sib.length > 1
    ? `<div class="qr-tabs" role="tablist">${sib.map(y => `<button role="tab" aria-selected="${y.id === cur.id}" data-qr-pick="${esc(y.id)}"><b>${esc(y.levelLabel || y.level)}</b><small>${esc(y.level)}</small></button>`).join('')}<button role="tab" aria-selected="false" data-qr-series="${esc(x.series)}"><b>Alle Stufen</b><small>Auswahlseite</small></button></div>`
    : '';
  d.innerHTML = `<div class="qr-head"><span class="eyebrow">Zum Mitmachen scannen</span><button class="button secondary" data-close="qr-dialog">Schließen</button></div>
  <h2 id="qr-title">${esc(x.seriesTitle || cur.title)}</h2>${tabs}
  <div class="qr-card">${qrSVG(url, 'QR-Code zu ' + cur.title)}</div>
  <p class="qr-sub">${esc(cur.title)}</p>
  <p class="qr-url">${esc(url.replace(/^https?:\/\//, ''))}</p>
  <div class="qr-actions"><button class="button primary" data-qr-copy="${esc(url)}">Link kopieren</button></div>`;
  if (!d.open) d.showModal();
}
function showSeriesQR(series, title) {
  let d = document.getElementById('qr-dialog');
  const url = qrSeriesURL(series);
  d.querySelector('.qr-card').innerHTML = qrSVG(url, 'QR-Code zur Auswahl aller Stufen');
  d.querySelector('.qr-sub').textContent = 'Alle Stufen zur Auswahl';
  d.querySelector('.qr-url').textContent = url.replace(/^https?:\/\//, '');
  d.querySelector('[data-qr-copy]').dataset.qrCopy = url;
  d.querySelectorAll('[role=tab]').forEach(t => t.setAttribute('aria-selected', String(t.dataset.qrSeries === series)));
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-qr-show],[data-qr-pick],[data-qr-series],[data-qr-copy]');
  if (!b) return;
  if (b.dataset.qrShow) showQR(b.dataset.qrShow);
  else if (b.dataset.qrPick) showQR(qrState.id, b.dataset.qrPick);
  else if (b.dataset.qrSeries) showSeriesQR(b.dataset.qrSeries);
  else if (b.dataset.qrCopy)
    (navigator.clipboard?.writeText(b.dataset.qrCopy) || Promise.reject())
      .then(() => toast('Link kopiert.'))
      .catch(() => prompt('Link zum Kopieren:', b.dataset.qrCopy));
});
/* ?reihe=<id>: Auswahlseite mit allen Stufen eines Liedes oder Films */
function openSeries(series) {
  portalFilters.series = series;
  nav('hoeren');
}
