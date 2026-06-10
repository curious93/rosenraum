/**
 * Typen und API-Call für das GFK Live-Scoring.
 */

/** Ein einzelner problematischer Treffer innerhalb einer GFK-Dimension */
export interface GfkMatch {
  /** Stabile ID, z.B. "obs_1" */
  id: string
  /** Der problematische Textausschnitt */
  text: string
  /** Startposition im Originaltext (0-basiert) */
  start: number
  /** Endposition im Originaltext (exklusiv) */
  end: number
  /** Kurzbezeichnung des Problems, z.B. "Verallgemeinerung" */
  diagnosis: string
  /** Ein Satz Erklärung warum das ein Problem ist */
  explanation: string
  /** Konkrete Reformulierung */
  suggestion: string
  /** 1 = wichtigster Treffer */
  priority: number
  /** true wenn diese Stelle das Problem darstellt */
  isProblematic: boolean
}

/** Score und strukturierte Treffer für eine einzelne GFK-Dimension */
export interface DimensionResult {
  /** Bewertung 1–10 (10 = vollständig erfüllt) */
  score: number
  /** Zeichenpositionen [start, end] — wird aus matches abgeleitet */
  spans: [number, number][]
  /** Kurzstatus */
  status: 'stark' | 'teilweise' | 'schwach' | 'fehlt'
  /** Einzeilige Zusammenfassung, z.B. "3 Stellen · Hauptproblem: Bewertung" */
  summary: string
  /** Hauptproblem in einem Satz — nur wenn score <= 5 */
  mainProblem?: string
  /** Strukturierte Treffer, sortiert nach priority */
  matches: GfkMatch[]
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
  const timeout = setTimeout(() => controller.abort(), 12000)
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
