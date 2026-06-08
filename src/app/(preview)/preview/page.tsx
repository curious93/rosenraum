'use client'

import { useState } from 'react'
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
      </div>
    </main>
  )
}
