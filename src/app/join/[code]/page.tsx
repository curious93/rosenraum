'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
        <div className="space-y-3">
          <div className="text-4xl">🌱</div>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Dieser Raum existiert nicht
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Vielleicht ist der Link abgelaufen oder der Code wurde falsch eingegeben.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen px-6"
      style={{ background: 'var(--color-bg-page)' }}
    >
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1">
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
            className="w-full px-4 py-3 rounded-xl text-base outline-none border"
            style={{
              background: 'var(--color-bg-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-primary)',
            }}
          />

          {needsPin && (
            <div>
              <input
                type="tel"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="PIN eingeben"
                inputMode="numeric"
                className="w-full px-4 py-3 rounded-xl text-base outline-none border tracking-widest"
                style={{
                  background: 'var(--color-bg-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                }}
              />
            </div>
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
