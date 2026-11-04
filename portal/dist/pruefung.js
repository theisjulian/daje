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

  /*
   * Übungsprüfung (Simulazione): je Prova des Hefts eine Übung, in der Reihenfolge des Hefts.
   * Gespeichert unter „daje-esami-v1“ (mit dem Konto abgeglichen), sichtbar für die Lehrkraft.
   */
  const ES_KEY = 'daje-esami-v1';
  const esState = () => {
    const d = read(ES_KEY, null);
    return d && Array.isArray(d.esami) ? d : { esami: [] };
  };
  let ptBuild = null; // { level, title, pick: { slotKey: id } }
  const PART_ORDER = Object.keys(DajeCILS.PARTS);
  // Alle Prove eines Niveaus wie im Heft; „1 o 2“ ergibt zwei Prove desselben Typs
  function slotsFor(level) {
    const out = [];
    DajeCILS.typesFor(level).forEach(t => {
      const nums = String(t.cfg[level].prova).match(/\d/g) || ['1'];
      [...new Set(nums)].forEach(n => out.push({ key: t.id + ':' + n, type: t, part: t.part, prova: Number(n) }));
    });
    return out.sort((a, b) => PART_ORDER.indexOf(a.part) - PART_ORDER.indexOf(b.part) || a.prova - b.prova);
  }
  const itemsFor = (level, t) => cilsItems().filter(x => x.level === level && x.catalog.tags.includes(t.id));
  const shortName = x => x.title.replace(/^CILS [^·]+ · /, '');
  function buildDefaults(level) {
    const used = new Set();
    const pick = {};
    slotsFor(level).forEach(sl => {
      const x = itemsFor(level, sl.type).find(y => !used.has(y.id));
      if (x) {
        pick[sl.key] = x.id;
        used.add(x.id);
      }
    });
    return { level, title: 'Simulazione ' + DajeCILS.EXAM[level], pick };
  }
  function buildHTML() {
    const b = ptBuild;
    const slots = slotsFor(b.level);
    const filled = slots.filter(sl => b.pick[sl.key]).length;
    let part = '';
    const rows = slots
      .map(sl => {
        const xs = itemsFor(b.level, sl.type);
        const head = sl.part !== part ? `<h3>${esc(DajeCILS.PARTS[sl.part].de)} <small>${esc(DajeCILS.PARTS[sl.part].label)}</small></h3>` : '';
        part = sl.part;
        return `${head}<div class="pt-slot${b.pick[sl.key] ? '' : ' is-empty'}"><span class="pt-slot-n">Prova ${sl.prova}</span><span class="pt-slot-t">${esc(sl.type.it)}</span>${
          xs.length
            ? `<select data-pt-pick="${sl.key}" aria-label="Übung für ${esc(sl.type.it)}, Prova ${sl.prova}"><option value="">– leer lassen –</option>${xs.map(x => `<option value="${esc(x.id)}" ${b.pick[sl.key] === x.id ? 'selected' : ''}>${esc(shortName(x))}</option>`).join('')}</select>`
            : `<button class="quiet" data-pt-create="${sl.type.id}">Noch keine Übung · im Generator erstellen</button>`
        }</div>`;
      })
      .join('');
    return `<section class="pt-builder glass"><div class="pt-builder-head"><div><h2>Übungsprüfung zusammenstellen</h2><p class="muted">${esc(DajeCILS.EXAM[b.level])}: je Prova eine Übung, in der Reihenfolge des Prüfungshefts. ${filled} von ${slots.length} Prove belegt.</p></div><button class="quiet" data-pt-build-close>Abbrechen</button></div>
      <label class="field">Titel<input data-pt-title value="${esc(b.title)}" maxlength="80"></label>
      <div class="pt-slots">${rows}</div>
      <div class="studio-actions"><button class="button primary" data-pt-build-save ${filled ? '' : 'disabled'}>Prüfung speichern</button></div></section>`;
  }
  function esamiHTML(level) {
    const list = esState().esami.filter(e => e.level === level);
    if (!list.length) return '';
    const total = slotsFor(level).length;
    return `<section class="pt-part"><h2>Deine Übungsprüfungen <small>Simulazioni</small></h2><div class="pt-esami">${list
      .map(e => {
        const live = e.ids.filter(id => findTask(id));
        return `<article class="pt-esame glass"><div><b>${esc(e.title)}</b><small>${esc(DajeCILS.EXAM[e.level])} · ${live.length} von ${total} Prove · ${new Date(e.created).toLocaleDateString('de-DE', { dateStyle: 'medium' })}</small></div><div class="pt-esame-act"><button class="button primary" data-es-print="${e.id}">Drucken</button><button class="button secondary" data-es-klasse="${e.id}">Klassensitzung</button><button class="quiet danger" data-es-del="${e.id}">Löschen</button></div></article>`;
      })
      .join('')}</div></section>`;
  }

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
      ${teach ? `<div class="pt-teach glass"><div><b>Übungen erstellen und zu Prüfungen bündeln</b><small>Im Generator einzelne Prove erstellen, hier daraus eine ganze Übungsprüfung im Aufbau des Hefts zusammenstellen.</small></div><div class="pt-teach-act"><button class="button primary" data-nav="cils">CILS-Generator</button><button class="button secondary" data-pt-build>Prüfung zusammenstellen</button></div></div>` : ''}
      ${teach && ptBuild && ptBuild.level === st.level ? buildHTML() : ''}
      ${teach ? esamiHTML(st.level) : ''}
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
    const b = e.target.closest('[data-pt-level],[data-cils-publish],[data-pt-back],[data-pt-build],[data-pt-build-close],[data-pt-build-save],[data-pt-create],[data-es-print],[data-es-klasse],[data-es-del]');
    if (!b) return;
    if (b.dataset.ptBack) {
      save(PT_KEY, { ...ptState(), level: b.dataset.ptBack });
      return nav('pruefung');
    }
    if (b.hasAttribute('data-pt-build')) {
      ptBuild = buildDefaults(ptState().level);
      return pruefungPage();
    }
    if (b.hasAttribute('data-pt-build-close')) {
      ptBuild = null;
      return pruefungPage();
    }
    if (b.dataset.ptCreate) {
      if (window.cilsSetForm) window.cilsSetForm(ptState().level, b.dataset.ptCreate);
      return nav('cils');
    }
    if (b.hasAttribute('data-pt-build-save')) {
      const ids = slotsFor(ptBuild.level).map(sl => ptBuild.pick[sl.key]).filter(Boolean);
      if (!ids.length) return;
      const d = esState();
      d.esami.unshift({ id: 'esame-' + Date.now().toString(36), level: ptBuild.level, title: ptBuild.title.trim() || 'Simulazione ' + DajeCILS.EXAM[ptBuild.level], ids, created: new Date().toISOString() });
      save(ES_KEY, d);
      ptBuild = null;
      toast('Übungsprüfung gespeichert.');
      return pruefungPage();
    }
    const es = id => esState().esami.find(x => x.id === id);
    if (b.dataset.esPrint) {
      const x = es(b.dataset.esPrint);
      return x && window.cilsPrint && window.cilsPrint(x, 0);
    }
    if (b.dataset.esKlasse) {
      const x = es(b.dataset.esKlasse);
      return x && typeof klLinkDialog === 'function' && klLinkDialog(x.ids.filter(id => findTask(id)), x.title);
    }
    if (b.dataset.esDel) {
      if (!confirm('Diese Übungsprüfung löschen? Die einzelnen Übungen bleiben erhalten.')) return;
      const d = esState();
      d.esami = d.esami.filter(x => x.id !== b.dataset.esDel);
      save(ES_KEY, d);
      return pruefungPage();
    }
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

  document.addEventListener('change', e => {
    const k = e.target.dataset?.ptPick;
    if (!k || !ptBuild) return;
    ptBuild.pick[k] = e.target.value;
    pruefungPage();
  });
  document.addEventListener('input', e => {
    if (e.target.hasAttribute && e.target.hasAttribute('data-pt-title') && ptBuild) ptBuild.title = e.target.value;
  });
  const baseRender = render;
  render = function () {
    if (!session && view === 'pruefung') return pruefungPage();
    return baseRender.apply(this, arguments);
  };
})();
