#!/usr/bin/env python3
"""Wandelt werkzeuge/ecco1/*.txt (transkribierte Lehrwerksseiten) in Wortschatz-Pakete (Schema 1.2)
unter grundstock/vocabulary/. Aufruf:  python3 werkzeuge/ecco_import.py [datei.txt ...]
Danach:  node werkzeuge/bundle_stock.cjs"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'grundstock' / 'vocabulary'
ART = re.compile(r'^(il|lo|la|l’|gli|le|i) ')

def slug(s):
    s = s.lower()
    for a, b in (('à','a'),('è','e'),('é','e'),('ì','i'),('ò','o'),('ù','u'),('’',''),("'",'')):
        s = s.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

def variants(t):
    out = []
    s = re.sub(r'\s*\([^)]*\)', '', t).strip()
    if s != t and s:
        out.append(s)
    m = re.match(r'^\((il|la|lo|l’)\) (.+)$', t)
    if m:
        out += [m.group(2), m.group(1) + ' ' + m.group(2)]
    return [v for v in dict.fromkeys(out) if v != t]

def build(header, rows):
    sid, unit, sect, title, pages, themes = [x.strip() for x in header.split('|')][:6]
    pkg_id = 'it-ecco1-' + sid
    entries = []
    for i, (t, trs, hint) in enumerate(rows, 1):
        e = {'id': f'{sid}-{i:03d}', 'target': t, 'translations': trs, 'page': pages}
        acc = variants(t)
        if acc: e['acceptedAnswers'] = acc
        if hint: e['usage'] = hint
        m = ART.match(t)
        if m and ' / ' not in t and '/' not in t.split(' ')[0]:
            art = m.group(1)
            g = {'partOfSpeech': 'noun', 'article': art.strip()}
            if art in ('la', 'le'): g['gender'] = 'feminine'
            elif art in ('il', 'lo', 'gli', 'i'): g['gender'] = 'masculine'
            elif re.search(r'\bf\.', hint or ''): g['gender'] = 'feminine'
            elif re.search(r'\bm\.', hint or ''): g['gender'] = 'masculine'
            e['grammar'] = g
            e['answerPolicy'] = {'article': 'required', 'typo': 'hint'}
        entries.append(e)
    full = f'Ecco più 1 · {unit} · {sect}' if not unit.startswith('Anhang') else f'Ecco più 1 · {sect}'
    p = {
        'format': 'theis-learning-package', 'schemaVersion': '1.2', 'kind': 'vocabulary',
        'id': pkg_id, 'title': full, 'language': 'it', 'translationLanguage': 'de', 'level': 'A1',
        'description': f'Wortschatz zu „{title}“ aus Ecco più 1 ({unit}, {sect}).',
        'topics': [x.strip() for x in themes.split(',')][:8],
        'collection': 'Ecco più 1 (Cornelsen)', 'section': f'{unit} · {sect}',
        'sources': [{'kind': 'provided', 'citation': f'Ecco più 1, Cornelsen, Lista cronologica / Anhang, S. {pages} (vom Nutzer bereitgestellte Seiten)', 'rights': 'needs_review'}],
        'reviewNotes': ['Aus bereitgestellten Scans abgetippt; Ausgabe und Jahr des Lehrwerks noch eintragen.',
                        'Beispielsätze und Definitionen sind noch nicht ergänzt (eigene Formulierungen, nicht aus dem Buch).',
                        'Plural-, Partizip- und Zusatzangaben stehen im Feld usage.'],
        'entries': entries,
        'catalog': {'origin': 'textbook',
                    'textbook': {'publisher': 'Cornelsen', 'series': 'Ecco più', 'volume': '1', 'unit': unit, 'section': sect, 'pages': pages},
                    'grade': 8, 'foreignLanguageNo': 3, 'cefr': 'A1',
                    'themes': [x.strip() for x in themes.split(',')][:5], 'tags': ['lehrwerk', 'vokabeln']}
    }
    return pkg_id, p

def parse(path):
    pk, cur = [], None
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.strip() or line.startswith('#'): continue
        if line.startswith('@'):
            cur = (line[1:], []); pk.append(cur); continue
        parts = line.split('|')
        t = parts[0].strip().replace("'", '’')
        trs = [x.strip() for x in parts[1].split(';') if x.strip()]
        hint = parts[2].strip() if len(parts) > 2 else ''
        cur[1].append((t, trs, hint))
    return pk

if __name__ == '__main__':
    files = [pathlib.Path(a) for a in sys.argv[1:]] or sorted((ROOT / 'werkzeuge' / 'ecco1').glob('*.txt'))
    OUT.mkdir(parents=True, exist_ok=True)
    n = 0
    for f in files:
        for header, rows in parse(f):
            pid, pkg = build(header, rows)
            (OUT / f'{pid}.json').write_text(json.dumps(pkg, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
            n += 1
            print(f'{pid}: {len(rows)} Einträge')
    print(n, 'Pakete geschrieben')
