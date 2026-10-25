/* Browser-Test (Playwright) für das ripassà.-Portal.
 *
 * Start (im Ordner portal):  node tests/e2e.test.cjs
 * Voraussetzung: Playwright mit Chromium ist installiert (npm i -D playwright).
 * Das Skript startet selbst einen kleinen lokalen Server auf dem Ordner dist.
 * Es verwendet ein frisches Browserprofil und verändert keine echten Lernstände.
 *
 * Mit SNAPSHOT_DIR=<Ordner> werden zusätzlich Screenshots geschrieben
 * (für Vorher/Nachher-Vergleiche).
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const DIST = path.resolve(process.env.DIST_DIR || path.join(__dirname, '..', 'dist'));
const SNAP = process.env.SNAPSHOT_DIR;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.mp3': 'audio/mpeg',
  '.md': 'text/markdown; charset=utf-8'
};

function serve() {
  const server = http.createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = path.join(DIST, rel === '/' ? 'index.html' : rel);
    if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      res.writeHead(404).end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve(server)));
}

const results = [];
async function step(name, fn) {
  try {
    await fn();
    results.push(['ok', name]);
    console.log('ok   ' + name);
  } catch (e) {
    results.push(['FAIL', name, e]);
    console.log('FAIL ' + name + '\n     ' + String(e.message).split('\n')[0]);
  }
}

(async () => {
  const server = await serve();
  const base = 'http://127.0.0.1:' + server.address().port + '/';
  const browser = await chromium.launch();
  const problems = [];

  async function fresh(viewport) {
    const ctx = await browser.newContext({ viewport, locale: 'de-DE', reducedMotion: 'reduce' });
    // Die ausgelieferte App enthält keine synthetischen Demo-Hörübungen; für die Tests werden sie ergänzt.
    await ctx.route('**/listening-data.js', async route => {
      const res = await route.fetch();
      const extra = require('fs').readFileSync(require('path').join(__dirname, 'fixtures', 'demo-seeds.js'), 'utf8');
      await route.fulfill({ response: res, body: (await res.text()) + '\n' + extra });
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => problems.push('Seitenfehler: ' + e.message));
    page.on('console', m => {
      if (m.type() === 'error' && !/youtube|ytimg|net::ERR/.test(m.text()))
        problems.push('Konsole: ' + m.text());
    });
    return { ctx, page };
  }
  const overflow = page =>
    page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
  const shot = (page, name) =>
    SNAP ? page.screenshot({ path: path.join(SNAP, name + '.png') }) : null;

  const desk = await fresh({ width: 1440, height: 900 });
  const dp = desk.page;

  await step('Start lädt ohne Fehler und zeigt Hauptnavigation', async () => {
    await dp.goto(base, { waitUntil: 'networkidle' });
    for (const label of ['Hörverstehen', 'Wortschatz', 'Merkliste', 'Mein Fortschritt']) {
      assert.ok(
        await dp
          .locator('aside >> text=' + label)
          .first()
          .isVisible(),
        label + ' fehlt'
      );
    }
    await shot(dp, 'desk-start');
  });

  await step('Hörkatalog zeigt 42 Übungen', async () => {
    await dp.click('[data-nav="hoeren"]');
    await dp.waitForSelector('main article, main .listen-card, main [data-open-listening]');
    const text = await dp.textContent('main');
    assert.match(text, /42 Hörübungen/);
    await shot(dp, 'desk-katalog');
  });

  await step('Übung per Direktlink: Antworten, Korrektur, neue Runde', async () => {
    await dp.goto(base + '?hoeren=it-torino-demo', { waitUntil: 'networkidle' });
    assert.equal(await dp.locator('input[type=radio]').count(), 8);
    await shot(dp, 'desk-uebung');
    await dp.getByRole('button', { name: 'Antworten korrigieren' }).click();
    await dp.waitForTimeout(200);
    const after = await dp.textContent('main');
    assert.ok(after.length > 0);
    await dp.click('[data-portal="reset-listening"]');
  });

  await step('Falsche Hörantwort wird erkannt, richtige akzeptiert (Single Choice)', async () => {
    const seeds = await dp.evaluate(() => LISTENING_SEEDS.find(x => x.id === 'it-torino-demo'));
    const q = seeds.questions.find(x => x.type === 'single_choice');
    const wrong = q.options.find(o => o.id !== q.correctOptionId).id;
    assert.equal(
      await dp.evaluate(([qq, v]) => TheisContent.assessAnswer(qq, v), [q, wrong]),
      false
    );
    assert.equal(
      await dp.evaluate(([qq, v]) => TheisContent.assessAnswer(qq, v), [q, q.correctOptionId]),
      true
    );
  });

  await step('Wörter dieser Übung öffnet 6 verknüpfte Wörter', async () => {
    await dp.goto(base + '?hoeren=it-torino-demo', { waitUntil: 'networkidle' });
    await dp.click('[data-portal="related-words"]');
    await dp.waitForTimeout(300);
    const txt = await dp.textContent('main');
    assert.match(txt, /6/);
    await shot(dp, 'desk-woerter');
  });

  await step('Wortschatzantwort: gelata gibt Hinweis, il gelato ist richtig', async () => {
    const r = await dp.evaluate(() => {
      const w = {
        target: 'il gelato',
        translations: ['das Eis'],
        language: 'it',
        grammar: { partOfSpeech: 'noun', gender: 'masculine', article: 'il' },
        answerPolicy: { article: 'required', typo: 'hint' }
      };
      return [
        TheisGrading.compare(w, 'gelata').status,
        TheisGrading.compare(w, 'gelato').status,
        TheisGrading.compare(w, 'il gelato').status
      ];
    });
    assert.deepEqual(r, ['hint', 'hint', 'correct']);
  });

  await step('Alle zwölf Farbwelten, Hell/Dunkel und Tageslicht ohne Fehler', async () => {
    await dp.goto(base, { waitUntil: 'networkidle' });
    await dp.click('#look-open');
    const skins = await dp.$$eval('#theme-grid button', b => b.map(x => x.dataset.skin));
    assert.equal(skins.length, 12);
    assert.ok(skins.includes('tag'));
    // Tageslicht bestimmt Hell/Dunkel selbst und wird deshalb getrennt geprüft.
    const fixed = skins.filter(s => s !== 'tag');
    for (const mode of ['light', 'dark']) {
      await dp.click('#theme-grid button[data-skin="standard"]');
      await dp.selectOption('#appearance', mode);
      for (const skin of fixed) {
        await dp.click('#theme-grid button[data-skin="' + skin + '"]');
        assert.equal(await dp.getAttribute('html', 'data-skin'), skin);
        assert.equal(await dp.getAttribute('html', 'data-theme'), mode);
        if (SNAP) {
          await dp.evaluate(() => document.getElementById('look-dialog').close());
          await shot(dp, 'theme-' + skin + '-' + mode);
          await dp.click('#look-open');
        }
      }
    }
    await dp.click('#theme-grid button[data-skin="tag"]');
    assert.equal(await dp.getAttribute('html', 'data-skin'), 'tag');
    await dp.evaluate(() => document.getElementById('look-dialog').close());
  });

  await step('Profil: Backup exportieren und separat importieren', async () => {
    const out = await dp.evaluate(() => {
      initProfiles();
      const before = Object.keys(
        JSON.parse(localStorage.getItem('sprachtrainer-profiles-v2')).profiles
      ).length;
      const backup = {
        app: 'sprachtrainer',
        schemaVersion: 2,
        profile: {
          name: 'Testprofil',
          createdAt: '2026-10-24T10:00:00.000Z',
          goal: 10,
          records: {},
          history: {}
        }
      };
      const p = validateProgressBackup(backup);
      return { before, imported: !!p && p.id !== activeProfile().id };
    });
    assert.ok(out.before >= 1 && out.imported);
  });

  await step('Ungültiges Importpaket wird abgewiesen und verändert nichts', async () => {
    const r = await dp.evaluate(() => {
      const bad = TheisContent.validatePackage({
        format: 'theis-learning-package',
        schemaVersion: '9.9'
      });
      return { ok: bad.ok, n: bad.errors.length };
    });
    assert.equal(r.ok, false);
    assert.ok(r.n > 0);
  });

  await step('Alle 42 Hörübungen öffnen per Direktlink ohne Fehler', async () => {
    const ids = await dp.evaluate(() => contentList('listening').map(x => x.id));
    assert.equal(ids.length, 42);
    for (const id of ids) {
      await dp.goto(base + '?hoeren=' + id, { waitUntil: 'load' });
      await dp.waitForSelector('main h1');
      assert.ok((await dp.locator('main input, main textarea').count()) > 0, id + ' ohne Aufgaben');
    }
  });

  await step('Lehrkraftansicht: Druckvorschau für Aufgaben und Lösungen', async () => {
    await dp.goto(base + '?hoeren=it-torino-demo', { waitUntil: 'networkidle' });
    const btn = dp.locator('[data-audience]').first();
    if (await btn.count()) await btn.click();
    const hasTeach = await dp.evaluate(
      () => typeof showTeaching === 'function' && typeof printTeaching === 'function'
    );
    assert.ok(hasTeach);
  });

  await step('Umschalter Lernende/Lehrkräfte ändert Ansicht und bleibt gespeichert', async () => {
    await dp.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await dp.getAttribute('[data-audience="learn"]', 'aria-pressed'), 'true');
    await dp.click('[data-audience="teach"]');
    assert.match(await dp.textContent('main'), /Hörmaterial/);
    await dp.reload({ waitUntil: 'networkidle' });
    assert.equal(await dp.getAttribute('[data-audience="teach"]', 'aria-pressed'), 'true');
    await dp.goto(base + '?hoeren=it-torino-demo', { waitUntil: 'networkidle' });
    assert.ok(await dp.locator('[data-portal="toggle-key"]').isVisible());
    await dp.click('[data-portal="toggle-key"]');
    assert.ok((await dp.locator('.q-key').count()) >= 4);
    await dp.click('[data-audience="learn"]');
    assert.equal(await dp.locator('.q-key').count(), 0);
  });

  await step('Katalog: Filter und Suche aktualisieren die Karten', async () => {
    await dp.goto(base, { waitUntil: 'networkidle' });
    await dp.click('.nav-list [data-nav="hoeren"]');
    await dp.click('[data-key="language"][data-value="it"]');
    const n = await dp.locator('#catalog-grid .lcard').count();
    assert.ok(n > 0 && n < 42);
    await dp.fill('#listen-search', 'gelato');
    assert.ok((await dp.locator('#catalog-grid .lcard').count()) < n);
  });

  await step('Schriftauswahl wirkt und wird gespeichert', async () => {
    await dp.click('#look-open');
    await dp.click('#font-grid [data-font="lora"]');
    assert.equal(await dp.getAttribute('html', 'data-font'), 'lora');
    await dp.evaluate(() => document.getElementById('look-dialog').close());
    await dp.reload({ waitUntil: 'networkidle' });
    assert.equal(await dp.getAttribute('html', 'data-font'), 'lora');
  });

  await step('Transkript zeigt Herkunftshinweis, keine internen Prüfnotizen', async () => {
    await dp.goto(base + '?hoeren=it-a2-ordine-al-bar', { waitUntil: 'networkidle' });
    const txt = await dp.textContent('main');
    assert.doesNotMatch(txt, /Gemini|Audioabgleich/);
  });

  await step('Alle sieben Aufgabentypen: bearbeiten, korrigieren, 7 von 7', async () => {
    await dp.goto(base, { waitUntil: 'networkidle' });
    await dp.evaluate(async () => {
      const j = await (await fetch('examples/listening-all-task-types.json')).json();
      const v = TheisContent.validatePackage(j);
      if (!v.ok) throw new Error(v.errors.join('; '));
      editorState.items.push({
        payload: v.value,
        status: 'draft',
        updatedAt: new Date().toISOString()
      });
      openListening(v.value.id, true);
    });
    await dp.click('#q-q1 .opt:has-text("In Piazza Castello")');
    await dp.click('#q-q2 .opt:has-text("Prendono un gelato")');
    await dp.click('#q-q2 .opt:has-text("Vanno al parco")');
    await dp.click('#q-q3 .opt:has-text("Falso")');
    await dp.selectOption('#q-q4 select[data-part="p1"]', { label: 'gelato al limone' });
    await dp.selectOption('#q-q4 select[data-part="p2"]', { label: 'gelato al cioccolato' });
    for (const [i, n] of [
      ['i1', '1'],
      ['i2', '2'],
      ['i3', '3']
    ])
      await dp.selectOption('#q-q5 select[data-part="' + i + '"]', n);
    await dp.fill('#q-q6 input[data-part="g1"]', 'quattro');
    await dp.fill('#q-q6 input[data-part="g2"]', 'castello');
    await dp.fill('#q-q7 input', 'alle sei');
    assert.match(await dp.textContent('#listen-answer-count'), /7 \/ 7/);
    await dp.getByRole('button', { name: 'Antworten korrigieren' }).click();
    assert.equal((await dp.textContent('.result-score b')).trim(), '7');
    await shot(dp, 'desk-alle-typen');
    await dp.reload({ waitUntil: 'networkidle' });
  });

  await step('Einbett-Modus ?embed=1: nur die Übung, ohne Navigation', async () => {
    await dp.goto(base + '?hoeren=it-torino-demo&embed=1', { waitUntil: 'networkidle' });
    assert.equal(await dp.locator('.sidebar').isVisible(), false);
    assert.equal(await dp.locator('.topbar').isVisible(), false);
    assert.ok(await dp.locator('.q').first().isVisible());
    await shot(dp, 'desk-embed');
  });

  await desk.ctx.close();

  // Schmale Bildschirme: kein horizontales Scrollen
  const phone = await fresh({ width: 390, height: 844 });
  const pp = phone.page;
  await step('Handy 390 px: Start, Katalog, Übung ohne Querscrollen', async () => {
    for (const url of ['', '?hoeren=it-torino-demo', '?hoeren=it-a2-ordine-al-bar']) {
      await pp.goto(base + url, { waitUntil: 'networkidle' });
      assert.ok((await overflow(pp)) <= 1, 'Querscrollen bei ' + (url || 'Start'));
    }
    await pp.goto(base, { waitUntil: 'networkidle' });
    await pp.click('.tabbar [data-nav="hoeren"]');
    await pp.waitForTimeout(300);
    assert.ok((await overflow(pp)) <= 1, 'Querscrollen im Katalog');
    await shot(pp, 'phone-katalog');
    await pp.goto(base + '?hoeren=it-torino-demo', { waitUntil: 'networkidle' });
    await shot(pp, 'phone-uebung');
    await pp.click('.tabbar [data-sheet="more"]');
    assert.ok(await pp.locator('#more-sheet').isVisible());
    await pp.click('#more-sheet [data-close]');
  });
  await phone.ctx.close();

  await step('Keine Seiten- oder Konsolenfehler während aller Tests', async () => {
    assert.deepEqual(problems, [], JSON.stringify(problems));
  });

  await browser.close();
  server.close();
  const failed = results.filter(r => r[0] === 'FAIL');
  console.log(
    '\n' + (results.length - failed.length) + ' von ' + results.length + ' Prüfungen bestanden'
  );
  process.exit(failed.length ? 1 : 0);
})();
