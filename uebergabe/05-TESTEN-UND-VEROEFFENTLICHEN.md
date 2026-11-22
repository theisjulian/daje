# daje · Testen und Veröffentlichen

Stand 22.11.2026. Ersetzt die frühere Fassung aus der ripassà-Übergabe (Oktober 2026). Überblick und Regeln: `UEBERGABE-OPUS.md`.

## Voraussetzungen

- Python 3 (lokaler Server, Generatoren in `werkzeuge/`, `pruefen.py`).
- Node.js 22 (wie in der Pipeline). `npm install` in `portal/` holt nur Testwerkzeuge (Playwright, Prettier); die App selbst hat keinen Build.
- Für den Browsertest ein Chromium, der zur Playwright-Version passt (`npx playwright install chromium`), oder ein vorhandener Chromium über `CHROMIUM_PATH`.

## Lokal starten

```sh
cd portal/dist && python3 -m http.server 8765
```

Dann http://localhost:8765 öffnen. Nur über HTTP, nicht per `file://`. Browserdaten hängen an Adresse und Port (localhost und 127.0.0.1 sind verschiedene Origins); für echte Lernstände immer dieselbe Adresse nutzen, zum Testen ein eigenes Browserprofil. Ohne Konto zeigt daje die Willkommensseite (`gate.js`); die Browsertests umgehen das mit `window.DAJE_E2E`.

## Automatische Prüfung

Im Repo-Wurzelverzeichnis:

```sh
python3 pruefen.py            # Syntax aller dist/*.js, alle Node-Tests (wie npm test), Inhaltsinventar
python3 pruefen.py --browser  # zusätzlich Playwright-Ende-zu-Ende-Test
```

Einzeln in `portal/`:

```sh
npm test                      # ki, speech, content, grading, progress, verbs, cils
node tests/e2e.test.cjs       # Browsertest, startet eigenen Server
```

Passt die Playwright-Version nicht zum installierten Browser („Executable doesn't exist“), `CHROMIUM_PATH=/pfad/zu/chrome node tests/e2e.test.cjs`. In Claude-Cloud-Sitzungen liegt der Browser unter `/opt/pw-browsers/chromium`; `pruefen.py --browser` nimmt ihn automatisch.

| Test | prüft |
|---|---|
| `ki.test.cjs` | KI-Antworten für Wortschatz und Grammatik werden in gültige Pakete umgesetzt |
| `speech.test.cjs` | Sprachausgabe: Schreibweisen werden sprechbar umgeformt |
| `content.test.cjs` | Paketvertrag (`content-contract.js`): Format, doppelte IDs, Referenzen, unsichere Medien, alle Aufgabentypen |
| `grading.test.cjs` | Antwortprüfung: Artikel, Genus, Akzente, Tippfehler, Toleranz, Synonyme |
| `progress.test.cjs` | Lernstand: Migration, Profile, Sicherungen, Tageszählung |
| `verbs.test.cjs` | Verbtrainer: Formen und Zeiten |
| `cils.test.cjs` | CILS-Katalog und -Generator: Anzahlen nach den Heften, Toleranz, Mischung |
| `e2e.test.cjs` | 39 Abläufe im echten Browser: Start, Katalog, Übungen, Druck, Handy 390 px, Lehrkräfteansicht, Einbettung, Klassensitzung (Server nachgebildet), Fokus-Modus, Unterrichtsmappe |
| `uebergabe/validate-inventory.cjs` | `INHALTSINVENTAR.json` und `inhalte/` stimmen überein, alle Pakete gültig, YouTube-Bilder vorhanden |

Zusätzlich vor jedem Commit mit Inhaltsänderungen die Generatoren laufen lassen und das Ergebnis mitcommitten (die Pipeline prüft das):

```sh
python3 werkzeuge/hoeren/alt.py && python3 werkzeuge/grammatik.py && node werkzeuge/bundle_stock.cjs
python3 werkzeuge/qualitaet.py
```

## Was die Tests nicht abdecken (manuell auf echtem Gerät)

- iPad/iPhone mit Safari: Antippen und Ziehen (auch mit Stift), Tastatur, Dialoge.
- Druck über den Systemdialog und iOS-PDF (Kästchen, Buchstaben A–D, Seitenumbrüche). Die Browseransicht allein ist kein Nachweis.
- Supabase live: Anmeldung, Registrierung, E-Mails, Klassensitzung mit zwei Geräten, Konto löschen.
- YouTube-Wiedergabe der eingebetteten Videos, Browser-Sprachausgabe (je nach Gerät verschieden).
- mebis-Einbettung (`?hoeren=ID&embed=1`) in mebis selbst.
- Farbwelten hell und dunkel (daje, Pop, Glas, Heft, Graphit, Wald, Tageslicht).

## Veröffentlichen

GitHub Pages über `.github/workflows/veroeffentlichen.yml`:

1. **pruefen** (bei jedem Push und Pull Request): Generatoren, `bundle_stock.cjs`, Abgleich „generierte Dateien committet“, `qualitaet.py`, `npm test`, Browsertest.
2. **build** und **deploy** (nur `main`): Grundstock bündeln, YouTube-Titelbilder laden, `portal/dist` als Pages-Artefakt hochladen und veröffentlichen.

Adresse aktuell `theisjulian.github.io/daje/`, geplant `daje.theisapps.de` (`portal/dist/CNAME`). Push nur nach `theisjulian/daje`. Keine Schlüssel, Scans, Liedtexte oder Arbeitsblätter ins Repo.
