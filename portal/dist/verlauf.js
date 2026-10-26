'use strict';
/*
 * Browserverlauf: Zurück-Taste, Wischgeste (iPad/iPhone) und Adresszeile bleiben in der App.
 * Jede Ansicht bekommt einen Eintrag (?seite=…, ?hoeren=…, ?buch=…). Zuletzt geladen,
 * weil nav, openListening und renderSession aus früheren Dateien umhüllt werden.
 */
{
  const PAGES = [
    'start',
    'hoeren',
    'vokabeln',
    'sammlung',
    'verlauf',
    'fortschritt',
    'hilfe',
    'verben',
    'quellen',
    'wortschatz',
    'lernen',
    'redaktion'
  ];
  let restoring = false;

  const snapshot = () => ({
    v: view,
    l: view === 'hoeruebung' ? openedListening : null,
    b: view === 'vokabeln' ? wsBook.get() : null,
    s: !!session
  });
  const same = (a, b) => !!a && a.v === b.v && a.l === b.l && a.b === b.b && a.s === b.s;
  function urlOf(st) {
    const q = new URLSearchParams();
    if (st.l) q.set('hoeren', st.l);
    else if (st.v && st.v !== 'start' && st.v !== 'hoeruebung') q.set('seite', st.v);
    if (st.b) q.set('buch', st.b);
    if (EMBED) q.set('embed', '1');
    const s = q.toString();
    return location.pathname + (s ? '?' + s : '');
  }
  function record() {
    if (restoring) return;
    const st = snapshot();
    if (same(history.state, st)) return;
    history.pushState(st, '', urlOf(st));
  }

  const baseNav = nav;
  nav = function (next) {
    if (next === 'vokabeln' && !restoring) wsBook.set(null);
    const r = baseNav.apply(this, arguments);
    record();
    return r;
  };
  const baseOpen = openListening;
  openListening = function () {
    const r = baseOpen.apply(this, arguments);
    record();
    return r;
  };
  const baseSession = renderSession;
  renderSession = function () {
    const r = baseSession.apply(this, arguments);
    if (session && !(history.state && history.state.s)) record();
    return r;
  };
  // Buch öffnen oder zurück zur Bücherübersicht (Klicks werden in wortschatz.js zuerst verarbeitet).
  document.addEventListener('click', e => {
    if (e.target.closest('[data-ws="open"],[data-ws="home"]')) record();
  });

  window.addEventListener('popstate', e => {
    const st = e.state || { v: 'start' };
    restoring = true;
    try {
      document.querySelectorAll('dialog[open]').forEach(d => d.close());
      if (st.l) openListening(st.l);
      else {
        if (st.v === 'vokabeln') wsBook.set(st.b || null);
        nav(PAGES.includes(st.v) ? st.v : 'start');
      }
    } finally {
      restoring = false;
    }
  });

  // Einstieg: ?seite= und ?buch= öffnen die Ansicht direkt; der erste Eintrag ersetzt den aktuellen.
  const p = new URLSearchParams(location.search);
  const page = p.get('seite');
  if (view === 'start' && PAGES.includes(page)) {
    restoring = true;
    if (page === 'vokabeln' && p.get('buch')) wsBook.set(p.get('buch'));
    nav(page);
    restoring = false;
  }
  history.replaceState(snapshot(), '', location.href);
}
