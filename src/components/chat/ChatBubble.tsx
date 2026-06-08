'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Message } from '@/lib/firestore'
import { LernModal } from './LernModal'

/** Props für eine einzelne Chat-Bubble. */
export interface ChatBubbleProps {
  /** Die Nachricht die angezeigt wird. */
  message: Message
  /** Ob diese Bubble vom aktuellen Nutzer stammt. */
  isOwn: boolean
}

/**
 * Rendert eine einzelne Chat-Bubble.
 * Eigene Bubbles mit Lern-Dot öffnen bei Tap das LernModal.
 *
 * @param props - Bubble-Props
 * @param props.message - Die Nachricht
 * @param props.isOwn - Ob diese Bubble dem aktuellen Nutzer gehört
 * @returns Chat-Bubble JSX
 */
export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const [showModal, setShowModal] = useState(false)

  const sentText = message.sentVersion === 'rosenberg' && message.rosenbergText
    ? message.rosenbergText
    : message.originalText

  const canLearn = isOwn && !!message.rosenbergText

  // Farbe kommuniziert welche Version sichtbar ist: grün = GFK, beige = Original
  const showingGfk = message.sentVersion === 'rosenberg'

  const bgColor = !isOwn
    ? 'var(--color-bubble-other)'
    : showingGfk
      ? 'var(--color-bubble-gfk)'
      : 'var(--color-bubble-own)'

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: isOwn ? 0.75 : 0.88, y: isOwn ? 12 : 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={isOwn
          ? { type: 'spring', stiffness: 500, damping: 22, mass: 0.6 }
          : { type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }
        }
        className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} px-4 mb-1`}
      >
        <div className="relative max-w-[75%]">

          {/* Bubble — klickbar wenn Lernen verfügbar */}
          <motion.div
            className="px-4 py-2.5 text-base leading-relaxed"
            style={{
              background: bgColor,
              color: 'var(--color-text-primary)',
              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              cursor: canLearn ? 'pointer' : 'default',
            }}
            whileTap={canLearn ? { scale: 0.97 } : undefined}
            onClick={canLearn ? () => setShowModal(true) : undefined}
            role={canLearn ? 'button' : undefined}
            aria-label={canLearn ? 'Lernmoment anzeigen' : undefined}
          >
            {sentText}
          </motion.div>

          {/* Lern-Dot — visueller Indikator, kein eigener Klick mehr */}
          {canLearn && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 500, damping: 25 }}
              className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 pointer-events-none"
              style={{
                background: 'var(--color-dot-learning)',
                borderColor: 'var(--color-bg-page)',
              }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* Timestamp */}
        {message.timestamp && (
          <div
            className="mt-0.5"
            style={{ fontSize: 'var(--text-micro)', color: 'var(--color-text-muted)' }}
          >
            {message.timestamp.toDate().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </motion.div>

      {/* Lern-Modal */}
      <LernModal
        message={message}
        open={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  )
}
