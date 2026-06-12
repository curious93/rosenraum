'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Heart,
  Leaf,
  Sparkles,
  Check,
  Link2,
  MessageCircle,
  MessageSquare,
  BookOpen,
  Eye,
  Palette,
  Users,
  Briefcase,
  Lightbulb,
} from 'lucide-react'
import { createRoom } from '@/lib/firestore'
import { morphIn, morphOut, morphTo } from '@/lib/motion'
import { ThemeSheet } from '@/components/ThemeSheet'
import { FeedbackSheet } from '@/components/feedback/FeedbackSheet'

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
  const [showFeedback, setShowFeedback] = useState(false)

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

  return (
    <div style={{ background: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>
      {/* ── 1. HERO ──────────────────────────────────────────────────────────── */}
      <section
        className="relative flex flex-col items-center justify-center min-h-svh px-6 text-center"
        style={{ maxWidth: '680px', margin: '0 auto' }}
      >
        {/* Palette-Button oben rechts */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileTap={{ scale: 0.88 }}
          onClick={() => setShowTheme(true)}
          className="icon-spin-hover absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ color: 'var(--color-text-muted)', background: 'var(--color-bg-elevated)' }}
          aria-label="Stil ändern"
        >
          <Palette size={15} aria-hidden="true" />
        </motion.button>
        <motion.div
          className="space-y-6 w-full max-w-sm"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={fadeUp} className="space-y-3">
            <Heart
              className="w-14 h-14 mx-auto"
              style={{
                color: 'var(--color-primary)',
                filter:
                  'drop-shadow(0 0 10px color-mix(in srgb, var(--color-primary) 30%, transparent))',
              }}
              fill="var(--color-primary-light)"
              aria-hidden="true"
            />
            <h1
              className="font-semibold tracking-tight title-breathe"
              style={{
                fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                color: 'var(--color-text-primary)',
              }}
            >
              Rosenraum
            </h1>
            <p
              className="text-xl font-medium leading-snug"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Für Gespräche, bei denen
              <br />
              es wirklich zählt.
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
              className="glow-primary block w-full py-3.5 px-6 rounded-2xl text-primary-foreground font-medium text-base transition-opacity hover:opacity-90 active:opacity-80"
              style={{ background: 'var(--color-primary)' }}
            >
              Raum erstellen
            </button>
            <button
              onClick={() => router.push('/join')}
              className="block w-full py-3.5 px-6 rounded-2xl text-base font-medium transition-opacity hover:opacity-80"
              style={{
                background: 'var(--color-bg-elevated)',
                color: 'var(--color-text-secondary)',
              }}
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
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Nicht weil wir keine Empathie hätten. Sondern weil unsere Sprache voller alter
                Muster steckt — Muster, die wir nie bewusst gewählt haben.
              </p>
            </motion.div>

            <div className="space-y-4">
              {problemCards.map((card) => (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  className="p-5 rounded-2xl space-y-2"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <card.Icon
                      className="w-5 h-5 flex-shrink-0"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden="true"
                    />
                    <span
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {card.title}
                    </span>
                  </div>
                  {card.quote && (
                    <p className="text-base italic" style={{ color: 'var(--color-primary-dark)' }}>
                      {card.quote}
                    </p>
                  )}
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
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
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Marshall Rosenberg entwickelte die GFK in den 1960er Jahren. Die Kernidee: Hinter
                jedem Konflikt stecken unerfüllte Bedürfnisse — keine bösen Absichten. GFK gibt uns
                eine Sprache, die verbindet statt zu trennen.
              </p>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="space-y-4 text-base leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <p>
                Gewaltfreie Kommunikation basiert auf einer einfachen Idee: Hinter jedem Angriff,
                jedem Schweigen, jeder Überreaktion steckt ein unerfülltes Bedürfnis. Kein böser
                Wille — nur eine Sprache, die uns nicht beigebracht wurde.
              </p>
              <p>
                Marshall Rosenberg entwickelte in den 1960er Jahren einen Weg, diese Bedürfnisse
                sichtbar zu machen — ohne Vorwurf, ohne Urteil, ohne Schuld. Aus der Ich-Perspektive
                statt aus der Anklage.
              </p>
              <p>
                Rosenraum bringt diese Idee in echte Gespräche. Nicht als Theorie, sondern als
                sanfte Einladung — Nachricht für Nachricht.
              </p>
            </motion.div>
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
              In vier Schritten zu echten Gesprächen.
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
                  desc: 'Sende deine Version oder die KI-Version — du hast immer die Wahl. Kein Druck, kein Urteil.',
                },
                {
                  num: '4',
                  title: 'Aktives Lernen',
                  desc: 'Mit jeder Nachricht siehst du, was sich verändert hat — als stille Einladung zur Reflexion, nicht als Bewertung.',
                },
              ].map((step) => (
                <motion.div key={step.num} variants={fadeUp} className="flex gap-4 items-start">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
                  >
                    {step.num}
                  </div>
                  <div className="space-y-1 pt-1">
                    <div
                      className="text-base font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {step.title}
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
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
          <div style={{ fontSize: '2.5rem', color: 'var(--color-primary-light)', lineHeight: 1 }}>
            &ldquo;
          </div>
          <blockquote
            className="text-lg font-medium leading-relaxed italic"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Hinter jeder Handlung — wie ineffektiv, tragisch oder gewaltsam sie uns auch erscheinen
            mag — steckt der Versuch, ein Bedürfnis zu erfüllen.
          </blockquote>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            — Marshall Rosenberg, Begründer der Gewaltfreien Kommunikation
          </p>
        </motion.div>
      </section>

      {/* ── 6. FÜR WEN? ─────────────────────────────────────────────────────── */}
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
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Für wen ist Rosenraum?
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Immer dann, wenn es um mehr geht als nur Informationen auszutauschen.
              </p>
            </motion.div>

            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  Icon: Heart,
                  title: 'Paare',
                  desc: 'Wenn alte Muster die Verbindung blockieren und ein Gespräch wichtiger ist als Recht haben.',
                },
                {
                  Icon: Users,
                  title: 'Familien',
                  desc: 'Für schwierige Themen zwischen Eltern, Kindern oder Geschwistern — mit mehr Geduld als im Alltag.',
                },
                {
                  Icon: Briefcase,
                  title: 'Teams',
                  desc: 'Wenn Feedback gegeben oder empfangen werden muss, ohne dass jemand das Gesicht verliert.',
                },
                {
                  Icon: MessageCircle,
                  title: 'Freundschaften',
                  desc: 'Für den Moment, wo etwas zwischen euch steht und du nicht weißt, wie du es ansprechen sollst.',
                },
              ].map((card) => (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  className="p-4 rounded-2xl space-y-2.5"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: 'var(--color-primary-light)' }}
                  >
                    <card.Icon
                      className="w-4.5 h-4.5"
                      style={{ color: 'var(--color-primary-dark)' }}
                      aria-hidden="true"
                    />
                  </div>
                  <div
                    className="text-sm font-semibold"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {card.title}
                  </div>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {card.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 7. WAS PASSIERT MIT MEINER NACHRICHT? ────────────────────────────── */}
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
                Was passiert mit meiner Nachricht?
              </h2>
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Die KI liest deinen Text nicht um zu urteilen — sondern um zuzuhören.
              </p>
            </motion.div>

            <div className="relative space-y-0">
              {[
                {
                  Icon: Eye,
                  step: '1',
                  title: 'Bewertungen erkennen',
                  desc: 'Die KI erkennt Formulierungen, die als Vorwurf ankommen könnten — auch wenn sie das gar nicht so gemeint sind. "Du machst immer…" oder "Du bist nie…"',
                },
                {
                  Icon: Heart,
                  step: '2',
                  title: 'Gefühle freilegen',
                  desc: 'Hinter jedem Vorwurf steckt ein Gefühl. Die KI sucht nach dem, was du eigentlich ausdrücken möchtest — Enttäuschung, Sehnsucht, Erschöpfung.',
                },
                {
                  Icon: Leaf,
                  step: '3',
                  title: 'Bedürfnisse benennen',
                  desc: 'Sie formuliert dein Anliegen als Ich-Botschaft: konkret, ehrlich und ohne Schuldzuweisung.',
                },
                {
                  Icon: Sparkles,
                  step: '4',
                  title: 'Du entscheidest',
                  desc: 'Der Vorschlag ist ein Angebot — kein Urteil. Du sendest, was sich richtig anfühlt. Immer.',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  variants={fadeUp}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-4 items-start"
                >
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center z-10 relative"
                      style={{
                        background: 'var(--color-primary)',
                        color: 'var(--color-on-primary)',
                      }}
                    >
                      <item.Icon className="w-4.5 h-4.5" aria-hidden="true" />
                    </div>
                    {i < 3 && (
                      <div
                        className="w-px flex-1 mt-1 mb-1"
                        style={{ background: 'var(--color-border)', height: '28px' }}
                      />
                    )}
                  </div>
                  <div className="pb-5 pt-1 space-y-1">
                    <div
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {item.title}
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 8. TIPPS FÜR GUTE GESPRÄCHE ─────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <motion.div
            className="space-y-8"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fadeUp} className="space-y-2 text-center">
              <h2 className="text-2xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                Tipps für gute Gespräche
              </h2>
              <p className="text-base" style={{ color: 'var(--color-text-secondary)' }}>
                Nicht als Regeln — sondern als Einladung.
              </p>
            </motion.div>

            <div className="space-y-3">
              {[
                {
                  tip: 'Sprich von dir, nicht über die andere Person.',
                  detail: '"Ich fühle mich allein" trifft anders als "Du bist nie da für mich."',
                },
                {
                  tip: 'Beobachte, bevor du interpretierst.',
                  detail: 'Was ist wirklich passiert — ohne Deutung, ohne Geschichte drumherum?',
                },
                {
                  tip: 'Bedürfnisse sind keine Vorwürfe.',
                  detail:
                    'Wenn du sagst, was du brauchst, gibst du der anderen Person eine Chance — keine Schuld.',
                },
                {
                  tip: 'Stille ist manchmal das Klügste.',
                  detail:
                    'Wenn du in Rage bist, ist jetzt vielleicht nicht der Moment für das Gespräch. Rosenraum wartet.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex gap-3 p-4 rounded-2xl"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                  }}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Lightbulb
                      className="w-4 h-4"
                      style={{ color: 'var(--color-primary)' }}
                      aria-hidden="true"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <div
                      className="text-sm font-medium"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {item.tip}
                    </div>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      {item.detail}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 9. QUICK-CREATE ──────────────────────────────────────────────────── */}
      <section ref={quickCreateRef} id="quick-create" className="px-6 py-20">
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
                  initial={morphIn}
                  animate={morphTo}
                  exit={morphOut}
                  className="max-w-sm mx-auto space-y-3"
                >
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
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
                    className="glow-primary w-full py-3.5 px-6 rounded-2xl text-primary-foreground font-medium text-base transition-opacity disabled:opacity-60"
                    style={{ background: 'var(--color-primary)' }}
                  >
                    {createState === 'loading' ? 'Raum wird erstellt…' : 'Raum erstellen →'}
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="created"
                  initial={morphIn}
                  animate={morphTo}
                  exit={morphOut}
                  className="max-w-sm mx-auto space-y-4"
                >
                  <div className="text-center space-y-2">
                    <Heart
                      className="w-8 h-8 mx-auto"
                      style={{ color: 'var(--color-primary)' }}
                      fill="var(--color-primary-light)"
                      aria-hidden="true"
                    />
                    <p
                      className="text-xl font-semibold"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
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
                    <div
                      className="p-4 rounded-2xl"
                      style={{ background: 'var(--color-bg-elevated)' }}
                    >
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
                    <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                      Einladungscode
                    </div>
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
                    style={{
                      background: 'var(--color-bg-elevated)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" aria-hidden="true" /> Link kopiert!
                      </>
                    ) : (
                      <>
                        <Link2 className="w-4 h-4" aria-hidden="true" /> Link kopieren
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => router.push(`/room/${createdRoom!.roomId}`)}
                    className="glow-primary w-full py-3.5 px-6 rounded-2xl text-primary-foreground font-medium text-base transition-opacity hover:opacity-90"
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

      {/* ── 10. FEEDBACK ─────────────────────────────────────────────────────── */}
      <section
        className="px-6 py-16 text-center"
        style={{
          background: 'var(--color-bg-elevated)',
          borderTop: '1px solid var(--color-border-subtle)',
        }}
      >
        <motion.div
          style={{ maxWidth: '480px', margin: '0 auto' }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Deine Meinung macht Rosenraum besser.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
            Rosenraum ist ein kleines Projekt mit großer Idee. Was hat gut funktioniert? Was war
            schwierig? Jede Rückmeldung hilft uns.
          </p>
          <motion.button
            onClick={() => setShowFeedback(true)}
            whileTap={{ scale: 0.96 }}
            className="glow-primary inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            Feedback geben 🌸
          </motion.button>
        </motion.div>
      </section>

      {/* ── 11. FOOTER ───────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-10 text-center space-y-2"
        style={{ borderTop: '1px solid var(--color-border-subtle)' }}
      >
        <p
          className="text-sm font-medium flex items-center justify-center gap-1.5"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          <Heart
            className="w-4 h-4 flex-shrink-0"
            style={{ color: 'var(--color-primary)' }}
            fill="var(--color-primary)"
            aria-hidden="true"
          />
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

      {/* ── Feedback Sheet ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showFeedback && <FeedbackSheet source="landing" onClose={() => setShowFeedback(false)} />}
      </AnimatePresence>
    </div>
  )
}
