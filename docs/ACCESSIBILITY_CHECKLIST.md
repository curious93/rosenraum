# Accessibility Checklist

Mandatory. WCAG 2.2 AA is the floor. Every UI change ticks every relevant box before it ships. Automated coverage runs in CI via `@axe-core/playwright`; the rest is manual.

## Checklist

- [ ] **Keyboard navigation** — every interactive element is reachable and operable by keyboard alone, in a logical order. No keyboard traps.
- [ ] **Visible focus** — a clear focus indicator on every focusable element (`--ring`); never `outline: none` without a replacement.
- [ ] **Semantic HTML** — real `<button>`, `<a>`, `<nav>`, `<label>`, headings in order. ARIA only to fill genuine gaps, never to paper over a `<div>`.
- [ ] **Labels** — every control has an accessible name. Icon-only buttons have `aria-label`. Inputs have associated `<label>`s.
- [ ] **Contrast** — text ≥ 4.5:1 (≥ 3:1 for large/bold ≥18.66px); UI components and focus indicators ≥ 3:1. Verified in **light and dark**.
- [ ] **Target size** — interactive targets ≥ 44×44px (WCAG 2.2 §2.5.8: 24×24 min, 44 preferred).
- [ ] **Screen reader** — content and state changes are perceivable: meaningful alt text, `aria-current`, `aria-expanded`, `aria-selected` where applicable.
- [ ] **Dialog focus** — modals trap focus, set initial focus sensibly, and restore focus to the trigger on close. `role="dialog"` `aria-modal`.
- [ ] **Error announcements** — validation errors are programmatically associated with their field (`aria-describedby`) and announced (`role="alert"`).
- [ ] **Reduced motion** — `@media (prefers-reduced-motion: reduce)` disables non-essential animation; nothing essential depends on motion.
- [ ] **Colour is not the only cue** — status/selection also uses icon, text or shape.

## Notes

- Don't ship `outline: none` on the message-area scrollbar trick or anywhere else without a visible alternative.
- framer-motion: gate entrance/looping animations on `useReducedMotion()`.
- Bottom sheets are dialogs — they get focus trap + `Esc` + restore, same as modals.
- Test the real keyboard path, not just the DOM. See the UI-testing rule in [../CLAUDE.md](../CLAUDE.md).
