from lib import *
V = 'https://www.youtube.com/watch?v='

# ---------------- STAN ----------------
S, ST = 'stan', 'Stan · Eminem feat. Dido'
VID = 'gOMhN-hfMtY'
note_stan = 'Offizielle Eminem-Version beim Anbieter. Explizite Fassung: für jüngere Klassen die bereinigte Fassung wählen oder nur die Anfangsminuten zeigen.'

q = Q()
q.tf('Vor dem Hören: Hör nur die ersten zehn Sekunden. Der Anfang klingt eher ruhig und traurig als fröhlich.', True, 'Regen, Klavier und eine ruhige Frauenstimme erzeugen eine gedrückte Stimmung.')
q.sc('Beim Hören: Wer schreibt in dem Lied Briefe?', ['Ein großer Fan', 'Ein Lehrer', 'Eine Postbotin', 'Ein Polizist'], 0, 'Stan ist ein Fan des Rappers und schreibt ihm mehrmals.')
q.sc('An wen sind die Briefe gerichtet?', ['An seine Mutter', 'An den Rapper (Slim)', 'An einen Freund aus der Schule', 'An eine Zeitung'], 1, 'Stan spricht den Rapper mit dem Namen Slim an.')
q.sc('Was wünscht sich Stan von dem Rapper?', ['Geld', 'Eine Antwort', 'Ein Haus', 'Ein neues Handy'], 1, 'Er wartet auf Post oder einen Anruf und wird immer unruhiger, weil nichts kommt.')
q.tf('Stan schreibt nur einen einzigen Brief.', False, 'Es sind mehrere Briefe; mit jedem wird Stan ungeduldiger.')
q.od('Bring die Stimmung von Stan in die richtige Reihenfolge (erst ... dann ...).', ['Er ist neugierig und freundlich', 'Er wartet und wird enttäuscht', 'Er wird wütend', 'Er trifft eine schlimme Entscheidung'], 'So verändert sich Stans Haltung von Brief zu Brief.')
q.mt('Ordne zu: Was passt zu welchem Brief?', [('Brief 1', 'freundlich, erzählt von sich'), ('Brief 2', 'enttäuscht, weil keine Antwort kommt'), ('Brief 3', 'sehr wütend und gefährlich')], 'Die Briefe werden Schritt für Schritt dunkler.')
q.sa('Wie heißt der kleine Bruder, den Stan erwähnt? (ein Wort)', ['Matthew'], 'Matthew', 'Der Bruder ist erst sechs Jahre alt; Stan sagt, ein Autogramm für ihn wäre schön gewesen.')
q.sc('Warum ist Stan so enttäuscht?', ['Er hat sein Telefon verloren', 'Der Rapper hat ihm nicht geantwortet und kein Autogramm gegeben', 'Das Konzert war abgesagt', 'Seine Freundin ist weggezogen'], 1, 'Stan fühlt sich von seinem Idol nicht ernst genommen.')
q.tf('Am Ende antwortet der Rapper – aber zu spät.', True, 'Slim schreibt zurück und gibt freundliche Ratschläge; da ist die Geschichte schon schlimm ausgegangen.')
q.gf('Wortschatz: Ergänze das englische Wort (Hilfe: fan, letter, wait, angry).', 'Stan is a big [[a]] of the rapper. He writes a [[b]] and has to [[c]] for an answer. In the end he is very [[d]].', [['fan'], ['letter'], ['wait'], ['angry']], 'Die vier Schlüsselwörter der Geschichte.')
q.mt('Wortschatz: Verbinde Wort und Bedeutung.', [('fan', 'Person, die jemanden sehr bewundert'), ('autograph', 'Unterschrift einer berühmten Person'), ('ignore', 'nicht beachten'), ('pregnant', 'schwanger')], 'Diese Wörter kommen im Lied vor oder gehören zur Geschichte.')
q.sc('Wortschatz: „He ignored my letters" bedeutet …', ['Er hat die Briefe gelesen.', 'Er hat die Briefe nicht beachtet.', 'Er hat die Briefe verbrannt.', 'Er hat die Briefe geliebt.'], 1, 'to ignore = nicht beachten.')
q.tf('Nach dem Hören: Das Lied ist eine echte, wahre Geschichte über einen bestimmten Fan.', False, 'Die Geschichte ist erfunden; sie zeigt, was passieren kann, wenn Bewunderung zu Besessenheit wird.')
q.sc('Wie ist die Stimmung am Ende des Liedes?', ['Fröhlich und lustig', 'Traurig und bedrückend', 'Wie ein Partylied', 'Langweilig'], 1, 'Die Geschichte endet tragisch.')
q.sc('Welche Aufgabe hat Dido in dem Lied?', ['Sie rappt die Strophen', 'Sie singt den ruhigen Refrain', 'Sie ist die Freundin im Video', 'Sie schreibt den Brief'], 1, 'Ihr Gesang kommt aus einem eigenen Lied und gibt der Geschichte Ruhe und Trauer.')
notes = {'warmup': ['Höre die ersten zehn Sekunden. Was für eine Geschichte erwartest du? Sammle drei Adjektive.',
                    'Was bedeutet es, ein „Fan" zu sein? Wann wird Bewunderung zu viel?'],
         'steps': ['1. Erste zehn Sekunden hören, Erwartungen sammeln (Partnerarbeit).', '2. Lied einmal komplett hören: Wer schreibt wem? (Aufgaben 2–4)', '3. Zweites Hören: Stimmung und Briefe ordnen (5–7).', '4. Wortschatz und Auswertung; zum Schluss das Video ansehen und mit den eigenen Bildern vergleichen.'],
         'tips': ['Thema Gewalt und Suizid vorab ansprechen und Ausstiegsmöglichkeit anbieten.', 'Bei Klasse 7 nur bereinigte Fassung; das Ende zusammen besprechen statt allein lesen lassen.'],
         'followUp': ['Wie fühlst du dich nach dem Lied? Schreibe zwei Sätze.', 'Gibt es ein Lied, das du deiner Klasse vorstellen möchtest? Erstelle ein kurzes Arbeitsblatt.']}
pkg('stan-basis', 'Stan · Basis (Kl. 7)', 'en', 'A2', 'Ein Lied über einen Fan, der auf Antwort wartet: Handlung verstehen, Stimmung erkennen, einfache Wörter üben.',
    ['Musik', 'Briefe', 'Fans'], song(VID), q, S, ST, 'Basis', notes, url=V + VID, source_note=note_stan, tags=['musik'])

q = Q()
q.sa('Vor dem Hören: Wie wirkt der Anfang des Liedes auf dich? Nenne ein passendes Adjektiv (z. B. gloomy).', ['gloomy', 'sad', 'melancholic', 'calm', 'dark', 'quiet'], 'gloomy / sad', 'Regen, Klavier und die ruhige Stimme erzeugen eine bedrückte Stimmung.')
q.mt('Beim Hören: Ordne die Personen den Rollen zu.', [('Stan', 'schreibt die Briefe'), ('Slim', 'der Rapper, an den die Briefe gehen'), ('Matthew', 'Stans kleiner Bruder'), ('Dido', 'singt den ruhigen Refrain')], 'Das sind die wichtigsten Figuren und Stimmen.')
q.od('Bring die Ereignisse in die richtige Reihenfolge.', ['Stan schreibt freundlich und erzählt von sich', 'Er ist enttäuscht, weil keine Antwort kommt', 'Er wirft dem Rapper vor, seine Fans zu ignorieren', 'Er nimmt eine Kassette auf und fährt los', 'Slim antwortet'], 'So entwickelt sich die Geschichte.')
q.sc('Was macht Stan in seinem dritten Brief?', ['Er bedankt sich', 'Er spricht auf eine Kassette, während er betrunken Auto fährt', 'Er schlägt ein Treffen vor', 'Er bittet um Geld'], 1, 'Der dritte „Brief" ist eine Tonaufnahme; das Auto spielt am Ende eine tödliche Rolle.')
q.tf('Stan erreicht sein Ziel: Er trifft den Rapper persönlich.', False, 'Sie begegnen sich nie; Slims Antwort kommt zu spät.')
q.sc('Wer hat Stan nach seinem Verständnis im Stich gelassen?', ['Seine Eltern', 'Sein Idol', 'Seine Lehrerin', 'Die Polizei'], 1, 'Er sieht sich vom Idol ignoriert.')
q.mc('Welche Gefühle zeigt Stan im Verlauf des Liedes? (mehrere)', ['Bewunderung', 'Enttäuschung', 'Wut', 'Langeweile', 'Verzweiflung'], [0, 1, 2, 4], 'Von Begeisterung zu Verzweiflung; Langeweile kommt nicht vor.')
q.sc('Welche Textsorte spielt in dem Lied die wichtigste Rolle?', ['Rezept', 'Brief', 'Tagebuch', 'Zeitungsartikel'], 1, 'Die ganze Handlung wird durch Briefe erzählt.')
q.gf('Wortschatz: Setze passende Wörter ein (obsessed, admire, ignore, upset).', 'Stan is [[a]] with the rapper. He used to [[b]] him, but now he feels [[c]] because the rapper seems to [[d]] his letters.', [['obsessed'], ['admire'], ['upset'], ['ignore']], 'Wörter für Gefühle und Handlungen.')
q.mt('Wortschatz: Verbinde Wort und Bedeutung.', [('idol', 'Person, die man sehr bewundert'), ('disappointed', 'enttäuscht'), ('autograph', 'Unterschrift'), ('desperate', 'verzweifelt'), ('obsessed', 'von etwas besessen')], 'Typische Wörter, um Stans Haltung zu beschreiben.')
q.sc('Welches Wort passt zu „He sent three letters but nobody answered"?', ['grateful', 'ignored', 'proud', 'relieved'], 1, 'Er fühlt sich ignoriert.')
q.sc('Kontrolliere: „Stan wrote to the rapper because he …"', ['wanted to sell something', 'admired him', 'was his neighbour', 'needed a job'], 1, 'Motiv der Briefe ist Bewunderung.')
q.tf('Nach dem Hören: Das Video erzählt die Geschichte genauso wie der Text, ohne zusätzliche Informationen.', False, 'Das Video zeigt zusätzliche Szenen (Stans Zimmer, sein Umfeld), die im Text nur angedeutet werden.')
q.sc('Das Lied benutzt ein Sample aus einem anderen Lied. Was bewirkt es?', ['Es macht das Lied lustig', 'Es gibt dem Rap eine ruhige, traurige Gegenstimme', 'Es erzählt die Geschichte weiter', 'Es soll nur Platz füllen'], 1, 'Der ruhige Gesang kontrastiert mit der Wut im Rap.')
q.tf('Das Lied ist heute noch aktuell: Auch Influencer und Fans erleben ähnliche Beziehungen.', True, 'Stichwort parasoziale Beziehung – einseitige Bindung an Prominente.')
notes = {'warmup': ['Erwartung: Nur die ersten zehn Sekunden hören. Worum könnte es gehen?', 'Wie reagieren Fans, wenn Idole nicht antworten? Beispiele aus Social Media?'],
         'steps': ['1. Hörerwartung (10 Sekunden).', '2. Globalverstehen: Figuren und Handlung (Aufgaben 2–4).', '3. Detail: Reihenfolge und Gefühle (3, 7).', '4. Wortschatz, dann Video mit Bleep-Version vergleichen und über Zensur sprechen.'],
         'tips': ['Auf Themen Gewalt und Suizid vorbereiten; Gesprächsangebot machen.', 'Als Lernprodukt: Antwortbrief von Stans Mutter schreiben lassen.'],
         'followUp': ['Charakterisiere Stan in 5 Sätzen.', 'Das Video verwendet eine bereinigte Fassung: Wie findest du das? Begründe.', 'Schreibe einen Brief von Stans Mutter an Slim.']}
pkg('stan-standard', 'Stan · Standard (Kl. 9/10)', 'en', 'B1', 'Handlung, Figuren und Wirkung des Liedes: Reihenfolge, Gefühle, Wortschatz zu Fan-Verhalten.',
    ['Musik', 'Briefe', 'Fans', 'Social Media'], song(VID), q, S, ST, 'Standard', notes, url=V + VID, source_note=note_stan)

q = Q()
q.sa('Vor dem Hören: Warum sind Intro und Gesang im Kontrast zum Rap wirksam? Nenne ein Schlüsselwort (contrast, tension, calm …).', ['contrast', 'tension', 'calm', 'irony'], 'contrast / tension', 'Das Sample liefert einen Gegenpol zum aufgebrachten Rap.')
q.od('Rekonstruiere den Erzählbogen.', ['Begeisterung (Brief 1)', 'Verunsicherung und Ungeduld (Brief 2)', 'Wut und Eskalation (Brief 3)', 'Slims Antwort kommt zu spät', 'Rückblick: Stans Geschichte als Warnung'], 'Briefroman im Lied; die Wendepunkte markieren Schritte der Eskalation.')
q.sc('Welche Funktion hat der Brief Slims am Ende?', ['Er löst den Konflikt', 'Er zeigt die Tragik des Missverständnisses', 'Er ist reiner Spaß', 'Er erklärt das Lied'], 1, 'Der freundliche Brief steht im Kontrast zur Katastrophe: zu spät, zu wenig.')
q.mc('Welche Stilmittel fallen auf? (mehrere)', ['Briefform', 'Ich-Erzähler', 'Rhetorische Fragen', 'Parallelismus', 'Dialogische Struktur'], [0, 1, 2, 4], 'Briefform und Ich-Perspektive dominieren; Fragen und Anreden an Slim erzeugen Nähe.')
q.sc('Welche Beziehung beschreibt der Begriff „parasocial relationship"?', ['Freundschaft unter Kollegen', 'Einseitige emotionale Bindung an eine bekannte Person', 'Streit zwischen Nachbarn', 'Geschäftsbeziehung'], 1, 'Fans fühlen sich verbunden, die berühmte Person kennt sie aber nicht.')
q.sc('Welche Rolle spielt die Perspektive des Ich-Erzählers?', ['Sie macht die Geschichte glaubwürdiger und intimer', 'Sie macht den Text objektiv', 'Sie ersetzt den Refrain', 'Sie zeigt nur Slims Sicht'], 0, 'Man erlebt alles aus Stans Sicht, sieht aber auch, was er nicht sieht.')
q.gf('Reported Speech: Ergänze (had written, hadn’t answered, would reply, was).', 'Stan said that he [[a]] to Slim several times, but Slim [[b]]. He hoped Slim [[c]] soon. He added that his girlfriend [[d]] pregnant.', [['had written'], ['hadn’t answered', 'had not answered'], ['would reply'], ['was']], 'Backshift: Present → Past, Past → Past Perfect, will → would.')
q.sc('Conditional: „If Slim had answered earlier, Stan … feel better."', ['would', 'would have', 'will', 'had'], 1, 'Third conditional: if + Past Perfect, would have + Participle.')
q.mt('Synonyme: Verbinde passende Paare.', [('devoted', 'loyal'), ('angry', 'furious'), ('ignored', 'overlooked'), ('obsessed', 'fixated')], 'Wörter zur Beschreibung von Stans Zustand.')
q.mt('Antonyme: Verbinde Gegensatzpaare.', [('devoted', 'indifferent'), ('angry', 'calm'), ('ignored', 'noticed'), ('obsessed', 'detached')], 'Gegensätze helfen, Nuancen zu erkennen.')
q.sc('Welche Aussage fasst die gesellschaftliche Kritik des Liedes am besten zusammen?', ['Berühmte Menschen sind unfreundlich.', 'Intensive Fan-Bindung kann gefährlich werden, wenn keine Grenzen existieren.', 'Briefe sind veraltet.', 'Musik sollte nie traurig sein.'], 1, 'Der Text warnt vor Eskalation durch Idealisierung und Ausbleiben von Zuwendung.')
q.tf('Das Sample aus einem fremden Lied wirkt nur dekorativ und hat keine inhaltliche Funktion.', False, 'Es setzt einen Gefühlsrahmen und verstärkt die Tragik.')
q.sc('Welche Veränderung der Medienlandschaft seit 2000 verschärft das Thema?', ['Social Media erleichtert scheinbaren Kontakt zu Stars', 'Briefe sind schneller geworden', 'Radios sind verschwunden', 'Konzerte sind kostenlos'], 0, 'Direktnachrichten, Livestreams und Kommentare erzeugen Nähe – und Erwartungen.')
q.tf('Das Video ergänzt Informationen, die der Text nicht liefert.', True, 'Bilder zeigen Umfeld und Details, die den Text deuten.')
notes = {'warmup': ['Erwartungen zum Titel und zu den ersten Sekunden notieren.', 'Warum können Beziehungen zu Prominenten problematisch werden?'],
         'steps': ['1. Hören und Plot-Aufgabe (2–3).', '2. Zweites Hören: Stilmittel und Perspektive.', '3. Grammatikblock: Reported Speech, Conditionals.', '4. Rechercheauftrag: parasoziale Beziehung, Vergleich mit Influencern; Rollenspiel Stan–Slim.'],
         'tips': ['Gut kombinierbar mit Briefform (Letter writing) und Stilanalyse.', 'Hinweis auf sensible Themen; keine Vertiefung der Gewaltdetails nötig.'],
         'followUp': ['Schreibe Stans Brief ein Jahr später aus seiner Sicht (hypothetisch).', 'Diskutiere in Gruppen: Welche Verantwortung haben Stars gegenüber Fans?', 'Recherchiere „parasocial relationships" und präsentiere kurz.']}
pkg('stan-vertiefung', 'Stan · Vertiefung (Oberstufe)', 'en', 'B2', 'Analyse von Erzählform, Stilmitteln und Wirkung; Grammatik (Reported Speech, Conditionals) und Wortschatz im Kontext.',
    ['Musik', 'Analyse', 'Fans', 'Medienkritik'], song(VID), q, S, ST, 'Vertiefung', notes, url=V + VID, source_note=note_stan)

if __name__ == '__main__':
    write()
