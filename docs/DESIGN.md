# TaxSage — MSME Tax Compliance for Nigeria's 2025 Tax Reform Acts

**Design & Architecture Document** · v1.0 · August 2026

---

## 1. Problem Statement

Nigerian MSMEs face a radically changed compliance landscape. Sixty-plus legacy levies were
consolidated, thresholds moved 4×, and the Federal Inland Revenue Service (FIRS) became the
Nigeria Revenue Service (NRS) under four Acts signed in June 2025 and gazetted/effective
1 January 2026:

| Instrument | Role in this app |
|---|---|
| **Nigeria Tax Act (NTA) 2025** | Substantive rates, thresholds, reliefs, exemptions |
| **Nigeria Tax Administration Act (NTAA) 2025** | Registration (Tax ID), filing deadlines, penalties, e-records |
| **Nigeria Revenue Service (Establishment) Act 2025** | NRS as collecting authority for federal taxes |
| **Joint Revenue Board (Establishment) Act 2025** | Tax Appeal Tribunal / Office of the Tax Ombud |

Most MSMEs keep paper records, don't know their classification under the new Act, miss the
new deadlines, and overpay (or incur the NTAA's heavier penalties). TaxSage solves the full
loop: **Collate → Process → Report**.

---

## 2. Product Overview

A single-page application that lets an MSME owner:

1. **Collate** — capture sales, purchases, payroll and withholding events (manual entry,
   CSV import, sample data), each tagged with VAT treatment and WHT metadata.
2. **Process** — a versioned **rule engine** classifies the business under NTA 2025 and
   computes CIT/Development Levy, PIT (sole-proprietor bands), VAT net position per month,
   PAYE per employee, and WHT schedules — with full workings shown.
3. **Report** — auto-generated return-ready schedules (CIT self-assessment, VAT return,
   PAYE remittance schedule, WHT credit statement, PIT self-assessment), a dynamic filing
   calendar keyed to the company's financial year-end, and a comparison of liability under
   the old law vs the 2025 Acts.

### Key UX decisions

- **Classification-first onboarding**: the wizard answers three legal questions —
  annual turnover, total fixed assets, and whether the business renders professional
  services — these drive every downstream obligation (NTA 2025, s.56 & the small-company
  definition; professional service firms are excluded from small-company relief).
- **Threshold radar**: a live gauge shows turnover vs the ₦100m small-company ceiling so
  owners see the cliff edge *before* they cross it (classification is turnover-based;
  tax is profit-based — the UI teaches this distinction).
- **Old-vs-New comparison**: because the law changed on 1 Jan 2026, the engine holds two
  rule sets (Finance Act 2021 era vs NTA 2025) and quantifies the MSME's saving.
- **Everything shows its working**: each computed figure can be traced to a legal rule —
  tax opacity is the core MSME pain.

---

## 3. Rule Engine Design

Rules are **data, versioned by effective date** (`src/lib/rules.ts`). A rule set exposes:

```ts
interface RuleSet {
  id: 'FA2021' | 'NTA2025'
  effectiveFrom: string                 // '2026-01-01'
  smallCompany: { turnoverLimit: number; fixedAssetLimit: number; professionalExcluded: boolean }
  cit: { smallRate: number; standardRate: number; mediumBand?: {...} }
  developmentLevy: { rate: number; exemptSmall: boolean }
  pitBands: { upto: number; rate: number }[]
  rentRelief: { pctOfRent: number; cap: number } | null
  vat: { rate: number; registration: 'smallExempt' | 'threshold'; note: string }
  wht: Record<PaymentNature, { residentCompany: number; residentIndividual: number }>
  deadlines: { paye: number; vat: number; wht: number; citMonthsAfterFYE: number; pitDate: '03-31' }
  penalties: {...}
}
```

### 3.1 Small-company test (NTA 2025)

```
isSmall = turnover ≤ ₦100,000,000
       AND totalFixedAssets ≤ ₦250,000,000
       AND NOT professionalServices
```

Consequences when `isSmall`: 0% CIT, CGT exemption, Development-Levy exemption, no WHT
deductions on its income, no obligation to deduct WHT for suppliers, no VAT charging
obligation (voluntary opt-in permitted).

### 3.2 Computation pipeline

```
records ──► annual totals (turnover, deductible opex, capital items)
        ──► assessable profit (add back non-deductibles)
        ──► CIT @ 0% or 30%   +   Development Levy @ 4% (non-small)
        ──► less WHT suffered (credit notes) ──► net payable
sole prop/partnership:
        profit ──► rent relief (min(20% of rent, ₦500k)) ──► PIT bands
        0% ≤₦800k · 15% to ₦3m · 18% to ₦12m · 21% to ₦25m · 23% to ₦50m · 25% above
monthly:
        output VAT (7.5% standard-rated sales) − input VAT = net (due 21st)
        PAYE per employee (bands / 12) remitted by 10th
        WHT deducted from suppliers remitted by 21st (double rate if payee has no Tax ID)
```

### 3.3 Deadline engine

Deadlines are *generated*, never hard-coded: PAYE annual return (31 Jan), PIT self-
assessment (31 Mar), monthly PAYE (10th), monthly VAT/WHT (21st), CIT (FYE + 6 months,
or 18 months after incorporation — whichever is earlier). Penalty exposure shown using
NTAA administrative fines: ₦100,000 first month + ₦50,000/month for failure to file;
₦5m for contracting unregistered vendors; Tax-ID registration default ₦50,000 + ₦25,000/month.

---

## 4. Data Model (client-persisted, localStorage)

| Entity | Key fields |
|---|---|
| `BusinessProfile` | name, tin, structure, sector, isProfessionalServices, fyEndMonth, declaredTurnover, fixedAssets, vatOptIn, rentPaid, state |
| `Transaction` | date, type(income/expense), category, amount (VAT-exclusive), vatTreatment(standard/zero_rated/exempt), whtRate, whtAmount, partyTIN, isCapital/nonDeductible |
| `Employee` | name, annualGross, monthly pension/NHF reliefs optional → PAYE derived |
| `FilingRecord` | period, type, status (filed/pending), filedOn |

Export: CSV for every schedule; one-click **print/PDF** via print stylesheet.

---

## 5. Architecture & Tech Choices

- **React 18 + TypeScript + Vite** — zero backend dependency; deployable anywhere; the tax
  engine runs deterministically in the browser so an MSME can use it offline.
- **No chart library** — bespoke SVG components keep the bundle tiny and the visuals
  on-brand.
- **Rule-set versioning** — the 2025→2026 transition is handled by swapping rule objects,
  not if-statements; future Finance Acts become a new file entry.
- **Persistence** — namespaced localStorage with JSON schema guard; sample-data seeder for
  instant demos.

### Screen map

| Route | Purpose |
|---|---|
| `#/overview` | Compliance health, tax position cards, threshold radar, next deadlines |
| `#/profile` | Classification wizard + obligations list generated from answers |
| `#/records` | Ledger: entry form, filter/search, CSV import/export, VAT/WHT tagging |
| `#/payroll` | Employees, PAYE engine output (monthly + annual), employer return status |
| `#/engine` | Full computation with workings; 2025-vs-2026 comparison |
| `#/reports` | Return schedules: CIT/PIT self-assessment, VAT, WHT, PAYE; print/CSV |
| `#/calendar` | 12-month filing calendar, countdowns, penalty exposure |
| `#/guide` | Plain-English digest of the four Acts keyed to in-app features |
| `#/billing` | Subscription management, receipts, backup/restore, danger zone |

---

## 6. Monetization — Premium paywall

Freemium model with locally-persisted subscription state (`src/lib/billing.ts`, **sandbox** — payments
simulated, no real charge; swap `subscribe` action for a Paystack/Flutterwave webhook to go live).

| Plan | Price | Effective |
|---|---|---|
| **SME Starter (Free)** | ₦0 | classification, 50-record ledger, 3-employee payroll, dashboard, calendar, guide, VAT summary |
| **Premium — Monthly** | ₦7,500 | all features unlocked |
| **Premium — Quarterly** | ₦20,000 | ≈ ₦6,667/mo *(save 11%)* |
| **Premium — Annual** | ₦66,000 | ≈ ₦5,500/mo *(save 27%)* |
| 14-day free trial | — | once per business, no card |

**Entitlement model:** feature keys (`unlimited_records`, `csv_import/export`, `return_schedules`,
`print_export`, `law_compare`, `unlimited_employees`, `backup_restore`, `radar_alerts`) resolved by
`computeEntitlement(subscription, now)` → UI gates via `<FeatureGate>` (blurred preview + upgrade CTA),
`<PremiumBanner>` (inline upsell), and `<LimitMeter>` (usage bars at 80%+ turn amber, 100% red).
Checkout UX: period toggle → sandbox card (Luhn-validated), bank transfer (copy-to-clipboard dedicated
account), or USSD (`*737*…#`) → live receipt & period stamping. Billing screen handles auto-renew
toggling, expiry/days-left, receipts ledger, JSON backup/restore, and downgrade — **records are never
deleted** when a plan lapses; premium surfaces simply re-lock.

## 7. Performance & engineering standards

- **Route-level code splitting** (`React.lazy` + `Suspense`): initial shell ~66 KB gzip; every page is
  its own chunk (2–5 KB gzip) fetched on first visit — measured in the Vite production build.
- **Memoized engine**: the full tax computation, classification and entitlement graphs recompute only
  when their store slices change (`useMemo` on `state`, `state.subscription`).
- **Error boundaries** per route and app-level — one bad screen can never corrupt or lose records.
- **Skeleton loading** states, `aria` roles/labels on dialogs & tabs, keyboard `Escape` to close modals,
  focus-safe forms; PWA manifest + SVG icon; print stylesheet keeps exports clean (gated Chrome hidden).
- **Local-first persistence** with schema-migration merge (`mergeDefaults`) so shipping v2 never breaks
  a v1 workspace; full JSON backup/restore available from Billing.
- **Verified core**: 24 tax-engine assertions + 30 billing assertions run green (edge cases: expiry
  transitions, trial lifecycle, limit enforcement, band boundaries, WHT doubling).

## 8. Compliance mapping (features → law)

| App feature | Legal source |
|---|---|
| Small-company classifier (0% CIT/CGT/DevLevy) | NTA 2025 (small company: ≤₦100m turnover, ≤₦250m fixed assets; professional services excluded) |
| 30% CIT + 4% Development Levy | NTA 2025 development levy replacing TET/NASENI/PTF/IT levies |
| PIT bands, ₦800k exemption, rent relief replaces CRA | NTA 2025 Fourth Schedule |
| VAT 7.5%, zero-rated staples, small-business relief | NTA 2025 VAT provisions (opt-in permitted) |
| WHT schedule 10/5/2/15%, no-TIN double rate | Deduction of Tax at Source (Withholding) Regulations 2024 |
| Monthly 10th/21st deadlines; CIT FYE+6m; PIT 31 Mar | NTAA 2025 filing provisions |
| Penalty exposure cards | NTAA 2025 (fines for default; ₦5m unregistered-vendor sanction) |
| "NRS" as collecting authority, Tax ID terminology | NRS Act 2025; NTAA 2025 |

---

## 7. Limitations & responsible-use notes

- Outputs are **preparation schedules**, not filed returns; submission is on NRS/state
  portals. The app displays this disclaimer in every report footer.
- Edge rules intentionally out of scope in v1: transfer pricing/ETR for ₦50bn+ groups,
  petroleum operations, free-zone sunset 2028, stamp-duty schedules, industry-specific
  incentives (Economic Development Incentive, agric 5-year holiday shown in Guide only).
