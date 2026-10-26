from lib import *
V = 'https://www.youtube.com/watch?v='
NOTE = 'Offizielles Video beim Anbieter; Einbettbarkeit und Rechte vor dem Einsatz prüfen.'

# ---------------- I WANT IT THAT WAY ----------------
S, ST, VID = 'i-want-it-that-way', 'I Want It That Way · Backstreet Boys', '4fndeDfaWCg'
q = Q()
q.tf('Vor dem Hören: Backstreet Boys sind eine Popband („boy band") aus den USA.', True, 'Die Band wurde in den 1990ern berühmt.')
q.mt('Wortschatz vorab: Verbinde.', [('heart', 'Herz'), ('desire', 'Wunsch, Sehnsucht'), ('fire', 'Feuer'), ('ache', 'Schmerz'), ('far away', 'weit weg')], 'Diese Wörter kommen im Lied oder in den Aufgaben vor.')
q.sc('Beim Hören: Um welches Thema geht es hauptsächlich?', ['Eine Reise in den Urlaub', 'Liebe und Schmerz in einer Beziehung', 'Ein Fußballspiel', 'Schule und Hausaufgaben'], 1, 'Es geht um eine Beziehung mit Streit und Sehnsucht.')
q.sc('Welches Gefühl ist zentral?', ['Langeweile', 'Herzschmerz', 'Hunger', 'Müdigkeit'], 1, 'Das Lied dreht sich um „heartache".')
q.sc('Was sagt die Person über den anderen Menschen?', ['Er/Sie ist unwichtig.', 'Er/Sie ist sehr wichtig – wie ein Feuer und ein Wunsch.', 'Er/Sie wohnt in Berlin.', 'Er/Sie ist langweilig.'], 1, 'Der andere Mensch bedeutet dem Sänger alles.')
q.tf('Die Person ist sicher, was ihr Partner/ihre Partnerin will.', False, 'Gerade das Unklare („that way") ist Teil des Liedes.')
q.sc('Welche Frage kehrt immer wieder im Lied?', ['Wo ist die Schule?', 'Warum ist es so, wie es ist?', 'Wie spät ist es?', 'Wer hat gewonnen?'], 1, 'Die Person fragt, warum alles so schwierig ist.')
q.gf('Ergänze die Wörter (heart, fire, far, love).', 'You are my [[a]]. I can’t reach your [[b]]. Our [[c]] is strong, but we are [[d]] from each other.', [['fire'], ['heart'], ['love'], ['far']], 'Einfache Wörter aus dem Themenfeld Liebe.')
q.sc('Wie klingt die Musik?', ['Wie Metal', 'Weich und emotional (Popballade)', 'Wie Techno', 'Wie Oper'], 1, 'Mehrstimmiger Gesang, ruhiger Beat.')
q.tf('Im Video sieht man die Band oft in einem Flughafen.', True, 'Das berühmte Video spielt in einem großen Flughafenterminal.')
q.sc('Wähle den richtigen Satz auf Englisch:', ['He want it that way.', 'He wants it that way.', 'He wanting it that way.', 'He wanted it that ways.'], 1, 'Third person singular: wants.')
q.mt('Verbinde Satzanfang und Ende (Grammatik: Present Simple).', [('I', 'want it that way'), ('She', 'wants it that way'), ('They', 'want it that way'), ('He', 'doesn’t want it that way')], 'Be careful with -s and doesn’t.')
q.tf('Nach dem Hören: Der Titel „That way" ist eindeutig und klar erklärt.', False, 'Viele Fans diskutieren bis heute, was genau „that way" bedeutet.')
q.sa('Schreibe das Wort für „Herzschmerz" auf Englisch (ein Wort).', ['heartache'], 'heartache', 'heart + ache = heartache.')
notes = {'warmup': ['Bild: Foto eines Flughafens oder zwei Menschen am Telefon. Was könnte das Lied erzählen?', 'Habt ihr ein Lied, das ihr mit „Herzschmerz" verbindet?'],
         'steps': ['1. Wörter vorab klären (Aufgabe 2).', '2. Erstes Hören: Thema und Gefühl (3–5).', '3. Zweites Hören: Details; Grammatikaufgabe.', '4. Video ansehen; Gespräch zur Mehrdeutigkeit des Titels.'],
         'tips': ['Sehr gut als Einstieg in die Band-Kultur der 90er.', 'Lückentext mit dem Original privat importieren und beim Refrain Wiederholungen zählen lassen.'],
         'followUp': ['Was könnte „that way" bedeuten? Schreibe zwei Möglichkeiten.', 'Schreibe in 3 Sätzen, worum es in deinem Lieblingslied geht.']}
pkg('iwiwt-basis', 'I Want It That Way · Basis', 'en', 'A2', 'Gefühle und Schlüsselwörter in einem Popklassiker erkennen, mit einfacher Grammatik zur dritten Person.', ['Musik', 'Liebe', 'Gefühle'], song(VID), q, S, ST, 'Basis', notes, url=V + VID, source_note=NOTE)

q = Q()
q.sa('Vor dem Hören: Nenne ein englisches Wort, das du bei einer Liebesballade erwartest.', ['love', 'heart', 'pain', 'miss', 'tears'], 'love / heart', 'Erwartungen aktivieren.')
q.mt('Verbinde Wort und Bedeutung.', [('heartache', 'seelischer Schmerz'), ('desire', 'starker Wunsch'), ('distance', 'räumlicher oder emotionaler Abstand'), ('ambiguous', 'mehrdeutig')], 'Wortschatz für das Gespräch über das Lied.')
q.mc('Welche Aussagen passen zum Lied? (mehrere)', ['Die Beziehung ist schwierig', 'Es gibt Unsicherheit über die Wünsche des anderen', 'Das Lied beschreibt eine glückliche Hochzeit', 'Es geht um Sehnsucht', 'Es geht um ein Fußballspiel'], [0, 1, 3], 'Gefühlsmischung aus Liebe, Streit und Unklarheit.')
q.sc('Wie nennt man Lieder wie dieses?', ['Ballade', 'Marsch', 'Choral', 'Rap-Battle'], 0, 'Ruhige, gefühlvolle Popballade.')
q.sc('Warum wird der Titel oft diskutiert?', ['Weil er schlecht geschrieben ist', 'Weil „that way" nicht klar sagt, was gemeint ist', 'Weil er verboten wurde', 'Weil er sehr lang ist'], 1, 'Mehrdeutigkeit: Wer will was, und welcher „Weg"?')
q.tf('Das Lied wurde von den Bandmitgliedern selbst geschrieben.', False, 'Es stammt von den Songwritern Max Martin und Andreas Carlsson.')
q.sc('Welche Zeitform passt? „Right now, they … together."', ['is', 'are', 'am', 'be'], 1, 'Plural: are.')
q.gf('Reported Speech: Ergänze.', 'The singer said that he [[a]] his partner very much. He added that they [[b]] apart for too long.', [['loved'], ['had been', 'were']], 'Backshift: love → loved; have been → had been.')
q.sc('Welche Ausdrucksform erzeugt im Chor Nähe?', ['Mehrstimmiger Gesang', 'Nur Schlagzeug', 'Rap', 'Sprechgesang'], 0, 'Harmonien sind ein Markenzeichen der Band.')
q.tf('Das Lied erzählt eine genaue Geschichte mit Anfang, Mitte und Schluss.', False, 'Es ist eher ein Gefühlsbild als eine Handlung.')
q.sa('Welches Adjektiv beschreibt die Stimmung am besten? (englisch)', ['melancholic', 'sad', 'emotional', 'longing', 'wistful', 'sentimental'], 'melancholic', 'Mehrere Antworten sind möglich.')
q.sc('Welche Aussage über die Mehrdeutigkeit ist richtig?', ['Sie macht das Lied für viele Hörer persönlich deutbar.', 'Sie macht es unverständlich.', 'Sie ist ein Fehler.', 'Sie kommt nur im Video vor.'], 0, 'Offene Bedeutung = viele Anknüpfungspunkte.')
notes = {'warmup': ['Hört den Anfang und sammelt Gefühle als Wortwolke.', 'Frage: Was ist ein „Ohrwurm"? Warum bleiben manche Lieder im Kopf?'],
         'steps': ['1. Wortschatz klären.', '2. Hören: Thema, Gefühl.', '3. Mehrdeutigkeit diskutieren.', '4. Mini-Aufsatz: „This or that way?"'],
         'tips': ['Gut als Brücke zu Songwriting und Pop-Industrie.'],
         'followUp': ['Schreibe 100 Wörter: Was bedeutet „that way" für dich?', 'Diskutiere: Müssen Liedtexte immer Sinn ergeben?']}
pkg('iwiwt-standard', 'I Want It That Way · Standard', 'en', 'B1', 'Thema, Stimmung und Mehrdeutigkeit eines Popklassikers; Wortschatz und Reported Speech.', ['Musik', 'Liebe', 'Sprache'], song(VID), q, S, ST, 'Standard', notes, url=V + VID, source_note=NOTE)

# ---------------- AMERICAN PIE ----------------
S, ST, VID = 'american-pie', 'American Pie · Don McLean', 'PRpiBpDy7MQ'
NOTE_AP = 'Lyric-Video bei YouTube. Anbieter, Einbettbarkeit und Rechte prüfen, alternativ eine offizielle Aufnahme verwenden.'
q = Q()
q.tf('Vor dem Hören: „American Pie" ist ein sehr langes Lied (mehr als acht Minuten).', True, 'Die Albumfassung dauert über 8 Minuten.')
q.sc('Beim Hören: In welchem Jahrzehnt erschien das Lied?', ['1950er', '1970er', '1990er', '2010er'], 1, 'Veröffentlicht 1971.')
q.sc('Welches Ereignis nennt der Sänger „the day the music died"?', ['Ein Flugzeugabsturz mit drei Rockstars 1959', 'Ein Brand in einem Konzertsaal', 'Das Ende des Radios', 'Ein Sturm'], 0, 'Am 3. Februar 1959 starben Buddy Holly, Ritchie Valens und The Big Bopper.')
q.sc('Welchen Job hatte der Erzähler als Jugendlicher?', ['Zeitungsausträger', 'Koch', 'Pilot', 'Lehrer'], 0, 'Er lieferte Zeitungen aus und erfuhr so vom Unglück.')
q.mc('Welche Dinge nennt das Lied oder gehören zum Thema? (mehrere)', ['Musik', 'Tanzen', 'Autos (Chevy)', 'Unterwasserwelt', 'Whiskey und Rye'], [0, 1, 2, 4], 'Alltagsbilder der amerikanischen Kultur der 50er/60er.')
q.gf('Setze die Wörter ein (music, dance, school, radio, smile).', 'The singer remembers how the [[a]] made him [[b]]. He went to [[c]] and listened to the [[d]].', [['music'], ['smile'], ['school'], ['radio']], 'Alltag eines Jugendlichen in den 50ern.')
q.sc('Wie ist die Stimmung des Liedes?', ['Wehmütig und nachdenklich', 'Aggressiv', 'Humorvoll', 'Gruselig'], 0, 'Rückblick mit Wehmut.')
q.mt('Verbinde die Wörter mit der Bedeutung.', [('levee', 'Damm'), ('whiskey', 'Whisky'), ('dry', 'trocken'), ('pie', 'Kuchen')], 'Wörter aus dem Refrain-Wortfeld.')
q.sc('Welches Instrument prägt den Anfang?', ['Gitarre / Folk-Sound', 'Dudelsack', 'Trompete', 'Synthesizer'], 0, 'Folk-Rock mit Gitarre und später Band.')
q.sc('Übersetze: „I used to listen to the radio."', ['Ich höre jetzt Radio.', 'Früher habe ich Radio gehört.', 'Ich werde Radio hören.', 'Ich habe nie Radio gehört.'], 1, 'used to = früher (gewohnheitsmäßig).')
q.tf('Das Lied ist nur ein Tanzlied ohne tieferen Sinn.', False, 'Viele deuten es als Rückblick auf das Ende einer Ära.')
q.sa('Wie heißt der Sänger? (Nachname)', ['McLean', 'Mclean'], 'McLean', 'Don McLean.')
notes = {'warmup': ['Bild: Foto von 1950er US-Jugendkultur (Diner, Jukebox, Chevy). Was seht ihr?', 'Was war „die gute alte Zeit" für eure Großeltern?'],
         'steps': ['1. Bild und Kontext.', '2. Hören in Abschnitten (Strophe 1 + Refrain).', '3. Wortschatz.', '4. Gefühle sammeln.'],
         'tips': ['Das Lied ist lang – in zwei Sitzungen teilen oder nur den Anfang nutzen.', 'Lückentext mit dem Original privat importieren; Refrain-Wörter getrennt setzen, damit Wiederholungen nicht verraten.'],
         'followUp': ['Wie fühlst du dich beim Hören? Schreibe zwei Sätze.', 'Welches Ereignis würdest du in einem eigenen Lied festhalten?']}
pkg('american-pie-basis', 'American Pie · Basis', 'en', 'A2', 'Geschichte und Stimmung des Folk-Klassikers; einfache Wörter und „used to".', ['Musik', 'Geschichte', 'USA'], song(VID), q, S, ST, 'Basis', notes, url=V + VID, source_note=NOTE_AP)

q = Q()
q.sc('Vor dem Hören: Was bedeutet „the day the music died"?', ['Das Radio ging kaputt', 'Ein tragisches Ereignis, das für viele das Ende einer Musikepoche markierte', 'Ein Konzert wurde abgesagt', 'Ein Lied wurde verboten'], 1, 'Metapher für den Tod mehrerer Rockpioniere 1959.')
q.od('Bringe die Ebenen der Interpretation in sinnvolle Reihenfolge (konkret → abstrakt).', ['Zeitungsausträger erfährt von einem Unglück', 'Trauer um drei Musiker', 'Ende der unschuldigen Rock-’n’-Roll-Zeit', 'Wandel der US-Gesellschaft in den 1960ern'], 'Das Lied wird oft als Chronik des Wandels gelesen.')
q.mc('Welche Figuren/Bilder werden oft symbolisch gedeutet? (mehrere)', ['König, Königin, Narr (Jester)', 'Chevy am Damm', 'Eine Wetterstation', 'Quartett im Park'], [0, 1, 3], 'Viele Zeilen gelten als Chiffren für Musiker und Ereignisse.')
q.sc('Was zeigt das Lied über Erinnerung?', ['Sie ist immer objektiv', 'Sie ist emotional gefärbt und verklärt Vergangenes', 'Sie ist nutzlos', 'Sie ist unwichtig'], 1, 'Nostalgie schafft Mythen.')
q.sc('Welche Textform dominiert?', ['Erzählend mit Refrain', 'Dialog', 'Brief', 'Dramatischer Monolog'], 0, 'Strophen erzählen, Refrain bindet zusammen.')
q.mt('Verbinde Begriff und Bedeutung.', [('nostalgia', 'Sehnsucht nach der Vergangenheit'), ('metaphor', 'Bild im übertragenen Sinn'), ('era', 'Zeitalter'), ('mourning', 'Trauer')], 'Fachbegriffe für Interpretation.')
q.gf('Ergänze: used to / would / was / had.', 'When he was young, he [[a]] listen to the radio every night. He [[b]] dance with friends. Later he realised that the music [[c]] changed and nothing [[d]] the same.', [['used to'], ['would'], ['had'], ['was']], 'Verschiedene Vergangenheitsformen.')
q.tf('Die genaue Bedeutung aller Zeilen ist offiziell erklärt.', False, 'McLean hat nie jede Zeile erklärt; Deutungen sind offen.')
q.sc('Wie beeinflusst die Länge des Liedes die Wirkung?', ['Sie wirkt wie eine erzählte Chronik', 'Sie macht es nur ermüdend', 'Sie ist Zufall', 'Sie ist Vorgabe des Radios'], 0, 'Das Lied verläuft in Kapiteln.')
q.sc('Kontext: Welche Gruppe von Hörern fühlt sich besonders angesprochen?', ['Menschen, die die 60er erlebt haben', 'Nur Kinder', 'Nur Musiker', 'Niemand'], 0, 'Generationenerfahrung.')
q.sa('Nenne ein Wort für „Wehmut" (englisch).', ['nostalgia', 'wistfulness', 'melancholy'], 'nostalgia', 'Mehrere Wörter möglich.')
q.tf('Das Lied ist ein gutes Beispiel für Folk-Rock.', True, 'Gitarrengeführt, erzählend, später mit Band.')
notes = {'warmup': ['Bild-Impuls: Titelseite einer Zeitung von 1959. Was ist passiert?', 'Frage: Welches Ereignis markiert für eure Generation „das Ende einer Ära"?'],
         'steps': ['1. Kontext 1959 klären.', '2. Hören mit Suchauftrag: Bilder, Figuren.', '3. Interpretationsrunde.', '4. Sprachlicher Teil.'],
         'tips': ['Wikipedia/Songfacts zur Deutung als Hintergrundlektüre.', 'Lückentext privat importieren.'],
         'followUp': ['Welche Deutung überzeugt dich? Begründe in 100 Wörtern.', 'Schreibe die Chronik eines Ereignisses, das du erlebt hast, als „Song-Prosa".']}
pkg('american-pie-standard', 'American Pie · Standard', 'en', 'B2', 'Deutung des Klassikers: Kontext, Bilder, Erinnerung; Vergangenheitsformen und Fachbegriffe.', ['Musik', 'Geschichte', 'Interpretation'], song(VID), q, S, ST, 'Standard', notes, url=V + VID, source_note=NOTE_AP)

if __name__ == '__main__':
    write()
