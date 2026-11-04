# daje · CILS-Aufgabentyp `let-scelta`

**Lettura · Testo e completa le frasi** · Comprensione della lettura · Niveaus A1–C2

## Worum es geht

Lettura, Prova 1: ein Text mit Überschrift, dazu Satzanfänge mit Fortsetzungen. Im Heft: A1 kurzer Hinweis oder Info-Text (~110 Wörter), 4 Sätze × 3; A2 kurzes Interview oder Info-Text (~180 Wörter), 4 × 3; B1 Zeitungsartikel (~400 Wörter), 7 × 4; B2 Interview oder Artikel (~450 Wörter), 7 × 4; C1 Interview oder journalistischer Essay (~650 Wörter), 7 × 4; C2 anspruchsvoller Essay oder Feuilleton (~900 Wörter), 7 × 4.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "let-scelta",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "Un’estate da volontari",
      "testo": "Absatz 1 …\n\nAbsatz 2 …",
      "domande": [
        {
          "domanda": "Secondo l’articolo, i ragazzi scelgono il volontariato soprattutto perché",
          "opzioni": [
            "vogliono fare nuove amicizie.",
            "…",
            "…",
            "…"
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

- Textlänge in Wörtern **genau im Bereich** der Vorgabe `parole`, Textsorte laut `genere`, in Absätze gegliedert. Interviews mit Fragen der Redaktion fett oder als eigene Absätze.
- Genau so viele `domande` (Satzanfänge) und `opzioni` wie verlangt; Sätze in der Reihenfolge des Textes.
- Ab B1 prüft mindestens ein Satz die Hauptaussage oder Absicht des Textes, ab B2 mindestens einer eine Schlussfolgerung oder Haltung, ab C1 auch Implizites und Wortbedeutung im Kontext.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.

