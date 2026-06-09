import { NextResponse } from 'next/server'

/**
 * GET /api/credits
 * Gibt das verbleibende Anthropic API-Guthaben in Euro zurück.
 *
 * @returns { balanceEur: number } oder { error: string }
 */
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Nicht konfiguriert' }, { status: 503 })
  }

  // Anthropic stellt keinen öffentlichen Balance-Endpunkt bereit.
  // Guthaben ist nur über die Anthropic Console einsehbar.
  return NextResponse.json(
    {
      error:
        'Kein API-Endpunkt verfügbar — bitte in der Anthropic Console prüfen: console.anthropic.com',
    },
    { status: 501 }
  )
}
