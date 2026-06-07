# Rosenraum

@styles.md

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, framer-motion
- **Backend:** Firebase Firestore (Realtime), Next.js API Routes (KI-Proxy)
- **KI:** Claude Max OAuth via `/api/analyze` — kein API-Key, kein Billing
- **Hosting:** Firebase App Hosting → Deploy via `git push origin main`
- **Repo:** `https://github.com/curious93/rosenraum`
- **QR-Code:** `qrcode.react` (client-side)
- **Animationen:** `framer-motion`

## Dev

```bash
npm run dev    # Dev-Server auf http://localhost:3000
npm run lint   # ESLint (muss grün sein vor Commit)
npm run build  # Produktions-Build
```

## Ticket-Workflow

1. Alle Tickets leben in GitHub Issues: `gh issue list --repo curious93/rosenraum`
2. Vor jeder Session Issues prüfen — kein Ticket anfangen das nicht existiert
3. Commits referenzieren immer die Issue-Nummer: `feat: beschreibung (#N)`
4. Ticket schließen: `gh issue close <nr> --repo curious93/rosenraum`

## Kritische UX-Regeln (niemals brechen)

- **Kein Score, kein Urteil** — keine Punkte, Badges, Prozentzahlen
- **GFK unsichtbar für Empfänger** — Dots, Toggle, Lernfeatures sind nur für den Sender sichtbar
- **Nachricht gehört dem Sender** — Empfänger sieht immer nur die gesendete Version
- **Warme Leere** — leere Zustände sind einladend, nie technisch
- **Kein Popup bewertet** — alles passiert auf Tap des Nutzers

## KI-Integration

- **Keine ANTHROPIC_API_KEY** — Claude Max OAuth via `CLAUDE_OAUTH_TOKEN`
- Token extrahieren: `~/.claude/credentials.json` → `claudeAiOauth.accessToken`
- Token setzen: `firebase apphosting:secrets:set CLAUDE_OAUTH_TOKEN --project <project-id>`
- API: `https://api.anthropic.com/v1/messages` mit `Authorization: Bearer <token>` + `anthropic-beta: oauth-2025-04-20`

## Firebase

- Firebase Projekt-ID: **`<project-id>`** ← nach Anlegen eintragen
- Deploy: nur `git push origin main` — **niemals** `firebase deploy`
- Secrets: nur via `firebase apphosting:secrets:set`

## Datenmodell (Firestore)

```
rooms/{roomId}
  createdAt, roomName?, inviteCode (6-char), pin? (SHA-256)
  participants/{participantId}: { name?, joinedAt, rosenbergMode }
  messages/{messageId}: { senderId, originalText, rosenbergText?, sentVersion, timestamp, hasLearningDots, learningAspects? }
```

## Dokumentations-Pflicht

Alle exportierten Funktionen und Typen brauchen JSDoc (`@param`, `@returns`, `@example`).

**Kein hardcodierter Farbwert im Code** — nur CSS-Custom-Properties aus `styles.md`.
