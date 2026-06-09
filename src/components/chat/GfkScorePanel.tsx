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
  /** Vorheriges Scoring für Delta-Animation */
  prevScore?: GfkScoreResult | null
}

const DIMENSIONS = [
  { key: 'beobachtung' as const, label: 'Beobachtung', color: 'var(--color-gfk-beobachtung)' },
  { key: 'gefuehl'     as const, label: 'Gefühl',      color: 'var(--color-gfk-gefuehl)'     },
  { key: 'beduerfnis'  as const, label: 'Bedürfnis',   color: 'var(--color-gfk-beduerfnis)'  },
  { key: 'bitte'       as const, label: 'Bitte',       color: 'var(--color-gfk-bitte)'       },
] as const

function renderHighlightedText(text: string, dims: GfkScoreResult['dimensions']): React.ReactNode[] {
  type Seg = { start: number; end: number; dimKey: string; color: string }
  const segments: Seg[] = []
  for (const dim of DIMENSIONS) {
    const result: DimensionResult = dims[dim.key]
    for (const [s, e] of result.spans) {
      if (s >= 0 && e > s && e <= text.length) {
        segments.push({ start: s, end: e, dimKey: dim.key, color: dim.color })
      }
    }
  }
  if (segments.length === 0) return [text]
  segments.sort((a, b) => a.start - b.start || a.end - b.end)
  const merged: Seg[] = []
  for (const seg of segments) {
    if (merged.length === 0 || seg.start >= merged[merged.length - 1].end) {
      merged.push({ ...seg })
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, seg.end)
    }
  }
  const nodes: React.ReactNode[] = []
  let cursor = 0
  for (const seg of merged) {
    if (seg.start > cursor) nodes.push(text.slice(cursor, seg.start))
    nodes.push(
      <mark key={`${seg.dimKey}-${seg.start}`} style={{ background: `${seg.color}30`, borderRadius: '3px', paddingInline: '1px', color: 'inherit', boxShadow: `inset 0 -2px 0 ${seg.color}` }}>
        {text.slice(seg.start, seg.end)}
      </mark>
    )
    cursor = seg.end
  }
  if (cursor < text.length) nodes.push(text.slice(cursor))
  return nodes
}

/**
 * GFK-Score-Panel: animierte Balken pro Dimension, Delta-Badges und motivierender Text.
 *
 * @param props - Panel-Props
 * @param props.text - Der zu bewertende Nachrichtentext
 * @param props.score - Scoring-Ergebnis, null solange nicht geladen
 * @param props.loading - Ob die Analyse noch läuft
 * @param props.prevScore - Vorheriges Scoring für Delta-Animation
 * @returns GfkScorePanel JSX
 */
export function GfkScorePanel({ text, score, loading, prevScore }: GfkScorePanelProps) {
  const alreadyOpen = !loading && score !== null &&
    DIMENSIONS.every(d => (score.dimensions[d.key]?.score ?? 0) >= 7)

  const total = score?.total ?? 0
  const hasScore = score !== null

  const motivationalText = loading ? null
    : !hasScore ? null
    : alreadyOpen ? null
    : total >= 7 ? 'Gut formuliert ✓'
    : total >= 4 ? 'Fast da — noch ein Schritt'
    : 'Kleine Anpassungen können viel bewirken'

  const motivationalColor = total >= 7
    ? 'var(--color-gfk-beduerfnis)'
    : total >= 4 ? 'var(--color-text-secondary)'
    : 'var(--color-text-muted)'

  return (
    <div
      className="rounded-2xl p-3.5 mb-3"
      style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}
    >
      <p className="text-xs font-medium mb-2.5 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
        Dein GFK-Lernfeedback
      </p>

      {alreadyOpen ? (
        <p className="text-sm font-medium" style={{ color: 'var(--color-gfk-beduerfnis)' }}>
          ✓ Diese Nachricht klingt bereits offen.
        </p>
      ) : (
        <>
          <div className="space-y-2">
            {DIMENSIONS.map((dim, idx) => {
              const dimScore = hasScore ? (score!.dimensions[dim.key]?.score ?? 0) : 0
              const prevDimScore = prevScore?.dimensions[dim.key]?.score ?? null
              const delta = prevDimScore !== null && !loading && hasScore ? dimScore - prevDimScore : 0
              // Skeleton only on initial load (no score yet) — keep bars stable during re-scoring
              const initialLoad = loading && !hasScore
              const barColor = hasScore ? dim.color : 'var(--color-skeleton)'
              const labelColor = hasScore ? dim.color : 'var(--color-text-muted)'

              return (
                <div key={dim.key} className="flex items-center gap-2">
                  <span className="text-xs w-20 flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                    {dim.label}
                  </span>

                  <div
                    className="flex-1 h-2 rounded-full overflow-hidden relative"
                    style={{ background: 'var(--color-border)' }}
                  >
                    {initialLoad ? (
                      <div
                        className="h-full rounded-full relative overflow-hidden"
                        style={{ width: '60%', background: 'var(--color-skeleton)' }}
                      >
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-bg-elevated) 50%, transparent 100%)' }}
                          animate={{ x: ['-100%', '200%'] }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                        />
                      </div>
                    ) : (
                      <>
                        {prevDimScore !== null && prevDimScore !== dimScore && hasScore && (
                          <motion.div
                            key={`ghost-${dim.key}-${prevDimScore}-${dimScore}`}
                            className="absolute top-0 bottom-0 rounded-full z-10"
                            style={{ left: `${prevDimScore * 10}%`, width: '2px', background: dim.color }}
                            initial={{ opacity: 0.5 }}
                            animate={{ opacity: 0 }}
                            transition={{ duration: 1.5, delay: 0.4 }}
                          />
                        )}
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: barColor }}
                          initial={{ width: '0%' }}
                          animate={{ width: hasScore ? `${dimScore * 10}%` : '0%' }}
                          transition={{ type: 'spring', stiffness: 180, damping: 22, delay: 0.05 * idx }}
                        />
                      </>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-1" style={{ minWidth: '2.5rem' }}>
                    <span className="text-xs tabular-nums" style={{ color: labelColor }}>
                      {!hasScore ? '–' : dimScore}
                    </span>
                    {!loading && delta !== 0 && (
                      <motion.span
                        key={`delta-${dim.key}-${prevDimScore}-${dimScore}`}
                        className="text-xs tabular-nums font-semibold"
                        style={{ color: delta > 0 ? 'var(--color-gfk-beduerfnis)' : 'var(--color-gfk-gefuehl)' }}
                        initial={{ opacity: 1, y: delta > 0 ? 4 : -4 }}
                        animate={{ opacity: 0, y: 0 }}
                        transition={{ duration: 1.5, delay: 0.3 }}
                      >
                        {delta > 0 ? `+${delta}` : `${delta}`}
                      </motion.span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {motivationalText && (
            <p className="text-xs mt-2 font-medium" style={{ color: motivationalColor }}>
              {motivationalText}
            </p>
          )}

          {!loading && hasScore && score!.dimensions && (() => {
            const nodes = renderHighlightedText(text, score!.dimensions)
            const hasSpans = nodes.length > 1 || (nodes.length === 1 && typeof nodes[0] !== 'string')
            if (!hasSpans) return null
            return (
              <p className="text-sm leading-relaxed mt-3 pt-3" style={{ color: 'var(--color-text-primary)', borderTop: '1px solid var(--color-border-subtle)' }}>
                {nodes}
              </p>
            )
          })()}
        </>
      )}
    </div>
  )
}
