"""Aufgaben im Redaktionsformat der ChatGPT-Übergaben („daje-editorial-exercise“) in Grammatikpakete umwandeln.

Wird von werkzeuge/gpt_import.py benutzt. Jede Redaktionsaufgabe wird ein Paket mit der ID g-<redaktions-id>;
jede Teilaufgabe wird in vorhandene Aufgabentypen übersetzt, ohne Inhalte zu kürzen:

- gap_fill / gap_choice      → gleich; Hinweise direkt an der Lücke (ohne Genus/Numerus-Angaben, die die Lösung verraten)
- table / analysis / word_puzzle (cue → answer)
    · wenige feste Antworten (≤ 5 verschiedene)  → Zuordnen in Gruppen (categorize)
    · kurze Formen                               → Lückenliste (gap_fill), höchstens 12 Zeilen je Aufgabe
    · erklärende Antworten                       → offene Antwort mit vollständiger Musterlösung
- reading / reading_open     → offene Antworten zum Lesetext (Lesetext steht über den Aufgaben)
- reading_choice / odd_one_out → Einfachauswahl
- categorize / speaker_match → gleich, auf Teile mit höchstens 12 Einträgen und 5 Gruppen verteilt
- matching                   → gleich, höchstens 8 Paare je Teil
- ordering                   → Ordnen (bis 8 kurze Blöcke) oder Blöcke A, B, C … im Lesetext + Reihenfolge eintragen
- sentence_order             → Satzbaukasten (ordering) je Satz
- error_correction           → Fehlerkorrektur im Text bzw. Satzkorrektur (short_answer)
- rewrite / writing / punctuation / segmentation / open_list / form → offene Antwort mit Musterlösung
Den gelösten Grundtext zeigt daje bei Lücken-, Ordnungs- und Korrekturaufgaben nicht als Lesetext an.
"""
import re

GENERIC_HINT = re.compile(r'banca|ricostruzione guidata|^preposizione semplice o articolata$|scegli genere|concorda nel contesto|^voce', re.I)
GENDER = re.compile(r',?\s*\b(maschile|femminile)\s+(singolare|plurale)\b|,?\s*\b(singolare|plurale)\b', re.I)
LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
TYPE_DE = {
    'reading': 'Lies den Text und beantworte die Fragen.',
    'reading_open': 'Lies den Text und beantworte die Fragen.',
    'reading_choice': 'Lies den Text. Wähle jeweils die Antwort, die der Text stützt.',
    'rewrite': 'Schreibe den Text wie angegeben um. Vergleiche danach mit der möglichen Lösung.',
    'writing': 'Schreibe den Text. Vergleiche danach mit dem Mustertext und den Prüfpunkten.',
    'punctuation': 'Setze Großschreibung und Satzzeichen. Vergleiche danach mit der möglichen Lösung.',
    'segmentation': 'Trenne die Wörter und schreibe den Text richtig ab.',
    'open_list': 'Suche die Wörter im Text und schreibe sie auf.',
    'form': 'Fülle das Formular mit erfundenen Angaben aus.',
    'categorize': 'Ordne die Wörter den Gruppen zu.',
    'speaker_match': 'Ordne jede Aussage der richtigen Person zu.',
    'matching': 'Ordne die passenden Paare zu.',
    'ordering': 'Bring die Teile in die richtige Reihenfolge.',
    'sentence_order': 'Bilde aus den Teilen einen Satz.',
    'error_correction': 'Korrigiere die Fehler.',
    'odd_one_out': 'Welches Wort passt nicht in die Gruppe?',
    'table': 'Ergänze die Formen.',
    'analysis': 'Bestimme die Formen bzw. Funktionen.',
}


def tidy(s):
    return str(s or '').replace("'", '’').strip()


def cut(s, n):
    s = tidy(s)
    if len(s) <= n:
        return s
    raise ValueError(f'Text zu lang ({len(s)} > {n}): {s[:60]}…')


def chunks(lst, size):
    """Gleichmäßig auf möglichst wenige Teile mit höchstens size Elementen verteilen."""
    if len(lst) <= size:
        return [lst]
    k = -(-len(lst) // size)
    base, extra = divmod(len(lst), k)
    out, i = [], 0
    for j in range(k):
        n = base + (1 if j < extra else 0)
        out.append(lst[i:i + n])
        i += n
    return out


def part_label(i, total):
    return f' (parte {i + 1}/{total})' if total > 1 else ''


def hint_text(h, answer):
    h = tidy(h).rstrip('.')
    if not h or GENERIC_HINT.search(h):
        return ''
    m = re.match(r'^Inizia con «(.+?)»', h)
    if m:
        return m.group(1)
    h = GENDER.sub('', h).strip(' ,·')
    h = h.replace(' · ', ', ')
    if not h or h.lower() == tidy(answer).lower():
        return ''
    return h


def gap_question(q, qid):
    text = tidy(q['text'])
    gaps = []
    bank = bool(q.get('wordBank'))
    for g in q['gaps']:
        # Auswahllücken ohne Hinweis: Bezug und Art (direkt/indirekt) muss der Kontext liefern
        hint = '' if bank or q['type'] == 'gap_choice' else hint_text(g.get('hint', ''), g.get('answer', ''))
        if hint:
            text = text.replace('[[' + g['id'] + ']]', '[[' + g['id'] + ']] (' + hint + ')', 1)
        if q['type'] == 'gap_choice':
            opts = [tidy(o) for o in g['options']]
            ans = tidy(g['answer'])
            if ans not in opts:
                raise ValueError(f'{qid}: Lösung {ans} nicht unter den Optionen')
            gaps.append({'id': g['id'], 'options': opts, 'answer': ans})
        else:
            acc = [tidy(a) for a in (g.get('acceptedAnswers') or [])]
            ans = tidy(g.get('answer'))
            if ans and ans not in acc:
                acc.insert(0, ans)
            gaps.append({'id': g['id'], 'acceptedAnswers': acc})
    out = {'id': qid, 'type': q['type'], 'prompt': tidy(q['prompt']), 'text': text, 'gaps': gaps}
    if q['type'] == 'gap_fill' and bank:
        out['wordBank'] = True
    return out


def rows_questions(q, qid, kind):
    rows = q['rows']
    answers = [tidy(r['answer']) for r in rows]
    distinct = list(dict.fromkeys(answers))
    prompt = tidy(q['prompt'])
    short = len(distinct) > 1 and all(len(a) <= 30 and len(a.split()) <= 3 for a in answers)
    out = []
    if 2 <= len(distinct) <= 5 and len(rows) >= 4 and len(distinct) < len(rows):
        # wenige feste Antworten: in Gruppen ordnen; jede Gruppe kommt in jedem Teil vor, wo möglich
        cats = [{'id': 'c' + str(i + 1), 'label': cut(a, 80)} for i, a in enumerate(distinct)]
        cid = {c['label']: c['id'] for c in cats}
        items = [{'text': cut(r['cue'], 300), 'category': cid[tidy(r['answer'])]} for r in rows]
        parts = interleave(items, 12)
        for i, part in enumerate(parts):
            out.append({'id': f'{qid}{"abcdefghij"[i] if len(parts) > 1 else ""}', 'type': 'categorize', 'prompt': prompt + part_label(i, len(parts)),
                        'categories': cats, 'items': [{'id': 'i' + str(k + 1), **it} for k, it in enumerate(part)]})
        return out
    if short:
        parts = chunks(rows, 12)
        for i, part in enumerate(parts):
            lines, gaps = [], []
            for k, r in enumerate(part):
                gid = 'g' + str(k + 1)
                lines.append(f'{tidy(r["cue"])} → [[{gid}]]')
                acc = [tidy(x) for x in re.split(r'\s*/\s*', str(r['answer'])) if x.strip()]
                for extra in r.get('acceptedAnswers') or []:
                    if tidy(extra) not in acc:
                        acc.append(tidy(extra))
                gaps.append({'id': gid, 'acceptedAnswers': acc})
            out.append({'id': f'{qid}{"abcdefghij"[i] if len(parts) > 1 else ""}', 'type': 'gap_fill', 'prompt': prompt + part_label(i, len(parts)), 'text': '\n'.join(lines), 'gaps': gaps})
        return out
    # erklärende Antworten: offen, mit vollständiger Musterlösung
    parts = chunks(rows, 10)
    for i, part in enumerate(parts):
        body = '\n'.join(f'{k + 1}. {tidy(r["cue"])}' for k, r in enumerate(part))
        model = '\n'.join(f'{k + 1}. {tidy(r["answer"])}' for k, r in enumerate(part))
        out.append({'id': f'{qid}{"abcdefghij"[i] if len(parts) > 1 else ""}', 'type': 'open_answer', 'prompt': cut(prompt + part_label(i, len(parts)) + '\n' + body, 1000), 'modelAnswer': cut(model, 2000), 'lines': min(15, max(4, len(part) + 1))})
    return out


def interleave(items, size):
    """Auf Teile verteilen und dabei die Gruppen mischen (Reißverschluss nach Gruppe)."""
    if len(items) <= size:
        return [items]
    by = {}
    for it in items:
        by.setdefault(it['category'], []).append(it)
    order = []
    while any(by.values()):
        for k in list(by):
            if by[k]:
                order.append(by[k].pop(0))
    k = -(-len(order) // size)
    return [order[i::k] for i in range(k)]


def categorize_questions(q, qid, speaker=False):
    labels = [tidy(c) for c in q['categories']]
    if speaker:
        pairs = [(tidy(it['text']), tidy(it['answer'])) for it in q['items']]
    else:
        sol = {tidy(k): [tidy(v) for v in vs] for k, vs in q['solution'].items()}
        where = {}
        for k, vs in sol.items():
            for v in vs:
                where[v] = k
        pairs = [(tidy(it), where[tidy(it)]) for it in q['items']]
    prompt = tidy(q['prompt'])
    groups = chunks(labels, 5) if len(labels) > 5 else [labels]
    out = []
    for g in groups:
        sub = [p for p in pairs if p[1] in g]
        cats = [{'id': 'c' + str(i + 1), 'label': cut(l, 80)} for i, l in enumerate(g)]
        cid = {c['label']: c['id'] for c in cats}
        items = [{'text': cut(t, 300), 'category': cid[c]} for t, c in sub]
        for part in interleave(items, 12):
            out.append({'categories': cats, 'items': [{'id': 'i' + str(k + 1), **it} for k, it in enumerate(part)]})
    return [{'id': f'{qid}{"abcdefghij"[i] if len(out) > 1 else ""}', 'type': 'speaker_match' if speaker else 'categorize', 'prompt': prompt + part_label(i, len(out)), **o} for i, o in enumerate(out)]


def matching_questions(q, qid):
    if q.get('pairs'):
        pairs = [(tidy(p['left']), tidy(p['right'])) for p in q['pairs']]
    else:
        pairs = [(tidy(r['cue']), tidy(r['answer'])) for r in q['rows']]
    parts = chunks(pairs, 8)
    return [{'id': f'{qid}{"abcdefghij"[i] if len(parts) > 1 else ""}', 'type': 'matching', 'prompt': tidy(q['prompt']) + part_label(i, len(parts)),
             'pairs': [{'id': 'p' + str(k + 1), 'left': cut(l, 300), 'right': cut(r, 300)} for k, (l, r) in enumerate(part)]} for i, part in enumerate(parts)]


def ordering_questions(q, qid, reading_parts):
    items = {it['id']: tidy(it['text']) for it in q['items']}
    order = q.get('correctOrder') or [it['id'] for it in q['items']]
    if len(order) <= 8 and all(len(items[i]) <= 300 for i in order):
        return [{'id': qid, 'type': 'ordering', 'prompt': tidy(q['prompt']), 'items': [{'id': 'p' + str(k + 1), 'text': items[i]} for k, i in enumerate(order)]}]
    # lange oder viele Blöcke: im Lesetext mit Buchstaben (in der gelieferten, gemischten Reihenfolge), Reihenfolge eintragen
    shown = [it['id'] for it in q['items']]
    letter = {i: LETTERS[k] for k, i in enumerate(shown)}
    reading_parts.append('\n\n'.join(f'{letter[i]} — {items[i]}' for i in shown))
    lines = ' · '.join(f'{k + 1}. [[g{k + 1}]]' for k in range(len(order)))
    gaps = [{'id': f'g{k + 1}', 'acceptedAnswers': [letter[i]]} for k, i in enumerate(order)]
    return [{'id': qid, 'type': 'gap_fill', 'prompt': tidy(q['prompt']) + ' Scrivi la lettera di ogni blocco nella posizione giusta.', 'text': lines, 'gaps': gaps,
             'promptHelp': f'Lies die Blöcke A bis {LETTERS[len(order) - 1]} im Text und trage die Buchstaben in der richtigen Reihenfolge ein.'}]


def sentence_questions(q, qid):
    out = []
    if q.get('items') and isinstance(q['items'][0], str):
        sentences = [{'words': q['items'], 'model': q.get('modelAnswer', '')}]
    else:
        sentences = [{'parts': s['parts'], 'order': s['correctOrder'], 'model': s.get('modelAnswer', '')} for s in q['items']]
    for k, s in enumerate(sentences):
        if 'words' in s:
            words = [tidy(w) for w in s['words']]
            tokens = re.findall(r'[^\s]+', tidy(s['model']))
            seq, pool = [], list(words)
            for t in tokens:
                core = t.strip('.,;:!?«»"')
                if core in pool:
                    pool.remove(core)
                    seq.append(core)
                elif t in pool:
                    pool.remove(t)
                    seq.append(t)
            if pool or len(seq) != len(words):
                raise ValueError(f'{qid}: Satz nicht abbildbar: {s["model"]}')
            items = seq
        else:
            texts = {p['id']: tidy(p['text']) for p in s['parts']}
            items = [texts[i] for i in s['order']]
        if not 3 <= len(items) <= 8:
            raise ValueError(f'{qid}: {len(items)} Satzteile')
        out.append({'id': f'{qid}s{k + 1}', 'type': 'ordering', 'prompt': (tidy(q['prompt']) if k == 0 else f'Frase {k + 1}: riordina i gruppi di parole.'),
                    'items': [{'id': 'p' + str(n + 1), 'text': cut(t, 300)} for n, t in enumerate(items)], 'explanation': cut(s['model'], 1500)})
    return out


def error_questions(q, qid):
    if q.get('corrections'):
        text = tidy(q['text'])
        errs = []
        for k, c in enumerate(q['corrections']):
            w = tidy(c['wrong'])
            eid = 'e' + str(k + 1)
            if w not in text:
                raise ValueError(f'{qid}: Fehlerstelle nicht gefunden: {w}')
            text = text.replace(w, '[[' + eid + ']]', 1)
            errs.append({'id': eid, 'wrong': cut(w, 120), 'acceptedAnswers': [tidy(c['correct'])]})
        expl = ' · '.join(f'{tidy(c["wrong"])} → {tidy(c["correct"])}: {tidy(c.get("explanation", ""))}'.rstrip(': ') for c in q['corrections'])
        return [{'id': qid, 'type': 'error_correction', 'prompt': tidy(q['prompt']), 'text': text, 'errors': errs, 'explanation': cut(expl, 1500)}]
    out = []
    for k, it in enumerate(q['items']):
        o = {'id': f'{qid}s{k + 1}', 'type': 'short_answer', 'prompt': (tidy(q['prompt']) + '\n' if k == 0 else '') + tidy(it['text']),
             'acceptedAnswers': [tidy(it['modelAnswer'])], 'modelAnswer': tidy(it['modelAnswer'])}
        if it.get('explanation'):
            o['explanation'] = cut(it['explanation'], 1500)
        out.append(o)
    return out


def open_q(qid, prompt, model, lines=8, expl=''):
    o = {'id': qid, 'type': 'open_answer', 'prompt': cut(prompt, 1000), 'modelAnswer': cut(model, 2000), 'lines': max(2, min(15, lines))}
    if expl:
        o['explanation'] = cut(expl, 1500)
    return o


def convert_questions(e, base_text):
    """→ (Fragen, Lesetext oder None). base_text: Grundtext der Aufgabe (Titel, Text) oder None."""
    out, reading_parts = [], []
    show_base = False
    for n, q in enumerate(e['questions']):
        qid = 'q' + str(n + 1)
        t = q['type']
        if t in ('gap_fill', 'gap_choice'):
            out.append(gap_question(q, qid))
        elif t in ('table', 'analysis', 'word_puzzle'):
            if q.get('text'):
                reading_parts.append(tidy(q['text']))
            elif t == 'analysis' or any('«' in str(r.get('cue', '')) for r in q['rows']):
                show_base = True
            out += rows_questions(q, qid, t)
        elif t in ('reading', 'reading_open'):
            if q.get('text'):
                reading_parts.append(tidy(q['text']))
            else:
                show_base = True
            for k, it in enumerate(q['items']):
                o = open_q(f'{qid}r{k + 1}', (tidy(q['prompt']) + '\n' if k == 0 else '') + tidy(it['prompt']), it['modelAnswer'], 3)
                out.append(o)
        elif t == 'reading_choice':
            show_base = True
            for k, it in enumerate(q['items']):
                opts = [{'id': 'o' + str(j + 1), 'text': cut(o['text'], 300)} for j, o in enumerate(it['options'])]
                right = [j for j, o in enumerate(it['options']) if o['id'] == it['correctOptionId']][0]
                o = {'id': f'{qid}r{k + 1}', 'type': 'single_choice', 'prompt': (tidy(q['prompt']) + '\n' if k == 0 else '') + tidy(it['prompt']), 'options': opts, 'correctOptionId': opts[right]['id']}
                if it.get('explanation') and tidy(it['explanation']) != opts[right]['text']:
                    o['explanation'] = cut(it['explanation'], 1500)
                out.append(o)
        elif t == 'odd_one_out':
            for k, it in enumerate(q['items']):
                opts = [{'id': 'o' + str(j + 1), 'text': tidy(o)} for j, o in enumerate(it['options'])]
                right = [o['id'] for o in opts if o['text'] == tidy(it['answer'])][0]
                out.append({'id': f'{qid}r{k + 1}', 'type': 'single_choice', 'prompt': (tidy(q['prompt']) + '\n' if k == 0 else '') + f'Gruppo {k + 1}', 'options': opts, 'correctOptionId': right, 'explanation': cut(it.get('reason', ''), 1500)})
        elif t == 'categorize':
            out += categorize_questions(q, qid)
        elif t == 'speaker_match':
            show_base = True
            out += categorize_questions(q, qid, speaker=True)
        elif t == 'matching':
            if q.get('text'):
                reading_parts.append(tidy(q['text']))
            out += matching_questions(q, qid)
        elif t == 'ordering':
            out += ordering_questions(q, qid, reading_parts)
        elif t == 'sentence_order':
            out += sentence_questions(q, qid)
        elif t == 'error_correction':
            out += error_questions(q, qid)
        elif t == 'rewrite':
            if q.get('text'):
                reading_parts.append(tidy(q['text']))
            else:
                show_base = True
            out.append(open_q(qid, q['prompt'], q['modelAnswer'], 15))
        elif t == 'writing':
            rub = q.get('rubric') or []
            out.append(open_q(qid, q['prompt'], q['modelAnswer'], 15, ('Controlla: ' + ' · '.join(tidy(r) for r in rub)) if rub else ''))
        elif t in ('punctuation', 'segmentation'):
            reading_parts.append(tidy(q['text']))
            out.append(open_q(qid, q['prompt'], q['modelAnswer'], 15))
        elif t == 'open_list':
            reading_parts.append(tidy(q['text']))
            out.append(open_q(qid, q['prompt'], ', '.join(tidy(w) for w in q['modelAnswers']), 6))
        elif t == 'form':
            fields = [tidy(f) for f in q['fields']]
            model = q.get('modelAnswer') or {}
            out.append(open_q(qid, tidy(q['prompt']) + '\n' + '\n'.join(f'– {f}:' for f in fields), '\n'.join(f'{f}: {tidy(model.get(f, ""))}' for f in fields), len(fields) + 1))
        else:
            raise ValueError(f'{e["id"]}: unbekannter Typ {t}')
    # Hilfe auf Deutsch für die erste Teilaufgabe jedes Typs
    seen = set()
    for q in out:
        src = q['type']
        key = src
        if key in seen or q.get('promptHelp'):
            seen.add(key)
            continue
        seen.add(key)
        de = {'gap_fill': 'Ergänze die Lücken.', 'gap_choice': 'Wähle jeweils die passende Form.', 'single_choice': 'Wähle die richtige Antwort.', 'short_answer': 'Schreibe den Satz richtig.',
              'open_answer': 'Antworte frei und vergleiche danach mit der möglichen Lösung.', 'ordering': TYPE_DE['ordering'], 'matching': TYPE_DE['matching'], 'categorize': TYPE_DE['categorize'],
              'speaker_match': TYPE_DE['speaker_match'], 'error_correction': TYPE_DE['error_correction']}.get(src)
        if de:
            q['promptHelp'] = de
    reading = None
    texts = []
    # Lücken-, Ordnungs- und Korrekturaufgaben arbeiten am Grundtext: dann den gelösten Text nicht zusätzlich zeigen
    hides = any(q['type'] in ('gap_fill', 'gap_choice', 'error_correction', 'ordering', 'punctuation', 'segmentation') for q in e['questions'])
    if show_base and base_text and not reading_parts and not hides:
        texts.append(base_text['text'])
    texts += reading_parts
    if texts:
        body = '\n\n'.join(dict.fromkeys(texts))
        reading = {'text': cut(body, 8000)}
        if base_text and base_text.get('title') and show_base and not reading_parts and not hides:
            reading['title'] = tidy(base_text['title'])
    if len(out) > 40:
        raise ValueError(f'{e["id"]}: {len(out)} Fragen')
    return out, reading
