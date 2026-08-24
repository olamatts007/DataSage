import React, { useState } from 'react'
import { useStore, useEngine } from '../state/store'
import { NIGERIAN_STATES, SECTORS, PENALTIES } from '../lib/rules'
import { naira } from '../lib/format'
import { PageHead, Notice, Icon } from '../components/ui'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function Profile() {
  const { state, dispatch } = useStore()
  const { classification: cls } = useEngine()
  const p = state.profile
  const [step, setStep] = useState(0)
  const set = (patch: Partial<typeof p>) => dispatch({ type: 'setProfile', profile: patch })

  const money = (v: number, cb: (n: number) => void) => (
    <input className="inp mono" inputMode="numeric" value={v === 0 ? '' : v}
      onChange={(e) => cb(Number(e.target.value.replace(/[^0-9.]/g, '')) || 0)}
      placeholder="0" />
  )

  return (
    <div>
      <PageHead
        title="Business Profile & NTA 2025 Classification"
        sub="Three legal answers determine your entire compliance posture: turnover, fixed assets, and whether you render professional services. Everything downstream — CIT rate, VAT, WHT, levies — follows from here."
        right={<span className={`chip ${cls.isSmall ? 'green' : 'blue'}`}>{cls.isSmall ? 'SMALL COMPANY' : 'STANDARD / NOT SMALL'}</span>}
      />

      <div className="stepper no-print">
        {[0, 1, 2].map((i) => <div key={i} className={`stp ${i < step ? 'done' : i === step ? 'cur' : ''}`} />)}
      </div>

      {step === 0 && (
        <div className="card card-pad">
          <h3 className="card-title">Step 1 — Identity & registration</h3>
          <p className="card-sub">NTAA 2025 makes a Tax ID mandatory for every taxable person. Individuals use their NIN; registered businesses use their CAC-linked TIN.</p>
          <div className="frow g2">
            <div>
              <label className="lab">Business / trading name</label>
              <input className="inp" value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Ada's Kitchen & Foods Ltd" />
            </div>
            <div>
              <label className="lab">Tax ID (TIN)</label>
              <input className="inp mono" value={p.tin} onChange={(e) => set({ tin: e.target.value })} placeholder="e.g. 20844351-0001 or NIN" />
              <div className="hint">Late registration fine: {naira(PENALTIES.noTIN.firstMonth)} first month + {naira(PENALTIES.noTIN.perMonthAfter)}/month while unregistered.</div>
            </div>
            <div>
              <label className="lab">Legal structure</label>
              <select className="inp" value={p.structure} onChange={(e) => set({ structure: e.target.value as any })}>
                <option value="limited_company">Limited liability company (CIT applies)</option>
                <option value="enterprise">Registered business name / enterprise (PIT applies)</option>
                <option value="sole_proprietor">Sole proprietor — no CAC registration (PIT applies)</option>
                <option value="partnership">Partnership (PIT applies to partners)</option>
              </select>
              <div className="hint">Limited companies pay CIT to the NRS; unincorporated businesses pay PIT to their State IRS.</div>
            </div>
            <div>
              <label className="lab">State (tax residence)</label>
              <select className="inp" value={p.state} onChange={(e) => set({ state: e.target.value })}>
                {NIGERIAN_STATES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <div className="hint">PAYE and PIT are remitted to this state's Internal Revenue Service.</div>
            </div>
            <div>
              <label className="lab">Sector</label>
              <select className="inp" value={p.sector} onChange={(e) => set({ sector: e.target.value })}>
                <option value="">Choose…</option>
                {SECTORS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="lab">Date incorporated / commenced (optional)</label>
              <input className="inp" type="date" value={p.incorporatedOn} onChange={(e) => set({ incorporatedOn: e.target.value })} />
              <div className="hint">New companies must file their first CIT return within 18 months of incorporation.</div>
            </div>
          </div>
          <div className="flex-between mt24 no-print">
            <span />
            <button className="btn btn-primary" onClick={() => setStep(1)}>Continue <Icon name="arrow" size={14} /></button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="card card-pad">
          <h3 className="card-title">Step 2 — The small-company tests (NTA 2025)</h3>
          <p className="card-sub">Answer carefully: these three facts decide whether you qualify for 0% CIT, CGT exemption, Development Levy exemption and WHT relief.</p>
          <div className="frow g2">
            <div>
              <label className="lab">Expected annual turnover (₦)</label>
              {money(p.declaredTurnover, (n) => set({ declaredTurnover: n }))}
              <div className="hint">Small-company ceiling: {naira(100_000_000)}. The engine switches to your recorded turnover once the ledger is populated.</div>
            </div>
            <div>
              <label className="lab">Total fixed assets (₦)</label>
              {money(p.fixedAssets, (n) => set({ fixedAssets: n }))}
              <div className="hint">Land, buildings, plant, machinery, vehicles — ceiling {naira(250_000_000)}.</div>
            </div>
            <div>
              <label className="lab">Financial year-end month</label>
              <select className="inp" value={p.fyEndMonth} onChange={(e) => set({ fyEndMonth: Number(e.target.value) })}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
              <div className="hint">CIT returns are due 6 months after this date.</div>
            </div>
            {p.structure !== 'limited_company' && (
              <div>
                <label className="lab">Annual rent paid by proprietor (₦)</label>
                {money(p.rentPaidByOwner, (n) => set({ rentPaidByOwner: n }))}
                <div className="hint">New rent relief: lower of 20% of rent paid or ₦500,000 — replaces the abolished CRA.</div>
              </div>
            )}
          </div>
          <div className="grid g2 mt16">
            <label className="check-row">
              <input type="checkbox" checked={p.isProfessionalServices} onChange={(e) => set({ isProfessionalServices: e.target.checked })} />
              <div>
                <div className="t">We render professional services</div>
                <div className="d">Legal, accounting, medical, consultancy and similar. NTA 2025 expressly excludes professional-service businesses from the small-company class — you keep standard rates regardless of turnover.</div>
              </div>
            </label>
            <label className="check-row">
              <input type="checkbox" checked={p.vatOptIn} onChange={(e) => set({ vatOptIn: e.target.checked })} />
              <div>
                <div className="t">Opt in to VAT voluntarily</div>
                <div className="d">Relieved small businesses may still register, charge 7.5% and claim input VAT — useful if your customers are VAT-registered companies.</div>
              </div>
            </label>
          </div>
          <div className="flex-between mt24 no-print">
            <button className="btn btn-ghost" onClick={() => setStep(0)}>Back</button>
            <button className="btn btn-primary" onClick={() => setStep(2)}>See my classification <Icon name="arrow" size={14} /></button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid">
          <div className={`card card-pad`} style={{ borderTop: `4px solid ${cls.isSmall ? 'var(--green-600)' : 'var(--gold-500)'}` }}>
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">Your NTA 2025 classification</h3>
                <p className="card-sub">Live result — changes automatically as your records grow.</p>
              </div>
              <span className={`chip ${cls.isSmall ? 'green' : 'gold'}`} style={{ fontSize: 12.5, padding: '5px 14px' }}>
                {cls.isSmall ? '✦ SMALL COMPANY' : 'STANDARD TAXPAYER'}
              </span>
            </div>
            <Notice tone={cls.isSmall ? 'green' : 'blue'} title={cls.isSmall ? '0% CIT · CGT-exempt · Development-Levy-exempt · WHT-relieved · VAT-relieved' : 'Standard compliance applies'}>
              {cls.isSmall
                ? 'You qualify for the full small-business relief package. Note: you are still a taxable person — register your Tax ID, keep books (this ledger), and file a return within 6 months of year-end even at 0%.'
                : p.structure === 'limited_company'
                  ? 'You fall outside small-company relief: 30% CIT + 4% Development Levy on assessable profit, VAT registration & monthly returns, WHT duties both ways.'
                  : 'Unincorporated businesses are assessed under the new Personal Income Tax bands (0–25%) with rent relief — file with your State IRS by 31 March.'}
            </Notice>
            <div className="mt16">
              <div className="lab" style={{ marginBottom: 6 }}>How the engine reached this</div>
              {cls.reasons.map((r, i) => (
                <div key={i} className="row small mb8"><Icon name="check" size={13} /> {r}</div>
              ))}
              <div className="hint mt8">Turnover used: <b>{naira(cls.turnoverUsed)}</b> ({cls.turnoverSource === 'records' ? 'from your ledger' : 'your declared estimate'}). Fixed assets on record: <b>{naira(p.fixedAssets)}</b>.</div>
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="card-title">Obligations generated for {p.name || 'your business'}</h3>
            <table className="tbl mt8">
              <thead><tr><th>#</th><th>Obligation</th><th>Applies</th><th>What to do</th></tr></thead>
              <tbody>
                {cls.obligations.map((o, i) => (
                  <tr key={o.code}>
                    <td className="mono dim">{String(i + 1).padStart(2, '0')}</td>
                    <td style={{ fontWeight: 600 }}>{o.title}</td>
                    <td>{o.applies ? <span className="chip green">yes</span> : <span className="chip">n/a</span>}</td>
                    <td className="small dim">{o.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex-between no-print">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
            <div className="row">
              <button className="btn btn-gold" onClick={() => { dispatch({ type: 'onboarded' }); window.location.hash = '#/records' }}>
                Save & start collating records <Icon name="arrow" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
