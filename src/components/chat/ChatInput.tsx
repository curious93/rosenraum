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
 * Chat-Eingabefeld mit Auto-Resize und Send-Button.
 * Unterstützt Enter zum Senden (Shift+Enter für Zeilenumbruch).
 *
 * @param props - Input-Props
 * @param props.onSend - Callback beim Senden
 * @param props.disabled - Ob deaktiviert
 * @param props.placeholder - Platzhaltertext
 * @returns ChatInput JSX
 */
export function ChatInput({ onSend, disabled = false, placeholder = 'Schreib etwas…' }: ChatInputProps) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
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
      className="flex items-end gap-2 px-4 py-3 border-t"
      style={{
        background: 'var(--color-bg-surface)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        rows={1}
        className="flex-1 resize-none text-base leading-relaxed outline-none bg-transparent py-1 disabled:opacity-50"
        style={{ color: 'var(--color-text-primary)', minHeight: '28px', maxHeight: '120px' }}
      />

      <motion.button
        onClick={handleSend}
        disabled={!canSend}
        whileTap={canSend ? { scale: 0.9 } : {}}
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
        style={{ background: canSend ? 'var(--color-primary)' : 'var(--color-skeleton)' }}
        aria-label="Senden"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>
    </div>
  )
}
