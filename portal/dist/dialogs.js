/*
 * Gemeinsames Verhalten aller Dialoge und Blätter (<dialog>):
 *  - Beim Öffnen mit Finger oder Maus bekommt der Dialog selbst den Fokus, nicht der erste Knopf.
 *    Sonst zeigt Safari einen Fokusrahmen um „Schließen“ oder die erste Kachel. Mit der Tastatur geöffnet
 *    bleibt das gewohnte Verhalten (erster Knopf hat den Fokus).
 *  - Solange ein modaler Dialog offen ist, scrollt die Seite dahinter nicht (Klasse dlg-lock).
 */
(function () {
  if (typeof HTMLDialogElement === 'undefined') return;
  let keyboard = false;
  addEventListener('keydown', e => { if (!e.metaKey && !e.ctrlKey) keyboard = true; }, true);
  addEventListener('pointerdown', () => { keyboard = false; }, true);
  const anyModal = () => {
    try {
      return !!document.querySelector('dialog[open]:modal');
    } catch (e) {
      return !!document.querySelector('dialog[open]'); // ältere Browser ohne :modal
    }
  };
  const lock = () => document.documentElement.classList.toggle('dlg-lock', anyModal());
  const show = HTMLDialogElement.prototype.showModal;
  HTMLDialogElement.prototype.showModal = function () {
    const r = show.apply(this, arguments);
    if (!keyboard) {
      if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '-1');
      const a = document.activeElement;
      const typing = a && this.contains(a) && a.matches('input:not([type=checkbox]):not([type=radio]), textarea, select');
      if (!typing) this.focus({ preventScroll: true });
    }
    lock();
    if (!this.__dlgLock) {
      this.__dlgLock = true;
      this.addEventListener('close', () => setTimeout(lock, 0));
    }
    return r;
  };
})();
