# ripassà.

Privater Prototyp eines sprachübergreifenden Wortschatz- und Verbentrainers für Julian Theis. Arbeitsname nach der romanesken Infinitivform von ripassare. Der Name ist ein Gestaltungsvorschlag, keine Markenfreigabe. Lessico war der erste Arbeitsname.

## Testen

Die Anwendung ist buildlos. Den Inhalt von `dist` auf einem statischen Webserver bereitstellen. Lokal zum Beispiel `python3 -m http.server 8080 --directory dist`, dann `http://localhost:8080` öffnen. Ein Doppelklick auf die HTML-Datei bildet Browserspeicher und Dateifunktionen nicht in jeder Umgebung zuverlässig ab.

## Funktionsumfang

- 133 aufbereitete Einträge aus Ciao! und Unità 1 von Ecco più 1, ISBN 978-3-06-022906-2. Weitere Kapitel und Bände sind noch nicht enthalten.
- Karten, Schreiben, Zuordnen, drei Bildimpulse und zwanzig italienische Definitionen.
- Kapitel, Teilkapitel oder kumulatives Lernen; beide Sprachrichtungen, Runden mit 5, 10 oder 20 Wörtern, begrenzt auf den vorhandenen Bestand.
- Fünf Verben im Presente als erste Erweiterung.
- Alle zwölf Farbwelten aus dem vorhandenen Gruppo-Quellstand. Tageslicht ist phasengesteuert; andere Farbwelten haben helle und dunkle Varianten.
- Neun kurze visuelle Lerntipps mit aufklappbaren Originalstudien und Übertragungsgrenzen.
- Lokale benannte Lernprofile, frei gewählte Tagesziele, Wochenverlauf, Kapitelübersicht und fällige Wiederholungen.
- Export des aktiven Lernprofils als JSON; validierter Import als neues Profil ohne Überschreiben bestehender Daten.
- Migration des früheren lokalen Lernstands. Historische Tageswerte werden nicht erfunden: Der Wochenverlauf beginnt mit den tatsächlich protokollierten neuen Aktivitäten.

## Schülerkonten und Daten

Keine Kontenverwaltung, keine Serverdatenbank und keine Übermittlung von Lernständen. Profile sind keine geschützten Konten: Alle Benutzer desselben Browserprofils können sie öffnen. Geräte-, Browser- oder Adresswechsel erfordern Export und Import. JSON-Sicherungen sind nicht verschlüsselt; Kürzel statt Klarnamen verwenden. Der Verlust des Browserspeichers ohne Sicherung lässt sich nicht rückgängig machen. Eine automatische Synchronisierung per pseudonymem Lerncode wäre eine spätere Funktion mit Serverablage und Wiederherstellungskonzept.

## Inhalte und Gestaltung

Einträge besitzen stabile IDs sowie Sprache, Übersetzungssprache und Lehrwerks-ID. Die Trainingslogik nutzt die sprachneutralen Felder target und translations. Der Katalog ist für Italienisch, Französisch, Englisch und Spanisch vorbereitet; aktuell ist nur italienisches Material vorhanden. Konjugationen, Sprachanweisungen und Quellen müssen bei Ergänzung weiterer Sprachen passend erweitert werden.

Die Wiederholungsregel 1, 3, 7 und 14 Tage ist eine einfache Produktheuristik. Stufenfortschritt setzt erfolgreiche Wiederholungen an verschiedenen Tagen voraus. Karten-Selbsteinschätzungen und automatisch geprüfte Eingaben werden als solche erfasst; Stufen sind keine Leistungsnoten und keine validierte Gedächtnisdiagnostik.

## Quellen

Bildurheber, Originalseiten, Lizenzen und Bearbeitungen sind im zentralen Quellenbereich eindeutig zugeordnet. Die verwendeten Pexels- und Unsplash-Bilder benötigen bei dieser direkten, lokalen Verwendung keine wiederholte Namensnennung am Bild. Bei künftigen Bildern sind die jeweiligen Lizenzbedingungen einzeln zu prüfen; insbesondere gelten für API-Einbindung andere Bedingungen. Alle Bilder und Schriften sind lokal eingebunden.

Inter und Schibsted Grotesk werden unter der SIL Open Font License genutzt; Lizenzen liegen in dist/assets. Das neue violette Wiederholungs-Icon wurde mit Bildgenerierung anhand der vorhandenen App-Icons von Libretto und Gruppo gestaltet. Es trägt keinen Schriftzug und funktioniert unabhängig vom endgültigen Namen. Datei: dist/assets/ripassa-icon.png. Motivvorgabe: violette bis periwinkelfarbene App-Kachel, weißer Rückkehrpfeil mit einem kleinen Erinnerungsfunken, gleiche reduzierte Formsprache wie die bestehenden theis-Icons.

Original-PDF, Benutzersicherungen, Browser-Lernstände und Zugangsdaten werden nicht im Quellpaket gespeichert. Ein vollständiger öffentlicher Lehrwerkspool ist eine gesonderte redaktionelle und rechtebezogene Aufgabe.

## Prüfung

`node tests/progress.test.cjs` prüft Migration, isolierte Profile, Importvalidierung, unmögliche Datumswerte, manipulierte Sicherungen, Tageszählung ohne Doppelzählung und Wiederladen. Profilerstellung, Schreibantwort, Fortschrittsanzeige sowie Export und Import sind zusätzlich im Browser geprüft. Responsive CSS ist vorhanden; eine gesonderte mobile Emulation ist nicht erfolgt.

## GitHub

Das bestehende Repository theisjulian/app bleibt unverändert und wurde nur gelesen. Der Nutzer hat das private Repository theisjulian/test als Ziel für den neuen Prototyp autorisiert. Aktuell liefert der GitHub-Zugriff dafür 404 und keine zugänglichen Installationen oder Repositories. Deshalb wurde bisher nichts dorthin geschrieben.

Ein separates Paket mit docs als Veröffentlichungsverzeichnis ist für den GitHub-Pages-Test vorbereitet. Bei einem privaten Repository benötigt GitHub Pages einen geeigneten Tarif. Eine Pages-Seite ist nicht automatisch privat, nur weil das Repository privat ist. Hosting wird nicht ungeprüft auf öffentlich umgestellt.

## Ausbau ripassà.

Zuordnen zeigt maximal fünf Paare gleichzeitig und schließt doppelte Wortformen und doppelte Hauptübersetzungen aus. Der Rundenerfolg zählt nur Verbindungen ohne vorherigen Fehlversuch bei diesem Wort. Der Modus übt Wiedererkennen und verändert keine Wiederholungsstufen oder Tagesziele. Anschließend kann dieselbe Auswahl direkt schriftlich trainiert werden. Fehler einer Runde lassen sich vor dem erneuten Üben als Liste ansehen. Die Startseite empfiehlt fällige Wiederholungen, andernfalls zuerst ungeübte Wörter der aktuellen Auswahl. Der Fortschritt zeigt die Abdeckung jedes verfügbaren Teilkapitels.

## Portal Ausbau am 25 Oktober 2026

Die bisherige Vokabeltrainer-Vorschau ist jetzt ein gemeinsames Portal mit vier Hörbeispielen (ein lokal eingebundener VOA-Lerndialog mit echten Stimmen, drei eigene synthetische Stimmendemos), Wortschatzbibliothek, lokaler Merkliste, Verlauf und persönlichen Notizen. Die vorhandenen zwölf Themes bleiben erhalten. Der Arbeitsname für das Gesamtportal ist weiterhin ripassà.; die endgültige Dachbenennung ist nicht neu beschlossen.

### Lehrkräfte und Lernende

Beide Zielgruppen sind gleichwertig. Die lokale Ansichtspräferenz liegt im Lernprofil; die Lehrkräfteansicht priorisiert Materialsuche, Sammlung und Unterrichtsmaterial. Die Lernansicht priorisiert selbstständige Bearbeitung und Fortschritt. Eine Lehrkraft kann weiterhin selbst üben. Der Schalter ist eine Vorschau, keine serverseitig verifizierte Rolle. Ein echtes Theis-Konto ist noch nicht verbunden und fragt deshalb keine Zugangsdaten ab.

Aufgabenblatt und Lösungsschlüssel besitzen getrennte Druckvorschauen mit Browser-Druck/PDF. Das Portal ist keine geschützte Online-Prüfungsumgebung. Öffentlich ausgelieferte Lösungen sind technisch zugänglich. Unveröffentlichtes Prüfungsarchiv, Klassenräume und Leistungsverwaltung sind nicht implementiert.

### Redaktion und Format

`dist/content-contract.js` enthält den gemeinsam nutzbaren Pure-JavaScript-Validator für `theis-learning-package` 1.0. `dist/imports/KI-Kommandodatei.md` beschreibt die externe KI-Konvertierung. `dist/examples` enthält jeweils ein geprüftes Hör- und Vokabelbeispiel. Die Redaktion in `studio.js` ist nur eine lokale Demo: Import, strukturelle Prüfung, Bearbeitung, Vorschau, Export und Freigabe innerhalb desselben Browsers. Doppelte IDs werden abgewiesen. Importierte Pakete landen zunächst im Entwurf. Rechte mit needs_review blockieren eine Freigabe. Keine Inhalte werden für andere Nutzer veröffentlicht. Im echten Betrieb müssen Kommandodatei, Entwürfe und Importoberfläche hinter serverseitig geprüften Redaktionsrechten liegen; der aktuell bereitgestellte Site-Zugang bleibt privat.

Für importierte Wortlisten sind Karten, Schreiben, Zuordnen und bei vorhandenen Definitionen Erklärungen verfügbar. Neue Sprachen lassen sich über Pakete importieren; komplette Lehrwerkskataloge, Sprachaufnahmen und alle sprachspezifischen Sonderregeln sind damit noch nicht redaktionell fertiggestellt.

### Daten und Prüfung

Persönliche Antworten, letztes Hörergebnis, Hilfeeinsatz, Verlauf, Merkliste und Notizen werden unter dem aktiven lokalen Profil gespeichert und im Profilbackup mitexportiert. Importierte Inhaltspakete liegen separat im lokalen Redaktionsbestand. Sie müssen auf einem anderen Browser zusätzlich als Inhalte importiert werden; Profilbackup ersetzt kein Inhaltsbackup. Die letzte Auswertung ist keine vollständige Versuchshistorie und kein Kompetenznachweis. Bearbeitungsdauer der Hörbeispiele ist geschätzt, nicht gemessen.

`node tests/content.test.cjs` prüft beide Importtypen, doppelte IDs, falsche Antwortreferenzen, unsichere Medienadressen, unbekannte Versionen und die Antwortnormalisierung. `node tests/progress.test.cjs` prüft zusätzlich Portalbackups und Datenisolation. Im Browser wurden Audio-Wiedergabe (lokale Originaldatei, ca. 29,6 s, readyState 4), Hörkorrektur mit Antwortvariante, Notiz, Merkliste, Rollenansichten, getrennte Druckvorschauen, Import/Freigabe einer französischen Testliste und deren Trainingsansicht sowie Formularbearbeitung geprüft. Browser-TTS war im Testbrowser nicht verfügbar; der Fehlerzustand weist darauf hin. Die eigentliche Betriebssystem-Druckausgabe, Supabase, Synchronisierung, YouTube-Wiedergabe und mobile Geräte sind nicht end-to-end geprüft.

### Serverauftrag

`dist/imports/Backend-Konzept.md` enthält den detaillierten Architektur- und Rollenauftrag für Claude: Supabase Auth, RLS/Grants, privater Entwurfsbestand, revisionsgebundene Veröffentlichung, persönliche Daten, Import-API und Kostenprüfung. Noch keine Datenbank, Auth-Konfiguration oder produktiven Berechtigungen wurden verändert. Libretto/Voce und ’namo bleiben unberührt.

### Audio Quelle

VOA Learning English, Let's Learn English Level 1, Lesson 1 Welcome, Conversation (8. Februar 2016). Original-MP3 unverändert unter assets/voa-welcome.mp3 eingebunden. Originalseite: https://learningenglish.voanews.com/a/lets-learn-english-lesson-one/3111026.html. Audiodatei: https://voa-audio.voanews.eu/vle/2016/02/08/49485bf8-4277-47f6-9abe-617ee2473f8c.mp3. VOA nennt ausschließlich selbst produzierte Texte, Audios und Videos Public Domain, während Fremdmaterial ausgenommen ist: https://learningenglish.voanews.com/p/6021.html. Der hier verwendete kurze eigene VOA-Lerndialog wird mit Quellencredit und getrennt davon selbst formulierten Fragen gezeigt.

### Antwortprüfung und Sprachen
- Lokale Artikelregeln (erforderlich/optional), gepflegte Antwortvarianten und Hinweise bei Genus-, Akzent- und möglichen Tippfehlern. Keine unscharfe automatische Freigabe falscher Wortformen.
- Hilfen lassen einen erneuten Versuch zu; Erfolg nach Hilfe erhöht die Lernstufe nicht und setzt eine Wiederholung am Folgetag.
- `grammar` und `answerPolicy` sind im JSON-Vertrag und in der Redaktion bearbeitbar.
- Grundlegende Navigation und wichtige Lernaktionen: DE/IT/EN/FR/Italiano semplice. Noch keine vollständige Lokalisierung von Redaktion, Hilfe, Beschreibungen und dynamischen Detailtexten. Inhalte bleiben in ihrer Originalsprache.
- Browserprüfung: gelata → Genushinweis → gelato → Artikelhinweis → il gelato → „Richtig – mit Hilfestellung“; Sprachumschaltung in beide Richtungen geprüft.
- Zusätzlicher Test: `node tests/grading.test.cjs`.

### Videokandidaten und Redaktionsauftrag vom 25. Oktober 2026
Neun YouTube-Kandidaten sind jetzt als vorbefüllte Entwürfe unter Redaktion verfügbar, mit Aufgaben und den vom Nutzer übermittelten Gemini-Transkripten. Keine unabhängige Audioverifikation. Sie werden nicht in den freigegebenen Katalog aufgenommen; needs_review bleibt gesetzt. Die Site ist weiterhin owner-private. Vor einer öffentlichen Bereitstellung muss die mitgelieferte Entwurfsdatei entfernt oder durch geschützten serverseitigen Zugriff ersetzt werden. Bestehende lokale Änderungen an gleichnamigen Entwürfen bleiben erhalten.

Die Kommandodatei enthält GER-Arbeitskriterien und erlaubt mehrere begründete Aufgabenapparate pro Medium. Der aktuelle Import kann dafür eigene Pakete mit derselben Video-ID verwenden; eine gemeinsame Niveauauswahl ist noch nicht implementiert. Gemini-Folgeprompt.md trennt Transkriptbeschaffung und Aufgabenproduktion durch einen Sichtungsstopp. Neuer Suchschwerpunkt: authentische Beiträge für ein allgemeines Publikum, drei IT und zwei EN, B1–B2. Hinweise auf ursprüngliche Teilprüfung bleiben sichtbar.


### Alle Videoübungen in der privaten Arbeitsvorschau
Auf ausdrücklichen Nutzerauftrag vom 25. Oktober 2026 sind alle 14 gesammelten YouTube-Pakete jetzt direkt im Hörverstehenskatalog zugänglich, zusätzlich zu den vier bisherigen Audiobeispielen/Stimmendemos. Dies ersetzt die vorherige Beschränkung auf die Redaktion. Jedes Paket bleibt als ungeprüfte Arbeitsfassung gekennzeichnet; es erfolgte keine fachliche oder rechtliche Freigabe. Elf Pakete enthalten übermittelte Transkripttexte, drei noch keine Mitschrift. Der TED-Rohtext wurde aufgenommen, auffällige Erkennungsfehler bleiben dokumentiert. Entwürfe sind weiterhin im Redaktionsformular bearbeitbar. Die gesamte Site bleibt owner-private; diese Entwurfsdateien sind vor öffentlichem Launch zu entfernen oder serverseitig geschützt zu verwalten.

Browserprüfung: Sprachfilter zeigt neue BBC- und TED-Pakete; TED-Übung mit Aufgaben und eingebettetem YouTube-Player lädt im Portal. Keine vollständige Wiedergabeprüfung aller Videos. Fehlende Transkripte ausdrücklich ausgewiesen. Ungültige künstliche Beschreibungen wurden aus transcript entfernt. YouTube verwendet seine eigenen Wiedergabesteuerungen; der bisher funktionslose zusätzliche Geschwindigkeitsschalter wird bei YouTube nicht mehr angezeigt. Direktlinks, Merkliste und Unterrichtsansicht verwenden denselben erweiterten Katalog.


### Bilder Transkripte und Aufgabenumfang
Auf Nutzerwunsch alle 14 Original-YouTube-Vorschaubilder lokal eingebunden; Ersatzillustration bei Ladefehlern. Quellenhinweise ergänzt. Redaktionsvorspänne aus den Transkripten entfernt; Herkunft und Prüfstand separat in Quellen und reviewNotes. Bestehende lokale unberührte Startentwürfe übernehmen die aktualisierten Aufgaben; ausdrücklich gespeicherte redaktionelle Änderungen bleiben erhalten. Neun von 14 Videoapparaten wurden inhaltlich erweitert, z.B. TED 10, BBC 8, Einkauf 7 Aufgaben. Sehr kurze Clips bleiben kompakt; drei Pakete ohne Textgrundlage wurden nicht mit erfundenen Zusatzfragen erweitert. Aufgabenanzahl und Formate sind auf den Karten sichtbar, mit einer aufklappbaren Formatübersicht. Die Kommandodatei und der Folgeprompt berücksichtigen diese Vorgaben.


### Integrierter Wortschatz zu Hörübungen
Schema 1.1 unterstützt vocabulary mit 1–60 Wortobjekten im Hörpaket. Alte Pakete bleiben lesbar. Validierung, Redaktion und Trainer sind verbunden; Karten, Schreiben, Zuordnen und Definitionen nutzen den normalen lokalen Lernstand. Die Turin-Demo enthält sechs kuratierte Einträge. Andere vorhandene Hörpakete werden nicht automatisch mit erfundenem Wortschatz ergänzt. Neue Gemini-Pakete sollen die eigene Wortliste nach Möglichkeit direkt mitliefern. Beispiele/listening-with-vocabulary.json zeigt den vollständigen Import.
