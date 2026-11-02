/*
 * Anmeldepflicht: Die Inhalte von daje sind nur für angemeldete Nutzerinnen und Nutzer.
 * Ohne Konto erreichbar bleiben:
 *  - Klassensitzung über den Klassenlink (?klasse=…) mit genau den freigegebenen Übungen, ohne Registrierung,
 *  - Aufgabenlinks einer Lehrkraft (#aufgaben=…),
 *  - eine kleine Probierstrecke (drei Übungen), Quellen und Impressum.
 * Hinweis: Die Sperre wirkt in der Oberfläche. Die Übungsdateien selbst werden weiterhin statisch ausgeliefert;
 * echter Schutz verlangt, die Inhalte aus der Datenbank zu laden (siehe UEBERGABE-OPUS.md, 6z).
 * Wird als letztes Skript geladen und umschließt render() und openListening().
 */
(function () {
  const SAMPLES = ['g-ecco1-articolo-indeterminativo-l2', 'g-daje-202-005', 'eigen-roma-monumenti-e-luoghi-fa-4c9x'];
  const GUEST_VIEWS = new Set(['klasse', 'aufgabe', 'quellen', 'impressum', 'datenschutz']);
  // Eine gespeicherte Supabase-Sitzung zählt sofort als angemeldet (kein Aufblitzen der Willkommensseite beim Laden).
  const storedSession = () => {
    try {
      return Object.keys(localStorage).some(k => (k === 'daje-auth-v1' || /^sb-[a-z0-9]+-auth-token$/.test(k)) && localStorage.getItem(k));
    } catch {
      return false;
    }
  };
  const signedIn = () => !!(window.DAJE_E2E || (typeof ACC !== 'undefined' && ACC.user) || storedSession());
  const assignedIds = () => {
    const ids = new Set(SAMPLES);
    if (typeof klCur !== 'undefined' && klCur) (klCur.items || []).forEach(k => ids.add(String(k).slice(2)));
    if (typeof hwCurrent !== 'undefined' && hwCurrent)
      (hwCurrent.i || []).forEach(r => {
        const x = typeof hwResolve === 'function' ? hwResolve(r) : null;
        if (x?.x?.id) ids.add(x.x.id);
      });
    return ids;
  };
  const guestAllowed = () => {
    if (signedIn()) return true;
    if (GUEST_VIEWS.has(view)) return true;
    if (view === 'hoeruebung' && assignedIds().has(openedListening)) return true;
    // Wortschatz-Runde aus einer Klassensitzung oder einem Aufgabenlink
    if (session && ((typeof klCur !== 'undefined' && klCur) || (typeof hwCurrent !== 'undefined' && hwCurrent))) return true;
    return false;
  };
  window.dajeSignedIn = signedIn;

  function sampleCard(id) {
    const x = findTask(id);
    if (!x) return '';
    const kind = x.kind === 'grammar' ? 'Grammatik' : 'Hörverstehen';
    return `<button class="gate-sample" data-lesson="${esc(id)}"><span class="gate-kind">${kind} · ${esc(x.level)}</span><b>${esc(x.title)}</b><small>${esc(x.grammar?.topicTitle || x.description || '')}</small></button>`;
  }

  function gatePage() {
    view = 'gate';
    session = null;
    document.documentElement.classList.add('is-gated');
    $('breadcrumb').textContent = 'Willkommen';
    $('main').innerHTML = `<div class="page gate">
      <section class="gate-hero">
        <div class="eyebrow">Italienisch lernen und unterrichten</div>
        <h1>Willkommen bei daje.</h1>
        <p>Grammatik, Wortschatz, Verben, Hörverstehen und CILS-Prüfungstraining, geordnet nach Lernjahr und Lehrplan. Mit einem kostenlosen Konto hast du alles und übst auf allen Geräten weiter.</p>
        <div class="gate-act"><button class="button primary large" data-gate="register">Konto erstellen</button><button class="button secondary large" data-gate="login">Anmelden</button></div>
      </section>
      <section class="gate-card glass">
        <h2>Mit der Klasse dabei?</h2>
        <p class="muted">Deine Lehrkraft hat dir einen Link oder Code gegeben? Dafür brauchst du kein Konto.</p>
        <form class="gate-code" id="gate-code" novalidate><label class="field">Klassencode<input id="gate-code-in" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="z. B. ab3k9x" maxlength="40"></label><button class="button primary" type="submit">Beitreten</button></form>
        <p class="small" id="gate-msg" role="status"></p>
      </section>
      <section class="gate-try">
        <h2>Erst mal ausprobieren</h2>
        <div class="gate-samples">${SAMPLES.map(sampleCard).join('')}</div>
      </section>
      <p class="small muted gate-foot"><button class="quiet" data-nav="quellen">Quellen und Hinweise</button></p>
    </div>`;
  }

  const baseRender = render;
  render = function () {
    if (view === 'gate') {
      if (!signedIn()) return gatePage();
      view = 'start';
    }
    if (!guestAllowed()) {
      // Ohne Konto in einer Klassensitzung: zurück zur Aufgabenliste statt zur Willkommensseite
      if (typeof klCur !== 'undefined' && klCur) {
        view = 'klasse';
        return klPage();
      }
      return gatePage();
    }
    document.documentElement.classList.toggle('is-gated', !signedIn());
    return baseRender.apply(this, arguments);
  };
  const baseOpen = openListening;
  openListening = function (id) {
    if (!signedIn() && !assignedIds().has(id)) {
      gatePage();
      return toast('Diese Übung gibt es mit einem kostenlosen Konto.');
    }
    document.documentElement.classList.toggle('is-gated', !signedIn());
    return baseOpen.apply(this, arguments);
  };

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-gate]');
    if (!b) return;
    if (typeof accMode !== 'undefined') accMode = b.dataset.gate === 'register' ? 'register' : 'login';
    showTheisAccountSb();
  });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'gate-code') return;
    e.preventDefault();
    const raw = $('gate-code-in').value.trim();
    const code = (raw.match(/[?&]klasse=([a-z0-9]+)/i) || [, raw])[1].toLowerCase().replace(/[^a-z0-9]/g, '');
    if (!code) return ($('gate-msg').textContent = 'Bitte den Code deiner Lehrkraft eingeben.');
    document.documentElement.classList.remove('is-gated');
    klOpen(code);
  });

  // An- und Abmelden: Seite passend neu aufbauen
  const refresh = () =>
    setTimeout(() => {
      if (view === 'gate' && signedIn()) nav('start');
      else if (!guestAllowed()) render();
    }, 0);
  if (typeof sb !== 'undefined' && sb) sb.auth.onAuthStateChange(() => refresh());
  addEventListener('DOMContentLoaded', () => {
    if (!guestAllowed()) render();
  });
})();
