# daje · CILS-Aufgabentyp `let-info`

**Lettura · Informazioni presenti** · Comprensione della lettura · Niveaus B1–C2

## Worum es geht

Lettura, Prova 2. **B1:** Vorstellung eines Festivals, Wettbewerbs oder Projekts (~350 Wörter), 14 Aussagen, je vero/falso. **B2:** Regolamento mit nummerierten Artikeln (~400 Wörter), 14 Aussagen vero/falso. **C1/C2:** Ausschreibung (bando) oder Regelwerk mit Abschnitten (C1 ~700, C2 ~900 Wörter), 15 Aussagen A–O, genau 7 stehen im Text.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "let-info",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "testo": "Art. 1 – Finalità\n…\n\nArt. 2 – Destinatari\n…",
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

- Textlänge laut `parole`, Textsorte laut `genere`; Regelwerke und Ausschreibungen mit Zwischenüberschriften („Art. 1 – …“, „Requisiti“, „Scadenze“).
- Genau so viele `affermazioni` wie verlangt. B1/B2: etwa die Hälfte zutreffend. C1/C2: **genau** so viele `true` wie unter `presenti` (7).
- Aussagen in der Reihenfolge des Textes, jede zu einer anderen Stelle.
- Falsche Aussagen sind plausibel und nah am Text (Detail vertauscht, Bedingung weggelassen, Verallgemeinerung wie „tutti“, „solo“, „direttamente“, Frist oder Betrag verändert).
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.

