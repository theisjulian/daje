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
for (const kind of ['listening', 'vocabulary']) {
  const dir = path.join(root, 'grundstock', kind);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort()) {
    try {
      const r = validatePackage(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
      if (!r.ok) throw new Error(r.errors.slice(0, 4).join(' · '));
      if (r.value.kind !== kind) throw new Error('Paketart passt nicht zum Ordner');
      if (seen.has(r.value.id)) throw new Error('ID doppelt: ' + r.value.id);
      seen.add(r.value.id);
      good.push(r.value);
    } catch (e) {
      bad.push(kind + '/' + f + ': ' + e.message);
    }
  }
}
const out =
  "'use strict';\n// Automatisch erzeugt von werkzeuge/bundle_stock.cjs. Nicht von Hand ändern.\nconst STOCK_PACKAGES = " +
  JSON.stringify(good, null, 1) +
  ';\n';
fs.writeFileSync(path.join(dist, 'stock-data.js'), out);
const working = good.filter(x => x.sources.some(s => s.rights === 'needs_review')).length;
console.log(
  `${good.length} Pakete gebündelt (${good.filter(x => x.kind === 'listening').length} Hören, ${good.filter(x => x.kind === 'vocabulary').length} Wortschatz), davon ${working} als Arbeitsfassung markiert.`
);
if (bad.length) {
  console.log('\nNICHT übernommen:\n- ' + bad.join('\n- '));
  process.exitCode = 1;
}
