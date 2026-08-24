// ─────────────────────────────────────────────────────────────────────────────
// TaxSage computation engine — pure functions, traceable to the rule sets.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AnnualTotals, AppState, BusinessProfile, Classification, Deadline, Employee,
  MonthlyVAT, Obligation, PITBreakdown, PayeResult, TaxLine, Transaction,
} from './types'
import { RuleSet, PENALTIES } from './rules'

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100

export function fyWindow(year: number, fyEndMonth: number): { start: string; end: string; label: string } {
  // Accounting year = 12 months ending at the end of fyEndMonth in `year`.
  const end = new Date(Date.UTC(year, fyEndMonth, 0)) // last day of fyEndMonth
  const start = new Date(Date.UTC(year, fyEndMonth - 12, 1))
  const iso = (d: Date) => d.toISOString().slice(0, 10)
  const label =
    fyEndMonth === 12
      ? `FY ${year}`
      : `FY Jul ${end.getUTCFullYear() - fyEndMonth >= 0 ? year - 1 : year}–${new Date(end).toLocaleString('en', { month: 'short' })} ${year}`
  return { start: iso(start), end: iso(end), label }
}

export function inWindow(tx: Transaction, start: string, end: string): boolean {
  return tx.date >= start && tx.date <= end
}

// ---------------------------------------------------------------------------
// 1 · annual totals from the ledger
// ---------------------------------------------------------------------------

export function annualTotals(transactions: Transaction[], year: number, fyEndMonth: number): AnnualTotals {
  const { start, end, label } = fyWindow(year, fyEndMonth)
  let turnover = 0,
    deductible = 0,
    addBacks = 0,
    whtSuf = 0,
    whtDed = 0,
    stdIncome = 0,
    stdExpense = 0,
    zeroIncome = 0,
    exemptIncome = 0

  for (const t of transactions) {
    if (!inWindow(t, start, end)) continue
    const whtAmt = t.amount * (t.whtRate || 0)
    if (t.type === 'income') {
      turnover += t.amount
      whtSuf += whtAmt
      if (t.vat === 'standard') stdIncome += t.amount
      else if (t.vat === 'zero_rated') zeroIncome += t.amount
      else exemptIncome += t.amount
    } else {
      whtDed += whtAmt
      if (t.vat === 'standard') stdExpense += t.amount
      if (t.nonDeductible) addBacks += t.amount
      else deductible += t.amount
    }
  }

  turnover = round2(turnover)
  deductible = round2(deductible)
  addBacks = round2(addBacks)

  return {
    year,
    fyLabel: label,
    turnover,
    deductibleExpenses: deductible,
    nonDeductibleAddBacks: addBacks,
    assessableProfit: round2(turnover - deductible), // add-backs shown separately in workings
    whtSuffered: round2(whtSuf),
    whtDeducted: round2(whtDed),
    standardRatedIncome: round2(stdIncome),
    standardRatedExpense: round2(stdExpense),
    zeroRatedIncome: round2(zeroIncome),
    exemptIncome: round2(exemptIncome),
  }
}

// ---------------------------------------------------------------------------
// 2 · classification under the rule set
// ---------------------------------------------------------------------------

export function classify(profile: BusinessProfile, totals: AnnualTotals, rules: RuleSet): Classification {
  const hasRecords = totals.turnover > 0
  const turnoverUsed = hasRecords ? totals.turnover : profile.declaredTurnover
  const sc = rules.smallCompany

  const turnoverOK = turnoverUsed <= sc.turnoverLimit
  const assetsOK = profile.fixedAssets <= sc.fixedAssetLimit
  const professionalBad = sc.professionalExcluded && profile.isProfessionalServices

  const isSmall = turnoverOK && assetsOK && !professionalBad

  const reasons: string[] = []
  if (turnoverOK)
    reasons.push(`Turnover below the ${rules.shortTitle} small-company ceiling`)
  else reasons.push(`Turnover exceeds the ${rules.shortTitle} small-company ceiling`)
  if (sc.fixedAssetLimit !== Infinity)
    reasons.push(assetsOK ? `Fixed assets within the ₦250m ceiling` : `Fixed assets exceed the ₦250m ceiling`)
  if (professionalBad)
    reasons.push('Professional-service businesses are expressly excluded from the small-company class')

  const warnings: string[] = []
  if (rules.id === 'NTA2025') {
    const headroom = sc.turnoverLimit - turnoverUsed
    if (isSmall && headroom <= 10_000_000)
      warnings.push('You are within ₦10m of the ₦100m ceiling — crossing it makes CIT, Development Levy, VAT and WHT duties switch on.')
    if (isSmall && hasRecords && profile.declaredTurnover > sc.turnoverLimit)
      warnings.push('Your declared estimate says you expect to cross ₦100m this year — watch the threshold radar monthly.')
  }

  const vatRequired = rules.vat.smallBusinessRelief ? !isSmall || profile.vatOptIn : turnoverUsed > 25_000_000

  const obligations: Obligation[] = [
    {
      code: 'TIN',
      title: 'Tax ID (TIN) registration',
      detail: `Every taxable person must hold a Tax ID under the NTAA 2025. Individuals = NIN; businesses = CAC-linked registration. Default fine ₦50,000 first month + ₦25,000/month.`,
      applies: true,
    },
    {
      code: 'BOOKS',
      title: 'Keep books of account',
      detail: 'NTAA 2025 requires proper records of all transactions — this ledger satisfies that duty.',
      applies: true,
    },
    {
      code: 'CIT',
      title: isSmall ? 'CIT return (0% rate — still file!)' : 'Companies Income Tax return',
      detail: isSmall
        ? 'Small companies pay 0% CIT but must still file returns within 6 months of year-end under NTAA 2025.'
        : `File CIT within 6 months of financial year-end at ${rules.cit.standardRate * 100}% of taxable profits.`,
      applies: profile.structure === 'limited_company',
    },
    {
      code: 'DEVLEVY',
      title: 'Development Levy (4%)',
      detail: isSmall
        ? 'Small companies are exempt from the 4% Development Levy under NTA 2025.'
        : '4% of assessable profit, filed with the annual CIT return.',
      applies: profile.structure === 'limited_company',
    },
    {
      code: 'PIT',
      title: 'Personal Income Tax self-assessment',
      detail: 'Proprietors, partners and directors file annual PIT by 31 March with the State Internal Revenue Service.',
      applies: profile.structure !== 'limited_company',
    },
    {
      code: 'VAT',
      title: 'VAT registration & monthly returns',
      detail: vatRequired
        ? 'Charge 7.5% on standard-rated supplies; file & remit by the 21st of the following month.'
        : 'Below-threshold relief: charging VAT is optional. Opt in only if your customers can use the input credit.',
      applies: true,
    },
    {
      code: 'WHT',
      title: 'Withholding tax',
      detail: isSmall
        ? 'Small companies are exempt both ways: no WHT deducted from your income, and no duty to deduct on supplier payments.'
        : 'Deduct WHT on supplier payments (2%/5%/10%) and remit by the 21st; claim credits for WHT suffered on your income.',
      applies: true,
    },
    {
      code: 'PAYE',
      title: 'PAYE on salaries',
      detail: 'Deduct PAYE monthly, remit to the State IRS by the 10th; file the employer annual return by 31 January.',
      applies: true, // refined by employees.length later in UI
    },
  ]

  return { isSmall, reasons, warnings, turnoverUsed, turnoverSource: hasRecords ? 'records' : 'profile', vatRequired, obligations }
}

// ---------------------------------------------------------------------------
// 3 · PIT engine — progressive bands on chargeable income
// ---------------------------------------------------------------------------

export function pitOn(chargeable: number, rules: RuleSet): { breakdown: PITBreakdown[]; total: number } {
  const breakdown: PITBreakdown[] = []
  let lower = 0
  let total = 0
  let remaining = Math.max(0, chargeable)
  for (const band of rules.pitBands) {
    if (remaining <= 0) break
    const width = band.upto === Infinity ? Infinity : band.upto - lower
    const inBand = Math.min(remaining, width)
    const tax = round2(inBand * band.rate)
    breakdown.push({
      line: `${band.label} @ ${band.rate * 100}%`,
      band: band.label,
      rate: band.rate,
      taxableInBand: round2(inBand),
      tax,
    })
    total += tax
    remaining -= inBand
    lower = band.upto
  }
  return { breakdown, total: round2(total) }
}

export function cra(gross: number): number {
  // Repealed Consolidated Relief Allowance (old law only)
  return round2(Math.max(200_000, gross * 0.01) + gross * 0.2)
}

export function rentRelief(annualRent: number, rules: RuleSet): number {
  if (!rules.rentRelief) return 0
  return round2(Math.min(annualRent * rules.rentRelief.pct, rules.rentRelief.cap))
}

// ---------------------------------------------------------------------------
// 4 · corporate computation (CIT + development levy)
// ---------------------------------------------------------------------------

export function citComputation(
  totals: AnnualTotals,
  classification: Classification,
  rules: RuleSet
): { lines: TaxLine[]; cit: number; levy: number; netPayable: number } {
  const lines: TaxLine[] = []
  const profitBeforeTax = round2(totals.turnover - totals.deductibleExpenses - totals.nonDeductibleAddBacks)

  lines.push({ label: 'Total turnover (gross revenue)', amount: totals.turnover })
  lines.push({ label: 'Less: deductible operating expenses', amount: -totals.deductibleExpenses })
  if (totals.nonDeductibleAddBacks > 0)
    lines.push({ label: 'Capital / non-deductible items (excluded)', amount: -totals.nonDeductibleAddBacks, note: 'Shown as capital allowance & add-backs in the full return' })
  lines.push({ label: 'Assessable profit', amount: profitBeforeTax, strong: true })

  let citRate = rules.cit.standardRate
  let rateNote = `${rules.cit.standardRate * 100}% standard rate`
  if (classification.isSmall) {
    citRate = rules.cit.smallRate
    rateNote = rules.id === 'NTA2025' ? '0% — small company (NTA 2025)' : '0% — small company (≤ ₦25m, FA 2020)'
  } else if (rules.cit.mediumRate !== null && rules.cit.mediumLimit !== null && classification.turnoverUsed <= rules.cit.mediumLimit) {
    citRate = rules.cit.mediumRate
    rateNote = '20% — medium company (₦25m–₦100m, repealed FA band)'
  }

  const cit = round2(Math.max(0, profitBeforeTax) * citRate)
  lines.push({ label: `Companies Income Tax — ${rateNote}`, amount: cit })

  let levy = 0
  if (!(classification.isSmall && rules.developmentLevy.smallExempt)) {
    levy = round2(Math.max(0, profitBeforeTax) * rules.developmentLevy.rate)
    lines.push({ label: `${rules.developmentLevy.label} @ ${rules.developmentLevy.rate * 100}%`, amount: levy, note: rules.developmentLevy.replaces })
  } else {
    lines.push({ label: `${rules.developmentLevy.label}`, amount: 0, note: 'exempt — small company' })
  }

  lines.push({ label: 'Less: WHT credits suffered on income', amount: -Math.min(totals.whtSuffered, cit + levy), note: 'credit notes offset income tax' })
  const netPayable = round2(Math.max(0, cit + levy - totals.whtSuffered))
  lines.push({ label: 'Net tax payable', amount: netPayable, strong: true })

  return { lines, cit, levy, netPayable }
}

// ---------------------------------------------------------------------------
// 5 · sole-proprietor / partnership PIT computation
// ---------------------------------------------------------------------------

export function pitComputation(
  totals: AnnualTotals,
  profile: BusinessProfile,
  rules: RuleSet
): { lines: TaxLine[]; breakdown: PITBreakdown[]; tax: number; netPayable: number } {
  const profit = round2(Math.max(0, totals.turnover - totals.deductibleExpenses - totals.nonDeductibleAddBacks))
  const relief = rules.pitRelief.kind === 'rent_relief' ? rentRelief(profile.rentPaidByOwner, rules) : cra(profit)
  const chargeable = round2(Math.max(0, profit - relief))
  const { breakdown, total } = pitOn(chargeable, rules)
  const netPayable = round2(Math.max(0, total - totals.whtSuffered))

  const lines: TaxLine[] = [
    { label: 'Business turnover', amount: totals.turnover },
    { label: 'Business expenses (deductible)', amount: -totals.deductibleExpenses },
  ]
  if (totals.nonDeductibleAddBacks > 0)
    lines.push({ label: 'Capital / non-deductible items (excluded)', amount: -totals.nonDeductibleAddBacks })
  lines.push(
    { label: 'Profit chargeable to PIT', amount: profit, strong: true },
    {
      label: rules.pitRelief.kind === 'rent_relief' ? 'Rent relief (lower of 20% of rent paid or ₦500k)' : 'Consolidated Relief Allowance (repealed)',
      amount: -relief,
      note: rules.pitRelief.describe,
    },
    { label: 'Taxable income', amount: chargeable, strong: true },
    { label: 'PIT per bands', amount: total },
    { label: 'Less: WHT credits suffered', amount: -Math.min(totals.whtSuffered, total) },
    { label: 'Net PIT payable', amount: netPayable, strong: true },
  )
  return { lines, breakdown, tax: total, netPayable }
}

// ---------------------------------------------------------------------------
// 6 · VAT — monthly net position
// ---------------------------------------------------------------------------

export function monthlyVAT(transactions: Transaction[], year: number, rules: RuleSet): MonthlyVAT[] {
  const map = new Map<string, { output: number; input: number }>()
  for (const t of transactions) {
    if (!t.date.startsWith(String(year))) continue
    const m = t.date.slice(0, 7)
    const cur = map.get(m) ?? { output: 0, input: 0 }
    if (t.vat === 'standard') {
      if (t.type === 'income') cur.output += t.amount * rules.vat.rate
      else cur.input += t.amount * rules.vat.rate
    }
    map.set(m, cur)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, v]) => ({
      month,
      output: round2(v.output),
      input: round2(v.input),
      net: round2(v.output - v.input),
    }))
}

// ---------------------------------------------------------------------------
// 7 · PAYE — annual tax per employee under the rule-set bands
// ---------------------------------------------------------------------------

export function payeFor(emp: Employee, rules: RuleSet): PayeResult {
  const pension = emp.pension ? emp.annualGross * 0.08 : 0
  const chargeable = round2(Math.max(0, emp.annualGross - pension))
  const { total } = pitOn(chargeable, rules)
  const monthlyTax = round2(total / 12)
  return {
    employee: emp,
    chargeable,
    annualTax: total,
    monthlyTax,
    netMonthly: round2(emp.annualGross / 12 - pension / 12 - monthlyTax),
  }
}

// ---------------------------------------------------------------------------
// 8 · deadline generation
// ---------------------------------------------------------------------------

function isoDate(y: number, m: number, d: number): string {
  const dt = new Date(Date.UTC(y, m - 1, Math.min(d, new Date(Date.UTC(y, m, 0)).getUTCDate())))
  return dt.toISOString().slice(0, 10)
}

export function generateDeadlines(state: AppState, classification: Classification, now: Date): Deadline[] {
  const { profile, year, employees } = state
  const dl: Deadline[] = []
  const y = now.getUTCFullYear()

  // monthly PAYE (next occurrence)
  if (employees.length > 0) {
    const m = now.getUTCMonth() + 1
    const nextPaye = now.getUTCDate() <= 10 ? isoDate(y, m, 10) : isoDate(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, 10)
    dl.push({
      id: 'paye-monthly',
      title: 'PAYE remittance (previous month salaries)',
      legalBasis: 'State IRS — due by the 10th of the following month',
      dueDate: nextPaye,
      kind: 'PAYE',
      penaltyNote: `${PENALTIES.payeLate.basis} — 10% of unremitted tax + interest`,
    })
  }

  // monthly VAT (if registered)
  if (classification.vatRequired) {
    const m = now.getUTCMonth() + 1
    const nextVat = now.getUTCDate() <= 21 ? isoDate(y, m, 21) : isoDate(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, 21)
    dl.push({
      id: 'vat-monthly',
      title: 'VAT return & payment (previous month)',
      legalBasis: 'NRS — due by the 21st of the following month',
      dueDate: nextVat,
      kind: 'VAT',
      penaltyNote: `${PENALTIES.vatLate.basis}`,
    })
  }

  // monthly WHT (if not small and deductions exist)
  if (!classification.isSmall) {
    const m = now.getUTCMonth() + 1
    const nextWht = now.getUTCDate() <= 21 ? isoDate(y, m, 21) : isoDate(m === 12 ? y + 1 : y, m === 12 ? 1 : m + 1, 21)
    dl.push({
      id: 'wht-monthly',
      title: 'WHT remittance & credit notes (previous month)',
      legalBasis: 'NRS / State IRS — due by the 21st of the following month',
      dueDate: nextWht,
      kind: 'WHT',
      penaltyNote: 'NTAA 2025 — late remittance attracts penalty and disallows deduction',
    })
  }

  // employer PAYE annual return — 31 January
  if (employees.length > 0) {
    dl.push({
      id: 'paye-annual',
      title: 'Employer annual PAYE return (Form H1)',
      legalBasis: 'State IRS — 31 January for the preceding year',
      dueDate: isoDate(now.getUTCMonth() === 0 && now.getUTCDate() <= 31 ? y : y + 1, 1, 31),
      kind: 'PAYE_ANNUAL',
      penaltyNote: 'NTAA 2025 — ₦100,000 first month + ₦50,000 monthly while in default',
    })
  }

  // PIT self assessment — 31 March (individuals)
  if (profile.structure !== 'limited_company') {
    dl.push({
      id: 'pit-annual',
      title: `Personal income tax return (${year - 1} income year)`,
      legalBasis: 'State IRS — self-assessment due 31 March',
      dueDate: isoDate(now.getUTCMonth() <= 2 && !(now.getUTCMonth() === 2 && now.getUTCDate() > 31) ? year : year + 1, 3, 31),
      kind: 'PIT',
      penaltyNote: 'NTAA 2025 — ₦100,000 first month + ₦50,000 monthly while in default',
    })
  }

  // CIT — FYE + 6 months (or 18 months post-incorporation, whichever earlier)
  if (profile.structure === 'limited_company') {
    const fye = new Date(Date.UTC(year, profile.fyEndMonth, 0))
    const citDue = new Date(fye)
    citDue.setUTCMonth(citDue.getUTCMonth() + 6)
    // 18 months after incorporation cap
    if (profile.incorporatedOn) {
      const inc = new Date(profile.incorporatedOn + 'T00:00:00Z')
      const cap = new Date(inc)
      cap.setUTCMonth(cap.getUTCMonth() + 18)
      if (!isNaN(cap.getTime()) && cap < citDue) citDue.setTime(cap.getTime())
    }
    dl.push({
      id: 'cit-annual',
      title: `CIT return ${year} (with ${classification.isSmall ? '0% rate — mandatory nil/value filing' : 'audited accounts'})`,
      legalBasis: 'NTAA 2025 — within 6 months of financial year-end (or 18 months of incorporation)',
      dueDate: citDue.toISOString().slice(0, 10),
      kind: 'CIT',
      penaltyNote: 'NTAA 2025 — ₦100,000 first month + ₦50,000 monthly while in default',
    })
  }

  return dl.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export type DeadlineUrgency = 'overdue' | 'due-soon' | 'upcoming'
export function urgency(dueDate: string, now: Date): { kind: DeadlineUrgency; days: number } {
  const today = now.toISOString().slice(0, 10)
  const days = Math.round((new Date(dueDate + 'T00:00:00Z').getTime() - new Date(today + 'T00:00:00Z').getTime()) / 86_400_000)
  if (days < 0) return { kind: 'overdue', days: -days }
  if (days <= 10) return { kind: 'due-soon', days }
  return { kind: 'upcoming', days }
}

// ---------------------------------------------------------------------------
// 9 · compliance health score
// ---------------------------------------------------------------------------

export function complianceScore(state: AppState, classification: Classification): { score: number; checks: { label: string; ok: boolean; fix: string }[] } {
  const checks: { label: string; ok: boolean; fix: string }[] = []
  const hasTIN = /^(\d{8,12}|.{6,})$/.test(state.profile.tin.trim()) && state.profile.tin.trim().length > 0
  checks.push({
    label: 'Tax ID (TIN) recorded',
    ok: hasTIN,
    fix: 'Add your TIN in Business Profile — NTAA 2025 fines non-registration ₦50,000 + ₦25,000/month.',
  })
  checks.push({
    label: 'Classification resolved under NTA 2025',
    ok: state.onboarded,
    fix: 'Complete the classification questions in Business Profile.',
  })
  checks.push({
    label: 'Transactions recorded this year',
    ok: state.transactions.some((t) => t.date.startsWith(String(state.year))),
    fix: 'Import a CSV or add sales & expenses — books of account are a legal duty.',
  })
  const noTinIncomes = state.transactions.filter((t) => t.type === 'expense' && !t.partyHasTIN && t.amount >= 25_000)
  checks.push({
    label: 'Vendor Tax IDs verified on expense payments',
    ok: noTinIncomes.length === 0,
    fix: '₦5m penalty for contracting vendors without a Tax ID; WHT rate doubles without TIN.',
  })
  const whtOk = classification.isSmall || !state.transactions.some((t) => t.type === 'expense' && (t.whtRate || 0) === 0 && ['Contractor / outsourced services', 'Professional fees paid (legal, audit)', 'Purchases of goods / inventory'].includes(t.category))
  checks.push({
    label: 'WHT captured on supplier payments',
    ok: whtOk,
    fix: 'Non-small businesses must deduct 2%/5%/10% WHT and remit by the 21st.',
  })
  const payrollOk = state.employees.length === 0 || state.employees.every((e) => e.annualGross > 0)
  checks.push({ label: 'Payroll set up for PAYE', ok: payrollOk, fix: 'Add employees so monthly PAYE (10th) can be computed.' })

  const score = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100)
  return { score, checks }
}
