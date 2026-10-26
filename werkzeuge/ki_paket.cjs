#!/usr/bin/env node
'use strict';
/*
 * Brücke zwischen ki_grundstock.py und der App-Logik (portal/dist/ki.js + content-contract.js),
 * damit Redaktion und Grundstock-Werkzeug exakt dieselben Regeln nutzen.
 *   node werkzeuge/ki_paket.cjs auftrag <eingaben.json>              → Auftrag (Kommandodatei + Eingaben) auf stdout
 *   node werkzeuge/ki_paket.cjs bauen <antwort.txt> <eingaben.json>  → {ok, errors, pkg, evidence, warnings} auf stdout
 */
const fs = require('node:fs'),
  path = require('node:path');
const dist = path.resolve(__dirname, '../portal/dist');
const KI = require(path.join(dist, 'ki.js'));
const { validatePackage } = require(path.join(dist, 'content-contract.js'));

const [cmd, a, b] = process.argv.slice(2);
const json = f => JSON.parse(fs.readFileSync(f, 'utf8'));
if (cmd === 'auftrag') {
  const command = fs.readFileSync(path.join(dist, 'imports/KI-Kommandodatei.md'), 'utf8');
  process.stdout.write(KI.promptFor(command, json(a)));
} else if (cmd === 'bauen') {
  const inp = json(b);
  try {
    const r = KI.buildPackage(KI.extractJSON(fs.readFileSync(a, 'utf8')), inp, validatePackage);
    process.stdout.write(
      JSON.stringify({ ok: r.result.ok, errors: r.result.errors || [], pkg: r.result.ok ? r.result.value : r.pkg, evidence: r.evidence, warnings: r.warnings })
    );
  } catch (err) {
    process.stdout.write(JSON.stringify({ ok: false, errors: [err.message], pkg: null, evidence: [], warnings: [] }));
  }
} else {
  console.error('Aufruf: ki_paket.cjs auftrag <eingaben.json> | bauen <antwort.txt> <eingaben.json>');
  process.exit(2);
}
