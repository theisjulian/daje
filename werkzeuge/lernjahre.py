#!/usr/bin/env python3
"""Wortlisten und Grammatik auf die eigene Gliederung umstellen: Primo/Secondo/Terzo anno, eigene Lektionstitel,
keine Seitenangaben, keine Verlags- oder Buchnamen. Wirkt auf grundstock/vocabulary/*.json (IDs bleiben gleich,
damit Lernstände erhalten bleiben). Mehrfach ausführbar.  Aufruf:  python3 werkzeuge/lernjahre.py"""
import json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SERIES = 'Corso daje'
ANNO = {'1': 'Primo anno', '2': 'Secondo anno', '3': 'Terzo anno'}
# Lektionstitel je Lernjahr (eigene Themenbezeichnungen)
UNITS = {
    '1': {'0': '0 · Primi passi', '1': '1 · La città', '2': '2 · La mia camera', '3': '3 · La scuola', '4': '4 · Tempo libero',
          '5': '5 · Famiglia e gite', '6': '6 · Vestiti e cibo', '7': '7 · Estate in Italia'},
    '2': {'1': '1 · Ricordi', '2': '2 · Vita online', '3': '3 · Roma ed Europa', '4': '4 · Lavoro e futuro',
          '5': '5 · Ieri e oggi', '6': '6 · Città e creatività'},
    '3': {'1': '1 · Tradizioni', '2': '2 · Vivere all’estero', '3': '3 · Società e solidarietà', '4': '4 · Nord e Sud'},
}
EXTRA = {  # Zusatzkapitel (früher Moduli/Anhang), nach Paket-ID
    'it-ecco1-m1-giro-ditalia': ('Extra 1 · In giro per l’Italia', ''),
    'it-ecco1-m2-arte-cultura-scienze': ('Extra 2 · Arte e scienza', ''),
    'it-ecco1-m3-la-toscana': ('Extra 3 · In Toscana', ''),
    'it-ecco1-m4-incontro-con-liga': ('Extra 4 · Musica dal vivo', ''),
    'it-ecco1-aa-italiano-in-classe': ('Extra · In classe', 'L’italiano in classe'),
    'it-ecco1-aa-arbeitsauftraege': ('Extra · In classe', 'Le consegne'),
    'it-ecco2-m-uno-stage': ('Extra 1 · Esperienze di lavoro', ''),
    'it-ecco2-m-musica': ('Extra 2 · Musica italiana', ''),
}
def section_name(sec):
    s = sec.strip()
    if re.match(r'^(approccio|ciao)', s, re.I): return 'Per cominciare'
    if re.match(r'^per (parlare|comunicare)', s, re.I): return 'Frasi utili'
    m = re.match(r'^\d([A-C])\b', s)
    if m: return 'Parte ' + m.group(1)
    return s

def main():
    n = 0
    for f in sorted((ROOT / 'grundstock' / 'vocabulary').glob('*.json')):
        p = json.loads(f.read_text(encoding='utf-8'))
        m = re.match(r'^it-ecco(\d)-', p['id'])
        if not m:
            continue
        vol = m.group(1)
        tb = (p.get('catalog') or {}).get('textbook') or {}
        if tb.get('series') == SERIES:
            continue  # schon umgestellt
        unit_old, sect_old = tb.get('unit', ''), tb.get('section', '')
        if p['id'] in EXTRA:
            unit, sect = EXTRA[p['id']]
            sect = sect or 'Lessico'
        elif unit_old.startswith('Anhang'):
            unit, sect = 'Extra · Numeri e calendario', sect_old
        else:
            u = '0' if re.match(r'^ciao', unit_old, re.I) else re.search(r'\d+', unit_old).group(0)
            unit, sect = UNITS[vol][u], section_name(sect_old)
        p['catalog']['textbook'] = {'series': SERIES, 'volume': vol, 'unit': unit, 'section': sect}
        p['catalog']['tags'] = ['lernjahr', 'vokabeln']
        p['title'] = f"{ANNO[vol]} · {unit} · {sect}"
        p['section'] = f"{unit} · {sect}"
        p['collection'] = ANNO[vol]
        p['description'] = f"Wortschatz {ANNO[vol]} ({vol}. Lernjahr), {unit}, {sect}."
        p['sources'] = [{'kind': 'own', 'citation': f'Wortschatz {ANNO[vol]} · daje', 'rights': p['sources'][0].get('rights', 'needs_review')}]
        p['reviewNotes'] = [r for r in p.get('reviewNotes', []) if not re.search(r'Scan|Buch|Lehrwerk|Ausgabe', r)]
        for e in p['entries']:
            e.pop('page', None)
        f.write_text(json.dumps(p, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        n += 1
    print(f'{n} Wortlisten umgestellt')

if __name__ == '__main__':
    main()
