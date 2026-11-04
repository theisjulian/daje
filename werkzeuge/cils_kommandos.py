#!/usr/bin/env python3
"""Erzeugt die Kommandodateien je CILS-Aufgabentyp (portal/dist/imports/cils/<typ>.md).
Aufruf: python3 werkzeuge/cils_kommandos.py portal/dist/imports/cils
Grundlage: CILS-Hefte A1 und A2 Adolescenti, UNO-B1 Adolescenti, DUE-B2 Adolescenti, TRE-C1 (Giugno 2023, Dicembre 2018),
QUATTRO-C2 (Giugno 2017) samt Chiavi und Produzione orale. Die Anweisung (consegna) setzt daje selbst ein."""
import json, sys, os
out = sys.argv[1]
T = {}
def add(id, title, part, levels, intro, example, rules):
    T[id] = (title, part, levels, intro, example, rules)

add('asc-scelta','Ascolto · Completa le frasi (scelta multipla)','Ascolto','A1–C2',
"""Wie im Heft: Die Lernenden hören die Aufnahme (Transkript unten) und vervollständigen Satzanfänge; je Satz eine richtige Fortsetzung. A1/A2: 4 Sätze mit 3 Fortsetzungen (Ascolto, Prova 2). B1: 7 Sätze mit 4 Fortsetzungen (Prova 2). B2: Prova 1 = 7 kurze Hörtexte mit je einem Satz, Prova 2 = ein Text mit 7 Sätzen. C1/C2: Prova 1 und 2 je ein Text mit 7 Sätzen und 4 Fortsetzungen.""",
{"esercizi":[{"titolo":"kurzer Titel, passend zur Aufnahme","piuTesti":False,"domande":[{"domanda":"Durante il campo Arianna ha potuto","opzioni":["conoscere ragazzi di altri paesi.","imparare a cucinare.","visitare tre città.","lavorare in un museo."],"giusta":"A"}]}]},
"""- Genau so viele Sätze (`domande`) und Fortsetzungen (`opzioni`) wie in den Vorgaben.
- `domanda` ist wie im Heft ein **Satzanfang** ohne Doppelpunkt („Secondo Marco, la gita …“), die Optionen setzen ihn grammatisch passend fort und enden mit Punkt.
- Besteht das Transkript aus mehreren kurzen Hörtexten (B2, Prova 1), setze `"piuTesti": true` und schreib zu jedem Text genau einen Satz in dessen Reihenfolge.
- Jeder Satz bezieht sich auf eine eigene Stelle des Transkripts, in der Reihenfolge des Hörtexts.
- Die richtige Fortsetzung steht inhaltlich im Transkript, meist mit anderen Worten. Ablenker verwenden Wörter aus dem Transkript, sind aber falsch (andere Person, Zeit, Ort, Grund).
- Keine Fragen zu Details, die man beim einmaligen Hören nicht verstehen kann.""")

add('asc-info','Ascolto · Informazioni presenti','Ascolto','B1–C2',
"""Ascolto, Prova 3. **B1/B2:** 12 Aussagen, bei jeder entscheiden die Lernenden vero oder falso (B1 oft zwei Hörtexte mit je 6 Aussagen). **C1/C2:** 15 Aussagen A–O, genau 6 davon stehen im Hörtext; die Lernenden kreuzen diese 6 an.""",
{"esercizi":[{"titolo":"…","affermazioni":[{"testo":"Il concorso esiste da più di settant’anni.","presente":False},{"testo":"I vincitori vengono scelti dai giovani lettori.","presente":True}]}]},
"""- Genau so viele `affermazioni` wie verlangt. B1/B2: etwa die Hälfte mit `"presente": true`, gemischt. C1/C2: **genau** so viele `true` wie unter `presenti` angegeben (6), alle übrigen `false`.
- Die Aussagen folgen der Reihenfolge des Transkripts; bei zwei Hörtexten zuerst alle zum ersten Text.
- Zutreffende Aussagen sagen dasselbe mit anderen Worten. Falsche Aussagen greifen Wörter und Zahlen aus dem Transkript auf, verändern aber einen wichtigen Punkt (Zahl, Person, „esclusivamente“, Ursache, Reihenfolge) oder behaupten etwas, das nicht gesagt wird.
- C1/C2: Aussagen als kurze, sachliche Sätze im Stil „Il relatore sostiene che …“, „Secondo l’intervistata …“.""")

add('asc-completa','Ascolto · Completare il testo','Ascolto','A1–B1',
"""Ascolto, Prova 1: Die Lernenden hören eine Durchsage, Nachricht oder einen Bericht und schreiben die fehlenden Wörter in den Text. Im Heft: A1 10, A2 14, UNO-B1 28 Lücken.""",
{"esercizi":[{"titolo":"…","testo":"Hai dai 10 ai 15 [[anni]]? Partecipa alla nostra [[gita]] …"}]},
"""- `testo` ist das **Transkript selbst** (wörtlich, ggf. um Begrüßungen gekürzt), in dem du **genau** so viele Lücken setzt wie verlangt.
- Gelückt werden einzelne, gut hörbare Inhaltswörter (Nomen, Adjektive, Infinitive, Zahlwörter), nie Artikel oder Präpositionen, nie zwei Lücken hintereinander, gleichmäßig über den Text verteilt.
- Das Wort in der Lücke steht genau so im Transkript.""")

add('asc-brevi','Ascolto · Testi brevi (una informazione per testo)','Ascolto','A1–A2',
"""Ascolto, Prova 3: Die Aufnahme besteht aus 4 kurzen Hörtexten (Nachricht auf dem Anrufbeantworter, Durchsage, Werbung, kurzer Dialog). Zu jedem Text gibt es 3 Informationen, genau eine kommt im Text vor.""",
{"esercizi":[{"titolo":"…","testi":[{"numero":1,"opzioni":["Il treno parte alle otto.","Il treno è in ritardo.","Il treno arriva a Roma."],"giusta":"B"}]}]},
"""- Genau 4 Einträge in `testi`, einer je Kurztext im Transkript (die Lehrkraft markiert sie als „Testo 1“ …; sonst nach Sprechsituationen teilen).
- Je 3 kurze Informationen, genau eine trifft zu. Die anderen beiden nehmen Wörter aus demselben Text auf, stimmen aber nicht.""")

add('let-scelta','Lettura · Testo e completa le frasi','Comprensione della lettura','A1–C2',
"""Lettura, Prova 1: ein Text mit Überschrift, dazu Satzanfänge mit Fortsetzungen. Im Heft: A1 kurzer Hinweis oder Info-Text (~110 Wörter), 4 Sätze × 3; A2 kurzes Interview oder Info-Text (~180 Wörter), 4 × 3; B1 Zeitungsartikel (~400 Wörter), 7 × 4; B2 Interview oder Artikel (~450 Wörter), 7 × 4; C1 Interview oder journalistischer Essay (~650 Wörter), 7 × 4; C2 anspruchsvoller Essay oder Feuilleton (~900 Wörter), 7 × 4.""",
{"esercizi":[{"titolo":"Un’estate da volontari","testo":"Absatz 1 …\n\nAbsatz 2 …","domande":[{"domanda":"Secondo l’articolo, i ragazzi scelgono il volontariato soprattutto perché","opzioni":["vogliono fare nuove amicizie.","…","…","…"],"giusta":"A"}]}]},
"""- Textlänge in Wörtern **genau im Bereich** der Vorgabe `parole`, Textsorte laut `genere`, in Absätze gegliedert. Interviews mit Fragen der Redaktion fett oder als eigene Absätze.
- Genau so viele `domande` (Satzanfänge) und `opzioni` wie verlangt; Sätze in der Reihenfolge des Textes.
- Ab B1 prüft mindestens ein Satz die Hauptaussage oder Absicht des Textes, ab B2 mindestens einer eine Schlussfolgerung oder Haltung, ab C1 auch Implizites und Wortbedeutung im Kontext.""")

add('let-info','Lettura · Informazioni presenti','Comprensione della lettura','B1–C2',
"""Lettura, Prova 2. **B1:** Vorstellung eines Festivals, Wettbewerbs oder Projekts (~350 Wörter), 14 Aussagen, je vero/falso. **B2:** Regolamento mit nummerierten Artikeln (~400 Wörter), 14 Aussagen vero/falso. **C1/C2:** Ausschreibung (bando) oder Regelwerk mit Abschnitten (C1 ~700, C2 ~900 Wörter), 15 Aussagen A–O, genau 7 stehen im Text.""",
{"esercizi":[{"titolo":"…","testo":"Art. 1 – Finalità\n…\n\nArt. 2 – Destinatari\n…","affermazioni":[{"testo":"Per iscriversi bisogna compilare un modulo sul sito.","presente":True},{"testo":"Gli artisti devono inviare la registrazione del brano.","presente":False}]}]},
"""- Textlänge laut `parole`, Textsorte laut `genere`; Regelwerke und Ausschreibungen mit Zwischenüberschriften („Art. 1 – …“, „Requisiti“, „Scadenze“).
- Genau so viele `affermazioni` wie verlangt. B1/B2: etwa die Hälfte zutreffend. C1/C2: **genau** so viele `true` wie unter `presenti` (7).
- Aussagen in der Reihenfolge des Textes, jede zu einer anderen Stelle.
- Falsche Aussagen sind plausibel und nah am Text (Detail vertauscht, Bedingung weggelassen, Verallgemeinerung wie „tutti“, „solo“, „direttamente“, Frist oder Betrag verändert).""")

add('let-ricostruisci','Lettura · Ricostruzione del testo','Comprensione della lettura','B1–C2',
"""Lettura, Prova 3: Ein Text ist in Teile zerlegt (B1/B2: 11, C1/C2: 16). Teil A ist der Anfang. Die übrigen Teile stehen mit gemischten Buchstaben da; die Lernenden schreiben neben jeden Teil die Nummer seiner Position. daje mischt die Teile und vergibt die Buchstaben selbst.""",
{"esercizi":[{"titolo":"Giovani promesse","parti":["Anfang (wird Teil A)","zweiter Teil in richtiger Reihenfolge","…"]}]},
"""- `parti` in der **richtigen** Reihenfolge, **genau** so viele wie verlangt; jeder Teil 1–2 Sätze (`parole per parte`). Teile dürfen mitten im Satz enden und im nächsten Teil weitergehen (wie im Heft).
- Die Reihenfolge ist eindeutig durch Inhalt **und** sprachliche Signale: Zeitangaben, Konnektoren (inoltre, infatti, ma, tuttavia), Pronomen und bestimmter Artikel für schon Genanntes, Satzfortsetzungen.
- Kein Teil passt an zwei Stellen; Personen und Dinge werden erst eingeführt, dann wieder aufgegriffen.""")

add('let-brevi','Lettura · Testi brevi (una informazione per testo)','Comprensione della lettura','A1–A2',
"""Lettura, Prova 2: vier kurze Gebrauchstexte mit Überschrift (Anzeige, Hinweis, Programm, Nachricht). Zu jedem Text 3 Informationen, genau eine steht im Text.""",
{"esercizi":[{"testi":[{"titolo":"Corso di chitarra","testo":"…","opzioni":["…","…","…"],"giusta":"A"}]}]},
"""- Genau 4 Texte (Länge laut `parole`), je 3 Informationen.
- Die richtige Information gibt eine Aussage des Textes mit anderen Worten wieder; die anderen beiden nutzen Textwörter, stimmen aber nicht.""")

add('let-abbina','Lettura · Testi da completare (A–H)','Comprensione della lettura','A1–A2',
"""Lettura, Prova 3: vier Textanfänge (1–4) mit Überschrift und acht Fortsetzungen (A–H). Vier Fortsetzungen passen eindeutig, vier passen thematisch, aber zu keinem Anfang.""",
{"esercizi":[{"inizi":[{"titolo":"Festa di classe","testo":"Sabato organizziamo una festa per la fine della scuola.","fine":"E"}],"fini":{"A":"…","B":"…","C":"…","D":"…","E":"Porta qualcosa da mangiare!","F":"…","G":"…","H":"…"}}]},
"""- Genau 4 `inizi` und 8 `fini` (A–H); jeder Buchstabe höchstens einmal als `fine`.
- Jede Fortsetzung passt grammatisch an jeden Anfang; entscheidend ist der Inhalt.""")

add('str-articoli','Strutture · Articoli (e preposizioni articolate)','Analisi delle strutture di comunicazione','A1, B1',
"""Strutture, Prova 1. A1: Lückentext mit 10 bestimmten Artikeln. UNO-B1: 20 Lücken für Artikel (bestimmt und unbestimmt) und Präpositionen mit Artikel; steht eine einfache Präposition in Klammern, wird sie mit dem Artikel verbunden.""",
{"esercizi":[{"titolo":"Il fantastico mondo di Xanadu","esempio":"(di) della","testo":"È un progetto per la promozione (di) [[della]] lettura. Si rivolge (a) [[agli]] studenti … È [[una]] comunità su internet …"}]},
"""- **Genau** so viele Lücken wie verlangt. A1: nur il, lo, la, l’, i, gli, le. B1: etwa zur Hälfte Artikel (auch un, uno, una, un’), zur Hälfte Präpositionen mit Artikel; die einfache Präposition steht in runden Klammern **direkt vor** der Lücke: `(di) [[della]]`.
- `esempio`: das Beispiel (0) wie im Heft, z. B. `"(di) della"` oder `"la"`; es steht nicht im Text.
- Auch schwierige Fälle: gli/lo vor s+Konsonant, z, ps; l’ vor Vokal; nel/negli; sul; dall’; con il/col (beide Lösungen: `[[con il/col]]`).""")

add('str-aggettivi','Strutture · Aggettivi','Analisi delle strutture di comunicazione','A2',
"""Strutture, Prova 1 (A2): ein zusammenhängender Text mit 10 Lücken für Adjektive. Die Grundform steht in Klammern direkt vor der Lücke.""",
{"esercizi":[{"titolo":"…","esempio":"(fedele) fedeli","testo":"Ho due amiche (simpatico) [[simpatiche]] e un cane (vivace) [[vivace]] …"}]},
"""- **Genau** so viele Lücken wie verlangt; Mischung aus -o/-a/-i/-e, Adjektiven auf -e, Pluralformen auf -co/-chi, -ca/-che, -go/-ghi.
- `esempio`: Beispiel (0) wie im Heft, z. B. `"(fedele) fedeli"`.
- Das Nomen, auf das sich das Adjektiv bezieht, ist im Satz eindeutig erkennbar.""")

add('str-pronomi','Strutture · Aggettivi e pronomi','Analisi delle strutture di comunicazione','B2',
"""Strutture, Prova 1 (DUE-B2): offener Lückentext mit 20 Lücken, je ein Wort: Possessiva, Demonstrativa, Indefinita, Personal- und Relativpronomen.""",
{"esercizi":[{"titolo":"…","esempio":"tutta","testo":"Ho letto [[tutta]] la storia in una sera. I libri? [[Li]] ho comprati usati. [[Chi]] legge molto …"}]},
"""- **Genau** so viele Lücken wie verlangt, je **ein** Wort; Mischung laut `forme`.
- Jede Lücke ist aus dem Kontext eindeutig; wo zwei Wörter gleichwertig sind, beide mit `/`: `[[quelli/coloro]]`, `[[suo/proprio]]`.
- Keine Lücke darf allein durch Genus oder Numerus lösbar sein; entscheidend sind Bezug und Funktion.""")

add('str-parola','Strutture · Completa il testo','Analisi delle strutture di comunicazione','C1–C2',
"""Strutture, Prova 1 (TRE-C1, QUATTRO-C2): offener Lückentext mit 20 Lücken, je ein Wort, ohne Hinweise. Gesucht sind vor allem Konnektoren, Präpositionen, Pronomen und Adverbien (im Heft z. B. ma, che, fino a, mentre, cui, ne, poiché).""",
{"esercizi":[{"titolo":"…","esempio":"che","testo":"Lo scrittore, [[che]] aveva vissuto a lungo all’estero, tornò a Napoli [[nel]] 1952 …"}]},
"""- **Genau** so viele Lücken wie verlangt, je **ein** Wort (zusammengesetzte Präpositionen wie „fino a“ zählen als eine Lücke, dann beide Fassungen angeben).
- Mischung laut `forme`; keine Lücke für Inhaltswörter, die man nur raten könnte.
- Jede Lücke ist aus Satzbau und Zusammenhang eindeutig; gleichwertige Lösungen mit `/` (`[[poiché/perché]]`).
- Text: anspruchsvoller Sachtext (Kultur, Geschichte, Gesellschaft) von 300–400 Wörtern.""")

add('str-verbi','Strutture · Verbi','Analisi delle strutture di comunicazione','A1–C2',
"""Strutture, Prova 2: ein zusammenhängender Text, in dem Verben ergänzt werden. Der Infinitiv steht in Klammern direkt vor der Lücke. A1 Präsens (10), A2 passato prossimo (10), ab B1 20 Lücken mit den Zeiten und Modi aus `tempi`.""",
{"esercizi":[{"titolo":"…","esempio":"(nascere) è nato","testo":"Quando (arrivare) [[sono arrivata/sono arrivato]] a Bologna, non (conoscere) [[conoscevo]] nessuno …"}]},
"""- **Genau** so viele Lücken wie verlangt, mit den Zeiten und Modi aus `tempi`; ein zusammenhängender Text (Biografie, Bericht, Erzählung), in dem die Zeitenfolge zählt.
- `esempio`: Beispiel (0) wie im Heft, z. B. `"(nascere) è nato"`.
- Der Kontext entscheidet eindeutig über Zeit und Modus. Wo zwei Formen richtig sind, beide mit `/` angeben.
- C1/C2: auch passato remoto, Passiv, Konjunktiv (Imperfekt, Plusquamperfekt) und implizite Formen; verlangt der Text eine implizite Form, steht der Hinweis in der Klammer, z. B. `(uscire, gerundio)`.""")

add('str-scelta','Strutture · Completa il testo (scelta multipla)','Analisi delle strutture di comunicazione','A1–C2',
"""Strutture, Prova 3: ein Text mit Lücken; zu jeder Lücke stehen in einer Tabelle mehrere Möglichkeiten. A1/A2: 8 Lücken mit A–C; ab B1: 15 Lücken mit A–D, vor allem Wortschatz (edizione/occasione/celebrazione, competizione/gara) und feste Verbindungen.""",
{"esercizi":[{"titolo":"…","esempio":"edizione","testo":"Ho deciso di partire [[nonostante|poiché|finché|dato che]] il tempo fosse brutto …"}]},
"""- **Genau** so viele Lücken und **genau** so viele Möglichkeiten je Lücke wie verlangt; richtige Lösung zuerst.
- `esempio`: Lösung der Beispiellücke (0), optional.
- **Ablenker gleicher Wortart und gleicher Form** wie die Lösung. Nur eine Option passt in den Satz, grammatisch **und** inhaltlich.
- Ab B1 darf die Lösung nicht allein an Genus, Numerus oder Artikel erkennbar sein; ab C1 feine Bedeutungsunterschiede und Kollokationen.""")

add('str-situazioni','Strutture · Espressioni e situazioni di comunicazione','Analisi delle strutture di comunicazione','B1–B2',
"""Strutture, Prova 4 (UNO-B1, DUE-B2): 10 kurze Äußerungen (Anzeige, Nachricht, Frage, Hinweis, Werbung); zu jeder wählen die Lernenden aus 4 Situationen die passende.""",
{"esercizi":[{"titolo":"…","espressioni":[{"espressione":"Professore, scusi, mi può ripetere i titoli dei libri che ha indicato durante la lezione?","opzioni":["Chiedi a un compagno l’elenco dei libri.","A fine lezione dici al professore di non aver preso nota dei libri.","Chiedi alla biblioteca se ci sono alcuni libri.","Chiedi a tuo padre di ascoltarti mentre ripeti."],"giusta":"B"}]}]},
"""- **Genau** 10 `espressioni`, je 4 Situationen in der Form „È l’annuncio …“, „Chiedi a …“, „Il professore …“.
- Die Situationen unterscheiden sich in **Sprecher, Adressat, Textsorte oder Kanal**. Alle passen zum Thema; nur eine passt zu Inhalt, Register (tu/Lei) und Textsorte.
- B2 auch Ironie, Höflichkeitsformen und indirekte Bitten.""")

add('str-trasforma','Strutture · Riscrivi le frasi','Analisi delle strutture di comunicazione','C1–C2',
"""Strutture, Prova 4 (TRE-C1, QUATTRO-C2): 6 Sätze aus einem Regelwerk oder einer Ausschreibung. Zu jedem Satz sind die ersten Wörter einer Umformulierung vorgegeben; die Lernenden schreiben den Satz mit veränderter Satzstruktur und gleicher Bedeutung weiter (z. B. aktiv → passiv, Nebensatz → Nominalgruppe, explizit → implizit).""",
{"esercizi":[{"titolo":"Regolamento della biblioteca","frasi":[{"frase":"I lettori che desiderano prolungare il prestito devono presentare una richiesta entro la scadenza.","inizio":"Chi desidera","soluzioni":["prolungare il prestito deve presentare una richiesta entro la scadenza."]}]}]},
"""- **Genau** 6 `frasi`, alle aus **einem** zusammenhängenden Regelwerk oder Bando zum Thema (Satzlänge laut `genere`).
- `inizio`: die vorgegebenen Anfangswörter der Umformulierung (2–4 Wörter), wie im Heft; sie erzwingen eine andere Satzstruktur.
- `soluzioni`: Fortsetzungen **ohne** den Anfang, alle wirklich üblichen richtigen Fassungen (1–6), die erste ist die beste.
- Nur Umformungen mit wenigen eindeutigen Lösungen wählen; Arten der Umformung abwechseln.""")

add('scr-testo','Scrittura · Prova 1','Produzione scritta','A1–C2',
"""Produzione scritta, Prova 1: zwei Themen zur Wahl („Puoi scegliere di trattare uno dei seguenti argomenti“). TRE-C1: argumentierender Text mit 160–180 Wörtern (Überlegungen, Vor- und Nachteile, eigener Standpunkt). Die übrigen Niveaus: Richtwerte laut Vorgaben.""",
{"esercizi":[{"compiti":[{"consegna":"Negli ultimi anni molte città hanno chiuso il centro storico alle auto. Esponi le tue considerazioni sui vantaggi e sugli svantaggi di questa scelta.","modello":"Mustertext genau auf Niveau und in der verlangten Länge","criteri":["presenta vantaggi e svantaggi","esprime e motiva un punto di vista","usa connettivi"]},{"consegna":"…","modello":"…","criteri":["…"]}]}]},
"""- **Genau 2** Aufgaben in `compiti`. `consegna` nennt nur das Thema mit Situation und Inhaltspunkten (die allgemeine Anweisung mit Wortzahl setzt daje davor).
- `modello` ist ein Mustertext genau auf Niveau und im Bereich `parole`.
- `criteri`: 3–5 kurze Prüfpunkte auf Italienisch (Inhalt, Aufbau, Sprache).""")

add('scr-lettera','Scrittura · Prova 2','Produzione scritta','A1–C2',
"""Produzione scritta, Prova 2: zwei Situationen zur Wahl, in denen die Lernenden eine Mail oder einen Brief schreiben. TRE-C1: formelle E-Mail mit 100–120 Wörtern (Beschwerde, Vorschlag, Anfrage). Die übrigen Niveaus: Richtwerte laut Vorgaben, Register laut `registro`.""",
{"esercizi":[{"compiti":[{"consegna":"Hai partecipato a un corso di formazione online che non ha rispettato il programma annunciato. Scrivi un’e-mail all’ente organizzatore per esprimere la tua insoddisfazione e chiedere un rimborso parziale.","modello":"…","criteri":["formula di apertura e chiusura formale","usa il Lei","tutti i punti"]},{"consegna":"…","modello":"…","criteri":["…"]}]}]},
"""- **Genau 2** Aufgaben in `compiti`; `consegna` nennt Adressat, Anlass und 2–4 Inhaltspunkte.
- Register laut `registro`; der Mustertext zeigt typische Anrede- und Schlussformeln.
- `criteri` 3–5 Prüfpunkte auf Italienisch.""")

add('ora-dialogo','Orale · Prova 1','Produzione orale','A1–C2',
"""Produzione orale, Prova 1. A1/A2: 2 einfache Rollenspiele („Il candidato dovrà dimostrare di saper interagire …“). B1/B2: 4 Gesprächsthemen mit Fragen, die Prüferin bzw. der Prüfer führt das Gespräch (2–3 Minuten). C1: 4 komplexe Situationen, in denen die Lernenden eine Rolle übernehmen („L’esaminatore assume il ruolo del …“), 3–4 Minuten. C2: 4 Thesen zur Diskussion („Esprimi la tua opinione.“), 3–4 Minuten.""",
{"esercizi":[{"situazioni":[{"situazione":"Sei il rappresentante degli studenti e devi convincere il preside a organizzare una settimana di attività sportive. L’esaminatore assume il ruolo del preside.","spunti":["Che cosa proponi esattamente?","Come rispondi all’obiezione dei costi?","Quali vantaggi porti come argomento?"]}]}]},
"""- **Genau** so viele `situazioni` wie verlangt, in der Form laut `forma`, aus Sicht der Lernenden mit „tu“ bzw. als Frage an sie.
- A1/A2/C1: Die Rolle der Lehrkraft nennen („L’esaminatore è …“). B1/B2: ein bis zwei Leitfragen. C2: eine zugespitzte These plus „Esprimi la tua opinione.“
- `spunti` = 3–6 Redemittel bzw. Nachfragen für die Lehrkraft.""")

add('ora-monologo','Orale · Prova 2','Produzione orale','A1–C2',
"""Produzione orale, Prova 2: zusammenhängendes Sprechen zu einem Thema, ohne Unterbrechung. A1/A2: 3 Themen (eines davon im Heft ein Bild), etwa anderthalb Minuten. B1/B2: 4 Themen (zwei davon im Heft Bilder), anderthalb Minuten. C1: 4 Impulse mit Daten oder einer Aussage und „Che cosa ne pensi?“, 2–3 Minuten. C2: 4 argumentative Impulse, 2–3 Minuten. daje arbeitet ohne Bilder: alle Themen als Text.""",
{"esercizi":[{"argomenti":[{"argomento":"Secondo una ricerca, sei giovani su dieci leggono le notizie solo sui social network. Che cosa ne pensi?","spunti":["Dove ti informi tu?","Quali rischi vedi?","Che cosa potrebbe fare la scuola?"]}]}]},
"""- **Genau** so viele `argomenti` wie verlangt, in der Form laut `forma` (A1/A2 persönlich: „Te stesso“, „Un oggetto che ti piace“; B1 persönlich, B2 erlebnis- und meinungsbezogen).
- `stimolo` (optional): ein selbst geschriebener Satz als Impuls, kein Zitat realer Personen.
- `spunti`: 3–6 Leitfragen auf Italienisch, die eine Gliederung nahelegen.""")

for id,(title,part,levels,intro,example,rules) in T.items():
    extra = ('- Offene Lücken: **alle** gleichwertig richtigen Lösungen mit `/` angeben (Synonyme, gleichwertige Formen), z. B. `[[benché/sebbene/nonostante]]`. Nur was in den Klammern steht, wertet daje als richtig.'
             if id in ('asc-completa','str-articoli','str-aggettivi','str-pronomi','str-parola','str-verbi') else
             '- `soluzioni`: **alle** gleichwertig richtigen Fortsetzungen angeben (auch mit Synonymen); nur diese wertet daje als richtig.' if id=='str-trasforma' else '')
    ex = json.dumps({"livello":"…","tipo":id,"tema":"…",**example,"noteDocente":["…"]}, ensure_ascii=False, indent=2)
    md = f"""# daje · CILS-Aufgabentyp `{id}`

**{title}** · {part} · Niveaus {levels}

## Worum es geht

{intro}

## Was in `esercizi` steht

```json
{ex}
```

## Regeln für diesen Typ

{rules}
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
{extra}
"""
    open(os.path.join(out, id + '.md'),'w').write(md)
print(len(T))
