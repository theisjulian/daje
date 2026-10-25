#!/usr/bin/env python3
"""Wandelt werkzeuge/ecco1/*.txt (transkribierte Lehrwerksseiten) in Wortschatz-Pakete (Schema 1.2)
unter grundstock/vocabulary/. Aufruf:  python3 werkzeuge/ecco_import.py [datei.txt ...]
Danach:  node werkzeuge/bundle_stock.cjs"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'grundstock' / 'vocabulary'
BOOK = {'prefix':'ecco1','series':'Ecco più','volume':'1','grade':8,'fl':3,'cefr':'A1'}
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
    pkg_id = f"it-{BOOK['prefix']}-" + sid
    entries = []
    for i, (t, trs, hint, opt, ex, rel) in enumerate(rows, 1):
        e = {'id': f'{sid}-{i:03d}', 'target': t, 'translations': trs, 'page': pages}
        if opt: e['tags'] = ['fakultativ']
        if ex: e['example'] = ex
        if rel: e['related'] = rel
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
    full = f"{BOOK['series']} {BOOK['volume']} · {unit} · {sect}" if not unit.startswith('Anhang') else f"{BOOK['series']} {BOOK['volume']} · {sect}"
    p = {
        'format': 'theis-learning-package', 'schemaVersion': '1.2', 'kind': 'vocabulary',
        'id': pkg_id, 'title': full, 'language': 'it', 'translationLanguage': 'de', 'level': BOOK['cefr'],
        'description': f'Wortschatz zu „{title}“ aus {BOOK['series']} {BOOK['volume']} ({unit}, {sect}).',
        'topics': [x.strip() for x in themes.split(',')][:8],
        'collection': f"{BOOK['series']} {BOOK['volume']} (Cornelsen)", 'section': f'{unit} · {sect}',
        'sources': [{'kind': 'provided', 'citation': f'{BOOK['series']} {BOOK['volume']}, Cornelsen, Lista cronologica / Anhang, S. {pages} (vom Nutzer bereitgestellte Seiten)', 'rights': 'needs_review'}],
        'reviewNotes': ['Aus bereitgestellten Scans abgetippt; Ausgabe und Jahr des Lehrwerks noch eintragen.',
                        'Beispielsätze sind eigene Formulierungen (nicht aus dem Buch) und noch nicht fachlich geprüft; Verwandte Wörter (E/F/L) folgen dem Buch.',
                        'Plural-, Partizip- und Zusatzangaben stehen im Feld usage.'],
        'entries': entries,
        'catalog': {'origin': 'textbook',
                    'textbook': {'publisher': 'Cornelsen', 'series': BOOK['series'], 'volume': BOOK['volume'], 'unit': unit, 'section': sect, 'pages': pages},
                    'grade': BOOK['grade'], 'foreignLanguageNo': BOOK['fl'], 'cefr': BOOK['cefr'],
                    'themes': [x.strip() for x in themes.split(',')][:5], 'tags': ['lehrwerk', 'vokabeln']}
    }
    return pkg_id, p

RELATED = {}
def load_related(path):
    RELATED.clear()
    rp = path.parent / path.name.replace('lista-', 'related-')
    if rp.exists():
        for line in rp.read_text(encoding='utf-8').splitlines():
            if line.strip() and not line.startswith('#') and '|' in line:
                k, v = line.split('|', 1)
                RELATED[k.strip().replace("'", '’')] = v.strip()

def parse(path):
    load_related(path)
    pk, cur = [], None
    for line in path.read_text(encoding='utf-8').splitlines():
        if not line.strip(): continue
        if line.startswith('#!buch'):
            for kv in line.split()[1:]:
                k, v = kv.split('=', 1); v = v.replace('_', ' ')
                BOOK[{'fl': 'fl'}.get(k, k)] = int(v) if k in ('grade', 'fl') else v
            continue
        if line.startswith('#'): continue
        if line.startswith('@'):
            cur = (line[1:], []); pk.append(cur); continue
        parts = line.split('|')
        t = parts[0].strip().replace("'", '’')
        opt = t.startswith('*')
        t = t.lstrip('*').strip()
        trs = [x.strip() for x in parts[1].split(';') if x.strip()]
        hint = parts[2].strip() if len(parts) > 2 else ''
        ex = parts[3].strip() if len(parts) > 3 else ''
        rel = parts[4].strip() if len(parts) > 4 else ''
        if not rel: rel = RELATED.get(t, '')
        cur[1].append((t, trs, hint, opt, ex, rel))
    return pk

if __name__ == '__main__':
    files = [pathlib.Path(a) for a in sys.argv[1:]] or sorted((ROOT / 'werkzeuge').glob('ecco[0-9]/lista-*.txt'))
    OUT.mkdir(parents=True, exist_ok=True)
    n = 0
    DEFAULT = dict(BOOK)
    for f in files:
        BOOK.clear(); BOOK.update(DEFAULT)
        for header, rows in parse(f):
            pid, pkg = build(header, rows)
            (OUT / f'{pid}.json').write_text(json.dumps(pkg, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
            n += 1
            print(f'{pid}: {len(rows)} Einträge')
    print(n, 'Pakete geschrieben')
