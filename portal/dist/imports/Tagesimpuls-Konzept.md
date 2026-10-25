# Automatischer Tagesimpuls für das Sprachlernportal

Julian Theis · Prüfkonzept vom 25. Oktober 2026. Noch kein Zeitplan und keine KI-Pipeline aktiviert.

## Empfehlung

Ein täglich wechselnder Impuls aus einem redaktionell freigegebenen Vorrat bietet täglich fertige Aufgaben ohne tägliche Redaktion. Das ist eine erneute Empfehlung vorhandenen Materials, nicht automatisch täglich neu erzeugter Inhalt. Die Anzeige darf keine neue Übung behaupten, wenn nur ein bekannter Beitrag hervorgehoben wird. Ein optionaler Vorabkalender und spätere automatische Entwurfsproduktion ergänzen den Vorrat.

## Drei Betriebsmodelle

1. Datumsabhängige Auswahl aus geprüften Medien und Aufgabenapparaten. Bereits statisch mit einem veröffentlichten JSON-Plan möglich, ohne Login, Datenbank, täglichen Build oder KI-Aufruf. Auswahl aus stabilen IDs und Aufgabenrevisionen pro Datum und Sprache/Niveauband. Eine Rotation muss auf einem stabilen Plan beruhen, damit Katalogänderungen nicht nachträglich frühere Tagesimpulse verschieben.
2. Redaktioneller Veröffentlichungskalender: kommende Wochen oder Monate in einer Sitzung planen. Die Startseite fragt beim Öffnen den heutigen freigegebenen Eintrag ab. Für diese Anzeige ist kein nächtlicher Schreibjob notwendig. Ein serverseitiger Dienst liefert bei Bedarf das Datum in Europe/Berlin; ein rein statischer Client ist von der Geräteuhr abhängig. Cachegültigkeit, Sommerzeit, Tageswechsel bei offenem Tab und Archiv festlegen. Vorratswarnung und Medienkontrollen können zusätzlich zeitgesteuert laufen.
3. Automatische Recherche und Entwurfsproduktion: ein serverseitiger Job findet Kandidaten aus ausgewählten Quellen, beschafft tatsächlich verfügbare Transkriptgrundlagen und lässt eine KI strukturierte Aufgaben vorschlagen. Validierung und Dublettenprüfung folgen. Ausgabe bleibt privater Entwurf. Geprüfte Freigabe überführt den Inhalt in den Vorrat; keine blinde Live-Veröffentlichung. Schema-Treue ist keine Gewähr für richtige Transkripte, Lösungen, GER oder Nutzungsrechte.

## Anzeige und Bedienung

Empfohlene Bezeichnung: Impuls des Tages oder Heute hören. Sprache und gewünschtes Niveau sind auch ohne Konto auswählbar. Gleicher Datumsplan je Sprache/Niveauband; ein optionales Konto merkt die Präferenz und Bearbeitung. Innerhalb eines Tages stabil, kein zufälliger Wechsel bei Neuladen. Lehrkraftansicht zeigt Material, Transkript und Aufgabenapparate; Lernansicht startet die Übung. Weitere passende Apparate nur anbieten, wenn geprüft, kein künstlicher A1-bis-C2-Baukasten. Archiv älterer Impulse. Bei bereits bearbeitetem Impuls optional eine zusätzliche Empfehlung, den gemeinsamen Tagesimpuls aber beibehalten.

Für Sprache/Niveau ohne freigegebenen Inhalt offen „noch kein Tagesimpuls“ zeigen oder eine sachlich passende Alternative anbieten; keine ungeeignete Stufe unterschieben. Bei ausgefallenem Medium eine vorbereitete, freigegebene Ersatzübung oder eine klare Fehlermeldung verwenden. Automatische Erreichbarkeit kann Einbettungs- und Wiedergabeprobleme nicht vollständig erkennen. Entwürfe, offene Rechte und zurückgezogene Versionen sind nie Auswahlkandidaten.

## Redaktion und Nachschub

Im Backend: Teilnahme am Tagespool, geeignete Zielstufen und Apparate, Authentizität/Textart, Transkriptherkunft und Prüfstand, Freigabe, Quelle/Nutzungsrechte, Zeitraum und manuelle Sperre. Vorrat mit kommenden belegten Tagen anzeigen. Warnung etwa bei weniger als 14 geplanten Tagen je tatsächlich angebotener Kategorie; dieser Grenzwert ist ein Vorschlag. Kleine Vorräte erfordern Wiederholungen oder längere Wechselintervalle. Beispielsweise 60 unterschiedliche geeignete Pakete reichen für 60 Tage bei genau einem Paket pro Tag; nicht zugleich für 60 neue Tage in jeder Sprache und jeder Niveaustufe.

## Technische Optionen

Für den Start statischer Plan mit Datumsschlüssel und veröffentlichten Paket-IDs. Später Supabase für geschützte Redaktion, Medieneinträge und geplante Tagesplätze. Die Anzeige kann ohne Cron aus dem Datum lesen. Cron nur für Hintergrundaufgaben wie Vorratswarnung, Medienstatus oder KI-Entwurfsproduktion. API-Schlüssel bleiben serverseitig; keine automatische Analyse je Seitenaufruf. Jobs protokollieren, Limits, Wiederholung bei temporären Fehlern und Dublettenvermeidung vorsehen. Monatliches Budget und maximale Kandidaten-/Tokenzahl konfigurieren. Bei Fehlern bleibt der freigegebene Vorrat nutzbar.

GitHub Actions ist eine mögliche Hintergrundalternative, aber geplante Läufe können verspätet oder ausgelassen sein. Deshalb nicht den einzig verfügbaren Tagesinhalt erst kurz vor Anzeige generieren. Die Kosten einer einfachen Datumsrotation bestehen hauptsächlich aus bestehendem Hosting; neue KI-Analyse hat modell-, Medien-, Such- und mengenabhängige API-Kosten. Erst mit einer kleinen Pilotserie messen, kein pauschaler Kostenbetrag oder zuverlässige Gratisproduktion versprechen.

## Quellen für Claude

Supabase Cron: https://supabase.com/docs/guides/cron
Supabase geplante Funktionen: https://supabase.com/docs/guides/functions/schedule-functions
GitHub Zeitpläne und Einschränkungen: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
Gemini strukturierte Ausgabe: https://ai.google.dev/gemini-api/docs/structured-output
Gemini Videoanalyse: https://ai.google.dev/gemini-api/docs/video-understanding
Gemini API-Kosten: https://ai.google.dev/gemini-api/docs/pricing

Der Auftrag prüft die Möglichkeiten und dokumentiert die Zielarchitektur. Eine automatische tägliche Veröffentlichung oder kostenpflichtige KI-Nutzung wurde nicht eingerichtet.
