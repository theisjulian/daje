/*
 * Einstellungen an einem Ort, schlicht mit Pillen: Konto, Sprache, Üben, Darstellung, Ansicht.
 * Nutzt den bisherigen Dialog „look-dialog“ als Hülle; gespeichert wird wie bisher (ecco-look-v1, Oberflächensprache,
 * Lernsprache, Anweisungssprache, Fokus-Modus, Tagesziel im Lernprofil). Keine Daten gehen verloren.
 */
(function () {
  const SKIN_NOTE = {
    daje: 'Verlauf und Neon',
    pop: 'bunt und verspielt',
    glas: 'Liquid Glass, durchscheinend',
    heft: 'liniert, mit Textmarker',
    graphit: 'klar, schwarz-weiß',
    wald: 'ruhiges Grün',
    tag: 'Farben nach Tageszeit'
  };
  const UI_LANGS = [['de', 'Deutsch'], ['it', 'Italiano'], ['en', 'English'], ['fr', 'Français']];
  const pill = (attr, v, label, on, extra = '') => `<button type="button" class="pill" ${attr}="${v}" aria-pressed="${on}">${extra}${label}</button>`;
  const pills = (attr, opts, cur) => `<div class="pills">${opts.map(([v, l, x]) => pill(attr, v, l, String(cur) === String(v), x || '')).join('')}</div>`;
  const row = (label, body, note = '') => `<div class="set-row"><div class="set-label"><b>${label}</b>${note ? `<small>${note}</small>` : ''}</div>${body}</div>`;

  function settingsHTML() {
    const u = typeof ACC !== 'undefined' ? ACC.user : null;
    const md = u?.user_metadata || {};
    const name = [md.first_name, md.last_name].filter(Boolean).join(' ') || (u ? u.email : '');
    const ini = ((md.first_name || u?.email || '?').charAt(0) + (md.last_name || '').charAt(0)).toUpperCase();
    const loc = typeof uiLocale === 'string' ? uiLocale : 'de';
    const base = loc.split('-')[0];
    const simple = /-simple$/.test(loc);
    const goal = (typeof activeProfile === 'function' && activeProfile()?.goal) || 10;
    const skin = prefs.skin;
    return `<section class="set-card set-account">${
      u
        ? `<div class="set-avatar" aria-hidden="true">${esc(ini)}</div><div class="set-who"><b>${esc(name)}</b><small>${esc(u.email)}${typeof ACC !== 'undefined' && ACC.admin ? ' · Administrator' : md.role === 'teach' ? ' · Lehrkraft' : ''}</small></div><button class="pill" data-acc-open>Konto</button>`
        : `<div class="set-avatar is-guest" aria-hidden="true">${icon('account')}</div><div class="set-who"><b>Ohne Konto</b><small>Lernstand bleibt auf diesem Gerät</small></div><button class="pill is-strong" data-acc-open>Anmelden</button>`
    }</section>
      <h3 class="set-h">Sprache</h3>
      <section class="set-card">
        ${row('Oberfläche', pills('data-set-ui', UI_LANGS, base))}
        ${base !== 'de' ? row('Einfache Sprache', pills('data-set-simple', [['0', 'aus'], ['1', 'an']], simple ? '1' : '0')) : ''}
        ${Object.keys(LERN_NAMES).length > 1 ? row('Ich lerne', pills('data-set-lern', Object.entries(LERN_NAMES), lernSprache())) : ''}
        ${row('Arbeitsanweisungen', pills('data-set-instr', [['target', 'Zielsprache'], ['de', 'Deutsch']], instrPref))}
      </section>
      <h3 class="set-h">Üben</h3>
      <section class="set-card">
        ${row('Aufgaben', pills('data-set-focus', [['1', 'einzeln'], ['0', 'alle']], focusMode() ? '1' : '0'), 'eine nach der anderen oder alle auf einmal')}
        ${row('Tagesziel', pills('data-set-goal', [['5', '5'], ['10', '10'], ['20', '20']], goal), 'Übungen bzw. Wörter pro Tag')}
        ${row('Ansicht', pills('data-audience', [['learn', 'Lernende'], ['teach', 'Lehrkräfte']], isTeacher() ? 'teach' : 'learn'))}
      </section>
      <h3 class="set-h">Darstellung</h3>
      <section class="set-card">
        <div class="set-skins">${themeList.map(([k, n, bg, ac]) => `<button type="button" class="skin-pill" data-skin="${k}" aria-pressed="${skin === k}"><i style="--sb:${bg};--sa:${ac}"></i><span><b>${esc(n)}</b><small>${SKIN_NOTE[k] || ''}</small></span></button>`).join('')}</div>
        ${skin === 'tag' ? row('Tageszeit', pills('data-set-phase', [['auto', 'automatisch'], ['morgen', 'Morgen'], ['mittag', 'Mittag'], ['abend', 'Abend'], ['nacht', 'Nacht']], prefs.phase)) : row('Helligkeit', pills('data-set-appearance', [['system', 'automatisch'], ['light', 'hell'], ['dark', 'dunkel']], prefs.appearance))}
        ${row('Schrift', pills('data-font', fontList.map(([k, n]) => [k, n.split(' · ')[0]]), document.documentElement.dataset.font || 'standard'))}
      </section>`;
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
      const close = d.querySelector('.dialog-head [data-close]');
      if (close) (close.className = 'set-x'), (close.innerHTML = '×'), close.setAttribute('aria-label', 'Schließen');
    }
    const y = box.scrollTop;
    box.innerHTML = settingsHTML();
    box.scrollTop = y;
    d.classList.add('settings-dialog');
    if (!d.open) d.showModal();
  }
  window.openSettings = open;
  const look = () => (applyLook(), save('ecco-look-v1', prefs));

  document.addEventListener(
    'click',
    e => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.id === 'look-open' || b.dataset.settingsOpen !== undefined) {
        e.stopImmediatePropagation();
        return open();
      }
      if (!b.closest('#look-dialog')) return;
      const reopen = () => setTimeout(open, 0);
      if (b.dataset.setUi || b.dataset.setSimple) {
        const cur = typeof uiLocale === 'string' ? uiLocale : 'de';
        const baseL = b.dataset.setUi || cur.split('-')[0];
        const simple = b.dataset.setSimple ? b.dataset.setSimple === '1' : /-simple$/.test(cur);
        const sel = $('ui-language');
        if (sel) {
          sel.value = simple && baseL !== 'de' ? baseL + '-simple' : baseL;
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
        return reopen();
      }
      if (b.dataset.setLern) {
        setLernSprache(b.dataset.setLern);
        portalFilters.language = b.dataset.setLern;
        render();
        return reopen();
      }
      if (b.dataset.setInstr) {
        setInstrPref(b.dataset.setInstr);
        if ($('listening-form')) renderListening();
        return reopen();
      }
      if (b.dataset.setFocus) {
        setFocusMode(b.dataset.setFocus === '1');
        if ($('listening-form')) renderListening();
        return reopen();
      }
      if (b.dataset.setGoal) {
        activeProfile().goal = Number(b.dataset.setGoal);
        persistProfiles();
        render();
        return reopen();
      }
      if (b.dataset.setAppearance) {
        prefs.appearance = b.dataset.setAppearance;
        look();
        return reopen();
      }
      if (b.dataset.setPhase) {
        prefs.phase = b.dataset.setPhase;
        look();
        return reopen();
      }
      // Farbwelt, Schrift, Ansicht: vorhandene Handler arbeiten lassen, danach neu aufbauen
      if (b.dataset.skin || b.dataset.font || b.dataset.audience) return reopen();
      if (b.dataset.accOpen !== undefined) $('look-dialog').close();
    },
    true
  );

  addEventListener('DOMContentLoaded', () => {
    const btn = $('look-open');
    if (btn) {
      btn.title = 'Einstellungen';
      btn.setAttribute('aria-label', 'Einstellungen');
      btn.innerHTML = `${icon('einstellungen')}<span class="btn-text">Einstellungen</span>`;
    }
    const sheetBtn = document.querySelector('#more-sheet [data-sheet-click="look-open"]');
    if (sheetBtn) sheetBtn.innerHTML = `${icon('einstellungen')}<span>Einstellungen</span>`;
    document.querySelector('#more-sheet .sheet-lang')?.setAttribute('hidden', '');
    document.documentElement.classList.add('has-settings');
  });
})();
