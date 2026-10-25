from lib import *

# ---------------- LA VITA È BELLA ----------------
S, ST = 'la-vita-e-bella', 'La vita è bella · Roberto Benigni'
M = film('La vita è bella', 1997, 'Scena a scelta dell’insegnante: l’arrivo in città, il “gioco” nel campo o il finale.')
q = Q()
q.tf('Prima del film: “La vita è bella” è un film italiano del 1997.', True, 'Diretto e interpretato da Roberto Benigni.')
q.sc('Chi è il protagonista Guido?', ['Un giovane ebreo che arriva ad Arezzo', 'Un soldato tedesco', 'Un medico', 'Un professore di storia'], 0, 'Guido Orefice, durante il fascismo.')
q.sc('Come fa Guido a incontrare Dora la prima volta?', ['Per caso, durante il viaggio', 'In chiesa', 'In ospedale', 'In una libreria'], 0, 'Un incontro per caso lo fa innamorare.')
q.od('Metti in ordine la prima parte del film.', ['Guido incontra Dora e si innamora', 'Guido lavora come cameriere al Grand Hotel', 'Guido finge di essere un ispettore e rivede Dora', 'Dora scappa con Guido su un cavallo', 'Nasce Giosuè'], 'Ordine cronologico della prima parte.')
q.od('Metti in ordine la seconda parte del film.', ['La famiglia viene deportata nel campo', 'Guido racconta che è un gioco a premi', 'Guido nasconde Giosuè nella cabina', 'Il campo viene liberato', 'Giosuè ritrova la madre'], 'La seconda parte racconta il campo.')
q.gf('Completa il riassunto (campo, gioco, premio, carro armato).', 'Nel [[a]] Guido dice al figlio che tutto è un [[b]]. Il vincitore riceve un [[c]]: un vero [[d]].', [['campo'], ['gioco'], ['premio'], ['carro armato']], 'Il gioco protegge Giosuè.')
q.sc('Perché Guido inventa il gioco?', ['Per proteggere suo figlio dalla realtà', 'Per divertirsi', 'Per fuggire', 'Per ingannare i nazisti'], 0, 'È un atto d’amore.')
q.tf('Dora sale volontariamente sul treno per stare con la famiglia.', True, 'Chiede di salire anche lei.')
q.sc('Quale premio vince alla fine Giosuè (secondo lui)?', ['Un carro armato', 'Una bicicletta', 'Un cane', 'Una casa'], 0, 'L’arrivo del carro armato americano.')
q.mt('Lessico del film: abbina.', [('il campo di concentramento', 'luogo di prigionia nazista'), ('deportare', 'portare via con la forza'), ('l’inganno', 'la finzione'), ('il sacrificio', 'rinuncia per aiutare gli altri')], 'Parole chiave.')
q.sc('Scegli la preposizione: “Guido riesce … nascondere Giosuè.”', ['a', 'di', 'per', 'da'], 0, 'riuscire a + infinito.')
q.sc('Scegli la preposizione: “Giosuè esce … cabina.”', ['dalla', 'della', 'per la', 'nella'], 0, 'uscire da + la = dalla.')
q.sc('Quanti Oscar ha vinto il film?', ['Tre', 'Uno', 'Cinque', 'Nessuno'], 0, 'Miglior film straniero, miglior attore, miglior colonna sonora.')
q.tf('Dopo il film: La fantasia può essere una forma di resistenza.', True, 'È il messaggio centrale.')
q.sc('Chi racconta la storia?', ['Giosuè da adulto', 'Guido', 'Dora', 'Un soldato'], 0, 'La voce narrante è Giosuè.')
notes = {'warmup': ['Immagine: una locandina del film o un cavallo bianco. Che cosa notate?', 'Domanda: si può scherzare sulla guerra? Quando è giusto?'],
         'steps': ['1. Preparazione al lessico.', '2. Visione in due parti.', '3. Esercizi di ordine e riassunto.', '4. Discussione finale.'],
         'tips': ['Tema delicato (Shoah): preparare gli alunni e lasciare spazio per le emozioni.'],
         'followUp': ['Scrivi una recensione del film (80–100 parole).', 'Quale scena ti ha colpito di più e perché?']}
pkg('lavitaebella-base', 'La vita è bella · Base', 'it', 'B1', 'Trama, lessico e struttura del film di Benigni: ordine degli eventi, riassunto, preposizioni.', ['Film', 'Storia', 'Famiglia'], M, q, S, ST, 'Base', notes)

q = Q()
q.sc('Quale genere mescola il film?', ['Commedia e tragedia', 'Horror', 'Documentario', 'Fantascienza'], 0, 'Il contrasto è centrale.')
q.mc('Quali temi emergono? (più risposte)', ['Amore paterno', 'Fantasia come protezione', 'Resistenza', 'Sport', 'Politica locale'], [0, 1, 2], 'I tre temi chiave.')
q.sc('Che funzione ha la narrazione di Giosuè adulto?', ['Dà una cornice memoriale', 'Annuncia la fine', 'Serve a spiegare la storia', 'Aggiunge comicità'], 0, 'Racconto di ricordi.')
q.mt('Collega termini analitici e spiegazioni.', [('ironia', 'dire il contrario di ciò che si pensa'), ('grottesco', 'comico e tragico insieme'), ('simbolo', 'elemento che rappresenta un’idea'), ('narratore', 'chi racconta')], 'Lessico analitico.')
q.sc('Che cosa simboleggia il carro armato?', ['La speranza e la liberazione', 'La guerra', 'Il denaro', 'La scuola'], 0, 'Per Giosuè è il premio, per noi la fine del lager.')
q.sc('Perché la prima parte è importante?', ['Mostra la personalità di Guido e il suo modo di vivere', 'Racconta la guerra', 'Spiega la storia', 'È inutile'], 0, 'Costruisce il personaggio.')
q.tf('Il film è stato criticato da alcuni per aver trattato la Shoah con humor.', True, 'Il dibattito è reale.')
q.sc('Che effetto ha il finale?', ['Emozione e commozione', 'Noia', 'Rabbia', 'Indifferenza'], 0, 'Finale commovente.')
q.gf('Congiuntivo: completa.', 'Penso che Guido [[a]] molto coraggioso e che il gioco [[b]] un atto d’amore. Credo che Dora [[c]] la scelta giusta e che Giosuè non [[d]] la verità.', [['sia'], ['sia'], ['faccia'], ['sappia']], 'Congiuntivo presente.')
q.sc('Quale espressione descrive Guido?', ['Ottimista e creativo', 'Cupo e rigido', 'Indifferente', 'Arrabbiato'], 0, 'Un personaggio che usa l’umorismo.')
q.sa('Scrivi un aggettivo per descrivere l’atmosfera del film.', ['commovente', 'drammatico', 'tragicomico', 'toccante'], 'commovente', 'Altre risposte possibili.')
q.sc('Quale musica accompagna il film?', ['Colonna sonora premiata con l’Oscar', 'Rock', 'Jazz', 'Nessuna'], 0, 'Musica di Nicola Piovani.')
notes = {'warmup': ['Domanda: come si racconta una tragedia ai bambini?', 'Immagine: un gioco e un campo: che contrasto notate?'],
         'steps': ['1. Analisi dei temi.', '2. Visione con compiti.', '3. Discussione.', '4. Recensione.'],
         'tips': ['Possibile collegamento con la Giornata della Memoria.'],
         'followUp': ['Scrivi una recensione e valuta il film con 5 stelle.', 'Discuti: È giusto usare la comicità per temi seri?']}
pkg('lavitaebella-avanzata', 'La vita è bella · Avanzata', 'it', 'B2', 'Analisi di temi, ironia e simboli; congiuntivo e lessico analitico.', ['Film', 'Analisi', 'Storia'], M, q, S, ST, 'Avanzata', notes)

# ---------------- C'È ANCORA DOMANI ----------------
S, ST = 'ce-ancora-domani', 'C’è ancora domani · Paola Cortellesi'
M = film('C’è ancora domani', 2023, 'Film in bianco e nero ambientato a Roma, quartiere Testaccio, nel 1946.')
q = Q()
q.tf('Prima del film: Il film è ambientato nel secondo dopoguerra.', True, 'Siamo a Roma, nel 1946.')
q.sc('Chi è Delia?', ['Una casalinga romana con tre figli', 'Una maestra', 'Una dottoressa', 'Una cantante'], 0, 'Delia vive a Testaccio.')
q.sc('Come si chiama il marito?', ['Ivano', 'Nino', 'Franco', 'Marco'], 0, 'Ivano, interpretato da Valerio Mastandrea.')
q.tf('Delia ha un rapporto sereno con il marito.', False, 'Il marito è dispotico e violento.')
q.sc('Come si chiama la figlia grande?', ['Marcella', 'Lucia', 'Franca', 'Giulia'], 0, 'Marcella sogna una vita diversa.')
q.sc('Perché il film è in bianco e nero?', ['Per evocare il passato e un effetto da fiaba/ricordo', 'Per risparmiare', 'Perché è vecchio', 'Per caso'], 0, 'Scelta stilistica.')
q.gf('Completa (voto, donne, lettera, 1946).', 'Nel [[a]] le [[b]] votano per la prima volta. Delia riceve una [[c]] misteriosa: è importante per il suo [[d]].', [['1946'], ['donne'], ['lettera'], ['voto']], 'Collegamento tra storia e Storia.')
q.mt('Abbina personaggio e ruolo.', [('Delia', 'madre e protagonista'), ('Ivano', 'marito violento'), ('Marcella', 'figlia che vuole sposarsi'), ('Marisa', 'amica di Delia')], 'I personaggi principali.')
q.sc('Quale tema è centrale?', ['La condizione femminile nel dopoguerra', 'Il calcio', 'La moda', 'La scuola'], 0, 'Tema principale.')
q.tf('Il film ha vinto più premi (David di Donatello, Nastro d’Argento).', True, 'Ha ricevuto molti riconoscimenti.')
q.sc('Quale dialetto parlano molti personaggi?', ['Romanesco', 'Napoletano', 'Veneto', 'Siciliano'], 0, 'Roma, quartiere Testaccio.')
q.mt('Lessico: abbina.', [('il dopoguerra', 'periodo dopo una guerra'), ('il diritto di voto', 'diritto di partecipare alle elezioni'), ('la violenza domestica', 'violenza in famiglia'), ('l’emancipazione', 'conquista di libertà')], 'Parole chiave dell’esercizio lessicale.')
q.sc('Che cosa significa il titolo?', ['Speranza nel futuro', 'La fine di tutto', 'Una promessa mantenuta', 'Una minaccia'], 0, 'Il domani è ancora possibile.')
q.tf('Dopo il film: Il film collega passato e presente.', True, 'La violenza e l’uguaglianza sono temi attuali.')
notes = {'warmup': ['Immagine: una scheda elettorale del 1946. Che cosa vi dice?', 'Domanda: da quando votano le donne nel vostro paese?'],
         'steps': ['1. Contesto storico (1946).', '2. Visione.', '3. Compiti di comprensione.', '4. Discussione sulla condizione femminile.'],
         'tips': ['Il film mostra violenza domestica: informare la classe prima.', 'Collegamento con educazione civica.'],
         'followUp': ['Descrivi Delia in 5 frasi.', 'Che cosa significa “C’è ancora domani” per te?']}
pkg('ceancoradomani-base', 'C’è ancora domani · Base', 'it', 'B1', 'Contesto storico, personaggi e temi del film di Cortellesi; lessico del dopoguerra.', ['Film', 'Storia', 'Donne'], M, q, S, ST, 'Base', notes)

q = Q()
q.sc('Quale funzione ha il bianco e nero?', ['Creare distanza e valore simbolico', 'Ridurre i costi', 'Imitare la TV', 'Nessuna'], 0, 'Estetica che richiama la memoria.')
q.sc('Come è rappresentata la violenza?', ['Con coreografie quasi danzate', 'In modo molto realistico', 'Mai mostrata', 'Con commenti'], 0, 'Scelta stilistica che ha fatto discutere.')
q.sc('Perché la storia di Delia è rappresentativa?', ['Racconta l’esperienza di molte donne dell’epoca', 'È una storia vera di una persona', 'È una fiaba', 'È un caso unico'], 0, 'Come nelle storie di nonne e bisnonne.')
q.mc('Quali temi emergono? (più risposte)', ['Patriarcato', 'Povertà', 'Solidarietà tra donne', 'Sport', 'Turismo'], [0, 1, 2], 'Temi centrali.')
q.mt('Collega concetti e definizioni.', [('il patriarcato', 'sistema in cui gli uomini hanno più potere'), ('la dignità', 'rispetto di sé'), ('il sacrificio', 'rinuncia per aiutare gli altri'), ('l’uguaglianza', 'stessi diritti per tutte le persone'), ('l’indipendenza economica', 'possibilità di mantenersi da sola')], 'Lessico per l’analisi.')
q.sc('Che ruolo ha la musica moderna nel film?', ['Crea un effetto di attualità e contrasto', 'Serve a riempire', 'È casuale', 'Non c’è'], 0, 'Contrasto tra epoca e musica.')
q.tf('Il finale dà una conclusione positiva e simbolica.', True, 'Il voto diventa atto di libertà.')
q.sc('Perché il diritto di voto è importante?', ['Rappresenta l’emancipazione e la dignità', 'Serve solo alle elezioni', 'È decorativo', 'È vietato'], 0, 'È un passo storico.')
q.sc('Che effetto ha il dialetto?', ['Rende i personaggi autentici e popolari', 'Confonde', 'È decorativo', 'È un errore'], 0, 'Autenticità.')
q.gf('Passato prossimo e imperfetto: completa.', 'Delia [[a]] (essere) una donna forte. Ogni giorno [[b]] (lavorare) molto e [[c]] (sperare) in un futuro migliore. Alla fine [[d]] (decidere) di votare.', [['era'], ['lavorava'], ['sperava'], ['ha deciso']], 'Uso dei tempi del passato.')
q.sc('Tipologia testuale: l’articolo sul film è…', ['Una recensione informativa', 'Un dialogo', 'Una poesia', 'Una ricetta'], 0, 'Testo informativo con elementi di commento.')
q.sa('Scrivi un aggettivo che descrive Delia.', ['coraggiosa', 'forte', 'paziente', 'determinata', 'sensibile'], 'coraggiosa', 'Varie risposte possibili.')
notes = {'warmup': ['Domanda: quali film conoscete sul ruolo delle donne nella storia?', 'Impulso: ascoltate la prima canzone e discutete l’effetto.'],
         'steps': ['1. Lettura dell’articolo.', '2. Visione e analisi.', '3. Lessico.', '4. Discussione: la lotta per l’uguaglianza è finita?'],
         'tips': ['Preparare gli alunni al tema.'],
         'followUp': ['Riassumi l’articolo in 80–100 parole.', 'Commento personale: La lotta per l’uguaglianza non è finita.']}
pkg('ceancoradomani-avanzata', 'C’è ancora domani · Avanzata', 'it', 'B2', 'Analisi di stile, temi e lessico astratto; tempi del passato e commento.', ['Film', 'Analisi', 'Società'], M, q, S, ST, 'Avanzata', notes)

# ---------------- PERFETTI SCONOSCIUTI ----------------
S, ST = 'perfetti-sconosciuti', 'Perfetti sconosciuti · Paolo Genovese'
M = film('Perfetti sconosciuti', 2016, 'Cena tra amici con un gioco sui cellulari.')
q = Q()
q.tf('Prima del film: Il film è una commedia italiana del 2016.', True, 'Regia di Paolo Genovese.')
q.sc('Che cosa succede durante la cena?', ['Gli amici condividono i messaggi dei cellulari', 'Un incendio', 'Una gara', 'Una lezione'], 0, 'Il gioco mette alla prova la fiducia.')
q.sc('Quanti amici partecipano alla cena?', ['Sette', 'Due', 'Quattro', 'Dieci'], 0, 'Sette amici.')
q.sc('Quale evento naturale accompagna la serata?', ['Un’eclissi di luna', 'Un temporale', 'Un terremoto', 'Una nevicata'], 0, 'Eclissi lunare.')
q.tf('Tutti gli amici hanno la coscienza pulita.', False, 'Il gioco rivela segreti.')
q.mt('Abbina professione e personaggio.', [('Rocco', 'chirurgo plastico'), ('Eva', 'psicoterapeuta'), ('Peppe', 'amico single'), ('Carlotta', 'moglie di Lele')], 'Alcune figure del film.')
q.sc('Che cosa significa “perfetti sconosciuti”?', ['Persone che si conoscono bene ma hanno segreti', 'Estranei', 'Colleghi', 'Parenti'], 0, 'Si crede di conoscere gli altri.')
q.gf('Completa (segreti, cellulare, cena, amici).', 'Durante la [[a]] gli [[b]] mettono il [[c]] sul tavolo e scoprono dei [[d]].', [['cena'], ['amici'], ['cellulare'], ['segreti']], 'Riassunto base.')
q.sc('Quale tema è centrale?', ['Fiducia e segreti', 'Sport', 'Moda', 'Viaggi'], 0, 'Tema centrale.')
q.tf('Il cellulare è descritto come “scatola nera” della vita.', True, 'Metafora del film.')
q.sc('Quale effetto ha l’eclissi?', ['Simbolo del lato nascosto', 'Rende più romantico', 'Nessuno', 'Spaventa'], 0, 'Lato nascosto che emerge.')
q.sc('Che genere è?', ['Commedia con toni drammatici', 'Horror', 'Western', 'Documentario'], 0, 'Commedia amara.')
q.sc('Chi ha scritto e diretto il film?', ['Paolo Genovese', 'Paola Cortellesi', 'Roberto Benigni', 'Nanni Moretti'], 0, 'Regia di Genovese.')
q.tf('Dopo il film: Il film è stato rifatto in molti paesi.', True, 'È uno dei film più rifatti.')
notes = {'warmup': ['Domanda: mettereste il vostro telefono al centro del tavolo? Perché?', 'Impulso: tre vite — pubblica, privata, segreta. Che cosa ne pensate?'],
         'steps': ['1. Discussione.', '2. Visione.', '3. Compiti 1–5 del foglio.', '4. Riflessione sulla privacy.'],
         'tips': ['Alcune scene hanno contenuto adulto: controllare la classe.', 'Collegamento con tema social e privacy.'],
         'followUp': ['Scrivi 5 frasi: Che cosa cambia se tutti vedono il tuo telefono?', 'Discuti: Fiducia o controllo?']}
pkg('perfetti-base', 'Perfetti sconosciuti · Base', 'it', 'B1', 'Personaggi, trama e tema del film: fiducia, segreti e smartphone.', ['Film', 'Amicizia', 'Tecnologia'], M, q, S, ST, 'Base', notes)

q = Q()
q.sc('Quale metafora usa il film per il cellulare?', ['Scatola nera', 'Specchio', 'Porta', 'Finestra'], 0, 'La scatola nera registra ciò che è nascosto.')
q.mc('Quali temi emergono? (più risposte)', ['Fiducia', 'Privacy', 'Menzogna', 'Sport', 'Natura'], [0, 1, 2], 'Temi centrali.')
q.sc('Perché l’ambiente chiuso (una sola stanza) è efficace?', ['Aumenta la tensione e la concentrazione', 'È economico', 'È caso', 'Evita musica'], 0, 'Unità di luogo.')
q.mt('Collega concetti e definizioni.', [('il segreto', 'ciò che si nasconde agli altri'), ('la fiducia', 'sicurezza nell’altro'), ('la bugia', 'affermazione falsa'), ('la privacy', 'sfera personale protetta')], 'Lessico.')
q.sc('Quale ruolo ha il finale?', ['Mette in dubbio ciò che abbiamo visto', 'Conferma tutto', 'Spiega tutto', 'Non c’è'], 0, 'Finale ambivalente.')
q.gf('Periodo ipotetico: completa.', 'Se il gioco [[a]] (non esistere), le coppie [[b]] (restare) tranquille. Se tutti [[c]] (dire) la verità, forse [[d]] (litigare) meno.', [['non esistesse'], ['resterebbero'], ['dicessero'], ['litigherebbero']], 'Periodo ipotetico del secondo tipo.')
q.sc('Quale critica sociale emerge?', ['Dipendenza dalla tecnologia e dalle apparenze', 'La povertà', 'La scuola', 'Il traffico'], 0, 'Apparenza vs. realtà.')
q.tf('Il film mette in luce le differenze tra vita pubblica, privata e segreta.', True, 'Idea di base.')
q.sc('Quale effetto ha il montaggio dei messaggi?', ['Crea suspense', 'Rende comico', 'Rallenta', 'Non ha effetto'], 0, 'Suspense.')
q.sa('Scrivi un sinonimo di “segreto” (una parola).', ['mistero', 'riservato', 'nascosto'], 'mistero', 'Più risposte possibili.')
q.tf('Il film suggerisce che conosciamo davvero chi ci sta accanto.', False, 'Il titolo ironizza.')
q.sc('Perché è un film “universale”?', ['I temi valgono per molte culture', 'Perché è breve', 'Perché è muto', 'Perché ha molti effetti'], 0, 'Tema universale: tanti remake.')
notes = {'warmup': ['Domanda: i cellulari ci avvicinano o ci allontanano?', 'Impulso: osservate un’immagine di una cena con telefoni sul tavolo.'],
         'steps': ['1. Dibattito iniziale.', '2. Visione e note.', '3. Analisi del finale.', '4. Discussione.'],
         'tips': ['Nel finale lasciare spazio alle interpretazioni.'],
         'followUp': ['Scrivi un breve saggio: Privacy e fiducia nell’era dei social.', 'Che cosa cambieresti nel finale?']}
pkg('perfetti-avanzata', 'Perfetti sconosciuti · Avanzata', 'it', 'B2', 'Analisi di metafore, finale e temi; periodo ipotetico e lessico astratto.', ['Film', 'Analisi', 'Società'], M, q, S, ST, 'Avanzata', notes)

# ---------------- DON'T LOOK UP ----------------
S, ST = 'dont-look-up', 'Don’t Look Up · Adam McKay'
M = film('Don’t Look Up', 2021, 'Scientists try to warn the world about a comet.')
q = Q()
q.sc('Before watching: What does “to deny” mean?', ['to refuse to believe something', 'to wait', 'to build', 'to repair'], 0, 'to deny = leugnen.')
q.mt('Vocabulary: match.', [('comet', 'object from space made of ice and dust'), ('scientist', 'person who studies the natural world'), ('to warn', 'to tell someone about a danger'), ('panic', 'sudden fear'), ('to ignore', 'not to pay attention')], 'Key words from the worksheet.')
q.sc('What do the scientists discover?', ['A comet heading for Earth', 'A new planet', 'Aliens', 'A new star'], 0, 'The comet will hit Earth.')
q.sc('How does the president react at first?', ['She delays action', 'She believes them immediately', 'She fires everyone', 'She calls the army'], 0, 'She is more interested in politics.')
q.sc('What happens when they appear on TV?', ['People joke about it', 'People panic', 'They are arrested', 'Nothing'], 0, 'The media does not take it seriously.')
q.sc('Why is the campaign called “Don’t Look Up”?', ['To make people ignore the danger', 'To protect them', 'To hide stars', 'To sell telescopes'], 0, 'It tells people not to look at the sky.')
q.gf('Complete the sentences (ignore, panic, scientist, president).', 'The [[a]] checks the data. The [[b]] does not want to act. People [[c]] when they hear the news, but many still [[d]] the warning.', [['scientist'], ['president'], ['panic'], ['ignore']], 'Vocabulary in context.')
q.tf('The film is a serious documentary.', False, 'It is a satirical comedy.')
q.gf('Reported speech: complete.', 'Kate said that a comet [[a]] coming to destroy Earth. Dr Mindy said that they [[b]] act now.', [['was'], ['had to', 'must', 'needed to']], 'Backshift.')
q.sc('Who is the tech billionaire?', ['Peter Isherwell', 'Randall Mindy', 'Kate Dibiasky', 'Jason Orlean'], 0, 'Peter Isherwell.')
q.tf('After watching: The film criticises politicians, media and society.', True, 'Satire of several groups.')
q.sa('Name one emotion you feel after the film (English).', ['anger', 'sadness', 'fear', 'hope', 'laughter', 'worry'], 'anger / sadness', 'Many answers possible.')
notes = {'warmup': ['Discuss in pairs: How do people today get most of their news — from experts, social media, or friends?', 'What do you think the title “Don’t Look Up” could mean?'],
         'steps': ['1. Pre-watching vocabulary.', '2. Watch in two parts.', '3. Global comprehension, then detail.', '4. Language focus.'],
         'tips': ['The film is satirical; discuss real-world parallels (climate, pandemic).'],
         'followUp': ['Write a short opinion paragraph (120–150 words): Is the film a comedy or a warning?', 'Which character do you identify with, and why?']}
pkg('dlu-basis', 'Don’t Look Up · Basis', 'en', 'B1', 'Vocabulary, global comprehension and reported speech for a satirical film.', ['Film', 'Media', 'Climate'], M, q, S, ST, 'Basis', notes)

q = Q()
q.sc('What is ironic about the campaign?', ['It encourages people to deny what is obvious', 'It saves lives', 'It is expensive', 'It is funny'], 0, 'The slogan ignores the threat.')
q.mc('Which targets does the satire have? (several)', ['Politicians', 'Media', 'Tech billionaires', 'Teachers', 'Farmers'], [0, 1, 2], 'Politicians, media and tech.')
q.sc('Why does Kate become angry during the talk show?', ['The hosts do not take the threat seriously', 'She is hungry', 'She is late', 'She forgot something'], 0, 'The media trivialises the news.')
q.sc('What is one of Dr Mindy’s weaknesses?', ['He is influenced by fame and attention', 'He is lazy', 'He is evil', 'He is rich'], 0, 'He enjoys media attention.')
q.sc('What role does Peter Isherwell play?', ['He wants to profit from the comet', 'He destroys it', 'He is a journalist', 'He is a teacher'], 0, 'He sees the comet as a business opportunity.')
q.sc('How do ordinary people react when they finally see the comet?', ['Some are shocked, others still deny it', 'All help', 'All run away', 'All celebrate'], 0, 'Divided reactions.')
q.sc('What message is hidden in the final dinner scene?', ['Togetherness at the end', 'Wealth', 'Technology', 'Revenge'], 0, 'People share a last meal.')
q.gf('Vocabulary in context: complete with deny, warning, campaign, meltdown, data.', 'The scientists collected a lot of [[a]] but the government did not take the [[b]] seriously. The president started a [[c]] and Kate had an emotional [[d]].', [['data'], ['warning'], ['campaign'], ['meltdown']], 'Vocabulary from the worksheet.')
q.sc('Reported speech: “Everything is under control.” →', ['She said that everything was under control.', 'She said that everything is under control.', 'She says that everything had been under control.', 'She said everything will be under control.'], 0, 'Backshift is → was.')
q.tf('The film uses humour to strengthen its message.', True, 'Satire.')
q.sc('Would you call it a comedy or a warning? Choose the best summary.', ['A comedy that works as a warning', 'Only a comedy', 'Only a documentary', 'A romance'], 0, 'Dark satire.')
q.sa('Which character do you identify with? Write the name.', ['Kate', 'Mindy', 'Randall', 'Kate Dibiasky'], 'Kate', 'Open question.')
notes = {'warmup': ['Where do you get your news? Make a quick class poll.', 'Look at the poster: what mood does it create?'],
         'steps': ['1. Poll and prediction.', '2. Watching with comprehension tasks.', '3. Detail questions.', '4. Writing task.'],
         'tips': ['Connect to media literacy and climate communication.'],
         'followUp': ['Write a short opinion paragraph (120–150 words).', 'Debate: Who is most responsible — politicians, media or society?']}
pkg('dlu-vertiefung', 'Don’t Look Up · Vertiefung', 'en', 'B2', 'Satire, detail questions and language focus: vocabulary in context and reported speech.', ['Film', 'Satire', 'Media'], M, q, S, ST, 'Vertiefung', notes)

if __name__ == '__main__':
    write()
