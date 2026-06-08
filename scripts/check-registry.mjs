#!/usr/bin/env node
// @ts-check
/**
 * Soft gate (always exits 0): warn about components under src/components/ that
 * aren't referenced in docs/COMPONENT_REGISTRY.md. A nudge, not a blocker —
 * reviewers decide whether a new component needs an entry.
 *
 * Excludes src/components/ui/** (vendored primitives, documented as a group).
 *
 * Usage: node scripts/check-registry.mjs   (alias: npm run check:registry)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const COMPONENTS = join(ROOT, 'src', 'components')
const REGISTRY = join(ROOT, 'docs', 'COMPONENT_REGISTRY.md')
const UI = join(COMPONENTS, 'ui')

/**
 * Recursively collect .tsx component files, excluding the ui/ primitives dir.
 *
 * @param {string} dir - Directory to walk.
 * @returns {string[]} Absolute .tsx paths.
 */
function walk(dir) {
  /** @type {string[]} */
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (full.startsWith(UI)) continue
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (full.endsWith('.tsx')) out.push(full)
  }
  return out
}

const registry = readFileSync(REGISTRY, 'utf8')
const missing = walk(COMPONENTS).filter(f => !registry.includes(relative(ROOT, f).replace(/\\/g, '/')))

if (missing.length) {
  console.warn('⚠ Components not referenced in docs/COMPONENT_REGISTRY.md:')
  missing.forEach(f => console.warn('  ' + relative(ROOT, f)))
  console.warn('  Add an entry if the component is reusable.')
} else {
  console.log('✓ All src/components/* are referenced in COMPONENT_REGISTRY.md')
}
process.exit(0)
