# daje · CILS-Aufgabentyp `let-info`

**Lettura · Informazioni presenti (vero o falso)** · Comprensione della lettura · Niveaus B1–C2

## Worum es geht

Wie im CILS-Heft (Lettura, Prova 2): ein Informationstext mit Überschrift (Ausschreibung, Festival, Projekt, Verein), dazu 14 Aussagen; bei jeder entscheiden die Lernenden vero oder falso.

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
          "testo": "Per iscriversi bisogna compilare un modulo sul sito.",
          "presente": true
        },
        {
          "testo": "Gli artisti devono inviare la registrazione del brano.",
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

- Textlänge laut `parole`, in Absätze gegliedert; genau so viele `affermazioni` wie verlangt, etwa die Hälfte zutreffend.
- Aussagen in der Reihenfolge des Textes, jede zu einer anderen Stelle.
- Falsche Aussagen sind plausibel und nah am Text (Detail vertauscht, Bedingung weggelassen, Verallgemeinerung wie „tutti“, „solo“, „direttamente“).
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
