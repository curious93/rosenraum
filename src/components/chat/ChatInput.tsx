'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

/** Props für das Chat-Eingabefeld. */
export interface ChatInputProps {
  /** Callback wenn der Nutzer eine Nachricht senden möchte. */
  onSend: (text: string) => void
  /** Ob das Eingabefeld deaktiviert ist (z.B. während KI analysiert). */
  disabled?: boolean
  /** Platzhaltertext. */
  placeholder?: string
}

/**
 * Pill-förmiges Chat-Eingabefeld im iMessage-Stil.
 * Border wird bei Focus rose, Send-Button animiert beim Tippen.
 *
 * @param props - Input-Props
 * @param props.onSend - Callback beim Senden
 * @param props.disabled - Ob deaktiviert
 * @param props.placeholder - Platzhaltertext
 * @returns ChatInput JSX
 */
export function ChatInput({ onSend, disabled = false, placeholder = 'Schreib etwas…' }: ChatInputProps) {
  const [text, setText] = useState('')
  const [focused, setFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [text])

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const canSend = text.trim().length > 0 && !disabled

  return (
    <div
      className="px-3 py-2.5 flex-shrink-0"
      style={{
        background: 'var(--color-bg-page)',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      }}
    >
      <div
        className="flex items-end gap-2 px-4 py-2 rounded-full"
        style={{
          background: 'var(--color-bg-surface)',
          border: `1.5px solid ${focused ? 'var(--color-primary)' : 'var(--color-border)'}`,
          boxShadow: focused
            ? '0 0 0 3px rgba(201,123,132,0.12), 0 2px 8px rgba(0,0,0,0.05)'
            : '0 2px 8px rgba(0,0,0,0.05)',
          transition: 'border-color 200ms ease, box-shadow 200ms ease',
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none text-base leading-relaxed outline-none bg-transparent py-1.5 disabled:opacity-50"
          style={{
            color: 'var(--color-text-primary)',
            minHeight: '28px',
            maxHeight: '120px',
          }}
        />

        <motion.button
          onClick={handleSend}
          disabled={!canSend}
          whileTap={canSend ? { scale: 0.85 } : {}}
          whileHover={canSend ? { scale: 1.08 } : {}}
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mb-0.5 disabled:opacity-30"
          style={{
            background: canSend ? 'var(--color-primary)' : 'var(--color-skeleton)',
            transition: 'background 200ms ease',
          }}
          aria-label="Senden"
        >
          <motion.svg
            width="15" height="15" viewBox="0 0 24 24" fill="none"
            animate={{ x: canSend ? 0 : -1 }}
            transition={{ duration: 0.15 }}
          >
            <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </motion.svg>
        </motion.button>
      </div>
    </div>
  )
}
