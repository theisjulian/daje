# daje · CILS-Aufgabentyp `ora-monologo`

**Orale · Prova 2** · Produzione orale · Niveaus A1–C2

## Worum es geht

Produzione orale, Prova 2: zusammenhängendes Sprechen zu einem Thema, ohne Unterbrechung. A1/A2: 3 Themen (eines davon im Heft ein Bild), etwa anderthalb Minuten. B1/B2: 4 Themen (zwei davon im Heft Bilder), anderthalb Minuten. C1: 4 Impulse mit Daten oder einer Aussage und „Che cosa ne pensi?“, 2–3 Minuten. C2: 4 argumentative Impulse, 2–3 Minuten. daje arbeitet ohne Bilder: alle Themen als Text.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "ora-monologo",
  "tema": "…",
  "esercizi": [
    {
      "argomenti": [
        {
          "argomento": "Secondo una ricerca, sei giovani su dieci leggono le notizie solo sui social network. Che cosa ne pensi?",
          "spunti": [
            "Dove ti informi tu?",
            "Quali rischi vedi?",
            "Che cosa potrebbe fare la scuola?"
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

- **Genau** so viele `argomenti` wie verlangt, in der Form laut `forma` (A1/A2 persönlich: „Te stesso“, „Un oggetto che ti piace“; B1 persönlich, B2 erlebnis- und meinungsbezogen).
- `stimolo` (optional): ein selbst geschriebener Satz als Impuls, kein Zitat realer Personen.
- `spunti`: 3–6 Leitfragen auf Italienisch, die eine Gliederung nahelegen.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
