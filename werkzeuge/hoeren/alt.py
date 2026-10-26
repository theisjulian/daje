"""Erweiterung der bestehenden Hörverstehens-Pakete (inhalte/*.json) um Aufgabenblöcke.
Nur Aufgaben, die sich aus dem vorhandenen Transkript belegen lassen. Ausgabe: portal/dist/listening-extra.js"""
import json, pathlib, re
from lib import Q
ROOT = pathlib.Path(__file__).resolve().parents[2]
EX = {}
IT = dict(P='Prima dell’ascolto: ', D='Durante l’ascolto: ', L='Lessico e lingua: ', A='Dopo l’ascolto: ')
EN = dict(P='Before listening: ', D='While listening: ', L='Language: ', A='After listening: ')

def start(id, lang, n):
    q = Q(); q.n = n
    return q, (IT if lang == 'it' else EN)

def done(id, pre, post, notes, label):
    EX[id] = {'pre': pre.items, 'post': post.items, 'teacherNotes': notes, 'levelLabel': label}

def notes(warm, steps, tips, follow):
    return {'warmup': warm, 'steps': steps, 'tips': tips, 'followUp': follow}
STEPS_IT = ['1. Vor dem Hören: Bild/Frage, Wortschatz entlasten (Block „Prima“).', '2. Erstes Hören ohne Aufgabe oder nur mit Gesamtfrage.', '3. Zweites Hören: Detailaufgaben (Block „Durante“).', '4. Sprache: Wendungen und Formen aus dem Text (Block „Lessico“).', '5. Nach dem Hören: Transfer, Rollenspiel oder Gespräch (Block „Dopo“ und Anregungen unten).']
STEPS_EN = ['1. Before listening: picture/question, pre-teach vocabulary.', '2. First listening: gist only.', '3. Second listening: detail tasks.', '4. Language: expressions and forms from the text.', '5. After listening: transfer, role-play or discussion.']

# ---- al bar
q, T = start('x', 'it', 4); p = Q(); p.n = 100
pre = Q(); pre.n = 4
pre.sc(T['P'] + 'Dove si ordina di solito un caffè da portare via?', ['Al bar', 'In farmacia', 'In biblioteca', 'In banca'], 0, 'Al bar si ordina caffè e cornetto.')
pre.mt(T['P'] + 'Collega parola e spiegazione.', [('da portare via', 'non si consuma nel locale'), ('la bustina', 'piccolo pacchetto'), ('vorrei', 'forma gentile per chiedere'), ('per favore', 'formula di cortesia')], 'Parole che servono per capire il dialogo.')
post = Q(); post.n = 6
post.tf(T['D'] + 'Il cliente saluta con “Buongiorno”.', True, 'Il dialogo inizia con “Buongiorno”.')
post.tf(T['D'] + 'La persona al banco chiede conferma: “Vuole un caffè da portare via?”.', True, 'Controlla se ha capito bene.')
post.od(T['D'] + 'Metti le battute nell’ordine giusto.', ['Buongiorno. Un caffè per favore.', 'Non bevo il caffè qui, vado via.', 'Vuole un caffè da portare via?', 'Sì, da portare via, per favore.', 'Ha una bustina di zucchero?'], 'Ordine del dialogo.')
post.gf(T['L'] + 'Completa con le parole del dialogo.', 'Non [[a]] il caffè qui, [[b]] il caffè e vado via.', [['bevo'], ['prendo']], 'Presente indicativo: io bevo, io prendo.')
post.sc(T['L'] + 'Quale frase è più cortese?', ['Vorrei un caffè, per favore.', 'Dammi un caffè.', 'Caffè!', 'Voglio caffè.'], 0, 'Condizionale + per favore.')
post.sc(T['L'] + 'Con “vuole un caffè?” la persona usa…', ['la forma di cortesia (Lei)', 'la forma amichevole (tu)', 'il plurale (voi)', 'l’imperativo'], 0, '“Vuole” = Lei.')
post.sa(T['L'] + 'Completa: “Ha una bustina di … ?” (una parola)', ['zucchero'], 'zucchero', 'La bustina di zucchero.')
post.sc(T['A'] + 'Che cosa diresti per ordinare un cappuccino da portare via?', ['Vorrei un cappuccino da portare via, per favore.', 'Cappuccino qui mangio.', 'Io cappuccino vado.', 'Dammi cappuccino.'], 0, 'Frase modello per il transfer.')
done('it-a2-ordine-al-bar', pre, post, notes(['Immagine: un bancone di un bar italiano. Che cosa si ordina?', 'Domanda: Che differenza c’è tra bere al banco e al tavolo?'], STEPS_IT, ['Clip molto breve (circa 55 secondi): due ascolti bastano.', 'Rollenspiel in coppie: cliente e barista.'], ['Rollenspiel: ordina colazione per due persone, una bevanda da portare via.', 'Scrivi un breve dialogo con tre richieste in più (zucchero, latte, bicchiere).']), 'Livello A2 · Ordinare')

# ---- strada
pre = Q(); pre.n = 2
pre.mt(T['P'] + 'Collega parola e significato.', [('dritto', 'senza girare'), ('a sinistra', 'dalla parte del cuore'), ('la stazione', 'dove arrivano e partono i treni'), ('girare', 'cambiare direzione')], 'Parole per la descrizione del percorso.')
pre.sc(T['P'] + 'Che cosa chiedi, se non conosci la strada?', ['Dov’è…?', 'Quanti anni hai?', 'Che ora è?', 'Come ti chiami?'], 0, 'Domande per orientarsi.')
post = Q(); post.n = 4
post.sc(T['D'] + 'Quale luogo viene cercato?', ['La stazione', 'La farmacia', 'Il museo', 'La scuola'], 0, 'La persona cerca la stazione.')
post.od(T['D'] + 'Ordina il dialogo.', ['Scusa, potresti dirmi dov’è la stazione?', 'Certo, vai dritto', 'Poi gira a sinistra'], 'Domanda, poi “dritto”, poi “sinistra”.')
post.gf(T['L'] + 'Completa con le parole del dialogo.', 'Vai [[a]] e poi [[b]] a sinistra.', [['dritto'], ['gira']], 'Imperativo (tu): vai, gira.')
post.sc(T['L'] + '“Potresti dirmi…?” è una richiesta…', ['gentile (condizionale)', 'brusca', 'al passato', 'al futuro'], 0, 'Il condizionale rende la domanda gentile.')
post.tf(T['L'] + 'Le persone si danno del tu.', True, '“Scusa”, “potresti”, “vai”, “gira”: forma tu.')
post.sc(T['L'] + 'Qual è il contrario di “a sinistra”?', ['a destra', 'dritto', 'dietro', 'sotto'], 0, 'Sinistra ↔ destra.')
post.tf(T['D'] + 'La risposta comincia con “Certo”.', True, 'Risposta affermativa: “Certo, vai dritto…”.')
post.sc(T['L'] + 'Che cosa significa “gira”?', ['cambia direzione', 'fermati', 'torna indietro', 'corri'], 0, 'Girare = cambiare direzione.')
post.sc(T['A'] + 'Come chiedi la strada per il museo, in forma gentile (Lei)?', ['Scusi, potrebbe dirmi dov’è il museo?', 'Scusa, dov’è museo?', 'Museo dove?', 'Dimmi museo.'], 0, 'Transfer: forma di cortesia.')
done('it-a2-informazioni-strada', pre, post, notes(['Immagine: una piccola mappa di un centro città.', 'Domanda: Come si chiede la strada nella tua lingua?'], STEPS_IT, ['Clip molto breve: ascoltare 2–3 volte, poi il Rollenspiel.', 'Wortschatz Orientierung (destra, sinistra, dritto) vorher kurz wiederholen.'], ['Disegna una mappa e fai un dialogo a coppie.', 'Scrivi tre indicazioni per arrivare da scuola alla stazione.']), 'Livello A2 · Orientarsi')

# ---- weekend
pre = Q(); pre.n = 3
pre.sc(T['P'] + 'Che cosa fai nel fine settimana? Quale lessico serve?', ['Uscire, cenare, fare sport', 'Fare esami', 'Prendere l’aereo di lavoro', 'Pulire la scuola'], 0, 'Lessico del tempo libero.')
pre.mt(T['P'] + 'Collega verbo e significato.', [('frequentare', 'vedere spesso'), ('chiacchierare', 'parlare in modo leggero'), ('divertirsi', 'passare un bel tempo'), ('correre', 'andare di corsa')], 'Verbi del tempo libero.')
post = Q(); post.n = 5
post.mc(T['D'] + 'Che cosa fa nel fine settimana? (più risposte)', ['Esce a cena', 'Chiacchiera con le amiche', 'Beve del buon vino', 'Studia per l’esame', 'Lavora in ufficio'], [0, 1, 2], 'Tre attività sociali.')
post.tf(T['D'] + 'Fa sport sempre, ogni giorno.', False, 'Dice “quando ho tempo”.')
post.sc(T['D'] + 'Quando fa sport?', ['Quando ha tempo', 'Mai', 'Solo d’estate', 'Solo la domenica'], 0, '“Quando ho tempo, faccio anche un po’ di sport.”')
post.gf(T['L'] + 'Completa con le forme del testo.', '[[a]] insieme a cena, [[b]] del buon vino e ci divertiamo.', [['usciamo'], ['beviamo']], 'Presente, prima persona plurale.')
post.sc(T['L'] + 'Con “usciamo” la persona parla di…', ['sé e delle amiche (noi)', 'solo di sé', 'di un’altra persona', 'del passato'], 0, 'Prima persona plurale.')
post.sc(T['L'] + 'Che cosa significa “frequento le amiche”?', ['Vedo spesso le amiche', 'Studio con le amiche', 'Lavoro con le amiche', 'Evito le amiche'], 0, 'Frequentare = vedere regolarmente.')
post.sc(T['A'] + 'Come racconteresti il tuo fine settimana?', ['Il sabato esco con gli amici e la domenica riposo.', 'Il sabato io studia scuola.', 'Fine settimana è bello molto.', 'Io andare cinema sabato.'], 0, 'Esempio di frase corretta per il transfer.')
done('it-a2-weekend-scena-tre', pre, post, notes(['Domanda: Che cosa fai di solito nel fine settimana?'], STEPS_IT, ['Brano molto breve (circa 20 secondi): sfruttarlo per la produzione orale.'], ['Intervista a coppie: “Come trascorri il fine settimana?”', 'Scrivi un breve paragrafo sul tuo weekend ideale.']), 'Livello A2 · Tempo libero')

# ---- hobby
pre = Q(); pre.n = 5
pre.sc(T['P'] + 'Quali hobby conosci in italiano?', ['Sport, teatro, internet', 'Matematica, storia', 'Dottore, avvocato', 'Treno, aereo'], 0, 'Lessico del tempo libero.')
pre.mt(T['P'] + 'Collega attività e spiegazione.', [('il judo', 'arte marziale'), ('il teatro', 'si recita davanti al pubblico'), ('lo sport', 'attività fisica'), ('dedicare', 'usare tempo per qualcosa')], 'Parole per capire le risposte.')
post = Q(); post.n = 7
post.tf(T['D'] + 'Una persona dedica 5 ore a settimana allo sport.', True, 'Dice “5 ore a settimana”.')
post.tf(T['D'] + 'Una persona dedica 2 o 3 ore a internet e televisione.', True, 'Dice “2 o 3 ore”.')
post.mc(T['D'] + 'Quali attività vengono nominate? (più risposte)', ['Judo', 'Teatro', 'Sport', 'Cucina', 'Pittura'], [0, 1, 2], 'Judo, teatro, sport.')
post.mt(T['D'] + 'Attività e vantaggio.', [('il judo', 'aiuta a superare le paure'), ('il teatro', 'fa perdere la paura di mostrarsi'), ('lo sport', 'migliora la forma fisica'), ('computer e televisione', 'dipende dallo scopo')], 'Vantaggi delle attività.')
post.gf(T['L'] + 'Completa con le parole del testo.', '[[a]] judo, uscendo con le [[b]] e [[c]] teatro.', [['facendo'], ['amiche'], ['facendo']], 'Gerundio: facendo, uscendo.')
post.sc(T['L'] + '“Facendo judo” è una forma di…', ['gerundio', 'participio passato', 'imperativo', 'futuro'], 0, 'Gerundio presente.')
post.sc(T['L'] + 'Che cosa significa “dedicare”?', ['Usare tempo per qualcosa', 'Cancellare', 'Comprare', 'Rimandare'], 0, 'Dedicare tempo.')
post.sc(T['A'] + 'Quale hobby ti fa bene, e perché? Quale frase è corretta?', ['Il mio hobby è utile perché mi rilassa.', 'Mio hobby utile perché rilassare.', 'Io hobby rilassa utile.', 'Hobby è utile io.'], 0, 'Esempio di frase argomentata.')
done('it-a2-hobby-interviste', pre, post, notes(['Domanda: Come passi il tuo tempo libero?'], STEPS_IT, ['Il gerundio può essere ripreso dopo con altri esempi.'], ['Intervista di classe: ore a settimana per ogni attività.', 'Scrivi un paragrafo: “Il mio hobby è piacevole e utile perché…”']), 'Livello A2 · Hobby')

# ---- vita in italia
pre = Q(); pre.n = 5
pre.sc(T['P'] + 'Che cosa significa “straniero”?', ['Persona che viene da un altro paese', 'Persona anziana', 'Un tipo di lavoro', 'Un colore'], 0, 'Tema: persone che vivono in Italia.')
pre.mt(T['P'] + 'Collega parola e spiegazione.', [('arrivare', 'giungere in un posto'), ('il lavoro', 'attività per guadagnare'), ('la badante', 'persona che assiste anziani'), ('sporadico', 'ogni tanto')], 'Lessico.')
post = Q(); post.n = 7
post.tf(T['D'] + 'Diamante viene dalla Lituania.', True, 'Dice “vengo da Lituania”.')
post.tf(T['D'] + 'Per Diamante il nome ha un significato diverso nella lingua d’origine.', False, 'Il significato è sempre lo stesso.')
post.sa(T['D'] + 'Quanti anni ha la persona che risponde “Ho … anni”?', ['28', 'ventotto'], '28', 'Risponde “Ho 28 anni”.')
post.sc(T['D'] + 'Quale lavoro ha fatto sempre una delle persone?', ['La badante', 'L’insegnante', 'Il cuoco', 'L’autista'], 0, 'Dice “Ho fatto sempre la badante”.')
post.tf(T['D'] + 'Una persona dice di essere “più casalinga che mai”.', True, 'La frase è nel testo.')
post.gf(T['L'] + 'Completa le frasi del testo.', 'Sono qua [[a]] 2009. [[b]] chiamo Diamante.', [['dal'], ['Mi']], 'Dal + anno per “da quando”; mi chiamo.')
post.sc(T['L'] + 'La domanda “Da quanto tempo sei in Italia?” chiede…', ['la durata', 'il luogo', 'il nome', 'l’età'], 0, 'Durata.')
post.sc(T['L'] + 'Che cosa significa “oss”?', ['operatore socio-sanitario', 'ospedale', 'orario scolastico', 'ottimo studente'], 0, 'Sigla professionale.')
post.sc(T['A'] + 'Come ti presenti? Scegli la frase corretta.', ['Mi chiamo Anna, ho 15 anni e vivo a Monaco.', 'Io chiamare Anna, 15 anni Monaco.', 'Chiamo Anna sono 15.', 'Mi chiamare Anna, ho 15.'], 0, 'Presentazione.')
done('it-a2-vita-italia', pre, post, notes(['Domanda: Che cosa significa trasferirsi in un altro paese?'], STEPS_IT, ['Alcune parti del video sono poco comprensibili: contrassegnate nel trascritto come “Wortlaut unsicher”; evitare domande su quelle parti.'], ['Intervista in classe: Come ti chiami? Da dove vieni? Da quanto tempo abiti qui?']), 'Livello A2 · Presentarsi')

# ---- cinema
pre = Q(); pre.n = 5
pre.sc(T['P'] + 'Quali espressioni si usano per invitare qualcuno?', ['Vieni con noi? / Perché non andiamo…?', 'Quanto costa?', 'Dove abiti?', 'Chi sei?'], 0, 'Funzioni: invitare e rifiutare.')
pre.mt(T['P'] + 'Collega espressione e uso.', [('Pronto?', 'risposta al telefono'), ('Dai!', 'per insistere'), ('Ahia!', 'esclamazione di disappunto'), ('Senti', 'per attirare l’attenzione')], 'Espressioni del parlato.')
post = Q(); post.n = 7
post.mc(T['D'] + 'Chi va al cinema? (più risposte)', ['Giulia', 'Alessia', 'Dino', 'Chiara', 'Marta'], [0, 1, 2, 3], 'Giulia, Alessia, Dino e Chiara.')
post.tf(T['D'] + 'Il film finisce intorno alle 8:15.', True, '“Intorno alle 8:15”.')
post.sa(T['D'] + 'A che ora finisce l’allenamento di Paolo?', ['alle 7:30', '7:30', '19:30', 'alle 19.30', 'sette e mezza', 'alle sette e mezza', '7.30'], 'alle 7:30', 'Dice “io oggi finisco alle 7:30”.')
post.sa(T['D'] + 'A che ora è il prossimo spettacolo che Paolo propone?', ['alle 8:30', '8:30', '20:30', 'alle 20.30', 'otto e mezza', 'alle otto e mezza', '8.30'], 'alle 8:30', 'Propone “il prossimo spettacolo alle 8:30”.')
post.tf(T['D'] + 'Paolo accetta di andare al cinema.', False, 'Dice “un’altra volta”.')
post.tf(T['D'] + 'Il sabato c’è l’allenamento e la domenica la partita.', True, 'Lo dice Paolo.')
post.od(T['D'] + 'Metti le fasi della conversazione nell’ordine giusto.', ['Giulia invita Paolo al cinema', 'Paolo chiede che film è', 'Paolo chiede a che ora comincia', 'Paolo dice che ha l’allenamento', 'Paolo propone un altro spettacolo, poi rifiuta'], 'Ordine della telefonata.')
post.gf(T['L'] + 'Completa con le parole del testo.', 'Perché non andiamo al [[a]] spettacolo [[b]] 8:30?', [['prossimo'], ['alle']], 'Prossimo spettacolo; alle + ora.')
post.sc(T['L'] + 'Come rifiuta Paolo, in modo gentile?', ['Dai, Giulia, un’altra volta.', 'No, mai.', 'Non voglio.', 'Che noia!'], 0, 'Rifiutare con garbo.')
post.sc(T['A'] + 'Come inviti un amico al cinema domani? Scegli la frase migliore.', ['Vieni al cinema con noi domani?', 'Tu cinema domani venire?', 'Cinema, tu, vai?', 'Io invito cinema.'], 0, 'Transfer: invito.')
done('it-a2-tempo-libero-cinema', pre, post, notes(['Domanda: Hai mai rifiutato un invito? Come si fa gentilmente?'], STEPS_IT, ['Il dialogo ha un contenuto ricco: due ascolti, poi Rollenspiel (invito e rifiuto).'], ['Rollenspiel: invita un amico a fare qualcosa, l’altro ha un impegno e propone un’alternativa.']), 'Livello A2 · Invitare e rifiutare')

# ---- tiramisu
pre = Q(); pre.n = 7
pre.sc(T['P'] + 'Quali ingredienti ci vogliono per un tiramisù?', ['Mascarpone, caffè, biscotti, uova, zucchero', 'Pesce e patate', 'Riso e verdure', 'Pane e olive'], 0, 'Ingredienti tipici.')
pre.mt(T['P'] + 'Collega parola e quantità.', [('un chilo', '1 kg'), ('mezzo chilo', '500 g'), ('un litro', '1 l'), ('una scatola', 'confezione di latta o cartone')], 'Quantità e confezioni.')
post = Q(); post.n = 9
post.sa(T['D'] + 'Quanta farina comprano?', ['un chilo', '1 kg', 'un chilo di farina'], 'un chilo', 'Chiedono “un chilo di farina”.')
post.sa(T['D'] + 'Quante mozzarelle comprano? (numero o parola)', ['due', '2'], 'due', 'Chiedono “due mozzarelle”.')
post.sa(T['D'] + 'Quanto olio comprano?', ['mezzo litro', '0,5 l', 'una bottiglia da mezzo litro', 'bottiglia da mezzo litro', 'mezzo litro di olio'], 'mezzo litro', 'Una bottiglia da mezzo litro.')
post.sa(T['D'] + 'Quanto zucchero comprano?', ['un chilo', '1 kg', 'un chilo di zucchero'], 'un chilo', 'Un chilo di zucchero.')
post.sa(T['D'] + 'Quanto resto ricevono?', ['26 euro e 85 centesimi', '26,85', '26,85 euro', '26 euro e 85'], '26 euro e 85 centesimi', 'Pagano con 50 € e ricevono 26,85 €.')
post.tf(T['D'] + 'Comprano anche un pacchetto di caffè.', True, 'Per il tiramisù serve il caffè.')
post.mt(T['D'] + 'Prodotto e quantità.', [('il mascarpone', 'mezzo chilo'), ('le uova', 'sei'), ('il latte', 'un litro'), ('la farina', 'un chilo')], 'Quantità della spesa.')
post.sc(T['D'] + 'Perché scelgono altri biscotti?', ['Sono più spugnosi', 'Costano meno', 'Sono più grandi', 'Sono al cioccolato'], 0, '“Meglio questi, sono più spugnosi.”')
post.gf(T['L'] + 'Completa con le parole del testo.', 'Vorremmo un chilo di [[a]], una [[b]] di pomodori e due [[c]].', [['farina'], ['scatola'], ['mozzarelle']], 'Quantità con “di”.')
post.sc(T['L'] + 'Con “Vorremmo” chi parla?', ['Più persone (noi)', 'Una persona', 'Il commesso', 'Nessuno'], 0, 'Condizionale, prima persona plurale.')
post.mc(T['A'] + 'Quali di questi prodotti compaiono nella spesa? (più risposte)', ['Mascarpone', 'Caffè', 'Uova', 'Pasta', 'Pesce'], [0, 1, 2], 'Ingredienti del tiramisù.')
done('it-a2-cucina-tiramisu', pre, post, notes(['Domanda: Qual è il dolce italiano più famoso?'], STEPS_IT, ['Per i numeri: far scrivere cifre e importi prima di confrontare.', 'Il passaggio “Quante sono?” è segnalato come poco chiaro: non usarlo per domande.'], ['Rollenspiel al negozio: cliente e commesso, lista della spesa per una cena.', 'Scrivi la lista della spesa per una cena in 4.']), 'Livello A2 · Fare la spesa')

# ---- roma
pre = Q(); pre.n = 6
pre.sc(T['P'] + 'Quali monumenti di Roma conosci?', ['Colosseo, Pantheon, Fontana di Trevi', 'Duomo, Rialto, Arena', 'Mole, Superga', 'Vesuvio, Pompei'], 0, 'Monumenti romani.')
pre.mt(T['P'] + 'Collega parola e spiegazione.', [('la scalinata', 'grande scala all’aperto'), ('la cupola', 'tetto rotondo di un edificio'), ('settecentesco', 'del Settecento'), ('restaurato', 'riportato allo stato originale')], 'Lessico.')
post = Q(); post.n = 8
post.mc(T['D'] + 'Che cosa si vede dall’alto della chiesa? (più risposte)', ['Le vie centrali', 'Le fontane di Piazza di Spagna', 'Le cupole', 'Il mare', 'Le montagne'], [0, 1, 2], 'Vie, fontane, cupole, tetti, balconi.')
post.sc(T['D'] + 'Quali stili unisce la Fontana di Trevi?', ['Classicismo e barocco', 'Gotico e moderno', 'Romanico e liberty', 'Barocco e futurismo'], 0, 'Unisce classicismo e barocco.')
post.tf(T['D'] + 'La Fontana di Trevi è stata restaurata di recente.', True, '“È stata recentemente restaurata.”')
post.sa(T['D'] + 'Come viene chiamata Roma nel testo?', ['la città eterna', 'città eterna'], 'la città eterna', '“Città eterna”.')
post.sa(T['D'] + 'Quale piazza celebre viene nominata per ultima?', ['Piazza Navona', 'Navona'], 'Piazza Navona', 'L’ultima tappa.')
post.mt(T['D'] + 'Monumento e descrizione.', [('il Pantheon', 'il più bel resto dell’antichità romana'), ('la Fontana di Trevi', 'simbolo di Roma'), ('Trinità dei Monti', 'chiesa francescana'), ('Piazza Navona', 'una delle piazze più celebri')], 'Descrizioni.')
post.od(T['D'] + 'Ordina le tappe del percorso.', ['La scalinata di Trinità dei Monti', 'La vista dall’alto della chiesa', 'La Fontana di Trevi', 'Il Pantheon', 'Piazza Navona'], 'Ordine nel testo.')
post.gf(T['L'] + 'Completa con le parole del testo.', 'La scalinata ha [[a]] gradini e collega Piazza di [[b]] con la chiesa.', [['135'], ['Spagna']], 'Dati del testo.')
post.sc(T['L'] + 'Che cosa significa “settecentesca”?', ['Del Settecento (1700–1799)', 'Con 700 gradini', 'Molto grande', 'Moderna'], 0, 'Aggettivo dal secolo.')
post.sc(T['A'] + 'Come inviteresti un amico a una passeggiata tra i monumenti?', ['Andiamo a vedere la Fontana di Trevi?', 'Io Trevi andare?', 'Fontana tu vai.', 'Noi fontana.'], 0, 'Transfer.')
done('it-a2-roma-citta', pre, post, notes(['Immagine: la Fontana di Trevi. Chi l’ha già visitata?'], STEPS_IT, ['Il testo è di tipo descrittivo e molto denso: due ascolti, poi la mappa mentale.'], ['Disegna una piantina del percorso e presentala.', 'Prepara una breve visita guidata per un luogo della tua città.']), 'Livello B1 · Descrivere luoghi')

# ---- conoscere italia
pre = Q(); pre.n = 5
pre.sc(T['P'] + 'Quali città italiane conosci all’estero?', ['Roma, Venezia, Milano, Napoli, Firenze', 'Berlino, Parigi', 'Madrid, Lisbona', 'Londra, Dublino'], 0, 'Anticipazione.')
pre.mt(T['P'] + 'Collega regione e città.', [('Umbria', 'Perugia'), ('Toscana', 'Siena'), ('Puglia', 'Alberobello'), ('Campania', 'Napoli')], 'Regioni e città.')
post = Q(); post.n = 7
post.mc(T['D'] + 'Quali città vengono nominate come famose all’estero? (più risposte)', ['Roma', 'Venezia', 'Milano', 'Napoli', 'Firenze', 'Palermo'], [0, 1, 2, 3, 4], 'Le prime cinque nel testo.')
post.tf(T['D'] + 'Una persona dice che anche la zona di Napoli e Pompei sta diventando più nota.', True, '“Sta cominciando a prendere piede anche la zona di Napoli e Pompei.”')
post.sc(T['D'] + 'Che cosa si dice delle spiagge della costiera amalfitana?', ['Hanno i sassi', 'Sono di sabbia bianca', 'Sono sempre vuote', 'Non ci sono'], 0, '“Tutte le spiagge con i sassi.”')
post.sc(T['D'] + 'Quali due luoghi della Puglia vengono nominati?', ['Ostuni e Alberobello', 'Bari e Lecce', 'Matera e Taranto', 'Brindisi e Foggia'], 0, 'Ostuni, Alberobello.')
post.tf(T['D'] + 'Per gli studenti si consigliano anche piccoli centri come Perugia e Urbino.', True, 'La seconda parte dell’intervista.')
post.sc(T['D'] + 'Perché vale la pena andare in Umbria e in Toscana?', ['Si mangia bene, c’è storia e ci sono bei paesaggi', 'Fa sempre caldo', 'Costa pochissimo', 'Ci sono grandi centri commerciali'], 0, 'Cibo, storia, paesaggi.')
post.sa(T['D'] + 'Quale lago viene nominato? (una parola)', ['Trasimeno', 'lago Trasimeno', 'il lago Trasimeno'], 'Trasimeno', '“La zona intorno al Lago Trasimeno”.')
post.gf(T['L'] + 'Completa con le parole del testo.', 'Si va in [[a]], in Toscana, in queste regioni dove si [[b]] bene.', [['Umbria'], ['mangia']], 'Si impersonale.')
post.sc(T['L'] + '“Prendere piede” significa…', ['diventare sempre più diffuso', 'camminare', 'scappare', 'finire'], 0, 'Espressione figurata.')
post.sc(T['A'] + 'Quale città o regione consiglieresti a un amico? Scegli la frase corretta.', ['Consiglio la Toscana perché si mangia bene.', 'Io consiglio Toscana mangia.', 'Toscana perché bene io.', 'Consigliare la Toscana.'], 0, 'Transfer.')
done('it-a2-conoscere-italia', pre, post, notes(['Domanda: Quali luoghi italiani sono famosi nel tuo paese?'], STEPS_IT, ['Il trascritto contiene passaggi poco chiari (“Wortlaut unsicher”): non usare per domande.'], ['Poster: la mia regione italiana preferita.', 'Presenta una città italiana in 5 frasi.']), 'Livello B1 · Città e regioni')

# ---- VOA
q, T = start('x', 'en', 3)
pre = Q(); pre.n = 3
pre.sc(T['P'] + 'What do people usually say when they meet for the first time?', ['Nice to meet you.', 'See you tomorrow.', 'Good night.', 'Thank you very much.'], 0, 'First meeting.')
pre.mt(T['P'] + 'Match expression and use.', [('Nice to meet you', 'first meeting'), ('Welcome', 'greeting at arrival'), ('Let’s try that again', 'repeat something'), ('How do you spell it?', 'ask for letters')], 'Useful phrases.')
post = Q(); post.n = 5
post.tf(T['D'] + 'Pete asks: “Are you Anna?”', True, 'Pete begins the dialogue.')
post.sc(T['D'] + 'How does Anna spell her name?', ['A-N-N-A', 'A-N-A', 'A-N-N-I-E', 'E-N-N-A'], 0, 'She says A-N-N-A.')
post.tf(T['D'] + 'The apartment is on Irving Street.', True, '1400 Irving Street.')
post.sc(T['D'] + 'Who says “Welcome to 1400 Irving Street”?', ['Pete', 'Anna', 'A neighbor', 'A teacher'], 0, 'Pete welcomes Anna.')
post.od(T['D'] + 'Put the dialogue in order.', ['Are you Anna?', 'Yes! Are you Pete?', 'I am Pete. Nice to meet you.', 'Is that A-N-A?', 'No. A-N-N-A.'], 'Order of the lines.')
post.gf(T['L'] + 'Complete the sentences.', 'I’m [[a]]. Nice to [[b]] you.', [['Anna'], ['meet']], 'Introductions.')
post.sc(T['L'] + 'Which phrase can you use to ask someone to repeat?', ['Let’s try that again.', 'Good morning.', 'I like pizza.', 'How old are you?'], 0, 'Said by Anna.')
post.sc(T['A'] + 'How would you introduce yourself?', ['Hi, I’m Max. Nice to meet you.', 'Me Max name.', 'Hello, you Max.', 'Nice meet me.'], 0, 'Transfer.')
done('en-voa-welcome', pre, post, notes(['Question: What do you say when you meet someone for the first time?'], STEPS_EN, ['Very short audio (about 29 seconds): listen several times, then role-play.'], ['Role-play: introduce yourself and spell your name.', 'Write a short dialogue: meeting a new neighbour.']), 'Level A1 · Introductions')

# ---- carbon
pre = Q(); pre.n = 8
pre.sc(T['P'] + 'What do you think a “carbon footprint” is?', ['The amount of greenhouse gases caused by a person or group', 'A footprint made of coal', 'A kind of shoe', 'A type of weather'], 0, 'Prediction from the title.')
pre.mt(T['P'] + 'Match the words and their meanings.', [('emissions', 'gases released into the air'), ('insulated', 'protected against heat loss'), ('sustainable', 'not using up resources'), ('to graze', 'to feed on grass')], 'Key vocabulary.')
post = Q(); post.n = 10
post.tf(T['D'] + 'A carbon footprint only counts what individuals do, not organizations.', False, '“An individual or an organization.”')
post.mc(T['D'] + 'Which actions reduce a carbon footprint, according to the video? (more than one)', ['Taking fewer flights', 'Using less petrol or diesel', 'Using solar or wind power', 'Insulating the home', 'Eating more red meat'], [0, 1, 2, 3], 'Transport, energy, home.')
post.sc(T['D'] + 'Why does red meat increase the carbon footprint?', ['Cows produce methane, and trees are cut down for pastures', 'It is transported by plane', 'It is expensive', 'It needs a lot of plastic'], 0, 'Methane and deforestation.')
post.sa(T['D'] + 'How many tonnes per person per year does the UK produce? (number)', ['5.5', '5,5'], '5.5', 'About 5.5 tonnes.')
post.sc(T['D'] + 'How many tonnes per person per year in the United States?', ['16.1', '7.1', '5.5', '38.6'], 0, '16.1 tonnes.')
post.tf(T['D'] + 'China has more emissions per person than the UK.', True, '7.1 vs 5.5 tonnes.')
post.sc(T['D'] + 'Why is Qatar’s figure so high?', ['It produces a lot of oil and gas with a small population', 'It has many cars', 'It has many farms', 'It has no trees'], 0, '38.6 tonnes per person.')
post.gf(T['L'] + 'Complete with words from the video.', 'Greenhouse gases [[a]] heat inside the atmosphere and [[b]] the planet.', [['trap'], ['overheat', 'overheating']], 'Cause and effect.')
post.sc(T['L'] + 'What is the “direct impact” mentioned?', ['Using energy to travel or power homes', 'Making things we buy', 'Planting trees', 'Recycling plastic'], 0, 'Direct vs indirect.')
post.sc(T['A'] + 'Which change would reduce your own footprint most?', ['Flying less and heating more efficiently', 'Buying more plastic', 'Leaving lights on', 'Using more petrol'], 0, 'Transport and heating matter most.')
done('en-b1-carbon-footprint', pre, post, notes(['Question: What do you already do to protect the environment?'], STEPS_EN, ['Numbers (tonnes per person) are good for a second listening with a table.'], ['Calculate your own footprint with an online calculator and compare.', 'Write a short text: three changes I could make.']), 'Level B1 · Environment')

# ---- Ted
pre = Q(); pre.n = 10
pre.sc(T['P'] + 'What is a polyglot?', ['A person who speaks many languages', 'A kind of dictionary', 'A language teacher', 'A translator app'], 0, 'Core vocabulary.')
pre.mt(T['P'] + 'Match the words and their meanings.', [('fluency', 'speaking easily and correctly'), ('flashcard', 'a card for memorising words'), ('feedback', 'comments about your performance'), ('ingenious', 'very clever')], 'Key vocabulary from the talk.')
post = Q(); post.n = 12
post.sa(T['D'] + 'How often does she start a new language? (every … years)', ['two', 'every two years', '2'], 'two', '“Every two years.”')
post.tf(T['D'] + 'Benny starts speaking to native speakers from day one.', True, 'He doesn’t mind making 200 mistakes a day.')
post.sa(T['D'] + 'How many Russian speakers did Lucas add on Skype? (number)', ['100', 'a hundred', 'hundred', 'one hundred'], '100', 'A hundred random speakers.')
post.mt(T['D'] + 'Match the person and the method.', [('Benny', 'speaking from day one'), ('Lucas', 'Skype chats with strangers'), ('The speaker learning Spanish', 'reading Harry Potter'), ('The speaker learning German', 'watching Friends')], 'Methods in the talk.')
post.tf(T['D'] + 'She learned German by watching Friends.', True, 'The sitcom is Friends.')
post.mc(T['D'] + 'Which principles does she name? (more than one)', ['Enjoying the process', 'Effective methods', 'A system', 'Patience', 'Natural talent'], [0, 1, 2, 3], 'Enjoyment, methods, system, patience.')
post.sc(T['D'] + 'Which app based on spaced repetition does she mention?', ['Anki', 'Duolingo', 'Netflix', 'Skype'], 0, 'Anki (and Memrise).')
post.sa(T['D'] + 'How many minutes earlier could you wake up? (number)', ['15', 'fifteen'], '15', '“Wake up 15 minutes earlier.”')
post.tf(T['D'] + 'She says it is possible to learn a language in two months.', False, 'A visible improvement is possible, not full fluency.')
post.sa(T['D'] + 'How many languages can Lucas speak fluently? (number)', ['11', 'eleven'], '11', 'After 10 years: 11 languages.')
post.sc(T['L'] + '“Take learning into your own hands” means…', ['take control of your own learning', 'write by hand', 'use a pen', 'give up'], 0, 'Idiom.')
post.sc(T['A'] + 'Which advice would you try first?', ['Pick a method I enjoy and plan a small daily routine', 'Wait for talent', 'Memorise a list the night before the test', 'Avoid speaking'], 0, 'Applies the talk’s principles.')
done('en-b2-secrets-learning-language', pre, post, notes(['Question: What is the best way to learn a language?'], STEPS_EN, ['Long talk (about 10 minutes): split into 3–4 segments.', 'Use the discussion after listening.'], ['Make a weekly learning plan with three methods you enjoy.', 'Interview a classmate about how they learn languages.']), 'Level B2 · Language learning')

# Meinungs-/Selbstauskunftsfragen mit einer „richtigen“ Antwort entfernen (Review 25.10.2026)
DROPX = {'it-a2-ordine-al-bar': [], 'it-a2-weekend-scena-tre': ['q4', 'q12'], 'it-a2-hobby-interviste': ['q6', 'q15'],
         'it-a2-roma-citta': ['q7', 'q18', 'q16'], 'it-a2-conoscere-italia': ['q6', 'q17'], 'en-voa-welcome': ['q13', 'q7'],
         'en-b1-carbon-footprint': ['q20', 'q13'], 'en-b2-secrets-learning-language': ['q24', 'q14'],
         # Doppelungen (26.10.2026): fragen dasselbe wie eine Kernaufgabe oder verraten deren Lösung
         'it-a2-cucina-tiramisu': ['q16']}
for k, ids in DROPX.items():
    for part in ('pre', 'post'):
        EX[k][part] = [q for q in EX[k][part] if q['id'] not in ids]
for e in EX.values():
    for q in e['pre'] + e['post']:
        if q['type'] == 'matching': q.setdefault('distractors', [])
import notizen
ROWS = notizen.anwenden(EX)
out = ('// Erweiterte Aufgaben für bestehende Hörverstehens-Pakete (aus werkzeuge/hoeren/alt.py).\nconst LISTENING_EXTRA = ' + json.dumps(EX, ensure_ascii=False) + ';\n'
       '// Unterrichtsplan und Beschreibungen in der Oberflächensprache (aus werkzeuge/hoeren/notizen.py).\nconst UI_ROWS_CONTENT = ' + json.dumps(ROWS, ensure_ascii=False) + ';\n')
(ROOT / 'portal' / 'dist' / 'listening-extra.js').write_text(out, encoding='utf-8')
print({k: len(v['pre']) + len(v['post']) for k, v in EX.items()})
