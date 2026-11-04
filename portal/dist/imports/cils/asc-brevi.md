# daje · CILS-Aufgabentyp `asc-brevi`

**Ascolto · Testi brevi (una informazione per testo)** · Ascolto · Niveaus A1–A2

## Worum es geht

Ascolto, Prova 3: Die Aufnahme besteht aus 4 kurzen Hörtexten (Nachricht auf dem Anrufbeantworter, Durchsage, Werbung, kurzer Dialog). Zu jedem Text gibt es 3 Informationen, genau eine kommt im Text vor.

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

- Genau 4 Einträge in `testi`, einer je Kurztext im Transkript (die Lehrkraft markiert sie als „Testo 1“ …; sonst nach Sprechsituationen teilen).
- Je 3 kurze Informationen, genau eine trifft zu. Die anderen beiden nehmen Wörter aus demselben Text auf, stimmen aber nicht.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.

