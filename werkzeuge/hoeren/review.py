"""Fachliche Überarbeitung der Lied-/Film-Pakete (Stand 25.10.2026).
Regeln: keine Meinungs-/Selbstauskunftsfragen mit „richtiger“ Antwort, keine Methoden-Reihenfolgen,
keine Frage, die nur Allgemeinwissen oder Albernes prüft, nichts nicht Belegbares.
Neue Aufgaben nur zu überprüfbaren Fakten (Quellen siehe sources/reviewNotes)."""
from lib import Q, PK

DROP = {
 '50special-base': ['q2', 'q8', 'q9', 'q15'],
 '50special-avanzata': ['q7', 'q8', 'q9', 'q12', 'q13'],
 'american-pie-basis': ['q11'],
 'american-pie-standard': ['q9', 'q10'],
 'ceancoradomani-avanzata': ['q11', 'q12'],
 'dlbia-standard': ['q9', 'q11'],
 'dlbia-vertiefung': ['q8', 'q10', 'q12'],
 'dlu-basis': ['q12'],
 'dlu-vertiefung': ['q11', 'q12'],
 'fairytale-standard': ['q7', 'q12'],
 'fairytale-vertiefung': ['q11'],
 'iwiwt-basis': ['q13'],
 'iwiwt-standard': ['q1', 'q7', 'q11'],
 'lavitaebella-avanzata': ['q11'],
 'lavitaebella-base': ['q14'],
 'layall-basis': ['q8', 'q9', 'q11'],
 'layall-standard': ['q4', 'q7'],
 'perfetti-avanzata': ['q10'],
 'stan-basis': ['q6', 'q8'],
 'stan-standard': ['q1', 'q13', 'q15'],
 'stan-vertiefung': ['q1'],
 'tusi-base': ['q4', 'q5', 'q12'],
 'tusi-avanzata': ['q2', 'q3', 'q4', 'q5', 'q11', 'q12'],
}

def add(pid, fn):
    q = Q(); fn(q); ADD.setdefault(pid, []).extend(q.items)
ADD = {}

# ---- Italienisch ----
def a(q):
    q.sc('La canzone “50 Special” dei Lunapop è uscita nel…', ['1999', '1989', '2009', '2019'], 0, 'Singolo del 1999 (maggio), arrivato al primo posto in classifica.')
    q.tf('Il titolo si riferisce a un modello di Vespa.', True, 'La Vespa 50 Special è uno scooter degli anni Sessanta, spesso “truccato” dai ragazzi.')
    q.tf('La canzone è stata scritta e cantata da Cesare Cremonini, allora giovanissimo.', True, 'Cremonini era il cantante e l’autore.')
add('50special-base', a)
def a(q):
    q.sc('Chi ha scritto la canzone e la canta?', ['Cesare Cremonini', 'Vasco Rossi', 'Jovanotti', 'Eros Ramazzotti'], 0, 'Il frontman dei Lunapop, band di Bologna attiva dal 1999 al 2001.')
    q.sc('Quale titolo ha l’unico album dei Lunapop, uscito nel 1999?', ['…Squérez?', 'Maledetta primavera', 'Cosmo', 'Bologna Beat'], 0, 'L’album …Squérez? contiene “50 Special”.')
add('50special-avanzata', a)
def a(q):
    q.sc('Chi canta “Tu si a fine do’ munno”?', ['Angelo Famao', 'Liberato', 'Gigi D’Alessio', 'Nino D’Angelo'], 0, 'Angelo Famao, cantante neomelodico nato a Catania.')
    q.tf('Angelo Famao è nato a Catania, ma canta in dialetto napoletano.', True, 'Il genere si chiama neomelodico: pop in napoletano.')
    q.sc('Come si chiama il genere musicale di questa canzone?', ['Neomelodico', 'Opera lirica', 'Rap trap', 'Rock progressivo'], 0, 'Neomelodico = pop in dialetto napoletano.')
add('tusi-base', a)
def a(q):
    q.sc('Che cosa significa, in senso figurato, “Tu si’ ’a fine d’ ’o munno” (“Sei la fine del mondo”)?', ['Sei perfetta/o, sei il massimo', 'Sei molto lontano', 'Sei pericolosa/o', 'Sei triste'], 0, 'È un’espressione iperbolica: la persona amata è il massimo.')
    q.tf('La canzone è uscita nel 2018 ed è diventata un “tormentone” tra i giovani.', True, 'Circa 100 milioni di visualizzazioni su YouTube.')
    q.tf('Nel maggio 2023 i giocatori dell’Inter l’hanno cantata festeggiando la Coppa Italia.', True, 'Episodio riportato dalla stampa (Vesuvio Live).')
    q.sc('In quale lingua è cantata la canzone?', ['Dialetto napoletano', 'Italiano standard', 'Siciliano antico', 'Latino'], 0, 'Neomelodico in napoletano.')
    q.mc('Che cosa caratterizza il genere neomelodico? (più risposte)', ['Testi spesso d’amore', 'Dialetto napoletano', 'Strumenti solo classici dell’opera', 'Pubblico giovane sui social'], [0, 1, 3], 'Amore, napoletano e diffusione online.')
add('tusi-avanzata', a)
# ---- Englisch ----
def a(q):
    q.sc('Who sings the lead vocals on “Don’t Look Back in Anger”?', ['Noel Gallagher', 'Liam Gallagher', 'Damon Albarn', 'Richard Ashcroft'], 0, 'Unusually, Noel sang this one instead of his brother Liam.')
    q.tf('The song was released as a single in 1996.', True, 'It came from the 1995 album (What’s the Story) Morning Glory?.')
add('dlbia-vertiefung', a)
def a(q):
    q.sc('Wer hat „I Want It That Way“ geschrieben?', ['Max Martin und Andreas Carlsson', 'Die Backstreet Boys selbst', 'Nick Carter und AJ McLean', 'Elton John'], 0, 'Das Lied wurde von schwedischen Autoren geschrieben.')
    q.sc('In welchem Jahr erschien das Lied?', ['1999', '1989', '2009', '1979'], 0, 'Veröffentlicht 1999 auf dem Album „Millennium“.')
add('iwiwt-standard', a)
def a(q):
    q.sc('Welche beiden Sängerinnen gehören zu ABBA?', ['Agnetha Fältskog und Anni-Frid Lyngstad', 'Agnetha und Björn', 'Benny und Frida', 'Björn und Anni-Frid'], 0, 'Zu ABBA gehören zwei Frauen und zwei Männer.')
    q.tf('ABBA gewann 1974 den Eurovision Song Contest mit „Waterloo“.', True, 'Das war ihr internationaler Durchbruch.')
add('layall-basis', a)
def a(q):
    q.sc('Welche Sängerinnen sind bei ABBA zu hören?', ['Agnetha Fältskog und Anni-Frid Lyngstad', 'Agnetha und Björn', 'Benny und Frida', 'Björn und Anni-Frid'], 0, 'Zu ABBA gehören zwei Frauen und zwei Männer.')
add('layall-standard', a)

def a(q):
    q.sa('Welche Band singt „Fairytale of New York“ zusammen mit Kirsty MacColl? (englisch)', ['The Pogues', 'Pogues'], 'The Pogues', 'Die Pogues sind eine irisch-britische Folk-Punk-Band; Kirsty MacColl singt die weibliche Rolle.')
add('fairytale-standard', a)

EDIT = {
 ('50special-avanzata', 'q3'): lambda x: x.update(prompt='Quali temi emergono? (più risposte)', options=[{'id': i, 'text': t} for i, t in zip('abcde', ['Libertà', 'Estate', 'La scuola e i doveri', 'Guerra', 'Paura'])], correctOptionIds=['a', 'b', 'c'], explanation='Libertà, estate e la voglia di lasciare i doveri della scuola.'),
 ('50special-avanzata', 'q10'): lambda x: x.update(prompt='Lessico (Vespa e motori): collega i termini ai significati.'),
 ('american-pie-basis', 'q2'): lambda x: x.update(prompt='In welchem Jahrzehnt erschien das Lied?'),
 ('layall-basis', 'q9x'): lambda x: None,
 ('fairytale-standard', 'q12x'): lambda x: None,
}

def apply():
    for d in PK:
        pid = d['id']
        keep = [q for q in d['questions'] if q['id'] not in DROP.get(pid, [])]
        for q in keep:
            f = EDIT.get((pid, q['id']))
            if f: f(q)
        keep += ADD.get(pid, [])
        for i, q in enumerate(keep, 1): q['id'] = f'q{i}'
        d['questions'] = keep
        d['estimatedMinutes'] = max(8, round(len(keep) * 1.4))
        d['reviewNotes'] = [n for n in d['reviewNotes']] + ['Aufgaben am 25.10.2026 fachlich gesichtet: Meinungsfragen und nicht belegbare Aussagen entfernt, verifizierbare Fakten ergänzt (Wikipedia/Presse). Hörinhalte nur mit dem Medium selbst prüfen.']
