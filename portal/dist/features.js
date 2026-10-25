'use strict';
function recommendationHTML() {
  const due = allTrainingWords().filter(w => records[w.id]?.due <= nowDate()).length,
    p = activeProfile(),
    done = p.history[nowDate()]?.ids.length || 0;
  return `<section class="recommendation glass"><div class="recommend-symbol" aria-hidden="true">↻</div><div><div class="eyebrow">Heute</div><h2>${due ? `${due} Wörter warten auf ein Wiedersehen.` : 'Eine kleine Runde passt immer.'}</h2><p>${done} von ${p.goal || 10} Wörtern heute geübt</p></div><button class="button primary" data-extra="recommend">${due ? 'Wiederholen' : 'Für heute üben'}</button></section>`;
}
function startRecommended() {
  const due = allTrainingWords().filter(
    w => w.language === config.language && records[w.id]?.due <= nowDate()
  );
  if (due.length) return start(due, 'cards');
  const base = pool(),
    started = new Set(allTrainingWords().filter(w => records[w.id] && w.label).map(w => w.label)),
    extra = allTrainingWords().filter(w => w.language === config.language && w.label && started.has(w.label) && !base.some(b => b.id === w.id)),
    selected = [...base, ...extra],
    fresh = shuffle(selected.filter(w => !records[w.id])),
    known = shuffle(selected.filter(w => records[w.id]));
  start([...fresh, ...known].slice(0, config.count), 'cards');
}
function chapterProgressHTML() {
  return `<section class="chapter-progress glass"><div class="section-head"><div><div class="eyebrow">DEIN WORTSCHATZ WÄCHST</div><h2>Abschnitt für Abschnitt.</h2></div></div><p class="small muted">Geübte Einträge im aktuellen Lernprofil. Ein voller Balken bedeutet: alle einmal bearbeitet.</p><div class="chapter-progress-grid">${GROUPS.map(
    g => {
      const all = WORDS.filter(w => w.group === g[0]),
        seen = all.filter(w => records[w.id]).length,
        due = all.filter(w => records[w.id]?.due <= nowDate()).length;
      return `<article><div class="chapter-progress-label"><b>${esc(g[2])}</b><span>${seen} / ${all.length}</span></div><div class="progress-track" role="progressbar" aria-label="${esc(g[2])}: geübte Einträge" aria-valuemin="0" aria-valuemax="${all.length}" aria-valuenow="${seen}"><div class="progress-fill" style="width:${all.length ? (seen / all.length) * 100 : 0}%"></div></div><small>${due ? `${due} jetzt wiederholen` : 'Keine Wiederholung fällig'}</small></article>`;
    }
  ).join('')}</div></section>`;
}
function roundReviewHTML(s) {
  if (!s.missed.length) return '';
  return `<details class="round-review"><summary>${s.missed.length === 1 ? 'Diesen Eintrag' : `Diese ${s.missed.length} Einträge`} noch einmal ansehen</summary><div>${s.missed.map(w => `<div><b lang="${w.language}">${esc(w.target)}</b><span>${esc(w.translations.join(' / '))}</span></div>`).join('')}</div></details>`;
}
function matchingPool(words) {
  const targets = new Set(),
    meanings = new Set();
  return words.filter(w => {
    const t = normalize(w.target),
      m = normalize(w.translations[0]);
    if (targets.has(t) || meanings.has(m)) return false;
    targets.add(t);
    meanings.add(m);
    return true;
  });
}
function startMatching(words) {
  const selected = shuffle(matchingPool(words)).slice(0, config.count);
  if (!selected.length) {
    toast('Für diese Auswahl gibt es keine passenden Paare.');
    return;
  }
  session = { words: selected, index: 0, mode: 'match', good: 0, missed: [], match: null };
  nextMatchBatch();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function nextMatchBatch() {
  const s = session;
  if (!s || s.mode !== 'match') return;
  if (s.match) s.index += s.match.words.length;
  if (s.index >= s.words.length) return finish();
  const words = s.words.slice(s.index, s.index + 5);
  s.match = {
    words,
    left: shuffle(words),
    right: shuffle(words),
    selectedLeft: null,
    selectedRight: null,
    solved: [],
    failed: [],
    feedback: 'Wähle links ein Wort und rechts seine Bedeutung.'
  };
  renderMatching();
}
function chooseMatch(side, id) {
  const s = session,
    m = s?.match;
  if (!m || m.solved.includes(id) || !m.words.some(w => w.id === id)) return;
  m[side === 'left' ? 'selectedLeft' : 'selectedRight'] = id;
  if (m.selectedLeft && m.selectedRight) {
    const l = m.selectedLeft,
      r = m.selectedRight,
      w = m.words.find(w => w.id === l);
    if (l === r) {
      m.solved.push(l);
      if (!m.failed.includes(l)) s.good++;
      m.feedback = 'Passt zusammen. Gut verbunden!';
    } else {
      if (!m.failed.includes(l)) {
        m.failed.push(l);
        s.missed.push(w);
      }
      m.feedback = 'Diese beiden passen noch nicht. Wähle ein neues Paar.';
    }
    m.selectedLeft = null;
    m.selectedRight = null;
  }
  renderMatching();
}
function renderMatching() {
  const s = session,
    m = s.match;
  if (!m) return;
  const complete = m.solved.length === m.words.length;
  const cell = (w, side) => {
    const solved = m.solved.includes(w.id),
      selected = m[side === 'left' ? 'selectedLeft' : 'selectedRight'] === w.id;
    return `<button class="match-tile ${solved ? 'solved' : ''}" data-match-side="${side}" data-match-id="${w.id}" aria-pressed="${selected}" ${solved ? 'disabled' : ''} ${side === 'left' ? `lang="${w.language}"` : ''}>${esc(side === 'left' ? w.target : w.translations[0])}${solved ? '<span aria-hidden="true">✓</span>' : ''}</button>`;
  };
  $('breadcrumb').textContent = 'Zuordnen · Wörter verbinden';
  $('main').innerHTML =
    `<div class="session-header"><div><div class="eyebrow">WÖRTER VERBINDEN</div><h2>Was gehört zusammen?</h2><p>${s.index + m.solved.length} von ${s.words.length} Paaren verbunden</p></div><button class="button secondary" data-action="end">Runde beenden</button></div><div class="progress-track" role="progressbar" aria-label="Verbundene Paare" aria-valuemin="0" aria-valuemax="${s.words.length}" aria-valuenow="${s.index + m.solved.length}"><div class="progress-fill" style="width:${((s.index + m.solved.length) / s.words.length) * 100}%"></div></div><section class="matching-panel glass"><div class="matching-head"><span>${portalLang(config.language)}</span><span>Deutsch</span></div><div class="matching-grid"><div>${m.left.map(w => cell(w, 'left')).join('')}</div><div>${m.right.map(w => cell(w, 'right')).join('')}</div></div><p class="match-feedback" role="status">${complete ? 'Alle Paare gefunden. Pronto!' : esc(m.feedback)}</p>${complete ? '<button class="button primary large" data-extra="match-next">Weiter</button>' : ''}<p class="small muted">Zum Einstieg: Hier erkennst du Wörter wieder. Dieser Modus verändert deine Wiederholungsstufen und dein Tagesziel nicht. Übe danach ohne Auswahl mit Karten oder Schreiben.</p></section>`;
}
let profileState = null,
  tipFilter = 'Alle';
function newProfileId() {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'p-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}
function activeProfile() {
  return (
    profileState.profiles.find(p => p.id === profileState.activeId) || profileState.profiles[0]
  );
}
function persistProfiles() {
  activeProfile().records = records;
  return save('sprachtrainer-profiles-v2', profileState);
}
function initProfiles() {
  const previous = read('sprachtrainer-profiles-v2', null);
  if (
    previous &&
    previous.version === 2 &&
    Array.isArray(previous.profiles) &&
    previous.profiles.length &&
    previous.profiles.every(
      p => p && typeof p.id === 'string' && typeof p.name === 'string' && p.records && p.history
    )
  ) {
    profileState = previous;
  } else {
    const id = newProfileId();
    profileState = {
      version: 2,
      activeId: id,
      profiles: [
        {
          id,
          name: 'Mein Lernprofil',
          createdAt: new Date().toISOString(),
          records: records && typeof records === 'object' && !Array.isArray(records) ? records : {},
          history: {},
          goal: 10
        }
      ]
    };
  }
  records = activeProfile().records;
  persistProfiles();
}
function profileName() {
  return activeProfile().name;
}
function addActivity(w, good, method) {
  const p = activeProfile(),
    date = nowDate();
  const h = p.history[date] || { attempts: 0, correct: 0, self: 0, checked: 0, ids: [] };
  h.attempts++;
  if (good) h.correct++;
  h[method === 'self' ? 'self' : 'checked']++;
  if (!h.ids.includes(w.id)) h.ids.push(w.id);
  p.history[date] = h;
  persistProfiles();
}
function exportProgress() {
  const p = activeProfile(),
    payload = {
      app: 'sprachtrainer',
      schemaVersion: 2,
      exportedAt: new Date().toISOString(),
      profile: {
        name: p.name,
        createdAt: p.createdAt,
        goal: p.goal,
        records: p.records,
        history: p.history,
        portal: p.portal || null
      }
    };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }),
    url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = 'ripassa-lernstand-' + nowDate() + '.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Sicherungsdatei erstellt. Bewahre sie an einem sicheren Ort auf.');
}
function validateLegacyProgressBackup(data) {
  if (!data || data.app !== 'sprachtrainer' || data.schemaVersion !== 2 || !data.profile)
    throw new Error('Diese Datei ist keine unterstützte Sprachtrainer-Sicherung.');
  const p = data.profile;
  if (
    typeof p.name !== 'string' ||
    !p.name.trim() ||
    p.name.length > 40 ||
    !p.records ||
    Array.isArray(p.records) ||
    typeof p.records !== 'object' ||
    !p.history ||
    Array.isArray(p.history) ||
    typeof p.history !== 'object'
  )
    throw new Error('Das Lernprofil ist unvollständig.');
  const dateOk = d =>
    typeof d === 'string' &&
    /^20\d{2}-\d{2}-\d{2}$/.test(d) &&
    !isNaN(Date.parse(d)) &&
    new Date(d).toISOString().slice(0, 10) === d;
  const safeRecords = Object.create(null),
    entries = Object.entries(p.records);
  if (entries.length > 10000) throw new Error('Die Sicherung enthält zu viele Einträge.');
  for (const [id, r] of entries) {
    if (
      !/^[a-z0-9][a-z0-9-]{0,100}$/.test(id) ||
      !r ||
      !Number.isInteger(r.step) ||
      r.step < 0 ||
      r.step > 4 ||
      typeof r.difficult !== 'boolean' ||
      !dateOk(r.due) ||
      !dateOk(r.lastDay) ||
      !['self', 'checked', 'assisted'].includes(r.method) ||
      !Number.isInteger(r.attempts) ||
      r.attempts < 1 ||
      r.attempts > 1000000
    )
      throw new Error('Ein gespeicherter Lernstand ist ungültig.');
    safeRecords[id] = {
      step: r.step,
      difficult: r.difficult,
      due: r.due,
      lastDay: r.lastDay,
      method: r.method,
      attempts: r.attempts
    };
  }
  const safeHistory = Object.create(null),
    days = Object.entries(p.history);
  if (days.length > 10000) throw new Error('Die Sicherung enthält zu viele Lerntage.');
  for (const [date, h] of days) {
    if (
      !dateOk(date) ||
      !h ||
      !['attempts', 'correct', 'self', 'checked'].every(
        k => Number.isInteger(h[k]) && h[k] >= 0 && h[k] <= 1000000
      ) ||
      h.correct > h.attempts ||
      h.self + h.checked !== h.attempts ||
      !Array.isArray(h.ids) ||
      h.ids.length > 10000 ||
      h.ids.some(id => typeof id !== 'string' || !Object.hasOwn(safeRecords, id))
    )
      throw new Error('Die Lerngeschichte ist ungültig.');
    safeHistory[date] = {
      attempts: h.attempts,
      correct: h.correct,
      self: h.self,
      checked: h.checked,
      ids: [...new Set(h.ids)]
    };
  }
  return {
    id: newProfileId(),
    name: p.name.trim(),
    createdAt:
      typeof p.createdAt === 'string' && !isNaN(Date.parse(p.createdAt))
        ? p.createdAt
        : new Date().toISOString(),
    goal: [5, 10, 20].includes(p.goal) ? p.goal : 10,
    records: safeRecords,
    history: safeHistory
  };
}
async function importProgress(file) {
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast('Die Datei ist zu groß. Maximal 2 MB.');
    return;
  }
  try {
    const p = validateProgressBackup(JSON.parse(await file.text()));
    if (profileState.profiles.length >= 30)
      throw new Error('Auf diesem Gerät sind bereits 30 Profile vorhanden.');
    p.name = p.name + ' · importiert';
    profileState.profiles.push(p);
    profileState.activeId = p.id;
    records = p.records;
    persistProfiles();
    $('profiles-dialog').close();
    nav('fortschritt');
    toast('Sicherung als eigenes Profil importiert. Bestehende Profile bleiben erhalten.');
  } catch (e) {
    toast(e instanceof SyntaxError ? 'Die Datei enthält kein gültiges JSON.' : e.message);
  }
}
function showProfiles() {
  const p = activeProfile();
  $('profiles-body').innerHTML =
    `<p class="muted small">Ein Lernprofil ist lokal auf diesem Gerät. Es ist kein Online-Konto und hat kein Passwort. Auf gemeinsam genutzten Geräten können andere die Profile öffnen.</p><div class="local-profiles">${profileState.profiles.map(x => `<button class="profile-row ${x.id === p.id ? 'chosen' : ''}" data-profile="${x.id}" aria-pressed="${x.id === p.id}"><span><b>${esc(x.name)}</b><small>${Object.keys(x.records).length} Einträge geübt</small></span><span>${x.id === p.id ? 'Aktiv' : 'Öffnen'}</span></button>`).join('')}</div><form id="profile-create" class="profile-create"><label class="field">Neues Profil · ein Kürzel genügt<input id="new-profile-name" maxlength="30" required placeholder="Zum Beispiel: Lernen zu Hause"></label><button class="button primary" type="submit">Anlegen</button></form><div class="backup-actions"><button class="button secondary" data-extra="export">Aktuelles Profil sichern</button><button class="button secondary" data-extra="import">Sicherungsdatei öffnen</button></div><p class="small muted">Auf einem anderen Gerät: gleiche App öffnen, Sicherungsdatei importieren. Keine automatische Synchronisierung.</p>`;
  $('profiles-dialog').showModal();
}
function progressV2() {
  const p = activeProfile(),
    items = Object.values(records),
    today = p.history[nowDate()] || { attempts: 0, correct: 0, ids: [] },
    goal = p.goal || 10,
    percent = Math.min(100, (today.ids.length / goal) * 100),
    due = allTrainingWords().filter(w => records[w.id]?.due <= nowDate()),
    hard = allTrainingWords().filter(w => records[w.id]?.difficult),
    days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        label: d.toLocaleDateString('de-DE', { weekday: 'short' }),
        date: key,
        count: p.history[key]?.attempts || 0
      };
    }),
    max = Math.max(1, ...days.map(d => d.count));
  $('main').innerHTML =
    `<div class="page-title"><div class="eyebrow">DEIN LERNPROFIL · NUR AUF DIESEM GERÄT</div><h1>Deine Schritte werden sichtbar.</h1><p>${esc(p.name)} · Du siehst, was du geübt hast und was als Nächstes dran ist.</p></div><div class="progress-layout"><section class="today-panel glass"><div class="eyebrow">HEUTE</div><div class="today-count">${today.ids.length}<span> / ${goal}</span></div><h2>verschiedene Wörter geübt</h2><div class="progress-track" role="progressbar" aria-label="Heutiges Wortziel" aria-valuemin="0" aria-valuemax="${goal}" aria-valuenow="${Math.min(today.ids.length, goal)}"><div class="progress-fill" style="width:${percent}%"></div></div><p class="small muted">${today.ids.length >= goal ? 'Dein selbst gewähltes Tagesziel ist erreicht.' : 'Ein kleines Ziel, das zu deinem Tag passt.'}</p><label class="goal-picker">Mein Tagesziel<select id="daily-goal">${[5, 10, 20].map(n => `<option value="${n}" ${goal === n ? 'selected' : ''}>${n} Wörter</option>`).join('')}</select></label><button class="button primary" data-nav="lernen">Eine Runde üben</button></section><section class="week-panel glass"><h2>Deine letzten sieben Tage</h2><p class="small muted">Bearbeitete Karten und Eingaben, auch Wiederholungen.</p><div class="week-bars" aria-label="Übungsaktivität der letzten sieben Tage">${days.map(day => `<div class="day-bar"><b>${day.count}</b><div class="bar-space"><span style="height:${(day.count / max) * 100}%"></span></div><small>${day.label}</small></div>`).join('')}</div></section></div><div class="stat-grid"><div class="stat-box glass"><b>${items.length}</b><span>verschiedene Einträge geübt</span></div><div class="stat-box glass"><b>${items.filter(r => r.step >= 3).length}</b><span>Wiederholungsstufe 3 oder 4</span></div><div class="stat-box glass"><b>${due.length}</b><span>jetzt zur Wiederholung</span></div></div><section class="panel glass"><h2>Was ist als Nächstes dran?</h2><div class="session-actions" style="justify-content:flex-start"><button class="button primary" data-action="due" ${due.length ? '' : 'disabled'}>${due.length} fällige Wörter</button><button class="button secondary" data-action="difficult" ${hard.length ? '' : 'disabled'}>${hard.length} schwierige Wörter</button></div>${Object.keys(p.history).length === 0 && items.length ? '<p class="small muted">Deine bisherigen Einträge wurden übernommen. Der Tagesverlauf wird ab jetzt aufgezeichnet.</p>' : ''}<p class="small muted">Karten werden selbst eingeschätzt, Schreibantworten automatisch verglichen. Die Stufen zeigen erfolgreiche Wiederholungen an verschiedenen Tagen; sie sind keine Leistungsnote. Die einfache Terminregel ist keine wissenschaftliche Messung deiner Gedächtnisleistung.</p></section>${chapterProgressHTML()}${portalProgressSummary()}<section class="backup-panel glass"><div><div class="eyebrow">DEIN FORTSCHRITT GEHÖRT DIR</div><h2>Mitnehmen statt neu anfangen.</h2><p>Exportiere dein Profil und importiere die Datei auf einem anderen Gerät. Auch vor dem Wechsel von dieser Vorschau zur GitHub-Adresse sichern: Jede Webadresse hat ihren eigenen Browserspeicher.</p></div><div class="backup-actions"><button class="button primary" data-extra="export">Lernstand sichern</button><button class="button secondary" data-extra="import">Datei importieren</button><button class="quiet small" data-extra="profiles">Profile verwalten</button><button class="quiet small" data-action="reset-progress">Dieses Profil zurücksetzen</button></div></section>`;
}
function tipVisual(t) {
  switch (t.visual) {
    case 'recall':
      return '<div class="mini-recall"><span>der Park</span><button data-extra="tip-reveal">Erst erinnern, dann öffnen</button><b id="tip-answer" lang="it" hidden>il parco</b></div>';
    case 'spacing':
      return (
        '<div class="tip-timeline">' +
        ['Heute', 'Morgen', '3 Tage', '7 Tage']
          .map((x, i) => `<span><b>${i + 1}</b>${x}</span>`)
          .join('') +
        '</div><small class="viz-note">Beispielabstände, keine feste optimale Regel</small>'
      );
    case 'paper':
      return '<div class="paper-example"><span>La soluzione è coperta.</span><b>il gelato</b><small>aus dem Gedächtnis auf Papier</small></div>';
    case 'error':
      return '<div class="compare-word"><span>Deine Eingabe<b>il papa</b></span><span>Vergleichen<b>il pap<em>à</em></b></span></div>';
    case 'again':
      return '<div class="repeat-steps"><span>Heute gekonnt</span><span>Mit Abstand prüfen</span><span>Wieder erinnern</span></div>';
    case 'picture':
      return '<div class="tip-photo"><img src="assets/gatto.jpg" alt="Rot getigerte Hauskatze"><span>Weißt du das Wort<br><b>ohne die Lösung?</b></span></div>';
    case 'sketch':
      return '<div class="sketch-task"><span>la bicicletta</span><b>Deine Skizze auf Papier</b><small>Es muss kein Kunstwerk sein.</small></div>';
    case 'aloud':
      return '<div class="say-word"><span>einmal bewusst aussprechen</span><b lang="it">buongiorno</b><small>dann später selbst abrufen</small></div>';
    case 'directions':
      return '<div class="direction-example"><span>Verstehen<b>il ponte → die Brücke</b></span><span>Selbst finden<b>die Brücke → il ponte</b></span></div>';
    default:
      return '';
  }
}
function helpV2() {
  const tips = LEARNING_TIPS.filter(t => tipFilter === 'Alle' || t.category === tipFilter);
  $('main').innerHTML =
    `<div class="page-title"><div class="eyebrow">HILFE · FORSCHUNG PRAKTISCH UMGESETZT</div><h1>Kleine Schritte. Besser lernen.</h1><p>Neun kurze Ideen für deine nächste Runde. Die Studien und ihre Grenzen stehen jeweils zum Aufklappen dabei.</p></div><section class="routine-strip glass"><div><div class="eyebrow">SO KÖNNTE EINE KURZE RUNDE AUSSEHEN</div><h2>Erinnern. Prüfen. Wiederkommen.</h2></div><ol><li><b>1</b><span>Wenige Wörter<br>selbst abrufen</span></li><li><b>2</b><span>Antworten prüfen<br>und Fehler ansehen</span></li><li><b>3</b><span>An einem anderen<br>Tag wiederholen</span></li></ol></section><div class="tip-filters" aria-label="Lerntipps filtern">${['Alle', 'Erinnern', 'Wiederholen', 'Schreiben', 'Bilder'].map(f => `<button class="button secondary" data-tip-filter="${f}" aria-pressed="${tipFilter === f}">${f}</button>`).join('')}</div><div class="tips-grid">${tips
      .map(
        t =>
          `<article class="tip-card glass"><div class="eyebrow">${t.category}${t.practical ? ' · praktische Auswahl' : ''}</div><h2>${t.title}</h2><div class="tip-visual">${tipVisual(t)}</div><p>${t.text}</p><button class="quiet tip-action" data-tip-action="${t.id}">${t.action}</button><details class="tip-evidence"><summary>Warum das helfen kann</summary>${t.sources
            .map(id => {
              const s = TIP_SOURCES[id];
              return `<div><b>${s.label}</b><p>${s.note}</p><p class="citation">${s.citation}</p><a href="${s.url}" target="_blank" rel="noopener">Studie lesen</a></div>`;
            })
            .join('')}</details></article>`
      )
      .join(
        ''
      )}</div><p class="small muted" style="margin-top:22px">Studien untersuchen bestimmte Gruppen und Aufgaben. Die Tipps sind begründete Anregungen, keine Garantie für einzelne Schüler. Dein Tagesziel wählst du selbst.</p>`;
}
function setupExtras() {
  initProfiles();
  document.title = 'daje · Sprachen lernen · theis';
  document.querySelector('.appname').innerHTML =
    '<img class="app-icon" src="assets/daje-icon.png" alt=""><span>daje<small>Wortschatz und Verben</small></span>';
  const b = document.createElement('button');
  b.className = 'button secondary';
  b.id = 'profile-open';
  b.textContent = 'Lernprofil';
  document.querySelector('.top-actions').prepend(b);
  const dialog = document.createElement('dialog');
  dialog.id = 'profiles-dialog';
  dialog.setAttribute('aria-labelledby', 'profiles-title');
  dialog.innerHTML =
    '<div class="dialog-head"><h2 id="profiles-title">Dein Lernprofil</h2><button class="button secondary" data-close="profiles-dialog">Schließen</button></div><div id="profiles-body"></div>';
  document.body.append(dialog);
  const input = document.createElement('input');
  input.id = 'progress-import';
  input.type = 'file';
  input.accept = '.json,application/json';
  input.hidden = true;
  document.body.append(input);
  document.addEventListener('click', e => {
    const b = e.target.closest('button');
    if (!b) return;
    const extra = b.dataset.extra;
    if (extra === 'recommend') startRecommended();
    if (extra === 'match-write') {
      config.mode = 'write';
      start(session.words, 'write');
    }
    if (b.dataset.matchSide) chooseMatch(b.dataset.matchSide, b.dataset.matchId);
    if (extra === 'match-next') nextMatchBatch();
    if (extra === 'profiles' || b.id === 'profile-open') showProfiles();
    if (extra === 'export') exportProgress();
    if (extra === 'import') {
      $('progress-import').value = '';
      $('progress-import').click();
    }
    if (extra === 'tip-reveal') {
      $('tip-answer').hidden = false;
      b.hidden = true;
    }
    if (b.dataset.profile) {
      profileState.activeId = b.dataset.profile;
      records = activeProfile().records;
      persistProfiles();
      portalAudience = portalProfile().audience === 'teach' ? 'teach' : 'learn';
      applyAudienceLabels();
      $('profiles-dialog').close();
      nav('start');
    }
    if (b.dataset.tipFilter) {
      tipFilter = b.dataset.tipFilter;
      helpV2();
    }
    if (b.dataset.tipAction) {
      const t = LEARNING_TIPS.find(t => t.id === b.dataset.tipAction);
      if (t.nav) nav(t.nav);
      else if (t.special === 'pictures') {
        config.chapter = '1';
        config.mode = 'photo';
        start(
          WORDS.filter(w => w.photo),
          'photo'
        );
      } else {
        config.mode = t.mode;
        start(available(), t.mode);
      }
    }
  });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'profile-create') return;
    e.preventDefault();
    const name = $('new-profile-name').value.trim();
    if (!name) return;
    if (profileState.profiles.length >= 30) {
      toast('Maximal 30 lokale Profile.');
      return;
    }
    const p = {
      id: newProfileId(),
      name: name.slice(0, 30),
      createdAt: new Date().toISOString(),
      records: {},
      history: {},
      goal: 10
    };
    profileState.profiles.push(p);
    profileState.activeId = p.id;
    records = p.records;
    persistProfiles();
    $('profiles-dialog').close();
    nav('fortschritt');
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'progress-import') importProgress(e.target.files[0]);
    if (e.target.id === 'daily-goal') {
      activeProfile().goal = Number(e.target.value);
      persistProfiles();
      progressV2();
    }
  });
}

function validateProgressBackup(data) {
  const p = validateLegacyProgressBackup(data);
  if (data.profile.portal) p.portal = validatePortalBackup(data.profile.portal);
  return p;
}
function validatePortalBackup(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('Ungültige Portal-Sicherung.');
  const out = {
    favorites: [],
    history: [],
    listening: {},
    notes: {},
    recordHistory: raw.recordHistory !== false,
    audience: raw.audience === 'teach' ? 'teach' : 'learn'
  };
  const idOk = x => typeof x === 'string' && /^[a-z0-9][a-z0-9-]{0,80}$/.test(x),
    dateOk = x => typeof x === 'string' && x.length < 40 && !isNaN(Date.parse(x));
  if (
    !Array.isArray(raw.favorites) ||
    raw.favorites.length > 300 ||
    raw.favorites.some(
      x => typeof x !== 'string' || !/^(listening|vocabulary):[a-z0-9][a-z0-9-]{0,80}$/.test(x)
    )
  )
    throw new Error('Ungültige Merkliste.');
  out.favorites = [...new Set(raw.favorites)];
  if (
    !Array.isArray(raw.history) ||
    raw.history.length > 60 ||
    raw.history.some(x => !x || !idOk(x.id) || !dateOk(x.at))
  )
    throw new Error('Ungültiger Verlauf.');
  out.history = raw.history.map(x => ({ id: x.id, at: x.at }));
  for (const key of ['listening', 'notes']) {
    if (
      !raw[key] ||
      typeof raw[key] !== 'object' ||
      Array.isArray(raw[key]) ||
      Object.keys(raw[key]).length > 1000
    )
      throw new Error('Ungültige Portaldaten.');
    for (const [id, val] of Object.entries(raw[key])) {
      if (!idOk(id) || ['constructor', 'prototype'].includes(id))
        throw new Error('Ungültige Inhalts-ID.');
      if (key === 'notes') {
        if (typeof val !== 'string' || val.length > 2000) throw new Error('Ungültige Notiz.');
        out.notes[id] = val;
        continue;
      }
      if (
        !val ||
        typeof val !== 'object' ||
        !val.answers ||
        typeof val.answers !== 'object' ||
        Array.isArray(val.answers) ||
        Object.keys(val.answers).length > 40
      )
        throw new Error('Ungültige Antworten.');
      const answers = {};
      for (const [qid, a] of Object.entries(val.answers)) {
        if (!idOk(qid) || typeof a !== 'string' || a.length > 1000)
          throw new Error('Ungültige Antwort.');
        Object.defineProperty(answers, qid, {
          value: a,
          enumerable: true,
          writable: true,
          configurable: true
        });
      }
      const z = {
        answers,
        checked: val.checked === true,
        transcriptOpened: val.transcriptOpened === true,
        usedTranscript: val.usedTranscript === true || val.transcriptOpened === true,
        attempts:
          Number.isInteger(val.attempts) && val.attempts >= 0 && val.attempts <= 1000000
            ? val.attempts
            : 0
      };
      if (val.lastResult) {
        const r = val.lastResult;
        if (
          !Number.isInteger(r.correct) ||
          !Number.isInteger(r.total) ||
          r.correct < 0 ||
          r.correct > r.total ||
          r.total < 1 ||
          r.total > 40 ||
          !dateOk(r.at)
        )
          throw new Error('Ungültiges Hörergebnis.');
        z.lastResult = {
          correct: r.correct,
          total: r.total,
          at: r.at,
          assisted: r.assisted === true
        };
      }
      out.listening[id] = z;
    }
  }
  return out;
}
