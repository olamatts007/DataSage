import React, { useRef, useState } from 'react'
import { useStore, useEntitlements } from '../state/store'
import { PLANS, TRIAL_DAYS, FEATURE_LABELS, PREMIUM_FEATURE_LIST, FREE_LIMITS } from '../lib/billing'
import { naira, fmtDate } from '../lib/format'
import { PageHead, Notice, Icon, Stat } from '../components/ui'
import { UpgradeModal } from '../components/paywall'
import { download } from '../lib/csv'

export default function Billing() {
  const { state, dispatch } = useStore()
  const ent = useEntitlements()
  const [open, setOpen] = useState(false)
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [confirmDowngrade, setConfirmDowngrade] = useState(false)
  const [restoreError, setRestoreError] = useState('')
  const [restored, setRestored] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const sub = state.subscription
  const plan = sub.period ? PLANS.premium(sub.period) : null
  const txCount = state.transactions.length
  const empCount = state.employees.length

  const exportBackup = () => {
    download(
      `taxsage-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify({ app: 'taxsage', version: 2, exportedAt: new Date().toISOString(), data: state }, null, 2),
      'application/json'
    )
  }

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setRestoreError('')
    setRestored(false)
    if (!f) return
    f.text()
      .then((text) => {
        const parsed = JSON.parse(text)
        const data = parsed?.data ?? parsed
        if (!data?.profile || !Array.isArray(data?.transactions)) throw new Error('Not a TaxSage backup file')
        dispatch({
          type: 'load',
          state: {
            ...state,
            ...data,
            subscription: state.subscription, // subscription is device-local
            payments: state.payments,
          },
        })
        setRestored(true)
      })
      .catch((err) => setRestoreError(err instanceof Error ? err.message : 'Could not read file'))
    e.target.value = ''
  }

  return (
    <div>
      <PageHead
        title="Subscription & Billing"
        sub="Manage your plan, keep receipts, and back up your tax workspace. Sandbox mode — payments are simulated locally."
        right={!ent.isPremiumActive && <button className="btn btn-gold" onClick={() => setOpen(true)}>★ Upgrade to Premium</button>}
      />

      {ent.status === 'expired' && (
        <div className="mb16">
          <Notice tone="red" title="Your Premium access has expired">
            Your records are untouched. Renew any plan below to restore exports, return schedules and unlimited limits.
            <div className="mt8"><button className="btn btn-danger btn-sm" onClick={() => setOpen(true)}>Renew now</button></div>
          </Notice>
        </div>
      )}

      <div className="grid g3 mb16">
        <Stat
          tone={ent.isPremiumActive ? 'gold' : 'accent'}
          k="Current plan"
          v={ent.trialActive ? `Trial · ${ent.daysLeft}d left` : ent.isPremiumActive ? `Premium · ${sub.period}` : 'SME Starter (Free)'}
          s={
            ent.trialActive ? `ends ${fmtDate(sub.trialEnd.slice(0, 10))}`
            : ent.isPremiumActive ? `renews ${fmtDate(sub.currentPeriodEnd.slice(0, 10))}${sub.cancelledAt ? ' · auto-renew off' : ''}`
            : 'free forever · upgrade anytime'
          }
        />
        <Stat
          k="Ledger usage"
          v={isFinite(ent.limits.records) ? `${txCount} / ${ent.limits.records}` : `${txCount} ∞`}
          s={ent.isPremiumActive ? 'unlimited records' : `${Math.max(0, FREE_LIMITS.records - txCount)} free records left`}
        />
        <Stat
          k="Payroll usage"
          v={isFinite(ent.limits.employees) ? `${empCount} / ${ent.limits.employees}` : `${empCount} ∞`}
          s={ent.isPremiumActive ? 'unlimited employees' : `${Math.max(0, FREE_LIMITS.employees - empCount)} free employee slots left`}
        />
      </div>

      <div className="grid" style={{ gridTemplateColumns: '1.4fr 1fr' }}>
        <div className="grid" style={{ alignContent: 'start' }}>
          {/* current subscription details */}
          <div className="card card-pad">
            <div className="flex-between mb8">
              <div>
                <h3 className="card-title">Plan</h3>
                <p className="card-sub">{plan ? `${naira(plan.price)} every ${sub.period === 'monthly' ? 'month' : sub.period} · ${plan.perMonthNote}` : 'You are on the free plan.'}</p>
              </div>
              <span className={`chip ${ent.isPremiumActive ? 'dark' : ''}`}>{ent.trialActive ? '★ TRIAL' : ent.isPremiumActive ? '★ PREMIUM' : 'FREE'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {PREMIUM_FEATURE_LIST.slice(0, 6).map((f) => (
                <div key={f.key} className="row">
                  <span style={{ color: ent.isPremiumActive ? 'var(--green-600)' : 'var(--ink-3)' }}>
                    <Icon name={ent.isPremiumActive ? 'check' : 'alert'} size={14} />
                  </span>
                  <span className="small" style={{ fontWeight: 600 }}>{FEATURE_LABELS[f.key]}</span>
                  <span className="chip" style={{ marginLeft: 'auto', fontSize: 10 }}>{f.blurb}</span>
                </div>
              ))}
            </div>

            <div className="row mt16 no-print wrap">
              {!ent.isPremiumActive && (
                <button className="btn btn-gold" onClick={() => setOpen(true)}>★ Upgrade — from ₦5,500/mo</button>
              )}
              {ent.isPremiumActive && !sub.cancelledAt && sub.status === 'active' && (
                <button className="btn btn-ghost" onClick={() => setConfirmCancel(true)}>Turn off auto-renew</button>
              )}
              {ent.isPremiumActive && sub.cancelledAt && (
                <>
                  <Notice tone="amber">Auto-renew is off — access continues until {fmtDate(sub.currentPeriodEnd.slice(0, 10))}.</Notice>
                  <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'resumeSubscription' })}>Resume auto-renew</button>
                </>
              )}
              {ent.isPremiumActive && (
                <button className="btn btn-ghost btn-sm" onClick={() => setOpen(true)}>Change billing period</button>
              )}
            </div>

            {confirmCancel && (
              <div className="notice red mt8 no-print">
                <Icon name="alert" size={15} />
                <div className="grow">Stop auto-renew? You keep Premium until <b>{fmtDate(sub.currentPeriodEnd.slice(0, 10))}</b>, then drop to the free plan (records stay safe; limits and exports lock again).</div>
                <button className="btn btn-danger btn-sm" onClick={() => { dispatch({ type: 'cancelSubscription' }); setConfirmCancel(false) }}>Confirm</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmCancel(false)}>Keep</button>
              </div>
            )}
          </div>

          {/* payment history */}
          <div className="card card-pad">
            <h3 className="card-title">Receipts & payment history</h3>
            <p className="card-sub">Sandbox receipts — useful records for your own bookkeeping.</p>
            {state.payments.length === 0 ? (
              <div className="small dim">No payments yet. Start a {TRIAL_DAYS}-day trial or pick a plan.</div>
            ) : (
              <table className="tbl">
                <thead><tr><th>Date</th><th>Reference</th><th>Description</th><th>Method</th><th className="num">Amount</th></tr></thead>
                <tbody>
                  {[...state.payments].reverse().map((p) => (
                    <tr key={p.id}>
                      <td className="mono">{fmtDate(p.date.slice(0, 10))}</td>
                      <td className="mono small dim">{p.reference}</td>
                      <td className="small">{p.kind === 'trial' ? 'Premium trial' : `Premium · ${p.period}`} — {p.note}</td>
                      <td><span className="chip">{p.method}</span></td>
                      <td className="num" style={{ fontWeight: 650 }}>{p.amount ? naira(p.amount) : 'FREE'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="grid" style={{ alignContent: 'start' }}>
          {/* backup & restore */}
          <div className="card card-pad">
            <h3 className="card-title">Workspace backup & restore</h3>
            <p className="card-sub">Your data lives in this browser. Export a full JSON backup before clearing browser storage.</p>
            <div className="row wrap no-print">
              <button className="btn btn-primary btn-sm" onClick={exportBackup}><Icon name="download" size={13} /> Export backup (.json)</button>
              <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}><Icon name="upload" size={13} /> Restore backup</button>
              <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={importBackup} />
            </div>
            {restoreError && <div className="mt8"><Notice tone="red">{restoreError}</Notice></div>}
            {restored && <div className="mt8"><Notice tone="green">Backup restored — your records, profile and payroll are back.</Notice></div>}
            {!ent.isPremiumActive && <div className="mt8"><Notice tone="blue">Backup & restore rides free in this build so you never lose records.</Notice></div>}
          </div>

          {/* storage usage */}
          <div className="card card-pad">
            <h3 className="card-title">Workspace footprint</h3>
            <div className="small" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="flex-between"><span className="dim">Business</span><b>{state.profile.name || '—'}</b></div>
              <div className="flex-between"><span className="dim">Transactions</span><b className="mono">{txCount}</b></div>
              <div className="flex-between"><span className="dim">Employees</span><b className="mono">{empCount}</b></div>
              <div className="flex-between"><span className="dim">Filings logged</span><b className="mono">{state.filings.length}</b></div>
              <div className="flex-between"><span className="dim">Storage used</span><b className="mono">{Math.round((JSON.stringify(state).length / 1024) * 10) / 10} KB</b></div>
              <div className="flex-between"><span className="dim">Accounting year</span><b className="mono">{state.year}</b></div>
            </div>
          </div>

          {/* danger zone */}
          <div className="card card-pad no-print" style={{ borderColor: '#f1c9c9' }}>
            <h3 className="card-title" style={{ color: 'var(--red)' }}>Danger zone</h3>
            <p className="card-sub">Remove Premium and return to the free plan immediately, or wipe business data.</p>
            {ent.isPremiumActive && !confirmDowngrade && (
              <button className="btn btn-danger btn-sm" onClick={() => setConfirmDowngrade(true)}>Downgrade to free now</button>
            )}
            {confirmDowngrade && (
              <div className="row wrap">
                <button className="btn btn-danger btn-sm" onClick={() => { dispatch({ type: 'downgradeFree' }); setConfirmDowngrade(false) }}>Confirm downgrade</button>
                <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDowngrade(false)}>Cancel</button>
              </div>
            )}
            {ent.isPremiumActive && <div className="hint mt8">Downgrading locks exports/schedules instantly but never deletes records.</div>}
          </div>
        </div>
      </div>

      {open && <UpgradeModal onClose={() => setOpen(false)} />}
    </div>
  )
}
