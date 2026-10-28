#!/usr/bin/env node
'use strict';
/*
 * Grundstock bündeln: prüft alle Pakete in grundstock/ mit dem Importvertrag der App
 * und schreibt die gültigen nach portal/dist/stock-data.js.
 *   node werkzeuge/bundle_stock.cjs            alles prüfen und bündeln
 *   node werkzeuge/bundle_stock.cjs --check f  eine Datei prüfen (Ausgabe: JSON)
 */
const fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'portal/dist');
const { validatePackage } = require(path.join(dist, 'content-contract.js'));

if (process.argv[2] === '--check') {
  try {
    const r = validatePackage(JSON.parse(fs.readFileSync(process.argv[3], 'utf8')));
    console.log(JSON.stringify({ ok: r.ok, errors: r.errors || [] }));
  } catch (e) {
    console.log(JSON.stringify({ ok: false, errors: ['JSON nicht lesbar: ' + e.message] }));
  }
  process.exit(0);
}

const seedIds = new Set();
for (const f of ['listening-data.js', 'review-data.js']) {
  const c = {};
  vm.createContext(c);
  vm.runInContext(
    fs.readFileSync(path.join(dist, f), 'utf8').replace(/^'use strict';/, '').replace(/^const /m, 'var ') +
      ';this.s=typeof LISTENING_SEEDS!=="undefined"?LISTENING_SEEDS:LISTENING_REVIEW_SEEDS;',
    c
  );
  (c.s || []).forEach(x => seedIds.add(x.id));
}
const good = [],
  bad = [],
  seen = new Set(seedIds);
for (const kind of ['listening', 'vocabulary', 'grammar']) {
  const dir = path.join(root, 'grundstock', kind);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    try {
      const r = validatePackage(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
      if (!r.ok) throw new Error(r.errors.slice(0, 4).join(' · '));
      if (r.value.kind !== kind) throw new Error('Paketart passt nicht zum Ordner');
      // Genau übernommene Buchübungen bleiben privat und kommen nie in den öffentlichen Katalog.
      if (r.value.grammar && r.value.grammar.origin === 'original') throw new Error('Originalübung aus einem Buch: nur privat, nicht im Grundstock');
      if (seen.has(r.value.id)) throw new Error('ID doppelt: ' + r.value.id);
      seen.add(r.value.id);
      good.push(r.value);
    } catch (e) {
      bad.push(kind + '/' + f + ': ' + e.message);
    }
  }
}
/* Korrekturen aus der Redaktion (Betreiber, „Live stellen“ bei schon veröffentlichten Inhalten):
   grundstock/korrekturen/<id>.json ersetzt das Paket gleicher ID (auch eingebaute Hörübungen), ein Eintrag
   { "format": "daje-entfernt", "id": … } nimmt es aus dem Katalog. Die Generatoren schreiben nie hierher,
   deshalb überschreibt ein neuer Import diese Änderungen nicht. */
const removed = new Set();
const fixDir = path.join(root, 'grundstock', 'korrekturen');
if (fs.existsSync(fixDir))
  for (const f of fs.readdirSync(fixDir).filter(f => f.endsWith('.json')).sort()) {
    try {
      const raw = JSON.parse(fs.readFileSync(path.join(fixDir, f), 'utf8'));
      if (raw && raw.format === 'daje-entfernt') {
        if (!/^[a-z0-9][a-z0-9-]*$/.test(raw.id || '')) throw new Error('ID fehlt');
        removed.add(raw.id);
        continue;
      }
      const r = validatePackage(raw);
      if (!r.ok) throw new Error(r.errors.slice(0, 4).join(' · '));
      if (r.value.grammar && r.value.grammar.origin === 'original') throw new Error('Originalübung aus einem Buch: nur privat, nicht im Grundstock');
      const i = good.findIndex(x => x.id === r.value.id);
      if (i >= 0) good[i] = r.value;
      else good.push(r.value);
    } catch (e) {
      bad.push('korrekturen/' + f + ': ' + e.message);
    }
  }
const list = good.filter(x => !removed.has(x.id));
const out =
  "'use strict';\n// Automatisch erzeugt von werkzeuge/bundle_stock.cjs. Nicht von Hand ändern.\nconst STOCK_PACKAGES = " +
  JSON.stringify(list, null, 1) +
  ';\nconst STOCK_REMOVED = ' +
  JSON.stringify([...removed]) +
  ';\n';
fs.writeFileSync(path.join(dist, 'stock-data.js'), out);
const working = list.filter(x => x.sources.some(s => s.rights === 'needs_review')).length;
console.log(
  `${list.length} Pakete gebündelt (${list.filter(x => x.kind === 'listening').length} Hören, ${list.filter(x => x.kind === 'vocabulary').length} Wortschatz, ${list.filter(x => x.kind === 'grammar').length} Grammatik), davon ${working} als Arbeitsfassung markiert${removed.size ? ', ' + removed.size + ' entfernt' : ''}.`
);
if (bad.length) {
  console.log('\nNICHT übernommen:\n- ' + bad.join('\n- '));
  process.exitCode = 1;
}
