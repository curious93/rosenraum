'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Heart, Leaf } from 'lucide-react'
import { getRoomByCode, joinRoom, getRoom } from '@/lib/firestore'

/**
 * Einladungslink-Beitritt — findet Raum per Code, fragt PIN falls nötig.
 *
 * @returns Join-by-Link Page JSX
 */
export default function JoinByCodePage() {
  const router = useRouter()
  const params = useParams<{ code: string }>()
  const code = params.code?.toUpperCase() ?? ''

  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [needsPin, setNeedsPin] = useState(false)
  const [roomId, setRoomId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!code) return
    getRoomByCode(code).then(async id => {
      if (!id) { setNotFound(true); setLoading(false); return }
      setRoomId(id)
      const room = await getRoom(id)
      setNeedsPin(!!room?.pin)
      setLoading(false)
    })
  }, [code])

  async function handleJoin() {
    if (!roomId || joining) return
    setJoining(true)
    setError('')

    const result = await joinRoom(roomId, {
      participantName: name.trim() || undefined,
      pin: pin || undefined,
    })

    if ('error' in result) {
      const messages: Record<string, string> = {
        room_full: 'Dieser Raum ist bereits für zwei Personen reserviert.',
        wrong_pin: 'Der PIN stimmt nicht.',
        room_not_found: 'Diesen Raum gibt es nicht mehr.',
      }
      setError(messages[result.error] ?? 'Etwas ist schiefgelaufen.')
      setJoining(false)
      return
    }

    router.push(`/room/${roomId}`)
  }

  if (loading) {
    return (
      <main
        className="flex items-center justify-center min-h-screen"
        style={{ background: 'var(--color-bg-page)' }}
      >
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Raum wird gesucht…
        </div>
      </main>
    )
  }

  if (notFound) {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-screen px-6 text-center"
        style={{ background: 'var(--color-bg-page)' }}
      >
        <div className="space-y-4">
          <div className="text-4xl">🌱</div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Dieser Raum existiert nicht
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Vielleicht ist der Link abgelaufen oder der Code wurde falsch eingegeben.
          </p>
          <Link
            href="/"
            className="inline-block text-sm mt-2 transition-opacity hover:opacity-70"
            style={{ color: 'var(--color-primary)' }}
          >
            Zur Startseite
          </Link>
        </div>
      </main>
    )
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
          <div className="text-3xl mb-2">🌹</div>
          <h1 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Du wurdest eingeladen
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Wie möchtest du heißen?
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Dein Name (optional)"
            maxLength={30}
            autoFocus
            className="w-full px-4 py-3 rounded-xl text-base outline-none border transition-colors"
            style={{
              background: 'var(--color-bg-page)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
            onKeyDown={e => e.key === 'Enter' && !needsPin && handleJoin()}
          />

          {needsPin && (
            <input
              type="tel"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="PIN eingeben"
              inputMode="numeric"
              className="w-full px-4 py-3 rounded-xl text-base outline-none border tracking-widest transition-colors"
              style={{
                background: 'var(--color-bg-page)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          )}
        </div>

        {error && (
          <p className="text-sm" style={{ color: 'var(--color-primary-dark)' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleJoin}
          disabled={joining || (needsPin && pin.length < 4)}
          className="w-full py-3.5 px-6 rounded-2xl text-white font-medium text-base transition-opacity disabled:opacity-40"
          style={{ background: 'var(--color-primary)' }}
        >
          {joining ? 'Betrete Raum…' : 'Raum betreten'}
        </button>
      </div>
    </main>
  )
}
