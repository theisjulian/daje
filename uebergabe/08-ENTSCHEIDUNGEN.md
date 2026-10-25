# Entscheidungen und Konzepte (Stand 25.10.2026)

## Supabase / gemeinsames theis-Login
- **Entscheidung:** Zunächst bleibt daje ein reines Frontend ohne Konto; Lernstände liegen im Browser (Export/Import als Sicherung).
- Wenn ein Konto kommt, dann **ein gemeinsames theis-Konto für alle Apps** (ein Supabase-Projekt, Auth per E-Mail-Link, Tabellen je App mit Row-Level-Security: jede Zeile gehört `auth.uid()`).
- Synchronisiert würde nur das Lernprofil (Fortschritt, Merkliste, Notizen); Inhalte bleiben statisch im Repo.
- Der Knopf „Konto“ erscheint erst, wenn die Funktion existiert. Datenverlust-Regel: lokale Daten werden beim ersten Anmelden **zusammengeführt**, nie überschrieben.
- Vorher nötig: Datenschutzhinweis, Löschfunktion, Entscheidung über Schülerkonten (Schule!). Projektliste wurde geprüft; es wurde nichts angelegt.

## IPA (Lautschrift)
- Feld `ipa` im Paket ist vorgesehen und wird auf der Karte angezeigt, **wird aber nicht von der KI erfunden**.
- Quelle nur: geprüfte Wörterbuchdaten (z. B. Wiktionary-Auszug mit Lizenzvermerk) oder von der Lehrkraft eingetragen.
- Automatische Plausibilitätsprüfung: `python3 werkzeuge/qualitaet.py --ipa` (erlaubte Zeichen, Silbenzahl passt zur Schreibung). Das ersetzt keine fachliche Prüfung; geprüfte Einträge bekommen `reviewed`.
- Vorerst sind keine IPA-Werte im Grundstock.

## mebis / H5P-Einbettung
- daje lässt sich per `?hoeren=ID&embed=1` in einen iframe einbetten (Kopf, Navigation und Leiste entfallen; Fußzeile „daje · © 2026 theis“).
- In mebis (Moodle) funktioniert das als „Externes Tool“ oder als `<iframe>` im Textfeld, sofern der Editor iframes zulässt. Das Einbetten **auf der Seite von mebis selbst konnte von hier aus nicht getestet werden** (kein Zugang). Bitte einmal testen; falls iframes gefiltert werden, bleibt der Link/QR-Code.
- Eine H5P-Form ist nicht geplant; die Aufgaben sind eigene Typen.

## Externe Medien (BBC, NPR, TED …)
- Neuer Medientyp `link` (`{ "type": "link", "url": "https://…", "provider": "BBC" }`): Karte mit Knopf „Beim Anbieter öffnen“, keine Einbettung, kein Download.
- Gilt für alles, was nicht per YouTube-Einbettung läuft. Rechte beim Anbieter prüfen.

## Qualitätsprüfung
- `python3 werkzeuge/qualitaet.py` prüft alle Pakete (und Gemini-Stapel-Ordner): doppelte Aufgaben/Optionen, Lösung nicht in Optionen, fehlende Erklärungen/Beispiele, Definition enthält das Zielwort, Aufgabenzahl, Typenvielfalt.
- Bekannter Befund: Bei Einzelauswahl-Aufgaben ist die richtige Option oft die längste. Beim Überarbeiten der Aufgaben darauf achten (Distraktoren gleich lang formulieren).
