#!/usr/bin/env python3
"""Grammatikübungen aus Textdateien (werkzeuge/grammatik/<buch>/*.txt) in Pakete (kind „grammar“) unter
grundstock/grammar/ umwandeln. Aufruf:  python3 werkzeuge/grammatik.py [datei.txt ...]   Danach: node werkzeuge/bundle_stock.cjs

Format (eine Datei je Unità, mehrere Themen):
  #!buch series=Corso_daje volume=1 grade=8 cefr=A1 prefix=ecco1   (prefix nur für IDs; IDs nie ändern, sonst gehen Lernstände verloren)
  @thema <id> | <Unità 1> | <Abschnitt, z. B. 1A> | <Titel> | <Reihenfolge>
  @mehr <id>        weitere Übungen zu einem Thema weiter oben anhängen (IDs der vorhandenen bleiben gleich)
  #regel            danach Merkkasten in der Zielsprache (einfach!) (Absätze, „- “-Listen, „| a | b |“-Tabellen, **fett**) bis zur nächsten #/%-Zeile
  #regel-de         derselbe Merkkasten auf Deutsch (per Knopf „Deutsch“)
  #einstieg         danach „- “-Zeilen (Impulse zum Einstieg, für Lehrkräfte und Lernende)
  %übung <leicht|mittel|schwer> | <Titel>
  ?<typ> [wortkasten] | <Aufgabenstellung in der Zielsprache> || <dieselbe Anweisung auf Deutsch>
  … Zeilen je Typ …
  ! Erklärung in der Zielsprache || dieselbe Erklärung auf Deutsch (erscheint nach der Korrektur)

Typen:
  auswahl    Satz mit {richtig*|falsch|falsch}; mehrere Lücken je Zeile möglich             → gap_choice
  luecke     Satz mit [Lösung/Variante]; „+ wort, wort“ = Zusatzwörter im Wortkasten       → gap_fill
  mc         erste Zeile Frage (optional), dann „* richtig“ und „- falsch“                  → single_choice
  zuordnen   links = rechts; „+ ablenker“                                                   → matching
  sortieren  „Kategorien: a=Label; b=Label“, dann „Text > a“                                → categorize
  ordnen     Elemente in richtiger Reihenfolge, eine Zeile je Element                       → ordering
  fehler     Satz mit [falsch=>richtig/Variante]                                            → error_correction
  ergaenzen  Satzanfang | Lösung/Variante (optional: | Musterlösung)                        → sentence_completion
  tabelle    „Spalten: a | b | c“, dann Zeilen „x | [y] | [z/z2]“                           → table_fill
  frei       Musterlösung (mehrere Zeilen), optional „Zeilen: 4“                            → open_answer
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'grundstock' / 'grammar'
ANNO = {'1': 'Primo anno', '2': 'Secondo anno', '3': 'Terzo anno'}
LIVELLO = {'leicht': 'facile', 'mittel': 'medio', 'schwer': 'difficile'}
LEVEL_MIN = {'leicht': 1.0, 'mittel': 1.3, 'schwer': 1.6}


def slug(s):
    s = s.lower()
    for a, b in (('à', 'a'), ('è', 'e'), ('é', 'e'), ('ì', 'i'), ('ò', 'o'), ('ù', 'u'), ('’', ''), ("'", '')):
        s = s.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def alts(s):
    return [a.strip() for a in s.split('/') if a.strip()]


class Q:
    def __init__(self, typ, flags, prompt):
        prompt, _, help_ = prompt.partition('||')
        self.typ, self.flags, self.prompt, self.help, self.lines, self.expl = typ, flags, prompt.strip(), help_.strip(), [], ''


def build_question(q, qid):
    t, L = q.typ, [l for l in q.lines if l.strip()]
    z = {'id': qid, 'prompt': q.prompt}
    if q.help:
        z['promptHelp'] = q.help
    if q.expl:
        it, _, de = q.expl.partition('||')
        z['explanation'] = it.strip()
        if de.strip():
            z['explanationHelp'] = de.strip()
    if t == 'auswahl':
        gaps, n = [], 0
        def rep(m):
            nonlocal n
            n += 1
            opts = [o.strip() for o in m.group(1).split('|')]
            ans = [o[:-1].strip() for o in opts if o.endswith('*')]
            if len(ans) != 1:
                raise ValueError(f'{qid}: genau eine Option mit * markieren: {m.group(0)}')
            gaps.append({'id': f'g{n}', 'options': [o.rstrip('*').strip() for o in opts], 'answer': ans[0]})
            return f'[[g{n}]]'
        text = '\n'.join(re.sub(r'\{([^{}]+)\}', rep, l) for l in L)
        z.update(type='gap_choice', text=text, gaps=gaps)
    elif t in ('luecke', 'fehler'):
        gaps, n, extra = [], 0, []
        body = []
        for l in L:
            if l.startswith('+ '):
                extra += [w.strip() for w in l[2:].split(',') if w.strip()]
                continue
            body.append(l)
        def rep(m):
            nonlocal n
            n += 1
            if t == 'fehler':
                wrong, right = m.group(1).split('=>')
                gaps.append({'id': f'g{n}', 'wrong': wrong.strip(), 'acceptedAnswers': alts(right)})
            else:
                gaps.append({'id': f'g{n}', 'acceptedAnswers': alts(m.group(1))})
            return f'[[g{n}]]'
        text = '\n'.join(re.sub(r'\[([^\[\]]+)\]', rep, l) for l in body)
        if t == 'fehler':
            z.update(type='error_correction', text=text, errors=gaps)
        else:
            z.update(type='gap_fill', text=text, gaps=gaps)
            if 'wortkasten' in q.flags:
                z['wordBank'] = True
                if extra:
                    z['extraWords'] = extra
    elif t == 'mc':
        opts, k = [], 0
        for l in L:
            if l[:2] in ('* ', '- '):
                k += 1
                opts.append(({'id': f'o{k}', 'text': l[2:].strip()}, l[0] == '*'))
            else:
                z['prompt'] = (z['prompt'] + '\n' + l).strip() if z['prompt'] else l
        right = [o['id'] for o, c in opts if c]
        if len(right) != 1:
            raise ValueError(f'{qid}: genau eine richtige Antwort (*)')
        z.update(type='single_choice', options=[o for o, _ in opts], correctOptionId=right[0])
    elif t == 'zuordnen':
        pairs, dis = [], []
        for i, l in enumerate(L):
            if l.startswith('+ '):
                dis.append(l[2:].strip())
                continue
            a, b = l.split(' = ', 1)
            pairs.append({'id': f'p{len(pairs) + 1}', 'left': a.strip(), 'right': b.strip()})
        z.update(type='matching', pairs=pairs)
        if dis:
            z['distractors'] = dis
    elif t == 'sortieren':
        head = L[0]
        assert head.lower().startswith('kategorien:'), qid + ': erste Zeile „Kategorien: …“'
        cats = []
        for c in head.split(':', 1)[1].split(';'):
            cid, lab = c.split('=', 1)
            cats.append({'id': cid.strip(), 'label': lab.strip()})
        items = []
        for i, l in enumerate(L[1:]):
            txt, cat = l.rsplit('>', 1)
            items.append({'id': f'i{i + 1}', 'text': txt.strip(), 'category': cat.strip()})
        z.update(type='categorize', categories=cats, items=items)
    elif t == 'ordnen':
        z.update(type='ordering', items=[{'id': f'i{i + 1}', 'text': l.strip()} for i, l in enumerate(L)])
    elif t == 'ergaenzen':
        items = []
        for i, l in enumerate(L):
            parts = [p.strip() for p in l.split(' | ')]
            it = {'id': f's{i + 1}', 'start': parts[0], 'acceptedAnswers': alts(parts[1])}
            if len(parts) > 2:
                it['modelAnswer'] = parts[2]
            items.append(it)
        z.update(type='sentence_completion', items=items)
    elif t == 'tabelle':
        head = L[0]
        assert head.lower().startswith('spalten:'), qid + ': erste Zeile „Spalten: …“'
        cols = [c.strip() for c in head.split(':', 1)[1].split('|')]
        rows, n = [], 0
        for l in L[1:]:
            cells = []
            for c in [c.strip() for c in l.strip().strip('|').split('|')]:
                m = re.fullmatch(r'\[(.+)\]', c)
                if m:
                    n += 1
                    cells.append({'id': f'c{n}', 'acceptedAnswers': alts(m.group(1))})
                else:
                    cells.append(c)
            assert len(cells) == len(cols), f'{qid}: Zeile hat {len(cells)} statt {len(cols)} Zellen: {l}'
            rows.append(cells)
        z.update(type='table_fill', columns=cols, rows=rows)
    elif t == 'frei':
        lines = 4
        model = []
        for l in L:
            m = re.match(r'Zeilen:\s*(\d+)', l)
            if m:
                lines = int(m.group(1))
            else:
                model.append(l)
        z.update(type='open_answer', modelAnswer='\n'.join(model), lines=lines)
    else:
        raise ValueError(f'{qid}: unbekannter Typ {t}')
    return z


def parse(path):
    book = {'series': 'Corso daje', 'volume': '1', 'grade': 8, 'cefr': 'A1', 'prefix': 'ecco1'}
    topics, cur, ex, q, mode = [], None, None, None, None
    for raw in path.read_text(encoding='utf-8').splitlines():
        line = raw.rstrip()
        if line.startswith('#!buch'):
            for kv in line.split()[1:]:
                k, v = kv.split('=', 1)
                book[k] = int(v) if k == 'grade' else v.replace('_', ' ')
            continue
        if line.startswith('##'):
            continue
        if line.startswith('@thema'):
            tid, unit, sect, title, order = [x.strip() for x in line[6:].split('|')]
            cur = {'id': tid, 'unit': unit, 'section': sect, 'title': title, 'order': int(order), 'rule': [], 'ruleDe': [], 'warmup': [], 'ex': []}
            topics.append(cur)
            mode, ex, q = None, None, None
            continue
        if line.startswith('@mehr'):
            tid = line[5:].strip()
            cur = next((t for t in topics if t['id'] == tid), None)
            if cur is None:
                raise ValueError(f'{path.name}: @mehr {tid}: Thema nicht gefunden')
            mode, ex, q = None, None, None
            continue
        if line.startswith('#regel-de'):
            mode = 'ruleDe'
            continue
        if line.startswith('#regel'):
            mode = 'rule'
            continue
        if line.startswith('#einstieg'):
            mode = 'warm'
            continue
        if line.startswith('%übung'):
            lvl, title = [x.strip() for x in line[6:].split('|', 1)]
            ex = {'level': lvl, 'title': title, 'q': []}
            cur['ex'].append(ex)
            mode, q = 'ex', None
            continue
        if line.startswith('?'):
            head, prompt = line[1:].split('|', 1)
            parts = head.split()
            q = Q(parts[0], parts[1:], prompt.strip())
            ex['q'].append(q)
            continue
        if mode == 'rule':
            cur['rule'].append(line)
        elif mode == 'ruleDe':
            cur['ruleDe'].append(line)
        elif mode == 'warm':
            if line.startswith('- '):
                cur['warmup'].append(line[2:].strip())
        elif mode == 'ex' and q is not None:
            if line.startswith('! '):
                q.expl = (q.expl + ' ' + line[2:].strip()).strip()
            elif line.strip():
                q.lines.append(line.strip())
    return book, topics


def packages(book, topics):
    vol = book['volume']
    for t in topics:
        rule = '\n'.join(t['rule']).strip()
        rule_de = '\n'.join(t['ruleDe']).strip()
        counter = {}
        for e in t['ex']:
            counter[e['level']] = counter.get(e['level'], 0) + 1
            n = counter[e['level']]
            pid = f"g-{book['prefix']}-{t['id']}-{e['level'][0]}{n}"
            qs = [build_question(q, f'q{i + 1}') for i, q in enumerate(e['q'])]
            size = sum(len(q.get('gaps', q.get('errors', q.get('pairs', q.get('items', q.get('options', [1])))))) for q in qs)
            minutes = max(3, min(25, round(size * LEVEL_MIN[e['level']] * 0.6 + 2)))
            unit_label = t['unit'] + (' · ' + t['section'] if t['section'] else '')
            p = {
                'format': 'theis-learning-package', 'schemaVersion': '1.2', 'kind': 'grammar', 'id': pid,
                'title': e['title'], 'language': 'it', 'level': book['cefr'],
                'description': f"{t['title']} · {e['title']} · livello {LIVELLO[e['level']]}.",
                'topics': [t['title'], 'Grammatik'],
                'sources': [{'kind': 'own', 'citation': f"Eigene Übung (daje), {ANNO[vol]}, {unit_label}.", 'rights': 'own'}],
                'estimatedMinutes': minutes,
                'catalog': {'origin': 'textbook', 'textbook': {'series': book['series'], 'volume': vol, 'unit': t['unit'], **({'section': t['section']} if t['section'] else {})},
                            'grade': book['grade'], 'foreignLanguageNo': 3, 'cefr': book['cefr'], 'tags': ['grammatik']},
                'grammar': {'topic': f"{book['prefix']}-{t['id']}", 'topicTitle': t['title'], 'difficulty': e['level'], 'origin': 'own', 'order': t['order'] * 10 + n, **({'rule': rule} if rule else {}), **({'ruleHelp': rule_de} if rule_de else {})},
                'questions': qs,
            }
            if t['warmup']:
                p['teacherNotes'] = {'warmup': t['warmup']}
            yield pid, p


if __name__ == '__main__':
    files = [pathlib.Path(a) for a in sys.argv[1:]] or sorted((ROOT / 'werkzeuge' / 'grammatik').glob('*/*.txt'))
    OUT.mkdir(parents=True, exist_ok=True)
    count, topics_n, written = 0, 0, set()
    for f in files:
        book, topics = parse(f)
        topics_n += len(topics)
        for pid, p in packages(book, topics):
            (OUT / f'{pid}.json').write_text(json.dumps(p, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
            written.add(pid + '.json')
            count += 1
    # Vollständiger Lauf: Pakete, die es in den Quellen nicht mehr gibt, entfernen (nur Grammatik aus diesem Werkzeug).
    if not sys.argv[1:]:
        for old in OUT.glob('g-*.json'):
            if old.name not in written:
                old.unlink()
                print('entfernt', old.name)
    print(f'{count} Grammatikübungen zu {topics_n} Themen geschrieben')
