# UI Review Checklist

The final gate before any UI task is "done". Run through it for every change that touches the interface.

- [ ] **Uses tokens** — no hardcoded colours, spacing, radii, font sizes or durations. Values come from `design/tokens.json` / semantic CSS vars. (`npm run check:colors` passes.)
- [ ] **Reuses registered components** — an existing component in [COMPONENT_REGISTRY.md](COMPONENT_REGISTRY.md) was reused or extended; no one-off duplicate of an existing pattern.
- [ ] **New component → registry entry** — anything genuinely new is documented in the registry (purpose, variants, props, states, a11y, anti-patterns).
- [ ] **Follows component standards** — matches [COMPONENT_STANDARDS.md](COMPONENT_STANDARDS.md) for the pattern used (modal/toast/dropdown/search/form/table/card/nav).
- [ ] **Passes accessibility** — every relevant box in [ACCESSIBILITY_CHECKLIST.md](ACCESSIBILITY_CHECKLIST.md) is ticked; axe reports no serious/critical violations.
- [ ] **AI surfaces follow AI rules** — if AI output is shown, [AI_UX_RULES.md](AI_UX_RULES.md) is honoured (marked, correctable, reversible).
- [ ] **Has loading / empty / error / success states** — all four designed, not defaulted.
- [ ] **Works responsive** — verified at mobile and desktop widths; touch targets ≥44px; safe areas respected.
- [ ] **Light and dark verified** — both modes checked visually; contrast holds in both.
- [ ] **No duplicated UI pattern** — didn't reinvent something that exists.
- [ ] **Screenshots updated** — preview pages and any docs imagery reflect the change.
- [ ] **Visual regression checked** — Playwright snapshots reviewed; intentional diffs re-baselined, unintended diffs fixed.

> If a box can't be ticked, say so explicitly in the PR — don't silently skip it.
