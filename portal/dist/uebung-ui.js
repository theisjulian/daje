'use strict';
/*
 * Übungen ohne Auswahllisten: Ziehen oder Antippen, mit Maus, Finger oder Stift.
 * - Ordnen: kurze Teile als Satzbaukasten (Wörter antippen → Satzzeile, Ziehen zum Umstellen),
 *   lange Teile als Liste (am Griff ziehen, Pfeile, oder zwei Einträge nacheinander antippen).
 * - Zuordnen: Karten antippen und in das Feld legen (oder ziehen).
 * - Auswahl-Lücken: Möglichkeiten stehen direkt im Satz; nach der Wahl liest sich der Satz flüssig.
 * - Wortkasten: Wort antippen füllt die aktive bzw. nächste leere Lücke; Tippen bleibt möglich.
 * Gespeichert wird im selben Format wie bisher ({ teil: wert }), Bewertung bleibt unverändert.
 */
const ixNorm = s => String(s ?? '').normalize('NFC').toLocaleLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
/* Satzbaukasten, wenn alle Teile kurz sind (Wörter, Wortgruppen); sonst Liste. */
const ixChips = q => q.items.every(it => it.text.length <= 30) && q.items.reduce((s, it) => s + it.text.length, 0) <= 160;
/* Teil an Position n richtig? Gleich lautende Teile (zweimal „a“) dürfen die Plätze tauschen. */
const ixOrderOk = (q, it, n) => n >= 1 && n <= q.items.length && ixNorm(q.items[n - 1].text) === ixNorm(it.text);

function ixStore(qid, obj) {
  const st = lessonProgress();
  st.answers[qid] = Object.keys(obj).length ? JSON.stringify(obj) : '';
  st.checked = false;
  if (!persistPortal()) toast('Antwort konnte nicht dauerhaft gespeichert werden.');
  updateListeningProgress();
}
const ixQ = id => currentLesson()?.questions.find(q => q.id === id);

/* ---------- Ordnen ---------- */
function ixOrderingHTML(x, q, parts, state) {
  const pos = it => (ownPart(parts, it.id) ? Number(parts[it.id]) : 0);
  const mark = it => (state.checked ? (ixOrderOk(q, it, pos(it)) ? ' is-correct' : ' is-wrong') : '');
  if (ixChips(q)) {
    const placed = q.items.filter(it => pos(it) > 0).sort((a, b) => pos(a) - pos(b));
    const pool = seededOrder(q.items, q.id).filter(it => !placed.includes(it));
    const chip = it => `<button type="button" class="ix-chip${mark(it)}" data-ix-item="${esc(it.id)}">${esc(it.text)}</button>`;
    return `<p class="q-hint">Tippe die Teile der Reihe nach an. Zum Umstellen ziehen, zum Zurücklegen antippen.</p>
      <div class="sb" data-ix-order="${esc(q.id)}" data-mode="chips" lang="${x.language}">
        <div class="sb-line${state.checked ? (q.items.every(it => ixOrderOk(q, it, pos(it))) ? ' is-correct' : ' is-wrong') : ''}" data-ix-zone="line" aria-label="Deine Reihenfolge"><span class="sb-ph">Hier entsteht deine Lösung.</span>${placed.map(chip).join('')}</div>
        <div class="sb-pool" data-ix-zone="pool" aria-label="Noch übrig">${pool.map(chip).join('')}</div>
      </div>`;
  }
  const all = q.items.every(it => pos(it) > 0);
  const list = all ? [...q.items].sort((a, b) => pos(a) - pos(b)) : seededOrder(q.items, q.id);
  return `<p class="q-hint">Ziehe am Griff ⠿, nutze die Pfeile oder tippe zwei Einträge nacheinander an, um sie zu tauschen.</p>
    <ol class="ord-list" data-ix-order="${esc(q.id)}" data-mode="list" lang="${x.language}">${list
      .map(
        (it, i) =>
          `<li class="ord-item${all ? mark(it) : ''}" data-ix-item="${esc(it.id)}"><span class="ord-grip" aria-hidden="true">⠿</span><span class="ord-n">${i + 1}</span><button type="button" class="ord-text" data-ix-pick>${esc(it.text)}</button><span class="ord-btns"><button type="button" class="quiet" data-ix-step="-1" aria-label="Nach oben">↑</button><button type="button" class="quiet" data-ix-step="1" aria-label="Nach unten">↓</button></span></li>`
      )
      .join('')}</ol>`;
}
function ixOrderSave(box) {
  const ids = [...box.querySelectorAll(box.dataset.mode === 'chips' ? '[data-ix-zone="line"] [data-ix-item]' : '[data-ix-item]')].map(el => el.dataset.ixItem);
  const obj = {};
  ids.forEach((id, i) => (obj[id] = String(i + 1)));
  if (box.dataset.mode === 'list') box.querySelectorAll('.ord-n').forEach((n, i) => (n.textContent = i + 1));
  ixStore(box.dataset.ixOrder, obj);
}

/* ---------- Zuordnen ---------- */
function ixMatchingHTML(x, q, parts, state) {
  const rights = seededOrder([...q.pairs.map(p => ({ id: p.id, text: p.right })), ...(q.distractors || []).map((t, i) => ({ id: 'x' + i, text: t }))], q.id);
  const used = new Set(q.pairs.map(p => (ownPart(parts, p.id) ? parts[p.id] : '')).filter(Boolean));
  const chip = r => `<button type="button" class="ix-chip" data-ix-right="${esc(r.id)}">${esc(r.text)}</button>`;
  return `<p class="q-hint">Tippe eine Karte an und dann das passende Feld. Du kannst die Karten auch ziehen.</p>
    <div class="mt" data-ix-match="${esc(q.id)}" lang="${x.language}">
      <div class="mt-pool" data-ix-zone="pool" aria-label="Karten">${rights.filter(r => !used.has(r.id)).map(chip).join('')}</div>
      <div class="mt-rows">${q.pairs
        .map(p => {
          const v = ownPart(parts, p.id) ? parts[p.id] : '';
          const r = rights.find(y => y.id === v);
          const m = state.checked ? (v === p.id ? ' is-correct' : ' is-wrong') : '';
          return `<div class="mt-row${m}"><span class="mt-left">${esc(p.left)}</span><span class="mt-slot" data-ix-slot="${esc(p.id)}" role="button" tabindex="0" aria-label="Feld zu „${esc(p.left)}“">${r ? chip(r) : '<span class="mt-ph">…</span>'}</span></div>`;
        })
        .join('')}</div>
    </div>`;
}
/* Kartenstapel nur dann mitscrollen lassen, wenn er klein genug ist, um die Felder nicht zu verdecken. */
function ixPoolFit(root = document) {
  root.querySelectorAll('.mt-pool').forEach(p => p.classList.toggle('is-sticky', p.offsetHeight > 0 && p.offsetHeight < innerHeight * 0.18));
}
function ixMatchSave(box) {
  const obj = {};
  box.querySelectorAll('[data-ix-slot]').forEach(s => {
    const c = s.querySelector('[data-ix-right]');
    if (c) obj[s.dataset.ixSlot] = c.dataset.ixRight;
  });
  box.querySelectorAll('[data-ix-slot]').forEach(s => {
    if (!s.querySelector('[data-ix-right]') && !s.querySelector('.mt-ph')) s.innerHTML = '<span class="mt-ph">…</span>';
  });
  ixStore(box.dataset.ixMatch, obj);
  ixPoolFit(box);
}
function ixPlace(box, slot, chip) {
  const old = slot.querySelector('[data-ix-right]');
  if (old && old !== chip) box.querySelector('.mt-pool').append(old);
  slot.querySelector('.mt-ph')?.remove();
  slot.append(chip);
}

/* ---------- Auswahl-Lücken ---------- */
function ixChoiceGap(q, id, n, val, ok, checked) {
  const g = q.gaps.find(v => v.id === id);
  const opts = [...g.options].sort((a, b) => a.localeCompare(b));
  const m = checked && val ? (ok ? ' is-correct' : ' is-wrong') : checked ? ' is-wrong' : '';
  if (val) return `<span class="gc is-set${m}" data-ix-gc="${esc(q.id)}" data-part="${esc(id)}"><button type="button" class="gc-pick" data-ix-open aria-label="Lücke ${n}: ${esc(val)} (ändern)">${esc(val)}</button></span>`;
  return `<span class="gc${m}" data-ix-gc="${esc(q.id)}" data-part="${esc(id)}" role="group" aria-label="Lücke ${n}">${opts.map(o => `<button type="button" class="gc-o" data-ix-opt="${esc(o)}">${esc(o)}</button>`).join('<span class="gc-sep" aria-hidden="true">/</span>')}</span>`;
}
function ixChoiceOpen(span, current) {
  const q = ixQ(span.dataset.ixGc);
  const g = q.gaps.find(v => v.id === span.dataset.part);
  span.className = 'gc is-open';
  span.innerHTML = [...g.options]
    .sort((a, b) => a.localeCompare(b))
    .map(o => `<button type="button" class="gc-o" data-ix-opt="${esc(o)}" aria-pressed="${o === current}">${esc(o)}</button>`)
    .join('<span class="gc-sep" aria-hidden="true">/</span>');
  span.querySelector('[aria-pressed="true"]')?.focus();
}

/* ---------- Wortkasten ---------- */
const ixLastGap = {};
function ixBankRefresh(fs) {
  if (!fs) return;
  const vals = [...fs.querySelectorAll('input.gap')].map(i => ixNorm(i.value)).filter(Boolean);
  fs.querySelectorAll('[data-ix-word]').forEach(c => c.classList.toggle('is-used', vals.includes(ixNorm(c.dataset.ixWord))));
}
function ixFill(input, word) {
  input.value = word;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  ixBankRefresh(input.closest('fieldset'));
}

/* ---------- Antippen ---------- */
let ixPicked = null; // { box, el }
let ixSlotPicked = null;
let ixSuppress = null;
function ixUnpick() {
  ixPicked?.el.classList.remove('is-picked');
  ixSlotPicked?.classList.remove('is-target');
  ixPicked = ixSlotPicked = null;
}
document.addEventListener('click', e => {
  // Klick direkt nach dem Ziehen gehört zum Ziehen, nicht zum Antippen.
  if (ixSuppress && ixSuppress.contains(e.target)) {
    ixSuppress = null;
    return e.preventDefault();
  }
  // Auswahl-Lücke
  const opt = e.target.closest('[data-ix-opt]');
  if (opt) {
    const span = opt.closest('[data-ix-gc]');
    const st = lessonProgress();
    const cur = Object.assign(Object.create(null), answerParts(st.answers[span.dataset.ixGc] || ''));
    cur[span.dataset.part] = opt.dataset.ixOpt;
    span.className = 'gc is-set';
    span.innerHTML = `<button type="button" class="gc-pick" data-ix-open>${esc(opt.dataset.ixOpt)}</button>`;
    ixStore(span.dataset.ixGc, cur);
    // weiter zur nächsten offenen Lücke derselben Aufgabe
    span.closest('fieldset')?.querySelector('.gc:not(.is-set) .gc-o')?.focus({ preventScroll: true });
    return;
  }
  const reopen = e.target.closest('[data-ix-open]');
  if (reopen) return ixChoiceOpen(reopen.closest('[data-ix-gc]'), reopen.textContent);

  // Wortkasten
  const word = e.target.closest('[data-ix-word]');
  if (word) {
    const fs = word.closest('fieldset');
    const inputs = [...fs.querySelectorAll('input.gap')];
    const last = inputs.find(i => i === ixLastGap[fs.id]);
    const target = last && !last.value.trim() ? last : inputs.find(i => !i.value.trim()) || last;
    if (!target) return;
    ixFill(target, word.dataset.ixWord);
    const next = inputs.slice(inputs.indexOf(target) + 1).find(i => !i.value.trim());
    ixLastGap[fs.id] = next || target;
    return;
  }

  // Ordnen
  const step = e.target.closest('[data-ix-step]');
  if (step) {
    const li = step.closest('[data-ix-item]');
    const box = li.parentElement;
    const sib = Number(step.dataset.ixStep) < 0 ? li.previousElementSibling : li.nextElementSibling;
    if (!sib) return;
    Number(step.dataset.ixStep) < 0 ? box.insertBefore(li, sib) : box.insertBefore(sib, li);
    ixUnpick();
    ixOrderSave(box);
    return;
  }
  const item = e.target.closest('[data-ix-item]');
  if (item) {
    const box = item.closest('[data-ix-order]');
    if (box.dataset.mode === 'chips') {
      const inLine = item.parentElement.dataset.ixZone === 'line';
      box.querySelector(inLine ? '[data-ix-zone="pool"]' : '[data-ix-zone="line"]').append(item);
      ixOrderSave(box);
      return;
    }
    // Liste: zwei Einträge nacheinander antippen tauscht sie
    if (ixPicked && ixPicked.box === box && ixPicked.el !== item) {
      const a = ixPicked.el, b = item;
      const mark = document.createElement('li');
      box.insertBefore(mark, a);
      box.insertBefore(a, b);
      box.insertBefore(b, mark);
      mark.remove();
      ixUnpick();
      ixOrderSave(box);
      return;
    }
    if (ixPicked?.el === item) return ixUnpick();
    ixUnpick();
    ixPicked = { box, el: item };
    item.classList.add('is-picked');
    return;
  }

  // Zuordnen
  const right = e.target.closest('[data-ix-right]');
  const slot = e.target.closest('[data-ix-slot]');
  if (right && right.closest('[data-ix-slot]')) {
    // Karte im Feld antippen: zurück zu den Karten
    const box = right.closest('[data-ix-match]');
    box.querySelector('.mt-pool').append(right);
    ixUnpick();
    ixMatchSave(box);
    return;
  }
  if (right) {
    const box = right.closest('[data-ix-match]');
    if (ixSlotPicked && box.contains(ixSlotPicked)) {
      const s = ixSlotPicked;
      ixUnpick();
      ixPlace(box, s, right);
      ixMatchSave(box);
      box.querySelector('[data-ix-slot]:has(.mt-ph)')?.classList.add('is-target');
      ixSlotPicked = box.querySelector('[data-ix-slot].is-target');
      return;
    }
    if (ixPicked?.el === right) return ixUnpick();
    ixUnpick();
    ixPicked = { box, el: right };
    right.classList.add('is-picked');
    return;
  }
  if (slot) {
    const box = slot.closest('[data-ix-match]');
    if (ixPicked && ixPicked.box === box) {
      const c = ixPicked.el;
      ixUnpick();
      ixPlace(box, slot, c);
      ixMatchSave(box);
      return;
    }
    ixUnpick();
    ixSlotPicked = slot;
    slot.classList.add('is-target');
    return;
  }
});
document.addEventListener('keydown', e => {
  const slot = e.target.closest?.('[data-ix-slot]');
  if (slot && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    slot.click();
  }
});
document.addEventListener('focusin', e => {
  if (e.target.matches?.('input.gap')) {
    const fs = e.target.closest('fieldset');
    if (fs) ixLastGap[fs.id] = e.target;
  }
});
document.addEventListener('input', e => {
  if (e.target.matches?.('input.gap')) ixBankRefresh(e.target.closest('fieldset'));
});

/* ---------- Ziehen (Pointer Events) ---------- */
{
  let d = null;
  const DRAG = '[data-ix-item],[data-ix-right],[data-ix-word]';
  document.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    const el = e.target.closest(DRAG);
    if (!el || !el.closest('#listening-form')) return;
    // Lange Listeneinträge mit dem Finger nur am Griff ziehen, damit die Seite scrollbar bleibt.
    if (el.matches('.ord-item') && e.pointerType === 'touch' && !e.target.closest('.ord-grip')) return;
    if (e.target.closest('[data-ix-step]')) return;
    d = { el, x: e.clientX, y: e.clientY, on: false, id: e.pointerId };
  });
  document.addEventListener('pointermove', e => {
    if (!d || e.pointerId !== d.id) return;
    if (!d.on) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < 6) return;
      d.on = true;
      ixUnpick();
      const r = d.el.getBoundingClientRect();
      d.dx = e.clientX - r.left;
      d.dy = e.clientY - r.top;
      d.ghost = d.el.cloneNode(true);
      d.ghost.classList.add('ix-ghost');
      Object.assign(d.ghost.style, { width: r.width + 'px', left: r.left + 'px', top: r.top + 'px' });
      document.body.append(d.ghost);
      d.el.classList.add('ix-dragging');
      d.box = d.el.closest('[data-ix-order],[data-ix-match],fieldset');
    }
    e.preventDefault();
    d.ghost.style.left = e.clientX - d.dx + 'px';
    d.ghost.style.top = e.clientY - d.dy + 'px';
    d.ghost.hidden = true;
    const under = document.elementFromPoint(e.clientX, e.clientY);
    d.ghost.hidden = false;
    d.under = under;
    document.querySelectorAll('.is-over').forEach(x => x.classList.remove('is-over'));
    if (!under) return;
    if (d.el.matches('[data-ix-item]')) {
      // Ordnen: live umstellen
      const box = d.box;
      if (box.dataset.mode === 'chips') {
        const zone = under.closest('[data-ix-zone]');
        if (!zone || !box.contains(zone)) return;
        const t = under.closest('[data-ix-item]');
        if (t && t !== d.el && zone.contains(t)) {
          const tr = t.getBoundingClientRect();
          zone.insertBefore(d.el, e.clientX < tr.left + tr.width / 2 ? t : t.nextSibling);
        } else if (!t) zone.append(d.el);
      } else {
        const t = under.closest('[data-ix-item]');
        if (t && t !== d.el && box.contains(t)) {
          const tr = t.getBoundingClientRect();
          box.insertBefore(d.el, e.clientY < tr.top + tr.height / 2 ? t : t.nextSibling);
        }
      }
    } else {
      const tgt = d.el.matches('[data-ix-word]') ? under.closest('input.gap') : under.closest('[data-ix-slot],[data-ix-zone="pool"]');
      if (tgt && d.box.contains(tgt)) tgt.classList.add('is-over');
    }
    // am Bildschirmrand mitscrollen
    if (e.clientY < 60) scrollBy(0, -14);
    else if (e.clientY > innerHeight - 60) scrollBy(0, 14);
  }, { passive: false });
  const end = e => {
    if (!d) return;
    const was = d;
    d = null;
    if (!was.on) return;
    ixSuppress = was.el;
    setTimeout(() => (ixSuppress = null), 0);
    was.ghost.remove();
    was.el.classList.remove('ix-dragging');
    document.querySelectorAll('.is-over').forEach(x => x.classList.remove('is-over'));
    if (e.type === 'pointercancel') return;
    if (was.el.matches('[data-ix-item]')) return ixOrderSave(was.box);
    const under = was.under;
    if (!under) return;
    if (was.el.matches('[data-ix-word]')) {
      const input = under.closest('input.gap');
      if (input && was.box.contains(input)) ixFill(input, was.el.dataset.ixWord);
      return;
    }
    const slot = under.closest('[data-ix-slot]');
    const pool = under.closest('[data-ix-zone="pool"]');
    if (slot && was.box.contains(slot)) ixPlace(was.box, slot, was.el);
    else if (pool && was.box.contains(pool)) pool.append(was.el);
    else return;
    ixMatchSave(was.box);
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);
}

/* Nach jedem Aufbau einer Übung prüfen, ob der Kartenstapel mitscrollen darf. */
new MutationObserver(() => {
  if (document.querySelector('.mt-pool')) requestAnimationFrame(() => ixPoolFit());
}).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
addEventListener('resize', () => ixPoolFit());
