# Tatsächlicher Stand und offene Arbeit

## Vorhanden

Portalstart, Hörkatalog, Sprach-/Niveaufilter und Textsuche; 18 Hörmaterialien inklusive 14 YouTube-Arbeitsfassungen; eingebetteter Videoplayer nach Nutzeraktion; vier Ausgangsbeispiele einschließlich lokalem VOA-Audio und drei Browserstimmendemos; Aufgabenkorrektur, Transkriptanzeige und Hilfemarker; Merkliste, Verlauf und persönliche Notizen; Lehrkraftansicht mit getrennten Druckvorschauen; lokaler Import und Formularbearbeitung; Wortschatzbibliothek, Trainingsmodi und verknüpfter Aktivitätswortschatz; Profilexport/import; zwölf Themes; teilweise mehrsprachige UI.

Der Grundwortschatz enthält 133 Einträge sowie fünf Verben als Presente-Probe. Das Torino-Beispiel enthält sechs verknüpfte Wörter. Die übrigen vorhandenen Videos erhalten nicht automatisch Wortschatz. 11 der 14 Videopakete haben übermittelte Transkripttexte. Bei drei fehlt die Textgrundlage. Aufgaben, Zeitmarken, Transkripte und Rechte sind nicht allein durch vorhandene JSON-Daten unabhängig bestätigt.

## Nicht fertig oder nicht vorhanden

- Kein echtes Theis-Konto, keine Supabase-Verbindung und keine Cloud-Synchronisierung.
- Keine sichere Redaktionsanmeldung, keine Veröffentlichung neuer Inhalte für andere Browser.
- Keine geschützten Prüfungen, Klassenräume oder zentrale Schülerbewertung.
- Kein gemeinsamer GER-Niveauschalter für mehrere Apparate desselben Mediums.
- Kein automatisierter Medienrecherche-/Transkriptionsdienst und kein eingerichteter Tagesimpuls-Job.
- Weitere Hörformate wie Zuordnung, Reihenfolge und Mehrfachauswahl sind nicht implementiert; das Vokabel-Matching ist eine andere Funktion.
- Keine vollständige Lokalisierung, keine vollständigen Lehrwerke Lernjahr/2/3, keine generische Konjugationsengine.
- Kein wissenschaftlich validierter Lernalgorithmus und noch kein vollständig nach Verstehen/Schreiben/Hören getrennter Fortschritt.
- Keine Garantie der Videoverfügbarkeit, Freigabe zum Einbetten oder Rechte am Transkript.

## Empfohlene Reihenfolge

1. Stand lokal reproduzieren und bestehende Tests erhalten. Inhalte und lokale Backups separat sichern.
2. Kritische Inhaltsprüfung: Audiovergleich, Transkripte, Antwortvarianten, Quellen und Rechte.
3. Neue Lernforschung aus Projektdatei umsetzen: geführte Abfrage, Feedback, Wiederholung und nachvollziehbarer Fortschritt. Bestehende Datenmigration planen.
4. Versioniertes Inhaltsmodell nur dort erweitern, wo UI und Validator gemeinsam folgen. Promptdateien synchron halten.
5. Sichere Backendarchitektur und Theis-Login konkret prüfen, bevor Datenbankmigrationen oder Livezugriffe erfolgen.
6. Mehrsprachigkeit, breite Inhaltsproduktion, weitere Aufgabenformen und Tagesimpuls aus geprüftem Vorrat ausbauen.

## Öffentliches Hosting ist eine eigene Abnahme

Der private Prototyp enthält review-data.js und interne Prompts unter dist/imports. Statische Auslieferung macht diese Dateien für zugelassene Besucher abrufbar. Für öffentlichen Betrieb interne Daten aus dem Public-Verzeichnis entfernen und geschützte Entwürfe serverseitig trennen. Ein ausgeblendeter Menüpunkt, noindex oder eine geheime URL stellt keine Berechtigung dar. Auch ein privates GitHub-Repository macht eine Pages-Veröffentlichung nicht automatisch privat.

## Standangaben richtig lesen

Der Quellcommit steht in provenance.json. Die Dateinamen früherer Exporte verwenden teilweise v9 als Arbeitsstandlabel. Der Sites-Dienst meldete beim Export latest_version_number 8. Diese beiden Nummernsysteme sind nicht gleichzusetzen. Weder ein neues Deployment noch eine neue Funktion wurde für dieses Paket ausgelöst. Das beigefügte Original-README ist eine fortgeschriebene Entwicklungshistorie mit älteren, später ersetzten Aussagen; für den aktuellen Stand dieses Dokument lesen.

## Nachtrag 25.10.2026
Erledigt: Hörseiten mobil (mobile.css), Zahlen/Ordnungszahlen/Wochentage/Monate (Lernjahr S. 183–184), Verbtabellen ergänzt (piacere, togliere, raccogliere, cadere, valere, porre), „Unterscheide“-Kästen (Feld `contrast`), Medientyp `link`, einfache Sprache EN/FR (i18n-simple.js, deckt die längeren Texte ab), Qualitätsskript, Entscheidungen (uebergabe/08).
Offen/ehrlich: Verbtabellen-Scan S. 188–189, 192–193, 196–197 nicht gesichtet; mebis-Einbettung nicht in mebis getestet; Supabase nur entschieden, nicht gebaut; IPA ohne Daten; Gemini-Lauf braucht Schlüssel (lokal).
