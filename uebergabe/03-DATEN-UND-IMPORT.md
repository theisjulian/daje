# Speicherung Bewertung und Import

## Lokale Speicher

- ecco-look-v1: Farbwelt, Hell/Dunkel/System und Tageslichtphase.
- ecco-progress-v1: früherer Lernstand, wird in lokale Profile übernommen.
- sprachtrainer-profiles-v2: aktive Profil-ID und benannte lokale Profile einschließlich Wortrecords, Tageshistory, Ziel und portal-Daten.
- ripassa-editor-v1: separat gespeicherter lokaler Redaktionsbestand.
- ripassa-ui-language-v1: Oberflächensprache.

Kein Login und keine Zugriffstrennung zwischen Menschen im selben Browserprofil. Fehler beim Schreiben in localStorage werden gemeldet. Profilexport ist unverschlüsseltes JSON und enthält die Portalwerte des aktiven Profils, jedoch keine komplette Kopie aller Inhalte. Importiert wird als zusätzliches Profil, bestehende Profile werden nicht ersetzt. Profilimport und Inhaltsimport sind verschiedene Formate und verschiedene Funktionen.

Wortrecords enthalten step, difficult, due, lastDay, method und attempts. Tagesaktivitäten enthalten attempts, correct, self, checked und eindeutige Wort-IDs. Portalwerte enthalten favorites, history, listening, notes, recordHistory und die Ansichtspräferenz audience. Listening-Daten speichern Antworten, checked, transcriptOpened, usedTranscript, attempts und gegebenenfalls lastResult. Das letzte Ergebnis ist keine vollständige Versuchshistorie. Keine personenbezogenen Nutzerdaten sind im ZIP enthalten.

## Tatsächliche Wiederholungsregel

rateWord() erhöht nach Erfolg an einem anderen Tag die Stufe bis maximal 4. Bei Erfolg am selben Tag erfolgt kein zusätzlicher Stufenanstieg über die vorhandene Stufe hinaus; ein Eintrag wird mindestens Stufe 1. Bei Fehler wird die Stufe 0. Fristen werden über [1,1,3,7,14][step] berechnet. Das ist eine Produktheuristik, keine wissenschaftlich optimale allgemeine Formel. rateAssistedWord() erhält die frühere Stufe und setzt Fälligkeit auf den Folgetag. Beim Zuordnen werden Wiederholungsstufen und Tagesziele nicht erhöht. Karten-Selbsteinschätzung und geprüfte Antwort sind gespeichert, werden aber noch nicht als vollständig getrennte Kompetenzdimensionen modelliert.

## Zwei unterschiedliche Antwortprüfungen

TheisGrading.compare() prüft Vokabeln. Unicode, Großschreibung, Leerzeichen und abschließende .!? werden normalisiert. Gepflegte acceptedAnswers ergänzen die Wortform. Artikel dürfen nur nach entsprechender answerPolicy fehlen. Genus-, Akzent- und konservative Tippfehlererkennung erzeugen Hinweise statt automatischer Freigabe. oneEdit verwendet Mindestlänge und begrenzte Zeichenabweichung; keine semantische KI-Bewertung. Italienisch, Französisch, Spanisch und Englisch haben einfache Artikelmuster, keine vollständige Morphologie. Rückrichtung verwendet translations.

TheisContent.assessAnswer() prüft Hörfragen. Single Choice vergleicht Options-ID, Wahr/Falsch den gespeicherten booleschen Schlüssel mit Eingabetext true/false, Kurzantworten eine normalisierte Gleichheit mit acceptedAnswers. Kein allgemeines semantisches Verständnis und keine automatische Teilantwortbewertung. Das Sprachmodell läuft nicht beim Korrigieren.

## Inhaltsvertrag

Quelle der Wahrheit ist portal/dist/content-contract.js. Format theis-learning-package; schemaVersion als String 1.0 oder 1.1; kind listening oder vocabulary. Gemeinsame Pflichtfelder: id, title, language, level, description, topics, sources. Sprachen it/en/fr/es; GER A1 bis C2. IDs maximal 40 Zeichen, Kleinbuchstaben/Ziffern/Bindestriche; gewisse gefährliche Objektbezeichner werden abgewiesen. Optional reviewNotes und cover. Unbekannte Felder werden nicht einfach als unterstützte Erweiterung weitergetragen.

sources enthält kind own/provided/external, citation, optional url und rights own/cleared/needs_review. Strukturell gültig bedeutet nicht geprüft. Rechtefeld ist keine serverseitige Genehmigung. URLs müssen HTTPS sein und dürfen keine Zugangsdaten enthalten. Globale Reihenfolge und Rechte müssen im Backend erneut validiert werden.

Listening: estimatedMinutes 1–90, media, optional transcript bis 16000 Zeichen und vocabularyIds, questions 1–40. media.type: speech mit text bis 12000, audio mit HTTPS-url oder youtube mit elfstelliger videoId. Nur drei Fragetypen:

- single_choice: id, prompt, explanation, 2–6 Optionen {id,text}, correctOptionId.
- true_false: id, prompt, explanation, answer als Boolean.
- short_answer: id, prompt, explanation, acceptedAnswers, modelAnswer.

Eigenständiger Wortschatz: translationLanguage de, collection, section, entries mit 1–1000 Einträgen. Ein Eintrag hat id, target, translations; optional acceptedAnswers, example, definition, grammar und answerPolicy. grammar.partOfSpeech noun/verb/adjective/phrase/other, optional gender masculine/feminine/neuter/common/unknown und article. answerPolicy.article required/optional, typo hint/strict. Bei vorhandener answerPolicy beide Werte liefern. Wortübersetzungen sind derzeit Deutsch, unabhängig von der gewählten UI-Sprache.

Listening 1.1 kann vocabulary mit 1–60 solchen Einträgen enthalten. Kein weiteres Paketobjekt darin verschachteln. In 1.0 wird dieses Feld abgewiesen. Das Paket wird atomar validiert; ein defektes Wort verhindert den Import. Die Vokabelansicht wird daraus erzeugt; keine manuelle zweite Wortliste nötig. Referenzen in vocabularyIds und Inline-Wortschatz nicht unbedacht mischen.

## Redaktionsablauf und Grenzen

Import maximal 2 MB, gültiges JSON → Strukturprüfung → lokaler Entwurf → Formular/Vorschau → lokale Freigabe. Maximal 100 lokale Pakete. Doppelte Paket-IDs werden beim Neuimport abgewiesen. needs_review blockiert die lokale Freigabe. Das Formular bearbeitet vorhandene Wortfelder, aber hat noch keinen vollständigen Eintrag-hinzufügen/entfernen-Ablauf. Rechteänderung und neue Struktur gegebenenfalls über JSON mit neuer Paket-ID durchführen; nicht von einem vorhandenen vollständigen Rechteformular ausgehen.

Die 14 privaten Startkandidaten besitzen eine Sonderbehandlung: unveränderte Startentwürfe mit festem updatedAt werden bei neuem Seedstand aktualisiert, ausdrücklich bearbeitete lokale Versionen bleiben bestehen. Daher immer mit frischem Browser und mit Bestandsdaten prüfen. Für einen echten Serverbetrieb ist dieser Mechanismus durch Entwurfsrevisionen und klare Publikation zu ersetzen.
