#!/bin/bash
# Doppelklick im Finder startet das Menü. Voraussetzung: Python 3 und Node (beides auf dem Mac installiert).
cd "$(dirname "$0")/.." || exit 1
if [ -f werkzeuge/schluessel.env ]; then set -a; . werkzeuge/schluessel.env; set +a; fi
while true; do
  echo ""
  echo "  1  Videos automatisch suchen        (YouTube-Schlüssel nötig)"
  echo "  2  Hörübungen erzeugen              (Gemini-Schlüssel nötig)"
  echo "  3  Wortschatz erzeugen              (Gemini-Schlüssel nötig)"
  echo "  4  Alles prüfen und bündeln"
  echo "  5  Probelauf mit 3 Videos"
  echo "  6  Gemini-Stapel vorbereiten        (ohne Schlüssel: 10 Videos für den Gemini-Chat)"
  echo "  7  Gemini-Antworten einlesen        (aus werkzeuge/antworten.txt)"
  echo "  q  Beenden"
  read -r -p "Auswahl: " a
  case "$a" in
    1) python3 werkzeuge/gemini_grundstock.py suche werkzeuge/videos.csv ;;
    2) python3 werkzeuge/gemini_grundstock.py hoeren werkzeuge/videos.csv ;;
    3) python3 werkzeuge/gemini_grundstock.py wortschatz werkzeuge/woerter.csv ;;
    4) node werkzeuge/bundle_stock.cjs ;;
    5) python3 werkzeuge/gemini_grundstock.py hoeren werkzeuge/videos.csv --limit 3 && node werkzeuge/bundle_stock.cjs ;;
    6) python3 werkzeuge/gemini_stapel.py bauen --anzahl 10 && open werkzeuge/Gemini-Stapel.md 2>/dev/null ;;
    7) python3 werkzeuge/gemini_stapel.py einlesen && node werkzeuge/bundle_stock.cjs ;;
    q) exit 0 ;;
  esac
done
