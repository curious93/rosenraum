import * as React from 'react'
import { cn } from '@/lib/utils'
import { icons, type IconName } from '@/lib/icons'

/** Shared props for the state placeholders. */
interface StateProps {
  /** Headline — warm and human, never technical. */
  title: string
  /** Optional supporting line. */
  description?: string
  /** Optional action node (e.g. a Button). */
  action?: React.ReactNode
  /** Extra classes for the wrapper. */
  className?: string
}

/**
 * Empty state — inviting, never a dead end. Always offer the next action.
 *
 * @param props - State props plus a semantic `icon` key.
 * @param props.icon - Icon name from the semantic icon map.
 * @returns Empty-state block.
 */
export function EmptyState({
  icon = 'emptyInbox',
  title,
  description,
  action,
  className,
}: StateProps & { icon?: IconName }) {
  const Icon = icons[icon]
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)}>
      <Icon className="size-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

/**
 * Loading state — skeleton bars that hint at the final layout. Prefer over a
 * bare spinner for content areas.
 *
 * @param props - Optional row count + classes.
 * @param props.rows - Number of skeleton rows to render.
 * @returns Loading-state block.
 */
export function LoadingState({ rows = 3, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn('space-y-3 p-6', className)} role="status" aria-label="Wird geladen">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-4 w-2/3 animate-pulse rounded-md" style={{ background: 'var(--color-skeleton)' }} />
          <div className="h-4 w-full animate-pulse rounded-md" style={{ background: 'var(--color-skeleton)' }} />
        </div>
      ))}
    </div>
  )
}

/**
 * Error state — plain language, a cause, and a recovery action. No codes or
 * stack traces in the UI.
 *
 * @param props - State props; `action` should let the user retry.
 * @returns Error-state block.
 */
export function ErrorState({ title, description, action, className }: StateProps) {
  const Icon = icons.error
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3 px-6 py-12 text-center', className)} role="alert">
      <Icon className="size-10" style={{ color: 'var(--color-destructive)' }} aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-medium text-foreground">{title}</p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}
