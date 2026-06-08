#!/usr/bin/env node
// @ts-check
/**
 * Token build step — single source of truth.
 *
 * Reads design/tokens.json and emits src/app/tokens.generated.css:
 *   - `@theme`            → primitive scales become Tailwind v4 utilities
 *   - `@theme inline`     → shadcn/ui color names bridge onto Rosenraum semantic vars
 *   - `:root`             → primitives (raw) + default preset light + status defaults + bridge indirection
 *   - `[data-theme="x"]`  → per-preset light overrides
 *   - `.dark` scopes      → per-preset dark overrides (only when present in tokens.json)
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
const p = t.primitive

/**
 * Render `--prefix-key: value;` lines for a flat token map.
 *
 * @param {Record<string,string>} obj - Token map.
 * @param {string} prefix - Custom-property prefix (no trailing dash); '' for raw keys.
 * @returns {string} Declaration lines.
 */
function decls(obj, prefix) {
  const pre = prefix ? `${prefix}-` : ''
  return Object.entries(obj).map(([k, v]) => `  --${pre}${k}: ${v};`).join('\n')
}

/**
 * Merge status defaults beneath a preset's own values for one mode.
 *
 * @param {string} mode - 'light' or 'dark'.
 * @param {Record<string,string>} presetMode - Preset's mode-specific tokens.
 * @returns {Record<string,string>} Complete semantic map.
 */
function withStatus(mode, presetMode) {
  return { ...t.semantic.statusDefaults[mode], ...presetMode }
}

/**
 * Emit `--color-*` declarations in canonical token order.
 *
 * @param {Record<string,string>} semantic - Resolved semantic map.
 * @returns {string} Declaration lines.
 */
function semanticDecls(semantic) {
  return t.semantic.tokens
    .filter((/** @type {string} */ n) => semantic[n] !== undefined)
    .map((/** @type {string} */ n) => `  --color-${n}: ${semantic[n]};`)
    .join('\n')
}

const defaultPreset = t.semantic.presets[t.meta.defaultPreset]

// ── @theme: primitives become Tailwind utilities ─────────────────────────────
const themeBlock = [
  '@theme {',
  decls(p.radius, 'radius'),
  decls(p.shadow, 'shadow'),
  decls(p.motion, ''),
  `  --font-body: ${p.typography['font-body']};`,
  '}',
].join('\n')

// ── @theme inline: shadcn color names → semantic vars ────────────────────────
const bridgeTheme = [
  '@theme inline {',
  Object.keys(t.bridge.map).map(n => `  --color-${n}: var(--${n});`).join('\n'),
  '  --radius-sm: calc(var(--radius-md) - 4px);',
  '  --radius-lg: var(--radius-bubble);',
  '}',
].join('\n')

// ── :root — primitives (raw) + default light + bridge indirection ────────────
const { 'font-body': _fb, ...typeScale } = p.typography
const bridgeDecls = Object.entries(t.bridge.map)
  .map(([shadcn, semantic]) => `  --${shadcn}: var(--color-${semantic});`)
  .join('\n')

const root = [
  ':root {',
  '  /* Layout */',
  decls(p.layout, ''),
  '  --bubble-radius: var(--radius-bubble);',
  '  --bubble-radius-tail: var(--radius-bubble-tail);',
  '',
  '  /* Typography */',
  decls(typeScale, ''),
  '',
  '  /* Motion (raw vars for inline styles) */',
  decls(p.motion, ''),
  '',
  `  /* Semantic colors — default preset (${t.meta.defaultPreset}) light */`,
  semanticDecls(withStatus('light', defaultPreset.light)),
  '',
  '  /* shadcn/ui bridge */',
  bridgeDecls,
  '',
  '  /* Mode-aware primary for text/links (AA on the active background) */',
  '  --color-primary-text: var(--color-primary-dark);',
  '}',
].join('\n')

// Primary-as-text flips to the light tint in dark mode so it stays legible.
const primaryTextDark =
  ':root.dark, :root[data-color-mode="dark"] {\n  --color-primary-text: var(--color-primary-light);\n}'

// ── Per-preset light overrides ───────────────────────────────────────────────
/** @type {string[]} */
const presetBlocks = []
for (const [id, preset] of Object.entries(t.semantic.presets)) {
  if (id === t.meta.defaultPreset) continue
  presetBlocks.push(
    `[data-theme="${id}"] {\n${semanticDecls(withStatus('light', /** @type {any} */ (preset).light))}\n}`
  )
}

// ── Dark mode (Phase 1+): only when a preset defines `dark` ───────────────────
/** @type {string[]} */
const darkBlocks = []
for (const [id, preset] of Object.entries(t.semantic.presets)) {
  const dark = /** @type {any} */ (preset).dark
  if (!dark) continue
  const sel =
    id === t.meta.defaultPreset
      ? ':root.dark, :root[data-color-mode="dark"]'
      : `[data-theme="${id}"].dark, [data-theme="${id}"][data-color-mode="dark"]`
  darkBlocks.push(`${sel} {\n${semanticDecls(withStatus('dark', dark))}\n}`)
}

const css = [
  `/* AUTO-GENERATED from design/tokens.json by scripts/build-tokens.mjs.
   Do NOT edit by hand — run \`npm run tokens\` to regenerate. */`,
  '',
  themeBlock,
  '',
  bridgeTheme,
  '',
  root,
  '',
  ...presetBlocks,
  '',
  '/* ── Mode-aware aliases ─────────────────────────────────── */',
  primaryTextDark,
  ...(darkBlocks.length
    ? ['', '/* ── Dark mode ─────────────────────────────────────────── */', ...darkBlocks]
    : []),
  '',
].join('\n')

writeFileSync(OUT, css)
console.log(
  `✓ tokens.generated.css — ${Object.keys(t.semantic.presets).length} presets, ${darkBlocks.length} dark scope(s)`
)
