import { NextRequest, NextResponse } from 'next/server'
import { logMetric } from '@/lib/metrics'
import { GFK_SYSTEM_PROMPT } from '@/lib/gfkPrompt'

/**
 * POST /api/analyze
 * Reformuliert eine Nachricht via Anthropic API (Sonnet) im GFK-Stil.
 *
 * @param request - { text: string }
 * @returns { rosenbergText: string } oder { error: string }
 */
export async function POST(request: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'KI nicht konfiguriert' }, { status: 503 })
  }

  let text: string
  try {
    const body = await request.json()
    text = typeof body.text === 'string' ? body.text.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 })
  }

  if (!text || text.length > 2000) {
    return NextResponse.json({ error: 'Text fehlt oder zu lang' }, { status: 400 })
  }

  const t0 = Date.now()
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 500,
        system: GFK_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error:', response.status, err)
      logMetric('analyze', false, Date.now() - t0)
      return NextResponse.json({ error: 'KI-Dienst nicht verfügbar' }, { status: 502 })
    }

    const data = (await response.json()) as {
      content?: Array<{ text?: string }>
      usage?: import('@/lib/metrics').MetricUsage
    }
    const rosenbergText = data.content?.[0]?.text ?? ''

    logMetric('analyze', true, Date.now() - t0, data.usage)
    return NextResponse.json({ rosenbergText })
  } catch (err) {
    console.error('analyze route error:', err)
    logMetric('analyze', false, Date.now() - t0)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
