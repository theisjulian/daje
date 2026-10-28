#!/usr/bin/env python3
"""Übersetzungstabellen werkzeuge/i18n/rows_*.py → portal/dist/i18n-rows-2.js (ergänzt UI_ROWS_EXTRA)."""
import json, pathlib, runpy
D = pathlib.Path(__file__).resolve().parent
rows, seen = [], set()
for f in sorted(D.glob('rows_*.py')):
    for r in runpy.run_path(str(f))['ROWS']:
        assert len(r) == 5, (f.name, r)
        if r[0] in seen: continue
        seen.add(r[0]); rows.append(r)
out = D.parent.parent / 'portal' / 'dist' / 'i18n-rows-2.js'
out.write_text("// Automatisch erzeugt aus werkzeuge/i18n/rows_*.py (python3 werkzeuge/i18n/bauen.py). Nicht von Hand ändern.\n"
               "UI_ROWS_EXTRA.push(\n" + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in rows) + "\n);\n", encoding='utf-8')
print(len(rows), 'Zeilen')
