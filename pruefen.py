#!/usr/bin/env python3
"""Prüft den Quellstand von daje: JS-Syntax, alle Node-Tests, Inhaltsinventar, optional Browser-Test.

Aufruf im Repo-Wurzelverzeichnis:
  python3 pruefen.py            Syntax, Node-Tests (wie `npm test`), Inventar
  python3 pruefen.py --browser  zusätzlich Playwright-Ende-zu-Ende-Test (portal/tests/e2e.test.cjs)
Für den Browser-Test einen vorhandenen Chromium über CHROMIUM_PATH angeben, falls die
Playwright-Version nicht zum installierten Browser passt.
"""
from pathlib import Path
import json, os, subprocess, sys

root = Path(__file__).resolve().parent
src = root / 'portal'

for f in sorted((src / 'dist').glob('*.js')):
    subprocess.run(['node', '--check', str(f)], cwd=src, check=True)

# Dieselben Tests wie `npm test` (Liste aus package.json, damit beide nie auseinanderlaufen).
script = json.loads((src / 'package.json').read_text())['scripts']['test']
for part in script.split('&&'):
    subprocess.run(part.split(), cwd=src, check=True)

subprocess.run(['node', str(root / 'uebergabe/validate-inventory.cjs')], cwd=root, check=True)

if '--browser' in sys.argv:
    env = dict(os.environ)
    fallback = Path('/opt/pw-browsers/chromium')  # vorinstallierter Browser in Claude-Cloud-Sitzungen
    if 'CHROMIUM_PATH' not in env and fallback.exists():
        env['CHROMIUM_PATH'] = str(fallback)
    subprocess.run(['node', 'tests/e2e.test.cjs'], cwd=src, check=True, env=env)
else:
    print('Browser-Test übersprungen (mit  python3 pruefen.py --browser  einschalten; braucht Playwright).')
print('Quellstand, JavaScript-Syntax, Tests und Inhaltsinventar erfolgreich geprüft.')
