'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { createRoom } from '@/lib/firestore'

/**
 * Seite zum Erstellen eines neuen Raums.
 * Name und PIN sind optional.
 *
 * @returns Create-Page JSX
 */
export default function CreatePage() {
  const router = useRouter()
  const [roomName, setRoomName] = useState('')
  const [participantName, setParticipantName] = useState('')
  const [pin, setPin] = useState('')
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (loading) return
    setLoading(true)
    setError('')

    try {
      const { roomId } = await createRoom({
        roomName: roomName.trim() || undefined,
        participantName: participantName.trim() || undefined,
        pin: pin.trim() || undefined,
      })
      router.push(`/room/${roomId}`)
    } catch {
      setError('Etwas ist schiefgelaufen. Bitte versuche es nochmal.')
      setLoading(false)
    }
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
        <span className="text-sm font-medium flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
          <Heart className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} fill="var(--color-primary)" aria-hidden="true" />
          Rosenraum
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
          <h1
            className="text-2xl font-semibold"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Neuen Raum erstellen
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Alles optional — du kannst auch anonym bleiben.
          </p>
        </div>

        <div className="space-y-3">
          {/* Dein Name */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Dein Name
            </label>
            <input
              type="text"
              value={participantName}
              onChange={e => setParticipantName(e.target.value)}
              placeholder="z.B. Lena"
              maxLength={30}
              className="w-full px-4 py-3 rounded-xl text-base outline-none border transition-colors"
              style={{
                background: 'var(--color-bg-page)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* Raumname */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Raumname
            </label>
            <input
              type="text"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              placeholder="z.B. Unser Raum"
              maxLength={50}
              className="w-full px-4 py-3 rounded-xl text-base outline-none border transition-colors"
              style={{
                background: 'var(--color-bg-page)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>

          {/* PIN-Toggle */}
          <div>
            <button
              type="button"
              onClick={() => {
                setShowPin(v => !v)
                if (showPin) setPin('')
              }}
              className="text-sm flex items-center gap-1.5 transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-primary-dark)' }}
            >
              <span>{showPin ? '✕' : '+'}</span>
              <span>{showPin ? 'PIN entfernen' : 'PIN hinzufügen (optional)'}</span>
            </button>

            {showPin && (
              <div className="mt-2">
                <input
                  type="tel"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="4–6 Ziffern"
                  inputMode="numeric"
                  className="w-full px-4 py-3 rounded-xl text-base outline-none border transition-colors tracking-widest"
                  style={{
                    background: 'var(--color-bg-page)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-primary)',
                  }}
                />
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                  Der PIN schützt deinen Raum vor unerwünschten Beitritten.
                </p>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm" style={{ color: 'var(--color-primary-dark)' }}>
            {error}
          </p>
        )}

        <button
          onClick={handleCreate}
          disabled={loading || (showPin && pin.length > 0 && pin.length < 4)}
          className="w-full py-3.5 px-6 rounded-2xl text-primary-foreground font-medium text-base transition-opacity disabled:opacity-50"
          style={{ background: 'var(--color-primary)' }}
        >
          {loading ? 'Raum wird erstellt…' : 'Raum erstellen'}
        </button>
      </div>
    </main>
  )
}
