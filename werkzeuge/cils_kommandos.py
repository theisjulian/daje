#!/usr/bin/env python3
"""Erzeugt die Kommandodateien je CILS-Aufgabentyp (portal/dist/imports/cils/<typ>.md).
Aufruf: python3 werkzeuge/cils_kommandos.py portal/dist/imports/cils
Grundlage: CILS-Hefte A1/A2 Adolescenti, UNO-B1 Adolescenti (Giugno 2016), DUE-B2 Adolescenti (Dicembre 2024)."""
import json, sys, os
out = sys.argv[1]
T = {}
def add(id, title, part, levels, intro, example, rules):
    T[id] = (title, part, levels, intro, example, rules)

add('asc-scelta','Ascolto · Scelta multipla','Ascolto','A1–C2',
"""Die Lernenden hören die Aufnahme der Lehrkraft (Transkript unten) und beantworten Fragen mit Auswahlantworten. In den CILS-Heften gibt es diese Form auf allen Niveaus: A1/A2 mit Satzanfängen und 3 Fortsetzungen, ab B1 mit 7 Satzanfängen und je 4 Fortsetzungen (z. B. „Durante il Campo Arianna ha potuto …“).""",
{"esercizi":[{"titolo":"kurzer Titel, passend zur Aufnahme","domande":[{"domanda":"Perché Marco chiama Giulia?","opzioni":["Per invitarla a una festa.","Per chiederle un libro.","Per spostare un appuntamento.","Per raccontarle un viaggio."],"giusta":"C"}]}]},
"""- Genau so viele Fragen (`domande`) und Optionen (`opzioni`) wie in den Vorgaben.
- A1/A2: `domanda` darf ein Satzanfang sein („Martina è …“), die Optionen setzen ihn fort.
- Jede Frage bezieht sich auf eine eigene Stelle des Transkripts, in der Reihenfolge des Hörtexts.
- Die richtige Antwort steht inhaltlich im Transkript, meist mit anderen Worten. Ablenker verwenden Wörter aus dem Transkript, sind aber falsch (andere Person, Zeit, Ort, Grund).
- Keine Fragen zu Details, die man beim einmaligen Hören nicht verstehen kann (Hausnummern, Nebensätze am Rand).""")

add('asc-info','Ascolto · Informazioni presenti (vero o falso)','Ascolto','B1–C2',
"""Wie im CILS-Heft UNO-B1 und DUE-B2 (Ascolto, Prova 3): Die Lernenden hören die Aufnahme und entscheiden bei jeder Aussage, ob die Information im Hörtext vorkommt (vero) oder nicht (falso). Im Heft 12 Aussagen, oft zu zwei kurzen Hörtexten (je 6).""",
{"esercizi":[{"titolo":"…","affermazioni":[{"testo":"Il concorso esiste da più di settant’anni.","presente":False},{"testo":"I vincitori vengono scelti dai giovani lettori.","presente":True}]}]},
"""- Genau so viele `affermazioni` wie verlangt, etwa die Hälfte mit `"presente": true`, gemischt (nicht abwechselnd).
- Die Aussagen folgen der Reihenfolge des Transkripts; bei zwei Hörtexten zuerst alle zum ersten Text.
- Zutreffende Aussagen sagen dasselbe mit anderen Worten. Falsche Aussagen greifen Wörter und Zahlen aus dem Transkript auf, verändern aber einen wichtigen Punkt (Zahl, Person, „esclusivamente“, „direttamente“, Ursache, Reihenfolge) oder behaupten etwas, das nicht gesagt wird.""")

add('asc-completa','Ascolto · Completare il testo','Ascolto','A1–B1',
"""Die Lernenden hören eine Durchsage, Nachricht oder Ansage und ergänzen in einem Text die fehlenden Wörter. Im CILS-Heft: A1 10, A2 14, UNO-B1 28 Lücken (z. B. Reportage eines Schul-TG).""",
{"esercizi":[{"titolo":"…","consegna":"Ascolta il testo e completa con le parole che mancano.","testo":"Hai dai 10 ai 15 [[anni]]? Partecipa alla nostra [[gita]] …"}]},
"""- `testo` ist das **Transkript selbst** (wörtlich, ggf. gekürzt um Begrüßungen), in dem du genau so viele Lücken setzt wie verlangt.
- Gelückt werden einzelne, gut hörbare Inhaltswörter (Nomen, Adjektive, Infinitive, Zahlwörter), nie Artikel oder Präpositionen, nie zwei Lücken hintereinander.
- Das Wort in der Lücke steht genau so im Transkript.""")

add('asc-brevi','Ascolto · Testi brevi','Ascolto','A1–A2',
"""Die Aufnahme besteht aus mehreren kurzen Hörtexten (Nachricht auf dem Anrufbeantworter, Durchsage, Werbung, kurzer Dialog). Zu jedem Text wählen die Lernenden die eine Aussage, die zutrifft.""",
{"esercizi":[{"titolo":"…","testi":[{"numero":1,"opzioni":["Il treno parte alle otto.","Il treno è in ritardo.","Il treno arriva a Roma."],"giusta":"B"}]}]},
"""- Ein Eintrag in `testi` für jeden Kurztext im Transkript (die Lehrkraft markiert sie als „Testo 1“, „Testo 2“ …). Ist nichts markiert, teile sinnvoll nach Sprechsituationen.
- Je 3 Aussagen, genau eine trifft zu. Die anderen beiden nehmen Wörter aus demselben Text auf, stimmen aber nicht.""")

add('let-scelta','Lettura · Testo con domande a scelta multipla','Comprensione della lettura','A1–C2',
"""Ein zusammenhängender Lesetext mit Überschrift (A1/A2: Information zu Schulprojekt, Veranstaltung, Verein; ab B1 auch Zeitungsartikel, Blog, Erfahrungsbericht; ab C1 Kommentar, Essay, Sachtext). Dazu Satzanfänge mit Auswahlantworten; im CILS-Heft ab B1: 7 Satzanfänge mit je 4 Fortsetzungen zu einem Text von etwa 400 Wörtern.""",
{"esercizi":[{"titolo":"Un’estate da volontari","testo":"Absatz 1 …\n\nAbsatz 2 …","domande":[{"domanda":"Secondo l’articolo, i ragazzi scelgono il volontariato soprattutto perché","opzioni":["vogliono fare nuove amicizie.","…","…","…"],"giusta":"A"}]}]},
"""- Textlänge in Wörtern laut Vorgabe `parole`, in Absätze gegliedert.
- Genau so viele `domande` und `opzioni` wie verlangt; Fragen in der Reihenfolge des Textes.
- Ab B1 prüft mindestens eine Frage die Hauptaussage oder Absicht des Textes, ab B2 mindestens eine eine Schlussfolgerung oder Haltung des Autors.""")

add('let-info','Lettura · Informazioni presenti (vero o falso)','Comprensione della lettura','B1–C2',
"""Wie im CILS-Heft (Lettura, Prova 2): ein Informationstext mit Überschrift (Ausschreibung, Festival, Projekt, Verein), dazu 14 Aussagen; bei jeder entscheiden die Lernenden vero oder falso.""",
{"esercizi":[{"titolo":"…","testo":"…","affermazioni":[{"testo":"Per iscriversi bisogna compilare un modulo sul sito.","presente":True},{"testo":"Gli artisti devono inviare la registrazione del brano.","presente":False}]}]},
"""- Textlänge laut `parole`, in Absätze gegliedert; genau so viele `affermazioni` wie verlangt, etwa die Hälfte zutreffend.
- Aussagen in der Reihenfolge des Textes, jede zu einer anderen Stelle.
- Falsche Aussagen sind plausibel und nah am Text (Detail vertauscht, Bedingung weggelassen, Verallgemeinerung wie „tutti“, „solo“, „direttamente“).""")

add('let-ricostruisci','Lettura · Ricostruzione del testo','Comprensione della lettura','B1–C2',
"""Wie im CILS-Heft (Lettura, Prova 3): Ein Text ist in 11 Teile zerlegt. Teil A ist der Anfang und vorgegeben; die anderen Teile stehen mit gemischten Buchstaben da, die Lernenden schreiben die Reihenfolge auf. daje mischt die Teile und vergibt die Buchstaben selbst.""",
{"esercizi":[{"titolo":"Giovani promesse","parti":["Anfang (wird Teil A)","zweiter Teil in richtiger Reihenfolge","…"]}]},
"""- `parti` in der **richtigen** Reihenfolge, genau so viele wie verlangt; jeder Teil 1–2 Sätze (15–40 Wörter).
- Die Reihenfolge ist eindeutig durch Inhalt **und** sprachliche Signale: Zeitangaben (all’inizio, poi, alla fine del 2013), Konnektoren (inoltre, infatti, ma), Pronomen und bestimmter Artikel für schon Genanntes („in questa società“).
- Kein Teil passt an zwei Stellen; Personen und Dinge werden erst eingeführt, dann wieder aufgegriffen.""")

add('let-brevi','Lettura · Testi brevi','Comprensione della lettura','A1–A2',
"""Vier kurze Gebrauchstexte mit Überschrift (Anzeige, Hinweis auf einer Website, Programm, Nachricht). Zu jedem Text drei Aussagen, genau eine trifft zu.""",
{"esercizi":[{"testi":[{"titolo":"Corso di chitarra","testo":"…","opzioni":["…","…","…"],"giusta":"A"}]}]},
"""- Genau 4 Texte, je 25–45 Wörter, je 3 Aussagen.
- Die richtige Aussage gibt eine Information des Textes mit anderen Worten wieder; die anderen beiden nutzen Textwörter, stimmen aber nicht.""")

add('let-abbina','Lettura · Inizi e fini','Comprensione della lettura','A1–A2',
"""Vier kurze Textanfänge mit Überschrift und acht Fortsetzungen (A–H). Vier Fortsetzungen passen eindeutig, vier passen thematisch, aber zu keinem Anfang.""",
{"esercizi":[{"inizi":[{"titolo":"Festa di classe","testo":"Sabato organizziamo una festa per la fine della scuola.","fine":"E"}],"fini":{"A":"…","B":"…","C":"…","D":"…","E":"Porta qualcosa da mangiare!","F":"…","G":"…","H":"…"}}]},
"""- Genau 4 `inizi` und 8 `fini` (A–H); jeder Buchstabe höchstens einmal als `fine`.
- Jede Fortsetzung passt grammatisch an jeden Anfang; entscheidend ist der Inhalt.""")

add('str-articoli','Strutture · Articoli e preposizioni articolate','Analisi delle strutture di comunicazione','A1, B1',
"""A1: Lückentext mit bestimmten Artikeln. UNO-B1 (Strutture, Prova 1): Lückentext mit 20 Lücken für Artikel (bestimmt und unbestimmt) und Präpositionen mit Artikel; steht eine einfache Präposition in Klammern, wird sie mit dem Artikel verbunden.""",
{"esercizi":[{"titolo":"Il fantastico mondo di Xanadu","consegna":"Completa il testo con gli articoli e le preposizioni articolate: utilizza le preposizioni fra parentesi.","testo":"È un progetto per la promozione (di) [[della]] lettura. Si rivolge (a) [[agli]] studenti … È [[una]] comunità su internet …"}]},
"""- Genau so viele Lücken wie verlangt. A1: nur il, lo, la, l’, i, gli, le. B1: etwa zur Hälfte Artikel (auch un, uno, una, un’), zur Hälfte Präpositionen mit Artikel; die einfache Präposition steht in runden Klammern **direkt vor** der Lücke: `(di) [[della]]`.
- Auch schwierige Fälle: gli/lo vor s+Konsonant, z, ps; l’ vor Vokal; nel/negli; sul; dall’; con il/col (beide Lösungen: `[[con il/col]]`).
- Großschreibung am Satzanfang beachten.""")

add('str-aggettivi','Strutture · Accordo degli aggettivi','Analisi delle strutture di comunicazione','A2',
"""Ein zusammenhängender Text mit Lücken für Adjektive. Die Grundform steht in Klammern direkt vor der Lücke.""",
{"esercizi":[{"titolo":"…","consegna":"Completa il testo con la forma corretta degli aggettivi.","testo":"Ho due amiche (simpatico) [[simpatiche]] e un cane (vivace) [[vivace]] …"}]},
"""- Genau so viele Lücken wie verlangt; Mischung aus -o/-a/-i/-e, Adjektiven auf -e, unregelmäßigen Pluralformen (-co/-chi, -ca/-che) und bello/buono vor dem Nomen.
- Das Nomen, auf das sich das Adjektiv bezieht, ist im Satz eindeutig erkennbar.""")

add('str-verbi','Strutture · Forme verbali','Analisi delle strutture di comunicazione','A1–C2',
"""Ein zusammenhängender Text, in dem Verben in der passenden Zeit und im passenden Modus ergänzt werden. Der Infinitiv steht in Klammern direkt vor der Lücke.""",
{"esercizi":[{"titolo":"…","consegna":"Completa il testo con i verbi al tempo e al modo giusti.","testo":"Quando (arrivare) [[sono arrivata/sono arrivato]] a Bologna, non (conoscere) [[conoscevo]] nessuno …"}]},
"""- Genau so viele Lücken wie verlangt (im Heft UNO-B1 und DUE-B2: 20), mit den Zeiten und Modi aus der Vorgabe `tempi` gemischt; ein zusammenhängender Bericht, in dem die Zeitenfolge zählt (passato prossimo/imperfetto, Vorzeitigkeit, Zukunft in der Vergangenheit).
- Der Kontext entscheidet eindeutig über Zeit und Modus (Zeitangaben, Konjunktionen, Hauptsatzverb). Wo zwei Formen richtig sind, beide mit `/` angeben.
- Ab B2 auch Konjunktiv nach Verben der Meinung, nach Konjunktionen (benché, affinché, prima che) und im periodo ipotetico; ab C1 implizite Formen, wo der Text sie verlangt (dann steht der Hinweis in der Klammer, z. B. `(uscire, gerundio)`).""")

add('str-scelta','Strutture · Completamento a scelta multipla','Analisi delle strutture di comunicazione','A1–C2',
"""Ein zusammenhängender Text mit Lücken; zu jeder Lücke gibt es mehrere Möglichkeiten (A1/A2: 3, ab B1: 4). Im CILS-Heft UNO-B1 und DUE-B2 (Prova 3): 15 Lücken, vor allem Wortschatz (edizione/occasione/celebrazione, competizione/gara, capacità/possibilità) und feste Verbindungen; die Optionen stehen in einer Tabelle A–D.""",
{"esercizi":[{"titolo":"…","consegna":"Completa il testo. Scegli una delle proposte.","testo":"Ho deciso di partire [[nonostante|poiché|finché|dato che]] il tempo fosse brutto …"}]},
"""- Genau so viele Lücken und Optionen je Lücke wie verlangt; richtige Lösung zuerst.
- **Ablenker gleicher Wortart und gleicher Form** wie die Lösung (Konnektor gegen Konnektor, Präposition gegen Präposition, gleiche Person und Zahl bei Verben). Nur eine Option passt in den Satz, grammatisch **und** inhaltlich.
- Ab B1 darf die Lösung nicht allein an Genus, Numerus oder Artikel erkennbar sein.
- Wechsle die Phänomene ab; nicht zweimal dieselbe Lösung.""")

add('str-pronomi','Strutture · Pronomi e determinanti','Analisi delle strutture di comunicazione','B2–C2',
"""Wie im CILS-Heft DUE-B2 (Strutture, Prova 1): offener Lückentext mit 20 Lücken, je ein Wort: Personal- und Relativpronomen, Demonstrativa, Indefinita und Possessiva.""",
{"esercizi":[{"titolo":"…","consegna":"Completa il testo con i pronomi e gli aggettivi adatti.","testo":"Ho letto [[tutta]] la storia in una sera. I libri? [[Li]] ho comprati usati. [[Chi]] legge molto …"}]},
"""- Genau so viele Lücken wie verlangt, je **ein** Wort; Mischung aus: tutto/tutta, ogni, alcuni, qualcuno, nessuno, altro, tanto/molto, questo/quello/coloro, che/chi/cui, lui/lei/loro, mi/ti/li/le/ne, suo/proprio.
- Jede Lücke ist aus dem Kontext eindeutig; wo zwei Wörter gleichwertig sind, beide mit `/`: `[[quelli/coloro]]`, `[[suo/proprio]]`.
- Keine Lücke darf allein durch Genus oder Numerus lösbar sein; entscheidend sind Bezug und Funktion.""")

add('str-situazioni','Strutture · Espressioni e situazioni comunicative','Analisi delle strutture di comunicazione','B1–C2',
"""Wie im CILS-Heft (Strutture, Prova 4): 10 kurze Äußerungen (Anzeige, Nachricht, Frage, Hinweis, Werbung); zu jeder wählen die Lernenden aus 4 Situationen die passende.""",
{"esercizi":[{"titolo":"…","espressioni":[{"espressione":"Professore, scusi, mi può ripetere i titoli dei libri che ha indicato durante la lezione?","opzioni":["Chiedi a un compagno l’elenco dei libri.","A fine lezione dici al professore di non aver preso nota dei libri.","Chiedi alla biblioteca se ci sono alcuni libri.","Chiedi a tuo padre di ascoltarti mentre ripeti."],"giusta":"B"}]}]},
"""- Genau so viele `espressioni` wie verlangt, je 4 Situationen in der Form „È l’annuncio …“, „Chiedi a …“, „Il professore …“.
- Die Situationen unterscheiden sich in **Sprecher, Adressat, Textsorte oder Kanal** (Anzeige in der Schulbacheca, Website, SMS, Radio-Spot, mündlich). Alle passen zum Thema; nur eine passt zu Inhalt, Register (tu/Lei) und Textsorte.
- Ab B2 auch Ironie, Höflichkeitsformen und indirekte Bitten.""")

add('str-trasforma','Strutture · Trasformazione di frasi','Analisi delle strutture di comunicazione','B2–C2',
"""Die Lernenden formen Sätze nach Anweisung um: aktiv → passiv, direkte → indirekte Rede, explizit → implizit (gerundio, participio, infinito), Nebensatz → Nominalgruppe, Satzverbindung mit vorgegebenem Konnektor.""",
{"esercizi":[{"titolo":"…","frasi":[{"istruzione":"Volgi al passivo","frase":"Il comune ha chiuso la piscina.","soluzioni":["La piscina è stata chiusa dal comune.","La piscina è stata chiusa dal Comune."]}]}]},
"""- Genau so viele `frasi` wie verlangt; Arten der Umformung abwechseln.
- `istruzione` kurz und eindeutig auf Italienisch („Volgi al discorso indiretto“, „Trasforma con il gerundio“, „Unisci le frasi con «benché»“).
- `soluzioni`: alle wirklich üblichen richtigen Fassungen (1–6), die erste ist die beste. Nur Umformungen mit wenigen eindeutigen Lösungen wählen.""")

add('str-registro','Strutture · Lessico e registro','Analisi delle strutture di comunicazione','C1–C2',
"""In jedem Satz ist ein Ausdruck mit Sternchen markiert. Die Lernenden wählen aus 4 Möglichkeiten den Ausdruck, der ihn im Kontext gleichbedeutend ersetzt (Synonym, gehobenes oder formelles Register, feste Wendung).""",
{"esercizi":[{"titolo":"…","frasi":[{"frase":"Il direttore ha *messo in evidenza* i risultati del progetto.","opzioni":["sottolineato","sottratto","sottoscritto","sottoposto"],"giusta":"A"}]}]},
"""- Genau so viele `frasi` wie verlangt; der zu ersetzende Ausdruck steht zwischen `*…*`.
- Alle 4 Optionen haben dieselbe Wortart und Form und könnten grammatisch eingesetzt werden; nur eine bewahrt Bedeutung und Register im Kontext.
- Ablenker: ähnlich klingende Wörter (Paronyme), falsche Freunde, Wörter mit verwandter, aber anderer Bedeutung.""")

add('scr-testo','Scrittura · Testo descrittivo, narrativo o argomentativo','Produzione scritta','A1–C2',
"""Erste Schreibaufgabe der CILS: A1/A2 kurze Beschreibung oder Erzählung aus dem eigenen Alltag; B1 Erzählung oder Beschreibung (Erlebnis, Person, Ort); ab B2 auch Stellungnahme oder Argumentation, ab C1 Kommentar, Rezension, Bericht.""",
{"esercizi":[{"compiti":[{"consegna":"Racconta una gita scolastica che ti è piaciuta: dove siete andati, che cosa avete fatto, perché ti è piaciuta.","parole":"100-120","modello":"Mustertext genau auf Niveau und in der verlangten Länge","criteri":["racconta in ordine cronologico","usa passato prossimo e imperfetto","dice perché gli è piaciuta"]}]}]},
"""- 1 bis 3 Aufgaben zur Auswahl in `compiti`, jede mit Situation, Textsorte und 2–4 Inhaltspunkten in `consegna` (aus Sicht der Lernenden mit „tu“).
- `parole` laut Vorgabe; `modello` ist ein Mustertext genau auf Niveau und in dieser Länge.
- `criteri`: 3–5 kurze Prüfpunkte auf Italienisch (Inhalt, Aufbau, Sprache), nach denen die Lernenden ihren Text selbst prüfen.""")

add('scr-lettera','Scrittura · Lettera, e-mail o messaggio','Produzione scritta','A1–C2',
"""Zweite Schreibaufgabe der CILS: Nachricht, Mail oder Brief an eine bestimmte Person mit klarem Anlass (einladen, sich entschuldigen, um etwas bitten, sich beschweren, sich bewerben). Bis B1 informell, ab B2 auch formell.""",
{"esercizi":[{"compiti":[{"consegna":"Scrivi un’e-mail alla direttrice della biblioteca comunale: ti presenti, chiedi informazioni su un tirocinio estivo e proponi un incontro.","parole":"80-100","modello":"…","criteri":["formula di apertura e chiusura formale","usa il Lei","tutti e tre i punti"]}]}]},
"""- 1 bis 3 Aufgaben in `compiti`; `consegna` nennt Adressat, Anlass und 2–4 Inhaltspunkte.
- Register passend zum Adressaten; der Mustertext zeigt typische Anrede- und Schlussformeln.
- `parole` laut Vorgabe; `criteri` 3–5 Prüfpunkte auf Italienisch.""")

add('ora-dialogo','Orale · Conversazione','Produzione orale','A1–C2',
"""Erster Teil der mündlichen Prüfung. A1/A2: Rollenspiel in einer Alltagssituation. Ab UNO-B1: Gespräch mit der Prüferin bzw. dem Prüfer zu **einem von vier Themen**, das die Lernenden wählen; die Lehrkraft beginnt mit einer Frage und fragt nach (2–3 Minuten).""",
{"esercizi":[{"situazioni":[{"situazione":"Quale rapporto hai con lo smartphone? Pensi che possa sostituire la televisione?","spunti":["Quante ore al giorno lo usi?","Che cosa fai di solito con lo smartphone?","Ci sono momenti in cui lo spegni?","Che cosa consiglieresti a un fratello più piccolo?"]}]}]},
"""- A1/A2: genau 2 `situazioni` als Rollenspiel, aus Sicht der Lernenden mit „tu“ (die Lehrkraft spielt die andere Rolle); `spunti` = 3–5 Redemittel.
- Ab B1: genau 4 `situazioni` als Gesprächsthemen aus dem Alltag Jugendlicher bzw. Erwachsener, jeweils als ein bis zwei Leitfragen formuliert (B2: mit Meinung und Begründung: „Pensi che …? Perché?“). `spunti` = 4–6 Nachfragen für die Lehrkraft.""")

add('ora-monologo','Orale · Monologo','Produzione orale','A1–C2',
"""Zweiter Teil der mündlichen Prüfung: zusammenhängendes Sprechen ohne Hilfe. Im Heft wählen die Lernenden eines von vier Themen, zwei davon sind Bilder („la situazione dell’immagine“). daje arbeitet ohne Bilder: alle Themen als Text; wer mag, ergänzt im Unterricht eigene Fotos. Dauer ab B1 etwa anderthalb Minuten.""",
{"esercizi":[{"argomenti":[{"argomento":"Un’esperienza che ti ha fatto cambiare idea su qualcosa o su qualcuno","spunti":["Che cosa pensavi prima?","Che cosa è successo?","Che cosa pensi adesso e perché?"]}]}]},
"""- A1/A2: 3 `argomenti`; ab B1: 4 `argomenti` zur Wahl (B1 eher persönlich: „come trascorri la domenica“, „il tuo attore preferito“; B2 erlebnis- und meinungsbezogen: „un’esperienza che ti ha fatto cambiare idea“).
- `stimolo` (optional): ein selbst geschriebener Satz als Impuls, kein Zitat realer Personen.
- `spunti`: 3–6 Leitfragen auf Italienisch, die eine Gliederung nahelegen (Einstieg, Erlebnis/Beispiel, eigene Meinung).""")

for id,(title,part,levels,intro,example,rules) in T.items():
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
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
"""
    open(os.path.join(out, id + '.md'),'w').write(md)
print(len(T))
