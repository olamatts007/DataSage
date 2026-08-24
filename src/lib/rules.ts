// ─────────────────────────────────────────────────────────────────────────────
// Versioned Nigerian tax rule sets.
//
//   NTA2025 — the gazetted 2025 reform Acts, effective 1 January 2026:
//       • Nigeria Tax Act 2025 (rates, thresholds, reliefs)
//       • Nigeria Tax Administration Act 2025 (registration, deadlines, penalties)
//       • Nigeria Revenue Service Act 2025 (NRS replaces FIRS)
//       • Joint Revenue Board Act 2025
//       • Deduction of Tax at Source (Withholding) Regulations 2024
//
//   FA2021 — the repealed regime (CITA + Finance Acts, to FA 2023) kept so the
//   app can show an MSME exactly what the reform saves them.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuleId } from './types'

export interface PITBand {
  upto: number // cumulative ceiling of the band (Infinity for top band)
  rate: number
  label: string
}

export interface RuleSet {
  id: RuleId
  title: string
  shortTitle: string
  effective: string
  collector: string
  smallCompany: {
    turnoverLimit: number
    fixedAssetLimit: number
    professionalExcluded: boolean
  }
  cit: {
    smallRate: number
    /** pre-2026 medium band (₦25m–₦100m @ 20%); removed by NTA 2025 */
    mediumRate: number | null
    mediumLimit: number | null
    standardRate: number
  }
  developmentLevy: {
    label: string
    rate: number
    smallExempt: boolean
    replaces?: string
  }
  pitBands: PITBand[]
  pitRelief: {
    kind: 'rent_relief' | 'cra'
    describe: string
  }
  rentRelief: { pct: number; cap: number } | null
  vat: {
    rate: number
    registrationNote: string
    smallBusinessRelief: boolean
  }
  thresholds: {
    vatNote: string
  }
}

export const NTA2025: RuleSet = {
  id: 'NTA2025',
  title: 'Nigeria Tax Act 2025 (gazetted, effective 1 Jan 2026)',
  shortTitle: 'NTA 2025',
  effective: '1 January 2026',
  collector: 'Nigeria Revenue Service (NRS)',
  smallCompany: {
    turnoverLimit: 100_000_000,
    fixedAssetLimit: 250_000_000,
    professionalExcluded: true,
  },
  cit: {
    smallRate: 0,
    mediumRate: null, // medium-sized category abolished in the final Act
    mediumLimit: null,
    standardRate: 0.30,
  },
  developmentLevy: {
    label: 'Development Levy',
    rate: 0.04,
    smallExempt: true,
    replaces: 'replaces Tertiary Education Tax, NASENI levy, Police Trust Fund levy & IT levy',
  },
  pitBands: [
    { upto: 800_000, rate: 0, label: 'First ₦800,000' },
    { upto: 3_000_000, rate: 0.15, label: 'Next ₦2,200,000' },
    { upto: 12_000_000, rate: 0.18, label: 'Next ₦9,000,000' },
    { upto: 25_000_000, rate: 0.21, label: 'Next ₦13,000,000' },
    { upto: 50_000_000, rate: 0.23, label: 'Next ₦25,000,000' },
    { upto: Infinity, rate: 0.25, label: 'Above ₦50,000,000' },
  ],
  pitRelief: {
    kind: 'rent_relief',
    describe:
      'Consolidated Relief Allowance abolished; rent relief = lower of 20% of annual rent paid or ₦500,000',
  },
  rentRelief: { pct: 0.2, cap: 500_000 },
  vat: {
    rate: 0.075,
    registrationNote:
      'Small businesses (≤ ₦100m turnover) are relieved of the obligation to register and charge VAT, but may opt in voluntarily',
    smallBusinessRelief: true,
  },
  thresholds: {
    vatNote: 'NTA 2025 relieves qualifying small businesses from VAT registration & collection',
  },
}

export const FA2021: RuleSet = {
  id: 'FA2021',
  title: 'CITA + Finance Acts (repealed regime, to 31 Dec 2025)',
  shortTitle: 'Old law (pre-2026)',
  effective: 'until 31 December 2025',
  collector: 'Federal Inland Revenue Service (FIRS)',
  smallCompany: {
    turnoverLimit: 25_000_000,
    fixedAssetLimit: Infinity,
    professionalExcluded: true,
  },
  cit: {
    smallRate: 0,
    mediumRate: 0.20,
    mediumLimit: 100_000_000,
    standardRate: 0.30,
  },
  developmentLevy: {
    label: 'Tertiary Education Tax et al.',
    rate: 0.03,
    smallExempt: true, // simplified: TET applied to ₦25m+ ; NASENI/PTF additional
    replaces: 'fragmented levies: TET 3%, NASENI 0.25%, Police Trust Fund, IT levy',
  },
  pitBands: [
    { upto: 300_000, rate: 0.07, label: 'First ₦300,000' },
    { upto: 600_000, rate: 0.11, label: 'Next ₦300,000' },
    { upto: 1_100_000, rate: 0.15, label: 'Next ₦500,000' },
    { upto: 1_600_000, rate: 0.19, label: 'Next ₦500,000' },
    { upto: 3_200_000, rate: 0.21, label: 'Next ₦1,600,000' },
    { upto: Infinity, rate: 0.24, label: 'Above ₦3,200,000' },
  ],
  pitRelief: {
    kind: 'cra',
    describe: 'Consolidated Relief Allowance = ₦200,000 or 1% of gross (higher) + 20% of gross',
  },
  rentRelief: null,
  vat: {
    rate: 0.075,
    registrationNote: 'Registration & charging compulsory above ₦25m taxable supplies (FA 2019)',
    smallBusinessRelief: false,
  },
  thresholds: {
    vatNote: '₦25m VAT registration threshold',
  },
}

export const RULESETS: Record<RuleId, RuleSet> = { NTA2025, FA2021 }

// ── Withholding tax (Deduction of Tax at Source (Withholding) Regulations 2024) ─

export interface WHTClass {
  key: string
  label: string
  company: number // resident companies
  individual: number // resident individuals
}

export const WHT_RATES: WHTClass[] = [
  { key: 'dividend', label: 'Dividends', company: 0.10, individual: 0.10 },
  { key: 'interest', label: 'Interest', company: 0.10, individual: 0.10 },
  { key: 'rent', label: 'Rent', company: 0.10, individual: 0.10 },
  { key: 'royalty', label: 'Royalties', company: 0.10, individual: 0.05 },
  { key: 'professional', label: 'Professional / consultancy / management / commission fees', company: 0.05, individual: 0.05 },
  { key: 'supplies', label: 'Supply of goods or materials (non-manufacturer)', company: 0.02, individual: 0.02 },
  { key: 'construction', label: 'Construction (roads, buildings, bridges, power plants)', company: 0.02, individual: 0.02 },
  { key: 'services', label: 'All other services / contracts', company: 0.02, individual: 0.02 },
  { key: 'directors', label: "Directors' fees", company: 0.15, individual: 0.15 },
]

/** Regulation 13(4): recipient without a Tax ID → double the rate (non-passive income). */
export function whtRateFor(key: string, recipientIsCompany: boolean, hasTIN: boolean): number {
  const cls = WHT_RATES.find((w) => w.key === key)
  if (!cls) return 0
  const base = recipientIsCompany ? cls.company : cls.individual
  return hasTIN ? base : base * 2
}

// ── NTAA 2025 administrative penalties (used for "cost of default" education) ──

export const PENALTIES = {
  lateFiling: {
    firstMonth: 100_000,
    perMonthAfter: 50_000,
    basis: 'NTAA 2025 — failure to file returns',
  },
  noTIN: {
    firstMonth: 50_000,
    perMonthAfter: 25_000,
    basis: 'NTAA 2025 s.100 — failure to register for a Tax ID',
  },
  unregisteredVendor: {
    amount: 5_000_000,
    basis: 'NTAA 2025 — awarding contracts to vendors without a Tax ID',
  },
  vatLate: {
    firstMonth: 50_000,
    perMonthAfter: 25_000,
    surchargePct: 0.10,
    basis: 'NTAA 2025 — late VAT return/remittance (+10% of tax & interest at CBN MPR)',
  },
  payeLate: {
    surchargePct: 0.10,
    basis: 'NTAA 2025 — PAYE not remitted by the 10th (+ interest at CBN MPR)',
  },
}

// ── VAT categories (NTA 2025 First Schedule, simplified for MSME use) ──────────

export interface CategoryPreset {
  name: string
  vat: 'standard' | 'zero_rated' | 'exempt' | 'non_vatable'
  whtKey: string | null
  hint: string
}

export const INCOME_CATEGORIES: CategoryPreset[] = [
  { name: 'Product / goods sales', vat: 'standard', whtKey: 'supplies', hint: 'Standard-rated 7.5% unless food staples' },
  { name: 'Food staples & unprocessed agro produce', vat: 'zero_rated', whtKey: 'supplies', hint: '0% VAT under NTA 2025' },
  { name: 'General services rendered', vat: 'standard', whtKey: 'services', hint: 'Customer withholds 2%' },
  { name: 'Professional / consultancy fees', vat: 'standard', whtKey: 'professional', hint: 'Customer withholds 5%' },
  { name: 'Digital & online sales', vat: 'standard', whtKey: 'services', hint: 'Standard-rated' },
  { name: 'Export sales of goods', vat: 'zero_rated', whtKey: null, hint: '0% VAT (exports)' },
  { name: 'Medical / educational services', vat: 'exempt', whtKey: null, hint: 'VAT-exempt supplies' },
  { name: 'Interest earned', vat: 'exempt', whtKey: 'interest', hint: '10% WHT by payer' },
  { name: 'Rental income (commercial)', vat: 'standard', whtKey: 'rent', hint: '10% WHT by tenant' },
  { name: 'Other income', vat: 'standard', whtKey: null, hint: '' },
]

export const EXPENSE_CATEGORIES: CategoryPreset[] = [
  { name: 'Purchases of goods / inventory', vat: 'standard', whtKey: 'supplies', hint: 'Input VAT 7.5%; deduct 2% WHT if not small' },
  { name: 'Contractor / outsourced services', vat: 'standard', whtKey: 'services', hint: 'Input VAT; deduct 2% WHT' },
  { name: 'Professional fees paid (legal, audit)', vat: 'standard', whtKey: 'professional', hint: 'Input VAT; deduct 5% WHT' },
  { name: 'Rent paid', vat: 'non_vatable', whtKey: 'rent', hint: 'Deduct 10% WHT on rent' },
  { name: 'Salaries & wages', vat: 'non_vatable', whtKey: null, hint: 'Handle in Payroll (PAYE)' },
  { name: 'Transport, fuel & logistics', vat: 'standard', whtKey: 'services', hint: '' },
  { name: 'Marketing & advertising', vat: 'standard', whtKey: 'services', hint: '' },
  { name: 'Utilities & telecom', vat: 'standard', whtKey: null, hint: 'Input VAT where charged' },
  { name: 'Bank charges & interest expense', vat: 'exempt', whtKey: null, hint: 'VAT-exempt financial services' },
  { name: 'Repairs & maintenance', vat: 'standard', whtKey: 'services', hint: '' },
  { name: 'Depreciation of fixed assets', vat: 'non_vatable', whtKey: null, hint: 'Accounting expense (capital allowance applies in full filings)' },
  { name: 'Purchase of fixed assets (capital)', vat: 'standard', whtKey: 'supplies', hint: 'Mark as non-deductible capital item' },
  { name: 'Other operating expense', vat: 'standard', whtKey: null, hint: '' },
]

export const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno','Cross River',
  'Delta','Ebonyi','Edo','Ekiti','Enugu','FCT Abuja','Gombe','Imo','Jigawa','Kaduna','Kano',
  'Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa','Niger','Ogun','Ondo','Osun','Oyo',
  'Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
]

export const SECTORS = [
  'Retail & trading', 'Manufacturing', 'Agriculture & agro-processing', 'Food & hospitality',
  'ICT & digital services', 'Professional services', 'Construction & real estate',
  'Transport & logistics', 'Health & pharmaceuticals', 'Education & training',
  'Creative & media', 'Energy & utilities', 'Other',
]
