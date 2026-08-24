import React, { useState } from 'react'
import { naira } from '../lib/format'
import { PageHead, Notice, Icon } from '../components/ui'
import { WHT_RATES, NTA2025 } from '../lib/rules'

interface Section { id: string; title: string; tag: string; body: React.ReactNode }

export default function Guide() {
  const [open, setOpen] = useState<string>('acts')

  const sections: Section[] = [
    {
      id: 'acts', title: 'The four Acts, gazetted 26 June 2025', tag: 'FOUNDATION',
      body: (
        <>
          <p>Nigeria consolidated 60+ legacy taxes into a modern framework of four instruments, signed in June 2025 and effective <b>1 January 2026</b>:</p>
          <ul>
            <li><b>Nigeria Tax Act (NTA) 2025</b> — the substantive law: rates, thresholds, reliefs, exemptions. This app computes under it.</li>
            <li><b>Nigeria Tax Administration Act (NTAA) 2025</b> — one rulebook for registration (Tax ID), filing, payment and penalties across all taxes and tiers of government.</li>
            <li><b>Nigeria Revenue Service (Establishment) Act 2025</b> — the <b>NRS</b> replaces FIRS as the federal collector (companies, VAT, WHT for companies).</li>
            <li><b>Joint Revenue Board (Establishment) Act 2025</b> — harmonises JTB/JRC, creates the <b>Office of the Tax Ombud</b> — a new, cheaper appeal route for small taxpayers before the Tax Appeal Tribunal.</li>
          </ul>
          <p className="hint">In-app impact: the collector named on your obligations is the NRS for company-level taxes and your State IRS for PIT/PAYE.</p>
        </>
      ),
    },
    {
      id: 'small', title: 'Small companies: the 0% package', tag: 'CIT',
      body: (
        <>
          <p>A company with <b>gross turnover ≤ {naira(NTA2025.smallCompany.turnoverLimit)}</b> and <b>total fixed assets ≤ {naira(NTA2025.smallCompany.fixedAssetLimit)}</b> — and that does <b>not</b> render professional services — is a <b>small company</b> and gets:</p>
          <ul>
            <li><b>0% Companies Income Tax</b> (up from the ₦25m ceiling under the repealed Finance Acts)</li>
            <li><b>Exemption from Capital Gains Tax</b></li>
            <li><b>Exemption from the 4% Development Levy</b></li>
            <li><b>No WHT deducted</b> from payments made to it — and no duty to deduct WHT on its own supplier payments</li>
            <li><b>Relief from VAT registration/charging</b> (voluntary opt-in permitted)</li>
          </ul>
          <p><b>What it must still do:</b> hold a Tax ID, keep proper books (NTAA 2025), and <b>file its annual return within 6 months of year-end</b> — even at a 0% rate. The old 20% medium-company band was abolished in the final Act: you are either small or standard (30%).</p>
          <p className="hint">In-app impact: the Profile wizard applies exactly these three tests; the threshold radar on the Overview tracks your headroom to ₦100m.</p>
        </>
      ),
    },
    {
      id: 'levy', title: 'Development Levy (4%) — levy consolidation', tag: 'CIT',
      body: (
        <>
          <p>Non-small companies pay a single <b>4% Development Levy</b> on assessable profits. It replaces four overlapping charges: the Tertiary Education Tax (3%), NASENI levy (0.25%), Police Trust Fund levy and the IT levy. Small companies and non-resident companies are exempt.</p>
          <p className="hint">In-app impact: the Tax Engine shows CIT and the levy as separate computation lines and compares them with the fragmented old levies.</p>
        </>
      ),
    },
    {
      id: 'pit', title: 'Personal Income Tax — new bands & rent relief', tag: 'PIT',
      body: (
        <>
          <p>Sole proprietors, partnerships, directors and employees are taxed under progressive bands. The <b>first ₦800,000</b> of taxable income is <b>0%</b>; the top rate is 25% above ₦50m:</p>
          <table className="tbl" style={{ maxWidth: 560 }}>
            <thead><tr><th>Taxable income band</th><th className="num">Rate</th></tr></thead>
            <tbody>
              {NTA2025.pitBands.map((b) => (
                <tr key={b.label}><td>{b.label}</td><td className="num">{(b.rate * 100).toFixed(0)}%</td></tr>
              ))}
            </tbody>
          </table>
          <p>The Consolidated Relief Allowance is <b>abolished</b> and replaced by a <b>rent relief</b>: the lower of <b>20% of your annual rent</b> or <b>₦500,000</b>. Statutory pension (8%) remains deductible before bands are applied.</p>
          <p><b>Compensation for job loss</b> is now exempt up to ₦50m (was ₦10m). Individuals' capital gains are taxed at their PIT band rates.</p>
          <p className="hint">In-app impact: the Payroll page applies these bands to each employee; the Engine applies them to proprietor profit with the rent relief captured in your Profile.</p>
        </>
      ),
    },
    {
      id: 'vat', title: 'VAT — 7.5% stays, essentials at 0%', tag: 'VAT',
      body: (
        <>
          <p>The headline VAT rate remains <b>7.5%</b>. The reform widened the 0%/exempt basket to protect consumption: <b>basic food items, medical services & pharmaceuticals, education & materials, electricity generation/transmission</b>, and exports are zero-rated or exempt.</p>
          <p>Qualifying <b>small businesses</b> are relieved of registration and collection but <b>may opt in</b> — sensible when your customers are corporates who can claim your output VAT as input.</p>
          <p>File and remit monthly by the <b>21st</b> of the following month on the NRS e-portal. Input VAT on exempt supplies is not claimable; excess credits carry forward.</p>
          <p className="hint">In-app impact: every ledger line carries a VAT treatment (standard/zero-rated/exempt/out-of-scope); the Engine nets output vs input per month and flags overdue periods on the Calendar.</p>
        </>
      ),
    },
    {
      id: 'wht', title: 'Withholding tax — 2024 Regulations rates', tag: 'WHT',
      body: (
        <>
          <table className="tbl" style={{ maxWidth: 640 }}>
            <thead><tr><th>Payment nature</th><th className="num">Companies</th><th className="num">Individuals</th></tr></thead>
            <tbody>
              {WHT_RATES.map((w) => (
                <tr key={w.key}><td>{w.label}</td><td className="num">{(w.company * 100).toFixed(0)}%</td><td className="num">{(w.individual * 100).toFixed(0)}%</td></tr>
              ))}
            </tbody>
          </table>
          <p>Key changes: supplies & construction down to 2% (from 2.5–5%); professional fees at 5% for residents; directors' fees at 15%. <b>No Tax ID on the payee? The rate doubles.</b> WHT suffered is a credit against your final tax — always collect the credit note.</p>
          <p>Small companies, manufacturers and agro-businesses are relieved of WHT on their income (and of the duty to deduct), slashing one of the biggest MSME cash-flow frictions.</p>
        </>
      ),
    },
    {
      id: 'admin', title: 'Registration, deadlines & the new penalty regime', tag: 'NTAA',
      body: (
        <>
          <ul>
            <li><b>Tax ID (TIN) is mandatory for every taxable person.</b> Individuals: your NIN is your Tax ID. Businesses: CAC-linked registration. Default fine ₦50,000 + ₦25,000/month.</li>
            <li><b>Contracting a vendor without a Tax ID: ₦5,000,000 penalty</b> on the payer. Verify every vendor — the app flags any expense booked to a party without a TIN.</li>
            <li><b>Deadlines:</b> PAYE 10th monthly · VAT & WHT 21st monthly · CIT within 6 months of year-end (or 18 months of incorporation for the first return) · PIT 31 March · employer PAYE annual return 31 January.</li>
            <li><b>Late filing of any return: ₦100,000 first month + ₦50,000/month</b> while the default persists; late VAT adds 10% of the tax plus interest at the CBN rate; late PAYE adds 10% plus interest.</li>
            <li><b>Books of account</b> must be kept and produced on request — this app's ledger is designed to satisfy that duty.</li>
          </ul>
          <p className="hint">In-app impact: the compliance score on the Overview tests these exact items; the Calendar quantifies your exposure.</p>
        </>
      ),
    },
    {
      id: 'incentive', title: 'Incentives kept for MSMEs & growth sectors', tag: 'RELIEFS',
      body: (
        <>
          <ul>
            <li><b>Agric companies</b> (crop production, livestock, dairy, aquaculture): a 5-year tax holiday for qualifying new entrants — food-security push.</li>
            <li><b>Labelled startups</b>: CIT exemption during the labelled period.</li>
            <li><b>Economic Development Incentive</b> replaces Pioneer Status: 5% annual tax credit on qualifying capital expenditure for up to 5 years.</li>
            <li><b>Compensation relief:</b> +50% deduction on wage increases or transport subsidies for employees earning ≤ ₦100,000/month.</li>
            <li><b>CGT on shares:</b> gains below ₦10m in a year (or where proceeds are reinvested) are exempt for small investors.</li>
          </ul>
        </>
      ),
    },
  ]

  const active = sections.find((s) => s.id === open)!

  return (
    <div>
      <PageHead
        title="The 2025 Tax Reform Acts — Plain-English Guide"
        sub="What passed, what changed, and exactly where each rule lives in this app. Educational summary — always confirm interpretations with a licensed tax practitioner."
      />
      <Notice tone="blue" title="Effective dates">
        Signed into law June 2025; the NTA, NTAA, NRS Act and JRB Act took effect <b>1 January 2026</b>. Returns you file in 2026
        covering 2025 income still use the repealed rules for that period — this app's Old-law toggle prices both.
      </Notice>
      <div className="grid mt16" style={{ gridTemplateColumns: '290px 1fr' }}>
        <div className="card card-pad no-print" style={{ alignSelf: 'start' }}>
          <div className="lab" style={{ marginBottom: 8 }}>Contents</div>
          {sections.map((s) => (
            <button key={s.id} onClick={() => setOpen(s.id)}
              className="btn btn-ghost btn-sm"
              style={{
                width: '100%', justifyContent: 'flex-start', marginBottom: 4, fontWeight: open === s.id ? 700 : 500,
                background: open === s.id ? 'var(--green-50)' : undefined, borderColor: open === s.id ? 'var(--green-100)' : undefined,
              }}>
              <span className="chip dark" style={{ fontSize: 9.5, padding: '1px 7px' }}>{s.tag}</span> {s.title}
            </button>
          ))}
        </div>
        <div className="card card-pad">
          <span className="chip gold">{active.tag}</span>
          <h3 className="card-title mt8" style={{ fontSize: 18 }}>{active.title}</h3>
          <div style={{ fontSize: 14 }}>{active.body}</div>
        </div>
      </div>
      <style>{`
        .card ul { padding-left: 18px; margin: 8px 0; }
        .card li { margin-bottom: 6px; }
        .card p { margin: 8px 0; }
      `}</style>
    </div>
  )
}
