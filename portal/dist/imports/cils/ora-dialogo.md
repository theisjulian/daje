# daje · CILS-Aufgabentyp `ora-dialogo`

**Orale · Prova 1** · Produzione orale · Niveaus A1–C2

## Worum es geht

Produzione orale, Prova 1. A1/A2: 2 einfache Rollenspiele („Il candidato dovrà dimostrare di saper interagire …“). B1/B2: 4 Gesprächsthemen mit Fragen, die Prüferin bzw. der Prüfer führt das Gespräch (2–3 Minuten). C1: 4 komplexe Situationen, in denen die Lernenden eine Rolle übernehmen („L’esaminatore assume il ruolo del …“), 3–4 Minuten. C2: 4 Thesen zur Diskussion („Esprimi la tua opinione.“), 3–4 Minuten.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "ora-dialogo",
  "tema": "…",
  "esercizi": [
    {
      "situazioni": [
        {
          "situazione": "Sei il rappresentante degli studenti e devi convincere il preside a organizzare una settimana di attività sportive. L’esaminatore assume il ruolo del preside.",
          "spunti": [
            "Che cosa proponi esattamente?",
            "Come rispondi all’obiezione dei costi?",
            "Quali vantaggi porti come argomento?"
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

- **Genau** so viele `situazioni` wie verlangt, in der Form laut `forma`, aus Sicht der Lernenden mit „tu“ bzw. als Frage an sie.
- A1/A2/C1: Die Rolle der Lehrkraft nennen („L’esaminatore è …“). B1/B2: ein bis zwei Leitfragen. C2: eine zugespitzte These plus „Esprimi la tua opinione.“
- `spunti` = 3–6 Redemittel bzw. Nachfragen für die Lehrkraft.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.

