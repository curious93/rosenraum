import { NextRequest, NextResponse } from 'next/server'
import type { DimensionResult, GfkMatch, GfkScoreResult } from '@/lib/gfkScore'

/**
 * Kurz-Schema: Das Modell liefert minimale Keys (p,s,sum,m / t,d,e,v,ip) —
 * ~30% weniger Output-Tokens. Der Server remappt auf GfkScoreResult und
 * berechnet status, id, priority, start/end (Textsuche) und spans selbst.
 */
const SCORE_SYSTEM_PROMPT = `Du bist ein GFK-Analyse-Assistent. Analysiere den deutschen Text nach den vier GFK-Dimensionen. Antworte NUR mit validem JSON, ohne Markdown.

ZWEI SCHRITTE je Dimension:
1. p (present): Kommt die Dimension im Text vor oder ist erkennbar berührt? Wenn nein: p:false, s:0, m:[]. Eine Dimension NIE schlecht bewerten, weil sie fehlt — fehlt = p:false.
2. Nur wenn p:true — s (score 1-10): 1-5 enthalten aber problematisch (Bewertung/Vorwurf/Forderung) · 6-7 enthalten aber unsauber/unhöflich · 8-10 gut. JEDE p:true-Dimension braucht mindestens 1 Match in m: bei s<=7 mit ip:true (markiert den Fehler), bei s>=8 genau 1 Match mit ip:false (markiert die gelungene Stelle, d = kurzes Lob, v = "").

Dimensionen: b=Beobachtung (niedrig bei Bewertung/Verallgemeinerung wie 'immer','nie') · g=Gefühl (p nur bei echtem Gefühlsausdruck wie 'ich freue mich') · n=Bedürfnis (p nur wenn ein Bedürfnis explizit genannt/klar berührt; meist p:false) · w=Bitte (p bei Aufforderung; niedrig bei Forderung/Drohung).

Match-Felder: t = exaktes Zitat aus dem Originaltext (max 5 Wörter) · d = Kurzdiagnose (2-4 Wörter) · e = 1 Satz Erklärung · v = bessere Formulierung ("" wenn s>=8) · ip = true/false.
sum: Kurzzeile NUR wenn s<=7, sonst Feld weglassen. Maximal 3 Matches pro Dimension.
In Stringwerten NIEMALS doppelte Anführungszeichen — Zitate mit 'einfachen'.
total: 1-10 holistisch; p:false senkt total nicht.

Beispiel "Hallo mein Freund, ich freue mich, wenn wir uns morgen sehen. Sei allerdings nicht wieder so scheiß spät.":
{"b":{"p":true,"s":5,"sum":"Bewertung statt Beobachtung","m":[{"t":"nicht wieder so scheiß spät","d":"Bewertung","e":"Pauschale Abwertung statt konkreter Beobachtung.","v":"Als du letztes Mal eine Stunde später kamst …","ip":true}]},"g":{"p":true,"s":8,"m":[{"t":"ich freue mich","d":"Klares Gefühl","e":"Du benennst dein Gefühl direkt.","v":"","ip":false}]},"n":{"p":false,"s":0,"m":[]},"w":{"p":true,"s":6,"sum":"Klingt eher wie Forderung","m":[{"t":"Sei allerdings nicht wieder","d":"Forderung statt Bitte","e":"Klingt wie eine Forderung, nicht wie eine höfliche Bitte.","v":"Wärst du bereit, mir kurz zu schreiben, wenn es später wird?","ip":true}]},"total":6}`

interface SlimMatch {
  t: string
  d: string
  e: string
  v: string
  ip: boolean
}
interface SlimDim {
  p: boolean
  s: number
  sum?: string
  m: SlimMatch[]
}
interface SlimResult {
  b: SlimDim
  g: SlimDim
  n: SlimDim
  w: SlimDim
  total: number
}

const DIM_KEYS = [
  ['b', 'beobachtung'],
  ['g', 'gefuehl'],
  ['n', 'beduerfnis'],
  ['w', 'bitte'],
] as const

/**
 * Leitet den Status aus dem Score ab (ersetzt das frühere Modell-Feld).
 *
 * @param score - Dimension-Score 1–10
 * @returns Statuswert für DimensionResult
 */
function statusFromScore(score: number): DimensionResult['status'] {
  if (score >= 8) return 'stark'
  if (score >= 6) return 'teilweise'
  if (score >= 3) return 'schwach'
  return 'fehlt'
}

/**
 * Remappt das Kurz-Schema des Modells auf das volle GfkScoreResult.
 * Positionen werden per Textsuche bestimmt; nicht auffindbare Matches entfallen.
 *
 * @param slim - Modell-Antwort im Kurz-Schema
 * @param text - Originaltext (für start/end)
 * @returns Vollständiges GfkScoreResult für den Client
 */
function expandSlim(slim: SlimResult, text: string): GfkScoreResult {
  const dimensions = {} as GfkScoreResult['dimensions']
  for (const [short, key] of DIM_KEYS) {
    const sd: SlimDim = slim[short] ?? { p: false, s: 0, m: [] }
    const present = sd.p !== false
    let searchFrom = 0
    const matches: GfkMatch[] = []
    if (present) {
      for (const [i, m] of (sd.m ?? []).entries()) {
        if (!m?.t) continue
        const idx =
          text.indexOf(m.t, searchFrom) !== -1 ? text.indexOf(m.t, searchFrom) : text.indexOf(m.t)
        if (idx === -1) continue
        searchFrom = idx + m.t.length
        matches.push({
          id: `${key}_${i + 1}`,
          text: m.t,
          start: idx,
          end: idx + m.t.length,
          diagnosis: m.d ?? '',
          explanation: m.e ?? '',
          suggestion: m.v ?? '',
          priority: i + 1,
          isProblematic: Boolean(m.ip),
        })
      }
    }
    dimensions[key] = {
      present,
      score: present ? (sd.s ?? 0) : 0,
      spans: matches.map((m) => [m.start, m.end] as [number, number]),
      status: present ? statusFromScore(sd.s ?? 0) : 'fehlt',
      summary: sd.sum ?? (present ? '' : 'Nicht enthalten'),
      matches,
    }
  }
  return { dimensions, total: slim.total ?? 0 }
}

/**
 * POST /api/score
 * Bewertet einen Text nach GFK-Dimensionen mit strukturierten Treffern.
 *
 * @param request - { text: string }
 * @returns GfkScoreResult oder { error: string }
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

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        temperature: 0,
        system: [
          {
            type: 'text',
            text: SCORE_SYSTEM_PROMPT,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [{ role: 'user', content: text }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('Claude score API error:', response.status, err)
      return NextResponse.json({ error: 'KI-Dienst nicht verfügbar' }, { status: 502 })
    }

    const data = (await response.json()) as { content?: Array<{ text?: string }> }
    const raw = (data.content?.[0]?.text ?? '')
      .trim()
      .replace(/^```(?:json)?\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    const slim: SlimResult = JSON.parse(raw)
    return NextResponse.json(expandSlim(slim, text))
  } catch (err) {
    console.error('score route error:', err)
    return NextResponse.json({ error: 'Interner Fehler' }, { status: 500 })
  }
}
