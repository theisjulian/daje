# Schritt 1: Lesbarkeit und Browser-Tests (25. Oktober 2026)

Keine neuen Funktionen und keine Inhaltsänderungen.

## Geändert
- Alle JavaScript- und CSS-Dateien in portal/dist mit Prettier formatiert (Einstellungen: portal/.prettierrc.json).
  portal.js: 80 auf 846 Zeilen, app.js: 60 auf 634, features.js: 55 auf 589. Lange HTML-Textvorlagen bleiben einzeilig.
- portal/tests/e2e.test.cjs neu: Browser-Test mit Playwright (13 Prüfungen): Start, Katalog (18 Übungen),
  Direktlink und Korrektur, verknüpfte Wörter, Wortschatzhinweise (gelata/gelato), alle 12 Farbwelten in hell und dunkel
  plus Tageslicht, Profilimport, Ablehnung ungültiger Pakete, alle 18 Übungen öffnen, Handybreite ohne Querscrollen,
  keine Konsolenfehler.
- portal/package.json (Skripte start, test, test:browser, format) und pruefen.py (Option --browser). Die Hashprüfung
  gegen SOURCE-SNAPSHOT.json entfällt, weil sich die Dateien absichtlich geändert haben.

## Nachweis, dass sich nichts geändert hat
- Die drei bisherigen Node-Tests und die Syntaxprüfung laufen unverändert grün.
- Der Browser-Test läuft mit dem Original und mit der formatierten Fassung grün.
- 28 Screenshots (Desktop, Handy, alle Farbwelten hell und dunkel) von Original und formatierter Fassung sind
  pixelgleich. Einzige Ausnahme: 9 Pixel bei einer Zahl in der Wortrunde, weil dort zufällig gemischt wird.

## Nicht geprüft
YouTube-Wiedergabe, Betriebssystem-Druck, Safari und iOS.
