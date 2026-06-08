#!/usr/bin/env node
// @ts-check
/**
 * CI gate: fail on hardcoded hex colours in component/style source.
 *
 * Scans src/**\/*.{tsx,css} for `#rgb` / `#rrggbb` literals — colours belong in
 * design/tokens.json and are consumed via semantic CSS vars. Excluded:
 *   - src/app/tokens.generated.css  (the generated token layer)
 *   - src/lib/theme.ts              (.ts; intentional swatch hexes for the picker)
 * rgba()/transparent overlays and shadows are allowed (neutral, not brand colour).
 *
 * Usage: node scripts/check-no-hardcoded-colors.mjs   (alias: npm run check:colors)
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, relative } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const HEX = /#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/
const SCAN = /\.(tsx|css)$/
const EXCLUDE = new Set([join(SRC, 'app', 'tokens.generated.css')])

/**
 * Recursively collect scannable files under a directory.
 *
 * @param {string} dir - Directory to walk.
 * @returns {string[]} Absolute file paths matching the scan extensions.
 */
function walk(dir) {
  /** @type {string[]} */
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (SCAN.test(full) && !EXCLUDE.has(full)) out.push(full)
  }
  return out
}

/** @type {string[]} */
const offenders = []
for (const file of walk(SRC)) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (HEX.test(line)) offenders.push(`${relative(ROOT, file)}:${i + 1}  ${line.trim().slice(0, 80)}`)
  })
}

if (offenders.length) {
  console.error(`✗ Hardcoded hex colour(s) found — use tokens (design/tokens.json) via semantic vars:\n`)
  offenders.forEach(o => console.error('  ' + o))
  process.exit(1)
}
console.log('✓ No hardcoded hex colours in src/**/*.{tsx,css}')
