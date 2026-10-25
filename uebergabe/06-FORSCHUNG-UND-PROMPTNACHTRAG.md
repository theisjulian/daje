# Neuer didaktischer Stand und Promptnachtrag

Die vollständige Recherche mit Grenzen und elf Originalquellen steht in der Projektdatei Version 3. Dies ist die ergänzende technische Arbeitsanweisung. Die originalen Promptdateien unter portal/dist/imports bleiben als Teil des exakten Quellstands unverändert. Vor neuer Serienproduktion die nachstehenden Regeln mit ihnen konsolidieren. Diese Datei führt keine neuen Schemafelder ein.

## Lernmethoden

Aktives Abrufen vor Lösungseinblendung; wiederholtes Abrufen auch nach erstem Erfolg; verteilte Wiederholung über Tage; verständliches korrektives Feedback; Training passend zu Verständnis, Wortproduktion oder Orthografie. Multiple Choice und Zuordnen sind sinnvolle Wiedererkennungsaufgaben, aber kein Nachweis freien Schreibens. Handschrift als freiwillige Abrufoption anbieten, keine generelle Überlegenheit oder bloßes Abschreiben bewerben. Bilder bei passenden konkreten Bedeutungen ergänzen; Übersetzungen nicht pauschal ersetzen. Keine Diagnose visueller/auditiver Lerntypen. Beispiele und neue Kontexte ergänzen, ohne Anfänger sofort mit komplexer Satzproduktion zu überlasten.

Die bestehende 1/3/7/14-Heuristik und die schon vorhandenen neun Tipps sind nicht automatisch die vollständige Umsetzung der jüngsten Recherche. Neue Fortschrittsdimensionen brauchen Datenmodell, UI, Migration und Tests. Eine Punkteverteilung für Hinweise oder genaue ideale Abstände ist aus den Quellen nicht unmittelbar vorgeschrieben.

## Zusatzauftrag an Gemini für Wortschatz

Erstelle nach der gültigen Kommandodatei und dem vollständigen Beispiel ein Paket nach Schema 1.1. Nimm nach Möglichkeit den zentralen Wortschatz der tatsächlich verfügbaren Hörstrecke direkt in vocabulary auf. Verwende ausschließlich unterstützte Felder und die Struktur der entries eines Vokabelpakets. Keine neuen didaktischen Metadaten erfinden.

Wähle zentrale Wörter und sinnvolle Wendungen, deren Bedeutung im verwendeten Kontext tatsächlich belegt ist. Lemmatisierung ist möglich. Gib kontextgerechte deutsche Bedeutungen, natürliche kurze eigene Beispiele und bei Eignung eine verständliche Definition in der Zielsprache an. Artikel und Genus fachlich prüfen. translations und acceptedAnswers nicht mit beliebigen bedeutungsähnlichen Wörtern auffüllen. Wortvarianten müssen zur gewünschten Abfrage passen.

Bei Nomen grammar und answerPolicy gezielt setzen. Entscheide begründet, ob der Artikel für diese Lernliste verlangt wird. Ein Akzent oder eine Wortendung kann Bedeutung oder Grammatik ändern; solche Formen nicht bloß zur Toleranz als korrekt hinterlegen. Tippfehler sollen Hinweise auslösen, keine automatische Freigabe. Für Rückrichtung mehrere passende deutsche Bedeutungen aufnehmen; nicht jede entfernte Übersetzung akzeptieren.

Vorgesehene Lernziele, schwierige Fehlerfälle und mögliche Bilder nur im getrennten Prüfbericht erläutern, soweit das Schema dafür keine eigenen Felder hat. Keine Bild-URL oder Hint-Texte in erfundene JSON-Felder schreiben. Keine pauschalen Lerntypzuordnungen. Prüfe Eintrags-IDs, Übersetzungen und das Gesamtpaket; ein fehlerhafter Eintrag soll nicht stillschweigend übersprungen werden.

## Präzisierungen der vorhandenen Folgeprompts

- In Phase 1 das Transkript in der jeweiligen Originalsprache liefern, bei englischen Videos also Englisch. Die historische Formulierung „italienisches Transkript“ gilt nicht für englische Quellen.
- Frühere und spätere Richtwerte zur Frageanzahl sind keine Quoten. Ergiebige Strecken benötigen genügend eigenständige Fragen; sehr kurze Clips dürfen kompakt bleiben. Keine Redundanz zur Erfüllung einer Zahl.
- transcript enthält ausschließlich die Mitschrift und sinnvolle belegte Kennzeichnungen. Prüfstand ausschließlich in reviewNotes, sources und separatem Bericht.
- Für neue Suche alle 14 vorhandenen YouTube-IDs aus INHALTSINVENTAR.json ausschließen.
- Medium, Aufgabe, Hilfe und GER-Zielniveau getrennt beurteilen. Keine angeblich zertifizierte Niveaustufe aus Kanalname oder Clipdauer ableiten.
- Erzeugtes Material bleibt bis zur tatsächlichen Prüfung Arbeitsfassung. Die KI darf keine rechtliche oder fachliche Freigabe behaupten.
