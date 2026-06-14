/**
 * Baut die Einladungsnachricht, die der Sender über WhatsApp, Mail, Signal etc.
 * verschickt. Warm und ohne Fachbegriffe — die Lernfunktionen bleiben für den
 * Empfänger unsichtbar, die Nachricht klingt wie von einem guten Freund.
 *
 * @param inviteUrl - Vollständige Beitritts-URL (z. B. https://…/join/ABC123)
 * @param inviteCode - 6-stelliger Einladungscode
 * @returns Mehrzeilige Nachricht mit eingebettetem Link
 * @example
 * buildInviteMessage('https://rosenraum.app/join/ABC123', 'ABC123')
 */
export function buildInviteMessage(inviteUrl: string, inviteCode: string): string {
  return [
    `Hey 🤍`,
    ``,
    `Ich würde gern mit dir etwas in Ruhe besprechen. Ganz privat, nur wir zwei, in Rosenraum.`,
    ``,
    `Komm einfach dazu:`,
    inviteUrl,
    ``,
    `Falls du gefragt wirst: der Code ist ${inviteCode}.`,
    ``,
    `Kein Account, keine App nötig. Link öffnen und los.`,
  ].join('\n')
}

/** Ergebnis eines Teilen-Versuchs. */
export type ShareResult = 'shared' | 'copied' | 'dismissed'

/**
 * Öffnet den nativen Teilen-Dialog (Web Share API) mit der Einladungsnachricht —
 * auf Mobilgeräten erscheinen WhatsApp, Signal, Mail usw. direkt. Fällt auf das
 * Kopieren der vollständigen Nachricht in die Zwischenablage zurück, wenn die API
 * fehlt (z. B. Firefox Desktop). Funktioniert so auf allen Geräten und Betriebssystemen.
 *
 * @param inviteUrl - Vollständige Beitritts-URL
 * @param inviteCode - 6-stelliger Einladungscode
 * @returns 'shared' bei nativem Teilen, 'copied' beim Zwischenablage-Fallback,
 *          'dismissed' wenn der Nutzer den nativen Dialog abbricht
 * @example
 * const result = await shareInvite(inviteUrl, inviteCode)
 * if (result === 'copied') showToast('Nachricht kopiert')
 */
export async function shareInvite(inviteUrl: string, inviteCode: string): Promise<ShareResult> {
  const text = buildInviteMessage(inviteUrl, inviteCode)

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title: 'Einladung zu Rosenraum', text })
      return 'shared'
    } catch (err) {
      // AbortError = Nutzer hat den Dialog bewusst geschlossen → kein Fehler, kein Fallback
      if (err instanceof DOMException && err.name === 'AbortError') return 'dismissed'
      // Jeder andere Fehler (z. B. fehlende Geste, Permission) → Zwischenablage-Fallback
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    await navigator.clipboard.writeText(text)
  }
  return 'copied'
}
