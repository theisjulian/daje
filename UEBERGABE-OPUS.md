# daje · Übergabe an den nächsten Chat (Stand 26.10.2026)

Dieses Dokument ersetzt für den Einstieg `START-HIER.md` und die älteren Dateien unter `uebergabe/01–07` (die noch den alten Namen „ripassà“ und frühere Stände enthalten). Neuere Entscheidungen: `uebergabe/08-ENTSCHEIDUNGEN.md`.

## 1. Was ist daje?

Buildlose Browser-Anwendung für Lehrkräfte und Lernende (viel iPad/iPhone) von Julian Theis (Marke „theis“, Lehrer für Englisch/Italienisch, OVMG München):
- **Hörverstehen**: Katalog von Hörübungen (Audio, YouTube-Einbettung, Film-Karte, Weblink-Karte, Browser-Sprachausgabe) mit Aufgaben (7 Typen), Korrektur mit Erklärungen, Transkript-Hilfe, Lehrkräfteansicht (Aufgabenblatt/Lösungsschlüssel als A4/PDF/Word, QR-Code, Einbett-Link).
- **Wortschatz**: Lehrbuch-Listen (Ecco più 1 und 2, Cornelsen; Ecco 3 folgt) nach Buch → Unità/Lezione/Seiten wählbar; Üben (Karten, Schreiben, Zuordnen, Definitionen, Bildimpulse), Spaced Repetition, Druck/Word-Dokumente, Verbentrainer (5 Zeiten, regelmäßig + unregelmäßig).
- Lernprofile lokal im Browser (Export/Import), 12 Farbwelten, wählbare Schriften, UI-Sprachen DE/IT/EN/FR + einfache Formen (IT/EN/FR).
- Repo: `https://github.com/theisjulian/daje` (nur dorthin pushen). Veröffentlichung: GitHub Pages über `.github/workflows/veroeffentlichen.yml` (bündelt den Grundstock, lädt `portal/dist` hoch). Geplante Adresse `daje.theisapps.de`; aktuell `theisjulian.github.io/daje/`.

## 2. Verbindliche Regeln des Auftraggebers (nicht verletzen)

- Push nur nach `theisjulian/daje`. API-Schlüssel nie in Chat oder Repo (nur `werkzeuge/schluessel.env`, gitignored).
- **Keine Liedtexte, Arbeitsblätter, Filmdialoge im öffentlichen Repo.** Liedtext-Lückentexte nur als privater Import durch die Lehrkraft.
- Marke immer klein „theis“; theis-Logo unten (Fußzeile/Seitenleiste), nie angeschnitten; Copyright-Zeile „© 2026“ + Logo. Keine Knöpfe für nicht existierende Funktionen (z. B. Konto).
- iPad/iPhone zuerst; Karten mit wenig Text; volle Bildschirmbreite; Schriftknöpfe zeigen ihre Schrift als Vorschau.
- Updates dürfen nie Nutzerdaten verlieren (localStorage-Schlüssel behalten ihre alten Namen `ripassa-*` **absichtlich**).
- Erfundene Namen nur in Demos. DE→IT-Übersetzungstests unerwünscht. Nicht mit Funktionen überladen – bei Überladung „Stopp“ sagen.
- Inhalte: nichts erfinden; Quellen nennen; Herkunft/Prüfhinweise nie in den sichtbaren Transkripttext.
- Ecco-Importe: jedes Wort muss dem richtigen Kapitel/der richtigen Seite zugeordnet sein; bei Zweifel Scan erneut lesen.
- Commits enden mit `Co-Authored-By: Claude … <noreply@anthropic.com>` und `Claude-Session: …`.

## 3. Aufbau des Quellcodes

```
portal/dist/            ← die gesamte App (statisch, kein Build). Nur <script defer> in index.html; Reihenfolge zählt,
                          spätere Dateien überschreiben Funktionen früherer (z. B. printTeaching in dialog.js).
  index.html            Einstieg, Skriptreihenfolge; eine Stildatei app.css
  data.js features.js app.js      Lernlogik Wortschatz (Karten/Schreiben/Zuordnen), Sitzung, Fortschritt
  grading.js            Antwortbewertung (Artikel-/Akzent-/Tippfehler-Toleranz, Synonyme)
  content-contract.js   Paketschema 1.0–1.2 + validatePackage (entfernt unbekannte Felder!)
  portal.js views.js    Hörverstehen: Katalog, Übungsseite, Lehrkräfteansicht, Profil/Backup
  hoerblatt.js docs.js dialog.js   Druck/Word: Aufgabenblatt, Vokabeldokument, Dokumentdialog (Vorschau + Anpassen)
  wortschatz.js         Wortschatz-Hub (Buchcover-Kacheln, Lektions-/Seitenwahl, Auswahl)
  verlauf.js            Browserverlauf (Zurück-Taste/Wischgeste, ?seite=, ?buch=, ?hoeren=); zuletzt geladen, umhüllt nav/openListening/renderSession
  aufgabe.js            Hausaufgabe: Lehrkraft bündelt Inhalte → ?aufgabe=<base64 {t,i:['l:id','v:id']}>, Lernende: Aufgabenliste
  verbs.js              Verbmaschine (VB_DATA [inf, de, gruppe, klasse, overrides] → vbBuild)
  studio.js             Redaktion „Eigene Übungen“: anlegen/bearbeiten (Entwurf in draft, gültiges Paket in payload), Teilen per ?eigene=<z|j+base64url> (deflate-raw), empfangene Pakete in daje-geteilt-v1
  shell.js extras2.js catalog.js instr.js publish.js qr.js   Navigation (Markenzeichen DAJE_MARK), Titelbildsuche/JSON-Bearbeitung, Live stellen (GitHub, nur Betreiber), QR, Anweisungstexte
  i18n.js i18n-rows.js i18n-simple.js   UI-Texte (Zeilen [de,it,en,fr,it-simple]); *-simple.js für EN/FR einfach
  listening-data.js review-data.js stock-data.js listening-extra.js   Inhalte (Seeds; stock-data.js GENERIERT)
  app.css               Gestaltung, zusammengeführt aus den früheren 10 Dateien (Abschnittsköpfe zeigen die Herkunft); Reihenfolge zählt
  assets/ examples/ imports/(KI-Kommandodatei.md, Gemini-Folgeprompt.md)
portal/tests/           npm test (content, grading, progress, verbs) + e2e.test.cjs (Playwright, 25 Prüfungen)
grundstock/listening/   25 Lied-/Film-Pakete (GENERIERT aus werkzeuge/hoeren)
grundstock/vocabulary/  60 Wortschatzpakete (GENERIERT aus werkzeuge/ecco*/…)
inhalte/                die 15 älteren Hörpakete im Original (Seeds liegen in listening-data/review-data)
werkzeuge/              Automatisierung (siehe 4)
uebergabe/              ältere Doku 01–07, neu: 08-ENTSCHEIDUNGEN.md
```

Daten-/Speicherschlüssel: `ripassa-ui-language-v1`, `ripassa-doc-v1`, `ripassa-editor-v1`, Lernstand-Schlüssel `ripassa-lernstand-…`; neu: `daje-hausaufgabe-v1` (Entwurf Lehrkraft), `daje-aufgaben-v1` (erhaltene Hausaufgaben), `daje-geteilt-v1` (geteilte eigene Übungen), `daje-fokus-v1`, `daje-lehrkraft-ok`. Profile liegen in localStorage (je Adresse getrennt!).

## 4. Automatisierung der Inhalte (Prozesse – hier soll Opus ansetzen)

| Prozess | Eingabe | Werkzeug | Ausgabe |
|---|---|---|---|
| Lehrbuch-Wortschatz | Scan-PDF (nur bei Julian) → **manuell abgetippte** `werkzeuge/ecco1|2/lista-*.txt`, `related-*.txt` (E/F/L-Spalte), `defs-*.txt` (Erklärung+Beispiel) | `python3 werkzeuge/ecco_import.py` | `grundstock/vocabulary/*.json` |
| Hörpakete Lieder/Filme | Python-Quellen `werkzeuge/hoeren/en1..3, it1, it2` (+ `review.py` mit Streichungen/Ergänzungen) | `python3 werkzeuge/hoeren/build.py` | `grundstock/listening/*.json` |
| Erweiterung alter Pakete | `werkzeuge/hoeren/alt.py` | `python3 werkzeuge/hoeren/alt.py` | `portal/dist/listening-extra.js` |
| Bündeln/Validieren | alle `grundstock/**` | `node werkzeuge/bundle_stock.cjs` | `portal/dist/stock-data.js` (committet; CI bündelt erneut) |
| KI-Erzeugung (nicht benutzt) | `videos.csv`, `woerter.csv`, `suchthemen.csv`, Kommandodatei | `gemini_grundstock.py` (API-Schlüssel nötig) oder `gemini_stapel.py bauen/einlesen` (Browser-Gemini, ohne Schlüssel) | Pakete → bündeln |
| Qualitätsprüfung | `grundstock/` | `python3 werkzeuge/qualitaet.py [--ipa]` | Befundliste (Exit 1 bei harten Fehlern) |
| Tests | – | `cd portal && npm test; node tests/e2e.test.cjs` (Server: `python3 -m http.server 8765` in `portal/dist`) | – |

Reihenfolge nach Inhaltsänderung: Generator → `bundle_stock.cjs` → Tests → Commit (generierte Dateien mit committen).

### Schwächen der Automatisierung (Prüfauftrag)
1. Generierte `stock-data.js` (43.000 Zeilen) liegt im Git; Doppelpflege Generator/Ausgabe. Idee: nur Quellen committen, CI generiert, oder Pakete als JSON nachladen (Ladezeit, Offline!).
2. ~~CI führt keine Tests~~ **erledigt (26.10.2026):** Job `pruefen` läuft bei jedem Push/PR: Generatoren neu ausführen → `bundle_stock.cjs` (bricht bei ungültigem Paket ab) → Abgleich, ob generierte Dateien committet sind → `qualitaet.py` → `npm test` → e2e. Veröffentlicht wird nur von `main` und nur, wenn alles grün ist.
3. Hörpakete entstehen aus Python-Quelltext (`Q`-Helfer). Es gibt kein Format „Aufgabe schreiben, ohne Python zu können“. Überlegen: YAML/Markdown-Quelle + Prüfer.
4. Ecco-Import ist manuelle Abschrift aus Scans. OCR + Gegenprüfung (Seitenzuordnung!) automatisieren; Ecco 3 più folgt, Kapitelzuordnung muss exakt sein.
5. KI-Pipeline (Gemini) ist gebaut, aber nie gelaufen; Schlüssel liegt bei Julian. Ablauf, Prompt-Qualität (10–20 Aufgaben in Blöcken, Typenmix, Transkript-Treue) und Validierung gegen `qualitaet.py` testen.
6. Aufgabenqualität: Die 25 Lied-/Film-Pakete wurden **ohne Zugriff auf Audio/Video** geschrieben (nur Fakten/Allgemeinwissen). Echte Hör-Aufgaben brauchen Transkript (privater Import) → Pipeline „Transkript → Aufgaben → Prüfung“ bauen.
7. `qualitaet.py` findet: bei 74 Einzelauswahl-Aufgaben ist die richtige Option die längste (Test-Trick), 167 Wörter ohne Beispielsatz (v. a. Redemittel/Arbeitsaufträge).
8. `MANIFEST-SHA256.json`, `INHALTSINVENTAR.json`, `PRUEFPROTOKOLL.txt`, `SOURCE-SNAPSHOT.json`, `provenance.json`, `pruefen.py` stammen vom alten Paket und sind veraltet (nicht mehr generiert).
9. Erklärungen/Beispielsätze der Wortschatzpakete sind eigene KI-Formulierungen (kein Buchtext), fachlich nicht von einer Lehrkraft geprüft; `reviewNotes` sagen das.

## 5. Stand der Inhalte
- Hören: 25 Lied-/Film-Pakete (50 Special, American Pie, C’è ancora domani, Don’t Look Back in Anger, Don’t Look Up, Fairytale of New York, I Want It That Way, La vita è bella, Lay All Your Love On Me, Perfetti sconosciuti, Stan, Tu si a fine do’ munno) in Stufen; 15 ältere Pakete mit Transkript (davon 12 erweitert; Rai-Paket entfernt). Katalog zeigt 42.
- Wortschatz: Ecco più 1 und 2 vollständig (Lista cronologica), Anhang A (Alphabet-Redemittel, Arbeitsaufträge, **Zahlen 0–2 Mrd., Ordnungszahlen, Wochentage, Monate**). Feld `contrast` = „Unterscheide“-Kasten, `related` = E/F/L-Verwandte, `definition`/`example` eigene Texte.
- Verben: ~80 Verben; Abgleich mit Ecco-2-Scan S. 186–191 und 194–195 erfolgt; **S. 188–189, 192–193, 196–197 nicht gesichtet**.
- Medientyp `link` (BBC/NPR/TED) vorhanden, aber noch ohne Paket.

## 6. Letzte Änderungen (diese Sitzung)
Cover-Kacheln; 50 Special nur Lied; alte Pakete 11–24 Aufgaben; Rai entfernt; Erklärungen für alle Wörter; Umbenennung in daje (Icon C = Ohr); Hörseiten mobil neu (`mobile.css`); iOS-Druckfehler (nur 1 Seite) behoben: `do-print` hält `printing-teaching` bis `afterprint`; Seitenumbruchberechnung (`dlgPaginate`) korrigiert; Dokumentdialog mit großer echter Vorschau, Design als Chips, „Anpassen“-Blatt; Unterscheide-Kästen; EN/FR einfach; Qualitätsskript; fachliche Überarbeitung aller Hörpakete (`werkzeuge/hoeren/review.py`).

## 6a. Analyse und Überarbeitung (26.10.2026, Opus)
Geprüft auf iPhone (320/390 px), iPad (820/1024 px) und Desktop (1440 px), Rolle Lernende und Lehrkräfte.
Behoben:
- **Lernende sahen Redaktionsvermerke** in 55 Erklärungen („laut übermittelter Mitschrift …“, „Audioabgleich offen“, „laut Gemini“). An der Quelle umformuliert (`review-data.js`, `inhalte/*.json`); Prüfstatus steht weiter in `reviewNotes` (nur Lehrkräfte). Drei Ausschnitte (Rom, Italien kennenlernen, Vita in Italia) starten/enden jetzt im Player.
- „Arbeitsfassung“ (Hinweisleiste, Karten-Etikett, Filter, „Nicht am Audio geprüft“) und der Redaktionszugang nur noch für Lehrkräfte. Leere Karten („keine Wortliste“, „kein Transkript“) werden Lernenden nicht gezeigt.
- Lehrkräfte-Start am Handy rechts abgeschnitten (Grid ohne `minmax(0,1fr)`); Überschrift am Desktop ausgewogen umbrochen.
- 320 px: Fortschritt-Kacheln und Lerntipps-Schritte liefen über.
- Meldung nach der Korrektur lag über dem Prüfknopf → am Handy oben; Text „x von y richtig“.
- „Mehr“-Blatt ohne Lücken im Raster.
- **Zurück-Taste/Wischgeste** verließ die App → `verlauf.js`; Ansichten sind direkt verlinkbar (`?seite=fortschritt`, `?seite=vokabeln&buch=…`).
Bewusst nicht geändert: Reihenfolge im Buch (Anhang A zuerst) folgt der Lista cronologica (S. 161 ff.).
Weitere Ideen: Dialoge (Übungsauswahl, Darstellung) beim Zurückwischen nur schließen; Startseite für neue Nutzer ohne „0/0/0“-Kacheln; CSS-Schichten (10 Dateien, spätere überschreiben frühere) zusammenführen.

## 6b. Neues Erscheinungsbild (26.10.2026)
- **Farbwelt „daje“** (themes.css/skins.css, Standard für neue Nutzer; gespeicherte Wahl bleibt): warmes Papier `#f6f2ea`, Tinte `#1c1a17`, Indigo `#2b3bb5` für Aktionen, Tomatenrot `#c7361d` (accent2) für Marke, Fortschritt, Hervorhebung; flache Karten ohne Glas/Unschärfe; Dunkelmodus. Kontraste ≥ 4,7:1.
- **Hör-Cover** (portal.js `generatedCoverHTML`): typografische Titelbilder, Farbe nach Sprache (IT rot, EN blau, FR türkis), Art (Lied/Film/Video/Audio/Dialog). Keine Bilder mehr von img.youtube.com (Datenschutz, Bildrechte); lokale Standbilder nur noch im Player.
- **Startseite Lernende**: Tagesziel-Ring, „Weitermachen/Zum Einstieg“, drei Schnellzugriffe, „Für dich“ als waagerechte Leiste am Handy; Zähler erst, wenn es etwas zu zählen gibt.
- Zurückwischen schließt geöffnete Dialoge/Blätter, ohne die Seite zu wechseln.

## 6c. Ausbau (26.10.2026, zweite Runde)
- **Fokus-Modus**: eine Aufgabe pro Bildschirm (Standard < 900 px), Weiter/Zurück, Abschnittsetikett aus Präfix („Prima dell’ascolto: …“), Hinweis auf offene Aufgaben.
- **Hausaufgabe** (aufgabe.js), **Eigene Übungen** (studio.js) mit Teilen per Link ohne Server.
- **Lernserie** (features.js `learningStreak`), Lob bei Tagesziel und „Alles richtig“.
- **Icon**: das ursprüngliche Ohr-Icon bleibt (Wunsch des Auftraggebers); klein neben dem Namen in der Kopfzeile; PNG 180/512 daraus erzeugt, manifest.webmanifest (display „browser“, damit der Lernstand nicht in einen getrennten Homescreen-Speicher wandert).
- **Darstellung**: 5 Farbwelten (daje, heft, graphit, wald, tag), 3 Schriften (Standard, Atkinson, Lora); alte Wahl wird abgebildet (app.js `RETIRED_SKINS`).
- **Bedienung**: Wörter nachschlagen über alle Listen; Lehrkräfte-Ansicht fragt einmal nach (Lösungen sichtbar); „Eigene Übungen“ in der Navigation für Lehrkräfte; iOS-Eingabezoom verhindert.
- **CSS**: 10 Dateien → app.css, Regeln entfernter Farbwelten/Schriften gestrichen; Pixelvergleich aller Ansichten vorher/nachher.
- Redaktion (Lehrkräfte) bewusst nur auf Deutsch; Lernenden-Texte in IT/EN/FR übersetzt.
- e2e: 25 Prüfungen (Fokus-Modus, Hausaufgabe, Redaktion neu).

## 6d. Druck (26.10.2026)
- Aufgabenblatt: Abschnittsüberschriften aus den Präfixen, kurze Antworten zweispaltig, Link-Kasten mit QR rechts, Seitenzahlen und „daje · theis“ im Seitenrand (@page hb, Chrome; Safari ignoriert es), Quellenangabe ohne interne Prüfvermerke.
- Lösungen: Kurzantworten zeigen jetzt die Lösung (vorher leer).
- Neu: „Kurzer Schlüssel“ (eine Tabellenzeile pro Aufgabe, Punkte, Summe), meist eine Seite.
- Wortlisten: Seitenaufteilung exakt (267 mm Druckhöhe), gleiche Schriftgröße/Zeilenhöhe in Vorschau und Druck; vorher Überlauf bzw. halbleere Seiten.
- Prüfskripte zum Nachbauen: Playwright `page.pdf()` nach `printTeaching(0|1|2)` bzw. `openVocabDoc(id)`, Klasse `printing-teaching` setzen, `emulateMedia({media:'print'})`.

## 7. Offene Punkte
- Verbtabellen-Scan S. 188–189, 192–193, 196–197 prüfen; fehlende Verben ergänzen.
- Ecco 3 più importieren (nach Scan, exakte Kapitelzuordnung).
- Hör-Aufgaben mit Transkript/Audio neu ableiten; Pipeline automatisieren (siehe 4).
- mebis-Einbettung (`?hoeren=ID&embed=1`) in mebis selbst testen; BBC/NPR/TED-Pakete anlegen.
- Supabase/gemeinsames theis-Login: nur Konzept (`uebergabe/08`), nichts gebaut/angelegt.
- IPA: Feld vorhanden, keine Daten; Quelle/Prüfung klären.
- Druck: Kästchen/Buchstaben (A–D) im iOS-PDF auf echtem Gerät prüfen (Seitenaufteilung jetzt berechnet, siehe 6d).
- Domain `daje.theisapps.de` einrichten (CNAME in `portal/dist/CNAME` prüfen).
- Test-/Prüf-Doku modernisieren (alte Namen ripassà in Docs).

## 8. Schnellstart
```sh
cd portal/dist && python3 -m http.server 8765      # App auf http://localhost:8765
cd portal && npm install && npm test && node tests/e2e.test.cjs   # e2e startet eigenen Server; passt die Playwright-Version nicht zum installierten Browser: CHROMIUM_PATH=/pfad/zu/chrome
python3 werkzeuge/hoeren/build.py && python3 werkzeuge/hoeren/alt.py && python3 werkzeuge/ecco_import.py && node werkzeuge/bundle_stock.cjs
python3 werkzeuge/qualitaet.py --ipa
```
Hinweis: Das Repo enthält keine Scans, keine Liedtexte, keine Schlüssel.
