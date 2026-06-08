# Theme Discovery

How a project derives its visual direction *before* writing tokens. Fill this in at project start; the output is a populated `design/tokens.json`. Anchored to Material 3 colour logic and WCAG 2.2.

## Worksheet

1. **Product category** — what kind of app is this (business / consumer / creative / productivity / admin)? This suggests the starting family (see [THEME_OPTIONS.md](THEME_OPTIONS.md)).
2. **Target users** — who, in what context, on what device, in what emotional state? (Rosenraum: two people in a charged conversation, on mobile → warmth and calm.)
3. **Brand personality** — 3–5 adjectives. Translate each to a visual lever (warm→rosé neutrals; trustworthy→blue; calm→low saturation).
4. **Competitor / reference scan** — 2–4 references. Note what to echo and what to deliberately avoid.
5. **Accessibility constraints** — contrast floor (AA), reduced-motion needs, target audience vision considerations. These cap saturation and lightness choices.
6. **Colour psychology** — does the domain carry colour meaning? (Green = error in a finance app is a trap; red/orange = "mistake" — avoid for non-error UI. Rosenraum uses green for the GFK version *because* it reads positive, never red.)
7. **Light / dark needs** — is dark mode primary, equal, or secondary? Plan both regardless.
8. **Existing brand assets** — logo colours, marketing palette, fonts already in use. Map them to primary/accent before inventing.
9. **Final token mapping** — resolve the above into concrete values in `design/tokens.json`: primary trio, neutral scale, status colours, per family, per mode. Run `npm run tokens`; verify contrast in both modes.

## Output

A completed `design/tokens.json` and a short rationale entry in [DESIGN_DECISIONS.md](DESIGN_DECISIONS.md) recording *why* these colours, so the next person doesn't re-litigate them.
