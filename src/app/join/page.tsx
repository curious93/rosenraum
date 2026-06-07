'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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

  async function handleJoin() {
    if (code.length < 6 || loading) return
    setLoading(true)
    setError('')

    const roomId = await getRoomByCode(code)
    if (!roomId) {
      setError('Diesen Code kennen wir leider nicht.')
      setLoading(false)
      return
    }
    router.push(`/join/${code.toUpperCase()}`)
  }

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div className="w-full max-w-sm space-y-6">
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
            onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="z.B. K3XM7R"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            className="w-full px-4 py-3 rounded-xl text-base outline-none border text-center tracking-widest font-mono"
            style={{
              background: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
              fontSize: '1.25rem',
              letterSpacing: '0.2em',
            }}
            onKeyDown={e => e.key === 'Enter' && handleJoin()}
          />
          {error && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-primary-dark)' }}>
              {error}
            </p>
          )}
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
