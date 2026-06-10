'use client'

import { useRef, useState, useSyncExternalStore } from 'react'

/** Minimale Web-Speech-API-Typen (nicht in lib.dom enthalten). */
export interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start(): void
  stop(): void
  onresult:
    | ((e: {
        results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } } & ArrayLike<unknown>>
      }) => void)
    | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionLike
    webkitSpeechRecognition?: new () => SpeechRecognitionLike
  }
}

const noopSubscribe = () => () => {}

/** Zustand einer Sprachaufnahme (formatting = KI setzt gerade Interpunktion) */
export type SpeechRecState = 'idle' | 'recording' | 'formatting' | 'stopped'

/**
 * Großschreibung am Segmentanfang, wenn dort ein neuer Satz beginnt.
 *
 * @param base - bereits vorhandener Text vor dem Diktat
 * @param seg - rohes Diktat-Segment
 * @returns Segment, ggf. mit großem Anfangsbuchstaben
 */
function cosmetics(base: string, seg: string): string {
  const startsSentence = base.trim() === '' || /[.!?…]\s*$/.test(base)
  if (startsSentence && seg.length > 0) {
    return seg.charAt(0).toUpperCase() + seg.slice(1)
  }
  return seg
}

/**
 * Live-Spracherkennung (de-DE) über die Web Speech API.
 * Liefert Zwischenergebnisse in Echtzeit; nach dem Stopp formatiert ein
 * KI-Mini-Call (`/api/punctuate`) Interpunktion und Großschreibung — bei
 * Fehlern bleibt der Rohtext. Danach ist der Text frei editierbar.
 *
 * @returns Objekt mit: `supported` (Browser-Support, SSR-sicher false) · `state` · `start(base, onText)` · `stop()` · `reset()`
 * @example
 * const rec = useSpeechRecognition()
 * rec.start(text ? text + ' ' : '', (full) => setText(full))
 */
export function useSpeechRecognition() {
  const [state, setState] = useState<SpeechRecState>('idle')
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  const supported = useSyncExternalStore(
    noopSubscribe,
    () => Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition),
    () => false
  )

  function start(base: string, onText: (full: string) => void) {
    const SR = window.SpeechRecognition ?? window.webkitSpeechRecognition
    if (!SR || recRef.current) return
    const rec = new SR()
    rec.lang = 'de-DE'
    rec.continuous = true
    rec.interimResults = true
    let lastSegment = ''
    rec.onresult = (e) => {
      let finals = ''
      let interim = ''
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finals += r[0].transcript
        else interim += r[0].transcript
      }
      lastSegment = (finals + interim).trim()
      onText((base + cosmetics(base, lastSegment)).slice(0, 2000))
    }
    const finish = async () => {
      recRef.current = null
      const seg = lastSegment
      if (!seg) {
        setState('stopped')
        return
      }
      setState('formatting')
      try {
        const res = await fetch('/api/punctuate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: seg }),
        })
        if (res.ok) {
          const data = (await res.json()) as { text?: string }
          if (data.text) onText((base + data.text).slice(0, 2000))
        }
      } catch {
        // Rohtext bleibt stehen — Formatierung ist optional
      }
      setState('stopped')
    }
    rec.onend = finish
    rec.onerror = finish
    recRef.current = rec
    setState('recording')
    rec.start()
  }

  function stop() {
    recRef.current?.stop()
  }

  function reset() {
    recRef.current?.stop()
    setState('idle')
  }

  return { supported, state, start, stop, reset }
}
