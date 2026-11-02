# daje · CILS-Aufgabentyp `let-abbina`

**Lettura · Testi da completare (A–H)** · Comprensione della lettura · Niveaus A1–A2

## Worum es geht

Lettura, Prova 3: vier Textanfänge (1–4) mit Überschrift und acht Fortsetzungen (A–H). Vier Fortsetzungen passen eindeutig, vier passen thematisch, aber zu keinem Anfang.

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
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
