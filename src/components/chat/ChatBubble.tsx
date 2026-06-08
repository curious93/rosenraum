'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Message } from '@/lib/firestore'

/** Props für eine einzelne Chat-Bubble. */
export interface ChatBubbleProps {
  /** Die Nachricht die angezeigt wird. */
  message: Message
  /** Ob diese Bubble vom aktuellen Nutzer stammt. */
  isOwn: boolean
}

/**
 * Rendert eine einzelne Chat-Bubble.
 * Eigene Bubbles erscheinen rechts, fremde links.
 * Der Sender kann via Lern-Dot zwischen gesendeter Version und Alternative wechseln.
 *
 * @param props - Bubble-Props
 * @param props.message - Die Nachricht
 * @param props.isOwn - Ob diese Bubble dem Sender gehört
 * @returns Chat-Bubble JSX
 */
export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const [showAlt, setShowAlt] = useState(false)

  const sentText = message.sentVersion === 'rosenberg' && message.rosenbergText
    ? message.rosenbergText
    : message.originalText

  // Alternative für Lern-Toggle: gesendet GFK → zeige Original, gesendet Original → zeige GFK
  const altText: string | null = message.sentVersion === 'rosenberg'
    ? message.originalText
    : (message.rosenbergText ?? null)

  const canToggle = isOwn && message.hasLearningDots && !!altText

  const displayText = canToggle && showAlt ? altText! : sentText

  // Farbe kommuniziert welche Version sichtbar ist: grün = GFK, beige = Original
  const showingGfk = canToggle
    ? (showAlt ? message.sentVersion === 'original' : message.sentVersion === 'rosenberg')
    : message.sentVersion === 'rosenberg'

  const bgColor = !isOwn
    ? 'var(--color-bubble-other)'
    : showingGfk
      ? 'var(--color-bubble-gfk)'
      : 'var(--color-bubble-own)'

  const altLabel = canToggle && showAlt
    ? (message.sentVersion === 'rosenberg' ? 'Dein Original' : 'GFK-Vorschlag')
    : null

  return (
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

        {/* Bubble-Text mit Cross-Fade beim Toggle */}
        <AnimatePresence mode="wait">
          <motion.div
            key={showAlt ? 'alt' : 'sent'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="px-4 py-2.5 text-base leading-relaxed"
            style={{
              background: bgColor,
              color: 'var(--color-text-primary)',
              borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              transition: 'background 200ms',
            }}
          >
            {displayText}
          </motion.div>
        </AnimatePresence>

        {/* Label wenn Alternative angezeigt wird */}
        <AnimatePresence>
          {altLabel && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5 flex justify-end"
            >
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: 'var(--color-bg-elevated)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {altLabel}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Lern-Dot — nur für Sender, klickbar zum Wechseln */}
        {canToggle && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 500, damping: 25 }}
            onClick={() => setShowAlt(v => !v)}
            className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
            style={{
              background: showAlt ? 'var(--color-primary-dark)' : 'var(--color-dot-learning)',
              borderColor: 'var(--color-bg-page)',
              transition: 'background 200ms',
            }}
            aria-label={showAlt ? 'Gesendete Version anzeigen' : 'Alternative anzeigen'}
          />
        )}
      </div>
    </motion.div>
  )
}
