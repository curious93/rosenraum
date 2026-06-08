'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Sun, Moon, Monitor } from 'lucide-react'
import {
  THEMES,
  type Theme,
  type ColorMode,
  getStoredTheme,
  applyTheme,
  getStoredMode,
  applyMode,
} from '@/lib/theme'

/** Colour-mode options rendered as a segmented control. */
const MODES: { id: ColorMode; label: string; Icon: typeof Sun }[] = [
  { id: 'light', label: 'Hell', Icon: Sun },
  { id: 'dark', label: 'Dunkel', Icon: Moon },
  { id: 'system', label: 'System', Icon: Monitor },
]

/** Props für das Theme-Selector-Sheet. */
export interface ThemeSheetProps {
  /** Callback zum Schließen des Sheets. */
  onClose: () => void
}

/**
 * Bottom Sheet zur Auswahl eines der 6 verfügbaren Farbstile.
 * Die Änderung wirkt sofort via CSS `data-theme`-Attribut auf `<html>`.
 *
 * @param props - Sheet-Props
 * @param props.onClose - Schließen-Callback
 * @returns ThemeSheet JSX
 */
export function ThemeSheet({ onClose }: ThemeSheetProps) {
  const [active, setActive] = useState<Theme>(getStoredTheme)
  const [mode, setMode] = useState<ColorMode>(getStoredMode)
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/credits')
      .then(r => r.ok ? r.json() : null)
      .then((d: { balanceEur?: number } | null) => {
        if (d?.balanceEur !== undefined) setBalance(d.balanceEur)
      })
      .catch(() => undefined)
  }, [])

  function handleSelect(theme: Theme) {
    setActive(theme)
    applyTheme(theme)
  }

  function handleMode(next: ColorMode) {
    setMode(next)
    applyMode(next)
  }

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.25)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl mx-auto"
        style={{
          background: 'var(--color-bg-surface)',
          maxWidth: 'var(--max-width-chat)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.10)',
        }}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: 'var(--color-border)' }} />
        </div>

        <div className="px-5 pb-5 pt-3">
          {/* Hell / Dunkel / System */}
          <p
            className="text-xs font-medium mb-2 uppercase tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Modus
          </p>
          <div
            className="flex gap-1 p-1 rounded-2xl mb-5"
            style={{ background: 'var(--color-bg-elevated)' }}
            role="radiogroup"
            aria-label="Farbmodus"
          >
            {MODES.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => handleMode(id)}
                role="radio"
                aria-checked={mode === id}
                className="relative flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium"
                style={{ color: mode === id ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}
              >
                {mode === id && (
                  <motion.span
                    layoutId="mode-pill"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-sm)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={14} aria-hidden="true" className="relative z-10" />
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </div>

          <p
            className="text-xs font-medium mb-4 uppercase tracking-wide"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Stil auswählen
          </p>

          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(theme => (
              <motion.button
                key={theme.id}
                onClick={() => handleSelect(theme.id)}
                whileTap={{ scale: 0.96 }}
                className="relative rounded-2xl p-3 text-left"
                style={{
                  background: 'var(--color-bg-elevated)',
                  border: `2px solid ${active === theme.id ? 'var(--color-primary)' : 'transparent'}`,
                  transition: 'border-color 200ms',
                }}
              >
                {/* Swatches */}
                <div className="flex gap-1 mb-2.5">
                  {theme.swatches.map((color, i) => (
                    <div
                      key={i}
                      className="w-4 h-4 rounded-full"
                      style={{ background: color, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)' }}
                    />
                  ))}
                </div>

                <span
                  className="text-xs font-medium"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {theme.name}
                </span>

                {/* Aktiv-Checkmark */}
                <AnimatePresence>
                  {active === theme.id && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                      className="absolute top-2 right-2"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <Check size={12} aria-hidden="true" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>

          {/* Guthaben */}
          {balance !== null && (
            <p
              className="mt-4 text-xs text-right"
              style={{ color: 'var(--color-text-muted)' }}
            >
              KI-Guthaben: {balance.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
            </p>
          )}
        </div>
      </motion.div>
    </>
  )
}
