import React from 'react'
import { useStore, useEngine } from '../state/store'
import { generateDeadlines, urgency, monthlyVAT, payeFor } from '../lib/engine'
import { PENALTIES } from '../lib/rules'
import { fmtDate, naira } from '../lib/format'
import { PageHead, Notice, Icon } from '../components/ui'

export default function CalendarPage() {
  const { state } = useStore()
  const { classification: cls, totals, rules } = useEngine()
  const now = new Date()
  const deadlines = generateDeadlines(state, cls, now)
  const vatRows = monthlyVAT(state.transactions, state.year, rules)
  const monthlyPaye = state.employees.reduce((s, e) => s + payeFor(e, rules).monthlyTax, 0)

  // outstanding monthly back-office items (unfiled VAT periods with activity)
  const openVatMonths = vatRows.filter((r) => !state.filings.some((f) => f.type === 'VAT' && f.period === r.month && f.status === 'filed'))

  return (
    <div>
      <PageHead
        title="Filing Calendar & Deadlines"
        sub={<>Generated live from your classification, year-end and payroll under the <b>Nigeria Tax Administration Act 2025</b>. Monthly cycle: PAYE by the 10th · VAT & WHT by the 21st.</>}
      />

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="card card-pad">
          <h3 className="card-title">Upcoming statutory deadlines</h3>
          <p className="card-sub">Sorted by due date. Late filing costs ₦100,000 in the first month then ₦50,000 per month — for every return type.</p>
          <div className="timeline mt8">
            {deadlines.map((d) => {
              const u = urgency(d.dueDate, now)
              return (
                <div className="dl-row" key={d.id}>
                  <div className="dl-date">
                    <span className="day">{new Date(d.dueDate + 'T00:00:00Z').getUTCDate()}</span>
                    {new Date(d.dueDate + 'T00:00:00Z').toLocaleDateString('en-GB', { month: 'short', year: 'numeric', timeZone: 'UTC' })}
                  </div>
                  <div className="grow">
                    <div style={{ fontWeight: 650 }}>{d.title}</div>
                    <div className="hint">{d.legalBasis}</div>
                    <div className="hint" style={{ color: 'var(--red)' }}>⚠ {d.penaltyNote}</div>
                  </div>
                  <span className={`chip ${u.kind === 'overdue' ? 'red' : u.kind === 'due-soon' ? 'amber' : 'green'}`}>
                    {u.kind === 'overdue' ? `${u.days} days overdue` : u.days === 0 ? 'due today' : `${u.days} days`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="card card-pad">
            <h3 className="card-title">Open monthly periods</h3>
            <p className="card-sub">Months with recorded activity awaiting a filing action.</p>
            {openVatMonths.length === 0 ? (
              <Notice tone="green">No open VAT periods — nothing outstanding from recorded activity.</Notice>
            ) : (
              <table className="tbl">
                <thead><tr><th>Period</th><th className="num">Net VAT due</th><th>Deadline</th><th>Status</th></tr></thead>
                <tbody>
                  {openVatMonths.map((r) => {
                    const [y, m] = r.month.split('-').map(Number)
                    const due = new Date(Date.UTC(m === 12 ? y + 1 : y, m === 12 ? 0 : m, 21))
                    const late = due < now
                    return (
                      <tr key={r.month}>
                        <td className="mono">{r.month}</td>
                        <td className="num" style={{ fontWeight: 650 }}>{naira(Math.max(0, r.net))}</td>
                        <td className="small">{fmtDate(due.toISOString().slice(0, 10))}</td>
                        <td>{late ? <span className="chip red">overdue</span> : <span className="chip amber">awaiting</span>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            {cls.vatRequired && openVatMonths.length > 0 && (
              <div className="hint mt8">Late VAT: {naira(PENALTIES.vatLate.firstMonth)} first month + {naira(PENALTIES.vatLate.perMonthAfter)}/month + 10% of tax + interest at CBN MPR.</div>
            )}
          </div>

          <div className="card card-pad">
            <h3 className="card-title">Penalty exposure if you file today vs wait</h3>
            <p className="card-sub">Illustrative NTAA 2025 administrative fines.</p>
            <table className="tbl">
              <thead><tr><th>Default</th><th>First month</th><th>Each extra month</th></tr></thead>
              <tbody>
                <tr><td>Failure to file any return</td><td className="num">{naira(PENALTIES.lateFiling.firstMonth)}</td><td className="num">{naira(PENALTIES.lateFiling.perMonthAfter)}</td></tr>
                <tr><td>No Tax ID registration</td><td className="num">{naira(PENALTIES.noTIN.firstMonth)}</td><td className="num">{naira(PENALTIES.noTIN.perMonthAfter)}</td></tr>
                <tr><td>Contract with unregistered vendor</td><td className="num" colSpan={2}>{naira(PENALTIES.unregisteredVendor.amount)} per case</td></tr>
                <tr><td>Late VAT (plus 10% of tax + MPR interest)</td><td className="num">{naira(PENALTIES.vatLate.firstMonth)}</td><td className="num">{naira(PENALTIES.vatLate.perMonthAfter)}</td></tr>
                <tr><td>Late PAYE (plus MPR interest)</td><td className="num" colSpan={2}>10% of {naira(monthlyPaye)} = {naira(monthlyPaye * 0.1)}</td></tr>
              </tbody>
            </table>
            <div className="mt16">
              <Notice tone="red" title="The 2026 posture is zero-tolerance">
                The NTAA 2025 linked your Tax ID to CAC, BVN and banking rails — defaults are now detected electronically. Filing on
                time, even a nil return at 0% CIT, is the cheapest compliance strategy available to an MSME.
              </Notice>
            </div>
          </div>

          <div className="card card-pad">
            <h3 className="card-title">Your recurring rhythm</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              {[
                ['Monthly · 10th', `PAYE remittance to ${state.profile.state} IRS`, state.employees.length > 0],
                ['Monthly · 21st', 'VAT return & payment to NRS', cls.vatRequired],
                ['Monthly · 21st', 'WHT remittance & credit notes', !cls.isSmall],
                ['31 January', 'Employer annual PAYE return', state.employees.length > 0],
                ['31 March', 'PIT self-assessment (direct assessment)', state.profile.structure !== 'limited_company'],
                ['Year-end + 6 months', `CIT return (${cls.isSmall ? 'nil/value at 0% — still mandatory' : 'with accounts'})`, state.profile.structure === 'limited_company'],
              ].map(([when, what, applies], i) => (
                <div key={i} className="row" style={{ justifyContent: 'space-between', borderBottom: '1px dashed #eceae2', paddingBottom: 7 }}>
                  <span style={{ fontWeight: 600 }}>{what}</span>
                  <span className={`chip ${applies ? 'green' : ''}`}>{when}{!applies ? ' · n/a for you' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
