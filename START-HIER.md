# ripassà. vollständige Projektübergabe

Stand 25. Oktober 2026. Dieses Paket enthält den vollständigen vorhandenen Portalquellcode, lokale Assets, Tests, aktuelle Inhaltsdaten, interne KI-Anleitungen und die Projektdatei Version 3 mit 23 Seiten. Es ist zum Weiterarbeiten mit Claude oder einer anderen Entwicklungsumgebung gedacht.

## In dieser Reihenfolge lesen

1. `uebergabe/01-CLAUDE-AUFTRAG.md` enthält Auftrag und Grenzen.
2. `projekt/Listening-App-Projektuebergabe.docx` oder dieselbe Fassung als PDF enthält Anforderungen, zentrale Anmeldung und die vollständige neue Vokabellernrecherche mit elf Quellen.
3. `uebergabe/02-ARCHITEKTUR.md`, `03-DATEN-UND-IMPORT.md` und `04-STATUS-UND-OFFENE-PUNKTE.md` erklären den tatsächlichen Quellstand.
4. `uebergabe/05-TESTEN-UND-VEROEFFENTLICHEN.md` erklärt Start, Tests und Abnahme.
5. `portal/dist/imports/` enthält die originalen KI-Kommandodateien und Backendkonzepte. `uebergabe/06-FORSCHUNG-UND-PROMPTNACHTRAG.md` ergänzt die zuletzt erarbeiteten didaktischen Anforderungen.
6. `uebergabe/07-DATEIKARTE.md`, `INHALTSINVENTAR.json` und `MANIFEST-SHA256.json` dokumentieren Dateien, Inhalt und Vollständigkeit.

## Lokal öffnen

Im entpackten Paket einen Terminal im Unterordner `portal` öffnen und ausführen:

```sh
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Danach http://127.0.0.1:8080 im Browser öffnen. Kein npm install, kein Build und kein API-Schlüssel nötig. Zum Beenden Strg+C. Browserdaten sind an genau diese Adresse und den Port gebunden; localhost und 127.0.0.1 sind verschiedene Origins.

Das Portal ist statisches HTML, CSS und JavaScript. `dist` enthält bereits den lesbaren, nicht gebündelten Anwendungsquellcode. `portal/.openai/hosting.json` ist die bestehende Hostingzuordnung; sie startet selbst keine Veröffentlichung. Die Originaldateien wurden für dieses Paket nicht funktional geändert.

## Was mitkommt und was getrennt bleibt

Enthalten sind sämtliche Git-verfolgten Dateien des aktuellen Checkouts einschließlich Bilder, Schriften, Lizenzdateien, lokaler Audiodatei und Tests. Nicht enthalten sind Git-Anmeldedaten, private Schlüssel, Browserprofile, individuelle Lernstände, lokale Redaktionsänderungen aus einem Browser, Original-Lehrwerks-PDFs oder die fremden YouTube-Videos. YouTube wird extern eingebettet.

Browser-Lernstände über Lernprofil → Aktuelles Profil sichern exportieren. Lokale Inhaltspakete zusätzlich einzeln aus der Redaktion exportieren. Ein Profilbackup enthält nicht den separaten Redaktionsbestand. Ohne diese Exporte kann eine Übergabe den individuellen Browserzustand nicht wiederherstellen.

Die Vorschau bleibt privat. Eine öffentliche Veröffentlichung ist kein Bestandteil dieser Übergabe. Das private Quellpaket enthält redaktionell ungeprüfte Medienkandidaten und interne Anleitungen.
