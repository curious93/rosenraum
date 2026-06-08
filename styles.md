# Rosenraum — Designsystem

Verbindliche Designquelle für Rosenraums **Voice & projekt-spezifische Muster**.
Das **kanonische, projektübergreifende** Designsystem (Tokens, Komponenten-Standards, Themes, A11y) liegt in [`docs/`](docs/) — Einstieg über [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md). Farbwerte kommen aus [`design/tokens.json`](design/tokens.json) (`npm run tokens`), **nie hardcodiert**.

---

## 1. Tone of Voice

Rosenraum spricht wie ein guter Freund — warm, geduldig, nie belehrend.

| ✅ Do | ❌ Don't |
|---|---|
| "Deine Nachricht klingt bereits sehr empathisch." | "Gut gemacht! +5 Punkte" |
| "Möchtest du eine andere Formulierung erkunden?" | "Fehler: ungültige Nachricht" |
| "Warte auf deinen Gesprächspartner..." | "Noch keine Nachrichten vorhanden." |
| Kurz, direkt, menschlich | Akademisch, therapeutisch, belehrend |

---

## 2. Farbpalette

```css
:root {
  /* Primär — warmes Rosé */
  --color-primary:        #C97B84;  /* [BRIEFING] — Rosenraum-Rose */
  --color-primary-light:  #E8A8B0;
  --color-primary-dark:   #A85A63;

  /* Hintergründe */
  --color-bg-page:        #FAF8F6;  /* warmweißes Papier */
  --color-bg-surface:     #FFFFFF;
  --color-bg-elevated:    #F5F0EB;  /* leicht warmer Card-Hintergrund */

  /* Chat-Bubbles */
  --color-bubble-own:     #EDE0D4;  /* eigene Nachricht — warmes Beige */
  --color-bubble-other:   #FFFFFF;  /* fremde Nachricht — weiß */
  --color-bubble-gfk:     #D4E8D4;  /* GFK-Version — zartes Grün */

  /* Text */
  --color-text-primary:   #2D2420;  /* fast schwarz, warm */
  --color-text-secondary: #6B5E58;
  --color-text-muted:     #9E8E88;

  /* Borders */
  --color-border:         #E8DDD7;
  --color-border-subtle:  #F0E8E4;

  /* States */
  --color-dot-learning:   #C97B84;  /* Lern-Dot = Primärfarbe */
  --color-skeleton:       #EDE8E4;
}
```

---

## 3. Typografie

```css
:root {
  --font-body: 'Inter', system-ui, -apple-system, sans-serif;

  --text-hero:    clamp(2rem, 5vw, 3rem);
  --text-heading: 1.25rem;       /* 20px */
  --text-body:    1rem;          /* 16px */
  --text-small:   0.875rem;      /* 14px */
  --text-micro:   0.75rem;       /* 12px */

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   600;

  --line-height-tight:  1.25;
  --line-height-body:   1.5;
  --line-height-loose:  1.75;
}
```

**Schrift:** Inter (Google Fonts) — warm genug für Messaging, klar genug für Lesbarkeit.

---

## 4. Abstände & Layout

```css
:root {
  /* Spacing-Scale (4px base) */
  --space-1:  0.25rem;   /*  4px */
  --space-2:  0.5rem;    /*  8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-5:  1.25rem;   /* 20px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */

  /* Layout */
  --max-width-chat:   680px;   /* zentrierte Chat-Säule */
  --max-width-sheet:  480px;   /* Bottom Sheet / Modal */
  --chat-padding-h:   var(--space-4);
  --input-height:     52px;
  --bubble-radius:    18px;
  --bubble-radius-own-bottom: 4px;  /* eigene Bubble: flache Ecke unten rechts */
  --bubble-radius-other-bottom: 4px;
}
```

---

## 5. Animationsprinzipien

```css
:root {
  --ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1);   /* Bubble erscheint */
  --ease-smooth:   cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Standard */
  --ease-in-out:   cubic-bezier(0.4, 0, 0.2, 1);         /* Sheet öffnet/schließt */

  --duration-instant: 100ms;
  --duration-fast:    200ms;
  --duration-base:    300ms;
  --duration-slow:    500ms;
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

---

## 7. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Warme Neutraltöne (Beige, Rosé) | Grelle Farben, starke Sättigung |
| Runde Formen (border-radius 12–18px) | Harte Kanten, eckige Buttons |
| Viel Weißraum zwischen Elementen | Gedrängte Layouts |
| Dezente Schatten (`box-shadow: 0 2px 8px rgba(0,0,0,0.06)`) | Starke Schatten oder Elevation |
| Animationen die sich natürlich anfühlen | Ablenkende, lange Animationen |
| Grüner Ton für GFK-Version (positiv) | Rot/Orange (konnotiert Fehler/Warnung) |
| Nur Text in Fehlermeldungen | Technische Codes, Stack Traces |

---

## Status

- [x] Tone of Voice definiert
- [x] Farbpalette vollständig
- [x] Typografie definiert
- [x] Animationsprinzipien festgelegt
- [x] Komponenten-Muster dokumentiert
- [x] Do/Don't-Katalog
- [ ] CSS-Custom-Properties in `globals.css` eingefügt ← Phase 1
