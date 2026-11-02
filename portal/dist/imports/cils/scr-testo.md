# daje · CILS-Aufgabentyp `scr-testo`

**Scrittura · Prova 1** · Produzione scritta · Niveaus A1–C2

## Worum es geht

Produzione scritta, Prova 1: zwei Themen zur Wahl („Puoi scegliere di trattare uno dei seguenti argomenti“). TRE-C1: argumentierender Text mit 160–180 Wörtern (Überlegungen, Vor- und Nachteile, eigener Standpunkt). Die übrigen Niveaus: Richtwerte laut Vorgaben.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "scr-testo",
  "tema": "…",
  "esercizi": [
    {
      "compiti": [
        {
          "consegna": "Negli ultimi anni molte città hanno chiuso il centro storico alle auto. Esponi le tue considerazioni sui vantaggi e sugli svantaggi di questa scelta.",
          "modello": "Mustertext genau auf Niveau und in der verlangten Länge",
          "criteri": [
            "presenta vantaggi e svantaggi",
            "esprime e motiva un punto di vista",
            "usa connettivi"
          ]
        },
        {
          "consegna": "…",
          "modello": "…",
          "criteri": [
            "…"
          ]
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

- **Genau 2** Aufgaben in `compiti`. `consegna` nennt nur das Thema mit Situation und Inhaltspunkten (die allgemeine Anweisung mit Wortzahl setzt daje davor).
- `modello` ist ein Mustertext genau auf Niveau und im Bereich `parole`.
- `criteri`: 3–5 kurze Prüfpunkte auf Italienisch (Inhalt, Aufbau, Sprache).
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
