/* „Live stellen“: geprüfte Übungen per GitHub-API ins Repository schreiben (grundstock/…); die GitHub Action
   bündelt und veröffentlicht die Seite neu. Kein Backend nötig. Der Zugangs-Token bleibt nur in diesem Browser. */
const LIVE_KEY = 'daje-github-v1';
const LIVE_DEFAULT = { token: '', repo: 'theisjulian/daje', branch: 'main' };
function liveCfg() {
  try {
    return Object.assign({}, LIVE_DEFAULT, JSON.parse(localStorage.getItem(LIVE_KEY) || '{}'));
  } catch (e) {
    return { ...LIVE_DEFAULT };
  }
}
function liveSave(c) {
  try {
    localStorage.setItem(LIVE_KEY, JSON.stringify(c));
  } catch (e) {}
}
function utf8b64(s) {
  const b = new TextEncoder().encode(s);
  let t = '';
  b.forEach(x => (t += String.fromCharCode(x)));
  return btoa(t);
}
/* Verständliche Meldung zu einer GitHub-Antwort. */
async function liveError(r, step) {
  let detail = '';
  try {
    detail = (await r.json()).message || '';
  } catch (e) {}
  const fix = 'Token neu anlegen: github.com → Settings → Developer settings → Fine-grained tokens. Bei „Repository access“ nur „daje“ wählen, bei „Permissions → Repository permissions → Contents“ „Read and write“.';
  if (r.status === 401) return 'Der Token ist ungültig oder abgelaufen. ' + fix;
  if (r.status === 403 && /rate limit/i.test(detail)) return 'GitHub hat zu viele Anfragen gezählt. Bitte in einigen Minuten erneut versuchen.';
  if (r.status === 403) return 'Der Token darf nicht ins Repository schreiben. ' + fix;
  if (r.status === 404) return step === 'repo' ? 'Repository nicht gefunden, oder der Token hat keinen Zugriff darauf. Repository-Name prüfen („theisjulian/daje“). ' + fix : 'Zweig nicht gefunden. Bei „Zweig“ „main“ eintragen.';
  if (r.status === 409 || r.status === 422) return 'GitHub lehnt die Änderung ab' + (detail ? ' („' + detail + '“)' : '') + '. Bitte noch einmal „Live stellen“ tippen.';
  return 'GitHub antwortet mit Fehler ' + r.status + (detail ? ' („' + detail + '“)' : '') + '.';
}
{
  const baseForm = editorFormHTML;
  editorFormHTML = function (item) {
    const c = liveCfg();
    const has = !!c.token;
    return (
      baseForm(item) +
      `<details class="publish-box live-box ed-box" id="live-box"><summary>Im öffentlichen daje-Katalog veröffentlichen (nur Betreiber)</summary>
      <p class="small muted">Schreibt die Übung ins GitHub-Repository von daje. Nach ein bis zwei Minuten ist sie für alle im Katalog.</p>
      <details class="live-access" ${has ? '' : 'open'}><summary>GitHub-Zugang ${has ? '· gespeichert ✓' : '· einmalig einrichten'}</summary>
        <ol class="small live-steps"><li>Auf github.com: Settings → Developer settings → Personal access tokens → <b>Fine-grained tokens</b> → Generate new token.</li><li>Repository access: <b>Only select repositories</b> → <b>daje</b>.</li><li>Permissions → Repository permissions → <b>Contents: Read and write</b>.</li><li>Token kopieren und hier einfügen. Er bleibt nur in diesem Browser.</li></ol>
        <label class="field">Zugangs-Token<input id="live-token" type="password" value="${esc(c.token)}" autocomplete="off" placeholder="github_pat_…"></label>
        <details class="small"><summary>Repository und Zweig</summary>
          <label class="field">Repository<input id="live-repo" value="${esc(c.repo)}" autocomplete="off"></label>
          <label class="field">Zweig<input id="live-branch" value="${esc(c.branch)}" autocomplete="off"></label>
        </details>
        <button class="button secondary" type="button" data-live="check">Zugang prüfen</button>
      </details>
      <button class="button primary" type="button" data-live="push">Live stellen</button>
      <p class="small" id="live-msg" role="status"></p></details>`
    );
  };
  const cfgFromForm = () => {
    const c = liveCfg();
    if ($('live-token')) c.token = $('live-token').value.trim();
    if ($('live-repo')) c.repo = $('live-repo').value.trim() || LIVE_DEFAULT.repo;
    if ($('live-branch')) c.branch = $('live-branch').value.trim() || 'main';
    liveSave(c);
    return c;
  };
  const headers = c => ({ Authorization: 'Bearer ' + c.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' });
  async function checkAccess(c) {
    const r = await fetch(`https://api.github.com/repos/${c.repo}`, { headers: headers(c) });
    if (!r.ok) throw new Error(await liveError(r, 'repo'));
    const b = await fetch(`https://api.github.com/repos/${c.repo}/branches/${encodeURIComponent(c.branch)}`, { headers: headers(c) });
    if (!b.ok) throw new Error(await liveError(b, 'branch'));
  }
  async function check() {
    const msg = $('live-msg'), c = cfgFromForm();
    if (!c.token) return (msg.textContent = 'Bitte zuerst den Token einfügen.');
    msg.textContent = 'Zugang wird geprüft …';
    try {
      await checkAccess(c);
      msg.textContent = 'Zugang funktioniert: Lesen ist möglich. Ob der Token auch schreiben darf, zeigt sich beim ersten „Live stellen“.';
    } catch (e) {
      msg.textContent = e.message;
    }
  }
  async function push() {
    const msg = $('live-msg'), c = cfgFromForm();
    const item = edItem();
    if (!item) return;
    const v = edCommit();
    if (!v.ok) return (msg.textContent = 'Die Übung ist noch nicht fertig: Bitte die Punkte oben unter „noch offen“ ergänzen.');
    if (item.payload.sources.some(s => s.rights === 'needs_review'))
      return (msg.textContent = 'Vorher bitte Quelle und Rechte bestätigen.'), edShowRights();
    if (!c.token) {
      const a = document.querySelector('#live-box .live-access');
      if (a) a.open = true;
      return (msg.textContent = 'Bitte zuerst den GitHub-Zugang einrichten (Token einfügen).');
    }
    // Auch im eigenen Katalog freigeben, damit Vorschau und Katalog übereinstimmen.
    if (item.status !== 'published') {
      item.status = 'published';
      saveEditorState();
    }
    const x = item.payload;
    const dir = x.kind === 'listening' ? 'listening' : 'vocabulary';
    const url = `https://api.github.com/repos/${c.repo}/contents/grundstock/${dir}/${x.id}.json`;
    msg.textContent = 'Wird übertragen …';
    try {
      await checkAccess(c);
      const send = async () => {
        let sha;
        const r0 = await fetch(url + '?ref=' + encodeURIComponent(c.branch), { headers: headers(c) });
        if (r0.ok) sha = (await r0.json()).sha;
        else if (r0.status !== 404) throw new Error(await liveError(r0, 'file'));
        const body = { message: `Inhalt: ${x.title}`, content: utf8b64(JSON.stringify(x, null, 2) + '\n'), branch: c.branch };
        if (sha) body.sha = sha;
        return fetch(url, { method: 'PUT', headers: headers(c), body: JSON.stringify(body) });
      };
      let r = await send();
      if (r.status === 409 || r.status === 422) r = await send(); // gleichzeitige Änderung: einmal neu versuchen
      if (!r.ok) throw new Error(await liveError(r, 'file'));
      msg.innerHTML = `Übertragen ✓ Die Seite wird jetzt neu veröffentlicht und zeigt die Übung in ein bis zwei Minuten. <a href="https://github.com/${esc(c.repo)}/actions" target="_blank" rel="noopener">Fortschritt ansehen</a>`;
    } catch (e) {
      msg.textContent = 'Nicht übertragen: ' + e.message;
    }
  }
  document.addEventListener('input', e => {
    if (['live-token', 'live-repo', 'live-branch'].includes(e.target.id)) cfgFromForm();
  });
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-live]');
    if (!b) return;
    if (b.dataset.live === 'check') check();
    else if (b.dataset.live === 'push') push();
  });
}
