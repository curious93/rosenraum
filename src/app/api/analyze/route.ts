import { NextRequest, NextResponse } from 'next/server'
import { GFK_SYSTEM_PROMPT } from '@/lib/gfkPrompt'

/**
 * POST /api/analyze
 * Reformuliert eine Nachricht via Claude Max OAuth im GFK-Stil.
 *
 * @param request - { text: string }
 * @returns { rosenbergText: string } oder { error: string }
 */
export async function POST(request: NextRequest) {
  const token = process.env.CLAUDE_OAUTH_TOKEN
  if (!token) {
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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'oauth-2025-04-20',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        system: GFK_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error:', response.status, err)
      return NextResponse.json({ error: 'KI-Dienst nicht verfügbar' }, { status: 502 })
    }

    const data = await response.json()
    const rosenbergText = data.content?.[0]?.text ?? ''

    return NextResponse.json({ rosenbergText })
  } catch (err) {
    console.error('analyze route error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
