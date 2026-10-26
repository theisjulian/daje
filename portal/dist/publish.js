/* „Live stellen“: gepruefte Pakete per GitHub-API ins Repository schreiben; eine GitHub Action veroeffentlicht die Seite neu. Kein Backend noetig. */
const LIVE_KEY = 'daje-github-v1';
function liveCfg() {
  try { return Object.assign({ token: '', repo: 'theisjulian/daje', branch: 'main' }, JSON.parse(localStorage.getItem(LIVE_KEY) || '{}')); } catch (e) { return { token: '', repo: 'theisjulian/daje', branch: 'main' }; }
}
function liveSave(c) { try { localStorage.setItem(LIVE_KEY, JSON.stringify(c)); } catch (e) {} }
function utf8b64(s) { const b = new TextEncoder().encode(s); let t = ''; b.forEach(x => (t += String.fromCharCode(x))); return btoa(t); }
{
  const baseForm = editorFormHTML;
  editorFormHTML = function (item) {
    const c = liveCfg();
    const ok = item.status === 'published';
    return baseForm(item) + `<details class="publish-box live-box ed-box"><summary>Im öffentlichen daje-Katalog veröffentlichen (nur Betreiber)</summary>
      <p class="small muted">Schreibt die Übung in das GitHub-Repository von daje. Nach etwa einer Minute ist sie für alle online. Dafür braucht es einen GitHub-Zugang mit Schreibrecht. ${ok ? '' : '<b>Zuerst „Im eigenen Katalog zeigen“ wählen.</b>'}</p>
      <details><summary>GitHub-Zugang (einmalig, bleibt nur in diesem Browser)</summary>
        <label class="field">Repository<input id="live-repo" value="${esc(c.repo)}" autocomplete="off"></label>
        <label class="field">Zweig<input id="live-branch" value="${esc(c.branch)}" autocomplete="off"></label>
        <label class="field">Zugangs-Token (fine-grained, nur dieses Repo, „Contents: Read and write“)<input id="live-token" type="password" value="${esc(c.token)}" autocomplete="off"></label>
        <button class="button secondary" type="button" data-live="save">Zugang speichern</button>
      </details>
      <button class="button primary" type="button" data-live="push" ${ok ? '' : 'disabled'}>Live stellen</button>
      <p class="small" id="live-msg" role="status"></p></details>`;
  };
  async function push() {
    const msg = $('live-msg'), c = liveCfg();
    const x = editorState.items.find(i => i.payload?.id === studioSelection);
    if (!x || x.status !== 'published') return;
    if (!c.token) { msg.textContent = 'Bitte zuerst den GitHub-Zugang eintragen.'; return; }
    const dir = x.payload.kind === 'listening' ? 'listening' : 'vocabulary';
    const url = `https://api.github.com/repos/${c.repo}/contents/grundstock/${dir}/${x.payload.id}.json`;
    const h = { Authorization: 'Bearer ' + c.token, Accept: 'application/vnd.github+json' };
    msg.textContent = 'Wird übertragen …';
    try {
      let sha;
      const r0 = await fetch(url + '?ref=' + encodeURIComponent(c.branch), { headers: h });
      if (r0.ok) sha = (await r0.json()).sha; else if (r0.status !== 404) throw new Error('Zugriff abgelehnt (' + r0.status + '). Token und Repository prüfen.');
      const body = { message: `Inhalt: ${x.payload.title}`, content: utf8b64(JSON.stringify(x.payload, null, 2) + '\n'), branch: c.branch };
      if (sha) body.sha = sha;
      const r = await fetch(url, { method: 'PUT', headers: h, body: JSON.stringify(body) });
      if (!r.ok) throw new Error('GitHub antwortet mit ' + r.status + '.');
      msg.textContent = 'Übertragen. In etwa einer Minute ist die Seite aktualisiert.';
    } catch (e) { msg.textContent = 'Nicht übertragen: ' + e.message; }
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-live]');
    if (!b) return;
    if (b.dataset.live === 'save') {
      liveSave({ repo: $('live-repo').value.trim(), branch: $('live-branch').value.trim() || 'main', token: $('live-token').value.trim() });
      $('live-msg').textContent = 'Zugang gespeichert.';
    } else if (b.dataset.live === 'push') push();
  });
}
