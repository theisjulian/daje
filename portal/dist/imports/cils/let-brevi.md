# daje · CILS-Aufgabentyp `let-brevi`

**Lettura · Testi brevi (una informazione per testo)** · Comprensione della lettura · Niveaus A1–A2

## Worum es geht

Lettura, Prova 2: vier kurze Gebrauchstexte mit Überschrift (Anzeige, Hinweis, Programm, Nachricht). Zu jedem Text 3 Informationen, genau eine steht im Text.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "let-brevi",
  "tema": "…",
  "esercizi": [
    {
      "testi": [
        {
          "titolo": "Corso di chitarra",
          "testo": "…",
          "opzioni": [
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

- Genau 4 Texte (Länge laut `parole`), je 3 Informationen.
- Die richtige Information gibt eine Aussage des Textes mit anderen Worten wieder; die anderen beiden nutzen Textwörter, stimmen aber nicht.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
