#!/usr/bin/env python3
"""Grundstock mit KI aufbauen: Video-Liste → Transkript → KI-Aufgaben → automatische Prüfung → Entwürfe.

Anders als gemini_grundstock.py arbeitet dieses Werkzeug mit dem TRANSKRIPT statt mit Videoanalyse.
Dadurch funktioniert es mit jeder KI (Claude, ChatGPT, Gemini) oder ganz ohne API über den Chat,
und jede Lösung lässt sich automatisch am Transkript belegen.

Schritte (im Ordner daje ausführen):
  python3 werkzeuge/ki_grundstock.py transkripte werkzeuge/videos.csv   # Transkripte von YouTube holen
  python3 werkzeuge/ki_grundstock.py hoeren werkzeuge/videos.csv --anbieter claude   # per API erzeugen
  python3 werkzeuge/ki_grundstock.py stapel werkzeuge/videos.csv         # ohne API: über die Zwischenablage mit dem Chat
  python3 werkzeuge/ki_grundstock.py chat werkzeuge/videos.csv           # ohne API: Aufträge als Dateien
  python3 werkzeuge/ki_grundstock.py einlesen werkzeuge/videos.csv       # Chat-Antworten einlesen
  python3 werkzeuge/ki_grundstock.py uebernehmen ID [ID …]               # geprüfte Entwürfe in den Grundstock

Ergebnis: werkzeuge/entwuerfe/<id>.json und werkzeuge/entwuerfe/BERICHT.csv. Entwürfe lassen sich in der
Redaktion („Datei importieren“) ansehen und bearbeiten. Erst `uebernehmen` legt sie in grundstock/listening.

Spalten der CSV (Trennzeichen ; oder ,): url;sprache;niveau;thema;art;rechte;anzahl;start;ende
  (die bisherige videos.csv mit url;audio;sprache;niveau;thema;rechte;lizenz funktioniert weiter)
  art: video (Standard), audio, lied, film. Bei lied/film werden Transkript und Zitate NICHT gespeichert.
  rechte: frei (eigenes/freies Material: Transkript darf in die Übung) oder leer (nur zur Erzeugung genutzt).

Schlüssel in werkzeuge/schluessel.env (nie hochladen): ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY.
Optional: CLAUDE_MODEL, OPENAI_MODEL, GEMINI_MODEL (Komma-Liste = Ausweichmodelle bei Überlastung).
"""
import argparse, csv, json, os, random, re, shutil, subprocess, sys, time, urllib.error, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
W = ROOT / "werkzeuge"
TRANSKRIPTE, AUFTRAEGE, ANTWORTEN, ENTWUERFE = W / "transkripte", W / "auftraege", W / "antworten", W / "entwuerfe"
PAKET = W / "ki_paket.cjs"


# ---------------------------------------------------------------- Eingaben


def schluessel_laden():
    f = W / "schluessel.env"
    if f.exists():
        for zeile in f.read_text(encoding="utf8").splitlines():
            if "=" in zeile and not zeile.lstrip().startswith("#"):
                k, v = zeile.split("=", 1)
                if v.strip() and not os.environ.get(k.strip()):
                    os.environ[k.strip()] = v.strip()


def zeilen(pfad):
    roh = Path(pfad).read_bytes()
    for enc in ("utf-8-sig", "utf-16", "mac_roman", "cp1252"):
        try:
            text = roh.decode(enc)
            break
        except UnicodeError:
            continue
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    erste = text.split("\n", 1)[0]
    trenner = ";" if ";" in erste else "\t" if "\t" in erste else ","
    out = []
    for z in csv.DictReader(text.split("\n"), delimiter=trenner):
        z = {k.strip().lower(): (v or "").strip() for k, v in z.items() if k}
        z["url"] = z.get("url") or z.get("audio") or ""
        if z["url"]:
            out.append(z)
    return out


def video_id(url):
    m = re.search(r"(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})", url) or re.fullmatch(r"([A-Za-z0-9_-]{11})", url)
    return m.group(1) if m else None


def slug(s, n=24):
    s = s.lower()
    for a, b in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss"), ("à", "a"), ("è", "e"), ("é", "e"), ("ì", "i"), ("ò", "o"), ("ù", "u")):
        s = s.replace(a, b)
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:n].strip("-") or "uebung"


def paket_id(z):
    basis = video_id(z["url"]) or slug(z["url"][-20:])
    return f'{z.get("sprache", "it")}-{slug(z.get("thema") or basis)}-{z.get("niveau", "a2").lower()}'[:40].strip("-")


def sekunden(t):
    t = (t or "").strip()
    if not t:
        return None
    teile = [int(x) for x in t.split(":")]
    return teile[0] * 60 + teile[1] if len(teile) == 2 else teile[0]


def transkript_datei(z):
    return TRANSKRIPTE / f'{video_id(z["url"]) or paket_id(z)}.txt'


def eingaben(z):
    art = (z.get("art") or "video").lower()
    frei = (z.get("rechte") or "").lower() == "frei"
    text = transkript_datei(z).read_text(encoding="utf8") if transkript_datei(z).exists() else ""
    return {
        "id": paket_id(z),
        "mediaUrl": z["url"],
        "language": z.get("sprache") or "it",
        "level": (z.get("niveau") or "A2").upper(),
        "kind": art,
        "count": z.get("anzahl") or "",
        "start": sekunden(z.get("start")),
        "end": sekunden(z.get("ende")),
        "startText": z.get("start") or "",
        "endText": z.get("ende") or "",
        "transcript": text,
        "wishes": z.get("wuensche") or "",
        "keepTranscript": frei and art not in ("lied", "film"),
        "keepEvidence": art not in ("lied", "film"),
        "transcriptOrigin": "provider",
        "rights": "cleared" if frei else "needs_review",
        "citation": z.get("quelle") or (f'Video auf YouTube ({z["lizenz"]}); Aufgaben erstellt mit KI-Unterstützung, redaktionell geprüft.'
                                         if z.get("lizenz") and video_id(z["url"]) else None),
    }


def node(*args):
    if not shutil.which("node"):
        sys.exit("Node.js fehlt: einmal von https://nodejs.org installieren (LTS), dann erneut starten.")
    r = subprocess.run(["node", str(PAKET), *map(str, args)], capture_output=True, text=True, cwd=ROOT)
    if r.returncode:
        sys.exit("ki_paket.cjs: " + r.stderr.strip())
    return r.stdout


def auftrag(inp):
    tmp = ENTWUERFE / f'.{inp["id"]}.eingaben.json'
    tmp.write_text(json.dumps(inp, ensure_ascii=False), encoding="utf8")
    return node("auftrag", tmp)


# ---------------------------------------------------------------- Transkripte


def transkripte(args):
    """Untertitel über das Paket youtube-transcript-api holen (pip install youtube-transcript-api)."""
    try:
        import youtube_transcript_api as yta
    except ImportError:
        sys.exit("Bitte einmal installieren: pip3 install youtube-transcript-api\n"
                 "Alternativ das Transkript von Hand als werkzeuge/transkripte/<Video-ID>.txt speichern.")
    TRANSKRIPTE.mkdir(parents=True, exist_ok=True)
    for z in zeilen(args.csv):
        vid, ziel = video_id(z["url"]), transkript_datei(z)
        if not vid or ziel.exists():
            continue
        sprachen = [z.get("sprache") or "it"]
        try:
            api = yta.YouTubeTranscriptApi
            if hasattr(api, "get_transcript"):  # ältere Versionen
                teile = [(s["start"], s["text"]) for s in api.get_transcript(vid, languages=sprachen)]
            else:  # ab Version 1.0
                teile = [(s.start, s.text) for s in api().fetch(vid, languages=sprachen)]
        except Exception as e:  # Untertitel gesperrt, nicht vorhanden oder Netzwerkfehler
            print(f"  {vid}: kein Transkript ({type(e).__name__}). Von Hand speichern: {ziel.relative_to(ROOT)}")
            continue
        ziel.write_text("\n".join(f"[{int(t // 60):02d}:{int(t % 60):02d}] {x.strip()}" for t, x in teile), encoding="utf8")
        print(f"  {vid}: {len(teile)} Zeilen gespeichert")


# ---------------------------------------------------------------- KI-Anbieter


class KiFehler(Exception):
    pass


def http_json(url, body, headers, versuche=6):
    """POST mit Wartezeiten bei Überlastung (429/5xx), Retry-After wird beachtet."""
    req = urllib.request.Request(url, json.dumps(body).encode(), {"Content-Type": "application/json", **headers})
    for n in range(versuche):
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504, 529) and n < versuche - 1:
                warte = int(e.headers.get("retry-after") or 0) or min(300, 10 * 2 ** n) + random.uniform(0, 5)
                print(f"    überlastet ({e.code}), neuer Versuch in {warte:.0f} s …", flush=True)
                time.sleep(warte)
                continue
            raise KiFehler(f"HTTP {e.code}: {e.read().decode(errors='replace')[:300]}")
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if n < versuche - 1:
                time.sleep(min(120, 10 * 2 ** n))
                continue
            raise KiFehler(f"Verbindung: {e}")


def claude(prompt, modell):
    try:
        import anthropic
    except ImportError:
        sys.exit("Für Claude einmal installieren: pip3 install anthropic")
    # Das SDK wiederholt 429/5xx (auch „überlastet“) selbst; max_retries erhöht die Geduld.
    client = anthropic.Anthropic(max_retries=6, timeout=900)
    try:
        # Serverseitige Ausweichmodelle: ist das Hauptmodell überlastet, antwortet das nächste.
        msg = client.beta.messages.create(
            model=modell,
            max_tokens=16000,
            betas=["server-side-fallback-2026-06-01"],
            fallbacks=[{"model": "claude-opus-4-8"}],
            messages=[{"role": "user", "content": prompt}],
        )
    except anthropic.APIStatusError as e:
        raise KiFehler(f"Claude {e.status_code}: {e.message}")
    except anthropic.APIConnectionError as e:
        raise KiFehler(f"Claude Verbindung: {e}")
    if msg.stop_reason == "refusal":
        raise KiFehler("Claude hat die Anfrage abgelehnt (stop_reason refusal).")
    if msg.stop_reason == "max_tokens":
        raise KiFehler("Antwort zu lang (max_tokens erreicht): weniger Aufgaben anfordern (Spalte anzahl).")
    return "".join(b.text for b in msg.content if b.type == "text")


def openai(prompt, modell):
    key = os.environ.get("OPENAI_API_KEY") or sys.exit("OPENAI_API_KEY fehlt.")
    d = http_json("https://api.openai.com/v1/chat/completions", {"model": modell, "messages": [{"role": "user", "content": prompt}]},
                  {"Authorization": "Bearer " + key})
    return d["choices"][0]["message"]["content"]


def gemini(prompt, modell):
    key = os.environ.get("GEMINI_API_KEY") or sys.exit("GEMINI_API_KEY fehlt.")
    d = http_json(f"https://generativelanguage.googleapis.com/v1beta/models/{modell}:generateContent",
                  {"contents": [{"parts": [{"text": prompt}]}]}, {"x-goog-api-key": key})
    try:
        return d["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise KiFehler("Gemini lieferte keine Antwort: " + json.dumps(d)[:300])


ANBIETER = {
    "claude": (claude, "CLAUDE_MODEL", "claude-opus-5-5"),
    "openai": (openai, "OPENAI_MODEL", None),
    "gemini": (gemini, "GEMINI_MODEL", "gemini-2.5-flash"),
}


def frage_ki(prompt, anbieter, modell_arg, mock):
    if mock:
        return Path(mock).read_text(encoding="utf8")
    fn, env, standard = ANBIETER[anbieter]
    modelle = [m.strip() for m in (modell_arg or os.environ.get(env) or standard or "").split(",") if m.strip()]
    if not modelle:
        sys.exit(f"Bitte ein Modell angeben: --modell NAME oder {env}=… in schluessel.env")
    fehler = None
    for m in modelle:  # Ausweichmodelle, wenn eines dauerhaft überlastet ist
        try:
            print(f"    {anbieter}/{m} …", flush=True)
            return fn(prompt, m)
        except KiFehler as e:
            fehler = e
            print(f"    {m}: {e}", flush=True)
    raise fehler


# ---------------------------------------------------------------- Paket bauen und prüfen


def bauen(z, antwort_text):
    inp = eingaben(z)
    (ENTWUERFE / f'.{inp["id"]}.eingaben.json').write_text(json.dumps(inp, ensure_ascii=False), encoding="utf8")
    antwort = ENTWUERFE / f'.{inp["id"]}.antwort.txt'
    antwort.write_text(antwort_text, encoding="utf8")
    r = json.loads(node("bauen", antwort, ENTWUERFE / f'.{inp["id"]}.eingaben.json'))
    belege = r["evidence"]
    gefunden = sum(1 for b in belege if b["status"] in ("ok", "fast"))
    noetig = sum(1 for b in belege if b["status"] != "vorab")
    if r["pkg"]:
        (ENTWUERFE / f'{inp["id"]}.json').write_text(json.dumps(r["pkg"], ensure_ascii=False, indent=2) + "\n", encoding="utf8")
    status = "OK" if r["ok"] and gefunden == noetig else "PRÜFEN" if r["ok"] else "FEHLER"
    return {
        "id": inp["id"], "status": status, "titel": (r["pkg"] or {}).get("title", ""),
        "aufgaben": len((r["pkg"] or {}).get("questions", [])), "belege": f"{gefunden}/{noetig}",
        "hinweise": " · ".join(r["errors"][:3] + r["warnings"]),
    }


def bericht(eintraege):
    f = ENTWUERFE / "BERICHT.csv"
    alt = {}
    if f.exists():
        for z in csv.DictReader(f.read_text(encoding="utf8").splitlines(), delimiter=";"):
            alt[z["id"]] = z
    for e in eintraege:
        alt[e["id"]] = e
    with f.open("w", encoding="utf8", newline="") as out:
        w = csv.DictWriter(out, ["id", "status", "titel", "aufgaben", "belege", "hinweise"], delimiter=";")
        w.writeheader()
        w.writerows(alt.values())
    print(f"\nBericht: {f.relative_to(ROOT)}")


def bereit(z):
    inp_id = paket_id(z)
    if (ENTWUERFE / f"{inp_id}.json").exists():
        print(f"  {inp_id}: schon vorhanden, übersprungen")
        return False
    if not transkript_datei(z).exists():
        print(f"  {inp_id}: Transkript fehlt ({transkript_datei(z).relative_to(ROOT)})")
        return False
    return True


def hoeren(args):
    ENTWUERFE.mkdir(parents=True, exist_ok=True)
    ergebnis = []
    for z in zeilen(args.csv)[: args.limit or None]:
        if not bereit(z):
            continue
        inp = eingaben(z)
        print(f"  {inp['id']}")
        try:
            ergebnis.append(bauen(z, frage_ki(auftrag(inp), args.anbieter, args.modell, args.mock)))
            print(f"    → {ergebnis[-1]['status']}, Belege {ergebnis[-1]['belege']}")
        except KiFehler as e:
            ergebnis.append({"id": inp["id"], "status": "FEHLER", "titel": "", "aufgaben": 0, "belege": "", "hinweise": str(e)[:300]})
        time.sleep(args.pause)
    bericht(ergebnis)


def chat(args):
    """Ohne API: je Video eine Auftragsdatei zum Einfügen in Gemini, ChatGPT oder Claude."""
    AUFTRAEGE.mkdir(parents=True, exist_ok=True)
    ANTWORTEN.mkdir(parents=True, exist_ok=True)
    ENTWUERFE.mkdir(parents=True, exist_ok=True)
    for z in zeilen(args.csv):
        if not bereit(z):
            continue
        inp = eingaben(z)
        (AUFTRAEGE / f'{inp["id"]}.txt').write_text(auftrag(inp), encoding="utf8")
        print(f"  Auftrag: werkzeuge/auftraege/{inp['id']}.txt  →  Antwort speichern als werkzeuge/antworten/{inp['id']}.txt")


def ablage(text=None):
    """Zwischenablage lesen (text=None) oder schreiben. Mac: pbcopy/pbpaste, Linux: xclip."""
    if shutil.which("pbcopy"):
        cmd = ["pbcopy"] if text is not None else ["pbpaste"]
    elif shutil.which("xclip"):
        cmd = ["xclip", "-selection", "clipboard"] + ([] if text is not None else ["-o"])
    else:
        sys.exit("Keine Zwischenablage gefunden. Stattdessen: Befehl „chat“ (Aufträge als Dateien).")
    r = subprocess.run(cmd, input=text, capture_output=True, text=True)
    return r.stdout


def stapel(args):
    """Ohne API, über die Zwischenablage: Auftrag kopieren → im Chat einfügen → Antwort kopieren → Enter."""
    ANTWORTEN.mkdir(parents=True, exist_ok=True)
    ENTWUERFE.mkdir(parents=True, exist_ok=True)
    offen = [z for z in zeilen(args.csv) if bereit(z)]
    if not offen:
        return print("Nichts zu tun: alle Videos haben schon einen Entwurf oder es fehlen Transkripte.")
    if args.chat and shutil.which("open"):
        subprocess.run(["open", args.chat])
    print(f"\n{len(offen)} Videos. Am besten für jedes Video einen neuen Chat beginnen.")
    ergebnis = []
    for n, z in enumerate(offen, 1):
        inp = eingaben(z)
        text = auftrag(inp)
        ablage(text)
        print(f"\n[{n}/{len(offen)}] {inp['id']}: Auftrag ist in der Zwischenablage.")
        while True:
            a = input("  Im Chat einfügen, Antwort kopieren, dann Enter (ü = überspringen, q = beenden): ").strip().lower()
            if a in ("q", "x"):
                return bericht(ergebnis)
            if a in ("ü", "s", "u"):
                break
            antwort = ablage()
            if antwort.strip() == text.strip() or "{" not in antwort:
                print("  In der Zwischenablage steht noch keine Antwort mit JSON. Bitte die Antwort der KI kopieren.")
                continue
            (ANTWORTEN / f"{inp['id']}.txt").write_text(antwort, encoding="utf8")
            e = bauen(z, antwort)
            print(f"  → {e['status']}, {e['aufgaben']} Aufgaben, Belege {e['belege']}" + (f" · {e['hinweise']}" if e["hinweise"] else ""))
            if e["status"] == "FEHLER" and not e["aufgaben"]:
                ablage(text)
                print("  Nicht lesbar. Auftrag liegt wieder in der Zwischenablage: KI bitten, nur den JSON-Block auszugeben, oder neu versuchen.")
                continue
            ergebnis.append(e)
            break
    bericht(ergebnis)


def einlesen(args):
    ergebnis = []
    for z in zeilen(args.csv):
        f = ANTWORTEN / f"{paket_id(z)}.txt"
        if f.exists() and not (ENTWUERFE / f"{paket_id(z)}.json").exists():
            ergebnis.append(bauen(z, f.read_text(encoding="utf8")))
            print(f"  {paket_id(z)} → {ergebnis[-1]['status']}, Belege {ergebnis[-1]['belege']}")
    bericht(ergebnis)


def uebernehmen(args):
    ziel = ROOT / "grundstock/listening"
    for pid in args.ids:
        quelle = ENTWUERFE / f"{pid}.json"
        if not quelle.exists():
            print(f"  {pid}: kein Entwurf")
            continue
        shutil.copy(quelle, ziel / quelle.name)
        print(f"  {pid}: nach grundstock/listening übernommen")
    subprocess.run(["node", "werkzeuge/bundle_stock.cjs"], cwd=ROOT)


def main():
    schluessel_laden()
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="befehl", required=True)
    for name in ("transkripte", "hoeren", "stapel", "chat", "einlesen"):
        p = sub.add_parser(name)
        p.add_argument("csv")
        if name == "stapel":
            p.add_argument("--chat", default="https://gemini.google.com/app", help="Chat-Seite, die zu Beginn geöffnet wird (leer = keine)")
        if name == "hoeren":
            p.add_argument("--anbieter", choices=ANBIETER, default="claude")
            p.add_argument("--modell", help="Modellname; Komma-Liste = Ausweichmodelle")
            p.add_argument("--limit", type=int, default=0)
            p.add_argument("--pause", type=float, default=2)
            p.add_argument("--mock", help="Antwortdatei statt KI (zum Testen)")
    p = sub.add_parser("uebernehmen")
    p.add_argument("ids", nargs="+")
    args = ap.parse_args()
    {"transkripte": transkripte, "hoeren": hoeren, "stapel": stapel, "chat": chat, "einlesen": einlesen, "uebernehmen": uebernehmen}[args.befehl](args)


if __name__ == "__main__":
    main()
