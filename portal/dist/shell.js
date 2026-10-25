'use strict';
/*
 * Rahmen der App: Navigation mit Symbolen, Umschalter Lernende/Lehrkräfte,
 * kompakte Kopfzeile, Tab-Leiste und „Mehr“-Blatt auf dem Handy.
 */

const ICONS = {
  start: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/>',
  hoeren:
    '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4.5" height="6.5" rx="1.6"/><rect x="16.5" y="14" width="4.5" height="6.5" rx="1.6"/>',
  vokabeln:
    '<rect x="4" y="3.5" width="16" height="17" rx="2.6"/><path d="M8 8.5h8M8 12.5h8M8 16.5h4.5"/>',
  sammlung: '<path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-4.2L5.5 21V4.5a1 1 0 0 1 1-1Z"/>',
  verlauf: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  fortschritt: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
  verben: '<path d="M5 6h14M5 12h14M5 18h9"/>',
  hilfe:
    '<path d="M9 18h6M10 21h4"/><path d="M12 3.5a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.4 1.1 2.2h5c0-.8.4-1.6 1.1-2.2A6 6 0 0 0 12 3.5Z"/>',
  mehr: '<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>',
  look: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17"/><path d="M12 3.5a8.5 8.5 0 0 1 0 17" fill="currentColor"/>',
  share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 12v7.5h14V12"/>',
  profile: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  account:
    '<rect x="4" y="10" width="16" height="10.5" rx="2.4"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>',
  quellen: '<path d="M7 4h8l4 4v12.5H7z"/><path d="M15 4v4h4"/>',
  redaktion: '<path d="M4 20l1-4.5L16.5 4a2 2 0 0 1 3 3L8 18.5z"/>'
};
const icon = name =>
  `<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

const PRIMARY_NAV = [
  ['start', 'Mein Lernbereich'],
  ['hoeren', 'Hörverstehen'],
  ['vokabeln', 'Wortschatz'],
  ['sammlung', 'Merkliste']
];
const SECONDARY_NAV = [
  ['fortschritt', 'Mein Fortschritt'],
  ['hilfe', 'Lerntipps']
];
const NAV_GROUP = {
  lernen: 'vokabeln',
  wortschatz: 'vokabeln',
  verben: 'vokabeln',
  hoeruebung: 'hoeren',
  verlauf: 'sammlung'
};
const MORE_ROUTES = ['fortschritt', 'hilfe', 'quellen', 'redaktion'];

const navButton = ([route, label]) =>
  `<button data-nav="${route}">${icon(route)}<span class="nav-label">${label}</span></button>`;

function markNav(route) {
  const current = NAV_GROUP[route] || route;
  document.querySelectorAll('.nav-list [data-nav],.tabbar [data-nav]').forEach(b => {
    if (b.dataset.nav === current) b.setAttribute('aria-current', 'page');
    else b.removeAttribute('aria-current');
  });
  const more = document.querySelector('.tabbar [data-sheet="more"]');
  if (more) {
    if (MORE_ROUTES.includes(current)) more.setAttribute('aria-current', 'page');
    else more.removeAttribute('aria-current');
  }
}

function refreshAudience() {
  applyAudienceLabels();
  if (view === 'hoeruebung') renderListening();
  else if (session) renderSession();
  else render();
  if (view === 'hoeruebung' || view === 'start' || view === 'hoeren' || view === 'vokabeln')
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function iconButton(el, name, label) {
  el.classList.add('top-btn');
  el.setAttribute('aria-label', label);
  el.title = label;
  el.innerHTML = `${icon(name)}<span class="btn-text">${label}</span>`;
}

function setupShell() {
  // Seitenleiste: Navigation mit Symbolen
  document.querySelector('.wordmark')?.remove();
  const appname = document.querySelector('.appname');
  appname.innerHTML =
    '<a href="#start" data-nav="start">daje</a><small>Hören und Wortschatz</small>';
  document.querySelector('.nav-list').innerHTML =
    PRIMARY_NAV.map(navButton).join('') +
    '<hr class="nav-sep">' +
    SECONDARY_NAV.map(navButton).join('');
  const bottom = document.querySelector('.sidebar-bottom');
  bottom.innerHTML =
    '<div class="privacy-note">Dein Lernstand bleibt auf diesem Gerät.</div>' +
    `<button class="quiet" data-nav="quellen">Quellen und Bildnachweise</button>` +
    '<span class="preview-badge">Private Vorschau</span>' +
    '<a class="brandmark" href="https://theisapps.de" target="_blank" rel="noopener" aria-label="theis · theisapps.de"><span>© 2026</span><span id="brand-logo"></span></a>';

  // Kopfzeile: Logo (Handy), Titel, Umschalter, Aktionen
  const top = document.querySelector('.topbar');
  const actions = top.querySelector('.top-actions');
  const crumb = $('breadcrumb');
  const brand = document.createElement('a');
  brand.className = 'top-brand';
  brand.href = '#start';
  brand.dataset.nav = 'start';
  brand.textContent = 'daje';
  const sw = document.createElement('div');
  sw.className = 'audience-switch';
  sw.setAttribute('role', 'group');
  sw.setAttribute('aria-label', 'Ansicht wählen');
  sw.innerHTML =
    '<button data-audience="learn" aria-pressed="true">Lernende</button><button data-audience="teach" aria-pressed="false">Lehrkräfte</button>';
  top.prepend(brand);
  crumb.after(sw);

  iconButton($('look-open'), 'look', 'Darstellung');
  iconButton($('share'), 'share', 'Auswahl teilen');
  const profile = $('profile-open');
  if (profile) iconButton(profile, 'profile', 'Lernprofil');
  [profile, $('share'), $('look-open')].filter(Boolean).forEach(b => actions.append(b));

  // Fußzeile: Redaktion nur hier
  const foot = document.querySelector('.foot');
  foot.innerHTML =
    '<a class="brandmark" href="https://theisapps.de" target="_blank" rel="noopener" aria-label="theis · theisapps.de"><span>© 2026</span><span id="brand-logo-m"></span></a><span class="foot-links"><button class="quiet" data-nav="quellen">Quellen</button><button class="quiet" data-nav="redaktion">Redaktion</button></span>';

  // Handy: Tab-Leiste und „Mehr“-Blatt
  const tabs = document.createElement('nav');
  tabs.className = 'tabbar';
  tabs.setAttribute('aria-label', 'Schnellzugriff');
  tabs.innerHTML =
    PRIMARY_NAV.map(
      ([r, l]) => `<button data-nav="${r}">${icon(r)}<span class="nav-label">${l}</span></button>`
    ).join('') + `<button data-sheet="more">${icon('mehr')}<span>Mehr</span></button>`;
  document.body.append(tabs);

  const sheet = document.createElement('dialog');
  sheet.id = 'more-sheet';
  sheet.className = 'sheet';
  sheet.setAttribute('aria-label', 'Weitere Bereiche');
  sheet.innerHTML = `<div class="sheet-grip" aria-hidden="true"></div>
    <div class="sheet-grid">${SECONDARY_NAV.map(navButton).join('')}<button data-nav="verlauf">${icon('verlauf')}<span class="nav-label">Verlauf</span></button><button data-nav="quellen">${icon('quellen')}<span class="nav-label">Quellen</span></button></div>
    <div class="sheet-grid actions">
      <button data-sheet-click="look-open">${icon('look')}<span>Darstellung</span></button>
      <button data-sheet-click="profile-open">${icon('profile')}<span>Lernprofil</span></button>
      <button data-sheet-click="share">${icon('share')}<span>Teilen</span></button>
      <button data-nav="redaktion">${icon('redaktion')}<span>Redaktion</span></button>
    </div>
    <label class="field sheet-lang">Sprache der Oberfläche<select id="ui-language-m"></select></label>
    <button class="button secondary full" data-close="more-sheet">Schließen</button>`;
  document.body.append(sheet);

  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.sheet === 'more') {
      sheet.showModal();
      return;
    }
    if (b.dataset.sheetClick) {
      sheet.close();
      (b.dataset.sheetClick === 'share' ? $('share') : $(b.dataset.sheetClick))?.click();
      return;
    }
    if (b.dataset.nav && sheet.open) sheet.close();
  });
  sheet.addEventListener('click', e => {
    if (e.target === sheet) sheet.close();
  });
  document.addEventListener('keydown', e => {
    const card = e.target.closest?.('.flashcard[data-action="flip"]');
    if (card && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      card.click();
    }
  });
  applyAudienceLabels();
}

/* Sprachauswahl der Oberfläche auch im „Mehr“-Blatt anbieten (nach setupI18n aufrufen). */
function mirrorLanguageSelect() {
  const src = $('ui-language'),
    dst = $('ui-language-m');
  if (!dst) return;
  if (!src) {
    dst.closest('label').hidden = true;
    return;
  }
  dst.innerHTML = src.innerHTML;
  dst.value = src.value;
  dst.addEventListener('change', () => {
    src.value = dst.value;
    src.dispatchEvent(new Event('change', { bubbles: true }));
  });
  src.addEventListener('change', () => (dst.value = src.value));
}
