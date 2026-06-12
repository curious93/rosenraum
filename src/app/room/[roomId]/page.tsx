'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Leaf, Sparkles, Check, Link2, Settings, BookOpen, TrendingUp } from 'lucide-react'
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
import { ThemeSheet } from '@/components/ThemeSheet'
import { LernverlaufSheet } from '@/components/chat/LernverlaufSheet'
import { StatistikSheet } from '@/components/chat/StatistikSheet'
import { FeedbackSheet } from '@/components/feedback/FeedbackSheet'

function getDateLabel(date: Date): string {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return 'Heute'
  if (date.toDateString() === yesterday.toDateString()) return 'Gestern'
  return date.toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
}

/**
 * Haupt-Chat-Seite für einen Rosenraum.
 * Echtzeit-Chat via Firestore, Einladungs-Sheet, Avatar-Chips, Inline-Invite.
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
  const [showTheme, setShowTheme] = useState(false)
  const [showLernverlauf, setShowLernverlauf] = useState(false)
  const [showStatistik, setShowStatistik] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [pendingText, setPendingText] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  const [participantId, setParticipantId] = useState('')
  const [copied, setCopied] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!roomId) return
    getRoom(roomId).then((room) => {
      if (!room) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const pid = getOrCreateParticipantId(roomId)
      setParticipantId(pid)
      setInviteCode(room.inviteCode)
      setLoading(false)
    })
  }, [roomId])

  useEffect(() => {
    if (!roomId || loading) return
    const unsubMsgs = subscribeToMessages(roomId, setMessages)
    const unsubParts = subscribeToParticipants(roomId, setParticipants)
    return () => {
      unsubMsgs()
      unsubParts()
    }
  }, [roomId, loading])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleInputSend = useCallback((text: string) => {
    setPendingText(text)
  }, [])

  const handleConfirmSend = useCallback(
    async (text: string, version: SendVersion, rosenbergText?: string) => {
      setPendingText(null)
      if (!participantId) return
      await sendMessage(roomId, {
        senderId: participantId,
        originalText: pendingText ?? text,
        rosenbergText: rosenbergText,
        sentVersion: version,
        hasLearningDots: !!rosenbergText,
      })
    },
    [participantId, roomId, pendingText]
  )

  async function copyInviteLink() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    await navigator.clipboard.writeText(`${baseUrl}/join/${inviteCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const inviteUrl = `${baseUrl}/join/${inviteCode}`

  const partnerCount = Object.keys(participants).length
  const myName = participants[participantId]?.name
  const partnerEntry = Object.entries(participants).find(([id]) => id !== participantId)
  const partnerName = partnerEntry?.[1].name

  const myInitial = (myName || 'I').charAt(0).toUpperCase()
  const partnerInitial = partnerName ? partnerName.charAt(0).toUpperCase() : null

  if (notFound) {
    return (
      <main
        className="flex flex-col items-center justify-center min-h-dvh px-6 text-center"
        style={{ background: 'var(--color-bg-page)' }}
      >
        <div className="space-y-3">
          <Leaf
            className="w-10 h-10 mx-auto"
            style={{ color: 'var(--color-text-muted)' }}
            aria-hidden="true"
          />
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
      <main
        className="flex items-center justify-center min-h-dvh"
        style={{ background: 'var(--color-bg-page)' }}
      >
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Lade Raum…
        </div>
      </main>
    )
  }

  return (
    <main
      className="flex flex-col"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        maxWidth: 'var(--max-width-chat)',
        marginInline: 'auto',
        background: 'var(--color-bg-page)',
        overflow: 'clip',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 flex-shrink-0"
        style={{
          paddingTop: 'max(12px, env(safe-area-inset-top))',
          paddingBottom: '12px',
          background: 'var(--color-bg-surface)',
          borderBottom: '1px solid var(--color-border)',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
        }}
      >
        {/* Avatar-Chips */}
        <div className="flex -space-x-1.5">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 z-10"
            style={{
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary-dark)',
              borderColor: 'var(--color-bg-surface)',
            }}
          >
            {myInitial}
          </motion.div>

          <AnimatePresence>
            {partnerInitial && (
              <motion.div
                initial={{ scale: 0, opacity: 0, x: -4 }}
                animate={{ scale: 1, opacity: 1, x: 0 }}
                exit={{ scale: 0, opacity: 0, x: -4 }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-secondary)',
                  borderColor: 'var(--color-bg-surface)',
                }}
              >
                {partnerInitial}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Name + Status */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {myName ?? 'Ich'}
            {partnerName ? ` & ${partnerName}` : ''}
          </p>
          <div className="flex items-center gap-1.5 h-4">
            <AnimatePresence mode="wait">
              {partnerCount >= 2 ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-1.5"
                >
                  <motion.span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: 'var(--color-success)', display: 'inline-block' }}
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Verbunden
                  </span>
                </motion.div>
              ) : (
                <motion.span
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs truncate"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Warte auf Gesprächspartner…
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Lernverlauf-Button — nur sichtbar wenn eigene Lern-Nachrichten existieren */}
        <AnimatePresence>
          {messages.some((m) => m.senderId === participantId && m.hasLearningDots) && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowLernverlauf(true)}
              className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
              style={{
                color: 'var(--color-text-secondary)',
                background: 'var(--color-bg-elevated)',
              }}
              aria-label="Lernverlauf anzeigen"
            >
              <BookOpen size={16} strokeWidth={2} aria-hidden="true" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Stil-Button */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowTheme(true)}
          className="icon-spin-hover flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-secondary)', background: 'var(--color-bg-elevated)' }}
          aria-label="Stil auswählen"
        >
          <Settings size={16} strokeWidth={2} aria-hidden="true" />
        </motion.button>

        {/* Einladen-Button — immer sichtbar */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowInvite(true)}
          className={`flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl font-medium transition-opacity hover:opacity-80 ${partnerCount < 2 ? 'glow-primary' : ''}`}
          style={
            partnerCount < 2
              ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)' }
              : { background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }
          }
          aria-label="Einladen"
        >
          <Link2 size={13} aria-hidden="true" />
          {partnerCount < 2 ? 'Einladen' : 'Link'}
        </motion.button>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pt-4 messages-area" style={{ scrollbarWidth: 'none' }}>
        {messages.length === 0 ? (
          <AnimatePresence mode="wait">
            {partnerCount < 2 ? (
              /* ── Inline Invite-Card ─── */
              <motion.div
                key="invite"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full px-6 text-center gap-5 py-12"
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                  className="space-y-2"
                >
                  <Heart
                    className="w-10 h-10 mx-auto"
                    style={{
                      color: 'var(--color-primary)',
                      filter:
                        'drop-shadow(0 0 10px color-mix(in srgb, var(--color-primary) 30%, transparent))',
                    }}
                    fill="var(--color-primary-light)"
                    aria-hidden="true"
                  />
                  <p
                    className="text-base font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    Dein Raum ist bereit.
                  </p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Teile den Code mit einer Person,
                    <br />
                    der du vertraust.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 32, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 19 }}
                  className="w-full max-w-xs rounded-2xl overflow-hidden"
                  style={{
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Code */}
                  <div
                    className="px-5 pt-5 pb-4 text-center"
                    style={{ borderBottom: '1px solid var(--color-border-subtle)' }}
                  >
                    <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
                      Einladungscode
                    </p>
                    <p
                      className="text-3xl font-bold font-mono"
                      style={{
                        color: 'var(--color-text-primary)',
                        letterSpacing: '0.2em',
                      }}
                    >
                      {inviteCode}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="p-3 space-y-2">
                    <motion.button
                      onClick={copyInviteLink}
                      whileTap={{ scale: 0.97 }}
                      className="glow-primary w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                      style={{
                        background: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                      }}
                    >
                      <AnimatePresence mode="wait">
                        {copied ? (
                          <motion.span
                            key="copied"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1.5"
                          >
                            <Check size={14} aria-hidden="true" /> Kopiert!
                          </motion.span>
                        ) : (
                          <motion.span
                            key="copy"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1.5"
                          >
                            <Link2 size={14} aria-hidden="true" /> Link kopieren
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <button
                      onClick={() => setShowInvite(true)}
                      className="w-full py-2 text-xs transition-opacity hover:opacity-70"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      QR-Code anzeigen →
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            ) : (
              /* ── Beide da, noch keine Nachrichten ─── */
              <motion.div
                key="together"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center justify-center h-full text-center gap-2 py-20"
              >
                <Sparkles
                  className="w-8 h-8 mx-auto mb-1"
                  style={{ color: 'var(--color-primary-light)' }}
                  aria-hidden="true"
                />
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Ihr seid beide hier. Sag einfach hallo.
                </p>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="mt-6 text-xs transition-opacity hover:opacity-70"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Feedback geben →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        ) : (
          <AnimatePresence initial={false}>
            {messages.reduce<React.ReactNode[]>((acc, msg, i) => {
              const msgDate = msg.timestamp?.toDate()
              if (msgDate) {
                const prevDate = i > 0 ? messages[i - 1].timestamp?.toDate() : null
                if (!prevDate || prevDate.toDateString() !== msgDate.toDateString()) {
                  acc.push(
                    <div key={`sep-${msg.id}`} className="flex items-center gap-3 px-4 py-2">
                      <div
                        className="flex-1 h-px"
                        style={{ background: 'var(--color-border-subtle)' }}
                      />
                      <span
                        style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
                      >
                        {getDateLabel(msgDate)}
                      </span>
                      <div
                        className="flex-1 h-px"
                        style={{ background: 'var(--color-border-subtle)' }}
                      />
                    </div>
                  )
                }
              }
              acc.push(
                <ChatBubble key={msg.id} message={msg} isOwn={msg.senderId === participantId} />
              )
              return acc
            }, [])}
          </AnimatePresence>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* ── Input + Statistik-Icon ─────────────────────────────────────────────── */}
      <ChatInput
        onSend={handleInputSend}
        disabled={!!pendingText}
        leading={
          messages.some((m) => m.senderId === participantId && m.hasLearningDots) ? (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowStatistik(true)}
              className="mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-secondary)',
              }}
              aria-label="Lernstatistik anzeigen"
            >
              <TrendingUp size={16} strokeWidth={2} aria-hidden="true" />
            </motion.button>
          ) : null
        }
      />

      {/* ── Invite Sheet ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showInvite && (
          <InviteSheet
            inviteCode={inviteCode}
            inviteUrl={inviteUrl}
            onClose={() => setShowInvite(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Theme Sheet ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTheme && <ThemeSheet onClose={() => setShowTheme(false)} />}
      </AnimatePresence>

      {/* ── Lernverlauf Sheet ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showLernverlauf && (
          <LernverlaufSheet
            messages={messages}
            participantId={participantId}
            onClose={() => setShowLernverlauf(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Statistik Sheet ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showStatistik && (
          <StatistikSheet
            messages={messages}
            currentUserId={participantId}
            open={showStatistik}
            onClose={() => setShowStatistik(false)}
          />
        )}
      </AnimatePresence>

      {/* ── Send Bottom Sheet ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {pendingText && (
          <SendBottomSheet
            originalText={pendingText}
            onSend={handleConfirmSend}
            onClose={() => setPendingText(null)}
          />
        )}
      </AnimatePresence>

      {/* ── Feedback Sheet ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFeedback && (
          <FeedbackSheet source="room" roomId={roomId} onClose={() => setShowFeedback(false)} />
        )}
      </AnimatePresence>
    </main>
  )
}
