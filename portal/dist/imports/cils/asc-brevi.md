# daje · CILS-Aufgabentyp `asc-brevi`

**Ascolto · Testi brevi** · Ascolto · Niveaus A1–A2

## Worum es geht

Die Aufnahme besteht aus mehreren kurzen Hörtexten (Nachricht auf dem Anrufbeantworter, Durchsage, Werbung, kurzer Dialog). Zu jedem Text wählen die Lernenden die eine Aussage, die zutrifft.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "asc-brevi",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "testi": [
        {
          "numero": 1,
          "opzioni": [
            "Il treno parte alle otto.",
            "Il treno è in ritardo.",
            "Il treno arriva a Roma."
          ],
          "giusta": "B"
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

- Ein Eintrag in `testi` für jeden Kurztext im Transkript (die Lehrkraft markiert sie als „Testo 1“, „Testo 2“ …). Ist nichts markiert, teile sinnvoll nach Sprechsituationen.
- Je 3 Aussagen, genau eine trifft zu. Die anderen beiden nehmen Wörter aus demselben Text auf, stimmen aber nicht.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
