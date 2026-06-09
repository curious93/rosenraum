# GFK Scoring — Visueller Testplan

**Einzige Seite:** `https://rosenraum-1--rosenraum-app.europe-west4.hosted.app/room/h4YRjs6JQdvtDe2Jj7VM`
**Keine andere Seite wird geöffnet.**

---

## Features im Code (was getestet werden muss)

### GfkScorePanel (`GfkScorePanel.tsx`)
| Feature | Details |
|---------|---------|
| Header-Label | `"Dein GFK-Lernfeedback"` — uppercase, tracking-wide, `--color-text-muted` |
| Text mit Highlights | Originaltext mit farbigen `<mark>`-Spans pro Dimension |
| 4 Balken | Beobachtung (blau), Gefühl (orange), Bedürfnis (grün), Bitte (lila) |
| Skeleton-State | Balken bei `loading=true`: grau 60% breit + Shimmer-Animation |
| Score-Zahlen | Rechts neben jedem Balken: `1–10`, Farbe = Dimensionsfarbe |
| Score-Zahlen Loading | Zeigt `–` während loading |
| Balken-Animation | `width: 0% → score*10%` Spring-Animation mit staggered delay |
| Highlight-Farben | bg = `--color-gfk-*-bg`, border-bottom = `--color-gfk-*` mit 55% opacity |

### SendBottomSheet (`SendBottomSheet.tsx`)
| Feature | Details |
|---------|---------|
| GfkScorePanel Position | Ganz oben im Sheet, über "Welche Version senden?" |
| Drag Handle | 10×4px, `--color-border`, zentriert |
| "Welche Version senden?" | Label über den VersionCards |
| Deine Version Card | Text des Users, selektierbar |
| Rosenraum-Beispiel Card | GFK-Vorschlag, loading skeleton, NICHT auto-selected |
| "Nur zur Inspiration" | Subtitle in GfkVersionCard — muss gut lesbar sein (G1) |
| Debounced Re-Score | Text editieren → nach 800ms neu laden |
| Senden-Button | Disabled während analyzing |

---

## Screenshots — Reihenfolge

| # | Was | Wann | Datei |
|---|-----|------|-------|
| S1 | Room lädt — leerer Zustand | Sofort nach Navigation | `/tmp/gfk_S1_room.jpg` |
| S2 | SendBottomSheet öffnet — Skeleton-State | Sofort nach Senden-Klick (< 1s) | `/tmp/gfk_S2_skeleton.jpg` |
| S3 | GfkScorePanel geladen — Balken sichtbar | Nach 5s (KI-Antwort) | `/tmp/gfk_S3_scored.jpg` |
| S4 | Text-Highlights im Panel | Zoom auf GfkScorePanel | `/tmp/gfk_S4_highlights.jpg` |
| S5 | "Nur zur Inspiration" Subtitle | Zoom auf GfkVersionCard | `/tmp/gfk_S5_subtitle.jpg` |
| S6 | Score-Zahlen (1–10) + Farben | Zoom auf Balken-Bereich | `/tmp/gfk_S6_scores.jpg` |

---

## Prüfkriterien pro Screenshot

**S1 Room leerer Zustand:**
- ✅/❌ Seite lädt korrekt ohne Fehler
- ✅/❌ Input-Feld unten sichtbar ("Schreib etwas...")
- ✅/❌ Header sichtbar

**S2 Skeleton-State:**
- ✅/❌ Sheet slide-up sichtbar
- ✅/❌ "Dein GFK-Lernfeedback" Header sichtbar
- ✅/❌ 4 graue Balken mit Shimmer sichtbar
- ✅/❌ Score-Zahlen zeigen "–"
- ✅/❌ GFK-Vorschlag-Card lädt (skeleton)

**S3 Scored State:**
- ✅/❌ 4 farbige Balken (blau/orange/grün/lila)
- ✅/❌ Balken haben unterschiedliche Längen (nicht alle gleich)
- ✅/❌ Score-Zahlen 1–10 sichtbar
- ✅/❌ GFK-Vorschlag-Text erschienen

**S4 Text-Highlights:**
- ✅/❌ Originaltext hat farbige Unterstreichungen/Hintergründe
- ✅/❌ Verschiedene Farben für verschiedene Dimensionen

**S5 "Nur zur Inspiration":**
- ✅/❌ Text gut lesbar — KEIN zu blasser Grauton (G1-Fix)
- ✅/❌ Kontrast ausreichend

**S6 Score-Zahlen:**
- ✅/❌ Zahlen in Dimensionsfarbe (blau/orange/grün/lila)
- ✅/❌ Balkenbreite entspricht Score (z.B. Score 7 = 70% Breite)

---

## Ergebnisse

| Screenshot | Status | Befund |
|------------|--------|--------|
| S1 Room | ⏳ | — |
| S2 Skeleton | ⏳ | — |
| S3 Scored | ⏳ | — |
| S4 Highlights | ⏳ | — |
| S5 Subtitle | ⏳ | — |
| S6 Scores | ⏳ | — |

---

# Design-System Infrastructure — Plan & Status

Durable, reusable UI/UX governance system, piloted in Rosenraum. **Status: implemented (2026-06-08).** Living docs are in [`docs/`](docs/); this file is the high-level map.

## Repo assessment (at start)
Next.js 16 + React 19 + **Tailwind v4** (zero-config) + TypeScript. shadcn/ui *configured but unpopulated* (`components.json` + `cn()`, no `ui/`). Custom 6-theme engine via `[data-theme]`, **no dark mode**, no tests, no `docs/`. Convention: design docs at root, auto-read via `@file.md`; no hardcoded hex; JSDoc on exports.

## Decisions (user)
1. **Reuse = update `project-template` only** (no package, no live sync). → [docs/REUSE.md](docs/REUSE.md)
2. **3 families standard, keep Rosenraum's 6** (Expressive, grandfathered) + dark mode. → [docs/THEME_OPTIONS.md](docs/THEME_OPTIONS.md)
3. **Full pilot** incl. Playwright visual + axe a11y + CI gates.

## Architecture
`design/tokens.json` → `scripts/build-tokens.mjs` → `src/app/tokens.generated.css` (Tailwind `@theme` + shadcn bridge + `:root`/`[data-theme]`/`.dark`). Components read **semantic vars only**. → [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md)

## What shipped (by phase)
- **0 — Tokens** ✅ `tokens.json`, generator, generated CSS, shadcn bridge; app pixel-identical after rewire.
- **1 — Themes** ✅ 6 presets × light/dark, `light/dark/system` mode (`theme.ts`, `ThemeSheet.tsx`), FOUC guard, `suppressHydrationWarning`.
- **2 — Docs** ✅ 11 `docs/*`, CLAUDE.md router, `styles.md` cross-link, `check:tokens` / `check:colors`.
- **3 — Primitives** ✅ `ui/` Button, Card, Badge, Input, Dialog, DropdownMenu, Table, Sonner, Empty/Loading/Error; `lib/icons.ts`; dev-only `/preview` gallery; registry seeded.
- **4 — Tests + CI** ✅ Playwright visual regression (proven to catch diffs) + axe a11y (**0 violations**, palette tightened to AA from 54); `check:token-doc` / `check:registry`; CI quality + test (Playwright container) jobs.
- **5 — Reuse** ✅ [docs/REUSE.md](docs/REUSE.md) + [CHANGELOG.md](CHANGELOG.md).

## Validation gates (all green locally)
`npm run lint` · `npx tsc --noEmit` · `check:tokens` · `check:colors` · `check:token-doc` · `check:registry` · `test:a11y` (8 pass) · `test:visual` (6 baselines) · `npm run build`.

## Theme & settings integration
3 families (Default/Expressive/Minimal) × light/dark is the cross-project standard. Rosenraum exposes the 6 presets + light/dark/system in `ThemeSheet`, persisted to `localStorage`, restored pre-paint. Icon system: Lucide via `src/lib/icons.ts` (one family, semantic mapping, labelled icon-only buttons). → [docs/THEME_OPTIONS.md](docs/THEME_OPTIONS.md)

## Risks & rollback
Token rewire could regress visuals → mitigated by pixel-parity check + visual baselines. Dark palette breadth → AA-verified by axe. Cross-platform snapshots → platform-suffixed baselines, linux seeded in CI. Everything is additive and phase-revertable; `tokens.generated.css` is committed so the app never depends on the build script at runtime. → [docs/DESIGN_DECISIONS.md](docs/DESIGN_DECISIONS.md), [docs/DESIGN_DEBT.md](docs/DESIGN_DEBT.md)

## Future UI task checklist
→ [docs/UI_REVIEW_CHECKLIST.md](docs/UI_REVIEW_CHECKLIST.md) (tokens · registered components · standards · a11y · all states · responsive · light+dark · visual regression).
