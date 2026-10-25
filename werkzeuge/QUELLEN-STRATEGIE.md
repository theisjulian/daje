# Quellen außerhalb von YouTube (BBC, NPR, RFI, Rai …)

Grundsatz: Die Technik ist für alle Quellen gleich (Liste → Gemini → Paket → Prüfung → Bündeln). Entscheidend ist, was rechtlich mit der Quelle erlaubt ist. Dafür gibt es drei Stufen („Ampel“). Das ist keine Rechtsberatung; im Zweifel klärst du Nutzungsrechte mit der Schulleitung/Medienberatung.

## Grün: frei nutzbar – voll automatisch
Audio darf heruntergeladen, ausgewertet, mit Transkript gezeigt und im Repo gespeichert werden.
- VOA Learning English (Englisch, gemeinfrei laut Quellenangabe im vorhandenen Beispiel)
- Weitere US-Behörden-Audios (z. B. NASA, NOAA), gemeinfrei
- LibriVox (Englisch, Französisch, Italienisch, Spanisch u. a.; gemeinfreie Vorlesungen, gut für B1–C1)
- Wikimedia Commons / gesprochene Wikipedia (CC)
- Tatoeba (CC BY, Sätze mit Audio; eher für Wortschatz) und Mozilla Common Voice (CC0)
- YouTube-Videos mit CC-Lizenz (siehe Videosuche)
- Eigene Aufnahmen und eigene Sprachausgabe-Dialoge (Medientyp `speech` bzw. selbst erzeugtes Audio)
In der Liste: Spalte `audio` (direkte Dateiadresse) bzw. `url` (YouTube), `rechte=frei`, Spalte `lizenz` mit dem Nachweis. Ohne `rechte=frei` wird Audio vom Skript nicht heruntergeladen.

## Gelb: verlinken oder offiziell einbetten, aber nicht kopieren
BBC Learning English / 6 Minute English, NPR, TED, RFI, TV5Monde, Rai, RTVE und die meisten Sender.
- Erlaubt ist in der Regel der Link zur Originalseite oder der vom Anbieter bereitgestellte Einbett-Player. Audiodatei oder Transkript auf eigenem Server speichern und neu anzeigen ist es meist nicht.
- Geplantes Vorgehen: eigene Aufgaben auf Basis des **auf der Anbieterseite veröffentlichten Transkripts** (nur als Text eingegeben, kein Audiodownload), im Paket nur Link und Aufgaben, ohne Transkript. Dafür fehlt noch ein Medientyp `link` (Schema 1.2). Der Lernablauf wäre: Original öffnen, hören, zurückkehren, Aufgaben lösen. Das ist weniger bequem als ein eingebauter Player.
- Je Anbieter prüfen, ob ein offizieller Einbett-Code existiert (BBC und NPR bieten ihn für manche Beiträge). Dann könnte `link` später zu `embed` mit einer Liste erlaubter Hosts werden.

## Rot: nicht verwenden
Bezahldienste, Mediatheken ohne Einbett-Angebot, Lehrwerk-Audios, Material von Kolleginnen ohne Erlaubnis.

## Wie importiert wird
1. Eine einzige Liste `werkzeuge/videos.csv` mit Spalten `url;audio;sprache;niveau;thema;rechte;lizenz`.
2. `suche` füllt YouTube-CC-Videos automatisch. Andere grüne Quellen trägst du als `audio`-Zeile ein, oder wir bauen je Quelle einen kleinen Sammler (zum Beispiel VOA-Feed, LibriVox-Katalog).
3. `hoeren` erzeugt die Pakete, `bundle_stock.cjs` bündelt sie. Gelbe Quellen bleiben vorerst außen vor, bis `link` gebaut ist.

## Notiz (25.10.2026): RSI Edu (Italienisch)

Tipp von Julian: Die RSI (Radiotelevisione svizzera di lingua italiana) hat mit **RSI Edu** (rsi.ch/edu) ein Angebot für Schulen und Familien, gut geeignet für Italienisch. Einstufung vorläufig **gelb**: Einbetten bzw. Verlinken ist der Normalfall; Rechte für Transkripte und eigene Aufgaben dazu nicht geklärt (Lizenzbedingungen auf rsi.ch/edu prüfen, ggf. bei der RSI nachfragen). Umsetzung: passende Video-Links von Hand in `werkzeuge/videos.csv` eintragen (Spalte `rechte` leer lassen), dann `hoeren` laufen lassen. Die automatische Suche findet RSI nicht, weil sie nur frei lizenzierte Videos sucht.
