// ─────────────────────────────────────────────────────────────────────────────
// Bank / fintech statement ingestion — Nigerian presets + column-mapping wizard.
//
// Honest-by-design: statement export formats drift between app versions, so the
// presets only PRIME the mapping; the user confirms every row's category in the
// preview before import. No invented "AI" — keyword suggestions are transparent.
// ─────────────────────────────────────────────────────────────────────────────

import { Transaction, TxType } from './types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './rules'
import { splitCSVLine } from './csv'
import { uid } from './format'

export interface BankPreset {
  key: string
  label: string
  /** lowercase substrings — presence of ANY strongly signals this provider */
  hints: string[]
  /** header aliases per logical column */
  dateKeys: string[]
  descKeys: string[]
  creditKeys: string[]
  debitKeys: string[]
  /** signed-amount column (Kuda-style exports) */
  amountKeys: string[]
}

export const BANK_PRESETS: BankPreset[] = [
  {
    key: 'moniepoint',
    label: 'Moniepoint (business)',
    hints: ['narration', 'moniepoint'],
    dateKeys: ['date', 'value date', 'transaction date'],
    descKeys: ['narration', 'description', 'details', 'remark'],
    creditKeys: ['credit', 'credit (₦)', 'credit(amount)', 'inflow', 'amount cr'],
    debitKeys: ['debit', 'debit (₦)', 'debit(amount)', 'outflow', 'amount dr'],
    amountKeys: [],
  },
  {
    key: 'kuda',
    label: 'Kuda Business',
    hints: ['kuda'],
    dateKeys: ['date', 'tran date', 'transaction date'],
    descKeys: ['description', 'narration', 'details', 'beneficiary', 'remark'],
    creditKeys: ['credit', 'amount received', 'money in'],
    debitKeys: ['debit', 'amount sent', 'money out'],
    amountKeys: ['amount', 'amount (₦)', 'value'],
  },
  {
    key: 'gtbank',
    label: 'GTBank (GTWorld)',
    hints: ['trans. date', 'trans date', 'gtb'],
    dateKeys: ['trans. date', 'trans date', 'date', 'value date'],
    descKeys: ['narration', 'remarks', 'description', 'details'],
    creditKeys: ['credit', 'credit (₦)', 'deposit'],
    debitKeys: ['debit', 'debit (₦)', 'withdrawal'],
    amountKeys: [],
  },
  {
    key: 'opay',
    label: 'OPay / PalmPay merchant',
    hints: ['trans.date', 'transaction type', 'opay', 'palmpay'],
    dateKeys: ['trans.date', 'trans date', 'date', 'transaction date'],
    descKeys: ['description', 'narration', 'transaction type', 'remark', 'details'],
    creditKeys: ['credit(₦)', 'credit (₦)', 'credit', 'money in'],
    debitKeys: ['debit(₦)', 'debit (₦)', 'debit', 'money out'],
    amountKeys: [],
  },
  {
    key: 'generic',
    label: 'Other bank / generic statement',
    hints: [],
    dateKeys: ['date', 'value date', 'trans date', 'posting date', 'transaction date'],
    descKeys: ['narration', 'description', 'details', 'remark', 'reference', 'transaction details'],
    creditKeys: ['credit', 'credit (₦)', 'money in', 'inflow', 'deposit'],
    debitKeys: ['debit', 'debit (₦)', 'money out', 'outflow', 'withdrawal'],
    amountKeys: ['amount', 'amount (₦)', 'value', 'signed amount'],
  },
]

export interface ColMap {
  date: number
  desc: number
  credit: number // -1 = absent
  debit: number
  amount: number // -1 = absent
}

const norm = (h: string) => h.toLowerCase().replace(/[_\-.()]/g, ' ').replace(/[₦$]/g, ' ').replace(/\s+/g, ' ').trim()

const findCol = (headers: string[], keys: string[]): number => {
  for (const k of keys) {
    const nk = norm(k)
    const exact = headers.findIndex((h) => norm(h) === nk)
    if (exact >= 0) return exact
    const partial = headers.findIndex((h) => norm(h).includes(nk))
    if (partial >= 0) return partial
  }
  return -1
}

export function detectPreset(headers: string[]): BankPreset | null {
  const joined = headers.map(norm).join(' | ')
  for (const p of BANK_PRESETS) {
    if (p.key === 'generic') continue
    if (p.hints.some((h) => joined.includes(norm(h)))) return p
  }
  return null
}

export function autoMap(headers: string[], preset: BankPreset | null): ColMap | null {
  const p = preset ?? BANK_PRESETS.find((b) => b.key === 'generic')!
  const map: ColMap = {
    date: findCol(headers, p.dateKeys),
    desc: findCol(headers, p.descKeys),
    credit: findCol(headers, p.creditKeys),
    debit: findCol(headers, p.debitKeys),
    amount: findCol(headers, p.amountKeys),
  }
  if (map.date < 0 || map.desc < 0) return null
  if (map.credit < 0 && map.debit < 0 && map.amount < 0) return null
  return map
}

/** flexible date normaliser — Nigerian statements are day-first; guarded against month-first */
export function parseFlexDate(raw: string): string | null {
  const s = raw.trim().replace(/\s{2,}/g, ' ')
  if (!s) return null
  const MONTHS: Record<string, number> = {
    jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
  }
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/) // 2026-03-05
  if (m) return iso(+m[1], +m[2], +m[3])
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/) // 05/03/2026 → day-first
  if (m) return iso(+m[3], +m[2], +m[1])
  m = s.match(/^(\d{1,2})[- ]([A-Za-z]{3})[a-z]*[- ](\d{2,4})/) // 05-Mar-2026 / 05 Mar 26
  if (m) {
    const mon = MONTHS[m[2].toLowerCase().slice(0, 3)]
    if (!mon) return null
    const yy = m[3].length === 2 ? 2000 + +m[3] : +m[3]
    return iso(yy, mon, +m[1])
  }
  return null
}
function iso(y: number, mo: number, d: number): string | null {
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > 31) return null
  return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

const num = (s: string): number => {
  // "₦1,234.56" | "(1,234.56)" | "1,234.56DR" | "(51.50)"
  const neg = /^\s*\(|\)\s*$|dr\s*$/i.test(s.replace(/,/g, '')) || s.trim().startsWith('-')
  const v = Number(s.replace(/[₦$,\s]/g, '').replace(/[()]/g, '').replace(/(dr|cr)/i, ''))
  return isFinite(v) ? (neg ? -Math.abs(v) : Math.abs(v)) : NaN
}

// ── keyword-based categorisation (transparent rules, user-editable) ──────────

type Suggestion = Pick<Transaction, 'category' | 'vat' | 'whtRate' | 'nonDeductible'>

const KW: { re: RegExp; type: TxType | 'any'; category: string; wht?: number; nd?: boolean }[] = [
  { re: /\b(pos|settlement|pch fee|in-store pay)\b/i, type: 'income', category: 'Product / goods sales' },
  { re: /web\s?pay|paystack|flutterwave|remita/i, type: 'income', category: 'Digital & online sales' },
  { re: /interest\s?(earned|income|credit)/i, type: 'income', category: 'Interest earned', wht: 0.1 },
  { re: /\brent\b/i, type: 'expense', category: 'Rent paid', wht: 0.1 },
  { re: /salary|payroll|wages/i, type: 'expense', category: 'Salaries & wages' },
  { re: /pension|pencom/i, type: 'expense', category: 'Salaries & wages' },
  { re: /consult|legal|audit|prof(essional)?\s?fee/i, type: 'expense', category: 'Professional fees paid (legal, audit)', wht: 0.05 },
  { re: /advert|marketing|fb\s?ads|google\s?ads/i, type: 'expense', category: 'Marketing & advertising' },
  { re: /fuel|petrol|diesel|pms|transport|logistic|uber|bolt/i, type: 'expense', category: 'Transport, fuel & logistics' },
  { re: /electric|phcn|ekedc|ikedc|aedc|power|utility/i, type: 'expense', category: 'Utilities & telecom' },
  { re: /mtn|airtel|glo|9mobile|smile|spectranet|data\s?(bundle|top)|airtime/i, type: 'expense', category: 'Utilities & telecom' },
  { re: /sms\s?charge|vat\s?dr|chrg|charge\s?fee|acct\s?fee|comm(ission)?\s?on|stamp\s?duty/i, type: 'expense', category: 'Bank charges & interest expense' },
  { re: /repair|mainten|servicing/i, type: 'expense', category: 'Repairs & maintenance' },
  { re: /int(?:er)?est\s?(paid|debit|charg)/i, type: 'expense', category: 'Bank charges & interest expense' },
]

export function suggestFor(desc: string, type: TxType): Suggestion {
  for (const rule of KW) {
    if ((rule.type === 'any' || rule.type === type) && rule.re.test(desc)) {
      const table = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
      const preset = table.find((c) => c.name === rule.category)
      return {
        category: rule.category,
        vat: preset?.vat ?? 'standard',
        whtRate: rule.wht ?? 0,
        nonDeductible: rule.nd ?? false,
      }
    }
  }
  // honest defaults — never invent specificity
  return type === 'income'
    ? { category: 'Product / goods sales', vat: 'standard', whtRate: 0, nonDeductible: false }
    : { category: 'Other operating expense', vat: 'standard', whtRate: 0, nonDeductible: false }
}

// ── statement parsing ────────────────────────────────────────────────────────

export interface StatementRow {
  id: string
  date: string
  desc: string
  type: TxType
  amount: number
  suggestion: Suggestion
}

export function parseStatement(text: string, map: ColMap): { rows: StatementRow[]; errors: string[] } {
  const errors: string[] = []
  const rows: StatementRow[] = []
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { rows, errors: ['File is empty'] }

  // header may not be line 1 (statements often prepend account info) — find it
  const headerIdx = lines.findIndex((l) => splitCSVLine(l).length > map.desc)
  const data = headerIdx >= 0 ? lines.slice(headerIdx + 1) : lines

  data.forEach((line, idx) => {
    const c = splitCSVLine(line)
    if (c.length <= Math.max(map.date, map.desc)) return
    const date = parseFlexDate(c[map.date] ?? '')
    if (!date) return // likely a continuation/footer row — silently skip
    const desc = (c[map.desc] ?? '').trim()
    if (!desc) return
    let type: TxType | null = null
    let amount = NaN
    if (map.amount >= 0) {
      const v = num(c[map.amount] ?? '')
      if (isFinite(v) && v !== 0) { type = v > 0 ? 'income' : 'expense'; amount = Math.abs(v) }
    } else {
      const cr = map.credit >= 0 ? num(c[map.credit] ?? '') : NaN
      const dr = map.debit >= 0 ? num(c[map.debit] ?? '') : NaN
      if (isFinite(cr) && cr !== 0) { type = 'income'; amount = Math.abs(cr) }
      else if (isFinite(dr) && dr !== 0) { type = 'expense'; amount = Math.abs(dr) }
    }
    if (!type || !isFinite(amount) || amount <= 0) return
    rows.push({ id: uid(), date, desc, type, amount: Math.round(amount * 100) / 100, suggestion: suggestFor(desc, type) })
  })

  if (rows.length === 0) errors.push('No transactions recognised — check the column mapping and date column.')
  return { rows, errors }
}

export function sniffHeader(text: string): string[] {
  const firstLine = text.split(/\r?\n/).find((l) => l.trim().length > 0) ?? ''
  return splitCSVLine(firstLine)
}
