# daje · CILS-Aufgabentyp `asc-info`

**Ascolto · Individuare le informazioni presenti** · Ascolto · Niveaus B1–C2

## Worum es geht

Die Lernenden hören die Aufnahme und wählen aus einer Liste von Aussagen diejenigen, die im Hörtext vorkommen. Die übrigen Aussagen klingen plausibel, kommen aber nicht vor oder widersprechen dem Text.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "asc-info",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "affermazioni": [
        {
          "testo": "La biblioteca resterà chiusa ad agosto.",
          "presente": true
        },
        {
          "testo": "I prestiti si possono rinnovare online.",
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

- Genau so viele `affermazioni` wie in den Vorgaben, davon genau `presenti` mit `"presente": true`.
- Die zutreffenden Aussagen geben den Inhalt **mit anderen Worten** wieder, nicht wörtlich.
- Die nicht zutreffenden Aussagen passen zum Thema, nutzen teils Wörter aus dem Transkript, sagen aber etwas, das nicht gesagt wird oder anders gesagt wird. Keine absurden Aussagen.
- Mische zutreffende und nicht zutreffende Aussagen; die zutreffenden folgen untereinander der Reihenfolge des Textes.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
