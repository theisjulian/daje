# Schritt 2 · Design und Bedienung (2026-10-25)

- Umschalter **Lernende | Lehrkräfte** in der Kopfzeile (auch auf dem Handy), gespeichert im Profil; Start, Katalog, Übung, Wortschatz und Beschriftungen passen sich an.
- Neue Dateien: `views.js` (Ansichten), `shell.js` (Navigation, Kopfzeile, Handy-Tab-Leiste, „Mehr“-Blatt), `design.css` (Design). Alte Ansichten aus `portal.js` entfernt.
- Hörkatalog: Filter-Chips (Sprache, Niveau, Medium), Live-Suche, Plakat-Karten mit Niveau, Dauer, Fortschritt; Arbeitsfassungen ausblendbar.
- Übungsseite: Medium links (mitlaufend), Aufgaben rechts mit großen Antwortflächen, Fortschrittssegmente, Korrektur-Markierung, feste Prüfleiste; Lehrkräfte: Lösungen einblendbar, Transkript offen, Druckknöpfe.
- Transkript-Herkunft als Kennzeichnung in der Medien-Sprache (optionales Feld `transcriptOrigin`: provider | auto | own | reviewed; YouTube ohne Angabe = „automatisch generiert“).
- Interne Prüfnotizen („Gemini“, „Audioabgleich offen“ …) erscheinen nicht mehr in der Lernenden-Ansicht.
- Schriftauswahl (Standard, Nunito, Lora, Space Grotesk, Atkinson, Jost) in „Darstellung“; alle 12 Farbwelten bleiben.
- Volle Breite (bis 2400 px), größere Schrift, Redaktion nur noch in der Fußzeile.
- Tests: 17 Browser-Prüfungen (neu: Umschalter, Filter, Schrift, Notizen-Filter, Handy-Blatt).

## Nachtrag (25.10.2026, nachmittags)

- theis-Logo steht jetzt unten (Seitenleiste: „© 2026“ + Logo; Handy und Tablet: Fußzeile), nicht mehr oben. Oben steht „ripassà.“.
- Seitenleiste: Start, Hörverstehen, Wortschatz, Merkliste · Fortschritt, Hilfe. „Verben“ ist jetzt Teil von Wortschatz, „Verlauf“ gehört zur Merkliste (erreichbar über Startseite und Merkliste).
- „Theis-Konto“-Knopf entfernt (Konto ist noch nicht gebaut). Schreibweise überall „theis“.
- Wortschatz-Üben (iPad/iPhone): Fokus-Modus ohne Seitenleiste/Tab-Leiste, große Wortkarte (Tippen dreht um), nur „Lösung zeigen“ / „Nochmal“ / „Gewusst“ unten im Daumenbereich, Eingaben mit 16-px-Schrift (kein Zoomen auf iOS). Startseite „Heute üben“ ohne Werbeteil.
- Vier neue Aufgabentypen für Hörübungen: Mehrfachauswahl, Zuordnung, Reihenfolge, Lückentext (Validator, Auswertung, Darstellung, Druckblatt, Tests, Beispiel `examples/listening-all-task-types.json`).
- Optionales Titelbild `coverImage` (`assets/covers/<id>.jpg`).
- Einbett-Modus `?hoeren=<id>&embed=1` (nur die Übung); Lehrkraftleiste: „Einbett-Code kopieren“.
- `imports/KI-Kommandodatei.md` und `Gemini-Folgeprompt.md`: verbindliche Regeln zur Aufgabenqualität, alle sieben Typen, Titelbild, Eigenkontrolle.
- Tests: 19 Browser-Prüfungen, alle Unit-Tests grün.

## Schritt 3
- Lerntipps: neuer Bereich (Hören / Wortschatz), 10 Tipps mit Stärke der Belege, Schrittfolge, Unterrichtshinweis für Lehrkräfte, Studien aufklappbar. Neue Quellen: Dunlosky 2013, Vandergrift & Tafaghodtari 2010, Montero Perez et al. 2013 (zwei davon noch gegen das Original zu prüfen).
- Verlauf ist jetzt Teil der Merkliste („Gemerkt | Zuletzt geöffnet“).
- Titelbild automatisch beim Import (Openverse, CC-Lizenzen, eingebettet, Nachweis in sources); `coverQuery` im Paket.
- Redaktion: Titelbild suchen/ändern, „Alles bearbeiten (JSON)“ für jedes Feld.

## Schritt 7
- Schema 1.2: Katalog (Lehrwerk, Unit, Jgst., Fremdsprache-Nr., GER, Themen), media.start/end, evidenceAt, usage/tags/page.
- Katalogzeile + Lehrwerk-Filter in der Wortschatz-Bibliothek (catalog.js).
- Druck/PDF/Word für Wortlisten und Hörübungen mit Designauswahl und Spaltenwahl (docs.js, docs.css).
- „Live stellen“ in der Redaktion (publish.js): schreibt Pakete per GitHub-API ins Repo; Workflow .github/workflows/veroeffentlichen.yml; CNAME daje.theisapps.de.
- Pipeline: automatisches Titelbild (Openverse) für Audio-Hörübungen; Grundstock-starten.command, schluessel.env.beispiel, .gitignore.
- Neue Vokabel-Kommandodatei für Schulbuchseiten (mit Rückfragen); KI-Kommandodatei auf 1.2.
