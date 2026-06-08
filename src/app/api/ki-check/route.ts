import { NextResponse } from 'next/server'

/**
 * GET /api/ki-check — Debug: prüft ANTHROPIC_API_KEY und Anthropic-Erreichbarkeit.
 * @returns { httpStatus, keyPrefix, body } oder { status: 'NO_KEY' }
 */
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ status: 'NO_KEY' })

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 5, messages: [{ role: 'user', content: 'Hi' }] }),
  })

  const body = await res.text()
  return NextResponse.json({ httpStatus: res.status, keyPrefix: apiKey.slice(0, 15), body: body.slice(0, 300) })
}
