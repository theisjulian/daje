# Start Prüfung und Veröffentlichung

## Voraussetzungen

Ein moderner Browser; Python 3 zum statischen lokalen Start; Node.js mit den eingebauten Modulen node:assert/strict, node:vm und structuredClone für Tests. Keine Fremdpakete nötig. Die bei dieser Übergabe tatsächlich verwendeten Versionsnummern stehen in provenance.json. Eine bestimmte ältere Mindestversion wurde nicht gesondert getestet.

## Start und automatische Prüfung

```sh
cd portal
python3 -m http.server 8080 --bind 127.0.0.1 --directory dist
```

Browser: http://127.0.0.1:8080 . Die Hauptseite muss über HTTP geöffnet werden; file:// ist nicht gleichwertig. Für eine feste lokale Lernumgebung Adresse und Port beibehalten. Zum isolierten Testen ein eigenes Browserprofil verwenden, keine echten Lernstände zurücksetzen.

In einem zweiten Terminal, ebenfalls in portal:

```sh
node tests/content.test.cjs
node tests/grading.test.cjs
node tests/progress.test.cjs
```

Alternativ im Paketwurzelverzeichnis `python3 pruefen.py`. Dieser Zusatz führt Syntaxprüfung aller JS-Dateien, die drei mitgelieferten Tests, Beispielvalidierung, Seedvalidierung und einen Hashvergleich der Originaldateien aus. Er verändert keine Lernstände und startet keine Veröffentlichung.

## Was die Tests leisten

content.test.cjs prüft Format, doppelte IDs, ungültige Referenzen, unsichere Medienadressen, unbekannte Versionen, Feldbereinigung und 1.1-Inlinewortschatz. grading.test.cjs prüft Artikelregeln, Genus- und Akzenthinweise, konservative Tippfehlerbehandlung und Varianten. progress.test.cjs prüft lokale Migration, Profilisolation, Sicherungsvalidierung, Tageszählung und Portalbackups. Keine Browser-End-to-End-Suite; Bestandstests verwenden teilweise eine VM und Ausschnitte aus den Dateien. Bei größerem Refactoring ihre Funktionsweise mitprüfen.

## Manuelle Abnahme

- Frischer Browser: Start, beide Ansichten, alle Navigationen, Filter und Direktlink öffnen.
- Alle zwölf Themes hell/dunkel prüfen; Tageslichtphasen gesondert betrachten. Schmale Geräte, Tastatur und sichtbaren Fokus testen.
- VOA-Datei tatsächlich abspielen. YouTube erst nach Ladeaktion öffnen und an mehreren Quellen testen; gesperrte Videos müssen verständlich scheitern. TTS-Verfügbarkeit separat prüfen.
- Je einen Hörtyp richtig/falsch beantworten, Kurzantwortvariante, Transkripthilfe, Notiz, Favorit, Verlauf und erneute Runde prüfen.
- Torino → Wörter dieser Übung → sechs Wörter → Karten/Schreiben/Zuordnen/Definitionen. Einträge ohne Definition deaktivieren den entsprechenden Modus sinnvoll.
- gelata → Genushinweis; gelato ohne erforderlichen Artikel → Hinweis; il gelato → richtige Antwort, gegebenenfalls mit Hilfe. Falsche Kurzformen nicht unscharf akzeptieren.
- Zwei lokale Profile anlegen, wechseln, exportieren/importieren und neu laden. Separate Inhaltspakete im Redaktionsbereich prüfen. Keine Profilvermischung.
- Gültige 1.0- und 1.1-Beispiele importieren; Fehlerdatei darf keine bestehenden Daten ändern. Lokale Freigabe bleibt lokal.
- Aufgaben- und Lösungsausgabe real über den Druckdialog prüfen. Browseransicht allein ist kein Nachweis des Druckergebnisses.

## Verifikationsstand dieses Exports

Alle drei Node-Tests wurden erneut erfolgreich ausgeführt. Das Prüfprotokoll nennt zusätzliche Paket- und Syntaxprüfungen. Frühere Browserprüfungen sind im Original-README dokumentiert. Für diesen unveränderten Export wurde keine neue umfassende Browserprüfung aller Ansichten, Mobilgeräte oder Videos durchgeführt. Insbesondere YouTube-Playback aller 14 Kandidaten, Betriebssystem-Druck und zukünftiger Login sind nicht als vollständig geprüft auszugeben.

## Hosting

Für statisches Hosting den Inhalt von portal/dist als Webroot verwenden. Es gibt keinen Buildschritt. Bei GitHub Pages den gewünschten Branch und Ausgabepfad bewusst konfigurieren; kein Push oder Freigabeschritt ist automatisiert. Der Benutzer hat theisjulian/test als Testziel autorisiert; Zugang muss noch funktionieren. theisjulian/app bleibt read-only.

portal/.openai/hosting.json bindet die vorhandene Sites-Projektidentität. Sie unverändert lassen, wenn am selben Projekt gearbeitet wird; beim Wechsel auf einen anderen Dienst nicht blind neue Sites-Projekte anlegen. Wer keine Sites-Werkzeuge hat, kann die Anwendung lokal vollständig starten. Dieses ZIP enthält keine Deploy-Zugangsdaten und überträgt keine Accountberechtigungen.
