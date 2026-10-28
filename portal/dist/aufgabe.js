'use strict';
/*
 * Hausaufgabe: Lehrkräfte bündeln Hörübungen und Wortlisten zu einem Link oder QR-Code (?aufgabe=…).
 * Ohne Anmeldung und ohne Server: Der Link enthält nur Titel und Inhalts-IDs. Lernende sehen eine
 * Aufgabenliste mit ihrem Stand; erhaltene Hausaufgaben bleiben auf dem Gerät gespeichert.
 */
const HW_DRAFT = 'daje-hausaufgabe-v1';
const HW_INBOX = 'daje-aufgaben-v1';
let hwDraft = read(HW_DRAFT, { title: '', items: [] });
let hwCurrent = null; // { code, t, i }
let hwActive = null; // Aufgabe aus dieser Liste gerade geöffnet: „Weiter“ nach der Korrektur

function hwEncode(a) {
  const bytes = new TextEncoder().encode(JSON.stringify(a));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function hwDecode(code) {
  try {
    const bin = atob(String(code).replace(/-/g, '+').replace(/_/g, '/'));
    const j = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0))));
    if (!j || !Array.isArray(j.i)) return null;
    const items = j.i
      .filter(k => typeof k === 'string' && /^[lvg]:[\w.-]{1,120}$/.test(k))
      .slice(0, 30);
    return items.length ? { code, t: String(j.t || '').slice(0, 120), i: items } : null;
  } catch {
    return null;
  }
}
/* Eigene Übungen (Redaktion, z. B. Lückentext aus einem Zeitungsartikel) reisen gepackt im selben Link mit. */
let hwPacked = { key: '', code: '' };
const hwOwn = items => items.map(k => editorState.items.find(i => edId(i) === k.slice(2))?.payload).filter(Boolean);
async function hwPackOwn(items) {
  const own = hwOwn(items);
  const key = own.map(p => p.id + ':' + (p.updatedAt || JSON.stringify(p).length)).join(',');
  if (hwPacked.key !== key) hwPacked = { key, code: own.length ? await edPack(own) : '' };
  return hwPacked.code;
}
function hwURL(a) {
  const u = new URL(location.href);
  u.search = '';
  u.hash = '';
  u.searchParams.set('aufgabe', hwEncode({ t: a.title || a.t, i: a.items || a.i }));
  if (hwPacked.code && hwOwn(a.items || a.i).length) u.searchParams.set('pakete', hwPacked.code);
  return u.href;
}
function hwResolve(key) {
  const kind = key[0] === 'l' ? 'listening' : key[0] === 'g' ? 'grammar' : 'vocabulary';
  const x = contentList(kind).find(y => y.id === key.slice(2));
  return x ? { key, kind, x } : null;
}
const HW_KIND = { listening: 'Hörübung', grammar: 'Grammatik', vocabulary: 'Wortliste' };
function hwDone(r) {
  if (r.kind === 'listening' || r.kind === 'grammar') return lessonStatus(r.x).done;
  const seen = r.x.entries.filter(w => records[r.x.id + '-' + w.id]).length;
  return seen >= Math.ceil(r.x.entries.length * 0.8);
}
function hwSaveDraft() {
  save(HW_DRAFT, hwDraft);
  hwRefresh();
}

/* ---------- Lehrkräfte: zusammenstellen ---------- */

function hwButton(key) {
  // Eigene Übungen reisen gepackt im Link mit (hwPackOwn).
  if (!isTeacher()) return '';
  const on = hwDraft.items.includes(key);
  return `<button class="button secondary hw-add" data-hw="${esc(key)}" aria-pressed="${on}">${on ? 'In der Hausaufgabe' : 'Zur Hausaufgabe'}</button>`;
}
function hwToggle(key) {
  const i = hwDraft.items.indexOf(key);
  if (i >= 0) hwDraft.items.splice(i, 1);
  else if (hwDraft.items.length >= 30) return toast('Höchstens 30 Inhalte pro Hausaufgabe.');
  else hwDraft.items.push(key);
  hwSaveDraft();
  toast(i >= 0 ? 'Aus der Hausaufgabe entfernt.' : 'Zur Hausaufgabe hinzugefügt.');
}
function hwRefresh() {
  document.querySelectorAll('[data-hw]').forEach(b => {
    const on = hwDraft.items.includes(b.dataset.hw);
    b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? 'In der Hausaufgabe' : 'Zur Hausaufgabe';
  });
  let pill = $('hw-pill');
  const show = isTeacher() && hwDraft.items.length && !EMBED;
  if (!show) return pill?.remove();
  if (!pill) {
    pill = document.createElement('button');
    pill.id = 'hw-pill';
    pill.className = 'hw-pill';
    pill.dataset.hwOpen = '1';
    document.body.append(pill);
  }
  pill.innerHTML = `Hausaufgabe <b>${hwDraft.items.length}</b>`;
}
async function hwComposer() {
  try {
    await hwPackOwn(hwDraft.items);
  } catch (e) {
    hwPacked = { key: '', code: '' };
  }
  let d = $('hw-dialog');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'hw-dialog';
    d.setAttribute('aria-labelledby', 'hw-title');
    document.body.append(d);
  }
  const rows = hwDraft.items.map(hwResolve).filter(Boolean);
  const url = rows.length ? hwURL(hwDraft) : '';
  d.innerHTML = `<div class="dialog-head"><h2 id="hw-title">Hausaufgabe</h2><button class="button secondary" data-close="hw-dialog">Schließen</button></div>
    <p class="muted small">Für die Hausaufgabe oder gleich in der Stunde: Lernende öffnen den Link oder scannen den QR-Code am iPad, ohne Anmeldung. Sie arbeiten die Aufgaben der Reihe nach ab und sehen ihren Stand. Inhalte kommen über „Zur Hausaufgabe“ bei Grammatik, Hörübungen und Wortlisten dazu, oder aus der Arbeitsblatt-Mappe.</p>
    <label class="field">Titel (optional)<input id="hw-name" maxlength="120" value="${esc(hwDraft.title)}" placeholder="z. B. Bis Dienstag: Unità 2"></label>
    ${
      rows.length
        ? `<ol class="hw-list">${rows
            .map(
              (r, i) =>
                `<li><span><b>${esc(r.x.title)}</b><small>${HW_KIND[r.kind]} · ${esc(portalLang(r.x.language))} · ${esc(r.x.level)}</small></span><span class="hw-row-actions"><button class="quiet" data-hw-move="${i}" data-dir="-1" aria-label="Nach oben" ${i === 0 ? 'disabled' : ''}>↑</button><button class="quiet" data-hw-move="${i}" data-dir="1" aria-label="Nach unten" ${i === rows.length - 1 ? 'disabled' : ''}>↓</button><button class="quiet" data-hw="${esc(r.key)}" aria-label="Entfernen">✕</button></span></li>`
            )
            .join('')}</ol>
      <div class="qr-card hw-qr">${hwQR(url)}</div>
      <div class="hw-actions"><button class="button primary" data-qr-copy="${esc(url)}">Link kopieren</button>${url.length <= HW_QR_MAX ? '<button class="button secondary" data-hw-beamer>Groß zeigen (Beamer)</button>' : ''}<a class="button secondary" href="${esc(url)}" target="_blank" rel="noopener">So sehen es Lernende</a><button class="quiet" data-hw-clear>Leeren</button></div>`
        : '<p class="hw-empty">Noch leer. Tippe bei einer Hörübung oder Wortliste auf „Zur Hausaufgabe“.</p>'
    }`;
  if (!d.open) d.showModal();
}

/* Mit eigenen Übungen wird der Link lang: dann statt QR-Code ein Hinweis zum Teilen per Link. */
const HW_QR_MAX = 1800;
function hwQR(url) {
  return url.length <= HW_QR_MAX
    ? qrSVG(url, 'QR-Code zur Hausaufgabe')
    : '<p class="hw-long">Mit eigenen Übungen ist der Link zu lang für einen QR-Code. Teile ihn per AirDrop, Mail oder Lernplattform.</p>';
}

/* ---------- Lernende: Aufgabenliste ---------- */

function hwInbox() {
  return read(HW_INBOX, []);
}
function hwReceive(a) {
  const list = hwInbox().filter(x => x.code !== a.code);
  list.unshift({ code: a.code, t: a.t, i: a.i, at: new Date().toISOString() });
  save(HW_INBOX, list.slice(0, 12));
}
function hwStatus(a) {
  const rows = a.i.map(hwResolve).filter(Boolean);
  return { rows, done: rows.filter(hwDone).length };
}
function hwPage() {
  const a = hwCurrent;
  if (!a) return nav('start');
  const { rows, done } = hwStatus(a);
  $('breadcrumb').textContent = 'Hausaufgabe';
  $('main').innerHTML = `<div class="page">
    <header class="page-head"><div class="eyebrow">Hausaufgabe</div><h1>${esc(a.t || 'Deine Aufgaben')}</h1><p>${done} von ${rows.length} erledigt.${rows.length < a.i.length ? ' Einige Inhalte gibt es in dieser Version nicht mehr.' : ''}</p>
    <div class="lcard-progress" aria-hidden="true"><i style="width:${rows.length ? Math.round((100 * done) / rows.length) : 0}%"></i></div></header>
    <ol class="hw-tasks">${rows
      .map(r => {
        const ok = hwDone(r);
        const action =
          r.kind !== 'vocabulary'
            ? `<button class="button ${ok ? 'secondary' : 'primary'}" data-lesson="${esc(r.x.id)}">${ok ? 'Noch einmal' : r.kind === 'grammar' ? 'Üben' : 'Anhören'}</button>`
            : `<button class="button ${ok ? 'secondary' : 'primary'}" data-vocab-set="${esc(r.x.id)}">${ok ? 'Wiederholen' : 'Üben'}</button>`;
        return `<li class="${ok ? 'is-done' : ''}" data-hw-row="${esc(r.x.id)}"><span class="hw-check" aria-hidden="true">${ok ? '✓' : ''}</span><span class="hw-text"><b>${esc(r.x.title)}</b><small><span>${HW_KIND[r.kind]}</span> · ${esc(r.x.level)}${ok ? ' · <span>erledigt</span>' : ''}</small></span>${action}</li>`;
      })
      .join('')}</ol>
  </div>`;
}
function hwHomeCard() {
  if (isTeacher()) return '';
  const open = hwInbox()
    .map(a => ({ a, s: hwStatus(a) }))
    .filter(({ s }) => s.rows.length && s.done < s.rows.length);
  if (!open.length) return '';
  const { a, s } = open[0];
  return `<button class="hw-home" data-hw-show="${esc(a.code)}"><span class="eyebrow">Hausaufgabe</span><b>${esc(a.t || 'Deine Aufgaben')}</b><small>${s.done} von ${s.rows.length} erledigt</small></button>`;
}
function hwShow(code) {
  const a = hwDecode(code);
  if (!a) return toast('Dieser Hausaufgaben-Link ist unvollständig.');
  hwCurrent = a;
  nav('aufgabe');
}

/* ---------- Einbindung ---------- */

{
  const baseRender = render;
  render = function () {
    if (view === 'aufgabe' && !session) return hwPage();
    return baseRender.apply(this, arguments);
  };
  const baseBanner = resultBanner;
  resultBanner = function (x, state) {
    const html = baseBanner.apply(this, arguments);
    if (!html || !hwActive || hwActive.code !== hwCurrent?.code) return html;
    const rows = hwStatus(hwCurrent).rows;
    const i = rows.findIndex(r => r.x.id === x.id);
    if (i < 0) return html;
    const next = rows.slice(i + 1).concat(rows.slice(0, i)).find(r => !hwDone(r));
    const btn = next
      ? next.kind === 'vocabulary'
        ? `<button class="button primary" data-vocab-set="${esc(next.x.id)}">Nächste Aufgabe</button>`
        : `<button class="button primary" data-lesson="${esc(next.x.id)}">Nächste Aufgabe</button>`
      : '';
    return html.replace('</section>', `<div class="hw-next"><span>${rows.filter(hwDone).length} von ${rows.length} erledigt</span>${btn}<button class="button secondary" data-hw-show="${esc(hwCurrent.code)}">Zur Aufgabenliste</button></div></section>`);
  };
  const baseHome = learnerHome;
  learnerHome = function () {
    return hwHomeCard() + baseHome.apply(this, arguments);
  };
  const baseCard = lessonCard;
  lessonCard = function (x) {
    const html = baseCard.apply(this, arguments);
    return isTeacher()
      ? html.replace('<div class="lcard-foot">', '<div class="lcard-foot">' + hwButton('l:' + x.id))
      : html;
  };
  const baseAudience = applyAudienceLabels;
  applyAudienceLabels = function () {
    const r = baseAudience.apply(this, arguments);
    hwRefresh();
    return r;
  };
}
/* Aufgabe aus der Liste geöffnet? Dann zeigt die Korrektur „Nächste Aufgabe“. */
document.addEventListener(
  'click',
  e => {
    const b = e.target.closest('[data-lesson],[data-vocab-set]');
    if (b) hwActive = b.closest('.hw-tasks,.hw-next') ? hwCurrent : null;
  },
  true
);
/* QR-Code bildschirmfüllend für den Beamer: Lernende scannen mit dem iPad. */
function hwBeamer() {
  const url = hwURL(hwDraft);
  let d = $('hw-beamer');
  if (!d) {
    d = document.createElement('dialog');
    d.id = 'hw-beamer';
    d.className = 'hw-beamer';
    document.body.append(d);
  }
  const n = hwDraft.items.length;
  d.innerHTML = `<div class="hw-beamer-in"><h2>${esc(hwDraft.title || 'Aufgaben für heute')}</h2><p>${plural(n, 'Aufgabe', 'Aufgaben')} · QR-Code mit dem iPad scannen</p><div class="hw-beamer-qr">${qrSVG(url, 'QR-Code zu den Aufgaben')}</div><button class="button secondary" data-close="hw-beamer">Schließen</button></div>`;
  $('hw-dialog')?.close();
  d.showModal();
}
/* Arbeitsblatt-Mappe → Link für die Klasse (z. B. kurz vor der Stunde für die iPads). */
function hwFromSheet() {
  const ids = wsAll();
  const keys = ids
    .map(id => findTask(id))
    .filter(Boolean)
    .filter(x => !editorState.items.some(i => edId(i) === x.id && !i.payload))
    .map(x => (x.kind === 'grammar' ? 'g:' : 'l:') + x.id)
    .slice(0, 30);
  const left = ids.length - keys.length;
  hwDraft = { title: wsDraft.title || hwDraft.title, items: keys };
  hwSaveDraft();
  $('ws-dialog')?.close();
  hwComposer();
  if (left) toast(plural(left, 'Entwurf ist', 'Entwürfe sind') + ' nicht im Link: bitte zuerst in der Redaktion fertigstellen.');
}
document.addEventListener('click', e => {
  if (e.target.closest('[data-ws-link]')) return hwFromSheet();
  if (e.target.closest('[data-hw-beamer]')) return hwBeamer();
  const b = e.target.closest(
    '[data-hw],[data-hw-open],[data-hw-move],[data-hw-clear],[data-hw-show]'
  );
  if (!b) return;
  if (b.dataset.hwShow) return hwShow(b.dataset.hwShow);
  if (b.dataset.hwOpen) return hwComposer();
  if (b.dataset.hwMove) {
    const i = Number(b.dataset.hwMove),
      j = i + Number(b.dataset.dir);
    [hwDraft.items[i], hwDraft.items[j]] = [hwDraft.items[j], hwDraft.items[i]];
    hwSaveDraft();
    return hwComposer();
  }
  if (b.hasAttribute('data-hw-clear')) {
    hwDraft = { title: '', items: [] };
    hwSaveDraft();
    return hwComposer();
  }
  hwToggle(b.dataset.hw);
  if ($('hw-dialog')?.open) hwComposer();
});
document.addEventListener('input', e => {
  if (e.target.id !== 'hw-name') return;
  hwDraft.title = e.target.value;
  save(HW_DRAFT, hwDraft);
  const url = hwURL(hwDraft);
  const d = $('hw-dialog');
  d.querySelector('.hw-qr').innerHTML = hwQR(url);
  d.querySelector('[data-qr-copy]').dataset.qrCopy = url;
  d.querySelector('.hw-actions a').href = url;
});
hwRefresh();
if (params.get('aufgabe')) {
  const a = hwDecode(params.get('aufgabe'));
  const open = () => {
    hwReceive(a);
    hwCurrent = a;
    nav('aufgabe');
  };
  if (!a) toast('Dieser Hausaufgaben-Link ist unvollständig.');
  else if (params.get('pakete'))
    // Mitgeschickte eigene Übungen der Lehrkraft speichern (wie „Mit Klasse teilen“), dann die Liste zeigen.
    edUnpack(params.get('pakete'))
      .then(list => {
        const got = (Array.isArray(list) ? list : []).map(x => TheisContent.validatePackage(x)).filter(v => v.ok).map(v => v.value);
        const ids = new Set(got.map(p => p.id));
        const keep = read('daje-geteilt-v1', []).filter(x => !ids.has(x.payload?.id));
        save('daje-geteilt-v1', [...got.map(p => ({ payload: p, at: new Date().toISOString() })), ...keep].slice(0, 60));
        open();
      })
      .catch(err => {
        toast(err.message === 'Browser zu alt' ? 'Dein Browser kann diesen Link nicht öffnen. Bitte aktualisiere ihn.' : 'Einige Aufgaben im Link sind unvollständig.');
        open();
      });
  else open();
}
if (params.get('eigene')) receiveShared(params.get('eigene'));
if (params.get('einreichung')) receiveSubmission(params.get('einreichung'));
