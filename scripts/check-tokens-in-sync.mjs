#!/usr/bin/env node
// @ts-check
/**
 * CI gate: fail if src/app/tokens.generated.css is stale relative to
 * design/tokens.json. Regenerates and compares byte-for-byte.
 *
 * Usage: node scripts/check-tokens-in-sync.mjs   (alias: npm run check:tokens)
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src', 'app', 'tokens.generated.css')

const before = readFileSync(OUT, 'utf8')
execSync('node scripts/build-tokens.mjs', { cwd: ROOT, stdio: 'ignore' })
const after = readFileSync(OUT, 'utf8')

if (before !== after) {
  console.error('✗ tokens.generated.css is stale. Run `npm run tokens` and commit the result.')
  process.exit(1)
}
console.log('✓ tokens.generated.css in sync with design/tokens.json')
