/*
 * Einstellungen an einem Ort: Konto, Sprachen (Oberfläche, Lernsprache, Arbeitsanweisungen), Üben (Fokus-Modus,
 * Ansicht Lernende/Lehrkräfte) und Darstellung (Farbwelt, Schrift, Hell/Dunkel). Baut den bisherigen Dialog
 * „Darstellung“ aus; dessen Bedienelemente und Speicherorte bleiben unverändert (keine Daten gehen verloren).
 * Erreichbar über das Zahnrad oben rechts und im „Mehr“-Blatt am Handy.
 */
(function () {
  function settingsHTML() {
    const u = typeof ACC !== 'undefined' ? ACC.user : null;
    const md = u?.user_metadata || {};
    const name = [md.first_name, md.last_name].filter(Boolean).join(' ') || (u ? u.email : '');
    const ini = (md.first_name || u?.email || '?').charAt(0).toUpperCase() + (md.last_name || '').charAt(0).toUpperCase();
    const lern = lernSprache();
    const seg = (attr, opts, cur) => `<div class="set-seg" role="group">${opts.map(([v, l]) => `<button type="button" ${attr}="${v}" aria-pressed="${String(cur) === String(v)}">${l}</button>`).join('')}</div>`;
    return `<section class="set-sec set-account">${
      u
        ? `<div class="set-avatar" aria-hidden="true">${esc(ini)}</div><div class="set-who"><b>${esc(name)}</b><small>${esc(u.email)}${typeof ACC !== 'undefined' && ACC.admin ? ' · Administrator' : ''}</small></div><button class="button secondary" data-acc-open>Konto</button>`
        : `<div class="set-avatar is-guest" aria-hidden="true">${icon('account')}</div><div class="set-who"><b>Ohne Konto</b><small>Dein Lernstand bleibt auf diesem Gerät.</small></div><button class="button primary" data-acc-open>Anmelden</button>`
    }</section>
      <section class="set-sec"><h3>Sprache</h3>
        <div class="set-row"><span>Oberfläche</span><div id="set-ui-lang"></div></div>
        <div class="set-row"><span>Ich lerne</span>${seg('data-set-lern', Object.entries(LERN_NAMES), lern)}</div>
        <div class="set-row"><span>Arbeitsanweisungen</span>${seg('data-set-instr', [['target', 'in der Zielsprache'], ['de', 'auf Deutsch']], instrPref)}</div>
      </section>
      <section class="set-sec"><h3>Üben</h3>
        <div class="set-row"><span>Aufgaben</span>${seg('data-set-focus', [['1', 'eine nach der anderen'], ['0', 'alle auf einmal']], focusMode() ? '1' : '0')}</div>
        <div class="set-row"><span>Ansicht</span>${seg('data-audience', [['learn', 'Lernende'], ['teach', 'Lehrkräfte']], isTeacher() ? 'teach' : 'learn')}</div>
      </section>
      <h3 class="set-h">Darstellung</h3>`;
  }

  function open() {
    const d = $('look-dialog');
    if (!d) return;
    let box = d.querySelector('.set-top');
    if (!box) {
      box = document.createElement('div');
      box.className = 'set-top';
      d.querySelector('.dialog-head').after(box);
      d.querySelector('.dialog-head h2').textContent = 'Einstellungen';
      const intro = d.querySelector(':scope > p.muted');
      if (intro) intro.className = 'muted small set-intro';
    }
    box.innerHTML = settingsHTML();
    // Sprachauswahl der Oberfläche: das vorhandene Auswahlfeld (mit seinem Verhalten) hierher holen
    const lang = document.querySelector('label.ui-language');
    if (lang) box.querySelector('#set-ui-lang').append(lang);
    d.classList.add('settings-dialog');
    if (!d.open) d.showModal();
  }
  window.openSettings = open;

  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.id === 'look-open' || b.dataset.settingsOpen !== undefined) {
      e.stopImmediatePropagation();
      return open();
    }
    if (!b.closest('#look-dialog')) return;
    if (b.dataset.setLern) {
      setLernSprache(b.dataset.setLern);
      portalFilters.language = b.dataset.setLern;
      render();
      return open();
    }
    if (b.dataset.setInstr) {
      setInstrPref(b.dataset.setInstr);
      if (document.getElementById('listening-form')) renderListening();
      return open();
    }
    if (b.dataset.setFocus) {
      setFocusMode(b.dataset.setFocus === '1');
      if (document.getElementById('listening-form')) renderListening();
      return open();
    }
    if (b.dataset.audience) setTimeout(open, 0);
    if (b.dataset.accOpen !== undefined) $('look-dialog').close();
  }, true);

  addEventListener('DOMContentLoaded', () => {
    const btn = $('look-open');
    if (btn) {
      btn.title = 'Einstellungen';
      btn.setAttribute('aria-label', 'Einstellungen');
      btn.innerHTML = `${icon('einstellungen')}<span class="btn-text">Einstellungen</span>`;
    }
    // Handy: „Mehr“-Blatt zeigt Einstellungen statt Darstellung und Sprachfeld
    const sheetBtn = document.querySelector('#more-sheet [data-sheet-click="look-open"]');
    if (sheetBtn) sheetBtn.innerHTML = `${icon('einstellungen')}<span>Einstellungen</span>`;
    document.querySelector('#more-sheet .sheet-lang')?.setAttribute('hidden', '');
    // Die Oberflächensprache sitzt jetzt in den Einstellungen, nicht mehr in der Kopfzeile
    document.documentElement.classList.add('has-settings');
  });
})();
