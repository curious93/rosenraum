# Reuse & Versioning

How this design-system travels to other projects. **Chosen model: update `curious93/project-template` only** — no shared package, no live sync. New projects inherit on bootstrap; existing projects pull deliberately. Design decisions stay isolated to the project that makes them until someone copies them on purpose.

## What's portable vs project-specific

| Portable (copy as-is) | Project-specific (re-derive per project) |
|---|---|
| `docs/*` governance (PRODUCT_SYSTEM, DESIGN_SYSTEM, COMPONENT_STANDARDS, COMPONENT_REGISTRY skeleton, AI_UX_RULES, ACCESSIBILITY_CHECKLIST, UI_REVIEW_CHECKLIST, THEME_OPTIONS, THEME_DISCOVERY, DESIGN_DECISIONS skeleton, DESIGN_DEBT) | `design/tokens.json` **values** (the actual palette — re-derive via THEME_DISCOVERY) |
| `scripts/build-tokens.mjs`, `check-*.mjs` | `styles.md` (project voice) |
| `src/lib/theme.ts` engine (Theme/ColorMode/apply*) | The 6 Rosenraum presets (this project's Expressive set) |
| `src/components/ui/*` primitives + `src/lib/icons.ts` | Domain components (`chat/*`, `invite/*`, …) |
| `playwright.config.ts`, `tests/` harness, `.github/workflows/ci.yml` | Committed visual baselines (`tests/__snapshots__/*`) |
| `design/tokens.json` **structure** (schema: primitive / semantic / bridge) | — |
| The CLAUDE.md "Design-System Router" block | The rest of CLAUDE.md |

## Bootstrapping a new project

1. `gh repo create curious93/<name> --template curious93/project-template` (template ships the portable set above).
2. Run **THEME_DISCOVERY** → fill `design/tokens.json` with the project's 3 families (Default/Expressive/Minimal) × light/dark.
3. `npm run tokens` → generates `tokens.generated.css`.
4. Wire the theme engine into settings (`ThemeSheet`-style: family + light/dark/system, persisted).
5. First CI run is green (checks + a11y); seed visual baselines once (below).

## Syncing an existing project (Ritz, DDiner, …)

Pull deliberately — there is **no automatic propagation** (that was the explicit choice). Use the CHANGELOG to see what changed, then copy the portable files you want. Never copy `design/tokens.json` values or baselines.

## Visual baselines (one-time per platform)

Baselines are OS-specific (system-ui fonts differ). Committed: `*-chromium-darwin.png` (local dev). CI runs in the pinned Playwright Linux container and **seeds** `*-chromium-linux.png` via `--update-snapshots=missing`:

1. First CI run: linux baselines are created and uploaded as the `playwright-report` artifact (job stays green; a11y still gates hard).
2. Download the artifact, commit `tests/__snapshots__/**/*-linux.png`.
3. Thereafter CI compares linux baselines and **fails on visual diffs**.

This is a deliberate, logged step — not a silent gap. Until linux baselines are committed, visual regression gates locally (darwin) and a11y gates in CI.

## Promotion to the template

When the system stabilizes here, port the **portable** column into `curious93/project-template` and tag a release. Record the port in CHANGELOG. Future projects then inherit the current state on `gh repo create`.
