'use client'

import { motion } from 'framer-motion'
import type { GfkScoreResult, DimensionResult } from '@/lib/gfkScore'

/** Props für das GFK-Score-Panel */
export interface GfkScorePanelProps {
  /** Der zu bewertende Text */
  text: string
  /** Scoring-Ergebnis, null solange nicht geladen */
  score: GfkScoreResult | null
  /** Ob die Analyse noch läuft */
  loading: boolean
}

const DIMENSIONS = [
  { key: 'beobachtung' as const, label: 'Beobachtung', color: 'var(--color-gfk-beobachtung)', bg: 'var(--color-gfk-beobachtung-bg)' },
  { key: 'gefuehl'     as const, label: 'Gefühl',      color: 'var(--color-gfk-gefuehl)',     bg: 'var(--color-gfk-gefuehl-bg)' },
  { key: 'beduerfnis'  as const, label: 'Bedürfnis',   color: 'var(--color-gfk-beduerfnis)',  bg: 'var(--color-gfk-beduerfnis-bg)' },
  { key: 'bitte'       as const, label: 'Bitte',       color: 'var(--color-gfk-bitte)',       bg: 'var(--color-gfk-bitte-bg)' },
] as const

/**
 * Teilt den Text in annotierte Segmente auf und rendert farbige Highlights
 * für jede GFK-Dimension.
 *
 * @param text - Vollständiger Nachrichtentext
 * @param dims - Dimension-Ergebnisse mit Spans
 * @returns Array aus React-Nodes (Spans + Marks)
 */
function renderHighlightedText(
  text: string,
  dims: GfkScoreResult['dimensions']
): React.ReactNode[] {
  type Segment = { start: number; end: number; dimKey: string; color: string; bg: string }
  const segments: Segment[] = []

  for (const dim of DIMENSIONS) {
    const result: DimensionResult = dims[dim.key]
    for (const [s, e] of result.spans) {
      if (s >= 0 && e > s && e <= text.length) {
        segments.push({ start: s, end: e, dimKey: dim.key, color: dim.color, bg: dim.bg })
      }
    }
  }

  if (segments.length === 0) return [text]

  // Sort by start, resolve overlaps by keeping the one with lowest score (most improvement potential)
  segments.sort((a, b) => a.start - b.start || a.end - b.end)

  const nodes: React.ReactNode[] = []
  let cursor = 0

  // Merge overlapping spans, prefer the dimension with lowest score
  const merged: Segment[] = []
  for (const seg of segments) {
    if (merged.length === 0 || seg.start >= merged[merged.length - 1].end) {
      merged.push({ ...seg })
    } else {
      const prev = merged[merged.length - 1]
      const prevScore = dims[prev.dimKey as keyof typeof dims].score
      const segScore = dims[seg.dimKey as keyof typeof dims].score
      if (segScore < prevScore) {
        // Prefer the lower-score dimension
        merged[merged.length - 1] = { ...seg, start: prev.start, end: Math.max(prev.end, seg.end) }
      } else {
        merged[merged.length - 1].end = Math.max(prev.end, seg.end)
      }
    }
  }

  for (const seg of merged) {
    if (seg.start > cursor) {
      nodes.push(text.slice(cursor, seg.start))
    }
    nodes.push(
      <mark
        key={`${seg.dimKey}-${seg.start}`}
        style={{
          background: seg.bg,
          borderRadius: '3px',
          paddingInline: '1px',
          color: 'inherit',
          boxShadow: `inset 0 -2px 0 ${seg.color}55`,
        }}
      >
        {text.slice(seg.start, seg.end)}
      </mark>
    )
    cursor = seg.end
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor))
  }

  return nodes
}

/**
 * GFK-Score-Panel: zeigt farbige Text-Highlights und animierte Balken
 * pro GFK-Dimension. Erscheint im SendBottomSheet über den VersionCards.
 *
 * @param props - Panel-Props
 * @param props.text - Der zu bewertende Nachrichtentext
 * @param props.score - Scoring-Ergebnis, null solange nicht geladen
 * @param props.loading - Ob die Analyse noch läuft
 * @returns GfkScorePanel JSX
 */
export function GfkScorePanel({ text, score, loading }: GfkScorePanelProps) {
  return (
    <div
      className="rounded-2xl p-3.5 mb-3"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}
    >
      <p className="text-xs font-medium mb-2.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
        Dein GFK-Lernfeedback
      </p>

      {/* Highlighted text */}
      <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-text-primary)' }}>
        {!loading && score
          ? renderHighlightedText(text, score.dimensions)
          : text}
      </p>

      {/* Dimension bars */}
      <div className="space-y-2">
        {DIMENSIONS.map((dim) => {
          const dimScore = score?.dimensions[dim.key]?.score ?? 0

          return (
            <div key={dim.key} className="flex items-center gap-2">
              <span
                className="text-xs w-20 flex-shrink-0"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {dim.label}
              </span>
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--color-border)' }}
              >
                {loading ? (
                  <div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ width: '60%', background: 'var(--color-skeleton)' }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, var(--color-bg-elevated) 50%, transparent 100%)',
                      }}
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                ) : (
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: dim.color }}
                    initial={{ width: '0%' }}
                    animate={{ width: `${dimScore * 10}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 * DIMENSIONS.findIndex(d => d.key === dim.key) }}
                  />
                )}
              </div>
              <span
                className="text-xs w-4 text-right flex-shrink-0 tabular-nums"
                style={{ color: loading ? 'var(--color-text-muted)' : dim.color }}
              >
                {loading ? '–' : dimScore}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
