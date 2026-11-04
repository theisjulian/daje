# daje · CILS-Aufgabentyp `str-trasforma`

**Strutture · Riscrivi le frasi** · Analisi delle strutture di comunicazione · Niveaus C1–C2

## Worum es geht

Strutture, Prova 4 (TRE-C1, QUATTRO-C2): 6 Sätze aus einem Regelwerk oder einer Ausschreibung. Zu jedem Satz sind die ersten Wörter einer Umformulierung vorgegeben; die Lernenden schreiben den Satz mit veränderter Satzstruktur und gleicher Bedeutung weiter (z. B. aktiv → passiv, Nebensatz → Nominalgruppe, explizit → implizit).

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "str-trasforma",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "Regolamento della biblioteca",
      "frasi": [
        {
          "frase": "I lettori che desiderano prolungare il prestito devono presentare una richiesta entro la scadenza.",
          "inizio": "Chi desidera",
          "soluzioni": [
            "prolungare il prestito deve presentare una richiesta entro la scadenza."
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

- **Genau** 6 `frasi`, alle aus **einem** zusammenhängenden Regelwerk oder Bando zum Thema (Satzlänge laut `genere`).
- `inizio`: die vorgegebenen Anfangswörter der Umformulierung (2–4 Wörter), wie im Heft; sie erzwingen eine andere Satzstruktur.
- `soluzioni`: Fortsetzungen **ohne** den Anfang, alle wirklich üblichen richtigen Fassungen (1–6), die erste ist die beste.
- Nur Umformungen mit wenigen eindeutigen Lösungen wählen; Arten der Umformung abwechseln.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
- `soluzioni`: **alle** gleichwertig richtigen Fortsetzungen angeben (auch mit Synonymen); nur diese wertet daje als richtig.
