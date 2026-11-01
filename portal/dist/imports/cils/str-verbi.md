# daje · CILS-Aufgabentyp `str-verbi`

**Strutture · Forme verbali** · Analisi delle strutture di comunicazione · Niveaus A1–C2

## Worum es geht

Ein zusammenhängender Text, in dem Verben in der passenden Zeit und im passenden Modus ergänzt werden. Der Infinitiv steht in Klammern direkt vor der Lücke.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "str-verbi",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "consegna": "Completa il testo con i verbi al tempo e al modo giusti.",
      "testo": "Quando (arrivare) [[sono arrivata/sono arrivato]] a Bologna, non (conoscere) [[conoscevo]] nessuno …"
    }
  ],
  "noteDocente": [
    "…"
  ]
}
```

## Regeln für diesen Typ

- Genau so viele Lücken wie verlangt, mit den Zeiten und Modi aus der Vorgabe `tempi` gemischt.
- Der Kontext entscheidet eindeutig über Zeit und Modus (Zeitangaben, Konjunktionen, Hauptsatzverb). Wo zwei Formen richtig sind, beide mit `/` angeben.
- Ab B2 auch Konjunktiv nach Verben der Meinung, nach Konjunktionen (benché, affinché, prima che) und im periodo ipotetico; ab C1 implizite Formen, wo der Text sie verlangt (dann steht der Hinweis in der Klammer, z. B. `(uscire, gerundio)`).
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
