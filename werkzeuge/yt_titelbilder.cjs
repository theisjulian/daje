#!/usr/bin/env node
/* YouTube-Titelbilder für alle Katalogvideos in guter Auflösung herunterladen (läuft im build-Schritt der
   GitHub Action, dort ist YouTube erreichbar). Ergebnis: portal/dist/assets/yt/<ID>.jpg und
   portal/dist/yt-thumbs.js mit der Liste. Fehlt das Netz, bleibt alles beim Alten. */
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const dist = path.join(root, 'portal', 'dist');
const out = path.join(dist, 'assets', 'yt');

const ids = new Set();
const scan = text => {
  for (const m of text.matchAll(/videoId["']?\s*:\s*["']([A-Za-z0-9_-]{11})["']/g)) ids.add(m[1]);
};
for (const f of ['listening-data.js', 'listening-extra.js', 'stock-data.js']) {
  const p = path.join(dist, f);
  if (fs.existsSync(p)) scan(fs.readFileSync(p, 'utf8'));
}
const gdir = path.join(root, 'grundstock', 'listening');
if (fs.existsSync(gdir)) for (const f of fs.readdirSync(gdir)) if (f.endsWith('.json')) scan(fs.readFileSync(path.join(gdir, f), 'utf8'));

async function grab(id) {
  // maxresdefault: 1280×720 ohne Balken, nicht bei jedem Video vorhanden; sddefault/hqdefault haben Balken.
  for (const name of ['maxresdefault', 'sddefault', 'hqdefault']) {
    try {
      const r = await fetch(`https://i.ytimg.com/vi/${id}/${name}.jpg`);
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 4000) continue; // grauer Platzhalter
      fs.writeFileSync(path.join(out, id + '.jpg'), buf);
      return name;
    } catch (e) {
      return null;
    }
  }
  return null;
}

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const map = {};
  let n = 0;
  for (const id of ids) {
    const kind = await grab(id);
    if (!kind) continue;
    map[id] = { src: 'assets/yt/' + id + '.jpg', box: kind !== 'maxresdefault' };
    n++;
  }
  fs.writeFileSync(path.join(dist, 'yt-thumbs.js'), "'use strict';\n/* Erzeugt von werkzeuge/yt_titelbilder.cjs beim Veröffentlichen. */\nvar YT_THUMBS = " + JSON.stringify(map, null, 1) + ';\n');
  console.log(`${n} von ${ids.size} YouTube-Titelbildern geladen.`);
})();
