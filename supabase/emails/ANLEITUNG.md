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
