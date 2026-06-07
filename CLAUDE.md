# Projektname

<!-- Ersetze "Projektname" mit dem tatsächlichen Projektnamen -->

@styles.md
@decisions.md

## Ticket-Workflow

1. Alle Tickets leben in GitHub Issues: `gh issue list --repo <user>/<repo>`
2. Vor jeder Session Issues prüfen — kein Ticket anfangen das nicht existiert
3. Commits referenzieren immer die Issue-Nummer: `feat: beschreibung (#N)`
4. Ticket schließen: `gh issue close <nr> --repo <user>/<repo>`

## Dokumentations-Pflicht (durch ESLint erzwungen)

Kein Merge ohne grünes CI. CI prüft:
- Alle exportierten Funktionen haben JSDoc (`@param`, `@returns`, `@example`)
- Alle TypeScript-Typen/Interfaces haben JSDoc
- TypeScript Strict Mode: keine impliziten `any`

**Pflicht-Pattern für Funktionen:**
```ts
/**
 * Kurze Beschreibung was die Funktion tut.
 *
 * @param foo - Was dieser Parameter bedeutet
 * @returns Was zurückgegeben wird und warum
 * @example
 * const result = myFn('input') // → 'expected output'
 */
export const myFn = (foo: string): string => { ... }
```

**Pflicht-Pattern für Typen:**
```ts
/** Beschreibt X im Kontext von Y. */
export interface MyType {
  /** Was dieses Feld bedeutet und welche Werte erlaubt sind. */
  field: string
}
```

**Why-Kommentare** für nicht-offensichtliche Logik:
```ts
// Grund warum diese Logik so funktioniert — nicht was sie tut.
```

Nicht kommentieren: offensichtliche Logik, Task-Referenzen, was der Code tut.

## Design-Referenzdateien (Projektwurzel)

| Datei | Zweck |
|-------|-------|
| `styles.md` | Verbindliches Designsystem: Farben, Typo, Animationen, Do/Don't |
| `decisions.md` | Architektur-Entscheidungen mit Begründung |

**Regel:** Vor jeder UI-Entscheidung `styles.md` lesen.
Kein hardcodierter Farbwert im Code — nur CSS-Custom-Properties aus `styles.md`.

## Stack

<!-- Anpassen je nach Projekt -->
- Vite + React + TypeScript
- Tailwind CSS
- Kein Backend, kein Auth (anpassen falls nötig)

## Dev

```bash
npm run dev    # Entwicklungsserver
npm run lint   # ESLint + JSDoc-Check (muss grün sein vor Commit)
npm run build  # Produktions-Build
```

## Setup nach Template-Clone

Nach `gh repo create <name> --template curious93/project-template`:

1. CI aktivieren: `.github/workflow-templates/ci.yml` → `.github/workflows/ci.yml` kopieren
2. `npm install` ausführen
3. Ersten Push machen → CI-Run prüfen: `gh run list --repo <user>/<name> --limit 3`
4. `styles.md` ausfüllen bevor UI-Arbeit beginnt
5. `decisions.md` mit ersten Architektur-Entscheidungen befüllen

## Firebase Hosting (optional — nur wenn Hosting benötigt)

Vorlagen liegen in `firebase/` — erst aktivieren wenn Hosting wirklich gebraucht wird.

### Aktivierungs-Schritte

```bash
# 1. Vorlagen ins Projektwurzel kopieren und befüllen
cp firebase/.firebaserc.example .firebaserc          # Project-IDs eintragen
cp firebase/firebase.json.example firebase.json
cp firebase/apphosting.yaml.example apphosting.yaml  # Werte eintragen
cp firebase/.env.example .env.example                # Für lokale Entwicklung

# 2. PR-Preview-Workflow aktivieren (optional, aber empfohlen)
cp firebase/pull-request-preview.yml.example .github/workflows/pull-request-preview.yml
# Placeholder <project-id> in der Datei ersetzen

# 3. Firebase-Projekt verbinden
firebase apphosting:backends:create --project <project-id> --repo <user>/<repo>

# 4. Secrets setzen (Server-only Werte)
firebase apphosting:secrets:set FIREBASE_ADMIN_PROJECT_ID --project <project-id>
firebase apphosting:secrets:set FIREBASE_ADMIN_CLIENT_EMAIL --project <project-id>
firebase apphosting:secrets:set FIREBASE_ADMIN_PRIVATE_KEY --project <project-id>

# 5. GitHub Secret für PR Preview
# Firebase Console → Project Settings → Service Accounts → Generate key → JSON
# GitHub: Repo → Settings → Secrets → FIREBASE_SERVICE_ACCOUNT_PREVIEW = JSON-Inhalt

# 6. Deploy testen
git push origin main
gh run list --repo <user>/<repo> --limit 3
```

### Kritische Regeln
- `.firebaserc` — jedes Projekt hat EIGENE Project-IDs, niemals von anderen Projekten kopieren
- `NEXT_PUBLIC_*` → in `apphosting.yaml` als `value` (public, Build-Zeit)
- Secrets → nur via `firebase apphosting:secrets:set` in Google Cloud Secret Manager
- `.env.local` ist in `.gitignore` — niemals committen
- `firebase deploy` ist FALSCH für App Hosting — immer `git push origin main`

Vollständige Dokumentation: `~/.claude/firebase-deploy.md`
