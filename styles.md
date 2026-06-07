# Designsystem

Verbindliche Designquelle. Vor jeder UI-Entscheidung lesen.
Kein hardcodierter Farbwert im Code — nur CSS-Custom-Properties von hier.

<!-- Dieses Template ausfüllen bevor mit UI-Arbeit begonnen wird. -->

---

## 1. Referenz-URLs

<!-- URLs der Brand/Design-Referenzseiten die analysiert wurden -->
- Primär: `https://...`

---

## 2. Tone of Voice

<!-- Wie spricht das Produkt mit dem Nutzer? Beispiele für Do/Don't. -->

---

## 3. Farbpalette

```css
:root {
  /* Primärfarben */
  --color-primary:        #000000;  /* [QUELLE oder ~APPROX] */
  --color-primary-light:  #000000;
  --color-primary-dark:   #000000;

  /* Hintergründe */
  --color-bg-page:        #FFFFFF;
  --color-bg-surface:     #F5F5F5;

  /* Text */
  --color-text-primary:   #1A1A1A;
  --color-text-secondary: #666666;
  --color-text-muted:     #999999;

  /* Borders */
  --color-border:         #E0E0E0;
}
```

**Quellen-Kennzeichnung:**
- `[BRAND]` — direkt aus Brand Guidelines
- `[~APPROX]` — visuell approximiert, verifizieren
- `[BRIEFING]` — aus Projekt-Briefing

---

## 4. Typografie

```css
:root {
  --font-display: 'Schriftname', fallback, serif;
  --font-body:    'Schriftname', system-ui, sans-serif;

  --text-hero:    clamp(2rem, 5vw, 3.5rem);
  --text-heading: clamp(1.25rem, 2.5vw, 1.75rem);
  --text-body:    1rem;
  --text-small:   0.875rem;
  --text-micro:   0.75rem;
}
```

---

## 5. Animationsprinzipien

```css
:root {
  --ease-default:  cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --duration-fast: 150ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
}
```

<!-- Beschreibe welche Animationen erlaubt/verboten sind. -->

---

## 6. Komponenten-Stile

<!-- Button, Input, Card, etc. hier definieren -->

---

## 7. Do / Don't

| ✅ Do | ❌ Don't |
|-------|---------|
| | |

---

## Status

- [ ] Referenz-URLs analysiert
- [ ] Farbpalette vollständig
- [ ] Typografie definiert
- [ ] Animationsprinzipien festgelegt
- [ ] Do/Don't-Katalog
- [ ] CSS-Custom-Properties-Snippet in `index.css` eingefügt
