#!/bin/bash
# Doppelklick im Finder startet das Menü. Voraussetzung: Python 3 und Node (beides auf dem Mac installiert).
cd "$(dirname "$0")/.." || exit 1
if [ -f werkzeuge/schluessel.env ]; then set -a; . werkzeuge/schluessel.env; set +a; fi
KI=${KI_ANBIETER:-claude}
while true; do
  echo ""
  echo "  1  Transkripte holen                (aus werkzeuge/videos.csv)"
  echo "  2  Probelauf: 3 Hörübungen mit KI   ($KI)"
  echo "  3  Alle Hörübungen mit KI erzeugen  ($KI)"
  echo "  4  Ohne Schlüssel: Aufträge für den Chat schreiben"
  echo "  5  Chat-Antworten einlesen          (aus werkzeuge/antworten/)"
  echo "  6  Bericht öffnen"
  echo "  7  Alles prüfen und bündeln"
  echo "  8  Videos automatisch suchen        (YouTube-Schlüssel nötig)"
  echo "  q  Beenden"
  read -r -p "Auswahl: " a
  case "$a" in
    1) python3 werkzeuge/ki_grundstock.py transkripte werkzeuge/videos.csv ;;
    2) python3 werkzeuge/ki_grundstock.py hoeren werkzeuge/videos.csv --anbieter "$KI" --limit 3 ;;
    3) python3 werkzeuge/ki_grundstock.py hoeren werkzeuge/videos.csv --anbieter "$KI" ;;
    4) python3 werkzeuge/ki_grundstock.py chat werkzeuge/videos.csv && open werkzeuge/auftraege 2>/dev/null ;;
    5) python3 werkzeuge/ki_grundstock.py einlesen werkzeuge/videos.csv ;;
    6) open werkzeuge/entwuerfe/BERICHT.csv 2>/dev/null || cat werkzeuge/entwuerfe/BERICHT.csv ;;
    7) node werkzeuge/bundle_stock.cjs ;;
    8) python3 werkzeuge/gemini_grundstock.py suche werkzeuge/videos.csv ;;
    q) exit 0 ;;
  esac
done
