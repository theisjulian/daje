# daje · Portal

Buildlose Browser-Anwendung von theis für Hörverstehen, Wortschatz, Grammatik und CILS-Prüfungstraining (Italienisch, Englisch, Französisch). `dist/` ist die gesamte App: statisches HTML, CSS und JavaScript ohne Bündelung.

Einstieg, Regeln und Stand: `../UEBERGABE-OPUS.md`. Entscheidungen: `../uebergabe/08-ENTSCHEIDUNGEN.md`. Testen und Veröffentlichen: `../uebergabe/05-TESTEN-UND-VEROEFFENTLICHEN.md`.

## Starten und prüfen

```sh
cd dist && python3 -m http.server 8765    # http://localhost:8765
```

```sh
npm install && npm test && node tests/e2e.test.cjs
```

npm dient nur Tests (Playwright) und Formatierung (`npm run format`, Prettier).

## Daten

- Lernstände liegen im Browser (localStorage). Die Schlüssel heißen absichtlich weiter `ripassa-*` (früherer Arbeitsname), damit Updates keine Daten verlieren. Angemeldete Konten synchronisieren ausgewählte Schlüssel über Supabase (`SYNC_KEYS`).
- Inhalte: Grundstock (`stock-data.js`, gebündelt aus `../grundstock` mit `../werkzeuge/bundle_stock.cjs`), Hörpakete, Grammatik und Wortlisten aus den Generatoren in `../werkzeuge`. Paketformat und Prüfung: `content-contract.js`, KI-Kommandodateien in `dist/imports/`.

## Quellen und Lizenzen

- Schriften Inter und Schibsted Grotesk unter der SIL Open Font License (`dist/assets/OFL-*.txt`), lokal eingebunden.
- `dist/assets/voa-welcome.mp3`: VOA Learning English, Let’s Learn English Level 1, Lesson 1 (8. Februar 2016), unverändert. VOA nennt selbst produzierte Inhalte Public Domain (https://learningenglish.voanews.com/p/6021.html).
- Bildurheber, Lizenzen und Bearbeitungen stehen im Quellenbereich der App. YouTube-Videos werden nur eingebettet, nicht mitgeliefert.
- Nicht im Repo: Lehrwerks-Scans, Liedtexte, Arbeitsblätter, Filmdialoge, API-Schlüssel, Lernstände.
