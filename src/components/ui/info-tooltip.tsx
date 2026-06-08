'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/** Props für die InfoTooltip-Komponente */
export interface InfoTooltipProps {
  /** Der Tooltip-Text */
  text: string
  /** Optionale ARIA-Label für den Button */
  label?: string
}

/**
 * Kleines ⓘ-Icon das einen Tooltip bei Hover/Tap zeigt.
 * Für Kontexthilfe an Formularen, Labels und KI-Features.
 *
 * @param props - Tooltip-Props
 * @param props.text - Der anzuzeigende Hilfetext
 * @param props.label - ARIA-Label für den Info-Button
 * @returns InfoTooltip JSX
 */
export function InfoTooltip({ text, label = 'Mehr Informationen' }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="w-4 h-4 rounded-full inline-flex items-center justify-center text-xs leading-none flex-shrink-0 transition-opacity hover:opacity-80"
        style={{
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-text-muted)',
          border: '1px solid var(--color-border)',
          fontSize: '10px',
          fontWeight: '600',
        }}
        aria-label={label}
        aria-describedby={visible ? 'info-tooltip-content' : undefined}
      >
        i
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            id="info-tooltip-content"
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-xl text-xs leading-relaxed z-50 w-52 pointer-events-none"
            style={{
              background: 'var(--color-text-primary)',
              color: 'var(--color-bg-surface)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            {text}
            {/* Pfeil */}
            <span
              className="absolute top-full left-1/2 -translate-x-1/2 -translate-y-px"
              style={{
                width: 0, height: 0,
                borderLeft: '5px solid transparent',
                borderRight: '5px solid transparent',
                borderTop: '5px solid var(--color-text-primary)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  )
}
