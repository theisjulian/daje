#!/usr/bin/env python3
"""Ohne API-Schlüssel: Stapel-Kommandodatei für Gemini im Browser (gemini.google.com) und Rückweg.

  python3 werkzeuge/gemini_stapel.py bauen [--anzahl 10]   erzeugt werkzeuge/Gemini-Stapel.md
  python3 werkzeuge/gemini_stapel.py einlesen [datei]     liest die Gemini-Antworten ein (Standard werkzeuge/antworten.txt)

Ablauf: Gemini-Stapel.md komplett in einen neuen Gemini-Chat einfügen (Modell „Pro“/„Thinking“), nach jeder Antwort
„weiter“ schreiben, alle Antworten nacheinander in antworten.txt kopieren, dann „einlesen“ und „bündeln“."""
import argparse, json, re, sys, subprocess
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gemini_grundstock as g

ROOT, OUT = g.ROOT, g.OUT
ANTW = ROOT / "werkzeuge" / "antworten.txt"
ZIEL = ROOT / "werkzeuge" / "Gemini-Stapel.md"

PROTOKOLL = """
STAPELMODUS FÜR DEN GEMINI-CHAT (verbindlich):
- Unten steht eine nummerierte Videoliste. Bearbeite sie der Reihe nach.
- Pro Antwort GENAU EIN Video und GENAU EIN JSON-Objekt (kein Text davor oder danach, keine Erklärungen). Danach warte, bis ich „weiter“ schreibe.
- Ein JSON-Objekt in einen Codeblock (```json) setzen, damit ich es kopieren kann.
- Schaue dir jedes Video wirklich an (Bild und Ton). Wenn du es nicht öffnen oder verstehen kannst: {"abbruch": "Grund", "videoId": "<ID>"} statt eines Pakets.
- Setze im Paket id, language, level genau wie in der Liste vorgegeben und media = {"type":"youtube","videoId":"<ID>"}.
- Alle Regeln der Kommandodatei und des Serienmodus oben gelten unverändert. Qualität vor Tempo: lieber ein Video überspringen als schwache Aufgaben liefern.
"""

def offen(zeilen):
    fertig = {p.stem for p in (OUT / "listening").glob("*.json")} if (OUT / "listening").exists() else set()
    for r in zeilen:
        url = (r.get("url") or "").strip()
        if not url or url.startswith("#"):
            continue
        try:
            vid = g.video_id(url)
        except ValueError:
            continue
        lang, level = (r.get("sprache") or "it").strip(), (r.get("niveau") or "A2").strip()
        pid = f"{lang}-{g.slug(r.get('thema') or vid)}-{level.lower()}"[:40].strip("-")
        if pid in fertig:
            continue
        yield pid, vid, url, lang, level, (r.get("thema") or "").strip()

def bauen(a):
    zeilen = g.csv_zeilen(ROOT / "werkzeuge" / "videos.csv")
    liste = list(offen(zeilen))[: a.anzahl]
    if not liste:
        print("Keine offenen Videos in werkzeuge/videos.csv (alle haben schon ein Paket).")
        return
    kopf = g.CMD.read_text(encoding="utf8") + "\n" + g.SERIE + PROTOKOLL + "\nVIDEOLISTE:\n"
    for i, (pid, vid, url, lang, level, thema) in enumerate(liste, 1):
        kopf += f"{i}. Video: {url} | videoId: {vid} | id: {pid} | language: {lang} | level: {level} | Thema: {thema}\n"
    kopf += "\nBeginne jetzt mit Video 1.\n"
    ZIEL.write_text(kopf, encoding="utf8")
    print(f"{len(liste)} Videos in {ZIEL.name} geschrieben ({len(kopf)//1000} KB). Ganz in einen neuen Gemini-Chat einfügen.")

def objekte(text):
    text = re.sub(r"```(?:json)?", "", text)
    dec, i, out = json.JSONDecoder(), 0, []
    while True:
        i = text.find("{", i)
        if i < 0:
            return out
        try:
            o, j = dec.raw_decode(text, i)
            out.append(o)
            i = j
        except json.JSONDecodeError:
            i += 1

def einlesen(a):
    pfad = Path(a.datei) if a.datei else ANTW
    if not pfad.exists():
        sys.exit(f"{pfad} fehlt. Alle Gemini-Antworten dort hineinkopieren.")
    zeilen = {}
    for r in g.csv_zeilen(ROOT / "werkzeuge" / "videos.csv"):
        try:
            zeilen[g.video_id(r.get("url", ""))] = r
        except Exception:
            pass
    (OUT / "listening").mkdir(parents=True, exist_ok=True)
    ok = schlecht = 0
    for o in objekte(g.text_lesen(pfad)):
        if "abbruch" in o:
            print("übersprungen (Gemini):", o.get("videoId", "?"), o["abbruch"]); continue
        vid = (o.get("media") or {}).get("videoId")
        r = zeilen.get(vid)
        if not r or o.get("kind") != "listening":
            print("nicht erkannt, übersprungen:", str(o.get("title") or o)[:70]); continue
        lang, level = (r.get("sprache") or "it").strip(), (r.get("niveau") or "A2").strip()
        pid = f"{lang}-{g.slug(r.get('thema') or vid)}-{level.lower()}"[:40].strip("-")
        o.update({"id": pid, "language": lang, "level": level})
        o["media"] = {"type": "youtube", "videoId": vid}
        tmp = OUT / "_tmp.json"
        tmp.write_text(json.dumps(o, ensure_ascii=False, indent=1), encoding="utf8")
        res = g.check(tmp)
        tmp.unlink(missing_ok=True)
        if not res.get("ok"):
            print(f"✗ {pid}: {'; '.join(res.get('errors', []))[:200]}"); schlecht += 1; continue
        q = g.qualitaet(o, level)
        if q:
            ab = ROOT / "werkzeuge" / "abgelehnt"
            ab.mkdir(exist_ok=True)
            (ab / f"{pid}.json").write_text(json.dumps(o, ensure_ascii=False, indent=1), encoding="utf8")
            print(f"✗ {pid}: Qualität nicht ausreichend ({'; '.join(q)}). Abgelegt in werkzeuge/abgelehnt/ – in Gemini mit „mehr Aufgaben, andere Typen“ nachfordern."); schlecht += 1; continue
        (OUT / "listening" / f"{pid}.json").write_text(json.dumps(o, ensure_ascii=False, indent=1) + "\n", encoding="utf8")
        print(f"✓ {pid}: {len(o.get('questions', []))} Aufgaben")
        ok += 1
    print(f"\n{ok} Pakete übernommen, {schlecht} fehlerhaft. Jetzt „4 Alles prüfen und bündeln“.")

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    s = p.add_subparsers(dest="cmd", required=True)
    b = s.add_parser("bauen"); b.add_argument("--anzahl", type=int, default=10); b.set_defaults(f=bauen)
    e = s.add_parser("einlesen"); e.add_argument("datei", nargs="?"); e.set_defaults(f=einlesen)
    a = p.parse_args(); a.f(a)
