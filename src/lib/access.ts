// ─────────────────────────────────────────────────────────────────────────────
// Prototype access control — admin-generated access codes for customer test runs.
//
// Security note: this is a REGISTRATION GATE for a distributable prototype, not
// cryptographic auth. Codes are opaque & revocable; all validation is local.
// ─────────────────────────────────────────────────────────────────────────────

import { Period } from './billing'

export type GrantKind = 'trial' | Period // 'trial' | 'monthly' | 'quarterly' | 'yearly'

export const GRANT_LABELS: Record<GrantKind, string> = {
  trial: '14-day Premium trial',
  monthly: 'Premium · 1 month',
  quarterly: 'Premium · 3 months',
  yearly: 'Premium · 12 months',
}

export interface AccessCode {
  id: string
  code: string // e.g. TXS-7K2M-D9Q4 (plain — admin must be able to re-share)
  note: string // who the code is for (customer / cohort)
  createdAt: string // ISO
  expiresAt: string // ISO — '' = never
  maxActivations: number // 0 = unlimited
  grant: GrantKind
  revoked: boolean
  activations: { at: string }[]
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1 — avoids confusion

export function generateCode(): string {
  const seg = (n: number) =>
    Array.from({ length: n }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join('')
  return `TXS-${seg(4)}-${seg(4)}`
}

export type AccessCheck =
  | { ok: true; code: AccessCode }
  | { ok: false; reason: 'unknown' | 'revoked' | 'expired' | 'exhausted' | 'malformed' }

export function normalizeCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^TXS/, 'TXS-').replace(
    /^TXS-([A-Z0-9]{4})([A-Z0-9]{4})$/,
    'TXS-$1-$2'
  )
}

export function checkCode(codes: AccessCode[], input: string, now = new Date()): AccessCheck {
  const code = normalizeCode(input)
  if (!/^TXS-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(code)) return { ok: false, reason: 'malformed' }
  const found = codes.find((c) => c.code === code)
  if (!found) return { ok: false, reason: 'unknown' }
  if (found.revoked) return { ok: false, reason: 'revoked' }
  if (found.expiresAt && new Date(found.expiresAt).getTime() < now.getTime()) return { ok: false, reason: 'expired' }
  if (found.maxActivations > 0 && found.activations.length >= found.maxActivations) return { ok: false, reason: 'exhausted' }
  return { ok: true, code: found }
}

export const REASON_TEXT: Record<Exclude<AccessCheck, { ok: true }>['reason'], string> = {
  malformed: 'Enter the code exactly as shared — format TXS-XXXX-XXXX.',
  unknown: 'This access code is not recognised. Check for typos or request a fresh code.',
  revoked: 'This access code has been revoked by the administrator.',
  expired: 'This access code has expired. Ask the administrator for a new one.',
  exhausted: 'This access code has reached its activation limit.',
}

// ── admin passcode (WebCrypto hash, set once on this device) ─────────────────

export async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const ADMIN_KEY = 'taxsage.admin.v1'
export const ADMIN_SESSION = 'taxsage.admin.session'
export const ACCESS_SESSION = 'taxsage.access.v1'

export interface AccessSession {
  code: string
  grantedAt: string
  grant: GrantKind
}

export function readAccessSession(): AccessSession | null {
  try {
    const raw = localStorage.getItem(ACCESS_SESSION)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed.code === 'string' ? parsed : null
  } catch {
    return null
  }
}

export function writeAccessSession(s: AccessSession | null): void {
  if (s) localStorage.setItem(ACCESS_SESSION, JSON.stringify(s))
  else localStorage.removeItem(ACCESS_SESSION)
}

export function isAdminAuthed(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION) === '1'
}
export function setAdminAuthed(v: boolean): void {
  if (v) sessionStorage.setItem(ADMIN_SESSION, '1')
  else sessionStorage.removeItem(ADMIN_SESSION)
}

export function getAdminPassHash(): string | null {
  return localStorage.getItem(ADMIN_KEY)
}
export function setAdminPassHash(hash: string): void {
  localStorage.setItem(ADMIN_KEY, hash)
}

// ── deployment provisioning ───────────────────────────────────────────────────
//
// For hosted test URLs (GitHub Pages, Netlify, the prototype zip's server),
// customers run the app in THEIR browser — the admin's localStorage registry
// never reaches them. The build therefore ships `access-codes.json` at the site
// root (product-key style): the app merges it into the local registry on boot.
// Local runtime state (revocations, activations) still wins on that device.

export const PROVISION_PATH = './access-codes.json'

export interface ProvisionedFile {
  generatedAt: string
  codes: AccessCode[]
}

export async function fetchProvisionedCodes(): Promise<AccessCode[]> {
  try {
    const res = await fetch(PROVISION_PATH, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as ProvisionedFile
    return Array.isArray(data?.codes) ? data.codes : []
  } catch {
    return [] // no provisioning file (local/dev builds) — fine
  }
}

/** Merge ship-file codes into the local registry (local entries win on conflict). */
export function mergeCodes(local: AccessCode[], incoming: AccessCode[]): AccessCode[] {
  if (!incoming.length) return local
  const byCode = new Map(local.map((c) => [c.code, c]))
  for (const inc of incoming) {
    const ex = byCode.get(inc.code)
    if (!ex) byCode.set(inc.code, inc)
    else {
      byCode.set(inc.code, {
        ...inc,
        ...ex, // local fields (revoked, activations) take precedence
        activations: ex.activations.length >= inc.activations.length ? ex.activations : inc.activations,
      })
    }
  }
  return [...byCode.values()]
}
