'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Toaster, toast } from '@/components/ui/sonner'
import { EmptyState, LoadingState, ErrorState } from '@/components/ui/states'
import { icons } from '@/lib/icons'
import { THEMES, getStoredTheme, applyTheme, getStoredMode, applyMode, type ColorMode } from '@/lib/theme'

/** One labelled section in the gallery. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{title}</h2>
      <div className="flex flex-wrap items-start gap-3 rounded-2xl border border-border bg-card p-5">{children}</div>
    </section>
  )
}

/** Isolated preview gallery for every registered primitive, in light + dark. Dev-only. */
export default function PreviewPage() {
  const [mode, setMode] = useState<ColorMode>(getStoredMode)
  const [preset, setPreset] = useState(getStoredTheme)

  function pickMode(m: ColorMode) { setMode(m); applyMode(m) }
  function pickPreset(p: typeof preset) { setPreset(p); applyTheme(p) }

  const Search = icons.search
  const Settings = icons.settings

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: 'var(--color-bg-page)', color: 'var(--color-text-primary)' }}>
      <Toaster />
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold">Component Preview</h1>
          <div className="flex flex-wrap gap-2">
            {(['light', 'dark', 'system'] as ColorMode[]).map(m => (
              <Button key={m} size="sm" variant={mode === m ? 'default' : 'outline'} onClick={() => pickMode(m)}>{m}</Button>
            ))}
            <span className="w-px self-stretch bg-border" />
            {THEMES.map(t => (
              <Button key={t.id} size="sm" variant={preset === t.id ? 'default' : 'outline'} onClick={() => pickPreset(t.id)}>{t.name}</Button>
            ))}
          </div>
        </header>

        <Section title="Buttons">
          <Button>Primär</Button>
          <Button variant="secondary">Sekundär</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Löschen</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Klein</Button>
          <Button size="lg">Groß</Button>
          <Button size="icon" aria-label="Einstellungen"><Settings /></Button>
          <Button disabled>Deaktiviert</Button>
        </Section>

        <Section title="Badges">
          <Badge>Standard</Badge>
          <Badge variant="secondary">Sekundär</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="success"><icons.success /> Erfolg</Badge>
          <Badge variant="warning"><icons.warning /> Warnung</Badge>
          <Badge variant="destructive"><icons.error /> Fehler</Badge>
        </Section>

        <Section title="Card">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Kartentitel</CardTitle>
              <CardDescription>Eine kurze, ruhige Beschreibung.</CardDescription>
            </CardHeader>
            <CardContent><p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Inhalt der Karte.</p></CardContent>
            <CardFooter><Button size="sm">Aktion</Button><Button size="sm" variant="ghost">Abbrechen</Button></CardFooter>
          </Card>
        </Section>

        <Section title="Form field">
          <div className="w-full max-w-sm space-y-1.5">
            <label htmlFor="pv-name" className="text-sm font-medium">Dein Name</label>
            <Input id="pv-name" placeholder="z.B. Lena" aria-describedby="pv-name-help" />
            <p id="pv-name-help" className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Optional — du kannst anonym bleiben.</p>
          </div>
        </Section>

        <Section title="Search field">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} aria-hidden="true" />
            <Input className="pl-9" placeholder="Suchen…" aria-label="Suche" />
          </div>
        </Section>

        <Section title="Dialog">
          <Dialog>
            <DialogTrigger asChild><Button variant="outline">Dialog öffnen</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Raum löschen?</DialogTitle>
                <DialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild><Button variant="ghost">Abbrechen</Button></DialogClose>
                <Button variant="destructive">Löschen</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </Section>

        <Section title="Dropdown menu">
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="outline">Menü</Button></DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
              <DropdownMenuItem><icons.copy /> Kopieren</DropdownMenuItem>
              <DropdownMenuItem><icons.edit /> Bearbeiten</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem style={{ color: 'var(--color-destructive)' }}><icons.delete /> Löschen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Section title="Toast / Notification">
          <Button variant="outline" onClick={() => toast('Link kopiert!')}>Info-Toast</Button>
          <Button variant="outline" onClick={() => toast.success('Raum erstellt.')}>Erfolg</Button>
          <Button variant="outline" onClick={() => toast.error('Etwas ist schiefgelaufen.')}>Fehler</Button>
        </Section>

        <Section title="Table">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Beigetreten</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Lena</TableCell><TableCell><Badge variant="success">aktiv</Badge></TableCell><TableCell>heute</TableCell></TableRow>
              <TableRow><TableCell>Max</TableCell><TableCell><Badge variant="outline">eingeladen</Badge></TableCell><TableCell>—</TableCell></TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Empty state">
          <EmptyState className="w-full" icon="emptyMessages" title="Noch keine Nachrichten" description="Warte auf deinen Gesprächspartner…" action={<Button size="sm">Einladen</Button>} />
        </Section>

        <Section title="Loading state">
          <LoadingState className="w-full" rows={2} />
        </Section>

        <Section title="Error state">
          <ErrorState className="w-full" title="Verbindung verloren" description="Wir konnten den Raum nicht laden." action={<Button size="sm" variant="outline">Erneut versuchen</Button>} />
        </Section>

        <Section title="Animationen">
          <AnimationShowcase />
        </Section>
      </div>
    </main>
  )
}

/** Interaktive Showcase-Sektion für alle Animations-Patterns */
function AnimationShowcase() {
  const [bubbleKey, setBubbleKey] = useState(0)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [dotVisible, setDotVisible] = useState(true)
  const [bounceKey, setBounceKey] = useState(0)
  const [shimmerVisible, setShimmerVisible] = useState(true)

  return (
    <div className="w-full space-y-6">
      {/* Spring Button */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Spring Button</p>
        <motion.button
          key={bounceKey}
          onClick={() => setBounceKey(k => k + 1)}
          whileTap={{ scale: 0.82 }}
          animate={bounceKey > 0 ? { scale: [1, 1.18, 0.95, 1.05, 1] } : {}}
          transition={{ type: 'spring', stiffness: 600, damping: 20 }}
          className="px-5 py-2.5 rounded-2xl text-sm font-medium"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
        >
          Klick mich ✦
        </motion.button>
      </div>

      {/* Chat Bubble Pop */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Chat Bubble — Pop-Animation</p>
        <div className="flex flex-col gap-2 min-h-[80px]">
          <AnimatePresence>
            <motion.div
              key={bubbleKey}
              initial={{ opacity: 0, scale: 0.75, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22, mass: 0.6 }}
              className="self-end px-4 py-2.5 rounded-[18px_18px_4px_18px] text-sm"
              style={{ background: 'var(--color-bubble-own)', color: 'var(--color-text-primary)', maxWidth: '240px' }}
            >
              Ich wünsche mir mehr Zeit mit dir. 💬
            </motion.div>
          </AnimatePresence>
        </div>
        <Button size="sm" variant="outline" onClick={() => setBubbleKey(k => k + 1)}>Bubble neu abspielen</Button>
      </div>

      {/* Shimmer Skeleton */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Shimmer Skeleton (GFK lädt…)</p>
        <AnimatePresence>
          {shimmerVisible && (
            <div className="space-y-1.5">
              {[100, 85, 60].map((w, i) => (
                <div
                  key={i}
                  className="h-3 rounded-full relative overflow-hidden"
                  style={{ width: `${w}%`, background: 'var(--color-skeleton)' }}
                >
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(90deg, transparent 0%, var(--color-bg-elevated) 50%, transparent 100%)' }}
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: 'linear', delay: i * 0.1 }}
                  />
                </div>
              ))}
            </div>
          )}
        </AnimatePresence>
        <Button size="sm" variant="outline" onClick={() => setShimmerVisible(v => !v)}>
          {shimmerVisible ? 'Skeleton ausblenden' : 'Skeleton einblenden'}
        </Button>
      </div>

      {/* Lern-Dot */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Lern-Dot (nach Senden)</p>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {dotVisible && (
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [0, 1.4, 1] }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: 'var(--color-dot-learning)' }}
              />
            )}
          </AnimatePresence>
          <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Lernpunkt sichtbar</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setDotVisible(v => !v)}>Dot toggling</Button>
      </div>

      {/* Bottom Sheet */}
      <div className="space-y-2">
        <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>Bottom Sheet Slide-in</p>
        <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)}>Sheet öffnen</Button>
        <AnimatePresence>
          {sheetOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40"
                style={{ background: 'rgba(0,0,0,0.2)' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSheetOpen(false)}
              />
              <motion.div
                className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl px-5 pt-5 pb-8"
                style={{ background: 'var(--color-bg-surface)', boxShadow: '0 -4px 24px rgba(0,0,0,0.10)', maxWidth: '720px', margin: '0 auto' }}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              >
                <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--color-border)' }} />
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>Bottom Sheet</p>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>Spring slide-in, damping 28, stiffness 320.</p>
                <Button onClick={() => setSheetOpen(false)}>Schließen</Button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
