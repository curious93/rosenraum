# Rosenraum — Designsystem

Verbindliche Designquelle für Rosenraums **Voice & projekt-spezifische Muster**.
Das **kanonische, projektübergreifende** Designsystem (Tokens, Komponenten-Standards, Themes, A11y) liegt in [`docs/`](docs/) — Einstieg über [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md). Farbwerte kommen aus [`design/tokens.json`](design/tokens.json) (`npm run tokens`), **nie hardcodiert**.

---

## 1. Tone of Voice

Rosenraum spricht wie ein guter Freund — warm, geduldig, nie belehrend.

| ✅ Do                                             | ❌ Don't                             |
| ------------------------------------------------- | ------------------------------------ |
| "Deine Nachricht klingt bereits sehr empathisch." | "Gut gemacht! +5 Punkte"             |
| "Möchtest du eine andere Formulierung erkunden?"  | "Fehler: ungültige Nachricht"        |
| "Warte auf deinen Gesprächspartner..."            | "Noch keine Nachrichten vorhanden."  |
| Kurz, direkt, menschlich                          | Akademisch, therapeutisch, belehrend |

---

## 2. Farbpalette

```css
:root {
  /* Primär — warmes Rosé */
  --color-primary: #c97b84; /* [BRIEFING] — Rosenraum-Rose */
  --color-primary-light: #e8a8b0;
  --color-primary-dark: #a85a63;

  /* Hintergründe */
  --color-bg-page: #faf8f6; /* warmweißes Papier */
  --color-bg-surface: #ffffff;
  --color-bg-elevated: #f5f0eb; /* leicht warmer Card-Hintergrund */

  /* Chat-Bubbles */
  --color-bubble-own: #ede0d4; /* eigene Nachricht — warmes Beige */
  --color-bubble-other: #ffffff; /* fremde Nachricht — weiß */
  --color-bubble-gfk: #d4e8d4; /* GFK-Version — zartes Grün */

  /* Text */
  --color-text-primary: #2d2420; /* fast schwarz, warm */
  --color-text-secondary: #6b5e58;
  --color-text-muted: #9e8e88;

  /* Borders */
  --color-border: #e8ddd7;
  --color-border-subtle: #f0e8e4;

  /* States */
  --color-dot-learning: #c97b84; /* Lern-Dot = Primärfarbe */
  --color-skeleton: #ede8e4;
}
```

---

## 3. Typografie

```css
:root {
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;

  --text-hero: clamp(2rem, 5vw, 3rem);
  --text-heading: 1.25rem; /* 20px */
  --text-body: 1rem; /* 16px */
  --text-small: 0.875rem; /* 14px */
  --text-micro: 0.75rem; /* 12px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 600;

  --line-height-tight: 1.25;
  --line-height-body: 1.5;
  --line-height-loose: 1.75;
}
```

**Schrift:** Inter (Google Fonts) — warm genug für Messaging, klar genug für Lesbarkeit.

**Typo-Rollen (app-weit verbindlich, Kontrast mind. AA):**

```
Sektions-/Modal-Header: text-sm · font-semibold · --color-text-primary  (Header NIE muted/secondary)
Fließtext:              text-sm · --color-text-secondary · leading-relaxed
Micro-Labels:           text-xs · font-medium · --color-text-secondary  (muted nur rein dekorativ)
Farb-Akzente sparsam (Boxen/Balken/Marks) — nie farbige Header-Schrift, keine Deko-Punkte an Headern
```

---

## 4. Abstände & Layout

```css
:root {
  /* Spacing-Scale (4px base) */
  --space-1: 0.25rem; /*  4px */
  --space-2: 0.5rem; /*  8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */

  /* Layout */
  --max-width-chat: 680px; /* zentrierte Chat-Säule */
  --max-width-sheet: 480px; /* Bottom Sheet / Modal */
  --chat-padding-h: var(--space-4);
  --input-height: 52px;
  --bubble-radius: 18px;
  --bubble-radius-own-bottom: 4px; /* eigene Bubble: flache Ecke unten rechts */
  --bubble-radius-other-bottom: 4px;
}
```

---

## 5. Animationsprinzipien

```css
:root {
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1); /* Bubble erscheint */
  --ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Standard */
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1); /* Sheet öffnet/schließt */

  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
}
```

**Animationsregeln:**

- Chat-Bubble erscheint: `scale(0.8) → scale(1)` mit `--ease-spring`, 200ms
- Bottom Sheet: slide-up 300ms `--ease-in-out`
- Bubble-Toggle (Original ↔ GFK): cross-fade + slight scale, 250ms
- Lern-Dot: fade-in 500ms nach Senden, dann subtle pulse 1x
- Kein paralleles Flackern mehrerer Animationen

---

## 6. Komponenten-Muster

### Chat-Bubble

```
Eigene Bubble: rechts, --color-bubble-own, radius 18px außer unten-rechts (4px)
Fremde Bubble: links, --color-bubble-other, radius 18px außer unten-links (4px)
GFK-Version (beim Sender): --color-bubble-gfk, dezenter Rosé-Border
Max-Breite: 75% des Chat-Containers
```

### Lern-Dot

```
8px × 8px Kreis, --color-dot-learning
Position: unten-rechts außerhalb der Bubble
Erscheint: 500ms nach Senden, fade-in
```

### Bottom Sheet / Modal

```
Mobile: slide-up aus Unterkante, Drag-Handle oben, schließbar via Swipe
Desktop (≥1024px): zentriertes Modal mit Overlay, max-width --max-width-sheet
```

### Input-Area

```
Höhe: --input-height (52px)
Hintergrund: --color-bg-surface
Border-top: 1px --color-border
Safe-area-bottom beachten (iOS)
```

### GFK-Lernfeedback-Panel (SendBottomSheet) — VERBINDLICHER STANDARD

Jede Änderung an Typo/Farbe/Abständen hier zuerst nachziehen, sonst gilt sie als ungewollt.

```
Dimensionsname:   text-xs · fontWeight 600 · Dimensionsfarbe (--color-gfk-*) · Spalte 6rem · Info-Icon 13px muted dahinter
Balken:           h-2 · fester Verlauf rot→amber→grün (--color-gfk-band-*) · Füllung via clipPath · 2px-Marker bei 50%/70% (bg-elevated)
Score rechts:     text-xs · „N · band" — Zahl semibold in Dimensionsfarbe, Band-Wort muted · Spalte 5.5rem · Delta schwebt absolut links davon (keine eigene Spalte)
Chevron:          16px-Slot · ChevronRight 14px muted · rotiert 90° wenn ausgeklappt
Kurzdiagnose:     text-sm muted · unter dem Namen (pl 1.625rem) · nur bei score ≤ 7
Nicht enthalten:  Ring 18px in --color-border · Name farbig · „nicht enthalten" italic muted · „· + ergänzen?" Dimensionsfarbe 75%
Details-Karte:    1) Zitat als mark: Tint 18% + inset-Unterstrich 2px Dimensionsfarbe, text-sm, text-primary
                  2) „Diagnose — Erklärung" in EINER Zeile, text-sm, text-secondary
                  3) Besser-Box: bg-surface · borderLeft 3px Dimensionsfarbe · text-sm text-primary · Label „Besser:" secondary/medium
                  mainProblem wird NICHT angezeigt (redundant zu 2).
Rund-Banner:      text-sm medium · --color-gfk-beduerfnis · über den Balken, Balken bleiben sichtbar
Lade-Dots:        4 × 8px in den 4 Dimensionsfarben · Stagger 0.2s · „Analysiere…" muted
Info-Modal:       zentriert · max-width --max-width-sheet · z-60 · Sektionen durch border-subtle getrennt ·
                  Header: text-sm semibold text-primary, OHNE Farbpunkt (Typo-Rollen §3) · Body text-sm secondary ·
                  Beispiel: Micro-Labels „Vorher"/„Besser" (secondary), vorher line-through, nachher Besser-Box ·
                  Button „Alles klar" ohne Emoji · Panel-Titel: „Dein Lernfeedback" (Begriff „GFK" nicht im UI)
Interaktion:      Zeilen-Button ohne Focus-Ring (outline-none) · KEIN Aktiv-Hintergrund-Tint
```

---

## 7. Do / Don't

| ✅ Do                                                       | ❌ Don't                               |
| ----------------------------------------------------------- | -------------------------------------- |
| Warme Neutraltöne (Beige, Rosé)                             | Grelle Farben, starke Sättigung        |
| Runde Formen (border-radius 12–18px)                        | Harte Kanten, eckige Buttons           |
| Viel Weißraum zwischen Elementen                            | Gedrängte Layouts                      |
| Dezente Schatten (`box-shadow: 0 2px 8px rgba(0,0,0,0.06)`) | Starke Schatten oder Elevation         |
| Animationen die sich natürlich anfühlen                     | Ablenkende, lange Animationen          |
| Grüner Ton für GFK-Version (positiv)                        | Rot/Orange (konnotiert Fehler/Warnung) |
| Nur Text in Fehlermeldungen                                 | Technische Codes, Stack Traces         |

---

## Status

- [x] Tone of Voice definiert
- [x] Farbpalette vollständig
- [x] Typografie definiert
- [x] Animationsprinzipien festgelegt
- [x] Komponenten-Muster dokumentiert
- [x] Do/Don't-Katalog
- [ ] CSS-Custom-Properties in `globals.css` eingefügt ← Phase 1
