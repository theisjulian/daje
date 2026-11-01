# daje · CILS-Aufgabentyp `let-scelta`

**Lettura · Testo con domande a scelta multipla** · Comprensione della lettura · Niveaus A1–C2

## Worum es geht

Ein zusammenhängender Lesetext mit Überschrift (A1/A2: Information zu Schulprojekt, Veranstaltung, Verein; ab B1 auch Zeitungsartikel, Blog, Erfahrungsbericht; ab C1 Kommentar, Essay, Sachtext). Dazu Fragen mit Auswahlantworten.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "let-scelta",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "Un’estate da volontari",
      "testo": "Absatz 1 …\n\nAbsatz 2 …",
      "domande": [
        {
          "domanda": "Secondo l’articolo, i ragazzi scelgono il volontariato soprattutto perché",
          "opzioni": [
            "vogliono fare nuove amicizie.",
            "…",
            "…",
            "…"
          ],
          "giusta": "A"
        }
      ]
    }
  ],
  "noteDocente": [
    "…"
  ]
}
```

## Regeln für diesen Typ

- Textlänge in Wörtern laut Vorgabe `parole`, in Absätze gegliedert.
- Genau so viele `domande` und `opzioni` wie verlangt; Fragen in der Reihenfolge des Textes.
- Ab B1 prüft mindestens eine Frage die Hauptaussage oder Absicht des Textes, ab B2 mindestens eine eine Schlussfolgerung oder Haltung des Autors.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
