# Changelog — Design System

Tracks design-system changes so other projects can pull updates deliberately (see [docs/REUSE.md](docs/REUSE.md)). Newest first.

## 2026-06-08 — Design-system infrastructure (pilot in Rosenraum)

### Added
- **Token pipeline**: `design/tokens.json` as single source of truth → `scripts/build-tokens.mjs` → `src/app/tokens.generated.css` (Tailwind v4 `@theme` + shadcn/ui bridge + `:root`/`[data-theme]`/`.dark` scopes). `npm run tokens`.
- **3-family theme standard** (Default/Expressive/Minimal, light+dark) documented in `docs/THEME_OPTIONS.md`. Rosenraum ships 6 Expressive presets, each with **dark mode**.
- **Colour mode**: light / dark / system, persisted, FOUC-guarded (`theme.ts`, `ThemeSheet.tsx`, `layout.tsx`).
- **Governance docs** (`docs/`): PRODUCT_SYSTEM, DESIGN_SYSTEM, COMPONENT_REGISTRY, COMPONENT_STANDARDS, AI_UX_RULES, ACCESSIBILITY_CHECKLIST, UI_REVIEW_CHECKLIST, THEME_OPTIONS, THEME_DISCOVERY, DESIGN_DECISIONS, DESIGN_DEBT, REUSE. CLAUDE.md router added.
- **UI primitives** (`src/components/ui/`): Button, Card, Badge, Input, Dialog, DropdownMenu, Table, Sonner (toast), state patterns (Empty/Loading/Error). Semantic icon map `src/lib/icons.ts` (Lucide).
- **Component previews**: dev-only `/preview` gallery (gated from production).
- **Enforcement**: `check:tokens`, `check:colors`, `check:token-doc`, `check:registry`. Playwright **visual regression** + **axe accessibility** specs. CI runs design gates + a11y (hard) + visual in the pinned Playwright Linux container.

### Changed
- **Palette tightened to WCAG 2.2 AA** — 0 serious/critical axe violations across 4 screens × light/dark (was 54). Darkened `text-muted`, per-theme `on-primary`, per-mode `on-status`, mode-aware `--color-primary-text`. Button text now `text-primary-foreground` (was hardcoded `text-white`).

### Notes
- Reuse model: **update `curious93/project-template` only** (no package, no live sync). Other projects pull deliberately.
- Visual baselines: darwin committed; linux seeded on first CI run (see REUSE.md).
