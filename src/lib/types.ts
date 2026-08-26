// ─────────────────────────────────────────────────────────────────────────────
// TaxSage core domain model
// ─────────────────────────────────────────────────────────────────────────────

export type RuleId = 'NTA2025' | 'FA2021'

export type BusinessStructure =
  | 'sole_proprietor'
  | 'partnership'
  | 'limited_company'
  | 'enterprise' // registered business name (CAC BN)

export interface BusinessProfile {
  name: string
  tin: string
  structure: BusinessStructure
  sector: string
  state: string
  /** renders professional services? → excluded from small-company class (NTA 2025) */
  isProfessionalServices: boolean
  /** calendar month (1-12) the accounting year ends */
  fyEndMonth: number
  /** owner's expected annual turnover — used for classification until records prove otherwise */
  declaredTurnover: number
  /** total fixed assets (NTA test: ≤ ₦250m) */
  fixedAssets: number
  /** below-threshold businesses may still opt in to VAT */
  vatOptIn: boolean
  /** annual rent paid by the proprietor (rent relief, NTA 2025) */
  rentPaidByOwner: number
  incorporatedOn: string // ISO date or ''
}

export type VatTreatment = 'standard' | 'zero_rated' | 'exempt' | 'non_vatable'
export type TxType = 'income' | 'expense'

export interface Transaction {
  id: string
  date: string // ISO yyyy-mm-dd
  type: TxType
  category: string
  description: string
  /** VAT-exclusive base amount in naira */
  amount: number
  vat: VatTreatment
  /** WHT rate (0-1) applied at source: income → suffered (credit); expense → deducted (payable) */
  whtRate: number
  partyName: string
  partyHasTIN: boolean
  /** expense is capital or otherwise non-deductible → added back in tax computation */
  nonDeductible: boolean
}

export interface Employee {
  id: string
  name: string
  role: string
  annualGross: number
  /** statutory pension 8% employee contribution (relief) */
  pension: boolean
}

export type FilingType = 'PAYE' | 'VAT' | 'WHT' | 'CIT' | 'PIT' | 'PAYE_ANNUAL'
export type FilingStatus = 'pending' | 'filed'

export interface FilingRecord {
  id: string
  type: FilingType
  period: string // e.g. '2026-03' or 'FY2026'
  status: FilingStatus
  filedOn: string // ISO date or ''
}

export interface AppState {
  profile: BusinessProfile
  transactions: Transaction[]
  employees: Employee[]
  filings: FilingRecord[]
  /** accounting year under review (e.g. 2026) */
  year: number
  onboarded: boolean
}

// ── engine outputs ────────────────────────────────────────────────────────────

export interface AnnualTotals {
  year: number
  fyLabel: string
  turnover: number
  deductibleExpenses: number
  nonDeductibleAddBacks: number
  assessableProfit: number
  whtSuffered: number
  whtDeducted: number
  standardRatedIncome: number
  standardRatedExpense: number
  zeroRatedIncome: number
  exemptIncome: number
}

export interface Classification {
  isSmall: boolean
  reasons: string[]
  warnings: string[]
  turnoverUsed: number
  turnoverSource: 'records' | 'profile'
  vatRequired: boolean
  obligations: Obligation[]
}

export interface Obligation {
  code: string
  title: string
  detail: string
  applies: boolean
}

export interface TaxLine {
  label: string
  amount: number
  note?: string
  strong?: boolean
}

export interface PITBreakdown {
  line: string
  band: string
  rate: number
  taxableInBand: number
  tax: number
}

export interface MonthlyVAT {
  month: string // '2026-01'
  output: number
  input: number
  net: number
}

export interface PayeResult {
  employee: Employee
  chargeable: number
  annualTax: number
  monthlyTax: number
  netMonthly: number
}

export interface Deadline {
  id: string
  title: string
  legalBasis: string
  dueDate: string // ISO
  kind: FilingType
  amount?: number
  penaltyNote: string
}
