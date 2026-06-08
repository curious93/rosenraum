'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Heart, Leaf, Sparkles, Check, Link2, MessageCircle, MessageSquare, BookOpen, Eye, Star, Palette } from 'lucide-react'
import { createRoom } from '@/lib/firestore'
import { ThemeSheet } from '@/components/ThemeSheet'

type CreateState = 'idle' | 'loading' | 'created'

interface CreatedRoom {
  roomId: string
  inviteCode: string
  inviteUrl: string
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

/**
 * Rosenraum Landing Page.
 * Erklärt GFK, zeigt den Nutzen der App und enthält einen Inline-Invite-Flow
 * zum Erstellen eines Raums mit QR-Code und Copy-URL.
 *
 * @returns Landingpage JSX
 */
export default function HomePage() {
  const router = useRouter()
  const quickCreateRef = useRef<HTMLElement>(null)
  const [name, setName] = useState('')
  const [createState, setCreateState] = useState<CreateState>('idle')
  const [createdRoom, setCreatedRoom] = useState<CreatedRoom | null>(null)
  const [copied, setCopied] = useState(false)
  const [showTheme, setShowTheme] = useState(false)

  function scrollToCreate() {
    quickCreateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  async function handleCreate() {
    if (createState !== 'idle') return
    setCreateState('loading')
    try {
      const { roomId, inviteCode } = await createRoom({
        participantName: name.trim() || undefined,
      })
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
      setCreatedRoom({ roomId, inviteCode, inviteUrl: `${baseUrl}/join/${inviteCode}` })
      setCreateState('created')
    } catch {
      setCreateState('idle')
    }
  }

  async function copyLink() {
    if (!createdRoom) return
    await navigator.clipboard.writeText(createdRoom.inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const problemCards = [
    {
      Icon: MessageCircle,
      title: 'Das unbeabsichtigte Vorwurf',
      quote: '"Du hörst mir nie zu."',
      body: 'Gemeint war: Ich vermisse das Gefühl, dass dir wichtig ist, was ich fühle. Die Sprache der Bewertung löst Verteidigung aus — nicht Verbindung.',
    },
    {
      Icon: MessageSquare,
      title: 'Das Schweigen',
      quote: null,
      body: 'Wenn Worte fehlen, schweigen wir. Oder wir sagen das Falsche. Nicht weil wir nichts fühlen — sondern weil uns niemand beigebracht hat, Gefühle in Worte zu fassen.',
    },
    {
      Icon: BookOpen,
      title: 'Das Wissen hilft nicht allein',
      quote: null,
      body: 'Gewaltfreie Kommunikation klingt in der Theorie einfach. Aber in echten Gesprächen, wenn Emotionen hochkommen, fallen wir in alte Muster zurück. GFK lernt man nicht durch Lesen. Man lernt es durch Üben — in echten Gesprächen.',
    },
  ]

  const gfkSteps = [
    {
      num: '①',
      Icon: Eye,
      title: 'Beobachtung',
      desc: 'Was passiert konkret — ohne Bewertung, ohne Interpretation?',
      example: '"Du bist dreimal zu spät gekommen" statt "Du bist immer unzuverlässig."',
    },
    {
      num: '②',
      Icon: Heart,
      title: 'Gefühl',
      desc: 'Wie fühle ich mich dabei?',
      example: '"Ich bin besorgt" statt "Du machst mich wahnsinnig."',
    },
    {
      num: '③',
      Icon: Leaf,
      title: 'Bedürfnis',
      desc: 'Welches Bedürfnis steckt dahinter?',
      example: '"Mir ist Verlässlichkeit wichtig" — ein Bedürfnis, das jeder Mensch kennt.',
    },
    {
      num: '④',
      Icon: Star,
      title: 'Bitte',
      desc: 'Was wünsche ich mir konkret?',
      example: '"Kannst du mir Bescheid geben, wenn du später kommst?"',
    },
  ]

  return (
    <div style={{ background: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>

      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-svh px-6 text-center"
        style={{ maxWidth: '680px', margin: '0 auto' }}
      >
        <motion.div
          className="space-y-6 w-full max-w-sm"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <Heart
              className="w-14 h-14 mx-auto"
              style={{ color: 'var(--color-primary)' }}
              fill="var(--color-primary-light)"
              aria-hidden="true"
            />
            <h1
              className="font-semibold tracking-tight"
              style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', color: 'var(--color-text-primary)' }}
            >
              Rosenraum
            </h1>
            <p
              className="text-xl font-medium leading-snug"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Für Gespräche, bei denen<br />es wirklich zählt.
            </p>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Ein privater Raum für zwei — mit sanfter KI-Unterstützung, wenn Worte schwer fallen.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-3">
            <button
              onClick={scrollToCreate}
              className="block w-full py-3.5 px-6 rounded-2xl text-white font-medium text-base transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: 'var(--color-primary)' }}
            >
              Raum erstellen
            </button>
            <button
              onClick={() => router.push('/join')}
              className="block w-full py-3.5 px-6 rounded-2xl text-base font-medium transition-opacity hover:opacity-80"
              style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
            >
              Ich habe einen Code
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll-Chevron */}
        <motion.div
          className="absolute bottom-8"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ color: 'var(--color-text-muted)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </section>

      {/* ── 2. PROBLEM-SECTION ───────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <motion.div
            className="space-y-10"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fadeUp} className="space-y-3 text-center">
              <h2
                className="text-2xl font-semibold leading-snug"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Wir reden den ganzen Tag. Aber manchmal kommen unsere Worte gar nicht an.
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Nicht weil wir keine Empathie hätten. Sondern weil unsere Sprache voller alter Muster steckt —
                Muster, die wir nie bewusst gewählt haben.
              </p>
            </motion.div>

            <div className="space-y-4">
              {problemCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  className="p-5 rounded-2xl space-y-2"
                  style={{ background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border-subtle)' }}
                >
                  <div className="flex items-center gap-2">
                    <card.Icon className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-primary)' }} aria-hidden="true" />
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {card.title}
                    </span>
                  </div>
                  {card.quote && (
                    <p className="text-base italic" style={{ color: 'var(--color-primary-dark)' }}>
                      {card.quote}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {card.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 3. GFK ERKLÄRT ───────────────────────────────────────────────────── */}
      <section
        className="px-6 py-20"
        style={{
          background: 'var(--color-bg-surface)',
          borderTop: '1px solid var(--color-border-subtle)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <motion.div
            className="space-y-10"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fadeUp} className="space-y-3 text-center">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Was ist Gewaltfreie Kommunikation?
              </h2>
              <p className="text-base leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Marshall Rosenberg entwickelte die GFK in den 1960er Jahren. Die Kernidee: Hinter jedem Konflikt
                stecken unerfüllte Bedürfnisse — keine bösen Absichten. GFK gibt uns eine Sprache,
                die verbindet statt zu trennen.
              </p>
            </motion.div>

            <div className="space-y-4">
              {gfkSteps.map((step, i) => (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  transition={{ delay: i * 0.08 }}
                  className="flex gap-4 p-4 rounded-2xl"
                  style={{ background: 'var(--color-bg-elevated)' }}
                >
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-primary-light)' }}
                  >
                    <step.Icon className="w-5 h-5" style={{ color: 'var(--color-primary-dark)' }} aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>{step.num}</span>
                      <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{step.title}</span>
                    </div>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{step.desc}</p>
                    <p className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>{step.example}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 4. SO FUNKTIONIERT ES ────────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <motion.div
            className="space-y-10"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.h2
              variants={fadeUp}
              className="text-2xl font-semibold text-center"
              style={{ color: 'var(--color-text-primary)' }}
            >
              In drei Schritten zu echten Gesprächen.
            </motion.h2>

            <div className="space-y-6">
              {[
                {
                  num: '1',
                  title: 'Raum erstellen & teilen',
                  desc: 'Erstelle in Sekunden einen privaten Raum. Teile den Link per QR-Code oder kopiere ihn direkt. Kein Account, kein Passwort.',
                },
                {
                  num: '2',
                  title: 'Schreib deine Nachricht',
                  desc: 'Schreib wie immer. Wenn du möchtest, zeigt dir Claude eine Formulierung im Geiste der GFK — weniger Vorwurf, mehr Verbindung.',
                },
                {
                  num: '3',
                  title: 'Du entscheidest',
                  desc: 'Sende deine Version oder die KI-Version — du hast immer die Wahl. Kein Druck, kein Urteil. Und mit jeder Nachricht lernst du ein bisschen mehr.',
                },
              ].map((step) => (
                <motion.div key={step.num} variants={fadeUp} className="flex gap-4 items-start">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--color-primary)', color: 'white' }}
                  >
                    {step.num}
                  </div>
                  <div className="space-y-1 pt-1">
                    <div className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      {step.title}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 5. ROSENBERG-ZITAT ───────────────────────────────────────────────── */}
      <section
        className="px-6 py-20 text-center"
        style={{
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border-subtle)',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        <motion.div
          style={{ maxWidth: '560px', margin: '0 auto' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div style={{ fontSize: '2.5rem', color: 'var(--color-primary-light)', lineHeight: 1 }}>&ldquo;</div>
          <blockquote
            className="text-lg font-medium leading-relaxed italic"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Hinter jeder Handlung — wie ineffektiv, tragisch oder gewaltsam sie uns auch erscheinen mag —
            steckt der Versuch, ein Bedürfnis zu erfüllen.
          </blockquote>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            — Marshall Rosenberg, Begründer der Gewaltfreien Kommunikation
          </p>
        </motion.div>
      </section>

      {/* ── 6. QUICK-CREATE ──────────────────────────────────────────────────── */}
      <section
        ref={quickCreateRef}
        id="quick-create"
        className="px-6 py-20"
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Starte jetzt.
              </h2>
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Erstelle deinen Raum in einer Sekunde — kein Account nötig.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {createState !== 'created' ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-sm mx-auto space-y-3"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleCreate()}
                    placeholder="Dein Name (optional)"
                    maxLength={30}
                    className="w-full px-4 py-3 rounded-xl text-base outline-none border"
                    style={{
                      background: 'var(--color-bg-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  />
                  <button
                    onClick={handleCreate}
                    disabled={createState === 'loading'}
                    className="w-full py-3.5 px-6 rounded-2xl text-white font-medium text-base transition-opacity disabled:opacity-60"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {createState === 'loading' ? 'Raum wird erstellt…' : 'Raum erstellen →'}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="created"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                  className="max-w-sm mx-auto space-y-4"
                >
                  <div className="text-center space-y-2">
                    <Heart
                      className="w-8 h-8 mx-auto"
                      style={{ color: 'var(--color-primary)' }}
                      fill="var(--color-primary-light)"
                      aria-hidden="true"
                    />
                    <p className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                      Dein Raum ist bereit.
                    </p>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                      Teile diesen Link mit der Person, mit der du sprechen möchtest.
                    </p>
                  </div>

                  <motion.div
                    className="flex justify-center"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25, delay: 0.1 }}
                  >
                    <div className="p-4 rounded-2xl" style={{ background: 'var(--color-bg-elevated)' }}>
                      <QRCodeSVG
                        value={createdRoom!.inviteUrl}
                        size={160}
                        bgColor="transparent"
                        fgColor="var(--color-text-primary)"
                        level="M"
                      />
                    </div>
                  </motion.div>

                  <div
                    className="text-center py-3 rounded-2xl"
                    style={{ background: 'var(--color-bg-elevated)' }}
                  >
                    <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Einladungscode</div>
                    <div
                      className="text-2xl font-bold tracking-widest font-mono"
                      style={{ color: 'var(--color-text-primary)', letterSpacing: '0.2em' }}
                    >
                      {createdRoom!.inviteCode}
                    </div>
                  </div>

                  <button
                    onClick={copyLink}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-base font-medium transition-opacity hover:opacity-80"
                    style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }}
                  >
                    {copied ? (
                      <><Check className="w-4 h-4" aria-hidden="true" /> Link kopiert!</>
                    ) : (
                      <><Link2 className="w-4 h-4" aria-hidden="true" /> Link kopieren</>
                    )}
                  </button>

                  <button
                    onClick={() => router.push(`/room/${createdRoom!.roomId}`)}
                    className="w-full py-3.5 px-6 rounded-2xl text-white font-medium text-base transition-opacity hover:opacity-90"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    Raum betreten →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ── 7. FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-10 text-center space-y-2"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <p className="text-sm font-medium flex items-center justify-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
          <Heart className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-primary)' }} fill="var(--color-primary)" aria-hidden="true" />
          Rosenraum — Ein Raum für echte Gespräche.
        </p>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Kein Tracking. Kein Account. Keine Daten.
        </p>
        <button
          onClick={() => setShowTheme(true)}
          className="inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-70 mt-1"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <Palette className="w-3.5 h-3.5" aria-hidden="true" /> Stil ändern
        </button>
      </footer>

      {/* ── Theme Sheet ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showTheme && <ThemeSheet onClose={() => setShowTheme(false)} />}
      </AnimatePresence>

    </div>
  )
}
