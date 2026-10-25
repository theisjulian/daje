# Architektur des gelieferten Portals

## Laufzeit

Buildlose statische Anwendung mit klassischen Browser-Scripts und gemeinsamem globalem Zustand. Kein React, kein TypeScript, kein Bundler, kein Node-Backend, kein npm-Paket und keine Datenbank. Node wird nur für die automatisierten Tests benötigt. Kein Service Worker und keine vollständige Offlinegarantie. Dateien werden per relativem Pfad geladen; der gesamte Inhalt von dist muss gemeinsam bereitgestellt werden.

## Verbindliche Scriptreihenfolge

index.html lädt per defer: data.js → learning-tips.js → features.js → grading.js → content-contract.js → listening-data.js → thumbnail-data.js → review-data.js → studio.js → portal.js → i18n.js → app.js. Die Funktionen früherer Dateien greifen erst bei Aufruf auf später initialisierte Globals zu. Die Reihenfolge nicht beliebig ändern. app.js startet setupExtras(), setupPortal() und setupI18n(). Anschließend wird ein Listening-Direktlink oder die Startansicht geöffnet.

CSS-Reihenfolge: themes.css → style.css → lessico.css → portal.css. Themenvariablen und spätere Überschreibungen beachten. Für neue Komponenten bestehende Variablen verwenden; nicht nur die Standardfarbwelt gestalten.

## Zuständigkeiten

- data.js: Grundwortschatz, Gruppen, Verben und Bildquellen.
- learning-tips.js: vorhandene neun Lerntipps und Studienangaben; noch nicht vollständig auf die zuletzt dokumentierte Recherche umgestellt.
- features.js: lokale Profile, Migration und validierte Backups, Tagesaktivitäten, Matching, erweiterte Hilfe und Fortschrittsübersicht.
- grading.js: reine Vokabelvergleichslogik, Artikelregeln und gezielte Hinweise; Browserglobal TheisGrading und CommonJS-Export für Tests.
- content-contract.js: struktureller Inhaltsvalidator und Hörantwortprüfung; Browserglobal TheisContent und CommonJS-Export. Keine fachliche oder rechtliche Freigabe.
- listening-data.js: vier Ausgangshörbeispiele und gemeinsamer Torino-Wortschatz.
- review-data.js: 14 redaktionelle Videokandidaten mit Aufgaben und Quellen.
- thumbnail-data.js: YouTube-ID auf lokale Vorschaubilddatei.
- studio.js: lokale Inhaltsredaktion, Import, Formular, Export und lokale Freigabe.
- portal.js: Kataloge, Rollenansicht, Favoriten, Verlauf, Hörübungen, Medien, Unterrichts- und Druckansicht sowie verknüpfter Wortschatz.
- i18n.js: DE/IT/EN/FR/it-simple, teilweise Textumschaltung über MutationObserver; keine vollständige Lokalisierung.
- app.js: Kernzustand, Vokabeltrainer, Themes, Navigation und Ereignisbehandlung.

## Navigation und Datenfluss

nav(next) setzt die Ansicht und startet render(). Es handelt sich nicht um einen vollständigen Router. data-nav-Aktionen und data-portal-Aktionen steuern die Oberfläche. Listening-Direktlinks verwenden ?hoeren=<Paket-ID>. Vokabelkonfiguration verwendet kapitel, umfang, modus, richtung und anzahl. Interne Richtungswerte de-it und it-de sind historische Namen und werden auch für andere Zielsprachen verwendet; nicht als Beweis ausschließlicher Italienisch-Unterstützung auslegen.

contentList('listening') kombiniert LISTENING_SEEDS, LISTENING_REVIEW_SEEDS und passende lokale Pakete. Gleichnamige lokale Pakete überschreiben Seeds in der aktuellen Browseransicht. Arbeitsfassungen des privaten Katalogs werden bewusst angezeigt, auch wenn sie keine globale Freigabe besitzen. contentList('vocabulary') erzeugt aus integriertem Wortschatz eigene Ansichtsobjekte und ergänzt lokal freigegebene Wortlisten.

allTrainingWords() bildet importierte Einträge auf Trainerobjekte ab; die Wort-ID wird aus Paket-ID + Bindestrich + Eintrags-ID zusammengesetzt. Paket-IDs und Wort-IDs daher stabil halten. Diese Verkettung ist kein robustes serverweites Schlüsselschema und sollte bei einer DB-Migration auf mögliche Kollisionen geprüft werden. Beide Aufgabenniveaus eines Mediums würden bei eigenen Paket-IDs zunächst eigene Wort-IDs erhalten; eine gemeinsame Wortidentität ist künftig ausdrücklich zu entwerfen.

## Medien

audio verwendet einen normalen HTML-Audioplayer. speech verwendet Browser-Sprachausgabe; Verfügbarkeit und Stimmen hängen vom System ab. youtube zeigt zunächst einen Ladehinweis und erzeugt nach Nutzeraktion ein iframe auf youtube-nocookie.com. Kein Video-Download, kein API-Zugriff auf Untertitel und keine serverseitige Transkription. Vorschaubilder sind lokal, mit externem Retry und lokaler Ersatzillustration bei Fehlern. Das aktuelle Schema hat keine start/end-Medienfelder; beschriebene Ausschnitte steuern noch keine präzise Begrenzung des Players.

## Druck

showTeaching() und printTeaching() erzeugen getrennte Aufgaben- und Lösungsvorschauen. CSS-Klassen steuern Druckansicht und window.print(). Keine PDF-Engine oder geschützte Onlineprüfung. Eine komfortable separate Transkriptdruckfunktion ist noch als Anforderung zu behandeln, nicht als vollständig geprüftes Feature.
