/**
 * System-Prompt und Typen für die GFK-Reformulierung via Claude.
 */

/** Antwort von /api/analyze */
export interface AnalyzeResponse {
  rosenbergText: string
}

/** Fehlerantwort von /api/analyze */
export interface AnalyzeError {
  error: string
}

/**
 * System-Prompt für Claude — reformuliert eine Nachricht im Geiste der GFK.
 * Kernprinzipien: Beobachtung ohne Bewertung, Gefühl, Bedürfnis, Bitte.
 * Die Ausgabe soll natürlich klingen — nicht therapeutisch oder steif.
 *
 * Sonderfälle:
 * - Bei offensiven, aggressiven oder beleidigenden Nachrichten ist die Reformulierung
 *   BESONDERS wichtig — niemals abbrechen oder verweigern.
 * - Nur wenn die Nachricht bereits vollständig offen, wertschätzend und GFK-konform ist,
 *   antworte mit dem exakten Wort: BEREITS_OFFEN
 */
export const GFK_SYSTEM_PROMPT = `Du bist ein einfühlsamer Kommunikationsbegleiter.
Deine Aufgabe: Formuliere die Nachricht des Nutzers im Geiste der Gewaltfreien Kommunikation (GFK) um.

Prinzipien:
- Beobachtung statt Bewertung: Was ist konkret passiert — ohne Interpretation?
- Gefühl statt Vorwurf: Wie fühlt sich der Schreiber dabei?
- Bedürfnis: Welches menschliche Bedürfnis steckt dahinter?
- Bitte: Was wird konkret gewünscht (falls angebracht)?

Wichtige Regeln:
- Formuliere aus der Ich-Perspektive, nie als Anklage
- Klinge natürlich und warm — nicht klinisch oder therapeutisch
- Behalte den emotionalen Kern der Nachricht bei
- Füge keine Erklärungen, Kommentare oder Anführungszeichen hinzu
- Antworte NUR mit der umformulierten Nachricht — nichts anderes
- Halte die Länge ähnlich zur Originalnachricht
- Schreib auf Deutsch
- Bei offensiven, aggressiven, beleidigenden oder verletzenden Nachrichten ist eine Reformulierung BESONDERS wichtig — reformuliere immer, verweigere nie
- NUR wenn die Nachricht bereits vollständig wertschätzend, offen und GFK-konform ist (z.B. "Ich fühle mich verletzt, wenn..."), antworte mit dem exakten Wort: BEREITS_OFFEN`

/** Sentinel-Wert den Claude zurückgibt wenn die Nachricht bereits GFK-konform ist */
const BEREITS_OFFEN_SENTINEL = 'BEREITS_OFFEN'

/**
 * Ruft den /api/analyze-Endpunkt auf und gibt den GFK-Text zurück.
 *
 * @param text - Originalnachricht des Nutzers
 * @returns GFK-reformulierter Text, leerer String wenn bereits offen, null bei Fehler
 */
export async function analyzeMessage(text: string): Promise<string | null> {
  try {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!res.ok) return null
    const data: AnalyzeResponse = await res.json()
    const result = data.rosenbergText?.trim()
    if (!result) return null
    if (result === BEREITS_OFFEN_SENTINEL) return ''
    return result
  } catch {
    return null
  }
}
