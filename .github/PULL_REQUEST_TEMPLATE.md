## Was ändert sich?

<!-- Eine Zeile: Was wurde gebaut / geändert / gefixt? Referenz: closes #N -->

## Checkliste

### Code-Qualität
- [ ] `npm run lint` schlägt nicht fehl (CI muss grün sein)
- [ ] Alle **neuen** exportierten Funktionen haben JSDoc (`@param`, `@returns`, `@example`)
- [ ] Alle **neuen** TypeScript-Typen/Interfaces haben JSDoc
- [ ] Nicht-offensichtliche Logik hat einen Why-Kommentar

### Design (bei UI-Änderungen)
- [ ] `styles.md` wurde vor UI-Entscheidungen konsultiert
- [ ] Keine hardcodierten Farbwerte — nur CSS-Custom-Properties
- [ ] Animationen folgen den Prinzipien aus `styles.md`
- [ ] Responsiv getestet: 375px (Mobile) + 1280px (Desktop)

### Ticket
- [ ] GitHub Issue referenziert (`closes #N`)
- [ ] Issue wird nach Merge geschlossen
