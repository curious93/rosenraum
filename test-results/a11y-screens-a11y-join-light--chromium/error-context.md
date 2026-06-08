# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y/screens.spec.ts >> a11y /join (light)
- Location: tests/a11y/screens.spec.ts:15:5

# Error details

```
Error: serious/critical: color-contrast (3)

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 128

- Array []
+ Array [
+   Object {
+     "description": "Ensure the contrast between foreground and background colors meets WCAG 2 AA minimum contrast ratio thresholds",
+     "help": "Elements must meet minimum color contrast ratio thresholds",
+     "helpUrl": "https://dequeuniversity.com/rules/axe/4.11/color-contrast?application=playwright",
+     "id": "color-contrast",
+     "impact": "serious",
+     "nodes": Array [
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#fbf7f4",
+               "contrastRatio": 2.95,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#9e8e88",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.95 (foreground color: #9e8e88, background color: #fbf7f4, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<main class=\"relative flex flex-col items-center justify-center min-h-screen px-6 pt-14\" style=\"background:var(--color-bg-page)\">",
+                 "target": Array [
+                   "main",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.95 (foreground color: #9e8e88, background color: #fbf7f4, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-sm font-medium flex items-center gap-1.5\" style=\"color:var(--color-text-muted)\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".gap-1\\.5",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 3.14,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#9e8e88",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.14 (foreground color: #9e8e88, background color: #ffffff, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"w-full max-w-sm rounded-2xl p-6 space-y-6\" style=\"background:var(--color-bg-surface);box-shadow:0 2px 20px rgba(0,0,0,0.06)\">",
+                 "target": Array [
+                   ".max-w-sm",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.14 (foreground color: #9e8e88, background color: #ffffff, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<p class=\"text-sm\" style=\"color:var(--color-text-muted)\">Gib den 6-stelligen Code ein, den du erhalten hast.</p>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "p",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ffffff",
+               "contrastRatio": 3.14,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#9e8e88",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.14 (foreground color: #9e8e88, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<div class=\"w-full max-w-sm rounded-2xl p-6 space-y-6\" style=\"background:var(--color-bg-surface);box-shadow:0 2px 20px rgba(0,0,0,0.06)\">",
+                 "target": Array [
+                   ".max-w-sm",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.14 (foreground color: #9e8e88, background color: #ffffff, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"text-xs font-mono\" style=\"color:var(--color-text-muted)\">0<!-- -->/6</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".text-xs.font-mono",
+         ],
+       },
+     ],
+     "tags": Array [
+       "cat.color",
+       "wcag2aa",
+       "wcag143",
+       "TTv5",
+       "TT13.c",
+       "EN-301-549",
+       "EN-9.1.4.3",
+       "ACT",
+       "RGAAv4",
+       "RGAA-3.2.1",
+     ],
+   },
+ ]
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - main [ref=e2]:
    - generic [ref=e3]:
      - link "← Zurück" [ref=e4] [cursor=pointer]:
        - /url: /
      - generic [ref=e5]:
        - img [ref=e6]
        - text: Rosenraum
    - generic [ref=e8]:
      - generic [ref=e9]:
        - heading "Raum betreten" [level=1] [ref=e10]
        - paragraph [ref=e11]: Gib den 6-stelligen Code ein, den du erhalten hast.
      - generic [ref=e12]:
        - textbox "z.B. K3XM7R" [active] [ref=e13]
        - generic [ref=e15]: 0/6
      - button "Raum betreten" [disabled] [ref=e16]
  - alert [ref=e17]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import AxeBuilder from '@axe-core/playwright'
  3  | 
  4  | /**
  5  |  * Accessibility gate (WCAG 2.2 AA). Deterministic across platforms — hard CI
  6  |  * gate. Fails on any serious/critical violation on the tested screens, in light
  7  |  * and dark. See docs/ACCESSIBILITY_CHECKLIST.md.
  8  |  */
  9  | const PATHS = ['/', '/create', '/join', '/preview']
  10 | const MODES = ['light', 'dark'] as const
  11 | const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
  12 | 
  13 | for (const mode of MODES) {
  14 |   for (const path of PATHS) {
  15 |     test(`a11y ${path} (${mode})`, async ({ page }) => {
  16 |       await page.addInitScript((m) => {
  17 |         localStorage.setItem('rosenraum_mode', m)
  18 |         localStorage.removeItem('rosenraum_theme')
  19 |       }, mode)
  20 |       await page.goto(path)
  21 |       await page.waitForLoadState('networkidle')
  22 |       // Let scroll-triggered entrance animations settle before scanning contrast.
  23 |       await page.waitForTimeout(1200)
  24 | 
  25 |       const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
  26 |       const blocking = violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
  27 |       const summary = blocking.map(v => `${v.id} (${v.nodes.length})`).join(', ')
> 28 |       expect(blocking, `serious/critical: ${summary}`).toEqual([])
     |                                                        ^ Error: serious/critical: color-contrast (3)
  29 |     })
  30 |   }
  31 | }
  32 | 
```