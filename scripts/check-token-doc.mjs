#!/usr/bin/env node
// @ts-check
/**
 * CI gate: a change to design/tokens.json must be accompanied by a change to
 * docs/DESIGN_DECISIONS.md (token changes are design decisions — record why).
 *
 * Diff base: the PR base on GitHub (`origin/$GITHUB_BASE_REF`) when available,
 * else `HEAD~1`. Locally with no prior commit, it no-ops. Best-effort by design.
 *
 * Usage: node scripts/check-token-doc.mjs   (alias: npm run check:token-doc)
 */
import { execSync } from 'node:child_process'

/**
 * Run a git command, returning trimmed stdout or '' on failure.
 *
 * @param {string} cmd - The git command line.
 * @returns {string} stdout, trimmed; '' if the command errors.
 */
function git(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8' }).trim()
  } catch {
    return ''
  }
}

const base = process.env.GITHUB_BASE_REF
  ? `origin/${process.env.GITHUB_BASE_REF}`
  : 'HEAD~1'

const range = git(`git rev-parse ${base}`) ? `${base}...HEAD` : ''
if (!range) {
  console.log('✓ check:token-doc skipped (no diff base available)')
  process.exit(0)
}

const changed = git(`git diff --name-only ${range}`).split('\n').filter(Boolean)
const tokensChanged = changed.includes('design/tokens.json')
const docChanged = changed.includes('docs/DESIGN_DECISIONS.md')

if (tokensChanged && !docChanged) {
  console.error('✗ design/tokens.json changed but docs/DESIGN_DECISIONS.md did not.')
  console.error('  Record the rationale for the token change in docs/DESIGN_DECISIONS.md.')
  process.exit(1)
}
console.log('✓ check:token-doc ok')
