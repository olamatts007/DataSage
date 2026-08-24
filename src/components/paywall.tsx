import React, { useEffect, useState } from 'react'
import { useStore, useEntitlements } from '../state/store'
import {
  FEATURE_LABELS, FeatureKey, FREE_FEATURE_LIST, PLANS, PREMIUM_FEATURE_LIST,
  Period, TRIAL_DAYS, luhnValid, paymentRef,
} from '../lib/billing'
import { naira } from '../lib/format'
import { Icon } from './ui'

// ── plan badge (topbar) ───────────────────────────────────────────────────────

export function PlanBadge() {
  const ent = useEntitlements()
  if (ent.trialActive)
    return <span className="chip gold">★ TRIAL · {ent.daysLeft}d left</span>
  if (ent.isPremiumActive)
    return <span className="chip dark">★ PREMIUM · {ent.period}</span>
  if (ent.status === 'expired')
    return <span className="chip red">plan expired</span>
  return <span className="chip">FREE PLAN</span>
}

// ── upgrade modal: pricing → sandbox checkout → success ───────────────────────

type Step = 'pricing' | 'checkout' | 'processing' | 'success'
type Method = 'card' | 'transfer' | 'ussd'

export function UpgradeModal({ onClose, defaultPeriod = 'yearly', highlight }: { onClose: () => void; defaultPeriod?: Period; highlight?: FeatureKey }) {
  const { state, dispatch } = useStore()
  const [step, setStep] = useState<Step>('pricing')
  const [period, setPeriod] = useState<Period>(defaultPeriod)
  const [method, setMethod] = useState<Method>('card')
  const [card, setCard] = useState({ num: '', name: '', exp: '', cvv: '' })
  const [err, setErr] = useState('')
  const [copied, setCopied] = useState(false)
  const [receipt, setReceipt] = useState('')

  const plan = PLANS.premium(period)
  const trialAvailable = !state.subscription.trialUsed

  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && step !== 'processing' && onClose()
    window.addEventListener('keydown', esc)
    return () => window.removeEventListener('keydown', esc)
  }, [onClose, step])

  const fmtCard = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
  const fmtExp = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 4)
    return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d
  }

  const pay = () => {
    if (method === 'card') {
      if (!luhnValid(card.num)) return setErr('Enter a valid card number (try the sandbox card 4242 4242 4242 4242).')
      if (!card.name.trim()) return setErr('Cardholder name is required.')
      const mm = Number((card.exp.split('/')[0] || '0').trim()) || 0
      if (mm < 1 || mm > 12 || card.exp.length < 5) return setErr('Enter the card expiry as MM/YY.')
      if (!/^\d{3}$/.test(card.cvv)) return setErr('Enter the 3-digit CVV.')
    }
    setErr('')
    setStep('processing')
    setTimeout(() => {
      const ref = paymentRef()
      setReceipt(ref)
      dispatch({
        type: 'subscribe',
        period,
        method,
        note: `${plan.perMonthNote} — ${method === 'card' ? `card •••• ${card.num.replace(/\s/g, '').slice(-4)}` : method === 'transfer' ? 'bank transfer' : 'USSD'}`,
      })
      setStep('success')
    }, 1600)
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && step !== 'processing' && onClose()} role="dialog" aria-modal="true" aria-label="Upgrade to Premium">
      <div className="modal">
        {step === 'pricing' && (
          <>
            <div className="flex-between mb16">
              <div>
                <h3 className="card-title" style={{ fontSize: 19 }}>Upgrade to TaxSage Premium</h3>
                <p className="card-sub" style={{ marginBottom: 0 }}>
                  {highlight ? <>Unlock <b>{FEATURE_LABELS[highlight]}</b> and everything else.</> : 'Everything an MSME needs to file with confidence under the NTA 2025.'}
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close">✕</button>
            </div>

            <div className="period-toggle" role="tablist" aria-label="Billing period">
              {(['monthly', 'quarterly', 'yearly'] as Period[]).map((p) => (
                <button key={p} role="tab" aria-selected={period === p} className={period === p ? 'on' : ''} onClick={() => setPeriod(p)}>
                  {p === 'monthly' ? 'Monthly' : p === 'quarterly' ? 'Quarterly' : 'Annual'}
                  {PLANS.premium(p).saveBadge && <span className="save">{PLANS.premium(p).saveBadge}</span>}
                </button>
              ))}
            </div>

            <div className="pricing-grid">
              <div className="plan-card">
                <div className="plan-name">SME Starter</div>
                <div className="plan-price">₦0 <span>/ forever</span></div>
                <div className="small dim mb8">For getting started & staying classified</div>
                <ul className="feat-list">
                  {FREE_FEATURE_LIST.map((f) => <li key={f}><Icon name="check" size={13} /> {f}</li>)}
                </ul>
                <button className="btn btn-ghost" style={{ width: '100%' }} disabled>Your current free plan</button>
              </div>
              <div className="plan-card premium">
                <div className="plan-ribbon">Most chosen by MSMEs</div>
                <div className="plan-name">Premium ★</div>
                <div className="plan-price">{naira(plan.price)} <span>/ {period === 'monthly' ? 'month' : period}</span></div>
                <div className="small mb8" style={{ color: '#c9e6d6' }}>{plan.perMonthNote}{plan.saveBadge && <> · <b style={{ color: '#f4d57b' }}>{plan.saveBadge} vs monthly</b></>}</div>
                <ul className="feat-list">
                  <li style={{ fontWeight: 700 }}>Everything in Starter, plus:</li>
                  {PREMIUM_FEATURE_LIST.map((f) => (
                    <li key={f.key} className={highlight === f.key ? 'hl' : ''}><Icon name="check" size={13} /> {FEATURE_LABELS[f.key]}
                      {highlight === f.key && <span className="chip gold" style={{ marginLeft: 6, fontSize: 9.5 }}>this one</span>}
                    </li>
                  ))}
                </ul>
                {trialAvailable ? (
                  <>
                    <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => { dispatch({ type: 'startTrial' }); onClose() }}>
                      Start {TRIAL_DAYS}-day free trial
                    </button>
                    <button className="btn btn-ghost" style={{ width: '100%', marginTop: 8, borderColor: 'rgba(255,255,255,.25)', color: '#dcefe5' }} onClick={() => setStep('checkout')}>
                      Subscribe now — {naira(plan.price)}
                    </button>
                    <div className="hint center" style={{ color: '#9fc4b2', marginTop: 7 }}>No card needed for the trial · cancel anytime</div>
                  </>
                ) : (
                  <button className="btn btn-gold" style={{ width: '100%' }} onClick={() => setStep('checkout')}>
                    Continue to payment — {naira(plan.price)}
                  </button>
                )}
              </div>
            </div>
            <div className="hint center mt8">Sandbox mode — payments are simulated locally, no real charge is made. Prices incl. VAT.</div>
          </>
        )}

        {step === 'checkout' && (
          <>
            <div className="flex-between mb16">
              <div>
                <h3 className="card-title" style={{ fontSize: 19 }}>Checkout — Premium ({period})</h3>
                <p className="card-sub" style={{ marginBottom: 0 }}>{naira(plan.price)} · {plan.perMonthNote}</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setStep('pricing')}>← Plans</button>
            </div>
            <div className="notice blue mb16"><span style={{ marginTop: 1 }}><Icon name="info" size={15} /></span><div><b>Sandbox checkout.</b> No real money moves. Use test card <span className="mono">4242 4242 4242 4242</span>, any expiry/CVV.</div></div>

            <div className="pay-methods" role="tablist" aria-label="Payment method">
              {([['card', '💳 Card'], ['transfer', '🏦 Bank transfer'], ['ussd', '📱 USSD']] as [Method, string][]).map(([m, label]) => (
                <button key={m} role="tab" aria-selected={method === m} className={method === m ? 'on' : ''} onClick={() => { setMethod(m); setErr('') }}>{label}</button>
              ))}
            </div>

            {method === 'card' && (
              <div className="frow g2">
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="lab">Card number</label>
                  <input className="inp mono" inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.num} onChange={(e) => setCard({ ...card, num: fmtCard(e.target.value) })} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label className="lab">Cardholder name</label>
                  <input className="inp" placeholder="Name on card" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
                </div>
                <div>
                  <label className="lab">Expiry (MM/YY)</label>
                  <input className="inp mono" placeholder="08/28" value={card.exp} onChange={(e) => setCard({ ...card, exp: fmtExp(e.target.value) })} />
                </div>
                <div>
                  <label className="lab">CVV</label>
                  <input className="inp mono" inputMode="numeric" placeholder="123" value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
                </div>
              </div>
            )}

            {method === 'transfer' && (
              <div className="bank-box">
                <div className="small dim" style={{ marginBottom: 6 }}>Transfer <b>{naira(plan.price)}</b> to the dedicated account below (reserved for your session):</div>
                {[
                  ['Bank', 'Providus Bank (sandbox)'],
                  ['Account number', '9612 0000 42'],
                  ['Account name', 'TaxSage Technologies / ' + (state.profile.name || 'MSME')],
                  ['Amount', naira(plan.price)],
                ].map(([k, v]) => (
                  <div key={k} className="flex-between" style={{ padding: '7px 0', borderBottom: '1px dashed #e8e6de' }}>
                    <span className="small dim">{k}</span>
                    <span className="mono" style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <button className="btn btn-ghost btn-sm mt8" onClick={() => { navigator.clipboard?.writeText('9612000042').catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
                  <Icon name="download" size={13} /> {copied ? 'Copied!' : 'Copy account number'}
                </button>
              </div>
            )}

            {method === 'ussd' && (
              <div className="bank-box center">
                <div className="small dim">Dial this code on the phone number linked to your bank:</div>
                <div className="mono" style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, margin: '12px 0' }}>*737*000*{String(plan.price)}#</div>
                <div className="hint">Works with GTBank, Zenith, Access, UBA and other NIBSS-connected banks (sandbox simulation).</div>
              </div>
            )}

            {err && <div className="notice red mt8"><Icon name="alert" size={15} /> <div>{err}</div></div>}

            <div className="flex-between mt16">
              <span className="small dim">Secured checkout · replaces nothing until paid</span>
              <button className="btn btn-gold" onClick={pay}>
                {method === 'transfer' ? `I've sent ${naira(plan.price)}` : method === 'ussd' ? 'I\'ve dialled the code' : `Pay ${naira(plan.price)}`} <Icon name="arrow" size={14} />
              </button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <div className="center" style={{ padding: '40px 0' }}>
            <div className="spinner" role="status" aria-label="Processing payment" />
            <div style={{ fontWeight: 700, marginTop: 14 }}>Contacting payment gateway…</div>
            <div className="hint">Verifying {method === 'card' ? 'card' : method} with the bank (sandbox)</div>
          </div>
        )}

        {step === 'success' && (
          <div className="center" style={{ padding: '20px 0 10px' }}>
            <div className="success-ring"><Icon name="check" size={30} /></div>
            <h3 className="card-title" style={{ fontSize: 20, marginTop: 12 }}>You're on Premium 🎉</h3>
            <p className="card-sub" style={{ maxWidth: 380, margin: '6px auto 14px' }}>
              Payment confirmed. All premium features are unlocked immediately — exports, return schedules,
              unlimited records & payroll, and the reform comparison engine.
            </p>
            <div className="bank-box" style={{ textAlign: 'left' }}>
              {[
                ['Receipt reference', receipt],
                ['Plan', `Premium · ${period}`],
                ['Amount', naira(plan.price)],
                ['Next renewal', new Date(Date.now() + 30e9).toString() === 'Invalid Date' ? '' : ''],
              ].filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="flex-between" style={{ padding: '6px 0' }}>
                  <span className="small dim">{k}</span><span className="mono" style={{ fontWeight: 700 }}>{v}</span>
                </div>
              ))}
            </div>
            <button className="btn btn-primary mt16" style={{ width: '100%' }} onClick={onClose}>Start using Premium →</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── feature gate: wraps premium functionality ─────────────────────────────────

export function FeatureGate({
  feature, children, label, compact,
}: { feature: FeatureKey; children: React.ReactNode; label?: string; compact?: boolean }) {
  const ent = useEntitlements()
  const [open, setOpen] = useState(false)
  if (ent.can(feature)) return <>{children}</>
  return (
    <div className={`gate ${compact ? 'gate-compact' : ''}`}>
      <div className="gate-blur" aria-hidden>{children}</div>
      <div className="gate-cover">
        <span className="lock-chip"><Icon name="naira" size={13} /> PREMIUM</span>
        <div style={{ fontWeight: 700, marginTop: 8 }}>{label ?? FEATURE_LABELS[feature]}</div>
        {!compact && <div className="hint" style={{ maxWidth: 320 }}>Upgrade once — unlock every report, export and limit in the app. From ₦5,500/month billed annually.</div>}
        <button className="btn btn-gold btn-sm" style={{ marginTop: 10 }} onClick={() => setOpen(true)}>
          Unlock with Premium <Icon name="arrow" size={13} />
        </button>
      </div>
      {open && <UpgradeModal onClose={() => setOpen(false)} highlight={feature} />}
    </div>
  )
}

// ── soft gate: inline upsell banner (content still visible) ───────────────────

export function PremiumBanner({ feature, message }: { feature: FeatureKey; message?: React.ReactNode }) {
  const ent = useEntitlements()
  const [open, setOpen] = useState(false)
  if (ent.can(feature)) return null
  return (
    <div className="notice gold-inline no-print">
      <span style={{ marginTop: 1 }}><Icon name="naira" size={15} /></span>
      <div className="grow">
        {message ?? <><b>{FEATURE_LABELS[feature]}</b> is a Premium feature.</>}
      </div>
      <button className="btn btn-gold btn-sm" onClick={() => setOpen(true)}>Upgrade</button>
      {open && <UpgradeModal onClose={() => setOpen(false)} highlight={feature} />}
    </div>
  )
}

// ── limit gate: usage vs free limit (records / employees) ─────────────────────

export function LimitMeter({ used, limit, noun }: { used: number; limit: number; noun: string }) {
  const ent = useEntitlements()
  const [open, setOpen] = useState(false)
  if (!isFinite(limit)) return null
  const pct = Math.min(100, (used / limit) * 100)
  const full = used >= limit
  return (
    <div className="limit-meter no-print">
      <div className="row" style={{ justifyContent: 'space-between', flex: 1 }}>
        <span className="small" style={{ fontWeight: 600 }}>{used} of {limit} free {noun} used</span>
        <button className="btn btn-sm" style={{ padding: '2px 10px', fontSize: 11, background: full ? 'var(--gold-500)' : 'transparent', border: '1px solid var(--line)' }} onClick={() => setOpen(true)}>
          {full ? '★ Go unlimited' : 'Upgrade for unlimited'}
        </button>
      </div>
      <div className="meter" style={{ flex: '0 0 90px' }}><div style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--red)' : pct > 80 ? 'var(--gold-500)' : 'var(--green-600)' }} /></div>
      {open && <UpgradeModal onClose={() => setOpen(false)} />}
      {!ent.trialActive && null}
    </div>
  )
}

// ── trial upsell for free users on the Overview ───────────────────────────────

export function TrialCta() {
  const { state } = useStore()
  const ent = useEntitlements()
  const [open, setOpen] = useState(false)
  if (ent.isPremiumActive || state.subscription.trialUsed) return null
  return (
    <div className="trial-cta no-print">
      <div>
        <div style={{ fontWeight: 800, fontSize: 14.5 }}>★ Try Premium free for {TRIAL_DAYS} days</div>
        <div className="small" style={{ color: '#cfe7db' }}>Unlock return schedules, exports, unlimited records & payroll — no card required.</div>
      </div>
      <button className="btn btn-gold" onClick={() => setOpen(true)}>See plans</button>
      {open && <UpgradeModal onClose={() => setOpen(false)} />}
    </div>
  )
}
