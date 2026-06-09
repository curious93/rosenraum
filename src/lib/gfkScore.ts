/**
 * Typen und API-Call für das GFK Live-Scoring.
 */

/** Score und Text-Spans für eine einzelne GFK-Dimension */
export interface DimensionResult {
  /** Bewertung 1–10 (10 = vollständig erfüllt) */
  score: number
  /** Zeichenpositionen [start, end] im analysierten Text */
  spans: [number, number][]
}

/** Gesamtergebnis des GFK-Scorings */
export interface GfkScoreResult {
  dimensions: {
    beobachtung: DimensionResult
    gefuehl: DimensionResult
    beduerfnis: DimensionResult
    bitte: DimensionResult
  }
  /** Gesamtscore 1–10 */
  total: number
}

/**
 * Bewertet eine Nachricht nach GFK-Dimensionen via /api/score.
 *
 * @param text - Nachrichtentext des Nutzers
 * @returns GfkScoreResult oder null bei Fehler
 */
export async function scoreMessage(text: string): Promise<GfkScoreResult | null> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    return (await res.json()) as GfkScoreResult
  } catch {
    clearTimeout(timeout)
    return null
  }
}
