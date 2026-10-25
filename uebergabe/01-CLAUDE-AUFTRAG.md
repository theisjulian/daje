# Auftrag zur Übernahme

Du übernimmst Julians browserbasiertes Sprachlernportal ripassà. Zuerst das gesamte Paket und den vorhandenen Code prüfen, dann gezielt weiterentwickeln. Vorhandene Funktionen erhalten. Der lesbare Source liegt direkt in portal/dist. Keine Neuentwicklung oder Frameworkmigration allein aufgrund eigener Vorlieben.

## Produkt und Gestaltung

Hörverstehen richtet sich gleichwertig an Lehrkräfte und Lernende. Lehrkräfte finden Unterrichts- und Prüfungsmaterial; Lernende üben selbstständig. Der Wortschatzbereich ripassà. soll mit passenden Wörtern aus jeder Hörübung verknüpft sein. Lehrwerkslisten und weitere Sprachen bleiben zusätzlich möglich. Aktuell enthält Ecco più 1 nur Ciao! und Unità 1, nicht Ecco 1 bis 3 vollständig.

Alle zwölf Gruppo-Farbwelten erhalten: Standard, Apple, Neon, Heft, Salbei, Terrakotta, Graphit, Laguna, Klar, Glut, Wald, Tageslicht. Hochwertige, ruhige, professionelle Gestaltung; intuitive Bedienung auf Desktop, Tablet und Smartphone. Bestehende Schrift-, Komponenten- und Iconwelt beachten. Keine Emojis oder dekorativen Trennlinien hinzufügen. Verständliche Navigation und klare Fehlerzustände sind Teil des Designs.

## Verbindliche Inhaltsregeln

- Medien möglichst direkt einbetten und pro Listening möglichst ein passendes Bild zeigen.
- Vollständiges Transkript des verwendeten Ausschnitts bevorzugen. Fehlendes nicht erfinden.
- Herkunft, Gemini-Hinweise und redaktionelle Prüfnotizen niemals in den sichtbaren Transkripttext schreiben; getrennte Metadaten verwenden.
- Gehaltvolle, abwechslungsreiche Aufgaben; Menge nach Informationsgehalt. Aktuell nur single_choice, true_false, short_answer als Hörformate verwenden.
- Mehrere Aufgabenapparate zu einem Medium sind möglich; GER nicht nur als Etikett vergeben. Es gibt noch keinen gemeinsamen Niveauschalter.
- Authentische Medien für ein allgemeines Publikum besonders ab B1 berücksichtigen.
- Inhalte nur durch autorisierte Redaktion pflegen; kein öffentlicher Gemini-Import für beliebige Besucher.
- Rechtschreib-, Genus-, Artikel- und Bedeutungsfehler sinnvoll unterscheiden. Ein Buchstabe Abweichung bedeutet nicht automatisch richtig.

## Nächster Entwicklungsauftrag

Die zuletzt recherchierten Lernprinzipien vollständig aus der Projektdatei übernehmen. Aktives Abrufen, Wiederholung mit Abstand und Feedback priorisieren. Den vorgeschlagenen geführten Lernmodus und ein nach Lernziel differenziertes Fortschrittsmodell prüfen. Keine Lerntypdiagnose implementieren. Wissenschaftliche Befunde und konkrete Produktheuristiken getrennt halten.

Den Theis-Login sehr genau prüfen: gemeinsame Identität über Portal und perspektivisch Libretto/Voce sowie weitere Apps, sichere Trennung der Daten und Rollen, Gastnutzung, Offlinebetrieb, lokale Datenübernahme, Backup und Synchronisierung. Bisher existiert dafür keine fertige Authentifizierung. Supabase ist Prüfkandidat; laufendes ’namo-Projekt und seine Teilnehmerdaten nicht verändern. Der Backendauftrag ist eine Spezifikation, kein ausführbares Schema.

## Zugriffe und Veröffentlichung

- theisjulian/app nur lesen; keinerlei Push.
- theisjulian/test ist als mögliches Schreibziel autorisiert, bislang aber nicht erreichbar. Nicht eigenmächtig andere Repositorys verwenden.
- Keine Passwörter, Deploy Keys oder service_role-Schlüssel in Browsercode oder Paket schreiben.
- Private Vorschau nicht öffentlich stellen. Redaktionelle Arbeitsfassungen und Prompts sind im statischen Privatprototyp enthalten und nicht für eine öffentliche Auslieferung vorgesehen.
- Keine Supabase-Liveänderungen oder Übernahme bestehender Konten allein aufgrund dieser Dokumentation.

## Vor einer Änderung

Tests ausführen, Browser mit frischem Profil prüfen und Datenflüsse nachvollziehen. Ein bestehender Browser kann lokale Overrides haben, die nicht den gelieferten Seeds entsprechen. Größere Codeänderungen deshalb auch mit exportierten Testdaten prüfen. Bei widersprüchlichen älteren README-Abschnitten gilt die aktuelle technische Übergabe; für Feldnamen und tatsächliches Verhalten hat der gelieferte Code Vorrang. Nutzerwünsche in der Projektdatei bleiben die Produktspezifikation.
