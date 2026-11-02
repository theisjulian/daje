# daje · CILS-Aufgabentyp `str-pronomi`

**Strutture · Aggettivi e pronomi** · Analisi delle strutture di comunicazione · Niveaus B2

## Worum es geht

Strutture, Prova 1 (DUE-B2): offener Lückentext mit 20 Lücken, je ein Wort: Possessiva, Demonstrativa, Indefinita, Personal- und Relativpronomen.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "str-pronomi",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "esempio": "tutta",
      "testo": "Ho letto [[tutta]] la storia in una sera. I libri? [[Li]] ho comprati usati. [[Chi]] legge molto …"
    }
  ],
  "noteDocente": [
    "…"
  ]
}
```

## Regeln für diesen Typ

- **Genau** so viele Lücken wie verlangt, je **ein** Wort; Mischung laut `forme`.
- Jede Lücke ist aus dem Kontext eindeutig; wo zwei Wörter gleichwertig sind, beide mit `/`: `[[quelli/coloro]]`, `[[suo/proprio]]`.
- Keine Lücke darf allein durch Genus oder Numerus lösbar sein; entscheidend sind Bezug und Funktion.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
