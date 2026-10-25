/* Katalog: Lehrwerk/Unit/Jahrgang/GER an Wortlisten anzeigen und filtern (Schema 1.2) */
function catalogLine(c) {
  if (!c) return '';
  const t = c.textbook || {};
  const parts = [];
  if (t.series) parts.push([t.series, t.volume ? 'Band ' + t.volume : ''].filter(Boolean).join(' '));
  if (t.publisher) parts.push(t.publisher);
  if (t.unit) parts.push(t.unit);
  if (t.section) parts.push(t.section);
  if (c.grade) parts.push('Jgst. ' + c.grade);
  return parts.join(' · ');
}
function catalogKey(c) {
  const t = (c && c.textbook) || {};
  return t.series ? [t.series, t.volume ? 'Band ' + t.volume : ''].filter(Boolean).join(' ') : c && c.origin === 'textbook' ? 'Lehrwerk' : 'Weitere Listen';
}
{
  const baseSetCard = setCard;
  setCard = function (x, kind) {
    let html = baseSetCard(x, kind);
    const line = catalogLine(x.catalog);
    const key = esc(catalogKey(x.catalog));
    html = html.replace('<article class="set-card">', `<article class="set-card" data-cat="${key}" data-lang="${esc(x.language)}" data-cefr="${esc((x.catalog && x.catalog.cefr) || x.level)}">`);
    if (line) html = html.replace(/(<h3>[\s\S]*?<\/h3>)/, `$1<p class="cat-line">${esc(line)}</p>`);
    return html;
  };
  let catFilter = '';
  const baseLibrary = vocabularyLibrary;
  vocabularyLibrary = function () {
    baseLibrary();
    const grid = document.querySelector('.cards-grid.sets');
    if (!grid) return;
    const keys = [...new Set([...grid.querySelectorAll('[data-cat]')].map(n => n.dataset.cat))];
    if (keys.length < 2) return;
    const bar = document.createElement('div');
    bar.className = 'cat-filter';
    bar.innerHTML = `<label>Lehrwerk / Bereich <select id="cat-filter"><option value="">Alle</option>${keys.map(k => `<option${k === catFilter ? ' selected' : ''}>${esc(k)}</option>`).join('')}</select></label>`;
    grid.before(bar);
    const apply = () => grid.querySelectorAll('[data-cat]').forEach(n => (n.hidden = !!catFilter && n.dataset.cat !== catFilter));
    apply();
    bar.querySelector('select').addEventListener('change', e => { catFilter = e.target.value; apply(); });
  };
}
