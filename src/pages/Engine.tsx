import React, { useState } from 'react'
import { useStore, useEngine } from '../state/store'
import { citComputation, pitComputation, monthlyVAT, round2 } from '../lib/engine'
import { WHT_RATES } from '../lib/rules'
import { naira } from '../lib/format'
import { PageHead, Notice, Icon, Stat } from '../components/ui'

export default function Engine() {
  const { state } = useStore()
  const { totals, classification: cls, classificationOld: clsOld, rules, rulesOld } = useEngine()
  const [showOld, setShowOld] = useState(false)
  const isCompany = state.profile.structure === 'limited_company'

  const now = isCompany ? citComputation(totals, cls, rules) : pitComputation(totals, state.profile, rules)
  const old = isCompany ? citComputation(totals, clsOld, rulesOld) : pitComputation(totals, state.profile, rulesOld)

  const nowTax = isCompany ? (now as any).cit + (now as any).levy : (now as any).tax
  const oldTax = isCompany ? (old as any).cit + (old as any).levy : (old as any).tax
  const saving = round2(oldTax - nowTax)

  const vatRows = monthlyVAT(state.transactions, state.year, rules)
  const whtIncome = state.transactions.filter((t) => t.type === 'income' && (t.whtRate || 0) > 0)
  const whtExpense = state.transactions.filter((t) => t.type === 'expense' && (t.whtRate || 0) > 0)

  const activeLines = showOld ? old.lines : now.lines
  const profit = round2(totals.turnover - totals.deductibleExpenses - totals.nonDeductibleAddBacks)
  const effRate = profit > 0 ? nowTax / profit : 0

  return (
    <div>
      <PageHead
        title="Tax Engine — Process"
        sub={<>Transparent computation under your applicable rules. Toggle the law to quantify what the 2025 reform changed for you. Every figure traces back to the ledger.</>}
        right={
          <div className="row" style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 99, padding: 3 }}>
            <button className={`btn btn-sm ${!showOld ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowOld(false)}>NTA 2025 (gazetted)</button>
            <button className={`btn btn-sm ${showOld ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setShowOld(true)}>Old law (pre-2026)</button>
          </div>
        }
      />

      <div className="grid g4 mb16">
        <Stat tone={saving > 0 ? 'gold' : 'accent'} k="Reform impact (tax saved)" v={naira(Math.max(0, saving))}
          s={saving > 0 ? `under ${rules.shortTitle} vs the repealed law, same records` : 'no difference on current records'} />
        <Stat k={isCompany ? 'CIT + Dev Levy (2026 law)' : 'PIT (2026 law)'} v={naira(nowTax)}
          s={profit > 0 ? `effective ${(effRate * 100).toFixed(1)}% of assessable profit` : 'no profit recorded yet'} />
        <Stat k={`Under repealed law`} v={naira(oldTax)} s={isCompany ? 'CIT bands 0/20/30% + 3% TET' : 'old PIT bands + CRA'} />
        <Stat k="WHT credits → net payable" v={naira((now as any).netPayable)} s={`${naira(totals.whtSuffered)} suffered on income`} />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.25fr 1fr' }}>
        <div className="grid" style={{ alignContent: 'start' }}>
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">{isCompany ? 'Companies Income Tax computation' : 'Personal Income Tax computation'}</h3>
                <p className="card-sub">{totals.fyLabel} · {showOld ? rulesOld.title : rules.title}</p>
              </div>
              <span className="chip dark">{isCompany ? (showOld ? 'CITA' : 'NTA 2025') : 'PIT'}</span>
            </div>
            <div className="workings">
              {activeLines.map((l, i) => (
                <div key={i} className={`work-row ${l.strong ? 'strong' : ''}`}>
                  <div>
                    {l.label}
                    {l.note && <span className="note">{l.note}</span>}
                  </div>
                  <div className="amt">{l.amount < 0 ? `(${naira(-l.amount)})` : naira(l.amount)}</div>
                </div>
              ))}
            </div>

            {!isCompany && (
              <div className="mt16">
                <div className="lab" style={{ marginBottom: 6 }}>Band-by-band breakdown ({showOld ? 'old bands' : 'NTA 2025 Fourth Schedule'})</div>
                <table className="tbl">
                  <thead><tr><th>Band</th><th>Rate</th><th className="num">Taxable in band</th><th className="num">Tax</th></tr></thead>
                  <tbody>
                    {(showOld ? (old as any).breakdown : (now as any).breakdown).map((b: any) => (
                      <tr key={b.line}><td>{b.band}</td><td className="mono">{(b.rate * 100).toFixed(0)}%</td><td className="num">{naira(b.taxableInBand)}</td><td className="num" style={{ fontWeight: 650 }}>{naira(b.tax)}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* VAT detail */}
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">VAT engine — monthly net position</h3>
                <p className="card-sub">7.5% standard rate · zero-rated staples at 0% · exempt and non-vatable items excluded.</p>
              </div>
              <span className={`chip ${cls.vatRequired ? 'amber' : 'green'}`}>{cls.vatRequired ? 'MUST CHARGE & FILE' : 'RELIEVED AS SMALL'}</span>
            </div>
            {vatRows.length === 0 ? (
              <div className="small dim">No standard-rated transactions recorded.</div>
            ) : (
              <table className="tbl">
                <thead><tr><th>Month</th><th className="num">Output VAT (sales)</th><th className="num">Input VAT (purchases)</th><th className="num">Net payable</th><th className="num">Excess credit c/f</th></tr></thead>
                <tbody>
                  {vatRows.map((r) => (
                    <tr key={r.month}>
                      <td className="mono">{r.month}</td>
                      <td className="num">{naira(r.output)}</td>
                      <td className="num">({naira(r.input)})</td>
                      <td className="num" style={{ fontWeight: 700 }}>{naira(Math.max(0, r.net))}</td>
                      <td className="num dim">{r.net < 0 ? naira(-r.net) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div className="hint mt8">Input VAT on zero-rated and exempt purchases is not claimable. Excess input credits roll forward against future output VAT.</div>
          </div>
        </div>

        <div className="grid" style={{ alignContent: 'start' }}>
          {/* WHT schedule */}
          <div className="card card-pad">
            <h3 className="card-title">Withholding tax register</h3>
            <p className="card-sub">2024 WHT Regulations rates · remit the 21st of the following month.</p>
            <table className="tbl">
              <thead><tr><th>Nature of payment</th><th className="num">To companies</th><th className="num">To individuals</th></tr></thead>
              <tbody>
                {WHT_RATES.map((w) => (
                  <tr key={w.key}><td className="small">{w.label}</td><td className="num">{(w.company * 100).toFixed(0)}%</td><td className="num">{(w.individual * 100).toFixed(0)}%</td></tr>
                ))}
              </tbody>
            </table>
            <div className="hint mt8">No Tax ID on the payee? Rate doubles. Small companies, manufacturers and agro-processors are relieved of WHT on their income (NTA 2025).</div>
            <div className="grid g2 mt16">
              <div className="card" style={{ padding: '12px 14px', background: 'var(--green-50)' }}>
                <div className="small dim" style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Suffered on income ({whtIncome.length} tx)</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{naira(totals.whtSuffered)}</div>
                <div className="hint">credit notes to claim</div>
              </div>
              <div className="card" style={{ padding: '12px 14px', background: 'var(--gold-100)' }}>
                <div className="small dim" style={{ fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8a6508' }}>Deducted on payments ({whtExpense.length} tx)</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{naira(totals.whtDeducted)}</div>
                <div className="hint" style={{ color: '#8a6508' }}>remit by the 21st</div>
              </div>
            </div>
          </div>

          {/* classification side */}
          <div className="card card-pad">
            <h3 className="card-title">Active classification</h3>
            <p className="card-sub">Applied throughout this page.</p>
            <Notice tone={showOld ? 'amber' : cls.isSmall ? 'green' : 'blue'}>
              <b>{showOld ? rulesOld.shortTitle : rules.shortTitle}</b> — {showOld ? (clsOld.isSmall ? 'small (≤₦25m, 0%)' : clsOld.turnoverUsed <= 100_000_000 ? 'medium band (20% CIT)' : 'large (30% CIT)') : cls.isSmall ? 'small company (0% CIT, levy-free, WHT & VAT relieved)' : 'standard taxpayer (30% CIT + 4% Development Levy)'}
            </Notice>
            {showOld && (
              <div className="mt8">
                <Notice tone="blue">The repealed regime taxed turnover ₦25m–₦100m at 20% plus a 3% Tertiary Education Tax and separate NASENI/PTF/IT levies. NTA 2025 moved the small ceiling to ₦100m and consolidated the levies.</Notice>
              </div>
            )}
            <div className="mt16 small" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="flex-between"><span className="dim">Turnover ({cls.turnoverSource})</span><b>{naira(cls.turnoverUsed)}</b></div>
              <div className="flex-between"><span className="dim">Fixed assets</span><b>{naira(state.profile.fixedAssets)}</b></div>
              <div className="flex-between"><span className="dim">Professional services</span><b>{state.profile.isProfessionalServices ? 'Yes — excluded' : 'No'}</b></div>
              <div className="flex-between"><span className="dim">VAT status</span><b>{cls.vatRequired ? 'Registered / must charge' : 'Relieved (opt-in available)'}</b></div>
              <div className="flex-between"><span className="dim">Records in scope</span><b>{state.transactions.length}</b></div>
            </div>
            <div className="mt16 no-print"><a className="btn btn-ghost btn-sm" href="#/reports"><Icon name="reports" size={14} /> Generate return schedules →</a></div>
          </div>
        </div>
      </div>
    </div>
  )
}
