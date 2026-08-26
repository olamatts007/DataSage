import { AppState, Employee, Transaction } from './types'
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from './rules'
import { uid } from './format'

function tx(
  date: string,
  type: 'income' | 'expense',
  category: string,
  description: string,
  amount: number,
  opts: Partial<Transaction> = {}
): Transaction {
  const table = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const preset = table.find((c) => c.name === category)
  return {
    id: uid(),
    date, type, category, description, amount,
    vat: opts.vat ?? (preset?.vat ?? 'standard'),
    whtRate: opts.whtRate ?? 0,
    partyName: opts.partyName ?? '',
    partyHasTIN: opts.partyHasTIN ?? true,
    nonDeductible: opts.nonDeductible ?? false,
  }
}

/** Small-company scenario — packaged foods Ltd, ~₦42m turnover: 0% CIT under NTA 2025 */
export function smallFoodsScenario(): AppState {
  const t: Transaction[] = []
  const m = [
    ['01', 3_180_000], ['02', 3_420_000], ['03', 4_050_000], ['04', 3_760_000],
    ['05', 4_290_000], ['06', 4_410_000], ['07', 4_830_000], ['08', 4_320_000],
  ] as const
  m.forEach(([mm, sales], i) => {
    t.push(tx(`2026-${mm}-05`, 'income', 'Food staples & unprocessed agro produce', `Wholesale packaged foods — batch ${i + 1}`, Math.round(sales * 0.62), { partyName: 'Market distributors' }))
    t.push(tx(`2026-${mm}-14`, 'income', 'Product / goods sales', `Supermarket supply — fortified lines`, Math.round(sales * 0.28), { partyName: 'ShopCity Ltd', whtRate: 0 }))
    t.push(tx(`2026-${mm}-22`, 'income', 'Digital & online sales', `Online store orders`, Math.round(sales * 0.10), { partyName: 'Web customers' }))
    t.push(tx(`2026-${mm}-03`, 'expense', 'Purchases of goods / inventory', 'Raw materials — grains, flour, packaging', Math.round(sales * 0.34), { partyName: 'AgroSource Ng' }))
    t.push(tx(`2026-${mm}-10`, 'expense', 'Transport, fuel & logistics', 'Distribution fleet fuel & logistics', 210_000 + i * 12_000, { partyName: 'HaulPro' }))
    t.push(tx(`2026-${mm}-15`, 'expense', 'Utilities & telecom', 'Factory power (band A) + internet', 145_000, { partyName: 'IKEDC' }))
    if (i % 2 === 1) t.push(tx(`2026-${mm}-18`, 'expense', 'Marketing & advertising', 'Instagram/WhatsApp campaigns', 95_000, { partyName: 'AdSpark Media', partyHasTIN: false }))
  })
  t.push(tx('2026-03-02', 'expense', 'Rent paid', 'Warehouse rent (annual)', 2_400_000, { partyName: 'Landlord — Chief Okoro' }))
  t.push(tx('2026-01-20', 'expense', 'Purchase of fixed assets (capital)', 'Sealing & packaging machine', 3_200_000, { partyName: 'EquipNg Ltd', nonDeductible: true }))
  t.push(tx('2026-06-11', 'expense', 'Professional fees paid (legal, audit)', 'External accountant retainer', 350_000, { partyName: 'BrightBooks Advisory' }))

  const employees: Employee[] = [
    { id: uid(), name: 'Adaeze Nwosu', role: 'Managing Director', annualGross: 4_800_000, pension: true },
    { id: uid(), name: 'Tunde Bello', role: 'Production lead', annualGross: 1_920_000, pension: true },
    { id: uid(), name: 'Chiamaka Eze', role: 'Sales & logistics', annualGross: 1_440_000, pension: true },
  ]

  return {
    profile: {
      name: "Ada's Kitchen & Foods Ltd",
      tin: '20844351-0001',
      structure: 'limited_company',
      sector: 'Food & hospitality',
      state: 'Lagos',
      isProfessionalServices: false,
      fyEndMonth: 12,
      declaredTurnover: 48_000_000,
      fixedAssets: 26_500_000,
      vatOptIn: true,
      rentPaidByOwner: 0,
      incorporatedOn: '2022-04-15',
    },
    transactions: t,
    employees,
    filings: [],
    year: 2026,
    onboarded: true,
  }
}

/** Standard-company scenario — ₦160m turnover: 30% CIT + 4% Development Levy under NTA 2025 */
export function standardTradingScenario(): AppState {
  const t: Transaction[] = []
  const m = [
    ['01', 11_800_000], ['02', 12_600_000], ['03', 13_900_000], ['04', 12_250_000],
    ['05', 14_100_000], ['06', 13_450_000], ['07', 15_200_000], ['08', 14_600_000],
  ] as const
  m.forEach(([mm, sales], i) => {
    t.push(tx(`2026-${mm}-06`, 'income', 'Product / goods sales', `Consumer electronics distribution`, Math.round(sales * 0.7), { partyName: 'Retail network', whtRate: 0.02 }))
    t.push(tx(`2026-${mm}-16`, 'income', 'General services rendered', `Installation & support contracts`, Math.round(sales * 0.2), { partyName: 'Corporate clients', whtRate: 0.02 }))
    t.push(tx(`2026-${mm}-24`, 'income', 'Product / goods sales', `Bulk supply — state project`, Math.round(sales * 0.1), { partyName: 'State contractor', whtRate: 0.02 }))
    t.push(tx(`2026-${mm}-04`, 'expense', 'Purchases of goods / inventory', 'Stock purchase — OEM imports landed', Math.round(sales * 0.52), { partyName: 'Import partner', whtRate: 0.02 }))
    t.push(tx(`2026-${mm}-12`, 'expense', 'Professional fees paid (legal, audit)', 'Legal & compliance retainer', 420_000, { partyName: 'Chambers LP', whtRate: 0.05 }))
    t.push(tx(`2026-${mm}-19`, 'expense', 'Marketing & advertising', 'Media & trade shows', 380_000 + i * 20_000, { partyName: 'MediaBuy Ng', partyHasTIN: i % 3 !== 0, whtRate: 0.02 }))
    t.push(tx(`2026-${mm}-08`, 'expense', 'Transport, fuel & logistics', 'Delivery fleet & diesel', 640_000, { partyName: 'Logistics partner' }))
  })
  t.push(tx('2026-02-01', 'expense', 'Rent paid', 'Showroom & office rent (annual)', 9_600_000, { partyName: 'EstateDev', whtRate: 0.10 }))
  t.push(tx('2026-05-14', 'expense', 'Purchase of fixed assets (capital)', 'Delivery vans (2)', 24_000_000, { partyName: 'AutoCorp', nonDeductible: true, whtRate: 0.02 }))

  const employees: Employee[] = [
    { id: uid(), name: 'Ibrahim Danladi', role: 'CEO', annualGross: 12_000_000, pension: true },
    { id: uid(), name: 'Funke Ogunleye', role: 'Finance manager', annualGross: 6_000_000, pension: true },
    { id: uid(), name: 'Emeka Obi', role: 'Sales manager', annualGross: 4_800_000, pension: true },
    { id: uid(), name: 'Ngozi Umeh', role: 'Customer support', annualGross: 1_800_000, pension: true },
    { id: uid(), name: 'Suleiman Garba', role: 'Warehouse officer', annualGross: 1_500_000, pension: true },
  ]

  return {
    profile: {
      name: 'ZumaTech Distribution Ltd',
      tin: '17732984-0001',
      structure: 'limited_company',
      sector: 'Retail & trading',
      state: 'FCT Abuja',
      isProfessionalServices: false,
      fyEndMonth: 12,
      declaredTurnover: 165_000_000,
      fixedAssets: 92_000_000,
      vatOptIn: true,
      rentPaidByOwner: 0,
      incorporatedOn: '2019-08-02',
    },
    transactions: t,
    employees,
    filings: [],
    year: 2026,
    onboarded: true,
  }
}

/** Sole proprietor scenario — freelance designer: PIT bands + rent relief */
export function solePropScenario(): AppState {
  const t: Transaction[] = []
  const m = [
    ['01', 1_350_000], ['02', 1_120_000], ['03', 1_680_000], ['04', 1_540_000],
    ['05', 1_890_000], ['06', 1_760_000], ['07', 2_050_000], ['08', 1_920_000],
  ] as const
  m.forEach(([mm, sales], i) => {
    t.push(tx(`2026-${mm}-11`, 'income', 'Digital & online sales', `Brand & UI design projects`, Math.round(sales * 0.65), { partyName: 'Overseas clients', whtRate: 0 }))
    t.push(tx(`2026-${mm}-20`, 'income', 'Professional / consultancy fees', `Local retainer — startup studio`, Math.round(sales * 0.35), { partyName: 'Startup studio', whtRate: 0.05 }))
    t.push(tx(`2026-${mm}-02`, 'expense', 'Utilities & telecom', 'Fibre internet + power (solar amortised)', 68_000, { partyName: 'ISPs' }))
    t.push(tx(`2026-${mm}-09`, 'expense', 'Other operating expense', 'Software subscriptions (design tools)', 42_000, { partyName: 'SaaS vendors' }))
    if (i % 3 === 0) t.push(tx(`2026-${mm}-25`, 'expense', 'Marketing & advertising', 'Portfolio ads', 35_000, { partyName: 'Ad platform', partyHasTIN: false }))
  })
  t.push(tx('2026-01-05', 'expense', 'Rent paid', 'Studio apartment — work space share (40%)', 480_000, { partyName: 'Landlord', whtRate: 0.10 }))

  return {
    profile: {
      name: 'Kelechi Design Studio (Kelechi Ade)',
      tin: '',
      structure: 'sole_proprietor',
      sector: 'Creative & media',
      state: 'Rivers',
      isProfessionalServices: true,
      fyEndMonth: 12,
      declaredTurnover: 13_000_000,
      fixedAssets: 2_100_000,
      vatOptIn: false,
      rentPaidByOwner: 1_200_000,
      incorporatedOn: '',
    },
    transactions: t,
    employees: [],
    filings: [],
    year: 2026,
    onboarded: true,
  }
}

export function emptyState(): AppState {
  return {
    profile: {
      name: '',
      tin: '',
      structure: 'limited_company',
      sector: '',
      state: 'Lagos',
      isProfessionalServices: false,
      fyEndMonth: 12,
      declaredTurnover: 0,
      fixedAssets: 0,
      vatOptIn: false,
      rentPaidByOwner: 0,
      incorporatedOn: '',
    },
    transactions: [],
    employees: [],
    filings: [],
    year: 2026,
    onboarded: false,
  }
}
