import { FieldValue } from 'firebase-admin/firestore'
import { getAdminDb } from './firebaseAdmin'

/** Anthropic-usage-Felder, soweit vorhanden */
export interface MetricUsage {
  input_tokens?: number
  output_tokens?: number
  cache_read_input_tokens?: number
  cache_creation_input_tokens?: number
}

/**
 * Schreibt einen API-Metrik-Eintrag nach `metrics/{auto}` — fire-and-forget,
 * Fehler werden nur geloggt und blockieren die eigentliche Antwort nie.
 *
 * @param route - z.B. 'score' | 'analyze' | 'punctuate' | 'feedback'
 * @param ok - ob der Call fachlich erfolgreich war
 * @param ms - Dauer in Millisekunden
 * @param usage - optionale Token-Zahlen aus der Anthropic-Antwort
 */
export function logMetric(route: string, ok: boolean, ms: number, usage?: MetricUsage): void {
  getAdminDb()
    .collection('metrics')
    .add({
      route,
      ok,
      ms: Math.round(ms),
      tokensIn: usage?.input_tokens ?? null,
      tokensOut: usage?.output_tokens ?? null,
      cacheRead: usage?.cache_read_input_tokens ?? null,
      cacheWrite: usage?.cache_creation_input_tokens ?? null,
      createdAt: FieldValue.serverTimestamp(),
    })
    .catch((err) => console.error('metric write failed:', err))
}
