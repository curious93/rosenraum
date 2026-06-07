'use client'

import { motion } from 'framer-motion'
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
 * Lern-Dots und Toggles sind nur für den Sender sichtbar.
 *
 * @param props - Bubble-Props
 * @param props.message - Die Nachricht
 * @param props.isOwn - Ob diese Bubble dem Sender gehört
 * @returns Chat-Bubble JSX
 */
export function ChatBubble({ message, isOwn }: ChatBubbleProps) {
  const text = message.sentVersion === 'rosenberg' && message.rosenbergText
    ? message.rosenbergText
    : message.originalText

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28, mass: 0.8 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} px-4 mb-1`}
    >
      <div className="relative max-w-[75%]">
        <div
          className="px-4 py-2.5 text-base leading-relaxed"
          style={{
            background: isOwn ? 'var(--color-bubble-own)' : 'var(--color-bubble-other)',
            color: 'var(--color-text-primary)',
            borderRadius: isOwn
              ? '18px 18px 4px 18px'
              : '18px 18px 18px 4px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {text}
        </div>

        {/* Lern-Dot — nur für Sender sichtbar, nur wenn KI-Analyse vorhanden */}
        {isOwn && message.hasLearningDots && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 500, damping: 25 }}
            className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2"
            style={{
              background: 'var(--color-dot-learning)',
              borderColor: 'var(--color-bg-page)',
            }}
            title="Lernimpuls verfügbar"
          />
        )}
      </div>
    </motion.div>
  )
}
