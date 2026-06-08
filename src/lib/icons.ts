import {
  // actions
  Plus, Check, X, Link2, Copy, Send, Trash2, Pencil, Search, Settings, Palette,
  // navigation
  ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Menu,
  // status
  CircleCheck, CircleAlert, TriangleAlert, Info, Loader,
  // alerts / mood
  Heart, Leaf, Sparkles, Star, Eye,
  // empty states
  Inbox, MessageCircle, Hash,
  type LucideIcon,
} from 'lucide-react'

/**
 * Semantic icon map — choose icons by meaning, never ad hoc. Keeps one icon
 * family (Lucide) with consistent usage across the app. See docs/THEME_OPTIONS.md.
 *
 * Grouped by role: action / nav / status / mood / empty. Reference these instead
 * of importing Lucide icons directly in feature code, so a swap is one edit here.
 */
export const icons = {
  // ── Actions ───────────────────────────────────────────────────────────────
  add: Plus,
  confirm: Check,
  close: X,
  link: Link2,
  copy: Copy,
  send: Send,
  delete: Trash2,
  edit: Pencil,
  search: Search,
  settings: Settings,
  theme: Palette,

  // ── Navigation ────────────────────────────────────────────────────────────
  back: ArrowLeft,
  forward: ArrowRight,
  expand: ChevronDown,
  next: ChevronRight,
  menu: Menu,

  // ── Status ────────────────────────────────────────────────────────────────
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  loading: Loader,

  // ── Mood / brand ──────────────────────────────────────────────────────────
  heart: Heart,
  leaf: Leaf,
  sparkles: Sparkles,
  star: Star,
  eye: Eye,

  // ── Empty states ──────────────────────────────────────────────────────────
  emptyInbox: Inbox,
  emptyMessages: MessageCircle,
  code: Hash,
} as const satisfies Record<string, LucideIcon>

/** Semantic icon key — use with the `icons` map. */
export type IconName = keyof typeof icons
