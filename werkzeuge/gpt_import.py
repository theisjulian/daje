#!/usr/bin/env python3
"""Fertige Grammatikpakete aus den ChatGPT-Übergaben (A1/A2 „daje-202“, B1/B2 „daje-b1b2“) übernehmen und das
Themenregister der Lernjahre 1–6 schreiben.

Aufruf:  python3 -I werkzeuge/gpt_import.py <ordner-a1a2> <ordner-b1b2>
         danach: node werkzeuge/bundle_stock.cjs && python3 werkzeuge/qualitaet.py

Was passiert:
- Themenregister aus katalog-gesamt-mit-b1-b2.json → portal/dist/themen-data.js (ohne Lehrwerknamen und Seiten).
  Die Reihenfolge innerhalb einer Lektion folgt Abschnitt (Per cominciare, Parte A, Parte B, …) und der Lehrwerksfolge;
  vorhandene Themen aus Lernjahr 1 behalten ihre bisherige Position.
- Die Pakete aus import-grammatik/ werden bereinigt nach grundstock/grammar/ geschrieben: Titel ohne Nummer und ohne
  deutschen Zusatz, Hinweise („Indizi“) direkt an der Lücke, kurze Anweisung in der Zielsprache plus Deutsch,
  Quellen ohne Buchnamen, Einordnung (Lernjahr, Lektion, Abschnitt) aus dem Register. IDs bleiben unverändert.
- Aufgaben im Redaktionsformat (Lesen, Schreiben, Analyse) werden hier nicht übernommen.
Mehrfach ausführbar."""
import json, re, sys, pathlib, collections, hashlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'grundstock' / 'grammar'
LIVELLO = {'leicht': 'livello facile', 'mittel': 'livello medio', 'schwer': 'livello difficile'}
SECTION_RANK = ['Per cominciare', 'Parte A', 'Parte B', 'Parte C', 'Grammatica', 'Modulo', 'Ripasso', 'Lessico',
                'Laboratorio testi', 'Laboratorio integrativo daje', 'Lehrplanergänzung', 'Oberstufe']
SECTION_SHOW = {'Oberstufe': '', 'Laboratorio integrativo daje': 'Laboratorio', 'Lehrplanergänzung': 'Approfondimento'}
DISTR = {k: v for k, v in json.loads((pathlib.Path(__file__).resolve().parent / 'distraktoren.json').read_text(encoding='utf-8')).items() if not k.startswith('_')}
GRADE = {1: 8, 2: 9, 3: 10, 4: 11, 5: 12, 6: 13}


def unit_no(u):
    if u.startswith('Lehrplan · Sprachliche'):
        return 1
    if u.startswith('Lehrplan · Kompetenzen'):
        return 2
    m = re.search(r'\d+', u)
    if u.lower().startswith('extra'):
        return 100 + (int(m.group(0)) if m else 0)
    return int(m.group(0)) if m else 99


def sec_rank(s):
    return SECTION_RANK.index(s) if s in SECTION_RANK else len(SECTION_RANK)


def existing_orders():
    """Bisherige Position der Themen (nur eigene Pakete, nicht die importierten)."""
    o = {}
    for f in OUT.glob('*.json'):
        if f.name.startswith('g-daje-'):
            continue
        d = json.loads(f.read_text(encoding='utf-8'))
        g = d.get('grammar') or {}
        if g.get('topic') and isinstance(g.get('order'), int):
            o[g['topic']] = min(o.get(g['topic'], 10 ** 6), g['order'])
    return o


def build_register(kat):
    old = existing_orders()
    reg = {}
    for i, t in enumerate(kat['topics']):
        page = (t.get('reference') or {}).get('printedPage') or 999
        year = int(t['learningYear'])
        if t['id'] in old:
            order = old[t['id']]
        else:
            order = 1000 + sec_rank(t['section']) * 1000 + int(page) * 2 + i / 1000
        reg[t['id']] = {
            'year': year, 'unit': t['unit'], 'unitNo': unit_no(t['unit']), 'section': SECTION_SHOW.get(t['section'], t['section']),
            'title': t['title'], 'curriculum': t.get('curriculum') or '', 'order': round(order, 3),
        }
    return reg


def tidy(s):
    return s.replace("'", '’')


GENERIC = re.compile(r'banca|scegli genere|concorda nel contesto|^voce', re.I)


def hint_short(h):
    h = h.strip().rstrip('.')
    m = re.match(r'^Inizia con «(.+?)»', h)
    if m:
        return m.group(1)
    return h.replace(' · ', ', ')


def inline_hints(text):
    """„Indizi:\\ng1: …“ am Textende → „[[g1]] (…)“; allgemeine Wiederholungen entfallen."""
    m = re.search(r'\n\n[^\n:]+:\n((?:g\d+:.*(?:\n|$))+)\s*$', text)
    if not m:
        return text, False
    body = text[:m.start()]
    hints = {}
    for line in m.group(1).strip().split('\n'):
        k, _, v = line.partition(':')
        hints[k.strip()] = v.strip()
    vals = list(hints.values())
    cnt = collections.Counter(vals)
    used = False
    for k, v in hints.items():
        if not v or GENERIC.search(v) or (cnt[v] > 2 and len(vals) > 3):
            continue
        body = body.replace('[[' + k + ']]', '[[' + k + ']] (' + hint_short(v) + ')', 1)
        used = True
    return body, used


PROMPTS = {
    'Completa tutte le righe. Per le forme composte rispetta le indicazioni.': ('Completa le forme. Usa le indicazioni tra parentesi.', 'Ergänze die Formen. Beachte die Angaben in Klammern.'),
    'Completa le forme richieste. Mantieni persona, modo e tempo indicati.': ('Completa le forme richieste. Persona, modo e tempo sono tra parentesi.', 'Bilde die verlangten Formen. Person, Modus und Zeit stehen in Klammern.'),
    'Applica lo stesso punto linguistico in contesti nuovi.': ('Usa la stessa struttura in frasi nuove.', 'Wende dieselbe Struktur in neuen Sätzen an.'),
    'Applicazione: completa le forme o le trasformazioni indicate dopo aver lavorato sul testo.': ('Completa le forme o le trasformazioni indicate.', 'Ergänze die angegebenen Formen bzw. Umformungen.'),
    'Completa il testo con il lessico specifico. Usa la banca delle parole e le definizioni.': ('Completa il testo con le parole date. Le definizioni ti aiutano.', 'Ergänze den Text mit den vorgegebenen Wörtern. Die Erklärungen helfen dir.'),
    'Trasforma i numeri: dalle cifre alle lettere e dalle lettere alle cifre.': (None, 'Schreibe die Zahlen in Buchstaben bzw. in Ziffern.'),
    'Scegli la forma del passato prossimo corretta nel contesto.': (None, 'Wähle die passende Form des passato prossimo.'),
    'Scegli e oppure che.': ('Scegli: e oppure che?', 'Wähle: e oder che?'),
    'Completa i pronomi e identifica il referente di ciascuno.': (None, 'Ergänze die Pronomen und gib an, worauf sie sich beziehen.'),
    'Completa i termini del lavoro usando le definizioni.': (None, 'Ergänze die Begriffe aus der Arbeitswelt anhand der Erklärungen.'),
    'Completa gli aggettivi accordandoli con i nomi del racconto. Usa il lemma indicato.': ('Completa gli aggettivi nella forma giusta.', 'Ergänze die Adjektive in der richtigen Form.'),
}
TEXT_PROMPTS = {'Completa il testo. Segui gli indizi; mantieni il significato del testo comune al blocco.', 'Completa il testo. Usa le indicazioni per ogni spazio.',
                'Ricostruisci il testo usando la banca delle parole. Usa ogni voce una volta.'}


def fix_question(q):
    q = dict(q)
    hinted = False
    if q.get('text'):
        q['text'], hinted = inline_hints(q['text'])
        q['text'] = tidy(q['text'])
    for g in q.get('gaps', []):
        if 'acceptedAnswers' in g:
            g['acceptedAnswers'] = [tidy(a) for a in g['acceptedAnswers']]
        if 'options' in g:
            g['options'] = [tidy(o) for o in g['options']]
        if 'answer' in g and isinstance(g['answer'], str):
            g['answer'] = tidy(g['answer'])
    p = q['prompt']
    if p in TEXT_PROMPTS:
        if q['type'] == 'gap_choice':
            q['prompt'], q['promptHelp'] = 'Completa il testo: scegli la forma giusta.', 'Ergänze den Text: Wähle die richtige Form.'
        elif q.get('wordBank'):
            q['prompt'], q['promptHelp'] = 'Completa il testo con le parole date. Usa ogni parola una volta.', 'Ergänze den Text mit den vorgegebenen Wörtern. Verwende jedes Wort einmal.'
        elif hinted:
            q['prompt'], q['promptHelp'] = 'Completa il testo. Usa le indicazioni tra parentesi.', 'Ergänze den Text. Beachte die Angaben in Klammern.'
        else:
            q['prompt'], q['promptHelp'] = 'Completa il testo.', 'Ergänze den Text.'
    elif p in PROMPTS:
        it, de = PROMPTS[p]
        q['prompt'] = it or p
        q['promptHelp'] = de
    # „1. Completa con bello: un __ quadro → [[g1]]“ → „1. un [[g1]] quadro (bello)“
    if q.get('text') and '→ [[' in q['text']:
        def inline(m):
            num, body, gap = m.group(1), m.group(2), m.group(3)
            hint = ''
            h = re.match(r'^(?:Completa con (?:l’articolo determinativo|[^:]+)):\s*', body)
            if h:
                w = re.match(r'^Completa con ([^:]+):', body).group(1).strip()
                body = body[h.end():]
                hint = '' if 'articolo' in w else ' (' + w + ')'
            if '__' in body:
                return num + body.replace('__', gap, 1).rstrip() + hint
            return m.group(0)
        q['text'] = re.sub(r'^(\d+\.\s*)(.*?)\s*→\s*(\[\[g\d+\]\])\s*$', inline, q['text'], flags=re.M)
    ex = q.get('explanation', '')
    if ex in ('Usa la persona, il tempo e il contesto indicati.', 'Rispetta persona, modo e tempo richiesti.'):
        ex = ''
        q.pop('explanation', None)
    ex = re.sub(r'\s*Il testo completo è comune al blocco\.?', '', ex).strip()
    ex = ex.replace('Confronta ogni forma con il contesto e con l’indizio.', 'Controlla ogni forma nel contesto.')
    if ex:
        q['explanation'] = ex
    return q


def clean_title(d, texts, editorial):
    t = re.sub(r'^\d{3}\s*·\s*', '', d['title']).strip()
    if d['id'].startswith('g-daje-b1b2-'):
        e = editorial.get(d['id'][2:]) or {}
        base = (texts.get(e.get('textId')) or {}).get('title')
        return base or t
    if ' — ' in t:
        return t.split(' — ')[0].strip()
    return d['grammar']['topicTitle']


def clean_sources(srcs):
    out = []
    for s in srcs:
        c = s.get('citation', '')
        if re.search(r'202 esercizi|Eigenständig für [Dd]aje|Übergabepaket', c):
            continue
        c = re.sub(r'\s*Keine Lizenzbehauptung[^.]*\.', '', c).strip()
        out.append({**s, 'citation': c})
    return [{'kind': 'own', 'citation': 'Eigene Übung (daje).', 'rights': 'own'}] + out


def main(a_dir, b_dir):
    a_dir, b_dir = pathlib.Path(a_dir), pathlib.Path(b_dir)
    kat = json.loads((b_dir / 'katalog-gesamt-mit-b1-b2.json').read_text(encoding='utf-8'))
    reg = build_register(kat)
    texts = {t['id']: t for t in json.loads((b_dir / 'grundtexte.json').read_text(encoding='utf-8'))}
    editorial = {e['id']: e for e in json.loads((b_dir / 'alle-202-aufgaben.json').read_text(encoding='utf-8'))}
    files = sorted((a_dir / 'import-grammatik').glob('g-daje-202-*.json')) + sorted((b_dir / 'import-grammatik').glob('g-daje-b1b2-*.json'))
    pkgs = [json.loads(f.read_text(encoding='utf-8')) for f in files]
    # Titel innerhalb eines Themas eindeutig halten
    titles = collections.defaultdict(list)
    for d in pkgs:
        d['_title'] = clean_title(d, texts, editorial)
        titles[(d['grammar']['topic'], d['_title'])].append(d)
    for (topic, t), group in titles.items():
        if len(group) > 1:
            for n, d in enumerate(sorted(group, key=lambda x: x['id']), 1):
                d['_title'] = f'{t} ({n})'
    used = set()
    thin = []
    used_distr = set()
    for d in pkgs:
        g = d['grammar']
        r = reg.get(g['topic'])
        if not r:
            raise SystemExit(f"{d['id']}: Thema {g['topic']} fehlt im Register")
        used.add(g['topic'])
        title = d.pop('_title')
        g['topicTitle'] = r['title']
        d['title'] = title
        d['description'] = f"{r['title']} · {title} · {LIVELLO.get(g['difficulty'], '')}."
        d['topics'] = [r['title'], 'Grammatik']
        d['sources'] = clean_sources(d.get('sources', []))
        cat = d['catalog']
        cat['textbook'] = {'series': 'Corso daje', 'volume': str(r['year']), 'unit': r['unit'], 'section': r['section']}
        cat['grade'] = GRADE[r['year']]
        cat['tags'] = ['grammatik']
        if r['curriculum']:
            cat['curriculum'] = r['curriculum']
        d.pop('reviewNotes', None)
        qs = [fix_question(q) for q in d['questions']]
        # Auswahllücken: Alternativen gleicher Wortart und Form aus werkzeuge/distraktoren.json (sonst verrät Genus/Numerus die Lösung)
        for q in qs:
            if q['type'] != 'gap_choice':
                continue
            for g in q['gaps']:
                alt = DISTR.get(f"{d['id']}/{q['id']}/{g['id']}")
                if alt:
                    opts = [g['answer']] + [a for a in alt if a != g['answer']][:2]
                    k = int(hashlib.md5((d['id'] + g['id']).encode()).hexdigest(), 16) % len(opts)
                    g['options'] = opts[k:] + opts[:k]
                    used_distr.add(f"{d['id']}/{q['id']}/{g['id']}")
        # Folgeaufgaben mit nur ein oder zwei Lücken ergeben keine eigene Übung: weglassen und für ChatGPT notieren
        keep = [q for i, q in enumerate(qs) if i == 0 or len(q.get('gaps') or []) > 2 or q['type'] not in ('gap_fill', 'gap_choice')]
        if len(keep) < len(qs):
            thin.append(f"- {d['id']} „{title}“: Folgeaufgabe mit {len(qs[-1].get('gaps') or [])} Lücke(n) entfernt ({qs[-1]['prompt']})")
        d['questions'] = keep
        (OUT / (d['id'] + '.json')).write_text(json.dumps(d, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    # Register: nur Themen mit Material oder vorhandene Themen; leere Planungsthemen bleiben im Register für später
    js = ('/* Themenregister Grammatik, Lernjahre 1–6 (erzeugt von werkzeuge/gpt_import.py, nicht von Hand ändern).\n'
          '   Bestimmt Lernjahr, Lektion, Abschnitt und Reihenfolge eines Themas; nicht das zuerst geladene Paket. */\n'
          'const GR_REGISTER = ' + json.dumps(reg, ensure_ascii=False, separators=(',', ':')) + ';\n')
    (ROOT / 'portal' / 'dist' / 'themen-data.js').write_text(js, encoding='utf-8')
    (ROOT / 'werkzeuge' / 'gpt-nacharbeit.md').write_text(
        '# Nacharbeit für ChatGPT\n\nDiese Folgeaufgaben waren zu dünn (1–2 Lücken) und wurden beim Import weggelassen. '
        'Bitte je Übung eine vollwertige Anwendungsaufgabe mit 6–10 Lücken zum selben Thema liefern (gleiche ID, gleiches Format):\n\n'
        + '\n'.join(thin) + '\n', encoding='utf-8')
    missing = [k for k in DISTR if k not in used_distr]
    if missing:
        raise SystemExit('Ablenker ohne passende Lücke: ' + ', '.join(missing[:5]))
    print(f'{len(used_distr)} Auswahllücken mit neuen Ablenkern.')
    print(f'{len(pkgs)} Pakete übernommen, {len(used)} Themen mit neuem Material, Register mit {len(reg)} Themen.')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(*sys.argv[1:])
