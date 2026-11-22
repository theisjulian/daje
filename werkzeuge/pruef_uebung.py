#!/usr/bin/env python3
"""Formale Prüfung einzelner Grammatikpakete (ergänzt qualitaet.py; fängt Fehler, die beim Schreiben neuer Übungen
typisch sind). Aufruf:  python3 werkzeuge/pruef_uebung.py <paket.json|ordner|präfix*> …
Prüft: Vertrag der App (bundle_stock --check), Mindestlänge, doppelte Optionen, Lösung nicht in den Optionen,
Lösung steht schon im Satz, leere Lösungen, doppelte Ordnungsteile, Kategorien ohne Einträge, fehlende deutsche Hilfe."""
import json, pathlib, re, subprocess, sys, glob

ROOT = pathlib.Path(__file__).resolve().parent.parent
MIN = 8


def units(q):
    t = q['type']
    if t in ('gap_fill', 'gap_choice', 'note_fill'): return len(q['gaps'])
    if t == 'error_correction': return len(q['errors'])
    if t == 'matching': return len(q['pairs'])
    if t in ('categorize', 'speaker_match', 'sentence_completion'): return len(q['items'])
    if t == 'table_fill': return sum(1 for r in q['rows'] for c in r if isinstance(c, dict))
    if t == 'ordering':
        it = q.get('items') or []
        return len(it) + 2 if it and sum(len(i['text']) for i in it) / len(it) > 25 else 3
    if t == 'open_answer': return 8
    return 1


def norm(s):
    return re.sub(r'\s+', ' ', s.lower().replace('’', "'").strip().rstrip('.!?'))


def check(path):
    out = []
    p = json.loads(path.read_text(encoding='utf-8'))
    r = json.loads(subprocess.run(['node', str(ROOT / 'werkzeuge/bundle_stock.cjs'), '--check', str(path)], capture_output=True, text=True).stdout or '{"ok":false,"errors":["keine Ausgabe"]}')
    if not r['ok']: out.append('VERTRAG: ' + ' · '.join(r['errors'][:4]))
    qs = p.get('questions', [])
    n = sum(units(q) for q in qs)
    long_text = sum(len(q.get('text') or '') for q in qs) + len((p.get('reading') or {}).get('text') or '') >= 600
    if n < (3 if long_text else MIN): out.append(f'zu kurz: {n} Einheiten (mindestens {MIN})')
    if all(q['type'] == 'open_answer' for q in qs): out.append('nur offene Antworten: nichts wird automatisch bewertet')
    for q in qs:
        i, t = q['id'], q['type']
        if not q.get('prompt', '').strip(): out.append(f'{i}: Aufgabenstellung fehlt')
        if not q.get('promptHelp'): out.append(f'{i}: deutsche Hilfe zur Anweisung fehlt')
        if q.get('explanation') and not q.get('explanationHelp'): out.append(f'{i}: deutsche Hilfe zur Erklärung fehlt')
        if t == 'gap_choice':
            for g in q['gaps']:
                o = [norm(x) for x in g['options']]
                if len(set(o)) < len(o): out.append(f'{i}/{g["id"]}: doppelte Option {g["options"]}')
                if g['answer'] not in g['options']: out.append(f'{i}/{g["id"]}: Lösung nicht in den Optionen')
                if len(o) < 2: out.append(f'{i}/{g["id"]}: nur eine Option')
        if t in ('gap_fill', 'error_correction', 'table_fill'):
            cells = q.get('gaps') or q.get('errors') or [c for r in q.get('rows', []) for c in r if isinstance(c, dict)]
            for g in cells:
                a = g['acceptedAnswers']
                if not a or any(not x.strip() for x in a): out.append(f'{i}/{g["id"]}: leere Lösung')
                if len(set(map(norm, a))) < len(a): out.append(f'{i}/{g["id"]}: Lösung doppelt {a}')
                if t == 'error_correction' and norm(g['wrong']) in map(norm, a): out.append(f'{i}/{g["id"]}: „falsch“ = „richtig“ ({g["wrong"]})')
            ids = re.findall(r'\[\[(\w+)\]\]', q.get('text', ''))
            if t != 'table_fill' and sorted(ids) != sorted(g['id'] for g in cells): out.append(f'{i}: Lücken im Text und in der Liste stimmen nicht überein')
            if t == 'gap_fill' and q.get('wordBank'):
                bank = [norm(g['acceptedAnswers'][0]) for g in cells] + [norm(x) for x in q.get('extraWords', [])]
                for x in q.get('extraWords', []):
                    if any(norm(x) in map(norm, g['acceptedAnswers']) for g in cells): out.append(f'{i}: Zusatzwort „{x}“ ist zugleich eine Lösung')
        if t == 'single_choice':
            o = [norm(x['text']) for x in q['options']]
            if len(set(o)) < len(o): out.append(f'{i}: doppelte Antwortoption')
            if len(o) < 3: out.append(f'{i}: weniger als drei Optionen')
        if t == 'matching':
            l = [norm(x['left']) for x in q['pairs']]
            if len(set(l)) < len(l): out.append(f'{i}: linke Seite doppelt')
            rr = [norm(x['right']) for x in q['pairs']]
            for d in q.get('distractors', []):
                if norm(d) in rr: out.append(f'{i}: Ablenker „{d}“ ist zugleich eine Lösung')
        if t == 'categorize':
            used = {x['category'] for x in q['items']}
            for c in q['categories']:
                if c['id'] not in used: out.append(f'{i}: Kategorie „{c["label"]}“ ohne Eintrag')
            tx = [norm(x['text']) for x in q['items']]
            if len(set(tx)) < len(tx): out.append(f'{i}: Eintrag doppelt')
        if t == 'ordering' and len(q['items']) < 3: out.append(f'{i}: weniger als drei Teile')
        if t == 'sentence_completion':
            for it in q['items']:
                for a in it['acceptedAnswers']:
                    if len(norm(a)) < 2: out.append(f'{i}/{it["id"]}: Schlüssel „{a}“ zu kurz (würde fast alles als richtig werten)')
        if t == 'sentence_completion':
            flat = lambda x: ' ' + ' '.join(re.sub(r'[.,!?;:…«»"]+', ' ', norm(x)).split()) + ' '
            for it in q['items']:
                # Alternativschlüssel dürfen fehlen; mindestens ein Schlüssel muss in der gezeigten Musterlösung stehen.
                if it.get('modelAnswer') and not any(flat(a).strip() and flat(a) in flat(it['modelAnswer']) for a in it['acceptedAnswers']):
                    out.append(f'{i}/{it["id"]}: Musterlösung enthält keinen der Schlüssel')
        if t == 'open_answer' and not q.get('modelAnswer', '').strip(): out.append(f'{i}: Musterlösung fehlt')
    return out


if __name__ == '__main__':
    files = []
    for a in sys.argv[1:] or [str(ROOT / 'grundstock/grammar')]:
        pa = pathlib.Path(a)
        files += sorted(pa.glob('*.json')) if pa.is_dir() else [pathlib.Path(x) for x in sorted(glob.glob(a))]
    bad = 0
    for f in files:
        for msg in check(f):
            bad += 1
            print(f'{f.stem}: {msg}')
    print(f'{len(files)} Pakete geprüft, {bad} Befunde')
    sys.exit(1 if bad else 0)
