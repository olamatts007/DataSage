// ─────────────────────────────────────────────────────────────────────────────
// Billing & entitlements — plans, periods, feature gating for TaxSage Premium.
// Sandbox implementation: payment methods are simulated locally; no real charge.
// ─────────────────────────────────────────────────────────────────────────────

export type Period = 'monthly' | 'quarterly' | 'yearly'
export type SubStatus = 'free' | 'trialing' | 'active' | 'expired'

export interface Plan {
  id: 'free' | 'premium'
  name: string
  period: Period | null
  price: number // ₦
  perMonthNote: string
  saveBadge?: string
  blurb: string
}

const FREE_PLAN: Plan = {
  id: 'free',
  name: 'SME Starter',
  period: null,
  price: 0,
  perMonthNote: 'free forever',
  blurb: 'Get classified under NTA 2025 and keep basic books.',
}

export const PLANS = {
  free: (): Plan => FREE_PLAN,
  premium: (p: Period): Plan => {
    const table: Record<Period, { price: number; per: string; save?: string }> = {
      monthly: { price: 7_500, per: '₦7,500 / month' },
      quarterly: { price: 20_000, per: '₦6,667 / month, billed ₦20,000 quarterly', save: 'SAVE 11%' },
      yearly: { price: 66_000, per: '₦5,500 / month, billed ₦66,000 yearly', save: 'SAVE 27%' },
    }
    const t = table[p]
    return {
      id: 'premium',
      name: 'Premium',
      period: p,
      price: t.price,
      perMonthNote: t.per,
      saveBadge: t.save,
      blurb: 'File-ready returns, exports, payroll scale and reform analytics.',
    }
  },
}

export const TRIAL_DAYS = 14

export const PERIOD_DAYS: Record<Period, number> = {
  monthly: 30,
  quarterly: 91,
  yearly: 365,
}

export interface Payment {
  id: string
  kind: 'trial' | 'subscription' | 'grant'
  period: Period | 'trial'
  method: 'card' | 'transfer' | 'ussd' | 'trial' | 'access-code'
  amount: number
  date: string // ISO
  reference: string
  note: string
}

export interface Subscription {
  status: SubStatus
  period: Period | null
  /** ISO timestamps */
  currentPeriodEnd: string // '' when free
  trialUsed: boolean
  trialEnd: string // '' when none
  autoRenew: boolean
  cancelledAt: string // '' when not cancelled (access continues to period end)
}

export const FREE_SUB: Subscription = {
  status: 'free',
  period: null,
  currentPeriodEnd: '',
  trialUsed: false,
  trialEnd: '',
  autoRenew: false,
  cancelledAt: '',
}

// ── entitlement keys ──────────────────────────────────────────────────────────

export type FeatureKey =
  | 'unlimited_records'
  | 'csv_import'
  | 'csv_export'
  | 'return_schedules' // VAT/WHT/PAYE/print report schedules
  | 'print_export'
  | 'law_compare' // old-vs-new engine comparison
  | 'unlimited_employees'
  | 'backup_restore'
  | 'radar_alerts' // threshold alerts & compliance score

export interface Entitlement {
  isPremiumActive: boolean
  trialActive: boolean
  daysLeft: number
  status: SubStatus
  period: Period | null
  limits: { records: number; employees: number }
  can: (f: FeatureKey) => boolean
}

export const FREE_LIMITS = { records: 50, employees: 3 }
export const PREMIUM_LIMITS = { records: Infinity, employees: Infinity }

const PREMIUM_FEATURES: FeatureKey[] = [
  'unlimited_records',
  'csv_import',
  'csv_export',
  'return_schedules',
  'print_export',
  'law_compare',
  'unlimited_employees',
  'backup_restore',
  'radar_alerts',
]

export const FEATURE_LABELS: Record<FeatureKey, string> = {
  unlimited_records: 'Unlimited ledger records',
  csv_import: 'Bulk CSV import from bank/bookkeeping',
  csv_export: 'CSV export of ledger & schedules',
  return_schedules: 'Return-ready VAT, WHT & PAYE schedules',
  print_export: 'Print/PDF of official-style return reports',
  law_compare: 'Old-law vs NTA 2025 reform comparison',
  unlimited_employees: 'Unlimited employees on payroll',
  backup_restore: 'Encrypted JSON backup & restore',
  radar_alerts: 'Threshold alerts & compliance scoring',
}

export function computeEntitlement(sub: Subscription, now: Date): Entitlement {
  const nowMs = now.getTime()
  const trialActive = sub.status === 'trialing' && !!sub.trialEnd && new Date(sub.trialEnd).getTime() > nowMs
  const periodActive = sub.status === 'active' && !!sub.currentPeriodEnd && new Date(sub.currentPeriodEnd).getTime() > nowMs
  const isPremiumActive = trialActive || periodActive

  let daysLeft = 0
  if (trialActive) daysLeft = Math.ceil((new Date(sub.trialEnd).getTime() - nowMs) / 86_400_000)
  else if (periodActive) daysLeft = Math.ceil((new Date(sub.currentPeriodEnd).getTime() - nowMs) / 86_400_000)

  const status: SubStatus =
    trialActive ? 'trialing'
    : (sub.status === 'active' && !periodActive) ? 'expired'
    : sub.status === 'trialing' ? 'expired'
    : isPremiumActive ? sub.status : 'free'

  return {
    isPremiumActive,
    trialActive,
    daysLeft,
    status,
    period: sub.period,
    limits: isPremiumActive ? PREMIUM_LIMITS : FREE_LIMITS,
    can: (f) => isPremiumActive || !PREMIUM_FEATURES.includes(f),
  }
}

export function periodEnd(from: Date, p: Period): string {
  return new Date(from.getTime() + PERIOD_DAYS[p] * 86_400_000).toISOString()
}

export function trialEnd(from: Date): string {
  return new Date(from.getTime() + TRIAL_DAYS * 86_400_000).toISOString()
}

export function paymentRef(): string {
  return 'TXS-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase()
}

export const FREE_FEATURE_LIST = [
  'NTA 2025 business classification wizard',
  'Records ledger — up to 50 transactions',
  'Payroll & PAYE — up to 3 employees',
  'Overview dashboard with tax position',
  'Filing calendar & NTAA deadline engine',
  'Plain-English guide to the 2025 Acts',
  'Monthly VAT summary view',
]

export const PREMIUM_FEATURE_LIST: { key: FeatureKey; blurb: string }[] = [
  { key: 'unlimited_records', blurb: 'Ledger without the 50-record ceiling' },
  { key: 'unlimited_employees', blurb: 'Payroll grows with your team — no 3-employee cap' },
  { key: 'return_schedules', blurb: 'CIT/PIT, monthly VAT, WHT schedule & PAYE annual return' },
  { key: 'print_export', blurb: 'One-click print/PDF formatted for your accountant & the NRS' },
  { key: 'csv_import', blurb: 'Bulk CSV import from bank statements & bookkeeping exports' },
  { key: 'csv_export', blurb: 'CSV export of every schedule and the ledger' },
  { key: 'law_compare', blurb: 'Quantify what the 2025 reform saves you, line by line' },
  { key: 'backup_restore', blurb: 'Full JSON backup & restore of your entire workspace' },
  { key: 'radar_alerts', blurb: '₦100m threshold alerts & compliance-score monitoring' },
]

// ── sandbox payment helpers ───────────────────────────────────────────────────

/** Luhn check for the demo card form (sandbox only — no charge is made). */
export function luhnValid(num: string): boolean {
  const digits = num.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) return false
  let sum = 0
  let dbl = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i])
    if (dbl) { d *= 2; if (d > 9) d -= 9 }
    sum += d
    dbl = !dbl
  }
  return sum % 10 === 0
}
