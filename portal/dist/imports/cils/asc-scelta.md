# daje · CILS-Aufgabentyp `asc-scelta`

**Ascolto · Scelta multipla** · Ascolto · Niveaus A1–C2

## Worum es geht

Die Lernenden hören die Aufnahme der Lehrkraft (Transkript unten) und beantworten Fragen mit Auswahlantworten. In den CILS-Heften gibt es diese Form auf allen Niveaus: A1/A2 mit Satzanfängen und 3 Fortsetzungen, ab B1 mit Fragen und 4 Antworten.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "asc-scelta",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "kurzer Titel, passend zur Aufnahme",
      "domande": [
        {
          "domanda": "Perché Marco chiama Giulia?",
          "opzioni": [
            "Per invitarla a una festa.",
            "Per chiederle un libro.",
            "Per spostare un appuntamento.",
            "Per raccontarle un viaggio."
          ],
          "giusta": "C"
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

- Genau so viele Fragen (`domande`) und Optionen (`opzioni`) wie in den Vorgaben.
- A1/A2: `domanda` darf ein Satzanfang sein („Martina è …“), die Optionen setzen ihn fort.
- Jede Frage bezieht sich auf eine eigene Stelle des Transkripts, in der Reihenfolge des Hörtexts.
- Die richtige Antwort steht inhaltlich im Transkript, meist mit anderen Worten. Ablenker verwenden Wörter aus dem Transkript, sind aber falsch (andere Person, Zeit, Ort, Grund).
- Keine Fragen zu Details, die man beim einmaligen Hören nicht verstehen kann (Hausnummern, Nebensätze am Rand).
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
