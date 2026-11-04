# daje · CILS-Aufgabentyp `asc-scelta`

**Ascolto · Completa le frasi (scelta multipla)** · Ascolto · Niveaus A1–C2

## Worum es geht

Wie im Heft: Die Lernenden hören die Aufnahme (Transkript unten) und vervollständigen Satzanfänge; je Satz eine richtige Fortsetzung. A1/A2: 4 Sätze mit 3 Fortsetzungen (Ascolto, Prova 2). B1: 7 Sätze mit 4 Fortsetzungen (Prova 2). B2: Prova 1 = 7 kurze Hörtexte mit je einem Satz, Prova 2 = ein Text mit 7 Sätzen. C1/C2: Prova 1 und 2 je ein Text mit 7 Sätzen und 4 Fortsetzungen.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "asc-scelta",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "kurzer Titel, passend zur Aufnahme",
      "piuTesti": false,
      "domande": [
        {
          "domanda": "Durante il campo Arianna ha potuto",
          "opzioni": [
            "conoscere ragazzi di altri paesi.",
            "imparare a cucinare.",
            "visitare tre città.",
            "lavorare in un museo."
          ],
          "giusta": "A"
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

- Genau so viele Sätze (`domande`) und Fortsetzungen (`opzioni`) wie in den Vorgaben.
- `domanda` ist wie im Heft ein **Satzanfang** ohne Doppelpunkt („Secondo Marco, la gita …“), die Optionen setzen ihn grammatisch passend fort und enden mit Punkt.
- Besteht das Transkript aus mehreren kurzen Hörtexten (B2, Prova 1), setze `"piuTesti": true` und schreib zu jedem Text genau einen Satz in dessen Reihenfolge.
- Jeder Satz bezieht sich auf eine eigene Stelle des Transkripts, in der Reihenfolge des Hörtexts.
- Die richtige Fortsetzung steht inhaltlich im Transkript, meist mit anderen Worten. Ablenker verwenden Wörter aus dem Transkript, sind aber falsch (andere Person, Zeit, Ort, Grund).
- Keine Fragen zu Details, die man beim einmaligen Hören nicht verstehen kann.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.

