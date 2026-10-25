# Grundstock aufbauen – ohne Videos anzuschauen

## Warum die API und nicht der Gemini-Chat
Die Gemini-API kann öffentliche YouTube-Links direkt auswerten (Bild und Ton, nicht nur Untertitel). Laut Google-Dokumentation (Stand heute) ist das eine Vorschau-Funktion: kostenlos bis 8 Stunden YouTube-Video pro Tag, nur öffentliche Videos (keine privaten oder nicht gelisteten), bis zu 10 Videos pro Anfrage ab Gemini 2.5. Mit der kostenlosen Stufe schaffst du also etwa 50–80 Videos à 6–10 Minuten pro Tag. Im Chat müsstest du jeden Link einzeln einfügen und die Ausgabe von Hand kopieren.

## Ablauf (einmal einrichten, dann Knopfdruck)
1. **Schlüssel:** In Google AI Studio einen API-Schlüssel erzeugen: `export GEMINI_API_KEY=...`
2. **Videos automatisch suchen lassen:** `python3 werkzeuge/gemini_grundstock.py suche werkzeuge/videos.csv`. Das Skript fragt die offizielle YouTube-Suche (Schlüssel `YOUTUBE_API_KEY`, YouTube Data API v3 in der Google Cloud Console aktivieren, kostenlos im Rahmen des Tagesbudgets) nach Videos zu den Themen in `werkzeuge/suchthemen.csv` ab, mit festen Filtern: Creative-Commons-Lizenz, einbettbar, 1,5–15 Minuten, passende Sprache, keine Duplikate. Treffer landen mit `rechte=frei` in `videos.csv`. Themen und Suchbegriffe kannst du in `suchthemen.csv` anpassen. Hinweis: Die CC-Kennzeichnung setzt der Hochladende selbst; sie kann bei Re-Uploads falsch sein. Die Lizenz steht deshalb in der Quellenangabe jedes Pakets.
   Alternativ/zusätzlich `werkzeuge/videos.csv` von Hand füllen (eine Zeile pro Video: `url;sprache;niveau;thema;rechte`). In `rechte` nur `frei` eintragen, wenn das Video nachweislich frei nutzbar ist (z. B. Creative Commons, Public Domain, eigenes Material). Sonst leer lassen.
3. **Erzeugen:** `python3 werkzeuge/gemini_grundstock.py hoeren werkzeuge/videos.csv`
   Je Video passiert: Einbettbarkeit prüfen → Paket erzeugen (Kommandodatei als Anweisung) → Importprüfung der App, bei Fehlern bis zu zweimal automatisch korrigieren lassen → zweiter Durchgang als Prüfer (Aufgaben lösbar? Lösung richtig? Niveau? Mitschrift stimmig?) → fragwürdige Aufgaben werden entfernt, Befunde stehen in den Prüfnotizen.
4. **Wortschatz:** `werkzeuge/woerter.csv` füllen (`sprache;niveau;sammlung;abschnitt;wort;uebersetzung`, Übersetzung optional) und `python3 werkzeuge/gemini_grundstock.py wortschatz werkzeuge/woerter.csv`.
5. **Bündeln:** `node werkzeuge/bundle_stock.cjs` prüft alles noch einmal und schreibt `portal/dist/stock-data.js`. Danach `portal/dist` wie gewohnt hochladen.
Ergebnis und Hinweise je Paket: `grundstock/BERICHT.csv` (Status OK / PRÜFEN / FEHLER).

## Kosten
- Gemini: Es gibt eine kostenlose Stufe (mit Tageslimit; Inhalte der kostenlosen Stufe darf Google zur Produktverbesserung nutzen, bei öffentlichen Videos unkritisch). Darüber wird nach Tokens abgerechnet.
- Grobe Rechnung (Schätzung, Preise ändern sich; Google nennt für Flash-Lite-Modelle etwa 0,25–0,30 USD je Million Eingabe-Tokens): Ein Video verbraucht etwa 100 Tokens pro Sekunde, 10 Minuten also rund 60.000 Tokens. Mit Erzeugung und Prüfdurchgang liegt ein Video voraussichtlich bei wenigen Cent, 200 Videos bei einem niedrigen einstelligen bis geringen zweistelligen Euro-Betrag.
- YouTube-Suche: kostenlos im Tagesbudget (eine Suche kostet 100 von 10.000 Einheiten).
- Praktisch: Mit der kostenlosen Stufe anfangen. Ein Budgetlimit in Google Cloud setzen, falls du auf Bezahlung umstellst.

## Videos finden
- YouTube-Suche mit Filter „Creative Commons“, oder Kanäle mit freier Lizenz (z. B. VOA Learning English: US-Behördeninhalt, gemeinfrei).
- Mit yt-dlp lässt sich eine Liste vorfiltern (von mir nicht getestet): `yt-dlp "ytsearch50:italiano A2 dialogo" --match-filter "license*=Creative" --print "https://youtu.be/%(id)s;%(title)s"`.
- KI-Vorschläge für Videos nie ungeprüft übernehmen: Das Skript prüft Einbettbarkeit, aber nicht, ob das Video inhaltlich taugt.

## Qualität ohne Zuschauen
- Jede Erklärung beginnt mit `[mm:ss]`; im Portal ist das ein Sprunglink zur Stelle. Stichprobe: 10 zufällige Aufgaben je Charge anklicken, je 10 Sekunden anhören.
- Pakete mit Status PRÜFEN oder offenen Rechten erscheinen als „Arbeitsfassung“ und lassen sich für Lernende ausblenden.
- Das ist kein Ersatz für fachliche Freigabe: Eine KI-Auswertung kann sich bei Ton, Dialekt und Zahlen irren.

## Rechte (wichtig)
Das Einbetten über den YouTube-Player ist in der Regel unproblematisch. Eine wörtliche Mitschrift fremder Videos zu speichern und anzuzeigen ist urheberrechtlich heikel. Das Skript speichert deshalb Transkripte nur bei `rechte=frei` (Ausnahme: `--keep-transcripts`, dann bleibt das Paket Arbeitsfassung). Ob eine Weiterverwendung erlaubt ist, entscheidest du; das Tool setzt Rechte nie selbst.

## Grenzen
- Nicht live getestet: Ich konnte von hier aus nicht auf die Gemini-API zugreifen. Mit simulierten Antworten laufen Erzeugung, Prüfung, Bündelung und Anzeige durch. Der erste echte Lauf sollte mit `--limit 3` starten.
- Ob die Batch-API (halber Preis) YouTube-Links akzeptiert, stand nicht in der Dokumentation.
- Modellname: Standard `gemini-3.8-flash` (von Google selbst als Nachfolger genannt); anderes Modell per `--model` oder `GEMINI_MODEL=` in schluessel.env.
