'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getRoomByCode } from '@/lib/firestore'

/**
 * Seite zur Code-Eingabe — findet den Raum und leitet weiter.
 *
 * @returns Join-by-Code Page JSX
 */
export default function JoinPage() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleJoinWithCode(codeValue: string) {
    if (loading) return
    setLoading(true)
    setError('')

    const roomId = await getRoomByCode(codeValue)
    if (!roomId) {
      setError('Diesen Code kennen wir leider nicht.')
      setLoading(false)
      return
    }
    router.push(`/join/${codeValue}`)
  }

  function handleJoin() {
    if (code.length < 6 || loading) return
    handleJoinWithCode(code)
  }

  function handleCodeChange(value: string) {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
    setError('')
    setCode(cleaned)
    if (cleaned.length === 6) handleJoinWithCode(cleaned)
  }

  return (
    <main
      className="relative flex flex-col items-center justify-center min-h-screen px-6 pt-14"
      style={{ background: 'var(--color-bg-page)' }}
    >
      {/* Top nav */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 h-14"
        style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
      >
        <Link
          href="/"
          className="text-sm flex items-center gap-1 transition-opacity hover:opacity-60"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          ← Zurück
        </Link>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          🌹 Rosenraum
        </span>
        <div style={{ width: '4rem' }} />
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm rounded-2xl p-6 space-y-6"
        style={{
          background: 'var(--color-bg-surface)',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        }}
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Raum betreten
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Gib den 6-stelligen Code ein, den du erhalten hast.
          </p>
        </div>

        <div>
          <input
            type="text"
            value={code}
            onChange={e => handleCodeChange(e.target.value)}
            placeholder="z.B. K3XM7R"
            autoCapitalize="characters"
            autoComplete="off"
            autoFocus
            spellCheck={false}
            className="w-full px-4 py-4 rounded-xl outline-none border text-center font-mono"
            style={{
              background: 'var(--color-bg-page)',
              borderColor: code.length === 6 ? 'var(--color-primary)' : 'var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '1.5rem',
              letterSpacing: '0.25em',
              transition: 'border-color 200ms',
            }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          <div className="flex justify-between mt-1.5 px-1">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {error || ' '}
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: code.length === 6 ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
            >
              {code.length}/6
            </span>
          </div>
        </div>

        <button
          onClick={handleJoin}
          disabled={code.length < 6 || loading}
          className="w-full py-3.5 px-6 rounded-2xl text-white font-medium text-base transition-opacity disabled:opacity-40"
          style={{ background: 'var(--color-primary)' }}
        >
          {loading ? 'Suche…' : 'Raum betreten'}
        </button>
      </div>
    </main>
  )
}
