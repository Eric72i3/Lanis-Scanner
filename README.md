# Lanis-Scanner

Ein kleines Node.js-Skript, das auf Knopfdruck deine Hausaufgaben aus **Lanis** (Schulportal Hessen) ausliest und als Textdatei `hausaufgaben.txt` ablegt.

Das Skript ist **nur lesend**: Es meldet sich mit deinem eigenen Konto an, schaut in "Mein Unterricht" und schreibt eine Liste. Es schickt nichts ab, ändert nichts und gibt nichts in Lanis ab.

## Was du am Ende bekommst

Nach einem Lauf liegt `hausaufgaben.txt` im Projektordner. Sie wird jedes Mal komplett neu geschrieben:

```
Hausaufgaben (Stand 26.10.2026, 18:13:54)

=== OFFEN (2) ===

Fach: M 11BG07
Aufgabe: S. 61, Nr. 10
Fälligkeit: bis Mo, 26.10. um 22:00 Uhr (Abgabe)
Status: offen
Quelle: Lanis

=== ERLEDIGT (3) ===
...
```

Pro Eintrag stehen dort Fach, Aufgabe, Fälligkeit, Status (offen oder erledigt) und Quelle. Offene und erledigte Aufgaben stehen getrennt, innerhalb davon nach Fälligkeit sortiert.

## Voraussetzungen

- Windows (die `.bat`-Datei ist für Windows; das Skript selbst läuft auch auf anderen Systemen)
- [Node.js](https://nodejs.org/) (aktuelle LTS-Version)
- Ein Lanis-Konto an einer hessischen Schule

## Setup

**1. Repository holen und Abhängigkeiten installieren**

```
git clone https://github.com/Eric72i3/Lanis-Scanner.git
cd Lanis-Scanner
npm install
npx playwright install chromium
```

Der zweite Befehl lädt den Browser (Chromium) herunter, den das Skript im Hintergrund steuert.

**2. Zugangsdaten als Umgebungsvariablen setzen**

Das Skript liest deinen Login aus `LANIS_USER` und `LANIS_PASS`. Es speichert nichts davon in Dateien.

Nur für das aktuelle PowerShell-Fenster:

```powershell
$env:LANIS_USER = "dein.benutzername"
$env:LANIS_PASS = "dein-passwort"
```

Dauerhaft für dein Windows-Konto (danach ein neues Terminal öffnen):

```powershell
setx LANIS_USER "dein.benutzername"
setx LANIS_PASS "dein-passwort"
```

Wichtig: Trag die Zugangsdaten nie in den Code, in eine Textdatei oder in ein Git-Repository ein.

**3. Deine Schule einstellen**

In `src/login.js` steht ganz oben die Schulnummer:

```js
const SCHULNUMMER = "6328";
```

Ersetze sie durch die Nummer deiner Schule. Du findest sie in der Login-URL deiner Schule: `https://login.schulportal.hessen.de/?i=DEINE_NUMMER`.

## Benutzung

Doppelklick auf `hausaufgaben.bat`, oder im Terminal:

```
npm run hausaufgaben
```

Nach wenigen Sekunden steht `hausaufgaben.txt` im Projektordner und im Terminal erscheint z. B.:

```
hausaufgaben.txt geschrieben: 2 offen, 3 erledigt.
```

Starte das Skript nur, wenn du es brauchst. Es läuft nicht im Hintergrund und nicht automatisch.

## Wie es funktioniert

Das Projekt besteht aus drei Dateien in `src/`:

| Datei | Aufgabe |
| --- | --- |
| `login.js` | Startet einen unsichtbaren Chromium-Browser (Playwright), öffnet die Lanis-Login-Seite deiner Schule, trägt Benutzername und Passwort ein und prüft, ob der Login geklappt hat. |
| `lanis.js` | Öffnet "Mein Unterricht" und liest dort die Kursmappen-Einträge aus. Behalten werden nur Einträge, an denen eine Hausaufgabe hängt. Pro Eintrag werden Fach, Aufgabentext, Eintragsdatum, Abgabefrist und der Haken "erledigt" gelesen. |
| `index.js` | Ruft die beiden anderen Dateien auf, bestimmt die Fälligkeit, sortiert und schreibt `hausaufgaben.txt`. |

Ablauf in Kurzform:

1. Login mit den Umgebungsvariablen.
2. Seite "Mein Unterricht" laden und alle Einträge mit Hausaufgabe einsammeln.
3. Fälligkeit bestimmen: Gibt es eine Abgabefrist (z. B. "bis Do, 29.10. um 08:45 Uhr"), gilt sie. Lanis nennt dort kein Jahr, deshalb wird das Jahr vom Eintragsdatum übernommen. Gibt es keine Frist, steht das Eintragsdatum als Hinweis da.
4. Nach Fälligkeit sortieren, in offen und erledigt aufteilen, Datei schreiben.
5. Browser schließen.

Lanis hat keine offizielle Schnittstelle. Das Skript liest deshalb die normale Webseite aus.

## Wenn etwas nicht klappt

- **"LANIS_USER und/oder LANIS_PASS sind nicht gesetzt"**: Die Umgebungsvariablen fehlen. Nach `setx` muss ein neues Terminal geöffnet werden.
- **"Login fehlgeschlagen"**: Benutzername oder Passwort stimmen nicht, oder die Schulnummer in `src/login.js` ist falsch.
- **"keine Kursmappen-Zeilen gefunden"**: Lanis hat vermutlich die Seitenstruktur geändert. Das Skript rät dann nicht, sondern bricht mit dieser Meldung ab, und `lanis.js` muss angepasst werden.
- **Browser fehlt**: `npx playwright install chromium` ausführen.

## Hinweise

- Benutze das Skript nur mit deinem **eigenen** Konto.
- Es macht pro Start nur eine kurze Abfrage. Starte es nicht in schneller Folge, damit die Schulplattform nicht belastet wird.
- Prüfe vor der Nutzung, ob deine Schule Regeln zu automatisiertem Zugriff hat. Die Nutzung geschieht auf eigene Verantwortung.
- `hausaufgaben.txt` ist in der `.gitignore` und wird nicht hochgeladen.
