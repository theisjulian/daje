# E-Mails im daje-Design (Supabase)

Zwei Vorlagen, jeweils mit Deutsch, Italienisch, Englisch und Französisch. Die Sprache kommt aus dem Konto
(`lang`, bei der Registrierung aus der Oberflächensprache gesetzt); ohne Angabe Deutsch. Der Vorname kommt aus
`first_name`.

| Datei | Supabase: Authentication → Emails → | Betreff (Vorschlag) |
|---|---|---|
| `confirm.html` | **Confirm signup** | `Bestätige dein daje-Konto` |
| `recovery.html` | **Reset password** | `Neues Passwort für daje` |

## Einrichten (einmalig, etwa 5 Minuten)

1. Supabase-Projekt **forza** öffnen → *Authentication* → *Emails* (früher „Email Templates“).
2. *Confirm signup*: Betreff eintragen, unter *Message body* den gesamten Inhalt von `confirm.html` einfügen, speichern.
3. *Reset password*: ebenso mit `recovery.html`.
4. *Authentication* → *URL Configuration*: **Site URL** `https://daje.theisapps.de`, bei *Redirect URLs* zusätzlich
   `https://daje.theisapps.de/**` eintragen, damit der Bestätigungslink zurück in die App führt.

## Absender „daje“ statt Supabase (empfohlen)

Ohne eigenen Mailserver kommen die Mails von einer Supabase-Adresse, und Supabase verschickt nur wenige Mails pro Stunde.
Für einen professionellen Absender (z. B. `daje <hallo@theisapps.de>`): *Authentication* → *Emails* → *SMTP Settings* →
*Enable custom SMTP*, dort die Zugangsdaten deines Mailanbieters (z. B. Resend, Brevo oder der Mailserver von
theisapps.de) eintragen. Danach unter *Rate Limits* die Zahl der Mails pro Stunde erhöhen.

### IONOS als Mailserver

| Feld | Wert |
|---|---|
| Host | `smtp.ionos.de` (nicht `ionos.smtp.com`) |
| Port | `587` (STARTTLS) oder `465` (SSL) |
| Benutzername | die vollständige Absenderadresse, z. B. `hallo@theisapps.de` |
| Passwort | das Passwort dieses IONOS-Postfachs |
| Absenderadresse | dieselbe Adresse wie der Benutzername |
| Absendername | `daje` |

Fehler „Error sending confirmation email“ bei der Registrierung bedeutet fast immer: Mailserver falsch eingetragen
(Supabase-Protokoll: *Logs → Auth*).

## Wichtig beim Einfügen

Den Inhalt der Datei als **Quelltext** kopieren (Texteditor oder GitHub-Ansicht „Raw“), nicht aus einer im Browser
geöffneten, gerenderten Seite. Die Sprachweichen `{{ if … }}` stehen nur innerhalb einer Tabellenzelle; sie dürfen nicht
leer sein (`{{ if eq .Data.lang "it" }}{{ else … }}` ohne Text dazwischen heißt: kaputt kopiert).

### iCloud lehnt Mails ab („554 5.7.1 [HM08] Message rejected due to local policy“)

Apple prüft den Absender streng. Ein einzelner Rückläufer, der beim erneuten Senden durchgeht, liegt meist am
Ruf der gerade benutzten IONOS-Versand-IP. Damit es dauerhaft zuverlässig klappt, im IONOS-DNS von theisapps.de prüfen:

| Eintrag | Typ | Wert |
|---|---|---|
| `theisapps.de` | TXT | `v=spf1 include:_spf-eu.ionos.com ~all` (genau **ein** SPF-Eintrag) |
| `_dmarc.theisapps.de` | TXT | `v=DMARC1; p=none; rua=mailto:hallo@theisapps.de` |
| DKIM | – | in IONOS unter *E-Mail → DKIM* aktiviert (die Mails sind bereits mit `s1-ionos` signiert) |

Betreff auf Deutsch setzen (siehe Tabelle oben): ein italienischer Betreff über einem deutschen Text wirkt für
Spamfilter uneinheitlich.

**Achtung, gemeinsames Projekt:** forza und daje nutzen dasselbe Supabase-Projekt und damit dieselben Vorlagen und
denselben Absender. Wer sich bei forza registriert, bekommt also ebenfalls die daje-Mail.
