import React from 'react'
import { useStore, useEngine } from '../state/store'
import { complianceScore, generateDeadlines, monthlyVAT, urgency, citComputation, pitComputation } from '../lib/engine'
import { NTA2025 } from '../lib/rules'
import { naira, kfmt, monthName } from '../lib/format'
import { Stat, Notice, Meter, PageHead, Icon } from '../components/ui'
import { TrialCta, FeatureGate } from '../components/paywall'

export default function Overview() {
  const { state } = useStore()
  const { totals, classification: cls, rules } = useEngine()
  const now = new Date()
  const { score, checks } = complianceScore(state, cls)
  const deadlines = generateDeadlines(state, cls, now).slice(0, 5)
  const vatRows = monthlyVAT(state.transactions, state.year, rules)

  const isCompany = state.profile.structure === 'limited_company'
  const annual = isCompany
    ? citComputation(totals, cls, rules)
    : pitComputation(totals, state.profile, rules)
  const vatPayableYTD = vatRows.reduce((s, r) => s + Math.max(0, r.net), 0)

  const radarMax = rules.smallCompany.turnoverLimit
  const radarPct = Math.min(100, (cls.turnoverUsed / radarMax) * 100)
  const headroom = radarMax - cls.turnoverUsed

  const monthsBars = (() => {
    const by: Record<string, number> = {}
    for (const t of state.transactions) {
      if (!t.date.startsWith(String(state.year))) continue
      const m = t.date.slice(0, 7)
      by[m] = (by[m] ?? 0) + (t.type === 'income' ? t.amount : -t.amount * 0.0)
    }
    return by
  })()
  const maxBar = Math.max(1, ...Object.values(monthsBars))

  return (
    <div>
      <PageHead
        title="Overview"
        sub={
          <>
            Your tax posture under the <b>Nigeria Tax Act 2025</b> and <b>Nigeria Tax Administration Act 2025</b> —
            computed live from {totals.fyLabel} records. {cls.turnoverSource === 'records' ? 'Classification uses your recorded turnover.' : 'Classification uses your declared estimate — add records to firm it up.'}
          </>
        }
      />

      <TrialCta />

      {!state.onboarded && (
        <div className="mb16">
          <Notice tone="amber" title="Finish setting up your business profile">
            Answer the classification questions so the engine can apply the right reliefs (small-company 0% CIT, VAT
            relief, WHT exemptions). <a href="#/profile"><b>Open Business Profile →</b></a>
          </Notice>
        </div>
      )}
      {cls.warnings.map((w, i) => (
        <div className="mb8" key={i}><Notice tone="amber">{w}</Notice></div>
      ))}

      <div className="grid g4 mb16">
        <Stat
          tone="accent"
          k={`Turnover · ${totals.fyLabel}`}
          v={naira(totals.turnover)}
          s={`${naira(totals.deductibleExpenses + totals.nonDeductibleAddBacks)} recorded expenses`}
        />
        <Stat
          tone="gold"
          k={isCompany ? 'CIT + Development Levy' : 'Estimated PIT (annual)'}
          v={naira(isCompany ? (annual as any).cit + (annual as any).levy : (annual as any).tax)}
          s={cls.isSmall && isCompany ? '0% rate — filing still mandatory' : isCompany ? '30% + 4% of assessable profit' : 'new bands · first ₦800k at 0%'}
        />
        <Stat
          k="VAT net payable (year to date)"
          v={naira(vatPayableYTD)}
          s={cls.vatRequired ? 'monthly returns due by the 21st' : 'relieved of VAT — opt-in available'}
        />
        <Stat
          k="WHT credits available"
          v={naira(totals.whtSuffered)}
          s={cls.isSmall ? 'small businesses are WHT-exempt (0% expected)' : 'offsets your income tax at filing'}
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.35fr 1fr' }}>
        <div className="grid" style={{ alignContent: 'start' }}>
          {/* threshold radar */}
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">Small-company threshold radar</h3>
                <p className="card-sub">NTA 2025: ≤ ₦100m turnover <i>and</i> ≤ ₦250m fixed assets (professional services excluded) → 0% CIT, CGT & Development Levy, WHT & VAT relief.</p>
              </div>
              <span className={`chip ${cls.isSmall ? 'green' : 'amber'}`}>{cls.isSmall ? 'QUALIFIES' : 'STANDARD RATE'}</span>
            </div>
            <div className="flex-between small">
              <span className="mono">{naira(cls.turnoverUsed)} recorded</span>
              <span className="dim">ceiling {naira(radarMax)}</span>
            </div>
            <Meter value={cls.turnoverUsed} max={radarMax} warn={radarPct > 85} />
            <div className="small mt8">
              {cls.isSmall
                ? <>Headroom: <b>{naira(headroom)}</b> before CIT (30%), Development Levy (4%), VAT and WHT duties switch on.</>
                : <>Above the ceiling — standard corporate rates apply to assessable profit.</>}
            </div>
            <div className="row mt16 wrap">
              {[
                ['Turnover test', cls.turnoverUsed <= radarMax],
                ['Fixed-asset test', state.profile.fixedAssets <= rules.smallCompany.fixedAssetLimit],
                ['Not professional services', !state.profile.isProfessionalServices],
              ].map(([label, ok]) => (
                <span key={label as string} className={`chip ${ok ? 'green' : 'red'}`}>
                  <Icon name={ok ? 'check' : 'alert'} size={12} /> {label}
                </span>
              ))}
            </div>
          </div>

          {/* monthly income bars */}
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">Monthly sales activity — {state.year}</h3>
                <p className="card-sub">From the records ledger. Consistent monthly records are your legal books of account.</p>
              </div>
              <a className="btn btn-ghost btn-sm" href="#/records"><Icon name="records" size={14} /> Ledger</a>
            </div>
            {Object.keys(monthsBars).length === 0 ? (
              <div className="small dim center" style={{ padding: '26px 0' }}>No income records yet for {state.year}. Add records to activate this chart.</div>
            ) : (
              <div className="bars">
                {Object.entries(monthsBars).sort().map(([m, v]) => (
                  <div className="bar" key={m} title={`${monthName(m)}: ${naira(v)}`}>
                    <div className="col" style={{ height: `${(v / maxBar) * 100}%` }} />
                    <div className="lbl">{m.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* VAT mini table */}
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">VAT position by month</h3>
                <p className="card-sub">Output 7.5% on standard-rated sales minus input VAT on purchases — payable by the 21st of the following month.</p>
              </div>
              <span className={`chip ${cls.vatRequired ? 'amber' : 'green'}`}>{cls.vatRequired ? 'MUST FILE MONTHLY' : 'RELIEVED (opt-in)'}</span>
            </div>
            {vatRows.length === 0 ? (
              <div className="small dim">No standard-rated activity recorded yet.</div>
            ) : (
              <table className="tbl">
                <thead><tr><th>Month</th><th className="num">Output VAT</th><th className="num">Input VAT</th><th className="num">Net payable</th><th>Status</th></tr></thead>
                <tbody>
                  {vatRows.slice(-6).map((r) => {
                    const [, mm] = r.month.split('-')
                    const due = new Date(Date.UTC(Number(r.month.slice(0, 4)) + (Number(mm) === 12 ? 1 : 0), Number(mm) === 12 ? 0 : Number(mm), 21))
                    const filed = state.filings.some((f) => f.type === 'VAT' && f.period === r.month && f.status === 'filed')
                    return (
                      <tr key={r.month}>
                        <td>{monthName(r.month)}</td>
                        <td className="num">{naira(r.output)}</td>
                        <td className="num">({naira(r.input)})</td>
                        <td className="num"><b>{naira(Math.max(0, r.net))}</b></td>
                        <td>{filed ? <span className="chip green">filed</span> : due < now ? <span className="chip red">overdue</span> : <span className="chip amber">due by 21st</span>}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="grid" style={{ alignContent: 'start' }}>
          {/* compliance score — premium intelligence */}
          <FeatureGate feature="radar_alerts" label="Compliance health score & NTAA readiness checks">
            <div className="card card-pad">
              <div className="row">
                <div className="score-ring">
                  <svg width="116" height="116">
                    <circle cx="58" cy="58" r="50" fill="none" stroke="#eeece4" strokeWidth="10" />
                    <circle cx="58" cy="58" r="50" fill="none" stroke={score >= 80 ? 'var(--green-600)' : score >= 50 ? 'var(--gold-500)' : 'var(--red)'}
                      strokeWidth="10" strokeLinecap="round" strokeDasharray={`${(score / 100) * 314} 314`} />
                  </svg>
                  <div className="center"><div><b>{score}%</b><span>compliant</span></div></div>
                </div>
                <div className="grow">
                  <h3 className="card-title">Compliance health</h3>
                  <p className="card-sub">NTAA 2025 readiness checks.</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {checks.map((c) => (
                      <div key={c.label} className="row" style={{ alignItems: 'flex-start' }}>
                        <span style={{ color: c.ok ? 'var(--green-600)' : 'var(--red)', marginTop: 1 }}><Icon name={c.ok ? 'check' : 'alert'} size={14} /></span>
                        <div>
                          <div className="small" style={{ fontWeight: 600 }}>{c.label}</div>
                          {!c.ok && <div className="hint" style={{ marginTop: 1 }}>{c.fix}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FeatureGate>

          {/* next deadlines */}
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">Next deadlines</h3>
                <p className="card-sub">Under the NTAA 2025 calendar.</p>
              </div>
              <a className="btn btn-ghost btn-sm" href="#/calendar"><Icon name="calendar" size={14} /> Calendar</a>
            </div>
            <div className="timeline">
              {deadlines.map((d) => {
                const u = urgency(d.dueDate, now)
                const dt = new Date(d.dueDate + 'T00:00:00Z')
                return (
                  <div className="dl-row" key={d.id}>
                    <div className="dl-date">
                      <span className="day">{dt.getUTCDate()}</span>
                      {dt.toLocaleDateString('en-GB', { month: 'short', timeZone: 'UTC' })}
                    </div>
                    <div className="grow">
                      <div className="small" style={{ fontWeight: 650 }}>{d.title}</div>
                      <div className="hint">{d.legalBasis}</div>
                    </div>
                    <span className={`chip ${u.kind === 'overdue' ? 'red' : u.kind === 'due-soon' ? 'amber' : 'green'}`}>
                      {u.kind === 'overdue' ? `${u.days}d late` : u.days === 0 ? 'today' : `${u.days}d left`}
                    </span>
                  </div>
                )
              })}
              {deadlines.length === 0 && <div className="small dim">No obligations detected yet — complete the profile.</div>}
            </div>
          </div>

          {/* obligations checklist — premium intelligence */}
          <FeatureGate feature="radar_alerts" label="Personalised obligations map under the NTAA 2025">
            <div className="card card-pad">
              <h3 className="card-title">Your obligations under NTA/NTAA 2025</h3>
              <p className="card-sub">Derived from your classification.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cls.obligations.filter((o) => o.applies).map((o) => (
                  <div key={o.code} style={{ border: '1px solid var(--line)', borderRadius: 10, padding: '9px 12px' }}>
                    <div className="row flex-between">
                      <span className="small" style={{ fontWeight: 700 }}>{o.title}</span>
                      <span className="chip dark">{o.code}</span>
                    </div>
                    <div className="hint mt8" style={{ marginTop: 3 }}>{o.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </FeatureGate>
        </div>
      </div>

      <div className="mt16">
        <Notice tone="green" title="What the 2025 reform means for this business">
          {cls.isSmall ? (
            <>As a qualifying small company, this business pays <b>0% CIT</b>, is exempt from <b>CGT</b> and the <b>4% Development Levy</b>, suffers <b>no WHT deductions</b> on its income and is relieved of VAT charging — but <b>must still file annual returns</b>. Under the repealed law the same profit profile attracted up to 20% CIT plus 3% Tertiary Education Tax. See the <a href="#/engine"><b>Tax Engine</b></a> for your personal saving.</>
          ) : isCompany ? (
            <>Standard rate applies: <b>30% CIT</b> + <b>4% Development Levy</b> (one consolidated levy replacing TET/NASENI/PTF/IT levies), filed within 6 months of year-end. NTA 2025 scraps the old 20% medium band — your effective cost of compliance still drops thanks to levy consolidation.</>
          ) : (
            <>As an unincorporated business you are taxed under the new <b>Personal Income Tax bands</b> — first ₦800,000 of taxable income at 0%, and a new <b>rent relief</b> replaces the abolished CRA. File your self-assessment with your State IRS by <b>31 March</b>.</>
          )}
        </Notice>
      </div>
    </div>
  )
}
