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
      .filter(k => typeof k === 'string' && /^[lv]:[\w.-]{1,120}$/.test(k))
      .slice(0, 30);
    return items.length ? { code, t: String(j.t || '').slice(0, 120), i: items } : null;
  } catch {
    return null;
  }
}
function hwURL(a) {
  const u = new URL(location.href);
  u.search = '';
  u.hash = '';
  u.searchParams.set('aufgabe', hwEncode({ t: a.title || a.t, i: a.items || a.i }));
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
  // Eigene Übungen reisen mit eigenem Link (Redaktion → Mit Klasse teilen), nicht in der Hausaufgabe.
  if (
    !isTeacher() ||
    /^[lvg]:eigen-/.test(key) ||
    editorState.items.some(i => 'l:' + edId(i) === key || 'v:' + edId(i) === key)
  )
    return '';
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
function hwComposer() {
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
    <p class="muted small">Lernende öffnen den Link ohne Anmeldung und sehen die Aufgaben mit ihrem Stand. Füge Inhalte über „Zur Hausaufgabe“ bei Hörübungen und Wortlisten hinzu.</p>
    <label class="field">Titel (optional)<input id="hw-name" maxlength="120" value="${esc(hwDraft.title)}" placeholder="z. B. Bis Dienstag: Unità 2"></label>
    ${
      rows.length
        ? `<ol class="hw-list">${rows
            .map(
              (r, i) =>
                `<li><span><b>${esc(r.x.title)}</b><small>${HW_KIND[r.kind]} · ${esc(portalLang(r.x.language))} · ${esc(r.x.level)}</small></span><span class="hw-row-actions"><button class="quiet" data-hw-move="${i}" data-dir="-1" aria-label="Nach oben" ${i === 0 ? 'disabled' : ''}>↑</button><button class="quiet" data-hw-move="${i}" data-dir="1" aria-label="Nach unten" ${i === rows.length - 1 ? 'disabled' : ''}>↓</button><button class="quiet" data-hw="${esc(r.key)}" aria-label="Entfernen">✕</button></span></li>`
            )
            .join('')}</ol>
      <div class="qr-card hw-qr">${qrSVG(url, 'QR-Code zur Hausaufgabe')}</div>
      <div class="hw-actions"><button class="button primary" data-qr-copy="${esc(url)}">Link kopieren</button><a class="button secondary" href="${esc(url)}" target="_blank" rel="noopener">So sehen es Lernende</a><button class="quiet" data-hw-clear>Leeren</button></div>`
        : '<p class="hw-empty">Noch leer. Tippe bei einer Hörübung oder Wortliste auf „Zur Hausaufgabe“.</p>'
    }`;
  if (!d.open) d.showModal();
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
        return `<li class="${ok ? 'is-done' : ''}"><span class="hw-check" aria-hidden="true">${ok ? '✓' : ''}</span><span class="hw-text"><b>${esc(r.x.title)}</b><small><span>${HW_KIND[r.kind]}</span> · ${esc(r.x.level)}${ok ? ' · <span>erledigt</span>' : ''}</small></span>${action}</li>`;
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
document.addEventListener('click', e => {
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
  d.querySelector('.hw-qr').innerHTML = qrSVG(url, 'QR-Code zur Hausaufgabe');
  d.querySelector('[data-qr-copy]').dataset.qrCopy = url;
  d.querySelector('.hw-actions a').href = url;
});
hwRefresh();
if (params.get('aufgabe')) {
  const a = hwDecode(params.get('aufgabe'));
  if (a) {
    hwReceive(a);
    hwCurrent = a;
    nav('aufgabe');
  } else toast('Dieser Hausaufgaben-Link ist unvollständig.');
}
if (params.get('eigene')) receiveShared(params.get('eigene'));
if (params.get('einreichung')) receiveSubmission(params.get('einreichung'));
