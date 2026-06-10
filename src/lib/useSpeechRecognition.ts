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

/** Zustand einer Sprachaufnahme */
export type SpeechRecState = 'idle' | 'recording' | 'stopped'

/**
 * Live-Spracherkennung (de-DE) über die Web Speech API.
 * Liefert Zwischenergebnisse in Echtzeit; nach dem Stopp bleibt der Text frei editierbar.
 *
 * @returns Objekt mit: `supported` (Browser-Support, SSR-sicher false) · `state` ('idle' | 'recording' | 'stopped') ·
 * `start(base, onText)` (startet, `base` vorangestellt, `onText` erhält Gesamttext live) · `stop()` · `reset()`
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
    rec.onresult = (e) => {
      let finals = ''
      let interim = ''
      for (let i = 0; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finals += r[0].transcript
        else interim += r[0].transcript
      }
      onText((base + finals + interim).slice(0, 2000))
    }
    rec.onend = () => {
      recRef.current = null
      setState('stopped')
    }
    rec.onerror = () => {
      recRef.current = null
      setState('stopped')
    }
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
