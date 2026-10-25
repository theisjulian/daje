# ripassà Sprachlernportal und Redaktionsbackend

Stand 25. Oktober 2026. Technischer Prüf- und Umsetzungsentwurf für Claude. Das browserbasierte Portal wurde um Hörverstehen, Wortschatzbibliothek, lokale Merkliste, Verlauf, Antworten und Notizen erweitert. Die Redaktion ist eine ausdrücklich gekennzeichnete lokale Importdemo. Supabase-Anmeldung, zentrale Veröffentlichung und Synchronisierung sind noch nicht verbunden. Keine produktiven Reisedaten verändern.

## Produktaufteilung und Name

ripassà. kann als gemeinsamer Name für das selbstständige Sprachtraining dienen. Hörverstehen und Wortschatz sind gleichberechtigte Bereiche, nicht zwei technisch getrennte Plattformen. Die Marke bleibt Theis. Der Name ist ein Vorschlag für die Erweiterung, keine geprüfte Markenfreigabe. Der bestehende Wortschatztrainer bleibt integriert; Listen werden aus dem Inhaltskatalog gestartet.

## Was bereits testbar ist

- Drei eigene Hörtexte mit synthetischer Browserstimme: zwei italienische A1-Beispiele und ein englisches A2-Beispiel. Die GER-Einstufung ist redaktionell geschätzt, nicht zertifiziert. Keine authentischen Aufnahmen vorgetäuscht.
- Fragen mit Einfachauswahl, Richtig/Falsch und kurzen Antworten einschließlich Varianten. Antworten, letzte Auswertung und Notizen werden pro lokalem Profil gespeichert. Ein Verlaufseintrag zeigt nur einen Besuch an, keinen Lernerfolg.
- Merkliste mit Hörübungen und Vokabelsammlungen, letzter Besuch, Transkript, Tempoauswahl, Direktlink und passende Wortschatzrunde bei hinterlegter Verknüpfung.
- Strukturell geprüfter JSON-Import für beide Inhaltstypen. Ungültige Dateien verändern den Bestand nicht. Jeder Import ist ein Entwurf; doppelte Paket-IDs überschreiben nichts.
- Formularbearbeitung, Vorschau, Export und Freigabe nur innerhalb dieses Browsers. Die Demo ist kein Schutz vertraulicher Inhalte und kein wirkliches Administrationssystem.
- Lernprofil-Export enthält die neuen persönlichen Portaldaten. Inhaltspakete der Redaktion werden separat exportiert.

## Redaktionsoberfläche im echten Betrieb

Eine browserbasierte Oberfläche unter einer geschützten Redaktionsroute. Theis-Anmeldung plus serverseitig geprüfte Editorrolle; normale Lernkonten erhalten keine Schreibrechte. Ein versteckter Link und eine Rollenprüfung nur im JavaScript genügen nicht.

Vier Bereiche:

1. Übersicht mit Suche, Sprache, GER, Typ, Entwurf/Prüfung/Veröffentlicht und Änderungsdatum.
2. Import: Datei auswählen oder JSON einfügen; Paketversion prüfen; verständliche Fehler pro Feld; Vorschau und Erkennen von Doppelungen. KI-Anweisungen nur in der geschützten Redaktion anbieten.
3. Editor: gemeinsame Metadaten, Quellen, Medienrechte, bei Hörübungen Aufgaben und Lösungsschlüssel, bei Wortlisten Einträge, Übersetzungen und Zielantwortvarianten. Unterschied zwischen Transkription und eigenen Ergänzungen sichtbar machen.
4. Freigabe: vollständige fachliche Prüfung bestätigen, unveränderliche Veröffentlichungsversion erzeugen, Vorschau sehen und anschließend veröffentlichen. Revision zurückziehen oder alte Version wiederherstellen können.

Eine KI bekommt die Kommandodatei plus das Material und das passende Beispiel. Sie liefert ein Paket nach Version 1.0. Ein bloßes Umbenennen von Word, PDF oder CSV in JSON reicht nicht. OCR, fachliche Qualität und Nutzungsrechte bleiben gesonderte Prüfpunkte. Zunächst keine automatische bezahlte KI-API notwendig: Konvertierung außerhalb der App und manueller Import funktionieren.

## Vorgeschlagene Serverarchitektur

- Frontend: bestehende statische Theis-Website oder eine passende Webanwendung; GitHub Pages kann die Oberfläche ausliefern, aber keinen geschützten Schreibdienst ausführen.
- Anmeldung: gemeinsames Theis-Konto auf Basis von Supabase Auth prüfen. Ein Account in mehreren Apps und echtes Single Sign On sind getrennte Anforderungen. Bestehende ’namo-Nutzer zunächst unberührt lassen.
- Daten: Supabase Postgres mit expliziten Grants und RLS; private Tabellen oder Schemas für Entwürfe. Eigene Tabellen für Nutzerfortschritt und Merkliste. Keine pauschalen Rechte für alle Angemeldeten.
- Medien: eigener geeigneter Objektspeicher oder freigegebene externe Einbettungen. Private Entwürfe nicht über öffentliche Buckets erreichbar machen. Öffentliche Medien und Redaktionsdateien unterscheiden. Große Videos nicht als normale Datenbankfelder speichern.
- Schreib-API: Supabase Edge Functions oder ein eigener kleiner Server für Import und Veröffentlichung. Exakt denselben Vertrag zusätzlich auf dem Server validieren; Browserprüfung dient nur guter Bedienbarkeit.
- Geheimnisse: nur serverseitig; keine service_role- oder privaten OAuth-Schlüssel in der Website. Gewöhnliche Clients mit veröffentlichtem Schlüssel und wirksamen Zugriffsregeln betreiben.

## Datenmodell zur Prüfung

`content_items`: stabile ID, Typ, Sprache, verantwortliche Redaktion, aktueller veröffentlichter Versionsverweis.

`content_revisions`: ID, Inhalts-ID, Versionsnummer, Schema-Version, unveränderliches Payload nach Freigabe, Quellen, Prüfstatus, Zeitpunkte, Bearbeiter. Entwürfe getrennt und nicht anonym lesbar. Öffentlicher Katalog enthält ausschließlich freigegebene Revisionen; keine internen reviewNotes oder Redaktionsprompts.

`vocabulary_entries`: stabile Inhalts- und Wort-IDs; mehrere Übersetzungen und zulässige Zielantworten. IDs bei Textkorrekturen bewahren. Entsprechende Kurs- und Abschnittszuordnung auch für Französisch, Englisch und Spanisch.

`user_favorites`: user_id, content_id, created_at; genau ein Eintrag pro Kombination.

`user_visits`: user_id, content_id, last_visited_at; begrenzte Verlaufslänge, abschaltbare Erfassung und Löschung durch die betroffene Person.

`listening_attempts`: user_id, content_id, revision_id, Antworten, Modus der Rückmeldung, Zeitpunkte und geöffnete Hilfen. Neue Inhaltsrevisionen nicht stillschweigend mit alten Ergebnissen vergleichen.

`vocabulary_progress`: user_id, vocabulary_entry_id, Abfragerichtung, Art der Aufgabe, Wiederholungszustand und nächster Termin. Erkennen, selbst eingeschätztes Erinnern und richtiges Schreiben nicht als identische Fähigkeit behandeln.

`user_notes`: user_id, content_id, Text und Änderungsversion. Ein gemeinsames Konto gibt anderen Lehrkräften keinen Zugriff auf persönliche Notizen.

`editor_permissions`: serverseitig verwaltete Rolle; nicht in frei editierbaren user_metadata autorisieren.

## API Ablauf und Transaktionen

- POST Redaktion Import: Authentifizierung und Editorrolle, Dateigröße und Format prüfen, JSON sicher parsen, Schema prüfen, Referenzen prüfen, als neue Entwurfsrevision speichern. Keine Freigabe aus dem KI-Payload übernehmen.
- PATCH Entwurf mit erwarteter Revision: konkurrierende Änderungen erkennen; bei veraltetem Stand Konflikt statt Überschreiben.
- POST Veröffentlichen: Rolle, erwartete Revision, Fachprüfung und Medienstatus prüfen; alle Daten und öffentlichen Versionsverweis in einer Transaktion aktualisieren. Teilimporte und halbe Veröffentlichung verhindern.
- GET Katalog und freigegebener Inhalt: ausschließlich öffentliche Revision und notwendige Lerninformationen ausgeben. Inhalt ist zum Üben; im Browser gelieferte Lösungen sind technisch einsehbar und nicht prüfungsgeheim.
- PUT persönlicher Entwurf, Merkliste, Notiz: angemeldeten Eigentümer serverseitig ableiten. Kein frei übergebener user_id als Autorisierung. Versionskonflikte behandeln.

## Importvertrag und Erweiterungen

Das gemeinsame Format `theis-learning-package`, Version `1.0`, hat den Diskriminator `kind` für listening oder vocabulary. Der Pure-JavaScript-Validator liegt in content-contract.js; Beispiele und Kommandodatei sind mitgeliefert. Er akzeptiert keine ausführbaren HTML-Felder; Anzeige wird zusätzlich escaped. Für Produktion zusätzlich standardisiertes JSON Schema, Servervalidator, Migrationsregeln und Größenlimits auf API-Ebene vorsehen. Clientvalidierung allein schützt keine Datenbank.

Typen bewusst stufenweise erweitern: Mehrfachauswahl, Lückentext mit mehreren Lücken, Zuordnung und Sortieren erst mit eigenen Schemata und Korrekturlogik. Nicht als schon implementiert ausgeben. Das Modell soll unbekannte Typen ablehnen, statt sie zu raten.

## Nützliche persönliche Funktionen

Sofort sinnvoll: Merkliste, letzte Besuche, Antworten fortsetzen, eigene Notizen, Fehler wiederholen, Hilfeeinsatz anzeigen und passende Wörter nach einer Hörübung üben. Zusätzlich später Sammlungen wie Vor der Schulaufgabe oder Meine A2-Hörübungen, gespeicherte Filter, ein frei wählbares Wochenziel und Links auf redaktionelle Lernfolgen.

Nicht alles muss in Version 1: serverseitige Offline-Synchronisierung, Notizen teilen, Lehrkraft-Dashboard, KI-Freitextbewertung oder automatische Audioanalyse brauchen eigene Entscheidungen. Keine Rangliste oder dauerhafte Streak-Pflicht für das Selbstlernziel nötig.

## Online Speicherung und Betrieb

Die aktuelle lokale Datenstruktur ist noch keine fertige Cloud-Synchronisierung. Pilot mit optionalem Konto, bewusstem Übernehmen lokaler Daten, Datenschutz für Minderjährige, Abmeldung auf Schulgeräten und Wiederherstellung bei verlorenem Zugang planen. Lokale Daten und Remotezustand nicht blind zusammenführen. Ein eigener Export bleibt nützlich.

Kosten anhand tatsächlicher Nutzer, gespeicherter Daten und Medienverkehr abschätzen. Aktuelle Free-Grenzen und Pausierung prüfen. Email-Anmeldung benötigt regulären Mailversand. Operative Backups und Rechteprüfung gehören zum Dienst. Libretto- und Voce-Backups mit Schüler- und Bewertungsdaten separat behandeln; nicht einfach neben Schülerfavoriten als unverschlüsselte Dateien ablegen.

## Prüfung vor Produktivbetrieb

1. Nutzer A/B: keine gegenseitigen Leserechte oder Schreibrechte auf Lernstände, Notizen und Favoriten.
2. Gast/Schüler/Redaktion: Entwürfe, interne Prompts und Medien vor Freigabe unzugänglich; Redaktion serverseitig autorisiert.
3. Doppelte IDs, beschädigte JSON-Datei, sehr große Datei, unbekannte Version und ungültige Medienreferenz werden atomar abgewiesen.
4. Veröffentlichung, Rücknahme und Wiederherstellung verändern Katalog und Inhalt konsistent.
5. Neuer Inhalt wird ohne manuelle Codeänderung von einem zweiten Browser aus sichtbar.
6. Antwortfortsetzung, Kontowechsel, konkurrierende Bearbeitung, Offline-Fehler und Löschungen sind getestet.
7. Browserprüfung auf mobilen Geräten und mit Tastatur, Medienfehler ohne blockierte Oberfläche, echte Audiowiedergabe und Quellenzuordnung prüfen.

## Primärquellen

- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/api/securing-your-api
- https://supabase.com/docs/guides/database/postgres/row-level-security
- https://supabase.com/docs/guides/storage/security/access-control
- https://supabase.com/docs/guides/auth/oauth-server/getting-started
- https://supabase.com/pricing

## Konkretisierung der Zielgruppen und Rollen

Nutzerpräzisierung: Hörmaterial richtet sich ausdrücklich gleichermaßen an Lehrkräfte und Lernende. Lehrkräfte suchen Material für Unterricht und Prüfungen. Schülerinnen und Schüler üben selbstständig. Beide Zielgruppen brauchen eine professionelle, altersübergreifende Oberfläche; keine kindliche Spieloberfläche als Standard.

Nach dem echten Login soll eine hinterlegte Rolle den primären Einstieg und die Ansprache bestimmen:

- Lehrkraft: Materialsuche, Metadaten zu Niveau und Dauer, Aufgabentypen, Unterrichtshinweise, Sammlung, zuletzt gesichtete Materialien, Aufgabenblatt und separater Lösungsschlüssel. Bei Materialien zur Prüfung müssen Publikationsstatus, Nutzungsrechte und bisherige öffentliche Verfügbarkeit deutlich sein.
- Schüler: Weiterlernen, Antworten fortsetzen, persönliche Merkliste, Notizen, Wiederholungen und Lernfortschritt; kurze und verständliche Rückmeldungen.
- Redaktion: zusätzliche, serverseitig vergebene Berechtigung. Ein Lehrerprofil bedeutet niemals automatisch Redaktionsrechte. Eine frei wählbare Darstellungspräferenz ist ebenfalls keine Autorisierung.
- Eine Person kann sowohl unterrichten als auch selbst lernen. Den Wechsel der persönlichen Ansicht erlauben, ohne private Daten anderer Personen oder zusätzliche Verwaltungsrechte freizugeben.

Die Vorschau hat derzeit nur eine lokal gespeicherte Ansichtspräferenz im Lernprofil und KEIN echtes Rollenlogin. Beide Ansichten sind über einen Schalter vergleichbar. Sie bieten dieselben öffentlich gedachten Materialien mit anderer Priorisierung. Browser-Druckansichten für Aufgaben und Lösungen sind implementiert; PDF entsteht über den Druckdialog des Browsers. Eine geschützte Online-Prüfungsdurchführung ist nicht implementiert. Öffentlich im Selbstlernbereich verfügbare Lösungen dürfen nicht als geheim betrachtet werden. Für unveröffentlichtes Prüfungsmaterial ist ein getrennter, wirklich geschützter Veröffentlichungs- und Berechtigungsablauf nötig.

## Ergänzter Medienstand

Ein kurzer originaler VOA-Lerndialog ist lokal eingebunden und im Browser tatsächlich abspielbar geprüft: ca. 29,6 Sekunden, Level 1 Welcome, Conversation. Die drei selbst geschriebenen Stimmendemos bleiben zusätzlich vorhanden; Browser-Sprachausgabe kann je nach Gerät fehlen. VOA-Quelle und Nutzungsbedingungen sind an der Übung dokumentiert. Es handelt sich um didaktisierte Dialoge, nicht automatisch um spontane authentische Alltagssprache.

## Antwortprüfung und Oberflächensprache · Ergänzung

Der Prototyp prüft Wortantworten lokal: korrekte hinterlegte Varianten werden akzeptiert; Leerraum, Großschreibung und abschließende Satzzeichen werden normalisiert. Artikel können je Eintrag vorgeschrieben oder optional sein. Genus-/Artikelabweichungen, Akzente und konservativ erkannte einzelne Tippfehler erzeugen einen Hinweis und einen neuen Versuch. Eine nach Hilfe gelöste Aufgabe erhöht die Lernstufe nicht und wird am Folgetag erneut fällig. Das ist eine heuristische Hilfe, keine vollständige linguistische Fehlerdiagnose. Kurze Wörter, komplexe Flexionen und freie Umformulierungen werden nicht automatisch semantisch bewertet.

Die Importdatei enthält dafür `grammar` und `answerPolicy`; die Redaktion kann diese Felder je Eintrag bearbeiten. Genus muss redaktionell geprüft werden und darf nicht allein aus der Endung abgeleitet werden. Falsche Formen wie „gelata“ sind keine zulässigen Varianten von „gelato“.

Die grundlegende Lernnavigation und wichtige Aktionen sind auf Deutsch, Italienisch, Englisch, Französisch sowie in einer einfacher formulierten italienischen Variante verfügbar. Dies ist noch keine vollständig lokalisierte Oberfläche: Redaktion, ausführliche Hilfetexte, dynamische Detailtexte und Materialbeschreibungen sind teilweise deutsch. Vor Veröffentlichung ist eine vollständige, schlüsselbasierte Internationalisierung mit sprachlicher Prüfung erforderlich. Lerninhaltssprache und Oberflächensprache bleiben unabhängig; Zitate, Aufgaben, Vokabeln und Lösungen dürfen beim Umschalten nicht übersetzt werden. „Italiano semplice“ bezeichnet eine redaktionell vereinfachte Sprachvariante, keine zertifizierte Leichte Sprache und kein garantiertes GER-Niveau. Profilpräferenz später optional kontoweit speichern; lokale Einstellung bleibt ohne Anmeldung verfügbar.


## Verbindliche Anforderung vom 25. Oktober 2026 Transkripte

Zu jeder Hörübung soll nach Möglichkeit das vollständige Transkript des verwendeten Mediums oder Ausschnitts gehören. Anbieterquelle, automatische Erstellung und redaktioneller Prüfstand müssen nachvollziehbar sein. Fehlende Transkripte offen kennzeichnen; keine Zusammenfassungen als Mitschrift ausgeben. Nutzungsrechte des Transkripts gesondert prüfen. Lehrkräfte sollen es leicht finden, redigieren und separat drucken können. Für Lernende bleibt es zunächst eingeklappt; Hilfeeinsatz wird kenntlich gemacht. Claude soll Metadaten, Druckausgabe und die derzeitige Grenze von 16000 Zeichen im versionierten Importformat prüfen. Diese Ergänzung dokumentiert die Anforderung und behauptet keine bereits vollständige Umsetzung.


## GER und mehrere Aufgabenapparate pro Medium

Die folgenden Kurzprofile sind redaktionelle Arbeitszusammenfassungen, keine wörtlichen GER-Deskriptoren und keine offizielle Einstufung. Primärquelle: Europarat, CEFR Companion Volume 2020, Skalen Overall oral comprehension, Understanding audio media and recordings und Watching TV film and video. https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4

- A1: vertraute konkrete Angaben wie Namen, Orte und Uhrzeiten in sehr kurzen, sehr langsam und deutlich gesprochenen Aufnahmen erkennen.
- A2: wesentliche Informationen zu vorhersehbaren Alltagsthemen in kurzen, langsam und klar gesprochenen Aufnahmen verstehen.
- B1: Hauptaussagen und wichtige Informationen zu vertrauten Themen in klarer Standardsprache verstehen; Tempo und Textsorte berücksichtigen.
- B2: auch Standpunkte und Einstellungen in umfangreicheren standardsprachlichen Aufnahmen erfassen; nicht nur Einzelangaben abfragen.
- C1: komplexe Aufnahmen einschließlich impliziter Einstellungen, Beziehungen und sprachlicher Variation differenziert verstehen.
- C2: müheloses Verstehen sehr anspruchsvoller gesprochener Sprache; keine künstliche C2-Variante zu einem trivialen Alltagsclip erzeugen. Für einzelne Medienskalen enthält der GER keinen eigenen C2-Deskriptor.

Aufnahme, Aufgabenanforderung und Unterstützung getrennt beurteilen. Entscheidend sind unter anderem Tempo, Artikulation, Wortschatz, Satzbau, Länge, Sprecherwechsel, Hintergrundgeräusche, Vertrautheit des Themas, notwendige Schlussfolgerungen sowie Antwortanforderungen. Aus Text allein keine akustische Einstufung behaupten. Anzahl oder Format der Fragen bestimmt das Niveau nicht. Offene Antworten dürfen nicht unbemerkt vor allem Schreibkompetenz messen.

Je Medium sind mehrere Aufgabenapparate möglich, sofern begründbar. Nicht automatisch A1 bis C2 anbieten. Bevorzuge zwei tatsächlich sinnvolle benachbarte Zielniveaus; wenn nur eines passt, liefere nur eines. Ein schwieriges Originalvideo wird durch eine Zahlenfrage nicht pauschal zu A1. Gezielte leichtere Aufgaben an schwierigem Material als unterstützte Teilaufgaben kennzeichnen, statt dem gesamten Medium ein falsches Niveau zuzuweisen. Umgekehrt erzeugt eine komplizierte Formulierung aus einem simplen Clip kein anspruchsvolles Hörverstehen.

Im Prüfbericht je Variante: Zielhandlung, passende GER-Skala und sinngemäßer Deskriptor, konkrete Text-/Audioeigenschaften, benötigte Hilfen, Hörhäufigkeit, Unterschiede zu anderen Varianten und Einschränkungen begründen. Niveau immer als vorläufige redaktionelle Einschätzung angeben; keine GER-Zertifizierung behaupten. Aufgabensprache muss zum Zielniveau passen. Unterstütztes Üben mit Wortliste, verlangsamter Wiedergabe oder Transkript ist von einer Bearbeitung ohne diese Hilfen zu unterscheiden. Die originale Hörgeschwindigkeit darf aus Untertiteln nicht geschätzt werden.

Schema 1.0: Je Variante ein eigenes vollständiges Paket mit eigener stabiler ID (z.B. it-spesa-a2 und it-spesa-b1), identischem media.videoId und unveränderter Transkriptgrundlage. level bezeichnet die vorläufige Zielstufe dieser konkreten Übung. Zusammengehörigkeit in reviewNotes dokumentieren; keine Felder mediaLevel, variants, cefrDescriptor oder groupId erfinden. Diese Gruppierung ist im aktuellen Portal noch nicht als gemeinsamer Niveauschalter implementiert. Produktionsausbau: ein zentraler Medieneintrag mit mehreren separat versionierten Aufgabenapparaten und gemeinsam gepflegtem Transkript.


## Private Videokandidaten
Neun Kandidaten sind als initiale lokale Redaktionsentwürfe in review-data.js enthalten. Sie gehören nicht zum freigegebenen Katalog. Die gesamte Site bleibt nur für den Eigentümer zugänglich. Vor einer öffentlichen Bereitstellung müssen review-data.js und die automatische Entwurfsinitialisierung entfernt beziehungsweise durch geschützte serverseitige Ablage ersetzt werden. Eine frei gewählte Lehrkraftansicht ist keine Zugriffskontrolle.


## Authentische Medien ab B1

Verbindlicher Schwerpunkt: Ab etwa Klasse 10 beziehungsweise B1 auch Originalbeiträge für ein allgemeines muttersprachliches Publikum einbeziehen, für Italienisch und Englisch. Sprache und Zielgruppe unterscheiden: Die sprechende Person muss nicht zwingend Muttersprachler sein; entscheidend ist, dass das Material nicht eigens als Fremdsprachenübung produziert wurde. Ein offizieller Verlagsclip ist nicht allein deshalb authentisches Alltagsmaterial. Natürlicher Dialog, journalistischer Bericht, Interview, Dokumentarbeitrag und allgemeinverständliches Erklärvideo sind mögliche Textsorten. Bildungs- und Wissensvermittlung für ein allgemeines Publikum ist zulässig; Fremdsprachenunterricht gesondert kennzeichnen.

Für B1 kurze, zusammenhängende Beiträge mit klarer Handlung oder überschaubarem Thema suchen; für B2/C1 auch Standpunkte, Argumente, Register und implizite Aussagen, sofern tatsächlich hörbar belegt. Keine automatische Einstufung nach Kanal, Thema oder Jahrgangsstufe. Auch Originalmaterial kann bereits auf A2 geeignet sein. Anspruchsvolle Aufnahme plus leichte Frage nicht als uneingeschränktes A1-Material bezeichnen. Akzente und natürliche Sprechweise nicht pauschal aussortieren, aber für die Zielgruppe einordnen. Hörverstehen und Hörsehverstehen getrennt ausweisen.

Originalaufnahme und Transkript nicht zur Niveausenkung umschreiben. Hilfen getrennt planen: Wortschatzvorentlastung ohne Lösungsvorgabe, begründete Ausschnittwahl, Wiederholungen, gestufte Aufgaben. Vorgegebene Niveaus sind Zielkorridore, keine Pflichtetiketten. Bei fehlender Eignung einen Kandidaten ersetzen. Regionen, Perspektiven und englische Sprachvarietäten sinnvoll variieren. Quellen und Nutzungsrechte je Medium prüfen.


## Aktualisierung alle Videopakete in der privaten Vorschau

Der Nutzer hat am 25. Oktober 2026 die Aufnahme aller gesammelten Videoübungen beauftragt. 14 Pakete sind deshalb im owner-privaten Hörverstehenskatalog verfügbar, mit sichtbarer Kennzeichnung als Arbeitsfassung. Das ersetzt den früheren Status „nur unter Redaktion“. Elf übermittelte Transkripttexte vorhanden, drei fehlen. Keine unabhängige Gesamtprüfung der Aufnahmen oder Rechte. Einbettung im Portal ist verbindlicher Standard, externe Quelle nur als Quellenangabe und Ausweichweg. Vor öffentlichem Launch ungeprüfte Datensätze ausschließen und geschützte Entwurfsablage umsetzen. Eine Rollenansicht ist kein Zugriffsschutz.


## Nutzerkorrektur Bilder und saubere Transkripte

Jede Hörübung soll möglichst ein passendes Vorschaubild zeigen; YouTube-Karten verwenden das Videothumbnail und bei Ladefehlern eine eigene Illustration. Bildnachweise getrennt dokumentieren. Transkriptfeld und Darstellung enthalten keine redaktionellen Vorbemerkungen über Gemini, Prüfstatus oder Herkunft. Diese bleiben unter Quelle und Hinweise beziehungsweise in reviewNotes erhalten. Bereits gespeicherte lokale Entwürfe bei der Anzeige entsprechend behandeln.


## Hörverstehen und zugehöriger Wortschatz in einer Datei

Ab Schema 1.1 ist bei kind listening das optionale Feld vocabulary implementiert: ein Array mit 1 bis 60 Wortobjekten. Die Wortobjekte haben exakt dieselbe Struktur wie entries in einem eigenständigen Vokabelpaket: id, target, translations und optional acceptedAnswers, example, definition, grammar und answerPolicy. Kein zusätzliches Objekt mit kind oder entries in vocabulary verschachteln. Beispiel: listening-with-vocabulary.json.

Ein solches Paket verwendet schemaVersion 1.1. Alte Pakete ohne integrierten Wortschatz bleiben mit Version 1.0 lesbar. vocabularyIds bleibt als ältere Verknüpfungsmöglichkeit erhalten; integrierter Wortschatz hat beim Üben Vorrang. language des Hörverstehens gilt auch für die enthaltenen Wörter. Übersetzungen sind in dieser Version Deutsch, unabhängig von der Oberflächensprache. Wortschatz wird zusammen mit der Übung validiert, gespeichert und direkt mit dem Trainer verknüpft. Ein ungültiger Eintrag verhindert die Übernahme des gesamten Pakets.

Für Gemini: Nach Möglichkeit zu jeder neuen Hörübung eine kuratierte Liste zentraler Wörter und Wendungen aus der tatsächlichen Hörstrecke liefern, typischerweise etwa 6 bis 15, je nach Länge und Ergiebigkeit auch weniger. Keine Worte aus einer nur vermuteten Inhaltsbeschreibung erfinden. Lemmatisierte Formen sind zulässig und sinnvoll; Artikel und Genus bei Substantiven fachlich prüfen. Kontextgerechte deutsche Übersetzungen und kurze eigene Beispielsätze ergänzen; optionale Erklärungen in der Zielsprache ermöglichen einen weiteren Trainingsmodus. Mehrworteinheiten und Kollokationen berücksichtigen. Nicht bloß alle seltenen Wörter sammeln und keine sinnlosen Wortlisten aufblasen. Bei mehreren Apparaten zum selben Medium denselben kuratierten Grundwortschatz nutzen und niveauabhängige Unterschiede redaktionell begründen.

Muster einer Ergänzung im listening-Paket:

```json
"vocabulary": [
  {
    "id": "incontrare",
    "target": "incontrare",
    "translations": ["treffen"],
    "example": "Oggi incontro un amico.",
    "definition": "Vedere una persona e passare del tempo con lei."
  }
]
```

Dieses Fragment ist allein kein vollständiges Importpaket; die übrigen Pflichtfelder bleiben unverändert. Keine separate zweite Datei für diese Liste nötig. Redaktion prüft Wortauswahl und Übersetzungen. Die App öffnet über Wörter dieser Übung die Liste und bietet Karten, Schreiben, Zuordnen sowie bei vorhandenen Definitionen Erklärungen an. Wörter ohne eindeutig zugeordnetes Bild erhalten keine behauptete Fotoübung.
