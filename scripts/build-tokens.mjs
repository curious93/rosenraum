#!/usr/bin/env node
// @ts-check
/**
 * Token build step — single source of truth.
 *
 * Reads design/tokens.json and emits src/app/tokens.generated.css:
 *   - `@theme` block      → primitive scales become Tailwind v4 utilities
 *   - `@theme inline`     → shadcn/ui color names bridge onto Rosenraum semantic vars
 *   - `:root`             → primitives (raw) + default preset light + status defaults + bridge indirection
 *   - `[data-theme="x"]`  → per-preset light overrides
 *   - `.dark` scopes      → per-preset dark overrides (when present in tokens.json)
 *
 * The generated file is committed so the app builds without this script; CI
 * verifies it stays in sync (scripts/check-tokens-in-sync.mjs).
 *
 * Usage: node scripts/build-tokens.mjs   (alias: npm run tokens)
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'design', 'tokens.json')
const OUT = join(ROOT, 'src', 'app', 'tokens.generated.css')

/** @type {any} */
const t = JSON.parse(readFileSync(SRC, 'utf8'))

/**
 * Render a flat object as `  --prefix-key: value;` lines.
 *
 * @param {Record<string,string>} obj - Key/value token map.
 * @param {string} prefix - CSS custom-property prefix (without trailing dash).
 * @param {string} indent - Leading whitespace per line.
 * @returns {string} Newline-joined declaration lines.
 */
function decls(obj, prefix, indent = '  ') {
  return Object.entries(obj)
    .map(([k, v]) => `${indent}--${prefix}-${k}: ${v};`)
    .join('\n')
}

/**
 * Merge status defaults under a preset's own values for a given mode.
 *
 * @param {string} mode - 'light' or 'dark'.
 * @param {Record<string,string>} presetMode - The preset's mode-specific tokens.
 * @returns {Record<string,string>} Complete semantic map for the mode.
 */
function withStatus(mode, presetMode) {
  return { ...t.semantic.statusDefaults[mode], ...presetMode }
}

/**
 * Emit semantic `--color-*` declarations for one preset/mode.
 *
 * @param {Record<string,string>} semantic - Resolved semantic token map.
 * @param {string} indent - Leading whitespace per line.
 * @returns {string} Declaration lines.
 */
function semanticDecls(semantic, indent = '  ') {
  return t.semantic.tokens
    .filter((/** @type {string} */ name) => semantic[name] !== undefined)
    .map((/** @type {string} */ name) => `${indent}--color-${name}: ${semantic[name]};`)
    .join('\n')
}

const p = t.primitive
const defaultPreset = t.semantic.presets[t.meta.defaultPreset]

// ── @theme: primitives become Tailwind utilities ─────────────────────────────
const themeBlock = [
  '@theme {',
  decls(p.radius, 'radius'),
  decls(p.shadow, 'shadow'),
  decls(p.motion, 'ease').split('\n').filter(l => l.includes('--ease')).join('\n'),
  Object.entries(p.motion)
    .filter(([k]) => k.startsWith('duration'))
    .map(([k, v]) => `  --${k}: ${v};`)
    .join('\n'),
  `  --font-body: ${p.typography['font-body']};`,
  '}',
].join('\n')

// ── @theme inline: shadcn color names → Rosenraum semantic vars ──────────────
const bridgeTheme = [
  '@theme inline {',
  Object.keys(t.bridge.map)
    .map(name => `  --color-${name}: var(--${name});`)
    .join('\n'),
  '  --radius-sm: calc(var(--radius-md) - 4px);',
  '  --radius-lg: var(--radius-bubble);',
  '}',
].join('\n')

// ── :root — primitives (raw) + default light + bridge indirection ────────────
const bridgeDecls = Object.entries(t.bridge.map)
  .map(([shadcn, semantic]) => `  --${shadcn}: var(--color-${semantic});`)
  .join('\n')

const root = [
  ':root {',
  '  /* Layout */',
  decls(p.layout, 'layout').replace(/--layout-/g, '--'),
  '  --bubble-radius: var(--radius-bubble);',
  '  --bubble-radius-tail: var(--radius-bubble-tail);',
  '',
  '  /* Typography */',
  Object.entries(p.typography)
    .filter(([k]) => k !== 'font-body')
    .map(([k, v]) => `  --text-${k.replace(/^size-/, '').replace(/^/, k.startsWith('size-') ? '' : '')}: ${v};`)
    .join('\n'),
  '',
  '  /* Motion (also exposed as raw vars for inline styles) */',
  Object.entries(p.motion).map(([k, v]) => `  --${k}: ${v};`).join('\n'),
  '',
  '  /* Semantic colors — default preset (' + t.meta.defaultPreset + ') light */',
  semanticDecls(withStatus('light', defaultPreset.light)),
  '',
  '  /* shadcn/ui bridge */',
  bridgeDecls,
  '}',
].join('\n')

// ── Per-preset light overrides ───────────────────────────────────────────────
/** @type {string[]} */
const presetBlocks = []
for (const [id, preset] of Object.entries(t.semantic.presets)) {
  // @ts-ignore
  if (id === t.meta.defaultPreset) continue
  presetBlocks.push(
    `[data-theme="${id}"] {\n${semanticDecls(withStatus('light', /** @type {any} */ (preset).light))}\n}`
  )
}

// ── Dark mode (Phase 1+): emitted only when a preset defines `dark` ───────────
/** @type {string[]} */
const darkBlocks = []
for (const [id, preset] of Object.entries(t.semantic.presets)) {
  // @ts-ignore
  const dark = preset.dark
  if (!dark) continue
  const sel =
    id === t.meta.defaultPreset
      ? '.dark, [data-color-mode="dark"]:root'
      : `[data-theme="${id}"].dark, [data-theme="${id}"][data-color-mode="dark"]`
  darkBlocks.push(`${sel} {\n${semanticDecls(withStatus('dark', dark))}\n}`)
}

const header = `/* AUTO-GENERATED from design/tokens.json by scripts/build-tokens.mjs.
   Do NOT edit by hand — run \`npm run tokens\` to regenerate. */\n`

const css = [
  header,
  themeBlock,
  '',
  bridgeTheme,
  '',
  root,
  '',
  ...presetBlocks,
  ...(darkBlocks.length ? ['', '/* ── Dark mode ─────────────────────────────────────────────── */', ...darkBlocks] : []),
  '',
].join('\n')

writeFileSync(OUT, css)
console.log(`✓ tokens.generated.css written (${Object.keys(t.semantic.presets).length} presets, ${darkBlocks.length} dark scopes)`)
