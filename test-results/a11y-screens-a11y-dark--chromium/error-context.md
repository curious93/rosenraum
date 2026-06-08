# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y/screens.spec.ts >> a11y / (dark)
- Location: tests/a11y/screens.spec.ts:15:5

# Error details

```
Error: serious/critical: color-contrast (1)

expect(received).toEqual(expected) // deep equality

- Expected  -  1
+ Received  + 58

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
+               "bgColor": "#d0747f",
+               "contrastRatio": 3.23,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "12.0pt (16px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"block w-full py-3.5 px-6 rounded-2xl text-white font-medium text-base transition-opacity hover:opacity-90 active:opacity-80\" style=\"background:var(--color-primary)\">Raum erstellen</button>",
+                 "target": Array [
+                   ".hover\\:opacity-90",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"block w-full py-3.5 px-6 rounded-2xl text-white font-medium text-base transition-opacity hover:opacity-90 active:opacity-80\" style=\"background:var(--color-primary)\">Raum erstellen</button>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:opacity-90",
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
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - img [ref=e6]
          - heading "Rosenraum" [level=1] [ref=e8]
          - paragraph [ref=e9]:
            - text: Für Gespräche, bei denen
            - text: es wirklich zählt.
          - paragraph [ref=e10]: Ein privater Raum für zwei — mit sanfter KI-Unterstützung, wenn Worte schwer fallen.
        - generic [ref=e11]:
          - button "Raum erstellen" [ref=e12]
          - button "Ich habe einen Code" [ref=e13]
      - img [ref=e15]
    - generic [ref=e19]:
      - generic [ref=e20]:
        - heading "Wir reden den ganzen Tag. Aber manchmal kommen unsere Worte gar nicht an." [level=2] [ref=e21]
        - paragraph [ref=e22]: Nicht weil wir keine Empathie hätten. Sondern weil unsere Sprache voller alter Muster steckt — Muster, die wir nie bewusst gewählt haben.
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]:
            - img [ref=e26]
            - generic [ref=e28]: Das unbeabsichtigte Vorwurf
          - paragraph [ref=e29]: "\"Du hörst mir nie zu.\""
          - paragraph [ref=e30]: "Gemeint war: Ich vermisse das Gefühl, dass dir wichtig ist, was ich fühle. Die Sprache der Bewertung löst Verteidigung aus — nicht Verbindung."
        - generic [ref=e31]:
          - generic [ref=e32]:
            - img [ref=e33]
            - generic [ref=e35]: Das Schweigen
          - paragraph [ref=e36]: Wenn Worte fehlen, schweigen wir. Oder wir sagen das Falsche. Nicht weil wir nichts fühlen — sondern weil uns niemand beigebracht hat, Gefühle in Worte zu fassen.
        - generic [ref=e37]:
          - generic [ref=e38]:
            - img [ref=e39]
            - generic [ref=e41]: Das Wissen hilft nicht allein
          - paragraph [ref=e42]: Gewaltfreie Kommunikation klingt in der Theorie einfach. Aber in echten Gesprächen, wenn Emotionen hochkommen, fallen wir in alte Muster zurück. GFK lernt man nicht durch Lesen. Man lernt es durch Üben — in echten Gesprächen.
    - generic [ref=e45]:
      - generic [ref=e46]:
        - heading "Was ist Gewaltfreie Kommunikation?" [level=2] [ref=e47]
        - paragraph [ref=e48]: "Marshall Rosenberg entwickelte die GFK in den 1960er Jahren. Die Kernidee: Hinter jedem Konflikt stecken unerfüllte Bedürfnisse — keine bösen Absichten. GFK gibt uns eine Sprache, die verbindet statt zu trennen."
      - generic [ref=e49]:
        - generic [ref=e50]:
          - img [ref=e52]
          - generic [ref=e55]:
            - generic [ref=e56]:
              - generic [ref=e57]: ①
              - generic [ref=e58]: Beobachtung
            - paragraph [ref=e59]: Was passiert konkret — ohne Bewertung, ohne Interpretation?
            - paragraph [ref=e60]: "\"Du bist dreimal zu spät gekommen\" statt \"Du bist immer unzuverlässig.\""
        - generic [ref=e61]:
          - img [ref=e63]
          - generic [ref=e65]:
            - generic [ref=e66]:
              - generic [ref=e67]: ②
              - generic [ref=e68]: Gefühl
            - paragraph [ref=e69]: Wie fühle ich mich dabei?
            - paragraph [ref=e70]: "\"Ich bin besorgt\" statt \"Du machst mich wahnsinnig.\""
        - generic [ref=e71]:
          - img [ref=e73]
          - generic [ref=e76]:
            - generic [ref=e77]:
              - generic [ref=e78]: ③
              - generic [ref=e79]: Bedürfnis
            - paragraph [ref=e80]: Welches Bedürfnis steckt dahinter?
            - paragraph [ref=e81]: "\"Mir ist Verlässlichkeit wichtig\" — ein Bedürfnis, das jeder Mensch kennt."
        - generic [ref=e82]:
          - img [ref=e84]
          - generic [ref=e86]:
            - generic [ref=e87]:
              - generic [ref=e88]: ④
              - generic [ref=e89]: Bitte
            - paragraph [ref=e90]: Was wünsche ich mir konkret?
            - paragraph [ref=e91]: "\"Kannst du mir Bescheid geben, wenn du später kommst?\""
    - generic [ref=e94]:
      - heading "In drei Schritten zu echten Gesprächen." [level=2] [ref=e95]
      - generic [ref=e96]:
        - generic [ref=e97]:
          - generic [ref=e98]: "1"
          - generic [ref=e99]:
            - generic [ref=e100]: Raum erstellen & teilen
            - paragraph [ref=e101]: Erstelle in Sekunden einen privaten Raum. Teile den Link per QR-Code oder kopiere ihn direkt. Kein Account, kein Passwort.
        - generic [ref=e102]:
          - generic [ref=e103]: "2"
          - generic [ref=e104]:
            - generic [ref=e105]: Schreib deine Nachricht
            - paragraph [ref=e106]: Schreib wie immer. Wenn du möchtest, zeigt dir Claude eine Formulierung im Geiste der GFK — weniger Vorwurf, mehr Verbindung.
        - generic [ref=e107]:
          - generic [ref=e108]: "3"
          - generic [ref=e109]:
            - generic [ref=e110]: Du entscheidest
            - paragraph [ref=e111]: Sende deine Version oder die KI-Version — du hast immer die Wahl. Kein Druck, kein Urteil. Und mit jeder Nachricht lernst du ein bisschen mehr.
    - generic [ref=e113]:
      - generic [ref=e114]: “
      - blockquote [ref=e115]: Hinter jeder Handlung — wie ineffektiv, tragisch oder gewaltsam sie uns auch erscheinen mag — steckt der Versuch, ein Bedürfnis zu erfüllen.
      - paragraph [ref=e116]: — Marshall Rosenberg, Begründer der Gewaltfreien Kommunikation
    - generic [ref=e119]:
      - generic [ref=e120]:
        - heading "Starte jetzt." [level=2] [ref=e121]
        - paragraph [ref=e122]: Erstelle deinen Raum in einer Sekunde — kein Account nötig.
      - generic [ref=e123]:
        - textbox "Dein Name (optional)" [ref=e124]
        - button "Raum erstellen →" [ref=e125]
    - contentinfo [ref=e126]:
      - paragraph [ref=e127]:
        - img [ref=e128]
        - text: Rosenraum — Ein Raum für echte Gespräche.
      - paragraph [ref=e130]: Kein Tracking. Kein Account. Keine Daten.
      - button "Stil ändern" [ref=e131]:
        - img [ref=e132]
        - text: Stil ändern
  - alert [ref=e138]
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
     |                                                        ^ Error: serious/critical: color-contrast (1)
  29 |     })
  30 |   }
  31 | }
  32 | 
```