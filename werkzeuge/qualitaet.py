#!/usr/bin/env python3
"""Qualitätsprüfung des Grundstocks (Hören + Wortschatz) und von Gemini-Stapeln.
Aufruf:  python3 werkzeuge/qualitaet.py [ordner ...]     (Standard: grundstock/)
Meldet je Paket Befunde; Exit-Code 1 bei harten Fehlern.  IPA-Prüfung: --ipa"""
import json, pathlib, re, sys, collections
ROOT = pathlib.Path(__file__).resolve().parent.parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
dirs = [pathlib.Path(a) for a in args] or [ROOT / 'grundstock']
hard, soft = [], []

IPA_OK = re.compile(r"^/?[\[]?[a-zæɐɑɔəɛɪʊʃʒʎɲŋθðɾɡʤʧʦʣˈˌːˑ̯̃. ()‿|a-z]+[\]]?/?$")
def vowel_groups(w):
    return len(re.findall(r'[aeiouàèéìòóù]+', w.lower()))
def ipa_nuclei(s):
    return len(re.findall(r'[aeiouɛɔɐəɪʊ]+', s))

def check_listening(p, f):
    q = p['questions']
    if len(q) < 10: soft.append(f'{f}: nur {len(q)} Aufgaben (Richtwert 10–20)')
    if len(q) > 26: soft.append(f'{f}: {len(q)} Aufgaben (sehr viele)')
    kinds = collections.Counter(x['type'] for x in q)
    if len(kinds) < 3: soft.append(f'{f}: nur {len(kinds)} Aufgabentypen')
    prompts = [x['prompt'].strip().lower() for x in q]
    if len(set(prompts)) < len(prompts): soft.append(f'{f}: doppelte Aufgabenstellung')
    for x in q:
        if not x.get('explanation'): soft.append(f'{f}/{x["id"]}: ohne Erklärung')
        if x['type'] == 'single_choice':
            ids = [o['id'] for o in x['options']]
            if x['correctOptionId'] not in ids: hard.append(f'{f}/{x["id"]}: Lösung nicht in Optionen')
            texts = [o['text'].strip().lower() for o in x['options']]
            if len(set(texts)) < len(texts): hard.append(f'{f}/{x["id"]}: doppelte Antwortoption')
            longest = max(x['options'], key=lambda o: len(o['text']))
            if x['correctOptionId'] == longest['id'] and len(longest['text']) > 1.6 * sorted(len(o['text']) for o in x['options'])[-2]:
                soft.append(f'{f}/{x["id"]}: richtige Option auffällig am längsten')
    if not p.get('transcript') and not p.get('series'): soft.append(f'{f}: kein Transkript (Aufgaben ungeprüft am Medium)')
    if not p.get('teacherNotes'): soft.append(f'{f}: keine Lehrkraft-Hinweise')

def check_vocab(p, f):
    seen = set()
    for e in p['entries']:
        t = e['target']
        key = (t, tuple(e.get('translations', [])))
        if key in seen: soft.append(f'{f}: Eintrag kommt im Buch doppelt vor: {t}')
        seen.add(key)
        if not e.get('translations'): hard.append(f'{f}/{t}: ohne Übersetzung')
        if not e.get('example') and 'fakultativ' not in e.get('tags', []): soft.append(f'{f}/{t}: ohne Beispielsatz')
        core = re.sub(r'^(il|lo|la|l’|gli|le|i|un|una) ', '', t.lower())
        d = e.get('definition', '')
        if d and len(core) > 3 and core in d.lower(): soft.append(f'{f}/{t}: Erklärung enthält das Zielwort')
        if '--ipa' in sys.argv and e.get('ipa'):
            ipa = e['ipa']
            if not IPA_OK.match(ipa): hard.append(f'{f}/{t}: IPA enthält ungültige Zeichen: {ipa}')
            elif abs(vowel_groups(t.split()[-1]) - ipa_nuclei(ipa)) > 1: soft.append(f'{f}/{t}: IPA-Silbenzahl passt nicht: {ipa}')

n = 0
for d in dirs:
    for fp in sorted(d.rglob('*.json')):
        try: p = json.loads(fp.read_text(encoding='utf-8'))
        except Exception as ex: hard.append(f'{fp}: kein gültiges JSON ({ex})'); continue
        if p.get('format') != 'theis-learning-package': continue
        n += 1
        (check_listening if p['kind'] == 'listening' else check_vocab)(p, fp.stem)
print(f'{n} Pakete geprüft: {len(hard)} harte Fehler, {len(soft)} Hinweise')
for h in hard[:60]: print('FEHLER ', h)
c = collections.Counter(s.split(': ', 1)[-1].split('/')[-1][:40] if False else re.sub(r'^[^:]+(/[^:]+)?: ', '', s)[:36] for s in soft)
for k, v in c.most_common(12): print(f'  {v:4d} × {k}')
sys.exit(1 if hard else 0)
