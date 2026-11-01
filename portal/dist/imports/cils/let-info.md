# daje · CILS-Aufgabentyp `let-info`

**Lettura · Individuare le informazioni presenti** · Comprensione della lettura · Niveaus B1–C2

## Worum es geht

Ein Lesetext mit Überschrift und eine Liste von Aussagen. Die Lernenden wählen die Aussagen, die im Text stehen.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "let-info",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "testo": "…",
      "affermazioni": [
        {
          "testo": "…",
          "presente": true
        },
        {
          "testo": "…",
          "presente": false
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

- Textlänge laut `parole`; genau so viele `affermazioni` wie verlangt, davon genau `presenti` zutreffend.
- Zutreffende Aussagen umschreiben den Text, nicht wörtlich zitieren.
- Nicht zutreffende Aussagen sind plausibel, greifen Textwörter auf und unterscheiden sich in einem wichtigen Punkt (Person, Zeit, Ursache, Verneinung, Häufigkeit).
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
