from lib import *
V = 'https://www.youtube.com/watch?v='
NOTE = 'Video ufficiale presso il fornitore; verificare incorporabilità e diritti prima dell’uso.'

# ---------------- 50 SPECIAL ----------------
# Nur das Lied (kein Interview). Kein Liedtext; Lückentext nur über privaten Import.
S, ST, VID = '50-special', '50 Special · Lunapop', 'NF9n5M5qhyU'
q = Q()
q.sc('Prima dell’ascolto: Che cos’è una Vespa?', ['Un tipo di scooter italiano', 'Un frutto', 'Un tipo di pasta', 'Un fiume'], 0, 'La Vespa è uno scooter italiano famoso nel mondo.')
q.sc('Prima dell’ascolto: Che cosa fai di solito in estate? Quale immagine associ alla parola “estate”?', ['Mare, amici e libertà', 'Compiti e verifiche', 'Neve e freddo', 'Lavoro in ufficio'], 0, 'Risposta soggettiva: serve per attivare il vocabolario dell’estate.')
q.sc('Primo ascolto: Quale atmosfera ha la canzone?', ['Allegra e spensierata', 'Triste e lenta', 'Spaventosa', 'Solenne'], 0, 'Un brano leggero e solare.')
q.sc('Primo ascolto: Che tipo di musica senti?', ['Pop-rock italiano con ritmo veloce', 'Musica classica', 'Jazz lento', 'Musica elettronica da discoteca'], 0, 'Chitarre, ritmo e voce giovane: pop-rock.')
q.tf('Primo ascolto: La voce che canta è quella di un uomo.', True, 'Il cantante dei Lunapop è Cesare Cremonini.')
q.sc('Di che cosa parla la canzone, in generale?', ['Di un ragazzo, della sua Vespa e dell’estate', 'Di una gara di nuoto', 'Di una cena di Natale', 'Di una lezione di storia'], 0, 'Tema: libertà, estate, scooter.')
q.tf('Secondo ascolto: Nella canzone si parla di una Vespa.', True, 'Il titolo stesso è un modello di Vespa: la 50 Special.')
q.tf('Secondo ascolto: Il protagonista è molto anziano.', False, 'Il protagonista è un ragazzo giovane.')
q.sc('Quale parola descrive meglio il sentimento della canzone?', ['La voglia di libertà', 'La paura', 'La noia', 'La rabbia'], 0, 'Libertà e spensieratezza.')
q.gf('Completa le frasi con le parole giuste (estate, Vespa, festa, vacanza).', 'Il ragazzo ha una [[a]] e vuole andare a una [[b]]. È [[c]] e vuole partire per una [[d]].', [['Vespa'], ['festa'], ['estate'], ['vacanza']], 'Vocabolario del tema.')
q.mt('Collega la parola al significato.', [('la Vespa', 'scooter italiano'), ('il colle', 'collina'), ('la festa', 'party'), ('girare', 'andare in giro')], 'Parole utili.')
q.sc('Quale città è la patria dei Lunapop?', ['Bologna', 'Napoli', 'Torino', 'Palermo'], 0, 'I Lunapop sono di Bologna.')
q.tf('Cesare Cremonini è il cantante dei Lunapop.', True, 'Cremonini era il cantante della band.')
q.sc('Dopo l’ascolto: Perché la canzone è diventata un “tormentone” estivo?', ['Melodia semplice, ritornello facile, tema solare', 'È molto lunga', 'È sussurrata', 'Ha un testo difficile'], 0, 'Ritornello orecchiabile + atmosfera estiva.')
q.sc('Dopo l’ascolto: Che cosa rappresenta per te la Vespa nella canzone?', ['Un simbolo di libertà e giovinezza', 'Un mezzo per andare al lavoro', 'Un oggetto costoso', 'Un pericolo'], 0, 'Interpretazione: simbolo di libertà.')
notes = {'warmup': ['Immagine: una Vespa rossa su una strada di collina. Che cosa vi viene in mente?', 'Domanda: come immaginate l’estate perfetta in Italia?'],
         'steps': ['1. Impulso immagine e vocabolario (Vespa, estate, festa, vacanza).', '2. Primo ascolto: tema e stato d’animo.', '3. Secondo ascolto: dettagli e vero/falso.', '4. Con il testo originale (file privato): Lückentext, vedi sotto.'],
         'tips': ['Il testo originale della canzone resta nel file privato: usarlo solo per le lacune.', 'Lückentext: togliere 8–10 parole, ma ogni parola del ritornello solo UNA volta (il ritornello si ripete e rivelerebbe la soluzione).'],
         'followUp': ['Che cosa ti dà libertà nella tua vita? Scrivi 3 frasi.', 'Cerca una canzone italiana sull’estate e presentala.']}
pkg('50special-base', '50 Special · Base', 'it', 'A2', 'Tema, vocabolario e atmosfera di una canzone sull’estate e sulla Vespa (solo la canzone).', ['Musica', 'Estate', 'Bologna'], song(VID), q, S, ST, 'Base (livello intermedio)', notes, url=V + VID, source_note=NOTE)

q = Q()
q.sc('Prima dell’ascolto: Che cos’è un “tormentone”?', ['Una canzone molto popolare in una determinata estate', 'Una canzone triste', 'Un tipo di danza', 'Un film'], 0, 'Tormentone = hit estivo.')
q.sc('Analisi: Qual è il ruolo simbolico della Vespa nel testo?', ['Libertà e giovinezza', 'Ricchezza', 'Pericolo', 'Lavoro'], 0, 'La Vespa rappresenta libertà, amicizia, giovinezza.')
q.mc('Quali temi emergono? (più risposte)', ['Libertà', 'Estate', 'Amicizia', 'Guerra', 'Paura'], [0, 1, 2], 'Temi leggeri e solari.')
q.sc('Come descriveresti il linguaggio della canzone?', ['Semplice e colloquiale', 'Molto formale', 'Dialettale puro', 'Tecnico'], 0, 'Lessico semplice, vicino ai giovani.')
q.sc('Quali emozioni prevalgono?', ['Spensieratezza e voglia di vivere', 'Rabbia', 'Nostalgia triste', 'Angoscia'], 0, 'Tono positivo.')
q.sc('Perché il ritornello funziona bene?', ['Ripetizione e melodia semplice', 'È molto lungo', 'È sussurrato', 'Cambia ogni volta'], 0, 'Elementi tipici dei tormentoni estivi.')
q.tf('La canzone racconta una storia con un inizio, uno sviluppo e una fine molto precisi.', False, 'È più un’immagine/un’atmosfera che una storia.')
q.tf('Il brano è stato scritto da cantautori anziani.', False, 'I Lunapop erano molto giovani.')
q.mt('Lessico: abbina.', [('il colle', 'la collina'), ('la balotta', 'il gruppo di amici (bolognese)'), ('la cascina', 'la casa di campagna'), ('l’estate', 'la stagione calda')], 'Parole legate a Bologna e alla campagna.')
q.mt('Collega termini e sinonimi.', [('truccata', 'modificata'), ('sfiorare', 'quasi toccare'), ('ingranare', 'inserire la marcia'), ('fare in fretta', 'sbrigarsi')], 'Registro colloquiale e verbi dell’ambito motociclistico.')
q.gf('Completa con il condizionale (vorrei, potrebbe, sarebbe, andrei).', 'Io [[a]] con la Vespa al mare. Con gli amici [[b]] bellissimo. Una Vespa [[c]] portarci fuori città e [[d]] volentieri.', [['andrei'], ['sarebbe'], ['potrebbe'], ['vorrei']], 'Esercizio sul condizionale.')
q.od('Ordina le fasi di lavoro con la canzone.', ['Immagine e vocabolario', 'Primo ascolto (tema)', 'Secondo ascolto (dettagli)', 'Lückentext con il testo originale', 'Discussione e interpretazione'], 'Sequenza didattica consueta.')
q.sc('Dopo l’ascolto: Quale messaggio emerge, secondo te?', ['Vivere il presente con gli amici', 'Studiare di più', 'Lavorare molto', 'Evitare i viaggi'], 0, 'Interpretazione aperta: spensieratezza.')
notes = {'warmup': ['Domanda: perché alcune canzoni diventano “tormentoni”?', 'Ascoltate 20 secondi: che immagini vi vengono?'],
         'steps': ['1. Ascolto globale.', '2. Analisi del testo (tema, simboli).', '3. Lessico e condizionale.', '4. Lückentext con il testo originale (file privato).'],
         'tips': ['Testo originale solo nel file privato.', 'Ritornello: ogni parola mancante una sola volta.'],
         'followUp': ['Scrivi un breve testo: Che cosa rappresenta per te un mezzo di libertà?', 'Confronta con una canzone estiva del tuo paese.']}
pkg('50special-avanzata', '50 Special · Avanzata', 'it', 'B1', 'Analisi dei simboli e del linguaggio, lessico e condizionale (solo la canzone).', ['Musica', 'Estate', 'Analisi'], song(VID), q, S, ST, 'Avanzata (livello superiore)', notes, url=V + VID, source_note=NOTE)

# ---------------- TU SI A FINE DO' MUNNO ----------------
S, ST, VID = 'tu-si-a-fine-do-munno', 'Tu si a fine do’ munno · Angelo Famao', '4zE1RnQnwcQ'
q = Q()
q.sc('Prima dell’ascolto: Che cos’è un dialetto?', ['Una variante regionale di una lingua', 'Una lingua straniera', 'Un tipo di canzone', 'Un errore'], 0, 'I dialetti italiani sono forme locali, non errori.')
q.sc('Durante l’ascolto: Di che cosa parla la canzone?', ['Di una persona amata', 'Di una gita', 'Di un esame', 'Di cibo'], 0, 'È una canzone d’amore.')
q.tf('Il cantante vuole stare con la persona di cui parla.', True, 'Esprime una grande voglia di stare insieme.')
q.sc('Il testo mescola…', ['Italiano e napoletano', 'Inglese e francese', 'Solo inglese', 'Solo latino'], 0, 'Un testo in dialetto napoletano e italiano.')
q.mt('Dialetto → italiano standard: collega.', [('Tu si', 'Tu sei'), ('Cu tte', 'Con te'), ('teng na vogl', 'ho una voglia'), ('o primo pensiero', 'il primo pensiero')], 'Forme dialettali comuni.')
q.sc('Che cosa significa più o meno “fine do’ munno”?', ['La fine del mondo (in senso: sei fantastica/o)', 'Un posto lontano', 'Una canzone triste', 'Una festa'], 0, 'Espressione iperbolica positiva.')
q.gf('Completa (amore, sogni, testa, pensiero).', 'Il cantante dice che sei il primo [[a]], parla di [[b]] e di [[c]] e ti fa girare la [[d]].', [['pensiero'], ['sogni'], ['amore'], ['testa']], 'Parole del testo in italiano.')
q.tf('La canzone è stata registrata nel 2018.', True, 'Il singolo è del 2018.')
q.sc('Chi canta?', ['Angelo Famao', 'Mannarino', 'Liberato', 'Elisa'], 0, 'Angelo Famao.')
q.sc('Che atmosfera ha la canzone?', ['Romantica e vivace', 'Cupa', 'Aggressiva', 'Lenta e triste'], 0, 'Tono romantico e ritmo leggero.')
q.tf('Dopo l’ascolto: I dialetti in Italia sono solo parlati dagli anziani.', False, 'Anche i giovani li usano, soprattutto sui social.')
q.sa('Trova nel testo: come si dice “con te” in dialetto? (due parole)', ['cu tte', 'cu te', 'Cu tte'], 'cu tte', 'Cu tte = con te.')
notes = {'warmup': ['Domanda: conoscete un dialetto o una lingua regionale?', 'Ascoltate 10 secondi: riconoscete parole italiane?'],
         'steps': ['1. Che cosa è un dialetto?', '2. Primo ascolto: tema.', '3. Evidenziare parti dialettali nel testo privato.', '4. Tradurre in italiano standard (Compito 1 del foglio).'],
         'tips': ['Raccomandare altre canzoni in dialetto (Liberato, Mannarino).'],
         'followUp': ['Cerca una canzone in dialetto e presentala.', 'Quali parole del tuo dialetto/della tua lingua familiare usi con gli amici?']}
pkg('tusi-base', 'Tu si a fine do’ munno · Base', 'it', 'A2', 'Una canzone d’amore con dialetto napoletano: tema, parole chiave, dialetto e italiano standard.', ['Musica', 'Dialetti', 'Napoli'], song(VID), q, S, ST, 'Base', notes, url=V + VID, source_note=NOTE)

q = Q()
q.sc('Quale funzione ha il dialetto nel testo?', ['Dà identità e calore regionale', 'È un errore', 'Serve a nascondere il significato', 'È solo decorativo'], 0, 'Dialetto come identità.')
q.mt('Collega le forme dialettali all’italiano.', [('si suonn', 'sei un sogno'), ('je pens a te', 'io penso a te'), ('teng', 'ho'), ('o', 'il')], 'Esercizio di traduzione.')
q.mc('Che cosa si vede nella lingua del testo? (più risposte)', ['Mescolanza di codici', 'Frasi molto lunghe', 'Espressioni affettive', 'Termini tecnici'], [0, 2], 'Italiano e napoletano si alternano.')
q.sc('Perché i dialetti spopolano sui social (articolo sul dialetto)?', ['Sono divertenti e creano identità', 'Sono obbligatori', 'Sono più semplici', 'Sono vietati'], 0, 'Meme, battute, canzoni.')
q.tf('Secondo l’articolo molti italiani parlano ancora un dialetto in famiglia.', True, 'L’articolo cita dati sulla diffusione.')
q.sc('Quale effetto ha il ritornello?', ['Ripetizione e vicinanza', 'Distacco', 'Noia', 'Rabbia'], 0, 'Struttura ripetitiva e canto.')
q.sc('Che cosa significa “mescolare italiano e dialetto”?', ['Alternare due codici linguistici', 'Tradurre dall’inglese', 'Parlare piano', 'Parlare in fretta'], 0, 'Code-switching.')
q.gf('Completa (dialetto, identità, social, tradizione).', 'Il [[a]] è parte dell’[[b]] regionale. Oggi si diffonde sui [[c]] e unisce [[d]] e modernità.', [['dialetto'], ['identità'], ['social'], ['tradizione']], 'Lessico dell’articolo.')
q.sc('Quale registro usa l’artista?', ['Colloquiale e affettuoso', 'Burocratico', 'Scientifico', 'Poetico arcaico'], 0, 'Tono diretto.')
q.tf('La canzone è un esempio di musica popolare contemporanea.', True, 'Pop con elementi regionali.')
q.sa('Trova un sinonimo di “amore” (una parola).', ['affetto', 'passione', 'amore'], 'affetto', 'Più risposte possibili.')
q.sc('Quale compito del foglio è consigliato?', ['Evidenziare le parti in dialetto e tradurle', 'Riscrivere il testo in inglese', 'Imparare a memoria', 'Cantare in coro'], 0, 'Compito 1 del foglio.')
notes = {'warmup': ['Parlate delle lingue che usate a casa. Quando cambiate lingua?', 'Domanda: lo standard è migliore del dialetto?'],
         'steps': ['1. Articolo sul dialetto (lettura).', '2. Ascolto e identificazione di parole dialettali.', '3. Traduzione in standard.', '4. Discussione.'],
         'tips': ['Collegare con identità regionale; usare esempi dei social.'],
         'followUp': ['Scrivi un breve commento: i dialetti sono un valore o un limite?', 'Presenta una canzone in dialetto a scelta.']}
pkg('tusi-avanzata', 'Tu si a fine do’ munno · Avanzata', 'it', 'B1', 'Dialetto, identità e social: lingua del testo e articolo di approfondimento.', ['Musica', 'Dialetti', 'Società'], song(VID), q, S, ST, 'Avanzata', notes, url=V + VID, source_note=NOTE)

if __name__ == '__main__':
    write()
