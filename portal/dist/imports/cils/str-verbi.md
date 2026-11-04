# daje · CILS-Aufgabentyp `str-verbi`

**Strutture · Verbi** · Analisi delle strutture di comunicazione · Niveaus A1–C2

## Worum es geht

Strutture, Prova 2: ein zusammenhängender Text, in dem Verben ergänzt werden. Der Infinitiv steht in Klammern direkt vor der Lücke. A1 Präsens (10), A2 passato prossimo (10), ab B1 20 Lücken mit den Zeiten und Modi aus `tempi`.

## Was in `esercizi` steht

```json
{
  "livello": "…",
  "tipo": "str-verbi",
  "tema": "…",
  "esercizi": [
    {
      "titolo": "…",
      "esempio": "(nascere) è nato",
      "testo": "Quando (arrivare) [[sono arrivata/sono arrivato]] a Bologna, non (conoscere) [[conoscevo]] nessuno …"
    }
  ],
  "noteDocente": [
    "…"
  ]
}
```

## Regeln für diesen Typ

- **Genau** so viele Lücken wie verlangt, mit den Zeiten und Modi aus `tempi`; ein zusammenhängender Text (Biografie, Bericht, Erzählung), in dem die Zeitenfolge zählt.
- `esempio`: Beispiel (0) wie im Heft, z. B. `"(nascere) è nato"`.
- Der Kontext entscheidet eindeutig über Zeit und Modus. Wo zwei Formen richtig sind, beide mit `/` angeben.
- C1/C2: auch passato remoto, Passiv, Konjunktiv (Imperfekt, Plusquamperfekt) und implizite Formen; verlangt der Text eine implizite Form, steht der Hinweis in der Klammer, z. B. `(uscire, gerundio)`.
- Zahlen (Wörter, Fragen, Lücken, Aussagen) stehen unter „Vorgaben für dieses Niveau“ in den Eingaben; sie gehen vor und müssen **genau** stimmen, sonst lehnt daje die Antwort ab.
- Die Anweisung des Hefts (consegna) setzt daje selbst ein. Gib sie nicht aus.
- Offene Lücken: **alle** gleichwertig richtigen Lösungen mit `/` angeben (Synonyme, gleichwertige Formen), z. B. `[[benché/sebbene/nonostante]]`. Nur was in den Klammern steht, wertet daje als richtig.
