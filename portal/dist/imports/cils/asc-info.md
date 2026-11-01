# daje · CILS-Aufgabentyp `asc-info`

**Ascolto · Informazioni presenti (vero o falso)** · Ascolto · Niveaus B1–C2

## Worum es geht

Wie im CILS-Heft UNO-B1 und DUE-B2 (Ascolto, Prova 3): Die Lernenden hören die Aufnahme und entscheiden bei jeder Aussage, ob die Information im Hörtext vorkommt (vero) oder nicht (falso). Im Heft 12 Aussagen, oft zu zwei kurzen Hörtexten (je 6).

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
          "testo": "Il concorso esiste da più di settant’anni.",
          "presente": false
        },
        {
          "testo": "I vincitori vengono scelti dai giovani lettori.",
          "presente": true
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

- Genau so viele `affermazioni` wie verlangt, etwa die Hälfte mit `"presente": true`, gemischt (nicht abwechselnd).
- Die Aussagen folgen der Reihenfolge des Transkripts; bei zwei Hörtexten zuerst alle zum ersten Text.
- Zutreffende Aussagen sagen dasselbe mit anderen Worten. Falsche Aussagen greifen Wörter und Zahlen aus dem Transkript auf, verändern aber einen wichtigen Punkt (Zahl, Person, „esclusivamente“, „direttamente“, Ursache, Reihenfolge) oder behaupten etwas, das nicht gesagt wird.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
