import React, { useEffect, useState } from 'react'
import { useStore } from '../state/store'
import { checkCode, normalizeCode, REASON_TEXT, writeAccessSession, GRANT_LABELS } from '../lib/access'
import { Icon } from './ui'

// ── brute-force throttle (session-scoped): 5 bad tries → 30s, 10+ → 5min ────
const THROTTLE_KEY = 'taxsage.gate.throttle'
type Throttle = { fails: number; until: number }
const readThrottle = (): Throttle => {
  try {
    const t = JSON.parse(sessionStorage.getItem(THROTTLE_KEY) || 'null') as Throttle | null
    return t && typeof t.fails === 'number' ? t : { fails: 0, until: 0 }
  } catch { return { fails: 0, until: 0 } }
}
const writeThrottle = (t: Throttle) => sessionStorage.setItem(THROTTLE_KEY, JSON.stringify(t))
const clearThrottle = () => sessionStorage.removeItem(THROTTLE_KEY)
const cooldownFor = (fails: number) => (fails >= 10 ? 300_000 : 30_000)

/** Full-screen gate shown until the visitor activates a valid access code. */
export default function AccessGate({ onGranted }: { onGranted: () => void }) {
  const { state, dispatch } = useStore()
  const [input, setInput] = useState('')
  const [error, setError] = useState('')
  const [granted, setGranted] = useState<string | null>(null)
  const [lockedUntil, setLockedUntil] = useState<number>(() => readThrottle().until)
  const [, setTick] = useState(0)

  const locked = lockedUntil > Date.now()

  // live countdown while in cool-down
  useEffect(() => {
    if (!locked) return
    const id = setInterval(() => {
      setTick((n) => n + 1)
      if (lockedUntil <= Date.now()) setLockedUntil(readThrottle().until)
    }, 1000)
    return () => clearInterval(id)
  }, [locked, lockedUntil])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (readThrottle().until > Date.now()) return // still cooling down
    const res = checkCode(state.accessCodes, input)
    if (!res.ok) {
      const t = readThrottle()
      const fails = t.fails + 1
      let until = 0
      if (fails % 5 === 0) until = Date.now() + cooldownFor(fails)
      writeThrottle({ fails, until })
      setLockedUntil(until)
      setError(
        until
          ? `Too many attempts. Locked for ${Math.round((until - Date.now()) / 1000)}s — double-check the code and retry.`
          : REASON_TEXT[res.reason]
      )
      return
    }
    clearThrottle()
    // record activation + bestow the attached grant (trial or premium period)
    dispatch({ type: 'activateAccessCode', id: res.code.id })
    writeAccessSession({ code: res.code.code, grantedAt: new Date().toISOString(), grant: res.code.grant })
    setError('')
    setGranted(GRANT_LABELS[res.code.grant])
    setTimeout(onGranted, 1200)
  }

  return (
    <div className="gate-screen">
      <div className="gate-brand">
        <span className="logo">₦</span>
        <span>TaxSage</span>
      </div>

      <div className="gate-card card">
        <div className="row mb8" style={{ justifyContent: 'center', gap: 8 }}>
          <span className="lock-chip"><Icon name="lock" size={11} /> CONTROLLED TEST RUN</span>
        </div>

        <div className="mb8 center" style={{ fontFamily: 'var(--display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
          Enter your access code
        </div>
        <p className="small dim center mb16" style={{ maxWidth: 384, margin: '0 auto', lineHeight: 1.6 }}>
          This build is shared under an administrator-controlled test run. Whoever sent you the
          link also generated a code in the format <span className="mono">TXS-XXXX-XXXX</span>.
        </p>

        {granted ? (
          <div className="notice green center" style={{ justifyContent: 'center' }}>
            <Icon name="check" size={16} />
            <div><b>Access granted — {granted}.</b> Opening your workspace…</div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <input
              className="inp mono gate-input"
              placeholder="TXS-XXXX-XXXX"
              value={input}
              onChange={(e) => { setInput(normalizeCode(e.target.value)); setError(locked ? error : '') }}
              autoFocus
              aria-label="Access code"
              autoComplete="off"
              spellCheck={false}
              disabled={locked}
            />
            {error && <div className="notice red mt8"><Icon name="alert" size={15} /><div>{error}</div></div>}
            <button className="btn btn-gold mt16" style={{ width: '100%', fontSize: 14, padding: '11px 14px' }} type="submit" disabled={input.length < 14 || locked}>
              {locked
                ? <>Locked · retry in {Math.ceil((lockedUntil - Date.now()) / 1000)}s</>
                : <>Unlock prototype <Icon name="arrow" size={15} /></>}
            </button>
          </form>
        )}

        <div className="hint center mt16" style={{ lineHeight: 1.55 }}>
          No code yet? Request one from your TaxSage administrator — each code carries an expiry and
          activation limit, and grants trial or Premium access automatically.
        </div>

        <div className="center mt16">
          <a href="#/admin" className="small dim" style={{ textDecoration: 'underline' }}>Access control console →</a>
        </div>
      </div>

      <div className="gate-foot hint">
        <span className="small">Nigeria Tax Act 2025</span><span className="dot" />
        <span className="small">Tax Administration Act 2025</span><span className="dot" />
        <span className="small">Effective 1 Jan 2026</span>
      </div>
    </div>
  )
}
