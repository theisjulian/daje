# daje · CILS-Aufgabentyp `str-registro`

**Strutture · Lessico e registro** · Analisi delle strutture di comunicazione · Niveaus C1–C2

## Worum es geht

In jedem Satz ist ein Ausdruck mit Sternchen markiert. Die Lernenden wählen aus 4 Möglichkeiten den Ausdruck, der ihn im Kontext gleichbedeutend ersetzt (Synonym, gehobenes oder formelles Register, feste Wendung).

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "str-registro",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "frasi": [
        {
          "frase": "Il direttore ha *messo in evidenza* i risultati del progetto.",
          "opzioni": [
            "sottolineato",
            "sottratto",
            "sottoscritto",
            "sottoposto"
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

- Genau so viele `frasi` wie verlangt; der zu ersetzende Ausdruck steht zwischen `*…*`.
- Alle 4 Optionen haben dieselbe Wortart und Form und könnten grammatisch eingesetzt werden; nur eine bewahrt Bedeutung und Register im Kontext.
- Ablenker: ähnlich klingende Wörter (Paronyme), falsche Freunde, Wörter mit verwandter, aber anderer Bedeutung.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor.
