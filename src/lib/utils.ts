import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names with conflict resolution.
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 * @example
 * cn('px-4 py-2', condition && 'bg-red-500') // → 'px-4 py-2 bg-red-500'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
