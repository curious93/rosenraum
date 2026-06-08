import { NextRequest, NextResponse } from 'next/server'
import { GFK_SYSTEM_PROMPT } from '@/lib/gfkPrompt'

// Module-level token cache — survives warm-instance reuse, resets on cold start.
let cachedToken: string | null = null
let cachedExpiry = 0 // epoch ms

async function refreshAccessToken(): Promise<string | null> {
  const rt = process.env.CLAUDE_REFRESH_TOKEN
  if (!rt) return null
  try {
    const res = await fetch('https://api.anthropic.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: rt }),
    })
    if (!res.ok) {
      console.error('Token refresh failed:', res.status, await res.text())
      return null
    }
    const data = await res.json() as { access_token: string; expires_in?: number }
    cachedToken = data.access_token
    cachedExpiry = Date.now() + (data.expires_in ? data.expires_in * 1000 : 4 * 60 * 60 * 1000)
    return cachedToken
  } catch (err) {
    console.error('Token refresh error:', err)
    return null
  }
}

async function getToken(): Promise<string | null> {
  // Use cached token if still valid with a 5-minute buffer
  if (cachedToken && Date.now() < cachedExpiry - 5 * 60 * 1000) {
    return cachedToken
  }
  // Try the env token (set via Firebase Secrets at deploy time)
  const envToken = process.env.CLAUDE_OAUTH_TOKEN
  if (envToken) {
    cachedToken = envToken
    cachedExpiry = Date.now() + 4 * 60 * 60 * 1000 // assume ~4h until proven otherwise
    return envToken
  }
  return null
}

async function callClaude(token: string, text: string): Promise<Response> {
  return fetch('https://api.anthropic.com/v1/messages', {
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
}

/**
 * POST /api/analyze
 * Reformuliert eine Nachricht via Claude Max OAuth im GFK-Stil.
 * Refresht automatisch den Access Token bei 401 via Refresh Token.
 *
 * @param request - { text: string }
 * @returns { rosenbergText: string } oder { error: string }
 */
export async function POST(request: NextRequest) {
  let token = await getToken()
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
    let response = await callClaude(token, text)

    // Token expired → refresh once and retry
    if (response.status === 401) {
      console.log('Token expired, refreshing...')
      const newToken = await refreshAccessToken()
      if (!newToken) {
        return NextResponse.json({ error: 'KI-Token abgelaufen' }, { status: 503 })
      }
      response = await callClaude(newToken, text)
    }

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude API error:', response.status, err)
      return NextResponse.json({ error: 'KI-Dienst nicht verfügbar' }, { status: 502 })
    }

    const data = await response.json() as { content?: Array<{ text?: string }> }
    const rosenbergText = data.content?.[0]?.text ?? ''

    return NextResponse.json({ rosenbergText })
  } catch (err) {
    console.error('analyze route error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
