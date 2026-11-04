# daje · CILS-Aufgabentyp `str-articoli`

**Strutture · Articoli (e preposizioni articolate)** · Analisi delle strutture di comunicazione · Niveaus A1, B1

## Worum es geht

Strutture, Prova 1. A1: Lückentext mit 10 bestimmten Artikeln. UNO-B1: 20 Lücken für Artikel (bestimmt und unbestimmt) und Präpositionen mit Artikel; steht eine einfache Präposition in Klammern, wird sie mit dem Artikel verbunden.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "str-articoli",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "Il fantastico mondo di Xanadu",
      "esempio": "(di) della",
      "testo": "È un progetto per la promozione (di) [[della]] lettura. Si rivolge (a) [[agli]] studenti … È [[una]] comunità su internet …"
    }
  ],
  "noteDocente": [
    "…"
  ]
}
```

## Regeln für diesen Typ

- **Genau** so viele Lücken wie verlangt. A1: nur il, lo, la, l’, i, gli, le. B1: etwa zur Hälfte Artikel (auch un, uno, una, un’), zur Hälfte Präpositionen mit Artikel; die einfache Präposition steht in runden Klammern **direkt vor** der Lücke: `(di) [[della]]`.
- `esempio`: das Beispiel (0) wie im Heft, z. B. `"(di) della"` oder `"la"`; es steht nicht im Text.
- Auch schwierige Fälle: gli/lo vor s+Konsonant, z, ps; l’ vor Vokal; nel/negli; sul; dall’; con il/col (beide Lösungen: `[[con il/col]]`).
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
- Offene Lücken: **alle** gleichwertig richtigen Lösungen mit `/` angeben (Synonyme, gleichwertige Formen), z. B. `[[benché/sebbene/nonostante]]`. Nur was in den Klammern steht, wertet daje als richtig.
