# daje · Übergabe an den nächsten Chat (Stand 26.10.2026)

Dieses Dokument ersetzt für den Einstieg `START-HIER.md` und die älteren Dateien unter `uebergabe/01–07` (die noch den alten Namen „ripassà“ und frühere Stände enthalten). Neuere Entscheidungen: `uebergabe/08-ENTSCHEIDUNGEN.md`.

## 1. Was ist daje?

Buildlose Browser-Anwendung für Lehrkräfte und Lernende (viel iPad/iPhone) von Julian Theis (Marke „theis“, Lehrer für Englisch/Italienisch, OVMG München):
- **Hörverstehen**: Katalog von Hörübungen (Audio, YouTube-Einbettung, Film-Karte, Weblink-Karte, Browser-Sprachausgabe) mit Aufgaben (7 Typen), Korrektur mit Erklärungen, Transkript-Hilfe, Lehrkräfteansicht (Aufgabenblatt/Lösungsschlüssel als A4/PDF/Word, QR-Code, Einbett-Link).
- **Wortschatz**: Lehrbuch-Listen (Primo anno und 2,; Lernjahr folgt) nach Buch → Unità/Lezione/Seiten wählbar; Üben (Karten, Schreiben, Zuordnen, Definitionen, Bildimpulse), Spaced Repetition, Druck/Word-Dokumente, Verbentrainer (5 Zeiten, regelmäßig + unregelmäßig).
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
- Lehrwerk-Importe: jedes Wort muss dem richtigen Kapitel/der richtigen Seite zugeordnet sein; bei Zweifel Scan erneut lesen.
- Commits enden mit `Co-Authored-By: Claude … <noreply@anthropic.com>` und `Claude-Session: …`.

## 3. Aufbau des Quellcodes

```
portal/dist/            ← die gesamte App (statisch, kein Build). Nur <script defer> in index.html; Reihenfolge zählt,
                          spätere Dateien überschreiben Funktionen früherer (z. B. printTeaching in dialog.js).
  index.html            Einstieg, Skriptreihenfolge, CSS-Reihenfolge (mobile.css zuletzt)
  data.js features.js app.js      Lernlogik Wortschatz (Karten/Schreiben/Zuordnen), Sitzung, Fortschritt
  grading.js            Antwortbewertung (Artikel-/Akzent-/Tippfehler-Toleranz, Synonyme)
  content-contract.js   Paketschema 1.0–1.2 + validatePackage (entfernt unbekannte Felder!)
  portal.js views.js    Hörverstehen: Katalog, Übungsseite, Lehrkräfteansicht, Profil/Backup
  hoerblatt.js docs.js dialog.js   Druck/Word: Aufgabenblatt, Vokabeldokument, Dokumentdialog (Vorschau + Anpassen)
  wortschatz.js wortschatz.css     Wortschatz-Hub (Buchcover-Kacheln, Lektions-/Seitenwahl, Auswahl)
  verbs.js verbs.css    Verbmaschine (VB_DATA [inf, de, gruppe, klasse, overrides] → vbBuild)
  shell.js extras2.js catalog.js instr.js publish.js studio.js qr.js   Navigation, Redaktion, QR, Anweisungstexte
  i18n.js i18n-rows.js i18n-simple.js   UI-Texte (Zeilen [de,it,en,fr,it-simple]); *-simple.js für EN/FR einfach
  listening-data.js review-data.js stock-data.js listening-extra.js   Inhalte (Seeds; stock-data.js GENERIERT)
  themes.css skins.css style.css lessico.css portal.css design.css docs.css mobile.css   Gestaltung
  assets/ examples/ imports/(KI-Kommandodatei.md, Gemini-Folgeprompt.md)
portal/tests/           npm test (content, grading, progress, verbs) + e2e.test.cjs (Playwright, 19 Prüfungen)
grundstock/listening/   25 Lied-/Film-Pakete (GENERIERT aus werkzeuge/hoeren)
grundstock/vocabulary/  60 Wortschatzpakete (GENERIERT aus werkzeuge/ecco*/…)
inhalte/                die 15 älteren Hörpakete im Original (Seeds liegen in listening-data/review-data)
werkzeuge/              Automatisierung (siehe 4)
uebergabe/              ältere Doku 01–07, neu: 08-ENTSCHEIDUNGEN.md
```

Daten-/Speicherschlüssel: `ripassa-ui-language-v1`, `ripassa-doc-v1`, `ripassa-editor-v1`, Lernstand-Schlüssel `ripassa-lernstand-…`. Profile liegen in localStorage (je Adresse getrennt!).

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
2. CI führt **keine Tests** und `bundle_stock.cjs … || true` verschluckt Fehler. Besser: Tests + Validierung brechen den Deploy ab.
3. Hörpakete entstehen aus Python-Quelltext (`Q`-Helfer). Es gibt kein Format „Aufgabe schreiben, ohne Python zu können“. Überlegen: YAML/Markdown-Quelle + Prüfer.
4. Lehrwerk-Import ist manuelle Abschrift aus Scans. OCR + Gegenprüfung (Seitenzuordnung!) automatisieren; Kapitelzuordnung muss exakt sein.
5. KI-Pipeline (Gemini) ist gebaut, aber nie gelaufen; Schlüssel liegt bei Julian. Ablauf, Prompt-Qualität (10–20 Aufgaben in Blöcken, Typenmix, Transkript-Treue) und Validierung gegen `qualitaet.py` testen.
6. Aufgabenqualität: Die 25 Lied-/Film-Pakete wurden **ohne Zugriff auf Audio/Video** geschrieben (nur Fakten/Allgemeinwissen). Echte Hör-Aufgaben brauchen Transkript (privater Import) → Pipeline „Transkript → Aufgaben → Prüfung“ bauen.
7. `qualitaet.py` findet: bei 74 Einzelauswahl-Aufgaben ist die richtige Option die längste (Test-Trick), 167 Wörter ohne Beispielsatz (v. a. Redemittel/Arbeitsaufträge).
8. `MANIFEST-SHA256.json`, `INHALTSINVENTAR.json`, `PRUEFPROTOKOLL.txt`, `SOURCE-SNAPSHOT.json`, `provenance.json`, `pruefen.py` stammen vom alten Paket und sind veraltet (nicht mehr generiert).
9. Erklärungen/Beispielsätze der Wortschatzpakete sind eigene KI-Formulierungen (kein Buchtext), fachlich nicht von einer Lehrkraft geprüft; `reviewNotes` sagen das.

## 5. Stand der Inhalte
- Hören: 25 Lied-/Film-Pakete (50 Special, American Pie, C’è ancora domani, Don’t Look Back in Anger, Don’t Look Up, Fairytale of New York, I Want It That Way, La vita è bella, Lay All Your Love On Me, Perfetti sconosciuti, Stan, Tu si a fine do’ munno) in Stufen; 15 ältere Pakete mit Transkript (davon 12 erweitert; Rai-Paket entfernt). Katalog zeigt 42.
- Wortschatz: Primo anno und 2 vollständig (Wortliste), Anhang A (Alphabet-Redemittel, Arbeitsaufträge, **Zahlen 0–2 Mrd., Ordnungszahlen, Wochentage, Monate**). Feld `contrast` = „Unterscheide“-Kasten, `related` = E/F/L-Verwandte, `definition`/`example` eigene Texte.
- Verben: ~80 Verben; Abgleich mit Scan Lernjahr 2 S. 186–191 und 194–195 erfolgt; **S. 188–189, 192–193, 196–197 nicht gesichtet**.
- Medientyp `link` (BBC/NPR/TED) vorhanden, aber noch ohne Paket.

## 6. Letzte Änderungen (diese Sitzung)
Cover-Kacheln; 50 Special nur Lied; alte Pakete 11–24 Aufgaben; Rai entfernt; Erklärungen für alle Wörter; Umbenennung in daje (Icon C = Ohr); Hörseiten mobil neu (`mobile.css`); iOS-Druckfehler (nur 1 Seite) behoben: `do-print` hält `printing-teaching` bis `afterprint`; Seitenumbruchberechnung (`dlgPaginate`) korrigiert; Dokumentdialog mit großer echter Vorschau, Design als Chips, „Anpassen“-Blatt; Unterscheide-Kästen; EN/FR einfach; Qualitätsskript; fachliche Überarbeitung aller Hörpakete (`werkzeuge/hoeren/review.py`).

## 7. Offene Punkte
- Verbtabellen-Scan S. 188–189, 192–193, 196–197 prüfen; fehlende Verben ergänzen.
- Lernjahr più importieren (nach Scan, exakte Kapitelzuordnung).
- Hör-Aufgaben mit Transkript/Audio neu ableiten; Pipeline automatisieren (siehe 4).
- mebis-Einbettung (`?hoeren=ID&embed=1`) in mebis selbst testen; BBC/NPR/TED-Pakete anlegen.
- Supabase/gemeinsames theis-Login: nur Konzept (`uebergabe/08`), nichts gebaut/angelegt.
- IPA: Feld vorhanden, keine Daten; Quelle/Prüfung klären.
- Druck: Kästchen/Buchstaben (A–D) im iOS-PDF ggf. prüfen; Seitenkapazität im Druck (`inner = 1122 − padding − 100`) ist ein Erfahrungswert → sauberer berechnen.
- Domain `daje.theisapps.de` einrichten (CNAME in `portal/dist/CNAME` prüfen).
- Test-/Prüf-Doku modernisieren (alte Namen ripassà in Docs).

## 8. Schnellstart
```sh
cd portal/dist && python3 -m http.server 8765      # App auf http://localhost:8765
cd portal && npm install && npm test && node tests/e2e.test.cjs   # e2e braucht Playwright + laufenden Server
python3 werkzeuge/hoeren/build.py && python3 werkzeuge/hoeren/alt.py && python3 werkzeuge/ecco_import.py && node werkzeuge/bundle_stock.cjs
python3 werkzeuge/qualitaet.py --ipa
```
Hinweis: Das Repo enthält keine Scans, keine Liedtexte, keine Schlüssel.
