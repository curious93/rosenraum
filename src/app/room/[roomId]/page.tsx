'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  getRoom,
  getOrCreateParticipantId,
  subscribeToMessages,
  subscribeToParticipants,
  sendMessage,
  type Message,
  type Participant,
} from '@/lib/firestore'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { ChatInput } from '@/components/chat/ChatInput'
import { InviteSheet } from '@/components/invite/InviteSheet'
import { SendBottomSheet, type SendVersion } from '@/components/chat/SendBottomSheet'

/**
 * Haupt-Chat-Seite für einen Rosenraum.
 * Echtzeit-Chat via Firestore, Einladungs-Sheet, PIN-geschützter Raum.
 *
 * @returns Room-Page JSX
 */
export default function RoomPage() {
  const params = useParams<{ roomId: string }>()
  const router = useRouter()
  const roomId = params.roomId ?? ''

  const [messages, setMessages] = useState<Message[]>([])
  const [participants, setParticipants] = useState<Record<string, Participant>>({})
  const [inviteCode, setInviteCode] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [pendingText, setPendingText] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [participantId, setParticipantId] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Raum laden und Participant-ID sicherstellen
  useEffect(() => {
    if (!roomId) return

    getRoom(roomId).then(room => {
      if (!room) { setNotFound(true); setLoading(false); return }

      const pid = getOrCreateParticipantId(roomId)
      setParticipantId(pid)
      setInviteCode(room.inviteCode)
      setLoading(false)
    })
  }, [roomId])

  // Echtzeit-Subscriptions
  useEffect(() => {
    if (!roomId || loading) return
    const unsubMsgs = subscribeToMessages(roomId, setMessages)
    const unsubParts = subscribeToParticipants(roomId, setParticipants)
    return () => { unsubMsgs(); unsubParts() }
  }, [roomId, loading])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInputSend = useCallback((text: string) => {
    setPendingText(text)
  }, [])

  const handleConfirmSend = useCallback(async (
    text: string,
    version: SendVersion,
    rosenbergText?: string
  ) => {
    setPendingText(null)
    if (!participantId) return
    await sendMessage(roomId, {
      senderId: participantId,
      originalText: pendingText ?? text,
      rosenbergText: rosenbergText ?? undefined,
      sentVersion: version,
      hasLearningDots: !!rosenbergText,
    })
  }, [participantId, roomId, pendingText])

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/join/${inviteCode}`

  const partnerCount = Object.keys(participants).length
  const myName = participants[participantId]?.name
  const partnerName = Object.entries(participants)
    .find(([id]) => id !== participantId)?.[1].name

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
          <button
            onClick={() => router.push('/')}
            className="text-sm"
            style={{ color: 'var(--color-primary)' }}
          >
            Zurück zur Startseite
          </button>
        </div>
      </main>
    )
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen" style={{ background: 'var(--color-bg-page)' }}>
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Lade Raum…</div>
      </main>
    )
  }

  return (
    <main
      className="flex flex-col h-screen mx-auto"
      style={{ maxWidth: 'var(--max-width-chat)', background: 'var(--color-bg-page)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-surface)' }}
      >
        <div>
          <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            🌹 {myName ?? 'Ich'}{partnerName ? ` & ${partnerName}` : ''}
          </div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {partnerCount < 2 ? 'Warte auf deinen Gesprächspartner…' : 'Ihr seid verbunden'}
          </div>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="text-xs px-3 py-1.5 rounded-xl transition-opacity hover:opacity-70 font-medium"
          style={partnerCount < 2 ? {
            background: 'var(--color-primary)',
            color: '#ffffff',
          } : {
            background: 'var(--color-bg-elevated)',
            color: 'var(--color-text-secondary)',
          }}
          aria-label="Einladen"
        >
          {partnerCount < 2 ? '+ Einladen' : 'Einladen'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto pt-4">
        <AnimatePresence initial={false}>
          {messages.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full px-8 text-center space-y-2 py-20"
            >
              <div className="text-3xl">🌸</div>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {partnerCount < 2
                  ? 'Teile den Raum und warte auf deine Gesprächspartnerin.'
                  : 'Ihr seid beide da. Sag einfach hallo.'}
              </p>
              {partnerCount < 2 && (
                <button
                  onClick={() => setShowInvite(true)}
                  className="text-sm px-4 py-2 rounded-xl font-medium transition-opacity hover:opacity-80"
                  style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
                >
                  Link teilen →
                </button>
              )}
            </motion.div>
          ) : (
            messages.map(msg => (
              <ChatBubble
                key={msg.id}
                message={msg}
                isOwn={msg.senderId === participantId}
              />
            ))
          )}
        </AnimatePresence>
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput onSend={handleInputSend} disabled={!!pendingText} />
      </div>

      {/* Invite Sheet */}
      <AnimatePresence>
        {showInvite && (
          <InviteSheet
            inviteCode={inviteCode}
            inviteUrl={inviteUrl}
            onClose={() => setShowInvite(false)}
          />
        )}
      </AnimatePresence>
    </main>
  )
}
