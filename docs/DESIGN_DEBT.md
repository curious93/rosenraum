# Design Debt

Known inconsistencies and shortcuts, tracked so they're deliberate, not forgotten. Add a row when you knowingly defer something. Severity: low / med / high.

| Issue | Location | Severity | Proposed fix | Owner / status |
|---|---|---|---|---|
| Primary-coloured text links on **untested** pages (e.g. room header, "Zur Startseite") may use `--color-primary` directly | `room/page.tsx`, `join/[code]` | low | Sweep remaining primary-as-text to `--color-primary-text`; only `/`, `/create`, `/join`, `/preview` are axe-gated today | open — extend a11y test paths when room is testable |
| Status colours (success/warning/destructive) are shared defaults, not per-theme tuned | `tokens.json` `statusDefaults` | low | Tune per preset if a theme needs it | open — fine, all status combos pass AA |
| Existing components import Lucide icons directly instead of via `src/lib/icons.ts` | `chat/*`, `invite/*`, pages | low | Migrate to the semantic `icons` map opportunistically | open — non-blocking |
| Landing page (`/`) visual regression deferred (scroll-triggered framer entrances are non-deterministic) | `app/page.tsx` | low | Gate entrance animations on a test flag, or snapshot the hero viewport only | open — a11y covers `/`; visual covers stable screens |

**Resolved (2026-06-08):** hardcoded `text-white` buttons → `text-primary-foreground`; white-on-primary AA failure → per-theme `on-primary` + AA palette tightening (0 axe violations); dark bubble/surface contrast → swept in the Phase 4 axe pass.

> Empty severity columns are a smell — if it's here, it has a severity and a proposed fix.
