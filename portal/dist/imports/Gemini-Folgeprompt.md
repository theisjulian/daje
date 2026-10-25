# Gemini Folgeprompt für neue Hörmedien

Hänge KI-Kommandodatei.md an. Für Phase 1 wird noch kein JSON-Beispiel benötigt. Kopiere folgenden Auftrag in Gemini. Standard: fünf neue authentische Beiträge für Jugendliche, drei auf Italienisch und zwei auf Englisch; Schwerpunkt B1 bis B2. Sprache, Zielgruppe, Themen und Anzahl lassen sich vorab ändern.

## Phase 1 jetzt kopieren

Recherchiere bis zu fünf neue authentische Audio- oder Videobeiträge für ein schulisches Sprachlernportal: drei italienischsprachige und zwei englischsprachige. Zielkorridor B1 bis B2, etwa Klasse 10 und darüber. Zielgruppe etwa 13 bis 17 Jahre. Themen abwechslungsreich aus Alltag, Schule, Begegnungen, Reisen und Kultur. Bevorzuge vollständige kurze Beiträge von etwa einer bis vier Minuten mit nachvollziehbarer Originalquelle und tatsächlich verfügbarem Transkript. Keine synthetischen Demos und keine für Fremdsprachenlernende produzierten Lehrdialoge, Sprachkurse oder Sprachlernkanäle in diesem Durchgang. Gesucht sind Originalbeiträge für ein allgemeines Publikum: Interviews, kurze Reportagen, Erklärvideos und Dokumentarausschnitte. Allgemeine Wissensvermittlung ist erlaubt. Recherchiere z.B. bei offiziellen italienischen Nachrichten-/Wissenskanälen und englischsprachigen journalistischen Anbietern oder TED; prüfe jeden Beitrag einzeln und behaupte keine sichere Verfügbarkeit bestimmter Kanäle. Keine Aufgaben anderer Anbieter übernehmen.

Erstelle in diesem Schritt NUR Rechercheergebnisse und Transkriptgrundlagen, keine Aufgaben und kein Import-JSON. Beachte die beigefügte Kommandodatei, besonders die Regeln zu Quellenzugriff, Transkripten und GER.

Diese neun bereits verwendeten YouTube-IDs ausschließen: DFo5qBbF_TU, DRzHA4LuFC0, oLfYx4cgTMg, wPkbySTrndI, pW8Fuo1Oh-g, dK9KAT5BDBM, 91fi6egFsyA, FaS5AIuXw_E, -DpfIOInJfY.

Für jeden Kandidaten liefern:
1. Direkter Link, verifizierter Titel und Anbieter. Videolänge nur nennen, wenn tatsächlich ermittelt.
2. Tatsächliche Zugriffsgrundlage klar angeben: Audioanalyse, manuelle Untertitel, automatische Untertitel oder anderer Originaltext. Einen Titel oder Suchtreffer nicht als Inhaltsanalyse ausgeben. Behaupte keine erfolgreich verwendeten Tools oder Prüfungen, die nicht stattgefunden haben.
3. Möglichst vollständiges italienisches Transkript des verwendeten gesprochenen Teils. Keine Zusammenfassung. Wenn nur ein Ausschnitt verfügbar ist, Beginn, Ende und Lücken angeben. Vorhandene Originalzeitmarken übernehmen; fehlende Zeiten nicht erfinden. Original-Captions mit Startzeiten möglichst als separate TXT-, SRT- oder VTT-Datei ausgeben. Sprecherwechsel, Eigennamen und Unverständliches nur soweit belegt kennzeichnen. Ungeprüfte Captions nicht als am Audio geprüft ausgeben. Keine vermuteten Dialoge rekonstruieren.
4. Vorläufige Eignung für B1 und/oder B2 anhand der beigefügten GER-Kriterien begründen. Nur eine Stufe ist zulässig, wenn ein zweiter Apparat nicht sinnvoll wäre. Keine künstlichen A1-Varianten anspruchsvoller Originalbeiträge. Aufnahme, Aufgabenpotenzial und benötigte Hilfen getrennt beschreiben. Bei reinem Textzugriff Tempo, Artikulation und akustische Verständlichkeit ausdrücklich als ungeprüft markieren.
5. Prüfen, ob zwei unterschiedliche Aufgabenapparate zum selben Medium didaktisch sinnvoll wären. Für jede sinnvolle Variante eine kurze Zielbeschreibung liefern. Keine Varianten A1 bis C2 erzwingen. Noch keine Fragen erstellen.
6. Nutzungsrechte von Medium und Transkript getrennt offenlegen. Ohne gesicherten Nachweis nicht als frei verwendbar oder einbettbar bezeichnen. Unbekannt bleibt unbekannt; die spätere Redaktion klärt die Freigabe.

Wenn du kein tatsächliches Transkript oder Audio erfassen kannst, liefere den Kandidaten nur in einer separaten Liste „ohne belastbare Textgrundlage“ und zähle ihn nicht zu den fertigen Vorschlägen. Lieber weniger als fünf brauchbare Quellen als erfundene Vollständigkeit.

Warte anschließend auf meine Auswahl und Prüfung der Transkripte. Fahre NICHT automatisch mit Aufgaben fort.

## Phase 2 erst nach Sichtung kopieren

Erstelle jetzt für die von mir ausgewählten Medien und die ausdrücklich freigegebenen Transkriptgrundlagen die Aufgabenapparate. Verwende die aktuelle KI-Kommandodatei und das beigefügte passende JSON-Beispiel. Wenn eine dieser Dateien fehlt, fordere sie an; erfinde kein Schema.

Je Medium nur die begründet passenden Zielniveaus anbieten. Je Variante ein eigenes Paket mit eigener ID und identischer Medienreferenz sowie identischer Transkriptgrundlage. level ist die vorläufige Zielstufe der konkreten Übung. Begründung und Gruppierung in reviewNotes, keine neuen Schemafelder. Es gibt noch keinen implementierten gemeinsamen Niveauschalter im Portal.

Formuliere neue Fragen und Antwortoptionen in der jeweiligen Zielsprache (Italienisch oder Englisch), passend zum jeweiligen Niveau, Erklärungen auf Deutsch. Erst sinnvolles Globalverstehen, danach selektive oder detaillierte Fragen. Keine durch Titel, Vorschaubild, Weltwissen oder andere Aufgaben schon verratenen Lösungen. Distraktoren plausibel formulieren. Keine feste Zahl von Fragen oder Formaten erzwingen. Bei sehr kurzen Beiträgen zwei bis vier, bei gehaltvolleren etwa vier bis acht Aufgaben als Orientierung.

Verwende die sieben Aufgabentypen der Kommandodatei (single_choice, multiple_choice, true_false, short_answer, matching, ordering, gap_fill) exakt nach Schema 1.1 und halte die Regeln im Abschnitt „Aufgabenqualität“ und „Titelbild“ der Kommandodatei verbindlich ein. Nutze pro Paket mindestens drei verschiedene Typen (bei sehr kurzen Clips mindestens zwei). Kurzantworten eng formulieren, fachlich korrekte Varianten und Zahlen-/Wortschreibungen berücksichtigen. Mehrere verlangte Informationen nicht durch Teilantworten abdecken. Komplexe Deutungen nicht als automatisch sicher bewertbare Kurzantwort ausgeben.

Das tatsächlich verwendete Transkript ins Feld transcript übernehmen. Unsicherheiten und fehlenden Audioabgleich sichtbar dokumentieren; keine Quellen- oder Prüfungsaussagen aus einem vorangegangenen KI-Text als unabhängig bestätigt behandeln. Ausschnittsgrenzen deutlich angeben; das aktuelle Schema hat keine start/end-Felder. Rechte standardmäßig needs_review.

Ausgabe: Je Variante eine separate gültige JSON-Datei; bei fehlender Dateiausgabe ein eigener JSON-Codeblock je Datei. Zusätzlich ein getrennter Prüfbericht mit Quellenzugriff, Transkriptumfang/-herkunft, offenen Punkten, Nutzungsstatus, GER-Begründung und je Frage Belegstelle plus verlässlicher Originalzeitmarke oder „nicht ermittelt“. Für Varianten zum selben Medium gemeinsame Quelle und Unterschiede der Lernziele erläutern. Vor Ausgabe Syntax, Pflichtfelder, IDs, Antwortreferenzen und inhaltliche Belege prüfen. Keine Veröffentlichung oder abschließende Freigabe behaupten.

## GER Referenz

Europarat, CEFR Companion Volume 2020: https://rm.coe.int/cefr-companion-volume-with-new-descriptors-2020/16809ea0d4. Die operationalisierten Arbeitskriterien stehen in der Kommandodatei. Es handelt sich um vorläufige redaktionelle Einordnungen, keine zertifizierte Einstufung.


## Authentische Medien ab B1

Verbindlicher Schwerpunkt: Ab etwa Klasse 10 beziehungsweise B1 auch Originalbeiträge für ein allgemeines muttersprachliches Publikum einbeziehen, für Italienisch und Englisch. Sprache und Zielgruppe unterscheiden: Die sprechende Person muss nicht zwingend Muttersprachler sein; entscheidend ist, dass das Material nicht eigens als Fremdsprachenübung produziert wurde. Ein offizieller Verlagsclip ist nicht allein deshalb authentisches Alltagsmaterial. Natürlicher Dialog, journalistischer Bericht, Interview, Dokumentarbeitrag und allgemeinverständliches Erklärvideo sind mögliche Textsorten. Bildungs- und Wissensvermittlung für ein allgemeines Publikum ist zulässig; Fremdsprachenunterricht gesondert kennzeichnen.

Für B1 kurze, zusammenhängende Beiträge mit klarer Handlung oder überschaubarem Thema suchen; für B2/C1 auch Standpunkte, Argumente, Register und implizite Aussagen, sofern tatsächlich hörbar belegt. Keine automatische Einstufung nach Kanal, Thema oder Jahrgangsstufe. Auch Originalmaterial kann bereits auf A2 geeignet sein. Anspruchsvolle Aufnahme plus leichte Frage nicht als uneingeschränktes A1-Material bezeichnen. Akzente und natürliche Sprechweise nicht pauschal aussortieren, aber für die Zielgruppe einordnen. Hörverstehen und Hörsehverstehen getrennt ausweisen.

Originalaufnahme und Transkript nicht zur Niveausenkung umschreiben. Hilfen getrennt planen: Wortschatzvorentlastung ohne Lösungsvorgabe, begründete Ausschnittwahl, Wiederholungen, gestufte Aufgaben. Vorgegebene Niveaus sind Zielkorridore, keine Pflichtetiketten. Bei fehlender Eignung einen Kandidaten ersetzen. Regionen, Perspektiven und englische Sprachvarietäten sinnvoll variieren. Quellen und Nutzungsrechte je Medium prüfen.


## Verbindliche Ergänzung zu Bildern Transkripten und Aufgabenmenge

Für Phase 1: passende Videovorschaubilder nach Möglichkeit mit recherchieren und die tatsächliche Originalquelle im Prüfbericht nennen. Einbettung konkret als bestätigt, noch ungeprüft oder nicht möglich ausweisen; Link-Erreichbarkeit allein ist keine Bestätigung. Keine Bildrechte erfinden. Die App leitet YouTube-Thumbnails aus der Video-ID ab; keine zusätzlichen unbekannten Bildfelder ins JSON schreiben.

Für Phase 2: transcript enthält nur die Mitschrift, vorhandene Zeitmarken, belegte Sprecherangaben und nötige Markierungen unverständlicher Stellen. NIEMALS Vorbemerkungen über Gemini, Herkunft, Prüfstand, Nutzungsrechte oder redaktionelle Arbeit in das Transkript setzen. Diese Informationen gehören in sources, reviewNotes und den getrennten Prüfbericht.

Erstelle gehaltvolle Aufgabenapparate: Bei einer ergiebigen Hörstrecke von ein bis drei Minuten häufig fünf bis acht unabhängige Aufgaben; bei längeren Beiträgen acht bis zwölf oder sinnvoll getrennte Abschnitte. Bei sehr kurzen Clips reichen zwei bis vier. Das sind redaktionelle Richtwerte, keine GER-Regeln. Nicht durch Wiederholungen oder belanglose Einzelheiten auffüllen. Jede Frage muss eine eigene belegte Verstehensleistung prüfen. Bei fehlender Textgrundlage keine scheinbar fertigen zusätzlichen Fragen erfinden.

Mische die Aufgabentypen sinnvoll (siehe Kommandodatei, Tabelle der Typen): Hauptaussage per single_choice, Detailinformationen per multiple_choice oder gap_fill, Zuordnungen per matching, Abläufe per ordering, Aussagen per true_false, gezielte Kurzantworten per short_answer. Nicht jede richtige Auswahl auf Position a und nicht jede Wahr/Falsch-Aussage auf wahr setzen. Distraktoren müssen plausibel sein. Vermeide, dass eine Aufgabe die Lösung einer anderen verrät. Die Aufgaben sollen nicht lediglich Titel oder Thema abfragen, sondern Hauptaussagen, relevante Einzelheiten, Beziehungen und bei passenden höheren Stufen belegte Schlussfolgerungen.

Im getrennten Prüfbericht je Paket: Aufgabenanzahl, Typenverteilung, Verstehensziel und Belegstelle je Aufgabe, Ergebnis der Eigenkontrolle aus der Kommandodatei, bekannte Schwächen. Liefere außerdem je Paket ein Titelbild nach dem Abschnitt „Titelbild“ der Kommandodatei (Bilddatei plus `coverImage`) oder, falls du keine Bilder erzeugen kannst, einen einzeiligen englischen Bildprompt im Prüfbericht.

Zusätzlich zu den neun oben genannten IDs bereits bearbeitet und von neuer Recherche auszuschließen: a9yO-K8mwL0, o_XVt5rdpFY, zUOcVqQ5WQI, vSCE4ml9ti8, G9sK8oyPGUM.


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

Für neue Aufgabenpakete ausdrücklich schemaVersion 1.1 und nach Möglichkeit vocabulary mitliefern. Die vollständige gültige Strukturvorlage ist listening-with-vocabulary.json.
