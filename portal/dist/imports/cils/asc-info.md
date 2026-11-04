# daje · CILS-Aufgabentyp `asc-info`

**Ascolto · Informazioni presenti** · Ascolto · Niveaus B1–C2

## Worum es geht

Ascolto, Prova 3. **B1/B2:** 12 Aussagen, bei jeder entscheiden die Lernenden vero oder falso (B1 oft zwei Hörtexte mit je 6 Aussagen). **C1/C2:** 15 Aussagen A–O, genau 6 davon stehen im Hörtext; die Lernenden kreuzen diese 6 an.

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

- Genau so viele `affermazioni` wie verlangt. B1/B2: etwa die Hälfte mit `"presente": true`, gemischt. C1/C2: **genau** so viele `true` wie unter `presenti` angegeben (6), alle übrigen `false`.
- Die Aussagen folgen der Reihenfolge des Transkripts; bei zwei Hörtexten zuerst alle zum ersten Text.
- Zutreffende Aussagen sagen dasselbe mit anderen Worten. Falsche Aussagen greifen Wörter und Zahlen aus dem Transkript auf, verändern aber einen wichtigen Punkt (Zahl, Person, „esclusivamente“, Ursache, Reihenfolge) oder behaupten etwas, das nicht gesagt wird.
- C1/C2: Aussagen als kurze, sachliche Sätze im Stil „Il relatore sostiene che …“, „Secondo l’intervistata …“.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.

