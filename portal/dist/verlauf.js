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
    a: view === 'aufgabe' && hwCurrent ? hwCurrent.code : null,
    s: !!session
  });
  const same = (a, b) =>
    !!a && a.v === b.v && a.l === b.l && a.b === b.b && a.a === b.a && a.s === b.s;
  function urlOf(st) {
    const q = new URLSearchParams();
    if (st.a) q.set('aufgabe', st.a);
    else if (st.l) q.set('hoeren', st.l);
    else if (st.v && !['start', 'hoeruebung', 'aufgabe'].includes(st.v)) q.set('seite', st.v);
    if (st.b) q.set('buch', st.b);
    if (EMBED) q.set('embed', '1');
    const s = q.toString();
    return location.pathname + (s ? '?' + s : '');
  }
  function record() {
    if (restoring) return;
    const st = snapshot();
    if (same(history.state, st) && !history.state.d) return;
    // Ein offener Dialog-Eintrag wird ersetzt, damit Zurück nicht zweimal dieselbe Seite zeigt.
    if (history.state && history.state.d) history.replaceState(st, '', urlOf(st));
    else history.pushState(st, '', urlOf(st));
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

  // Dialoge und Blätter: Öffnen legt einen Eintrag an, Zurück schließt nur den Dialog.
  let dialogBack = false,
    closingByHistory = false;
  const openDialogs = () => document.querySelectorAll('dialog[open]');
  new MutationObserver(list => {
    for (const m of list) {
      if (m.target.tagName !== 'DIALOG') continue;
      if (m.target.open) {
        if (!(history.state && history.state.d))
          history.pushState({ ...snapshot(), d: true }, '', location.href);
      } else if (!closingByHistory) {
        // Per Knopf geschlossen: den Dialog-Eintrag wieder entfernen, falls kein anderer Dialog offen ist.
        setTimeout(() => {
          if (!openDialogs().length && history.state && history.state.d) {
            dialogBack = true;
            history.back();
          }
        }, 0);
      }
    }
  }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });

  window.addEventListener('popstate', e => {
    if (dialogBack) {
      dialogBack = false;
      return;
    }
    const st = e.state || { v: 'start' };
    if (openDialogs().length) {
      closingByHistory = true;
      openDialogs().forEach(d => d.close());
      setTimeout(() => (closingByHistory = false), 0);
      if (same(st, snapshot())) return;
    }
    restoring = true;
    try {
      if (st.a) hwShow(st.a);
      else if (st.l) openListening(st.l);
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
