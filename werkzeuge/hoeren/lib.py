"""Bausteine für Hörverstehens-Pakete (eigene Aufgaben, kein Liedtext, keine Filmdialoge)."""
import json, pathlib
OUT = pathlib.Path(__file__).resolve().parents[2] / 'grundstock' / 'listening'
PK = []
L = 'abcdefgh'

class Q:
    def __init__(s): s.n = 0; s.items = []
    def _id(s): s.n += 1; return f'q{s.n}'
    def sc(s, prompt, opts, ok, ex):
        s.items.append({'id': s._id(), 'type': 'single_choice', 'prompt': prompt,
            'options': [{'id': L[i], 'text': t} for i, t in enumerate(opts)], 'correctOptionId': L[ok], 'explanation': ex})
    def mc(s, prompt, opts, oks, ex):
        s.items.append({'id': s._id(), 'type': 'multiple_choice', 'prompt': prompt,
            'options': [{'id': L[i], 'text': t} for i, t in enumerate(opts)], 'correctOptionIds': [L[i] for i in oks], 'explanation': ex})
    def tf(s, prompt, ans, ex):
        s.items.append({'id': s._id(), 'type': 'true_false', 'prompt': prompt, 'answer': ans, 'explanation': ex})
    def sa(s, prompt, acc, model, ex):
        s.items.append({'id': s._id(), 'type': 'short_answer', 'prompt': prompt, 'acceptedAnswers': acc, 'modelAnswer': model, 'explanation': ex})
    def mt(s, prompt, pairs, ex, dis=None):
        q = {'id': s._id(), 'type': 'matching', 'prompt': prompt,
             'pairs': [{'id': f'p{i+1}', 'left': a, 'right': b} for i, (a, b) in enumerate(pairs)], 'explanation': ex}
        if dis: q['distractors'] = dis
        s.items.append(q)
    def od(s, prompt, items, ex):
        s.items.append({'id': s._id(), 'type': 'ordering', 'prompt': prompt,
            'items': [{'id': f'o{i+1}', 'text': t} for i, t in enumerate(items)], 'explanation': ex})
    def gf(s, prompt, text, answers, ex):
        s.items.append({'id': s._id(), 'type': 'gap_fill', 'prompt': prompt, 'text': text,
            'gaps': [{'id': L[i], 'acceptedAnswers': a if isinstance(a, list) else [a]} for i, a in enumerate(answers)], 'explanation': ex})

def pkg(id, title, lang, level, desc, topics, media, q, series, series_title, level_label, notes,
        minutes=None, source_note='', follow=None, grade=None, cefr=None, url=None, tags=None, cover='wave'):
    n = len(q.items)
    srcs = [{'kind': 'own', 'citation': 'Eigene Aufgaben (theis), orientiert an Arbeitsblättern des Autors; enthält keinen Liedtext und keine Filmdialoge.', 'url': '', 'rights': 'own'}]
    if url:
        srcs.append({'kind': 'external', 'citation': source_note or 'Offizielles Video beim Anbieter; Einbettbarkeit und Nutzungsrechte vor dem Einsatz prüfen.', 'url': url, 'rights': 'needs_review'})
    d = {'format': 'theis-learning-package', 'schemaVersion': '1.2', 'kind': 'listening', 'id': id, 'title': title,
         'language': lang, 'level': level, 'description': desc, 'topics': topics, 'cover': cover,
         'estimatedMinutes': minutes or max(8, round(n * 1.4)), 'media': media, 'transcript': '',
         'series': series, 'seriesTitle': series_title, 'levelLabel': level_label, 'teacherNotes': notes,
         'sources': srcs,
         'reviewNotes': ['Aufgaben von der KI entworfen und noch nicht von einer Lehrkraft geprüft; Lösungen und Fakten vor dem Einsatz am Medium abgleichen.',
                         'Liedtexte sind nicht enthalten. Lückentexte mit dem echten Text können privat importiert werden.'],
         'questions': q.items, 'vocabularyIds': []}
    PK.append(d)

def song(vid): return {'type': 'youtube', 'videoId': vid}
def film(title, year, scene=None):
    m = {'type': 'film', 'title': title, 'year': year}
    if scene: m['scene'] = scene
    return m

def write():
    OUT.mkdir(parents=True, exist_ok=True)
    for d in PK:
        (OUT / f"{d['id']}.json").write_text(json.dumps(d, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(len(PK), 'Pakete,', sum(len(d['questions']) for d in PK), 'Aufgaben')
