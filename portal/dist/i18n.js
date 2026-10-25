'use strict';
// UI-only translations. Content, quotations, word answers and editorial data stay unchanged.
const UI_ROWS = [
  [
    'Oberflächensprache',
    'Lingua dell’interfaccia',
    'Interface language',
    'Langue de l’interface',
    'Lingua della pagina'
  ],
  ['Hauptnavigation', 'Navigazione principale', 'Main navigation', 'Navigation principale', 'Menu'],
  ['Ansicht wählen', 'Scegli la vista', 'Choose a view', 'Choisir une vue', 'Scegli'],
  [
    'Dein Lernstand bleibt',
    'I tuoi progressi restano',
    'Your progress stays',
    'Tes progrès restent',
    'I tuoi progressi restano'
  ],
  [
    'auf diesem Gerät.',
    'su questo dispositivo.',
    'on this device.',
    'sur cet appareil.',
    'su questo dispositivo.'
  ],
  [
    'Wörter werden Geschichten.',
    'Le parole diventano storie.',
    'Words become stories.',
    'Les mots deviennent des histoires.',
    'Le parole raccontano storie.'
  ],
  ['auf deiner Merkliste', 'nei preferiti', 'saved items', 'dans tes favoris', 'nei preferiti'],
  [
    'verfügbare Hörmaterialien',
    'materiali audio disponibili',
    'listening materials available',
    'documents audio disponibles',
    'ascolti disponibili'
  ],
  [
    'zuletzt besuchte Hörübungen',
    'ascolti visitati di recente',
    'recently visited listening activities',
    'activités audio consultées récemment',
    'ascolti aperti da poco'
  ],
  ['01 · HÖRVERSTEHEN', '01 · ASCOLTO', '01 · LISTENING', '01 · ÉCOUTE', '01 · ASCOLTA'],
  ['02 · WORTSCHATZ', '02 · LESSICO', '02 · VOCABULARY', '02 · VOCABULAIRE', '02 · PAROLE'],
  [
    'DAJE · HÖRVERSTEHEN UND WORTSCHATZ',
    'DAJE · ASCOLTO E LESSICO',
    'DAJE · LISTENING AND VOCABULARY',
    'DAJE · ÉCOUTE ET VOCABULAIRE',
    'DAJE · ASCOLTO E PAROLE'
  ],
  ['Italienisch', 'Italiano', 'Italian', 'Italien', 'Italiano'],
  ['Französisch', 'Francese', 'French', 'Français', 'Francese'],
  ['Englisch', 'Inglese', 'English', 'Anglais', 'Inglese'],
  ['Deutsch', 'Tedesco', 'German', 'Allemand', 'Tedesco'],
  ['Spanisch', 'Spagnolo', 'Spanish', 'Espagnol', 'Spagnolo'],
  [
    'Das Wort stimmt. In dieser Liste ist der Artikel optional.',
    'La parola è giusta. In questa lista l’articolo è facoltativo.',
    'The word is right. Articles are optional in this list.',
    'Le mot est juste. L’article est facultatif dans cette liste.',
    'La parola è giusta. Qui puoi scrivere senza articolo.'
  ],
  ['Mein Lernbereich', 'Il mio spazio', 'My learning space', 'Mon espace', 'Il mio spazio'],
  ['Mein Unterricht', 'Le mie lezioni', 'My teaching', 'Mes cours', 'Le mie lezioni'],
  ['Dein Lernbereich', 'Il tuo spazio', 'Your learning space', 'Ton espace', 'Il tuo spazio'],
  ['Dein Unterricht', 'Le tue lezioni', 'Your teaching', 'Tes cours', 'Le tue lezioni'],
  [
    'Hören und Wortschatz',
    'Ascolto e lessico',
    'Listening and vocabulary',
    'Écoute et vocabulaire',
    'Ascolto e parole'
  ],
  ['Hörverstehen', 'Comprensione orale', 'Listening', 'Compréhension orale', 'Ascolta'],
  [
    'Hörmaterial finden',
    'Trova materiali audio',
    'Find listening materials',
    'Trouver des documents audio',
    'Trova un ascolto'
  ],
  ['Wortschatz', 'Lessico', 'Vocabulary', 'Vocabulaire', 'Parole'],
  ['Merkliste', 'Preferiti', 'Saved items', 'Favoris', 'Preferiti'],
  ['Meine Sammlung', 'La mia raccolta', 'My collection', 'Ma collection', 'La mia raccolta'],
  ['Verlauf', 'Cronologia', 'History', 'Historique', 'Ultime attività'],
  [
    'Zuletzt angesehen',
    'Visti di recente',
    'Recently viewed',
    'Consultés récemment',
    'Visti da poco'
  ],
  ['Mein Fortschritt', 'I miei progressi', 'My progress', 'Mes progrès', 'I miei progressi'],
  [
    'Lernübersicht',
    'Riepilogo di apprendimento',
    'Learning overview',
    'Bilan d’apprentissage',
    'I miei progressi'
  ],
  ['Verben', 'Verbi', 'Verbs', 'Verbes', 'Verbi'],
  ['Lerntipps', 'Consigli di studio', 'Study tips', 'Conseils d’étude', 'Consejos de estudio'],
  ['Hilfe und Lerntipps', 'Aiuto e consigli', 'Help and study tips', 'Aide et conseils', 'Aiuto'],
  ['Darstellung', 'Aspetto', 'Appearance', 'Apparence', 'Colori'],
  ['Auswahl teilen', 'Condividi', 'Share', 'Partager', 'Condividi'],
  ['Theis-Konto', 'Account Theis', 'Theis account', 'Compte Theis', 'Account Theis'],
  ['Lernprofil', 'Profilo locale', 'Local profile', 'Profil local', 'Profilo sul dispositivo'],
  ['Ansicht: Lehrkraft', 'Vista docente', 'Teacher view', 'Vue enseignant', 'Per insegnanti'],
  ['Ansicht: Lernende', 'Vista studente', 'Learner view', 'Vue apprenant', 'Per studenti'],
  [
    'Für meinen Unterricht',
    'Per le mie lezioni',
    'For my teaching',
    'Pour mes cours',
    'Per le mie lezioni'
  ],
  ['Für mich üben', 'Esercitarmi', 'Practise for myself', 'M’entraîner', 'Voglio imparare'],
  [
    'Sprachen verstehen.',
    'Capire le lingue.',
    'Understand languages.',
    'Comprendre les langues.',
    'Capire le lingue.'
  ],
  ['Weiterkommen.', 'Fare progressi.', 'Keep moving forward.', 'Progresser.', 'Imparare di più.'],
  [
    'Hörverstehen für deinen Unterricht. Sprachtraining für deinen eigenen Lernweg. Alles an einem Ort.',
    'Ascolti per le tue lezioni. Esercizi per imparare in autonomia. Tutto in un unico spazio.',
    'Listening materials for your teaching. Language practice for your own learning. All in one place.',
    'Des documents audio pour tes cours. Des exercices pour apprendre en autonomie. Tout au même endroit.',
    'Qui trovi ascolti per le lezioni. Puoi anche studiare da solo.'
  ],
  [
    'Material für meinen Unterricht finden',
    'Trova materiale per le lezioni',
    'Find teaching materials',
    'Trouver du matériel pour mes cours',
    'Trova materiale per le lezioni'
  ],
  [
    'Hörverstehen entdecken',
    'Esplora gli ascolti',
    'Explore listening',
    'Découvrir les écoutes',
    'Trova un ascolto'
  ],
  [
    'Wortschatz üben',
    'Esercita il lessico',
    'Practise vocabulary',
    'Travailler le vocabulaire',
    'Impara parole'
  ],
  [
    'Zuletzt geöffnetes Hörverstehen',
    'Riprendi l’ultimo ascolto',
    'Return to your last listening',
    'Reprendre la dernière écoute',
    'Apri l’ultimo ascolto'
  ],
  [
    'Dein Lernprofil speichert aktuell nur in diesem Browser.',
    'Per ora i progressi restano in questo browser.',
    'Your progress is currently saved only in this browser.',
    'Tes progrès sont actuellement enregistrés uniquement dans ce navigateur.',
    'Per ora i dati restano qui.'
  ],
  [
    'Deine Sammlung bleibt aktuell in diesem Browser.',
    'Per ora la raccolta resta in questo browser.',
    'Your collection is currently saved in this browser.',
    'Ta collection reste actuellement dans ce navigateur.',
    'Per ora la raccolta resta qui.'
  ],
  ['FÜR LEHRKRÄFTE', 'PER DOCENTI', 'FOR TEACHERS', 'POUR LES ENSEIGNANTS', 'PER INSEGNANTI'],
  [
    'Passendes Material. Schnell im Blick.',
    'Il materiale giusto, a colpo d’occhio.',
    'The right materials, at a glance.',
    'Le bon matériel, en un coup d’œil.',
    'Trova il materiale giusto.'
  ],
  [
    'Nach Sprache und Niveau auswählen, Aufgaben prüfen und ein Arbeitsblatt oder den Lösungsschlüssel ausgeben.',
    'Scegli lingua e livello, controlla le attività e prepara una scheda o le soluzioni.',
    'Choose a language and level, review the tasks and prepare a worksheet or answer key.',
    'Choisis la langue et le niveau, vérifie les exercices et prépare une fiche ou son corrigé.',
    'Scegli una lingua e un livello. Guarda gli esercizi. Stampa la scheda o le risposte.'
  ],
  [
    'Unterricht vorbereiten',
    'Prepara le lezioni',
    'Prepare lessons',
    'Préparer les cours',
    'Prepara la lezione'
  ],
  [
    'Prüfungsmaterial sichten',
    'Valuta il materiale per le verifiche',
    'Review assessment materials',
    'Examiner le matériel d’évaluation',
    'Guarda il materiale per le verifiche'
  ],
  [
    'Link zum Selbstüben teilen',
    'Condividi il link per esercitarsi',
    'Share a practice link',
    'Partager un lien d’entraînement',
    'Condividi il link'
  ],
  [
    'DEIN NÄCHSTER SCHRITT',
    'IL PROSSIMO PASSO',
    'YOUR NEXT STEP',
    'TA PROCHAINE ÉTAPE',
    'IL PROSSIMO PASSO'
  ],
  [
    'Womit möchtest du weiterlernen?',
    'Come vuoi continuare?',
    'What would you like to practise?',
    'Que veux-tu travailler ?',
    'Che cosa vuoi fare?'
  ],
  [
    'Lerntipps entdecken',
    'Scopri i consigli',
    'Explore study tips',
    'Découvrir les conseils',
    'Consigli per studiare'
  ],
  ['Erst hören.', 'Prima ascoltare.', 'Listen first.', 'Écouter d’abord.', 'Prima ascolta.'],
  [
    'Dann genauer verstehen.',
    'Poi capire meglio.',
    'Then understand more.',
    'Puis mieux comprendre.',
    'Poi capisci meglio.'
  ],
  [
    'Kurze Hörimpulse, klare Aufgaben und Rückmeldung mit Erklärungen.',
    'Brevi ascolti, attività chiare e correzioni con spiegazioni.',
    'Short listening activities, clear tasks and feedback with explanations.',
    'Des écoutes courtes, des consignes claires et des corrections expliquées.',
    'Ascolta. Rispondi alle domande. Leggi le spiegazioni.'
  ],
  [
    'Hörübungen öffnen →',
    'Apri gli ascolti →',
    'Open listening activities →',
    'Ouvrir les écoutes →',
    'Apri gli ascolti →'
  ],
  [
    'Die richtigen Wörter.',
    'Le parole giuste.',
    'The right words.',
    'Les bons mots.',
    'Le parole giuste.'
  ],
  [
    'Immer ein Stück sicherer.',
    'Sempre più sicurezza.',
    'A little more confident each time.',
    'Un peu plus d’assurance.',
    'Impara un po’ ogni giorno.'
  ],
  [
    'Karten, Schreiben, Bilder und Zuordnen – in kurzen, abwechslungsreichen Runden.',
    'Schede, scrittura, immagini e abbinamenti in brevi sessioni.',
    'Flashcards, writing, pictures and matching in short, varied rounds.',
    'Cartes, écriture, images et associations dans de courtes séances variées.',
    'Usa le carte. Scrivi le parole. Trova le coppie.'
  ],
  [
    'Wortschatz trainieren →',
    'Esercita il lessico →',
    'Practise vocabulary →',
    'Travailler le vocabulaire →',
    'Impara parole →'
  ],
  ['ZUM AUSPROBIEREN', 'DA PROVARE', 'TRY IT OUT', 'À ESSAYER', 'PROVA'],
  [
    'Kleine Geschichten für zwischendurch.',
    'Piccole storie da ascoltare.',
    'Little stories for a spare moment.',
    'De petites histoires à écouter.',
    'Ascolta una storia breve.'
  ],
  [
    'Alle Hörübungen',
    'Tutti gli ascolti',
    'All listening activities',
    'Toutes les écoutes',
    'Tutti gli ascolti'
  ],
  [
    'Dein nächstes Aha-Erlebnis.',
    'Scopri qualcosa di nuovo.',
    'Your next moment of understanding.',
    'Ton prochain déclic.',
    'Ascolta e capisci.'
  ],
  [
    'Finde eine Hörübung, die zu deinem Niveau und deiner Neugier passt.',
    'Trova un ascolto adatto al tuo livello e ai tuoi interessi.',
    'Find a listening activity for your level and interests.',
    'Trouve une écoute adaptée à ton niveau et à tes intérêts.',
    'Scegli un ascolto per il tuo livello.'
  ],
  ['Sprache', 'Lingua', 'Language', 'Langue', 'Lingua'],
  ['Niveau', 'Livello', 'Level', 'Niveau', 'Livello'],
  ['Alle Sprachen', 'Tutte le lingue', 'All languages', 'Toutes les langues', 'Tutte le lingue'],
  ['Alle Niveaus', 'Tutti i livelli', 'All levels', 'Tous les niveaux', 'Tutti i livelli'],
  ['Thema oder Titel', 'Argomento o titolo', 'Topic or title', 'Thème ou titre', 'Tema o titolo'],
  ['Suchen', 'Cerca', 'Search', 'Rechercher', 'Cerca'],
  ['Italienisch', 'Italiano', 'Italian', 'Italien', 'Italiano'],
  ['Englisch', 'Inglese', 'English', 'Anglais', 'Inglese'],
  ['Französisch', 'Francese', 'French', 'Français', 'Francese'],
  ['Spanisch', 'Spagnolo', 'Spanish', 'Espagnol', 'Spagnolo'],
  ['Anhören', 'Ascolta', 'Listen', 'Écouter', 'Ascolta'],
  [
    'Material ansehen',
    'Vedi il materiale',
    'View material',
    'Voir le matériel',
    'Guarda il materiale'
  ],
  ['Weiterlernen', 'Continua', 'Continue learning', 'Continuer', 'Continua'],
  ['Erneut üben', 'Esercitati di nuovo', 'Practise again', 'Recommencer', 'Prova ancora'],
  ['Merken', 'Salva', 'Save', 'Enregistrer', 'Salva'],
  ['Gemerkt', 'Salvato', 'Saved', 'Enregistré', 'Salvato'],
  [
    'In Merkliste speichern',
    'Aggiungi ai preferiti',
    'Save to your list',
    'Ajouter aux favoris',
    'Salva nei preferiti'
  ],
  [
    'Aus Merkliste entfernen',
    'Rimuovi dai preferiti',
    'Remove from saved items',
    'Retirer des favoris',
    'Togli dai preferiti'
  ],
  [
    'Aufgaben und Unterrichtsmaterial',
    'Attività e materiali didattici',
    'Tasks and teaching materials',
    'Exercices et matériel pédagogique',
    'Esercizi per la lezione'
  ],
  [
    'Noch nicht bearbeitet',
    'Non ancora svolto',
    'Not started yet',
    'Pas encore commencé',
    'Non ancora fatto'
  ],
  [
    'Was hast du verstanden?',
    'Che cosa hai capito?',
    'What did you understand?',
    'Qu’as-tu compris ?',
    'Che cosa hai capito?'
  ],
  [
    'Aufgaben in der Lernansicht',
    'Attività nella vista studente',
    'Tasks in the learner view',
    'Exercices dans la vue apprenant',
    'Esercizi per studenti'
  ],
  [
    'Aufnahme abspielen',
    'Riproduci l’audio',
    'Play recording',
    'Lire l’enregistrement',
    'Ascolta l’audio'
  ],
  ['Wiedergabe pausieren', 'Pausa', 'Pause playback', 'Mettre en pause', 'Pausa'],
  [
    'Aufnahme fortsetzen',
    'Riprendi l’audio',
    'Resume recording',
    'Reprendre l’enregistrement',
    'Continua l’audio'
  ],
  ['Noch einmal abspielen', 'Riascolta', 'Play again', 'Réécouter', 'Ascolta ancora'],
  ['Hör erst einmal zu.', 'Prima ascolta.', 'Listen first.', 'Écoute d’abord.', 'Prima ascolta.'],
  [
    'Eigener Übungstext · synthetische Stimme',
    'Testo originale · voce sintetica',
    'Original practice text · synthetic voice',
    'Texte original · voix de synthèse',
    'Testo di esempio · voce del computer'
  ],
  ['Stoppen', 'Ferma', 'Stop', 'Arrêter', 'Stop'],
  ['Tempo', 'Velocità', 'Speed', 'Vitesse', 'Velocità'],
  ['Langsamer · 0,8×', 'Più lento · 0,8×', 'Slower · 0.8×', 'Plus lent · 0,8×', 'Lento · 0,8×'],
  ['Normal · 1×', 'Normale · 1×', 'Normal · 1×', 'Normal · 1×', 'Normale · 1×'],
  ['PASSEND DAZU', 'PER CONTINUARE', 'RELATED PRACTICE', 'POUR CONTINUER', 'DOPO L’ASCOLTO'],
  [
    'Wörter zum Weiterlernen.',
    'Parole per continuare.',
    'Words to practise next.',
    'Des mots pour continuer.',
    'Impara altre parole.'
  ],
  [
    'Bereite dich mit Wortschatz vor oder wiederhole nach dem Hören.',
    'Prepara il lessico o ripassalo dopo l’ascolto.',
    'Prepare the vocabulary or review it after listening.',
    'Prépare le vocabulaire ou révise-le après l’écoute.',
    'Studia le parole prima o dopo l’ascolto.'
  ],
  [
    'Wörter dieser Übung',
    'Le parole dell’attività',
    'Words from this activity',
    'Les mots de cet exercice',
    'Le parole dell’ascolto'
  ],
  [
    'Transkript zum Vergleichen',
    'Trascrizione da confrontare',
    'Transcript for comparison',
    'Transcription à comparer',
    'Leggi il testo'
  ],
  [
    'Quelle und Hinweise',
    'Fonte e indicazioni',
    'Source and notes',
    'Source et indications',
    'Fonte e informazioni'
  ],
  ['Deine Antwort', 'La tua risposta', 'Your answer', 'Ta réponse', 'La tua risposta'],
  ['Deine Antwort …', 'La tua risposta …', 'Your answer …', 'Ta réponse …', 'Scrivi qui …'],
  ['Richtig', 'Vero', 'True', 'Vrai', 'Vero'],
  ['Falsch', 'Falso', 'False', 'Faux', 'Falso'],
  ['Richtig erkannt', 'Corretto', 'Correct', 'Correct', 'Giusto'],
  [
    'Noch nicht erkannt',
    'Non ancora corretto',
    'Not recognised yet',
    'Pas encore reconnu',
    'Non è ancora giusto'
  ],
  [
    'Noch keine Antwort',
    'Nessuna risposta',
    'No answer yet',
    'Pas encore de réponse',
    'Non hai risposto'
  ],
  [
    'Antworten korrigieren',
    'Controlla le risposte',
    'Check answers',
    'Vérifier les réponses',
    'Controlla le risposte'
  ],
  ['Erneut prüfen', 'Controlla di nuovo', 'Check again', 'Vérifier à nouveau', 'Controlla ancora'],
  [
    'Lösungen erscheinen erst nach deiner Korrektur.',
    'Le soluzioni appaiono dopo il controllo.',
    'Solutions appear after you check your answers.',
    'Les solutions apparaissent après la correction.',
    'Prima rispondi. Poi guarda le soluzioni.'
  ],
  [
    'Du kannst Antworten ändern und erneut prüfen.',
    'Puoi modificare le risposte e controllarle di nuovo.',
    'You can change your answers and check again.',
    'Tu peux modifier tes réponses et vérifier à nouveau.',
    'Puoi cambiare le risposte e controllare ancora.'
  ],
  [
    'Deine Notiz zu dieser Übung',
    'La tua nota',
    'Your note for this activity',
    'Ta note sur cet exercice',
    'Le tue note'
  ],
  [
    'Deine Notiz zur Unterrichtsplanung',
    'La tua nota per la lezione',
    'Your lesson planning note',
    'Ta note pour préparer le cours',
    'Note per la lezione'
  ],
  [
    'Was möchtest du dir merken?',
    'Che cosa vuoi ricordare?',
    'What would you like to remember?',
    'Que veux-tu retenir ?',
    'Che cosa vuoi ricordare?'
  ],
  [
    'Neue Runde beginnen',
    'Inizia una nuova sessione',
    'Start a new round',
    'Commencer une nouvelle séance',
    'Ricomincia'
  ],
  [
    'Zur Übersicht',
    'Torna all’elenco',
    'Back to overview',
    'Retour à la liste',
    'Torna alla lista'
  ],
  ['Schließen', 'Chiudi', 'Close', 'Fermer', 'Chiudi'],
  [
    'Zur Auswahl',
    'Scegli un’attività',
    'Back to selection',
    'Retour au choix',
    'Scegli un’attività'
  ],
  ['Runde beenden', 'Termina la sessione', 'End round', 'Terminer la séance', 'Finisci'],
  ['Antwort prüfen', 'Controlla la risposta', 'Check answer', 'Vérifier la réponse', 'Controlla'],
  ['Einen Tipp bekommen', 'Chiedi un aiuto', 'Get a hint', 'Obtenir un indice', 'Aiutami'],
  [
    'Ich weiß es noch nicht',
    'Non lo so ancora',
    'I don’t know yet',
    'Je ne sais pas encore',
    'Non lo so'
  ],
  ['Weiter', 'Avanti', 'Next', 'Suivant', 'Avanti'],
  [
    'Lösung aufdecken',
    'Mostra la soluzione',
    'Reveal answer',
    'Afficher la réponse',
    'Mostra la risposta'
  ],
  ['Noch einmal üben', 'Da ripassare', 'Practise again', 'À revoir', 'Prova ancora'],
  ['Das konnte ich', 'Lo sapevo', 'I knew it', 'Je savais', 'Lo sapevo'],
  ['Karten', 'Schede', 'Flashcards', 'Cartes', 'Carte'],
  ['Schreiben', 'Scrittura', 'Writing', 'Écriture', 'Scrivi'],
  ['Zuordnen', 'Abbinamenti', 'Matching', 'Associations', 'Trova le coppie'],
  ['Erklärungen', 'Definizioni', 'Definitions', 'Définitions', 'Spiegazioni'],
  [
    'Vokabelkarten',
    'Schede lessicali',
    'Vocabulary cards',
    'Cartes de vocabulaire',
    'Carte di parole'
  ],
  ['Lerntipps', 'Consigli di studio', 'Study tips', 'Conseils', 'Consigli'],
  ['Abfragerichtung', 'Direzione', 'Direction', 'Sens de traduction', 'Quale lingua?'],
  ['Öffnen', 'Apri', 'Open', 'Ouvrir', 'Apri'],
  [
    'Für später. Für dich.',
    'Da ritrovare quando vuoi.',
    'For later. For you.',
    'Pour plus tard. Pour toi.',
    'Per dopo. Per te.'
  ],
  [
    'Gutes Material wiederfinden.',
    'Ritrova i materiali utili.',
    'Find your good materials again.',
    'Retrouver les bons documents.',
    'Ritrova il materiale.'
  ],
  [
    'Hier beginnt deine Sammlung.',
    'La tua raccolta inizia qui.',
    'Your collection starts here.',
    'Ta collection commence ici.',
    'Qui ci sono i tuoi preferiti.'
  ],
  [
    'Hier warst du zuletzt.',
    'Le ultime attività.',
    'Your recent visits.',
    'Tes dernières visites.',
    'Qui sei stato da poco.'
  ],
  [
    'Besuche in diesem Lernprofil merken',
    'Salva la cronologia in questo profilo',
    'Remember visits in this profile',
    'Enregistrer les visites dans ce profil',
    'Salva le ultime attività'
  ],
  [
    'Verlauf leeren',
    'Cancella la cronologia',
    'Clear history',
    'Effacer l’historique',
    'Cancella la lista'
  ],
  [
    'Deine Schritte werden sichtbar.',
    'I tuoi progressi, passo dopo passo.',
    'See your progress.',
    'Tes progrès prennent forme.',
    'Guarda i tuoi progressi.'
  ],
  [
    'Wörter, die bleiben sollen.',
    'Parole da ricordare.',
    'Words worth remembering.',
    'Des mots à retenir.',
    'Ricorda le parole.'
  ],
  [
    'Wähle dein Lehrwerk oder eine zusätzliche Liste. Danach entscheidest du, wie du übst.',
    'Scegli il libro o una lista. Poi scegli come esercitarti.',
    'Choose your textbook or another list, then choose how to practise.',
    'Choisis ton manuel ou une autre liste, puis ta façon de travailler.',
    'Scegli un libro o una lista. Poi scegli un esercizio.'
  ],
  ['Üben', 'Esercitati', 'Practise', 'S’entraîner', 'Fai un esercizio'],
  [
    'Dein Wortschatz zum Nachschlagen.',
    'Consulta il tuo lessico.',
    'Browse your vocabulary.',
    'Consulter ton vocabulaire.',
    'Guarda le parole.'
  ],
  ['Wortliste öffnen', 'Apri la lista', 'Open word list', 'Ouvrir la liste', 'Apri la lista'],
  [
    'Lernstand sichern',
    'Esporta i progressi',
    'Back up progress',
    'Sauvegarder les progrès',
    'Salva i progressi'
  ],
  ['Datei importieren', 'Importa un file', 'Import file', 'Importer un fichier', 'Apri un file'],
  [
    'Profile verwalten',
    'Gestisci i profili',
    'Manage profiles',
    'Gérer les profils',
    'I tuoi profili'
  ],
  [
    'Mein Tagesziel',
    'Il mio obiettivo giornaliero',
    'My daily goal',
    'Mon objectif quotidien',
    'Quante parole oggi?'
  ],
  [
    'Eine Runde üben',
    'Fai una sessione',
    'Practise a round',
    'Faire une séance',
    'Fai un esercizio'
  ],
  [
    'Deine letzten sieben Tage',
    'Gli ultimi sette giorni',
    'Your last seven days',
    'Tes sept derniers jours',
    'Gli ultimi sette giorni'
  ],
  [
    'Was ist als Nächstes dran?',
    'Come continuare?',
    'What comes next?',
    'Et maintenant ?',
    'Che cosa facciamo adesso?'
  ],
  [
    'Mitnehmen statt neu anfangen.',
    'Porta con te i tuoi progressi.',
    'Take your progress with you.',
    'Emporte tes progrès.',
    'Porta con te i progressi.'
  ],
  ['Zum Inhalt', 'Vai al contenuto', 'Skip to content', 'Aller au contenu', 'Vai al contenuto'],
  ['Quellen', 'Fonti', 'Sources', 'Sources', 'Fonti'],
  [
    'Quellen und Bildnachweise',
    'Fonti e crediti',
    'Sources and image credits',
    'Sources et crédits',
    'Fonti e immagini'
  ],
  ['Zu Theis Apps', 'Vai a Theis Apps', 'Go to Theis Apps', 'Vers Theis Apps', 'Theis Apps'],
  ['Private Vorschau', 'Anteprima privata', 'Private preview', 'Aperçu privé', 'Anteprima privata'],
  [
    'Das Wort stimmt. Welcher Artikel gehört dazu?',
    'La parola è giusta. Qual è l’articolo?',
    'The word is right. Which article goes with it?',
    'Le mot est juste. Quel article convient ?',
    'La parola è giusta. Quale articolo serve?'
  ],
  [
    'Prüfe Genus, Artikel und Wortendung. Ist das Substantiv männlich oder weiblich?',
    'Controlla genere, articolo e finale. Il nome è maschile o femminile?',
    'Check gender, article and ending. Is the noun masculine or feminine?',
    'Vérifie le genre, l’article et la terminaison. Le nom est-il masculin ou féminin ?',
    'Il nome è maschile o femminile? Guarda l’articolo e la fine della parola.'
  ],
  [
    'Welches Genus hat das Substantiv? Welcher Artikel passt dazu?',
    'Qual è il genere del nome? Quale articolo serve?',
    'What gender is the noun? Which article fits?',
    'Quel est le genre du nom ? Quel article convient ?',
    'Il nome è maschile o femminile? Quale articolo serve?'
  ],
  [
    'Fast: Prüfe die Akzente. Sie können die Bedeutung verändern.',
    'Quasi: controlla gli accenti. Possono cambiare il significato.',
    'Almost: check the accents. They can change the meaning.',
    'Presque : vérifie les accents. Ils peuvent changer le sens.',
    'Controlla gli accenti. Possono cambiare il significato.'
  ],
  [
    'Möglicher Tippfehler: Prüfe die Buchstaben noch einmal. Noch nicht als richtig gewertet.',
    'Possibile errore di battitura: controlla le lettere. La risposta non è ancora corretta.',
    'Possible typo: check the letters again. Not marked correct yet.',
    'Faute de frappe possible : vérifie les lettres. La réponse n’est pas encore validée.',
    'Controlla le lettere. La risposta non è ancora giusta.'
  ],
  [
    'Richtig – mit Hilfestellung.',
    'Corretto, con un aiuto.',
    'Correct, with a hint.',
    'Correct, avec un indice.',
    'Giusto, con un aiuto.'
  ],
  [
    'Richtig. Gut erinnert!',
    'Corretto. Te lo sei ricordato!',
    'Correct. Well remembered!',
    'Correct. Bien retenu !',
    'Giusto!'
  ],
  [
    'Noch nicht erkannt. Vergleiche mit der Lösung.',
    'Non ancora corretto. Confronta la soluzione.',
    'Not recognised yet. Compare with the answer.',
    'Pas encore reconnu. Compare avec la solution.',
    'Guarda la soluzione e confronta.'
  ]
];
let uiLocale = 'de',
  uiTextRecords = new WeakMap(),
  uiAttrRecords = new WeakMap(),
  uiObserver = null;
const UI_LOOKUP = new Map(UI_ROWS.map(row => [row[0], row]));
if (typeof UI_ROWS_EXTRA !== 'undefined')
  for (const row of UI_ROWS_EXTRA) if (!UI_LOOKUP.has(row[0])) UI_LOOKUP.set(row[0], row);
const UI_IDX = { de: 0, it: 1, en: 2, fr: 3, 'it-simple': 4, 'en-simple': 2, 'fr-simple': 3 };
function uiSimple(loc, text) {
  if (loc === 'en-simple' && typeof UI_SIMPLE_EN !== 'undefined' && UI_SIMPLE_EN[text]) return UI_SIMPLE_EN[text];
  if (loc === 'fr-simple' && typeof UI_SIMPLE_FR !== 'undefined' && UI_SIMPLE_FR[text]) return UI_SIMPLE_FR[text];
  return text;
}
function uiFill(text, nums) {
  let i = 0;
  return text.replace(/\{n\}/g, () => (i < nums.length ? nums[i++] : '{n}'));
}
function uiExact(source) {
  const row = UI_LOOKUP.get(source);
  if (row) return uiSimple(uiLocale, row[UI_IDX[uiLocale]]);
  const nums = source.match(/\d+/g);
  if (nums) {
    const row2 = UI_LOOKUP.get(source.replace(/\d+/g, '{n}'));
    if (row2) return uiFill(uiSimple(uiLocale, row2[UI_IDX[uiLocale]]), nums);
  }
  return null;
}
function uiTranslateText(source) {
  if (uiLocale === 'de') return source;
  const exact = uiExact(source);
  if (exact !== null) return exact;
  if (source.includes(' · ')) {
    const parts = source.split(' · ');
    const mapped = parts.map(p => uiTranslateText(p));
    if (mapped.some((p, i) => p !== parts[i])) return mapped.join(' · ');
  }
  const patterns = [
    [
      /^Deine Antwort auf (.+) · Artikel mitlernen$/,
      [
        'La tua risposta in $1 · impara l’articolo',
        'Your answer in $1 · learn the article',
        'Ta réponse en $1 · apprends l’article',
        'Scrivi in $1. Ricorda l’articolo.'
      ]
    ],
    [
      /^(\d+) \/ (\d+) beantwortet$/,
      ['$1 / $2 risposte', '$1 / $2 answered', '$1 / $2 réponses', '$1 / $2 risposte']
    ],
    [/^(\d+) Wörter$/, ['$1 parole', '$1 words', '$1 mots', '$1 parole']],
    [
      /^Zu „(.+)“ passend$/,
      ['Abbina a «$1»', 'Matches “$1”', 'Correspond à « $1 »', 'Va con «$1»']
    ],
    [/^Lücke (\d+)$/, ['Spazio $1', 'Gap $1', 'Trou $1', 'Spazio $1']],
    [
      /^Position für „(.+)“$/,
      ['Posizione per «$1»', 'Position for “$1”', 'Position pour « $1 »', 'Posizione per «$1»']
    ],
    [
      /^(.+): geübte Einträge$/,
      ['$1: voci esercitate', '$1: entries practised', '$1 : entrées travaillées', '$1: voci fatte'],
      true
    ],
    [/^(.+) öffnen$/, ['Apri $1', 'Open $1', 'Ouvrir $1', 'Apri $1'], true],
    [
      /^(.*?) Hörstrecke laut Gemini (\S+); der Player zeigt das ganze Video\.$/,
      [
        '$1 Tratto di ascolto secondo Gemini: $2; il player mostra l’intero video.',
        '$1 Listening section according to Gemini: $2; the player shows the whole video.',
        '$1 Passage d’écoute selon Gemini : $2 ; le lecteur affiche toute la vidéo.',
        '$1 Parte da ascoltare (secondo Gemini): $2. Il player mostra tutto il video.'
      ]
    ]
  ];
  for (const [re, options, inner] of patterns) {
    const m = source.match(re);
    if (!m) continue;
    const tpl = options[{ it: 0, en: 1, fr: 2, 'it-simple': 3, 'en-simple': 1, 'fr-simple': 2 }[uiLocale]];
    return tpl.replace(/\$(\d)/g, (_, i) => (inner && i === '1' ? uiTranslateText(m[1]) : m[i]));
  }
  const up = source.toUpperCase() === source && /[A-ZÄÖÜ]{3}/.test(source);
  if (up) {
    const low = source.toLowerCase();
    for (const [k] of UI_LOOKUP)
      if (k.toLowerCase() === low) return uiExact(k).toUpperCase();
  }
  return source;
}
function translateUI() {
  const skip =
    '.studio-editor,.studio-import,.studio-paste,.studio-inventory,.word-display,.card-example,.match-tile,.lesson-body h3,.vocabulary-card h3,.listen-transcript p,.listen-sources,#teaching-print .paper,script,style,textarea,option[data-no-translate]';
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walker.nextNode())) {
    if (!n.parentElement || n.parentElement.closest(skip)) continue;
    const current = n.nodeValue,
      trimmed = current.trim();
    if (!trimmed) continue;
    const record = uiTextRecords.get(n);
    const source = record && record.last === current ? record.source : trimmed;
    const result = uiTranslateText(source);
    if (result !== source || record) {
      const output = current.startsWith(' ') ? ' ' + result : result;
      if (output !== current) n.nodeValue = output;
      uiTextRecords.set(n, { source, last: output });
    }
  }
  for (const el of document.querySelectorAll('[placeholder],[aria-label],[title]')) {
    if (el.closest(skip)) continue;
    let records = uiAttrRecords.get(el) || {};
    for (const key of ['placeholder', 'aria-label', 'title']) {
      if (!el.hasAttribute(key)) continue;
      const value = el.getAttribute(key),
        old = records[key],
        source = old && old.last === value ? old.source : value,
        result = uiTranslateText(source);
      if (value !== result) el.setAttribute(key, result);
      records[key] = { source, last: result };
    }
    uiAttrRecords.set(el, records);
  }
  document.documentElement.lang = uiLocale.split('-')[0];
}
function setupI18n() {
  const saved = read('ripassa-ui-language-v1', 'de');
  uiLocale = ['de', 'it', 'en', 'fr', 'it-simple', 'en-simple', 'fr-simple'].includes(saved) ? saved : 'de';
  const label = document.createElement('label');
  label.className = 'ui-language';
  label.innerHTML =
    '<span class="sr-only">Oberflächensprache</span><select id="ui-language" aria-label="Oberflächensprache"><option value="de">DE · Deutsch</option><option value="it">IT · Italiano</option><option value="en">EN · English</option><option value="fr">FR · Français</option><option value="it-simple">IT · Italiano semplice</option><option value="en-simple">EN · Simple English</option><option value="fr-simple">FR · Français facile</option></select>';
  document.querySelector('.top-actions').prepend(label);
  $('ui-language').value = uiLocale;
  $('ui-language').addEventListener('change', e => {
    uiLocale = e.target.value;
    save('ripassa-ui-language-v1', uiLocale);
    translateUI();
  });
  uiObserver = new MutationObserver(() => translateUI());
  uiObserver.observe(document.body, { subtree: true, childList: true, characterData: true });
  translateUI();
}
