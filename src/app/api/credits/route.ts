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

  try {
    const res = await fetch('https://api.anthropic.com/v1/organizations/balance', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Nicht verfügbar' }, { status: 502 })
    }

    const data = await res.json() as { balance_usd?: number; available?: number }
    const usd = data.balance_usd ?? data.available ?? 0
    // USD → EUR (Näherung 1 USD ≈ 0.92 EUR)
    const eur = Math.round(usd * 0.92 * 100) / 100
    return NextResponse.json({ balanceEur: eur })
  } catch {
    return NextResponse.json({ error: 'Nicht verfügbar' }, { status: 500 })
  }
}
