import React, { useState } from 'react'
import { useStore, useEngine, useEntitlements } from '../state/store'
import { citComputation, pitComputation, monthlyVAT, payeFor } from '../lib/engine'
import { naira, fmtDate, monthName } from '../lib/format'
import { genericCSV, download } from '../lib/csv'
import { PageHead, Notice, Icon, PrintHeader, ReportFooter, EmptyState } from '../components/ui'
import { FeatureGate, PremiumBanner, UpgradeModal } from '../components/paywall'

type Tab = 'annual' | 'vat' | 'wht' | 'paye'

export default function Reports() {
  const { state } = useStore()
  const { totals, classification: cls, rules } = useEngine()
  const ent = useEntitlements()
  const [tab, setTab] = useState<Tab>('annual')
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const guardPrint = () => (ent.can('print_export') ? window.print() : setUpgradeOpen(true))
  const guardExport = (fn: () => void) => (ent.can('print_export') ? fn() : setUpgradeOpen(true))
  const isCompany = state.profile.structure === 'limited_company'

  const annual = isCompany ? citComputation(totals, cls, rules) : pitComputation(totals, state.profile, rules)
  const vatRows = monthlyVAT(state.transactions, state.year, rules)
  const [vatMonth, setVatMonth] = useState<string>(() => vatRows.length ? vatRows[vatRows.length - 1].month : `${state.year}-01`)
  const vatSel = vatRows.find((r) => r.month === vatMonth)

  const whtDeducted = state.transactions.filter((t) => t.type === 'expense' && (t.whtRate || 0) > 0)
  const whtSuffered = state.transactions.filter((t) => t.type === 'income' && (t.whtRate || 0) > 0)
  const payeResults = state.employees.map((e) => payeFor(e, rules))

  const basis = isCompany ? 'Nigeria Tax Act 2025 · CIT & Development Levy' : 'Nigeria Tax Act 2025 · Personal Income Tax'

  const exportAnnual = () => {
    download(
      `${isCompany ? 'cit' : 'pit'}-self-assessment-${state.year}.csv`,
      genericCSV(['line', 'amount'], annual.lines.map((l) => [l.label, l.amount]))
    )
  }
  const exportVAT = () => {
    const rows = state.transactions.filter((t) => t.date.startsWith(vatMonth) && t.vat === 'standard')
    download(
      `vat-return-${vatMonth}.csv`,
      genericCSV(
        ['date', 'description', 'category', 'amount', 'vat_7.5%'],
        rows.map((t) => [t.date, t.description, t.category, t.amount, Math.round(t.amount * rules.vat.rate * 100) / 100])
      )
    )
  }
  const exportWHT = () => {
    download(
      `wht-schedule-${state.year}.csv`,
      genericCSV(
        ['type', 'date', 'party', 'nature', 'amount', 'wht_rate', 'wht_amount', 'party_has_TIN'],
        [...whtDeducted.map((t) => ['expense(deducted)', ...rowWHT(t)]), ...whtSuffered.map((t) => ['income(suffered)', ...rowWHT(t)])]
      )
    )
    function rowWHT(t: any) {
      return [t.date, t.partyName || '—', t.category, t.amount, t.whtRate, Math.round(t.amount * t.whtRate * 100) / 100, t.partyHasTIN ? 'yes' : 'no']
    }
  }
  const exportPAYE = () => {
    download(
      `paye-annual-return-${state.year}.csv`,
      genericCSV(
        ['employee', 'role', 'annual_gross', 'pension', 'chargeable', 'annual_paye', 'monthly_paye'],
        payeResults.map((r) => [r.employee.name, r.employee.role, r.employee.annualGross, r.employee.pension ? r.employee.annualGross * 0.08 : 0, r.chargeable, r.annualTax, r.monthlyTax])
      )
    )
  }

  const filingStatus = (kind: string, period: string) =>
    state.filings.find((f) => f.type === kind && f.period === period && f.status === 'filed')

  return (
    <div>
      <PrintHeader business={state.profile.name || 'MSME'} title={`${totals.fyLabel} tax return schedules`} basis={basis} />
      <PageHead
        title="Returns & Reports — Report"
        sub="Return-ready schedules generated from your collated records and processed figures. Export as CSV for your accountant or the NRS/state e-filing portals, or print to PDF."
        right={
          <button className="btn btn-primary no-print" onClick={guardPrint}>
            <Icon name="print" size={14} /> Print / save PDF {!ent.can('print_export') && <span className="chip gold" style={{ fontSize: 9.5 }}>★</span>}
          </button>
        }
      />

      <div className="tabs no-print">
        <button className={tab === 'annual' ? 'on' : ''} onClick={() => setTab('annual')}>{isCompany ? 'CIT self-assessment' : 'PIT self-assessment'}</button>
        <button className={tab === 'vat' ? 'on' : ''} onClick={() => setTab('vat')}>Monthly VAT return {!ent.can('return_schedules') && '★'}</button>
        <button className={tab === 'wht' ? 'on' : ''} onClick={() => setTab('wht')}>WHT schedule {!ent.can('return_schedules') && '★'}</button>
        <button className={tab === 'paye' ? 'on' : ''} onClick={() => setTab('paye')}>PAYE annual return {!ent.can('return_schedules') && '★'}</button>
      </div>

      {tab === 'annual' && (
        <div className="grid">
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">{isCompany ? 'Companies Income Tax — self-assessment summary' : 'Personal Income Tax — self-assessment summary'}</h3>
                <p className="card-sub">
                  {totals.fyLabel} · file with the {isCompany ? 'Nigeria Revenue Service' : `${state.profile.state} Internal Revenue Service`} · due {isCompany ? `six months after ${fmtDate(`${state.year}-${String(state.profile.fyEndMonth).padStart(2, '0')}-28`)} (year-end)` : `31 March ${state.year + 1}`}
                  {filingStatus(isCompany ? 'CIT' : 'PIT', `FY${state.year}`) && <> · <span className="chip green">marked filed</span></>}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm no-print" onClick={() => guardExport(exportAnnual)}><Icon name="download" size={14} /> CSV</button>
            </div>

            <div className="grid g4 mb16">
              <IdLine k="Taxpayer" v={state.profile.name || '—'} />
              <IdLine k="Tax ID (TIN)" v={state.profile.tin || 'not recorded — add now'} warn={!state.profile.tin} />
              <IdLine k="Classification" v={cls.isSmall ? 'Small company' : isCompany ? 'Standard company' : 'Individual / unincorporated'} />
              <IdLine k="State of tax residence" v={state.profile.state} />
            </div>

            <div className="workings">
              {annual.lines.map((l, i) => (
                <div key={i} className={`work-row ${l.strong ? 'strong' : ''}`}>
                  <div>{l.label}{l.note && <span className="note">{l.note}</span>}</div>
                  <div className="amt">{l.amount < 0 ? `(${naira(-l.amount)})` : naira(l.amount)}</div>
                </div>
              ))}
            </div>

            {cls.isSmall && isCompany && (
              <div className="mt16">
                <Notice tone="green" title="0% assessed — filing is still mandatory">
                  A nil/value return with your audited-or-management accounts keeps you on the NRS radar in good standing and earns
                  your Tax Clearance Certificate. Default fine for not filing: ₦100,000 first month + ₦50,000 each further month.
                </Notice>
              </div>
            )}
            {!isCompany && (
              <div className="mt16">
                <Notice tone="blue" title="Direct assessment with your State IRS">
                  Profit from this trade is assessed under the new PIT bands. Pay via your state e-portal (e.g. LIRS eTax for Lagos)
                  and submit this computation as your supporting schedule.
                </Notice>
              </div>
            )}
          </div>
          <ReportFooter />
        </div>
      )}

      {tab === 'vat' && (
        <div className="grid">
          <FeatureGate feature="return_schedules" label="Monthly VAT return schedule">
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">Monthly VAT return schedule</h3>
                <p className="card-sub">Form mirrors the NRS VAT e-filing — due by the 21st of the month following the transaction month.</p>
              </div>
              <div className="row no-print">
                <select className="inp" style={{ width: 180 }} value={vatMonth} onChange={(e) => setVatMonth(e.target.value)}>
                  {vatRows.map((r) => <option key={r.month} value={r.month}>{monthName(r.month)}</option>)}
                </select>
                <button className="btn btn-ghost btn-sm" onClick={() => guardExport(exportVAT)} disabled={!vatSel}><Icon name="download" size={14} /> CSV</button>
              </div>
            </div>

            {!cls.vatRequired && (
              <div className="mb16">
                <Notice tone="green" title="Small-business VAT relief">
                  As a qualifying small business you are relieved of charging and filing VAT. This schedule stays available because you
                  have opted in, or would apply if you cross the ₦100m ceiling. Only record VAT you actually charged.
                </Notice>
              </div>
            )}
            {!vatSel ? <EmptyState icon="reports" title="No VAT activity">Record standard-rated sales or purchases to populate the return.</EmptyState> : (
              <>
                <div className="workings mb16">
                  <div className="work-row"><div>Standard-rated supplies made (sales)</div><div className="amt">{naira(monthSum(state, vatMonth, 'income'))}</div></div>
                  <div className="work-row"><div>Output VAT @ 7.5%</div><div className="amt">{naira(vatSel.output)}</div></div>
                  <div className="work-row"><div>Standard-rated vatable purchases</div><div className="amt">{naira(monthSum(state, vatMonth, 'expense'))}</div></div>
                  <div className="work-row"><div>Input VAT @ 7.5%</div><div className="amt">({naira(vatSel.input)})</div></div>
                  <div className="work-row strong"><div>Net VAT {vatSel.net >= 0 ? 'payable to NRS' : 'credit carried forward'}</div><div className="amt">{naira(Math.abs(vatSel.net))}</div></div>
                </div>
                <div className="lab" style={{ marginBottom: 5 }}>Transaction detail — {monthName(vatMonth)}</div>
                <table className="tbl">
                  <thead><tr><th>Date</th><th>Description</th><th>Category</th><th className="num">Base amount</th><th className="num">VAT 7.5%</th></tr></thead>
                  <tbody>
                    {state.transactions.filter((t) => t.date.startsWith(vatMonth) && t.vat === 'standard').map((t) => (
                      <tr key={t.id}>
                        <td className="mono">{fmtDate(t.date)}</td>
                        <td>{t.description}</td>
                        <td className="small dim">{t.type === 'income' ? 'Sales' : 'Purchases'} · {t.category}</td>
                        <td className="num">{naira(t.amount)}</td>
                        <td className="num">{naira(t.amount * rules.vat.rate, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
          </FeatureGate>
          <ReportFooter />
        </div>
      )}

      {tab === 'wht' && (
        <div className="grid">
          <FeatureGate feature="return_schedules" label="Withholding tax schedule & credit register">
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">Withholding tax schedule</h3>
                <p className="card-sub">Deductions you must remit (21st monthly) and credits you can claim against your income tax.</p>
              </div>
              <button className="btn btn-ghost btn-sm no-print" onClick={() => guardExport(exportWHT)}><Icon name="download" size={14} /> CSV</button>
            </div>
            <div className="grid g2">
              <div>
                <div className="lab" style={{ marginBottom: 5 }}>A — WHT deducted from supplier payments (remit to NRS/State IRS)</div>
                {whtDeducted.length === 0 ? <div className="small dim">No deductions recorded{cls.isSmall ? ' — expected: small companies are relieved of deduction duties.' : '.'}</div> : (
                  <table className="tbl">
                    <thead><tr><th>Date</th><th>Payee</th><th className="num">Base</th><th className="num">WHT</th></tr></thead>
                    <tbody>
                      {whtDeducted.map((t) => (
                        <tr key={t.id}>
                          <td className="mono">{fmtDate(t.date)}</td>
                          <td className="small">{t.partyName || '—'} {!t.partyHasTIN && <span className="chip red">no TIN ×2</span>}</td>
                          <td className="num">{naira(t.amount)}</td>
                          <td className="num" style={{ fontWeight: 650 }}>{(t.whtRate * 100).toFixed(0)}% · {naira(t.amount * t.whtRate)}</td>
                        </tr>
                      ))}
                      <tr className="strong"><td colSpan={3}>Total to remit</td><td className="num">{naira(totals.whtDeducted)}</td></tr>
                    </tbody>
                  </table>
                )}
              </div>
              <div>
                <div className="lab" style={{ marginBottom: 5 }}>B — WHT suffered on your income (claim credits)</div>
                {whtSuffered.length === 0 ? <div className="small dim">None recorded{cls.isSmall ? ' — correct: customers should not deduct from a small company.' : ' — demand credit notes from every deducting customer.'}</div> : (
                  <table className="tbl">
                    <thead><tr><th>Date</th><th>Deducted by</th><th className="num">Base</th><th className="num">WHT credit</th></tr></thead>
                    <tbody>
                      {whtSuffered.map((t) => (
                        <tr key={t.id}>
                          <td className="mono">{fmtDate(t.date)}</td>
                          <td className="small">{t.partyName || '—'}</td>
                          <td className="num">{naira(t.amount)}</td>
                          <td className="num" style={{ fontWeight: 650 }}>{(t.whtRate * 100).toFixed(0)}% · {naira(t.amount * t.whtRate)}</td>
                        </tr>
                      ))}
                      <tr className="strong"><td colSpan={3}>Total credits</td><td className="num">{naira(totals.whtSuffered)}</td></tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>
            <div className="mt16">
              <Notice tone="amber">Issue a <b>credit note</b> to every payee within the month of deduction, and collect yours from every
                customer — credits without the corresponding credit note are routinely rejected at assessment.</Notice>
            </div>
          </div>
          </FeatureGate>
          <ReportFooter />
        </div>
      )}

      {tab === 'paye' && (
        <div className="grid">
          <FeatureGate feature="return_schedules" label="Employer annual PAYE return (Form H1)">
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">Employer annual PAYE return (Form H1 basis)</h3>
                <p className="card-sub">Declaration of emoluments and PAYE deducted — due with the {state.profile.state} IRS by 31 January {state.year + 1}.</p>
              </div>
              <button className="btn btn-ghost btn-sm no-print" onClick={() => guardExport(exportPAYE)} disabled={!payeResults.length}><Icon name="download" size={14} /> CSV</button>
            </div>
            {payeResults.length === 0 ? <EmptyState icon="payroll" title="No payroll data">Add employees on the Payroll screen first.</EmptyState> : (
              <table className="tbl">
                <thead><tr><th>#</th><th>Employee</th><th>Role</th><th className="num">Annual gross</th><th className="num">Pension relief</th><th className="num">Chargeable</th><th className="num">PAYE (year)</th><th className="num">PAYE (month)</th></tr></thead>
                <tbody>
                  {payeResults.map((r, i) => (
                    <tr key={r.employee.id}>
                      <td className="mono dim">{String(i + 1).padStart(2, '0')}</td>
                      <td style={{ fontWeight: 650 }}>{r.employee.name}</td>
                      <td className="small dim">{r.employee.role}</td>
                      <td className="num">{naira(r.employee.annualGross)}</td>
                      <td className="num dim">{r.employee.pension ? naira(r.employee.annualGross * 0.08) : '—'}</td>
                      <td className="num">{naira(r.chargeable)}</td>
                      <td className="num" style={{ fontWeight: 700 }}>{naira(r.annualTax)}</td>
                      <td className="num">{naira(r.monthlyTax)}</td>
                    </tr>
                  ))}
                  <tr className="strong">
                    <td colSpan={3}>Totals</td>
                    <td className="num">{naira(payeResults.reduce((s, r) => s + r.employee.annualGross, 0))}</td>
                    <td className="num">{naira(payeResults.reduce((s, r) => s + (r.employee.pension ? r.employee.annualGross * 0.08 : 0), 0))}</td>
                    <td className="num">{naira(payeResults.reduce((s, r) => s + r.chargeable, 0))}</td>
                    <td className="num">{naira(payeResults.reduce((s, r) => s + r.annualTax, 0))}</td>
                    <td className="num">{naira(payeResults.reduce((s, r) => s + r.monthlyTax, 0))}</td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
          </FeatureGate>
          <ReportFooter />
        </div>
      )}

      {!ent.can('return_schedules') && (
        <div className="mt16 no-print">
          <PremiumBanner feature="return_schedules" message={<>The full filing pack — <b>CIT/PIT, monthly VAT, WHT schedule & PAYE annual return</b> — unlocks with any Premium plan.</>} />
        </div>
      )}
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} highlight="return_schedules" />}
    </div>
  )
}

function monthSum(state: { transactions: { date: string; type: string; vat: string; amount: number }[] }, ym: string, type: string) {
  return Math.round(state.transactions.filter((t) => t.date.startsWith(ym) && t.vat === 'standard' && t.type === type).reduce((s, t) => s + t.amount, 0) * 100) / 100
}

function IdLine({ k, v, warn }: { k: string; v: string; warn?: boolean }) {
  return (
    <div className="card" style={{ padding: '11px 14px', background: warn ? 'var(--red-bg)' : '#fbfaf7' }}>
      <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, color: warn ? 'var(--red)' : 'var(--ink-3)' }}>{k}</div>
      <div style={{ fontWeight: 700, marginTop: 2 }}>{v}</div>
    </div>
  )
}
