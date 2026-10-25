from lib import *
V = 'https://www.youtube.com/watch?v='
NOTE = 'Offizielles Video beim Anbieter; Einbettbarkeit und Rechte vor dem Einsatz prüfen.'

# ---------------- DON'T LOOK BACK IN ANGER ----------------
S, ST, VID = 'dont-look-back', 'Don’t Look Back in Anger · Oasis', 'YZG7z4FOn0g'
q = Q()
q.sa('Vor dem Hören: Aus welcher Stadt kommt die Band Oasis? (ein Wort)', ['Manchester'], 'Manchester', 'Oasis wurde in Manchester gegründet.')
q.tf('Britpop war eine britische Musikrichtung der 1990er.', True, 'Oasis und Blur waren die bekanntesten Bands.')
q.sc('Beim Hören: Wie beginnt das Lied?', ['Mit einem Klavier', 'Mit Schlagzeug-Solo', 'Mit Dudelsack', 'A cappella'], 0, 'Das Klavier-Intro ist sehr bekannt.')
q.sc('Welche Grundbotschaft hat das Lied?', ['Man soll nicht im Zorn zurückblicken, sondern loslassen', 'Man soll immer streiten', 'Man soll auswandern', 'Man soll Rache nehmen'], 0, 'Der Titel ist selbst die Botschaft.')
q.mt('Wortschatz: Verbinde.', [('anger', 'Wut'), ('revolution', 'Umsturz, Wandel'), ('fade away', 'langsam verschwinden'), ('bloom', 'blühen')], 'Wörter aus dem Themenfeld.')
q.gf('Ergänze (look, never, anger, past).', 'Don’t [[a]] back in [[b]]. You should leave the [[c]] behind and [[d]] give up.', [['look'], ['anger'], ['past'], ['never']], 'Kernwörter des Liedes.')
q.sc('Wie klingt das Lied?', ['Hymnenhaft und mitsingbar', 'Wie Jazz', 'Wie Techno', 'Wie Oper'], 0, 'Britpop-Hymne.')
q.tf('Das Lied wurde nach dem Anschlag in Manchester 2017 bei Gedenkfeiern gesungen.', True, 'Es wurde zu einem Symbol des Zusammenhalts.')
q.sc('Welche Zeitform nutzt man für „du solltest loslassen"?', ['should', 'shall', 'would', 'might'], 0, 'should = Ratschlag.')
q.sc('Welche Geschichte erzählt das Lied konkret?', ['Eine klare Handlung', 'Bilder und Gedanken ohne feste Handlung', 'Ein Märchen', 'Ein Krimi'], 1, 'Der Text arbeitet mit Bildern und Anspielungen.')
q.tf('Nach dem Hören: Das Lied ist ein gutes Beispiel für einen Ohrwurm-Refrain.', True, 'Einfacher, einprägsamer Refrain.')
q.sa('Nenne ein Wort für „Wut" (englisch).', ['anger', 'rage', 'fury'], 'anger', 'Titelwort.')
notes = {'warmup': ['Bild: Skyline von Manchester. Was wisst ihr über die Stadt?', 'Frage: Wann ist es besser, etwas loszulassen?'],
         'steps': ['1. Kontext Britpop.', '2. Hören: Intro, Stimmung.', '3. Wortschatz.', '4. Gespräch über Loslassen.'],
         'tips': ['Gut kombinierbar mit Aktualität (Anschlag 2017) – sensibel behandeln.', 'Lückentext privat importieren.'],
         'followUp': ['Worüber solltest du „nicht im Zorn zurückblicken"? Schreibe drei Sätze.']}
pkg('dlbia-standard', 'Don’t Look Back in Anger · Standard', 'en', 'B1', 'Thema und Stimmung des Britpop-Klassikers; Wortschatz zu Gefühlen und Ratschlägen.', ['Musik', 'Britpop', 'Gefühle'], song(VID), q, S, ST, 'Standard', notes, url=V + VID, source_note=NOTE)

q = Q()
q.sc('Welche Textebene dominiert?', ['Bildhaft, assoziativ', 'Wörtliche Reportage', 'Gebrauchsanweisung', 'Dialog'], 0, 'Surreale, offene Bilder statt eindeutiger Handlung.')
q.mc('Welche Wirkungen erzeugt das Klavier-Intro? (mehrere)', ['Feierlichkeit', 'Wiedererkennung', 'Anspannung wie im Thriller', 'Nähe zu klassischen Popballaden'], [0, 1, 3], 'Das Intro erinnert an bekannte Klavierballaden.')
q.sc('Warum eignet sich der Refrain zum Mitsingen?', ['Er ist kurz, wiederholt und stark betont', 'Er ist sehr leise', 'Er ist auf Latein', 'Er ist improvisiert'], 0, 'Einfachheit und Wiederholung schaffen Gemeinschaft.')
q.mt('Verbinde Begriff und Funktion.', [('Refrain', 'wiederkehrende Kernbotschaft'), ('Strophe', 'Bilder und Entwicklung'), ('Bridge', 'Übergang/Kontrast'), ('Outro', 'Ausklang')], 'Songstruktur-Begriffe.')
q.sc('Was bedeutet das Verb „to fade"?', ['verblassen', 'verbrennen', 'verstecken', 'verändern'], 0, 'to fade = verblassen.')
q.gf('Conditionals: Ergänze.', 'If you [[a]] back in anger, you will not move on. If you had let go earlier, you [[b]] have been happier.', [['look'], ['would']], 'Type 1 und Type 3.')
q.sc('Welche Haltung wird im Text eingenommen?', ['Versöhnlich und nach vorn gerichtet', 'Radikal und rachsüchtig', 'Gleichgültig', 'Ironisch'], 0, 'Optimistische Grundhaltung.')
q.tf('Das Lied steht für eine Generation, die gegen starre Verhältnisse protestiert.', True, 'Britpop als Lebensgefühl der 90er.')
q.sc('Welche Rolle spielt Mehrdeutigkeit im Text?', ['Sie lädt zu persönlichen Deutungen ein', 'Sie macht das Lied schlechter', 'Sie ist ein Fehler', 'Sie verhindert Mitsingen'], 0, 'Offene Bilder = Identifikation.')
q.tf('Das Lied wird heute nur noch selten gespielt.', False, 'Es ist bis heute ein Hit und wird bei Konzerten oft gemeinsam gesungen.')
q.sa('Nenne ein englisches Wort für „loslassen" (z. B. let …).', ['let go', 'letgo', 'release'], 'let go', 'to let go = loslassen.')
q.sc('Wie wirkt die Wiederholung des Titels im Lied?', ['Sie verstärkt die Botschaft', 'Sie ist Füllmaterial', 'Sie verwirrt', 'Sie ist verboten'], 0, 'Wiederholung als rhetorisches Mittel.')
notes = {'warmup': ['Kontext: Britpop vs. Grunge. Welche Bands kennt ihr?', 'Warum werden bestimmte Lieder zu „Hymnen"?'],
         'steps': ['1. Hören mit Fokus Struktur.', '2. Interpretation von Bildern.', '3. Grammatik (Conditionals).', '4. Diskussion.'],
         'tips': ['Bezug zu Gedenkfeiern kann tiefgehend sein; sensibel einführen.'],
         'followUp': ['Analysiere den Refrain: Warum funktioniert er?', 'Schreibe einen Kommentar: Kann Musik wirklich heilen?']}
pkg('dlbia-vertiefung', 'Don’t Look Back in Anger · Vertiefung', 'en', 'B2', 'Bildsprache, Struktur und Wirkung der Hymne; Conditionals und Fachbegriffe.', ['Musik', 'Analyse', 'Britpop'], song(VID), q, S, ST, 'Vertiefung', notes, url=V + VID, source_note=NOTE)

# ---------------- FAIRYTALE OF NEW YORK ----------------
S, ST, VID = 'fairytale-of-new-york', 'Fairytale of New York · The Pogues', 'j9jbdgZidu8'
NOTE_F = 'Offizielles Video beim Anbieter. Das Lied enthält beleidigende Wörter; im Radio gibt es bearbeitete Fassungen. Vor dem Einsatz Fassung und Eignung prüfen.'
q = Q()
q.tf('Vor dem Hören: „Fairytale of New York" ist ein Weihnachtslied.', True, 'Es spielt an Heiligabend.')
q.sc('Beim Hören: Wo beginnt die Geschichte?', ['In einer Zelle (Ausnüchterungszelle)', 'In einer Schule', 'In einem Flugzeug', 'In einem Restaurant'], 0, 'Der Erzähler beginnt in der Ausnüchterungszelle der Polizei.')
q.sc('Wer singt abwechselnd?', ['Ein Mann und eine Frau', 'Zwei Männer', 'Ein Kinderchor', 'Nur ein Chor'], 0, 'Ein Streitgespräch mit Duett.')
q.sc('Wie ist die Stimmung?', ['Zwischen Streit und Nostalgie', 'Nur lustig', 'Nur gruselig', 'Nur langweilig'], 0, 'Mal zärtlich, mal bissig.')
q.mt('Wortschatz: Verbinde.', [('Christmas Eve', 'Heiligabend'), ('dream', 'Traum'), ('argue', 'streiten'), ('immigrant', 'Einwanderer')], 'Schlüsselbegriffe.')
q.tf('Das Paar hat viel Geld und lebt luxuriös.', False, 'Die Geschichte erzählt von Armut und enttäuschten Träumen.')
q.sc('Welche Stadt steht im Titel?', ['New York', 'London', 'Dublin', 'Boston'], 0, 'Der Titel nennt New York.')
q.gf('Ergänze (Christmas, dream, fight, memory).', 'It is [[a]] Eve. The couple remembers a [[b]] and a [[c]] from the past, but also a happy [[d]].', [['Christmas'], ['dream'], ['fight'], ['memory']], 'Wortfeld Weihnachten und Erinnerung.')
q.sc('Welche Musik bestimmt das Lied?', ['Irischer Folk/Punk mit Klavier', 'Heavy Metal', 'Techno', 'Reggae'], 0, 'The Pogues sind eine irische Folk-Punk-Band.')
q.tf('Das Lied hat bis heute einen festen Platz in britischen Weihnachtsplaylists.', True, 'Es kehrt jedes Jahr in die Charts zurück.')
q.sc('Welcher Aspekt macht das Lied kontrovers?', ['Manche Wörter im Text sind beleidigend', 'Das Tempo', 'Die Länge', 'Der Titel'], 0, 'Einige Zeilen wurden in Radiofassungen verändert.')
q.sa('Wie heißt die Band? (englisch, ein Wort + Nachname-Wort)', ['The Pogues', 'Pogues'], 'The Pogues', 'Irische Band mit Sänger Shane MacGowan.')
notes = {'warmup': ['Bild: Weihnachtsmarkt vs. Gefängniszelle. Welche Geschichte passt?', 'Frage: Kennt ihr Weihnachtslieder, die nicht ganz fröhlich sind?'],
         'steps': ['1. Titel und Erwartung.', '2. Hören in Abschnitten.', '3. Wortschatz.', '4. Fassungen und Zensur besprechen.'],
         'tips': ['Ausgang: „Streitlied" – Abstand wahren, nicht stereotyp verwenden.', 'Ältere Klassen: Diskussion über Sprache im Wandel.'],
         'followUp': ['Wie wirkt die Mischung aus Streit und Zärtlichkeit auf dich?', 'Schreibe einen kurzen Dialog des Paares am nächsten Morgen.']}
pkg('fairytale-standard', 'Fairytale of New York · Standard', 'en', 'B1', 'Handlung, Stimmung und Wortschatz eines ungewöhnlichen Weihnachtsliedes.', ['Musik', 'Weihnachten', 'Beziehungen'], song(VID), q, S, ST, 'Standard', notes, url=V + VID, source_note=NOTE_F)

q = Q()
q.sc('Welche Erzählstruktur nutzt das Lied?', ['Wechselgesang mit Rückblenden', 'Chronologischer Bericht', 'Monolog', 'Brief'], 0, 'Ein Streitgespräch mit Erinnerungen.')
q.mc('Welche Themen sind zentral? (mehrere)', ['Armut', 'Enttäuschte Träume', 'Sucht', 'Liebe trotz Konflikt', 'Reichtum'], [0, 1, 2, 3], 'Soziales Realismus-Bild.')
q.sc('Welche Rolle spielt Irland im Text?', ['Auswanderer-Erfahrung', 'Urlaubsziel', 'Fußball', 'Sprache'], 0, 'Irische Einwanderer in New York.')
q.sc('Wie zeigt sich die Doppelbödigkeit?', ['Weihnachtsstimmung trifft auf harte Wirklichkeit', 'Nur Humor', 'Nur Tragik', 'Beliebig'], 0, 'Kontrast als Stilmittel.')
q.tf('Beide Figuren sind eindeutig gut oder böse.', False, 'Beide haben Stärken und Fehler.')
q.sc('Welche Funktion hat der Dialog?', ['Er macht den Konflikt lebendig', 'Er füllt Zeit', 'Er ist zufällig', 'Er ist nur Gesang'], 0, 'Direkte Rede erzeugt Nähe.')
q.gf('Reported Speech: Ergänze.', 'He said that he [[a]] dreaming of a better life. She told him that he [[b]] a failure, but later she admitted that she [[c]] still loved him.', [['was'], ['was'], ['had']], 'Backshift.')
q.mt('Verbinde Begriff und Bedeutung.', [('irony', 'Gegensatz zwischen Gesagtem und Gemeintem'), ('nostalgia', 'Sehnsucht nach früheren Zeiten'), ('conflict', 'Streit/Gegensatz'), ('resignation', 'Aufgeben, Hinnehmen')], 'Interpretationsvokabular.')
q.sc('Warum ist die Sprachwahl im Lied umstritten?', ['Einige Wörter gelten heute als beleidigend', 'Die Sprache ist zu einfach', 'Der Dialekt ist unbekannt', 'Es gibt keine Kritik'], 0, 'Sprachwandel und Verantwortung.')
q.tf('Dass das Lied in Radiofassungen verändert wurde, zeigt Sprachwandel.', True, 'Gesellschaftliche Normen ändern sich.')
q.sa('Nenne ein Adjektiv für die Stimmung (englisch).', ['bittersweet', 'melancholic', 'nostalgic', 'tense'], 'bittersweet', 'Gegensatz von süß und bitter.')
q.sc('Was kritisiert der Text implizit?', ['Soziale Not und zerplatzte Träume', 'Weihnachtseinkäufe', 'Wetter', 'Mode'], 0, 'Reflektiert Lebensrealitäten.')
notes = {'warmup': ['Impuls: Gegensatz „Fairytale" vs. Realität. Was erwartet ihr?', 'Warum sind Weihnachtslieder oft kitschig?'],
         'steps': ['1. Titel analysieren.', '2. Hören und Bilder sammeln.', '3. Sprachliche Analyse.', '4. Diskussion zu Sprache und Zensur.'],
         'tips': ['Bei Diskussion Offenheit für verschiedene Meinungen.'],
         'followUp': ['Schreibe einen Kommentar zur Debatte um Radiofassungen.', 'Vergleiche das Lied mit einem klassischen Weihnachtslied.']}
pkg('fairytale-vertiefung', 'Fairytale of New York · Vertiefung', 'en', 'B2', 'Analyse von Erzählform, Kontrast und Sprachwandel; Reported Speech und Fachbegriffe.', ['Musik', 'Analyse', 'Sprache'], song(VID), q, S, ST, 'Vertiefung', notes, url=V + VID, source_note=NOTE_F)

# ---------------- LAY ALL YOUR LOVE ON ME ----------------
S, ST, VID = 'lay-all-your-love', 'Lay All Your Love On Me · ABBA', 'CQKyLOQPTPo'
q = Q()
q.tf('Vor dem Hören: ABBA kommt aus Schweden.', True, 'Die Band wurde in Stockholm gegründet.')
q.mt('Wortschatz vorab: Verbinde.', [('jealous', 'eifersüchtig'), ('threat', 'Bedrohung'), ('careless', 'sorglos'), ('beg', 'bitten, flehen')], 'Vokabeln aus den Aufgaben.')
q.sc('Beim Hören: Wie fühlt sich die Erzählerin?', ['Verliebt und etwas unsicher', 'Müde', 'Wütend auf alle', 'Gelangweilt'], 0, 'Neue Gefühle bringen Angst und Eifersucht.')
q.tf('Die Erzählerin war immer eifersüchtig.', False, 'Früher war sie es nicht – das hat sich geändert.')
q.sc('Was sagt sie über sich selbst?', ['Sie ist ungewohnt eifersüchtig geworden', 'Sie ist sehr reich', 'Sie reist viel', 'Sie ist müde von der Arbeit'], 0, 'Die Verliebtheit verändert sie.')
q.sc('Welche Musikrichtung?', ['Disco-Pop', 'Heavy Metal', 'Country', 'Klassik'], 0, 'Tanzbarer Pop mit starkem Bass.')
q.gf('Ergänze (jealous, love, fear, dear).', 'She feels [[a]] and in [[b]]. She asks her [[c]] for more attention and feels [[d]] when he is away.', [['jealous'], ['love'], ['dear'], ['fear']], 'Gefühlswörter.')
q.sc('Wie heißt der Song richtig?', ['Lay All Your Love On Me', 'Lay All Your Love Off Me', 'Say All Your Love On Me', 'Lay Down Your Love'], 0, 'Der Titel fordert: „Leg all deine Liebe auf mich."')
q.tf('Das Lied erschien 1980.', True, 'Es stammt vom Album „Super Trouper".')
q.sc('Welches Wort bedeutet „Bedrohung"?', ['threat', 'trade', 'trap', 'train'], 0, 'threat.')
q.sa('Wie heißt die Band? (ein Wort)', ['ABBA', 'Abba'], 'ABBA', 'Aus den Anfangsbuchstaben der vier Mitglieder.')
notes = {'warmup': ['Frage: Wann wart ihr zum ersten Mal richtig eifersüchtig? Gefühl beschreiben.', 'Bild: Disco-Kugel / 80er.'],
         'steps': ['1. Wortschatz.', '2. Hören: Gefühle sammeln.', '3. Wörter einsetzen.', '4. Nachdenken: Passen Musik und Text zusammen?'],
         'tips': ['Das Lied hat einen starken Kontrast zwischen fröhlicher Musik und besorgtem Text – gut für Diskussion.'],
         'followUp': ['Warum klingt traurige Eifersucht hier so tanzbar?', 'Schreibe zwei Sätze über Gefühle, die du schwer beschreiben kannst.']}
pkg('layall-basis', 'Lay All Your Love On Me · Basis', 'en', 'B1', 'Gefühle und Wortschatz in einem Disco-Klassiker verstehen.', ['Musik', 'Gefühle', 'ABBA'], song(VID), q, S, ST, 'Basis', notes, url=V + VID, source_note=NOTE)

q = Q()
q.sc('Welcher Gegensatz prägt das Lied?', ['Tanzbare Musik und besorgter Text', 'Laute Musik und Stille', 'Langsames Tempo und schneller Text', 'Jazz und Metal'], 0, 'Klang und Inhalt widersprechen sich bewusst.')
q.mc('Welche Gefühle zeigt der Text? (mehrere)', ['Eifersucht', 'Verletzlichkeit', 'Gleichgültigkeit', 'Angst vor Verlust', 'Stolz'], [0, 1, 3], 'Verliebtheit macht verletzlich.')
q.sc('Was bedeutet „to lay love on someone" sinngemäß?', ['Liebe zeigen und geben', 'Liebe verstecken', 'Liebe verkaufen', 'Liebe vergessen'], 0, 'Sinngemäß: „Schenk mir deine ganze Zuneigung."')
q.sc('Welcher lateinische Wortstamm steckt hinter „vice" (Laster)?', ['vitium (Fehler)', 'vita (Leben)', 'vinum (Wein)', 'victor (Sieger)'], 0, 'vice kommt von lat. vitium.')
q.gf('Ergänze die Wörter (potential, possessive, overturn, unsatisfied).', 'She admits that she has become [[a]]. Every other woman looks like a [[b]] danger. Her old rules [[c]], and she feels [[d]] when he is away.', [['possessive'], ['potential'], ['overturn'], ['unsatisfied']], 'Wortschatz für Gefühle in Beziehungen.')
q.mt('Verbinde Wort und Bedeutung.', [('possessive', 'besitzergreifend'), ('vulnerable', 'verletzlich'), ('devotion', 'Hingabe'), ('overturn', 'umwerfen')], 'Zentrale Begriffe.')
q.tf('Die Erzählerin hatte schon vorher viele leidenschaftliche Beziehungen.', False, 'Sie sagt sinngemäß, dass frühere Affären kurz und selten waren.')
q.sc('Welche Perspektive nimmt das Lied ein?', ['Ich-Perspektive', 'Allwissender Erzähler', 'Zweite Person', 'Dritte Person'], 0, 'Ich-Erzählerin.')
q.sc('Wie wirkt der Refrain?', ['Er ist ein dringender Appell', 'Er ist ein Befehl an alle', 'Er erzählt Geschichte', 'Er ist stumm'], 0, 'Bitte und Forderung zugleich.')
q.sa('Nenne zwei Synonyme für „jealous" (englisch, eines reicht).', ['envious', 'possessive', 'suspicious'], 'envious', 'Mehrere sind möglich.')
q.tf('Nach dem Hören: Der Text zeigt, dass Liebe auch Unsicherheit bedeuten kann.', True, 'Das ist die Kernbotschaft.')
notes = {'warmup': ['Hörimpuls: Die Musik ohne Text – wie fühlt sie sich an? Danach Text.', 'Frage: Wie klingen Lieder über Eifersucht normalerweise?'],
         'steps': ['1. Musikalischer Eindruck.', '2. Textebene.', '3. Vokabeln, Etymologie (vice).', '4. Interpretation.'],
         'tips': ['Latein-Hinweis: Wortschatz über Wortfamilien erschließen.'],
         'followUp': ['Schreibe eine kurze Interpretation (100 Wörter).', 'Vergleiche mit einem modernen Lied zu Eifersucht.']}
pkg('layall-standard', 'Lay All Your Love On Me · Standard', 'en', 'B2', 'Kontrast zwischen Musik und Text, Wortschatz und Etymologie.', ['Musik', 'Gefühle', 'Sprache'], song(VID), q, S, ST, 'Standard', notes, url=V + VID, source_note=NOTE)

if __name__ == '__main__':
    write()
