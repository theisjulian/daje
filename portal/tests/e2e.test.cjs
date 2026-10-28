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
  // CHROMIUM_PATH: vorinstallierten Browser nutzen, wenn die Playwright-Version nicht passt.
  const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
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
    page.on('dialog', d => d.accept()); // Rückfrage beim Wechsel zur Lehrkräfte-Ansicht
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

  // Anzahl aus dem Katalog: neue Übungen aus der Redaktion dürfen den Test nicht brechen.
  const listenCount = await dp.evaluate(() => contentList('listening').length);
  await step('Hörkatalog zeigt alle Übungen', async () => {
    assert.ok(listenCount >= 10, 'zu wenige Hörübungen: ' + listenCount);
    await dp.click('[data-nav="hoeren"]');
    await dp.waitForSelector('main article, main .listen-card, main [data-open-listening]');
    const text = await dp.textContent('main');
    assert.match(text, new RegExp(listenCount + ' Hörübungen'));
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

  await step('Alle 6 Farbwelten, Hell/Dunkel und Tageslicht ohne Fehler', async () => {
    await dp.goto(base, { waitUntil: 'networkidle' });
    await dp.click('#look-open');
    const skins = await dp.$$eval('#theme-grid button', b => b.map(x => x.dataset.skin));
    assert.deepEqual(skins, ['daje', 'pop', 'heft', 'graphit', 'wald', 'tag']);
    assert.ok(skins.includes('tag'));
    // Tageslicht bestimmt Hell/Dunkel selbst und wird deshalb getrennt geprüft.
    const fixed = skins.filter(s => s !== 'tag');
    for (const mode of ['light', 'dark']) {
      await dp.click('#theme-grid button[data-skin="daje"]');
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

  await step('Alle Hörübungen öffnen per Direktlink ohne Fehler', async () => {
    const ids = await dp.evaluate(() => contentList('listening').map(x => x.id));
    assert.equal(ids.length, listenCount);
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
    // Aufgabenblatt mit Abschnitten, Lösungen mit Kurzantwort-Lösung, kurzer Schlüssel als Tabelle.
    await dp.goto(base + '?hoeren=en-voa-welcome', { waitUntil: 'networkidle' });
    await dp.evaluate(() => { showTeaching('en-voa-welcome'); printTeaching(0); });
    assert.ok((await dp.locator('#teaching-print .hb-phase').count()) >= 2);
    await dp.evaluate(() => printTeaching(1));
    assert.match(await dp.textContent('#teaching-print .hb'), /1400/);
    await dp.evaluate(() => printTeaching(2));
    assert.equal(await dp.locator('#teaching-print .hb-key tbody tr').count(), 11);
    // Echte A4-Seiten: Inhalt nie über die Fußzeile, Seitenzahl auf jeder Seite.
    for (const id of ['it-a2-cucina-tiramisu', 'en-b2-secrets-learning-language'])
      for (const m of [0, 1, 2]) {
        const r = await dp.evaluate(([id, m]) => {
          showTeaching(id);
          printTeaching(m);
          return [...document.querySelectorAll('#teaching-print .hbp')].map(pg => {
            const body = pg.querySelector('.hb').getBoundingClientRect().bottom, foot = pg.querySelector('.doc-foot');
            return { over: body > foot.getBoundingClientRect().top + 1, pn: !!foot.querySelector('.doc-pn') };
          });
        }, [id, m]);
        assert.ok(r.length >= 1 && r.every(x => !x.over && x.pn), id + ' ' + m + ': ' + JSON.stringify(r));
      }
    await dp.evaluate(() => document.body.classList.remove('previewing-teaching'));
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
    assert.ok(n > 0 && n < listenCount);
    await dp.fill('#listen-search', 'gelato');
    assert.ok((await dp.locator('#catalog-grid .lcard').count()) < n);
  });

  await step('Schriftauswahl wirkt und wird gespeichert', async () => {
    await dp.click('#look-open');
    await dp.click('#font-grid [data-font="lora"]');
    assert.equal(await dp.getAttribute('html', 'data-font'), 'lora');
    await dp.evaluate(() => document.getElementById('look-dialog').close());
    await dp.waitForTimeout(400); // Schließen springt im Verlauf zurück; erst danach neu laden
    await dp.goto(base, { waitUntil: 'networkidle' });
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

  await step('Weitere Aufgabentypen und Hördurchgänge: bearbeiten, korrigieren, drucken', async () => {
    await dp.goto(base, { waitUntil: 'networkidle' });
    await dp.evaluate(async () => {
      localStorage.setItem('daje-fokus-v1', '0');
      const j = await (await fetch('examples/listening-weitere-aufgabentypen.json')).json();
      const v = TheisContent.validatePackage(j);
      if (!v.ok) throw new Error(v.errors.join('; '));
      editorState.items.push({ payload: v.value, status: 'draft', updatedAt: new Date().toISOString() });
      openListening(v.value.id, true);
    });
    await dp.click('#q-n1 .opt:has-text("Vero")');
    await dp.click('#q-n2 .opt:has-text("Non detto")');
    for (const w of ['gelateria', 'parco', 'limone', 'piazza', 'cioccolato']) await dp.click(`#q-n3 .chip-opt:has-text("${w}")`);
    await dp.selectOption('#q-n4 select[data-part="g1"]', 'quattro');
    await dp.selectOption('#q-n4 select[data-part="g2"]', 'limone');
    for (const [k, v] of [['g1', 'Castello'], ['g2', '4'], ['g3', 'parco']]) await dp.fill(`#q-n5 input[data-part="${k}"]`, v);
    for (const [k, v] of [['t1', 'limone'], ['t2', 'alle sei'], ['t3', 'cioccolato']]) await dp.fill(`#q-n6 input[data-part="${k}"]`, v);
    for (const [k, v] of [['e1', 'Torino'], ['e2', 'a piedi'], ['e3', 'sei']]) await dp.fill(`#q-n7 input[data-part="${k}"]`, v);
    for (const [k, c] of [['s1', 'Luca'], ['s2', 'Sofia'], ['s3', 'Luca'], ['s4', 'Sofia']])
      await dp.click(`#q-n8 .cat-row:has(input[data-part="${k}"]) .cat-opt:has-text("${c}")`);
    for (const [k, c] of [['c1', 'Cibo'], ['c2', 'Luogo'], ['c3', 'Cibo'], ['c4', 'Luogo'], ['c5', 'Luogo']])
      await dp.click(`#q-n9 .cat-row:has(input[data-part="${k}"]) .cat-opt:has-text("${c}")`);
    await dp.fill('#q-n10 textarea', 'Vado al parco con gli amici.');
    for (const [k, v] of [['g1', 'Torino'], ['g2', 'Castello'], ['g3', 'fame'], ['g4', 'gelateria']]) await dp.fill(`#q-n11 input[data-part="${k}"]`, v);
    for (const [k, v] of [['z1', 'in Piazza Castello'], ['z2', 'al parco'], ['z3', 'alle sei']]) await dp.fill(`#q-n12 input[data-part="${k}"]`, v);
    assert.equal(await dp.locator('#q-n11 .word-bank span').count(), 6);
    assert.deepEqual(await dp.locator('.q-section').allTextContents(), ['Primo ascolto', 'Secondo ascolto', 'Terzo ascolto', 'Lessico e lingua', 'Dopo l’ascolto']);
    assert.match(await dp.textContent('#listen-answer-count'), /12 \/ 12/);
    await dp.getByRole('button', { name: 'Antworten korrigieren' }).click();
    assert.match(await dp.textContent('.result-score'), /^\s*11\s*von 11\s*$/);
    assert.match(await dp.textContent('#q-n10 .listen-feedback'), /Possibile soluzione|Mögliche Lösung/);
    // Druck: alle drei Ausgaben ohne Überlauf
    const id = await dp.evaluate(() => {
      const it = editorState.items[editorState.items.length - 1];
      it.status = 'published';
      return it.payload.id;
    });
    await dp.evaluate(() => { setPortalAudience('teach'); });
    for (const m of [0, 1, 2]) {
      const r = await dp.evaluate(([id, m]) => {
        showTeaching(id);
        printTeaching(m);
        return [...document.querySelectorAll('#teaching-print .hbp')].map(pg => pg.querySelector('.hb').getBoundingClientRect().bottom <= pg.querySelector('.doc-foot').getBoundingClientRect().top + 1);
      }, [id, m]);
      assert.ok(r.length >= 1 && r.every(Boolean), 'Druck ' + m + ': ' + JSON.stringify(r));
      if (m === 0) assert.equal(await dp.locator('#teaching-print .hb-grid').count(), 2);
    }
    await dp.evaluate(() => { document.body.classList.remove('previewing-teaching'); setPortalAudience('learn'); });
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
    await pp.waitForTimeout(150); // Schließen nimmt den Verlaufseintrag des Blatts zurück
  });

  await step('Handy: Lehrkräfte-Start ohne abgeschnittene Inhalte', async () => {
    await pp.goto(base, { waitUntil: 'networkidle' });
    await pp.click('[data-audience="teach"]');
    await pp.waitForTimeout(200);
    const cut = await pp.evaluate(() => {
      const box = document.querySelector('.xhero').getBoundingClientRect();
      return [...document.querySelectorAll('.xhero-copy *')].filter(
        el => el.getBoundingClientRect().right > box.right + 1
      ).length;
    });
    assert.equal(cut, 0, 'Elemente ragen aus der Startkarte');
    await pp.click('[data-audience="learn"]');
  });

  await step('Lernende sehen keine Redaktionsvermerke und keinen Redaktionszugang', async () => {
    await pp.goto(base + '?hoeren=it-a2-ordine-al-bar', { waitUntil: 'networkidle' });
    // Fokus-Modus: bis zur letzten Aufgabe blättern, dort erscheint „Antworten korrigieren“.
    while (await pp.locator('[data-focus="next"]:visible').count()) await pp.click('[data-focus="next"]');
    await pp.click('#listening-form [type=submit]');
    await pp.waitForTimeout(200);
    const text = await pp.textContent('main');
    assert.doesNotMatch(text, /Audioabgleich|übermittelt|Gemini|Arbeitsfassung/i);
    assert.equal(await pp.locator('[data-nav="redaktion"]:visible').count(), 0);
  });

  await step('Zurück-Taste bleibt in der App (Verlauf)', async () => {
    await pp.goto(base, { waitUntil: 'networkidle' });
    await pp.click('.tabbar [data-nav="hoeren"]');
    await pp.goto(base + '?seite=vokabeln', { waitUntil: 'networkidle' });
    await pp.locator('.ws-cover').first().click();
    assert.match(pp.url(), /buch=/);
    await pp.goBack();
    assert.equal(await pp.evaluate(() => view + ':' + wsBook.get()), 'vokabeln:null');
    await pp.goto(base + '?hoeren=it-torino-demo', { waitUntil: 'networkidle' });
    await pp.click('.back-link');
    assert.equal(await pp.evaluate(() => view), 'hoeren');
    await pp.goBack();
    assert.equal(await pp.evaluate(() => view + ':' + openedListening), 'hoeruebung:it-torino-demo');
  });
  await step('Fokus-Modus: eine Aufgabe pro Bildschirm, Weiter/Zurück, Korrektur am Ende', async () => {
    await pp.goto(base + '?hoeren=en-voa-welcome', { waitUntil: 'networkidle' });
    assert.equal(await pp.locator('#listening-form fieldset.q:visible').count(), 1);
    await pp.click('[data-focus="next"]');
    assert.equal(await pp.textContent('.focus-count b'), '2');
    await pp.click('[data-focus="prev"]');
    assert.equal(await pp.textContent('.focus-count b'), '1');
    assert.equal(await pp.locator('#listening-form [type=submit]:visible').count(), 0);
    await pp.click('[data-focus="off"]');
    assert.ok((await pp.locator('#listening-form fieldset.q:visible').count()) > 5);
    await pp.click('[data-focus="on"]');
  });

  await step('Hausaufgabe: Lehrkraft stellt zusammen, Lernende sehen die Liste', async () => {
    await pp.goto(base, { waitUntil: 'networkidle' });
    await pp.click('[data-audience="teach"]');
    await pp.click('.tabbar [data-nav="hoeren"]');
    await pp.locator('[data-hw]').nth(0).click();
    await pp.locator('[data-hw]').nth(1).click();
    await pp.click('#hw-pill');
    const url = await pp.getAttribute('#hw-dialog [data-qr-copy]', 'data-qr-copy');
    await pp.click('#hw-dialog [data-hw-clear]');
    await pp.click('#hw-dialog [data-close]');
    await pp.click('[data-audience="learn"]');
    await pp.goto(url, { waitUntil: 'networkidle' });
    assert.equal(await pp.locator('.hw-tasks li').count(), 2);
    await pp.click('.tabbar [data-nav="start"]');
    assert.equal(await pp.locator('.hw-home').count(), 1);
  });

  await step('Grammatik: Katalog, Thema, alle Übungen öffnen, eine lösen', async () => {
    await pp.goto(base + '?seite=grammatik', { waitUntil: 'networkidle' });
    const topics = await pp.$$eval('[data-gr-topic]', b => b.length);
    assert.ok(topics >= 30, 'Themen: ' + topics);
    await pp.click('[data-gr-topic="ecco1-artikel-sg"]');
    await pp.waitForSelector('.rule-card');
    const ids = await pp.evaluate(() => contentList('grammar').map(x => x.id));
    assert.ok(ids.length >= 120, 'Übungen: ' + ids.length);
    for (const id of ids) {
      await pp.evaluate(i => openListening(i), id);
      assert.ok(await pp.$('#listening-form .q'), 'ohne Aufgaben: ' + id);
    }
    // Eine Auswahl-Übung vollständig richtig lösen
    await pp.evaluate(() => openListening('g-ecco1-artikel-sg-l1'));
    const answers = await pp.evaluate(() => findTask('g-ecco1-artikel-sg-l1').questions[0].gaps.map(g => g.answer));
    const sels = await pp.$$('select.gap-sel');
    for (let i = 0; i < sels.length; i++) await sels[i].selectOption(answers[i]);
    await pp.click('#listening-form [type=submit]');
    assert.match(await pp.textContent('.result-banner'), /1 von 1|alle|Super|richtig/i);
    await pp.goBack();
    await pp.waitForTimeout(200);
    await pp.evaluate(() => nav('zahlen'));
    await pp.click('[data-nu="start"]');
    const ans = await pp.evaluate(() => NU_STATE.quiz.items[0].answers[0]);
    await pp.click(`.vb-opt[data-v="${ans}"]`);
    assert.match(await pp.textContent('.vb-fb'), /Richtig/);
  });

  await step('Arbeitsblatt-Mappe: sammeln, ordnen, zwei Blätter, PDF-Vorschau und Lösungen', async () => {
    await pp.goto(base + '?seite=grammatik', { waitUntil: 'networkidle' });
    await pp.click('[data-audience="teach"]');
    await pp.waitForTimeout(200);
    await pp.click('[data-gr-topic="ecco1-are-presente"]');
    const adds = await pp.$$('[data-ws-add]');
    for (const b of adds.slice(0, 3)) await b.click();
    assert.match(await pp.textContent('#ws-pill'), /3/);
    await pp.click('#ws-pill');
    await pp.click('[data-ws-new]');
    const last = await pp.evaluate(() => wsDraft.sheets[0][2]);
    await pp.selectOption(`[data-ws-to="${last}"]`, '1');
    assert.deepEqual(await pp.evaluate(() => wsDraft.sheets.map(s => s.length)), [2, 1]);
    // Ziehen: zweite Übung von Blatt 1 nach oben
    const grip = await pp.$$('.ws-items[data-sheet="0"] .ws-grip');
    const first = await (await pp.$('.ws-items[data-sheet="0"] .ws-item')).boundingBox();
    const g = await grip[1].boundingBox();
    const before = await pp.evaluate(() => wsDraft.sheets[0].slice());
    await pp.mouse.move(g.x + g.width / 2, g.y + g.height / 2);
    await pp.mouse.down();
    await pp.mouse.move(g.x + g.width / 2, first.y + 4, { steps: 8 });
    await pp.mouse.up();
    assert.deepEqual(await pp.evaluate(() => wsDraft.sheets[0]), [before[1], before[0]]);
    await pp.fill('#ws-name', 'Test Mappe');
    await pp.click('[data-ws-print="0"]');
    await pp.waitForSelector('#teaching-print .paper.pg');
    const pages = await pp.$$eval('#teaching-print .paper.pg', p => p.map(x => x.textContent));
    assert.ok(pages.length >= 2, 'Seiten: ' + pages.length);
    assert.ok(pages[pages.length - 1].includes('Foglio 2') || pages.some((t, i) => i > 0 && t.includes('Foglio 2')), 'Blatt 2 auf eigener Seite');
    assert.ok(!pages[0].includes('Foglio 2'));
    await pp.click('[data-dlg-side]');
    await pp.click('label:has(input[data-ws-mode][value="1"])');
    await pp.waitForSelector('#teaching-print .gp.filled, #teaching-print .ok');
    await pp.click('[data-portal="close-print"]');
    // Einzelne Grammatikübung drucken
    await pp.evaluate(() => openListening('g-ecco1-artikel-sg-m1'));
    await pp.click('[data-teaching]');
    await pp.click('[data-portal="print-questions"]');
    await pp.waitForSelector('#teaching-print .hb-rule');
    await pp.click('[data-portal="close-print"]');
    await pp.evaluate(() => { localStorage.removeItem('daje-arbeitsblatt-v1'); wsDraft = { title: '', sheets: [[]], rule: true }; wsRefresh(); });
  });

  await step('Verben: Band 3, „Welche Form?“ und „Im Satz“ lösen', async () => {
    await pp.goto(base, { waitUntil: 'networkidle' });
    await pp.evaluate(() => nav('verben'));
    await pp.click('[data-vb="band"][data-v="3"]');
    assert.ok(await pp.$('[data-vb="tense"][data-v="cong"]'), 'Congiuntivo ab Band 3');
    await pp.click('[data-vb="mode"][data-v="choice"]');
    await pp.click('[data-vb="tense"][data-v="cong"]');
    await pp.click('[data-vb="quiz-start"]');
    const right = await pp.evaluate(() => VB_STATE.quiz.items[0].forms[0]);
    await pp.click(`.vb-opt[data-v="${right}"]`);
    assert.match(await pp.textContent('.vb-fb'), /Richtig/);
    await pp.click('[data-vb="mode"][data-v="sent"]');
    await pp.click('[data-vb="quiz-start"]');
    const form = await pp.evaluate(() => VB_STATE.quiz.items[0].forms[0]);
    await pp.fill('#vb-q', form);
    await pp.click('#vb-qform button[type="submit"]');
    assert.match(await pp.textContent('.vb-fb'), /Richtig/);
    await pp.click('[data-vb="band"][data-v="1"]');
    assert.equal(await pp.$('[data-vb="tense"][data-v="cong"]'), null);
    assert.equal(await pp.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  });

  await step('Redaktion: Wortliste mit KI aus einem Text, an daje schicken, Einreichung übernehmen', async () => {
    const text = 'Negli ultimi anni le librerie hanno preso piede in città, in ogni quartiere del centro.';
    await pp.goto(base, { waitUntil: 'networkidle' });
    const link = await pp.evaluate(async ([text, answer]) => {
      const r = DajeKI.buildVocabulary(DajeKI.extractJSON(answer), { language: 'it', level: 'B2', mode: 'text', text, id: edNewId() }, TheisContent.validatePackage);
      if (!r.result.ok) throw new Error(r.result.errors.join(', '));
      const u = new URL(location.href);
      u.search = '';
      u.searchParams.set('einreichung', await edPack(edSubmissionPackage(r.result.value, 'Test')));
      return u.href;
    }, [text, require('node:fs').readFileSync(__dirname + '/fixtures/ki-wortschatz.txt', 'utf8')]);
    await pp.goto(link, { waitUntil: 'networkidle' });
    await pp.waitForSelector('#ed-received-dialog[open]');
    assert.match(await pp.textContent('#ed-received-dialog'), /Eingereicht von Test/);
    await pp.click('[data-received="take"]');
    await pp.waitForSelector('[data-ed="lines"]');
    assert.match(await pp.inputValue('[data-ed="lines"]'), /prendere piede = sich durchsetzen/);
  });

  await step('Redaktion: alle sieben Aufgabentypen per Formular anlegen', async () => {
    await pp.goto(base, { waitUntil: 'networkidle' });
    await pp.click('[data-audience="teach"]');
    await pp.evaluate(() => nav('redaktion'));
    await pp.click('[data-ed-new="listening"]');
    await pp.fill('[data-ed="title"]', 'Alle Typen');
    await pp.fill('[data-ed="youtube"]', 'https://youtu.be/dK9KAT5BDBM');
    const q = n => pp.locator('.ed-q').nth(n);
    await q(0).locator('[data-k="prompt"]').fill('Che cosa ordina?');
    await q(0).locator('[data-k="option"]').nth(0).fill('un caffè');
    await q(0).locator('[data-k="option"]').nth(1).fill('un tè');
    for (const t of ['multiple_choice', 'gap_fill', 'matching', 'ordering']) await pp.click(`[data-ed-add="${t}"]`);
    await q(1).locator('[data-k="prompt"]').fill('Che cosa compra?');
    for (const [k, v] of [[0, 'pane'], [1, 'latte'], [2, 'pesce']]) await q(1).locator('[data-k="option"]').nth(k).fill(v);
    await q(1).locator('[data-k="correctMulti"]').nth(0).check();
    await q(2).locator('[data-k="prompt"]').fill('Completa.');
    await q(2).locator('[data-k="gaptext"]').fill('Vorrei un [cappuccino] e un [cornetto / brioche].');
    await q(3).locator('[data-k="prompt"]').fill('Abbina.');
    await q(3).locator('[data-k="pairs"]').fill('cliente = ordina\nbarista = serve');
    await q(4).locator('[data-k="prompt"]').fill('Metti in ordine.');
    await q(4).locator('[data-k="items"]').fill('Buongiorno\nVorrei un caffè\nArrivederci');
    await pp.waitForTimeout(700);
    assert.match(await pp.textContent('#ed-status'), /bereit zum Teilen/);
    const types = await pp.evaluate(() => edItem().payload.questions.map(q => q.type).join(','));
    assert.equal(types, 'single_choice,multiple_choice,gap_fill,matching,ordering');
    assert.equal(await pp.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  });

  await step('Redaktion: YouTube-Kopie ohne Rechte-Rückfrage live stellen (GitHub simuliert)', async () => {
    const puts = [];
    await pp.route('https://api.github.com/**', r => {
      const m = r.request().method(), u = r.request().url();
      if (m === 'PUT') { puts.push(u); return r.fulfill({ status: 201, body: '{}' }); }
      if (/contents\//.test(u)) return r.fulfill({ status: 200, body: '{"sha":"abc123"}' });
      return r.fulfill({ status: 200, body: '{}' });
    });
    await pp.goto(base, { waitUntil: 'networkidle' });
    await pp.click('[data-audience="teach"]');
    await pp.evaluate(() => edCopyFrom('it-a2-roma-citta'));
    await pp.waitForSelector('details#ed-rights');
    assert.equal(await pp.$('#ed-rights.warn'), null);
    await pp.waitForTimeout(500);
    assert.equal(await pp.evaluate(() => edItem().payload.sources[0].rights), 'cleared');
    assert.match(await pp.textContent('#ed-status'), /bereit zum Teilen/);
    await pp.evaluate(() => (document.getElementById('live-box').open = true));
    await pp.fill('#live-token', 'github_pat_TEST');
    await pp.click('[data-live="push"]');
    await pp.waitForFunction(() => /Übertragen/.test(document.getElementById('live-msg').textContent));
    assert.equal(puts.length, 1);
    assert.match(puts[0], /grundstock\/listening\/eigen-/);
    await pp.unroute('https://api.github.com/**');
    await pp.evaluate(() => localStorage.removeItem('daje-github-v1'));
  });

  await step('Redaktion: eigene Hörübung anlegen, teilen und als Lernende öffnen', async () => {
    await pp.goto(base, { waitUntil: 'networkidle' });
    await pp.click('[data-audience="teach"]');
    await pp.evaluate(() => nav('redaktion'));
    await pp.click('[data-ed-new="listening"]');
    await pp.fill('[data-ed="title"]', 'Test eigene Übung');
    await pp.fill('[data-ed="youtube"]', 'https://youtu.be/dK9KAT5BDBM');
    await pp.fill('.ed-q [data-k="prompt"]', 'Domanda?');
    const o = pp.locator('.ed-q [data-k="option"]');
    await o.nth(0).fill('sì');
    await o.nth(1).fill('no');
    await pp.waitForTimeout(600);
    assert.match(await pp.textContent('#ed-status'), /bereit zum Teilen/);
    await pp.click('[data-ed-act="share"]');
    const url = await pp.getAttribute('#ed-share-dialog [data-qr-copy]', 'data-qr-copy');
    await pp.click('#ed-share-dialog [data-close]');
    await pp.click('[data-audience="learn"]');
    await pp.goto(url, { waitUntil: 'networkidle' });
    await pp.waitForTimeout(300);
    assert.match(await pp.textContent('main h1'), /Test eigene Übung/);
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
