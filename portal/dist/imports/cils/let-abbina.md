# daje · CILS-Aufgabentyp `let-abbina`

**Lettura · Inizi e fini** · Comprensione della lettura · Niveaus A1–A2

## Worum es geht

Vier kurze Textanfänge mit Überschrift und acht Fortsetzungen (A–H). Vier Fortsetzungen passen eindeutig, vier passen thematisch, aber zu keinem Anfang.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "let-abbina",
  "tema": "…",
  "esercizi": [
    {
      "inizi": [
        {
          "titolo": "Festa di classe",
          "testo": "Sabato organizziamo una festa per la fine della scuola.",
          "fine": "E"
        }
      ],
      "fini": {
        "A": "…",
        "B": "…",
        "C": "…",
        "D": "…",
        "E": "Porta qualcosa da mangiare!",
        "F": "…",
        "G": "…",
        "H": "…"
      }
    }
  ],
  "noteDocente": [
    "…"
  ]
}
```

## Regeln für diesen Typ

- Genau 4 `inizi` und 8 `fini` (A–H); jeder Buchstabe höchstens einmal als `fine`.
- Jede Fortsetzung passt grammatisch an jeden Anfang; entscheidend ist der Inhalt.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
