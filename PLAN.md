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
