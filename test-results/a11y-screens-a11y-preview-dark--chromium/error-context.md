# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: a11y/screens.spec.ts >> a11y /preview (dark)
- Location: tests/a11y/screens.spec.ts:15:5

# Error details

```
Error: serious/critical: color-contrast (13)

expect(received).toEqual(expected) // deep equality

- Expected  -   1
+ Received  + 478

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
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"inline-flex items-ce...\">",
+                 "target": Array [
+                   ".flex-wrap.flex.gap-2 > .hover\\:bg-primary\\/90.bg-primary.text-primary-foreground:nth-child(3)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"inline-flex items-ce...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".flex-wrap.flex.gap-2 > .hover\\:bg-primary\\/90.bg-primary.text-primary-foreground:nth-child(3)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#d0747f",
+               "contrastRatio": 3.23,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"inline-flex items-ce...\">",
+                 "target": Array [
+                   ".hover\\:bg-primary\\/90.bg-primary.text-primary-foreground:nth-child(5)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"inline-flex items-ce...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:bg-primary\\/90.bg-primary.text-primary-foreground:nth-child(5)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#d0747f",
+               "contrastRatio": 3.23,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"inline-flex items-ce...\">",
+                 "target": Array [
+                   ".items-start.flex-wrap.bg-card > .hover\\:bg-primary\\/90.bg-primary.text-primary-foreground:nth-child(1)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"inline-flex items-ce...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".items-start.flex-wrap.bg-card > .hover\\:bg-primary\\/90.bg-primary.text-primary-foreground:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#fc8181",
+               "contrastRatio": 2.44,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.44 (foreground color: #ffffff, background color: #fc8181, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"inline-flex items-ce...\">",
+                 "target": Array [
+                   ".hover\\:bg-destructive\\/90",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.44 (foreground color: #ffffff, background color: #fc8181, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"inline-flex items-ce...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:bg-destructive\\/90",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#d0747f",
+               "contrastRatio": 3.23,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"inline-flex items-ce...\">",
+                 "target": Array [
+                   ".hover\\:bg-primary\\/90.bg-primary.text-primary-foreground:nth-child(7)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"inline-flex items-ce...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".hover\\:bg-primary\\/90.bg-primary.text-primary-foreground:nth-child(7)",
+         ],
+       },
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
+                 "html": "<button class=\"inline-flex items-ce...\">",
+                 "target": Array [
+                   ".h-12",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 12.0pt (16px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"inline-flex items-ce...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".h-12",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#d0747f",
+               "contrastRatio": 3.23,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&amp;_svg]:size-3 bg-primary text-primary-foreground\">Standard</span>",
+                 "target": Array [
+                   ".items-start.flex-wrap.bg-card > .gap-1.rounded-full.px-2\\.5:nth-child(1)",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&amp;_svg]:size-3 bg-primary text-primary-foreground\">Standard</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".items-start.flex-wrap.bg-card > .gap-1.rounded-full.px-2\\.5:nth-child(1)",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#68d391",
+               "contrastRatio": 1.85,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 1.85 (foreground color: #ffffff, background color: #68d391, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3 bg-[var(--color-success)] text-[var(--color-on-primary)]\">",
+                 "target": Array [
+                   ".items-start.flex-wrap.bg-card > .bg-\\[var\\(--color-success\\)\\].text-\\[var\\(--color-on-primary\\)\\].gap-1",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 1.85 (foreground color: #ffffff, background color: #68d391, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3 bg-[var(--color-success)] text-[var(--color-on-primary)]\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".items-start.flex-wrap.bg-card > .bg-\\[var\\(--color-success\\)\\].text-\\[var\\(--color-on-primary\\)\\].gap-1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#ecc94b",
+               "contrastRatio": 1.61,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 1.61 (foreground color: #ffffff, background color: #ecc94b, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3 bg-[var(--color-warning)] text-[var(--color-on-primary)]\">",
+                 "target": Array [
+                   ".bg-\\[var\\(--color-warning\\)\\]",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 1.61 (foreground color: #ffffff, background color: #ecc94b, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3 bg-[var(--color-warning)] text-[var(--color-on-primary)]\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-\\[var\\(--color-warning\\)\\]",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#fc8181",
+               "contrastRatio": 2.44,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 2.44 (foreground color: #ffffff, background color: #fc8181, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3 bg-destructive text-destructive-foreground\">",
+                 "target": Array [
+                   ".bg-destructive.text-destructive-foreground.gap-1",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 2.44 (foreground color: #ffffff, background color: #fc8181, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3 bg-destructive text-destructive-foreground\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".bg-destructive.text-destructive-foreground.gap-1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#d0747f",
+               "contrastRatio": 3.23,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"inline-flex items-ce...\">",
+                 "target": Array [
+                   ".pt-0.p-5.flex > .hover\\:bg-primary\\/90.bg-primary.text-primary-foreground",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"inline-flex items-ce...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".pt-0.p-5.flex > .hover\\:bg-primary\\/90.bg-primary.text-primary-foreground",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#68d391",
+               "contrastRatio": 1.85,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "9.0pt (12px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 1.85 (foreground color: #ffffff, background color: #68d391, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&amp;_svg]:size-3 bg-[var(--color-success)] text-[var(--color-on-primary)]\">aktiv</span>",
+                 "target": Array [
+                   "td:nth-child(2) > .bg-\\[var\\(--color-success\\)\\].text-\\[var\\(--color-on-primary\\)\\].gap-1",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 1.85 (foreground color: #ffffff, background color: #68d391, font size: 9.0pt (12px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<span class=\"inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&amp;_svg]:size-3 bg-[var(--color-success)] text-[var(--color-on-primary)]\">aktiv</span>",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           "td:nth-child(2) > .bg-\\[var\\(--color-success\\)\\].text-\\[var\\(--color-on-primary\\)\\].gap-1",
+         ],
+       },
+       Object {
+         "all": Array [],
+         "any": Array [
+           Object {
+             "data": Object {
+               "bgColor": "#d0747f",
+               "contrastRatio": 3.23,
+               "expectedContrastRatio": "4.5:1",
+               "fgColor": "#ffffff",
+               "fontSize": "10.5pt (14px)",
+               "fontWeight": "normal",
+               "messageKey": null,
+             },
+             "id": "color-contrast",
+             "impact": "serious",
+             "message": "Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+             "relatedNodes": Array [
+               Object {
+                 "html": "<button class=\"inline-flex items-ce...\">",
+                 "target": Array [
+                   ".py-12.text-center.px-6 > .hover\\:bg-primary\\/90.bg-primary.text-primary-foreground",
+                 ],
+               },
+             ],
+           },
+         ],
+         "failureSummary": "Fix any of the following:
+   Element has insufficient color contrast of 3.23 (foreground color: #ffffff, background color: #d0747f, font size: 10.5pt (14px), font weight: normal). Expected contrast ratio of 4.5:1",
+         "html": "<button class=\"inline-flex items-ce...\">",
+         "impact": "serious",
+         "none": Array [],
+         "target": Array [
+           ".py-12.text-center.px-6 > .hover\\:bg-primary\\/90.bg-primary.text-primary-foreground",
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
  - main [ref=e2]:
    - region "Notifications alt+T"
    - generic [ref=e3]:
      - generic [ref=e4]:
        - heading "Component Preview" [level=1] [ref=e5]
        - generic [ref=e6]:
          - button "light" [ref=e7]
          - button "dark" [ref=e8]
          - button "system" [ref=e9]
          - button "Rose" [ref=e11]
          - button "Forst" [ref=e12]
          - button "Lila" [ref=e13]
          - button "Ozean" [ref=e14]
          - button "Koralle" [ref=e15]
          - button "Meer" [ref=e16]
      - generic [ref=e17]:
        - heading "Buttons" [level=2] [ref=e18]
        - generic [ref=e19]:
          - button "Primär" [ref=e20]
          - button "Sekundär" [ref=e21]
          - button "Outline" [ref=e22]
          - button "Ghost" [ref=e23]
          - button "Löschen" [ref=e24]
          - button "Link" [ref=e25]
          - button "Klein" [ref=e26]
          - button "Groß" [ref=e27]
          - button "Einstellungen" [ref=e28]:
            - img [ref=e29]
          - button "Deaktiviert" [disabled]
      - generic [ref=e32]:
        - heading "Badges" [level=2] [ref=e33]
        - generic [ref=e34]:
          - generic [ref=e35]: Standard
          - generic [ref=e36]: Sekundär
          - generic [ref=e37]: Outline
          - generic [ref=e38]:
            - img [ref=e39]
            - text: Erfolg
          - generic [ref=e42]:
            - img [ref=e43]
            - text: Warnung
          - generic [ref=e45]:
            - img [ref=e46]
            - text: Fehler
      - generic [ref=e48]:
        - heading "Card" [level=2] [ref=e49]
        - generic [ref=e51]:
          - generic [ref=e52]:
            - generic [ref=e53]: Kartentitel
            - generic [ref=e54]: Eine kurze, ruhige Beschreibung.
          - paragraph [ref=e56]: Inhalt der Karte.
          - generic [ref=e57]:
            - button "Aktion" [ref=e58]
            - button "Abbrechen" [ref=e59]
      - generic [ref=e60]:
        - heading "Form field" [level=2] [ref=e61]
        - generic [ref=e63]:
          - text: Dein Name
          - textbox "Dein Name" [ref=e64]:
            - /placeholder: z.B. Lena
          - paragraph [ref=e65]: Optional — du kannst anonym bleiben.
      - generic [ref=e66]:
        - heading "Search field" [level=2] [ref=e67]
        - generic [ref=e69]:
          - img
          - textbox "Suche" [ref=e70]:
            - /placeholder: Suchen…
      - generic [ref=e71]:
        - heading "Dialog" [level=2] [ref=e72]
        - button "Dialog öffnen" [ref=e74]
      - generic [ref=e75]:
        - heading "Dropdown menu" [level=2] [ref=e76]
        - button "Menü" [ref=e78]
      - generic [ref=e79]:
        - heading "Toast / Notification" [level=2] [ref=e80]
        - generic [ref=e81]:
          - button "Info-Toast" [ref=e82]
          - button "Erfolg" [ref=e83]
          - button "Fehler" [ref=e84]
      - generic [ref=e85]:
        - heading "Table" [level=2] [ref=e86]
        - table [ref=e89]:
          - rowgroup [ref=e90]:
            - row "Name Status Beigetreten" [ref=e91]:
              - columnheader "Name" [ref=e92]
              - columnheader "Status" [ref=e93]
              - columnheader "Beigetreten" [ref=e94]
          - rowgroup [ref=e95]:
            - row "Lena aktiv heute" [ref=e96]:
              - cell "Lena" [ref=e97]
              - cell "aktiv" [ref=e98]:
                - generic [ref=e99]: aktiv
              - cell "heute" [ref=e100]
            - row "Max eingeladen —" [ref=e101]:
              - cell "Max" [ref=e102]
              - cell "eingeladen" [ref=e103]:
                - generic [ref=e104]: eingeladen
              - cell "—" [ref=e105]
      - generic [ref=e106]:
        - heading "Empty state" [level=2] [ref=e107]
        - generic [ref=e109]:
          - img [ref=e110]
          - generic [ref=e112]:
            - paragraph [ref=e113]: Noch keine Nachrichten
            - paragraph [ref=e114]: Warte auf deinen Gesprächspartner…
          - button "Einladen" [ref=e115]
      - generic [ref=e116]:
        - heading "Loading state" [level=2] [ref=e117]
        - status "Wird geladen" [ref=e119]
      - generic [ref=e126]:
        - heading "Error state" [level=2] [ref=e127]
        - alert [ref=e129]:
          - img [ref=e130]
          - generic [ref=e132]:
            - paragraph [ref=e133]: Verbindung verloren
            - paragraph [ref=e134]: Wir konnten den Raum nicht laden.
          - button "Erneut versuchen" [ref=e135]
  - generic [ref=e141] [cursor=pointer]:
    - button "Open issues overlay" [ref=e142]:
      - img [ref=e144]
      - generic [ref=e146]:
        - generic [ref=e147]: "0"
        - generic [ref=e148]: "1"
      - generic [ref=e149]: Issue
    - button "Collapse issues badge" [ref=e150]:
      - img [ref=e151]
  - alert [ref=e153]
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
     |                                                        ^ Error: serious/critical: color-contrast (13)
  29 |     })
  30 |   }
  31 | }
  32 | 
```