'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Check, Link2, Hash } from 'lucide-react'

/** Props für das Invite-Sheet. */
export interface InviteSheetProps {
  /** 6-stelliger Einladungscode. */
  inviteCode: string
  /** Vollständige Einladungs-URL. */
  inviteUrl: string
  /** Callback um das Sheet zu schließen. */
  onClose: () => void
}

/**
 * Bottom Sheet mit Einladungsoptionen: Link kopieren, Code zeigen, QR-Code.
 *
 * @param props - Sheet-Props
 * @param props.inviteCode - 6-stelliger Code
 * @param props.inviteUrl - Vollständige URL
 * @param props.onClose - Schließen-Callback
 * @returns InviteSheet JSX
 */
export function InviteSheet({ inviteCode, inviteUrl, onClose }: InviteSheetProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        key="sheet"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
        className="fixed bottom-0 left-0 right-0 z-50 mx-auto rounded-t-3xl p-6 space-y-5"
        style={{
          background: 'var(--color-bg-surface)',
          maxWidth: 'var(--max-width-sheet)',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle */}
        <div className="flex justify-center -mt-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: 'var(--color-border)' }}
          />
        </div>

        <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
          Jemanden einladen
        </h2>

        {/* Link kopieren */}
        <button
          onClick={copyLink}
          className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-opacity hover:opacity-80"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <span className="flex-shrink-0">
            {copied
              ? <Check className="w-5 h-5" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
              : <Link2 className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} aria-hidden="true" />
            }
          </span>
          <div>
            <div className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {copied ? 'Link kopiert!' : 'Link kopieren'}
            </div>
            <div className="text-xs truncate mt-0.5" style={{ color: 'var(--color-text-muted)', maxWidth: '240px' }}>
              {inviteUrl}
            </div>
          </div>
        </button>

        {/* Code */}
        <div
          className="flex items-center justify-between p-4 rounded-2xl"
          style={{ background: 'var(--color-bg-elevated)' }}
        >
          <div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Einladungscode</div>
            <div
              className="text-2xl font-bold tracking-widest mt-0.5 font-mono"
              style={{ color: 'var(--color-text-primary)', letterSpacing: '0.2em' }}
            >
              {inviteCode}
            </div>
          </div>
          <Hash className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
        </div>

        {/* QR-Code */}
        <div className="flex justify-center py-2">
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'var(--color-bg-elevated)' }}
          >
            <QRCodeSVG
              value={inviteUrl}
              size={160}
              bgColor="transparent"
              fgColor="var(--color-text-primary)"
              level="M"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)' }}
        >
          Schließen
        </button>
      </motion.div>
    </AnimatePresence>
  )
}
