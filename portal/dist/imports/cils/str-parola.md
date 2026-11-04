# daje · CILS-Aufgabentyp `str-parola`

**Strutture · Completa il testo** · Analisi delle strutture di comunicazione · Niveaus C1–C2

## Worum es geht

Strutture, Prova 1 (TRE-C1, QUATTRO-C2): offener Lückentext mit 20 Lücken, je ein Wort, ohne Hinweise. Gesucht sind vor allem Konnektoren, Präpositionen, Pronomen und Adverbien (im Heft z. B. ma, che, fino a, mentre, cui, ne, poiché).

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "str-parola",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "esempio": "che",
      "testo": "Lo scrittore, [[che]] aveva vissuto a lungo all’estero, tornò a Napoli [[nel]] 1952 …"
    }
  ],
  "noteDocente": [
    "…"
  ]
}
```

## Regeln für diesen Typ

- **Genau** so viele Lücken wie verlangt, je **ein** Wort (zusammengesetzte Präpositionen wie „fino a“ zählen als eine Lücke, dann beide Fassungen angeben).
- Mischung laut `forme`; keine Lücke für Inhaltswörter, die man nur raten könnte.
- Jede Lücke ist aus Satzbau und Zusammenhang eindeutig; gleichwertige Lösungen mit `/` (`[[poiché/perché]]`).
- Text: anspruchsvoller Sachtext (Kultur, Geschichte, Gesellschaft) von 300–400 Wörtern.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
- Offene Lücken: **alle** gleichwertig richtigen Lösungen mit `/` angeben (Synonyme, gleichwertige Formen), z. B. `[[benché/sebbene/nonostante]]`. Nur was in den Klammern steht, wertet daje als richtig.
