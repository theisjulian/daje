#!/usr/bin/env python3
from pathlib import Path
import hashlib,json,subprocess,sys
root=Path(__file__).resolve().parent
src=root/'portal'
print('Hinweis: Seit Schritt 1 ist dist formatiert; die Hashes in SOURCE-SNAPSHOT.json gehören zum unformatierten Original (siehe CHANGELOG-Schritt-1.md).',flush=True)
for f in sorted((src/'dist').glob('*.js')):
 subprocess.run(['node','--check',str(f)],cwd=src,check=True)
for name in ['content','grading','progress']:
 subprocess.run(['node','tests/'+name+'.test.cjs'],cwd=src,check=True)
subprocess.run(['node',str(root/'uebergabe/validate-inventory.cjs')],cwd=root,check=True)
if '--browser' in sys.argv:
 subprocess.run(['node','tests/e2e.test.cjs'],cwd=src,check=True)
else:
 print('Browser-Test übersprungen (mit  python3 pruefen.py --browser  einschalten; braucht Playwright).')
print('Quellstand, JavaScript-Syntax, Tests und Inhaltsinventar erfolgreich geprüft.')
