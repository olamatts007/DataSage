import React, { useState } from 'react'
import { useStore, useEngine, useEntitlements } from '../state/store'
import { payeFor } from '../lib/engine'
import { naira, uid } from '../lib/format'
import { genericCSV, download } from '../lib/csv'
import { PageHead, Notice, EmptyState, Icon, Stat } from '../components/ui'
import { LimitMeter, FeatureGate, PremiumBanner, UpgradeModal } from '../components/paywall'

export default function Payroll() {
  const { state, dispatch } = useStore()
  const { rules, rulesOld } = useEngine()
  const ent = useEntitlements()
  const [form, setForm] = useState({ name: '', role: '', annualGross: '', pension: true })
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const atLimit = state.employees.length >= ent.limits.employees

  const results = state.employees.map((e) => payeFor(e, rules))
  const monthlyRemit = results.reduce((s, r) => s + r.monthlyTax, 0)
  const annualGross = state.employees.reduce((s, e) => s + e.annualGross, 0)
  const annualPAYE = results.reduce((s, r) => s + r.annualTax, 0)

  const add = () => {
    const g = Number(form.annualGross.replace(/,/g, ''))
    if (!form.name || !g || atLimit) return
    dispatch({ type: 'addEmployee', e: { id: uid(), name: form.name, role: form.role || 'Staff', annualGross: g, pension: form.pension } })
    setForm({ name: '', role: '', annualGross: '', pension: true })
  }

  const markFiled = (kind: 'PAYE' | 'PAYE_ANNUAL') => {
    const period = kind === 'PAYE' ? new Date().toISOString().slice(0, 7) : `FY${state.year - 1}`
    const others = state.filings.filter((f) => !(f.type === kind && f.period === period))
    dispatch({ type: 'setFilings', f: [...others, { id: uid(), type: kind, period, status: 'filed', filedOn: new Date().toISOString().slice(0, 10) }] })
  }

  const exportSchedule = () => {
    download(
      `paye-schedule-${state.year}.csv`,
      genericCSV(
        ['employee', 'role', 'annual_gross', 'pension_8%', 'chargeable_income', 'annual_paye', 'monthly_paye', 'net_monthly'],
        results.map((r) => [r.employee.name, r.employee.role, r.employee.annualGross, r.employee.pension ? r.employee.annualGross * 0.08 : 0, r.chargeable, r.annualTax, r.monthlyTax, r.netMonthly])
      )
    )
  }

  return (
    <div>
      <PageHead
        title="Payroll & PAYE"
        sub={<>PAYE is computed on the <b>new NTA 2025 bands</b> (first ₦800,000 at 0%), after the statutory 8% pension relief. Remit to {state.profile.state} IRS by the <b>10th</b> of the following month; employer annual return due <b>31 January</b>.</>}
        right={
          <button className="btn btn-ghost" onClick={() => ent.can('csv_export') ? exportSchedule() : setUpgradeOpen(true)} disabled={!results.length}>
            <Icon name="download" size={14} /> PAYE schedule CSV {!ent.can('csv_export') && <span className="chip gold" style={{ fontSize: 9.5 }}>★</span>}
          </button>
        }
      />

      {atLimit && (
        <div className="mb16">
          <PremiumBanner
            feature="unlimited_employees"
            message={<>Payroll is full at <b>{ent.limits.employees}</b> employees on the free plan. Go unlimited and grow your team without caps.</>}
          />
        </div>
      )}
      {isFinite(ent.limits.employees) && (
        <div className="mb8"><LimitMeter used={state.employees.length} limit={ent.limits.employees} noun="free employee slots" /></div>
      )}

      <div className="grid g3 mb16">
        <Stat tone="accent" k="Monthly PAYE to remit" v={naira(monthlyRemit)} s={`due 10th of next month · ${state.profile.state} IRS`} />
        <Stat k="Annual payroll (gross)" v={naira(annualGross)} s={`${state.employees.length} employee(s)`} />
        <Stat k="Annual PAYE total" v={naira(annualPAYE)} s="employer annual return (Form H1) by 31 Jan" />
      </div>

      <div className="card card-pad mb16 no-print">
        <h3 className="card-title">Add employee</h3>
        <div className="frow" style={{ gridTemplateColumns: '2fr 1.5fr 1.5fr 1.4fr 0.8fr', gap: 12, alignItems: 'end' }}>
          <div><label className="lab">Full name</label><input className="inp" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tunde Bello" /></div>
          <div><label className="lab">Role</label><input className="inp" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Sales rep" /></div>
          <div><label className="lab">Annual gross salary (₦)</label><input className="inp mono" value={form.annualGross} onChange={(e) => setForm({ ...form, annualGross: e.target.value })} placeholder="1,200,000" /></div>
          <div>
            <label className="lab">Pension (8% relief)</label>
            <select className="inp" value={form.pension ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, pension: e.target.value === 'yes' })}>
              <option value="yes">Deducted (PENCOM)</option>
              <option value="no">Not applicable</option>
            </select>
          </div>
          <div>
            {atLimit ? (
              <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => setUpgradeOpen(true)}>★ Unlock unlimited</button>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={add} disabled={!form.name || !form.annualGross}><Icon name="plus" size={14} /> Add</button>
            )}
          </div>
        </div>
      </div>

      {state.employees.length === 0 ? (
        <div className="card"><EmptyState icon="payroll" title="No employees on payroll"
          action={<span className="small dim">Add your first employee above — PAYE computes instantly.</span>}>
          Employers must deduct PAYE monthly and remit by the 10th. Owner salaries also attract PAYE in limited companies.
        </EmptyState></div>
      ) : (
        <>
          <div className="card card-pad mb16">
            <h3 className="card-title">PAYE engine output — NTA 2025 bands</h3>
            <p className="card-sub">Monthly deduction per employee for the remittance due on the 10th.</p>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead><tr><th>Employee</th><th>Role</th><th className="num">Annual gross</th><th className="num">Pension 8%</th><th className="num">Chargeable</th><th className="num">Annual PAYE</th><th className="num">Monthly PAYE</th><th className="num">Take-home /mo</th><th className="num">Rate</th><th className="no-print" /></tr></thead>
                <tbody>
                  {results.map((r) => {
                    const eff = r.chargeable > 0 ? r.annualTax / r.chargeable : 0
                    return (
                      <tr key={r.employee.id}>
                        <td style={{ fontWeight: 650 }}>{r.employee.name}</td>
                        <td className="small dim">{r.employee.role}</td>
                        <td className="num">{naira(r.employee.annualGross)}</td>
                        <td className="num dim">{r.employee.pension ? naira(r.employee.annualGross * 0.08) : '—'}</td>
                        <td className="num">{naira(r.chargeable)}</td>
                        <td className="num">{naira(r.annualTax)}</td>
                        <td className="num" style={{ fontWeight: 700, color: 'var(--green-800)' }}>{naira(r.monthlyTax)}</td>
                        <td className="num dim">{naira(r.netMonthly)}</td>
                        <td className="num"><span className={`chip ${r.annualTax === 0 ? 'green' : 'gold'}`}>{r.annualTax === 0 ? 'exempt' : `${(eff * 100).toFixed(1)}%`}</span></td>
                        <td className="no-print"><button className="btn btn-danger btn-sm" onClick={() => dispatch({ type: 'deleteEmployee', id: r.employee.id })}><Icon name="trash" size={12} /></button></td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="strong"><td colSpan={5}>Totals</td><td className="num">{naira(annualPAYE)}</td><td className="num">{naira(monthlyRemit)}</td><td colSpan={3} /></tr>
                </tfoot>
              </table>
            </div>
          </div>

          <div className="grid g2">
            <FeatureGate feature="law_compare" label="Old law vs NTA 2025 payroll comparison" compact>
            <div className="card card-pad">
              <h3 className="card-title">Old law vs NTA 2025 — what changed for your staff</h3>
              <p className="card-sub">First ₦800k now tax-free; CRA replaced by rent relief (rent relief is claimed by staff in their own filings, so PAYE here applies statutory pension relief only).</p>
              <table className="tbl">
                <thead><tr><th>Employee</th><th className="num">Old-law PAYE/yr</th><th className="num">NTA 2025 PAYE/yr</th><th className="num">Staff saving</th></tr></thead>
                <tbody>
                  {state.employees.map((e) => {
                    const nw = payeFor(e, rules)
                    // old law: CRA applied (higher of ₦200k or 1% of gross, + 20% of gross)
                    const craOld = Math.max(200_000, e.annualGross * 0.01) + e.annualGross * 0.2
                    const pension = e.pension ? e.annualGross * 0.08 : 0
                    const oldChargeable = Math.max(0, e.annualGross - pension - craOld)
                    const oldProper = ((): number => {
                      let rem = oldChargeable, lower = 0, tot = 0
                      for (const b of rulesOld.pitBands) {
                        if (rem <= 0) break
                        const w = b.upto === Infinity ? Infinity : b.upto - lower
                        const inB = Math.min(rem, w)
                        tot += inB * b.rate
                        rem -= inB
                        lower = b.upto
                      }
                      return Math.round(tot * 100) / 100
                    })()
                    const saving = oldProper - nw.annualTax
                    return (
                      <tr key={e.id}>
                        <td>{e.name}</td>
                        <td className="num dim">{naira(Math.max(0, oldProper))}</td>
                        <td className="num">{naira(nw.annualTax)}</td>
                        <td className="num" style={{ color: saving > 0 ? 'var(--green-700)' : 'var(--red)' }}>{saving >= 0 ? '+' : ''}{naira(saving)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            </FeatureGate>
            <div className="card card-pad">
              <h3 className="card-title">Employer filings</h3>
              <p className="card-sub">Track the two recurring duties.</p>
              {(() => {
                const monthPeriod = new Date().toISOString().slice(0, 7)
                const annualPeriod = `FY${state.year - 1}`
                const mFiled = state.filings.some((f) => f.type === 'PAYE' && f.period === monthPeriod && f.status === 'filed')
                const aFiled = state.filings.some((f) => f.type === 'PAYE_ANNUAL' && f.period === annualPeriod && f.status === 'filed')
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="flex-between" style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 13px' }}>
                      <div>
                        <div className="small" style={{ fontWeight: 700 }}>Monthly PAYE remittance — {monthPeriod}</div>
                        <div className="hint">Due by the 10th of the following month · {naira(monthlyRemit)}</div>
                      </div>
                      {mFiled ? <span className="chip green">filed ✓</span> : <button className="btn btn-gold btn-sm" onClick={() => markFiled('PAYE')}>Mark filed</button>}
                    </div>
                    <div className="flex-between" style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '10px 13px' }}>
                      <div>
                        <div className="small" style={{ fontWeight: 700 }}>Employer annual return — {annualPeriod}</div>
                        <div className="hint">Due 31 January · declares all emoluments & PAYE for the year</div>
                      </div>
                      {aFiled ? <span className="chip green">filed ✓</span> : <button className="btn btn-gold btn-sm" onClick={() => markFiled('PAYE_ANNUAL')}>Mark filed</button>}
                    </div>
                    <Notice tone="amber">Late PAYE remittance: <b>10% of the amount</b> plus interest at the CBN monetary policy rate — and the employer bears it, not the employee.</Notice>
                  </div>
                )
              })()}
            </div>
          </div>
        </>
      )}

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </div>
  )
}
