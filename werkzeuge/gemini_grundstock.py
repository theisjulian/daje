#!/usr/bin/env python3
"""Grundstock automatisch erzeugen: YouTube-Liste -> Gemini -> geprüfte Lernpakete.

Nutzung (auf deinem Rechner, Python 3.9+, keine zusätzlichen Pakete):
  export GEMINI_API_KEY=...            # Schlüssel aus Google AI Studio
  python3 werkzeuge/gemini_grundstock.py suche werkzeuge/videos.csv   # Videos automatisch suchen (YOUTUBE_API_KEY)
  python3 werkzeuge/gemini_grundstock.py hoeren werkzeuge/videos.csv
  python3 werkzeuge/gemini_grundstock.py wortschatz werkzeuge/woerter.csv
  node werkzeuge/bundle_stock.cjs      # gültige Pakete in die App bündeln

Optionen: --model NAME  --limit N  --keep-transcripts  --mock  --pause SEKUNDEN
Bereits vorhandene Pakete werden übersprungen (Wiederaufnahme nach Abbruch möglich).
"""
import argparse, base64, csv, hashlib, json, os, re, subprocess, sys, time, urllib.error, urllib.parse, urllib.request
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CMD = ROOT / "portal/dist/imports/KI-Kommandodatei.md"
EXAMPLES = ROOT / "portal/dist/examples"
OUT = ROOT / "grundstock"
API = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

def _zertifikate():
    """macOS-Python von python.org findet oft keine Zertifikate. Dann das System-Bündel nutzen."""
    import ssl
    for pfad in ("/etc/ssl/cert.pem", "/private/etc/ssl/cert.pem"):
        if os.path.exists(pfad):
            ctx = ssl.create_default_context(cafile=pfad)
            urllib.request.install_opener(urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx)))
            return
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
        urllib.request.install_opener(urllib.request.build_opener(urllib.request.HTTPSHandler(context=ctx)))
    except ImportError:
        pass


_zertifikate()


SERIE = """
SERIENMODUS (verbindlich, gilt zusätzlich zur Kommandodatei):
- Du erhältst genau ein YouTube-Video. Werte Bild UND Ton selbst aus. Wenn du den Ton nicht
  verlässlich verstehst, gib {"abbruch": "Grund"} statt eines Pakets aus.
- Gib genau EIN JSON-Objekt aus (kein Markdown). schemaVersion 1.1, kind listening.
- media = {"type":"youtube","videoId":"<ID>"} bei Video, {"type":"audio","url":"<URL>"} bei Audiodatei. transcriptOrigin = "auto".
- transcript: wörtliche Mitschrift des gesprochenen Teils mit Zeitmarken [mm:ss] je Absatz.
- Jede explanation beginnt mit der Belegstelle als "[mm:ss]" gefolgt von der Begründung.
  Die Zeitmarke muss im Video wirklich so liegen; erfinde keine.
- Gib coverQuery an (englischer Suchbegriff, konkretes fotografierbares Motiv).
- Nimm 6 bis 12 zentrale Wörter in vocabulary auf (Schema 1.1) mit translations (de), example.
- AUFGABENQUALITÄT (verbindlich, Lehrkräfte prüfen das):
  * Anzahl nach Länge des gesprochenen Teils: etwa eine Aufgabe pro 30 bis 45 Sekunden, mindestens 6,
    höchstens 16. Ein 3-Minuten-Beitrag braucht also etwa 6 bis 9 Aufgaben, nie nur 2 oder 3.
  * Mindestens 4 verschiedene Aufgabentypen (bei Clips unter 2 Minuten 3). Typen: single_choice,
    multiple_choice, true_false, matching, ordering, gap_fill, short_answer. true_false höchstens 20 Prozent
    und nie als einzige einfache Form; nie mehr als 3 gleiche Typen hintereinander.
  * Reihenfolge: zuerst Globalverstehen (Thema, Textsorte, Sprecher, Situation), dann Detailverstehen in der
    Reihenfolge des Textes, zuletzt Schlussfolgern oder Meinung (ab B1). Auf A1/A2: Zahlen, Orte, Personen,
    Handlungen; ab B1: Absichten, Begründungen, Haltungen, implizite Aussagen; ab B2/C1: Ton, Argumentationslinie.
  * Distraktoren müssen plausibel, gleich lang und im Text weder wörtlich noch eindeutig ausgeschlossen sein.
    Keine Fragen, die man ohne Hören aus Allgemeinwissen lösen kann. Keine Fragen nach Wortlaut-Wiedergabe.
  * Alle Fragen, Antworten und Anweisungen in der Zielsprache, dem Niveau angemessen formuliert
    (Wortschatz und Satzbau höchstens eine Stufe über dem Hörtext).
  * Jede Lösung muss am Ton belegbar sein; Zeitmarke in der explanation, Begründung auf Deutsch, ein bis zwei Sätze.
- sources: eine Quelle kind external mit Kanal, Titel und URL des Videos, rights "needs_review". citation nur die
  Quellenangabe (Kanal, Titel), keine Bewertungen wie „ungeprüft“; solche Hinweise gehören in reviewNotes.
- reviewNotes: nur echte Unsicherheiten, kurz.
"""
PRUEFER = """Du bist Prüfer. Dir liegen das Video und ein Aufgabenpaket vor. Prüfe jede Aufgabe:
(1) Ist sie mit dem Ton des Videos eindeutig lösbar? (2) Stimmt die hinterlegte Lösung?
(3) Stimmt die Zeitmarke der Belegstelle ungefähr? (4) Passt das Niveau ({level})?
(5) Stimmt die Mitschrift grob mit dem Gesprochenen überein?
Antworte nur mit JSON: {"mitschrift_ok": true/false, "niveau_ok": true/false,
"aufgaben": [{"id": "...", "ok": true/false, "problem": "kurz"}], "gesamt": "ein Satz"}"""
WORT = """Du bist Lexikograf für das Theis-Portal. Erstelle aus der Wortliste genau EIN Paket
kind vocabulary, schemaVersion 1.1, translationLanguage de. Übersetze kontextlos nur
eindeutige Bedeutungen, setze bei Nomen answerPolicy und grammar sorgfältig, schreibe kurze
eigene Beispielsätze (niveau-angemessen), keine Inhalte aus Lehrwerken kopieren. collection =
"{collection}", section = "{section}", language = "{language}", level = "{level}".
sources: kind own, citation "Eigene Wortliste, von KI ergänzt", rights "needs_review".
Wortliste (eine Zeile pro Eintrag, optional "Wort;Übersetzung"):
{words}"""


def text_lesen(pfad):
    """Textdatei lesen, egal in welchem Zeichensatz (Numbers/Excel). Wird in UTF-8 umgewandelt (Sicherung als .bak)."""
    roh = Path(pfad).read_bytes()
    kandidaten = ("utf-16",) if roh[:2] in (b"\xff\xfe", b"\xfe\xff") else ()
    for enc in kandidaten + ("utf-8-sig", "mac_roman", "cp1252"):
        try:
            text = roh.decode(enc)
            break
        except (UnicodeDecodeError, UnicodeError):
            continue
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    if enc != "utf-8-sig" or roh[:3] == b"\xef\xbb\xbf":
        sicherung = Path(str(pfad) + ".bak")
        if not sicherung.exists():
            sicherung.write_bytes(roh)
        Path(pfad).write_text(text, encoding="utf8")
    return text


def csv_zeilen(pfad):
    text = text_lesen(pfad)
    erste = text.split("\n", 1)[0]
    trenner = ";" if ";" in erste else "\t" if "\t" in erste else ","
    return list(csv.DictReader(text.split("\n"), delimiter=trenner))


def slug(s, n=34):
    s = re.sub(r"[^a-z0-9]+", "-", s.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss"))
    return s.strip("-")[:n].strip("-") or "paket"


def video_id(url):
    m = re.search(r"(?:v=|youtu\.be/|embed/|shorts/)([A-Za-z0-9_-]{11})", url)
    if not m:
        raise ValueError("Keine YouTube-ID erkannt: " + url)
    return m.group(1)


def embeddable(vid):
    """True, wenn YouTube das Video öffentlich einbettbar meldet (oEmbed)."""
    try:
        u = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json"
        with urllib.request.urlopen(u, timeout=20) as r:
            return r.status == 200, json.load(r).get("title", "")
    except urllib.error.HTTPError as e:
        return False, f"HTTP {e.code} (privat, gelöscht oder Einbettung gesperrt)"
    except Exception as e:  # kein Netz o. Ä.
        return None, str(e)


class GeminiFehler(Exception):
    pass


def gemini(model, system, parts, mock=None):
    if mock is not None:
        return mock
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        sys.exit("GEMINI_API_KEY fehlt (Schlüssel aus Google AI Studio).")
    body = {
        "system_instruction": {"parts": [{"text": system}]},
        "contents": [{"parts": parts}],
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.3},
    }
    req = urllib.request.Request(
        API.format(model=model), json.dumps(body).encode(),
        {"Content-Type": "application/json", "x-goog-api-key": key},
    )
    pausen = [15, 30, 60, 90, 120, 180, 240]
    for versuch in range(len(pausen) + 1):
        try:
            with urllib.request.urlopen(req, timeout=600) as r:
                data = json.load(r)
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504) and versuch < len(pausen):
                print(f"   Gemini ausgelastet ({e.code}), neuer Versuch in {pausen[versuch]} s …", flush=True)
                time.sleep(pausen[versuch])
                continue
            raise GeminiFehler(f"Gemini-Fehler {e.code}: {e.read().decode()[:300]}")
        except (urllib.error.URLError, TimeoutError, ConnectionError) as e:
            if versuch < len(pausen):
                print(f"   Verbindungsproblem ({e}), neuer Versuch in {pausen[versuch]} s …", flush=True)
                time.sleep(pausen[versuch])
                continue
            raise GeminiFehler(f"Verbindung: {e}")
        except (KeyError, IndexError, json.JSONDecodeError):
            if versuch >= 2:
                raise GeminiFehler("Unbrauchbare Antwort von Gemini (kein gültiges JSON)")
            time.sleep(5)


def check(path):
    r = subprocess.run(["node", str(ROOT / "werkzeuge/bundle_stock.cjs"), "--check", str(path)], capture_output=True, text=True)
    return json.loads(r.stdout.strip().splitlines()[-1])


def titelbild_holen(pkg, pid, mock=False):
    """Freies Foto (Openverse, CC mit Bearbeitung/kommerziell) suchen und als Datei speichern."""
    if mock:
        return False
    q = pkg.get("coverQuery") or pkg.get("title", "")
    try:
        u = ("https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(
            {"q": q, "license_type": "commercial,modification", "category": "photograph", "aspect_ratio": "wide", "page_size": 6, "mature": "false"}))
        with urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "theis-grundstock/1.0"}), timeout=30) as r:
            hits = json.load(r).get("results", [])
        for h in hits:
            try:
                with urllib.request.urlopen(urllib.request.Request(h["thumbnail"], headers={"User-Agent": "theis-grundstock/1.0"}), timeout=30) as r:
                    data = r.read(2 * 1024 * 1024)
                if len(data) < 5000:
                    continue
                ziel = ROOT / "portal/dist/assets/covers" / f"{pid}.jpg"
                ziel.parent.mkdir(parents=True, exist_ok=True)
                ziel.write_bytes(data)
                lic = f"{h.get('license','').upper()} {h.get('license_version','')}".strip()
                credit = f"Titelbild: \u201e{h.get('title') or 'Foto'}\u201c von {h.get('creator') or 'unbekannt'}, Lizenz CC {lic} (über Openverse)"[:900]
                pkg["coverImage"] = f"assets/covers/{pid}.jpg"
                pkg["coverCredit"] = credit
                pkg["sources"].append({"kind": "external", "citation": credit, "url": h.get("foreign_landing_url") or h.get("url") or "", "rights": "cleared"})
                return True
            except Exception:
                continue
    except Exception as e:
        print("   Titelbild: nicht gefunden (", e, ")")
    return False


def qualitaet(res, level):
    """Mindeststandards für Aufgaben. Gibt Probleme als Liste zurück."""
    qs = res.get("questions", [])
    stamps = [int(m) * 60 + int(sec) for m, sec in re.findall(r"\[(\d{1,2}):(\d{2})\]", res.get("transcript", ""))]
    dauer = max(stamps) if stamps else 0
    minimum = max(6, min(16, round(dauer / 40))) if dauer else 6
    probleme = []
    if len(qs) < minimum:
        probleme.append(f"Nur {len(qs)} Aufgaben, bei dieser Länge mindestens {minimum} nötig")
    typen = [q.get("type") for q in qs]
    soll = 3 if dauer and dauer < 120 else 4
    if len(set(typen)) < soll:
        probleme.append(f"Nur {len(set(typen))} Aufgabentypen, mindestens {soll} nötig")
    if typen and typen.count("true_false") > max(1, round(len(typen) * 0.2)):
        probleme.append("Zu viele true_false-Aufgaben (höchstens 20 Prozent)")
    ohne = [q.get("id") for q in qs if not re.match(r"\s*\[\d{1,2}:\d{2}\]", q.get("explanation", ""))]
    if len(ohne) > len(qs) / 3:
        probleme.append("explanation beginnt nicht bei jeder Aufgabe mit der Zeitmarke [mm:ss]")
    return probleme


def hoeren(args):
    system = CMD.read_text(encoding="utf8") + "\n" + SERIE
    mock = None
    if args.mock:
        mock = json.loads((EXAMPLES / "listening-with-vocabulary.json").read_text(encoding="utf8"))
    rows = csv_zeilen(args.liste)
    bericht = []
    for i, row in enumerate(rows[: args.limit or None], 1):
        url = (row.get("url") or "").strip()
        audio = (row.get("audio") or "").strip()
        if (not url and not audio) or url.startswith("#"):
            continue
        if audio and (row.get("rechte") or "").strip().lower() not in ("frei", "cc", "pd", "eigen"):
            print(f"[{i}] {audio}: Audio nur bei rechte=frei (gemeinfrei/CC/eigen) – übersprungen")
            continue
        vid = video_id(url) if url else "a" + hashlib.sha1(audio.encode()).hexdigest()[:10]
        lang, level = row.get("sprache", "it").strip(), row.get("niveau", "A2").strip()
        frei = (row.get("rechte") or "").strip().lower() in ("frei", "cc", "pd", "eigen")
        pid = f"{lang}-{slug(row.get('thema') or vid)}-{level.lower()}"[:40].strip("-")
        pfad = OUT / "listening" / f"{pid}.json"
        if pfad.exists():
            print(f"[{i}] {pid}: vorhanden, übersprungen")
            continue
        ok, titel = (None, row.get("thema", "")) if audio else embeddable(vid)
        if ok is False:
            print(f"[{i}] {vid}: nicht einbettbar – {titel}")
            bericht.append([pid, vid, "NICHT EINBETTBAR", titel, ""])
            continue
        prompt = (f"Video: {url}\nVideo-ID: {vid}\nZielsprache: {lang}\nNiveau: {level}\n"
                  f"Thema/Hinweis: {row.get('thema','')}\nPaket-ID: {pid}\nTitel des Videos: {titel}\n"
                  "Erzeuge das Paket nach Kommandodatei und Serienmodus.")
        if audio:
            if args.mock:
                medium = {"text": "(Audio-Mock)"}
            else:
                with urllib.request.urlopen(audio, timeout=120) as r:
                    data = r.read(16 * 1024 * 1024 + 1)
                if len(data) > 16 * 1024 * 1024:
                    print(f"[{i}] {audio}: Datei über 16 MB, übersprungen")
                    continue
                mime = "audio/mpeg" if audio.lower().endswith(".mp3") else "audio/mp4" if audio.lower().endswith((".m4a", ".mp4")) else "audio/wav" if audio.lower().endswith(".wav") else "audio/mpeg"
                medium = {"inline_data": {"mime_type": mime, "data": base64.b64encode(data).decode()}}
            prompt = prompt.replace("Video-ID", "Kennung").replace("Video:", "Audio:")
            parts = [medium, {"text": prompt}]
        else:
            medium = {"file_data": {"file_uri": f"https://www.youtube.com/watch?v={vid}"}}
            parts = [medium, {"text": prompt}]
        pkg, fehler = None, ""
        for runde in range(3):
            try:
                res = gemini(args.model, system, parts + ([{"text": "Korrigiere diese Fehler und gib das ganze Paket erneut aus:\n" + fehler}] if fehler else []), mock)
            except GeminiFehler as e:
                fehler = str(e)
                break
            if "abbruch" in res:
                fehler = "ABBRUCH: " + res["abbruch"]
                break
            res.update({"id": pid, "language": lang, "level": level})
            res.setdefault("media", {"type": "youtube", "videoId": vid})
            res["media"] = {"type": "audio", "url": audio} if audio else {"type": "youtube", "videoId": vid}
            tmp = OUT / "_tmp.json"
            tmp.write_text(json.dumps(res, ensure_ascii=False), encoding="utf8")
            c = check(tmp)
            tmp.unlink()
            if c["ok"]:
                prob = qualitaet(res, level) if not args.mock else []
                if not prob or runde == 2:
                    pkg, fehler = res, ""
                    if prob:
                        res.setdefault("reviewNotes", []).append("QUALITÄT: " + "; ".join(prob))
                    break
                fehler = "QUALITÄT, bitte alle Punkte beheben und mehr bzw. andere Aufgaben ergänzen: " + "; ".join(prob)
                continue
            fehler = "; ".join(c["errors"][:8])
        if not pkg:
            print(f"[{i}] {pid}: FEHLER {fehler[:120]}")
            bericht.append([pid, vid, "FEHLER", fehler, url])
            continue
        # Gegenprüfung durch zweiten Durchgang
        try:
            pr = gemini(args.model, PRUEFER.replace("{level}", level),
                        [medium, {"text": json.dumps(pkg, ensure_ascii=False)}],
                        {"mitschrift_ok": True, "niveau_ok": True, "aufgaben": [{"id": q["id"], "ok": True, "problem": ""} for q in pkg["questions"]], "gesamt": "Mock"} if args.mock else None)
        except GeminiFehler as e:
            pr = {}
            pkg.setdefault("reviewNotes", []).append("Zweite automatische Prüfung nicht möglich: " + str(e)[:200])
        schlecht = {a["id"]: a.get("problem", "") for a in pr.get("aufgaben", []) if not a.get("ok", True)}
        if schlecht and len(pkg["questions"]) - len(schlecht) >= 2:
            pkg["questions"] = [q for q in pkg["questions"] if q["id"] not in schlecht]
        notes = pkg.setdefault("reviewNotes", [])
        for qid, p in schlecht.items():
            notes.append(f"Aufgabe {qid} automatisch entfernt: {p}"[:900])
        if not pr.get("mitschrift_ok", True):
            notes.append("Prüfer-Durchgang: Mitschrift weicht teils vom Gesprochenen ab.")
        if not pr.get("niveau_ok", True):
            notes.append("Prüfer-Durchgang: Niveau fraglich.")
        # Rechte nur nach deiner Angabe in der Liste
        for s in pkg["sources"]:
            s["rights"] = "cleared" if frei else "needs_review"
            if frei and row.get("lizenz"):
                s["citation"] = (s["citation"] + " Lizenz: " + row["lizenz"])[:1000]
        if not frei and not args.keep_transcripts:
            pkg.pop("transcript", None)
            notes.append("Transkript nicht gespeichert (Rechte am Video nicht als frei markiert).")
        pkg["transcriptOrigin"] = "auto"
        if audio and not pkg.get("coverImage"):
            titelbild_holen(pkg, pid, args.mock)
        pfad.write_text(json.dumps(pkg, ensure_ascii=False, indent=2), encoding="utf8")
        status = "OK" if not schlecht and pr.get("mitschrift_ok", True) and pr.get("niveau_ok", True) else "PRÜFEN"
        print(f"[{i}] {pid}: {status}, {len(pkg['questions'])} Aufgaben")
        bericht.append([pid, vid, status, pr.get("gesamt", ""), url])
        time.sleep(args.pause)
    schreibe_bericht(bericht)


def wortschatz(args):
    mock = json.loads((EXAMPLES / "vocabulary-example.json").read_text(encoding="utf8")) if args.mock else None
    gruppen = {}
    for row in csv_zeilen(args.liste):
        key = (row["sprache"], row["niveau"], row["sammlung"], row["abschnitt"])
        gruppen.setdefault(key, []).append(row["wort"] + (";" + row["uebersetzung"] if row.get("uebersetzung") else ""))
    bericht = []
    for (lang, level, coll, sec), words in gruppen.items():
        pid = f"{lang}-{slug(coll,14)}-{slug(sec,16)}"[:40].strip("-")
        pfad = OUT / "vocabulary" / f"{pid}.json"
        if pfad.exists():
            continue
        prompt = WORT.format(collection=coll, section=sec, language=lang, level=level, words="\n".join(words))
        system = CMD.read_text(encoding="utf8")
        fehler = ""
        for _ in range(3):
            res = gemini(args.model, system, [{"text": prompt + ("\nKorrigiere:\n" + fehler if fehler else "")}], mock)
            res["id"] = pid
            tmp = OUT / "_tmp.json"
            tmp.write_text(json.dumps(res, ensure_ascii=False), encoding="utf8")
            c = check(tmp)
            tmp.unlink()
            if c["ok"]:
                pfad.write_text(json.dumps(res, ensure_ascii=False, indent=2), encoding="utf8")
                print(f"{pid}: OK, {len(res['entries'])} Wörter")
                bericht.append([pid, "", "PRÜFEN", "Übersetzungen stichprobenartig prüfen", ""])
                break
            fehler = "; ".join(c["errors"][:8])
        else:
            print(f"{pid}: FEHLER {fehler[:120]}")
            bericht.append([pid, "", "FEHLER", fehler, ""])
        time.sleep(args.pause)
    schreibe_bericht(bericht)


def iso_sekunden(d):
    m = re.fullmatch(r"PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", d or "")
    return 0 if not m else int(m.group(1) or 0) * 3600 + int(m.group(2) or 0) * 60 + int(m.group(3) or 0)


def yt_get(pfad, **params):
    key = os.environ.get("YOUTUBE_API_KEY")
    if not key:
        sys.exit("YOUTUBE_API_KEY fehlt (Google Cloud Console: YouTube Data API v3 aktivieren, Schlüssel erzeugen).")
    params["key"] = key
    u = "https://www.googleapis.com/youtube/v3/" + pfad + "?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(u, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"YouTube-Fehler {e.code}: {e.read().decode()[:300]}")


def suche(args):
    """Passende, frei lizenzierte und einbettbare Videos suchen und in die Liste eintragen."""
    bekannt = set()
    ziel = Path(args.liste)
    if ziel.exists():
        bekannt |= set(re.findall(r"[A-Za-z0-9_-]{11}", text_lesen(ziel)))
    inv = ROOT / "INHALTSINVENTAR.json"
    if inv.exists():
        bekannt |= set(re.findall(r'"([A-Za-z0-9_-]{11})"', text_lesen(inv)))
    neu = []
    for zeile in csv_zeilen(args.themen):
        lang, level, thema, q = zeile["sprache"], zeile["niveau"], zeile["thema"], zeile["suchbegriff"]
        if args.mock:
            items = [{"id": {"videoId": "AAAAAAAAAAA"}}]
            det = [{"id": "AAAAAAAAAAA", "status": {"license": "creativeCommon", "embeddable": True},
                    "contentDetails": {"duration": "PT5M10S"},
                    "snippet": {"title": "Mock", "channelTitle": "Kanal", "defaultAudioLanguage": lang}}]
        else:
            ids = []
            for dauer in ("short", "medium"):
                r = yt_get("search", part="id", type="video", q=q, videoLicense="creativeCommon",
                           videoEmbeddable="true", relevanceLanguage=lang, videoDuration=dauer, maxResults=args.pro_suche)
                ids += [i["id"]["videoId"] for i in r.get("items", [])]
            ids = [i for i in dict.fromkeys(ids) if i not in bekannt]
            det = []
            for k in range(0, len(ids), 50):
                det += yt_get("videos", part="status,contentDetails,snippet", id=",".join(ids[k:k + 50])).get("items", [])
        gut = 0
        for v in det:
            st, cd, sn = v["status"], v["contentDetails"], v["snippet"]
            dauer = iso_sekunden(cd.get("duration"))
            sprache = (sn.get("defaultAudioLanguage") or sn.get("defaultLanguage") or lang)[:2]
            if v["id"] in bekannt or st.get("license") != "creativeCommon" or not st.get("embeddable"):
                continue
            if not 90 <= dauer <= 900 or sprache != lang:
                continue
            bekannt.add(v["id"])
            neu.append([f"https://www.youtube.com/watch?v={v['id']}", lang, level, thema, "frei",
                        f"{sn.get('channelTitle','')}: {sn.get('title','')} (YouTube-Lizenz CC BY laut Uploader)".replace(";", ",")])
            gut += 1
            if gut >= args.pro_thema:
                break
        print(f"{lang} {level} {thema}: {gut} Kandidaten")
    neu_datei = not ziel.exists()
    with open(ziel, "a", newline="", encoding="utf8") as f:
        w = csv.writer(f, delimiter=";")
        if neu_datei:
            w.writerow(["url", "sprache", "niveau", "thema", "rechte", "lizenz"])
        w.writerows(neu)
    print(f"{len(neu)} neue Videos in {ziel}. Nächster Schritt: hoeren {ziel}")


def schreibe_bericht(zeilen):
    if not zeilen:
        return
    pfad = OUT / "BERICHT.csv"
    neu = not pfad.exists()
    with open(pfad, "a", newline="", encoding="utf8") as f:
        w = csv.writer(f, delimiter=";")
        if neu:
            w.writerow(["id", "video", "status", "hinweis", "link"])
        w.writerows(zeilen)
    print(f"\nBericht: {pfad}")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("modus", choices=["suche", "hoeren", "wortschatz"])
    ap.add_argument("liste")
    ap.add_argument("--model", default=os.environ.get("GEMINI_MODEL", "gemini-3.8-flash"))
    ap.add_argument("--limit", type=int, default=0)
    ap.add_argument("--pause", type=float, default=2)
    ap.add_argument("--keep-transcripts", action="store_true")
    ap.add_argument("--mock", action="store_true")
    ap.add_argument("--themen", default=str(ROOT / "werkzeuge/suchthemen.csv"))
    ap.add_argument("--pro-thema", type=int, default=4)
    ap.add_argument("--pro-suche", type=int, default=25)
    a = ap.parse_args()
    (OUT / "listening").mkdir(parents=True, exist_ok=True)
    (OUT / "vocabulary").mkdir(parents=True, exist_ok=True)
    try:
        {"suche": suche, "hoeren": hoeren, "wortschatz": wortschatz}[a.modus](a)
    except GeminiFehler as e:
        sys.exit(f"{e}\nSpäter noch einmal versuchen; fertige Pakete bleiben erhalten und werden übersprungen.")
