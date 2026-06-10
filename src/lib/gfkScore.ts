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
  /** Ist die Kategorie im Text enthalten/erkennbar berührt? Wenn false → „nicht enthalten" (score irrelevant) */
  present: boolean
  /** Bewertung 1–10 (10 = vollständig erfüllt) — nur relevant wenn present === true */
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

/** Bewertungsband einer enthaltenen GFK-Dimension */
export type GfkBand = 'kritisch' | 'verbessern' | 'gut'

/**
 * Liefert das Bewertungsband zu einem GFK-Score.
 *
 * @param score - Dimension-Score 1–10
 * @returns 'kritisch' (1–5), 'verbessern' (6–7) oder 'gut' (8–10)
 * @example
 * scoreBand(5) // 'kritisch'
 * scoreBand(7) // 'verbessern'
 * scoreBand(9) // 'gut'
 */
export function scoreBand(score: number): GfkBand {
  if (score <= 5) return 'kritisch'
  if (score <= 7) return 'verbessern'
  return 'gut'
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

const scoreCache = new Map<string, GfkScoreResult>()
const SCORE_CACHE_MAX = 20

/**
 * Bewertet eine Nachricht nach GFK-Dimensionen via /api/score.
 * Identische Texte kommen aus einem kleinen Client-Cache (instant, z.B. nach Undo).
 *
 * @param text - Nachrichtentext des Nutzers
 * @returns GfkScoreResult oder null bei Fehler
 */
export async function scoreMessage(text: string): Promise<GfkScoreResult | null> {
  const cacheKey = text.trim()
  const cached = scoreCache.get(cacheKey)
  if (cached) return cached

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
    const result = (await res.json()) as GfkScoreResult
    scoreCache.set(cacheKey, result)
    if (scoreCache.size > SCORE_CACHE_MAX) {
      const oldest = scoreCache.keys().next().value
      if (oldest !== undefined) scoreCache.delete(oldest)
    }
    return result
  } catch {
    clearTimeout(timeout)
    return null
  }
}
