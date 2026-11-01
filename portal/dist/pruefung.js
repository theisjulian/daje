/*
 * Prüfungstraining (Bibliothek): alle CILS-Übungen nach Niveau und Prüfungsteil.
 * Quelle: Pakete mit catalog.tags „cils“, also für alle freigegebene (Grundstock oder vom Admin über daje_overrides
 * freigegeben) und die eigenen der Lehrkraft. Erstellt werden sie im CILS-Generator (cils.js, Ansicht „cils“).
 * Administratoren geben einen CILS-Satz mit „Für alle freigeben“ frei (ovrSave je Übung).
 */
(function () {
  const PT_KEY = 'daje-pruefung-v1';
  const ptState = () => read(PT_KEY, { level: 'B1' });
  const ownIds = () => new Set((typeof editorState !== 'undefined' ? editorState.items : []).map(i => i.payload?.id).filter(Boolean));
  const cilsItems = () => [...contentList('grammar'), ...contentList('listening')].filter(x => x.catalog?.tags?.includes('cils'));
  const typeOf = x => DajeCILS.TYPES.find(t => x.catalog.tags.includes(t.id));

  function ptCard(x, own) {
    const t = typeOf(x);
    const st = lessonStatus(x);
    let name = x.title.replace(/^CILS [^·]+ · [^·]+ · /, '');
    if (t && name.startsWith(t.it)) name = name.slice(t.it.length).replace(/^ · /, '').trim() || t.it;
    return `<button class="pt-card${st.done ? ' is-done' : ''}" data-lesson="${esc(x.id)}"><span class="pt-type">${esc(t ? t.it : 'CILS')}${own ? ' · <i>eigene</i>' : ''}</span><b>${esc(name)}</b><small>${plural(x.questions.length, 'Aufgabe', 'Aufgaben')}${st.done ? ' · erledigt' : ''}</small></button>`;
  }

  function pruefungPage() {
    const st = ptState();
    const all = cilsItems();
    const own = ownIds();
    const teach = isTeacher();
    const count = l => all.filter(x => x.level === l).length;
    const list = all.filter(x => x.level === st.level);
    $('breadcrumb').textContent = 'Prüfungstraining';
    $('main').innerHTML = `<div class="page pt-page">
      <header class="page-head"><div class="eyebrow">CILS · Università per Stranieri di Siena</div><h1>Prüfungstraining</h1><p>Übungen im Format der CILS-Prüfung, nach Niveau und Prüfungsteil: Hören, Lesen, Sprachstrukturen, Schreiben und Sprechen. Alle Texte sind neu geschrieben, keine Originalaufgaben.</p></header>
      <div class="cils-levels pt-levels" role="tablist" aria-label="Niveau">${DajeCILS.LEVELS.map(l => `<button role="tab" aria-selected="${st.level === l}" data-pt-level="${l}"><b>${l}</b><small>${count(l) ? plural(count(l), 'Übung', 'Übungen') : '–'}</small></button>`).join('')}</div>
      ${teach ? `<div class="pt-teach glass"><div><b>Neue Übungen erstellen</b><small>Aufgabentyp wählen, Auftrag an die KI kopieren, Antwort einfügen.</small></div><button class="button primary" data-nav="cils">CILS-Generator</button></div>` : ''}
      ${
        list.length
          ? Object.entries(DajeCILS.PARTS)
              .map(([k, p]) => {
                const xs = list.filter(x => x.catalog.tags.includes(k));
                return xs.length ? `<section class="pt-part"><h2>${esc(p.de)} <small>${esc(p.label)}</small></h2><div class="pt-grid">${xs.map(x => ptCard(x, own.has(x.id))).join('')}</div></section>` : '';
              })
              .join('')
          : `<div class="pt-empty glass"><h2>Auf ${esc(DajeCILS.EXAM[st.level])} gibt es noch keine Übungen.</h2><p class="muted">${teach ? 'Erstelle die ersten mit dem CILS-Generator.' : 'Deine Lehrkraft kann Übungen für dieses Niveau freigeben.'}</p></div>`
      }
    </div>`;
  }
  window.pruefungPage = pruefungPage;

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pt-level],[data-cils-publish]');
    if (!b) return;
    if (b.dataset.ptLevel) {
      save(PT_KEY, { ...ptState(), level: b.dataset.ptLevel });
      return pruefungPage();
    }
    // Administratoren: einen CILS-Satz für alle freigeben
    if (b.dataset.cilsPublish) {
      const set = (read('daje-cils-v1', { sets: [] }).sets || []).find(s => s.id === b.dataset.cilsPublish);
      if (!set || typeof ovrSave !== 'function') return;
      const pkgs = set.ids.map(id => editorState.items.find(i => i.payload?.id === id)?.payload).filter(Boolean);
      if (!pkgs.length) return toast('In diesem Satz ist keine fertige Übung.');
      if (!confirm(`${plural(pkgs.length, 'Übung', 'Übungen')} im Prüfungstraining für alle freigeben?`)) return;
      b.disabled = true;
      Promise.all(pkgs.map(p => ovrSave(p)))
        .then(() => toast('Freigegeben: im Prüfungstraining für alle sichtbar.'))
        .catch(err => toast('Freigabe hat nicht geklappt: ' + err.message))
        .finally(() => (b.disabled = false));
    }
  });

  const baseRender = render;
  render = function () {
    if (!session && view === 'pruefung') return pruefungPage();
    return baseRender.apply(this, arguments);
  };
})();
