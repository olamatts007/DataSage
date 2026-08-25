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
